const { Payment, Order, Product, Cart, User } = require('../../models');
const razorpayService = require('../../integrations/razorpay/razorpay.service');
const config = require('../../config/env');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');
const { sendOrderConfirmation, sendAdminAlert } = require('../../utils/email');

/**
 * Verify Razorpay payment signature and finalize the order.
 *
 * @param {string} userId
 * @param {object} body - { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * @returns {Promise<object>} Order
 */
async function verifyPayment(userId, body) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  // Find the order
  const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  // Verify ownership
  if (order.user.toString() !== userId.toString()) {
    throw ApiError.forbidden('You can only verify your own payments');
  }

  // Verify signature
  const isValid = razorpayService.verifySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    // Mark payment as failed
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: 'failed',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      }
    );
    throw ApiError.badRequest('Payment verification failed. Invalid signature.');
  }

  // Update payment record
  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
  if (payment) {
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();
  }

  // Finalize
  const finalizedOrder = await finalizePaidOrder(order, {
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  });

  return finalizedOrder;
}

/**
 * Finalize a paid order — shared by verify and webhook.
 * Safe to call twice (idempotent): if already paid, returns as-is.
 *
 * @param {object} order - Order document
 * @param {object} paymentDetails - { razorpayPaymentId, razorpaySignature? }
 * @returns {Promise<object>} Updated order
 */
async function finalizePaidOrder(order, paymentDetails) {
  // Idempotency: already paid
  if (order.paymentStatus === 'paid') {
    logger.info(`Order ${order.orderNumber} already marked as paid — skipping`);
    return order;
  }

  let hasStockIssue = false;
  const stockNotes = [];

  // Decrement stock atomically for each item
  for (const item of order.items) {
    const result = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity, soldCount: item.quantity } },
      { new: true }
    );

    if (!result) {
      // Insufficient stock but payment is received — flag for admin
      hasStockIssue = true;
      stockNotes.push(`"${item.name}" (qty: ${item.quantity}) — insufficient stock`);
      logger.warn(
        `Order ${order.orderNumber}: insufficient stock for product ${item.product} — paid order needs attention`
      );
    }
  }

  // Mark order as paid
  order.paymentStatus = 'paid';
  order.orderStatus = 'confirmed';
  order.statusHistory.push({
    status: 'confirmed',
    note: 'Payment confirmed',
    at: new Date(),
  });

  if (hasStockIssue) {
    order.needsAttention = true;
    order.notes = (order.notes ? order.notes + '\n' : '') +
      'STOCK ISSUE: ' + stockNotes.join('; ');
    order.statusHistory.push({
      status: 'confirmed',
      note: 'ATTENTION: Some items have insufficient stock. Manual resolution required.',
      at: new Date(),
    });

    // Alert admin
    sendAdminAlert(
      `Stock Issue — ${order.orderNumber}`,
      `Paid order ${order.orderNumber} has stock issues:\n${stockNotes.join('\n')}\n\nPlease resolve manually (fulfil or refund).`
    ).catch(() => {});
  }

  await order.save();

  // Update payment record
  await Payment.findOneAndUpdate(
    { razorpayOrderId: order.razorpayOrderId },
    {
      status: 'captured',
      razorpayPaymentId: paymentDetails.razorpayPaymentId,
      razorpaySignature: paymentDetails.razorpaySignature || '',
    }
  );

  // Clear user's cart (non-blocking)
  Cart.findOneAndUpdate({ user: order.user }, { items: [] }).catch(() => {});

  // Send confirmation email (non-blocking)
  User.findById(order.user)
    .then((user) => {
      if (user) {
        sendOrderConfirmation(order, user.email).catch(() => {});
      }
    })
    .catch(() => {});

  logger.info(`Order ${order.orderNumber} finalized as paid`);
  return order;
}

/**
 * Handle frontend reporting a failed payment.
 * @param {string} userId
 * @param {object} body - { razorpay_order_id }
 */
async function handlePaymentFailed(userId, body) {
  const { razorpay_order_id } = body;

  const order = await Order.findOne({ razorpayOrderId: razorpay_order_id, user: userId });
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  order.paymentStatus = 'failed';
  await order.save();

  await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    { status: 'failed' }
  );

  return order;
}

/**
 * Retry payment for an unpaid online order.
 * @param {string} userId
 * @param {string} orderId
 * @returns {Promise<object>}
 */
async function retryPayment(userId, orderId) {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.paymentMethod !== 'razorpay') {
    throw ApiError.badRequest('Only online payment orders can be retried');
  }

  if (order.paymentStatus === 'paid') {
    throw ApiError.badRequest('This order is already paid');
  }

  if (order.orderStatus === 'cancelled') {
    throw ApiError.badRequest('This order has been cancelled');
  }

  // Create a new Razorpay order
  const amountInPaise = Math.round(order.totalAmount * 100);
  const rzpOrder = await razorpayService.createOrder({
    amount: amountInPaise,
    receipt: order.orderNumber,
    notes: { orderId: order._id.toString(), userId: userId.toString(), retry: true },
  });

  order.razorpayOrderId = rzpOrder.id;
  order.paymentStatus = 'pending';
  await order.save();

  // Create new Payment record
  await Payment.create({
    order: order._id,
    user: userId,
    razorpayOrderId: rzpOrder.id,
    amount: order.totalAmount,
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

/**
 * Handle Razorpay webhook events.
 * Must be idempotent and always return quickly.
 *
 * @param {Buffer|string} rawBody - Raw request body
 * @param {string} signature - X-Razorpay-Signature header
 * @returns {Promise<{status: string}>}
 */
async function handleWebhook(rawBody, signature) {
  // Verify signature
  const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    throw ApiError.badRequest('Invalid webhook signature');
  }

  const payload = JSON.parse(rawBody.toString());
  const event = payload.event;
  const entity = payload.payload?.payment?.entity || payload.payload?.refund?.entity || {};

  logger.info(`Webhook received: ${event}`);

  const razorpayOrderId = entity.order_id;
  const razorpayPaymentId = entity.id;

  if (!razorpayOrderId) {
    // Some events don't have order_id, just acknowledge
    return { status: 'acknowledged' };
  }

  // Find order
  const order = await Order.findOne({ razorpayOrderId });
  if (!order) {
    logger.warn(`Webhook: order not found for razorpay order ${razorpayOrderId}`);
    return { status: 'order_not_found' };
  }

  // Idempotency check
  const payment = await Payment.findOne({ razorpayOrderId });
  if (payment) {
    const alreadyProcessed = payment.webhookEvents.some(
      (e) => e.event === event && payment.razorpayPaymentId === razorpayPaymentId
    );
    if (alreadyProcessed) {
      logger.info(`Webhook: event ${event} already processed for ${razorpayOrderId}`);
      return { status: 'already_processed' };
    }

    // Log this webhook event
    payment.webhookEvents.push({ event, receivedAt: new Date() });
    payment.rawResponse = entity;
    await payment.save();
  }

  switch (event) {
    case 'payment.captured':
    case 'order.paid': {
      await finalizePaidOrder(order, {
        razorpayPaymentId,
        razorpaySignature: '',
      });
      break;
    }

    case 'payment.failed': {
      order.paymentStatus = 'failed';
      await order.save();
      if (payment) {
        payment.status = 'failed';
        await payment.save();
      }
      break;
    }

    case 'refund.processed': {
      const refundEntity = payload.payload?.refund?.entity || {};
      order.paymentStatus = 'refunded';
      order.statusHistory.push({
        status: 'refunded',
        note: `Refund processed: ${refundEntity.id || 'unknown'}`,
        at: new Date(),
      });
      await order.save();

      if (payment) {
        payment.status = 'refunded';
        payment.refundId = refundEntity.id || '';
        payment.refundAmount = (refundEntity.amount || 0) / 100;
        await payment.save();
      }
      break;
    }

    default:
      logger.info(`Webhook: unhandled event ${event}`);
  }

  return { status: 'processed' };
}

/**
 * Process a refund for an order (admin).
 * @param {string} orderId
 * @param {number} [amount] - Partial refund amount in rupees (0 = full)
 * @param {string} adminId
 * @returns {Promise<object>}
 */
async function processRefund(orderId, amount, adminId) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.paymentMethod !== 'razorpay') {
    throw ApiError.badRequest('Refunds are only available for online payments');
  }

  if (!['paid', 'refund_pending'].includes(order.paymentStatus)) {
    throw ApiError.badRequest('Order is not eligible for refund');
  }

  const payment = await Payment.findOne({ razorpayOrderId: order.razorpayOrderId, status: 'captured' });
  if (!payment || !payment.razorpayPaymentId) {
    throw ApiError.badRequest('No captured payment found for this order');
  }

  const refundAmountPaise = amount ? Math.round(amount * 100) : 0;
  const refund = await razorpayService.refundPayment(
    payment.razorpayPaymentId,
    refundAmountPaise
  );

  // Update records
  order.paymentStatus = 'refunded';
  order.orderStatus = 'cancelled';
  order.statusHistory.push({
    status: 'refunded',
    note: `Refund initiated by admin. Refund ID: ${refund.id}`,
    at: new Date(),
    by: adminId,
  });
  await order.save();

  payment.status = 'refunded';
  payment.refundId = refund.id;
  payment.refundAmount = (refund.amount || 0) / 100;
  await payment.save();

  return { order, refund };
}

module.exports = {
  verifyPayment,
  finalizePaidOrder,
  handlePaymentFailed,
  retryPayment,
  handleWebhook,
  processRefund,
};
