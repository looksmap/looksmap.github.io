// Real money. Starts a Stripe Checkout for a SKU and, when the player comes back with ?paid=<session>, verifies it
// (worker mode) and grants the goods exactly once. SKUs: t1..t6 (Thread), daily (today's edit), monthly (the card).
import { PAYMENTS } from '../data/payments.js';
import { THREAD_TIERS, DAILY_BUNDLE, MONTHLY, buyThread, buyDailyBundle, buyMonthly, dailyBundleBought, grantThread, recordReceipt, receipts, playerId, nextOpenLevel, CHAPTERS } from './state.js';
import { track } from './track.js';

export const SKUS = {
  ...Object.fromEntries(THREAD_TIERS.map((t) => [t.id, { name: `${t.thread} Thread`, usd: t.usd }])),
  daily: { name: 'Today’s edit', usd: DAILY_BUNDLE.usd },
  monthly: { name: 'Monthly card', usd: MONTHLY.usd },
};
export const skuFor = (key) => { const [kind, id] = key.split(':'); return kind === 'thread' ? id : kind; };
export function paymentsMode(sku) {
  if (PAYMENTS.worker) return 'worker';
  if (sku ? PAYMENTS.links[sku] : Object.keys(PAYMENTS.links).length) return 'links';
  return 'prototype';
}
export const paymentsEnv = () => PAYMENTS.env || 'test';
const returnTo = () => { const u = new URL(location.href); u.search = ''; u.hash = ''; return u.toString(); };

// leaves the page for Stripe; the player comes back to returnTo()?paid=...&sku=...
export async function startCheckout(sku) {
  const mode = paymentsMode(sku);
  track('checkout_start', { sku, mode });
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

// called once on load; returns null when the URL carries no payment result
export async function handleReturn() {
  const q = new URLSearchParams(location.search);
  const session = q.get('paid'); const cancelled = q.get('cancelled');
  if (!session && !cancelled) return null;
  const clean = () => { const u = new URL(location.href); u.searchParams.delete('paid'); u.searchParams.delete('sku'); u.searchParams.delete('cancelled'); history.replaceState(null, '', u.toString()); };
  if (cancelled) { clean(); track('checkout_cancel'); return { ok: false, cancelled: true }; }
  let sku = q.get('sku'); let verified = false; let usd = SKUS[sku]?.usd || 0; let amount = null;
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(session)) { clean(); return { ok: false, text: 'That is not a Stripe receipt.' }; }
  if (PAYMENTS.worker) {
    try {
      const r = await fetch(`${PAYMENTS.worker.replace(/\/$/, '')}/verify?session_id=${encodeURIComponent(session)}`);
      const j = await r.json();
      if (!j.paid) { clean(); track('checkout_unpaid', { sku }); return { ok: false, text: 'Stripe has not confirmed this payment yet. If you were charged, it will appear within a few minutes; reopen the shop then.' }; }
      sku = j.sku || sku; verified = true; amount = j.amount_total; usd = amount != null ? amount / 100 : usd;
    } catch (e) { clean(); return { ok: false, text: 'Could not reach the payment server to confirm. Your receipt from Stripe is proof of purchase; try again in a minute or write to support.' }; }
  }
  if (!SKUS[sku]) { clean(); return { ok: false, text: 'This receipt does not match an item in the shop.' }; }
  const fresh = recordReceipt({ id: session, sku, usd, verified, at: Date.now(), env: paymentsEnv() });
  clean();
  if (!fresh) return { ok: true, repeat: true, text: 'This purchase was already added.' };
  const g = grant(sku, usd);
  track('purchase', { sku, usd, verified, mode: paymentsMode(sku) });
  return { ok: g.ok, sku, usd, verified, text: g.text };
}
export const purchaseHistory = () => [...receipts()].reverse();
