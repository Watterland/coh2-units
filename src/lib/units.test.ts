import { describe, expect, it } from 'vitest';
import { fmtNearMidFar, round, weaponDps } from './units';

describe('unit formatting', () => {
  it('rounds numbers and handles missing values', () => {
    expect(round(12.345, 2)).toBe('12.35');
    expect(round(null)).toBe('—');
  });

  it('formats near, mid and far values', () => {
    expect(fmtNearMidFar({ near: 10, mid: 5, far: 2 })).toBe('10 / 5 / 2');
  });

  it('calculates approximate dps', () => {
    expect(
      weaponDps({
        damage: { near: 20, mid: 10, far: 5 },
        cooldown: { duration: { min: 1, max: 1 } },
      }),
    ).toBe('20 / 10 / 5');
  });
});
