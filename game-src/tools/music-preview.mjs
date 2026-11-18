// Renders every piece of the score without playing it, writes review/music/<id>.wav (22 kHz mono), and prints loudness.
//   node tools/music-preview.mjs [seconds=24]
// The Throne piece is rendered at each of its five intensities (before the fight, three phases, the terminal).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), OUT = path.join(ROOT, 'review', 'music');
fs.mkdirSync(OUT, { recursive: true });
const sec = +(process.argv[2] || 24);
const browser = await chromium.launch();
const page = await browser.newPage();
const errs = []; page.on('pageerror', (e) => errs.push(e.message));
await page.goto('file://' + path.join(ROOT, 'rune-architect.html')); await page.waitForTimeout(300);
const jobs = await page.evaluate(() => Object.keys(Music.TRACKS).flatMap((id) => (id === 'arena' ? [0, 1, 2, 3, 4].map((lv) => [id, lv]) : [[id, 1]])));
console.log('piece                         level  peak   rms    loop(s)');
for (const [id, lv] of jobs) {
  const r = await page.evaluate(async ({ id, lv, sec }) => {
    const d = await Music.offline(id, sec, lv), T = Music.TRACKS[id];
    let pk = 0, sq = 0; for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > pk) pk = v; sq += v * v; }
    const pcm = new Int16Array(d.length); for (let i = 0; i < d.length; i++) pcm[i] = Math.max(-1, Math.min(1, d[i])) * 32767;
    let bin = ''; const u8 = new Uint8Array(pcm.buffer); for (let i = 0; i < u8.length; i += 32768) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
    return { name: T.name, pk: +pk.toFixed(3), rms: +Math.sqrt(sq / d.length).toFixed(3), loop: +(T.prog.length * T.bpb * 60 / ((T.tempo && T.tempo[lv]) || T.bpm)).toFixed(1), b64: btoa(bin) };
  }, { id, lv, sec });
  const data = Buffer.from(r.b64, 'base64'), h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(22050, 24); h.writeUInt32LE(22050 * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(path.join(OUT, id + (id === 'arena' ? '_' + lv : '') + '.wav'), Buffer.concat([h, data]));
  console.log((id + ' · ' + r.name).padEnd(30), String(lv).padEnd(6), String(r.pk).padEnd(6), String(r.rms).padEnd(6), r.loop, r.pk > .98 ? '  CLIPS' : '');
}
if (errs.length) console.log('ERRORS', errs.slice(0, 3));
await browser.close();
