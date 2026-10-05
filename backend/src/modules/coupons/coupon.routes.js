const { Router } = require('express');
const couponController = require('./coupon.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

const router = Router();

router.post('/validate', verifyToken, couponController.validateCoupon);

module.exports = router;
