import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useNavigate } from '../../router/index.jsx';
import { fmtPrice, productImage } from '../../utils/format.js';
import Icon from '../Icon/Icon.jsx';
import './CartDrawer.css';

export default function CartDrawer() {
  const {
    cart, cartOpen, setCartOpen,
    removeFromCart, updateQty, clearCart,
    cartSubtotal, cartDiscount, cartTotal, cartCount,
    appliedCoupon, applyCoupon, removeCoupon, couponError, COUPONS,
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const navigate = useNavigate();
  const { user } = useApp();
  const checkout = () => { setCartOpen(false); navigate(user ? '/checkout' : '/login?next=/checkout'); };

  const handleApplyCoupon = () => {
    applyCoupon(couponInput);
  };

  if (!cartOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={() => setCartOpen(false)} aria-hidden="true" />
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping Cart">
        <div className="cart-drawer__head">
          <h2 className="cart-drawer__title">
            <Icon name="cart" size={20} />
            Cart
            {cartCount > 0 && <span className="cart-drawer__count">{cartCount}</span>}
          </h2>
          <button className="cart-drawer__close" onClick={() => setCartOpen(false)} aria-label="Close cart">
            <Icon name="close" size={22} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-drawer__empty">
            <div className="cart-empty-icon">🛒</div>
            <p>Your cart is empty</p>
            <button className="btn btn-primary btn-sm" onClick={() => setCartOpen(false)}>Continue Shopping</button>
          </div>
        ) : (
          <>
            <div className="cart-drawer__items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item__img">
                    <img src={productImage(item.image)} alt={item.model} loading="lazy" />
                  </div>
                  <div className="cart-item__info">
                    <p className="cart-item__model">{item.model}</p>
                    <p className="cart-item__name">{item.name}</p>
                    <p className="cart-item__price">{fmtPrice(item.price)}</p>
                    <div className="cart-item__qty">
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        aria-label="Decrease quantity"
                        disabled={item.qty <= 1}
                      >−</button>
                      <span className="qty-val num">{item.qty}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        aria-label="Increase quantity"
                      >+</button>
                      <button
                        className="cart-item__remove"
                        onClick={() => removeFromCart(item.id)}
                        aria-label="Remove item"
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="cart-item__subtotal">{fmtPrice(item.price * item.qty)}</p>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="cart-drawer__coupon">
              <p className="cart-drawer__coupon-label">Have a coupon?</p>
              {appliedCoupon ? (
                <div className="coupon-applied">
                  <span className="coupon-applied__badge">🏷 {appliedCoupon.code}</span>
                  <span className="coupon-applied__desc">{appliedCoupon.label}</span>
                  <button className="coupon-applied__remove" onClick={removeCoupon} aria-label="Remove coupon">
                    <Icon name="close" size={14} />
                  </button>
                </div>
              ) : (
                <div className="coupon-input-row">
                  <input
                    className="input coupon-input"
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    id="cart-coupon-input"
                  />
                  <button className="btn btn-ghost btn-sm" onClick={handleApplyCoupon}>Apply</button>
                </div>
              )}
              {couponError && <p className="cart-coupon-error">{couponError}</p>}
            </div>

            {/* Order Summary */}
            <div className="cart-drawer__summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span className="num">{fmtPrice(cartSubtotal)}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="summary-row summary-row--discount">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span className="num">−{fmtPrice(cartDiscount)}</span>
                </div>
              )}
              <div className="summary-row summary-row--total">
                <span>Total (before GST)</span>
                <span className="num">{fmtPrice(cartTotal)}</span>
              </div>
            </div>

            <div className="cart-drawer__actions">
              <button className="btn btn-primary btn-block" id="cart-checkout-btn" onClick={checkout}>
                Proceed to Checkout
              </button>
              <button className="btn btn-ghost btn-block btn-sm cart-drawer__clear" onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
