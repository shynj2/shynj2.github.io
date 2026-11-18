/* ==========================================================================
   00 · CONFIG
   ========================================================================== */
const CONTACT = {
  /* ── EDIT HERE ── the only ways to reach the Architect, shown after the Throne. */
  telegram: 'https://t.me/shynj2',
  handle:   '@shynj2',
  email:    'shynj2@gmail.com',
  phone:    '+989229513128',
  phoneShown: '0922 951 3128',
  resume:   'https://shynj2.github.io/shyn/index.html'
};

const SAVE_KEY = 'rune-architect-save-v2';

/* ==========================================================================
   01 · DIALOGUE — who speaks, in which voice (cls), and which lines.
   Only ids live here; the words themselves are in STR (61-i18n.js), in five languages.
   Line N of an entry is "<entry>.N"; in entries with several speakers it is "<entry>.<block>.N".
   ========================================================================== */
const DC = {
  dojo_board: [{ who: 'who.dojo_sign', cls: 'npc', lines: ['dojo.sign.1', 'dojo.hint'] }],

  /* ---------------- Forgotten Forge ---------------- */
  librarian_workshop: [
    { who: 'who.librarian', cls: 'npc', lines: ['librarian_workshop.1', 'librarian_workshop.2', 'librarian_workshop.3', 'librarian_workshop.4', 'librarian_workshop.5'], stills: { 3: 'child', 4: 'teen' } }
  ],
  note_workshop_1: [
    { who: 'who.wall', cls: 'npc', lines: ['note_workshop_1.1', 'note_workshop_1.2'] }
  ],
  note_workshop_2: [
    { who: 'who.scratched', cls: 'npc', lines: ['note_workshop_2.1'] }
  ],
  note_workshop_3: [
    { who: 'who.hidden', cls: 'npc', lines: ['note_workshop_3.1', 'note_workshop_3.2'] }
  ],
  note_workshop_4: [
    { who: 'who.pilgrim_tablet', cls: 'architect', lines: ['note_workshop_4.1', 'note_workshop_4.2', 'note_workshop_4.3'] }
  ],

  /* ---------------- Forest of Thorns ---------------- */
  wanderer_forest: [
    { who: 'who.wanderer', cls: 'npc', lines: ['wanderer_forest.1', 'wanderer_forest.2', 'wanderer_forest.3'] }
  ],
  note_forest_1: [
    { who: 'who.bark', cls: 'npc', lines: ['note_forest_1.1'] }
  ],
  note_forest_2: [
    { who: 'who.overgrown', cls: 'npc', lines: ['note_forest_2.1'] }
  ],
  note_forest_3: [
    { who: 'who.root', cls: 'npc', lines: ['note_forest_3.1'] }
  ],

  /* ---------------- Cathedral of Design ---------------- */
  librarian_cathedral: [
    { who: 'who.librarian', cls: 'npc', lines: ['librarian_cathedral.1', 'librarian_cathedral.2', 'librarian_cathedral.3', 'librarian_cathedral.4', 'librarian_cathedral.5'], stills: { 3: 'dojo', 4: 'dojo' } }
  ],
  note_cathedral_1: [
    { who: 'who.great_tablet', cls: 'architect', lines: ['note_cathedral_1.1', 'note_cathedral_1.2'] }
  ],
  note_cathedral_2: [
    { who: 'who.fresco', cls: 'npc', lines: ['note_cathedral_2.1'] }
  ],
  note_cathedral_3: [
    { who: 'who.acolyte', cls: 'npc', lines: ['note_cathedral_3.1', 'note_cathedral_3.2'] }
  ],

  /* ---------------- Halls of the Machine Mind ---------------- */
  resync: [                                           // RE-sync, after the first defeat (what he really says is built in src/js/66-resync.js)
    { who: 'who.resync', cls: 'npc', lines: ['resync_again.1'] }
  ],
  candlekeeper: [
    { who: 'who.prompt_keeper', cls: 'npc', lines: ['candlekeeper.1', 'candlekeeper.2', 'candlekeeper.3', 'candlekeeper.4', 'candlekeeper.5', 'candlekeeper.6', 'candlekeeper.7'], stills: { 5: 'machine', 6: 'machine' } }
  ],
  note_catacomb_1: [
    { who: 'who.glyph', cls: 'npc', lines: ['note_catacomb_1.1'] }
  ],
  note_catacomb_2: [
    { who: 'who.engine_wall', cls: 'npc', lines: ['note_catacomb_2.1'] }
  ],
  note_catacomb_3: [
    { who: 'who.secret_panel', cls: 'npc', lines: ['note_catacomb_3.1', 'note_catacomb_3.2'] }
  ],

  /* ---------------- Ossuary of Lost Creations ---------------- */
  bot_repo: [
    { who: 'who.bot', cls: 'npc', lines: ['bot_repo.1', 'bot_repo.2', 'bot_repo.3'], stills: { 2: 'freelance' } }
  ],
  proto_repo: [
    { who: 'who.prototype', cls: 'npc', lines: ['proto_repo.1', 'proto_repo.2', 'proto_repo.3'] }
  ],
  refactor_repo: [
    { who: 'who.refactor', cls: 'npc', lines: ['refactor_repo.1', 'refactor_repo.2', 'refactor_repo.3', 'refactor_repo.4'] }
  ],
  note_repo_1: [
    { who: 'who.chalk', cls: 'npc', lines: ['note_repo_1.1'] }
  ],
  note_repo_2: [
    { who: 'who.blueprint', cls: 'npc', lines: ['note_repo_2.1'] }
  ],
  note_repo_3: [
    { who: 'who.blueprint', cls: 'npc', lines: ['note_repo_3.1'] }
  ],
  note_repo_4: [
    { who: 'who.blueprint', cls: 'npc', lines: ['note_repo_4.1'] }
  ],
  note_repo_5: [
    { who: 'who.archive_wall', cls: 'architect', lines: ['note_repo_5.1', 'note_repo_5.2'] }
  ],

  /* ---------------- The Final Gate, the Throne, the Sealed Door ---------------- */
  gate_arena: [
    { who: 'who.final_gate', cls: 'npc', lines: ['gate_arena.1', 'gate_arena.2'] }
  ],
  note_arena_1: [
    { who: 'who.throne_insc', cls: 'architect', lines: ['note_arena_1.1', 'note_arena_1.2'] }
  ],
  sealed_contact: [
    { who: 'who.sealed_door', cls: 'npc', lines: ['sealed_contact.1', 'sealed_contact.2', 'sealed_contact.3'] }
  ],

  /* ---------------- Shyn ---------------- */
  shyn_first: [
    { who: 'who.shyn_full', cls: 'shyn', lines: ['shyn_first.1', 'shyn_first.2', 'shyn_first.2b', 'shyn_first.2c', 'shyn_first.3', 'shyn_first.4'], stills: { 3: 'threshold' } }
  ],
  shyn_p1: [
    { who: 'who.shyn', cls: 'shyn', lines: ['shyn_p1.1', 'shyn_p1.2', 'shyn_p1.3'] }
  ],
  shyn_p2: [
    { who: 'who.shyn', cls: 'shyn', lines: ['shyn_p2.1', 'shyn_p2.2', 'shyn_p2.3', 'shyn_p2.4'] }
  ],
  shyn_p3: [
    { who: 'who.shyn', cls: 'shyn', lines: ['shyn_p3.1', 'shyn_p3.2', 'shyn_p3.3', 'shyn_p3.4'] }
  ],
  shyn_yield: [
    { who: 'who.shyn', cls: 'shyn', lines: ['shyn_yield.1.1'] },
    { cls: 'silence', lines: [''] },
    { who: 'who.shyn', cls: 'shyn', lines: ['shyn_yield.3.1', 'shyn_yield.3.2', 'shyn_yield.3.3', 'shyn_yield.3.4'] },
    { who: 'who.shyn', cls: 'shyn', lines: ['shyn_yield.4.1', 'shyn_yield.4.2'] }
  ],
  shyn_mercy: [
    { who: 'who.shyn', cls: 'shyn', lines: ['shyn_yield.1.1'] },
    { cls: 'silence', lines: [''] },
    { who: 'who.shyn', cls: 'shyn', lines: ['shyn_mercy.3.1', 'shyn_mercy.3.2', 'shyn_mercy.3.3', 'shyn_mercy.3.4'] },
    { who: 'who.you', cls: 'player', lines: ['shyn_mercy.4.1'] },
    { who: 'who.shyn', cls: 'shyn', lines: ['shyn_mercy.5.1', 'shyn_mercy.5.2', 'shyn_mercy.5.3', 'shyn_mercy.5.4'] },
    { who: 'who.shyn', cls: 'shyn', lines: ['shyn_mercy.6.1', 'shyn_mercy.6.2'] }
  ],
  shyn_after: [
    { who: 'who.shyn', cls: 'shyn', lines: ['shyn_after.1', 'shyn_after.2'] }
  ],

  /* ---------------- The Architect's Record (one page per zone) ---------------- */
  cv_workshop: [
    { who: 'who.record.I', cls: 'architect', lines: ['cv_workshop.1', 'cv_workshop.2', 'cv_workshop.3', 'cv.go_further'] }
  ],
  cv_forest: [
    { who: 'who.record.II', cls: 'architect', lines: ['cv_forest.1', 'cv_forest.2', 'cv_forest.3', 'cv_forest.4', 'cv.go_further'] }
  ],
  cv_cathedral: [
    { who: 'who.record.III', cls: 'architect', lines: ['cv_cathedral.1', 'cv_cathedral.2', 'cv_cathedral.3', 'cv.go_further'] }
  ],
  cv_catacombs: [
    { who: 'who.record.IV', cls: 'architect', lines: ['cv_catacombs.1', 'cv_catacombs.2', 'cv_catacombs.3', 'cv.go_further'] }
  ],
  cv_repository: [
    { who: 'who.record.V', cls: 'architect', lines: ['cv_repository.1', 'cv_repository.2', 'cv_repository.3', 'cv_repository.4', 'cv.go_further'] }
  ],
  cv_arena: [
    { who: 'who.record.VI', cls: 'architect', lines: ['cv_arena.1', 'cv_arena.2', 'cv_arena.3', 'cv_arena.4', 'cv_arena.5'] }
  ],

  /* ---------------- The Budget Goblin, Chamber 499 ---------------- */
  goblin_intro: [
    { who: 'who.goblin', cls: 'npc', lines: ['goblin_intro.1', 'goblin_intro.2', 'goblin_intro.2b', 'goblin_intro.3', 'goblin_intro.4', 'goblin_intro.5'] }
  ],
  goblin_coin: [
    { who: 'who.goblin', cls: 'npc', lines: ['goblin_coin.1', 'goblin_coin.2', 'goblin_coin.3'] }
  ],
  goblin_wait: [
    { who: 'who.goblin', cls: 'npc', lines: ['goblin_wait.1', 'goblin_wait.2'] }
  ],
  goblin_zero: [
    { who: 'who.goblin', cls: 'npc', lines: ['goblin_zero.1', 'goblin_zero.2', 'goblin_zero.3'] }
  ],
  goblin_accept: [
    { who: 'who.goblin', cls: 'npc', lines: ['goblin_accept.1', 'goblin_accept.2', 'goblin_accept.3'] }
  ],
  goblin_after: [
    { who: 'who.goblin', cls: 'npc', lines: ['goblin_after.1', 'goblin_after.2'] }
  ]
};

/* ==========================================================================
   02 · THE ARCHITECT CODEX  (the résumé, earned not shown)
   ========================================================================== */
const CONTACT_FORM = () => `<form class="form" id="contactForm" autocomplete="off">
        <div class="row"><label for="cfWho">${tr('codex.contact.who')}</label>
          <input id="cfWho" maxlength="40" placeholder="${tr('codex.contact.who_ph')}" required></div>
        <div class="row"><label for="cfCompany">${tr('codex.contact.company')}</label>
          <input id="cfCompany" maxlength="60" placeholder="${tr('codex.contact.company_ph')}"></div>
        <div class="row"><label for="cfMsg">${tr('codex.contact.msg')}</label>
          <textarea id="cfMsg" rows="3" maxlength="600" placeholder="${tr('codex.contact.msg_ph')}" required></textarea></div>
        <div><button class="btn pri" type="submit">${tr('codex.contact.send')}</button></div>
      </form>
      <div id="contactResult"></div>`;
const CONTACT_LINKS = () => `<div class="contacts">
        <a class="btn pri" href="${CONTACT.telegram}" target="_blank" rel="noopener"><i>${tr('codex.contact.telegram')}</i><b dir="ltr">${CONTACT.handle}</b></a>
        <a class="btn" href="mailto:${CONTACT.email}"><i>${tr('codex.contact.email')}</i><b dir="ltr">${CONTACT.email}</b></a>
        <a class="btn" href="tel:${CONTACT.phone}"><i>${tr('codex.contact.phone')}</i><b dir="ltr">${CONTACT.phoneShown}</b></a>
        <a class="btn" href="${CONTACT.resume}" target="_blank" rel="noopener"><i>${tr('codex.contact.resume')}</i><b dir="ltr">shynj2.github.io/shyn</b></a>
      </div>`;
const WORKS = [   // [address, what it is, what was done]  (the two texts are ids in STR, 61-i18n.js)
  ['pooyansport.com', 'works.sport', 'works.design_seo'],
  ['aidbax.ir', 'works.group', 'works.design_seo'],
  ['newabzar.com', 'works.tools', 'works.design'],
  ['abzaramini.com', 'works.tools', 'works.design_admin'],
  ['newabzar1.ir', 'works.tools', 'works.design_admin'],
  ['takabzarplus.ir', 'works.tools', 'works.design_admin']
];
const WORKS_HTML = () => WORKS.map((w) => `<a class="artifact" href="https://${w[0]}/" target="_blank" rel="noopener"><b dir="ltr">${w[0]}</b><span>${tr(w[1])}<br>${tr(w[2])}</span></a>`).join('');
/* a skill and its level: "Elementor — advanced". Tool names stay in Latin letters in every language. */
const SKILL = (name, level) => `<li><span dir="ltr">${name}</span>${level ? ' — ' + tr('codex.level.' + level) : ''}</li>`;
const oneLine = (id) => tr(id).replace(/\n/g, ' ');

/* The pages of the Codex. The HTML frame is fixed; every word comes from STR (61-i18n.js). */
const CODEX = {
  architect: {
    label: 'codex.tab.architect',
    render: () => `<h2>${tr('codex.architect.h2')}</h2>
      <p class="lead">${tr('codex.architect.lead')}</p>
      <div class="quote">${tr('codex.architect.quote')}</div>
      <h3>${tr('codex.architect.who_h')}</h3>
      <p>${tr('codex.architect.who_p')}</p>
      <h3>${tr('codex.architect.pillars_h')}</h3>
      <p>${tr('codex.architect.pillars_p')}</p>
      <h3>${tr('codex.architect.why_h')}</h3>
      <p>${tr('codex.architect.why_p')}</p>`
  },
  skills: {
    label: 'codex.tab.skills',
    render: () => `<h2>${tr('codex.skills.h2')}</h2>
      <p class="lead">${tr('codex.skills.lead')}</p>
      <h3>${tr('codex.skills.structures')}</h3>
      <ul>${SKILL('Elementor', 'advanced')}${SKILL('WordPress', 'advanced')}${SKILL('HTML / CSS', 'advanced')}${SKILL('Schema', 'proficient')}</ul>
      <h3>${tr('codex.skills.discovery')}</h3>
      <ul>${SKILL('SEO', 'advanced')}${SKILL('Google Search Console', 'advanced')}${SKILL('Moz Keyword Tools', 'proficient')}${SKILL('Screaming Frog', 'proficient')}</ul>
      <h3>${tr('codex.skills.market')}</h3>
      <ul><li>${tr('codex.skills.dm')} — ${tr('codex.level.advanced')}</li>${SKILL('Google Ads', 'proficient')}</ul>
      <h3>${tr('codex.skills.forge')}</h3>
      <ul><li>${tr('codex.skills.theme')}</li><li>${tr('codex.skills.plugin')}</li></ul>
      <h3>${tr('codex.skills.machine')}</h3>
      <ul><li>${tr('codex.skills.prompt')}</li><li>${tr('codex.skills.ai')}</li></ul>
      <h3>${tr('codex.skills.tongues')}</h3>
      <ul><li>${tr('codex.skills.english')}</li><li>${tr('codex.skills.russian')}</li><li>${tr('codex.skills.japanese')}</li></ul>`
  },
  projects: {
    label: 'codex.tab.projects',
    render: () => `<h2>${tr('codex.projects.h2')}</h2>
      <p class="lead">${tr('codex.projects.lead')}</p>
      ${WORKS_HTML()}
      <h3>${tr('codex.projects.note_h')}</h3>
      <p>${tr('codex.projects.note_p')}</p>`
  },
  experience: {
    label: 'codex.tab.experience',
    render: () => `<h2>${tr('codex.experience.h2')}</h2>
      <div class="kv">
        <i>${tr('codex.experience.date1')}</i><div><b>${tr('codex.experience.co1')}</b><br>${tr('codex.experience.role1')}</div>
        <i>${tr('codex.experience.date2')}</i><div><b>${tr('codex.experience.co2')}</b><br>${tr('codex.experience.role2')}</div>
        <i>${tr('codex.experience.date3')}</i><div><b>${tr('codex.experience.co3')} — ${tr('works.sport')}</b><br>${tr('codex.experience.role3')}</div>
        <i>${tr('codex.experience.method_h')}</i><div>${tr('codex.experience.method_p')}</div>
      </div>
      <div class="quote">${oneLine('note_repo_5.1')}<br>
      ${oneLine('note_repo_5.2')}</div>
      <h3>${tr('codex.experience.seek_h')}</h3>
      <p>${tr('codex.experience.seek_p')}</p>`
  },
  contact: {
    label: 'codex.tab.contact',
    locked: true,
    render: () => `<h2>${tr('codex.contact.h2')}</h2>
      <div class="quote">${tr('codex.contact.quote')}</div>
      ${CONTACT_LINKS()}
      <h3>${tr('codex.contact.or')}</h3>
      ${CONTACT_FORM()}`,
    lockedRender: () => `<h2>${tr('codex.contact.h2')}</h2>
      <p class="lead">${tr('codex.contact.locked_lead')}</p>
      <div class="quote">${tr('codex.contact.locked_quote')}</div>
      <h3>${tr('codex.contact.road')}</h3>
      <div class="kv">
        <i>${tr('codex.contact.step1')}</i><div>${tr('codex.contact.step1_p')}</div>
        <i>${tr('codex.contact.step2')}</i><div>${tr('codex.contact.step2_p')}</div>
        <i>${tr('codex.contact.step3')}</i><div>${tr('codex.contact.step3_p')}</div>
        <i>${tr('codex.contact.step4')}</i><div>${tr('codex.contact.step4_p')}</div>
      </div>
      <p>${tr('codex.contact.locked_p')}</p>`
  }
};

/* title and sub are ids in STR: ach.<id>.title / ach.<id>.sub */
const ACHIEVEMENTS = {
  seeker:     { icon: '✦', title: 'ach.seeker.title',     sub: 'ach.seeker.sub' },
  reader:     { icon: '❖', title: 'ach.reader.title',     sub: 'ach.reader.sub' },
  whispers:   { icon: '✧', title: 'ach.whispers.title',   sub: 'ach.whispers.sub' },
  persistent: { icon: '◆', title: 'ach.persistent.title', sub: 'ach.persistent.sub' },
  purpose:    { icon: '♛', title: 'ach.purpose.title',    sub: 'ach.purpose.sub' },
  goblin:     { icon: '◉', title: 'ach.goblin.title',     sub: 'ach.goblin.sub' },
  codex:      { icon: '◈', title: 'ach.codex.title',      sub: 'ach.codex.sub' },
  audience:   { icon: '✉', title: 'ach.audience.title',   sub: 'ach.audience.sub' }
};
/* ==========================================================================
   03 · SOUND — everything synthesised, zero files.
   ========================================================================== */
