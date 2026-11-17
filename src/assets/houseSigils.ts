import * as THREE from 'three';

/** Monochrome heraldic masks. Tint, folds, and stitched borders are applied by the cloth shader. */
const ART = {
  stark: {
    shape: [
      // The direwolf's angular muzzle, pinned ears, and swept-back ruff.
      'M8 62 L23 54 L39 51 L46 42 L57 36 L62 14 L75 32 L88 24 L88 41 L102 50 L93 53 L111 63 L102 67 L118 78 L104 79 L117 91 L101 88 L109 102 L94 96 L97 112 L81 101 L79 117 L68 100 L62 109 L53 91 L43 86 L30 88 L17 80 L32 79 L46 72 L34 69 L23 72 L12 68 Z',
    ],
    cut: [
      'M48 51 L65 45 L60 54 L50 56 Z M66 25 L69 39 L63 41 Z',
      'M18 65 L34 62 L54 60 L64 64 L51 66 L39 64 L28 68 Z M35 79 L50 73 L55 76 L44 81 Z',
      'M73 53 L87 48 L84 55 L75 61 Z M72 70 L96 61 L82 72 L91 77 L76 75 L66 82 Z M71 88 L89 82 L86 95 L81 90 L76 94 Z',
    ],
  },
  targaryen: {
    shape: [
      // Cleft wings, an unfurling tail, and three independently silhouetted heads.
      'M61 68 Q39 49 8 43 Q21 57 9 70 Q24 65 34 86 Q38 79 51 92 L64 79 L77 92 Q90 79 94 86 Q104 65 119 70 Q107 57 120 43 Q89 49 67 68 Z',
      'M56 74 Q55 56 61 49 Q66 39 62 32 L50 32 L46 26 L55 22 L59 15 L66 18 L75 14 L73 21 L81 25 L80 32 L71 36 Q73 47 67 57 L70 75 Z',
      'M56 76 Q47 62 36 57 Q29 53 29 41 L19 41 L13 34 L20 31 L22 24 L30 28 L37 25 L36 32 L43 37 L41 42 L36 44 Q38 50 47 52 Q56 57 61 72 Z',
      'M72 76 Q81 62 92 57 Q99 53 99 41 L109 41 L115 34 L108 31 L106 24 L98 28 L91 25 L92 32 L85 37 L87 42 L92 44 Q90 50 81 52 Q72 57 67 72 Z',
      'M55 68 Q70 62 75 76 Q80 88 69 96 Q52 108 57 109 Q68 114 77 103 L82 98 L87 101 L81 108 Q69 125 53 117 Q41 110 52 100 Q64 91 60 84 Q51 85 49 92 L41 93 L46 84 Z',
    ],
    cut: [
      'M24 34 L30 32 L28 36 Z M58 25 L64 23 L62 27 Z M98 32 L104 34 L100 36 Z',
      'M18 51 Q36 54 54 73 L49 74 Q34 63 18 51 Z M110 51 Q92 54 74 73 L79 74 Q94 63 110 51 Z M58 77 Q65 74 72 77 L70 80 L62 79 L58 82 Z',
    ],
  },
  lannister: {
    shape: [
      // The lion rampant: crown-like mane, raised claws, and a forked tail.
      'M62 25 L44 25 L41 21 L44 16 L53 15 L57 10 L64 14 L73 10 L75 16 L84 19 L81 25 L88 31 L82 35 L86 43 L79 43 L83 51 L75 48 Q78 65 70 78 L76 89 L65 94 L54 90 L57 78 L55 68 L51 58 L44 51 L42 43 L48 46 L49 40 L41 37 L46 31 L55 31 Z',
      'M59 45 Q50 43 41 44 L30 35 L31 30 L26 24 L22 27 L23 33 L17 29 L13 32 L18 38 L12 38 L13 43 L22 46 L37 57 L56 58 Z',
      'M59 57 Q47 56 42 64 L30 69 L23 63 L18 64 L20 69 L13 68 L12 73 L20 75 L16 79 L20 82 L29 79 L46 75 L64 70 Z',
      'M58 78 L41 83 L37 99 L25 104 L22 112 L27 116 L42 114 L44 108 L50 96 L65 93 L73 100 L82 110 L96 111 L100 106 L96 102 L87 102 L84 87 L73 78 Z',
      'M70 80 Q91 84 99 69 Q105 58 94 51 Q86 45 92 32 Q96 23 106 23 Q112 23 113 18 L118 22 Q116 31 106 31 Q96 31 99 40 Q100 44 107 45 Q118 45 118 37 L122 40 Q123 52 109 53 Q113 68 101 80 Q90 90 72 86 Z',
    ],
    cut: [
      'M51 21 L59 20 L56 24 L51 24 Z M52 32 L64 28 L64 33 L55 35 Z',
      'M71 23 Q82 33 74 42 Q77 30 71 23 Z M54 44 L64 39 L62 47 L57 52 Z M53 62 Q65 52 71 53 Q70 58 65 61 L57 67 Z',
      'M43 85 Q50 81 54 83 L51 89 L44 92 Z M70 82 L77 87 L78 93 L72 90 Z',
    ],
  },
} as const;

export type House = keyof typeof ART;

export function makeHouseSigil(house: House) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 192;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(canvas.width / 128, canvas.height / 128);
    ctx.fillStyle = '#fff';
    for (const path of ART[house].shape) ctx.fill(new Path2D(path));
    ctx.globalCompositeOperation = 'destination-out';
    for (const path of ART[house].cut) ctx.fill(new Path2D(path));
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.name = `${house} heraldry`;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}
