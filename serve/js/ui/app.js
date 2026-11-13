// Tiny router, shell updates, shared helpers.
import { tierOf, dimTier } from '../engine/score.js';
import { track, captureSource, standalone, isIOS } from '../engine/track.js';
import { handleReturn } from '../engine/payments.js';
import { USD, state, subscribe, nextOpenLevel, DROPS, energy, ENERGY, energyEtaMin, CHAPTERS, chapterCleared, storageOK } from '../engine/state.js';
import { HOUSES } from '../data/catalog.js';
import { injectSprite, icon } from './icons.js';
import { OBJ } from './objects.js';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const fmt = (n) => Number(n).toLocaleString('en-US');
export const houseName = (k) => HOUSES[k]?.name || k;
export const RARITY = { core: 'Core', edit: 'Edit', archive: 'Archive', icon: 'Icon' };
export const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const routes = {};
const fixedRoutes = new Set();
export function route(name, render, opts = {}) { routes[name] = render; if (opts.fixed) fixedRoutes.add(name); }
let current = null;
export const navigate = (hash) => { location.hash = hash; };

export function currentRoute() {
  const h = (location.hash || '#map').slice(1).split('/')[0];
  return Object.hasOwn(routes, h) ? h : 'map';
}
// #play/<levelId>[/<mode>] opens a brief directly (shared links, creator challenges, the brief pages)
let deferredInstall = null;
export const installState = () => ({ canPrompt: !!deferredInstall, standalone: standalone(), ios: isIOS() });
export async function promptInstall() { if (!deferredInstall) return 'none'; deferredInstall.prompt(); const r = await deferredInstall.userChoice; track('install_prompt', { outcome: r.outcome }); deferredInstall = null; return r.outcome; }
function handleDeepLink() {
  const h = (location.hash || '').slice(1);
  if (!h.startsWith('play/')) return false;
  const [, id, mode] = h.split('/');
  document.dispatchEvent(new CustomEvent('deeplink', { detail: { id, mode: mode || 'normal' } }));
  return true;
}
export function render() {
  if (handleDeepLink()) return;
  const name = currentRoute();
  current = name;
  const main = $('#main');
  $('#overlay').innerHTML = '';
  main.classList.toggle('fixed', fixedRoutes.has(name));
  // a screen that fails to draw must not take the whole game down with it
  try { $('#view').innerHTML = routes[name](); } catch (err) { console.error(err); $('#view').innerHTML = '<div class="banner-warn">This screen could not be shown. <a href="#map" style="text-decoration:underline">Go back to Chapters</a>.</div>'; }
  for (const a of $$('#nav a')) { if (a.dataset.route === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }
  main.scrollTo({ top: 0 });
  document.dispatchEvent(new CustomEvent('view:rendered', { detail: { name } }));
}
export function rerender() { if (current) { const main = $('#main'); const y = main.scrollTop; $('#view').innerHTML = routes[current](); main.scrollTo({ top: y }); document.dispatchEvent(new CustomEvent('view:rendered', { detail: { name: current } })); } }

export function renderWallet() {
  const s = state();
  const e = energy();
  $('#wallet').innerHTML = `<a class="mono num" href="#atelier" aria-label="Energy ${e} of ${ENERGY.max}" title="Energy: ${e}/${ENERGY.max}${e < ENERGY.max ? `, next in ${energyEtaMin()} min` : ''}">${OBJ.bolt(20)}<b>${e}</b></a><a class="mono num" href="#atelier" aria-label="${fmt(s.credits)} credits" title="Credits: earned by styling">${OBJ.coin(20)}<b>${fmt(s.credits)}</b></a><a class="mono num" href="#atelier" aria-label="${fmt(s.thread)} Thread" title="Thread: the paid currency">${OBJ.spool(20)}<b>${fmt(s.thread)}</b></a>`;
}
export function renderTicker() {
  const s = state();
  const next = nextOpenLevel();
  const ch = next ? CHAPTERS.find((c) => c.id === next.chapter) : null;
  const items = [
    next ? `<b>Next</b> ${esc(ch.title)} ${next.index}: ${esc(next.title)}` : '<b>All chapters cleared</b> · Princess runs open',
    ...DROPS.slice(0, 2).map((dr) => `<b>${esc(dr.title)}</b> by ${esc(houseName(dr.house))} · ends ${timeLeft(dr.endsIn)} · returns ${esc(dr.returns)}`),
    `<b>Form</b> ${tierOf(s.skill, 68)} · <b>streak</b> ${s.streak}`,
    '<b>House rule</b> make it make sense',
  ];
  const gated = !next && CHAPTERS.find((c) => !chapterCleared(c));
  const el = $('#barmid'); if (el) el.innerHTML = next ? `<span class="mono muted">${esc(ch.title)} · ${next.index}/${ch.levels.length}</span>` : gated ? `<span class="mono muted">Lv ${gated.minLevel} opens ${esc(gated.title)}</span>` : '<span class="mono muted">Every chapter cleared</span>';
}
export function timeLeft(ms) {
  const base = Number(state().createdAt) || Date.now();
  let left = Math.max(0, base + ms - Date.now());
  const d = Math.floor(left / 86400000); left -= d * 86400000;
  const h = Math.floor(left / 3600000);
  return `${d}d ${String(h).padStart(2, '0')}h`;
}

let toastTimer;
export function toast(msg, ms = 2400) {
  $$('.toast').forEach((t) => t.remove());
  const el = document.createElement('div');
  el.className = 'toast'; el.textContent = msg;
  $('#device').appendChild(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), ms);
}

export function overlay(html) { $('#overlay').innerHTML = html; }
export function closeOverlay() { $('#overlay').innerHTML = ''; }

export function bars(dims) {
  return `<div class="dims">${dims.map((d) => `<div class="dim ${d.score / d.max < 0.5 ? 'low' : ''}"><span>${esc(d.label)}</span><span class="track"><i style="width:${(100 * d.score) / d.max}%"></i></span><span class="s tier t-${dimTier(d.score, d.max)}">${dimTier(d.score, d.max)}</span></div>`).join('')}</div>`;
}
export function ladder(n, max = 6) { return `<span class="ladder" title="${n} of ${max}">${Array.from({ length: max + 1 }, (_, i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`; }

// Count a number up in place (the verdict reveal).
export function countUp(el, to, ms = 800) {
  if (!el) return;
  if (reduced()) { el.textContent = to; return; }
  const start = performance.now();
  const tick = (t) => { const p = Math.min(1, (t - start) / ms); const e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e); if (p < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}

export function init() {
  injectSprite($('#device'));
  for (const a of $$('#nav a')) { const k = a.dataset.route; const names = { map: 'map', studio: 'studio', wardrobe: 'wardrobe', atelier: 'atelier', you: 'you' }; a.innerHTML = `${icon(names[k] || 'map')}<span>${a.textContent.trim()}</span>`; }
  window.addEventListener('hashchange', render);
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; });
  window.addEventListener('appinstalled', () => track('installed'));
  captureSource();
  track('open', { standalone: standalone(), route: currentRoute() });
  subscribe(() => { renderWallet(); });
  renderWallet(); renderTicker(); render();
  if (!storageOK) { const b = document.createElement('div'); b.className = 'banner-warn'; b.textContent = 'This browser is blocking storage (private mode?), so your progress will not be saved. Purchases are turned off.'; $('#device').insertBefore(b, $('#main')); }
  handleReturn().then((r) => {
    if (!r) return;
    renderWallet(); renderTicker(); rerender();
    if (r.cancelled) { toast('Checkout cancelled. Nothing was charged.'); return; }
    overlay(`<div class="sheet-wrap" role="dialog" aria-label="Purchase"><div class="scrim" data-close-sheet></div><aside class="sheet confirm"><button class="close" data-close-sheet>Close ×</button><div class="eyebrow">${r.ok ? 'Thank you' : 'Purchase'}</div><h2 class="display display-m">${r.ok ? (r.repeat ? 'Already added' : 'Added to your wallet') : r.pending ? 'Not confirmed yet' : 'Not added'}</h2><p>${esc(r.text || '')}</p>${r.ok && !r.repeat && r.usd ? `<p class="muted small">${USD(r.usd)}${r.verified ? ' · confirmed by Stripe' : ''}. Your receipt is in your email.</p>` : ''}<div class="sheet-actions"><button class="btn primary block" data-close-sheet>Done</button></div></aside></div>`);
  }).catch(() => {});
  setInterval(() => { renderTicker(); renderWallet(); }, 60000);
}
