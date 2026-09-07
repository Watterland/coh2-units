import { describe, expect, it } from 'vitest';
import { abilityBySlug, abilitySlug } from './ability';

describe('ability pages', () => {
  it('resolves a doctrine-only ability', () => {
    const ability = abilityBySlug(abilitySlug('T34 85 Unlock'));
    expect(ability?.name).toBe('T34 85 Unlock');
    expect(ability?.doctrines).toContain('Advanced Warfare Tactics');
    expect(ability?.description).toContain('Т-34-85');
  });

  it('uses game file costs when available', () => {
    const tiger = abilityBySlug(abilitySlug('Tiger Tank'));
    expect(tiger?.cost).toEqual({ manpower: 640, fuel: 230 });
  });

  it('resolves a unit ability', () => {
    const ability = abilityBySlug(abilitySlug('Smoke Barrage'));
    expect(ability?.units.length).toBeGreaterThan(0);
  });
});
