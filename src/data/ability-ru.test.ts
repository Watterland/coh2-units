import { describe, expect, it } from 'vitest';
import { abilitiesForUnit, doctrinesForFaction, factions, unitsLite } from './index';

// Каждая видимая способность юнита и доктрины должна иметь русское имя
// (из официальной локали UCS или помеченный ручной перевод).
function isEnglish(text: string | undefined): boolean {
  return !text || !/[а-яё]/i.test(text);
}

describe('russian ability names', () => {
  it('covers every displayed unit ability', () => {
    const missingNames: string[] = [];
    const missingDescriptions: string[] = [];
    for (const unit of unitsLite) {
      for (const ability of abilitiesForUnit(unit.index)) {
        if (isEnglish(ability.nameRu)) {
          missingNames.push(`${unit.faction}/${unit.id ?? unit.index}: ${ability.name}`);
        }
        if (ability.description && isEnglish(ability.description)) {
          missingDescriptions.push(`${unit.faction}/${unit.id ?? unit.index}: ${ability.name}`);
        }
      }
    }
    expect(missingNames).toEqual([]);
    expect(missingDescriptions).toEqual([]);
  });

  it('covers every displayed doctrine ability', () => {
    const missing: string[] = [];
    for (const faction of factions) {
      for (const doctrine of doctrinesForFaction(faction)) {
        for (const ability of doctrine.abilities) {
          if (isEnglish(ability.nameRu)) {
            missing.push(`${faction}/${doctrine.name}: ${ability.name}`);
          }
        }
      }
    }
    expect(missing).toEqual([]);
  });
});
