import { useState } from 'react';
import { Link } from 'react-router-dom';
import PropertyImage from './PropertyImage.jsx';

const hashSeed = (id = '') => [...id].reduce((a, c) => a + c.charCodeAt(0), 0);

export default function PropertyCard({ p }) {
  const [saved, setSaved] = useState(false);
  return (
    <article className="card">
      <div className="card-media">
        <PropertyImage src={p.images?.[0]} seed={hashSeed(p._id)} label={p.title} />
        <span className="chip">{p.category}</span>
        <button
          className={`heart ${saved ? 'on' : ''}`}
          aria-label={saved ? 'Remove from saved' : 'Save property'}
          aria-pressed={saved}
          onClick={() => setSaved(!saved)}
        >♥</button>
      </div>
      <div className="card-body">
        <div className="card-title-row">
          <div>
            <h3 title={p.title}>{p.title}</h3>
            <p className="muted small">{p.locality}, {p.city}{p.country !== p.city ? `, ${p.country}` : ''}</p>
          </div>
          <div className="card-price">
            <span className="muted tiny">{p.areaLabel}</span>
            <strong>{p.priceLabel}</strong>
          </div>
        </div>

        <dl className="grid2">
          <div><dt>Price / sq.ft.</dt><dd>{p.pricePerSqft}</dd></div>
          <div><dt>Fair Value</dt><dd>{p.fairValue}</dd></div>
        </dl>
        <dl className="grid3">
          <div><dt>Rental Yield</dt><dd>{p.rentalYield}</dd></div>
          <div><dt>Risk</dt><dd>{p.risk}</dd></div>
          <div><dt>Growth</dt><dd>{p.growth}</dd></div>
        </dl>
        <dl className="grid2">
          <div><dt>Verification</dt><dd className="ver"><i className={`dot ${p.verified ? 'ok' : 'warn'}`} />{p.verification}</dd></div>
          <div><dt>Opportunity Score</dt><dd>{p.opportunityScore}/100</dd></div>
        </dl>
        <p className="highlight">{p.highlight}</p>
        <Link className="link" to={`/property/${p._id}`}>View Property <span aria-hidden="true">›</span></Link>
      </div>
    </article>
  );
}

