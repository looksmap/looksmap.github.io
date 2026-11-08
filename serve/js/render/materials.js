// Material and print definitions rendered as SVG <pattern>/<gradient> defs.
// Each returns { defs: string, overlay: 'url(#id)' | null, replaceFill: 'url(#id)' | null, opacity? }

const esc = (s) => String(s).replace(/[^a-zA-Z0-9_-]/g, '');

export function shade(c, amt) {
  // amt in [-1, 1]; negative darkens
  const m = c.replace('#', '');
  const n = parseInt(m.length === 3 ? m.split('').map((x) => x + x).join('') : m, 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (v) => Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt);
  r = f(r); g = f(g); b = f(b);
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

export function material(kind, base, id, opts = {}) {
  const pid = `m-${esc(id)}`;
  const dark = shade(base, -0.38), light = shade(base, 0.45), mid = shade(base, -0.14);
  const c2 = opts.c2 || (isLight(base) ? shade(base, -0.5) : shade(base, 0.55));
  switch (kind) {
    case 'satin':
      return { defs: `<linearGradient id="${pid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".22" stop-color="#fff" stop-opacity=".42"/><stop offset=".34" stop-color="#fff" stop-opacity=".06"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset=".88" stop-color="#fff" stop-opacity=".16"/></linearGradient>`, overlay: `url(#${pid})` };
    case 'metallic':
    case 'chrome':
      return { defs: `<linearGradient id="${pid}" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset=".18" stop-color="#fff" stop-opacity=".72"/><stop offset=".3" stop-color="#000" stop-opacity=".12"/><stop offset=".48" stop-color="#fff" stop-opacity=".5"/><stop offset=".62" stop-color="#000" stop-opacity=".22"/><stop offset=".8" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>`, overlay: `url(#${pid})` };
    case 'leather':
      return { defs: `<linearGradient id="${pid}" x1="0" y1="0" x2="1" y2="0.2"><stop offset="0" stop-color="#fff" stop-opacity=".02"/><stop offset=".2" stop-color="#fff" stop-opacity=".26"/><stop offset=".32" stop-color="#fff" stop-opacity=".02"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>`, overlay: `url(#${pid})` };
    case 'latex':
      return { defs: `<linearGradient id="${pid}" x1="0" y1="0" x2="1" y2="0.1"><stop offset=".1" stop-color="#fff" stop-opacity=".0"/><stop offset=".2" stop-color="#fff" stop-opacity=".6"/><stop offset=".27" stop-color="#fff" stop-opacity=".0"/><stop offset=".75" stop-color="#fff" stop-opacity=".28"/><stop offset=".8" stop-color="#fff" stop-opacity="0"/></linearGradient>`, overlay: `url(#${pid})` };
    case 'sheer':
      return { defs: '', overlay: null, opacity: opts.opacity ?? 0.55 };
    case 'velvet':
      return { defs: `<linearGradient id="${pid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".2"/><stop offset=".5" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>`, overlay: `url(#${pid})` };
    case 'denim':
      return { defs: `<pattern id="${pid}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(55)"><rect width="6" height="6" fill="${base}"/><line x1="0" y1="0" x2="0" y2="6" stroke="${light}" stroke-opacity=".28" stroke-width="1"/><line x1="3" y1="0" x2="3" y2="6" stroke="${dark}" stroke-opacity=".32" stroke-width="1"/></pattern>`, replaceFill: `url(#${pid})` };
    case 'rib':
      return { defs: `<pattern id="${pid}" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="${base}"/><line x1="1" y1="0" x2="1" y2="5" stroke="${dark}" stroke-opacity=".3" stroke-width="1.2"/></pattern>`, replaceFill: `url(#${pid})` };
    case 'knit':
      return { defs: `<pattern id="${pid}" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="${base}"/><path d="M0,4 q2,-3 4,0 t4,0" fill="none" stroke="${dark}" stroke-opacity=".28" stroke-width="1.2"/><path d="M0,8 q2,-3 4,0 t4,0" fill="none" stroke="${light}" stroke-opacity=".22" stroke-width="1"/></pattern>`, replaceFill: `url(#${pid})` };
    case 'cable':
      return { defs: `<pattern id="${pid}" width="16" height="14" patternUnits="userSpaceOnUse"><rect width="16" height="14" fill="${base}"/><path d="M4,0 q8,7 0,14 M12,0 q-8,7 0,14" fill="none" stroke="${dark}" stroke-opacity=".3" stroke-width="2"/></pattern>`, replaceFill: `url(#${pid})` };
    case 'tweed':
      return { defs: `<pattern id="${pid}" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="${base}"/><path d="M0,0 L6,6 M6,0 L0,6" stroke="${c2}" stroke-opacity=".55" stroke-width="1"/></pattern>`, replaceFill: `url(#${pid})` };
    case 'fur':
      return { defs: `<pattern id="${pid}" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="${base}"/><path d="M2,12 q2,-8 3,-10 M7,13 q1,-7 4,-11 M11,12 q-1,-6 1,-9 M5,6 q2,-4 1,-6" fill="none" stroke="${dark}" stroke-opacity=".35" stroke-width="1.1" stroke-linecap="round"/><path d="M4,10 q1,-6 2,-8 M9,11 q1,-5 3,-8" fill="none" stroke="${light}" stroke-opacity=".5" stroke-width="1" stroke-linecap="round"/></pattern>`, replaceFill: `url(#${pid})` };
    case 'shearling':
      return { defs: `<pattern id="${pid}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="${base}"/><circle cx="3" cy="3" r="2.2" fill="${light}" fill-opacity=".5"/><circle cx="8" cy="7" r="2.2" fill="${light}" fill-opacity=".5"/></pattern>`, replaceFill: `url(#${pid})` };
    case 'quilt':
      return { defs: `<pattern id="${pid}" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="18" height="18" fill="${base}"/><path d="M0,0 H18 M0,0 V18" stroke="${dark}" stroke-opacity=".3" stroke-width="1"/></pattern>`, replaceFill: `url(#${pid})` };
    case 'sequin':
      return { defs: `<pattern id="${pid}" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="${base}"/><circle cx="3.5" cy="3.5" r="2.6" fill="${light}" fill-opacity=".55"/><circle cx="2.6" cy="2.6" r="1" fill="#fff" fill-opacity=".8"/></pattern>`, replaceFill: `url(#${pid})` };
    case 'lace':
      return { defs: `<pattern id="${pid}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="${base}" fill-opacity=".55"/><circle cx="5" cy="5" r="3.2" fill="none" stroke="${base}" stroke-width="1.2"/><circle cx="0" cy="0" r="1.4" fill="${base}"/><circle cx="10" cy="10" r="1.4" fill="${base}"/><circle cx="10" cy="0" r="1.4" fill="${base}"/><circle cx="0" cy="10" r="1.4" fill="${base}"/></pattern>`, replaceFill: `url(#${pid})` };
    case 'fishnet':
      return { defs: `<pattern id="${pid}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0,0 H7 M0,0 V7" stroke="${base}" stroke-width="1.1" fill="none"/></pattern>`, replaceFill: `url(#${pid})` };
    case 'mesh':
      return { defs: `<pattern id="${pid}" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0,0 H4 M0,0 V4" stroke="${base}" stroke-opacity=".55" stroke-width=".8" fill="none"/></pattern>`, replaceFill: `url(#${pid})` };
    // ---- prints ----
    case 'stripe':
      return { defs: `<pattern id="${pid}" width="${opts.w || 12}" height="${opts.w || 12}" patternUnits="userSpaceOnUse" patternTransform="rotate(${opts.angle ?? 0})"><rect width="${opts.w || 12}" height="${opts.w || 12}" fill="${base}"/><rect width="${(opts.w || 12) / 2}" height="${opts.w || 12}" fill="${c2}"/></pattern>`, replaceFill: `url(#${pid})` };
    case 'pinstripe':
      return { defs: `<pattern id="${pid}" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="${base}"/><rect width="1" height="9" fill="${c2}" fill-opacity=".8"/></pattern>`, replaceFill: `url(#${pid})` };
    case 'gingham':
      return { defs: `<pattern id="${pid}" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="${base}"/><rect width="7" height="14" fill="${c2}" fill-opacity=".45"/><rect width="14" height="7" fill="${c2}" fill-opacity=".45"/></pattern>`, replaceFill: `url(#${pid})` };
    case 'plaid':
      return { defs: `<pattern id="${pid}" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="${base}"/><rect width="10" height="26" fill="${c2}" fill-opacity=".35"/><rect width="26" height="10" fill="${c2}" fill-opacity=".35"/><rect x="16" width="2" height="26" fill="${opts.c3 || '#fff'}" fill-opacity=".5"/><rect y="16" width="26" height="2" fill="${opts.c3 || '#fff'}" fill-opacity=".5"/></pattern>`, replaceFill: `url(#${pid})` };
    case 'houndstooth':
      return { defs: `<pattern id="${pid}" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="${base}"/><path d="M0,0 h6 v6 h-6z M6,6 h6 v6 h-6z M6,0 l6,6 v-6z M0,6 l6,6 h-6z" fill="${c2}"/></pattern>`, replaceFill: `url(#${pid})` };
    case 'leopard':
      return { defs: `<pattern id="${pid}" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="${base}"/><g fill="${opts.c3 || shade(base, -0.25)}"><ellipse cx="5" cy="6" rx="4" ry="3"/><ellipse cx="16" cy="14" rx="4.5" ry="3.2"/><ellipse cx="17" cy="3" rx="2.5" ry="2"/><ellipse cx="4" cy="17" rx="3" ry="2.4"/></g><g fill="none" stroke="${c2}" stroke-width="1.6"><path d="M1,5 q2,-4 6,-2 M3,9 q4,2 6,-1"/><path d="M12,13 q3,-4 7,-2 M13,17 q4,3 7,-1"/><path d="M15,1 q2,-1 4,1"/><path d="M1,16 q3,-3 6,0"/></g></pattern>`, replaceFill: `url(#${pid})` };
    case 'zebra':
      return { defs: `<pattern id="${pid}" width="20" height="26" patternUnits="userSpaceOnUse"><rect width="20" height="26" fill="${base}"/><path d="M-2,4 q10,-6 24,2 M-2,13 q8,8 24,-1 M-2,22 q12,-8 24,2" fill="none" stroke="${c2}" stroke-width="3.2" stroke-linecap="round"/></pattern>`, replaceFill: `url(#${pid})` };
    case 'polka':
      return { defs: `<pattern id="${pid}" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="${base}"/><circle cx="3.5" cy="3.5" r="2.4" fill="${c2}"/><circle cx="10.5" cy="10.5" r="2.4" fill="${c2}"/></pattern>`, replaceFill: `url(#${pid})` };
    case 'floral':
      return { defs: `<pattern id="${pid}" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="${base}"/><g fill="${c2}"><circle cx="6" cy="6" r="2.4"/><circle cx="10" cy="6" r="2.4"/><circle cx="8" cy="3" r="2.4"/><circle cx="8" cy="9" r="2.4"/><circle cx="18" cy="17" r="2.2"/><circle cx="21" cy="19" r="2.2"/><circle cx="18" cy="21" r="2.2"/><circle cx="15" cy="19" r="2.2"/></g><circle cx="8" cy="6" r="1.4" fill="${opts.c3 || '#F4E27A'}"/><circle cx="18" cy="19" r="1.2" fill="${opts.c3 || '#F4E27A'}"/><path d="M2,20 q4,-6 8,-2" stroke="${shade(c2, -0.3)}" stroke-opacity=".6" fill="none"/></pattern>`, replaceFill: `url(#${pid})` };
    case 'camo':
      return { defs: `<pattern id="${pid}" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="${base}"/><path d="M2,4 q8,-6 14,2 q4,6 -4,8 q-10,2 -10,-10z" fill="${c2}"/><path d="M16,18 q10,-6 12,4 q0,8 -10,6 q-8,-2 -2,-10z" fill="${opts.c3 || shade(base, -0.3)}"/><path d="M4,22 q4,-4 8,0 q2,6 -4,6 q-6,0 -4,-6z" fill="${shade(c2, -0.2)}"/></pattern>`, replaceFill: `url(#${pid})` };
    case 'argyle':
      return { defs: `<pattern id="${pid}" width="22" height="30" patternUnits="userSpaceOnUse"><rect width="22" height="30" fill="${base}"/><path d="M11,0 L22,15 L11,30 L0,15Z" fill="${c2}" fill-opacity=".7"/><path d="M0,0 L22,30 M22,0 L0,30" stroke="${opts.c3 || '#fff'}" stroke-opacity=".5" stroke-width=".8"/></pattern>`, replaceFill: `url(#${pid})` };
    case 'tiedye':
      return { defs: `<radialGradient id="${pid}" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="${c2}"/><stop offset=".35" stop-color="${base}"/><stop offset=".6" stop-color="${c2}"/><stop offset="1" stop-color="${base}"/></radialGradient>`, replaceFill: `url(#${pid})` };
    case 'ombre':
      return { defs: `<linearGradient id="${pid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${base}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`, replaceFill: `url(#${pid})` };
    case 'holo':
      return { defs: `<linearGradient id="${pid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6C9E6"/><stop offset=".25" stop-color="#C9E8F6"/><stop offset=".5" stop-color="#E8F6C9"/><stop offset=".75" stop-color="#D9C9F6"/><stop offset="1" stop-color="#F6E3C9"/></linearGradient>`, replaceFill: `url(#${pid})` };
    case 'logo':
      return { defs: `<pattern id="${pid}" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="${base}"/><text x="2" y="12" font-family="monospace" font-size="9" font-weight="700" fill="${c2}" fill-opacity=".8">S</text></pattern>`, replaceFill: `url(#${pid})` };
    default:
      return { defs: '', overlay: null };
  }
}

export function isLight(hex) {
  const m = hex.replace('#', '');
  const n = parseInt(m.length === 3 ? m.split('').map((x) => x + x).join('') : m, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.6;
}
