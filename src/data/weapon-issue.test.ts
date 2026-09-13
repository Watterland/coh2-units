import { describe, expect, it } from 'vitest';
import british from './units-british.json';
import okw from './units-okw.json';
import ostheer from './units-ostheer.json';
import soviet from './units-soviet.json';
import usf from './units-usf.json';
import type { Unit } from '../types';
import { groupWeapons, isCrewSmallArm } from '../lib/weaponModes';
import { weaponIssueFor } from './weapon-issue';

const factions = [british, okw, ostheer, soviet, usf] as unknown as Unit[][];

describe('weapon issue maps', () => {
  it('covers every displayed non-primary infantry weapon', () => {
    const missing: string[] = [];
    for (const unit of factions.flat().filter((candidate) => candidate.category === 'Infantry')) {
      const mainName = unit.weapons[unit.mainWeaponIndex ?? -1]?.name;
      const weapons = groupWeapons(unit.weapons, unit.mainWeaponIndex)
        .map((group) => group.base)
        .filter(
          (weapon) =>
            weapon.name &&
            weapon.name !== mainName &&
            !(weapon.hardpoint === -1 && weapon.count === -1) &&
            !isCrewSmallArm(weapon.name),
        );
      for (const weapon of weapons) {
        if (!weaponIssueFor({ faction: unit.faction, id: unit.id ?? undefined }, weapon.name!)) {
          missing.push(`${unit.faction}/${unit.id}: ${weapon.name}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});
