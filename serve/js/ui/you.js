import { route, esc, fmt, rerender, toast, bars } from './app.js';
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

route('you', () => {
  const s = state();
  const dna = styleDNA();
  const dims = DIMS.map((d) => ({ ...d, score: dna.dimAvg[d.key] == null ? 0 : Math.round(dna.dimAvg[d.key] * d.max * 10) / 10 }));
  return `<div class="page-head"><h1>You</h1><p class="sub">Since ${new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p></div>
  <section class="panel levelcard">${OBJ.star(48)}<div><b>Level ${s.level}</b><span class="muted small">${s.xp} of ${xpToNext(s.level)} XP · energy cap ${maxEnergy()}${s.level < 40 ? `, +4 next level` : ''}</span><div class="xpbar"><i style="width:${Math.min(100, (100 * s.xp) / xpToNext(s.level))}%"></i></div></div><div class="energy-pill">${OBJ.bolt(16)} ${energy()}/${maxEnergy()}</div></section>
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
        <p><b>What the game tracks.</b> Your grade in each scoring area, the styles you wear most, and your recent form (currently ${tierOf(s.skill, 68)}). All of it stays in this browser.</p>
        <p><b>Who you are judged against.</b> Every outfit is scored against another stylist at about your level. For now the rivals are computer players, and they only use clothes a player at your level could own. Beat your rival to clear the level, and beat them by a clear margin to earn an S.</p>
        <p><b>What changes.</b> If you’re scoring well above a level’s pass mark, the brief may add <b>one extra rule</b> and pay bonus credits. If you miss the same level twice, you get <b>help</b>: an easier rival and live hints. Hard mode always has an extra rule. The brief always shows these changes.</p>
        <p><b>What never changes.</b> Prices, odds, drop rates, energy costs and what the shop shows are the same for every player. Body shapes, skin tones and faces are always free.</p>
        <p><b>What costs money.</b> Thread, today’s edit and the monthly card are the only things sold for real money. Energy refills on its own and fabric comes from levels, so you can finish the game without paying. You have spent ${USD(spentUSD())} so far.</p>
      </div>
      <div style="margin-top:16px"><button class="btn small ghost" data-reset>Reset all progress</button></div>
    </div></div>
  </div>`;
});

document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.closest('[data-reset]')) { if (t.dataset.confirmed) { reset(); clearThumbs(); toast('Progress reset'); rerender(); } else { t.dataset.confirmed = '1'; t.textContent = 'This also deletes Thread and items you bought. Tap again to confirm'; } }
});
