const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  description: z.string().trim().max(5000).optional().default(''),
  shortDescription: z.string().trim().max(300).optional().default(''),
  brand: z.string().trim().max(100).optional().default(''),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  mrp: z.coerce.number().min(0, 'MRP must be non-negative'),
  stock: z.coerce.number().int().min(0, 'Stock must be non-negative').default(0),
  sku: z.string().trim().optional().default(''),
  specs: z
    .array(z.object({ key: z.string(), value: z.string() }))
    .optional()
    .default([]),
  warrantyMonths: z.coerce.number().int().min(0).optional().default(0),
  features: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  isFeatured: z.coerce.boolean().optional().default(false),
  isActive: z.coerce.boolean().optional().default(true),
});

const updateProductSchema = createProductSchema.partial();

const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  sort: z
    .enum(['newest', 'price_asc', 'price_desc', 'popular', 'rating', 'discount'])
    .optional()
    .default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
});

module.exports = { createProductSchema, updateProductSchema, productQuerySchema };
