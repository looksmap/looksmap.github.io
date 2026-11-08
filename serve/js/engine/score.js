// The coherence engine. Scores a look against a brief on nine dimensions (sum 100)
// and explains itself in a stylist's voice. No per-item "points": only relationships.
import { paletteReport } from './color.js';
import { MOODS } from './moods.js';
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

// Critic register, one line per dimension when it lands or misses (memo 12, 2.3). Picked by a hash of the look so the
// same outfit always reads the same.
const CRIT_GOOD = {
  brief: ['You read the brief and answered it.', 'The occasion is in every piece.', 'Nothing here argues with the invitation.', 'You dressed for the room, not the mirror.', 'Right look, right door.', 'You understood what the day asked.'],
  palette: ['The palette is exact, not minimal.', 'Two colours, used with discipline.', 'Tonal, and it holds.', 'One accent, placed once.', 'Neutrals with temperature, which is the hard part.', 'Nothing in it is an accident.'],
  silhouette: ['The proportions do the work.', 'The waist is where it should be.', 'Volume on top, discipline below.', 'The silhouette is controlled and it moves.', 'The outline reads from across the room.', 'Svelte without being mean.'],
  formality: ['Dressed up by one notch, which is the correct number.', 'The formality is consistent to the shoe.', 'Casual with intent.', 'The fabric sets the register and the rest obeys.', 'You know what time it is.', 'Daywear with a point of view.'],
  season: ['The weight of the fabric matches the month.', 'The layers belong to the season.', 'Knit where knit is wanted.', 'The season is in the texture, not the colour.', 'Dressed for the weather and the photograph.', 'Transitional, and it means it.'],
  texture: ['Matte against shine, placed once.', 'One rough surface among smooth ones.', 'The knit gives the look its weight.', 'Texture carries the palette.', 'The fabric is doing the talking.', 'Tweed with the ease of jersey.'],
  focal: ['One hero, properly framed.', 'The bag knows it is the point.', 'Everything else steps back for the coat.', 'The shoe is the exclamation mark, correctly used.', 'The focal point is where the brief put it.', 'One gesture, repeated once.'],
  complete: ['Finished to the shoe.', 'Every piece earns its place.', 'Styled, not just dressed.', 'The accessories close the sentence.', 'Nothing missing, nothing extra.', 'Resolved.'],
  aesthetic: ['Coherent from collar to heel.', 'The references are digested.', 'It reads as one idea.', 'A synthesis, not a collage.', 'Unmistakably you.', 'Clarity.'],
};
const CRIT_BAD = {
  brief: ['Beautiful, and for a different evening.', 'This answers a question nobody set.', 'Overdressed is still misdressed.', 'You styled the mood board, not the brief.', 'Right clothes, wrong occasion.', 'Close to the brief, which is not the brief.'],
  palette: ['Three accents is a crowd.', 'The palette is a mood, not a decision.', 'Beige on beige reads as blank.', 'The warm and cool are fighting.', 'One colour too many, and it is the bag.', 'Colour-matched is not the same as considered.'],
  silhouette: ['Volume everywhere is volume nowhere.', 'The waist has gone missing.', 'Boxy where fitted was wanted.', 'Two silhouettes in one look.', 'The line breaks at the knee.', 'It is wearing you.'],
  formality: ['The top is a gala; the shoes are a brunch.', 'Too formal to be interesting.', 'The register changes at the waist.', 'Sneakers undo the tailoring.', 'Formal and stiff are different things.', 'One notch too many.'],
  season: ['Velvet in July.', 'The season is undecided.', 'Too many layers for the forecast.', 'Sandals under a coat.', 'The palette says spring; the fabric says January.', 'Seasonless is usually just late.'],
  texture: ['Three shines is a lot.', 'The textures are competing.', 'Everything is flat; nothing catches light.', 'The lace is fighting the hardware.', 'Shine where structure was needed.', 'Fabric-heavy and idea-light.'],
  focal: ['Two heroes, no story.', 'Nothing here asks to be looked at.', 'The bag is arguing with the dress.', 'Everything is a statement; nothing is a sentence.', 'The eye goes to the hem, which is a problem.', 'It needs a pendant, a cuff, something.'],
  complete: ['It wanted more styling.', 'The look stops at the ankle.', 'Unfinished, not undone.', 'One piece short of a look.', 'Jewellery is an afterthought.', 'Almost.'],
  aesthetic: ['Two aesthetics, one body.', 'Mood board, not look.', 'The references are showing.', 'It reads as a costume of the idea.', 'Eclectic in a way that is just undecided.', 'Styled to within an inch of its life.'],
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
    return { total: 0, grade: 'D', dims: DIMS.map((d) => ({ ...d, score: 0, notes: [], praise: [] })), critique: ['Put on a top, a dress or a bottom and the read begins.'], context: c, gated: 'undressed', lead: null, palette: null, noise: 0, load: 0, raw: 0, dressed: false };
  }

  /* ---------- 1. Brief fit (20) ---------- */
  let bf = 0; const bfNotes = [];
  const tol = brief.tolerance ?? 1;
  const fDiff = Math.abs(c.avgFormality - brief.formality);
  const fScore = fDiff <= tol + 0.5 ? 8 : fDiff <= tol + 1.5 ? 4 : 0;
  bf += fScore;
  if (fScore < 8) bfNotes.push(c.avgFormality < brief.formality ? `This reads too casual for ${brief.occasion || 'the occasion'}. Raise one or two pieces.` : `This is dressier than ${brief.occasion || 'the occasion'} wants. Bring something down to earth.`);
  const moods = brief.mood || [];
  const moodHits = moods.map((m) => ({ m, ok: MOODS[m] ? MOODS[m].test(c) : true }));
  const moodScore = moods.length ? (8 * moodHits.filter((x) => x.ok).length) / moods.length : 8;
  bf += moodScore;
  for (const x of moodHits) if (!x.ok) bfNotes.push(`"${title(x.m)}" is missing: ${MOODS[x.m]?.hint || ''}.`);
  const req = ['shoes', ...(brief.required || [])];
  const reqOk = req.every((s) => look[s]);
  bf += reqOk ? 2 : 0;
  if (!reqOk) bfNotes.push(`The brief asks for ${req.filter((s) => !look[s]).join(' and ')}.`);
  const weatherOk = Math.abs(c.avgWeight - (brief.weather ?? 2.5)) <= 1.1;
  bf += weatherOk ? 2 : 0;
  if (!weatherOk) bfNotes.push(c.avgWeight < (brief.weather ?? 2.5) ? 'Too light for the weather in the brief.' : 'Too heavy for the weather in the brief.');
  if (brief.forbid) {
    const f = brief.forbid;
    const bad = items.filter((i) => (f.items || []).includes(i.id) || (f.textures || []).includes(i.texture) || (f.slots || []).includes(i.slot) || (f.colors || []).some((hex) => i.colors?.includes(hex)));
    if (bad.length) { bf -= 6; bfNotes.push(`The client said no to ${bad.map((b) => b.name.toLowerCase()).join(', ')}.`); }
  }
  if (brief.mustTexture && !garments.some((g) => g.texture === brief.mustTexture)) { bf -= 3; bfNotes.push(`The brief wants ${brief.mustTexture} somewhere.`); }
  dims.brief = clamp(Math.round(bf), 0, 20);
  if (dims.brief >= 18) say('brief', 'You understood the assignment.', true);
  for (const n of bfNotes) say('brief', n);

  /* ---------- 2. Palette (15) ---------- */
  let ps = 11 * pal.fit;
  if (pal.distinctChromatic <= 3) ps += 2;
  if (pal.dominant >= 0.5) ps += 2;
  if (pal.distinctChromatic > 3) ps -= 3 * (pal.distinctChromatic - 3);
  if (pal.mixedUndertone) ps -= 2;
  if (pal.template === 'flat neutrals') ps -= 1;
  dims.palette = clamp(Math.round(ps), 0, 15);
  if (pal.distinctChromatic > 3) say('palette', `${pal.distinctChromatic} colours are fighting. Pick one to lead and let the rest go neutral.`);
  else if (pal.template === 'adjacent clash') say('palette', 'Two colours sitting awkwardly close. Go tonal, or go opposite.');
  else if (pal.template === 'three-way clash') say('palette', 'Three unrelated colours. Drop one and the other two will start talking.');
  else if (pal.mixedUndertone) say('palette', 'Warm against cool: the undertones are arguing. Bridge them with a neutral or pick a side.');
  else if (pal.template === 'flat neutrals') say('palette', 'All neutral and all the same depth. Vary the lightness: bone against ink, not grey on grey.');
  else if (dims.palette >= 13) say('palette', `Palette: ${pal.template}. It holds.`, true);

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
  if (allBig && c.sharpCount === 0) say('silhouette', 'All oversized, nothing sharp. Add a belt, a pointed shoe or slicked hair so the volume reads as a decision.');
  else if (allBig) say('silhouette', 'Oversized on oversized, saved by a sharp element. Modern.', true);
  // rule of thirds / waist definition
  const topHem = look.top ? (Array.isArray(look.top.render) ? look.top.render[0].hem : look.top.render.hem) : null;
  const botWaist = look.bottom ? (look.bottom.render.waist ?? 300) : null;
  const waistDefined = !!look.belt || (look.dress && look.dress.volume === -1) || (topHem && topHem <= 302) || (botWaist && botWaist <= 296 && topHem && topHem <= 334) || (look.top && look.top.render?.hemStyle === 'corset');
  sil += waistDefined ? 3 : 1;
  if (!waistDefined && !look.dress) say('silhouette', 'No waist anywhere. Tuck, crop, or belt so the proportion has a hinge.');
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
  if (hs === 1) say('silhouette', 'A midi over a chunky flat shortens the leg. Try a pointed toe, a low heel or a tall boot.');
  if (hs === 2 && (hem === 'floor' || hem === 'maxi') && sh?.heel === 0) say('silhouette', 'Floor-length needs a little height or the hem drags.');
  dims.silhouette = clamp(Math.round(sil), 0, 12);
  if (dims.silhouette >= 11) say('silhouette', 'Proportions are balanced: volume where it should be, a defined waist.', true);

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
  if (look.bag && Math.abs(look.bag.formality - c.avgFormality) > 2.5) { fs -= brief.tolerance === 0 ? 5 : 3; say('formality', `${look.bag.name} belongs to a different day than the rest of the look.`); }
  // hair carries the dress code too: an updo at a dive bar or a wolf cut at a gala costs
  const hairGap = look.hair ? Math.abs(look.hair.formality - brief.formality) : 0;
  if (look.hair && hairGap >= 3) { fs -= 2; say('formality', `${look.hair.name} is dressed for a different occasion. ${brief.formality >= 4 ? 'Try a bun, a sleek ponytail or a bob' : 'Try something looser'}.`); }
  dims.formality = clamp(fs, 0, 12);
  if (fs <= 2) say('formality', `${hi.name} and ${lo.name.toLowerCase()} live in different evenings. Pick a lane, or make the wrong piece the only wrong piece.`);
  else if (fs >= 4 && fs <= 6 && fRange >= 3) say('formality', `High-low is a tightrope: ${hi.name.toLowerCase()} and ${lo.name.toLowerCase()} need a colour or a texture in common.`);
  else if (fs >= 7 && fRange >= 2 && (shareColor || hlPair)) say('formality', 'A deliberate high-low: the dressy piece and the casual piece share a language.', true);
  else if (fs === 12 && fItems.length >= 3) say('formality', 'Every piece is dressed for the same night.', true);

  /* ---------- 5. Season (8) ---------- */
  const wItems = [look.top, look.bottom, look.dress, look.outer, look.shoes, look.hosiery].filter(Boolean);
  const effW = (g) => (look.outer && (g.slot === 'top' || g.slot === 'dress') ? Math.max(g.weight, look.outer.weight - 1) : g.weight);
  const wv = wItems.map(effW);
  const wMax = Math.max(...wv), wMin = Math.min(...wv);
  const wRange = wMax - wMin;
  const outerIsMax = look.outer && look.outer.weight === Math.max(...wItems.map((g) => g.weight));
  let ss = wRange <= 1 ? 8 : wRange === 2 ? (outerIsMax ? 7 : 6) : wRange === 3 ? 2 : 0;
  if (look.outer && look.shoes && look.shoes.weight < look.outer.weight - 2) { ss -= 3; say('season', `${look.shoes.name} under ${look.outer.name.toLowerCase()}: your feet are in July and your shoulders in January.`); }
  else if (wRange >= 3) { const hv = wItems[wv.indexOf(wMax)], lv = wItems[wv.indexOf(wMin)]; say('season', `${hv.name} and ${lv.name.toLowerCase()} can’t be in the same weather.`); }
  dims.season = clamp(ss, 0, 8);
  if (dims.season === 8 && wItems.length >= 3) say('season', 'One season, head to toe.', true);

  /* ---------- 6. Texture (7) ---------- */
  const tItems = [look.top, look.bottom, look.dress, look.outer, look.shoes, look.bag, look.hosiery].filter(Boolean);
  const textures = new Set(tItems.map((g) => g.texture));
  const n = textures.size;
  let ts = n >= 2 && n <= 3 ? 7 : n === 4 ? 5 : n === 1 ? 4 : 2;
  const hasMatte = tItems.some((g) => !g.shine), hasShine = tItems.some((g) => g.shine >= 1);
  if (hasMatte && hasShine) ts = Math.min(7, ts + 1);
  if (tItems.length >= 2 && tItems.every((g) => g.shine >= 1)) { ts -= 2; say('texture', 'All shine. Give the eye a matte place to rest.'); }
  const prints = tItems.filter((g) => g.print);
  if (prints.length >= 2) {
    const shared = prints[0].colors.some((x) => prints[1].colors.includes(x));
    const scales = new Set(prints.map((g) => PRINT_SCALE[g.print] || 'medium'));
    if (!(shared && scales.size > 1)) { ts -= 3; say('texture', 'Two prints need one colour in common and one of them to be smaller.'); }
    if (prints.length >= 3 && !(brief.mood || []).includes('maximal')) ts -= 2;
  }
  if (n >= 5) say('texture', 'Five textures is a fabric store. Keep two or three.');
  else if (n === 1 && tItems.length >= 3) say('texture', 'One texture throughout reads flat. Add knit against leather, or satin against wool.');
  dims.texture = clamp(ts, 0, 7);
  if (dims.texture === 7) say('texture', 'Matte and shine, two or three textures. Rich without noise.', true);

  /* ---------- 7. Focal point (8) ---------- */
  const heroes = items.filter((i) => i.statement === 2);
  const supporting = items.filter((i) => i.statement === 1);
  let fo = heroes.length === 1 ? 8 : heroes.length === 0 ? (supporting.length >= 1 ? 6 : 4) : heroes.length === 2 ? 3 : 0;
  dims.focal = fo;
  if (heroes.length >= 3) say('focal', `Three statement pieces means no statement. Keep ${heroes[0].name.toLowerCase()}; lose the rest.`);
  else if (heroes.length === 2) say('focal', `${heroes[0].name} and ${heroes[1].name.toLowerCase()} are competing. One hero per look.`);
  else if (heroes.length === 0 && supporting.length === 0) say('focal', 'Safe. Correct, and nobody will remember it. Give it one hero piece.');
  else if (heroes.length === 1) say('focal', `${heroes[0].name} is the point. Everything else steps back.`, true);

  /* ---------- 8. Completeness (8) ---------- */
  let cs = reqOk ? 4 : 0;
  const third = look.outer || look.belt || look.scarf || supporting.some((i) => ACCESSORY.has(i.slot));
  cs += third ? 2 : 0;
  const acc = c.accessoryCount;
  cs += acc >= 2 && acc <= 4 ? 2 : acc <= 1 ? 1 : 0;
  if (acc > 4) cs -= acc - 4;
  if (look.shoes && look.bag && look.shoes.colors[0] === look.bag.colors[0] && look.shoes.colors[0] !== '#15110F' && look.shoes.colors[0] !== '#111111' && !['mob', 'siren'].includes(c.lead)) { cs -= 1; say('complete', 'Bag matched exactly to shoe reads 1950s unless that’s the reference.'); }
  if (look.hair && hairGap <= 1 && cs < 8) { cs += 1; }
  dims.complete = clamp(cs, 0, 8);
  if (acc > 5) say('complete', `${acc} accessories is a drawer, not a look. Four, maximum.`);
  else if (!third) say('complete', 'Needs a third piece: a jacket, a belt or one accessory with intent.');
  else if (dims.complete === 8) say('complete', 'Finished: third piece, two or three accessories, nothing missing.', true);

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
  if (as <= 3) say('aesthetic', `${AES[a1] || title(a1)} on one half, ${AES[a2] || title(a2)} on the other, and no bridge between them.`);
  else if (as === 6) say('aesthetic', `Mostly ${(AES[a1] || title(a1)).toLowerCase()}, but a couple of pieces belong to another story.`);
  else if (as >= 8 && br >= 1 && s2 > 0.18) say('aesthetic', `${AES[a1]} and ${AES[a2]} are in conversation.`, true);
  else if (as === 10) say('aesthetic', `Unmistakably ${(AES[a1] || title(a1)).toLowerCase()}.`, true);

  /* ---------- noise penalty: more stuff isn’t more points ---------- */
  const load = items.reduce((s, i) => s + (i.statement || 0), 0);
  let noise = 0;
  if (load >= 5) { noise = Math.min(15, (load - 3) * 3); say('focal', `${load} units of statement on one body. ${heroes[0] ? `Keep ${heroes[0].name.toLowerCase()}` : 'Keep one hero'} and send the rest back to the rail.`); }

  /* ---------- total ---------- */
  let total = Object.values(dims).reduce((s, v) => s + v, 0) - noise;
  const raw = clamp(Math.round(total), 0, 100);
  let gated = false;
  const dressed = !!((look.dress || (look.top && look.bottom)) && look.shoes);
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
  if (gated === 'undressed') critique.unshift(`Not dressed yet: ${!look.shoes ? 'shoes' : ''}${!look.shoes && !(look.dress || (look.top && look.bottom)) ? ' and ' : ''}${!(look.dress || (look.top && look.bottom)) ? (look.top ? 'a bottom' : look.bottom ? 'a top' : 'a top and a bottom, or a dress') : ''} first. Until then the read is capped at 35.`);
  else if (gated === 'dresscode') critique.unshift(`Wrong dress code. ${brief.occasion ? title(brief.occasion) : 'This brief'} reads ${['loungewear', 'casual', 'smart casual', 'polished', 'cocktail', 'formal', 'black tie'][brief.formality]}; this look reads ${['loungewear', 'casual', 'smart casual', 'polished', 'cocktail', 'formal', 'black tie'][Math.round(c.avgFormality)]}. Capped at 50 until the level is right.`);
  else if (gated === 'mood') critique.unshift(`${!moodHits[0].ok ? `"${title(moodHits[0].m)}" is the brief's first word and this look doesn’t say it` : `The mood is missing: ${moodHits.filter((x) => !x.ok).map((x) => x.m).join(', ')}`}. Until the words land, the read is capped at 70.`);
  else if (gated === 'dresscode-soft') critique.unshift('A level off the dress code. Good look, slightly wrong room; capped at 68 until it lands.');
  else if (gated) critique.unshift('Right look, wrong room. Fix the brief fit first; until then the read is capped at 50.');
  return { total, grade, dims: dimsOut, critique, context: c, gated, lead: a1, palette: pal.template, noise, load, raw, dressed };
}

// Tiers instead of numbers everywhere the player looks. A look's tier is where it lands against the level's pass mark;
// a dimension's tier is how much of that dimension it earned.
export const tierOf = (total, pass) => (total >= pass + 10 ? 'S' : total >= pass + 4 ? 'A' : total >= pass ? 'B' : total >= pass - 8 ? 'C' : 'D');
export const dimTier = (score, max) => { const r = max ? score / max : 0; return r >= 0.9 ? 'S' : r >= 0.75 ? 'A' : r >= 0.6 ? 'B' : r >= 0.4 ? 'C' : 'D'; };
export const marginWord = (m) => (m === 0 ? 'Judged even' : `${m > 0 ? 'Won' : 'Lost'} ${Math.abs(m) >= 10 ? 'clearly' : Math.abs(m) >= 4 ? 'comfortably' : 'narrowly'}`);
export const GRADE_WORD = { S: "Editor's pick", A: 'Booked', B: 'Callback', C: 'Almost', D: 'Start over' };

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
