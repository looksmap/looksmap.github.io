// Small 3D objects for the chrome: currencies, fabric, gifts, the monthly card, the level star, and Pim.
// Built from the same materials as the chapter art so the whole game shares one light.
import { sphere, cyl, torus, box, cone, begin, flush, prim } from './mapart.js';
import { pimBust } from '../render/pim.js';

let n = 0;
const P = { ink: '#2A2230' };
function wrap(size, body, vb = 48) {
  return `<svg class="obj" viewBox="0 0 ${vb} ${vb}" width="${size}" height="${size}" aria-hidden="true">${flush()}${body}</svg>`;
}
const start = () => begin(`ob${(n = (n + 1) % 100000)}`, P);

export const OBJ = {
  coin(size = 20) { start(); const body = `${cyl(24, 18, 17, 7, 9, '#E7B94A', { top: '#F7DC7E' })}<ellipse cx="24" cy="18" rx="11" ry="4.6" fill="none" stroke="#C9952A" stroke-width="1.2" opacity=".7"/><text x="24" y="21" text-anchor="middle" font-family="ui-serif, Georgia, serif" font-size="9" font-weight="700" fill="#A8761A">C</text>`; return wrap(size, body); },
  bolt(size = 20) { start(); const d = 'M27 4 12 27h10l-3 17 14-24h-10z'; const body = `${prim.shadow(24, 44, 11, 3, 0.25)}<path d="${d}" fill="${prim.vert('#FFF3B0', '#F2B21E', 'bolt')}" stroke="#FFF8DC" stroke-width="1" stroke-linejoin="round"/><path d="M26 7 15 25h7" fill="none" stroke="#fff" stroke-width="2" opacity=".7" stroke-linecap="round"/><path d="${d}" fill="${prim.gloss()}" opacity=".35"/>`; return wrap(size, body); },
  spool(size = 20) { start(); const body = `${cyl(24, 36, 13, 4, 4, '#F3E7DC')}${cyl(24, 12, 9, 3, 24, '#E85C8F', { shadow: false })}${Array.from({ length: 6 }, (_, i) => `<path d="M15 ${15 + i * 3.6} q9 1.2 18 0" fill="none" stroke="#FFD2E2" stroke-width=".9" opacity=".8"/>`).join('')}${cyl(24, 9, 13, 4, 4, '#F3E7DC', { shadow: false })}<path d="M33 30 q8 2 12 -4" fill="none" stroke="#E85C8F" stroke-width="1.6"/>`; return wrap(size, body); },
  fabric(size = 20, c = '#9DB4CF') { start(); const body = `${prim.shadow(24, 40, 16, 4, 0.25)}${box(8, 20, 24, 16, 8, c, { rx: 2 })}<path d="M10 22 h20 M10 26 h20 M10 30 h20" stroke="#fff" stroke-width=".8" opacity=".35"/>${cyl(36, 14, 4, 2, 22, prim.light(c, 0.1), { shadow: false })}`; return wrap(size, body); },
  gift(size = 20, c = '#F08AAE') { start(); const body = `${box(10, 20, 24, 18, 8, c, { rx: 2 })}<rect x="20" y="20" width="5" height="18" fill="#FFF6F9" opacity=".9"/><path d="M10 29 h24" stroke="#FFF6F9" stroke-width="4" opacity=".9"/>${torus(19, 16, 4, 3, prim.light(c, 0.1), { shadow: false })}${torus(29, 16, 4, 3, prim.light(c, 0.1), { shadow: false })}`; return wrap(size, body); },
  card(size = 20) { start(); const body = `${prim.shadow(24, 40, 16, 4, 0.25)}<rect x="6" y="12" width="36" height="24" rx="4" fill="${prim.vert('#3A3448', '#1C1824', 'card')}"/><rect x="6" y="12" width="36" height="24" rx="4" fill="${prim.gloss()}" opacity=".18"/><rect x="10" y="18" width="10" height="7" rx="1.5" fill="#E7B94A"/><path d="M10 30 h18" stroke="#fff" stroke-width="1.6" opacity=".6" stroke-linecap="round"/><circle cx="36" cy="30" r="3" fill="#F08AAE"/>`; return wrap(size, body); },
  star(size = 20, c = '#F6C453') { start(); const d = 'M24 5l5.6 11.6 12.8 1.8-9.3 9 2.2 12.7L24 34l-11.3 6.1 2.2-12.7-9.3-9 12.8-1.8z'; const body = `${prim.shadow(24, 44, 12, 3, 0.25)}<path d="${d}" fill="${prim.vert(prim.light(c, 0.35), prim.dark(c, 0.2), 'star')}" stroke="${prim.light(c, 0.6)}" stroke-width="1" stroke-linejoin="round"/><path d="${d}" fill="${prim.gloss()}" opacity=".3"/>`; return wrap(size, body); },
  energyJar(size = 20) { start(); const body = `${prim.shadow(24, 44, 12, 3, 0.25)}<rect x="12" y="10" width="24" height="32" rx="8" fill="${prim.glassG()}" stroke="#fff" stroke-width="1"/><rect x="14" y="22" width="20" height="18" rx="6" fill="${prim.vert('#FFE58A', '#F2B21E', 'jar')}"/><rect x="16" y="6" width="16" height="6" rx="2" fill="#D9D4C7"/>${prim.spec(18, 18, 2, 7, 0, 0.7)}`; return wrap(size, body); },
  drop(size = 20, c = '#C9B8F0') { start(); const d = 'M24 6s12 14 12 23a12 12 0 0 1-24 0C12 20 24 6 24 6z'; const body = `${prim.shadow(24, 44, 10, 3, 0.25)}<path d="${d}" fill="${prim.matte(c)}"/>${prim.spec(19, 26, 3, 6, -10, 0.8)}`; return wrap(size, body); },
  pim(size = 52) { return pimBust(size); },
};
