// Game state: wardrobe (10k catalogue, owned set), currencies, energy, chapters/levels, sets, swatches,
// workshop (craft / dismantle / dye / print), capsule, player model. Persists to localStorage when available.
import { CATALOG, BY_ID, STARTER_IDS, SETS, SET_BY_ID } from '../data/catalog.js';
import { CHAPTERS, NOVELS, chaptersOf, buildLevels } from '../data/chapters.js';
import { TWISTS } from '../data/briefs.js';
import { SWATCHES, COLORWAYS, PRINTS } from '../data/generator.js';
import { scoreLook, DIMS } from './score.js';
import { opponentFor, gradeByMargin } from './bots.js';

export const { levels: LEVELS, order: LEVEL_ORDER } = buildLevels(SETS);
export { CHAPTERS, NOVELS, chaptersOf, SETS, SET_BY_ID, SWATCHES };
export const CHAPTER_BY_ID = Object.fromEntries(CHAPTERS.map((c) => [c.id, c]));

const KEY = 'serve.v5';
const listeners = new Set();
export const ENERGY = { base: 64, perLevel: 4, cap: 320, regenMs: 10 * 60 * 1000, cost: 8, hardCost: 12, princessCost: 12, get max() { return maxEnergy(); } };
// three ways to play every level, and the secret one
export const MODES = { easy: { label: 'Easy', cost: 6, credit: 0.6, xp: 0.7 }, normal: { label: 'Normal', cost: 8, credit: 1, xp: 1 }, hard: { label: 'Hard', cost: 12, credit: 1.5, xp: 1.3 }, secret: { label: 'Secret', cost: 12, credit: 2, xp: 1.6 } };
export const maxEnergy = () => Math.min(ENERGY.cap, ENERGY.base + ((S?.level || 1) - 1) * ENERGY.perLevel);
export const xpToNext = (level) => (level <= 20 ? 80 + (level - 1) * 30 : 650 + (level - 20) * 15);
const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

const fresh = () => ({
  credits: 800, thread: 120,
  level: 1, xp: 0, spentUSD: 0, receipts: [], playerId: null,
  shop: { daily: null, refills: { day: null, n: 0 }, fabrics: { day: null, n: 0 }, monthly: null, monthlyClaimed: null, firstBuy: {}, signin: { last: null, streak: 0 }, gifts: {} },
  runs: { day: null, byLevel: {} }, tickets: 0,
  owned: [...STARTER_IDS],
  avatar: { name: '', skin: 'fair', hairStyle: 'longWavy', hairColor: 'blonde', lip: '#E2527F', eyes: 'blue' },
  results: {},          // levelId -> { easy: R, normal: R, hard: R, secret: R } where R = { best, grade, attempts, passed, failsInRow }
  history: [],
  skill: 68,
  streak: 0, lastDay: null, dailyDone: {},
  looks: [],
  capsule: { pulls: 0, sincePity: 0 },
  dyes: {},             // itemId -> { color?, print? }
  swatches: { cotton: 6, denim: 2, leather: 1, dye: 2, print: 1 },
  energy: 64, energyAt: Date.now(),
  seen: { intro: false },
  setsClaimed: {},
  chapterBonus: {}, perfectBonus: {},
  createdAt: Date.now(),
});

let S = load();
let OWNED = new Set(S.owned);

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const parsed = JSON.parse(raw); return { ...fresh(), ...parsed }; }
  } catch (e) { /* storage may be unavailable */ }
  return fresh();
}
export function save() {
  S.owned = [...OWNED];
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
  for (const fn of listeners) fn(S);
}
export const state = () => S;
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export function reset() { S = fresh(); OWNED = new Set(S.owned); save(); }

/* ---------------- energy ---------------- */
export function energy() {
  const now = Date.now();
  const max = maxEnergy();
  const gained = Math.floor((now - S.energyAt) / ENERGY.regenMs);
  if (gained > 0 && S.energy < max) { S.energy = Math.min(max, S.energy + gained); S.energyAt = S.energyAt + gained * ENERGY.regenMs; }
  if (S.energy >= max) S.energyAt = now;
  return S.energy;
}
export function spendEnergy(n) { if (energy() < n) return false; S.energy -= n; if (S.energy < maxEnergy() && S.energyAt > Date.now()) S.energyAt = Date.now(); save(); return true; }
export function addEnergy(n) { energy(); S.energy += n; save(); }
export const energyEtaMin = () => (S.energy >= maxEnergy() ? 0 : Math.ceil((ENERGY.regenMs - ((Date.now() - S.energyAt) % ENERGY.regenMs)) / 60000));
// Buying energy with Thread: the price climbs with each refill bought today and resets at midnight.
export const REFILL_LADDER = [30, 30, 60, 60, 90, 120, 150, 200];
function refillsToday() { if (S.shop.refills.day !== dayKey()) S.shop.refills = { day: dayKey(), n: 0 }; return S.shop.refills.n; }
export const refillPrice = () => REFILL_LADDER[Math.min(refillsToday(), REFILL_LADDER.length - 1)];
export const refillsBoughtToday = () => refillsToday();
export function refillEnergy() {
  const price = refillPrice();
  if (S.thread < price) return { ok: false, price };
  S.thread -= price; S.shop.refills.n++; addEnergy(maxEnergy());
  return { ok: true, price, amount: maxEnergy() };
}

/* ---------------- level and XP ---------------- */
export function gainXP(n) {
  S.xp += n;
  const ups = [];
  while (S.xp >= xpToNext(S.level)) {
    S.xp -= xpToNext(S.level); S.level++;
    const credits = 100 + S.level * 20;
    S.credits += credits;
    const thread = S.level % 5 === 0 ? 60 : 0;
    S.thread += thread;
    energy(); S.energy = Math.max(S.energy, maxEnergy());
    ups.push({ level: S.level, credits, thread, energyMax: maxEnergy() });
  }
  save();
  return ups;
}

/* ---------------- store (prototype: nothing is charged) ---------------- */
export const USD = (n) => `$${n.toFixed(2)}`;
export const THREAD_TIERS = [
  { id: 't1', usd: 0.99, thread: 60 }, { id: 't2', usd: 4.99, thread: 330 }, { id: 't3', usd: 9.99, thread: 700 },
  { id: 't4', usd: 19.99, thread: 1500 }, { id: 't5', usd: 49.99, thread: 4000 }, { id: 't6', usd: 99.99, thread: 8500 },
];
export const DAILY_BUNDLE = { usd: 4.99, thread: 150, swatches: 8, gold: 2, dye: 1, tickets: 6 };
// Fabric runs: Princess attempts are where fabric drops. Three free per level per day; more cost Thread or a ticket.
export const FABRIC_RUNS = { free: 3, resetPrice: 20, maxResets: 6, dropChance: 0.4 };
export const MONTHLY = { usd: 4.99, now: 300, daily: 90, days: 30 };
export const FABRIC_PACK = { thread: 100, count: 5, dailyLimit: 4 };
export const CREDIT_PACKS = [{ id: 'c1', thread: 60, credits: 1000 }, { id: 'c2', thread: 300, credits: 6000 }];
export const GIFT_WINDOWS = [{ id: 'noon', from: 12, to: 14, energy: 30 }, { id: 'evening', from: 18, to: 20, energy: 30 }];
export const SIGNIN = [{ credits: 200 }, { swatch: 2 }, { credits: 300 }, { dye: 1 }, { swatch: 3 }, { credits: 500 }, { thread: 90 }];

function runsFor(levelId) { if (S.runs.day !== dayKey()) S.runs = { day: dayKey(), byLevel: {} }; return (S.runs.byLevel[levelId] ||= { used: 0, resets: 0 }); }
export function fabricRuns(levelId) {
  const r = runsFor(levelId);
  const allowance = FABRIC_RUNS.free + r.resets;
  return { used: r.used, free: FABRIC_RUNS.free, resets: r.resets, maxResets: FABRIC_RUNS.maxResets, allowance, left: Math.max(0, allowance - r.used), resetPrice: FABRIC_RUNS.resetPrice, tickets: S.tickets, canReset: r.resets < FABRIC_RUNS.maxResets };
}
export function resetFabricRun(levelId, useTicket = false) {
  const r = runsFor(levelId);
  if (r.resets >= FABRIC_RUNS.maxResets) return { ok: false, reason: 'max' };
  if (useTicket) { if (S.tickets < 1) return { ok: false, reason: 'tickets' }; S.tickets--; }
  else { if (S.thread < FABRIC_RUNS.resetPrice) return { ok: false, reason: 'funds' }; S.thread -= FABRIC_RUNS.resetPrice; }
  r.resets++; save();
  return { ok: true, ticket: useTicket, price: useTicket ? 0 : FABRIC_RUNS.resetPrice };
}
export const spentUSD = () => S.spentUSD;
export function buyThread(tierId) {
  const t = THREAD_TIERS.find((x) => x.id === tierId); if (!t) return { ok: false };
  const first = !S.shop.firstBuy[tierId];
  const amount = first ? t.thread * 2 : t.thread;
  S.thread += amount; S.spentUSD += t.usd; S.shop.firstBuy[tierId] = true; save();
  return { ok: true, amount, first, usd: t.usd };
}
export const dailyBundleBought = () => S.shop.daily === dayKey();
export function buyDailyBundle(chapterSwatches = ['cotton', 'denim', 'leather']) {
  if (dailyBundleBought()) return { ok: false, reason: 'bought' };
  const got = { energy: maxEnergy(), thread: DAILY_BUNDLE.thread, swatches: {}, gold: DAILY_BUNDLE.gold, dye: DAILY_BUNDLE.dye, tickets: DAILY_BUNDLE.tickets };
  addEnergy(got.energy); S.thread += got.thread; S.tickets += got.tickets;
  for (let i = 0; i < DAILY_BUNDLE.swatches; i++) { const k = chapterSwatches[i % chapterSwatches.length]; S.swatches[k] = (S.swatches[k] || 0) + 1; got.swatches[k] = (got.swatches[k] || 0) + 1; }
  S.swatches.gold = (S.swatches.gold || 0) + got.gold; S.swatches.dye = (S.swatches.dye || 0) + got.dye;
  S.shop.daily = dayKey(); S.spentUSD += DAILY_BUNDLE.usd; save();
  return { ok: true, got };
}
export const monthlyActive = () => !!S.shop.monthly && S.shop.monthly > Date.now();
export const monthlyDaysLeft = () => (monthlyActive() ? Math.ceil((S.shop.monthly - Date.now()) / 86400000) : 0);
export function buyMonthly() {
  const base = monthlyActive() ? S.shop.monthly : Date.now();
  S.shop.monthly = base + MONTHLY.days * 86400000; S.thread += MONTHLY.now; S.spentUSD += MONTHLY.usd; save();
  return { ok: true, thread: MONTHLY.now };
}
export const monthlyClaimable = () => monthlyActive() && S.shop.monthlyClaimed !== dayKey();
export function claimMonthly() { if (!monthlyClaimable()) return { ok: false }; S.thread += MONTHLY.daily; S.shop.monthlyClaimed = dayKey(); save(); return { ok: true, thread: MONTHLY.daily }; }
function fabricsToday() { if (S.shop.fabrics.day !== dayKey()) S.shop.fabrics = { day: dayKey(), n: 0 }; return S.shop.fabrics.n; }
export const fabricPacksLeft = () => Math.max(0, FABRIC_PACK.dailyLimit - fabricsToday());
export function buyFabric(kind) {
  if (!fabricPacksLeft()) return { ok: false, reason: 'limit' };
  if (S.thread < FABRIC_PACK.thread) return { ok: false, reason: 'funds' };
  S.thread -= FABRIC_PACK.thread; S.shop.fabrics.n++; S.swatches[kind] = (S.swatches[kind] || 0) + FABRIC_PACK.count; save();
  return { ok: true, kind, count: FABRIC_PACK.count };
}
export function buyCredits(packId) {
  const p = CREDIT_PACKS.find((x) => x.id === packId); if (!p) return { ok: false };
  if (S.thread < p.thread) return { ok: false, reason: 'funds' };
  S.thread -= p.thread; S.credits += p.credits; save(); return { ok: true, credits: p.credits };
}
export function giftState(id) {
  const g = GIFT_WINDOWS.find((x) => x.id === id);
  const h = new Date().getHours();
  const open = h >= g.from && h < g.to;
  const claimed = S.shop.gifts[id] === dayKey();
  return { ...g, open, claimed, claimable: open && !claimed };
}
export function claimGift(id) { const g = giftState(id); if (!g.claimable) return { ok: false }; addEnergy(g.energy); S.shop.gifts[id] = dayKey(); save(); return { ok: true, energy: g.energy }; }
export function signinState() {
  const today = dayKey(), y = dayKey(new Date(Date.now() - 86400000));
  const done = S.shop.signin.last === today;
  const streak = S.shop.signin.last === today || S.shop.signin.last === y ? S.shop.signin.streak : 0;
  return { done, streak, day: done ? ((streak - 1) % 7) : (streak % 7) };
}
export function signIn() {
  const st = signinState(); if (st.done) return { ok: false };
  const reward = SIGNIN[st.day];
  if (reward.credits) S.credits += reward.credits;
  if (reward.thread) S.thread += reward.thread;
  if (reward.dye) S.swatches.dye = (S.swatches.dye || 0) + reward.dye;
  if (reward.swatch) { const ch = CHAPTERS.find((c) => c.id === (nextOpenLevel()?.chapter || 'c1')); for (let i = 0; i < reward.swatch; i++) { const k = ch.swatches[i % ch.swatches.length]; S.swatches[k] = (S.swatches[k] || 0) + 1; } }
  S.shop.signin = { last: dayKey(), streak: st.streak + 1 }; save();
  return { ok: true, reward, day: st.day };
}

/* ---------------- wardrobe ---------------- */
export const owns = (id) => OWNED.has(id);
export function item(id) {
  const base = BY_ID[id];
  if (!base) return null;
  const mod = S.dyes[id];
  if (!mod) return base;
  const out = { ...base, dyed: true };
  if (mod.color) { out.color = mod.color; out.colors = [mod.color, ...(base.colors.slice(1))]; }
  if (mod.print !== undefined) { out.print = mod.print || undefined; out.color2 = mod.print ? (mod.color2 || '#F3F0E8') : undefined; out.colors = mod.print ? [out.color, out.color2] : [out.color]; }
  return out;
}
export const inventory = () => [...OWNED].map(item).filter(Boolean);
export const ownedCount = () => OWNED.size;
export function grant(id) { if (!OWNED.has(id) && BY_ID[id]) { OWNED.add(id); save(); return true; } return false; }

export function buy(id, currency = 'credits') {
  const it = BY_ID[id];
  if (!it || OWNED.has(id)) return { ok: false, reason: 'owned' };
  const price = currency === 'thread' ? threadPrice(it) : it.price;
  if (S[currency] < price) return { ok: false, reason: 'funds' };
  S[currency] -= price;
  OWNED.add(id);
  save();
  return { ok: true, price };
}
export const threadPrice = (it) => (it.rarity === 'icon' ? 180 : it.rarity === 'archive' ? 90 : 60);

/* ---------------- workshop: dye, print, dismantle, craft ---------------- */
export const DYE_COST = { credits: 80, dye: 1 };
export const PRINT_COST = { credits: 140, print: 1 };
export function dye(id, hex) {
  if (!OWNED.has(id) || S.credits < DYE_COST.credits || (S.swatches.dye || 0) < DYE_COST.dye) return { ok: false };
  S.credits -= DYE_COST.credits; S.swatches.dye -= DYE_COST.dye;
  S.dyes[id] = { ...(S.dyes[id] || {}), color: hex }; save(); return { ok: true };
}
export function applyPrint(id, printKey, color2) {
  if (!OWNED.has(id) || S.credits < PRINT_COST.credits || (S.swatches.print || 0) < PRINT_COST.print) return { ok: false };
  S.credits -= PRINT_COST.credits; S.swatches.print -= PRINT_COST.print;
  S.dyes[id] = { ...(S.dyes[id] || {}), print: printKey || null, color2 }; save(); return { ok: true };
}
export function restore(id) { delete S.dyes[id]; save(); }

// Dismantle: destroy an owned, non-starter piece for its swatches and 30% of its price.
export function dismantle(id) {
  const it = BY_ID[id];
  if (!it || !OWNED.has(id) || it.source === 'starter' || it.slot === 'hair') return { ok: false };
  OWNED.delete(id); delete S.dyes[id];
  const got = {};
  for (const [k, n] of Object.entries(it.swatches || { cotton: 1 })) { S.swatches[k] = (S.swatches[k] || 0) + n; got[k] = n; }
  if (it.metal) { S.swatches.gold = (S.swatches.gold || 0) + 1; got.gold = 1; }
  if (Math.random() < 0.3) { S.swatches.dye = (S.swatches.dye || 0) + 1; got.dye = 1; }
  const credits = Math.round(it.price * 0.3);
  S.credits += credits; save();
  return { ok: true, swatches: got, credits };
}
// Craft: a recipe is any catalogue piece whose chapter has been reached; cost = swatches × 2 and 60% of its price.
export function recipeFor(id) {
  const it = BY_ID[id];
  if (!it) return null;
  const need = {};
  for (const [k, n] of Object.entries(it.swatches || { cotton: 1 })) need[k] = n * 2;
  if (it.prt) need.print = (need.print || 0) + 1;
  if (it.metal) need.gold = (need.gold || 0) + 1;
  if (it.rarity === 'archive' || it.rarity === 'icon') need.gold = (need.gold || 0) + 1;
  return { need, credits: Math.round(it.price * 0.6 / 10) * 10 };
}
export function canCraft(id) {
  const r = recipeFor(id);
  if (!r || OWNED.has(id) || BY_ID[id].slot === 'hair') return false;
  if (S.credits < r.credits) return false;
  return Object.entries(r.need).every(([k, n]) => (S.swatches[k] || 0) >= n);
}
export function craft(id) {
  if (!canCraft(id)) return { ok: false };
  const r = recipeFor(id);
  for (const [k, n] of Object.entries(r.need)) S.swatches[k] -= n;
  S.credits -= r.credits; OWNED.add(id); save();
  return { ok: true, recipe: r };
}
export function craftableNow() { return CATALOG.filter((i) => !OWNED.has(i.id) && i.slot !== 'hair' && canCraft(i.id)); }

/* ---------------- sets ---------------- */
export function setProgress(setId) {
  const s = SET_BY_ID[setId];
  if (!s) return null;
  const have = s.pieceIds.filter((id) => OWNED.has(id)).length;
  return { have, total: s.pieceIds.length, complete: have === s.pieceIds.length, claimed: !!S.setsClaimed[setId] };
}
export function claimSet(setId) {
  const p = setProgress(setId);
  if (!p || !p.complete || p.claimed) return { ok: false };
  S.setsClaimed[setId] = true; S.thread += 60; S.credits += 400; save();
  return { ok: true, thread: 60, credits: 400 };
}

/* ---------------- chapters, levels, modes, perfection ---------------- */
export const levelById = (id) => LEVELS[id];
const R0 = () => ({ best: 0, grade: null, attempts: 0, passed: false, failsInRow: 0 });
export const resultOf = (levelId, mode) => S.results[levelId]?.[mode] || null;
export const levelCleared = (levelId) => !!(resultOf(levelId, 'normal')?.passed || resultOf(levelId, 'hard')?.passed || resultOf(levelId, 'secret')?.passed);
export function chapterCleared(ch) { return ch.levels.every((_, i) => levelCleared(`${ch.id}-${i + 1}`)); }
export function chapterUnlocked(ch) {
  if (!ch.unlock) return true;
  const prev = CHAPTER_BY_ID[ch.unlock];
  return chapterCleared(prev) && S.level >= (ch.minLevel || 1);
}
export function levelUnlocked(levelId) {
  const lv = LEVELS[levelId];
  if (!lv) return false;
  const ch = CHAPTER_BY_ID[lv.chapter];
  if (!chapterUnlocked(ch)) return false;
  if (lv.secret) return chapterPerfect(ch);
  if (lv.index === 1) return true;
  return levelCleared(`${ch.id}-${lv.index - 1}`);
}
export function modeUnlocked(levelId, mode) {
  if (!levelUnlocked(levelId)) return false;
  if (mode === 'hard') return !!resultOf(levelId, 'normal')?.passed;
  return true;
}
// perfection: an S in every mode of every level opens the chapter's secret level
export function perfectCount(ch) {
  let have = 0;
  for (let i = 0; i < ch.levels.length; i++) for (const m of ['easy', 'normal', 'hard']) if (resultOf(`${ch.id}-${i + 1}`, m)?.grade === 'S') have++;
  return { have, total: ch.levels.length * 3 };
}
export function chapterPerfect(ch) { const p = perfectCount(ch); return p.have === p.total; }
export const secretUnlocked = (ch) => chapterPerfect(ch);
export function secretProgress(ch) {
  const lv = LEVELS[ch.secret];
  const total = lv?.drops?.length || 0;
  const owned = (lv?.drops || []).filter((id) => OWNED.has(id)).length;
  return { owned, total, cleared: !!resultOf(ch.secret, 'secret')?.passed, unlocked: secretUnlocked(ch) };
}
export const chapterStars = (chId) => perfectCount(CHAPTER_BY_ID[chId]).have;
export function nextOpenLevel() {
  for (const id of LEVEL_ORDER) if (levelUnlocked(id) && !levelCleared(id)) return LEVELS[id];
  return null;
}
export function novelProgress(n) {
  const chs = chaptersOf(n);
  const cleared = chs.filter(chapterCleared).length;
  const perfect = chs.filter(chapterPerfect).length;
  const secrets = chs.filter((c) => resultOf(c.secret, 'secret')?.passed).length;
  const open = chs.filter(chapterUnlocked).length;
  return { chapters: chs.length, cleared, perfect, secrets, open };
}
export function overall() {
  let levels = 0, cleared = 0, s = 0, sTotal = 0, secrets = 0, perfect = 0;
  for (const ch of CHAPTERS) {
    for (let i = 0; i < ch.levels.length; i++) { const id = `${ch.id}-${i + 1}`; levels++; if (levelCleared(id)) cleared++; for (const m of ['easy', 'normal', 'hard']) { sTotal++; if (resultOf(id, m)?.grade === 'S') s++; } }
    if (resultOf(ch.secret, 'secret')?.passed) secrets++;
    if (chapterPerfect(ch)) perfect++;
  }
  return { levels, cleared, s, sTotal, secrets, perfect, chapters: CHAPTERS.length };
}

// The brief handed to the engine for a level in a mode: easy (−8, wider tolerance, hints), normal, hard (+8, a twist,
// fabric drops), secret (the chapter at its strictest, exclusive drops). Adaptation is printed on the brief.
export function levelBrief(levelId, mode = 'normal') {
  const lv = LEVELS[levelId];
  if (!lv) return null;
  if (lv.secret) mode = 'secret';
  const r = resultOf(levelId, mode) || {};
  const out = { ...lv, mode, pass: lv.pass, adapt: null, id: lv.id, season: lv.chapter };
  const addTwist = (t, kind, text, bonus = 0) => {
    out.twist = t; out.adapt = { kind, text, bonus };
    if (t.forbid) out.forbid = { ...(lv.forbid || {}), ...Object.fromEntries(Object.entries(t.forbid).map(([k, v]) => [k, [...(lv.forbid?.[k] || []), ...v]])) };
    if (t.mood) out.mood = [...lv.mood, ...t.mood];
  };
  if (mode === 'easy') {
    out.pass = lv.easyPass; out.tolerance = (lv.tolerance ?? 1) + 1; out.assist = true;
    out.adapt = { kind: 'easy', text: 'Easy: a gentle rival, a looser dress code, live hints on', bonus: 0 };
  } else if (mode === 'hard') {
    out.pass = lv.hardPass;
    addTwist(TWISTS[(hashStr(lv.id) + 1) % TWISTS.length], 'hard', 'Hard: a sharp rival, plus a twist. Fabric drops here.');
  } else if (mode === 'secret') {
    addTwist(TWISTS[(hashStr(lv.id) + 2) % TWISTS.length], 'secret', 'Secret: the strictest rival, a twist, and the exclusive set, one piece per clear.');
  } else if (lv.tutorial) {
    /* the first level stays exactly as written */
  } else if (S.skill >= lv.pass + 12 && !r.passed && Object.values(S.results).filter((x) => x.normal?.passed).length >= 3) {
    addTwist(TWISTS[(hashStr(lv.id) + S.history.length) % TWISTS.length], 'twist', TWISTS[(hashStr(lv.id) + S.history.length) % TWISTS.length].text, 100);
  } else if ((r.failsInRow || 0) >= 2 && !r.passed) {
    out.pass = Math.max(50, lv.pass - 5); out.assist = true; out.adapt = { kind: 'assist', text: 'A gentler rival this time, and live hints on', bonus: 0 };
  }
  return out;
}
function hashStr(s) { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }

export function evaluate(look, brief) {
  const r = scoreLook(look, brief);
  if (brief.twist?.test && !brief.twist.test(look)) { r.twistFailed = true; r.total = Math.max(0, r.total - 10); r.critique.unshift(`Twist missed: ${brief.twist.text}.`); }
  if (brief.forbid?.prints && Object.values(look).some((i) => i && i.print)) { r.total = Math.max(0, r.total - 8); r.critique.unshift('The brief said no prints.'); }
  if (brief.forbid?.heels && look.shoes && look.shoes.heel > 0) { r.total = Math.max(0, r.total - 8); r.critique.unshift('The brief said flats only.'); }
  if (brief.maxWeight && Object.values(look).some((i) => i && i.weight > brief.maxWeight && ['top', 'bottom', 'dress', 'outer', 'shoes'].includes(i.slot))) { r.total = Math.max(0, r.total - 8); r.critique.unshift('Nothing heavier than linen, the brief said.'); }
  if (brief.exactAccessories && ['head', 'hairAcc', 'eyes', 'ears', 'neck', 'bracelet', 'belt', 'gloves', 'scarf', 'handheld', 'bag'].filter((s) => look[s]).length !== brief.exactAccessories) { r.total = Math.max(0, r.total - 6); r.critique.unshift(`The brief asked for exactly ${brief.exactAccessories} accessories.`); }
  return r;
}

export function submit(look, brief) {
  const mode = brief.mode || 'normal';
  const M = MODES[mode] || MODES.normal;
  const cost = brief.tutorial ? 0 : M.cost;
  if (mode === 'hard' && !fabricRuns(brief.id).left) return { ok: false, reason: 'attempts' };
  if (cost && !spendEnergy(cost)) return { ok: false, reason: 'energy' };
  if (mode === 'hard') runsFor(brief.id).used++;
  const r = evaluate(look, brief);
  const key = brief.id;
  const prev = S.results[key] || {};
  const prevMode = prev[mode] || R0();
  // judged against another stylist at about your level; the margin decides the grade
  const opp = opponentFor(brief, { level: S.level, skill: S.skill, mode, attempt: prevMode.attempts || 0 });
  const margin = r.total - opp.total;
  const passed = margin >= 0;
  r.grade = gradeByMargin(margin, r.total, brief.pass);
  const firstPass = passed && !prevMode.passed;
  const firstEver = passed && !levelCleared(key) && mode !== 'easy';
  const firstS = r.grade === 'S' && prevMode.grade !== 'S';
  const ch = CHAPTER_BY_ID[brief.chapter];
  const perfectBefore = chapterPerfect(ch);
  const rewards = { credits: 0, thread: 0, items: [], swatches: {}, bonus: [], xp: 0, levelUps: [], perfectNow: false, firstS, mode, opponent: opp, margin };
  if (passed) {
    const mult = firstPass ? 1 : 0.3;
    let credits = Math.round(brief.credits * M.credit * mult);
    if (r.grade === 'S') { credits = Math.round(credits * 1.5); rewards.bonus.push("Editor's pick +50%"); }
    else if (r.grade === 'A') { credits = Math.round(credits * 1.2); rewards.bonus.push('Booked +20%'); }
    if (brief.adapt?.kind === 'twist' && !r.twistFailed && firstPass) { credits += brief.adapt.bonus; rewards.bonus.push(`Twist +${brief.adapt.bonus}`); }
    rewards.credits = credits; S.credits += credits;
    // drops: the level's piece the first time it is cleared on normal or hard; the secret level drops its set one piece per clear
    if (mode === 'secret') { const nextPiece = (brief.drops || []).find((id) => !OWNED.has(id)); if (nextPiece && grantSilently(nextPiece)) rewards.items.push(nextPiece); }
    else if (firstEver && brief.item && grantSilently(brief.item)) rewards.items.push(brief.item);
    else if (!firstPass && mode !== 'easy' && brief.drops?.length && Math.random() < 0.35) { const pool = brief.drops.filter((id) => !OWNED.has(id)); if (pool.length) { const id = pool[Math.floor(Math.random() * pool.length)]; grantSilently(id); rewards.items.push(id); } }
    // fabric: two on the first clear of a level (normal or hard), otherwise only on fabric runs (hard), 40% chance of two, +1 for an S
    const fab = brief.fabric || brief.swatches[0];
    const nSw = mode === 'hard' ? (Math.random() < FABRIC_RUNS.dropChance ? 2 : 0) + (r.grade === 'S' ? 1 : 0) + (firstEver ? 2 : 0) : firstEver ? 2 + (r.grade === 'S' ? 1 : 0) : 0;
    if (nSw) { S.swatches[fab] = (S.swatches[fab] || 0) + nSw; rewards.swatches[fab] = nSw; }
    if (mode === 'hard' && !nSw) rewards.bonus.push('No fabric this run');
    if (firstEver && Math.random() < 0.35) { S.swatches.dye = (S.swatches.dye || 0) + 1; rewards.swatches.dye = 1; }
    if (firstPass && mode === 'hard') { S.swatches.print = (S.swatches.print || 0) + 1; rewards.swatches.print = 1; }
    touchStreak();
  }
  const modeRes = { best: Math.max(prevMode.best || 0, r.total), grade: betterGrade(prevMode.grade, r.grade), attempts: (prevMode.attempts || 0) + 1, passed: prevMode.passed || passed, failsInRow: passed ? 0 : (prevMode.failsInRow || 0) + 1 };
  S.results[key] = { ...prev, [mode]: modeRes };
  // chapter bonuses: cleared (+90 Thread, hard unlocks), perfect (+150 Thread, the secret level opens)
  if (firstEver && ch && chapterCleared(ch) && !S.chapterBonus[ch.id]) { S.chapterBonus[ch.id] = true; S.thread += 90; rewards.thread += 90; rewards.bonus.push(`Chapter ${ch.number} cleared: +90 Thread`); }
  if (ch && !perfectBefore && chapterPerfect(ch) && !S.perfectBonus[ch.id]) { S.perfectBonus[ch.id] = true; S.thread += 150; rewards.thread += 150; rewards.perfectNow = true; rewards.bonus.push('Perfect chapter: +150 Thread, secret level open'); }
  if (!brief.tutorial) S.skill = Math.round((S.skill * 0.7 + r.total * 0.3) * 10) / 10;
  const xp = Math.round((passed ? (firstPass ? 40 + r.total / 5 : 8 + r.total / 8) : 4 + r.total / 10) * M.xp);
  rewards.xp = xp;
  rewards.levelUps = gainXP(xp);
  rewards.perfect = perfectCount(ch);
  S.history.unshift({ briefId: brief.id, title: brief.title, total: r.total, grade: r.grade, vs: opp.bot.name, margin, dims: Object.fromEntries(r.dims.map((d) => [d.key, d.score])), lead: r.lead, palette: r.palette, items: Object.fromEntries(Object.entries(look).filter(([, v]) => v).map(([k, v]) => [k, v.id])), date: Date.now(), mode });
  S.history = S.history.slice(0, 80);
  save();
  return { ...r, ok: true, passed, firstPass, rewards, pass: brief.pass };
}
function grantSilently(id) { if (!OWNED.has(id) && BY_ID[id]) { OWNED.add(id); return true; } return false; }
const GR = { D: 0, C: 1, B: 2, A: 3, S: 4 };
const betterGrade = (a, b) => (!a ? b : GR[b] > GR[a] ? b : a);
function touchStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (S.lastDay === today) return;
  S.streak = S.lastDay === y ? S.streak + 1 : 1;
  S.lastDay = today;
}

/* ---------------- looks ---------------- */
export function saveLook(look, name, score, briefId) {
  const items = Object.fromEntries(Object.entries(look).filter(([, v]) => v).map(([k, v]) => [k, v.id]));
  S.looks.unshift({ id: 'L' + Date.now().toString(36), name, items, score, briefId, date: Date.now() });
  S.looks = S.looks.slice(0, 40); save();
}
export function deleteLook(id) { S.looks = S.looks.filter((l) => l.id !== id); save(); }
export const hydrate = (items) => Object.fromEntries(Object.entries(items).map(([k, id]) => [k, item(id)]).filter(([, v]) => v));

/* ---------------- capsule (honest blind box) ---------------- */
export const CAPSULE = {
  price: 30, pity: 12,
  odds: [['icon', 0.04], ['archive', 0.16], ['edit', 0.40], ['core', 0.40]],
  pool: () => CATALOG.filter((i) => i.slot !== 'hair' && i.slot !== 'makeup' && !i.set && (i.rarity !== 'core' || Math.abs(hashStr(i.id)) % 7 === 0)),
};
export function pullCapsule() {
  if (S.thread < CAPSULE.price) return { ok: false, reason: 'funds' };
  const pool = CAPSULE.pool();
  const unowned = pool.filter((i) => !OWNED.has(i.id));
  if (!unowned.length) return { ok: false, reason: 'complete' };
  S.thread -= CAPSULE.price; S.capsule.pulls++; S.capsule.sincePity++;
  let rarity;
  const hasIcon = unowned.some((i) => i.rarity === 'icon');
  if (S.capsule.sincePity >= CAPSULE.pity && hasIcon) rarity = 'icon';
  else { let r = Math.random(); for (const [k, p] of CAPSULE.odds) { if (r < p && unowned.some((i) => i.rarity === k)) { rarity = k; break; } r -= p; } if (!rarity) rarity = unowned[0].rarity; }
  const candidates = unowned.filter((i) => i.rarity === rarity);
  const src = candidates.length ? candidates : unowned;
  const got = src[Math.floor(Math.random() * src.length)];
  if (got.rarity === 'icon') S.capsule.sincePity = 0;
  OWNED.add(got.id); save();
  return { ok: true, item: got, pity: CAPSULE.pity - S.capsule.sincePity };
}

/* ---------------- drops (limited sets in the atelier) ---------------- */
export const DROPS = SETS.filter((s) => ['after_dark', 'chrome_season', 'le_smoking', 'gothic_romance'].includes(s.id)).map((s, i) => ({ id: s.id, house: s.house, title: s.name, line: s.line, items: s.pieceIds, setThread: (9 + i) * 30, endsIn: (3 + i * 2) * 86400000 + 4 * 3600000, returns: `Chapter ${String(9 + i).padStart(2, '0')}` }));
export function buyDropSet(dropId) {
  const d = DROPS.find((x) => x.id === dropId);
  const missing = d.items.filter((id) => !OWNED.has(id));
  if (!missing.length) return { ok: false, reason: 'owned' };
  const price = Math.max(1, Math.round(d.setThread * (missing.length / d.items.length)));
  if (S.thread < price) return { ok: false, reason: 'funds', price };
  S.thread -= price; for (const id of missing) OWNED.add(id); save();
  return { ok: true, price, items: missing };
}

/* ---------------- style DNA ---------------- */
export function styleDNA() {
  const h = S.history;
  const dimAvg = {};
  for (const d of DIMS) { const vals = h.map((x) => x.dims?.[d.key]).filter((v) => v != null); dimAvg[d.key] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length / d.max : null; }
  const leads = {}; for (const x of h) if (x.lead) leads[x.lead] = (leads[x.lead] || 0) + 1;
  const palettes = {}; for (const x of h) if (x.palette) palettes[x.palette] = (palettes[x.palette] || 0) + 1;
  const colors = {}; for (const x of h) for (const id of Object.values(x.items || {})) { const it = item(id); if (it?.colors?.[0] && it.slot !== 'hair' && it.slot !== 'makeup') colors[it.colors[0]] = (colors[it.colors[0]] || 0) + 1; }
  const avg = h.length ? h.reduce((a, b) => a + b.total, 0) / h.length : null;
  const best = h.length ? Math.max(...h.map((x) => x.total)) : null;
  const weakest = Object.entries(dimAvg).filter(([, v]) => v != null).sort((a, b) => a[1] - b[1])[0]?.[0];
  const strongest = Object.entries(dimAvg).filter(([, v]) => v != null).sort((a, b) => b[1] - a[1])[0]?.[0];
  return { dimAvg, leads: Object.entries(leads).sort((a, b) => b[1] - a[1]), palettes: Object.entries(palettes).sort((a, b) => b[1] - a[1]), colors: Object.entries(colors).sort((a, b) => b[1] - a[1]).slice(0, 8), avg, best, count: h.length, weakest, strongest };
}

export function setAvatar(patch) { S.avatar = { ...S.avatar, ...patch }; save(); }
export function markSeen(k) { S.seen[k] = true; save(); }
// real purchases: one receipt per Stripe Checkout Session, never redeemed twice
export const receipts = () => S.receipts || [];
export function recordReceipt(r) { S.receipts = S.receipts || []; if (S.receipts.some((x) => x.id === r.id)) return false; S.receipts.push(r); save(); return true; }
export function playerId() { if (!S.playerId) { S.playerId = 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); save(); } return S.playerId; }
export function grantThread(n, usd = 0) { S.thread += n; S.spentUSD += usd; save(); }
export { COLORWAYS, PRINTS };
