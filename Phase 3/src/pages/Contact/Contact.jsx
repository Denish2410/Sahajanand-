import { Link } from '../../router/index.jsx';
import { company } from '../../data/company.js';
import QuoteForm from '../../components/QuoteModal/QuoteForm.jsx';
import Icon from '../../components/Icon/Icon.jsx';
import '../../components/QuoteModal/QuoteModal.css';
import './Contact.css';

export default function Contact() {
  return (
    <div className="wrap contact">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span aria-hidden="true">/</span><span>Contact</span>
      </nav>
      <div className="contact__grid">
        <div>
          <h1>Contact sales</h1>
          <p className="lede">Call customer care, write to us, or send an enquiry and the sales team will contact you.</p>
          <ul className="contact__list">
            {company.phones.map((p) => (
              <li key={p}><Icon name="phone" /><a href={`tel:${p.replace(/[^+\d]/g, '')}`}>{p}</a></li>
            ))}
            <li><Icon name="mail" /><a href={`mailto:${company.email}`}>{company.email}</a></li>
          </ul>
          <dl className="contact__meta">
            <div><dt>Company</dt><dd>{company.legalName}</dd></div>
            <div><dt>Headquarters</dt><dd>{company.headquarters}</dd></div>
            <div><dt>Service network</dt><dd>{company.footprint[1].value} service partners across {company.footprint[4].value} states and UTs</dd></div>
          </dl>
        </div>
        <div className="contact__form">
          <h2>Send an enquiry</h2>
          <QuoteForm />
        </div>
      </div>
    </div>
  );
}
