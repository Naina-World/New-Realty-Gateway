import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import PropertyCard from '../components/PropertyCard.jsx';

const TABS = ['Buy Property', 'Invest', 'New Projects', 'Villas', 'Luxury', 'Commercial'];
const EMPTY = { country: '', city: '', type: '', bedrooms: '', verified: false, minArea: '', maxArea: '' };

export default function Properties() {
  const [sp, setSp] = useSearchParams();
  const [options, setOptions] = useState({ countries: [], cities: [], types: [] });
  const [draft, setDraft] = useState({ ...EMPTY, country: sp.get('country') || '', city: sp.get('city') || '', type: sp.get('type') || '', verified: sp.get('verified') === 'true', bedrooms: sp.get('bedrooms') || '', minArea: sp.get('minArea') || '', maxArea: sp.get('maxArea') || '' });
  const [q, setQ] = useState(sp.get('q') || '');
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const page = Number(sp.get('page') || 1);
  const tab = sp.get('tab') || 'Buy Property';

  useEffect(() => { api.filters().then(setOptions).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    api.properties({
      country: sp.get('country'), city: sp.get('city'), type: sp.get('type'), bedrooms: sp.get('bedrooms'),
      verified: sp.get('verified') === 'true', q: sp.get('q'), minArea: sp.get('minArea'), maxArea: sp.get('maxArea'),
      tab: sp.get('tab'), page, limit: 6,
    })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sp]);

  const commit = (next, extra = {}) => {
    const params = {};
    Object.entries({ ...next, q, tab, ...extra }).forEach(([k, v]) => { if (v !== '' && v !== false && v != null && !(k === 'tab' && v === 'Buy Property')) params[k] = String(v); });
    setSp(params);
  };

  const apply = () => commit(draft, { page: '' });
  const reset = () => { setDraft(EMPTY); setQ(''); setSp({}); };
  const set = (k) => (e) => setDraft({ ...draft, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const goPage = (n) => { commit(draft, { page: n }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <>
      <section className="hero small-hero">
        <div className="container">
          <h1>Explore Property Markets<br />Around the World</h1>
          <p>Search verified properties across global markets and explore everything from homes and plots to commercial spaces and luxury residences.</p>
        </div>
      </section>

      <section className="container search-wrap">
        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'tab on' : 'tab'} onClick={() => commit(draft, { tab: t, page: '' })}>{t}</button>
          ))}
        </div>
        <form className="searchbar" onSubmit={(e) => { e.preventDefault(); apply(); }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search city, property, project or location" aria-label="Search properties" />
          <button className="btn primary" type="submit">Search</button>
        </form>
        <p className="center muted" aria-live="polite">{loading ? 'Searching…' : `We found ${data.total} ${data.total === 1 ? 'property' : 'properties'} matching your search criteria.`}</p>
      </section>

      <section className="container listing">
        <aside className="filters" aria-label="Filters">
          <div className="filters-head"><h2>Filters</h2><button className="reset" onClick={reset}>Reset All</button></div>

          <label>Country
            <select value={draft.country} onChange={set('country')}>
              <option value="">Select Country</option>
              {options.countries.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>City
            <select value={draft.city} onChange={set('city')}>
              <option value="">Select City</option>
              {options.cities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>Property Type
            <select value={draft.type} onChange={set('type')}>
              <option value="">Select Property Type</option>
              {options.types.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>

          <fieldset>
            <legend>Area Size (sq.ft.)</legend>
            <div className="range">
              <input type="number" min="0" placeholder="Min" aria-label="Minimum area" value={draft.minArea} onChange={set('minArea')} />
              <input type="number" min="0" placeholder="Max" aria-label="Maximum area" value={draft.maxArea} onChange={set('maxArea')} />
            </div>
          </fieldset>

          <fieldset>
            <legend>Bedrooms</legend>
            <div className="beds">
              {['', '1', '2', '3', '4', '5'].map((b) => (
                <button type="button" key={b || 'any'} className={draft.bedrooms === b ? 'bed on' : 'bed'} aria-pressed={draft.bedrooms === b} onClick={() => setDraft({ ...draft, bedrooms: b })}>
                  {b === '' ? 'Any' : b === '5' ? '5+' : b}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Verification</legend>
            <label className="check"><input type="checkbox" checked={draft.verified} onChange={set('verified')} /> Verified listings only</label>
          </fieldset>

          <button className="btn primary block" onClick={apply}>Apply Filter</button>
        </aside>

        <div>
          {error && <p className="error" role="alert">{error}. Is the API running?</p>}
          {!loading && !error && data.items.length === 0 && (
            <div className="empty"><h3>No properties match these filters</h3><p>Try removing a filter or searching a different location.</p><button className="btn outline" onClick={reset}>Reset all filters</button></div>
          )}
          <div className="cards two">
            {data.items.map((p) => <PropertyCard key={p._id} p={p} />)}
          </div>
          {data.pages > 1 && (
            <nav className="pager" aria-label="Pagination">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                <button key={n} className={n === page ? 'on' : ''} aria-current={n === page ? 'page' : undefined} onClick={() => goPage(n)}>{String(n).padStart(2, '0')}</button>
              ))}
            </nav>
          )}
        </div>
      </section>

      <section className="cta">
        <h2>Find Your Next Property Opportunity</h2>
        <p>Explore thousands of properties across global markets. Search, compare and discover opportunities that match your budget, location, property type and investment goals.</p>
        <button className="btn primary" onClick={reset}>Explore All Properties</button>
      </section>
    </>
  );
}
