import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parseRgd, loadKeyDictionary } from './lib/rgd.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const ATTRIB = process.env.COH2_ATTRIB ?? join(ROOT, 'tools/.cache/attrib/attrib');
const UCS_PATH =
  process.env.COH2_UCS ??
  '/Users/alexnder/Library/Application Support/CrossOver/Bottles/Steam/drive_c/Program Files (x86)/Steam/steamapps/common/Company of Heroes 2/CoH2/Locale/Russian/RelicCoH2.Russian.ucs';
const OUT = join(ROOT, 'src/data/game-unit-names.ts');

const keys = loadKeyDictionary(join(ROOT, 'tools/.cache/RGD_DIC.TXT'));
const units = JSON.parse(readFileSync(join(ROOT, 'src/data/units-lite.json'), 'utf8'));

function candidatesFor(id) {
  const out = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.rgd') && basename(path, '.rgd').includes(id)) out.push(path);
    }
  };
  walk(join(ATTRIB, 'sbps'));
  return out;
}

function loadUcs(path) {
  const text = readFileSync(path, 'utf16le');
  const map = new Map();
  for (const line of text.split(/\r\n/)) {
    const sep = line.indexOf('\t');
    if (sep > 0) map.set(Number(line.slice(0, sep)), line.slice(sep + 1));
  }
  return map;
}

const ucs = loadUcs(UCS_PATH);

function findValue(node, key) {
  if (typeof node !== 'object' || node === null) return undefined;
  if (node[key] !== undefined) return node[key];
  for (const child of Object.values(node)) {
    const found = findValue(child, key);
    if (found !== undefined) return found;
  }
  return undefined;
}

const names = {};
let ok = 0;
for (const unit of units) {
  const id = (unit.id ?? '').replace(/_mp$/, '');
  if (id.length < 5) continue;
  const candidates = candidatesFor(id);
  const file =
    candidates.find((path) => basename(path, '.rgd') === `${id}_mp.rgd`) ??
    candidates.find((path) => basename(path, '.rgd') === `${id}.rgd`) ??
    candidates.find((path) => path.endsWith('_mp.rgd')) ??
    candidates[0];
  if (!file) continue;
  try {
    const data = parseRgd(file, keys);
    // Squad display name sits inside squad_ui_ext under unnamed hashed
    // wrapper tables; find the first bag that actually carries screen_name.
    let screenName;
    const queue = [data?.squad_ui_ext];
    while (queue.length && screenName === undefined) {
      const node = queue.shift();
      if (typeof node !== 'object' || node === null) continue;
      if (typeof node.screen_name === 'number') {
        screenName = node.screen_name;
        break;
      }
      queue.push(...Object.values(node));
    }
    const ru = typeof screenName === 'number' ? ucs.get(screenName)?.trim() : undefined;
    if (ru) {
      names[unit.index] = ru;
      ok += 1;
    }
  } catch {
    // skip unparsable squads
  }
}

writeFileSync(
  OUT,
  `// Generated from CoH2 squad RGD screen names and the Russian game locale.\nexport const gameUnitNames: Record<number, string> = ${JSON.stringify(names, null, 2)};\n`,
);
console.log(`Extracted Russian names for ${ok}/${units.length} units.`);
