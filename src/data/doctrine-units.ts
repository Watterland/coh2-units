import type { Faction } from '../types';
import { doctrineCatalog } from './doctrine-catalog';
import { gameDoctrines } from './game-doctrines';
import { doctrineUnitIconIndexes } from './doctrine-unit-icons';

// Units obtainable only through commander doctrines (call-ins and passive
// squad unlocks). Everything else is part of the nation's base roster.
export const DOCTRINE_ONLY_UNIT_INDEXES = new Set<number>([
  7, // I&R Pathfinders
  8, // Rangers
  79, // Elefant
  94, // Tiger Ace
  103, // Partisan Tank Hunters
  158, // Cavalry Riflemen
  159, // Assault Infantry Section
  160, // M10 Achilles
  164, // Panzer IV Ausf. J
  166, // Guards Airborne Troops
  167, // Raid Section
  168, // Luftwaffe Field Officer
]);

// Doctrine abilities that dispatch a specific vehicle; used for the reverse
// unit -> doctrines lookup alongside doctrineUnitIconIndexes.
const vehicleAbilityUnitIndexes: Record<string, number> = {
  'T34 85 Unlock': 127,
  'Is-2 Support': 109,
  'Isu152 Unlock': 110,
  'Kv-8 Unlock': 114,
  'Kv1 Unlock': 112,
  'Kv2 Unlock': 113,
  'Tiger Tank': 95,
  'Tiger Tank Ace': 94,
  'M26 Pershing Dispatch': 21,
  'M10 Deploy Clone': 19,
  'Sherman Easy8 Dispatch': 26,
  'Sherman Bulldozer Dispatch': 27,
  'T34 Sherman Calliope Dispatch': 35,
  'Priest Dispatch': 32,
  'M21 Mortar Halftrack Dispatch': 24,
  'M5 Halftrack Group': 31,
  'M3 Halftrack': 25,
  'Greyhound Recon Dispatch': 34,
  'Sherman Soviet Dispatch': 120,
  'M-42 At Gun': 121,
  'Hm120 Mortar Unlock': 100,
  'Mortar Halftrack': 82,
  'Elefant Unlock': 79,
  'Panzer Iv J': 164,
  'Stug Short Barrel': 92,
  'Mobile Observation 251': 83,
  'Puma Dispatch': 90,
  'Howitzer 105mm Emplacement': 84,
  'Jaeger Light Infantry Recon Dispatch': 131,
  'Panzerfusiler Dispatch': 133,
  Jagdtiger: 147,
  'Scout Car 221 Dispatch': 162,
  'Sturmtiger Dispatch': 156,
  'Opel Blitz Dispatch': 157,
  'Flammpanzer 38t Hetzer': 144,
  'Ostwind Dispatch': 150,
  'Command Panther': 152,
  'Sexton Dispatch': 59,
  'M10 Achillies Deploy': 160,
  'Land Mattress Dispatch': 49,
  'Mortar 81mm': 161,
};

const unitDoctrines = new Map<number, string[]>();
const branchIdToDoctrines = new Map<string, string[]>();
for (const canonical of doctrineCatalog) {
  const source = gameDoctrines.find(
    (doctrine) => doctrine.faction === canonical.faction && canonical.sourceNames.includes(doctrine.name),
  );
  if (!source) continue;
  for (const ability of source.abilities) {
    if (ability.id) {
      const list = branchIdToDoctrines.get(ability.id) ?? [];
      if (!list.includes(canonical.name)) list.push(canonical.name);
      branchIdToDoctrines.set(ability.id, list);
    }
    const unitIndex =
      doctrineUnitIconIndexes[ability.name] ?? vehicleAbilityUnitIndexes[ability.name];
    if (unitIndex === undefined) continue;
    const units = unitDoctrines.get(unitIndex) ?? [];
    if (!units.includes(canonical.name)) units.push(canonical.name);
    unitDoctrines.set(unitIndex, units);
  }
}

export function doctrineNamesForBranchId(id: string): string[] {
  return branchIdToDoctrines.get(id) ?? branchIdToDoctrines.get(id.replace(/_(mp|sp|tow)$/i, '')) ?? [];
}

// Doctrine abilities matched by display name catch squad-level grants whose
// extracted id differs from the commander branch id. Entries stay per-faction:
// identical ability names exist across nations.
const abilityNameToDoctrines = new Map<string, { faction: Faction; doctrine: string }[]>();
for (const canonical of doctrineCatalog) {
  const source = gameDoctrines.find(
    (doctrine) => doctrine.faction === canonical.faction && canonical.sourceNames.includes(doctrine.name),
  );
  if (!source) continue;
  for (const ability of source.abilities) {
    const key = ability.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const list = abilityNameToDoctrines.get(key) ?? [];
    if (!list.some((entry) => entry.doctrine === canonical.name)) {
      list.push({ faction: canonical.faction, doctrine: canonical.name });
    }
    abilityNameToDoctrines.set(key, list);
  }
}

export function doctrineNamesForAbilityName(name: string, faction?: Faction): string[] {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const entries = abilityNameToDoctrines.get(key) ?? [];
  const filtered = faction ? entries.filter((entry) => entry.faction === faction) : entries;
  return [...new Set(filtered.map((entry) => entry.doctrine))];
}

export function unitDoctrinesList(index: number): string[] {
  return unitDoctrines.get(index) ?? [];
}

export type UnitAvailability =
  | { kind: 'nation' }
  | { kind: 'doctrine'; doctrines: string[] };

export function unitAvailability(index: number): UnitAvailability {
  if (DOCTRINE_ONLY_UNIT_INDEXES.has(index)) {
    return { kind: 'doctrine', doctrines: unitDoctrinesList(index) };
  }
  return { kind: 'nation' };
}

export function factionLabel(faction: Faction): string {
  const labels: Record<Faction, string> = {
    USF: 'США',
    British: 'Британия',
    Ostheer: 'Вермахт',
    Soviet: 'СССР',
    OKW: 'OKW',
  };
  return labels[faction];
}
