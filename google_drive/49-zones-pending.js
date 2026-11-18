/* AUTO-MIGRATED from the legacy build by tools/scaffold-maps.mjs — TODO_ART (M2/M3).
   Geometry, prop ids, dlg keys, door targets and lock rules are carried over 1:1; only the scale
   changed (x * 4/3). These zones borrow the Workshop kit through a zone LUT until authored. */
const PENDING_ZONES = {
  forest: {
    id: 'forest', name: "Frontend Forest", sub: "Where structure became nature",
    mood: 'forest', map: 'forest', atlas: 'workshop', lut: 'forest', pending: true,
    startX: 93,
    props: [
      {t:"note",x:200,id:"f1",dlg:"note_forest_1",label:"Read the bark"},
      {t:"npc",x:693,look:"wanderer",name:"Wanderer of the Canopy",dlg:"wanderer_forest",id:"wanderer"},
      {t:"lamp",x:933,kind:"lantern"},
      {t:"note",x:1320,id:"f2",dlg:"note_forest_2",label:"Read the sign",dy:8},
      {t:"lamp",x:1653,kind:"lantern"},
      {t:"note",x:1493,id:"f3",dlg:"note_forest_3",label:"Read the carved root",dy:0},
      {t:"lamp",x:2133,kind:"lantern"},
      {t:"statue",x:2373,kind:"runeStone"},
      {t:"lamp",x:2667,kind:"lantern"},
      {t:"door",x:53,side:"left",to:"workshop",name:"Forgotten Workshop"},
      {t:"door",x:3120,side:"right",to:"cathedral",name:"Cathedral of Design"}
    ]
  },
  cathedral: {
    id: 'cathedral', name: "Cathedral of Design", sub: "Beauty without purpose is decoration",
    mood: 'cathedral', map: 'cathedral', atlas: 'workshop', lut: 'cathedral', pending: true,
    startX: 93,
    props: [
      {t:"lamp",x:187,kind:"gold"},
      {t:"note",x:440,id:"c1",dlg:"note_cathedral_1",label:"Read the Great Tablet",dy:13},
      {t:"statue",x:627,kind:"saint"},
      {t:"lamp",x:827,kind:"gold"},
      {t:"npc",x:1053,look:"librarian",name:"The Librarian",dlg:"librarian_cathedral",id:"lib_c"},
      {t:"note",x:1640,id:"c2",dlg:"note_cathedral_2",label:"Read the fresco",dy:53},
      {t:"lamp",x:1333,kind:"gold"},
      {t:"statue",x:1507,kind:"saint"},
      {t:"lamp",x:1973,kind:"gold"},
      {t:"note",x:2267,id:"c3",dlg:"note_cathedral_3",label:"Read the acolyte's note"},
      {t:"lamp",x:2507,kind:"gold"},
      {t:"statue",x:2707,kind:"saint"},
      {t:"lamp",x:3067,kind:"gold"},
      {t:"door",x:53,side:"left",to:"forest",name:"Frontend Forest"},
      {t:"door",x:3253,side:"right",to:"catacombs",name:"Telegram Catacombs"}
    ]
  },
  catacombs: {
    id: 'catacombs', name: "Telegram Catacombs", sub: "Where messages travel without rest",
    mood: 'catacombs', map: 'catacombs', atlas: 'workshop', lut: 'catacombs', pending: true,
    startX: 93,
    props: [
      {t:"lamp",x:147,kind:"blue"},
      {t:"note",x:333,id:"t1",dlg:"note_catacomb_1",label:"Read the etching",dy:24},
      {t:"lamp",x:747,kind:"blue"},
      {t:"npc",x:1413,look:"keeper",name:"The Candlekeeper",dlg:"candlekeeper",id:"candle"},
      {t:"lamp",x:1147,kind:"brazier"},
      {t:"lamp",x:1867,kind:"blue"},
      {t:"note",x:2080,id:"t2",dlg:"note_catacomb_2",label:"Read the furnace wall",dy:27},
      {t:"lamp",x:2533,kind:"blue"},
      {t:"note",x:2613,id:"t3",dlg:"note_catacomb_3",label:"Open the secret panel",dy:37},
      {t:"statue",x:2853,kind:"valve"},
      {t:"door",x:53,side:"left",to:"cathedral",name:"Cathedral of Design"},
      {t:"door",x:2987,side:"right",to:"repository",name:"Repository of Lost Creations"}
    ]
  },
  repository: {
    id: 'repository', name: "Repository of Lost Creations", sub: "The graveyard of unfinished ambition",
    mood: 'repository', map: 'repository', atlas: 'workshop', lut: 'repository', pending: true,
    startX: 93,
    props: [
      {t:"note",x:307,id:"r1",dlg:"note_repo_1",label:"Read the chalk",dy:13},
      {t:"npc",x:827,look:"bot",name:"Forgotten Bot",dlg:"bot_repo",id:"bot"},
      {t:"lamp",x:560,kind:"violet"},
      {t:"note",x:1173,id:"r2",dlg:"note_repo_2",label:"Read the fragment",dy:45},
      {t:"note",x:1240,id:"r3",dlg:"note_repo_3",label:"Read the fragment",dy:45},
      {t:"note",x:1307,id:"r4",dlg:"note_repo_4",label:"Read the fragment",dy:45},
      {t:"npc",x:1573,look:"shroud",name:"Sleeping Prototype",dlg:"proto_repo",id:"proto"},
      {t:"lamp",x:1440,kind:"violet"},
      {t:"npc",x:2267,look:"shroud",name:"Endless Refactor",dlg:"refactor_repo",id:"refactor"},
      {t:"lamp",x:2027,kind:"violet"},
      {t:"note",x:2773,id:"r5",dlg:"note_repo_5",label:"Read the Archive Wall",dy:29},
      {t:"lamp",x:3013,kind:"violet"},
      {t:"door",x:53,side:"left",to:"catacombs",name:"Telegram Catacombs"},
      {t:"gate",x:3360,to:"arena",name:"Throne of the Rune Architect",dlg:"gate_arena"}
    ]
  },
  arena: {
    id: 'arena', name: "Throne of the Rune Architect", sub: "Ancient technology and magic, merged",
    mood: 'arena', map: 'arena', atlas: 'workshop', lut: 'arena', pending: true, lockCam: true,
    startX: 144, bossX: 443,
    props: [
      {t:"throne",x:443},
      {t:"note",x:248,id:"a1",dlg:"note_arena_1",label:"Read the throne",dy:0},
      {t:"door",x:53,side:"left",to:"repository",name:"Repository"},
      {t:"door",x:632,side:"right",to:"room499",name:"Chamber 499",locked:"mercy",lockDlg:"sealed_contact"}
    ]
  },
  room499: {
    id: 'room499', name: "Chamber 499", sub: "Salary Negotiation Chamber",
    mood: 'room499', map: 'room499', atlas: 'workshop', lut: 'room499', pending: true, lockCam: true,
    startX: 160,
    props: [
      {t:"npc",x:387,look:"goblin",name:"Budget Goblin",dlg:"goblin_intro",id:"goblin"},
      {t:"lamp",x:187,kind:"gold"},
      {t:"lamp",x:587,kind:"gold"},
      {t:"note",x:627,id:"s1",dlg:"goblin_after",label:"Read the ledger",dy:5},
      {t:"door",x:56,side:"left",to:"arena",name:"Throne"}
    ]
  },
};
