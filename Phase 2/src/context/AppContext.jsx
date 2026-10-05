import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, apiEnabled } from '../services/api.js';
import { products as localProducts } from '../data/products.js';
import { categories as localCategories } from '../data/categories.js';

const AppContext = createContext(null);
export const MAX_COMPARE = 3;

// ─── Available coupons ────────────────────────────────────────────────────────
export const COUPONS = [
  { code: 'ELAN10', label: '10% Off', description: '10% off on your first order', discount: 0.10, type: 'percent' },
  { code: 'FLAT2000', label: '₹2,000 Off', description: '₹2,000 flat discount on orders above ₹50,000', discount: 2000, type: 'flat', minOrder: 50000 },
  { code: 'KITCHEN15', label: '15% Off Kitchen', description: '15% off on all Professional Kitchen products', discount: 0.15, type: 'percent', category: 'professional-kitchen' },
  { code: 'BARFEST', label: '₹1,500 Off Bar', description: '₹1,500 off on Bar Refrigeration products', discount: 1500, type: 'flat', category: 'bar-refrigeration', minOrder: 30000 },
  { code: 'ICEDEAL', label: '12% Off Ice', description: '12% off on all Ice Machine orders', discount: 0.12, type: 'percent', category: 'ice-machine' },
];

export function AppProvider({ children }) {
  // Catalogue: local data first, replaced by the API response when a backend is configured.
  const [products, setProducts] = useState(localProducts);
  const [categories, setCategories] = useState(localCategories);
  useEffect(() => {
    if (!apiEnabled) return;
    Promise.all([api.getProducts(), api.getCategories()])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .catch((err) => console.warn('API unavailable, using local catalogue data.', err));
  }, []);

  const [quote, setQuote] = useState({ open: false, model: '' });
  const openQuote = useCallback((model = '') => setQuote({ open: true, model }), []);
  const closeQuote = useCallback(() => setQuote((q) => ({ ...q, open: false })), []);

  const [compare, setCompare] = useState([]);
  const [notice, setNotice] = useState('');
  const toggleCompare = useCallback((id) => {
    setCompare((list) => {
      if (list.includes(id)) return list.filter((x) => x !== id);
      if (list.length >= MAX_COMPARE) {
        setNotice(`You can compare up to ${MAX_COMPARE} products. Remove one to add another.`);
        return list;
      }
      return [...list, id];
    });
  }, []);
  const clearCompare = useCallback(() => setCompare([]), []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  // ─── Cart ───────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const addToCart = useCallback((product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, { ...product, qty }];
    });
    setCartOpen(true);
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return;
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i));
  }, []);

  const clearCart = useCallback(() => { setCart([]); setAppliedCoupon(null); setCouponError(''); }, []);

  const cartSubtotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.qty, 0), [cart]);

  const applyCoupon = useCallback((code) => {
    const coupon = COUPONS.find((c) => c.code === code.toUpperCase().trim());
    if (!coupon) { setCouponError('Invalid coupon code.'); setAppliedCoupon(null); return; }
    if (coupon.minOrder && cartSubtotal < coupon.minOrder) {
      setCouponError(`Minimum order ₹${coupon.minOrder.toLocaleString('en-IN')} required for this coupon.`);
      setAppliedCoupon(null);
      return;
    }
    // Category-restricted coupon: check if any cart item matches
    if (coupon.category && !cart.some((i) => i.category === coupon.category)) {
      setCouponError(`This coupon is only valid for ${coupon.category.replace(/-/g, ' ')} products.`);
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(coupon);
    setCouponError('');
  }, [cart, cartSubtotal]);

  const removeCoupon = useCallback(() => { setAppliedCoupon(null); setCouponError(''); }, []);

  const cartDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percent') return Math.round(cartSubtotal * appliedCoupon.discount);
    return appliedCoupon.discount;
  }, [appliedCoupon, cartSubtotal]);

  const cartTotal = useMemo(() => Math.max(0, cartSubtotal - cartDiscount), [cartSubtotal, cartDiscount]);
  const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.qty, 0), [cart]);

  const value = useMemo(
    () => ({
      products, categories, quote, openQuote, closeQuote,
      compare, toggleCompare, clearCompare, notice,
      cart, cartOpen, setCartOpen, addToCart, removeFromCart, updateQty, clearCart,
      cartSubtotal, cartDiscount, cartTotal, cartCount,
      appliedCoupon, applyCoupon, removeCoupon, couponError, COUPONS,
    }),
    [products, categories, quote, openQuote, closeQuote,
      compare, toggleCompare, clearCompare, notice,
      cart, cartOpen, addToCart, removeFromCart, updateQty, clearCart,
      cartSubtotal, cartDiscount, cartTotal, cartCount,
      appliedCoupon, applyCoupon, removeCoupon, couponError]
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
