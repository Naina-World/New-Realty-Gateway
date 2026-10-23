import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import PropertyCard from '../components/PropertyCard.jsx';
import PropertyImage from '../components/PropertyImage.jsx';

const TABS = ['Buy Property', 'Invest', 'New Projects', 'Villas', 'Luxury', 'Commercial'];

const GOALS = [
  { title: 'Rental Income', text: 'Find properties with attractive rental yields and income-focused opportunities.', to: '/property' },
  { title: 'Capital Growth', text: 'Discover markets and properties with strong price growth and infrastructure.', to: '/property' },
  { title: 'Long-Term Investment', text: 'Identify opportunities suitable for longer holding periods and stable returns.', to: '/property' },
  { title: 'Second Home', text: 'Discover properties suitable for lifestyle, leisure and personal use abroad.', to: '/property' },
  { title: 'NRI Investment', text: 'Find property opportunities with country-specific rules and eligibility details.', to: '/property' },
  { title: 'Luxury Investment', text: 'Explore premium properties in established and leading property markets.', to: '/property?tab=Luxury' },
];

const FAQS = [
  { q: 'What is NRG?', a: 'NRG is a global property intelligence and discovery platform that helps you discover, compare, verify and understand property opportunities across markets.' },
  { q: 'What can I search for on NRG?', a: 'Homes, villas, luxury residences, commercial spaces and investment properties across India, UAE, Singapore and more.' },
  { q: 'Can I compare properties and projects?', a: 'Yes. Each listing shows price per sq.ft., fair value, rental yield, risk and an opportunity score, so you can compare side by side.' },
  { q: 'What is the NRG Opportunity Score?', a: 'A score out of 100 that combines price fairness, rental potential, growth outlook, verification and risk.' },
  { q: 'How does NRG Fair Value work?', a: 'Fair Value is an estimated price range based on comparable listings, market trends and property attributes.' },
];

export default function Home() {
  const nav = useNavigate();
  const [tab, setTab] = useState(TABS[0]);
  const [q, setQ] = useState('');
  const [markets, setMarkets] = useState([]);
  const [country, setCountry] = useState('All');
  const [featured, setFeatured] = useState([]);
  const [open, setOpen] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.markets(), api.featured()])
      .then(([m, f]) => { setMarkets(m); setFeatured(f); })
      .catch((e) => setError(e.message));
  }, []);

  const countries = ['All', ...new Set(markets.map((m) => m.country))];
  const shown = markets.filter((m) => country === 'All' || m.country === country);

  const search = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (['Villas', 'Luxury', 'Commercial'].includes(tab)) params.set('tab', tab);
    nav(`/property?${params}`);
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <h1>Discover Property.<br />Its Potential.<br />Invest With Confidence.</h1>
          <p>Explore properties, projects and investment opportunities across countries with the intelligence you need to make better property decisions.</p>
        </div>
      </section>

      <section className="container search-wrap">
        <h2 className="center">Discover Property Beyond Borders.</h2>
        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'tab on' : 'tab'} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        <form className="searchbar" onSubmit={search}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search city, property, project or location" aria-label="Search properties" />
          <button className="btn primary" type="submit">Search</button>
        </form>
      </section>

      <section className="container section">
        <h2 className="center">Explore Property Markets Around the World</h2>
        <p className="center muted">Choose a country or city to understand its property market before making a decision.</p>
        <div className="pills">
          {countries.map((c) => (
            <button key={c} className={country === c ? 'pill on' : 'pill'} onClick={() => setCountry(c)}>{c}</button>
          ))}
        </div>
        {error && <p className="error" role="alert">{error}. Is the API running?</p>}
        <div className="markets">
          {shown.map((m, i) => (
            <Link key={m.city} to={`/property?city=${encodeURIComponent(m.city)}`} className="market">
              <PropertyImage seed={i} label={m.city} />
              <div className="market-body">
                <span className="tiny muted">{m.country}</span>
                <h3>{m.city}</h3>
                <dl className="grid2">
                  <div><dt>Rental Yield</dt><dd>{m.avgYield}</dd></div>
                  <div><dt>Price Trend</dt><dd>{m.growth}</dd></div>
                  <div><dt>Listings</dt><dd>{m.count}</dd></div>
                  <div><dt>Opportunity</dt><dd>{m.score}/100</dd></div>
                </dl>
                <span className="link">Explore {m.city} <span aria-hidden="true">›</span></span>
              </div>
            </Link>
          ))}
        </div>
        <div className="center"><Link to="/property" className="btn outline">Explore all Property</Link></div>
      </section>

      <section className="band">
        <div className="container section">
          <h2 className="center">What Is Your Property Investment Goal?</h2>
          <p className="center muted">Discover property opportunities matched to your budget, investment objective, preferred market and expected returns.</p>
          <div className="goals">
            {GOALS.map((g) => (
              <Link to={g.to} className="goal" key={g.title}>
                <h3>{g.title}</h3>
                <p className="muted small">{g.text}</p>
                <span className="link">Explore <span aria-hidden="true">›</span></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container section">
        <h2 className="center">Property Opportunities Worth Exploring</h2>
        <p className="center muted">Handpicked properties and projects selected for their location, value, market potential and investment characteristics.</p>
        <div className="cards three">
          {featured.map((p) => <PropertyCard key={p._id} p={p} />)}
        </div>
        <div className="center"><Link to="/property" className="btn outline">View all properties</Link></div>
      </section>

      <section className="container section narrow">
        <h2 className="center">Frequently Asked Questions</h2>
        <div className="faq">
          {FAQS.map((f, i) => (
            <div key={f.q} className="faq-item">
              <button aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                {f.q}<span aria-hidden="true">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && <p>{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <h2>Find Your Next Property Opportunity</h2>
        <p>Search, compare and discover opportunities that match your budget, location, property type and investment goals.</p>
        <Link to="/property" className="btn primary">Explore All Properties</Link>
      </section>
    </>
  );
}
