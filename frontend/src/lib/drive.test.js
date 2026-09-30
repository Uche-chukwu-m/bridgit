import { describe, expect, it } from 'vitest';
import { alertStage, announcement } from './drive';

describe('alertStage', () => {
  it('is quiet far away, then warns at a mile and again up close', () => {
    expect(alertStage(3000)).toBeNull();
    expect(alertStage(1600)).toBe('mile');
    expect(alertStage(300)).toBe('near');
  });
});

describe('announcement', () => {
  const clearance = { clearance_in: 148, spare_in: 10, status: 'ok' };

  it('gives the height and room to spare', () => {
    expect(announcement(clearance, 'mile')).toBe('Low clearance in one mile. 12 feet 4 inches. You have 10 inches to spare.');
    expect(announcement(clearance, 'near')).toBe('Low clearance ahead. 12 feet 4 inches. 10 inches to spare.');
  });

  it('says 1 inch, not 1 inches', () => {
    expect(announcement({ ...clearance, spare_in: 1, status: 'tight' }, 'near')).toContain('1 inch to spare');
  });

  it('tells the driver to stop when the vehicle will not fit', () => {
    expect(announcement({ clearance_in: 132, spare_in: -6, status: 'blocked' }, 'near')).toBe(
      'Warning. Clearance ahead is 11 feet. Your vehicle will not fit. Stop and find another way.',
    );
  });
});
