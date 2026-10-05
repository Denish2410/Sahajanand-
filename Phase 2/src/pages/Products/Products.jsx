import { useQuery } from '../../router/index.jsx';
import { Link } from '../../router/index.jsx';
import { useCatalogue } from '../../hooks/useCatalogue.js';
import ProductBrowser from '../../components/ProductBrowser/ProductBrowser.jsx';
import '../Category/Category.css';

export default function Products() {
  const { products } = useCatalogue();
  const q = useQuery().get('q') || '';
  return (
    <div className="wrap">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span aria-hidden="true">/</span><span>Products</span>
      </nav>
      <header className="plain-head">
        <h1>{q ? `Results for “${q}”` : 'All products'}</h1>
        <p className="lede">
          {q ? 'Matches across model numbers, product names, categories and product types.' : 'The full Elanpro range. Filter by category, temperature class, capacity or refrigerant.'}
        </p>
      </header>
      <div className="cat-body">
        <ProductBrowser products={products} showCategory initialQuery={q} resetKey={q} />
      </div>
    </div>
  );
}
