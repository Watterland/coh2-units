import { readFileSync } from 'node:fs';

// Parser for CoH2 Relic Chunky v3 (.rgd) files, matching the reverse
// engineered format used by community RGD tools:
// - header: 16 byte magic, u32 version, 3 padding u32s
// - chunk: char[8] type ("DATA"/"FOLD"), u32 version, u32 length,
//   u32 name length, name bytes, then (v3) two u32s and a u32 CRC,
//   then u32 data length and the payload
// - DATAAEGD payload: u32 entry count, count * (u32 hash, u32 type,
//   u32 data offset) tuples, then a value blob addressed by relative offset
// - value types: 0 float, 1 int, 2 bool (u8), 3 UTF-8 string (NUL
//   terminated), 4 UTF-16LE string (NUL terminated), 100/101 nested tables,
//   254 no data
// - table keys are hashed with the Bob Jenkins one-at-a-time hash

const MAGIC = 'Relic Chunky\r\n\x1a\x00';

export const REF_HASH = 0x49d60fae;

export function jenkinsHash(key) {
  const k = Buffer.from(key, 'latin1');
  let [a, b, c] = [0x9e3779b9, 0x9e3779b9, 0];
  let pos = 0;
  let len = k.length;
  const mix = () => {
    a = (a - b - c) >>> 0;
    a ^= c >>> 13;
    b = (b - c - a) >>> 0;
    b ^= (a << 8) >>> 0;
    c = (c - a - b) >>> 0;
    c ^= b >>> 13;
    a = (a - b - c) >>> 0;
    a ^= c >>> 12;
    b = (b - c - a) >>> 0;
    b ^= (a << 16) >>> 0;
    c = (c - a - b) >>> 0;
    c ^= b >>> 5;
    a = (a - b - c) >>> 0;
    a ^= c >>> 3;
    b = (b - c - a) >>> 0;
    b ^= (a << 10) >>> 0;
    c = (c - a - b) >>> 0;
    c ^= b >>> 15;
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
  };
  while (len >= 12) {
    a = (a + k.readUInt32LE(pos)) >>> 0;
    b = (b + k.readUInt32LE(pos + 4)) >>> 0;
    c = (c + k.readUInt32LE(pos + 8)) >>> 0;
    mix();
    pos += 12;
    len -= 12;
  }
  c = (c + k.length) >>> 0;
  switch (len) {
    case 11: c = (c + (k[pos + 10] << 24)) >>> 0; // falls through
    case 10: c = (c + (k[pos + 9] << 16)) >>> 0; // falls through
    case 9: c = (c + (k[pos + 8] << 8)) >>> 0; // falls through
    case 8: b = (b + (k[pos + 7] << 24)) >>> 0; // falls through
    case 7: b = (b + (k[pos + 6] << 16)) >>> 0; // falls through
    case 6: b = (b + (k[pos + 5] << 8)) >>> 0; // falls through
    case 5: b = (b + k[pos + 4]) >>> 0; // falls through
    case 4: a = (a + (k[pos + 3] << 24)) >>> 0; // falls through
    case 3: a = (a + (k[pos + 2] << 16)) >>> 0; // falls through
    case 2: a = (a + (k[pos + 1] << 8)) >>> 0; // falls through
    case 1: a = (a + k[pos]) >>> 0; // falls through
    default: break;
  }
  mix();
  return c >>> 0;
}

export function loadKeyDictionary(path) {
  const names = new Map();
  for (const line of readFileSync(path, 'latin1').split('\n')) {
    const body = line.split('#')[0].replace(/[\s,]/g, '');
    if (!body) continue;
    const [code, name] = body.split('=');
    if (!code?.startsWith('0x') || !name) continue;
    names.set(parseInt(code, 16), name);
  }
  return names;
}

export function parseRgd(path, keys) {
  const buffer = readFileSync(path);
  if (buffer.subarray(0, MAGIC.length).toString('latin1') !== MAGIC) {
    throw new Error(`Not an RGD v3 file: ${path}`);
  }
  let pos = MAGIC.length + 16;
  let data;
  while (pos + 20 <= buffer.length) {
    const type = buffer.readUInt32LE(pos);
    const name = buffer.subarray(pos + 4, pos + 12).toString('latin1').replace(/\0+$/, '');
    const version = buffer.readUInt32LE(pos + 12);
    const length = buffer.readUInt32LE(pos + 16);
    const nameLength = buffer.readUInt32LE(pos + 20);
    // v3 layout after the chunk name: two u32 unknowns, u32 CRC, u32 data
    // length, then the payload.
    const dataLength = buffer.readUInt32LE(pos + 24 + nameLength + 12);
    const dataStart = pos + 24 + nameLength + 16;
    if (type === 1 && name === 'DATAAEGD') {
      data = buffer.subarray(dataStart, dataStart + dataLength);
    }
    pos = dataStart + dataLength;
  }
  if (!data) throw new Error(`No DATAAEGD chunk in ${path}`);
  return readTable(data, 0, keys).value;
}

function keyName(hash, keys) {
  return keys?.get(hash) ?? `#${hash.toString(16).padStart(8, '0')}`;
}

function readTable(data, tableStart, keys) {
  const count = data.readUInt32LE(tableStart);
  const blob = tableStart + 4 + count * 12;
  const entries = {};
  let reference;
  for (let i = 0; i < count; i += 1) {
    const record = tableStart + 4 + i * 12;
    const hash = data.readUInt32LE(record);
    const type = data.readUInt32LE(record + 4);
    const offset = blob + data.readUInt32LE(record + 8);
    const parsed = readValue(data, offset, type, keys);
    const name = keyName(hash, keys);
    if (hash === REF_HASH && typeof parsed.value === 'string') {
      reference = parsed.value;
    } else {
      entries[name] = parsed.value;
    }
  }
  return { value: Object.keys(entries).length || reference ? { ...entries, ...(reference ? { $ref: reference } : {}) } : entries };
}

function readValue(data, pos, type, keys) {
  if (type === 0) return { value: data.readFloatLE(pos) };
  if (type === 1) return { value: data.readInt32LE(pos) };
  if (type === 2) return { value: data.readUInt8(pos) !== 0 };
  if (type === 3) {
    const end = data.indexOf(0, pos);
    return { value: data.subarray(pos, end < 0 ? data.length : end).toString('utf8') };
  }
  if (type === 4) {
    let cursor = pos;
    while (cursor + 2 <= data.length && data.readUInt16LE(cursor) !== 0) cursor += 2;
    return { value: data.toString('utf16le', pos, cursor) };
  }
  if (type === 100 || type === 101) return readTable(data, pos, keys);
  if (type === 254) return { value: null };
  throw new Error(`Unknown RGD value type ${type} at ${pos}`);
}
