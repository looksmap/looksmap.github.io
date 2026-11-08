// Inline icon sprite: 24×24 line icons with rounded joins, drawn to feel like a fashion studio, not a dashboard.
const P = (d) => `<path d="${d}"/>`;
const ICONS = {
  bolt: P('M13 2 4 14h7l-1 8 9-12h-7l1-8z'),
  coin: P('M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4v10m-3-7.5c0-1 1.3-1.5 3-1.5s3 .5 3 1.5-1.3 1.5-3 1.5-3 .5-3 1.5 1.3 1.5 3 1.5 3-.5 3-1.5'),
  spool: P('M6 4h12M6 20h12M8 4v16M16 4v16M8 8h8M8 12h8M8 16h8'),
  hanger: P('M12 4a2.5 2.5 0 0 1 1 4.8V11l8 5v2H3v-2l8-5V8.8A2.5 2.5 0 0 1 12 4z'),
  dress: P('M9 3l3 3 3-3 1 5-2 2 4 11H6l4-11-2-2z'),
  shoe: P('M3 16h4l2-4 3 2 3 1 5 1v3H3z'),
  bag: P('M5 9h14l1 11H4zM9 9V7a3 3 0 0 1 6 0v2'),
  gem: P('M7 3h10l4 6-9 12L3 9zM3 9h18M9 3l3 6 3-6M12 9l-3 12M12 9l3 12'),
  lipstick: P('M9 12h6v9H9zM10 12V5l4-2v9'),
  pin: P('M12 21s-6-5.5-6-11a6 6 0 1 1 12 0c0 5.5-6 11-6 11zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'),
  lock: P('M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3'),
  star: P('M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z'),
  crown: P('M3 18h18l-1.5-10-4.5 4-3-6-3 6-4.5-4zM3 18v2h18v-2'),
  chat: P('M4 5h16v11H9l-5 4z'),
  scissors: P('M6 6a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm0 7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM8 9l12-6M8 15l12 6M12 12l-4 2'),
  needle: P('M4 20L18 6m0 0l2-2M18 6l-2 2m-5 9l-5 1 1-5'),
  drop: P('M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z'),
  pattern: P('M4 4h16v16H4zM4 12h16M12 4v16M8 8l8 8M16 8l-8 8'),
  set: P('M4 6h7v7H4zM13 6h7v7h-7zM4 15h7v5H4zM13 15h7v5h-7z'),
  gift: P('M4 10h16v10H4zM12 10v10M4 7h16v3H4zM12 7c-3 0-4-3-3-4s4 1 3 4zm0 0c3 0 4-3 3-4s-4 1-3 4z'),
  heart: P('M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z'),
  search: P('M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15 15l5 5'),
  filter: P('M4 6h16M7 12h10M10 18h4'),
  info: P('M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 5v1m0 3v5'),
  check: P('M5 13l4 4L19 7'),
  back: P('M15 5l-7 7 7 7'),
  play: P('M7 5v14l12-7z'),
  zoom: P('M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 3v6m-3-3h6M15 15l5 5'),
  sparkle: P('M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 15l1 2 2 1-2 1-1 2-1-2-2-1 2-1z'),
  map: P('M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14'),
  studio: P('M12 4a2 2 0 0 1 1 3.7V11l8 5v2H3v-2l8-5V7.7A2 2 0 0 1 12 4z'),
  you: P('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c1.5-4 4.5-6 8-6s6.5 2 8 6'),
  wardrobe: P('M5 3h14v18H5zM12 3v18M9 12v2M15 12v2'),
  atelier: P('M4 10h16l-1 10H5zM8 10V7a4 4 0 0 1 8 0v3M9 14h6'),
  skip: P('M5 5l9 7-9 7zM17 5v14'),
  weather: P('M7 17a4 4 0 0 1 .5-8 5 5 0 0 1 9.5 1.5A3.5 3.5 0 0 1 17 17z'),
  occasion: P('M12 3v2M12 19v2M3 12h2M19 12h2M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z'),
  mood: P('M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8.5 10h.01M15.5 10h.01M8 14c1 1.5 2.5 2 4 2s3-.5 4-2'),
  camera: P('M4 8h4l2-3h4l2 3h4v11H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z'),
  fire: P('M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-9z'),
  trash: P('M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13'),
  undo: P('M8 7H4V3M4 7a9 9 0 1 1 2 10'),
};

let injected = false;
export function injectSprite(root = document.body) {
  if (injected) return;
  injected = true;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  svg.innerHTML = Object.entries(ICONS).map(([k, d]) => `<symbol id="i-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</symbol>`).join('');
  root.prepend(svg);
}
export const icon = (name, cls = '') => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
export const SLOT_ICON = { dress: 'dress', top: 'hanger', bottom: 'hanger', outer: 'hanger', shoes: 'shoe', hosiery: 'shoe', bag: 'bag', head: 'crown', hairAcc: 'sparkle', eyes: 'zoom', ears: 'gem', neck: 'gem', bracelet: 'gem', belt: 'set', gloves: 'hanger', scarf: 'hanger', handheld: 'gift', makeup: 'lipstick', hair: 'you', model: 'you' };
