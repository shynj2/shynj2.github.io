// WALK — plays the puzzle crossings with real key presses (not teleports): hold a direction, jump whenever on the ground.
//   node tools/walk.mjs        (build first)
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browser = await chromium.launch(), page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
const errs = []; page.on('pageerror', (e) => errs.push(e.message));
await page.goto('file://' + path.join(ROOT, 'rune-architect.html')); await page.waitForTimeout(400);
async function run(name, zone, flags, from, dir, goalCol, goalRow, sec = 9, hop = false) {
  await page.evaluate(async ({ zone, flags, from }) => {
    G.name = 'WALK'; el('intro').classList.remove('on'); G.scene = 'world'; for (const k of Object.keys(G.flags)) if (k.startsWith('pz_')) delete G.flags[k]; Object.assign(G.flags, flags);
    await Art.need(ZONES[zone]); loadZone(zone, 'left'); P.act = ''; P.x = from[0] * 16; P.y = from[1] * 16 - P.h; P.vy = 0; P.safeX = P.x; P.safeY = P.y; camSnap(); window._falls = 0; const f = Puzzle.fell; Puzzle.fell = function () { window._falls++; };
  }, { zone, flags, from });
  await page.waitForTimeout(300);
  const key = dir > 0 ? 'ArrowRight' : 'ArrowLeft'; await page.keyboard.down(key);
  let ok = false; const t0 = Date.now();
  while (Date.now() - t0 < sec * 1000) {
    const s = await page.evaluate((dir) => {
      const edge = dir > 0 ? P.x + P.w : P.x, r = Math.round((P.y + P.h) / 16), ahead = Math.floor((edge + dir * 3) / 16), c = World.at(ahead, r), wall = World.at(ahead, r - 1) === 1;
      return { c: (P.x + P.w / 2) / 16, r, g: P.onGround, falls: window._falls, jump: wall || !(c === 1 || c === 2 || c === 3) };       // jump at the lip of a gap or in front of a step
    }, dir);
    if ((dir > 0 ? s.c >= goalCol : s.c <= goalCol) && s.g && (goalRow == null || s.r === goalRow)) { ok = !s.falls; break; }
    if (s.g && (s.jump || hop)) { await page.keyboard.down('ArrowUp'); await page.waitForTimeout(480); await page.keyboard.up('ArrowUp'); } else await page.waitForTimeout(16);
  }
  await page.keyboard.up(key);
  const s = await page.evaluate(() => ({ c: +((P.x + P.w / 2) / 16).toFixed(1), r: Math.round((P.y + P.h) / 16), falls: window._falls }));
  console.log((ok ? '  ok  ' : ' FAIL ') + name, JSON.stringify(s));
  return ok;
}
let all = true;
all &= await run('forest: stream bed (4 tiles) by jumping', 'forest', {}, [50, 29], 1, 58, 29);
all &= await run('forest: ground -> first branch (2 tiles up)', 'forest', {}, [57, 29], 1, 59.5, 27, 4, true);
all &= await run('cathedral: floor -> first gallery step (2 tiles up)', 'cathedral', {}, [126, 33], 1, 128.5, 31, 4, true);
all &= await run('forest: woken bridge across the ravine', 'forest', { pz_forest: true }, [147, 29], 1, 163, 29);
all &= await run('cathedral: woken bridge across the broken floor', 'cathedral', { pz_cath_a: true, pz_cath_b: true }, [157, 33], 1, 175, 33);
all &= await run('machine halls: conduit trench', 'catacombs', {}, [45, 27], 1, 53, 27);
all &= await run('machine halls: woken bridge', 'catacombs', { pz_machine: true }, [153, 27], 1, 169, 27);
all &= await run('repository: branch "main" to the island', 'repository', {}, [131, 29], 1, 148.5, 29);
all &= await run('repository: branch "dev" from the island', 'repository', { pz_repo: true }, [150, 29], 1, 167, 29);
all &= await run('repository: back to the island from the far side', 'repository', { pz_repo: true }, [168, 29], -1, 152, 29);
console.log(all ? 'all crossings walked' : 'SOME CROSSINGS FAILED', errs.slice(0, 3).join(' | '));
await browser.close();
