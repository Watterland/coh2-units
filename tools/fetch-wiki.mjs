import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const API = 'https://companyofheroes.fandom.com/api.php';
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36';

const ROOT = new URL('..', import.meta.url).pathname;
const UNITS_JSON = join(ROOT, 'src/data/units.json');
const OUT_TS = join(ROOT, 'src/data/wiki.ts');
const OUT_REPORT = join(ROOT, 'src/data/wiki-report.md');

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------
async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', ...params })}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Image resolution: File:Name.ext -> CDN URL
// ---------------------------------------------------------------------------
const imageCache = new Map();
async function resolveImage(fileName) {
  if (imageCache.has(fileName)) return imageCache.get(fileName);
  let url = null;
  try {
    const d = await api({
      action: 'query',
      titles: `File:${fileName}`,
      prop: 'imageinfo',
      iiprop: 'url',
    });
    const pages = d?.query?.pages ?? {};
    for (const p of Object.values(pages)) {
      if (p?.imageinfo?.[0]?.url) url = p.imageinfo[0].url;
    }
  } catch {
    url = null;
  }
  imageCache.set(fileName, url);
  await sleep(120);
  return url;
}

// ---------------------------------------------------------------------------
// Parse [[File:...]] inside a page to { name, url }
// ---------------------------------------------------------------------------
function extractFiles(wikitext) {
  const re = /\[\[File:([^\]|]+)(?:\|[^\]]*)?\]\]/g;
  const out = [];
  let m;
  while ((m = re.exec(wikitext))) {
    out.push(m[1].trim());
  }
  return [...new Set(out)];
}

function fileUrlFromList(files, preferPortrait = false) {
  // The portrait is usually the x300px inline image in |image = [[File:X.png|x300px]]
  return files[0] ?? null;
}

// ---------------------------------------------------------------------------
// Parse the infobox. We want:
//   - image: the "|image =" file
//   - abilities: list of { name, icon, description }
// ---------------------------------------------------------------------------
function stripWt(s) {
  return s
    .replace(/'''/g, '')
    .replace(/\{\{[Mm]unitions2?\|\s*(\d+)\s*\}\}/g, '$1 mun')
    .replace(/\{\{[Mm]anpower\|\s*(\d+)\s*\}\}/g, '$1 mp')
    .replace(/\{\{[Pp]opCap\|\s*(\d+)\s*\}\}/g, '$1 pop')
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .trim();
}

function rawField(box, key) {
  const match = box.match(new RegExp(`^\\s*\\|${key}\\s*=\\s*(.*)$`, 'im'));
  return match ? match[1] : '';
}

function field(box, key) {
  return stripWt(rawField(box, key));
}

function parseCost(value) {
  const cost = {};
  const templates = [
    ['manpower', /\{\{[Mm]anpower\|\s*([\d.]+)/g],
    ['munitions', /\{\{[Mm]unitions2?\|\s*([\d.]+)/g],
    ['fuel', /\{\{[Ff]uel\|\s*([\d.]+)/g],
    ['population', /\{\{[Pp]op[Cc]ap\|\s*([\d.]+)/g],
  ];
  for (const [key, re] of templates) {
    const match = re.exec(value);
    if (match) cost[key] = Number(match[1]);
  }
  return cost;
}

function parseUnitInfobox(wikitext) {
  const m =
    wikitext.match(/\{\{[Ii]nfobox[^}]*?\n[ \t]*\}\}[\s\S]*?\n[ \t]*\}\}/s) ||
    wikitext.match(/\{\{[Ii]nfobox[\s\S]*?\n\}\}/s);
  const box = m ? m[0] : wikitext;

  // The title field is the in-game command-card portrait. The image field is
  // generally a promotional render, unsuitable for compact unit cards.
  let image = null;
  const tMatch = box.match(/\|title\s*=\s*\[\[File:([^\]|]+)/);
  if (tMatch) image = tMatch[1].trim();
  if (!image) {
    const imgMatch = box.match(/\|image\s*=\s*\[\[File:([^\]|]+)/);
    if (imgMatch) image = imgMatch[1].trim();
  }

  // abilities block
  let abilitiesBlock = '';
  const abMatch = box.match(/\|abilities\s*=\s*([\s\S]*?)(?=\n\s*\|[a-z_]+(\s*=)|\n\s*\}\})/i);
  if (abMatch) abilitiesBlock = abMatch[1];

  const abilities = [];
  // Split abilities by separator: <br> that appears between ability entries.
  // Each entry begins with [[File:...]] '''Name'''
  const chunks = abilitiesBlock.split(/<br\s*\/?>/);
  for (const chunk of chunks) {
    const fm = chunk.match(/\[\[File:([^\]|]+)/);
    const nm = chunk.match(/'''([^']+)'''/);
    if (!nm) continue;
    const icon = fm ? fm[1].trim() : null;
    const name = nm[1].trim();
    const body = chunk.replace(nm[0], '').replace(/\[\[File:[^\]]*\]\]/, '');
    const desc = body
      .split('\n')
      .map((l) => stripWt(l.replace(/^\s*\*\s?/, '')))
      .filter(Boolean)
      .join(' · ');
    abilities.push({ name, icon, description: desc });
  }

  const unitCost = rawField(box, 'unit_cost');
  const role = field(box, 'role');
  const prerequisite = field(box, 'prereq');
  const structure = field(box, 'production_struc');
  const reinforce = field(box, 'reinforce_cost');
  const upkeep = field(box, 'upkeep');
  const description = field(box, 'description');

  return {
    image,
    abilities,
    cost: parseCost(unitCost),
    build: {
      ...(role && { role }),
      ...(prerequisite && { prerequisite }),
      ...(structure && { structure }),
      ...(reinforce && { reinforce }),
      ...(upkeep && { upkeep }),
    },
    ...(description && { description }),
  };
}

// ---------------------------------------------------------------------------
// Parse doctrine {{Commander}} template
// ---------------------------------------------------------------------------
function parseCommander(wikitext) {
  const m = wikitext.match(/\{\{[Cc]ommander\s*([\s\S]*?)\}\}/);
  if (!m) return null;
  const body = m[1];

  const pick = (key) => {
    const r = new RegExp(`\\|${key}\\s*=\\s*(.*?)(?=\\s*\\|branch_|\\s*\\}\\}|$)`, 's');
    const mm = body.match(r);
    return mm ? mm[1].trim() : null;
  };

  const image = (pick('banner') ?? pick('image') ?? '')?.match(/\[\[File:([^\]|]+)/)?.[1] ?? null;
  const name = pick('name');
  const cite = wikitext.match(/\{\{[Cc]ite\|([^}]*)\}\}/)?.[1]?.trim() ?? '';

  const abilities = [];
  for (let i = 1; i <= 20; i++) {
    const n = pick(`branch_${i}_name`);
    if (!n) break;
    abilities.push({
      name: n,
      description: stripWt(pick(`branch_${i}_data`) ?? ''),
      icon: (pick(`branch_${i}_image`) ?? '').match(/\[\[File:([^\]|]+)/)?.[1] ?? null,
      cost: pick(`branch_${i}_cost`),
    });
  }

  // faction from category
  const cat = wikitext.match(/\[\[Category:([^\]]+)Doctrines?\]\]/);
  let faction = null;
  if (cat) {
    const c = cat[1].toLowerCase();
    if (c.includes('ostheer') || c.includes('wehrmacht')) faction = 'Ostheer';
    else if (c.includes('soviet')) faction = 'Soviet';
    else if (c.includes('okw')) faction = 'OKW';
    else if (c.includes('us')) faction = 'USF';
    else if (c.includes('brit')) faction = 'British';
  }

  return { name, image, faction, description: cite, abilities };
}

// ---------------------------------------------------------------------------
// Map a serealia unit to a fandom page via opensearch
// ---------------------------------------------------------------------------

// Manual overrides for units that opensearch cannot match well.
// null = no fandom page exists (keep fallback silhouette).
const MANUAL_TITLES = {
  // USF
  4: 'Airborne Squad',
  5: null, // Paratrooper Support Squad
  6: null, // Pathfinders (CoH2 page missing)
  7: null, // I&R Pathfinders
  8: 'Ranger Squad',
  11: 'Medic',
  17: null, // M2HB .50 cal HMG
  18: null, // WC51 Military Truck
  22: null, // M36 Jackson
  23: null, // M15A1 AA Half-track
  24: 'Mortar Halftrack',
  27: 'M4A3 Sherman (CoH 2)',
  28: 'M4A3 Sherman (CoH 2)',
  30: 'Stuart Light Tank',
  32: 'Priest Self-Propelled Artillery',
  33: null, // M8A1 Howitzer Motor Carriage
  // British
  39: 'Commandos',
  49: null, // Land Mattress
  59: null, // Sexton
  62: null, // Valentine Tank
  // OKW
  136: null, // 2cm Flak 38 Emplacement
  144: null, // Flammpanzer 38 Hetzer
  156: null, // Sturmtiger
  162: 'SdKfz 222 Scout Car',
  // USF
  158: null, // Cavalry Riflemen
  // British
  167: 'Infantry Section (CoH2)',
};

async function resolveTitle(unit) {
  if (Object.prototype.hasOwnProperty.call(MANUAL_TITLES, unit.index)) {
    const manual = MANUAL_TITLES[unit.index];
    if (manual == null) return null;
    // Verify the manual title exists.
    const d = await api({ action: 'opensearch', search: manual, limit: 5 });
    if (d[1] && d[1].length > 0) {
      for (const t of d[1]) {
        if (t.toLowerCase() === manual.toLowerCase()) return t;
      }
      return d[1][0];
    }
    return null;
  }

  const name = unit.name;
  const faction = unit.faction;

  const queries = [name];
  if (faction === 'USF' && !/us/i.test(name)) queries.push(`US ${name}`);
  if (faction === 'British' && !/british|section|officer/i.test(name))
    queries.push(`British ${name}`);
  if (faction === 'Soviet' && !/soviet/i.test(name)) queries.push(`Soviet ${name}`);
  if (faction === 'Ostheer' && !/ost|grenadier/i.test(name)) queries.push(`Ostheer ${name}`);

  for (const q of queries) {
    try {
      const d = await api({ action: 'opensearch', search: q, limit: 10 });
      const titles = d[1];
      const nameWords = name
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2);

      let best = null;
      for (const t of titles) {
        const tl = t.toLowerCase();
        if (tl === name.toLowerCase()) {
          best = t;
          break;
        }
        // exact full-name inclusion
        if (tl.includes(name.toLowerCase())) {
          best = t;
          break;
        }
      }
      // fallback: title containing all significant words
      if (!best) {
        for (const t of titles) {
          const tl = t.toLowerCase();
          if (nameWords.every((w) => tl.includes(w))) {
            best = t;
            break;
          }
        }
      }
      if (best) return best;
    } catch {}
    await sleep(120);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const unitsData = JSON.parse(readFileSync(UNITS_JSON, 'utf8'));
  const units = unitsData.units;

  const report = [];
  const wikiUnits = []; // { index, imageUrl }
  const unitDetails = {}; // index -> Wiki-derived details
  const abilitiesOut = []; // { unitIndex, name, description, icon, type, cost }
  const doctrineOut = [];

  console.log(`Mapping ${units.length} units...`);

  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    let title = null;
    try {
      title = await resolveTitle(u);
    } catch (e) {
      report.push(`[ERR] ${u.name}: ${e.message}`);
    }
    await sleep(120);

    if (!title) {
      report.push(`[MISS] ${u.faction} / ${u.category}: "${u.name}" (index ${u.index})`);
      wikiUnits.push({ index: u.index, imageUrl: null });
      unitDetails[u.index] = {};
      continue;
    }

    let wikitext = null;
    try {
      const d = await api({ action: 'parse', page: title, prop: 'wikitext' });
      wikitext = d?.parse?.wikitext?.['*'] ?? null;
    } catch {}

    if (!wikitext) {
      report.push(`[NO-TEXT] ${title} (${u.name})`);
      wikiUnits.push({ index: u.index, imageUrl: null });
      unitDetails[u.index] = {};
      await sleep(120);
      continue;
    }

    const info = parseUnitInfobox(wikitext);
    let imageUrl = null;
    if (info.image) imageUrl = await resolveImage(info.image);

    if (!imageUrl) report.push(`[NO-IMG] ${title} (${u.name})`);
    wikiUnits.push({ index: u.index, imageUrl });
    unitDetails[u.index] = {
      ...(Object.keys(info.cost).length > 0 && { cost: info.cost }),
      ...(Object.keys(info.build).length > 0 && { build: info.build }),
      ...(info.description && { description: info.description }),
    };

    for (const a of info.abilities) {
      let icon = null;
      if (a.icon) icon = await resolveImage(a.icon);
      abilitiesOut.push({
        unitIndex: u.index,
        name: a.name,
        description: a.description,
        icon: icon ?? undefined,
      });
    }

    report.push(
      `[OK] ${title} <- ${u.name} (img=${!!imageUrl}, abilities=${info.abilities.length})`,
    );
    await sleep(120);
  }

  // ---- Doctrines ----
  console.log('Fetching doctrines...');
  const doctrineTitles = new Map();

  // Faction pages contain [[Doctrine]] links in their `links` prop.
  const factionPages = {
    Ostheer: 'Wehrmacht Ostheer',
    Soviet: 'Soviet Union',
    OKW: 'OKW',
    USF: 'US Forces',
    British: 'British Forces',
  };

  for (const [faction, page] of Object.entries(factionPages)) {
    try {
      const d = await api({ action: 'parse', page, prop: 'links' });
      for (const l of d?.parse?.links ?? []) {
        const t = l['*'] ?? l.title ?? '';
        if (/doctrine|tactics|regiment|commander/i.test(t)) doctrineTitles.set(t, faction);
      }
    } catch {}
    await sleep(120);
  }

  // Backfill from categories too.
  for (const cat of ['Wehrmacht Ostheer Doctrines', 'Doctrines']) {
    try {
      const d = await api({
        action: 'query',
        list: 'categorymembers',
        cmtitle: `Category:${cat}`,
        cmlimit: 500,
      });
      for (const p of d?.query?.categorymembers ?? []) {
        if (!doctrineTitles.has(p.title)) doctrineTitles.set(p.title, null);
      }
    } catch {}
    await sleep(120);
  }

  console.log(`  found ${doctrineTitles.size} doctrine pages`);

  let di = 0;
  for (const [title, impliedFaction] of doctrineTitles) {
    try {
      const d = await api({ action: 'parse', page: title, prop: 'wikitext' });
      const wt = d?.parse?.wikitext?.['*'] ?? null;
      if (!wt) continue;
      const cmd = parseCommander(wt);
      const faction = cmd?.faction ?? impliedFaction;
      if (cmd && cmd.name && faction) {
        const abilities = [];
        for (const a of cmd.abilities) {
          abilities.push({
            name: a.name,
            description: a.description,
            icon: a.icon ? await resolveImage(a.icon) : null,
          });
        }
        doctrineOut.push({
          faction,
          name: cmd.name,
          description: cmd.description ?? '',
          abilities,
        });
        di++;
      }
    } catch {}
    await sleep(120);
  }

  console.log(`  parsed ${di} doctrines`);

  // ---- Write wiki.ts ----
  const serialize = (obj) => JSON.stringify(obj, null, 2).replace(/"([^"]+)":/g, '$1:');

  const imageMap = {};
  for (const w of wikiUnits) imageMap[w.index] = w.imageUrl;

  const ts = [
    '// AUTO-GENERATED by tools/fetch-wiki.mjs — do not edit manually.',
    '// Regenerate: node tools/fetch-wiki.mjs',
    'import type { Ability, Doctrine, Unit } from "../types";',
    '',
    `export const unitImages: Record<number, string | null> = ${serialize(imageMap)};`,
    '',
    `export const unitDetails: Record<number, Partial<Unit>> = ${serialize(unitDetails)};`,
    '',
    `export const abilities: Ability[] = ${serialize(abilitiesOut)};`,
    '',
    `export const doctrines: Doctrine[] = ${serialize(doctrineOut)};`,
    '',
  ].join('\n');

  mkdirSync(join(ROOT, 'src/data'), { recursive: true });
  writeFileSync(OUT_TS, ts);

  const reportMd = [
    '# Wiki mapping report',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Mapped: ${units.length} units, ${report.filter((r) => r.startsWith('[OK]')).length} OK`,
    '',
    '## Units NOT matched (need manual review)',
    '',
    ...report.filter((r) => !r.startsWith('[OK]')),
    '',
    '## Full log',
    '',
    ...report,
  ].join('\n');
  writeFileSync(OUT_REPORT, reportMd);

  console.log('DONE. Report:', OUT_REPORT);
  console.log('Matched:', report.filter((r) => r.startsWith('[OK]')).length, '/', units.length);
  console.log('Doctrines parsed:', doctrineOut.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
