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
import { doctrineAbilityTexts, abilityNameRu, unitAbilityTexts } from './doctrine-ability-texts';
import { gameAbilityDetails } from './game-ability-details';
import { gameAbilityTexts } from './game-ability-texts';
import { gameUnitDescriptions, gameUnitNames } from './game-unit-names';
import {
  DOCTRINE_ONLY_UNIT_INDEXES,
  doctrineNamesForAbilityName,
  doctrineNamesForBranchId,
  unitDoctrinesList,
  weaponDoctrineNames,
} from './doctrine-units';
import {
  doctrineCrewIconIds,
  doctrineUnitAbilityIconIds,
  doctrineUnitIconIndexes,
  doctrineVehicleIconIds,
} from './doctrine-unit-icons';
import { assetUrl } from '../lib/assets';
import { abilityExclusionsBritish } from './ability-exclusions-british';
import { abilityExclusionsOkw } from './ability-exclusions-okw';
import { abilityExclusionsOstheer } from './ability-exclusions-ostheer';
import { abilityExclusionsSoviet } from './ability-exclusions-soviet';
import { abilityExclusionsUsf } from './ability-exclusions-usf';
import { abilityRuBritish } from './ability-ru-british';
import { abilityRuOkw } from './ability-ru-okw';
import { abilityRuOstheer } from './ability-ru-ostheer';
import { abilityRuSoviet } from './ability-ru-soviet';
import { abilityRuUsf } from './ability-ru-usf';

export const meta = {
  source: 'https://coh2.serealia.ca/',
  note: 'Combat statistics extracted from Serealia; build metadata is enriched from Company of Heroes Wiki.',
  generatedAt: '2026-09-05',
};
export const factions: Faction[] = ['British', 'OKW', 'Ostheer', 'Soviet', 'USF'];
export const unitsLite = unitsLiteRaw as UnitLite[];
const abilityExclusionsByFaction: Record<Faction, Record<string, string[]>> = {
  British: abilityExclusionsBritish,
  OKW: abilityExclusionsOkw,
  Ostheer: abilityExclusionsOstheer,
  Soviet: abilityExclusionsSoviet,
  USF: abilityExclusionsUsf,
};
const abilityRuByFaction: Record<
  Faction,
  Record<string, { nameRu: string; descriptionRu?: string }>
> = {
  British: abilityRuBritish,
  OKW: abilityRuOkw,
  Ostheer: abilityRuOstheer,
  Soviet: abilityRuSoviet,
  USF: abilityRuUsf,
};
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
    // Official Russian lore text from the game locale wins over the Wiki.
    description: gameUnitDescriptions[unit.index] ?? unitDetails[unit.index]?.description,
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

export function unitRussianName(index: number): string | undefined {
  return gameUnitNames[index];
}

export type UnitAvailability =
  | { kind: 'nation'; doctrines: [] }
  | { kind: 'doctrine'; doctrines: string[] };

export function unitAvailability(index: number): UnitAvailability {
  if (DOCTRINE_ONLY_UNIT_INDEXES.has(index)) {
    return { kind: 'doctrine', doctrines: unitDoctrinesList(index) };
  }
  return { kind: 'nation', doctrines: [] };
}

export function weaponAvailableIn(faction: Faction, weaponId: string): string[] {
  return weaponDoctrineNames(faction, weaponId);
}

function normalizeWikiAbilityName(name: string): string {
  return name.replace(/\[\[File:[^\]]*\]\]/g, '').trim();
}

function hasCyrillic(text: string | undefined): boolean {
  return !!text && /[а-яё]/i.test(text);
}

export function abilitiesForUnit(unitIndex: number): Ability[] {
  const lite = unitLiteByIndex(unitIndex);
  const exclusions = abilityExclusionsByFaction[lite?.faction ?? 'Soviet'][lite?.id ?? ''] ?? [];
  const isExcluded = (name: string) => exclusions.includes(normalizeAbilityName(name));
  const manual = (...keys: (string | undefined)[]) => {
    const map = abilityRuByFaction[lite?.faction ?? 'Soviet'];
    for (const key of keys) {
      const hit = key && map[key.toLowerCase()];
      if (hit) return hit;
    }
    return undefined;
  };
  // Игровые данные (RGD + UCS) — источник истины для имён и описаний.
  const game = (gameAbilityIds[unitIndex] ?? [])
    .map((id) => {
      const key = id.replace(/_(mp|sp|tow)$/i, '');
      const detail = gameAbilityDetails[id] ?? gameAbilityDetails[key];
      const name = readableAbilityName(id);
      const ucs = gameAbilityTexts[normalizeAbilityName(name)];
      const translated = manual(key.toLowerCase(), normalizeAbilityName(name));
      const gameIcon =
        (detail?.icon_name ? gameAbilityIcons[detail.icon_name] : undefined) ??
        doctrineUnitAbilityIconIds[name];
      const availableIn = [
        ...new Set([
          ...doctrineNamesForBranchId(id),
          ...doctrineNamesForBranchId(key),
          ...doctrineNamesForAbilityName(name),
        ]),
      ];
      return {
        unitIndex,
        name,
        nameRu:
          translated?.nameRu ??
          detail?.name ??
          ucs?.nameRu ??
          abilityNameRu[name],
        description:
          translated?.descriptionRu ?? detail?.description ?? ucs?.descriptionRu ?? '',
        cost: detail?.cost,
        icon: (gameIcon ? assetUrl(gameIcon) : undefined) ?? findAbilityIcon(name),
        type: 'active' as const,
        ...(availableIn.length ? { availableIn } : {}),
      };
    })
    .filter((ability) => !isExcluded(ability.name));

  // Wiki-записи, дублирующие игровые (по англ. или рус. имени), выбрасываются:
  // игровой вариант уже переведён и точнее.
  const gameKeys = new Set(
    game
      .flatMap((ability) => [
        normalizeAbilityName(ability.name),
        normalizeAbilityName(ability.nameRu ?? ''),
      ])
      .filter(Boolean),
  );
  const wiki = abilities
    .filter((a) => a.unitIndex === unitIndex && !isExcluded(a.name))
    .filter((a) => !gameKeys.has(normalizeAbilityName(a.name)))
    .map((ability) => {
      const cleanName = normalizeWikiAbilityName(ability.name);
      const norm = normalizeAbilityName(cleanName);
      const ucs = gameAbilityTexts[norm];
      const translated = manual(norm);
      const nameRu =
        (hasCyrillic(ability.nameRu) ? ability.nameRu : undefined) ??
        translated?.nameRu ??
        (hasCyrillic(ucs?.nameRu) ? ucs.nameRu : undefined) ??
        abilityNameRu[cleanName] ??
        abilityNameRu[ability.name];
      const ruDescription =
        translated?.descriptionRu ??
        (hasCyrillic(ucs?.descriptionRu) ? ucs.descriptionRu : undefined) ??
        (hasCyrillic(unitAbilityTexts[cleanName]) ? unitAbilityTexts[cleanName] : undefined);
      return {
        ...ability,
        name: cleanName,
        description: hasCyrillic(ability.description) ? ability.description : ruDescription ?? '',
        nameRu,
        icon: ability.icon ?? resolveUnitAbilityIcon(cleanName),
        availableIn:
          ability.availableIn ??
          (doctrineNamesForAbilityName(cleanName, lite?.faction).length
            ? doctrineNamesForAbilityName(cleanName, lite?.faction)
            : undefined),
      };
    })
    .filter((ability) => !isExcluded(ability.name));

  return dedupeByDisplayName([...game, ...wiki]);
}

// Translated ability names collide across sources (e.g. wiki 'Repair' and game
// 'Aef Repair Critical' both render as «Ремонт»). Merge by display name and
// keep the richest entry so squads never list the same ability twice.
function dedupeByDisplayName(abilities: Ability[]): Ability[] {
  const byDisplay = new Map<string, Ability>();
  const order: string[] = [];
  for (const ability of abilities) {
    const display = (ability.nameRu ?? ability.name).toLowerCase();
    const existing = byDisplay.get(display);
    if (!existing) {
      byDisplay.set(display, ability);
      order.push(display);
      continue;
    }
    const mergedAvailableIn = [
      ...new Set([...(existing.availableIn ?? []), ...(ability.availableIn ?? [])]),
    ];
    const richer: Ability = {
      ...existing,
      description: existing.description || ability.description,
      icon: existing.icon ?? ability.icon,
      cost: existing.cost ?? ability.cost,
      nameRu: existing.nameRu ?? ability.nameRu,
      ...(mergedAvailableIn.length ? { availableIn: mergedAvailableIn } : {}),
    };
    byDisplay.set(display, richer);
  }
  return order.map((key) => byDisplay.get(key)!);
}

function resolveUnitAbilityIcon(name: string): string | undefined {
  const mapped = doctrineUnitAbilityIconIds[name];
  if (mapped && gameAbilityIcons[mapped]) return assetUrl(gameAbilityIcons[mapped]);
  return findAbilityIcon(name);
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
        nameRu: canonical.nameRu,
        abilities: source.abilities
          .filter((ability) => !isInternalDoctrineAbility(ability.name))
          .map((ability) => {
            const id = ability.id ?? '';
            const detail = gameAbilityDetails[id] ?? gameAbilityDetails[`${id}_mp`];
            return {
              ...ability,
              nameRu: detail?.name ?? doctrineAbilityTexts[id]?.nameRu,
              description:
                ability.description || detail?.description || doctrineAbilityTexts[id]?.description || '',
              extra: ability.extra ?? detail?.extra ?? doctrineAbilityTexts[id]?.extra,
              cost: ability.cost ?? detail?.cost,
              icon: findDoctrineAbilityIcon(ability.name, id) ?? ability.icon ?? findAbilityIcon(ability.name),
            };
          }),
      };
    });
}

function isInternalDoctrineAbility(name: string): boolean {
  return /^(Cons Commander Portrait|Aowgamepassdefaultcommanders)/i.test(name);
}

function findDoctrineAbilityIcon(name: string, id?: string): string | undefined {
  const crewIcon = gameAbilityIcons[doctrineCrewIconIds[name]];
  if (crewIcon) return assetUrl(crewIcon);
  const vehicleIcon = gameAbilityIcons[doctrineVehicleIconIds[name]];
  if (vehicleIcon) return assetUrl(vehicleIcon);
  const unitIndex = doctrineUnitIconIndexes[name];
  if (unitIndex !== undefined && gameUnitIcons[unitIndex]) return assetUrl(gameUnitIcons[unitIndex]);
  const iconName = id ? gameAbilityDetails[id]?.icon_name : undefined;
  if (iconName && gameAbilityIcons[iconName]) return assetUrl(gameAbilityIcons[iconName]);
  return undefined;
}

function findAbilityIcon(name: string): string | undefined {
  const key = normalizeAbilityName(name);
  const match = [...abilities, ...doctrines.flatMap((doctrine) => doctrine.abilities)].find(
    (ability) => normalizeAbilityName(ability.name) === key && ability.icon,
  );
  if (match?.icon) return assetUrl(match.icon);
  // Fuzzy matching is intentionally strict: a single shared token or a tie
  // produces confidently wrong icons, so require a unique two-token lead.
  const words =
    name
      .toLowerCase()
      .match(/[a-z0-9]+/g)
      ?.filter((word) => word.length > 2) ?? [];
  const scored = Object.entries(gameAbilityIcons)
    .map(([id, icon]) => ({
      icon,
      score: words.filter((word) => id.toLowerCase().includes(word)).length,
    }))
    .sort((a, b) => b.score - a.score);
  const best = scored[0];
  const runnerUp = scored[1];
  return best && best.score >= 2 && best.score > (runnerUp?.score ?? 0)
    ? assetUrl(best.icon)
    : undefined;
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
