// The coherence engine. Scores a look against a brief on nine dimensions (sum 100)
// and explains itself in plain language. No per-item "points": only relationships.
import { paletteReport } from './color.js';
import { MOODS, MOOD_LABEL } from './moods.js';
import { SLOTS } from '../data/catalog.js';
const slotWord = (s) => (s === 'outer' ? 'a coat or jacket' : s === 'shoes' ? 'shoes' : s === 'eyes' ? 'glasses or sunglasses' : s === 'hairAcc' ? 'a hair piece' : s === 'neck' ? 'a necklace' : s === 'gloves' ? 'gloves' : s === 'hosiery' ? 'socks or tights' : s === 'ears' ? 'earrings' : `a ${(SLOTS[s] || s).toLowerCase()}`);
import { bridgeOf, AES } from '../data/catalog.js';

export const DIMS = [
  { key: 'brief', label: 'Brief fit', max: 20 },
  { key: 'palette', label: 'Palette', max: 15 },
  { key: 'silhouette', label: 'Silhouette', max: 12 },
  { key: 'formality', label: 'Formality', max: 12 },
  { key: 'season', label: 'Season', max: 8 },
  { key: 'texture', label: 'Texture', max: 7 },
  { key: 'focal', label: 'Focal point', max: 8 },
  { key: 'complete', label: 'Completeness', max: 8 },
  { key: 'aesthetic', label: 'Aesthetic', max: 10 },
];

const AREA = { dress: 3, outer: 2.6, bottom: 2, top: 1.6, shoes: 0.7, bag: 0.5, hosiery: 0.5, head: 0.4, hairAcc: 0.15, scarf: 0.5, gloves: 0.3, belt: 0.2, neck: 0.15, bracelet: 0.08, ears: 0.1, eyes: 0.1, handheld: 0.2, makeup: 0.05, hair: 0 };
const AES_W = { dress: 3, outer: 2.4, bottom: 2, top: 1.8, shoes: 1.2, bag: 0.8, hosiery: 0.6, head: 0.7, hairAcc: 0.5, scarf: 0.5, gloves: 0.5, belt: 0.4, neck: 0.4, bracelet: 0.25, ears: 0.3, eyes: 0.5, handheld: 0.35, makeup: 0.4, hair: 0.8 };
const GARMENT = new Set(['top', 'bottom', 'dress', 'outer', 'shoes']);
const ACCESSORY = new Set(['head', 'hairAcc', 'eyes', 'ears', 'neck', 'bracelet', 'belt', 'gloves', 'scarf', 'handheld', 'bag']);
const PRINT_SCALE = { plaid: 'large', leopard: 'large', floral: 'large', camo: 'large', zebra: 'large', tiedye: 'large', pinstripe: 'small', polka: 'small', gingham: 'small', houndstooth: 'small', stripe: 'medium', logo: 'small', argyle: 'medium' };
const HIGHLOW_PAIRS = [['satin', 'leather'], ['satin', 'denim'], ['satin', 'nylon'], ['sequin', 'denim'], ['sequin', 'cotton'], ['velvet', 'leather'], ['lace', 'leather'], ['sheer', 'leather'], ['knit', 'satin'], ['wool', 'nylon'], ['wool', 'cotton'], ['metal', 'cotton'], ['metal', 'nylon']];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const r1 = (v) => Math.round(v * 10) / 10;
const mean = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
const title = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function aestheticShares(items) {
  const acc = {};
  let total = 0;
  for (const it of items) {
    const w = AES_W[it.slot] ?? 0.3;
    for (const [k, v] of Object.entries(it.aesthetics || {})) { acc[k] = (acc[k] || 0) + v * w; total += v * w; }
  }
  const shares = {};
  for (const k in acc) shares[k] = acc[k] / (total || 1);
  const ranked = Object.entries(shares).sort((a, b) => b[1] - a[1]);
  return { shares, ranked };
}

// Coherence = how much every piece belongs to the look's lead aesthetic, directly or through a sanctioned bridge.
function coherence(items, lead) {
  if (!lead) return 1;
  let sum = 0, n = 0;
  for (const it of items) {
    const w = AES_W[it.slot] ?? 0.3;
    const aes = it.aesthetics || {};
    const keys = Object.keys(aes);
    if (!keys.length || w < 0.3) continue;
    const wmax = Math.max(...keys.map((k) => aes[k]));
    let best = 0;
    for (const k of keys) {
      const sim = k === lead ? 1 : bridgeOf(k, lead) === 2 ? 0.8 : bridgeOf(k, lead) === 1 ? 0.5 : 0;
      best = Math.max(best, (aes[k] / wmax) * sim);
    }
    sum += best * w; n += w;
  }
  return n ? sum / n : 1;
}

function buildContext(look, brief) {
  const items = Object.values(look).filter(Boolean);
  const garments = items.filter((i) => GARMENT.has(i.slot));
  const entries = [];
  for (const it of items) {
    const w = AREA[it.slot] ?? 0;
    if (!w || !it.colors?.length) continue;
    const cols = it.colors;
    const metal = it.texture === 'metal' || !!it.metal;
    entries.push({ hex: cols[0], w: w * (cols.length > 1 ? 0.7 : 1), item: it, metal });
    if (cols[1]) entries.push({ hex: cols[1], w: w * 0.3, item: it, metal });
  }
  const pal = paletteReport(entries);
  const { shares, ranked } = aestheticShares(items);
  const heroes = items.filter((i) => i.statement === 2).length;
  const sharpCount = items.filter((i) => i.sharp).length;
  const accessoryCount = items.filter((i) => ACCESSORY.has(i.slot)).length;
  const avgL = entries.length ? entries.reduce((s, e) => s + e.w * (pal.chroma.concat(pal.neutrals).find((x) => x.hex === e.hex)?.L ?? 0.5), 0) / entries.reduce((s, e) => s + e.w, 0) : 0.5;
  return {
    items, garments, pal, aes: shares, ranked, lead: ranked[0]?.[0], heroes, sharpCount, accessoryCount, avgL,
    has: (slot) => !!look[slot],
    avgFormality: mean(garments.map((g) => g.formality)),
    avgWeight: mean(garments.map((g) => g.weight)),
    tight: coherence(items, ranked[0]?.[0]),
    brief,
  };
}

// One short line per dimension when it scores well or badly. Picked by a hash of the look so the same outfit always
// gets the same line. Every line has to be true for any outfit with that score, so none of them names a garment.
const CRIT_GOOD = {
  brief: ['This outfit suits the occasion.', 'You followed the brief closely.', 'This is right for where you’re going.', 'The mood words come through clearly.', 'You gave the client what they asked for.', 'This answers the brief well.'],
  palette: ['The colours go well together.', 'The colours are well balanced.', 'These colours suit each other.', 'Nice colour choices.', 'The colours look planned.', 'The colours work as a set.'],
  silhouette: ['The shape of the outfit is balanced.', 'The proportions look good.', 'The outfit has a clear shape.', 'The fit and the shape work well.', 'The outline looks neat from head to toe.', 'The shapes suit each other.'],
  formality: ['Every piece is equally dressy.', 'The pieces match in how formal they are.', 'Nothing is too dressy or too casual for the rest.', 'The outfit is equally dressy from top to shoes.', 'The pieces all belong at the same event.', 'The level of dressiness is even.'],
  season: ['Everything suits the same weather.', 'The fabrics are right for one season.', 'The layers make sense together.', 'All the pieces belong to one season.', 'The weights of the fabrics match.', 'Nothing looks too warm or too light next to the rest.'],
  texture: ['The fabrics look good together.', 'There’s a nice mix of textures.', 'The textures are well balanced.', 'The fabrics add interest without clashing.', 'The mix of fabrics works.', 'The textures suit each other.'],
  focal: ['One piece stands out and the rest support it.', 'The outfit has a clear star piece.', 'It’s easy to see which piece is the main one.', 'The standout piece gets the attention.', 'It’s clear where to look first.', 'The main piece is well supported.'],
  complete: ['The outfit looks finished.', 'Nothing is missing.', 'The accessories finish the outfit nicely.', 'It looks complete from head to toe.', 'Every piece has a job.', 'This is a full outfit.'],
  aesthetic: ['The whole outfit follows one style.', 'Every piece fits the same style.', 'The style is clear and consistent.', 'It all looks like it belongs together.', 'The outfit has one clear idea.', 'The pieces share a style.'],
};
const CRIT_BAD = {
  brief: ['This doesn’t suit the occasion yet.', 'The brief asked for something different.', 'It’s a nice outfit, but for another event.', 'Some of the mood words are missing.', 'Something doesn’t match the brief, so check it again.', 'This is close to the brief, but not quite there.'],
  palette: ['The colours clash a little.', 'Too many colours are competing.', 'The colours need more balance.', 'These colours don’t quite go together.', 'Try fewer colours, or colours that are closer together.', 'The colour mix looks unplanned.'],
  silhouette: ['The shape of the outfit is unbalanced.', 'The outfit needs a clearer shape.', 'The proportions look a bit off.', 'The loose and fitted pieces aren’t balanced.', 'The outline looks heavy in one place.', 'The shapes don’t suit each other yet.'],
  formality: ['Some pieces are much dressier than others.', 'Dressy and casual pieces are mixed without a link.', 'The pieces don’t match in how formal they are.', 'The dressiness changes too much between pieces.', 'The pieces look like they’re going to different events.', 'One piece is at a different level from the rest.'],
  season: ['The pieces are dressed for different weather.', 'Light and heavy pieces are mixed without a reason.', 'The fabrics belong to different seasons.', 'The layers don’t suit the same weather.', 'The outfit can’t decide which season it is.', 'Choose pieces for one kind of weather.'],
  texture: ['The fabrics don’t go together yet.', 'The mix of textures needs work.', 'The textures are either too similar or too many.', 'Changing one fabric would help.', 'The fabrics are competing with each other.', 'The textures need more balance.'],
  focal: ['It’s hard to tell which piece is the star.', 'The outfit needs one clear standout piece.', 'Either nothing stands out or too much does.', 'Choose one piece to lead.', 'It isn’t clear where to look first.', 'The standout pieces need sorting out.'],
  complete: ['The outfit doesn’t look finished yet.', 'Something is missing.', 'It needs another piece or two.', 'The accessories need another look.', 'Add or remove a piece to finish it.', 'It’s nearly a full outfit.'],
  aesthetic: ['The outfit mixes styles that don’t match.', 'Some pieces belong to a different style.', 'The style isn’t clear yet.', 'The pieces don’t share one idea.', 'It looks like two outfits combined.', 'Choose one style and follow it.'],
};
const lookHash = (look) => { let h = 2166136261; for (const k of Object.keys(look).sort()) if (look[k]) { for (const ch of `${k}:${look[k].id}`) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } } return h; };
export function criticLine(dim, good, look) { const pool = (good ? CRIT_GOOD : CRIT_BAD)[dim]; return pool ? pool[lookHash(look) % pool.length] : ''; }

export function scoreLook(look, brief) {
  const c = buildContext(look, brief);
  const { items, garments, pal } = c;
  const dims = {};
  const notes = { good: [], fix: [] };
  const say = (dim, text, good = false) => { (good ? notes.good : notes.fix).push({ dim, text }); };

  if (!garments.length) {
    return { total: 0, grade: 'D', dims: DIMS.map((d) => ({ ...d, score: 0, notes: [], praise: [] })), critique: ['Put on a top, a bottom or a dress to get started.'], context: c, gated: 'undressed', lead: null, palette: null, noise: 0, load: 0, raw: 0, dressed: false };
  }

  /* ---------- 1. Brief fit (20) ---------- */
  let bf = 0; const bfNotes = [];
  const tol = brief.tolerance ?? 1;
  const fDiff = Math.abs(c.avgFormality - brief.formality);
  const fScore = fDiff <= tol + 0.5 ? 8 : fDiff <= tol + 1.5 ? 4 : 0;
  bf += fScore;
  if (fScore < 8) bfNotes.push(c.avgFormality < brief.formality ? `This is too casual for ${brief.occasion ? `“${brief.occasion}”` : 'the occasion'}. Swap one or two pieces for dressier ones.` : `This is too dressy for ${brief.occasion ? `“${brief.occasion}”` : 'the occasion'}. Swap one or two pieces for more casual ones.`);
  const moods = brief.mood || [];
  const moodHits = moods.map((m) => ({ m, ok: MOODS[m] ? MOODS[m].test(c) : true }));
  const moodScore = moods.length ? (8 * moodHits.filter((x) => x.ok).length) / moods.length : 8;
  bf += moodScore;
  for (const x of moodHits) if (!x.ok) bfNotes.push(`The “${MOOD_LABEL(x.m)}” mood is missing.${MOODS[x.m]?.hint ? ` Try ${MOODS[x.m].hint}.` : ''}`);
  const req = [...(brief.pim ? [] : ['shoes']), ...(brief.required || [])];
  const reqOk = req.every((s) => look[s]);
  bf += reqOk ? 2 : 0;
  if (!reqOk) bfNotes.push(`The brief asks for ${req.filter((s) => !look[s]).map(slotWord).join(' and ')}.`);
  const weatherOk = Math.abs(c.avgWeight - (brief.weather ?? 2.5)) <= 1.1;
  bf += weatherOk ? 2 : 0;
  if (!weatherOk) bfNotes.push(c.avgWeight < (brief.weather ?? 2.5) ? 'This outfit is too light for the weather in the brief.' : 'This outfit is too warm for the weather in the brief.');
  if (brief.forbid) {
    const f = brief.forbid;
    const bad = items.filter((i) => (f.items || []).includes(i.id) || (f.textures || []).includes(i.texture) || (f.slots || []).includes(i.slot) || (f.colors || []).some((hex) => i.colors?.includes(hex)));
    if (bad.length) { bf -= 6; bfNotes.push(`The client said no to ${bad.map((b) => b.name.toLowerCase()).join(', ')}.`); }
  }
  if (brief.mustTexture && !garments.some((g) => g.texture === brief.mustTexture)) { bf -= 3; bfNotes.push(`The brief asks for ${brief.mustTexture} somewhere in the outfit.`); }
  dims.brief = clamp(Math.round(bf), 0, 20);
  if (dims.brief >= 18) say('brief', 'You followed the brief really well.', true);
  for (const n of bfNotes) say('brief', n);

  /* ---------- 2. Palette (15) ---------- */
  let ps = 11 * pal.fit;
  if (pal.distinctChromatic <= 3) ps += 2;
  if (pal.dominant >= 0.5) ps += 2;
  if (pal.distinctChromatic > 3) ps -= 3 * (pal.distinctChromatic - 3);
  if (pal.mixedUndertone) ps -= 2;
  if (pal.template === 'flat neutrals') ps -= 1;
  dims.palette = clamp(Math.round(ps), 0, 15);
  if (pal.distinctChromatic > 3) say('palette', `${pal.distinctChromatic} bright colours are competing. Choose one to lead and make the rest neutral.`);
  else if (pal.template === 'adjacent clash') say('palette', 'Two of the colours are close but don’t quite match. Use shades of one colour, or pick colours that clearly contrast.');
  else if (pal.template === 'three-way clash') say('palette', 'Three of the colours don’t relate to each other. Take one away and the other two will look better.');
  else if (pal.mixedUndertone) say('palette', 'Warm and cool colours are clashing. Add a neutral between them, or keep to one side.');
  else if (pal.template === 'flat neutrals') say('palette', 'The neutrals are all the same shade, so the outfit looks flat. Mix light and dark, such as cream with black.');
  else if (dims.palette >= 13) say('palette', `The colours work well together (${pal.template}).`, true);

  /* ---------- 3. Silhouette (12) ---------- */
  const topV = look.dress ? look.dress.volume : look.top?.volume ?? 0;
  const botV = look.dress ? look.dress.volume : look.bottom?.volume ?? 0;
  const vols = [topV, botV];
  if (look.outer) vols.push(look.outer.volume);
  let sil = 0;
  const allBig = vols.every((v) => v === 1);
  const anySlim = vols.some((v) => v === -1);
  if (anySlim) sil += 6;
  else if (allBig) sil += c.sharpCount >= 1 ? 6 : 0;
  else sil += 5;
  if (allBig && c.sharpCount === 0) say('silhouette', 'Everything is oversized. Add a belt, pointed shoes or sleek hair so the loose shapes look deliberate.');
  else if (allBig) say('silhouette', 'The oversized pieces work because one sharp detail balances them.', true);
  // rule of thirds / waist definition
  const topHem = look.top ? (Array.isArray(look.top.render) ? look.top.render[0].hem : look.top.render.hem) : null;
  const botWaist = look.bottom ? (look.bottom.render.waist ?? 300) : null;
  const waistDefined = !!look.belt || (look.dress && look.dress.volume === -1) || (topHem && topHem <= 302) || (botWaist && botWaist <= 296 && topHem && topHem <= 334) || (look.top && look.top.render?.hemStyle === 'corset');
  sil += waistDefined ? 3 : 1;
  if (!waistDefined && !look.dress) say('silhouette', 'The outfit doesn’t show a waist. Tuck in the top, choose a cropped piece or add a belt.');
  // hem-shoe
  const hem = (look.dress || look.bottom)?.hem;
  const sh = look.shoes;
  let hs = 2;
  if (sh && hem) {
    const heelOrPoint = sh.heel >= 1 || sh.toe === 'pointed';
    const bootTall = ['knee', 'thigh'].includes(sh.render?.type);
    if (hem === 'midi') hs = heelOrPoint || bootTall ? 3 : sh.toe === 'chunky' ? 1 : 2;
    else if (hem === 'floor' || hem === 'maxi') hs = sh.heel >= 1 || (sh.toe === 'chunky' && sh.heel === 2) ? 3 : 2;
    else if (hem === 'knee') hs = heelOrPoint || bootTall ? 3 : 2;
    else if (hem === 'mini' || hem === 'micro') hs = 3;
    else hs = heelOrPoint ? 3 : 2;
  }
  sil += hs;
  if (hs === 1) say('silhouette', 'A midi length with chunky flat shoes makes legs look shorter. Try a pointed toe, a low heel or tall boots.');
  if (hs === 2 && (hem === 'floor' || hem === 'maxi') && sh?.heel === 0) say('silhouette', 'A floor-length hem needs shoes with a little height, or it will drag.');
  dims.silhouette = clamp(Math.round(sil), 0, 12);
  if (dims.silhouette >= 11) say('silhouette', 'The proportions are balanced, with a clear waist.', true);

  /* ---------- 4. Formality (12) ---------- */
  const fItems = [look.top, look.bottom, look.dress, look.outer, look.shoes].filter(Boolean);
  const fv = fItems.map((g) => g.formality);
  const fMax = Math.max(...fv), fMin = Math.min(...fv);
  const fRange = fMax - fMin;
  const hi = fItems.find((g) => g.formality === fMax), lo = fItems.find((g) => g.formality === fMin);
  const shareColor = hi && lo && hi.colors.some((x) => lo.colors.includes(x));
  const hlPair = hi && lo && HIGHLOW_PAIRS.some(([a, b]) => (hi.texture === a && lo.texture === b) || (hi.texture === b && lo.texture === a));
  // "one wrong piece": remove any single item and the rest sits within one level
  const oneOutlier = fItems.length >= 3 && fItems.some((_, i) => { const rest = fv.filter((__, j) => j !== i); return Math.max(...rest) - Math.min(...rest) <= 1; });
  let fs;
  if (fRange <= 1) fs = 12;
  else if (fRange === 2) fs = shareColor || hlPair ? 10 : 9;
  else if (fRange === 3) fs = shareColor || hlPair ? 7 : oneOutlier ? 6 : 2;
  else fs = (shareColor || hlPair) && oneOutlier ? 6 : oneOutlier ? 4 : 0;
  if (look.bag && Math.abs(look.bag.formality - c.avgFormality) > 2.5) { fs -= brief.tolerance === 0 ? 5 : 3; say('formality', `${look.bag.name} doesn’t suit the rest of the outfit. Try a bag that is as dressy as your clothes.`); }
  // hair carries the dress code too: an updo at a dive bar or a wolf cut at a gala costs
  const hairGap = look.hair ? Math.abs(look.hair.formality - brief.formality) : 0;
  if (look.hair && hairGap >= 3) { fs -= 2; say('formality', `${look.hair.name} doesn’t suit this occasion. ${brief.formality >= 4 ? 'Try a bun, a sleek ponytail or a bob' : 'Try something looser'}.`); }
  dims.formality = clamp(fs, 0, 12);
  if (fs <= 2) say('formality', `${hi.name} and ${lo.name.toLowerCase()} don’t go together, because one is much dressier than the other. Swap one of them.`);
  else if (fs >= 4 && fs <= 6 && fRange >= 3) say('formality', `Mixing dressy and casual can work, but ${hi.name.toLowerCase()} and ${lo.name.toLowerCase()} need a colour or a texture in common.`);
  else if (fs >= 7 && fRange >= 2 && (shareColor || hlPair)) say('formality', 'The dressy and casual pieces work together because they share a colour or a texture.', true);
  else if (fs === 12 && fItems.length >= 3) say('formality', 'Every piece is equally dressy.', true);

  /* ---------- 5. Season (8) ---------- */
  const wItems = [look.top, look.bottom, look.dress, look.outer, look.shoes, look.hosiery].filter(Boolean);
  const effW = (g) => (look.outer && (g.slot === 'top' || g.slot === 'dress') ? Math.max(g.weight, look.outer.weight - 1) : g.weight);
  const wv = wItems.map(effW);
  const wMax = Math.max(...wv), wMin = Math.min(...wv);
  const wRange = wMax - wMin;
  const outerIsMax = look.outer && look.outer.weight === Math.max(...wItems.map((g) => g.weight));
  let ss = wRange <= 1 ? 8 : wRange === 2 ? (outerIsMax ? 7 : 6) : wRange === 3 ? 2 : 0;
  if (look.outer && look.shoes && look.shoes.weight < look.outer.weight - 2) { ss -= 3; say('season', `${look.shoes.name} under ${look.outer.name.toLowerCase()} are for different weather. Your feet are dressed for summer and your shoulders for winter.`); }
  else if (wRange >= 3) { const hv = wItems[wv.indexOf(wMax)], lv = wItems[wv.indexOf(wMin)]; say('season', `${hv.name} and ${lv.name.toLowerCase()} are for different weather.`); }
  dims.season = clamp(ss, 0, 8);
  if (dims.season === 8 && wItems.length >= 3) say('season', 'Every piece suits the same weather.', true);

  /* ---------- 6. Texture (7) ---------- */
  const tItems = [look.top, look.bottom, look.dress, look.outer, look.shoes, look.bag, look.hosiery].filter(Boolean);
  const textures = new Set(tItems.map((g) => g.texture));
  const n = textures.size;
  let ts = n >= 2 && n <= 3 ? 7 : n === 4 ? 5 : n === 1 ? 4 : 2;
  const hasMatte = tItems.some((g) => !g.shine), hasShine = tItems.some((g) => g.shine >= 1);
  if (hasMatte && hasShine) ts = Math.min(7, ts + 1);
  if (tItems.length >= 2 && tItems.every((g) => g.shine >= 1)) { ts -= 2; say('texture', 'Everything is shiny. Add one matte piece for balance.'); }
  const prints = tItems.filter((g) => g.print);
  if (prints.length >= 2) {
    const shared = prints[0].colors.some((x) => prints[1].colors.includes(x));
    const scales = new Set(prints.map((g) => PRINT_SCALE[g.print] || 'medium'));
    if (!(shared && scales.size > 1)) { ts -= 3; say('texture', 'Two prints work best when they share a colour and one print is smaller than the other.'); }
    if (prints.length >= 3 && !(brief.mood || []).includes('maximal')) ts -= 2;
  }
  if (n >= 5) say('texture', 'There are too many different fabrics. Keep to two or three.');
  else if (n === 1 && tItems.length >= 3) say('texture', 'Every piece is the same fabric, which looks flat. Add a contrast, such as knit with leather or satin with wool.');
  dims.texture = clamp(ts, 0, 7);
  if (dims.texture === 7) say('texture', 'There’s a good mix of matte and shiny fabrics.', true);

  /* ---------- 7. Focal point (8) ---------- */
  const heroes = items.filter((i) => i.statement === 2);
  const supporting = items.filter((i) => i.statement === 1);
  let fo = heroes.length === 1 ? 8 : heroes.length === 0 ? (supporting.length >= 1 ? 6 : 4) : heroes.length === 2 ? 3 : 0;
  dims.focal = fo;
  if (heroes.length >= 3) say('focal', `Three standout pieces are too many. Keep ${heroes[0].name.toLowerCase()} and swap the others for simpler pieces.`);
  else if (heroes.length === 2) say('focal', `${heroes[0].name} and ${heroes[1].name.toLowerCase()} are competing for attention. Choose one standout piece.`);
  else if (heroes.length === 0 && supporting.length === 0) say('focal', 'The outfit is safe but plain. Add one standout piece.');
  else if (heroes.length === 1) say('focal', `${heroes[0].name} is the standout piece, and everything else supports it.`, true);

  /* ---------- 8. Completeness (8) ---------- */
  let cs = reqOk ? 4 : 0;
  const third = look.outer || look.belt || look.scarf || supporting.some((i) => ACCESSORY.has(i.slot));
  cs += third ? 2 : 0;
  const acc = c.accessoryCount;
  cs += acc >= 2 && acc <= 4 ? 2 : acc <= 1 ? 1 : 0;
  if (acc > 4) cs -= acc - 4;
  if (look.shoes && look.bag && look.shoes.colors[0] === look.bag.colors[0] && look.shoes.colors[0] !== '#15110F' && look.shoes.colors[0] !== '#111111' && !['mob', 'siren'].includes(c.lead)) { cs -= 1; say('complete', 'The bag and shoes match exactly, which can look old-fashioned. Try a bag in a different colour.'); }
  if (look.hair && hairGap <= 1 && cs < 8) { cs += 1; }
  dims.complete = clamp(cs, 0, 8);
  if (acc > 5) say('complete', `${acc} accessories are too many. Wear four at most.`);
  else if (!third) say('complete', 'The outfit needs a third piece, such as a jacket, a belt or an accessory.');
  else if (dims.complete === 8) say('complete', 'The outfit is complete, with a third piece and the right number of accessories.', true);

  /* ---------- 9. Aesthetic coherence (10) ---------- */
  const t = c.tight;
  const [a1, s1] = c.ranked[0] || ['', 0];
  const [a2, s2] = c.ranked[1] || ['', 0];
  let as;
  if (t >= 0.8) as = 10;
  else if (t >= 0.66) as = 8;
  else if (t >= 0.5) as = 6;
  else if (t >= 0.36) as = 3;
  else as = 0;
  const br = a1 && a2 ? bridgeOf(a1, a2) : 0;
  if (br === 0 && s2 >= 0.22 && s1 < 0.6) as = Math.min(as, 3);
  dims.aesthetic = as;
  if (as <= 3) say('aesthetic', `Half of the outfit is ${(AES[a1] || title(a1)).toLowerCase()} and half is ${(AES[a2] || title(a2)).toLowerCase()}, with nothing to link them.`);
  else if (as === 6) say('aesthetic', `Mostly ${(AES[a1] || title(a1)).toLowerCase()}, but a couple of pieces belong to a different style.`);
  else if (as >= 8 && br >= 1 && s2 > 0.18) say('aesthetic', `${AES[a1]} and ${AES[a2].toLowerCase()} work well together here.`, true);
  else if (as === 10) say('aesthetic', `The outfit is clearly ${(AES[a1] || title(a1)).toLowerCase()}.`, true);

  /* ---------- noise penalty: more stuff isn’t more points ---------- */
  const load = items.reduce((s, i) => s + (i.statement || 0), 0);
  let noise = 0;
  if (load >= 5) { noise = Math.min(15, (load - 3) * 3); say('focal', `There are too many attention-grabbing pieces. ${heroes[0] ? `Keep ${heroes[0].name.toLowerCase()}` : 'Keep one standout piece'} and swap the rest for simpler ones.`); }

  /* ---------- total ---------- */
  let total = Object.values(dims).reduce((s, v) => s + v, 0) - noise;
  const raw = clamp(Math.round(total), 0, 100);
  let gated = false;
  // Pim has no bottoms and her shoes are optional: a top or a dress counts as dressed
  const dressed = brief.pim ? !!(look.dress || look.top) : !!((look.dress || (look.top && look.bottom)) && look.shoes);
  if (!dressed) { total = Math.min(total, 35); gated = 'undressed'; }
  else if (fScore === 0 && total > 50) { total = 50; gated = 'dresscode'; }
  else if (dims.brief < 8 && total > 50) { total = 50; gated = true; }
  else if (fScore === 4 && total > 68) { total = 68; gated = 'dresscode-soft'; }
  else if (moods.length && (!moodHits[0].ok || moodHits.filter((x) => x.ok).length < Math.ceil(moods.length / 2)) && total > 70) { total = 70; gated = 'mood'; }
  total = clamp(Math.round(total), 0, 100);
  const grade = total >= 90 ? 'S' : total >= 80 ? 'A' : total >= 70 ? 'B' : total >= 55 ? 'C' : 'D';

  const dimsOut = DIMS.map((d) => { const sc = dims[d.key] ?? 0; const r = sc / d.max; return { ...d, score: sc, notes: notes.fix.filter((x) => x.dim === d.key).map((x) => x.text), praise: notes.good.filter((x) => x.dim === d.key).map((x) => x.text), critic: r >= 0.85 ? criticLine(d.key, true, look) : r < 0.5 ? criticLine(d.key, false, look) : '' }; });
  // critique: worst three ratios first, then one praise
  const worst = dimsOut.filter((d) => d.notes.length).sort((a, b) => a.score / a.max - b.score / b.max).slice(0, 3).map((d) => d.notes[0]);
  const praise = dimsOut.filter((d) => d.praise.length).sort((a, b) => b.score / b.max - a.score / a.max)[0]?.praise[0];
  const critique = [...worst];
  if (praise) critique.push(praise);
  if (gated === 'undressed') critique.unshift(brief.pim ? 'The outfit isn’t finished. Pim needs a top or a dress first. Until then, the score can’t go above 35.' : `The outfit isn’t finished. Add ${!look.shoes ? 'shoes' : ''}${!look.shoes && !(look.dress || (look.top && look.bottom)) ? ' and ' : ''}${!(look.dress || (look.top && look.bottom)) ? (look.top ? 'a bottom' : look.bottom ? 'a top' : 'a top and a bottom, or a dress') : ''} first. Until then, the score can’t go above 35.`);
  else if (gated === 'dresscode') critique.unshift(`This is the wrong dress code. ${brief.occasion ? `“${brief.occasion}”` : 'This brief'} is ${['loungewear', 'casual', 'smart casual', 'polished', 'cocktail', 'formal', 'black tie'][brief.formality]}, but this outfit is ${['loungewear', 'casual', 'smart casual', 'polished', 'cocktail', 'formal', 'black tie'][Math.round(c.avgFormality)]}. The score can’t go above 50 until that is fixed.`);
  else if (gated === 'mood') critique.unshift(`${!moodHits[0].ok ? `“${MOOD_LABEL(moodHits[0].m)}” is the first mood word in the brief, and this outfit doesn’t show it` : `Some mood words are missing (${moodHits.filter((x) => !x.ok).map((x) => MOOD_LABEL(x.m)).join(', ')})`}. The score can’t go above 70 until they come through.`);
  else if (gated === 'dresscode-soft') critique.unshift('This is a good outfit, but it’s one step away from the dress code. The score can’t go above 68 until that is fixed.');
  else if (gated) critique.unshift('This is a nice outfit, but it doesn’t fit the brief. The score can’t go above 50 until it does.');
  return { total, grade, dims: dimsOut, critique, context: c, gated, lead: a1, palette: pal.template, noise, load, raw, dressed };
}

// Tiers instead of numbers everywhere the player looks. A look's tier is where it lands against the level's pass mark;
// a dimension's tier is how much of that dimension it earned.
export const tierOf = (total, pass) => (total >= pass + 10 ? 'S' : total >= pass + 4 ? 'A' : total >= pass ? 'B' : total >= pass - 8 ? 'C' : 'D');
export const dimTier = (score, max) => { const r = max ? score / max : 0; return r >= 0.9 ? 'S' : r >= 0.75 ? 'A' : r >= 0.6 ? 'B' : r >= 0.4 ? 'C' : 'D'; };
export const marginWord = (m) => (m === 0 ? 'Even scores' : `${m > 0 ? 'Won' : 'Lost'} ${Math.abs(m) >= 10 ? 'clearly' : Math.abs(m) >= 4 ? 'comfortably' : 'narrowly'}`);
export const GRADE_WORD = { S: 'Perfect', A: 'Great', B: 'Good', C: 'Almost', D: 'Try again' };

// Try single swaps from an inventory to find the biggest improvement. Returns { item, slot, gain } or null.
export function bestSwap(look, brief, inventory, base) {
  const baseR = scoreLook(look, brief);
  const undressed = !baseR.dressed;
  const baseScore = undressed ? baseR.raw : (base ?? baseR.total);
  const missing = [];
  if (!look.shoes) missing.push('shoes');
  if (!look.dress && !look.top) missing.push('top', 'dress');
  if (!look.dress && !look.bottom) missing.push('bottom', 'dress');
  let best = null;
  const trySet = (slot, item) => {
    const l = { ...look };
    if (item) { l[slot] = item; if (slot === 'dress') { delete l.top; delete l.bottom; } if (slot === 'top' || slot === 'bottom') delete l.dress; }
    else delete l[slot];
    const r = scoreLook(l, brief);
    const s = undressed ? r.raw : r.total;
    const gain = s - baseScore;
    const threshold = undressed ? -100 : 2.5;
    if (gain > (best ? best.gain : threshold)) best = { item, slot, gain, score: r.total, raw: r.raw };
  };
  if (undressed) {
    for (const item of inventory) if (missing.includes(item.slot)) trySet(item.slot, item);
    return best;
  }
  for (const slot of Object.keys(look)) if (look[slot] && slot !== 'hair' && slot !== 'shoes') trySet(slot, null);
  for (const item of inventory) {
    if (item.slot === 'hair') continue;
    if (look[item.slot]?.id === item.id) continue;
    trySet(item.slot, item);
  }
  return best;
}
