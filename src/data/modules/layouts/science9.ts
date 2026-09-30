/**
 * Grade 9 science layout pages (explore, sort, sequence, observe), by skill in taxonomy order.
 * The calculators are in `../science/9.ts`. Data only: no UI code.
 */
import type { DivisionStage } from '../typesHsg';
import type { LayoutDef } from './types';

/** A stage card: its name and the cell drawn at that stage, 2n = 4. */
const division = (label: string, stage: DivisionStage) => ({
  label,
  figure: { kind: 'cellDivision' as const, stage, diploid: 4 },
});

// ─── The pages, in taxonomy order ───────────────────────────────────────────

const BIOMOLECULES: LayoutDef[] = [
  // ── The chemistry of life: water and biomolecules (HS-LS1-6, HS-LS1-1) ──
  {
    kind: 'explore',
    id: 's.9.biomolecules',
    assumptions: [
      'Monomers join by dehydration synthesis: each new bond gives off one water molecule.',
      'Hydrolysis runs it backward: one water molecule added breaks each bond, as in digestion.',
      'A fat is not a true polymer: glycerol always takes exactly three fatty acids.',
    ],
    figure: { kind: 'macromolecules' },
    scenes: [
      {
        label: 'Carbohydrates',
        lines: [
          'Two glucose join into maltose, a disaccharide; one water molecule leaves.',
          'Sugars are made of carbon, hydrogen and oxygen only.',
        ],
        macro: { kind: 'carbohydrate', count: 2 },
      },
      {
        label: 'Starch',
        lines: [
          'Four glucose units join by 3 bonds and give off 3 water molecules.',
          'Real starch, glycogen and cellulose chains are thousands of glucose units long.',
        ],
        macro: { kind: 'carbohydrate', count: 4 },
      },
      {
        label: 'Proteins',
        lines: [
          'Amino acids join end to end by peptide bonds. Each carries an amine group, so proteins hold nitrogen.',
          'Each has its own side chain R, and the chain folds into the protein’s shape.',
        ],
        macro: { kind: 'protein', count: 4 },
      },
      {
        label: 'Nucleic acids',
        lines: [
          'Nucleotides join sugar to phosphate, so the bases hang off a sugar–phosphate backbone.',
          'DNA and RNA store and carry the instructions for making proteins.',
        ],
        macro: { kind: 'nucleicAcid', count: 3 },
      },
      {
        label: 'Fats',
        lines: [
          'Glycerol takes three fatty acids by 3 ester bonds, giving off 3 water molecules.',
          'Fats store twice as much energy per gram as sugars.',
        ],
        macro: { kind: 'lipid' },
      },
      {
        label: 'Digestion',
        lines: [
          'Hydrolysis adds water back: 2 water molecules split a chain of 3 amino acids into its monomers.',
        ],
        macro: { kind: 'protein', count: 3, split: true },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.biomolecules~classes',
    title: 'Which class of biomolecule is it?',
    use: 'Use this for “Antibodies are made of which kind of molecule?”',
    assumptions: [
      'The four classes are carbohydrates, lipids, proteins and nucleic acids.',
      'Enzymes, antibodies and hemoglobin are proteins: chains of amino acids folded into a shape.',
    ],
    question: 'Which class of biomolecule is it?',
    bins: [
      {
        id: 'carbohydrates',
        label: 'Carbohydrates',
        why: 'Sugars and chains of sugars: quick energy and plant structure.',
      },
      {
        id: 'lipids',
        label: 'Lipids',
        why: 'Fats, oils, phospholipids and steroids: they do not mix with water.',
      },
      {
        id: 'proteins',
        label: 'Proteins',
        why: 'Chains of amino acids that do most of the cell’s work.',
      },
      {
        id: 'nucleic',
        label: 'Nucleic acids',
        why: 'Chains of nucleotides that store and carry genetic information.',
      },
    ],
    cards: [
      { label: 'Glucose', bin: 'carbohydrates' },
      { label: 'Starch', bin: 'carbohydrates' },
      { label: 'Cellulose', bin: 'carbohydrates' },
      { label: 'Glycogen', bin: 'carbohydrates' },
      { label: 'Fatty acid', bin: 'lipids' },
      { label: 'Triglyceride (fat)', bin: 'lipids' },
      { label: 'Phospholipid', bin: 'lipids' },
      { label: 'Cholesterol', bin: 'lipids' },
      { label: 'Amino acid', bin: 'proteins' },
      { label: 'Enzyme (amylase)', bin: 'proteins' },
      { label: 'Antibody', bin: 'proteins' },
      { label: 'Hemoglobin', bin: 'proteins' },
      { label: 'Nucleotide', bin: 'nucleic' },
      { label: 'DNA', bin: 'nucleic' },
      { label: 'RNA', bin: 'nucleic' },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.biomolecules~water',
    title: 'Which property of water explains it?',
    use: 'Use this for “Why can an insect stand on the surface of a pond?”',
    assumptions: [
      'Water is polar: its oxygen end is slightly negative and its hydrogen ends slightly positive.',
      'Hydrogen bonds between water molecules cause all four properties here.',
    ],
    question: 'Which property of water explains it?',
    bins: [
      {
        id: 'cohesion',
        label: 'Cohesion (surface tension)',
        why: 'Water molecules cling to each other, so the surface holds together.',
      },
      {
        id: 'heat',
        label: 'High specific heat',
        why: 'Breaking hydrogen bonds takes a lot of energy, so water warms and cools slowly.',
      },
      {
        id: 'solvent',
        label: 'Good solvent',
        why: 'Polar water surrounds ions and other polar molecules and pulls them apart.',
      },
      {
        id: 'ice',
        label: 'Ice floats',
        why: 'Hydrogen bonds hold ice in an open lattice, less dense than liquid water.',
      },
    ],
    cards: [
      { label: 'An insect stands on a pond', bin: 'cohesion' },
      { label: 'Water beads into round drops on a leaf', bin: 'cohesion' },
      { label: 'A lake warms slowly in spring', bin: 'heat' },
      { label: 'Seaside towns have milder winters than inland towns', bin: 'heat' },
      { label: 'Salt disappears when stirred into water', bin: 'solvent' },
      { label: 'Blood carries dissolved glucose', bin: 'solvent' },
      { label: 'Ponds freeze from the top down', bin: 'ice' },
      { label: 'Fish live all winter under lake ice', bin: 'ice' },
    ],
  },
];

const MEMBRANE: LayoutDef[] = [
  // ── Cell membranes and transport (HS-LS1-2, HS-LS1-3) ──
  {
    kind: 'sort',
    id: 's.9.membrane-transport~transport-types',
    title: 'Which kind of transport is it?',
    use: 'Use this for “Is it passive or active transport, and does it need a protein?”',
    assumptions: [
      'Passive transport runs from more to fewer and uses no ATP; active transport runs the other way and spends ATP.',
      'Facilitated diffusion and osmosis are passive but go through a channel or carrier protein.',
    ],
    question: 'How does it cross the membrane?',
    bins: [
      {
        id: 'simple',
        label: 'Simple diffusion',
        why: 'Small nonpolar molecules slip between the phospholipids, from more to fewer.',
      },
      {
        id: 'facilitated',
        label: 'Facilitated diffusion',
        why: 'A channel or carrier protein lets it through, still from more to fewer, with no ATP.',
      },
      {
        id: 'osmosis',
        label: 'Osmosis',
        why: 'Water crosses, through aquaporins, toward the side with more solute.',
      },
      {
        id: 'active',
        label: 'Active transport',
        why: 'A pump moves it from fewer to more, against the gradient, spending ATP.',
      },
      {
        id: 'bulk',
        label: 'Bulk transport',
        why: 'Large particles or many molecules move inside vesicles made from membrane.',
      },
    ],
    cards: [
      { label: 'O₂ enters a lung cell', bin: 'simple' },
      { label: 'CO₂ leaves a muscle cell', bin: 'simple' },
      { label: 'Glucose enters a red blood cell through a carrier protein', bin: 'facilitated' },
      { label: 'K⁺ leaves through an open channel, high to low', bin: 'facilitated' },
      { label: 'Water enters a root cell through aquaporins', bin: 'osmosis' },
      { label: 'The Na⁺/K⁺ pump spends ATP', bin: 'active' },
      { label: 'Root cells take in minerals from soil that has fewer of them', bin: 'active' },
      { label: 'A white blood cell engulfs a bacterium', bin: 'bulk' },
      { label: 'A gland cell releases insulin in vesicles', bin: 'bulk' },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.membrane-transport~tonicity',
    title: 'Cells in hypotonic, isotonic and hypertonic water',
    use: 'Use this for “Onion cells in salt water shrink from their walls. Why?”',
    assumptions: [
      'Water moves by osmosis toward the side with more solute.',
      'A red blood cell has no wall: it swells and can burst, or shrivels. A plant cell’s wall holds it firm, or its membrane pulls away.',
    ],
    question: 'Which way does water move?',
    bins: [
      {
        id: 'in',
        label: 'Into the cell (hypotonic water)',
        why: 'The water has less solute than the cell, so water moves in.',
      },
      {
        id: 'none',
        label: 'No net movement (isotonic water)',
        why: 'The same solute on both sides: water crosses both ways equally.',
      },
      {
        id: 'out',
        label: 'Out of the cell (hypertonic water)',
        why: 'The water has more solute than the cell, so water moves out.',
      },
    ],
    cards: [
      {
        label: 'Red blood cell swollen round',
        bin: 'in',
        figure: { kind: 'icon', icon: 'red blood cell in hypotonic water' },
      },
      {
        label: 'Red blood cell, a dimpled disc',
        bin: 'none',
        figure: { kind: 'icon', icon: 'red blood cell in isotonic water' },
      },
      {
        label: 'Red blood cell shriveled',
        bin: 'out',
        figure: { kind: 'icon', icon: 'red blood cell in hypertonic water' },
      },
      {
        label: 'Plant cell firm (turgid)',
        bin: 'in',
        figure: { kind: 'icon', icon: 'plant cell in hypotonic water' },
      },
      {
        label: 'Plant cell limp (flaccid)',
        bin: 'none',
        figure: { kind: 'icon', icon: 'plant cell in isotonic water' },
      },
      {
        label: 'Plant cell, membrane pulled from the wall',
        bin: 'out',
        figure: { kind: 'icon', icon: 'plant cell in hypertonic water' },
      },
      { label: 'Wilted lettuce in fresh water turns crisp', bin: 'in' },
      { label: 'Red blood cells in 0.9% saline', bin: 'none' },
      { label: 'Celery in salty water goes limp', bin: 'out' },
      { label: 'Red onion skin in salt water shrinks from its wall', bin: 'out' },
    ],
  },
];

const ENERGY: LayoutDef[] = [
  // ── Cellular energy: ATP, photosynthesis and cellular respiration (HS-LS1-5, 1-7, 2-3, 2-5) ──
  {
    kind: 'explore',
    id: 's.9.cellular-energy',
    assumptions: [
      'ATP carries the energy a cell spends; the cell remakes it from ADP and phosphate.',
      'Plant cells have chloroplasts and mitochondria; animal cells have only mitochondria.',
      'Textbooks give 30 to 38 ATP for each glucose respired, so no single total is stated here.',
    ],
    figure: { kind: 'organelleEnergy' },
    scenes: [
      {
        label: 'The cycle',
        lines: [
          'The products of each process are the reactants of the other: matter cycles, while energy flows in as light and out as work and heat.',
        ],
        energy: {},
      },
      {
        label: 'Photosynthesis',
        lines: [
          'In the chloroplast, light energy turns carbon dioxide and water into glucose, giving off oxygen.',
        ],
        energy: { process: 'photosynthesis' },
      },
      {
        label: 'Light reactions',
        lines: [
          'In the thylakoids, light splits water: O₂ is given off, and the energy is stored in ATP and NADPH.',
        ],
        energy: { process: 'lightReactions', lit: 'light' },
      },
      {
        label: 'Calvin cycle',
        lines: [
          'In the stroma, ATP and NADPH power the fixing of carbon from CO₂ into sugar.',
          'So the carbon atoms in glucose come from carbon dioxide in the air.',
        ],
        energy: { process: 'calvinCycle', lit: 'CO₂' },
      },
      {
        label: 'Respiration',
        lines: [
          'In the mitochondrion, glucose and oxygen become carbon dioxide and water, and the energy is stored in ATP.',
        ],
        energy: { process: 'respiration' },
      },
      {
        label: 'Glycolysis',
        lines: [
          'In the cytoplasm, glucose splits into 2 pyruvate for a net gain of 2 ATP. It needs no oxygen.',
        ],
        energy: { process: 'glycolysis', lit: 'glucose' },
      },
      {
        label: 'Krebs cycle',
        lines: [
          'In the matrix, pyruvate is broken down to CO₂, making 2 ATP and loading carriers with electrons.',
        ],
        energy: { process: 'krebsCycle', lit: 'CO₂' },
      },
      {
        label: 'Electron transport',
        lines: [
          'Along the folded inner membrane, electrons pass to oxygen, which takes them and becomes water.',
          'Most of the ATP is made here.',
        ],
        energy: { process: 'electronTransport', lit: 'O₂' },
      },
    ],
  },
  {
    kind: 'sequence',
    id: 's.9.cellular-energy~stages',
    title: 'The stages of cellular respiration',
    use: 'Use this for “Where does each stage of respiration happen, and which makes the most ATP?”',
    assumptions: [
      'Glycolysis happens in the cytoplasm; the rest happens in the mitochondrion.',
      'Oxygen is needed only at the last stage, where it takes the electrons.',
    ],
    question: 'Put the stages of cellular respiration in order.',
    stages: [
      { label: 'Glycolysis splits glucose into 2 pyruvate in the cytoplasm' },
      { label: 'Pyruvate enters the mitochondrion and gives off CO₂' },
      { label: 'The Krebs cycle gives off CO₂ and loads NADH' },
      { label: 'The electron transport chain uses O₂ and makes most of the ATP' },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.cellular-energy~processes',
    title: 'Photosynthesis, respiration or fermentation?',
    use: 'Use this for “Which process makes bread dough rise?”',
    assumptions: [
      'Photosynthesis stores light energy in glucose; aerobic respiration and fermentation release it.',
      'Fermentation needs no oxygen but makes only 2 ATP per glucose.',
    ],
    question: 'Which process is it?',
    bins: [
      {
        id: 'photosynthesis',
        label: 'Photosynthesis',
        why: 'Light, CO₂ and water make glucose and oxygen, in chloroplasts.',
      },
      {
        id: 'aerobic',
        label: 'Aerobic respiration',
        why: 'Glucose and oxygen give CO₂, water and the most ATP, in mitochondria.',
      },
      {
        id: 'fermentation',
        label: 'Fermentation',
        why: 'Glycolysis with no oxygen, then lactic acid or alcohol and CO₂.',
      },
    ],
    cards: [
      { label: 'Uses light energy', bin: 'photosynthesis' },
      { label: 'Gives off O₂', bin: 'photosynthesis' },
      { label: 'Happens in chloroplasts', bin: 'photosynthesis' },
      { label: 'Happens in mitochondria', bin: 'aerobic' },
      { label: 'Uses O₂ to release the most ATP', bin: 'aerobic' },
      { label: 'Yeast makes bread dough rise with no O₂', bin: 'fermentation' },
      { label: 'Sprinting muscles make lactic acid', bin: 'fermentation' },
      { label: 'Makes only 2 ATP per glucose, with no O₂', bin: 'fermentation' },
    ],
  },
  {
    kind: 'observe',
    id: 's.9.cellular-energy~enzymes',
    title: 'Enzyme activity by temperature',
    use: 'Use this to record or read how fast an enzyme works at each temperature.',
    assumptions: [
      'A human enzyme: it lowers the activation energy of a reaction and is not used up.',
      'Warmth speeds the molecules up, but too much heat changes the enzyme’s shape so its active site no longer fits.',
    ],
    columns: ['10 °C', '20 °C', '30 °C', '37 °C', '45 °C', '55 °C'],
    rowLabel: 'Reaction rate',
    unit: '% of the fastest',
    max: 100,
    step: 5,
    initial: [20, 45, 80, 100, 60, 10],
    pattern: (v) => {
      const temps = [10, 20, 30, 37, 45, 55];
      const peak = Math.max(...v);
      const at = v.indexOf(peak);
      if (at > 0 && at < v.length - 1 && v[v.length - 1]! < peak)
        return `Activity rises to a peak near ${temps[at]} °C, then falls as heat changes the enzyme’s shape: it denatures.`;
      if (v.every((x) => x === v[0]))
        return 'The rate stayed the same at every temperature; a real enzyme speeds up, peaks, then falls.';
      return 'A real enzyme speeds up with warmth, peaks at its best temperature, then falls as it denatures.';
    },
  },
];

const DIVISION: LayoutDef[] = [
  // ── The cell cycle, mitosis and meiosis (HS-LS1-4, HS-LS3-2) ──
  {
    kind: 'sequence',
    id: 's.9.mitosis-meiosis',
    assumptions: [
      'DNA is copied in interphase, so each chromosome enters mitosis as two sister chromatids.',
      'This cell has 2n = 4 chromosomes: two pairs, one of each pair from each parent (red and blue).',
      'The two daughter cells match the parent cell: 4 chromosomes each.',
    ],
    question: 'Put the stages of mitosis in order, from interphase.',
    stages: [
      division('Interphase', 'interphase'),
      division('Prophase', 'prophase'),
      division('Metaphase', 'metaphase'),
      division('Anaphase', 'anaphase'),
      division('Telophase', 'telophase'),
      division('Cytokinesis', 'cytokinesis'),
    ],
  },
  {
    kind: 'sequence',
    id: 's.9.mitosis-meiosis~cell-cycle',
    title: 'The cell cycle and how long each phase takes',
    use: 'Use this for “In which phase of the cell cycle is DNA replicated?”',
    assumptions: [
      'Interphase is G1, S and G2: the cell spends most of its life there, growing and copying its DNA.',
      'The times are typical for a human cell dividing in a dish, and they vary from cell to cell.',
    ],
    question: 'Put the phases of the cell cycle in order.',
    stages: [
      { label: 'G1: the cell grows', span: 11 },
      { label: 'S: the DNA is replicated', span: 8 },
      { label: 'G2: the copies are checked', span: 4 },
      { label: 'M: mitosis and cytokinesis', span: 1 },
    ],
    unit: 'hours',
    totalLabel: 'One cycle of a dividing human cell',
  },
  {
    kind: 'sequence',
    id: 's.9.mitosis-meiosis~meiosis',
    title: 'Meiosis I and II',
    use: 'Use this for “What are the final products of meiosis?”',
    assumptions: [
      'Homologous chromosomes pair up and cross over in prophase I, swapping pieces.',
      'Anaphase I separates the homologs; anaphase II separates the sister chromatids.',
      'The result is four haploid cells, n = 2, and no two alike.',
    ],
    question: 'Put the stages of meiosis in order, from interphase.',
    stages: [
      division('Interphase', 'interphase'),
      division('Prophase I', 'prophase I'),
      division('Metaphase I', 'metaphase I'),
      division('Anaphase I', 'anaphase I'),
      division('Telophase I', 'telophase I'),
      division('Prophase II', 'prophase II'),
      division('Metaphase II', 'metaphase II'),
      division('Anaphase II', 'anaphase II'),
      division('Telophase II', 'telophase II'),
    ],
  },
  {
    kind: 'sort',
    id: 's.9.mitosis-meiosis~compare',
    title: 'Mitosis, meiosis or both?',
    use: 'Use this for “Why do offspring from sexual reproduction vary more than those from mitosis?”',
    assumptions: [
      'Mitosis copies a body cell; meiosis makes gametes with half the chromosomes.',
      'Crossing over and the random sorting of homologs make every gamete different, so sexual reproduction adds variation.',
    ],
    question: 'Does it happen in mitosis, meiosis or both?',
    bins: [
      { id: 'mitosis', label: 'Mitosis', why: 'One division: two cells identical to the parent.' },
      {
        id: 'meiosis',
        label: 'Meiosis',
        why: 'Two divisions: four haploid gametes, each different.',
      },
      {
        id: 'both',
        label: 'Both',
        why: 'Each starts from copied chromosomes and pulls sisters apart.',
      },
    ],
    cards: [
      { label: 'Makes 2 identical cells', bin: 'mitosis' },
      { label: 'Body growth and wound repair', bin: 'mitosis' },
      { label: 'Daughter cells are diploid', bin: 'mitosis' },
      { label: 'Makes 4 cells with half the chromosomes', bin: 'meiosis' },
      {
        label: 'Homologous chromosomes pair and cross over',
        bin: 'meiosis',
        figure: { kind: 'cellDivision', stage: 'prophase I', diploid: 4 },
      },
      { label: 'Makes eggs and sperm', bin: 'meiosis' },
      { label: 'Two divisions in a row', bin: 'meiosis' },
      { label: 'Gametes differ from one another', bin: 'meiosis' },
      { label: 'DNA is copied beforehand', bin: 'both' },
      {
        label: 'Sister chromatids separate',
        bin: 'both',
        figure: { kind: 'cellDivision', stage: 'anaphase', diploid: 4 },
      },
    ],
  },
];

const INHERITANCE: LayoutDef[] = [
  // ── Mendelian and non-Mendelian inheritance (HS-LS3-2, HS-LS3-3) ──
  {
    kind: 'sort',
    id: 's.9.inheritance-patterns~blood-types',
    title: 'ABO blood types from genotypes',
    use: 'Use this for “Which two genotypes give the same blood type?”',
    assumptions: [
      'The ABO gene has three alleles: Iᴬ, Iᴮ and i.',
      'Iᴬ and Iᴮ are codominant, so IᴬIᴮ shows both; i is recessive to each of them.',
    ],
    question: 'Which blood type does the genotype give?',
    bins: [
      { id: 'A', label: 'Type A', why: 'At least one Iᴬ and no Iᴮ: i is hidden.' },
      { id: 'B', label: 'Type B', why: 'At least one Iᴮ and no Iᴬ: i is hidden.' },
      { id: 'AB', label: 'Type AB', why: 'Codominance: both A and B markers show on the cells.' },
      { id: 'O', label: 'Type O', why: 'Two recessive i alleles: no A or B marker.' },
    ],
    cards: [
      { label: 'IᴬIᴬ', bin: 'A' },
      { label: 'Iᴬi', bin: 'A' },
      { label: 'IᴮIᴮ', bin: 'B' },
      { label: 'Iᴮi', bin: 'B' },
      { label: 'IᴬIᴮ', bin: 'AB' },
      { label: 'ii', bin: 'O' },
    ],
  },
  {
    kind: 'explore',
    id: 's.9.inheritance-patterns~pedigree',
    title: 'A sex-linked pedigree',
    use: 'Use this for “Can an affected son have a mother who does not show the trait?”',
    assumptions: [
      'Squares are males and circles females; filled shows the trait, half-filled carries it.',
      'Red–green color blindness is X-linked recessive: Xᵇ on the X chromosome.',
    ],
    figure: {
      kind: 'pedigree',
      people: [
        { id: 'g1', sex: 'male', generation: 1, trait: true, genotype: 'XᵇY' },
        { id: 'g2', sex: 'female', generation: 1, genotype: 'XᴮXᴮ' },
        { id: 's1', sex: 'male', generation: 2, genotype: 'XᴮY', parents: ['g1', 'g2'] },
        {
          id: 'd1',
          sex: 'female',
          generation: 2,
          carrier: true,
          genotype: 'XᴮXᵇ',
          parents: ['g1', 'g2'],
        },
        { id: 'h1', sex: 'male', generation: 2, genotype: 'XᴮY', partner: 'd1' },
        {
          id: 'c1',
          sex: 'male',
          generation: 3,
          trait: true,
          genotype: 'XᵇY',
          parents: ['d1', 'h1'],
        },
        {
          id: 'c2',
          sex: 'female',
          generation: 3,
          carrier: true,
          genotype: 'XᴮXᵇ',
          parents: ['d1', 'h1'],
        },
        { id: 'c3', sex: 'male', generation: 3, genotype: 'XᴮY', parents: ['d1', 'h1'] },
      ],
    },
    scenes: [
      {
        label: 'Reading the symbols',
        lines: [
          'Three generations: a horizontal line joins partners, and a vertical line leads down to their children.',
          'Two males show the trait: the grandfather and one grandson.',
        ],
        family: {},
      },
      {
        label: 'Carriers',
        lines: [
          'Only females can be carriers: a male has one X, so he shows whatever allele it carries.',
        ],
        family: { carriers: true },
      },
      {
        label: 'Genotypes',
        lines: [
          'Each son’s X came from his mother; each daughter got her father’s only X.',
          'So every daughter of the affected grandfather carries Xᵇ.',
        ],
        family: { carriers: true, genotypes: true },
      },
      {
        label: 'An affected son',
        lines: [
          'Can an affected son have a mother who does not show the trait? Yes: she can be a carrier, XᴮXᵇ.',
          'Her son got her Xᵇ, and his Y from his father.',
        ],
        family: { lit: ['d1', 'c1'], ask: 'd1' },
      },
    ],
  },
];

const DNA: LayoutDef[] = [
  // ── DNA structure, replication and protein synthesis (HS-LS1-1, HS-LS3-1) ──
  {
    kind: 'sequence',
    id: 's.9.dna-protein-synthesis~replication',
    title: 'DNA replication',
    use: 'Use this for “How does base pairing let a cell copy its DNA before it divides?”',
    assumptions: [
      'Each old strand is a template: A pairs with T and G with C, so the new strand’s order is fixed.',
      'Replication is semiconservative: each new DNA molecule keeps one old strand.',
    ],
    question: 'Put the steps of DNA replication in order.',
    stages: [
      { label: 'Helicase unzips the double helix at an origin' },
      { label: 'Free nucleotides pair with each old strand, A with T and G with C' },
      { label: 'DNA polymerase joins the new nucleotides into a strand' },
      { label: 'Two DNA molecules, each one old strand and one new' },
    ],
  },
  {
    kind: 'sequence',
    id: 's.9.dna-protein-synthesis~protein-synthesis',
    title: 'From gene to protein',
    use: 'Use this for “Put the steps of protein synthesis in order, from the gene in the nucleus.”',
    assumptions: [
      'Transcription copies a gene into mRNA in the nucleus; translation builds the protein at a ribosome.',
      'Each tRNA carries one amino acid and pairs with one codon by its anticodon.',
    ],
    question: 'Put the steps of protein synthesis in order.',
    stages: [
      { label: 'RNA polymerase copies a gene into mRNA in the nucleus' },
      { label: 'The mRNA leaves through a nuclear pore' },
      { label: 'A ribosome reads the mRNA from the start codon AUG' },
      { label: 'tRNAs bring the amino acids that match each codon' },
      { label: 'Peptide bonds link the amino acids' },
      { label: 'A stop codon releases the chain, which folds into a protein' },
    ],
  },
];

const BIOTECH: LayoutDef[] = [
  // ── Mutations, gene expression and biotechnology (HS-LS3-1, HS-LS3-2, HS-LS1-1) ──
  {
    kind: 'sort',
    id: 's.9.biotechnology~tools',
    title: 'Which DNA tool is it?',
    use: 'Use this for “Which technique would make millions of copies of DNA from one hair?”',
    assumptions: [
      'PCR copies DNA, gel electrophoresis sorts it by size, and enzymes cut it at chosen sequences.',
      'Genetic engineering moves a gene into another organism, which then makes that gene’s protein.',
    ],
    question: 'Which tool or technique is it?',
    bins: [
      {
        id: 'pcr',
        label: 'PCR (copies DNA)',
        why: 'Each cycle of heating and cooling doubles the DNA.',
      },
      {
        id: 'gel',
        label: 'Gel electrophoresis (sorts by size)',
        why: 'An electric field pulls DNA through a gel; short pieces run farthest.',
      },
      {
        id: 'cut',
        label: 'Cutting DNA',
        why: 'Restriction enzymes and CRISPR–Cas9 cut only at a matching sequence.',
      },
      {
        id: 'engineering',
        label: 'Genetic engineering (moves a gene)',
        why: 'A gene from one organism is put into another, which makes its protein.',
      },
    ],
    cards: [
      { label: 'Millions of copies from one hair’s DNA', bin: 'pcr' },
      { label: 'Heat, cool and warm again 30 times', bin: 'pcr' },
      { label: 'Shorter pieces travel farther toward +', bin: 'gel' },
      { label: 'A child’s bands compared with each parent’s', bin: 'gel' },
      { label: 'An enzyme cuts only at GAATTC', bin: 'cut' },
      { label: 'Cas9 led to a gene by a guide RNA', bin: 'cut' },
      { label: 'Bacteria given the human insulin gene', bin: 'engineering' },
      { label: 'Corn with a bacterial gene that kills caterpillars', bin: 'engineering' },
    ],
  },
];

const EVOLUTION: LayoutDef[] = [
  // ── Evidence for evolution, population genetics and speciation (HS-LS4-1 to 4-5) ──
  {
    kind: 'sort',
    id: 's.9.evolution-evidence~homologous',
    title: 'Homologous, analogous or vestigial?',
    use: 'Use this for “Which forelimb is not homologous to the others?”',
    assumptions: [
      'Homologous structures have the same bones in the same order, inherited from a common ancestor, even when they do different jobs.',
      'Analogous structures do the same job but are built differently: they show no shared ancestry.',
      'Vestigial structures are small leftovers of parts an ancestor used.',
    ],
    question: 'What does the structure show about ancestry?',
    bins: [
      {
        id: 'homologous',
        label: 'Homologous',
        why: 'Upper arm, two forearm bones, wrist and fingers, in the same order.',
      },
      {
        id: 'analogous',
        label: 'Analogous',
        why: 'The same job reached by a different build, not by shared ancestry.',
      },
      {
        id: 'vestigial',
        label: 'Vestigial',
        why: 'A reduced part that an ancestor used, such as legs on a whale’s land-walking ancestor.',
      },
    ],
    cards: [
      { label: 'Human arm', bin: 'homologous', figure: { kind: 'icon', icon: 'human arm bones' } },
      { label: 'Bat wing', bin: 'homologous', figure: { kind: 'icon', icon: 'bat wing bones' } },
      {
        label: 'Whale flipper',
        bin: 'homologous',
        figure: { kind: 'icon', icon: 'whale flipper bones' },
      },
      { label: 'Cat foreleg', bin: 'homologous', figure: { kind: 'icon', icon: 'cat leg bones' } },
      { label: 'Insect wing', bin: 'analogous', figure: { kind: 'icon', icon: 'insect wing' } },
      { label: 'A shark’s fin beside a dolphin’s flipper', bin: 'analogous' },
      { label: 'A whale’s small hip bones', bin: 'vestigial' },
      { label: 'The human tailbone', bin: 'vestigial' },
    ],
  },
  {
    kind: 'explore',
    id: 's.9.evolution-evidence~common-ancestry',
    title: 'Common ancestry on a cladogram',
    use: 'Use this for “Which two animals are most closely related?”',
    assumptions: [
      'Each mark is where a shared derived trait first appeared; every taxon above that branch inherited it.',
      'Taxa that split later share a more recent common ancestor, so they are more closely related.',
      'A clade is an ancestor and all of its descendants.',
    ],
    figure: {
      kind: 'cladogram',
      tree: ['Lamprey', ['Shark', ['Bony fish', ['Frog', ['Mouse', ['Lizard', 'Bird']]]]]],
      traits: [
        { name: 'Jaws', taxa: ['Shark', 'Bony fish', 'Frog', 'Mouse', 'Lizard', 'Bird'] },
        { name: 'Bony skeleton', taxa: ['Bony fish', 'Frog', 'Mouse', 'Lizard', 'Bird'] },
        { name: 'Four limbs', taxa: ['Frog', 'Mouse', 'Lizard', 'Bird'] },
        { name: 'Amniotic egg', taxa: ['Mouse', 'Lizard', 'Bird'] },
        { name: 'Feathers', taxa: ['Bird'] },
      ],
    },
    scenes: [
      {
        label: 'Jaws',
        lines: [
          'Jaws appeared after the lamprey split off, so every taxon but the lamprey has them.',
        ],
        clade: { lit: 'Jaws' },
      },
      {
        label: 'Bony skeleton',
        lines: [
          'The shark’s skeleton is cartilage; bone appeared on the branch after it split off.',
        ],
        clade: { lit: 'Bony skeleton' },
      },
      {
        label: 'Four limbs',
        lines: ['The frog, mouse, lizard and bird are tetrapods: all four inherited four limbs.'],
        clade: { lit: 'Four limbs' },
      },
      {
        label: 'Amniotic egg',
        lines: [
          'An egg with its own water supply let the ancestor of mammals, reptiles and birds lay eggs on land.',
        ],
        clade: { lit: 'Amniotic egg' },
      },
      {
        label: 'Feathers',
        lines: [
          'Only the bird has feathers: a trait of its own branch, so it groups nothing else.',
        ],
        clade: { lit: 'Feathers' },
      },
      {
        label: 'Closest relatives',
        lines: [
          'The lizard and the bird split last, so they share the most recent common ancestor.',
          'A lizard is more closely related to a bird than to a mouse.',
        ],
        clade: { ring: ['Lizard', 'Bird'] },
      },
      {
        label: 'Reptiles',
        lines: [
          'The smallest clade holding the lizard also holds the bird.',
          'So a group of reptiles that leaves out birds is not a clade.',
        ],
        clade: { ring: ['Lizard'] },
      },
      {
        label: 'Trees from DNA',
        lines: [
          'Counting the differences in one gene’s DNA sequence places the branches in the same order.',
          'Species with fewer differences split more recently.',
        ],
        clade: {},
      },
    ],
  },
  {
    kind: 'sequence',
    id: 's.9.evolution-evidence~resistance',
    title: 'How bacteria become resistant to an antibiotic',
    use: 'Use this for “Why does overusing antibiotics lead to resistant bacteria?”',
    assumptions: [
      'Darwin’s points: individuals vary, the variation is inherited, more are born than survive, and survival depends on the variation.',
      'Mutations are random: the antibiotic does not cause them, it only selects the ones already there.',
    ],
    question: 'Put the steps of natural selection for resistance in order.',
    stages: [
      { label: 'Bacteria vary, and a few carry a mutation for resistance' },
      { label: 'An antibiotic kills most of the susceptible bacteria' },
      { label: 'The resistant survivors divide and pass on the mutation' },
      { label: 'The next population is mostly resistant' },
    ],
  },
  {
    kind: 'sequence',
    id: 's.9.evolution-evidence~speciation',
    title: 'How one species becomes two',
    use: 'Use this for “Put the steps of speciation after a population is split in order.”',
    assumptions: [
      'A species is a group whose members can interbreed and have fertile offspring.',
      'A barrier stops gene flow, so the two groups change separately over many generations.',
    ],
    question: 'Put the steps of speciation in order.',
    stages: [
      { label: 'One interbreeding population' },
      { label: 'A barrier splits it, such as a river or a mountain range' },
      { label: 'Mutations, selection and drift differ on each side' },
      { label: 'The groups can no longer interbreed: two species' },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.evolution-evidence~mechanisms',
    title: 'What changes allele frequencies?',
    use: 'Use this for “Which condition would change the allele frequencies in a population?”',
    assumptions: [
      'Hardy–Weinberg equilibrium needs all five conditions; break any one and the population can evolve.',
      'Evolution here means a change in allele frequencies from one generation to the next.',
    ],
    question: 'Does it keep allele frequencies steady or change them?',
    bins: [
      {
        id: 'steady',
        label: 'Keeps allele frequencies steady',
        why: 'The five Hardy–Weinberg conditions: nothing favors or adds any allele.',
      },
      {
        id: 'changes',
        label: 'Changes allele frequencies',
        why: 'Each of these is a way a population evolves.',
      },
    ],
    cards: [
      { label: 'A very large population', bin: 'steady' },
      { label: 'Random mating', bin: 'steady' },
      { label: 'No mutation', bin: 'steady' },
      { label: 'No one moves in or out', bin: 'steady' },
      { label: 'Every genotype survives equally', bin: 'steady' },
      { label: 'Genetic drift in a small population', bin: 'changes' },
      { label: 'Gene flow from migrants', bin: 'changes' },
      { label: 'Natural selection', bin: 'changes' },
      { label: 'A new mutation', bin: 'changes' },
      { label: 'Mates chosen by a trait', bin: 'changes' },
    ],
  },
];

const CLASSIFICATION: LayoutDef[] = [
  // ── Classification and the diversity of life (HS-LS4-1) ──
  {
    kind: 'explore',
    id: 's.9.classification',
    assumptions: [
      'A cladogram groups organisms by shared derived traits: new features passed on to every descendant.',
      'Branch order, not branch length, shows relationship; each branch point is a common ancestor.',
      'A clade is an ancestor and all of its descendants.',
    ],
    figure: {
      kind: 'cladogram',
      tree: ['Sponge', ['Jellyfish', ['Earthworm', ['Sea star', ['Fish', 'Human']]]]],
      traits: [
        { name: 'True tissues', taxa: ['Jellyfish', 'Earthworm', 'Sea star', 'Fish', 'Human'] },
        { name: 'Bilateral symmetry', taxa: ['Earthworm', 'Sea star', 'Fish', 'Human'] },
        { name: 'Deuterostome embryo', taxa: ['Sea star', 'Fish', 'Human'] },
        { name: 'Backbone', taxa: ['Fish', 'Human'] },
        { name: 'Hair', taxa: ['Human'] },
      ],
    },
    scenes: [
      {
        label: 'True tissues',
        lines: [
          'A sponge’s cells are not organized into tissues; every other animal here inherited tissues.',
        ],
        clade: { lit: 'True tissues' },
      },
      {
        label: 'Bilateral symmetry',
        lines: [
          'A left and a right side, a front and a back: the jellyfish, round like a wheel, split off before this.',
        ],
        clade: { lit: 'Bilateral symmetry' },
      },
      {
        label: 'Deuterostome embryo',
        lines: [
          'In the sea star, fish and human embryo, the first opening becomes the anus, not the mouth.',
          'The young sea star is two-sided; only the adult grows five arms.',
        ],
        clade: { lit: 'Deuterostome embryo' },
      },
      {
        label: 'Backbone',
        lines: ['The fish and the human share a backbone, so they share the most recent ancestor.'],
        clade: { lit: 'Backbone' },
      },
      {
        label: 'Hair',
        lines: ['Only the human has hair here: a trait of one branch groups nothing else.'],
        clade: { lit: 'Hair' },
      },
      {
        label: 'A clade',
        lines: [
          'The sea star, fish and human are an ancestor’s whole family: a clade.',
          'Any group that sits above one branch point is a clade.',
        ],
        clade: { ring: ['Sea star', 'Fish', 'Human'] },
      },
      {
        label: 'Not a clade',
        lines: [
          'The jellyfish and the earthworm share an ancestor, but so do the sea star, fish and human.',
          'A group that leaves out some of its ancestor’s descendants is not a clade.',
        ],
        clade: { ring: ['Jellyfish', 'Earthworm'] },
      },
      {
        label: 'Reading the nodes',
        lines: [
          'The last common ancestor of any two taxa sits at the branch point where their lines meet.',
          'The earthworm and the human meet lower down than the fish and the human, so they are less closely related.',
        ],
        clade: {},
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.classification~domains',
    title: 'The three domains',
    use: 'Use this for “Methane-making microbes live in a cow’s stomach. Which domain are they in?”',
    assumptions: [
      'Bacteria and archaea are single cells with no nucleus; archaea differ in their walls, membranes and genes, and many live in extreme places.',
      'Eukarya have cells with a nucleus: protists, fungi, plants and animals.',
      'Viruses are not cells, so they are not placed in any domain.',
    ],
    question: 'Which domain does it belong to?',
    bins: [
      {
        id: 'bacteria',
        label: 'Bacteria',
        why: 'Prokaryotes with cell walls made of peptidoglycan.',
      },
      {
        id: 'archaea',
        label: 'Archaea',
        why: 'Prokaryotes whose walls and membranes are built differently from bacteria’s.',
      },
      { id: 'eukarya', label: 'Eukarya', why: 'Every cell has a nucleus inside a membrane.' },
    ],
    cards: [
      {
        label: 'E. coli in the gut',
        bin: 'bacteria',
        figure: { kind: 'icon', icon: 'domain Bacteria' },
      },
      { label: 'Streptococcus that causes strep throat', bin: 'bacteria' },
      { label: 'Cyanobacteria in a pond', bin: 'bacteria' },
      {
        label: 'Methane-making microbes in a cow’s stomach',
        bin: 'archaea',
        figure: { kind: 'icon', icon: 'domain Archaea' },
      },
      { label: 'Halobacterium in a salt pond', bin: 'archaea' },
      {
        label: 'Paramecium (protist)',
        bin: 'eukarya',
        figure: { kind: 'icon', icon: 'kingdom Protista' },
      },
      {
        label: 'Mushrooms (fungi)',
        bin: 'eukarya',
        figure: { kind: 'icon', icon: 'kingdom Fungi' },
      },
      { label: 'A leafy plant', bin: 'eukarya', figure: { kind: 'icon', icon: 'kingdom Plantae' } },
      {
        label: 'A fish (animal)',
        bin: 'eukarya',
        figure: { kind: 'icon', icon: 'kingdom Animalia' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.classification~kingdoms',
    title: 'The kingdoms of Eukarya',
    use: 'Use this for “Is yeast a plant, a fungus or a protist?”',
    assumptions: [
      'Plants make their own food by photosynthesis and have cell walls of cellulose.',
      'Fungi absorb food and have walls of chitin; animals eat food and have no cell walls.',
      'Protists are the eukaryotes that are not plants, fungi or animals: most are single cells.',
    ],
    question: 'Which kingdom does it belong to?',
    bins: [
      {
        id: 'protists',
        label: 'Protists',
        why: 'Mostly single cells, some plant-like, some animal-like.',
      },
      { id: 'fungi', label: 'Fungi', why: 'They absorb food from what they grow on.' },
      { id: 'plants', label: 'Plants', why: 'Many-celled producers that make food from light.' },
      { id: 'animals', label: 'Animals', why: 'Many-celled consumers with no cell walls.' },
    ],
    cards: [
      { label: 'Amoeba', bin: 'protists' },
      { label: 'Paramecium', bin: 'protists' },
      { label: 'Kelp', bin: 'protists' },
      { label: 'Yeast', bin: 'fungi' },
      { label: 'Bread mold', bin: 'fungi' },
      { label: 'Mushroom', bin: 'fungi' },
      { label: 'Moss', bin: 'plants' },
      { label: 'Fern', bin: 'plants' },
      { label: 'Pine tree', bin: 'plants' },
      { label: 'Sponge', bin: 'animals' },
      { label: 'Jellyfish', bin: 'animals' },
      { label: 'Earthworm', bin: 'animals' },
    ],
  },
  {
    kind: 'sequence',
    id: 's.9.classification~ranks',
    title: 'The ranks of classification',
    use: 'Use this for “Which rank is the most specific: family, genus or order?”',
    assumptions: [
      'Each rank holds fewer, more closely related organisms than the one above it.',
      'The scientific name is the genus and the species, written in italics: Homo sapiens.',
    ],
    question: 'Order the ranks for humans, from broadest to most specific.',
    stages: [
      { label: 'Domain Eukarya' },
      { label: 'Kingdom Animalia' },
      { label: 'Phylum Chordata' },
      { label: 'Class Mammalia' },
      { label: 'Order Primates' },
      { label: 'Family Hominidae' },
      { label: 'Genus Homo' },
      { label: 'Species Homo sapiens' },
    ],
  },
];

const POPULATION: LayoutDef[] = [
  // ── Population growth and carrying capacity (HS-LS2-1, HS-LS2-2) ──
  {
    kind: 'sort',
    id: 's.9.population-ecology~limiting-factors',
    title: 'Density-dependent or density-independent?',
    use: 'Use this for “Habitat loss crowds a population. Which limiting factor grows stronger?”',
    assumptions: [
      'A limiting factor keeps a population from growing without end.',
      'Density-dependent factors hit harder as the population gets more crowded; density-independent ones hit the same share whatever the crowding.',
    ],
    question: 'Does its effect depend on how crowded the population is?',
    bins: [
      {
        id: 'dependent',
        label: 'Density-dependent',
        why: 'The more individuals share the space, the stronger it acts.',
      },
      {
        id: 'independent',
        label: 'Density-independent',
        why: 'Weather and disasters strike a sparse population as hard as a crowded one.',
      },
    ],
    cards: [
      { label: 'Competition for food', bin: 'dependent' },
      { label: 'Disease spreading in a crowded herd', bin: 'dependent' },
      { label: 'Predators catching more prey when prey are many', bin: 'dependent' },
      { label: 'Parasites', bin: 'dependent' },
      { label: 'Less nesting space after habitat loss', bin: 'dependent' },
      { label: 'A wildfire', bin: 'independent' },
      { label: 'A flood', bin: 'independent' },
      { label: 'A late frost', bin: 'independent' },
      { label: 'A hurricane', bin: 'independent' },
      { label: 'A drought', bin: 'independent' },
    ],
  },
  {
    kind: 'sequence',
    id: 's.9.population-ecology~growth-phases',
    title: 'Bacteria growing in a flask',
    use: 'Use this for “Why does the number of bacteria level off and then fall?”',
    assumptions: [
      'A flask holds a fixed amount of food and never has its wastes removed.',
      'Growth is fastest in the exponential phase; it stops when births equal deaths.',
    ],
    question: 'Put the growth phases in order.',
    stages: [
      { label: 'Lag: the cells adjust and divide little' },
      { label: 'Exponential: doubling at a steady rate' },
      { label: 'Stationary: births equal deaths as food runs low' },
      { label: 'Death: wastes build up and deaths exceed births' },
    ],
  },
];

const ECOSYSTEMS: LayoutDef[] = [
  // ── Ecosystems: energy pyramids, matter cycles, succession, biodiversity (HS-LS2-2 to 2-7) ──
  {
    kind: 'sequence',
    id: 's.9.ecosystem-dynamics~succession',
    title: 'Primary succession',
    use: 'Use this for “Put these communities in the order they grow on new volcanic rock.”',
    assumptions: [
      'Primary succession starts with no soil: new lava rock, or rock left bare by a glacier.',
      'Pioneer lichens break down rock; each community changes the soil and shade so the next can grow.',
      'Secondary succession, after a fire or on a plowed field, starts at grasses because the soil remains.',
    ],
    question: 'Put the stages of primary succession in order.',
    stages: [
      { label: 'Bare rock', figure: { kind: 'icon', icon: 'bare rock' } },
      { label: 'Lichens', figure: { kind: 'icon', icon: 'lichens on rock' } },
      { label: 'Mosses and thin soil', figure: { kind: 'icon', icon: 'mosses and thin soil' } },
      { label: 'Grasses and flowers', figure: { kind: 'icon', icon: 'grasses and flowers' } },
      { label: 'Shrubs', figure: { kind: 'icon', icon: 'shrubs' } },
      { label: 'Young trees', figure: { kind: 'icon', icon: 'young trees' } },
      { label: 'Mature forest', figure: { kind: 'icon', icon: 'mature forest' } },
    ],
  },
  {
    kind: 'explore',
    id: 's.9.ecosystem-dynamics~nitrogen',
    title: 'The nitrogen cycle',
    use: 'Use this for “How do plants such as beans add nitrogen to the soil?”',
    assumptions: [
      'Air is mostly nitrogen gas, N₂, but plants and animals cannot use it in that form.',
      'Living things need nitrogen to build amino acids, so proteins, and the bases of DNA.',
    ],
    figure: { kind: 'nitrogenCycle' },
    scenes: [
      {
        label: 'The whole cycle',
        lines: [
          'Nitrogen goes from the air into the soil, through living things and back to the air.',
        ],
        nitrogen: {},
      },
      {
        label: 'Fixation',
        lines: [
          'Bacteria in the root nodules of beans and clover turn N₂ into ammonia, which becomes ammonium in the soil.',
          'This is nitrogen fixation, the main way nitrogen enters living things.',
        ],
        nitrogen: { process: 'fixation' },
      },
      {
        label: 'Lightning',
        lines: [
          'A lightning bolt’s energy joins nitrogen and oxygen; rain carries the nitrate into the soil.',
        ],
        nitrogen: { process: 'lightning' },
      },
      {
        label: 'Nitrification',
        lines: ['Soil bacteria turn ammonium into nitrite, then into nitrate.'],
        nitrogen: { process: 'nitrification' },
      },
      {
        label: 'Assimilation',
        lines: [
          'Plant roots take in nitrate and ammonium and build them into amino acids and DNA.',
        ],
        nitrogen: { process: 'assimilation' },
      },
      {
        label: 'Eating',
        lines: ['Animals get their nitrogen by eating plants or other animals.'],
        nitrogen: { process: 'eating' },
      },
      {
        label: 'Ammonification',
        lines: ['Decomposers break down wastes and dead matter, releasing ammonium into the soil.'],
        nitrogen: { process: 'ammonification' },
      },
      {
        label: 'Denitrification',
        lines: ['Bacteria in wet, airless soil turn nitrate back into N₂ gas, closing the cycle.'],
        nitrogen: { process: 'denitrification' },
      },
    ],
  },
];

const HOMEOSTASIS: LayoutDef[] = [
  // ── Body systems, homeostasis and feedback loops (HS-LS1-2, HS-LS1-3) ──
  {
    kind: 'explore',
    id: 's.9.homeostasis',
    assumptions: [
      'Homeostasis keeps conditions inside the body near a set point, such as about 37 °C.',
      'Negative feedback undoes the change and switches off once the set point returns.',
      'Positive feedback makes the change grow until an event ends it.',
    ],
    figure: { kind: 'feedbackLoop' },
    scenes: [
      {
        label: 'Too hot',
        lines: [
          'During exercise the rise in temperature is the stimulus, and sweating is the response.',
          'The response undoes the stimulus, so this is negative feedback.',
        ],
        loop: {
          sign: 'negative',
          back: 'negative feedback',
          lit: 2,
          steps: [
            {
              role: 'Stimulus',
              text: 'Body temperature rises above its set point during exercise.',
            },
            { role: 'Sensor', text: 'Nerve endings in the skin and brain detect the rise.' },
            { role: 'Control center', text: 'The hypothalamus compares it with the set point.' },
            { role: 'Effector', text: 'Sweat glands release sweat; skin blood vessels widen.' },
            {
              role: 'Response',
              text: 'Sweat evaporates and blood sheds heat, so temperature falls.',
            },
          ],
        },
      },
      {
        label: 'Too cold',
        lines: ['The same control center answers a drop: now the effectors make and keep heat.'],
        loop: {
          sign: 'negative',
          back: 'negative feedback',
          lit: 3,
          steps: [
            { role: 'Stimulus', text: 'Body temperature falls below its set point.' },
            { role: 'Sensor', text: 'Nerve endings in the skin and brain detect the drop.' },
            { role: 'Control center', text: 'The hypothalamus signals the body to save heat.' },
            { role: 'Effector', text: 'Muscles shiver; skin blood vessels narrow.' },
            { role: 'Response', text: 'More heat is made and less is lost, so temperature rises.' },
          ],
        },
      },
      {
        label: 'Blood sugar high',
        lines: [
          'After a meal the pancreas releases insulin, and glucose leaves the blood.',
          'Once glucose is back near normal, insulin release slows: negative feedback.',
        ],
        loop: {
          sign: 'negative',
          back: 'negative feedback',
          lit: 2,
          steps: [
            { role: 'Stimulus', text: 'Blood glucose rises after a meal.' },
            { role: 'Sensor', text: 'Beta cells in the pancreas detect the high glucose.' },
            { role: 'Control center', text: 'The pancreas releases insulin into the blood.' },
            {
              role: 'Effector',
              text: 'Body cells take in glucose; the liver stores it as glycogen.',
            },
            { role: 'Response', text: 'Blood glucose falls back toward normal.' },
          ],
        },
      },
      {
        label: 'Blood sugar low',
        lines: ['Between meals, glucagon tells the liver to release the glucose it stored.'],
        loop: {
          sign: 'negative',
          back: 'negative feedback',
          lit: 3,
          steps: [
            { role: 'Stimulus', text: 'Blood glucose falls between meals.' },
            { role: 'Sensor', text: 'Alpha cells in the pancreas detect the low glucose.' },
            { role: 'Control center', text: 'The pancreas releases glucagon into the blood.' },
            { role: 'Effector', text: 'The liver breaks down glycogen and releases glucose.' },
            { role: 'Response', text: 'Blood glucose rises back toward normal.' },
          ],
        },
      },
      {
        label: 'Water balance',
        lines: [
          'When blood is too concentrated, ADH tells the kidneys to return more water to the blood.',
          'The urine becomes darker and smaller in amount until the balance returns.',
        ],
        loop: {
          sign: 'negative',
          back: 'negative feedback',
          lit: 3,
          steps: [
            { role: 'Stimulus', text: 'The blood becomes too concentrated, as after sweating.' },
            { role: 'Sensor', text: 'Cells in the hypothalamus detect the change.' },
            { role: 'Control center', text: 'The pituitary gland releases ADH.' },
            { role: 'Effector', text: 'The kidneys return more water to the blood.' },
            { role: 'Response', text: 'The blood is diluted back toward normal.' },
          ],
        },
      },
      {
        label: 'Childbirth',
        lines: [
          'Each contraction brings a stronger one: the response adds to the stimulus.',
          'This positive feedback grows until the baby is born, which ends it.',
        ],
        loop: {
          sign: 'positive',
          back: 'positive feedback',
          steps: [
            { role: 'Stimulus', text: 'The baby’s head stretches the cervix.' },
            { role: 'Sensor', text: 'Stretch receptors send signals to the brain.' },
            { role: 'Control center', text: 'The pituitary gland releases oxytocin.' },
            { role: 'Effector', text: 'The muscles of the uterus contract harder.' },
            { role: 'Response', text: 'The head stretches the cervix more.' },
          ],
        },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.homeostasis~systems',
    title: 'Which body system does it?',
    use: 'Use this for “Which organ system filters the blood and controls the water in it?”',
    assumptions: [
      'The nervous and endocrine systems coordinate the rest: nerves by fast signals, glands by hormones in the blood.',
      'Body systems work together to keep homeostasis.',
    ],
    question: 'Which system does the job?',
    bins: [
      { id: 'nervous', label: 'Nervous', why: 'Neurons carry fast electrical signals.' },
      { id: 'endocrine', label: 'Endocrine', why: 'Glands release hormones into the blood.' },
      { id: 'circulatory', label: 'Circulatory', why: 'Blood carries gases, food and heat.' },
      { id: 'respiratory', label: 'Respiratory', why: 'The lungs trade O₂ and CO₂ with the air.' },
      {
        id: 'excretory',
        label: 'Excretory',
        why: 'The kidneys remove wastes and set the blood’s water.',
      },
      { id: 'digestive', label: 'Digestive', why: 'Food is broken down and absorbed.' },
    ],
    cards: [
      { label: 'Neurons carry signals from sense receptors', bin: 'nervous' },
      { label: 'A reflex pulls a hand away from heat', bin: 'nervous' },
      { label: 'The pancreas releases insulin', bin: 'endocrine' },
      { label: 'Adrenal glands release adrenaline', bin: 'endocrine' },
      { label: 'Red blood cells carry oxygen', bin: 'circulatory' },
      { label: 'Skin blood vessels widen to release heat', bin: 'circulatory' },
      { label: 'Alveoli exchange O₂ and CO₂', bin: 'respiratory' },
      { label: 'Faster breathing removes extra CO₂', bin: 'respiratory' },
      { label: 'Kidneys filter urea from the blood', bin: 'excretory' },
      { label: 'Kidneys adjust the water in urine', bin: 'excretory' },
      { label: 'Enzymes break food into small molecules', bin: 'digestive' },
      { label: 'The small intestine absorbs glucose', bin: 'digestive' },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.homeostasis~feedback-types',
    title: 'Negative or positive feedback?',
    use: 'Use this for “Once blood sodium is normal, the hormone stops. What kind of feedback is it?”',
    assumptions: [
      'Negative feedback works against a change and stops when the set point returns.',
      'Positive feedback adds to a change until an event, such as a birth, ends it.',
    ],
    question: 'Does the response undo the change or add to it?',
    bins: [
      {
        id: 'negative',
        label: 'Negative feedback',
        why: 'The response undoes the change, keeping a value near its set point.',
      },
      {
        id: 'positive',
        label: 'Positive feedback',
        why: 'The response makes the change bigger, until something ends it.',
      },
    ],
    cards: [
      { label: 'Sweating when hot', bin: 'negative' },
      { label: 'Shivering when cold', bin: 'negative' },
      { label: 'Insulin after a meal', bin: 'negative' },
      { label: 'Glucagon between meals', bin: 'negative' },
      { label: 'ADH when dehydrated', bin: 'negative' },
      { label: 'Aldosterone stops once blood sodium is normal', bin: 'negative' },
      { label: 'Contractions during childbirth', bin: 'positive' },
      { label: 'Platelets calling more platelets to a cut', bin: 'positive' },
      { label: 'Ripe fruit releasing ethylene that ripens nearby fruit', bin: 'positive' },
    ],
  },
  {
    kind: 'observe',
    id: 's.9.homeostasis~blood-glucose',
    title: 'Blood glucose after a meal',
    use: 'Use this to record or read blood glucose after a meal and see insulin bring it back.',
    assumptions: [
      'A healthy fasting level is about 70–99 mg/dL; these values are typical, not a diagnosis.',
      'Insulin from the pancreas lets cells take in glucose, so the level falls back.',
    ],
    columns: ['0 min', '30 min', '60 min', '90 min', '120 min', '150 min'],
    rowLabel: 'Blood glucose',
    unit: 'mg/dL',
    max: 200,
    step: 5,
    initial: [85, 135, 120, 100, 90, 85],
    pattern: (v) => {
      const peak = Math.max(...v);
      const at = v.indexOf(peak);
      const last = v[v.length - 1]!;
      if (at > 0 && at < v.length - 1 && last < peak)
        return `Glucose peaks at ${peak} mg/dL ${at * 30} minutes after the meal, then insulin brings it back near ${last}.`;
      if (v.every((x) => x === v[0]))
        return 'The level stayed flat; after a real meal it rises first, then falls back.';
      return 'A healthy curve rises after the meal, peaks, then falls back as insulin acts.';
    },
  },
];

const IMMUNE: LayoutDef[] = [
  // ── Disease and the immune system (HS-LS1-2, HS-LS1-3) ──
  {
    kind: 'sort',
    id: 's.9.immune-disease~pathogens',
    title: 'Kinds of pathogens',
    use: 'Use this for “Strep throat or the flu: which one can an antibiotic treat?”',
    assumptions: [
      'A pathogen is anything that causes disease: a virus, a bacterium, a fungus or a parasite.',
      'Bacteria, fungi and parasites are cells; a virus is not, and copies itself only inside a host cell.',
      'Antibiotics work on bacteria only: they do nothing to viruses.',
    ],
    question: 'What kind of pathogen causes it?',
    bins: [
      {
        id: 'virus',
        label: 'Virus',
        why: 'Genes in a protein coat, copied only inside a host’s cells.',
      },
      { id: 'bacterium', label: 'Bacterium', why: 'A single cell with no nucleus.' },
      {
        id: 'fungus',
        label: 'Fungus',
        why: 'Cells with a nucleus and a wall, living on the host.',
      },
      {
        id: 'parasite',
        label: 'Parasite',
        why: 'A protist or an animal that lives on or in the host.',
      },
    ],
    cards: [
      { label: 'A virus', bin: 'virus', figure: { kind: 'icon', icon: 'virus' } },
      { label: 'Influenza', bin: 'virus' },
      { label: 'Measles', bin: 'virus' },
      { label: 'The common cold', bin: 'virus' },
      { label: 'A bacterium', bin: 'bacterium', figure: { kind: 'icon', icon: 'bacterium' } },
      { label: 'Strep throat', bin: 'bacterium' },
      { label: 'Tuberculosis', bin: 'bacterium' },
      { label: 'A fungus', bin: 'fungus', figure: { kind: 'icon', icon: 'fungus' } },
      { label: 'Athlete’s foot', bin: 'fungus' },
      { label: 'Ringworm', bin: 'fungus' },
      { label: 'A parasite', bin: 'parasite', figure: { kind: 'icon', icon: 'parasite' } },
      { label: 'Malaria', bin: 'parasite' },
      { label: 'Tapeworm', bin: 'parasite' },
    ],
  },
  {
    kind: 'explore',
    id: 's.9.immune-disease~stages',
    title: 'The immune response in stages',
    use: 'Use this for “Put the steps of the adaptive immune response in order.”',
    assumptions: [
      'An antigen is a molecule on a pathogen that the immune system recognizes as foreign.',
      'The response is specific: only the B and T cells whose receptors fit that antigen are chosen.',
    ],
    figure: { kind: 'immuneStages' },
    scenes: [
      {
        label: 'The whole response',
        lines: [
          'The response runs from the antigen to antibodies and killer T cells, and leaves memory cells.',
        ],
        immune: {},
      },
      {
        label: 'Antigen',
        lines: [
          'A macrophage engulfs a pathogen and breaks it down.',
          'It shows a piece of the pathogen, the antigen, on its surface.',
        ],
        immune: { stage: 'antigen' },
      },
      {
        label: 'Helper T cells',
        lines: [
          'A helper T cell whose receptor fits the antigen is switched on, and it signals B cells and killer T cells.',
        ],
        immune: { stage: 'helperT' },
      },
      {
        label: 'B cells',
        lines: ['A B cell that fits the antigen divides many times into plasma cells.'],
        immune: { stage: 'bCells' },
      },
      {
        label: 'Antibodies',
        lines: [
          'Plasma cells release antibodies, proteins that bind the antigen and mark the pathogen.',
          'Marked pathogens clump together, and macrophages eat them.',
        ],
        immune: { stage: 'antibodies' },
      },
      {
        label: 'Killer T cells',
        lines: ['Killer T cells find body cells infected by the pathogen and destroy them.'],
        immune: { stage: 'killerT' },
      },
      {
        label: 'Memory cells',
        lines: [
          'Some B and T cells stay as memory cells for years.',
          'They make a second response faster and stronger: the idea behind vaccines.',
        ],
        immune: { stage: 'memory' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.immune-disease~defenses',
    title: 'Innate or adaptive defense?',
    use: 'Use this for “Is a fever part of the innate or the adaptive immune response?”',
    assumptions: [
      'Innate defenses act the same way against any invader, within minutes or hours.',
      'Adaptive defenses target one antigen, take days the first time and remember it afterward.',
    ],
    question: 'Which kind of defense is it?',
    bins: [
      {
        id: 'innate',
        label: 'Innate (first and second lines)',
        why: 'Barriers and general responses that meet every invader alike.',
      },
      {
        id: 'adaptive',
        label: 'Adaptive',
        why: 'B and T cells chosen for one antigen, and the memory they leave.',
      },
    ],
    cards: [
      { label: 'Skin', bin: 'innate' },
      { label: 'Mucus and cilia', bin: 'innate' },
      { label: 'Stomach acid', bin: 'innate' },
      { label: 'Fever', bin: 'innate' },
      { label: 'Inflammation', bin: 'innate' },
      { label: 'Phagocytes engulfing any invader', bin: 'innate' },
      { label: 'Antibodies from B cells', bin: 'adaptive' },
      { label: 'Killer T cells', bin: 'adaptive' },
      { label: 'Memory cells', bin: 'adaptive' },
      { label: 'A vaccine’s protection', bin: 'adaptive' },
    ],
  },
];

export const SCIENCE_9_LAYOUTS: LayoutDef[] = [
  ...BIOMOLECULES,
  ...MEMBRANE,
  ...ENERGY,
  ...DIVISION,
  ...INHERITANCE,
  ...DNA,
  ...BIOTECH,
  ...EVOLUTION,
  ...CLASSIFICATION,
  ...POPULATION,
  ...ECOSYSTEMS,
  ...HOMEOSTASIS,
  ...IMMUNE,
];
