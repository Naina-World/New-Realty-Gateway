async function get(path, params) {
  const qs = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null && v !== false)).toString()
    : '';
  const res = await fetch(`/api${path}${qs}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Request failed');
  }
  return res.json();
}

export const api = {
  properties: (params) => get('/properties', params),
  filters: () => get('/properties/filters'),
  markets: () => get('/properties/markets'),
  featured: () => get('/properties/featured'),
  property: (id) => get(`/properties/${id}`),
};
