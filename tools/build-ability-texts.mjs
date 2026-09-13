import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parseRgd, loadKeyDictionary } from './lib/rgd.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const ATTRIB = process.env.COH2_ATTRIB ?? join(ROOT, 'tools/.cache/attrib/attrib');
const GAME =
  '/Users/alexnder/Library/Application Support/CrossOver/Bottles/Steam/drive_c/Program Files (x86)/Steam/steamapps/common/Company of Heroes 2/CoH2';
const UCS_RU = process.env.COH2_UCS ?? join(GAME, 'Locale/Russian/RelicCoH2.Russian.ucs');
const UCS_EN = process.env.COH2_UCS_EN ?? join(GAME, 'Locale/English/RelicCoH2.English.ucs');
const OUT = join(ROOT, 'src/data/game-ability-texts.ts');

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

const ru = loadUcs(UCS_RU);
const en = loadUcs(UCS_EN);

function text(map, value) {
  if (typeof value !== 'number' || !map.has(value)) return undefined;
  const line = map.get(value).trim();
  return line || undefined;
}

// Wiki spellings differ slightly from game screen names ("No.36 \"Mills Bomb\""),
// so matching is done on a stripped lowercase key.
const normalizeEn = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

const byEnName = {};
let parsed = 0;
for (const group of ['abilities', 'upgrade', 'commander_ability']) {
  for (const path of walk(join(ATTRIB, group))) {
    let data;
    try {
      data = parseRgd(path, keys);
    } catch {
      continue;
    }
    const bag = data.ability_bag ?? data.upgrade_bag ?? {};
    const ui = bag.ui_info ?? {};
    const enName = text(en, ui.screen_name);
    if (!enName) continue;
    const record = {
      nameRu: text(ru, ui.screen_name),
      descriptionRu: text(ru, ui.help_text),
      extraRu: text(ru, ui.extra_text),
    };
    if (!record.nameRu && !record.descriptionRu) continue;
    parsed += 1;
    const key = normalizeEn(enName);
    const score = (r) => (r.descriptionRu ? 4 : 0) + (r.nameRu ? 2 : 0) + (r.extraRu ? 1 : 0);
    const existing = byEnName[key];
    if (!existing || score(record) > score(existing)) byEnName[key] = record;
  }
}

const count = Object.keys(byEnName).length;
writeFileSync(
  OUT,
  `// Generated from CoH2 ability/upgrade RGD ui_info and the game locales
// (English screen names are match keys, Russian texts are the values).
// Regenerate: npm run extract-ability-texts
export interface GameAbilityText {
  nameRu?: string;
  descriptionRu?: string;
  extraRu?: string;
}

export const gameAbilityTexts: Record<string, GameAbilityText> = ${JSON.stringify(byEnName, null, 2)};
`,
);
console.log(`Mapped ${count} english ability names to russian texts from ${parsed} RGD files.`);
