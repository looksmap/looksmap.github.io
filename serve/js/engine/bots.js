// Opponents. Every look is judged against another stylist at about the player's level: a bot for now, with a name, a
// face, a wardrobe limited the way a player's would be, and a score pitched around the mode's pass mark.
import { CATALOG, BY_ID } from '../data/catalog.js';
import { scoreLook } from './score.js';

export const BOTS = [
  { id: 'maia', name: 'Maia R.', avatar: { skin: 'tan', hairStyle: 'slickPony', hairColor: 'espresso', eyes: 'brown', lip: '#C4707A' }, fav: ['clean', 'quiet'] },
  { id: 'june', name: 'June', avatar: { skin: 'fair', hairStyle: 'bob', hairColor: 'honey', eyes: 'green', lip: '#D08A7A' }, fav: ['coquette', 'ballet'] },
  { id: 'sol', name: 'Sol', avatar: { skin: 'deep', hairStyle: 'curly', hairColor: 'jet', eyes: 'black', lip: '#8E3B45' }, fav: ['siren', 'mob'] },
  { id: 'wren', name: 'Wren', avatar: { skin: 'porcelain', hairStyle: 'wolfCut', hairColor: 'ink', eyes: 'grey', lip: '#6E1F3A' }, fav: ['sleaze', 'fairy'] },
  { id: 'ines', name: 'Inès', avatar: { skin: 'light', hairStyle: 'frenchBob', hairColor: 'chestnut', eyes: 'hazel', lip: '#B86B6F' }, fav: ['academia', 'quiet'] },
  { id: 'kiko', name: 'Kiko', avatar: { skin: 'medium', hairStyle: 'spaceBuns', hairColor: 'lavender', eyes: 'brown', lip: '#E39DB6' }, fav: ['y2k', 'chrome'] },
  { id: 'tess', name: 'Tess', avatar: { skin: 'fair', hairStyle: 'braids', hairColor: 'blonde', eyes: 'blue', lip: '#C98A7A' }, fav: ['blokette', 'gorp'] },
  { id: 'nia', name: 'Nia', avatar: { skin: 'rich', hairStyle: 'sleekBun', hairColor: 'jet', eyes: 'black', lip: '#9A1B2E' }, fav: ['siren', 'clean'] },
  { id: 'lola', name: 'Lola', avatar: { skin: 'tan', hairStyle: 'longWavy', hairColor: 'caramel', eyes: 'amber', lip: '#D08A7A' }, fav: ['boho', 'coquette'] },
  { id: 'ash', name: 'Ash', avatar: { skin: 'light', hairStyle: 'pixie', hairColor: 'silver', eyes: 'grey', lip: '#B5A6A3' }, fav: ['chrome', 'clean'] },
  { id: 'romy', name: 'Romy', avatar: { skin: 'porcelain', hairStyle: 'halfUp', hairColor: 'rose', eyes: 'blue', lip: '#E2527F' }, fav: ['coquette', 'y2k'] },
  { id: 'dani', name: 'Dani', avatar: { skin: 'medium', hairStyle: 'lowBun', hairColor: 'espresso', eyes: 'brown', lip: '#C4707A' }, fav: ['ballet', 'quiet'] },
  { id: 'yara', name: 'Yara', avatar: { skin: 'deep', hairStyle: 'longStraight', hairColor: 'jet', eyes: 'black', lip: '#8E3B45' }, fav: ['mob', 'boho'] },
  { id: 'elle', name: 'Elle', avatar: { skin: 'fair', hairStyle: 'longWavy', hairColor: 'platinum', eyes: 'blue', lip: '#F06BAE' }, fav: ['coquette', 'siren'] },
  { id: 'noa', name: 'Noa', avatar: { skin: 'ebony', hairStyle: 'braids', hairColor: 'copper', eyes: 'brown', lip: '#A3162B' }, fav: ['academia', 'blokette'] },
  { id: 'vi', name: 'Vi', avatar: { skin: 'light', hairStyle: 'slickPony', hairColor: 'cherry', eyes: 'violet', lip: '#6E1F3A' }, fav: ['sleaze', 'siren'] },
];

const hashStr = (s) => { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };
const RAR = { core: 0, edit: 1, archive: 2, icon: 3 };
const AESKEYS = ['coquette', 'ballet', 'siren', 'quiet', 'y2k', 'sleaze', 'fairy', 'academia', 'gorp', 'clean', 'mob', 'chrome', 'blokette', 'boho'];

// what a player at this level could plausibly own
const rarityCap = (level) => (level >= 25 ? 3 : level >= 12 ? 2 : level >= 4 ? 1 : 0);

function place(look, it) { const l = { ...look }; l[it.slot] = it; if (it.slot === 'dress') { delete l.top; delete l.bottom; } if (it.slot === 'top' || it.slot === 'bottom') delete l.dress; return l; }

export function buildOpponentLook(brief, bot, level, seed) {
  const lead = brief.mood[0] === 'quietlux' ? 'quiet' : brief.mood[0];
  const aes = AESKEYS.includes(lead) ? lead : bot.fav[0];
  const cap = rarityCap(level);
  const pim = !!brief.pim;
  const pool = CATALOG.filter((i) => !!i.pim === pim && RAR[i.rarity] <= cap && !i.set?.startsWith?.('secret_') && i.slot !== 'hair' && i.slot !== 'makeup' && Math.abs(i.formality - brief.formality) <= 2)
    .map((i) => ({ i, w: (i.aesthetics?.[aes] || 0) * 2 + (i.aesthetics?.[bot.fav[0]] || 0) + (i.aesthetics?.[bot.fav[1]] || 0) * 0.5 + ((hashStr(seed + i.id) % 100) / 400) }))
    .sort((a, b) => b.w - a.w);
  const bySlot = {};
  for (const { i } of pool) { (bySlot[i.slot] ||= []); if (bySlot[i.slot].length < 10) bySlot[i.slot].push(i); }
  let look = pim ? {} : { hair: BY_ID['hr_' + (bot.avatar.hairStyle || 'longWavy').replace(/[A-Z]/g, (m) => '_' + m.toLowerCase())] || BY_ID.hr_long_wavy };
  const useDress = (hashStr(seed) % 3 !== 0) && bySlot.dress?.length;
  const slots = pim
    ? [useDress ? 'dress' : 'top', 'shoes', ...(brief.required || []).filter((s) => s !== 'shoes'), 'neck', 'head', 'outer', 'bag', 'eyes']
    : [useDress ? 'dress' : 'top', ...(useDress ? [] : ['bottom']), 'shoes', ...(brief.required || []).filter((s) => s !== 'shoes'), 'bag', 'ears', 'outer', 'neck', 'hairAcc'];
  for (const slot of slots) {
    const cands = bySlot[slot] || [];
    if (!cands.length || look[slot]) continue;
    let best = null, bestV = scoreLook(look, brief).total - 0.5;
    for (const it of cands.slice(0, 8)) { const v = scoreLook(place(look, it), brief).total; if (v > bestV) { bestV = v; best = it; } }
    if (best) look = place(look, best);
    else if (['dress', 'top', 'bottom', 'shoes'].includes(slot) || (brief.required || []).includes(slot)) look = place(look, cands[0]);
  }
  return look;
}

// Score pitched around the pass mark and the player's skill, with the bot's real dims scaled to it so the comparison is coherent.
export function opponentFor(brief, { level = 1, skill = 68, mode = 'normal', attempt = 0 } = {}) {
  const seed = `${brief.id}:${mode}:${attempt}`;
  const bot = BOTS[hashStr(seed) % BOTS.length];
  const look = buildOpponentLook(brief, bot, level, seed);
  const real = scoreLook(look, brief);
  const jitter = ((hashStr(seed + 'j') % 7) - 3);
  const skillAdj = Math.max(-6, Math.min(6, (skill - 68) * 0.25));
  const modeAdj = mode === 'easy' ? -3 : mode === 'hard' ? 1 : mode === 'secret' ? 2 : 0;
  const target = Math.max(30, Math.min(97, Math.round(brief.pass + skillAdj + modeAdj + jitter)));
  const base = Math.max(1, real.total || 1);
  const f = target / base;
  const dims = real.dims.map((d) => ({ key: d.key, label: d.label, max: d.max, score: Math.max(0, Math.min(d.max, Math.round(d.score * f))) }));
  const total = dims.reduce((a, d) => a + d.score, 0);
  return { bot, look: Object.fromEntries(Object.entries(look).map(([k, v]) => [k, v.id])), total, dims, lead: real.lead, palette: real.palette, target };
}

export const gradeByMargin = (margin, total, pass) => (margin >= 10 && total >= pass ? 'S' : margin >= 4 ? 'A' : margin >= 0 ? 'B' : margin >= -8 ? 'C' : 'D');
