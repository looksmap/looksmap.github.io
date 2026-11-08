// Item thumbnails: the garment rendered as a technical flat on a ghost figure, cropped to its region.
import { renderLook, cropBox, FULL_VIEWBOX } from '../render/figure.js';
import { renderPim, PIM_CROP, PIM_VIEWBOX } from '../render/pim.js';

// Crops in rig coordinates [x, y, w, h, headGroup]; mapped through the head/body scale in figure.js.
const CROP = {
  top: [70, 120, 220, 360], bottom: [60, 260, 240, 640], dress: [60, 120, 240, 780], outer: [40, 120, 280, 700],
  shoes: [90, 700, 180, 180], hosiery: [90, 380, 180, 500], bag: [200, 140, 120, 360], head: [110, 0, 140, 150, true],
  eyes: [120, 40, 120, 80, true], ears: [120, 60, 120, 110, true], neck: [120, 110, 120, 110], belt: [100, 240, 160, 110],
  gloves: [40, 270, 280, 230], scarf: [100, 120, 160, 240], hair: [80, 0, 200, 340, true],
  hairAcc: [90, 0, 180, 180, true], bracelet: [40, 300, 280, 220], handheld: [170, 300, 170, 330], makeup: [115, 40, 130, 120, true],
};
const crop = (slot) => { const c = CROP[slot]; return c ? cropBox(c[0], c[1], c[2], c[3], !!c[4]) : FULL_VIEWBOX; };
const cache = new Map();
export function thumb(item, avatar) {
  const key = item.id + '|' + (item.color || '') + '|' + (item.slot === 'hair' ? avatar?.hairColor : '');
  if (cache.has(key)) return cache.get(key);
  const look = { [item.slot]: item };
  if (item.pim) { const p = renderPim(look, { ghost: true, viewBox: PIM_CROP[item.slot] || PIM_VIEWBOX, label: item.name }); cache.set(key, p); return p; }
  const svg = renderLook(look, { ...(avatar || {}), hairStyle: item.slot === 'hair' ? item.render.style : undefined }, { ghost: item.slot !== 'hair', viewBox: crop(item.slot), label: item.name, shadow: false });
  cache.set(key, svg);
  return svg;
}
export function clearThumbs() { cache.clear(); }
