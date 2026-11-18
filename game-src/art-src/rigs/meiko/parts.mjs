// MEIKO — Seraphic Angel part sprites (ASCII DSL). No baked outline: the rig baker outlines each group
// in warm antique gold (`gold0`), soft sandstone-ivory (`bone1`), and sunlit gold (`gold2`).
//   g G y Y = champagne-gold hair, tiara, stole & wing coverts
//   w W i I = alabaster-ivory seraphic gown & feathers
//   P       = pure celestial starlight white (wingtips, tiara gem, stole runes, eye glint)
//   s S f p = porcelain skin + warm rose blush
//   r R     = sacred rose-ruby heart brooch   ·   v V = luminous violet-silver iris
const mirror = (rows) => rows.map((r) => r.split('').reverse().join(''));

const head = [
  '.....YPY.....',
  '...gyYIYyg...',
  '..GyyYYYyyG..',
  '.GyYIySSyIYg.',
  '.GyYSfSSfSyG.',
  '.GyySSSSffyG.',
  '..GySNOOPfy..',
  '..GySSvVffy..',
  '..GysSpffS...',
  '...GysSSf....',
  '...Gy.sS.....',
  '....y..s.....',
  '....G........',
];

const headBlink = [
  '.....YPY.....',
  '...gyYIYyg...',
  '..GyyYYYyyG..',
  '.GyYIySSyIYg.',
  '.GyYSfSSfSyG.',
  '.GyySSSSffyG.',
  '..GySSfffSy..',
  '..GySSNOOSy..',
  '..GysSpffS...',
  '...GysSSf....',
  '...Gy.sS.....',
  '....y..s.....',
  '....G........',
];

const headSmile = [
  '.....YPY.....',
  '...gyYIYyg...',
  '..GyyYYYyyG..',
  '.GyYIySSyIYg.',
  '.GyYSfSSfSyG.',
  '.GyySNOOPfyG.',
  '..GySSvVffy..',
  '..GysSpffS...',
  '...Gyssrf....',
  '...Gy.sSf....',
  '....y..s.....',
  '....G........',
  '.............',
];

const headUp = [
  '.....YPY.....',
  '...gyYIYyg...',
  '..GyyYSfyyG..',
  '.GyYISNOPfYg.',
  '.GyYSSvVffyG.',
  '.GyysSpffSyG.',
  '..Gy.sSSf.y..',
  '..Gy..sS..y..',
  '..Gy...s.....',
  '...G.........',
  '.............',
  '.............',
  '.............',
];

export default {
  head,
  headBlink,
  headSmile,
  headUp,
  headWorry: headBlink,
  headBack: mirror(head),

  // Grand near seraphic wing (28x30, pivot [25, 19]): distinct 3-tier covert + secondary + primary feather layers!
  wingF: [
    '......PPP...................',
    '....PPIIPPyYY...............',
    '..PPIIIIIPPyYYY.............',
    '.PPIIIiiIIIPyYYY............',
    'PPIIiiWWiiIIPyYYY...........',
    '.PPPiiWWiiiIIPyYYY..........',
    '...PPIIWWiiiIIPyYYY.........',
    '..PPIIIiWWiiiIIPyYYY........',
    '.PPPiiIIiWWiiiIIPyYYg.......',
    '....PPIIIiWWiiiIIPyYYg......',
    '...PPIIIIiiWWiiiIIPyYYg.....',
    '..PPPiiIIIiiWWiiiIIPyYYg....',
    '.....PPIIIIiiWWiiiIIPyYYg...',
    '....PPIIIPIIiiWWiiiIIPyYYg..',
    '...PPPiiIIPIIiiWWiiiIIPyYYg.',
    '......PPIIIPIIiiWWiiiIIPyYYg',
    '.....PPIIIIIPIIiiWWiiiIIyYYG',
    '....PPPiiIIIIPIIiiWWiiiIIyYG',
    '.......PPIIIIIPIIiiWWiiIIyYG',
    '......PPIIIIIIIPIIiiWWiiIIyG',
    '.....PPPiiIIIIIIPIIiWWiiiW..',
    '........PPIIIIIIIPIIWWiiW...',
    '.......PPPiiIIIIIPIIWWiW....',
    '..........PPIIIIIPIIWWi.....',
    '.........PPPiiIIIPIIWW......',
    '............PPIIIPIIW.......',
    '...........PPPiIIPIW........',
    '..............PPiIW.........',
  ],

  // Far seraphic wing (24x22, pivot [21, 18]): layered feather rows behind near wing
  wingB: [
    '.....PPP................',
    '...PPIIPyYY.............',
    '.PPIIIIIPyYYY...........',
    'PPIIIiIIIPyYYY..........',
    '.PPIIiWWiiIPyYY.........',
    '..PPIIiWWiiIPyYY........',
    '.PPPiiIiWWiiIPyYg.......',
    '....PPIIiWWiiIPyYg......',
    '...PPIIIIiWWiiIPyYg.....',
    '..PPPiiIIIiWWiiIPyYg....',
    '.....PPIIIIiWWiiIPyYg...',
    '....PPIIIPIIiWWiiIPyYg..',
    '...PPPiiIIPIIiWWiiIPyYg.',
    '......PPIIIPIIiWWiiIPyYg',
    '.....PPIIIIIPIIWWiiiIyYG',
    '....PPPiiIIIIPIWWiiW....',
    '.......PPIIIIPIWWiiW....',
    '......PPPiiIIPIWWiW.....',
    '.........PPIIPIWWi......',
    '........PPPiIPIW........',
    '...........PPiW.........',
  ],

  // Lower cherubic winglet (15x12, pivot [13, 4])
  cherub: [
    '....PPIIyY.....',
    '..PPIIIIIyYY...',
    'PPIIIIiIIIIyYg.',
    '.PPPiiIIIIIIyYg',
    '...PPIIIIIiIIyG',
    '..PPPiiIIIIWWi.',
    '.....PPIIIWWi..',
    '....PPPiIWW....',
    '.......PPi.....',
  ],

  // Long cascading sunlit golden hair behind shoulders
  hairB: [
    '...gGyyYG....',
    '..gGyyYYYg...',
    '..gGyYIyyg...',
    '.gGyyYYyyyg..',
    '.gGyYIIyyyg..',
    '.gGyyyyyyyg..',
    '.gGyyYIyyyy..',
    '..gGyyyyyyg..',
    '..gGyyYIyyg..',
    '..gGyyyyyy...',
    '...gGyyyyg...',
    '...gGyYyyg...',
    '...gGyyyy....',
    '....gGyyg....',
    '....gGy.y....',
    '.....gG..g...',
  ],

  // Sculpted white-and-gold celestial bodice with ruby-star brooch
  torso: [
    '..yYSSfYy..',
    '.GyYSSSYyG.',
    'GyyIIPIIyyG',
    '.WiIYRPIiW.',
    '.WiIYrIIiW.',
    '.WWiIIIiWW.',
    '..WiIPIiW..',
    '..WiIIIiW..',
    '..WWiIiWW..',
    '..GyyYyyG..',
    '.GyyYPYyyG.',
    '..gGyyyGg..',
    '...gGGGg...',
  ],

  // Long fluted seraphic gown pooling gracefully right down to her golden sandals
  gown: [
    '....gGyyYyyGg......',
    '...WWiIIIIIiWW.....',
    '...WiIIiIiIIiW.....',
    '..WWiIIiIiIIiWW....',
    '..WiIIIiIiIIIiW....',
    '..WiIIwiIiwIIiW....',
    '.WWiIIwiIiwIIiWW...',
    '.WiIIIwiIiwIIIiW...',
    '.WiIIwiiIiiwIIiW...',
    '.WiIIwiIIIiwIIiW...',
    '.WiIIwiIIIiwIIiW...',
    'WWiIIwiIIIiwIIiWW..',
    'WiIIIwiIIIiwIIIiW..',
    'WiIIwiiIPIiiwIIiW..',
    'WiIIwiIIPIIiwIIiW..',
    'WiIIwiIIPIIiwIIiW..',
    'WiIIwiIIIIIiwIIiW..',
    'WiIwwiIIIIIiwwIIW..',
    'WiIwwiIIIIIiwwIIWW.',
    'yYYgyYYyYyYYygYYYg.',
    'GyyYGGyyYyYyyGYyyG.',
    '.gGG..gGyyGg..GGg..',
  ],

  // Sacred golden stole with starlight diamond runes & ruby tassel
  sash: [
    '.yYY.',
    '.GPY.',
    '.gyy.',
    '.yYY.',
    '.GPY.',
    '.gyy.',
    '.yYY.',
    '.GPY.',
    '.gyy.',
    '.yYY.',
    '.GPY.',
    '.gyy.',
    '.yRY.',
    '.GrG.',
    '..Y..',
  ],

  // Draped white-and-gold angel upper sleeve
  arm: [
    'yYY',
    'iII',
    'WiI',
    'WiI',
    'WWi',
    'WW.',
  ],

  // Flowing seraphic bell-sleeve cuff + porcelain hand
  forearm: [
    '.WiI.',
    'WWiIW',
    'WiIIW',
    'WiPIW',
    'GyyYG',
    '.sSf.',
    '.sS..',
  ],

  // Delicate golden sandal peeking beneath the gown hem
  sandal: [
    'sSfy.',
    'GyyYG',
  ],
};
