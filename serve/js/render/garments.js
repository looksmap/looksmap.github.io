// Parametric garment generators. Every function returns an array of layers:
// { z, d, fill, stroke, sw, opacity, extra }  — `extra` is raw SVG drawn after the path.
import { CX, Y, spline, poly, mirror, rev, torsoX, torsoHalf, legOuter, legInner, legOff, legHalf, armOuter, armInner, armOff, armHalf, range } from './rig.js';
import { isLight, shade } from './materials.js';

export const Z = {
  hairBack: 2, backpack: 4, body: 10, hosiery: 20, shoe: 24, bottom: 30, top: 40, sleeve: 41,
  gloves: 43, belt: 45, hood: 48, outer: 50, outerSleeve: 51, bag: 56, neck: 60, scarf: 62,
  hairFront: 70, earring: 72, headwear: 80, eyewear: 85,
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const f1 = (n) => Number(n.toFixed(1));
// Drapery: soft dark fold lines and light catch-lines, drawn above the fill.
const fold = (z, d, o = 0.16, sw = 1.3) => ({ z: z + 0.4, d, fill: 'none', stroke: `rgba(20,14,10,${o})`, sw, isLine: true });
const catchLight = (z, d, o = 0.22, sw = 1.2) => ({ z: z + 0.41, d, fill: 'none', stroke: `rgba(255,255,255,${o})`, sw, isLine: true });
const mirrorD = (d) => d.replace(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g, (m, x, y) => `${f1(2 * CX - parseFloat(x))},${y}`);

/* ---------- construction details: stitches, buttons, bows, ruffles, pockets, lacing, zips, trims ---------- */
const has = (p, k) => Array.isArray(p.details) && p.details.includes(k);
const trimOf = (p) => p.trim || (isLight(p.fill || '#222') ? shade(p.fill || '#222', -0.22) : shade(p.fill || '#222', 0.4));
const stitchC = (p) => p.stitch || (isLight(p.fill || '#222') ? 'rgba(20,16,12,.45)' : 'rgba(255,255,255,.55)');
const stitch = (z, d, c, sw = 0.9) => ({ z: z + 0.42, d, fill: 'none', stroke: c, sw, dash: '2.2 2.2', isLine: true });
const btnRow = (z, pts, r, c = 'rgba(0,0,0,.28)') => {
  let d = '', hl = '';
  for (const [x, y] of pts) { d += `M${f1(x + r)},${f1(y)} a${r},${r} 0 1,0 ${-2 * r},0 a${r},${r} 0 1,0 ${2 * r},0 `; hl += `M${f1(x - r * 0.4)},${f1(y - r * 0.4)} a${r * 0.33},${r * 0.33} 0 1,0 ${r * 0.66},0 a${r * 0.33},${r * 0.33} 0 1,0 ${-r * 0.66},0 `; }
  return [{ z: z + 0.44, d, fill: c, stroke: 'rgba(0,0,0,.35)', sw: 0.7, noShade: true }, { z: z + 0.45, d: hl, fill: 'rgba(255,255,255,.75)', noShade: true, noStroke: true }];
};
const bowShape = (z, x, y, sz, c) => {
  const loops = `M${f1(x)},${f1(y)} c${-sz * 1.1},${-sz * 0.9} ${-sz * 1.3},${sz * 0.8} 0,0 c${sz * 1.1},${-sz * 0.9} ${sz * 1.3},${sz * 0.8} 0,0Z`;
  const tails = `M${f1(x)},${f1(y)} l${-sz * 0.35},${sz * 0.95} l${sz * 0.3},${-sz * 0.1}Z M${f1(x)},${f1(y)} l${sz * 0.35},${sz * 0.95} l${-sz * 0.3},${-sz * 0.1}Z`;
  return [{ z: z + 0.46, d: loops, fill: c, shadeMore: true }, { z: z + 0.45, d: tails, fill: c, shadeMore: true }, { z: z + 0.47, d: `M${f1(x + sz * 0.16)},${f1(y)} a${sz * 0.16},${sz * 0.16} 0 1,0 ${-sz * 0.32},0 a${sz * 0.16},${sz * 0.16} 0 1,0 ${sz * 0.32},0`, fill: shade(c, -0.3), noShade: true, noStroke: true }];
};
// scalloped band along the quadratic (x0,y0) → ctrl (cx,cy) → (x1,y1)
const ruffleAlong = (z, x0, y0, cxp, cyp, x1, y1, amp, c, n = 7) => {
  const pt = (t) => [(1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cxp + t * t * x1, (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cyp + t * t * y1];
  let d = `M${f1(x0)},${f1(y0)}`;
  for (let i = 0; i < n; i++) { const a = pt(i / n), b = pt((i + 1) / n); const m = pt((i + 0.5) / n); d += ` Q${f1(m[0])},${f1(m[1] + amp)} ${f1(b[0])},${f1(b[1])}`; }
  d += ` L${f1(x1)},${f1(y1 - 2)} Q${f1(cxp)},${f1(cyp - 2)} ${f1(x0)},${f1(y0 - 2)}Z`;
  return { z: z + 0.43, d, fill: c, shadeMore: true };
};
const pocketPatch = (z, x, y, w, h, c, sc) => [{ z: z + 0.4, d: `M${f1(x)},${f1(y)} h${w} v${h} q0,4 -4,4 h${-(w - 8)} q-4,0 -4,-4Z`, fill: c, shadeMore: true }, stitch(z, `M${f1(x + 2)},${f1(y + 4)} h${w - 4}`, sc, 0.8)];
const laceCross = (z, x, y0, y1, w, c, n = 5) => { let d = ''; const step = (y1 - y0) / n; for (let i = 0; i < n; i++) { const y = y0 + i * step; d += `M${f1(x - w)},${f1(y)} L${f1(x + w)},${f1(y + step)} M${f1(x + w)},${f1(y)} L${f1(x - w)},${f1(y + step)} `; } return [{ z: z + 0.44, d, fill: 'none', stroke: c, sw: 1.3, isLine: true }, { z: z + 0.43, d: `M${f1(x - w)},${f1(y0)} v${f1(y1 - y0)} M${f1(x + w)},${f1(y0)} v${f1(y1 - y0)}`, fill: 'none', stroke: 'rgba(0,0,0,.25)', sw: 0.8, isLine: true }]; };
const studRow = (z, pts, c = '#D9D4C7') => { let d = ''; for (const [x, y] of pts) d += `M${f1(x + 1.6)},${f1(y)} a1.6,1.6 0 1,0 -3.2,0 a1.6,1.6 0 1,0 3.2,0 `; return { z: z + 0.46, d, fill: c, stroke: 'rgba(0,0,0,.35)', sw: 0.5, noShade: true }; };
const zipLine = (z, x0, y0, x1, y1, c) => { const n = Math.max(3, Math.round(Math.hypot(x1 - x0, y1 - y0) / 6)); let teeth = ''; for (let i = 0; i <= n; i++) { const t = i / n; const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; teeth += `M${f1(x - 1.6)},${f1(y)} h3.2 `; } return [{ z: z + 0.44, d: `M${f1(x0)},${f1(y0)} L${f1(x1)},${f1(y1)}`, fill: 'none', stroke: 'rgba(0,0,0,.4)', sw: 1.6, isLine: true }, { z: z + 0.45, d: teeth, fill: 'none', stroke: c, sw: 1, isLine: true }, { z: z + 0.46, d: `M${f1(x1 - 2)},${f1(y1)} h4 v6 h-4Z`, fill: c, noShade: true }]; };
const trimBand = (z, d, c, sw = 3.5) => ({ z: z + 0.43, d, fill: 'none', stroke: c, sw, isLine: true });


// Effective half-width for a bodice: oversized garments hang straight from the bust.
function bodiceHalf(y, ease) {
  const drape = clamp((ease - 4) / 20, 0, 1);
  const h = torsoHalf(y);
  const hang = Math.max(h, torsoHalf(Y.bust));
  return h + (hang - h) * drape + ease;
}

// ---------- NECKLINES ----------
function necklineSegment(neck, ease) {
  // Returns { start: [x,y] (left), close: points from right start back to left start }
  const L = CX - 15, R = CX + 15, top = 152;
  switch (neck) {
    case 'v': return { start: [L - 2, top], close: [[R + 2, top], [CX, 206, 'c']] };
    case 'deepv': return { start: [L - 3, top], close: [[R + 3, top], [CX, 248, 'c']] };
    case 'scoop': return { start: [L - 6, 156], close: [[R + 6, 156], [CX + 12, 182], [CX, 186], [CX - 12, 182]] };
    case 'square': return { start: [L - 4, 154, 'c'], close: [[R + 4, 154, 'c'], [R + 4, 190, 'c'], [L - 4, 190, 'c']] };
    case 'boat': return { start: [CX - 40, 162], close: [[CX + 40, 162], [CX, 170]] };
    case 'sweetheart': return { start: [L - 8, 160], close: [[R + 8, 160], [R - 2, 182], [CX, 174, 'c'], [L + 2, 182]] };
    case 'turtle': return { start: [CX - 15, 118, 'c'], close: [[CX + 15, 118, 'c'], [CX, 124]] };
    case 'mock': return { start: [CX - 14, 134, 'c'], close: [[CX + 14, 134, 'c'], [CX, 139]] };
    case 'crew':
    default: return { start: [L, top], close: [[R, top], [CX, 165]] };
  }
}

// ---------- BODICE / TOP ----------
export function bodice(p = {}) {
  const {
    neck = 'crew', strap = 'set', hem = 300, ease = 4, hemStyle = 'straight', fill = '#222',
    z = Z.top, slit = 0, waistPinch = false,
  } = p;
  const pts = [];
  let neckClose = null;
  if (strap === 'strapless' || strap === 'cami' || strap === 'halter' || strap === 'off') {
    const top = strap === 'off' ? 190 : 198;
    const e = Math.max(ease, 0);
    const xl = strap === 'off' ? armOuter(-1, 196, 4) : torsoX(-1, top, e);
    if (neck === 'sweetheart') {
      pts.push([xl, top + 2, 'c']);
      neckClose = [[2 * CX - xl, top + 2, 'c'], [CX + 22, top - 10], [CX, top + 6, 'c'], [CX - 22, top - 10]];
    } else {
      pts.push([xl, top, 'c']);
      neckClose = [[2 * CX - xl, top, 'c'], [CX, top + (strap === 'off' ? 8 : 3)]];
    }
    if (strap === 'off') { pts.push([torsoX(-1, 212, e), 214]); }
  } else if (strap === 'tank') {
    pts.push([CX - 24, 158]);
    pts.push([torsoX(-1, 168) - 4, 169]);
    pts.push([torsoX(-1, 192) + 7, 194]);
    pts.push([torsoX(-1, 212) + 1, 214]);
    neckClose = [[CX + 24, 158], [CX + 10, 186], [CX, 190], [CX - 10, 186]];
  } else {
    const ns = necklineSegment(neck, ease);
    pts.push(ns.start);
    neckClose = ns.close;
    pts.push([CX - 44, 161 + ease * 0.08]);
    pts.push([torsoX(-1, 168) + ease * 0.25, 169 + ease * 0.18]);
    if (strap === 'sleeveless') {
      pts.push([torsoX(-1, 190) + 5, 192]);
      pts.push([torsoX(-1, 212) + 1, 214]);
    } else {
      pts.push([torsoX(-1, 210) - ease * 0.7, 214 + ease * 0.1]);
    }
  }
  // side seam
  const ys = [228, 258, 292, 318, 338, 372, 402, 440].filter((y) => y < hem - 6);
  for (const y of ys) {
    let e = ease;
    if (waistPinch && y >= 280 && y <= 305) e = Math.min(ease, 1);
    pts.push([CX - bodiceHalf(y, e), y]);
  }
  const hemHalf = hemStyle === 'peplum' ? bodiceHalf(hem, ease) + 24 : bodiceHalf(hem, ease);
  if (hemStyle === 'peplum') { pts.push([CX - bodiceHalf(292, 0), 294, 'c']); }
  pts.push([CX - hemHalf, hem, 'c']);
  // hem
  const left = pts;
  const hemPts = [];
  if (hemStyle === 'curved') hemPts.push([CX, hem + 9]);
  if (hemStyle === 'hilo') { hemPts.push([CX - 20, hem - 16, 'c'], [CX + 20, hem - 16, 'c']); }
  if (hemStyle === 'corset') { hemPts.push([CX - 10, hem + 4], [CX, hem + 18, 'c'], [CX + 10, hem + 4]); }
  if (hemStyle === 'tie') { hemPts.push([CX - 14, hem - 2], [CX, hem + 14, 'c'], [CX + 14, hem - 2]); }
  if (hemStyle === 'peplum') { hemPts.push([CX - hemHalf / 2, hem + 6], [CX, hem - 2], [CX + hemHalf / 2, hem + 6]); }
  if (hemStyle === 'bodysuit') { hemPts.push([CX - 16, hem - 2], [CX, hem + 10], [CX + 16, hem - 2]); }
  const right = rev(mirror(left));
  const all = [...left, ...hemPts, ...right.slice(0, -1), ...neckClose.slice(1)];
  // right[0..] starts with mirrored hem corner and ends with mirrored neck start (== neckClose[0])
  const layers = [{ z, d: spline(all, true), fill }];
  // folds: under-bust and waist tension for fitted pieces, drape lines for oversized ones
  if (hem > 260 && !p.noFolds) {
    if (ease <= 6) {
      layers.push(fold(z, `M${CX - 30},244 q10,9 24,5 M${CX + 6},249 q14,4 24,-5`, 0.13));
      if (hem > 300) layers.push(fold(z, `M${f1(CX - bodiceHalf(282, ease) + 2)},280 l11,6 M${f1(CX - bodiceHalf(296, ease) + 2)},296 l9,4 M${f1(CX + bodiceHalf(282, ease) - 2)},280 l-11,6 M${f1(CX + bodiceHalf(296, ease) - 2)},296 l-9,4`, 0.14));
    } else {
      layers.push(fold(z, `M${CX - 28},190 q-6,${(hem - 200) / 2} -2,${hem - 206} M${CX + 30},196 q4,${(hem - 206) / 2} 0,${hem - 212}`, 0.11));
      layers.push(catchLight(z, `M${CX - 8},176 q-3,${(hem - 190) / 2} -1,${hem - 198}`, 0.16));
    }
  }
  if (p.collar) {
    const c = (s) => spline([[CX + s * 3, 150], [CX + s * 40, 158, 'c'], [CX + s * 24, 194, 'c'], [CX + s * 4, 172]], true, 0.4);
    layers.push({ z: z + 0.3, d: c(-1), fill, shadeMore: true }, { z: z + 0.3, d: c(1), fill, shadeMore: true });
    layers.push({ z: z + 0.31, d: `M${CX},172 L${CX},${hem - 6}`, fill: 'none', stroke: 'rgba(0,0,0,.25)', sw: 1, isLine: true });
    layers.push(fold(z, `M${CX - 40},158 q22,30 36,38 M${CX + 40},158 q-22,30 -36,38`, 0.2, 1.1));
  }
  if (p.hood) {
    const hd = spline([[CX - 50, 196], [CX - 58, 140], [CX - 40, 62], [CX, 34], [CX + 40, 62], [CX + 58, 140], [CX + 50, 196], [CX, 210]], true, 0.9);
    layers.push({ z: Z.hood, d: hd, fill, shadeMore: true });
    layers.push({ z: z + 0.3, d: `M${CX - 8},200 q8,-14 16,0`, fill: 'none', stroke: 'rgba(0,0,0,.3)', sw: 1.4, isLine: true });
  }
  if (p.buttons) {
    let d = '', hl = '';
    for (let i = 0; i < p.buttons; i++) { const y = 196 + i * ((hem - 230) / Math.max(1, p.buttons - 1)); d += `M${CX + 3},${y.toFixed(1)} a3,3 0 1,0 -6,0 a3,3 0 1,0 6,0 `; hl += `M${CX - 1.2},${(y - 1.2).toFixed(1)} a1,1 0 1,0 2,0 a1,1 0 1,0 -2,0 `; }
    layers.push({ z: z + 0.32, d, fill: 'rgba(0,0,0,.22)', stroke: 'rgba(0,0,0,.35)', sw: 0.8, noShade: true });
    layers.push({ z: z + 0.33, d: hl, fill: 'rgba(255,255,255,.7)', noShade: true, noStroke: true });
  }
  if (Array.isArray(p.details) && p.details.length) {
    const tc = trimOf(p), sc = stitchC(p);
    const topY = strap === 'strapless' || strap === 'cami' || strap === 'halter' || strap === 'off' ? 200 : 160;
    const hw = (y) => bodiceHalf(y, ease);
    if (has(p, 'placket')) { layers.push({ z: z + 0.41, d: `M${CX},${topY + 8} L${CX},${hem - 6}`, fill: 'none', stroke: 'rgba(0,0,0,.25)', sw: 1, isLine: true }); const n = Math.max(3, Math.round((hem - topY - 30) / 26)); layers.push(...btnRow(z, Array.from({ length: n }, (_, i) => [CX, topY + 20 + i * ((hem - topY - 34) / Math.max(1, n - 1))]), 3, tc)); }
    if (has(p, 'zip')) layers.push(...zipLine(z, CX, topY + 4, CX, hem - 8, '#C9CDD4'));
    if (has(p, 'bow')) layers.push(...bowShape(z, CX, topY === 160 ? 164 : 204, 11, tc));
    if (has(p, 'tie')) layers.push(...bowShape(z, CX, hem - 4, 9, fill));
    if (has(p, 'ruffle')) layers.push(ruffleAlong(z, CX - 40, topY + 2, CX, topY + 22, CX + 40, topY + 2, 7, tc, 8));
    if (has(p, 'lacing')) layers.push(...laceCross(z, CX, topY + 24, hem - 22, 9, tc, 5));
    if (has(p, 'pocket')) layers.push(...pocketPatch(z, CX + 12, 224, 24, 20, fill, sc));
    if (has(p, 'darts')) layers.push(fold(z, `M${CX - 22},300 L${CX - 16},254 M${CX + 22},300 L${CX + 16},254`, 0.22, 1));
    if (has(p, 'topstitch')) layers.push(stitch(z, `M${f1(CX - hw(hem - 6) + 3)},${hem - 6} L${f1(CX + hw(hem - 6) - 3)},${hem - 6}`, sc));
    if (has(p, 'trim')) { layers.push(trimBand(z, `M${CX - 38},${topY + 2} Q${CX},${topY + 26} ${CX + 38},${topY + 2}`, tc, 3)); layers.push(trimBand(z, `M${f1(CX - hw(hem) + 2)},${hem - 1} L${f1(CX + hw(hem) - 2)},${hem - 1}`, tc, 3)); }
    if (has(p, 'sailor')) layers.push({ z: z + 0.42, d: spline([[CX - 4, 156], [CX - 44, 160, 'c'], [CX - 38, 212, 'c'], [CX, 196], [CX + 38, 212, 'c'], [CX + 44, 160, 'c'], [CX + 4, 156]], true, 0.5), fill: tc, shadeMore: true });
  }
  if (strap === 'cami') {
    const xl = torsoX(-1, 198, Math.max(ease, 0));
    layers.push({ z: z + 0.1, d: `M${xl + 10},199 L${CX - 40},163 M${2 * CX - xl - 10},199 L${CX + 40},163`, fill: 'none', stroke: fill, sw: 2.6, isLine: true });
  }
  if (strap === 'halter') {
    const xl = torsoX(-1, 198, Math.max(ease, 0));
    layers.push({ z: z + 0.1, d: `M${xl + 14},199 L${CX - 9},136 L${CX + 9},136 L${2 * CX - xl - 14},199`, fill: 'none', stroke: fill, sw: 4, isLine: true });
  }
  return layers;
}

// ---------- SLEEVES ----------
export function sleeve(p = {}) {
  const { type = 'long', ease = 0, fill = '#222', z = Z.sleeve, dropped = 0, both = true, cap = null } = p;
  const ends = { cap: 204, short: 252, elbow: 302, three: 372, long: 434, oversized: 442, puff: 246, bell: 434, bishop: 434, puffLong: 434, balloon: 400 };
  const end = ends[type] || 434;
  const mk = (side) => {
    const pts = [];
    const e = ease + (type === 'oversized' ? 8 : 0);
    pts.push([CX + side * 46, cap ? 160 : 163]);
    if (cap) pts.push([CX + side * cap[0], cap[1]]);
    else pts.push([armOuter(side, 172, e) - side * 1, 166 + dropped * 0.6]);
    const ys = range(cap ? 212 : 200, end, 34).filter((y) => y < end - 4);
    for (const y of ys) {
      let bulge = 0;
      if (type === 'puff') bulge = 14 * Math.sin(((y - 166) / (end - 166)) * Math.PI);
      if (type === 'bishop' || type === 'balloon') bulge = 9 * Math.sin(((y - 166) / (end - 166)) * Math.PI) + (type === 'balloon' ? 6 : 0);
      if (type === 'bell') bulge = Math.max(0, (y - 300) / 134) * 18;
      if (type === 'puffLong') bulge = y < 260 ? 12 * Math.sin(((y - 166) / 94) * Math.PI) : 0;
      pts.push([armOuter(side, y, e + bulge), y]);
    }
    const cuffGather = type === 'puff' || type === 'bishop' || type === 'puffLong' || type === 'balloon' ? -1 : 0;
    const bellE = type === 'bell' ? 18 : 0;
    pts.push([armOuter(side, end, e + cuffGather + bellE), end, 'c']);
    pts.push([armInner(side, end, e + cuffGather + bellE), end, 'c']);
    for (const y of rev(ys)) {
      let bulge = 0;
      if (type === 'puff') bulge = 10 * Math.sin(((y - 166) / (end - 166)) * Math.PI);
      if (type === 'bishop' || type === 'balloon') bulge = 6 * Math.sin(((y - 166) / (end - 166)) * Math.PI);
      if (type === 'bell') bulge = Math.max(0, (y - 300) / 134) * 14;
      if (y > 212) pts.push([armInner(side, y, e + bulge), y]);
    }
    pts.push([torsoX(side, 212) - side * 1, 214]);
    pts.push([CX + side * 50, 182]);
    return spline(pts, true);
  };
  const out = [{ z, d: mk(-1), fill }];
  if (both) out.push({ z, d: mk(1), fill });
  if (end >= 370) {
    for (const s of both ? [-1, 1] : [-1]) {
      const xi = armInner(s, 300, ease);
      out.push(fold(z, `M${f1(xi)},292 q${s * -7},5 ${s * -13},1 M${f1(xi)},306 q${s * -7},5 ${s * -12},0`, 0.15, 1.1));
      out.push(fold(z, `M${f1(armOuter(s, end - 10, ease))},${end - 10} L${f1(armInner(s, end - 10, ease))},${end - 10}`, 0.18, 1));
      out.push(catchLight(z, `M${f1(armOuter(s, 200, ease) - s * 3)},200 q${s * 2},100 ${s * 1},${end - 230}`, 0.16, 1.2));
    }
  }
  return out;
}

// ---------- SKIRT ----------
export function skirt(p = {}) {
  const { waist = 292, hem = 585, shape = 'a', ease = 2, fill = '#222', z = Z.bottom, slit = 0, pleats = 0, hemStyle = 'straight', band = true } = p;
  const flare = { pencil: -0.02, straight: 0.03, a: 0.28, full: 0.55, tulip: 0.0, mermaid: 0, tiered: 0.4, bubble: 0.1 }[shape] ?? 0.25;
  const pts = [];
  pts.push([CX - bodiceHalf(waist, ease), waist, 'c']);
  for (const y of [318, 338, 372].filter((y) => y > waist && y < hem - 10)) pts.push([CX - bodiceHalf(y, ease), y]);
  const hipY = Math.max(waist, 372);
  const hipHalf = bodiceHalf(hipY, ease);
  const len = hem - hipY;
  const mids = range(hipY, hem, 60).slice(1, -1);
  for (const y of mids) {
    const t = (y - hipY) / len;
    let half = hipHalf + flare * (y - hipY);
    if (shape === 'tulip') half = hipHalf + 22 * Math.sin(t * Math.PI);
    if (shape === 'bubble') half = hipHalf + 26 * Math.sin(t * Math.PI) + 4 * t;
    if (shape === 'mermaid') half = y < Y.knee ? hipHalf - 4 * t : hipHalf - 4 + Math.max(0, (y - Y.knee) / (hem - Y.knee)) ** 1.6 * 70;
    pts.push([CX - half, y]);
  }
  let hemHalf = hipHalf + flare * len;
  if (shape === 'tulip') hemHalf = hipHalf - 4;
  if (shape === 'bubble') hemHalf = hipHalf - 2;
  if (shape === 'mermaid') hemHalf = hipHalf - 4 + 70;
  pts.push([CX - hemHalf, hem, 'c']);
  const hemPts = [];
  if (hemStyle === 'curved' || shape === 'full' || shape === 'mermaid') hemPts.push([CX, hem + (shape === 'full' ? 14 : 8)]);
  if (hemStyle === 'asym') { pts[pts.length - 1] = [CX - hemHalf, hem - 70, 'c']; hemPts.push([CX - 10, hem - 20]); }
  if (hemStyle === 'hanky') hemPts.push([CX - hemHalf / 2, hem - 24, 'c'], [CX, hem + 18, 'c'], [CX + hemHalf / 2, hem - 24, 'c']);
  if (slit) hemPts.push([CX + 4, hem, 'c'], [CX + 7, slit, 'c'], [CX + 11, hem, 'c']);
  const right = rev(mirror(pts));
  const all = [...pts, ...hemPts, ...right];
  const layers = [{ z, d: spline(all, true), fill }];
  if (pleats) {
    const n = pleats;
    let dark = '', light = '', lines = '';
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n;
      const xa0 = CX - hipHalf + 2 * hipHalf * t0, xa1 = CX - hipHalf + 2 * hipHalf * t1;
      const xb0 = CX - hemHalf + 2 * hemHalf * t0, xb1 = CX - hemHalf + 2 * hemHalf * t1;
      const quad = `M${f1(xa0)},${hipY + 2} L${f1(xa1)},${hipY + 2} L${f1(xb1)},${hem + 2} L${f1(xb0)},${hem + 2}Z `;
      if (i % 2) dark += quad; else light += quad;
      if (i) lines += `M${f1(xa0)},${hipY + 4} L${f1(xb0)},${hem} `;
    }
    layers.push({ z: z + 0.1, d: dark, fill: 'rgba(0,0,0,.11)', noShade: true, noStroke: true });
    layers.push({ z: z + 0.1, d: light, fill: 'rgba(255,255,255,.08)', noShade: true, noStroke: true });
    layers.push({ z: z + 0.12, d: lines, fill: 'none', stroke: 'rgba(0,0,0,.2)', sw: 0.9, isLine: true });
  } else if (['a', 'full', 'tiered'].includes(shape) && len > 120) {
    let d = '';
    for (const t of [-0.55, -0.2, 0.2, 0.55]) {
      const x0 = CX + hipHalf * t * 0.9, x1 = CX + hemHalf * t;
      d += `M${f1(x0)},${hipY + 14} Q${f1((x0 + x1) / 2 + t * 6)},${hipY + len * 0.55} ${f1(x1)},${hem - 6} `;
    }
    layers.push(fold(z, d, 0.11, 1.3));
    layers.push(catchLight(z, `M${f1(CX - hipHalf * 0.38)},${hipY + 20} Q${f1(CX - hemHalf * 0.36)},${hipY + len * 0.6} ${f1(CX - hemHalf * 0.4)},${hem - 10}`, 0.14, 1.6));
  } else if (shape === 'pencil' || shape === 'straight') {
    layers.push(fold(z, `M${f1(CX - hipHalf + 3)},388 q18,8 38,3 M${f1(CX + hipHalf - 3)},388 q-18,8 -38,3`, 0.12));
    if (len > 200) layers.push(catchLight(z, `M${f1(CX - hipHalf * 0.5)},${hipY + 30} L${f1(CX - hemHalf * 0.5)},${hem - 16}`, 0.12, 1.4));
  }
  if (shape === 'tiered') {
    let d = '';
    for (const t of [0.35, 0.68]) { const y = hipY + len * t; const h = hipHalf + flare * (y - hipY); d += `M${f1(CX - h)},${f1(y)} Q${CX},${f1(y + 10)} ${f1(CX + h)},${f1(y)} `; }
    layers.push(fold(z, d, 0.2, 1.2));
  }
  if (Array.isArray(p.details) && p.details.length) {
    const tc = trimOf(p), sc = stitchC(p);
    if (has(p, 'ruffleHem')) layers.push(ruffleAlong(z, CX - hemHalf + 2, hem - 2, CX, hem + 12, CX + hemHalf - 2, hem - 2, 9, tc, 9));
    if (has(p, 'laceHem')) { layers.push(ruffleAlong(z, CX - hemHalf + 2, hem - 1, CX, hem + 8, CX + hemHalf - 2, hem - 1, 6, '#FFFFFF', 11)); layers.push(stitch(z, `M${f1(CX - hemHalf + 4)},${hem - 8} L${f1(CX + hemHalf - 4)},${hem - 8}`, sc)); }
    if (has(p, 'buttonFront')) { const n = Math.max(3, Math.round((hem - waist - 30) / 30)); layers.push({ z: z + 0.41, d: `M${CX},${waist + 14} L${CX},${hem - 6}`, fill: 'none', stroke: 'rgba(0,0,0,.25)', sw: 1, isLine: true }); layers.push(...btnRow(z, Array.from({ length: n }, (_, i) => [CX, waist + 26 + i * ((hem - waist - 40) / Math.max(1, n - 1))]), 3, tc)); }
    if (has(p, 'pockets')) for (const sd of [-1, 1]) layers.push(...pocketPatch(z, CX + sd * (hipHalf * 0.55) - 12, hipY + 20, 24, 24, fill, sc));
    if (has(p, 'selfBelt')) { const wb = bodiceHalf(waist, ease); layers.push({ z: z + 0.42, d: `M${f1(CX - wb)},${waist + 2} h${f1(2 * wb)} v10 h-${f1(2 * wb)}Z`, fill: tc, shadeMore: true }); layers.push({ z: z + 0.44, d: `M${CX - 6},${waist + 1} h12 v12 h-12Z`, fill: 'none', stroke: '#D9D4C7', sw: 1.8, isLine: true }); }
    if (has(p, 'bowWaist')) layers.push(...bowShape(z, CX - hipHalf * 0.6, waist + 10, 10, tc));
    if (has(p, 'topstitch')) layers.push(stitch(z, `M${f1(CX - hemHalf + 3)},${hem - 7} L${f1(CX + hemHalf - 3)},${hem - 7}`, sc));
    if (has(p, 'cargo')) for (const sd of [-1, 1]) { const x = CX + sd * (hipHalf * 0.5); layers.push(...pocketPatch(z, x - 14, hipY + 60, 28, 34, fill, sc)); layers.push({ z: z + 0.43, d: `M${f1(x - 15)},${hipY + 58} h30 v9 h-30Z`, fill, shadeMore: true }); }
  }
  if (band) {
    const wb = bodiceHalf(waist, ease);
    layers.push({ z: z + 0.2, d: `M${f1(CX - wb)},${waist} h${f1(2 * wb)} v11 h-${f1(2 * wb)}Z`, fill, shadeMore: true, noStroke: true });
    layers.push(fold(z, `M${f1(CX - wb + 1)},${waist + 11} L${f1(CX + wb - 1)},${waist + 11}`, 0.22, 1));
  }
  return layers;
}

// ---------- TROUSERS / SHORTS ----------
export function pants(p = {}) {
  const { waist = 292, hem = 850, leg = 'straight', ease = 1, fill = '#222', z = Z.bottom, cuff = false, pockets = false, fly = true } = p;
  const hwAt = (y) => {
    const lh = legHalf(y);
    switch (leg) {
      case 'skinny': return lh + 1 + ease;
      case 'straight': return Math.max(lh, 23) + ease;
      case 'relaxed': return Math.max(lh, 27) + ease;
      case 'wide': return Math.max(lh, 36) + ease;
      case 'palazzo': return Math.max(lh, 36) + ease + Math.max(0, (y - 440) / 410) * 10;
      case 'flare': return y < Y.knee ? lh + 1 + ease : lh + 1 + ease + ((y - Y.knee) / (hem - Y.knee)) ** 1.4 * 26;
      case 'bootcut': return y < Y.knee ? lh + 2 + ease : lh + 2 + ease + ((y - Y.knee) / (hem - Y.knee)) * 10;
      case 'barrel': return Math.max(lh, 24) + ease + 12 * Math.sin(clamp((y - 402) / (hem - 402), 0, 1) * Math.PI);
      case 'jogger': return Math.max(lh, 24) + ease - Math.max(0, (y - 740) / (hem - 740)) * 10;
      case 'cargo': return Math.max(lh, 26) + ease;
      default: return lh + ease;
    }
  };
  const outer = (side, y) => CX + side * (legOff(y) + hwAt(y));
  const inner = (side, y) => CX + side * Math.max(1.5, legOff(y) - hwAt(y));
  const pts = [];
  pts.push([CX - bodiceHalf(waist, ease), waist, 'c']);
  for (const y of [318, 338, 372].filter((y) => y > waist)) pts.push([CX - bodiceHalf(y, ease), y]);
  const ys = range(402, hem, 50).slice(0, -1);
  for (const y of ys) pts.push([outer(-1, y), y]);
  pts.push([outer(-1, hem), hem, 'c']);
  pts.push([inner(-1, hem), hem, 'c']);
  for (const y of rev(ys).filter((y) => y > 420)) pts.push([inner(-1, y), y]);
  pts.push([CX, 410, 'c']);
  const right = rev(mirror(pts));
  const all = [...pts, ...right];
  const layers = [{ z, d: spline(all, true, 0.9), fill }];
  const wl = CX - bodiceHalf(waist, ease), wr = CX + bodiceHalf(waist, ease);
  layers.push({ z: z + 0.2, d: `M${f1(wl)},${waist} h${f1(wr - wl)} v11 h-${f1(wr - wl)}Z`, fill, shadeMore: true, noStroke: true });
  let detail = `M${f1(wl + 1)},${waist + 11} L${f1(wr - 1)},${waist + 11}`;
  if (fly) detail += ` M${CX},${waist + 12} L${CX},${waist + 70}`;
  if (pockets) {
    let flaps = '';
    for (const s of [-1, 1]) { const x = CX + s * (legOff(470) + 2); flaps += `M${f1(x - 11)},455 h22 v26 h-22Z `; }
    layers.push({ z: z + 0.15, d: flaps, fill, shadeMore: true });
    layers.push(fold(z, `M${f1(CX - legOff(470) - 13)},462 h22 M${f1(CX + legOff(470) - 9)},462 h22`, 0.22, 1));
  }
  if (cuff) detail += ` M${f1(outer(-1, hem - 14))},${hem - 14} L${f1(inner(-1, hem - 14))},${hem - 14} M${f1(inner(1, hem - 14))},${hem - 14} L${f1(outer(1, hem - 14))},${hem - 14}`;
  layers.push({ z: z + 0.1, d: detail, fill: 'none', stroke: 'rgba(0,0,0,.28)', sw: 1, isLine: true });
  if (Array.isArray(p.details) && p.details.length) {
    const tc = trimOf(p), sc = p.stitch || (isLight(fill) ? 'rgba(20,16,12,.45)' : 'rgba(255,230,160,.7)');
    if (has(p, 'fivePocket')) { for (const sd of [-1, 1]) { const x = CX + sd * (bodiceHalf(waist + 20, ease) - 2); layers.push(stitch(z, `M${f1(x)},${waist + 16} Q${f1(x - sd * 18)},${waist + 22} ${f1(x - sd * 22)},${waist + 48}`, sc)); layers.push(studRow(z, [[x - sd * 2, waist + 16], [x - sd * 22, waist + 48]], '#C9A24C')); } layers.push(stitch(z, `M${CX + 8},${waist + 18} h12 v10 h-12`, sc)); }
    if (has(p, 'topstitch')) { layers.push(stitch(z, `M${f1(wl + 2)},${waist + 14} L${f1(wr - 2)},${waist + 14}`, sc)); layers.push(stitch(z, `M${CX + 3},${waist + 14} L${CX + 3},${waist + 68}`, sc)); }
    if (has(p, 'sideSeam')) for (const sd of [-1, 1]) layers.push(stitch(z, `M${f1(outer(sd, 420) - sd * 2)},420 L${f1(outer(sd, hem - 20) - sd * 2)},${hem - 20}`, sc, 0.8));
    if (has(p, 'pleats')) for (const sd of [-1, 1]) layers.push(fold(z, `M${f1(CX + sd * 16)},${waist + 12} L${f1(CX + sd * legOff(500))},500 M${f1(CX + sd * 30)},${waist + 12} L${f1(CX + sd * (legOff(500) + 10))},500`, 0.2, 1));
    if (has(p, 'zipAnkle')) for (const sd of [-1, 1]) layers.push(...zipLine(z, outer(sd, hem - 60) - sd * 4, hem - 60, outer(sd, hem - 6) - sd * 4, hem - 6, '#C9CDD4'));
    if (has(p, 'drawstring')) { layers.push({ z: z + 0.44, d: `M${CX - 8},${waist + 12} q-4,14 -6,26 M${CX + 8},${waist + 12} q4,14 6,26`, fill: 'none', stroke: tc, sw: 1.8, isLine: true }); layers.push(studRow(z, [[CX - 14, waist + 40], [CX + 14, waist + 40]], tc)); }
    if (has(p, 'cargo')) for (const sd of [-1, 1]) { const x = CX + sd * legOff(600); layers.push(...pocketPatch(z, x - 15, 560, 30, 36, fill, sc)); layers.push({ z: z + 0.43, d: `M${f1(x - 16)},558 h32 v9 h-32Z`, fill, shadeMore: true }); }
    if (has(p, 'belt')) { layers.push({ z: z + 0.42, d: `M${f1(wl)},${waist + 1} h${f1(wr - wl)} v10 h-${f1(wr - wl)}Z`, fill: tc, shadeMore: true }); layers.push({ z: z + 0.44, d: `M${CX - 6},${waist} h12 v12 h-12Z`, fill: 'none', stroke: '#D9D4C7', sw: 1.8, isLine: true }); }
  }
  // creases and knee folds
  if (hem > 700) {
    const creasy = ['straight', 'wide', 'relaxed', 'palazzo', 'cargo'].includes(leg);
    for (const s of [-1, 1]) {
      const cx0 = CX + s * legOff(440), cx1 = CX + s * legOff(hem - 10);
      if (creasy) { layers.push(catchLight(z, `M${f1(cx0)},440 L${f1(cx1)},${hem - 12}`, 0.15, 1.4)); layers.push(fold(z, `M${f1(cx0 + 1.5)},440 L${f1(cx1 + 1.5)},${hem - 12}`, 0.08, 1)); }
      const ki = inner(s, 590);
      layers.push(fold(z, `M${f1(ki)},584 q${s * 8},4 ${s * 15},0 M${f1(ki)},598 q${s * 7},4 ${s * 13},0`, 0.14, 1.1));
      layers.push(fold(z, `M${f1(outer(s, 416))},416 q${s * -10},8 ${s * -18},4`, 0.14, 1.1));
    }
  }
  return layers;
}

// ---------- DRESS (single silhouette) ----------
export function dress(p = {}) {
  const { neck = 'crew', strap = 'set', hem = 700, shape = 'a', ease = 2, fill = '#222', z = Z.top, slit = 0, waistSeam = true, hemStyle = 'straight', sleeveless = false, pleats = 0 } = p;
  const det = Array.isArray(p.details) ? p.details : [];
  const topDet = det.filter((k) => ['placket', 'zip', 'bow', 'ruffle', 'lacing', 'darts', 'trim', 'sailor', 'pocket'].includes(k));
  const skDet = det.filter((k) => ['ruffleHem', 'laceHem', 'buttonFront', 'pockets', 'selfBelt', 'bowWaist', 'topstitch'].includes(k));
  const top = bodice({ neck, strap: strap === 'set' && sleeveless ? 'sleeveless' : strap, hem: 300, ease: Math.min(ease, 6), fill, z, details: topDet, trim: p.trim, collar: p.collar, buttons: p.buttons });
  const sk = skirt({ waist: 292, hem, shape, ease, fill, z: z + 0.05, slit, hemStyle, band: waistSeam, pleats, details: skDet, trim: p.trim });
  // Hide the bodice hem corner by extending the bodice under the skirt
  return [...top, ...sk];
}

// ---------- OUTERWEAR ----------
export function coat(p = {}) {
  const { hem = 470, ease = 16, lapel = 'notch', open = true, fill = '#222', z = Z.outer, sleeveType = 'long', belt = false, quilt = false, buttons = 0, collar = 'none', hood = false, sleeveFill = null, collarFill = null, stripe = false } = p;
  const layers = [];
  const shoulderTip = (side) => [torsoX(side, 168) + side * ease * 0.3, 166 + ease * 0.18];
  const armpit = (side) => [torsoX(side, 212) + side * ease * 0.75, 216 + ease * 0.12];
  const sideHalf = (y) => bodiceHalf(y, ease);
  if (open) {
    const panel = (side) => {
      const pts = [];
      const gap = 11;
      pts.push([CX + side * 17, 155]);
      pts.push([CX + side * 44, 158 + ease * 0.06]);
      pts.push(shoulderTip(side));
      pts.push(armpit(side));
      for (const y of [258, 318, 372, 440, 520, 620, 720].filter((y) => y < hem - 10)) pts.push([CX + side * sideHalf(y), y]);
      pts.push([CX + side * sideHalf(hem), hem, 'c']);
      pts.push([CX + side * gap, hem, 'c']);
      pts.push([CX + side * gap, 336, 'c']);
      if (lapel === 'none') { pts.push([CX + side * gap, 240]); pts.push([CX + side * 15, 160]); }
      else { pts.push([CX + side * 30, 236]); pts.push([CX + side * 20, 186]); }
      return spline(pts, true, 0.8);
    };
    layers.push({ z, d: panel(-1), fill }, { z, d: panel(1), fill });
    if (lapel === 'notch' || lapel === 'peak' || lapel === 'shawl') {
      const lap = (side) => {
        const pts = lapel === 'shawl'
          ? [[CX + side * 16, 158], [CX + side * 36, 226], [CX + side * 28, 244, 'c'], [CX + side * 20, 226]]
          : [[CX + side * 16, 158], [CX + side * 38, 222, 'c'], [CX + side * 31, 226, 'c'], [CX + side * 36, 238, 'c'], [CX + side * 21, 232]];
        return spline(pts, true, 0.5);
      };
      layers.push({ z: z + 0.2, d: lap(-1), fill, shadeMore: true }, { z: z + 0.2, d: lap(1), fill, shadeMore: true });
      layers.push(fold(z, `M${CX - 16},158 Q${CX - 30},200 ${CX - 36},236 M${CX + 16},158 Q${CX + 30},200 ${CX + 36},236`, 0.22, 1.2));
    }
    if (hem > 420) {
      for (const sd of [-1, 1]) layers.push(fold(z, `M${f1(CX + sd * (sideHalf(300) - 14))},300 q${sd * 3},${(hem - 320) / 2} ${sd * 1},${hem - 316}`, 0.1, 1.3));
      layers.push(catchLight(z, `M${f1(CX - sideHalf(330) + 6)},330 q-2,${(hem - 350) / 2} 0,${hem - 346}`, 0.14, 1.2));
    }
    if (hem > 560) {
      let pk = '';
      for (const sd of [-1, 1]) { const x = CX + sd * (sideHalf(hem - 170) - 16); pk += `M${f1(x - 14)},${hem - 190} h28 v10 h-28Z `; }
      layers.push({ z: z + 0.22, d: pk, fill, shadeMore: true });
    }
  } else {
    const pts = [];
    pts.push([CX - 15, 153]);
    pts.push([CX - 44, 158 + ease * 0.06]);
    pts.push(shoulderTip(-1));
    pts.push(armpit(-1));
    for (const y of [258, 318, 372, 440, 520, 620, 720].filter((y) => y < hem - 10)) pts.push([CX - sideHalf(y), y]);
    pts.push([CX - sideHalf(hem), hem, 'c']);
    const right = rev(mirror(pts));
    const all = [...pts, ...right, [CX, 162]];
    layers.push({ z, d: spline(all, true, 0.8), fill });
    let detail = `M${CX},168 L${CX},${hem - 4}`;
    let bd = '', bh = '';
    for (let i = 0; i < buttons; i++) {
      const y = 215 + i * ((hem - 260) / Math.max(1, buttons - 1));
      bd += `M${CX + 4},${f1(y)} a4,4 0 1,0 -8,0 a4,4 0 1,0 8,0 `; bh += `M${CX - 1.5},${f1(y - 1.5)} a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0 `;
    }
    layers.push({ z: z + 0.15, d: detail, fill: 'none', stroke: 'rgba(0,0,0,.3)', sw: 1.1, isLine: true });
    if (buttons) { layers.push({ z: z + 0.16, d: bd, fill: 'rgba(0,0,0,.25)', stroke: 'rgba(0,0,0,.35)', sw: 0.8, noShade: true }); layers.push({ z: z + 0.17, d: bh, fill: 'rgba(255,255,255,.7)', noShade: true, noStroke: true }); }
    if (hem > 420) for (const sd of [-1, 1]) layers.push(fold(z, `M${f1(CX + sd * (sideHalf(300) - 16))},300 q${sd * 3},${(hem - 320) / 2} ${sd * 1},${hem - 316}`, 0.1, 1.3));
    if (collar === 'band') layers.push({ z: z + 0.2, d: spline([[CX - 18, 150, 'c'], [CX + 18, 150, 'c'], [CX + 20, 164, 'c'], [CX - 20, 164, 'c']], true), fill: collarFill || fill, shadeMore: true });
    if (collar === 'spread') {
      const c = (s) => spline([[CX + s * 3, 150], [CX + s * 44, 158, 'c'], [CX + s * 26, 196, 'c'], [CX + s * 4, 172]], true, 0.4);
      layers.push({ z: z + 0.2, d: c(-1), fill: collarFill || fill, shadeMore: true }, { z: z + 0.2, d: c(1), fill: collarFill || fill, shadeMore: true });
    }
    if (stripe) layers.push({ z: z + 0.16, d: `M${f1(CX - sideHalf(hem - 14))},${hem - 14} L${f1(CX + sideHalf(hem - 14))},${hem - 14} M${f1(CX - sideHalf(hem - 22))},${hem - 22} L${f1(CX + sideHalf(hem - 22))},${hem - 22}`, fill: 'none', stroke: sleeveFill || 'rgba(255,255,255,.6)', sw: 3, isLine: true });
    if (collar === 'fur') {
      const furPts = [];
      for (let i = 0; i <= 24; i++) {
        const t = i / 24, ang = Math.PI * (1 + t);
        const r = 56 + (i % 2) * 7;
        furPts.push([CX + Math.cos(ang) * r, 170 + Math.sin(ang) * -r * 0.55 + 10]);
      }
      layers.push({ z: z + 0.3, d: spline([...furPts, [CX + 60, 196], [CX, 206], [CX - 60, 196]], true, 1), fill: collarFill || fill, shadeMore: true, material: 'shearling' });
    }
  }
  if (quilt) {
    let d = '';
    for (let y = 240; y < hem - 10; y += 34) d += `M${f1(CX - sideHalf(y) + 2)},${y} L${f1(CX + sideHalf(y) - 2)},${y} `;
    layers.push({ z: z + 0.1, d, fill: 'none', stroke: 'rgba(0,0,0,.22)', sw: 1.2, isLine: true });
  }
  if (belt) {
    layers.push({ z: z + 0.25, d: `M${f1(CX - sideHalf(292) - 1)},286 h${f1(2 * sideHalf(292) + 2)} v14 h-${f1(2 * sideHalf(292) + 2)}Z`, fill, shadeMore: true });
  }
  if (hood) {
    const hd = spline([[CX - 52, 190], [CX - 60, 140], [CX - 40, 60], [CX, 30], [CX + 40, 60], [CX + 60, 140], [CX + 52, 190], [CX, 206]], true, 0.9);
    layers.push({ z: Z.hood, d: hd, fill, shadeMore: true });
  }
  if (Array.isArray(p.details) && p.details.length) {
    const tc = trimOf(p), sc = stitchC(p);
    if (has(p, 'doubleBreasted')) { const n = 3; const pts = []; for (let i = 0; i < n; i++) { const y = 230 + i * 42; pts.push([CX - 14, y], [CX + 14, y]); } layers.push(...btnRow(z, pts, 3.6, tc)); }
    if (has(p, 'patchPockets')) for (const sd of [-1, 1]) layers.push(...pocketPatch(z, CX + sd * (sideHalf(hem - 90) - 18) - 14, Math.max(300, hem - 110), 28, 30, fill, sc));
    if (has(p, 'epaulettes')) for (const sd of [-1, 1]) { const t = shoulderTip(sd); layers.push({ z: Z.outerSleeve + 0.3, d: `M${f1(CX + sd * 20)},${t[1] - 2} L${f1(t[0] - sd * 2)},${t[1] + 2} l0,7 L${f1(CX + sd * 20)},${t[1] + 5}Z`, fill, shadeMore: true }); layers.push(...btnRow(Z.outerSleeve, [[CX + sd * 26, t[1] + 2]], 2.4, tc)); }
    if (has(p, 'buckle')) layers.push({ z: z + 0.44, d: `M${CX - 8},285 h16 v16 h-16Z`, fill: 'none', stroke: '#D9D4C7', sw: 2, isLine: true });
    if (has(p, 'asymZip')) { layers.push(...zipLine(z, CX - 10, 175, CX - 34, hem - 10, '#C9CDD4')); layers.push(...zipLine(z, CX + 22, 258, CX + 22, 290, '#C9CDD4')); layers.push(studRow(z, [[CX - 44, 168], [CX + 44, 168]], '#C9CDD4')); }
    if (has(p, 'studs')) { const pts = []; for (let i = 0; i < 6; i++) pts.push([CX - 46 + i * 18, 162 + Math.abs(i - 2.5) * 1.2]); layers.push(studRow(z, pts, '#C9CDD4')); }
    if (has(p, 'toggles')) for (let i = 0; i < 3; i++) { const y = 236 + i * 60; layers.push({ z: z + 0.44, d: `M${CX - 24},${y} h48`, fill: 'none', stroke: 'rgba(0,0,0,.4)', sw: 1.4, isLine: true }); layers.push({ z: z + 0.45, d: `M${CX + 8},${y - 3} h16 v6 h-16Z`, fill: '#8A5A33', shadeMore: true }); }
    if (has(p, 'cuffStrap')) for (const sd of [-1, 1]) { layers.push({ z: Z.outerSleeve + 0.3, d: `M${f1(armOuter(sd, 416, 5))},416 L${f1(armInner(sd, 416, 5))},416 L${f1(armInner(sd, 424, 5))},424 L${f1(armOuter(sd, 424, 5))},424Z`, fill, shadeMore: true }); layers.push(...btnRow(Z.outerSleeve, [[armOuter(sd, 420, 5) - sd * 6, 420]], 2, tc)); }
    if (has(p, 'piping')) { if (open) layers.push(trimBand(z, `M${CX - 17},156 L${CX - 11},${hem} M${CX + 17},156 L${CX + 11},${hem}`, tc, 2.6)); else layers.push(trimBand(z, `M${f1(CX - sideHalf(hem - 3))},${hem - 3} L${f1(CX + sideHalf(hem - 3))},${hem - 3}`, tc, 3)); }
    if (has(p, 'bow')) layers.push(...bowShape(z, CX, 172, 12, tc));
    if (has(p, 'topstitch')) layers.push(stitch(z, `M${f1(CX - sideHalf(hem - 8) + 3)},${hem - 8} L${f1(CX + sideHalf(hem - 8) - 3)},${hem - 8}`, sc));
  }
  const tip = shoulderTip(1);
  layers.push(...sleeve({ type: sleeveType, ease: 4 + (ease > 18 ? 3 : 0), fill: sleeveFill || fill, z: Z.outerSleeve, dropped: ease > 18 ? 8 : 2, cap: [tip[0] - CX + 1, tip[1] + 1] }).map((l) => (sleeveFill ? { ...l, altFill: true } : l)));
  if (quilt) {
    let d = '';
    for (const s of [-1, 1]) for (let y = 230; y < 430; y += 34) d += `M${f1(armOuter(s, y, 6))},${y} L${f1(armInner(s, y, 6))},${y} `;
    layers.push({ z: Z.outerSleeve + 0.1, d, fill: 'none', stroke: 'rgba(0,0,0,.22)', sw: 1.2, isLine: true });
  }
  return layers;
}

// ---------- SHOES ----------
export function shoes(p = {}) {
  const { type = 'sneaker', fill = '#111', sole = '#f2f0ea', shaft = 760, z = Z.shoe, accent = null, heel = 0 } = p;
  const layers = [];
  const foot = (side, ease, vamp, toe = 'round', soleH = 0) => {
    const cx = CX + side * legOff(805);
    const pts = [];
    const topHalf = legHalf(Math.min(805, vamp)) + ease;
    pts.push([cx - topHalf, vamp, 'c']);
    pts.push([cx - 14 - ease, 840]);
    if (toe === 'point') { pts.push([cx - 8, 858 + soleH]); pts.push([cx, 866 + soleH, 'c']); pts.push([cx + 8, 858 + soleH]); }
    else if (toe === 'square') { pts.push([cx - 13 - ease, 854 + soleH, 'c']); pts.push([cx + 13 + ease, 854 + soleH, 'c']); }
    else { pts.push([cx - 11 - ease, 852 + soleH]); pts.push([cx, 857 + soleH]); pts.push([cx + 11 + ease, 852 + soleH]); }
    pts.push([cx + 14 + ease, 840]);
    pts.push([cx + topHalf, vamp, 'c']);
    return spline(pts, true, 0.8);
  };
  const soleBand = (side, h, w) => {
    const cx = CX + side * legOff(805);
    return spline([[cx - w, 846, 'c'], [cx + w, 846, 'c'], [cx + w - 2, 846 + h], [cx, 850 + h], [cx - w + 2, 846 + h]], true, 0.7);
  };
  const heelStem = (side, h) => {
    const cx = CX + side * legOff(805) + side * 1;
    return `M${cx - 3},852 h6 v${h} h-6Z`;
  };
  for (const s of [-1, 1]) {
    switch (type) {
      case 'sneaker': {
        const cx = CX + s * legOff(805);
        layers.push({ z, d: soleBand(s, 10, 17), fill: sole });
        layers.push(fold(z, `M${cx - 16},851 q16,4 32,0`, 0.25, 1));
        layers.push({ z: z + 0.1, d: foot(s, 3, 796, 'round'), fill });
        layers.push({ z: z + 0.2, d: `M${cx - 7},808 L${cx + 7},812 M${cx - 7},816 L${cx + 7},820 M${cx - 7},824 L${cx + 7},828 M${cx + 7},808 L${cx - 7},812 M${cx + 7},816 L${cx - 7},820`, fill: 'none', stroke: isLight(fill) ? 'rgba(0,0,0,.35)' : 'rgba(255,255,255,.6)', sw: 1.1, isLine: true });
        break;
      }
      case 'chunky':
        layers.push({ z, d: soleBand(s, 18, 20), fill: sole });
        layers.push({ z: z + 0.1, d: foot(s, 4, 794, 'round'), fill });
        break;
      case 'boot':
      case 'knee':
      case 'thigh': {
        const top = type === 'boot' ? shaft : type === 'knee' ? 596 : 520;
        const pts = [];
        pts.push([legOuter(-1, top, 3), top, 'c']);
        for (const y of range(top, 805, 40).slice(1)) pts.push([legOuter(-1, y, 3), y]);
        pts.push([CX - legOff(805) - 14, 842]);
        pts.push([CX - legOff(805) - 10, 853 + heel]);
        pts.push([CX - legOff(805), 858 + heel]);
        pts.push([CX - legOff(805) + 10, 853 + heel]);
        pts.push([CX - legOff(805) + 14, 842]);
        for (const y of rev(range(top, 805, 40).slice(1))) pts.push([legInner(-1, y, 3), y]);
        pts.push([legInner(-1, top, 3), top, 'c']);
        const d = spline(pts, true, 0.8);
        layers.push({ z: Z.bottom + 1, d: s === -1 ? d : d.replace(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g, (m, x, y) => `${f1(2 * CX - parseFloat(x))},${y}`), fill });
        if (heel) layers.push({ z: Z.bottom + 0.9, d: heelStem(s, heel + 4), fill });
        break;
      }
      case 'pump':
      case 'kitten':
        layers.push({ z, d: foot(s, 1, 830, 'point'), fill });
        layers.push({ z: z - 0.1, d: heelStem(s, type === 'pump' ? 14 : 7), fill });
        break;
      case 'flat':
        layers.push({ z, d: foot(s, 1, 832, 'round'), fill });
        break;
      case 'maryjane':
        layers.push({ z, d: foot(s, 1, 832, 'round'), fill });
        layers.push({ z: z + 0.1, d: `M${CX + s * legOff(805) - 12},820 L${CX + s * legOff(805) + 12},820`, fill: 'none', stroke: fill, sw: 3.5, isLine: true });
        if (heel) layers.push({ z: z - 0.1, d: heelStem(s, heel), fill });
        break;
      case 'loafer':
        layers.push({ z, d: soleBand(s, 6, 15), fill: sole });
        layers.push({ z: z + 0.1, d: foot(s, 2, 818, 'square'), fill });
        layers.push({ z: z + 0.2, d: `M${CX + s * legOff(805) - 11},828 L${CX + s * legOff(805) + 11},828`, fill: 'none', stroke: accent || 'rgba(255,255,255,.5)', sw: 2, isLine: true });
        break;
      case 'sandal':
      case 'heeledSandal': {
        const cx = CX + s * legOff(805);
        layers.push({ z, d: soleBand(s, 5, 14), fill });
        layers.push({ z: z + 0.1, d: `M${cx - 12},836 L${cx + 12},836 M${cx - 10},826 L${cx + 10},826 M${cx - 11},808 L${cx + 11},808`, fill: 'none', stroke: fill, sw: 2.2, isLine: true });
        if (type === 'heeledSandal') layers.push({ z: z - 0.1, d: heelStem(s, 14), fill });
        break;
      }
      case 'platform':
        layers.push({ z, d: soleBand(s, 24, 18), fill: sole });
        layers.push({ z: z + 0.1, d: foot(s, 3, 826, 'round'), fill });
        break;
      case 'tabi': {
        const cx = CX + s * legOff(805);
        layers.push({ z, d: foot(s, 1, 826, 'round'), fill });
        layers.push({ z: z + 0.1, d: `M${cx - 2},857 L${cx - 1},838`, fill: 'none', stroke: 'rgba(0,0,0,.6)', sw: 1.6, isLine: true });
        break;
      }
      case 'cowboy': {
        const top = 690;
        const pts = [];
        pts.push([legOuter(-1, top, 4), top + 8]);
        pts.push([CX - legOff(top), top - 6, 'c']);
        pts.push([legInner(-1, top, 4), top + 8]);
        for (const y of range(top, 805, 40).slice(1)) pts.push([legInner(-1, y, 4), y]);
        pts.push([CX - legOff(805) + 12, 842]);
        pts.push([CX - legOff(805) + 6, 860 + heel]);
        pts.push([CX - legOff(805), 866 + heel, 'c']);
        pts.push([CX - legOff(805) - 6, 860 + heel]);
        pts.push([CX - legOff(805) - 12, 842]);
        for (const y of rev(range(top, 805, 40).slice(1))) pts.push([legOuter(-1, y, 4), y]);
        const d = spline(pts, true, 0.8);
        layers.push({ z: Z.bottom + 1, d: s === -1 ? d : d.replace(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g, (m, x, y) => `${f1(2 * CX - parseFloat(x))},${y}`), fill });
        break;
      }
      default:
        layers.push({ z, d: foot(s, 1, 830, 'round'), fill });
    }
    if (Array.isArray(p.details) && p.details.length) {
      const cx = CX + s * legOff(805);
      const tc = trimOf(p);
      if (has(p, 'strap')) layers.push({ z: z + 0.3, d: `M${cx - 11},812 L${cx + 11},812`, fill: 'none', stroke: fill, sw: 2.6, isLine: true }, { z: z + 0.31, d: `M${cx + 7},809 h5 v6 h-5Z`, fill: 'none', stroke: '#D9D4C7', sw: 1.2, isLine: true });
      if (has(p, 'buckle')) layers.push({ z: z + 0.31, d: `M${cx - 4},822 h8 v8 h-8Z`, fill: 'none', stroke: '#D9D4C7', sw: 1.6, isLine: true });
      if (has(p, 'bow')) layers.push(...bowShape(z, cx, 836, 6, tc));
      if (has(p, 'capToe')) layers.push({ z: z + 0.3, d: spline([[cx - 10, 848], [cx, 844], [cx + 10, 848], [cx + 9, 854], [cx, 857], [cx - 9, 854]], true, 0.8), fill: tc, shadeMore: true });
      if (has(p, 'studs')) layers.push(studRow(z, [[cx - 8, 826], [cx - 3, 824], [cx + 3, 824], [cx + 8, 826]], '#C9CDD4'));
      if (has(p, 'laces')) layers.push({ z: z + 0.3, d: `M${cx - 6},770 L${cx + 6},776 M${cx - 6},784 L${cx + 6},790 M${cx - 6},798 L${cx + 6},804 M${cx + 6},770 L${cx - 6},776 M${cx + 6},784 L${cx - 6},790 M${cx + 6},798 L${cx - 6},804`, fill: 'none', stroke: isLight(fill) ? 'rgba(0,0,0,.35)' : 'rgba(255,255,255,.6)', sw: 1.1, isLine: true });
      if (has(p, 'heelGloss')) layers.push({ z: z + 0.3, d: `M${cx - 6},848 q6,-4 12,0`, fill: 'none', stroke: 'rgba(255,255,255,.5)', sw: 1.4, isLine: true });
    }
  }
  return layers;
}

// ---------- HOSIERY ----------
export function hosiery(p = {}) {
  const { type = 'tights', fill = '#111', opacity = 1, z = Z.hosiery, top = 745 } = p;
  const layers = [];
  const legShape = (side, from) => {
    const pts = [];
    pts.push([legOuter(side, from, 1.2), from, 'c']);
    for (const y of range(from, 805, 40).slice(1)) pts.push([legOuter(side, y, 1.2), y]);
    pts.push([CX + side * legOff(805) + side * 12, 842]);
    pts.push([CX + side * legOff(805), 858]);
    pts.push([CX + side * legOff(805) - side * 12, 842]);
    for (const y of rev(range(from, 805, 40).slice(1))) pts.push([legInner(side, y, 1.2), y]);
    pts.push([legInner(side, from, 1.2), from, 'c']);
    return spline(pts, true, 0.8);
  };
  if (type === 'tights' || type === 'sheer' || type === 'fishnet') {
    for (const s of [-1, 1]) layers.push({ z, d: legShape(s, 404), fill, opacity, pattern: type === 'fishnet' ? 'fishnet' : null });
    layers.push({ z, d: spline([[CX - torsoHalf(372) - 1, 372, 'c'], [CX + torsoHalf(372) + 1, 372, 'c'], [CX + torsoHalf(402) + 1, 402], [CX, 430], [CX - torsoHalf(402) - 1, 402]], true, 0.6), fill, opacity });
  } else {
    // socks, knee highs, thigh highs, leg warmers; with optional stripes, a folded cuff or a ruffle at the top
    const from = top;
    const { stripes = 0, stripe = null, cuff = false, ruffle = false } = p;
    const light = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.test(fill) ? (parseInt(fill.slice(1, 3), 16) * 0.3 + parseInt(fill.slice(3, 5), 16) * 0.59 + parseInt(fill.slice(5, 7), 16) * 0.11) > 160 : false;
    const contrast = stripe || (light ? '#E0218A' : '#FFFFFF');
    for (const s of [-1, 1]) {
      layers.push({ z, d: legShape(s, from), fill, opacity });
      if (!ruffle && !cuff) layers.push({ z: z + 0.1, d: `M${f1(legOuter(s, from + 12, 1))},${from + 12} L${f1(legInner(s, from + 12, 1))},${from + 12}`, fill: 'none', stroke: 'rgba(0,0,0,.25)', sw: 1.2, isLine: true });
      for (let k = 0; k < stripes; k++) {
        const y0 = from + 10 + k * 11;
        layers.push({ z: z + 0.1, d: `M${f1(legOuter(s, y0, 1.2))},${y0} L${f1(legInner(s, y0, 1.2))},${y0} L${f1(legInner(s, y0 + 5, 1.2))},${y0 + 5} L${f1(legOuter(s, y0 + 5, 1.2))},${y0 + 5}Z`, fill: contrast, opacity });
      }
      if (cuff) {
        const y0 = from - 2, y1 = from + 16;
        layers.push({ z: z + 0.1, d: `M${f1(legOuter(s, y0, 1.6))},${y0} L${f1(legInner(s, y0, 1.6))},${y0} L${f1(legInner(s, y1, 1.3))},${y1} L${f1(legOuter(s, y1, 1.3))},${y1}Z`, fill, opacity, strokeBase: fill });
        layers.push({ z: z + 0.15, d: `M${f1(legOuter(s, y1, 1.3))},${y1} L${f1(legInner(s, y1, 1.3))},${y1}`, fill: 'none', stroke: 'rgba(0,0,0,.22)', sw: 1.2, isLine: true });
      }
      if (ruffle) {
        const xo = legOuter(s, from, 1.5), xi = legInner(s, from, 1.5);
        const n = 5, w = (xi - xo) / n;
        let d = `M${f1(xo)},${from + 6}`;
        for (let k = 0; k < n; k++) d += ` q${f1(w / 2)},-14 ${f1(w)},0`;
        d += ` L${f1(xi)},${from + 10} L${f1(xo)},${from + 10}Z`;
        layers.push({ z: z + 0.1, d, fill: contrast === '#FFFFFF' ? '#FFFFFF' : '#FFF6FA', opacity });
      }
    }
  }
  return layers;
}

// ---------- BAGS ----------
export function bag(p = {}) {
  const { type = 'shoulder', fill = '#111', hardware = '#D9D4C7', z = Z.bag } = p;
  const L = [];
  const rr = (x, y, w, h, r) => `M${x + r},${y} h${w - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${h - 2 * r} a${r},${r} 0 0 1 -${r},${r} h-${w - 2 * r} a${r},${r} 0 0 1 -${r},-${r} v-${h - 2 * r} a${r},${r} 0 0 1 ${r},-${r}Z`;
  switch (type) {
    case 'micro':
      L.push({ z, d: `M${CX + 86},448 q10,-22 20,0`, fill: 'none', stroke: hardware, sw: 1.6, isLine: true });
      L.push({ z, d: rr(CX + 82, 448, 28, 20, 4), fill });
      break;
    case 'shoulder':
      L.push({ z, d: `M${CX + 50},170 q22,80 24,180 M${CX + 44},176 q10,80 14,178`, fill: 'none', stroke: fill, sw: 2.2, isLine: true });
      L.push({ z, d: rr(CX + 44, 346, 54, 34, 7), fill });
      L.push({ z: z + 0.1, d: `M${CX + 66},362 h10`, fill: 'none', stroke: hardware, sw: 2.4, isLine: true });
      break;
    case 'chain':
      L.push({ z, d: `M${CX + 50},170 q22,80 24,176`, fill: 'none', stroke: hardware, sw: 2, dash: '3 3', isLine: true });
      L.push({ z, d: rr(CX + 46, 342, 50, 36, 4), fill });
      L.push({ z: z + 0.1, d: `M${CX + 46},356 h50`, fill: 'none', stroke: 'rgba(0,0,0,.25)', sw: 1, isLine: true });
      break;
    case 'tote':
      L.push({ z, d: `M${CX + 56},172 q18,70 22,150 M${CX + 48},178 q12,70 12,148`, fill: 'none', stroke: fill, sw: 2.4, isLine: true });
      L.push({ z, d: rr(CX + 46, 318, 70, 74, 4), fill });
      break;
    case 'crossbody':
      L.push({ z, d: `M${CX - 42},170 Q${CX + 10},280 ${CX + 60},368`, fill: 'none', stroke: fill, sw: 3, isLine: true });
      L.push({ z, d: rr(CX + 48, 356, 40, 28, 5), fill });
      break;
    case 'clutch':
      L.push({ z, d: rr(CX - 112, 436, 46, 24, 3), fill });
      L.push({ z: z + 0.1, d: `M${CX - 112},447 h46`, fill: 'none', stroke: hardware, sw: 1.2, isLine: true });
      break;
    case 'backpack':
      L.push({ z: Z.backpack, d: rr(CX - 56, 170, 112, 150, 18), fill });
      L.push({ z: Z.top + 2, d: `M${CX - 34},166 q-10,70 -4,130 M${CX + 34},166 q10,70 4,130`, fill: 'none', stroke: fill, sw: 9, isLine: true });
      break;
    case 'bowling':
      L.push({ z, d: `M${CX + 96},440 q10,-30 24,-2`, fill: 'none', stroke: fill, sw: 3, isLine: true });
      L.push({ z, d: rr(CX + 84, 436, 50, 40, 14), fill });
      break;
    default:
      L.push({ z, d: rr(CX + 48, 350, 44, 30, 6), fill });
  }
  if (Array.isArray(p.details) && p.details.length) {
    const box = { micro: [CX + 82, 448, 28, 20], shoulder: [CX + 44, 346, 54, 34], chain: [CX + 46, 342, 50, 36], tote: [CX + 46, 318, 70, 74], crossbody: [CX + 48, 356, 40, 28], clutch: [CX - 112, 436, 46, 24], backpack: [CX - 56, 170, 112, 150], bowling: [CX + 84, 436, 50, 40] }[type] || [CX + 48, 350, 44, 30];
    const [bx, by, bw, bh] = box;
    const tc = trimOf(p);
    if (has(p, 'quilt')) { let d = ''; for (let k = -bh; k < bw + bh; k += 9) d += `M${f1(bx + k)},${by} l${-bh},${bh} M${f1(bx + k)},${by} l${bh},${bh} `; L.push({ z: z + 0.1, d, fill: 'none', stroke: 'rgba(0,0,0,.22)', sw: 0.9, isLine: true, clip: 'bag' }); }
    if (has(p, 'flap')) { L.push({ z: z + 0.12, d: `M${bx},${by} h${bw} v${bh * 0.45} q0,5 -5,5 h${-(bw - 10)} q-5,0 -5,-5Z`, fill, shadeMore: true }); L.push({ z: z + 0.14, d: `M${f1(bx + bw / 2 - 4)},${f1(by + bh * 0.42)} h8 v6 h-8Z`, fill: hardware, noShade: true }); }
    if (has(p, 'plate')) L.push({ z: z + 0.13, d: `M${f1(bx + bw / 2 - 7)},${f1(by + bh / 2 - 2.5)} h14 v5 h-14Z`, fill: hardware, noShade: true });
    if (has(p, 'bow')) L.push(...bowShape(z, bx + bw / 2, by + 2, Math.min(9, bw / 4), tc));
    if (has(p, 'studs')) { const pts = []; for (let k = 4; k < bw - 2; k += 7) pts.push([bx + k, by + bh - 4]); L.push(studRow(z, pts, hardware)); }
    if (has(p, 'pocket')) L.push(...pocketPatch(z, bx + 6, by + bh * 0.4, bw - 12, bh * 0.45, fill, 'rgba(0,0,0,.3)'));
    if (has(p, 'tassel')) L.push({ z: z + 0.12, d: `M${f1(bx + bw - 4)},${f1(by + bh)} l0,10 M${f1(bx + bw - 7)},${f1(by + bh + 4)} l0,8 M${f1(bx + bw - 1)},${f1(by + bh + 4)} l0,8`, fill: 'none', stroke: tc, sw: 1.4, isLine: true });
    if (has(p, 'buckle')) L.push({ z: z + 0.14, d: `M${f1(bx + bw / 2 - 5)},${f1(by + bh * 0.5)} h10 v8 h-10Z`, fill: 'none', stroke: hardware, sw: 1.6, isLine: true });
  }
  return L;
}

// ---------- HEADWEAR ----------
export function headwear(p = {}) {
  const { type = 'cap', fill = '#111', accent = '#fff', z = Z.headwear } = p;
  const L = [];
  switch (type) {
    case 'cap':
      L.push({ z, d: spline([[146, 78], [150, 48], [166, 34], [180, 30], [194, 34], [210, 48], [214, 78], [180, 72]], true, 0.9), fill });
      L.push({ z: z + 0.1, d: spline([[140, 80, 'c'], [180, 74], [220, 80, 'c'], [180, 96]], true, 0.9), fill, shadeMore: true });
      break;
    case 'beanie':
      L.push({ z, d: spline([[144, 96], [146, 50], [160, 26], [180, 16], [200, 26], [214, 50], [216, 96], [180, 90]], true, 0.9), fill });
      L.push({ z: z + 0.1, d: `M144,80 L216,80 M144,90 L216,90`, fill: 'none', stroke: 'rgba(0,0,0,.22)', sw: 1, isLine: true });
      break;
    case 'beret':
      L.push({ z, d: spline([[138, 70], [150, 34], [190, 20], [228, 36], [232, 58], [210, 66], [180, 62], [150, 72]], true, 0.9), fill });
      break;
    case 'bucket':
      L.push({ z, d: spline([[148, 74], [152, 44], [168, 32], [180, 30], [192, 32], [208, 44], [212, 74], [180, 70]], true, 0.9), fill });
      L.push({ z: z + 0.1, d: spline([[136, 92, 'c'], [148, 70, 'c'], [212, 70, 'c'], [224, 92, 'c'], [180, 100]], true, 0.6), fill, shadeMore: true });
      break;
    case 'bow':
      L.push({ z, d: `M${CX + 28},44 q-16,-18 -10,2 q6,20 10,-2 q16,-18 10,2 q-6,20 -10,-2Z`, fill });
      L.push({ z: z + 0.1, d: `M${CX + 26},46 l-6,22 M${CX + 30},46 l6,22`, fill: 'none', stroke: fill, sw: 3, isLine: true });
      break;
    case 'headscarf':
      L.push({ z, d: spline([[142, 100], [146, 50], [164, 32], [180, 28], [196, 32], [214, 50], [218, 100], [206, 132], [180, 142], [154, 132]], true, 0.9) + spline([[150, 84, 'c'], [156, 60], [180, 52], [204, 60], [210, 84, 'c'], [206, 118], [180, 128], [154, 118]], true, 0.8), fill, evenodd: true });
      L.push({ z: z + 0.2, d: `M${CX - 8},128 q-14,22 -20,36 M${CX + 8},128 q14,22 20,36`, fill: 'none', stroke: fill, sw: 6, isLine: true });
      break;
    case 'headband':
      L.push({ z, d: `M148,74 q32,-52 64,0`, fill: 'none', stroke: fill, sw: 9, isLine: true });
      break;
    case 'visor':
      L.push({ z, d: spline([[140, 76, 'c'], [180, 68], [220, 76, 'c'], [180, 92]], true, 0.9), fill });
      L.push({ z: z + 0.1, d: `M146,74 q34,-10 68,0`, fill: 'none', stroke: fill, sw: 5, isLine: true });
      break;
    case 'cowboyhat':
      L.push({ z, d: spline([[150, 70], [154, 36], [180, 26], [206, 36], [210, 70], [180, 64]], true, 0.9), fill });
      L.push({ z: z + 0.1, d: spline([[122, 64, 'c'], [150, 72], [180, 68], [210, 72], [238, 64, 'c'], [220, 84], [180, 90], [140, 84]], true, 0.7), fill, shadeMore: true });
      break;
    case 'claw':
      L.push({ z, d: `M${CX + 36},46 l10,-6 l6,10 l-8,8 Z M${CX + 40},40 l4,-12 l6,8`, fill });
      break;
    default:
      L.push({ z, d: spline([[146, 78], [150, 48], [166, 34], [180, 30], [194, 34], [210, 48], [214, 78], [180, 72]], true, 0.9), fill });
  }
  return L;
}

// ---------- EYEWEAR ----------
export function eyewear(p = {}) {
  const { type = 'shield', fill = '#111', lens = 'rgba(20,20,24,.85)', z = Z.eyewear } = p;
  const L = [];
  switch (type) {
    case 'shield':
      L.push({ z, d: spline([[146, 74, 'c'], [214, 74, 'c'], [212, 92], [196, 98], [180, 90], [164, 98], [148, 92]], true, 0.8), fill: lens });
      L.push({ z: z + 0.1, d: `M146,74 L214,74`, fill: 'none', stroke: fill, sw: 2, isLine: true });
      break;
    case 'thin':
      L.push({ z, d: `M157,76 h18 a3,3 0 0 1 3,3 v8 a3,3 0 0 1 -3,3 h-18 a3,3 0 0 1 -3,-3 v-8 a3,3 0 0 1 3,-3Z M185,76 h18 a3,3 0 0 1 3,3 v8 a3,3 0 0 1 -3,3 h-18 a3,3 0 0 1 -3,-3 v-8 a3,3 0 0 1 3,-3Z`, fill: lens, stroke: fill, sw: 1.4 });
      L.push({ z: z + 0.1, d: `M178,81 h4 M154,80 l-8,4 M206,80 l8,4`, fill: 'none', stroke: fill, sw: 1.4, isLine: true });
      break;
    case 'round':
      L.push({ z, d: `M166,82 m-10,0 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0 M194,82 m-10,0 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0`, fill: lens, stroke: fill, sw: 1.6 });
      L.push({ z: z + 0.1, d: `M176,82 h8 M156,80 l-8,4 M204,80 l8,4`, fill: 'none', stroke: fill, sw: 1.4, isLine: true });
      break;
    case 'cateye':
      L.push({ z, d: spline([[152, 74, 'c'], [176, 80], [176, 92], [160, 94], [154, 86]], true, 0.6) + spline([[208, 74, 'c'], [184, 80], [184, 92], [200, 94], [206, 86]], true, 0.6), fill: lens, stroke: fill, sw: 1.4 });
      L.push({ z: z + 0.1, d: `M176,82 h8`, fill: 'none', stroke: fill, sw: 1.6, isLine: true });
      break;
    case 'oval':
      L.push({ z, d: `M166,83 m-9,0 a9,6 0 1,0 18,0 a9,6 0 1,0 -18,0 M194,83 m-9,0 a9,6 0 1,0 18,0 a9,6 0 1,0 -18,0`, fill: lens, stroke: fill, sw: 1.4 });
      L.push({ z: z + 0.1, d: `M175,83 h10 M157,82 l-9,3 M203,82 l9,3`, fill: 'none', stroke: fill, sw: 1.3, isLine: true });
      break;
    default:
      L.push({ z, d: spline([[146, 74, 'c'], [214, 74, 'c'], [212, 92], [196, 98], [180, 90], [164, 98], [148, 92]], true, 0.8), fill: lens });
  }
  return L;
}

// ---------- JEWELLERY ----------
export function earrings(p = {}) {
  const { type = 'hoops', fill = '#D9D4C7', z = Z.earring } = p;
  const L = [];
  const ex = [147, 213], ey = 104;
  for (const x of ex) {
    switch (type) {
      case 'hoops': L.push({ z, d: `M${x},${ey + 10} m-9,0 a9,9 0 1,0 18,0 a9,9 0 1,0 -18,0`, fill: 'none', stroke: fill, sw: 2.2, isLine: true }); break;
      case 'bigHoops': L.push({ z, d: `M${x},${ey + 18} m-15,0 a15,15 0 1,0 30,0 a15,15 0 1,0 -30,0`, fill: 'none', stroke: fill, sw: 2.4, isLine: true }); break;
      case 'drops': L.push({ z, d: `M${x},${ey} v16 m0,0 m-4,4 a4,6 0 1,0 8,0 a4,6 0 1,0 -8,0`, fill, stroke: fill, sw: 1.4 }); break;
      case 'studs': L.push({ z, d: `M${x},${ey} m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0`, fill }); break;
      case 'statement': L.push({ z, d: `M${x},${ey} l-9,16 l9,20 l9,-20Z`, fill }); break;
      case 'pearl': L.push({ z, d: `M${x},${ey + 2} m-4,0 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0 M${x},${ey + 8} v8 M${x},${ey + 22} m-6,0 a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0`, fill, stroke: fill, sw: 1.2 }); break;
      default: L.push({ z, d: `M${x},${ey} m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0`, fill });
    }
  }
  return L;
}

export function necklace(p = {}) {
  const { type = 'chain', fill = '#D9D4C7', z = Z.neck } = p;
  const L = [];
  switch (type) {
    case 'chain': L.push({ z, d: `M${CX - 24},150 q24,48 48,0`, fill: 'none', stroke: fill, sw: 1.4, isLine: true }); break;
    case 'pendant': L.push({ z, d: `M${CX - 24},150 q24,52 48,0 M${CX},188 l-5,8 l5,8 l5,-8Z`, fill, stroke: fill, sw: 1.4 }); break;
    case 'pearls': {
      let d = '';
      for (let i = 0; i <= 12; i++) { const t = i / 12; const x = CX - 24 + 48 * t; const y = 150 + 36 * Math.sin(t * Math.PI); d += `M${f1(x)},${f1(y)} m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0 `; }
      L.push({ z, d, fill });
      break;
    }
    case 'choker': L.push({ z, d: `M${CX - 13},138 q13,6 26,0 v9 q-13,6 -26,0Z`, fill }); break;
    case 'layered': L.push({ z, d: `M${CX - 22},150 q22,34 44,0 M${CX - 24},150 q24,54 48,0 M${CX - 26},150 q26,76 52,0`, fill: 'none', stroke: fill, sw: 1.3, isLine: true }); break;
    case 'ribbon': L.push({ z, d: `M${CX - 14},140 q14,6 28,0 v8 q-14,6 -28,0Z M${CX},150 q-14,-8 -10,6 q10,6 10,-6 q14,-8 10,6 q-10,6 -10,-6Z`, fill }); break;
    case 'collar': L.push({ z, d: `M${CX - 20},148 q20,30 40,0 q-20,54 -40,0Z`, fill }); break;
    default: L.push({ z, d: `M${CX - 24},150 q24,48 48,0`, fill: 'none', stroke: fill, sw: 1.4, isLine: true });
  }
  return L;
}

export function belt(p = {}) {
  const { fill = '#111', buckle = '#D9D4C7', z = Z.belt, y = 290, wide = false } = p;
  const h = wide ? 20 : 10;
  const half = torsoHalf(y) + 3;
  return [
    { z, d: `M${f1(CX - half)},${y - h / 2} h${f1(2 * half)} v${h} h-${f1(2 * half)}Z`, fill },
    { z: z + 0.1, d: `M${CX - 7},${y - h / 2 - 1} h14 v${h + 2} h-14Z`, fill: 'none', stroke: buckle, sw: 2, isLine: true },
  ];
}

export function scarf(p = {}) {
  const { fill = '#111', z = Z.scarf, long = true } = p;
  const L = [{ z, d: spline([[CX - 36, 150], [CX - 44, 176], [CX - 20, 198], [CX + 20, 198], [CX + 44, 176], [CX + 36, 150], [CX, 160]], true, 0.9), fill }];
  if (long) L.push({ z, d: spline([[CX - 28, 186, 'c'], [CX - 6, 190, 'c'], [CX - 4, 330, 'c'], [CX - 30, 326, 'c']], true), fill });
  return L;
}

export function gloves(p = {}) {
  const { fill = '#111', z = Z.gloves, opera = false } = p;
  const L = [];
  for (const s of [-1, 1]) {
    const from = opera ? 300 : 426;
    const pts = [[armOuter(s, from, 1), from, 'c']];
    for (const y of range(from, 430, 40).slice(1)) pts.push([armOuter(s, y, 1), y]);
    pts.push([CX + s * 91, 452]); pts.push([CX + s * 84, 476]); pts.push([CX + s * 73, 462]);
    pts.push([armInner(s, 430, 1), 430]);
    for (const y of rev(range(from, 430, 40).slice(1, -1))) pts.push([armInner(s, y, 1), y]);
    pts.push([armInner(s, from, 1), from, 'c']);
    L.push({ z, d: spline(pts, true, 0.8), fill });
  }
  return L;
}

// Utility for items that want a tiny graphic badge (e.g. a brooch).
export function brooch(p = {}) {
  const { fill = '#D9D4C7', z = Z.neck + 1, x = CX - 40, y = 200 } = p;
  return [{ z, d: `M${x},${y} l-7,7 l7,7 l7,-7Z`, fill }];
}

/* ---------- HAIR ACCESSORIES (head group) ---------- */
export function hairAcc(p = {}) {
  const { type = 'bow', fill = '#111', accent = '#F2EFE8', z = Z.headwear - 1 } = p;
  const L = [];
  switch (type) {
    case 'bow': // big satin bow, side of the head
      L.push({ z, d: `M${CX + 30},40 q-18,-20 -12,2 q6,20 12,-2 q18,-20 12,2 q-6,20 -12,-2Z`, fill });
      L.push({ z: z + 0.1, d: `M${CX + 30},42 m-4,-3 h8 v6 h-8Z`, fill, shadeMore: true });
      L.push({ z: z + 0.1, d: `M${CX + 27},45 l-7,24 M${CX + 33},45 l7,24`, fill: 'none', stroke: fill, sw: 3.2, isLine: true });
      break;
    case 'miniBows':
      for (const [x, y] of [[CX - 30, 46], [CX + 30, 46]]) L.push({ z, d: `M${x},${y} q-9,-10 -6,1 q3,10 6,-1 q9,-10 6,1 q-3,10 -6,-1Z`, fill });
      break;
    case 'camellia': { // layered flower
      let d = '';
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; d += `M${CX + 34},46 m${Math.cos(a) * 4},${Math.sin(a) * 4} a7,5 ${(a * 180) / Math.PI} 1,0 ${Math.cos(a) * 10},${Math.sin(a) * 10} a7,5 ${(a * 180) / Math.PI} 1,0 ${-Math.cos(a) * 10},${-Math.sin(a) * 10}Z `; }
      L.push({ z, d, fill });
      L.push({ z: z + 0.1, d: `M${CX + 34},46 m-4,0 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0`, fill: accent });
      break;
    }
    case 'pearlPins':
      L.push({ z, d: [[CX - 26, 52], [CX - 18, 44], [CX - 10, 39], [CX + 12, 39], [CX + 20, 44], [CX + 28, 52]].map(([x, y]) => `M${x},${y} m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0`).join(' '), fill: '#F3EFE6' });
      break;
    case 'headband':
      L.push({ z, d: `M146,76 q34,-56 68,0`, fill: 'none', stroke: fill, sw: 8, isLine: true });
      break;
    case 'pearlHeadband':
      L.push({ z, d: `M146,76 q34,-56 68,0`, fill: 'none', stroke: fill, sw: 7, isLine: true });
      L.push({ z: z + 0.1, d: Array.from({ length: 9 }, (_, i) => { const t = i / 8; const x = 150 + 60 * t; const y = 74 - 52 * Math.sin(t * Math.PI) * 0.95; return `M${x.toFixed(1)},${y.toFixed(1)} m-2.4,0 a2.4,2.4 0 1,0 4.8,0 a2.4,2.4 0 1,0 -4.8,0`; }).join(' '), fill: '#F3EFE6' });
      break;
    case 'ribbon': // long ribbon tied at the back, tails falling
      L.push({ z, d: `M${CX + 26},44 q-12,-12 -8,2 q4,12 8,-2 q12,-12 8,2 q-4,12 -8,-2Z`, fill });
      L.push({ z: z - 70, d: `M${CX + 20},50 q10,80 -4,170 l10,0 q14,-90 2,-170Z`, fill });
      break;
    case 'scrunchie':
      L.push({ z: Z.hairBack + 0.2, d: `M180,118 m-16,0 a16,9 0 1,0 32,0 a16,9 0 1,0 -32,0`, fill });
      break;
    case 'tiara':
      L.push({ z, d: `M150,62 L158,48 L166,58 L174,40 L180,54 L186,40 L194,58 L202,48 L210,62Z`, fill });
      L.push({ z: z + 0.1, d: `M174,42 m-2,0 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0 M186,42 m-2,0 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0 M180,56 m-2,0 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0`, fill: accent });
      break;
    case 'clip':
      L.push({ z, d: `M${CX + 36},48 l12,-7 l7,12 l-9,9Z M${CX + 41},41 l5,-14 l7,9`, fill });
      break;
    case 'flowerCrown': {
      let d = '';
      for (let i = 0; i <= 8; i++) { const t = i / 8; const x = 148 + 64 * t; const y = 74 - 50 * Math.sin(t * Math.PI) * 0.95; for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; d += `M${(x + Math.cos(a) * 3.5).toFixed(1)},${(y + Math.sin(a) * 3.5).toFixed(1)} m-2.4,0 a2.4,2.4 0 1,0 4.8,0 a2.4,2.4 0 1,0 -4.8,0 `; } }
      L.push({ z, d, fill });
      break;
    }
    case 'veil':
      L.push({ z: z - 70, d: spline([[138, 60], [130, 200], [136, 330], [180, 346], [224, 330], [230, 200], [222, 60], [180, 40]], true, 0.9), fill, opacity: 0.45 });
      break;
    default:
      L.push({ z, d: `M${CX + 30},40 q-18,-20 -12,2 q6,20 12,-2 q18,-20 12,2 q-6,20 -12,-2Z`, fill });
  }
  return L;
}

/* ---------- BRACELETS / CUFFS (viewer-left wrist) ---------- */
export function bracelet(p = {}) {
  const { type = 'cuff', fill = '#D9D4C7', z = Z.gloves + 1 } = p;
  const L = [];
  for (const s of [-1]) {
    const xo = armOuter(s, 426, 1), xi = armInner(s, 426, 1);
    switch (type) {
      case 'cuff': L.push({ z, d: `M${f1(xo)},420 L${f1(xi)},420 L${f1(armInner(s, 434, 1))},434 L${f1(armOuter(s, 434, 1))},434Z`, fill }); break;
      case 'bangles': L.push({ z, d: `M${f1(xo)},422 L${f1(xi)},422 M${f1(xo)},427 L${f1(xi)},427 M${f1(xo)},432 L${f1(xi)},432`, fill: 'none', stroke: fill, sw: 1.6, isLine: true }); break;
      case 'chain': L.push({ z, d: `M${f1(xo)},426 L${f1(xi)},426`, fill: 'none', stroke: fill, sw: 1.6, dash: '2 2', isLine: true }); break;
      case 'pearls': L.push({ z, d: Array.from({ length: 5 }, (_, i) => { const x = xo + ((xi - xo) * i) / 4; return `M${f1(x)},427 m-2,0 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0`; }).join(' '), fill }); break;
      case 'watch': L.push({ z, d: `M${f1(xo)},424 L${f1(xi)},424 L${f1(xi)},430 L${f1(xo)},430Z`, fill }); L.push({ z: z + 0.1, d: `M${f1((xo + xi) / 2)},427 m-4,0 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0`, fill: '#F3EFE6', stroke: fill, sw: 1 }); break;
      case 'ribbonWrist': L.push({ z, d: `M${f1(xo)},426 L${f1(xi)},426 M${f1(xo + 2)},426 q-6,-6 -2,-8 q4,2 2,8 q-6,6 -2,8 q4,-2 2,-8`, fill: 'none', stroke: fill, sw: 2.2, isLine: true }); break;
      default: L.push({ z, d: `M${f1(xo)},422 L${f1(xi)},422 L${f1(armInner(s, 432, 1))},432 L${f1(armOuter(s, 432, 1))},432Z`, fill });
    }
  }
  return L;
}

/* ---------- HANDHELD (viewer-right hand) ---------- */
export function handheld(p = {}) {
  const { type = 'coffee', fill = '#F3EFE6', accent = '#111', z = Z.bag + 2 } = p;
  const L = [];
  const hx = CX + 86, hy = 452;
  switch (type) {
    case 'coffee': L.push({ z, d: `M${hx - 7},${hy - 14} h14 l-2,22 h-10Z`, fill }); L.push({ z: z + 0.1, d: `M${hx - 8},${hy - 14} h16 v3 h-16Z`, fill: accent }); break;
    case 'phone': L.push({ z, d: `M${hx - 6},${hy - 16} h12 v24 h-12Z`, fill: accent }); L.push({ z: z + 0.1, d: `M${hx - 4},${hy - 14} h8 v18 h-8Z`, fill, opacity: 0.9 }); break;
    case 'book': L.push({ z, d: `M${hx - 12},${hy - 10} h22 v30 h-22Z`, fill }); L.push({ z: z + 0.1, d: `M${hx - 12},${hy - 10} h4 v30 h-4Z`, fill: accent }); break;
    case 'bouquet': {
      L.push({ z, d: `M${hx - 2},${hy + 4} l-6,30 h14 l-6,-30Z`, fill: '#B9CFA3' });
      let d = '';
      for (const [dx, dy] of [[-10, -2], [0, -10], [10, -2], [-5, 6], [6, 6], [0, 0]]) d += `M${hx + dx},${hy + dy} m-6,0 a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0 `;
      L.push({ z: z + 0.1, d, fill });
      L.push({ z: z + 0.2, d: `M${hx - 2},${hy + 12} h6 l-2,6 h-2Z`, fill: accent });
      break;
    }
    case 'fan': {
      let d = `M${hx},${hy - 4}`;
      for (let i = 0; i <= 8; i++) { const a = Math.PI + (i / 8) * Math.PI * 0.8 + 0.1; d += ` L${f1(hx + Math.cos(a) * 30)},${f1(hy - 4 + Math.sin(a) * 30)}`; }
      L.push({ z, d: d + 'Z', fill });
      L.push({ z: z + 0.1, d: Array.from({ length: 7 }, (_, i) => { const a = Math.PI + (i / 7) * Math.PI * 0.8 + 0.15; return `M${hx},${hy - 4} L${f1(hx + Math.cos(a) * 28)},${f1(hy - 4 + Math.sin(a) * 28)}`; }).join(' '), fill: 'none', stroke: accent, sw: 0.8, isLine: true });
      break;
    }
    case 'umbrella':
      L.push({ z: z - 60, d: `M${hx + 4},${hy - 30} L${hx + 4},${hy + 120} q0,10 -8,10`, fill: 'none', stroke: accent, sw: 2.2, isLine: true });
      L.push({ z: z - 60, d: `M${hx + 4},${hy - 34} l-6,24 h12Z`, fill });
      L.push({ z: z - 60, d: `M${hx - 4},${hy - 10} q8,-8 16,0 q-8,4 -16,0Z`, fill, shadeMore: true });
      break;
    case 'clutchHand': L.push({ z, d: `M${hx - 24},${hy - 4} h40 v16 h-40Z`, fill }); L.push({ z: z + 0.1, d: `M${hx - 24},${hy + 3} h40`, fill: 'none', stroke: accent, sw: 1, isLine: true }); break;
    case 'camera': L.push({ z, d: `M${hx - 14},${hy - 8} h28 v18 h-28Z`, fill: accent }); L.push({ z: z + 0.1, d: `M${hx},${hy + 1} m-6,0 a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0`, fill }); break;
    default: L.push({ z, d: `M${hx - 7},${hy - 14} h14 l-2,22 h-10Z`, fill });
  }
  return L;
}
