// Castings: the briefs a stylist is booked for. Formality ladder 0-6
// (0 loungewear/sport, 1 casual, 2 smart casual, 3 polished/creative office, 4 cocktail, 5 formal, 6 black tie).
// weather is a fabric-weight band 1-5 (1 heatwave, 3 autumn, 5 deep winter).
import { C } from './palette.js';

export const SEASONS = [
  {
    id: 's1', number: '01', title: 'Arrival', line: 'You moved to the city with two suitcases and a point of view.', bonusThread: 2,
    briefs: [
      { id: 's1-1', title: 'Coffee run, but make it a look', client: 'Yourself, 8:40am', copy: 'Nobody is watching, which is exactly when a look counts. Keep it easy and light. If it needs explaining, it is wrong.', formality: 1, tolerance: 1, mood: ['easy', 'fresh'], weather: 2, required: [], pass: 60, credits: 150, item: 'hd_claw' },
      { id: 's1-2', title: 'First day at the studio', client: 'HALFTONE magazine, design floor', copy: 'A creative office: nobody wears a suit, everybody notices shoes. Modern and relaxed, with one thing that says you take it seriously. Bring a bag; you will be given things to carry.', formality: 2, tolerance: 1, mood: ['modern', 'relaxed', 'polished'], weather: 3, required: ['bag'], pass: 64, credits: 180, item: 'er_studs' },
      { id: 's1-3', title: 'Gallery opening, Thursday, 7pm', client: 'A friend of a friend who paints', copy: 'Warm wine in plastic cups, cold concrete, good light. Quiet clothes photograph better next to art. Polished, warm in tone, nothing that competes with the work.', formality: 3, tolerance: 1, mood: ['quiet', 'polished', 'warm'], weather: 3, required: ['bag'], pass: 68, credits: 220, item: 't_cami' },
      { id: 's1-4', title: 'Dive bar, her birthday', client: 'Sticky floor, good jukebox', copy: 'She said "do not dress up" and meant "dress up a little". Edgy but feminine, and easy enough to dance in. A heel you can run for a bus in, or no heel.', formality: 2, tolerance: 1, mood: ['edgy', 'feminine', 'easy'], weather: 2, required: [], pass: 68, credits: 220, item: 'h_fishnet' },
      { id: 's1-5', title: 'Sunday picnic, someone brought a film camera', client: 'The park, 2pm', copy: 'Soft light, grass stains, 36 exposures. Pretty without trying, soft in texture. Think ribbons, not logos.', formality: 2, tolerance: 1, mood: ['pretty', 'soft', 'coquette'], weather: 1, required: [], pass: 70, credits: 240, item: 'hd_bow' },
      { id: 's1-6', title: 'Rain. Still going out.', client: 'A rainy afternoon in a Chloé mood', copy: 'Weather is not an excuse, it is a brief. Something tailored over something cool-toned, polished enough for the restaurant after. Outerwear is not optional.', formality: 2, tolerance: 1, mood: ['tailored', 'cool', 'polished'], weather: 3, required: ['outer'], pass: 70, credits: 240, item: 'hd_scarf' },
      { id: 's1-7', title: 'A match, then the pub', client: 'Halo Sport, Saturday 3pm', copy: 'Blokette season. Sporty and playful, easy to stand in for four hours. Nothing satin, nothing that sparkles; the glamour is in the sock.', formality: 1, tolerance: 1, mood: ['sporty', 'playful', 'easy'], weather: 2, required: [], forbid: { textures: ['satin', 'sequin', 'velvet'] }, pass: 72, credits: 260, item: 't_jersey' },
      { id: 's1-8', title: 'Dinner with the parents of someone you like', client: 'A restaurant with tablecloths', copy: 'Classic, polished, soft around the edges. They should remember you were kind, not what you wore. One good bag; no leather trousers; no fishnets, obviously.', formality: 3, tolerance: 1, mood: ['classic', 'polished', 'soft'], weather: 3, required: ['bag'], forbid: { items: ['h_fishnet', 'b_leather_pant', 'b_leather_mini', 't_mesh'] }, pass: 74, credits: 300, item: 'd_lbd' },
    ],
  },
  {
    id: 's2', number: '02', title: 'Night Shift', line: 'The city after dark pays better and judges harder.', bonusThread: 3, unlock: 's1',
    briefs: [
      { id: 's2-1', title: 'Wine bar, first date', client: 'Natural wine, low light', copy: 'Sleek and a little romantic, mostly dark. Something that catches candlelight once, not every time you move. Bag small enough to forget.', formality: 3, tolerance: 1, mood: ['sleek', 'romantic', 'dark'], weather: 2, required: ['bag'], pass: 74, credits: 300, item: 'b_leather_mini' },
      { id: 's2-2', title: 'Fashion week, standing section', client: 'HALFTONE, front-row-adjacent', copy: 'You will be photographed from the knees up by people who do not know your name. Bold, modern, sharp. One idea, executed completely.', formality: 3, tolerance: 1, mood: ['bold', 'modern', 'sharp'], weather: 3, required: ['bag'], pass: 76, credits: 320, item: 'ey_cateye' },
      { id: 's2-3', title: 'Afters. 2am. Someone’s kitchen.', client: 'An address you were texted', copy: 'Undone on purpose. Edgy, nocturnal, layered like you came from somewhere better. The best outfit here looks like it was not planned, and was.', formality: 2, tolerance: 1, mood: ['undone', 'edgy', 'nocturnal'], weather: 2, required: [], pass: 76, credits: 320, item: 't_mesh' },
      { id: 's2-4', title: 'Wedding guest, outdoor, July', client: 'A vineyard, 30 degrees', copy: 'Pretty, polished, fresh. Not white, not bone, not anything the bride could mistake for a challenge. Heels will sink; think about it.', formality: 4, tolerance: 1, mood: ['pretty', 'polished', 'fresh'], weather: 1, required: ['bag'], forbid: { colors: [C.white, C.bone] }, pass: 78, credits: 360, item: 'er_pearl' },
      { id: 's2-5', title: 'Black tie, no notes', client: 'A gala with a seating plan', copy: 'The strictest brief there is. Glamorous, sleek, classic. Do not go under the dress code by even one step; the room will know.', formality: 6, tolerance: 0, mood: ['glamorous', 'sleek', 'classic'], weather: 2, required: ['bag'], pass: 80, credits: 400, item: 'gl_opera' },
      { id: 's2-6', title: 'Mob wife brunch', client: 'Maison Solène, Sunday 1pm', copy: 'Fur, gold, sunglasses indoors. Bold and warm. The trick is that it still has to make sense: one animal, one metal, one hero.', formality: 3, tolerance: 1, mood: ['mob', 'bold', 'warm'], weather: 4, required: ['bag'], pass: 80, credits: 420, item: 'o_leopard' },
    ],
  },
  {
    id: 's3', number: '03', title: 'Chrome', line: 'The future arrived and it is reflective.', bonusThread: 4, unlock: 's2',
    briefs: [
      { id: 's3-1', title: 'Office siren, but 2030', client: 'Vesper x KŌRI collaboration shoot', copy: 'Pencil skirt energy run through a mirror. Siren, futuristic, sharp. Glasses are a weapon.', formality: 3, tolerance: 1, mood: ['siren', 'futuristic', 'sharp'], weather: 2, required: ['bag'], pass: 82, credits: 450, item: 'ey_shield' },
      { id: 's3-2', title: 'Cyber ballet', client: 'A dance company’s fundraiser', copy: 'Rehearsal softness with something metallic cutting through. Ballet, futuristic, soft. Tulle and chrome can be friends if the palette is calm.', formality: 2, tolerance: 1, mood: ['ballet', 'futuristic', 'soft'], weather: 2, required: [], pass: 84, credits: 480, item: 'h_legwarmer' },
      { id: 's3-3', title: 'Gorp to gallery', client: 'KŌRI, a private view in the rain', copy: 'Technical outerwear that could walk into a white cube. Gorp first, then polish it: slicked hair, a belt, one sharp thing. Fewer things, better things.', formality: 1, tolerance: 1, mood: ['gorp', 'polished', 'minimal'], weather: 4, required: ['outer'], pass: 84, credits: 480, item: 'bg_micro' },
      { id: 's3-4', title: 'Chrome, and nothing else', client: 'KŌRI campaign, final look', copy: 'The hero look: one chrome piece that owns the frame, and a support act that knows it. Bold, minimal, no prints; the surface is the print.', formality: 3, tolerance: 1, mood: ['chrome', 'bold', 'minimal'], weather: 2, required: [], forbid: { prints: true }, pass: 86, credits: 600, item: 't_bandeau_chrome' },
    ],
  },
];

export const DAILY = [
  { id: 'd-0', title: 'Booked for a late lunch', client: 'Daily casting', copy: 'Smart casual, warm palette, a bag you can put on the table.', formality: 2, tolerance: 1, mood: ['warm', 'polished'], weather: 2, required: ['bag'], pass: 70, credits: 200 },
  { id: 'd-1', title: 'Errands as performance', client: 'Daily casting', copy: 'Clean girl, minimal, nothing louder than the hoops.', formality: 1, tolerance: 1, mood: ['clean', 'minimal'], weather: 2, required: [], pass: 70, credits: 200 },
  { id: 'd-2', title: 'Library, then a drink', client: 'Daily casting', copy: 'Dark academia with a sharp edge. Loafers or boots.', formality: 2, tolerance: 1, mood: ['academia', 'sharp'], weather: 3, required: [], pass: 72, credits: 200 },
  { id: 'd-3', title: 'Y2K, but it is 2026', client: 'Daily casting', copy: 'Low rise, tiny sunglasses, playful. Keep it to three colours.', formality: 1, tolerance: 1, mood: ['y2k', 'playful'], weather: 1, required: [], pass: 72, credits: 200 },
  { id: 'd-4', title: 'Festival, day two', client: 'Daily casting', copy: 'Boho 2.0, cozy enough for the night, boots you can lose.', formality: 1, tolerance: 1, mood: ['boho', 'cozy'], weather: 2, required: ['bag'], pass: 72, credits: 200 },
  { id: 'd-5', title: 'Cocktails on a roof', client: 'Daily casting', copy: 'Glamorous, fresh, one hero. Wind exists; plan for it.', formality: 4, tolerance: 1, mood: ['glamorous', 'fresh'], weather: 1, required: ['bag'], pass: 74, credits: 200 },
  { id: 'd-6', title: 'Walk home in the rain', client: 'Daily casting', copy: 'Gorp meets quiet. Cool palette, outerwear, flats.', formality: 1, tolerance: 1, mood: ['gorp', 'cool', 'quietlux'], weather: 4, required: ['outer'], pass: 72, credits: 200 },
];

export function dailyBrief(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const day = Math.floor((date - start) / 86400000);
  const b = DAILY[day % DAILY.length];
  return { ...b, id: `${b.id}-${date.toISOString().slice(0, 10)}`, daily: true, dateKey: date.toISOString().slice(0, 10) };
}

// Twists: added when a player is comfortably above the pass mark. Always shown, never hidden.
export const TWISTS = [
  { id: 'noblack', text: 'No black anywhere', forbid: { colors: [C.ink, C.black] } },
  { id: 'mono', text: 'One hue family only', mood: ['minimal'] },
  { id: 'flats', text: 'Flats only', test: (look) => !look.shoes || look.shoes.heel === 0 },
  { id: 'nodress', text: 'Separates, no dress', forbid: { slots: ['dress'] } },
  { id: 'print', text: 'Exactly one print', test: (look) => Object.values(look).filter((i) => i && i.print).length === 1 },
  { id: 'threeacc', text: 'Exactly three accessories', test: (look) => ['head', 'eyes', 'ears', 'neck', 'belt', 'gloves', 'scarf', 'bag'].filter((s) => look[s]).length === 3 },
];

export const ALL_BRIEFS = Object.fromEntries(SEASONS.flatMap((s) => s.briefs.map((b) => [b.id, { ...b, season: s.id }])));
export const BRIEF_ORDER = SEASONS.flatMap((s) => s.briefs.map((b) => b.id));
