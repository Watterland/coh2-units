import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const source = JSON.parse(readFileSync(join(ROOT, 'src/data/units.json'), 'utf8'));
const output = join(ROOT, 'src/data');

const lite = source.units.map(({ vetStats, weapons, entityNames, ...unit }) => ({
  ...unit,
  entityCount: vetStats[0]?.num_entities ?? 0,
}));

writeFileSync(join(output, 'units-lite.json'), JSON.stringify(lite));

for (const faction of source.factions) {
  const units = source.units.filter((unit) => unit.faction === faction);
  const file = `units-${faction.toLowerCase()}.json`;
  writeFileSync(join(output, file), JSON.stringify(units));
  console.log(`${file}: ${units.length} units`);
}
