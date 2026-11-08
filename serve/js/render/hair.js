import { CX, spline, mirror, rev } from './rig.js';
import { Z } from './garments.js';
import { shade } from './materials.js';

export const HAIR_COLORS = {
  jet: '#17120F', espresso: '#2F1E16', chestnut: '#5B3A26', caramel: '#8A5A33', honey: '#B8803E',
  blonde: '#D9B46C', platinum: '#E8E1D2', copper: '#B4542A', cherry: '#6F1F2B', rose: '#E6A7C2',
  lavender: '#B5A4D8', silver: '#A9A7AE', ink: '#1B2130', bleach: '#F0E7CC',
};

// Face opening, applied as a mask (not evenodd) so it may extend beyond the hair silhouette without filling.
// Follows the face contour so hair sits against the cheeks, then runs straight down between the front strands.
function faceOpening(bangs, bottom = 150) {
  const top = {
    none: [[145, 88], [147, 60], [162, 46], [180, 42], [198, 46], [213, 60], [215, 88]],
    curtain: [[145, 88], [153, 74], [170, 58], [180, 50], [190, 58], [207, 74], [215, 88]],
    full: [[146, 88, 'c'], [146, 70, 'c'], [214, 70, 'c'], [214, 88, 'c']],
    wispy: [[145, 88], [151, 70], [168, 58], [180, 55], [192, 58], [209, 70], [215, 88]],
    side: [[145, 88], [147, 64], [160, 52], [178, 66], [196, 50], [211, 60], [215, 88]],
  }[bangs] || [[145, 88], [147, 60], [162, 46], [180, 42], [198, 46], [213, 60], [215, 88]];
  const contour = [[214, 106], [208, 124], [199, 138], [198, 150]];
  const r = contour.filter((p) => p[1] < bottom);
  const last = r[r.length - 1] || [215, 88];
  r.push([last[0], bottom, 'c']);
  const l = rev(mirror(r));
  return spline([...top, ...r, ...l], true, 0.8);
}

export function hair(p = {}) {
  const { style = 'sleekBun', color = '#17120F' } = p;
  const L = [];
  const under = shade(color, -0.35);
  const hi = shade(color, 0.42);
  const front = (outerPts, bangs, bottom, tension = 0.9) => ({
    z: Z.hairFront, d: spline(outerPts, true, tension), maskD: faceOpening(bangs, bottom), fill: color, hair: true,
  });
  const back = (pts, tension = 0.9) => ({ z: Z.hairBack, d: spline(pts, true, tension), fill: under, hair: true });
  // Highlight strands: tapered light shapes drawn on the front layer.
  const sheen = (pts) => ({ z: Z.hairFront + 0.1, d: spline(pts, true, 0.9), fill: hi, opacity: 0.4, noShade: true, noStroke: true, noDepth: true });
  const crownSheen = sheen([[168, 40], [184, 34], [206, 44], [214, 62], [210, 56], [196, 42], [178, 40]]);
  const headOuter = (w = 0, topLift = 0) => [[142 - w, 98], [144 - w, 56], [160 - w / 2, 34 - topLift], [180, 26 - topLift], [200 + w / 2, 34 - topLift], [216 + w, 56], [218 + w, 98]];

  // Barbie gloss: a bright arc across the crown and a thin catch-light under it
  L.push({ z: Z.hairFront + 0.12, d: spline([[150, 66], [162, 48], [180, 40], [198, 48], [210, 66], [204, 64], [192, 52], [180, 48], [168, 52], [156, 64]], true, 0.9), fill: '#fff', opacity: 0.22, noShade: true, noStroke: true, noDepth: true });
  L.push({ z: Z.hairFront + 0.13, d: 'M156,72 Q180,54 204,72', fill: 'none', stroke: '#fff', sw: 1.4, isLine: true, opacity: 0.35 });
  switch (style) {
    case 'sleekBun':
      L.push({ z: Z.hairBack, d: `M180,30 m-17,0 a17,15 0 1,0 34,0 a17,15 0 1,0 -34,0`, fill: under, hair: true });
      L.push({ z: Z.hairBack + 0.1, d: `M180,30 m-12,0 a12,10 0 1,0 24,0 a12,10 0 1,0 -24,0`, fill: color, hair: true });
      L.push(front([...headOuter(0), [216, 108], [144, 108]], 'none', 150));
      L.push(crownSheen);
      break;
    case 'slickPony':
      L.push(back([[166, 92], [158, 170], [164, 262], [180, 300], [196, 262], [202, 170], [194, 92]], 1));
      L.push({ z: Z.hairBack + 0.1, d: spline([[172, 96], [168, 180], [176, 270], [186, 270], [192, 180], [188, 96]], true, 1), fill: color, hair: true });
      L.push(front([...headOuter(0), [216, 108], [144, 108]], 'none', 150));
      L.push(crownSheen);
      break;
    case 'bob':
      L.push(back([[138, 94], [140, 52], [162, 28], [180, 24], [198, 28], [220, 52], [222, 94], [222, 142], [204, 146], [180, 118], [156, 146], [138, 142]]));
      L.push(front([...headOuter(2), [219, 136], [208, 144], [180, 136], [152, 144], [141, 136]], 'curtain', 150));
      L.push(crownSheen);
      L.push(sheen([[146, 100], [148, 124], [152, 134], [150, 112]]));
      break;
    case 'frenchBob':
      L.push(back([[140, 94], [142, 52], [162, 28], [180, 24], [198, 28], [218, 52], [220, 94], [218, 130], [202, 134], [180, 116], [158, 134], [142, 130]]));
      L.push(front([...headOuter(2), [217, 126], [206, 132], [180, 126], [154, 132], [143, 126]], 'full', 150));
      L.push(crownSheen);
      break;
    case 'longStraight':
      L.push(back([[136, 94], [138, 52], [160, 28], [180, 22], [200, 28], [222, 52], [224, 94], [234, 240], [238, 404], [180, 416], [122, 404], [126, 240]]));
      L.push({ z: Z.hairBack + 0.1, d: spline([[150, 120], [146, 240], [150, 390], [180, 398], [210, 390], [214, 240], [210, 120], [180, 128]], true, 0.9), fill: color, hair: true });
      L.push(front([...headOuter(3), [220, 150], [224, 262], [214, 272], [198, 150], [162, 150], [146, 272], [136, 262], [140, 150]], 'curtain', 470, 0.8));
      L.push(crownSheen);
      L.push(sheen([[142, 110], [140, 190], [146, 250], [150, 190], [148, 110]]));
      break;
    case 'longWavy': {
      const wav = [];
      for (let i = 0; i <= 10; i++) { const y = 94 + i * 32; wav.push([224 + (i % 2 ? 16 : 4) + i * 1.2, y]); }
      const wavL = rev(mirror(wav));
      L.push(back([[136, 94], [138, 52], [160, 28], [180, 22], [200, 28], [222, 52], ...wav, [180, 430], ...wavL], 1));
      const inner = [];
      for (let i = 0; i <= 8; i++) { const y = 120 + i * 34; inner.push([206 + (i % 2 ? 8 : 0), y]); }
      L.push({ z: Z.hairBack + 0.1, d: spline([...mirror(inner), [180, 400], ...rev(inner)], true, 1), fill: color, hair: true });
      const fr = [];
      for (let i = 0; i <= 6; i++) { const y = 98 + i * 36; fr.push([219 + (i % 2 ? 10 : 2), y]); }
      L.push(front([...headOuter(3, 2), ...fr, [206, 322], [198, 150], [162, 150], [154, 322], ...rev(mirror(fr))], 'curtain', 470, 1));
      L.push(crownSheen);
      L.push(sheen([[144, 104], [140, 170], [150, 230], [152, 170], [150, 106]]));
      break;
    }
    case 'curly': {
      const pts = [];
      for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; const r = 80 + (i % 2) * 9; pts.push([180 + Math.cos(a) * r, 94 + Math.sin(a) * r * 0.95]); }
      L.push(back(pts, 1));
      const pts2 = [];
      for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; const r = 64 + (i % 2) * 7; pts2.push([180 + Math.cos(a) * r, 92 + Math.sin(a) * r * 0.95]); }
      L.push({ z: Z.hairBack + 0.1, d: spline(pts2, true, 1), fill: color, hair: true });
      const fp = [];
      for (let i = 0; i <= 14; i++) { const a = Math.PI + (i / 14) * Math.PI; const r = 52 + (i % 2) * 7; fp.push([180 + Math.cos(a) * r, 86 + Math.sin(a) * r * 1.1]); }
      L.push(front([...fp, [216, 112], [144, 112]], 'wispy', 150, 1));
      L.push(crownSheen);
      break;
    }
    case 'braids': {
      L.push(back([[138, 94], [140, 52], [162, 28], [180, 22], [198, 28], [220, 52], [222, 94], [230, 262], [232, 444], [180, 456], [128, 444], [130, 262]]));
      let d = '';
      for (let i = 0; i < 9; i++) { const x = 134 + i * 11.5; d += `M${x},112 q${(i % 2 ? 4 : -4)},160 ${(i - 4) * 2},330 `; }
      L.push({ z: Z.hairBack + 0.1, d, fill: 'none', stroke: hi, sw: 1.3, isLine: true, opacity: 0.18 });
      L.push(front([...headOuter(3), [220, 160], [226, 334], [210, 340], [198, 150], [162, 150], [150, 340], [134, 334], [140, 160]], 'none', 470, 0.8));
      L.push({ z: Z.hairFront + 0.1, d: 'M152,60 q28,-24 56,0', fill: 'none', stroke: hi, sw: 1.2, isLine: true, opacity: 0.3 });
      break;
    }
    case 'wolfCut': {
      L.push(back([[136, 94], [138, 52], [160, 28], [180, 22], [200, 28], [222, 52], [224, 94], [232, 160], [228, 238], [216, 232], [208, 252], [180, 238], [152, 252], [144, 232], [132, 238], [128, 160]], 0.8));
      L.push(front([...headOuter(4, 3), [222, 132], [216, 172], [208, 164], [202, 150], [158, 150], [152, 164], [144, 172], [138, 132]], 'full', 300, 0.8));
      L.push(crownSheen);
      break;
    }
    case 'pixie': {
      const pts = headOuter(2, 4).map((p, i) => [p[0], p[1] - (i % 2 ? 5 : 0)]);
      L.push(front([...pts, [218, 102], [208, 106], [142, 102]], 'side', 150, 1));
      L.push(crownSheen);
      break;
    }
    case 'spaceBuns':
      L.push({ z: Z.hairBack, d: `M148,38 m-15,0 a15,14 0 1,0 30,0 a15,14 0 1,0 -30,0 M212,38 m-15,0 a15,14 0 1,0 30,0 a15,14 0 1,0 -30,0`, fill: under, hair: true });
      L.push({ z: Z.hairBack + 0.1, d: `M148,38 m-10,0 a10,9 0 1,0 20,0 a10,9 0 1,0 -20,0 M212,38 m-10,0 a10,9 0 1,0 20,0 a10,9 0 1,0 -20,0`, fill: color, hair: true });
      L.push(front([...headOuter(0), [216, 108], [144, 108]], 'wispy', 150));
      L.push(crownSheen);
      break;
    case 'halfUp':
      L.push({ z: Z.hairBack, d: `M180,28 m-16,0 a16,14 0 1,0 32,0 a16,14 0 1,0 -32,0`, fill: under, hair: true });
      L.push(back([[138, 94], [140, 62], [220, 62], [222, 94], [232, 240], [234, 384], [180, 396], [126, 384], [128, 240]]));
      L.push({ z: Z.hairBack + 0.1, d: spline([[152, 130], [148, 250], [152, 376], [180, 384], [208, 376], [212, 250], [208, 130], [180, 136]], true, 0.9), fill: color, hair: true });
      L.push(front([...headOuter(2), [219, 160], [222, 284], [208, 290], [198, 150], [162, 150], [152, 290], [138, 284], [141, 160]], 'curtain', 470, 0.8));
      L.push(crownSheen);
      break;
    case 'buzz':
      L.push({ z: Z.hairFront, d: spline([[144, 88], [146, 56], [162, 36], [180, 30], [198, 36], [214, 56], [216, 88], [212, 72], [198, 55], [180, 52], [162, 55], [148, 72]], true, 0.9), fill: color, opacity: 0.9, hair: true });
      break;
    case 'lowBun':
      L.push({ z: Z.hairBack, d: `M180,122 m-21,0 a21,17 0 1,0 42,0 a21,17 0 1,0 -42,0`, fill: under, hair: true });
      L.push({ z: Z.hairBack + 0.1, d: `M180,122 m-15,0 a15,12 0 1,0 30,0 a15,12 0 1,0 -30,0`, fill: color, hair: true });
      L.push(front([...headOuter(1), [217, 112], [143, 112]], 'curtain', 150));
      L.push(crownSheen);
      break;
    default:
      L.push(front([...headOuter(0), [216, 108], [144, 108]], 'none', 150));
  }
  return L;
}
