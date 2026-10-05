const { Router } = require('express');
const paymentController = require('./payment.controller');
const { verifyToken } = require('../../middleware/auth.middleware');
const { paymentLimiter } = require('../../middleware/rateLimit.middleware');

const router = Router();

// Webhook is mounted separately in app.js with express.raw()
// These routes need auth
router.post('/verify', verifyToken, paymentLimiter, paymentController.verifyPayment);
router.post('/failed', verifyToken, paymentController.handlePaymentFailed);
router.post('/retry/:orderId', verifyToken, paymentLimiter, paymentController.retryPayment);

module.exports = router;
