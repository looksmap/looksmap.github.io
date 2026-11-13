import { CX, Y, spline, mirror, rev, torsoX, legOuter, legInner, armOuter, armInner, range, legOff, legHalf } from './rig.js';
import { shade } from './materials.js';

// Skin tones, chosen to read well on bone and ink backgrounds.
export const SKIN = {
  porcelain: '#F4E2D4', fair: '#EDCFB6', light: '#E0B596', medium: '#CC9570', tan: '#B07856', deep: '#8D5839', rich: '#613C29', ebony: '#42291B',
};
export const EYES = { brown: '#5A341F', hazel: '#8A6430', amber: '#B8742A', green: '#4F7A4E', blue: '#4C78A8', grey: '#6E7B86', violet: '#6B4E9B', black: '#241C19' };

// Anime head: a round skull, soft cheeks and a small pointed chin. Drawn in head-group coordinates (scaled in figure.js).
export function headPath() {
  const left = [[180, 30], [156, 38], [145, 62], [144, 87], [149, 105], [160, 118], [172, 125.5], [180, 127.5]];
  return spline([...left, ...rev(mirror(left)).slice(1, -1)], true, 0.9);
}
export function earPaths() {
  const ear = (s) => spline([[CX + s * 33, 89], [CX + s * 39.5, 92], [CX + s * 38.5, 103], [CX + s * 33, 107]], true, 0.9);
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
const n1 = (v) => Number(v.toFixed(1));

// Anime face. Large eyes with a dark upper lash line that ends in a small wing, an iris that runs from dark at the
// top to light at the bottom with a bright lower rim and two catch-lights, thin brows in the hair colour, a nose that
// is only a hint, and a small mouth with a tinted lower lip. Eye centres and ear positions are fixed so glasses,
// earrings and hats from garments.js still sit correctly.
export function facePaths(ink, lip, eye = EYES.brown, skin = '#E0B596', makeup = {}, brow = null) {
  const id = uid();
  const lash = makeup.liner || shade(ink, -0.45);
  const blush = makeup.blush || 'rgba(244,120,150,.5)';
  const lidTint = makeup.shadow || 'rgba(232,140,170,.34)';
  const browCol = brow || shade(ink, -0.1);
  const eyeDark = shade(eye, -0.62), eyeLight = shade(eye, 0.42);
  const eyeOne = (s) => {
    const cx = CX + s * 19.5;
    const outer = cx + s * 11.2, inner = cx - s * 10.2;
    const top = 79.2, bot = 97.6;
    const P = (dx, y) => `${n1(cx + s * dx)},${n1(y)}`;
    const shape = `M${n1(inner)},90.6 C${P(-8.7, 84)} ${P(-5, top)} ${P(1, top)} C${P(6.5, top)} ${P(10.2, 81.8)} ${n1(outer)},86.4 C${P(10.7, 92.6)} ${P(6, bot)} ${P(0.5, bot)} C${P(-5.5, bot)} ${P(-9.6, 95)} ${n1(inner)},90.6Z`;
    const lashD = `M${P(-10.8, 90.2)} C${P(-9, 83.4)} ${P(-5, top - 0.9)} ${P(1, top - 0.9)} C${P(7, top - 1)} ${P(11.6, 80.6)} ${P(15.8, 81.6)} C${P(13, 83.4)} ${P(11.8, 85)} ${P(11.2, 87.4)} C${P(9.8, 83.8)} ${P(6, top + 2.3)} ${P(1, top + 2.1)} C${P(-4.6, top + 2.1)} ${P(-8.4, 85.6)} ${P(-10.8, 90.2)}Z`;
    const clip = `e${id}${s < 0 ? 'l' : 'r'}`;
    const ix = cx + s * 0.6, iy = 89.3;
    return `
    <clipPath id="${clip}"><path d="${shape}"/></clipPath>
    <path d="M${P(-11, 84)} C${P(-6, top - 7)} ${P(7, top - 7.5)} ${P(13.5, 82)} C${P(8, top - 2)} ${P(-5, top - 1.5)} ${P(-11, 84)}Z" fill="${lidTint}"/>
    <path d="${shape}" fill="#FFFDFB"/>
    <g clip-path="url(#${clip})">
      <rect x="${n1(cx - 13)}" y="${top - 1}" width="26" height="7.5" fill="#6E5A78" opacity=".2"/>
      <ellipse cx="${n1(ix)}" cy="${iy}" rx="8.7" ry="10" fill="url(#ir${id})" stroke="${eyeDark}" stroke-width="1.1"/>
      <ellipse cx="${n1(ix)}" cy="${iy + 0.6}" rx="3.5" ry="4.8" fill="${eyeDark}"/>
      <path d="M${n1(ix - 6.4)},${iy + 3.6} Q${n1(ix)},${iy + 11.4} ${n1(ix + 6.4)},${iy + 3.6} Q${n1(ix)},${iy + 7.4} ${n1(ix - 6.4)},${iy + 3.6}Z" fill="${eyeLight}" opacity=".85"/>
      <rect x="${n1(cx - 13)}" y="${top - 1}" width="26" height="6" fill="#1B1020" opacity=".3"/>
      <ellipse cx="${n1(ix - 3.1)}" cy="${iy - 4.2}" rx="2.7" ry="3.3" fill="#fff"/>
      <circle cx="${n1(ix + 3.6)}" cy="${iy + 4.4}" r="1.35" fill="#fff" opacity=".92"/>
    </g>
    <path d="${lashD}" fill="${lash}"/>
    <path d="M${P(12.4, 84.6)} l${n1(s * 3.4)},-0.6 M${P(11.6, 86.6)} l${n1(s * 2.6)},0.9" stroke="${lash}" stroke-width="1.1" stroke-linecap="round"/>
    ${makeup.wing ? `<path d="M${P(11, 85.4)} Q${P(15.4, 82.4)} ${P(20.4, 78.2)} Q${P(17, 84.4)} ${P(11.4, 87.8)}Z" fill="${lash}"/>` : ''}
    ${makeup.lashes ? `<path d="M${P(6.4, 79.6)} l${n1(s * 2.4)},-4.2 M${P(9.4, 81)} l${n1(s * 3.4)},-3.6 M${P(2.6, 78.6)} l${n1(s * 1.2)},-3.8 M${P(8.6, 96)} l${n1(s * 2)},1.8 M${P(5.4, 97.6)} l${n1(s * 1.2)},2" stroke="${lash}" stroke-width="1.25" stroke-linecap="round"/>` : ''}
    <path d="M${P(10.6, 88.8)} C${P(10, 93.4)} ${P(6, bot + 0.5)} ${P(1.5, bot + 0.6)}" fill="none" stroke="${lash}" stroke-width="1.05" stroke-linecap="round" opacity=".7"/>
    <path d="M${P(-8, 83)} C${P(-4, top - 4.3)} ${P(5, top - 4.7)} ${P(10.6, top - 0.8)}" fill="none" stroke="${ink}" stroke-width=".9" stroke-linecap="round" opacity=".3"/>
    <path d="M${P(-9.5, 70.6)} C${P(-4, 66.8)} ${P(5, 66.1)} ${P(12.2, 69.3)}" fill="none" stroke="${browCol}" stroke-width="1.9" stroke-linecap="round" opacity=".88"/>
    <g class="blink" opacity="0"><path d="${shape}" fill="${skin}" stroke="${skin}" stroke-width="5" stroke-linejoin="round"/><path d="M${P(-10.4, 90.4)} Q${P(0.5, 97.8)} ${P(12.6, 88.2)}" fill="none" stroke="${lash}" stroke-width="2.2" stroke-linecap="round"/></g>`;
  };
  return `<g class="face">
    <defs>
      <linearGradient id="ir${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${eyeDark}"/><stop offset=".48" stop-color="${eye}"/><stop offset="1" stop-color="${shade(eye, 0.22)}"/></linearGradient>
      <radialGradient id="bl${id}"><stop offset="0" stop-color="${blush}"/><stop offset="1" stop-color="${blush}" stop-opacity="0"/></radialGradient>
    </defs>
    <ellipse cx="${CX - 25.5}" cy="103.5" rx="10.5" ry="6" fill="url(#bl${id})"/>
    <ellipse cx="${CX + 25.5}" cy="103.5" rx="10.5" ry="6" fill="url(#bl${id})"/>
    <path d="M${CX - 29},102.4 l-2.2,3.4 M${CX - 25.6},102.4 l-2.2,3.4 M${CX - 22.2},102.4 l-2.2,3.4 M${CX + 24.4},102.4 l-2.2,3.4 M${CX + 27.8},102.4 l-2.2,3.4 M${CX + 31.2},102.4 l-2.2,3.4" stroke="#E4607E" stroke-width=".8" stroke-linecap="round" opacity=".32"/>
    ${eyeOne(-1)}${eyeOne(1)}
    <path d="M${CX + 0.4},100.6 q2.2,2.2 0.2,3.6" fill="none" stroke="${shade(skin, -0.42)}" stroke-width="1.15" stroke-linecap="round" opacity=".6"/>
    <path d="M${CX - 4.3},115 Q${CX},120 ${CX + 4.3},115 Q${CX},116.6 ${CX - 4.3},115Z" fill="${lip}" opacity=".85"/>
    <path d="M${CX - 5.8},112.7 Q${CX - 2.6},114.7 ${CX},114 Q${CX + 2.6},114.7 ${CX + 5.8},112.7" fill="none" stroke="${shade(lip, -0.45)}" stroke-width="1.25" stroke-linecap="round"/>
    <ellipse cx="${CX - 0.8}" cy="116.9" rx="${makeup.gloss ? 2.6 : 1.6}" ry="${makeup.gloss ? 1 : 0.6}" fill="#fff" opacity="${makeup.gloss ? 0.85 : 0.6}"/>
    ${makeup.freckles ? `<path d="${[[-13, 99.4], [-9.6, 101.4], [-16.4, 101.6], [-6.4, 99.2], [13, 99.4], [9.6, 101.4], [16.4, 101.6], [6.4, 99.2], [-2.6, 97.6], [2.6, 97.6]].map(([dx, y]) => `M${CX + dx},${y} h.01`).join(' ')}" stroke="${shade(skin, -0.42)}" stroke-width="1.5" stroke-linecap="round" opacity=".55"/>` : ''}
    ${makeup.sparkle ? [[-27, 98.4, 2.6], [-22.4, 101.6, 1.5], [27, 98.4, 2.6], [22.4, 101.6, 1.5], [-31.4, 93.6, 1.3], [31.4, 93.6, 1.3]].map(([dx, y, r]) => `<path d="M${CX + dx},${n1(y - r)} q${n1(r * 0.24)},${n1(r * 0.76)} ${r},${r} q${n1(-r * 0.76)},${n1(r * 0.24)} ${-r},${r} q${n1(-r * 0.24)},${n1(-r * 0.76)} ${-r},${-r} q${n1(r * 0.76)},${n1(-r * 0.24)} ${r},${-r}Z" fill="${makeup.sparkle}" stroke="#fff" stroke-width=".4"/>`).join('') : ''}
  </g>`;
}

// Cel shading near the head: a hard-edged shadow under the chin.
export function skinShading(skin) {
  const dark = shade(skin, -0.42);
  return `<g class="skinShade">
    <path d="M${CX - 11.4},124.6 Q${CX},130.6 ${CX + 11.4},124.6 L${CX + 11.4},131 Q${CX},141 ${CX - 11.4},131Z" fill="${dark}" opacity=".3"/>
    <path d="M${CX - 37},95 q1.5,4 0.5,8 M${CX + 37},95 q-1.5,4 -0.5,8" fill="none" stroke="${dark}" stroke-width=".9" stroke-linecap="round" opacity=".4"/>
  </g>`;
}
// Lines and highlights on the body. `w` warps a path into the current pose (identity when the figure stands straight).
export function bodyShading(skin, w = (d) => d) {
  const dark = shade(skin, -0.5);
  const line = (d, o, sw = 1.1) => `<path d="${w(d)}" fill="none" stroke="${dark}" stroke-width="${sw}" stroke-linecap="round" opacity="${o}"/>`;
  const glow = (x) => `<path d="${w(`M${x},584 C${x - 3},610 ${x - 3},670 ${x},700 C${x + 3},670 ${x + 3},610 ${x},584Z`)}" fill="#fff" opacity=".16"/>`;
  return `<g class="bodyShade">
    ${line(`M${CX - 26},160 q11,6 22,2`, 0.28)}${line(`M${CX + 4},162 q11,4 22,-2`, 0.28)}
    ${line(`M${CX - 30},578 q5,6 10,1`, 0.22, 1)}${line(`M${CX + 20},578 q5,6 10,1`, 0.22, 1)}
    ${glow(CX - 30)}${glow(CX + 22)}
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
