// Browser "database" for the prototype. Everything the admin panel edits
// (products, categories, orders, enquiries, customers, coupons, banners,
// settings) is kept in localStorage so it survives a refresh.
// DEMO ONLY: passwords are stored in plain text in the browser. Replace this
// file with real API calls (see services/api.js) before going live.
import { products as seedProducts } from '../data/products.js';
import { categories as seedCategories } from '../data/categories.js';
import { offers as seedOffers } from '../data/offers.js';
import { company } from '../data/company.js';

const KEY = 'elanpro:db';
const VERSION = 3; // bump to force a re-seed after changing the seed data

export const DEMO_USER = { email: 'user@elanpro-demo.com', phone: '9876543210', password: 'Demo@123' };
export const DEMO_ADMIN = { email: 'admin@elanpro-demo.com', phone: '9000000001', password: 'Admin@123' };

export const ORDER_STATUSES = ['Placed', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'];
export const PAYMENT_STATUSES = ['Pending', 'Paid', 'Refunded'];
export const ENQUIRY_STATUSES = ['New', 'Contacted', 'Quoted', 'Won', 'Lost'];
export const PAYMENT_METHODS = ['Bank transfer (NEFT / RTGS)', 'UPI', 'Pay on delivery', 'Request proforma invoice'];

const daysAgo = (d, h = 0) => new Date(Date.now() - d * 864e5 - h * 36e5).toISOString();

function seed() {
  const products = seedProducts.map((p, i) => ({
    ...p,
    stock: [12, 8, 3, 15, 0, 20, 6, 9, 2, 14][i % 10],
    status: 'active',
    featured: i % 5 === 0,
    mrp: Math.round((p.price * 1.12) / 100) * 100,
    createdAt: daysAgo(60 - i),
  }));
  const P = (model) => products.find((p) => p.model === model);
  const line = (model, qty) => {
    const p = P(model);
    return { id: p.id, model: p.model, name: p.name, image: p.image, price: p.price, qty, category: p.category };
  };
  const addr = (name, phone, line1, city, state, pin) => ({ id: `a${pin}`, name, phone, line1, line2: '', city, state, pincode: pin, isDefault: true });

  const users = [
    { id: 'u-admin', role: 'admin', name: 'Store Admin', email: DEMO_ADMIN.email, phone: DEMO_ADMIN.phone, password: DEMO_ADMIN.password, company: company.legalName, gstin: '', status: 'active', addresses: [], createdAt: daysAgo(120) },
    { id: 'u-demo', role: 'customer', name: 'Demo Customer', email: DEMO_USER.email, phone: DEMO_USER.phone, password: DEMO_USER.password, company: 'Demo Hospitality Pvt. Ltd.', gstin: '24ABCDE1234F1Z5', status: 'active', addresses: [addr('Demo Customer', '9876543210', '14 Riverfront Road, Sector 21', 'Gandhinagar', 'Gujarat', '382021')], createdAt: daysAgo(45) },
    { id: 'u-asha', role: 'customer', name: 'Asha Rao', email: 'asha.rao@example.com', phone: '9812345670', password: 'Asha@123', company: 'Rao Hospitality', gstin: '', status: 'active', addresses: [addr('Asha Rao', '9812345670', '8 MG Road', 'Bengaluru', 'Karnataka', '560001')], createdAt: daysAgo(30) },
    { id: 'u-imran', role: 'customer', name: 'Imran Sheikh', email: 'imran@example.com', phone: '9822001100', password: 'Imran@123', company: 'Cafe Marina', gstin: '', status: 'active', addresses: [addr('Imran Sheikh', '9822001100', '221 Linking Road, Bandra', 'Mumbai', 'Maharashtra', '400050')], createdAt: daysAgo(18) },
    { id: 'u-blocked', role: 'customer', name: 'Test Blocked', email: 'blocked@example.com', phone: '9000000002', password: 'Blocked@123', company: '', gstin: '', status: 'blocked', addresses: [], createdAt: daysAgo(10) },
  ];

  const settings = {
    storeName: 'Elanpro',
    announcement: `Commercial refrigeration since ${company.established}`,
    supportPhone: company.phones[0],
    supportEmail: company.email,
    heroTitle: 'Every temperature your business runs on.',
    heroLede: 'From −35°C blast chillers to 22°C wine storage: commercial refrigeration for kitchens, bars, retail, ice and vending, from a name India has trusted since 2009.',
    gstPercent: 18,
    shippingFlat: 2500,
    freeShippingAbove: 100000,
    lowStockThreshold: 3,
    allowGuestEnquiry: true,
    maintenanceMode: false,
  };

  const mkOrder = (n, userId, lines, status, payStatus, method, d, coupon) => {
    const u = users.find((x) => x.id === userId);
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const discount = coupon ? Math.round(subtotal * 0.1) : 0;
    const tax = Math.round(((subtotal - discount) * settings.gstPercent) / 100);
    const shipping = subtotal >= settings.freeShippingAbove ? 0 : settings.shippingFlat;
    const flow = ORDER_STATUSES.slice(0, Math.max(1, ORDER_STATUSES.indexOf(status) + 1)).filter((s) => s !== 'Cancelled');
    const history = (status === 'Cancelled' ? ['Placed', 'Cancelled'] : flow).map((s, i) => ({ status: s, at: daysAgo(d, -i * 20), by: i === 0 ? u.name : 'Store Admin' }));
    return {
      id: `EP-${n}`, userId, customer: { name: u.name, email: u.email, phone: u.phone, company: u.company, gstin: u.gstin },
      items: lines, address: u.addresses[0], paymentMethod: method, paymentStatus: payStatus,
      couponCode: coupon || '', subtotal, discount, tax, shipping, total: subtotal - discount + tax + shipping,
      status, history, note: '', createdAt: daysAgo(d),
    };
  };
  const orders = [
    mkOrder(10001, 'u-demo', [line('EGN 1500 C4', 1), line('EGN 2100 C', 2)], 'Delivered', 'Paid', PAYMENT_METHODS[0], 21),
    mkOrder(10002, 'u-asha', [line('EWG 130 D', 1), line('EBB 2D / 2D SS', 2)], 'Delivered', 'Paid', PAYMENT_METHODS[1], 12, 'ELAN10'),
    mkOrder(10003, 'u-imran', [line('EIM 101', 1)], 'Dispatched', 'Paid', PAYMENT_METHODS[0], 5),
    mkOrder(10004, 'u-demo', [line('ED10', 1)], 'Confirmed', 'Pending', PAYMENT_METHODS[3], 3),
    mkOrder(10005, 'u-asha', [line('Galaxy', 1), line('Orion', 1)], 'Placed', 'Pending', PAYMENT_METHODS[0], 1),
    mkOrder(10006, 'u-imran', [line('ECG 305', 3)], 'Cancelled', 'Refunded', PAYMENT_METHODS[1], 8),
    mkOrder(10007, 'u-demo', [line('EFGV 1000', 1), line('EKG 650 G', 2)], 'Placed', 'Pending', PAYMENT_METHODS[2], 0),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const enq = (n, d, name, companyName, email, phone, city, product, quantity, message, status, notes = '') => ({
    id: `ENQ-${n}`, reference: `ENQ-${n}`, name, company: companyName, email, phone, city, product, quantity, message, status, notes, createdAt: daysAgo(d),
  });
  const enquiries = [
    enq(2001, 0, 'Demo Customer', 'Demo Hospitality Pvt. Ltd.', DEMO_USER.email, DEMO_USER.phone, 'Gandhinagar', 'EIM 201', '2', 'Need two ice machines for a banquet kitchen. Please share lead time.', 'New'),
    enq(2002, 2, 'Kavita Menon', 'Spice Route Restaurants', 'kavita@example.com', '9845011223', 'Kochi', 'ED10', '1', 'Looking for a blast chiller with installation.', 'Contacted', 'Called on day 1, wants a site visit.'),
    enq(2003, 4, 'Rahul Verma', 'Brew Dock', 'rahul@example.com', '9911002200', 'Pune', 'EWG 130 D', '4', 'Four wine coolers for a new bar. Bulk pricing?', 'Quoted', 'Quote sent at 8% volume discount.'),
    enq(2004, 9, 'Sana Qureshi', 'FreshMart', 'sana@example.com', '9700011122', 'Hyderabad', 'ECG 1506', '6', 'Upright chillers for three stores.', 'Won', 'PO received.'),
    enq(2005, 15, 'Vikram Shah', 'TechPark Facilities', 'vikram@example.com', '9898989898', 'Ahmedabad', 'Galaxy', '10', 'Vending machines for office campus.', 'Lost', 'Went with a rental model.'),
  ];

  const coupons = [
    { code: 'ELAN10', label: '10% Off', description: '10% off on your first order', discount: 0.10, type: 'percent', minOrder: 0, category: '', active: true, expires: '', used: 1 },
    { code: 'FLAT2000', label: '₹2,000 Off', description: '₹2,000 flat discount on orders above ₹50,000', discount: 2000, type: 'flat', minOrder: 50000, category: '', active: true, expires: '', used: 0 },
    { code: 'KITCHEN15', label: '15% Off Kitchen', description: '15% off on all Professional Kitchen products', discount: 0.15, type: 'percent', minOrder: 0, category: 'professional-kitchen', active: true, expires: '', used: 0 },
    { code: 'BARFEST', label: '₹1,500 Off Bar', description: '₹1,500 off on Bar Refrigeration products', discount: 1500, type: 'flat', minOrder: 30000, category: 'bar-refrigeration', active: true, expires: '', used: 0 },
    { code: 'ICEDEAL', label: '12% Off Ice', description: '12% off on all Ice Machine orders', discount: 0.12, type: 'percent', minOrder: 0, category: 'ice-machine', active: true, expires: '', used: 0 },
  ];

  return {
    version: VERSION,
    products,
    categories: seedCategories.map((c) => ({ ...c })),
    offers: seedOffers.map((o, i) => ({ id: `offer-${i + 1}`, active: true, ...o })),
    coupons, users, orders, enquiries, settings,
    activity: [{ id: 'act-0', at: daysAgo(0, 1), by: 'System', action: 'Demo data created' }],
    seq: { order: 10008, enquiry: 2006 },
  };
}

export function loadDb() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const db = JSON.parse(raw);
      if (db.version === VERSION) return db;
    }
  } catch { /* storage unavailable or corrupted: fall through to a fresh seed */ }
  const fresh = seed();
  saveDb(fresh);
  return fresh;
}
export function saveDb(db) {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* quota or private mode: keep working in memory */ }
}
export function resetDb() {
  const fresh = seed();
  saveDb(fresh);
  return fresh;
}

const SESSION = 'elanpro:session';
export const readSession = () => {
  try { return localStorage.getItem(SESSION) || sessionStorage.getItem(SESSION) || null; } catch { return null; }
};
export const writeSession = (userId, remember) => {
  try {
    localStorage.removeItem(SESSION); sessionStorage.removeItem(SESSION);
    if (userId) (remember ? localStorage : sessionStorage).setItem(SESSION, userId);
  } catch { /* ignore */ }
};
