import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const GAME = process.argv[2];
if (!GAME) throw new Error('Usage: npm run extract-veterancy -- "/path/to/Company of Heroes 2"');

const ROOT = new URL('..', import.meta.url).pathname;
// RGD already extracted by extract-game-icons.mjs into this temp location.
const ATTRIB =
  '/var/folders/8d/w6vszvjd3hg4p5sw6b8pbnn80000gn/T/opencode/coh2-game-icons/attrib/attrib';
const OUT = join(ROOT, 'src/data/veterancy.ts');

const units = JSON.parse(readFileSync(join(ROOT, 'src/data/units.json'), 'utf8')).units;

// Human-readable modifier labels.
const MOD_LABEL = {
  reload_weapon_modifier: 'перезарядка оружия',
  horizontal_speed_weapon_modifier: 'скорость горизонтальной наводки',
  speed_maximum_modifier: 'максимальная скорость',
  rotation_speed_modifier: 'скорость поворота',
  weapon_burst_length_modifier: 'длина очереди',
  range_weapon_modifier: 'дальность оружия',
  accuracy_weapon_modifier: 'точность оружия',
  cooldown_weapon_modifier: 'перезарядка (cooldown)',
  received_accuracy_modifier: 'уворот (получаемая точность)',
  received_suppression_squad_modifier: 'получаемое подавление',
  received_damage_modifier: 'получаемый урон',
  ability_recharge_time_modifier: 'перезарядка способности',
  entity_veterency_experience_modifier: null, // XP gain — not a combat bonus, skip
  armor_modifier: 'броня',
  damage_weapon_modifier: 'урон оружия',
  penetration_weapon_modifier: 'пробитие оружия',
  firing_accuracy_modifier: 'точность стрельбы',
  reload_squad_modifier: 'перезарядка отряда',
  health_regen_modifier: 'восстановление здоровья',
  sight_weapon_modifier: 'обзор',
  scatter_weapon_modifier: 'разброс',
  target_size_modifier: 'размер цели',
};

const ACTION_LABEL = {
  apply_to_entity: 'сущность',
  apply_to_squad: 'отряд',
  apply_to_weapon: 'оружие',
  apply_to_ability: 'способность',
};

function readStringAt(buf, start) {
  let end = start;
  while (end < buf.length && buf[end] !== 0) end++;
  return buf.subarray(start, end).toString('latin1');
}

// Extract all text strings from a binary RGD into an ordered array of tokens.
function extractTokens(buf) {
  const tokens = [];
  let i = 0;
  while (i < buf.length) {
    if (buf[i] === 0) {
      i++;
      continue;
    }
    // Heuristic: a printable ASCII run that includes at least one '.' or '\\' or is a known keyword.
    if (buf[i] >= 0x20 && buf[i] < 0x7f) {
      const start = i;
      while (i < buf.length && buf[i] >= 0x20 && buf[i] < 0x7f) i++;
      const txt = buf.subarray(start, i).toString('latin1');
      // Keep only meaningful Relic identifier-like runs (contain backslash, or are known verbs).
      if (
        /[.\\_]/.test(txt) ||
        /^(apply_to_|modifiers|multiplication|addition|no_sharing|XP1_Vet_Level)/.test(txt)
      ) {
        tokens.push(txt);
      }
      continue;
    }
    i++;
  }
  return tokens;
}

function parseVeterancy(buf) {
  const text = buf.toString('latin1');
  const start = text.indexOf('squad_veterancy_ext');
  if (start === -1) return null;

  // Cut the block until the next extension (or buffer end).
  let end = text.length;
  const nextExt = text.indexOf('sbpextensions\\', start + 10);
  if (nextExt !== -1) end = nextExt;
  const block = text.slice(start, end);

  // Split by level markers. Each level's content follows its XP1_Vet_LevelN marker.
  const parts = block.split(/XP1_Vet_Level(\d)/);

  const levels = {};
  let currentLevel = 0;
  let pendingMods = [];

  const flush = () => {
    if (currentLevel > 0 && pendingMods.length) {
      levels[currentLevel] = unique(pendingMods);
    }
    pendingMods = [];
  };

  // parts[0] = pre-lvl-1 garbage; then alternating level number and content.
  for (let idx = 1; idx < parts.length; idx += 2) {
    const levelNum = Number(parts[idx]);
    const content = parts[idx + 1] || '';
    if (!levelNum) continue;
    flush();
    currentLevel = levelNum;
    pendingMods = parseModifiers(content);
  }
  flush();

  const hasContent = Object.values(levels).some((arr) => arr.length > 0);
  return hasContent ? levels : null;
}

// Given a raw latin1 slice for one vet level, extract human-readable modifiers.
function parseModifiers(content) {
  const mods = [];
  // Each apply_modifiers_action encapsulates one or several apply_to_* + modifiers\X + op.
  // We scan for the pair (modifiers\X.lua ... op) regardless of surrounding noise.
  const applyRe = /apply_to_(\w+)/g;
  const modRe =
    /modifiers\\(\w+_modifier)\.lua([\s\S]*?)(multiplication|addition|enable|multiply_add)/g;
  let m;
  while ((m = modRe.exec(content)) !== null) {
    const modName = m[1];
    const op = m[3];
    const label = MOD_LABEL[modName];
    if (!label) continue;
    // Determine target: nearest apply_to_ before the modifier.
    const before = content.slice(0, m.index);
    let target = '';
    let am;
    while ((am = applyRe.exec(before)) !== null) target = am[1];
    applyRe.lastIndex = 0;
    const targetLabel = ACTION_LABEL[`apply_to_${target}`] || target || '';
    const opLabel =
      { multiplication: '×', addition: '+', enable: 'вкл.', multiply_add: '±' }[op] || op;
    mods.push(`${label}${targetLabel ? ` · ${targetLabel}` : ''} ${opLabel}`);
  }
  return mods;
}

function unique(arr) {
  return [...new Set(arr)];
}

// Map unit index -> RGD path using same logic as extract-game-icons.
function findRgd(unit) {
  const id = (unit.id ?? '').replace(/_mp$/, '');
  if (id.length < 5) return null;
  const candidates = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (
        entry.name.endsWith('.rgd') &&
        !/wreck|demo|campaign/i.test(path) &&
        entry.name.replace(/\.rgd$/, '').includes(id)
      )
        candidates.push(path);
    }
  };
  walk(join(ATTRIB, 'sbps'));
  if (candidates.length === 0) return null;
  // Exact basename match (id_mp.rgd, then id.rgd), then any *_mp, else first.
  const exactMp = candidates.find((c) => basename(c) === `${id}_mp.rgd`);
  if (exactMp) return exactMp;
  const exact = candidates.find((c) => basename(c) === `${id}.rgd`);
  if (exact) return exact;
  const mp = candidates.find((c) => c.endsWith('_mp.rgd'));
  return mp || candidates[0];
}

const result = {};
let hits = 0;

for (const unit of units) {
  const rgd = findRgd(unit);
  if (!rgd) continue;
  let buf;
  try {
    buf = readFileSync(rgd);
  } catch {
    continue;
  }
  const levels = parseVeterancy(buf);
  if (levels) {
    result[unit.index] = levels;
    hits++;
  }
}

writeFileSync(
  OUT,
  `// Generated from local Company of Heroes 2 archives (squad_veterancy_ext).\n` +
    `export const veterancyEffects: Record<number, Record<number, string[]>> = ${JSON.stringify(result, null, 2)};\n`,
);

const withContent = Object.values(result).filter((v) => Object.keys(v).length > 0).length;
console.log(`Veterancy parsed for ${hits} units (${withContent} with effects).`);
console.log(`Output: ${OUT}`);
