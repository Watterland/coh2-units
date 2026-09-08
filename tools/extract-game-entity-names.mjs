import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parseRgd, loadKeyDictionary } from './lib/rgd.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const ATTRIB = process.env.COH2_ATTRIB ?? join(ROOT, 'tools/.cache/attrib/attrib');
const UCS_PATH =
  process.env.COH2_UCS ??
  '/Users/alexnder/Library/Application Support/CrossOver/Bottles/Steam/drive_c/Program Files (x86)/Steam/steamapps/common/Company of Heroes 2/CoH2/Locale/Russian/RelicCoH2.Russian.ucs';
const OUT = join(ROOT, 'src/data/game-entity-names.ts');

const keys = loadKeyDictionary(join(ROOT, 'tools/.cache/RGD_DIC.TXT'));
const data = JSON.parse(readFileSync(join(ROOT, 'src/data/units.json'), 'utf8'));
const names = new Set();
for (const unit of data.units) for (const n of unit.entityNames ?? []) names.add(n);

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
  walk(join(ATTRIB, 'ebps'));
  return out;
}

const output = {};
let ok = 0;
for (const name of names) {
  const id = name.replace(/_mp$/, '');
  const candidates = candidatesFor(id);
  const file =
    candidates.find((path) => basename(path, '.rgd') === `${id}_mp`) ??
    candidates.find((path) => basename(path, '.rgd') === id) ??
    candidates[0];
  if (!file) continue;
  try {
    const parsed = parseRgd(file, keys);
    const ui = parsed?.ui_ext;
    const screen = typeof ui?.screen_name === 'number' ? ui.screen_name : undefined;
    const ru = screen !== undefined ? ucs.get(screen)?.trim() : undefined;
    if (ru) {
      output[name] = ru;
      ok += 1;
    }
  } catch {
    // skip unparsable entities
  }
}

writeFileSync(
  OUT,
  `// Generated from CoH2 entity RGD ui names and the Russian game locale.\nexport const gameEntityNames: Record<string, string> = ${JSON.stringify(output, null, 2)};\n`,
);
console.log(`Extracted Russian names for ${ok}/${names.size} squad entities.`);
