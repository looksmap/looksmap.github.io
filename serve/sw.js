// App shell cache. Old caches are dropped on activate. dev/build.mjs writes the part of VERSION after the last dash
// (a hash of the script and stylesheet), so every release gets a new cache; bump the number for a named release.
const VERSION = 'serve-v0.10.0-1e7ef453';
// The game's modules are loaded as one built file (js/serve.bundle.js, made by dev/build.mjs).
const SHELL = ['./', './index.html', './css/app.css', './manifest.webmanifest', './js/analytics.js', './js/serve.bundle.js'];
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
