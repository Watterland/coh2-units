import { describe, expect, it } from 'vitest';
import { computeEstimatedVetStats } from './veterancy';
import type { VetStats } from '../types';

const base: VetStats = {
  target_size: 1,
  sight: 35,
  speed: 5,
  accel: 2,
  rotate: 24,
  front_armor: 80,
  rear_armor: 40,
  health: 640,
  population: 12,
  num_entities: 4,
};

const stats = (over: Partial<VetStats>): VetStats => ({ ...base, ...over });

describe('computeEstimatedVetStats', () => {
  it('estimates speed at vet 1 from the base value', () => {
    const result = computeEstimatedVetStats([base, null, null, null], {
      1: ['максимальная скорость ×1.2'],
    });
    expect(result[0]).toBeNull();
    expect(result[1]?.speed).toBeCloseTo(6);
  });

  it('accumulates multipliers on top of the previous estimate', () => {
    const result = computeEstimatedVetStats([base, null, null, null], {
      1: ['максимальная скорость ×1.2'],
      2: ['максимальная скорость ×1.2'],
    });
    expect(result[2]?.speed).toBeCloseTo(5 * 1.44);
  });

  it('applies the armor multiplier to both armor fields', () => {
    const result = computeEstimatedVetStats([base, null, null, null], {
      2: ['броня ×1.15'],
    });
    expect(result[2]?.front_armor).toBeCloseTo(92);
    expect(result[2]?.rear_armor).toBeCloseTo(46);
  });

  it('ignores labels that do not map to stat fields', () => {
    const result = computeEstimatedVetStats([base, null, null, null], {
      3: ['точность оружия ×1.3', 'дальность оружия +5', 'стоимость способности (муниции) · способность +'],
    });
    expect(result[3]).toBeNull();
  });

  it('adds flat bonuses to the base value', () => {
    const result = computeEstimatedVetStats([base, null, null, null], {
      1: ['здоровье +20', 'обзор +15'],
    });
    expect(result[1]).toEqual({ health: 660, sight: 50 });
  });

  it('skips fields without a base value', () => {
    const result = computeEstimatedVetStats([stats({ health: null }), null, null, null], {
      1: ['здоровье +20'],
    });
    expect(result[1]).toBeNull();
  });

  it('prefers previous real stats over estimates', () => {
    const result = computeEstimatedVetStats([base, stats({ speed: 7 }), null, null], {
      2: ['максимальная скорость ×1.2'],
    });
    expect(result[2]?.speed).toBeCloseTo(8.4);
  });
});
