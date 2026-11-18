// MAP SCAFFOLD (Round 3) — writes the first version of the forest, cathedral, machine-halls and repository maps.
// The .txt files in art-src/maps are the source of truth afterwards: edit them by hand, one character per tile.
// Running this again would throw hand edits away, so it refuses unless called with --force.
//   node tools/scaffold-maps.mjs --force      then      node tools/reach.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (!process.argv.includes('--force')) { console.log('maps are hand-edited now; pass --force to overwrite them'); process.exit(0); }

function M(w, h, air) {
  const a = Array.from({ length: h }, () => Array(w).fill(air));
  const o = {
    w, h, a,
    set(x, y, ch) { if (x >= 0 && y >= 0 && x < w && y < h) a[y][x] = ch; },
    rect(x0, y0, x1, y1, ch) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) o.set(x, y, ch); return o; },
    ground(x0, x1, row) { return o.rect(x0, row, x1, h - 1, '#'); },          // solid from `row` down
    pit(x0, x1, from = 0, ch = ' ') { for (let y = from; y < h; y++) for (let x = x0; x <= x1; x++) if (a[y][x] === '#') a[y][x] = ch; return o; },   // indoors a pit is a dark shaft (','), outdoors open air
    plat(x0, x1, row, ch = '-') { return o.rect(x0, row, x1, row, ch); },
    write(name, title) {
      const head = [`# ${title} — ${w} x ${h} tiles (16 px). One character = one tile.`,
        "#   '#' solid   '=' one-way platform (wall behind)   '-' one-way platform (open behind)",
        "#   '.' air + back wall   ',' air + dark recessed wall   ' ' air, open to the parallax",
        "#   '1'..'9' sleeping rune platform of that group (see src/js/46-puzzle.js): air until a switch wakes it",
        "# Lines starting with '#' followed by a space are comments. Props and decor live in src/js/49-zones.js."];
      fs.writeFileSync(path.join(ROOT, 'art-src/maps', name + '.txt'), head.join('\n') + '\n' + a.map((r) => r.join('')).join('\n') + '\n');
    }
  };
  return o;
}

/* ---------------- FRONTEND FOREST: open sky, rolling earth, two great trees, a ravine ---------------- */
{
  const m = M(200, 34, ' ');
  m.ground(0, 199, 29);
  m.rect(0, 10, 1, 33, '#').rect(198, 12, 198, 33, '#').rect(199, 8, 199, 33, '#');     // cliffs at both ends
  m.ground(23, 26, 28).ground(27, 38, 27).ground(39, 41, 28);                       // the Wanderer's hill
  m.pit(53, 56);                                                                    // a small stream bed
  m.plat(59, 62, 27).plat(64, 67, 25).plat(60, 63, 23).plat(66, 71, 21).plat(75, 79, 21).plat(83, 87, 22);   // first great tree -> canopy walk -> the sign (f2)
  m.ground(79, 84, 28);
  m.rect(96, 29, 97, 29, ' ').rect(104, 29, 105, 29, ' ').rect(98, 29, 103, 30, ' ');   // the root hollow (f3)
  m.plat(133, 136, 27).plat(138, 141, 25).plat(133, 136, 23).plat(139, 144, 21);    // second great tree: the rune sits at the top
  m.pit(150, 161);                                                                  // the ravine
  m.plat(151, 153, 28, '1').plat(155, 157, 27, '1').plat(159, 161, 28, '1');        // the sleeping bridge
  m.write('forest', 'FRONTEND FOREST');
}
/* ---------------- CATHEDRAL OF DESIGN: one vast nave, a dais, a pulpit, galleries, a broken floor ---------------- */
{
  const m = M(210, 38, '.');
  m.rect(0, 0, 209, 1, '#').rect(0, 0, 1, 37, '#').rect(208, 0, 209, 37, '#').ground(0, 209, 33);
  m.ground(36, 37, 32).ground(38, 43, 31).ground(44, 45, 32);                       // dais
  m.ground(98, 99, 32).ground(100, 101, 31).ground(102, 106, 30).ground(107, 108, 31).ground(109, 110, 32);   // pulpit under the fresco (c2)
  m.plat(128, 131, 31, '=').plat(133, 136, 29, '=').plat(138, 143, 27, '=');        // gallery: the acolyte's note (c3)
  m.plat(150, 152, 31, '1').plat(154, 156, 29, '1').plat(150, 152, 27, '1').plat(154, 157, 25, '1');   // stair woken by the first rune
  m.pit(160, 173, 33, ',');                                                              // the broken floor
  m.plat(161, 163, 32, '2').plat(165, 168, 31, '2').plat(170, 172, 32, '2');        // bridge woken by the second rune
  m.write('cathedral', 'CATHEDRAL OF DESIGN');
}
/* ---------------- HALLS OF THE MACHINE MIND (zone id: catacombs): low conduits, the three-rune prompt, a chasm ---------------- */
{
  const m = M(192, 32, '.');
  m.rect(0, 0, 191, 1, '#').rect(0, 0, 1, 31, '#').rect(190, 0, 191, 31, '#').ground(0, 191, 27);
  m.rect(2, 2, 60, 9, '#').rect(61, 2, 64, 6, '#');                                 // low ceiling at the entrance, then the hall opens
  m.rect(96, 2, 108, 7, '#');                                                       // a hanging engine block
  m.pit(48, 51, 27, ',');                                                                // conduit trench
  m.plat(121, 123, 25, '=').plat(125, 128, 23, '=');                                // up to the ROLE rune
  m.pit(156, 167, 27, ',');
  m.plat(157, 159, 26, '1').plat(161, 163, 25, '1').plat(165, 166, 26, '1');
  m.write('catacombs', 'HALLS OF THE MACHINE MIND');
}
/* ---------------- REPOSITORY OF LOST CREATIONS: shelf stairs, then two branches over the pit ---------------- */
{
  const m = M(217, 34, '.');
  m.rect(0, 0, 216, 1, '#').rect(0, 0, 1, 33, '#').rect(215, 0, 216, 33, '#').ground(0, 216, 29);
  m.plat(70, 74, 27, '=').plat(76, 80, 25, '=').plat(82, 86, 23, '=');              // the three fragments (r2, r3, r4)
  m.pit(134, 147, 29, ',').pit(153, 165, 29, ',');                                            // the pit, with an island in the middle (cols 148-152)
  m.plat(135, 137, 28, '1').plat(139, 141, 27, '1').plat(143, 146, 28, '1');        // branch "main": awake until the lever is thrown
  m.plat(154, 156, 28, '2').plat(158, 160, 27, '2').plat(162, 164, 28, '2');        // branch "dev": awake after it
  m.write('repository', 'REPOSITORY OF LOST CREATIONS');
}
console.log('maps written: forest, cathedral, catacombs, repository');
