// App shell cache. Bump VERSION on every release; old caches are dropped on activate.
const VERSION = 'serve-v0.10.0';
const SHELL = ['./', './index.html', './css/app.css', './manifest.webmanifest', './js/main.js', './js/analytics.js',
  './js/data/palette.js', './js/data/payments.js', './js/data/briefs.js', './js/data/story.js', './js/data/chapters.js', './js/data/catalog.js', './js/data/themes.js', './js/data/generator.js',
  './js/engine/track.js', './js/engine/moods.js', './js/engine/payments.js', './js/engine/bots.js', './js/engine/color.js', './js/engine/score.js', './js/engine/state.js',
  './js/render/rig.js', './js/render/materials.js', './js/render/body.js', './js/render/hair.js', './js/render/figure.js', './js/render/pim.js', './js/render/garments.js',
  './js/ui/objects.js', './js/ui/thumbs.js', './js/ui/share.js', './js/ui/icons.js', './js/ui/coach.js', './js/ui/you.js', './js/ui/story.js', './js/ui/app.js', './js/ui/wardrobe.js', './js/ui/studio.js', './js/ui/mapart.js', './js/ui/map.js', './js/ui/atelier.js'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const page = e.request.mode === 'navigate';
  // The cache key drops the query string, so ?utm_source=... and a checkout return never pile up as separate entries.
  const key = url.origin + url.pathname;
  // Network first so a release lands at once; the cache is the fallback when offline. Only good responses are stored,
  // and only a page navigation falls back to index.html (a missing script must fail as a script, not as HTML).
  e.respondWith(fetch(e.request).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(key, copy)); } return r; })
    .catch(() => caches.match(key).then((m) => m || (page ? caches.match('./index.html') : Response.error()))));
});
