// MIKU — part sprites (ASCII DSL). Parts carry NO outline: the baker outlines each group selectively.
// Authored facing right, light from top-right.
//   c C q Q = cyan hair/tie/trim (dark -> ice-cyan specular)
//   v V w W = silver sleeveless blouse (dark -> crisp white collar)
//   o d D   = charcoal pleated skirt, headset, detached sleeves & thigh-high stockings
//   r R p   = crimson-magenta square hair-clips, headset ring & "01" mark
//   s S f b = porcelain skin + rosy cheek blush
//   g G     = belt buckle & chain   ·   E = pure white eye catchlight
const mirror = (rows) => rows.map((r) => r.split('').reverse().join(''));

const head = [
  '..CCooqqC...',
  '.CqqooQQqq..',
  'pRQQqoqqQQp.',
  'rRqQqSSqQqR.',
  '.CqCfSSfqC..',
  '.CqooSSffq..',
  '..oRQSHQEq..',
  '..oQoSSQqc..',
  '..vQobfS.c..',
  '..q.sSSf....',
  '..C..sS.....',
  '......s.....',
];

const headBlink = [
  '..CCooqqC...',
  '.CqqooQQqq..',
  'pRQQqoqqQQp.',
  'rRqQqSSqQqR.',
  '.CqCfSSfqC..',
  '.CqooSSffq..',
  '..oRQSSffq..',
  '..oQoSHHHc..',
  '..vQobfS.c..',
  '..q.sSSf....',
  '..C..sS.....',
  '......s.....',
];

const headSing = [
  '..CCooqqC...',
  '.CqqooQQqq..',
  'pRQQqoqqQQp.',
  'rRqQqSSqQqR.',
  '.CqCfSSfqC..',
  '.CqooSHQEq..',
  '..oRQSSQqc..',
  '..oQobSRf...',
  '..vQosrf....',
  '..q..sSf....',
  '..C...s.....',
  '............',
];

const headUp = [
  '..CCooqqC...',
  '.CqqooQQqq..',
  'pRQQqSSfQQp.',
  'rRqCfSHQEqR.',
  '.CqooSSQqc..',
  '..oRQSbfS...',
  '..oQosSSf...',
  '..vQo.sS....',
  '..q....s....',
  '..C.........',
  '............',
  '............',
];

const headWorry = [
  '..CCooqqC...',
  '.CqqooQQqq..',
  'pRQQqoqqQQp.',
  'rRqQqSSqQqR.',
  '.CqCsSSsqC..',
  '.CqooSHQEq..',
  '..oRQSSQqc..',
  '..oQobsSf...',
  '..vQosrS....',
  '..q..sSf....',
  '..C...s.....',
  '............',
];

export default {
  head,
  headBlink,
  headSing,
  headUp,
  headWorry,
  headBack: mirror(head),

  torso: [
    '.WWSSqWW.',
    'WWWSSSwWW',
    '.wWwwwWw.',
    'dwWwWwWwd',
    'dwWwwwWwd',
    '.dVwWwWd.',
    '.oVwWwVo.',
    '.oVwwwVo.',
    '..vVwVv..',
    '..sSSSs..',
    '..ooooo..',
    '..oGGgo..',
  ],

  skirt: [
    '.odGGGdo...',
    '.dDoDDodD..',
    'odDodDodDo.',
    'dDoodDoodDo',
    'dDoodDoodDo',
    'qqQQqqQQqqQ',
  ],

  tie: [
    'CqQ',
    '.qq',
    'oWW',
    '.qQ',
    '.qq',
    '.qQ',
    '.qq',
    '.C.',
  ],

  // Sculpted long cyan twin-tail (front/near side) — sweeping S-curve with ice-cyan sheen & split tips
  tailF: [
    '.....Cqq.',
    '....CQQq.',
    '...CqqQq.',
    '...Cqqqq.',
    '..CqqQqq.',
    '..Cqqqq..',
    '.CqqQqq..',
    '.Cqqqq...',
    '.CqqQq...',
    'Cqqqq....',
    'CqqQq....',
    'Cqqqq....',
    '.Cqqq....',
    '.CqqQq...',
    '.Cqqqq...',
    '..Cqqq...',
    '..Cqqqq..',
    '...Cqqq..',
    '...CqQq..',
    '....cqq..',
    '...cq.q..',
    '..cq...q.',
    '..c....c.',
  ],

  // Far twin-tail — slightly wider sweep behind shoulder
  tailB: [
    '..CC.....',
    '.Cqqc....',
    '.CqQqc...',
    '..Cqqqc..',
    '..Cqqqq..',
    '...CqQq..',
    '...Cqqqq.',
    '....Cqqq.',
    '....CqQq.',
    '....Cqqqq',
    '.....Cqqq',
    '....Cqqqq',
    '....CqQq.',
    '...Cqqqq.',
    '...Cqqq..',
    '..Cqqqc..',
    '..Cqqc...',
    '.Cqq.qc..',
    '.cc...c..',
  ],

  // Bare shoulder + crimson "01" mark + top band of detached sleeve
  arm: [
    'sSf',
    'sRf',
    'sSS',
    'sSs',
    'qqQ',
    'odD',
  ],

  // Flared futuristic detached sleeve with glowing cyan equalizer cuff + hand
  forearm: [
    '.odD.',
    'oodDo',
    'odDDo',
    'odRDo',
    'qQQQq',
    'oqqqo',
    '.sSf.',
    '.sS..',
  ],

  // Zettai-ryouiki thigh-high stocking with cyan top band
  thigh: [
    'sSf',
    'sSf',
    'qQq',
    'odD',
    'odD',
    'odD',
    'odD',
    'od.',
  ],

  // Boot shaft with cyan vertical accent stripe
  shin: [
    'odD',
    'odq',
    'odq',
    'odq',
    'odq',
    'odD',
    'ovV',
    'ov.',
  ],

  // Platform idol boot with cyan sole
  shoe: [
    'ovVw.',
    'ovVVw',
    'qqQQq',
  ],
};
