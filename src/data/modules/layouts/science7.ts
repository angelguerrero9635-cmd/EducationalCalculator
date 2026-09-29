/**
 * Grade 7 science layout pages (explore, sort, sequence, observe), by skill in taxonomy order.
 * The calculators are in `../science/7.ts`. Data only: no UI code.
 */
import type { LayoutDef, PedigreePerson } from './types';

/** The eleven people of the pedigree page (`~pedigree`): a recessive trait through three generations. */
const PEDIGREE_PEOPLE: PedigreePerson[] = [
  { id: 'gp', sex: 'male', generation: 1, carrier: true, genotype: 'Aa' },
  { id: 'gm', sex: 'female', generation: 1, trait: true, genotype: 'aa' },
  { id: 'wife', sex: 'female', generation: 2, carrier: true, genotype: 'Aa' },
  { id: 'son', sex: 'male', generation: 2, carrier: true, genotype: 'Aa', parents: ['gp', 'gm'] },
  {
    id: 'daughter',
    sex: 'female',
    generation: 2,
    carrier: true,
    genotype: 'Aa',
    parents: ['gp', 'gm'],
  },
  { id: 'husband', sex: 'male', generation: 2, genotype: 'AA', partner: 'daughter' },
  { id: 'k1', sex: 'male', generation: 3, trait: true, genotype: 'aa', parents: ['son', 'wife'] },
  { id: 'k2', sex: 'female', generation: 3, genotype: 'AA', parents: ['son', 'wife'] },
  { id: 'k3', sex: 'male', generation: 3, carrier: true, genotype: 'Aa', parents: ['son', 'wife'] },
  {
    id: 'k4',
    sex: 'female',
    generation: 3,
    carrier: true,
    genotype: 'Aa',
    parents: ['daughter', 'husband'],
  },
  { id: 'k5', sex: 'male', generation: 3, genotype: 'AA', parents: ['daughter', 'husband'] },
];

export const SCIENCE_7_LAYOUTS: LayoutDef[] = [
  // ── Atoms, elements and molecules (MS-PS1-1) ──
  {
    kind: 'explore',
    id: 's.7.atoms-molecules',
    assumptions: [
      'Everything is made of atoms: about 100 kinds, one for each element.',
      'A molecule is two or more atoms joined together. Water is two hydrogen atoms joined to one oxygen atom.',
      'The colors are the classroom ones: hydrogen white, carbon black, oxygen red, nitrogen blue.',
      'Choose a substance to see its particles.',
    ],
    figure: { kind: 'molecules' },
    scenes: [
      {
        label: 'Water',
        lines: [
          'Two hydrogen atoms joined to one oxygen atom: H₂O.',
          'It is a compound: two kinds of atom in every molecule.',
        ],
        molecules: { items: [{ formula: 'H2O' }] },
      },
      {
        label: 'Carbon dioxide',
        lines: ['One carbon atom between two oxygen atoms: CO₂, the gas you breathe out.'],
        molecules: { items: [{ formula: 'CO2' }] },
      },
      {
        label: 'Oxygen',
        lines: ['Two oxygen atoms joined: an element, because every atom is the same kind.'],
        molecules: { items: [{ formula: 'O2' }] },
      },
      {
        label: 'Methane',
        lines: ['One carbon atom with four hydrogen atoms: the gas in a stove flame.'],
        molecules: { items: [{ formula: 'CH4' }] },
      },
      {
        label: 'Ammonia',
        lines: ['One nitrogen atom with three hydrogen atoms: the sharp smell in some cleaners.'],
        molecules: { items: [{ formula: 'NH3' }] },
      },
      {
        label: 'Iron',
        lines: ['A solid element: the same atom repeated in rows, no molecules.'],
        molecules: { items: [{ formula: 'Fe', count: 24 }], state: 'solid' },
      },
      {
        label: 'Table salt',
        lines: [
          'An extended structure: sodium and chlorine in a repeating pattern, not separate molecules.',
        ],
        molecules: { items: [{ formula: 'NaCl', count: 16 }], state: 'solid' },
      },
      {
        label: 'Air',
        lines: ['A mixture: different molecules side by side, not joined.'],
        molecules: {
          items: [
            { formula: 'N2', count: 8 },
            { formula: 'O2', count: 2 },
          ],
          state: 'gas',
        },
      },
      {
        label: 'Steam',
        lines: ['The same water molecules, far apart and moving fast.'],
        molecules: { items: [{ formula: 'H2O', count: 12 }], state: 'gas' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.7.atoms-molecules~element-or-compound',
    title: 'Element or compound?',
    use: 'Use this for “Which of these substances is an element?”',
    assumptions: [
      'An element is one kind of atom, alone or joined to itself.',
      'A compound is different kinds of atoms joined in a fixed pattern.',
    ],
    question: 'Element or compound?',
    bins: [
      { id: 'element', label: 'Element', why: 'Every atom in it is the same kind.' },
      { id: 'compound', label: 'Compound', why: 'It joins atoms of two or more kinds.' },
    ],
    cards: [
      { label: 'Oxygen', bin: 'element', figure: { kind: 'molecule', formula: 'O2' } },
      { label: 'Water', bin: 'compound', figure: { kind: 'molecule', formula: 'H2O' } },
      { label: 'Nitrogen', bin: 'element', figure: { kind: 'molecule', formula: 'N2' } },
      { label: 'Carbon dioxide', bin: 'compound', figure: { kind: 'molecule', formula: 'CO2' } },
      { label: 'Iron', bin: 'element', figure: { kind: 'molecule', formula: 'Fe' } },
      { label: 'Table salt', bin: 'compound', figure: { kind: 'molecule', formula: 'NaCl' } },
      { label: 'Copper', bin: 'element', figure: { kind: 'molecule', formula: 'Cu' } },
      { label: 'Methane', bin: 'compound', figure: { kind: 'molecule', formula: 'CH4' } },
      { label: 'Helium', bin: 'element', figure: { kind: 'molecule', formula: 'He' } },
      { label: 'Ammonia', bin: 'compound', figure: { kind: 'molecule', formula: 'NH3' } },
    ],
  },
  {
    kind: 'sort',
    id: 's.7.atoms-molecules~pure-or-mixture',
    title: 'Pure substance or mixture?',
    use: 'Use this for “Which of these is a mixture?”',
    assumptions: [
      'A pure substance has one kind of particle: one element or one compound.',
      'A mixture can be separated without a chemical reaction: filtering, evaporating, picking out.',
    ],
    question: 'One substance, or a mixture?',
    bins: [
      {
        id: 'pure',
        label: 'Pure substance',
        why: 'Every particle in it is the same, so it has one set of properties.',
      },
      {
        id: 'mixture',
        label: 'Mixture',
        why: 'Two or more substances side by side; each keeps its own properties.',
      },
    ],
    cards: [
      { label: 'Distilled water', bin: 'pure' },
      { label: 'Air', bin: 'mixture' },
      { label: 'Oxygen in a tank', bin: 'pure' },
      { label: 'Salt water', bin: 'mixture' },
      { label: 'Baking soda', bin: 'pure' },
      { label: 'A bath bomb', bin: 'mixture' },
      { label: 'Table salt', bin: 'pure' },
      { label: 'Soil', bin: 'mixture' },
      { label: 'Pure copper wire', bin: 'pure' },
      { label: 'Lemonade', bin: 'mixture' },
    ],
  },

  // ── States of matter and phase changes (MS-PS1-4) ──
  {
    kind: 'explore',
    id: 's.7.phase-changes',
    assumptions: [
      'The same particles are in every box. Only how close they are and how fast they move changes.',
      'Adding thermal energy makes particles move faster; taking it away slows them.',
      'The arrows over the boxes take in heat; the arrows under them give heat out.',
      'Choose a state or a change.',
    ],
    figure: { kind: 'phases' },
    scenes: [
      {
        label: 'Solid',
        lines: ['Particles packed in rows, each wiggling in place. Ice keeps its shape.'],
        phase: { state: 'solid', formula: 'H2O' },
      },
      {
        label: 'Liquid',
        lines: ['Particles touch but slide past each other. Water takes the shape of its cup.'],
        phase: { state: 'liquid', formula: 'H2O' },
      },
      {
        label: 'Gas',
        lines: ['Particles far apart, flying fast in every direction. Steam fills the room.'],
        phase: { state: 'gas', formula: 'H2O' },
      },
      {
        label: 'Melting',
        lines: ['Heat loosens the rows. Ice melts at 0 °C.'],
        phase: { state: 'liquid', change: 'melting', formula: 'H2O' },
      },
      {
        label: 'Boiling',
        lines: [
          'Particles all through the liquid break away as bubbles of gas. Water boils at 100 °C.',
        ],
        phase: { state: 'gas', change: 'boiling', formula: 'H2O' },
      },
      {
        label: 'Evaporation',
        lines: ['Particles leave the surface of a liquid below its boiling point: a puddle dries.'],
        phase: { state: 'gas', change: 'evaporation', formula: 'H2O' },
      },
      {
        label: 'Condensation',
        lines: ['Gas particles cool, slow and gather into drops: dew, or a mirror fogging up.'],
        phase: { state: 'liquid', change: 'condensation', formula: 'H2O' },
      },
      {
        label: 'Freezing',
        lines: ['Liquid particles slow and settle into rows.'],
        phase: { state: 'solid', change: 'freezing', formula: 'H2O' },
      },
      {
        label: 'Sublimation',
        lines: ['A solid turns straight into a gas, as dry ice does.'],
        phase: { state: 'gas', change: 'sublimation' },
      },
      {
        label: 'Deposition',
        lines: ['A gas turns straight into a solid: frost on a cold window.'],
        phase: { state: 'solid', change: 'deposition', formula: 'H2O' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.7.phase-changes~which-change',
    title: 'Name the change',
    use: 'Use this for “Which is an example of water condensing?”',
    assumptions: [
      'Ask what state the water was in before and after.',
      'Sweat forming is not a change of state: it comes out of the skin as liquid.',
    ],
    question: 'Which change is it?',
    bins: [
      { id: 'melting', label: 'Melting', why: 'Solid to liquid: heat taken in.' },
      { id: 'evaporation', label: 'Evaporation or boiling', why: 'Liquid to gas: heat taken in.' },
      { id: 'condensation', label: 'Condensation', why: 'Gas to liquid: heat given out.' },
      { id: 'freezing', label: 'Freezing', why: 'Liquid to solid: heat given out.' },
    ],
    cards: [
      { label: 'An ice cube shrinks in the sun', bin: 'melting' },
      { label: 'A puddle disappears on a hot afternoon', bin: 'evaporation' },
      { label: 'Dew forms on grass on a cold night', bin: 'condensation' },
      { label: 'A pond ices over', bin: 'freezing' },
      { label: 'A chocolate bar softens in a pocket', bin: 'melting' },
      { label: 'Steam rises from a boiling pot', bin: 'evaporation' },
      { label: 'A mirror clouds up when you breathe on it', bin: 'condensation' },
      { label: 'Water in a tray becomes ice cubes', bin: 'freezing' },
      { label: 'Wet clothes dry on a line', bin: 'evaporation' },
      { label: 'Drops form on a cold can', bin: 'condensation' },
    ],
  },
  {
    kind: 'sort',
    id: 's.7.phase-changes~heat-in-or-out',
    title: 'Heat in or heat out?',
    use: 'Use this for “Which change needs thermal energy to be added?”',
    assumptions: [
      'Warming and melting take energy in; cooling and freezing give it out.',
      'Evaporation cools your skin because the leaving particles take heat with them.',
    ],
    question: 'Does the change take in heat or give it out?',
    bins: [
      {
        id: 'in',
        label: 'Takes in heat',
        why: 'Particles need energy to break out of rows or away from the liquid.',
      },
      { id: 'out', label: 'Gives out heat', why: 'Particles slow down and settle closer.' },
    ],
    cards: [
      { label: 'Melting', bin: 'in' },
      { label: 'Freezing', bin: 'out' },
      { label: 'Boiling', bin: 'in' },
      { label: 'Condensation', bin: 'out' },
      { label: 'Evaporation', bin: 'in' },
      { label: 'Deposition', bin: 'out' },
      { label: 'Sublimation', bin: 'in' },
      { label: 'Hot soup cools on the table', bin: 'out' },
      { label: 'A cold drink warms in a room', bin: 'in' },
    ],
  },
  {
    kind: 'sort',
    id: 's.7.phase-changes~state-at-room-temperature',
    title: 'Solid, liquid or gas at room temperature?',
    use: 'Use this for “At 20 °C, is the substance a solid, a liquid or a gas?”',
    assumptions: [
      'Compare 20 °C with the melting and boiling points.',
      'Every substance has its own melting and boiling points: they help identify it.',
    ],
    question: 'Its state at 20 °C?',
    bins: [
      { id: 'solid', label: 'Solid', why: 'Room temperature is below its melting point.' },
      {
        id: 'liquid',
        label: 'Liquid',
        why: 'Room temperature is between its melting and boiling points.',
      },
      { id: 'gas', label: 'Gas', why: 'Room temperature is above its boiling point.' },
    ],
    cards: [
      { label: 'Iron: melts at 1,538 °C, boils at 2,862 °C', bin: 'solid' },
      { label: 'Water: melts at 0 °C, boils at 100 °C', bin: 'liquid' },
      { label: 'Oxygen: melts at −219 °C, boils at −183 °C', bin: 'gas' },
      { label: 'Table salt: melts at 801 °C, boils at 1,465 °C', bin: 'solid' },
      { label: 'Mercury: melts at −39 °C, boils at 357 °C', bin: 'liquid' },
      { label: 'Nitrogen: melts at −210 °C, boils at −196 °C', bin: 'gas' },
      { label: 'Candle wax: melts at about 60 °C', bin: 'solid' },
      { label: 'Ethanol: melts at −114 °C, boils at 78 °C', bin: 'liquid' },
      { label: 'Methane: melts at −182 °C, boils at −162 °C', bin: 'gas' },
    ],
  },
  {
    kind: 'observe',
    id: 's.7.phase-changes~evaporation',
    title: 'Water left in an open cup',
    use: 'Use this to record how much water is left in an open cup each day.',
    assumptions: [
      'Pour 200 mL into an open cup on a warm windowsill and read the level each day.',
      'A second cup in the refrigerator loses less: cooler particles leave the surface more slowly.',
      'No water is destroyed. It is in the air as water vapor.',
    ],
    columns: ['Day 0', 'Day 1', 'Day 2', 'Day 3', 'Day 4'],
    rowLabel: 'Water left',
    unit: 'mL',
    max: 250,
    step: 5,
    initial: [200, 185, 170, 150, 135],
    pattern: (v) => {
      const first = v[0]!;
      const last = v[v.length - 1]!;
      if (v.every((x, i) => i === 0 || x < v[i - 1]!))
        return `The water fell from ${first} mL to ${last} mL in 4 days. It evaporated: its particles left the surface as gas.`;
      if (v.every((x) => x === first))
        return 'The level did not change. Is the cup covered, or the room cold?';
      return 'The level should only fall. Read the mark at eye level and try again.';
    },
  },

  // ── Chemical reactions (MS-PS1-2, MS-PS1-6) ──
  {
    kind: 'sort',
    id: 's.7.chemical-reactions~chemical-or-physical',
    title: 'Chemical change or physical change?',
    use: 'Use this for “Is water changing into steam a chemical change?”',
    assumptions: [
      'Signs of a reaction: a gas that was not there, a color change, a temperature change, a solid appearing.',
      'A gas alone is not proof: boiling water gives a gas, but it is still water.',
    ],
    question: 'Did a new substance form?',
    bins: [
      {
        id: 'chemical',
        label: 'Chemical change: a new substance',
        why: 'Its properties are different from what you started with, and it does not change back on its own.',
      },
      {
        id: 'physical',
        label: 'Physical change: the same substance',
        why: 'Same particles, different shape, state or mixture.',
      },
    ],
    cards: [
      { label: 'Wood burns to ash and smoke', bin: 'chemical' },
      { label: 'Water boils into steam', bin: 'physical' },
      { label: 'An iron nail rusts', bin: 'chemical' },
      { label: 'Ice melts', bin: 'physical' },
      { label: 'Baking soda and vinegar fizz', bin: 'chemical' },
      { label: 'Sugar dissolves in tea', bin: 'physical' },
      { label: 'Bread dough rises and browns in the oven', bin: 'chemical' },
      { label: 'Paper is torn', bin: 'physical' },
      { label: 'A copper roof turns green', bin: 'chemical' },
      { label: 'Salt water evaporates and leaves salt', bin: 'physical' },
    ],
  },
  {
    kind: 'sort',
    id: 's.7.chemical-reactions~heat-in-or-out',
    title: 'Reactions that heat up or cool down',
    use: 'Use this for “Which reaction could warm a meal without a flame?”',
    assumptions: [
      'Feel the container: warmer means energy left the reaction, cooler means it went in.',
      'Designers choose the reaction and the amounts to reach the temperature they need.',
    ],
    question: 'Does it give out heat or take heat in?',
    bins: [
      {
        id: 'out',
        label: 'Gives out heat',
        why: 'The surroundings get warmer: a flameless heater, a hand warmer.',
      },
      {
        id: 'in',
        label: 'Takes in heat',
        why: 'The surroundings get colder: an instant cold pack.',
      },
    ],
    cards: [
      { label: 'Iron powder rusting fast in a hand warmer', bin: 'out' },
      { label: 'Baking soda mixed with vinegar', bin: 'in' },
      { label: 'Calcium chloride mixed with water', bin: 'out' },
      { label: 'Citric acid and baking soda in water', bin: 'in' },
      { label: 'Magnesium and salt water in a ration heater', bin: 'out' },
      { label: 'Ammonium nitrate dissolving in a cold pack', bin: 'in' },
      { label: 'A candle burning', bin: 'out' },
      { label: 'An ice pack you snap to start', bin: 'in' },
      { label: 'Cement setting', bin: 'out' },
    ],
  },

  // ── Photosynthesis and cellular respiration (MS-LS1-6, MS-LS1-7) ──
  {
    kind: 'explore',
    id: 's.7.photosynthesis-respiration',
    assumptions: [
      'Photosynthesis: a leaf uses light to make sugar and oxygen from carbon dioxide and water.',
      'Cellular respiration: a cell breaks sugar down with oxygen to release energy, giving off carbon dioxide and water.',
      'Arrows going in are what the process uses; arrows going out are what it makes.',
      'Plant cells do both. Animal cells only respire.',
    ],
    figure: { kind: 'leafCell' },
    scenes: [
      {
        label: 'Leaf: photosynthesis',
        lines: ['Carbon dioxide + water → sugar + oxygen, with energy from light.'],
        leafCell: { process: 'photosynthesis' },
      },
      {
        label: 'Leaf: light',
        lines: [
          'Light is the energy. Without it a leaf makes no sugar, so at night a plant lives on the sugar it stored.',
        ],
        leafCell: { process: 'photosynthesis', lit: 'light' },
      },
      {
        label: 'Leaf: carbon dioxide',
        lines: [
          'Carbon dioxide comes in through tiny holes in the leaf. Its carbon becomes the sugar.',
        ],
        leafCell: { process: 'photosynthesis', lit: 'carbon dioxide' },
      },
      {
        label: 'Leaf: water',
        lines: ['Water comes up from the roots.'],
        leafCell: { process: 'photosynthesis', lit: 'water' },
      },
      {
        label: 'Leaf: sugar',
        lines: [
          'Sugar is the plant’s food and building material. Most of a tree’s mass was carbon dioxide from the air.',
        ],
        leafCell: { process: 'photosynthesis', lit: 'sugar' },
      },
      {
        label: 'Leaf: oxygen',
        lines: ['Oxygen leaves through the same holes: the oxygen we breathe.'],
        leafCell: { process: 'photosynthesis', lit: 'oxygen' },
      },
      {
        label: 'Cell: respiration',
        lines: ['Sugar + oxygen → carbon dioxide + water, releasing energy.'],
        leafCell: { process: 'respiration' },
      },
      {
        label: 'Cell: energy',
        lines: ['The energy moves muscles, keeps you warm and builds new cells.'],
        leafCell: { process: 'respiration', lit: 'energy' },
      },
      {
        label: 'Both',
        lines: ['What the leaf makes, the cell uses; what the cell gives off, the leaf takes in.'],
        leafCell: { process: 'both' },
      },
      {
        label: 'Both: oxygen',
        lines: [
          'A sealed jar with a plant in the light keeps its oxygen. A mouse alone in it would use the oxygen up.',
        ],
        leafCell: { process: 'both', lit: 'oxygen' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.7.photosynthesis-respiration~who-does-it',
    title: 'Who photosynthesizes, and who respires?',
    use: 'Use this for “Why can a plant live in a sealed jar when a mouse cannot?”',
    assumptions: [
      'Every living thing respires, all the time.',
      'Only plants, algae and some bacteria photosynthesize, and only in the light.',
    ],
    question: 'Which does it do?',
    bins: [
      {
        id: 'both',
        label: 'Photosynthesis and respiration',
        why: 'It has chloroplasts, so it makes sugar in the light, and it respires day and night.',
      },
      {
        id: 'respire',
        label: 'Respiration only',
        why: 'It gets sugar by eating and breaks it down with oxygen.',
      },
    ],
    cards: [
      { label: 'Oak tree', bin: 'both' },
      { label: 'Mouse', bin: 'respire' },
      { label: 'Grass', bin: 'both' },
      { label: 'Human', bin: 'respire' },
      { label: 'Pond algae', bin: 'both' },
      { label: 'Mushroom', bin: 'respire' },
      { label: 'Moss', bin: 'both' },
      { label: 'Goldfish', bin: 'respire' },
      { label: 'Elodea water plant', bin: 'both' },
      { label: 'Yeast', bin: 'respire' },
    ],
  },
  {
    kind: 'sequence',
    id: 's.7.photosynthesis-respiration~food-to-energy',
    title: 'From a meal to energy in a cell',
    use: 'Use this for “Put in order what happens to the food you eat.”',
    assumptions: [
      'Digestion is chemical: large food molecules are broken into small ones the blood can carry.',
      'A body that cannot absorb food loses mass, because its cells keep respiring stored fat.',
    ],
    question: 'Put the steps in order, from eating to energy.',
    stages: [
      { label: 'Food is chewed and swallowed' },
      { label: 'The stomach and small intestine break it into small molecules such as sugar' },
      { label: 'The small molecules pass into the blood through the intestine wall' },
      { label: 'The blood carries sugar and oxygen to every cell' },
      { label: 'Cells break sugar down with oxygen and release energy' },
      { label: 'Carbon dioxide and water leave through the lungs and skin' },
    ],
  },
  {
    kind: 'observe',
    id: 's.7.photosynthesis-respiration~elodea-bubbles',
    title: 'Oxygen bubbles from a water plant',
    use: 'Use this to record how many bubbles a water plant gives off each minute at each lamp distance.',
    assumptions: [
      'Put a sprig of Elodea under water in a beaker with a lamp beside it. Keep the lamp away from the water.',
      'The bubbles are oxygen from photosynthesis.',
      'Count for one minute at each distance, then with the lamp off.',
    ],
    columns: ['Lamp at 10 cm', '20 cm', '30 cm', '40 cm', 'Dark'],
    rowLabel: 'Bubbles in a minute',
    unit: 'bubbles',
    max: 60,
    step: 1,
    initial: [32, 20, 12, 7, 0],
    pattern: (v) => {
      const first = v[0]!;
      const last = v[v.length - 1]!;
      const falling = v.every((x, i) => i === 0 || x <= v[i - 1]!);
      if (falling && last === 0 && first > 0)
        return `The plant made ${first} bubbles a minute close to the lamp and none in the dark. More light, more photosynthesis, more oxygen.`;
      if (last > first)
        return 'More bubbles far from the lamp? Check the lamp is the only light and count for a full minute.';
      return 'Bubbles fell with distance but did not stop in the dark. Give the plant a few minutes in the dark, then count again.';
    },
  },
  {
    kind: 'sort',
    id: 's.7.photosynthesis-respiration~in-or-out',
    title: 'What goes in and what comes out',
    use: 'Use this for “Which substance is required for cellular respiration?”',
    assumptions: [
      'The two processes are opposites: one’s outputs are the other’s inputs.',
      'Energy goes in as light and comes out as usable energy in cells.',
    ],
    question: 'Where does it belong?',
    bins: [
      { id: 'photoIn', label: 'Photosynthesis uses', why: 'Taken in by the leaf.' },
      { id: 'photoOut', label: 'Photosynthesis makes', why: 'Given off by the leaf.' },
      { id: 'respIn', label: 'Respiration uses', why: 'Taken in by the cell.' },
      { id: 'respOut', label: 'Respiration makes', why: 'Given off by the cell.' },
    ],
    cards: [
      { label: 'Light energy reaching a leaf', bin: 'photoIn' },
      { label: 'Oxygen leaving a leaf', bin: 'photoOut' },
      { label: 'Sugar entering a muscle cell', bin: 'respIn' },
      { label: 'Carbon dioxide breathed out', bin: 'respOut' },
      { label: 'Carbon dioxide entering a leaf', bin: 'photoIn' },
      { label: 'Sugar made in a leaf', bin: 'photoOut' },
      { label: 'Oxygen entering a muscle cell', bin: 'respIn' },
      { label: 'Energy released in a cell', bin: 'respOut' },
      { label: 'Water reaching a leaf from the roots', bin: 'photoIn' },
      { label: 'Water made in a cell', bin: 'respOut' },
    ],
  },

  // ── Energy flow and matter cycling in ecosystems (MS-LS2-1 to MS-LS2-4) ──
  {
    kind: 'explore',
    id: 's.7.ecosystem-energy~carbon-cycle',
    title: 'The carbon cycle',
    use: 'Use this for “How does carbon get from the air into an animal, and back?”',
    assumptions: [
      'Every arrow is carbon moving from one place to another. The same atoms go round and round.',
      'Photosynthesis takes carbon out of the air; respiration, decomposition and burning put it back.',
      'The dashed arrow takes millions of years.',
    ],
    figure: { kind: 'carbonCycle' },
    scenes: [
      {
        label: 'Whole cycle',
        lines: [
          'Carbon is in the air as carbon dioxide, in living things as sugar and other molecules, in dead matter, in the ocean and in coal and oil.',
        ],
        carbon: {},
      },
      {
        label: 'Photosynthesis',
        lines: ['Plants take carbon dioxide out of the air and build it into sugar.'],
        carbon: { process: 'photosynthesis' },
      },
      {
        label: 'Eating',
        lines: ['Animals get carbon by eating plants or other animals.'],
        carbon: { process: 'eating' },
      },
      {
        label: 'Respiration',
        lines: ['Plants and animals give carbon dioxide back to the air as they respire.'],
        carbon: { process: 'respiration' },
      },
      {
        label: 'Death',
        lines: ['Dead plants, animals and waste hold carbon.'],
        carbon: { process: 'death' },
      },
      {
        label: 'Decomposition',
        lines: [
          'Decomposers (fungi, bacteria) break dead matter down and release carbon dioxide and nutrients.',
        ],
        carbon: { process: 'decomposition' },
      },
      {
        label: 'Burial',
        lines: ['Buried dead matter slowly becomes coal and oil, over millions of years.'],
        carbon: { process: 'burial' },
      },
      {
        label: 'Burning',
        lines: ['Burning coal and oil returns old carbon to the air quickly.'],
        carbon: { process: 'burning' },
      },
      {
        label: 'Dissolving',
        lines: ['The ocean takes in carbon dioxide and gives some back.'],
        carbon: { process: 'dissolving' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.7.ecosystem-energy~roles',
    title: 'Producer, consumer or decomposer?',
    use: 'Use this for “Which organisms in the food web are primary consumers?”',
    assumptions: [
      'Arrows in a food web point from the eaten to the eater: the way energy goes.',
      'Decomposers make nutrients available to plants again.',
    ],
    question: 'Its role in the ecosystem?',
    bins: [
      { id: 'producer', label: 'Producer', why: 'Makes its own food by photosynthesis.' },
      { id: 'primary', label: 'Primary consumer', why: 'Eats producers.' },
      { id: 'secondary', label: 'Secondary or top consumer', why: 'Eats other consumers.' },
      {
        id: 'decomposer',
        label: 'Decomposer',
        why: 'Breaks down dead matter and returns nutrients to the soil and water.',
      },
    ],
    cards: [
      { label: 'Pond algae', bin: 'producer' },
      { label: 'Rabbit', bin: 'primary' },
      { label: 'Frog eating insects', bin: 'secondary' },
      { label: 'Mushroom on a log', bin: 'decomposer' },
      { label: 'Oak tree', bin: 'producer' },
      { label: 'Grasshopper', bin: 'primary' },
      { label: 'Heron eating fish', bin: 'secondary' },
      { label: 'Bacteria in pond mud', bin: 'decomposer' },
      { label: 'Grass', bin: 'producer' },
      { label: 'Caterpillar', bin: 'primary' },
      { label: 'Fox eating rabbits', bin: 'secondary' },
      { label: 'Earthworm in dead leaves', bin: 'decomposer' },
      { label: 'Water flea eating algae', bin: 'primary' },
      { label: 'Hawk', bin: 'secondary' },
    ],
  },
  {
    kind: 'explore',
    id: 's.7.ecosystem-energy~remove-one',
    title: 'Take one out of the food web',
    use: 'Use this for “What happens to the fox population if the rabbits disappear?”',
    assumptions: [
      'Each arrow means “is eaten by”.',
      'Take one member away and follow the arrows: what loses food shrinks, what loses a predator grows.',
      'Real webs have many paths, so effects are smaller than in a single chain.',
    ],
    figure: { kind: 'foodWeb' },
    scenes: [
      {
        label: 'The web',
        lines: ['Every arrow is energy passing from the eaten to the eater.'],
        web: {},
      },
      {
        label: 'One chain',
        lines: ['Energy from the sun goes into the grass, then to whatever eats it.'],
        web: { chain: ['sun', 'grass', 'rabbit', 'snake', 'hawk'] },
      },
      {
        label: 'No snakes',
        lines: [
          'Mice and frogs lose a predator and grow. Hawks lose one food and shrink, unless they eat more mice.',
        ],
        web: { removed: 'snake', more: ['mouse', 'frog'], fewer: ['hawk'] },
      },
      {
        label: 'No grass',
        lines: ['Without the producer every level shrinks: a drought or fire does this.'],
        web: {
          removed: 'grass',
          fewer: ['rabbit', 'grasshopper', 'mouse', 'frog', 'snake', 'hawk'],
        },
      },
      {
        label: 'No hawks',
        lines: ['Snakes and mice grow at first. Then the snakes eat down the mice.'],
        web: { removed: 'hawk', more: ['snake', 'mouse'] },
      },
    ],
  },
  {
    kind: 'sequence',
    id: 's.7.ecosystem-energy~up-the-chain',
    title: 'A pesticide up the food chain',
    use: 'Use this for “Which animal ends up with the most pesticide in its body?”',
    assumptions: [
      'A pesticide that is not broken down stays in an animal’s body.',
      'Each eater takes in everything its many meals carried, so the amount grows at each level: bioaccumulation.',
      'The top predator ends up with the most, even though it was sprayed on nobody.',
    ],
    question: 'Order the pond organisms from least to most pesticide in each body.',
    stages: [
      { label: 'Algae take in a trace from the water' },
      { label: 'Water insects eat many algae' },
      { label: 'Small fish eat many insects' },
      { label: 'Large fish eat many small fish' },
      { label: 'A heron eats many large fish' },
    ],
  },
  {
    kind: 'sort',
    id: 's.7.ecosystem-energy~more-or-fewer',
    title: 'Will the population grow or shrink?',
    use: 'Use this for “How would planting fruit trees affect the orangutan population?”',
    assumptions: [
      'A population grows while it has more than it needs and shrinks when something it needs runs short.',
      'Space counts too: a forest holds only so many orangutans, however much fruit there is.',
    ],
    question: 'What happens to the population named?',
    bins: [
      {
        id: 'grow',
        label: 'Grows',
        why: 'More food, water, space or shelter, or fewer predators or competitors.',
      },
      {
        id: 'shrink',
        label: 'Shrinks',
        why: 'Less of what it needs, or more that eats or competes with it.',
      },
    ],
    cards: [
      { label: 'Orangutans, after rainforest fruit trees are planted', bin: 'grow' },
      { label: 'Orangutans, after forest is cleared for oil palms', bin: 'shrink' },
      { label: 'Deer, after a wet year grows more grass', bin: 'grow' },
      { label: 'Frogs, after a drought dries the pond', bin: 'shrink' },
      {
        label: 'Bacteria in pond mud, after fertilizer makes more algae grow and die',
        bin: 'grow',
      },
      { label: 'Native fish, after a new fish arrives that eats the same insects', bin: 'shrink' },
      { label: 'Rabbits, after the foxes are hunted out', bin: 'grow' },
      { label: 'Willow flycatchers, after a beetle kills the trees they nest in', bin: 'shrink' },
    ],
  },

  // ── Genes, alleles and Punnett squares (MS-LS3-2) ──
  {
    kind: 'explore',
    id: 's.7.punnett-squares~pedigree',
    title: 'Reading a pedigree',
    use: 'Use this for “Neither parent shows the trait but a child does. What are the parents’ genotypes?”',
    assumptions: [
      'Squares are males, circles females. A filled symbol shows the trait.',
      'A line joins parents; their children hang below, oldest on the left.',
      'The trait comes from a recessive allele a: only aa shows it.',
    ],
    figure: { kind: 'pedigree', people: PEDIGREE_PEOPLE },
    scenes: [
      { label: 'The family', lines: ['Three generations, numbered I, II and III.'], family: {} },
      {
        label: 'Who shows it',
        lines: ['Two people show the trait: a grandmother and a grandson.'],
        family: { lit: ['gm', 'k1'] },
      },
      {
        label: 'The puzzle',
        lines: [
          'III-1 is aa, so each parent gave him an a. Neither shows the trait, so both must be Aa: carriers.',
        ],
        family: { lit: ['son', 'wife'], ask: 'son' },
      },
      {
        label: 'Carriers',
        lines: ['Half-filled symbols carry one a. They look like anyone else.'],
        family: { carriers: true },
      },
      {
        label: 'All genotypes',
        lines: ['Check each child against its parents’ alleles.'],
        family: { carriers: true, genotypes: true },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.7.punnett-squares~one-parent-or-two',
    title: 'Asexual or sexual reproduction?',
    use: 'Use this for “What is the advantage of asexual reproduction?”',
    assumptions: [
      'Asexual: fast, needs no partner, but all offspring share the parent’s weaknesses.',
      'Sexual: offspring differ, so some may survive a change the parent could not.',
    ],
    question: 'How many parents, and do the offspring vary?',
    bins: [
      {
        id: 'asexual',
        label: 'One parent, identical offspring',
        why: 'The offspring get a copy of the one parent’s genes.',
      },
      {
        id: 'sexual',
        label: 'Two parents, offspring vary',
        why: 'Each offspring gets half its genes from each parent, in a new combination.',
      },
    ],
    cards: [
      { label: 'A strawberry plant sends out runners', bin: 'asexual' },
      { label: 'A redwood grows from a seed', bin: 'sexual' },
      { label: 'A bacterium splits in two', bin: 'asexual' },
      { label: 'Kittens in one litter', bin: 'sexual' },
      { label: 'A hydra grows a bud that drops off', bin: 'asexual' },
      { label: 'Cattle bred on a farm', bin: 'sexual' },
      { label: 'A potato sprouts from an eye', bin: 'asexual' },
      { label: 'Orchid seeds from a pollinated flower', bin: 'sexual' },
      { label: 'A starfish regrows from an arm', bin: 'asexual' },
      { label: 'Human siblings', bin: 'sexual' },
    ],
  },

  // ── Natural selection (MS-LS4-4, MS-LS4-5) ──
  {
    kind: 'sort',
    id: 's.7.natural-selection~natural-or-artificial',
    title: 'Natural selection or artificial selection?',
    use: 'Use this for “How do farmers control the variation in their animals?”',
    assumptions: [
      'Both change a population over generations by choosing who breeds. Only the chooser differs.',
      'Artificial selection is thousands of years old: every crop and farm animal came from it.',
    ],
    question: 'Who or what does the selecting?',
    bins: [
      {
        id: 'natural',
        label: 'Natural selection',
        why: 'The environment: predators, food, climate or disease decide who survives to breed.',
      },
      {
        id: 'artificial',
        label: 'Artificial selection',
        why: 'People choose which individuals breed.',
      },
    ],
    cards: [
      { label: 'Brown beetles survive birds on brown bark', bin: 'natural' },
      { label: 'A farmer breeds only the cattle with the biggest muscles', bin: 'artificial' },
      { label: 'Bacteria that resist an antibiotic are the ones left', bin: 'natural' },
      { label: 'Dog breeders pick the smallest puppies to breed', bin: 'artificial' },
      { label: 'Moths darker than soot-blackened trees are eaten less', bin: 'natural' },
      { label: 'Farmers save seed from the sweetest corn', bin: 'artificial' },
      { label: 'Lizards with bigger toe pads hold on in hurricanes', bin: 'natural' },
      { label: 'Pigeon keepers pair fancy-tailed birds', bin: 'artificial' },
      { label: 'Finches with strong beaks survive a drought of hard seeds', bin: 'natural' },
    ],
  },
  {
    kind: 'sequence',
    id: 's.7.natural-selection~how-it-works',
    title: 'How natural selection works',
    use: 'Use this for “Put the steps of natural selection in order.”',
    assumptions: [
      'Selection acts on variation that already exists. It does not create the trait when it is needed.',
      'The change is in the population’s proportions, not in any one animal.',
    ],
    question: 'Put the steps in order.',
    stages: [
      { label: 'Individuals in a population vary, and the variation is inherited' },
      {
        label:
          'The environment favors some variants: they find food, escape predators or resist disease better',
      },
      { label: 'Those individuals survive longer and have more offspring' },
      { label: 'The offspring inherit the favored trait' },
      { label: 'Over many generations the favored trait becomes common' },
    ],
  },
  {
    kind: 'sort',
    id: 's.7.natural-selection~fits-or-not',
    title: 'Does it fit natural selection?',
    use: 'Use this for “Which statement is most consistent with the theory of evolution by natural selection?”',
    assumptions: [
      'Natural selection needs inherited variation, differences in survival and breeding, and many generations.',
      'Animals do not change themselves, and change does not happen in one individual’s lifetime.',
    ],
    question: 'Does the statement fit the theory?',
    bins: [
      {
        id: 'fits',
        label: 'Fits natural selection',
        why: 'Inherited variation, differences in survival and breeding, change over generations.',
      },
      {
        id: 'not',
        label: 'Does not fit',
        why: 'Animals do not change themselves, and change does not happen in one individual’s lifetime.',
      },
    ],
    cards: [
      {
        label: 'Parents pass traits to offspring; offspring with helpful traits breed more',
        bin: 'fits',
      },
      {
        label: 'Giraffes stretched their necks, so their calves were born with longer necks',
        bin: 'not',
      },
      { label: 'A population changes over many generations', bin: 'fits' },
      { label: 'An animal changes its traits when it needs to survive', bin: 'not' },
      {
        label: 'A trait that helped once can become harmful if the environment changes',
        bin: 'fits',
      },
      { label: 'Living things have not changed for hundreds of millions of years', bin: 'not' },
      { label: 'Variation within a population is the raw material', bin: 'fits' },
      { label: 'Every individual in a species is the same', bin: 'not' },
    ],
  },
];
