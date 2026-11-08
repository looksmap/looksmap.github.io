// Novels → chapters → the map of a chapter. Every level has three modes; an S in all of them, on every level, opens the
// chapter's secret level and its exclusive set. The perfectionist's view: counters everywhere, nothing hidden.
import { route, esc, fmt, houseName, navigate, toast, rerender, overlay, closeOverlay, $ } from './app.js';
import { overall, state, CHAPTERS, NOVELS, chaptersOf, CHAPTER_BY_ID, LEVELS, MODES, chapterUnlocked, chapterCleared, levelUnlocked, modeUnlocked, levelCleared, resultOf, perfectCount, chapterPerfect, secretProgress, novelProgress, nextOpenLevel, markSeen, SET_BY_ID, setProgress, item, energy, ENERGY, fabricRuns, resetFabricRun, SWATCHES } from '../engine/state.js';
import { thumb } from './thumbs.js';
import { setLevel } from './studio.js';
import { sceneSVG, coverSVG, ribbon, WORLD, pinFill } from './mapart.js';
import { icon } from './icons.js';
import { playStory, storyFor } from './story.js';
import { renderLook, SKIN, HAIR_COLORS, EYES } from '../render/figure.js';
import { setAvatar, inventory } from '../engine/state.js';
import { clearThumbs } from './thumbs.js';
import { hydrate } from '../engine/state.js';
import { offerSheet } from './atelier.js';

const FORMAL = ['loungewear', 'casual', 'smart casual', 'polished', 'cocktail', 'formal', 'black tie'];
export const formalWord = (f) => FORMAL[Math.round(f)] || 'any';
let openNovel = null;
let openChapter = null;
let mode = 'normal';
const W = 360;

/* ---------- small parts ---------- */
const medal = (id, m) => { const r = resultOf(id, m); return `<i class="md ${r?.grade === 'S' ? 's' : r?.passed ? 'ok' : ''}" title="${MODES[m].label}${r ? ` · ${r.grade}` : ''}"></i>`; };
const medals = (id) => `<span class="medals">${['easy', 'normal', 'hard'].map((m) => medal(id, m)).join('')}</span>`;
const ring = (have, total, size = 34) => `<span class="ring" style="--p:${total ? Math.round((100 * have) / total) : 0};width:${size}px;height:${size}px"><b>${have}</b></span>`;
function perfectMeter(ch) {
  const p = perfectCount(ch);
  const sp = secretProgress(ch);
  return `<div class="pm ${p.have === p.total ? 'done' : ''}"><div class="pm-head"><span>${icon('star')} <b>Perfect</b> ${p.have} of ${p.total}</span><span class="muted small">${p.have === p.total ? 'secret level open' : `${p.total - p.have} S to go`}</span></div>
    <div class="pm-grid" style="--n:${ch.levels.length}">${ch.levels.map((_, i) => ['easy', 'normal', 'hard'].map((m) => { const r = resultOf(`${ch.id}-${i + 1}`, m); return `<i class="${r?.grade === 'S' ? 's' : r?.passed ? 'ok' : ''}" title="Level ${i + 1} · ${MODES[m].label}"></i>`; }).join('')).join('')}</div>
    <div class="pm-foot"><span>${icon('gift')} exclusive set ${sp.owned} of ${sp.total}</span><span>${sp.cleared ? 'secret cleared' : sp.unlocked ? 'secret level open' : 'locked'}</span></div></div>`;
}

/* ---------- home ---------- */
function heroCard(s, next) {
  const last = s.history[0];
  const look = last ? hydrate(last.items) : {};
  const fig = renderLook(look, s.avatar, { toile: true, depth: true, viewBox: '70 0 220 430', shadow: false });
  const ch = next ? CHAPTER_BY_ID[next.chapter] : null;
  return `<section class="hero-card"><div class="fig">${fig}</div><div class="body">${next ? `<div class="kicker">${icon('pin')} Up next</div><h3>${esc(next.title)}</h3><p class="muted small">${esc(ch.title)} · level ${next.index} · pass ${next.pass}</p><div class="foot"><span class="meta">${next.tutorial ? 'Free' : `${icon('bolt')} ${ENERGY.cost}`} · ${icon('coin')} ${next.credits} · Lv ${s.level}</span><button class="btn small primary" data-open-level="${next.id}">Play</button></div>` : (() => { const gated = CHAPTERS.find((c) => !chapterCleared(c)); return gated ? `<div class="kicker">${icon('lock')} Level ${gated.minLevel} opens ${esc(gated.title)}</div><h3>You are level ${s.level}.</h3><p class="muted small">Replay levels, go for S on hard, or run fabric runs for XP.</p><div class="foot"><span class="meta">${icon('bolt')} ${ENERGY.cost} · ${icon('star')} ${s.xp} XP</span><button class="btn small primary" data-chapter="${CHAPTER_BY_ID[gated.unlock]?.id || 'c1'}">Replay</button></div>` : `<div class="kicker">${icon('crown')} Every chapter cleared</div><h3>Now make them perfect.</h3><div class="foot"><span class="meta">streak ${s.streak}</span><a class="btn small primary" href="#studio">Studio</a></div>`; })()}${s.streak > 1 ? `<div class="meta">${icon('fire')} Day ${s.streak}. Pim respects you now.</div>` : ''}</div></section>`;
}
function novelCard(n) {
  const p = novelProgress(n.id);
  const first = chaptersOf(n.id)[0];
  const open = chapterUnlocked(first);
  return `<button class="novel ${open ? '' : 'locked'}" data-novel="${n.id}">
    <span class="novel-art">${coverSVG(n.cover, 360, 150, { label: false, ns: `-nv${n.id}` })}<span class="novel-num">Novel ${n.id}</span>${open ? '' : `<span class="chapter-lock">${icon('lock')}</span>`}</span>
    <span class="novel-body"><span class="chapter-title">${esc(n.title)}</span><span class="chapter-line">${esc(n.line)}</span>
      <span class="novel-meters"><span>${ring(p.cleared, p.chapters, 30)} cleared</span><span>${ring(p.perfect, p.chapters, 30)} perfect</span><span>${ring(p.secrets, p.chapters, 30)} secrets</span></span>
    </span></button>`;
}
const LIPS = { rose: '#E2527F', nude: '#C4707A', cherry: '#9A1B2E', peach: '#D08A7A', wine: '#6E1F3A', barbie: '#F06BAE', mauve: '#B86B6F', petal: '#E39DB6' };
function homeLook(s) {
  const last = s.history.find((h) => !LEVELS[h.briefId]?.pim);
  if (last) return hydrate(last.items);
  return hydrate({ top: 't_tee', bottom: 'b_jeans', shoes: 's_ballet', hair: `hr_${(s.avatar.hairStyle || 'longWavy').replace(/[A-Z]/g, (m) => '_' + m.toLowerCase())}` });
}
function home(s) {
  const next = nextOpenLevel();
  if (!s.seen.intro) return `<section class="intro">${coverSVG('c1', 360, 250, { label: false, ns: '-intro' })}<div class="intro-body"><h1 class="display display-xl">Serve</h1><p>Answer the brief. Beat the room.</p><button class="btn primary block" data-start-tutorial>${icon('play')} Start</button><p class="muted small">Two minutes with Ro and Pim, then the city.</p></div></section>`;
  const ch = next ? CHAPTER_BY_ID[next.chapter] : null;
  const o = overall();
  const name = s.avatar.name;
  return `<section class="me">
    <div class="me-stage">${coverSVG(ch?.world || 'c1', 360, 420, { label: false, ns: '-me' })}<div class="me-fig">${renderLook(homeLook(s), s.avatar, { depth: true, shadow: true, viewBox: '40 0 280 560' })}</div>
      <button class="glass-btn me-edit" data-edit-avatar aria-label="Customise your avatar">${icon('sparkle')}</button>
      <div class="me-badge">Lv ${s.level}</div>
    </div>
    <div class="me-card">
      <div class="me-name"><h1 class="display">${name ? esc(name) : 'Name her'}</h1><button class="btn small ghost" data-edit-avatar>${name ? 'Customise' : 'Pick a name'}</button></div>
      <div class="me-meta"><span>${icon('star')} ${o.s} S of ${o.sTotal}</span><span>${icon('check')} ${o.cleared} of ${o.levels} cleared</span><span>${icon('hanger')} ${inventory().length} pieces</span></div>
      ${next ? `<div class="me-next"><div><div class="kicker">${icon('pin')} Up next</div><b>${esc(next.title)}</b><span class="muted small">${esc(ch.title)} · level ${next.index}${next.pim ? ' · Pim’s chapter' : ''}</span></div><button class="btn primary" data-play="${next.id}">Play</button></div>` : `<div class="me-next"><div><b>Everything open is cleared.</b><span class="muted small">Replay for S on hard, or run fabric runs for XP.</span></div></div>`}
    </div>
    <h2 class="lt">Novels</h2>
    <div class="novels">${NOVELS.map(novelCard).join('')}</div>
  </section>`;
}
function avatarSheet(s) {
  const a = s.avatar;
  const hairs = inventory().filter((i) => i.slot === 'hair');
  const sw = (map, key, attr, round = false) => `<div class="swatches">${Object.entries(map).map(([k, v]) => `<button class="swatch ${a[key] === k || a[key] === v ? 'on' : ''}" style="background:${v}${round ? ';border-radius:50%' : ''}" data-av-${attr}="${k}" title="${k}"></button>`).join('')}</div>`;
  return `<div class="sheet-wrap" role="dialog" aria-label="Your avatar"><div class="scrim" data-close-sheet></div><aside class="sheet av-sheet">
    <button class="close" data-close-sheet>Done</button>
    <div class="eyebrow">Your avatar</div>
    <div class="av-grid">
      <div class="av-fig">${renderLook(homeLook(s), a, { depth: true, shadow: false, viewBox: '70 0 220 330' })}</div>
      <div class="av-form">
        <label class="field-label">Name<input class="field" type="text" maxlength="16" placeholder="Her name" value="${esc(a.name || '')}" data-av-name autocomplete="off"></label>
        <div class="field-label">Skin${sw(SKIN, 'skin', 'skin')}</div>
        <div class="field-label">Eyes${sw(EYES, 'eyes', 'eyes', true)}</div>
        <div class="field-label">Lip${sw(LIPS, 'lip', 'lip', true)}</div>
        <div class="field-label">Hair colour${sw(HAIR_COLORS, 'hairColor', 'hair')}</div>
      </div>
    </div>
    <div class="field-label" style="margin-top:12px;display:flex;gap:6px;align-items:baseline">Hairstyle <span class="muted" style="text-transform:none;letter-spacing:0">· more drop from levels</span></div>
    <div class="tiles av-hair">${hairs.map((i) => `<button class="tile ${a.hairStyle === i.render.style ? 'on' : ''}" data-av-style="${i.render.style}"><div class="img">${thumb(i, a)}</div><div class="cap"><span class="name">${esc(i.name)}</span></div></button>`).join('')}</div>
  </aside></div>`;
}
function openAvatar() { overlay(avatarSheet(state())); const f = $('[data-av-name]'); if (f && !state().avatar.name) f.focus(); }

/* ---------- a novel: twenty chapter tiles ---------- */
function chapterTile(ch) {
  const open = chapterUnlocked(ch);
  const done = ch.levels.filter((_, i) => levelCleared(`${ch.id}-${i + 1}`)).length;
  const p = perfectCount(ch);
  const sp = secretProgress(ch);
  const prev = ch.unlock ? CHAPTER_BY_ID[ch.unlock] : null;
  const why = !open ? (prev && !chapterCleared(prev) ? `clear ${prev.number}` : `Lv ${ch.minLevel}`) : '';
  return `<button class="ctile ${open ? '' : 'locked'} ${p.have === p.total ? 'perfect' : ''}" data-chapter="${ch.id}">
    <span class="ctile-art">${coverSVG(ch.world, 180, 100, { label: false, ns: `-t${ch.id}` })}<span class="ctile-num">${ch.number}</span>${ch.pim ? '<span class="ctile-pim">Pim</span>' : ''}${open ? '' : `<span class="ctile-lock">${icon('lock')} ${why}</span>`}</span>
    <span class="ctile-body"><b>${esc(ch.title)}</b>
      <span class="ctile-meters"><span class="dots">${ch.levels.map((_, i) => `<i class="${levelCleared(`${ch.id}-${i + 1}`) ? 'on' : ''}"></i>`).join('')}</span>${ring(p.have, p.total, 26)}<span class="sec ${sp.cleared ? 'done' : sp.unlocked ? 'open' : ''}">${icon('star')}</span></span>
      <span class="muted small">${done} of ${ch.levels.length} · ${p.have}/${p.total} perfect${sp.cleared ? ' · secret ✓' : ''}</span>
    </span></button>`;
}
function novelView(n, s) {
  const chs = chaptersOf(n.id);
  const p = novelProgress(n.id);
  return `<section class="novel-view">
    <div class="map-cover">${coverSVG(n.cover, 360, 170, { label: false, ns: `-nh${n.id}` })}
      <div class="map-head"><button class="glass-btn" data-back-novel aria-label="Back to novels">${icon('back')}</button><span class="chip on">Novel ${n.id}</span></div>
      <div class="map-title"><span class="chapter-kicker">${p.cleared} of ${p.chapters} cleared · ${p.perfect} perfect · ${p.secrets} secrets</span><h2 class="display">${esc(n.title)}</h2></div>
    </div>
    <p class="map-line">${esc(n.line)}</p>
    <div class="ctiles">${chs.map(chapterTile).join('')}</div>
  </section>`;
}

/* ---------- a chapter: the map ---------- */
function nodePos(i, n) {
  const H = 120 + (n + 1) * 84;
  const y = H - 60 - i * 84; // start at the bottom, climb up; the secret sits one slot above the last level
  const x = 180 + Math.sin(i * 1.2 + 0.6) * 96;
  return { x, y, H };
}
function mapView(ch, s) {
  const n = ch.levels.length;
  const pts = ch.levels.map((_, i) => nodePos(i, n));
  const secretPos = nodePos(n, n);
  const H = pts[0].H;
  const P = WORLD[ch.world] || WORLD.c1;
  const nodes = ch.levels.map((lv, i) => {
    const id = `${ch.id}-${i + 1}`;
    const unlocked = modeUnlocked(id, mode);
    const res = resultOf(id, mode);
    const p = pts[i];
    const cls = res?.passed ? 'done' : unlocked ? 'open' : 'locked';
    const side = p.x > 180 ? -1 : 1;
    const label = res?.passed ? res.grade : unlocked ? String(i + 1) : '';
    const tagW = lv.title.length * 6.4 + 16;
    return `<g class="node ${cls}" data-level="${id}" transform="translate(${p.x.toFixed(1)},${p.y.toFixed(1)})" tabindex="${unlocked ? 0 : -1}" role="button" aria-label="${esc(lv.title)}">
      <circle r="26" cy="-14" class="halo"/>
      <ellipse class="pshadow" cy="6" rx="13" ry="4"/>
      <circle class="orb" cy="-14" r="15" fill="${pinFill(ch.world, cls)}"/>
      <ellipse class="spec" cx="-5" cy="-21" rx="5.5" ry="3" transform="rotate(-35 -5 -21)"/>
      ${res?.passed || unlocked ? `<text class="lbl" y="-14" text-anchor="middle" dominant-baseline="central">${label}</text>` : `<use href="#i-lock" x="-7" y="-21" width="14" height="14" class="lockic"/>`}
      <g class="tag" transform="translate(${side * 34},${-18})"><rect x="${side > 0 ? 0 : -tagW}" y="-11" width="${tagW}" height="22" rx="11"/><text x="${side > 0 ? 8 : -8}" text-anchor="${side > 0 ? 'start' : 'end'}" dominant-baseline="central">${esc(lv.title)}</text></g>
      <g class="mdl" transform="translate(${side * 34 + (side > 0 ? 8 : -8 - 30)},6)">${['easy', 'normal', 'hard'].map((m, k) => { const r = resultOf(id, m); return `<circle cx="${k * 11 + 4}" cy="0" r="4" class="${r?.grade === 'S' ? 's' : r?.passed ? 'ok' : ''}"/>`; }).join('')}</g>
    </g>`;
  }).join('');
  const sp = secretProgress(ch);
  const sres = resultOf(ch.secret, 'secret');
  const scls = sres?.passed ? 'done' : sp.unlocked ? 'open' : 'locked';
  const pc = perfectCount(ch);
  const secretNode = `<g class="node secret ${scls}" data-level="${ch.secret}" transform="translate(${secretPos.x.toFixed(1)},${secretPos.y.toFixed(1)})" role="button" aria-label="Secret level">
      <circle r="30" cy="-14" class="halo"/>
      <ellipse class="pshadow" cy="6" rx="14" ry="4"/>
      <circle class="orb" cy="-14" r="17" fill="${scls === 'locked' ? pinFill(ch.world, 'locked') : 'url(#secretGold)'}"/>
      <ellipse class="spec" cx="-6" cy="-22" rx="6" ry="3.5" transform="rotate(-35 -6 -22)"/>
      ${scls === 'locked' ? `<use href="#i-lock" x="-7" y="-21" width="14" height="14" class="lockic"/>` : `<use href="#i-star" x="-8" y="-22" width="16" height="16" class="staric"/>`}
      <g class="tag" transform="translate(${secretPos.x > 180 ? -36 : 36},-18)"><rect x="${secretPos.x > 180 ? -118 : 0}" y="-11" width="118" height="22" rx="11"/><text x="${secretPos.x > 180 ? -8 : 8}" text-anchor="${secretPos.x > 180 ? 'end' : 'start'}" dominant-baseline="central">${scls === 'locked' ? `Secret · ${pc.have}/${pc.total}` : sres?.passed ? 'Secret · cleared' : 'Secret · open'}</text></g>
    </g>`;
  const sets = ch.sets.map((id) => SET_BY_ID[id]).filter(Boolean);
  const next = ch.levels.findIndex((_, i) => !resultOf(`${ch.id}-${i + 1}`, mode)?.passed && modeUnlocked(`${ch.id}-${i + 1}`, mode));
  const pathPts = [...pts.map((p) => [p.x, p.y - 8]), [secretPos.x, secretPos.y - 8]];
  const novel = NOVELS.find((x) => x.id === ch.novel);
  return `<section class="map" style="--accent:${P.pin || P.a};--p-ink:${P.ink}">
    <div class="map-cover">${coverSVG(ch.world, 360, 190, { label: false, ns: '-head' })}
      <div class="map-head">
        <button class="glass-btn" data-back aria-label="Back to the novel">${icon('back')}</button>
        <div class="mode-tabs seg" role="tablist">${['easy', 'normal', 'hard'].map((m) => `<button role="tab" aria-selected="${mode === m}" data-mode="${m}">${MODES[m].label}</button>`).join('')}</div>
      </div>
      <div class="map-title"><span class="chapter-kicker">${esc(novel?.title || '')} · chapter ${ch.number} · ${esc(ch.theme)}</span><h2 class="display">${esc(ch.title)}</h2></div>
    </div>
    <p class="map-line">${esc(ch.line)}</p>
    ${perfectMeter(ch)}
    <div class="map-frame"><svg class="map-svg" viewBox="0 0 ${W} ${H}" width="100%" aria-label="Chapter map">
      <defs><radialGradient id="secretGold" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#FFF1B8"/><stop offset=".55" stop-color="#F0B83A"/><stop offset="1" stop-color="#A86F10"/></radialGradient></defs>
      ${sceneSVG(ch.world, W, H)}
      ${ribbon(pathPts, P.dark ? '#F3D9E6' : '#FFFFFF', P.pin || P.a)}
      ${nodes}${secretNode}
    </svg></div>
    ${next >= 0 ? `<div class="map-next"><span>${icon('pin')} Up next on ${MODES[mode].label.toLowerCase()}: <b>${esc(ch.levels[next].title)}</b></span><button class="btn small primary" data-open-level="${ch.id}-${next + 1}">Play</button></div>` : `<div class="map-next"><span>${icon('check')} ${MODES[mode].label} cleared on every level${mode !== 'hard' ? '. try the next mode.' : '. now make them all S.'}</span></div>`}
    <div class="panel"><div class="panel-title">${icon('set')} Sets in this chapter</div>
      <div class="set-row">${sets.map((st) => { const p = setProgress(st.id); return `<button class="set-card" data-set="${st.id}"><span class="set-thumbs">${st.pieceIds.slice(0, 3).map((id) => thumb(item(id), s.avatar)).join('')}</span><span class="set-cap"><b>${esc(st.name)}</b><span class="mono">${esc(houseName(st.house))} · ${p.have}/${p.total}</span></span></button>`; }).join('')}${(() => { const st = SET_BY_ID[`secret_${ch.id}`]; if (!st) return ''; const p = setProgress(st.id); return `<button class="set-card secret-set" data-set="${st.id}"><span class="set-thumbs">${st.pieceIds.slice(0, 3).map((id) => thumb(item(id), s.avatar)).join('')}</span><span class="set-cap"><b>${esc(st.name)}</b><span class="mono">★★★★ exclusive · ${p.have}/${p.total}</span></span></button>`; })()}</div>
    </div>
  </section>`;
}

/* ---------- level sheet with the three modes ---------- */
let sheetMode = null;
function levelSheet(id) {
  const s = state();
  const lv = LEVELS[id];
  const ch = CHAPTER_BY_ID[lv.chapter];
  const e = energy();
  if (lv.secret) {
    const sp = secretProgress(ch);
    const st = SET_BY_ID[lv.exclusive];
    const res = resultOf(id, 'secret');
    const look = st ? Object.fromEntries(st.pieceIds.map(item).map((it) => [it.slot, it])) : {};
    const cost = MODES.secret.cost;
    return `<div class="sheet-wrap" role="dialog" aria-label="${esc(lv.title)}"><div class="scrim" data-close-sheet></div><aside class="sheet">
      <button class="close" data-close-sheet>Close ×</button>
      <div class="eyebrow">${esc(ch.title)} · secret level${res?.passed ? ` · cleared · ${res.grade}` : ''}</div>
      <h2 class="display display-m">${esc(lv.title)}</h2>
      <p class="muted small">${esc(lv.copy)}</p>
      <div class="row"><span class="chip on">${icon('occasion')} ${formalWord(lv.formality)}</span>${lv.mood.map((m, i) => `<span class="chip ${i === 0 ? 'on' : ''}">${esc(m)}</span>`).join('')}<span class="chip cherry">${icon('crown')} twist</span></div>
      <div class="secret-hero"><div class="set-fig">${st ? renderLook(look, { ...s.avatar, hairStyle: st.hairStyle || s.avatar.hairStyle }, { depth: true, shadow: false }) : ''}</div><div><div class="kicker">${icon('gift')} exclusive set</div><b>${esc(st?.name || '')}</b><p class="muted small">${sp.owned} of ${sp.total} pieces. Every clear drops the next one, in order. No luck involved.</p><div class="dots big">${(lv.drops || []).map((pid) => `<i class="${s.owned.includes(pid) ? 'on' : ''}"></i>`).join('')}</div></div></div>
      <dl class="kv"><dt>Judged against</dt><dd>Another stylist at your level, at their strictest</dd><dt>Energy</dt><dd class="num">${icon('bolt')} ${cost} of ${e}</dd><dt>Credits</dt><dd class="num">${icon('coin')} ${lv.credits}</dd></dl>
      <div class="sheet-actions">${sp.unlocked ? `<button class="btn primary block" data-play="${id}" data-play-mode="secret" ${e >= cost ? '' : 'disabled'}>${e >= cost ? `${icon('play')} Style it · ${cost} energy` : 'Not enough energy'}</button>` : `<div class="opt free">${icon('lock')}<span><b>Locked</b><small>S on every level in every mode first: ${perfectCount(ch).have} of ${perfectCount(ch).total}</small></span></div>`}${e < cost ? `<button class="btn ghost block" data-offer>${icon('bolt')} Get energy</button>` : ''}</div>
    </aside></div>`;
  }
  const m = sheetMode || mode;
  const b = { easy: { pass: lv.easyPass }, normal: { pass: lv.pass }, hard: { pass: lv.hardPass } }[m];
  const res = resultOf(id, m);
  const cost = lv.tutorial ? 0 : MODES[m].cost;
  const drop = item(lv.item);
  const unlockedM = modeUnlocked(id, m);
  return `<div class="sheet-wrap" role="dialog" aria-label="${esc(lv.title)}"><div class="scrim" data-close-sheet></div><aside class="sheet">
    <button class="close" data-close-sheet>Close ×</button>
    <div class="eyebrow">${esc(ch.title)} · level ${lv.index}</div>
    <h2 class="display display-m">${esc(lv.title)}</h2>
    <div class="mono">${esc(lv.client)}</div>
    <p class="muted small">${esc(lv.copy)}</p>
    <div class="row"><span class="chip on">${icon('occasion')} ${formalWord(lv.formality)}</span>${lv.mood.map((mo, i) => `<span class="chip ${i === 0 ? 'on' : ''}">${i === 0 ? icon('mood') + ' ' : ''}${esc(mo)}</span>`).join('')}<span class="chip">${icon('weather')} ${['', 'heatwave', 'warm', 'mild', 'cold', 'freezing'][lv.weather]}</span>${lv.required?.length ? `<span class="chip">needs ${lv.required.join(', ')}</span>` : ''}</div>
    <div class="seg modes">${['easy', 'normal', 'hard'].map((mm) => { const r = resultOf(id, mm); const ok = modeUnlocked(id, mm); return `<button aria-selected="${m === mm}" data-sheet-mode="${mm}" ${ok ? '' : 'disabled'}>${MODES[mm].label}<small>${r?.grade ? `best ${r.grade}` : ok ? ({ easy: 'a gentle rival', normal: 'a fair rival', hard: 'a sharp rival' })[mm] : 'clear normal'}</small>${r?.grade === 'S' ? '<i class="sdot"></i>' : ''}</button>`; }).join('')}</div>
    <dl class="kv"><dt>Judged against</dt><dd>Another stylist at your level${m === 'hard' ? ', plus a twist' : m === 'easy' ? '. Looser dress code, hints on' : ''}</dd><dt>Energy</dt><dd class="num">${cost ? `${icon('bolt')} ${cost} of ${e}` : 'Free'}</dd><dt>Credits</dt><dd class="num">${icon('coin')} ${Math.round(lv.credits * MODES[m].credit)}</dd><dt>Fabric</dt><dd>${esc(SWATCHES[lv.fabric] || lv.fabric)}${m === 'hard' ? ' · 40% chance of 2, +1 if you get an S' : levelCleared(id) ? ' · hard mode only now' : ' · 2 on first clear'}</dd></dl>
    ${m === 'hard' ? (() => { const fr = fabricRuns(id); return `<div class="runs"><div class="runs-head"><b>Fabric runs today</b><span class="num">${fr.used} of ${fr.allowance} used${fr.resets ? ` · ${fr.resets} reset${fr.resets > 1 ? 's' : ''}` : ''}</span></div><div class="runs-dots">${Array.from({ length: fr.allowance }, (_, k) => `<i class="${k < fr.used ? 'used' : ''}"></i>`).join('')}</div>${fr.left ? '' : `<div class="row" style="margin-top:8px"><button class="btn small primary" data-reset-run="${id}" ${s.thread >= fr.resetPrice && fr.canReset ? '' : 'disabled'}>Reset · ${fr.resetPrice} ${icon('spool')}</button><button class="btn small" data-reset-ticket="${id}" ${fr.tickets > 0 && fr.canReset ? '' : 'disabled'}>Use a ticket · ${fr.tickets} left</button></div><p class="muted small" style="margin-top:6px">${fr.canReset ? `Up to ${fr.maxResets} resets a day. Free runs come back at midnight.` : 'No more resets today. Free runs come back at midnight.'}</p>`}</div>`; })() : ''}
    ${drop && !levelCleared(id) ? `<div class="reward-item" style="border:1px solid var(--hair);padding:10px;border-radius:var(--r2)"><div class="img">${thumb(drop, s.avatar)}</div><div><div class="mono">${icon('gift')} first clear drops (normal or hard)</div><div style="font-size:13px">${esc(drop.name)}</div><div class="mono">${esc(SET_BY_ID[drop.set]?.name || houseName(drop.house))}${s.owned.includes(drop.id) ? ' · owned' : ''}</div></div></div>` : ''}
    <div class="sheet-actions"><button class="btn primary block" data-play="${id}" data-play-mode="${m}" ${unlockedM && e >= cost && (m !== 'hard' || fabricRuns(id).left) ? '' : 'disabled'}>${!unlockedM ? 'Clear normal first' : m === 'hard' && !fabricRuns(id).left ? 'No runs left today' : e >= cost ? `${icon('play')} Style it on ${MODES[m].label.toLowerCase()}${cost ? ` · ${cost} energy` : ''}` : 'Not enough energy'}</button>${e < cost ? `<button class="btn ghost block" data-offer>${icon('bolt')} Get energy</button>` : ''}</div>
  </aside></div>`;
}

route('map', () => {
  const s = state();
  if (openChapter) { const ch = CHAPTER_BY_ID[openChapter]; if (ch) return mapView(ch, s); }
  if (openNovel) { const n = NOVELS.find((x) => x.id === openNovel); if (n) return novelView(n, s); }
  return home(s);
});

export function startLevel(id, m = 'normal') {
  const s = state();
  const lv = LEVELS[id];
  if (lv?.secret) m = 'secret';
  const st = storyFor(id);
  const seen = (resultOf(id, 'normal')?.attempts || 0) + (resultOf(id, 'easy')?.attempts || 0) > 0;
  const go = () => { setLevel(id, m); navigate('#studio'); };
  if (seen || m === 'hard') go(); else playStory(st.pre, s.avatar, go);
}

document.addEventListener('input', (e) => {
  const f = e.target.closest && e.target.closest('[data-av-name]');
  if (f) setAvatar({ name: f.value.trim().slice(0, 16) });
});
document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.closest('[data-edit-avatar]')) { openAvatar(); return; }
  const sk = t.closest('[data-av-skin]'); if (sk) { setAvatar({ skin: sk.dataset.avSkin }); clearThumbs(); openAvatar(); rerender(); return; }
  const ey = t.closest('[data-av-eyes]'); if (ey) { setAvatar({ eyes: ey.dataset.avEyes }); openAvatar(); rerender(); return; }
  const lp = t.closest('[data-av-lip]'); if (lp) { setAvatar({ lip: LIPS[lp.dataset.avLip] }); openAvatar(); rerender(); return; }
  const hc = t.closest('[data-av-hair]'); if (hc) { setAvatar({ hairColor: hc.dataset.avHair }); clearThumbs(); openAvatar(); rerender(); return; }
  const hs = t.closest('[data-av-style]'); if (hs) { setAvatar({ hairStyle: hs.dataset.avStyle }); openAvatar(); rerender(); return; }
  if (t.closest('.av-sheet') === null && t.closest('[data-close-sheet]') && document.querySelector('.av-sheet')) { rerender(); }
});
document.addEventListener('click', (e) => {
  const t = e.target;
  const nv = t.closest('[data-novel]'); if (nv) { if (nv.classList.contains('locked')) { toast('Finish the novel before it'); return; } openNovel = +nv.dataset.novel; openChapter = null; rerender(); return; }
  if (t.closest('[data-back-novel]')) { openNovel = null; rerender(); return; }
  const c = t.closest('[data-chapter]'); if (c) { const ch = CHAPTER_BY_ID[c.dataset.chapter]; if (!chapterUnlocked(ch)) { const prev = CHAPTER_BY_ID[ch.unlock]; toast(prev && !chapterCleared(prev) ? `Clear chapter ${prev.number} first` : `Reach level ${ch.minLevel} first`); return; } openNovel = ch.novel; openChapter = ch.id; mode = 'normal'; rerender(); return; }
  if (t.closest('[data-back]')) { openChapter = null; rerender(); return; }
  const m = t.closest('[data-mode]'); if (m && !m.disabled) { mode = m.dataset.mode; rerender(); return; }
  const sm = t.closest('[data-sheet-mode]'); if (sm && !sm.disabled) { sheetMode = sm.dataset.sheetMode; const id = $('.sheet [data-play]')?.dataset.play || $('.sheet [data-reset-run]')?.dataset.resetRun; if (id) overlay(levelSheet(id)); return; }
  const nd = t.closest('g.node'); if (nd) { if (nd.classList.contains('locked') && !nd.classList.contains('secret')) { toast(mode === 'hard' ? 'Clear it on normal first' : 'Clear the previous level first'); return; } sheetMode = null; overlay(levelSheet(nd.dataset.level)); return; }
  const ol = t.closest('[data-open-level]'); if (ol) { startLevel(ol.dataset.openLevel, mode); return; }
  const pl = t.closest('[data-play]'); if (pl) { closeOverlay(); startLevel(pl.dataset.play, pl.dataset.playMode || mode); return; }
  if (t.closest('[data-offer]')) { overlay(offerSheet('energy')); return; }
  const rr = t.closest('[data-reset-run]'); if (rr && !t.closest('[data-from-studio]')) { const r = resetFabricRun(rr.dataset.resetRun, false); toast(r.ok ? `Run reset for ${r.price} Thread` : r.reason === 'funds' ? 'Not enough Thread' : 'No more resets today'); overlay(levelSheet(rr.dataset.resetRun)); return; }
  const rt = t.closest('[data-reset-ticket]'); if (rt && !t.closest('[data-from-studio]')) { const r = resetFabricRun(rt.dataset.resetTicket, true); toast(r.ok ? 'Ticket used' : r.reason === 'tickets' ? 'No tickets' : 'No more resets today'); overlay(levelSheet(rt.dataset.resetTicket)); return; }
  if (t.closest('[data-start-tutorial]')) { markSeen('intro'); openNovel = 1; openChapter = 'c1'; startLevel('c1-1', 'normal'); return; }
  const st = t.closest('[data-set]'); if (st) { navigate('#wardrobe'); document.dispatchEvent(new CustomEvent('wardrobe:set', { detail: st.dataset.set })); return; }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.closest && e.target.closest('g.node')) e.target.closest('g.node').dispatchEvent(new MouseEvent('click', { bubbles: true })); });
