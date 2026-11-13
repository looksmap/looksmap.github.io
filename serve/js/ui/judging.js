// The judging show that plays between Submit and the result sheet. The two stylists stand side by side under the
// lights; each scoring line is revealed in turn with a bar for each side, the totals count up, and the winner is
// announced. A tap speeds it to the end, Skip closes it, and it is skipped entirely when the device asks for less motion.
import { $, esc, reduced } from './app.js';

const STEP = 760;      // one scoring line
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

/**
 * d: { title, you: { name, svg }, them: { name, svg }, dims: [{ label, max, you, them }], total: { you, them }, passed, grade }
 * done() runs exactly once, when the show ends or is skipped.
 */
export function playJudging(d, done) {
  close();
  if (reduced() || !$('#device')) { done(); return; }
  const node = document.createElement('div');
  node.className = 'judge'; node.setAttribute('role', 'dialog'); node.setAttribute('aria-label', 'Judging');
  node.innerHTML = `
    <div class="judge-lights" aria-hidden="true"><i></i><i></i><i></i></div>
    <header class="judge-head"><span class="judge-kicker">Judging</span><h2>${esc(d.title)}</h2></header>
    <div class="judge-stage">
      <div class="judge-side you"><div class="judge-fig">${d.you.svg}</div><div class="judge-plate"><b>${esc(d.you.name)}</b><span class="judge-score" data-score="you">0</span></div></div>
      <div class="judge-vs" aria-hidden="true">VS</div>
      <div class="judge-side them"><div class="judge-fig">${d.them.svg}</div><div class="judge-plate"><b>${esc(d.them.name)}</b><span class="judge-score" data-score="them">0</span></div></div>
    </div>
    <div class="judge-round" aria-live="polite">
      <div class="judge-label">Get ready…</div>
      <div class="judge-bars"><span class="jb you"><b></b><span><i></i></span></span><span class="jb them"><span><i></i></span><b></b></span></div>
      <div class="judge-dots">${d.dims.map(() => '<i></i>').join('')}</div>
    </div>
    <div class="judge-final" hidden><span class="judge-result"></span><span class="judge-grade"></span><span class="judge-tally"></span></div>
    <button class="judge-skip" type="button">Skip</button>`;
  $('#device').appendChild(node);
  const q = (s) => node.querySelector(s);
  const timers = [];
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  let you = 0, them = 0, finalShown = false, ended = false;
  const end = () => { if (ended) return; ended = true; close(); done(); };
  const scoreEl = { you: q('[data-score="you"]'), them: q('[data-score="them"]') };
  const label = q('.judge-label'), bars = { you: q('.jb.you'), them: q('.jb.them') }, dots = [...node.querySelectorAll('.judge-dots i')];

  function round(i) {
    const r = d.dims[i];
    label.textContent = r.label; label.classList.remove('pop'); void label.offsetWidth; label.classList.add('pop');
    for (const k of ['you', 'them']) {
      const bar = bars[k].querySelector('i'), val = bars[k].querySelector('b');
      bar.style.transition = 'none'; bar.style.width = '0%'; void bar.offsetWidth;
      bar.style.transition = ''; bar.style.width = `${Math.round((100 * r[k]) / r.max)}%`;
      val.textContent = `+${r[k]}`;
    }
    const lead = r.you > r.them ? 'you' : r.them > r.you ? 'them' : '';
    dots[i]?.classList.add(lead || 'tie');
    at(300, () => {
      tween(scoreEl.you, you, you + r.you); tween(scoreEl.them, them, them + r.them);
      you += r.you; them += r.them;
      for (const k of ['you', 'them']) { const side = q(`.judge-side.${k}`); side.classList.remove('hit'); void side.offsetWidth; if (lead === k) side.classList.add('hit'); }
    });
  }
  function final() {
    if (finalShown) return;
    finalShown = true;
    for (const t of timers.splice(0)) clearTimeout(t);
    scoreEl.you.textContent = d.total.you; scoreEl.them.textContent = d.total.them;
    dots.forEach((el, i) => { const r = d.dims[i]; if (!el.className) el.classList.add(r.you > r.them ? 'you' : r.them > r.you ? 'them' : 'tie'); });
    q('.judge-round').classList.add('done');
    q('.judge-side.you').classList.add(d.passed ? 'win' : 'lose'); q('.judge-side.them').classList.add(d.passed ? 'lose' : 'win');
    q('.judge-result').textContent = d.passed ? (d.grade === 'S' ? 'Perfect win!' : 'You win!') : 'So close!';
    q('.judge-grade').textContent = d.grade;
    q('.judge-grade').dataset.grade = d.grade;
    q('.judge-tally').textContent = `${d.total.you} to ${d.total.them}`;
    q('.judge-final').hidden = false;
    q('.judge-skip').textContent = 'See results';
    at(2100, end);
  }

  // the script: an opening beat, one beat per scoring line, a rules beat if points were taken off, then the result
  let t = 650;
  d.dims.forEach((_, i) => { at(t, () => round(i)); t += STEP; });
  const off = d.total.you - d.dims.reduce((a, r) => a + r.you, 0);
  if (off < 0) {
    at(t, () => {
      label.textContent = 'Brief rules'; label.classList.remove('pop'); void label.offsetWidth; label.classList.add('pop');
      bars.you.querySelector('b').textContent = `${off}`; bars.them.querySelector('b').textContent = '';
      for (const k of ['you', 'them']) bars[k].querySelector('i').style.width = '0%';
      at(300, () => { tween(scoreEl.you, you, d.total.you); you = d.total.you; });
    });
    t += STEP;
  }
  at(t + 150, final);

  const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopImmediatePropagation(); if (finalShown) end(); else final(); } };
  document.addEventListener('keydown', onKey, true);
  node.addEventListener('click', (e) => { if (e.target.closest('.judge-skip') || finalShown) end(); else final(); });
  active = { node, timers, onKey };
  q('.judge-skip').focus({ preventScroll: true });
}
