const mongoose = require('mongoose');
const { Order, Product, Cart, Address, Coupon, Payment } = require('../../models');
const config = require('../../config/env');
const ApiError = require('../../utils/ApiError');
const { generateOrderNumber } = require('../../utils/generateToken');
const razorpayService = require('../../integrations/razorpay/razorpay.service');
const { parsePagination, buildMeta } = require('../../utils/pagination');

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
 * Validate and apply coupon.
 * @param {string} couponCode
 * @param {number} itemsTotal
 * @param {string} userId
 * @returns {Promise<{discount: number, coupon: object}>}
 */
async function applyCoupon(couponCode, itemsTotal, userId) {
  if (!couponCode) return { discount: 0, coupon: null };

  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    throw ApiError.badRequest('Invalid coupon code');
  }

  const now = new Date();
  if (coupon.startsAt && now < coupon.startsAt) {
    throw ApiError.badRequest('Coupon is not yet active');
  }
  if (coupon.expiresAt && now > coupon.expiresAt) {
    throw ApiError.badRequest('Coupon has expired');
  }
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw ApiError.badRequest('Coupon usage limit reached');
  }
  if (coupon.minOrderValue > 0 && itemsTotal < coupon.minOrderValue) {
    throw ApiError.badRequest(
      `Minimum order of ₹${coupon.minOrderValue} required for this coupon`
    );
  }

  // Per-user limit check
  const userUsage = coupon.usedBy.find(
    (u) => u.user.toString() === userId.toString()
  );
  if (userUsage && userUsage.count >= coupon.perUserLimit) {
    throw ApiError.badRequest('You have already used this coupon the maximum number of times');
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discountType === 'percent') {
    discount = Math.round((itemsTotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.discountValue;
  }

  // Don't let discount exceed items total
  discount = Math.min(discount, itemsTotal);

  return { discount, coupon };
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

  // 3. Check COD allowed
  if (paymentMethod === 'cod' && !config.business.enableCod) {
    throw ApiError.badRequest('Cash on Delivery is not available');
  }

  // 4. Load products and validate
  const orderItems = [];
  const productErrors = [];

  for (const rawItem of rawItems) {
    if (!mongoose.isValidObjectId(rawItem.productId)) {
      productErrors.push({ productId: rawItem.productId, message: 'Invalid product ID' });
      continue;
    }

    const product = await Product.findById(rawItem.productId);
    if (!product) {
      productErrors.push({ productId: rawItem.productId, message: 'Product not found' });
      continue;
    }
    if (!product.isActive) {
      productErrors.push({ productId: rawItem.productId, message: `"${product.name}" is no longer available` });
      continue;
    }
    if (product.stock === 0) {
      productErrors.push({ productId: rawItem.productId, message: `"${product.name}" is out of stock` });
      continue;
    }
    if (rawItem.quantity > product.stock) {
      productErrors.push({
        productId: rawItem.productId,
        message: `"${product.name}" only has ${product.stock} in stock`,
      });
      continue;
    }

    // Snapshot: use server-side prices, never client-provided
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images.length > 0 ? product.images[0].url : '',
      sku: product.sku || '',
      price: product.price,
      mrp: product.mrp,
      quantity: rawItem.quantity,
    });
  }

  if (productErrors.length > 0) {
    throw ApiError.badRequest('Some items have issues', productErrors);
  }

  if (orderItems.length === 0) {
    throw ApiError.badRequest('No valid items in the order');
  }

  // 5. Compute totals (server-side only)
  const itemsTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 6. Apply coupon
  const { discount, coupon } = await applyCoupon(couponCode, itemsTotal, userId);

  // 7. Delivery charge
  const subtotalAfterDiscount = itemsTotal - discount;
  const deliveryCharge =
    subtotalAfterDiscount >= config.business.freeDeliveryAbove
      ? 0
      : config.business.deliveryCharge;

  // 8. Final total
  const totalAmount = subtotalAfterDiscount + deliveryCharge;

  // 9. Generate order number (collision-safe retry)
  let orderNumber;
  let attempts = 0;
  do {
    orderNumber = generateOrderNumber();
    const existing = await Order.findOne({ orderNumber }).lean();
    if (!existing) break;
    attempts++;
  } while (attempts < 5);

  // 10. Create the order
  const order = await Order.create({
    orderNumber,
    user: userId,
    items: orderItems,
    shippingAddress,
    itemsTotal,
    discount,
    couponCode: couponCode ? couponCode.toUpperCase() : '',
    deliveryCharge,
    totalAmount,
    paymentMethod,
    paymentStatus: 'pending',
    orderStatus: 'placed',
    notes: notes || '',
    statusHistory: [{ status: 'placed', note: 'Order placed', at: new Date(), by: userId }],
  });

  // 11. Handle payment method
  if (paymentMethod === 'razorpay') {
    // Create Razorpay order
    const amountInPaise = Math.round(totalAmount * 100);
    const rzpOrder = await razorpayService.createOrder({
      amount: amountInPaise,
      receipt: orderNumber,
      notes: { orderId: order._id.toString(), userId: userId.toString() },
    });

    order.razorpayOrderId = rzpOrder.id;
    await order.save();

    // Create Payment record
    await Payment.create({
      order: order._id,
      user: userId,
      razorpayOrderId: rzpOrder.id,
      amount: totalAmount,
      currency: 'INR',
      status: 'created',
    });

    // Update coupon usage
    if (coupon) {
      await updateCouponUsage(coupon, userId);
    }

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

  // COD flow
  // Decrement stock atomically
  for (const item of orderItems) {
    const result = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity, soldCount: item.quantity } },
      { new: true }
    );
    if (!result) {
      // Restock previously decremented items
      for (const prev of orderItems) {
        if (prev.product.toString() === item.product.toString()) break;
        await Product.findByIdAndUpdate(prev.product, {
          $inc: { stock: prev.quantity, soldCount: -prev.quantity },
        });
      }
      // Delete the order
      await Order.findByIdAndDelete(order._id);
      throw ApiError.badRequest(`"${item.name}" stock changed. Please try again.`);
    }
  }

  // Clear cart
  await Cart.findOneAndUpdate({ user: userId }, { items: [] });

  // Update coupon usage
  if (coupon) {
    await updateCouponUsage(coupon, userId);
  }

  return { order };
}

/**
 * Update coupon usage counters.
 */
async function updateCouponUsage(coupon, userId) {
  coupon.usedCount += 1;
  const userEntry = coupon.usedBy.find((u) => u.user.toString() === userId.toString());
  if (userEntry) {
    userEntry.count += 1;
  } else {
    coupon.usedBy.push({ user: userId, count: 1 });
  }
  await coupon.save();
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

  const order = await Order.findById(orderId).populate('user', 'name email phone');
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (!isAdmin && order.user._id.toString() !== userId.toString()) {
    throw ApiError.forbidden('You can only view your own orders');
  }

  return order;
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

  // Restock items if stock was already decremented (COD or paid online)
  if (order.paymentMethod === 'cod' || order.paymentStatus === 'paid') {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, soldCount: -item.quantity },
      });
    }
  }

  order.orderStatus = 'cancelled';
  order.cancelledAt = new Date();
  order.cancelReason = reason;
  order.statusHistory.push({
    status: 'cancelled',
    note: reason || 'Cancelled by customer',
    at: new Date(),
    by: userId,
  });

  // If paid online, set paymentStatus to refund_pending
  if (order.paymentStatus === 'paid' && order.paymentMethod === 'razorpay') {
    order.paymentStatus = 'refund_pending';
    // Notify admin
    const { sendAdminAlert } = require('../../utils/email');
    sendAdminAlert(
      `Refund Required — ${order.orderNumber}`,
      `Order ${order.orderNumber} has been cancelled by the customer after payment. Amount: ₹${order.totalAmount}. Please process the refund.`
    ).catch(() => {}); // non-blocking
  }

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

  return {
    seller: {
      name: 'Sahajanand Electronics and Refrigeration LLP',
      gstNote: config.business.gstInclusive
        ? 'All prices are inclusive of GST'
        : 'GST applied at applicable rates',
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
      address: `${order.shippingAddress.line1}${order.shippingAddress.line2 ? ', ' + order.shippingAddress.line2 : ''}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`,
    },
    items: order.items.map((item) => ({
      name: item.name,
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
      deliveryCharge: order.deliveryCharge,
      totalAmount: order.totalAmount,
    },
  };
}

module.exports = {
  checkout,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getInvoice,
  applyCoupon,
};
