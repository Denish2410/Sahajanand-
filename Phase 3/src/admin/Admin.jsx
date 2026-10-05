// Admin panel shell: its own layout (no storefront header/footer), a sign-in
// screen, and a guard so only admin accounts get in.
import { useEffect, useState } from 'react';
import { Link, matchPath, useLocation, useNavigate } from '../router/index.jsx';
import { useApp } from '../context/AppContext.jsx';
import { DEMO_ADMIN } from '../services/store.js';
import Icon from '../components/Icon/Icon.jsx';
import Dashboard from './Dashboard.jsx';
import ProductsAdmin from './ProductsAdmin.jsx';
import { CategoriesAdmin, CouponsAdmin, OffersAdmin } from './CatalogAdmin.jsx';
import { OrdersAdmin, EnquiriesAdmin, CustomersAdmin } from './SalesAdmin.jsx';
import { SettingsAdmin, ActivityAdmin } from './SettingsAdmin.jsx';
import '../pages/Account/Account.css';
import './admin.css';

const NAV = [
  ['Overview', [['/admin', 'Dashboard', Dashboard]]],
  ['Sales', [['/admin/orders', 'Orders', OrdersAdmin], ['/admin/enquiries', 'Enquiries', EnquiriesAdmin], ['/admin/customers', 'Customers', CustomersAdmin]]],
  ['Catalogue', [['/admin/products', 'Products', ProductsAdmin], ['/admin/categories', 'Categories', CategoriesAdmin]]],
  ['Marketing', [['/admin/coupons', 'Coupons', CouponsAdmin], ['/admin/banners', 'Homepage banners', OffersAdmin]]],
  ['System', [['/admin/settings', 'Settings', SettingsAdmin], ['/admin/activity', 'Activity log', ActivityAdmin]]],
];
const PAGES = NAV.flatMap(([, items]) => items);

function AdminLogin() {
  const { login } = useApp();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!id.trim() || !pw) return setError('Enter your admin email and password.');
    const res = login(id, pw, { remember: true, adminOnly: true });
    if (!res.ok) setError(res.error);
  };
  return (
    <div className="ad-login">
      <form onSubmit={submit} noValidate>
        <p className="ad-login__logo">ELANPRO<span aria-hidden="true" /> <small>Admin</small></p>
        <h1>Admin sign in</h1>
        <div className="field"><label htmlFor="al-id">Admin email or mobile number</label><input id="al-id" className="input" value={id} onChange={(e) => { setId(e.target.value); setError(''); }} autoComplete="username" autoFocus /></div>
        <div className="field"><label htmlFor="al-pw">Password</label><input id="al-pw" className="input" type="password" value={pw} onChange={(e) => { setPw(e.target.value); setError(''); }} autoComplete="current-password" /></div>
        {error && <p className="field-error" role="alert">{error}</p>}
        <button className="btn btn-primary btn-block">Sign in to admin</button>
        <button type="button" className="ad-login__demo" onClick={() => { setId(DEMO_ADMIN.email); setPw(DEMO_ADMIN.password); setError(''); }}>
          <strong>Demo admin</strong> (tap to fill)<code>{DEMO_ADMIN.email}</code><code>{DEMO_ADMIN.password}</code>
        </button>
        <Link to="/" className="auth__link">Back to the storefront</Link>
      </form>
    </div>
  );
}

export default function Admin() {
  const { user, isAdmin, logout, db } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  useEffect(() => { setMenu(false); }, [pathname]);
  useEffect(() => { document.title = 'Elanpro Admin'; return () => { document.title = 'Elanpro | Commercial refrigeration'; }; }, []);
  useEffect(() => { if (isAdmin && pathname === '/admin/login') navigate('/admin', { replace: true }); }, [isAdmin, pathname, navigate]);

  if (!isAdmin) {
    if (user) {
      return (
        <div className="ad-login"><div className="ad-login__denied">
          <h1>No admin access</h1>
          <p>You are signed in as {user.email}, which is a customer account. Sign out and use an admin account.</p>
          <button className="btn btn-primary" onClick={logout}>Sign out and switch account</button>
          <Link to="/" className="auth__link">Back to the storefront</Link>
        </div></div>
      );
    }
    return <AdminLogin />;
  }

  const path = pathname.replace(/\/$/, '') || '/admin';
  const Page = PAGES.find(([to]) => matchPath(to, path))?.[2];
  const badges = { '/admin/orders': db.orders.filter((o) => o.status === 'Placed').length, '/admin/enquiries': db.enquiries.filter((e) => e.status === 'New').length, '/admin/products': db.products.filter((p) => p.stock <= db.settings.lowStockThreshold).length };

  return (
    <div className={`ad ${menu ? 'is-menu' : ''}`}>
      <aside className="ad-side">
        <Link to="/admin" className="ad-side__logo">ELANPRO<span aria-hidden="true" /> <small>Admin</small></Link>
        <nav aria-label="Admin">
          {NAV.map(([group, items]) => (
            <div key={group}>
              <p>{group}</p>
              <ul>{items.map(([to, label]) => (
                <li key={to}><Link to={to} aria-current={path === to ? 'page' : undefined}>{label}{badges[to] > 0 && <span className="num">{badges[to]}</span>}</Link></li>
              ))}</ul>
            </div>
          ))}
        </nav>
        <div className="ad-side__foot">
          <Link to="/">View storefront</Link>
          <button onClick={() => { logout(); navigate('/admin/login'); }}>Sign out</button>
        </div>
      </aside>
      <div className="ad-main">
        <header className="ad-top">
          <button className="ad-top__burger" onClick={() => setMenu((m) => !m)} aria-label="Toggle menu" aria-expanded={menu}><Icon name="menu" /></button>
          <span className="ad-top__crumb">{PAGES.find(([to]) => to === path)?.[1] || 'Not found'}</span>
          <span className="ad-top__user"><strong>{user.name}</strong><small>{user.email}</small></span>
        </header>
        <main className="ad-content" key={path}>
          {Page ? <Page /> : <div className="empty"><h1 style={{ fontSize: 'var(--fs-4)' }}>This admin page does not exist</h1><Link to="/admin" className="btn btn-primary">Go to the dashboard</Link></div>}
        </main>
      </div>
    </div>
  );
}
