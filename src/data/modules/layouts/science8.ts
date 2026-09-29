/**
 * Grade 8 science layout pages (explore, sort, sequence, observe), by skill in taxonomy order.
 * The calculators are in `../science/8.ts`. Data only: no UI code.
 */
import type { LayoutDef, MoonPhase } from './types';

const PHASES: [MoonPhase, string][] = [
  ['new', 'The moon is between Earth and the sun. Its lit half faces away, so we see nothing.'],
  ['waxing crescent', 'A sliver of the lit half shows on the right. Waxing means growing.'],
  ['first quarter', 'A quarter of the way round: half of what we see is lit, on the right.'],
  ['waxing gibbous', 'More than half lit and still growing.'],
  ['full', 'Earth is between the sun and the moon. We see the whole lit half.'],
  ['waning gibbous', 'Shrinking now: more than half lit, on the left.'],
  ['third quarter', 'Three quarters of the way round: half lit, on the left.'],
  ['waning crescent', 'A sliver on the left, then new moon again about 29.5 days after the last.'],
];

export const SCIENCE_8_LAYOUTS: LayoutDef[] = [
  // ── Speed, velocity and acceleration (MS-PS2-2) ──
  {
    kind: 'sort',
    id: 's.8.motion~steady-or-not',
    title: 'Steady, speeding up or slowing down?',
    use: 'Use this for “The picture shows a runner’s positions each second. Is the speed constant or increasing?”',
    assumptions: [
      'Speed is the gap between positions one second apart.',
      '20, 15, 10, 5, 0 is a steady speed toward the start: equal gaps, negative velocity.',
    ],
    question: 'From the positions each second, how is it moving?',
    bins: [
      { id: 'steady', label: 'Steady speed', why: 'The same distance every second: equal gaps.' },
      { id: 'faster', label: 'Speeding up', why: 'Each gap is bigger than the last.' },
      { id: 'slower', label: 'Slowing down', why: 'Each gap is smaller than the last.' },
    ],
    cards: [
      { label: '0, 2, 4, 6, 8', bin: 'steady' },
      { label: '0, 1, 4, 9, 16', bin: 'faster' },
      { label: '0, 8, 14, 18, 20', bin: 'slower' },
      { label: '5, 8, 11, 14, 17', bin: 'steady' },
      { label: '0, 2, 5, 9, 14', bin: 'faster' },
      { label: '0, 5, 9, 12, 14', bin: 'slower' },
      { label: '20, 15, 10, 5, 0', bin: 'steady' },
      { label: '0, 0.5, 2, 4.5, 8', bin: 'faster' },
    ],
  },

  // ── Newton's three laws of motion (MS-PS2-1, MS-PS2-2) ──
  {
    kind: 'sort',
    id: 's.8.newtons-laws~balanced-or-not',
    title: 'Balanced or unbalanced forces?',
    use: 'Use this for “What causes the sliding rock to slow down?”',
    assumptions: [
      'Balanced does not mean stopped: a steady speed in a straight line has no net force.',
      'Slowing down means an unbalanced force, usually friction, against the motion.',
    ],
    question: 'Are the forces on it balanced?',
    bins: [
      {
        id: 'balanced',
        label: 'Balanced: motion does not change',
        why: 'At rest, or moving at a steady speed in a straight line.',
      },
      {
        id: 'unbalanced',
        label: 'Unbalanced: it speeds up, slows or turns',
        why: 'A net force changes the motion.',
      },
    ],
    cards: [
      { label: 'A book resting on a table', bin: 'balanced' },
      { label: 'A rock sliding on ice slows down', bin: 'unbalanced' },
      { label: 'A car cruising at a steady 60 km/h on a straight road', bin: 'balanced' },
      { label: 'A ball rolling to a stop on grass', bin: 'unbalanced' },
      { label: 'A skydiver falling at a steady speed with the parachute open', bin: 'balanced' },
      { label: 'A rocket lifting off', bin: 'unbalanced' },
      { label: 'A box pushed at a steady speed across carpet', bin: 'balanced' },
      { label: 'A bike turning a corner at a steady speed', bin: 'unbalanced' },
      { label: 'A dropped apple', bin: 'unbalanced' },
    ],
  },

  // ── Kinetic and potential energy (MS-PS3-1, MS-PS3-2) ──
  {
    kind: 'sort',
    id: 's.8.kinetic-potential~kinetic-or-potential',
    title: 'Kinetic or potential energy?',
    use: 'Use this for “Which description illustrates a type of kinetic energy?”',
    assumptions: [
      'Potential energy counts gravitational (height), elastic (stretch or squeeze) and chemical (fuel, food).',
      'A thrown ball at the top of its flight has both: it is still moving sideways.',
    ],
    question: 'Which kind of energy does the description show?',
    bins: [
      {
        id: 'kinetic',
        label: 'Kinetic: energy of moving',
        why: 'Anything moving has it: the faster and heavier, the more.',
      },
      {
        id: 'potential',
        label: 'Potential: stored by position or arrangement',
        why: 'Lifted up, stretched, squeezed, or in chemical bonds; ready to become motion.',
      },
    ],
    cards: [
      { label: 'A wagon rolling on a sidewalk', bin: 'kinetic' },
      { label: 'A book resting on a high shelf', bin: 'potential' },
      { label: 'A thrown baseball in the air', bin: 'kinetic' },
      { label: 'A stretched spring', bin: 'potential' },
      { label: 'Wind', bin: 'kinetic' },
      { label: 'A drawn bow', bin: 'potential' },
      { label: 'A river flowing', bin: 'kinetic' },
      { label: 'A can of gasoline', bin: 'potential' },
      { label: 'A spinning bicycle wheel', bin: 'kinetic' },
      { label: 'Water behind a dam', bin: 'potential' },
      { label: 'A coaster car paused at the top of the first hill', bin: 'potential' },
    ],
  },

  // ── Wave properties and the electromagnetic spectrum (MS-PS4-1, MS-PS4-3) ──
  {
    kind: 'sequence',
    id: 's.8.em-spectrum~spectrum-order',
    title: 'The spectrum from longest wave to shortest',
    use: 'Use this for “Order these waves from longest wavelength to shortest.”',
    assumptions: [
      'Longest wavelength, lowest frequency, least energy per wave on the left.',
      'Radio waves can be kilometers long; gamma rays are smaller than an atom.',
    ],
    question: 'Order the waves from the longest wavelength to the shortest.',
    stages: [
      { label: 'Radio waves' },
      { label: 'Microwaves' },
      { label: 'Infrared' },
      { label: 'Visible light' },
      { label: 'Ultraviolet' },
      { label: 'X-rays' },
      { label: 'Gamma rays' },
    ],
  },
  {
    kind: 'sort',
    id: 's.8.em-spectrum~loud-or-high',
    title: 'Louder, or higher pitched?',
    use: 'Use this for “How do the vibrations compare for a louder sound versus a higher-pitched one?”',
    assumptions: [
      'Loudness is amplitude, how far the source moves each vibration.',
      'Pitch is frequency, how many vibrations each second.',
    ],
    question: 'What changed about the wave?',
    bins: [
      {
        id: 'amplitude',
        label: 'Amplitude: louder or softer',
        why: 'Bigger vibrations carry more energy to your ear.',
      },
      {
        id: 'frequency',
        label: 'Frequency: higher or lower pitch',
        why: 'Faster vibrations, more waves each second.',
      },
    ],
    cards: [
      { label: 'Pluck a guitar string harder', bin: 'amplitude' },
      { label: 'Tighten a guitar string', bin: 'frequency' },
      { label: 'Turn the volume knob up', bin: 'amplitude' },
      { label: 'Press a string to shorten it', bin: 'frequency' },
      { label: 'Hit a drum gently instead of hard', bin: 'amplitude' },
      { label: 'Blow across a shorter bottle', bin: 'frequency' },
      { label: 'Whisper instead of speaking', bin: 'amplitude' },
      { label: 'Sing a deeper note', bin: 'frequency' },
      { label: 'A mosquito’s whine compared with a bee’s buzz', bin: 'frequency' },
    ],
  },
  {
    kind: 'sort',
    id: 's.8.em-spectrum~digital-or-analog',
    title: 'Digital or analog signal?',
    use: 'Use this for “Why are digitized signals a more reliable way to store and send information?”',
    assumptions: [
      'Both are signals; a digital one is read as only two levels.',
      'Digital signals can be copied and sent many times without changing.',
    ],
    question: 'How is the information carried?',
    bins: [
      {
        id: 'digital',
        label: 'Digital: a pattern of on and off',
        why: 'Ones and zeros. A copy is exact, and small noise does not change a 1 into a 0.',
      },
      {
        id: 'analog',
        label: 'Analog: a wave that varies smoothly',
        why: 'The signal copies the sound or picture itself. Every copy adds noise.',
      },
    ],
    cards: [
      { label: 'A text message', bin: 'digital' },
      { label: 'The groove of a vinyl record', bin: 'analog' },
      { label: 'The pits on a CD', bin: 'digital' },
      { label: 'Sound in a cup phone’s string', bin: 'analog' },
      { label: 'A QR code', bin: 'digital' },
      { label: 'An old radio’s crackling music', bin: 'analog' },
      { label: 'Morse code flashes', bin: 'digital' },
      { label: 'A mercury thermometer’s column', bin: 'analog' },
      { label: 'A photo on a phone', bin: 'digital' },
      { label: 'A cassette tape', bin: 'analog' },
    ],
  },

  // ── Electric charge, current and simple circuits (MS-PS2-3, MS-PS2-5) ──
  {
    kind: 'sort',
    id: 's.8.electricity-basics~conductors',
    title: 'Conductor or insulator?',
    use: 'Use this for “Which material is the best conductor of electricity?” and “Which items would let the bulb light?”',
    assumptions: [
      'Test an item by putting it in a gap in a working circuit: the bulb lights only if the item conducts.',
      'Wires are copper inside plastic: a conductor inside an insulator.',
    ],
    question: 'Would the bulb light with this item in the gap?',
    bins: [
      {
        id: 'conductor',
        label: 'Conductor: the bulb lights',
        why: 'Charge flows through it easily: metals, salt water, graphite.',
      },
      {
        id: 'insulator',
        label: 'Insulator: the bulb stays dark',
        why: 'Charge cannot flow through it: plastic, rubber, wood, glass, dry air.',
      },
    ],
    cards: [
      { label: 'House key', bin: 'conductor' },
      { label: 'Rubber band', bin: 'insulator' },
      { label: 'Coin', bin: 'conductor' },
      { label: 'Wooden toothpick', bin: 'insulator' },
      { label: 'Metal fork', bin: 'conductor' },
      { label: 'Plastic spoon', bin: 'insulator' },
      { label: 'Aluminum foil', bin: 'conductor' },
      { label: 'Glass marble', bin: 'insulator' },
      { label: 'Steel nail', bin: 'conductor' },
      { label: 'Dry paper', bin: 'insulator' },
      { label: 'Pencil lead (graphite)', bin: 'conductor' },
      { label: 'Cotton string', bin: 'insulator' },
    ],
  },
  {
    kind: 'sort',
    id: 's.8.electricity-basics~pull-or-push',
    title: 'Charges that pull together or push apart',
    use: 'Use this for “Two rubbed balloons are brought near each other. What happens?”',
    assumptions: [
      'Rubbing moves electrons: the balloon goes negative, the sweater positive.',
      'Electric forces act at a distance and grow as the charges come closer.',
    ],
    question: 'Do they pull together or push apart?',
    bins: [
      {
        id: 'attract',
        label: 'Pull together',
        why: 'Opposite charges, or a charge near something uncharged.',
      },
      { id: 'repel', label: 'Push apart', why: 'Like charges: both negative or both positive.' },
    ],
    cards: [
      { label: 'A rubbed balloon and a wall', bin: 'attract' },
      { label: 'Two balloons rubbed on the same sweater', bin: 'repel' },
      { label: 'A rubbed balloon and small bits of paper', bin: 'attract' },
      { label: 'Two negative charges', bin: 'repel' },
      { label: 'A negative charge and a positive charge', bin: 'attract' },
      { label: 'Two positive charges', bin: 'repel' },
      { label: 'A rubbed comb and hair', bin: 'attract' },
      { label: 'Two strands of hair after brushing', bin: 'repel' },
    ],
  },

  // ── Magnetic fields and electromagnets (MS-PS2-3, MS-PS2-5) ──
  {
    kind: 'explore',
    id: 's.8.magnetic-fields~field-lines',
    title: 'Magnetic field lines',
    use: 'Use this for “Draw the field around a bar magnet” and “What does a compass do near a magnet?”',
    assumptions: [
      'A magnetic field fills the space round a magnet. It pushes or pulls on iron and other magnets without touching them.',
      'Field lines leave the north pole and go round to the south pole. Where they crowd together the field is strongest.',
      'A compass needle’s north end points along the field.',
    ],
    figure: { kind: 'magnets' },
    scenes: [
      {
        label: 'One magnet',
        lines: ['The lines crowd at the poles, where the field is strongest.'],
        poles: 'N–S',
        field: { single: true },
      },
      {
        label: 'Compasses',
        lines: [
          'Each compass lines up with the field where it sits. Far from the magnet they point north again.',
        ],
        poles: 'N–S',
        field: { single: true, lines: false, compasses: true },
      },
      {
        label: 'N faces S',
        lines: ['Lines run straight across the gap: the magnets pull together.'],
        poles: 'N–S',
        field: {},
      },
      {
        label: 'N faces N',
        lines: ['The lines squeeze away from each other: the magnets push apart.'],
        poles: 'N–N',
        field: {},
      },
      {
        label: 'S faces S',
        lines: ['Like poles push apart either way.'],
        poles: 'S–S',
        field: {},
      },
    ],
  },
  {
    kind: 'observe',
    id: 's.8.magnetic-fields~clips-by-turns',
    title: 'Paper clips by turns of wire',
    use: 'Use this to record how many clips your electromagnet lifts with more turns.',
    assumptions: [
      'Wind the same wire round the same nail, keep the same battery, and count the clips it lifts.',
      'Change only the turns: a fair test.',
      'Wire warms up; disconnect between trials.',
    ],
    columns: ['10 turns', '20 turns', '30 turns', '40 turns', '50 turns'],
    rowLabel: 'Clips picked up',
    unit: 'clips',
    max: 30,
    step: 1,
    initial: [2, 4, 6, 9, 11],
    pattern: (v) => {
      const first = v[0]!;
      const last = v[v.length - 1]!;
      if (v.every((x, i) => i === 0 || x >= v[i - 1]!) && last > first)
        return `From ${first} clips at 10 turns to ${last} at 50: more turns, a stronger electromagnet.`;
      return 'The count did not rise with the turns. Check the battery is fresh and the same one each time.';
    },
  },
  {
    kind: 'observe',
    id: 's.8.magnetic-fields~pull-by-distance',
    title: 'Magnetic pull by distance',
    use: 'Use this to record how a magnet’s pull falls as it moves away.',
    assumptions: [
      'Set a magnet a measured distance from a pile of clips and count how many it pulls across.',
      'Doubling the distance cuts the pull to much less than half.',
      'Forces at a distance need no contact: the field does the pulling.',
    ],
    columns: ['1 cm', '2 cm', '3 cm', '4 cm', '5 cm'],
    rowLabel: 'Clips pulled across',
    unit: 'clips',
    max: 20,
    step: 1,
    initial: [12, 6, 3, 2, 1],
    pattern: (v) => {
      const first = v[0]!;
      const last = v[v.length - 1]!;
      if (v.every((x, i) => i === 0 || x <= v[i - 1]!) && first > last)
        return `The pull fell from ${first} clips at 1 cm to ${last} at 5 cm. The field weakens quickly with distance.`;
      return 'The pull should fall with distance. Measure from the magnet’s face and try again.';
    },
  },
  {
    kind: 'sort',
    id: 's.8.magnetic-fields~stronger-or-weaker',
    title: 'Stronger or weaker magnet?',
    use: 'Use this for “Which change would make the electromagnet stronger?”',
    assumptions: [
      'Three things set an electromagnet’s strength: turns, current and the core.',
      'Silver or copper wire conducts a little better, but the turns and current matter far more.',
    ],
    question: 'Does the change make the pull stronger or weaker?',
    bins: [
      {
        id: 'stronger',
        label: 'Stronger',
        why: 'More turns, more current, an iron core, or closer.',
      },
      {
        id: 'weaker',
        label: 'Weaker',
        why: 'Fewer turns, less current, no iron core, or farther away.',
      },
    ],
    cards: [
      { label: 'Wind 20 more turns on the nail', bin: 'stronger' },
      { label: 'Use a plastic rod instead of the nail', bin: 'weaker' },
      { label: 'Add a second battery in series', bin: 'stronger' },
      { label: 'Unwind half the turns', bin: 'weaker' },
      { label: 'Put an iron nail inside the empty coil', bin: 'stronger' },
      { label: 'Use a nearly flat battery', bin: 'weaker' },
      { label: 'Move the clips closer to the coil', bin: 'stronger' },
      { label: 'Hold the magnet 5 cm away instead of 1 cm', bin: 'weaker' },
    ],
  },

  // ── The periodic table (MS-PS1-1) ──
  {
    kind: 'explore',
    id: 's.8.periodic-table',
    assumptions: [
      'Every element has its own kind of atom, with its own number of protons: the atomic number.',
      'The table lists the elements in atomic-number order, in rows (periods) and columns (groups).',
      'Elements in one group behave alike, so the table predicts how an element will react.',
      'Metals fill the left and middle, nonmetals the right; metalloids sit on the stair-step between.',
    ],
    figure: { kind: 'periodicTable' },
    scenes: [
      {
        label: 'Oxygen',
        lines: ['Atomic number 8: 8 protons. A nonmetal gas we breathe.'],
        elements: { element: 'O' },
      },
      {
        label: 'Group 1',
        lines: ['The alkali metals under hydrogen: soft metals that react fast with water.'],
        elements: { group: 1 },
      },
      {
        label: 'Group 17',
        lines: [
          'The halogens: fluorine, chlorine, bromine, iodine. They react with metals to make salts.',
        ],
        elements: { group: 17 },
      },
      {
        label: 'Group 18',
        lines: ['The noble gases: helium, neon, argon. They hardly react at all.'],
        elements: { group: 18 },
      },
      {
        label: 'Period 3',
        lines: ['Sodium to argon: from a soft metal to a noble gas across one row.'],
        elements: { period: 3 },
      },
      {
        label: 'Families',
        lines: ['Metals, metalloids, nonmetals and noble gases.'],
        elements: { families: true },
      },
      {
        label: 'Like argon',
        lines: ['To find an element with properties like argon’s, look up and down its column.'],
        elements: { element: 'Ar', ring: ['He', 'Ne', 'Kr'], families: true },
      },
      {
        label: 'Carbon',
        lines: ['Atomic number 6: the element of life, in every sugar and every cell.'],
        elements: { element: 'C' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.8.periodic-table~metal-or-not',
    title: 'Metal, nonmetal or metalloid?',
    use: 'Use this for “Which of these elements is a nonmetal?”',
    assumptions: [
      'Metals are on the left and middle of the table, nonmetals on the right, metalloids on the stair-step between.',
      'Hydrogen is a nonmetal even though it sits at the top of group 1.',
    ],
    question: 'Which family?',
    bins: [
      {
        id: 'metal',
        label: 'Metal',
        why: 'Shiny, bends, conducts heat and electricity; left and middle of the table.',
      },
      {
        id: 'nonmetal',
        label: 'Nonmetal',
        why: 'Dull or a gas, brittle, poor conductor; upper right.',
      },
      {
        id: 'metalloid',
        label: 'Metalloid',
        why: 'Between the two on the stair-step; conducts a little, used in chips.',
      },
    ],
    cards: [
      { label: 'Iron', bin: 'metal' },
      { label: 'Oxygen', bin: 'nonmetal' },
      { label: 'Silicon', bin: 'metalloid' },
      { label: 'Copper', bin: 'metal' },
      { label: 'Carbon', bin: 'nonmetal' },
      { label: 'Boron', bin: 'metalloid' },
      { label: 'Sodium', bin: 'metal' },
      { label: 'Chlorine', bin: 'nonmetal' },
      { label: 'Aluminum', bin: 'metal' },
      { label: 'Neon', bin: 'nonmetal' },
      { label: 'Gold', bin: 'metal' },
      { label: 'Sulfur', bin: 'nonmetal' },
    ],
  },
  {
    kind: 'sort',
    id: 's.8.periodic-table~which-family',
    title: 'Which group does it belong with?',
    use: 'Use this for “Which element has chemical properties most similar to argon?”',
    assumptions: [
      'Elements in one column react in the same ways.',
      'Sodium and chlorine, from groups 1 and 17, make table salt.',
    ],
    question: 'Which group?',
    bins: [
      {
        id: 'alkali',
        label: 'Alkali metals (group 1)',
        why: 'Soft metals that react fast with water.',
      },
      {
        id: 'halogens',
        label: 'Halogens (group 17)',
        why: 'Reactive nonmetals that make salts with metals.',
      },
      { id: 'noble', label: 'Noble gases (group 18)', why: 'Gases that hardly react.' },
    ],
    cards: [
      { label: 'Lithium', bin: 'alkali' },
      { label: 'Fluorine', bin: 'halogens' },
      { label: 'Helium', bin: 'noble' },
      { label: 'Sodium', bin: 'alkali' },
      { label: 'Chlorine', bin: 'halogens' },
      { label: 'Neon', bin: 'noble' },
      { label: 'Potassium', bin: 'alkali' },
      { label: 'Bromine', bin: 'halogens' },
      { label: 'Argon', bin: 'noble' },
      { label: 'Iodine', bin: 'halogens' },
      { label: 'Krypton', bin: 'noble' },
    ],
  },

  // ── Gravity and orbits in the solar system (MS-ESS1-1, MS-ESS1-3) ──
  {
    kind: 'explore',
    id: 's.8.gravity-orbits~planets-to-scale',
    title: 'The planets to scale',
    use: 'Use this for “Why do the sun and moon look about the same size?” and “How many Earths wide is Jupiter?”',
    assumptions: [
      'Every planet, the moon and the sun’s edge are drawn to one scale by size. Their distances apart are not to scale.',
      'The sun is about 109 Earths across; Jupiter 11; the moon about a quarter of Earth.',
    ],
    figure: { kind: 'planets' },
    scenes: [
      {
        label: 'All',
        lines: ['Four small rocky inner planets, four giant outer ones.'],
        planets: {},
      },
      {
        label: 'Earth and moon',
        lines: [
          'The moon is 400 times smaller than the sun and 400 times closer, so they look the same size in our sky.',
        ],
        planets: { lit: ['earth', 'moon'] },
      },
      {
        label: 'Jupiter',
        lines: ['The biggest planet: 11 Earths across, 318 Earth masses.'],
        planets: { lit: ['jupiter'] },
      },
      {
        label: 'Giants',
        lines: ['Made mostly of gas and ice; far from the sun and cold.'],
        planets: { lit: ['jupiter', 'saturn', 'uranus', 'neptune'] },
      },
      {
        label: 'Rocky planets',
        lines: ['Small, rocky and close to the sun.'],
        planets: { lit: ['mercury', 'venus', 'earth', 'mars'] },
      },
    ],
  },
  {
    kind: 'explore',
    id: 's.8.gravity-orbits~moon-phases',
    title: 'Why the moon changes shape',
    use: 'Use this for “Explain why the moon appears to be different shapes at different times.”',
    assumptions: [
      'The moon makes no light; we see the half the sun lights.',
      'As the moon goes round Earth in about a month, we see more or less of its lit half.',
      'Seen from the Northern Hemisphere, a waxing moon grows, lit on the right; a waning one shrinks, lit on the left.',
    ],
    figure: { kind: 'sky' },
    scenes: [
      ...PHASES.map(([phase, line]) => ({
        label: phase.charAt(0).toUpperCase() + phase.slice(1),
        lines: [line],
        sky: { body: 'night' as const, phase },
      })),
      {
        label: 'The cycle',
        lines: [
          'New, waxing crescent, first quarter, waxing gibbous, full, waning gibbous, third quarter, waning crescent: about 3.7 days apart.',
        ],
        sky: { body: 'night', phase: 'full', cycle: true },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.8.gravity-orbits~eclipses',
    title: 'Solar eclipse or lunar eclipse?',
    use: 'Use this for “Why don’t we see an eclipse every month?” and “Which eclipse happens at full moon?”',
    assumptions: [
      'The moon’s orbit is tilted about 5°, so its shadow usually misses Earth and Earth’s misses it: no eclipse most months.',
      'The moon and sun look the same size from Earth, so the moon can just cover the sun.',
    ],
    question: 'Which eclipse is it?',
    bins: [
      {
        id: 'solar',
        label: 'Solar eclipse',
        why: 'The moon passes between Earth and the sun and its shadow falls on Earth: at new moon.',
      },
      {
        id: 'lunar',
        label: 'Lunar eclipse',
        why: 'Earth passes between the sun and the moon and its shadow falls on the moon: at full moon.',
      },
    ],
    cards: [
      { label: 'The moon blocks our view of the sun', bin: 'solar' },
      { label: 'Earth’s shadow covers the moon', bin: 'lunar' },
      { label: 'Day goes dark for a few minutes', bin: 'solar' },
      { label: 'The full moon turns a dim red', bin: 'lunar' },
      { label: 'Seen only from a narrow path across Earth', bin: 'solar' },
      { label: 'Seen from the whole night side of Earth', bin: 'lunar' },
      { label: 'Happens at new moon', bin: 'solar' },
      { label: 'Happens at full moon', bin: 'lunar' },
      { label: 'Never look at it without eclipse glasses', bin: 'solar' },
      { label: 'Lasts for hours', bin: 'lunar' },
    ],
  },
];
