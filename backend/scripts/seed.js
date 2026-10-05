/**
 * Seed script for Sahajanand Electronics.
 *
 * Loads the Elanpro catalogue in data/catalogue.json (categories, products,
 * homepage banners). Specifications, features and descriptions come from the
 * Elanpro catalogue.
 *
 * IMPORTANT before going live:
 *   - Prices in the catalogue file are reference prices (priceSource
 *     'indicative' or 'listed'), not Sahajanand's price list. Set the real
 *     prices from the admin panel; a price saved there becomes 'confirmed'.
 *   - Products are seeded with zero stock, so nothing can be ordered until
 *     the real stock is entered in the admin panel.
 *
 * Usage:
 *   npm run seed            — add anything missing (never overwrites edits)
 *   npm run seed:demo       — same, and gives every product 5 units of stock
 *                             so the checkout can be tried (development only)
 *   npm run seed:destroy    — delete products, categories, banners, coupons
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const config = require('../src/config/env');
const catalogue = require('../data/catalogue.json');

const { Category, Product, Banner, Coupon } = require('../src/models');

const isDestroy = process.argv.includes('--destroy');
const isDemo = process.argv.includes('--demo');
const DEMO_STOCK = 5;

async function seed() {
  if (isDemo && config.isProduction) {
    throw new Error('--demo must not be used in production: it invents stock levels');
  }

  // Categories
  const categoryIds = {};
  for (const data of catalogue.categories) {
    let category = await Category.findOne({ slug: data.slug });
    if (!category) {
      category = await Category.create(data);
      console.log(`  + Category: ${category.name} (${category.slug})`);
    }
    categoryIds[data.slug] = category._id;
  }

  // Products
  const productIds = {};
  let created = 0;
  for (const [index, data] of catalogue.products.entries()) {
    const categoryId = categoryIds[data.category];
    if (!categoryId) {
      console.warn(`  ! Category "${data.category}" not found for "${data.model}"`);
      continue;
    }

    let product = await Product.findOne({ slug: data.slug });
    if (!product) {
      product = await Product.create({
        ...data,
        category: categoryId,
        temp: data.temp || undefined,
        stock: isDemo ? DEMO_STOCK : 0,
        sortOrder: index + 1,
      });
      created++;
    } else if (isDemo && product.stock === 0) {
      product.stock = DEMO_STOCK;
      await product.save();
    }
    productIds[data.model] = product._id;
  }
  console.log(`  + Products: ${created} added, ${catalogue.products.length - created} already present`);

  // Homepage banners
  if ((await Banner.countDocuments()) === 0) {
    for (const data of catalogue.banners) {
      const product = productIds[data.productModel];
      if (!product) continue;
      await Banner.create({ ...data, product });
    }
    console.log(`  + Banners: ${catalogue.banners.length}`);
  }

  console.log('\nSeed completed.');
  if (!isDemo) {
    console.log('Products have zero stock and reference prices: set both in the admin panel.');
  }
}

async function destroy() {
  if (config.isProduction && !process.argv.includes('--yes')) {
    throw new Error('Refusing to delete the catalogue in production without --yes');
  }
  await Product.deleteMany({});
  await Category.deleteMany({});
  await Banner.deleteMany({});
  await Coupon.deleteMany({});
  console.log('Products, categories, banners and coupons deleted.');
}

async function main() {
  await mongoose.connect(config.mongo.uri);
  console.log('Connected to MongoDB');
  try {
    await (isDestroy ? destroy() : seed());
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  });
}

module.exports = { seed };
