import { route, esc, fmt, houseName, navigate, toast, overlay, closeOverlay, bars, rerender, renderTicker, renderWallet, countUp, $ } from './app.js';
import { state, inventory, item, levelBrief, evaluate, submit, nextOpenLevel, setAvatar, hydrate, hydrateOwned, levelUnlocked, modeUnlocked, levelCleared, saveLook, LEVELS, CHAPTERS, CHAPTER_BY_ID, SET_BY_ID, energy, ENERGY, MODES, fabricRuns, resultOf } from '../engine/state.js';
import { SLOTS, AES, BY_ID } from '../data/catalog.js';
import { renderLook, SKIN, HAIR_COLORS, EYES } from '../render/figure.js';
import { renderPim, PIM_SLOTS } from '../render/pim.js';
import { bestSwap, GRADE_WORD, tierOf, dimTier, marginWord } from '../engine/score.js';
import { thumb, lazyThumb, clearThumbs } from './thumbs.js';
import { STARS } from './wardrobe.js';
import { formalWord } from './map.js';
import { icon, SLOT_ICON } from './icons.js';
import { storyFor, portrait } from './story.js';
import { CAST } from '../data/story.js';
import { startCoach, stopCoach, coachActive } from './coach.js';
import { offerSheet, runsSheet } from './atelier.js';
import { OBJ } from './objects.js';
import { MOOD_LABEL } from '../engine/moods.js';
import { playJudging } from './judging.js';
import { markSeen } from '../engine/state.js';
import { shareVerdict, briefLink, copyLink } from './share.js';
import { track } from '../engine/track.js';
import { installState, promptInstall } from './app.js';

// the pieces every outfit needs come first, so they are on screen without scrolling the row
const SLOT_ORDER = ['top', 'bottom', 'dress', 'shoes', 'makeup', 'hair', 'outer', 'bag', 'hosiery', 'head', 'hairAcc', 'eyes', 'ears', 'neck', 'bracelet', 'belt', 'gloves', 'scarf', 'handheld'];
let levelId = null;
let mode = 'normal';
let look = {};
let tab = 'top';
let zoom = false;
let railFilter = '';

const isPim = () => !!LEVELS[levelId]?.pim;
export function setLevel(id, m = 'normal') {
  if (LEVELS[id]?.secret) m = 'secret';
  levelId = id; mode = m;
  try { sessionStorage.setItem('serve.level', JSON.stringify({ id, m })); } catch (e) { /* ignore */ }
  const prev = state().history.find((h) => h.briefId === id);
  look = prev ? hydrateOwned(prev.items) : defaultLook();
  tab = isPim() ? 'dress' : 'top';
}
export function setLook(items) { look = hydrateOwned(items); }
export function currentLook() { return { ...look }; }
function defaultLook() { if (isPim()) return {}; const s = state(); return { hair: item(hairIdForStyle(s.avatar.hairStyle)) }; }
// what the stage shows: Pim in her chapters, the model everywhere else
const figure = (lk, avatar, o = {}) => (isPim() ? renderPim(lk, { viewBox: o.viewBox === '50 0 260 400' ? '60 20 240 300' : (o.viewBox && o.viewBox.startsWith('60 0 240 560') ? '20 0 320 420' : undefined), label: o.label }) : renderLook(lk, avatar, o));
const wardrobeFor = () => inventory().filter((i) => !!i.pim === isPim());
const hairIdForStyle = (style) => { const id = `hr_${style.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase())}`; return BY_ID[id] ? id : 'hr_long_wavy'; };

function resolveBrief() {
  if (!levelId) { try { const j = JSON.parse(sessionStorage.getItem('serve.level') || 'null'); if (j) { levelId = j.id; mode = j.m; } } catch (e) { /* ignore */ } }
  if (!levelId || !Object.hasOwn(LEVELS, levelId) || !levelUnlocked(levelId)) { levelId = (nextOpenLevel() || LEVELS['c1-1']).id; mode = 'normal'; }
  if (!Object.hasOwn(MODES, mode) || !modeUnlocked(levelId, mode)) mode = LEVELS[levelId].secret ? 'secret' : 'normal';
  return levelBrief(levelId, mode);
}

function equip(it) {
  if (!it) return;
  if (look[it.slot]?.id === it.id) { if (it.slot !== 'hair') delete look[it.slot]; return; }
  look[it.slot] = it;
  if (it.slot === 'dress') { delete look.top; delete look.bottom; }
  if (it.slot === 'top' || it.slot === 'bottom') delete look.dress;
}
const worn = () => Object.values(look).filter((i) => i && i.slot !== 'hair');

/* ---------- pieces ---------- */
function briefStrip(b) {
  const ch = CHAPTERS.find((c) => c.id === b.chapter);
  const s = state();
  const res = resultOf(b.id, mode);
  return `<div class="brief-strip" style="--accent:${ch?.accent || 'var(--cherry)'}">
    <div>
      <div class="eyebrow">${esc(ch?.title || '')} · ${b.secret ? 'secret' : `level ${b.index} · ${MODES[mode].label.toLowerCase()}`}${res?.passed ? ` · best ${res.grade}` : ''}${mode === 'hard' ? ` · ${fabricRuns(b.id).left} run${fabricRuns(b.id).left === 1 ? '' : 's'} left today` : ''}</div>
      <h2>${esc(b.title)}</h2>
      <div class="row"><span class="chip on">${formalWord(b.formality)}</span>${b.mood.map((m, i) => `<span class="chip ${i === 0 ? 'on' : ''}">${esc(MOOD_LABEL(m))}</span>`).join('')}${b.required?.length ? `<span class="chip">needs ${b.required.map((x) => (SLOTS[x] || x).toLowerCase()).join(', ')}</span>` : ''}${b.adapt ? `<span class="chip cherry">${b.adapt.kind}</span>` : ''}</div>
    </div>
    <button class="info" data-open-brief title="The full brief">${icon('chat')}</button>
  </div>`;
}

function stage(b) {
  const s = state();
  const w = worn();
  // live hints: on easy mode, and after two misses on the same level, the stage shows the most useful next change
  const tip = b.assist && w.length ? evaluate(look, b).critique.find((n) => n) : '';
  return `${tip ? `<div class="hint-live"><b>${icon('sparkle')} Hint</b><span>${esc(tip)}</span></div>` : `<span class="corner tl">Look ${String(s.history.length + 1).padStart(3, '0')}${zoom ? ' · close-up' : ''}</span>`}
    ${figure(look, s.avatar, { toile: true, depth: true, viewBox: zoom ? '50 0 260 400' : undefined, shadow: !zoom })}
    <span class="corner bl">${w.length ? esc(w.map((i) => i.name).join(' · ')) : 'Choose a category below to start dressing'}</span>`;
}

function drawer() {
  const s = state();
  const inv = wardrobeFor();
  const pim = isPim();
  if (pim && !PIM_SLOTS.includes(tab)) tab = 'dress';
  const tabs = (pim ? PIM_SLOTS : [...SLOT_ORDER, 'model']).map((k) => `<button role="tab" aria-selected="${tab === k}" data-tab="${k}">${icon(SLOT_ICON[k] || 'hanger')}${k === 'model' ? 'Model' : esc(SLOTS[k])}${look[k] && (k !== 'hair' || look[k].render?.style !== s.avatar.hairStyle) ? '<i></i>' : ''}</button>`).join('');
  let body;
  if (tab === 'model') {
    body = `<div class="model-panel">
      <div class="swatches">${Object.entries(SKIN).map(([k, v]) => `<button class="swatch ${s.avatar.skin === k ? 'on' : ''}" style="background:${v}" data-skin="${k}" title="skin ${k}"></button>`).join('')}</div>
      <div class="swatches">${Object.entries(HAIR_COLORS).map(([k, v]) => `<button class="swatch ${s.avatar.hairColor === k ? 'on' : ''}" style="background:${v}" data-haircolor="${k}" title="hair ${k}"></button>`).join('')}</div>
      <div class="swatches">${Object.entries(EYES).map(([k, v]) => `<button class="swatch ${s.avatar.eyes === k ? 'on' : ''}" style="background:${v};border-radius:50%" data-eyes="${k}" title="eyes ${k}"></button>`).join('')}</div>
    </div>`;
  } else {
    let items = inv.filter((i) => i.slot === tab);
    if (railFilter) { const q = railFilter.toLowerCase(); items = items.filter((i) => i.name.toLowerCase().includes(q) || (SET_BY_ID[i.set]?.name || '').toLowerCase().includes(q)); }
    items.sort((a, b) => (b.set ? 1 : 0) - (a.set ? 1 : 0) || a.name.localeCompare(b.name));
    body = `<div class="rail-tiles">${look[tab] && tab !== 'hair' ? `<button class="remove" data-unequip="${tab}">Take off</button>` : ''}${items.slice(0, 80).map((it) => `<button class="tile ${look[tab]?.id === it.id ? 'on' : ''}" data-equip="${it.id}" title="${esc(it.name)}"><div class="img">${lazyThumb(it, s.avatar)}</div><div class="cap"><span class="name">${esc(it.name)}</span></div>${look[tab]?.id === it.id ? '<span class="mark">On</span>' : ''}<span class="mark rar ${it.set ? 'set' : it.rarity}">${STARS[it.rarity] || '★'}</span></button>`).join('')}${items.length > 80 ? `<span class="remove">+${items.length - 80} more in wardrobe</span>` : ''}${items.length ? '' : `<p class="empty">Nothing here yet. Clear levels, craft something, or visit the shop.</p>`}</div>`;
  }
  return `<div class="slot-tabs" role="tablist">${tabs}</div>${body}`;
}

route('studio', () => {
  const b = resolveBrief();
  return `<div class="studio">
    ${briefStrip(b)}
    <div class="stage" id="stage">${stage(b)}</div>
    <div class="drawer" id="rail">${drawer()}</div>
    <div class="actions">
      <button class="btn ghost small" data-clear>Clear</button>
      <button class="btn ghost small" data-save-look>Save</button>
      <button class="btn primary" data-submit ${worn().length ? '' : 'disabled'}>${b.tutorial ? 'Submit' : `Submit ${icon('bolt')}${MODES[mode].cost}`}</button>
    </div>
  </div>`;
}, { fixed: true });

// keepRail: the outfit changed but the pieces on offer did not, so the rail keeps its tiles and only its marks change
function refresh(keepRail = false) {
  const b = resolveBrief();
  const st = $('#stage'); if (st) st.innerHTML = stage(b);
  const sub = $('[data-submit]'); if (sub) sub.toggleAttribute('disabled', !worn().length);
  const railEl = $('#rail'); if (!railEl) return;
  if (keepRail && syncRail(railEl)) return;
  railEl.innerHTML = drawer(); keepTabInView();
}
// Bring the rail in line with the outfit without redrawing it: the dot on each category that has something on,
// the "On" mark on the piece being worn, and the "Take off" button. Returns false when the rail has no tiles to keep.
function syncRail(railEl) {
  const row = railEl.querySelector('.rail-tiles');
  if (!row || tab === 'model') return false;
  const s = state();
  for (const btn of railEl.querySelectorAll('[data-tab]')) {
    const k = btn.dataset.tab;
    const want = !!(look[k] && (k !== 'hair' || look[k].render?.style !== s.avatar.hairStyle));
    const dot = btn.lastElementChild?.localName === 'i' ? btn.lastElementChild : null;
    if (want && !dot) btn.appendChild(document.createElement('i')); else if (!want && dot) dot.remove();
  }
  const onId = look[tab]?.id;
  for (const tile of row.querySelectorAll('.tile[data-equip]')) {
    const on = tile.dataset.equip === onId;
    if (tile.classList.contains('on') === on) continue;
    tile.classList.toggle('on', on);
    const mark = tile.querySelector('.mark:not(.rar)');
    if (on) { const m = document.createElement('span'); m.className = 'mark'; m.textContent = 'On'; tile.insertBefore(m, tile.querySelector('.mark.rar')); } else if (mark) mark.remove();
  }
  const want = !!(look[tab] && tab !== 'hair');
  const off = row.querySelector('[data-unequip]');
  if (want !== !!off) {
    // when the row has been scrolled, the tiles stay where they are under the finger
    const ref = row.querySelector('.tile'); const x = ref ? ref.offsetLeft : 0; const at = row.scrollLeft;
    if (want) { const b = document.createElement('button'); b.className = 'remove'; b.dataset.unequip = tab; b.textContent = 'Take off'; row.insertBefore(b, row.firstChild); } else off.remove();
    if (at > 0 && ref) row.scrollLeft = Math.max(0, at + ref.offsetLeft - x);
  } else if (off) off.dataset.unequip = tab;
  keepTabInView();
  return true;
}
// redrawing the rail resets the category row to its start; bring the open category back into view
function keepTabInView() { const el = $('#rail [role="tab"][aria-selected="true"]'); const row = el?.parentElement; if (el && row) row.scrollLeft = Math.max(0, el.offsetLeft - (row.clientWidth - el.offsetWidth) / 2); }

/* ---------- sheets ---------- */
function briefSheet(b) {
  const drop = item(b.item);
  return `<div class="sheet-wrap" role="dialog" aria-label="Brief"><div class="scrim" data-close-sheet></div><aside class="sheet">
    <button class="close" data-close-sheet>Close ×</button>
    <div><div class="eyebrow">${esc(b.client)}</div><h2 class="display display-m" style="margin-top:4px">${esc(b.title)}</h2></div>
    <p class="muted" style="font-size:13.5px">${esc(b.copy)}</p>
    <div class="spec">
      <div class="row"><span class="k">Occasion</span><span class="v"><span class="chip on">${formalWord(b.formality)}</span>${b.tolerance === 0 ? '<span class="chip cherry">strict</span>' : ''}</span></div>
      <div class="row"><span class="k">Vibe</span><span class="v">${b.mood.map((m, i) => `<span class="chip ${i === 0 ? 'on' : ''}">${esc(MOOD_LABEL(m))}</span>`).join('')}</span></div>
      <div class="row"><span class="k">Weather</span><span class="v"><span class="chip">${['', 'heatwave', 'warm', 'mild', 'cold', 'freezing'][b.weather] || b.weather}</span></span></div>
      ${b.required?.length ? `<div class="row"><span class="k">Must wear</span><span class="v">${b.required.map((x) => `<span class="chip">${esc(SLOTS[x] || x)}</span>`).join('')}</span></div>` : ''}
      ${b.mustTexture ? `<div class="row"><span class="k">Include</span><span class="v"><span class="chip">${esc(b.mustTexture)}</span></span></div>` : ''}
      ${b.forbid ? `<div class="row"><span class="k">Avoid</span><span class="v">${[...(b.forbid.textures || []), ...(b.forbid.items || []).map((id) => BY_ID[id]?.name.toLowerCase()), ...(b.forbid.slots || []), ...(b.forbid.colors ? ['listed colours'] : []), ...(b.forbid.prints ? ['prints'] : []), ...(b.forbid.heels ? ['heels'] : [])].map((x) => `<span class="chip">${esc(x)}</span>`).join('')}</span></div>` : ''}
      <div class="row"><span class="k">Rival</span><span class="v"><span class="chip on">a stylist at your level</span><span class="chip num">${b.credits} credits</span>${drop ? `<span class="chip">drops ${esc(drop.name)}</span>` : ''}</span></div>
    </div>
    ${b.adapt ? `<div class="adapt"><span class="mono">${b.adapt.kind.toUpperCase()}</span> ${esc(b.adapt.text)}${b.adapt.bonus ? ` (+${b.adapt.bonus} credits)` : ''}. <a href="#you" style="text-decoration:underline">Why?</a></div>` : ''}
    <p class="muted" style="font-size:12px">The first vibe word matters most, so start with that one.</p>
  </aside></div>`;
}

function versusBars(mine, theirs) {
  return `<div class="vbars"><div class="vhead"><span></span><span>you</span><span>them</span></div>${mine.map((d, i) => { const t = theirs[i]?.score ?? 0; const win = d.score > t ? 'win' : d.score < t ? 'lose' : 'tie'; return `<div class="vrow ${win}"><span class="k">${esc(d.label)}</span><span class="tr"><i style="width:${(100 * d.score) / d.max}%"></i><em class="tier t-${dimTier(d.score, d.max)}">${dimTier(d.score, d.max)}</em></span><span class="tr them"><i style="width:${(100 * t) / d.max}%"></i><em class="tier t-${dimTier(t, d.max)}">${dimTier(t, d.max)}</em></span>${d.critic ? `<span class="crit">${esc(d.critic)}</span>` : ''}</div>`; }).join('')}</div>`;
}

let lastVerdict = null;
function installNudge(s) {
  const st = installState();
  if (st.standalone || s.seen.installNudge || s.history.length < 1) return '';
  if (st.canPrompt) return `<div class="install-nudge">${OBJ.star(28, '#5FC9C0')}<div><b>Keep Serve on your Home Screen</b><span>Opens like an app, no download.</span></div><button class="btn small primary" data-install>Add</button><button class="btn small ghost" data-install-later>Later</button></div>`;
  if (st.ios) return `<div class="install-nudge">${OBJ.star(28, '#5FC9C0')}<div><b>Keep Serve on your Home Screen</b><span>Tap Share in Safari, then “Add to Home Screen”.</span></div><button class="btn small ghost" data-install-later>Got it</button></div>`;
  return '';
}
function resultsSheet(res, b) {
  const s = state();
  const swap = bestSwap(look, b, wardrobeFor(), res.total);
  const next = nextOpenLevel();
  const rewardItems = res.rewards.items.map((id) => item(id)).filter(Boolean);
  const sw = Object.entries(res.rewards.swatches || {});
  const st = storyFor(b.id);
  const lines = (res.passed ? st.win : st.lose) || [];
  const line = lines[0];
  return `<div class="sheet-wrap" role="dialog" aria-label="Result"><div class="scrim" data-close-sheet></div><aside class="sheet">
    <button class="close" data-close-sheet>Close ×</button>
    <div class="eyebrow">${esc(b.title)} · ${MODES[res.rewards.mode]?.label.toLowerCase() || 'normal'}</div>
    ${res.rewards.perfectNow ? `<div class="levelup gold">${OBJ.star(40)}<div><b>Perfect chapter</b><span>You earned an S on every level in every mode. The secret level is open, and you’ve won 150 Thread.</span></div></div>` : ''}
    ${line ? `<div class="story-inline"><div class="story-portrait sm ${line[0]}">${portrait(line[0], s.avatar)}</div><div><div class="story-name">${esc(line[0] === 'you' ? (s.avatar.name || 'You') : CAST[line[0]]?.name || line[0])}</div><p>${esc(line[1])}</p>${lines[1] ? `<div class="story-name" style="margin-top:6px">${esc(lines[1][0] === 'you' ? (s.avatar.name || 'You') : CAST[lines[1][0]]?.name || lines[1][0])}</div><p>${esc(lines[1][1])}</p>` : ''}</div></div>` : ''}
    ${(() => { const o = res.rewards.opponent; const m = res.rewards.margin; return `<div class="versus">
      <div class="vs-col you"><div class="vs-fig">${figure(look, s.avatar, { depth: true, shadow: false, viewBox: '60 0 240 560' })}</div><b>${esc(b.pim ? 'Your Pim' : s.avatar.name || 'You')}</b><span class="n tier t-${res.grade} ${res.passed ? '' : 'fail'}">${res.grade}</span></div>
      <div class="vs-mid"><span class="vs-word">${res.passed ? (m === 0 ? 'Tie' : 'Won') : 'Lost'}</span><span class="vs-by">${marginWord(m).replace(/^(Won|Lost) /, '')}</span><span class="stamp ${res.passed ? '' : 'no'}">${res.grade === 'S' ? 'perfect' : res.passed ? 'cleared' : 'not yet'}</span></div>
      <div class="vs-col them"><div class="vs-fig">${figure(hydrate(o.look), o.bot.avatar, { depth: true, shadow: false, viewBox: '60 0 240 560', pose: 'mirror' })}</div><b>${esc(b.pim ? `${o.bot.name}’s Pim` : o.bot.name)}</b><span class="n tier t-${tierOf(o.total, b.pass)}">${tierOf(o.total, b.pass)}</span></div>
    </div>
    <p class="muted small vs-note">${res.passed ? (res.firstPass ? 'Cleared. The next level is open.' : b.tutorial ? 'Cleared again. The first level is for practice, so replays earn nothing.' : 'Cleared again. Replays pay 30% of the credits and sometimes give you a piece.') : `Beat ${esc(o.bot.name)} by a clear margin to earn an S. You still earned ${res.rewards.xp} XP for trying.`}</p>`; })()}
    <div class="share-row"><button class="btn small primary" data-share-verdict>${icon('camera')} Share your result</button><button class="btn small ghost" data-copy-brief>Copy brief link</button></div>
    ${installNudge(s)}
    ${res.rewards.levelUps?.length ? res.rewards.levelUps.map((u) => `<div class="levelup">${OBJ.star(40)}<div><b>Level ${u.level}</b><span>Your energy now goes up to ${u.energyMax} and has been refilled. You also earned ${u.credits} credits${u.thread ? ` and ${u.thread} Thread` : ''}.</span></div></div>`).join('') : ''}
    ${res.passed ? `<div class="rewards"><div class="mono">You earned <b>${fmt(res.rewards.credits)} credits</b> · <b>${res.rewards.xp} XP</b>${res.rewards.thread ? ` · <b>${res.rewards.thread} Thread</b>` : ''}${sw.length ? ` · ${sw.map(([k, n]) => `${n} ${esc(k)}`).join(', ')}` : ''}${res.rewards.bonus.length ? `<span class="muted"> · ${res.rewards.bonus.map(esc).join(' · ')}</span>` : ''}</div>${rewardItems.map((it) => `<div class="reward-item"><div class="img">${thumb(it, s.avatar)}</div><div><div style="font-size:13px">${esc(it.name)}</div><div class="mono muted">${esc(SET_BY_ID[it.set]?.name || houseName(it.house))} · added to wardrobe</div></div></div>`).join('')}</div>` : ''}
    ${res.rewards.perfect && !b.secret ? `<div class="perfect-line ${res.grade === 'S' ? 's' : ''}"><span>${icon('star')} ${res.grade === 'S' ? `S on ${MODES[res.rewards.mode].label.toLowerCase()}${res.rewards.firstS ? ' · new' : ''}` : `${res.passed ? 'cleared, not perfect' : 'not yet'} · an S here counts toward the secret level`}</span><b class="num">${res.rewards.perfect.have}/${res.rewards.perfect.total}</b></div>` : ''}
    ${versusBars(res.dims, res.rewards.opponent.dims)}
    <ul class="notes">${res.critique.map((n) => `<li class="${res.dims.some((d) => d.praise.includes(n)) ? 'good' : ''}">${esc(n)}</li>`).join('')}</ul>
    ${swap ? `<div class="swap"><span>Tip: ${swap.item ? (look[swap.slot] ? `wearing <b>${esc(swap.item.name)}</b> instead of ${esc(look[swap.slot].name)}` : `adding <b>${esc(swap.item.name)}</b>`) : `taking off <b>${esc(look[swap.slot]?.name)}</b>`} would raise your score to ${swap.score}.</span><button class="btn small" data-apply-swap="${swap.item?.id || ''}" data-swap-slot="${swap.slot}" data-close-sheet>Try it</button></div>` : ''}
    <div class="sheet-actions">
      ${res.passed && next && next.id !== b.id ? `<button class="btn primary block" data-next="${next.id}">Next: ${esc(next.title)}</button>` : ''}
      <a class="btn block" href="#map" data-close-sheet>Back to the map</a>
      <button class="btn ghost block" data-close-sheet>Restyle</button>
    </div>
  </aside></div>`;
}

document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.closest('#stage svg.figure')) { zoom = !zoom; const st = $('#stage'); if (st) st.innerHTML = stage(resolveBrief()); return; }
  const tabBtn = t.closest('[data-tab]'); if (tabBtn) { tab = tabBtn.dataset.tab; const railEl = $('#rail'); if (railEl) { railEl.innerHTML = drawer(); keepTabInView(); } return; }
  const eq = t.closest('[data-equip]'); if (eq) { equip(item(eq.dataset.equip)); refresh(true); return; }
  const un = t.closest('[data-unequip]'); if (un) { delete look[un.dataset.unequip]; refresh(true); return; }
  if (t.closest('[data-clear]')) { look = defaultLook(); refresh(true); return; }
  const sk = t.closest('[data-skin]'); if (sk) { setAvatar({ skin: sk.dataset.skin }); clearThumbs(); refresh(); return; }
  const hc = t.closest('[data-haircolor]'); if (hc) { setAvatar({ hairColor: hc.dataset.haircolor }); clearThumbs(); refresh(); return; }
  const ey = t.closest('[data-eyes]'); if (ey) { setAvatar({ eyes: ey.dataset.eyes }); refresh(); return; }
  const sw = t.closest('[data-apply-swap]'); if (sw) { const id = sw.dataset.applySwap; if (id) equip(item(id)); else delete look[sw.dataset.swapSlot]; closeOverlay(); refresh(); toast('Swap applied'); return; }
  if (t.closest('[data-save-look]')) { const b = resolveBrief(); const r = evaluate(look, b); saveLook(look, b.title, r.total, b.id); toast('Look saved'); if (t.closest('[data-close-sheet]')) closeOverlay(); return; }
  if (t.closest('[data-open-brief]')) { overlay(briefSheet(resolveBrief())); return; }
  if (t.closest('[data-submit]')) {
    const b = resolveBrief();
    const res = submit(look, b);
    if (!res.ok) { if (res.reason === 'energy') overlay(offerSheet('energy')); else if (res.reason === 'attempts') overlay(runsSheet(b.id)); else if (res.reason === 'locked') { toast('That level is not open yet'); navigate('#map'); } else toast('That didn’t go through. Tap again.'); return; }
    if (coachActive()) { stopCoach(); markSeen('coach'); }
    if (look.hair) setAvatar({ hairStyle: look.hair.render.style });
    { const s = state(); const o = res.rewards.opponent; const st = storyFor(b.id); const ln = ((res.passed ? st.win : st.lose) || []).find((l) => l[0] === 'ro') || ((res.passed ? st.win : st.lose) || [])[0]; lastVerdict = { youSvg: figure(look, s.avatar, { depth: true, shadow: false, viewBox: '60 0 240 560' }), themSvg: figure(hydrate(o.look), o.bot.avatar, { depth: true, shadow: false, viewBox: '60 0 240 560', pose: 'mirror' }), name: b.pim ? 'Your Pim' : s.avatar.name || 'You', rival: b.pim ? `${o.bot.name}’s Pim` : o.bot.name, yourTier: res.grade, theirTier: tierOf(o.total, b.pass), word: marginWord(res.rewards.margin), line: ln ? ln[1] : GRADE_WORD[res.grade], brief: b.title, link: briefLink(b.id, mode), pim: !!b.pim }; }
    track('verdict', { id: b.id, mode, grade: res.grade, passed: res.passed, margin: res.rewards.margin, first: res.firstPass });
    if (b.tutorial && res.passed) track('tutorial_done');
    renderTicker(); renderWallet();
    // the judging show first, then the result sheet
    { const s = state(); const o = res.rewards.opponent; const stageBox = '20 0 320 800';
      playJudging({ title: b.title, passed: res.passed, grade: res.grade, total: { you: res.total, them: o.total },
        you: { name: lastVerdict.name, svg: figure(look, s.avatar, { depth: true, shadow: false, viewBox: stageBox }) },
        them: { name: lastVerdict.rival, svg: figure(hydrate(o.look), o.bot.avatar, { depth: true, shadow: false, viewBox: stageBox, pose: 'mirror' }) },
        dims: res.dims.map((d, i) => ({ label: d.label, max: d.max, you: d.score, them: o.dims[i]?.score ?? 0 })),
      }, () => { overlay(resultsSheet(res, b)); if (res.passed) celebrate(res.grade === 'S' ? 36 : 22); }); }
    return;
  }
  if (t.closest('[data-share-verdict]')) { if (lastVerdict) { const btn = t.closest('[data-share-verdict]'); btn.disabled = true; shareVerdict(lastVerdict).then((r) => { btn.disabled = false; toast(r === 'shared' ? 'Shared' : r === 'downloaded' ? 'Saved the card and copied the link' : 'Cancelled'); }); } return; }
  if (t.closest('[data-copy-brief]')) { if (lastVerdict) copyLink(lastVerdict.link).then((ok) => toast(ok ? 'Link copied' : lastVerdict.link)); return; }
  if (t.closest('[data-install]')) { promptInstall().then(() => { markSeen('installNudge'); rerender(); }); return; }
  if (t.closest('[data-install-later]')) { markSeen('installNudge'); t.closest('.install-nudge')?.remove(); return; }
  const nx = t.closest('[data-next]'); if (nx) { closeOverlay(); setLevel(nx.dataset.next, 'normal'); rerender(); return; }
  if (t.closest('[data-close-sheet]')) { closeOverlay(); refresh(); return; }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#overlay')?.firstChild) { closeOverlay(); if ($('#stage')) refresh(); } });

/* ---------- first level: coach marks ---------- */
const has = (sel) => !!document.querySelector(sel);
export { setLook as _setLook };
// A link to one brief (#play/<level>), from a shared result or a brief page. Links replace the history entry so Back
// leaves the game instead of bouncing to the link again, and a level the player has not reached yet is not playable:
// they are told where it is and sent to their own next level.
document.addEventListener('deeplink', (e) => {
  const { id, mode } = e.detail;
  const go = (hash) => { history.replaceState(null, '', hash); window.dispatchEvent(new HashChangeEvent('hashchange')); };
  if (!Object.hasOwn(LEVELS, id)) { go('#map'); return; }
  track('deeplink', { id, mode });
  if (!levelUnlocked(id)) {
    const ch = CHAPTER_BY_ID[LEVELS[id].chapter];
    go('#map');
    toast(`“${LEVELS[id].title}” opens in ${ch.title}. Start with your next level!`, 4200);
    return;
  }
  markSeen('intro');
  setLevel(id, Object.hasOwn(MODES, mode) && mode !== 'secret' && modeUnlocked(id, mode) ? mode : 'normal');
  go('#studio');
});
// Hearts and stars falling over the result when the player wins.
function celebrate(n = 22) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const host = $('#device'); if (!host) return;
  host.querySelectorAll('.confetti').forEach((x) => x.remove());
  const box = document.createElement('div'); box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
  const glyphs = ['♥', '✦', '★', '♥', '✧'], colours = ['#FF5FA8', '#FFB52E', '#B79CFF', '#FF8AC4', '#7FD8FF'];
  box.innerHTML = Array.from({ length: n }, (_, i) => `<i style="--x:${Math.round(Math.random() * 96)}%;--s:${12 + Math.round(Math.random() * 16)}px;--c:${colours[i % colours.length]};--t:${(2.2 + Math.random() * 1.6).toFixed(2)}s;--d:${(Math.random() * 0.7).toFixed(2)}s;--dx:${Math.round(Math.random() * 80 - 40)}px;--rot:${Math.round(Math.random() * 540 - 270)}deg">${glyphs[i % glyphs.length]}</i>`).join('');
  host.appendChild(box);
  setTimeout(() => box.remove(), 4600);
}
// The first level teaches by doing: the Top rail is already open, so the first tap puts something on.
const TUTORIAL = [
  { target: '.brief-strip', text: 'This is your brief. It shows the dress code and the vibe words your outfit should match. The first vibe word matters most.', cta: 'Got it' },
  { target: '#rail .rail-tiles', text: 'Tap the tee to put it on.', when: () => has('[data-tab="top"] i') || has('[data-tab="dress"] i') },
  { target: '[data-tab="bottom"]', text: 'Now tap “Bottom” and choose something to go with it.', when: () => has('[data-tab="bottom"] i') || has('[data-tab="dress"] i'), pad: 4 },
  { target: '[data-tab="shoes"]', text: 'Finish the outfit with a pair of shoes.', when: () => has('[data-tab="shoes"] i'), pad: 4 },
  { target: '[data-submit]', text: 'When you’re happy with the outfit, tap Submit. It will be scored against another stylist’s outfit.', when: () => has('[aria-label="Result"]') },
];
document.addEventListener('view:rendered', (e) => {
  if (e.detail.name !== 'studio') { stopCoach(); return; }
  if (coachActive()) return;
  const b = resolveBrief();
  const s = state();
  if (b.tutorial && !levelCleared(b.id) && !s.seen.coach) startCoach(TUTORIAL, () => markSeen('coach'));
});
