// Fashion-croquis rig: a 9-head elongated figure in a 360 x 940 viewBox.
// All garment generators derive their geometry from these anchors so that
// every item fits the body, regardless of ease or length.

export const VIEW = { w: 360, h: 940 };
export const CX = 180;

// Torso half-widths by y (interpolated). Starts at the neck base.
const TORSO = [
  [150, 11], // neck base
  [160, 45], // trapezius slope
  [168, 57], // shoulder point
  [186, 55],
  [208, 51], // armpit
  [228, 52], // bust
  [258, 42],
  [292, 32], // natural waist (Barbie)
  [318, 41],
  [338, 49], // high hip
  [372, 55], // hip
  [402, 53], // crotch level
];

// Each leg: [y, centre offset from CX, half-width]
const LEG = [
  [402, 27, 26],
  [440, 27, 25],
  [500, 26, 22],
  [585, 25, 17], // knee
  [650, 24, 18], // calf
  [740, 22, 13],
  [805, 21, 10], // ankle
];

// Each arm: [y, centre offset from CX, half-width]
const ARM = [
  [172, 58, 14], // shoulder joint
  [230, 67, 12.5],
  [300, 75, 10.5], // elbow
  [370, 78, 9],
  [430, 80, 7.5], // wrist
];

function interp(table, y, col) {
  if (y <= table[0][0]) return table[0][col];
  for (let i = 0; i < table.length - 1; i++) {
    const a = table[i], b = table[i + 1];
    if (y >= a[0] && y <= b[0]) {
      const t = (y - a[0]) / (b[0] - a[0]);
      return a[col] + (b[col] - a[col]) * t;
    }
  }
  return table[table.length - 1][col];
}

export const torsoHalf = (y) => interp(TORSO, y, 1);
export const legOff = (y) => interp(LEG, y, 1);
export const legHalf = (y) => interp(LEG, y, 2);
export const armOff = (y) => interp(ARM, y, 1);
export const armHalf = (y) => interp(ARM, y, 2);

// side: -1 = figure's right (viewer's left), +1 = viewer's right
export const legOuter = (side, y, ease = 0) => CX + side * (legOff(y) + legHalf(y) + ease);
export const legInner = (side, y, ease = 0) => CX + side * Math.max(0.5, legOff(y) - legHalf(y) - ease);
export const armOuter = (side, y, ease = 0) => CX + side * (armOff(y) + armHalf(y) + ease);
export const armInner = (side, y, ease = 0) => CX + side * (armOff(y) - armHalf(y) - ease);
export const torsoX = (side, y, ease = 0) => CX + side * (torsoHalf(y) + ease);

export const Y = {
  headTop: 30, chin: 127, neckBase: 150, shoulder: 168, armpit: 208, bust: 228,
  waist: 292, highHip: 338, hip: 372, crotch: 402, knee: 585, calf: 650,
  ankle: 805, sole: 854, elbow: 300, wrist: 430, handEnd: 474,
};

// Catmull-Rom → cubic Bézier path. Points: [x, y] or [x, y, 'c'] for a corner.
export function spline(points, closed = true, tension = 1) {
  const n = points.length;
  if (n < 2) return '';
  const P = (i) => points[((i % n) + n) % n];
  const isCorner = (p) => p[2] === 'c';
  let d = `M${P(0)[0].toFixed(1)},${P(0)[1].toFixed(1)}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = closed || i > 0 ? P(i - 1) : P(i);
    const p1 = P(i), p2 = P(i + 1);
    const p3 = closed || i < n - 2 ? P(i + 2) : P(i + 1);
    let c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension;
    let c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension;
    let c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension;
    let c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension;
    if (isCorner(p1)) { c1x = p1[0]; c1y = p1[1]; }
    if (isCorner(p2)) { c2x = p2[0]; c2y = p2[1]; }
    d += `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return closed ? d + 'Z' : d;
}

export const poly = (points, closed = true) =>
  points.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('') + (closed ? 'Z' : '');

export const mirror = (points) => points.map((p) => [2 * CX - p[0], p[1], p[2]]);
export const rev = (a) => a.slice().reverse();
export const range = (a, b, step) => {
  const out = [];
  if (step <= 0) return out;
  for (let y = a; y < b; y += step) out.push(y);
  out.push(b);
  return out;
};
