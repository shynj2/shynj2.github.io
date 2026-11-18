/* ==========================================================================
   THE WORLD — one entry per district.
   · The walkable shape is the ASCII map  art-src/maps/<zone>.txt
   · props  = the gameplay objects (notes, NPCs, doors). Their id / dlg / to / locked
              fields are the game's script — move them freely, never rename them.
   · decor  = pure art. { s:'sprite', at:[col,row] }  stands the sprite on top of that
              tile (count columns/rows in the map file). hang:[col,row] hangs it from
              the top of that tile. layer: 'back' (behind masonry) | 'mid' (default) |
              'front' (in front of the player) | 'fg' (black foreground silhouette).
              cut:true punches the sprite's shape out of the back wall.
   · lights = extra lights { at:[col,row], r:radius, c:'fire'|'forge'|'ember'|'rune'|'dim'|'gold'|'cold' }
   Braziers, hearths, the forge and lamps bring their own flame + light (see KIT in 45-world.js).
   ========================================================================== */
const TOTAL_NOTES = 20;
const F = 35;                                   // workshop: row of the forge floor
const arcade = (col, big) => [                 // an open bay in the wall + its stone ring
  { s: big ? 'cut_arch_big' : 'cut_arch_mid', at: [col, F], cut: true },
  { s: big ? 'arch_big' : 'arch_mid', at: [col, F], layer: 'back' }
];

const ZONES = {
  workshop: {
    id: 'workshop', name: 'zone.workshop.name',
    sub: 'zone.workshop.sub',
    mood: 'workshop', map: 'workshop', atlas: 'workshop', lut: 'identity',
    ambient: [56, 42, 62],                      // colour of the darkness (multiplied over the unlit world)
    sky: ['void1', 'ember0', 'ember1', 'ember0', 'void1'],
    parallax: [                                 // back to front. fx/fy = scroll factors, y = top edge on screen (px)
      { img: 'px_far', fx: .05, fy: .02, y: 6 },
      { img: 'px_l4', fx: .14, fy: .05, y: -34 },
      { img: 'px_l3', fx: .30, fy: .10, y: -58, dark: 1 },
      { img: 'px_l2', fx: .52, fy: .18, y: -14, dark: 2 }
    ],
    spawn: { left: [5, F], right: [150, F] },
    /* the first hollows a visitor meets (68-enemies.js): one on the first screen, one at the forge, one by the forest door */
    foes: [['warden', 30], ['stalker', 66], ['warden', 120], ['brute', 148]],
    props: [
      { t: 'note', at: [24, 33], id: 'w1', dlg: 'note_workshop_1', label: 'ui.read_the_inscription' },
      { t: 'npc', at: [54, F], look: 'librarian', name: 'who.librarian', dlg: 'librarian_workshop', id: 'lib_w' },
      { t: 'note', at: [59, F], id: 'w2', dlg: 'note_workshop_2', label: 'ui.read_the_wall', dy: 34, spr: 'walltext' },
      { t: 'note', at: [71, 23], id: 'w3', dlg: 'note_workshop_3', label: 'ui.read_the_scratches', dy: 8 },
      { t: 'note', at: [131, F], id: 'w4', dlg: 'note_workshop_4', label: 'ui.read_the_pilgrims_tablet' },
      { t: 'npc', at: [137, F], look: 'wanderer', name: 'who.wanderer', dlg: 'wanderer_forest', id: 'wander_link' },
      { t: 'door', at: [154, F], side: 'right', to: 'forest', name: 'zone.forest.name' }
    ],
    decor: [
      /* ---- screen 1 · wake by the rune-hearth, walk, step, jump, read ---- */
      ...arcade(8, false),
      { s: 'hearth', at: [5, F] },
      { s: 'signboard', at: [10, F] },                 // the notice at the start; its words are in src/js/53-sign.js
      { s: 'pillar', at: [13, F], layer: 'back' },
      { s: 'toolrack', at: [18, F], dy: -62, layer: 'back' },
      { s: 'barrel', at: [19, F] }, { s: 'crate_s', at: [20, F], dx: 4 },
      { s: 'brazier', at: [27, 33], dx: -4 },
      { s: 'blueprint', at: [23, 33], dy: -52, layer: 'back' },
      ...arcade(33, true),
      { s: 'chain_hook', hang: [31, 22], dy: 8 }, { s: 'chain_long', hang: [35, 22], dy: 8 },
      { s: 'pillar', at: [39, F], layer: 'back' },
      /* ---- screen 2 · the forge (hero piece), the Librarian, the pit ---- */
      { s: 'forge_chimney', at: [45, 23], layer: 'back' }, { s: 'forge_chimney', at: [45, 21], layer: 'back' }, { s: 'forge_chimney', at: [45, 19], layer: 'back' }, { s: 'forge_chimney', at: [45, 17], layer: 'back' },
      { s: 'forge', at: [45, F], layer: 'back' },
      { s: 'bellows', at: [39, F], dx: 10, anim: 5 },
      { s: 'anvil', at: [51, F] },
      { s: 'gear_l', px: [50 * 16, 23 * 16 + 4], layer: 'back', anim: 4 }, { s: 'gear_m', px: [50 * 16 + 61, 23 * 16 + 50], layer: 'back', anim: 6, rev: 1 },
      { s: 'shelf', at: [30, F], dy: -150, layer: 'back' },
      { s: 'crate', at: [56, F] }, { s: 'crate_s', at: [57, F], dx: 6 },
      { s: 'brazier', at: [62, F], dx: -2 },
      { s: 'pipe_v', px: [68 * 16, 24 * 16], layer: 'back' }, { s: 'pipe_v', px: [68 * 16, 26 * 16], layer: 'back' },
      { s: 'cagelamp', hang: [73, 20] },
      { s: 'window', at: [79, F], dy: -40, layer: 'back' },
      { s: 'gear_xl', px: [84 * 16 + 10, 26 * 16], layer: 'back', anim: 3 },
      /* ---- screen 3 · over the engine block, the gantry above the great hall ---- */
      { s: 'hearth', at: [87, 25] },
      { s: 'statue_gear', at: [90, 25], dx: 4, layer: 'back' },
      { s: 'brazier', at: [112, 25], dx: -2 },
      { s: 'statue_anvil', at: [97, F], layer: 'back' }, { s: 'brazier', at: [102, F] },
      ...arcade(108, true),
      { s: 'pillar', at: [116, F], layer: 'back' },
      /* ---- screen 4 · the gear-wall and the way out ---- */
      { s: 'brazier', at: [129, F] },
      { s: 'gearwall', at: [143, F], layer: 'back' },
      { s: 'gear_xl', px: [137 * 16, 21 * 16], layer: 'back', anim: 3 }, { s: 'gear_l', px: [143 * 16 + 4, 26 * 16 + 4], layer: 'back', anim: 4, rev: 1 },
      { s: 'gear_brass', px: [140 * 16, 29 * 16], layer: 'back', anim: 6, rev: 1 }, { s: 'gear_m', px: [147 * 16, 22 * 16], layer: 'back', anim: 6 },
      { s: 'brazier', at: [151, F], dx: -8 },
      /* ---- roof trusses on the wall head ---- */
      ...[16, 22, 28, 50, 56, 119, 125, 131].map((c) => ({ s: 'rafter', at: [c, 22], dx: 0, layer: 'back' })),
      /* ---- foreground silhouettes (drawn last, never lit) ---- */
      { s: 'fg_chain', px: [330, 250], layer: 'fg', f: 1.22 }, { s: 'fg_hook', px: [760, 262], layer: 'fg', f: 1.22 },
      { s: 'fg_hook', px: [1210, 262], layer: 'fg', f: 1.22 },
      { s: 'fg_pillar', px: [1277, 268], layer: 'fg', f: 1.3 }, { s: 'fg_chain', px: [1700, 250], layer: 'fg', f: 1.22 }, { s: 'fg_pillar', px: [2290, 268], layer: 'fg', f: 1.3 },
      { s: 'fg_hook', px: [2600, 262], layer: 'fg', f: 1.22 }, { s: 'fg_pillar', px: [3160, 268], layer: 'fg', f: 1.3 }
    ],
    lights: [
      { at: [72, 22], r: 44, c: 'rune', steady: true },
      ...[10, 30, 70, 100, 122, 144].map((c) => ({ at: [c, 27], r: 170, c: 'warm', steady: true }))      // low fill so the masonry reads
    ]
  }
};

/* Defaults for the zones in 49-zones.js. A zone that has no ambient / sky / parallax of its own gets these
   and the Workshop kit recoloured by its zone LUT (TODO_ART: cathedral, repository, arena, room499). */
const PENDING_STYLE = {
  forest:     { ambient: [40, 62, 52], sky: ['void1', 'moss0', 'moss0', 'moss1'] },
  cathedral:  { ambient: [70, 60, 52], sky: ['void1', 'gold0', 'gold0', 'void2'] },
  catacombs:  { ambient: [34, 48, 70], sky: ['void0', 'cold0', 'cold0', 'void1'] },
  repository: { ambient: [50, 46, 66], sky: ['void1', 'stone0', 'stone0', 'rune0'] },
  arena:      { ambient: [92, 76, 122], sky: ['void0', 'void1', 'rune0', 'void1'] },
  room499:    { ambient: [84, 70, 44], sky: ['void1', 'gold0', 'gold0', 'gold1'] }
};
for (const id in PENDING_ZONES) {
  const z = PENDING_ZONES[id];
  ZONES[id] = Object.assign({ parallax: ZONES.workshop.parallax, decor: [], lights: [] }, PENDING_STYLE[id], z);     // what a zone defines itself wins
}
