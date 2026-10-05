import { useEffect, useMemo, useState } from 'react';
import { Link } from '../../router/index.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useCatalogue } from '../../hooks/useCatalogue.js';
import { useSeo } from '../../hooks/useSeo.js';
import { industries } from '../../data/industries.js';
import { brand } from '../../data/brand.js';
import { productImage } from '../../utils/format.js';
import Hero from '../../components/Hero/Hero.jsx';
import OfferCarousel from '../../components/OfferCarousel/OfferCarousel.jsx';
import CategoryCard from '../../components/CategoryCard/CategoryCard.jsx';
import ProductGrid from '../../components/ProductGrid/ProductGrid.jsx';
import CouponsSection from '../../components/CouponsSection/CouponsSection.jsx';
import Icon from '../../components/Icon/Icon.jsx';
import './Home.css';

const TECH_ICON = { 'cutting-edge': 'chip', energy: 'bolt', eco: 'leaf', foam: 'layers' };
const FEATURED_PER_TAB = 4;

export default function Home() {
  const { openQuote, settings } = useApp();
  const { categories, counts, getCategory, byCategory } = useCatalogue();
  const areas = settings.serviceAreas.join(' and ');
  useSeo({
    title: `${settings.storeName} | Authorised Elanpro reseller in ${areas}`,
    description: `Elanpro commercial refrigeration from ${settings.storeName}, authorised Elanpro reseller serving ${areas}, Gujarat: professional kitchen, bar, retail, ice and vending equipment. Browse the range, order online or request a quote.`,
    path: '/',
  });

  // Featured tabs: the categories that have products; in each, the products
  // marked as featured in the admin panel, or the first few of the category.
  const tabs = useMemo(() => categories.filter((c) => counts[c.slug]), [categories, counts]);
  const [tab, setTab] = useState('');
  useEffect(() => { if (!tabs.some((c) => c.slug === tab)) setTab(tabs[0]?.slug || ''); }, [tabs, tab]);
  const inTab = tab ? byCategory(tab) : [];
  const marked = inTab.filter((p) => p.featured);
  const featured = (marked.length ? marked : inTab).slice(0, FEATURED_PER_TAB);

  // Sectors: only those with at least one category in the catalogue
  const sectors = useMemo(
    () => industries.map((i) => ({ ...i, categories: i.categories.filter((slug) => getCategory(slug)) })).filter((i) => i.categories.length),
    [getCategory]
  );
  const [industry, setIndustry] = useState('');
  const current = sectors.find((i) => i.slug === industry) || sectors[0];
  const industryProducts = current ? current.categories.map((c) => byCategory(c)[0]).filter(Boolean).slice(0, 3) : [];

  return (
    <>
      <Hero />

      <section className="home-trust" aria-label="About this store">
        <ul className="wrap home-trust__in">
          <li><Icon name="check" size={18} /> Authorised Elanpro reseller</li>
          <li><Icon name="check" size={18} /> Serving {areas}, Gujarat</li>
          <li><Icon name="check" size={18} /> Genuine products with full specifications</li>
        </ul>
      </section>

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

      {tabs.length > 0 && (
        <section className="section home-featured">
          <div className="wrap">
            <div className="section-head">
              <h2>Featured products</h2>
              <div className="home-tabs" role="tablist" aria-label="Featured products by category">
                {tabs.map((c) => (
                  <button key={c.slug} role="tab" aria-selected={tab === c.slug} className={`chip ${tab === c.slug ? 'is-active' : ''}`} onClick={() => setTab(c.slug)}>
                    {c.shortName}
                  </button>
                ))}
              </div>
            </div>
            <ProductGrid products={featured} columns="4" />
            {tab && (
              <p className="home-featured__more">
                <Link to={`/category/${tab}`} className="text-link">See all {counts[tab]} {getCategory(tab)?.name} products</Link>
              </p>
            )}
          </div>
        </section>
      )}

      <CouponsSection />

      {current && (
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
                {sectors.map((i) => (
                  <li key={i.slug}>
                    <button role="tab" aria-selected={i.slug === current.slug} onClick={() => setIndustry(i.slug)}>{i.name}</button>
                  </li>
                ))}
              </ul>
              <div className="home-ind__panel" role="tabpanel" key={current.slug}>
                <p className="home-ind__need">{current.need}</p>
                <ul className="home-ind__cats">
                  {current.categories.map((slug) => (
                    <li key={slug}><Link to={`/category/${slug}`}>{getCategory(slug)?.name}<Icon name="right" size={18} /></Link></li>
                  ))}
                </ul>
                <div className="home-ind__products">
                  {industryProducts.map((p) => (
                    <Link key={p.id} to={`/product/${p.id}`}>
                      <img src={productImage(p.image)} alt="" loading="lazy" />
                      <span><strong>{p.model}</strong>{p.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section wrap" id="technology">
        <div className="section-head">
          <div>
            <h2>Technology inside every unit</h2>
            <p className="lede">Four things the Elanpro range has in common, whatever it keeps cold.</p>
          </div>
        </div>
        <div className="home-tech">
          {brand.technology.map((t) => (
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
            <h2>Backed by the Elanpro network</h2>
            <p className="lede">Elanpro has supplied commercial refrigeration across India since {brand.established}. As an authorised reseller, {settings.storeName} brings that range to {areas}.</p>
            <Link to="/about" className="text-link">About us</Link>
          </div>
          <dl className="home-reach__stats" aria-label="Elanpro in numbers">
            {brand.footprint.map((f) => (
              <div key={f.label}>
                <dd className="num">{f.value}</dd>
                <dt>{f.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <div>
            <h2>Who uses Elanpro</h2>
            <p className="lede">Businesses named in the Elanpro catalogue as customers of the brand.</p>
          </div>
        </div>
        <div className="home-clients">
          {brand.customers.map((g) => (
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
            <p>Send the model, quantity and city. Our sales team will come back with a quotation.</p>
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
