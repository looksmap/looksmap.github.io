// Coach marks for the first level: a cut-out over the thing to tap, Pim in a glass tip, advance on the real action.
import { $ } from './app.js';
import { pimSVG } from './story.js';

let steps = [];
let i = 0;
let el = null;
let onDone = null;
let timer = 0;

export const coachActive = () => !!el;

export function startCoach(list, done) {
  stopCoach();
  steps = list; i = 0; onDone = done;
  el = document.createElement('div');
  el.className = 'coach';
  el.innerHTML = `<div class="coach-hole"></div><div class="coach-tip" role="status"><div class="coach-who">${pimSVG()}</div><div class="coach-body"><p class="coach-text"></p><div class="coach-foot"><span class="coach-step"></span><button class="coach-next" type="button">Next</button></div></div></div>`;
  $('#device').appendChild(el);
  el.querySelector('.coach-next').addEventListener('click', (e) => { e.stopPropagation(); advance(); });
  show();
  timer = setInterval(tick, 220);
}
export function stopCoach() { clearInterval(timer); if (el) el.remove(); el = null; steps = []; i = 0; }

function show() {
  const st = steps[i];
  if (!st) { finish(); return; }
  el.querySelector('.coach-text').textContent = st.text;
  el.querySelector('.coach-step').textContent = `${i + 1} of ${steps.length}`;
  const btn = el.querySelector('.coach-next');
  btn.textContent = st.cta || (i === steps.length - 1 ? 'Done' : 'Next');
  btn.style.display = st.when && !st.next ? 'none' : '';
  el.querySelector('.coach-tip').classList.toggle('waiting', !!st.when && !st.next);
  position();
}
function position() {
  const st = steps[i];
  if (!st || !el) return;
  const hole = el.querySelector('.coach-hole');
  const tip = el.querySelector('.coach-tip');
  const dev = $('#device').getBoundingClientRect();
  const t = st.target && $(st.target);
  if (t) {
    const r = t.getBoundingClientRect();
    const pad = st.pad ?? 6;
    hole.style.cssText = `left:${r.left - dev.left - pad}px;top:${r.top - dev.top - pad}px;width:${r.width + pad * 2}px;height:${r.height + pad * 2}px;opacity:1`;
    const below = r.top - dev.top < dev.height * 0.5;
    tip.style.top = below ? `${r.bottom - dev.top + pad + 12}px` : 'auto';
    tip.style.bottom = below ? 'auto' : `${dev.height - (r.top - dev.top) + pad + 12}px`;
  } else {
    hole.style.cssText = 'opacity:0';
    tip.style.top = 'auto'; tip.style.bottom = '120px';
  }
}
function tick() {
  const st = steps[i];
  if (!st) return;
  if (st.when && st.when()) { advance(); return; }
  position();
}
function advance() { i++; while (i < steps.length && steps[i].when && steps[i].when()) i++; if (i >= steps.length) finish(); else show(); }
function finish() { const d = onDone; stopCoach(); d && d(); }
