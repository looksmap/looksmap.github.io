// Anime hair, drawn in head-group coordinates. Each style is built from the same parts: back hair that falls behind
// the body, a cap that sits on the skull with a cut-out for the face, fringe locks that hang over the forehead, a
// jagged highlight ring across the crown, strand lines, and a soft shadow where the hair meets the face.
// Everything is returned as raw SVG layers (see layerSVG in figure.js) so hair can carry its own gradients and clips.
import { CX, spline, mirror, rev } from './rig.js';
import { Z } from './garments.js';
import { shade } from './materials.js';

export const HAIR_COLORS = {
  jet: '#17120F', espresso: '#2F1E16', chestnut: '#5B3A26', caramel: '#8A5A33', honey: '#B8803E',
  blonde: '#D9B46C', platinum: '#E8E1D2', copper: '#B4542A', cherry: '#6F1F2B', rose: '#E6A7C2',
  lavender: '#B5A4D8', silver: '#A9A7AE', ink: '#1B2130', bleach: '#F0E7CC',
};

let seq = 0;
const uid = () => `h${(seq = (seq + 1) % 100000).toString(36)}`;
const f = (n) => Number(n.toFixed(1));
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };

// Light, shadow and line tones for a hair colour. Very dark hair gets a lighter strand line so the locks still read.
function tones(color) {
  const l = lum(color);
  return {
    base: color,
    top: shade(color, l < 0.2 ? 0.14 : 0.1),
    low: shade(color, -0.24),
    back: shade(color, -0.34),
    deep: shade(color, -0.52),
    hi: shade(color, l < 0.2 ? 0.5 : l > 0.75 ? 0.75 : 0.58),
    line: l < 0.16 ? shade(color, 0.3) : shade(color, -0.5),
    edge: l < 0.16 ? shade(color, -0.4) : shade(color, -0.58),
  };
}

// The window the face shows through. Follows the cheek so hair sits against the face, then runs straight down.
function faceOpening(kind, bottom = 150) {
  const top = {
    none: [[145, 88], [147, 62], [161, 47], [180, 43], [199, 47], [213, 62], [215, 88]],
    curtain: [[145, 88], [152, 73], [168, 57], [180, 48], [192, 57], [208, 73], [215, 88]],
    full: [[145.5, 88, 'c'], [145.5, 63, 'c'], [214.5, 63, 'c'], [214.5, 88, 'c']],
    wispy: [[145, 88], [149, 68], [166, 58], [180, 56], [194, 58], [211, 68], [215, 88]],
    side: [[145, 88], [147, 66], [158, 55], [176, 62], [196, 52], [211, 62], [215, 88]],
  }[kind] || [[145, 88], [147, 62], [161, 47], [180, 43], [199, 47], [213, 62], [215, 88]];
  const contour = [[214, 106], [208, 124], [199, 138], [198, 150]];
  const r = contour.filter((p) => p[1] < bottom);
  const last = r[r.length - 1] || [215, 88];
  r.push([last[0], bottom, 'c']);
  return spline([...top, ...r, ...rev(mirror(r))], true, 0.8);
}

// A pointed lock hanging from a root on the hairline to a tip. Returns [filled shape, the two side lines].
function lock(x0, x1, y0, tx, ty, bend = 0) {
  const my = (y0 + ty) / 2;
  const a = `Q${f(x0 + bend - 1.5)},${f(my + 3)} ${f(tx)},${f(ty)}`;
  const b = `Q${f(x1 + bend + 1.5)},${f(my - 1)} ${f(x1)},${f(y0)}`;
  return [`M${f(x0)},${f(y0)} ${a} ${b}Z`, `M${f(x0)},${f(y0)} ${a} ${b}`];
}
const mirrorLock = ([x0, x1, y0, tx, ty, bend = 0]) => [2 * CX - x1, 2 * CX - x0, y0, 2 * CX - tx, ty, -bend];

// Fringe presets: [rootLeft, rootRight, rootY, tipX, tipY, bend].
const SIDE_LOCKS = [[143.5, 150, 84, 149, 121, -2], [209.5, 216.5, 84, 211, 121, 2]];
const FRINGE = {
  none: [],
  full: [[145, 158, 57, 149, 85, -4], [155, 170, 55, 163, 81, -2], [167, 182, 54, 175, 83, -1], [179, 194, 54, 187, 81, 1], [191, 206, 55, 198, 83, 2], [203, 215, 57, 211, 85, 4]],
  wispy: [[149, 158, 58, 152, 81, -3], [159, 170, 53, 165, 77, -2], [171, 179, 52, 176, 80, 0], [182, 191, 52, 186, 79, 0], [191, 202, 53, 196, 77, 2], [202, 211, 58, 208, 82, 3]],
  curtain: [[166, 181, 44, 146, 93, -13], [156, 169, 49, 144, 80, -7], [179, 194, 44, 214, 93, 13], [191, 204, 49, 216, 80, 7]],
  side: [[148, 168, 50, 208, 82, 20], [160, 182, 46, 215, 76, 15], [145, 154, 58, 146.5, 86, -3]],
  pixie: [[150, 170, 47, 200, 80, 16], [162, 184, 43, 211, 73, 13], [146, 156, 56, 148, 88, -4], [178, 196, 42, 215, 64, 8]],
};

// A jagged band of light across the crown: the anime "angel ring".
function ring(yc = 40, half = 27, thick = 6) {
  const up = [], dn = [];
  const n = 13;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = CX - half + 2 * half * t;
    const arc = Math.pow((x - CX) / half, 2) * 13; // lower toward the temples
    up.push(`${f(x)},${f(yc + arc - (i % 2 ? thick * 0.55 : 0))}`);
    dn.push(`${f(x)},${f(yc + arc + thick * 0.5 + (i % 2 ? 0 : thick * 0.7))}`);
  }
  return `M${up.join(' L')} L${dn.reverse().join(' L')}Z`;
}

// Pointed ends along a bottom edge, from the right side to the left.
function tips(xr, xl, y, n, depth = 16) {
  const pts = [];
  for (let i = 0; i <= n * 2; i++) {
    const t = i / (n * 2);
    const d = i % 2 ? depth * (0.7 + 0.3 * (((i * 5) % 7) / 6)) : 0;
    pts.push([xr + (xl - xr) * t, y + d - Math.sin(t * Math.PI) * 0 , 'c']);
  }
  return pts;
}
const strands = (list, t, o = 0.38, w = 0.9) => `<path d="${list.join(' ')}" fill="none" stroke="${t.line}" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
const capOuter = (w = 2, lift = 2) => [[142 - w, 100], [143 - w, 58], [158 - w * 0.6, 33 - lift], [180, 25 - lift], [202 + w * 0.6, 33 - lift], [217 + w, 58], [218 + w, 100]];

/**
 * hair({ style, color }) → layers. Back layers sit behind the body (z hairBack); the front layer sits over the face.
 */
export function hair(p = {}) {
  const { style = 'sleekBun', color = '#17120F' } = p;
  const t = tones(color);
  const id = uid();
  const gFront = `url(#${id}f)`, gBack = `url(#${id}b)`;
  const L = [];
  let bottom = 150;      // lowest y the hair reaches, for the gradients
  let backSVG = '';
  let cap = null;        // { pts, tension, opening, openBottom }
  let fringe = 'none';
  let sideLocks = false;
  let lines = [];        // strand lines on the cap
  let extraFront = '';   // drawn above the cap, below the fringe
  let ringArgs = [40, 27, 6];
  let showRing = true;

  const shape = (d, fill, sw = 1.1, extra = '') => `<path d="${d}" fill="${fill}" stroke="${t.edge}" stroke-width="${sw}" stroke-linejoin="round"${extra}/>`;
  const backShape = (pts, tension = 0.9) => shape(spline(pts, true, tension), gBack);
  const innerShape = (pts, tension = 0.9) => `<path d="${spline(pts, true, tension)}" fill="${gFront}" opacity=".9"/>`;
  const bun = (cx, cy, rx, ry) => `${shape(`M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 ${-rx * 2},0Z`, gFront)}
    <path d="M${f(cx - rx * 0.62)},${f(cy - ry * 0.35)} q${f(rx * 0.6)},${f(-ry * 0.62)} ${f(rx * 1.22)},${f(-ry * 0.05)}" fill="none" stroke="${t.hi}" stroke-width="2.6" stroke-linecap="round" opacity=".55"/>
    ${strands([`M${f(cx - rx * 0.8)},${f(cy + ry * 0.2)} q${f(rx * 0.8)},${f(ry * 0.75)} ${f(rx * 1.6)},0`, `M${f(cx - rx * 0.5)},${f(cy + ry * 0.55)} q${f(rx * 0.5)},${f(ry * 0.4)} ${f(rx)},0`], t, 0.4)}`;
  // slicked-back strand lines from the hairline toward a point
  const slick = (tx, ty) => [-30, -20, -9, 9, 20, 30].map((dx) => `M${f(CX + dx)},${f(46 + Math.abs(dx) * 0.42)} Q${f(CX + dx * 0.8)},${f(36 + Math.abs(dx) * 0.2)} ${f(tx + dx * 0.25)},${f(ty)}`);
  // strands falling from a centre part
  const parted = (reach = 96) => [`M${CX},26 L${CX},47`, ...[-1, 1].flatMap((s) => [`M${CX + s * 3},29 Q${CX + s * 24},36 ${CX + s * 35},${reach - 22}`, `M${CX + s * 2},34 Q${CX + s * 17},42 ${CX + s * 31},${reach - 34}`, `M${CX + s * 6},28 Q${CX + s * 30},32 ${CX + s * 39},${reach}`])];
  const crown = () => [-22, -11, 0, 11, 22].map((dx) => `M${CX + dx * 0.25},27 Q${CX + dx * 0.9},36 ${CX + dx},${f(56 + Math.abs(dx) * 0.1)}`);

  switch (style) {
    case 'sleekBun':
      backSVG = bun(180, 23, 17, 15);
      cap = { pts: [...capOuter(0, 0), [216, 108], [144, 108]], opening: 'none', openBottom: 150 };
      lines = slick(180, 27); ringArgs = [37, 25, 5];
      break;
    case 'slickPony': {
      bottom = 250;
      backSVG = backShape([[190, 26], [212, 20], [236, 42], [246, 96], [244, 168], [234, 236, 'c'], [226, 176], [223, 112], [214, 62], [198, 42]], 0.9)
        + strands(['M214,34 Q238,70 236,168', 'M206,36 Q228,78 230,196', 'M222,30 Q244,66 241,140'], t, 0.45)
        + `<path d="M228,52 Q241,92 239,140" fill="none" stroke="${t.hi}" stroke-width="3" stroke-linecap="round" opacity=".4"/>`
        + `<path d="M196,24 q10,-8 18,2 l-3,10 q-8,-6 -14,-2Z" fill="${t.deep}"/>`;
      cap = { pts: [...capOuter(0, 0), [216, 108], [144, 108]], opening: 'none', openBottom: 150 };
      lines = slick(200, 27); ringArgs = [37, 25, 5];
      break;
    }
    case 'bob':
      bottom = 150;
      backSVG = backShape([[137, 94], [139, 52], [161, 27], [180, 22], [199, 27], [221, 52], [223, 94], [225, 136], [214, 148, 'c'], [204, 138], [180, 124], [156, 138], [146, 148, 'c'], [135, 136]]);
      cap = { pts: [...capOuter(3, 3), [222, 126], [217, 146, 'c'], [208, 136], [198, 141, 'c'], [198, 120], [162, 120], [162, 141, 'c'], [152, 136], [143, 146, 'c'], [138, 126]], opening: 'curtain', openBottom: 150, tension: 0.85 };
      fringe = 'curtain'; lines = parted(118);
      break;
    case 'frenchBob':
      bottom = 138;
      backSVG = backShape([[139, 94], [141, 52], [161, 27], [180, 22], [199, 27], [219, 52], [221, 94], [221, 124], [212, 136, 'c'], [202, 126], [180, 116], [158, 126], [148, 136, 'c'], [139, 124]]);
      cap = { pts: [...capOuter(3, 3), [220, 118], [215, 134, 'c'], [207, 126], [198, 130, 'c'], [198, 114], [162, 114], [162, 130, 'c'], [153, 126], [145, 134, 'c'], [140, 118]], opening: 'full', openBottom: 150, tension: 0.85 };
      fringe = 'full'; lines = crown(); ringArgs = [39, 27, 6];
      break;
    case 'longStraight':
      bottom = 420;
      backSVG = backShape([[135, 94], [137, 52], [160, 26], [180, 20], [200, 26], [223, 52], [225, 94], [235, 240], [239, 396], ...tips(236, 124, 398, 5, 20), [121, 396], [125, 240]], 0.85)
        + innerShape([[150, 120], [146, 240], [149, 384], [180, 394], [211, 384], [214, 240], [210, 120], [180, 128]])
        + strands(['M158,140 Q154,260 160,388', 'M180,134 L180,392', 'M202,140 Q206,260 200,388', 'M228,130 Q236,260 234,392', 'M132,130 Q124,260 126,392'], t, 0.3);
      cap = { pts: [...capOuter(4, 3), [222, 150], [225, 236], [219, 264, 'c'], [213, 244], [209, 150], [151, 150], [147, 244], [141, 264, 'c'], [135, 236], [138, 150]], opening: 'curtain', openBottom: 470, tension: 0.8 };
      // the front strands stay narrow so they frame the outfit instead of hiding it
      fringe = 'curtain'; lines = [...parted(110), 'M142,120 Q138,180 142,238', 'M218,120 Q222,180 218,238'];
      break;
    case 'longWavy': {
      bottom = 440;
      const wav = [];
      for (let i = 0; i <= 10; i++) wav.push([225 + (i % 2 ? 17 : 4) + i * 1.3, 94 + i * 32]);
      backSVG = backShape([[135, 94], [137, 52], [160, 26], [180, 20], [200, 26], [223, 52], ...wav, [226, 432, 'c'], [206, 418], [190, 436, 'c'], [180, 420], [170, 436, 'c'], [154, 418], [134, 432, 'c'], ...rev(mirror(wav))], 1)
        + innerShape([[154, 126], [148, 200], [156, 280], [148, 360], [160, 408], [180, 414], [200, 408], [212, 360], [204, 280], [212, 200], [206, 126], [180, 132]], 1)
        + strands(['M162,150 Q150,230 164,300 Q172,350 160,404', 'M198,150 Q210,230 196,300 Q188,350 200,404', 'M232,120 Q250,200 236,280 Q226,350 242,410', 'M128,120 Q110,200 124,280 Q134,350 118,410'], t, 0.3);
      const fr = [];
      for (let i = 0; i <= 4; i++) fr.push([220 + (i % 2 ? 9 : 2), 98 + i * 36]);
      cap = { pts: [...capOuter(4, 4), ...fr, [217, 274, 'c'], [211, 250], [208, 150], [152, 150], [149, 250], [143, 274, 'c'], ...rev(mirror(fr))], opening: 'curtain', openBottom: 470, tension: 1 };
      fringe = 'curtain'; lines = [...parted(112), 'M142,124 Q133,168 145,206 Q150,232 145,250', 'M218,124 Q227,168 215,206 Q210,232 215,250'];
      break;
    }
    case 'curly': {
      bottom = 190;
      const cloud = (cx, cy, r, n, amp, ky = 0.95, a0 = 0, a1 = Math.PI * 2) => { const pts = []; for (let i = 0; i < n; i++) { const a = a0 + (i / n) * (a1 - a0); const rr = r + (i % 2) * amp; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * ky]); } return pts; };
      const curls = [];
      for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2 + 0.2; const r = 58 + (i % 3) * 9; const x = 180 + Math.cos(a) * r, y = 94 + Math.sin(a) * r * 0.95; if (y > 62 && Math.abs(x - 180) < 30 && y < 132) continue; curls.push(`M${f(x - 5)},${f(y)} q5,-8 10,0 q-5,7 -8,1`); }
      backSVG = backShape(cloud(180, 94, 80, 30, 9), 1) + innerShape(cloud(180, 92, 64, 24, 7), 1) + strands(curls, t, 0.42, 1);
      const fp = [];
      for (let i = 0; i <= 14; i++) { const a = Math.PI + (i / 14) * Math.PI; const r = 53 + (i % 2) * 7; fp.push([180 + Math.cos(a) * r, 86 + Math.sin(a) * r * 1.1]); }
      cap = { pts: [...fp, [224, 104], [218, 116, 'c'], [144, 116, 'c'], [136, 104]], opening: 'wispy', openBottom: 150, tension: 1 };
      extraFront = `<path d="M151,70 q5,-9 10,0 q5,-10 10,-1 q5,-10 10,-1 q5,-9 10,0 q5,-9 10,1 q5,-8 9,2 q-4,-18 -29,-20 q-26,1 -30,19Z" fill="${gFront}" stroke="${t.edge}" stroke-width="1" stroke-linejoin="round"/>`
        + strands(['M156,58 q5,-8 10,0 q-5,6 -7,1', 'M176,50 q5,-8 10,0 q-5,6 -7,1', 'M196,58 q5,-8 10,0 q-5,6 -7,1', 'M166,40 q5,-8 10,0 q-5,6 -7,1', 'M190,40 q5,-8 10,0 q-5,6 -7,1'], t, 0.42, 1);
      showRing = false;
      break;
    }
    case 'braids': {
      bottom = 470;
      backSVG = backShape([[137, 94], [139, 52], [161, 27], [180, 20], [199, 27], [221, 52], [223, 94], [231, 262], [233, 440], ...tips(232, 128, 442, 9, 14), [127, 440], [129, 262]], 0.85);
      const bl = [];
      for (let i = 0; i < 10; i++) { const x = 132 + i * 10.6; bl.push(`M${f(x)},112 q${i % 2 ? 3 : -3},160 ${(i - 4.5) * 1.6},330`); for (let y = 130; y < 436; y += 13) bl.push(`M${f(x - 3.4 + ((i - 4.5) * 1.6 * (y - 112)) / 330)},${y} l3.4,4.5 l3.4,-4.5`); }
      backSVG += strands(bl, t, 0.42, 0.9);
      cap = { pts: [...capOuter(3, 2), [221, 160], [226, 296], [221, 316, 'c'], [215, 302], [211, 150], [149, 150], [145, 302], [139, 316, 'c'], [134, 296], [139, 160]], opening: 'none', openBottom: 470, tension: 0.8 };
      const fl = [];
      for (const s of [-1, 1]) for (const dx of [38]) { fl.push(`M${CX + s * dx},100 Q${CX + s * (dx + 3)},200 ${CX + s * (dx + 1)},304`); for (let y = 112; y < 300; y += 13) fl.push(`M${f(CX + s * dx - 3)},${y} l3,4.5 l3,-4.5`); }
      lines = [...[-28, -17, -6, 6, 17, 28].map((dx) => `M${CX + dx},${f(46 + Math.abs(dx) * 0.4)} Q${CX + dx * 1.05},34 ${CX + dx * 0.7},27`), ...fl];
      ringArgs = [36, 24, 4];
      break;
    }
    case 'wolfCut':
      bottom = 262;
      backSVG = backShape([[135, 94], [137, 52], [160, 26], [180, 20], [200, 26], [223, 52], [225, 94], [234, 160], [238, 204, 'c'], [229, 196], [231, 244, 'c'], [220, 228], [214, 258, 'c'], [204, 236], [180, 228], [156, 236], [146, 258, 'c'], [140, 228], [129, 244, 'c'], [131, 196], [122, 204, 'c'], [126, 160]], 0.8)
        + strands(['M224,120 Q232,160 230,236', 'M136,120 Q128,160 130,236', 'M214,150 Q218,200 214,250', 'M146,150 Q142,200 146,250'], t, 0.35);
      cap = { pts: [...capOuter(5, 4), [224, 128], [226, 150, 'c'], [219, 142], [218, 176, 'c'], [210, 160], [206, 172, 'c'], [201, 150], [159, 150], [154, 172, 'c'], [150, 160], [142, 176, 'c'], [141, 142], [134, 150, 'c'], [136, 128]], opening: 'full', openBottom: 300, tension: 0.8 };
      fringe = 'wispy'; cap.opening = 'wispy'; lines = crown(); sideLocks = true;
      break;
    case 'pixie': {
      bottom = 112;
      const top = [[141, 100], [140, 58], [147, 50, 'c'], [152, 38], [160, 34, 'c'], [168, 25], [180, 20], [192, 24], [199, 30, 'c'], [208, 34], [214, 44, 'c'], [220, 56], [220, 100]];
      backSVG = backShape([[140, 96], [141, 56], [160, 28], [180, 22], [200, 28], [219, 56], [220, 96], [214, 112, 'c'], [180, 104], [146, 112, 'c']]);
      cap = { pts: [...top, [217, 108, 'c'], [212, 96], [148, 96], [143, 108, 'c']], opening: 'side', openBottom: 150, tension: 0.9 };
      fringe = 'pixie'; lines = ['M158,36 Q178,30 204,44', 'M152,46 Q176,36 210,52']; ringArgs = [38, 24, 5];
      break;
    }
    case 'spaceBuns':
      backSVG = bun(148, 33, 16, 15) + bun(212, 33, 16, 15);
      cap = { pts: [...capOuter(1, 0), [217, 108], [143, 108]], opening: 'wispy', openBottom: 150 };
      fringe = 'wispy'; sideLocks = true; lines = [`M${CX},26 L${CX},50`, 'M176,30 Q160,34 150,46', 'M184,30 Q200,34 210,46']; ringArgs = [40, 22, 5];
      break;
    case 'halfUp':
      bottom = 400;
      backSVG = bun(180, 23, 16, 14)
        + backShape([[137, 94], [139, 60], [221, 60], [223, 94], [233, 240], [235, 376], ...tips(232, 128, 378, 5, 18), [125, 376], [127, 240]], 0.85)
        + innerShape([[152, 130], [148, 250], [152, 368], [180, 378], [208, 368], [212, 250], [208, 130], [180, 136]])
        + strands(['M160,144 Q156,260 162,372', 'M200,144 Q204,260 198,372', 'M180,138 L180,376'], t, 0.3);
      cap = { pts: [...capOuter(3, 2), [220, 160], [223, 250], [217, 276, 'c'], [212, 256], [209, 150], [151, 150], [148, 256], [143, 276, 'c'], [137, 250], [140, 160]], opening: 'curtain', openBottom: 470, tension: 0.8 };
      fringe = 'curtain'; lines = [...slick(180, 26).slice(1, 5), 'M143,120 Q139,190 143,250', 'M217,120 Q221,190 217,250']; ringArgs = [38, 25, 5];
      break;
    case 'buzz':
      cap = { pts: [[144, 88], [146, 56], [162, 36], [180, 30], [198, 36], [214, 56], [216, 88], [212, 72], [198, 56], [180, 53], [162, 56], [148, 72]], opening: null, tension: 0.9, flat: true };
      showRing = false;
      break;
    case 'lowBun':
      bottom = 142;
      backSVG = bun(180, 124, 22, 17);
      cap = { pts: [...capOuter(2, 1), [218, 112], [142, 112]], opening: 'curtain', openBottom: 150 };
      fringe = 'curtain'; lines = parted(104); ringArgs = [38, 26, 5];
      break;
    default:
      cap = { pts: [...capOuter(0, 0), [216, 108], [144, 108]], opening: 'none', openBottom: 150 };
  }

  const defs = `<defs>
    <linearGradient id="${id}f" gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="0" y2="${Math.max(150, bottom)}"><stop offset="0" stop-color="${t.top}"/><stop offset=".3" stop-color="${t.base}"/><stop offset="1" stop-color="${t.low}"/></linearGradient>
    <linearGradient id="${id}b" gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="0" y2="${Math.max(150, bottom)}"><stop offset="0" stop-color="${t.low}"/><stop offset=".5" stop-color="${t.back}"/><stop offset="1" stop-color="${t.low}"/></linearGradient>
  </defs>`;
  // The gradients live in the back layer because it is always drawn first.
  L.push({ z: Z.hairBack, raw: `<g class="hair-back">${defs}${backSVG}</g>` });

  if (cap) {
    const capD = spline(cap.pts, true, cap.tension ?? 0.9);
    if (cap.flat) {
      L.push({ z: Z.hairFront, raw: `<path class="hair-front" d="${capD}" fill="${t.base}" opacity=".88"/>` });
      return L;
    }
    const openD = faceOpening(cap.opening, cap.openBottom);
    const locks = [...(FRINGE[fringe] || []), ...(sideLocks ? SIDE_LOCKS : [])].map((a) => lock(...a));
    const front = `<g class="hair-front">
      <defs><clipPath id="${id}c"><path d="${capD}"/></clipPath><clipPath id="${id}o"><path d="${openD}"/></clipPath>
        <mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="-40" width="360" height="560"><rect x="0" y="-40" width="360" height="560" fill="#fff"/><path d="${openD}" fill="#000"/></mask></defs>
      <g clip-path="url(#${id}o)"><g clip-path="url(#${id}c)"><path d="${openD}" fill="none" stroke="#4A1830" stroke-opacity=".2" stroke-width="11"/></g></g>
      <g mask="url(#${id}m)">
        ${shape(capD, gFront, 1.2)}
        <g clip-path="url(#${id}c)">
          ${lines.length ? strands(lines, t) : ''}
          ${showRing ? `<path d="${ring(...ringArgs)}" fill="${t.hi}" opacity=".5"/>` : ''}
          <path d="${openD}" fill="none" stroke="${t.edge}" stroke-width="1.6" opacity=".55"/>
        </g>
      </g>
      ${extraFront}
      ${locks.map(([d]) => `<path d="${d}" fill="#4A1830" opacity=".16" transform="translate(0,2.6)"/>`).join('')}
      ${locks.map(([d, ln]) => `<path d="${d}" fill="${gFront}"/><path d="${ln}" fill="none" stroke="${t.edge}" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" opacity=".8"/>`).join('')}
    </g>`;
    L.push({ z: Z.hairFront, raw: front });
  }
  return L;
}
