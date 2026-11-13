// Five novels, twenty chapters each. Chapters 1–8 are written by hand in chapters.js; the rest are built here from a
// theme (place, house, two aesthetics, fabrics, a world to draw) and a library of occasion briefs. Deterministic.

export const NOVELS = [
  { id: 1, title: 'Arrival', line: 'You’ve just moved to the city to work as a stylist. Learn how to read a brief and dress for it.', cover: 'c1' },
  { id: 2, title: 'The Houses', line: 'Ten fashion houses invite you in, and each one has its own dress code.', cover: 'c2' },
  { id: 3, title: 'Season', line: 'You spend a year travelling, and every stop has its own style.', cover: 'c6' },
  { id: 4, title: 'Backstage', line: 'Castings, fittings, photo shoots and shows: the busy week that happens behind the scenes.', cover: 'c5' },
  { id: 5, title: 'Dreamhouse', line: 'A pink house, a pink car and a wardrobe to match. This is the big finale.', cover: 'c8' },
];

// [title, theme, line, world, house, aes1, aes2, swatches, cw, mat, print]
const T = (title, theme, line, world, house, a1, a2, sw, cw, mat, print = null) => ({ title, theme, line, world, house, aes: [a1, a2], swatches: sw, cw, mat, print });

// Pim's chapters: she is the one being dressed. Levels are handwritten; items for her carry pim: true.
const L = (title, client, copy, formality, mood, weather, required = [], extra = {}) => ({ title, client, copy, formality, mood, weather, required, ...extra });
const P = (title, theme, line, world, house, a1, a2, sw, cw, mat, print, levels) => ({ ...T(title, theme, line, world, house, a1, a2, sw, cw, mat, print), pim: true, levels });
const PIM_WEEK = P('Pim’s Week', 'seven days with a four-pound diva', 'Pim has a busy week ahead, and this time you’re dressing her.', 'c4', 'AURA', 'coquette', 'clean', ['cotton', 'satin', 'knit'], 'babyPink', 'satin', null, [
  L('Monday: the coffee run', 'Pim, carried', 'Pim is riding in the bag and she’d like to be noticed. Dress her in something easy and pretty. A collar is required.', 1, ['easy', 'pretty', 'clean'], 2, ['neck']),
  L('Tuesday: the vet, bravely', 'the vet, 10am', 'Pim is being brave at the vet. Dress her in something soft and quiet, with no bells. A collar is required.', 1, ['soft', 'clean', 'quiet'], 2, ['neck']),
  L('Wednesday: dog park politics', 'the park, the big dogs', 'Pim is meeting the big dogs at the park. Dress her sporty and playful, as if she might run.', 1, ['sporty', 'playful', 'easy'], 2, []),
  L('Thursday: rain on her ears', 'a wet pavement', 'It’s raining, and Pim has asked for a cute raincoat. A coat is required.', 1, ['polished', 'cool', 'fresh'], 3, ['outer']),
  L('Friday: the café terrace', 'under the table, mostly', 'Pim is spending the afternoon under a café table. Dress her in something pretty and relaxed. A collar is required.', 2, ['pretty', 'warm', 'relaxed'], 2, ['neck']),
  L('Saturday: she is three', 'her birthday', 'It’s Pim’s third birthday! Dress her in something soft with a bow, or even a tutu. Something on her head is required.', 3, ['coquette', 'soft', 'pretty'], 2, ['head']),
  L('Sunday: the groomer’s photo', 'a towel, a hairdryer, a ring light', 'The groomer is taking Pim’s photo for the wall. Make her look classic and polished. A collar and something on her head are required.', 3, ['classic', 'polished', 'clean'], 2, ['neck', 'head']),
  L('Pim at HALFTONE', 'Ro’s desk', 'Pim is visiting Ro’s office, where dogs aren’t really allowed. Dress her smartly and quietly, and bring a bag to carry her in.', 3, ['quietlux', 'sharp', 'polished'], 3, ['bag']),
]);
const PIM_HOUSES = P('Pim at the Houses', 'ten doors, one small dog', 'Pim visits the fashion houses, and each one has its own dress code for her to follow.', 'c2', 'AURA', 'coquette', 'siren', ['tweed', 'satin', 'fur'], 'babyPink', 'tweed', null, [
  L('Sainte Aura: the pearl fitting', 'the pearl room', 'Aurélie is fitting Pim for pearls. Keep her outfit classic and quiet. A collar or necklace is required.', 3, ['coquette', 'classic', 'quiet'], 2, ['neck']),
  L('Vesper: even a dog has a waist', 'the fitting room', 'Dido says that even a dog has a waist. Dress Pim in something sharp and polished, and bring one bag.', 3, ['siren', 'sharp', 'polished'], 2, ['bag']),
  L('Maison Solène: fur, obviously', 'the fur room', 'Pim is visiting the fur room. Choose one animal print, one metal and one standout piece. A collar is required.', 3, ['mob', 'bold', 'warm'], 4, ['neck']),
  L('Thorne & Co: library card', 'the reading room', 'Pim is visiting the library. Dress her smartly and quietly, with a beret. Something on her head is required.', 2, ['academia', 'sharp', 'quiet'], 3, ['head']),
  L('KŌRI: the visor', 'the materials lab', 'Pim is visiting the KŌRI lab. Keep her outfit simple and futuristic. A visor or glasses are required.', 2, ['chrome', 'minimal', 'futuristic'], 2, ['eyes']),
  L('Halo Sport: four socks', 'the running track', 'Pim is at the running track. Dress her sporty and playful, with no satin, sequins or velvet.', 1, ['sporty', 'playful', 'sharp'], 2, [], { forbid: { textures: ['satin', 'sequin', 'velvet'] } }),
  L('OXIDE: a very small cape', 'the basement', 'Pim is visiting the OXIDE basement. Dress her in something dark and romantic. A cape or coat is required.', 3, ['fairy', 'dark', 'romantic'], 2, ['outer']),
  L('The Houses Gala: plus one', 'the gala, under the table', 'Pim is your guest at the black-tie gala. Dress her glamorously and don’t dress below the dress code. Bring a bag.', 6, ['glamorous', 'sleek', 'classic'], 2, ['bag'], { tolerance: 0 }),
]);
const PIM_ABROAD = P('Pim Abroad', 'a year on the road, in a carrier', 'Pim spends a year travelling in her carrier, and she needs an outfit for every stop.', 'c6', 'WILD', 'boho', 'clean', ['cotton', 'canvas', 'knit'], 'butter', 'cotton', 'gingham', [
  L('Airport, in the carrier', 'gate 42', 'Pim is flying in her carrier. Dress her in something simple and comfortable, and bring a bag.', 1, ['clean', 'easy', 'minimal'], 2, ['bag']),
  L('Paris: a saucer of water', 'a café terrace', 'Pim is at a café in Paris. Dress her in something classic and soft, with a beret if she’ll allow it. Something on her head is required.', 2, ['coquette', 'classic', 'soft'], 2, ['head']),
  L('Amalfi: the boat', 'a boat she did not choose', 'Pim is on a boat in Amalfi. Dress her in fresh, sporty stripes, with no satin, sequins, velvet or fur.', 1, ['fresh', 'sporty', 'pretty'], 1, [], { forbid: { textures: ['satin', 'sequin', 'velvet', 'fur'] } }),
  L('Alpine: the snow', 'a village at altitude', 'Pim is in a snowy village. She needs a puffer coat and a beanie to stay warm. A coat and something on her head are required.', 1, ['gorp', 'polished', 'soft'], 4, ['outer', 'head']),
  L('Tokyo: the convenience store', '2am, fluorescent', 'Pim is in a Tokyo convenience store at 2am. Dress her in something bold and shiny. A visor or glasses are required.', 2, ['futuristic', 'bold', 'minimal'], 2, ['eyes']),
  L('Marrakesh: the riad', 'tiles, cushions, a fountain', 'Pim is relaxing in a riad in Marrakesh. Dress her in warm, romantic pieces such as velvet or a flower. Something on her head is required.', 2, ['boho', 'warm', 'romantic'], 3, ['head']),
  L('New York: the crosswalk', 'walking fast, carried faster', 'Pim is being carried through New York in a hurry. Dress her in something sleek and dark, and bring a bag.', 3, ['sleek', 'sharp', 'dark'], 3, ['bag']),
  L('Home again: the doorstep', 'your own door', 'Pim is home again. Dress her simply in one collar and one coat. Both are required.', 2, ['quiet', 'clean', 'polished'], 3, ['outer', 'neck']),
]);
const PIM_CAST = P('Pim Gets Cast', 'a dog with an agent', 'A casting director spotted Pim at a café, and now she’s a model.', 'c5', 'KORI', 'chrome', 'coquette', ['satin', 'nylon', 'sequin'], 'hotPink', 'satin', null, [
  L('The casting', 'a white room, forty dogs', 'Pim is at a casting with forty other dogs. Keep her outfit simple and sharp, with exactly one accessory.', 2, ['clean', 'sharp', 'minimal'], 2, [], { exactAccessories: 1 }),
  L('Fitting room 3', 'pins, a tape measure, patience', 'Pim has to stand still for a fitting. Dress her in something polished and sharp. A collar is required.', 3, ['quietlux', 'polished', 'sharp'], 2, ['neck']),
  L('Hair and makeup (ears)', 'the beauty chair', 'Pim is in the beauty chair. Dress her softly, with a bow and nothing shiny. Something on her head is required.', 2, ['ballet', 'soft', 'pretty'], 2, ['head']),
  L('The lookbook', 'every piece visible', 'Pim is modelling for a lookbook. Choose a few pretty, polished pieces that are easy to see on a small dog. A collar is required.', 3, ['pretty', 'quiet', 'polished'], 2, ['neck']),
  L('Street style, knee height', 'the photographers kneel', 'The photographers are kneeling down to photograph Pim. Dress her boldly, with exactly two accessories.', 3, ['bold', 'modern', 'playful'], 3, [], { exactAccessories: 2 }),
  L('Front row, on a lap', 'row A, someone’s knees', 'Pim is in the front row on someone’s lap. Dress her in bold, warm pieces such as fur. Sunglasses are required.', 3, ['mob', 'bold', 'warm'], 3, ['eyes']),
  L('The chrome editorial', 'a mirrored set', 'Pim is on a mirrored set. Make one metallic piece the star, with no prints.', 3, ['chrome', 'bold', 'minimal'], 2, [], { forbid: { prints: true } }),
  L('The campaign', 'the final frame', 'Pim is the face of the campaign. Dress her glamorously and bring a bag.', 5, ['glamorous', 'sleek', 'bold'], 2, ['bag']),
]);
const PIM_DREAM = P('Pim’s Dreamhouse', 'the pink house has a dog door', 'The pink house has a dog door, a pink bed and a pink bowl, all for Pim.', 'c4', 'AURA', 'coquette', 'y2k', ['satin', 'sequin', 'knit'], 'hotPink', 'satin', 'polka', [
  L('Move-in day', 'pink boxes, a pink lift', 'It’s moving day, and Pim is supervising from the bag. Dress her in something pretty and playful, and bring a bag.', 1, ['pretty', 'easy', 'playful'], 2, ['bag']),
  L('Pool party', 'the dreamhouse pool', 'Pim is at the pool party, although she doesn’t swim. Dress her sporty and playful, with no fur, velvet or wool. Sunglasses are required.', 1, ['sporty', 'playful', 'fresh'], 1, ['eyes'], { forbid: { textures: ['fur', 'velvet', 'wool'] } }),
  L('The convertible', 'the pink car, top down', 'Pim is riding in the pink convertible. Dress her in something playful, with a scarf to keep her ears warm. A collar or scarf is required.', 2, ['y2k', 'playful', 'sharp'], 2, ['neck']),
  L('Tea party on the lawn', 'tiny sandwiches, finally', 'Pim is at a tea party. Dress her in polka dots with a bow. Something on her head is required.', 3, ['coquette', 'classic', 'pretty'], 1, ['head']),
  L('Slumber party', 'the pink bed', 'Pim is at a slumber party. Dress her in soft, cosy knits with a bow.', 1, ['soft', 'relaxed', 'pretty'], 3, []),
  L('Prom', 'a corsage on a collar', 'It’s prom night for Pim. Dress her in a tutu or a gown, and a tiara wouldn’t be too much. Something on her head is required.', 5, ['glamorous', 'coquette', 'sleek'], 2, ['head']),
  L('Rock show', 'the dreamhouse stage', 'Pim is at a rock show. Dress her in leather with a chain. A collar is required.', 2, ['edgy', 'bold', 'undone'], 2, ['neck']),
  L('Dreamhouse gala: best in show', 'the last gala', 'Pim is at the dreamhouse gala, and it’s black tie. Dress her in sequins with one standout piece, and bring a bag to carry her in.', 6, ['glamorous', 'bold', 'sleek'], 2, ['bag'], { tolerance: 0 }),
]);

export const THEMES = [
  /* novel 1 · chapters 9–20 */
  T('Market Street', 'the saturday market', 'A busy Saturday market, where everyone carries a tote bag.', 'c1', 'NUL', 'quiet', 'clean', ['cotton', 'denim', 'canvas'], 'bone', 'cotton'),
  T('The Gallery', 'a private view', 'A private view at an art gallery, with concrete floors and quiet clothes.', 'c2', 'THORNE', 'academia', 'quiet', ['wool', 'tweed', 'leather'], 'forest', 'wool'),
  T('Night Bus', 'the last one home', 'The last bus home, where the bright lights show every detail of your outfit.', 'c3', 'OXIDE', 'sleaze', 'siren', ['leather', 'sheer', 'satin'], 'black', 'leather'),
  T('Rooftop Garden', 'a roof with tomatoes', 'A garden on a rooftop, full of ribbons, straw hats and sunshine.', 'c4', 'AURA', 'coquette', 'ballet', ['cotton', 'lace', 'satin'], 'babyPink', 'cotton', 'floral'),
  T('The Launch', 'a product launch', 'A product launch where everything is chrome and has clean lines.', 'c5', 'KORI', 'chrome', 'clean', ['nylon', 'metal', 'latex'], 'chrome', 'chrome'),
  T('Lido', 'the outdoor pool', 'A day at the outdoor pool, in stripes and things that can get splashed.', 'c6', 'HALO', 'blokette', 'clean', ['cotton', 'nylon', 'canvas'], 'sky', 'cotton', 'stripe'),
  T('Candle Shop', 'a shop that smells like church', 'A little shop full of candles, velvet and lace.', 'c7', 'OXIDE', 'fairy', 'academia', ['velvet', 'lace', 'sheer'], 'plum', 'velvet'),
  T('Block Party', 'the street, closed off', 'The street is closed for a party, and everyone is wearing denim.', 'c8', 'ARCHIVE', 'y2k', 'blokette', ['denim', 'nylon', 'knit'], 'hotPink', 'denim'),
  T('First Paycheck', 'you can buy one thing', 'Your first paycheck buys one special piece, and you build outfits around it.', 'c1', 'VESPER', 'siren', 'quiet', ['wool', 'satin', 'leather'], 'camel', 'wool'),
  PIM_WEEK,
  T('Opening Night', 'a theatre, red seats', 'A night at the theatre, in satin and a little sparkle.', 'c3', 'SOLENE', 'siren', 'mob', ['satin', 'sequin', 'fur'], 'cherry', 'satin'),
  T('Last Train Home', 'the platform at 1am', 'The last train home at 1am, when you need a warm coat and a bit of edge.', 'c3', 'OXIDE', 'sleaze', 'academia', ['leather', 'wool', 'sheer'], 'charcoal', 'leather'),
  /* novel 2 · chapters 21–40 */
  T('Sainte Aura: Pearls', 'the pearl room', 'Sainte Aura’s pearl room, where the house style is bouclé, pearls and bows.', 'c2', 'AURA', 'coquette', 'quiet', ['tweed', 'pearl', 'satin'], 'babyPink', 'tweed'),
  T('Vesper: The Fitting', 'the fitting room', 'The Vesper fitting room, where every outfit shows the waist and has strong shoulders.', 'c4', 'VESPER', 'siren', 'quiet', ['wool', 'satin', 'leather'], 'black', 'wool'),
  T('Maison Solène: Fur Room', 'the fur room', 'The fur room at Maison Solène, where you wear one animal print, one metal and one standout piece.', 'c3', 'SOLENE', 'mob', 'siren', ['fur', 'velvet', 'gold'], 'camel', 'fur', 'leopard'),
  T('Thorne & Co: Library', 'the reading room', 'The Thorne and Co. library, where people wear tartan and loafers and carry books.', 'c2', 'THORNE', 'academia', 'quiet', ['wool', 'tweed', 'leather'], 'burgundy', 'wool', 'plaid'),
  T('KŌRI: Lab', 'the materials lab', 'The KŌRI lab, where clothes are made from liquid metal and technical fabrics.', 'c5', 'KORI', 'chrome', 'gorp', ['metal', 'nylon', 'latex'], 'silver', 'chrome'),
  T('Halo Sport: Track', 'the running track', 'The Halo Sport running track, where the look is jerseys, pleats and pulled-up socks.', 'c8', 'HALO', 'blokette', 'clean', ['nylon', 'cotton', 'knit'], 'cobalt', 'nylon', 'stripe'),
  T('OXIDE: Basement', 'the basement studio', 'The OXIDE basement studio, where the look is leather, lace and heavy boots.', 'c7', 'OXIDE', 'sleaze', 'fairy', ['leather', 'lace', 'sheer'], 'black', 'leather'),
  T('Wild Heart: Ranch', 'the ranch', 'The Wild Heart ranch, where people wear denim, canvas and western boots.', 'c6', 'WILD', 'boho', 'clean', ['canvas', 'denim', 'leather'], 'rust', 'cotton', 'floral'),
  T('Archive 0: Flea', 'the flea market', 'The Archive 0 flea market, full of low-rise jeans and baby tees from 2003.', 'c8', 'ARCHIVE', 'y2k', 'sleaze', ['denim', 'knit', 'satin'], 'lightDenim', 'denim', 'logo'),
  PIM_HOUSES,
  T('Sainte Aura: Ribbons', 'the ribbon drawer', 'Sainte Aura’s ribbon drawer, full of satin and tulle.', 'c4', 'AURA', 'ballet', 'coquette', ['satin', 'lace', 'sheer'], 'rose', 'satin'),
  T('Vesper: Pencil', 'the pencil skirt floor', 'The Vesper office, where the pencil skirt is the star.', 'c5', 'VESPER', 'siren', 'chrome', ['wool', 'satin', 'metal'], 'charcoal', 'wool', 'pinstripe'),
  T('Maison Solène: Gold', 'the gold room', 'The gold room at Maison Solène, where sequins are worn at lunchtime.', 'c3', 'SOLENE', 'mob', 'siren', ['sequin', 'satin', 'gold'], 'gold', 'sequin'),
  T('Thorne & Co: Tartan', 'the tartan archive', 'The Thorne and Co. tartan archive, full of kilts, knee socks and knit polos.', 'c2', 'THORNE', 'academia', 'blokette', ['wool', 'tweed', 'knit'], 'forest', 'wool', 'plaid'),
  T('KŌRI: Orbit', 'the orbit collection', 'KŌRI’s Orbit collection mixes Y2K with chrome, in three colours at most.', 'c5', 'KORI', 'chrome', 'y2k', ['metal', 'latex', 'nylon'], 'ice', 'chrome'),
  T('Halo Sport: Finals', 'cup final', 'Cup final day with Halo Sport, where jerseys, scarves and socks become real outfits.', 'c6', 'HALO', 'blokette', 'y2k', ['cotton', 'nylon', 'knit'], 'white', 'cotton', 'stripe'),
  T('OXIDE: Crypt', 'the crypt show', 'The OXIDE show in the crypt, with lace, velvet and veils.', 'c7', 'OXIDE', 'fairy', 'sleaze', ['lace', 'velvet', 'sheer'], 'plum', 'lace'),
  T('Wild Heart: Festival', 'the festival field', 'A festival field with Wild Heart, full of prairie dresses and flower crowns.', 'c6', 'WILD', 'boho', 'fairy', ['cotton', 'lace', 'canvas'], 'butter', 'cotton', 'floral'),
  T('Archive 0: Y3K', 'the y3k drop', 'Archive 0 imagines Y2K fashion in the year 3000, with satin and chrome.', 'c8', 'ARCHIVE', 'y2k', 'chrome', ['satin', 'metal', 'denim'], 'hotPink', 'satin'),
  T('The Houses Gala', 'all ten houses, one room', 'All ten houses meet for a black-tie gala, the strictest night of the year.', 'c3', 'SOLENE', 'siren', 'mob', ['satin', 'velvet', 'gold'], 'black', 'satin'),
  /* novel 3 · chapters 41–60 */
  T('Paris, Early', 'a café at seven', 'Early mornings in Paris, with tweed, croissants and pearls.', 'c2', 'AURA', 'coquette', 'quiet', ['tweed', 'satin', 'pearl'], 'bone', 'tweed'),
  T('Lake House', 'a house on a lake', 'A house by a lake, where people wear gingham and cosy knits.', 'c6', 'WILD', 'boho', 'clean', ['cotton', 'canvas', 'knit'], 'sage', 'cotton', 'gingham'),
  T('Tokyo Night', 'a convenience store at 2am', 'Tokyo at 2am, lit by neon and full of nylon and chrome.', 'c5', 'KORI', 'chrome', 'y2k', ['nylon', 'metal', 'latex'], 'chrome', 'nylon'),
  T('Alpine', 'a mountain village', 'A village in the mountains, where technical jackets meet warm knits.', 'c6', 'HALO', 'gorp', 'clean', ['nylon', 'knit', 'wool'], 'white', 'nylon'),
  T('Desert Drive', 'a car with no roof', 'A drive through the desert in leather and denim.', 'c6', 'WILD', 'boho', 'sleaze', ['leather', 'canvas', 'denim'], 'rust', 'leather'),
  T('Milan Lunch', 'a long lunch', 'A long lunch in Milan, in camel colours and loafers.', 'c1', 'VESPER', 'siren', 'quiet', ['wool', 'satin', 'leather'], 'camel', 'wool'),
  T('Seoul Café', 'a dessert café', 'A dessert café in Seoul, full of pastels, knits and bows.', 'c4', 'AURA', 'coquette', 'clean', ['cotton', 'knit', 'satin'], 'babyPink', 'knit'),
  T('Amalfi', 'a terrace over the sea', 'A terrace above the sea in Amalfi, with lemons, linen and heeled sandals.', 'c6', 'WILD', 'boho', 'coquette', ['cotton', 'lace', 'canvas'], 'butter', 'cotton', 'floral'),
  T('Berlin Club', 'a club that opens at midnight', 'A club in Berlin that opens at midnight, where everyone wears black.', 'c3', 'OXIDE', 'sleaze', 'chrome', ['leather', 'latex', 'sheer'], 'black', 'latex'),
  T('Scottish Castle', 'a castle with a leak', 'A draughty Scottish castle, with tartan, velvet and a big fireplace.', 'c2', 'THORNE', 'academia', 'quiet', ['wool', 'tweed', 'velvet'], 'forest', 'tweed', 'plaid'),
  T('Ibiza Sunrise', 'a beach at 6am', 'Sunrise on a beach in Ibiza, in sheer white fabrics.', 'c6', 'ARCHIVE', 'y2k', 'fairy', ['sheer', 'satin', 'lace'], 'white', 'sheer'),
  T('New York Minute', 'a crosswalk', 'A busy New York street, where everyone wears sharp black clothes and walks fast.', 'c8', 'NUL', 'clean', 'siren', ['wool', 'leather', 'cotton'], 'black', 'wool'),
  T('Marrakesh', 'a riad', 'A riad in Marrakesh, with velvet, gold and warm colours.', 'c6', 'WILD', 'boho', 'mob', ['velvet', 'cotton', 'gold'], 'rust', 'velvet'),
  T('Ski Lodge', 'a lodge after the slopes', 'A ski lodge after a day on the slopes, with knits, fur and soft pinks.', 'c7', 'HALO', 'gorp', 'coquette', ['knit', 'fur', 'nylon'], 'babyPink', 'knit'),
  T('Venice Mask', 'a masked ball', 'A masked ball in Venice, with velvet, lace and veils.', 'c7', 'SOLENE', 'mob', 'fairy', ['velvet', 'lace', 'sequin'], 'plum', 'velvet'),
  T('LA Pool', 'a pool in the hills', 'A pool in the Los Angeles hills, with hot pink and sunglasses.', 'c1', 'ARCHIVE', 'y2k', 'clean', ['cotton', 'latex', 'satin'], 'hotPink', 'cotton'),
  PIM_ABROAD,
  T('Sydney Beach', 'a surf beach', 'A surf beach in Sydney, where the look is sporty with a cap and a tote.', 'c6', 'HALO', 'blokette', 'boho', ['cotton', 'canvas', 'nylon'], 'sky', 'cotton'),
  T('Vienna Ball', 'a ballroom with a quartet', 'A ballroom in Vienna, with satin gowns and pearls.', 'c3', 'SOLENE', 'siren', 'coquette', ['satin', 'sequin', 'pearl'], 'ice', 'satin'),
  T('Home Again', 'your own doorstep', 'You’re back home, with the simple wardrobe you love most.', 'c1', 'NUL', 'quiet', 'clean', ['cotton', 'knit', 'wool'], 'bone', 'knit'),
  /* novel 4 · chapters 61–80 */
  T('Casting Call', 'a white room, forty girls', 'A casting with forty other models, where a simple, sharp outfit gets you noticed.', 'c1', 'NUL', 'clean', 'siren', ['cotton', 'wool', 'leather'], 'white', 'cotton'),
  T('Fitting Room 3', 'the fitting room', 'Hours in the fitting room, with pins in your sleeves.', 'c4', 'VESPER', 'siren', 'quiet', ['wool', 'satin', 'leather'], 'charcoal', 'wool'),
  T('The Lookbook', 'a lookbook shoot', 'A lookbook shoot, where every piece has to be easy to see.', 'c2', 'AURA', 'coquette', 'quiet', ['satin', 'lace', 'pearl'], 'rose', 'satin'),
  T('Street Style', 'outside the show', 'The street outside the show, where photographers wait for great outfits.', 'c8', 'ARCHIVE', 'y2k', 'sleaze', ['denim', 'leather', 'knit'], 'lightDenim', 'denim'),
  T('Hair & Makeup', 'the beauty chair', 'The beauty chair, with soft ballet colours and bows.', 'c4', 'AURA', 'ballet', 'coquette', ['satin', 'cotton', 'lace'], 'lavender', 'satin'),
  T('Front Row', 'the front row', 'The front row at the show, in fur and sunglasses.', 'c3', 'SOLENE', 'mob', 'siren', ['fur', 'satin', 'gold'], 'cherry', 'fur'),
  T('The Afterparty', 'the afterparty', 'The afterparty, where sequins meet leather.', 'c3', 'OXIDE', 'sleaze', 'siren', ['leather', 'sequin', 'sheer'], 'black', 'sequin'),
  T('Editorial: Chrome', 'a chrome editorial', 'A magazine shoot built around metal and shine.', 'c5', 'KORI', 'chrome', 'siren', ['metal', 'latex', 'satin'], 'silver', 'chrome'),
  T('Editorial: Garden', 'a garden editorial', 'A magazine shoot in a garden, with florals, lace and a parasol.', 'c4', 'AURA', 'coquette', 'boho', ['cotton', 'lace', 'satin'], 'babyPink', 'cotton', 'floral'),
  T('Editorial: Noir', 'a noir editorial', 'A dramatic magazine shoot in velvet, leather and shadow.', 'c7', 'OXIDE', 'siren', 'academia', ['velvet', 'leather', 'sheer'], 'black', 'velvet'),
  T('Campaign Day', 'the campaign shoot', 'The big campaign shoot, with clean, technical pieces.', 'c5', 'KORI', 'chrome', 'clean', ['nylon', 'metal', 'cotton'], 'ice', 'nylon'),
  PIM_CAST,
  T('The Archive', 'the house archive', 'The house archive, full of the denim and knits that started it all.', 'c8', 'ARCHIVE', 'y2k', 'academia', ['denim', 'knit', 'tweed'], 'denim', 'denim'),
  T('Showroom', 'the showroom', 'The showroom, where buyers come to see tweed and loafers.', 'c2', 'THORNE', 'academia', 'quiet', ['tweed', 'wool', 'leather'], 'camel', 'tweed'),
  T('Runway Rehearsal', 'the rehearsal', 'The rehearsal before the show, in ballet flats and knits.', 'c4', 'AURA', 'ballet', 'clean', ['cotton', 'knit', 'satin'], 'white', 'knit'),
  T('Shoot: Rooftop', 'a rooftop shoot', 'A sporty photo shoot on a windy rooftop.', 'c8', 'HALO', 'blokette', 'y2k', ['nylon', 'cotton', 'denim'], 'cobalt', 'nylon', 'stripe'),
  T('Shoot: Hotel', 'a hotel suite', 'A photo shoot in a hotel suite, in satin and velvet.', 'c3', 'SOLENE', 'mob', 'siren', ['satin', 'velvet', 'gold'], 'burgundy', 'satin'),
  T('Awards Night', 'an awards night', 'An awards night with sequins, long gowns and a strict dress code.', 'c3', 'SOLENE', 'siren', 'mob', ['sequin', 'satin', 'gold'], 'black', 'sequin'),
  T('Cover Story', 'the cover try', 'The magazine cover shoot, in hot pink and chrome.', 'c5', 'ARCHIVE', 'y2k', 'chrome', ['satin', 'metal', 'denim'], 'hotPink', 'satin'),
  T('Finale', 'the season finale', 'The season finale, in sharp black outfits that people remember.', 'c8', 'NUL', 'clean', 'siren', ['wool', 'leather', 'satin'], 'black', 'wool'),
  /* novel 5 · chapters 81–100 */
  T('Move-in Day', 'the dreamhouse, keys in hand', 'Moving day at the dreamhouse, where even the boxes are pink.', 'c1', 'AURA', 'coquette', 'clean', ['cotton', 'satin', 'knit'], 'babyPink', 'cotton'),
  T('Pool Party', 'the dreamhouse pool', 'A pool party at the dreamhouse, in hot pink.', 'c6', 'HALO', 'y2k', 'blokette', ['cotton', 'latex', 'nylon'], 'hotPink', 'cotton'),
  T('Convertible', 'the pink car', 'A drive in the pink convertible, with a headscarf and sunglasses.', 'c1', 'ARCHIVE', 'y2k', 'coquette', ['satin', 'denim', 'leather'], 'hotPink', 'satin'),
  T('Closet Tour', 'the walk-in', 'A tour of the walk-in wardrobe, full of satin, tweed and pearls.', 'c4', 'AURA', 'coquette', 'quiet', ['satin', 'tweed', 'pearl'], 'babyPink', 'satin'),
  T('Tea Party', 'a tea party on the lawn', 'A tea party on the lawn, with lace, polka dots and big hats.', 'c4', 'AURA', 'coquette', 'ballet', ['lace', 'satin', 'cotton'], 'rose', 'lace', 'polka'),
  T('Prom', 'prom night', 'Prom night, with satin dresses and heels you can dance in.', 'c3', 'SOLENE', 'coquette', 'siren', ['satin', 'sequin', 'pearl'], 'babyPink', 'satin'),
  T('Slumber Party', 'a sleepover', 'A sleepover in cosy knits, satin and ruffled socks.', 'c7', 'ARCHIVE', 'y2k', 'coquette', ['knit', 'satin', 'cotton'], 'lavender', 'knit', 'polka'),
  T('Beach Day', 'the dreamhouse beach', 'A day at the dreamhouse beach, in stripes and hot pink.', 'c6', 'WILD', 'boho', 'y2k', ['cotton', 'canvas', 'latex'], 'hotPink', 'cotton', 'stripe'),
  T('The Gala', 'the dreamhouse gala', 'The dreamhouse gala, with sequins, gowns and gold.', 'c3', 'SOLENE', 'siren', 'coquette', ['sequin', 'satin', 'gold'], 'hotPink', 'sequin'),
  T('Garden Wedding', 'a wedding on the lawn', 'A wedding on the lawn, with lace and florals for the guests.', 'c4', 'AURA', 'coquette', 'boho', ['lace', 'satin', 'cotton'], 'white', 'lace', 'floral'),
  T('Ice Rink', 'the rink', 'An afternoon at the ice rink, in knits, skating skirts and a little chrome.', 'c5', 'KORI', 'chrome', 'ballet', ['knit', 'satin', 'metal'], 'ice', 'knit'),
  PIM_DREAM,
  T('Ballet Recital', 'the recital', 'A ballet recital, with tulle, satin and neat buns.', 'c4', 'AURA', 'ballet', 'coquette', ['sheer', 'satin', 'knit'], 'lilacGrey', 'sheer'),
  T('Rock Show', 'the dreamhouse stage', 'A rock show on the dreamhouse stage, in leather and sequins.', 'c7', 'OXIDE', 'sleaze', 'y2k', ['leather', 'sequin', 'denim'], 'hotPink', 'leather'),
  T('Space Camp', 'the dreamhouse rocket', 'A trip to space camp, in chrome and moon boots.', 'c5', 'KORI', 'chrome', 'y2k', ['metal', 'latex', 'nylon'], 'silver', 'chrome'),
  T('Horse Show', 'the stables', 'A horse show at the stables, in tweed and tall boots.', 'c2', 'THORNE', 'academia', 'boho', ['tweed', 'leather', 'cotton'], 'camel', 'tweed'),
  T('Career Day', 'the dreamhouse office', 'Career day at the dreamhouse office, in a pink pencil skirt.', 'c1', 'VESPER', 'siren', 'clean', ['wool', 'satin', 'leather'], 'babyPink', 'wool'),
  T('Birthday', 'the birthday', 'A big birthday party, in satin and sequins.', 'c3', 'AURA', 'coquette', 'siren', ['satin', 'sequin', 'lace'], 'hotPink', 'satin'),
  T('Dreamhouse Gala', 'the last gala', 'The last gala at the dreamhouse, where you use everything you’ve learned.', 'c3', 'SOLENE', 'siren', 'mob', ['sequin', 'satin', 'gold'], 'hotPink', 'sequin'),
  T('Forever', 'the end credits', 'The final chapter, in white and pearls that never go out of style.', 'c1', 'NUL', 'clean', 'coquette', ['cotton', 'satin', 'pearl'], 'white', 'satin'),
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
  O('Coffee and a walk', 'your street, early', 'You’re getting a coffee and going for a walk. Wear something light and comfortable.', 1, ['easy', 'fresh', 'clean'], 2, [], {}, ['clean', 'quiet']),
  O('Errands that matter', 'the post office, then lunch', 'You have errands to run and you might bump into someone you know. Keep it neat and simple, and bring a bag.', 1, ['clean', 'easy', 'quiet'], 2, ['bag'], {}, ['clean', 'quiet']),
  O('Brunch with the group', 'a table for six', 'Brunch with five friends, and one of them always takes photos. Wear something pretty and relaxed, and bring a bag.', 2, ['pretty', 'relaxed', 'fresh'], 2, ['bag'], {}, ['coquette', 'boho', 'clean']),
  O('A date that might be one', 'a wine bar, low light', 'It might be a date, and the wine bar is dimly lit. Wear something sleek in dark colours, and carry a small bag.', 3, ['sleek', 'romantic', 'dark'], 2, ['bag'], {}, ['siren', 'mob']),
  O('The interview', 'a glass office', 'A job interview in a smart office. Look polished and sharp, with one detail that shows your personality. Bring a bag.', 3, ['polished', 'sharp', 'modern'], 3, ['bag'], {}, ['siren', 'quiet', 'clean']),
  O('Gallery night', 'an art gallery', 'An evening at an art gallery. Quiet, polished clothes look best next to the art. Bring a bag.', 3, ['quiet', 'polished', 'warm'], 3, ['bag'], {}, ['quiet', 'academia']),
  O('Dinner, tablecloths', 'a restaurant with a wine list', 'Dinner at a smart restaurant. Dress in a classic, polished way and carry one good bag.', 3, ['classic', 'polished', 'soft'], 3, ['bag'], {}, ['quiet', 'siren', 'coquette']),
  O('The gig', 'a venue with a sticky floor', 'A concert in a small, crowded venue. Wear something with a bit of edge that you can move around in.', 2, ['edgy', 'easy', 'undone'], 2, [], {}, ['sleaze', 'fairy']),
  O('Match day', 'the stands', 'You’ll be on your feet in the stands for four hours. Dress sporty and comfortable, with no satin, sequins or velvet.', 1, ['sporty', 'playful', 'easy'], 2, [], { forbid: { textures: ['satin', 'sequin', 'velvet'] } }, ['blokette']),
  O('Picnic', 'a blanket on grass', 'A picnic on the grass. Look pretty without trying too hard, with ribbons instead of logos.', 2, ['pretty', 'soft', 'fresh'], 1, [], {}, ['coquette', 'boho', 'ballet']),
  O('Rain, still going', 'a wet afternoon', 'It’s raining, and you still have places to be. Wear something tailored in cool colours. A coat is required.', 2, ['tailored', 'cool', 'polished'], 3, ['outer'], {}, ['quiet', 'academia']),
  O('The cocktail hour', 'a bar with a dress code', 'Cocktails at a bar with a dress code. Go glamorous and sleek, with one thing that catches the light. Bring a bag.', 4, ['glamorous', 'sleek', 'dark'], 2, ['bag'], {}, ['siren', 'mob']),
  O('Garden party', 'a lawn and a quartet', 'A garden party on a sunny lawn. Look pretty and polished. A full skirt would be perfect. Bring a bag.', 3, ['pretty', 'polished', 'fresh'], 1, ['bag'], {}, ['coquette', 'ballet']),
  O('Studio day', 'a creative office', 'A day in a creative office where everyone notices shoes. Dress in a modern, relaxed way and bring a bag.', 2, ['modern', 'relaxed', 'polished'], 3, ['bag'], {}, ['clean', 'quiet', 'chrome']),
  O('Library hours', 'a reading room', 'An afternoon in a reading room. Wear darker, smart pieces such as loafers and a blazer, and carry a book.', 2, ['academia', 'sharp', 'quiet'], 3, [], {}, ['academia']),
  O('Pilates, then errands', 'a Tuesday morning', 'Pilates class first, then errands. Go for a slicked-back bun, gold hoops and nothing loud.', 1, ['clean', 'minimal', 'fresh'], 2, [], {}, ['clean']),
  O('Wedding guest', 'a vineyard, warm', 'You’re a guest at a warm outdoor wedding. Look pretty and polished, and don’t wear white or cream. Bring a bag.', 4, ['pretty', 'polished', 'fresh'], 1, ['bag'], { forbid: { colors: ['#FFFFFF', '#F3F0E8'] } }, ['coquette', 'boho', 'siren']),
  O('Black tie', 'a gala with a seating plan', 'Black tie is the strictest dress code there is, so you need a full-length gown. Bring a bag.', 6, ['glamorous', 'sleek', 'classic'], 2, ['bag'], { tolerance: 0 }, ['siren', 'mob']),
  O('After-party', 'someone’s kitchen, 2am', 'A late party in someone’s kitchen. Wear relaxed layers, as if you didn’t plan the outfit.', 2, ['undone', 'edgy', 'nocturnal'], 2, [], {}, ['sleaze', 'siren']),
  O('Rooftop drinks', 'sunset, windy', 'Drinks on a windy rooftop at sunset. Dress up, and choose things that won’t blow around. Bring a bag.', 4, ['glamorous', 'fresh', 'bold'], 1, ['bag'], {}, ['siren', 'boho']),
  O('The shoot', 'a photo studio', 'A photo shoot in a studio. Choose one bold idea and follow it from head to toe. Bring a bag.', 3, ['bold', 'modern', 'sharp'], 3, ['bag'], {}, ['chrome', 'siren', 'y2k']),
  O('Street style', 'outside the show', 'Dress for the photographers outside the show. Be bold, and wear exactly three accessories. Bring a bag.', 3, ['bold', 'modern', 'playful'], 3, ['bag'], { exactAccessories: 3 }, ['y2k', 'sleaze', 'blokette']),
  O('Tea room', 'a tea room', 'Afternoon tea with tiny sandwiches. Wear something pretty and classic with pearls or a bow, and nothing else shiny.', 3, ['classic', 'pretty', 'quiet'], 2, [], {}, ['coquette', 'quiet']),
  O('The fitting', 'an atelier', 'A fitting at a fashion house. Wear something quiet and polished that shows your waist. Bring a bag.', 3, ['quietlux', 'polished', 'sharp'], 3, ['bag'], {}, ['quiet', 'siren']),
  O('Market morning', 'a port town, 9am', 'A morning at the market by the port. Dress light and easy, and bring a bag for the lemons.', 1, ['fresh', 'easy', 'pretty'], 1, ['bag'], {}, ['boho', 'clean', 'coquette']),
  O('Boat day', 'a friend’s boat', 'A day out on a boat. Dress sporty but chic in clean, simple pieces. Flat shoes only.', 1, ['clean', 'fresh', 'minimal'], 1, [], { forbid: { heels: true } }, ['clean', 'blokette']),
  O('Flea market', 'a Sunday flea market', 'A Sunday at the flea market. Wear something soft and romantic, with a flower in your hair.', 2, ['boho', 'soft', 'romantic'], 2, [], {}, ['boho', 'fairy']),
  O('Candlelit bar', 'a bar lit by candles', 'A bar lit only by candles. Wear dark, romantic pieces such as lace or velvet.', 3, ['romantic', 'dark', 'edgy'], 2, [], {}, ['fairy', 'sleaze', 'siren']),
  O('Masquerade', 'a masked ball', 'A masked ball. Dress glamorously in dark colours. A veil or hair piece is required.', 5, ['glamorous', 'dark', 'romantic'], 2, ['hairAcc'], {}, ['fairy', 'mob']),
  O('Chrome launch', 'a launch in a car park', 'A launch party in a car park. Wear one metallic piece and keep everything else matte. Something metallic is required.', 3, ['futuristic', 'bold', 'minimal'], 2, [], { mustTexture: 'metal' }, ['chrome']),
  O('Cup final', 'the cup final', 'It’s the cup final. Wear a jersey with a pleated skirt and style it so it looks like an outfit.', 1, ['sporty', 'playful', 'sharp'], 2, [], {}, ['blokette']),
  O('Campus day', 'a college campus', 'A day on campus. Try a tiny cardigan with a mini skirt for a playful Y2K look.', 2, ['y2k', 'pretty', 'playful'], 2, [], {}, ['y2k', 'coquette']),
  O('Awards after-party', 'after the awards', 'The party after an awards show. Wear a gown with trainers so it’s glamorous and comfortable.', 4, ['glamorous', 'easy', 'bold'], 2, [], {}, ['siren', 'y2k']),
  O('Hotel bar, closing', 'the hotel bar', 'The hotel bar at the end of a glamorous night. Stay dressed up, but look relaxed.', 4, ['glamorous', 'undone', 'nocturnal'], 2, [], {}, ['siren', 'mob']),
  O('Gorp to gallery', 'a private view in the rain', 'It’s raining and you’re going to a gallery. Wear a technical raincoat and make the rest polished. A coat is required.', 1, ['gorp', 'polished', 'minimal'], 4, ['outer'], {}, ['gorp', 'clean']),
  O('Ballet class', 'a studio with a barre', 'Dress like a dancer at rehearsal, in soft pieces such as wrap knits and tulle.', 2, ['ballet', 'soft', 'pretty'], 2, [], {}, ['ballet', 'coquette']),
  O('Dinner by the water', 'white tablecloths, sea air', 'A romantic dinner by the sea. Look polished, with heeled sandals. Bring a bag.', 4, ['polished', 'romantic', 'fresh'], 1, ['bag'], {}, ['boho', 'siren', 'coquette']),
  O('Trattoria lunch', 'a terrace in the sun', 'Lunch on a sunny terrace. Wear something pretty with a touch of red.', 2, ['pretty', 'warm', 'playful'], 1, [], {}, ['boho', 'coquette']),
  O('Forest rave', 'a rave in the woods', 'A party in the woods. Layer mesh under lace and keep it soft and a little messy.', 1, ['fairy', 'undone', 'soft'], 2, [], {}, ['fairy', 'sleaze']),
  O('Brunch in fur', 'Sunday, 1pm', 'A glamorous brunch with fur, gold and sunglasses. Choose one standout piece and bring a bag.', 3, ['mob', 'bold', 'warm'], 4, ['bag'], {}, ['mob']),
  O('Office, future', 'a mirrored office', 'Imagine office clothes from the future. Keep the outfit sharp and bring a bag.', 3, ['siren', 'futuristic', 'sharp'], 2, ['bag'], {}, ['siren', 'chrome']),
  O('The sheer blouse', 'a gallery dinner', 'A gallery dinner. Wear something sheer with confidence and keep the rest sleek. Something sheer is required, and so is a bag.', 4, ['siren', 'sleek', 'dark'], 2, ['bag'], { mustTexture: 'sheer' }, ['siren', 'fairy']),
  O('Pearls and combat', 'a gothic photo shoot', 'Wear pearls with combat boots, so a dressy piece meets a tough one. Keep the colours dark.', 3, ['edgy', 'classic', 'dark'], 3, [], {}, ['fairy', 'sleaze', 'academia']),
  O('Birthday at the dive bar', 'a friend’s birthday', 'A friend’s birthday at a dive bar. Dress up a little, in something you can dance in.', 2, ['edgy', 'feminine', 'easy'], 2, [], {}, ['sleaze', 'coquette']),

  /* novel 1 · the city, everyday */
  O('The farmers’ market', 'the farmers’ market', 'A morning at the farmers’ market. Keep it simple and fresh, and bring a bag for the vegetables.', 1, ['clean', 'easy', 'fresh'], 2, ['bag'], {}, ['clean', 'quiet', 'boho', 'n1']),
  O('First flat viewing', 'a flat viewing', 'You’re viewing a flat and the landlord is deciding whether to trust you. Look tidy and polished, and bring a bag.', 2, ['polished', 'quiet', 'classic'], 3, ['bag'], {}, ['quiet', 'clean', 'n1']),
  O('The late shift', 'a bar, closing time', 'You’re working the late shift at a bar. Wear something dark and comfortable with a bit of edge.', 1, ['edgy', 'easy', 'dark'], 2, [], {}, ['sleaze', 'siren', 'n1']),
  O('Night bus home', 'the top deck, 1am', 'The last bus home at 1am. Dress warmly in relaxed layers. A coat is required.', 1, ['nocturnal', 'undone', 'cool'], 3, ['outer'], {}, ['sleaze', 'academia', 'n1']),
  O('Rooftop, someone’s birthday', 'a roof with fairy lights', 'A birthday party on a rooftop with fairy lights. Wear something pretty and playful that can handle a breeze.', 2, ['pretty', 'playful', 'fresh'], 1, [], {}, ['coquette', 'boho', 'n1']),
  O('The product launch', 'a launch party', 'A launch party for a new product. Look modern and sharp, with one chrome detail. Bring a bag.', 3, ['modern', 'minimal', 'sharp'], 2, ['bag'], {}, ['chrome', 'clean', 'n1']),
  O('Lido morning', 'the outdoor pool, 8am', 'An early swim at the outdoor pool. Dress sporty and fresh, in things that can get splashed. No satin, sequins or velvet.', 1, ['sporty', 'fresh', 'clean'], 1, [], { forbid: { textures: ['satin', 'sequin', 'velvet'] } }, ['blokette', 'clean', 'n1']),
  O('Candle shop Saturday', 'a candle shop', 'A Saturday in a candle shop that smells of incense. Wear soft, dark pieces. Velvet would be perfect.', 2, ['romantic', 'dark', 'soft'], 3, [], {}, ['fairy', 'academia', 'n1']),
  O('Block party', 'the street, closed off', 'The street is closed for a party and everyone is in denim. Make yours playful and bold.', 1, ['playful', 'bold', 'easy'], 2, [], {}, ['y2k', 'blokette', 'n1']),
  O('Payday, one good thing', 'a shop with a doorbell', 'It’s payday, so treat yourself to one special piece. Make it the star and keep the rest polished. Bring a bag.', 3, ['quietlux', 'polished', 'sharp'], 2, ['bag'], {}, ['siren', 'quiet', 'n1']),
  O('Opening night', 'a theatre, red seats', 'Opening night at the theatre. Dress glamorously in dark colours, with one thing that sparkles. Bring a bag.', 4, ['glamorous', 'classic', 'dark'], 2, ['bag'], {}, ['siren', 'mob', 'n1']),
  O('Last train', 'platform 4, 00:52', 'You’re waiting for the last train on a cold platform. Wear relaxed layers with a bit of edge. A coat is required.', 1, ['edgy', 'cool', 'undone'], 3, ['outer'], {}, ['sleaze', 'academia', 'n1']),
  O('Launderette Sunday', 'the launderette', 'Sunday at the launderette. Wear something clean, soft and comfortable.', 1, ['clean', 'soft', 'easy'], 2, [], {}, ['clean', 'quiet', 'n1']),
  O('The pub quiz', 'a corner table, four friends', 'A quiz night with four friends. Wear something relaxed and cosy, such as a nice knit.', 1, ['relaxed', 'warm', 'easy'], 3, [], {}, ['academia', 'quiet', 'boho', 'n1']),
  O('Bookshop reading', 'a bookshop', 'An author is reading at the bookshop. Wear something quiet and bookish, and carry the book.', 2, ['academia', 'quiet', 'soft'], 3, [], {}, ['academia', 'n1']),
  O('Sunday roast at hers', 'a friend’s family home', 'Sunday lunch at a friend’s family home. Wear something classic and soft that her parents would like.', 2, ['classic', 'soft', 'warm'], 3, [], {}, ['quiet', 'coquette', 'n1']),
  O('Running club', 'a bridge at 7am', 'Running club meets on the bridge at 7am. Dress sporty and fresh, and wear your best socks.', 1, ['sporty', 'clean', 'fresh'], 2, [], {}, ['blokette', 'clean', 'n1']),
  O('Karaoke basement', 'a karaoke bar', 'A karaoke night with friends. Be playful and bold. Sequins are welcome.', 2, ['playful', 'bold', 'undone'], 2, [], {}, ['y2k', 'sleaze', 'n1']),
  /* novel 2 · the houses */
  O('Pearl room appointment', 'Sainte Aura, by invitation', 'An appointment at Sainte Aura. Wear the house favourites, which are bouclé, a pearl and a bow. Bring a bag.', 3, ['coquette', 'classic', 'quiet'], 2, ['bag'], {}, ['coquette', 'quiet', 'n2']),
  O('The Vesper fitting', 'a room with three mirrors', 'A fitting at Vesper in a room with three mirrors. Show your waist and keep it polished. Bring a bag.', 3, ['siren', 'polished', 'sharp'], 2, ['bag'], {}, ['siren', 'quiet', 'n2']),
  O('Fur room, Maison Solène', 'Maison Solène', 'Vesna is showing you the fur room. Choose one animal print and one metal, and bring a bag.', 3, ['mob', 'bold', 'warm'], 4, ['bag'], {}, ['mob', 'n2']),
  O('Thorne reading room', 'the house library', 'A visit to the Thorne library. Dress smartly and classically, with tartan somewhere.', 3, ['academia', 'classic', 'sharp'], 3, [], {}, ['academia', 'n2']),
  O('KŌRI lab tour', 'the KŌRI lab', 'A tour of the KŌRI lab. Keep the outfit simple and futuristic, with no prints.', 2, ['chrome', 'minimal', 'futuristic'], 2, [], { forbid: { prints: true } }, ['chrome', 'n2']),
  O('Halo track day', 'the running track', 'A day at the running track with Halo Sport. Dress sporty and sharp, with your socks pulled up.', 1, ['sporty', 'sharp', 'playful'], 2, [], {}, ['blokette', 'n2']),
  O('OXIDE basement show', 'a basement studio', 'A show in the OXIDE basement. Wear dark, romantic pieces with heavy boots.', 2, ['edgy', 'dark', 'romantic'], 2, [], {}, ['sleaze', 'fairy', 'n2']),
  O('Wild Heart ranch', 'a ranch', 'A visit to the Wild Heart ranch. Keep it relaxed, and wear western boots if you have them.', 1, ['boho', 'warm', 'easy'], 2, [], {}, ['boho', 'n2']),
  O('Archive 0 flea', 'a vintage stall', 'Archive 0 is selling vintage from 2003. Try low-rise jeans and a baby tee.', 1, ['y2k', 'playful', 'undone'], 2, [], {}, ['y2k', 'sleaze', 'n2']),
  O('NUL white studio', 'an empty white studio', 'A session in an empty white studio. Wear simple basics that fit perfectly.', 2, ['clean', 'minimal', 'quiet'], 2, [], {}, ['clean', 'quiet', 'n2']),
  O('House dinner', 'a long table, ten houses', 'A dinner where all ten houses share one long table. Look polished and classic, without logos. Bring a bag.', 4, ['polished', 'classic', 'sleek'], 2, ['bag'], {}, ['quiet', 'siren', 'coquette', 'n2']),
  O('Atelier open day', 'the atelier', 'The atelier is open to visitors today. Look polished and modern, and bring a bag.', 2, ['polished', 'modern', 'quiet'], 3, ['bag'], {}, ['quiet', 'clean', 'academia', 'n2']),
  O('The ribbon drawer', 'Sainte Aura, the archive', 'A visit to the Sainte Aura archive. Wear soft, pretty pieces and put a ribbon in your hair. A hair piece is required.', 2, ['ballet', 'soft', 'pretty'], 2, ['hairAcc'], {}, ['ballet', 'coquette', 'n2']),
  O('Pencil skirt floor', 'Vesper, the office', 'A day at the Vesper office. Wear a pencil skirt and keep the outfit sharp. Bring a bag.', 3, ['siren', 'sharp', 'modern'], 2, ['bag'], {}, ['siren', 'n2']),
  O('Gold room lunch', 'Maison Solène, 1pm', 'Lunch in the gold room at Maison Solène. Dress glamorously, and sequins are welcome even at lunchtime. Bring a bag.', 3, ['glamorous', 'warm', 'bold'], 2, ['bag'], {}, ['mob', 'siren', 'n2']),
  O('Tartan archive', 'Thorne, the attic', 'A visit to the Thorne attic. Try a kilt with knee socks and a knit polo. Socks or tights are required.', 2, ['academia', 'playful', 'sharp'], 3, ['hosiery'], {}, ['academia', 'blokette', 'n2']),
  O('Orbit preview', 'KŌRI, lights off', 'A first look at KŌRI’s new collection. Keep it futuristic, with three colours at most.', 3, ['futuristic', 'y2k', 'minimal'], 2, [], {}, ['chrome', 'y2k', 'n2']),
  O('Crypt rehearsal', 'OXIDE, candles', 'A candlelit rehearsal with OXIDE. Wear lace and a veil. A veil or hair piece is required.', 3, ['fairy', 'dark', 'romantic'], 2, ['hairAcc'], {}, ['fairy', 'sleaze', 'n2']),
  O('Festival field', 'Wild Heart, day two', 'Day two of the festival with Wild Heart. Wear something soft and playful that can cope with mud.', 1, ['boho', 'soft', 'playful'], 2, [], {}, ['boho', 'fairy', 'n2']),
  O('Y3K drop', 'Archive 0, midnight', 'Archive 0 is releasing a new collection at midnight. Mix satin and chrome, and wear only one logo.', 2, ['y2k', 'futuristic', 'bold'], 2, [], {}, ['y2k', 'chrome', 'n2']),
  /* novel 3 · a year on the road */
  O('Paris, seven am', 'a café in Paris', 'An early breakfast at a café in Paris. Wear something classic with pearls, and bring a bag.', 2, ['coquette', 'classic', 'quiet'], 2, ['bag'], {}, ['coquette', 'quiet', 'n3']),
  O('Lake house morning', 'a jetty, cold water', 'A cold, bright morning at the lake house. Wear something soft and fresh, such as gingham or a knit.', 1, ['clean', 'soft', 'fresh'], 2, [], {}, ['boho', 'clean', 'n3']),
  O('Tokyo, 2am', 'a convenience store', 'A convenience store in Tokyo at 2am. Wear bold, shiny pieces that suit the neon lights.', 2, ['futuristic', 'bold', 'nocturnal'], 2, [], {}, ['chrome', 'y2k', 'n3']),
  O('Alpine village', 'a village in the mountains', 'A snowy village in the mountains. Wear technical layers that still look polished. A coat is required.', 1, ['gorp', 'polished', 'soft'], 4, ['outer'], {}, ['gorp', 'clean', 'n3']),
  O('Desert drive', 'a car with no roof', 'A drive through the desert in an open-top car. Wear leather and denim for a relaxed, edgy look.', 1, ['boho', 'edgy', 'warm'], 1, [], {}, ['boho', 'sleaze', 'n3']),
  O('Milan, long lunch', 'a restaurant in Milan', 'A long lunch in Milan. Look polished in warm colours, such as camel with loafers. Bring a bag.', 3, ['quietlux', 'polished', 'warm'], 2, ['bag'], {}, ['quiet', 'siren', 'n3']),
  O('Seoul dessert café', 'a café with a queue', 'A popular dessert café in Seoul. Wear pastel colours and add a bow.', 2, ['pretty', 'clean', 'soft'], 2, [], {}, ['coquette', 'clean', 'n3']),
  O('Amalfi terrace', 'a terrace above the sea', 'A terrace above the sea in Amalfi. Wear linen with heeled sandals, and bring a bag.', 3, ['pretty', 'fresh', 'romantic'], 1, ['bag'], {}, ['boho', 'coquette', 'n3']),
  O('Berlin door', 'a club that opens at midnight', 'A club in Berlin that opens at midnight. Wear bold pieces in dark colours. Black is the safest choice.', 2, ['edgy', 'dark', 'bold'], 2, [], {}, ['sleaze', 'chrome', 'n3']),
  O('Castle weekend', 'a castle with a leak', 'A weekend in a draughty old castle. Dress classically and warmly, with some tartan. A coat is required.', 2, ['academia', 'classic', 'warm'], 4, ['outer'], {}, ['academia', 'quiet', 'n3']),
  O('Ibiza sunrise', 'the beach at six', 'Sunrise on the beach in Ibiza. Wear soft, sheer pieces in white. Flat shoes only.', 1, ['fairy', 'soft', 'fresh'], 1, [], { forbid: { heels: true } }, ['y2k', 'fairy', 'n3']),
  O('New York minute', 'a busy street in New York', 'A busy street in New York. Wear sleek, sharp pieces in dark colours, and bring a bag.', 3, ['sleek', 'sharp', 'dark'], 3, ['bag'], {}, ['clean', 'siren', 'n3']),
  O('Marrakesh riad', 'a riad with a fountain', 'A riad in Marrakesh with tiles and a fountain. Wear warm, bold pieces such as velvet and gold.', 2, ['boho', 'warm', 'bold'], 3, [], {}, ['boho', 'mob', 'n3']),
  O('Ski lodge, après', 'the ski lodge', 'An evening by the fire at the ski lodge. Wear cosy knits and something fluffy.', 2, ['soft', 'warm', 'playful'], 4, [], {}, ['gorp', 'coquette', 'n3']),
  O('Venice, masked', 'a palazzo, candles', 'A candlelit masked ball in Venice. Dress glamorously in dark colours. A veil or hair piece is required.', 5, ['glamorous', 'romantic', 'dark'], 2, ['hairAcc'], {}, ['mob', 'fairy', 'n3']),
  O('LA pool house', 'a pool in the hills', 'A pool party in the hills above Los Angeles. Wear something bold, such as hot pink. Sunglasses are required.', 1, ['y2k', 'bold', 'fresh'], 1, ['eyes'], {}, ['y2k', 'clean', 'n3']),
  O('Copenhagen bike lane', 'a street in Copenhagen', 'A bike ride through Copenhagen. Wear something simple and classic, such as stripes. A coat is required.', 1, ['clean', 'classic', 'easy'], 3, ['outer'], {}, ['clean', 'academia', 'n3']),
  O('Sydney surf beach', 'a surf beach', 'A day at a surf beach in Sydney. Dress sporty and relaxed, with a cap. Bring a bag.', 1, ['sporty', 'fresh', 'easy'], 1, ['bag'], {}, ['blokette', 'boho', 'n3']),
  O('Vienna ball', 'a ballroom in Vienna', 'A formal ball in Vienna. You need a full-length gown that moves well when you dance. Bring a bag.', 6, ['glamorous', 'classic', 'sleek'], 2, ['bag'], { tolerance: 0 }, ['siren', 'coquette', 'n3']),
  O('Overnight train', 'a sleeper cabin', 'A night on a sleeper train. Wear soft, comfortable travel clothes that still look neat.', 1, ['relaxed', 'soft', 'quiet'], 3, [], {}, ['quiet', 'clean', 'n3']),
  O('Hotel breakfast', 'the hotel restaurant', 'Breakfast at the hotel with a view. Wear something pretty and relaxed for the first outfit of the day.', 2, ['pretty', 'relaxed', 'polished'], 2, [], {}, ['coquette', 'quiet', 'n3']),
  O('Night market', 'a night market', 'A night market full of food stalls. Wear something playful that you don’t mind getting messy, and bring a bag.', 1, ['playful', 'bold', 'easy'], 2, ['bag'], {}, ['y2k', 'boho', 'n3']),
  /* novel 4 · backstage */
  O('Open casting', 'a casting studio', 'A casting with forty other models. Keep the outfit simple and sharp so the casting team remembers you.', 2, ['clean', 'sharp', 'minimal'], 2, [], {}, ['clean', 'siren', 'n4']),
  O('Fitting, pins in', 'the fitting room, hour three', 'A long fitting where you have to stand still. Wear something polished and sharp, and bring a bag.', 3, ['quietlux', 'polished', 'sharp'], 2, ['bag'], {}, ['quiet', 'siren', 'n4']),
  O('Lookbook day', 'a grey backdrop', 'A lookbook shoot where every piece has to be easy to see. Keep it pretty and polished, and bring a bag.', 3, ['pretty', 'quiet', 'polished'], 2, ['bag'], {}, ['coquette', 'quiet', 'n4']),
  O('Outside the show', 'the street outside the show', 'Dress for the photographers outside the show. Be bold, and wear exactly three accessories. Bring a bag.', 3, ['bold', 'modern', 'playful'], 3, ['bag'], { exactAccessories: 3 }, ['y2k', 'sleaze', 'blokette', 'n4']),
  O('Beauty chair', 'hair and makeup, 6am', 'Hair and makeup starts at 6am. Wear something soft that’s easy to pull on and off.', 2, ['ballet', 'soft', 'pretty'], 2, [], {}, ['ballet', 'coquette', 'n4']),
  O('Front row', 'row A, seat 4', 'A front-row seat at the show. Wear bold, sleek pieces. Sunglasses and a bag are required.', 4, ['mob', 'bold', 'sleek'], 2, ['eyes', 'bag'], {}, ['mob', 'siren', 'n4']),
  O('The afterparty', 'a hotel bar, 1am', 'The afterparty in a hotel bar. Mix sequins with leather, and look glamorous but relaxed.', 4, ['glamorous', 'undone', 'nocturnal'], 2, [], {}, ['sleaze', 'siren', 'n4']),
  O('Chrome editorial', 'a mirrored set', 'A photo shoot on a mirrored set. Make one metallic piece the star, with no prints.', 3, ['chrome', 'bold', 'minimal'], 2, [], { forbid: { prints: true } }, ['chrome', 'n4']),
  O('Garden editorial', 'a walled garden, a parasol', 'A photo shoot in a walled garden. Wear soft, romantic pieces with florals and lace.', 3, ['coquette', 'soft', 'romantic'], 1, [], {}, ['coquette', 'boho', 'n4']),
  O('Noir editorial', 'a dark studio', 'A dramatic photo shoot lit by one lamp. Wear dark, sharp pieces in velvet and leather.', 4, ['siren', 'dark', 'sharp'], 2, [], {}, ['siren', 'academia', 'n4']),
  O('Campaign shoot', 'a studio with expensive light', 'A big campaign shoot. Wear clean, technical pieces that look expensive.', 3, ['clean', 'futuristic', 'polished'], 2, [], {}, ['chrome', 'clean', 'n4']),
  O('Press day', 'a room of journalists', 'A day of interviews with journalists. Look polished and sleek, and bring a bag.', 3, ['polished', 'quiet', 'sleek'], 2, ['bag'], {}, ['quiet', 'siren', 'n4']),
  O('The house archive', 'the house archive', 'A visit to the house archive. Wear denim and knits, like the pieces that made the house famous.', 2, ['y2k', 'academia', 'quiet'], 3, [], {}, ['y2k', 'academia', 'n4']),
  O('Showroom appointment', 'a buyer with a clipboard', 'A buyer is visiting the showroom. Look polished and classic, in tweed with loafers. Bring a bag.', 3, ['academia', 'polished', 'classic'], 3, ['bag'], {}, ['academia', 'quiet', 'n4']),
  O('Runway rehearsal', 'the runway, before the show', 'A rehearsal before the show. Wear something simple and comfortable, such as a knit. Flat shoes only.', 1, ['ballet', 'clean', 'easy'], 2, [], { forbid: { heels: true } }, ['ballet', 'clean', 'n4']),
  O('Rooftop shoot', 'a windy rooftop', 'A photo shoot on a windy rooftop. Dress sporty and bold, in things that won’t blow around.', 2, ['sporty', 'bold', 'fresh'], 1, [], {}, ['blokette', 'y2k', 'n4']),
  O('Hotel suite shoot', 'a hotel suite', 'A photo shoot in a hotel suite. Wear glamorous, romantic pieces in satin and velvet.', 4, ['glamorous', 'warm', 'romantic'], 2, [], {}, ['mob', 'siren', 'n4']),
  O('Awards night', 'the red carpet', 'An awards night with a red carpet. You need a full-length gown. Bring a bag.', 6, ['glamorous', 'sleek', 'classic'], 2, ['bag'], { tolerance: 0 }, ['siren', 'mob', 'n4']),
  O('Cover try', 'the cover shoot', 'A test shoot for the magazine cover. Be bold with hot pink and chrome.', 3, ['bold', 'y2k', 'futuristic'], 2, [], {}, ['y2k', 'chrome', 'n4']),
  O('Finale walk', 'the last look', 'The last look of the show. Keep it sleek and sharp so the audience remembers it.', 4, ['sleek', 'sharp', 'clean'], 2, [], {}, ['clean', 'siren', 'n4']),
  O('Model apartment', 'a shared flat', 'A day off in the flat you share with five other models. Wear something easy and relaxed.', 1, ['easy', 'relaxed', 'clean'], 2, [], {}, ['clean', 'y2k', 'n4']),
  O('The go-see', 'three agencies, one afternoon', 'You’re visiting three agencies in one afternoon. Dress simply and sharply. Flat shoes only, and bring a bag.', 1, ['clean', 'sharp', 'easy'], 3, ['bag'], { forbid: { heels: true } }, ['clean', 'blokette', 'n4']),
  /* novel 5 · the dreamhouse */
  O('Dreamhouse move-in', 'moving day', 'It’s moving day at the dreamhouse. Wear something pretty and comfortable in pink, and bring a bag.', 1, ['pretty', 'playful', 'easy'], 2, ['bag'], {}, ['coquette', 'clean', 'n5']),
  O('Dreamhouse pool', 'the dreamhouse pool', 'A pool party at the dreamhouse. Dress sporty and playful, with no fur, velvet or wool.', 1, ['sporty', 'playful', 'bold'], 1, [], { forbid: { textures: ['fur', 'velvet', 'wool'] } }, ['y2k', 'blokette', 'n5']),
  O('The pink convertible', 'a drive along the coast', 'A drive in the pink convertible with the roof down. Wear a headscarf. Sunglasses are required.', 2, ['y2k', 'playful', 'sharp'], 2, ['eyes'], {}, ['y2k', 'coquette', 'n5']),
  O('Closet tour', 'the walk-in, filmed', 'You’re filming a tour of the walk-in wardrobe. Wear something pretty and polished that shows off your favourite pieces.', 3, ['coquette', 'quiet', 'polished'], 2, [], {}, ['coquette', 'quiet', 'n5']),
  O('Lawn tea party', 'the dreamhouse lawn', 'A tea party on the lawn. Wear lace or polka dots. A hat is required.', 3, ['coquette', 'classic', 'pretty'], 1, ['head'], {}, ['coquette', 'ballet', 'n5']),
  O('Prom', 'prom night', 'It’s prom night. Wear a glamorous dress with heels you can dance in. Bring a bag.', 5, ['glamorous', 'coquette', 'sleek'], 2, ['bag'], {}, ['coquette', 'siren', 'n5']),
  O('Sleepover', 'a sleepover', 'A sleepover with three friends. Wear soft knits and satin. Socks are required.', 1, ['soft', 'playful', 'relaxed'], 3, ['hosiery'], {}, ['y2k', 'coquette', 'n5']),
  O('Dreamhouse beach', 'the dreamhouse beach', 'A day at the dreamhouse beach. Wear something playful, such as stripes or hot pink, and bring a bag.', 1, ['boho', 'playful', 'fresh'], 1, ['bag'], {}, ['boho', 'y2k', 'n5']),
  O('Dreamhouse gala', 'the dreamhouse ballroom', 'The dreamhouse gala is black tie. Wear a full-length gown with sequins. Bring a bag.', 6, ['glamorous', 'bold', 'sleek'], 2, ['bag'], { tolerance: 0 }, ['siren', 'coquette', 'n5']),
  O('Lawn wedding', 'a wedding on the lawn', 'You’re a guest at a wedding on the lawn. Look pretty and polished, and don’t wear white or cream. Bring a bag.', 4, ['coquette', 'pretty', 'polished'], 1, ['bag'], { forbid: { colors: ['#FFFFFF', '#F3F0E8'] } }, ['coquette', 'boho', 'n5']),
  O('Ice rink', 'the ice rink', 'An afternoon at the ice rink. Wear a skating skirt with something that shines.', 2, ['ballet', 'futuristic', 'playful'], 4, [], {}, ['chrome', 'ballet', 'n5']),
  O('Pink tent', 'a pink tent in the garden', 'Camping in a pink tent in the garden. Wear outdoor pieces that are still cute. A coat is required.', 1, ['gorp', 'playful', 'soft'], 3, ['outer'], {}, ['gorp', 'coquette', 'n5']),
  O('Ballet recital', 'the recital hall', 'A ballet recital. Wear soft, classic pieces in tulle and satin.', 3, ['ballet', 'soft', 'classic'], 2, [], {}, ['ballet', 'coquette', 'n5']),
  O('Rock show', 'the dreamhouse stage', 'A rock show on the dreamhouse stage. Wear leather and sequins and look a little messy.', 2, ['edgy', 'bold', 'undone'], 2, [], {}, ['sleaze', 'y2k', 'n5']),
  O('Space camp', 'the dreamhouse rocket', 'A day at space camp. Wear bold, futuristic pieces such as chrome and moon boots.', 2, ['futuristic', 'bold', 'playful'], 2, [], {}, ['chrome', 'y2k', 'n5']),
  O('Horse show', 'the stables', 'A horse show at the stables. Look classic and polished, in tweed with tall boots.', 3, ['academia', 'classic', 'polished'], 3, [], {}, ['academia', 'boho', 'n5']),
  O('Career day', 'the dreamhouse office', 'Career day at the dreamhouse office. Wear a pencil skirt and look sharp. Bring a bag.', 3, ['siren', 'polished', 'sharp'], 2, ['bag'], {}, ['siren', 'clean', 'n5']),
  O('Birthday', 'a birthday party', 'A big birthday party. Wear something glamorous and playful in satin or sequins. Bring a bag.', 4, ['coquette', 'glamorous', 'playful'], 2, ['bag'], {}, ['coquette', 'siren', 'n5']),
  O('Movie night', 'the dreamhouse screen', 'Movie night at home. Wear something soft and cosy, with a bow.', 1, ['soft', 'relaxed', 'pretty'], 3, [], {}, ['coquette', 'clean', 'n5']),
  O('Pink carpet', 'the premiere', 'A film premiere with a pink carpet. Wear glamorous pink from head to toe. Bring a bag.', 5, ['glamorous', 'bold', 'pretty'], 2, ['bag'], {}, ['siren', 'coquette', 'n5']),
];

// show day: one finale per house
export const FINALES = {
  NUL: O('Show day', 'the white studio, front row', 'It’s show day. Wear simple basics that work perfectly together. Bring a bag.', 3, ['clean', 'quiet', 'polished'], 2, ['bag']),
  VESPER: O('Show day', 'the salon', 'It’s show day. Show your waist, add one sharp detail, and carry one bag.', 4, ['siren', 'polished', 'sharp'], 2, ['bag']),
  AURA: O('Show day', 'front row', 'It’s show day. Wear bows, pearls and tulle together in one balanced outfit. Bring a bag.', 3, ['coquette', 'classic', 'polished'], 2, ['bag']),
  SOLENE: O('Show day', 'the private dinner', 'It’s show day, with a private dinner afterwards. Dress glamorously with one standout piece, and don’t dress below the dress code. Bring a bag.', 5, ['glamorous', 'sleek', 'bold'], 2, ['bag']),
  THORNE: O('Show day', 'the reading room, lights up', 'It’s show day. Wear smart, bookish pieces with one tartan, and carry a book.', 3, ['academia', 'sharp', 'classic'], 3, []),
  KORI: O('Show day', 'the lab, lights off', 'It’s show day. Make one chrome piece the star, with no prints.', 3, ['chrome', 'bold', 'minimal'], 2, [], { forbid: { prints: true } }),
  HALO: O('Show day', 'the pitch, floodlit', 'It’s show day on the pitch. Dress sporty and sharp, with your socks pulled up.', 1, ['sporty', 'playful', 'sharp'], 2, []),
  OXIDE: O('Show day', 'the crypt', 'It’s show day in the crypt. Wear lace, a veil, boots and pearls. Bring a bag.', 4, ['fairy', 'romantic', 'bold'], 2, ['bag']),
  WILD: O('Show day', 'the field at dusk', 'It’s show day in the field at dusk. Wear soft, romantic pieces with western boots. Bring a bag.', 2, ['boho', 'soft', 'romantic'], 1, ['bag']),
  ARCHIVE: O('Show day', 'the street outside the show', 'It’s show day on the street. Wear a micro mini with an oversized layer. Bring a bag.', 3, ['y2k', 'playful', 'sharp'], 2, ['bag']),
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
