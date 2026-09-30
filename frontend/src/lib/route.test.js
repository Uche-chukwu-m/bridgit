import { describe, expect, it } from 'vitest';
import { buildRoute, locate, nextClearance, pointAt } from './route';

// About 1 km due east, then 1 km due north, near Durham NC.
const START = [35.994, -78.9103];
const EAST = [35.994, -78.89921];
const NORTH = [36.003, -78.89921];
const route = buildRoute([START, EAST, NORTH]);

describe('route maths', () => {
  it('measures the route', () => {
    expect(route.length).toBeCloseTo(2000, -1);
  });

  it('locates a point near the route', () => {
    const { offset, along } = locate(route, [35.9942, -78.905]);
    expect(offset).toBeCloseTo(22, 0);
    expect(along).toBeCloseTo(478, -1);
  });

  it('finds the point a distance along, clamped to the ends', () => {
    const [lat, lon] = pointAt(route, route.cumulative[1] + 500);
    expect(lon).toBeCloseTo(EAST[1], 5);
    expect(lat).toBeGreaterThan(EAST[0]);
    expect(pointAt(route, -5)).toEqual(START);
    expect(pointAt(route, 1e9)).toEqual(NORTH);
  });

  it('round-trips pointAt and locate', () => {
    expect(locate(route, pointAt(route, 1234)).along).toBeCloseTo(1234, 0);
  });
});

describe('nextClearance', () => {
  const clearances = [{ along_m: 500 }, { along_m: 1500 }];

  it('finds the next one ahead', () => {
    expect(nextClearance(clearances, 100)).toEqual({ clearance: clearances[0], distance: 400 });
  });

  it('keeps one just passed for a moment, then moves on', () => {
    expect(nextClearance(clearances, 510).clearance).toBe(clearances[0]);
    expect(nextClearance(clearances, 600).clearance).toBe(clearances[1]);
  });

  it('returns null once everything is behind', () => {
    expect(nextClearance(clearances, 1600)).toBeNull();
  });
});
