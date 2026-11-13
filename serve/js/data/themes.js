// Five novels, twenty chapters each. Chapters 1–8 are written by hand in chapters.js; the rest are built here from a
// theme (place, house, two aesthetics, fabrics, a world to draw) and a library of occasion briefs. Deterministic.

export const NOVELS = [
  { id: 1, title: 'Arrival', line: 'New city, new you. The year you learn the read.', cover: 'c1' },
  { id: 2, title: 'The Houses', line: 'Ten houses, two visits each. Every door has a dress code.', cover: 'c2' },
  { id: 3, title: 'Season', line: 'A year on the road. Pack for the brief, not the weather.', cover: 'c6' },
  { id: 4, title: 'Backstage', line: 'Castings, fittings, shoots, shows. The week nobody sees.', cover: 'c5' },
  { id: 5, title: 'Dreamhouse', line: 'Pink house, pink car, pink everything. The finale.', cover: 'c8' },
];

// [title, theme, line, world, house, aes1, aes2, swatches, cw, mat, print]
const T = (title, theme, line, world, house, a1, a2, sw, cw, mat, print = null) => ({ title, theme, line, world, house, aes: [a1, a2], swatches: sw, cw, mat, print });

// Pim's chapters: she is the one being dressed. Levels are handwritten; items for her carry pim: true.
const L = (title, client, copy, formality, mood, weather, required = [], extra = {}) => ({ title, client, copy, formality, mood, weather, required, ...extra });
const P = (title, theme, line, world, house, a1, a2, sw, cw, mat, print, levels) => ({ ...T(title, theme, line, world, house, a1, a2, sw, cw, mat, print), pim: true, levels });
const PIM_WEEK = P('Pim’s Week', 'seven days with a four-pound diva', 'She is in the bag. She would like to be seen. Dress her for the week.', 'c4', 'AURA', 'coquette', 'clean', ['cotton', 'satin', 'knit'], 'babyPink', 'satin', null, [
  L('Monday: the coffee run', 'Pim, carried', 'She is in the bag and she wants to be seen. Easy and pretty. A collar is not optional.', 1, ['easy', 'pretty', 'clean'], 2, ['neck']),
  L('Tuesday: the vet, bravely', 'the vet, 10am', 'Soft, clean, quiet. Something she can shiver in with dignity. No bells.', 1, ['soft', 'clean', 'quiet'], 2, ['neck']),
  L('Wednesday: dog park politics', 'the park, the big dogs', 'Sporty and playful. She needs to look like she could run. She will not.', 1, ['sporty', 'playful', 'easy'], 2, []),
  L('Thursday: rain on her ears', 'a wet pavement', 'A raincoat. She has asked for it to be cute. Polished, cool, fresh.', 1, ['polished', 'cool', 'fresh'], 3, ['outer']),
  L('Friday: the café terrace', 'under the table, mostly', 'Pretty, warm, relaxed. The waiters bring her water first. Dress for that.', 2, ['pretty', 'warm', 'relaxed'], 2, ['neck']),
  L('Saturday: she is three', 'her birthday', 'Coquette, soft, a bow somewhere. A tutu would not be too much. Nothing is too much.', 3, ['coquette', 'soft', 'pretty'], 2, ['head']),
  L('Sunday: the groomer’s photo', 'a towel, a hairdryer, a ring light', 'Classic, polished, clean. The photo goes on the wall. The wall is public.', 3, ['classic', 'polished', 'clean'], 2, ['neck', 'head']),
  L('Pim at HALFTONE', 'Ro’s desk', 'Ro says dogs are not allowed. Ro is wrong. Quiet, sharp, a bag she can be carried in with dignity.', 3, ['quietlux', 'sharp', 'polished'], 3, ['bag']),
]);
const PIM_HOUSES = P('Pim at the Houses', 'ten doors, one small dog', 'Every house has a dress code. Pim intends to pass all of them.', 'c2', 'AURA', 'coquette', 'siren', ['tweed', 'satin', 'fur'], 'babyPink', 'tweed', null, [
  L('Sainte Aura: the pearl fitting', 'the pearl room', 'Pearls on a chihuahua. Coquette, classic, quiet. Aurélie is delighted.', 3, ['coquette', 'classic', 'quiet'], 2, ['neck']),
  L('Vesper: even a dog has a waist', 'the fitting room', 'Dido says so. Siren, sharp, polished. One bag.', 3, ['siren', 'sharp', 'polished'], 2, ['bag']),
  L('Maison Solène: fur, obviously', 'the fur room', 'Mob wife, four pounds. One animal, one metal, one hero.', 3, ['mob', 'bold', 'warm'], 4, ['neck']),
  L('Thorne & Co: library card', 'the reading room', 'Academia, sharp, quiet. A beret she tolerates. Carry nothing; she is the book.', 2, ['academia', 'sharp', 'quiet'], 3, ['head']),
  L('KŌRI: the visor', 'the materials lab', 'Chrome, minimal, futuristic. The shield visor was made for ears this size.', 2, ['chrome', 'minimal', 'futuristic'], 2, ['eyes']),
  L('Halo Sport: four socks', 'the running track', 'Sporty, playful, sharp. Socks on four paws. She will not run.', 1, ['sporty', 'playful', 'sharp'], 2, [], { forbid: { textures: ['satin', 'sequin', 'velvet'] } }),
  L('OXIDE: a very small cape', 'the basement', 'Fairy grunge in miniature. Dark, romantic, edgy. A cape counts.', 3, ['fairy', 'dark', 'romantic'], 2, ['outer']),
  L('The Houses Gala: plus one', 'the gala, under the table', 'Black tie for a dog. Glamorous, sleek, classic. Do not go under the dress code, even at knee height.', 6, ['glamorous', 'sleek', 'classic'], 2, ['bag'], { tolerance: 0 }),
]);
const PIM_ABROAD = P('Pim Abroad', 'a year on the road, in a carrier', 'She has a passport photo. It is better than yours.', 'c6', 'WILD', 'boho', 'clean', ['cotton', 'canvas', 'knit'], 'butter', 'cotton', 'gingham', [
  L('Airport, in the carrier', 'gate 42', 'Clean, easy, minimal. Security will ask her to remove the collar. She will not.', 1, ['clean', 'easy', 'minimal'], 2, ['bag']),
  L('Paris: a saucer of water', 'a café terrace', 'Coquette, classic, soft. A beret, if she allows it.', 2, ['coquette', 'classic', 'soft'], 2, ['head']),
  L('Amalfi: the boat', 'a boat she did not choose', 'Fresh, sporty, pretty. Stripes. Nothing she cannot get splashed in.', 1, ['fresh', 'sporty', 'pretty'], 1, [], { forbid: { textures: ['satin', 'sequin', 'velvet', 'fur'] } }),
  L('Alpine: the snow', 'a village at altitude', 'Gorp, polished, soft. A puffer and a beanie. She has never been so insulted, or so warm.', 1, ['gorp', 'polished', 'soft'], 4, ['outer', 'head']),
  L('Tokyo: the convenience store', '2am, fluorescent', 'Futuristic, bold, minimal. Something shiny. The visor stays on.', 2, ['futuristic', 'bold', 'minimal'], 2, ['eyes']),
  L('Marrakesh: the riad', 'tiles, cushions, a fountain', 'Boho, warm, romantic. Velvet or a flower. Not both. Fine, both.', 2, ['boho', 'warm', 'romantic'], 3, ['head']),
  L('New York: the crosswalk', 'walking fast, carried faster', 'Sleek, sharp, dark. She is late for something that does not exist.', 3, ['sleek', 'sharp', 'dark'], 3, ['bag']),
  L('Home again: the doorstep', 'your own door', 'Quiet, clean, polished. The capsule she came back to. One collar, one coat, one bag.', 2, ['quiet', 'clean', 'polished'], 3, ['outer', 'neck']),
]);
const PIM_CAST = P('Pim Gets Cast', 'a dog with an agent', 'A casting director saw her on a terrace. Now she has a day rate.', 'c5', 'KORI', 'chrome', 'coquette', ['satin', 'nylon', 'sequin'], 'hotPink', 'satin', null, [
  L('The casting', 'a white room, forty dogs', 'Clean, sharp, minimal. Memorable in one frame. One accessory; make it count.', 2, ['clean', 'sharp', 'minimal'], 2, [], { exactAccessories: 1 }),
  L('Fitting room 3', 'pins, a tape measure, patience', 'Quiet luxury, polished, sharp. She stands still for forty seconds. Dress for the forty seconds.', 3, ['quietlux', 'polished', 'sharp'], 2, ['neck']),
  L('Hair and makeup (ears)', 'the beauty chair', 'Ballet softness. A bow, something soft at the neck, nothing shiny yet.', 2, ['ballet', 'soft', 'pretty'], 2, ['head']),
  L('The lookbook', 'every piece visible', 'Pretty, quiet, polished. Each piece has to read on a body this size. Fewer, better.', 3, ['pretty', 'quiet', 'polished'], 2, ['neck']),
  L('Street style, knee height', 'the photographers kneel', 'Bold, modern, playful. Exactly two accessories.', 3, ['bold', 'modern', 'playful'], 3, [], { exactAccessories: 2 }),
  L('Front row, on a lap', 'row A, someone’s knees', 'Mob, bold, warm. Fur and sunglasses. She does not take them off.', 3, ['mob', 'bold', 'warm'], 3, ['eyes']),
  L('The chrome editorial', 'a mirrored set', 'Chrome, bold, minimal. One metallic piece owns the frame. No prints.', 3, ['chrome', 'bold', 'minimal'], 2, [], { forbid: { prints: true } }),
  L('The campaign', 'the final frame', 'Glamorous, sleek, bold. The dog is the campaign now. Dress the campaign.', 5, ['glamorous', 'sleek', 'bold'], 2, ['bag']),
]);
const PIM_DREAM = P('Pim’s Dreamhouse', 'the pink house has a dog door', 'Pink bed, pink bowl, a pink convertible she is not allowed to drive.', 'c4', 'AURA', 'coquette', 'y2k', ['satin', 'sequin', 'knit'], 'hotPink', 'satin', 'polka', [
  L('Move-in day', 'pink boxes, a pink lift', 'Pretty, easy, playful. She supervises from the bag.', 1, ['pretty', 'easy', 'playful'], 2, ['bag']),
  L('Pool party', 'the dreamhouse pool', 'Sporty, playful, fresh. Heart shades. She does not swim; she presides.', 1, ['sporty', 'playful', 'fresh'], 1, ['eyes'], { forbid: { textures: ['fur', 'velvet', 'wool'] } }),
  L('The convertible', 'the pink car, top down', 'Y2K, playful, sharp. A scarf for the ears. Hair that survives the drive, in her case ears.', 2, ['y2k', 'playful', 'sharp'], 2, ['neck']),
  L('Tea party on the lawn', 'tiny sandwiches, finally', 'Coquette, classic, pretty. Polka dots. A bow. Pearls are allowed at tea.', 3, ['coquette', 'classic', 'pretty'], 1, ['head']),
  L('Slumber party', 'the pink bed', 'Soft, relaxed, pretty. Knits and a bow. The pyjama look, elevated.', 1, ['soft', 'relaxed', 'pretty'], 3, []),
  L('Prom', 'a corsage on a collar', 'Glamorous, coquette, sleek. A tutu or a gown. A tiara is not too much.', 5, ['glamorous', 'coquette', 'sleek'], 2, ['head']),
  L('Rock show', 'the dreamhouse stage', 'Edgy, bold, undone. Leather, a chain, sunglasses. She cannot play the guitar either.', 2, ['edgy', 'bold', 'undone'], 2, ['neck']),
  L('Dreamhouse gala: best in show', 'the last gala', 'Everything she learned, in sequins. Glamorous, bold, sleek. One hero. Carry her in.', 6, ['glamorous', 'bold', 'sleek'], 2, ['bag'], { tolerance: 0 }),
]);

export const THEMES = [
  /* novel 1 · chapters 9–20 */
  T('Market Street', 'the saturday market', 'Tote bags, tomatoes, people who know what they want.', 'c1', 'NUL', 'quiet', 'clean', ['cotton', 'denim', 'canvas'], 'bone', 'cotton'),
  T('The Gallery', 'a private view', 'Concrete floors, warm wine, art you pretend to understand.', 'c2', 'THORNE', 'academia', 'quiet', ['wool', 'tweed', 'leather'], 'forest', 'wool'),
  T('Night Bus', 'the last one home', 'Fluorescent light is the hardest light. Dress for it.', 'c3', 'OXIDE', 'sleaze', 'siren', ['leather', 'sheer', 'satin'], 'black', 'leather'),
  T('Rooftop Garden', 'a roof with tomatoes', 'Ribbons, straw, a sunburn you planned.', 'c4', 'AURA', 'coquette', 'ballet', ['cotton', 'lace', 'satin'], 'babyPink', 'cotton', 'floral'),
  T('The Launch', 'a product launch', 'Chrome, clean lines, a drink you hold and never sip.', 'c5', 'KORI', 'chrome', 'clean', ['nylon', 'metal', 'latex'], 'chrome', 'chrome'),
  T('Lido', 'the outdoor pool', 'Stripes, a visor, nothing that cannot get splashed.', 'c6', 'HALO', 'blokette', 'clean', ['cotton', 'nylon', 'canvas'], 'sky', 'cotton', 'stripe'),
  T('Candle Shop', 'a shop that smells like church', 'Velvet, lace, a candle you cannot afford.', 'c7', 'OXIDE', 'fairy', 'academia', ['velvet', 'lace', 'sheer'], 'plum', 'velvet'),
  T('Block Party', 'the street, closed off', 'Speakers on the balcony, denim on everyone.', 'c8', 'ARCHIVE', 'y2k', 'blokette', ['denim', 'nylon', 'knit'], 'hotPink', 'denim'),
  T('First Paycheck', 'you can buy one thing', 'One good piece and everything else deferring to it.', 'c1', 'VESPER', 'siren', 'quiet', ['wool', 'satin', 'leather'], 'camel', 'wool'),
  PIM_WEEK,
  T('Opening Night', 'a theatre, red seats', 'Satin, something that catches the light once, an interval drink.', 'c3', 'SOLENE', 'siren', 'mob', ['satin', 'sequin', 'fur'], 'cherry', 'satin'),
  T('Last Train Home', 'the platform at 1am', 'A coat that works as a blanket. Edgy, not sloppy.', 'c3', 'OXIDE', 'sleaze', 'academia', ['leather', 'wool', 'sheer'], 'charcoal', 'leather'),
  /* novel 2 · chapters 21–40 */
  T('Sainte Aura: Pearls', 'the pearl room', 'Bouclé, a pearl, a bow. The house in three things.', 'c2', 'AURA', 'coquette', 'quiet', ['tweed', 'pearl', 'satin'], 'babyPink', 'tweed'),
  T('Vesper: The Fitting', 'the fitting room', 'A waist you can find, a shoulder that means it.', 'c4', 'VESPER', 'siren', 'quiet', ['wool', 'satin', 'leather'], 'black', 'wool'),
  T('Maison Solène: Fur Room', 'the fur room', 'One animal, one metal, one hero. Never two.', 'c3', 'SOLENE', 'mob', 'siren', ['fur', 'velvet', 'gold'], 'camel', 'fur', 'leopard'),
  T('Thorne & Co: Library', 'the reading room', 'Tartan, loafers, a book you have actually read.', 'c2', 'THORNE', 'academia', 'quiet', ['wool', 'tweed', 'leather'], 'burgundy', 'wool', 'plaid'),
  T('KŌRI: Lab', 'the materials lab', 'Liquid metal and technical shells. Nothing soft except the light.', 'c5', 'KORI', 'chrome', 'gorp', ['metal', 'nylon', 'latex'], 'silver', 'chrome'),
  T('Halo Sport: Track', 'the running track', 'Jersey, pleats, socks pulled up. Sporty and sharp.', 'c8', 'HALO', 'blokette', 'clean', ['nylon', 'cotton', 'knit'], 'cobalt', 'nylon', 'stripe'),
  T('OXIDE: Basement', 'the basement studio', 'Leather, lace, a boot that has seen things.', 'c7', 'OXIDE', 'sleaze', 'fairy', ['leather', 'lace', 'sheer'], 'black', 'leather'),
  T('Wild Heart: Ranch', 'the ranch', 'Denim, canvas, a western boot, a hat you earned.', 'c6', 'WILD', 'boho', 'clean', ['canvas', 'denim', 'leather'], 'rust', 'cotton', 'floral'),
  T('Archive 0: Flea', 'the flea market', 'Low rise, baby tees, the 2003 you were too young for.', 'c8', 'ARCHIVE', 'y2k', 'sleaze', ['denim', 'knit', 'satin'], 'lightDenim', 'denim', 'logo'),
  PIM_HOUSES,
  T('Sainte Aura: Ribbons', 'the ribbon drawer', 'Satin, tulle, a ribbon somewhere it should not be.', 'c4', 'AURA', 'ballet', 'coquette', ['satin', 'lace', 'sheer'], 'rose', 'satin'),
  T('Vesper: Pencil', 'the pencil skirt floor', 'Office siren. A pencil skirt and a point of view.', 'c5', 'VESPER', 'siren', 'chrome', ['wool', 'satin', 'metal'], 'charcoal', 'wool', 'pinstripe'),
  T('Maison Solène: Gold', 'the gold room', 'Sequins at lunch. Glamorous, warm, a little much.', 'c3', 'SOLENE', 'mob', 'siren', ['sequin', 'satin', 'gold'], 'gold', 'sequin'),
  T('Thorne & Co: Tartan', 'the tartan archive', 'Kilts, knee socks, a knit polo. Preppy with a bite.', 'c2', 'THORNE', 'academia', 'blokette', ['wool', 'tweed', 'knit'], 'forest', 'wool', 'plaid'),
  T('KŌRI: Orbit', 'the orbit collection', 'Y2k through a mirror. Chrome, ice, three colours max.', 'c5', 'KORI', 'chrome', 'y2k', ['metal', 'latex', 'nylon'], 'ice', 'chrome'),
  T('Halo Sport: Finals', 'cup final', 'The jersey, the scarf, the socks. Properly styled.', 'c6', 'HALO', 'blokette', 'y2k', ['cotton', 'nylon', 'knit'], 'white', 'cotton', 'stripe'),
  T('OXIDE: Crypt', 'the crypt show', 'Lace, velvet, a veil. Mourning as a going-out look.', 'c7', 'OXIDE', 'fairy', 'sleaze', ['lace', 'velvet', 'sheer'], 'plum', 'lace'),
  T('Wild Heart: Festival', 'the festival field', 'Prairie dresses, flower crowns, mud you planned for.', 'c6', 'WILD', 'boho', 'fairy', ['cotton', 'lace', 'canvas'], 'butter', 'cotton', 'floral'),
  T('Archive 0: Y3K', 'the y3k drop', 'Y2k, but it is 3000. Satin, chrome, one logo.', 'c8', 'ARCHIVE', 'y2k', 'chrome', ['satin', 'metal', 'denim'], 'hotPink', 'satin'),
  T('The Houses Gala', 'all ten houses, one room', 'Black tie, no notes. The strictest night of the year.', 'c3', 'SOLENE', 'siren', 'mob', ['satin', 'velvet', 'gold'], 'black', 'satin'),
  /* novel 3 · chapters 41–60 */
  T('Paris, Early', 'a café at seven', 'Tweed, a croissant, pearls before coffee.', 'c2', 'AURA', 'coquette', 'quiet', ['tweed', 'satin', 'pearl'], 'bone', 'tweed'),
  T('Lake House', 'a house on a lake', 'Gingham, knits, a boat you are not allowed to drive.', 'c6', 'WILD', 'boho', 'clean', ['cotton', 'canvas', 'knit'], 'sage', 'cotton', 'gingham'),
  T('Tokyo Night', 'a convenience store at 2am', 'Neon, nylon, chrome. Nothing matte.', 'c5', 'KORI', 'chrome', 'y2k', ['nylon', 'metal', 'latex'], 'chrome', 'nylon'),
  T('Alpine', 'a mountain village', 'Technical shells and a knit you trust. Gorp, polished.', 'c6', 'HALO', 'gorp', 'clean', ['nylon', 'knit', 'wool'], 'white', 'nylon'),
  T('Desert Drive', 'a car with no roof', 'Leather, denim, dust. Boho with an edge.', 'c6', 'WILD', 'boho', 'sleaze', ['leather', 'canvas', 'denim'], 'rust', 'leather'),
  T('Milan Lunch', 'a long lunch', 'Camel, a loafer, a bag that costs more than the lunch.', 'c1', 'VESPER', 'siren', 'quiet', ['wool', 'satin', 'leather'], 'camel', 'wool'),
  T('Seoul Café', 'a dessert café', 'Pastels, knits, a clean girl with a bow.', 'c4', 'AURA', 'coquette', 'clean', ['cotton', 'knit', 'satin'], 'babyPink', 'knit'),
  T('Amalfi', 'a terrace over the sea', 'Lemons, linen, a sandal with a heel.', 'c6', 'WILD', 'boho', 'coquette', ['cotton', 'lace', 'canvas'], 'butter', 'cotton', 'floral'),
  T('Berlin Club', 'a club that opens at midnight', 'Latex, leather, mesh. Black wins.', 'c3', 'OXIDE', 'sleaze', 'chrome', ['leather', 'latex', 'sheer'], 'black', 'latex'),
  T('Scottish Castle', 'a castle with a leak', 'Tartan, velvet, a fire you sit too close to.', 'c2', 'THORNE', 'academia', 'quiet', ['wool', 'tweed', 'velvet'], 'forest', 'tweed', 'plaid'),
  T('Ibiza Sunrise', 'a beach at 6am', 'Sheer, white, barefoot by the end.', 'c6', 'ARCHIVE', 'y2k', 'fairy', ['sheer', 'satin', 'lace'], 'white', 'sheer'),
  T('New York Minute', 'a crosswalk', 'Black, sharp, walking fast.', 'c8', 'NUL', 'clean', 'siren', ['wool', 'leather', 'cotton'], 'black', 'wool'),
  T('Marrakesh', 'a riad', 'Velvet, gold, a slipper. Warm and a little loud.', 'c6', 'WILD', 'boho', 'mob', ['velvet', 'cotton', 'gold'], 'rust', 'velvet'),
  T('Ski Lodge', 'a lodge after the slopes', 'Knits, fur, a pink that reads as snow.', 'c7', 'HALO', 'gorp', 'coquette', ['knit', 'fur', 'nylon'], 'babyPink', 'knit'),
  T('Venice Mask', 'a masked ball', 'Velvet, lace, something over the face.', 'c7', 'SOLENE', 'mob', 'fairy', ['velvet', 'lace', 'sequin'], 'plum', 'velvet'),
  T('LA Pool', 'a pool in the hills', 'Hot pink, latex, sunglasses indoors.', 'c1', 'ARCHIVE', 'y2k', 'clean', ['cotton', 'latex', 'satin'], 'hotPink', 'cotton'),
  PIM_ABROAD,
  T('Sydney Beach', 'a surf beach', 'Sporty, salty, a cap and a tote.', 'c6', 'HALO', 'blokette', 'boho', ['cotton', 'canvas', 'nylon'], 'sky', 'cotton'),
  T('Vienna Ball', 'a ballroom with a quartet', 'Satin, pearls, a gown that turns.', 'c3', 'SOLENE', 'siren', 'coquette', ['satin', 'sequin', 'pearl'], 'ice', 'satin'),
  T('Home Again', 'your own doorstep', 'The capsule you came back to. Quiet and right.', 'c1', 'NUL', 'quiet', 'clean', ['cotton', 'knit', 'wool'], 'bone', 'knit'),
  /* novel 4 · chapters 61–80 */
  T('Casting Call', 'a white room, forty girls', 'Clean, sharp, memorable in one frame.', 'c1', 'NUL', 'clean', 'siren', ['cotton', 'wool', 'leather'], 'white', 'cotton'),
  T('Fitting Room 3', 'the fitting room', 'A waist, a shoulder, a pin in your sleeve.', 'c4', 'VESPER', 'siren', 'quiet', ['wool', 'satin', 'leather'], 'charcoal', 'wool'),
  T('The Lookbook', 'a lookbook shoot', 'Pretty, quiet, every piece visible.', 'c2', 'AURA', 'coquette', 'quiet', ['satin', 'lace', 'pearl'], 'rose', 'satin'),
  T('Street Style', 'outside the show', 'What the photographers stop for.', 'c8', 'ARCHIVE', 'y2k', 'sleaze', ['denim', 'leather', 'knit'], 'lightDenim', 'denim'),
  T('Hair & Makeup', 'the beauty chair', 'Ballet softness, a bow, a lip that lasts.', 'c4', 'AURA', 'ballet', 'coquette', ['satin', 'cotton', 'lace'], 'lavender', 'satin'),
  T('Front Row', 'the front row', 'Fur, a clutch, sunglasses you do not take off.', 'c3', 'SOLENE', 'mob', 'siren', ['fur', 'satin', 'gold'], 'cherry', 'fur'),
  T('The Afterparty', 'the afterparty', 'Sequins, leather, undone on purpose.', 'c3', 'OXIDE', 'sleaze', 'siren', ['leather', 'sequin', 'sheer'], 'black', 'sequin'),
  T('Editorial: Chrome', 'a chrome editorial', 'Metal, latex, one idea.', 'c5', 'KORI', 'chrome', 'siren', ['metal', 'latex', 'satin'], 'silver', 'chrome'),
  T('Editorial: Garden', 'a garden editorial', 'Florals, lace, a parasol.', 'c4', 'AURA', 'coquette', 'boho', ['cotton', 'lace', 'satin'], 'babyPink', 'cotton', 'floral'),
  T('Editorial: Noir', 'a noir editorial', 'Velvet, leather, a shadow across the face.', 'c7', 'OXIDE', 'siren', 'academia', ['velvet', 'leather', 'sheer'], 'black', 'velvet'),
  T('Campaign Day', 'the campaign shoot', 'Clean, technical, expensive light.', 'c5', 'KORI', 'chrome', 'clean', ['nylon', 'metal', 'cotton'], 'ice', 'nylon'),
  PIM_CAST,
  T('The Archive', 'the house archive', 'Denim, knits, the pieces that started it.', 'c8', 'ARCHIVE', 'y2k', 'academia', ['denim', 'knit', 'tweed'], 'denim', 'denim'),
  T('Showroom', 'the showroom', 'Tweed, a loafer, a buyer with a clipboard.', 'c2', 'THORNE', 'academia', 'quiet', ['tweed', 'wool', 'leather'], 'camel', 'tweed'),
  T('Runway Rehearsal', 'the rehearsal', 'Ballet flats, a knit, walk it twice.', 'c4', 'AURA', 'ballet', 'clean', ['cotton', 'knit', 'satin'], 'white', 'knit'),
  T('Shoot: Rooftop', 'a rooftop shoot', 'Sporty, bright, the wind is a stylist.', 'c8', 'HALO', 'blokette', 'y2k', ['nylon', 'cotton', 'denim'], 'cobalt', 'nylon', 'stripe'),
  T('Shoot: Hotel', 'a hotel suite', 'Satin, velvet, room service on the bed.', 'c3', 'SOLENE', 'mob', 'siren', ['satin', 'velvet', 'gold'], 'burgundy', 'satin'),
  T('Awards Night', 'an awards night', 'Sequins, a train, do not go under the dress code.', 'c3', 'SOLENE', 'siren', 'mob', ['sequin', 'satin', 'gold'], 'black', 'sequin'),
  T('Cover Story', 'the cover try', 'Hot pink, chrome, a story in one frame.', 'c5', 'ARCHIVE', 'y2k', 'chrome', ['satin', 'metal', 'denim'], 'hotPink', 'satin'),
  T('Finale', 'the season finale', 'Black, sharp, the look they remember.', 'c8', 'NUL', 'clean', 'siren', ['wool', 'leather', 'satin'], 'black', 'wool'),
  /* novel 5 · chapters 81–100 */
  T('Move-in Day', 'the dreamhouse, keys in hand', 'Pink boxes, a pink lift, a very pink you.', 'c1', 'AURA', 'coquette', 'clean', ['cotton', 'satin', 'knit'], 'babyPink', 'cotton'),
  T('Pool Party', 'the dreamhouse pool', 'Hot pink, latex, a slide you take seriously.', 'c6', 'HALO', 'y2k', 'blokette', ['cotton', 'latex', 'nylon'], 'hotPink', 'cotton'),
  T('Convertible', 'the pink car', 'A headscarf, sunglasses, hair that survives the drive.', 'c1', 'ARCHIVE', 'y2k', 'coquette', ['satin', 'denim', 'leather'], 'hotPink', 'satin'),
  T('Closet Tour', 'the walk-in', 'Satin, tweed, pearls. The closet is the point.', 'c4', 'AURA', 'coquette', 'quiet', ['satin', 'tweed', 'pearl'], 'babyPink', 'satin'),
  T('Tea Party', 'a tea party on the lawn', 'Lace, polka dots, a hat with a brim.', 'c4', 'AURA', 'coquette', 'ballet', ['lace', 'satin', 'cotton'], 'rose', 'lace', 'polka'),
  T('Prom', 'prom night', 'Satin, a corsage, a heel you can dance in.', 'c3', 'SOLENE', 'coquette', 'siren', ['satin', 'sequin', 'pearl'], 'babyPink', 'satin'),
  T('Slumber Party', 'a sleepover', 'Knits, satin, socks with a ruffle.', 'c7', 'ARCHIVE', 'y2k', 'coquette', ['knit', 'satin', 'cotton'], 'lavender', 'knit', 'polka'),
  T('Beach Day', 'the dreamhouse beach', 'Stripes, a basket, hot pink on sand.', 'c6', 'WILD', 'boho', 'y2k', ['cotton', 'canvas', 'latex'], 'hotPink', 'cotton', 'stripe'),
  T('The Gala', 'the dreamhouse gala', 'Sequins, a gown, gold on pink.', 'c3', 'SOLENE', 'siren', 'coquette', ['sequin', 'satin', 'gold'], 'hotPink', 'sequin'),
  T('Garden Wedding', 'a wedding on the lawn', 'Lace, florals, not white unless you are the bride.', 'c4', 'AURA', 'coquette', 'boho', ['lace', 'satin', 'cotton'], 'white', 'lace', 'floral'),
  T('Ice Rink', 'the rink', 'Knits, a skating skirt, chrome on ice.', 'c5', 'KORI', 'chrome', 'ballet', ['knit', 'satin', 'metal'], 'ice', 'knit'),
  PIM_DREAM,
  T('Ballet Recital', 'the recital', 'Tulle, satin, a bun that holds.', 'c4', 'AURA', 'ballet', 'coquette', ['sheer', 'satin', 'knit'], 'lilacGrey', 'sheer'),
  T('Rock Show', 'the dreamhouse stage', 'Leather, sequins, a guitar you cannot play.', 'c7', 'OXIDE', 'sleaze', 'y2k', ['leather', 'sequin', 'denim'], 'hotPink', 'leather'),
  T('Space Camp', 'the dreamhouse rocket', 'Chrome, latex, moon boots.', 'c5', 'KORI', 'chrome', 'y2k', ['metal', 'latex', 'nylon'], 'silver', 'chrome'),
  T('Horse Show', 'the stables', 'Tweed, a boot, a ribbon in the braid.', 'c2', 'THORNE', 'academia', 'boho', ['tweed', 'leather', 'cotton'], 'camel', 'tweed'),
  T('Career Day', 'the dreamhouse office', 'Office siren in pink. A pencil skirt and a plan.', 'c1', 'VESPER', 'siren', 'clean', ['wool', 'satin', 'leather'], 'babyPink', 'wool'),
  T('Birthday', 'the birthday', 'Satin, sequins, a cake you do not cut.', 'c3', 'AURA', 'coquette', 'siren', ['satin', 'sequin', 'lace'], 'hotPink', 'satin'),
  T('Dreamhouse Gala', 'the last gala', 'Everything you learned, in sequins.', 'c3', 'SOLENE', 'siren', 'mob', ['sequin', 'satin', 'gold'], 'hotPink', 'sequin'),
  T('Forever', 'the end credits', 'White, pearls, a look that will not date.', 'c1', 'NUL', 'clean', 'coquette', ['cotton', 'satin', 'pearl'], 'white', 'satin'),
];

// the eight handwritten chapters, described the same way so secret sets can be built for them
export const CORE8 = {
  c1: { title: 'Arrival', house: 'NUL', aes: ['clean', 'quiet'], cw: 'bone', mat: 'cotton', print: null },
  c2: { title: 'Rue Bouclé', house: 'AURA', aes: ['coquette', 'quiet'], cw: 'babyPink', mat: 'tweed', print: null },
  c3: { title: 'Night Shift', house: 'SOLENE', aes: ['siren', 'mob'], cw: 'black', mat: 'satin', print: null },
  c4: { title: 'New Silhouette', house: 'VESPER', aes: ['coquette', 'siren'], cw: 'sky', mat: 'cotton', print: 'toile' },
  c5: { title: 'Chrome Season', house: 'KORI', aes: ['chrome', 'clean'], cw: 'chrome', mat: 'chrome', print: null },
  c6: { title: 'Riviera', house: 'WILD', aes: ['boho', 'clean'], cw: 'butter', mat: 'cotton', print: 'gingham' },
  c7: { title: 'Gothic Romance', house: 'OXIDE', aes: ['fairy', 'sleaze'], cw: 'plum', mat: 'lace', print: null },
  c8: { title: 'Haute Street', house: 'ARCHIVE', aes: ['y2k', 'sleaze'], cw: 'hotPink', mat: 'denim', print: null },
};

// occasion briefs: [title, client, copy, formality, mood[3], weather, required[], extra, tags]
const O = (title, client, copy, formality, mood, weather, required = [], extra = {}, tags = []) => ({ title, client, copy, formality, mood, weather, required, extra, tags });
export const OCCASIONS = [
  O('Coffee and a walk', 'you, early', 'Easy and light. Nobody is watching, which is the point.', 1, ['easy', 'fresh', 'clean'], 2, [], {}, ['clean', 'quiet']),
  O('Errands that matter', 'the post office, then lunch', 'Clean and quiet. You will see someone you know.', 1, ['clean', 'easy', 'quiet'], 2, ['bag'], {}, ['clean', 'quiet']),
  O('Brunch with the group', 'a table for six', 'Pretty, relaxed, photographed by the one who always does.', 2, ['pretty', 'relaxed', 'fresh'], 2, ['bag'], {}, ['coquette', 'boho', 'clean']),
  O('A date that might be one', 'a wine bar, low light', 'Sleek, a little romantic, mostly dark.', 3, ['sleek', 'romantic', 'dark'], 2, ['bag'], {}, ['siren', 'mob']),
  O('The interview', 'a glass office', 'Polished and sharp. One thing that says you are not boring.', 3, ['polished', 'sharp', 'modern'], 3, ['bag'], {}, ['siren', 'quiet', 'clean']),
  O('Gallery night', 'concrete and warm wine', 'Quiet clothes photograph better next to art.', 3, ['quiet', 'polished', 'warm'], 3, ['bag'], {}, ['quiet', 'academia']),
  O('Dinner, tablecloths', 'a restaurant with a wine list', 'Classic and polished. One good bag.', 3, ['classic', 'polished', 'soft'], 3, ['bag'], {}, ['quiet', 'siren', 'coquette']),
  O('The gig', 'a venue with a sticky floor', 'Edgy and easy. You need to be able to move.', 2, ['edgy', 'easy', 'undone'], 2, [], {}, ['sleaze', 'fairy']),
  O('Match day', 'the stands', 'Sporty and playful. Four hours on your feet.', 1, ['sporty', 'playful', 'easy'], 2, [], { forbid: { textures: ['satin', 'sequin', 'velvet'] } }, ['blokette']),
  O('Picnic', 'a blanket on grass', 'Pretty without trying. Ribbons, not logos.', 2, ['pretty', 'soft', 'fresh'], 1, [], {}, ['coquette', 'boho', 'ballet']),
  O('Rain, still going', 'a wet afternoon', 'Tailored over cool colours. A coat is required.', 2, ['tailored', 'cool', 'polished'], 3, ['outer'], {}, ['quiet', 'academia']),
  O('The cocktail hour', 'a bar with a dress code', 'Glamorous, sleek, one thing that catches the light.', 4, ['glamorous', 'sleek', 'dark'], 2, ['bag'], {}, ['siren', 'mob']),
  O('Garden party', 'a lawn and a quartet', 'Pretty, polished, fresh. A full skirt would not be wrong.', 3, ['pretty', 'polished', 'fresh'], 1, ['bag'], {}, ['coquette', 'ballet']),
  O('Studio day', 'a creative office', 'Modern and relaxed. Everybody notices shoes.', 2, ['modern', 'relaxed', 'polished'], 3, ['bag'], {}, ['clean', 'quiet', 'chrome']),
  O('Library hours', 'a reading room', 'Dark academia with a sharp edge. Carry a book.', 2, ['academia', 'sharp', 'quiet'], 3, [], {}, ['academia']),
  O('Pilates, then errands', 'a tuesday', 'Slicked bun, gold hoops, nothing louder.', 1, ['clean', 'minimal', 'fresh'], 2, [], {}, ['clean']),
  O('Wedding guest', 'a vineyard, warm', 'Pretty, polished, fresh. Not white.', 4, ['pretty', 'polished', 'fresh'], 1, ['bag'], { forbid: { colors: ['#FFFFFF', '#F3F0E8'] } }, ['coquette', 'boho', 'siren']),
  O('Black tie', 'a gala with a seating plan', 'Glamorous, sleek, classic. Do not go under.', 6, ['glamorous', 'sleek', 'classic'], 2, ['bag'], { tolerance: 0 }, ['siren', 'mob']),
  O('After-party', 'someone’s kitchen, 2am', 'Undone on purpose. Layered like you came from somewhere better.', 2, ['undone', 'edgy', 'nocturnal'], 2, [], {}, ['sleaze', 'siren']),
  O('Rooftop drinks', 'sunset, windy', 'Glamorous and fresh. Plan for the wind.', 4, ['glamorous', 'fresh', 'bold'], 1, ['bag'], {}, ['siren', 'boho']),
  O('The shoot', 'a photo studio', 'Bold and modern. One idea, carried through.', 3, ['bold', 'modern', 'sharp'], 3, ['bag'], {}, ['chrome', 'siren', 'y2k']),
  O('Street style', 'outside the show', 'Bold, modern, playful. Exactly three accessories.', 3, ['bold', 'modern', 'playful'], 3, ['bag'], { exactAccessories: 3 }, ['y2k', 'sleaze', 'blokette']),
  O('Tea room', 'tiny sandwiches', 'Pretty and classic. Pearls or a bow, nothing else shiny.', 3, ['classic', 'pretty', 'quiet'], 2, [], {}, ['coquette', 'quiet']),
  O('The fitting', 'an atelier', 'Quiet and polished with a defined waist.', 3, ['quietlux', 'polished', 'sharp'], 3, ['bag'], {}, ['quiet', 'siren']),
  O('Market morning', 'a port town, 9am', 'Fresh, easy, pretty. Something to carry lemons in.', 1, ['fresh', 'easy', 'pretty'], 1, ['bag'], {}, ['boho', 'clean', 'coquette']),
  O('Boat day', 'a friend’s boat', 'Sporty but chic. Clean, fresh, minimal. Flats only.', 1, ['clean', 'fresh', 'minimal'], 1, [], { forbid: { heels: true } }, ['clean', 'blokette']),
  O('Flea market', 'a sunday flea', 'Boho, soft, romantic. A flower in your hair.', 2, ['boho', 'soft', 'romantic'], 2, [], {}, ['boho', 'fairy']),
  O('Candlelit bar', 'a bar lit by candles', 'Romantic and dark, a little edgy.', 3, ['romantic', 'dark', 'edgy'], 2, [], {}, ['fairy', 'sleaze', 'siren']),
  O('Masquerade', 'a masked ball', 'Glamorous, dark, romantic. Something over the face.', 5, ['glamorous', 'dark', 'romantic'], 2, ['hairAcc'], {}, ['fairy', 'mob']),
  O('Chrome launch', 'a launch in a car park', 'Chrome somewhere, matte everywhere else.', 3, ['futuristic', 'bold', 'minimal'], 2, [], { mustTexture: 'metal' }, ['chrome']),
  O('Cup final', 'the cup', 'A jersey and a pleated skirt, properly styled.', 1, ['sporty', 'playful', 'sharp'], 2, [], {}, ['blokette']),
  O('Campus day', 'a campus that is not a campus', 'Y2k, pretty, playful. The shrunken cardigan.', 2, ['y2k', 'pretty', 'playful'], 2, [], {}, ['y2k', 'coquette']),
  O('Awards after-party', 'after the awards', 'Glamorous, easy, bold. Trainers with a gown.', 4, ['glamorous', 'easy', 'bold'], 2, [], {}, ['siren', 'y2k']),
  O('Hotel bar, closing', 'the hotel bar', 'Glamorous but undone.', 4, ['glamorous', 'undone', 'nocturnal'], 2, [], {}, ['siren', 'mob']),
  O('Gorp to gallery', 'a private view in the rain', 'Technical outerwear that could walk into a white gallery.', 1, ['gorp', 'polished', 'minimal'], 4, ['outer'], {}, ['gorp', 'clean']),
  O('Ballet class', 'a studio with a barre', 'Rehearsal softness. Soft and pretty.', 2, ['ballet', 'soft', 'pretty'], 2, [], {}, ['ballet', 'coquette']),
  O('Dinner by the water', 'white tablecloths, sea air', 'Polished, romantic, fresh. Sandals with a heel.', 4, ['polished', 'romantic', 'fresh'], 1, ['bag'], {}, ['boho', 'siren', 'coquette']),
  O('Trattoria lunch', 'a terrace in the sun', 'Pretty, warm, playful. Red somewhere.', 2, ['pretty', 'warm', 'playful'], 1, [], {}, ['boho', 'coquette']),
  O('Forest rave', 'a rave in the woods', 'Fairy grunge: undone and soft, mesh under lace.', 1, ['fairy', 'undone', 'soft'], 2, [], {}, ['fairy', 'sleaze']),
  O('Brunch in fur', 'sunday, 1pm', 'Fur, gold, sunglasses indoors. One hero.', 3, ['mob', 'bold', 'warm'], 4, ['bag'], {}, ['mob']),
  O('Office, future', 'a mirrored office', 'Siren, futuristic, sharp.', 3, ['siren', 'futuristic', 'sharp'], 2, ['bag'], {}, ['siren', 'chrome']),
  O('The sheer blouse', 'a gallery dinner', 'Something sheer, worn like it is nothing.', 4, ['siren', 'sleek', 'dark'], 2, ['bag'], { mustTexture: 'sheer' }, ['siren', 'fairy']),
  O('Pearls and combat', 'a gothic story', 'Pearls with a combat boot. Edgy, classic, dark.', 3, ['edgy', 'classic', 'dark'], 3, [], {}, ['fairy', 'sleaze', 'academia']),
  O('Birthday at the dive bar', 'her birthday', 'Edgy and feminine, easy to dance in.', 2, ['edgy', 'feminine', 'easy'], 2, [], {}, ['sleaze', 'coquette']),

  /* novel 1 · the city, everyday */
  O('The farmers’ market', 'tote bags, tomatoes', 'Quiet and clean. Something to carry lemons in.', 1, ['clean', 'easy', 'fresh'], 2, ['bag'], {}, ['clean', 'quiet', 'boho', 'n1']),
  O('First flat viewing', 'a landlord who judges', 'Polished, quiet, trustworthy. You want keys, not compliments.', 2, ['polished', 'quiet', 'classic'], 3, ['bag'], {}, ['quiet', 'clean', 'n1']),
  O('The late shift', 'a bar, closing time', 'Edgy, easy, dark. You are working, not dancing.', 1, ['edgy', 'easy', 'dark'], 2, [], {}, ['sleaze', 'siren', 'n1']),
  O('Night bus home', 'the top deck, 1am', 'Nocturnal, undone, warm enough. Fluorescent light forgives nothing.', 1, ['nocturnal', 'undone', 'cool'], 3, ['outer'], {}, ['sleaze', 'academia', 'n1']),
  O('Rooftop, someone’s birthday', 'a roof with fairy lights', 'Pretty, playful, fresh. The wind is also invited.', 2, ['pretty', 'playful', 'fresh'], 1, [], {}, ['coquette', 'boho', 'n1']),
  O('The product launch', 'a drink you hold and never sip', 'Modern, minimal, sharp. One chrome thing.', 3, ['modern', 'minimal', 'sharp'], 2, ['bag'], {}, ['chrome', 'clean', 'n1']),
  O('Lido morning', 'the outdoor pool, 8am', 'Sporty, fresh, clean. Nothing that cannot get splashed.', 1, ['sporty', 'fresh', 'clean'], 1, [], { forbid: { textures: ['satin', 'sequin', 'velvet'] } }, ['blokette', 'clean', 'n1']),
  O('Candle shop Saturday', 'a shop that smells like church', 'Romantic, dark, soft. Velvet is the point.', 2, ['romantic', 'dark', 'soft'], 3, [], {}, ['fairy', 'academia', 'n1']),
  O('Block party', 'the street, closed off', 'Playful, bold, easy. Denim on everyone; be the one who styled it.', 1, ['playful', 'bold', 'easy'], 2, [], {}, ['y2k', 'blokette', 'n1']),
  O('Payday, one good thing', 'a shop with a doorbell', 'Quiet luxury, polished, sharp. One hero piece and everything else deferring to it.', 3, ['quietlux', 'polished', 'sharp'], 2, ['bag'], {}, ['siren', 'quiet', 'n1']),
  O('Opening night', 'a theatre, red seats', 'Glamorous, classic, dark. Something that catches the light at the interval.', 4, ['glamorous', 'classic', 'dark'], 2, ['bag'], {}, ['siren', 'mob', 'n1']),
  O('Last train', 'platform 4, 00:52', 'Edgy, cool, undone. A coat that works as a blanket.', 1, ['edgy', 'cool', 'undone'], 3, ['outer'], {}, ['sleaze', 'academia', 'n1']),
  O('Launderette Sunday', 'the big machines', 'Clean, soft, easy. The version of you that owns an iron.', 1, ['clean', 'soft', 'easy'], 2, [], {}, ['clean', 'quiet', 'n1']),
  O('The pub quiz', 'a corner table, four friends', 'Relaxed, warm, easy. A knit does the work.', 1, ['relaxed', 'warm', 'easy'], 3, [], {}, ['academia', 'quiet', 'boho', 'n1']),
  O('Bookshop reading', 'folding chairs, free wine', 'Academia, quiet, soft. Carry the book.', 2, ['academia', 'quiet', 'soft'], 3, [], {}, ['academia', 'n1']),
  O('Sunday roast at hers', 'her mum is cooking', 'Classic, soft, warm. Nothing that frightens a parent.', 2, ['classic', 'soft', 'warm'], 3, [], {}, ['quiet', 'coquette', 'n1']),
  O('Running club', 'a bridge at 7am', 'Sporty, clean, fresh. The socks are the look.', 1, ['sporty', 'clean', 'fresh'], 2, [], {}, ['blokette', 'clean', 'n1']),
  O('Karaoke basement', 'a room with a tambourine', 'Playful, bold, undone. Sequins are encouraged.', 2, ['playful', 'bold', 'undone'], 2, [], {}, ['y2k', 'sleaze', 'n1']),
  /* novel 2 · the houses */
  O('Pearl room appointment', 'Sainte Aura, by invitation', 'Coquette, classic, quiet. Bouclé, a pearl, a bow.', 3, ['coquette', 'classic', 'quiet'], 2, ['bag'], {}, ['coquette', 'quiet', 'n2']),
  O('The Vesper fitting', 'a room with three mirrors', 'Siren, polished, sharp. Find the waist.', 3, ['siren', 'polished', 'sharp'], 2, ['bag'], {}, ['siren', 'quiet', 'n2']),
  O('Fur room, Maison Solène', 'Vesna is watching', 'Mob, bold, warm. One animal, one metal.', 3, ['mob', 'bold', 'warm'], 4, ['bag'], {}, ['mob', 'n2']),
  O('Thorne reading room', 'the house library', 'Academia, classic, sharp. Tartan somewhere.', 3, ['academia', 'classic', 'sharp'], 3, [], {}, ['academia', 'n2']),
  O('KŌRI lab tour', 'white coats, cold light', 'Chrome, minimal, futuristic. No prints.', 2, ['chrome', 'minimal', 'futuristic'], 2, [], { forbid: { prints: true } }, ['chrome', 'n2']),
  O('Halo track day', 'the running track', 'Sporty, sharp, playful. Socks pulled up.', 1, ['sporty', 'sharp', 'playful'], 2, [], {}, ['blokette', 'n2']),
  O('OXIDE basement show', 'a basement studio', 'Edgy, dark, romantic. A boot that has seen things.', 2, ['edgy', 'dark', 'romantic'], 2, [], {}, ['sleaze', 'fairy', 'n2']),
  O('Wild Heart ranch', 'dust, a fence, a horse', 'Boho, warm, easy. A western boot if you own one.', 1, ['boho', 'warm', 'easy'], 2, [], {}, ['boho', 'n2']),
  O('Archive 0 flea', 'rails of 2003', 'Y2K, playful, undone. Low rise, baby tee.', 1, ['y2k', 'playful', 'undone'], 2, [], {}, ['y2k', 'sleaze', 'n2']),
  O('NUL white studio', 'a room with nothing in it', 'Clean, minimal, quiet. The basics, done perfectly.', 2, ['clean', 'minimal', 'quiet'], 2, [], {}, ['clean', 'quiet', 'n2']),
  O('House dinner', 'a long table, ten houses', 'Polished, classic, sleek. Represent your house without a logo.', 4, ['polished', 'classic', 'sleek'], 2, ['bag'], {}, ['quiet', 'siren', 'coquette', 'n2']),
  O('Atelier open day', 'sewing machines, public', 'Polished, modern, quiet. You are being watched by people who sew.', 2, ['polished', 'modern', 'quiet'], 3, ['bag'], {}, ['quiet', 'clean', 'academia', 'n2']),
  O('The ribbon drawer', 'Sainte Aura, the archive', 'Ballet, soft, pretty. A ribbon somewhere unexpected.', 2, ['ballet', 'soft', 'pretty'], 2, ['hairAcc'], {}, ['ballet', 'coquette', 'n2']),
  O('Pencil skirt floor', 'Vesper, the office', 'Siren, sharp, modern. Office siren, properly.', 3, ['siren', 'sharp', 'modern'], 2, ['bag'], {}, ['siren', 'n2']),
  O('Gold room lunch', 'Maison Solène, 1pm', 'Glamorous, warm, bold. Sequins at lunch.', 3, ['glamorous', 'warm', 'bold'], 2, ['bag'], {}, ['mob', 'siren', 'n2']),
  O('Tartan archive', 'Thorne, the attic', 'Academia, playful, sharp. A kilt, knee socks, a knit polo.', 2, ['academia', 'playful', 'sharp'], 3, ['hosiery'], {}, ['academia', 'blokette', 'n2']),
  O('Orbit preview', 'KŌRI, lights off', 'Futuristic, y2k, minimal. Three colours, maximum.', 3, ['futuristic', 'y2k', 'minimal'], 2, [], {}, ['chrome', 'y2k', 'n2']),
  O('Crypt rehearsal', 'OXIDE, candles', 'Fairy, dark, romantic. Lace and a veil.', 3, ['fairy', 'dark', 'romantic'], 2, ['hairAcc'], {}, ['fairy', 'sleaze', 'n2']),
  O('Festival field', 'Wild Heart, day two', 'Boho, soft, playful. Mud you planned for.', 1, ['boho', 'soft', 'playful'], 2, [], {}, ['boho', 'fairy', 'n2']),
  O('Y3K drop', 'Archive 0, midnight', 'Y2K, futuristic, bold. Satin, chrome, one logo.', 2, ['y2k', 'futuristic', 'bold'], 2, [], {}, ['y2k', 'chrome', 'n2']),
  /* novel 3 · a year on the road */
  O('Paris, seven am', 'a café, a croissant', 'Coquette, classic, quiet. Pearls before coffee.', 2, ['coquette', 'classic', 'quiet'], 2, ['bag'], {}, ['coquette', 'quiet', 'n3']),
  O('Lake house morning', 'a jetty, cold water', 'Clean, soft, fresh. Gingham or a knit.', 1, ['clean', 'soft', 'fresh'], 2, [], {}, ['boho', 'clean', 'n3']),
  O('Tokyo, 2am', 'a convenience store', 'Futuristic, bold, nocturnal. Nothing matte.', 2, ['futuristic', 'bold', 'nocturnal'], 2, [], {}, ['chrome', 'y2k', 'n3']),
  O('Alpine village', 'snow, a chairlift', 'Gorp, polished, soft. A shell you trust.', 1, ['gorp', 'polished', 'soft'], 4, ['outer'], {}, ['gorp', 'clean', 'n3']),
  O('Desert drive', 'a car with no roof', 'Boho, edgy, warm. Leather, denim, dust.', 1, ['boho', 'edgy', 'warm'], 1, [], {}, ['boho', 'sleaze', 'n3']),
  O('Milan, long lunch', 'three hours, one table', 'Quiet luxury, polished, warm. Camel and a loafer.', 3, ['quietlux', 'polished', 'warm'], 2, ['bag'], {}, ['quiet', 'siren', 'n3']),
  O('Seoul dessert café', 'a café with a queue', 'Pretty, clean, soft. Pastels and a bow.', 2, ['pretty', 'clean', 'soft'], 2, [], {}, ['coquette', 'clean', 'n3']),
  O('Amalfi terrace', 'lemons, sea, steps', 'Pretty, fresh, romantic. Linen and a sandal with a heel.', 3, ['pretty', 'fresh', 'romantic'], 1, ['bag'], {}, ['boho', 'coquette', 'n3']),
  O('Berlin door', 'a club that opens at midnight', 'Edgy, dark, bold. Black wins.', 2, ['edgy', 'dark', 'bold'], 2, [], {}, ['sleaze', 'chrome', 'n3']),
  O('Castle weekend', 'a castle with a leak', 'Academia, classic, warm. Tartan by the fire.', 2, ['academia', 'classic', 'warm'], 4, ['outer'], {}, ['academia', 'quiet', 'n3']),
  O('Ibiza sunrise', 'the beach at six', 'Fairy, soft, fresh. Sheer and white, barefoot by the end.', 1, ['fairy', 'soft', 'fresh'], 1, [], { forbid: { heels: true } }, ['y2k', 'fairy', 'n3']),
  O('New York minute', 'a crosswalk', 'Sleek, sharp, dark. Walk fast.', 3, ['sleek', 'sharp', 'dark'], 3, ['bag'], {}, ['clean', 'siren', 'n3']),
  O('Marrakesh riad', 'tiles and a fountain', 'Boho, warm, bold. Velvet, gold, a slipper.', 2, ['boho', 'warm', 'bold'], 3, [], {}, ['boho', 'mob', 'n3']),
  O('Ski lodge, après', 'a fire, a fondue', 'Soft, warm, playful. Knits and fur.', 2, ['soft', 'warm', 'playful'], 4, [], {}, ['gorp', 'coquette', 'n3']),
  O('Venice, masked', 'a palazzo, candles', 'Glamorous, romantic, dark. Something over the face.', 5, ['glamorous', 'romantic', 'dark'], 2, ['hairAcc'], {}, ['mob', 'fairy', 'n3']),
  O('LA pool house', 'a pool in the hills', 'Y2K, bold, fresh. Hot pink, sunglasses indoors.', 1, ['y2k', 'bold', 'fresh'], 1, ['eyes'], {}, ['y2k', 'clean', 'n3']),
  O('Copenhagen bike lane', 'a basket of bread', 'Clean, classic, easy. Stripes and a trench.', 1, ['clean', 'classic', 'easy'], 3, ['outer'], {}, ['clean', 'academia', 'n3']),
  O('Sydney surf beach', 'salt, a cap, a tote', 'Sporty, fresh, easy. Cap and a tote.', 1, ['sporty', 'fresh', 'easy'], 1, ['bag'], {}, ['blokette', 'boho', 'n3']),
  O('Vienna ball', 'a quartet, a staircase', 'Glamorous, classic, sleek. A gown that turns.', 6, ['glamorous', 'classic', 'sleek'], 2, ['bag'], { tolerance: 0 }, ['siren', 'coquette', 'n3']),
  O('Overnight train', 'a sleeper cabin', 'Relaxed, soft, quiet. Travel clothes that look like a decision.', 1, ['relaxed', 'soft', 'quiet'], 3, [], {}, ['quiet', 'clean', 'n3']),
  O('Hotel breakfast', 'a buffet, a view', 'Pretty, relaxed, polished. The first look of the day.', 2, ['pretty', 'relaxed', 'polished'], 2, [], {}, ['coquette', 'quiet', 'n3']),
  O('Night market', 'lanterns, skewers, steam', 'Playful, bold, easy. Something that survives sauce.', 1, ['playful', 'bold', 'easy'], 2, ['bag'], {}, ['y2k', 'boho', 'n3']),
  /* novel 4 · backstage */
  O('Open casting', 'a white room, forty girls', 'Clean, sharp, minimal. Memorable in one frame.', 2, ['clean', 'sharp', 'minimal'], 2, [], {}, ['clean', 'siren', 'n4']),
  O('Fitting, pins in', 'the fitting room, hour three', 'Quiet luxury, polished, sharp. Stand still.', 3, ['quietlux', 'polished', 'sharp'], 2, ['bag'], {}, ['quiet', 'siren', 'n4']),
  O('Lookbook day', 'a grey backdrop', 'Pretty, quiet, polished. Every piece must read.', 3, ['pretty', 'quiet', 'polished'], 2, ['bag'], {}, ['coquette', 'quiet', 'n4']),
  O('Outside the show', 'photographers, a kerb', 'Bold, modern, playful. Exactly three accessories.', 3, ['bold', 'modern', 'playful'], 3, ['bag'], { exactAccessories: 3 }, ['y2k', 'sleaze', 'blokette', 'n4']),
  O('Beauty chair', 'hair and makeup, 6am', 'Ballet, soft, pretty. Something easy to pull over the head.', 2, ['ballet', 'soft', 'pretty'], 2, [], {}, ['ballet', 'coquette', 'n4']),
  O('Front row', 'row A, seat 4', 'Mob, bold, sleek. Sunglasses you do not take off.', 4, ['mob', 'bold', 'sleek'], 2, ['eyes', 'bag'], {}, ['mob', 'siren', 'n4']),
  O('The afterparty', 'a hotel bar, 1am', 'Glamorous, undone, nocturnal. Sequins and leather.', 4, ['glamorous', 'undone', 'nocturnal'], 2, [], {}, ['sleaze', 'siren', 'n4']),
  O('Chrome editorial', 'a mirrored set', 'Chrome, bold, minimal. One metal piece owns the frame.', 3, ['chrome', 'bold', 'minimal'], 2, [], { forbid: { prints: true } }, ['chrome', 'n4']),
  O('Garden editorial', 'a walled garden, a parasol', 'Coquette, soft, romantic. Florals and lace.', 3, ['coquette', 'soft', 'romantic'], 1, [], {}, ['coquette', 'boho', 'n4']),
  O('Noir editorial', 'one lamp, one shadow', 'Siren, dark, sharp. Velvet and leather.', 4, ['siren', 'dark', 'sharp'], 2, [], {}, ['siren', 'academia', 'n4']),
  O('Campaign shoot', 'a studio with expensive light', 'Clean, futuristic, polished. Technical and expensive.', 3, ['clean', 'futuristic', 'polished'], 2, [], {}, ['chrome', 'clean', 'n4']),
  O('Press day', 'a room of journalists', 'Polished, quiet, sleek. Photographed holding a glass.', 3, ['polished', 'quiet', 'sleek'], 2, ['bag'], {}, ['quiet', 'siren', 'n4']),
  O('The house archive', 'rails of the pieces that started it', 'Y2K, academia, quiet. Denim and knits.', 2, ['y2k', 'academia', 'quiet'], 3, [], {}, ['y2k', 'academia', 'n4']),
  O('Showroom appointment', 'a buyer with a clipboard', 'Academia, polished, classic. Tweed and a loafer.', 3, ['academia', 'polished', 'classic'], 3, ['bag'], {}, ['academia', 'quiet', 'n4']),
  O('Runway rehearsal', 'walk it twice', 'Ballet, clean, easy. Flats and a knit.', 1, ['ballet', 'clean', 'easy'], 2, [], { forbid: { heels: true } }, ['ballet', 'clean', 'n4']),
  O('Rooftop shoot', 'the wind is a stylist', 'Sporty, bold, fresh. Plan for the wind.', 2, ['sporty', 'bold', 'fresh'], 1, [], {}, ['blokette', 'y2k', 'n4']),
  O('Hotel suite shoot', 'room service on the bed', 'Glamorous, warm, romantic. Satin and velvet.', 4, ['glamorous', 'warm', 'romantic'], 2, [], {}, ['mob', 'siren', 'n4']),
  O('Awards night', 'a red carpet, a train', 'Glamorous, sleek, classic. Do not go under.', 6, ['glamorous', 'sleek', 'classic'], 2, ['bag'], { tolerance: 0 }, ['siren', 'mob', 'n4']),
  O('Cover try', 'one frame, a story', 'Bold, y2k, futuristic. Hot pink and chrome.', 3, ['bold', 'y2k', 'futuristic'], 2, [], {}, ['y2k', 'chrome', 'n4']),
  O('Finale walk', 'the last look', 'Sleek, sharp, clean. The look they remember.', 4, ['sleek', 'sharp', 'clean'], 2, [], {}, ['clean', 'siren', 'n4']),
  O('Model apartment', 'six girls, one bathroom', 'Easy, relaxed, clean. Off duty, on purpose.', 1, ['easy', 'relaxed', 'clean'], 2, [], {}, ['clean', 'y2k', 'n4']),
  O('The go-see', 'three agencies, one afternoon', 'Clean, sharp, easy. You will walk a lot.', 1, ['clean', 'sharp', 'easy'], 3, ['bag'], { forbid: { heels: true } }, ['clean', 'blokette', 'n4']),
  /* novel 5 · the dreamhouse */
  O('Dreamhouse move-in', 'pink boxes, a pink lift', 'Pretty, playful, easy. Pink, obviously.', 1, ['pretty', 'playful', 'easy'], 2, ['bag'], {}, ['coquette', 'clean', 'n5']),
  O('Dreamhouse pool', 'a slide you take seriously', 'Sporty, playful, bold. Hot pink on water.', 1, ['sporty', 'playful', 'bold'], 1, [], { forbid: { textures: ['fur', 'velvet', 'wool'] } }, ['y2k', 'blokette', 'n5']),
  O('The pink convertible', 'top down, hair up', 'Y2K, playful, sharp. A headscarf and sunglasses.', 2, ['y2k', 'playful', 'sharp'], 2, ['eyes'], {}, ['y2k', 'coquette', 'n5']),
  O('Closet tour', 'the walk-in, filmed', 'Coquette, quiet, polished. The closet is the point.', 3, ['coquette', 'quiet', 'polished'], 2, [], {}, ['coquette', 'quiet', 'n5']),
  O('Lawn tea party', 'a hat with a brim', 'Coquette, classic, pretty. Lace and polka dots.', 3, ['coquette', 'classic', 'pretty'], 1, ['head'], {}, ['coquette', 'ballet', 'n5']),
  O('Prom', 'a corsage, a limo', 'Glamorous, coquette, sleek. A heel you can dance in.', 5, ['glamorous', 'coquette', 'sleek'], 2, ['bag'], {}, ['coquette', 'siren', 'n5']),
  O('Sleepover', 'a pink bed, three friends', 'Soft, playful, relaxed. Knits, satin, socks with a ruffle.', 1, ['soft', 'playful', 'relaxed'], 3, ['hosiery'], {}, ['y2k', 'coquette', 'n5']),
  O('Dreamhouse beach', 'a basket, a stripe', 'Boho, playful, fresh. Hot pink on sand.', 1, ['boho', 'playful', 'fresh'], 1, ['bag'], {}, ['boho', 'y2k', 'n5']),
  O('Dreamhouse gala', 'gold on pink', 'Glamorous, bold, sleek. Sequins and a gown.', 6, ['glamorous', 'bold', 'sleek'], 2, ['bag'], { tolerance: 0 }, ['siren', 'coquette', 'n5']),
  O('Lawn wedding', 'not the bride', 'Coquette, pretty, polished. Not white.', 4, ['coquette', 'pretty', 'polished'], 1, ['bag'], { forbid: { colors: ['#FFFFFF', '#F3F0E8'] } }, ['coquette', 'boho', 'n5']),
  O('Ice rink', 'chrome on ice', 'Ballet, futuristic, playful. A skating skirt.', 2, ['ballet', 'futuristic', 'playful'], 4, [], {}, ['chrome', 'ballet', 'n5']),
  O('Pink tent', 'a camping trip, technically', 'Gorp, playful, soft. Technical and cute.', 1, ['gorp', 'playful', 'soft'], 3, ['outer'], {}, ['gorp', 'coquette', 'n5']),
  O('Ballet recital', 'a bun that holds', 'Ballet, soft, classic. Tulle and satin.', 3, ['ballet', 'soft', 'classic'], 2, [], {}, ['ballet', 'coquette', 'n5']),
  O('Rock show', 'a guitar you cannot play', 'Edgy, bold, undone. Leather and sequins.', 2, ['edgy', 'bold', 'undone'], 2, [], {}, ['sleaze', 'y2k', 'n5']),
  O('Space camp', 'the dreamhouse rocket', 'Futuristic, bold, playful. Chrome and moon boots.', 2, ['futuristic', 'bold', 'playful'], 2, [], {}, ['chrome', 'y2k', 'n5']),
  O('Horse show', 'the stables, a ribbon', 'Academia, classic, polished. Tweed and a boot.', 3, ['academia', 'classic', 'polished'], 3, [], {}, ['academia', 'boho', 'n5']),
  O('Career day', 'the dreamhouse office', 'Siren, polished, sharp. A pencil skirt and a plan.', 3, ['siren', 'polished', 'sharp'], 2, ['bag'], {}, ['siren', 'clean', 'n5']),
  O('Birthday', 'a cake you do not cut', 'Coquette, glamorous, playful. Satin and sequins.', 4, ['coquette', 'glamorous', 'playful'], 2, ['bag'], {}, ['coquette', 'siren', 'n5']),
  O('Movie night', 'the dreamhouse screen', 'Soft, relaxed, pretty. Cosy with a bow.', 1, ['soft', 'relaxed', 'pretty'], 3, [], {}, ['coquette', 'clean', 'n5']),
  O('Pink carpet', 'the premiere', 'Glamorous, bold, pretty. Pink from head to toe.', 5, ['glamorous', 'bold', 'pretty'], 2, ['bag'], {}, ['siren', 'coquette', 'n5']),
];

// show day: one finale per house
export const FINALES = {
  NUL: O('Show day', 'the white studio, front row', 'The basics in one look that still makes sense. Bring a bag.', 3, ['clean', 'quiet', 'polished'], 2, ['bag']),
  VESPER: O('Show day', 'the salon', 'A waist, a point, one bag. Polished and sharp.', 4, ['siren', 'polished', 'sharp'], 2, ['bag']),
  AURA: O('Show day', 'front row', 'Bows, pearls, tulle in one look that makes sense. Bring a bag.', 3, ['coquette', 'classic', 'polished'], 2, ['bag']),
  SOLENE: O('Show day', 'the private dinner', 'Glamorous, sleek, one hero. Do not go under the dress code.', 5, ['glamorous', 'sleek', 'bold'], 2, ['bag']),
  THORNE: O('Show day', 'the reading room, lights up', 'Academia, sharp, one tartan. Carry a book.', 3, ['academia', 'sharp', 'classic'], 3, []),
  KORI: O('Show day', 'the lab, lights off', 'Chrome, bold, minimal. No prints.', 3, ['chrome', 'bold', 'minimal'], 2, [], { forbid: { prints: true } }),
  HALO: O('Show day', 'the pitch, floodlit', 'Sporty, playful, sharp. Socks pulled up.', 1, ['sporty', 'playful', 'sharp'], 2, []),
  OXIDE: O('Show day', 'the crypt', 'Lace, a veil, a boot, a pearl. Bring a bag.', 4, ['fairy', 'romantic', 'bold'], 2, ['bag']),
  WILD: O('Show day', 'the field at dusk', 'Boho, soft, one western boot. Bring a bag.', 2, ['boho', 'soft', 'romantic'], 1, ['bag']),
  ARCHIVE: O('Show day', 'the street outside the show', 'Y2k, playful, sharp. A micro mini and an oversized layer.', 3, ['y2k', 'playful', 'sharp'], 2, ['bag']),
};

const hash = (str) => { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };

// eight levels for a generated chapter: seven occasions that fit the theme's aesthetics, one of them nudged to the
// theme's lead aesthetic as its first mood word, then the house's show day
const USED = new Map(); // novel -> Set of occasion indices already used, so no two chapters in a novel share a brief
export function genLevels(theme, chapterNo) {
  if (theme.pim && theme.levels) return theme.levels.map((l) => ({ ...l, pim: true }));
  const novel = Math.floor((chapterNo - 1) / 20) + 1;
  const used = USED.get(novel) || new Set();
  USED.set(novel, used);
  const scored = OCCASIONS.map((o, i) => {
    const nov = o.tags.find((t) => /^n\d$/.test(t));
    const s = (o.tags.includes(theme.aes[0]) ? 2 : 0) + (o.tags.includes(theme.aes[1]) ? 1 : 0) + (nov === `n${novel}` ? 1.6 : nov ? -0.8 : 0) + (used.has(i) ? -5 : 0) + (hash(`${chapterNo}:${i}`) % 100) / 100;
    return { o, i, s };
  });
  scored.sort((a, b) => b.s - a.s);
  const chosen = scored.slice(0, 7);
  for (const c of chosen) used.add(c.i);
  const picks = chosen.map((x) => x.o).sort((a, b) => a.formality - b.formality || hash(a.title + chapterNo) - hash(b.title + chapterNo));
  const levels = picks.map((o, i) => {
    const mood = [...o.mood];
    if (i === 2 || i === 5) mood[0] = theme.aes[0];
    if (i === 4) mood[0] = theme.aes[1];
    return { title: o.title, client: o.client, copy: o.copy, formality: o.formality, mood, weather: o.weather, required: o.required, ...o.extra };
  });
  const fin = FINALES[theme.house] || FINALES.NUL;
  levels.push({ title: `${fin.title}: ${theme.title}`, client: fin.client, copy: fin.copy, formality: fin.formality, mood: [...fin.mood], weather: fin.weather, required: fin.required, ...fin.extra });
  return levels;
}
export { hash as themeHash };
