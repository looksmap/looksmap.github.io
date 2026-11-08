import { CX, Y, spline, mirror, rev, torsoX, legOuter, legInner, armOuter, armInner, range, legOff, legHalf } from './rig.js';
import { shade } from './materials.js';

// Skin tones, chosen to read well on bone and ink backgrounds.
export const SKIN = {
  porcelain: '#F4E2D4', fair: '#EDCFB6', light: '#E0B596', medium: '#CC9570', tan: '#B07856', deep: '#8D5839', rich: '#613C29', ebony: '#42291B',
};
export const EYES = { brown: '#5A341F', hazel: '#8A6430', amber: '#B8742A', green: '#4F7A4E', blue: '#4C78A8', grey: '#6E7B86', violet: '#6B4E9B', black: '#241C19' };

// Anime head: wide at the cheekbone, soft taper to a small chin. Drawn in head-group coordinates (scaled up in figure.js).
export function headPath() {
  const left = [[180, 30], [156, 38], [145, 62], [144, 88], [150, 109], [165, 123], [180, 128]];
  return spline([...left, ...rev(mirror(left)).slice(1, -1)], true, 0.9);
}
export function earPaths() {
  const ear = (s) => spline([[CX + s * 33, 90], [CX + s * 39, 93], [CX + s * 38, 103], [CX + s * 33, 106]], true, 0.9);
  return ear(-1) + ear(1);
}

export function torsoLegsPath() {
  const sideL = [];
  sideL.push([CX - 15, Y.neckBase - 50, 'c']);
  sideL.push([CX - 15, Y.neckBase - 2]);
  sideL.push([CX - 42, 157]);
  sideL.push([torsoX(-1, 168), 170]);
  for (const y of [190, 208, 228, 258, 292, 318, 338, 372, 402]) sideL.push([torsoX(-1, y), y]);
  for (const y of [440, 500, 585, 650, 740, 790]) sideL.push([legOuter(-1, y), y]);
  sideL.push([legOuter(-1, 805) - 1, 812]);
  sideL.push([CX - legOff(805) - 15, 846]);
  sideL.push([CX - legOff(805) - 8, Y.sole, 'c']);
  sideL.push([CX - legOff(805) + 10, Y.sole, 'c']);
  sideL.push([CX - legOff(805) + 13, 836]);
  sideL.push([legInner(-1, 805) + 1, 812]);
  for (const y of [740, 650, 585, 500, 440]) sideL.push([legInner(-1, y), y]);
  sideL.push([CX, Y.crotch + 2, 'c']);
  const right = rev(mirror(sideL)).slice(1); // keep the mirrored neck corner so the neck top closes square
  return spline([...sideL, ...right], true);
}

export function armPath(side) {
  const pts = [];
  pts.push([CX + side * 48, 160]);
  pts.push([armOuter(side, 172) - side * 2, 172]);
  for (const y of [230, 300, 370, 430]) pts.push([armOuter(side, y), y]);
  pts.push([CX + side * 92, 446]);
  pts.push([CX + side * 93, 462]);
  pts.push([CX + side * 86, 478]);
  pts.push([CX + side * 78, 476]);
  pts.push([CX + side * 72, 458]);
  pts.push([armInner(side, 430), 430]);
  for (const y of [370, 300, 230]) pts.push([armInner(side, y), y]);
  pts.push([CX + side * 52, 200]);
  return spline(pts, true);
}

let seq = 0; const uid = () => (seq = (seq + 1) % 100000).toString(36);

// Shoujo face: large eyes set one eye-width apart, tall irises with a gradient and two catch-lights,
// thick tapered upper lashes with a wing, thin brows, a nose that is barely there, a small soft mouth, blush.
export function facePaths(ink, lip, eye = EYES.brown, skin = '#E0B596', makeup = {}) {
  const id = uid();
  const lash = makeup.liner || '#1A1214';
  const blush = makeup.blush || 'rgba(240,110,150,.26)';
  const shadowBand = `<path d="M${CX - 35},83 C${CX - 30},66 ${CX - 10},66 ${CX - 6},83 C${CX - 13},76 ${CX - 27},76 ${CX - 35},83Z M${CX + 35},83 C${CX + 30},66 ${CX + 10},66 ${CX + 6},83 C${CX + 13},76 ${CX + 27},76 ${CX + 35},83Z" fill="${makeup.shadow || 'rgba(236,150,190,.4)'}" opacity=".6"/>`;
  const eyeOne = (s) => {
    const cx = CX + s * 20.5;
    const outer = CX + s * 33, inner = CX + s * 9;
    const top = 77, bottom = 97, mid = 88;
    // almond with a lifted outer corner
    const shape = `M${outer},${mid - 2} C${outer - s * 2},${top + 1} ${cx + s * 3},${top - 2} ${cx - s * 4},${top + 1} C${inner + s * 2},${top + 4} ${inner},${mid - 2} ${inner},${mid + 1} C${inner},${bottom - 3} ${cx - s * 6},${bottom} ${cx + s * 1},${bottom} C${cx + s * 10},${bottom - 1} ${outer - s * 1},${bottom - 6} ${outer},${mid - 2}Z`;
    const clip = `e${id}${s < 0 ? 'l' : 'r'}`;
    const ix = cx + s * 0.5, iy = 88.5;
    return `
    <clipPath id="${clip}"><path d="${shape}"/></clipPath>
    <path d="${shape}" fill="#FFFFFF"/>
    <g clip-path="url(#${clip})">
      <path d="${shape}" fill="url(#eyeSocket)"/>
      <ellipse cx="${ix}" cy="${iy}" rx="8.2" ry="9.8" fill="${eye}"/>
      <ellipse cx="${ix}" cy="${iy}" rx="8.2" ry="9.8" fill="url(#iris)"/>
      <ellipse cx="${ix}" cy="${iy + 1}" rx="3.6" ry="4.8" fill="#15100F"/>
      <ellipse cx="${ix - s * 2.8}" cy="${iy - 4.4}" rx="2.9" ry="3.2" fill="#fff"/>
      <circle cx="${ix + s * 3.4}" cy="${iy + 4.6}" r="1.5" fill="#fff" opacity=".9"/>
      <ellipse cx="${ix}" cy="${iy + 7.2}" rx="5.4" ry="2.4" fill="#fff" opacity=".28"/>
      <path d="M${outer},${top - 5} L${inner - s * 4},${top - 5} L${inner - s * 4},${mid - 1} C${inner},${top + 3} ${cx},${top + 1} ${outer},${mid - 2}Z" fill="rgba(0,0,0,.14)"/>
    </g>
    <path d="M${outer + s * 2},${mid - 2.5} C${outer - s * 2},${top} ${cx + s * 3},${top - 3.5} ${cx - s * 5},${top - 0.5} C${inner + s * 2},${top + 3} ${inner - s * 0.5},${mid - 4} ${inner - s * 0.5},${mid}" fill="none" stroke="${lash}" stroke-width="3.1" stroke-linecap="round"/>
    <path d="M${outer + s * 2},${mid - 2.5} l${s * 7},-5" stroke="${lash}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M${outer - s * 2},${top + 1} l${s * 3},-4.5 M${outer - s * 7},${top - 1} l${s * 2},-4.5 M${outer - s * 12},${top - 2.5} l${s * 1},-4.2 M${outer - s * 17},${top - 2.5} l${s * 0.2},-3.6" stroke="${lash}" stroke-width="1.5" stroke-linecap="round" opacity=".9"/>
    <path d="M${outer - s * 2},${bottom - 4} C${cx + s * 6},${bottom + 1} ${cx - s * 4},${bottom + 0.5} ${inner + s * 1},${mid + 3}" fill="none" stroke="${lash}" stroke-width="1" opacity=".5"/>
    <path d="M${outer - s * 2},${bottom - 2} l${s * 1.6},2.8 M${outer - s * 6.5},${bottom} l${s * 0.9},2.8 M${outer - s * 11},${bottom + 0.5} l${s * 0.3},2.6" stroke="${lash}" stroke-width="1" stroke-linecap="round" opacity=".6"/>
    <path d="M${outer - s * 1},${top - 3} C${cx + s * 2},${top - 7} ${inner + s * 3},${top - 5} ${inner + s * 1},${top - 1}" fill="none" stroke="#fff" stroke-width="1" opacity=".35"/>
    <path d="M${CX + s * 35},${68} C${CX + s * 28},${61.5} ${CX + s * 16},${61.5} ${CX + s * 8},${66.5}" fill="none" stroke="${shade(ink, 0.1)}" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>
    <path d="M${CX + s * 35},${68} C${CX + s * 28},${62.5} ${CX + s * 20},${62} ${CX + s * 12},${65}" fill="none" stroke="${shade(ink, 0.1)}" stroke-width="1" stroke-linecap="round" opacity=".5"/>`;
  };
  return `<g class="face">
    <ellipse cx="${CX - 27}" cy="103" rx="10" ry="5" fill="${blush}"/>
    <ellipse cx="${CX + 27}" cy="103" rx="10" ry="5" fill="${blush}"/>
    <ellipse cx="${CX - 33}" cy="96" rx="4" ry="7" fill="#fff" opacity=".22"/>
    <ellipse cx="${CX + 33}" cy="96" rx="4" ry="7" fill="#fff" opacity=".22"/>
    ${shadowBand}
    ${eyeOne(-1)}${eyeOne(1)}
    <path d="M${CX},96 q1.2,4 -1.2,7" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".45"/>
    <path d="M${CX + 2.5},101.5 q1.5,3.5 -1.5,4.5" fill="none" stroke="${shade(skin, -0.38)}" stroke-width="1.3" stroke-linecap="round" opacity=".6"/>
    <path d="M${CX - 8},112.5 Q${CX - 3},110.5 ${CX},112 Q${CX + 3},110.5 ${CX + 8},112.5 Q${CX + 4},120.5 ${CX},121 Q${CX - 4},120.5 ${CX - 8},112.5Z" fill="${lip}"/>
    <path d="M${CX - 8},112.5 Q${CX},115.5 ${CX + 8},112.5" fill="none" stroke="${shade(lip, -0.4)}" stroke-width=".9" opacity=".7"/>
    <ellipse cx="${CX - 2}" cy="117.5" rx="2.6" ry="1.2" fill="#fff" opacity=".55"/>
    <ellipse cx="${CX + 3}" cy="118" rx="1.2" ry=".7" fill="#fff" opacity=".4"/>
  </g>`;
}

// Soft skin modelling near the head: shadow under the chin, highlight on the cheek.
export function skinShading(skin) {
  const dark = shade(skin, -0.5);
  return `<g class="skinShade">
    <path d="M${CX - 12},127 Q${CX},134 ${CX + 12},127 L${CX + 12},139 Q${CX},146 ${CX - 12},139Z" fill="${dark}" opacity=".12"/>
    <ellipse cx="${CX - 30}" cy="98" rx="5" ry="8" fill="#fff" opacity=".10"/>
  </g>`;
}
export function bodyShading(skin) {
  const dark = shade(skin, -0.5);
  return `<g class="bodyShade">
    <path d="M${CX - 24},160 q10,6 20,2" fill="none" stroke="${dark}" stroke-width="1" opacity=".2"/>
    <path d="M${CX + 4},162 q10,4 20,-2" fill="none" stroke="${dark}" stroke-width="1" opacity=".2"/>
    <ellipse cx="${CX - 44}" cy="188" rx="5" ry="12" fill="#fff" opacity=".14"/>
    <ellipse cx="${CX - 28}" cy="640" rx="4" ry="70" fill="#fff" opacity=".12"/>
    <ellipse cx="${CX + 26}" cy="640" rx="4" ry="70" fill="#fff" opacity=".12"/>
    <ellipse cx="${CX - 60}" cy="330" rx="3" ry="40" fill="#fff" opacity=".12"/>
  </g>`;
}

export function legsClipPath() {
  const pts = [];
  for (const y of range(Y.crotch, Y.ankle, 40)) pts.push([legOuter(-1, y) + 1, y]);
  pts.push([CX - legOff(805) - 10, Y.sole]);
  pts.push([CX - legOff(805) + 12, Y.sole]);
  for (const y of rev(range(Y.crotch + 6, Y.ankle, 40))) pts.push([legInner(-1, y) - 1, y]);
  const r = rev(mirror(pts));
  return spline([...pts, ...r], true, 0.6);
}
export function legHw(y) { return legHalf(y); }
