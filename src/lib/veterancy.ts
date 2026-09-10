import type { Unit } from '../types';
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
