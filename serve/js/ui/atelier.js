// The shop. Thread is the paid currency; everything has a printed price and nothing is a surprise.
// Prototype rule: tapping Buy on a dollar item adds the goods and records the price. No payment is taken.
import { route, esc, fmt, houseName, toast, overlay, closeOverlay, rerender, timeLeft, renderTicker, renderWallet } from './app.js';
import { SETS, REFILL_LADDER, setProgress, hydrate, state, buy, owns, item, threadPrice, DROPS, buyDropSet, dropSetPrice, storageOK, CAPSULE, pullCapsule, energy, ENERGY, maxEnergy, SET_BY_ID, SWATCHES, CHAPTERS, nextOpenLevel,
  THREAD_TIERS, DAILY_BUNDLE, MONTHLY, FABRIC_PACK, CREDIT_PACKS, GIFT_WINDOWS, SIGNIN, USD, buyThread, buyDailyBundle, dailyBundleBought, buyMonthly, monthlyActive, monthlyDaysLeft, monthlyClaimable, claimMonthly,
  refillPrice, refillsBoughtToday, refillEnergy, fabricPacksLeft, buyFabric, buyCredits, giftState, claimGift, signinState, signIn, spentUSD, energyEtaMin, fabricRuns, resetFabricRun, FABRIC_RUNS, LEVELS } from '../engine/state.js';
import { CATALOG, SLOTS } from '../data/catalog.js';
import { lazyThumb } from './thumbs.js';
import { itemDrawer, STARS } from './wardrobe.js';
import { renderLook } from '../render/figure.js';
import { icon } from './icons.js';
import { OBJ } from './objects.js';
import { track } from '../engine/track.js';
import { paymentsMode, paymentsEnv, startCheckout, skuFor, purchaseHistory } from '../engine/payments.js';

let tab = 'today';
let lastPull = null;
let editSlot = 'all';
let editPage = 0;
const PAGE = 36;
const FABRIC_COLORS = { cotton: '#EFE6D6', denim: '#5C7BA6', leather: '#4A2F22', wool: '#B9A48A', tweed: '#A98B6A', pearl: '#F2EDE6', satin: '#E39DB6', velvet: '#5A1C28', fur: '#C9A46A', gold: '#CDAA5A', lace: '#F3F0E8', sheer: '#CFC7DA', metal: '#C9CDD4', nylon: '#2E4A9A', latex: '#111111', canvas: '#B9A48A', knit: '#E3DACB', dye: '#C9B8F0', print: '#9DB4CF' };

const currentChapter = () => CHAPTERS.find((c) => c.id === (nextOpenLevel()?.chapter || 'c8')) || CHAPTERS[0];

/* ---------- Today ---------- */

/* ---------- pricing helpers: every "sold separately" figure is computed from prices actually charged ---------- */
// cheapest real-money price for an amount of Thread, using the smallest tier that covers it (no first-purchase doubling)
export function usdForThread(n) {
  const tier = THREAD_TIERS.find((t) => t.thread >= n) || THREAD_TIERS[THREAD_TIERS.length - 1];
  return Math.round((n / tier.thread) * tier.usd * 100) / 100;
}
function bundleBreakdown() {
  return [
    { what: 'Energy refill', thread: REFILL_LADDER[0] },
    { what: `${DAILY_BUNDLE.swatches} fabric swatches`, thread: Math.ceil(DAILY_BUNDLE.swatches / FABRIC_PACK.count) * FABRIC_PACK.thread },
    { what: `${DAILY_BUNDLE.tickets} fabric-run tickets`, thread: DAILY_BUNDLE.tickets * FABRIC_RUNS.resetPrice },
    { what: `${DAILY_BUNDLE.thread} Thread`, thread: DAILY_BUNDLE.thread },
  ];
}
// the set she is closest to finishing: the hero of the Today card
function closestSet() {
  let best = null;
  for (const st of SETS) {
    const p = setProgress(st.id);
    if (!p || p.complete || !p.have) continue;
    const r = p.have / p.total;
    if (!best || r > best.r) best = { set: st, p, r };
  }
  return best;
}
// the hero wears her last look, with the set pieces she owns (or the next drop) layered over it
function baseLook(s) {
  const last = s.history.find((h) => !LEVELS[h.briefId]?.pim);
  const look = last ? hydrate(last.items) : hydrate({ top: 't_tee', bottom: 'b_jeans', shoes: 's_ballet' });
  if (!look.hair) look.hair = item(`hr_${(s.avatar.hairStyle || 'longWavy').replace(/[A-Z]/g, (m) => '_' + m.toLowerCase())}`);
  return look;
}
function placeOn(look, it) { look[it.slot] = it; if (it.slot === 'dress') { delete look.top; delete look.bottom; } if (it.slot === 'top' || it.slot === 'bottom') delete look.dress; }
function todayHero(s) {
  const look = baseLook(s);
  const c = closestSet();
  if (c) {
    for (const id of c.set.pieceIds) { const it = item(id); if (it && owns(id) && !it.pim) placeOn(look, it); }
    return { svg: renderLook(look, s.avatar, { depth: true, shadow: false, viewBox: '60 0 240 560' }), caption: `${c.p.have} of ${c.p.total} pieces · ${c.set.name}`, missing: c.p.total - c.p.have };
  }
  const next = nextOpenLevel();
  const it = next?.item ? item(next.item) : null;
  if (it && !it.pim) placeOn(look, it);
  return { svg: renderLook(look, s.avatar, { depth: true, shadow: false, viewBox: '60 0 240 560' }), caption: it ? `Next drop · ${it.name}` : 'Your next look', missing: 0 };
}
function todayView(s) {
  const ch = currentChapter();
  const bought = dailyBundleBought();
  const si = signinState();
  const gifts = GIFT_WINDOWS.map((g) => giftState(g.id));
  const hero = todayHero(s);
  const parts = bundleBreakdown();
  const sep = usdForThread(parts.reduce((a, x) => a + x.thread, 0));
  return `<section class="bundle today">
    <div class="bundle-hero">${hero.svg}<span class="bundle-cap">${esc(hero.caption)}</span></div>
    <div class="bundle-body">
      <div class="kicker">${icon('sparkle')} ${bought ? 'Bought · back at 00:00' : '1 of 1 today · resets 00:00'}</div>
      <h2>Today’s Edit</h2>
      <p class="bundle-sub">Enough to finish ${hero.missing ? `the ${hero.missing} piece${hero.missing === 1 ? '' : 's'} you are missing` : 'one set'} today: energy to ${maxEnergy()}, ${DAILY_BUNDLE.swatches} swatches, ${DAILY_BUNDLE.tickets} fabric runs, ${DAILY_BUNDLE.thread} Thread.</p>
      <ul class="bundle-list">
        <li>${OBJ.energyJar(18)} Energy to ${maxEnergy()}, whatever you are on</li>
        <li>${OBJ.fabric(18, FABRIC_COLORS[ch.swatches[0]])} ${DAILY_BUNDLE.swatches} swatches for ${esc(ch.title)}, plus ${DAILY_BUNDLE.gold} gold thread and ${DAILY_BUNDLE.dye} dye</li>
        <li>${OBJ.star(18, '#5FC9C0')} ${DAILY_BUNDLE.tickets} fabric-run tickets, any level</li>
        <li>${OBJ.spool(18)} ${DAILY_BUNDLE.thread} Thread</li>
      </ul>
      <details class="anchor"><summary>Sold separately in this shop: ${USD(sep)}</summary><ul>${parts.map((x) => `<li><span>${esc(x.what)}</span><span class="num">${x.thread} Thread</span></li>`).join('')}<li><span>Thread at the ${USD(THREAD_TIERS.find((t) => t.thread >= parts.reduce((a, x) => a + x.thread, 0))?.usd || THREAD_TIERS[5].usd)} pack rate</span><span class="num">${USD(sep)}</span></li></ul></details>
      <button class="btn primary block" data-shop-buy="daily" ${bought ? 'disabled' : ''}>${bought ? 'Bought today' : `Buy today’s edit · ${USD(DAILY_BUNDLE.usd)}`}</button>
      <p class="muted small">Without it, fabric is three free hard-mode runs per level a day. Energy still returns on its own.</p>
    </div>
  </section>

  <section class="panel signin">
    <div class="panel-title">${icon('check')} Sign in · day ${si.day + 1} of 7</div>
    <div class="signin-row">${SIGNIN.map((r, i) => { const got = i < si.day || (si.done && i === si.day); const cur = !si.done && i === si.day; return `<div class="signin-day ${got ? 'got' : ''} ${cur ? 'cur' : ''}"><span class="d">${i + 1}</span>${r.credits ? OBJ.coin(22) : r.thread ? OBJ.spool(22) : r.dye ? OBJ.drop(22) : OBJ.fabric(22, FABRIC_COLORS[ch.swatches[1]])}<span class="v">${r.credits ? `${r.credits}` : r.thread ? `${r.thread}` : r.dye ? `${r.dye} dye` : `${r.swatch} fabric`}</span></div>`; }).join('')}</div>
    <button class="btn block ${si.done ? 'ghost' : 'primary'}" data-signin ${si.done ? 'disabled' : ''}>${si.done ? 'Signed in · see you tomorrow' : 'Sign in'}</button>
  </section>

  <section class="panel">
    <div class="panel-title">${icon('bolt')} Free energy</div>
    <div class="gift-row">${gifts.map((g) => `<div class="gift ${g.claimable ? 'live' : ''}">${OBJ.bolt(28)}<div><b>${String(g.from).padStart(2, '0')}:00 to ${String(g.to).padStart(2, '0')}:00</b><span class="muted small">+${g.energy} energy</span></div><button class="btn small ${g.claimable ? 'primary' : 'ghost'}" data-gift="${g.id}" ${g.claimable ? '' : 'disabled'}>${g.claimed ? 'Claimed' : g.open ? 'Claim' : 'Later'}</button></div>`).join('')}</div>
    <p class="muted small">Your local time. Energy also comes back on its own, one every ${ENERGY.regenMs / 60000} minutes, and refills when you level up.</p>
  </section>

  <section class="panel monthly">
    <div class="panel-title">${icon('star')} Thirty days, dressed daily</div>
    <div class="monthly-row">${OBJ.card(48)}<div><b>${MONTHLY.daily} Thread every day you open the app. ${MONTHLY.now} now.</b><span class="muted small">${monthlyActive() ? `${monthlyDaysLeft()} days left` : `${USD(MONTHLY.usd)} for ${MONTHLY.days} days · sold separately: about ${USD(usdForThread(MONTHLY.now + MONTHLY.daily * MONTHLY.days))} of Thread`}</span></div></div>
    <div class="row">${monthlyActive() ? `<button class="btn ${monthlyClaimable() ? 'primary' : 'ghost'}" data-claim-monthly ${monthlyClaimable() ? '' : 'disabled'}>${monthlyClaimable() ? `Claim today's ${MONTHLY.daily}` : 'Claimed today'}</button><button class="btn ghost" data-shop-buy="monthly">Extend · ${USD(MONTHLY.usd)}</button>` : `<button class="btn primary" data-shop-buy="monthly">Start 30 days · ${USD(MONTHLY.usd)}</button>`}</div>
  </section>`;
}

/* ---------- Thread ---------- */
function threadView(s) {
  return `<section class="panel">
    <div class="panel-title">${icon('spool')} Thread</div>
    <p class="muted small">Every tier doubles on your first purchase. Once. It never resets.</p>
    <div class="tiers">${(() => { const bestId = THREAD_TIERS.reduce((b, t) => (t.thread / t.usd > b.thread / b.usd ? t : b)).id; return THREAD_TIERS.map((t, i) => { const first = !s.shop.firstBuy[t.id]; const got = first ? t.thread * 2 : t.thread; return `<button class="tier ${first ? 'first' : ''} ${t.id === bestId ? 'best' : ''}" data-shop-buy="thread:${t.id}">${t.id === bestId ? '<span class="ribbon">Best rate</span>' : first ? '<span class="ribbon two">2× first time</span>' : ''}${OBJ.spool(28 + i * 5)}<b class="num">${fmt(got)}</b>${first ? `<span class="was num">${fmt(t.thread)} + ${fmt(t.thread)} bonus</span>` : `<span class="was">≈ ${Math.floor(got / CAPSULE.price)} capsule pulls</span>`}<span class="price">${USD(t.usd)}</span></button>`; }).join(''); })()}</div>
  </section>
  ${paymentsMode() === 'prototype' ? `<section class="panel"><div class="panel-title">${icon('info')} About payments in this prototype</div><p class="muted small">Buy adds the Thread and records the price so the pacing is real. No card, no charge. Recorded so far: ${USD(spentUSD())}.</p></section>` : `<section class="panel"><div class="panel-title">${icon('info')} Payments</div><p class="muted small">Checkout is handled by Stripe${paymentsEnv() === 'test' ? ' in test mode: nothing is really charged yet' : ''}. Receipts go to the email you give Stripe. Purchases are added the moment you come back; if one is missing, write to support with the receipt.</p>${purchaseHistory().length ? `<ul class="receipts">${purchaseHistory().slice(0, 6).map((r) => `<li><span>${esc(new Date(r.at).toLocaleDateString())}</span><span>${esc(r.sku.startsWith('t') ? 'Thread' : r.sku === 'daily' ? 'Today’s edit' : 'Monthly card')}</span><span class="num">${USD(r.usd)}</span></li>`).join('')}</ul>` : ''}</section>`}`;
}

/* ---------- Energy and fabric ---------- */
function energyView(s) {
  const e = energy();
  const price = refillPrice();
  const nToday = refillsBoughtToday();
  const ch = currentChapter();
  const kinds = Object.keys(SWATCHES).filter((k) => !['dye', 'print'].includes(k));
  const mine = new Set(ch.swatches);
  const sorted = [...kinds].sort((a, b) => (mine.has(b) ? 1 : 0) - (mine.has(a) ? 1 : 0));
  return `<section class="panel">
    <div class="panel-title">${icon('bolt')} Energy</div>
    <div class="energy-row">${OBJ.energyJar(44)}<div><b class="num">${e} of ${maxEnergy()}</b><span class="muted small">Refill for ${price} Thread${nToday ? ` · ${nToday} bought today, the price climbs` : ' · the price climbs with each refill today'}</span></div><button class="btn small primary" data-refill ${s.thread >= price ? '' : 'disabled'}>${price} ${icon('spool')}</button></div>
    <div class="ladder-row">${[30, 30, 60, 60, 90, 120, 150, 200].map((p, i) => `<span class="step ${i < nToday ? 'done' : i === nToday ? 'cur' : ''}">${p}</span>`).join('')}</div>
  </section>
  <section class="panel">
    <div class="panel-title">${icon('pattern')} Fabric · ${fabricPacksLeft()} of ${FABRIC_PACK.dailyLimit} packs left today</div>
    <p class="muted small">Set pieces are made from fabric. Levels drop it on a first clear and on hard-mode runs. A pack is ${FABRIC_PACK.count}. What ${esc(ch.title)} needs comes first.</p>
    <div class="fabrics">${sorted.map((k) => `<button class="fab ${mine.has(k) ? 'mine' : ''}" data-shop-buy="fabric:${k}" ${fabricPacksLeft() && s.thread >= FABRIC_PACK.thread ? '' : 'disabled'}>${OBJ.fabric(34, FABRIC_COLORS[k] || '#ccc')}<b>${esc(SWATCHES[k] || k)}</b><span class="muted small">you’ve ${s.swatches[k] || 0}</span><span class="price">${FABRIC_PACK.count} for ${FABRIC_PACK.thread} ${icon('spool')}</span></button>`).join('')}</div>
  </section>
  <section class="panel">
    <div class="panel-title">${icon('coin')} Credits</div>
    <div class="row">${CREDIT_PACKS.map((p) => `<button class="btn ${s.thread >= p.thread ? '' : 'ghost'}" data-shop-buy="credits:${p.id}" ${s.thread >= p.thread ? '' : 'disabled'}>${OBJ.coin(18)} ${fmt(p.credits)} for ${p.thread} ${icon('spool')}</button>`).join('')}</div>
  </section>`;
}

/* ---------- The Edit, Sets, Capsule ---------- */
function editGrid(s) {
  let items = CATALOG.filter((i) => i.source === 'atelier' && !owns(i.id));
  if (editSlot !== 'all') items = items.filter((i) => i.slot === editSlot);
  const day = Math.floor(Date.now() / 86400000);
  items.sort((a, b) => ((a.id.length * 31 + day) % 97) - ((b.id.length * 31 + day) % 97) || a.price - b.price);
  const pages = Math.max(1, Math.ceil(items.length / PAGE));
  if (editPage >= pages) editPage = pages - 1;
  const shown = items.slice(editPage * PAGE, editPage * PAGE + PAGE);
  return `<div class="filters">${['all', ...Object.keys(SLOTS)].map((k) => `<button class="chip ${editSlot === k ? 'on' : ''}" data-eslot="${k}">${k === 'all' ? 'All' : esc(SLOTS[k])}</button>`).join('')}</div>
  <div class="section"><div class="section-head"><h2>The Edit</h2><span class="mono">${fmt(items.length)} pieces · credits only</span></div>
  <div class="tiles">${shown.map((it) => { const can = s.credits >= it.price; return `<div class="tile"><button data-shop-item="${it.id}" style="text-align:left"><div class="img">${lazyThumb(it, s.avatar)}</div><div class="cap"><span class="name">${esc(it.name)}</span><span class="house">${esc(houseName(it.house))}</span><span class="price num">CR ${fmt(it.price)}</span></div></button><button class="btn small ${can ? 'primary' : 'ghost'}" style="margin:0 6px 8px" data-buy="${it.id}" ${can ? '' : 'disabled'}>Buy</button><span class="mark rar ${it.rarity}">${STARS[it.rarity] || '★'}</span></div>`; }).join('')}</div>
  ${pages > 1 ? `<div class="pager"><button class="btn small ghost" data-epage="${editPage - 1}" ${editPage === 0 ? 'disabled' : ''}>Prev</button><span class="mono">${editPage + 1} / ${pages}</span><button class="btn small ghost" data-epage="${editPage + 1}" ${editPage >= pages - 1 ? 'disabled' : ''}>Next</button></div>` : ''}</div>`;
}
function drops(s) {
  return DROPS.map((d) => {
    const missing = d.items.filter((id) => !owns(id));
    const setPrice = dropSetPrice(d.id);
    const st = SET_BY_ID[d.id];
    const look = Object.fromEntries(d.items.map(item).map((it) => [it.slot, it]));
    return `<section class="drop">
      <div class="drop-hero"><div class="set-fig">${renderLook(look, { ...s.avatar, hairStyle: st?.hairStyle || s.avatar.hairStyle }, { depth: true, shadow: false })}</div>
      <div><div class="eyebrow">${esc(houseName(d.house))} · featured set</div><h2>${esc(d.title)}</h2><p class="line">${esc(d.line)}</p>
        <div class="timer"><span>Whole set <b>${d.setThread} Thread</b></span><span>Always available at this price</span></div>
        ${missing.length ? `<button class="btn primary" data-buy-set="${d.id}" ${s.thread >= setPrice ? '' : 'disabled'}>Buy the ${missing.length < d.items.length ? 'rest of the ' : ''}set · ${setPrice} ${icon('spool')}</button>` : '<span class="chip good">Set complete</span>'}</div></div>
      <div class="items">${d.items.map((id) => { const it = item(id); const o = owns(id); const p = threadPrice(it); return `<div class="tile ${o ? 'on' : ''}"><button data-shop-item="${id}" style="text-align:left"><div class="img">${lazyThumb(it, s.avatar)}</div><div class="cap"><span class="name">${esc(it.name)}</span><span class="price num">${o ? 'Owned' : `${p} Thread`}</span></div></button>${o ? '<span class="mark">Owned</span>' : `<button class="btn small ${s.thread >= p ? '' : 'ghost'}" style="margin:0 6px 8px" data-buy-thread="${id}" ${s.thread >= p ? '' : 'disabled'}>${p} ${icon('spool')}</button>`}</div>`; }).join('')}</div>
    </section>`;
  }).join('');
}
function capsule(s) {
  const pool = CAPSULE.pool();
  const left = pool.filter((i) => !owns(i.id));
  const pityIn = CAPSULE.pity - s.capsule.sincePity;
  const byR = (r) => ({ total: pool.filter((i) => i.rarity === r).length, left: left.filter((i) => i.rarity === r).length });
  return `<div class="section" style="display:grid;gap:16px">
    <div>
      <div class="eyebrow">The capsule · blind box, printed odds</div>
      <h2 class="display display-l" style="margin:6px 0 10px">One pull, <em class="ital">one piece.</em></h2>
      <p class="muted small">No duplicates, so the pool shrinks with every pull. An Icon piece is guaranteed by pull ${CAPSULE.pity}. These are the real odds, the same for everyone.</p>
      <div class="odds" style="margin-top:12px"><span class="h">Rarity</span><span class="h">Odds</span><span class="h">Left in pool</span>${CAPSULE.odds.map(([r, p]) => { const c = byR(r); return `<span>${esc(r)}</span><span class="num">${(p * 100).toFixed(0)}%</span><span class="num">${fmt(c.left)} / ${fmt(c.total)}</span>`; }).join('')}</div>
      <dl class="kv" style="margin-top:12px"><dt>Pulls so far</dt><dd class="num">${s.capsule.pulls}</dd><dt>Icon guaranteed in</dt><dd class="num">${pityIn}</dd><dt>Price</dt><dd>${CAPSULE.price} Thread</dd></dl>
      <div style="margin-top:12px"><button class="btn primary block" data-pull ${s.thread >= CAPSULE.price && left.length ? '' : 'disabled'}>Pull · ${CAPSULE.price} ${icon('spool')}</button></div>
    </div>
    <div class="reveal">${lastPull ? `${renderLook({ [lastPull.slot]: lastPull }, s.avatar, { ghost: true, depth: true, shadow: false })}<div class="label"><span class="name">${esc(lastPull.name)}</span><span class="house">${esc(houseName(lastPull.house))} · ${esc(lastPull.rarity)}</span></div>` : '<span class="mono">Your pull appears here</span>'}</div>
  </div>`;
}

/* ---------- confirm sheet and the out-of-energy offer ---------- */
function describe(key) {
  const [kind, id] = key.split(':');
  const ch = currentChapter();
  if (kind === 'daily') return { title: 'Today’s edit', usd: DAILY_BUNDLE.usd, lines: [`Energy to full (+${maxEnergy()})`, `${DAILY_BUNDLE.swatches} fabric swatches for ${ch.title}`, `${DAILY_BUNDLE.tickets} fabric-run tickets`, `${DAILY_BUNDLE.gold} gold thread, ${DAILY_BUNDLE.dye} dye`, `${DAILY_BUNDLE.thread} Thread`] };
  if (kind === 'monthly') return { title: 'Monthly card', usd: MONTHLY.usd, lines: [`${MONTHLY.now} Thread now`, `${MONTHLY.daily} Thread every day for ${MONTHLY.days} days, claimed in the shop`] };
  if (kind === 'thread') { const t = THREAD_TIERS.find((x) => x.id === id); const first = !state().shop.firstBuy[id]; return { title: `${fmt(first ? t.thread * 2 : t.thread)} Thread`, usd: t.usd, lines: first ? [`${fmt(t.thread)} Thread`, `+${fmt(t.thread)} first-purchase bonus`] : [`${fmt(t.thread)} Thread`] }; }
  if (kind === 'fabric') return { title: `${FABRIC_PACK.count} × ${SWATCHES[id] || id}`, thread: FABRIC_PACK.thread, lines: [`${fabricPacksLeft()} packs left today`] };
  if (kind === 'credits') { const p = CREDIT_PACKS.find((x) => x.id === id); return { title: `${fmt(p.credits)} credits`, thread: p.thread, lines: [] }; }
  return null;
}
function confirmSheet(key) {
  const d = describe(key); if (!d) return '';
  return `<div class="sheet-wrap" role="dialog" aria-label="Confirm"><div class="scrim" data-close-sheet></div><aside class="sheet confirm">
    <button class="close" data-close-sheet>Close ×</button>
    <div class="eyebrow">${d.usd != null ? 'Purchase' : 'Spend Thread'}</div>
    <h2 class="display display-m">${esc(d.title)}</h2>
    <ul class="notes">${d.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
    <div class="confirm-price">${d.usd != null ? USD(d.usd) : `${d.thread} ${icon('spool')} Thread`}</div>
    ${d.usd != null ? (paymentsMode(skuFor(key)) === 'prototype' ? '<p class="muted small">Prototype: nothing is charged. You receive the items and the price is recorded.</p>' : `<p class="muted small">Secure checkout by Stripe: Apple Pay, Google Pay or a card. You come straight back here and the items are added.${paymentsEnv() === 'test' ? ' Test mode: no real charge; use card 4242 4242 4242 4242.' : ''}</p><p class="muted small">Items are delivered as soon as you pay, so purchases are final once added, except as set out in the <a href="refunds.html" target="_blank" rel="noopener">refund policy</a>. See the <a href="privacy.html" target="_blank" rel="noopener">privacy policy</a> for what Stripe and we receive. Buying means you agree to the <a href="terms.html" target="_blank" rel="noopener">terms</a>.</p>`) : ''}
    <div class="sheet-actions"><button class="btn primary block" data-confirm="${esc(key)}">${d.usd != null && paymentsMode(skuFor(key)) !== 'prototype' ? `Pay ${USD(d.usd)}` : 'Confirm'}</button><button class="btn ghost block" data-close-sheet>Not now</button></div>
  </aside></div>`;
}
export function offerSheet(reason = 'energy') {
  const s = state();
  const price = refillPrice();
  const bought = dailyBundleBought();
  const eta = energyEtaMin();
  const h = new Date().getHours();
  const nToday = refillsBoughtToday();
  const nextGift = GIFT_WINDOWS.map((g) => giftState(g.id)).find((g) => g.claimable) || GIFT_WINDOWS.find((g) => g.from > h) || GIFT_WINDOWS[0];
  const waitMin = Math.max(eta, 1) + (ENERGY.cost - 1) * (ENERGY.regenMs / 60000);
  return `<div class="sheet-wrap" role="dialog" aria-label="Out of energy"><div class="scrim" data-close-sheet></div><aside class="sheet offer">
    <button class="close" data-close-sheet>Close ×</button>
    <div class="offer-head">${OBJ.energyJar(56)}<div><div class="eyebrow">${ENERGY.cost} energy to the next attempt</div><h2 class="display display-m">${reason === 'energy' ? 'Out of energy.' : 'Keep going.'}</h2><p class="muted small">Three ways back in. Two are free.</p></div></div>
    <div class="offer-opts">
      <button class="opt free" data-close-sheet>${OBJ.bolt(30)}<span><b>Wait ${waitMin} min</b><small>One energy every ${ENERGY.regenMs / 60000} minutes, and a full refill every time you level up</small></span></button>
      ${nextGift.claimable ? `<button class="opt free" data-gift="${nextGift.id}" data-from-sheet>${OBJ.gift(30, '#5FC9C0')}<span><b>Claim +${nextGift.energy} free</b><small>The ${String(nextGift.from).padStart(2, '0')}:00 to ${String(nextGift.to).padStart(2, '0')}:00 gift is open now</small></span></button>` : `<div class="opt free">${OBJ.gift(30, '#5FC9C0')}<span><b>+${nextGift.energy} free at ${String(nextGift.from).padStart(2, '0')}:00</b><small>Two gift windows a day, your local time</small></span></div>`}
      <button class="opt" data-refill ${s.thread >= price ? '' : 'disabled'}>${OBJ.energyJar(30)}<span><b>Refill to ${maxEnergy()} · ${price} Thread</b><small>${s.thread < price ? `You have ${s.thread}. ` : ''}Today’s ladder: ${REFILL_LADDER.map((p, i) => (i === nToday ? `[${p}]` : p)).join(' · ')}</small></span></button>
      <button class="opt" data-shop-buy="daily" ${bought ? 'disabled' : ''}>${OBJ.gift(30)}<span><b>Today’s edit · ${USD(DAILY_BUNDLE.usd)}</b><small>${bought ? 'Bought today' : `Energy to full, ${DAILY_BUNDLE.swatches} swatches, ${DAILY_BUNDLE.tickets} fabric runs, ${DAILY_BUNDLE.thread} Thread`}</small></span></button>
      <a class="opt" href="#atelier" data-close-sheet>${OBJ.spool(30)}<span><b>Thread</b><small>From ${USD(THREAD_TIERS[0].usd)}. Every tier doubles the first time.</small></span></a>
    </div>
  </aside></div>`;
}

export function runsSheet(levelId) {
  const s = state();
  const fr = fabricRuns(levelId);
  const lv = LEVELS[levelId];
  const bought = dailyBundleBought();
  return `<div class="sheet-wrap" role="dialog" aria-label="No runs left"><div class="scrim" data-close-sheet></div><aside class="sheet offer">
    <button class="close" data-close-sheet>Close ×</button>
    <div class="offer-head">${OBJ.fabric(56, '#F7A8C9')}<div><div class="eyebrow">Fabric runs · ${esc(lv.title)} · ${fr.used} of ${fr.allowance} used</div><h2 class="display display-m">No runs left today.</h2><p class="muted small">Three ways back in. One is free.</p></div></div>
    <div class="offer-opts">
      <div class="opt free">${OBJ.star(30, '#5FC9C0')}<span><b>Tomorrow</b><small>${fr.free} free runs per level come back at midnight</small></span></div>
      <button class="opt" data-reset-run="${levelId}" data-from-studio ${s.thread >= fr.resetPrice && fr.canReset ? '' : 'disabled'}>${OBJ.spool(30)}<span><b>Reset this level</b><small>${fr.resetPrice} Thread · ${fr.resets} of ${fr.maxResets} resets used today</small></span></button>
      <button class="opt" data-reset-ticket="${levelId}" data-from-studio ${fr.tickets > 0 && fr.canReset ? '' : 'disabled'}>${OBJ.star(30)}<span><b>Use a ticket</b><small>${fr.tickets} ticket${fr.tickets === 1 ? '' : 's'} · ${DAILY_BUNDLE.tickets} come in today’s edit</small></span></button>
      <button class="opt" data-shop-buy="daily" ${bought ? 'disabled' : ''}>${OBJ.gift(30)}<span><b>Today’s edit · ${USD(DAILY_BUNDLE.usd)}</b><small>${bought ? 'Bought today' : `${DAILY_BUNDLE.tickets} fabric runs, ${DAILY_BUNDLE.swatches} swatches, energy to full, ${DAILY_BUNDLE.thread} Thread`}</small></span></button>
    </div>
  </aside></div>`;
}

function execute(key) {
  const [kind, id] = key.split(':');
  const ch = currentChapter();
  let r;
  track('purchase_attempt', { kind });
  if (['daily', 'monthly', 'thread'].includes(kind) && paymentsMode(skuFor(key)) !== 'prototype') {
    if (!storageOK) { toast('This browser is not saving progress, so purchases are turned off here.', 4200); closeOverlay(); return; }
    const btn = document.querySelector(`[data-confirm="${key}"]`); if (btn) { btn.disabled = true; btn.textContent = 'Opening Stripe…'; }
    startCheckout(skuFor(key)).catch(() => { toast('Could not open checkout. Try again in a moment.'); closeOverlay(); });
    return;
  }
  if (kind === 'daily') { r = buyDailyBundle(ch.swatches); toast(r.ok ? `Today’s edit added: energy, fabric, ${DAILY_BUNDLE.thread} Thread` : 'Already bought today'); }
  else if (kind === 'monthly') { r = buyMonthly(); toast(`Monthly card active · +${MONTHLY.now} Thread`); }
  else if (kind === 'thread') { r = buyThread(id); toast(r.ok ? `+${fmt(r.amount)} Thread${r.first ? ' (first purchase doubled)' : ''}` : 'Could not buy'); }
  else if (kind === 'fabric') { r = buyFabric(id); toast(r.ok ? `+${r.count} ${SWATCHES[id] || id}` : r.reason === 'limit' ? 'No packs left today' : 'Not enough Thread'); }
  else if (kind === 'credits') { r = buyCredits(id); toast(r.ok ? `+${fmt(r.credits)} credits` : 'Not enough Thread'); }
  closeOverlay(); renderWallet(); renderTicker(); rerender();
}

route('atelier', () => {
  const s = state();
  return `<div class="page-head"><h1>Shop</h1></div>
  <div class="filters" style="border-bottom:0">${[['today', 'Today'], ['energy', 'Energy & fabric'], ['thread', 'Thread'], ['edit', 'The Edit'], ['drops', 'Sets'], ['capsule', 'Capsule']].map(([k, l]) => `<button class="chip ${tab === k ? 'fill' : ''}" data-atab="${k}">${l}</button>`).join('')}</div>
  ${tab === 'today' ? todayView(s) : tab === 'thread' ? threadView(s) : tab === 'energy' ? energyView(s) : tab === 'edit' ? editGrid(s) : tab === 'drops' ? drops(s) : capsule(s)}`;
});

document.addEventListener('click', (e) => {
  const t = e.target;
  const at = t.closest('[data-atab]'); if (at) { tab = at.dataset.atab; rerender(); return; }
  const es = t.closest('[data-eslot]'); if (es) { editSlot = es.dataset.eslot; editPage = 0; rerender(); return; }
  const ep = t.closest('[data-epage]'); if (ep) { editPage = +ep.dataset.epage; rerender(); return; }
  const sb = t.closest('[data-shop-buy]'); if (sb && !sb.disabled) { overlay(confirmSheet(sb.dataset.shopBuy)); return; }
  const cf = t.closest('[data-confirm]'); if (cf) { execute(cf.dataset.confirm); return; }
  const rs = t.closest('[data-from-studio][data-reset-run], [data-from-studio][data-reset-ticket]'); if (rs) { const id = rs.dataset.resetRun || rs.dataset.resetTicket; const r = resetFabricRun(id, !!rs.dataset.resetTicket); toast(r.ok ? (r.ticket ? 'Ticket used. One more run.' : `Run reset for ${r.price} Thread`) : r.reason === 'funds' ? 'Not enough Thread' : r.reason === 'tickets' ? 'No tickets' : 'No more resets today'); closeOverlay(); renderWallet(); rerender(); return; }
  if (t.closest('[data-signin]')) { const r = signIn(); toast(r.ok ? 'Signed in. Rewards added.' : 'Already signed in today'); renderWallet(); rerender(); return; }
  const g = t.closest('[data-gift]'); if (g) { const r = claimGift(g.dataset.gift); toast(r.ok ? `+${r.energy} energy` : 'Not open yet'); renderWallet(); rerender(); return; }
  if (t.closest('[data-claim-monthly]')) { const r = claimMonthly(); toast(r.ok ? `+${r.thread} Thread` : 'Already claimed'); renderWallet(); rerender(); return; }
  if (t.closest('[data-refill]')) { const r = refillEnergy(); toast(r.ok ? `Energy refilled for ${r.price} Thread` : `Needs ${r.price} Thread`); renderWallet(); if (t.closest('.offer')) closeOverlay(); rerender(); return; }
  const b = t.closest('[data-buy]'); if (b) { const r = buy(b.dataset.buy, 'credits'); toast(r.ok ? `Bought ${item(b.dataset.buy).name} for CR ${r.price}` : r.reason === 'funds' ? 'Not enough credits' : 'Already owned'); if (t.closest('[data-close-drawer]')) closeOverlay(); rerender(); return; }
  const bt = t.closest('[data-buy-thread]'); if (bt) { const r = buy(bt.dataset.buyThread, 'thread'); toast(r.ok ? `Bought ${item(bt.dataset.buyThread).name} for ${r.price} Thread` : r.reason === 'funds' ? 'Not enough Thread' : 'Already owned'); if (t.closest('[data-close-drawer]')) closeOverlay(); rerender(); renderTicker(); return; }
  const bs = t.closest('[data-buy-set]'); if (bs) { const r = buyDropSet(bs.dataset.buySet); toast(r.ok ? `Set bought for ${r.price} Thread` : r.reason === 'funds' ? `Needs ${r.price} Thread` : 'Already complete'); rerender(); return; }
  if (t.closest('[data-pull]')) { const r = pullCapsule(); if (r.ok) { lastPull = r.item; toast(`${r.item.name} · ${r.item.rarity}`); } else toast(r.reason === 'funds' ? 'Not enough Thread' : 'Pool complete'); rerender(); return; }
  const si = t.closest('[data-shop-item]'); if (si) { const it = item(si.dataset.shopItem); const buyHtml = it.source === 'atelier' ? `<button class="btn primary block" data-buy="${it.id}" data-close-drawer>Buy · CR ${fmt(it.price)}</button>` : `<button class="btn primary block" data-buy-thread="${it.id}" data-close-drawer>Buy · ${threadPrice(it)} Thread</button>`; overlay(itemDrawer(it, { buyHtml })); return; }
});
