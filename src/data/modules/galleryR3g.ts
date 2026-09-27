/**
 * Round-3 gallery demos (group G; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily. Each demo is its page's own sort or sequence with the
 * card pictures filled in.
 */
import type { CardFigure, CardIcon, LayoutDef } from './layouts';
import type { ModuleDef } from './types';

export const R3G_GALLERY_MODULES: ModuleDef[] = [];

const icon = (name: CardIcon): CardFigure => ({ kind: 'icon', icon: name });
/** Cards as [label, bin, icon name or figure]. */
const cards = (list: [string, string, CardIcon | CardFigure][]) =>
  list.map(([label, bin, f]) => ({
    label,
    bin,
    figure: typeof f === 'string' ? icon(f) : f,
  }));
/** Stages as [label, icon name]. */
const stages = (list: [string, CardIcon][]) =>
  list.map(([label, name]) => ({ label, figure: icon(name) }));

export const R3G_GALLERY_LAYOUTS: LayoutDef[] = [
  // D01: m.K.add-sub-10~all-partners
  {
    kind: 'sequence',
    id: 'g.r3g-all-partners',
    title: 'All the ways to make a number',
    assumptions: [
      'A number can be split into two parts in more than one way.',
      'Go in order. The first part goes up by 1. The second goes down by 1.',
      'Tap the pairs in order, starting with 0 + 5.',
    ],
    question: 'Put the ways to make 5 in order.',
    stages: stages([
      ['0 + 5', 'cars 0 red 5 blue'],
      ['1 + 4', 'cars 1 red 4 blue'],
      ['2 + 3', 'cars 2 red 3 blue'],
      ['3 + 2', 'cars 3 red 2 blue'],
      ['4 + 1', 'cars 4 red 1 blue'],
      ['5 + 0', 'cars 5 red 0 blue'],
    ]),
  },
  // D02: m.2.standard-length~which-unit
  {
    kind: 'sort',
    id: 'g.r3g-which-unit',
    title: 'Which unit?',
    assumptions: [
      'Small things: centimeters. Big things: meters.',
      'A bigger unit means you need fewer of them.',
    ],
    question: 'Would you measure it in centimeters or meters?',
    bins: [
      { id: 'cm', label: 'Centimeters', why: 'It is small. It fits on a ruler.' },
      { id: 'm', label: 'Meters', why: 'It is big. Use a meter stick.' },
    ],
    cards: cards([
      ['Paper clip', 'cm', 'paper clip'],
      ['Crayon', 'cm', 'crayon'],
      ['Eraser', 'cm', 'eraser'],
      ['Door', 'm', 'door'],
      ['School bus', 'm', 'bus'],
      ['Hallway', 'm', 'school hallway'],
      ['Classroom', 'm', 'classroom from above'],
    ]),
  },
  // D03: m.2.time-5-min~am-pm
  {
    kind: 'sort',
    id: 'g.r3g-am-pm',
    title: 'a.m. or p.m.?',
    assumptions: ['a.m. is from midnight to noon.', 'p.m. is from noon to midnight.'],
    question: 'Does it happen in the a.m. or the p.m.?',
    bins: [
      { id: 'am', label: 'a.m.', why: 'Midnight to noon: the morning.' },
      { id: 'pm', label: 'p.m.', why: 'Noon to midnight: afternoon and evening.' },
    ],
    cards: cards([
      ['Eat breakfast', 'am', 'breakfast by morning window'],
      ['Walk to school', 'am', 'backpack'],
      ['See the sunrise', 'am', 'sunrise with arrow up'],
      ['Eat dinner', 'pm', 'dinner by evening window'],
      ['Go to bed', 'pm', 'bed'],
      ['Watch the sunset', 'pm', 'sunset with arrow down'],
    ]),
  },
  // D04: m.2.even-odd~sort
  {
    kind: 'sort',
    id: 'g.r3g-even-odd',
    title: 'Even or odd?',
    assumptions: [
      'Put the dots in pairs.',
      'Even: every dot has a partner. Odd: one is left over.',
    ],
    question: 'Is the number even or odd?',
    bins: [
      { id: 'even', label: 'Even', why: 'Pairs with none left over.' },
      { id: 'odd', label: 'Odd', why: 'One is left without a partner.' },
    ],
    cards: cards([
      ['3', 'odd', { kind: 'dots', count: 3 }],
      ['8', 'even', { kind: 'dots', count: 8 }],
      ['0', 'even', { kind: 'dots', count: 0 }],
      ['9', 'odd', { kind: 'dots', count: 9 }],
    ]),
  },
  // D06: s.K.living-needs~who-needs
  {
    kind: 'sort',
    id: 'g.r3g-who-needs',
    title: 'What plants and animals need',
    assumptions: [
      'All living things need water and air.',
      'Plants make food. Animals must find food.',
    ],
    question: 'Who needs it?',
    bins: [
      { id: 'plants', label: 'Plants', why: 'Plants make their own food with sunlight.' },
      { id: 'animals', label: 'Animals', why: 'Animals must eat plants or other animals.' },
      { id: 'both', label: 'Both', why: 'Every living thing needs these.' },
    ],
    cards: cards([
      ['Sunlight', 'plants', 'sun'],
      ['Soil for roots', 'plants', 'pot of soil with roots'],
      ['A den or nest', 'animals', 'bird nest'],
      ['Water', 'both', 'water drop'],
    ]),
  },
  // D10: s.K.living-things-change-environment
  {
    kind: 'sort',
    id: 'g.r3g-who-changed',
    title: 'Who made the change?',
    assumptions: [
      'Living things change the place where they live.',
      'They change it to get what they need.',
    ],
    question: 'Who made the change?',
    bins: [
      {
        id: 'animals',
        label: 'Animals',
        why: 'Animals dig, build and chew to get what they need.',
      },
      { id: 'plants', label: 'Plants', why: 'Roots and stems push rocks and soil.' },
      { id: 'people', label: 'People', why: 'People build, plant and dig to meet their needs.' },
    ],
    cards: cards([
      ['Beaver builds a dam', 'animals', 'beaver at dam'],
      ['Squirrel digs a hole', 'animals', 'squirrel digging'],
      ['Bird builds a nest', 'animals', 'bird building nest'],
      ['Tree roots crack the sidewalk', 'plants', 'roots cracking sidewalk'],
      ['Weeds grow through a crack', 'plants', 'weeds in pavement crack'],
      ['People build a road', 'people', 'road roller on new road'],
      ['People plant a garden', 'people', 'hands planting garden'],
    ]),
  },
  // D11: s.K.living-things-change-environment~helps
  {
    kind: 'sort',
    id: 'g.r3g-helps',
    title: 'Choices that help the land',
    assumptions: ['People can choose to keep a place clean.', 'Small choices add up.'],
    question: 'Does it help or hurt?',
    bins: [
      { id: 'helps', label: 'Helps', why: 'It keeps the land, water and air clean.' },
      { id: 'hurts', label: 'Hurts', why: 'It makes a mess or wastes.' },
    ],
    cards: cards([
      ['Pick up litter', 'helps', 'hand putting can in bin'],
      ['Reuse a bag', 'helps', 'cloth shopping bag'],
      ['Turn off the water', 'helps', 'hand closing faucet'],
      ['Plant a tree', 'helps', 'planting a tree sapling'],
      ['Drop a wrapper', 'hurts', 'wrapper falling on grass'],
      ['Leave the water running', 'hurts', 'running faucet'],
      ['Pick all the flowers', 'hurts', 'hand with picked flowers'],
    ]),
  },
  // D12: s.1.sound-vibration~cup-phone
  {
    kind: 'sequence',
    id: 'g.r3g-cup-phone',
    title: 'A cup phone',
    assumptions: [
      'Two cups are joined by a tight string.',
      'The shaking travels along the string.',
    ],
    question: 'How does your voice get to your friend?',
    stages: stages([
      ['Your voice shakes the cup', 'cup phone voice shakes cup'],
      ['The string shakes', 'cup phone string shakes'],
      ['The other cup shakes', 'cup phone far cup shakes'],
      ['Your friend hears you', 'cup phone friend hears'],
    ]),
  },
  // D28: s.3.balanced-forces~balanced
  {
    kind: 'sort',
    id: 'g.r3g-balanced',
    title: 'Balanced or unbalanced?',
    assumptions: [
      'Every object has forces on it, even when it is still.',
      'Balanced forces do not change the motion.',
    ],
    question: 'Do the forces balance?',
    bins: [
      {
        id: 'balanced',
        label: 'Balanced',
        why: 'Equal forces, opposite ways. Nothing starts or stops.',
      },
      { id: 'unbalanced', label: 'Unbalanced', why: 'One force is bigger. The motion changes.' },
    ],
    cards: cards([
      ['Book resting on a table', 'balanced', 'book on table with equal arrows'],
      ['Tug of war with no one moving', 'balanced', 'tug of war with equal arrows'],
      ['A swing hanging still', 'balanced', 'swing hanging still'],
      ['Box on a carpet, pushed gently, stays still', 'balanced', 'hand pushing box on rug'],
      ['Kicked ball starts to roll', 'unbalanced', 'foot kicking ball'],
      ['Bike braking to a stop', 'unbalanced', 'bike braking'],
      ['Apple falling', 'unbalanced', 'apple falling from branch'],
      ['Rock sliding on ice slows down', 'unbalanced', 'rock sliding on ice'],
    ]),
  },
  // D42: s.4.internal-structures~senses
  {
    kind: 'sequence',
    id: 'g.r3g-senses',
    title: 'From seeing to catching',
    assumptions: [
      'Senses take in information. Nerves carry it to the brain.',
      'The brain decides and sends a message back to the muscles.',
      'Tap the steps in order, starting with the light.',
    ],
    question: 'Put the steps in order. Tap the first one, then the next.',
    stages: stages([
      ['Light from the ball enters the eye', 'ball light entering eye'],
      ['The eye sends a message along a nerve', 'eye nerve to brain lit'],
      ['The brain reads the message', 'brain lit'],
      ['The brain sends a message to the arm', 'brain nerve to arm lit'],
      ['The arm moves to catch the ball', 'hand catching ball'],
    ]),
  },
];
