// A tiny, vendor-free event hook. Events go to window.serveTrack if a host page defines it, to SERVE_ANALYTICS_ENDPOINT
// by beacon if one is set, and always to a small ring buffer in localStorage so the You tab and tests can read them.
const KEY = 'serve.events';
const MAX = 200;
function read() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
export function track(event, props = {}) {
  const row = { event, t: Date.now(), ...props, source: source() };
  try { const all = read(); all.push(row); localStorage.setItem(KEY, JSON.stringify(all.slice(-MAX))); } catch (e) { /* storage may be blocked */ }
  try { if (typeof window.serveTrack === 'function') window.serveTrack(event, row); } catch (e) { /* host hook errors are not ours */ }
  try { const ep = window.SERVE_ANALYTICS_ENDPOINT; if (ep && navigator.sendBeacon) navigator.sendBeacon(ep, JSON.stringify(row)); } catch (e) { /* ignore */ }
  if (window.SERVE_DEBUG) console.log('[serve]', event, props);
}
export const events = () => read();
// first-touch attribution: utm_source / utm_campaign / ref from the first URL that opened the game, kept forever
export function captureSource() {
  try {
    if (localStorage.getItem('serve.source')) return;
    const q = new URLSearchParams(location.search);
    const src = { utm_source: q.get('utm_source'), utm_medium: q.get('utm_medium'), utm_campaign: q.get('utm_campaign'), ref: q.get('ref') || q.get('r'), referrer: document.referrer.slice(0, 120), at: Date.now() };
    localStorage.setItem('serve.source', JSON.stringify(src));
  } catch (e) { /* ignore */ }
}
export function source() { try { return JSON.parse(localStorage.getItem('serve.source') || 'null'); } catch (e) { return null; } }
export const standalone = () => (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
export const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
