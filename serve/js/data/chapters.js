// Chapters are illustrated maps of levels. Clear a level to open the next; clear a chapter to open the next chapter. Themes follow the houses and the sets that drop here.
import { C } from './palette.js';
import { NOVELS, THEMES, genLevels } from './themes.js';
import { CATALOG } from './catalog.js';

const FORMAL = ['loungewear', 'casual', 'smart casual', 'polished', 'cocktail', 'formal', 'black tie'];

// A compact level: [title, client, copy, formality, mood[], weather, required[], extra]
const L = (title, client, copy, formality, mood, weather, required = [], extra = {}) => ({ title, client, copy, formality, mood, weather, required, ...extra });

export const CHAPTERS = [
  {
    id: 'c1', number: '01', title: 'Arrival', theme: 'The city', line: 'You’ve just arrived in the city. Nine everyday briefs teach you how styling works.', accent: C.cherry, sets: ['arrival', 'first_night', 'pitch_pub'],
    swatches: ['cotton', 'denim', 'leather'], basePass: 58, step: 2,
    levels: [
      L('The mirror', 'Ro, at your flat', 'Every brief gives you an occasion, a mood and the weather. Put on a top, a bottom and shoes, then send your outfit to be judged.', 1, ['easy', 'fresh'], 3, [], { tutorial: true, pass: 40, credits: 100 }),
      L('Coffee run', 'The café on the corner, 8:40am', 'A quick walk to the coffee shop on a warm morning. Keep it easy and light.', 1, ['easy', 'fresh'], 2),
      L('First day at the studio', 'HALFTONE magazine, design floor', 'A creative office where nobody wears a suit, but everyone notices shoes. Dress in a modern, relaxed way and bring a bag.', 2, ['modern', 'relaxed', 'polished'], 3, ['bag']),
      L('The landlord visits', 'Your flat', 'The landlord is deciding whether to trust you with the keys. Wear something classic, with nothing loud.', 2, ['classic', 'minimal'], 3),
      L('Birthday at the dive bar', 'Mara’s birthday', 'Mara said not to dress up, which means dress up a little. Go edgy and feminine, and make sure you can dance in it.', 2, ['edgy', 'feminine', 'easy'], 2),
      L('Football match', 'Halo Sport, Saturday', 'You’re going to a match and then the pub. Dress sporty and playful, in something comfortable for four hours on your feet. No satin, sequins or velvet.', 1, ['sporty', 'playful', 'easy'], 2, [], { forbid: { textures: ['satin', 'sequin', 'velvet'] } }),
      L('Sunday picnic', 'The park', 'A picnic on the grass in soft afternoon light. Look pretty without trying too hard, with ribbons instead of logos.', 2, ['pretty', 'soft'], 1),
      L('Rainy day out', 'A wet afternoon', 'It’s raining all afternoon. Wear something tailored in cool colours. A coat is required.', 2, ['tailored', 'cool', 'polished'], 3, ['outer']),
      L('Dinner with the parents', 'A restaurant with tablecloths', 'You’re meeting your date’s parents for dinner. Keep it classic and polished with soft touches, and carry one good bag.', 3, ['classic', 'polished', 'soft'], 3, ['bag']),
    ],
  },
  {
    id: 'c2', number: '02', title: 'Rue Bouclé', theme: 'The tweed house', line: 'Sainte Aura is a tweed house on a Paris street, known for its jackets, pearls and bows.', accent: '#B89B7A', sets: ['rue_boucle', 'rue_boucle_noir', 'library_hours', 'scarf_season'],
    swatches: ['tweed', 'pearl', 'wool'], basePass: 66, step: 2, unlock: 'c1',
    levels: [
      L('Fitting at the atelier', 'Sainte Aura, rue Bouclé', 'The house would like to see how you wear a structured jacket. Keep it quiet and polished, with a defined waist. Bring a bag.', 3, ['quietlux', 'polished'], 3, ['bag']),
      L('Tea room', 'A tea room', 'Afternoon tea calls for something pretty and classic. Add pearls or a bow, and nothing else shiny.', 3, ['classic', 'pretty', 'quiet'], 2),
      L('Reading room shoot', 'Thorne & Co library', 'A photo shoot in a library. The look is dark academia with a sharp edge, so wear loafers or boots and carry a book.', 2, ['academia', 'sharp'], 3),
      L('Built around one shoe', 'The slingback counter', 'Start with a two-tone shoe and build everything else around it. Keep the rest polished and simple, in cool colours. Bring a bag.', 3, ['polished', 'minimal', 'cool'], 2, ['bag']),
      L('Tweed photoshoot', 'HALFTONE, autumn issue', 'Wear tweed somewhere and make it the star of the outfit. Keep everything else classic and soft.', 3, ['classic', 'soft', 'bold'], 3, [], { mustTexture: 'tweed' }),
      L('Tweed after dark', 'A bar with a dress code', 'The tweed jacket goes out for the evening. Wear black with a cherry lip, and add one thing that catches the candlelight. Bring a bag.', 4, ['sleek', 'classic', 'nocturnal'], 2, ['bag']),
      L('Gallery opening', 'Clerkenwell, Thursday 7pm', 'Quiet clothes look best next to art. Wear something polished in warm colours, and bring a bag.', 3, ['quietlux', 'polished', 'warm'], 3, ['bag']),
      L('Show day', 'Sainte Aura, front row', 'Wear bows, pearls and bouclé together in one outfit that still looks balanced. Bring a bag.', 3, ['coquette', 'classic', 'polished'], 2, ['bag']),
    ],
  },
  {
    id: 'c3', number: '03', title: 'Night Shift', theme: 'After dark', line: 'Maison Solène dresses the city after dark, in tuxedos, sheer blouses and fur. The dress codes are stricter here.', accent: '#5A1C28', sets: ['le_smoking', 'after_dark', 'mob_brunch', 'sphinx_midnight', 'palazzo_after_dark'],
    swatches: ['satin', 'velvet', 'fur', 'gold'], basePass: 72, step: 2, unlock: 'c2',
    levels: [
      L('First date, wine bar', 'Natural wine, low light', 'A first date in a dimly lit wine bar. Go sleek and a little romantic, in mostly dark colours, with a small bag.', 3, ['sleek', 'romantic', 'dark'], 2, ['bag']),
      L('The tuxedo dinner', 'Maison Solène, private dinner', 'Wear a tuxedo cut for a woman. Keep it tailored, sharp and sleek, ideally in black. Bring a bag.', 4, ['tailored', 'sharp', 'sleek'], 2, ['bag']),
      L('Fashion week', 'HALFTONE, standing section', 'Photographers will be taking pictures of your outfit. Choose one bold, modern idea and keep it sharp. Bring a bag.', 3, ['bold', 'modern', 'sharp'], 3, ['bag']),
      L('After-party, 2am', 'Someone’s kitchen', 'A late party in someone’s kitchen. Wear edgy layers and look relaxed, as if you didn’t plan the outfit.', 2, ['undone', 'edgy', 'nocturnal'], 2),
      L('Brunch in fur', 'Maison Solène, Sunday 1pm', 'Brunch with fur, gold and sunglasses indoors. Stick to one animal print, one metal and one standout piece. Bring a bag.', 3, ['mob', 'bold', 'warm'], 4, ['bag']),
      L('The sheer blouse', 'A gallery dinner', 'Wear something sheer and wear it confidently. Keep the rest sleek and dark. Bring a bag.', 4, ['siren', 'sleek', 'dark'], 2, ['bag'], { mustTexture: 'sheer' }),
      L('Black-tie gala', 'A gala with a seating plan', 'Black tie is the strictest dress code there is, so you need a full-length gown. Make it glamorous, sleek and classic. Bring a bag.', 6, ['glamorous', 'sleek', 'classic'], 2, ['bag'], { tolerance: 0 }),
      L('Hotel bar, closing time', 'The hotel bar', 'It’s the end of a long, glamorous night. Stay glamorous, but look relaxed and a little undone.', 4, ['glamorous', 'undone', 'nocturnal'], 2),
    ],
  },
  {
    id: 'c4', number: '04', title: 'New Silhouette', theme: 'The garden house', line: 'Vesper is the garden house, known for small waists, full skirts, gloves and hats.', accent: '#9DB4CF', sets: ['new_look', 'garden_toile', 'ballet_class', 'horse_girl_noir', 'debutante'],
    swatches: ['wool', 'cotton', 'lace', 'pearl'], basePass: 76, step: 2, unlock: 'c3',
    levels: [
      L('Garden party', 'A lawn and a string quartet', 'A garden party on a sunny lawn. Look pretty, polished and fresh. A full skirt would be perfect. Bring a bag.', 3, ['pretty', 'polished', 'fresh'], 1, ['bag']),
      L('The fitting room', 'Vesper', 'Try the house shape: a small, fitted waist and a full skirt. Keep it classic, sharp and feminine. Bring a bag.', 4, ['classic', 'sharp', 'feminine'], 3, ['bag']),
      L('One print only', 'HALFTONE, print story', 'Wear one print in one colour and keep everything else plain. The look should be classic and pretty.', 3, ['classic', 'pretty', 'minimal'], 2),
      L('Ballet class', 'A studio with a barre', 'Dress like a dancer at rehearsal, in soft, pretty pieces such as wrap knits and tulle.', 2, ['ballet', 'soft', 'pretty'], 2),
      L('Outdoor wedding', 'A vineyard, 30 degrees', 'You’re a wedding guest on a very hot day. Look pretty, polished and fresh, and don’t wear white or cream. Bring a bag.', 4, ['pretty', 'polished', 'fresh'], 1, ['bag'], { forbid: { colors: [C.white, C.bone] } }),
      L('Matinee, hat and gloves', 'A theatre matinee', 'An afternoon at the theatre. Look polished and classic, with a hat or hair piece and a pair of gloves. Bring a bag.', 4, ['polished', 'classic', 'soft'], 3, ['bag', 'gloves']),
      L('Rain in the rose garden', 'The park, with an umbrella', 'A walk through the rose garden in the rain. Go romantic and tailored, in cool colours. A coat is required, ideally one with a fitted waist.', 3, ['romantic', 'cool', 'tailored'], 3, ['outer']),
      L('Show day', 'Vesper, the salon', 'Wear everything the house is known for in one outfit: a fitted waist, a full skirt, a hat, gloves and pearls. Bring a bag.', 5, ['classic', 'polished', 'glamorous'], 2, ['bag']),
    ],
  },
  {
    id: 'c5', number: '05', title: 'Chrome Season', theme: 'The future', line: 'KŌRI designs for the future, with liquid metal, technical fabrics and clean lines.', accent: '#A9ACB2', sets: ['chrome_season', 'shell_system', 'cyber_ballet', 'office_2030'],
    swatches: ['metal', 'nylon', 'latex'], basePass: 80, step: 1, unlock: 'c4',
    levels: [
      L('Office, 2030', 'Vesper × KŌRI shoot', 'Imagine office clothes from the year 2030. Start with something like a pencil skirt and make it futuristic and sharp. Bring a bag.', 3, ['siren', 'futuristic', 'sharp'], 2, ['bag']),
      L('Gallery in the rain', 'A private view', 'Wear a technical raincoat and style it so it’s polished enough for an art gallery. A coat is required.', 1, ['gorp', 'polished', 'minimal'], 4, ['outer']),
      L('Dance fundraiser', 'A dance company', 'Mix ballet tulle with futuristic metal. They work together if the colours stay calm and soft.', 2, ['ballet', 'futuristic', 'soft'], 2),
      L('Sunglasses shoot', 'KŌRI, daylight', 'The sunglasses are the star of this shoot. Build a futuristic, modern outfit in cool colours around them. Sunglasses are required.', 2, ['futuristic', 'modern', 'cool'], 2, ['eyes']),
      L('Chrome launch', 'A launch in a car park', 'Wear one chrome piece and keep everything else matte. The look should be futuristic, bold and simple. Something metallic is required.', 3, ['futuristic', 'bold', 'minimal'], 2, [], { mustTexture: 'metal' }),
      L('Technical after-party', 'KŌRI, after-party', 'Wear technical outdoor pieces for a night out, in dark, sleek fabrics. Bring a bag.', 2, ['gorp', 'nocturnal', 'sleek'], 3, ['bag']),
      L('Y2K cover shoot', 'HALFTONE, cover try', 'Y2K fashion brought into the future. Make it playful, and use three colours at most.', 2, ['y2k', 'futuristic', 'playful'], 1),
      L('Chrome campaign', 'KŌRI campaign, final look', 'Make one chrome piece the star and keep everything else simple. The look should be bold, with no prints.', 3, ['chrome', 'bold', 'minimal'], 2, [], { forbid: { prints: true } }),
    ],
  },
  {
    id: 'c6', number: '06', title: 'Riviera', theme: 'The coast', line: 'Wild Heart is on the coast, where everyone wears linen, gingham and gold hoops in the sun.', accent: '#F2E27A', sets: ['riviera', 'coastal_tomato', 'sunday_boho', 'provencal_sunday', 'alpine_prairie'],
    swatches: ['cotton', 'canvas', 'gold'], basePass: 80, step: 1, unlock: 'c5',
    levels: [
      L('Market morning', 'A port town, 9am', 'A morning at the market by the port. Look fresh, easy and pretty, and bring a bag for the lemons.', 1, ['fresh', 'easy', 'pretty'], 1, ['bag']),
      L('Trattoria lunch', 'A terrace in the sun', 'Lunch on a sunny terrace. Wear something red, perhaps gingham, with gold hoops. Keep it pretty and playful.', 2, ['pretty', 'warm', 'playful'], 1),
      L('Boat day', 'A friend’s boat', 'A day out on a boat. Dress sporty but chic in clean, simple pieces. Flat shoes only.', 1, ['clean', 'fresh', 'minimal'], 1, [], { forbid: { heels: true } }),
      L('Flea market', 'A Sunday flea market', 'A boho day at the flea market. Try a prairie dress, western boots and a flower in your hair.', 2, ['boho', 'soft', 'romantic'], 2),
      L('Rooftop cocktails', 'Sunset, and windy', 'Cocktails on a windy rooftop at sunset. Go glamorous and fresh with one standout piece, and choose things that won’t blow around. Bring a bag.', 4, ['glamorous', 'fresh', 'bold'], 1, ['bag']),
      L('Beach bar', 'A beach bar', 'The theme is coastal cowgirl. Wear western boots with a sundress and keep it playful.', 2, ['boho', 'playful', 'warm'], 1),
      L('Dinner by the water', 'White tablecloths, sea air', 'A romantic dinner by the sea. Look polished and fresh, with heeled sandals. Bring a bag.', 4, ['polished', 'romantic', 'fresh'], 1, ['bag']),
      L('Golden hour swim', 'The last swim of the day', 'One last swim in the golden evening light. Wear something soft and simple, and nothing heavier than linen.', 1, ['soft', 'fresh', 'minimal'], 1, [], { maxWeight: 2 }),
    ],
  },
  {
    id: 'c7', number: '07', title: 'Gothic Romance', theme: 'The dark house', line: 'OXIDE is the dark, romantic house of black lace, pearls, veils and combat boots.', accent: '#4E2A4F', sets: ['gothic_romance', 'rose_thorn', 'fairy_grunge', 'fireflies_rome', 'heartbeat'],
    swatches: ['lace', 'velvet', 'sheer', 'pearl'], basePass: 80, step: 1, unlock: 'c6',
    levels: [
      L('Candlelit bar', 'A candlelit bar', 'A bar lit only by candles. Go romantic and dark with a little edge. Lace or velvet with heavy boots would be perfect.', 3, ['romantic', 'dark', 'edgy'], 2),
      L('Forest rave', 'A rave in the woods', 'The look is fairy grunge. Layer mesh under lace under a jacket, and keep it soft and a little messy.', 1, ['fairy', 'undone', 'soft'], 2),
      L('Band after-party', 'A band’s after-party', 'Wear cherry velvet with a corset belt. The look should be edgy, romantic and bold. A belt is required.', 3, ['edgy', 'romantic', 'bold'], 2, ['belt']),
      L('Masquerade', 'A masked ball', 'A masked ball. Go glamorous, dark and romantic. A veil or hair piece is required.', 5, ['glamorous', 'dark', 'romantic'], 2, ['hairAcc']),
      L('Gothic photoshoot', 'HALFTONE, gothic story', 'Wear pearls with combat boots, so that one dressy piece meets one tough piece. Keep the colours dark.', 3, ['edgy', 'classic', 'dark'], 3),
      L('A chic funeral', 'A very chic funeral', 'Dress respectfully in all black, and mix different textures so it doesn’t look flat. Keep it polished and soft. Bring a bag.', 4, ['dark', 'polished', 'soft'], 3, ['bag']),
      L('Choir recital', 'A cathedral', 'A quiet evening recital in a cathedral. Go romantic and classic, with one special piece and nothing else loud.', 4, ['romantic', 'classic', 'minimal'], 3),
      L('Show day', 'OXIDE, a crypt', 'Wear everything the house is known for in one outfit: lace, a veil, boots and pearls. Bring a bag.', 4, ['gothic', 'romantic', 'bold'], 2, ['bag']),
    ],
  },
  {
    id: 'c8', number: '08', title: 'Haute Street', theme: 'The street house', line: 'Archive 0 is the street-style house of micro minis, tiny cardigans, huge blazers and trainers worn with gowns.', accent: '#E54B86', sets: ['haute_street', 'oversize_city', 'docent_uniform', 'labour_of_love'],
    swatches: ['denim', 'nylon', 'knit', 'leather'], basePass: 84, step: 1, unlock: 'c7',
    levels: [
      L('Campus day', 'A college campus', 'Wear a tiny cardigan with a micro mini skirt. The look is Y2K, pretty and playful.', 2, ['y2k', 'pretty', 'playful'], 2),
      L('Creative office, Friday', 'A creative office', 'Wear oversized pieces, then add one sharp detail such as pointed shoes. Keep it modern and relaxed. Bring a bag.', 3, ['modern', 'relaxed', 'sharp'], 3, ['bag']),
      L('Awards after-party', 'An awards show, after', 'Wear trainers with a gown. The look should be glamorous, comfortable and bold.', 4, ['glamorous', 'easy', 'bold'], 2),
      L('Warehouse gig', 'A warehouse show', 'The look is indie sleaze: a band tee, leather and smudged eyeliner. Keep it edgy and a little messy.', 1, ['sleaze', 'edgy', 'undone'], 2),
      L('Pilates, then errands', 'A Tuesday', 'The clean-girl look: a slicked-back bun, gold hoops and nothing loud. Keep it simple and fresh.', 1, ['clean', 'minimal', 'fresh'], 2),
      L('Cup final', 'Halo Sport, the cup', 'Wear a football jersey with a pleated skirt, and add something sharp so it looks styled.', 1, ['sporty', 'playful', 'sharp'], 2),
      L('Street-style shoot', 'HALFTONE, street-style story', 'Dress for the street-style photographers. Go bold, modern and playful, with exactly three accessories. Bring a bag.', 3, ['bold', 'modern', 'playful'], 3, ['bag'], { exactAccessories: 3 }),
      L('Show day', 'The street outside the show', 'Put the whole chapter into one outfit: a micro mini, an oversized layer, sharp shoes and one bag.', 3, ['modern', 'playful', 'sharp'], 2, ['bag']),
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
// Also: a level whose first mood word names a style (dark academia, Y2K) must be winnable with the free wardrobe,
// so the levels just before it drop pieces in that style, and gloves arrive before the level that requires them.
const DROP_OVERRIDES = { 'c2-1': 't_polo', 'c2-2': 'b_kilt', 'c4-5': 'gl_leather', 'c5-2': 'd_tulle_wrap', 'c5-4': 't_bandeau_chrome', 'c5-7': 'b_chrome_pleat', 'c5-5': 't_baby_tee', 'c5-6': 'b_baggy', 'c3-3': 'set.after_dark.gown', 'c3-5': 'set.after_dark.strappy', 'c3-6': 'set.after_dark.clutch', 'c3-1': 'set.le_smoking.smokingjacket', 'c7-1': 'set.fairy_grunge.mesh', 'c7-2': 'set.fairy_grunge.combat', 'c5-1': 'set.shell_system.parka', 'c6-3': 'set.sunday_boho.prairie', 'c8-3': 'set.haute_street.microskirt' };
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
      title: `${ch.title}: the secret brief`, client: ch.pim ? 'Pim' : 'A secret brief, just for you', copy: `${ch.pim ? 'This secret brief sums up Pim’s whole chapter, and it has the highest pass mark.' : 'This secret brief sums up the whole chapter, and it has the highest pass mark.'} ${last.copy}`, pim: !!ch.pim,
      formality: last.formality, mood: [...(ch.aes || []).filter(Boolean), ...(last.mood || [])].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3), weather: last.weather, required: last.required || [],
      id: sid, chapter: ch.id, index: ch.levels.length + 1, secret: true, pass: Math.min(97, ch.basePass + ch.step * (ch.levels.length - 1) + 12), easyPass: 0, hardPass: 0,
      credits: 400 + Math.min(CHAPTERS.indexOf(ch), 30) * 40, item: secretSet?.pieceIds?.[0] || null, drops: secretSet?.pieceIds || [], exclusive: secretSet?.id || null,
      swatches: ch.swatches, fabric: ch.swatches[0], tolerance: last.tolerance ?? 1, occasion: last.title, formalityWord: FORMAL[last.formality],
    };
    ch.secret = sid;
  }
  return { levels, order };
}
