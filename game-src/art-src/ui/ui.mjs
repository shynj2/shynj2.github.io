// UI — ornate chiseled obsidian-and-gold 9-slice dialogue/HUD frame (48x48, 16px corners/edges).
import { Img, c, hash2 } from '../../tools/lib/pix.mjs';

export default function ui() {
  const V0 = c('void0'), V1 = c('void1');
  const s0 = c('stone0'), s1 = c('stone1'), s2 = c('stone2'), s3 = c('stone3'), s4 = c('stone4');
  const g1 = c('gold1'), g2 = c('gold2'), g3 = c('gold3'), r4 = c('rune4');
  const t = new Img(48, 48);

  // Interior dark slate fill with subtle carved stone grain
  t.rect(0, 0, 48, 48, V0);
  for (let y = 4; y < 44; y++) for (let x = 4; x < 44; x++) {
    if ((x < 8 || x >= 40 || y < 8 || y >= 40) && hash2(x, y, 13) < .28) t.set(x, y, V1);
  }
  // Double-beveled chiseled stone border + gilded inner trim
  t.rect(0, 0, 48, 1, V0); t.rect(0, 47, 48, 1, V0); t.rect(0, 0, 1, 48, V0); t.rect(47, 0, 1, 48, V0);
  t.rect(1, 1, 46, 2, s2); t.rect(1, 1, 46, 1, s3);
  t.rect(1, 45, 46, 2, s0); t.rect(1, 45, 46, 1, s1);
  t.rect(1, 1, 2, 46, s2); t.rect(1, 1, 1, 46, s3);
  t.rect(45, 1, 2, 46, s0); t.rect(45, 1, 1, 46, s1);
  // Subtle golden inner hairline
  t.rect(3, 3, 42, 1, g1); t.rect(3, 44, 42, 1, s0);
  t.rect(3, 3, 1, 42, g1); t.rect(44, 3, 1, 42, s0);
  // Chipped ashlar notches along straight edges
  for (const k of [19, 28]) { t.set(k, 1, s4); t.set(k + 1, 2, s1); t.set(1, k, s4); t.set(46, k, V0); }

  // Ornate gilded corner brackets with glowing violet rune-studs!
  for (const [cx, cy] of [[0, 0], [39, 0], [0, 39], [39, 39]]) {
    t.rect(cx + 1, cy + 1, 7, 7, g1);
    t.rect(cx + 1, cy + 1, 7, 1, g3);
    t.rect(cx + 1, cy + 1, 1, 7, g2);
    t.rect(cx + 2, cy + 2, 5, 5, s2);
    t.rect(cx + 3, cy + 3, 3, 3, g2);
    t.set(cx + 4, cy + 4, r4);
    t.set(cx + 3, cy + 3, g3);
  }
  return { ui_frame: t };
}
