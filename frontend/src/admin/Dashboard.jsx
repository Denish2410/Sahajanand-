import { Link } from '../router/index.jsx';
import { useApp } from '../context/AppContext.jsx';
import { ORDER_STATUSES } from '../services/store.js';
import { fmtPrice, fmtDate, fmtDateTime } from '../utils/format.js';
import { Head, Pill } from './ui.jsx';

export default function Dashboard() {
  const { db, user } = useApp();
  const { orders, enquiries, products, users, coupons, settings, categories, activity } = db;
  const live = orders.filter((o) => o.status !== 'Cancelled');
  const revenue = live.reduce((s, o) => s + o.total, 0);
  const paid = orders.filter((o) => o.paymentStatus === 'Paid').reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => ['Placed', 'Confirmed'].includes(o.status)).length;
  const newEnq = enquiries.filter((e) => e.status === 'New').length;
  const customers = users.filter((u) => u.role === 'customer');
  const low = products.filter((p) => (p.stock ?? 0) <= settings.lowStockThreshold).sort((a, b) => a.stock - b.stock);
  const stockValue = products.reduce((s, p) => s + p.price * (p.stock ?? 0), 0);

  // Revenue for the last 7 days.
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(Date.now() - (6 - i) * 864e5);
    const key = d.toISOString().slice(0, 10);
    return { label: d.toLocaleDateString('en-IN', { weekday: 'short' }), total: live.filter((o) => o.createdAt.slice(0, 10) === key).reduce((s, o) => s + o.total, 0) };
  });
  const maxDay = Math.max(...days.map((d) => d.total), 1);
  const byStatus = ORDER_STATUSES.map((s) => ({ s, n: orders.filter((o) => o.status === s).length }));
  const maxStatus = Math.max(...byStatus.map((x) => x.n), 1);

  // Best sellers by units ordered.
  const units = {};
  for (const o of live) for (const i of o.items) units[i.model] = (units[i.model] || 0) + i.qty;
  const best = Object.entries(units).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const catSales = categories.map((c) => ({ name: c.name, total: live.reduce((s, o) => s + o.items.filter((i) => i.category === c.slug).reduce((x, i) => x + i.price * i.qty, 0), 0) }));
  const maxCat = Math.max(...catSales.map((c) => c.total), 1);

  const kpis = [
    ['Revenue (excl. cancelled)', fmtPrice(revenue), `${fmtPrice(paid)} received`, '/admin/orders'],
    ['Orders', orders.length, `${pending} awaiting action`, '/admin/orders'],
    ['Enquiries', enquiries.length, `${newEnq} new`, '/admin/enquiries'],
    ['Customers', customers.length, `${customers.filter((c) => c.status === 'blocked').length} blocked`, '/admin/customers'],
    ['Products', products.length, `${products.filter((p) => p.status === 'draft').length} drafts`, '/admin/products'],
    ['Stock value', fmtPrice(stockValue), `${low.length} low or out of stock`, '/admin/products'],
    ['Active coupons', coupons.filter((c) => c.active).length, `${coupons.reduce((s, c) => s + (c.used || 0), 0)} redemptions`, '/admin/coupons'],
    ['Average order', fmtPrice(live.length ? Math.round(revenue / live.length) : 0), `${live.length} completed or open`, '/admin/orders'],
  ];

  return (
    <>
      <Head title="Dashboard" sub={`Signed in as ${user.name}. Everything below updates as you work in the panel.`}>
        <Link to="/" className="btn btn-ghost btn-sm">View storefront</Link>
      </Head>

      <div className="ad-kpis">
        {kpis.map(([label, value, note, to]) => (
          <Link key={label} to={to} className="ad-kpi"><span>{label}</span><strong className="num">{value}</strong><small>{note}</small></Link>
        ))}
      </div>

      <div className="ad-cols">
        <section className="ad-card">
          <h2>Revenue, last 7 days</h2>
          <div className="ad-bars">
            {days.map((d, i) => (
              <div key={i} title={fmtPrice(d.total)}>
                <span className="ad-bars__val num">{d.total ? `${Math.round(d.total / 1000)}k` : ''}</span>
                <span className="ad-bars__bar" style={{ height: `${(d.total / maxDay) * 100}%` }} />
                <span className="ad-bars__label">{d.label}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="ad-card">
          <h2>Orders by status</h2>
          <ul className="ad-hbars">
            {byStatus.map(({ s, n }) => <li key={s}><span>{s}</span><i style={{ width: `${(n / maxStatus) * 100}%` }} /><b className="num">{n}</b></li>)}
          </ul>
        </section>
        <section className="ad-card">
          <h2>Sales by category</h2>
          <ul className="ad-hbars">
            {catSales.map((c) => <li key={c.name}><span>{c.name}</span><i style={{ width: `${(c.total / maxCat) * 100}%` }} /><b className="num">{fmtPrice(c.total)}</b></li>)}
          </ul>
        </section>
      </div>

      <div className="ad-cols ad-cols--2">
        <section className="ad-card">
          <h2>Recent orders <Link to="/admin/orders">View all</Link></h2>
          <table className="ad-table ad-table--plain"><tbody>
            {orders.slice(0, 6).map((o) => <tr key={o.id}><td className="num"><Link to={`/admin/orders?open=${o.id}`}>{o.id}</Link></td><td>{o.customer.name}</td><td>{fmtDate(o.createdAt)}</td><td className="num">{fmtPrice(o.total)}</td><td><Pill value={o.status} /></td></tr>)}
          </tbody></table>
        </section>
        <section className="ad-card">
          <h2>Recent enquiries <Link to="/admin/enquiries">View all</Link></h2>
          <table className="ad-table ad-table--plain"><tbody>
            {enquiries.slice(0, 6).map((e) => <tr key={e.id}><td className="num">{e.reference}</td><td>{e.name}</td><td>{e.product || 'General'}</td><td>{fmtDate(e.createdAt)}</td><td><Pill value={e.status} /></td></tr>)}
          </tbody></table>
        </section>
        <section className="ad-card">
          <h2>Low stock <Link to="/admin/products">Manage</Link></h2>
          {low.length === 0 ? <p className="muted">All products are above the threshold of {settings.lowStockThreshold}.</p> : (
            <table className="ad-table ad-table--plain"><tbody>
              {low.slice(0, 6).map((p) => <tr key={p.id}><td><strong>{p.model}</strong></td><td>{p.name}</td><td><Pill value={p.stock === 0 ? 'Out of stock' : `${p.stock} left`} tone={p.stock === 0 ? 'out' : 'low'} /></td></tr>)}
            </tbody></table>
          )}
        </section>
        <section className="ad-card">
          <h2>Best sellers</h2>
          {best.length === 0 ? <p className="muted">No orders yet.</p> : (
            <table className="ad-table ad-table--plain"><tbody>{best.map(([m, n]) => <tr key={m}><td><strong>{m}</strong></td><td className="num">{n} units ordered</td></tr>)}</tbody></table>
          )}
        </section>
        <section className="ad-card ad-card--wide">
          <h2>Recent activity <Link to="/admin/activity">Full log</Link></h2>
          <ul className="ad-log">{activity.slice(0, 6).map((a) => <li key={a.id}><time>{fmtDateTime(a.at)}</time><span><strong>{a.by}</strong> {a.action}</span></li>)}</ul>
        </section>
      </div>
    </>
  );
}
