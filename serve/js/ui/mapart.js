// Chapter art as soft 3D renders: a studio backdrop, matte and glossy materials, one light from the top left,
// contact shadows and specular highlights. Covers are hero objects; scenes are the worlds the level pins sit in.
import { spline } from '../render/rig.js';

/* ---------- colour ---------- */
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const toHex = (r, g, b) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => { const A = hex(a), B = hex(b); return toHex(...A.map((v, i) => v + (B[i] - v) * t)); };
const light = (c, t) => mix(c, '#FFFFFF', t);
const dark = (c, t) => mix(c, '#000000', t);
const r1 = (n) => Math.round(n * 10) / 10;
let seed = 1;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

/* worlds: sky and floor gradients, three materials, an ink for shadows */
export const WORLD = {
  c1: { sky: ['#FFE6F1', '#FFC7DF'], floor: ['#FFD3E6', '#F9B4D0'], a: '#F06BAE', b: '#FFF8FB', c: '#F6C453', pin: '#E0218A', ink: '#5A1C3C', blocks: ['#F06BAE', '#FFB1D3', '#FFFFFF', '#F8C8DD'], tree: '#F9B3CF' },
  c2: { sky: ['#FFF1F7', '#FFD6E8'], floor: ['#FDCFE2', '#F6B0CC'], a: '#E0218A', b: '#FFFBFD', c: '#D9A94A', pin: '#5FC9C0', ink: '#4A1430', blocks: ['#FFFFFF', '#FFE6F1', '#FFF2F8'], tree: '#F9B3CF' },
  c3: { sky: ['#3A0F30', '#80205F'], floor: ['#4D1539', '#2A0A22'], a: '#FF4FA3', b: '#FFE1EE', c: '#F6C453', pin: '#FF4FA3', ink: '#14050F', dark: true, blocks: ['#5E1E4C', '#73265C', '#4A1540'], tree: '#C96BA0' },
  c4: { sky: ['#FFEAF3', '#FFD1E5'], floor: ['#FBD0E1', '#F3B3CC'], a: '#F26BA8', b: '#5FC9C0', c: '#F6D86B', pin: '#E0218A', ink: '#4A1838', blocks: ['#FFFFFF', '#FFE6F1'], tree: '#F9B3CF' },
  c5: { sky: ['#FDE7F3', '#EBD3F2'], floor: ['#F3D7E8', '#DDBDD8'], a: '#C9A6DC', b: '#FF77B7', c: '#5FC9C0', pin: '#FF77B7', ink: '#3A1A3A', blocks: ['#FFFFFF', '#F3E3F5'], tree: '#9FD9C9' },
  c6: { sky: ['#FFE6F1', '#CDEFF5'], floor: ['#FFE9C9', '#F9D6A3'], a: '#F6C453', b: '#5FC9C0', c: '#FF5FA2', pin: '#FF5FA2', ink: '#4A2A30', blocks: ['#FFFFFF', '#FFE6F1'], tree: '#9FD9C9' },
  c7: { sky: ['#2B0A1E', '#5E1548'], floor: ['#3C0F2E', '#1C0616'], a: '#B0338A', b: '#FFE1EE', c: '#FF2E88', pin: '#FF2E88', ink: '#0F0310', dark: true, blocks: ['#4A1540', '#5E1E4C'], tree: '#C96BA0' },
  c8: { sky: ['#FFE3F0', '#FFC2DC'], floor: ['#FFCFE3', '#F7B0CD'], a: '#E0218A', b: '#1A1418', c: '#5FC9C0', pin: '#5FC9C0', ink: '#3A1428', blocks: ['#FFFFFF', '#FFE6F1', '#FFF0F6'], tree: '#F9B3CF' },
};

/* ---------- defs collector ---------- */
let NS = 'x';
let DEFS = new Map();
const def = (id, markup) => { if (!DEFS.has(id)) DEFS.set(id, markup); return `url(#${id})`; };
const key = (c) => c.replace('#', '');
const matte = (c) => def(`${NS}-m${key(c)}`, `<radialGradient id="${NS}-m${key(c)}" cx=".36" cy=".3" r=".78"><stop offset="0" stop-color="${light(c, 0.42)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${dark(c, 0.34)}"/></radialGradient>`);
const side = (c) => def(`${NS}-s${key(c)}`, `<linearGradient id="${NS}-s${key(c)}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${dark(c, 0.28)}"/><stop offset=".28" stop-color="${light(c, 0.3)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${dark(c, 0.42)}"/></linearGradient>`);
const vert = (c0, c1, id) => def(`${NS}-v${id}`, `<linearGradient id="${NS}-v${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></linearGradient>`);
const gloss = () => def(`${NS}-gl`, `<radialGradient id="${NS}-gl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`);
const chromeG = () => def(`${NS}-cr`, `<linearGradient id="${NS}-cr" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".22" stop-color="#B9C0CA"/><stop offset=".45" stop-color="#F4F6F9"/><stop offset=".55" stop-color="#7E8792"/><stop offset=".8" stop-color="#E7EBF0"/><stop offset="1" stop-color="#5F6873"/></linearGradient>`);
const glassG = () => def(`${NS}-gs`, `<linearGradient id="${NS}-gs" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".62"/><stop offset=".5" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity=".4"/></linearGradient>`);
const blur = (n) => def(`${NS}-b${n}`, `<filter id="${NS}-b${n}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="${n}"/></filter>`);
const clipCircle = (id, cx, cy, r) => def(`${NS}-c${id}`, `<clipPath id="${NS}-c${id}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>`);

/* ---------- primitives (exported for js/ui/objects.js) ---------- */
let INK = '#222';
const shadow = (cx, cy, rx, ry, op = 0.26, b = 5) => `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${INK}" opacity="${op}" filter="${blur(b)}"/>`;
const spec = (cx, cy, rx, ry, rot = -35, op = 0.85) => `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${gloss()}" opacity="${op}" transform="rotate(${rot} ${r1(cx)} ${r1(cy)})"/>`;
export function sphere(cx, cy, r, c, o = {}) {
  const sh = o.shadow === false ? '' : shadow(cx, cy + r * 0.98, r * 0.88, r * 0.2, o.shOp ?? 0.26, Math.max(3, r * 0.18));
  const rim = `<path d="M${r1(cx - r * 0.2)},${r1(cy + r * 0.92)} A${r},${r} 0 0 0 ${r1(cx + r * 0.9)},${r1(cy + r * 0.3)}" fill="none" stroke="#fff" stroke-width="${Math.max(1, r * 0.08)}" opacity=".35" stroke-linecap="round"/>`;
  return `${sh}<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="${matte(c)}"/>${spec(cx - r * 0.36, cy - r * 0.42, r * 0.34, r * 0.2)}${rim}`;
}
export function cyl(cx, yTop, rx, ry, h, c, o = {}) {
  const body = `M${r1(cx - rx)},${r1(yTop)} v${r1(h)} a${rx},${ry} 0 0 0 ${r1(rx * 2)},0 v${r1(-h)}Z`;
  return `${o.shadow === false ? '' : shadow(cx, yTop + h + ry * 0.6, rx * 1.15, ry * 0.9, 0.24, 5)}<path d="${body}" fill="${side(c)}"/><ellipse cx="${r1(cx)}" cy="${r1(yTop)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${o.top || light(c, 0.3)}"/><ellipse cx="${r1(cx)}" cy="${r1(yTop)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="none" stroke="#fff" stroke-width="1" opacity=".55"/><path d="M${r1(cx - rx * 0.72)},${r1(yTop + h * 0.12)} v${r1(h * 0.7)}" stroke="#fff" stroke-width="${Math.max(1.2, rx * 0.12)}" opacity=".35" stroke-linecap="round"/>`;
}
export function box(x, y, w, h, d, c, o = {}) {
  const k = o.k ?? 0.55;
  const top = `M${x},${y} l${d},${r1(-d * k)} h${w} l${-d},${r1(d * k)}Z`;
  const right = `M${x + w},${y} l${d},${r1(-d * k)} v${h} l${-d},${r1(d * k)}Z`;
  const sh = o.shadow === false ? '' : `<path d="M${x + 4},${y + h} l${d},${r1(-d * k)} h${w} l${8},${8} h${-w - 6}Z" fill="${INK}" opacity=".22" filter="${blur(4)}"/>`;
  return `${sh}<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${vert(light(c, 0.1), dark(c, 0.12), key(c))}" rx="${o.rx ?? 2}"/><path d="${top}" fill="${light(c, 0.38)}"/><path d="${right}" fill="${dark(c, 0.3)}"/><path d="M${x + 1.5},${y + 2} v${h - 4}" stroke="#fff" stroke-width="1" opacity=".3"/>`;
}
export function cone(cx, yTop, yBase, rBase, c, o = {}) {
  const d = `M${r1(cx)},${r1(yTop)} L${r1(cx - rBase)},${r1(yBase)} a${rBase},${rBase * 0.3} 0 0 0 ${r1(rBase * 2)},0Z`;
  return `${o.shadow === false ? '' : shadow(cx, yBase + rBase * 0.2, rBase * 1.1, rBase * 0.28)}<path d="${d}" fill="${side(c)}"/>${o.base === false ? '' : `<ellipse cx="${r1(cx)}" cy="${r1(yBase)}" rx="${r1(rBase)}" ry="${r1(rBase * 0.3)}" fill="${dark(c, 0.2)}"/>`}`;
}
export function torus(cx, cy, r, t, c, o = {}) {
  if (o.from == null && o.to == null) {
    return `${o.shadow === false ? '' : `<circle cx="${r1(cx + 2)}" cy="${r1(cy + 5)}" r="${r}" fill="none" stroke="${INK}" stroke-width="${t}" opacity=".18" filter="${blur(3)}"/>`}<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r}" fill="none" stroke="${dark(c, 0.3)}" stroke-width="${t}"/><circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r}" fill="none" stroke="${matte(c)}" stroke-width="${t * 0.8}"/><circle cx="${r1(cx - t * 0.18)}" cy="${r1(cy - t * 0.22)}" r="${r}" fill="none" stroke="#fff" stroke-width="${t * 0.22}" opacity=".55"/>`;
  }
  const a0 = o.from ?? 0, a1 = o.to ?? 359.99;
  const P = (a) => [cx + Math.cos((a * Math.PI) / 180) * r, cy + Math.sin((a * Math.PI) / 180) * r];
  const [x0, y0] = P(a0), [x1, y1] = P(a1);
  const big = a1 - a0 > 180 ? 1 : 0;
  const d = `M${r1(x0)},${r1(y0)} A${r},${r} 0 ${big} 1 ${r1(x1)},${r1(y1)}`;
  return `${o.shadow === false ? '' : `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${t}" opacity=".18" filter="${blur(3)}" transform="translate(2,5)" stroke-linecap="round"/>`}<path d="${d}" fill="none" stroke="${dark(c, 0.3)}" stroke-width="${t}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${matte(c)}" stroke-width="${t * 0.8}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff" stroke-width="${t * 0.22}" opacity=".55" stroke-linecap="round" transform="translate(${-t * 0.18},${-t * 0.22})"/>`;
}
const pane = (x, y, w, h, rx = 10) => `<rect x="${x + 3}" y="${y + 6}" width="${w}" height="${h}" rx="${rx}" fill="${INK}" opacity=".14" filter="${blur(5)}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${glassG()}" stroke="#fff" stroke-opacity=".8" stroke-width="1.2"/><path d="M${x + w * 0.18},${y + h} L${x + w * 0.42},${y}" stroke="#fff" stroke-width="${w * 0.08}" opacity=".35"/>`;
const glow = (cx, cy, r, c, op = 0.5) => `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="${c}" opacity="${op}" filter="${blur(Math.max(6, r * 0.5))}"/>`;
const dome = (cx, yBase, rx, ry, c) => `<path d="M${r1(cx - rx)},${r1(yBase)} a${rx},${ry} 0 0 1 ${r1(rx * 2)},0Z" fill="${matte(c)}"/>`;

/* ---------- backdrop ---------- */
function backdrop(w, h, P, horizon = 0.68, o = {}) {
  const sky = vert(P.sky[0], P.sky[1], 'sky');
  const floor = vert(P.floor[0], P.floor[1], 'floor');
  const hy = r1(h * horizon);
  const haze = def(`${NS}-haze`, `<linearGradient id="${NS}-haze" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${P.sky[1]}" stop-opacity="1"/><stop offset="1" stop-color="${P.sky[1]}" stop-opacity="0"/></linearGradient>`);
  const spot = o.spot === false ? '' : `<ellipse cx="${r1(w * (o.spotX ?? 0.4))}" cy="${hy + 10}" rx="${w * 0.42}" ry="${h * 0.12}" fill="#fff" opacity="${P.dark ? 0.08 : 0.4}" filter="${blur(14)}"/>`;
  return `<rect width="${w}" height="${h}" fill="${sky}"/><rect y="${hy}" width="${w}" height="${r1(h - hy)}" fill="${floor}"/><rect y="${hy}" width="${w}" height="${r1(h * 0.08)}" fill="${haze}"/>${spot}`;
}

/* ---------- motifs ---------- */
const M = {
  coffee(x, y, s, P) {
    const cream = P.dark ? P.b : '#FFB1D3';
    const inside = `<ellipse cx="${x}" cy="${y - s * 0.3}" rx="${s * 0.43}" ry="${s * 0.1}" fill="#5A3A2A"/><ellipse cx="${x - s * 0.08}" cy="${y - s * 0.32}" rx="${s * 0.14}" ry="${s * 0.03}" fill="#fff" opacity=".35"/>`;
    const steam = [[-0.18, 0], [0.04, 0.05], [0.24, 0.02]].map(([k, dy]) => `<path d="${spline([[x + k * s, y - s * 0.46], [x + k * s + s * 0.07, y - s * 0.62], [x + k * s - s * 0.06, y - s * 0.78], [x + k * s + s * 0.05, y - s * (0.92 + dy)]], false, 0.9)}" fill="none" stroke="#fff" stroke-width="${s * 0.07}" opacity=".55" stroke-linecap="round" filter="${blur(2)}"/>`).join('');
    return `${cyl(x, y + s * 0.4, s * 0.62, s * 0.12, s * 0.05, cream)}${torus(x + s * 0.52, y + s * 0.02, s * 0.2, s * 0.09, cream, { from: -80, to: 80 })}${cyl(x, y - s * 0.3, s * 0.48, s * 0.12, s * 0.66, cream, { top: '#FFE3EF' })}${inside}${steam}`;
  },
  pearls(pts, r, P) { return pts.map(([px, py]) => sphere(px, py, r, '#F6EDE6', { shOp: 0.18 })).join(''); },
  bow(x, y, s, P, c = P.a) {
    const loop = (k) => `<ellipse cx="${r1(x + k * s * 0.32)}" cy="${r1(y - s * 0.02)}" rx="${s * 0.34}" ry="${s * 0.2}" fill="${matte(c)}" transform="rotate(${k * -18} ${r1(x + k * s * 0.32)} ${r1(y - s * 0.02)})"/>`;
    const tail = (k) => `<path d="M${x},${y + s * 0.05} l${k * s * 0.14},${s * 0.42} l${k * s * 0.14},${-s * 0.06} l${-k * s * 0.16},${-s * 0.36}Z" fill="${side(c)}"/>`;
    return `${shadow(x, y + s * 0.5, s * 0.6, s * 0.1)}${tail(-1)}${tail(1)}${loop(-1)}${loop(1)}${spec(x - s * 0.42, y - s * 0.12, s * 0.12, s * 0.06)}${spec(x + s * 0.22, y - s * 0.12, s * 0.12, s * 0.06)}${sphere(x, y, s * 0.11, dark(c, 0.1), { shadow: false })}`;
  },
  spool(x, y, s, P, c = P.a) {
    const thread = Array.from({ length: 7 }, (_, i) => `<path d="M${x - s * 0.3},${y - s * 0.3 + i * s * 0.1} q${s * 0.3},${s * 0.04} ${s * 0.6},0" fill="none" stroke="${light(c, 0.5)}" stroke-width="1" opacity=".6"/>`).join('');
    return `${cyl(x, y + s * 0.4, s * 0.42, s * 0.1, s * 0.08, '#F3E7DC')}${cyl(x, y - s * 0.4, s * 0.3, s * 0.08, s * 0.8, c, { shadow: false })}${thread}${cyl(x, y - s * 0.48, s * 0.42, s * 0.1, s * 0.08, '#F3E7DC', { shadow: false })}<path d="M${x + s * 0.3},${y + s * 0.2} q${s * 0.5},${s * 0.08} ${s * 0.9},${-s * 0.2}" fill="none" stroke="${c}" stroke-width="1.6"/>`;
  },
  martini(x, y, s, P) {
    const bowl = `M${x - s * 0.5},${y - s * 0.5} h${s} L${x},${y}Z`;
    const liquid = `M${x - s * 0.38},${y - s * 0.36} h${s * 0.76} L${x},${y - s * 0.02}Z`;
    return `${shadow(x, y + s * 0.5, s * 0.34, s * 0.07, 0.3)}<path d="${bowl}" fill="${glassG()}" stroke="#fff" stroke-opacity=".8" stroke-width="1.2"/><path d="${liquid}" fill="${P.a}" opacity=".85"/><ellipse cx="${x}" cy="${y - s * 0.36}" rx="${s * 0.38}" ry="${s * 0.06}" fill="${light(P.a, 0.3)}" opacity=".9"/><rect x="${x - s * 0.03}" y="${y}" width="${s * 0.06}" height="${s * 0.42}" fill="${glassG()}" stroke="#fff" stroke-opacity=".6" stroke-width=".8"/><ellipse cx="${x}" cy="${y + s * 0.44}" rx="${s * 0.26}" ry="${s * 0.07}" fill="${glassG()}" stroke="#fff" stroke-opacity=".8" stroke-width="1"/><path d="M${x - s * 0.2},${y - s * 0.44} l${s * 0.34},${s * 0.18}" stroke="#fff" stroke-width="1" opacity=".7"/>${sphere(x + s * 0.1, y - s * 0.24, s * 0.08, '#8AA85A', { shadow: false })}<circle cx="${x + s * 0.11}" cy="${y - s * 0.24}" r="${s * 0.025}" fill="#C4203A"/><path d="M${x - s * 0.44},${y - s * 0.48} L${x - s * 0.08},${y - s * 0.12}" stroke="#fff" stroke-width="${s * 0.05}" opacity=".45" stroke-linecap="round"/>`;
  },
  moon(x, y, r, P) { return `${glow(x, y, r * 1.7, P.c, 0.35)}${sphere(x, y, r, '#F8EFDD', { shadow: false })}`; },
  sun(x, y, r, P, c = P.c) { return `${glow(x, y, r * 1.8, c, 0.45)}${sphere(x, y, r, c, { shadow: false })}`; },
  rose(x, y, s, P, c = P.a) {
    let out = shadow(x, y + s * 0.5, s * 0.46, s * 0.1);
    out += `<rect x="${x - s * 0.03}" y="${y + s * 0.3}" width="${s * 0.06}" height="${s * 0.6}" fill="${side('#4E8A6A')}" rx="2"/>`;
    out += `<ellipse cx="${x + s * 0.2}" cy="${y + s * 0.62}" rx="${s * 0.22}" ry="${s * 0.1}" fill="${matte('#5B9E78')}" transform="rotate(-25 ${x + s * 0.2} ${y + s * 0.62})"/>`;
    for (let i = 0; i < 6; i++) { const a = i * 60 + 15; out += `<ellipse cx="${x}" cy="${y}" rx="${s * 0.46}" ry="${s * 0.26}" fill="${matte(dark(c, 0.08))}" transform="rotate(${a} ${x} ${y}) translate(${s * 0.1},0)" opacity=".96"/>`; }
    for (let i = 0; i < 4; i++) { const a = i * 90 + 40; out += `<ellipse cx="${x}" cy="${y}" rx="${s * 0.28}" ry="${s * 0.17}" fill="${matte(c)}" transform="rotate(${a} ${x} ${y}) translate(${s * 0.05},0)"/>`; }
    out += sphere(x, y, s * 0.14, light(c, 0.2), { shadow: false });
    return out;
  },
  parasol(x, y, s, P, c = P.a) {
    const top = `M${x - s * 0.5},${y} a${s * 0.5},${s * 0.5} 0 0 1 ${s},0Z`;
    const segs = Array.from({ length: 3 }, (_, i) => { const a = -150 + i * 40; return `<path d="M${x},${y} L${r1(x + Math.cos((a * Math.PI) / 180) * s * 0.5)},${r1(y + Math.sin((a * Math.PI) / 180) * s * 0.5)}" stroke="#fff" stroke-width="1" opacity=".5"/>`; }).join('');
    const scallops = Array.from({ length: 5 }, (_, i) => `<ellipse cx="${r1(x - s * 0.4 + i * s * 0.2)}" cy="${y}" rx="${s * 0.1}" ry="${s * 0.06}" fill="${dark(c, 0.15)}"/>`).join('');
    return `${shadow(x, y + s * 0.74, s * 0.3, s * 0.06)}<path d="${top}" fill="${matte(c)}"/>${segs}${scallops}${spec(x - s * 0.2, y - s * 0.3, s * 0.14, s * 0.07)}<rect x="${x - s * 0.02}" y="${y - s * 0.56}" width="${s * 0.04}" height="${s * 1.3}" fill="${side('#D9C8B0')}"/>${sphere(x, y - s * 0.56, s * 0.04, P.c, { shadow: false })}`;
  },
  orb(x, y, r, P) { return `${shadow(x, y + r * 0.98, r * 0.9, r * 0.2, 0.3)}<circle cx="${x}" cy="${y}" r="${r}" fill="${chromeG()}"/><circle cx="${x}" cy="${y}" r="${r}" fill="${matte(P.b)}" opacity=".35"/><path d="M${x - r * 0.95},${y + r * 0.25} q${r * 0.95},${r * 0.7} ${r * 1.9},0" fill="none" stroke="${P.c}" stroke-width="${r * 0.08}" opacity=".6"/>${spec(x - r * 0.34, y - r * 0.44, r * 0.3, r * 0.17)}`; },
  lemon(x, y, s, P) {
    return `<g transform="rotate(-16 ${x} ${y})">${shadow(x, y + s * 0.46, s * 0.52, s * 0.1)}<ellipse cx="${x}" cy="${y}" rx="${s * 0.56}" ry="${s * 0.4}" fill="${matte(P.a)}"/>${sphere(x - s * 0.58, y, s * 0.07, P.a, { shadow: false })}${sphere(x + s * 0.58, y, s * 0.07, P.a, { shadow: false })}${spec(x - s * 0.24, y - s * 0.18, s * 0.2, s * 0.09)}<ellipse cx="${x - s * 0.26}" cy="${y - s * 0.44}" rx="${s * 0.26}" ry="${s * 0.1}" fill="${matte('#5B9E78')}" transform="rotate(-30 ${x - s * 0.26} ${y - s * 0.44})"/></g>`;
  },
  ball(x, y, r, P) {
    const clip = clipCircle(`ball${r1(x)}`, x, y, r);
    const stripes = [P.c, P.b, P.a].map((c, i) => `<path d="M${x},${y} m${-r},0 a${r},${r} 0 0 1 ${r * 2},0Z" fill="${c}" transform="rotate(${-70 + i * 50} ${x} ${y})" opacity=".92"/>`).join('');
    return `${shadow(x, y + r * 0.98, r * 0.9, r * 0.2)}<circle cx="${x}" cy="${y}" r="${r}" fill="#FFF8F0"/><g clip-path="${clip}">${stripes}</g><circle cx="${x}" cy="${y}" r="${r}" fill="${matte('#FFFFFF')}" opacity=".55" style="mix-blend-mode:multiply"/>${spec(x - r * 0.36, y - r * 0.42, r * 0.34, r * 0.2)}`;
  },
  umbrella(x, y, s, P, c = P.c) {
    const top = `M${x - s * 0.5},${y} a${s * 0.5},${s * 0.5} 0 0 1 ${s},0Z`;
    const white = [-130, -70, -30].map((a) => `<path d="M${x},${y} L${r1(x + Math.cos((a * Math.PI) / 180) * s * 0.5)},${r1(y + Math.sin((a * Math.PI) / 180) * s * 0.5)} A${s * 0.5},${s * 0.5} 0 0 1 ${r1(x + Math.cos(((a + 24) * Math.PI) / 180) * s * 0.5)},${r1(y + Math.sin(((a + 24) * Math.PI) / 180) * s * 0.5)}Z" fill="#FFF8F0" opacity=".9"/>`).join('');
    return `${shadow(x, y + s * 0.9, s * 0.3, s * 0.06)}<path d="${top}" fill="${matte(c)}"/>${white}${spec(x - s * 0.22, y - s * 0.3, s * 0.14, s * 0.07)}<rect x="${x - s * 0.02}" y="${y}" width="${s * 0.04}" height="${s * 0.9}" fill="${side('#E8DCC8')}"/>${sphere(x, y - s * 0.52, s * 0.04, c, { shadow: false })}`;
  },
  candelabra(x, y, s, P, c = P.c) {
    const flame = (fx, fy) => `${glow(fx, fy, s * 0.14, c, 0.55)}<ellipse cx="${fx}" cy="${fy}" rx="${s * 0.045}" ry="${s * 0.09}" fill="${c}"/><ellipse cx="${fx}" cy="${fy + s * 0.02}" rx="${s * 0.02}" ry="${s * 0.045}" fill="#fff"/>`;
    const candle = (k) => `${cyl(x + k * s, y - s * 0.56, s * 0.05, s * 0.016, s * 0.36, '#F6EEDF', { shadow: false })}${flame(x + k * s, y - s * 0.66)}`;
    const metal = P.dark ? '#B98A3E' : '#C9A24C';
    return `${cyl(x, y - s * 0.02, s * 0.24, s * 0.07, s * 0.05, metal)}${cyl(x, y - s * 0.52, s * 0.035, s * 0.01, s * 0.5, metal, { shadow: false })}${torus(x, y - s * 0.62, s * 0.4, s * 0.05, metal, { from: 0, to: 180, shadow: false })}${candle(-0.4)}${candle(0)}${candle(0.4)}`;
  },
  arch(x, yBase, w, h, P, c) {
    const d = `M${x},${yBase} v${-(h - w / 2)} a${w / 2},${w / 2} 0 0 1 ${w},0 v${h - w / 2}Z`;
    const inner = `M${x + w * 0.12},${yBase} v${-(h - w / 2) + w * 0.06} a${w * 0.38},${w * 0.38} 0 0 1 ${w * 0.76},0 v${(h - w / 2) - w * 0.06}Z`;
    return `<path d="${d}" fill="${matte(c)}"/><path d="${inner}" fill="${dark(c, 0.55)}"/><path d="${inner}" fill="${vert(P.a, dark(P.a, 0.6), 'archglow')}" opacity=".35"/>`;
  },
  bag(x, y, s, P, c = P.a) {
    return `${torus(x - s * 0.02, y - s * 0.42, s * 0.22, s * 0.05, dark(c, 0.15), { from: 190, to: 350 })}${box(x - s * 0.38, y - s * 0.4, s * 0.72, s * 0.76, s * 0.14, c, { rx: 3 })}<rect x="${x - s * 0.1}" y="${y - s * 0.1}" width="${s * 0.16}" height="${s * 0.22}" rx="2" fill="#FFF8F0"/><path d="M${x - s * 0.1},${y - s * 0.1} l${s * 0.08},${-s * 0.06} l${s * 0.08},${s * 0.06}" fill="#FFF8F0"/>`;
  },
  disc(x, y, r, P, c = P.c) { return cyl(x, y, r, r * 0.3, r * 0.14, c); },
  heart(x, y, s, P, c = '#E0218A') {
    const d = `M${x},${y + s * 0.5} C${x - s * 0.9},${y - s * 0.1} ${x - s * 0.5},${y - s * 0.6} ${x},${y - s * 0.2} C${x + s * 0.5},${y - s * 0.6} ${x + s * 0.9},${y - s * 0.1} ${x},${y + s * 0.5}Z`;
    return `${shadow(x, y + s * 0.58, s * 0.5, s * 0.1, 0.25)}<path d="${d}" fill="${matte(c)}"/>${spec(x - s * 0.3, y - s * 0.3, s * 0.18, s * 0.09, -30, 0.8)}`;
  },
  sneaker(x, y, s, P, c = '#FFF7F2', accent = P.c) {
    // a chunky trainer seen from the side: sole slab, upper as two soft domes, toe cap, heel tab, laces, a swoosh of colour
    const soleD = `M${x - s * 0.5},${y} q${-s * 0.05},${s * 0.12} ${s * 0.06},${s * 0.14} h${s * 0.9} q${s * 0.1},${-s * 0.04} ${s * 0.04},${-s * 0.14}Z`;
    const upper = `M${x - s * 0.49},${y} q${s * 0.02},${-s * 0.36} ${s * 0.3},${-s * 0.42} q${s * 0.26},${-s * 0.02} ${s * 0.36},${s * 0.16} q${s * 0.1},${s * 0.16} ${s * 0.34},${s * 0.26}Z`;
    const toe = `M${x + s * 0.51},${y} q${-s * 0.08},${-s * 0.2} ${-s * 0.3},${-s * 0.22} q${s * 0.04},${s * 0.14} ${s * 0.3},${s * 0.22}Z`;
    const tongue = `M${x - s * 0.26},${y - s * 0.4} q${s * 0.08},${-s * 0.1} ${s * 0.16},0 l${s * 0.1},${s * 0.2} l${-s * 0.3},${s * 0.02}Z`;
    const laces = Array.from({ length: 4 }, (_, i) => `<path d="M${r1(x - s * 0.24 + i * s * 0.09)},${r1(y - s * 0.3 + i * s * 0.055)} l${s * 0.11},${-s * 0.045}" stroke="#fff" stroke-width="${s * 0.03}" stroke-linecap="round"/><path d="M${r1(x - s * 0.24 + i * s * 0.09)},${r1(y - s * 0.3 + i * s * 0.055)} l${s * 0.11},${-s * 0.045}" stroke="${INK}" stroke-width="${s * 0.03}" stroke-linecap="round" opacity=".15" transform="translate(0,${s * 0.012})"/>`).join('');
    return `${shadow(x + s * 0.02, y + s * 0.2, s * 0.56, s * 0.08, 0.3)}<path d="${soleD}" fill="${vert(light(accent, 0.25), dark(accent, 0.25), key(accent))}"/><path d="M${x - s * 0.48},${y + s * 0.02} h${s * 0.96}" stroke="#fff" stroke-width="${s * 0.025}" opacity=".6"/><path d="${upper}" fill="${matte(c)}" stroke="${dark(c, 0.22)}" stroke-width="${s * 0.012}"/><path d="${toe}" fill="${light(c, 0.2)}" opacity=".9" stroke="${dark(c, 0.18)}" stroke-width="${s * 0.01}"/><path d="${tongue}" fill="${dark(c, 0.08)}" stroke="${dark(c, 0.2)}" stroke-width="${s * 0.01}"/><path d="M${x - s * 0.49},${y - s * 0.02} q${s * 0.04},${-s * 0.26} ${s * 0.16},${-s * 0.34}" fill="none" stroke="${dark(c, 0.22)}" stroke-width="${s * 0.012}"/>${Array.from({ length: 4 }, (_, i) => `<circle cx="${r1(x - s * 0.24 + i * s * 0.09)}" cy="${r1(y - s * 0.3 + i * s * 0.055)}" r="${s * 0.014}" fill="${dark(c, 0.3)}"/>`).join('')}<path d="M${x - s * 0.1},${y - s * 0.34} q${s * 0.2},${s * 0.1} ${s * 0.16},${s * 0.34}" fill="none" stroke="${P.a}" stroke-width="${s * 0.035}" stroke-linecap="round"/><path d="M${x - s * 0.47},${y - s * 0.3} q${s * 0.08},${s * 0.02} ${s * 0.12},${s * 0.3}" fill="none" stroke="${dark(c, 0.15)}" stroke-width="${s * 0.02}"/>${laces}${spec(x - s * 0.1, y - s * 0.3, s * 0.16, s * 0.05, -12, 0.6)}`;
  },
  cap(x, y, s, P, c = P.a) {
    const crown = `M${x - s * 0.5},${y} a${s * 0.5},${s * 0.44} 0 0 1 ${s},0Z`;
    const peak = `M${x + s * 0.1},${y - s * 0.02} q${s * 0.4},${-s * 0.1} ${s * 0.7},${s * 0.06} q${-s * 0.3},${s * 0.12} ${-s * 0.72},${s * 0.06}Z`;
    return `${shadow(x + s * 0.1, y + s * 0.14, s * 0.6, s * 0.08)}<path d="${peak}" fill="${dark(c, 0.15)}"/><path d="${crown}" fill="${matte(c)}"/><path d="M${x},${y - s * 0.44} v${s * 0.44} M${x - s * 0.34},${y - s * 0.3} q${s * 0.34},${-s * 0.1} ${s * 0.68},0" fill="none" stroke="${dark(c, 0.2)}" stroke-width="${s * 0.02}"/>${sphere(x, y - s * 0.45, s * 0.04, dark(c, 0.1), { shadow: false })}${spec(x - s * 0.2, y - s * 0.28, s * 0.16, s * 0.07)}`;
  },
};

/* ---------- scenery ---------- */
function building(x, yBase, w, h, d, c, P, o = {}) {
  const win = [];
  const cols = Math.max(1, Math.floor(w / 12)), rows = Math.max(1, Math.floor(h / 14));
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) if (rnd() < (o.lit ?? 0.5)) win.push(`<rect x="${r1(x + 4 + i * (w - 6) / cols)}" y="${r1(yBase - h + 6 + j * (h - 8) / rows)}" width="4" height="6" rx="1" fill="${o.winColor || (P.dark ? P.c : '#fff')}" opacity="${P.dark ? 0.95 : 0.75}"/>`);
  return `${box(x, yBase - h, w, h, d, c, { shadow: o.shadow })}${win.join('')}`;
}
function skylineBoxes(w, yBase, n, hMin, hMax, colors, P, o = {}) {
  let out = '', x = -6;
  const step = w / n;
  for (let i = 0; i < n; i++) { const bw = step * (0.55 + rnd() * 0.35); const bh = hMin + rnd() * (hMax - hMin); out += building(r1(x), yBase, r1(bw), r1(bh), 8 + rnd() * 6, colors[i % colors.length], P, o); x += step; }
  return out;
}
const tree = (x, y, s, c) => `${cyl(x, y - s * 0.3, s * 0.07, s * 0.02, s * 0.32, '#8A6A4A', { shadow: false })}${sphere(x, y - s * 0.62, s * 0.36, c)}${sphere(x - s * 0.26, y - s * 0.46, s * 0.24, c, { shadow: false })}${sphere(x + s * 0.26, y - s * 0.48, s * 0.26, c, { shadow: false })}`;
const lamp = (x, y, P) => `${cyl(x, y - 36, 2, 0.8, 36, '#6B6B70', { shadow: false })}${glow(x, y - 42, 12, P.c, 0.5)}${sphere(x, y - 42, 5, light(P.c, 0.2), { shadow: false })}`;
const flowerBed = (w, y0, n, P, cs) => { let out = ''; for (let i = 0; i < n; i++) { const x = rnd() * w, y = y0 + rnd() * 36; out += `<rect x="${r1(x - 0.8)}" y="${r1(y)}" width="1.6" height="9" fill="#5B9E78"/>${sphere(x, y - 2, 3.2 + rnd() * 1.5, cs[i % cs.length], { shOp: 0.15 })}`; } return out; };
const water = (w, y, h, P) => `<rect y="${y}" width="${w}" height="${h}" fill="${vert(light(P.b, 0.25), P.b, 'water')}"/>${Array.from({ length: 7 }, (_, i) => `<ellipse cx="${r1(rnd() * w)}" cy="${r1(y + 6 + rnd() * (h - 12))}" rx="${r1(14 + rnd() * 26)}" ry="1.6" fill="#fff" opacity=".55"/>`).join('')}<rect y="${y}" width="${w}" height="3" fill="#fff" opacity=".5"/>`;
const grid = (w, y, h, P) => `${Array.from({ length: 9 }, (_, i) => `<path d="M${(w * i) / 8},${y} L${w / 2 + ((w * i) / 8 - w / 2) * 3},${y + h}" stroke="${P.ink}" stroke-width=".8" opacity=".14"/>`).join('')}${Array.from({ length: 6 }, (_, i) => `<path d="M0,${y + i * i * (h / 25)} h${w}" stroke="${P.ink}" stroke-width=".8" opacity=".12"/>`).join('')}`;
const bunting = (w, y, P, cs) => { let s = `<path d="M0,${y} Q${w / 2},${y + 26} ${w},${y}" fill="none" stroke="${P.ink}" stroke-width="1" opacity=".5"/>`; for (let x = 14; x < w; x += 24) { const t = x / w; const yy = y + 26 * 4 * t * (1 - t); s += sphere(x, yy + 5, 4, cs[Math.round(x / 24) % cs.length], { shadow: false }); } return s; };

/* ---------- scenes ---------- */
const SCENES = {
  c1: (w, h, P) => `${M.sun(w * 0.8, h * 0.045, 24, P)}${skylineBoxes(w, h * 0.3, 7, h * 0.1, h * 0.2, P.blocks, P, { lit: 0.35 })}
    ${lamp(40, h * 0.42, P)}${lamp(w - 50, h * 0.42, P)}${tree(w * 0.12, h * 0.6, 60, P.tree)}${tree(w * 0.9, h * 0.78, 70, P.tree)}${bunting(w, h * 0.46, P, [P.a, P.c, '#fff'])}${M.coffee(w * 0.82, h * 0.93, 40, P)}`,
  c2: (w, h, P) => `${skylineBoxes(w, h * 0.3, 5, h * 0.16, h * 0.24, P.blocks, P, { lit: 0.6, winColor: '#D9B36A' })}
    ${Array.from({ length: 5 }, (_, i) => `<path d="M${10 + i * 72},${h * 0.3} h52 l-5,12 h-42Z" fill="${matte(i % 2 ? P.a : P.ink)}"/>`).join('')}
    ${lamp(26, h * 0.54, P)}${lamp(w - 30, h * 0.7, P)}${M.bow(w * 0.2, h * 0.5, 40, P)}${M.spool(w * 0.84, h * 0.62, 34, P)}${M.pearls([[w * 0.5, h * 0.86], [w * 0.55, h * 0.885], [w * 0.6, h * 0.895], [w * 0.65, h * 0.89], [w * 0.7, h * 0.875]], 5, P)}${flowerBed(w, h * 0.92, 10, P, [P.a, '#fff', P.c])}`,
  c3: (w, h, P) => `${Array.from({ length: 40 }, () => `<circle cx="${r1(rnd() * w)}" cy="${r1(rnd() * h * 0.3)}" r="${r1(0.6 + rnd() * 1.1)}" fill="#fff" opacity=".8"/>`).join('')}${M.moon(w * 0.2, h * 0.1, 22, P)}
    ${skylineBoxes(w, h * 0.3, 8, h * 0.12, h * 0.24, P.blocks, P, { lit: 0.5 })}
    ${pane(w * 0.1, h * 0.36, 52, 16, 6)}${glow(w * 0.1 + 26, h * 0.36 + 8, 26, P.a, 0.5)}${pane(w * 0.7, h * 0.4, 44, 14, 6)}${glow(w * 0.7 + 22, h * 0.4 + 7, 22, P.c, 0.5)}
    ${lamp(34, h * 0.6, P)}${lamp(w - 40, h * 0.82, P)}${M.martini(w * 0.82, h * 0.7, 44, P)}`,
  c4: (w, h, P) => `${M.sun(w * 0.3, h * 0.1, 20, P)}${dome(w * 0.25, h * 0.3, w * 0.5, h * 0.08, '#FFD6E8')}${dome(w * 0.8, h * 0.3, w * 0.46, h * 0.07, '#F9BFD8')}
    ${pane(w * 0.5 - 30, h * 0.22, 60, h * 0.08, 8)}${tree(w * 0.1, h * 0.5, 64, P.tree)}${tree(w * 0.92, h * 0.66, 76, P.tree)}${tree(w * 0.18, h * 0.9, 56, P.tree)}
    ${flowerBed(w, h * 0.6, 20, P, [P.a, P.c, '#fff'])}${flowerBed(w, h * 0.82, 16, P, [P.a, P.c])}${M.rose(w * 0.84, h * 0.86, 30, P)}${M.parasol(w * 0.78, h * 0.3, 46, P)}`,
  c5: (w, h, P) => `${grid(w, h * 0.3, h * 0.7, P)}${pane(w * 0.6, h * 0.1, 60, 90, 12)}${torus(w * 0.2, h * 0.2, 30, 10, P.b)}${M.orb(w * 0.5, h * 0.12, 24, P)}
    <path d="M0,${h * 0.3} h${w}" stroke="${P.c}" stroke-width="3" opacity=".8"/>${M.orb(w * 0.84, h * 0.78, 32, P)}${sphere(w * 0.14, h * 0.62, 12, P.c)}${pane(w * 0.08, h * 0.84, 70, 44, 10)}`,
  c6: (w, h, P) => `${M.sun(w * 0.76, h * 0.06, 26, P, P.a)}${water(w, h * 0.22, h * 0.1, P)}
    ${[[w * 0.15, h * 0.5], [w * 0.5, h * 0.66], [w * 0.85, h * 0.54]].map(([x, y], i) => M.umbrella(x, y, 56, P, i % 2 ? P.c : P.b)).join('')}
    ${M.ball(w * 0.72, h * 0.86, 16, P)}${M.lemon(w * 0.3, h * 0.9, 36, P)}${M.lemon(w * 0.42, h * 0.95, 26, P)}${tree(w * 0.08, h * 0.9, 60, P.tree)}`,
  c7: (w, h, P) => `${Array.from({ length: 30 }, () => `<circle cx="${r1(rnd() * w)}" cy="${r1(rnd() * h * 0.3)}" r="${r1(0.6 + rnd() * 1.1)}" fill="#fff" opacity=".7"/>`).join('')}${M.moon(w * 0.8, h * 0.1, 24, P)}
    ${[0, 1, 2, 3].map((i) => M.arch(i * (w / 4) + 8, h * 0.32, w / 4 - 16, h * 0.2, P, '#3A2340')).join('')}
    ${flowerBed(w, h * 0.56, 14, P, [P.c, P.a, '#fff'])}${flowerBed(w, h * 0.84, 12, P, [P.c, P.a])}${M.candelabra(w * 0.2, h * 0.76, 44, P)}${M.rose(w * 0.84, h * 0.9, 28, P, P.c)}`,
  c8: (w, h, P) => `${skylineBoxes(w, h * 0.3, 6, h * 0.12, h * 0.22, P.blocks, P, { lit: 0.45, winColor: P.b })}
    ${pane(w * 0.08, h * 0.2, 70, 46, 8)}${glow(w * 0.08 + 35, h * 0.2 + 23, 30, P.a, 0.5)}${pane(w * 0.62, h * 0.24, 60, 42, 8)}${glow(w * 0.62 + 30, h * 0.24 + 21, 26, P.c, 0.5)}
    ${lamp(w * 0.5, h * 0.58, P)}${bunting(w, h * 0.44, P, [P.a, P.c, '#fff', P.b])}${M.sneaker(w * 0.22, h * 0.9, 64, P)}${M.bag(w * 0.86, h * 0.72, 40, P)}${M.cap(w * 0.7, h * 0.94, 26, P, P.b)}`,
};

export function begin(ns, P) { NS = ns; INK = P.ink; DEFS = new Map(); }
export function flush() { return `<defs>${[...DEFS.values()].join('')}</defs>`; }
export const prim = { shadow, spec, glow, pane, matte, side, vert, gloss, chromeG, glassG, blur, light, dark };

export function sceneSVG(chapterId, w, h) {
  seed = 7 + chapterId.charCodeAt(1);
  const P = WORLD[chapterId] || WORLD.c1;
  begin(`sc-${chapterId}`, P);
  const fn = SCENES[chapterId] || SCENES.c1;
  const body = `${backdrop(w, h, P, 0.3, { spot: false })}${fn(w, h, P)}`;
  // pin materials, used by the map
  def(`${NS}-pinOpen`, `<radialGradient id="${NS}-pinOpen" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${light(P.pin || P.a, 0.45)}"/><stop offset=".55" stop-color="${P.pin || P.a}"/><stop offset="1" stop-color="${dark(P.pin || P.a, 0.35)}"/></radialGradient>`);
  def(`${NS}-pinDone`, `<radialGradient id="${NS}-pinDone" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#5A5A62"/><stop offset=".55" stop-color="#1E1C22"/><stop offset="1" stop-color="#000"/></radialGradient>`);
  def(`${NS}-pinLock`, `<radialGradient id="${NS}-pinLock" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#E6E4E8"/><stop offset="1" stop-color="#B8B5BC"/></radialGradient>`);
  return `${flush()}${body}`;
}
export const pinFill = (chapterId, state) => `url(#sc-${chapterId}-${state === 'done' ? 'pinDone' : state === 'open' ? 'pinOpen' : 'pinLock'})`;

/* ---------- covers ---------- */
const COVERS = {
  c1: (w, h, P) => `${M.sun(w * 0.9, h * 0.17, h * 0.11, P)}${building(w * 0.5, h * 0.68, 46, h * 0.36, 12, P.blocks[1], P, { lit: 0.4 })}${building(w * 0.64, h * 0.68, 60, h * 0.5, 14, P.a, P, { lit: 0.4 })}${building(w * 0.84, h * 0.68, 44, h * 0.3, 12, P.blocks[2], P, { lit: 0.4 })}${M.coffee(w * 0.27, h * 0.6, h * 0.38, P)}${M.heart(w * 0.52, h * 0.8, h * 0.07, P)}`,
  c2: (w, h, P) => `${M.bow(w * 0.3, h * 0.46, h * 0.5, P)}${M.spool(w * 0.72, h * 0.6, h * 0.34, P)}${M.pearls(Array.from({ length: 8 }, (_, i) => [w * 0.52 + i * 16, h * 0.82 + Math.sin(i * 0.8) * 5]), 5.5, P)}${M.heart(w * 0.9, h * 0.3, h * 0.07, P)}`,
  c3: (w, h, P) => `${Array.from({ length: 26 }, () => `<circle cx="${r1(rnd() * w)}" cy="${r1(rnd() * h * 0.6)}" r="${r1(0.6 + rnd() * 1.1)}" fill="#fff" opacity=".8"/>`).join('')}${M.moon(w * 0.2, h * 0.3, h * 0.14, P)}${skylineBoxes(w, h * 0.68, 7, h * 0.16, h * 0.34, P.blocks, P, { lit: 0.5 })}${M.martini(w * 0.66, h * 0.5, h * 0.6, P)}${glow(w * 0.66, h * 0.76, h * 0.12, P.a, 0.4)}`,
  c4: (w, h, P) => `${M.sun(w * 0.8, h * 0.24, h * 0.1, P)}${dome(w * 0.2, h * 0.68, w * 0.5, h * 0.12, '#FFD6E8')}${dome(w * 0.8, h * 0.68, w * 0.5, h * 0.1, '#F9BFD8')}${M.rose(w * 0.34, h * 0.44, h * 0.5, P)}${M.parasol(w * 0.76, h * 0.56, h * 0.46, P)}${M.pearls([[w * 0.56, h * 0.86], [w * 0.14, h * 0.8]], 5, P)}`,
  c5: (w, h, P) => `${grid(w, h * 0.68, h * 0.32, P)}${pane(w * 0.58, h * 0.1, h * 0.5, h * 0.62, 14)}${torus(w * 0.78, h * 0.5, h * 0.22, h * 0.07, P.b)}${M.orb(w * 0.36, h * 0.44, h * 0.32, P)}${sphere(w * 0.14, h * 0.78, h * 0.06, P.c)}<path d="M0,${h * 0.68} h${w}" stroke="${P.c}" stroke-width="2.5" opacity=".9"/>`,
  c6: (w, h, P) => `${M.sun(w * 0.18, h * 0.22, h * 0.1, P, P.a)}${water(w, h * 0.5, h * 0.16, P)}${M.umbrella(w * 0.76, h * 0.56, h * 0.44, P)}${M.lemon(w * 0.32, h * 0.76, h * 0.3, P)}${M.ball(w * 0.56, h * 0.82, h * 0.1, P)}`,
  c7: (w, h, P) => `${Array.from({ length: 20 }, () => `<circle cx="${r1(rnd() * w)}" cy="${r1(rnd() * h * 0.5)}" r="${r1(0.6 + rnd() * 1.1)}" fill="#fff" opacity=".7"/>`).join('')}${[0, 1, 2].map((i) => M.arch(i * (w / 3) + 10, h * 0.78, w / 3 - 20, h * 0.62, P, '#3A2340')).join('')}${M.moon(w * 0.84, h * 0.2, h * 0.09, P)}${M.candelabra(w * 0.5, h * 0.86, h * 0.5, P)}${M.rose(w * 0.16, h * 0.76, h * 0.2, P, P.c)}`,
  c8: (w, h, P) => `${torus(w * 0.42, h * 0.46, h * 0.42, h * 0.05, P.a)}${skylineBoxes(w, h * 0.68, 8, h * 0.1, h * 0.22, P.blocks, P, { lit: 0.4, winColor: P.b })}${M.bag(w * 0.8, h * 0.6, h * 0.4, P)}${M.sneaker(w * 0.4, h * 0.72, h * 0.78, P)}${M.cap(w * 0.78, h * 0.3, h * 0.2, P, P.b)}${M.heart(w * 0.12, h * 0.78, h * 0.07, P, P.c)}${bunting(w, h * 0.08, P, [P.a, P.c, '#fff', P.b])}`,
};

export function coverSVG(chapterId, w = 360, h = 220, opts = {}) {
  seed = 11 + chapterId.charCodeAt(1);
  const P = WORLD[chapterId] || WORLD.c1;
  begin(`cv-${chapterId}${opts.ns || ''}`, P);
  const fn = COVERS[chapterId] || COVERS.c1;
  const num = chapterId.slice(1).padStart(2, '0');
  const body = `${backdrop(w, h, P, 0.68, { spotX: 0.36 })}${fn(w, h, P)}`;
  const label = opts.label === false ? '' : `<g class="cover-label"><rect x="${w - 64}" y="${h - 36}" width="52" height="24" rx="12" fill="${P.dark ? 'rgba(255,255,255,.9)' : 'rgba(20,16,24,.82)'}"/><text x="${w - 38}" y="${h - 19.5}" text-anchor="middle" class="cover-num" fill="${P.dark ? '#1A1418' : '#fff'}">No. ${num}</text></g>`;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" class="cover-art" aria-hidden="true">${flush()}${body}${label}</svg>`;
}

// Ribbon path through the level nodes: a soft 3D ribbon with an underside and a shadow.
export function ribbon(points, light, darkC) {
  const d = spline(points, false, 0.9);
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="18" stroke-linecap="round" opacity=".16" filter="${blur(4)}" transform="translate(0,7)"/><path d="${d}" fill="none" stroke="${mix(light, '#000', 0.3)}" stroke-width="15" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${light}" stroke-width="14" stroke-linecap="round" transform="translate(0,-3)"/><path d="${d}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55" stroke-dasharray="1 7" transform="translate(0,-5)"/>`;
}
