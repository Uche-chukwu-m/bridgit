import { describe, expect, it } from 'vitest';
import { describeRoute, lowest } from './verdict';

const c = (clearance_in, spare_in, status, name = null) => ({ clearance_in, spare_in, status, name });

describe('describeRoute', () => {
  it('says when nothing low was found', () => {
    expect(describeRoute({ clearances: [] }, 3)).toBe('No low clearances found on this route.');
  });

  it('names the lowest clearance on a clear route', () => {
    const route = { clearances: [c(160, 22, 'ok'), c(148, 10, 'ok', 'Gregson Street')] };
    expect(lowest(route).clearance_in).toBe(148);
    expect(describeRoute(route, 3)).toBe('Fits under everything. Lowest is 12′ 4″ on Gregson Street, 10″ to spare.');
  });

  it('warns about tight spots', () => {
    expect(describeRoute({ clearances: [c(140, 2, 'tight'), c(160, 22, 'ok')] }, 3)).toBe(
      'Fits, but with less than your 3″ margin at one spot.',
    );
  });

  it('never claims a clear route when nothing was checked', () => {
    expect(describeRoute({ verdict: 'unchecked', clearances: [] }, 3)).toBe(
      "Clearances on this route weren't double-checked. Watch for signs.",
    );
  });

  it('says plainly when a route is too low', () => {
    expect(describeRoute({ clearances: [c(130, -8, 'blocked'), c(120, -18, 'blocked')] }, 3)).toBe(
      "2 clearances on this route are lower than your vehicle. Don't take it.",
    );
  });
});
