// Real money. Starts a Stripe Checkout for a SKU and, when the player comes back with ?paid=<session>, verifies it
// (worker mode) and grants the goods exactly once. SKUs: t1..t6 (Thread), daily (today's edit), monthly (the card).
import { PAYMENTS } from '../data/payments.js';
import { STORE, PLATFORM, native } from '../data/platform.js';
import { USD, THREAD_TIERS, DAILY_BUNDLE, MONTHLY, buyThread, buyDailyBundle, buyMonthly, dailyBundleBought, grantThread, recordReceipt, receipts, playerId, nextOpenLevel, CHAPTERS } from './state.js';
import { track } from './track.js';

export const SKUS = {
  ...Object.fromEntries(THREAD_TIERS.map((t) => [t.id, { name: `${t.thread} Thread`, usd: t.usd }])),
  daily: { name: 'Today’s edit', usd: DAILY_BUNDLE.usd },
  monthly: { name: 'Monthly card', usd: MONTHLY.usd },
};
export const skuFor = (key) => { const [kind, id] = key.split(':'); return kind === 'thread' ? id : kind; };
// 'off' where nothing is sold (itch.io, portals), 'native' in the store apps, otherwise one of the Stripe modes.
export function paymentsMode(sku) {
  if (STORE === 'none') return 'off';
  if (STORE === 'native') return 'native';
  if (PAYMENTS.worker) return 'worker';
  if (sku ? PAYMENTS.links[sku] : Object.keys(PAYMENTS.links).length) return 'links';
  return 'prototype';
}
export const paymentsEnv = () => PAYMENTS.env || 'test';
export const selling = () => paymentsMode() !== 'off';
// The price to show for an item. The stores require their own price, in the player's currency, once it has loaded.
let storePrices = {};
// In the apps a dollar price is never shown in its place: until the store answers, the price reads as "…".
export const priceOf = (sku) => storePrices[sku] || (STORE === 'native' ? '…' : USD(SKUS[sku]?.usd || 0));
export async function loadStorePrices() {
  const n = native(); if (STORE !== 'native' || !n) return false;
  try { storePrices = (await n.prices(Object.keys(SKUS))) || {}; return Object.keys(storePrices).length > 0; } catch (e) { return false; }
}
// A store purchase is added once, then the store is told it was delivered so the same item can be bought again.
function deliver(t, sku) {
  const usd = SKUS[sku]?.usd || 0;
  const fresh = recordReceipt({ id: String(t.id), sku, usd, verified: false, at: Date.now(), env: PLATFORM });
  const done = () => { try { const n = native(); if (t.token && n) Promise.resolve(n.finish(t.token)).catch(() => {}); } catch (e) { /* the store asks again next time */ } };
  if (!fresh) { done(); return { ok: true, repeat: true, text: 'This purchase was already added.' }; }
  const g = grant(sku, usd);
  done();
  track('purchase', { sku, usd, verified: false, mode: 'native' });
  return { ok: g.ok, sku, usd, store: true, text: g.text };
}
// Purchases the store has taken payment for but the game has not added yet, for example because the app was closed
// at the wrong moment or the payment was approved later. Called once when the app opens.
export async function recoverStorePurchases() {
  const n = native(); if (STORE !== 'native' || !n) return null;
  let list = []; try { list = (await n.pending()) || []; } catch (e) { return null; }
  let last = null;
  for (const t of list) { if (t && SKUS[t.sku] && t.id) { const r = deliver(t, t.sku); if (r.ok && !r.repeat) last = r; } }
  return last;
}
const returnTo = () => { const u = new URL(location.href); u.search = ''; u.hash = ''; return u.toString(); };

// On the website this leaves the page for Stripe; the player comes back to returnTo()?paid=...&sku=... and gets
// 'redirect' or 'prototype' here. In the store apps it opens the store's own sheet and returns the finished result.
export async function startCheckout(sku) {
  const mode = paymentsMode(sku);
  if (mode === 'off') throw new Error('nothing is sold here');
  track('checkout_start', { sku, mode });
  if (mode === 'native') {
    const n = native(); if (!n) throw new Error('store unavailable');
    const t = await n.purchase(sku);
    if (!t || t.cancelled) { track('checkout_cancel'); return { ok: false, cancelled: true }; }
    if (t.waiting) return { ok: false, pending: true, text: 'The store has not approved this payment yet. Nothing is lost: the game will add your purchase when it is approved.' };
    return deliver(t, sku);
  }
  if (mode === 'worker') {
    const r = await fetch(`${PAYMENTS.worker.replace(/\/$/, '')}/checkout`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sku, player: playerId(), returnTo: returnTo() }) });
    if (!r.ok) throw new Error(`checkout ${r.status}`);
    const { url } = await r.json();
    location.href = url; return 'redirect';
  }
  if (mode === 'links') {
    const u = new URL(PAYMENTS.links[sku]);
    u.searchParams.set('client_reference_id', playerId());
    location.href = u.toString(); return 'redirect';
  }
  return 'prototype';
}

function grant(sku, usd) {
  if (sku.startsWith('t')) { const r = buyThread(sku); return { ok: !!r.ok, text: r.ok ? `+${r.amount} Thread${r.first ? ', first purchase doubled' : ''}` : 'Unknown pack' }; }
  if (sku === 'daily') {
    const ch = CHAPTERS.find((c) => c.id === nextOpenLevel()?.chapter) || CHAPTERS[0];
    if (dailyBundleBought()) { grantThread(DAILY_BUNDLE.thread, DAILY_BUNDLE.usd); return { ok: true, text: `Today’s edit was already open today, so ${DAILY_BUNDLE.thread} Thread was added instead. Write to support if that is not what you meant.` }; }
    const r = buyDailyBundle(ch.swatches); return { ok: !!r.ok, text: `Today’s edit added: energy to full, ${DAILY_BUNDLE.swatches} swatches, ${DAILY_BUNDLE.tickets} fabric runs, ${DAILY_BUNDLE.thread} Thread` };
  }
  if (sku === 'monthly') { const r = buyMonthly(); return { ok: !!r.ok, text: `Monthly card active. +${MONTHLY.now} Thread now, ${MONTHLY.daily} a day for ${MONTHLY.days} days.` }; }
  return { ok: false, text: 'Unknown item' };
}

// A checkout that came back but is not confirmed yet is kept here until it is, so a slow confirmation or a dropped
// connection never loses a paid purchase. analytics.js moves ?paid= out of the address bar before anything else loads.
const PENDING = 'serve.pendingPay';
const readPending = () => { try { return JSON.parse(localStorage.getItem(PENDING) || 'null'); } catch (e) { return null; } };
const writePending = (v) => { try { if (v) localStorage.setItem(PENDING, JSON.stringify(v)); else localStorage.removeItem(PENDING); } catch (e) { /* storage unavailable */ } };
const takeStash = () => { try { const v = sessionStorage.getItem('serve.return'); sessionStorage.removeItem('serve.return'); return v || ''; } catch (e) { return ''; } };
export const pendingPurchase = () => !!readPending();

// called once on load, and again from the shop's "check again" button; returns null when there is nothing to report
export async function handleReturn() {
  const q = new URLSearchParams(location.search || takeStash());
  const cancelled = q.get('cancelled');
  const clean = () => { const u = new URL(location.href); u.searchParams.delete('paid'); u.searchParams.delete('sku'); u.searchParams.delete('cancelled'); history.replaceState(null, '', u.toString()); };
  const pending = readPending();
  const fromUrl = !!q.get('paid');
  const session = q.get('paid') || pending?.session;
  if (location.search) clean();
  if (!session) { if (cancelled) { track('checkout_cancel'); return { ok: false, cancelled: true }; } return null; }
  let sku = q.get('sku') || pending?.sku; let verified = false; let usd = SKUS[sku]?.usd || 0; let amount = null;
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(session)) { writePending(null); return fromUrl ? { ok: false, text: 'That is not a Stripe receipt.' } : null; }
  // remember it before asking the server, and give up only after three days
  const first = pending?.session === session ? pending.at : Date.now();
  writePending({ session, sku, at: first });
  if (PAYMENTS.worker) {
    try {
      const r = await fetch(`${PAYMENTS.worker.replace(/\/$/, '')}/verify?session_id=${encodeURIComponent(session)}`);
      const j = await r.json();
      if (!j.paid) {
        if (Date.now() - first > 3 * 86400000) writePending(null);
        track('checkout_unpaid', { sku });
        return fromUrl ? { ok: false, pending: true, text: 'Stripe has not confirmed this payment yet. Nothing is lost: the game will check again each time you open it, and add your purchase as soon as it is confirmed.' } : null;
      }
      sku = j.sku || sku; verified = true; amount = j.amount_total; usd = amount != null ? amount / 100 : usd;
    } catch (e) {
      return fromUrl ? { ok: false, pending: true, text: 'The payment server could not be reached. Nothing is lost: the game will check again each time you open it. Your Stripe receipt is your proof of purchase.' } : null;
    }
  }
  if (!SKUS[sku]) { writePending(null); return { ok: false, text: 'This receipt does not match an item in the shop.' }; }
  const fresh = recordReceipt({ id: session, sku, usd, verified, at: Date.now(), env: paymentsEnv() });
  writePending(null);
  if (!fresh) return fromUrl ? { ok: true, repeat: true, text: 'This purchase was already added.' } : null;
  const g = grant(sku, usd);
  track('purchase', { sku, usd, verified, mode: paymentsMode(sku) });
  return { ok: g.ok, sku, usd, verified, text: g.text };
}
export const purchaseHistory = () => [...receipts()].reverse();
