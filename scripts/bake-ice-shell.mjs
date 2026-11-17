// The mobile egg's linear-data atlas. Rebuild with Node and ImageMagick.
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const width = 1024;
const height = 512;
const stride = width * 3;
const rgb = Buffer.alloc(stride * height);
const fract = (x) => x - Math.floor(x);
const clamp = (x) => Math.max(0, Math.min(1, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);
const tau = Math.PI * 2;

// Match the shader's cell warp and sinless hash so cracks and shattering share their boundaries.
const range = 17;
const offset = 8;
const cellTable = new Float64Array(range ** 3 * 3);
const cellIndex = (x, y, z) => ((z + offset) * range ** 2 + (y + offset) * range + x + offset) * 3;
for (let z = -offset; z <= offset; z++) for (let y = -offset; y <= offset; y++) for (let x = -offset; x <= offset; x++) {
  let a = fract(x * 0.1031), b = fract(y * 0.1030), c = fract(z * 0.0973);
  const d = a * (b + 33.33) + b * (a + 33.33) + c * (c + 33.33);
  a += d; b += d; c += d;
  const k = cellIndex(x, y, z);
  cellTable[k] = fract((a + b) * c);
  cellTable[k + 1] = fract((a + c) * b);
  cellTable[k + 2] = fract((b + c) * a);
}

function noiseHash(x, y, z) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 987643151);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function noise(x, y, z) {
  const a = Math.floor(x), b = Math.floor(y), c = Math.floor(z);
  const u = ease(x - a), v = ease(y - b), w = ease(z - c);
  const p = lerp(lerp(noiseHash(a, b, c), noiseHash(a + 1, b, c), u), lerp(noiseHash(a, b + 1, c), noiseHash(a + 1, b + 1, c), u), v);
  const q = lerp(lerp(noiseHash(a, b, c + 1), noiseHash(a + 1, b, c + 1), u), lerp(noiseHash(a, b + 1, c + 1), noiseHash(a + 1, b + 1, c + 1), u), v);
  return lerp(p, q, w);
}

const angles = Array.from({ length: width }, (_, i) => (i + 0.5) * tau / width);
const cosU = angles.map(Math.cos);
const sinU = angles.map(Math.sin);
for (let j = 0; j < height; j++) {
  const theta = Math.PI * (j + 0.5) / height;
  const st = Math.sin(theta), sy = Math.cos(theta);
  for (let i = 0; i < width; i++) {
    const sx = -cosU[i] * st, sz = sinU[i] * st;
    const x = sx * 3.55 + 0.16 * Math.sin(3.9 * sy + 2.3 * sz + 0.7);
    const y = sy * 2.65 + 0.16 * Math.sin(3.9 * sz + 2.3 * sx + 1.8);
    const z = sz * 3.55 + 0.16 * Math.sin(3.9 * sx + 2.3 * sy + 3.1);
    const cx = Math.floor(x), cy = Math.floor(y), cz = Math.floor(z);
    let first = 8, second = 8, id = 0;
    for (let a = cx - 1; a <= cx + 1; a++) for (let b = cy - 1; b <= cy + 1; b++) for (let c = cz - 1; c <= cz + 1; c++) {
      const k = cellIndex(a, b, c);
      const dx = a + cellTable[k] - x;
      const dy = b + cellTable[k + 1] - y;
      const dz = c + cellTable[k + 2] - z;
      const d = dx * dx + dy * dy + dz * dz;
      if (d < first) { second = first; first = d; id = cellTable[k]; }
      else if (d < second) second = d;
    }
    const frost = 0.05 + 0.46 * noise(sx * 5, sy * 5, sz * 5) +
      0.24 * noise(sx * 13 + 7.3, sy * 13 + 3.1, sz * 13) +
      0.12 * noise(sx * 36, sy * 36 + 3.2, sz * 36) +
      0.13 * noise(sx * 78, sy * 78, sz * 78 + 7) +
      0.10 * (1 - Math.min(1, Math.abs(noise(sx * 22, sy * 18, sz * 22) - 0.51) * 9));
    const k = (j * width + i) * 3;
    rgb[k] = Math.round(clamp((Math.sqrt(second) - Math.sqrt(first)) / 0.8) * 255);
    rgb[k + 1] = Math.round(clamp(Math.sqrt(first) / 1.18 * 0.94 + id * 0.06) * 255);
    rgb[k + 2] = Math.round(clamp(frost) * 255);
  }
}

// Lossless RGB PNG with Paeth prediction; no color-space profile because the channels are data.
const crcTable = Uint32Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n;
});
function chunk(name, data) {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(data.length, 0);
  header.write(name, 4, 'ascii');
  let crc = 0xffffffff;
  for (const value of header.subarray(4)) crc = (crc >>> 8) ^ crcTable[(crc ^ value) & 255];
  for (const value of data) crc = (crc >>> 8) ^ crcTable[(crc ^ value) & 255];
  const footer = Buffer.alloc(4);
  footer.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([header, data, footer]);
}
const filtered = Buffer.alloc((stride + 1) * height);
for (let y = 0; y < height; y++) {
  const src = y * stride;
  let dst = y * (stride + 1);
  filtered[dst++] = 4;
  for (let j = 0; j < stride; j++) {
    const a = j >= 3 ? rgb[src + j - 3] : 0;
    const b = y ? rgb[src + j - stride] : 0;
    const c = y && j >= 3 ? rgb[src + j - stride - 3] : 0;
    const aa = Math.abs(b - c), bb = Math.abs(a - c), cc = Math.abs(a + b - 2 * c);
    filtered[dst + j] = (rgb[src + j] - (aa <= bb && aa <= cc ? a : bb <= cc ? b : c)) & 255;
  }
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(width, 0);
ihdr.writeUInt32BE(height, 4);
ihdr[8] = 8; ihdr[9] = 2;
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(filtered, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
]);
const temp = await mkdtemp(join(tmpdir(), 'ice-shell-'));
try {
  const source = join(temp, 'shell.png');
  const destination = fileURLToPath(new URL('../src/assets/ice-shell.webp', import.meta.url));
  await writeFile(source, png);
  execFileSync('convert', [source, '-define', 'webp:method=6', '-define', 'webp:use-sharp-yuv=true', '-quality', '96', destination]);
  console.log(`Baked ${width} × ${height} shell atlas`);
} finally {
  await rm(temp, { recursive: true, force: true });
}
