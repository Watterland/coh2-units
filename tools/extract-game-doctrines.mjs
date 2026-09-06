import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const COMMANDERS =
  '/var/folders/8d/w6vszvjd3hg4p5sw6b8pbnn80000gn/T/opencode/coh2-game-icons/attrib/attrib/commander';
const OUT = join(ROOT, 'src/data/game-doctrines.ts');

const FACTION_DIRS = {
  aef: 'USF',
  british: 'British',
  german: 'Ostheer',
  soviet: 'Soviet',
  west_german: 'OKW',
};

function readable(value) {
  return value
    .replace(/_(mp|sp|tow|doctrine|company|tactics|tree)$/i, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const doctrines = [];
for (const [dir, faction] of Object.entries(FACTION_DIRS)) {
  const root = join(COMMANDERS, dir);
  const files = readdirSync(root, { withFileTypes: true }).filter(
    (entry) => entry.isFile() && entry.name.endsWith('.rgd'),
  );
  for (const file of files) {
    const path = join(root, file.name);
    const text = readFileSync(path).toString('latin1');
    // Each commander stores two portrait references. The five command-tree
    // branches are between the first portrait reference and its _small twin.
    const start = text.indexOf('Icons_commander_portrait');
    const end = start >= 0 ? text.indexOf('Icons_commander_portrait', start + 1) : -1;
    const branches = start >= 0 ? text.slice(start, end >= 0 ? end : start + 3000) : '';
    const doctrineId = basename(file.name, '.rgd');
    const ids = [...new Set(branches.match(/[a-z][a-z0-9_]{2,}(?:_mp)?/g) ?? [])]
      .filter(
        (id) =>
          !/^(common|rare|british|german|soviet|aef|west_german|server_item|gamepassdefaultcommanders|tech_tree_v1|default)$/.test(
            id,
          ),
      )
      .filter((id) => id !== doctrineId)
      .filter((id) => !/_archetype$/.test(id))
      .filter((id) => !/^icons_commander_portrait/.test(id))
      .slice(0, 5);
    if (ids.length === 5) {
      doctrines.push({
        faction,
        name: readable(basename(file.name, '.rgd')),
        description: '',
        abilities: ids.map((id) => ({ name: readable(id), description: '' })),
      });
    }
  }
}

writeFileSync(
  OUT,
  `// Generated from local CoH2 commander RGD data.\nimport type { Doctrine } from '../types';\n\nexport const gameDoctrines: Doctrine[] = ${JSON.stringify(doctrines, null, 2)};\n`,
);
console.log(`Extracted ${doctrines.length} game doctrines.`);
