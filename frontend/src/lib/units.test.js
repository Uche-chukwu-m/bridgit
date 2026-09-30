import { describe, expect, it } from 'vitest';
import { formatDistance, formatDuration, formatHeight, formatSpare, speakHeight, splitHeight } from './units';

describe('heights', () => {
  it('splits and formats, rounding down', () => {
    expect(splitHeight(148.9)).toEqual({ feet: 12, inches: 4 });
    expect(formatHeight(148)).toBe('12′ 4″');
    expect(formatHeight(144)).toBe('12′ 0″');
  });

  it('speaks naturally', () => {
    expect(speakHeight(148)).toBe('12 feet 4 inches');
    expect(speakHeight(144)).toBe('12 feet');
  });

  it('formats spare room', () => {
    expect(formatSpare(10)).toBe('10″');
    expect(formatSpare(14)).toBe('1′ 2″');
    expect(formatSpare(-2)).toBe('0″');
  });
});

describe('distances and durations', () => {
  it('uses feet up close and miles further out', () => {
    expect(formatDistance(100)).toBe('350 ft');
    expect(formatDistance(1609.344)).toBe('1.0 mi');
    expect(formatDistance(40000)).toBe('25 mi');
  });

  it('formats durations', () => {
    expect(formatDuration(20)).toBe('1 min');
    expect(formatDuration(45 * 60)).toBe('45 min');
    expect(formatDuration(80 * 60)).toBe('1 h 20 min');
    expect(formatDuration(120 * 60)).toBe('2 h');
  });
});
