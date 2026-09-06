import type { Faction } from '../types';

export interface FactionInfo {
  id: Faction;
  name: string;
  short: string;
  color: string;
  emblem: string;
}

export const FACTIONS: FactionInfo[] = [
  { id: 'USF', name: 'US Forces', short: 'USF', color: '#3b6ea5', emblem: '★' },
  { id: 'British', name: 'British Forces', short: 'UK', color: '#8a2e2e', emblem: '✪' },
  { id: 'Ostheer', name: 'Wehrmacht Ostheer', short: 'OST', color: '#5a5f5a', emblem: '☩' },
  { id: 'Soviet', name: 'Red Army', short: 'SU', color: '#a33b3b', emblem: '☭' },
  { id: 'OKW', name: 'Oberkommando West', short: 'OKW', color: '#4a6b4a', emblem: '✠' },
];

export const factionInfo = (id: Faction): FactionInfo =>
  FACTIONS.find((f) => f.id === id) ?? FACTIONS[0];

export const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[''.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
