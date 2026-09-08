import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parseRgd, loadKeyDictionary } from './lib/rgd.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const ATTRIB = process.env.COH2_ATTRIB ?? join(ROOT, 'tools/.cache/attrib/attrib');
const OUT = join(ROOT, 'src/data/game-weapon-meta.ts');

const keys = loadKeyDictionary(join(ROOT, 'tools/.cache/RGD_DIC.TXT'));

const weaponIds = new Set();
for (const file of ['units-usf', 'units-british', 'units-ostheer', 'units-soviet', 'units-okw']) {
  const units = JSON.parse(readFileSync(join(ROOT, `src/data/${file}.json`), 'utf8'));
  for (const unit of units) for (const weapon of unit.weapons ?? []) weaponIds.add(weapon.name);
}

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

const normalize = (value) => value.replace(/_mp$/i, '').replace(/[^a-z0-9]/gi, '').toLowerCase();

// slot_item packs bind a weapon file to its command-card icon.
const iconByWeapon = new Map();
for (const path of walk(join(ATTRIB, 'slot_item'))) {
  try {
    const data = parseRgd(path, keys);
    const bag = data.slot_item_bag;
    if (typeof bag !== 'object' || bag === null) continue;
    for (const pack of Object.values(bag)) {
      if (typeof pack !== 'object' || pack === null) continue;
      const weaponRef = pack.weapon?.weapon ?? pack.weapon;
      const icon = pack.icon_name;
      if (typeof weaponRef === 'string' && typeof icon === 'string' && icon) {
        const key = normalize(weaponRef);
        if (!iconByWeapon.has(key)) iconByWeapon.set(key, icon);
      }
    }
  } catch {
    // skip unparsable slot items
  }
}

const TYPE_RU = [
  [/grenade|mk2|mills|model_24|stielgranate/, 'Граната'],
  [/molotov/, 'Коктейль Молотова'],
  [/flare/, 'Ракетница'],
  [/satchel|demo(lition)?_?charge|charge/, 'Подрывной заряд'],
  [/bazooka|panzerfaust|panzerschreck|piat|boys|ptrs|rifle_at|at_rifle|rifle_grenade/, 'Противотанковое оружие'],
  [/flamethrower|flame/, 'Огнемёт'],
  [/minesweeper/, 'Миноискатель'],
  [/lmg|light_machine|bar_|bren|dp_?28|m1919/, 'Ручной пулемёт'],
  [/hmg|heavy_machine|pintle|50cal|dshk|maxim|m1910|vickers|mg42|mg34/, 'Пулемёт'],
  [/smg|sub_machine|thompson|grease|mp40|ppsh|pps|sten/, 'Пистолет-пулемёт'],
  [/sniper/, 'Снайперская винтовка'],
  [/rifle|carbine|garand|svt|gewehr|kar|k98|mosin|g43/, 'Винтовка'],
  [/mortar/, 'Миномёт'],
  [/rocket/, 'Реактивное оружие'],
  [/mine/, 'Мина'],
  [/howitzer|pak|kwk|cannon|at_gun|artillery|gun/, 'Орудие'],
];

function typeRu(id) {
  for (const [pattern, label] of TYPE_RU) {
    if (pattern.test(id)) return label;
  }
  return 'Оружие';
}

// Fallback icon match by shared tokens against the extracted weapon icons.
const iconSymbols = Object.keys(JSON.parse(
  readFileSync(join(ROOT, 'src/data/game-ability-icons.ts'), 'utf8').replace(/[\s\S]*= /, '').replace(/;\s*$/, ''),
)).filter((name) => name.startsWith('Icons_weapons_'));

function tokens(id) {
  return id.replace(/_mp$/i, '').split(/[^a-z0-9]+/i).filter((t) => t.length > 2);
}

// Curated icon bindings for the common issued weapons; far more reliable
// than token guessing.
const ICON_OVERRIDES = [
  [/bar_|\bbar\b|m1918/, 'Icons_weapons_weapon_bar'],
  [/30cal|m1919/, 'Icons_weapons_weapon_m1919a6'],
  [/vickers/, 'Icons_weapons_weapon_vickers_lmg'],
  [/bren/, 'Icons_weapons_weapon_bren'],
  [/dp_?28/, 'Icons_weapons_weapon_dp_28_lmg'],
  [/ppsh/, 'Icons_weapons_ppsh_41'],
  [/pps(?!h)/, 'Icons_weapons_weapon_pps'],
  [/thompson/, 'Icons_weapons_m1_thompson_sub_machine_gun'],
  [/mp40/, 'Icons_weapons_weapon_mp40'],
  [/mp44|stg44|stg_44/, 'Icons_weapons_weapon_mp44'],
  [/gewehr|g43/, 'Icons_weapons_weapon_gewehr43'],
  [/svt/, 'Icons_weapons_svt_weapon'],
  [/ptrs|ptrd/, 'Icons_weapons_weapon_ptrs'],
  [/boys/, 'Icons_weapons_weapon_boys_at_gun'],
  [/bazooka/, 'Icons_weapons_weapon_m9_bazooka'],
  [/panzerfaust/, 'Icons_weapons_weapon_panzerfaust'],
  [/panzerschreck/, 'Icons_weapons_weapon_panzerschreck'],
  [/piat/, 'Icons_weapons_weapon_piat'],
  [/flamethrower|roks/, 'Icons_weapons_weapon_flamethrower'],
  [/mg42/, 'Icons_weapons_weapon_mg42'],
  [/mg34/, 'Icons_weapons_weapon_lmg_mg34'],
  [/dshk/, 'Icons_weapons_dshk_hmg'],
  [/m2hb|50cal/, 'Icons_weapons_m2hb_pintle'],
  [/rifle_grenade|grenadier_rifle/, 'Icons_weapons_weapon_rifle_grenadier'],
  [/minesweeper/, 'Icons_weapons_weapon_minesweeper'],
  [/fg42|fg_42/, 'Icons_weapons_fg_42_lmg'],
];

const meta = {};
for (const id of [...weaponIds].sort()) {
  const icon = iconByWeapon.get(normalize(id));
  const entry = { type: typeRu(id) };
  const override = ICON_OVERRIDES.find(([pattern]) => pattern.test(id));
  if (icon) {
    entry.icon_name = icon;
  } else if (override) {
    entry.icon_name = override[1];
  } else {
    const parts = tokens(id);
    let best = null;
    let bestScore = 0;
    for (const symbol of iconSymbols) {
      const score = parts.filter((part) => symbol.toLowerCase().includes(part)).length;
      if (score > bestScore) {
        bestScore = score;
        best = symbol;
      }
    }
    // A single shared token is too weak: 'rifle' would hand every rifle the
    // grenade-grenadier icon. Require at least two matching tokens.
    if (best && bestScore >= 2) entry.icon_name = best;
  }
  meta[id] = entry;
}

const withIcons = Object.values(meta).filter((m) => m.icon_name).length;
writeFileSync(
  OUT,
  `// Generated from CoH2 slot_item bindings and weapon id classification.\nexport interface WeaponMeta {\n  type: string;\n  icon_name?: string;\n}\n\nexport const gameWeaponMeta: Record<string, WeaponMeta> = ${JSON.stringify(meta, null, 2)};\n`,
);
console.log(`Weapon meta for ${Object.keys(meta).length} ids, ${withIcons} with icons.`);
