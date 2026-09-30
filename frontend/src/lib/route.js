// Where am I on the route, and what's coming up? Points are [lat, lon]; distances metres.

const METRES_PER_DEGREE = (Math.PI * 6371008.8) / 180;

function haversine([lat1, lon1], [lat2, lon2]) {
  const toRad = (d) => (d * Math.PI) / 180;
  const h =
    Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lon2 - lon1) / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.sqrt(h));
}

export function buildRoute(points) {
  const cumulative = [0];
  for (let i = 1; i < points.length; i++) {
    cumulative.push(cumulative[i - 1] + haversine(points[i - 1], points[i]));
  }
  return { points, cumulative, length: cumulative[cumulative.length - 1] };
}

/** Closest point on the route: how far off it we are, and how far along. */
export function locate(route, [lat, lon]) {
  const ky = METRES_PER_DEGREE;
  const kx = Math.cos((lat * Math.PI) / 180) * METRES_PER_DEGREE;
  let best = { offset: Infinity, along: 0 };
  const { points, cumulative } = route;
  for (let i = 0; i < points.length - 1; i++) {
    const ax = (points[i][1] - lon) * kx;
    const ay = (points[i][0] - lat) * ky;
    const dx = (points[i + 1][1] - points[i][1]) * kx;
    const dy = (points[i + 1][0] - points[i][0]) * ky;
    const seg2 = dx * dx + dy * dy;
    const t = seg2 === 0 ? 0 : Math.min(1, Math.max(0, -(ax * dx + ay * dy) / seg2));
    const offset = Math.hypot(ax + t * dx, ay + t * dy);
    if (offset < best.offset) {
      best = { offset, along: cumulative[i] + t * (cumulative[i + 1] - cumulative[i]) };
    }
  }
  return best;
}

/** The point a given distance along the route. */
export function pointAt(route, along) {
  const { points, cumulative, length } = route;
  const d = Math.min(Math.max(along, 0), length);
  let i = 0;
  while (i < points.length - 2 && cumulative[i + 1] < d) i++;
  const seg = cumulative[i + 1] - cumulative[i];
  const t = seg === 0 ? 0 : (d - cumulative[i]) / seg;
  const [alat, alon] = points[i];
  const [blat, blon] = points[i + 1];
  return [alat + t * (blat - alat), alon + t * (blon - alon)];
}

/** The next clearance ahead of `along`, and how far away it is. Passed ones drop off after a short grace. */
export function nextClearance(clearances, along, grace = 30) {
  const next = clearances.find((c) => c.along_m >= along - grace);
  return next ? { clearance: next, distance: Math.max(0, next.along_m - along) } : null;
}
