// Poses. The rig and every garment are drawn standing straight and symmetrical; a pose bends the finished drawing.
// Two smooth warps do it. The body warp moves every point of the body and its clothes the same way (hips to one side,
// shoulders tilted against them, the weight leg slanting in under the head, the free leg stepping out), so garments
// stay on the body by construction. The arm warp turns the arms, and everything worn or carried on them, about the
// shoulder and the elbow before the body warp is applied. Paths are parsed, made absolute and re-emitted warped.
import { CX } from './rig.js';

const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const bump = (y, c, w) => Math.exp(-(((y - c) / w) ** 2));
const rot = (x, y, px, py, deg) => { const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), dx = x - px, dy = y - py; return [px + dx * c - dy * s, py + dx * s + dy * c]; };

// flip = 1: weight on the viewer's-left leg; flip = -1: the mirror image (used for the rival, so the two differ).
export function bodyWarp(flip = 1) {
  return (x, y) => {
    const rx = x - CX;
    let dx = flip * (-11 * bump(y, 372, 130) + 3 * bump(y, 185, 90));
    let dy = flip * 4.2 * (rx / 57) * bump(y, 172, 70) - flip * 4 * (rx / 55) * bump(y, 372, 70);
    if (y > 402) {
      const u = Math.min(1.2, (y - 402) / 403);
      const free = sm(-12, 12, rx * flip);                 // 0 on the weight leg, 1 on the free leg
      dx += flip * ((1 - free) * 13 * u + free * (-7 * Math.sin(Math.PI * Math.min(1, u)) + 21 * Math.pow(u, 1.4)));
      dy += free * -5 * u;
    }
    return [x + dx, y + dy];
  };
}

// Arms: [outward swing at the shoulder, inward bend at the elbow], in degrees, for the viewer's-left and right arm.
// The right hand carries bags and cups, so it stays lower and straighter.
const ARM = { '-1': [10, 24], '1': [6, 9] };
export function armWarp(body) {
  return (x, y) => {
    const s = x < CX ? -1 : 1;
    const [a1, a2] = ARM[s];
    let p = [x, y];
    p = rot(p[0], p[1], CX + s * 75, 300, s * a2 * sm(285, 318, y));          // forearm in, about the elbow
    p = rot(p[0], p[1], CX + s * 50, 172, -s * a1 * sm(165, 250, y));         // whole arm out, about the shoulder
    return body(p[0], p[1]);
  };
}
export const HEAD_TILT = -2.2; // degrees; the head leans a little toward the high shoulder

// Layers that live on the arms: sleeves, gloves, bracelets, and what the hand or shoulder carries.
export const isArmLayer = (z) => (z >= 41 && z < 42) || (z >= 43 && z < 45) || (z >= 51 && z < 52) || (z >= 56 && z < 60);

const r1 = (n) => Math.round(n * 10) / 10;
const cache = new Map();
/** Re-emit an SVG path with every point passed through fn(x, y) → [x, y]. Long straight runs are split so they bend. */
export function warpPath(d, fn, key = '') {
  if (!d) return d;
  const ck = key && key + d;
  if (ck && cache.has(ck)) return cache.get(ck);
  const P = (x, y) => { const q = fn(x, y); return `${r1(q[0])},${r1(q[1])}`; };
  let out = '', cx = 0, cy = 0, sx = 0, sy = 0, lcx = null, lcy = null, prev = '';
  const line = (x, y) => {
    const n = Math.max(1, Math.ceil(Math.hypot(x - cx, y - cy) / 34));
    for (let i = 1; i <= n; i++) out += `L${P(cx + ((x - cx) * i) / n, cy + ((y - cy) * i) / n)}`;
    cx = x; cy = y;
  };
  const re = /([MLHVCSQTAZmlhvcsqtaz])([^MLHVCSQTAZmlhvcsqtaz]*)/g;
  let m;
  while ((m = re.exec(d))) {
    const c = m[1], up = c.toUpperCase(), rel = c !== up;
    const a = (m[2].match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
    const X = (v) => (rel ? cx + v : v), Y = (v) => (rel ? cy + v : v);
    if (up === 'Z') { out += 'Z'; cx = sx; cy = sy; prev = 'Z'; continue; }
    const step = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7 }[up];
    for (let i = 0; i + step <= a.length; i += step) {
      const v = a.slice(i, i + step);
      const cmd = up === 'M' && i > 0 ? 'L' : up;
      if (cmd === 'M') { cx = X(v[0]); cy = Y(v[1]); sx = cx; sy = cy; out += `M${P(cx, cy)}`; }
      else if (cmd === 'L') line(X(v[0]), Y(v[1]));
      else if (cmd === 'H') line(X(v[0]), cy);
      else if (cmd === 'V') line(cx, Y(v[0]));
      else if (cmd === 'C' || cmd === 'S') {
        let x1, y1, k = 0;
        if (cmd === 'C') { x1 = X(v[0]); y1 = Y(v[1]); k = 2; }
        else { const ok = prev === 'C' || prev === 'S'; x1 = ok ? 2 * cx - lcx : cx; y1 = ok ? 2 * cy - lcy : cy; }
        const x2 = X(v[k]), y2 = Y(v[k + 1]), x = X(v[k + 2]), y = Y(v[k + 3]);
        out += `C${P(x1, y1)} ${P(x2, y2)} ${P(x, y)}`;
        lcx = x2; lcy = y2; cx = x; cy = y;
      } else if (cmd === 'Q' || cmd === 'T') {
        let x1, y1, k = 0;
        if (cmd === 'Q') { x1 = X(v[0]); y1 = Y(v[1]); k = 2; }
        else { const ok = prev === 'Q' || prev === 'T'; x1 = ok ? 2 * cx - lcx : cx; y1 = ok ? 2 * cy - lcy : cy; }
        const x = X(v[k]), y = Y(v[k + 1]);
        out += `Q${P(x1, y1)} ${P(x, y)}`;
        lcx = x1; lcy = y1; cx = x; cy = y;
      } else if (cmd === 'A') {
        const x = X(v[5]), y = Y(v[6]);
        out += `A${v[0]},${v[1]} ${v[2]} ${v[3] ? 1 : 0},${v[4] ? 1 : 0} ${P(x, y)}`;
        cx = x; cy = y;
      }
      prev = cmd;
    }
  }
  if (ck) { if (cache.size > 6000) cache.clear(); cache.set(ck, out); }
  return out;
}
