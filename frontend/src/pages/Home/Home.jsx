import { useState } from 'react';
import { Link } from '../../router/index.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useCatalogue } from '../../hooks/useCatalogue.js';
import { industries } from '../../data/industries.js';
import { company } from '../../data/company.js';
import { productImage } from '../../utils/format.js';
import Hero from '../../components/Hero/Hero.jsx';
import OfferCarousel from '../../components/OfferCarousel/OfferCarousel.jsx';
import CategoryCard from '../../components/CategoryCard/CategoryCard.jsx';
import ProductGrid from '../../components/ProductGrid/ProductGrid.jsx';
import CouponsSection from '../../components/CouponsSection/CouponsSection.jsx';
import Icon from '../../components/Icon/Icon.jsx';
import './Home.css';

// Models shown in the "Featured products" tabs. All are catalogue models.
const FEATURED = {
  'professional-kitchen': ['EGN 1500 C4', 'EGN 2100 C', 'ED10', 'ESH 2000'],
  'bar-refrigeration': ['EWG 130 D', 'EBB 2D / 2D SS', 'EGN 2100 CG', 'EGF 5G'],
  'retail-solution': ['ECG 1506', 'EFGV 1000', 'EKG 650 G', 'EF 825 G'],
  'ice-machine': ['EIM 201', 'EIM 1001', 'EIM 101', 'EFM 101'],
  'vending-machine': ['Galaxy', 'Nova', 'Frozone', 'Orion'],
};
const TECH_ICON = { 'cutting-edge': 'chip', energy: 'bolt', eco: 'leaf', foam: 'layers' };

export default function Home() {
  const { openQuote } = useApp();
  const { categories, counts, getCategory, getByModel, byCategory } = useCatalogue();
  const [tab, setTab] = useState('professional-kitchen');
  const [industry, setIndustry] = useState(industries[0].slug);
  const current = industries.find((i) => i.slug === industry);
  const featured = FEATURED[tab].map(getByModel).filter(Boolean);
  const industryProducts = current.categories.map((c) => byCategory(c)[0]).filter(Boolean).slice(0, 3);

  return (
    <>
      <Hero />

      <section className="section wrap home-offers">
        <OfferCarousel />
      </section>

      <section className="section wrap" id="categories" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <div>
            <h2>Browse the range</h2>
            <p className="lede">{categories.length} product lines, {Object.values(counts).reduce((a, b) => a + b, 0)} models, straight from the Elanpro catalogue.</p>
          </div>
          <Link to="/products" className="text-link">View all products</Link>
        </div>
        <div className="home-cats">
          {categories.map((c) => (
            <CategoryCard key={c.slug} category={c} count={counts[c.slug] || 0} featured={Boolean(c.featured)} />
          ))}
        </div>
      </section>

      <section className="section home-featured">
        <div className="wrap">
          <div className="section-head">
            <h2>Featured products</h2>
            <div className="home-tabs" role="tablist" aria-label="Featured products by category">
              {Object.keys(FEATURED).map((slug) => (
                <button key={slug} role="tab" aria-selected={tab === slug} className={`chip ${tab === slug ? 'is-active' : ''}`} onClick={() => setTab(slug)}>
                  {getCategory(slug)?.shortName}
                </button>
              ))}
            </div>
          </div>
          <ProductGrid products={featured} columns="4" />
          <p className="home-featured__more">
            <Link to={`/category/${tab}`} className="text-link">See all {counts[tab]} {getCategory(tab)?.name} products</Link>
          </p>
        </div>
      </section>

      <CouponsSection />

      <section className="home-industries">
        <div className="wrap section">
          <div className="section-head">
            <div>
              <h2>Solutions for your business</h2>
              <p className="lede">Pick your sector to see the product lines that serve it.</p>
            </div>
            <Link to="/solutions" className="text-link">All solutions</Link>
          </div>
          <div className="home-ind">
            <ul className="home-ind__list" role="tablist" aria-label="Industries">
              {industries.map((i) => (
                <li key={i.slug}>
                  <button role="tab" aria-selected={i.slug === industry} onClick={() => setIndustry(i.slug)}>{i.name}</button>
                </li>
              ))}
            </ul>
            <div className="home-ind__panel" role="tabpanel" key={industry}>
              <p className="home-ind__need">{current.need}</p>
              <ul className="home-ind__cats">
                {current.categories.map((slug) => (
                  <li key={slug}><Link to={`/category/${slug}`}>{getCategory(slug)?.name}<Icon name="right" size={18} /></Link></li>
                ))}
              </ul>
              <div className="home-ind__products">
                {industryProducts.map((p) => (
                  <Link key={p.id} to={`/product/${p.id}`}>
                    <img src={productImage(p.image)} alt="" />
                    <span><strong>{p.model}</strong>{p.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section wrap" id="technology">
        <div className="section-head">
          <div>
            <h2>Technology inside every unit</h2>
            <p className="lede">Four things the range has in common, whatever it keeps cold.</p>
          </div>
        </div>
        <div className="home-tech">
          {company.technology.map((t) => (
            <article key={t.key}>
              <Icon name={TECH_ICON[t.key]} size={30} />
              <h3>{t.title}</h3>
              <p>{t.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-reach">
        <div className="wrap home-reach__in">
          <div>
            <h2>A service network across India</h2>
            <p className="lede">Distribution and after-sales support in all major cities, so equipment arrives quickly and stays running.</p>
            <Link to="/about" className="text-link">About Elanpro</Link>
          </div>
          <dl className="home-reach__stats">
            {company.footprint.map((f) => (
              <div key={f.label}>
                <dd className="num">{f.value}</dd>
                <dt>{f.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head"><h2>Trusted by</h2></div>
        <div className="home-clients">
          {company.customers.map((g) => (
            <div key={g.group}>
              <h3>{g.group}</h3>
              <p>{g.names.join(', ')} and many more.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <div className="wrap home-cta__in">
          <div>
            <h2>Tell us what you need to keep cold.</h2>
            <p>Send the model, quantity and city. The sales team will come back with a quotation.</p>
          </div>
          <div className="home-cta__actions">
            <button className="btn btn-primary" onClick={() => openQuote()}>Request a quote</button>
            <Link to="/contact" className="btn btn-light">Contact sales</Link>
          </div>
        </div>
      </section>
    </>
  );
}
