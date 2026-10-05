import { useEffect, useState } from 'react';
import { Link } from '../../router/index.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useCatalogue } from '../../hooks/useCatalogue.js';
import { productImage } from '../../utils/format.js';
import { keySpecs } from '../../utils/specs.js';
import TempScale from '../../components/TempScale/TempScale.jsx';
import ProductGrid from '../../components/ProductGrid/ProductGrid.jsx';
import Icon from '../../components/Icon/Icon.jsx';
import NotFound from '../NotFound/NotFound.jsx';
import './ProductDetails.css';

export default function ProductDetails({ params }) {
  const { getProduct, getCategory, byFamily, byCategory } = useCatalogue();
  const { openQuote, compare, toggleCompare } = useApp();
  const product = getProduct(params.id);
  const [shot, setShot] = useState(0);
  useEffect(() => setShot(0), [params.id]);
  useEffect(() => {
    if (product) document.title = `${product.model} ${product.name} | Elanpro`;
    return () => { document.title = 'Elanpro | Commercial refrigeration'; };
  }, [product]);

  if (!product) return <NotFound />;

  const category = getCategory(product.category);
  const variants = byFamily(product.familyId);
  const variantCols = keySpecs(product, 3).map((s) => s.label);
  const seen = new Set();
  const related = byCategory(product.category)
    .filter((p) => p.familyId !== product.familyId && !seen.has(p.familyId) && seen.add(p.familyId))
    .slice(0, 4);
  const comparing = compare.includes(product.id);
  const facts = keySpecs(product, 3);

  return (
    <div className="pd">
      <div className="wrap">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link><span aria-hidden="true">/</span>
          <Link to={`/category/${category.slug}`}>{category.name}</Link><span aria-hidden="true">/</span>
          <span>{product.model}</span>
        </nav>

        <div className="pd__top">
          <div className="pd__gallery">
            <div className="pd__stage">
              <img key={shot} src={productImage(product.gallery[shot])} alt={`${product.model}, ${product.name}`} />
            </div>
            {product.gallery.length > 1 && (
              <div className="pd__thumbs">
                {product.gallery.map((g, i) => (
                  <button key={g} aria-pressed={i === shot} aria-label={`Show image ${i + 1}`} onClick={() => setShot(i)}>
                    <img src={productImage(g)} alt="" />
                  </button>
                ))}
              </div>
            )}
            <p className="pd__note">Images are from the catalogue and represent the series. Door configuration and finish vary by model.</p>
          </div>

          <div className="pd__info">
            <p className="pd__sub">{category.name}, {product.subcategory}</p>
            <h1 className="pd__model">{product.model}</h1>
            <p className="pd__name">{product.name}</p>
            <p className="pd__desc">{product.description}</p>

            {product.temp && (
              <div className="pd__temp">
                <div className="pd__temp-head">
                  <span>Operating range</span>
                  <strong>{product.tempClass}</strong>
                </div>
                <TempScale temp={product.temp} tempClass={product.tempClass} detailed />
              </div>
            )}

            <dl className="pd__facts">
              {facts.map((f) => (
                <div key={f.label}><dt>{f.label}</dt><dd className="num">{f.value}</dd></div>
              ))}
            </dl>

            {product.badges.length > 0 && (
              <ul className="pd__badges">{product.badges.map((b) => <li key={b} className="badge">{b}</li>)}</ul>
            )}

            <div className="pd__cta">
              <button className="btn btn-primary" onClick={() => openQuote(product.model)}>Request a quote</button>
              <button className="btn btn-ghost" aria-pressed={comparing} onClick={() => toggleCompare(product.id)}>
                <Icon name={comparing ? 'check' : 'compare'} size={18} /> {comparing ? 'Added to comparison' : 'Add to comparison'}
              </button>
            </div>
          </div>
        </div>

        <div className="pd__sections">
          <section aria-labelledby="pd-features">
            <h2 id="pd-features">Key features</h2>
            <ul className="pd__features">
              {product.features.map((f) => <li key={f}><Icon name="check" size={18} />{f}</li>)}
            </ul>
          </section>

          <section aria-labelledby="pd-specs">
            <h2 id="pd-specs">Technical specifications</h2>
            <div className="pd__table-wrap">
              <table className="spec">
                <caption className="sr-only">Technical specifications for {product.model}</caption>
                <tbody>
                  <tr><th scope="row">Model</th><td>{product.model}</td></tr>
                  {product.specifications.map((s) => (
                    <tr key={s.label}><th scope="row">{s.label}</th><td className="num">{s.value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="pd__note">Specifications are taken from the Elanpro catalogue and are subject to change without notice.</p>
          </section>

          {product.applications.length > 0 && (
            <section aria-labelledby="pd-apps">
              <h2 id="pd-apps">Applications</h2>
              <ul className="pd__apps">{product.applications.map((a) => <li key={a}>{a}</li>)}</ul>
            </section>
          )}

          {variants.length > 1 && (
            <section aria-labelledby="pd-variants">
              <h2 id="pd-variants">Available variants</h2>
              <div className="pd__table-wrap">
                <table className="spec spec--cols">
                  <thead>
                    <tr><th scope="col">Model</th>{variantCols.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {variants.map((v) => (
                      <tr key={v.id} aria-current={v.id === product.id ? 'true' : undefined}>
                        <th scope="row">{v.id === product.id ? v.model : <Link to={`/product/${v.id}`}>{v.model}</Link>}</th>
                        {variantCols.map((c) => <td key={c} className="num">{v.specifications.find((s) => s.label === c)?.value ?? 'n/a'}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="pd__related">
          <div className="wrap">
            <div className="section-head">
              <h2>Related products</h2>
              <Link to={`/category/${category.slug}`} className="text-link">All {category.name}</Link>
            </div>
            <ProductGrid products={related} columns="4" />
          </div>
        </section>
      )}

      <div className="pd__sticky">
        <div><strong>{product.model}</strong><span>{product.name}</span></div>
        <button className="btn btn-primary" onClick={() => openQuote(product.model)}>Request a quote</button>
      </div>
    </div>
  );
}
