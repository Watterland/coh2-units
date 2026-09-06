import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';

const SCRIPT =
  process.argv[2] || '/var/folders/8d/w6vszvjd3hg4p5sw6b8pbnn80000gn/T/opencode/serealia_script.js';
const HTML =
  process.argv[3] || '/var/folders/8d/w6vszvjd3hg4p5sw6b8pbnn80000gn/T/opencode/serealia.html';
const OUT = process.argv[4] || './src/data/units.json';

const code = readFileSync(SCRIPT, 'utf8');
const html = readFileSync(HTML, 'utf8');

// ---- Evaluate script in sandbox to extract runtime data ----
function el() {
  return {
    children: [],
    set innerHTML(v) {
      this.children = [];
    },
    get innerHTML() {
      return '';
    },
    setAttribute() {},
    getAttribute() {
      return null;
    },
    appendChild(c) {
      this.children.push(c);
      return c;
    },
    addEventListener() {},
    style: {},
  };
}
const els = {};
const document = {
  getElementById(id) {
    if (!els[id]) {
      els[id] = el();
      els[id].id = id;
    }
    return els[id];
  },
  createElement() {
    return el();
  },
};
const anyFn = () =>
  new Proxy(function () {}, {
    get: () => anyFn(),
    construct: () => anyFn(),
    apply: () => anyFn(),
  });
const sandbox = {
  window: {},
  document,
  google: new Proxy({}, { get: () => anyFn() }),
  console: { log() {} },
};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
vm.createContext(sandbox);
try {
  vm.runInContext(code, sandbox, { timeout: 30000 });
} catch (e) {
  console.error('eval warning (continuing):', e.message);
}

const strings = sandbox['_0x348a']();

const data = sandbox['data'];
const label = sandbox['label'];
const squadinfo = sandbox['squadinfo'];
const entities = sandbox['entities'];
const elabel = sandbox['elabel'];
const factions = sandbox['factions'];

// ---- Parse HTML unit list: name, category, index -> faction ----
// Divs in order: USF, British, Ostheer, Soviet, OKW
const factionOrder = ['USF', 'British', 'Ostheer', 'Soviet', 'OKW'];
const unitMeta = []; // index -> { faction, category, name }

{
  const factionRe = /<div id="(USF|British|Ostheer|Soviet|OKW)" class="unitlist">/g;
  const splits = [];
  let m;
  while ((m = factionRe.exec(html))) splits.push({ faction: m[1], start: m.index });
  splits.sort((a, b) => a.start - b.start);

  for (let s = 0; s < splits.length; s++) {
    const faction = splits[s].faction;
    const start = splits[s].start;
    const end = s + 1 < splits.length ? splits[s + 1].start : html.length;
    const block = html.slice(start, end);

    let category = 'Unknown';
    const btnRe = /<button class="dropbtn">([^<]+)<\/button>/g;
    const linkRe = /onclick="displayunit\((\d+)\)">([^<]+)<\/a>/g;
    // Walk block sequentially, tracking current category by button titles
    const tokens = [];
    const combined =
      /<button class="dropbtn">([^<]+)<\/button>|onclick="displayunit\((\d+)\)">([^<]+)<\/a>/g;
    while ((m = combined.exec(block))) {
      if (m[1] !== undefined) tokens.push({ type: 'cat', value: m[1] });
      else tokens.push({ type: 'unit', index: +m[2], name: m[3].trim() });
    }
    for (const t of tokens) {
      if (t.type === 'cat') category = t.value;
      else unitMeta[t.index] = { faction, category, name: t.name };
    }
  }
}

// ---- Build normalized unit list ----
const VET_LABELS = ['default', 'vet1', 'vet2', 'vet3', 'vet4', 'vet5'];

// entity tuple: [target_size, sight, speed, accel, rotate, front_armor, rear_armor, health, population]
const units = [];
for (let i = 0; i < squadinfo.length; i++) {
  const meta = unitMeta[i] || { faction: 'Unknown', category: 'Unknown', name: `Unit ${i}` };
  const [id, mainWeaponIdx, , vet1Breaks, vet2Breaks, population] = squadinfo[i] || [];
  const ents = entities[i] || [];

  // Extract each vet level's entity stats (may be null for absent vet levels)
  const vetStats = VET_LABELS.map((vname, v) => {
    const e = ents[v];
    if (!e || !e[0]) return null;
    const [target_size, sight, speed, accel, rotate, front_armor, rear_armor, health] = e[0];
    return {
      target_size,
      sight,
      speed,
      accel,
      rotate,
      front_armor,
      rear_armor,
      health,
      population: population ?? e[0][8] ?? null,
      num_entities: e.length,
    };
  });

  // Weapons for this unit
  const weapons = (data[i] || []).map((w, wi) => ({
    name: (label[i] && label[i][wi]) || null,
    ...w,
  }));

  // Entity labels (member names)
  const entityNames = elabel[i] || [];

  // Skip empty placeholder units (no internal id, no weapons)
  if (id == null && weapons.length === 0) continue;

  units.push({
    index: i,
    faction: meta.faction,
    category: meta.category,
    name: meta.name,
    id,
    population: population ?? null,
    mainWeaponIndex: mainWeaponIdx,
    vetStats,
    weapons,
    entityNames,
  });
}

const out = {
  meta: {
    source: 'https://coh2.serealia.ca/',
    note: 'Build costs (manpower/munitions/fuel) are not present in the source dataset; only combat statistics are included.',
    factions,
    generatedAt: new Date().toISOString(),
  },
  factions,
  units,
};

writeFileSync(OUT, JSON.stringify(out, null, 1));

// ---- Summary ----
const byFaction = {};
for (const u of units) byFaction[u.faction] = (byFaction[u.faction] || 0) + 1;
console.log('=== EXTRACTED ===');
console.log('units:', units.length, JSON.stringify(byFaction));
const missingMeta = units.filter((u) => u.category === 'Unknown').length;
console.log('missing meta:', missingMeta);
const sample = units[0];
console.log(
  'sample unit:',
  JSON.stringify({ ...sample, weapons: undefined, vetStats: sample.vetStats }).slice(0, 400),
);
console.log('sample weapon keys:', Object.keys(sample.weapons[0] || {}));
console.log('vetStats sample:', JSON.stringify(sample.vetStats));
