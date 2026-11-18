/* ==========================================================================
   GAME — dialogue, journey, the Throne, the mercy.
   Migrated 1:1 from the previous build. Only pixel distances were rescaled (x 4/3)
   and zone loading now goes through World.load / Art.need.
   ========================================================================== */

/* ---------------- dialogue ---------------- */
const Dlg = {
  on: false, blocks: [], bi: 0, lines: [], li: 0,
  chars: 0, typing: false, done: null, choosing: false,
  auto: 0, cls: '', prevScene: 'world', blip: 0,

  open(blocks, done) {
    if (!Array.isArray(blocks)) blocks = [blocks];
    if (Special.kind()==='meiko' && !blocks.some(b=>b && b.lines && b.lines.includes('meiko.keeper.1'))) blocks = Special.dialogue(blocks);
    this.blocks = blocks.filter(Boolean);
    this.bi = 0; this.li = 0; this.done = done || null; this.choosing = false;
    this.prevScene = (G.scene === 'boss') ? 'boss' : 'world';
    this.shown = -1; this._choicesShown = false;
    if (G.scene !== 'boss') G.scene = 'dialog';
    this.on = true;
    el('dlg').classList.add('on');
    el('stage').classList.add('dim');
    el('dlgChoices').innerHTML = '';
    this.showBlock();
  },
  showBlock() {
    const b = this.blocks[this.bi];
    this.cls = b.cls || 'npc';
    this.lines = b.lines || [''];
    this.stills = b.stills || null;                 // { lineIndex: 'key' }: a life-stage picture behind that line (57-stills.js)
    this.li = 0;
    el('dlg').className = 'on' + (this.cls === 'shyn' || this.cls === 'architect' ? ' shynblock' : '') +
      (this.cls === 'silence' ? ' silence' : '');
    el('dlg').classList.add('on');
    const who = el('dlgWho');
    who.className = 'who ' + this.cls + (b.who === 'who.resync' ? ' asis' : '');      // RE-sync keeps his own capitals
    who.textContent = b.who ? tr(b.who) : '';
    // portrait
    const kind = portraitFor(b.who, this.cls);
    const pc = el('dlgPor'), pcx = pc.getContext('2d');
    pcx.clearRect(0, 0, 46, 46);
    const img = getPortrait(kind);
    if (img) { pcx.drawImage(img, 0, 0); pc.classList.add('on'); }
    else pc.classList.remove('on');
    if (this.cls === 'silence') {
      el('dlgTxt').textContent = '';
      el('dlgNext').classList.remove('on');
      this.typing = false;
      this.auto = 1.9;
      Sound.wind(0.5);
      return;
    }
    this.showLine();
  },
  showLine() {
    const line = this.lines[this.li] == null ? '' : this.lines[this.li];
    if (line === 'goblin_intro.2' && G.zone === 'room499') Goblin.count();
    if (this.stills && this.stills[this.li]) Stills.show(this.stills[this.li], el('stage')); else if (Stills.shown()) Stills.hide();
    this.full = Array.isArray(line) ? tr(line[0], ...line.slice(1)) : tr(line);      // a line may be [id, fill…] (the knight's name)
    this.steps = typeSteps(this.full);       // where the typewriter may stop (see 61-i18n.js)
    this.chars = 0;
    this.shown = -1;
    this.typing = true;
    this.blip = 0;
    el('dlgTxt').textContent = '';
    el('dlgNext').classList.remove('on');
    Sound.talk(this.cls);
  },
  update(dt) {
    if (!this.on) return;
    if (this.cls === 'silence') {
      this.auto -= dt;
      if (this.auto <= 0) this.next();
      return;
    }
    if (!this.typing) return;
    const speed = (this.cls === 'shyn' ? 30 : 44) * (LANG === 'ja' ? .55 : 1);   // Japanese says as much in half the characters
    this.chars += speed * dt;
    const n = Math.min(Math.floor(this.chars), this.steps.length);
    if (n !== this.shown) {
      this.shown = n;
      el('dlgTxt').textContent = this.full.slice(0, n ? this.steps[n - 1] : 0);
      if (n % 3 === 0) Sound.talk(this.cls);
    }
    if (this.chars >= this.steps.length) {
      el('dlgTxt').textContent = this.full;
      this.typing = false;
      el('dlgNext').classList.add('on');
      this.shown = -1;
    }
  },
  advance() {
    if (!this.on || this.choosing) return;
    if (this.cls === 'silence') { this.next(); return; }
    if (this.typing) {
      this.typing = false;
      el('dlgTxt').textContent = this.full;
      el('dlgNext').classList.add('on');
      return;
    }
    this.next();
  },
  next() {
    this.li++;
    if (this.li < this.lines.length) { this.showLine(); return; }
    const block = this.blocks[this.bi];
    if (block && block.choices && !this._choicesShown) {
      this._choicesShown = true;
      this.showChoices(block);
      return;
    }
    this.bi++;
    if (this.bi < this.blocks.length) { this.showBlock(); return; }
    this.close();
  },
  showChoices(block) {
    this.choosing = true;
    el('dlgNext').classList.remove('on');
    const box = el('dlgChoices');
    box.innerHTML = '';
    block.choices.forEach((label, i) => {
      const b = document.createElement('button');
      b.className = 'choice';
      b.textContent = Array.isArray(label) ? tr(label[0], ...label.slice(1)) : tr(label);      // a choice may be [id, fill…]
      b.onclick = (e) => {
        e.stopPropagation();
        box.innerHTML = '';
        this.choosing = false;
        Sound.open();
        const cb = block.onChoose;
        this.close();
        if (cb) cb(i);
      };
      box.appendChild(b);
    });
  },
  /* the language changed while a line is on screen: show the same line, complete, in the new language */
  relang() {
    if (!this.on) return;
    const b = this.blocks[this.bi];
    el('dlgWho').textContent = b && b.who ? tr(b.who) : '';
    if (this.cls !== 'silence') {
      { const ln = this.lines[this.li] == null ? '' : this.lines[this.li]; this.full = Array.isArray(ln) ? tr(ln[0], ...ln.slice(1)) : tr(ln); } this.steps = typeSteps(this.full);
      this.typing = false; el('dlgTxt').textContent = this.full;
      if (!this.choosing) el('dlgNext').classList.add('on');
    }
    if (this.choosing && b && b.choices) [...el('dlgChoices').children].forEach((n, i) => { n.textContent = tr(b.choices[i]); });
  },
  close() {
    this.on = false;
    Stills.hide();
    el('dlg').classList.remove('on');
    el('stage').classList.remove('dim');
    el('dlgChoices').innerHTML = '';
    const d = this.done;
    this.done = null;
    if (G.scene === 'dialog') G.scene = this.prevScene || 'world';
    if (d) d();
  }
};

/* ---------------- interaction ---------------- */
function nearest() {
  const z = ZONES[G.zone];
  if (!z) return null;
  // Shyn on the throne after the mercy
  if (G.zone === 'arena' && G.flags.mercy && !BOSS.active) {
    if (Math.abs(P.x + P.w / 2 - BOSS.x) < 61) {
      return { kind: 'shyn', label: 'ui.speak_with_the_architect' };
    }
  }
  if (G.zone === 'arena' && !G.flags.mercy && !BOSS.active &&
      Math.abs(P.x + P.w / 2 - BOSS.x) < 64) {
    return { kind: 'challenge', label: 'ui.challenge_the_rune_architect' };
  }
  let best = null, bd = 1e9;
  (z.props || []).forEach((p) => {
    if (!p.t) return;
    if (!(p.t === 'note' || p.t === 'npc' || p.t === 'door' || p.t === 'gate' || p.t === 'switch')) return;
    if (p.flag && !G.flags[p.flag]) return;                              // not there yet (RE-sync before the first defeat)
    if (p.id === 'resync' && (G.flags.resyncGone || Resync.leaving)) return;      // he has gone back to the code: only the flower is left
    if (p.t === 'switch' && !p.toggle && Puzzle.lit(p)) return;        // a woken rune has nothing more to say
    const py = p.py;                                  // resolved once in World.load
    const rad = (p.t === 'door' || p.t === 'gate') ? 99 : p.t === 'npc' ? 69 : 59;
    const dx = Math.abs((P.x + P.w / 2) - p.x);
    const dy = Math.abs((P.y + P.h) - py);
    if (dx < rad && dy < 85 && dx < bd) { bd = dx; best = p; }
  });
  if (!best) return null;
  if (best.t === 'note') return { kind: 'note', p: best, label: best.label || 'Read' };
  if (best.t === 'npc') return { kind: 'npc', p: best, label: tr('ui.speak_with', tr(best.name)) };
  if (best.t === 'door') return { kind: 'door', p: best, label: tr('ui.enter', tr(best.name)) };
  if (best.t === 'gate') return { kind: 'gate', p: best, label: best.label || tr('ui.enter', tr(best.name)) };
  if (best.t === 'switch') return { kind: 'switch', p: best, label: best.label || 'ui.wake_the_rune' };
  return null;
}

function updateInteraction() {
  if (Dlg.on || G.scene !== 'world') { showPrompt(null); return; }
  const it = nearest();
  showPrompt(it ? tr(it.label) : null);
  G._near = it;
}

function doInteract() {
  if (Dlg.on) { Dlg.advance(); return; }
  const it = G._near;
  if (!it) return;
  if (it.kind === 'note') {
    readNote(it.p);
  } else if (it.kind === 'npc') {
    talkTo(it.p);
  } else if (it.kind === 'door') {
    useDoor(it.p);
  } else if (it.kind === 'gate') {
    useGate(it.p);
  } else if (it.kind === 'switch') {
    Puzzle.press(it.p);
  } else if (it.kind === 'challenge') {
    startBossScene();
  } else if (it.kind === 'shyn') {
    Dlg.open(DC.shyn_after, () => openCodex('contact'));          // speaking to him again always shows the ways to reach him
  }
}

function readNote(p) {
  if (p.id === 'dojo_board') { Dlg.open(DC.dojo_board); return; }
  if (!DC[p.dlg]) return;
  Sound.open();
  P.act = 'read';
  Dlg.open(DC[p.dlg], () => {
    P.act = '';
    const bag = p.cv ? G.flags : G.notes, first = !bag[p.id];   // résumé records (cv) are not inscriptions: they do not count towards the 20
    bag[p.id] = true;
    if (!p.cv) checkNoteAchievements();
    if (first && !(G.zone === 'room499' && G.flags.coinTaken)) { addScore(15 * (typeof Roster !== 'undefined' ? Roster.reading() : 1)); burst(P.x + P.w / 2, P.y + 14, 'rgba(190,150,255,', 10, 40); }
    save();
  });
}
function talkTo(p) {
  if (p.id === 'resync') { Sound.open(); Resync.talk(false); return; }      // the mender: src/js/66-resync.js
  if (!DC[p.dlg]) return;
  Sound.open();
  if (p.id === 'goblin') { Goblin.talk(p); return; }          // the accountant and his coin: src/js/63-goblin.js
  Dlg.open(DC[p.dlg]);
}
function useDoor(p) {
  if (p.locked === 'mercy' && !G.flags.mercy) {
    Sound.hit();
    Dlg.open(DC[p.lockDlg] || DC.sealed_contact);
    return;
  }
  Sound.open();
  goZone(p.to, p.side === 'right' ? 'left' : 'right');
}
function useGate(p) {
  if (p.to === 'dojo') { goZone('dojo', 'left'); return; }
  if (G.zone === 'dojo' && p.to === 'forest') { goZone('forest', 'dojoReturn'); return; }
  if (!G.flags.gateSeen) {
    G.flags.gateSeen = true;
    Dlg.open(DC[p.dlg || 'gate_arena'], () => goZone(p.to, 'left'));
  } else {
    goZone(p.to, 'left');
  }
}

/* ---------------- zones ---------------- */
function fadeTo(cb) {
  if (G.fadeDir !== 0) return;
  G.fadeDir = 1; G.fadeCb = cb;
}
function goZone(id, side) {
  Art.need(ZONES[id]).then(() => fadeTo(() => {      // atlases decode lazily, per zone
    loadZone(id, side);
  }));
}
function spawnPoint(z, side) {
  if (z.id === 'forest' && side === 'dojoReturn') return [181 * TILE + 8, FG * TILE];
  if (z.spawn) { const s = z.spawn[side] || z.spawn.left; return [s[0] * TILE + 8, s[1] * TILE]; }
  let sx = z.startX;                                    // migrated zones: same rule as before
  if (!z.lockCam) {
    if (side === 'left') sx = 107;
    else if (side === 'right') sx = z.w - 128;
  }
  return [sx, World.groundNear(sx)];
}
function loadZone(id, side) {
  const z = ZONES[id];
  if (!z) return;
  if (G.flags.bossSeen) {
    for (const key of ['pz_forest', 'pz_cath_a', 'pz_cath_b', 'pz_machine', 'pz_repo']) G.flags[key] = true;
  }
  G.zone = id;
  World.load(z, (id === 'arena' && G.flags.mercy) ? 'mercy' : null);
  const s = spawnPoint(z, side);
  P.x = s[0] - P.w / 2; P.y = s[1] - P.h;
  P.vx = 0; P.vy = 0; P.face = side === 'right' ? -1 : 1;
  P.safeX = P.x; P.safeY = P.y; P.onGround = true; P.landT = 0;
  camSnap();
  FX.clear();
  P.act = 'materialize'; if (P.anim) animPlay(P.anim, 'materialize', true);
  G.scene = 'world';
  Fight.end();
  if (id === 'arena') { BOSS.x = z.bossX; BOSS.pose = G.flags.mercy ? 'kneel' : 'idle'; }
  if (id === 'dojo') { FightUI.labels(); FightUI.hint('dojo'); }
  Arsenal.sync(id);                                    // weapons are found zone by zone (64-weapons.js)
  if (typeof Enemy !== 'undefined') Enemy.enter(id);    // the hollows of the hall (68-enemies.js)
  el('stage').classList.toggle('dojo', id === 'dojo');
  el('fight').classList.toggle('on', id === 'dojo');
  el('stage').classList.remove('void');
  Sound.ambience(z.mood, .85);
  Sound.wind(id === 'arena' ? .2 : .5);
  showZoneCard(z);
  hudSync();
  save();
  if (id === 'repository' && !G.flags.repoSeen) {
    G.flags.repoSeen = true;
    setTimeout(() => {
      if (G.zone === 'repository') toast('◈', 'zone.repository.name', 'zone.repository.sub', 6500);
    }, 3000);
  }
}
function showZoneCard(z) {
  showZoneCard.z = z;
  el('ztTitle').textContent = tr(z.name);
  el('ztSub').textContent = tr(z.sub);
  const c = el('zonecard');
  const st = el('stage');
  c.classList.add('on');
  st.classList.add('titlecard');
  clearTimeout(showZoneCard._t);
  showZoneCard._t = setTimeout(() => {
    c.classList.remove('on');
    st.classList.remove('titlecard');
  }, 5200);                                   // long enough to read the zone name
}

/* ---------------- boss ---------------- */
/* The fight itself lives in 67-combat.js (the player), 68-boss.js (the Keeper) and 69-override.js (the terminal phase). */

function mercyScene(yielded) {
  Fight.end();                           // hazards gone, fight HUD and thumb buttons away
  BOSS.pose = 'kneel';
  G.flags.falls = 0; G.flags.ally = false;      // the count towards RE-sync's help starts again after the fight is settled
  G.scene = 'dialog';
  el('stage').classList.add('void');
  Sound.ambience('arena', .25);
  BossMusic.finale();                    // the violin ends with the fight: one last chord, then only the wind
  Sound.wind(.06);
  Redact.reveal(() => Dlg.open(yielded ? DC.shyn_yield : DC.shyn_mercy, () => {
    G.flags.mercy = true;
    G.scene = 'world';
    el('stage').classList.remove('void');
    setDet(5, true);
    addScore(99);
    unlock('purpose');
    Sound.win();
    BOSS.pose = 'kneel';
    save();
    setTimeout(() => {
      toast('✧', 'ui.sealed_door_open', 'ui.sealed_door_open_sub', 7500);
      setTimeout(() => openCodex('contact'), 2400);
    }, 700);
  }));
}

/* ---------------- codex ---------------- */
function chapKeys() { return Object.keys(CODEX).concat(['__ach']); }
function chapterLocked(k) { return k === 'contact' && !G.flags.mercy; }

function openCodex(page) {
  if (Dlg.on) Dlg.close();
  if (G.scene === 'pause') el('pause').classList.remove('on');
  if (G.scene !== 'codex') G.prevScene = (G.scene === 'pause') ? 'world' : G.scene;
  G.scene = 'codex';
  el('codex').classList.add('on');
  el('stage').classList.add('dim');
  renderCodex(page || 'architect');
  unlock('codex');
  Sound.open();
}
function closeCodex() {
  if (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) document.activeElement.blur();   // or the keys stay in the form and the Recruiter cannot move
  el('codex').classList.remove('on');
  el('stage').classList.remove('dim');
  G.scene = (G.prevScene === 'codex' || !G.prevScene) ? 'world' : G.prevScene;
  if (G.scene === 'attempt') G.scene = 'attempt';
  Sound.close();
}
const ACH_PAGE = {
  label: 'ui.achievements',
  render() {
    let html = '<h2>' + tr('ui.achievements') + '</h2><p class="lead">' + tr('ach.page.lead') + '</p>';
    Object.keys(ACHIEVEMENTS).forEach((k) => {
      const a = ACHIEVEMENTS[k], got = !!G.ach[k];
      html += '<div class="artifact" style="opacity:' + (got ? 1 : .42) + '">' +
        '<b>' + (got ? a.icon + ' ' : '· ') + tr(a.title) + '</b>' +
        '<span>' + tr(got ? a.sub : 'ach.page.undiscovered') + '</span></div>';
    });
    html += '<h3>' + tr('ach.page.tally_h') + '</h3><p>' + tr('ach.page.tally', Object.keys(G.ach).length, Object.keys(ACHIEVEMENTS).length,
      G.score, G.attempt || 0, Object.keys(G.notes).length, TOTAL_NOTES) + '</p>' +
      '<h3>' + tr('ach.page.memory_h') + '</h3><p style="opacity:.6">' + tr('ach.page.memory') + ' ' +
      '<button class="btn" style="font-size:.62em;padding:.5em .9em;margin:0 .4em" id="forgetBtn">' + tr('ach.page.forget') + '</button></p>';
    return html;
  }
};

function codexStep(d) {
  const ks = chapKeys(), i = ks.indexOf(G.codexPage);
  renderCodex(ks[(i + d + ks.length) % ks.length]);
  Sound.open();
}
function renderCodex(page) {
  G.codexPage = page;
  const nav = el('chapNav');
  nav.innerHTML = '<div class="title">' + tr('ui.codex') + '</div>';
  chapKeys().forEach((k) => {
    const b = document.createElement('button');
    b.className = 'chap' + (k === page ? ' on' : '') + (chapterLocked(k) ? ' locked' : '');
    b.textContent = tr(k === '__ach' ? 'ui.achievements' : CODEX[k].label);   // the lock on a sealed chapter is drawn in CSS (.chap.locked::after)
    b.onclick = () => renderCodex(k);
    nav.appendChild(b);
  });
  const body = el('codexPage');
  const def = page === '__ach' ? ACH_PAGE : CODEX[page];
  body.innerHTML = (def.locked && chapterLocked(page)) ? def.lockedRender() : def.render();
  body.scrollTop = 0;
  const keys = document.createElement('div'); keys.className = 'keys'; keys.setAttribute('data-noi18n', '');
  keys.innerHTML = '<span dir="ltr">A D</span> ' + tr('codex.keys.chapter') + ' · <span dir="ltr">W S</span> ' + tr('codex.keys.scroll');
  nav.appendChild(keys);
  if (page === '__ach') Secret.row(body);
  const forget = el('forgetBtn');
  if (forget) forget.onclick = () => { if (confirm(tr('ach.page.forget_ask'))) forgetMe(); };
  const form = el('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const who = el('cfWho').value.trim() || tr('codex.sent.stranger');
      const comp = el('cfCompany').value.trim();
      const msg = el('cfMsg').value.trim();
      if (!msg) return;
      const text = 'REQUEST AN AUDIENCE\n' + who + (comp ? ' — ' + comp : '') +
        '\n\n' + msg + '\n\n(sent from Veyrath)';
      let copied = false;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(() => {}, () => {});
          copied = true;
        }
      } catch (err) { copied = false; }
      try { window.open(CONTACT.telegram, '_blank'); } catch (err) {}
      el('contactResult').innerHTML =
        '<div class="sent">' + tr('codex.sent.title') + '<br>' + tr('codex.sent.answer', '<b>' + escapeHtml(who) + '</b>') +
        '<br><br>' + tr(copied ? 'codex.sent.copied' : 'codex.sent.opened') +
        '<br><br><a class="btn pri" style="display:inline-block;text-decoration:none" href="' +
        escapeHtml(CONTACT.telegram) + '" target="_blank" rel="noopener">' + tr('codex.sent.open') + '</a></div>';
      unlock('audience');
      save();
      Sound.win();
    });
  }
}

/* ---------------- pause ---------------- */
function openPause() {
  if (G.scene !== 'world' && G.scene !== 'dialog' && G.scene !== 'boss') return;
  if (Dlg.on) return;
  G.pauseFrom = G.scene === 'boss' ? 'boss' : 'world';      // the fight can be paused too: the armoury is in this menu
  G.prevScene = 'world'; G.scene = 'pause';
  Arsenal.pauseSync(); Credits.pauseSync(); Music.pauseSync();
  el('pause').classList.add('on');
  Sound.open();
}
function closePause() {
  el('pause').classList.remove('on');
  Arsenal.close(); Credits.close();
  G.scene = G.pauseFrom === 'boss' && BOSS.active ? 'boss' : 'world';
  Sound.close();
}

/* ---------------- ending ---------------- */
function showEnding() {
  if (Special.kind() === 'meiko' && G.flags.meikoHappy) {
    el('pause').classList.remove('on'); G.scene='ending'; el('ending').classList.add('on');
    const fin=el('endFin'); fin.innerHTML=''; fin.textContent=tr('meiko.ending'); fin.style.opacity=1; Sound.ambience('title',.5);Music.play('ending'); save(); return;
  }
  el('pause').classList.remove('on');
  G.scene = 'ending';
  el('ending').classList.add('on');
  const fin = el('endFin');
  fin.innerHTML = '';
  fin.style.opacity = 0;
  Sound.ambience('title', .5); Sound.wind(.05); Music.play('ending');      // the ending has its own piece
  setTimeout(() => {
    fin.innerHTML = '<span data-i18n="end.1"></span><br><span data-i18n="end.2"></span><br><span class="e3" data-i18n="end.3"></span>'; I18N.apply(fin);
    fin.style.opacity = 1;
  }, 500);
  setTimeout(() => {
    fin.insertAdjacentHTML('beforeend', '<br><br><button class="btn pri" id="backToWorld" data-i18n="end.return"></button>' +
      ' <a class="btn" id="endResume" href="' + CONTACT.resume + '" target="_top" data-i18n="ui.back_to_resume"></a>'); I18N.apply(fin);
    fin.style.opacity = 1;
    el('backToWorld').onclick = () => {
      el('ending').classList.remove('on');
      G.scene = 'world';
      loadZone(G.zone, 'left');
    };
  }, 5200);
  save();
}

/* ---------------- intro ---------------- */
/* Four sentences, not nine (owner request): the narrator's clips 2, 4, 6, 9 carry the whole story and
   `vo` below points each line at the recording it is spoken by (tools/vo.mjs packs them in file order;
   the unused files 1, 3, 5, 7, 8 are still in art-src/audio if the intro is ever lengthened again). */
const INTRO_LINES = [               // t: id in STR · still: the life-stage picture behind the sentence (57-stills.js)
  { t: 'intro.1', q: true, vo: 0 },                          // "…the doors of every library were chained"
  { t: 'intro.3', still: 'child', vo: 2 },                   // "…a boy sat before a small glowing screen"
  { t: 'intro.6', still: 'machine', vo: 5 },                 // "When the machines began to speak…"
  { t: 'intro.9', still: 'threshold', vo: 8 }                // "And now, traveller, the road lies open."
];
function runIntro(returning) {
  G.scene = 'intro';
  el('intro').classList.add('on');
  const wrap = el('introLines'), form = el('nameform');
  wrap.innerHTML = '';
  form.classList.remove('on'); form.style.display = 'none';
  if (!Gate.done) { if (typeof Roster !== 'undefined') Roster.warm(); Gate.show(() => runIntro(returning)); return; }     // language + first tap (unlocks sound); the rigs decode meanwhile
  // then the body: a brand-new pilgrimage never starts as somebody the visitor did not choose (66-roster.js)
  if (!returning && typeof Roster !== 'undefined' && !Roster.chosen) { Roster.chosen = true; Roster.pick = null; Roster.show(() => runIntro(false)); return; }
  const lines = returning
    ? [{ t: 'intro.return', q: true }, { t: 'intro.remembers', name: true }]
    : INTRO_LINES;
  // One sentence at a time, in the chosen language. The narrator reads the English sentence in every language listed in
  // VO.langs; the text on screen is typed in step with her voice (never ahead of it), using the length of each recording.
  const node = document.createElement('div'), en = document.createElement('div');
  node.setAttribute('data-noi18n', ''); en.className = 'en';
  node.appendChild(en); wrap.appendChild(node);
  let i = 0; const run = ++runIntro.run;
  const alive = () => G.scene === 'intro' && run === runIntro.run && !form.classList.contains('on');
  (function step() {
    if (!alive()) return;
    if (i >= lines.length) {
      if (typeof Stills !== 'undefined') Stills.hide();
      if (!returning) { showNameForm(); return; }
      form.style.display = 'block';
      form.classList.add('on');
      form.innerHTML = '<button class="btn pri" type="button" id="resumeBtn" data-i18n="ui.continue"></button>' +
        '<div style="margin-top:1.2em"><button class="btn" type="button" id="newBtn" data-i18n="ui.begin_anew"></button></div>';
      I18N.apply(form);
      el('resumeBtn').onclick = () => enterWorld(true);
      el('newBtn').onclick = () => {
        try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
        location.reload();
      };
      return;
    }
    const l = lines[i], idx = i, clip = l.vo == null ? idx : l.vo, voiced = !returning && VO.langs.includes(LANG) && VO.has(clip);
    const full = l.name ? tr(l.t, G.name) : tr(l.t), steps = typeSteps(full);
    node.className = 'ln solo one' + (l.q ? ' quote' : '');
    en.textContent = ''; en.dir = RTL[LANG] ? 'rtl' : 'ltr'; en.lang = LANG;
    void node.offsetWidth; node.classList.add('on');
    clearTimeout(runIntro.stillT);
    if (Array.isArray(l.still)) { Stills.show(l.still[0], el('intro')); }      // two pictures for one sentence: the second arrives half-way (see below)
    else if (l.still) Stills.show(l.still, el('intro')); else Stills.hide();
    const last = returning && idx === lines.length - 1, len = full.length * (LANG === 'ja' ? 2.2 : 1);
    const est = (typeof VO_DUR !== 'undefined' && VO_DUR[clip] && !returning ? VO_DUR[clip] * 1000 : 1400 + len * 50), t0 = performance.now();
    let ended = false, shown = -1;
    runIntro.now = { i: idx, voiced, full, t0, est };
    if (Array.isArray(l.still)) runIntro.stillT = setTimeout(() => { if (alive() && i === idx + 0 || runIntro.now && runIntro.now.i === idx && G.scene === 'intro') Stills.show(l.still[1], el('intro')); }, est * .5);
    VO.play(voiced ? clip : -1, () => { ended = true; }, est);
    (function type() {
      if (!alive()) return;
      let p = VO.progress(); if (p < 0) p = (performance.now() - t0) / est;      // no sound: the same pace, by the clock
      if (ended) p = 1;
      const n = Math.min(steps.length, Math.floor(steps.length * Math.min(1, p / .94)));
      if (n !== shown) { shown = n; en.textContent = full.slice(0, n ? steps[n - 1] : 0); runIntro.now.shown = n / (steps.length || 1); runIntro.now.p = p; }
      if (ended && n >= steps.length) { setTimeout(() => { if (!last) node.classList.remove('on'); setTimeout(step, last ? 200 : 520); }, last ? 700 : 420); return; }
      requestAnimationFrame(type);
    })();
    i++;
  })();
}
runIntro.run = 0;
function showNameForm() {
  Gate.hide(); VO.stop();
  const solo = el('introLines').firstChild; if (solo) solo.classList.remove('on');
  const f = el('nameform');
  f.style.display = 'block';
  f.classList.add('on');
  const inp = el('pn');
  inp.value = '';
  inp.placeholder = G.name || 'ARASH';
  setTimeout(() => inp.focus(), 120);
}
function enterWorld(resume) {
  el('intro').classList.remove('on');
  el('nameform').style.display = 'none';
  Sound.resume(); Sound.boot();
  G.scene = 'world'; G.hasGame = true;
  if (!resume) {
    G.score = 0; G.notes = {}; G.flags = {}; G.ach = {}; G.det = 5;
    G.attempt = 0; G.zone = 'workshop';
    BOSS.active = false; BOSS.phase = 0; BOSS.pose = 'idle'; BOSS.cp = 0;
    Knight.enlist(G.name);                          // Round 9 §8.5 (64-knight.js)
  }
  Knight.apply();
  unlock('seeker');
  if (!resume) addScore(10);                     // legacy bug fixed: every resume used to add 10 points again
  const first = resume ? G.zone : 'workshop';
  Art.need(ZONES[first] || ZONES.workshop).then(() => fadeTo(() => {
    loadZone(ZONES[first] ? first : 'workshop', 'left');
    setTimeout(() => {
      toast('✦', Touch.on ? 'ui.keys_touch' : 'ui.keys_desktop', Touch.on ? 'ui.keys_touch_sub' : 'ui.keys_desktop_sub', 5200);
    }, 2600);
    if (!resume) setTimeout(() => toast('◉', 'ui.the_salary_ledger', 'ui.ledger_promise', 14000), G.flags.knight ? 16000 : 8600);
    if (!resume) Knight.herald();
  }));
  save();
}

/* the language button was pressed: redraw whatever is open */
document.addEventListener('langchange', () => {
  Dlg.relang();
  if (showZoneCard.z) { el('ztTitle').textContent = tr(showZoneCard.z.name); el('ztSub').textContent = tr(showZoneCard.z.sub); }
  if (G.scene === 'codex' && G.codexPage) { const y = el('codexPage').scrollTop; renderCodex(G.codexPage); el('codexPage').scrollTop = y; }
});
