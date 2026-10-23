import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import PropertyCard from '../components/PropertyCard.jsx';
import PropertyImage from '../components/PropertyImage.jsx';

function Section({ title, children, id }) {
  return (
    <section className="dsec" id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Rows({ rows, strongLast }) {
  return (
    <table className="rows">
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.label} className={strongLast && i === rows.length - 1 ? 'total' : ''}>
            <th scope="row">{r.label}</th>
            <td>{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function PropertyDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [scenario, setScenario] = useState('positive');
  const [why, setWhy] = useState('why');
  const [faq, setFaq] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setData(null);
    setError('');
    api.property(id).then(setData).catch((e) => setError(e.message));
  }, [id]);

  if (error)
    return (
      <div className="container empty">
        <h2>{error}</h2>
        <p>This property may have been removed.</p>
        <Link className="btn outline" to="/property">Back to properties</Link>
      </div>
    );
  if (!data) return <div className="container empty" aria-busy="true">Loading property…</div>;

  const { property: p, similar } = data;
  const d = p.details;
  const seed = [...p._id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const scenarioLabels = { positive: 'Positive Scenario', base: 'Base Scenario', risk: 'Risk Scenario' };
  const facts = [
    ['Property Type', d.propertyType], ['Bedrooms', p.bedrooms || '—'], ['Area', `${p.areaSqft.toLocaleString()} sq.ft.`],
    ['Bathrooms', p.bathrooms], ['Parking', d.parking], ['Floor', d.floor],
    ['Property Status', d.status], ['Furnishing', d.furnishing], ['Possession', d.possession],
    ['Listed By', d.listedBy], ['Address', d.address],
  ];

  return (
    <div className="container detail">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> › <Link to="/property">Property</Link> › <span>{p.title}</span>
      </nav>

      <div className="gallery">
        <PropertyImage className="g-main" src={p.images?.[0]} seed={seed} label={p.title} />
        {[1, 2, 3].map((n) => <PropertyImage key={n} className="g-side" src={p.images?.[n]} seed={seed + n} label={`${p.title} view ${n}`} />)}
      </div>

      <div className="title-row">
        <div>
          <h1>{p.title}</h1>
          <p className="muted"><span className="ok-text">● {p.verification}</span> · Last Reviewed: {d.lastReviewed}</p>
          <p className="muted small">{p.locality}, {p.city}</p>
        </div>
        <div className="title-price">
          <strong>{p.priceLabel}</strong>
          <span className="muted small">{p.areaLabel}</span>
          <button className="btn outline" aria-pressed={saved} onClick={() => setSaved(!saved)}>{saved ? '♥ Saved' : '♡ Save'}</button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="main-col">
          <div className="facts">
            {facts.map(([k, v]) => <div key={k}><span className="muted tiny">{k}</span><strong>{v}</strong></div>)}
          </div>

          <Section title="Amenities">
            <ul className="amenities">{p.amenities.map((a) => <li key={a}>{a}</li>)}</ul>
          </Section>

          <Section title="Investment Intelligence">
            <div className="tiles">
              <div><span className="muted tiny">Opportunity</span><strong>{p.investment.opportunity}/100</strong></div>
              <div><span className="muted tiny">Fair Value</span><strong>{p.investment.fairValue}</strong></div>
              <div><span className="muted tiny">Risk Score</span><strong>{p.investment.riskScore}</strong></div>
              <div><span className="muted tiny">Future Growth</span><strong>{p.investment.futureGrowth}</strong></div>
            </div>
          </Section>

          <Section title="Is the Property Fairly Priced?">
            <div className="tiles three">
              <div><span className="muted tiny">Asking Price</span><strong>{p.priceLabel}</strong></div>
              <div><span className="muted tiny">Price / sq.ft.</span><strong>{p.pricePerSqft}</strong></div>
              <div><span className="muted tiny">NRG Fair Value</span><strong>{p.fairValue}</strong></div>
            </div>
          </Section>

          <Section title="About Project">
            <div className="project">
              <PropertyImage className="project-img" src={p.images?.[1]} seed={seed + 2} label={p.project.name} />
              <div>
                <h3>{p.project.name}</h3>
                <p className="muted small">by {p.project.developer}</p>
                <p className="small">{p.project.description}</p>
              </div>
            </div>
            <div className="tiles">
              <div><span className="muted tiny">Price</span><strong>{p.project.priceRange}</strong></div>
              <div><span className="muted tiny">Price / sq.ft.</span><strong>{p.project.perSqftRange}</strong></div>
              <div><span className="muted tiny">Flats</span><strong>{p.project.flats}</strong></div>
              <div><span className="muted tiny">Towers & Units</span><strong>{p.project.towers}</strong></div>
            </div>
          </Section>

          <Section title="Understand the Location">
            <div className="map" role="img" aria-label={`Map area for ${p.locality}, ${p.city}`}>
              <span className="pin">📍</span>
              <span className="pin-label">{p.title}</span>
            </div>
            <div className="nearby">
              {p.nearby.map((g) => (
                <div key={g.group}>
                  <h3>{g.group}</h3>
                  <ul>{g.items.map((i) => <li key={i}>{i}</li>)}</ul>
                </div>
              ))}
            </div>
          </Section>

          <Section title="See the Market. Understand the Opportunity.">
            <div className="scroll-x">
              <table className="market-table">
                <thead><tr><th>Project Name</th><th>Comparable Pricing</th><th>Market Trend</th><th>Rental Information</th><th>Demand</th></tr></thead>
                <tbody>
                  {p.market.map((m) => (
                    <tr key={m.name}>
                      <td>{m.name}</td>
                      <td>{m.pricing}<br /><span className="muted tiny">{m.perSqft}/sq.ft.</span></td>
                      <td>{m.trend}<br /><span className="muted tiny">1-Year Price Growth</span></td>
                      <td>{m.rent}<br /><span className="muted tiny">{m.yield} yield</span></td>
                      <td className={m.demand === 'High' ? 'ok-text' : 'warn-text'}>{m.demand}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Verify Before You Decide">
            <div className="tiles">
              {p.verificationChecks.map((v) => (
                <div key={v.label}>
                  <span className="muted tiny">{v.label}</span>
                  <strong className={v.status === 'Verified' ? 'ok-text' : 'warn-text'}>{v.status === 'Verified' ? '✓ ' : ''}{v.status}</strong>
                  <span className="muted tiny">Last Reviewed: {v.date}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Cost of Acquisition"><Rows rows={p.acquisitionCosts} strongLast /></Section>
          <Section title="Ongoing Holding Costs"><Rows rows={p.holdingCosts} /></Section>

          <Section title="What Could Influence This Property in the Future?">
            <div className="seg" role="tablist">
              {Object.entries(scenarioLabels).map(([k, label]) => (
                <button key={k} role="tab" aria-selected={scenario === k} className={scenario === k ? 'on' : ''} onClick={() => setScenario(k)}>{label}</button>
              ))}
            </div>
            <ul className="bullets">{p.scenarios[scenario].map((s) => <li key={s}>{s}</li>)}</ul>
          </Section>

          <Section title="Why Consider This Property?">
            <div className="seg" role="tablist">
              <button role="tab" aria-selected={why === 'why'} className={why === 'why' ? 'on' : ''} onClick={() => setWhy('why')}>Why Consider It?</button>
              <button role="tab" aria-selected={why === 'what'} className={why === 'what' ? 'on' : ''} onClick={() => setWhy('what')}>What to Consider?</button>
            </div>
            <ul className="checks">
              {(why === 'why' ? p.whyConsider : p.whatToConsider).map((s) => <li key={s}>{s}</li>)}
            </ul>
          </Section>
        </div>

        <aside className="side-col">
          <div className="agent">
            <h3>Need Professional Guidance?</h3>
            <div className="agent-row">
              <span className="avatar" aria-hidden="true">{p.agent.name[0]}</span>
              <div>
                <strong>{p.agent.name} <span className="ok-text">●</span></strong>
                <p className="muted small">{p.agent.firm}<br />{p.agent.location}</p>
              </div>
            </div>
            <p className="small">{p.agent.experience} · {p.agent.rating} ★</p>
            <button className="btn primary block" onClick={() => alert(`Request sent to ${p.agent.name}. (Demo)`)}>Connect With Expert</button>
          </div>
        </aside>
      </div>

      <section className="dsec">
        <h2 className="center">Explore Similar Opportunities</h2>
        <div className="cards three">{similar.map((s) => <PropertyCard key={s._id} p={s} />)}</div>
      </section>

      <section className="dsec narrow-block">
        <h2 className="center">Frequently Asked Questions</h2>
        <div className="faq">
          {p.faqs.map((f, i) => (
            <div key={f.q} className="faq-item">
              <button aria-expanded={faq === i} onClick={() => setFaq(faq === i ? -1 : i)}>{f.q}<span aria-hidden="true">{faq === i ? '−' : '+'}</span></button>
              {faq === i && <p>{f.a}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
