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

// How a critic would put it: the lead aesthetic as a point of view, the palette as a habit, the strongest and weakest
// scoring dimension as the thing that carries you and the thing that gives you away.
const TEMPLATE = {
  coquette: 'You dress coquette in {palette}, and the bows are punctuation rather than plot. {strong} is where the sweetness earns its keep; {weak} is where it tips toward costume.',
  ballet: 'You dress ballet in {palette}: wrap, rib, and a long line through the leg. {strong} gives it the discipline the look depends on; {weak} is the step you keep skipping.',
  siren: 'You dress siren in {palette}, and the cut does the talking. {strong} is exact; {weak} is where exposure outruns control.',
  quiet: 'You dress quiet luxury in {palette}, all fabric and no logo. {strong} reads as money; {weak} reads as merely beige.',
  y2k: 'You dress Y2K in {palette}, low-slung and unbothered. {strong} is the nostalgia done properly; {weak} is a little too 2003 for its own good.',
  sleaze: 'You dress indie sleaze in {palette}, and the undone is deliberate. {strong} sells the dishevelment; {weak} is where undone becomes unfinished.',
  fairy: 'You dress fairy grunge in {palette}, lace against hardware. {strong} holds the two halves together; {weak} lets them split.',
  academia: 'You dress dark academia in {palette}: wool, pleat, and a collar with opinions. {strong} is the scholarship; {weak} is the costume department.',
  gorp: 'You dress gorp in {palette}, technical pieces worn with intent. {strong} makes it look like a choice; {weak} makes it look like a hike.',
  clean: 'You dress clean girl in {palette}, edited to the point of discipline. {strong} carries the look; {weak} is where clean becomes blank.',
  mob: 'You dress mob wife in {palette}, fur-shouldered and unapologetic. {strong} is the drama earned; {weak} is the drama borrowed.',
  chrome: 'You dress chrome in {palette}, liquid surfaces and hard edges. {strong} keeps it sculptural; {weak} tips it into foil.',
  blokette: 'You dress blokette in {palette}, the football shirt against the ribbon. {strong} makes the clash a conversation; {weak} makes it a shrug.',
  boho: 'You dress boho in {palette}, layered and loose by design. {strong} gives the layers a spine; {weak} is where loose becomes lost.',
};
const DIM_WORD = { brief: 'brief fit', palette: 'the palette', silhouette: 'the silhouette', formality: 'formality', season: 'season', texture: 'texture', focal: 'the focal point', complete: 'completeness', aesthetic: 'the aesthetic' };
const PALETTE_WORD = { tonal: 'tonal neutrals', mono: 'one colour, head to toe', neutral: 'neutrals with temperature', pastel: 'sugared pastels', accent: 'neutrals with one accent', dark: 'black with one metal', bright: 'saturated colour', clash: 'colour against colour' };
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const GR = { D: 0, C: 1, B: 2, A: 3, S: 4 };
const bestGrade = (s) => s.history.reduce((b, h) => (GR[h.grade] > GR[b] ? h.grade : b), s.history.length ? 'D' : '–');
function sentence(dna) {
  if (!dna.count) return 'Style a few looks and we will tell you how you dress.';
  const lead = dna.leads[0]?.[0];
  const tpl = TEMPLATE[lead] || 'You dress your own way in {palette}, and it is starting to read as a point of view. {strong} is the strength; {weak} is the tell.';
  const palKey = dna.palettes[0] ? dna.palettes[0][0] : 'tonal';
  const palette = PALETTE_WORD[palKey] || `${palKey} palettes`;
  const strong = DIM_WORD[dna.strongest] || 'the instinct';
  const weak = DIM_WORD[dna.weakest] || 'the finish';
  return tpl.replace('{palette}', palette).replace(/(^|\. ){strong}/, (m, pre) => pre + cap(strong)).replace('{strong}', strong).replace('{weak}', weak);
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
    <p class="muted small">pink = cleared. gold = perfect (every level, every mode, S). a ring means the secret level is done too.</p></section>`; })()}
  <div class="section">
    <div><p class="dna-sentence">${esc(sentence(dna))}</p>
      <div class="stats" style="margin-top:18px">
        <div class="stat"><div class="n num">${dna.count}</div><div class="l">looks scored</div></div>
        <div class="stat"><div class="n tier t-${tierOf(s.skill, 68)}">${tierOf(s.skill, 68)}</div><div class="l">current form</div></div>
        <div class="stat"><div class="n tier t-${bestGrade(s)}">${bestGrade(s)}</div><div class="l">best grade</div></div>
        <div class="stat"><div class="n num">${s.streak}</div><div class="l">day streak</div></div>
        <div class="stat"><div class="n num">${s.history.filter((h) => h.grade === 'S').length}</div><div class="l">S verdicts</div></div>
        <div class="stat"><div class="n num">${ownedCount()}</div><div class="l">of ${CATALOG.length} pieces</div></div>
      </div>
    </div>
    <div class="panel"><div class="eyebrow">Average by dimension</div>${bars(dims)}</div>
  </div>
  <div class="section" style="padding-top:0">
    <div><div class="panel"><div class="eyebrow">How you read</div>${dna.leads.length ? `<div class="aes-bars">${dna.leads.slice(0, 6).map(([k, v]) => `<div class="aes-bar"><span>${esc(AES[k] || k)}</span><span class="track"><i style="width:${(100 * v) / dna.count}%"></i></span></div>`).join('')}</div>` : '<p class="muted" style="font-size:12px">No data yet.</p>'}</div></div>
    <div><div class="panel"><div class="eyebrow">Colours you reach for</div>${dna.colors.length ? `<div class="palette-strip">${dna.colors.map(([c, n]) => `<i style="background:${c};flex:${n}" title="${c}"></i>`).join('')}</div>` : '<p class="muted" style="font-size:12px">No data yet.</p>'}<div class="mono muted" style="margin-top:8px">${dna.palettes.slice(0, 3).map(([p, n]) => `${esc(p)} ×${n}`).join(' · ')}</div></div></div>
    <div><div class="panel"><div class="eyebrow">Recent looks</div>${s.history.length ? `<div class="looks-row">${s.history.slice(0, 3).map((h) => `<div class="look-card">${Object.values(hydrate(h.items)).some((i) => i.pim) ? renderPim(hydrate(h.items)) : renderLook(hydrate(h.items), s.avatar, { shadow: false })}<div class="cap"><span>${esc(h.title).slice(0, 16)}</span><span class="tier t-${h.grade}">${h.grade}</span></div></div>`).join('')}</div>` : '<p class="muted" style="font-size:12px">No data yet.</p>'}</div></div>
  </div>
  <div class="section" style="padding-top:0">
    <div><div class="panel"><div class="eyebrow">Your avatar</div><p class="muted small" style="margin-top:8px">Name, face and hair are on the Home tab. Tap the sparkle on her picture.</p></div></div>
    <div><div class="panel"><div class="eyebrow">How Serve adapts</div>
      <div class="prose" style="margin-top:8px">
        <p><b>What we track.</b> Your tier per dimension, what your looks read as, and a rolling sense of your form (currently ${tierOf(s.skill, 68)}). It stays in this browser.</p>
        <p><b>Who you are judged against.</b> Every submission is scored line by line against another stylist at about your level. For now they are bots with wardrobes a player at your level could own; they are pitched at the level’s standard and your form. Beat them for a clear; beat them clearly for an S.</p>
        <p><b>What changes.</b> Running well above a level’s standard gets you a <b>twist</b>: one extra rule you can see, plus a credit bonus. Missing the same level twice gets you an <b>assist</b>: a gentler rival and hints switch on. Hard mode always carries a twist. All of it is printed on the brief.</p>
        <p><b>What never changes.</b> Prices, odds, drop rates, energy costs and what the shop shows you. Nobody is shown a different price or a different probability. Your body and face are not for sale.</p>
        <p><b>What costs money.</b> Thread, and two dollar items: today’s edit and the monthly card. Energy returns on its own and fabric drops from levels, so nothing is locked behind cash, but today’s edit roughly doubles your pace. Recorded so far: ${USD(spentUSD())}.</p>
      </div>
      <div style="margin-top:16px"><button class="btn small ghost" data-reset>Reset all progress</button></div>
    </div></div>
  </div>`;
});

document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.closest('[data-reset]')) { if (t.dataset.confirmed) { reset(); clearThumbs(); toast('Progress reset'); rerender(); } else { t.dataset.confirmed = '1'; t.textContent = 'Click again to confirm reset'; } }
});
