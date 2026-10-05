const mongoose = require('mongoose');
const { Order, Product, User, Payment } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { parsePagination, buildMeta } = require('../../utils/pagination');
const { sendOrderStatusUpdate } = require('../../utils/email');

// ─── Dashboard ───────────────────────────────────────────
/**
 * Get admin dashboard stats.
 */
async function getDashboard() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalOrders,
    revenueResult,
    pendingOrders,
    todayOrders,
    todayRevenueResult,
    lowStockProducts,
    outOfStockCount,
    totalCustomers,
    newCustomers,
    topProducts,
    ordersByStatus,
    dailyRevenue7,
    dailyRevenue30,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.countDocuments({ orderStatus: { $in: ['placed', 'confirmed'] } }),
    Order.countDocuments({ createdAt: { $gte: todayStart } }),
    Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Product.find({ stock: { $gt: 0, $lte: 5 }, isActive: true })
      .select('name stock sku')
      .sort({ stock: 1 })
      .limit(20)
      .lean(),
    Product.countDocuments({ stock: 0, isActive: true }),
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', createdAt: { $gte: thirtyDaysAgo } }),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' }, totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]),
    Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]),
    // Daily revenue last 7 days
    Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    // Daily revenue last 30 days
    Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const statusMap = {};
  ordersByStatus.forEach((s) => { statusMap[s._id] = s.count; });

  return {
    totalOrders,
    totalRevenue: revenueResult[0]?.total || 0,
    pendingOrders,
    todayOrders,
    todayRevenue: todayRevenueResult[0]?.total || 0,
    lowStockProducts,
    outOfStockCount,
    totalCustomers,
    newCustomers,
    topSellingProducts: topProducts,
    ordersByStatus: statusMap,
    revenueDaily7: dailyRevenue7,
    revenueDaily30: dailyRevenue30,
  };
}

// ─── Orders ──────────────────────────────────────────────
/**
 * Admin: list orders with filters.
 */
async function listOrders(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};

  if (query.status) filter.orderStatus = query.status;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;

  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { orderNumber: searchRegex },
    ];

    // Also search by customer name/email via user lookup
    const matchingUsers = await User.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
      ],
    }).select('_id').lean();

    if (matchingUsers.length > 0) {
      filter.$or.push({ user: { $in: matchingUsers.map((u) => u._id) } });
    }
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email phone')
      .lean(),
    Order.countDocuments(filter),
  ]);

  return { orders, meta: buildMeta(total, page, limit) };
}

/**
 * Admin: update order status with transition validation.
 */
const VALID_TRANSITIONS = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

async function updateOrderStatus(orderId, data, adminId) {
  if (!mongoose.isValidObjectId(orderId)) {
    throw ApiError.badRequest('Invalid order ID');
  }

  const order = await Order.findById(orderId).populate('user', 'name email');
  if (!order) throw ApiError.notFound('Order not found');

  const { status, trackingId, courierName, note } = data;
  const allowed = VALID_TRANSITIONS[order.orderStatus] || [];

  if (!allowed.includes(status)) {
    throw ApiError.badRequest(
      `Cannot transition from '${order.orderStatus}' to '${status}'. Allowed: ${allowed.join(', ') || 'none'}`
    );
  }

  order.orderStatus = status;

  if (status === 'shipped') {
    if (trackingId) order.trackingId = trackingId;
    if (courierName) order.courierName = courierName;
  }

  if (status === 'delivered') {
    order.deliveredAt = new Date();
  }

  if (status === 'cancelled') {
    order.cancelledAt = new Date();
    order.cancelReason = note || 'Cancelled by admin';

    // Restock items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, soldCount: -item.quantity },
      });
    }

    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refund_pending';
    }
  }

  order.statusHistory.push({
    status,
    note: note || `Status updated to ${status}`,
    at: new Date(),
    by: adminId,
  });

  await order.save();

  // Email customer (non-blocking)
  if (order.user && order.user.email) {
    sendOrderStatusUpdate(order, order.user.email, status).catch(() => {});
  }

  return order;
}

/**
 * Admin: update payment status (for COD orders).
 */
async function updatePaymentStatus(orderId, paymentStatus, adminId) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');

  order.paymentStatus = paymentStatus;
  order.statusHistory.push({
    status: `payment_${paymentStatus}`,
    note: `Payment marked as ${paymentStatus} by admin`,
    at: new Date(),
    by: adminId,
  });
  await order.save();
  return order;
}

// ─── Users ───────────────────────────────────────────────
/**
 * Admin: list users.
 */
async function listUsers(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  return { users, meta: buildMeta(total, page, limit) };
}

/**
 * Admin: get user by ID with their orders.
 */
async function getUserById(userId) {
  if (!mongoose.isValidObjectId(userId)) {
    throw ApiError.badRequest('Invalid user ID');
  }

  const user = await User.findById(userId).lean();
  if (!user) throw ApiError.notFound('User not found');

  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return { user, orders };
}

/**
 * Admin: update user role.
 */
async function updateUserRole(userId, role, adminId) {
  if (userId.toString() === adminId.toString()) {
    throw ApiError.badRequest('You cannot change your own role');
  }

  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  user.role = role;
  await user.save();
  return user;
}

/**
 * Admin: activate/deactivate user.
 */
async function updateUserStatus(userId, isActive, adminId) {
  if (userId.toString() === adminId.toString()) {
    throw ApiError.badRequest('You cannot deactivate your own account');
  }

  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  user.isActive = isActive;
  await user.save();
  return user;
}

// ─── Payments ────────────────────────────────────────────
/**
 * Admin: list payments.
 */
async function listPayments(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};

  if (query.status) filter.status = query.status;

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('order', 'orderNumber totalAmount')
      .populate('user', 'name email')
      .lean(),
    Payment.countDocuments(filter),
  ]);

  return { payments, meta: buildMeta(total, page, limit) };
}

module.exports = {
  getDashboard,
  listOrders,
  updateOrderStatus,
  updatePaymentStatus,
  listUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  listPayments,
};
