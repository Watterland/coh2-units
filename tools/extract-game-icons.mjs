import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const GAME = process.argv[2];
if (!GAME) throw new Error('Usage: npm run extract-game-icons -- "/path/to/Company of Heroes 2"');
const FFDEC = process.env.FFDEC_JAR;
if (!FFDEC || !existsSync(FFDEC)) throw new Error('Set FFDEC_JAR to the path of ffdec.jar.');

const ROOT = new URL('..', import.meta.url).pathname;
const TEMP = '/var/folders/8d/w6vszvjd3hg4p5sw6b8pbnn80000gn/T/opencode/coh2-game-icons';
const UI = join(TEMP, 'ui');
const ATTRIB = join(TEMP, 'attrib');
const GFX = join(UI, 'ui/bin/coh2ui.gfx');
const SWF = join(TEMP, 'coh2ui.swf');
const SYMBOLS = join(TEMP, 'symbols.csv');
const OUT = join(ROOT, 'public/game-icons');
const MAP = join(ROOT, 'src/data/game-icons.ts');
const REPORT = join(ROOT, 'src/data/game-icons-report.md');
const WINE =
  '/Applications/CrossOver.app/Contents/SharedSupport/CrossOver/CrossOver-Hosted Application/wine';
const ARCHIVE = join(GAME, 'Archive.exe');
const UI_ARCHIVE = join(GAME, 'CoH2/Archives/UIHigh.sga');
const ATTRIB_ARCHIVE = join(GAME, 'CoH2/Archives/AttribArchive.sga');

function run(command, args) {
  execFileSync(command, args, { stdio: 'inherit' });
}

function extract(archive, destination) {
  run(WINE, ['--bottle', 'Steam', '--no-gui', '--wait', ARCHIVE, '-a', archive, '-e', destination]);
}

rmSync(TEMP, { recursive: true, force: true });
mkdirSync(TEMP, { recursive: true });
extract(UI_ARCHIVE, UI);
extract(ATTRIB_ARCHIVE, ATTRIB);

const gfx = readFileSync(GFX);
const swf = Buffer.from(gfx);
swf.write('FWS', 0, 'ascii');
writeFileSync(SWF, swf);
run('java', ['-jar', FFDEC, '-onerror', 'ignore', '-export', 'symbolClass', TEMP, SWF]);

// The caller provides JPEXS to the temp directory once; this validates the generated map.
if (!existsSync(SYMBOLS)) throw new Error('JPEXS did not create symbols.csv');

const ids = new Map(
  readFileSync(SYMBOLS, 'utf8')
    .split('\n')
    .flatMap((line) => {
      const [id, name] = line.trim().split(';');
      return name?.startsWith('Icons_portraits_') ? [[name, Number(id)]] : [];
    }),
);

function parseSpriteRects(buffer) {
  const headerBits = buffer[8] >> 3;
  let pos = 8 + Math.ceil((5 + headerBits * 4) / 8) + 4;
  const rects = new Map();
  while (pos + 2 <= buffer.length) {
    const header = buffer.readUInt16LE(pos);
    pos += 2;
    const code = header >> 6;
    let length = header & 63;
    if (length === 63) {
      length = buffer.readUInt32LE(pos);
      pos += 4;
    }
    if (code === 1008 && length === 12) {
      const id = buffer.readUInt16LE(pos);
      const atlasId = buffer.readUInt16LE(pos + 2);
      const x = buffer.readUInt16LE(pos + 4);
      const y = buffer.readUInt16LE(pos + 6);
      const right = buffer.readUInt16LE(pos + 8);
      const bottom = buffer.readUInt16LE(pos + 10);
      rects.set(id, { atlasId, x, y, width: right - x, height: bottom - y });
    }
    pos += length;
  }
  return rects;
}

// Resolve Scaleform ImageFile tags: id -> named external DDS atlas.
function parseAtlases(buffer) {
  const headerBits = buffer[8] >> 3;
  let pos = 8 + Math.ceil((5 + headerBits * 4) / 8) + 4;
  const atlases = new Map();
  while (pos + 2 <= buffer.length) {
    const header = buffer.readUInt16LE(pos);
    pos += 2;
    const code = header >> 6;
    let length = header & 63;
    if (length === 63) {
      length = buffer.readUInt32LE(pos);
      pos += 4;
    }
    if (code === 1009 && length > 8) {
      const id = buffer.readUInt16LE(pos);
      const text = buffer.subarray(pos, pos + length).toString('latin1');
      const name = text.match(/(CoH2UI_[A-Z0-9]+)\.tga/i)?.[1]?.toLowerCase();
      if (name) atlases.set(id, `${name}.dds`);
    }
    pos += length;
  }
  return atlases;
}

const rects = parseSpriteRects(swf);
const atlases = parseAtlases(swf);
const units = JSON.parse(readFileSync(join(ROOT, 'src/data/units.json'), 'utf8')).units;
const attribRoot = join(ATTRIB, 'attrib');
const portraitByUnit = {};
mkdirSync(OUT, { recursive: true });
const convertedAtlases = new Map();

function pngAtlas(source) {
  if (convertedAtlases.has(source)) return convertedAtlases.get(source);
  const target = join(TEMP, `atlas-${basename(source, '.dds')}.png`);
  execFileSync('sips', ['-s', 'format', 'png', source, '--out', target]);
  convertedAtlases.set(source, target);
  return target;
}

const PORTRAIT_OVERRIDES = {
  109: 'Icons_portraits_vehicle_soviet_is2_heavy_tank_w_portrait',
  112: 'Icons_portraits_vehicle_soviet_kv1_heavy_tank_s_portrait',
  114: 'Icons_portraits_vehicle_soviet_kv8_flamethrower_tank_s_portrait',
  120: 'Icons_portraits_vehicle_aef_m4a3_sherman_w_portrait',
  70: 'Icons_portraits_unit_german_ostruppen_s_portrait',
  71: 'Icons_portraits_unit_german_ostruppen_s_portrait',
  69: 'Icons_portraits_unit_german_officer_w_portrait',
  110: 'Icons_portraits_vehicle_soviet_isu_152_w_portrait',
  113: 'Icons_portraits_vehicle_soviet_kv2_heavy_tank_w_portrait',
  123: 'Icons_portraits_vehicle_soviet_su76_artillery_tank_w_portrait',
  124: 'Icons_portraits_vehicle_soviet_su85_tank_destroyer_w_portrait',
  125: 'Icons_portraits_vehicle_soviet_t70m_light_tank_w_portrait',
  131: 'Icons_portraits_unit_german_jaeger_light_infantry_w_portrait',
  105: 'Icons_portraits_icons_portraits_unit_soviet_assault_guard_w',
  159: 'Icons_portraits_unit_british_assault_section_w',
  166: 'Icons_portraits_unit_soviet_airbourne_w',
  167: 'Icons_portraits_unit_british_raid_section_w',
  168: 'Icons_portraits_unit_german_luftwaffe_officer_w',
};

function findPortrait(unit) {
  if (PORTRAIT_OVERRIDES[unit.index]) {
    return { portrait: PORTRAIT_OVERRIDES[unit.index], source: 'manual override' };
  }
  const id = (unit.id ?? '').replace(/_mp$/, '');
  if (id.length < 5) return { portrait: null, source: 'internal id is too short for a safe match' };
  // Squad files contain the exact command-card portrait reference. Search extracted RGD names first.
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
  walk(attribRoot);
  for (const path of candidates) {
    const match = readFileSync(path)
      .toString('latin1')
      .match(/Icons_portraits_[A-Za-z0-9_]+_w_portrait/);
    if (match) return { portrait: match[0], source: path.replace(`${ATTRIB}/`, '') };
  }
  return { portrait: null, source: 'no matching squad/entity RGD found' };
}

const report = [];
for (const unit of units) {
  const found = findPortrait(unit);
  const portrait = found.portrait;
  const portraitCandidates = portrait
    ? [
        portrait,
        portrait.replace('britsh_17', 'british_17'),
        `${portrait}_`,
        `${portrait.replace('britsh_17', 'british_17')}_`,
      ]
    : [];
  const normalizedPortrait = portraitCandidates.find((candidate) => ids.has(candidate));
  const id = normalizedPortrait ? ids.get(normalizedPortrait) : undefined;
  const rect = id ? rects.get(id) : undefined;
  const atlas = rect ? atlases.get(rect.atlasId) : undefined;
  if (!rect || !atlas) {
    report.push(
      `| ${unit.index} | ${unit.faction} | ${unit.name} | ${normalizedPortrait ?? '—'} | Missing | ${found.source} |`,
    );
    continue;
  }
  const source = join(UI, 'ui/assets/textures', atlas);
  if (!existsSync(source)) {
    report.push(
      `| ${unit.index} | ${unit.faction} | ${unit.name} | ${normalizedPortrait} | Missing | atlas ${atlas} not found |`,
    );
    continue;
  }
  const file = `${unit.index}.png`;
  execFileSync('sips', [
    '-c',
    String(rect.height),
    String(rect.width),
    '--cropOffset',
    String(rect.y),
    String(rect.x),
    pngAtlas(source),
    '--out',
    join(OUT, file),
  ]);
  portraitByUnit[unit.index] = `/game-icons/${file}`;
  report.push(
    `| ${unit.index} | ${unit.faction} | ${unit.name} | ${normalizedPortrait} | OK | ${found.source} |`,
  );
}

writeFileSync(
  MAP,
  `// Generated from local Company of Heroes 2 archives.\nexport const gameUnitIcons: Record<number, string> = ${JSON.stringify(portraitByUnit, null, 2)};\n`,
);
writeFileSync(
  REPORT,
  [
    '# CoH2 Game Portrait Audit',
    '',
    '| Index | Faction | Unit | Game portrait | Status | Match source |',
    '| --- | --- | --- | --- | --- | --- |',
    ...report,
  ].join('\n'),
);
console.log(`Extracted ${Object.keys(portraitByUnit).length}/${units.length} game portraits.`);
