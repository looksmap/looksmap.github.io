// The judging show that plays between Submit and the result sheet. The two stylists stand side by side under the
// lights; each scoring line is revealed in turn with a bar for each side and the totals count up. While it runs the
// player has two boosts, each usable once: Catwalk (+2 on each of the next three lines) and Aura (+4 on the next
// line). A boost never lifts a line above its maximum, so it is worth saving for a line that needs it. Then the
// winner is announced, the board for this brief appears for a moment, and the show closes by itself.
// A tap speeds it along, Skip closes it, and when the device asks for less motion the boosts are placed
// automatically and the show is not played.
import { $, esc, reduced } from './app.js';

const STEP = 900;      // one scoring line
export const BOOSTS = [
  { id: 'catwalk', name: 'Catwalk', lines: 3, plus: 2, hint: '+2 on the next 3 lines' },
  { id: 'aura', name: 'Aura', lines: 1, plus: 4, hint: '+4 on the next line' },
];
let active = null;     // { node, timers, onKey }

function close() {
  if (!active) return;
  for (const t of active.timers) clearTimeout(t);
  document.removeEventListener('keydown', active.onKey, true);
  active.node.remove();
  active = null;
}
function tween(el, from, to, ms = 360) {
  const t0 = performance.now();
  const tick = (t) => { const p = Math.min(1, (t - t0) / ms); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))); if (p < 1 && el.isConnected) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
// Where the boosts do the most good, for players who do not see the show.
function autoBonus(dims) {
  const room = dims.map((r) => r.max - r.you), bonus = {};
  const add = (i, n) => { const g = Math.min(n, room[i]); if (g > 0) { room[i] -= g; bonus[dims[i].key] = (bonus[dims[i].key] || 0) + g; } };
  let best = 0, bestGain = -1;
  for (let i = 0; i < dims.length; i++) { const g = [0, 1, 2].reduce((a, k) => a + Math.min(2, room[i + k] ?? 0), 0); if (g > bestGain) { bestGain = g; best = i; } }
  for (let k = 0; k < 3 && best + k < dims.length; k++) add(best + k, 2);
  add(room.indexOf(Math.max(...room)), 4);
  return bonus;
}

/**
 * d: { title, you: { name, svg, tag? }, them: { name, svg, tag? }, dims: [{ key, label, max, you, them, themBoost? }],
 *      total: { you, them }, gradeOf(you, them) → letter, board(you) → { title, rows: [{ place, name, score, you? }], place, of } | null }
 * done(bonus, yourTotal) runs exactly once. bonus is { lineKey: points } won with the boosts.
 */
export function playJudging(d, done) {
  close();
  const base = d.dims.reduce((a, r) => a + r.you, 0), off = d.total.you - base;
  const totalWith = (bonus) => Math.min(100, d.total.you + Object.values(bonus).reduce((a, b) => a + b, 0));
  if (reduced() || !$('#device')) { const b = autoBonus(d.dims); done(b, totalWith(b)); return; }
  const node = document.createElement('div');
  node.className = 'judge'; node.setAttribute('role', 'dialog'); node.setAttribute('aria-label', 'Judging');
  node.innerHTML = `
    <div class="judge-lights" aria-hidden="true"><i></i><i></i><i></i></div>
    <header class="judge-head"><span class="judge-kicker">Judging</span><h2>${esc(d.title)}</h2></header>
    <div class="judge-stage">
      <div class="judge-side you"><div class="judge-fig">${d.you.svg}</div><span class="judge-pop"></span><div class="judge-plate"><b>${esc(d.you.name)}</b>${d.you.tag ? `<small>${esc(d.you.tag)}</small>` : ''}<span class="judge-score" data-score="you">0</span></div></div>
      <div class="judge-vs" aria-hidden="true">VS</div>
      <div class="judge-side them"><div class="judge-fig">${d.them.svg}</div><span class="judge-pop"></span><div class="judge-plate"><b>${esc(d.them.name)}</b>${d.them.tag ? `<small>${esc(d.them.tag)}</small>` : ''}<span class="judge-score" data-score="them">0</span></div></div>
    </div>
    <div class="judge-boosts">${BOOSTS.map((b) => `<button type="button" class="judge-boost" data-boost="${b.id}"><b>${b.name}</b><small>${b.hint}</small></button>`).join('')}</div>
    <div class="judge-round" aria-live="polite">
      <div class="judge-label">Get ready…</div>
      <div class="judge-next">First up: ${esc(d.dims[0].label)}</div>
      <div class="judge-bars"><span class="jb you"><b></b><span><i></i></span></span><span class="jb them"><span><i></i></span><b></b></span></div>
      <div class="judge-dots">${d.dims.map(() => '<i></i>').join('')}</div>
    </div>
    <div class="judge-final" hidden><span class="judge-result"></span><span class="judge-grade"></span><span class="judge-tally"></span></div>
    <div class="judge-board" hidden></div>
    <button class="judge-skip" type="button">Skip</button>`;
  $('#device').appendChild(node);
  const q = (s) => node.querySelector(s);
  const timers = [];
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  let you = 0, them = 0, phase = 'rounds', ended = false, shown = 0;
  const bonus = {}, left = { catwalk: 0, aura: 0 }, used = {};
  const end = () => { if (ended) return; ended = true; close(); done(bonus, totalWith(bonus)); };
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
      tween(scoreEl.you, you, you + mine); tween(scoreEl.them, them, them + r.them);
      you += mine; them += r.them;
      for (const k of ['you', 'them']) { const side = q(`.judge-side.${k}`); side.classList.remove('hit'); void side.offsetWidth; if (lead === k) side.classList.add('hit'); }
    });
  }
  function final() {
    if (phase !== 'rounds') return;
    phase = 'final';
    for (const t of timers.splice(0)) clearTimeout(t);
    for (let i = shown; i < d.dims.length; i++) { scoreLine(i); const r = d.dims[i]; dots[i]?.classList.add(r.you > r.them ? 'you' : r.them > r.you ? 'them' : 'tie'); }   // lines not yet shown still count, with any boost that was running
    const mine = totalWith(bonus), passed = mine >= d.total.them, grade = d.gradeOf(mine, d.total.them);
    scoreEl.you.textContent = mine; scoreEl.them.textContent = d.total.them;
    q('.judge-round').classList.add('done'); q('.judge-boosts').classList.add('done');
    q('.judge-side.you').classList.remove('strut', 'aura');
    q('.judge-side.you').classList.add(passed ? 'win' : 'lose'); q('.judge-side.them').classList.add(passed ? 'lose' : 'win');
    q('.judge-result').textContent = passed ? (grade === 'S' ? 'Perfect win!' : 'You win!') : 'So close!';
    q('.judge-grade').textContent = grade; q('.judge-grade').dataset.grade = grade;
    q('.judge-tally').textContent = `${mine} to ${d.total.them}`;
    q('.judge-final').hidden = false;
    q('.judge-skip').textContent = 'Continue';
    at(2000, board);
  }
  // the board for this brief: shown for a moment, then the show closes by itself
  function board() {
    if (phase === 'board') return;
    const b = d.board ? d.board(totalWith(bonus)) : null;
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
      at(300, () => { tween(scoreEl.you, you, you + off); you += off; });
    });
    t += STEP;
  }
  at(t + 200, final);

  const advance = () => { if (phase === 'rounds') final(); else if (phase === 'final') board(); else end(); };
  const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); advance(); } };
  document.addEventListener('keydown', onKey, true);
  node.addEventListener('click', (e) => {
    const bb = e.target.closest('[data-boost]');
    if (bb) {
      const b = BOOSTS.find((x) => x.id === bb.dataset.boost);
      if (phase !== 'rounds' || used[b.id] || shown >= d.dims.length) return;
      used[b.id] = true; left[b.id] = b.lines;
      bb.classList.add('used', 'on'); bb.disabled = true;
      q('.judge-side.you').classList.add(b.id === 'catwalk' ? 'strut' : 'aura');
      pop('you', `${b.name}!`);
      return;
    }
    if (e.target.closest('.judge-skip')) { if (phase === 'board') end(); else advance(); return; }
    if (phase !== 'rounds') advance();   // during the lines a stray tap does nothing, so boosts are never lost by accident
  });
  active = { node, timers, onKey };
}
