// Ranked: the live-rival mode. Every match is a brief drawn from the levels the player has cleared, a rival pitched at
// their rank, ninety seconds to style, boosts on both sides, and rank points won or lost. There is no game server yet,
// so the rivals and the ladder are the game's computer stylists; the screen says so. The match itself is played in the
// studio (setSpecial), so this file is only the lobby and the matchmaking sheet.
import { route, esc, navigate, overlay, closeOverlay, toast, rerender, $ } from './app.js';
import { state, ranked, rankOf, rankedMatch, startRanked, rankedUnlocked, ladder, RANKED, FORFEIT_RP, energy } from '../engine/state.js';
import { renderLook } from '../render/figure.js';
import { setSpecial } from './studio.js';
import { offerSheet } from './atelier.js';
import { icon } from './icons.js';
import { track } from '../engine/track.js';

const TIER_COLOURS = ['#F5A9C8', '#B79CFF', '#FF6FB3', '#7FD8D0', '#FFC93C', '#3A1030'];
const badge = (rk, size = 96) => `<svg class="rank-emblem" viewBox="0 0 100 110" width="${size}" height="${size * 1.1}" aria-hidden="true">
  <defs><linearGradient id="rk${rk.tier}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="${TIER_COLOURS[rk.tier]}"/><stop offset="1" stop-color="${TIER_COLOURS[rk.tier]}" stop-opacity=".75"/></linearGradient></defs>
  <path d="M50,4 L92,20 V56 C92,82 72,98 50,106 C28,98 8,82 8,56 V20Z" fill="url(#rk${rk.tier})" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
  <path d="M50,14 L82,26 V56 C82,75 67,88 50,95Z" fill="#fff" opacity=".28"/>
  <path d="M50,34 l6.500,13.200 l14.500,2.100 l-10.500,10.200 l2.500,14.500 l-13,-6.800 l-13,6.800 l2.500,-14.500 l-10.500,-10.200 l14.500,-2.100Z" fill="#fff" stroke="rgba(120,20,90,.25)" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`;

route('arena', () => {
  const s = state(), R = ranked(), rk = rankOf(R.rp), open = rankedUnlocked(), e = energy();
  const rows = ladder(s.avatar.name || 'You');
  const me = rows.findIndex((r) => r.you);
  const shown = rows.slice(Math.max(0, Math.min(me - 3, rows.length - 8)), Math.max(8, me + 5)).slice(0, 8);
  return `<section class="arena">
    <div class="arena-hero">
      ${badge(rk)}
      <div><div class="kicker">${icon('crown')} Ranked</div><h1 class="display">${esc(rk.label)}</h1>
        <div class="rank-bar"><i style="width:${rk.into}%"></i></div>
        <p class="muted small">${rk.tier === 5 ? `${R.rp} rank points` : `${rk.into} of 100 points to the next rank`} · ${R.wins} won, ${R.losses} lost${R.streak >= 2 ? ` · ${R.streak} wins in a row` : ''}</p></div>
    </div>
    ${open ? `<button class="btn primary block" data-find-rival ${e >= RANKED.cost ? '' : 'disabled'}>${e >= RANKED.cost ? `${icon('play')} Find a rival ${icon('bolt')}${RANKED.cost}` : `Not enough energy ${icon('bolt')}${RANKED.cost}`}</button>${e < RANKED.cost ? `<button class="btn ghost block" data-arena-energy>${icon('bolt')} Get energy</button>` : ''}` : `<div class="banner-warn">Ranked opens after you clear ${RANKED.unlockAfter} story levels, so you have a few outfits to choose from.</div>`}
    <div class="panel arena-how"><div class="panel-title">How a match works</div>
      <ol><li>You and a rival at your rank get the same brief.</li><li>You have ${RANKED.seconds} seconds to style it from your own wardrobe.</li><li>Your rival boosts one line during judging, and you can use any boost you own. Win to gain rank points, and win several in a row for a bonus.</li><li>There are no ties. If the totals are equal, the first line where the two outfits differ decides it.</li><li>A match counts once it starts. Leaving before you send an outfit is a loss of ${FORFEIT_RP} points.</li></ol>
    </div>
    <div class="panel"><div class="panel-title">${icon('star')} Ladder near you</div>
      <ol class="ladder">${shown.map((r) => `<li class="${r.you ? 'you' : ''}"><span class="pl">${r.place}</span><span class="nm">${esc(r.name)}</span><span class="rk t${r.rank.tier}">${esc(r.rank.label)}</span><span class="sc">${r.rp}</span></li>`).join('')}</ol>
      <p class="muted small">For now your rivals and this ladder are computer stylists matched to your rank. Matches against other players in real time need a game server, which Serve does not have yet. You can already battle a real friend: tap “Challenge a friend” on any result.</p>
    </div>
  </section>`;
});

let pending = null;
function matchSheet(found) {
  const s = state();
  if (!found) return `<div class="sheet-wrap" role="dialog" aria-label="Finding a rival"><div class="scrim"></div><aside class="sheet match"><div class="match-wait"><span class="match-spin"></span><h2 class="display display-m">Finding a rival…</h2><p class="muted">Looking for a stylist near ${esc(rankOf(ranked().rp).label)}</p></div></aside></div>`;
  const { opp: o } = pending;
  return `<div class="sheet-wrap" role="dialog" aria-label="Rival found"><div class="scrim" data-close-sheet></div><aside class="sheet match">
    <button class="close" data-close-sheet>Close ×</button>
    <div class="eyebrow">Rival found</div>
    <div class="match-vs"><div class="mv"><div class="mv-fig">${renderLook({}, s.avatar, { depth: true, shadow: false, viewBox: '86 4 188 190', pose: false })}</div><b>${esc(s.avatar.name || 'You')}</b><span>${esc(rankOf(ranked().rp).label)}</span></div>
      <span class="match-x">VS</span>
      <div class="mv"><div class="mv-fig them">${renderLook({}, o.bot.avatar, { depth: true, shadow: false, viewBox: '86 4 188 190', pose: false })}</div><b>${esc(o.bot.name)}</b><span>${esc(o.rank.label)}</span></div></div>
    <h2 class="display display-m">The brief is a surprise</h2>
    <p class="muted small">You both see the brief when the clock starts. The match costs ${RANKED.cost} energy and counts from that moment, so start when you are ready.</p>
    <div class="sheet-actions"><button class="btn primary block" data-start-match>${icon('play')} Start styling · ${RANKED.seconds} seconds ${icon('bolt')}${RANKED.cost}</button></div>
  </aside></div>`;
}
document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.closest('[data-arena-energy]')) { overlay(offerSheet('energy')); return; }
  if (t.closest('[data-find-rival]')) {
    if (!rankedUnlocked() || energy() < RANKED.cost) return;
    pending = rankedMatch();
    overlay(matchSheet(false));
    setTimeout(() => { if (pending && $('.match-wait')) overlay(matchSheet(true)); }, 1500);
    return;
  }
  if (t.closest('[data-start-match]') && pending) {
    pending = null;
    closeOverlay();
    setSpecial(null);   // closes any battle that was open, before the match is written down
    const m = startRanked();
    if (!m.ok) { if (m.reason === 'energy') overlay(offerSheet('energy')); else rerender(); return; }
    track('ranked_start', { id: m.brief.id });
    setSpecial({ kind: 'ranked', seed: m.seed, brief: m.brief, opp: m.opp, deadline: m.deadline });
    navigate('#studio');
  }
});
