// Story dialogue: visual-novel sheet with portraits rendered by the figure engine, typewriter text, tap to continue, skip.
import { esc, overlay, closeOverlay, reduced, $ } from './app.js';
import { CAST, storyFor as handStory, STORY } from '../data/story.js';
import { renderLook, cropBox } from '../render/figure.js';
import { item, LEVELS, CHAPTER_BY_ID } from '../engine/state.js';
import { icon } from './icons.js';
import { OBJ } from './objects.js';

const portraitCache = new Map();
export function portrait(speaker, avatar) {
  const c = CAST[speaker];
  if (!c) return '';
  if (c.avatar === 'pim') return pimSVG();
  if (!c.avatar) {
    const key = 'you|' + JSON.stringify(avatar);
    if (!portraitCache.has(key)) portraitCache.set(key, renderLook({}, avatar, { viewBox: cropBox(96, 8, 168, 190, true), shadow: false, depth: true, label: 'You' }));
    return portraitCache.get(key);
  }
  if (!portraitCache.has(speaker)) {
    const look = {};
    for (const id of c.avatar.items || []) { const it = item(id); if (it) look[it.slot] = it; }
    portraitCache.set(speaker, renderLook(look, c.avatar, { viewBox: cropBox(96, 8, 168, 190, true), shadow: false, depth: true, label: c.name }));
  }
  return portraitCache.get(speaker);
}

// Pim: a pincushion, rendered with the same materials as the chapter art.
export function pimSVG(size = 120) { return OBJ.pim(size); }

let queue = [];
let idx = 0;
let onDone = null;
let typing = null;

function frame(avatar) {
  const [spk, text] = queue[idx];
  const c = CAST[spk] || { name: spk };
  const last = idx === queue.length - 1;
  return `<div class="story-wrap" role="dialog" aria-label="Story"><div class="scrim"></div>
    <div class="story" data-story-next>
      <div class="story-portrait ${spk}">${portrait(spk, avatar)}</div>
      <div class="story-box">
        <div class="story-name">${esc(spk === 'you' ? (avatar?.name || 'You') : c.name)}${c.role ? `<span class="mono muted"> · ${esc(c.role)}</span>` : ''}</div>
        <p class="story-text" id="storyText" data-full="${esc(text)}"></p>
        <div class="story-foot"><span class="mono muted">${idx + 1} / ${queue.length}</span><span class="story-cta">${last ? 'Continue' : 'Tap'} ${icon(last ? 'play' : 'back', 'flip')}</span></div>
      </div>
      <button class="story-skip" data-story-skip>${icon('skip')} Skip</button>
    </div></div>`;
}

function type() {
  const el = $('#storyText');
  if (!el) return;
  const full = el.dataset.full;
  if (reduced()) { el.textContent = full; return; }
  let i = 0;
  clearInterval(typing);
  typing = setInterval(() => { i += 2; el.textContent = full.slice(0, i); if (i >= full.length) clearInterval(typing); }, 16);
}

export function playStory(lines, avatar, done) {
  if (!lines || !lines.length) { done && done(); return; }
  queue = lines; idx = 0; onDone = done;
  overlay(frame(avatar)); type();
  // keep avatar for subsequent frames
  playStory.avatar = avatar;
}
function advance() {
  const el = $('#storyText');
  if (el && el.textContent.length < el.dataset.full.length) { clearInterval(typing); el.textContent = el.dataset.full; return; }
  idx++;
  if (idx >= queue.length) { finish(); return; }
  overlay(frame(playStory.avatar)); type();
}
function finish() { clearInterval(typing); closeOverlay(); const d = onDone; onDone = null; queue = []; d && d(); }

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-story-skip]')) { finish(); return; }
  if (e.target.closest('[data-story-next]')) { advance(); }
});

// Dialogue for the generated chapters: the house's host sets the brief, Pim reacts, Ro closes. Chosen by a hash so it
// is stable per level; the eight handwritten chapters keep their own lines.
const HOST = { NUL: 'ro', AURA: 'aurelie', SOLENE: 'vesna', VESPER: 'dido', THORNE: 'noor', KORI: 'kori', HALO: 'mara', OXIDE: 'ophelia', WILD: 'lou', ARCHIVE: 'zee' };
const PIM_PRE = ['Gallery or not, I expect to be carried past whatever it is.', 'We are wearing the good bag, obviously.', 'If it rains, the bag needs a lid. Prioritise.', 'Blazer, please. I like a pocket.', 'Not our wedding. We will still be looked at.', 'Fringe is fine. Mud is not.', 'Pearls. Trust me, I know mothers.', 'Whatever you wear, I am the accessory.', 'Carry-on means carry me on.', 'Black, and I will behave. Mostly.', 'As if. We are dressing for the sidelines.', 'Objection sustained in advance. Show me the shoe.'];
const RO_PRE = ['Dress for the room, not the mirror.', 'Dress like you have somewhere to be after.', 'The shoe will be judged.', 'Edit. Then edit again.', 'Weather is not an excuse. The silhouette still has to work.', 'Tailoring, with an opinion.', 'Not your wedding. Remember that.', 'Boho is a decision, not an excuse.', 'Palette discipline, please.', 'One hero, properly framed.', 'Restraint.', 'Comfortable is not the same as unconsidered.'];
const HOST_WIN = ['The proportions do the work.', 'Exact. Not minimal. Exact.', 'Finished to the shoe. Good.', 'One hero, properly framed.', 'You read the brief. Finally.', 'Coherent from collar to heel.', 'The palette holds. Carry on.', 'Refined, not reinvented. Correct.', 'The waist is where expected.', 'Edited. I noticed. Keep going.', 'Right look. Right door.', 'Clarity. We like clarity here.'];
const PIM_WIN = ['Ugh, perfect. Pick me up.', 'Objection overruled. This is a look!', 'The bag has room. I rest my case.', 'Carry me. We are being photographed.', 'This is a ten. I counted.', 'Brief understood. Treats are owed.', 'The shoe is correct. I checked underneath.', 'We look expensive. Lift, please.', 'Palette approved. Now the bag, open it.', 'Finished to the heel. Small paw, chef’s kiss.', 'That hem is correct. Carry me past it.', 'Totally buggin’, in the good way. Up!'];
const RO_LOSE = ['The shoe betrays the dress.', 'Two aesthetics. One body. No.', 'Beautiful. Wrong evening entirely.', 'Mood board. Not a look.', 'Three accents is a crowd.', 'The waist has gone missing.', 'Unfinished, which is not undone.', 'Styled within an inch. Overstyled.', 'Costume. The brief said dress.', 'The references are showing. Badly.', 'Almost. Almost is not it.', 'She beat you on the shoe. It is always the shoe.'];
const PIM_CLIENT_PRE = ['Dress me. I have a brief and I have standards.', 'Today it is my turn. Do not make me look like a dog in a jumper.', 'Read the brief. Then look at my face. Then read it again.', 'I want to be carried in and I want people to gasp.', 'Collar first. I am not an animal.', 'Four pounds of client. Treat me like forty.', 'I will sit still for forty seconds. Use them.', 'Nothing itchy. Nothing with bells. Everything else, I am open.'];
const PIM_CLIENT_PRE2 = ['And a bag. I would like to be in a bag.', 'If there is a bow, it goes on the left. My good side.', 'Ro says less. Ro has never been a chihuahua.', 'Pink is not a colour. It is a position.', 'My ears are the silhouette. Work around them.', 'I have seen what you put on yourself. Do better for me.'];
const PIM_CLIENT_WIN = ['Yes. This. Carry me past the mirror again.', 'Somebody said “oh my god”. They meant me. Correct.', 'I feel expensive. I feel carried. I feel seen.', 'The other dog looked. The other dog looked away.', 'Finally. A stylist who understands ears.'];
const PIM_CLIENT_LOSE = ['No. I look like a dog in a jumper.', 'The collar is wrong and we both know it.', 'I cannot be seen in this. I am four pounds of no.', 'Her dog looked better. Her dog. Fix it.', 'One swap. I will wait. I will not wait nicely.'];
const hashS = (str) => { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };
export function storyFor(levelId) {
  if (STORY[levelId]) return STORY[levelId];
  const lv = LEVELS[levelId]; const ch = lv && CHAPTER_BY_ID[lv.chapter];
  if (!lv || !ch) return handStory(levelId);
  const h = hashS(levelId);
  const host = HOST[ch.house] || 'ro';
  const pick = (arr, k) => arr[(h >>> k) % arr.length];
  if (lv.secret) return { pre: [['ro', `Every level. Every mode. Every S. ${ch.title} has one more brief, and it is only for you. Do not waste it.`], ['pim', 'A secret level. I have never been so awake. Carry me higher.'], [host, `${lv.copy}`]], win: [[host, 'That is the whole chapter in one look. The piece is yours.'], ['pim', 'Exclusive. Nobody else has this. I am going to be insufferable about it.']], lose: [['ro', 'The strictest brief in the chapter. One swap at a time. I have all day. You do not.']] };
  if (ch.pim) {
    return {
      pre: [['pim', pick(PIM_CLIENT_PRE, 3)], ['ro', `${lv.copy}`], ['pim', pick(PIM_CLIENT_PRE2, 9)]],
      win: [['pim', pick(PIM_CLIENT_WIN, 5)], ['ro', pick(HOST_WIN, 11)]],
      lose: [['pim', pick(PIM_CLIENT_LOSE, 7)]],
    };
  }
  const where = ch.theme ? `${ch.theme[0].toUpperCase()}${ch.theme.slice(1)}.` : '';
  return {
    pre: [[host, `${where} ${lv.copy}`.trim()], ['pim', pick(PIM_PRE, 3)], ['ro', pick(RO_PRE, 9)]],
    win: [[host, pick(HOST_WIN, 5)], ['pim', pick(PIM_WIN, 11)]],
    lose: [['ro', pick(RO_LOSE, 7)]],
  };
}
