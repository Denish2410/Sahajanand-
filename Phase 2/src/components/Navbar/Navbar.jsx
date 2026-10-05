import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from '../../router/index.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useCatalogue } from '../../hooks/useCatalogue.js';
import { useLockScroll } from '../../hooks/useLockScroll.js';
import { company } from '../../data/company.js';
import { productImage } from '../../utils/format.js';
import Icon from '../Icon/Icon.jsx';
import Search from '../Search/Search.jsx';
import './Navbar.css';

const LINKS = [
  { to: '/solutions', label: 'Solutions' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { openQuote, compare, cartCount, setCartOpen } = useApp();
  const { categories, counts } = useCatalogue();
  const { pathname } = useLocation();
  const [mega, setMega] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const megaRef = useRef(null);

  useEffect(() => { setMega(false); setDrawer(false); }, [pathname]);
  useEffect(() => {
    if (!mega) return;
    const key = (e) => e.key === 'Escape' && setMega(false);
    const away = (e) => { if (!megaRef.current?.contains(e.target)) setMega(false); };
    document.addEventListener('keydown', key);
    document.addEventListener('mousedown', away);
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('mousedown', away); };
  }, [mega]);
  useLockScroll(drawer);

  return (
    <header className="nav">
      <div className="nav__util">
        <div className="wrap nav__util-in">
          <span>Commercial refrigeration since {company.established}</span>
          <span className="nav__util-contact">
            <a href={`tel:${company.phones[0].replace(/[^+\d]/g, '')}`}><Icon name="phone" size={14} /> {company.phones[0]}</a>
            <a href={`mailto:${company.email}`}><Icon name="mail" size={14} /> {company.email}</a>
          </span>
        </div>
      </div>

      <div className="wrap nav__main">
        <button className="nav__burger" onClick={() => setDrawer(true)} aria-label="Open menu" aria-expanded={drawer}>
          <Icon name="menu" size={24} />
        </button>
        <Link to="/" className="nav__logo" aria-label="Elanpro home">
          ELANPRO<span aria-hidden="true" />
        </Link>
        <div className="nav__search"><Search /></div>
        <div className="nav__actions">
          <Link to="/compare" className="nav__compare">
            <Icon name="compare" size={18} /> Compare
            {compare.length > 0 && <span className="nav__count num">{compare.length}</span>}
          </Link>
          <button className="nav__cart" onClick={() => setCartOpen(true)} aria-label="Open cart" id="navbar-cart-btn">
            <Icon name="cart" size={20} />
            {cartCount > 0 && <span className="nav__count num">{cartCount}</span>}
          </button>
          <button className="btn btn-primary" onClick={() => openQuote()}>Request a quote</button>
        </div>
      </div>

      <nav className="nav__bar" aria-label="Main" ref={megaRef}>
        <div className="wrap nav__bar-in">
          <button className="nav__products" aria-expanded={mega} aria-controls="mega" onClick={() => setMega((m) => !m)}>
            <Icon name="menu" size={18} /> Products <Icon name="down" size={16} />
          </button>
          <ul className="nav__quick">
            {categories.slice(0, 7).map((c) => (
              <li key={c.slug}>
                <Link to={`/category/${c.slug}`} aria-current={pathname === `/category/${c.slug}` ? 'page' : undefined}>{c.shortName}</Link>
              </li>
            ))}
          </ul>
          <ul className="nav__links">
            {LINKS.map((l) => (
              <li key={l.to}><Link to={l.to} aria-current={pathname === l.to ? 'page' : undefined}>{l.label}</Link></li>
            ))}
          </ul>
        </div>

        {mega && (
          <div className="mega" id="mega">
            <div className="wrap">
              <ul className="mega__grid">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link to={`/category/${c.slug}`} className="mega__item">
                      <span className="mega__thumb"><img src={productImage(c.image)} alt="" loading="lazy" /></span>
                      <span>
                        <strong>{c.name}</strong>
                        <small className="num">{counts[c.slug] || 0} products</small>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link to="/products" className="text-link mega__all">Browse all products</Link>
            </div>
          </div>
        )}
      </nav>

      <div className="wrap nav__search-mobile"><Search /></div>

      {drawer && (
        <div className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="drawer__head">
            <span className="nav__logo">ELANPRO<span aria-hidden="true" /></span>
            <button onClick={() => setDrawer(false)} aria-label="Close menu"><Icon name="close" size={24} /></button>
          </div>
          <div className="drawer__body">
            <p className="drawer__label">Products</p>
            <ul className="drawer__cats">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link to={`/category/${c.slug}`}>
                    {c.name} <span className="muted num">{counts[c.slug] || 0}</span>
                  </Link>
                </li>
              ))}
              <li><Link to="/products">All products</Link></li>
            </ul>
            <ul className="drawer__links">
              {LINKS.map((l) => <li key={l.to}><Link to={l.to}>{l.label}</Link></li>)}
              <li><Link to="/compare">Compare{compare.length > 0 ? ` (${compare.length})` : ''}</Link></li>
            </ul>
            <button className="btn btn-primary btn-block" onClick={() => { setDrawer(false); openQuote(); }}>Request a quote</button>
            <a className="drawer__phone" href={`tel:${company.phones[0].replace(/[^+\d]/g, '')}`}><Icon name="phone" size={16} /> {company.phones[0]}</a>
          </div>
        </div>
      )}
    </header>
  );
}
