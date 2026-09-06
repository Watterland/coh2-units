import type { NearMidFar, Unit, UnitLite } from '../types';

export function round(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined) return '—';
  const v = Number(n);
  if (Number.isNaN(v)) return '—';
  return String(Math.round(v * 10 ** digits) / 10 ** digits);
}

type WeaponValue = NearMidFar | { min: number; max: number } | { amount: number };

export function fmtNearMidFar(nmf: WeaponValue | undefined): string {
  if (!nmf) return '—';
  if ('near' in nmf && 'mid' in nmf && 'far' in nmf) {
    return [nmf.near, nmf.mid, nmf.far].map((v) => round(v)).join(' / ');
  }
  if ('max' in nmf) return round(nmf.max);
  if ('amount' in nmf) return round(nmf.amount);
  return '—';
}

export function weaponDps(weapon: {
  damage?: NearMidFar | { min: number; max: number };
  cooldown?: Record<string, unknown>;
}): string {
  const damage = weapon.damage;
  const duration = weapon.cooldown?.duration as { min?: number; max?: number } | undefined;
  if (!damage || !duration || typeof duration.min !== 'number' || typeof duration.max !== 'number')
    return '—';
  const cooldown = (duration.min + duration.max) / 2;
  if (cooldown <= 0) return '—';
  if ('near' in damage && 'mid' in damage && 'far' in damage) {
    return [damage.near, damage.mid, damage.far]
      .map((value) => round(value / cooldown, 1))
      .join(' / ');
  }
  if (typeof damage.max !== 'number') return '—';
  return round(damage.max / cooldown, 1);
}

export function unitByIndex(units: Unit[], index: number): Unit | undefined {
  return units.find((u) => u.index === index);
}

export function vetBonuses(unit: Unit, level: number): string[] {
  const current = unit.vetStats[level];
  const previous = unit.vetStats[level - 1];
  if (!current || !previous) return [];
  const changes: [keyof typeof current, string][] = [
    ['health', 'здоровье'],
    ['target_size', 'размер цели'],
    ['sight', 'обзор'],
    ['speed', 'скорость'],
    ['accel', 'ускорение'],
    ['rotate', 'скорость поворота'],
    ['front_armor', 'лобовая броня'],
    ['rear_armor', 'кормовая броня'],
  ];
  return changes.flatMap(([key, label]) => {
    const before = previous[key];
    const after = current[key];
    if (before == null || after == null || before === after) return [];
    const delta = Number(after) - Number(before);
    return [`${label}: ${delta > 0 ? '+' : ''}${round(delta, 2)}`];
  });
}

export function unitsByFaction<T extends Unit | UnitLite>(units: T[], faction: string): T[] {
  return units.filter((u) => u.faction === faction).sort((a, b) => a.index - b.index);
}

export const CATEGORIES = ['Infantry', 'Team weapons', 'Vehicles'] as const;

export function groupByCategory(units: Unit[]): Map<string, Unit[]> {
  const map = new Map<string, Unit[]>();
  for (const cat of CATEGORIES) map.set(cat, []);
  for (const u of units) {
    const list = map.get(u.category) ?? [];
    list.push(u);
  }
  return map;
}
