import type { Unit, VetStats } from '../types';
import { veterancyEffects } from '../data/veterancy';
import { veteranWeaponBonuses } from './weaponModes';
import { abilitiesForUnit } from '../data';

// Данные выше третьего уровня не встречаются даже у OKW (формально 5 уровней):
// пустые уровни не имеют смысла, поэтому потолок фактический.
export const MAX_VET_LEVEL = 3;

function hasLevelData(unit: Unit, level: number, weapons: Record<number, string[]>): boolean {
  return Boolean(
    veterancyEffects[unit.index]?.[level]?.length ||
      unit.vetStats[level] != null ||
      weapons[level]?.length,
  );
}

// Максимальный уровень с хоть какими-то данными (эффекты, статы или оружие).
export function unitVetLevels(unit: Unit): number {
  const weapons = veteranWeaponBonuses(unit);
  let max = 0;
  for (let level = 1; level <= MAX_VET_LEVEL; level++) {
    if (hasLevelData(unit, level, weapons)) max = level;
  }
  return max;
}

// Есть ли ветеранство вообще.
export function unitHasVeterancy(unit: Unit): boolean {
  return unitVetLevels(unit) > 0;
}

export type VetStatsEstimate = Partial<Record<keyof VetStats | 'rear_armor', number>>;

// «метка ×N» / «метка +N»; легаси-строки «имя · цель ×» (без числа) не матчатся,
// как и слагаемые с разделителем «-» (полей для них в таблице статов нет).
const EFFECT_RE = /^(.+?)\s*([×+])\s*(-?[\d.]+)$/;

// Метки эффектов, маппящиеся на поля статов (остальные метки — точность,
// перезарядка, уворот, дальность и т.п. — в таблицу статов не попадают).
const LABEL_FIELDS: Record<string, (keyof VetStats)[]> = {
  'максимальная скорость': ['speed'],
  'скорость поворота': ['rotate'],
  'обзор': ['sight'],
  'здоровье': ['health'],
  'броня': ['front_armor', 'rear_armor'],
  'стоимость отряда (людские ресурсы)': ['population'],
};

export interface ParsedVetEffect {
  fields: (keyof VetStats)[];
  op: '×' | '+';
  value: number;
}

export function parseVetEffect(line: string): ParsedVetEffect | null {
  const match = line.match(EFFECT_RE);
  if (!match) return null;
  const fields = LABEL_FIELDS[match[1].trim()];
  if (!fields) return null;
  const value = Number(match[3]);
  if (!Number.isFinite(value) || value < 0) return null;
  return { fields, op: match[2] as '×' | '+', value };
}

// Оценка абсолютных статов уровня, вычисленная из модификаторов ветеранства
// (мультипликаторы/сложения накапливаются от предыдущего уровня).
export function computeEstimatedVetStats(
  vetStats: (VetStats | null)[],
  effects: Record<number, string[]> | undefined,
): (VetStatsEstimate | null)[] {
  const estimates: (VetStatsEstimate | null)[] = [null];
  for (let level = 1; level <= MAX_VET_LEVEL; level++) {
    const lines = effects?.[level] ?? [];
    const estimate: VetStatsEstimate = {};
    for (const line of lines) {
      const parsed = parseVetEffect(line);
      if (!parsed) continue;
      for (const field of parsed.fields) {
        // Цепочка от предыдущего уровня: реальный стат → оценка → база.
        const previous =
          vetStats[level - 1]?.[field] ?? estimates[level - 1]?.[field] ?? vetStats[0]?.[field];
        if (previous == null) continue;
        estimate[field] = parsed.op === '×' ? previous * parsed.value : previous + parsed.value;
      }
    }
    estimates.push(Object.keys(estimate).length ? estimate : null);
  }
  return estimates;
}

export function estimatedVetStats(unit: Unit): (VetStatsEstimate | null)[] {
  return computeEstimatedVetStats(unit.vetStats, veterancyEffects[unit.index]);
}

const VET_RE = /veteran|ветеран/i;
// \w не покрывает кириллицу, поэтому для русского — явный диапазон букв.
const LEVEL_RES = [
  /veteran\s*(?:level\s*)?(\d)/i,
  /ветеран[а-яё]*\s*(?:уровень|уровня|уровней|level)?\s*(\d)/i,
];

// Способности, открываемые уровнями ветеранства: описание/extra упоминает
// ветерана, уровень — число рядом со словом (иначе уровень 1).
export function veteranAbilityUnlocks(unit: Unit): Record<number, string[]> {
  const result: Record<number, string[]> = {};
  for (const ability of abilitiesForUnit(unit.index)) {
    const extra = (ability as { extra?: string }).extra ?? '';
    const text = `${ability.description ?? ''} ${extra}`;
    if (!VET_RE.test(text)) continue;
    let level = 1;
    for (const re of LEVEL_RES) {
      const match = text.match(re);
      if (match) {
        const parsed = Number(match[1]);
        if (parsed >= 1 && parsed <= 5) level = parsed;
        break;
      }
    }
    const name = ability.nameRu ?? ability.name;
    const bucket = result[level] ?? (result[level] = []);
    if (bucket.length < 3 && !bucket.includes(name)) bucket.push(name);
  }
  return result;
}
