import { route, esc, fmt, rerender, toast, bars, overlay, closeOverlay, renderWallet, renderTicker, currentRoute } from './app.js';
import { accountOn, account, providers, signIn, signOut, deleteAccount, push, resolveConflict, describeConflict, mountGoogleButton, onAccount, accountBoot, PROVIDER_NAME } from '../engine/account.js';
import { PLATFORM, IS_APP } from '../data/platform.js';
import { selling } from '../engine/payments.js';
import { state, styleDNA, setAvatar, reset, hydrate, inventory, ownedCount, SWATCHES, xpToNext, maxEnergy, energy, spentUSD, USD, NOVELS, chaptersOf, chapterUnlocked, chapterCleared, chapterPerfect, resultOf, overall } from '../engine/state.js';
import { OBJ } from './objects.js';
import { icon } from './icons.js';
import { CATALOG } from '../data/catalog.js';
import { AES } from '../data/catalog.js';
import { DIMS } from '../engine/score.js';
import { renderPim } from '../render/pim.js';
import { tierOf } from '../engine/score.js';
import { renderLook, SKIN, HAIR_COLORS } from '../render/figure.js';
import { thumb, clearThumbs } from './thumbs.js';

// One plain sentence about how the player dresses: favourite style, usual colours, best and weakest scoring area.
const STYLE_NAME = { coquette: 'coquette', ballet: 'balletcore', siren: 'office siren', quiet: 'quiet luxury', y2k: 'Y2K', sleaze: 'indie sleaze', fairy: 'fairy grunge', academia: 'dark academia', gorp: 'gorpcore', clean: 'clean girl', mob: 'mob wife', chrome: 'chrome', blokette: 'blokette', boho: 'boho' };
const DIM_WORD = { brief: 'matching the brief', palette: 'choosing colours', silhouette: 'balancing shapes', formality: 'matching the dress code', season: 'dressing for the weather', texture: 'mixing fabrics', focal: 'choosing a standout piece', complete: 'finishing an outfit', aesthetic: 'keeping to one style' };
// keys are the palette names from engine/color.js
const PALETTE_WORD = { 'all neutral': 'neutral colours', 'tonal neutrals': 'light and dark neutrals', 'flat neutrals': 'neutrals of one shade', monochrome: 'one colour from head to toe', 'neutral + accent': 'neutrals with one bright colour', analogous: 'colours that sit close together', complementary: 'colours that contrast', 'split pair': 'two different colours', 'adjacent clash': 'bold colour mixes', triadic: 'three bright colours', 'multi clash': 'lots of colours at once' };
const GR = { D: 0, C: 1, B: 2, A: 3, S: 4 };
const bestGrade = (s) => s.history.reduce((b, h) => (GR[h.grade] > GR[b] ? h.grade : b), s.history.length ? 'D' : '–');
function sentence(dna) {
  if (!dna.count) return 'Style a few outfits and this page will describe your personal style.';
  const lead = dna.leads[0]?.[0];
  const tpl = STYLE_NAME[lead] ? `Your favourite style is ${STYLE_NAME[lead]}, and you often dress in {palette}. You’re best at {strong}, and you could practise {weak}.` : 'You have a style of your own, and you often dress in {palette}. You’re best at {strong}, and you could practise {weak}.';
  const palKey = dna.palettes[0] ? dna.palettes[0][0] : 'tonal';
  const palette = PALETTE_WORD[palKey] || 'your own mix of colours';
  const strong = DIM_WORD[dna.strongest] || 'putting outfits together';
  const weak = DIM_WORD[dna.weakest] || 'finishing touches';
  return tpl.replace('{palette}', palette).replace('{strong}', strong).replace('{weak}', weak);
}

/* ---------- sign-in and saved progress ---------- */
const when = (t) => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'just now' : m < 60 ? `${m} minute${m === 1 ? '' : 's'} ago` : m < 1440 ? `${Math.round(m / 60)} hour${Math.round(m / 60) === 1 ? '' : 's'} ago` : `on ${new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`; };
const appleMark = () => (PLATFORM === 'ios' || /Mac|iPhone|iPad/.test(navigator.platform || '') ? '\uF8FF ' : '');
function accountPanel() {
  if (!accountOn()) return '';
  const a = account();
  if (!a) return `<section class="panel account"><div class="panel-title">${icon('check')} Save your progress</div>
    <p class="muted small">Sign in to keep your progress if you change phone or reinstall the game. Serve stores your progress with an account ID. It does not store your name or your email.</p>
    <div class="account-btns">${providers().map((p) => (p === 'google' && !IS_APP ? '<div class="gslot" data-google-slot></div>' : `<button class="btn block signin-${p}" data-signin-with="${p}">${p === 'apple' ? appleMark() : ''}Sign in with ${PROVIDER_NAME[p]}</button>`)).join('')}</div></section>`;
  const status = a.conflict ? 'This device and your account hold different progress. Choose which one to keep.' : a.dirty ? 'Your latest changes are waiting to be saved.' : a.savedAt ? `Your progress was saved ${when(a.savedAt)}.` : 'Your progress is being saved.';
  return `<section class="panel account"><div class="panel-title">${icon('check')} Signed in with ${esc(PROVIDER_NAME[a.provider] || a.provider)}</div>
    <p class="muted small" data-account-status>${esc(status)}</p>
    <div class="account-btns row">${a.conflict ? '<button class="btn small primary" data-account-choose>Choose</button>' : '<button class="btn small primary" data-save-now>Save now</button>'}<button class="btn small ghost" data-signout>Sign out</button><button class="btn small ghost" data-delete-account>Delete account</button></div></section>`;
}
const line = (x) => (x ? `level ${fmt(x.level || 1)}, ${fmt(x.cleared || 0)} level${x.cleared === 1 ? '' : 's'} cleared, ${fmt(x.thread || 0)} Thread` : 'saved progress');
function conflictSheet(c) {
  return `<div class="sheet-wrap" role="dialog" aria-label="Choose your progress"><div class="scrim" data-close-sheet></div><aside class="sheet confirm">
    <button class="close" data-close-sheet>Close ×</button>
    <div class="eyebrow">Two saved games</div><h2 class="display display-m">Which progress do you want to keep?</h2>
    <ul class="notes"><li><b>On this device:</b> ${esc(line(c.local))}.</li><li><b>In your account:</b> ${esc(line(c.cloud))}${c.at ? `, saved ${esc(when(c.at))}` : ''}.</li></ul>
    <p class="muted small">The one you do not choose is replaced and cannot be brought back.</p>
    <div class="sheet-actions"><button class="btn primary block" data-keep="cloud">Use the account’s progress</button><button class="btn block" data-keep="local">Keep this device’s progress</button><button class="btn ghost block" data-close-sheet>Decide later</button></div>
  </aside></div>`;
}
function deleteSheet() {
  return `<div class="sheet-wrap" role="dialog" aria-label="Delete account"><div class="scrim" data-close-sheet></div><aside class="sheet confirm">
    <button class="close" data-close-sheet>Close ×</button>
    <div class="eyebrow">Delete account</div><h2 class="display display-m">Delete your saved progress?</h2>
    <p>This deletes your account and the copy of your progress saved with it. It cannot be undone. The progress on this device stays until you reset it or remove the game.</p>
    <div class="sheet-actions"><button class="btn primary block" data-delete-confirm>Delete my account</button><button class="btn ghost block" data-close-sheet>Keep it</button></div>
  </aside></div>`;
}
// Shows what a sign-in or a sync did. Also used when the game opens (main.js).
export function showAccountResult(r) {
  if (!r || r.cancelled) return;
  if (r.conflict) { overlay(conflictSheet(r.conflict)); return; }
  if (!r.ok) { if (r.text) toast(r.text, 4200); return; }
  if (r.state === 'restored') { clearThumbs(); renderWallet(); renderTicker(); rerender(); toast('Your saved progress is back on this device.', 3600); }
  else if (r.state === 'saved') toast('Your progress is saved to your account.', 3200);
}
onAccount(() => { if (currentRoute() === 'you' && !document.querySelector('#overlay .sheet')) rerender(); });
document.addEventListener('view:rendered', (e) => {
  if (e.detail.name !== 'you') return;
  const slot = document.querySelector('[data-google-slot]');
  if (slot) mountGoogleButton(slot, (token) => signIn('google', token).then(showAccountResult)).then((ok) => { if (!ok) slot.textContent = 'Google sign-in could not load. Check your connection and open this tab again.'; });
});
export const bootAccount = () => accountBoot().then((r) => { if (r && (r.conflict || r.state === 'restored')) showAccountResult(r); }).catch(() => {});

route('you', () => {
  const s = state();
  const dna = styleDNA();
  const dims = DIMS.map((d) => ({ ...d, score: dna.dimAvg[d.key] == null ? 0 : Math.round(dna.dimAvg[d.key] * d.max * 10) / 10 }));
  return `<div class="page-head"><h1>You</h1><p class="sub">Since ${new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p></div>
  <section class="panel levelcard">${OBJ.star(48)}<div><b>Level ${s.level}</b><span class="muted small">${s.xp} of ${xpToNext(s.level)} XP · energy cap ${maxEnergy()}${s.level < 40 ? `, +4 next level` : ''}</span><div class="xpbar"><i style="width:${Math.min(100, (100 * s.xp) / xpToNext(s.level))}%"></i></div></div><div class="energy-pill">${OBJ.bolt(16)} ${energy()}/${maxEnergy()}</div></section>
  ${accountPanel()}
  ${(() => { const o = overall(); return `<section class="panel completion"><div class="panel-title">${icon('check')} completion</div>
    <div class="comp-stats"><div><b class="num">${o.cleared}</b><span>of ${o.levels} levels</span></div><div><b class="num">${o.s}</b><span>of ${o.sTotal} S</span></div><div><b class="num">${o.perfect}</b><span>perfect chapters</span></div><div><b class="num">${o.secrets}</b><span>of ${o.chapters} secrets</span></div></div>
    ${NOVELS.map((n) => `<div class="comp-row"><span class="comp-name">${n.id}. ${esc(n.title)}</span><span class="comp-grid">${chaptersOf(n.id).map((c) => `<i class="${chapterPerfect(c) ? 'perfect' : chapterCleared(c) ? 'cleared' : chapterUnlocked(c) ? 'open' : ''} ${resultOf(c.secret, 'secret')?.passed ? 'secret' : ''}" title="${esc(c.title)}"></i>`).join('')}</span></div>`).join('')}
    <p class="muted small">Pink means cleared. Gold means perfect, with an S on every level in every mode. A ring means the secret level is done too.</p></section>`; })()}
  <div class="section">
    <div><p class="dna-sentence">${esc(sentence(dna))}</p>
      <div class="stats" style="margin-top:18px">
        <div class="stat"><div class="n num">${dna.count}</div><div class="l">looks scored</div></div>
        <div class="stat"><div class="n tier t-${tierOf(s.skill, 68)}">${tierOf(s.skill, 68)}</div><div class="l">current form</div></div>
        <div class="stat"><div class="n tier t-${bestGrade(s)}">${bestGrade(s)}</div><div class="l">best grade</div></div>
        <div class="stat"><div class="n num">${s.streak}</div><div class="l">day streak</div></div>
        <div class="stat"><div class="n num">${s.history.filter((h) => h.grade === 'S').length}</div><div class="l">S grades</div></div>
        <div class="stat"><div class="n num">${ownedCount()}</div><div class="l">of ${CATALOG.length} pieces</div></div>
      </div>
    </div>
    <div class="panel"><div class="eyebrow">Average by dimension</div>${bars(dims)}</div>
  </div>
  <div class="section" style="padding-top:0">
    <div><div class="panel"><div class="eyebrow">Your styles</div>${dna.leads.length ? `<div class="aes-bars">${dna.leads.slice(0, 6).map(([k, v]) => `<div class="aes-bar"><span>${esc(AES[k] || k)}</span><span class="track"><i style="width:${(100 * v) / dna.count}%"></i></span></div>`).join('')}</div>` : '<p class="muted" style="font-size:12px">No data yet.</p>'}</div></div>
    <div><div class="panel"><div class="eyebrow">Your favourite colours</div>${dna.colors.length ? `<div class="palette-strip">${dna.colors.map(([c, n]) => `<i style="background:${c};flex:${n}" title="${c}"></i>`).join('')}</div>` : '<p class="muted" style="font-size:12px">No data yet.</p>'}<div class="mono muted" style="margin-top:8px">${dna.palettes.slice(0, 3).map(([p, n]) => `${esc(p)} ×${n}`).join(' · ')}</div></div></div>
    <div><div class="panel"><div class="eyebrow">Recent looks</div>${s.history.length ? `<div class="looks-row">${s.history.slice(0, 3).map((h) => `<div class="look-card">${Object.values(hydrate(h.items)).some((i) => i.pim) ? renderPim(hydrate(h.items)) : renderLook(hydrate(h.items), s.avatar, { shadow: false })}<div class="cap"><span>${esc(h.title).slice(0, 16)}</span><span class="tier t-${h.grade}">${h.grade}</span></div></div>`).join('')}</div>` : '<p class="muted" style="font-size:12px">No data yet.</p>'}</div></div>
  </div>
  <div class="section" style="padding-top:0">
    <div><div class="panel"><div class="eyebrow">Your avatar</div><p class="muted small" style="margin-top:8px">You can change her name, face and hair on the Chapters tab. Tap the sparkle on her picture.</p></div></div>
    <div><div class="panel"><div class="eyebrow">How Serve adapts</div>
      <div class="prose" style="margin-top:8px">
        <p><b>What the game tracks.</b> Your grade in each scoring area, the styles you wear most, and your recent form (currently ${tierOf(s.skill, 68)}). ${account() ? 'It is kept on this device and saved with your account.' : `All of it stays ${IS_APP ? 'on this device' : 'in this browser'}.`}</p>
        <p><b>Who you are judged against.</b> Every outfit is scored against another stylist at about your level. For now the rivals are computer players, and they only use clothes a player at your level could own. Beat your rival to clear the level, and beat them by a clear margin to earn an S.</p>
        <p><b>What changes.</b> If you’re scoring well above a level’s pass mark, the brief may add <b>one extra rule</b> and pay bonus credits. If you miss the same level twice, you get <b>help</b>: an easier rival and live hints. Hard mode always has an extra rule. The brief always shows these changes.</p>
        <p><b>What never changes.</b> Prices, odds, drop rates, energy costs and what the shop shows are the same for every player. Body shapes, skin tones and faces are always free.</p>
        ${selling() ? `<p><b>What costs money.</b> Thread, today’s edit and the monthly card are the only things sold for real money. Energy refills on its own and fabric comes from levels, so you can finish the game without paying. You have spent ${USD(spentUSD())} so far.</p>` : '<p><b>What costs money.</b> Nothing. This version of the game does not sell anything.</p>'}
      </div>
      <div style="margin-top:16px"><button class="btn small ghost" data-reset>Reset all progress</button></div>
    </div></div>
  </div>`;
});

document.addEventListener('click', (e) => {
  const t = e.target;
  const withBtn = (btn, label, job) => { const was = btn.textContent; btn.disabled = true; btn.textContent = label; return job().finally(() => { if (btn.isConnected) { btn.disabled = false; btn.textContent = was; } }); };
  const si = t.closest('[data-signin-with]');
  if (si) { withBtn(si, 'Signing in…', () => signIn(si.dataset.signinWith).then(showAccountResult)); return; }
  if (t.closest('[data-save-now]')) { const b = t.closest('[data-save-now]'); withBtn(b, 'Saving…', () => push().then((r) => { if (r.conflict) showAccountResult({ ok: true, conflict: describeConflict() }); else toast(r.ok ? 'Your progress is saved to your account.' : 'Your progress could not be saved just now. The game will try again.', 3200); })); return; }
  if (t.closest('[data-account-choose]')) { const c = describeConflict(); if (c) overlay(conflictSheet(c)); return; }
  const keep = t.closest('[data-keep]');
  if (keep) { withBtn(keep, 'Working…', () => resolveConflict(keep.dataset.keep).then((r) => { closeOverlay(); showAccountResult(r); if (r.ok) rerender(); })); return; }
  if (t.closest('[data-signout]')) { const b = t.closest('[data-signout]'); withBtn(b, 'Signing out…', () => signOut().then(() => toast('Signed out. Your progress is still on this device.', 3200))); return; }
  if (t.closest('[data-delete-account]')) { overlay(deleteSheet()); return; }
  if (t.closest('[data-delete-confirm]')) { const b = t.closest('[data-delete-confirm]'); withBtn(b, 'Deleting…', () => deleteAccount().then((r) => { closeOverlay(); rerender(); toast(r.ok ? 'Your account and its saved progress were deleted.' : r.text || 'The account could not be deleted just now.', 4200); })); return; }
  if (t.closest('[data-reset]')) { if (t.dataset.confirmed) { reset(); clearThumbs(); toast('Progress reset'); rerender(); } else { t.dataset.confirmed = '1'; t.textContent = 'This also deletes Thread and items you bought. Tap again to confirm'; } }
});
