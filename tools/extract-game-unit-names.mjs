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
const descriptions = {};
let ok = 0;
// Units whose units-lite id is too short to match a squad file directly.
const FILE_OVERRIDES = {
  109: 'soviet/vehicles/is-2/is-2_mp.rgd',
  110: 'soviet/vehicles/isu-152/isu-152_mp.rgd',
  113: 'soviet/vehicles/kv-2/kv-2_mp.rgd',
  114: 'soviet/vehicles/kv-8/kv-8_mp.rgd',
  123: 'soviet/vehicles/su-76m/su-76m_mp.rgd',
  124: 'soviet/vehicles/su-85/su-85_mp.rgd',
  125: 'soviet/vehicles/t-70m/t-70m_mp.rgd',
  144: 'west_german/vehicles/hetzer_squad/hetzer_squad_mp.rgd',
  148: 'west_german/vehicles/king_tiger_squad/king_tiger_squad_mp.rgd',
  160: 'british/vehicles/m10_tank_destroyer_squad/m10_tank_destroyer_squad_british_mp.rgd',
  161: 'british/team_weapons/m1_81mm_mortar_squad/m1_81mm_mortar_british_squad_mp.rgd',
  163: 'west_german/vehicles/tiger_squad/west_german_tiger_squad_mp.rgd',
};

// Squad files for a few units carry no localized screen name; the entity
// blueprint does, under the top-level ui_ext key.
const EBPS_OVERRIDES = {
  144: 'west_german/vehicles/hetzer/hetzer_mp.rgd',
  163: 'west_german/vehicles/tiger_sdkfz_181/west_german_tiger_sdkfz_181_mp.rgd',
};

// Units whose name is not localized anywhere in attrib.
const RU_OVERRIDES = {
  160: 'Истребитель танков M10 «Ахиллес»',
  161: '81-мм миномёт M1',
};

function findUiField(data, field) {
  let value;
  const queue = [data?.squad_ui_ext];
  while (queue.length && value === undefined) {
    const node = queue.shift();
    if (typeof node !== 'object' || node === null) continue;
    if (typeof node[field] === 'number') {
      value = node[field];
      break;
    }
    queue.push(...Object.values(node));
  }
  return value;
}

for (const unit of units) {
  let file;
  if (FILE_OVERRIDES[unit.index]) {
    file = join(ATTRIB, 'sbps/races', FILE_OVERRIDES[unit.index]);
  } else {
    const id = (unit.id ?? '').replace(/_mp$/, '');
    if (id.length < 5) continue;
    const candidates = candidatesFor(id);
    file =
      candidates.find((path) => basename(path, '.rgd') === `${id}_mp`) ??
      candidates.find((path) => basename(path, '.rgd') === id) ??
      candidates.find((path) => basename(path, '.rgd') === `${id}_mp`.replace(/_mp$/, '')) ??
      candidates[0];
  }
  if (!file) continue;
  try {
    const data = parseRgd(file, keys);
    // Display name and lore text sit inside squad_ui_ext under unnamed hashed
    // wrapper tables; find the first bag that actually carries each field.
    const screenName = findUiField(data, 'screen_name');
    const helpText = findUiField(data, 'help_text');
    const ru = typeof screenName === 'number' ? ucs.get(screenName)?.trim() : undefined;
    const ruDesc = typeof helpText === 'number' ? ucs.get(helpText)?.trim() : undefined;
    const ebpsFile = EBPS_OVERRIDES[unit.index]
      ? join(ATTRIB, 'ebps/races', EBPS_OVERRIDES[unit.index])
      : undefined;
    let finalRu = ru ?? RU_OVERRIDES[unit.index];
    if (finalRu === undefined && ebpsFile) {
      try {
        const ebps = parseRgd(ebpsFile, keys);
        const ui = ebps?.ui_ext;
        const ebpsScreen =
          typeof ui === 'number' ? ui : typeof ui?.screen_name === 'number' ? ui.screen_name : undefined;
        if (ebpsScreen !== undefined) finalRu = ucs.get(ebpsScreen)?.trim() ?? undefined;
      } catch {
        // keep undefined
      }
    }
    if (process.env.DEBUG_NAMES) console.log('unit', unit.index, unit.id, 'file', file, 'sn', screenName, 'ru', ru);
    if (finalRu) {
      names[unit.index] = finalRu;
      ok += 1;
    }
    if (ruDesc) descriptions[unit.index] = ruDesc;
  } catch {
    // skip unparsable squads
  }
}

writeFileSync(
  OUT,
  `// Generated from CoH2 squad RGD screen names and the Russian game locale.\nexport const gameUnitNames: Record<number, string> = ${JSON.stringify(names, null, 2)};\n\nexport const gameUnitDescriptions: Record<number, string> = ${JSON.stringify(descriptions, null, 2)};\n`,
);
console.log(`Extracted Russian names for ${ok}/${units.length} units, ${Object.keys(descriptions).length} descriptions.`);
