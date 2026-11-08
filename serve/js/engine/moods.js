// Mood words a brief can ask for, each a testable predicate over the look context.
// ctx: { items, garments, aes (shares), lead, pal, shares, has(slot), textures, avgFormality, avgWeight, heroes, sharpCount, avgL }

const share = (ctx, k) => ctx.aes[k] || 0;
const anyTexture = (ctx, ...t) => ctx.garments.some((g) => t.includes(g.texture));

export const MOODS = {
  quiet: { test: (c) => c.pal.chromaW < 0.35 && c.heroes <= 1, hint: 'keep colour to a whisper and skip the loud piece' },
  polished: { test: (c) => c.sharpCount >= 2 || c.avgFormality >= 3, hint: 'add something sharp: a pointed shoe, a belt, tailoring' },
  warm: { test: (c) => c.pal.warmW >= c.pal.coolW && (c.pal.warmW > 0.15 || c.pal.neutrals.some((n) => n.nc === 'earth')), hint: 'lean into camel, cherry, chocolate, gold' },
  cool: { test: (c) => c.pal.coolW > c.pal.warmW || c.pal.neutrals.some((n) => n.nc === 'denim' || n.nc === 'navy') || c.avgL > 0.9, hint: 'bring in ice, chrome, denim or lilac' },
  edgy: { test: (c) => anyTexture(c, 'leather', 'latex', 'metal', 'sheer') || share(c, 'sleaze') + share(c, 'fairy') + share(c, 'mob') > 0.3, hint: 'leather, mesh or metal would do it' },
  feminine: { test: (c) => c.has('dress') || c.garments.some((g) => g.slot === 'bottom' && g.render?.kind === 'skirt') || share(c, 'coquette') + share(c, 'ballet') > 0.25, hint: 'a skirt, a dress, a ribbon' },
  easy: { test: (c) => c.avgFormality <= 2.2 && !c.garments.some((g) => g.heel === 2), hint: 'lose the heel and drop the formality' },
  sleek: { test: (c) => c.garments.filter((g) => g.volume === -1).length >= 1 && (c.sharpCount >= 1 || c.garments.some((g) => g.shine >= 1)), hint: 'something fitted and something that catches light' },
  glamorous: { test: (c) => c.garments.some((g) => g.shine >= 1) && c.heroes >= 1, hint: 'one shining hero piece' },
  fresh: { test: (c) => c.avgL > 0.72, hint: 'lighter colours: white, bone, butter, ice' },
  relaxed: { test: (c) => c.avgFormality <= 2 && c.garments.some((g) => g.volume >= 0), hint: 'give the fit some ease' },
  pretty: { test: (c) => share(c, 'coquette') + share(c, 'ballet') + share(c, 'boho') > 0.2 || c.garments.some((g) => g.print === 'floral'), hint: 'florals, pink, lace or a bow' },
  modern: { test: (c) => share(c, 'chrome') + share(c, 'clean') + share(c, 'quiet') + share(c, 'gorp') > 0.3 && !c.garments.some((g) => g.print === 'floral'), hint: 'clean lines, no florals, maybe chrome' },
  sharp: { test: (c) => c.sharpCount >= 2, hint: 'two sharp elements: a point, a belt, tailoring, slicked hair' },
  classic: { test: (c) => share(c, 'quiet') + share(c, 'siren') + share(c, 'academia') > 0.3 && c.pal.distinctChromatic <= 1, hint: 'tailoring, neutrals, one colour at most' },
  playful: { test: (c) => c.garments.some((g) => g.print) || c.pal.distinctChromatic >= 2 || share(c, 'y2k') + share(c, 'blokette') > 0.2, hint: 'a print or a second colour' },
  dark: { test: (c) => c.avgL < 0.42, hint: 'mostly black, ink, chocolate, burgundy' },
  soft: { test: (c) => c.garments.some((g) => ['knit', 'fur', 'sheer', 'lace', 'satin'].includes(g.texture)) && !c.pal.chroma.some((x) => x.C > 0.14 && x.w >= 1), hint: 'knits, tulle, satin; nothing neon' },
  futuristic: { test: (c) => share(c, 'chrome') > 0.18 || c.garments.some((g) => g.texture === 'metal'), hint: 'chrome, liquid metal, shields' },
  sporty: { test: (c) => share(c, 'blokette') + share(c, 'gorp') > 0.25 || c.garments.some((g) => g.toe === 'chunky' || g.texture === 'nylon'), hint: 'a trainer, a jersey, nylon' },
  romantic: { test: (c) => (anyTexture(c, 'lace', 'sheer', 'satin', 'velvet') || c.garments.some((g) => g.print === 'floral')) && share(c, 'coquette') + share(c, 'ballet') + share(c, 'boho') > 0.12, hint: 'lace, tulle, satin, florals, ribbons' },
  bold: { test: (c) => c.heroes >= 1 || c.items.reduce((s, i) => s + (i.statement || 0), 0) >= 2 || c.pal.chroma.some((x) => x.C > 0.12 && x.w >= 0.7), hint: 'one hero piece, two interesting ones, or one loud colour' },
  cozy: { test: (c) => c.avgWeight >= 3 && anyTexture(c, 'knit', 'fur', 'wool'), hint: 'knit, wool or shearling' },
  nocturnal: { test: (c) => c.avgL < 0.5 && c.garments.some((g) => g.shine >= 1), hint: 'dark with one surface that shines' },
  undone: { test: (c) => c.sharpCount <= 1 && (c.garments.some((g) => g.volume === 1) || anyTexture(c, 'sheer', 'knit')) && share(c, 'sleaze') + share(c, 'fairy') + share(c, 'boho') + share(c, 'y2k') > 0.12, hint: 'something oversized or sheer, nothing too sharp' },
  tailored: { test: (c) => c.garments.some((g) => g.texture === 'wool' && (g.slot === 'outer' || g.slot === 'bottom')) , hint: 'a blazer or a trouser with a crease' },
  minimal: { test: (c) => c.accessoryCount <= 2 && c.pal.distinctChromatic <= 1 && !c.garments.some((g) => g.print), hint: 'fewer accessories, one colour, no print' },
  maximal: { test: (c) => c.accessoryCount >= 3 && (c.pal.distinctChromatic >= 2 || c.garments.filter((g) => g.print).length >= 1), hint: 'more: a print, a colour, three accessories' },
  // aesthetic names as moods
  coquette: { test: (c) => c.lead === 'coquette' || share(c, 'coquette') >= 0.35, hint: 'bows, lace, pink, ballet flats' },
  ballet: { test: (c) => c.lead === 'ballet' || share(c, 'ballet') >= 0.35, hint: 'tulle, leg warmers, wrap knits' },
  siren: { test: (c) => c.lead === 'siren' || share(c, 'siren') >= 0.35, hint: 'pencil skirt, thin glasses, slip, pump' },
  quietlux: { test: (c) => (c.lead === 'quiet' || share(c, 'quiet') >= 0.35) && c.pal.chromaW < 0.3, hint: 'camel, bone, ink, tailoring, no logos' },
  y2k: { test: (c) => c.lead === 'y2k' || share(c, 'y2k') >= 0.35, hint: 'low rise, baby tee, tiny sunglasses' },
  sleaze: { test: (c) => c.lead === 'sleaze' || share(c, 'sleaze') >= 0.35, hint: 'band tee, leather, fishnet, smudged' },
  fairy: { test: (c) => c.lead === 'fairy' || share(c, 'fairy') >= 0.35, hint: 'mesh, lace, combat boots, moss tones' },
  academia: { test: (c) => c.lead === 'academia' || share(c, 'academia') >= 0.35, hint: 'knit polo, kilt, loafers, beret' },
  gorp: { test: (c) => c.lead === 'gorp' || share(c, 'gorp') >= 0.35, hint: 'shell, cargo, chunky trainer' },
  clean: { test: (c) => c.lead === 'clean' || share(c, 'clean') >= 0.35, hint: 'white tank, slicked bun, gold hoops' },
  mob: { test: (c) => c.lead === 'mob' || share(c, 'mob') >= 0.35, hint: 'fur, leopard, gold, cat-eye' },
  chrome: { test: (c) => c.lead === 'chrome' || share(c, 'chrome') >= 0.35, hint: 'liquid metal, shields, chrome hardware' },
  blokette: { test: (c) => c.lead === 'blokette' || share(c, 'blokette') >= 0.35, hint: 'jersey, tennis skirt, football trainer' },
  boho: { test: (c) => c.lead === 'boho' || share(c, 'boho') >= 0.35, hint: 'tiered skirt, western boot, layered gold' },
};
export const MOOD_LABEL = (k) => k;
