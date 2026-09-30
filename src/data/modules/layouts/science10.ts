/**
 * Grade 10 science layout pages (explore, sort, sequence, observe), by skill in taxonomy order.
 * The calculators are in `../science/10.ts`. Data only: no UI code.
 */
import type { CardFigure, CardIcon, LayoutDef } from './types';

/** A ball-and-stick card figure from a formula ("H2O", or one atom: "Fe"). */
const molecule = (formula: string): CardFigure => ({ kind: 'molecule', formula });

export const SCIENCE_10_LAYOUTS: LayoutDef[] = [
  // ── Atomic structure and isotopes (HS-PS1-1) ──
  {
    kind: 'sequence',
    id: 's.10.atomic-structure~models',
    title: 'Models of the atom, in order',
    use: 'Use this for “How did the model of the atom change, and what evidence changed it?”',
    assumptions: [
      'Each span is how many years the model stood before the next one replaced it.',
      'A new model came from new evidence: the electron, the gold-foil experiment, the lines in hydrogen’s spectrum.',
      'Bohr’s model is like the Solar System: a heavy center with electrons going around it.',
      'Unlike planets, electrons can only be on certain levels, and they jump between them.',
    ],
    question: 'Put the models of the atom in the order they were proposed.',
    stages: [
      { label: 'Dalton (1803): atoms are solid spheres that can’t be split', span: 94 },
      {
        label: 'Thomson (1897): electrons found, stuck in a positive ball like plums in a pudding',
        span: 14,
      },
      {
        label: 'Rutherford (1911): gold foil shows a tiny, dense, positive nucleus',
        span: 2,
      },
      { label: 'Bohr (1913): electrons on fixed energy levels around the nucleus', span: 13 },
      { label: 'Quantum model (1926): electrons in clouds of probability, still used today' },
    ],
    unit: 'years',
    totalLabel: 'From Dalton to the quantum model',
  },

  // ── The periodic table and periodic trends (HS-PS1-1, HS-PS1-2) ──
  {
    kind: 'sort',
    id: 's.10.periodic-trends~families',
    title: 'Families of the periodic table',
    use: 'Use this for “Which family is potassium in, and what does it share with sodium?”',
    assumptions: [
      'Elements in a group share their number of valence electrons, so they react alike.',
      'The alkali metals are group 1 and the alkaline earth metals group 2; the halogens are group 17 and the noble gases group 18.',
    ],
    question: 'Which family is the element in?',
    bins: [
      {
        id: 'alkali',
        label: 'Alkali metals',
        why: 'One valence electron, lost easily: soft metals that react hard with water.',
      },
      {
        id: 'earth',
        label: 'Alkaline earth metals',
        why: 'Two valence electrons, lost to make 2+ ions.',
      },
      {
        id: 'transition',
        label: 'Transition metals',
        why: 'The middle block, filling d subshells: hard, shiny metals, many with colored compounds.',
      },
      {
        id: 'halogen',
        label: 'Halogens',
        why: 'Seven valence electrons, one short of an octet: they grab one to make 1− ions.',
      },
      {
        id: 'noble',
        label: 'Noble gases',
        why: 'A full outer shell, so they hardly react at all.',
      },
    ],
    cards: (
      [
        ['Li', 'lithium', 'alkali'],
        ['K', 'potassium', 'alkali'],
        ['Cs', 'cesium', 'alkali'],
        ['Mg', 'magnesium', 'earth'],
        ['Ca', 'calcium', 'earth'],
        ['Ba', 'barium', 'earth'],
        ['Fe', 'iron', 'transition'],
        ['Cu', 'copper', 'transition'],
        ['Zn', 'zinc', 'transition'],
        ['F', 'fluorine', 'halogen'],
        ['Cl', 'chlorine', 'halogen'],
        ['I', 'iodine', 'halogen'],
        ['Ne', 'neon', 'noble'],
        ['Ar', 'argon', 'noble'],
        ['Kr', 'krypton', 'noble'],
      ] as const
    ).map(([symbol, name, bin]) => ({
      label: `${symbol} (${name})`,
      bin,
      figure: molecule(symbol),
    })),
  },

  // ── Ionic, covalent and metallic bonding (HS-PS1-1, HS-PS1-2, HS-PS1-3) ──
  {
    kind: 'sort',
    id: 's.10.bonding~properties',
    title: 'Properties of ionic, molecular and metallic substances',
    use: 'Use this for “Which observation shows that a solid is an ionic compound?”',
    assumptions: [
      'How a substance behaves comes from how its particles are held together.',
      'Conducting needs charges that can move: free electrons, or ions let loose by melting or dissolving.',
    ],
    question: 'Which kind of substance behaves this way?',
    bins: [
      {
        id: 'ionic',
        label: 'Ionic compound',
        why: 'Ions locked in a lattice: they only carry current once melting or dissolving frees them.',
      },
      {
        id: 'molecular',
        label: 'Molecular compound',
        why: 'Separate neutral molecules, held to each other only weakly.',
      },
      {
        id: 'metal',
        label: 'Metal',
        why: 'Positive ions in a sea of moving electrons.',
      },
    ],
    cards: [
      { label: 'Conducts when melted or dissolved, not as a solid', bin: 'ionic' },
      { label: 'Shatters along flat faces when struck', bin: 'ionic' },
      { label: 'Ions held in a repeating lattice', bin: 'ionic' },
      { label: 'Does not conduct as a solid or when melted', bin: 'molecular' },
      { label: 'Many are gases or liquids at room temperature', bin: 'molecular' },
      { label: 'Made of separate molecules', bin: 'molecular' },
      { label: 'Conducts as a solid', bin: 'metal' },
      { label: 'Hammers into thin sheets', bin: 'metal' },
      { label: 'Ions in a sea of moving electrons', bin: 'metal' },
    ],
  },
  {
    kind: 'sort',
    id: 's.10.bonding~bond-type',
    title: 'Ionic, covalent or metallic?',
    use: 'Use this for “What kind of bond holds magnesium oxide together?”',
    assumptions: [
      'A metal with a nonmetal bonds ionically; nonmetals share; metals pool their electrons.',
      'Metals are on the left of the staircase line, nonmetals on the right.',
    ],
    question: 'Which kind of bond holds the substance together?',
    bins: [
      { id: 'ionic', label: 'Ionic', why: 'A metal gives electrons to a nonmetal.' },
      { id: 'covalent', label: 'Covalent', why: 'Nonmetal atoms share pairs of electrons.' },
      { id: 'metallic', label: 'Metallic', why: 'Metal atoms pool their valence electrons.' },
    ],
    cards: (
      [
        ['NaCl', 'NaCl', 'ionic'],
        ['MgO', 'MgO', 'ionic'],
        ['KBr', 'KBr', 'ionic'],
        ['H₂O', 'H2O', 'covalent'],
        ['CO₂', 'CO2', 'covalent'],
        ['CH₄', 'CH4', 'covalent'],
        ['Cl₂', 'Cl2', 'covalent'],
        ['Cu', 'Cu', 'metallic'],
        ['Al', 'Al', 'metallic'],
        ['Fe', 'Fe', 'metallic'],
      ] as const
    ).map(([label, formula, bin]) => ({ label, bin, figure: molecule(formula) })),
  },

  // ── Molecular shape, polarity and intermolecular forces (HS-PS1-3, HS-PS2-6) ──
  {
    kind: 'sort',
    id: 's.10.molecular-shape~polarity',
    title: 'Polar or nonpolar molecule?',
    use: 'Use this for “Is carbon tetrachloride polar, even though its bonds are?”',
    assumptions: [
      'Polar bonds in a symmetric shape cancel.',
      'A lone pair on the central atom, or different outer atoms, usually leaves a net dipole.',
    ],
    question: 'Is the molecule polar?',
    bins: [
      {
        id: 'polar',
        label: 'Polar',
        why: 'The bond dipoles don’t cancel: one end is partly negative.',
      },
      {
        id: 'nonpolar',
        label: 'Nonpolar',
        why: 'The shape is symmetric, so the bond dipoles cancel.',
      },
    ],
    cards: [
      { label: 'H₂O (bent)', bin: 'polar', figure: molecule('H2O') },
      { label: 'NH₃ (trigonal pyramidal)', bin: 'polar', figure: molecule('NH3') },
      { label: 'HCl', bin: 'polar', figure: molecule('HCl') },
      { label: 'CHCl₃ (tetrahedral, one H)', bin: 'polar' },
      { label: 'CO₂ (linear)', bin: 'nonpolar', figure: molecule('CO2') },
      { label: 'CH₄ (tetrahedral)', bin: 'nonpolar', figure: molecule('CH4') },
      { label: 'BF₃ (trigonal planar)', bin: 'nonpolar' },
      { label: 'CCl₄ (tetrahedral)', bin: 'nonpolar' },
    ],
  },
  {
    kind: 'sort',
    id: 's.10.molecular-shape~imf',
    title: 'The strongest attraction between molecules',
    use: 'Use this for “Which liquid evaporates faster, and which has the higher boiling point?”',
    assumptions: [
      'Every molecule has London dispersion forces; polar ones add dipole–dipole attractions.',
      'Hydrogen bonding needs H bonded to N, O or F.',
      'Stronger attractions mean a higher boiling point and slower evaporation.',
    ],
    question: 'What is the strongest attraction between these molecules?',
    bins: [
      {
        id: 'dispersion',
        label: 'London dispersion',
        why: 'Nonpolar molecules attract only through brief, shifting dipoles.',
      },
      {
        id: 'dipole',
        label: 'Dipole–dipole',
        why: 'Polar molecules line up, the partly positive end toward the partly negative end.',
      },
      {
        id: 'hbond',
        label: 'Hydrogen bonding',
        why: 'An H on N, O or F is pulled strongly to a lone pair on another molecule.',
      },
    ],
    cards: [
      { label: 'CH₄', bin: 'dispersion', figure: molecule('CH4') },
      { label: 'N₂', bin: 'dispersion', figure: molecule('N2') },
      { label: 'CO₂', bin: 'dispersion', figure: molecule('CO2') },
      { label: 'HCl', bin: 'dipole', figure: molecule('HCl') },
      { label: 'H₂S', bin: 'dipole', figure: molecule('H2S') },
      { label: 'CH₂O (formaldehyde)', bin: 'dipole' },
      { label: 'H₂O', bin: 'hbond', figure: molecule('H2O') },
      { label: 'NH₃', bin: 'hbond', figure: molecule('NH3') },
      { label: 'HF', bin: 'hbond', figure: molecule('HF') },
      { label: 'CH₃OH (methanol)', bin: 'hbond', figure: molecule('CH3OH') },
    ],
  },
  {
    kind: 'explore',
    id: 's.10.molecular-shape~water',
    title: 'Why ice floats',
    use: 'Use this for “Why does ice float on liquid water?”',
    assumptions: [
      'Water is bent and polar: its O is partly negative and its H atoms partly positive.',
      'A hydrogen bond is an attraction between molecules, much weaker than a covalent bond.',
    ],
    figure: { kind: 'molecules' },
    scenes: [
      {
        label: 'One water molecule',
        molecules: { items: [{ formula: 'H2O' }] },
        lines: [
          'The oxygen pulls the shared electrons harder than the hydrogens do.',
          'The two lone pairs bend the molecule, so its charges don’t cancel.',
        ],
      },
      {
        label: 'Ice',
        molecules: { items: [{ formula: 'H2O', count: 12 }], state: 'solid' },
        lines: [
          'In ice each molecule is hydrogen-bonded to four others in open hexagons.',
          'The open rings hold the molecules farther apart than in the liquid.',
        ],
      },
      {
        label: 'Liquid water',
        molecules: {
          items: [{ formula: 'H2O', count: 12 }],
          state: 'solid',
          after: [{ formula: 'H2O', count: 12 }],
          afterState: 'liquid',
        },
        lines: [
          'When ice melts, hydrogen bonds break and re-form, and the rings collapse.',
          'The molecules pack closer, so liquid water is denser: ice floats on it.',
        ],
      },
    ],
  },

  // ── Chemical equations: balancing and types of reactions (HS-PS1-2, HS-PS1-7) ──
  {
    kind: 'sort',
    id: 's.10.reaction-types',
    assumptions: [
      'Tap a card, then a group.',
      'Each colored ball is an atom; balls side by side are bonded.',
      'The pattern of what joins, splits or swaps names the type.',
    ],
    question: 'Do the reactants join, split, swap partners or burn?',
    bins: [
      { id: 'synthesis', label: 'Synthesis', why: 'Two or more substances join into one.' },
      { id: 'decomposition', label: 'Decomposition', why: 'One substance splits into several.' },
      {
        id: 'single',
        label: 'Single replacement',
        why: 'An element takes the place of another in a compound.',
      },
      {
        id: 'double',
        label: 'Double replacement',
        why: 'Two compounds swap partners.',
      },
      {
        id: 'combustion',
        label: 'Combustion',
        why: 'A fuel reacts with oxygen, making carbon dioxide and water.',
      },
    ],
    cards: [
      ...(
        [
          ['A + B → AB', 'synthesis', 'synthesis reaction'],
          ['AB → A + B', 'decomposition', 'decomposition reaction'],
          ['A + BC → AC + B', 'single', 'single replacement reaction'],
          ['AB + CD → AD + CB', 'double', 'double replacement reaction'],
          ['CH₄ + 2O₂ → CO₂ + 2H₂O', 'combustion', 'combustion reaction'],
        ] as const
      ).map(([label, bin, icon]) => ({
        label,
        bin,
        figure: { kind: 'icon' as const, icon: icon as CardIcon },
      })),
      { label: '2Mg + O₂ → 2MgO', bin: 'synthesis' },
      { label: '2H₂O₂ → 2H₂O + O₂', bin: 'decomposition' },
      { label: 'Fe + CuSO₄ → FeSO₄ + Cu', bin: 'single' },
      { label: 'AgNO₃ + NaCl → AgCl + NaNO₃', bin: 'double' },
      { label: 'C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O', bin: 'combustion' },
    ],
  },

  // ── Reaction rates and chemical equilibrium (HS-PS1-5, HS-PS1-6) ──
  {
    kind: 'sort',
    id: 's.10.rates-equilibrium~shift',
    title: 'Which way does the equilibrium shift?',
    use: 'Use this for “N₂ + 3H₂ ⇌ 2NH₃ gives off heat. Which way does it shift when it is cooled?”',
    assumptions: [
      'The reaction is N₂ + 3H₂ ⇌ 2NH₃, and the forward reaction gives off heat (ΔH < 0).',
      'A system at equilibrium shifts to undo a change (Le Châtelier’s principle).',
      'Squeezing favors the side with fewer gas molecules: 2 on the right, 4 on the left.',
    ],
    question: 'Which way does the equilibrium shift?',
    bins: [
      {
        id: 'products',
        label: 'Toward the products (more NH₃)',
        why: 'The change is undone by making more ammonia.',
      },
      {
        id: 'reactants',
        label: 'Toward the reactants (more N₂ and H₂)',
        why: 'The change is undone by breaking ammonia back down.',
      },
      {
        id: 'none',
        label: 'No shift',
        why: 'Nothing in Q or K changes, so the amounts stay put.',
      },
    ],
    cards: [
      { label: 'Add N₂', bin: 'products' },
      { label: 'Remove NH₃', bin: 'products' },
      { label: 'Cool it', bin: 'products' },
      { label: 'Squeeze it to a smaller volume', bin: 'products' },
      { label: 'Remove H₂', bin: 'reactants' },
      { label: 'Heat it', bin: 'reactants' },
      { label: 'Let it expand to a bigger volume', bin: 'reactants' },
      { label: 'Add a catalyst', bin: 'none' },
      { label: 'Add argon at the same volume', bin: 'none' },
    ],
  },
  {
    kind: 'sort',
    id: 's.10.rates-equilibrium~rate-factors',
    title: 'What speeds up a reaction?',
    use: 'Use this for “Why does a crushed antacid tablet fizz faster than a whole one?”',
    assumptions: [
      'Particles react only when they collide hard enough and in the right direction.',
      'More frequent, harder collisions make a faster reaction.',
    ],
    question: 'Does the change speed the reaction up or slow it down?',
    bins: [
      {
        id: 'faster',
        label: 'Speeds it up',
        why: 'More collisions, harder collisions, or a lower barrier.',
      },
      {
        id: 'slower',
        label: 'Slows it down',
        why: 'Fewer collisions, or collisions with too little energy.',
      },
    ],
    cards: [
      { label: 'Warm the solution', bin: 'faster' },
      { label: 'Crush the tablet to powder', bin: 'faster' },
      { label: 'Use more concentrated acid', bin: 'faster' },
      { label: 'Add a catalyst', bin: 'faster' },
      { label: 'Cool it in ice', bin: 'slower' },
      { label: 'Use one large lump', bin: 'slower' },
      { label: 'Dilute the acid', bin: 'slower' },
    ],
  },

  // ── Acids, bases and pH ──
  {
    kind: 'sort',
    id: 's.10.acids-bases~classify',
    title: 'Acid, base or neutral?',
    use: 'Use this for “Is baking soda solution an acid, a base or neutral?”',
    assumptions: [
      'An acid gives H⁺ to water; a base takes H⁺ or gives OH⁻.',
      'Acids have a pH below 7, bases above 7; neutral is 7 at 25 °C.',
    ],
    question: 'Is it an acid, a base or neutral?',
    bins: [
      { id: 'acid', label: 'Acid (pH below 7)', why: 'It raises the H⁺ in water.' },
      { id: 'base', label: 'Base (pH above 7)', why: 'It raises the OH⁻ in water.' },
      {
        id: 'neutral',
        label: 'Neutral (pH 7)',
        why: 'H⁺ and OH⁻ stay equal, as in pure water.',
      },
    ],
    cards: [
      { label: 'HCl(aq)', bin: 'acid' },
      { label: 'HNO₃(aq)', bin: 'acid' },
      { label: 'Vinegar', bin: 'acid' },
      { label: 'Lemon juice', bin: 'acid' },
      { label: 'NaOH(aq)', bin: 'base' },
      { label: 'NH₃(aq)', bin: 'base' },
      { label: 'Baking soda solution', bin: 'base' },
      { label: 'Soapy water', bin: 'base' },
      { label: 'Pure water', bin: 'neutral' },
      { label: 'NaCl(aq)', bin: 'neutral' },
      { label: 'Sugar water', bin: 'neutral' },
    ],
  },

  // ── Oxidation-reduction reactions and electrochemistry ──
  {
    kind: 'explore',
    id: 's.10.redox',
    assumptions: [
      'Each metal stands in a 1 M solution of its own ion, at 25 °C.',
      'A wire joins the metals; a salt bridge of KNO₃ joins the solutions.',
      'The metal with the lower reduction potential is the anode: E° = E°cathode − E°anode.',
    ],
    figure: { kind: 'electrochemicalCell' },
    scenes: [
      {
        label: 'Electrons flow from zinc to copper',
        galvanic: { metals: ['Zn', 'Cu'], lit: 'electrons' },
        lines: [
          'Zinc gives up electrons more easily than copper, so zinc is the anode.',
          'The electrons leave the zinc and travel along the wire to the copper.',
          'E° = 0.34 − (−0.76) = 1.10 V.',
        ],
      },
      {
        label: 'Oxidation at the anode',
        galvanic: { metals: ['Zn', 'Cu'], lit: 'anode' },
        lines: [
          'At the anode, each zinc atom loses two electrons: Zn → Zn²⁺ + 2e⁻.',
          'Losing electrons is oxidation. The zinc strip slowly thins.',
        ],
      },
      {
        label: 'Reduction at the cathode',
        galvanic: { metals: ['Zn', 'Cu'], lit: 'cathode' },
        lines: [
          'At the cathode, each Cu²⁺ ion takes two electrons: Cu²⁺ + 2e⁻ → Cu.',
          'Gaining electrons is reduction. Copper coats the strip and the blue fades.',
        ],
      },
      {
        label: 'The salt bridge',
        galvanic: { metals: ['Zn', 'Cu'], lit: 'bridge' },
        lines: [
          'NO₃⁻ ions drift toward the anode and K⁺ ions toward the cathode.',
          'That keeps both solutions neutral. Take the bridge away and the current stops.',
        ],
      },
      {
        label: 'Copper can be the anode',
        galvanic: { metals: ['Ag', 'Cu'], lit: 'anode' },
        lines: [
          'Beside silver, copper is the anode: Ag⁺ takes electrons more easily than Cu²⁺.',
          'E° = 0.80 − 0.34 = 0.46 V.',
        ],
      },
      {
        label: 'A bigger gap, a bigger voltage',
        galvanic: { metals: ['Mg', 'Cu'], lit: 'meter' },
        lines: [
          'Magnesium gives up electrons far more easily than zinc.',
          'E° = 0.34 − (−2.37) = 2.71 V.',
        ],
      },
      {
        label: 'Light a bulb',
        galvanic: { metals: ['Zn', 'Cu'], meter: 'bulb', lit: 'meter' },
        lines: [
          'Swap the voltmeter for a bulb and the same electrons do work on the way.',
          'The cell runs until the zinc or the Cu²⁺ is used up.',
        ],
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.10.redox~oxidized-reduced',
    title: 'Oxidized, reduced or neither?',
    use: 'Use this for “In Zn + Cu²⁺ → Zn²⁺ + Cu, which substance is oxidized?”',
    assumptions: [
      'Oxidation is losing electrons; reduction is gaining them (OIL RIG).',
      'Compare each atom’s charge or oxidation number before and after the arrow.',
      'An ion that ends as it started is a spectator: neither.',
    ],
    question: 'Is the substance oxidized, reduced or neither?',
    bins: [
      {
        id: 'oxidized',
        label: 'Oxidized (loses electrons)',
        why: 'Its charge or oxidation number goes up.',
      },
      {
        id: 'reduced',
        label: 'Reduced (gains electrons)',
        why: 'Its charge or oxidation number goes down.',
      },
      { id: 'neither', label: 'Neither', why: 'It keeps its electrons: a spectator.' },
    ],
    cards: [
      { label: 'Zn in Zn + Cu²⁺ → Zn²⁺ + Cu', bin: 'oxidized' },
      { label: 'Cu²⁺ in Zn + Cu²⁺ → Zn²⁺ + Cu', bin: 'reduced' },
      { label: 'Na in 2Na + Cl₂ → 2NaCl', bin: 'oxidized' },
      { label: 'Cl₂ in 2Na + Cl₂ → 2NaCl', bin: 'reduced' },
      { label: 'Fe in 4Fe + 3O₂ → 2Fe₂O₃', bin: 'oxidized' },
      { label: 'O₂ in 4Fe + 3O₂ → 2Fe₂O₃', bin: 'reduced' },
      { label: 'Mg in Mg + 2H⁺ → Mg²⁺ + H₂', bin: 'oxidized' },
      { label: 'H⁺ in Mg + 2H⁺ → Mg²⁺ + H₂', bin: 'reduced' },
      { label: 'Na⁺ in NaCl + AgNO₃ → AgCl + NaNO₃', bin: 'neither' },
    ],
  },

  // ── Organic chemistry: hydrocarbons and functional groups ──
  {
    kind: 'sort',
    id: 's.10.organic~functional-groups',
    title: 'Functional groups',
    use: 'Use this for “Which functional group does ethyl acetate have?”',
    assumptions: [
      'A functional group is the part of an organic molecule that reacts; the rest is a carbon chain.',
      'Look at what is bonded to the carbon chain: –OH, –COOH, –COO–, –NH₂ or C=O between carbons.',
    ],
    question: 'Which functional group does the molecule have?',
    bins: [
      { id: 'alcohol', label: 'Alcohol (–OH)', why: 'An –OH on a carbon chain.' },
      {
        id: 'acid',
        label: 'Carboxylic acid (–COOH)',
        why: 'A carbon with a C=O and an –OH on it.',
      },
      { id: 'ester', label: 'Ester (–COO–)', why: 'A C=O whose oxygen links to another chain.' },
      { id: 'amine', label: 'Amine (–NH₂)', why: 'A nitrogen on a carbon chain.' },
      { id: 'ketone', label: 'Ketone (C=O)', why: 'A C=O between two carbons.' },
    ],
    cards: [
      { label: 'Methanol, CH₃OH', bin: 'alcohol' },
      { label: 'Ethanol, CH₃CH₂OH', bin: 'alcohol' },
      { label: 'Acetic acid, CH₃COOH', bin: 'acid' },
      { label: 'Formic acid, HCOOH', bin: 'acid' },
      { label: 'Ethyl acetate, CH₃COOCH₂CH₃', bin: 'ester' },
      { label: 'Methyl butanoate, CH₃CH₂CH₂COOCH₃', bin: 'ester' },
      { label: 'Methylamine, CH₃NH₂', bin: 'amine' },
      { label: 'Ethylamine, CH₃CH₂NH₂', bin: 'amine' },
      { label: 'Acetone, CH₃COCH₃', bin: 'ketone' },
      { label: '2-Butanone, CH₃COCH₂CH₃', bin: 'ketone' },
    ],
  },

  // ── Nuclear chemistry (HS-PS1-8) ──
  {
    kind: 'sort',
    id: 's.10.nuclear-chemistry~reactions',
    title: 'Alpha, beta, fission or fusion?',
    use: 'Use this for “Which equation shows fission?” and “Why is fusion a cleaner source of energy than fission?”',
    assumptions: [
      'Mass numbers and atomic numbers balance in every nuclear equation.',
      'Fusion’s fuel is hydrogen from water and it leaves little long-lived waste; fission leaves radioactive waste.',
    ],
    question: 'What kind of nuclear change is it?',
    bins: [
      { id: 'alpha', label: 'Alpha decay', why: 'A nucleus gives off ⁴₂He: A drops 4, Z drops 2.' },
      { id: 'beta', label: 'Beta decay', why: 'A neutron turns into a proton and an electron.' },
      {
        id: 'fission',
        label: 'Fission',
        why: 'A heavy nucleus splits into two middle-sized ones.',
      },
      { id: 'fusion', label: 'Fusion', why: 'Light nuclei join into a heavier one.' },
    ],
    cards: [
      { label: '²²⁶Ra → ²²²Rn + ⁴He', bin: 'alpha' },
      { label: 'Gives off a helium-4 nucleus', bin: 'alpha' },
      { label: '³H → ³He + e⁻', bin: 'beta' },
      { label: 'A neutron becomes a proton', bin: 'beta' },
      { label: '²³⁵U + n → ¹⁴⁴Ba + ⁸⁹Kr + 3n', bin: 'fission' },
      { label: 'A heavy nucleus splits', bin: 'fission' },
      { label: 'Runs today’s nuclear power plants', bin: 'fission' },
      { label: '²H + ³H → ⁴He + n', bin: 'fusion' },
      { label: 'Light nuclei join', bin: 'fusion' },
      { label: 'Powers the Sun', bin: 'fusion' },
    ],
  },
];
