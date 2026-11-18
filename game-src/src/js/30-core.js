/* ==========================================================================
   CORE — view, state, physics numbers, save, HUD. (State/save/HUD are migrated
   1:1 from the previous build; only the pixel scale changed: 12 px -> 16 px tiles.)
   ========================================================================== */
const TILE = 16, VH = 360, VW_MAX = 864, VW_MIN = 320;
let VW = 640;                                  // logical width: 640, or the phone's width in portrait
const cv = el('cv');
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;

/* ---------------- state ---------------- */
const G = {
  scene: 'boot',        // boot | intro | world | dialog | boss | attempt | codex | pause | ending
  prevScene: 'world',
  name: 'ARASH',
  score: 0,
  det: 5,
  attempt: 0,
  notes: {},            // inscription ids read
  flags: {},            // mercy, bossSeen, goblinDone, gateSeen, repoSeen
  ach: {},
  zone: 'workshop',
  time: 0,
  camX: 0, camY: 0,
  shake: 0,
  flash: 0,
  flashColor: 'rgba(200,160,255,',
  fade: 1,              // 0 = clear, 1 = black
  fadeDir: 0,
  fadeCb: null,
  paused: false
};

/* The Recruiter. x,y = top-left of the collision box (14 x 36); the sprite is drawn from the feet. */
const P = {
  x: 80, y: 200, vx: 0, vy: 0,
  w: 14, h: 36,
  face: 1, onGround: false, air: 0,
  coyote: 0, buffer: 0, visible: true,
  safeX: 80, safeY: 200,
  hurt: 0, landT: 0, hard: false, idleT: 0, act: '', anim: null
};

/* Old numbers were px at 12 px/tile. Speeds scale by 4/3 so tiles-per-second feel is unchanged;
   the jump is re-derived for the brief's limits: 3.0 tiles high, ~5 tiles far (with coyote time). */
const PHYS = {
  run: 155, accel: 2000, fric: 2667,
  grav: 2000, jump: 440, jumpCut: 173, maxFall: 747,
  coyote: 0.09, buffer: 0.12, step: 16
};

/* ---------------- save ---------------- */
function save() {
  if (typeof LANG !== 'undefined') G.flags.lang = LANG;          // the language choice travels inside the save (no new field)
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      name: G.name, notes: G.notes, flags: G.flags, ach: G.ach,
      score: G.score, zone: G.zone, det: G.det, attempt: G.attempt
    }));
  } catch (e) {}
}
function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    G.name = d.name || G.name;
    G.notes = d.notes || {};
    G.flags = d.flags || {};
    G.ach = d.ach || {};
    G.score = Math.max(0, Number(d.score) || 0);
    G.zone = d.zone || 'workshop';
    G.det = d.det == null ? 5 : d.det;
    G.attempt = d.attempt || 0;
    if (G.flags.mercy && G.flags.named == null) G.flags.named = true;      // a save from before Round 9 that had finished the Throne: the name is already earned
    G.hasGame = true;
    return true;
  } catch (e) { return false; }
}
function forgetMe() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  location.reload();
}

/* ---------------- HUD ---------------- */
function objective() {
  if (G.zone === 'dojo') return tr('zone.dojo.obj');
  if (G.flags.mercy && G.zone !== 'room499') return tr('zone.throne.obj.after');
  if (G.zone === 'arena') return tr('zone.throne.obj.fight');
  if (G.zone === 'repository') return tr('zone.repository.obj');
  if (G.zone === 'room499') return tr(G.flags.coinTaken ? 'zone.chamber.obj.zero' : G.flags.coinOut ? 'zone.chamber.obj.coin' : 'zone.chamber.obj');
  if (G.zone === 'forest' && !G.flags.pz_forest) return tr('zone.forest.obj');          // until the rune in the great tree is awake
  return tr('zone.workshop.obj');
}
function hudSync() {
  el('hudName').textContent = G.name;
  el('hudScore').textContent = G.score + ' / 500';
  // the promise: 500,000 Toman off his first salary, but only at 500 points. Nothing below that. (After the goblin's coin: nothing at all.)
  const hc = el('hudCutN'); if (hc) hc.textContent = G.flags.coinTaken ? '−0' : '−500,000';
  const o = el('hudObj');
  o.textContent = objective();
  o.classList.toggle('warn', G.zone === 'arena' && !G.flags.mercy);
  const d = el('hudDet');
  const maxDet = (typeof Roster !== 'undefined') ? Roster.hp() : 5;
  if (d.children.length !== maxDet) {
    d.innerHTML = '';
    for (let i = 0; i < maxDet; i++) d.appendChild(document.createElement('i'));
  }
  [...d.children].forEach((n, i) => {
    n.textContent = '◆';
    n.classList.toggle('lost', i >= G.det);
  });
  if (typeof Tag !== 'undefined') Tag.set(G.name);
}
function addScore(n) { G.score += n; hudSync(); }
function setDet(n, silent) {
  const old = G.det;
  G.det = clamp(n, 0, (typeof Roster !== 'undefined') ? Roster.hp() : 5);
  hudSync();
  const kids = el('hudDet').children;
  if (!silent && kids.length && old > G.det) {
    const k = kids[G.det];
    if (k) { k.classList.add('hit'); setTimeout(() => k.classList.remove('hit'), 520); }
  }
}

let toastTimer = null;
function toast(icon, title, sub, ms) {            // title and sub: ids in STR (plain text also works)
  const t = el('toast');
  toast.last = [title, sub];
  t.querySelector('.ic').textContent = icon;
  t.querySelector('.t').textContent = tr(title);
  t.querySelector('.s').textContent = sub ? tr(sub) : '';
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), ms || 4800);
}
function unlock(id) {
  if (G.ach[id]) return;
  G.ach[id] = true; save(); Sound.ach();
  const a = ACHIEVEMENTS[id];
  if (a) toast(a.icon, a.title, a.sub, 4800);
}
function checkNoteAchievements() {
  const n = Object.keys(G.notes).length;
  if (n >= 5) unlock('reader');
  if (n >= TOTAL_NOTES) unlock('whispers');
}

/* ---------------- prompt ---------------- */
let promptFor = null;
function showPrompt(text) {
  const p = el('prompt');
  if (!text) { p.classList.remove('on'); promptFor = null; return; }
  if (promptFor === text) { p.classList.add('on'); return; }
  promptFor = text;
  el('promptTxt').textContent = text;
  p.classList.add('on');
}
document.addEventListener('langchange', () => {             // what is on screen changes language at once
  promptFor = null;
  if (toast.last) { el('toast').querySelector('.t').textContent = tr(toast.last[0]); el('toast').querySelector('.s').textContent = toast.last[1] ? tr(toast.last[1]) : ''; }
});
function refreshPromptKey() {
  el('prompt').querySelector('kbd').textContent = Touch.on ? '✦' : 'E';
}
