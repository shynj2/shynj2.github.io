// HALLS OF THE MACHINE MIND PARALLAX — 4 seamless cyber-catacomb depth planes:
//   px_far (384x280) distant neural monoliths & skyward data-spires
//   px_l4  (480x310) vaulted conduit aqueducts & distant server-ribs
//   px_l3  (512x320) towering neural-arch galleries with glowing cyan nodes
//   px_l2  (640x340) near basalt buttresses, hanging cables & data-bus conduits
// Sized cleanly within verify.mjs's 64 MB decoded-atlas budget!
import { Img, c, hash2, dith } from '../../../tools/lib/pix.mjs';

const V0 = c('void0'), V1 = c('void1'), V2 = c('void2');
const s0 = c('stone0'), s1 = c('stone1'), s2 = c('stone2');
const i0 = c('iron0'), i1 = c('iron1'), i2 = c('iron2');
const c0 = c('cold0'), c1 = c('cold1'), c2 = c('cold2'), c3 = c('cold3'), c4 = c('cold4');
const r1 = c('rune1'), r3 = c('rune3');

export default function parallax() {
  const L = {};

  // 1 · FAR (384x280): Distant neural monoliths rising out of cold subterranean mist
  {
    const W = 384, H = 280, im = new Img(W, H);
    im.rect(0, 0, W, H, V0);
    // Dithered subterranean glow from below
    for (let y = 120; y < H; y++) for (let x = 0; x < W; x++) {
      if (dith(x, y, (y - 120) / 210)) im.set(x, y, c0);
    }
    // Distant monolith towers (seamless in W)
    const towers = [[18, 26, 44], [62, 18, 78], [108, 34, 28], [164, 22, 64], [214, 30, 38], [268, 20, 86], [318, 36, 34], [364, 16, 70]];
    for (const [tx, tw, ty] of towers) {
      for (let y = ty; y < H; y++) for (let dx = 0; dx < tw; dx++) {
        const x = (tx + dx) % W;
        im.set(x, y, dx === 0 ? c1 : dx > tw - 4 ? V0 : V1);
      }
      // Vertical data-spine slits on monoliths
      const cx = (tx + (tw >> 1)) % W;
      for (let y = ty + 10; y < H - 30; y += 8) {
        im.rect(cx, y, 1, 4, ((y + tx) % 24 === 0) ? c3 : c1);
      }
    }
    L.px_far = im;
  }

  // 2 · L4 (480x310): Multi-tier data-aqueduct arches & horizontal bus bridges
  {
    const W = 480, H = 310, im = new Img(W, H);
    // Upper & middle viaduct decks
    for (const [by, bh, span] of [[78, 12, 60], [176, 16, 80]]) {
      im.rect(0, by, W, bh, V2); im.rect(0, by, W, 2, c1);
      for (let x = 8; x < W; x += 24) im.set(x, by + (bh >> 1), (x % 48 === 8) ? c3 : c1);
      for (let k = 0; k < W / span; k++) {
        const x0 = k * span, pw = Math.round(span * 0.24), cx = x0 + (span >> 1), r = (span - pw) >> 1;
        im.rect(x0, by + bh, pw, H - by - bh, V2);
        im.rect(x0, by + bh, 2, H - by - bh, s0);
        // Semicircular vault spandrels
        for (let y = 0; y < r; y++) for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + (r - y) * (r - y) > r * r) im.set((cx + dx + W) % W, by + bh + y, V2);
        }
      }
    }
    L.px_l4 = im;
  }

  // 3 · L3 (512x320): Towering Cyber-Catacomb Nave Arches & Glowing Neural Lattice Windows
  {
    const W = 512, H = 320, im = new Img(W, H), span = 128;
    for (let k = 0; k < W / span; k++) {
      const x0 = k * span, cx = x0 + 64;
      // Heavy ribbed piers
      im.rect(x0, 0, 26, H, V1); im.rect(x0 + 24, 0, 2, H, i0); im.rect(x0 + 2, 0, 2, H, s0);
      im.rect(x0 + span - 26, 0, 26, H, V1); im.rect(x0 + span - 26, 0, 2, H, s0);
      // Pointed vault arch at top
      for (let y = 0; y < 74; y++) {
        const openHW = Math.round(38 * Math.sqrt(Math.max(0, 1 - Math.pow((74 - y) / 74, 2))));
        for (let x = x0 + 26; x < x0 + span - 26; x++) {
          const d = Math.abs(x - cx);
          if (d > openHW) im.set(x, y, d < openHW + 3 ? i1 : V1);
        }
      }
      // Vertical server-node column inside each pier
      for (let y = 24; y < H - 20; y += 18) {
        im.rect(x0 + 10, y, 6, 10, V0);
        im.set(x0 + 12, y + 3, (y + k * 7) % 3 ? c2 : c4);
        im.set(x0 + 13, y + 6, (y + k * 5) % 4 === 0 ? r3 : c1);
      }
    }
    L.px_l3 = im;
  }

  // 4 · L2 (640x340): Nearest Structural Buttresses & Sweeping Data-Cables
  {
    const W = 640, H = 340, im = new Img(W, H), span = 160;
    for (let k = 0; k < W / span; k++) {
      const x0 = k * span;
      // Foreground-adjacent dark steel-stone buttress
      im.rect(x0, 0, 22, H, V0);
      im.rect(x0 + 20, 0, 2, H, i0);
      for (let y = 40; y < H; y += 56) {
        im.rect(x0 - 2 < 0 ? 0 : x0, y, 24, 5, i0);
        im.set(x0 + 18, y + 2, c2);
      }
      // Sweeping catenary data-cables across the open bay
      for (let cb = 0; cb < 2; cb++) {
        const yBase = 26 + cb * 22, sag = 24 + cb * 10;
        for (let dx = 22; dx < span; dx++) {
          const u = (dx - 22) / (span - 22);
          const cy = Math.round(yBase + Math.sin(u * Math.PI) * sag);
          im.rect((x0 + dx) % W, cy, 1, 2, V0);
          if (dx % 28 === 0) im.set((x0 + dx) % W, cy + 2, c2);
        }
      }
    }
    L.px_l2 = im;
  }

  return L;
}
