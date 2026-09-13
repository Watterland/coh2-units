// Статус выдачи оружия юниту:
// base — входит в базовую экипировку отряда;
// upgrade — выдаётся улучшением, доступным без доктрины;
// doctrine — только через доктрину.
export type WeaponIssue = 'base' | 'upgrade' | 'doctrine';

// Строка — простой статус; объект — статус + явный список доктрин (на русском),
// когда доктрину нельзя разрешить автоматически по имени ствола.
export type WeaponIssueEntry = WeaponIssue | { issue: WeaponIssue; doctrines?: string[] };

export type WeaponIssueMap = Record<string, Record<string, WeaponIssueEntry>>;

import type { Faction } from '../types';
import { weaponIssueSoviet } from './weapon-issue-soviet';
import { weaponIssueOstheer } from './weapon-issue-ostheer';
import { weaponIssueOkw } from './weapon-issue-okw';
import { weaponIssueUsf } from './weapon-issue-usf';
import { weaponIssueBritish } from './weapon-issue-british';

export const weaponIssueOverrides: Partial<Record<string, WeaponIssueMap>> = {};

const weaponIssueByFaction: Record<Faction, WeaponIssueMap> = {
  Soviet: weaponIssueSoviet,
  Ostheer: weaponIssueOstheer,
  OKW: weaponIssueOkw,
  USF: weaponIssueUsf,
  British: weaponIssueBritish,
};

export function weaponIssueMapFor(faction: Faction): WeaponIssueMap {
  return weaponIssueByFaction[faction] ?? {};
}

export function weaponIssueFor(
  unit: { id?: string; faction: Faction },
  weaponName: string,
): WeaponIssueEntry | undefined {
  return weaponIssueMapFor(unit.faction)[unit.id ?? '']?.[weaponName];
}
