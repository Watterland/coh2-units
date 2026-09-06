import { describe, expect, it } from 'vitest';
import { doctrineCatalog } from './doctrine-catalog';
import { doctrinesForFaction, factions } from './index';

const expectedCounts = {
  USF: 9,
  British: 9,
  OKW: 9,
  Soviet: 22,
  Ostheer: 22,
} as const;

describe('doctrine catalog', () => {
  it('has the approved number of commanders for every faction', () => {
    for (const faction of factions) {
      expect(doctrineCatalog.filter((doctrine) => doctrine.faction === faction)).toHaveLength(
        expectedCounts[faction],
      );
      expect(doctrinesForFaction(faction)).toHaveLength(expectedCounts[faction]);
    }
  });

  it('does not return duplicate doctrine names', () => {
    for (const faction of factions) {
      const names = doctrinesForFaction(faction).map((doctrine) => doctrine.name);
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it('does not expose internal commander portrait records as abilities', () => {
    for (const faction of factions) {
      for (const doctrine of doctrinesForFaction(faction)) {
        expect(doctrine.abilities.map((ability) => ability.name)).not.toContain(
          expect.stringMatching(/^Cons Commander Portrait|^Aowgamepassdefaultcommanders/i),
        );
      }
    }
  });
});
