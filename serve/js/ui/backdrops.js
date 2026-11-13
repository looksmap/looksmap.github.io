// Backdrops the model stands in front of: the home screen, the avatar sheet and the studio stage. They are drawn as
// quiet architecture (a couture salon, a painted garden wall, a courtyard, a runway, a studio sweep) so the clothes stay
// the subject. Each is one SVG in a 360 x 420 frame that is cropped to fit whatever box it is placed in.
export const BACKDROPS = {
  salon: { name: 'Paris Salon' },
  garden: { name: 'Blue Garden' },
  riad: { name: 'Riad Courtyard' },
  runway: { name: 'Runway' },
  studio: { name: 'Studio White' },
};
export const DEFAULT_BACKDROP = 'salon';
const W = 360, H = 420;

const ART = {
  // A couture salon: grey panelled walls, a tall gilt mirror, parquet, morning light.
  salon: (n) => `<defs>
      <linearGradient id="${n}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3F0EB"/><stop offset="1" stop-color="#DDD7CE"/></linearGradient>
      <linearGradient id="${n}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0DFA8"/><stop offset=".5" stop-color="#C9A45A"/><stop offset="1" stop-color="#EBD79A"/></linearGradient>
      <linearGradient id="${n}m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F4F6F6"/><stop offset=".55" stop-color="#D6DCDD"/><stop offset="1" stop-color="#E9ECEC"/></linearGradient>
      <linearGradient id="${n}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C6B190"/><stop offset="1" stop-color="#B49C78"/></linearGradient>
      <pattern id="${n}p" width="28" height="14" patternUnits="userSpaceOnUse"><path d="M0,14 L14,0 L28,14" fill="none" stroke="#9E8660" stroke-width="1" opacity=".5"/><path d="M0,7 L7,0 M21,0 L28,7" fill="none" stroke="#DCCBA8" stroke-width="1" opacity=".5"/></pattern>
      <linearGradient id="${n}l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#${n}w)"/>
    ${[[16, 96], [248, 96]].map(([x, w]) => `<rect x="${x}" y="30" width="${w}" height="262" fill="none" stroke="#fff" stroke-width="2.5"/><rect x="${x + 7}" y="37" width="${w - 14}" height="248" fill="none" stroke="#C9C2B7" stroke-width="1"/>`).join('')}
    <rect x="124" y="30" width="112" height="262" fill="none" stroke="#fff" stroke-width="2.5"/>
    <path d="M142,284 V112 a38,38 0 0 1 76,0 V284Z" fill="url(#${n}m)" stroke="url(#${n}g)" stroke-width="6"/>
    <path d="M152,274 V114 a28,28 0 0 1 20,-27" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/>
    <path d="M180,64 q-9,-9 0,-16 q9,7 0,16 M168,74 q12,-12 24,0" fill="none" stroke="url(#${n}g)" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="0" y="296" width="${W}" height="6" fill="#fff"/><rect x="0" y="302" width="${W}" height="40" fill="#D3CCC1"/><rect x="0" y="338" width="${W}" height="4" fill="#BDB5A8"/>
    <rect x="0" y="342" width="${W}" height="78" fill="url(#${n}f)"/><rect x="0" y="342" width="${W}" height="78" fill="url(#${n}p)"/>
    <path d="M0,0 H190 L60,${H} H0Z" fill="url(#${n}l)"/>`,
  // A painted garden wall: deep cobalt, a horseshoe arch trimmed in yellow, terracotta pots, green tile underfoot.
  garden: (n) => `<defs>
      <linearGradient id="${n}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4658E8"/><stop offset="1" stop-color="#2C39BC"/></linearGradient>
      <linearGradient id="${n}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B2687"/><stop offset="1" stop-color="#27349F"/></linearGradient>
      <pattern id="${n}p" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="#F2E9D5"/><path d="M13,1 L25,13 L13,25 L1,13Z" fill="#1F8A70"/><path d="M13,8 L18,13 L13,18 L8,13Z" fill="#F2E9D5"/></pattern>
      <linearGradient id="${n}l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#${n}w)"/>
    <path d="M124,340 V176 a56,56 0 1 1 112,0 V340Z" fill="url(#${n}a)" stroke="#F6D33C" stroke-width="7" stroke-linejoin="round"/>
    <path d="M138,340 V178 a42,42 0 1 1 84,0 V340" fill="none" stroke="#1A237E" stroke-width="2" opacity=".6"/>
    <path d="M286,0 q-40,40 -52,96 M300,0 q-18,52 -20,110 M318,0 q-2,50 8,104 M340,0 q10,44 20,80" fill="none" stroke="#1E2A99" stroke-width="9" stroke-linecap="round" opacity=".55"/>
    <rect x="0" y="336" width="${W}" height="9" fill="#F6D33C"/>
    <rect x="0" y="345" width="${W}" height="75" fill="url(#${n}p)"/>
    ${[[54, 1], [306, -1]].map(([x, s]) => `<g transform="translate(${x},0) scale(${s},1)"><path d="M-6,300 q-10,-74 2,-126 q8,-14 14,0 q10,56 2,126Z" fill="#1F6B45"/><path d="M4,236 q22,-8 22,-40 q7,-8 10,2 q0,42 -30,54Z" fill="#257A50"/><path d="M0,250 q-24,-6 -26,-34 q-7,-8 -10,2 q2,38 34,48Z" fill="#257A50"/><path d="M-26,300 h54 l-7,44 h-40Z" fill="#C9683C"/><rect x="-30" y="294" width="62" height="10" rx="3" fill="#DB7C4C"/></g>`).join('')}
    <path d="M0,0 H200 L70,${H} H0Z" fill="url(#${n}l)"/>`,
  // A riad courtyard: sand-coloured plaster, three keyhole arches in shade, star tiles, a brass lantern.
  riad: (n) => `<defs>
      <linearGradient id="${n}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0D9BC"/><stop offset="1" stop-color="#DBA882"/></linearGradient>
      <linearGradient id="${n}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#163B36"/><stop offset="1" stop-color="#2C6259"/></linearGradient>
      <pattern id="${n}p" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="#F6EEDC"/><path d="M15,2 l3.600,8.400 l8.400,-3.600 l-3.600,8.400 l8.400,3.600 l-8.400,3.600 l3.600,8.400 l-8.400,-3.600 l-3.600,8.400 l-3.600,-8.400 l-8.400,3.600 l3.600,-8.400 l-8.400,-3.600 l8.400,-3.600 l-3.600,-8.400 l8.400,3.600Z" fill="#1E7A63" transform="scale(.78) translate(4.200,2.600)"/></pattern>
      <pattern id="${n}b" width="18" height="16" patternUnits="userSpaceOnUse"><path d="M9,2 L16,8 L9,14 L2,8Z" fill="none" stroke="#FFF6E6" stroke-width="1.6"/></pattern>
      <linearGradient id="${n}l" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#${n}w)"/>
    <rect x="0" y="92" width="${W}" height="18" fill="url(#${n}b)" opacity=".85"/>
    ${[66, 180, 294].map((x) => `<path d="M${x - 38},340 V200 a38,38 0 1 1 76,0 V340Z" fill="url(#${n}a)" stroke="#FFF6E6" stroke-width="4.500" stroke-linejoin="round"/>`).join('')}
    <path d="M180,0 V44 M172,44 h16 l6,10 v26 l-14,12 l-14,-12 v-26Z" fill="#C99A3C" stroke="#8F6A1E" stroke-width="2" stroke-linejoin="round"/><path d="M174,58 h12 v20 l-6,5 l-6,-5Z" fill="#FFE9A8"/>
    <rect x="0" y="338" width="${W}" height="6" fill="#B98058"/>
    <rect x="0" y="344" width="${W}" height="76" fill="url(#${n}p)"/>
    <path d="M${W},0 H150 L300,${H} H${W}Z" fill="url(#${n}l)"/>`,
  // A show: a white runway running out of the dark, two spotlights, the front rows in shadow.
  runway: (n) => `<defs>
      <radialGradient id="${n}w" cx=".5" cy=".12" r="1"><stop offset="0" stop-color="#4A3A68"/><stop offset=".6" stop-color="#1D1629"/><stop offset="1" stop-color="#0E0A14"/></radialGradient>
      <linearGradient id="${n}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFC6E0"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient>
      <linearGradient id="${n}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#${n}w)"/>
    ${[40, 84, 128, 232, 276, 320].map((x) => `<rect x="${x - 1.500}" y="20" width="3" height="212" fill="#fff" opacity=".1"/>`).join('')}
    <path d="M100,0 L20,330 L150,330Z M260,0 L210,330 L340,330Z" fill="url(#${n}s)"/>
    <path d="M150,236 H210 L332,${H} H28Z" fill="url(#${n}r)"/>
    <path d="M150,236 L28,${H} M210,236 L332,${H}" stroke="#fff" stroke-width="2" opacity=".9"/>
    ${[0, 1, 2, 3, 4].map((i) => { const t = (i + 0.5) / 5, y = 248 + t * 160, dx = 34 + t * 118; return `<circle cx="${(180 - dx).toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.6 + t * 2.4).toFixed(1)}" fill="#FFE7A6"/><circle cx="${(180 + dx).toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.6 + t * 2.4).toFixed(1)}" fill="#FFE7A6"/>`; }).join('')}
    ${[0, 1, 2, 3, 4, 5].map((i) => `<ellipse cx="${22 + i * 22 - i * i * 1.2}" cy="${404 - i * 22}" rx="${17 - i * 1.6}" ry="${20 - i * 2}" fill="#0B0811"/><ellipse cx="${338 - i * 22 + i * i * 1.2}" cy="${404 - i * 22}" rx="${17 - i * 1.6}" ry="${20 - i * 2}" fill="#0B0811"/>`).join('')}`,
  // A photographer's sweep: white running into pearl, nothing else.
  studio: (n) => `<defs>
      <linearGradient id="${n}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".72" stop-color="#F4F1F4"/><stop offset="1" stop-color="#E6E1E8"/></linearGradient>
      <radialGradient id="${n}v" cx=".5" cy=".42" r=".8"><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#B8AFC0" stop-opacity=".35"/></radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#${n}w)"/>
    <path d="M0,330 Q180,352 ${W},330 V${H} H0Z" fill="#fff" opacity=".7"/>
    <rect width="${W}" height="${H}" fill="url(#${n}v)"/>`,
};

let seq = 0;
/** backdropSVG(id) → an SVG that fills its box (cropped, never stretched). Unknown ids fall back to the default. */
export function backdropSVG(id, cls = '') {
  const key = Object.hasOwn(ART, id) ? id : DEFAULT_BACKDROP;
  const n = `bd${(seq = (seq + 1) % 100000).toString(36)}`;
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" class="cover-art backdrop ${cls}" aria-hidden="true">${ART[key](n)}</svg>`;
}
