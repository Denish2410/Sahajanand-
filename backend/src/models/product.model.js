const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 5000,
    },
    shortDescription: {
      type: String,
      trim: true,
      default: '',
      maxlength: 300,
    },
    brand: {
      type: String,
      trim: true,
      default: '',
      maxlength: 100,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    specs: [
      {
        key: { type: String, trim: true },
        value: { type: String, trim: true },
      },
    ],
    warrantyMonths: {
      type: Number,
      default: 0,
      min: 0,
    },
    features: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true, lowercase: true }],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Validate price <= mrp
productSchema.pre('validate', function (next) {
  if (this.price > this.mrp) {
    this.invalidate('price', 'Price cannot be greater than MRP');
  }
  next();
});

// Compute discountPercent and generate slug before saving
productSchema.pre('save', async function (next) {
  // Compute discount
  if (this.mrp > 0 && this.price <= this.mrp) {
    this.discountPercent = Math.round(((this.mrp - this.price) / this.mrp) * 100);
  } else {
    this.discountPercent = 0;
  }

  // Generate slug
  if (this.isModified('name') || !this.slug) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await mongoose.model('Product').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }

  // Limit images to 8
  if (this.images && this.images.length > 8) {
    this.images = this.images.slice(0, 8);
  }

  next();
});

// Text index for search
productSchema.index(
  { name: 'text', brand: 'text', description: 'text', tags: 'text' },
  { weights: { name: 10, brand: 5, tags: 3, description: 1 } }
);

// Compound indexes
productSchema.index({ category: 1, price: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ isActive: 1, soldCount: -1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
