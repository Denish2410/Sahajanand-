import { Link } from '../../router/index.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { company } from '../../data/company.js';
import { sceneImage } from '../../utils/format.js';
import Icon from '../../components/Icon/Icon.jsx';
import './About.css';

const TECH_ICON = { 'cutting-edge': 'chip', energy: 'bolt', eco: 'leaf', foam: 'layers' };

export default function About() {
  const { openQuote } = useApp();
  return (
    <>
      <div className="wrap about">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link><span aria-hidden="true">/</span><span>About</span>
        </nav>
        <header className="about__head">
          <h1>A trusted name in India’s commercial refrigeration industry since {company.established}.</h1>
        </header>
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
        <p className="about__places"><strong>Our footprint:</strong> {company.locations.join(', ')}.</p>
      </div>

      <section className="about__tech" id="technology">
        <div className="wrap section">
          <h2>Technology we serve</h2>
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
        <h2>Our trusted customers</h2>
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
