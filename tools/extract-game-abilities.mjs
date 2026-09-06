import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const ATTRIB =
  '/var/folders/8d/w6vszvjd3hg4p5sw6b8pbnn80000gn/T/opencode/coh2-game-icons/attrib/attrib';
const OUT = join(ROOT, 'src/data/game-abilities.ts');
const units = JSON.parse(readFileSync(join(ROOT, 'src/data/units.json'), 'utf8')).units;

function candidatesFor(id) {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (
        entry.name.endsWith('.rgd') &&
        !/wreck|demo|campaign/i.test(path) &&
        basename(path, '.rgd').includes(id)
      )
        out.push(path);
    }
  };
  walk(join(ATTRIB, 'sbps'));
  return out;
}

function squadFile(unit) {
  const id = (unit.id ?? '').replace(/_mp$/, '');
  if (id.length < 5) return null;
  const candidates = candidatesFor(id);
  return (
    candidates.find((path) => basename(path) === `${id}_mp.rgd`) ??
    candidates.find((path) => basename(path) === `${id}.rgd`) ??
    candidates.find((path) => path.endsWith('_mp.rgd')) ??
    candidates[0] ??
    null
  );
}

function abilitiesFromRgd(path) {
  const text = readFileSync(path).toString('latin1');
  const marker = text.indexOf('squad_ability_ext.lua');
  if (marker < 0) return [];
  // Ability IDs are placed immediately before the squad_ability_ext marker.
  const before = text.slice(Math.max(0, marker - 5000), marker);
  const ids = before.match(/[a-z][a-z0-9_]{2,}_mp/g) ?? [];
  return [
    ...new Set(
      ids.filter((id) =>
        /ability|grenade|panzerfaust|barrage|smoke|repair|medkit|mine|sprint|flare|hold_fire|button|overdrive|shot|charge|camouflage|rifle|satchel|molotov|salvage|reinforce|medical|canister|shell|fire|deploy|scuttle|self_destruct|target/i.test(
          id,
        ),
      ),
    ),
  ];
}

const output = {};
for (const unit of units) {
  const file = squadFile(unit);
  if (!file) continue;
  const abilities = abilitiesFromRgd(file);
  if (abilities.length) output[unit.index] = abilities;
}

writeFileSync(
  OUT,
  `// Generated from local CoH2 squad_ability_ext RGD data.\nexport const gameAbilityIds: Record<number, string[]> = ${JSON.stringify(output, null, 2)};\n`,
);
console.log(`Extracted ability IDs for ${Object.keys(output).length}/${units.length} units.`);
