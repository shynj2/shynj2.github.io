// REACH — which platforms can the Recruiter actually stand on? Honest jump model, measured in the game:
// rise 2 tiles (jump peak is 2.8), cross a 4-tile gap on the level, 3 when also rising 2. Sleeping platforms count as awake.
//   node tools/reach.mjs            prints every standable run of tiles that cannot be reached from the left door
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function reach(txt, spawnCol = 6) {
  const rows = txt.split('\n').filter((r) => !/^# /.test(r) && r.length), h = rows.length, w = Math.max(...rows.map((r) => r.length));
  const at = (x, y) => (x < 0 || x >= w || y < 0) ? '#' : y >= h ? ' ' : (rows[y][x] || ' ');
  const floor = (x, y) => { const c = at(x, y); return c === '#' || c === '=' || c === '-' || (c >= '1' && c <= '9'); };
  const stand = (x, y) => floor(x, y) && at(x, y - 1) !== '#' && at(x, y - 2) !== '#' && at(x, y - 3) !== '#';
  let sy = 0; while (sy < h && !stand(spawnCol, sy)) sy++;
  const seen = new Set([spawnCol + ',' + sy]), q = [[spawnCol, sy]];
  while (q.length) {
    const [x, y] = q.pop();
    for (let dx = -6; dx <= 6; dx++) for (let ny = y - 2; ny < h; ny++) {
      if (!dx && ny === y) continue;
      const nx = x + dx, up = y - ny, ad = Math.abs(dx), sg = Math.sign(dx);
      if (!stand(nx, ny)) continue;
      if (up === 2 && ad > 3) continue; if (up === 1 && ad > 4) continue; if (up === 0 && ad > 5) continue; if (up < 0 && ad > 5 + Math.min(1, -up)) continue;
      if (ad === 1 && up === 0) { /* walk */ }
      else if (ad === 0 && up < 0) { if (at(x, y) === '#') continue; continue; }       // no dropping through floors
      else {
        let ok = true;                                                               // the arc passes over the higher of the two floors: that corridor must be free of stone
        const top = Math.min(y, ny);
        for (let k = 1; k < ad && ok; k++) for (let j = 1; j <= 3; j++) if (at(x + sg * k, top - j) === '#') ok = false;
        for (let yy = top - 3; yy < y - 3 && ok; yy++) if (at(x, yy) === '#') ok = false;      // headroom above the take-off when rising
        for (let yy = top - 3; yy < ny - 3 && ok; yy++) if (at(nx, yy) === '#') ok = false;    // and above the landing when falling
        if (!ok) continue;
      }
      const key = nx + ',' + ny; if (!seen.has(key)) { seen.add(key); q.push([nx, ny]); }
    }
  }
  const lost = [];
  for (let y = 0; y < h; y++) { let run = null; for (let x = 0; x <= w; x++) { const bad = x < w && stand(x, y) && !seen.has(x + ',' + y) && at(x, y) !== '#'; if (bad) run = run || [x, x], run[1] = x; else if (run) { lost.push(`row ${y} cols ${run[0]}-${run[1]}`); run = null; } } }
  return { seen, lost, w, h };
}
if (process.argv[1] && process.argv[1].endsWith('reach.mjs')) {
  for (const f of fs.readdirSync(path.join(ROOT, 'art-src/maps'))) {
    const r = reach(fs.readFileSync(path.join(ROOT, 'art-src/maps', f), 'utf8'));
    console.log(f.padEnd(16), r.w + 'x' + r.h, r.lost.length ? 'UNREACHABLE: ' + r.lost.join(' | ') : 'every platform can be stood on');
  }
}
