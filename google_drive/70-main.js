/* ==========================================================================
   INPUT · PHYSICS · CAMERA · LOOP · LAYOUT · BOOT
   Input is migrated 1:1. Physics keeps the old feel (same accelerations in tiles/s)
   but collides with the tile map instead of ground strips.
   ========================================================================== */
const Keys = { left: false, right: false, jump: false, jumpEdge: false };
const Touch = { on: false };

function action() {
  if (G.scene === 'world') doInteract();
  else if (G.scene === 'dialog') Dlg.advance();
  else if (G.scene === 'boss') { if (Dlg.on) Dlg.advance(); else bossStrike(); }   // legacy bug fixed: E / the action button did nothing while Shyn was speaking
  else if (G.scene === 'attempt') bossResume();
  else if (G.scene === 'coin') Goblin.wake();
  else if (G.scene === 'smite') Ward.rise();
  else if (G.scene === 'pause') { if (Credits.isOpen()) Credits.close(); else if (Arsenal.isOpen()) Arsenal.close(); else closePause(); }
  else if (G.scene === 'codex') closeCodex();
  else if (G.scene === 'intro') showNameForm();
}

/* ---------------- input ---------------- */
/* letters are read by their physical key, so W A S D · E · M work on any keyboard layout (Persian, Russian, …) */
const CODE_KEY = { KeyW: 'w', KeyA: 'a', KeyS: 's', KeyD: 'd', KeyE: 'e', KeyM: 'm' };
const keyOf = (e) => CODE_KEY[e.code] || (e.key || '').toLowerCase();
document.addEventListener('keydown', (e) => {
  const tag = (e.target && e.target.tagName) || '';
  const k = keyOf(e);
  if (tag === 'INPUT' || tag === 'TEXTAREA') {
    if (k === 'escape') e.target.blur();
    return;
  }
  Sound.resume();
  dismissHint();
  if (G.scene === 'codex') {                  // the book: W S / ↑ ↓ scroll the page, A D / ← → turn the chapter
    const pg = el('codexPage'), up = k === 'w' || k === 'arrowup', down = k === 's' || k === 'arrowdown';
    if (up || down) { pg.scrollTop += (down ? 1 : -1) * Math.max(60, pg.clientHeight * .4); e.preventDefault(); return; }
    if (k === 'a' || k === 'arrowleft') { codexStep(-1); e.preventDefault(); return; }
    if (k === 'd' || k === 'arrowright') { codexStep(1); e.preventDefault(); return; }
  }
  if (k === 'arrowleft' || k === 'a') { Keys.left = true; e.preventDefault(); }
  if (k === 'arrowright' || k === 'd') { Keys.right = true; e.preventDefault(); }
  if (k === 'arrowup' || k === 'w' || k === ' ') {
    if (!Keys.jump) Keys.jumpEdge = true;
    Keys.jump = true; e.preventDefault();
  }
  if (k === 'arrowdown' || k === 's') e.preventDefault();
  if (k === 'e' || k === 'enter') { e.preventDefault(); action(); }
  if (k === ' ' && Dlg.on) { e.preventDefault(); Dlg.advance(); }
  if (k === 'escape') {
    if (G.scene === 'codex') closeCodex();
    else if (G.scene === 'pause') closePause();
    else if (G.scene === 'world' || G.scene === 'dialog' || G.scene === 'boss') { if (!Dlg.on) openPause(); }
    else if (G.scene === 'intro') { /* let the ritual run */ }
  }
  if (k === 'm') { el('mute').click(); }
  if (k === 'tab' && (G.scene === 'world' || G.scene === 'pause')) {
    e.preventDefault(); openCodex('architect');
  }
});
document.addEventListener('keyup', (e) => {
  const k = keyOf(e);
  if (k === 'arrowleft' || k === 'a') Keys.left = false;
  if (k === 'arrowright' || k === 'd') Keys.right = false;
  if (k === 'arrowup' || k === 'w' || k === ' ') Keys.jump = false;
});
cv.addEventListener('pointerdown', (e) => {
  Sound.resume();
  if (Touch.on) { if (Dlg.on && !Dlg.choosing) Dlg.advance(); return; }      // phones: a tap on the picture turns the page of a dialogue (the thumb buttons are hidden while Shyn speaks)
  if (G.scene === 'world' || G.scene === 'dialog' || G.scene === 'attempt') action();
});
el('dlg').addEventListener('pointerdown', () => { if (!Dlg.choosing) Dlg.advance(); });
/* the Attempt screen covers everything, the thumb buttons included, so the screen itself is the button
   (on phones nothing answered here and the game looked frozen after the first defeat) */
el('attempt').addEventListener('pointerdown', (e) => { e.preventDefault(); Sound.resume(); if (G.time - (G.attemptT || 0) > .7) bossResume(); });
el('menuBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  if (G.scene === 'pause') closePause();
  else if (G.scene === 'codex') closeCodex();
  else if (G.scene === 'world' || G.scene === 'dialog' || G.scene === 'boss') { if (!Dlg.on) openPause(); }
});
el('mute').addEventListener('click', (e) => {
  e.stopPropagation();
  const m = Sound.toggle();
  el('mute').textContent = m ? '♪̸' : '♪';
  el('mute').style.opacity = m ? '.28' : '.42';
});

function dismissHint() {
  if (!G.hintGone) {
    G.hintGone = true;
    const t = el('toast');
    if (t.classList.contains('on')) t.classList.remove('on');
  }
}
document.querySelectorAll('#touch .dpad button').forEach((b) => {
  const dir = b.dataset.dir;
  const on = (e) => { e.preventDefault(); dismissHint(); Keys[dir] = true; };
  const off = (e) => { e.preventDefault(); Keys[dir] = false; };
  b.addEventListener('pointerdown', on);
  b.addEventListener('pointerup', off);
  b.addEventListener('pointercancel', off);
  b.addEventListener('pointerleave', off);
});
document.querySelectorAll('#touch .right button').forEach((b) => {
  b.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (b.dataset.act === 'jump') {
      if (!Keys.jump) Keys.jumpEdge = true;
      Keys.jump = true;
      setTimeout(() => { Keys.jump = false; }, 140);
    } else action();
  });
});

/* ---------------- player physics (tile map) ---------------- */
function boxFree(x, y, w, h) {
  const x0 = Math.floor(x / TILE), x1 = Math.floor((x + w - .01) / TILE), y0 = Math.floor(y / TILE), y1 = Math.floor((y + h - .01) / TILE);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (World.solid(tx, ty)) return false;
  return true;
}
function updatePlayer(dt) {
  const z = World.z;
  if (!z || !World.m) return;
  const dir = Combat.dir();                           // the keys; nothing while an attack, a guard or a dodge holds the feet (67-combat.js)
  if (dir) P.face = dir;
  const isMeiko = Special.kind() === 'meiko';
  const target = dir * PHYS.run;
  const acc = (P.onGround ? PHYS.accel : PHYS.accel * (isMeiko ? .88 : .62)) * dt;
  if (dir) P.vx += clamp(target - P.vx, -acc, acc);
  else {
    const f = (P.onGround || !isMeiko ? PHYS.fric : PHYS.fric * .72) * dt;
    P.vx = Math.abs(P.vx) <= f ? 0 : P.vx - Math.sign(P.vx) * f;
  }

  // horizontal: walls stop, a single-tile lip is stepped over (as before: step <= one tile, not while rising)
  P.x += P.vx * dt;
  if (!boxFree(P.x, P.y, P.w, P.h - .6)) {
    const feetRow = Math.floor((P.y + P.h - .01) / TILE), stepY = feetRow * TILE - P.h;
    if (P.vy >= 0 && P.y + P.h - feetRow * TILE <= PHYS.step && boxFree(P.x, stepY, P.w, P.h)) P.y = stepY;
    else {
      if (P.vx > 0) P.x = Math.floor((P.x + P.w) / TILE) * TILE - P.w;
      else if (P.vx < 0) P.x = (Math.floor(P.x / TILE) + 1) * TILE;
      P.vx = 0;
    }
  }
  P.x = clamp(P.x, 0, World.W - P.w);

  // vertical: Meiko flies with smooth buoyant wing-lift and feather-light glide instead of harsh jump-gravity snaps
  if (isMeiko && Keys.jump) {
    if (P.onGround) {
      P.vy = -126; P.onGround = false; P.coyote = 0; P.buffer = 0; P.landT = 0;
      Special.stepMote(P.x + P.w / 2 - 6, P.y + P.h - 2);
      Special.stepMote(P.x + P.w / 2 + 6, P.y + P.h - 2);
    } else {
      P.vy += (-154 - P.vy) * Math.min(1, 7.6 * dt);
      P._flyMoteT = (P._flyMoteT || 0) - dt;
      if (P._flyMoteT <= 0) { P._flyMoteT = .22; Special.stepMote(P.x + P.w / 2 - P.face * 7, P.y + P.h - 8); }
    }
  } else if (isMeiko) {
    P.vy = Math.min(68, P.vy + PHYS.grav * .26 * dt);
  } else {
    P.vy = Math.min(P.vy + PHYS.grav * dt, PHYS.maxFall);
  }
  const prevFeet = P.y + P.h, wasGround = P.onGround, fallV = P.vy;
  P.y += P.vy * dt;
  P.onGround = false;
  const c0 = Math.floor((P.x + .5) / TILE), c1 = Math.floor((P.x + P.w - .5) / TILE);
  if (P.vy >= 0) {
    const r0 = Math.floor(prevFeet / TILE), r1 = Math.floor((P.y + P.h) / TILE);
    scan: for (let ty = r0; ty <= r1; ty++) for (let tx = c0; tx <= c1; tx++) {
      const c = World.at(tx, ty), top = ty * TILE;
      if ((c === T_SOLID && prevFeet <= top + 2) || ((c === T_PLAT || c === T_PLAT_OPEN) && prevFeet <= top + 1)) {
        if (P.y + P.h >= top) { P.y = top - P.h; P.vy = 0; P.onGround = true; break scan; }
      }
    }
  } else {
    const ty = Math.floor(P.y / TILE);
    for (let tx = c0; tx <= c1; tx++) if (World.solid(tx, ty)) { P.y = (ty + 1) * TILE; P.vy = 0; break; }   // head meets stone
  }
  if (P.onGround && !wasGround) {                       // landing: weight
    P.hard = !isMeiko && fallV > 560; P.landT = isMeiko ? .14 : (P.hard ? .42 : .2);
    if (isMeiko) { Special.stepMote(P.x + P.w / 2 - 4, P.y + P.h); Special.stepMote(P.x + P.w / 2 + 4, P.y + P.h); }
    else fxSprite(P.hard ? 'fx_land' : 'fx_dust', P.x + P.w / 2, P.y + P.h + 1, 16, 1);
    if (P.hard) { G.shake = Math.max(G.shake, 3); }
    if (!isMeiko) Sound.land();
  }
  if (P.onGround) P.coyote = PHYS.coyote;
  else P.coyote -= dt;

  if (Keys.jumpEdge) { P.buffer = PHYS.buffer; Keys.jumpEdge = false; }
  P.buffer -= dt;
  if (!isMeiko && P.buffer > 0 && P.coyote > 0) {
    P.vy = -PHYS.jump; P.onGround = false; P.coyote = 0; P.buffer = 0; P.landT = 0;
    Sound.jump();
    fxSprite('fx_jump', P.x + P.w / 2, P.y + P.h + 1, 16, 1);
  }
  if (!isMeiko && !Keys.jump && P.vy < -PHYS.jumpCut) P.vy = -PHYS.jumpCut;

  if (P.onGround) { P.safeX = P.x; P.safeY = P.y; }
  // the void beneath Veyrath
  if (P.y > World.H + 60) {
    P.x = P.safeX; P.y = P.safeY; P.vx = 0; P.vy = 0;
    G.shake = 4; P.hurt = .25; Sound.hit(); Puzzle.fell(); countDeath();
    burst(P.x + P.w / 2, P.y + 16, 'rgba(150,120,200,', 10, 60);
  }
}

/* ---------------- which clip the Recruiter plays ---------------- */
function playerAnim(dt) {
  Knight.apply();
  const a = P.anim; if (!a || !Art.rigs[a.rigName]) return;
  const inWorld = G.scene === 'world' || G.scene === 'boss';
  const dir = (Keys.right ? 1 : 0) - (Keys.left ? 1 : 0), moving = Math.abs(P.vx) > 20;
  if (P.landT > 0) P.landT -= dt;
  let want;
  if (P.act === 'materialize') { if (a.name === 'materialize' && a.done) P.act = ''; want = 'materialize'; }
  if (P.act !== 'materialize') {
    if (P.hurt > 0) want = 'hurt';
    else if (G.meikoMeeting && (!Dlg.on || Dlg.li >= 1)) want = 'interact';
    else if (Dlg.on) want = P.act === 'read' ? 'read' : 'listen';
    else if (!inWorld) want = 'idle';
    else if (!P.onGround) want = Special.kind() === 'meiko' ? ((Keys.jump || P.vy < 18) ? 'fly' : 'glide') : (P.vy < -90 ? 'jump_up' : P.vy < 110 ? 'jump_apex' : 'fall');
    else if (P.landT > 0 && (P.hard || !moving)) want = P.hard ? 'land_hard' : 'land';
    else if (moving && dir) want = (a.name === 'run_start' && !a.done) ? 'run_start' : (a.name === 'idle' || a.name === 'idle_look' || a.name === 'run_stop' || a.name === 'listen' || a.name === 'read') ? 'run_start' : 'run';
    else if (moving) want = 'run_stop';
    else {
      P.idleT += dt;
      if (a.name === 'idle_look') { want = a.done ? 'idle' : 'idle_look'; if (a.done) P.idleT = 0; }
      else want = P.idleT > 6 ? 'idle_look' : 'idle';
    }
    if (want !== 'idle' && want !== 'idle_look') P.idleT = 0;
    if (want === 'run_stop' && a.name === 'run_stop' && a.done) want = 'idle';
  }
  if ((G.scene === 'boss' || G.scene === 'world') && P.hurt <= 0 && P.act !== 'materialize' && Combat.pose(a)) return;      // attacks, guard and dodge set the frame themselves
  animPlay(a, want);
  if (want === 'interact' && G.meikoMeeting) { a.i = 1; a.f = a.clip ? a.clip.f[1][0] : a.f; return; }
  const ev = animTick(a, dt);
  if (ev === 'step' && inWorld) {
    Sound.step();
    if (Special.kind() === 'meiko') Special.stepMote(P.x + P.w / 2 - P.face * 5, P.y + P.h - 1);
    else fxSprite('fx_dust', P.x + P.w / 2 - P.face * 6, P.y + P.h + 1, 18, 1);
  }
}

/* ---------------- camera ---------------- */
function camTargetX() {
  const z = World.z, maxX = World.W - VW;
  if (maxX <= 0 || (z.lockCam && maxX <= 64)) return maxX / 2;
  return clamp(P.x + P.w / 2 - VW / 2 + P.face * 27, 0, maxX);
}
function camTargetY() { const maxY = World.H - VH; return maxY <= 0 ? maxY / 2 : clamp(P.y + P.h - VH * .72, 0, maxY); }
function camSnap() { G.camX = camTargetX(); G.camY = camTargetY(); }
function updateCamera(dt) {
  if (!World.z) return;
  G.camX = lerp(G.camX, camTargetX(), 1 - Math.pow(.0008, dt));
  G.camY = lerp(G.camY, camTargetY(), 1 - Math.pow(.006, dt));
}

/* ---------------- update ---------------- */
function update(dt) {
  Pad.poll();
  if (Combat.stop > 0) { Combat.stop -= dt; return; }      // hit-stop: the picture holds for a few frames when a blow lands
  G.time += dt;
  if (G.fadeDir === 1) {
    G.fade = Math.min(1, G.fade + dt / .40);
    if (G.fade >= 1) {
      G.fadeDir = -1;
      const cb = G.fadeCb; G.fadeCb = null;
      if (cb) cb();
    }
  } else if (G.fadeDir === -1) {
    G.fade = Math.max(0, G.fade - dt / .48);
    if (G.fade <= 0) G.fadeDir = 0;
  }
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 26);
  if (G.flash > 0) G.flash = Math.max(0, G.flash - dt * 2.2);
  if (P.hurt > 0) P.hurt = Math.max(0, P.hurt - dt);

  const z = World.z;
  if (G.scene === 'world' || G.scene === 'boss') {
    Combat.update(dt);
    Dojo.update(dt);
    updatePlayer(dt);
    updateCamera(dt);
    if (z) ambientFX(z, dt);
  }
  if (z) {
    playerAnim(dt);
    const ps = z.props;
    for (let i = 0; i < ps.length; i++) if (ps[i].anim) npcAnim(ps[i], dt);
  }
  if (G.scene === 'boss') { Fight.update(dt); Ally.update(dt); showPrompt(null); }
  Ward.tick(dt);
  Override.tick(dt);
  if (G.scene === 'world') updateInteraction();
  else if (G.scene !== 'boss') showPrompt(null);
  updateFX(dt);
  Dlg.update(dt);
  Sign.update();
  Goblin.update(dt);
}
/** NPC clips: idle, 'gesture' while they are the one speaking */
function npcAnim(p, dt) {
  if (Special.npcAnim(p, dt)) return;
  const a = p.anim, speaking = Dlg.on && G._near && G._near.p === p;
  if (p.work && a.rig && a.rig.def.clips.read) { if (a.name !== 'read') animPlay(a, 'read', true); }      // RE-sync at the editor
  else if (speaking && a.rig && a.rig.def.clips.gesture) { if (a.name !== 'gesture' || a.done) animPlay(a, 'gesture', true); }
  else if (a.name !== 'idle' && (a.done || !speaking)) animPlay(a, 'idle');
  animTick(a, dt);
}

const Perf = { n: 0, sum: 0, max: 0, buf: new Float32Array(600), i: 0 };   // read by tools/verify.mjs
let lastTs = 0;
function loop(ts) {
  const t = ts / 1000;
  let dt = lastTs ? Math.min(.05, t - lastTs) : .016;
  lastTs = t;
  const t0 = performance.now();
  // one bad frame must never freeze the game: report it (once per message) and keep going
  try { update(dt); render(); }
  catch (e) { Perf.errs = (Perf.errs || 0) + 1; if (Perf.lastErr !== e.message) { Perf.lastErr = e.message; console.error('frame error:', e); } }
  const ms = performance.now() - t0; Perf.buf[Perf.i++ % 600] = ms; Perf.n++;
  requestAnimationFrame(loop);
}

/* ---------------- layout: integer scale, mobile first ----------------
   One logical pixel is always a whole number of device pixels. Height is always 360;
   width is 640, or the phone's own width in portrait (the camera simply sees less). */
function resize() {
  const dpr = window.devicePixelRatio || 1, W = window.innerWidth, H = window.innerHeight;
  const portrait = H > W * 1.15;
  const kx = Math.min(H * dpr / VH, W * dpr / VW_MIN);
  let k = Math.max(1, Math.floor(kx + .001));
  // A phone held sideways: whole-number scaling can leave the picture at two thirds of the screen
  // (411 px tall at 2.625x is a hair short of 3x, so it fell back to 2x). There the picture fills the
  // height instead; the screen is dense enough that the slightly uneven pixel is not seen.
  if (Touch.on && !portrait && k / kx < .9) k = kx;
  const vw = clamp(Math.floor(W * dpr / k), VW_MIN, VW_MAX);
  if (vw !== VW || !View.L) { VW = vw; viewBuild(); if (World.z) camSnap(); }
  const cw = VW * k / dpr, chh = VH * k / dpr, st = el('stage');
  cv.style.width = cw + 'px'; cv.style.height = chh + 'px';
  st.classList.toggle('tall', portrait);
  st.classList.toggle('compact', portrait);
  if (portrait) { st.style.width = W + 'px'; st.style.height = H + 'px'; }
  else { st.style.width = cw + 'px'; st.style.height = chh + 'px'; }
  st.style.setProperty('--gh', chh + 'px');
  st.style.fontSize = clamp(10 * (portrait ? W / 480 * 1.75 : cw / 480), 9, 30) + 'px';
  const hp = el('hintPortrait');
  if (hp) hp.classList.remove('on');
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 220));

/* ---------------- boot ---------------- */
function boot() {
  G._near = null;
  P.anim = Anim('recruiter');
  hudSync();
  setLang(LANG);
  Touch.on = (window.matchMedia && window.matchMedia('(pointer:coarse)').matches) ||
    ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  if (Touch.on) { el('touch').classList.add('on'); el('stage').classList.add('touching'); }
  resize();
  refreshPromptKey();

  el('nameform').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = (el('pn').value || '').trim();
    G.name = (v || 'ARASH').toUpperCase().slice(0, 14);
    hudSync();
    enterWorld(false);
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('#pause .btn');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'continue') closePause();
    else if (act === 'codex') openCodex('architect');
    else if (act === 'ach') openCodex('__ach');
    else if (act === 'leave') showEnding();
  });
  el('codexClose').onclick = closeCodex;

  const saved = loadSave();
  if (saved && LANGS.includes(G.flags.lang) && G.flags.lang !== LANG) setLang(G.flags.lang);      // the save remembers the language
  Sound.mute(false);
  if (saved) runIntro(true);
  else runIntro(false);

  document.addEventListener('pointerdown', () => Sound.resume(), { once: true });
  // the workshop decodes behind the intro, so the first frame of the world is ready
  Art.need(ZONES.workshop).then(() => { if (!World.z) { World.load(ZONES.workshop); const s = spawnPoint(ZONES.workshop, 'left'); P.x = s[0] - P.w / 2; P.y = s[1] - P.h; camSnap(); animPlay(P.anim, 'idle'); hudSync(); } });
  requestAnimationFrame(loop);
}
if (!window.__LEGACY__) boot();
