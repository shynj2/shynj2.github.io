/* ==========================================================================
   ZONES 2-7 — owner-editable, same format as the Workshop in 50-zones.js.
     at: [col, row]   col = tile column, row = the floor tile the thing stands on
     x:  pixels       (the two small rooms still use the old pixel positions)
   Ids, dialogue keys, door targets and lock rules are the frozen script. Do not rename them.
   Maps: art-src/maps/<map>.txt. Run `node tools/reach.mjs` after editing a map: it lists
   every platform the Recruiter cannot actually jump onto.
   ========================================================================== */
const range = (a, b, step = 1) => { const o = []; for (let i = a; i <= b; i += step) o.push(i); return o; };

/* ---------------- Frontend Forest helpers ---------------- */
const FG = 29;                                                // forest: row of the forest floor
// a great tree whose branches are the '-' platforms of the map; col = the column its trunk stands on
const greatTree = (col, ground) => {
  const cx = col * 16 + 16, o = [{ s: 'tree_base', px: [cx - 60, ground * 16 - 54], layer: 'back' }];
  for (let y = ground * 16 - 54 - 96; y > 100; y -= 96) o.push({ s: 'trunk', px: [cx - 22, y], layer: 'back' });
  o.push({ s: 'crown_dark', px: [cx - 85, 36], layer: 'back' }, { s: 'crown_dark_b', px: [cx - 160, 104], layer: 'back' }, { s: 'crown_dark_b', px: [cx + 36, 92], layer: 'back' },
    { s: 'crown_a', px: [cx - 75, 112], layer: 'back' }, { s: 'crown_b', px: [cx - 136, 176], layer: 'back' }, { s: 'crown_c', px: [cx + 44, 186], layer: 'back' }, { s: 'crown_c', px: [cx - 40, 214], layer: 'back' });
  return o;
};

/* ---------------- Cathedral helpers ---------------- */
const CF = 33;                                                // cathedral: row of the nave floor
const pier = (col) => [{ s: 'pillar', at: [col, CF], layer: 'back' }, { s: 'pillar', at: [col, CF - 22], layer: 'back' }];
const nave = (col) => [{ s: 'cut_arch_big', at: [col, CF], cut: true, dy: -34 }, { s: 'arch_big', at: [col, CF], layer: 'back', dy: -34 }];

const MF = 27;                                                // machine halls: floor row
const RF = 29;                                                // repository: floor row

const PENDING_ZONES = {
  /* =====================================================================
     FRONTEND FOREST — open sky, two great trees, a ravine.
     Puzzle: the rune in the crown of the second tree wakes the bridge of leaves.
     ===================================================================== */
  forest: {
    id: 'forest', name: 'zone.forest.name', sub: 'zone.forest.sub',
    mood: 'forest', map: 'forest', atlas: 'forest', lut: 'identity',
    ambient: [134, 150, 132], sky: ['moss0', 'moss1', 'moss2', 'moss1'],
    parallax: [
      { img: 'px_far', fx: .04, fy: .03, y: -30 }, { img: 'px_l4', fx: .12, fy: .06, y: -40 },
      { img: 'px_l3', fx: .26, fy: .10, y: -50 }, { img: 'px_l2', fx: .46, fy: .16, y: -60 }
    ],
    spawn: { left: [6, FG], right: [190, FG] },
    puzzle: { 1: 'pz_forest' }, puzzleHint: 'ui.hint.forest',
    /* the hollows: [kind, tile column] — see 68-enemies.js */
    foes: [['mote', 52], ['stalker', 76], ['mote', 98], ['stalker', 118], ['brute', 158]],
    // undergrowth is scattered over every patch of ground by a seeded hash: [sprite, chance, layer]
    scatter: [['grass_a', .26, 'front'], ['grass_b', .2], ['grass_c', .1], ['fern', .09], ['flower', .05], ['mush', .035], ['rock', .03], ['bush_a', .05, 'back']], vines: .34,
    props: [
      { t: 'note', at: [12, FG], id: 'f1', dlg: 'note_forest_1', label: 'ui.read_the_bark' },
      { t: 'npc', at: [33, 27], look: 'wanderer', name: 'who.wanderer', dlg: 'wanderer_forest', id: 'wanderer' },
      { t: 'lamp', at: [8, FG], kind: 'lantern' },
      { t: 'note', at: [85, 22], id: 'f2', dlg: 'note_forest_2', label: 'ui.read_the_sign', dy: 8 },
      { t: 'lamp', at: [46, FG], kind: 'lantern' },
      { t: 'note', at: [100, 31], id: 'f3', dlg: 'note_forest_3', label: 'ui.read_the_carved_root', dy: 0 },
      { t: 'lamp', at: [110, FG], kind: 'lantern' },
      { t: 'switch', at: [142, 21], id: 'pz_forest', label: 'ui.wake_the_rune', woke: 'ui.woke.forest' },
      { t: 'statue', at: [168, FG], kind: 'runeStone' },
      { t: 'lamp', at: [128, FG], kind: 'lantern' },
      { t: 'lamp', at: [184, FG], kind: 'lantern' },
      { t: 'door', at: [3, FG], side: 'left', to: 'workshop', name: 'zone.workshop.short' },
      { t: 'door', at: [194, FG], side: 'right', to: 'cathedral', name: 'zone.cathedral.name' }
    ],
    decor: [
      // trees standing behind the path (never climbable): [sprite, column, ground row]
      ...[['tree_far', 7, FG], ['tree_b', 17, FG], ['tree_a', 30, 27], ['tree_far', 44, FG], ['tree_b', 50, FG], ['tree_a', 77, FG], ['tree_far', 86, FG], ['tree_b', 93, FG],
        ['tree_a', 108, FG], ['tree_far', 117, FG], ['tree_b', 124, FG], ['tree_a', 147, FG], ['tree_b', 164, FG], ['tree_far', 172, FG], ['tree_a', 181, FG], ['tree_b', 189, FG]]
        .map(([s, col, row]) => ({ s, at: [col, row], layer: 'back', dy: 3 })),
      ...greatTree(64, FG), ...greatTree(138, FG),
      { s: 'crown_dark_b', px: [1190, 250], layer: 'back' }, { s: 'crown_b', px: [1290, 262], layer: 'back' },      // leaves over the canopy walk
      ...[[20, FG], [40, 28], [72, FG], [91, FG], [121, FG], [145, FG], [166, FG], [187, FG]].map(([c, r], i) => ({ s: i % 2 ? 'bush_b' : 'bush_dark', at: [c, r], layer: 'back', dy: 2 })),
      { s: 'log', at: [24, 28] }, { s: 'stump', at: [58, FG] }, { s: 'log', at: [113, FG] }, { s: 'stump', at: [163, FG] }, { s: 'sapling', at: [36, 27], layer: 'back' }, { s: 'sapling', at: [131, FG], layer: 'back' }, { s: 'sapling', at: [178, FG], layer: 'back' },
      ...[[10, 24], [35, 22], [61, 20], [70, 17], [84, 18], [100, 27], [119, 24], [140, 17], [155, 24], [170, 24], [192, 24]].map(([c, r]) => ({ s: 'firefly', px: [c * 16, r * 16], anim: 7 })),
      // foreground: black leaves hanging into the top of the frame
      ...range(0, 8).map((i) => ({ s: i % 2 ? 'fg_leaves_b' : 'fg_leaves', px: [60 + i * 470, -18 + (i % 3) * 4], layer: 'fg', f: 1.2, fy: 0 }))
    ],
    lights: [
      ...[18, 62, 96, 150, 176].map((c) => ({ at: [c, 23], r: 170, c: 'leaf', steady: true })),
      { at: [100, 30], r: 70, c: 'rune', steady: true }, { at: [168, 27], r: 80, c: 'rune', steady: true }
    ]
  },

  /* =====================================================================
     CATHEDRAL OF DESIGN — one vast nave. (Art: Workshop kit in gold. TODO_ART: its own kit.)
     Puzzle: the first rune wakes a stair; the second rune, at its top, wakes the bridge.
     ===================================================================== */
  cathedral: {
    id: 'cathedral', name: 'zone.cathedral.name', sub: 'zone.cathedral.sub',
    mood: 'cathedral', map: 'cathedral', atlas: 'workshop', lut: 'cathedral',
    spawn: { left: [6, CF], right: [199, CF] },
    puzzle: { 1: 'pz_cath_a', 2: 'pz_cath_b' }, puzzleHint: 'ui.hint.cathedral',
    foes: [['warden', 44], ['wisp', 96], ['warden', 133], ['echo', 186]],
    props: [
      { t: 'lamp', at: [11, CF], kind: 'gold' },
      { t: 'note', at: [27, CF], id: 'c1', dlg: 'note_cathedral_1', label: 'ui.read_the_great_tablet', dy: 13 },
      { t: 'statue', at: [40, 31], kind: 'saint' },
      { t: 'lamp', at: [52, CF], kind: 'gold' },
      { t: 'npc', at: [66, CF], look: 'librarian', name: 'who.librarian', dlg: 'librarian_cathedral', id: 'lib_c' },
      { t: 'note', at: [104, 30], id: 'c2', dlg: 'note_cathedral_2', label: 'ui.read_the_fresco', dy: 53 },
      { t: 'lamp', at: [83, CF], kind: 'gold' },
      { t: 'statue', at: [93, CF], kind: 'saint' },
      { t: 'lamp', at: [123, CF], kind: 'gold' },
      { t: 'note', at: [141, 27], id: 'c3', dlg: 'note_cathedral_3', label: 'ui.read_the_acolytes_note' },
      { t: 'switch', at: [147, CF], id: 'pz_cath_a', label: 'ui.wake_the_rune', woke: 'ui.woke.cathedral_a' },
      { t: 'switch', at: [156, 25], id: 'pz_cath_b', label: 'ui.wake_the_rune', woke: 'ui.woke.cathedral_b' },
      { t: 'lamp', at: [178, CF], kind: 'gold' },
      { t: 'statue', at: [192, CF], kind: 'saint' },
      { t: 'lamp', at: [198, CF], kind: 'gold' },
      { t: 'door', at: [3, CF], side: 'left', to: 'forest', name: 'zone.forest.name' },
      { t: 'door', at: [203, CF], side: 'right', to: 'catacombs', name: 'zone.machine.name' }
    ],
    decor: [
      ...[8, 32, 58, 86, 118, 146, 176, 200].flatMap(pier),
      ...[20, 46, 72, 132, 188].flatMap(nave),
      ...[14, 27, 52, 66, 80, 112, 126, 182, 194].map((c) => ({ s: 'window', at: [c, CF], dy: -150, layer: 'back' })),
      { s: 'gearwall', at: [103, 30], dy: -70, layer: 'back' },                                                    // the gear-rose above the pulpit
      { s: 'gear_xl', px: [39 * 16 - 46, 15 * 16], layer: 'back', anim: 2 }, { s: 'gear_l', px: [164 * 16, 12 * 16], layer: 'back', anim: 3 }, { s: 'gear_xl', px: [165 * 16 + 40, 15 * 16], layer: 'back', anim: 2, rev: 1 },
      ...[24, 62, 90, 138, 168, 196].map((c, i) => ({ s: i % 2 ? 'chain_long' : 'chain_hook', hang: [c, 2] })),
      ...[36, 76, 122, 152, 184].map((c) => ({ s: 'cagelamp', hang: [c, 2], dy: 0 })),
      ...[32, 86, 146, 176].map((c) => ({ s: 'arena_banner', hang: [c, 12], layer: 'back' })),
      { s: 'blueprint', at: [27, CF], dy: -76, layer: 'back' }, { s: 'shelf', at: [70, CF], dy: -60, layer: 'back' }, { s: 'workbench', at: [60, CF] },
      ...[1, 4].map((i) => ({ s: 'fg_pillar', px: [i * 900, 226], layer: 'fg', f: 1.3 })), { s: 'fg_chain', px: [1500, 150], layer: 'fg', f: 1.22 }, { s: 'fg_chain', px: [3100, 150], layer: 'fg', f: 1.22 }
    ],
    lights: [...range(20, 200, 30).map((c) => ({ at: [c, 16], r: 190, c: 'gold', steady: true })), { at: [104, 22], r: 200, c: 'gold', steady: true }]
  },

  /* =====================================================================
     HALLS OF THE MACHINE MIND — prompt engineering and AI engineering.
     (The zone id stays 'catacombs' and the NPC id 'candle': the save file and the door chain depend on them.)
     Puzzle: three runes, spoken in the order of a good prompt: ROLE, CONTEXT, TASK. The slab on the wall says so.
     ===================================================================== */
  catacombs: {
    id: 'catacombs', name: 'zone.machine.name', sub: 'zone.machine.sub',
    mood: 'catacombs', map: 'catacombs', atlas: 'catacombs', lut: 'catacombs',
    parallax: [
      { img: 'px_far', fx: .05, fy: .03, y: 18 },
      { img: 'px_l4',  fx: .13, fy: .06, y: 8 },
      { img: 'px_l3',  fx: .26, fy: .10, y: 0 },
      { img: 'px_l2',  fx: .45, fy: .15, y: 0 }
    ],
    ambient: [52, 66, 96],
    spawn: { left: [6, MF], right: [182, MF] },
    puzzle: { 1: 'pz_machine' }, puzzleHint: 'ui.hint.machine',
    foes: [['wisp', 34], ['mote', 58], ['wisp', 92], ['brute', 128], ['stalker', 176]],
    props: [
      { t: 'lamp', at: [9, MF], kind: 'blue' },
      { t: 'note', at: [21, MF], id: 't1', dlg: 'note_catacomb_1', label: 'ui.read_the_glyph', dy: 24 },
      { t: 'lamp', at: [44, MF], kind: 'blue' },
      { t: 'npc', at: [88, MF], look: 'keeper', name: 'who.prompt_keeper', dlg: 'candlekeeper', id: 'candle' },
      { t: 'npc', at: [79, MF], look: 'resync', name: 'who.resync', dlg: 'resync', id: 'resync', flag: 'resync' },      // appears after the first defeat (66-resync.js)
      { t: 'lamp', at: [72, MF], kind: 'blue' },
      { t: 'lamp', at: [100, MF], kind: 'blue' },
      { t: 'note', at: [108, MF], id: 't2', dlg: 'note_catacomb_2', label: 'ui.read_the_engine_wall', dy: 27 },
      { t: 'switch', at: [119, MF], id: 'pz_m_task', of: 'pz_machine', step: 2, total: 3, tag: 'TASK', label: 'ui.speak_the_rune_task' },
      { t: 'switch', at: [127, 23], id: 'pz_m_role', of: 'pz_machine', step: 0, total: 3, tag: 'ROLE', label: 'ui.speak_the_rune_role' },
      { t: 'switch', at: [135, MF], id: 'pz_m_ctx', of: 'pz_machine', step: 1, total: 3, tag: 'CONTEXT', label: 'ui.speak_the_rune_context' },
      { t: 'lamp', at: [142, MF], kind: 'blue' },
      { t: 'note', at: [150, MF], id: 't3', dlg: 'note_catacomb_3', label: 'ui.open_the_secret_panel', dy: 37 },
      { t: 'statue', at: [172, MF], kind: 'valve' },
      { t: 'door', at: [3, MF], side: 'left', to: 'cathedral', name: 'zone.cathedral.name' },
      { t: 'door', at: [186, MF], side: 'right', to: 'repository', name: 'zone.repository.name' }
    ],
    decor: [
      ...[14, 38, 62, 80, 96, 114, 138, 154, 170, 182].map((c) => ({ s: 'pillar', at: [c, MF], layer: 'back' })),
      { s: 'core', at: [88, MF], dy: -44, layer: 'back', anim: 6 },                                                // the Machine Mind
      { s: 'prompt_slab', at: [127, MF], dy: -100, layer: 'back' },                                                // the lesson, above the three runes
      ...[[27, 14], [69, 13], [143, 13], [175, 13]].map(([c, r]) => ({ s: 'lattice', px: [c * 16 - 32, r * 16], layer: 'back', anim: 3 })),
      ...[6, 18, 33, 47, 57, 74, 104, 112, 148, 160, 166, 180].map((c, i) => ({ s: 'stream', px: [c * 16 + 4, (c < 61 ? 10 : 6 + (i % 3)) * 16], layer: 'back', anim: 9, phase: i * 3 })),
      ...[12, 40, 56, 76, 98, 146, 176].map((c) => ({ s: 'console', at: [c, MF], anim: 3 })),
      ...range(0, 11).map((i) => ({ s: 'conduit', px: [40 + i * 250, (i < 4 ? 10 : 3) * 16 + 6], layer: 'back', anim: 8, phase: i })),
      { s: 'gear_l', px: [99 * 16, 8 * 16 + 4], layer: 'back', anim: 3 }, { s: 'gear_m', px: [104 * 16, 9 * 16], layer: 'back', anim: 5, rev: 1 },
      ...[66, 92, 132, 162].map((c) => ({ s: 'chain_long', hang: [c, c > 95 && c < 109 ? 8 : 2] })),
      { s: 'fg_cable', px: [700, 182], layer: 'fg', f: 1.2 }, { s: 'fg_cable', px: [1900, 182], layer: 'fg', f: 1.2 }, { s: 'fg_pillar', px: [1300, 60], layer: 'fg', f: 1.3 }, { s: 'fg_pillar', px: [2900, 60], layer: 'fg', f: 1.3 }
    ],
    lights: [{ at: [88, 20], r: 150, c: 'rune', steady: true }, ...range(30, 180, 36).map((c) => ({ at: [c, 18], r: 130, c: 'cold', steady: true }))]
  },

  /* =====================================================================
     REPOSITORY OF LOST CREATIONS — (Art: Workshop kit in grey-violet. TODO_ART: its own kit.)
     Puzzle: two branches cross the pit. The lever on the island switches which branch exists.
     ===================================================================== */
  repository: {
    id: 'repository', name: 'zone.repository.name', sub: 'zone.repository.sub',
    mood: 'repository', map: 'repository', atlas: 'workshop', lut: 'repository', ambient: [74, 66, 98],
    spawn: { left: [6, RF], right: [206, RF] },
    puzzle: { 1: '!pz_repo', 2: 'pz_repo' }, puzzleHint: 'ui.hint.repository',
    foes: [['echo', 62], ['stalker', 105], ['echo', 142], ['wisp', 176], ['brute', 191]],
    props: [
      { t: 'note', at: [19, RF], id: 'r1', dlg: 'note_repo_1', label: 'ui.read_the_chalk', dy: 13 },
      { t: 'npc', at: [52, RF], look: 'bot', name: 'who.bot', dlg: 'bot_repo', id: 'bot' },
      { t: 'lamp', at: [35, RF], kind: 'violet' },
      { t: 'note', at: [72, 27], id: 'r2', dlg: 'note_repo_2', label: 'ui.read_the_fragment', dy: 8 },
      { t: 'note', at: [78, 25], id: 'r3', dlg: 'note_repo_3', label: 'ui.read_the_fragment', dy: 8 },
      { t: 'note', at: [84, 23], id: 'r4', dlg: 'note_repo_4', label: 'ui.read_the_fragment', dy: 8 },
      { t: 'npc', at: [98, RF], look: 'shroud', name: 'who.prototype', dlg: 'proto_repo', id: 'proto' },
      { t: 'lamp', at: [90, RF], kind: 'violet' },
      { t: 'npc', at: [124, RF], look: 'shroud', name: 'who.refactor', dlg: 'refactor_repo', id: 'refactor' },
      { t: 'lamp', at: [130, RF], kind: 'violet' },
      { t: 'switch', at: [150, RF], id: 'pz_repo', toggle: true, tag: 'BRANCH', label: 'ui.switch_the_branch' },
      { t: 'note', at: [173, RF], id: 'r5', dlg: 'note_repo_5', label: 'ui.read_the_archive_wall', dy: 29 },
      { t: 'lamp', at: [192, RF], kind: 'violet' },
      { t: 'door', at: [3, RF], side: 'left', to: 'catacombs', name: 'zone.machine.name' },
      { t: 'gate', at: [210, RF], to: 'arena', name: 'zone.throne.name', dlg: 'gate_arena' }
    ],
    decor: [
      ...[10, 44, 66, 92, 118, 168, 198].map((c) => ({ s: 'pillar', at: [c, RF], layer: 'back' })),
      // the archive: shelves of things that were never finished, stacked up the walls
      ...[14, 24, 30, 56, 108, 180, 190].flatMap((c, i) => range(0, 2 + (i % 2)).map((k) => ({ s: 'shelf', at: [c, RF], dy: -34 - k * 62, layer: 'back' }))),
      ...[[22, 'blueprint', -70], [40, 'toolrack', -64], [62, 'blueprint', -110], [102, 'toolrack', -60], [114, 'blueprint', -80], [172, 'blueprint', -120], [186, 'toolrack', -70]].map(([c, s, dy]) => ({ s, at: [c, RF], dy, layer: 'back' })),
      ...[[16, 'crate'], [17, 'crate_s'], [38, 'workbench'], [47, 'barrel'], [58, 'crate'], [64, 'anvil'], [95, 'crate_s'], [106, 'workbench'], [112, 'barrel'], [121, 'crate'], [170, 'crate'], [171, 'crate_s'], [182, 'workbench'], [196, 'barrel'], [201, 'crate']].map(([c, s]) => ({ s, at: [c, RF], dx: (c % 3) * 3 })),
      { s: 'gear_xl', px: [136 * 16, 9 * 16], layer: 'back', anim: 0 }, { s: 'gear_l', px: [144 * 16, 14 * 16], layer: 'back', anim: 0 }, { s: 'gear_m', px: [157 * 16, 11 * 16], layer: 'back', anim: 0 }, { s: 'gear_xl', px: [158 * 16, 15 * 16], layer: 'back', anim: 0 },   // stopped: nothing here turns any more
      ...[48, 76, 100, 128, 150, 162, 194].map((c, i) => ({ s: i % 2 ? 'chain_hook' : 'chain_long', hang: [c, 2] })),
      ...[28, 82, 140, 156, 186].map((c) => ({ s: 'cagelamp', hang: [c, 2] })),
      { s: 'window', at: [78, RF], dy: -130, layer: 'back' }, { s: 'window', at: [204, RF], dy: -60, layer: 'back' },
      { s: 'fg_pillar', px: [1100, 150], layer: 'fg', f: 1.3 }, { s: 'fg_chain', px: [2000, 90], layer: 'fg', f: 1.22 }, { s: 'fg_pillar', px: [3300, 150], layer: 'fg', f: 1.3 }
    ],
    lights: [...range(24, 204, 36).map((c) => ({ at: [c, 18], r: 150, c: 'dim', steady: true })), { at: [150, 26], r: 110, c: 'rune', steady: true }]
  },

  /* ---------------- the two small rooms (old pixel positions) ---------------- */
  arena: {
    id: 'arena', name: 'zone.throne.name', sub: 'zone.throne.sub',
    mood: 'arena', map: 'arena', atlas: 'workshop', lut: 'arena', lockCam: true,
    startX: 144, bossX: 443,
    decor: [
      ...[1, 11, 22, 33, 42].map((c) => ({ s: 'pillar', at: [c, 19], layer: 'back' })),
      { s: 'cut_arch_mid', at: [16, 19], cut: true, dy: -26 },
      { s: 'arch_mid', at: [16, 19], layer: 'back', dy: -26 },
      { s: 'window', at: [6, 19], dy: -26, layer: 'back' },
      { s: 'window', at: [37, 19], dy: -26, layer: 'back' },
      ...[11, 22, 33].map((c) => ({ s: 'arena_banner', hang: [c, 3], dy: 8, layer: 'back' })),
      ...[6, 16, 27, 37].map((c) => ({ s: 'cagelamp', hang: [c, 2], dy: 2 })),
      ...[9, 19, 30, 40].map((c) => ({ s: 'chain_short', hang: [c, 2] })),
      { s: 'brazier', at: [24, 19], layer: 'back' },
      { s: 'brazier', at: [31, 19], layer: 'back' },
      { s: 'hearth', at: [16, 19], layer: 'back' }
    ],
    props: [
      { t: 'throne', x: 443 },
      { t: 'npc', x: 128, look: 'resync', name: 'who.resync', id: 'ally', flag: 'allyOn' },      // RE-sync at the visitor's side after five defeats (68-ally.js)
      { t: 'note', x: 248, id: 'a1', dlg: 'note_arena_1', label: 'ui.read_the_throne', dy: 0 },
      { t: 'door', x: 53, side: 'left', to: 'repository', name: 'zone.repository.short' },
      { t: 'door', x: 632, side: 'right', to: 'room499', name: 'zone.chamber.name', locked: 'mercy', lockDlg: 'sealed_contact' }
    ]
  },
  room499: {
    id: 'room499', name: 'zone.chamber.name', sub: 'zone.chamber.sub',
    mood: 'room499', map: 'room499', atlas: 'workshop', lut: 'room499', lockCam: true,
    startX: 160,
    decor: [      // the counting house, in three depths: vault niches in the wall, shelves and banners before them, furniture on the floor
      { s: 'g_vault', at: [13, 19], layer: 'back' }, { s: 'g_vault', at: [32, 19], dx: 6, layer: 'back' },
      { s: 'g_banner', hang: [10, 2], layer: 'back' }, { s: 'g_banner', hang: [39, 2], layer: 'back' },
      { s: 'g_shelf', at: [18, 19], dx: -4, layer: 'back' }, { s: 'g_shelf', at: [27, 19], dx: 8, layer: 'back' },
      { s: 'shelf', at: [22, 19], dy: -96, layer: 'back' },
      { s: 'g_sign', hang: [23, 2], dx: -6 }, { s: 'g_lantern', hang: [19, 2] }, { s: 'g_lantern', hang: [30, 2], dx: -4 },
      { s: 'g_rug', at: [20, 19], dx: -6, dy: 3 },
      { s: 'g_scales', at: [33, 19], dx: 2 }, { s: 'g_chest', at: [36, 19], dx: 6 }, { s: 'g_sacks', at: [15, 19], dx: 4 },
      { s: 'coin_pile', at: [29, 19], dx: 4 }, { s: 'coin_pile', at: [31, 19], dx: -2, layer: 'back' }, { s: 'coin_pile', at: [8, 19], layer: 'back' },
      { s: 'g_sacks', at: [39, 19], dx: 2, layer: 'back' }
    ],
    lights: [{ x: 345, y: 250, r: 84, c: 'fire' }, { x: 387, y: 236, r: 120, c: 'gold', steady: true },
      { x: 312, y: 70, r: 70, c: 'gold' }, { x: 484, y: 70, r: 70, c: 'gold' }, { x: 560, y: 276, r: 46, c: 'gold', steady: true }, { x: 250, y: 286, r: 40, c: 'fire' }],
    props: [
      { t: 'npc', x: 387, look: 'goblin', name: 'who.goblin', dlg: 'goblin_intro', id: 'goblin' },
      { t: 'lamp', x: 187, kind: 'gold' },
      { t: 'lamp', x: 587, kind: 'gold' },
      { t: 'note', x: 627, id: 's1', dlg: 'goblin_after', label: 'ui.read_the_ledger', dy: 5 },
      { t: 'door', x: 56, side: 'left', to: 'arena', name: 'zone.throne.short' }
    ]
  }
};
