/**
 * Seed script for Sahajanand Electronics and Refrigeration LLP.
 *
 * Usage:
 *   npm run seed          — seed the database (idempotent)
 *   npm run seed:destroy  — drop all seeded data
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const config = require('../src/config/env');

const { Category, Product, Coupon } = require('../src/models');

const isDestroy = process.argv.includes('--destroy');

const CATEGORIES = [
  { name: 'Refrigerators', description: 'Single door, double door, side-by-side and mini refrigerators from top brands', sortOrder: 1 },
  { name: 'Air Conditioners', description: 'Split ACs, window ACs and inverter air conditioners for every room', sortOrder: 2 },
  { name: 'Washing Machines', description: 'Front load, top load and semi-automatic washing machines', sortOrder: 3 },
  { name: 'Televisions', description: 'LED, OLED, QLED and Smart TVs in all sizes', sortOrder: 4 },
  { name: 'Kitchen Appliances', description: 'Mixer grinders, microwaves, induction cooktops, chimneys and more', sortOrder: 5 },
  { name: 'Small Appliances & Accessories', description: 'Irons, fans, water purifiers, stabilizers and accessories', sortOrder: 6 },
];

const PRODUCTS = [
  // Refrigerators (4)
  { name: 'Samsung 253L Double Door Frost Free Refrigerator', brand: 'Samsung', price: 24990, mrp: 29990, stock: 15, sku: 'SAM-REF-253DD', category: 'Refrigerators', shortDescription: 'Digital inverter compressor, convertible 5-in-1', warrantyMonths: 12, isFeatured: true, features: ['Digital Inverter Compressor', 'Convertible 5-in-1', 'Twin Cooling Plus', 'Power Cool'], specs: [{ key: 'Capacity', value: '253 Litres' }, { key: 'Type', value: 'Double Door' }, { key: 'Energy Rating', value: '3 Star' }, { key: 'Color', value: 'Elegant Inox' }], tags: ['refrigerator', 'samsung', 'double-door', 'frost-free'] },
  { name: 'LG 185L Single Door Refrigerator', brand: 'LG', price: 14990, mrp: 17990, stock: 20, sku: 'LG-REF-185SD', category: 'Refrigerators', shortDescription: 'Smart inverter compressor with 10-year warranty', warrantyMonths: 12, features: ['Smart Inverter Compressor', 'Fast Ice Making', 'Stabilizer Free'], specs: [{ key: 'Capacity', value: '185 Litres' }, { key: 'Type', value: 'Single Door' }, { key: 'Energy Rating', value: '4 Star' }], tags: ['refrigerator', 'lg', 'single-door'] },
  { name: 'Whirlpool 340L Triple Door Refrigerator', brand: 'Whirlpool', price: 31490, mrp: 37990, stock: 8, sku: 'WP-REF-340TD', category: 'Refrigerators', shortDescription: 'Intellisense inverter technology with adaptive intelligence', warrantyMonths: 12, isFeatured: true, features: ['Intellisense Inverter', 'Zeolite Technology', 'Microblock'], specs: [{ key: 'Capacity', value: '340 Litres' }, { key: 'Type', value: 'Triple Door' }, { key: 'Energy Rating', value: '3 Star' }], tags: ['refrigerator', 'whirlpool', 'triple-door'] },
  { name: 'Haier 195L Direct Cool Single Door Refrigerator', brand: 'Haier', price: 12990, mrp: 16490, stock: 25, sku: 'HAI-REF-195DC', category: 'Refrigerators', shortDescription: 'Stabilizer free operation, diamond edge freezing', warrantyMonths: 12, features: ['Stabilizer Free', 'Diamond Edge Freezing', '1 Hour Icing Technology'], specs: [{ key: 'Capacity', value: '195 Litres' }, { key: 'Type', value: 'Single Door' }, { key: 'Energy Rating', value: '4 Star' }], tags: ['refrigerator', 'haier'] },

  // Air Conditioners (4)
  { name: 'Daikin 1.5 Ton 5 Star Inverter Split AC', brand: 'Daikin', price: 42990, mrp: 54990, stock: 10, sku: 'DAI-AC-15T5S', category: 'Air Conditioners', shortDescription: 'Triple display, Coanda airflow, PM 2.5 filter', warrantyMonths: 12, isFeatured: true, features: ['Coanda Airflow', 'PM 2.5 Filter', 'Triple Display', 'Copper Condenser'], specs: [{ key: 'Capacity', value: '1.5 Ton' }, { key: 'Star Rating', value: '5 Star' }, { key: 'Type', value: 'Inverter Split' }, { key: 'Refrigerant', value: 'R-32' }], tags: ['ac', 'daikin', 'inverter', 'split'] },
  { name: 'Voltas 1 Ton 3 Star Split AC', brand: 'Voltas', price: 28990, mrp: 35990, stock: 18, sku: 'VOL-AC-1T3S', category: 'Air Conditioners', shortDescription: 'Adjustable inverter compressor, high ambient cooling', warrantyMonths: 12, features: ['Adjustable Inverter', 'High Ambient Cooling', 'Dust Filter'], specs: [{ key: 'Capacity', value: '1 Ton' }, { key: 'Star Rating', value: '3 Star' }, { key: 'Type', value: 'Split' }], tags: ['ac', 'voltas', 'split'] },
  { name: 'Blue Star 1.5 Ton Window AC', brand: 'Blue Star', price: 31990, mrp: 38990, stock: 12, sku: 'BS-AC-15TW', category: 'Air Conditioners', shortDescription: 'Turbo cool, self diagnosis, hydrophilic coating', warrantyMonths: 12, features: ['Turbo Cool', 'Self Diagnosis', 'Hydrophilic Blue Fins'], specs: [{ key: 'Capacity', value: '1.5 Ton' }, { key: 'Star Rating', value: '3 Star' }, { key: 'Type', value: 'Window' }], tags: ['ac', 'blue-star', 'window'] },
  { name: 'Carrier 2 Ton 5 Star Inverter Split AC', brand: 'Carrier', price: 52990, mrp: 63990, stock: 6, sku: 'CAR-AC-2T5S', category: 'Air Conditioners', shortDescription: 'Flexicool technology, PM 2.5 filter, auto cleanser', warrantyMonths: 12, isFeatured: true, features: ['Flexicool', 'PM 2.5 Filter', 'Auto Cleanser', '4-Way Swing'], specs: [{ key: 'Capacity', value: '2 Ton' }, { key: 'Star Rating', value: '5 Star' }, { key: 'Type', value: 'Inverter Split' }], tags: ['ac', 'carrier', 'inverter', '2-ton'] },

  // Washing Machines (4)
  { name: 'IFB 6.5 Kg Front Load Washing Machine', brand: 'IFB', price: 25490, mrp: 31990, stock: 14, sku: 'IFB-WM-65FL', category: 'Washing Machines', shortDescription: 'Aqua Energie, 2D wash system, anti-allergen', warrantyMonths: 24, isFeatured: true, features: ['Aqua Energie', '2D Wash', 'Anti-Allergen', 'Crescent Moon Drum'], specs: [{ key: 'Capacity', value: '6.5 Kg' }, { key: 'Type', value: 'Front Load' }, { key: 'Spin Speed', value: '1000 RPM' }], tags: ['washing-machine', 'ifb', 'front-load'] },
  { name: 'LG 7 Kg Top Load Washing Machine', brand: 'LG', price: 17990, mrp: 21990, stock: 22, sku: 'LG-WM-7TL', category: 'Washing Machines', shortDescription: 'Smart inverter technology, 10 wash programs', warrantyMonths: 24, features: ['Smart Inverter', 'TurboDrum', 'Auto Restart'], specs: [{ key: 'Capacity', value: '7 Kg' }, { key: 'Type', value: 'Top Load' }, { key: 'Spin Speed', value: '700 RPM' }], tags: ['washing-machine', 'lg', 'top-load'] },
  { name: 'Samsung 8 Kg Semi-Automatic Washing Machine', brand: 'Samsung', price: 12490, mrp: 15490, stock: 30, sku: 'SAM-WM-8SA', category: 'Washing Machines', shortDescription: 'Air turbo drying, centre jet technology', warrantyMonths: 24, features: ['Air Turbo Drying', 'Centre Jet Technology', 'Scrub Board'], specs: [{ key: 'Capacity', value: '8 Kg' }, { key: 'Type', value: 'Semi-Automatic' }], tags: ['washing-machine', 'samsung', 'semi-automatic'] },
  { name: 'Bosch 7 Kg Front Load Washing Machine', brand: 'Bosch', price: 29990, mrp: 36990, stock: 9, sku: 'BSH-WM-7FL', category: 'Washing Machines', shortDescription: 'AntiVibration design, VarioDrum, speed perfect', warrantyMonths: 24, features: ['AntiVibration', 'VarioDrum', 'SpeedPerfect', 'ActiveWater Plus'], specs: [{ key: 'Capacity', value: '7 Kg' }, { key: 'Type', value: 'Front Load' }, { key: 'Spin Speed', value: '1200 RPM' }], tags: ['washing-machine', 'bosch', 'front-load'] },

  // Televisions (4)
  { name: 'Sony Bravia 55" 4K Ultra HD Smart LED TV', brand: 'Sony', price: 59990, mrp: 79990, stock: 7, sku: 'SNY-TV-55UHD', category: 'Televisions', shortDescription: 'X1 processor, Triluminos Pro, Google TV', warrantyMonths: 12, isFeatured: true, features: ['X1 4K Processor', 'Triluminos Pro', 'Google TV', 'Dolby Atmos'], specs: [{ key: 'Screen Size', value: '55 inches' }, { key: 'Resolution', value: '4K Ultra HD' }, { key: 'Panel', value: 'LED' }, { key: 'Smart TV', value: 'Google TV' }], tags: ['tv', 'sony', '4k', 'smart-tv', '55-inch'] },
  { name: 'Samsung 43" Crystal 4K Smart TV', brand: 'Samsung', price: 32990, mrp: 42990, stock: 15, sku: 'SAM-TV-43CRY', category: 'Televisions', shortDescription: 'Crystal processor 4K, HDR, PurColor, SmartThings', warrantyMonths: 12, features: ['Crystal Processor 4K', 'PurColor', 'SmartThings', 'Tizen OS'], specs: [{ key: 'Screen Size', value: '43 inches' }, { key: 'Resolution', value: '4K Ultra HD' }, { key: 'Panel', value: 'LED' }], tags: ['tv', 'samsung', '4k', 'smart-tv'] },
  { name: 'LG 32" HD Ready Smart LED TV', brand: 'LG', price: 13990, mrp: 18990, stock: 28, sku: 'LG-TV-32HD', category: 'Televisions', shortDescription: 'WebOS, Active HDR, virtual surround', warrantyMonths: 12, features: ['WebOS Smart TV', 'Active HDR', 'Virtual Surround Sound'], specs: [{ key: 'Screen Size', value: '32 inches' }, { key: 'Resolution', value: 'HD Ready' }, { key: 'Panel', value: 'LED' }], tags: ['tv', 'lg', 'hd', '32-inch'] },
  { name: 'Mi 50" 4K Ultra HD Android Smart TV', brand: 'Xiaomi', price: 28999, mrp: 34999, stock: 20, sku: 'MI-TV-50UHD', category: 'Televisions', shortDescription: 'Vivid Picture Engine, Android TV 10, 30W speakers', warrantyMonths: 12, features: ['Vivid Picture Engine', 'Android TV 10', '30W Speakers', 'Dolby Audio'], specs: [{ key: 'Screen Size', value: '50 inches' }, { key: 'Resolution', value: '4K Ultra HD' }, { key: 'Panel', value: 'LED' }], tags: ['tv', 'xiaomi', 'mi', '4k', 'android-tv'] },

  // Kitchen Appliances (4)
  { name: 'Prestige Iris 750W Mixer Grinder', brand: 'Prestige', price: 3299, mrp: 4495, stock: 40, sku: 'PRE-MG-750', category: 'Kitchen Appliances', shortDescription: '750W motor, 3 stainless steel jars, 2-year warranty', warrantyMonths: 24, features: ['750W Copper Motor', '3 SS Jars', 'Super Efficient Blades'], specs: [{ key: 'Power', value: '750 Watts' }, { key: 'Jars', value: '3' }, { key: 'Material', value: 'Stainless Steel' }], tags: ['mixer-grinder', 'prestige', 'kitchen'] },
  { name: 'Samsung 28L Convection Microwave Oven', brand: 'Samsung', price: 14990, mrp: 18490, stock: 16, sku: 'SAM-MW-28CV', category: 'Kitchen Appliances', shortDescription: 'SlimFry, Tandoor technology, ceramic enamel cavity', warrantyMonths: 12, features: ['SlimFry', 'Tandoor Technology', 'Ceramic Enamel', 'Auto Cook'], specs: [{ key: 'Capacity', value: '28 Litres' }, { key: 'Type', value: 'Convection' }, { key: 'Power', value: '900 Watts' }], tags: ['microwave', 'samsung', 'convection', 'kitchen'] },
  { name: 'Bajaj Majesty ICX 7 Induction Cooktop', brand: 'Bajaj', price: 2199, mrp: 3199, stock: 35, sku: 'BAJ-IC-7', category: 'Kitchen Appliances', shortDescription: 'Feather touch buttons, toughened glass, auto off', warrantyMonths: 12, features: ['Feather Touch', 'Toughened Glass Top', 'Auto Switch Off', 'Anti-Magnetic Wall'], specs: [{ key: 'Power', value: '1800 Watts' }, { key: 'Cooking Zones', value: '1' }], tags: ['induction', 'bajaj', 'kitchen', 'cooktop'] },
  { name: 'Elica 60cm Auto Clean Chimney', brand: 'Elica', price: 11990, mrp: 16490, stock: 12, sku: 'ELC-CHM-60', category: 'Kitchen Appliances', shortDescription: 'Auto clean, filterless technology, 1200 m³/hr suction', warrantyMonths: 60, features: ['Auto Clean', 'Filterless', 'Touch + Motion Sensor', 'LED Lamp'], specs: [{ key: 'Size', value: '60 cm' }, { key: 'Suction', value: '1200 m³/hr' }, { key: 'Type', value: 'Wall Mount' }], tags: ['chimney', 'elica', 'kitchen', 'auto-clean'] },

  // Small Appliances & Accessories (4)
  { name: 'Philips Steam Iron GC1905', brand: 'Philips', price: 1399, mrp: 1795, stock: 50, sku: 'PHI-IRN-1905', category: 'Small Appliances & Accessories', shortDescription: 'Non-stick soleplate, 1440W, linished soleplate', warrantyMonths: 24, features: ['Non-Stick Soleplate', 'Self Clean', 'Drip Stop'], specs: [{ key: 'Power', value: '1440 Watts' }, { key: 'Water Tank', value: '200ml' }], tags: ['iron', 'philips', 'steam-iron'] },
  { name: 'Crompton High Flo Eve 16" Table Fan', brand: 'Crompton', price: 2299, mrp: 2890, stock: 45, sku: 'CRM-FAN-16T', category: 'Small Appliances & Accessories', shortDescription: 'Aerodynamic blades, motor overload protector', warrantyMonths: 24, features: ['Aerodynamic Blades', 'Motor Overload Protector', '3-Speed Control'], specs: [{ key: 'Sweep', value: '400mm' }, { key: 'Speed', value: '1300 RPM' }], tags: ['fan', 'crompton', 'table-fan'] },
  { name: 'Kent Grand Plus RO Water Purifier', brand: 'Kent', price: 18500, mrp: 21000, stock: 10, sku: 'KNT-WP-GP', category: 'Small Appliances & Accessories', shortDescription: 'RO+UV+UF+TDS, 8L storage, mineral RO technology', warrantyMonths: 12, isFeatured: true, features: ['RO+UV+UF+TDS', '8L Storage', 'Mineral RO Tech', 'Wall Mountable'], specs: [{ key: 'Purification', value: 'RO+UV+UF' }, { key: 'Storage', value: '8 Litres' }, { key: 'Input TDS', value: 'Up to 2000 ppm' }], tags: ['water-purifier', 'kent', 'ro'] },
  { name: 'V-Guard Digi 200 Voltage Stabilizer', brand: 'V-Guard', price: 3490, mrp: 4200, stock: 30, sku: 'VGD-VS-200', category: 'Small Appliances & Accessories', shortDescription: 'Digital display, wide input range, for ACs up to 1.5 Ton', warrantyMonths: 36, features: ['Digital Display', 'Wide Input Range', 'Time Delay', 'Intelligent Thermal Protection'], specs: [{ key: 'Working Range', value: '140V - 280V' }, { key: 'For', value: 'AC up to 1.5 Ton' }, { key: 'Type', value: 'Wall Mount' }], tags: ['stabilizer', 'v-guard', 'voltage-stabilizer'] },
];

const COUPONS = [
  {
    code: 'WELCOME10',
    description: '10% off on your first order',
    discountType: 'percent',
    discountValue: 10,
    maxDiscount: 2000,
    minOrderValue: 5000,
    usageLimit: 0,
    perUserLimit: 1,
    startsAt: new Date(),
    expiresAt: new Date('2027-12-31'),
    isActive: true,
  },
  {
    code: 'FLAT500',
    description: '₹500 off on orders above ₹10,000',
    discountType: 'flat',
    discountValue: 500,
    maxDiscount: 500,
    minOrderValue: 10000,
    usageLimit: 100,
    perUserLimit: 2,
    startsAt: new Date(),
    expiresAt: new Date('2027-06-30'),
    isActive: true,
  },
  {
    code: 'SUMMER25',
    description: '25% off on Air Conditioners (max ₹5000)',
    discountType: 'percent',
    discountValue: 25,
    maxDiscount: 5000,
    minOrderValue: 20000,
    usageLimit: 50,
    perUserLimit: 1,
    startsAt: new Date(),
    expiresAt: new Date('2027-09-30'),
    isActive: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(config.mongo.uri);
    console.log('✅ Connected to MongoDB');

    // Clean any broken records with null/missing slugs from previous failed seed runs
    await Product.deleteMany({ $or: [{ slug: null }, { slug: { $exists: false } }] });
    await Category.deleteMany({ $or: [{ slug: null }, { slug: { $exists: false } }] });

    // Seed categories
    const categoryMap = {};
    for (const catData of CATEGORIES) {
      let category = await Category.findOne({ name: catData.name });
      if (!category) {
        category = await Category.create(catData);
      }
      categoryMap[catData.name] = category._id;
      console.log(`  📁 Category: ${category.name} (${category.slug})`);
    }

    // Seed products
    for (const prodData of PRODUCTS) {
      const categoryId = categoryMap[prodData.category];
      if (!categoryId) {
        console.warn(`  ⚠️  Category "${prodData.category}" not found for "${prodData.name}"`);
        continue;
      }

      const data = { ...prodData, category: categoryId };
      delete data.category_name;

      let product = await Product.findOne({ sku: data.sku });
      if (!product) {
        product = await Product.create(data);
      }
      console.log(`  📦 Product: ${product.name} (₹${product.price}) [${product.slug}]`);
    }

    // Seed coupons
    for (const couponData of COUPONS) {
      let coupon = await Coupon.findOne({ code: couponData.code });
      if (!coupon) {
        coupon = await Coupon.create(couponData);
      }
      console.log(`  🎫 Coupon: ${coupon.code} — ${coupon.description}`);
    }

    console.log('\n✅ Seed completed successfully!');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

async function destroy() {
  try {
    await mongoose.connect(config.mongo.uri);
    console.log('✅ Connected to MongoDB');

    await Product.deleteMany({});
    console.log('  🗑️  Products deleted');
    await Category.deleteMany({});
    console.log('  🗑️  Categories deleted');
    await Coupon.deleteMany({});
    console.log('  🗑️  Coupons deleted');

    console.log('\n✅ Destroy completed successfully!');
  } catch (err) {
    console.error('❌ Destroy failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

if (isDestroy) {
  destroy();
} else {
  seed();
}
