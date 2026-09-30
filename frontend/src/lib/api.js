// Talks to Bridgit's own backend. In development Vite proxies /api to it.

async function request(path, options) {
  let response;
  try {
    response = await fetch(`/api${path}`, options);
  } catch {
    throw new Error("Can't reach Bridgit's server. Check your connection and try again.");
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = body?.detail;
    throw new Error(typeof detail === 'string' ? detail : 'Something went wrong. Please try again.');
  }
  return body;
}

export const getHealth = () => request('/health');

export const searchPlaces = (q, signal) => request(`/places?q=${encodeURIComponent(q)}`, { signal });

export const planTrip = ({ origin, destination, heightIn, marginIn }) =>
  request('/trip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin, destination, vehicle_height_in: heightIn, margin_in: marginIn }),
  });

export function estimateHeight(blob) {
  const form = new FormData();
  form.append('photo', blob, 'vehicle.jpg');
  return request('/estimate-height', { method: 'POST', body: form });
}
