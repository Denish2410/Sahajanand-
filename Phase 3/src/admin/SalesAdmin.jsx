import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '../router/index.jsx';
import { useApp } from '../context/AppContext.jsx';
import { ORDER_STATUSES, PAYMENT_STATUSES, ENQUIRY_STATUSES } from '../services/store.js';
import { fmtPrice, fmtDate, fmtDateTime, productImage } from '../utils/format.js';
import { Head, Pill, Drawer, Text, Area, Select, Pager, usePaged, exportCSV, Empty } from './ui.jsx';

export function OrdersAdmin() {
  const { db, updateOrder, remove, log, user } = useApp();
  const open0 = useQuery().get('open');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [pay, setPay] = useState('');
  const [openId, setOpenId] = useState(open0);
  const [note, setNote] = useState('');
  const rows = useMemo(() => db.orders.filter((o) => (!status || o.status === status) && (!pay || o.paymentStatus === pay)
    && (!q || `${o.id} ${o.customer.name} ${o.customer.email} ${o.customer.phone} ${o.customer.company}`.toLowerCase().includes(q.toLowerCase()))), [db.orders, q, status, pay]);
  const pg = usePaged(rows, 10);
  const o = db.orders.find((x) => x.id === openId);
  useEffect(() => { setNote(o?.note || ''); }, [openId]); // eslint-disable-line react-hooks/exhaustive-deps
  const change = (patch, label) => { updateOrder(o.id, patch, user.name); log(`${label} on order ${o.id}`, user.name); };

  return (
    <>
      <Head title="Orders" sub={`${db.orders.length} orders. ${db.orders.filter((x) => x.status === 'Placed').length} new, ${db.orders.filter((x) => x.paymentStatus === 'Pending' && x.status !== 'Cancelled').length} awaiting payment.`}>
        <button className="btn btn-ghost btn-sm" onClick={() => exportCSV('orders.csv', rows, [['Order', 'id'], ['Date', (x) => fmtDate(x.createdAt)], ['Customer', (x) => x.customer.name], ['Email', (x) => x.customer.email], ['Phone', (x) => x.customer.phone], ['Items', (x) => x.items.map((i) => `${i.qty} x ${i.model}`).join('; ')], ['Subtotal', 'subtotal'], ['Discount', 'discount'], ['GST', 'tax'], ['Shipping', 'shipping'], ['Total', 'total'], ['Payment', 'paymentMethod'], ['Payment status', 'paymentStatus'], ['Status', 'status']])}>Export CSV</button>
      </Head>
      <div className="ad-toolbar">
        <input className="input" type="search" placeholder="Search order ID, customer, email or phone" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search orders" />
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Order status"><option value="">All order statuses</option>{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <select className="select" value={pay} onChange={(e) => setPay(e.target.value)} aria-label="Payment status"><option value="">All payment statuses</option>{PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      {rows.length === 0 ? <Empty>No orders match these filters.</Empty> : (
        <div className="ad-tablewrap"><table className="ad-table">
          <thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{pg.slice.map((x) => (
            <tr key={x.id}>
              <td><strong className="num">{x.id}</strong></td>
              <td>{fmtDate(x.createdAt)}</td>
              <td>{x.customer.name}<small>{x.customer.company || x.customer.email}</small></td>
              <td><small>{x.items.map((i) => `${i.qty} × ${i.model}`).join(', ')}</small></td>
              <td className="num">{fmtPrice(x.total)}</td>
              <td><Pill value={x.paymentStatus} /></td>
              <td>
                <select className="select ad-inline" value={x.status} aria-label={`Status of ${x.id}`} onChange={(e) => { updateOrder(x.id, { status: e.target.value }, user.name); log(`set ${x.id} to ${e.target.value}`, user.name); }}>
                  {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
              <td className="ad-actions"><button onClick={() => setOpenId(x.id)}>Open</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      <Pager {...pg} onPage={pg.setPage} />

      {o && (
        <Drawer wide title={`Order ${o.id}`} onClose={() => setOpenId(null)}
          footer={<><button className="btn btn-ghost btn-sm ad-danger" onClick={() => window.confirm(`Delete order ${o.id} permanently?`) && (remove('orders', o.id), log(`deleted order ${o.id}`, user.name), setOpenId(null))}>Delete order</button><button className="btn btn-ghost btn-sm" onClick={() => window.print()}>Print</button><button className="btn btn-primary btn-sm" onClick={() => setOpenId(null)}>Done</button></>}>
          <div className="ad-detail">
            <div className="ad-form">
              <div className="field"><label htmlFor="od-status">Order status</label><select id="od-status" className="select" value={o.status} onChange={(e) => change({ status: e.target.value }, `status ${e.target.value}`)}>{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
              <div className="field"><label htmlFor="od-pay">Payment status</label><select id="od-pay" className="select" value={o.paymentStatus} onChange={(e) => change({ paymentStatus: e.target.value }, `payment ${e.target.value}`)}>{PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
            </div>
            <h3>Items</h3>
            <table className="ad-table ad-table--plain"><tbody>
              {o.items.map((i) => <tr key={i.id}><td><div className="ad-prod"><img src={productImage(i.image)} alt="" /><div><strong>{i.model}</strong><small>{i.name}</small></div></div></td><td className="num">{i.qty} × {fmtPrice(i.price)}</td><td className="num"><strong>{fmtPrice(i.qty * i.price)}</strong></td></tr>)}
            </tbody></table>
            <dl className="ad-dl">
              <div><dt>Subtotal</dt><dd className="num">{fmtPrice(o.subtotal)}</dd></div>
              {o.discount > 0 && <div><dt>Discount {o.couponCode && `(${o.couponCode})`}</dt><dd className="num">−{fmtPrice(o.discount)}</dd></div>}
              <div><dt>GST</dt><dd className="num">{fmtPrice(o.tax)}</dd></div>
              <div><dt>Shipping</dt><dd className="num">{o.shipping ? fmtPrice(o.shipping) : 'Free'}</dd></div>
              <div className="ad-dl__total"><dt>Total</dt><dd className="num">{fmtPrice(o.total)}</dd></div>
            </dl>
            <h3>Customer</h3>
            <dl className="ad-dl">
              <div><dt>Name</dt><dd>{o.customer.name}</dd></div>
              <div><dt>Company</dt><dd>{o.customer.company || 'Not given'}</dd></div>
              <div><dt>GSTIN</dt><dd>{o.customer.gstin || 'Not given'}</dd></div>
              <div><dt>Email</dt><dd><a href={`mailto:${o.customer.email}`}>{o.customer.email}</a></dd></div>
              <div><dt>Phone</dt><dd><a href={`tel:${o.customer.phone}`}>{o.customer.phone}</a></dd></div>
              <div><dt>Deliver to</dt><dd>{o.address ? [o.address.name, o.address.line1, o.address.line2, o.address.city, o.address.state, o.address.pincode].filter(Boolean).join(', ') : 'No address'}</dd></div>
              <div><dt>Payment method</dt><dd>{o.paymentMethod}</dd></div>
            </dl>
            <h3>Timeline</h3>
            <ul className="ad-log">{o.history.map((h, i) => <li key={i}><time>{fmtDateTime(h.at)}</time><span><strong>{h.status}</strong> by {h.by}</span></li>)}</ul>
            <h3>Note</h3>
            <div className="field"><label htmlFor="od-note" className="sr-only">Order note</label><textarea id="od-note" className="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Customer note or internal remarks" /></div>
            <button className="btn btn-ghost btn-sm" onClick={() => change({ note }, 'note saved')} disabled={note === (o.note || '')}>Save note</button>
          </div>
        </Drawer>
      )}
    </>
  );
}

export function EnquiriesAdmin() {
  const { db, upsert, remove, log, user } = useApp();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [openId, setOpenId] = useState(null);
  const [notes, setNotes] = useState('');
  const rows = useMemo(() => db.enquiries.filter((e) => (!status || e.status === status) && (!q || `${e.reference} ${e.name} ${e.company} ${e.email} ${e.phone} ${e.product} ${e.city}`.toLowerCase().includes(q.toLowerCase()))), [db.enquiries, q, status]);
  const pg = usePaged(rows, 10);
  const e = db.enquiries.find((x) => x.id === openId);
  useEffect(() => { setNotes(e?.notes || ''); }, [openId]); // eslint-disable-line react-hooks/exhaustive-deps
  const setStatusOf = (x, s) => { upsert('enquiries', { id: x.id, status: s }); log(`marked enquiry ${x.reference} as ${s}`, user.name); };

  return (
    <>
      <Head title="Enquiries" sub="Every Request a quote and Contact form submission lands here.">
        <button className="btn btn-ghost btn-sm" onClick={() => exportCSV('enquiries.csv', rows, [['Reference', 'reference'], ['Date', (x) => fmtDate(x.createdAt)], ['Name', 'name'], ['Company', 'company'], ['Email', 'email'], ['Phone', 'phone'], ['City', 'city'], ['Product', 'product'], ['Quantity', 'quantity'], ['Message', 'message'], ['Status', 'status'], ['Notes', 'notes']])}>Export CSV</button>
      </Head>
      <div className="ad-toolbar">
        <input className="input" type="search" placeholder="Search name, company, product, city" value={q} onChange={(ev) => setQ(ev.target.value)} aria-label="Search enquiries" />
        <select className="select" value={status} onChange={(ev) => setStatus(ev.target.value)} aria-label="Status"><option value="">All statuses</option>{ENQUIRY_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      <div className="ad-pipeline">{ENQUIRY_STATUSES.map((s) => <button key={s} className={status === s ? 'is-on' : ''} onClick={() => setStatus(status === s ? '' : s)}><strong className="num">{db.enquiries.filter((x) => x.status === s).length}</strong>{s}</button>)}</div>
      {rows.length === 0 ? <Empty>No enquiries match these filters.</Empty> : (
        <div className="ad-tablewrap"><table className="ad-table">
          <thead><tr><th>Reference</th><th>Date</th><th>Contact</th><th>Product</th><th>Qty</th><th>City</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{pg.slice.map((x) => (
            <tr key={x.id}>
              <td><strong className="num">{x.reference}</strong></td><td>{fmtDate(x.createdAt)}</td>
              <td>{x.name}<small>{x.company || x.email}</small></td><td>{x.product || 'General enquiry'}</td><td className="num">{x.quantity}</td><td>{x.city || 'Not given'}</td>
              <td><select className="select ad-inline" value={x.status} aria-label={`Status of ${x.reference}`} onChange={(ev) => setStatusOf(x, ev.target.value)}>{ENQUIRY_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>
              <td className="ad-actions"><button onClick={() => setOpenId(x.id)}>Open</button><button className="ad-danger" onClick={() => window.confirm(`Delete enquiry ${x.reference}?`) && (remove('enquiries', x.id), log(`deleted enquiry ${x.reference}`, user.name))}>Delete</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      <Pager {...pg} onPage={pg.setPage} />
      {e && (
        <Drawer title={`Enquiry ${e.reference}`} onClose={() => setOpenId(null)} footer={<button className="btn btn-primary btn-sm" onClick={() => setOpenId(null)}>Done</button>}>
          <div className="ad-detail">
            <div className="field"><label htmlFor="en-st">Status</label><select id="en-st" className="select" value={e.status} onChange={(ev) => setStatusOf(e, ev.target.value)}>{ENQUIRY_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
            <dl className="ad-dl">
              <div><dt>Received</dt><dd>{fmtDateTime(e.createdAt)}</dd></div>
              <div><dt>Name</dt><dd>{e.name}</dd></div><div><dt>Company</dt><dd>{e.company || 'Not given'}</dd></div>
              <div><dt>Email</dt><dd><a href={`mailto:${e.email}?subject=Your Elanpro enquiry ${e.reference}`}>{e.email}</a></dd></div>
              <div><dt>Phone</dt><dd><a href={`tel:${e.phone}`}>{e.phone}</a></dd></div>
              <div><dt>City</dt><dd>{e.city || 'Not given'}</dd></div>
              <div><dt>Product</dt><dd>{e.product || 'General enquiry'}</dd></div><div><dt>Quantity</dt><dd>{e.quantity}</dd></div>
            </dl>
            <h3>Message</h3><p className="ad-quote">{e.message || 'No message.'}</p>
            <h3>Internal notes</h3>
            <div className="field"><label htmlFor="en-notes" className="sr-only">Internal notes</label><textarea id="en-notes" className="textarea" rows={4} value={notes} onChange={(ev) => setNotes(ev.target.value)} placeholder="Call notes, quote sent, next follow-up" /></div>
            <button className="btn btn-ghost btn-sm" disabled={notes === (e.notes || '')} onClick={() => { upsert('enquiries', { id: e.id, notes }); log(`added notes to ${e.reference}`, user.name); }}>Save notes</button>
          </div>
        </Drawer>
      )}
    </>
  );
}

export function CustomersAdmin() {
  const { db, upsert, remove, log, user } = useApp();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const stats = (id) => { const os = db.orders.filter((o) => o.userId === id && o.status !== 'Cancelled'); return { n: os.length, spend: os.reduce((s, o) => s + o.total, 0) }; };
  const rows = useMemo(() => db.users.filter((u) => (!role || (role === 'blocked' ? u.status === 'blocked' : u.role === role)) && (!q || `${u.name} ${u.email} ${u.phone} ${u.company}`.toLowerCase().includes(q.toLowerCase()))), [db.users, q, role]);
  const pg = usePaged(rows, 10);

  const save = () => {
    if (!form.name.trim()) return setError('Enter a name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Enter a valid email address.');
    if (form.phone.replace(/\D/g, '').length < 10) return setError('Enter a 10-digit mobile number.');
    if (db.users.some((u) => u.id !== form.id && u.email.toLowerCase() === form.email.toLowerCase())) return setError('Another account already uses this email.');
    if (!form.id && form.password.length < 6) return setError('Set a password of at least 6 characters.');
    if (form.id === user.id && (form.role !== 'admin' || form.status === 'blocked')) return setError('You cannot remove your own admin access or block yourself.');
    const isNew = !form.id;
    const { newPassword, ...rest } = form;
    const u = { ...rest, id: form.id || `u-${Date.now().toString(36)}`, addresses: form.addresses || [], createdAt: form.createdAt || new Date().toISOString(), ...(newPassword ? { password: newPassword } : {}) };
    if (newPassword && newPassword.length < 6) return setError('New password must be at least 6 characters.');
    upsert('users', u); log(`${isNew ? 'created' : 'updated'} account ${u.email}${newPassword ? ' and reset its password' : ''}`, user.name); setForm(null);
  };

  return (
    <>
      <Head title="Customers" sub="Customer and admin accounts. Blocked accounts cannot sign in.">
        <button className="btn btn-ghost btn-sm" onClick={() => exportCSV('customers.csv', rows, [['Name', 'name'], ['Email', 'email'], ['Phone', 'phone'], ['Company', 'company'], ['GSTIN', 'gstin'], ['Role', 'role'], ['Status', 'status'], ['Orders', (u) => stats(u.id).n], ['Spend', (u) => stats(u.id).spend], ['Joined', (u) => fmtDate(u.createdAt)]])}>Export CSV</button>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ name: '', email: '', phone: '', company: '', gstin: '', role: 'customer', status: 'active', password: '' }); setError(''); }}>Add account</button>
      </Head>
      <div className="ad-toolbar">
        <input className="input" type="search" placeholder="Search name, email, phone or company" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search customers" />
        <select className="select" value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role"><option value="">All accounts</option><option value="customer">Customers</option><option value="admin">Admins</option><option value="blocked">Blocked</option></select>
      </div>
      {rows.length === 0 ? <Empty>No accounts match.</Empty> : (
        <div className="ad-tablewrap"><table className="ad-table">
          <thead><tr><th>Account</th><th>Contact</th><th>Role</th><th>Orders</th><th>Spend</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{pg.slice.map((u) => {
            const s = stats(u.id); const me = u.id === user.id;
            return (
              <tr key={u.id}>
                <td><strong>{u.name}</strong>{me && <span className="pill pill--confirmed">You</span>}<small>{u.company}</small></td>
                <td>{u.email}<small>{u.phone}</small></td>
                <td><Pill value={u.role === 'admin' ? 'Admin' : 'Customer'} /></td>
                <td className="num">{s.n}</td><td className="num">{fmtPrice(s.spend)}</td><td>{fmtDate(u.createdAt)}</td>
                <td><Pill value={u.status === 'blocked' ? 'Blocked' : 'Active'} /></td>
                <td className="ad-actions">
                  <button onClick={() => { setForm({ ...u, newPassword: '' }); setError(''); }}>Edit</button>
                  {!me && <button onClick={() => { upsert('users', { id: u.id, status: u.status === 'blocked' ? 'active' : 'blocked' }); log(`${u.status === 'blocked' ? 'unblocked' : 'blocked'} ${u.email}`, user.name); }}>{u.status === 'blocked' ? 'Unblock' : 'Block'}</button>}
                  {!me && <button className="ad-danger" onClick={() => window.confirm(`Delete the account ${u.email}? Their orders are kept.`) && (remove('users', u.id), log(`deleted account ${u.email}`, user.name))}>Delete</button>}
                </td>
              </tr>
            );
          })}</tbody>
        </table></div>
      )}
      <Pager {...pg} onPage={pg.setPage} />
      {form && (
        <Drawer title={form.id ? `Edit ${form.name}` : 'Add account'} onClose={() => setForm(null)}
          footer={<>{error && <p className="field-error" role="alert">{error}</p>}<button className="btn btn-ghost btn-sm" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={save}>Save account</button></>}>
          <div className="ad-form">
            <Text label="Name" f={form} set={setForm} k="name" /><Text label="Mobile number" f={form} set={setForm} k="phone" />
            <Text wide label="Email" f={form} set={setForm} k="email" type="email" />
            <Text label="Company" f={form} set={setForm} k="company" /><Text label="GSTIN" f={form} set={setForm} k="gstin" />
            <Select label="Role" f={form} set={setForm} k="role" options={[['customer', 'Customer'], ['admin', 'Admin (full panel access)']]} />
            <Select label="Status" f={form} set={setForm} k="status" options={[['active', 'Active'], ['blocked', 'Blocked']]} />
            {form.id ? <Text wide label="Reset password" f={form} set={setForm} k="newPassword" hint="Leave empty to keep the current password." /> : <Text wide label="Password" f={form} set={setForm} k="password" />}
          </div>
          {form.id && form.addresses?.length > 0 && (<><h3>Saved addresses</h3><ul className="ad-log">{form.addresses.map((a) => <li key={a.id}><span>{[a.name, a.line1, a.city, a.state, a.pincode].join(', ')}</span></li>)}</ul></>)}
        </Drawer>
      )}
    </>
  );
}
