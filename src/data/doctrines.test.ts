import { describe, expect, it } from 'vitest';
import { doctrineCatalog } from './doctrine-catalog';
import { doctrinesForFaction, factions } from './index';
import { assetUrl } from '../lib/assets';

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

  it('includes five player-facing abilities for every doctrine', () => {
    for (const faction of factions) {
      for (const doctrine of doctrinesForFaction(faction)) {
        expect(doctrine.abilities).toHaveLength(5);
      }
    }
  });

  it('uses unit portraits for doctrine unit unlocks and call-ins', () => {
    const soviet = doctrinesForFaction('Soviet');
    const advancedWarfare = soviet.find((doctrine) => doctrine.name === 'Advanced Warfare Tactics');
    const t3485 = advancedWarfare?.abilities.find((ability) => ability.name === 'T34 85 Unlock');
    expect(t3485?.icon).toBe(assetUrl('/game-icons/127.png'));

    const usf = doctrinesForFaction('USF');
    const airborne = usf.find((doctrine) => doctrine.name === 'Airborne Company');
    const paratroopers = airborne?.abilities.find((ability) => ability.name === 'Paratroopers');
    expect(paratroopers?.icon).toBe(assetUrl('/game-icons/4.png'));
  });
});
