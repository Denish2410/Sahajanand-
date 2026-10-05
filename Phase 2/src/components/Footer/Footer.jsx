import { Link } from '../../router/index.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useCatalogue } from '../../hooks/useCatalogue.js';
import { company } from '../../data/company.js';
import './Footer.css';

export default function Footer() {
  const { categories } = useCatalogue();
  const { openQuote } = useApp();
  const half = Math.ceil(categories.length / 2);
  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div className="footer__brand">
          <p className="footer__logo">ELANPRO<span aria-hidden="true" /></p>
          <p>{company.legalName}</p>
          <p>Commercial refrigeration since {company.established}. Headquartered in {company.headquarters}.</p>
          <button className="btn btn-light" onClick={() => openQuote()}>Request a quote</button>
        </div>
        <nav aria-label="Product categories">
          <h3>Products</h3>
          <div className="footer__cols">
            <ul>{categories.slice(0, half).map((c) => <li key={c.slug}><Link to={`/category/${c.slug}`}>{c.name}</Link></li>)}</ul>
            <ul>{categories.slice(half).map((c) => <li key={c.slug}><Link to={`/category/${c.slug}`}>{c.name}</Link></li>)}</ul>
          </div>
        </nav>
        <nav aria-label="Company">
          <h3>Company</h3>
          <ul>
            <li><Link to="/about">About Elanpro</Link></li>
            <li><Link to="/solutions">Solutions by industry</Link></li>
            <li><Link to="/compare">Compare products</Link></li>
            <li><Link to="/contact">Contact sales</Link></li>
          </ul>
        </nav>
        <div>
          <h3>Customer care</h3>
          <ul>
            {company.phones.map((p) => <li key={p}><a href={`tel:${p.replace(/[^+\d]/g, '')}`}>{p}</a></li>)}
            <li><a href={`mailto:${company.email}`}>{company.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="wrap footer__legal">
        <p>© {new Date().getFullYear()} {company.legalName}</p>
        <p>Due to continuous product development, specifications, features and colours are subject to change without notice.</p>
      </div>
    </footer>
  );
}
