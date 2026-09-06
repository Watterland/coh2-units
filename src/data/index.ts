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
import { doctrineCatalog } from './doctrine-catalog';
import { assetUrl } from '../lib/assets';

export const meta = {
  source: 'https://coh2.serealia.ca/',
  note: 'Combat statistics extracted from Serealia; build metadata is enriched from Company of Heroes Wiki.',
  generatedAt: '2026-09-05',
};
export const factions: Faction[] = ['British', 'OKW', 'Ostheer', 'Soviet', 'USF'];
export const unitsLite = unitsLiteRaw as UnitLite[];
export const abilities: Ability[] = wikiAbilities.map((ability) => ({
  ...ability,
  icon: ability.icon ? assetUrl(ability.icon) : undefined,
}));
export const doctrines: Doctrine[] = wikiDoctrines.map((doctrine) => ({
  ...doctrine,
  abilities: doctrine.abilities.map((ability) => ({
    ...ability,
    icon: ability.icon ? assetUrl(ability.icon) : undefined,
  })),
}));

function enrichUnit(unit: Unit): Unit {
  return {
    ...unit,
    imageUrl: gameUnitIcons[unit.index]
      ? assetUrl(gameUnitIcons[unit.index])
      : unitImages[unit.index]
        ? assetUrl(unitImages[unit.index] as string)
        : undefined,
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
  return doctrineCatalog
    .filter((doctrine) => doctrine.faction === faction)
    .map((canonical) => {
      const matchesSourceName = (doctrine: Doctrine) =>
        canonical.sourceNames.includes(doctrine.name);
      const source =
        gameDoctrines.find((doctrine) => doctrine.faction === faction && matchesSourceName(doctrine)) ??
        doctrines.find((doctrine) => doctrine.faction === faction && matchesSourceName(doctrine));

      if (!source) {
        throw new Error(`Missing source data for ${canonical.name}`);
      }

      return {
        ...source,
        name: canonical.name,
        abilities: source.abilities
          .filter((ability) => !isInternalDoctrineAbility(ability.name))
          .map((ability) => ({
            ...ability,
            icon: ability.icon ?? findAbilityIcon(ability.name),
          })),
      };
    });
}

function isInternalDoctrineAbility(name: string): boolean {
  return /^(Cons Commander Portrait|Aowgamepassdefaultcommanders)/i.test(name);
}

function findAbilityIcon(name: string): string | undefined {
  const key = normalizeAbilityName(name);
  const match = [...abilities, ...doctrines.flatMap((doctrine) => doctrine.abilities)].find(
    (ability) => normalizeAbilityName(ability.name) === key && ability.icon,
  );
  if (match?.icon) return assetUrl(match.icon);
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
  return candidate?.score ? assetUrl(candidate.icon) : undefined;
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
