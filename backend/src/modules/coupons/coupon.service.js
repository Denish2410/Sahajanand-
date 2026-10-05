const { Coupon } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { parsePagination, buildMeta } = require('../../utils/pagination');

/**
 * Validate a coupon code (user-facing).
 * @param {string} code
 * @param {number} itemsTotal
 * @param {string} userId
 * @returns {Promise<{discount: number, message: string, coupon: object}>}
 */
async function validateCoupon(code, itemsTotal, userId) {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
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

  const userUsage = coupon.usedBy.find((u) => u.user.toString() === userId.toString());
  if (userUsage && userUsage.count >= coupon.perUserLimit) {
    throw ApiError.badRequest('You have already used this coupon the maximum number of times');
  }

  let discount = 0;
  if (coupon.discountType === 'percent') {
    discount = Math.round((itemsTotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.discountValue;
  }
  discount = Math.min(discount, itemsTotal);

  const message =
    coupon.discountType === 'percent'
      ? `${coupon.discountValue}% off${coupon.maxDiscount ? ` (max ₹${coupon.maxDiscount})` : ''}`
      : `₹${coupon.discountValue} off`;

  return {
    discount,
    message: `Coupon applied! ${message}. You save ₹${discount}`,
    coupon: {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    },
  };
}

/**
 * Admin: list all coupons.
 */
async function listCoupons(query) {
  const { page, limit, skip } = parsePagination(query);
  const [coupons, total] = await Promise.all([
    Coupon.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Coupon.countDocuments(),
  ]);
  return { coupons, meta: buildMeta(total, page, limit) };
}

/**
 * Admin: get coupon by ID.
 */
async function getCouponById(id) {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw ApiError.notFound('Coupon not found');
  return coupon;
}

/**
 * Admin: create coupon.
 */
async function createCoupon(data) {
  return Coupon.create(data);
}

/**
 * Admin: update coupon.
 */
async function updateCoupon(id, data) {
  const coupon = await getCouponById(id);
  Object.assign(coupon, data);
  await coupon.save();
  return coupon;
}

/**
 * Admin: delete coupon.
 */
async function deleteCoupon(id) {
  const coupon = await getCouponById(id);
  await Coupon.findByIdAndDelete(id);
  return coupon;
}

module.exports = { validateCoupon, listCoupons, getCouponById, createCoupon, updateCoupon, deleteCoupon };
