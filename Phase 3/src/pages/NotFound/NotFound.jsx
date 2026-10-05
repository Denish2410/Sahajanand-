import { Link } from '../../router/index.jsx';

export default function NotFound() {
  return (
    <div className="wrap section">
      <div className="empty">
        <h1 style={{ fontSize: 'var(--fs-4)', marginBottom: '0.5rem' }}>This page is not in the catalogue</h1>
        <p className="muted">The link may be out of date. Search by model number above, or browse the full range.</p>
        <Link to="/products" className="btn btn-primary">Browse all products</Link>
      </div>
    </div>
  );
}
