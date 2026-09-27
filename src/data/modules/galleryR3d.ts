/**
 * Round-3 gallery demos (group D; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily. Each demo is its page's own sort or sequence with the
 * card pictures filled in.
 */
import type { CardFigure, CardIcon, LayoutDef } from './layouts';
import type { ModuleDef } from './types';

export const R3D_GALLERY_MODULES: ModuleDef[] = [];

const icon = (name: CardIcon): CardFigure => ({ kind: 'icon', icon: name });
/** Cards as [label, bin, icon name]. */
const cards = (list: [string, string, CardIcon | CardFigure | null][]) =>
  list.map(([label, bin, f]) => ({
    label,
    bin,
    ...(f === null ? {} : { figure: typeof f === 'string' ? icon(f) : f }),
  }));

export const R3D_GALLERY_LAYOUTS: LayoutDef[] = [
  // D14: s.1.offspring~match
  {
    kind: 'sort',
    id: 'g.r3d-offspring',
    title: 'Who will it grow up to be?',
    assumptions: [
      'Some young ones look very different from their parents.',
      'They still grow up to be like them.',
    ],
    question: 'Who will it grow up to be?',
    bins: [
      { id: 'frog', label: 'Frog', why: 'Frog eggs hatch into tadpoles. Tadpoles become frogs.' },
      {
        id: 'butterfly',
        label: 'Butterfly',
        why: 'A caterpillar makes a chrysalis. A butterfly comes out.',
      },
      { id: 'oak', label: 'Oak tree', why: 'An acorn is an oak seed. It grows into a tree.' },
    ],
    cards: cards([
      ['Tadpole', 'frog', 'tadpole'],
      ['Frog eggs', 'frog', 'frog eggs'],
      ['Caterpillar', 'butterfly', 'caterpillar'],
      ['Chrysalis', 'butterfly', 'chrysalis'],
      ['Acorn', 'oak', 'acorn'],
      ['Oak seedling', 'oak', 'oak seedling'],
    ]),
  },
  // D20: s.2.pollination-dispersal
  {
    kind: 'sort',
    id: 'g.r3d-seeds-travel',
    title: 'How seeds travel',
    assumptions: [
      'Seeds travel away from the parent plant.',
      'Light seeds fly. Sticky seeds ride on fur. Tasty seeds go with animals.',
    ],
    question: 'How does the seed travel?',
    bins: [
      { id: 'wind', label: 'By wind', why: 'Light seeds with wings or fluff fly on the wind.' },
      { id: 'animal', label: 'By animals', why: 'Seeds stick to fur or get eaten and carried.' },
      { id: 'water', label: 'By water', why: 'Seeds that float drift on water.' },
    ],
    cards: cards([
      ['Dandelion fluff', 'wind', 'dandelion seed head'],
      ['Maple seed with wings', 'wind', 'winged maple seed'],
      ['Milkweed fluff', 'wind', 'milkweed pod'],
      ['Burr on a dog’s fur', 'animal', 'burr in dog fur'],
      ['Berry eaten by a bird', 'animal', 'bird eating berry'],
      ['Acorn buried by a squirrel', 'animal', 'squirrel burying acorn'],
      ['Coconut', 'water', 'floating coconut'],
      ['Water lily seed', 'water', 'water lily seed pod'],
    ]),
  },
  // D21: s.2.pollination-dispersal~pollen
  {
    kind: 'sequence',
    id: 'g.r3d-pollen',
    title: 'How a bee carries pollen',
    assumptions: [
      'Many flowers need pollen from another flower to make seeds.',
      'Bees carry the pollen without knowing it.',
    ],
    question: 'Put the steps in order.',
    stages: [
      { label: 'A bee lands on a flower to drink nectar', figure: icon('bee on flower') },
      { label: 'Pollen sticks to its hairy body', figure: icon('bee with pollen') },
      {
        label: 'The bee flies to another flower of the same kind',
        figure: icon('bee between flowers'),
      },
      { label: 'Pollen rubs off on that flower', figure: icon('pollen on flower') },
      { label: 'The flower can now make seeds', figure: icon('flower making seeds') },
    ],
  },
  // D29: s.3.life-cycles
  {
    kind: 'sequence',
    id: 'g.r3d-butterfly-cycle',
    title: 'A butterfly’s life cycle',
    assumptions: [
      'A life cycle goes round: egg, caterpillar, chrysalis, butterfly, then eggs again.',
      'One kind of butterfly takes about the same days each time.',
      'Tap the stages in order. The days add up under the strip.',
    ],
    question: 'Put the stages in order, starting with the egg.',
    stages: [
      { label: 'Egg', span: 4, figure: icon('butterfly egg on leaf') },
      { label: 'Caterpillar', span: 14, figure: icon('caterpillar') },
      { label: 'Chrysalis', span: 10, figure: icon('chrysalis') },
      { label: 'Butterfly', span: 14, figure: icon('butterfly') },
    ],
    unit: 'days',
    totalLabel: 'Whole cycle',
  },
  // D30: s.3.life-cycles~frog
  {
    kind: 'sequence',
    id: 'g.r3d-frog-cycle',
    title: 'From egg to frog',
    assumptions: [
      'A frog starts as an egg in the water.',
      'It hatches as a tadpole, then grows legs as a froglet.',
      'A frog lays hundreds of eggs. Only a few grow into frogs.',
    ],
    question: 'Put the stages in order, starting with the egg.',
    stages: [
      { label: 'Egg', span: 10, figure: icon('frog eggs') },
      { label: 'Tadpole', span: 84, figure: icon('tadpole') },
      { label: 'Froglet', span: 28, figure: icon('froglet') },
      { label: 'Frog', figure: icon('frog') },
    ],
    unit: 'days',
    totalLabel: 'Egg to frog',
  },
  // D31: s.3.life-cycles~bean
  {
    kind: 'sequence',
    id: 'g.r3d-bean-cycle',
    title: 'A bean plant’s life cycle',
    assumptions: ['Plants have life cycles too.', 'The new seeds can start the cycle again.'],
    question: 'Put the stages in order, starting with the seed.',
    stages: [
      { label: 'Seed', span: 7, figure: icon('bean seed') },
      { label: 'Sprout', span: 14, figure: icon('bean sprout') },
      { label: 'Young plant', span: 28, figure: icon('young bean plant') },
      { label: 'Plant with flowers', span: 14, figure: icon('bean plant with flowers') },
      { label: 'Pods with new seeds', figure: icon('bean plant with pods') },
    ],
    unit: 'days',
    totalLabel: 'Seed to new seeds',
  },
  // D32: s.3.life-cycles~changes
  {
    kind: 'sort',
    id: 'g.r3d-grow-up',
    title: 'Change shape or grow bigger?',
    assumptions: [
      'Every life cycle has birth, growth, having young and death.',
      'Some animals change shape as they grow.',
    ],
    question: 'How does it grow up?',
    bins: [
      { id: 'shape', label: 'Changes shape', why: 'The young look very different from the adult.' },
      { id: 'bigger', label: 'Grows bigger', why: 'The young look like a small adult.' },
    ],
    cards: cards([
      ['Butterfly', 'shape', 'butterfly'],
      ['Frog', 'shape', 'frog'],
      ['Ladybug', 'shape', 'ladybug'],
      ['Mosquito', 'shape', 'mosquito'],
      ['Dog', 'bigger', 'dog'],
      ['Turtle', 'bigger', 'turtle'],
      ['Chicken', 'bigger', 'chicken'],
      ['Human', 'bigger', 'person'],
    ]),
  },
  // D33: s.3.inherited-traits
  {
    kind: 'sort',
    id: 'g.r3d-traits',
    title: 'Where a trait comes from',
    assumptions: [
      'A trait is something about a living thing you can observe.',
      'Some traits come from parents. Some come from where it lives.',
    ],
    question: 'Where does this trait come from?',
    bins: [
      { id: 'inherited', label: 'Inherited', why: 'Passed from parents to young.' },
      {
        id: 'environment',
        label: 'Environment',
        why: 'Caused by where it lives or what happens to it.',
      },
      { id: 'learned', label: 'Learned', why: 'The animal or person learned it.' },
    ],
    cards: cards([
      ['Eye color', 'inherited', 'eye'],
      ['Flower color', 'inherited', 'two flower colors'],
      ['Number of legs', 'inherited', null],
      ['A scar', 'environment', 'knee with scar'],
      ['A plant bent by wind', 'environment', 'tree bent by wind'],
      ['A pale plant grown in the dark', 'environment', 'pale seedling in dark box'],
      ['A dog sits on command', 'learned', 'dog sitting'],
      ['Riding a bike', 'learned', 'child riding bike'],
    ]),
  },
  // D43: s.4.internal-structures~jobs
  {
    kind: 'sort',
    id: 'g.r3d-part-jobs',
    title: 'What does this part help with?',
    assumptions: [
      'Every part helps a plant or animal survive, grow or make young.',
      'Some parts are on the outside, like thorns and shells.',
    ],
    question: 'What does this part help with?',
    bins: [
      { id: 'protect', label: 'Protection', why: 'It keeps the plant or animal safe.' },
      {
        id: 'food',
        label: 'Getting food, water and air',
        why: 'It takes in what the living thing needs.',
      },
      {
        id: 'sense',
        label: 'Sensing and moving',
        why: 'It finds out what is around, or moves the body.',
      },
      { id: 'young', label: 'Making young', why: 'It helps make the next plants or animals.' },
    ],
    cards: cards([
      ['Rose thorns', 'protect', 'rose stem with thorns'],
      ['Turtle shell', 'protect', 'turtle'],
      ['Tree roots', 'food', 'tree with roots'],
      ['Bird’s beak', 'food', 'bird beak'],
      ['Fish gills', 'food', 'fish gills'],
      ['Owl’s eyes', 'sense', 'owl face'],
      ['Bird’s wings', 'sense', 'bird flying'],
      ['Flower', 'young', 'flower'],
      ['Seeds', 'young', 'sunflower head'],
    ]),
  },
  // D52: s.5.food-webs
  {
    kind: 'sort',
    id: 'g.r3d-food-web-roles',
    title: 'Roles in a food web',
    assumptions: [
      'Every food web starts with the sun.',
      'Decomposers return matter to the soil for plants to use again.',
    ],
    question: 'What is its role in the food web?',
    bins: [
      {
        id: 'producer',
        label: 'Producer',
        why: 'Makes its own food from sunlight, air and water.',
      },
      { id: 'consumer', label: 'Consumer', why: 'Eats plants or animals.' },
      {
        id: 'decomposer',
        label: 'Decomposer',
        why: 'Breaks down dead things and returns matter to the soil.',
      },
    ],
    cards: cards([
      ['Grass', 'producer', 'tuft of grass'],
      ['Oak tree', 'producer', 'oak tree'],
      ['Algae', 'producer', 'algae on pond'],
      ['Rabbit', 'consumer', 'rabbit'],
      ['Deer', 'consumer', 'deer'],
      ['Hawk', 'consumer', 'hawk'],
      ['Frog', 'consumer', 'frog'],
      ['Mushroom', 'decomposer', 'mushroom on log'],
      ['Bacteria', 'decomposer', { kind: 'cell', type: 'bacterium', shape: 'rod' }],
      ['Earthworm', 'decomposer', 'earthworm in soil'],
    ]),
  },
  // D53: s.5.food-webs~chain-order
  {
    kind: 'sequence',
    id: 'g.r3d-food-chain',
    title: 'A food chain from the sun',
    assumptions: [
      'After the sun, each arrow means: is eaten by.',
      'Energy from the sun passes along the chain.',
      'Tap each one in order, starting with the sun.',
    ],
    question: 'Put the food chain in order, starting with the sun.',
    stages: [
      { label: 'Sun', figure: icon('sun') },
      { label: 'Grass', figure: icon('tuft of grass') },
      { label: 'Grasshopper', figure: icon('grasshopper') },
      { label: 'Frog', figure: icon('frog') },
      { label: 'Snake', figure: icon('snake') },
      { label: 'Hawk', figure: icon('hawk') },
    ],
  },
];
