const mongoose = require('mongoose');
const { Order, Product, Cart, Address, Payment, User } = require('../../models');
const config = require('../../config/env');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');
const { generateOrderNumber } = require('../../utils/generateToken');
const razorpayService = require('../../integrations/razorpay/razorpay.service');
const couponService = require('../coupons/coupon.service');
const settingsService = require('../settings/settings.service');
const { parsePagination, buildMeta } = require('../../utils/pagination');
const { sendOrderConfirmation, sendAdminAlert } = require('../../utils/email');

/**
 * Resolve shipping address from addressId or inline object.
 * @param {string} userId
 * @param {string} [addressId]
 * @param {object} [shippingAddress]
 * @returns {Promise<object>}
 */
async function resolveAddress(userId, addressId, shippingAddress) {
  if (addressId) {
    if (!mongoose.isValidObjectId(addressId)) {
      throw ApiError.badRequest('Invalid address ID');
    }
    const addr = await Address.findOne({ _id: addressId, user: userId }).lean();
    if (!addr) {
      throw ApiError.notFound('Address not found');
    }
    return {
      fullName: addr.fullName,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 || '',
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    };
  }

  if (shippingAddress) {
    return shippingAddress;
  }

  throw ApiError.badRequest('Shipping address is required');
}

/**
 * Resolve items: from body (buy-now) or from the server-side cart.
 * @param {string} userId
 * @param {Array} [bodyItems]
 * @returns {Promise<Array<{productId: string, quantity: number}>>}
 */
async function resolveItems(userId, bodyItems) {
  if (bodyItems && bodyItems.length > 0) {
    return bodyItems;
  }

  // Load from cart
  const cart = await Cart.findOne({ user: userId });
  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest('Cart is empty');
  }

  return cart.items.map((item) => ({
    productId: item.product.toString(),
    quantity: item.quantity,
  }));
}

/**
 * Price a set of items on the server: current prices, stock checks, coupon,
 * GST and delivery. Shared by the checkout quote and by order creation so
 * the customer is always shown exactly what will be charged.
 *
 * @param {string} userId
 * @param {Array<{productId: string, quantity: number}>} rawItems
 * @param {string} [couponCode]
 * @returns {Promise<object>}
 */
async function priceItems(userId, rawItems, couponCode) {
  const settings = await settingsService.getSettings();

  // Merge duplicate lines so the stock check sees the full quantity
  const quantities = new Map();
  const itemErrors = [];
  for (const raw of rawItems) {
    if (!mongoose.isValidObjectId(raw.productId)) {
      itemErrors.push({ productId: raw.productId, message: 'Invalid product ID' });
      continue;
    }
    quantities.set(raw.productId, (quantities.get(raw.productId) || 0) + raw.quantity);
  }

  const products = await Product.find({ _id: { $in: [...quantities.keys()] } });
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  const orderItems = [];
  const lines = [];

  for (const [productId, quantity] of quantities) {
    const product = byId.get(productId);
    if (!product) {
      itemErrors.push({ productId, message: 'Product not found' });
      continue;
    }
    if (!product.isActive) {
      itemErrors.push({ productId, message: `"${product.name}" is no longer available` });
      continue;
    }
    if (product.stock === 0) {
      itemErrors.push({ productId, message: `"${product.name}" is out of stock` });
      continue;
    }
    if (quantity > product.stock) {
      itemErrors.push({
        productId,
        message: `"${product.name}" only has ${product.stock} in stock`,
      });
      continue;
    }

    // Snapshot: use server-side prices, never client-provided
    orderItems.push({
      product: product._id,
      name: product.name,
      model: product.model || '',
      slug: product.slug,
      image: product.images.length > 0 ? product.images[0].url : '',
      sku: product.sku || '',
      price: product.price,
      mrp: product.mrp,
      quantity,
    });
    lines.push({ price: product.price, quantity, category: product.category });
  }

  const itemsTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Coupon
  let discount = 0;
  let coupon = null;
  let couponError = '';
  if (couponCode && orderItems.length > 0) {
    try {
      ({ discount, coupon } = await couponService.evaluateCoupon(couponCode, lines, userId));
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
      couponError = err.message;
    }
  }

  const taxable = itemsTotal - discount;
  const taxAmount = settings.gstInclusive ? 0 : Math.round((taxable * settings.gstPercent) / 100);
  const deliveryCharge =
    orderItems.length === 0 || taxable >= settings.freeDeliveryAbove ? 0 : settings.deliveryCharge;
  const totalAmount = taxable + taxAmount + deliveryCharge;

  return {
    orderItems,
    categories: lines.map((l) => l.category),
    itemErrors,
    itemsTotal,
    discount,
    coupon,
    couponError,
    taxAmount,
    gstPercent: settings.gstPercent,
    gstInclusive: settings.gstInclusive,
    deliveryCharge,
    freeDeliveryAbove: settings.freeDeliveryAbove,
    totalAmount,
    settings,
  };
}

/**
 * Quote: what the order would cost right now, without creating it.
 */
async function quote(userId, body) {
  const rawItems = await resolveItems(userId, body.items);
  const priced = await priceItems(userId, rawItems, body.couponCode);

  return {
    items: priced.orderItems,
    itemErrors: priced.itemErrors,
    itemsTotal: priced.itemsTotal,
    discount: priced.discount,
    couponCode: priced.coupon ? priced.coupon.code : '',
    couponError: priced.couponError,
    taxAmount: priced.taxAmount,
    gstPercent: priced.gstPercent,
    gstInclusive: priced.gstInclusive,
    deliveryCharge: priced.deliveryCharge,
    freeDeliveryAbove: priced.freeDeliveryAbove,
    totalAmount: priced.totalAmount,
    paymentMethods: {
      cod: priced.settings.enableCod,
      razorpay: config.razorpay.enabled,
    },
  };
}

/**
 * Take the order's items out of stock, all or nothing.
 * @returns {Promise<string|null>} name of the item that ran short, or null
 */
async function deductStock(order) {
  const done = [];
  for (const item of order.items) {
    const result = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity, soldCount: item.quantity } },
      { new: true }
    );
    if (!result) {
      for (const prev of done) {
        await Product.findByIdAndUpdate(prev.product, {
          $inc: { stock: prev.quantity, soldCount: -prev.quantity },
        });
      }
      return item.name;
    }
    done.push(item);
  }
  order.stockDeducted = true;
  return null;
}

/**
 * Put an order's items back in stock (cancellation). Only does anything if
 * the stock was actually taken out for this order.
 */
async function restoreStock(order) {
  if (!order.stockDeducted) return;
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, soldCount: -item.quantity },
    });
  }
  // soldCount can never go below zero
  await Product.updateMany(
    { _id: { $in: order.items.map((i) => i.product) }, soldCount: { $lt: 0 } },
    { soldCount: 0 }
  );
  order.stockDeducted = false;
}

/**
 * Remove the ordered products from the customer's cart.
 */
async function removeOrderedFromCart(order) {
  await Cart.updateOne(
    { user: order.user },
    { $pull: { items: { product: { $in: order.items.map((i) => i.product) } } } }
  );
}

/**
 * Checkout: create an order with server-side price computation.
 *
 * @param {string} userId
 * @param {object} body - Checkout request body
 * @returns {Promise<object>}
 */
async function checkout(userId, body) {
  const { addressId, shippingAddress: inlineAddress, couponCode, paymentMethod, items: bodyItems, notes } = body;

  // 1. Resolve address
  const shippingAddress = await resolveAddress(userId, addressId, inlineAddress);

  // 2. Resolve items
  const rawItems = await resolveItems(userId, bodyItems);

  // 3. Price everything on the server
  const priced = await priceItems(userId, rawItems, couponCode);

  // 4. Check the payment method is available
  if (paymentMethod === 'cod' && !priced.settings.enableCod) {
    throw ApiError.badRequest('Cash on Delivery is not available');
  }
  if (paymentMethod === 'razorpay' && !config.razorpay.enabled) {
    throw ApiError.badRequest('Online payment is not available right now. Please choose another payment method.');
  }

  if (priced.itemErrors.length > 0) {
    throw ApiError.badRequest('Some items have issues', priced.itemErrors);
  }
  if (priced.orderItems.length === 0) {
    throw ApiError.badRequest('No valid items in the order');
  }
  if (priced.couponError) {
    throw ApiError.badRequest(priced.couponError);
  }

  const { orderItems, itemsTotal, discount, coupon, taxAmount, deliveryCharge, totalAmount } = priced;

  // 5. Create the order (retry on the unlikely order-number collision)
  let order;
  for (let attempt = 0; attempt < 5 && !order; attempt++) {
    try {
      order = await Order.create({
        orderNumber: generateOrderNumber(),
        user: userId,
        items: orderItems,
        shippingAddress,
        itemsTotal,
        discount,
        couponCode: coupon ? coupon.code : '',
        deliveryCharge,
        taxAmount,
        gstPercent: priced.gstPercent,
        gstInclusive: priced.gstInclusive,
        totalAmount,
        paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'placed',
        notes: notes || '',
        statusHistory: [{ status: 'placed', note: 'Order placed', at: new Date(), by: userId }],
      });
    } catch (err) {
      if (!(err.code === 11000 && err.keyPattern && err.keyPattern.orderNumber)) throw err;
    }
  }
  if (!order) throw ApiError.internal('Could not create the order. Please try again.');

  // 6. Handle payment method
  if (paymentMethod === 'razorpay') {
    // Stock is taken when the payment is confirmed (see finalizePaidOrder)
    const amountInPaise = Math.round(totalAmount * 100);
    let rzpOrder;
    try {
      rzpOrder = await razorpayService.createOrder({
        amount: amountInPaise,
        receipt: order.orderNumber,
        notes: { orderId: order._id.toString(), userId: userId.toString() },
      });
    } catch (err) {
      // Do not leave an unpayable order behind
      await Order.findByIdAndDelete(order._id);
      logger.error(`Razorpay order creation failed for ${order.orderNumber}: ${err.message || err}`);
      throw new ApiError(502, 'Could not start the online payment. Please try again or choose another payment method.');
    }

    order.razorpayOrderId = rzpOrder.id;
    await order.save();

    await Payment.create({
      order: order._id,
      user: userId,
      razorpayOrderId: rzpOrder.id,
      amount: totalAmount,
      currency: 'INR',
      status: 'created',
    });

    return {
      order,
      razorpay: {
        orderId: rzpOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        keyId: config.razorpay.keyId,
      },
    };
  }

  // COD flow: take the stock now
  const shortItem = await deductStock(order);
  if (shortItem) {
    await Order.findByIdAndDelete(order._id);
    throw ApiError.badRequest(`"${shortItem}" stock changed. Please try again.`);
  }

  if (coupon) {
    await couponService.recordCouponUse(coupon.code, userId);
    order.couponCounted = true;
  }
  await order.save();

  await removeOrderedFromCart(order);

  // Confirmation email (non-blocking)
  User.findById(userId)
    .then((user) => {
      if (user) sendOrderConfirmation(order, user.email).catch(() => {});
    })
    .catch(() => {});

  return { order };
}

/**
 * Get user's orders (paginated).
 * @param {string} userId
 * @param {object} query
 * @returns {Promise<{orders: Array, meta: object}>}
 */
async function getMyOrders(userId, query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { user: userId };

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  return { orders, meta: buildMeta(total, page, limit) };
}

/**
 * Get single order by ID (owner or admin).
 * @param {string} orderId
 * @param {string} userId
 * @param {boolean} isAdmin
 * @returns {Promise<object>}
 */
async function getOrderById(orderId, userId, isAdmin = false) {
  if (!mongoose.isValidObjectId(orderId)) {
    throw ApiError.badRequest('Invalid order ID');
  }

  const order = await Order.findById(orderId).populate('user', 'name email phone company gstin');
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (!isAdmin && (!order.user || order.user._id.toString() !== userId.toString())) {
    // 404, not 403: do not reveal that someone else's order exists
    throw ApiError.notFound('Order not found');
  }

  return order;
}

/**
 * Cancel an order: shared by the customer and the admin.
 * Puts the stock back, releases the coupon and flags a refund when the
 * order was already paid online.
 *
 * @param {object} order - Order document
 * @param {object} options - { reason, by, note }
 */
async function applyCancellation(order, { reason = '', by, note }) {
  await restoreStock(order);

  if (order.couponCounted) {
    await couponService.releaseCouponUse(order.couponCode, order.user._id || order.user);
    order.couponCounted = false;
  }

  order.orderStatus = 'cancelled';
  order.cancelledAt = new Date();
  order.cancelReason = reason;
  order.statusHistory.push({ status: 'cancelled', note, at: new Date(), by });

  // Paid online: the money has to go back
  if (order.paymentStatus === 'paid' && order.paymentMethod === 'razorpay') {
    order.paymentStatus = 'refund_pending';
    sendAdminAlert(
      `Refund Required — ${order.orderNumber}`,
      `Order ${order.orderNumber} was cancelled after payment. Amount: ₹${order.totalAmount}. Please process the refund.`
    ).catch(() => {}); // non-blocking
  }
}

/**
 * Cancel an order (user).
 * Allowed only while placed or confirmed.
 * @param {string} orderId
 * @param {string} userId
 * @param {string} reason
 * @returns {Promise<object>}
 */
async function cancelOrder(orderId, userId, reason = '') {
  const order = await getOrderById(orderId, userId);

  if (!['placed', 'confirmed'].includes(order.orderStatus)) {
    throw ApiError.badRequest(
      `Cannot cancel an order that is already ${order.orderStatus}`
    );
  }

  await applyCancellation(order, {
    reason,
    by: userId,
    note: reason || 'Cancelled by customer',
  });

  await order.save();
  return order;
}

/**
 * Get invoice-ready JSON for an order.
 * @param {string} orderId
 * @param {string} userId
 * @param {boolean} isAdmin
 * @returns {Promise<object>}
 */
async function getInvoice(orderId, userId, isAdmin = false) {
  const order = await getOrderById(orderId, userId, isAdmin);
  const settings = await settingsService.getSettings();

  return {
    seller: {
      name: settings.legalName || settings.storeName,
      address: settings.address,
      gstin: settings.gstin,
      gstNote: order.gstInclusive
        ? 'All prices are inclusive of GST'
        : `GST charged at ${order.gstPercent}%`,
    },
    order: {
      orderNumber: order.orderNumber,
      date: order.createdAt,
      status: order.orderStatus,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
    },
    customer: {
      name: order.shippingAddress.fullName,
      phone: order.shippingAddress.phone,
      company: order.user ? order.user.company : '',
      gstin: order.user ? order.user.gstin : '',
      address: `${order.shippingAddress.line1}${order.shippingAddress.line2 ? ', ' + order.shippingAddress.line2 : ''}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`,
    },
    items: order.items.map((item) => ({
      name: item.name,
      model: item.model,
      sku: item.sku,
      quantity: item.quantity,
      price: item.price,
      mrp: item.mrp,
      total: item.price * item.quantity,
    })),
    summary: {
      itemsTotal: order.itemsTotal,
      discount: order.discount,
      couponCode: order.couponCode,
      taxAmount: order.taxAmount,
      deliveryCharge: order.deliveryCharge,
      totalAmount: order.totalAmount,
    },
  };
}

module.exports = {
  checkout,
  quote,
  priceItems,
  resolveItems,
  getMyOrders,
  getOrderById,
  cancelOrder,
  applyCancellation,
  deductStock,
  restoreStock,
  removeOrderedFromCart,
  getInvoice,
};
