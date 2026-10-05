const couponService = require('./coupon.service');
const { Cart } = require('../../models');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

/**
 * POST /api/coupons/validate
 */
const validateCoupon = asyncHandler(async (req, res) => {
  let { code, itemsTotal } = req.body;

  // If itemsTotal not provided, compute from server cart
  if (!itemsTotal) {
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'price',
    });
    if (!cart || cart.items.length === 0) {
      return ApiResponse(res, 400, 'Cart is empty');
    }
    itemsTotal = cart.items.reduce(
      (sum, item) => sum + (item.product ? item.product.price * item.quantity : 0),
      0
    );
  }

  const result = await couponService.validateCoupon(code, itemsTotal, req.user._id);
  return ApiResponse(res, 200, result.message, result);
});

module.exports = { validateCoupon };
