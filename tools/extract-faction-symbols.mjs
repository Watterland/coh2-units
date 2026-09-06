import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = new URL('..', import.meta.url).pathname;
const TEMP = '/var/folders/8d/w6vszvjd3hg4p5sw6b8pbnn80000gn/T/opencode/coh2-game-icons';
const GFX = join(TEMP, 'ui/ui/bin/coh2ui.gfx');
const SYMBOLS = join(TEMP, 'symbols.csv');
const TEXTURES = join(TEMP, 'ui/ui/assets/textures');
const OUT = join(ROOT, 'public/factions');

if (!existsSync(GFX) || !existsSync(SYMBOLS)) throw new Error('Run extract-game-icons first.');
mkdirSync(OUT, { recursive: true });

const swf = Buffer.from(readFileSync(GFX));
swf.write('FWS', 0, 'ascii');
const firstTag = () => {
  const bits = swf[8] >> 3;
  return 8 + Math.ceil((5 + bits * 4) / 8) + 4;
};

const rects = new Map();
const atlases = new Map();
let pos = firstTag();
while (pos + 2 <= swf.length) {
  const header = swf.readUInt16LE(pos);
  pos += 2;
  const code = header >> 6;
  let length = header & 63;
  if (length === 63) {
    length = swf.readUInt32LE(pos);
    pos += 4;
  }
  if (code === 1008 && length === 12) {
    const id = swf.readUInt16LE(pos);
    const x = swf.readUInt16LE(pos + 4);
    const y = swf.readUInt16LE(pos + 6);
    rects.set(id, {
      atlasId: swf.readUInt16LE(pos + 2),
      x,
      y,
      width: swf.readUInt16LE(pos + 8) - x,
      height: swf.readUInt16LE(pos + 10) - y,
    });
  }
  if (code === 1009 && length > 8) {
    const name = swf
      .subarray(pos, pos + length)
      .toString('latin1')
      .match(/(CoH2UI_[A-Z0-9]+)\.tga/i)?.[1]
      ?.toLowerCase();
    if (name) atlases.set(swf.readUInt16LE(pos), `${name}.dds`);
  }
  pos += length;
}

const ids = new Map(
  readFileSync(SYMBOLS, 'utf8')
    .split('\n')
    .map((line) => line.trim().split(';'))
    .map(([id, name]) => [name, Number(id)]),
);
const names = {
  USF: 'Icons_factions_faction_aef_128',
  British: 'Icons_factions_faction_british_128',
  Ostheer: 'Icons_factions_faction_german_128',
  Soviet: 'Icons_factions_faction_soviet_128',
  OKW: 'Icons_factions_faction_west_german_128',
};
const cached = new Map();
for (const [faction, name] of Object.entries(names)) {
  const rect = rects.get(ids.get(name));
  const atlas = rect && atlases.get(rect.atlasId);
  if (!rect || !atlas) throw new Error(`Missing ${name}`);
  const source = join(TEXTURES, atlas);
  let png = cached.get(source);
  if (!png) {
    png = join(TEMP, `faction-${basename(source, '.dds')}.png`);
    execFileSync('sips', ['-s', 'format', 'png', source, '--out', png]);
    cached.set(source, png);
  }
  execFileSync('sips', [
    '-c',
    String(rect.height),
    String(rect.width),
    '--cropOffset',
    String(rect.y),
    String(rect.x),
    png,
    '--out',
    join(OUT, `${faction.toLowerCase()}.png`),
  ]);
}
console.log('Extracted official CoH2 faction symbols.');
