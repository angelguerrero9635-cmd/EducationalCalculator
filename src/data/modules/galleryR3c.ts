/**
 * Round-3 gallery demos (group C; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily.
 *
 * Each demo is its page's own sort (bins and card labels) with the card pictures filled in.
 */
import type { CardIcon, LayoutDef } from './layouts';
import type { ModuleDef } from './types';

export const R3C_GALLERY_MODULES: ModuleDef[] = [];

/** A sort like the page's: [bin id, label, why] and [card label, bin, icon]. */
const sort = (
  id: string,
  title: string,
  question: string,
  bins: [string, string, string][],
  cards: [string, string, CardIcon][],
): LayoutDef => ({
  id,
  title,
  kind: 'sort',
  question,
  assumptions: ['Tap a card, then a group.', 'The drawings are what matter here.'],
  bins: bins.map(([bin, label, why]) => ({ id: bin, label, why })),
  cards: cards.map(([label, bin, icon]) => ({ label, bin, figure: { kind: 'icon', icon } })),
});

export const R3C_GALLERY_LAYOUTS: LayoutDef[] = [
  // D07: s.K.living-needs~homes
  sort(
    'g.icons-homes',
    'Where animals live',
    'Where can it get what it needs?',
    [
      ['pond', 'Pond', 'Pond animals need lots of water.'],
      ['forest', 'Forest', 'Trees give food and places to hide.'],
      ['desert', 'Desert', 'Desert animals need little water.'],
    ],
    [
      ['Fish', 'pond', 'fish'],
      ['Frog', 'pond', 'frog'],
      ['Duck', 'pond', 'duck'],
      ['Deer', 'forest', 'deer'],
      ['Owl', 'forest', 'owl'],
      ['Squirrel', 'forest', 'squirrel'],
      ['Camel', 'desert', 'camel hump'],
      ['Lizard', 'desert', 'lizard'],
      ['Roadrunner', 'desert', 'roadrunner'],
    ],
  ),
  // D13: s.1.offspring~care
  sort(
    'g.icons-parent-care',
    'How parents help their young',
    'How does the parent help?',
    [
      ['food', 'Food', 'Parents bring food or feed their young.'],
      ['safety', 'Safety', 'Parents keep their young away from danger.'],
      ['warmth', 'Warmth', 'Parents keep eggs and young warm.'],
    ],
    [
      ['Bird brings worms', 'food', 'bird feeding chicks'],
      ['Cow feeds her calf', 'food', 'calf drinking milk'],
      ['Kangaroo pouch', 'safety', 'joey in pouch'],
      ['Lion carries her cub', 'safety', 'lioness carrying cub'],
      ['Hen sits on her eggs', 'warmth', 'hen on nest'],
      ['Penguin keeps its chick on its feet', 'warmth', 'penguin chick on feet'],
    ],
  ),
  // D24: s.2.habitats~which-habitat
  sort(
    'g.icons-which-habitat',
    'Which habitat?',
    'Where does it live?',
    [
      ['ocean', 'Ocean', 'Salty water, from the shore to the deep sea.'],
      ['desert', 'Desert', 'Very little rain. Hot days.'],
      ['rainforest', 'Rainforest', 'Warm and wet, with tall trees.'],
      ['arctic', 'Arctic', 'Cold, with ice and snow most of the year.'],
    ],
    [
      ['Whale', 'ocean', 'whale'],
      ['Octopus', 'ocean', 'octopus'],
      ['Cactus', 'desert', 'cactus stem'],
      ['Camel', 'desert', 'camel hump'],
      ['Monkey', 'rainforest', 'monkey'],
      ['Parrot', 'rainforest', 'parrot'],
      ['Tree frog', 'rainforest', 'tree frog'],
      ['Vines', 'rainforest', 'hanging vines'],
      ['Polar bear', 'arctic', 'polar bear'],
      ['Walrus', 'arctic', 'walrus'],
    ],
  ),
  // D34: s.3.adaptation-fossils
  sort(
    'g.icons-fossils',
    'What fossils tell',
    'What was this place like long ago?',
    [
      ['water', 'Under water', 'Water animals lived here, so it was sea or lake.'],
      ['wet', 'Warm and wet land', 'Ferns and swamp plants grew here.'],
      ['cold', 'Cold', 'Animals with thick fur lived here.'],
    ],
    [
      ['Fish', 'water', 'fish'],
      ['Clam shell', 'water', 'clam fossil'],
      ['Coral', 'water', 'coral fossil'],
      ['Shark tooth', 'water', 'shark tooth fossil'],
      ['Fern leaf', 'wet', 'fern fossil'],
      ['Dragonfly', 'wet', 'dragonfly fossil'],
      ['Woolly mammoth hair', 'cold', 'woolly mammoth'],
      ['Musk ox', 'cold', 'musk ox'],
    ],
  ),
  // D35: s.3.animal-groups~group-jobs
  sort(
    'g.icons-group-jobs',
    'How a group helps',
    'How does the group help?',
    [
      ['food', 'Find food', 'Working together, they catch or carry more food.'],
      ['safe', 'Stay safe', 'Many eyes spot danger.'],
      ['warm', 'Stay warm', 'Close bodies share heat.'],
    ],
    [
      ['Wolf pack hunting', 'food', 'wolf pack'],
      ['Ants carrying food', 'food', 'ants carrying leaf'],
      ['Zebra herd', 'safe', 'zebra herd'],
      ['School of fish', 'safe', 'school of fish'],
      ['Meerkat lookout', 'safe', 'meerkat lookout'],
      ['Penguin huddle', 'warm', 'penguin huddle'],
      ['Bees in a winter ball', 'warm', 'bee ball'],
    ],
  ),
];
