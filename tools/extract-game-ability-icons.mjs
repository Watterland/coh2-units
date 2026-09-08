import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = new URL('..', import.meta.url).pathname;
const TEMP = process.env.COH2_UI_TEMP ?? '/var/folders/8d/w6vszvjd3hg4p5sw6b8pbnn80000gn/T/opencode/coh2-game-icons';
const UI = join(TEMP, 'ui');
const GFX = join(UI, 'ui/bin/coh2ui.gfx');
const SYMBOLS = join(TEMP, 'symbols.csv');
const OUT = join(ROOT, 'public/game-ability-icons');
const MAP = join(ROOT, 'src/data/game-ability-icons.ts');

if (!existsSync(GFX) || !existsSync(SYMBOLS)) {
  throw new Error('Run extract-game-icons first to unpack the CoH2 UI atlas and symbols.');
}

const swf = Buffer.from(readFileSync(GFX));
swf.write('FWS', 0, 'ascii');

function firstTagOffset(buffer) {
  const nbits = buffer[8] >> 3;
  return 8 + Math.ceil((5 + nbits * 4) / 8) + 4;
}

function parseRects(buffer) {
  let pos = firstTagOffset(buffer);
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
      rects.set(id, {
        atlasId,
        x,
        y,
        width: buffer.readUInt16LE(pos + 8) - x,
        height: buffer.readUInt16LE(pos + 10) - y,
      });
    }
    pos += length;
  }
  return rects;
}

function parseAtlases(buffer) {
  let pos = firstTagOffset(buffer);
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
      const name = buffer
        .subarray(pos, pos + length)
        .toString('latin1')
        .match(/(CoH2UI_[A-Z0-9]+)\.tga/i)?.[1]
        ?.toLowerCase();
      if (name) atlases.set(id, `${name}.dds`);
    }
    pos += length;
  }
  return atlases;
}

const ids = new Map(
  readFileSync(SYMBOLS, 'utf8')
    .split('\n')
    .flatMap((line) => {
      const [id, rawName] = line.trim().split(';');
      const name = rawName?.replace(/^"|"$/g, '');
      return /^(Icons_abilities_|Icons_commander_(?!portrait)|Icons_vehicles_|Icons_units_unit_|Icons_upgrades_|Icons_weapons_)/.test(name)
        ? [[name, Number(id)]]
        : [];
    }),
);
const rects = parseRects(swf);
const atlases = parseAtlases(swf);
const converted = new Map();
const output = {};
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

function pngAtlas(path) {
  if (converted.has(path)) return converted.get(path);
  const png = join(TEMP, `ability-${basename(path, '.dds')}.png`);
  execFileSync('sips', ['-s', 'format', 'png', path, '--out', png]);
  converted.set(path, png);
  return png;
}

for (const [name, id] of ids) {
  const rect = rects.get(id);
  const atlas = rect && atlases.get(rect.atlasId);
  if (!rect || !atlas) continue;
  const source = join(UI, 'ui/assets/textures', atlas);
  if (!existsSync(source) || rect.width <= 0 || rect.height <= 0) continue;
  const file = `${id}.png`;
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
  output[name] = `/game-ability-icons/${file}`;
}

writeFileSync(
  MAP,
  `// Generated from CoH2 UI ability and commander icon atlases.\nexport const gameAbilityIcons: Record<string, string> = ${JSON.stringify(output, null, 2)};\n`,
);
console.log(`Extracted ${Object.keys(output).length}/${ids.size} game ability icons.`);
