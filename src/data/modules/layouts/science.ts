/**
 * Science K–3 pages that are sorts, sequences, explorations or observations rather than
 * calculators (the lesson reviewer's layout proposals, docs/REVIEW_LOG.md).
 */
import type { LayoutDef } from './types';

const F = '°F';

export const SCIENCE_LAYOUTS: LayoutDef[] = [
  // ── Kindergarten ──
  {
    kind: 'sequence',
    id: 's.K.weather-patterns~storm',
    title: 'Getting ready for a storm',
    use: 'Use this to put the storm jobs in order.',
    assumptions: [
      'A forecast warns that a storm is coming.',
      'Get ready before the storm, not during it.',
      'Do the jobs in order. Then stay inside.',
    ],
    question: 'Put the jobs in order. Tap the first one, then the next.',
    stages: [
      { label: 'Hear the forecast' },
      { label: 'Bring the toys inside' },
      { label: 'Close the windows' },
      { label: 'Stay inside' },
      { label: 'Wait for the storm to pass' },
    ],
  },

  // ── Grade 1 ──
  {
    kind: 'explore',
    id: 's.1.structures-function',
    assumptions: [
      'Every part of a plant has a job.',
      'Tap a part to read what it does.',
      'People copy plant and animal parts to solve problems.',
    ],
    figure: {
      kind: 'parts',
      parts: [
        { name: 'Flower', job: 'Makes seeds. Its colors bring bees.' },
        { name: 'Leaves', job: 'Catch sunlight to make food.' },
        { name: 'Stem', job: 'Holds up the leaves. Carries water up.' },
        { name: 'Roots', job: 'Hold the plant in the ground. Take in water.' },
      ],
    },
    scenes: [
      {
        label: 'Roots',
        part: 'Roots',
        lines: ['Roots hold the plant in the ground. They take in water.'],
      },
      {
        label: 'Stem',
        part: 'Stem',
        lines: ['The stem holds up the leaves. It carries water up.'],
      },
      {
        label: 'Leaves',
        part: 'Leaves',
        lines: ['Leaves catch sunlight. The plant makes its food with it.'],
      },
      {
        label: 'Flower',
        part: 'Flower',
        lines: ['The flower makes seeds. Its colors bring bees.'],
      },
    ],
  },
  {
    kind: 'explore',
    id: 's.1.structures-function~animal',
    title: 'Animal parts and their jobs',
    use: 'Use this to see what each animal part does.',
    assumptions: [
      'Every part of an animal has a job.',
      'Tap a part to read what it does.',
      'A bike helmet works like a turtle’s shell.',
    ],
    figure: {
      kind: 'parts',
      parts: [
        { name: 'Eyes', job: 'See food and danger.' },
        { name: 'Ears', job: 'Hear sounds from far away.' },
        { name: 'Fur', job: 'Keeps the animal warm.' },
        { name: 'Claws', job: 'Dig, climb and hold food.' },
        { name: 'Shell', job: 'Keeps the animal safe.' },
      ],
    },
    scenes: [
      { label: 'Eyes', part: 'Eyes', lines: ['Eyes see food and danger.'] },
      {
        label: 'Ears',
        part: 'Ears',
        lines: ['Ears hear sounds from far away. Big ears hear more.'],
      },
      {
        label: 'Fur',
        part: 'Fur',
        lines: ['Fur keeps the animal warm. A coat works the same way.'],
      },
      { label: 'Claws', part: 'Claws', lines: ['Claws dig, climb and hold food.'] },
      {
        label: 'Shell',
        part: 'Shell',
        lines: ['A shell keeps the animal safe. A helmet works the same way.'],
      },
    ],
  },
  {
    kind: 'explore',
    id: 's.1.sound-vibration~signals',
    title: 'Sending a message with flashes',
    use: 'Use this to send a message with a flashlight code.',
    assumptions: [
      'Light and sound can carry a message far away.',
      'Agree on a code first. Then the flashes mean something.',
      'Tap a message to see its flashes.',
    ],
    figure: { kind: 'flashes' },
    scenes: [
      { label: 'Yes', flashes: '●', lines: ['One flash means yes.'] },
      { label: 'No', flashes: '● ●', lines: ['Two flashes mean no.'] },
      { label: 'Come here', flashes: '● ● ●', lines: ['Three flashes mean come here.'] },
      { label: 'Help', flashes: '● — ●', lines: ['A short, a long and a short flash mean help.'] },
    ],
  },
  {
    kind: 'sort',
    id: 's.1.light-shadows~materials',
    title: 'What light does with each material',
    use: 'Use this to sort materials by what light does to them.',
    assumptions: [
      'Shine a flashlight at each material.',
      'Some let the light through. Some block it. Shiny ones bounce it.',
      'Tap a card, then tap its group.',
    ],
    question: 'What does light do when it hits it?',
    bins: [
      { id: 'through', label: 'Goes through', why: 'Clear things let the light through.' },
      { id: 'some', label: 'Some goes through', why: 'You see a glow, not a clear picture.' },
      { id: 'blocked', label: 'Blocked', why: 'No light gets through. It makes a shadow.' },
      { id: 'bounces', label: 'Bounces back', why: 'Shiny things bounce the light back.' },
    ],
    cards: [
      { label: 'Window glass', bin: 'through' },
      { label: 'Clear plastic', bin: 'through' },
      { label: 'Wax paper', bin: 'some' },
      { label: 'Tissue paper', bin: 'some' },
      { label: 'Wood', bin: 'blocked' },
      { label: 'A book', bin: 'blocked' },
      { label: 'A mirror', bin: 'bounces' },
      { label: 'A shiny spoon', bin: 'bounces' },
    ],
  },

  // ── Grade 2 ──
  {
    kind: 'sort',
    id: 's.2.material-properties~sort',
    title: 'Sort materials by a property',
    use: 'Use this to sort materials by one property.',
    assumptions: [
      'A property is something you can observe: hard, soft, bendy, shiny.',
      'Sort by one property at a time. Here it is: does it bend?',
      'Tap a card, then tap its group.',
    ],
    question: 'Does it bend?',
    bins: [
      { id: 'easy', label: 'Bends easily', why: 'Soft and stretchy things bend easily.' },
      { id: 'little', label: 'Bends a little', why: 'Thin, stiff things bend a little.' },
      { id: 'no', label: 'Does not bend', why: 'Hard, thick things do not bend.' },
    ],
    cards: [
      { label: 'Rubber band', bin: 'easy' },
      { label: 'String', bin: 'easy' },
      { label: 'Cloth', bin: 'easy' },
      { label: 'Paper', bin: 'little' },
      { label: 'Plastic ruler', bin: 'little' },
      { label: 'Cardboard', bin: 'little' },
      { label: 'Rock', bin: 'no' },
      { label: 'Metal spoon', bin: 'no' },
      { label: 'Glass', bin: 'no' },
    ],
  },
  {
    kind: 'sort',
    id: 's.2.heating-cooling~undo',
    title: 'Can it be undone?',
    use: 'Use this to sort changes into ones that can be undone and ones that cannot.',
    assumptions: [
      'Heating and cooling change things.',
      'Melted ice can freeze again. A cooked egg stays cooked.',
      'Tap a card, then tap its group.',
    ],
    question: 'Can the change be undone?',
    bins: [
      { id: 'yes', label: 'Can be undone', why: 'Cool it or warm it, and it goes back.' },
      { id: 'no', label: 'Cannot be undone', why: 'It is a new thing now. It will not go back.' },
    ],
    cards: [
      { label: 'Melting ice', bin: 'yes' },
      { label: 'Freezing water', bin: 'yes' },
      { label: 'Melting butter', bin: 'yes' },
      { label: 'Melting chocolate', bin: 'yes' },
      { label: 'Cooking an egg', bin: 'no' },
      { label: 'Burning paper', bin: 'no' },
      { label: 'Baking bread', bin: 'no' },
      { label: 'Toasting bread', bin: 'no' },
    ],
  },
  {
    kind: 'observe',
    id: 's.2.plant-growth-investigation~weeks',
    title: 'A plant’s height week by week',
    use: 'Use this to record a plant’s height each week and see the pattern.',
    assumptions: [
      'Measure the plant on the same day each week.',
      'Tap a bar to change that week’s height.',
      'The sentence under the chart says how it grew.',
    ],
    columns: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    rowLabel: 'Height',
    unit: 'cm',
    max: 30,
    step: 1,
    initial: [3, 7, 12, 18],
    pattern: (v) => {
      const grew = v.slice(1).map((x, i) => x - v[i]!);
      if (grew.every((g) => g > 0)) {
        const most = grew.indexOf(Math.max(...grew));
        return `The plant grew every week. It grew most from week ${most + 1} to week ${most + 2}: ${grew[most]} cm.`;
      }
      if (grew.every((g) => g === 0)) return 'The plant stayed the same height.';
      const drop = grew.findIndex((g) => g < 0);
      if (drop >= 0)
        return `The plant got shorter from week ${drop + 1} to week ${drop + 2}. Check the measurement.`;
      return 'The plant grew some weeks and stayed the same on others.';
    },
  },
  {
    kind: 'sort',
    id: 's.2.pollination-dispersal~travel',
    title: 'How seeds travel',
    use: 'Use this to sort seeds by how they travel.',
    assumptions: [
      'Seeds travel away from the parent plant.',
      'Light seeds fly. Sticky seeds ride on fur. Tasty seeds go with animals.',
      'Tap a card, then tap its group.',
    ],
    question: 'How does the seed travel?',
    bins: [
      { id: 'wind', label: 'By wind', why: 'Light seeds with wings or fluff fly on the wind.' },
      { id: 'animal', label: 'By animals', why: 'Seeds stick to fur or get eaten and carried.' },
      { id: 'water', label: 'By water', why: 'Seeds that float drift on water.' },
    ],
    cards: [
      { label: 'Dandelion fluff', bin: 'wind' },
      { label: 'Maple seed with wings', bin: 'wind' },
      { label: 'Milkweed fluff', bin: 'wind' },
      { label: 'Burr on a sock', bin: 'animal' },
      { label: 'Berry eaten by a bird', bin: 'animal' },
      { label: 'Acorn buried by a squirrel', bin: 'animal' },
      { label: 'Coconut', bin: 'water' },
      { label: 'Water lily seed', bin: 'water' },
    ],
  },
  {
    kind: 'sort',
    id: 's.2.erosion-landforms~map',
    title: 'Land and water on a map',
    use: 'Use this to sort the places on a map into land and water.',
    assumptions: [
      'A map shows where the land and the water are.',
      'Blue on a map is water.',
      'Tap a card, then tap its group.',
    ],
    question: 'Is it land or water?',
    bins: [
      { id: 'land', label: 'Land', why: 'Mountains, hills and valleys are shapes of the land.' },
      { id: 'water', label: 'Water', why: 'Lakes, rivers and oceans are bodies of water.' },
    ],
    cards: [
      { label: 'Mountain', bin: 'land' },
      { label: 'Hill', bin: 'land' },
      { label: 'Valley', bin: 'land' },
      { label: 'Island', bin: 'land' },
      { label: 'Lake', bin: 'water' },
      { label: 'River', bin: 'water' },
      { label: 'Ocean', bin: 'water' },
      { label: 'Pond', bin: 'water' },
    ],
  },
  {
    kind: 'sort',
    id: 's.2.erosion-landforms~fast-slow',
    title: 'Fast or slow changes',
    use: 'Use this to sort Earth changes into fast ones and slow ones.',
    assumptions: [
      'Some changes to the land happen in a day. Some take many years.',
      'Wind and water wear the land away slowly.',
      'Tap a card, then tap its group.',
    ],
    question: 'Does it change the land fast or slowly?',
    bins: [
      { id: 'fast', label: 'Fast', why: 'A fast change happens in minutes or days.' },
      { id: 'slow', label: 'Slow', why: 'A slow change takes many years.' },
    ],
    cards: [
      { label: 'Earthquake', bin: 'fast' },
      { label: 'Volcano erupting', bin: 'fast' },
      { label: 'Landslide', bin: 'fast' },
      { label: 'Flood', bin: 'fast' },
      { label: 'River wearing a canyon', bin: 'slow' },
      { label: 'Wind shaping a sand dune', bin: 'slow' },
      { label: 'Ice cracking a rock', bin: 'slow' },
      { label: 'Waves wearing a cliff', bin: 'slow' },
    ],
  },

  // ── Grade 3 ──
  {
    kind: 'explore',
    id: 's.3.magnets~poles',
    title: 'Which poles pull, which push',
    use: 'Use this to see when two magnets pull together and when they push apart.',
    assumptions: [
      'Every magnet has a north pole (N) and a south pole (S).',
      'Opposite poles pull together. Same poles push apart.',
      'Tap a pair of poles to see what happens.',
    ],
    figure: { kind: 'magnets' },
    scenes: [
      {
        label: 'N faces S',
        poles: 'N–S',
        lines: ['Opposite poles pull together. The magnets snap shut.'],
      },
      {
        label: 'N faces N',
        poles: 'N–N',
        lines: ['Same poles push apart. You feel the push before they touch.'],
      },
      { label: 'S faces S', poles: 'S–S', lines: ['Same poles push apart, just like N and N.'] },
    ],
  },
  {
    kind: 'sequence',
    id: 's.3.life-cycles~order',
    title: 'Stages of a butterfly in order',
    use: 'Use this to put the butterfly’s stages in order and add up the days.',
    assumptions: [
      'A life cycle goes round: egg, caterpillar, chrysalis, butterfly, then eggs again.',
      'Each stage takes about the same number of days for one kind of butterfly.',
      'Tap the stages in order. The days add up under the strip.',
    ],
    question: 'Put the stages in order, starting with the egg.',
    stages: [
      { label: 'Egg', span: 4 },
      { label: 'Caterpillar', span: 14 },
      { label: 'Chrysalis', span: 10 },
      { label: 'Butterfly', span: 14 },
    ],
    unit: 'days',
    totalLabel: 'Whole cycle',
  },
  {
    kind: 'explore',
    id: 's.3.animal-groups',
    assumptions: [
      'Some animals live in groups: a herd of elephants, a pack of wolves, a hive of bees.',
      'A group helps them find food, keep the young safe and stay warm.',
      'Tap a scene to see what the group does.',
    ],
    figure: { kind: 'dots' },
    scenes: [
      {
        label: 'Alone',
        dots: [1, 1],
        lines: ['One deer must watch for danger by itself.', 'It looks for food alone.'],
      },
      {
        label: 'In a herd',
        dots: [1, 12],
        lines: [
          'Many eyes watch for danger.',
          'The herd finds food together.',
          'The young stay in the middle, where it is safe.',
        ],
      },
      {
        label: 'Huddled',
        dots: [1, 30],
        lines: ['Penguins huddle close together.', 'The middle of the huddle stays warm.'],
      },
    ],
  },
  {
    kind: 'observe',
    id: 's.3.weather-climate~seasons',
    title: 'Temperature by season',
    use: 'Use this to record the usual temperature of each season and see the pattern.',
    assumptions: [
      'Climate is the usual weather of a place over many years.',
      'Tap a bar to change a season’s usual temperature.',
      'The sentence under the chart says the pattern.',
    ],
    columns: ['Winter', 'Spring', 'Summer', 'Fall'],
    rowLabel: 'Usual temperature',
    unit: F,
    max: 100,
    step: 5,
    initial: [30, 55, 80, 60],
    pattern: (v) => {
      const seasons = ['winter', 'spring', 'summer', 'fall'];
      const hi = v.indexOf(Math.max(...v));
      const lo = v.indexOf(Math.min(...v));
      if (hi === lo) return 'Every season is the same. That is a place with no seasons.';
      return `Warmest: ${seasons[hi]} (${v[hi]} ${F}). Coldest: ${seasons[lo]} (${v[lo]} ${F}). ${seasons[hi]![0]!.toUpperCase()}${seasons[hi]!.slice(1)} is ${v[hi]! - v[lo]!} ${F} warmer than ${seasons[lo]}.`;
    },
  },
];
