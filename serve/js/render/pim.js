// Pim, the chihuahua: a seated front view with her own garment layers. Items for Pim carry `pim: true` and a render
// spec of kind pimTop / pimDress / pimOuter / pimNeck / pimHead / pimEyes / pimShoes / pimBag with a `style`.
export const PIM_VIEWBOX = '0 0 360 420';
export const PIM_SLOTS = ['dress', 'top', 'outer', 'neck', 'head', 'eyes', 'shoes', 'bag'];
export const PIM_CROP = { top: '80 190 200 180', dress: '70 190 220 220', outer: '70 190 220 220', neck: '100 170 160 90', head: '70 0 220 140', eyes: '100 85 160 90', shoes: '70 340 220 70', bag: '110 190 170 170' };

const FUR = { base: '#E9C6A3', dark: '#C99A6B', cream: '#F8ECDD', ink: '#2B1B14', pink: '#F3A9BE' };
const BODY = 'M126,208 C118,240 100,280 100,322 C100,362 134,380 180,380 C226,380 260,362 260,322 C260,280 242,240 234,208 C220,196 140,196 126,208 Z';
const HEAD = 'M116,140 C114,98 144,66 180,66 C216,66 246,98 244,140 C242,164 224,182 206,190 C194,195 166,195 154,190 C136,182 118,164 116,140 Z';
let n = 0;
const shade = (hex, k) => {
  const h = hex.replace('#', ''); if (h.length !== 6) return hex;
  const f = (i) => Math.max(0, Math.min(255, Math.round(parseInt(h.slice(i, i + 2), 16) * (1 + k) + (k > 0 ? 255 * k * 0.6 : 0))));
  return `#${[0, 2, 4].map((i) => f(i).toString(16).padStart(2, '0')).join('')}`;
};

// garment shapes in Pim space
const BODY_TOP = (hem) => `M142,214 Q116,250 110,290 L113,${hem} Q180,${hem + 12} 247,${hem} L250,290 Q244,250 218,214 Q180,230 142,214Z`;
const SKIRT = (from, to, flare) => `M${110 - flare * 0.15},${from} L${92 - flare},${to} Q180,${to + 18} ${268 + flare},${to} L${250 + flare * 0.15},${from} Q180,${from + 12} ${110 - flare * 0.15},${from}Z`;
const COAT_L = (hem) => `M136,212 Q104,250 98,300 L100,${hem} Q138,${hem + 10} 170,${hem + 4} L168,236 Q150,228 136,212Z`;
const COAT_R = (hem) => `M224,212 Q256,250 262,300 L260,${hem} Q222,${hem + 10} 190,${hem + 4} L192,236 Q210,228 224,212Z`;
const SLEEVE = (x, to) => `M${x},276 L${x},${to} Q${x + 13},${to + 9} ${x + 26},${to} L${x + 26},276Z`;
const COLLAR = 'M126,190 Q180,216 234,190 L238,203 Q180,230 122,203Z';
const BANDANA = 'M132,196 Q180,218 228,196 L184,266 Q180,268 176,266Z';

function pattern(id, print, c2, c1) {
  const col = c2 || shade(c1, -0.35);
  switch (print) {
    case 'stripe': return `<pattern id="${id}" width="20" height="14" patternUnits="userSpaceOnUse"><rect width="20" height="6" fill="${col}"/></pattern>`;
    case 'pinstripe': return `<pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="1.4" height="10" fill="${col}"/></pattern>`;
    case 'polka': return `<pattern id="${id}" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="3.2" fill="${col}"/><circle cx="14" cy="14" r="3.2" fill="${col}"/></pattern>`;
    case 'gingham': return `<pattern id="${id}" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="8" height="16" fill="${col}" opacity=".45"/><rect width="16" height="8" fill="${col}" opacity=".45"/></pattern>`;
    case 'plaid': return `<pattern id="${id}" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="9" height="24" fill="${col}" opacity=".5"/><rect width="24" height="9" fill="${col}" opacity=".5"/><rect x="14" width="2" height="24" fill="${col}"/><rect y="14" width="24" height="2" fill="${col}"/></pattern>`;
    case 'houndstooth': return `<pattern id="${id}" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0,0 h6 v6 h-6z M6,6 h6 v6 h-6z M6,0 l6,6 v-6z M0,6 l6,6 h-6z" fill="${col}"/></pattern>`;
    case 'leopard': return `<pattern id="${id}" width="26" height="22" patternUnits="userSpaceOnUse"><path d="M4,6 q4,-5 9,0 q-1,5 -5,6 q-5,-1 -4,-6z" fill="${shade(c1, -0.25)}" stroke="${col}" stroke-width="2"/><path d="M16,14 q5,-4 8,2 q-2,5 -6,4 q-4,-2 -2,-6z" fill="${shade(c1, -0.25)}" stroke="${col}" stroke-width="2"/></pattern>`;
    case 'zebra': return `<pattern id="${id}" width="22" height="18" patternUnits="userSpaceOnUse"><path d="M0,4 q11,6 22,0 v5 q-11,6 -22,0z M0,13 q11,-5 22,0 v5 q-11,-5 -22,0z" fill="${col}"/></pattern>`;
    case 'floral': return `<pattern id="${id}" width="24" height="24" patternUnits="userSpaceOnUse"><g fill="${col}"><circle cx="8" cy="5" r="2.4"/><circle cx="11" cy="8" r="2.4"/><circle cx="5" cy="8" r="2.4"/><circle cx="8" cy="11" r="2.4"/></g><circle cx="8" cy="8" r="1.6" fill="#FFE9A8"/><circle cx="19" cy="18" r="1.8" fill="${col}" opacity=".7"/></pattern>`;
    case 'argyle': return `<pattern id="${id}" width="24" height="30" patternUnits="userSpaceOnUse"><path d="M12,0 L24,15 L12,30 L0,15Z" fill="${col}" opacity=".6"/></pattern>`;
    case 'logo': return `<pattern id="${id}" width="22" height="16" patternUnits="userSpaceOnUse"><text x="3" y="12" font-size="10" font-weight="800" font-family="Inter,system-ui" fill="${col}" opacity=".8">P</text></pattern>`;
    case 'camo': return `<pattern id="${id}" width="30" height="26" patternUnits="userSpaceOnUse"><path d="M2,4 q10,-6 16,2 q-2,8 -10,8 q-8,-2 -6,-10z" fill="${col}" opacity=".7"/><path d="M18,14 q8,-2 10,6 q-4,6 -10,4 q-4,-4 0,-10z" fill="${shade(c1, -0.3)}" opacity=".7"/></pattern>`;
    case 'toile': return `<pattern id="${id}" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M4,20 q6,-14 12,0 M10,20 q6,-14 12,0" fill="none" stroke="${col}" stroke-width="1.4"/><circle cx="20" cy="8" r="2" fill="${col}"/></pattern>`;
    default: return '';
  }
}

// one garment layer: fill, material finish, print, outline
function cloth(d, it, k, opts = {}) {
  const c = opts.color || it.color || '#DDD';
  const id = `pm${k}`;
  const mat = it.texture || 'cotton';
  const sheer = mat === 'sheer' || mat === 'lace';
  const defs = [];
  const over = [];
  defs.push(`<linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(c, 0.22)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -0.22)}"/></linearGradient><radialGradient id="${id}v" cx=".42" cy=".3" r=".78"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#e2e2e2"/><stop offset="1" stop-color="#8c8c8c"/></radialGradient><clipPath id="${id}c"><path d="${d}"/></clipPath>`);
  // form: a soft radial falloff multiplied over the fill, and a darker inner edge where the fabric turns away
  over.push(`<path d="${d}" fill="url(#${id}v)" opacity=".5" style="mix-blend-mode:multiply"/><path d="${d}" fill="none" stroke="${shade(c, -0.35)}" stroke-width="5" opacity=".22" clip-path="url(#${id}c)"/>`);
  if (it.print) { const p = pattern(`${id}p`, it.print, it.color2, c); if (p) { defs.push(p); over.push(`<path d="${d}" fill="url(#${id}p)" opacity=".9"/>`); } }
  if (mat === 'knit' || mat === 'rib') over.push(`<g clip-path="url(#${id}c)" stroke="${shade(c, -0.18)}" stroke-width="1" opacity=".55">${Array.from({ length: 24 }, (_, i) => `<path d="M60,${200 + i * 9} h240"/>`).join('')}</g>`);
  if (mat === 'tweed') over.push(`<g clip-path="url(#${id}c)" stroke="${shade(c, -0.3)}" stroke-width=".9" opacity=".5">${Array.from({ length: 30 }, (_, i) => `<path d="M${40 + i * 10},180 l80,240 M${40 + i * 10},180 l-80,240"/>`).join('')}</g>`);
  if (mat === 'denim') over.push(`<g clip-path="url(#${id}c)" stroke="${shade(c, 0.35)}" stroke-width=".8" opacity=".35">${Array.from({ length: 40 }, (_, i) => `<path d="M${20 + i * 8},180 l120,240"/>`).join('')}</g>`);
  if (mat === 'satin' || mat === 'latex' || mat === 'chrome' || mat === 'metal') over.push(`<g clip-path="url(#${id}c)"><path d="M120,200 q40,60 20,220" fill="none" stroke="#fff" stroke-width="${mat === 'satin' ? 10 : 16}" opacity="${mat === 'satin' ? 0.32 : 0.5}" stroke-linecap="round"/><path d="M236,210 q10,60 0,160" fill="none" stroke="#fff" stroke-width="4" opacity=".3" stroke-linecap="round"/></g>`);
  if (mat === 'velvet') over.push(`<path d="${d}" fill="none" stroke="${shade(c, -0.4)}" stroke-width="6" opacity=".35" clip-path="url(#${id}c)"/>`);
  if (mat === 'sequin') over.push(`<g clip-path="url(#${id}c)">${Array.from({ length: 70 }, (_, i) => { const x = 90 + ((i * 53) % 190); const y = 200 + ((i * 37) % 200); return `<circle cx="${x}" cy="${y}" r="2.1" fill="${i % 3 ? '#fff' : shade(c, 0.5)}" opacity="${0.45 + (i % 4) * 0.12}"/>`; }).join('')}</g>`);
  if (mat === 'lace') over.push(`<g clip-path="url(#${id}c)" fill="#fff" opacity=".55">${Array.from({ length: 60 }, (_, i) => `<circle cx="${80 + ((i * 41) % 200)}" cy="${195 + ((i * 29) % 210)}" r="1.6"/>`).join('')}</g>`);
  const fuzzy = mat === 'fur';
  return {
    defs: defs.join(''),
    body: `<path d="${d}" fill="url(#${id}g)" opacity="${sheer ? 0.62 : 1}"/>${over.join('')}<path d="${d}" fill="none" stroke="${shade(c, -0.45)}" stroke-opacity=".55" stroke-width="${fuzzy ? 7 : 1.6}" ${fuzzy ? 'stroke-dasharray="2 5" stroke-linecap="round"' : 'stroke-linejoin="round"'}/>${fuzzy ? `<path d="${d}" fill="none" stroke="${shade(c, 0.3)}" stroke-width="4" stroke-dasharray="1 6" stroke-linecap="round" opacity=".8"/>` : ''}`,
  };
}

function bow(x, y, s, c, k) {
  const g = `pmb${k}`;
  return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c, 0.3)}"/><stop offset="1" stop-color="${shade(c, -0.2)}"/></linearGradient></defs>
    <path d="M${x},${y} q${-s * 1.2},${-s * 0.9} ${-s * 1.6},${-s * 0.1} q${s * 0.2},${s * 0.9} ${s * 1.6},${s * 0.1}z" fill="url(#${g})" stroke="${shade(c, -0.4)}" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M${x},${y} q${s * 1.2},${-s * 0.9} ${s * 1.6},${-s * 0.1} q${-s * 0.2},${s * 0.9} ${-s * 1.6},${s * 0.1}z" fill="url(#${g})" stroke="${shade(c, -0.4)}" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M${x - s * 0.1},${y + s * 0.1} l${-s * 0.5},${s * 0.9} l${s * 0.35},0 z M${x + s * 0.1},${y + s * 0.1} l${s * 0.5},${s * 0.9} l${-s * 0.35},0 z" fill="${shade(c, -0.1)}" opacity=".9"/>
    <circle cx="${x}" cy="${y}" r="${s * 0.28}" fill="${shade(c, -0.25)}" stroke="${shade(c, -0.45)}" stroke-width="1"/>`;
}

// deterministic pseudo-random for the fur
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const norm = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
// short tapered hairs following a direction field, clipped to a region by the caller
function hairs(seed, count, box, dir, palette, len = [5, 10], width = [0.6, 1.3], alpha = [0.22, 0.55], tint = null) {
  const r = rng(seed); const groups = new Map();
  for (let i = 0; i < count; i++) {
    const x = box[0] + r() * box[2], y = box[1] + r() * box[3];
    const [dx, dy] = dir(x, y); const a = Math.atan2(dy, dx) + (r() - 0.5) * 0.7;
    const L = len[0] + r() * (len[1] - len[0]); const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L;
    const kk = (r() - 0.5) * L * 0.5; const cx = (x + ex) / 2 - Math.sin(a) * kk, cy = (y + ey) / 2 + Math.cos(a) * kk;
    let ci = Math.floor(r() * palette.length); if (tint) ci = Math.max(0, Math.min(palette.length - 1, ci + tint(x, y, r)));
    const wb = Math.floor(r() * 3); const key = `${ci}|${wb}`;
    if (!groups.has(key)) groups.set(key, { c: palette[ci], w: width[0] + ((width[1] - width[0]) * (wb + 0.5)) / 3, o: alpha[0] + ((alpha[1] - alpha[0]) * (2 - wb + r() * 0.6)) / 3, d: '' });
    groups.get(key).d += `M${x.toFixed(1)},${y.toFixed(1)}Q${cx.toFixed(1)},${cy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`;
  }
  return `<g fill="none" stroke-linecap="round">${[...groups.values()].map((gr) => `<path d="${gr.d}" stroke="${gr.c}" stroke-width="${gr.w.toFixed(2)}" opacity="${gr.o.toFixed(2)}"/>`).join('')}</g>`;
}
const cubic = (p0, p1, p2, p3, t) => { const u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; };

const EAR_L = 'M124,122 C112,100 98,66 86,22 C83,10 94,5 100,13 C126,44 150,70 168,86 Z';
const EAR_R = 'M236,122 C248,100 262,66 274,22 C277,10 266,5 260,13 C234,44 210,70 192,86 Z';
const LEG_L = 'M148,272 C145,308 145,350 148,388 Q160,398 172,388 C174,350 174,308 172,272 Z';
const LEG_R = 'M188,272 C186,308 186,350 188,388 Q200,398 212,388 C215,350 215,308 212,272 Z';
const MUZZLE = 'M150,150 C150,134 166,128 180,128 C194,128 210,134 210,150 C210,170 198,186 180,188 C162,186 150,170 150,150 Z';

function dog(ghost, k) {
  const g = `pmd${k}`;
  if (ghost) {
    // thumbnails: a pale silhouette
    const f = '#DCD6D2', ln = 'stroke="#B8B0AB" stroke-opacity=".5" stroke-width="1.4" stroke-linejoin="round"';
    const paw = (x, y, rx, ry) => `<path d="M${x - rx},${y} q0,${-ry} ${rx},${-ry} q${rx},0 ${rx},${ry} q-2,${ry * 0.8} -${rx},${ry * 0.8} q-${rx - 2},0 -${rx},-${ry * 0.8}z" fill="${f}" ${ln}/>`;
    return {
      defs: '',
      back: `<ellipse cx="180" cy="404" rx="100" ry="10" fill="#2A1420" opacity=".12"/><path d="M246,330 C296,322 310,286 292,264 C282,252 266,254 260,266" fill="none" stroke="${f}" stroke-width="17" stroke-linecap="round"/><ellipse cx="116" cy="340" rx="36" ry="44" fill="${f}" ${ln}/><ellipse cx="244" cy="340" rx="36" ry="44" fill="${f}" ${ln}/>${paw(112, 384, 30, 14)}${paw(248, 384, 30, 14)}<path d="${EAR_L}" fill="${f}" ${ln}/><path d="${EAR_R}" fill="${f}" ${ln}/>`,
      body: `<path d="${BODY}" fill="${f}" ${ln}/><path d="M150,214 C136,252 136,302 146,344 C158,364 202,364 214,344 C224,302 224,252 210,214 Q180,224 150,214Z" fill="#E8E3DF"/>`,
      legs: `<path d="${LEG_L}" fill="${f}" ${ln}/><path d="${LEG_R}" fill="${f}" ${ln}/>`,
      paws: `${paw(159, 392, 21, 12)}${paw(201, 392, 21, 12)}`,
      head: `<path d="${HEAD}" fill="${f}" ${ln}/><path d="${MUZZLE}" fill="#E8E3DF"/>`,
      face: '',
    };
  }
  // palettes: a smooth-coat fawn chihuahua, cream underneath, lit from the top left
  const HEADP = ['#F8E7CD', '#EDCFA3', '#DBB078', '#C08E58', '#9E6E42', '#7E5430'];
  const BODYP = ['#F4DBB8', '#E4BF90', '#CF9F68', '#B2804E', '#8F6238', '#6F4A2A'];
  const CREAMP = ['#FFFBF4', '#F6EAD8', '#EAD6BB', '#DCC3A2'];
  const EARP = ['#F2D8BC', '#DDB890', '#C2946A', '#A77A50', '#7E5430'];
  const defs = `
    <radialGradient id="${g}f" cx=".36" cy=".3" r=".9"><stop offset="0" stop-color="#F1D3AC"/><stop offset=".55" stop-color="#DDB07A"/><stop offset="1" stop-color="#A27044"/></radialGradient>
    <radialGradient id="${g}h" cx=".4" cy=".34" r=".78"><stop offset="0" stop-color="#F4DDBD"/><stop offset=".6" stop-color="#E0B781"/><stop offset="1" stop-color="#AC7C4C"/></radialGradient>
    <radialGradient id="${g}c" cx=".5" cy=".3" r=".85"><stop offset="0" stop-color="#FFFCF7"/><stop offset=".7" stop-color="#F2E4D0"/><stop offset="1" stop-color="#DFC7A8"/></radialGradient>
    <linearGradient id="${g}mz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D8B088"/><stop offset=".45" stop-color="#EBD2B4"/><stop offset="1" stop-color="#F7EADA"/></linearGradient>
    <linearGradient id="${g}ei" x1=".1" y1="1" x2=".6" y2="0"><stop offset="0" stop-color="#E8B4BB"/><stop offset=".6" stop-color="#D99AA6"/><stop offset="1" stop-color="#C98A95"/></linearGradient>
    <radialGradient id="${g}e" cx=".42" cy=".4" r=".62"><stop offset="0" stop-color="#5C3A22"/><stop offset=".55" stop-color="#2E1A0E"/><stop offset="1" stop-color="#0D0806"/></radialGradient>
    <radialGradient id="${g}n" cx=".38" cy=".3" r=".75"><stop offset="0" stop-color="#4A403E"/><stop offset=".7" stop-color="#1A1513"/><stop offset="1" stop-color="#0A0807"/></radialGradient>
    <filter id="${g}soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5"/></filter>
    <filter id="${g}soft2" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.2"/></filter>
    <filter id="${g}fur" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="3" seed="4" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="${g}grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 .2  0 0 0 0 .12  0 0 0 0 .06  0 0 0 -1.2 .9"/></filter>
    <clipPath id="${g}bodyc"><path d="${BODY}"/></clipPath><clipPath id="${g}headc"><path d="${HEAD}"/></clipPath><clipPath id="${g}elc"><path d="${EAR_L}"/></clipPath><clipPath id="${g}erc"><path d="${EAR_R}"/></clipPath>
    <clipPath id="${g}llc"><path d="${LEG_L}"/></clipPath><clipPath id="${g}lrc"><path d="${LEG_R}"/></clipPath><clipPath id="${g}mzc"><path d="${MUZZLE}"/></clipPath>
    <clipPath id="${g}hlc"><ellipse cx="116" cy="340" rx="36" ry="44"/></clipPath><clipPath id="${g}hrc"><ellipse cx="244" cy="340" rx="36" ry="44"/></clipPath>`;
  const line = `stroke="#8A5C36" stroke-opacity=".3" stroke-width="1.1" stroke-linejoin="round"`;
  const grain = (clip, op = 0.35) => `<rect x="40" y="0" width="280" height="420" filter="url(#${g}grain)" clip-path="url(#${g}${clip})" opacity="${op}"/>`;
  const seed = 11;
  // direction fields
  const headDir = (x, y) => { const [dx, dy] = norm(x - 180, y - 156); return [dx, dy - 0.25]; };
  const muzDir = (x, y) => norm((x - 180) * 0.6, 1 + (y - 150) * 0.01);
  const bodyDir = (x, y) => norm((x - 180) * 0.35, 60);
  const legDir = () => [0, 1];
  const earLDir = () => norm(86 - 150, 22 - 96);
  const earRDir = () => norm(274 - 210, 22 - 96);
  const haunchL = (x, y) => norm((x - 116) * 0.5, 40), haunchR = (x, y) => norm((x - 244) * 0.5, 40);
  // tail plume: hairs standing off the centreline
  const T0 = [246, 330], T1 = [296, 322], T2 = [310, 286], T3 = [292, 264];
  const tailHairs = (() => { const r = rng(77); const d = ['', '', '']; for (let i = 0; i < 220; i++) { const t = r(); const [px, py] = cubic(T0, T1, T2, T3, t); const [qx, qy] = cubic(T0, T1, T2, T3, Math.min(1, t + 0.02)); const [nx, ny] = norm(-(qy - py), qx - px); const side = r() < 0.5 ? -1 : 1; const off = r() * 7; const L = 5 + r() * 8; const sx = px + nx * off * side, sy = py + ny * off * side; const a = Math.atan2(ny * side, nx * side) + (r() - 0.5) * 0.8 + 0.5; d[Math.floor(r() * 3)] += `M${sx.toFixed(1)},${sy.toFixed(1)}l${(Math.cos(a) * L).toFixed(1)},${(Math.sin(a) * L).toFixed(1)}`; } return `<g fill="none" stroke-linecap="round"><path d="${d[0]}" stroke="#F0D5B5" stroke-width=".9" opacity=".5"/><path d="${d[1]}" stroke="#C08F5E" stroke-width="1.1" opacity=".45"/><path d="${d[2]}" stroke="#8F6238" stroke-width=".8" opacity=".4"/></g>`; })();
  const paw = (x, y, rx, ry, seedP) => `<path d="M${x - rx},${y} q0,${-ry} ${rx},${-ry} q${rx},0 ${rx},${ry} q-2,${ry * 0.8} -${rx},${ry * 0.8} q-${rx - 2},0 -${rx},-${ry * 0.8}z" fill="url(#${g}f)" ${line}/>
    <path d="M${x - rx * 0.36},${y - 3} v8 M${x},${y - 2} v9 M${x + rx * 0.36},${y - 3} v8" stroke="#6A4328" stroke-opacity=".5" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M${x - rx * 0.58},${y + 4} l-1,5 M${x - rx * 0.18},${y + 6} l-.4,5 M${x + rx * 0.18},${y + 6} l.4,5 M${x + rx * 0.58},${y + 4} l1,5" stroke="#2A1E18" stroke-width="1.5" stroke-linecap="round" opacity=".75"/>
    ${hairs(seedP, 40, [x - rx, y - ry, rx * 2, ry * 1.6], () => [0, 1], BODYP, [3, 6], [0.5, 1], [0.2, 0.45])}`;
  const ear = (d, clip, dir, sd, inner, veins) => `<path d="${d}" fill="url(#${g}h)" ${line}/>
    <path d="${inner}" fill="url(#${g}ei)" opacity=".9"/>
    <path d="${veins}" fill="none" stroke="#B86F7E" stroke-width=".9" opacity=".55"/>
    ${hairs(sd, 420, [80, 4, 100, 124], dir, EARP, [3.5, 8], [0.4, 1], [0.18, 0.48], (x, y, r) => (y < 50 && r() < 0.6 ? 1 : 0)).replace('<g ', `<g clip-path="url(#${g}${clip})" `)}
    ${grain(clip, 0.3)}`;
  return {
    defs,
    back: `<ellipse cx="180" cy="404" rx="104" ry="11" fill="#2A1420" opacity=".2" filter="url(#${g}soft)"/>
      <g filter="url(#${g}fur)">
        <path d="M246,330 C296,322 310,286 292,264 C282,252 266,254 260,266" fill="none" stroke="#C9996A" stroke-width="15" stroke-linecap="round"/>
        <path d="M248,328 C294,320 306,288 290,268" fill="none" stroke="#E9CDA8" stroke-width="6" stroke-linecap="round" opacity=".6"/>
        <path d="M246,334 C292,330 310,300 300,278" fill="none" stroke="#8F6238" stroke-width="5" stroke-linecap="round" opacity=".35"/>
        ${tailHairs}
        <ellipse cx="116" cy="340" rx="36" ry="44" fill="url(#${g}f)" ${line}/><ellipse cx="244" cy="340" rx="36" ry="44" fill="url(#${g}f)" ${line}/>
        ${hairs(seed + 1, 420, [80, 296, 72, 88], haunchL, BODYP, [3.5, 8], [0.4, 1], [0.18, 0.48]).replace('<g ', `<g clip-path="url(#${g}hlc)" `)}
        ${hairs(seed + 2, 420, [208, 296, 72, 88], haunchR, BODYP, [3.5, 8], [0.4, 1], [0.18, 0.48]).replace('<g ', `<g clip-path="url(#${g}hrc)" `)}
        <ellipse cx="128" cy="320" rx="22" ry="34" fill="#7A4E2C" opacity=".22" filter="url(#${g}soft)" clip-path="url(#${g}hlc)"/><ellipse cx="232" cy="320" rx="22" ry="34" fill="#7A4E2C" opacity=".22" filter="url(#${g}soft)" clip-path="url(#${g}hrc)"/>
        ${paw(112, 384, 30, 14, 31)}${paw(248, 384, 30, 14, 32)}
        ${ear(EAR_L, 'elc', earLDir, seed + 3, 'M130,112 C120,94 108,66 98,34 C118,56 140,78 156,90 Z', 'M106,50 C116,66 130,82 146,92 M100,62 C110,74 122,84 136,92 M112,40 C118,52 126,62 134,70')}
        ${ear(EAR_R, 'erc', earRDir, seed + 4, 'M230,112 C240,94 252,66 262,34 C242,56 220,78 204,90 Z', 'M254,50 C244,66 230,82 214,92 M260,62 C250,74 238,84 224,92 M248,40 C242,52 234,62 226,70')}
        <path d="M92,18 C110,46 134,72 154,90" fill="none" stroke="#F6E2CB" stroke-width="1.6" opacity=".5" stroke-linecap="round"/><path d="M268,18 C250,46 226,72 206,90" fill="none" stroke="#F6E2CB" stroke-width="1.6" opacity=".5" stroke-linecap="round"/>
      </g>`,
    body: `<g filter="url(#${g}fur)">
        <path d="${BODY}" fill="url(#${g}f)" ${line}/>
        <path d="M150,214 C136,252 136,302 146,344 C158,364 202,364 214,344 C224,302 224,252 210,214 Q180,224 150,214Z" fill="url(#${g}c)"/>
        ${hairs(seed + 5, 1500, [100, 200, 160, 180], bodyDir, BODYP, [4, 9], [0.4, 1.1], [0.18, 0.5], (x, y, r) => (Math.abs(x - 180) > 55 && r() < 0.5 ? 1 : 0)).replace('<g ', `<g clip-path="url(#${g}bodyc)" `)}
        ${hairs(seed + 6, 600, [140, 214, 80, 150], bodyDir, CREAMP, [4, 9], [0.4, 1.1], [0.22, 0.5]).replace('<g ', `<g clip-path="url(#${g}bodyc)" `)}
        ${grain('bodyc', 0.3)}
        <path d="M104,300 C100,330 112,360 134,372" fill="none" stroke="#7A4E2C" stroke-width="14" opacity=".2" filter="url(#${g}soft)" clip-path="url(#${g}bodyc)"/><path d="M256,300 C260,330 248,360 226,372" fill="none" stroke="#7A4E2C" stroke-width="14" opacity=".24" filter="url(#${g}soft)" clip-path="url(#${g}bodyc)"/>
        <ellipse cx="180" cy="206" rx="62" ry="16" fill="#6A4020" opacity=".4" filter="url(#${g}soft)" clip-path="url(#${g}bodyc)"/>
        <ellipse cx="180" cy="372" rx="30" ry="12" fill="#6A4020" opacity=".22" filter="url(#${g}soft)" clip-path="url(#${g}bodyc)"/>
      </g>`,
    legs: `<g filter="url(#${g}fur)">
        <path d="${LEG_L}" fill="url(#${g}f)" ${line}/><path d="${LEG_R}" fill="url(#${g}f)" ${line}/>
        ${hairs(seed + 7, 320, [146, 272, 28, 118], legDir, BODYP, [3.5, 7], [0.4, 1], [0.18, 0.48]).replace('<g ', `<g clip-path="url(#${g}llc)" `)}
        ${hairs(seed + 8, 320, [186, 272, 28, 118], legDir, BODYP, [3.5, 7], [0.4, 1], [0.18, 0.48]).replace('<g ', `<g clip-path="url(#${g}lrc)" `)}
        <path d="M167,280 C169,320 169,352 167,384" fill="none" stroke="#7A4E2C" stroke-width="7" opacity=".28" filter="url(#${g}soft2)" clip-path="url(#${g}llc)"/><path d="M207,280 C209,320 209,352 207,384" fill="none" stroke="#7A4E2C" stroke-width="7" opacity=".28" filter="url(#${g}soft2)" clip-path="url(#${g}lrc)"/>
        <path d="M151,282 C150,320 150,352 151,384" fill="none" stroke="#F3DCC0" stroke-width="3" opacity=".35" filter="url(#${g}soft2)" clip-path="url(#${g}llc)"/><path d="M191,282 C190,320 190,352 191,384" fill="none" stroke="#F3DCC0" stroke-width="3" opacity=".35" filter="url(#${g}soft2)" clip-path="url(#${g}lrc)"/>
        <path d="M148,348 q12,4 24,0 M188,348 q12,4 24,0" fill="none" stroke="#7A4E2C" stroke-width="2" opacity=".2" filter="url(#${g}soft2)"/>
      </g>`,
    paws: `<g filter="url(#${g}fur)">${paw(159, 392, 21, 12, 33)}${paw(201, 392, 21, 12, 34)}</g>`,
    head: `<ellipse cx="180" cy="202" rx="56" ry="13" fill="#4A2A12" opacity=".36" filter="url(#${g}soft)"/>
      <g filter="url(#${g}fur)">
        <path d="${HEAD}" fill="url(#${g}h)" ${line}/>
        ${hairs(seed + 9, 1400, [114, 66, 132, 132], headDir, HEADP, [3.5, 8], [0.4, 1.1], [0.18, 0.5], (x, y, r) => (y < 100 && r() < 0.5 ? 1 : 0) + (y > 150 ? -1 : 0)).replace('<g ', `<g clip-path="url(#${g}headc)" `)}
        ${grain('headc', 0.32)}
        <path d="M232,96 C246,120 246,160 230,182" fill="none" stroke="#7A4E2C" stroke-width="12" opacity=".2" filter="url(#${g}soft)" clip-path="url(#${g}headc)"/>
        <ellipse cx="156" cy="98" rx="26" ry="18" fill="#FBEEDC" opacity=".28" filter="url(#${g}soft)" clip-path="url(#${g}headc)"/>
        <path d="M126,118 C118,100 108,82 100,66 M234,118 C242,100 252,82 260,66" fill="none" stroke="#5A3A20" stroke-width="7" opacity=".28" filter="url(#${g}soft)" clip-path="url(#${g}headc)"/>
        <path d="${MUZZLE}" fill="url(#${g}mz)"/>
        ${hairs(seed + 10, 420, [150, 128, 60, 60], muzDir, ['#F4E2CC', '#E6CBA9', '#D2B087', '#BE966A'], [2.5, 5], [0.35, 0.9], [0.18, 0.42]).replace('<g ', `<g clip-path="url(#${g}mzc)" `)}
        <path d="M152,140 C160,132 200,132 208,140" fill="none" stroke="#8E6038" stroke-width="6" opacity=".25" filter="url(#${g}soft2)" clip-path="url(#${g}mzc)"/>
        <ellipse cx="140" cy="128" rx="18" ry="14" fill="#6A4020" opacity=".16" filter="url(#${g}soft)" clip-path="url(#${g}headc)"/><ellipse cx="220" cy="128" rx="18" ry="14" fill="#6A4020" opacity=".2" filter="url(#${g}soft)" clip-path="url(#${g}headc)"/>
        <ellipse cx="150" cy="106" rx="9" ry="5" fill="#F8E9D4" opacity=".55" filter="url(#${g}soft2)"/><ellipse cx="210" cy="106" rx="9" ry="5" fill="#F8E9D4" opacity=".5" filter="url(#${g}soft2)"/>
      </g>`,
    face: `
      <g transform="rotate(-4 151 128)"><ellipse cx="151" cy="128" rx="13.5" ry="13.8" fill="#1A0E08"/><ellipse cx="151" cy="128" rx="12" ry="12.3" fill="url(#${g}e)"/><ellipse cx="149.5" cy="128.5" rx="7.2" ry="7.6" fill="#07040300"/><ellipse cx="149.5" cy="128.8" rx="7" ry="7.4" fill="#070403"/><path d="M140,134 q11,9 22,0" fill="none" stroke="#fff" stroke-width="1" opacity=".28"/><ellipse cx="146" cy="121.5" rx="3.6" ry="2.8" fill="#fff" opacity=".95"/><ellipse cx="156" cy="134" rx="2.2" ry="1.4" fill="#fff" opacity=".55"/><path d="M139,124 q4,-8 12,-9" fill="none" stroke="#fff" stroke-width="1.6" opacity=".35" stroke-linecap="round"/></g>
      <g transform="rotate(4 209 128)"><ellipse cx="209" cy="128" rx="13.5" ry="13.8" fill="#1A0E08"/><ellipse cx="209" cy="128" rx="12" ry="12.3" fill="url(#${g}e)"/><ellipse cx="207.5" cy="128.8" rx="7" ry="7.4" fill="#070403"/><path d="M198,134 q11,9 22,0" fill="none" stroke="#fff" stroke-width="1" opacity=".28"/><ellipse cx="204" cy="121.5" rx="3.6" ry="2.8" fill="#fff" opacity=".95"/><ellipse cx="214" cy="134" rx="2.2" ry="1.4" fill="#fff" opacity=".55"/><path d="M197,124 q4,-8 12,-9" fill="none" stroke="#fff" stroke-width="1.6" opacity=".35" stroke-linecap="round"/></g>
      <path d="M137,120 C140,112 148,110 156,112" fill="none" stroke="#2A1810" stroke-width="2" stroke-linecap="round" opacity=".85"/><path d="M223,120 C220,112 212,110 204,112" fill="none" stroke="#2A1810" stroke-width="2" stroke-linecap="round" opacity=".85"/>
      <path d="M139,138 q5,6 12,5 M221,138 q-5,6 -12,5" fill="none" stroke="#2A1810" stroke-width="1.4" stroke-linecap="round" opacity=".6"/>
      <ellipse cx="138" cy="131" rx="1.6" ry="2.2" fill="#C9868C" opacity=".7"/><ellipse cx="222" cy="131" rx="1.6" ry="2.2" fill="#C9868C" opacity=".7"/>
      <path d="M163,145 C165,137 195,137 197,145 C198,154 191,161 185,164 L180,166 L175,164 C169,161 162,154 163,145Z" fill="url(#${g}n)"/>
      <path d="M169,149 c-2.5,2 -2,6.5 1.5,8 c2.5,.5 3,-2.5 1.5,-5 c-1,-1.5 -2,-2.5 -3,-3z M191,149 c2.5,2 2,6.5 -1.5,8 c-2.5,.5 -3,-2.5 -1.5,-5 c1,-1.5 2,-2.5 3,-3z" fill="#050303" opacity=".9"/>
      <ellipse cx="173.5" cy="146" rx="4" ry="2.2" fill="#fff" opacity=".6"/><ellipse cx="184" cy="158" rx="2" ry="1" fill="#fff" opacity=".25"/>
      <path d="M180,166 v6" stroke="#2A1810" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>
      <path d="M160,172 Q170,181 180,172 Q190,181 200,172" fill="none" stroke="#2A1810" stroke-width="1.7" stroke-linecap="round" opacity=".85"/>
      <path d="M160,172 Q170,181 180,172 Q190,181 200,172" fill="none" stroke="#B88A86" stroke-width="3" stroke-linecap="round" opacity=".18" transform="translate(0 2)"/>
      <g stroke="#F3E6D6" stroke-width=".8" fill="none" opacity=".55" stroke-linecap="round"><path d="M158,164 C146,166 134,170 122,176"/><path d="M157,170 C146,174 136,180 126,188"/><path d="M160,176 C150,182 142,190 136,198"/><path d="M202,164 C214,166 226,170 238,176"/><path d="M203,170 C214,174 224,180 234,188"/><path d="M200,176 C210,182 218,190 224,198"/></g>
      <g fill="#2A1810" opacity=".45"><circle cx="160" cy="165" r=".9"/><circle cx="158" cy="171" r=".9"/><circle cx="161" cy="177" r=".9"/><circle cx="200" cy="165" r=".9"/><circle cx="202" cy="171" r=".9"/><circle cx="199" cy="177" r=".9"/></g>`,
  };
}

/**
 * look: { [slot]: item }  opts: { viewBox, ghost, label, shadow }
 */
const DOG_CACHE = {};
export function renderPim(look = {}, opts = {}) {
  const k = (n = (n + 1) % 100000);
  const gk = opts.ghost ? 'ghost' : 'full';
  const D = DOG_CACHE[gk] || (DOG_CACHE[gk] = dog(!!opts.ghost, gk));
  const defs = [D.defs];
  const L = { behindBody: [], onBody: [], sleeves: [], skirt: [], onPaws: [], neck: [], head: [], eyes: [], bag: [] };
  let j = 0;
  // every garment layer registers its gradient and clip path in the shared defs
  const cl = (d, it, kk, o) => { const c = cloth(d, it, kk, o); defs.push(c.defs); return c.body; };
  const add = (where, d, it, o) => { L[where].push(cl(d, it, `${k}_${j++}`, o)); };
  const spec = (it) => (Array.isArray(it.render) ? it.render[0] : it.render) || {};
  const top = look.top, dress = look.dress, outer = look.outer;
  // dress or top
  if (dress) {
    const st = spec(dress).style || 'sundress';
    if (st === 'tutu') { add('onBody', BODY_TOP(300), dress); for (let i = 0; i < 3; i++) add('skirt', SKIRT(296 + i * 6, 372 - i * 10, 14 - i * 4), { ...dress, texture: 'sheer' }); }
    else if (st === 'gown') { add('onBody', BODY_TOP(300), dress); add('skirt', SKIRT(298, 398, 22), dress); }
    else if (st === 'sweaterdress') { add('onBody', BODY_TOP(300), { ...dress, texture: 'knit' }); add('skirt', SKIRT(298, 360, 4), { ...dress, texture: 'knit' }); }
    else { add('onBody', BODY_TOP(300), dress); add('skirt', SKIRT(298, 376, 12), dress); L.onBody.push(`<path d="M150,214 l-6,-18 M210,214 l6,-18" stroke="${shade(dress.color, -0.3)}" stroke-width="3" stroke-linecap="round"/>`); }
    if (spec(dress).details?.includes('bow') || st === 'tutu') L.onBody.push(bow(180, 222, 12, dress.trim || shade(dress.color, 0.25), `${k}d`));
  } else if (top) {
    const st = spec(top).style || 'tee';
    const hem = st === 'tee' ? 332 : 348;
    add('onBody', BODY_TOP(hem), top);
    if (st === 'turtleneck') add('onBody', 'M140,196 Q180,222 220,196 L222,216 Q180,240 138,216Z', top);
    if (st === 'hoodie') { L.behindBody.push(cl('M126,150 Q100,210 128,236 Q180,262 232,236 Q260,210 234,150 Q180,180 126,150Z', top, `${k}h`)); L.onBody.push(`<path d="M168,222 v30 M192,222 v30" stroke="${shade(top.color, -0.4)}" stroke-width="3" stroke-linecap="round"/>`); }
    const sl = st === 'hoodie' ? 330 : 0;
    if (sl) L.sleeves.push(cl(SLEEVE(146, sl), top, `${k}_s1`), cl(SLEEVE(188, sl), top, `${k}_s2`));
    if (st === 'sweater' && spec(top).details?.includes('bow')) L.onBody.push(bow(180, 230, 10, top.trim || '#fff', `${k}t`));
  }
  // outer
  if (outer) {
    const st = spec(outer).style || 'coat';
    const hem = st === 'cape' ? 372 : st === 'puffer' ? 350 : 362;
    if (st === 'cape') { L.behindBody.push(cl('M118,206 Q70,280 84,380 Q180,398 276,380 Q290,280 242,206 Q180,236 118,206Z', outer, `${k}cp`)); L.neck.push(bow(180, 212, 11, outer.trim || shade(outer.color, -0.2), `${k}cb`)); }
    else {
      add('onBody', COAT_L(hem), outer); add('onBody', COAT_R(hem), outer);
      L.onBody.push(`<path d="M136,212 L172,246 L168,236Z M224,212 L188,246 L192,236Z" fill="${shade(outer.color, 0.3)}" stroke="${shade(outer.color, -0.4)}" stroke-width="1.2"/>`);
      if (st === 'puffer') L.onBody.push(`<g stroke="${shade(outer.color, -0.35)}" stroke-width="1.6" opacity=".6"><path d="M102,262 Q136,270 170,266 M190,266 Q224,270 258,262 M100,296 Q136,304 170,300 M190,300 Q224,304 260,296 M100,330 Q136,338 170,334 M190,334 Q224,338 260,330"/></g>`);
      if (st === 'raincoat') { L.behindBody.push(cl('M124,146 Q96,210 126,238 Q180,266 234,238 Q264,210 236,146 Q180,176 124,146Z', outer, `${k}rh`)); L.onBody.push(`<g fill="${shade(outer.color, -0.35)}"><circle cx="180" cy="262" r="3"/><circle cx="180" cy="290" r="3"/><circle cx="180" cy="318" r="3"/></g>`); }
      if (st === 'trench') L.onBody.push(`<path d="M104,312 Q180,326 256,312" fill="none" stroke="${shade(outer.color, -0.35)}" stroke-width="7"/><rect x="170" y="306" width="20" height="14" rx="3" fill="none" stroke="${shade(outer.color, -0.5)}" stroke-width="2"/>`);
      L.sleeves.push(cl(SLEEVE(140, 336), outer, `${k}_o1`), cl(SLEEVE(194, 336), outer, `${k}_o2`));
    }
  }
  // neck
  if (look.neck) {
    const it = look.neck; const st = spec(it).style || 'collar';
    if (st === 'collar') { add('neck', COLLAR, it); L.neck.push(`<circle cx="180" cy="226" r="7" fill="${it.metal === 'silver' ? '#D7DAE0' : '#E8C25A'}" stroke="#8A6A1A" stroke-opacity=".6" stroke-width="1"/><circle cx="178" cy="224" r="2" fill="#fff" opacity=".8"/>`); }
    else if (st === 'bandana') add('neck', BANDANA, it);
    else if (st === 'bowtie') { add('neck', 'M130,192 Q180,214 230,192 L232,200 Q180,222 128,200Z', it); L.neck.push(bow(180, 214, 13, it.color, `${k}bt`)); }
    else if (st === 'pearls') L.neck.push(`<g>${Array.from({ length: 11 }, (_, i) => { const t = i / 10; const x = 126 + t * 108; const y = 200 + Math.sin(t * Math.PI) * 22; return `<circle cx="${x}" cy="${y}" r="5" fill="${it.color || '#F4EFE6'}" stroke="#B8AFA0" stroke-width=".8"/><circle cx="${x - 1.5}" cy="${y - 1.5}" r="1.5" fill="#fff"/>`; }).join('')}</g>`);
    else if (st === 'chain') L.neck.push(`<path d="M128,196 Q180,238 232,196" fill="none" stroke="${it.metal === 'silver' ? '#C9CDD4' : '#E2B64A'}" stroke-width="6" stroke-linecap="round"/><path d="M128,196 Q180,238 232,196" fill="none" stroke="#fff" stroke-width="1.5" opacity=".6" stroke-dasharray="3 4"/><circle cx="180" cy="226" r="7" fill="${it.metal === 'silver' ? '#D7DAE0' : '#E8C25A'}"/>`);
    else if (st === 'scarf') { add('neck', 'M124,188 Q180,220 236,188 L240,206 Q180,236 120,206Z', it); add('neck', 'M196,210 L214,282 L236,276 L222,204Z', it); }
  }
  // head
  if (look.head) {
    const it = look.head; const st = spec(it).style || 'bow';
    if (st === 'bow') L.head.push(bow(180, 62, 20, it.color, `${k}hb`));
    else if (st === 'earbows') L.head.push(bow(106, 36, 9, it.color, `${k}e1`), bow(254, 36, 9, it.color, `${k}e2`));
    else if (st === 'beret') { add('head', 'M118,86 Q120,52 170,50 Q226,48 232,80 Q180,92 118,86Z', it); L.head.push(`<circle cx="176" cy="50" r="4" fill="${shade(it.color, -0.3)}"/>`); }
    else if (st === 'bucket') { add('head', 'M126,92 Q130,46 180,44 Q230,46 234,92 Q180,104 126,92Z', it); add('head', 'M110,90 Q180,112 250,90 L254,100 Q180,124 106,100Z', it); }
    else if (st === 'beanie') { add('head', 'M120,96 Q122,40 180,38 Q238,40 240,96 Q180,108 120,96Z', { ...it, texture: 'knit' }); add('head', 'M118,88 Q180,110 242,88 L242,102 Q180,124 118,102Z', { ...it, texture: 'rib' }); L.head.push(`<circle cx="180" cy="36" r="11" fill="${shade(it.color, 0.25)}" stroke="${shade(it.color, -0.3)}" stroke-width="1.5" stroke-dasharray="2 2"/>`); }
    else if (st === 'visor') { add('head', 'M118,92 Q180,114 242,92 L244,104 Q180,128 116,104Z', it); add('head', 'M116,104 Q180,96 244,104 L256,118 Q180,100 104,118Z', { ...it, color: shade(it.color, -0.1) }); }
    else if (st === 'tiara') L.head.push(`<path d="M146,84 L156,56 L168,78 L180,46 L192,78 L204,56 L214,84 Q180,96 146,84Z" fill="${it.metal === 'silver' ? '#D9DCE3' : '#E9C45A'}" stroke="${it.metal === 'silver' ? '#8F96A3' : '#9A7A1C'}" stroke-width="1.2"/><circle cx="180" cy="52" r="4" fill="${it.color || '#F28AB2'}"/><circle cx="156" cy="62" r="2.5" fill="${it.color || '#F28AB2'}"/><circle cx="204" cy="62" r="2.5" fill="${it.color || '#F28AB2'}"/>`);
    else if (st === 'flower') L.head.push(`<g transform="translate(232,78)">${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="7" ry="12" transform="rotate(${a}) translate(0,-10)" fill="${it.color}" stroke="${shade(it.color, -0.3)}" stroke-width="1"/>`).join('')}<circle r="5" fill="#FFE39A"/></g>`);
    else if (st === 'cap') { add('head', 'M124,92 Q128,48 180,46 Q232,48 236,92 Q180,104 124,92Z', it); add('head', 'M232,86 Q262,84 278,100 Q240,104 228,98Z', it); }
  }
  // eyes
  if (look.eyes) {
    const it = look.eyes; const st = spec(it).style || 'shades'; const c = it.color || '#2A2230';
    if (st === 'heart') L.eyes.push(`<g fill="${c}" opacity=".85" stroke="${shade(c, -0.4)}" stroke-width="1.4"><path d="M152,146 q-20,-14 -16,-28 q6,-12 16,-2 q10,-10 16,2 q4,14 -16,28z"/><path d="M208,146 q-20,-14 -16,-28 q6,-12 16,-2 q10,-10 16,2 q4,14 -16,28z"/></g><path d="M166,124 h28" stroke="${shade(c, -0.4)}" stroke-width="3"/>`);
    else if (st === 'shield') L.eyes.push(`<path d="M116,112 Q180,100 244,112 L240,142 Q180,156 120,142Z" fill="${c}" opacity=".82" stroke="${shade(c, -0.4)}" stroke-width="1.5"/><path d="M128,118 q30,-4 50,0" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/>`);
    else L.eyes.push(`<g fill="${c}" opacity=".88" stroke="${shade(c, -0.4)}" stroke-width="1.5"><ellipse cx="152" cy="127" rx="22" ry="18"/><ellipse cx="208" cy="127" rx="22" ry="18"/></g><path d="M174,124 h12" stroke="${shade(c, -0.4)}" stroke-width="3"/><path d="M138,118 q8,-6 18,-3" stroke="#fff" stroke-width="3" opacity=".55" stroke-linecap="round"/><path d="M194,118 q8,-6 18,-3" stroke="#fff" stroke-width="3" opacity=".55" stroke-linecap="round"/>`);
  }
  // shoes: four paws
  if (look.shoes) {
    const it = look.shoes; const st = spec(it).style || 'booties';
    const paw = (x, y, rx, ry, i) => (st === 'socks' ? `${cl(`M${x - rx},${y - ry - 10} h${rx * 2} v${ry + 10} q0,${ry} -${rx},${ry} q-${rx},0 -${rx},-${ry}z`, { ...it, texture: 'rib' }, `${k}_p${i}`)}<path d="M${x - rx},${y - ry - 4} h${rx * 2}" stroke="${it.color2 || shade(it.color, -0.35)}" stroke-width="3"/>`
      : st === 'sneakers' ? `${cl(`M${x - rx - 2},${y - ry - 6} q${rx + 2},-8 ${rx * 2 + 4},0 v${ry + 6} q-${rx + 2},${ry} -${rx * 2 + 4},0z`, it, `${k}_p${i}`)}<path d="M${x - rx - 2},${y + 4} q${rx + 2},${ry} ${rx * 2 + 4},0" fill="none" stroke="#fff" stroke-width="4"/><path d="M${x - 6},${y - ry} l12,6 M${x - 6},${y - ry + 6} l12,6" stroke="${shade(it.color, -0.4)}" stroke-width="1.5"/>`
      : cl(`M${x - rx - 2},${y - ry - 8} h${rx * 2 + 4} v${ry + 8} q0,${ry} -${rx + 2},${ry} q-${rx + 2},0 -${rx + 2},-${ry}z`, it, `${k}_p${i}`));
    L.onPaws.push(paw(159, 391, 19, 11, 1), paw(201, 391, 19, 11, 2));
    L.behindBody.push(paw(116, 378, 27, 15, 3), paw(244, 378, 27, 15, 4));
  }
  // bag: a crossbody purse
  if (look.bag) {
    const it = look.bag; const st = spec(it).style || 'purse';
    L.bag.push(`<path d="M138,208 Q200,250 238,322" fill="none" stroke="${it.metal === 'gold' ? '#E2B64A' : shade(it.color, -0.3)}" stroke-width="${st === 'chain' ? 4 : 6}" ${st === 'chain' ? 'stroke-dasharray="4 3"' : ''} stroke-linecap="round"/>`);
    add('bag', st === 'tote' ? 'M220,310 h46 l6,40 h-58z' : 'M222,316 h40 q6,0 6,6 v22 q0,6 -6,6 h-40 q-6,0 -6,-6 v-22 q0,-6 6,-6z', it);
    L.bag.push(st === 'tote' ? '' : `<path d="M222,316 h40 q6,0 6,6 v8 h-52 v-8 q0,-6 6,-6z" fill="${shade(it.color, -0.22)}" opacity=".9"/><circle cx="242" cy="334" r="3.5" fill="${it.metal === 'silver' ? '#D7DAE0' : '#E8C25A'}"/>`);
  }
  const label = opts.label ? `<title>${String(opts.label).replace(/[<&]/g, '')}</title>` : '';
  return `<svg class="figure pim" viewBox="${opts.viewBox || PIM_VIEWBOX}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pim">${label}<defs>${defs.join('')}</defs>
    ${D.back}${L.behindBody.join('')}${D.body}${L.onBody.join('')}${D.legs}${L.sleeves.join('')}${L.skirt.join('')}${D.paws}${L.onPaws.join('')}${L.bag.join('')}${L.neck.join('')}${D.head}${D.face}${L.eyes.join('')}${L.head.join('')}
  </svg>`;
}

// portrait: head and shoulders with her signature bow
export function pimBust(size = 52) {
  return renderPim({ head: { color: '#F06BAE', render: { kind: 'pimHead', style: 'bow' } }, neck: { color: '#F6C6D6', render: { kind: 'pimNeck', style: 'collar' }, metal: 'gold' } }, { viewBox: '76 0 208 236' }).replace('<svg class="figure pim"', `<svg class="obj pim" width="${size}" height="${size}"`);
}
