import { describe, expect, it } from 'vitest';
import { abilityBySlug, abilitySlug } from './ability';

describe('ability pages', () => {
  it('resolves a doctrine-only ability', () => {
    const ability = abilityBySlug(abilitySlug('T34 85 Unlock'));
    expect(ability?.name).toBe('T34 85 Unlock');
    expect(ability?.doctrines).toContain('Advanced Warfare Tactics');
  });

  it('resolves a unit ability', () => {
    const ability = abilityBySlug(abilitySlug('Smoke Barrage'));
    expect(ability?.units.length).toBeGreaterThan(0);
  });
});
