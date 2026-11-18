// Screenshot helper.  node tools/shot.mjs out.png [--vp 1280x720] [--dpr 1] [--zone workshop] [--col 20] [--row 35]
//   [--wait 1.2] [--keys right:0.8,jump:0.1] [--touch] [--legacy] [--eval "js"] [--crop x,y,w,h] [--scale n]
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const a = process.argv.slice(2), out = a[0], opt = (k, d) => { const i = a.indexOf('--' + k); return i < 0 ? d : (a[i + 1] && !a[i + 1].startsWith('--') ? a[i + 1] : true); };
const [vw, vh] = String(opt('vp', '1280x720')).split('x').map(Number);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: +opt('dpr', 1), hasTouch: !!opt('touch', false), isMobile: !!opt('touch', false) });
const page = await ctx.newPage();
const errs = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
page.on('pageerror', (e) => errs.push('pageerror: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n')));
await page.goto('file://' + path.join(ROOT, 'rune-architect.html') + (opt('legacy', false) ? '?legacy=1' : ''));
await page.waitForTimeout(400);
const zone = opt('zone', 'workshop'), col = opt('col', null), row = opt('row', null);
if (!opt('legacy', false) && !opt('intro', false)) {
  await page.evaluate(async ({ zone, col, row }) => {
    G.name = 'ARASH'; hudSync(); el('intro').classList.remove('on'); G.scene = 'world';
    await Art.need(ZONES[zone]); loadZone(zone, 'left'); G.fade = 0; G.fadeDir = 0;
    el('zonecard').classList.remove('on'); el('stage').classList.remove('titlecard');
    if (col != null) { P.x = col * 16 + 1; P.y = (row != null ? row : World.floorBelow(col * 16 + 8, 48, false) / 16) * 16 - P.h; P.vy = 0; camSnap(); }
    P.act = ''; clearTimeout(showZoneCard._t);
  }, { zone, col: col == null ? null : +col, row: row == null ? null : +row });
}
if (opt('eval', null)) await page.evaluate(opt('eval'));
for (const k of String(opt('keys', '')).split(',').filter(Boolean)) {
  const [key, sec] = k.split(':'); const map = { right: 'ArrowRight', left: 'ArrowLeft', jump: 'ArrowUp', act: 'e', wait: null }[key];
  if (map) await page.keyboard.down(map); await page.waitForTimeout(+sec * 1000); if (map) await page.keyboard.up(map);
}
await page.waitForTimeout(+opt('wait', 1.2) * 1000);
if (opt('canvas', false)) await page.locator('#cv').screenshot({ path: out }); else await page.screenshot({ path: out });
const info = await page.evaluate(() => (typeof Perf === 'undefined' ? null : { VW, cam: [G.camX | 0, G.camY | 0], P: [P.x | 0, P.y | 0, P.onGround], clip: P.anim && P.anim.name, ms: (() => { const b = Array.from(Perf.buf.slice(0, Math.min(Perf.n, 600))).sort((x, y) => x - y); return { p50: +b[b.length >> 1].toFixed(2), p95: +b[(b.length * .95) | 0].toFixed(2), max: +b[b.length - 1].toFixed(2), n: Perf.n }; })() }));
console.log(JSON.stringify(info)); if (errs.length) console.log('ERRORS:\n' + errs.slice(0, 12).join('\n'));
await browser.close();
