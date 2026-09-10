import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { REF_HASH, loadKeyDictionary } from './lib/rgd.mjs';

// Usage: npm run extract-veterancy [-- "/path/to/Company of Heroes 2"]
// Reads pre-extracted RGD archives from tools/.cache/attrib (produced by
// extract-game-icons.mjs) and regenerates src/data/veterancy.ts with numeric
// per-level veterancy effects and XP thresholds.

const ROOT = new URL('..', import.meta.url).pathname;
const ATTRIB = process.env.COH2_ATTRIB ?? join(ROOT, 'tools/.cache/attrib/attrib');
const DIC = join(ROOT, 'tools/.cache/RGD_DIC.TXT');
const OUT = join(ROOT, 'src/data/veterancy.ts');

const keys = loadKeyDictionary(DIC);

// Human-readable modifier labels.
const MOD_LABEL = {
  reload_weapon_modifier: 'перезарядка оружия',
  horizontal_speed_weapon_modifier: 'скорость горизонтальной наводки',
  speed_maximum_modifier: 'максимальная скорость',
  rotation_speed_modifier: 'скорость поворота',
  weapon_burst_length_modifier: 'длина очереди',
  weapon_burst_rate_of_fire_modifier: 'темп стрельбы в очереди',
  range_weapon_modifier: 'дальность оружия',
  accuracy_weapon_modifier: 'точность оружия',
  cooldown_weapon_modifier: 'перезарядка (cooldown)',
  received_accuracy_modifier: 'уворот (получаемая точность)',
  received_suppression_squad_modifier: 'получаемое подавление',
  received_damage_modifier: 'получаемый урон',
  ability_recharge_time_modifier: 'перезарядка способности',
  ability_max_range_modifier: 'дальность способности',
  ability_duration_time_modifier: 'длительность способности',
  ability_cost_munition_multiplier: 'стоимость способности (муниции)',
  entity_veterency_experience_modifier: null, // XP gain — not a combat bonus, skip
  armor_modifier: 'броня',
  damage_weapon_modifier: 'урон оружия',
  penetration_weapon_modifier: 'пробитие оружия',
  weapon_penetration_modifier: 'пробитие оружия',
  firing_accuracy_modifier: 'точность стрельбы',
  reload_squad_modifier: 'перезарядка отряда',
  health_regen_modifier: 'восстановление здоровья',
  health_regeneration_modifier: 'восстановление здоровья',
  health_maximum_modifier: 'здоровье',
  sight_weapon_modifier: 'обзор',
  sight_radius_modifier: 'обзор',
  sight_radius_player_modifier: 'обзор (игрока)',
  scatter_weapon_modifier: 'разброс',
  weapon_scatter: 'разброс',
  target_size_modifier: 'размер цели',
  reinforce_radius_modifier: 'радиус подкрепления',
  posture_speed_modifier: 'скорость в положениях',
  weapon_suppression_modifier: 'подавление (наносимое)',
  enable_weapon_modifier: 'открывает оружие',
  construction_rate: 'скорость постройки',
  squad_cost_manpower_modifier: 'стоимость отряда (людские ресурсы)',
  capture_rate_squad_modifier: 'скорость захвата',
  capture_revert_rate_squad_modifier: 'скорость возврата захвата',
  detect_global_camouflage_radius: 'радиус обнаружения камуфляжа',
};

const ACTION_LABEL = {
  apply_to_entity: 'сущность',
  apply_to_squad: 'отряд',
  apply_to_weapon: 'оружие',
  apply_to_ability: 'способность',
};

// ---------------------------------------------------------------------------
// Relic Chunky v3 reader with duplicate-key preservation. The stock parser in
// lib/rgd.mjs collapses repeated keys (veterancy_rank occurs once per level!),
// so veterancy extraction needs its own table reader. Low-level format
// constants are re-used from lib/rgd.mjs (REF_HASH, jenkinsHash via the
// dictionary). Duplicated keys are collected into arrays.
// ---------------------------------------------------------------------------

const MAGIC = 'Relic Chunky\r\n\x1a\x00';

function readDataChunk(path) {
  const buffer = readFileSync(path);
  if (buffer.subarray(0, MAGIC.length).toString('latin1') !== MAGIC) {
    throw new Error(`not an RGD v3 file`);
  }
  let pos = MAGIC.length + 16;
  let data;
  while (pos + 20 <= buffer.length) {
    const type = buffer.readUInt32LE(pos);
    const name = buffer.subarray(pos + 4, pos + 12).toString('latin1').replace(/\0+$/, '');
    const nameLength = buffer.readUInt32LE(pos + 20);
    const dataLength = buffer.readUInt32LE(pos + 24 + nameLength + 12);
    const dataStart = pos + 24 + nameLength + 16;
    if (type === 1 && name === 'DATAAEGD') {
      data = buffer.subarray(dataStart, dataStart + dataLength);
    }
    pos = dataStart + dataLength;
  }
  if (!data) throw new Error('no DATAAEGD chunk');
  return data;
}

function readValue(data, pos, type) {
  if (type === 0) return data.readFloatLE(pos);
  if (type === 1) return data.readInt32LE(pos);
  if (type === 2) return data.readUInt8(pos) !== 0;
  if (type === 3) {
    const end = data.indexOf(0, pos);
    return data.subarray(pos, end < 0 ? data.length : end).toString('utf8');
  }
  if (type === 4) {
    let cursor = pos;
    while (cursor + 2 <= data.length && data.readUInt16LE(cursor) !== 0) cursor += 2;
    return data.toString('utf16le', pos, cursor);
  }
  if (type === 100 || type === 101) return readTable(data, pos);
  if (type === 254) return null;
  throw new Error(`unknown RGD value type ${type}`);
}

function readTable(data, tableStart) {
  const count = data.readUInt32LE(tableStart);
  const blob = tableStart + 4 + count * 12;
  const entries = {};
  let reference;
  for (let i = 0; i < count; i += 1) {
    const record = tableStart + 4 + i * 12;
    const hash = data.readUInt32LE(record);
    const type = data.readUInt32LE(record + 4);
    const offset = blob + data.readUInt32LE(record + 8);
    const value = readValue(data, offset, type);
    if (hash === REF_HASH) {
      if (typeof value === 'string') reference = value;
      continue;
    }
    const name = keys.get(hash) ?? `#${hash.toString(16).padStart(8, '0')}`;
    if (name in entries) {
      if (!Array.isArray(entries[name])) entries[name] = [entries[name]];
      entries[name].push(value);
    } else {
      entries[name] = value;
    }
  }
  if (reference) entries.$ref = reference;
  return entries;
}

const asArray = (value) => (Array.isArray(value) ? value : value == null ? [] : [value]);

// Depth-first search for the first object having `key` (duplicate-safe).
function findKey(node, key, depth = 0) {
  if (depth > 12 || node == null || typeof node !== 'object') return undefined;
  if (Array.isArray(node)) {
    for (const item of node) {
      const hit = findKey(item, key, depth + 1);
      if (hit !== undefined) return hit;
    }
    return undefined;
  }
  if (node[key] !== undefined) return node[key];
  for (const value of Object.values(node)) {
    const hit = findKey(value, key, depth + 1);
    if (hit !== undefined) return hit;
  }
  return undefined;
}

// Collect every modifiers/<name> entry of apply_modifiers_action nodes in the
// rank subtree, preserving file order.
function collectModifiers(node, out, unknown) {
  if (node == null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) collectModifiers(item, out, unknown);
    return;
  }
  if (typeof node.$ref === 'string' && node.$ref.includes('apply_modifiers_action')) {
    for (const [key, value] of Object.entries(node.modifiers ?? {})) {
      for (const mod of asArray(value)) {
        if (mod == null || typeof mod !== 'object') continue;
        const refName =
          typeof mod.$ref === 'string'
            ? mod.$ref.split(/[\\/]/).pop().replace(/\.lua$/, '')
            : null;
        const name = key.startsWith('#') ? refName ?? key : key;
        if (key.startsWith('#') && !refName) unknown.add(name);
        out.push({
          name,
          value: mod.value,
          usage: mod.usage_type,
          application: mod.application_type,
          target: mod.target_type_name,
        });
      }
    }
  }
  for (const child of Object.values(node)) collectModifiers(child, out, unknown);
}

function fmtNum(value) {
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

function formatModifier(mod, unknownLabels) {
  const label = MOD_LABEL[mod.name];
  if (label === null) return null; // explicitly skipped (e.g. XP gain)
  if (!label) {
    unknownLabels.add(mod.name);
    return null;
  }
  const hasNumber = typeof mod.value === 'number' && Number.isFinite(mod.value);
  const targetLabel = ACTION_LABEL[mod.application] ?? mod.application ?? '';
  if (hasNumber && mod.usage === 'multiplication') {
    return `${label} ×${fmtNum(mod.value)}`;
  }
  if (hasNumber && mod.usage === 'addition') {
    return `${label} ${mod.value >= 0 ? '+' : ''}${fmtNum(mod.value)}`;
  }
  if (mod.usage === 'enable' && mod.target) {
    return `${label} (${mod.target})`;
  }
  // Unknown op or missing value — fall back to the legacy qualitative format.
  return `${label}${targetLabel ? ` · ${targetLabel}` : ''} ${mod.usage === 'multiplication' || !hasNumber ? '×' : '+'}`;
}

function parseVeterancy(path, unknownLabels) {
  const data = readDataChunk(path);
  const root = readTable(data, 0);
  const ext = root.squad_veterancy_ext;
  if (ext == null || typeof ext !== 'object') return null;
  const rankInfo = findKey(ext, 'veterancy_rank_info');
  const rankNode = rankInfo?.veterancy_rank ?? findKey(ext, 'veterancy_rank');
  if (rankNode == null) return null;
  const ranks = asArray(rankNode).filter((r) => r != null && typeof r === 'object');
  if (ranks.length === 0) return null;

  const levels = {};
  const xp = [];
  let hasContent = false;
  ranks.forEach((rank, idx) => {
    const level = idx + 1;
    const mods = [];
    collectModifiers(rank, mods, unknownLabels);
    const lines = [];
    for (const mod of mods) {
      const line = formatModifier(mod, unknownLabels);
      if (line) lines.push(line);
    }
    const unique = [...new Set(lines)];
    if (unique.length > 0) {
      levels[level] = unique;
      hasContent = true;
    }
    const threshold = rank.experience_value;
    xp.push(typeof threshold === 'number' && threshold > 0 ? threshold : null);
  });
  if (!hasContent) return { levels: null, xp };
  return { levels, xp };
}

// ---------------------------------------------------------------------------
// Unit -> RGD resolution. Primary match by exact basename (id_mp.rgd /
// id.rgd), then substring matches, then base-variant fallbacks for squad
// variants without own veterancy data (assault_grenadier_squad_mp ->
// grenadier_squad_mp) by dropping name tokens one at a time.
// ---------------------------------------------------------------------------

function listSbpsFiles(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) listSbpsFiles(path, out);
    else if (entry.name.endsWith('.rgd')) out.push(path);
  }
  return out;
}

const EXCLUDE_RE = /wreck|demo|campaign|\/sp\/|_sp\.rgd$/i;

function candidatesFor(id) {
  const base = id.replace(/_mp$/i, '');
  const tokens = base.split('_');
  // Start with the full id, then progressively drop trailing and leading
  // tokens (single and double drops), keeping stable deterministic order.
  const variants = [base];
  for (let drop = 1; drop <= 2; drop += 1) {
    for (let tail = 0; tail <= drop; tail += 1) {
      const head = drop - tail;
      if (tail === 0 && head === 0) continue;
      if (head >= tokens.length || tail >= tokens.length) continue;
      const candidate = tokens.slice(head, tokens.length - tail).join('_');
      if (candidate.length >= 5 && !variants.includes(candidate)) variants.push(candidate);
    }
  }
  return variants;
}

function resolveRgd(unit, byBase) {
  for (const candidate of candidatesFor(unit.id)) {
    const exact = [`${candidate}_mp`, candidate];
    for (const name of exact) {
      const paths = byBase.get(name);
      if (paths) {
        const ok = paths.filter((p) => !EXCLUDE_RE.test(p));
        if (ok.length) return ok[0];
      }
    }
    const partial = [...byBase.entries()]
      .filter(([name]) => name.includes(candidate))
      .flatMap(([, paths]) => paths)
      .filter((p) => !EXCLUDE_RE.test(p));
    if (partial.length) {
      const mp = partial.find((p) => p.endsWith('_mp.rgd'));
      return mp ?? partial[0];
    }
  }
  return null;
}

// ---------------------------------------------------------------------------

const units = JSON.parse(readFileSync(join(ROOT, 'src/data/units.json'), 'utf8')).units;

const byBase = new Map();
for (const path of listSbpsFiles(join(ATTRIB, 'sbps'))) {
  const name = basename(path).replace(/\.rgd$/, '');
  if (!byBase.has(name)) byBase.set(name, []);
  byBase.get(name).push(path);
}

const result = {};
const xpResult = {};
const unknownLabels = new Set();
let parseErrors = 0;
let resolved = 0;

for (const unit of units) {
  const rgd = resolveRgd(unit, byBase);
  if (!rgd) continue;
  resolved += 1;
  let parsed;
  try {
    parsed = parseVeterancy(rgd, unknownLabels);
  } catch (error) {
    console.warn(`[skip] ${unit.id}: ${rgd} (${error.message})`);
    parseErrors += 1;
    continue;
  }
  if (!parsed) continue;
  if (parsed.levels) result[unit.index] = parsed.levels;
  if (parsed.xp.length && parsed.xp.every((v) => typeof v === 'number')) {
    xpResult[unit.index] = parsed.xp;
  }
}

// Safety net: if the parsed tree yielded no numeric values at all, the format
// assumption is wrong — refuse to invent numbers and report what was seen.
const numericTotal = Object.values(result).reduce(
  (sum, levels) =>
    sum + Object.values(levels).reduce((s, lines) => s + lines.filter((l) => /[×+]\s*-?\d/.test(l)).length, 0),
  0,
);
if (numericTotal === 0) {
  const sample = (() => {
    const probe = join(ATTRIB, 'sbps');
    try {
      const data = readDataChunk(
        listSbpsFiles(probe).find((p) => p.includes('grenadier_squad_mp')) ?? listSbpsFiles(probe)[0],
      );
      const root = readTable(data, 0);
      const ext = root.squad_veterancy_ext;
      return JSON.stringify(ext, null, 1).slice(0, 2000);
    } catch (error) {
      return `probe failed: ${error.message}`;
    }
  })();
  throw new Error(
    `No numeric modifier values parsed (suspect format change). Tree sample:\n${sample}`,
  );
}

// Per-faction coverage, before/after.
const factionOf = new Map(units.map((u) => [u.index, u.faction]));
const totals = {};
for (const unit of units) totals[unit.faction] = (totals[unit.faction] ?? 0) + 1;

let before = {};
try {
  const src = readFileSync(OUT, 'utf8');
  const block = src.match(/veterancyEffects[^=]*= ([\s\S]*?);\s*\n\s*\/\/ XP/)?.[1] ?? src.replace(/^[\s\S]*?= /, '').trim().replace(/;\s*$/, '');
  const old = JSON.parse(
    block
      .trim()
      .replace(/'/g, '"')
      .replace(/([{,]\s*)(\d+)(\s*:)/g, '$1"$2"$3')
      .replace(/,(\s*[}\]])/g, '$1'),
  );
  for (const idx of Object.keys(old)) {
    if (Object.keys(old[idx]).length > 0) {
      const fac = factionOf.get(Number(idx));
      before[fac] = (before[fac] ?? 0) + 1;
    }
  }
} catch {
  before = {};
}

const after = {};
for (const idx of Object.keys(result)) {
  const fac = factionOf.get(Number(idx));
  after[fac] = (after[fac] ?? 0) + 1;
}

const FACTIONS = ['USF', 'Soviet', 'British', 'OKW', 'Ostheer'];
console.log('\nCoverage by faction (before -> after):');
for (const fac of FACTIONS) {
  console.log(
    `  ${fac.padEnd(8)} ${before[fac] ?? 0}/${totals[fac]} (${pct(before[fac], totals[fac])})` +
      ` -> ${after[fac] ?? 0}/${totals[fac]} (${pct(after[fac], totals[fac])})`,
  );
}
console.log(
  `  TOTAL    ${Object.keys(before).length ? Object.values(before).reduce((a, b) => a + b, 0) : 0}/${units.length}` +
    ` -> ${Object.keys(result).length}/${units.length}`,
);
console.log(`Units resolved to an RGD file: ${resolved}/${units.length}; parse errors: ${parseErrors}`);
if (unknownLabels.size) {
  console.log(`Unrecognized modifier names: ${[...unknownLabels].sort().join(', ')}`);
}

// Eyeball sample.
const sampleIdx = Object.keys(result)
  .map(Number)
  .sort(() => Math.random() - 0.5)
  .slice(0, 10);
console.log('\nSample output:');
for (const idx of sampleIdx) {
  const unit = units.find((u) => u.index === idx);
  console.log(`  [${idx}] ${unit.name} (${unit.faction})`);
  for (const [level, lines] of Object.entries(result[idx])) {
    console.log(`    vet${level}: ${lines.join('; ')}`);
  }
}

writeFileSync(
  OUT,
  `// Generated from local Company of Heroes 2 archives (squad_veterancy_ext).\n` +
    `// Effects are numeric: "label ×multiplier" / "label +bonus"; legacy\n` +
    `// "label · target ×" lines mean the value is not expressed numerically.\n` +
    `export const veterancyEffects: Record<number, Record<number, string[]>> = ${JSON.stringify(result, null, 2)};\n\n` +
    `// XP thresholds per veterancy level (from veterancy_rank experience_value).\n` +
    `export const veterancyXp: Record<number, number[]> = ${JSON.stringify(xpResult, null, 2)};\n`,
);

console.log(`\nOutput: ${OUT}`);
console.log(
  `veterancyEffects: ${Object.keys(result).length} units; veterancyXp: ${Object.keys(xpResult).length} units`,
);

function pct(part, total) {
  return `${Math.round((100 * (part ?? 0)) / total)}%`;
}
