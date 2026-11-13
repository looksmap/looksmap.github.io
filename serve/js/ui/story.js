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

// Pim, the chihuahua.
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
    <div class="story" data-story-next tabindex="0" role="button" aria-label="Next line">
      <div class="story-portrait ${spk === 'pim' ? 'pim' : spk === 'you' ? 'you' : ''}">${portrait(spk, avatar)}</div>
      <div class="story-box">
        <div class="story-name">${esc(spk === 'you' ? (avatar?.name || 'You') : c.name)}${c.role && spk !== 'you' ? `<span class="mono muted"> · ${esc(c.role)}</span>` : ''}</div>
        <p class="story-text" id="storyText" data-full="${esc(text)}" aria-live="polite"></p>
        <div class="story-foot"><span class="mono muted">${idx + 1} / ${queue.length}</span><span class="story-cta">${last ? 'Continue' : 'Tap'} ${icon(last ? 'play' : 'back', 'flip')}</span></div>
        <button class="story-skip" data-story-skip>${icon('skip')} Skip</button>
      </div>
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
  overlay(frame(avatar)); type(); $('.story')?.focus({ preventScroll: true });
  // keep avatar for subsequent frames
  playStory.avatar = avatar;
}
function advance() {
  const el = $('#storyText');
  if (el && el.textContent.length < el.dataset.full.length) { clearInterval(typing); el.textContent = el.dataset.full; return; }
  idx++;
  if (idx >= queue.length) { finish(); return; }
  overlay(frame(playStory.avatar)); type(); $('.story')?.focus({ preventScroll: true });
}
function finish() { clearInterval(typing); closeOverlay(); const d = onDone; onDone = null; queue = []; d && d(); }

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-story-skip]')) { finish(); return; }
  if (e.target.closest('[data-story-next]')) { advance(); }
});
document.addEventListener('keydown', (e) => {
  if (!queue.length || !$('.story')) return;
  if (e.key === 'Escape') { e.stopImmediatePropagation(); finish(); return; }
  if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('[data-story-skip]')) { e.preventDefault(); advance(); }
}, true);

// Dialogue for the generated chapters: the house's host gives the brief and Pim adds a line. Chosen by a hash so it
// is stable per level; the eight handwritten chapters keep their own lines. Every line here has to make sense for
// any brief, so none of them names a garment, a place or a mood.
const HOST = { NUL: 'ro', AURA: 'aurelie', SOLENE: 'vesna', VESPER: 'dido', THORNE: 'noor', KORI: 'kori', HALO: 'mara', OXIDE: 'ophelia', WILD: 'lou', ARCHIVE: 'zee' };
const HOST_PRE = ['I have a new job for you.', 'Here’s your next brief.', 'I’m glad you’re here, because I need a stylist.', 'This one should be fun.', 'Are you ready for the next one?', 'I saved this brief for you.'];
const PIM_PRE = ['I’ll be watching from the bag. Read the mood words before you pick anything!', 'Check the weather on the brief first, so we don’t end up too hot or too cold.', 'Start with the piece you like most, then choose the rest to go with it.', 'If the brief asks for a bag, please pick a comfortable one. I’ll be sitting in it.', 'Take your time. I’m happy as long as somebody carries me.', 'The first mood word matters most, so start there.', 'Don’t forget the shoes! People always notice the shoes.', 'I believe in you. I also believe there will be snacks afterwards.', 'Try a few things on before you send it. That’s my favourite part.', 'Remember to check what the brief says you must wear.', 'I had a nap, so I’m ready to help.', 'Let’s make this one an S!'];
const HOST_WIN = ['That’s exactly what I asked for. Thank you!', 'You read the brief carefully, and it shows.', 'Everything works together, from the top down to the shoes.', 'That was the right outfit for the occasion.', 'I’d happily put that in the magazine.', 'Beautiful work. I knew I could count on you.', 'That suits the mood perfectly.', 'You made that look easy.', 'I wouldn’t change a thing.', 'That’s a clear win. Well done!'];
const PIM_WIN = ['That was perfect! Please pick me up so I can celebrate.', 'We won! I think that earns both of us a treat.', 'I knew you’d get it. I never doubted you for a second.', 'Everyone was looking at us, and I loved it.', 'That’s a ten out of ten from me.', 'You understood the brief, so now it’s snack time.', 'I checked the shoes from down here, and they were just right.', 'We look amazing. Can we walk past the mirror again?', 'The colours were so pretty together!', 'That was your best one yet.', 'I’m so proud that my tail won’t stop wagging.', 'Another win! Carry me home, please.'];
const HOST_LOSE = ['That wasn’t quite what the brief asked for. The notes below show what to change.', 'Your rival was a little ahead this time. One swap could be enough to win.', 'That was very close. Have a look at the notes and try again.', 'It didn’t work this time, but you’re nearly there. Check the mood words again.', 'That one missed. Read the brief once more and change one or two pieces.', 'I think you can do better than that. Look at which lines scored lowest and start there.'];
const PIM_CLIENT_PRE = ['Today it’s my turn to be dressed! I’ve read the brief and I’m very excited.', 'Please make me look good today. I don’t want to look like a dog in a jumper.', 'Read my brief carefully, then look at my face, because I’m serious about this.', 'I’d like people to gasp when I’m carried in.', 'Let’s start with the collar. It’s the most important part.', 'I’m only four pounds, but I’m a very important client.', 'I can sit still for about forty seconds, so let’s be quick.', 'I don’t want anything itchy or anything with bells. Otherwise I’m open to ideas.'];
const PIM_CLIENT_PRE2 = ['I’d also like a bag to ride in, if there’s one that suits.', 'If there’s a bow, please put it on my left side. That’s my best side.', 'Ro always says to wear less, but Ro has never been a chihuahua.', 'I think pink suits me, but I’ll trust you.', 'Remember that my ears are big, so choose things that work with them.', 'You always dress yourself so well. Now do the same for me!'];
const PIM_CLIENT_WIN = ['Yes, this is the one! Please carry me past the mirror again.', 'Somebody said “oh my gosh”, and they were talking about me.', 'I feel fancy and I feel very loved.', 'The other dog looked at me, and then looked away. I won.', 'Finally, a stylist who understands ears!'];
const PIM_CLIENT_LOSE = ['Oh no, I look like a dog in a jumper. Can we try again?', 'The collar isn’t right, and I think we both know it.', 'I can’t go out in this. Please change something.', 'The other dog looked better than me, and I can’t allow that. Please fix it.', 'Change one thing and I’ll wait here. I might sigh a little.'];
const hashS = (str) => { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };
export function storyFor(levelId) {
  if (STORY[levelId]) return STORY[levelId];
  const lv = LEVELS[levelId]; const ch = lv && CHAPTER_BY_ID[lv.chapter];
  if (!lv || !ch) return handStory(levelId);
  const h = hashS(levelId);
  const host = HOST[ch.house] || 'ro';
  const pick = (arr, k) => arr[(h >>> k) % arr.length];
  if (lv.secret) return { pre: [['ro', `You earned an S on every level of ${ch.title}, in every mode, so there’s one more brief here that only you can play.`], ['pim', 'A secret level! I’ve never been so awake.'], [host, `${lv.copy}`]], win: [[host, 'You put the whole chapter into one outfit. This piece is yours to keep.'], ['pim', 'Nobody else has this one! I’m going to tell everybody.']], lose: [['ro', 'This is the strictest brief in the chapter. Change one piece at a time and you’ll get there.']] };
  if (ch.pim) {
    return {
      pre: [['pim', pick(PIM_CLIENT_PRE, 3)], ['ro', `${lv.copy}`], ['pim', pick(PIM_CLIENT_PRE2, 9)]],
      win: [['pim', pick(PIM_CLIENT_WIN, 5)], ['ro', pick(HOST_WIN, 11)]],
      lose: [['pim', pick(PIM_CLIENT_LOSE, 7)]],
    };
  }
  return {
    pre: [[host, `${pick(HOST_PRE, 13)} ${lv.copy}`], ['pim', pick(PIM_PRE, 3)]],
    win: [[host, pick(HOST_WIN, 5)], ['pim', pick(PIM_WIN, 11)]],
    lose: [[host, pick(HOST_LOSE, 7)]],
  };
}
