import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const WIKI_FILE = join(ROOT, 'src/data/wiki.ts');
const MEDIA_DIR = join(ROOT, 'public/media');
const USER_AGENT = 'COH2 Units asset cache/1.0';

mkdirSync(MEDIA_DIR, { recursive: true });

const source = readFileSync(WIKI_FILE, 'utf8');
const urls = [...new Set(source.match(/https:\/\/static\.wikia\.nocookie\.net\/[^"\s]+/g) ?? [])];
const replacements = new Map();

console.log(`Caching ${urls.length} Fandom assets...`);

for (let index = 0; index < urls.length; index += 1) {
  const url = urls[index];
  const id = createHash('sha1').update(url).digest('hex').slice(0, 16);
  const localPath = join(MEDIA_DIR, `${id}.webp`);
  try {
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    writeFileSync(localPath, Buffer.from(await response.arrayBuffer()));
    replacements.set(url, `/media/${id}.webp`);
    console.log(`[${index + 1}/${urls.length}] cached`);
  } catch (error) {
    console.warn(`[${index + 1}/${urls.length}] skipped: ${error.message}`);
  }
}

let output = source;
for (const [url, local] of replacements) output = output.replaceAll(url, local);
writeFileSync(WIKI_FILE, output);
console.log(`Cached ${replacements.size}/${urls.length} assets.`);
