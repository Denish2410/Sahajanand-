import { useEffect, useState } from 'react';
import { Link, useNavigate } from '../../router/index.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { PAYMENT_METHODS } from '../../services/store.js';
import { fmtPrice, productImage } from '../../utils/format.js';
import { AddressForm } from '../Account/Account.jsx';
import './Checkout.css';

export default function Checkout() {
  const { user, cart, upsert, placeOrder, settings, cartSubtotal, cartDiscount, cartTax, cartShipping, cartGrandTotal, appliedCoupon, updateQty, removeFromCart } = useApp();
  const navigate = useNavigate();
  const [addrId, setAddrId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [placed, setPlaced] = useState(null);

  useEffect(() => { if (!user) navigate('/login?next=/checkout', { replace: true }); }, [user, navigate]);
  useEffect(() => {
    if (user && !addrId) setAddrId((user.addresses.find((a) => a.isDefault) || user.addresses[0])?.id || null);
  }, [user, addrId]);
  if (!user) return null;

  if (placed) {
    return (
      <div className="wrap section">
        <div className="empty co__done">
          <span className="quote-done__icon co__tick">✓</span>
          <h1>Order placed, thank you.</h1>
          <p>Your order <strong className="num">{placed}</strong> has been received. The sales team will confirm it and share payment details at {user.email}.</p>
          <div className="acct__actions" style={{ justifyContent: 'center' }}>
            <Link to="/account/orders" className="btn btn-primary">Track your order</Link>
            <Link to="/products" className="btn btn-ghost">Continue shopping</Link>
          </div>
        </div>
      </div>
    );
  }
  if (cart.length === 0) {
    return <div className="wrap section"><div className="empty"><h1 style={{ fontSize: 'var(--fs-4)' }}>Your cart is empty</h1><p className="muted">Add products to your cart to check out.</p><Link to="/products" className="btn btn-primary">Browse products</Link></div></div>;
  }

  const address = user.addresses.find((a) => a.id === addrId);
  const saveAddr = (a) => {
    upsert('users', { id: user.id, addresses: [...user.addresses, { ...a, isDefault: user.addresses.length === 0 }] });
    setAddrId(a.id); setAdding(false); setError('');
  };
  const submit = () => {
    if (!address) return setError('Choose or add a delivery address to place the order.');
    const id = placeOrder({ address, paymentMethod: method, note });
    if (id) { setPlaced(id); window.scrollTo(0, 0); }
  };

  return (
    <div className="wrap co">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><span>Checkout</span></nav>
      <h1>Checkout</h1>
      <div className="co__grid">
        <div className="co__steps">
          <section className="co__step">
            <h2><span>1</span> Delivery address</h2>
            {user.addresses.map((a) => (
              <label key={a.id} className={`co__opt ${addrId === a.id ? 'is-on' : ''}`}>
                <input type="radio" name="addr" checked={addrId === a.id} onChange={() => { setAddrId(a.id); setError(''); }} />
                <span><strong>{a.name}</strong> {a.line1}{a.line2 && `, ${a.line2}`}, {a.city}, {a.state} {a.pincode}. Phone: {a.phone}</span>
              </label>
            ))}
            {adding || user.addresses.length === 0
              ? <AddressForm initial={{ name: user.name, phone: user.phone }} onSave={saveAddr} onCancel={user.addresses.length ? () => setAdding(false) : undefined} />
              : <button className="auth__link" onClick={() => setAdding(true)}>+ Add a new address</button>}
          </section>

          <section className="co__step">
            <h2><span>2</span> Payment method</h2>
            {PAYMENT_METHODS.map((m) => (
              <label key={m} className={`co__opt ${method === m ? 'is-on' : ''}`}>
                <input type="radio" name="pay" checked={method === m} onChange={() => setMethod(m)} /><span>{m}</span>
              </label>
            ))}
            <p className="muted co__small">No payment is taken in this prototype. The sales team confirms the order and shares payment details.</p>
          </section>

          <section className="co__step">
            <h2><span>3</span> Review items</h2>
            <ul className="co__items">
              {cart.map((i) => (
                <li key={i.id}>
                  <img src={productImage(i.image)} alt="" />
                  <div><strong>{i.model}</strong><span>{i.name}</span><span className="num">{fmtPrice(i.price)} each</span></div>
                  <div className="co__qty">
                    <button onClick={() => updateQty(i.id, i.qty - 1)} disabled={i.qty <= 1} aria-label={`Decrease ${i.model}`}>−</button>
                    <span className="num">{i.qty}</span>
                    <button onClick={() => updateQty(i.id, i.qty + 1)} aria-label={`Increase ${i.model}`}>+</button>
                    <button className="auth__link" onClick={() => removeFromCart(i.id)}>Remove</button>
                  </div>
                  <strong className="num">{fmtPrice(i.price * i.qty)}</strong>
                </li>
              ))}
            </ul>
            <div className="field"><label htmlFor="co-note">Order note (optional)</label><textarea id="co-note" className="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Delivery timing, site access, installation needs" /></div>
          </section>
        </div>

        <aside className="co__summary">
          <button className="btn btn-primary btn-block" onClick={submit}>Place your order</button>
          {error && <p className="field-error" role="alert">{error}</p>}
          <h2>Order summary</h2>
          <dl>
            <div><dt>Items ({cart.reduce((n, i) => n + i.qty, 0)})</dt><dd className="num">{fmtPrice(cartSubtotal)}</dd></div>
            {cartDiscount > 0 && <div className="co__disc"><dt>Coupon {appliedCoupon?.code}</dt><dd className="num">−{fmtPrice(cartDiscount)}</dd></div>}
            <div><dt>GST ({settings.gstPercent}%)</dt><dd className="num">{fmtPrice(cartTax)}</dd></div>
            <div><dt>Shipping</dt><dd className="num">{cartShipping ? fmtPrice(cartShipping) : 'Free'}</dd></div>
            <div className="co__total"><dt>Order total</dt><dd className="num">{fmtPrice(cartGrandTotal)}</dd></div>
          </dl>
          {cartShipping > 0 && <p className="muted co__small">Free shipping on orders above {fmtPrice(settings.freeShippingAbove)}.</p>}
          {address && <p className="co__small"><strong>Delivering to</strong> {address.name}, {address.city} {address.pincode}</p>}
        </aside>
      </div>
    </div>
  );
}
