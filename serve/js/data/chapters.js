// Chapters are illustrated maps of levels. Clear a level to open the next; clear a chapter to open the next chapter
// and its Princess run (harder briefs, better drops). Themes follow the houses and the sets that drop here.
import { C } from './palette.js';
import { NOVELS, THEMES, genLevels } from './themes.js';
import { CATALOG } from './catalog.js';

const FORMAL = ['loungewear', 'casual', 'smart casual', 'polished', 'cocktail', 'formal', 'black tie'];

// A compact level: [title, client, copy, formality, mood[], weather, required[], extra]
const L = (title, client, copy, formality, mood, weather, required = [], extra = {}) => ({ title, client, copy, formality, mood, weather, required, ...extra });

export const CHAPTERS = [
  {
    id: 'c1', number: '01', title: 'Arrival', theme: 'The city', line: 'New city, new you. Nine everyday briefs to learn the read.', accent: C.cherry, sets: ['arrival', 'first_night', 'pitch_pub'],
    swatches: ['cotton', 'denim', 'leather'], basePass: 58, step: 2,
    levels: [
      L('The mirror', 'Ro, at your flat', 'Three words per brief: the occasion, the mood, the weather. Put on a top, a bottom and shoes, then send it to be judged.', 1, ['easy', 'fresh'], 3, [], { tutorial: true, pass: 40, credits: 100 }),
      L('Coffee run', 'You, 8:40am', 'A quick walk to the coffee shop. Keep it easy and light.', 1, ['easy', 'fresh'], 2),
      L('First day at the studio', 'HALFTONE magazine, design floor', 'A creative office. Nobody wears a suit, but everyone notices shoes. Bring a bag.', 2, ['modern', 'relaxed', 'polished'], 3, ['bag']),
      L('The landlord visits', 'Your flat', 'Look responsible enough to be trusted with the keys. Classic, and nothing loud.', 2, ['classic', 'minimal'], 3),
      L('Birthday at the dive bar', 'Mara’s birthday', 'She said don’t dress up, which means dress up a little. Edgy and feminine, and easy to dance in.', 2, ['edgy', 'feminine', 'easy'], 2),
      L('Football match', 'Halo Sport, Saturday', 'A match, then the pub after. Sporty and playful, comfortable for four hours on your feet. No satin, sequins or velvet.', 1, ['sporty', 'playful', 'easy'], 2, [], { forbid: { textures: ['satin', 'sequin', 'velvet'] } }),
      L('Sunday picnic', 'The park', 'Soft light and grass. Pretty without trying: ribbons rather than logos.', 2, ['pretty', 'soft'], 1),
      L('Rainy day out', 'A wet afternoon', 'The weather is part of the brief. Tailored, in cool colours, and a coat is required.', 2, ['tailored', 'cool', 'polished'], 3, ['outer']),
      L('Dinner with the parents', 'A restaurant with tablecloths', 'Meeting someone’s parents. Classic and polished, soft around the edges. One good bag.', 3, ['classic', 'polished', 'soft'], 3, ['bag']),
    ],
  },
  {
    id: 'c2', number: '02', title: 'Rue Bouclé', theme: 'The tweed house', line: 'A tweed house on a Paris street. Frayed jackets, pearls, braid trim, bows.', accent: '#B89B7A', sets: ['rue_boucle', 'rue_boucle_noir', 'library_hours', 'scarf_season'],
    swatches: ['tweed', 'pearl', 'wool'], basePass: 66, step: 2, unlock: 'c1',
    levels: [
      L('Fitting at the atelier', 'Sainte Aura, rue Bouclé', 'The house wants to see how you wear structure. Quiet and polished, with a defined waist. Bring a bag.', 3, ['quietlux', 'polished'], 3, ['bag']),
      L('Tea room', 'A tea room', 'Pretty and classic. Pearls or a bow somewhere, and nothing else shiny.', 3, ['classic', 'pretty', 'quiet'], 2),
      L('Reading room shoot', 'Thorne & Co library', 'Dark academia with a sharp edge. Loafers or boots, and carry a book.', 2, ['academia', 'sharp'], 3),
      L('Built around one shoe', 'The slingback counter', 'Start with a two-tone shoe and build everything else around it. Polished and minimal, in cool colours. Bring a bag.', 3, ['polished', 'minimal', 'cool'], 2, ['bag']),
      L('Tweed photoshoot', 'HALFTONE, autumn issue', 'Tweed somewhere, and everything else deferring to it. Classic and soft, with one hero piece.', 3, ['classic', 'soft', 'bold'], 3, [], { mustTexture: 'tweed' }),
      L('Tweed after dark', 'A bar with a dress code', 'The jacket at night: black, a cherry lip, and one thing that catches candlelight. Bring a bag.', 4, ['sleek', 'classic', 'nocturnal'], 2, ['bag']),
      L('Gallery opening', 'Clerkenwell, Thursday 7pm', 'Quiet clothes photograph better next to art. Polished, in warm colours. Bring a bag.', 3, ['quietlux', 'polished', 'warm'], 3, ['bag']),
      L('Show day', 'Sainte Aura, front row', 'Bows, pearls and bouclé in one look that still makes sense. Bring a bag.', 3, ['coquette', 'classic', 'polished'], 2, ['bag']),
    ],
  },
  {
    id: 'c3', number: '03', title: 'Night Shift', theme: 'After dark', line: 'After dark. Tuxedo tailoring, sheer blouses, big shoulders, fur. The dress codes get strict.', accent: '#5A1C28', sets: ['le_smoking', 'after_dark', 'mob_brunch', 'sphinx_midnight', 'palazzo_after_dark'],
    swatches: ['satin', 'velvet', 'fur', 'gold'], basePass: 72, step: 2, unlock: 'c2',
    levels: [
      L('First date, wine bar', 'Natural wine, low light', 'Sleek and a little romantic, mostly dark. A bag small enough to forget.', 3, ['sleek', 'romantic', 'dark'], 2, ['bag']),
      L('The tuxedo dinner', 'Maison Solène, private dinner', 'A tuxedo cut for a woman. Tailored, sharp and sleek. Black wins. Bring a bag.', 4, ['tailored', 'sharp', 'sleek'], 2, ['bag']),
      L('Fashion week', 'HALFTONE, standing section', 'Strangers will photograph you from the knees up. Bold, modern and sharp, with one idea. Bring a bag.', 3, ['bold', 'modern', 'sharp'], 3, ['bag']),
      L('After-party, 2am', 'Someone’s kitchen', 'Undone on purpose. Edgy and layered, as if you came from somewhere better.', 2, ['undone', 'edgy', 'nocturnal'], 2),
      L('Brunch in fur', 'Maison Solène, Sunday 1pm', 'Fur, gold and sunglasses indoors. One animal print, one metal, one hero piece. Bring a bag.', 3, ['mob', 'bold', 'warm'], 4, ['bag']),
      L('The sheer blouse', 'A gallery dinner', 'Something sheer, worn as if it’s nothing. Sleek and dark. Bring a bag.', 4, ['siren', 'sleek', 'dark'], 2, ['bag'], { mustTexture: 'sheer' }),
      L('Black-tie gala', 'A gala with a seating plan', 'The strictest dress code there’s. Glamorous, sleek and classic. Don’t dress under it. Bring a bag.', 6, ['glamorous', 'sleek', 'classic'], 2, ['bag'], { tolerance: 0 }),
      L('Hotel bar, closing time', 'The hotel bar', 'Glamour with the shoes off in spirit. Glamorous, but undone.', 4, ['glamorous', 'undone', 'nocturnal'], 2),
    ],
  },
  {
    id: 'c4', number: '04', title: 'New Silhouette', theme: 'The garden house', line: 'The garden house. Nipped waists, full skirts, printed cotton, gloves, hats.', accent: '#9DB4CF', sets: ['new_look', 'garden_toile', 'ballet_class', 'horse_girl_noir', 'debutante'],
    swatches: ['wool', 'cotton', 'lace', 'pearl'], basePass: 76, step: 2, unlock: 'c3',
    levels: [
      L('Garden party', 'A lawn and a string quartet', 'Pretty, polished and fresh. A full skirt wouldn’t be wrong. Bring a bag.', 3, ['pretty', 'polished', 'fresh'], 1, ['bag']),
      L('The fitting room', 'Vesper', 'A nipped waist and a full skirt. Classic, sharp and feminine. Bring a bag.', 4, ['classic', 'sharp', 'feminine'], 3, ['bag']),
      L('One print only', 'HALFTONE, print story', 'One print, one colour, and everything else plain. Classic, pretty, minimal.', 3, ['classic', 'pretty', 'minimal'], 2),
      L('Ballet class', 'A studio with a barre', 'Rehearsal softness. Soft and pretty.', 2, ['ballet', 'soft', 'pretty'], 2),
      L('Outdoor wedding', 'A vineyard, 30 degrees', 'You’re a guest. Pretty, polished and fresh. Not white, not cream. Bring a bag.', 4, ['pretty', 'polished', 'fresh'], 1, ['bag'], { forbid: { colors: [C.white, C.bone] } }),
      L('Matinee, hat and gloves', 'A theatre matinee', 'Polished, classic and soft. Something on your head and something on your hands. Bring a bag.', 4, ['polished', 'classic', 'soft'], 3, ['bag', 'gloves']),
      L('Rain in the rose garden', 'The park, with an umbrella', 'Romantic and tailored, in cool colours. A coat with a waist is required.', 3, ['romantic', 'cool', 'tailored'], 3, ['outer']),
      L('Show day', 'Vesper, the salon', 'The house codes in one look: a waist, volume, a hat, a glove, a pearl. Bring a bag.', 5, ['classic', 'polished', 'glamorous'], 2, ['bag']),
    ],
  },
  {
    id: 'c5', number: '05', title: 'Chrome Season', theme: 'The future', line: 'The future, apparently. Liquid metal, technical fabrics, visors, clean lines.', accent: '#A9ACB2', sets: ['chrome_season', 'shell_system', 'cyber_ballet', 'office_2030'],
    swatches: ['metal', 'nylon', 'latex'], basePass: 80, step: 1, unlock: 'c4',
    levels: [
      L('Office, 2030', 'Vesper × KŌRI shoot', 'Pencil-skirt energy run through a mirror. Siren, futuristic and sharp. Bring a bag.', 3, ['siren', 'futuristic', 'sharp'], 2, ['bag']),
      L('Gallery in the rain', 'A private view', 'Technical outerwear that could walk into a white gallery. Polished and minimal. A coat is required.', 1, ['gorp', 'polished', 'minimal'], 4, ['outer']),
      L('Dance fundraiser', 'A dance company', 'Tulle and chrome can be friends if the palette is calm. Ballet, futuristic, soft.', 2, ['ballet', 'futuristic', 'soft'], 2),
      L('Sunglasses shoot', 'KŌRI, daylight', 'One pair of sunglasses and a look that earns them. Futuristic, modern and cool. Sunglasses required.', 2, ['futuristic', 'modern', 'cool'], 2, ['eyes']),
      L('Chrome launch', 'A launch in a car park', 'Chrome somewhere, matte everywhere else. Futuristic, bold and minimal. Something metallic required.', 3, ['futuristic', 'bold', 'minimal'], 2, [], { mustTexture: 'metal' }),
      L('Technical after-party', 'KŌRI, after-party', 'Technical pieces after dark. Sleek and nocturnal. Bring a bag.', 2, ['gorp', 'nocturnal', 'sleek'], 3, ['bag']),
      L('Y2K cover shoot', 'HALFTONE, cover try', 'Y2K, but it’s 2030. Playful and futuristic, three colours at most.', 2, ['y2k', 'futuristic', 'playful'], 1),
      L('Chrome campaign', 'KŌRI campaign, final look', 'One chrome hero piece and a supporting cast that knows it. Bold and minimal, no prints.', 3, ['chrome', 'bold', 'minimal'], 2, [], { forbid: { prints: true } }),
    ],
  },
  {
    id: 'c6', number: '06', title: 'Riviera', theme: 'The coast', line: 'The coast. Linen, gingham, gold hoops, sun on your shoulders.', accent: '#F2E27A', sets: ['riviera', 'coastal_tomato', 'sunday_boho', 'provencal_sunday', 'alpine_prairie'],
    swatches: ['cotton', 'canvas', 'gold'], basePass: 80, step: 1, unlock: 'c5',
    levels: [
      L('Market morning', 'A port town, 9am', 'Fresh, easy and pretty. Something to carry lemons in.', 1, ['fresh', 'easy', 'pretty'], 1, ['bag']),
      L('Trattoria lunch', 'A terrace in the sun', 'Red somewhere, gingham maybe, gold hoops certainly. Pretty, warm and playful.', 2, ['pretty', 'warm', 'playful'], 1),
      L('Boat day', 'A friend’s boat', 'Sporty but chic. Clean, fresh and minimal. Flats only.', 1, ['clean', 'fresh', 'minimal'], 1, [], { forbid: { heels: true } }),
      L('Flea market', 'A Sunday flea market', 'Prairie dress, western boot, a flower in your hair. Boho, soft and romantic.', 2, ['boho', 'soft', 'romantic'], 2),
      L('Rooftop cocktails', 'Sunset, and windy', 'Glamorous and fresh, with one hero piece. Plan for the wind. Bring a bag.', 4, ['glamorous', 'fresh', 'bold'], 1, ['bag']),
      L('Beach bar', 'A beach bar', 'Western boots and a sundress. Boho, playful and warm.', 2, ['boho', 'playful', 'warm'], 1),
      L('Dinner by the water', 'White tablecloths, sea air', 'Polished, romantic and fresh. Sandals with a heel. Bring a bag.', 4, ['polished', 'romantic', 'fresh'], 1, ['bag']),
      L('Golden hour swim', 'The last swim of the day', 'All light. Soft, fresh, minimal. Nothing heavier than linen.', 1, ['soft', 'fresh', 'minimal'], 1, [], { maxWeight: 2 }),
    ],
  },
  {
    id: 'c7', number: '07', title: 'Gothic Romance', theme: 'The dark house', line: 'The dark house. Black lace, pearls, veils, combat boots.', accent: '#4E2A4F', sets: ['gothic_romance', 'rose_thorn', 'fairy_grunge', 'fireflies_rome', 'heartbeat'],
    swatches: ['lace', 'velvet', 'sheer', 'pearl'], basePass: 80, step: 1, unlock: 'c6',
    levels: [
      L('Candlelit bar', 'A candlelit bar', 'Romantic and dark, a little edgy. Lace or velvet, and boots that have seen things.', 3, ['romantic', 'dark', 'edgy'], 2),
      L('Forest rave', 'A rave in the woods', 'Mesh under lace under a jacket. Fairy grunge: undone and soft.', 1, ['fairy', 'undone', 'soft'], 2),
      L('Band after-party', 'A band’s after-party', 'Cherry velvet and a corset belt. Edgy, romantic and bold. A belt is required.', 3, ['edgy', 'romantic', 'bold'], 2, ['belt']),
      L('Masquerade', 'A masked ball', 'Something over the face. Glamorous, dark and romantic. A veil or hair piece is required.', 5, ['glamorous', 'dark', 'romantic'], 2, ['hairAcc']),
      L('Gothic photoshoot', 'HALFTONE, gothic story', 'Pearls with a combat boot: the whole chapter in one high-low look. Edgy, classic and dark.', 3, ['edgy', 'classic', 'dark'], 3),
      L('A chic funeral', 'A very chic funeral', 'All black, with the textures doing the talking. Dark, polished and soft. Bring a bag.', 4, ['dark', 'polished', 'soft'], 3, ['bag']),
      L('Choir recital', 'A cathedral', 'Romantic, classic and minimal. One hero piece and nothing else loud.', 4, ['romantic', 'classic', 'minimal'], 3),
      L('Show day', 'OXIDE, a crypt', 'The house codes in one look: lace, a veil, a boot, a pearl. Bring a bag.', 4, ['gothic', 'romantic', 'bold'], 2, ['bag']),
    ],
  },
  {
    id: 'c8', number: '08', title: 'Haute Street', theme: 'The street house', line: 'The street house. Micro minis, shrunken cardigans, huge blazers, trainers with gowns.', accent: '#E54B86', sets: ['haute_street', 'oversize_city', 'docent_uniform', 'labour_of_love'],
    swatches: ['denim', 'nylon', 'knit', 'leather'], basePass: 84, step: 1, unlock: 'c7',
    levels: [
      L('Campus day', 'A campus that isn’t a campus', 'The shrunken cardigan and the micro mini. Y2K, pretty and playful.', 2, ['y2k', 'pretty', 'playful'], 2),
      L('Creative office, Friday', 'A creative office', 'Oversized everything, except the point. Modern, relaxed, sharp. Bring a bag.', 3, ['modern', 'relaxed', 'sharp'], 3, ['bag']),
      L('Awards after-party', 'An awards show, after', 'Trainers with a gown: high-low at its most literal. Glamorous, easy and bold.', 4, ['glamorous', 'easy', 'bold'], 2),
      L('Warehouse gig', 'A warehouse show', 'Band tee, leather, smudged eyeliner. Indie sleaze: edgy and undone.', 1, ['sleaze', 'edgy', 'undone'], 2),
      L('Pilates, then errands', 'A Tuesday', 'Slicked bun, gold hoops, nothing louder. Clean, minimal and fresh.', 1, ['clean', 'minimal', 'fresh'], 2),
      L('Cup final', 'Halo Sport, the cup', 'A football jersey and a pleated skirt, properly styled. Sporty, playful and sharp.', 1, ['sporty', 'playful', 'sharp'], 2),
      L('Street-style shoot', 'HALFTONE, street-style story', 'What the photographers stop for. Bold, modern and playful. Exactly three accessories. Bring a bag.', 3, ['bold', 'modern', 'playful'], 3, ['bag'], { exactAccessories: 3 }),
      L('Show day', 'The street outside the show', 'The whole chapter in one look: a micro mini, an oversized layer, a sharp shoe, one bag.', 3, ['modern', 'playful', 'sharp'], 2, ['bag']),
    ],
  },
];

// Ninety-two more chapters from themes.js. Pass marks rise with the chapter number and flatten in the high eighties.
const WORLD_ACCENT = { c1: '#E0218A', c2: '#5FC9C0', c3: '#FF4FA3', c4: '#E0218A', c5: '#FF77B7', c6: '#FF5FA2', c7: '#FF2E88', c8: '#5FC9C0' };
THEMES.forEach((t, k) => {
  const n = k + 9;
  const basePass = Math.min(86, 58 + Math.floor((n - 1) * 0.45));
  CHAPTERS.push({ id: `c${n}`, number: String(((n - 1) % 20) + 1).padStart(2, '0'), title: t.title, theme: t.theme, line: t.line, accent: WORLD_ACCENT[t.world], world: t.world, house: t.house, aes: t.aes, sets: [], swatches: t.swatches, basePass, step: 1, unlock: `c${n - 1}`, generated: true, pim: !!t.pim, levels: genLevels(t, n) });
});
// novels, world and level gates for every chapter
CHAPTERS.forEach((ch, k) => {
  const n = k + 1;
  ch.global = n;
  ch.novel = Math.floor((n - 1) / 20) + 1;
  ch.world = ch.world || ch.id;
  ch.minLevel = n <= 3 ? 1 : Math.floor(1 + (n - 1) * 1.15);
  if (!ch.sets) ch.sets = [];
});
export { NOVELS };
export const chaptersOf = (novel) => CHAPTERS.filter((c) => c.novel === novel);

// Pieces a later level needs are guaranteed earlier in the chapter.
const DROP_OVERRIDES = { 'c3-3': 'set.after_dark.gown', 'c3-5': 'set.after_dark.strappy', 'c3-6': 'set.after_dark.clutch', 'c3-1': 'set.le_smoking.smokingjacket', 'c7-1': 'set.fairy_grunge.mesh', 'c7-2': 'set.fairy_grunge.combat', 'c5-1': 'set.shell_system.parka', 'c6-3': 'set.sunday_boho.prairie', 'c8-3': 'set.haute_street.microskirt' };
// Build runtime level objects: ids, pass marks, rewards, drops (filled by the catalogue layer).
const hash = (str) => { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };
export function buildLevels(sets) {
  const levels = {};
  const order = [];
  const byAes = (aes) => sets.filter((s) => !s.secret && s.aes && aes.some((a) => s.aes.includes(a)));
  for (const ch of CHAPTERS) {
    if (ch.pim) {
      // her chapters drop her own pieces: eight distinct bases that lean to the chapter's aesthetics, one slot per level
      const want = ['neck', 'head', 'outer', 'dress', 'shoes', 'eyes', 'bag', 'top'];
      const score = (i) => (i.aesthetics?.[ch.aes[0]] || 0) * 2 + (i.aesthetics?.[ch.aes[1]] || 0) + (i.rarity === 'edit' ? 0.4 : i.rarity === 'archive' ? 0.8 : i.rarity === 'icon' ? 1 : 0);
      const taken = new Set();
      ch.pimDrops = want.map((slot, k) => {
        const cands = CATALOG.filter((i) => i.pim && !i.set && i.slot === slot && i.rarity !== 'core' && i.source !== 'starter' && !taken.has(i.base)).sort((a, b) => score(b) - score(a) || (hash(a.id + ch.id) % 97) - (hash(b.id + ch.id) % 97));
        const it = cands[(ch.global + k) % Math.max(1, Math.min(4, cands.length))] || cands[0];
        if (it) taken.add(it.base);
        return it?.id || null;
      });
    } else if (ch.generated && !ch.sets.length) {
      const pool = byAes(ch.aes || []);
      const pick = pool.length ? pool : sets.filter((s) => !s.secret);
      ch.sets = [pick[(ch.global * 7) % pick.length].id, pick[(ch.global * 11 + 3) % pick.length].id].filter((v, i, a) => a.indexOf(v) === i);
    }
    const chSets = ch.sets.map((id) => sets.find((s) => s.id === id)).filter(Boolean);
    const pool = chSets.flatMap((s) => s.pieceIds);
    ch.levels.forEach((lv, i) => {
      const id = `${ch.id}-${i + 1}`;
      const tut = ch.levels.filter((l) => l.tutorial).length;
      const pass = lv.pass ?? ch.basePass + (i - tut) * ch.step;
      // drops: spread set pieces across the chapter's levels; each level guarantees one piece on first clear
      const drops = ch.pim ? ch.pimDrops.filter((v, k) => v && k % ch.levels.length === i) : pool.filter((_, k) => k % ch.levels.length === i);
      const drop = DROP_OVERRIDES[id] || drops[0] || (ch.pim ? ch.pimDrops[i % ch.pimDrops.length] : pool[i % Math.max(1, pool.length)]);
      levels[id] = {
        ...lv, id, chapter: ch.id, index: i + 1, pass, easyPass: Math.max(30, pass - 8), hardPass: Math.min(95, pass + 8),
        credits: lv.credits ?? 120 + (i - tut) * 30 + Math.min(CHAPTERS.indexOf(ch), 30) * 40,
        item: drop, drops, swatches: ch.swatches, fabric: ch.swatches[i % ch.swatches.length], tolerance: lv.tolerance ?? 1, mood: lv.mood, required: lv.required || [],
        occasion: lv.title, formalityWord: FORMAL[lv.formality],
      };
      order.push(id);
    });
    // the secret level: opens when every level is S in every mode; each clear drops the next piece of the exclusive set
    const secretSet = sets.find((s) => s.id === `secret_${ch.id}`);
    const last = ch.levels[ch.levels.length - 1];
    const sid = `${ch.id}-s`;
    levels[sid] = {
      title: `${ch.title}: the secret brief`, client: ch.pim ? 'Pim. Only Pim.' : 'Nobody. This one is for you.', copy: `${ch.pim ? 'Her whole chapter in one look, at its strictest.' : 'The whole chapter in one look, at its strictest.'} ${last.copy}`, pim: !!ch.pim,
      formality: last.formality, mood: [...(ch.aes || []).filter(Boolean), ...(last.mood || [])].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3), weather: last.weather, required: last.required || [],
      id: sid, chapter: ch.id, index: ch.levels.length + 1, secret: true, pass: Math.min(97, ch.basePass + ch.step * (ch.levels.length - 1) + 12), easyPass: 0, hardPass: 0,
      credits: 400 + Math.min(CHAPTERS.indexOf(ch), 30) * 40, item: secretSet?.pieceIds?.[0] || null, drops: secretSet?.pieceIds || [], exclusive: secretSet?.id || null,
      swatches: ch.swatches, fabric: ch.swatches[0], tolerance: last.tolerance ?? 1, occasion: last.title, formalityWord: FORMAL[last.formality],
    };
    ch.secret = sid;
  }
  return { levels, order };
}
