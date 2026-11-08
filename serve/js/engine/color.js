// Colour analysis in OKLCH: neutrals, undertone, and hue-template harmony.

export function hexToRgb(hex) {
  const m = hex.replace('#', '');
  const n = parseInt(m.length === 3 ? m.split('').map((x) => x + x).join('') : m, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
}
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

export function hexToOklch(hex) {
  const [r, g, b] = hexToRgb(hex).map(lin);
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = Math.hypot(a, bb);
  let h = (Math.atan2(bb, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L, C, h };
}

// Styling neutrals: achromatics, earth tones, navy and denim blues.
export function neutralClass(hex) {
  const { L, C, h } = hexToOklch(hex);
  if (C < 0.035 || L < 0.17 || L > 0.96) return 'achromatic';
  if (C < 0.1 && h >= 40 && h <= 100) return 'earth'; // camel, khaki, oat, mocha, chocolate
  if (C < 0.1 && h >= 230 && h <= 290 && L < 0.4) return 'navy';
  if (C < 0.09 && h >= 230 && h <= 275) return 'denim';
  return null;
}

export function undertone(hex) {
  const { h, C } = hexToOklch(hex);
  if (C < 0.035) return 'none';
  if (h < 115 || h > 335) return 'warm';
  if (h >= 170 && h <= 335) return 'cool';
  return 'green';
}

const hueDist = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

// Cluster weighted hues (degrees) with a merge radius.
export function clusterHues(entries, radius = 24) {
  const sorted = entries.slice().sort((a, b) => a.h - b.h);
  const clusters = [];
  for (const e of sorted) {
    const c = clusters.find((k) => hueDist(k.h, e.h) <= radius);
    if (c) { const w = c.w + e.w; c.h = (c.h * c.w + e.h * e.w) / w; c.w = w; c.members.push(e); }
    else clusters.push({ h: e.h, w: e.w, members: [e] });
  }
  // merge wraparound
  if (clusters.length > 1 && hueDist(clusters[0].h, clusters[clusters.length - 1].h) <= radius) {
    const last = clusters.pop(); const first = clusters[0];
    const w = first.w + last.w; first.h = (first.h * first.w + last.h * last.w) / w; first.w = w; first.members.push(...last.members);
  }
  return clusters.sort((a, b) => b.w - a.w);
}

/**
 * entries: [{hex, w}] with area weights. Returns a harmony report.
 */
export function paletteReport(entries) {
  const total = entries.reduce((s, e) => s + e.w, 0) || 1;
  const chroma = [], neutrals = [];
  for (const e of entries) {
    const nc = e.metal ? 'metal' : neutralClass(e.hex);
    const ok = hexToOklch(e.hex);
    (nc ? neutrals : chroma).push({ ...e, ...ok, nc, under: undertone(e.hex) });
  }
  const chromaW = chroma.reduce((s, e) => s + e.w, 0) / total;
  const clusters = clusterHues(chroma.map((e) => ({ h: e.h, w: e.w, hex: e.hex })));
  const n = clusters.length;
  let template = 'all neutral', fit = 1;
  const Ls = entries.map((e) => hexToOklch(e.hex).L);
  const Lrange = Math.max(...Ls) - Math.min(...Ls);
  if (n === 0) { template = Lrange > 0.25 ? 'tonal neutrals' : 'flat neutrals'; fit = Lrange > 0.25 ? 1 : 0.75; }
  else if (n === 1) { template = chromaW > 0.6 ? 'monochrome' : 'neutral + accent'; fit = 1; }
  else if (n === 2) {
    const d = hueDist(clusters[0].h, clusters[1].h);
    if (d <= 50) { template = 'analogous'; fit = 0.92; }
    else if (d >= 150) { template = 'complementary'; fit = 0.9; }
    else if (d >= 95) { template = 'split pair'; fit = 0.72; }
    else { template = 'adjacent clash'; fit = 0.5; }
  } else if (n === 3) {
    const hs = clusters.map((c) => c.h);
    const span = Math.max(hueDist(hs[0], hs[1]), hueDist(hs[1], hs[2]), hueDist(hs[0], hs[2]));
    const d01 = hueDist(hs[0], hs[1]), d12 = hueDist(hs[1], hs[2]), d02 = hueDist(hs[0], hs[2]);
    const triadic = [d01, d12, d02].every((d) => d >= 95 && d <= 145);
    if (span <= 80) { template = 'analogous trio'; fit = 0.85; }
    else if (triadic) { template = 'triadic'; fit = 0.8; }
    else if ([d01, d12, d02].some((d) => d >= 150)) { template = 'split complementary'; fit = 0.75; }
    else { template = 'three-way clash'; fit = 0.4; }
  } else { template = `${n} hues fighting`; fit = 0.15; }

  // Undertones
  const warmW = chroma.filter((e) => e.under === 'warm').reduce((s, e) => s + e.w, 0) / total;
  const coolW = chroma.filter((e) => e.under === 'cool').reduce((s, e) => s + e.w, 0) / total;
  const mixedUndertone = warmW > 0.22 && coolW > 0.22 && template !== 'complementary';
  // Dominance (60-30-10): weight of the biggest colour family
  const byHex = {};
  for (const e of entries) byHex[e.hex] = (byHex[e.hex] || 0) + e.w;
  const dominant = Math.max(...Object.values(byHex)) / total;
  const distinctChromatic = n;
  return { template, fit, clusters, chromaW, warmW, coolW, mixedUndertone, dominant, distinctChromatic, Lrange, neutrals, chroma };
}
