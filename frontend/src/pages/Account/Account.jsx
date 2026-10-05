import { useEffect, useState } from 'react';
import { Link, useNavigate } from '../../router/index.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { ORDER_STATUSES } from '../../services/store.js';
import { fmtPrice, fmtDate, fmtDateTime, productImage } from '../../utils/format.js';
import './Account.css';

const TABS = [['overview', 'Overview'], ['orders', 'Your orders'], ['enquiries', 'Your enquiries'], ['addresses', 'Addresses'], ['profile', 'Login & security']];
const EMPTY_ADDR = { name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' };

export function AddressForm({ initial, onSave, onCancel }) {
  const [a, setA] = useState({ ...EMPTY_ADDR, ...initial });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setA((x) => ({ ...x, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    if (!a.name.trim() || !a.line1.trim() || !a.city.trim() || !a.state.trim()) return setErr('Fill in name, address, city and state.');
    if (a.phone.replace(/\D/g, '').length < 10) return setErr('Enter a 10-digit phone number.');
    if (!/^\d{6}$/.test(a.pincode.trim())) return setErr('Enter a 6-digit PIN code.');
    onSave({ ...a, id: a.id || `a-${Date.now().toString(36)}` });
  };
  const f = (k, label, wide, props = {}) => (
    <div className={`field ${wide ? 'acct__wide' : ''}`}><label htmlFor={`ad-${k}`}>{label}</label><input id={`ad-${k}`} className="input" value={a[k]} onChange={set(k)} {...props} /></div>
  );
  return (
    <form className="acct__form" onSubmit={submit} noValidate>
      {f('name', 'Full name')}{f('phone', 'Phone', false, { type: 'tel', inputMode: 'tel' })}
      {f('line1', 'Address (building, street)', true)}{f('line2', 'Area, landmark (optional)', true)}
      {f('city', 'City')}{f('state', 'State')}{f('pincode', 'PIN code', false, { inputMode: 'numeric' })}
      {err && <p className="field-error acct__wide" role="alert">{err}</p>}
      <div className="acct__actions acct__wide">
        <button className="btn btn-primary btn-sm">Save address</button>
        {onCancel && <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

export function OrderTracker({ order }) {
  if (order.status === 'Cancelled') return <p className="pill pill--bad">Cancelled</p>;
  const steps = ORDER_STATUSES.filter((s) => s !== 'Cancelled');
  const at = steps.indexOf(order.status);
  return (
    <ol className="tracker">
      {steps.map((s, i) => {
        const h = order.history.find((x) => x.status === s);
        return <li key={s} className={i <= at ? 'is-done' : ''}><span>{s}</span>{h && <small>{fmtDateTime(h.at)}</small>}</li>;
      })}
    </ol>
  );
}

export default function Account({ params }) {
  const { user, db, logout, updateProfile, updateOrder, upsert } = useApp();
  const navigate = useNavigate();
  const tab = params.tab || 'overview';
  const [editing, setEditing] = useState(null);
  const [openOrder, setOpenOrder] = useState(params.id || null);
  const [msg, setMsg] = useState('');
  const [profile, setProfile] = useState(null);
  const [pw, setPw] = useState({ current: '', next: '' });

  useEffect(() => { if (!user) navigate('/login?next=/account', { replace: true }); }, [user, navigate]);
  useEffect(() => { if (user) setProfile({ name: user.name, phone: user.phone, company: user.company, gstin: user.gstin }); }, [user]);
  useEffect(() => { setMsg(''); setEditing(null); }, [tab]);
  if (!user || !profile) return null;

  const orders = db.orders.filter((o) => o.userId === user.id);
  const enquiries = db.enquiries.filter((e) => e.userId === user.id || e.email.toLowerCase() === user.email.toLowerCase());
  const saveAddresses = (addresses) => upsert('users', { id: user.id, addresses });
  const saveAddr = (a) => {
    const exists = user.addresses.some((x) => x.id === a.id);
    let list = exists ? user.addresses.map((x) => (x.id === a.id ? a : x)) : [...user.addresses, a];
    if (list.length === 1) list = [{ ...list[0], isDefault: true }];
    saveAddresses(list); setEditing(null);
  };

  return (
    <div className="wrap acct">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><span>Your account</span></nav>
      <div className="acct__grid">
        <aside className="acct__side">
          <p className="acct__hello">Hello, <strong>{user.name}</strong></p>
          <ul>
            {TABS.map(([k, label]) => <li key={k}><Link to={k === 'overview' ? '/account' : `/account/${k}`} aria-current={tab === k ? 'page' : undefined}>{label}</Link></li>)}
            {user.role === 'admin' && <li><Link to="/admin">Admin panel</Link></li>}
            <li><button onClick={() => { logout(); navigate('/'); }}>Sign out</button></li>
          </ul>
        </aside>

        <section className="acct__main">
          {tab === 'overview' && (
            <>
              <h1>Your account</h1>
              <div className="acct__cards">
                <Link to="/account/orders"><strong className="num">{orders.length}</strong><span>Orders</span><small>Track, view or cancel</small></Link>
                <Link to="/account/enquiries"><strong className="num">{enquiries.length}</strong><span>Enquiries</span><small>Quotes you requested</small></Link>
                <Link to="/account/addresses"><strong className="num">{user.addresses.length}</strong><span>Addresses</span><small>Delivery locations</small></Link>
                <Link to="/account/profile"><strong>Profile</strong><span>Login & security</span><small>Name, phone, password</small></Link>
              </div>
              {orders[0] && (
                <div className="acct__panel">
                  <h2>Latest order {orders[0].id}</h2>
                  <OrderTracker order={orders[0]} />
                  <Link to="/account/orders" className="text-link">View all orders</Link>
                </div>
              )}
            </>
          )}

          {tab === 'orders' && (
            <>
              <h1>Your orders</h1>
              {orders.length === 0 ? (
                <div className="empty"><h3>No orders yet</h3><p className="muted">Products you order will appear here.</p><Link to="/products" className="btn btn-primary">Browse products</Link></div>
              ) : orders.map((o) => (
                <article key={o.id} className="order">
                  <header>
                    <div><small>Order placed</small><span>{fmtDate(o.createdAt)}</span></div>
                    <div><small>Total</small><span className="num">{fmtPrice(o.total)}</span></div>
                    <div><small>Ship to</small><span>{o.address?.name}, {o.address?.city}</span></div>
                    <div className="order__id"><small>Order</small><span className="num">{o.id}</span></div>
                  </header>
                  <div className="order__body">
                    <OrderTracker order={o} />
                    <ul className="order__items">
                      {o.items.map((i) => (
                        <li key={i.id}><img src={productImage(i.image)} alt="" /><div><Link to={`/product/${i.id}`}><strong>{i.model}</strong></Link><span>{i.name}</span></div><span className="num">{i.qty} × {fmtPrice(i.price)}</span></li>
                      ))}
                    </ul>
                    {openOrder === o.id && (
                      <dl className="order__sum">
                        <div><dt>Subtotal</dt><dd className="num">{fmtPrice(o.subtotal)}</dd></div>
                        {o.discount > 0 && <div><dt>Discount {o.couponCode && `(${o.couponCode})`}</dt><dd className="num">−{fmtPrice(o.discount)}</dd></div>}
                        <div><dt>GST</dt><dd className="num">{fmtPrice(o.tax)}</dd></div>
                        <div><dt>Shipping</dt><dd className="num">{o.shipping ? fmtPrice(o.shipping) : 'Free'}</dd></div>
                        <div><dt>Payment</dt><dd>{o.paymentMethod} ({o.paymentStatus})</dd></div>
                        <div><dt>Deliver to</dt><dd>{[o.address?.line1, o.address?.line2, o.address?.city, o.address?.state, o.address?.pincode].filter(Boolean).join(', ')}</dd></div>
                      </dl>
                    )}
                    <div className="acct__actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setOpenOrder(openOrder === o.id ? null : o.id)}>{openOrder === o.id ? 'Hide details' : 'View order details'}</button>
                      {o.status === 'Placed' && <button className="btn btn-ghost btn-sm" onClick={() => window.confirm(`Cancel order ${o.id}?`) && updateOrder(o.id, { status: 'Cancelled' }, user.name)}>Cancel order</button>}
                    </div>
                  </div>
                </article>
              ))}
            </>
          )}

          {tab === 'enquiries' && (
            <>
              <h1>Your enquiries</h1>
              {enquiries.length === 0 ? (
                <div className="empty"><h3>No enquiries yet</h3><p className="muted">Use Request a quote on any product to start one.</p></div>
              ) : (
                <div className="acct__table"><table>
                  <thead><tr><th>Reference</th><th>Date</th><th>Product</th><th>Qty</th><th>Status</th></tr></thead>
                  <tbody>{enquiries.map((e) => <tr key={e.id}><td className="num">{e.reference}</td><td>{fmtDate(e.createdAt)}</td><td>{e.product || 'General enquiry'}</td><td className="num">{e.quantity}</td><td><span className={`pill pill--${e.status.toLowerCase()}`}>{e.status}</span></td></tr>)}</tbody>
                </table></div>
              )}
            </>
          )}

          {tab === 'addresses' && (
            <>
              <h1>Your addresses</h1>
              {editing ? <div className="acct__panel"><h2>{editing.id ? 'Edit address' : 'Add an address'}</h2><AddressForm initial={editing} onSave={saveAddr} onCancel={() => setEditing(null)} /></div> : (
                <div className="acct__addr">
                  <button className="acct__addr-add" onClick={() => setEditing({})}>+ Add address</button>
                  {user.addresses.map((a) => (
                    <div key={a.id} className="acct__addr-card">
                      {a.isDefault && <span className="pill pill--ok">Default</span>}
                      <strong>{a.name}</strong>
                      <p>{a.line1}{a.line2 && `, ${a.line2}`}<br />{a.city}, {a.state} {a.pincode}<br />Phone: {a.phone}</p>
                      <div className="acct__actions">
                        <button className="auth__link" onClick={() => setEditing(a)}>Edit</button>
                        <button className="auth__link" onClick={() => saveAddresses(user.addresses.filter((x) => x.id !== a.id))}>Remove</button>
                        {!a.isDefault && <button className="auth__link" onClick={() => saveAddresses(user.addresses.map((x) => ({ ...x, isDefault: x.id === a.id })))}>Set as default</button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'profile' && (
            <>
              <h1>Login & security</h1>
              {msg && <p className="acct__msg" role="status">{msg}</p>}
              <div className="acct__panel">
                <h2>Profile</h2>
                <form className="acct__form" onSubmit={(e) => { e.preventDefault(); if (!profile.name.trim()) return setMsg('Name cannot be empty.'); updateProfile(profile); setMsg('Profile saved.'); }}>
                  <div className="field"><label htmlFor="pf-name">Name</label><input id="pf-name" className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
                  <div className="field"><label htmlFor="pf-phone">Mobile number</label><input id="pf-phone" className="input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
                  <div className="field"><label htmlFor="pf-email">Email (cannot be changed)</label><input id="pf-email" className="input" value={user.email} disabled /></div>
                  <div className="field"><label htmlFor="pf-co">Company</label><input id="pf-co" className="input" value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} /></div>
                  <div className="field"><label htmlFor="pf-gst">GSTIN</label><input id="pf-gst" className="input" value={profile.gstin} onChange={(e) => setProfile({ ...profile, gstin: e.target.value.toUpperCase() })} /></div>
                  <div className="acct__actions acct__wide"><button className="btn btn-primary btn-sm">Save profile</button></div>
                </form>
              </div>
              <div className="acct__panel">
                <h2>Change password</h2>
                <form className="acct__form" onSubmit={(e) => {
                  e.preventDefault();
                  if (pw.current !== user.password) return setMsg('Current password is incorrect.');
                  if (pw.next.length < 6) return setMsg('New password must be at least 6 characters.');
                  updateProfile({ password: pw.next }); setPw({ current: '', next: '' }); setMsg('Password changed.');
                }}>
                  <div className="field"><label htmlFor="pw-cur">Current password</label><input id="pw-cur" type="password" className="input" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" /></div>
                  <div className="field"><label htmlFor="pw-new">New password</label><input id="pw-new" type="password" className="input" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" /></div>
                  <div className="acct__actions acct__wide"><button className="btn btn-ghost btn-sm">Change password</button></div>
                </form>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
