// The hero is a temperature axis. The catalogue runs from −86°C laboratory
// freezers to 90°C heated showcases; each stop puts a real product on that scale.
import { useEffect, useState } from 'react';
import { Link } from '../../router/index.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useCatalogue } from '../../hooks/useCatalogue.js';
import { productImage } from '../../utils/format.js';
import './Hero.css';

const STOPS = [
  { reading: '−35°C', label: 'Blast chillers', model: 'ED10', category: 'professional-kitchen' },
  { reading: '−18°C', label: 'Display freezers', model: 'EFGV 1000', category: 'retail-solution' },
  { reading: '−2 to −10°C', label: 'Glass frosters', model: 'EGF 5G', category: 'bar-refrigeration' },
  { reading: '2 to 8°C', label: 'Reach-in coolers', model: 'EGN 1500 C4', category: 'professional-kitchen' },
  { reading: '5 to 22°C', label: 'Wine coolers', model: 'EWG 130 D', category: 'bar-refrigeration' },
  { reading: '4 to 25°C', label: 'Vending machines', model: 'Galaxy', category: 'vending-machine' },
];
const START = 3;

export default function Hero() {
  const { openQuote } = useApp();
  const { getByModel, getCategory } = useCatalogue();
  const [active, setActive] = useState(START);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setActive((i) => (i + 1) % STOPS.length), 4500);
    return () => clearInterval(t);
  }, [paused]);

  const stop = STOPS[active];
  const product = getByModel(stop.model);

  return (
    <section className="hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <h1 className="hero__title">Every temperature your business runs on.</h1>
          <p className="hero__lede">
            From −35°C blast chillers to 22°C wine storage: commercial refrigeration for kitchens, bars, retail, ice and vending, from a name India has trusted since 2009.
          </p>
          <div className="hero__cta">
            <Link to="/products" className="btn btn-primary">Explore products</Link>
            <button className="btn btn-light" onClick={() => openQuote()}>Request a quote</button>
          </div>
        </div>

        <div className="hero__stage">
          <p className="hero__reading num" key={`r${active}`} aria-hidden="true">{stop.reading}</p>
          {product && (
            <Link to={`/product/${product.id}`} className="hero__product" key={active}>
              <img src={productImage(product.image)} alt={`${product.model}, ${product.name}`} />
              <span className="hero__tag">
                <strong>{product.model}</strong>
                <span>{product.name}</span>
                <small>{getCategory(stop.category)?.name}</small>
              </span>
            </Link>
          )}
        </div>
      </div>

      <div className="wrap">
        <div className="hero__axis" role="tablist" aria-label="Browse the range by temperature">
          {STOPS.map((s, i) => (
            <button key={s.model} role="tab" aria-selected={i === active} className="hero__stop" onClick={() => { setActive(i); setPaused(true); }}>
              <span className="hero__stop-reading num">{s.reading}</span>
              <span className="hero__stop-label">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
