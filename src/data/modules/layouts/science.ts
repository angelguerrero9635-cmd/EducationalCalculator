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
  // ── Grade 4 ──
  {
    kind: 'observe',
    id: 's.4.energy-speed~ramp',
    title: 'Ramp height and how far the cup slides',
    use: 'Use this to record how far the cup slides for each release height on the ramp.',
    assumptions: [
      'Let a marble roll down a ramp and hit a paper cup at the bottom.',
      'Start the marble higher each time. Measure how far the cup slides.',
      'The marble’s energy passes to the cup when they hit.',
      'When they hit, some energy also becomes sound and heat.',
    ],
    columns: ['5 cm', '10 cm', '15 cm', '20 cm', '25 cm'],
    rowLabel: 'Cup slid',
    unit: 'cm',
    max: 60,
    step: 5,
    initial: [10, 20, 30, 40, 50],
    pattern: (v) => {
      const up = v.slice(1).every((x, i) => x >= v[i]!);
      if (v.every((x) => x === v[0])) return 'The cup slid the same distance every time.';
      return up
        ? `The higher the start, the faster the marble and the farther the cup slides: ${v[0]} cm up to ${v[v.length - 1]} cm.`
        : 'The distances go up and down. Try each height again and keep the cup in the same spot.';
    },
  },
  {
    kind: 'sort',
    id: 's.4.energy-conversion',
    assumptions: [
      'Every device takes energy in and gives energy out in another form.',
      'Most of these take in electric current from a battery or a plug.',
      'Some give out two kinds: a toaster glows and heats. Sort each by its main job.',
      'Tap a card, then tap its group.',
    ],
    question: 'What does the device mainly give out when it is switched on?',
    bins: [
      { id: 'light', label: 'Light', why: 'Light carries energy you can see.' },
      { id: 'heat', label: 'Heat', why: 'Heat warms what it touches.' },
      { id: 'sound', label: 'Sound', why: 'Sound is energy you hear.' },
      { id: 'motion', label: 'Motion', why: 'A moving part has energy.' },
    ],
    cards: [
      { label: 'Flashlight', bin: 'light' },
      { label: 'Lamp', bin: 'light' },
      { label: 'Toaster', bin: 'heat' },
      { label: 'Hair dryer', bin: 'heat' },
      { label: 'Electric kettle', bin: 'heat' },
      { label: 'Buzzer', bin: 'sound' },
      { label: 'Speaker', bin: 'sound' },
      { label: 'Doorbell', bin: 'sound' },
      { label: 'Fan', bin: 'motion' },
      { label: 'Electric car', bin: 'motion' },
    ],
  },
  {
    kind: 'sequence',
    id: 's.4.energy-conversion~trace',
    title: 'Follow the energy in a flashlight',
    use: 'Use this to follow the energy from a flashlight’s battery to its light.',
    assumptions: [
      'Energy moves from place to place. It changes form but is not used up.',
      'Electric current carries energy along a wire.',
      'Tap the steps in order, starting with the battery.',
    ],
    question: 'Put the steps in order, starting with the battery.',
    stages: [
      { label: 'The battery stores energy' },
      { label: 'Electric current carries it along the wire' },
      { label: 'The thin wire in the bulb gets very hot' },
      { label: 'The bulb gives out light and heat' },
    ],
  },
  {
    kind: 'sort',
    id: 's.4.energy-conversion~conductors',
    title: 'Does electric current flow through it?',
    use: 'Use this to sort materials into conductors and insulators.',
    assumptions: [
      'Put the object in a circuit with a battery and a bulb.',
      'If the bulb lights, current flows through the object.',
      'Tap a card, then tap its group.',
    ],
    question: 'Does the bulb light when it is in the circuit?',
    bins: [
      { id: 'conductor', label: 'Conductor', why: 'Current flows through it: the bulb lights.' },
      {
        id: 'insulator',
        label: 'Insulator',
        why: 'Current cannot get through: the bulb stays dark.',
      },
    ],
    cards: [
      { label: 'Copper wire', bin: 'conductor' },
      { label: 'Paper clip', bin: 'conductor' },
      { label: 'Aluminum foil', bin: 'conductor' },
      { label: 'Coin', bin: 'conductor' },
      { label: 'Plastic spoon', bin: 'insulator' },
      { label: 'Rubber band', bin: 'insulator' },
      { label: 'Wood stick', bin: 'insulator' },
      { label: 'Glass marble', bin: 'insulator' },
    ],
  },
  {
    kind: 'explore',
    id: 's.4.vision-light',
    assumptions: [
      'You see an object when light from it enters your eye.',
      'Most objects do not make light. They bounce light from a lamp or the sun.',
      'Tap a scene to follow the light.',
    ],
    figure: { kind: 'lightPath' },
    scenes: [
      {
        label: 'Lamp on',
        light: { lamp: true },
        lines: [
          'Light leaves the lamp and bounces off the apple.',
          'The bounced light enters your eye. You see the apple.',
        ],
      },
      {
        label: 'Lamp off',
        light: { lamp: false },
        lines: [
          'No light reaches the apple, so none bounces into your eye.',
          'In a fully dark room you see nothing, even with your eyes open.',
        ],
      },
      {
        label: 'Eyes covered',
        light: { lamp: true, blocker: 'hand' },
        lines: ['Light still bounces off the apple.', 'A hand stops it before it enters your eye.'],
      },
      {
        label: 'Mirror',
        light: { lamp: true, blocker: 'mirror' },
        lines: [
          'The light bounces off the apple, then off the mirror.',
          'It enters your eye, so you see the apple in the mirror.',
        ],
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.4.vision-light~signals',
    title: 'Messages sent by light or by sound',
    use: 'Use this to sort ways of sending a message by what carries the pattern.',
    assumptions: [
      'A message can travel as a pattern: flashes, colors, beats or beeps.',
      'Light patterns are seen. Sound patterns are heard.',
      'Tap a card, then tap its group.',
    ],
    question: 'What carries the pattern?',
    bins: [
      { id: 'light', label: 'Light', why: 'A pattern of flashes or colors you see.' },
      { id: 'sound', label: 'Sound', why: 'A pattern of beats or beeps you hear.' },
    ],
    cards: [
      { label: 'Flashlight code', bin: 'light' },
      { label: 'Lighthouse', bin: 'light' },
      { label: 'Traffic light', bin: 'light' },
      { label: 'Flag colors on a ship', bin: 'light' },
      { label: 'Drum beats', bin: 'sound' },
      { label: 'Ship’s horn', bin: 'sound' },
      { label: 'Buzzer code', bin: 'sound' },
      { label: 'School bell', bin: 'sound' },
    ],
  },
  {
    kind: 'explore',
    id: 's.4.internal-structures',
    assumptions: [
      'Some parts are outside, like skin and eyes. Some are inside, like the heart and lungs.',
      'Each part has a job that helps the animal live and grow.',
      'Plants have parts with jobs too: roots, stems, leaves and thorns.',
      'Tap a part to read its job.',
    ],
    figure: {
      kind: 'parts',
      parts: [
        { name: 'Brain', job: 'Takes in messages from the senses and decides what to do.' },
        { name: 'Heart', job: 'Pumps blood to every part of the body.' },
        { name: 'Lungs', job: 'Take in air and pass oxygen to the blood.' },
        { name: 'Stomach', job: 'Breaks food down so the body can use it.' },
        { name: 'Bones', job: 'Hold the body up and protect the soft parts.' },
        { name: 'Skin', job: 'Keeps water in and germs out. Feels touch.' },
      ],
    },
    scenes: [
      {
        label: 'Brain',
        part: 'Brain',
        lines: [
          'The brain gets messages from the eyes, ears and skin.',
          'It decides what the body does next.',
        ],
      },
      {
        label: 'Heart',
        part: 'Heart',
        lines: [
          'The heart is a muscle that pumps blood.',
          'Blood carries food and oxygen to every part.',
        ],
      },
      {
        label: 'Lungs',
        part: 'Lungs',
        lines: [
          'The lungs fill with air when you breathe in.',
          'Oxygen passes from the air into the blood.',
        ],
      },
      {
        label: 'Stomach',
        part: 'Stomach',
        lines: ['The stomach mashes and mixes food.', 'The body can then take in what it needs.'],
      },
      {
        label: 'Bones',
        part: 'Bones',
        lines: [
          'Bones hold the body up.',
          'The skull protects the brain; the ribs protect the heart and lungs.',
        ],
      },
      {
        label: 'Skin',
        part: 'Skin',
        lines: [
          'Skin covers the outside of the body.',
          'It keeps germs out and feels heat, cold and touch.',
        ],
      },
    ],
  },
  {
    kind: 'sequence',
    id: 's.4.internal-structures~senses',
    title: 'From seeing to catching',
    use: 'Use this to put the steps from seeing a ball to catching it in order.',
    assumptions: [
      'Senses take in information. Nerves carry it to the brain.',
      'The brain decides and sends a message back to the muscles.',
      'Tap the steps in order, starting with the light.',
    ],
    question: 'Put the steps in order. Tap the first one, then the next.',
    stages: [
      { label: 'Light from the ball enters the eye' },
      { label: 'The eye sends a message along a nerve' },
      { label: 'The brain reads the message' },
      { label: 'The brain sends a message to the arm' },
      { label: 'The arm moves to catch the ball' },
    ],
  },
  {
    kind: 'sort',
    id: 's.4.internal-structures~jobs',
    title: 'What does this part help with?',
    use: 'Use this to sort plant and animal parts by what they help with.',
    assumptions: [
      'Every part helps a plant or animal survive, grow or make young.',
      'Some parts are on the outside, like thorns and shells.',
      'Tap a card, then tap its group.',
    ],
    question: 'What does this part help with?',
    bins: [
      { id: 'protect', label: 'Protection', why: 'It keeps the plant or animal safe.' },
      {
        id: 'food',
        label: 'Getting food and water',
        why: 'It takes in what the living thing needs.',
      },
      {
        id: 'sense',
        label: 'Sensing and moving',
        why: 'It finds out what is around, or moves the body.',
      },
      { id: 'young', label: 'Making young', why: 'It helps make the next plants or animals.' },
    ],
    cards: [
      { label: 'Rose thorns', bin: 'protect' },
      { label: 'Turtle shell', bin: 'protect' },
      { label: 'Tree roots', bin: 'food' },
      { label: 'Bird’s beak', bin: 'food' },
      { label: 'Owl’s eyes', bin: 'sense' },
      { label: 'Bird’s wings', bin: 'sense' },
      { label: 'Flower', bin: 'young' },
      { label: 'Seeds', bin: 'young' },
    ],
  },
  {
    kind: 'observe',
    id: 's.4.weathering~stream-table',
    title: 'Water poured and sand moved',
    use: 'Use this to record how far the sand moved for each cup of water poured.',
    assumptions: [
      'Pour water down a tray of sand, one cup more each time.',
      'Measure how far down the tray the sand moved.',
      'Moving water carries sand away: that is erosion.',
    ],
    columns: ['1 cup', '2 cups', '3 cups', '4 cups', '5 cups'],
    rowLabel: 'Sand moved',
    unit: 'cm',
    max: 50,
    step: 5,
    initial: [5, 10, 20, 30, 40],
    pattern: (v) => {
      if (v.every((x) => x === v[0])) return 'The sand moved the same distance each time.';
      const up = v.slice(1).every((x, i) => x >= v[i]!);
      return up
        ? `More water moved the sand farther: from ${v[0]} cm to ${v[v.length - 1]} cm. More water means more erosion.`
        : 'The distances go up and down. Pour the same way each time and measure again.';
    },
  },
  {
    kind: 'sequence',
    id: 's.4.weathering~layers-order',
    title: 'How the rock layers formed',
    use: 'Use this to put the events that made the rock layers in order.',
    assumptions: [
      'Layers settle one on top of another, so the bottom layer formed first.',
      'The bottom layer is the oldest. The top layer is the youngest.',
      'Tap the events in order, starting with the oldest.',
    ],
    question: 'Put the events in order, oldest first.',
    stages: [
      { label: 'Sand settles: the bottom layer forms' },
      { label: 'Mud settles on top of the sand' },
      { label: 'Shells settle on the mud: a layer with fossils forms' },
      { label: 'The land is pushed up' },
      { label: 'A river cuts down through the layers' },
    ],
  },
  {
    kind: 'sort',
    id: 's.4.weathering~map-patterns',
    title: 'Where volcanoes and earthquakes happen',
    use: 'Use this to sort places by the pattern of volcanoes and earthquakes on a map.',
    assumptions: [
      'Most volcanoes and earthquakes happen in lines along the edges of oceans.',
      'Those lines are where pieces of Earth’s crust meet.',
      'Tap a card, then tap its group.',
    ],
    question: 'Where is it on a map of volcanoes and earthquakes?',
    bins: [
      {
        id: 'edge',
        label: 'Along the edges of oceans',
        why: 'Many volcanoes and earthquakes, in long lines.',
      },
      { id: 'middle', label: 'Middle of a continent', why: 'Few volcanoes or earthquakes.' },
    ],
    cards: [
      { label: 'Volcanoes around the Pacific Ocean', bin: 'edge' },
      { label: 'Earthquakes in Japan', bin: 'edge' },
      { label: 'The Andes mountains', bin: 'edge' },
      { label: 'Volcanoes in Alaska', bin: 'edge' },
      { label: 'The Great Plains', bin: 'middle' },
      { label: 'Central Australia', bin: 'middle' },
      { label: 'The Sahara', bin: 'middle' },
    ],
  },
  {
    kind: 'sort',
    id: 's.4.natural-resources',
    assumptions: [
      'Energy for heat, light and electric current comes from natural resources.',
      'Burning coal, oil and gas puts smoke and gases into the air.',
      'Renewable does not mean harmless: a dam changes a river.',
      'Tap a card, then tap its group.',
    ],
    question: 'Will this energy source run out?',
    bins: [
      {
        id: 'renewable',
        label: 'Renewable',
        why: 'Nature makes more of it in a lifetime, or it never runs out.',
      },
      {
        id: 'nonrenewable',
        label: 'Nonrenewable',
        why: 'Once used, it is gone for a very long time.',
      },
    ],
    cards: [
      { label: 'Sunlight', bin: 'renewable' },
      { label: 'Wind', bin: 'renewable' },
      { label: 'Moving water', bin: 'renewable' },
      { label: 'Wood', bin: 'renewable' },
      { label: 'Heat from inside Earth', bin: 'renewable' },
      { label: 'Coal', bin: 'nonrenewable' },
      { label: 'Oil', bin: 'nonrenewable' },
      { label: 'Natural gas', bin: 'nonrenewable' },
      { label: 'Uranium', bin: 'nonrenewable' },
    ],
  },
  {
    kind: 'sort',
    id: 's.4.natural-resources~hazards',
    title: 'Protecting against natural hazards',
    use: 'Use this to match each protection to the hazard it helps with.',
    assumptions: [
      'People cannot stop floods, earthquakes, wildfires or hurricanes.',
      'They can build and plan to lessen the harm.',
      'Tap a card, then tap its group.',
    ],
    question: 'Which hazard does this protect against?',
    bins: [
      { id: 'flood', label: 'Flood', why: 'Keep water out, or keep homes above it.' },
      { id: 'earthquake', label: 'Earthquake', why: 'Keep buildings and shelves from falling.' },
      { id: 'wildfire', label: 'Wildfire', why: 'Leave nothing near homes for the fire to burn.' },
      { id: 'hurricane', label: 'Hurricane', why: 'Hold roofs and windows against strong wind.' },
    ],
    cards: [
      { label: 'Levee along a river', bin: 'flood' },
      { label: 'Sandbags', bin: 'flood' },
      { label: 'House raised on posts', bin: 'flood' },
      { label: 'Braced walls', bin: 'earthquake' },
      { label: 'Shelves bolted to the wall', bin: 'earthquake' },
      { label: 'Brush cleared near houses', bin: 'wildfire' },
      { label: 'Fire break', bin: 'wildfire' },
      { label: 'Storm shutters', bin: 'hurricane' },
      { label: 'Roof strapped to the walls', bin: 'hurricane' },
    ],
  },
  // ── Grade 5 ──
  {
    kind: 'explore',
    id: 's.5.particles-matter',
    assumptions: [
      'Everything is made of particles far too small to see, even with a microscope.',
      'The particles keep moving. Warmer means faster.',
      'Tap a scene to see how the particles are arranged.',
    ],
    figure: { kind: 'particles' },
    scenes: [
      {
        label: 'Solid',
        particles: { state: 'solid' },
        lines: ['The particles are packed tight and only wiggle.', 'A solid keeps its own shape.'],
      },
      {
        label: 'Liquid',
        particles: { state: 'liquid' },
        lines: [
          'The particles are close but slide past each other.',
          'A liquid takes the shape of its cup.',
        ],
      },
      {
        label: 'Gas',
        particles: { state: 'gas' },
        lines: [
          'The particles are far apart and fly about.',
          'A gas spreads out to fill its container.',
        ],
      },
      {
        label: 'Sugar in water',
        particles: { state: 'liquid', mixed: true },
        lines: [
          'The sugar breaks into particles too small to see.',
          'They spread among the water particles. The water tastes sweet.',
        ],
      },
      {
        label: 'Squeezed air',
        particles: { state: 'gas', squeezed: true },
        lines: ['Air is made of particles too.', 'Pushing them into less room takes a force.'],
      },
    ],
  },
  {
    kind: 'observe',
    id: 's.5.particles-matter~evaporation',
    title: 'Water in an open cup, day by day',
    use: 'Use this to record the water level in an open cup each day.',
    assumptions: [
      'Mark the water level on an open cup each day.',
      'The water particles leave as a gas you cannot see.',
      'Tap a bar to change that day’s level.',
    ],
    columns: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6'],
    rowLabel: 'Water level',
    unit: 'mm',
    max: 100,
    step: 5,
    initial: [90, 80, 70, 65, 55, 45],
    pattern: (v) => {
      if (v.every((x) => x === v[0])) return 'The level stayed the same. Is the cup covered?';
      const down = v.slice(1).every((x, i) => x <= v[i]!);
      return down
        ? `The level fell from ${v[0]} mm to ${v[v.length - 1]} mm. The water left as a gas you cannot see.`
        : 'The level went up on some days. Did someone add water, or did it rain in?';
    },
  },
  {
    kind: 'sort',
    id: 's.5.particles-matter~properties',
    title: 'Does it dissolve in water?',
    use: 'Use this to sort materials by whether they dissolve in water.',
    assumptions: [
      'Stir a spoonful into a cup of water and wait a minute.',
      'A material that dissolves seems to disappear, but its particles are still there.',
      'Tap a card, then tap its group.',
    ],
    question: 'Does it dissolve in water?',
    bins: [
      {
        id: 'dissolves',
        label: 'Dissolves',
        why: 'It spreads through the water and seems to disappear.',
      },
      {
        id: 'not',
        label: 'Does not dissolve',
        why: 'You can still see it, floating or sitting on the bottom.',
      },
    ],
    cards: [
      { label: 'Salt', bin: 'dissolves' },
      { label: 'Sugar', bin: 'dissolves' },
      { label: 'Baking soda', bin: 'dissolves' },
      { label: 'Sand', bin: 'not' },
      { label: 'Gravel', bin: 'not' },
      { label: 'Pepper', bin: 'not' },
      { label: 'Cooking oil', bin: 'not' },
    ],
  },
  {
    kind: 'sort',
    id: 's.5.particles-matter~magnet',
    title: 'Does a magnet pull it?',
    use: 'Use this to sort materials by whether a magnet pulls them.',
    assumptions: [
      'Hold a magnet close to the object and see if it is pulled.',
      'Not every metal is pulled by a magnet.',
      'Tap a card, then tap its group.',
    ],
    question: 'Does a magnet pull it?',
    bins: [
      { id: 'pulled', label: 'Pulled', why: 'It has iron or steel in it.' },
      { id: 'not', label: 'Not pulled', why: 'No iron or steel: the magnet does nothing.' },
    ],
    cards: [
      { label: 'Iron nail', bin: 'pulled' },
      { label: 'Steel paper clip', bin: 'pulled' },
      { label: 'Aluminum can', bin: 'not' },
      { label: 'Copper coin', bin: 'not' },
      { label: 'Plastic spoon', bin: 'not' },
      { label: 'Wood block', bin: 'not' },
    ],
  },
  {
    kind: 'sort',
    id: 's.5.mixtures',
    assumptions: [
      'Signs of a new substance: bubbles of gas, a new color, heat or light, a solid forming.',
      'A mixture can be separated again: with a filter, a magnet or by letting the water evaporate.',
      'Dissolving does not make a new substance.',
      'Tap a card, then tap its group.',
    ],
    question: 'Did mixing make a new substance?',
    bins: [
      {
        id: 'new',
        label: 'New substance',
        why: 'A gas, a new color, heat or a new solid appeared.',
      },
      {
        id: 'mixture',
        label: 'Just a mixture',
        why: 'The same substances, mixed. You can get them back.',
      },
    ],
    cards: [
      { label: 'Baking soda and vinegar', bin: 'new' },
      { label: 'Iron left in wet air (rust)', bin: 'new' },
      { label: 'Wood burning', bin: 'new' },
      { label: 'Milk and lemon juice (curdles)', bin: 'new' },
      { label: 'Salt in water', bin: 'mixture' },
      { label: 'Sand in water', bin: 'mixture' },
      { label: 'Oil and water', bin: 'mixture' },
      { label: 'Sugar in tea', bin: 'mixture' },
      { label: 'Iron filings and sand', bin: 'mixture' },
    ],
  },
  {
    kind: 'sequence',
    id: 's.5.mixtures~separate',
    title: 'Separate sand, salt and iron filings',
    use: 'Use this to put the steps for separating sand, salt and iron filings in order.',
    assumptions: [
      'Each step uses one property of one substance. Take the iron out first, while the mix is still dry.',
      'Iron is pulled by a magnet. Salt dissolves. Sand does not.',
      'Tap the steps in order.',
    ],
    question: 'Put the steps in order. Tap the first one, then the next.',
    stages: [
      { label: 'Pass a magnet over the dry mix: the iron filings stick' },
      { label: 'Stir the rest into water: the salt dissolves' },
      { label: 'Pour it through a filter: the sand stays behind' },
      { label: 'Let the salt water evaporate: the salt is left' },
    ],
  },
  {
    kind: 'observe',
    id: 's.5.mixtures~dissolve-warm',
    title: 'Salt that dissolves in cool and warm water',
    use: 'Use this to record how many spoons of salt dissolve at each water temperature.',
    assumptions: [
      'Stir in one spoon of salt at a time until no more disappears.',
      'Use the same amount of water each time.',
      'Tap a bar to change the spoons for that temperature.',
    ],
    columns: ['50 °F', '70 °F', '90 °F', '110 °F'],
    rowLabel: 'Spoons dissolved',
    unit: 'spoons',
    max: 12,
    step: 1,
    initial: [6, 7, 8, 9],
    pattern: (v) => {
      if (v.every((x) => x === v[0])) return 'The same amount dissolved at every temperature.';
      const up = v.slice(1).every((x, i) => x >= v[i]!);
      return up
        ? `Warmer water dissolved more: ${v[0]} spoons when cool, ${v[v.length - 1]} spoons when warm.`
        : 'The spoons go up and down. Stir the same way each time and try again.';
    },
  },
  {
    kind: 'explore',
    id: 's.5.gravity-down',
    assumptions: [
      'Gravity is a pull between Earth and every object.',
      'Down means toward the center of Earth, wherever you stand.',
      'Tap a scene to move the person around Earth.',
    ],
    figure: { kind: 'earth' },
    scenes: [
      {
        label: 'At the top',
        earth: { spot: 'top' },
        lines: ['The ball falls toward the center of Earth.', 'We call that direction down.'],
      },
      {
        label: 'On the side',
        earth: { spot: 'side' },
        lines: ['Down still points to the center of Earth.', 'The person does not feel sideways.'],
      },
      {
        label: 'At the bottom',
        earth: { spot: 'bottom' },
        lines: [
          'People on the far side of Earth are not upside down.',
          'Down is toward the center for them too.',
        ],
      },
      {
        label: 'Thrown up',
        earth: { spot: 'top', thrown: true },
        lines: ['The ball slows, stops and falls back.', 'Gravity pulls it down the whole time.'],
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.5.food-webs',
    assumptions: [
      'Every food web starts with the sun.',
      'Arrows in a food web point the way matter and energy move: from the eaten to the eater.',
      'Decomposers return matter to the soil for plants to use again.',
      'Tap a card, then tap its group.',
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
    cards: [
      { label: 'Grass', bin: 'producer' },
      { label: 'Oak tree', bin: 'producer' },
      { label: 'Algae', bin: 'producer' },
      { label: 'Rabbit', bin: 'consumer' },
      { label: 'Deer', bin: 'consumer' },
      { label: 'Hawk', bin: 'consumer' },
      { label: 'Frog', bin: 'consumer' },
      { label: 'Mushroom', bin: 'decomposer' },
      { label: 'Bacteria', bin: 'decomposer' },
      { label: 'Earthworm', bin: 'decomposer' },
    ],
  },
  {
    kind: 'sequence',
    id: 's.5.food-webs~chain-order',
    title: 'A food chain from the sun',
    use: 'Use this to put a food chain in order, starting from the sun.',
    assumptions: [
      'Each arrow in a food chain means: is eaten by.',
      'Energy from the sun passes along the chain.',
      'Tap each one in order, starting with the sun.',
    ],
    question: 'Put the food chain in order, starting with the sun.',
    stages: [
      { label: 'Sun' },
      { label: 'Grass' },
      { label: 'Grasshopper' },
      { label: 'Frog' },
      { label: 'Snake' },
      { label: 'Hawk' },
    ],
  },
  {
    kind: 'explore',
    id: 's.5.plants-sunlight-energy~needs',
    title: 'What a plant takes in',
    use: 'Use this to see where each thing a plant takes in comes from.',
    assumptions: [
      'A plant makes its food from air and water, using the energy of sunlight.',
      'Soil gives only a little: some minerals.',
      'Tap a part to see what it takes in.',
    ],
    figure: {
      kind: 'parts',
      parts: [
        { name: 'Leaves', job: 'Take in carbon dioxide from the air and catch sunlight.' },
        { name: 'Stem', job: 'Carries water up from the roots to the leaves.' },
        { name: 'Roots', job: 'Take in water and a few minerals from the soil.' },
      ],
    },
    scenes: [
      {
        label: 'Leaves',
        part: 'Leaves',
        lines: [
          'Leaves take in carbon dioxide from the air.',
          'They catch the energy in sunlight to make food.',
        ],
      },
      {
        label: 'Stem',
        part: 'Stem',
        lines: ['The stem carries water up to the leaves.'],
      },
      {
        label: 'Roots',
        part: 'Roots',
        lines: ['Roots take in water and a few minerals.', 'The soil itself is hardly used up.'],
      },
    ],
  },
  {
    kind: 'observe',
    id: 's.5.plants-sunlight-energy~water-only',
    title: 'A seedling grown in water only',
    use: 'Use this to record a seedling’s mass each week when it grows in water with no soil.',
    assumptions: [
      'Grow a seedling in a jar of water, with no soil at all.',
      'Weigh it each week. Add a few drops of plant food: the minerals soil would give.',
      'Tap a bar to change that week’s mass.',
    ],
    columns: ['Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
    rowLabel: 'Mass',
    unit: 'g',
    max: 60,
    step: 1,
    initial: [2, 5, 10, 18, 28, 40],
    pattern: (v) => {
      const gained = v[v.length - 1]! - v[0]!;
      if (gained <= 0) return 'The seedling did not gain mass. Did it get enough light?';
      return `It gained ${gained} g with no soil at all. The new mass came from water and air.`;
    },
  },
  {
    kind: 'sort',
    id: 's.5.earth-spheres',
    assumptions: [
      'Earth has four spheres: rock, water, air and living things.',
      'The spheres touch and change each other: rain wears rock, roots split it, wind moves sand.',
      'Tap a card, then tap its group.',
    ],
    question: 'Which sphere is it part of?',
    bins: [
      { id: 'geo', label: 'Geosphere', why: 'Rock, soil and the ground.' },
      { id: 'hydro', label: 'Hydrosphere', why: 'All the water: oceans, rivers and ice.' },
      { id: 'atmo', label: 'Atmosphere', why: 'The air around Earth.' },
      { id: 'bio', label: 'Biosphere', why: 'Every living thing.' },
    ],
    cards: [
      { label: 'Mountain', bin: 'geo' },
      { label: 'Soil', bin: 'geo' },
      { label: 'Sand', bin: 'geo' },
      { label: 'Ocean', bin: 'hydro' },
      { label: 'River', bin: 'hydro' },
      { label: 'Glacier', bin: 'hydro' },
      { label: 'Wind', bin: 'atmo' },
      { label: 'Oxygen in the air', bin: 'atmo' },
      { label: 'Tree', bin: 'bio' },
      { label: 'Fish', bin: 'bio' },
      { label: 'Bird', bin: 'bio' },
    ],
  },
  {
    kind: 'sequence',
    id: 's.5.earth-spheres~rain-to-river',
    title: 'Water moving through the spheres',
    use: 'Use this to put the water’s path through the spheres in order.',
    assumptions: [
      'Water moves between the ocean, the air, the land and living things.',
      'Each move carries it from one sphere to another.',
      'Tap the steps in order, starting at the ocean.',
    ],
    question: 'Put the steps in order, starting at the ocean.',
    stages: [
      { label: 'Water evaporates from the ocean into the air: hydrosphere to atmosphere' },
      { label: 'Clouds form and rain falls on a mountain: atmosphere to geosphere' },
      { label: 'Rain soaks into the soil and roots take it in: geosphere to biosphere' },
      { label: 'The rest runs in a river back to the sea: back to the hydrosphere' },
    ],
  },
  {
    kind: 'observe',
    id: 's.5.sun-star-brightness',
    assumptions: [
      'Shine one flashlight at a wall. Move it back and measure the lit circle.',
      'The same light spreads over a bigger circle, so each part looks dimmer.',
      'The sun is a star. Other stars look dim because they are much farther away.',
    ],
    columns: ['10 cm', '20 cm', '30 cm', '40 cm', '50 cm'],
    rowLabel: 'Lit circle across',
    unit: 'cm',
    max: 60,
    step: 1,
    initial: [8, 16, 24, 32, 40],
    pattern: (v) => {
      if (v.every((x) => x === v[0]))
        return 'The circle stayed the same size. Did the flashlight move?';
      const up = v.slice(1).every((x, i) => x >= v[i]!);
      return up
        ? `The farther the flashlight, the wider the circle: ${v[0]} cm up to ${v[v.length - 1]} cm. The same light spread wider looks dimmer.`
        : 'The sizes go up and down. Hold the flashlight straight and measure again.';
    },
  },
  {
    kind: 'observe',
    id: 's.5.shadows-day-night',
    assumptions: [
      'Earth turns once a day, so the sun seems to move across the sky.',
      'Measure the shadow of a meter stick at the same spot every two hours.',
      'Morning shadows point west. Afternoon shadows point east.',
      'Tap a bar to change that hour’s shadow.',
    ],
    columns: ['8 a.m.', '10 a.m.', 'Noon', '2 p.m.', '4 p.m.'],
    rowLabel: 'Shadow',
    unit: 'cm',
    max: 300,
    step: 10,
    initial: [260, 150, 90, 150, 260],
    pattern: (v) => {
      const hours = ['8 a.m.', '10 a.m.', 'noon', '2 p.m.', '4 p.m.'];
      const lo = v.indexOf(Math.min(...v));
      if (v.every((x) => x === v[0]))
        return 'The shadow stayed the same all day. Check the stick and the spot.';
      return `The shadow was shortest at ${hours[lo]} (${v[lo]} cm), when the sun was highest. It is longer early and late.`;
    },
  },
  {
    kind: 'explore',
    id: 's.5.shadows-day-night~day-night',
    title: 'Why we have day and night',
    use: 'Use this to see why one side of Earth has day while the other has night.',
    assumptions: [
      'The sun lights one half of Earth at a time.',
      'Earth turns toward the east once a day, carrying your town into the light and out again.',
      'Tap a scene to turn Earth.',
    ],
    figure: { kind: 'earth' },
    scenes: [
      {
        label: 'Morning',
        earth: { spot: 'top', sunlit: 'morning' },
        lines: ['Your town turns into the light.', 'The sun rises in the east.'],
      },
      {
        label: 'Noon',
        earth: { spot: 'top', sunlit: 'noon' },
        lines: ['Your town faces the sun.', 'The sun is highest and shadows are shortest.'],
      },
      {
        label: 'Evening',
        earth: { spot: 'top', sunlit: 'evening' },
        lines: ['Your town turns away from the light.', 'The sun sets in the west.'],
      },
      {
        label: 'Midnight',
        earth: { spot: 'top', sunlit: 'midnight' },
        lines: ['Your town is on the dark side.', 'Now it is day on the other side of Earth.'],
      },
    ],
  },
  {
    kind: 'observe',
    id: 's.5.shadows-day-night~daylight-months',
    title: 'Hours of daylight through the year',
    use: 'Use this to record hours of daylight through the year and see the pattern.',
    assumptions: [
      'Daylight is the time from sunrise to sunset.',
      'These are for a town in the northern United States.',
      'Tap a bar to change that month’s daylight.',
    ],
    columns: ['Dec', 'Feb', 'Apr', 'Jun', 'Aug', 'Oct'],
    rowLabel: 'Daylight',
    unit: 'hours',
    max: 16,
    step: 1,
    initial: [9, 10, 13, 15, 14, 11],
    pattern: (v) => {
      const months = ['December', 'February', 'April', 'June', 'August', 'October'];
      const hi = v.indexOf(Math.max(...v));
      const lo = v.indexOf(Math.min(...v));
      if (hi === lo) return 'Every month has the same daylight. That happens near the equator.';
      return `Most daylight: ${months[hi]} (${v[hi]} hours). Least: ${months[lo]} (${v[lo]} hours).`;
    },
  },
  {
    kind: 'sort',
    id: 's.5.shadows-day-night~season-stars',
    title: 'Star patterns by season',
    use: 'Use this to sort star patterns by the season they are seen in the evening sky.',
    assumptions: [
      'As Earth goes around the sun, the night side faces different stars.',
      'Some star patterns near the North Star are seen all year.',
      'These are for the evening sky in the northern United States.',
      'Tap a card, then tap its group.',
    ],
    question: 'When is it seen in the evening sky?',
    bins: [
      { id: 'winter', label: 'Winter', why: 'The night side faces these stars in winter.' },
      { id: 'summer', label: 'Summer', why: 'The night side faces these stars in summer.' },
      { id: 'all', label: 'All year', why: 'They circle close to the North Star and never set.' },
    ],
    cards: [
      { label: 'Orion', bin: 'winter' },
      { label: 'Taurus', bin: 'winter' },
      { label: 'Scorpius', bin: 'summer' },
      { label: 'Cygnus', bin: 'summer' },
      { label: 'Big Dipper', bin: 'all' },
      { label: 'Cassiopeia', bin: 'all' },
    ],
  },
  {
    kind: 'sort',
    id: 's.5.protect-resources',
    assumptions: [
      'People use Earth’s air, water, land and living things every day.',
      'Communities can change what they do to protect them.',
      'Tap a card, then tap its group.',
    ],
    question: 'What does this action protect most?',
    bins: [
      { id: 'air', label: 'Air', why: 'Less smoke and fumes in the air we breathe.' },
      { id: 'water', label: 'Water', why: 'Cleaner rivers and less water wasted.' },
      { id: 'land', label: 'Land', why: 'Less trash and healthier soil.' },
      { id: 'life', label: 'Living things', why: 'Safe homes for plants and animals.' },
    ],
    cards: [
      { label: 'Riding a bike instead of driving', bin: 'air' },
      { label: 'Planting trees along a busy road', bin: 'air' },
      { label: 'Fixing a dripping tap', bin: 'water' },
      { label: 'Keeping oil out of storm drains', bin: 'water' },
      { label: 'Recycling cans and paper', bin: 'land' },
      { label: 'Composting food scraps', bin: 'land' },
      { label: 'Protecting a wetland as a park', bin: 'life' },
      { label: 'Building a bridge for animals over a highway', bin: 'life' },
    ],
  },
];
