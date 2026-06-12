import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, '../public/icons');

const BRAND = { r: 37, g: 99, b: 235 };
const SIZES = [16, 32, 48, 128];

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  const crcInput = Buffer.concat([typeBuffer, data]);
  crc.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function createPng(size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowSize = 1 + size * 3;
  const raw = Buffer.alloc(rowSize * size);

  for (let y = 0; y < size; y += 1) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0;

    for (let x = 0; x < size; x += 1) {
      const px = rowOffset + 1 + x * 3;
      const edge = x === 0 || y === 0 || x === size - 1 || y === size - 1;
      const centerMark =
        x > size * 0.3 && x < size * 0.7 && y > size * 0.3 && y < size * 0.7;

      const color = centerMark
        ? { r: 255, g: 255, b: 255 }
        : edge
          ? { r: 15, g: 23, b: 42 }
          : BRAND;

      raw[px] = color.r;
      raw[px + 1] = color.g;
      raw[px + 2] = color.b;
    }
  }

  const compressed = deflateSync(raw);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(outputDir, { recursive: true });

for (const size of SIZES) {
  const png = createPng(size);
  const path = join(outputDir, `icon-${size}.png`);
  writeFileSync(path, png);
  const hash = createHash('sha256').update(png).digest('hex').slice(0, 12);
  console.log(`Wrote ${path} (${hash})`);
}
