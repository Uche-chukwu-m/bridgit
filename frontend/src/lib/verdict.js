import { formatHeight, formatSpare } from './units';

/** The lowest clearance on a route, or null. */
export function lowest(route) {
  return route.clearances.reduce((low, c) => (!low || c.clearance_in < low.clearance_in ? c : low), null);
}

/** One plain sentence about a route. */
export function describeRoute(route, marginIn) {
  if (route.verdict === 'unchecked') return "Clearances on this route weren't double-checked. Watch for signs.";
  const low = lowest(route);
  const blocked = route.clearances.filter((c) => c.status === 'blocked').length;
  const tight = route.clearances.filter((c) => c.status === 'tight').length;
  if (blocked) {
    return `${blocked === 1 ? 'A clearance' : `${blocked} clearances`} on this route ${blocked === 1 ? 'is' : 'are'} lower than your vehicle. Don't take it.`;
  }
  if (tight) {
    return `Fits, but with less than your ${marginIn}″ margin at ${tight === 1 ? 'one spot' : `${tight} spots`}.`;
  }
  if (!low) return 'No low clearances found on this route.';
  const where = low.name ? ` on ${low.name}` : '';
  return `Fits under everything. Lowest is ${formatHeight(low.clearance_in)}${where}, ${formatSpare(low.spare_in)} to spare.`;
}

export const VERDICT_LABEL = { clear: 'Fits', caution: 'Tight', unsafe: 'Too low', unchecked: 'Unchecked' };
