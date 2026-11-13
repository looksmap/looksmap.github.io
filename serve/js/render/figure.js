// Assembles a full look into one SVG string. The head group is scaled up and the body group scaled down
// around the neck base, giving anime proportions (about 6.4 heads tall) without retuning any garment geometry.
// Shading is cel-style: a hard-edged shadow band on the side away from the light, on skin and on every garment.
import { VIEW, CX } from './rig.js';
import { SKIN, EYES, headPath, earPaths, torsoLegsPath, armPath, facePaths, skinShading, bodyShading } from './body.js';
import * as G from './garments.js';
import { hair, HAIR_COLORS } from './hair.js';
import { material, shade, isLight } from './materials.js';

export const HS = 1.22;   // head scale
export const BS = 0.87;   // body scale
export const NB = 150;    // pivot: neck base
export const OY = 24;     // the whole figure sits this far down, so buns and hats clear the top edge
export const FULL_VIEWBOX = '0 0 360 800';
export const mapX = (x, head = false) => CX + (x - CX) * (head ? HS : BS);
export const mapY = (y, head = false) => OY + NB + (y - NB) * (head ? HS : BS);
export const cropBox = (x, y, w, h, head = false) => `${mapX(x, head).toFixed(1)} ${mapY(y, head).toFixed(1)} ${(w * (head ? HS : BS)).toFixed(1)} ${(h * (head ? HS : BS)).toFixed(1)}`;
const T = (s) => `transform="translate(${CX},${NB + OY}) scale(${s}) translate(${-CX},${-NB})"`;

const GEN = {
  bodice: G.bodice, sleeve: G.sleeve, skirt: G.skirt, pants: G.pants, dress: G.dress, coat: G.coat,
  shoes: G.shoes, hosiery: G.hosiery, bag: G.bag, headwear: G.headwear, eyewear: G.eyewear,
  earrings: G.earrings, necklace: G.necklace, belt: G.belt, scarf: G.scarf, gloves: G.gloves, brooch: G.brooch,
  hairAcc: G.hairAcc, bracelet: G.bracelet, handheld: G.handheld,
};
const FUZZY = new Set(['fur', 'shearling']);
const HEAD_SLOTS = new Set(['head', 'eyes', 'ears', 'hair', 'hairAcc']);

export { SKIN, HAIR_COLORS, EYES };

function itemLayers(item) {
  const specs = Array.isArray(item.render) ? item.render : [item.render];
  const out = [];
  specs.forEach((spec, i) => {
    const gen = GEN[spec.kind];
    if (!gen) return;
    const params = { ...spec, fill: spec.fill || item.color };
    const layers = gen(params);
    const matKind = spec.material ?? item.material;
    const printKind = spec.print ?? item.print;
    const mat = matKind ? material(matKind, params.fill, `${item.id}-${i}-m`, { opacity: spec.opacity ?? item.opacity }) : null;
    const prt = printKind ? material(printKind, params.fill, `${item.id}-${i}-p`, { c2: spec.color2 || item.color2, c3: spec.color3 || item.color3, angle: spec.angle, w: spec.printScale }) : null;
    for (const l of layers) {
      const L = { ...l, item: item.id, slot: item.slot, head: HEAD_SLOTS.has(item.slot) };
      if (!l.isLine && l.fill !== 'none' && l.fill === params.fill && !l.altFill) {
        if (prt?.replaceFill) { L.fill = prt.replaceFill; L.defs = (L.defs || '') + prt.defs; }
        else if (mat?.replaceFill) { L.fill = mat.replaceFill; L.defs = (L.defs || '') + mat.defs; }
        if (mat?.overlay) { L.overlay = mat.overlay; L.defs = (L.defs || '') + mat.defs; }
        if (mat?.opacity != null) L.opacity = mat.opacity;
        L.strokeBase = params.fill;
        if (FUZZY.has(matKind)) L.fuzzy = params.fill;
        if (matKind === 'sheer' || matKind === 'mesh' || matKind === 'lace' || matKind === 'fishnet') L.sheer = true;
      } else if (!l.isLine && l.fill !== 'none' && typeof l.fill === 'string' && l.fill[0] === '#') {
        L.strokeBase = l.fill;
        if (l.material) { const m2 = material(l.material, l.fill, `${item.id}-${i}-${L.z}-x`); if (m2.replaceFill) { L.fill = m2.replaceFill; L.defs = (L.defs || '') + m2.defs; } if (m2.overlay) { L.overlay = m2.overlay; L.defs = (L.defs || '') + m2.defs; } if (FUZZY.has(l.material)) L.fuzzy = l.fill; }
      }
      out.push(L);
    }
  });
  return out;
}

// Brows follow the hair colour, darkened or lightened so they stay visible on any skin.
function browFor(hair, ink) {
  if (!hair || hair[0] !== '#') return shade(ink, -0.1);
  return isLight(hair) ? shade(hair, -0.42) : shade(hair, 0.12);
}
function outlineFor(hex) {
  if (!hex || hex[0] !== '#') return 'rgba(0,0,0,.3)';
  return isLight(hex) ? 'rgba(46,22,40,.5)' : 'rgba(255,255,255,.2)';
}

let maskSeq = 0;
function layerSVG(l, depth) {
  if (l.raw) return l.raw;
  const op = l.opacity != null ? ` opacity="${l.opacity}"` : '';
  const fr = l.evenodd ? ' fill-rule="evenodd"' : '';
  if (l.maskD) {
    const id = `hm${(maskSeq = (maskSeq + 1) % 100000).toString(36)}`;
    const inner = layerSVG({ ...l, maskD: null }, depth);
    return `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="940"><rect x="0" y="0" width="360" height="940" fill="#fff"/><path d="${l.maskD}" fill="#000"/></mask><g mask="url(#${id})">${inner}</g>`;
  }
  if (l.isLine) {
    const dash = l.dash ? ` stroke-dasharray="${l.dash}"` : '';
    return `<path d="${l.d}" fill="none" stroke="${l.stroke}" stroke-width="${l.sw || 1}" stroke-linecap="round" stroke-linejoin="round"${dash}${op}/>`;
  }
  const stroke = l.noStroke || l.hair ? 'none' : l.stroke || outlineFor(l.strokeBase || l.fill);
  const sw = l.sw || 1.3;
  let s = '';
  // small jewellery and glasses get no drop shadow or rim shading: at that size both turn into smudges
  const tiny = (l.z >= G.Z.neck && l.z < G.Z.scarf) || (l.z >= G.Z.earring && l.z < G.Z.headwear) || l.z >= G.Z.eyewear;
  if (depth && !tiny && !l.noShadow && !l.sheer && l.z >= G.Z.shoe && l.fill !== 'none' && !(l.hair && l.z < G.Z.hairFront)) {
    const o = l.hair ? 0.18 : l.z >= G.Z.outer ? 0.22 : 0.15;
    s += `<path d="${l.d}" fill="#000" opacity="${o}" filter="url(#soft)" transform="translate(1.5,4)"${fr}/>`;
  }
  if (l.fuzzy) s += `<path d="${l.d}" fill="none" stroke="${l.fuzzy}" stroke-width="8" stroke-dasharray="1 5" stroke-linecap="round"${fr}${op}/>`;
  const useInset = depth && !tiny && !l.noDepth && !l.sheer && !l.hair && l.fill !== 'none';
  if (useInset) s += `<g filter="url(#inset)">`;
  s += `<path d="${l.d}" fill="${l.fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" paint-order="stroke"${fr}${op}/>`;
  if (l.overlay) s += `<path d="${l.d}" fill="${l.overlay}"${fr}${op}/>`;
  if (l.fill !== 'none' && !l.noShade) s += `<path d="${l.d}" fill="url(#shadeR)"${fr}${l.shadeMore ? ' opacity=".9"' : ''}/>`;
  if (l.shadeMore) s += `<path d="${l.d}" fill="rgba(0,0,0,.08)"${fr}/>`;
  if (useInset) s += `</g>`;
  return s;
}

/**
 * look: { [slot]: item }   avatar: { skin, hairStyle, hairColor, lip, eyes }
 * opts: { ghost, viewBox, width, height, shadow, toile, depth, label }
 */
export function renderLook(look, avatar = {}, opts = {}) {
  const skin = SKIN[avatar.skin] || avatar.skin || SKIN.light;
  const hairColor = HAIR_COLORS[avatar.hairColor] || avatar.hairColor || HAIR_COLORS.jet;
  const mk = look.makeup?.render || {};
  const lip = mk.lip || avatar.lip || '#C4707A';
  const eye = EYES[avatar.eyes] || avatar.eyes || EYES.brown;
  const makeup = { blush: mk.blush, shadow: mk.shadow, liner: mk.liner };
  const ink = shade(skin, -0.66);
  const depth = !!opts.depth && !opts.ghost;
  const ghost = !!opts.ghost;

  let layers = [];
  const items = Object.values(look).filter(Boolean);
  for (const it of items) layers.push(...itemLayers(it));
  if (opts.toile) {
    const toile = '#E9E4D8';
    if (!look.top && !look.dress) layers.push(...G.bodice({ strap: 'tank', hem: 300, ease: 0, fill: toile, noFolds: true }).map((l) => ({ ...l, z: G.Z.top - 0.5, strokeBase: toile })));
    if (!look.bottom && !look.dress) layers.push(...G.pants({ leg: 'skinny', waist: 300, hem: 540, fly: false, fill: toile }).map((l) => ({ ...l, z: G.Z.bottom - 0.5, strokeBase: toile })));
  }
  const hairItem = look.hair;
  if (!ghost || hairItem) layers.push(...hair({ style: hairItem?.render?.style || avatar.hairStyle || 'sleekBun', color: hairItem?.color || hairColor }).map((l) => ({ ...l, head: true })));
  layers.sort((a, b) => a.z - b.z);

  const defs = new Set();
  for (const l of layers) if (l.defs) defs.add(l.defs);
  const hairBack = layers.filter((l) => l.head && l.z < G.Z.body);
  const bodyBelow = layers.filter((l) => !l.head && l.z < G.Z.body);
  const bodyAbove = layers.filter((l) => !l.head && l.z >= G.Z.body);
  const headAbove = layers.filter((l) => l.head && l.z >= G.Z.body);

  const bodyShapes = [torsoLegsPath(), armPath(-1), armPath(1)];
  const skinDark = shade(skin, -0.2);
  const figId = `fg${(maskSeq = (maskSeq + 1) % 100000).toString(36)}`;
  const skinOutline = (shapes) => (ghost ? '' : shapes.map((d) => `<path d="${d}" fill="none" stroke="${ink}" stroke-opacity=".6" stroke-width="2" stroke-linejoin="round"/>`).join(''));
  // cel shading: fill with the shadow tone, then lay the lit tone over it shifted toward the light, so a hard-edged band of shadow is left along the far side
  const skinFill = (shapes, key = 'b', dx = 6) => shapes.map((d, i) => (ghost ? `<path d="${d}" fill="rgba(18,18,18,.07)"/>` : `<clipPath id="${figId}${key}${i}"><path d="${d}"/></clipPath><path d="${d}" fill="${skinDark}"/><g clip-path="url(#${figId}${key}${i})"><path d="${d}" fill="${skin}" transform="translate(${-dx},-1)"/></g>`)).join('');
  const skinShade = () => '';
  const headD = headPath();
  const ears = ghost ? '' : `<path d="${earPaths()}" fill="${skin}" stroke="${ink}" stroke-opacity=".45" stroke-width="1.2"/>`;

  const vb = opts.viewBox || FULL_VIEWBOX;
  const sizeAttr = opts.width ? ` width="${opts.width}" height="${opts.height || VIEW.h}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${sizeAttr} class="figure${ghost ? ' ghost' : ''}" role="img" aria-label="${opts.label || 'Styled figure'}" preserveAspectRatio="xMidYMid meet">
  <defs>
    <linearGradient id="shadeR" gradientUnits="userSpaceOnUse" x1="110" y1="0" x2="262" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity=".05"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#200820" stop-opacity=".09"/>
    </linearGradient>
    <radialGradient id="iris" cx=".5" cy=".4" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
    <linearGradient id="eyeSocket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".4" stop-color="#000" stop-opacity="0"/></linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.2"/></filter>
    <filter id="inset" x="-10%" y="-10%" width="120%" height="120%">
      <feComponentTransfer in="SourceAlpha" result="inv"><feFuncA type="table" tableValues="1 0"/></feComponentTransfer>
      <feGaussianBlur in="inv" stdDeviation="1" result="blur"/>
      <feOffset in="blur" dx="-5" dy="-3" result="offd"/>
      <feComposite in="offd" in2="SourceAlpha" operator="in" result="shadowA"/>
      <feFlood flood-color="#2A0A28" flood-opacity=".2" result="dark"/>
      <feComposite in="dark" in2="shadowA" operator="in" result="shadow"/>
      <feOffset in="blur" dx="3" dy="2" result="offl"/>
      <feComposite in="offl" in2="SourceAlpha" operator="in" result="lightA"/>
      <feFlood flood-color="#fff" flood-opacity=".1" result="white"/>
      <feComposite in="white" in2="lightA" operator="in" result="light"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="shadow"/><feMergeNode in="light"/></feMerge>
    </filter>
    ${[...defs].join('\n')}
  </defs>
  <g ${T(HS)}>${hairBack.map((l) => layerSVG(l, depth)).join('')}</g>
  <g ${T(BS)}>
    ${opts.shadow === false || ghost ? '' : `<ellipse cx="${CX}" cy="858" rx="88" ry="8" fill="rgba(60,10,40,.14)" filter="url(#soft)"/>`}
    ${bodyBelow.map((l) => layerSVG(l, depth)).join('')}
    <g class="skin">${skinOutline(bodyShapes)}${skinFill(bodyShapes)}${skinShade(bodyShapes)}${ghost ? '' : bodyShading(skin)}</g>
    ${bodyAbove.map((l) => layerSVG(l, depth)).join('')}
  </g>
  <g ${T(HS)}>
    <g class="skin">${skinOutline([headD])}${ears}${skinFill([headD], 'h', 3.2)}${ghost ? '' : skinShading(skin)}</g>
    ${ghost ? '' : facePaths(ink, lip, eye, skin, makeup, browFor(hairItem?.color || hairColor, ink))}
    ${headAbove.map((l) => layerSVG(l, depth)).join('')}
  </g>
</svg>`;
}
