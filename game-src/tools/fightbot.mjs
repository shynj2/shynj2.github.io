// A bot plays the final fight and prints its state every few seconds.  node tools/fightbot.mjs [seconds] [weapon] [god] [vp] [shotPrefix]
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const secs = +(process.argv[2] || 40), wp = process.argv[3] || 'katana', god = process.argv[4] === '1', vp = (process.argv[5] || '844x390').split('x').map(Number), pre = process.argv[6] || '', startCp = +(process.argv[7] || 0);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: vp[0], height: vp[1] }, deviceScaleFactor: vp[0] > 1000 ? 1 : 2, hasTouch: vp[0] <= 1000, isMobile: vp[0] <= 1000 });
const page = await ctx.newPage();
const errs = [];
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', (e) => errs.push('pageerror: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n')));
await page.goto('file://' + path.join(ROOT, 'rune-architect.html'));
await page.waitForTimeout(400);
await page.evaluate(async ({ wp, god, startCp }) => {
  G.name = 'ARASH'; hudSync(); el('intro').classList.remove('on'); el('gate') && el('gate').classList.remove('on'); G.scene = 'world';
  await Art.need(ZONES.arena);
  ['katana', 'daggers', 'crusader', 'hammer', 'staff', 'gauntlets'].forEach((w) => Arsenal.grant(w, true));
  Arsenal.set(0, wp);
  loadZone('arena', 'left'); P.x = 260; G.fade = 0; G.fadeDir = 0;
  el('zonecard').classList.remove('on'); el('stage').classList.remove('titlecard'); clearTimeout(showZoneCard._t);
  window.__god = god; window.__log = [];
  if (startCp) { window.__cp = startCp; }
  window.__bot = setInterval(() => {
    try {
      if (window.__god && G.det < 5 && G.scene === 'boss') setDet(5, true);
      if (Dlg.on) { if (Dlg.choosing) { const c = document.querySelector('#dlg .choice, #dlg [data-choice], #dlg button'); if (c) c.click(); } else Dlg.advance(); return; }
      if (G.scene === 'attempt') { if (G.time - (G.attemptT || 0) > .8) bossResume(); return; }
      if (G.scene === 'world' && !window.__started) { window.__started = 1; startBossScene(); return; }
      if (G.scene !== 'boss') return;
      if (window.__cp && BOSS.state === 'idle' && BOSS.cp < window.__cp) { BOSS.hp = Math.round(BOSS.max * PHASE_AT[window.__cp]) + 1; window.__cp = 0; }
      const pcx = P.x + P.w / 2, dx = BOSS.x - pcx, reach = (WEAPONS[Arsenal.cur()].reach || 40);
      let danger = null;
      for (const h of BOSS.haz) { if (h.t < h.warn - .28) continue; if (pcx > h.x - 26 && pcx < h.x + (h.w || 0) + 26) { danger = h; break; } }
      Keys.left = Keys.right = false;
      if (danger && Combat.act !== 'dodge') { Combat.press('dodge'); Combat.release('dodge'); if (Math.random() < .3) { Keys.jumpEdge = true; } }
      else if (BOSS.hide || Math.abs(dx) > reach * .8) { if (dx > 0) Keys.right = true; else Keys.left = true; }
      else { P.face = Math.sign(dx) || 1; if (Math.random() < .12) { Combat.press('heavy'); Combat.release('heavy'); } else { Combat.press('attack'); Combat.release('attack'); } }
    } catch (e) { window.__log.push('bot: ' + e.message); }
  }, 60);
}, { wp, god, startCp });
let lastKey = '';
for (let i = 0; i < secs / 2; i++) {
  await page.waitForTimeout(2000);
  const s = await page.evaluate(() => ({ t: +G.time.toFixed(1), sc: G.scene, st: BOSS.state, atk: BOSS.atkId || (typeof Override !== 'undefined' && Override.id) || '', ph: BOSS.phase, cp: BOSS.cp, ov: BOSS.ov, hp: BOSS.hp, det: G.det, att: G.attempt, falls: G.flags.falls | 0, haz: BOSS.haz.length, px: P.x | 0, bx: BOSS.x | 0, act: Combat.act, stam: Combat.stam | 0, named: !!G.flags.named, mercy: !!G.flags.mercy, err: Perf.lastErr || '', errs: Perf.errs | 0, log: window.__log.splice(0), stage: el('stage').className, ms: (() => { const b = Array.from(Perf.buf).filter((x) => x > 0).sort((a, c) => a - c); return +(b[(b.length * .95) | 0] || 0).toFixed(1); })() }));
  const sig = [s.sc, s.st, s.ph, s.ov, s.att, s.err, s.stage].join('|'); if (sig !== globalThis.__sig || i % 4 === 0 || s.log.length) console.log(Object.entries(s).filter(([k, v]) => v !== '' && !(Array.isArray(v) && !v.length)).map(([k, v]) => k + '=' + (typeof v === 'object' ? JSON.stringify(v) : v)).join(' ')); globalThis.__sig = sig;
  const key = s.sc + '/' + (s.ov ? 'ov' : s.ph) + '/' + (s.stage.includes('glitching') ? 'g' : '');
  if (pre && key !== lastKey) { await page.screenshot({ path: pre + '_' + i + '.png' }); lastKey = key; }
  if (s.mercy) break;
}
if (errs.length) console.log('ERRORS:\n' + [...new Set(errs)].slice(0, 12).join('\n'));
await browser.close();
