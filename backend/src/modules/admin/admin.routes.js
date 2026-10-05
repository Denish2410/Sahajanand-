const { Router } = require('express');
const adminController = require('./admin.controller');
const { verifyToken } = require('../../middleware/auth.middleware');
const { isAdmin } = require('../../middleware/admin.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { uploadSingle, uploadMultiple } = require('../../middleware/upload.middleware');
const { adminLimiter } = require('../../middleware/rateLimit.middleware');
const v = require('./admin.validation');

const router = Router();

// All admin routes require authentication + admin role
router.use(verifyToken, isAdmin, adminLimiter);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Products
router.get('/products', adminController.getProducts);
router.post(
  '/products',
  validate({ body: v.adminCreateProductSchema }),
  adminController.createProduct
);
router.get('/products/:id', adminController.getProduct);
router.put(
  '/products/:id',
  validate({ body: v.adminUpdateProductSchema }),
  adminController.updateProduct
);
router.delete('/products/:id', adminController.deleteProduct);
router.patch(
  '/products/:id/stock',
  validate({ body: v.adminStockSchema }),
  adminController.updateStock
);
router.patch('/products/:id/toggle', adminController.toggleProduct);
router.post('/products/:id/images', uploadMultiple('images', 8), adminController.uploadImages);
router.delete('/products/:id/images/:publicId', adminController.deleteImage);

// Categories
router.get('/categories', adminController.getCategories);
router.post('/categories', uploadSingle('image'), adminController.createCategory);
router.get('/categories/:id', adminController.getCategory);
router.put('/categories/:id', uploadSingle('image'), adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Orders
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrder);
router.patch(
  '/orders/:id/status',
  validate({ body: v.adminUpdateOrderStatusSchema }),
  adminController.updateOrderStatus
);
router.patch(
  '/orders/:id/payment-status',
  validate({ body: v.adminUpdatePaymentStatusSchema }),
  adminController.updatePaymentStatus
);
router.post(
  '/orders/:id/refund',
  validate({ body: v.adminRefundSchema }),
  adminController.refundOrder
);

// Users
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.patch(
  '/users/:id/role',
  validate({ body: v.adminUpdateRoleSchema }),
  adminController.updateUserRole
);
router.patch(
  '/users/:id/status',
  validate({ body: v.adminUpdateStatusSchema }),
  adminController.updateUserStatus
);

// Coupons
router.get('/coupons', adminController.getCoupons);
router.get('/coupons/:id', adminController.getCoupon);
router.post(
  '/coupons',
  validate({ body: v.adminCreateCouponSchema }),
  adminController.createCoupon
);
router.put(
  '/coupons/:id',
  validate({ body: v.adminUpdateCouponSchema }),
  adminController.updateCoupon
);
router.delete('/coupons/:id', adminController.deleteCoupon);

// Reviews
router.get('/reviews', adminController.getReviews);
router.patch('/reviews/:id/approve', adminController.toggleReviewApproval);
router.delete('/reviews/:id', adminController.deleteReview);

// Payments
router.get('/payments', adminController.getPayments);

module.exports = router;
