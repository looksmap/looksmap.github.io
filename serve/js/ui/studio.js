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
import { gradeByMargin } from '../engine/bots.js';
import { markSeen } from '../engine/state.js';
import { shareVerdict, briefLink, copyLink, battleLink } from './share.js';
import { canSubmit, previewSubmit, judgeAgainst, opponentFromLook, battleBrief, levelBoard, finishRanked, RANKED, rankOf, ranked } from '../engine/state.js';
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

// A friend battle or a ranked match: { kind: 'battle' | 'ranked', brief, opp, deadline? }. It replaces the story brief
// in the studio until the player leaves; nothing in it touches story progress.
let special = null;
export function setSpecial(ctx) { special = ctx; if (ctx) { levelId = ctx.brief.id; mode = 'normal'; look = defaultLook(); tab = 'top'; } }
export const specialNow = () => special;
const isPim = () => (special ? false : !!LEVELS[levelId]?.pim);
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
  if (special) return special.brief;
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
      <div class="eyebrow">${special ? `${special.kind === 'ranked' ? `Ranked · vs ${esc(special.opp.bot.name)} · ${esc(special.opp.rank.label)} <span class="rank-clock" id="rankClock"></span>` : `Friendly battle · vs ${esc(special.opp.bot.name)}`}` : `${esc(ch?.title || '')} · ${b.secret ? 'secret' : `level ${b.index} · ${MODES[mode].label.toLowerCase()}`}${res?.passed ? ` · best ${res.grade}` : ''}${mode === 'hard' ? ` · ${fabricRuns(b.id).left} run${fabricRuns(b.id).left === 1 ? '' : 's'} left today` : ''}`}</div>
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
      <button class="btn primary" data-submit ${worn().length ? '' : 'disabled'}>${b.battle ? 'Battle!' : b.ranked ? `Submit ${icon('bolt')}${RANKED.cost}` : b.tutorial ? 'Submit' : `Submit ${icon('bolt')}${MODES[mode].cost}`}</button>
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

// Two bars per scoring line. The letter sits where the bar ends, so the grade and the fill always agree
// (S from 90% of the line, A from 75%, B from 60%, C from 40%).
function versusBars(mine, theirs) {
  const bar = (score, max, them) => {
    const p = Math.round((100 * score) / max); const g = dimTier(score, max);
    const at = them ? (p >= 24 ? `right:calc(${p}% - 5px);transform:translateX(100%)` : `right:calc(${p}% + 4px)`) : (p >= 24 ? `left:calc(${p}% - 5px);transform:translateX(-100%)` : `left:calc(${p}% + 4px)`);
    return `<span class="tr ${them ? 'them' : ''}" title="${score} of ${max}"><i style="width:${p}%"></i><em class="tier t-${g}" style="${at}">${g}</em></span>`;
  };
  return `<div class="vbars"><div class="vhead"><span></span><span>you</span><span>them</span></div>${mine.map((d, i) => { const t = theirs[i]?.score ?? 0; const win = d.score > t ? 'win' : d.score < t ? 'lose' : 'tie'; return `<div class="vrow ${win}"><span class="k">${esc(d.label)}</span>${bar(d.score, d.max, false)}${bar(t, d.max, true)}</div>`; }).join('')}</div>`;
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
  const solo = !b.battle && !b.ranked;   // a story level, as opposed to a friend battle or a ranked match
  const lines = solo ? (res.passed ? st.win : st.lose) || [] : [];
  const line = lines[0];
  const rk = res.rewards.ranked;
  return `<div class="sheet-wrap" role="dialog" aria-label="Result"><div class="scrim" data-close-sheet></div><aside class="sheet">
    <button class="close" data-close-sheet>Close ×</button>
    <div class="eyebrow">${esc(b.title)} · ${b.ranked ? 'ranked match' : b.battle ? 'friendly battle' : MODES[res.rewards.mode]?.label.toLowerCase() || 'normal'}</div>
    ${rk ? `<div class="rank-change ${rk.delta >= 0 ? 'up' : 'down'}"><span class="rank-badge t${rk.after.tier}">${esc(rk.after.label)}</span><div><b>${rk.delta >= 0 ? '+' : ''}${rk.delta} rank points</b><span class="rank-bar"><i style="width:${rk.after.into}%"></i></span><small>${rk.after.label !== rk.before.label ? (rk.delta > 0 ? `Promoted from ${esc(rk.before.label)}!` : `Dropped from ${esc(rk.before.label)}`) : `${rk.after.into} of 100 to the next rank`}${rk.streak >= 2 ? ` · ${rk.streak} wins in a row` : ''}</small></div></div>` : ''}
    ${res.rewards.perfectNow ? `<div class="levelup gold">${OBJ.star(40)}<div><b>Perfect chapter</b><span>You earned an S on every level in every mode. The secret level is open, and you’ve won 150 Thread.</span></div></div>` : ''}
    ${line ? `<div class="story-inline"><div class="story-portrait sm ${line[0]}">${portrait(line[0], s.avatar)}</div><div><div class="story-name">${esc(line[0] === 'you' ? (s.avatar.name || 'You') : CAST[line[0]]?.name || line[0])}</div><p>${esc(line[1])}</p>${lines[1] ? `<div class="story-name" style="margin-top:6px">${esc(lines[1][0] === 'you' ? (s.avatar.name || 'You') : CAST[lines[1][0]]?.name || lines[1][0])}</div><p>${esc(lines[1][1])}</p>` : ''}</div></div>` : ''}
    ${(() => { const o = res.rewards.opponent; const m = res.rewards.margin; return `<div class="versus">
      <div class="vs-col you"><div class="vs-fig">${figure(look, s.avatar, { depth: true, shadow: false, viewBox: '60 0 240 560' })}</div><b>${esc(b.pim ? 'Your Pim' : s.avatar.name || 'You')}</b><span class="n tier t-${res.grade} ${res.passed ? '' : 'fail'}">${res.grade}</span></div>
      <div class="vs-mid"><span class="vs-word">${res.passed ? (m === 0 ? 'Tie' : 'Won') : 'Lost'}</span><span class="vs-by">${marginWord(m).replace(/^(Won|Lost) /, '')}</span><span class="stamp ${res.passed ? '' : 'no'}">${res.grade === 'S' ? 'perfect' : res.passed ? 'cleared' : 'not yet'}</span></div>
      <div class="vs-col them"><div class="vs-fig">${figure(hydrate(o.look), o.bot.avatar, { depth: true, shadow: false, viewBox: '60 0 240 560', pose: 'mirror' })}</div><b>${esc(b.pim ? `${o.bot.name}’s Pim` : o.bot.name)}</b><span class="n tier t-${gradeByMargin(-res.rewards.margin, o.total, b.pass)}">${gradeByMargin(-res.rewards.margin, o.total, b.pass)}</span></div>
    </div>
    <p class="muted small vs-note">${b.battle ? (res.passed ? `You beat ${esc(o.bot.name)}’s outfit! Send yours back and see if they can answer it.` : `${esc(o.bot.name)}’s outfit won this time. Restyle and try again, or send them a new challenge.`) : b.ranked ? (res.passed ? 'A ranked win. Keep the streak going for bonus points.' : 'A ranked loss costs a few points. The next match is a new brief and a new rival.') : res.passed ? (res.firstPass ? 'Cleared. The next level is open.' : b.tutorial ? 'Cleared again. The first level is for practice, so replays earn nothing.' : 'Cleared again. Replays pay 30% of the credits and sometimes give you a piece.') : `Beat ${esc(o.bot.name)} by a clear margin to earn an S. You still earned ${res.rewards.xp} XP for trying.`}</p>`; })()}
    <div class="share-row"><button class="btn small primary" data-share-verdict>${icon('camera')} Share your result</button><button class="btn small ghost" data-challenge>${icon('sparkle')} Challenge a friend</button></div>
    ${installNudge(s)}
    ${res.rewards.levelUps?.length ? res.rewards.levelUps.map((u) => `<div class="levelup">${OBJ.star(40)}<div><b>Level ${u.level}</b><span>Your energy now goes up to ${u.energyMax} and has been refilled. You also earned ${u.credits} credits${u.thread ? ` and ${u.thread} Thread` : ''}.</span></div></div>`).join('') : ''}
    ${res.passed ? `<div class="rewards"><div class="mono">You earned <b>${fmt(res.rewards.credits)} credits</b> · <b>${res.rewards.xp} XP</b>${res.rewards.thread ? ` · <b>${res.rewards.thread} Thread</b>` : ''}${sw.length ? ` · ${sw.map(([k, n]) => `${n} ${esc(k)}`).join(', ')}` : ''}${res.rewards.bonus.length ? `<span class="muted"> · ${res.rewards.bonus.map(esc).join(' · ')}</span>` : ''}</div>${rewardItems.map((it) => `<div class="reward-item"><div class="img">${thumb(it, s.avatar)}</div><div><div style="font-size:13px">${esc(it.name)}</div><div class="mono muted">${esc(SET_BY_ID[it.set]?.name || houseName(it.house))} · added to wardrobe</div></div></div>`).join('')}</div>` : ''}
    ${res.rewards.perfect && !b.secret ? `<div class="perfect-line ${res.grade === 'S' ? 's' : ''}"><span>${icon('star')} ${res.grade === 'S' ? `S on ${MODES[res.rewards.mode].label.toLowerCase()}${res.rewards.firstS ? ' · new' : ''}` : `${res.passed ? 'cleared, not perfect' : 'not yet'} · an S here counts toward the secret level`}</span><b class="num">${res.rewards.perfect.have}/${res.rewards.perfect.total}</b></div>` : ''}
    ${versusBars(res.dims, res.rewards.opponent.dims)}
    <ul class="notes">${res.critique.map((n) => `<li class="${res.dims.some((d) => d.praise.includes(n)) ? 'good' : ''}">${esc(n)}</li>`).join('')}</ul>
    ${swap ? `<div class="swap"><span>Tip: ${swap.item ? (look[swap.slot] ? `wearing <b>${esc(swap.item.name)}</b> instead of ${esc(look[swap.slot].name)}` : `adding <b>${esc(swap.item.name)}</b>`) : `taking off <b>${esc(look[swap.slot]?.name)}</b>`} would raise your score to ${swap.score}.</span><button class="btn small" data-apply-swap="${swap.item?.id || ''}" data-swap-slot="${swap.slot}" data-close-sheet>Try it</button></div>` : ''}
    <div class="sheet-actions">
      ${b.ranked ? `<a class="btn primary block" href="#arena" data-close-sheet>Next ranked match</a><a class="btn block" href="#map" data-close-sheet>Back to Chapters</a>` : b.battle ? `<button class="btn primary block" data-challenge>Send your outfit back</button><button class="btn block" data-close-sheet>Restyle and battle again</button><a class="btn ghost block" href="#map" data-close-sheet>Back to Chapters</a>` : `${res.passed && next && next.id !== b.id ? `<button class="btn primary block" data-next="${next.id}">Next: ${esc(next.title)}</button>` : ''}
      <a class="btn block" href="#map" data-close-sheet>Back to the map</a>
      <button class="btn ghost block" data-close-sheet>Restyle</button>`}
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
  if (t.closest('[data-submit]')) { runSubmit(); return; }
  if (t.closest('[data-challenge]')) { sendChallenge(); return; }
  if (t.closest('[data-share-verdict]')) { if (lastVerdict) { const btn = t.closest('[data-share-verdict]'); btn.disabled = true; shareVerdict(lastVerdict).then((r) => { btn.disabled = false; toast(r === 'shared' ? 'Shared' : r === 'downloaded' ? 'Saved the card and copied the link' : 'Cancelled'); }); } return; }
  if (t.closest('[data-copy-brief]')) { if (lastVerdict) copyLink(lastVerdict.link).then((ok) => toast(ok ? 'Link copied' : lastVerdict.link)); return; }
  if (t.closest('[data-install]')) { promptInstall().then(() => { markSeen('installNudge'); rerender(); }); return; }
  if (t.closest('[data-install-later]')) { markSeen('installNudge'); t.closest('.install-nudge')?.remove(); return; }
  const nx = t.closest('[data-next]'); if (nx) { closeOverlay(); setLevel(nx.dataset.next, 'normal'); rerender(); return; }
  if (t.closest('[data-close-sheet]')) { closeOverlay(); refresh(); return; }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#overlay')?.firstChild) { closeOverlay(); if ($('#stage')) refresh(); } });

/* ---------- submit: check, judging show with boosts, then the result ---------- */
let judgingNow = false;
function runSubmit() {
  if (judgingNow) return;
  const b = resolveBrief(), s = state(), sp = special;
  let pre;
  if (sp) {
    if (sp.kind === 'ranked' && energy() < RANKED.cost) { overlay(offerSheet('energy')); return; }
    pre = { r: judgeAgainst(look, b, sp.opp), opp: sp.opp };
  } else {
    const chk = canSubmit(b);
    if (!chk.ok) { if (chk.reason === 'energy') overlay(offerSheet('energy')); else if (chk.reason === 'attempts') overlay(runsSheet(b.id)); else { toast('That level is not open yet'); navigate('#map'); } return; }
    pre = previewSubmit(look, b);
  }
  if (coachActive()) { stopCoach(); markSeen('coach'); }
  stopClock();
  const o = pre.opp, stageBox = '20 0 320 800';
  const myName = b.pim ? 'Your Pim' : s.avatar.name || 'You', rivalName = b.pim ? `${o.bot.name}’s Pim` : o.bot.name;
  judgingNow = true;
  playJudging({ title: b.title, total: { you: pre.r.total, them: o.total }, gradeOf: (y, th) => gradeByMargin(y - th, y, b.pass),
    you: { name: myName, tag: sp?.kind === 'ranked' ? rankOf(ranked().rp).label : '', svg: figure(look, s.avatar, { depth: true, shadow: false, viewBox: stageBox }) },
    them: { name: rivalName, tag: o.rank?.label || '', svg: figure(hydrate(o.look), o.bot.avatar, { depth: true, shadow: false, viewBox: stageBox, pose: 'mirror' }) },
    dims: pre.r.dims.map((d, i) => ({ key: d.key, label: d.label, max: d.max, you: d.score, them: o.dims[i]?.score ?? 0, themBoost: o.dims[i]?.boost || 0 })),
    board: (mine) => ({ title: 'Top stylists on this brief', ...levelBoard(b, o, mine, myName) }),
  }, (bonus) => { judgingNow = false; finishSubmit(b, sp, bonus, myName, rivalName); });
}
function finishSubmit(b, sp, bonus, myName, rivalName) {
  const res = sp ? (sp.kind === 'ranked' ? finishRanked(look, sp, bonus) : judgeAgainst(look, b, sp.opp, bonus)) : submit(look, b, { bonus });
  if (!res.ok) { toast(res.reason === 'energy' ? 'Not enough energy' : 'That didn’t go through. Tap Submit again.'); refresh(); return; }
  const s = state(), o = res.rewards.opponent;
  if (!sp && look.hair) setAvatar({ hairStyle: look.hair.render.style });
  const st = sp ? null : storyFor(b.id);
  const ln = st ? ((res.passed ? st.win : st.lose) || []).find((l) => l[0] === 'ro') || ((res.passed ? st.win : st.lose) || [])[0] : null;
  lastVerdict = { youSvg: figure(look, s.avatar, { depth: true, shadow: false, viewBox: '60 0 240 560' }), themSvg: figure(hydrate(o.look), o.bot.avatar, { depth: true, shadow: false, viewBox: '60 0 240 560', pose: 'mirror' }), name: myName, rival: rivalName, yourTier: res.grade, theirTier: gradeByMargin(-res.rewards.margin, o.total, b.pass), word: marginWord(res.rewards.margin), line: ln ? ln[1] : GRADE_WORD[res.grade], brief: b.title, link: sp ? challengeLink(b) : briefLink(b.id, mode), pim: !!b.pim };
  track('verdict', { id: b.id, mode: sp ? sp.kind : mode, grade: res.grade, passed: res.passed, margin: res.rewards.margin, first: res.firstPass });
  if (b.tutorial && res.passed) track('tutorial_done');
  if (sp?.kind === 'ranked') special = null;   // a ranked match is played once
  renderTicker(); renderWallet();
  overlay(resultsSheet(res, b));
  if (res.passed) celebrate(res.grade === 'S' ? 36 : 22);
}

/* ---------- friend battles ---------- */
const enc = (obj) => btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const dec = (str) => JSON.parse(decodeURIComponent(escape(atob(String(str).replace(/-/g, '+').replace(/_/g, '/')))));
function challengeLink(b) {
  const a = state().avatar;
  const items = Object.fromEntries(Object.entries(look).filter(([, v]) => v).map(([k, v]) => [k, v.id]));
  return battleLink(b.id, enc({ n: (a.name || 'A friend').slice(0, 16), a: { skin: a.skin, hairStyle: a.hairStyle, hairColor: a.hairColor, eyes: a.eyes, lip: a.lip }, i: items }));
}
async function sendChallenge() {
  const b = resolveBrief();
  if (!worn().length) { toast('Put an outfit on first'); return; }
  const url = challengeLink(b), who = state().avatar.name || 'A friend';
  const text = `${who} challenged you to a style battle on Serve: “${b.title}”. Can you beat this outfit?`;
  track('challenge_sent', { id: b.id });
  if (navigator.share) { try { await navigator.share({ title: 'Serve style battle', text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
  toast((await copyLink(url)) ? 'Battle link copied. Send it to a friend!' : url, 3600);
}
// Only known values from a link are used: an avatar is built from the game's own lists, and item ids are looked up.
function readChallenge(payload) {
  try {
    const p = dec(payload);
    const a = p.a || {};
    const avatar = { skin: Object.hasOwn(SKIN, a.skin) ? a.skin : 'fair', hairColor: Object.hasOwn(HAIR_COLORS, a.hairColor) ? a.hairColor : 'blonde', eyes: Object.hasOwn(EYES, a.eyes) ? a.eyes : 'blue', hairStyle: /^[A-Za-z]{1,20}$/.test(a.hairStyle || '') ? a.hairStyle : 'longWavy', lip: /^#[0-9a-fA-F]{6}$/.test(a.lip || '') ? a.lip : '#E2527F' };
    const items = {};
    for (const [slot, id] of Object.entries(p.i || {}).slice(0, 24)) if (typeof id === 'string' && id.length < 80 && (Object.hasOwn(SLOTS, slot) || slot === 'hair')) items[slot] = id;
    const name = String(p.n || 'A friend').replace(/[^\p{L}\p{N} ._'’-]/gu, '').slice(0, 16) || 'A friend';
    return { name, avatar, items };
  } catch (e) { return null; }
}
document.addEventListener('battlelink', (e) => {
  const go = (hash) => { history.replaceState(null, '', hash); window.dispatchEvent(new HashChangeEvent('hashchange')); };
  const brief = battleBrief(e.detail.id), c = brief && readChallenge(e.detail.payload);
  const opp = c && opponentFromLook(brief, c.items, { name: c.name, avatar: c.avatar });
  if (!opp || !(opp.look.dress || opp.look.top)) { go('#map'); toast('That battle link could not be read.', 3600); return; }
  track('challenge_opened', { id: brief.id });
  setSpecial({ kind: 'battle', brief, opp });
  go('#studio');
  toast(`${c.name} challenged you! Style “${brief.title}” and beat their outfit.`, 4600);
});

/* ---------- ranked: the clock ---------- */
let clock = 0;
function stopClock() { clearInterval(clock); clock = 0; }
function startClock() {
  stopClock();
  if (special?.kind !== 'ranked') return;
  const tick = () => {
    if (special?.kind !== 'ranked') { stopClock(); return; }
    const left = Math.max(0, Math.ceil((special.deadline - Date.now()) / 1000));
    const el = $('#rankClock'); if (el) { el.textContent = `${left}s`; el.classList.toggle('low', left <= 15); }
    if (left <= 0) { stopClock(); toast('Time is up! Sending your outfit.'); runSubmit(); }
  };
  clock = setInterval(tick, 500); tick();
}

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
  if (e.detail.name !== 'studio') { stopCoach(); stopClock(); special = null; return; }
  startClock();
  if (coachActive()) return;
  const b = resolveBrief();
  const s = state();
  if (b.tutorial && !levelCleared(b.id) && !s.seen.coach) startCoach(TUTORIAL, () => markSeen('coach'));
});
