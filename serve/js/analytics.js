// Sends the game's events (js/engine/track.js) to GoatCounter: no cookies, no personal data, no IP stored.
// Set GOATCOUNTER to your site code (the "serve" in serve.goatcounter.com) to turn it on; empty means nothing is sent.
// Events become paths in the GoatCounter dashboard, e.g. brief/b012/normal/pass or checkout/paid/t2.
(function () {
  var GOATCOUNTER = '';
  if (!GOATCOUNTER) return;
  var queue = [];
  var clean = function (s) { return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9_:-]+/g, '-').slice(0, 40); };
  var pathFor = function (e, p) {
    switch (e) {
      case 'open': return 'open/' + (p.standalone ? 'app' : 'browser');
      case 'verdict': return 'brief/' + clean(p.id) + '/' + clean(p.mode) + '/' + (p.passed ? 'pass' : 'fail');
      case 'purchase_attempt': return 'shop/tap/' + clean(p.kind);
      case 'checkout_start': return 'checkout/start/' + clean(p.sku);
      case 'checkout_cancel': return 'checkout/cancel';
      case 'checkout_unpaid': return 'checkout/unpaid/' + clean(p.sku);
      case 'purchase': return 'checkout/paid/' + clean(p.sku);
      case 'install_prompt': return 'install/' + clean(p.outcome);
      case 'deeplink': return 'deeplink/' + clean(p.id);
      default: return clean(e);
    }
  };
  var send = function (path) {
    if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: path, title: path, event: true });
    else if (queue.length < 50) queue.push(path);
  };
  window.serveTrack = function (event, row) { try { send(pathFor(event, row || {})); } catch (e) { /* never break the game */ } };
  var s = document.createElement('script');
  s.async = true; s.src = 'https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', 'https://' + GOATCOUNTER + '.goatcounter.com/count');
  s.onload = function () { var q = queue; queue = []; q.forEach(send); };
  document.head.appendChild(s);
})();
