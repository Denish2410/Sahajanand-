import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadDb, saveDb, resetDb, readSession, writeSession } from '../services/store.js';
import { slugify } from '../utils/format.js';

const AppContext = createContext(null);
export const MAX_COMPARE = 3;
const uid = (p) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const sameLogin = (u, id) => {
  const v = String(id).trim().toLowerCase();
  const digits = v.replace(/\D/g, '');
  return u.email.toLowerCase() === v || (digits.length >= 10 && u.phone.replace(/\D/g, '').endsWith(digits.slice(-10)));
};

export function AppProvider({ children }) {
  // ─── Database (localStorage-backed; see services/store.js) ─────────────────
  const [db, setDb] = useState(loadDb);
  useEffect(() => { saveDb(db); }, [db]);

  // ─── Session ───────────────────────────────────────────────────────────────
  const [sessionId, setSessionId] = useState(readSession);
  const user = useMemo(() => db.users.find((u) => u.id === sessionId && u.status !== 'blocked') || null, [db.users, sessionId]);
  const isAdmin = user?.role === 'admin';

  const log = useCallback((action, by) => {
    setDb((d) => ({ ...d, activity: [{ id: uid('act'), at: new Date().toISOString(), by: by || 'Admin', action }, ...d.activity].slice(0, 200) }));
  }, []);

  // Generic collection helpers used by the admin panel.
  const upsert = useCallback((coll, item, key = 'id', originalKey) => {
    setDb((d) => {
      const match = originalKey ?? item[key];
      const exists = d[coll].some((x) => x[key] === match);
      return { ...d, [coll]: exists ? d[coll].map((x) => (x[key] === match ? { ...x, ...item } : x)) : [item, ...d[coll]] };
    });
  }, []);
  const remove = useCallback((coll, ids, key = 'id') => {
    const set = new Set([].concat(ids));
    setDb((d) => ({ ...d, [coll]: d[coll].filter((x) => !set.has(x[key])) }));
  }, []);
  const setColl = useCallback((coll, value) => setDb((d) => ({ ...d, [coll]: typeof value === 'function' ? value(d[coll]) : value })), []);
  const resetDemo = useCallback(() => { setDb(resetDb()); }, []);
  const importDb = useCallback((data) => { setDb((d) => ({ ...d, ...data, version: d.version })); }, []);

  // ─── Auth ──────────────────────────────────────────────────────────────────
  const login = useCallback((identifier, password, { remember = true, adminOnly = false } = {}) => {
    const u = db.users.find((x) => sameLogin(x, identifier));
    if (!u) return { ok: false, field: 'identifier', error: 'We cannot find an account with that email or mobile number.' };
    if (u.password !== password) return { ok: false, field: 'password', error: 'Your password is incorrect.' };
    if (u.status === 'blocked') return { ok: false, field: 'identifier', error: 'This account has been blocked. Contact customer care.' };
    if (adminOnly && u.role !== 'admin') return { ok: false, field: 'identifier', error: 'This account does not have admin access.' };
    writeSession(u.id, remember); setSessionId(u.id);
    return { ok: true, user: u };
  }, [db.users]);

  const signup = useCallback(({ name, email, phone, password }) => {
    if (db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) return { ok: false, field: 'email', error: 'An account with this email already exists. Sign in instead.' };
    if (db.users.some((u) => u.phone.replace(/\D/g, '').slice(-10) === phone.replace(/\D/g, '').slice(-10))) return { ok: false, field: 'phone', error: 'An account with this mobile number already exists.' };
    const u = { id: uid('u'), role: 'customer', name: name.trim(), email: email.trim(), phone: phone.trim(), password, company: '', gstin: '', status: 'active', addresses: [], createdAt: new Date().toISOString() };
    setDb((d) => ({ ...d, users: [...d.users, u] }));
    writeSession(u.id, true); setSessionId(u.id);
    return { ok: true, user: u };
  }, [db.users]);

  const logout = useCallback(() => { writeSession(null); setSessionId(null); }, []);
  const updateProfile = useCallback((patch) => { if (user) upsert('users', { id: user.id, ...patch }); }, [user, upsert]);

  // ─── Storefront catalogue (drafts hidden) ──────────────────────────────────
  const products = useMemo(() => db.products.filter((p) => p.status !== 'draft'), [db.products]);
  const categories = db.categories;
  const offers = useMemo(() => db.offers.filter((o) => o.active !== false), [db.offers]);
  const today = new Date().toISOString().slice(0, 10);
  const COUPONS = useMemo(() => db.coupons.filter((c) => c.active && (!c.expires || c.expires >= today)), [db.coupons, today]);

  // ─── Quote modal, compare ──────────────────────────────────────────────────
  const [quote, setQuote] = useState({ open: false, model: '' });
  const openQuote = useCallback((model = '') => setQuote({ open: true, model }), []);
  const closeQuote = useCallback(() => setQuote((q) => ({ ...q, open: false })), []);

  const [compare, setCompare] = useState([]);
  const [notice, setNotice] = useState('');
  const toggleCompare = useCallback((id) => {
    setCompare((list) => {
      if (list.includes(id)) return list.filter((x) => x !== id);
      if (list.length >= MAX_COMPARE) { setNotice(`You can compare up to ${MAX_COMPARE} products. Remove one to add another.`); return list; }
      return [...list, id];
    });
  }, []);
  const clearCompare = useCallback(() => setCompare([]), []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  // ─── Enquiries ─────────────────────────────────────────────────────────────
  const addEnquiry = useCallback((values) => {
    let reference = '';
    setDb((d) => {
      reference = `ENQ-${d.seq.enquiry}`;
      const e = { id: reference, reference, ...values, status: 'New', notes: '', userId: user?.id || '', createdAt: new Date().toISOString() };
      return { ...d, enquiries: [e, ...d.enquiries], seq: { ...d.seq, enquiry: d.seq.enquiry + 1 } };
    });
    return reference || `ENQ-${db.seq.enquiry}`;
  }, [user, db.seq.enquiry]);

  // ─── Cart ──────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const addToCart = useCallback((product, qty = 1) => {
    if (product.stock === 0) { setNotice(`${product.model} is out of stock. Request a quote for lead time.`); return; }
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { ...product, qty }];
    });
    setCartOpen(true);
  }, []);
  const removeFromCart = useCallback((id) => setCart((prev) => prev.filter((i) => i.id !== id)), []);
  const updateQty = useCallback((id, qty) => { if (qty >= 1) setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i))); }, []);
  const clearCart = useCallback(() => { setCart([]); setAppliedCoupon(null); setCouponError(''); }, []);
  const cartSubtotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.qty, 0), [cart]);

  const applyCoupon = useCallback((code) => {
    const coupon = COUPONS.find((c) => c.code === code.toUpperCase().trim());
    if (!coupon) { setCouponError('Invalid or expired coupon code.'); setAppliedCoupon(null); return; }
    if (coupon.minOrder && cartSubtotal < coupon.minOrder) {
      setCouponError(`Minimum order ₹${coupon.minOrder.toLocaleString('en-IN')} required for this coupon.`); setAppliedCoupon(null); return;
    }
    if (coupon.category && !cart.some((i) => i.category === coupon.category)) {
      setCouponError(`This coupon is only valid for ${coupon.category.replace(/-/g, ' ')} products.`); setAppliedCoupon(null); return;
    }
    setAppliedCoupon(coupon); setCouponError('');
  }, [COUPONS, cart, cartSubtotal]);
  const removeCoupon = useCallback(() => { setAppliedCoupon(null); setCouponError(''); }, []);

  const cartDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.type === 'percent' ? Math.round(cartSubtotal * appliedCoupon.discount) : Math.min(appliedCoupon.discount, cartSubtotal);
  }, [appliedCoupon, cartSubtotal]);
  const cartTotal = useMemo(() => Math.max(0, cartSubtotal - cartDiscount), [cartSubtotal, cartDiscount]);
  const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.qty, 0), [cart]);
  const cartTax = Math.round((cartTotal * db.settings.gstPercent) / 100);
  const cartShipping = cart.length === 0 || cartSubtotal >= db.settings.freeShippingAbove ? 0 : db.settings.shippingFlat;
  const cartGrandTotal = cartTotal + cartTax + cartShipping;

  // ─── Orders ────────────────────────────────────────────────────────────────
  const placeOrder = useCallback(({ address, paymentMethod, note }) => {
    if (!user || cart.length === 0) return null;
    const id = `EP-${db.seq.order}`;
    const now = new Date().toISOString();
    const order = {
      id, userId: user.id,
      customer: { name: user.name, email: user.email, phone: user.phone, company: user.company, gstin: user.gstin },
      items: cart.map(({ id: pid, model, name, image, price, qty, category }) => ({ id: pid, model, name, image, price, qty, category })),
      address, paymentMethod, paymentStatus: 'Pending', couponCode: appliedCoupon?.code || '',
      subtotal: cartSubtotal, discount: cartDiscount, tax: cartTax, shipping: cartShipping, total: cartGrandTotal,
      status: 'Placed', history: [{ status: 'Placed', at: now, by: user.name }], note: note || '', createdAt: now,
    };
    setDb((d) => ({
      ...d,
      orders: [order, ...d.orders],
      seq: { ...d.seq, order: d.seq.order + 1 },
      products: d.products.map((p) => {
        const l = cart.find((i) => i.id === p.id);
        return l ? { ...p, stock: Math.max(0, (p.stock ?? 0) - l.qty) } : p;
      }),
      coupons: d.coupons.map((c) => (c.code === appliedCoupon?.code ? { ...c, used: (c.used || 0) + 1 } : c)),
    }));
    clearCart();
    return id;
  }, [user, cart, db.seq.order, appliedCoupon, cartSubtotal, cartDiscount, cartTax, cartShipping, cartGrandTotal, clearCart]);

  const updateOrder = useCallback((id, patch, by) => {
    setDb((d) => ({
      ...d,
      orders: d.orders.map((o) => {
        if (o.id !== id) return o;
        const history = patch.status && patch.status !== o.status ? [...o.history, { status: patch.status, at: new Date().toISOString(), by: by || 'Admin' }] : o.history;
        return { ...o, ...patch, history };
      }),
      // Cancelling returns the stock.
      products: patch.status === 'Cancelled'
        ? d.products.map((p) => {
            const o = d.orders.find((x) => x.id === id);
            const l = o && o.status !== 'Cancelled' ? o.items.find((i) => i.id === p.id) : null;
            return l ? { ...p, stock: (p.stock ?? 0) + l.qty } : p;
          })
        : d.products,
    }));
  }, []);

  const uniqueProductId = useCallback((model, currentId) => {
    let base = slugify(model) || 'product'; let id = base; let n = 2;
    while (db.products.some((p) => p.id === id && p.id !== currentId)) id = `${base}-${n++}`;
    return id;
  }, [db.products]);

  const value = {
    db, upsert, remove, setColl, log, resetDemo, importDb, uniqueProductId,
    user, isAdmin, login, signup, logout, updateProfile,
    products, categories, offers, settings: db.settings,
    quote, openQuote, closeQuote, addEnquiry,
    compare, toggleCompare, clearCompare, notice, setNotice,
    cart, cartOpen, setCartOpen, addToCart, removeFromCart, updateQty, clearCart,
    cartSubtotal, cartDiscount, cartTotal, cartCount, cartTax, cartShipping, cartGrandTotal,
    appliedCoupon, applyCoupon, removeCoupon, couponError, COUPONS,
    placeOrder, updateOrder,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
