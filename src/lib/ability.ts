import type { Ability, DoctrineAbility, Faction } from '../types';
import { abilitiesForUnit, doctrinesForFaction, unitsLite } from '../data';

export interface AbilityDetail {
  name: string;
  description: string;
  extra?: string;
  icon?: string;
  cost?: Ability['cost'];
  factions: Faction[];
  units: { index: number; name: string }[];
  doctrines: string[];
}

export function abilitySlug(name: string): string {
  return encodeURIComponent(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
}

export function abilityBySlug(slug: string): AbilityDetail | undefined {
  const matchingUnits = unitsLite.flatMap((unit) =>
    abilitiesForUnit(unit.index).filter((ability) => abilitySlug(ability.name) === slug),
  );
  const allDoctrines = (['British', 'OKW', 'Ostheer', 'Soviet', 'USF'] as Faction[]).flatMap(
    (faction) => doctrinesForFaction(faction),
  );
  const matchingDoctrines = allDoctrines.flatMap((doctrine) =>
    doctrine.abilities
      .filter((ability) => abilitySlug(ability.name) === slug)
      .map((ability) => ({ doctrine, ability })),
  );
  const first = matchingUnits[0] ?? matchingDoctrines[0]?.ability;
  if (!first) return undefined;

  const unitIndexes = [...new Set(matchingUnits.map((ability) => ability.unitIndex))];
  const factions = new Set<Faction>();
  for (const ability of matchingUnits) {
    const unit = unitsLite.find((candidate) => candidate.index === ability.unitIndex);
    if (unit) factions.add(unit.faction);
  }
  for (const { doctrine } of matchingDoctrines) factions.add(doctrine.faction);

  return {
    name: first.name,
    description: first.description,
    extra: 'extra' in first ? (first.extra as string | undefined) : undefined,
    icon: first.icon,
    cost: 'cost' in first ? first.cost : undefined,
    factions: [...factions],
    units: unitIndexes.flatMap((index) => {
      const unit = unitsLite.find((candidate) => candidate.index === index);
      return unit ? [{ index, name: unit.name }] : [];
    }),
    doctrines: [...new Set(matchingDoctrines.map(({ doctrine }) => doctrine.name))],
  };
}

export function isAbilityWithCost(ability: Ability | DoctrineAbility): ability is Ability {
  return 'cost' in ability;
}
