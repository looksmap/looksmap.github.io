// The judging show that plays between Submit and the result sheet. The two stylists stand side by side under the
// lights; each scoring line is revealed in turn with a bar for each side and the totals count up. While it runs the
// player can use the boosts they own and that are off cooldown: Catwalk (+2 on each of the next three lines) and Aura
// (+4 on the next line). A boost never lifts a line above its maximum, so it is worth saving for a line that needs
// it. The caller says which boosts are ready (d.boosts) and is told the moment one is used (d.onBoost). Then the
// winner is announced, the board for this brief appears for a moment, and the show closes by itself. Two equal totals
// are settled by a tiebreak point (engine/bots.js tieBreak), so the show never ends level.
// A tap speeds it along and Skip closes it. While it is up the screen behind it cannot be reached, by pointer or by
// keyboard, and focus starts on the first boost that is ready. When the device asks for less motion the show is not
// played, and a ready boost is used only when it changes the grade, so it is never spent for nothing.
import { $, esc, reduced } from './app.js';
import { tieBreak } from '../engine/bots.js';

const STEP = 900;      // one scoring line
export const BOOSTS = [
  { id: 'catwalk', name: 'Catwalk', lines: 3, plus: 2, hint: '+2 on the next 3 lines' },
  { id: 'aura', name: 'Aura', lines: 1, plus: 4, hint: '+4 on the next line' },
];
let active = null;     // { node, timers, onKey, inert, focus }

function close() {
  if (!active) return;
  for (const t of active.timers) clearTimeout(t);
  document.removeEventListener('keydown', active.onKey, true);
  active.node.remove();
  for (const el of active.inert) el.inert = false;
  const back = active.focus;
  active = null;
  if (back && back.isConnected) try { back.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
}
// alive() turns false when the totals have been set to their final values, so a count still running cannot write over them
function tween(el, from, to, alive, ms = 360) {
  const t0 = performance.now();
  const tick = (t) => { if (!alive()) return; const p = Math.min(1, (t - t0) / ms); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))); if (p < 1 && el.isConnected) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
// Where the boosts do the most good, for players who do not see the show.
export function autoBonus(dims, ready) {
  const room = dims.map((r) => r.max - r.you), bonus = {};
  if (!ready.catwalk && !ready.aura) return bonus;
  const add = (i, n) => { const g = Math.min(n, room[i]); if (g > 0) { room[i] -= g; bonus[dims[i].key] = (bonus[dims[i].key] || 0) + g; } };
  let best = 0, bestGain = -1;
  for (let i = 0; i < dims.length; i++) { const g = [0, 1, 2].reduce((a, k) => a + Math.min(2, room[i + k] ?? 0), 0); if (g > bestGain) { bestGain = g; best = i; } }
  if (ready.catwalk) for (let k = 0; k < 3 && best + k < dims.length; k++) add(best + k, 2);
  if (ready.aura) add(room.indexOf(Math.max(...room)), 4);
  return bonus;
}

/**
 * d: { title, you: { name, svg, tag? }, them: { name, svg, tag? }, dims: [{ key, label, max, you, them, themBoost? }],
 *      total: { you, them }, gradeOf(you, them) → letter, board(you) → { title, rows: [{ place, name, score, you? }], place, of } | null,
 *      boosts: { catwalk: { state: 'ready' | 'cooldown' | 'locked', leftMs }, aura: {...} }, onBoost(id) }
 * done(bonus, yourTotal) runs exactly once. bonus is { lineKey: points } won with the boosts. board(you, them) gets
 * both totals after any tiebreak point.
 */
export function playJudging(d, done) {
  close();
  const base = d.dims.reduce((a, r) => a + r.you, 0), off = d.total.you - base;
  // an outfit held under a ceiling by the brief (d.cap) stays under it, boosts or not: the same rule the saved score uses
  const totalWith = (bonus) => Math.max(d.total.you, Math.min(d.cap ?? 100, d.total.you + Object.values(bonus).reduce((a, b) => a + b, 0)));
  // the two totals as they will be saved: boosts in, and a tiebreak point to one side when they would be equal
  const settle = (bonus) => {
    const mine = totalWith(bonus);
    const tb = tieBreak(d.dims.map((r) => ({ label: r.label, score: r.you + (bonus[r.key] || 0) })), d.dims.map((r) => ({ score: r.them })), mine, d.total.them, d.cap ?? 100);
    return { mine: mine + (tb?.you || 0), them: d.total.them + (tb?.them || 0), tb };
  };
  const stateOf = (id) => d.boosts?.[id]?.state || 'locked';
  const mmss = (ms) => { const s = Math.ceil(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  if (reduced() || !$('#device')) {
    const ready = { catwalk: stateOf('catwalk') === 'ready', aura: stateOf('aura') === 'ready' };
    const gradeWith = (b) => { const s = settle(b); return d.gradeOf(s.mine, s.them); };
    const plain = gradeWith({});
    // the cheapest choice that reaches the best grade: nothing, then one boost, then both
    const tries = [{}, { catwalk: ready.catwalk }, { aura: ready.aura }, ready].map((use) => ({ use, bonus: autoBonus(d.dims, { catwalk: !!use.catwalk, aura: !!use.aura }) }));
    const best = gradeWith(tries[3].bonus);
    const pick = best === plain ? tries[0] : tries.find((t) => gradeWith(t.bonus) === best);
    for (const id of Object.keys(pick.use)) if (pick.use[id]) d.onBoost?.(id);
    done(pick.bonus, settle(pick.bonus).mine); return;
  }
  const node = document.createElement('div');
  node.className = 'judge'; node.setAttribute('role', 'dialog'); node.setAttribute('aria-modal', 'true'); node.setAttribute('aria-label', 'Judging');
  node.innerHTML = `
    <div class="judge-lights" aria-hidden="true"><i></i><i></i><i></i></div>
    <header class="judge-head"><span class="judge-kicker">Judging</span><h2>${esc(d.title)}</h2></header>
    <div class="judge-stage">
      <div class="judge-side you"><div class="judge-fig">${d.you.svg}</div><span class="judge-pop"></span><div class="judge-plate"><b>${esc(d.you.name)}</b>${d.you.tag ? `<small>${esc(d.you.tag)}</small>` : ''}<span class="judge-score" data-score="you">0</span></div></div>
      <div class="judge-vs" aria-hidden="true">VS</div>
      <div class="judge-side them"><div class="judge-fig">${d.them.svg}</div><span class="judge-pop"></span><div class="judge-plate"><b>${esc(d.them.name)}</b>${d.them.tag ? `<small>${esc(d.them.tag)}</small>` : ''}<span class="judge-score" data-score="them">0</span></div></div>
    </div>
    <div class="judge-boosts">${BOOSTS.map((b) => { const st = stateOf(b.id); return `<button type="button" class="judge-boost ${st}" data-boost="${b.id}" ${st === 'ready' ? '' : 'disabled'}><b>${b.name}</b><small>${st === 'ready' ? b.hint : st === 'cooldown' ? `Ready in ${mmss(d.boosts[b.id].leftMs)}` : 'Locked · buy it in the Shop'}</small></button>`; }).join('')}</div>
    <div class="judge-round" aria-live="polite">
      <div class="judge-label">Get ready…</div>
      <div class="judge-next">First up: ${esc(d.dims[0].label)}</div>
      <div class="judge-bars"><span class="jb you"><b></b><span><i></i></span></span><span class="jb them"><span><i></i></span><b></b></span></div>
      <div class="judge-dots">${d.dims.map(() => '<i></i>').join('')}</div>
    </div>
    <div class="judge-final" hidden><span class="judge-result"></span><span class="judge-grade"></span><span class="judge-tally"></span></div>
    <div class="judge-board" hidden></div>
    <button class="judge-skip" type="button">Skip</button>`;
  const focus = document.activeElement;
  $('#device').appendChild(node);
  const inert = [...$('#device').children].filter((el) => el !== node && !el.inert);
  for (const el of inert) el.inert = true;
  const q = (s) => node.querySelector(s);
  let alive = true;
  const live = () => alive;
  const timers = [];
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  let you = 0, them = 0, phase = 'rounds', ended = false, shown = 0;
  const bonus = {}, left = { catwalk: 0, aura: 0 }, used = {};
  const end = () => { if (ended) return; ended = true; close(); done(bonus, settle(bonus).mine); };
  const scoreEl = { you: q('[data-score="you"]'), them: q('[data-score="them"]') };
  const label = q('.judge-label'), nextEl = q('.judge-next'), bars = { you: q('.jb.you'), them: q('.jb.them') }, dots = [...node.querySelectorAll('.judge-dots i')];
  const pop = (side, text) => { const el = q(`.judge-side.${side} .judge-pop`); el.textContent = text; el.classList.remove('go'); void el.offsetWidth; el.classList.add('go'); };

  // one line: returns the player's points for it, boosts included
  function scoreLine(i) {
    const r = d.dims[i];
    const plus = (left.catwalk > 0 ? BOOSTS[0].plus : 0) + (left.aura > 0 ? BOOSTS[1].plus : 0);
    const gain = Math.max(0, Math.min(plus, r.max - r.you));
    if (left.catwalk > 0) left.catwalk--;
    if (left.aura > 0) left.aura--;
    if (gain) bonus[r.key] = (bonus[r.key] || 0) + gain;
    for (const b of BOOSTS) if (used[b.id] && !left[b.id]) q(`[data-boost="${b.id}"]`).classList.remove('on');
    if (!left.catwalk) q('.judge-side.you').classList.remove('strut');
    if (!left.aura) q('.judge-side.you').classList.remove('aura');
    return { mine: r.you + gain, gain, plus };
  }
  function round(i) {
    const r = d.dims[i]; shown = i + 1;
    const { mine, gain, plus } = scoreLine(i);
    label.textContent = r.label; label.classList.remove('pop'); void label.offsetWidth; label.classList.add('pop');
    nextEl.textContent = d.dims[i + 1] ? `Next: ${d.dims[i + 1].label}` : 'Last line';
    const set = (k, v, text) => { const bar = bars[k].querySelector('i'); bar.style.transition = 'none'; bar.style.width = '0%'; void bar.offsetWidth; bar.style.transition = ''; bar.style.width = `${Math.round((100 * v) / r.max)}%`; bars[k].querySelector('b').textContent = text; };
    set('you', mine, `+${mine}`); set('them', r.them, `+${r.them}`);
    bars.you.classList.toggle('boosted', gain > 0);
    if (gain) pop('you', `Boost +${gain}`); else if (plus) pop('you', 'Already at the top');
    if (r.themBoost) pop('them', `Aura +${r.themBoost}`);
    const lead = mine > r.them ? 'you' : r.them > mine ? 'them' : '';
    dots[i]?.classList.add(lead || 'tie');
    at(300, () => {
      tween(scoreEl.you, you, you + mine, live); tween(scoreEl.them, them, them + r.them, live);
      you += mine; them += r.them;
      for (const k of ['you', 'them']) { const side = q(`.judge-side.${k}`); side.classList.remove('hit'); void side.offsetWidth; if (lead === k) side.classList.add('hit'); }
    });
  }
  function final() {
    if (phase !== 'rounds') return;
    phase = 'final'; alive = false;
    for (const t of timers.splice(0)) clearTimeout(t);
    for (let i = shown; i < d.dims.length; i++) { scoreLine(i); const r = d.dims[i]; dots[i]?.classList.add(r.you > r.them ? 'you' : r.them > r.you ? 'them' : 'tie'); }   // lines not yet shown still count, with any boost that was running
    const { mine, them: theirs, tb } = settle(bonus), passed = mine > theirs, grade = d.gradeOf(mine, theirs);
    scoreEl.you.textContent = mine; scoreEl.them.textContent = theirs;
    if (tb) pop(tb.you ? 'you' : 'them', 'Tiebreak +1');
    q('.judge-round').classList.add('done'); q('.judge-boosts').classList.add('done');
    q('.judge-side.you').classList.remove('strut', 'aura');
    q('.judge-side.you').classList.add(passed ? 'win' : 'lose'); q('.judge-side.them').classList.add(passed ? 'lose' : 'win');
    q('.judge-result').textContent = passed ? (grade === 'S' ? 'Perfect win!' : 'You win!') : 'So close!';
    q('.judge-grade').textContent = grade; q('.judge-grade').dataset.grade = grade;
    q('.judge-tally').textContent = tb ? (tb.why === 'line' ? `Equal scores, so ${tb.label} decided it: ${mine} to ${theirs}` : `Equal scores, so the tiebreak point went to ${d.them.name}: ${mine} to ${theirs}`) : `${mine} to ${theirs}`;
    q('.judge-final').hidden = false;
    q('.judge-skip').textContent = 'Continue';
    if (node.contains(document.activeElement) && document.activeElement !== q('.judge-skip')) q('.judge-skip').focus({ preventScroll: true });   // the boosts are finished
    at(2000, board);
  }
  // the board for this brief: shown for a moment, then the show closes by itself
  function board() {
    if (phase === 'board') return;
    const fin = settle(bonus);
    const b = d.board ? d.board(fin.mine, fin.them) : null;
    if (!b) { end(); return; }
    phase = 'board';
    for (const t of timers.splice(0)) clearTimeout(t);
    q('.judge-final').hidden = true;
    const el = q('.judge-board');
    el.innerHTML = `<div class="jb-title">${esc(b.title)}</div><div class="jb-place">You are <b>#${b.place}</b> of ${b.of}</div><ol>${b.rows.map((r, i) => `<li class="${r.you ? 'you' : ''}" style="animation-delay:${i * 90}ms"><span class="pl">${r.place}</span><span class="nm">${esc(r.name)}</span><span class="sc">${esc(String(r.score))}</span></li>`).join('')}</ol>`;
    el.hidden = false;
    q('.judge-skip').textContent = 'See results';
    at(3000, end);
  }

  // the script: an opening beat, one beat per scoring line, a rules beat if points were taken off, then the result
  let t = 1500;
  d.dims.forEach((_, i) => { at(t, () => round(i)); t += STEP; });
  if (off < 0) {
    at(t, () => {
      label.textContent = 'Brief rules'; label.classList.remove('pop'); void label.offsetWidth; label.classList.add('pop'); nextEl.textContent = '';
      bars.you.querySelector('b').textContent = `${off}`; bars.them.querySelector('b').textContent = '';
      for (const k of ['you', 'them']) bars[k].querySelector('i').style.width = '0%';
      at(300, () => { tween(scoreEl.you, you, you + off, live); you += off; });
    });
    t += STEP;
  }
  at(t + 200, final);

  const advance = () => { if (phase === 'rounds') final(); else if (phase === 'final') board(); else end(); };
  // Escape moves the show on. Enter does too, unless a button in the show has focus: then it presses that button.
  const onKey = (e) => {
    if (e.key !== 'Escape' && e.key !== 'Enter') return;
    if (e.key === 'Enter' && e.target instanceof Element && node.contains(e.target) && e.target.closest('button')) return;
    e.preventDefault(); e.stopImmediatePropagation(); advance();
  };
  document.addEventListener('keydown', onKey, true);
  node.addEventListener('click', (e) => {
    const bb = e.target.closest('[data-boost]');
    if (bb) {
      const b = BOOSTS.find((x) => x.id === bb.dataset.boost);
      if (phase !== 'rounds' || used[b.id] || shown >= d.dims.length || stateOf(b.id) !== 'ready') return;
      used[b.id] = true; left[b.id] = b.lines; d.onBoost?.(b.id);
      bb.classList.add('used', 'on'); bb.disabled = true;
      q('.judge-side.you').classList.add(b.id === 'catwalk' ? 'strut' : 'aura');
      pop('you', `${b.name}!`);
      return;
    }
    if (e.target.closest('.judge-skip')) { if (phase === 'board') end(); else advance(); return; }
    if (phase !== 'rounds') advance();   // during the lines a stray tap does nothing, so boosts are never lost by accident
  });
  active = { node, timers, onKey, inert, focus };
  (q('.judge-boost:not([disabled])') || q('.judge-skip')).focus({ preventScroll: true });
}
