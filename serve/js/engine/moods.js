// Mood words a brief can ask for, each a testable predicate over the look context.
// ctx: { items, garments, aes (shares), lead, pal, shares, has(slot), textures, avgFormality, avgWeight, heroes, sharpCount, avgL }

const share = (ctx, k) => ctx.aes[k] || 0;
const anyTexture = (ctx, ...t) => ctx.garments.some((g) => t.includes(g.texture));

export const MOODS = {
  quiet: { test: (c) => c.pal.chromaW < 0.35 && c.heroes <= 1, hint: 'softer colours and no loud pieces' },
  polished: { test: (c) => c.sharpCount >= 2 || c.avgFormality >= 3, hint: 'adding something sharp, such as pointed shoes, a belt or tailoring' },
  warm: { test: (c) => c.pal.warmW >= c.pal.coolW && (c.pal.warmW > 0.15 || c.pal.neutrals.some((n) => n.nc === 'earth')), hint: 'warm colours such as camel, cherry, chocolate or gold' },
  cool: { test: (c) => c.pal.coolW > c.pal.warmW || c.pal.neutrals.some((n) => n.nc === 'denim' || n.nc === 'navy') || c.avgL > 0.9, hint: 'cool colours such as ice blue, silver, denim or lilac' },
  edgy: { test: (c) => anyTexture(c, 'leather', 'latex', 'metal', 'sheer') || share(c, 'sleaze') + share(c, 'fairy') + share(c, 'mob') > 0.3, hint: 'leather, mesh or metal' },
  feminine: { test: (c) => c.has('dress') || c.garments.some((g) => g.slot === 'bottom' && g.render?.kind === 'skirt') || share(c, 'coquette') + share(c, 'ballet') > 0.25, hint: 'a skirt, a dress or a ribbon' },
  easy: { test: (c) => c.avgFormality <= 2.2 && !c.garments.some((g) => g.heel === 2), hint: 'flat shoes and more casual pieces' },
  sleek: { test: (c) => c.garments.filter((g) => g.volume === -1).length >= 1 && (c.sharpCount >= 1 || c.garments.some((g) => g.shine >= 1)), hint: 'something fitted with something that shines' },
  glamorous: { test: (c) => c.garments.some((g) => g.shine >= 1) && c.heroes >= 1, hint: 'one shiny standout piece' },
  fresh: { test: (c) => c.avgL > 0.72, hint: 'lighter colours such as white, cream, butter yellow or ice blue' },
  relaxed: { test: (c) => c.avgFormality <= 2 && c.garments.some((g) => g.volume >= 0), hint: 'a looser fit and more casual pieces' },
  pretty: { test: (c) => share(c, 'coquette') + share(c, 'ballet') + share(c, 'boho') > 0.2 || c.garments.some((g) => g.print === 'floral'), hint: 'florals, pink, lace or a bow' },
  modern: { test: (c) => share(c, 'chrome') + share(c, 'clean') + share(c, 'quiet') + share(c, 'gorp') > 0.3 && !c.garments.some((g) => g.print === 'floral'), hint: 'clean lines with no florals, and maybe some chrome' },
  sharp: { test: (c) => c.sharpCount >= 2, hint: 'two sharp details, such as pointed shoes, a belt, tailoring or sleek hair' },
  classic: { test: (c) => share(c, 'quiet') + share(c, 'siren') + share(c, 'academia') > 0.3 && c.pal.distinctChromatic <= 1, hint: 'tailoring and neutral colours, with one bright colour at most' },
  playful: { test: (c) => c.garments.some((g) => g.print) || c.pal.distinctChromatic >= 2 || share(c, 'y2k') + share(c, 'blokette') > 0.2, hint: 'a print or a second colour' },
  dark: { test: (c) => c.avgL < 0.42, hint: 'mostly black, navy, chocolate or burgundy' },
  soft: { test: (c) => c.garments.some((g) => ['knit', 'fur', 'sheer', 'lace', 'satin'].includes(g.texture)) && !c.pal.chroma.some((x) => x.C > 0.14 && x.w >= 1), hint: 'knits, tulle or satin, with no neon colours' },
  futuristic: { test: (c) => share(c, 'chrome') > 0.18 || c.garments.some((g) => g.texture === 'metal'), hint: 'chrome, liquid metal or shield sunglasses' },
  sporty: { test: (c) => share(c, 'blokette') + share(c, 'gorp') > 0.25 || c.garments.some((g) => g.toe === 'chunky' || g.texture === 'nylon'), hint: 'trainers, a jersey or nylon' },
  romantic: { test: (c) => (anyTexture(c, 'lace', 'sheer', 'satin', 'velvet') || c.garments.some((g) => g.print === 'floral')) && share(c, 'coquette') + share(c, 'ballet') + share(c, 'boho') > 0.12, hint: 'lace, satin, velvet or florals in a soft style' },
  bold: { test: (c) => c.heroes >= 1 || c.items.reduce((s, i) => s + (i.statement || 0), 0) >= 2 || c.pal.chroma.some((x) => x.C > 0.12 && x.w >= 0.7), hint: 'one standout piece, two interesting pieces or one bright colour' },
  cozy: { test: (c) => c.avgWeight >= 3 && anyTexture(c, 'knit', 'fur', 'wool'), hint: 'knit, wool or shearling' },
  nocturnal: { test: (c) => c.avgL < 0.5 && c.garments.some((g) => g.shine >= 1), hint: 'dark colours with one piece that shines' },
  undone: { test: (c) => c.sharpCount <= 1 && (c.garments.some((g) => g.volume === 1) || anyTexture(c, 'sheer', 'knit')) && share(c, 'sleaze') + share(c, 'fairy') + share(c, 'boho') + share(c, 'y2k') > 0.12, hint: 'something oversized or sheer, with nothing too sharp' },
  tailored: { test: (c) => c.garments.some((g) => g.texture === 'wool' && (g.slot === 'outer' || g.slot === 'bottom')) , hint: 'a wool blazer, coat or trousers' },
  minimal: { test: (c) => c.accessoryCount <= 2 && c.pal.distinctChromatic <= 1 && !c.garments.some((g) => g.print), hint: 'fewer accessories, one colour and no prints' },
  maximal: { test: (c) => c.accessoryCount >= 3 && (c.pal.distinctChromatic >= 2 || c.garments.filter((g) => g.print).length >= 1), hint: 'a print, another colour and three accessories' },
  gothic: { test: (c) => c.avgL < 0.45 && anyTexture(c, 'lace', 'velvet', 'sheer', 'leather'), hint: 'black lace, velvet or leather in dark colours' },
  // aesthetic names as moods
  coquette: { test: (c) => c.lead === 'coquette' || share(c, 'coquette') >= 0.35, hint: 'bows, lace, pink or ballet flats' },
  ballet: { test: (c) => c.lead === 'ballet' || share(c, 'ballet') >= 0.35, hint: 'tulle, leg warmers or wrap knits' },
  siren: { test: (c) => c.lead === 'siren' || share(c, 'siren') >= 0.35, hint: 'a pencil skirt, thin glasses, a slip dress or pumps' },
  quietlux: { test: (c) => (c.lead === 'quiet' || share(c, 'quiet') >= 0.35) && c.pal.chromaW < 0.3, hint: 'camel, cream or black tailoring with no logos' },
  y2k: { test: (c) => c.lead === 'y2k' || share(c, 'y2k') >= 0.35, hint: 'low-rise jeans, a baby tee or tiny sunglasses' },
  sleaze: { test: (c) => c.lead === 'sleaze' || share(c, 'sleaze') >= 0.35, hint: 'a band tee, leather or fishnets' },
  fairy: { test: (c) => c.lead === 'fairy' || share(c, 'fairy') >= 0.35, hint: 'mesh, lace, combat boots or mossy colours' },
  academia: { test: (c) => c.lead === 'academia' || share(c, 'academia') >= 0.35, hint: 'a knit polo, a kilt, loafers or a beret' },
  gorp: { test: (c) => c.lead === 'gorp' || share(c, 'gorp') >= 0.35, hint: 'a shell jacket, cargo trousers or chunky trainers' },
  clean: { test: (c) => c.lead === 'clean' || share(c, 'clean') >= 0.35, hint: 'a white tank top, a slicked-back bun or gold hoops' },
  mob: { test: (c) => c.lead === 'mob' || share(c, 'mob') >= 0.35, hint: 'fur, leopard print, gold or cat-eye sunglasses' },
  chrome: { test: (c) => c.lead === 'chrome' || share(c, 'chrome') >= 0.35, hint: 'liquid metal, shield sunglasses or chrome details' },
  blokette: { test: (c) => c.lead === 'blokette' || share(c, 'blokette') >= 0.35, hint: 'a jersey, a tennis skirt or football trainers' },
  boho: { test: (c) => c.lead === 'boho' || share(c, 'boho') >= 0.35, hint: 'a tiered skirt, western boots or layered gold jewellery' },
};
// What the player reads on chips and in notes. Most mood words are plain English already; these are the style names.
const LABELS = { quietlux: 'quiet luxury', y2k: 'Y2K', sleaze: 'indie sleaze', fairy: 'fairy grunge', academia: 'dark academia', gorp: 'gorpcore', clean: 'clean girl', mob: 'mob wife', siren: 'office siren', undone: 'undone', nocturnal: 'night-time' };
export const MOOD_LABEL = (k) => LABELS[k] || k;
