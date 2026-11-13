// Wardrobe for a 10k catalogue: owned / catalogue / sets / workshop / looks, with filters, search and paging.
import { route, esc, fmt, houseName, navigate, toast, overlay, closeOverlay, ladder, rerender, $ } from './app.js';
import { LEVELS, state, inventory, item, owns, ownedCount, dye, applyPrint, restore, dismantle, craft, canCraft, recipeFor, craftableNow, setProgress, claimSet, SETS, SET_BY_ID, SWATCHES, DYE_COST, PRINT_COST, deleteLook, hydrate, COLORWAYS, PRINTS } from '../engine/state.js';
import { SLOTS, AES, CATALOG, BY_SLOT } from '../data/catalog.js';
import { renderPim, PIM_VIEWBOX } from '../render/pim.js';
import { tierOf } from '../engine/score.js';
import { lazyThumb, clearThumbs } from './thumbs.js';
import { renderLook } from '../render/figure.js';
import { setLook } from './studio.js';
import { icon } from './icons.js';
export const STARS = { core: '★', edit: '★★', archive: '★★★', icon: '★★★★' };
export const RARITY_WORD = { core: 'Core · 1 star', edit: 'Edit · 2 stars', archive: 'Archive · 3 stars', icon: 'Icon · 4 stars' };

let view = 'owned'; // owned | all | sets | workshop | looks
let filterSlot = 'all';
let filterAes = 'all';
let query = '';
let page = 0;
const PAGE = 48;
let openSet = null;

export function itemDrawer(it, opts = {}) {
  const s = state();
  const owned = owns(it.id);
  const aes = Object.entries(it.aesthetics).sort((a, b) => b[1] - a[1]);
  const dyeable = owned && !['hair', 'makeup'].includes(it.slot) && it.texture !== 'metal';
  const printable = dyeable && ['top', 'bottom', 'dress', 'outer', 'bag', 'scarf', 'head', 'hairAcc'].includes(it.slot);
  const recipe = recipeFor(it.id);
  const set = it.set ? SET_BY_ID[it.set] : null;
  return `<div class="drawer-wrap" role="dialog" aria-label="${esc(it.name)}"><div class="scrim" data-close-drawer></div><aside class="idrawer">
    <button class="close" data-close-drawer>Close ×</button>
    <div class="hero">${it.pim ? renderPim({ [it.slot]: it }, { viewBox: PIM_VIEWBOX }) : renderLook({ [it.slot]: it }, s.avatar, { ghost: it.slot !== 'hair' && it.slot !== 'makeup', depth: true, viewBox: it.slot === 'hair' || it.slot === 'makeup' ? '60 0 240 330' : undefined, shadow: false })}</div>
    <div><div class="eyebrow">${esc(set ? set.name : houseName(it.house))} · <span class="rar-ink ${it.rarity}">${STARS[it.rarity] || '★'}</span> ${esc(RARITY_WORD[it.rarity] || it.rarity)}${it.dyed ? ' · reworked' : ''}${owned ? ' · owned' : ''}</div><h2>${esc(it.name)}</h2></div>
    ${it.desc ? `<p class="muted" style="font-size:13px">${esc(it.desc)}</p>` : ''}
    <dl class="kv">
      <dt>Formality</dt><dd>${ladder(it.formality)} ${['lounge', 'casual', 'smart casual', 'polished', 'cocktail', 'formal', 'black tie'][it.formality]}</dd>
      <dt>Weight</dt><dd>${ladder(it.weight - 1, 4)} ${['heatwave', 'warm', 'mild', 'cold', 'freezing'][it.weight - 1]}</dd>
      <dt>Texture</dt><dd>${esc(it.texture)}${it.shine ? ` · shine ${it.shine}` : ' · matte'}</dd>
      ${['top', 'bottom', 'dress', 'outer'].includes(it.slot) ? `<dt>Volume</dt><dd>${(['slim', 'regular', 'oversized', 'very full'][(it.volume ?? 0) + 1] || 'regular')}</dd>` : ''}
      <dt>Statement</dt><dd>${['supporting', 'interesting', 'hero'][it.statement]}</dd>
      ${it.sharp ? '<dt>Sharp</dt><dd>counts as structure</dd>' : ''}
      ${it.slot === 'shoes' ? `<dt>Heel · toe</dt><dd>${['flat', 'low', 'high'][it.heel]} · ${esc(it.toe)}</dd>` : ''}
      <dt>Colour</dt><dd>${(it.colors || []).map((c) => `<i class="swatch" style="display:inline-block;width:12px;height:12px;background:${c};vertical-align:middle;margin-left:4px"></i>`).join('')}</dd>
      <dt>Price</dt><dd class="num">CR ${fmt(it.price)}</dd>
    </dl>
    <div><div class="eyebrow" style="margin-bottom:6px">Reads as</div><div class="aes-bars">${aes.slice(0, 5).map(([k, v]) => `<div class="aes-bar"><span>${esc(AES[k] || k)}</span><span class="track"><i style="width:${v * 100}%"></i></span></div>`).join('')}</div></div>
    ${dyeable ? `<div><div class="eyebrow" style="margin-bottom:6px">Dye · CR ${DYE_COST.credits} + 1 dye (you’ve ${s.swatches.dye || 0})</div><div class="swatches">${Object.entries(COLORWAYS).map(([k, v]) => `<button class="swatch ${it.color === v.hex ? 'on' : ''}" style="background:${v.hex}" data-dye="${it.id}" data-hex="${v.hex}" title="${k}"></button>`).join('')}</div></div>` : ''}
    ${printable ? `<div><div class="eyebrow" style="margin-bottom:6px">Print · CR ${PRINT_COST.credits} + 1 print block (you’ve ${s.swatches.print || 0})</div><div class="row">${Object.keys(PRINTS).filter((k) => k !== 'none' && k !== 'toile').map((k) => `<button class="chip ${it.print === k ? 'on' : ''}" data-print="${it.id}" data-key="${k}">${k}</button>`).join('')}<button class="chip" data-print="${it.id}" data-key="">plain</button></div></div>` : ''}
    ${it.dyed ? `<button class="btn small ghost" data-restore="${it.id}">Restore original</button>` : ''}
    ${!owned && recipe ? `<div class="recipe"><div class="eyebrow">Craft</div><div class="mono">${Object.entries(recipe.need).map(([k, n]) => `${n} ${esc(SWATCHES[k] || k)} (${s.swatches[k] || 0})`).join(' · ')} · CR ${recipe.credits}</div><button class="btn small ${canCraft(it.id) ? 'primary' : 'ghost'}" data-craft="${it.id}" ${canCraft(it.id) ? '' : 'disabled'}>${canCraft(it.id) ? 'Craft it' : 'Missing swatches'}</button></div>` : ''}
    <div class="sheet-actions">
      ${owned ? `<button class="btn primary block" data-style-with="${it.id}">Style with this</button>` : opts.buyHtml || (it.source === 'atelier' ? `<button class="btn primary block" data-buy="${it.id}" data-close-drawer>Buy · CR ${fmt(it.price)}</button>` : set ? `<span class="chip">Drops in ${esc(set.name)} levels · or craft</span>` : '')}
      ${owned && it.source !== 'starter' && it.slot !== 'hair' ? `<button class="btn ghost block" data-dismantle="${it.id}">Dismantle → ${Object.entries(it.swatches || {}).map(([k, n]) => `${n} ${esc(SWATCHES[k] || k)}`).join(', ')} + CR ${Math.round(it.price * 0.3)}</button>` : ''}
    </div>
  </aside></div>`;
}

function tiles(list, s, extra = () => '') {
  return `<div class="tiles">${list.map((it) => `<button class="tile ${owns(it.id) ? '' : 'ghosted'}" data-item="${it.id}"><div class="img">${lazyThumb(it, s.avatar)}</div><div class="cap"><span class="name">${esc(it.name)}</span><span class="house">${esc(it.set ? SET_BY_ID[it.set]?.name : houseName(it.house))}</span>${extra(it)}</div><span class="mark rar ${it.set ? 'set' : it.rarity}">${it.set ? 'set ' : ''}${STARS[it.rarity] || '★'}</span>${it.dyed ? `<i class="dyed" style="background:${it.color}"></i>` : ''}${!owns(it.id) ? `<span class="mark lock">${icon('lock')}</span>` : ''}</button>`).join('')}</div>`;
}

function filtered(source) {
  let list = source;
  if (filterSlot === 'pim') list = list.filter((i) => i.pim);
  else { list = list.filter((i) => !i.pim); if (filterSlot !== 'all') list = list.filter((i) => i.slot === filterSlot); }
  if (filterAes !== 'all') list = list.filter((i) => (i.aesthetics[filterAes] || 0) >= 0.3);
  if (query) { const q = query.toLowerCase(); list = list.filter((i) => i.name.toLowerCase().includes(q) || (i.set && SET_BY_ID[i.set]?.name.toLowerCase().includes(q)) || houseName(i.house).toLowerCase().includes(q)); }
  return list;
}

function setsView(s) {
  if (openSet) {
    const st = SET_BY_ID[openSet];
    const p = setProgress(st.id);
    const pieces = st.pieceIds.map(item);
    const look = Object.fromEntries(pieces.map((it) => [it.slot, it]));
    return `<div class="section">
      <button class="btn small ghost" data-open-set="">← Sets</button>
      <div class="set-hero"><div class="set-fig">${renderLook(look, { ...s.avatar, hairStyle: st.hairStyle || s.avatar.hairStyle }, { depth: true, shadow: false })}</div>
        <div><div class="eyebrow">${esc(houseName(st.house))} · set · ${p.have}/${p.total}</div><h2 class="display display-l">${esc(st.name)}</h2><p class="muted" style="font-size:13px;margin-top:6px">${esc(st.line)}</p>
        <div class="row" style="margin-top:10px">${p.complete ? (p.claimed ? '<span class="chip good">Completed · reward claimed</span>' : `<button class="btn small primary" data-claim-set="${st.id}">Claim your reward: 60 Thread and 400 credits</button>`) : `<span class="chip">Complete the set for 60 Thread and 400 credits</span>`}<button class="btn small" data-wear-set="${st.id}">Wear what you own</button></div></div></div>
      ${tiles(pieces, s)}
    </div>`;
  }
  return `<div class="section"><div class="set-grid">${SETS.map((st) => { const p = setProgress(st.id); return `<button class="set-card big" data-open-set="${st.id}"><span class="set-thumbs">${st.pieceIds.slice(0, 4).map((id) => lazyThumb(item(id), s.avatar)).join('')}</span><span class="set-cap"><b>${esc(st.name)}</b><span class="mono">${esc(houseName(st.house))} · ${p.have}/${p.total}${p.complete ? ' · complete' : ''}</span><span class="track"><i style="width:${(100 * p.have) / p.total}%"></i></span></span></button>`; }).join('')}</div></div>`;
}

function workshopView(s) {
  const all = craftableNow();
  const craftable = all.slice(0, 48);
  const sw = Object.entries(s.swatches).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  return `<div class="section" style="display:grid;gap:16px">
    <div><div class="eyebrow" style="margin-bottom:6px">Swatches · from levels and dismantling</div><div class="row">${sw.length ? sw.map(([k, n]) => `<span class="chip on">${n} ${esc(SWATCHES[k] || k)}</span>`).join('') : '<span class="muted" style="font-size:12px">None yet. Clear a level.</span>'}</div></div>
    <div class="prose"><p><b>Make.</b> Craft any piece in the catalogue from swatches of its fabric plus 60% of its price. Set pieces also want gold thread.</p><p><b>Destroy.</b> Dismantle a piece you own for its swatches and 30% back. Starter pieces and hair stay.</p><p><b>Dye and print.</b> Open any plain piece you own and dye it one of ${Object.keys(COLORWAYS).length} colours or give it a print. You can always undo it.</p></div>
    <div><div class="section-head"><h2>Craftable now</h2><span class="mono muted">${all.length} pieces</span></div>${craftable.length ? tiles(craftable, s, (it) => `<span class="price num">${Object.entries(recipeFor(it.id).need).map(([k, n]) => `${n} ${SWATCHES[k] || k}`).join(' · ')} · CR ${recipeFor(it.id).credits}</span>`) : '<p class="empty">Nothing craftable with what you’ve. Dismantle duplicates or clear levels for swatches.</p>'}</div>
  </div>`;
}

// The tiles and the pager for the Owned and Catalogue views. Typing in the search box redraws only this part.
function results(s, inv) {
  const list = filtered(view === 'all' ? CATALOG : inv);
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  if (page >= pages) page = pages - 1;
  const shown = list.slice(page * PAGE, page * PAGE + PAGE);
  return `${shown.length ? tiles(shown, s, (it) => (view === 'all' && !owns(it.id) ? `<span class="price num">${it.source === 'atelier' ? `CR ${fmt(it.price)}` : it.set ? 'set drop · craft' : 'drop · craft'}</span>` : '')) : '<p class="empty">Nothing with those filters.</p>'}
    ${pages > 1 ? `<div class="pager"><button class="btn small ghost" data-page="${page - 1}" ${page === 0 ? 'disabled' : ''}>Prev</button><span class="mono">${page + 1} / ${pages} · ${fmt(list.length)} pieces</span><button class="btn small ghost" data-page="${page + 1}" ${page >= pages - 1 ? 'disabled' : ''}>Next</button></div>` : ''}
  `;
}

route('wardrobe', () => {
  const s = state();
  const inv = inventory();
  return `<div class="page-head"><h1>Wardrobe</h1><p class="sub">${ownedCount()} owned of ${fmt(CATALOG.length)} pieces</p></div>
  <div class="filters" style="border-bottom:0;padding-bottom:4px">${[['owned', 'Owned'], ['all', 'Catalogue'], ['sets', `Sets · ${SETS.length}`], ['workshop', 'Workshop'], ['looks', `Looks · ${s.looks.length}`]].map(([k, l]) => `<button class="chip ${view === k ? 'fill' : ''}" data-view="${k}">${l}</button>`).join('')}</div>
  ${view === 'owned' || view === 'all' ? `
  <div class="search"><input type="search" id="wq" placeholder="Search ${view === 'all' ? 'the catalogue' : 'your wardrobe'}: name, set, house" value="${esc(query)}" aria-label="Search"></div>
  <div class="filters">${['all', 'pim', ...Object.keys(SLOTS)].map((k) => `<button class="chip ${filterSlot === k ? 'on' : ''}" data-fslot="${k}">${k === 'all' ? 'All' : k === 'pim' ? 'Pim' : esc(SLOTS[k])}${k === 'pim' ? ` <small>${(view === 'all' ? CATALOG.filter((i) => i.pim).length : inv.filter((i) => i.pim).length)}</small>` : k !== 'all' ? ` <small>${(view === 'all' ? BY_SLOT[k]?.filter((i) => !i.pim).length : inv.filter((i) => i.slot === k && !i.pim).length) || 0}</small>` : ''}</button>`).join('')}</div>
  <div class="filters">${['all', ...Object.keys(AES)].map((k) => `<button class="chip ${filterAes === k ? 'on' : ''}" data-faes="${k}">${k === 'all' ? 'Any aesthetic' : esc(AES[k])}</button>`).join('')}</div>
  <div class="section" id="wres">${results(s, inv)}</div>` : view === 'sets' ? setsView(s) : view === 'workshop' ? workshopView(s) : `<div class="section">${s.looks.length ? `<div class="looks-row">${s.looks.map((l) => `<div class="look-card"><button data-load-look="${l.id}" title="Open in studio">${Object.values(hydrate(l.items)).some((i) => i.pim) ? renderPim(hydrate(l.items)) : renderLook(hydrate(l.items), s.avatar, { shadow: false })}</button><div class="cap"><span>${esc(l.name).slice(0, 16)}</span><span class="tier t-${tierOf(l.score, LEVELS[l.briefId]?.pass || 68)}">${tierOf(l.score, LEVELS[l.briefId]?.pass || 68)}</span></div><button class="chip" style="margin:0 6px 6px" data-del-look="${l.id}">Delete</button></div>`).join('')}</div>` : '<p class="empty">Save a look in the studio and it appears here.</p>'}</div>`}`;
});

// The search box stays where it is while the player types; only the results under it are redrawn.
document.addEventListener('input', (e) => { if (e.target.id === 'wq') { query = e.target.value; page = 0; const el = $('#wres'); if (el) el.innerHTML = results(state(), inventory()); else rerender(); } });
document.addEventListener('wardrobe:set', (e) => { view = 'sets'; openSet = e.detail; rerender(); });
document.addEventListener('click', (e) => {
  const t = e.target;
  const v = t.closest('[data-view]'); if (v) { view = v.dataset.view; page = 0; openSet = null; rerender(); return; }
  const fs = t.closest('[data-fslot]'); if (fs) { filterSlot = fs.dataset.fslot; page = 0; rerender(); return; }
  const fa = t.closest('[data-faes]'); if (fa) { filterAes = fa.dataset.faes; page = 0; rerender(); return; }
  const pg = t.closest('[data-page]'); if (pg) { page = +pg.dataset.page; rerender(); return; }
  const it = t.closest('[data-item]'); if (it) { overlay(itemDrawer(item(it.dataset.item))); return; }
  if (t.closest('[data-close-drawer]')) { closeOverlay(); return; }
  const d = t.closest('[data-dye]'); if (d) { const r = dye(d.dataset.dye, d.dataset.hex); if (r.ok) { clearThumbs(); overlay(itemDrawer(item(d.dataset.dye))); toast(`Dyed · CR ${DYE_COST.credits} + 1 dye`); rerender(); } else toast('Needs CR 80 and a dye swatch'); return; }
  const pr = t.closest('[data-print]'); if (pr) { const r = applyPrint(pr.dataset.print, pr.dataset.key || null, '#F3F0E8'); if (r.ok) { clearThumbs(); overlay(itemDrawer(item(pr.dataset.print))); toast('Printed'); rerender(); } else toast('Needs CR 140 and a print block'); return; }
  const rs = t.closest('[data-restore]'); if (rs) { restore(rs.dataset.restore); clearThumbs(); overlay(itemDrawer(item(rs.dataset.restore))); rerender(); return; }
  const dm = t.closest('[data-dismantle]'); if (dm) { if (!dm.dataset.confirm) { dm.dataset.confirm = '1'; dm.textContent = 'Tap again to dismantle (can’t be undone)'; return; } const r = dismantle(dm.dataset.dismantle); closeOverlay(); toast(r.ok ? `Dismantled: ${Object.entries(r.swatches).map(([k, n]) => `${n} ${SWATCHES[k] || k}`).join(', ')} + CR ${r.credits}` : 'Can’t dismantle that'); rerender(); return; }
  const cr = t.closest('[data-craft]'); if (cr) { const r = craft(cr.dataset.craft); if (r.ok) { toast(`Crafted ${item(cr.dataset.craft).name}`); overlay(itemDrawer(item(cr.dataset.craft))); rerender(); } else toast('Missing swatches or credits'); return; }
  const os = t.closest('[data-open-set]'); if (os) { openSet = os.dataset.openSet || null; rerender(); return; }
  const cs = t.closest('[data-claim-set]'); if (cs) { const r = claimSet(cs.dataset.claimSet); toast(r.ok ? `Set complete! You earned ${r.thread} Thread and ${r.credits} credits` : 'Not complete yet'); rerender(); return; }
  const ws = t.closest('[data-wear-set]'); if (ws) { const st = SET_BY_ID[ws.dataset.wearSet]; const items = Object.fromEntries(st.pieceIds.filter(owns).map((id) => [item(id).slot, id])); setLook(items); navigate('#studio'); return; }
  const sw = t.closest('[data-style-with]'); if (sw) { closeOverlay(); setLook({ [item(sw.dataset.styleWith).slot]: sw.dataset.styleWith }); navigate('#studio'); return; }
  const ll = t.closest('[data-load-look]'); if (ll) { const l = state().looks.find((x) => x.id === ll.dataset.loadLook); if (l) { setLook(l.items); navigate('#studio'); } return; }
  const dl = t.closest('[data-del-look]'); if (dl) { deleteLook(dl.dataset.delLook); rerender(); return; }
});
