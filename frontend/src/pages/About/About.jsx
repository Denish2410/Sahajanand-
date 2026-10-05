import { Link } from '../../router/index.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { brand as company } from '../../data/brand.js';
import { useSeo } from '../../hooks/useSeo.js';
import { sceneImage } from '../../utils/format.js';
import Icon from '../../components/Icon/Icon.jsx';
import './About.css';

const TECH_ICON = { 'cutting-edge': 'chip', energy: 'bolt', eco: 'leaf', foam: 'layers' };

export default function About() {
  const { openQuote, settings } = useApp();
  const areas = settings.serviceAreas.join(' and ');
  useSeo({
    title: `About ${settings.storeName} | Authorised Elanpro reseller`,
    description: `${settings.storeName} is an authorised reseller of Elanpro commercial refrigeration, serving ${areas}, Gujarat.`,
    path: '/about',
  });
  return (
    <>
      <div className="wrap about">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link><span aria-hidden="true">/</span><span>About</span>
        </nav>
        <header className="about__head">
          <h1>{settings.storeName}: your authorised Elanpro reseller in {areas}.</h1>
          <p className="lede" style={{ marginTop: '1rem' }}>We supply Elanpro commercial refrigeration to kitchens, bars, retailers and institutions across {areas}, Gujarat. Browse the range online, order the models in stock, or ask us for a quotation.</p>
        </header>
        <h2 className="about__sub">About Elanpro</h2>
        <div className="about__grid">
          <img src={sceneImage('chef')} alt="A chef plating food in a professional kitchen" />
          <div className="about__text">
            {company.about.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
            <button className="btn btn-primary" onClick={() => openQuote()}>Request a quote</button>
          </div>
        </div>

        <dl className="about__stats">
          {company.footprint.map((f) => (
            <div key={f.label}><dd className="num">{f.value}</dd><dt>{f.label}</dt></div>
          ))}
        </dl>
        <p className="about__places"><strong>Elanpro’s footprint:</strong> {company.locations.join(', ')}. Figures as published in the Elanpro catalogue.</p>
      </div>

      <section className="about__tech" id="technology">
        <div className="wrap section">
          <h2>Technology in the Elanpro range</h2>
          <div className="about__tech-grid">
            {company.technology.map((t) => (
              <article key={t.key}>
                <Icon name={TECH_ICON[t.key]} size={30} />
                <h3>{t.title}</h3>
                <p>{t.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap section">
        <h2>Who uses Elanpro</h2>
        <p className="lede" style={{ margin: '0.75rem 0 1.5rem' }}>Businesses named in the Elanpro catalogue as customers of the brand.</p>
        <div className="about__clients">
          {company.customers.map((g) => (
            <div key={g.group}>
              <h3>{g.group}</h3>
              <ul>{g.names.map((n) => <li key={n}>{n}</li>)}</ul>
              <p className="muted">and many more</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
