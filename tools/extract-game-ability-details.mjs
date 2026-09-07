import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parseRgd, loadKeyDictionary } from './lib/rgd.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const ATTRIB = process.env.COH2_ATTRIB ?? join(ROOT, 'tools/.cache/attrib/attrib');
const UCS_PATH =
  process.env.COH2_UCS ??
  '/Users/alexnder/Library/Application Support/CrossOver/Bottles/Steam/drive_c/Program Files (x86)/Steam/steamapps/common/Company of Heroes 2/CoH2/Locale/Russian/RelicCoH2.Russian.ucs';
const OUT = join(ROOT, 'src/data/game-ability-details.ts');

const keys = loadKeyDictionary(join(ROOT, 'tools/.cache/RGD_DIC.TXT'));

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else if (entry.name.endsWith('.rgd')) out.push(path);
  }
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

function ucsText(value) {
  if (typeof value !== 'number' || !ucs.has(value)) return undefined;
  const text = ucs.get(value).trim();
  return text ? text : undefined;
}

function extract(path) {
  let data;
  try {
    data = parseRgd(path, keys);
  } catch {
    return null;
  }
  const bag = data.ability_bag ?? data.upgrade_bag ?? {};
  const ui = bag.ui_info ?? {};
  const detail = {
    name: ucsText(ui.screen_name),
    description: ucsText(ui.help_text),
    extra: ucsText(ui.extra_text),
    icon_name: typeof ui.icon_name === 'string' && ui.icon_name ? ui.icon_name : undefined,
  };
  const costSource = bag.cost ?? {};
  const cost = {};
  if (costSource.manpower) cost.manpower = costSource.manpower;
  if (costSource.munition ?? costSource.munitions) cost.munitions = costSource.munition ?? costSource.munitions;
  if (costSource.fuel) cost.fuel = costSource.fuel;
  if (Object.keys(cost).length) detail.cost = cost;
  if (!detail.name && !detail.description && !detail.extra && !detail.cost) return null;
  return detail;
}

const details = {};
let parsed = 0;
for (const group of ['abilities', 'upgrade', 'commander_ability']) {
  for (const path of walk(join(ATTRIB, group))) {
    const detail = extract(path);
    if (!detail) continue;
    parsed += 1;
    const id = basename(path, '.rgd').replace(/_mp$/i, '');
    const existing = details[id];
    // Later groups refine earlier ones; a record with more text wins.
    const score = (d) => (d.name ? 2 : 0) + (d.description ? 4 : 0) + (d.cost ? 1 : 0);
    if (!existing || score(detail) > score(existing)) details[id] = detail;
    // Abilities referenced with the _mp suffix resolve through the same id.
    if (!details[`${id}_mp`]) details[`${id}_mp`] = detail;
  }
}

// Doctrine branch ids and unit ability ids are the only records the site can
// display, so prune the generated table to those plus their _mp variants.
function collectUsedIds() {
  const used = new Set();
  const doctrines = readFileSync(join(ROOT, 'src/data/game-doctrines.ts'), 'utf8');
  for (const match of doctrines.matchAll(/"id": "([^"]+)"/g)) used.add(match[1]);
  const abilities = readFileSync(join(ROOT, 'src/data/game-abilities.ts'), 'utf8');
  for (const match of abilities.matchAll(/'([^']+)'/g)) used.add(match[1]);
  return used;
}

const usedIds = collectUsedIds();
for (const id of Object.keys(details)) {
  if (!usedIds.has(id) && !usedIds.has(id.replace(/_mp$/i, ''))) delete details[id];
  if (id.endsWith('_mp') && !usedIds.has(id)) delete details[id];
}

// Doctrine branch ids reference upgrades that may carry a cmd_ ability file;
// the upgrade record holds the authoritative purchase cost, so prefer it.
const count = Object.keys(details).length;
writeFileSync(
  OUT,
  `// Generated from CoH2 ability/upgrade RGD data and the Russian game locale.\nimport type { DoctrineAbility } from '../types';\n\nexport type AbilityDetail = Partial<Pick<DoctrineAbility, 'description' | 'cost'>> & { name?: string; extra?: string; icon_name?: string };\n\nexport const gameAbilityDetails: Record<string, AbilityDetail> = ${JSON.stringify(details, null, 2)};\n`,
);
console.log(`Extracted details for ${count} ids from ${parsed} RGD files.`);
