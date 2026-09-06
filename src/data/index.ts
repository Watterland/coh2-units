import unitsLiteRaw from './units-lite.json';
import type { Unit, UnitLite, Ability, Doctrine, Faction } from '../types';
import {
  unitDetails,
  unitImages,
  abilities as wikiAbilities,
  doctrines as wikiDoctrines,
} from './wiki';
import { gameUnitIcons } from './game-icons';
import { gameAbilityIds } from './game-abilities';
import { gameDoctrines } from './game-doctrines';
import { gameAbilityIcons } from './game-ability-icons';

export const meta = {
  source: 'https://coh2.serealia.ca/',
  note: 'Combat statistics extracted from Serealia; build metadata is enriched from Company of Heroes Wiki.',
  generatedAt: '2026-09-05',
};
export const factions: Faction[] = ['British', 'OKW', 'Ostheer', 'Soviet', 'USF'];
export const unitsLite = unitsLiteRaw as UnitLite[];
export const abilities: Ability[] = wikiAbilities;
export const doctrines: Doctrine[] = wikiDoctrines;

function enrichUnit(unit: Unit): Unit {
  return {
    ...unit,
    imageUrl: gameUnitIcons[unit.index] ?? unitImages[unit.index] ?? undefined,
    ...unitDetails[unit.index],
  };
}

export async function loadFactionUnits(faction: Faction): Promise<Unit[]> {
  const loaders: Record<Faction, () => Promise<{ default: unknown }>> = {
    USF: () => import('./units-usf.json'),
    British: () => import('./units-british.json'),
    Ostheer: () => import('./units-ostheer.json'),
    Soviet: () => import('./units-soviet.json'),
    OKW: () => import('./units-okw.json'),
  };
  const module = await loaders[faction]();
  return (module.default as Unit[]).map(enrichUnit);
}

export function unitLiteByIndex(index: number): UnitLite | undefined {
  return unitsLite.find((unit) => unit.index === index);
}

export function abilitiesForUnit(unitIndex: number): Ability[] {
  const wiki = abilities.filter((a) => a.unitIndex === unitIndex);
  const seen = new Set(wiki.map((ability) => normalizeAbilityName(ability.name)));
  const game = (gameAbilityIds[unitIndex] ?? [])
    .map((id) => ({
      unitIndex,
      name: readableAbilityName(id),
      description: '',
      icon: findAbilityIcon(readableAbilityName(id)),
      type: 'active' as const,
    }))
    .filter((ability) => {
      const key = normalizeAbilityName(ability.name);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return [...wiki, ...game];
}

export function doctrinesForFaction(faction: Faction): Doctrine[] {
  const wiki = doctrines.filter((d) => d.faction === faction);
  const seen = new Set(wiki.map((doctrine) => normalizeAbilityName(doctrine.name)));
  const game = gameDoctrines
    .filter(
      (doctrine) => doctrine.faction === faction && !seen.has(normalizeAbilityName(doctrine.name)),
    )
    .map((doctrine) => ({
      ...doctrine,
      abilities: doctrine.abilities.map((ability) => ({
        ...ability,
        icon: findAbilityIcon(ability.name),
      })),
    }));
  return [...wiki, ...game];
}

function findAbilityIcon(name: string): string | undefined {
  const key = normalizeAbilityName(name);
  const match = [...abilities, ...doctrines.flatMap((doctrine) => doctrine.abilities)].find(
    (ability) => normalizeAbilityName(ability.name) === key && ability.icon,
  );
  if (match?.icon) return match.icon;
  const words =
    name
      .toLowerCase()
      .match(/[a-z0-9]+/g)
      ?.filter((word) => word.length > 2) ?? [];
  const candidate = Object.entries(gameAbilityIcons)
    .map(([id, icon]) => ({
      id: id.toLowerCase(),
      icon,
      score: words.filter((word) => id.toLowerCase().includes(word)).length,
    }))
    .sort((a, b) => b.score - a.score)[0];
  return candidate?.score ? candidate.icon : undefined;
}

function readableAbilityName(id: string): string {
  return id
    .replace(/_(mp|sp|tow)$/i, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeAbilityName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}
