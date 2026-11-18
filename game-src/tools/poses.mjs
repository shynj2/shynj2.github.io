// Pose sheet: every frame of a weapon's clips with the weapon in the hands, enlarged.
//   node tools/poses.mjs out.png katana [knight] [scale]      (or "all" for the armed movement clips with every two-handed weapon)
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [out, weapon = 'katana', rig = 'recruiter', scale = '4'] = process.argv.slice(2);
const browser = await chromium.launch(), page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
page.on('pageerror', (e) => console.log('pageerror: ' + e.message));
await page.goto('file://' + path.join(ROOT, 'rune-architect.html'));
await page.waitForTimeout(400);
const url = await page.evaluate(async ({ weapon, rig, k }) => {
  G.name = 'ARASH'; el('intro').classList.remove('on'); G.scene = 'world';
  await Art.need(ZONES.arena); loadZone('arena', 'left');
  const R = Art.rigs[rig], all = R.def.clips;
  const rows = weapon === 'all'
    ? ['katana', 'crusader', 'hammer', 'staff'].flatMap((w) => ['run_2h', 'jump_up_2h', 'fall_2h', 'land_2h'].map((c) => [w, c]))
    : Object.keys(all).filter((c) => c.endsWith('_' + weapon)).map((c) => [weapon, c]).concat(WEAPONS[weapon].two ? [[weapon, 'run_2h']] : [[weapon, 'run'], [weapon, 'idle']]);
  const cols = Math.max(...rows.map((r) => all[r[1]].f.length)), CW = 76, CH = 64;
  const small = mk(cols * CW, rows.length * CH), g = small.getContext('2d');
  g.fillStyle = '#2a2433'; g.fillRect(0, 0, small.width, small.height);
  const keep = { cur: Arsenal.cur, out: Arsenal.drawnOut, own: Arsenal.owned, anim: P.anim, face: P.face };
  Arsenal.drawnOut = () => true;
  rows.forEach(([w, c], r) => {
    Arsenal.cur = () => w; Arsenal.owned = () => [w];
    g.fillStyle = '#3a3346'; g.fillRect(0, r * CH + CH - 6, small.width, 1);
    all[c].f.forEach((fr, i) => {
      const a = { rigName: rig, rig: R, name: c, clip: all[c], i, f: fr[0], t: 0, done: false }; P.anim = a; P.face = 1; P.act = '';
      const x = i * CW + 30, y = r * CH + CH - 6;
      Arsenal.draw(g, x, y, true); drawRig(g, a, x, y, 1, 1, false); Arsenal.draw(g, x, y, false);
    });
    g.drawImage(pixText(c, '#c9b8f5'), 1, r * CH + 1);
  });
  Object.assign(Arsenal, { cur: keep.cur, drawnOut: keep.out, owned: keep.own }); P.anim = keep.anim;
  const big = mk(small.width * k, small.height * k), q = big.getContext('2d'); q.imageSmoothingEnabled = false; q.drawImage(small, 0, 0, big.width, big.height);
  return big.toDataURL('image/png');
}, { weapon, rig, k: +scale });
(await import('node:fs')).writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
console.log('wrote', out);
await browser.close();
