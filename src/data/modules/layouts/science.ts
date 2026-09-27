/**
 * Science K–3 pages that are sorts, sequences, explorations or observations rather than
 * calculators (the lesson reviewer's layout proposals, docs/REVIEW_LOG.md).
 */
import type { LayoutDef } from './types';

const F = '°F';

export const SCIENCE_LAYOUTS: LayoutDef[] = [
  // ── Kindergarten ──
  {
    kind: 'explore',
    id: 's.K.pushes-pulls~direction',
    title: 'Which way a push sends it',
    use: 'Use this to see what a push from each side does.',
    assumptions: [
      'A push or a pull can start, stop or turn a ball.',
      'The ball moves the way the push points.',
      'Opening a door can be a push or a pull.',
    ],
    figure: { kind: 'push' },
    scenes: [
      {
        label: 'Push from behind',
        push: { from: 'behind', strength: 'gentle' },
        lines: ['The ball goes forward.'],
      },
      {
        label: 'Hard push',
        push: { from: 'behind', strength: 'hard' },
        lines: ['The ball goes faster and farther.'],
      },
      {
        label: 'Push from the front',
        push: { from: 'front', strength: 'gentle' },
        lines: ['The ball slows down and stops.'],
      },
      {
        label: 'Push from the side',
        push: { from: 'side', strength: 'gentle' },
        lines: ['The ball turns.'],
      },
      {
        label: 'Pull the string',
        push: { from: 'behind', strength: 'gentle', pull: true },
        lines: ['The ball comes toward you.'],
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.K.sunlight-warms~shade',
    title: 'What makes shade',
    use: 'Use this to sort things by whether they make shade.',
    assumptions: ['Shade keeps a spot cooler.', 'Something that blocks the sun makes shade.'],
    question: 'Does it block the sun?',
    bins: [
      {
        id: 'shade',
        label: 'Makes shade',
        why: 'It blocks the sunlight. The spot under it stays cooler.',
      },
      {
        id: 'through',
        label: 'Lets sun through',
        why: 'Sunlight shines through. The spot under it gets warm.',
      },
    ],
    cards: [
      { label: 'Umbrella', bin: 'shade', figure: { kind: 'icon', icon: 'open umbrella' } },
      { label: 'Tree', bin: 'shade' },
      { label: 'Tent', bin: 'shade', figure: { kind: 'icon', icon: 'tent' } },
      { label: 'Sun hat', bin: 'shade', figure: { kind: 'icon', icon: 'sun hat' } },
      { label: 'Roof', bin: 'shade', figure: { kind: 'icon', icon: 'house roof' } },
      {
        label: 'Clear plastic',
        bin: 'through',
        figure: { kind: 'icon', icon: 'clear plastic cup' },
      },
      { label: 'Window glass', bin: 'through', figure: { kind: 'icon', icon: 'window' } },
      { label: 'Glass door', bin: 'through', figure: { kind: 'icon', icon: 'glass door' } },
    ],
  },
  {
    kind: 'sort',
    id: 's.K.living-needs~who-needs',
    title: 'What plants and animals need',
    use: 'Use this to sort what plants need and what animals need.',
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
    cards: [
      { label: 'Sunlight', bin: 'plants', figure: { kind: 'icon', icon: 'sun' } },
      {
        label: 'Soil for roots',
        bin: 'plants',
        figure: { kind: 'icon', icon: 'pot of soil with roots' },
      },
      { label: 'Food to eat', bin: 'animals' },
      { label: 'A den or nest', bin: 'animals', figure: { kind: 'icon', icon: 'bird nest' } },
      { label: 'Water', bin: 'both', figure: { kind: 'icon', icon: 'water drop' } },
      { label: 'Air', bin: 'both' },
      { label: 'Space to grow', bin: 'both' },
    ],
  },
  {
    kind: 'sort',
    id: 's.K.living-needs~homes',
    title: 'Where animals live',
    use: 'Use this to match each animal to a place it can live.',
    assumptions: [
      'An animal lives where it finds food, water and shelter.',
      'Each place has what its animals need.',
    ],
    question: 'Where can it get what it needs?',
    bins: [
      { id: 'pond', label: 'Pond', why: 'Pond animals need lots of water.' },
      { id: 'forest', label: 'Forest', why: 'Trees give food and places to hide.' },
      { id: 'desert', label: 'Desert', why: 'Desert animals need little water.' },
    ],
    cards: [
      { label: 'Fish', bin: 'pond', figure: { kind: 'icon', icon: 'fish' } },
      { label: 'Frog', bin: 'pond', figure: { kind: 'icon', icon: 'frog' } },
      { label: 'Duck', bin: 'pond', figure: { kind: 'icon', icon: 'duck' } },
      { label: 'Deer', bin: 'forest', figure: { kind: 'icon', icon: 'deer' } },
      { label: 'Owl', bin: 'forest', figure: { kind: 'icon', icon: 'owl' } },
      { label: 'Squirrel', bin: 'forest', figure: { kind: 'icon', icon: 'squirrel' } },
      { label: 'Camel', bin: 'desert', figure: { kind: 'icon', icon: 'camel hump' } },
      { label: 'Lizard', bin: 'desert', figure: { kind: 'icon', icon: 'lizard' } },
      { label: 'Roadrunner', bin: 'desert', figure: { kind: 'icon', icon: 'roadrunner' } },
    ],
  },
  {
    kind: 'sequence',
    id: 's.K.weather-patterns~storm',
    title: 'Getting ready for a storm',
    use: 'Use this to put the storm jobs in order.',
    assumptions: [
      'A forecast warns that a storm is coming.',
      'Get ready before the storm, not during it.',
      'Bring toys in and close windows, in any order.',
    ],
    question: 'Put the jobs in order. Tap the first one, then the next.',
    stages: [
      { label: 'Hear the forecast', figure: { kind: 'icon', icon: 'hearing a storm forecast' } },
      {
        label: 'Get ready: bring toys in, close windows',
        figure: { kind: 'icon', icon: 'getting ready for a storm' },
      },
      {
        label: 'Stay inside while it storms',
        figure: { kind: 'icon', icon: 'staying inside in a storm' },
      },
      {
        label: 'Go out when it has passed',
        figure: { kind: 'icon', icon: 'going out after a storm' },
      },
    ],
  },
  {
    kind: 'observe',
    id: 's.K.weather-patterns~morning-afternoon',
    title: 'Warmer as the day goes on',
    use: 'Use this to record the air temperature at three times of day.',
    assumptions: [
      'Read the same thermometer three times in one day.',
      'Tap a bar to change a reading.',
    ],
    columns: ['Morning', 'Noon', 'Afternoon'],
    rowLabel: 'Temperature',
    unit: F,
    max: 100,
    step: 5,
    initial: [55, 65, 70],
    figure: { kind: 'thermometer' },
    pattern: (v) => {
      const [a, , c] = v as [number, number, number];
      if (c > a) return 'It got warmer as the day went on.';
      if (c < a) return 'It got cooler as the day went on.';
      return 'It stayed the same all day.';
    },
  },
  {
    kind: 'sort',
    id: 's.K.weather-patterns~tools',
    title: 'Weather tools',
    use: 'Use this for “Which tool measures how much rain falls?”',
    assumptions: [
      'Scientists use tools to measure the weather each day.',
      'Each tool measures one thing.',
    ],
    question: 'What does it measure?',
    bins: [
      { id: 'warm', label: 'How warm', why: 'A thermometer shows how warm or cold the air is.' },
      { id: 'rain', label: 'How much rain', why: 'A rain gauge collects the rain that falls.' },
      { id: 'wind', label: 'Which way the wind blows', why: 'It turns or points with the wind.' },
    ],
    cards: [
      { label: 'Thermometer', bin: 'warm', figure: { kind: 'icon', icon: 'thermometer' } },
      { label: 'Rain gauge', bin: 'rain', figure: { kind: 'icon', icon: 'rain gauge' } },
      { label: 'Wind vane', bin: 'wind', figure: { kind: 'icon', icon: 'wind vane' } },
      { label: 'Wind sock', bin: 'wind', figure: { kind: 'icon', icon: 'wind sock' } },
    ],
  },
  {
    kind: 'sort',
    id: 's.K.weather-patterns~falls',
    title: 'What falls from clouds?',
    use: 'Use this for “Which is NOT a form of precipitation?”',
    assumptions: [
      'Rain, snow and hail are water that falls from clouds.',
      'Wind and fog do not fall from clouds.',
    ],
    question: 'Does it fall from clouds?',
    bins: [
      {
        id: 'falls',
        label: 'Falls from clouds',
        why: 'Water drops or ice fall down to the ground.',
      },
      { id: 'not', label: 'Does not fall', why: 'It moves across the ground or stays in the air.' },
    ],
    cards: [
      { label: 'Rain', bin: 'falls', figure: { kind: 'icon', icon: 'rain cloud' } },
      { label: 'Snow', bin: 'falls', figure: { kind: 'icon', icon: 'snow cloud' } },
      { label: 'Hail', bin: 'falls', figure: { kind: 'icon', icon: 'hail cloud' } },
      { label: 'Wind', bin: 'not', figure: { kind: 'icon', icon: 'tree in wind' } },
      { label: 'Fog', bin: 'not', figure: { kind: 'icon', icon: 'fog over houses' } },
    ],
  },
  {
    kind: 'sort',
    id: 's.K.living-things-change-environment',
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
    cards: [
      {
        label: 'Beaver builds a dam',
        bin: 'animals',
        figure: { kind: 'icon', icon: 'beaver at dam' },
      },
      {
        label: 'Squirrel digs a hole',
        bin: 'animals',
        figure: { kind: 'icon', icon: 'squirrel digging' },
      },
      {
        label: 'Bird builds a nest',
        bin: 'animals',
        figure: { kind: 'icon', icon: 'bird building nest' },
      },
      {
        label: 'Tree roots crack the sidewalk',
        bin: 'plants',
        figure: { kind: 'icon', icon: 'roots cracking sidewalk' },
      },
      {
        label: 'Weeds grow through a crack',
        bin: 'plants',
        figure: { kind: 'icon', icon: 'weeds in pavement crack' },
      },
      {
        label: 'People build a road',
        bin: 'people',
        figure: { kind: 'icon', icon: 'road roller on new road' },
      },
      {
        label: 'People plant a garden',
        bin: 'people',
        figure: { kind: 'icon', icon: 'hands planting garden' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.K.living-things-change-environment~helps',
    title: 'Choices that help the land',
    use: 'Use this to sort choices that help or hurt the land.',
    assumptions: ['People can choose to keep a place clean.', 'Small choices add up.'],
    question: 'Does it help or hurt?',
    bins: [
      { id: 'helps', label: 'Helps', why: 'It keeps the land, water and air clean.' },
      { id: 'hurts', label: 'Hurts', why: 'It makes a mess or wastes.' },
    ],
    cards: [
      {
        label: 'Pick up litter',
        bin: 'helps',
        figure: { kind: 'icon', icon: 'hand putting can in bin' },
      },
      { label: 'Reuse a bag', bin: 'helps', figure: { kind: 'icon', icon: 'cloth shopping bag' } },
      {
        label: 'Turn off the water',
        bin: 'helps',
        figure: { kind: 'icon', icon: 'hand closing faucet' },
      },
      {
        label: 'Plant a tree',
        bin: 'helps',
        figure: { kind: 'icon', icon: 'planting a tree sapling' },
      },
      {
        label: 'Drop a wrapper',
        bin: 'hurts',
        figure: { kind: 'icon', icon: 'wrapper falling on grass' },
      },
      {
        label: 'Leave the water running',
        bin: 'hurts',
        figure: { kind: 'icon', icon: 'running faucet' },
      },
      {
        label: 'Pick all the flowers',
        bin: 'hurts',
        figure: { kind: 'icon', icon: 'hand with picked flowers' },
      },
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
      drawing: 'plant',
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
      drawing: 'animal',
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
        lines: ['Ears hear sounds from far away. Big ears catch soft sounds.'],
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
    id: 's.1.sound-vibration',
    assumptions: [
      'Sound comes from something shaking back and forth.',
      'That shaking is called vibrating.',
      'When the shaking stops, the sound stops.',
    ],
    figure: { kind: 'vibration' },
    scenes: [
      {
        label: 'Pluck a rubber band',
        vibrate: { thing: 'band', shaking: true },
        lines: ['It shakes fast. You hear a twang.'],
      },
      {
        label: 'Stop the band',
        vibrate: { thing: 'band', shaking: false },
        lines: ['It stops shaking. The sound stops.'],
      },
      {
        label: 'Hum',
        vibrate: { thing: 'voice', shaking: true },
        lines: ['Touch your throat. You feel it shake.'],
      },
      {
        label: 'Tap a drum with rice',
        vibrate: { thing: 'drum', shaking: true },
        lines: ['The drum shakes. The rice jumps.'],
      },
      {
        label: 'Ring a bell',
        vibrate: { thing: 'bell', shaking: true },
        lines: ['The bell shakes. Touch it and it goes quiet.'],
      },
    ],
  },
  {
    kind: 'sequence',
    id: 's.1.sound-vibration~cup-phone',
    title: 'A cup phone',
    use: 'Use this to put the steps of a cup phone in order.',
    assumptions: [
      'Two cups are joined by a tight string.',
      'The shaking travels along the string.',
    ],
    question: 'How does your voice get to your friend?',
    stages: [
      {
        label: 'Your voice shakes the cup',
        figure: { kind: 'icon', icon: 'cup phone voice shakes cup' },
      },
      { label: 'The string shakes', figure: { kind: 'icon', icon: 'cup phone string shakes' } },
      { label: 'The other cup shakes', figure: { kind: 'icon', icon: 'cup phone far cup shakes' } },
      { label: 'Your friend hears you', figure: { kind: 'icon', icon: 'cup phone friend hears' } },
    ],
  },
  {
    kind: 'explore',
    id: 's.1.light-shadows',
    assumptions: [
      'You see things when light shines on them.',
      'A shadow forms where something blocks the light.',
    ],
    figure: { kind: 'lightPath' },
    scenes: [
      {
        label: 'Lamp on',
        light: { lamp: true },
        lines: ['Light bounces off the apple into your eye. You see it.'],
      },
      { label: 'Dark room', light: { lamp: false }, lines: ['No light, so you see nothing.'] },
      {
        label: 'Block the light',
        light: { lamp: true, blocker: 'solid', height: 'high' },
        lines: ['The block stops the light. It makes a shadow.'],
      },
      {
        label: 'Low lamp',
        light: { lamp: true, wall: true, height: 'low' },
        lines: ['A low light makes a long shadow.'],
      },
      {
        label: 'High lamp',
        light: { lamp: true, wall: true, height: 'high' },
        lines: ['A high light makes a short shadow.'],
      },
      {
        label: 'Mirror',
        light: { lamp: true, blocker: 'mirror' },
        lines: ['The mirror bounces the light to a new place.'],
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
      {
        label: 'Help',
        flashes: '● ● ● — — — ● ● ●',
        lines: ['Three short, three long, three short means help.'],
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.1.structures-function~beaks',
    title: 'Beaks shaped for their food',
    use: 'Use this to match a beak to the food it fits.',
    assumptions: [
      'A bird’s beak is a tool for its food.',
      'Look at the shape: thick, thin, long or hooked.',
    ],
    question: 'What food does this beak fit?',
    bins: [
      { id: 'seeds', label: 'Seeds', why: 'A short thick beak cracks seeds.' },
      { id: 'nectar', label: 'Nectar', why: 'A long thin beak reaches deep into flowers.' },
      { id: 'fish', label: 'Fish', why: 'A long beak spears or scoops fish.' },
      { id: 'meat', label: 'Meat', why: 'A hooked beak tears meat.' },
    ],
    cards: [
      {
        label: 'Finch',
        bin: 'seeds',
        figure: {
          kind: 'polygon',
          points: [
            [10, 25],
            [80, 50],
            [10, 75],
          ],
        },
      },
      {
        label: 'Cardinal',
        bin: 'seeds',
        figure: {
          kind: 'polygon',
          points: [
            [15, 28],
            [75, 50],
            [15, 72],
          ],
        },
      },
      {
        label: 'Hummingbird',
        bin: 'nectar',
        figure: {
          kind: 'polygon',
          points: [
            [5, 46],
            [98, 50],
            [5, 54],
          ],
        },
      },
      {
        label: 'Heron',
        bin: 'fish',
        figure: {
          kind: 'polygon',
          points: [
            [5, 38],
            [95, 50],
            [5, 62],
          ],
        },
      },
      {
        label: 'Pelican',
        bin: 'fish',
        figure: {
          kind: 'polygon',
          points: [
            [5, 30],
            [95, 36],
            [88, 44],
            [45, 85],
            [10, 72],
            [5, 50],
          ],
        },
      },
      {
        label: 'Hawk',
        bin: 'meat',
        figure: {
          kind: 'polygon',
          points: [
            [8, 28],
            [55, 28],
            [82, 45],
            [76, 72],
            [66, 52],
            [8, 66],
          ],
        },
      },
      {
        label: 'Owl',
        bin: 'meat',
        figure: {
          kind: 'polygon',
          points: [
            [15, 30],
            [55, 32],
            [72, 50],
            [66, 72],
            [58, 56],
            [15, 64],
          ],
        },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.1.structures-function~copy',
    title: 'Tools copied from plants and animals',
    use: 'Use this to match plant and animal parts to tools.',
    assumptions: [
      'People copy plant and animal parts to solve problems.',
      'A part and its tool do the same job.',
    ],
    question: 'What job does it do?',
    bins: [
      { id: 'safe', label: 'Keeps safe', why: 'A hard cover keeps soft bodies safe.' },
      { id: 'warm', label: 'Keeps warm', why: 'Thick fur and feathers hold in heat.' },
      { id: 'swim', label: 'Helps swim', why: 'Wide flat feet push the water.' },
      { id: 'hold', label: 'Holds on', why: 'Tiny hooks grab and hold.' },
    ],
    cards: [
      { label: 'Turtle shell', bin: 'safe' },
      { label: 'Bike helmet', bin: 'safe' },
      { label: 'Bear fur', bin: 'warm', figure: { kind: 'icon', icon: 'thick fur' } },
      { label: 'Winter coat', bin: 'warm' },
      { label: 'Duck feet', bin: 'swim' },
      { label: 'Swim fins', bin: 'swim' },
      { label: 'Burrs', bin: 'hold' },
      { label: 'Hook-and-loop strap', bin: 'hold' },
    ],
  },
  {
    kind: 'sort',
    id: 's.1.offspring',
    assumptions: [
      'Young animals and plants look like their parents.',
      'They are not exactly the same.',
    ],
    question: 'Is the kitten like its mother here?',
    header: {
      kind: 'offspring',
      animals: [
        { animal: 'cat', label: 'Mother', fur: 'orange' },
        { animal: 'cat', label: 'Kitten', young: true, fur: 'gray', nosePatch: true },
      ],
    },
    bins: [
      { id: 'same', label: 'Same', why: 'Young animals look like their parents.' },
      { id: 'different', label: 'Different', why: 'They are not exactly the same.' },
    ],
    cards: [
      { label: 'Has whiskers', bin: 'same' },
      { label: 'Has four legs', bin: 'same' },
      { label: 'Has a tail', bin: 'same' },
      { label: 'Has pointy ears', bin: 'same' },
      { label: 'Much smaller', bin: 'different' },
      { label: 'White patch on its nose', bin: 'different' },
      { label: 'Gray fur, not orange', bin: 'different' },
    ],
  },
  {
    kind: 'sort',
    id: 's.1.offspring~deer',
    title: 'A fawn and its parents',
    use: 'Use this for a doe, a buck and a fawn.',
    assumptions: [
      'A fawn is a young deer. A buck is the father; a doe is the mother.',
      'Young animals look like their parents, but not exactly.',
    ],
    question: 'Is the fawn like its parents here?',
    header: {
      kind: 'offspring',
      animals: [
        { animal: 'deer', label: 'Doe' },
        { animal: 'deer', label: 'Buck', antlers: true },
        { animal: 'deer', label: 'Fawn', young: true, spots: true },
      ],
    },
    bins: [
      { id: 'same', label: 'Same', why: 'Young animals look like their parents.' },
      { id: 'different', label: 'Different', why: 'It is young, and not exactly the same.' },
    ],
    cards: [
      { label: 'Has four legs', bin: 'same' },
      { label: 'Has hooves', bin: 'same' },
      { label: 'Has brown fur', bin: 'same' },
      { label: 'Has big ears', bin: 'same' },
      { label: 'Much smaller', bin: 'different' },
      { label: 'White spots on its back', bin: 'different' },
      { label: 'Has no antlers yet', bin: 'different' },
    ],
  },
  {
    kind: 'sort',
    id: 's.1.offspring~care',
    title: 'How parents help their young',
    use: 'Use this to sort how parents help their young.',
    assumptions: [
      'Many parents take care of their young.',
      'Their care helps the young stay alive.',
    ],
    question: 'How does the parent help?',
    bins: [
      { id: 'food', label: 'Food', why: 'Parents bring food or feed their young.' },
      { id: 'safety', label: 'Safety', why: 'Parents keep their young away from danger.' },
      { id: 'warmth', label: 'Warmth', why: 'Parents keep eggs and young warm.' },
    ],
    cards: [
      {
        label: 'Bird brings worms',
        bin: 'food',
        figure: { kind: 'icon', icon: 'bird feeding chicks' },
      },
      {
        label: 'Cow feeds her calf',
        bin: 'food',
        figure: { kind: 'icon', icon: 'calf drinking milk' },
      },
      { label: 'Kangaroo pouch', bin: 'safety', figure: { kind: 'icon', icon: 'joey in pouch' } },
      {
        label: 'Lion carries her cub',
        bin: 'safety',
        figure: { kind: 'icon', icon: 'lioness carrying cub' },
      },
      {
        label: 'Hen sits on her eggs',
        bin: 'warmth',
        figure: { kind: 'icon', icon: 'hen on nest' },
      },
      {
        label: 'Penguin keeps its chick on its feet',
        bin: 'warmth',
        figure: { kind: 'icon', icon: 'penguin chick on feet' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.1.offspring~match',
    title: 'Who will it grow up to be?',
    use: 'Use this to match young ones to the grown-up they become.',
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
    cards: [
      { label: 'Tadpole', bin: 'frog', figure: { kind: 'icon', icon: 'tadpole' } },
      { label: 'Frog eggs', bin: 'frog', figure: { kind: 'icon', icon: 'frog eggs' } },
      { label: 'Caterpillar', bin: 'butterfly', figure: { kind: 'icon', icon: 'caterpillar' } },
      { label: 'Chrysalis', bin: 'butterfly', figure: { kind: 'icon', icon: 'chrysalis' } },
      { label: 'Acorn', bin: 'oak', figure: { kind: 'icon', icon: 'acorn' } },
      { label: 'Oak seedling', bin: 'oak', figure: { kind: 'icon', icon: 'oak seedling' } },
    ],
  },
  {
    kind: 'explore',
    id: 's.1.sky-patterns~sun-path',
    title: 'The sun across the sky',
    use: 'Use this to see where the sun is during the day.',
    assumptions: [
      'The sun seems to move across the sky each day.',
      'It rises in the east and sets in the west.',
    ],
    figure: { kind: 'sky' },
    scenes: [
      {
        label: 'Morning',
        sky: { body: 'sun', at: 'east' },
        lines: ['The sun comes up in the east. It is low.'],
      },
      { label: 'Noon', sky: { body: 'sun', at: 'high' }, lines: ['The sun is high in the sky.'] },
      {
        label: 'Evening',
        sky: { body: 'sun', at: 'west' },
        lines: ['The sun goes down in the west.'],
      },
      {
        label: 'Night',
        sky: { body: 'night', at: 'high' },
        lines: ['We see stars. We often see the moon too.'],
      },
      {
        label: 'Moon rising',
        sky: { body: 'night', at: 'east', phase: 'full', rising: true },
        lines: ['The moon also rises in the east.'],
      },
      {
        label: 'Moon setting',
        sky: { body: 'night', at: 'west', phase: 'full' },
        lines: ['Like the sun, the moon sets in the west.'],
      },
    ],
  },
  {
    kind: 'explore',
    id: 's.1.sky-patterns~moon-cycle',
    title: 'The moon through a month',
    use: 'Use this for “Which shows the moon a week after new moon?”',
    assumptions: [
      'The lit part grows for two weeks. Then it shrinks for two weeks.',
      'As it grows, the right side is lit. As it shrinks, the left side is lit.',
      'The row shows all eight shapes. The ring marks this one.',
    ],
    figure: { kind: 'sky' },
    scenes: [
      {
        label: 'New moon',
        sky: { body: 'night', at: 'high', phase: 'new', cycle: true },
        lines: ['We can’t see the moon.'],
      },
      {
        label: 'Growing crescent',
        sky: { body: 'night', at: 'high', phase: 'waxing crescent', cycle: true },
        lines: ['A thin sliver, lit on the right.'],
      },
      {
        label: 'Half moon',
        sky: { body: 'night', at: 'high', phase: 'first quarter', cycle: true },
        lines: ['About a week after new moon.', 'The right half is lit.'],
      },
      {
        label: 'Almost full',
        sky: { body: 'night', at: 'high', phase: 'waxing gibbous', cycle: true },
        lines: ['More than half is lit, and it is still growing.'],
      },
      {
        label: 'Full moon',
        sky: { body: 'night', at: 'high', phase: 'full', cycle: true },
        lines: ['About two weeks after new moon.', 'The whole face is lit.'],
      },
      {
        label: 'Shrinking',
        sky: { body: 'night', at: 'high', phase: 'waning gibbous', cycle: true },
        lines: ['The lit part gets smaller each night.'],
      },
      {
        label: 'Other half',
        sky: { body: 'night', at: 'high', phase: 'third quarter', cycle: true },
        lines: ['About three weeks after new moon.', 'The left half is lit.'],
      },
      {
        label: 'Shrinking crescent',
        sky: { body: 'night', at: 'high', phase: 'waning crescent', cycle: true },
        lines: ['A thin sliver, lit on the left.', 'Then it is new moon again.'],
      },
    ],
  },
  {
    kind: 'sequence',
    id: 's.1.sky-patterns~moon',
    title: 'The moon’s shapes in order',
    use: 'Use this to put the moon’s shapes in order.',
    assumptions: ['The moon’s shape changes in a pattern.', 'Then it shrinks back the same way.'],
    question: 'Put the shapes in order, from new moon to full moon.',
    stages: [
      { label: 'New moon', span: 1, figure: { kind: 'moon', phase: 'new' } },
      { label: 'Thin crescent', span: 6, figure: { kind: 'moon', phase: 'waxing crescent' } },
      { label: 'Half moon', span: 1, figure: { kind: 'moon', phase: 'first quarter' } },
      { label: 'Almost full', span: 6, figure: { kind: 'moon', phase: 'waxing gibbous' } },
      { label: 'Full moon', span: 1, figure: { kind: 'moon', phase: 'full' } },
    ],
    unit: 'days',
    totalLabel: 'New moon to full moon',
  },
  {
    kind: 'sequence',
    id: 's.1.sky-patterns~moon-waning',
    title: 'The moon shrinks back',
    use: 'Use this for the moon’s shapes in the nights after full moon.',
    assumptions: [
      'After full moon, the lit part gets smaller each night.',
      'The shapes come back in the same order, the other way round.',
    ],
    question: 'Put the shapes in order, from full moon to new moon.',
    stages: [
      { label: 'Full moon', span: 1, figure: { kind: 'moon', phase: 'full' } },
      { label: 'Almost full', span: 6, figure: { kind: 'moon', phase: 'waning gibbous' } },
      { label: 'Half moon', span: 1, figure: { kind: 'moon', phase: 'third quarter' } },
      { label: 'Thin crescent', span: 6, figure: { kind: 'moon', phase: 'waning crescent' } },
      { label: 'New moon', span: 1, figure: { kind: 'moon', phase: 'new' } },
    ],
    unit: 'days',
    totalLabel: 'Full moon to new moon',
  },
  {
    kind: 'sort',
    id: 's.1.light-shadows~materials',
    title: 'What light does with each material',
    use: 'Use this to sort materials by what light does to them.',
    assumptions: [
      'Shine a flashlight at each material.',
      'Some let the light through. Some block it. Shiny ones bounce it.',
    ],
    question: 'What does light do when it hits it?',
    bins: [
      { id: 'through', label: 'Goes through', why: 'Clear things let the light through.' },
      { id: 'some', label: 'Some goes through', why: 'You see a glow, not a clear picture.' },
      { id: 'blocked', label: 'Blocked', why: 'No light gets through. It makes a shadow.' },
      { id: 'bounces', label: 'Bounces back', why: 'Shiny things bounce the light back.' },
    ],
    cards: [
      { label: 'Window glass', bin: 'through', figure: { kind: 'icon', icon: 'window' } },
      {
        label: 'Clear plastic',
        bin: 'through',
        figure: { kind: 'icon', icon: 'clear plastic cup' },
      },
      { label: 'Wax paper', bin: 'some', figure: { kind: 'icon', icon: 'wax paper' } },
      { label: 'Tissue paper', bin: 'some', figure: { kind: 'icon', icon: 'tissue paper' } },
      { label: 'Wood', bin: 'blocked', figure: { kind: 'icon', icon: 'wooden block' } },
      { label: 'A book', bin: 'blocked', figure: { kind: 'icon', icon: 'closed book' } },
      { label: 'A mirror', bin: 'bounces', figure: { kind: 'icon', icon: 'hand mirror' } },
      { label: 'A shiny spoon', bin: 'bounces', figure: { kind: 'icon', icon: 'metal spoon' } },
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
    ],
    question: 'Does it bend?',
    bins: [
      { id: 'easy', label: 'Bends easily', why: 'Soft and stretchy things bend easily.' },
      { id: 'little', label: 'Bends a little', why: 'Thin, stiff things bend a little.' },
      { id: 'no', label: 'Does not bend', why: 'Hard, thick things do not bend.' },
    ],
    cards: [
      { label: 'Rubber band', bin: 'easy', figure: { kind: 'icon', icon: 'rubber band' } },
      { label: 'String', bin: 'easy', figure: { kind: 'icon', icon: 'piece of string' } },
      { label: 'Cloth', bin: 'easy', figure: { kind: 'icon', icon: 'folded cloth' } },
      { label: 'Craft stick', bin: 'little', figure: { kind: 'icon', icon: 'craft stick' } },
      { label: 'Plastic ruler', bin: 'little', figure: { kind: 'icon', icon: 'plastic ruler' } },
      { label: 'Cardboard', bin: 'little', figure: { kind: 'icon', icon: 'cardboard piece' } },
      { label: 'Rock', bin: 'no', figure: { kind: 'icon', icon: 'gray rock' } },
      { label: 'Metal spoon', bin: 'no', figure: { kind: 'icon', icon: 'metal spoon' } },
      { label: 'Glass', bin: 'no', figure: { kind: 'icon', icon: 'drinking glass' } },
    ],
  },
  {
    kind: 'sort',
    id: 's.2.heating-cooling',
    assumptions: [
      'Heating and cooling change things.',
      'Melted ice can freeze again. A cooked egg stays cooked.',
    ],
    question: 'Can the change be undone?',
    bins: [
      { id: 'yes', label: 'Can be undone', why: 'Cool it or warm it, and it goes back.' },
      { id: 'no', label: 'Cannot be undone', why: 'It is a new thing now. It will not go back.' },
    ],
    cards: [
      { label: 'Melting ice', bin: 'yes', figure: { kind: 'icon', icon: 'melting ice cube' } },
      { label: 'Freezing water', bin: 'yes', figure: { kind: 'icon', icon: 'ice cube tray' } },
      { label: 'Melting a crayon', bin: 'yes', figure: { kind: 'icon', icon: 'melted crayon' } },
      {
        label: 'Melting chocolate',
        bin: 'yes',
        figure: { kind: 'icon', icon: 'melting chocolate bar' },
      },
      {
        label: 'Boiling water into steam',
        bin: 'yes',
        figure: { kind: 'icon', icon: 'pot of boiling water' },
      },
      { label: 'Cooking an egg', bin: 'no', figure: { kind: 'icon', icon: 'fried egg in a pan' } },
      { label: 'Burning paper', bin: 'no', figure: { kind: 'icon', icon: 'burning paper' } },
      { label: 'Baking bread', bin: 'no', figure: { kind: 'icon', icon: 'loaf of bread' } },
      { label: 'Toasting bread', bin: 'no', figure: { kind: 'icon', icon: 'slice of toast' } },
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
    figure: { kind: 'plantHeight' },
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
    id: 's.2.pollination-dispersal',
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
    cards: [
      {
        label: 'Dandelion fluff',
        bin: 'wind',
        figure: { kind: 'icon', icon: 'dandelion seed head' },
      },
      {
        label: 'Maple seed with wings',
        bin: 'wind',
        figure: { kind: 'icon', icon: 'winged maple seed' },
      },
      { label: 'Milkweed fluff', bin: 'wind', figure: { kind: 'icon', icon: 'milkweed pod' } },
      {
        label: 'Burr on a dog’s fur',
        bin: 'animal',
        figure: { kind: 'icon', icon: 'burr in dog fur' },
      },
      {
        label: 'Berry eaten by a bird',
        bin: 'animal',
        figure: { kind: 'icon', icon: 'bird eating berry' },
      },
      {
        label: 'Acorn buried by a squirrel',
        bin: 'animal',
        figure: { kind: 'icon', icon: 'squirrel burying acorn' },
      },
      { label: 'Coconut', bin: 'water', figure: { kind: 'icon', icon: 'floating coconut' } },
      {
        label: 'Water lily seed',
        bin: 'water',
        figure: { kind: 'icon', icon: 'water lily seed pod' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.2.erosion-landforms~map',
    title: 'Land and water on a map',
    use: 'Use this to sort the places on a map into land and water.',
    assumptions: ['A map shows where the land and the water are.', 'Blue on a map is water.'],
    question: 'Is it land or water?',
    bins: [
      { id: 'land', label: 'Land', why: 'Mountains, hills and valleys are shapes of the land.' },
      { id: 'water', label: 'Water', why: 'Lakes, rivers and oceans are bodies of water.' },
    ],
    cards: [
      { label: 'Mountain', bin: 'land', figure: { kind: 'icon', icon: 'mountain' } },
      { label: 'Hill', bin: 'land', figure: { kind: 'icon', icon: 'hill' } },
      { label: 'Valley', bin: 'land', figure: { kind: 'icon', icon: 'valley' } },
      { label: 'Island', bin: 'land', figure: { kind: 'icon', icon: 'island' } },
      { label: 'Lake', bin: 'water', figure: { kind: 'icon', icon: 'lake' } },
      { label: 'River', bin: 'water', figure: { kind: 'icon', icon: 'river' } },
      { label: 'Ocean', bin: 'water', figure: { kind: 'icon', icon: 'ocean' } },
      { label: 'Pond', bin: 'water', figure: { kind: 'icon', icon: 'pond' } },
    ],
  },
  {
    kind: 'sort',
    id: 's.2.erosion-landforms',
    assumptions: [
      'Some changes to the land happen in a day. Some take many years.',
      'Wind and water wear the land away slowly.',
    ],
    question: 'Does it change the land fast or slowly?',
    bins: [
      { id: 'fast', label: 'Fast', why: 'A fast change happens in minutes or days.' },
      { id: 'slow', label: 'Slow', why: 'A slow change takes many years.' },
    ],
    cards: [
      { label: 'Earthquake', bin: 'fast', figure: { kind: 'icon', icon: 'earthquake crack' } },
      {
        label: 'Volcano erupting',
        bin: 'fast',
        figure: { kind: 'icon', icon: 'erupting volcano' },
      },
      { label: 'Landslide', bin: 'fast', figure: { kind: 'icon', icon: 'landslide' } },
      { label: 'Flood', bin: 'fast', figure: { kind: 'icon', icon: 'flooded road' } },
      {
        label: 'River wearing a canyon',
        bin: 'slow',
        figure: { kind: 'icon', icon: 'river canyon' },
      },
      {
        label: 'Wind shaping a sand dune',
        bin: 'slow',
        figure: { kind: 'icon', icon: 'wind shaping dune' },
      },
      {
        label: 'Ice cracking a rock',
        bin: 'slow',
        figure: { kind: 'icon', icon: 'ice cracking rock' },
      },
      {
        label: 'Waves wearing a cliff',
        bin: 'slow',
        figure: { kind: 'icon', icon: 'waves at cliff' },
      },
    ],
  },

  {
    kind: 'sort',
    id: 's.2.material-properties~best',
    title: 'The best material for the job',
    use: 'Use this for “Why is metal good for a cooking pan?”',
    assumptions: [
      'Every material has properties: hard, soft, clear, waterproof.',
      'Pick the material whose property fits the job.',
    ],
    question: 'Which property does the job need?',
    bins: [
      { id: 'waterproof', label: 'Waterproof', why: 'Water runs off. It does not soak in.' },
      { id: 'clear', label: 'Clear', why: 'You can see through it.' },
      { id: 'soft', label: 'Soft', why: 'It bends and squashes. It feels gentle.' },
      { id: 'hard', label: 'Hard', why: 'It keeps its shape when you push it.' },
      { id: 'heat', label: 'Lets heat through', why: 'Metal lets heat pass through it fast.' },
      { id: 'noheat', label: 'Keeps heat out', why: 'Plastic, wood and cloth slow the heat.' },
    ],
    cards: [
      { label: 'Raincoat', bin: 'waterproof' },
      { label: 'Umbrella', bin: 'waterproof' },
      { label: 'Window', bin: 'clear' },
      { label: 'Glasses', bin: 'clear' },
      { label: 'Pillow', bin: 'soft' },
      { label: 'Blanket', bin: 'soft' },
      { label: 'Hammer', bin: 'hard' },
      { label: 'Wooden chair', bin: 'hard' },
      { label: 'Cooking pan', bin: 'heat' },
      { label: 'Kettle', bin: 'heat', figure: { kind: 'icon', icon: 'kettle' } },
      { label: 'Pan handle', bin: 'noheat', figure: { kind: 'icon', icon: 'pan handle' } },
      { label: 'Oven mitt', bin: 'noheat', figure: { kind: 'icon', icon: 'oven mitt' } },
    ],
  },
  {
    kind: 'sort',
    id: 's.2.plant-growth-investigation~fair-test',
    title: 'Planning a fair test',
    use: 'Use this for “Which student changed only the sunlight?”',
    assumptions: [
      'A fair test changes only one thing.',
      'Everything else stays the same for both plants.',
    ],
    question: 'In the sunlight test, is it the same for both plants?',
    bins: [
      { id: 'same', label: 'Same for both', why: 'Keep it the same so only one thing changes.' },
      { id: 'different', label: 'Different', why: 'This is the one thing you test.' },
    ],
    cards: [
      { label: 'Water each day', bin: 'same' },
      { label: 'Kind of seed', bin: 'same' },
      { label: 'Size of pot', bin: 'same' },
      { label: 'Kind of soil', bin: 'same' },
      { label: 'Number of plants in each group', bin: 'same' },
      { label: 'Sunlight', bin: 'different' },
    ],
  },
  {
    kind: 'sequence',
    id: 's.2.pollination-dispersal~pollen',
    title: 'How a bee carries pollen',
    use: 'Use this to put the steps of pollination in order.',
    assumptions: [
      'Many flowers need pollen from another flower to make seeds.',
      'Bees carry the pollen without knowing it.',
    ],
    question: 'Put the steps in order.',
    stages: [
      {
        label: 'A bee lands on a flower to drink nectar',
        figure: { kind: 'icon', icon: 'bee on flower' },
      },
      {
        label: 'Pollen sticks to its hairy body',
        figure: { kind: 'icon', icon: 'bee with pollen' },
      },
      {
        label: 'The bee flies to another flower of the same kind',
        figure: { kind: 'icon', icon: 'bee between flowers' },
      },
      {
        label: 'Pollen rubs off on that flower',
        figure: { kind: 'icon', icon: 'pollen on flower' },
      },
      {
        label: 'The flower can now make seeds',
        figure: { kind: 'icon', icon: 'flower making seeds' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.2.habitats~which-habitat',
    title: 'Which habitat?',
    use: 'Use this for “Which group would all live in a rain forest?”',
    assumptions: [
      'A habitat gives a living thing what it needs.',
      'Different habitats have different living things.',
    ],
    question: 'Where does it live?',
    bins: [
      { id: 'ocean', label: 'Ocean', why: 'Salty water, from the shore to the deep sea.' },
      { id: 'desert', label: 'Desert', why: 'Very little rain. Hot days.' },
      { id: 'rainforest', label: 'Rainforest', why: 'Warm and wet, with tall trees.' },
      { id: 'arctic', label: 'Arctic', why: 'Cold, with ice and snow most of the year.' },
    ],
    cards: [
      { label: 'Whale', bin: 'ocean', figure: { kind: 'icon', icon: 'whale' } },
      { label: 'Octopus', bin: 'ocean', figure: { kind: 'icon', icon: 'octopus' } },
      { label: 'Cactus', bin: 'desert', figure: { kind: 'icon', icon: 'cactus stem' } },
      { label: 'Camel', bin: 'desert', figure: { kind: 'icon', icon: 'camel hump' } },
      { label: 'Monkey', bin: 'rainforest', figure: { kind: 'icon', icon: 'monkey' } },
      { label: 'Parrot', bin: 'rainforest', figure: { kind: 'icon', icon: 'parrot' } },
      { label: 'Tree frog', bin: 'rainforest', figure: { kind: 'icon', icon: 'tree frog' } },
      { label: 'Vines', bin: 'rainforest', figure: { kind: 'icon', icon: 'hanging vines' } },
      { label: 'Polar bear', bin: 'arctic', figure: { kind: 'icon', icon: 'polar bear' } },
      { label: 'Walrus', bin: 'arctic', figure: { kind: 'icon', icon: 'walrus' } },
    ],
  },
  {
    kind: 'sort',
    id: 's.2.erosion-landforms~slow-it',
    title: 'Slowing wind and water',
    use: 'Use this for “Water washed the sand away. What slows it down?”',
    assumptions: [
      'Wind and water carry soil and sand away.',
      'People build and plant things to slow them down.',
    ],
    question: 'Does it slow the wind or the water?',
    bins: [
      { id: 'wind', label: 'Slows wind', why: 'It stands in the wind’s way.' },
      { id: 'water', label: 'Slows water', why: 'It holds the soil or blocks the water.' },
    ],
    cards: [
      { label: 'Row of trees', bin: 'wind', figure: { kind: 'icon', icon: 'row of trees' } },
      { label: 'Snow fence', bin: 'wind', figure: { kind: 'icon', icon: 'snow fence' } },
      {
        label: 'Sandbags along a river',
        bin: 'water',
        figure: { kind: 'icon', icon: 'sandbags on riverbank' },
      },
      {
        label: 'Wall of rocks',
        bin: 'water',
        figure: { kind: 'icon', icon: 'rock wall at shore' },
      },
      { label: 'Dam', bin: 'water', figure: { kind: 'icon', icon: 'dam' } },
    ],
  },
  {
    kind: 'sort',
    id: 's.2.water-on-earth',
    assumptions: [
      'Water is in oceans, rivers, lakes and ponds.',
      'Some water is frozen solid. Some is liquid.',
    ],
    question: 'Is the water solid or liquid?',
    bins: [
      { id: 'solid', label: 'Solid', why: 'Frozen water is ice or snow.' },
      {
        id: 'liquid',
        label: 'Liquid',
        why: 'Liquid water flows and takes the shape of its container.',
      },
    ],
    cards: [
      { label: 'Glacier', bin: 'solid', figure: { kind: 'icon', icon: 'glacier' } },
      { label: 'Iceberg', bin: 'solid', figure: { kind: 'icon', icon: 'iceberg' } },
      {
        label: 'Snow on a mountain',
        bin: 'solid',
        figure: { kind: 'icon', icon: 'snowy mountain' },
      },
      { label: 'Frozen pond', bin: 'solid', figure: { kind: 'icon', icon: 'frozen pond' } },
      { label: 'Ocean', bin: 'liquid', figure: { kind: 'icon', icon: 'ocean' } },
      { label: 'River', bin: 'liquid', figure: { kind: 'icon', icon: 'river' } },
      { label: 'Lake', bin: 'liquid', figure: { kind: 'icon', icon: 'lake' } },
      { label: 'Puddle', bin: 'liquid', figure: { kind: 'icon', icon: 'puddle' } },
    ],
  },

  // ── Grade 3 ──
  {
    kind: 'explore',
    id: 's.3.magnets~poles',
    title: 'Which poles pull, which push',
    use: 'Use this for “Maria pushes magnet 1 toward magnet 2. What happens?”',
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
    id: 's.3.life-cycles',
    assumptions: [
      'A life cycle goes round: egg, caterpillar, chrysalis, butterfly, then eggs again.',
      'One kind of butterfly takes about the same days each time.',
      'Tap the stages in order. The days add up under the strip.',
    ],
    question: 'Put the stages in order, starting with the egg.',
    stages: [
      { label: 'Egg', span: 4, figure: { kind: 'icon', icon: 'butterfly egg on leaf' } },
      { label: 'Caterpillar', span: 14, figure: { kind: 'icon', icon: 'caterpillar' } },
      { label: 'Chrysalis', span: 10, figure: { kind: 'icon', icon: 'chrysalis' } },
      { label: 'Butterfly', span: 14, figure: { kind: 'icon', icon: 'butterfly' } },
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
        animal: 'deer',
        lines: ['One deer must watch for danger by itself.', 'It looks for food alone.'],
      },
      {
        label: 'In a herd',
        dots: [1, 12],
        animal: 'deer',
        lines: [
          'Many eyes watch for danger.',
          'The herd finds food together.',
          'The young stay in the middle, where it is safe.',
        ],
      },
      {
        label: 'Huddled',
        dots: [1, 30],
        animal: 'penguin',
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
      if (hi === lo) return 'Every season is the same. The temperature stays the same all year.';
      return `Warmest: ${seasons[hi]} (${v[hi]} ${F}). Coldest: ${seasons[lo]} (${v[lo]} ${F}). ${seasons[hi]![0]!.toUpperCase()}${seasons[hi]!.slice(1)} is ${v[hi]! - v[lo]!} ${F} warmer than ${seasons[lo]}.`;
    },
  },
  {
    kind: 'sort',
    id: 's.3.balanced-forces~balanced',
    title: 'Balanced or unbalanced?',
    use: 'Use this to sort pushes and pulls into balanced and unbalanced.',
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
    cards: [
      {
        label: 'Book resting on a table',
        bin: 'balanced',
        figure: { kind: 'icon', icon: 'book on table with equal arrows' },
      },
      {
        label: 'Tug of war with no one moving',
        bin: 'balanced',
        figure: { kind: 'icon', icon: 'tug of war with equal arrows' },
      },
      {
        label: 'A swing hanging still',
        bin: 'balanced',
        figure: { kind: 'icon', icon: 'swing hanging still' },
      },
      {
        label: 'Box on a carpet, pushed gently, stays still',
        bin: 'balanced',
        figure: { kind: 'icon', icon: 'hand pushing box on rug' },
      },
      {
        label: 'Kicked ball starts to roll',
        bin: 'unbalanced',
        figure: { kind: 'icon', icon: 'foot kicking ball' },
      },
      {
        label: 'Bike braking to a stop',
        bin: 'unbalanced',
        figure: { kind: 'icon', icon: 'bike braking' },
      },
      {
        label: 'Apple falling',
        bin: 'unbalanced',
        figure: { kind: 'icon', icon: 'apple falling from branch' },
      },
      {
        label: 'Rock sliding on ice slows down',
        bin: 'unbalanced',
        figure: { kind: 'icon', icon: 'rock sliding on ice' },
      },
    ],
  },
  {
    kind: 'observe',
    id: 's.3.balanced-forces~swings',
    title: 'A pendulum’s pattern',
    use: 'Use this to record a pendulum’s swings and predict the next.',
    assumptions: [
      'A pendulum is a weight on a string. It keeps a steady beat.',
      'Count its swings every 10 seconds. Tap a bar to change a count.',
    ],
    columns: ['10 seconds', '20 seconds', '30 seconds', '40 seconds', '50 seconds', '60 seconds'],
    rowLabel: 'Swings so far',
    unit: 'swings',
    max: 60,
    step: 1,
    initial: [8, 16, 24, 32, 40, 48],
    pattern: (v) => {
      const first = v[0]!;
      const last = v[v.length - 1]!;
      const steps = v.slice(1).map((x, i) => x - v[i]!);
      const steady = steps.every((d) => d === first);
      if (last === 0) return 'No swings yet. Start the pendulum and count.';
      // Swings so far only go up; a count that falls is a counting slip.
      if (steps.some((d) => d < 0)) return 'Swings so far can’t go down. Check the count.';
      const rise = [first, ...steps];
      return steady
        ? `It adds ${first} swings every 10 seconds. In 70 seconds: ${last + first}.`
        : `It adds about ${Math.round(rise.reduce((a, b) => a + b, 0) / rise.length)} swings every 10 seconds. In 60 seconds: ${last}.`;
    },
  },
  {
    kind: 'observe',
    id: 's.3.magnets',
    assumptions: [
      'A magnet pulls on iron without touching it.',
      'Paper does not block the pull. It only adds distance.',
      'Put sheets of paper between the magnet and the clips. Count the clips lifted.',
    ],
    columns: ['0 sheets', '1 sheet', '2 sheets', '3 sheets', '4 sheets', '5 sheets'],
    rowLabel: 'Clips lifted',
    unit: 'clips',
    max: 20,
    step: 1,
    initial: [12, 9, 6, 4, 3, 2],
    pattern: (v) => {
      const first = v[0]!;
      const last = v[v.length - 1]!;
      if (last < first)
        return 'The more paper between, the fewer clips it lifts. The pull is weaker farther away.';
      if (last > first) return 'More clips with more paper? Check the magnet and try again.';
      if (first === 0) return 'No clips at all. Try a stronger magnet.';
      return 'The same clips every time. Try a weaker magnet or thicker paper.';
    },
  },
  {
    kind: 'sort',
    id: 's.3.magnets~magnetic',
    title: 'What a magnet pulls',
    use: 'Use this to sort things a magnet pulls.',
    assumptions: ['Magnets pull on iron and steel.', 'Not every metal is pulled.'],
    question: 'Does a magnet pull it?',
    bins: [
      { id: 'pulled', label: 'Pulled', why: 'It has iron or steel in it.' },
      { id: 'not', label: 'Not pulled', why: 'Magnets do not pull on these.' },
    ],
    cards: [
      { label: 'Paper clip', bin: 'pulled', figure: { kind: 'icon', icon: 'paper clip' } },
      { label: 'Iron nail', bin: 'pulled', figure: { kind: 'icon', icon: 'steel nail' } },
      { label: 'Soup can (steel)', bin: 'pulled', figure: { kind: 'icon', icon: 'soup can' } },
      { label: 'Fridge door', bin: 'pulled', figure: { kind: 'icon', icon: 'fridge' } },
      { label: 'Aluminum can', bin: 'not', figure: { kind: 'icon', icon: 'soda can' } },
      { label: 'Penny', bin: 'not', figure: { kind: 'icon', icon: 'copper coin' } },
      { label: 'Wooden block', bin: 'not', figure: { kind: 'icon', icon: 'wooden block' } },
      { label: 'Rubber band', bin: 'not', figure: { kind: 'icon', icon: 'rubber band' } },
    ],
  },
  {
    kind: 'explore',
    id: 's.3.magnets~static',
    title: 'Static electricity',
    use: 'Use this to see electric pulls and pushes.',
    assumptions: [
      'Rubbing a balloon on hair gives it an electric charge.',
      'A charged balloon pulls or pushes without touching.',
    ],
    figure: { kind: 'static' },
    scenes: [
      {
        label: 'Not rubbed',
        charge: { rubbed: false, near: 'paper' },
        lines: ['Nothing happens.'],
      },
      {
        label: 'Rubbed, near paper bits',
        charge: { rubbed: true, near: 'paper' },
        lines: ['The bits jump up to the balloon.'],
      },
      {
        label: 'Rubbed, near your hair',
        charge: { rubbed: true, near: 'hair' },
        lines: ['Your hair lifts toward it.'],
      },
      {
        label: 'Rubbed, on a wall',
        charge: { rubbed: true, near: 'wall' },
        lines: ['The balloon sticks to the wall.'],
      },
      {
        label: 'Two rubbed balloons',
        charge: { rubbed: true, near: 'balloon' },
        lines: ['They push each other apart.'],
      },
    ],
  },
  {
    kind: 'sequence',
    id: 's.3.life-cycles~frog',
    title: 'From egg to frog',
    use: 'Use this for a frog’s life cycle: the stages in order, and the days.',
    assumptions: [
      'A frog starts as an egg in the water.',
      'It hatches as a tadpole, then grows legs as a froglet.',
      'A frog lays hundreds of eggs. Only a few grow into frogs.',
    ],
    question: 'Put the stages in order, starting with the egg.',
    stages: [
      { label: 'Egg', span: 10, figure: { kind: 'icon', icon: 'frog eggs' } },
      { label: 'Tadpole', span: 84, figure: { kind: 'icon', icon: 'tadpole' } },
      { label: 'Froglet', span: 28, figure: { kind: 'icon', icon: 'froglet' } },
      { label: 'Frog', figure: { kind: 'icon', icon: 'frog' } },
    ],
    unit: 'days',
    totalLabel: 'Egg to frog',
  },
  {
    kind: 'sort',
    id: 's.3.life-cycles~eggs',
    title: 'Eggs or born alive?',
    use: 'Use this for “Which animal develops inside its mother before it is born alive?”',
    assumptions: [
      'Every animal’s life cycle starts with birth or hatching.',
      'Some young grow in eggs; others grow inside the mother.',
    ],
    question: 'How does it start life?',
    bins: [
      { id: 'eggs', label: 'Hatches from an egg', why: 'Eggs grow outside the mother.' },
      { id: 'alive', label: 'Born alive', why: 'The young grow inside the mother.' },
    ],
    cards: [
      { label: 'Bird', bin: 'eggs', figure: { kind: 'icon', icon: 'bird' } },
      { label: 'Frog', bin: 'eggs', figure: { kind: 'icon', icon: 'frog' } },
      { label: 'Grasshopper', bin: 'eggs', figure: { kind: 'icon', icon: 'grasshopper' } },
      { label: 'Turtle', bin: 'eggs', figure: { kind: 'icon', icon: 'turtle' } },
      { label: 'Fish', bin: 'eggs', figure: { kind: 'icon', icon: 'fish' } },
      { label: 'Cat', bin: 'alive', figure: { kind: 'icon', icon: 'cat' } },
      { label: 'Dog', bin: 'alive', figure: { kind: 'icon', icon: 'dog' } },
      { label: 'Dolphin', bin: 'alive', figure: { kind: 'icon', icon: 'dolphin' } },
      { label: 'Person', bin: 'alive', figure: { kind: 'icon', icon: 'person' } },
    ],
  },
  {
    kind: 'sequence',
    id: 's.3.life-cycles~bean',
    title: 'A bean plant’s life cycle',
    use: 'Use this to put a bean plant’s stages in order.',
    assumptions: ['Plants have life cycles too.', 'The new seeds can start the cycle again.'],
    question: 'Put the stages in order, starting with the seed.',
    stages: [
      { label: 'Seed', span: 7, figure: { kind: 'icon', icon: 'bean seed' } },
      { label: 'Sprout', span: 14, figure: { kind: 'icon', icon: 'bean sprout' } },
      { label: 'Young plant', span: 28, figure: { kind: 'icon', icon: 'young bean plant' } },
      {
        label: 'Plant with flowers',
        span: 14,
        figure: { kind: 'icon', icon: 'bean plant with flowers' },
      },
      { label: 'Pods with new seeds', figure: { kind: 'icon', icon: 'bean plant with pods' } },
    ],
    unit: 'days',
    totalLabel: 'Seed to new seeds',
  },
  {
    kind: 'sort',
    id: 's.3.life-cycles~changes',
    title: 'Change shape or grow bigger?',
    use: 'Use this to sort animals by how they grow.',
    assumptions: [
      'Every life cycle has birth, growth, having young and death.',
      'Some animals change shape as they grow.',
    ],
    question: 'How does it grow up?',
    bins: [
      {
        id: 'shape',
        label: 'Changes shape',
        why: 'The young look very different from the adult.',
      },
      { id: 'bigger', label: 'Grows bigger', why: 'The young look like a small adult.' },
    ],
    cards: [
      { label: 'Butterfly', bin: 'shape', figure: { kind: 'icon', icon: 'butterfly' } },
      { label: 'Frog', bin: 'shape', figure: { kind: 'icon', icon: 'frog' } },
      { label: 'Ladybug', bin: 'shape', figure: { kind: 'icon', icon: 'ladybug' } },
      { label: 'Mosquito', bin: 'shape', figure: { kind: 'icon', icon: 'mosquito' } },
      { label: 'Dog', bin: 'bigger', figure: { kind: 'icon', icon: 'dog' } },
      { label: 'Turtle', bin: 'bigger', figure: { kind: 'icon', icon: 'turtle' } },
      { label: 'Chicken', bin: 'bigger', figure: { kind: 'icon', icon: 'chicken' } },
      { label: 'Human', bin: 'bigger', figure: { kind: 'icon', icon: 'person' } },
    ],
  },
  {
    kind: 'sort',
    id: 's.3.inherited-traits',
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
    cards: [
      { label: 'Eye color', bin: 'inherited', figure: { kind: 'icon', icon: 'eye' } },
      {
        label: 'Flower color',
        bin: 'inherited',
        figure: { kind: 'icon', icon: 'two flower colors' },
      },
      { label: 'Number of legs', bin: 'inherited' },
      { label: 'A scar', bin: 'environment', figure: { kind: 'icon', icon: 'knee with scar' } },
      {
        label: 'A plant bent by wind',
        bin: 'environment',
        figure: { kind: 'icon', icon: 'tree bent by wind' },
      },
      {
        label: 'A pale plant grown in the dark',
        bin: 'environment',
        figure: { kind: 'icon', icon: 'pale seedling in dark box' },
      },
      {
        label: 'A dog sits on command',
        bin: 'learned',
        figure: { kind: 'icon', icon: 'dog sitting' },
      },
      {
        label: 'Riding a bike',
        bin: 'learned',
        figure: { kind: 'icon', icon: 'child riding bike' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.3.adaptation-fossils',
    assumptions: [
      'A fossil is what is left of a living thing from long ago, kept in rock.',
      'A fossil tells what the place was like when it lived.',
    ],
    question: 'What was this place like long ago?',
    bins: [
      {
        id: 'water',
        label: 'Under water',
        why: 'Water animals lived here, so it was sea or lake.',
      },
      { id: 'wet', label: 'Warm and wet land', why: 'Ferns and swamp plants grew here.' },
      { id: 'cold', label: 'Cold', why: 'Animals with thick fur lived here.' },
    ],
    cards: [
      { label: 'Fish', bin: 'water', figure: { kind: 'icon', icon: 'fish' } },
      { label: 'Clam shell', bin: 'water', figure: { kind: 'icon', icon: 'clam fossil' } },
      { label: 'Coral', bin: 'water', figure: { kind: 'icon', icon: 'coral fossil' } },
      { label: 'Shark tooth', bin: 'water', figure: { kind: 'icon', icon: 'shark tooth fossil' } },
      { label: 'Fern leaf', bin: 'wet', figure: { kind: 'icon', icon: 'fern fossil' } },
      { label: 'Dragonfly', bin: 'wet', figure: { kind: 'icon', icon: 'dragonfly fossil' } },
      {
        label: 'Woolly mammoth hair',
        bin: 'cold',
        figure: { kind: 'icon', icon: 'woolly mammoth' },
      },
      { label: 'Musk ox', bin: 'cold', figure: { kind: 'icon', icon: 'musk ox' } },
    ],
  },
  {
    kind: 'sort',
    id: 's.3.adaptation-fossils~survive-where',
    title: 'Who lives well in the desert?',
    use: 'Use this to sort how well each lives in the desert.',
    assumptions: [
      'In any habitat, some living things survive well.',
      'Some survive less well. Some cannot survive at all.',
    ],
    question: 'How well does it live in the desert?',
    bins: [
      { id: 'well', label: 'Well', why: 'Its body saves water and handles heat.' },
      { id: 'less', label: 'Less well', why: 'It can live there, but it is hard.' },
      { id: 'not', label: 'Not at all', why: 'It needs water, shade or cold the desert lacks.' },
    ],
    cards: [
      { label: 'Camel', bin: 'well', figure: { kind: 'icon', icon: 'camel hump' } },
      { label: 'Cactus', bin: 'well', figure: { kind: 'icon', icon: 'cactus stem' } },
      { label: 'Deer', bin: 'less', figure: { kind: 'icon', icon: 'deer' } },
      { label: 'Horse', bin: 'less' },
      { label: 'Frog', bin: 'not', figure: { kind: 'icon', icon: 'frog' } },
      { label: 'Polar bear', bin: 'not' },
      { label: 'Fern', bin: 'not' },
    ],
  },
  {
    kind: 'sort',
    id: 's.3.animal-groups~group-jobs',
    title: 'How a group helps',
    use: 'Use this to sort how living in a group helps.',
    assumptions: ['Some animals live in groups.', 'The group helps each member survive.'],
    question: 'How does the group help?',
    bins: [
      { id: 'food', label: 'Find food', why: 'Working together, they catch or carry more food.' },
      { id: 'safe', label: 'Stay safe', why: 'Many eyes spot danger.' },
      { id: 'warm', label: 'Stay warm', why: 'Close bodies share heat.' },
    ],
    cards: [
      { label: 'Wolf pack hunting', bin: 'food', figure: { kind: 'icon', icon: 'wolf pack' } },
      {
        label: 'Ants carrying food',
        bin: 'food',
        figure: { kind: 'icon', icon: 'ants carrying leaf' },
      },
      { label: 'Zebra herd', bin: 'safe', figure: { kind: 'icon', icon: 'zebra herd' } },
      { label: 'School of fish', bin: 'safe', figure: { kind: 'icon', icon: 'school of fish' } },
      { label: 'Meerkat lookout', bin: 'safe', figure: { kind: 'icon', icon: 'meerkat lookout' } },
      { label: 'Penguin huddle', bin: 'warm', figure: { kind: 'icon', icon: 'penguin huddle' } },
      { label: 'Bees in a winter ball', bin: 'warm', figure: { kind: 'icon', icon: 'bee ball' } },
    ],
  },
  {
    kind: 'sort',
    id: 's.3.weather-climate~hazards',
    title: 'Designs against bad weather',
    use: 'Use this to match each design to the weather it protects against.',
    assumptions: ['Some weather is dangerous.', 'People design ways to stay safe.'],
    question: 'Which weather does it protect against?',
    bins: [
      { id: 'flood', label: 'Flood', why: 'It keeps water out or lifts things above it.' },
      { id: 'wind', label: 'Strong wind', why: 'It holds things down or keeps them shut.' },
      { id: 'lightning', label: 'Lightning', why: 'It keeps the strike away from people.' },
    ],
    cards: [
      { label: 'Sandbag wall', bin: 'flood', figure: { kind: 'icon', icon: 'sandbag wall' } },
      { label: 'House on stilts', bin: 'flood', figure: { kind: 'icon', icon: 'house on stilts' } },
      { label: 'Levee', bin: 'flood', figure: { kind: 'icon', icon: 'levee' } },
      { label: 'Storm shutters', bin: 'wind', figure: { kind: 'icon', icon: 'storm shutters' } },
      { label: 'Tied-down roof', bin: 'wind', figure: { kind: 'icon', icon: 'roof straps' } },
      { label: 'Storm shelter', bin: 'wind', figure: { kind: 'icon', icon: 'storm shelter door' } },
      { label: 'Lightning rod', bin: 'lightning', figure: { kind: 'icon', icon: 'lightning rod' } },
      {
        label: 'Going indoors',
        bin: 'lightning',
        figure: { kind: 'icon', icon: 'staying inside in a storm' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.3.weather-climate~regions',
    title: 'Climates around the world',
    use: 'Use this to sort places by their climate.',
    assumptions: [
      'Climate is the usual weather of a place over many years.',
      'Different regions have different climates.',
    ],
    question: 'What is the climate like?',
    bins: [
      { id: 'wet', label: 'Hot and wet', why: 'Warm all year with lots of rain.' },
      { id: 'dry', label: 'Hot and dry', why: 'Hot days and very little rain.' },
      { id: 'cold', label: 'Cold', why: 'Cold most of the year, with snow and ice.' },
    ],
    cards: [
      { label: 'Amazon rainforest', bin: 'wet' },
      { label: 'Hawaii', bin: 'wet' },
      { label: 'Sahara', bin: 'dry' },
      { label: 'Arizona desert', bin: 'dry' },
      { label: 'Alaska', bin: 'cold' },
      { label: 'Antarctica', bin: 'cold' },
    ],
  },

  // ── Grade 4 ──
  {
    kind: 'observe',
    id: 's.4.energy-speed~ramp',
    title: 'Ramp height and how far the cup slides',
    use: 'Use this for “Does a higher release on the ramp push the cup farther?”',
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
    figure: { kind: 'ramp', heights: [5, 10, 15, 20, 25] },
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
    ],
    question: 'What is the device’s main job when it is switched on?',
    bins: [
      { id: 'light', label: 'Light', why: 'Light carries energy you can see.' },
      { id: 'heat', label: 'Heat', why: 'Heat warms what it touches.' },
      { id: 'sound', label: 'Sound', why: 'Sound is energy you hear.' },
      { id: 'motion', label: 'Motion', why: 'A moving part has energy.' },
    ],
    cards: [
      { label: 'Flashlight', bin: 'light', figure: { kind: 'icon', icon: 'flashlight' } },
      { label: 'Lamp', bin: 'light', figure: { kind: 'icon', icon: 'desk lamp' } },
      { label: 'Toaster', bin: 'heat', figure: { kind: 'icon', icon: 'toaster' } },
      { label: 'Hair dryer', bin: 'heat', figure: { kind: 'icon', icon: 'hair dryer' } },
      { label: 'Electric kettle', bin: 'heat', figure: { kind: 'icon', icon: 'kettle' } },
      { label: 'Buzzer', bin: 'sound', figure: { kind: 'icon', icon: 'buzzer' } },
      { label: 'Speaker', bin: 'sound', figure: { kind: 'icon', icon: 'speaker' } },
      { label: 'Doorbell', bin: 'sound', figure: { kind: 'icon', icon: 'doorbell' } },
      { label: 'Fan', bin: 'motion', figure: { kind: 'icon', icon: 'electric fan' } },
      { label: 'Electric car', bin: 'motion', figure: { kind: 'icon', icon: 'electric car' } },
    ],
  },
  {
    kind: 'sequence',
    id: 's.4.energy-conversion~trace',
    title: 'Follow the energy in a flashlight',
    use: 'Use this for “What energy changes happen when a flashlight is turned on?”',
    assumptions: [
      'Energy moves from place to place. It changes form but is not used up.',
      'Electric current carries energy along a wire.',
      'Tap the steps in order, starting with the battery.',
    ],
    question: 'Put the steps in order, starting with the battery.',
    stages: [
      { label: 'The battery stores energy', figure: { kind: 'icon', icon: 'circuit battery' } },
      {
        label: 'Electric current carries it along the wire',
        figure: { kind: 'icon', icon: 'circuit wire current' },
      },
      {
        label: 'The thin wire in the bulb gets very hot',
        figure: { kind: 'icon', icon: 'circuit hot filament' },
      },
      {
        label: 'The bulb gives out light and heat',
        figure: { kind: 'icon', icon: 'circuit lit bulb' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.4.energy-conversion~conductors',
    title: 'Does electric current flow through it?',
    use: 'Use this for “Which material would make the bulb light up?”: conductors and insulators.',
    assumptions: [
      'Put the object in a circuit with a battery and a bulb.',
      'If the bulb lights, current flows through the object.',
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
      {
        label: 'Copper wire',
        bin: 'conductor',
        figure: { kind: 'icon', icon: 'copper wire coil' },
      },
      { label: 'Paper clip', bin: 'conductor', figure: { kind: 'icon', icon: 'paper clip' } },
      { label: 'Aluminum foil', bin: 'conductor', figure: { kind: 'icon', icon: 'aluminum foil' } },
      { label: 'Coin', bin: 'conductor', figure: { kind: 'icon', icon: 'copper coin' } },
      { label: 'Steel nail', bin: 'conductor', figure: { kind: 'icon', icon: 'steel nail' } },
      { label: 'Plastic spoon', bin: 'insulator', figure: { kind: 'icon', icon: 'plastic spoon' } },
      { label: 'Rubber band', bin: 'insulator', figure: { kind: 'icon', icon: 'rubber band' } },
      { label: 'Wood stick', bin: 'insulator', figure: { kind: 'icon', icon: 'craft stick' } },
      { label: 'Glass marble', bin: 'insulator', figure: { kind: 'icon', icon: 'glass marble' } },
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
      'Light travels much faster than sound, so you see lightning before you hear thunder.',
    ],
    question: 'What carries the pattern?',
    bins: [
      { id: 'light', label: 'Light', why: 'A pattern of flashes or colors you see.' },
      { id: 'sound', label: 'Sound', why: 'A pattern of beats or beeps you hear.' },
    ],
    cards: [
      {
        label: 'Flashlight code',
        bin: 'light',
        figure: { kind: 'icon', icon: 'flashing flashlight' },
      },
      { label: 'Lighthouse', bin: 'light', figure: { kind: 'icon', icon: 'lighthouse' } },
      { label: 'Traffic light', bin: 'light', figure: { kind: 'icon', icon: 'traffic light' } },
      {
        label: 'Flag colors on a ship',
        bin: 'light',
        figure: { kind: 'icon', icon: 'ship with signal flags' },
      },
      { label: 'Drum beats', bin: 'sound', figure: { kind: 'icon', icon: 'drum' } },
      { label: 'Ship’s horn', bin: 'sound', figure: { kind: 'icon', icon: 'ship horn' } },
      { label: 'Buzzer code', bin: 'sound', figure: { kind: 'icon', icon: 'buzzer' } },
      { label: 'School bell', bin: 'sound', figure: { kind: 'icon', icon: 'school bell' } },
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
      drawing: 'body',
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
      {
        label: 'Light from the ball enters the eye',
        figure: { kind: 'icon', icon: 'ball light entering eye' },
      },
      {
        label: 'The eye sends a message along a nerve',
        figure: { kind: 'icon', icon: 'eye nerve to brain lit' },
      },
      { label: 'The brain reads the message', figure: { kind: 'icon', icon: 'brain lit' } },
      {
        label: 'The brain sends a message to the arm',
        figure: { kind: 'icon', icon: 'brain nerve to arm lit' },
      },
      {
        label: 'The arm moves to catch the ball',
        figure: { kind: 'icon', icon: 'hand catching ball' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.4.internal-structures~jobs',
    title: 'What does this part help with?',
    use: 'Use this for “How do a fish’s gills help it survive?” and other parts.',
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
    cards: [
      {
        label: 'Rose thorns',
        bin: 'protect',
        figure: { kind: 'icon', icon: 'rose stem with thorns' },
      },
      { label: 'Turtle shell', bin: 'protect', figure: { kind: 'icon', icon: 'turtle' } },
      { label: 'Tree roots', bin: 'food', figure: { kind: 'icon', icon: 'tree with roots' } },
      { label: 'Bird’s beak', bin: 'food', figure: { kind: 'icon', icon: 'bird beak' } },
      { label: 'Fish gills', bin: 'food', figure: { kind: 'icon', icon: 'fish gills' } },
      { label: 'Owl’s eyes', bin: 'sense', figure: { kind: 'icon', icon: 'owl face' } },
      { label: 'Bird’s wings', bin: 'sense', figure: { kind: 'icon', icon: 'bird flying' } },
      { label: 'Flower', bin: 'young', figure: { kind: 'icon', icon: 'flower' } },
      { label: 'Seeds', bin: 'young', figure: { kind: 'icon', icon: 'sunflower head' } },
    ],
  },
  {
    kind: 'observe',
    id: 's.4.weathering~stream-table',
    title: 'Water poured and sand moved',
    use: 'Use this for “Roger poured water over sand. How far did the sand move?”',
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
      {
        label: 'Sand settles: the bottom layer forms',
        figure: { kind: 'icon', icon: 'sand layer under water' },
      },
      { label: 'Mud settles on top of the sand', figure: { kind: 'icon', icon: 'mud on sand' } },
      {
        label: 'Shells settle on the mud: a layer with fossils forms',
        figure: { kind: 'icon', icon: 'shell layer on mud' },
      },
      { label: 'The land is pushed up', figure: { kind: 'icon', icon: 'layers pushed up' } },
      {
        label: 'A river cuts down through the layers',
        figure: { kind: 'icon', icon: 'river cutting layers' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.4.weathering~map-patterns',
    title: 'Where volcanoes and earthquakes happen',
    use: 'Use this for “Where do most volcanoes and earthquakes happen?” on a map.',
    assumptions: [
      'Most volcanoes and earthquakes happen in lines along the edges of oceans.',
      'Those lines are where pieces of Earth’s crust meet.',
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
      {
        label: 'Volcanoes around the Pacific Ocean',
        bin: 'edge',
        figure: { kind: 'map', area: 'pacific', region: 'pacific ocean' },
      },
      {
        label: 'Earthquakes in Japan',
        bin: 'edge',
        figure: { kind: 'map', area: 'pacific', pin: [138, 36] },
      },
      {
        label: 'The Andes mountains',
        bin: 'edge',
        figure: { kind: 'map', area: 'pacific', region: 'andes' },
      },
      {
        label: 'Volcanoes in Alaska',
        bin: 'edge',
        figure: { kind: 'map', area: 'pacific', pin: [-154, 58] },
      },
      {
        label: 'The Great Plains',
        bin: 'middle',
        figure: { kind: 'map', area: 'pacific', region: 'great plains' },
      },
      {
        label: 'Central Australia',
        bin: 'middle',
        figure: { kind: 'map', area: 'pacific', region: 'central australia' },
      },
      {
        label: 'The Sahara',
        bin: 'middle',
        figure: { kind: 'map', area: 'pacific', region: 'sahara' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.4.natural-resources',
    assumptions: [
      'Energy for heat, light and electric current comes from natural resources.',
      'Burning coal, oil and gas puts smoke and gases into the air.',
      'Renewable does not mean harmless: a dam changes a river.',
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
      { label: 'Sunlight', bin: 'renewable', figure: { kind: 'icon', icon: 'sun' } },
      { label: 'Wind', bin: 'renewable', figure: { kind: 'icon', icon: 'wind turbine' } },
      { label: 'Moving water', bin: 'renewable', figure: { kind: 'icon', icon: 'dam' } },
      { label: 'Wood', bin: 'renewable', figure: { kind: 'icon', icon: 'stack of logs' } },
      {
        label: 'Heat from inside Earth',
        bin: 'renewable',
        figure: { kind: 'icon', icon: 'geyser' },
      },
      { label: 'Coal', bin: 'nonrenewable', figure: { kind: 'icon', icon: 'lumps of coal' } },
      { label: 'Oil', bin: 'nonrenewable', figure: { kind: 'icon', icon: 'oil pump' } },
      {
        label: 'Natural gas',
        bin: 'nonrenewable',
        figure: { kind: 'icon', icon: 'gas stove flame' },
      },
      {
        label: 'Uranium',
        bin: 'nonrenewable',
        figure: { kind: 'icon', icon: 'nuclear power plant' },
      },
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
    ],
    question: 'Which hazard does this protect against?',
    bins: [
      { id: 'flood', label: 'Flood', why: 'Keep water out, or keep homes above it.' },
      { id: 'earthquake', label: 'Earthquake', why: 'Keep buildings and shelves from falling.' },
      { id: 'wildfire', label: 'Wildfire', why: 'Leave nothing near homes for the fire to burn.' },
      { id: 'hurricane', label: 'Hurricane', why: 'Hold roofs and windows against strong wind.' },
    ],
    cards: [
      { label: 'Levee along a river', bin: 'flood', figure: { kind: 'icon', icon: 'levee' } },
      { label: 'Sandbags', bin: 'flood', figure: { kind: 'icon', icon: 'sandbag wall' } },
      {
        label: 'House raised on posts',
        bin: 'flood',
        figure: { kind: 'icon', icon: 'house on stilts' },
      },
      { label: 'Braced walls', bin: 'earthquake', figure: { kind: 'icon', icon: 'braced walls' } },
      {
        label: 'Shelves bolted to the wall',
        bin: 'earthquake',
        figure: { kind: 'icon', icon: 'bolted shelves' },
      },
      {
        label: 'Brush cleared near houses',
        bin: 'wildfire',
        figure: { kind: 'icon', icon: 'cleared brush around house' },
      },
      { label: 'Fire break', bin: 'wildfire', figure: { kind: 'icon', icon: 'fire break' } },
      {
        label: 'Storm shutters',
        bin: 'hurricane',
        figure: { kind: 'icon', icon: 'storm shutters' },
      },
      {
        label: 'Roof strapped to the walls',
        bin: 'hurricane',
        figure: { kind: 'icon', icon: 'roof straps' },
      },
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
    use: 'Use this for “Where did the water in the open cup go?”, recorded day by day.',
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
    figure: { kind: 'cup' },
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
      { label: 'Sand', bin: 'not', figure: { kind: 'icon', icon: 'sand pile' } },
      { label: 'Gravel', bin: 'not', figure: { kind: 'icon', icon: 'gravel' } },
      { label: 'Pepper', bin: 'not', figure: { kind: 'icon', icon: 'pepper shaker' } },
      { label: 'Cooking oil', bin: 'not', figure: { kind: 'icon', icon: 'cooking oil bottle' } },
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
    ],
    question: 'Does a magnet pull it?',
    bins: [
      { id: 'pulled', label: 'Pulled', why: 'It has iron or steel in it.' },
      { id: 'not', label: 'Not pulled', why: 'No iron or steel: the magnet does nothing.' },
    ],
    cards: [
      { label: 'Iron nail', bin: 'pulled', figure: { kind: 'icon', icon: 'steel nail' } },
      { label: 'Steel paper clip', bin: 'pulled', figure: { kind: 'icon', icon: 'paper clip' } },
      { label: 'Aluminum can', bin: 'not', figure: { kind: 'icon', icon: 'soda can' } },
      { label: 'Copper coin', bin: 'not', figure: { kind: 'icon', icon: 'copper coin' } },
      { label: 'Plastic spoon', bin: 'not', figure: { kind: 'icon', icon: 'plastic spoon' } },
      { label: 'Wood block', bin: 'not', figure: { kind: 'icon', icon: 'wooden block' } },
    ],
  },
  {
    kind: 'sort',
    id: 's.5.mixtures',
    assumptions: [
      'Signs of a new substance: bubbles of gas, a new color, heat or light, a solid forming.',
      'A mixture can be separated again: with a filter, a magnet or by letting the water evaporate.',
      'Dissolving does not make a new substance.',
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
      {
        label: 'Iron left in wet air (rust)',
        bin: 'new',
        figure: { kind: 'icon', icon: 'rusty nail' },
      },
      { label: 'Wood burning', bin: 'new', figure: { kind: 'icon', icon: 'burning log' } },
      { label: 'Milk and lemon juice (curdles)', bin: 'new' },
      { label: 'Salt in water', bin: 'mixture' },
      {
        label: 'Sand in water',
        bin: 'mixture',
        figure: { kind: 'icon', icon: 'jar of sand and water' },
      },
      {
        label: 'Oil and water',
        bin: 'mixture',
        figure: { kind: 'icon', icon: 'jar of oil and water' },
      },
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
      {
        label: 'Pass a magnet over the dry mix: the iron filings stick',
        figure: { kind: 'icon', icon: 'magnet over sand mix' },
      },
      {
        label: 'Stir the rest into water: the salt dissolves',
        figure: { kind: 'icon', icon: 'stirring salt water' },
      },
      {
        label: 'Pour it through a filter: the sand stays behind',
        figure: { kind: 'icon', icon: 'filtering sand' },
      },
      {
        label: 'Let the salt water evaporate: the salt is left',
        figure: { kind: 'icon', icon: 'evaporating salt water' },
      },
    ],
  },
  {
    kind: 'observe',
    id: 's.5.mixtures~dissolve-warm',
    title: 'Sugar that dissolves in cool and warm water',
    use: 'Use this for “Does more sugar dissolve in warm water than in cool water?”',
    assumptions: [
      'Stir in one spoon of sugar at a time until no more disappears.',
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
      { label: 'Grass', bin: 'producer', figure: { kind: 'icon', icon: 'tuft of grass' } },
      { label: 'Oak tree', bin: 'producer', figure: { kind: 'icon', icon: 'oak tree' } },
      { label: 'Algae', bin: 'producer', figure: { kind: 'icon', icon: 'algae on pond' } },
      { label: 'Rabbit', bin: 'consumer', figure: { kind: 'icon', icon: 'rabbit' } },
      { label: 'Deer', bin: 'consumer', figure: { kind: 'icon', icon: 'deer' } },
      { label: 'Hawk', bin: 'consumer', figure: { kind: 'icon', icon: 'hawk' } },
      { label: 'Frog', bin: 'consumer', figure: { kind: 'icon', icon: 'frog' } },
      { label: 'Mushroom', bin: 'decomposer', figure: { kind: 'icon', icon: 'mushroom on log' } },
      {
        label: 'Bacteria',
        bin: 'decomposer',
        figure: { kind: 'cell', type: 'bacterium', shape: 'rod' },
      },
      {
        label: 'Earthworm',
        bin: 'decomposer',
        figure: { kind: 'icon', icon: 'earthworm in soil' },
      },
    ],
  },
  {
    kind: 'sequence',
    id: 's.5.food-webs~chain-order',
    title: 'A food chain from the sun',
    use: 'Use this to put a food chain in order, starting from the sun.',
    assumptions: [
      'After the sun, each arrow means: is eaten by.',
      'Energy from the sun passes along the chain.',
      'Tap each one in order, starting with the sun.',
    ],
    question: 'Put the food chain in order, starting with the sun.',
    stages: [
      { label: 'Sun', figure: { kind: 'icon', icon: 'sun' } },
      { label: 'Grass', figure: { kind: 'icon', icon: 'tuft of grass' } },
      { label: 'Grasshopper', figure: { kind: 'icon', icon: 'grasshopper' } },
      { label: 'Frog', figure: { kind: 'icon', icon: 'frog' } },
      { label: 'Snake', figure: { kind: 'icon', icon: 'snake' } },
      { label: 'Hawk', figure: { kind: 'icon', icon: 'hawk' } },
    ],
  },
  {
    kind: 'sort',
    id: 's.5.food-webs~eaters',
    title: 'Plant-eaters and meat-eaters',
    use: 'Use this for “Which animals eat only plants?” and meat-eaters and both.',
    assumptions: [
      'Plant-eaters get energy from plants. Meat-eaters get it from other animals.',
      'Animals that eat both get energy from plants and animals.',
    ],
    question: 'What does it eat?',
    bins: [
      { id: 'plants', label: 'Eats only plants', why: 'Its energy comes from plants.' },
      { id: 'animals', label: 'Eats only animals', why: 'Its energy comes from other animals.' },
      { id: 'both', label: 'Eats both', why: 'It eats plants and animals.' },
    ],
    cards: [
      { label: 'Rabbit', bin: 'plants', figure: { kind: 'icon', icon: 'rabbit' } },
      { label: 'Deer', bin: 'plants', figure: { kind: 'icon', icon: 'deer' } },
      { label: 'Grasshopper', bin: 'plants', figure: { kind: 'icon', icon: 'grasshopper' } },
      { label: 'Hawk', bin: 'animals', figure: { kind: 'icon', icon: 'hawk' } },
      { label: 'Snake', bin: 'animals', figure: { kind: 'icon', icon: 'snake' } },
      { label: 'Heron', bin: 'animals', figure: { kind: 'icon', icon: 'heron' } },
      { label: 'Raccoon', bin: 'both', figure: { kind: 'icon', icon: 'raccoon' } },
      { label: 'Bear', bin: 'both', figure: { kind: 'icon', icon: 'bear' } },
      { label: 'Person', bin: 'both', figure: { kind: 'icon', icon: 'person' } },
    ],
  },
  {
    kind: 'explore',
    id: 's.5.food-webs~web',
    title: 'What happens if one is removed?',
    use: 'Use this for “What would most likely happen if the snakes were removed?”',
    assumptions: [
      'Each arrow means: is eaten by. The sun’s arrow is its energy going into the grass.',
      'When an animal is removed, what it ate grows in number.',
      'What ate it has less food, unless it can eat something else.',
    ],
    figure: { kind: 'foodWeb' },
    scenes: [
      {
        label: 'Whole web',
        web: {},
        lines: ['A meadow food web.', 'Follow the arrows from the sun to the hawk.'],
      },
      {
        label: 'One chain',
        web: { chain: ['sun', 'grass', 'grasshopper', 'frog', 'snake', 'hawk'] },
        lines: ['Sun, grass, grasshopper, frog, snake, hawk.', 'Energy passes along each arrow.'],
      },
      {
        label: 'No snakes',
        web: { removed: 'snake', more: ['mouse', 'frog'] },
        lines: [
          'Nothing eats the mice and frogs as much, so there are more of them.',
          'The hawk still eats mice and rabbits.',
        ],
      },
      {
        label: 'No frogs',
        web: { removed: 'frog', more: ['grasshopper'], fewer: ['snake'] },
        lines: [
          'More grasshoppers live, since no frogs eat them.',
          'The snakes have less to eat, so there are fewer.',
        ],
      },
      {
        label: 'No grass',
        web: { removed: 'grass', fewer: ['rabbit', 'grasshopper', 'mouse'] },
        lines: [
          'Without grass, the plant-eaters have no food.',
          'Every animal above them has less to eat too.',
        ],
      },
    ],
  },
  {
    kind: 'explore',
    id: 's.5.plants-sunlight-energy~needs',
    title: 'What a plant takes in',
    use: 'Use this for “Where does a plant get the materials it needs to grow?”',
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
    ],
    question: 'Which sphere is it part of?',
    bins: [
      { id: 'geo', label: 'Geosphere', why: 'Rock, soil and the ground.' },
      { id: 'hydro', label: 'Hydrosphere', why: 'All the water: oceans, rivers and ice.' },
      { id: 'atmo', label: 'Atmosphere', why: 'The air around Earth.' },
      { id: 'bio', label: 'Biosphere', why: 'Every living thing.' },
    ],
    cards: [
      { label: 'Mountain', bin: 'geo', figure: { kind: 'icon', icon: 'mountain' } },
      { label: 'Soil', bin: 'geo', figure: { kind: 'icon', icon: 'soil clump' } },
      { label: 'Sand', bin: 'geo', figure: { kind: 'icon', icon: 'sand dune' } },
      { label: 'Ocean', bin: 'hydro', figure: { kind: 'icon', icon: 'ocean' } },
      { label: 'River', bin: 'hydro', figure: { kind: 'icon', icon: 'river' } },
      { label: 'Glacier', bin: 'hydro', figure: { kind: 'icon', icon: 'glacier' } },
      { label: 'Wind', bin: 'atmo', figure: { kind: 'icon', icon: 'wind sock' } },
      { label: 'Nitrogen and oxygen in the air', bin: 'atmo' },
      { label: 'Tree', bin: 'bio', figure: { kind: 'icon', icon: 'leafy tree' } },
      { label: 'Fish', bin: 'bio', figure: { kind: 'icon', icon: 'fish' } },
      { label: 'Bird', bin: 'bio', figure: { kind: 'icon', icon: 'bird' } },
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
      {
        label: 'Water evaporates from the ocean into the air: hydrosphere to atmosphere',
        figure: { kind: 'icon', icon: 'ocean water evaporating' },
      },
      {
        label: 'Clouds form and rain falls on a mountain: atmosphere to geosphere',
        figure: { kind: 'icon', icon: 'rain on mountain' },
      },
      {
        label: 'Rain soaks into the soil and roots take it in: geosphere to biosphere',
        figure: { kind: 'icon', icon: 'rain soaking into soil' },
      },
      {
        label: 'The rest runs in a river back to the sea: back to the hydrosphere',
        figure: { kind: 'icon', icon: 'river to the sea' },
      },
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
    figure: { kind: 'flashlight', distances: [10, 20, 30, 40, 50] },
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
    figure: { kind: 'shadowStick', stick: 100, sides: ['west', 'west', 'north', 'east', 'east'] },
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
    use: 'Use this for “Why is it day on one side of Earth and night on the other?”',
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
    kind: 'observe',
    id: 's.5.shadows-day-night~noon-shadow',
    title: 'The noon shadow through the year',
    use: 'Use this for “Is the noon shadow longer in summer or in winter?”',
    assumptions: [
      'A meter stick stands straight up in the same spot. Measure its shadow at noon.',
      'These are for a town in the middle of the United States.',
      'Tap a bar to change that month’s shadow and see the stick that month.',
    ],
    columns: ['Dec', 'Feb', 'Apr', 'Jun', 'Aug', 'Oct'],
    rowLabel: 'Noon shadow',
    unit: 'cm',
    max: 250,
    step: 5,
    initial: [200, 135, 60, 30, 50, 115],
    figure: { kind: 'shadowStick', stick: 100 },
    pattern: (v) => {
      const months = ['December', 'February', 'April', 'June', 'August', 'October'];
      const hi = v.indexOf(Math.max(...v));
      const lo = v.indexOf(Math.min(...v));
      if (hi === lo) return 'The shadow is the same every month.';
      return `Shortest in ${months[lo]}, when the noon sun is highest. Longest in ${months[hi]}, when it is lowest.`;
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
    ],
    question: 'When is it seen in the evening sky?',
    bins: [
      { id: 'winter', label: 'Winter', why: 'The night side faces these stars in winter.' },
      { id: 'summer', label: 'Summer', why: 'The night side faces these stars in summer.' },
      { id: 'all', label: 'All year', why: 'They circle close to the North Star and never set.' },
    ],
    cards: [
      { label: 'Orion', bin: 'winter', figure: { kind: 'stars', constellation: 'Orion' } },
      { label: 'Taurus', bin: 'winter', figure: { kind: 'stars', constellation: 'Taurus' } },
      { label: 'Scorpius', bin: 'summer', figure: { kind: 'stars', constellation: 'Scorpius' } },
      { label: 'Cygnus', bin: 'summer', figure: { kind: 'stars', constellation: 'Cygnus' } },
      { label: 'Big Dipper', bin: 'all', figure: { kind: 'stars', constellation: 'Big Dipper' } },
      { label: 'Cassiopeia', bin: 'all', figure: { kind: 'stars', constellation: 'Cassiopeia' } },
    ],
  },
  {
    kind: 'sort',
    id: 's.5.protect-resources',
    assumptions: [
      'People use Earth’s air, water, land and living things every day.',
      'Communities can change what they do to protect them.',
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
      { label: 'Planting trees to clean the air by a busy road', bin: 'air' },
      { label: 'Fixing a dripping tap', bin: 'water' },
      { label: 'Keeping oil out of storm drains', bin: 'water' },
      { label: 'Recycling cans and paper', bin: 'land' },
      { label: 'Composting food scraps', bin: 'land' },
      { label: 'Bringing a cloth bag to the store', bin: 'land' },
      { label: 'Protecting a wetland as a park', bin: 'life' },
      { label: 'Building a bridge for animals over a highway', bin: 'life' },
    ],
  },
  // ── Grade 6 ──
  {
    kind: 'sort',
    id: 's.6.cells',
    assumptions: [
      'Every living thing is made of one or more cells.',
      'Most cells are too small to see without a microscope.',
      'Some living things are a single cell. Others, like you, have trillions of cells of many kinds.',
    ],
    question: 'What is it made of?',
    bins: [
      {
        id: 'one',
        label: 'One cell',
        why: 'The whole living thing is one cell that takes in food, grows and reproduces.',
      },
      { id: 'many', label: 'Many cells', why: 'Many cells of different kinds work together.' },
      { id: 'none', label: 'No cells', why: 'It is not alive and never was, so it has no cells.' },
    ],
    cards: [
      {
        label: 'Bacterium in yogurt',
        bin: 'one',
        figure: { kind: 'cell', type: 'bacterium', shape: 'rod' },
      },
      { label: 'Amoeba from a pond', bin: 'one', figure: { kind: 'icon', icon: 'amoeba' } },
      { label: 'Paramecium', bin: 'one', figure: { kind: 'icon', icon: 'paramecium' } },
      {
        label: 'Yeast that raises bread',
        bin: 'one',
        figure: { kind: 'icon', icon: 'budding yeast' },
      },
      { label: 'Oak tree', bin: 'many' },
      { label: 'Mushroom', bin: 'many' },
      { label: 'Human', bin: 'many', figure: { kind: 'icon', icon: 'person' } },
      { label: 'Elodea water plant', bin: 'many', figure: { kind: 'icon', icon: 'elodea sprig' } },
      {
        label: 'Grain of quartz sand',
        bin: 'none',
        figure: { kind: 'icon', icon: 'quartz sand grain' },
      },
      {
        label: 'Air bubble on a slide',
        bin: 'none',
        figure: { kind: 'icon', icon: 'air bubble on a slide' },
      },
      { label: 'Salt crystal', bin: 'none', figure: { kind: 'icon', icon: 'salt crystal' } },
      { label: 'Glass bead', bin: 'none' },
    ],
  },
  {
    kind: 'sort',
    id: 's.6.cells~cell-theory',
    title: 'What cell theory says',
    use: 'Use this to sort statements that cell theory makes from ones that are not true.',
    assumptions: [
      'Robert Hooke named cells in 1665 after looking at thin slices of cork.',
      'In the 1830s–1850s scientists showed that plants and animals are made of cells, and that cells come from cells.',
    ],
    question: 'Does cell theory say this?',
    bins: [
      {
        id: 'yes',
        label: 'Cell theory says it',
        why: 'Microscope observations have supported this for more than 150 years.',
      },
      { id: 'no', label: 'Not true', why: 'Observations and experiments show this is false.' },
    ],
    cards: [
      { label: 'All living things are made of one or more cells', bin: 'yes' },
      { label: 'The cell is the smallest unit that is alive', bin: 'yes' },
      { label: 'New cells come only from cells that already exist', bin: 'yes' },
      { label: 'Every cell has a nucleus', bin: 'no' },
      { label: 'Every cell has a cell wall', bin: 'no' },
      { label: 'Bigger animals have bigger cells', bin: 'no' },
      { label: 'Living things can form from mud or rotting meat', bin: 'no' },
      { label: 'All cells are the same shape', bin: 'no' },
    ],
  },
  {
    kind: 'explore',
    id: 's.6.cell-organelles',
    assumptions: [
      'A cell is a tiny system: each part has a job, and the cell lives only when they work together.',
      'Plant and animal cells share most parts. Plant cells add a wall, chloroplasts and a large vacuole.',
      'Choose a part to read its job.',
    ],
    figure: { kind: 'cell' },
    scenes: [
      {
        label: 'Cell membrane',
        cell: { type: 'animal', part: 'membrane' },
        lines: [
          'A thin, flexible layer around the cell.',
          'It lets water, food and oxygen in and wastes out.',
        ],
      },
      {
        label: 'Cytoplasm',
        cell: { type: 'animal', part: 'cytoplasm' },
        lines: ['The jelly-like fluid that fills the cell and holds its parts.'],
      },
      {
        label: 'Nucleus',
        cell: { type: 'animal', part: 'nucleus' },
        lines: [
          'Holds the DNA, the instructions that control what the cell does and how it grows.',
        ],
      },
      {
        label: 'Mitochondria',
        cell: { type: 'animal', part: 'mitochondria' },
        lines: ['Break down sugar with oxygen to release the energy the cell uses.'],
      },
      {
        label: 'Cell wall',
        cell: { type: 'plant', part: 'wall' },
        lines: [
          'A stiff layer outside the membrane that supports and protects the cell.',
          'Plants, fungi and most bacteria have a wall. Animal cells do not.',
        ],
      },
      {
        label: 'Chloroplasts',
        cell: { type: 'plant', part: 'chloroplasts' },
        lines: [
          'Use energy from sunlight to make sugar from water and carbon dioxide.',
          'Only plants and algae have them. They make leaves green.',
        ],
      },
      {
        label: 'Vacuole',
        cell: { type: 'plant', part: 'vacuole' },
        lines: ['Stores water. A full vacuole presses on the wall and keeps a plant stiff.'],
      },
      {
        label: 'Bacterium',
        cell: { type: 'bacterium', part: 'dna' },
        lines: [
          'A bacterium has a membrane, a wall and cytoplasm.',
          'It has no nucleus: its DNA lies loose in the cytoplasm.',
        ],
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.6.cell-organelles~plant-animal',
    title: 'Plant cells and animal cells',
    use: 'Use this to sort cell parts by which cells have them.',
    assumptions: [
      'Only plant cells have some parts, but not every plant cell has them all: root cells have no chloroplasts.',
      'Every living cell has a membrane and cytoplasm.',
    ],
    question: 'Which cells have it?',
    bins: [
      {
        id: 'plant',
        label: 'Plant cells only',
        why: 'Plants make their own food and stand up without bones.',
      },
      {
        id: 'both',
        label: 'Plant and animal cells',
        why: 'Both plant and animal cells have these.',
      },
    ],
    cards: [
      {
        label: 'Cell wall',
        bin: 'plant',
        figure: { kind: 'cell', type: 'plant', highlight: 'wall' },
      },
      {
        label: 'Chloroplasts',
        bin: 'plant',
        figure: { kind: 'cell', type: 'plant', highlight: 'chloroplasts' },
      },
      {
        label: 'One large central vacuole',
        bin: 'plant',
        figure: { kind: 'cell', type: 'plant', highlight: 'vacuole' },
      },
      {
        label: 'Nucleus',
        bin: 'both',
        figure: { kind: 'cell', type: 'animal', highlight: 'nucleus' },
      },
      {
        label: 'Cell membrane',
        bin: 'both',
        figure: { kind: 'cell', type: 'animal', highlight: 'membrane' },
      },
      {
        label: 'Cytoplasm',
        bin: 'both',
        figure: { kind: 'cell', type: 'animal', highlight: 'cytoplasm' },
      },
      {
        label: 'Mitochondria',
        bin: 'both',
        figure: { kind: 'cell', type: 'animal', highlight: 'mitochondria' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.6.cell-organelles~which-cell',
    title: 'Plant, animal or bacterium?',
    use: 'Use this to tell plant, animal and bacterial cells apart by their parts.',
    assumptions: [
      'Look for a wall, a nucleus and chloroplasts.',
      'An onion bulb grows underground, so its cells have no chloroplasts. They are still plant cells.',
    ],
    question: 'What kind of cell is it?',
    bins: [
      {
        id: 'plant',
        label: 'Plant cell',
        why: 'It has a wall and a large vacuole; many have chloroplasts.',
      },
      {
        id: 'animal',
        label: 'Animal cell',
        why: 'It has a nucleus and a flexible membrane but no wall.',
      },
      { id: 'bacterium', label: 'Bacterium', why: 'It is tiny, with a wall but no nucleus.' },
    ],
    cards: [
      {
        label: 'Elodea leaf cell',
        bin: 'plant',
        figure: { kind: 'cell', type: 'plant', shape: 'box', chloroplasts: true },
      },
      {
        label: 'Onion skin cell',
        bin: 'plant',
        figure: { kind: 'cell', type: 'plant', shape: 'box' },
      },
      {
        label: 'Cheek cell',
        bin: 'animal',
        figure: { kind: 'cell', type: 'animal', shape: 'round' },
      },
      {
        label: 'Muscle cell',
        bin: 'animal',
        figure: { kind: 'cell', type: 'animal', shape: 'long' },
      },
      {
        label: 'Nerve cell',
        bin: 'animal',
        figure: { kind: 'cell', type: 'animal', shape: 'branched' },
      },
      {
        label: 'Cell from yogurt',
        bin: 'bacterium',
        figure: { kind: 'cell', type: 'bacterium', shape: 'rod' },
      },
      {
        label: 'Cell from soil',
        bin: 'bacterium',
        figure: { kind: 'cell', type: 'bacterium', shape: 'round' },
      },
    ],
  },
  {
    kind: 'explore',
    id: 's.6.body-systems',
    assumptions: [
      'Cells make tissues, tissues make organs, and organs work together as organ systems.',
      'No system works alone: moving, eating and sensing all need several at once.',
    ],
    figure: { kind: 'bodySystems' },
    scenes: [
      {
        label: 'Circulatory',
        body: { systems: ['circulatory'] },
        lines: [
          'The heart pumps blood through blood vessels.',
          'Blood carries oxygen and food to every cell and takes wastes away.',
        ],
      },
      {
        label: 'Respiratory',
        body: { systems: ['respiratory'] },
        lines: ['The lungs take in oxygen and give off carbon dioxide.'],
      },
      {
        label: 'Digestive',
        body: { systems: ['digestive'] },
        lines: [
          'The esophagus carries food to the stomach.',
          'The stomach and intestines break food into small pieces the blood can carry.',
        ],
      },
      {
        label: 'Nervous',
        body: { systems: ['nervous'] },
        lines: [
          'Sense organs detect changes.',
          'Nerves carry messages to the brain and spinal cord, which send signals to muscles.',
        ],
      },
      {
        label: 'Muscles and bones',
        body: { systems: ['muscular', 'skeletal'] },
        lines: [
          'Muscles pull on bones to move the body.',
          'Bones hold it up and protect soft organs.',
        ],
      },
      {
        label: 'Excretory',
        body: { systems: ['excretory'] },
        lines: ['The kidneys filter wastes out of the blood.'],
      },
      {
        label: 'Running',
        body: { systems: ['respiratory', 'circulatory', 'muscular', 'nervous'] },
        lines: [
          'Working muscles need more oxygen.',
          'You breathe faster and the heart beats faster to deliver it. Sweat cools the skin.',
        ],
      },
      {
        label: 'Eating lunch',
        body: { systems: ['digestive', 'circulatory'] },
        lines: [
          'Digested food passes into the blood in the small intestine.',
          'The blood carries it to every cell.',
        ],
      },
      {
        label: 'Touching a hot pan',
        body: { systems: ['nervous', 'muscular'] },
        lines: [
          'Nerves in the skin signal the spinal cord.',
          'It tells arm muscles to pull your hand away before you feel pain.',
        ],
      },
    ],
  },
  {
    kind: 'sequence',
    id: 's.6.body-systems~levels',
    title: 'From cell to organism',
    use: 'Use this to put the levels of the body in order, from smallest to largest.',
    assumptions: [
      'Each level is made of the one before it.',
      'The heart is one organ of the circulatory system.',
    ],
    question: 'Put the levels in order, smallest first.',
    stages: [
      {
        label: 'Cell: one heart muscle cell',
        figure: { kind: 'cell', type: 'animal', shape: 'long' },
      },
      {
        label: 'Tissue: a sheet of heart muscle cells',
        figure: { kind: 'icon', icon: 'heart muscle tissue' },
      },
      { label: 'Organ: the heart', figure: { kind: 'heart' } },
      {
        label: 'Organ system: the heart, blood vessels and blood',
        figure: { kind: 'icon', icon: 'circulatory system' },
      },
      { label: 'Organism: a whole person', figure: { kind: 'icon', icon: 'person' } },
    ],
  },
  {
    kind: 'observe',
    id: 's.6.body-systems~exercise',
    title: 'Heart rate after exercise',
    use: 'Use this to record your heart rate before and after exercise.',
    assumptions: [
      'Count your pulse for 15 seconds and multiply by 4.',
      'Do jumping jacks for two minutes, then count right away and again as you rest.',
      'Muscles use more oxygen, so the heart and lungs work harder together.',
      'Stop and rest if you feel dizzy or unwell.',
    ],
    columns: ['At rest', 'Right after', '1 min later', '3 min later', '5 min later'],
    rowLabel: 'Heart rate',
    unit: 'beats per minute',
    max: 200,
    step: 5,
    initial: [75, 140, 115, 95, 80],
    pattern: (values) => {
      const [rest, ...after] = values as [number, ...number[]];
      const peak = Math.max(...after);
      const last = after[after.length - 1]!;
      if (peak <= rest)
        return 'The heart rate did not rise. Exercise for two full minutes, then count again.';
      if (Math.abs(last - rest) <= 10)
        return `Exercise raised the heart rate from ${rest} to ${peak} beats per minute. It fell back to ${last} as you rested.`;
      return `Exercise raised the heart rate from ${rest} to ${peak} beats per minute. It has not yet fallen back to the resting rate.`;
    },
  },
  {
    kind: 'observe',
    id: 's.6.body-systems~reaction',
    title: 'Catching a falling ruler',
    use: 'Use this to record how far a ruler falls before you catch it.',
    assumptions: [
      'A partner holds a ruler above your open hand and drops it without warning.',
      'Your eyes sense the drop. Nerves carry the message to the brain, and the brain signals your hand.',
      'A shorter catch distance means a faster reaction.',
    ],
    columns: ['Try 1', 'Try 2', 'Try 3', 'Try 4', 'Try 5'],
    rowLabel: 'Catch distance',
    unit: 'cm',
    max: 30,
    step: 1,
    initial: [19, 17, 15, 14, 12],
    pattern: (values) => {
      const first = values[0]!;
      const last = values[values.length - 1]!;
      const falling = values.every((x, i) => i === 0 || x <= values[i - 1]!) && last < first;
      if (falling)
        return `The catch distance fell from ${first} cm to ${last} cm. Your brain stored what it learned, so you responded sooner.`;
      if (Math.max(...values) - Math.min(...values) <= 2)
        return 'The distance stayed about the same. Signals take time to travel from eye to brain to hand.';
      if (last > first && values.every((x, i) => i === 0 || x >= values[i - 1]!))
        return `The catch distance rose from ${first} cm to ${last} cm. Rest your eyes and hand, then try again.`;
      return 'The distances go up and down. Rest, then try again with the same start.';
    },
  },
  {
    kind: 'sort',
    id: 's.6.density~sink-float',
    title: 'Sink or float?',
    use: 'Use this to sort materials by whether they sink or float in water.',
    assumptions: [
      'Compare each density with water’s: 1 g/cm³.',
      'A steel ship floats because the hull and the air inside it together are less dense than water.',
      'Sea water is about 1.03 g/cm³, so things float a little higher in the ocean.',
    ],
    question: 'Will it sink or float in fresh water?',
    bins: [
      { id: 'float', label: 'Floats', why: 'Its density is less than water’s 1 g/cm³.' },
      { id: 'sink', label: 'Sinks', why: 'Its density is more than water’s 1 g/cm³.' },
    ],
    cards: [
      { label: 'Cork: 0.24 g/cm³', bin: 'float' },
      { label: 'Pine wood: 0.5 g/cm³', bin: 'float' },
      { label: 'Candle wax: 0.9 g/cm³', bin: 'float' },
      { label: 'Ice: 0.92 g/cm³', bin: 'float' },
      { label: 'Glass marble: 2.5 g/cm³', bin: 'sink' },
      { label: 'Aluminum: 2.7 g/cm³', bin: 'sink' },
      { label: 'Steel: 7.9 g/cm³', bin: 'sink' },
      { label: 'Gold: 19.3 g/cm³', bin: 'sink' },
    ],
  },
  {
    kind: 'sequence',
    id: 's.6.density~layers',
    title: 'A density column',
    use: 'Use this for “Which liquid ends up at the bottom?” and where a block floats between layers.',
    assumptions: [
      'Pour each liquid slowly down the side of the jar.',
      'The densest liquid sinks to the bottom. The least dense one floats on top.',
      'A solid floats at the boundary of a denser liquid below and a less dense one above.',
    ],
    question: 'Put the liquids in order from the bottom of the jar to the top.',
    stack: true,
    stages: [
      { label: 'Honey: 1.4 g/cm³' },
      { label: 'Dish soap: 1.06 g/cm³' },
      { label: 'Water: 1.00 g/cm³' },
      { label: 'Vegetable oil: 0.92 g/cm³' },
    ],
  },
  {
    kind: 'explore',
    id: 's.6.water-cycle',
    assumptions: [
      'The same water keeps moving between the ocean, air, land and living things.',
      'Energy from the sun lifts water into the air as vapor. Gravity brings it back down.',
      'Water changes state as it moves: liquid water, water vapor and ice.',
    ],
    figure: { kind: 'waterCycle' },
    scenes: [
      {
        label: 'Evaporation',
        water: { process: 'evaporation', driver: 'sun' },
        lines: [
          'The sun warms the ocean. Liquid water turns into water vapor and rises.',
          'The salt stays behind, so rain is fresh water.',
        ],
      },
      {
        label: 'Transpiration',
        water: { process: 'transpiration', driver: 'sun' },
        lines: [
          'Plants pull water up from the soil.',
          'It evaporates from tiny holes in their leaves.',
        ],
      },
      {
        label: 'Condensation',
        water: { process: 'condensation' },
        lines: ['Rising air cools. Water vapor condenses on specks of dust into cloud droplets.'],
      },
      {
        label: 'Precipitation',
        water: { process: 'precipitation', driver: 'gravity' },
        lines: [
          'Droplets join until they are too heavy to stay up.',
          'Gravity pulls them down as rain, snow or hail.',
        ],
      },
      {
        label: 'Runoff',
        water: { process: 'runoff', driver: 'gravity' },
        lines: [
          'Water flows downhill over the land into streams and rivers, and back to the ocean.',
        ],
      },
      {
        label: 'Infiltration',
        water: { process: 'infiltration', driver: 'gravity' },
        lines: ['Water soaks into the soil and fills spaces in rock underground: groundwater.'],
      },
      {
        label: 'Melting',
        water: { process: 'melting', driver: 'sun' },
        lines: ['Spring sunshine melts snow on the mountains, and the meltwater runs downhill.'],
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.6.water-cycle~sun-or-gravity',
    title: 'Sun or gravity?',
    use: 'Use this to sort water cycle steps by what drives them.',
    assumptions: [
      'Ask what moves the water: heat from the sun lifts it as vapor or melts ice; gravity pulls it down.',
      'Condensation is left out: cooling drives it, not the sun or gravity.',
    ],
    question: 'What drives this step?',
    bins: [
      {
        id: 'sun',
        label: 'Energy from the sun',
        why: 'Heat turns liquid or ice into vapor, or melts ice.',
      },
      { id: 'gravity', label: 'Gravity', why: 'Gravity pulls water down and downhill.' },
    ],
    cards: [
      { label: 'Water evaporates from a lake', bin: 'sun' },
      { label: 'Leaves give off water vapor', bin: 'sun' },
      { label: 'Snow on a mountain melts in spring', bin: 'sun' },
      { label: 'Ice turns straight to vapor on a cold, sunny day', bin: 'sun' },
      { label: 'Rain falls from a cloud', bin: 'gravity' },
      { label: 'A river flows to the sea', bin: 'gravity' },
      { label: 'Rainwater soaks into the soil', bin: 'gravity' },
      { label: 'A glacier creeps downhill', bin: 'gravity' },
    ],
  },
  {
    kind: 'explore',
    id: 's.6.weather-fronts',
    assumptions: [
      'An air mass is a huge body of air with about the same temperature and humidity throughout.',
      'A front is the boundary where two air masses meet.',
      'Cold air is denser than warm air, so it stays low and pushes the warm air up.',
    ],
    figure: { kind: 'front' },
    scenes: [
      {
        label: 'Cold front',
        front: { type: 'cold' },
        lines: [
          'Cold air wedges under warm air and lifts it fast.',
          'Tall clouds build: heavy rain or thunderstorms, then cooler, drier air.',
        ],
      },
      {
        label: 'Warm front',
        front: { type: 'warm' },
        lines: [
          'Warm air slides slowly up over a long slope of cold air.',
          'Flat layers of cloud spread ahead: long, light rain, then warmer air.',
        ],
      },
      {
        label: 'Stationary front',
        front: { type: 'stationary' },
        lines: [
          'Neither air mass pushes the other away.',
          'Clouds and rain can stay over one place for days.',
        ],
      },
      {
        label: 'Low pressure',
        front: { air: 'low' },
        lines: ['Air rises over a low. As it cools, clouds and rain form.'],
      },
      {
        label: 'High pressure',
        front: { air: 'high' },
        lines: ['Air sinks over a high. It warms and dries, so skies are usually clear.'],
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.6.weather-fronts~air-masses',
    title: 'Where an air mass formed',
    use: 'Use this to name air masses by where they formed.',
    assumptions: [
      'An air mass takes on the temperature and humidity of the land or ocean it sits over.',
      'Continental means over land (dry); maritime means over ocean (humid).',
      'Polar means cold; tropical means warm.',
    ],
    question: 'Which kind of air mass is it?',
    bins: [
      {
        id: 'cP',
        label: 'Continental polar (land, cold)',
        why: 'Forms over cold land: cold and dry.',
      },
      {
        id: 'mP',
        label: 'Maritime polar (ocean, cold)',
        why: 'Forms over cold ocean: cool and humid.',
      },
      {
        id: 'mT',
        label: 'Maritime tropical (ocean, warm)',
        why: 'Forms over warm ocean: warm and humid.',
      },
      {
        id: 'cT',
        label: 'Continental tropical (land, warm)',
        why: 'Forms over hot desert: hot and dry.',
      },
    ],
    cards: [
      {
        label: 'Air from northern Canada in winter',
        bin: 'cP',
        figure: { kind: 'map', area: 'northAmerica', region: 'northern canada' },
      },
      {
        label: 'Frigid, dry air from the Arctic lands',
        bin: 'cP',
        figure: { kind: 'map', area: 'northAmerica', region: 'arctic lands' },
      },
      {
        label: 'Air from the North Pacific near Alaska',
        bin: 'mP',
        figure: { kind: 'map', area: 'northAmerica', region: 'north pacific' },
      },
      {
        label: 'Cool, damp air over the North Atlantic',
        bin: 'mP',
        figure: { kind: 'map', area: 'northAmerica', region: 'north atlantic' },
      },
      {
        label: 'Air from the Gulf of Mexico',
        bin: 'mT',
        figure: { kind: 'map', area: 'northAmerica', region: 'gulf of mexico' },
      },
      {
        label: 'Warm, muggy air from the Caribbean Sea',
        bin: 'mT',
        figure: { kind: 'map', area: 'northAmerica', region: 'caribbean sea' },
      },
      {
        label: 'Air from the deserts of northern Mexico',
        bin: 'cT',
        figure: { kind: 'map', area: 'northAmerica', region: 'northern mexico' },
      },
      {
        label: 'Hot, dry air over the desert Southwest',
        bin: 'cT',
        figure: { kind: 'map', area: 'northAmerica', region: 'desert southwest' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.6.weather-fronts~forecast',
    title: 'Stormy or fair?',
    use: 'Use this to predict the weather from pressure, fronts and rising or sinking air.',
    assumptions: [
      'Rising air cools, and its water vapor condenses into clouds.',
      'Sinking air warms, and clouds dry up.',
      'A falling barometer means low pressure is coming; a rising one means high pressure.',
    ],
    question: 'What weather is likely next?',
    bins: [
      {
        id: 'wet',
        label: 'Clouds and rain likely',
        why: 'Air is rising, so it cools and its water vapor condenses.',
      },
      {
        id: 'fair',
        label: 'Clear and dry likely',
        why: 'Air is sinking, so it warms and clouds dry up.',
      },
    ],
    cards: [
      {
        label: 'The barometer is falling fast',
        bin: 'wet',
        figure: { kind: 'icon', icon: 'barometer falling' },
      },
      {
        label: 'A low-pressure center is moving in',
        bin: 'wet',
        figure: { kind: 'icon', icon: 'low pressure center' },
      },
      {
        label: 'A cold front is a few hours away',
        bin: 'wet',
        figure: { kind: 'icon', icon: 'cold front near town' },
      },
      {
        label: 'Warm, humid air is rising up a mountainside',
        bin: 'wet',
        figure: { kind: 'icon', icon: 'air rising up mountain' },
      },
      {
        label: 'The barometer is rising',
        bin: 'fair',
        figure: { kind: 'icon', icon: 'barometer rising' },
      },
      {
        label: 'A high-pressure center is overhead',
        bin: 'fair',
        figure: { kind: 'icon', icon: 'high pressure center' },
      },
      {
        label: 'A cold front passed last night and the wind is from the northwest',
        bin: 'fair',
        figure: { kind: 'icon', icon: 'cold front past town' },
      },
      {
        label: 'Dry air is sinking over the area',
        bin: 'fair',
        figure: { kind: 'icon', icon: 'air sinking over land' },
      },
    ],
  },
  {
    kind: 'observe',
    id: 's.6.weather-fronts~front-passing',
    title: 'A front passing through',
    use: 'Use this to record hourly temperatures and spot when a front passed.',
    assumptions: [
      'Read a thermometer in the shade, or the school weather station, every hour.',
      'A cold front brings a sudden drop in temperature, a change in wind and often a burst of rain.',
    ],
    columns: ['2 pm', '3 pm', '4 pm', '5 pm', '6 pm'],
    rowLabel: 'Temperature',
    unit: '°C',
    max: 40,
    step: 1,
    initial: [27, 28, 26, 18, 16],
    pattern: (values) => {
      const hours = ['2 pm', '3 pm', '4 pm', '5 pm', '6 pm'];
      let drop = 0;
      let at = 0;
      values.forEach((x, i) => {
        if (i > 0 && values[i - 1]! - x > drop) [drop, at] = [values[i - 1]! - x, i];
      });
      if (drop >= 5)
        return `The temperature fell ${drop} °C between ${hours[at - 1]} and ${hours[at]}. A cold front probably passed then.`;
      if (values.every((x, i) => i === 0 || x > values[i - 1]!))
        return 'The air warmed all afternoon. No cold front passed.';
      return 'No sudden change. The same air mass probably stayed all afternoon.';
    },
  },
  {
    kind: 'explore',
    id: 's.6.plate-tectonics',
    assumptions: [
      'Earth’s outer shell is broken into large pieces called plates, which move a few centimeters a year.',
      'Most earthquakes and volcanoes happen where plates meet.',
    ],
    figure: { kind: 'plates' },
    scenes: [
      {
        label: 'Ocean ridge',
        plates: { boundary: 'divergent', ages: true },
        lines: [
          'Two plates pull apart. Magma rises and cools into new seafloor.',
          'The rock is older the farther it is from the ridge, the same on both sides.',
        ],
      },
      {
        label: 'Rift valley',
        plates: { boundary: 'rift' },
        lines: ['A continent stretches and cracks apart, as in East Africa today.'],
      },
      {
        label: 'Ocean plate under a continent',
        plates: { boundary: 'subduction' },
        lines: [
          'The denser ocean plate sinks under the continent.',
          'Deep down, rock melts and rises to feed volcanoes such as the Andes.',
        ],
      },
      {
        label: 'Two continents collide',
        plates: { boundary: 'collision' },
        lines: [
          'Neither plate sinks easily, so the crust crumples and piles up.',
          'That is how the Himalayas formed.',
        ],
      },
      {
        label: 'Plates slide past',
        plates: { boundary: 'transform' },
        lines: [
          'The plates grind past each other sideways.',
          'They lock, then slip suddenly in earthquakes, as on the San Andreas Fault.',
        ],
      },
      {
        label: 'What moves the plates',
        plates: { boundary: 'divergent', mantle: true },
        lines: [
          'Hot rock in the mantle rises slowly and cooler rock sinks.',
          'This slow flow, and the pull of sinking plates, moves the plates.',
        ],
      },
    ],
  },
  {
    kind: 'explore',
    id: 's.6.plate-tectonics~pangaea',
    title: 'Evidence that continents moved',
    use: 'Use this to see the evidence that the continents were once joined.',
    assumptions: [
      'The maps are simplified drawings, not exact coastlines.',
      'Scientists put the clues together: fossils, rocks and the shapes of the coasts.',
    ],
    figure: { kind: 'continents' },
    scenes: [
      {
        label: '250 million years ago',
        continents: { age: 250 },
        lines: ['The continents were joined in one supercontinent, Pangaea.'],
      },
      {
        label: '150 million years ago',
        continents: { age: 150 },
        lines: [
          'North America had pulled away from Africa.',
          'South America and Africa were still joined.',
        ],
      },
      {
        label: 'Today',
        continents: { age: 0 },
        lines: ['The Atlantic Ocean is still widening, a few centimeters a year.'],
      },
      {
        label: 'Fossil clue',
        continents: { age: 250, clue: 'fossils' },
        lines: [
          'Fossils of Mesosaurus, a small freshwater reptile, are found in both South America and Africa.',
          'It could not have swum across an ocean.',
        ],
      },
      {
        label: 'Rock clue',
        continents: { age: 250, clue: 'rocks' },
        lines: [
          'Mountains of the same age and rock type line up across North America, Greenland and northern Europe.',
        ],
      },
      {
        label: 'Climate clue',
        continents: { age: 250, clue: 'climate' },
        lines: [
          'Scratches left by one ice sheet are found in South America, Africa, India and Australia.',
          'Coal, made from warm swamp plants, is found in Antarctica: it was once far from the pole.',
        ],
      },
      {
        label: 'Shape clue',
        continents: { age: 0, clue: 'shapes' },
        lines: [
          'The east coast of South America fits the west coast of Africa like puzzle pieces.',
        ],
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.6.plate-tectonics~boundaries',
    title: 'What the plates are doing',
    use: 'Use this to sort places by the kind of plate boundary there.',
    assumptions: [
      'Plates move apart, push together or slide past each other.',
      'Each kind of boundary makes its own landforms and hazards.',
    ],
    question: 'What are the plates doing here?',
    bins: [
      {
        id: 'apart',
        label: 'Moving apart (divergent)',
        why: 'New crust forms as magma fills the gap.',
      },
      {
        id: 'together',
        label: 'Pushing together (convergent)',
        why: 'One plate sinks under the other, or the crust crumples into mountains.',
      },
      {
        id: 'past',
        label: 'Sliding past (transform)',
        why: 'The plates grind sideways; crust is neither made nor destroyed.',
      },
    ],
    cards: [
      {
        label: 'Mid-Atlantic Ridge',
        bin: 'apart',
        figure: { kind: 'map', area: 'world', pin: [-42, 30] },
      },
      { label: 'Iceland', bin: 'apart', figure: { kind: 'map', area: 'world', pin: [-19, 65] } },
      {
        label: 'East African Rift',
        bin: 'apart',
        figure: { kind: 'map', area: 'world', pin: [36.5, 0] },
      },
      {
        label: 'Himalayas',
        bin: 'together',
        figure: { kind: 'map', area: 'world', pin: [84, 28.5] },
      },
      {
        label: 'Andes Mountains',
        bin: 'together',
        figure: { kind: 'map', area: 'world', pin: [-69, -20] },
      },
      {
        label: 'Mariana Trench',
        bin: 'together',
        figure: { kind: 'map', area: 'world', pin: [142.2, 11.3] },
      },
      {
        label: 'Mount St. Helens',
        bin: 'together',
        figure: { kind: 'map', area: 'northAmerica', pin: [-122.2, 46.2] },
      },
      {
        label: 'San Andreas Fault',
        bin: 'past',
        figure: { kind: 'map', area: 'northAmerica', pin: [-120.5, 35.5] },
      },
      {
        label: 'North Anatolian Fault in Turkey',
        bin: 'past',
        figure: { kind: 'map', area: 'world', pin: [35, 40.8] },
      },
    ],
  },
  {
    kind: 'explore',
    id: 's.6.rock-cycle',
    assumptions: [
      'Any kind of rock can become any other kind; there is no single path.',
      'Sunlight and gravity drive the steps at the surface. Earth’s inner heat drives melting and metamorphism.',
      'Most steps take thousands to millions of years.',
    ],
    figure: { kind: 'rockCycle' },
    scenes: [
      {
        label: 'Melting',
        rock: { process: 'melting' },
        lines: ['Deep underground, heat melts rock into magma.'],
      },
      {
        label: 'Cooling',
        rock: { process: 'cooling' },
        lines: [
          'Magma cools into igneous rock. Underground it cools slowly into big crystals, like granite.',
          'At the surface lava cools fast into tiny crystals, like basalt.',
        ],
      },
      {
        label: 'Weathering and erosion',
        rock: { process: 'weathering' },
        lines: ['Water, ice and wind break rock into sediment and carry it away.'],
      },
      {
        label: 'Deposition and cementing',
        rock: { process: 'deposition' },
        lines: [
          'Sediment settles in layers.',
          'Buried layers are squeezed and cemented into sedimentary rock.',
        ],
      },
      {
        label: 'Heat and pressure',
        rock: { process: 'metamorphism' },
        lines: [
          'Buried rock is heated and squeezed without melting.',
          'Its minerals change, making metamorphic rock.',
        ],
      },
      {
        label: 'Uplift',
        rock: { process: 'uplift' },
        lines: ['Moving plates push buried rock up to the surface, where weathering starts again.'],
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.6.rock-cycle~rock-types',
    title: 'Igneous, sedimentary or metamorphic?',
    use: 'Use this to sort rocks by how they formed.',
    assumptions: [
      'Crystals, glass or gas holes in a rock that cooled from magma or lava make it igneous.',
      'Grains, pebbles or shells cemented in layers make a rock sedimentary.',
      'A rock made from an older rock by heat and pressure is metamorphic, even with crystals or layers.',
    ],
    question: 'How did this rock form?',
    bins: [
      {
        id: 'igneous',
        label: 'Igneous',
        why: 'It cooled from melted rock: crystals, glass or gas holes.',
      },
      {
        id: 'sedimentary',
        label: 'Sedimentary',
        why: 'Grains or shells were pressed and cemented in layers.',
      },
      {
        id: 'metamorphic',
        label: 'Metamorphic',
        why: 'Heat and pressure changed an older rock: bands or flattened grains.',
      },
    ],
    cards: [
      { label: 'Granite', bin: 'igneous', figure: { kind: 'rock', texture: 'crystals' } },
      { label: 'Basalt', bin: 'igneous', figure: { kind: 'rock', texture: 'fine' } },
      { label: 'Obsidian', bin: 'igneous', figure: { kind: 'rock', texture: 'glassy' } },
      { label: 'Pumice', bin: 'igneous', figure: { kind: 'rock', texture: 'holes' } },
      { label: 'Sandstone', bin: 'sedimentary', figure: { kind: 'rock', texture: 'grains' } },
      { label: 'Conglomerate', bin: 'sedimentary', figure: { kind: 'rock', texture: 'pebbles' } },
      {
        label: 'Limestone with shells',
        bin: 'sedimentary',
        figure: { kind: 'rock', texture: 'shells' },
      },
      { label: 'Shale', bin: 'sedimentary', figure: { kind: 'rock', texture: 'layers' } },
      {
        label: 'Marble, from limestone',
        bin: 'metamorphic',
        figure: { kind: 'rock', texture: 'crystals' },
      },
      {
        label: 'Slate, from shale',
        bin: 'metamorphic',
        figure: { kind: 'rock', texture: 'layers' },
      },
      { label: 'Gneiss', bin: 'metamorphic', figure: { kind: 'rock', texture: 'bands' } },
      {
        label: 'Quartzite, from sandstone',
        bin: 'metamorphic',
        figure: { kind: 'rock', texture: 'crystals' },
      },
    ],
  },
  {
    kind: 'sequence',
    id: 's.6.rock-cycle~sandstone',
    title: 'From mountain to sandstone',
    use: 'Use this to put the steps that turn granite into sandstone in order.',
    assumptions: [
      'Each step takes a long time: years to millions of years.',
      'The sand grains are bits of the old granite.',
    ],
    question: 'Put the steps in order.',
    stages: [
      {
        label: 'Granite on a mountain weathers into sand grains',
        figure: { kind: 'icon', icon: 'granite crumbling' },
      },
      {
        label: 'Rain and rivers carry the sand downhill',
        figure: { kind: 'icon', icon: 'river carrying sand' },
      },
      {
        label: 'The sand settles in layers on a lake or sea floor',
        figure: { kind: 'icon', icon: 'sand settling in lake' },
      },
      {
        label: 'New layers pile on top and squeeze the sand',
        figure: { kind: 'icon', icon: 'layers squeezing sand' },
      },
      {
        label: 'Minerals glue the grains into sandstone',
        figure: { kind: 'rock', texture: 'grains' },
      },
    ],
  },
];
