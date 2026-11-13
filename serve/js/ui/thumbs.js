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
// Drawn thumbnails, newest last. Each is about 11 KB of SVG, so only the most recent ones are kept.
const cache = new Map();
const CACHE_MAX = 600;
const keyOf = (item, avatar) => item.id + '|' + (item.color || '') + '|' + (item.slot === 'hair' ? avatar?.hairColor : '');
export function thumb(item, avatar) {
  const key = keyOf(item, avatar);
  const hit = cache.get(key);
  if (hit) { cache.delete(key); cache.set(key, hit); return hit; }
  const look = { [item.slot]: item };
  const svg = item.pim
    ? renderPim(look, { ghost: true, viewBox: PIM_CROP[item.slot] || PIM_VIEWBOX, label: item.name })
    : renderLook(look, { ...(avatar || {}), hairStyle: item.slot === 'hair' ? item.render.style : undefined }, { ghost: item.slot !== 'hair', viewBox: crop(item.slot), label: item.name, shadow: false });
  cache.set(key, svg);
  if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
  return svg;
}
export function clearThumbs() { cache.clear(); }

/* ---------- thumbnails that are drawn only while they are on or near the screen ---------- */
// A long list (the wardrobe, the shop, the sets, the studio rail) would otherwise put hundreds of full figure
// drawings into the page at once. lazyThumb() returns a small placeholder instead. Placeholders on screen are
// drawn before the next frame; the rest are drawn as they scroll near, and removed again once they are far away.
const canLazy = typeof document !== 'undefined' && !!document.body && typeof MutationObserver !== 'undefined' && typeof IntersectionObserver !== 'undefined';
const NEAR = 400;   // draw a thumbnail when it is within this many pixels of the visible part of its scroller
const FAR = 2000;   // take it out again when it is further away than this
const waiting = new Map();   // key -> [item, avatar] for placeholders
const mine = new WeakSet();  // placeholders put back by this file, which must not be drawn again at once
const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
export function lazyThumb(item, avatar) {
  if (!canLazy) return thumb(item, avatar);
  const key = keyOf(item, avatar);
  waiting.set(key, [item, avatar]);
  return `<i class="thumb-wait" data-thumb="${attr(key)}"></i>`;
}

const observers = new WeakMap();  // scroller element -> { near, far }
let pageObservers = null;         // the same for thumbnails that are not inside a scroller
function draw(el) {
  const key = el.getAttribute('data-thumb');
  const w = waiting.get(key);
  if (!w || !el.isConnected) return null;
  const t = document.createElement('template');
  t.innerHTML = thumb(w[0], w[1]);
  const svg = t.content.firstElementChild;
  if (!svg) return null;
  svg.setAttribute('data-thumb', key);
  el.replaceWith(svg);
  return svg;
}
function undraw(svg) {
  const el = document.createElement('i');
  el.className = 'thumb-wait';
  el.setAttribute('data-thumb', svg.getAttribute('data-thumb'));
  mine.add(el);
  svg.replaceWith(el);
  return el;
}
function observersFor(root) {
  const have = root ? observers.get(root) : pageObservers;
  if (have) return have;
  const made = {
    near: new IntersectionObserver((entries) => { for (const e of entries) if (e.isIntersecting && e.target.isConnected) { made.near.unobserve(e.target); const svg = draw(e.target); if (svg) made.far.observe(svg); } }, { root, rootMargin: `${NEAR}px` }),
    far: new IntersectionObserver((entries) => { for (const e of entries) if (!e.isIntersecting && e.target.isConnected) { made.far.unobserve(e.target); made.near.observe(undraw(e.target)); } }, { root, rootMargin: `${FAR}px` }),
  };
  if (root) observers.set(root, made); else pageObservers = made;
  return made;
}
// The nearest ancestor that scrolls, or null for the page. `seen` remembers answers within one batch.
function scrollerOf(el, seen) {
  const p = el.parentElement;
  if (!p || p === document.body || p === document.documentElement) return null;
  if (seen.has(p)) return seen.get(p);
  const cs = getComputedStyle(p);
  const r = /auto|scroll/.test(cs.overflowX + cs.overflowY) ? p : scrollerOf(p, seen);
  seen.set(p, r);
  return r;
}
function adopt(list) {
  const vw = window.innerWidth, vh = window.innerHeight;
  const seen = new Map();
  // read every position first, then draw, so the page is laid out once
  const marks = list.map((el) => { const r = el.getBoundingClientRect(); return r.bottom >= -NEAR && r.top <= vh + NEAR && r.right >= -NEAR && r.left <= vw + NEAR && (r.width > 0 || r.height > 0); });
  const roots = list.map((el) => scrollerOf(el, seen));
  list.forEach((el, i) => {
    const o = observersFor(roots[i]);
    const svg = marks[i] ? draw(el) : null;
    if (svg) o.far.observe(svg); else if (el.isConnected) o.near.observe(el);
  });
}
if (canLazy) {
  new MutationObserver((records) => {
    const found = [];
    for (const m of records) for (const n of m.addedNodes) {
      if (n.nodeType !== 1 || !n.isConnected) continue;
      if (n.hasAttribute('data-thumb')) { if (n.localName === 'i' && !mine.has(n)) found.push(n); } else if (n.firstElementChild) for (const el of n.querySelectorAll('i[data-thumb]')) found.push(el);
    }
    if (found.length) adopt(found);
  }).observe(document.body, { childList: true, subtree: true });
}
