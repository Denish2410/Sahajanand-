const { z } = require('zod');

// ─── Products ────────────────────────────────────────────
const adminCreateProductSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional().default(''),
  shortDescription: z.string().trim().max(300).optional().default(''),
  brand: z.string().trim().max(100).optional().default(''),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().min(0),
  mrp: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0).default(0),
  sku: z.string().trim().optional().default(''),
  specs: z.preprocess(
    (v) => (typeof v === 'string' ? JSON.parse(v) : v),
    z.array(z.object({ key: z.string(), value: z.string() })).optional().default([])
  ),
  warrantyMonths: z.coerce.number().int().min(0).optional().default(0),
  features: z.preprocess(
    (v) => (typeof v === 'string' ? JSON.parse(v) : v),
    z.array(z.string()).optional().default([])
  ),
  tags: z.preprocess(
    (v) => (typeof v === 'string' ? JSON.parse(v) : v),
    z.array(z.string()).optional().default([])
  ),
  isFeatured: z.preprocess((v) => v === 'true' || v === true, z.boolean().optional().default(false)),
  isActive: z.preprocess((v) => v === 'true' || v === true || v === undefined, z.boolean().optional().default(true)),
});

const adminUpdateProductSchema = adminCreateProductSchema.partial();

const adminStockSchema = z.object({
  stock: z.coerce.number().int().min(0, 'Stock must be non-negative'),
});

// ─── Categories ──────────────────────────────────────────
const adminCreateCategorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional().default(''),
  parent: z.string().optional().nullable(),
  isActive: z.preprocess((v) => v === 'true' || v === true || v === undefined, z.boolean().optional().default(true)),
  sortOrder: z.coerce.number().int().optional().default(0),
});

const adminUpdateCategorySchema = adminCreateCategorySchema.partial();

// ─── Orders ──────────────────────────────────────────────
const adminUpdateOrderStatusSchema = z.object({
  status: z.enum(['confirmed', 'shipped', 'delivered', 'cancelled']),
  trackingId: z.string().trim().optional().default(''),
  courierName: z.string().trim().optional().default(''),
  note: z.string().trim().max(500).optional().default(''),
});

const adminUpdatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(['paid', 'pending']),
});

const adminRefundSchema = z.object({
  amount: z.coerce.number().min(0).optional().default(0),
});

// ─── Users ───────────────────────────────────────────────
const adminUpdateRoleSchema = z.object({
  role: z.enum(['user', 'admin']),
});

const adminUpdateStatusSchema = z.object({
  isActive: z.boolean(),
});

// ─── Coupons ─────────────────────────────────────────────
const adminCreateCouponSchema = z.object({
  code: z.string().trim().min(1).max(30).transform((v) => v.toUpperCase()),
  description: z.string().trim().max(200).optional().default(''),
  discountType: z.enum(['percent', 'flat']),
  discountValue: z.coerce.number().min(0),
  maxDiscount: z.coerce.number().min(0).optional().default(0),
  minOrderValue: z.coerce.number().min(0).optional().default(0),
  usageLimit: z.coerce.number().int().min(0).optional().default(0),
  perUserLimit: z.coerce.number().int().min(1).optional().default(1),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date(),
  isActive: z.boolean().optional().default(true),
});

const adminUpdateCouponSchema = adminCreateCouponSchema.partial();

// ─── Query schemas ───────────────────────────────────────
const adminOrdersQuerySchema = z.object({
  status: z.enum(['placed', 'confirmed', 'shipped', 'delivered', 'cancelled']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refund_pending', 'refunded']).optional(),
  paymentMethod: z.enum(['razorpay', 'cod']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const adminProductsQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  isActive: z.preprocess(
    (v) => (v === 'true' ? true : v === 'false' ? false : undefined),
    z.boolean().optional()
  ),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

module.exports = {
  adminCreateProductSchema,
  adminUpdateProductSchema,
  adminStockSchema,
  adminCreateCategorySchema,
  adminUpdateCategorySchema,
  adminUpdateOrderStatusSchema,
  adminUpdatePaymentStatusSchema,
  adminRefundSchema,
  adminUpdateRoleSchema,
  adminUpdateStatusSchema,
  adminCreateCouponSchema,
  adminUpdateCouponSchema,
  adminOrdersQuerySchema,
  adminProductsQuerySchema,
};
