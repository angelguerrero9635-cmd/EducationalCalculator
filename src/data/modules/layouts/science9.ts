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
      'Hydrogen bonds, between water molecules or with other polar surfaces, cause all five properties here.',
    ],
    question: 'Which property of water explains it?',
    bins: [
      {
        id: 'cohesion',
        label: 'Cohesion (surface tension)',
        why: 'Water molecules cling to each other, so the surface holds together.',
      },
      {
        id: 'adhesion',
        label: 'Adhesion (capillary action)',
        why: 'Water molecules cling to other polar surfaces, so water climbs narrow spaces.',
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
      { label: 'Water climbs up a paper towel', bin: 'adhesion' },
      { label: 'Water creeps up a thin glass tube', bin: 'adhesion' },
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
    intro:
      'Each group’s picture shows the membrane, outside above, and how the particles cross it.',
    bins: [
      {
        id: 'simple',
        label: 'Simple diffusion',
        why: 'Small nonpolar molecules slip between the phospholipids, from more to fewer.',
        figure: { kind: 'icon', icon: 'simple diffusion' },
      },
      {
        id: 'facilitated',
        label: 'Facilitated diffusion',
        why: 'A channel or carrier protein lets it through, still from more to fewer, with no ATP.',
        figure: { kind: 'icon', icon: 'channel protein' },
      },
      {
        id: 'osmosis',
        label: 'Osmosis',
        why: 'Water crosses, through aquaporins, toward the side with more solute.',
        figure: { kind: 'icon', icon: 'aquaporin' },
      },
      {
        id: 'active',
        label: 'Active transport',
        why: 'A pump moves it from fewer to more, against the gradient, spending ATP.',
        figure: { kind: 'icon', icon: 'protein pump' },
      },
      {
        id: 'bulk',
        label: 'Bulk transport',
        why: 'Large particles or many molecules move inside vesicles made from membrane.',
        figure: { kind: 'icon', icon: 'vesicle transport' },
      },
    ],
    cards: [
      { label: 'O₂ enters a lung cell', bin: 'simple' },
      { label: 'CO₂ leaves a muscle cell', bin: 'simple' },
      { label: 'Glucose enters a red blood cell through a carrier protein', bin: 'facilitated' },
      { label: 'K⁺ leaves through an open channel, high to low', bin: 'facilitated' },
      { label: 'Water moves into a root cell from wetter soil', bin: 'osmosis' },
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
  {
    kind: 'sort',
    id: 's.9.mitosis-meiosis~checkpoints',
    title: 'Which checkpoint stops it?',
    use: 'Use this for “A cell’s DNA is damaged before it is copied. Where in the cycle is it stopped?”',
    assumptions: [
      'Checkpoints are proteins that check the cell before it moves on to the next phase.',
      'A cell that fails a check pauses to repair the problem, or destroys itself by apoptosis.',
    ],
    question: 'Which checkpoint catches it?',
    bins: [
      {
        id: 'g1',
        label: 'G1 checkpoint (before S)',
        why: 'Checks the cell’s size, nutrients, growth signals and DNA before it is copied.',
      },
      {
        id: 'g2',
        label: 'G2 checkpoint (before M)',
        why: 'Checks that all the DNA was copied, and copied without damage.',
      },
      {
        id: 'm',
        label: 'M checkpoint (at metaphase)',
        why: 'Checks that every chromosome is attached to the spindle before sisters separate.',
      },
    ],
    cards: [
      { label: 'The cell is still too small to divide', bin: 'g1' },
      { label: 'No growth factor has signaled the cell to divide', bin: 'g1' },
      { label: 'Sunlight damaged the DNA before it was copied', bin: 'g1' },
      { label: 'Part of one chromosome was not replicated', bin: 'g2' },
      { label: 'A copying error was left in the new DNA', bin: 'g2' },
      { label: 'One chromosome is not attached to spindle fibers', bin: 'm' },
      { label: 'The chromosomes are not all lined up at the middle', bin: 'm' },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.mitosis-meiosis~cancer',
    title: 'Normal cell or cancer cell?',
    use: 'Use this for “How does a cancer cell differ from a normal body cell?”',
    assumptions: [
      'Cancer starts when mutations damage the genes that control the cell cycle.',
      'A mutated proto-oncogene acts like a stuck accelerator; a broken tumor-suppressor gene, like failed brakes.',
      'Mutations add up over time, so most cancers need several of them.',
    ],
    question: 'Does it describe a normal cell or a cancer cell?',
    bins: [
      {
        id: 'normal',
        label: 'Normal cell',
        why: 'Its checkpoints and signals control when it divides and when it dies.',
      },
      {
        id: 'cancer',
        label: 'Cancer cell',
        why: 'It divides out of control and ignores the signals and checks that stop other cells.',
      },
    ],
    cards: [
      { label: 'Stops dividing when crowded by its neighbors', bin: 'normal' },
      { label: 'Divides only when a growth factor signals it', bin: 'normal' },
      { label: 'Destroys itself when its DNA is badly damaged', bin: 'normal' },
      { label: 'Stays in its own tissue', bin: 'normal' },
      { label: 'Keeps dividing and piles up into a tumor', bin: 'cancer' },
      { label: 'Divides with no growth factor signal', bin: 'cancer' },
      { label: 'Keeps dividing although its DNA is damaged', bin: 'cancer' },
      { label: 'Spreads through the blood to other organs', bin: 'cancer' },
    ],
  },
];

const REPRODUCTION: LayoutDef[] = [
  // ── Reproduction and development (HS-LS1-4, HS-LS3-2) ──
  {
    kind: 'sequence',
    id: 's.9.reproduction-development',
    assumptions: [
      'An egg and a sperm are haploid; together they make a diploid zygote, which divides by mitosis.',
      'Every cell has the same DNA, but different cells turn on different genes: they differentiate.',
    ],
    question: 'Put the stages of animal development in order, from fertilization.',
    stages: [
      {
        label: 'Fertilization: a sperm joins an egg, making a zygote',
        figure: { kind: 'icon', icon: 'zygote' },
      },
      {
        label: 'Cleavage: the zygote divides into a solid ball of cells',
        figure: { kind: 'icon', icon: 'morula' },
      },
      {
        label: 'Blastula: a hollow ball of cells forms',
        figure: { kind: 'icon', icon: 'blastula' },
      },
      {
        label: 'Gastrulation: the cells fold in to form three germ layers',
        figure: { kind: 'icon', icon: 'gastrula' },
      },
      { label: 'Organogenesis: the germ layers form tissues and organs' },
      { label: 'The embryo grows until birth or hatching' },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.reproduction-development~sexual-asexual',
    title: 'Sexual or asexual reproduction?',
    use: 'Use this for “Why do offspring from sexual reproduction differ from both parents?”',
    assumptions: [
      'Asexual reproduction needs one parent, and the offspring are clones: their DNA matches the parent’s.',
      'Sexual reproduction joins two gametes made by meiosis, so each offspring gets a new mix of both parents’ DNA.',
    ],
    question: 'Is it sexual or asexual reproduction?',
    bins: [
      {
        id: 'asexual',
        label: 'Asexual',
        why: 'One parent, mitosis or splitting: offspring identical to the parent.',
      },
      {
        id: 'sexual',
        label: 'Sexual',
        why: 'An egg and a sperm join: offspring differ from each parent and each other.',
      },
    ],
    cards: [
      { label: 'A bacterium splits in two', bin: 'asexual' },
      { label: 'A hydra grows a bud that breaks off', bin: 'asexual' },
      { label: 'A strawberry plant sends out runners', bin: 'asexual' },
      { label: 'A piece of a flatworm regrows into a whole worm', bin: 'asexual' },
      { label: 'Frogs release eggs and sperm into a pond', bin: 'sexual' },
      { label: 'Pollen carried to another flower’s stigma', bin: 'sexual' },
      { label: 'Siblings with different eye colors', bin: 'sexual' },
      { label: 'Offspring vary, so some may survive a new disease', bin: 'sexual' },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.reproduction-development~germ-layers',
    title: 'Which germ layer forms it?',
    use: 'Use this for “Which germ layer forms the brain and spinal cord?”',
    assumptions: [
      'Gastrulation folds the early embryo into three germ layers: outer, middle and inner.',
      'Each layer’s cells differentiate into its own set of tissues and organs.',
    ],
    question: 'Which germ layer does it come from?',
    bins: [
      {
        id: 'ecto',
        label: 'Ectoderm (outer)',
        why: 'The outer layer makes the skin’s surface and the whole nervous system.',
      },
      {
        id: 'meso',
        label: 'Mesoderm (middle)',
        why: 'The middle layer makes muscle, bone, blood, the heart and the kidneys.',
      },
      {
        id: 'endo',
        label: 'Endoderm (inner)',
        why: 'The inner layer lines the gut and the lungs, and makes the liver and pancreas.',
      },
    ],
    cards: [
      { label: 'Brain and spinal cord', bin: 'ecto' },
      { label: 'Outer layer of the skin', bin: 'ecto' },
      { label: 'Lens of the eye', bin: 'ecto' },
      { label: 'Heart and blood vessels', bin: 'meso' },
      { label: 'Bones and skeletal muscle', bin: 'meso' },
      { label: 'Kidneys', bin: 'meso' },
      { label: 'Lining of the stomach and intestines', bin: 'endo' },
      { label: 'Lining of the lungs', bin: 'endo' },
      { label: 'Liver and pancreas', bin: 'endo' },
    ],
  },
  {
    kind: 'sequence',
    id: 's.9.reproduction-development~menstrual-cycle',
    title: 'The menstrual cycle',
    use: 'Use this for “Why does menstruation stop during pregnancy?”',
    assumptions: [
      'Hormones from the brain (FSH and LH) and the ovary (estrogen and progesterone) run the cycle.',
      'If an embryo implants, it makes the hormone hCG, which keeps progesterone high, so the lining stays and menstruation stops.',
      'The days are for a typical 28-day cycle; real cycles vary.',
    ],
    question: 'Put the phases of the menstrual cycle in order, from day 1.',
    stages: [
      { label: 'Menstruation: progesterone is low, so the uterine lining is shed', span: 5 },
      {
        label: 'Follicular phase: FSH grows a follicle, whose estrogen rebuilds the lining',
        span: 8,
      },
      { label: 'Ovulation: a surge of LH releases the egg', span: 1 },
      {
        label:
          'Luteal phase: the empty follicle (corpus luteum) makes progesterone, which keeps the lining',
        span: 14,
      },
    ],
    unit: 'days',
    totalLabel: 'One typical cycle',
  },
  {
    kind: 'observe',
    id: 's.9.reproduction-development~hormones',
    title: 'Hormone levels through a cycle',
    use: 'Use this for “Which hormone keeps the uterine lining in the second half of the cycle?”',
    assumptions: [
      'Levels are shown as a share of each hormone’s highest level, 0 to 100.',
      'The days are for a typical 28-day cycle; real cycles vary.',
    ],
    columns: ['Day 1', 'Day 7', 'Day 14', 'Day 21', 'Day 28'],
    rowLabel: 'Estrogen',
    unit: '% of peak',
    max: 100,
    step: 5,
    // Each hormone reaches its own highest level, 100, on one of the days shown.
    initial: [10, 40, 100, 50, 15],
    second: { rowLabel: 'Progesterone', initial: [5, 5, 10, 100, 10] },
    pattern: (e, p = []) => {
      const ei = e.indexOf(Math.max(...e));
      const pi = p.indexOf(Math.max(...p));
      const days = ['day 1', 'day 7', 'day 14', 'day 21', 'day 28'];
      if (pi > ei)
        return `Estrogen peaks first, by ${days[ei]}, rebuilding the lining; progesterone peaks later, by ${days[pi]}, keeping it.`;
      return `Here progesterone peaks by ${days[pi]}, before estrogen: in a real cycle estrogen leads, before ovulation.`;
    },
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
      'Tests often write these as AA, AO, BB, BO, AB and OO.',
    ],
    question: 'Which blood type does the genotype give?',
    intro: 'Three alleles: Iᴬ and Iᴮ are codominant, and i is recessive to both.',
    bins: [
      {
        id: 'A',
        label: 'Type A',
        why: 'At least one Iᴬ and no Iᴮ: i is hidden.',
        figure: { kind: 'icon', icon: 'blood type A' },
      },
      {
        id: 'B',
        label: 'Type B',
        why: 'At least one Iᴮ and no Iᴬ: i is hidden.',
        figure: { kind: 'icon', icon: 'blood type B' },
      },
      {
        id: 'AB',
        label: 'Type AB',
        why: 'Codominance: both A and B markers show on the cells.',
        figure: { kind: 'icon', icon: 'blood type AB' },
      },
      {
        id: 'O',
        label: 'Type O',
        why: 'Two recessive i alleles: no A or B marker.',
        figure: { kind: 'icon', icon: 'blood type O' },
      },
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
      'In the pictures the old strands are dark and the new ones lit.',
    ],
    question: 'Put the steps of DNA replication in order.',
    stages: [
      {
        label: 'Helicase unzips the double helix at an origin',
        figure: { kind: 'replication', stage: 'unzip' },
      },
      {
        label:
          'DNA polymerase adds matching nucleotides along each old strand, A with T and G with C',
        figure: { kind: 'replication', stage: 'pair' },
      },
      {
        label: 'Ligase seals the gaps between the new pieces',
        figure: { kind: 'replication', stage: 'join' },
      },
      {
        label: 'Two DNA molecules, each with one old strand and one new',
        figure: { kind: 'replication', stage: 'copies' },
      },
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
    id: 's.9.biotechnology~mutation-types',
    title: 'Silent, missense, nonsense or frameshift?',
    use: 'Use this for “The codon GAA changes to GUA. What kind of mutation is it?”',
    assumptions: [
      'Each card is one change to an mRNA codon, with the amino acid it codes before and after.',
      'A substitution swaps one base for another; an insertion or deletion adds or removes bases.',
      'Several codons code the same amino acid, so some substitutions change nothing in the protein.',
    ],
    question: 'Which kind of mutation is it?',
    bins: [
      {
        id: 'silent',
        label: 'Silent',
        why: 'The new codon codes the same amino acid, so the protein does not change.',
      },
      {
        id: 'missense',
        label: 'Missense',
        why: 'The new codon codes a different amino acid: one amino acid in the chain changes.',
      },
      {
        id: 'nonsense',
        label: 'Nonsense',
        why: 'The new codon is a stop codon, so the chain ends early and is usually useless.',
      },
      {
        id: 'frameshift',
        label: 'Frameshift',
        why: 'Adding or removing 1 or 2 bases shifts the reading frame: every codon after it changes.',
      },
    ],
    cards: [
      { label: 'GGU (Gly) → GGC (Gly)', bin: 'silent' },
      { label: 'CUA (Leu) → CUG (Leu)', bin: 'silent' },
      { label: 'GAA (Glu) → GUA (Val)', bin: 'missense' },
      { label: 'AAA (Lys) → AGA (Arg)', bin: 'missense' },
      { label: 'UAC (Tyr) → UAA (stop)', bin: 'nonsense' },
      { label: 'CAG (Gln) → UAG (stop)', bin: 'nonsense' },
      { label: 'One base deleted from codon 2', bin: 'frameshift' },
      { label: 'Two bases inserted after codon 5', bin: 'frameshift' },
    ],
  },
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
  {
    kind: 'explore',
    id: 's.9.biotechnology~gene-expression',
    title: 'Genes switched on and off',
    use: 'Use this for “Why does a bacterium make the enzymes for lactose only when lactose is there?”',
    assumptions: [
      'Every cell has the same genes, but it reads only some of them: those genes are expressed.',
      'RNA polymerase binds the promoter in front of a gene and copies the gene into mRNA.',
      'Proteins on the DNA near the promoter switch the gene off (repressors) or on (activators).',
    ],
    figure: { kind: 'geneExpression' },
    scenes: [
      {
        label: 'Repressor on',
        lines: [
          'With no lactose, the repressor sits on the operator and blocks RNA polymerase.',
          'The gene is off: no mRNA, so no lactose enzymes are wasted.',
        ],
        gene: { control: 'repressor', lit: 'protein' },
      },
      {
        label: 'Lactose arrives',
        lines: [
          'Lactose binds the repressor and changes its shape, so it lets go of the operator.',
          'The gene is on: RNA polymerase reads it into mRNA.',
        ],
        gene: { control: 'repressor', signal: true, lit: 'signal' },
      },
      {
        label: 'The promoter',
        lines: [
          'RNA polymerase always starts at the promoter, the stretch just in front of the gene.',
        ],
        gene: { control: 'repressor', signal: true, lit: 'promoter' },
      },
      {
        label: 'No activator',
        lines: [
          'Some genes need an activator: without its signal the activator stays off the DNA.',
          'The gene is off: the polymerase does not start.',
        ],
        gene: { control: 'activator', lit: 'switch' },
      },
      {
        label: 'Activator bound',
        lines: [
          'With its signal the activator binds in front of the promoter and helps the polymerase on.',
          'The gene is on.',
        ],
        gene: { control: 'activator', signal: true, lit: 'mRNA' },
      },
    ],
  },
  {
    kind: 'explore',
    id: 's.9.biotechnology~fingerprint',
    title: 'DNA fingerprinting',
    use: 'Use this for “Which suspect’s DNA matches the evidence?” or “Could this man be the father?”',
    assumptions: [
      'Restriction enzymes cut DNA at set sequences; the lengths of the pieces differ from person to person.',
      'Only identical twins share every band; a child gets each band from the mother or the father.',
      'The pieces run through a gel toward +, the shorter ones farther.',
    ],
    figure: {
      kind: 'gel',
      ladder: [10000, 5000, 2000, 1000, 500, 250],
      lanes: [
        { label: 'Evidence', bands: [8200, 4100, 2300, 900] },
        { label: 'Suspect 1', bands: [7000, 4100, 1600, 600] },
        { label: 'Suspect 2', bands: [8200, 4100, 2300, 900] },
        { label: 'Suspect 3', bands: [9000, 3000, 2300, 450] },
        { label: 'Mother', bands: [6500, 3600, 1800, 700] },
        { label: 'Child', bands: [6500, 2800, 1800, 400] },
        { label: 'Man A', bands: [5200, 2800, 1200, 400] },
        { label: 'Man B', bands: [5200, 3200, 1100, 550] },
      ],
    },
    scenes: [
      {
        label: 'The gel',
        lines: [
          'DNA from blood at the scene and from three suspects is cut by the same enzyme and run side by side.',
          'The ladder’s pieces of known length give the scale.',
        ],
        gel: { lanes: ['Evidence', 'Suspect 1', 'Suspect 2', 'Suspect 3'] },
      },
      {
        label: 'Compare',
        lines: [
          'Dashed lines carry the evidence’s bands across the gel.',
          'Suspects 1 and 3 share one band each with it: many people share a band or two, so that is not a match.',
        ],
        gel: {
          lanes: ['Evidence', 'Suspect 1', 'Suspect 2', 'Suspect 3'],
          lit: ['Suspect 1', 'Suspect 2', 'Suspect 3'],
          compare: 'Evidence',
        },
      },
      {
        label: 'A match',
        lines: [
          // (The gel's own line already says Suspect 2 matches in every band.)
          'Real tests compare 20 or so places in the DNA, so a full match is very unlikely by chance.',
        ],
        gel: {
          lanes: ['Evidence', 'Suspect 1', 'Suspect 2', 'Suspect 3'],
          lit: ['Suspect 2'],
          compare: 'Evidence',
        },
      },
      {
        label: 'A family',
        lines: [
          'The child’s bands that match the mother are red; the rest must come from the father.',
          'Man A has both of the others, in blue, so he could be the father.',
        ],
        gel: {
          lanes: ['Mother', 'Child', 'Man A', 'Man B'],
          lit: ['Child'],
          compare: 'Child',
          parents: ['Mother', 'Man A'],
        },
      },
      {
        label: 'Ruled out',
        lines: [
          'Two of the child’s bands are in neither the mother nor Man B.',
          'So Man B is ruled out as the father, whatever bands he shares with Man A.',
        ],
        gel: {
          lanes: ['Mother', 'Child', 'Man A', 'Man B'],
          lit: ['Child'],
          compare: 'Child',
          parents: ['Mother', 'Man B'],
        },
      },
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
      {
        label: 'An insect’s wing beside a bat’s wing',
        bin: 'analogous',
        figure: { kind: 'icon', icon: 'insect wing' },
      },
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
          'The jellyfish and the earthworm alone are not a clade: their last common ancestor is also the ancestor of the sea star, fish and human, which the group leaves out.',
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
    ],
    question: 'Which domain does it belong to?',
    intro: 'Viruses are not cells, so they are not placed in any domain.',
    bins: [
      {
        id: 'bacteria',
        label: 'Bacteria',
        why: 'Prokaryotes with cell walls made of peptidoglycan.',
        figure: { kind: 'icon', icon: 'domain Bacteria' },
      },
      {
        id: 'archaea',
        label: 'Archaea',
        why: 'Prokaryotes whose walls and membranes are built differently from bacteria’s.',
        figure: { kind: 'icon', icon: 'domain Archaea' },
      },
      {
        id: 'eukarya',
        label: 'Eukarya',
        why: 'Every cell has a nucleus inside a membrane.',
        figure: { kind: 'icon', icon: 'domain Eukarya' },
      },
    ],
    cards: [
      { label: 'E. coli in the gut', bin: 'bacteria' },
      { label: 'Streptococcus that causes strep throat', bin: 'bacteria' },
      { label: 'Cyanobacteria in a pond', bin: 'bacteria' },
      { label: 'Methane-making microbes in a cow’s stomach', bin: 'archaea' },
      { label: 'Halobacterium in a salt pond', bin: 'archaea' },
      { label: 'Paramecium (protist)', bin: 'eukarya' },
      { label: 'Mushrooms (fungi)', bin: 'eukarya' },
      { label: 'A leafy plant', bin: 'eukarya' },
      { label: 'A fish (animal)', bin: 'eukarya' },
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
  {
    kind: 'explore',
    id: 's.9.classification~key',
    title: 'A dichotomous key',
    use: 'Use this for “Use the key to name the animal: it has no backbone and a segmented body.”',
    assumptions: [
      'A dichotomous key asks one yes-or-no question at a time about a trait you can see.',
      'Each answer leads to the next question or to a name, so every path ends at one organism.',
    ],
    figure: {
      kind: 'dichotomousKey',
      steps: [
        { question: 'Does it have a backbone?', yes: 1, no: 2 },
        { question: 'Does it have hair?', yes: 'Human', no: 'Fish' },
        { question: 'Does it have true tissues?', yes: 3, no: 'Sponge' },
        { question: 'Is its body divided into segments?', yes: 'Earthworm', no: 4 },
        { question: 'Does it have stinging tentacles?', yes: 'Jellyfish', no: 'Sea star' },
      ],
    },
    scenes: [
      {
        label: 'The first question',
        lines: [
          'Every animal starts at the top: a backbone or not splits the six into two groups.',
        ],
        key: { step: 0 },
      },
      {
        label: 'Earthworm',
        lines: [
          'No backbone, true tissues, a segmented body: three answers lead to the earthworm.',
        ],
        key: { specimen: 'Earthworm' },
      },
      {
        label: 'Sea star',
        lines: ['No backbone, true tissues, no segments and no stinging tentacles: a sea star.'],
        key: { specimen: 'Sea star' },
      },
      {
        label: 'Human',
        lines: ['A backbone and hair: two questions are enough for a mammal.'],
        key: { specimen: 'Human' },
      },
    ],
  },
];

const PLANTS: LayoutDef[] = [
  // ── Plants: structure, transport, growth and reproduction (HS-LS1-2, HS-LS1-5) ──
  {
    kind: 'explore',
    id: 's.9.plant-biology',
    assumptions: [
      'A flowering plant’s organs are its roots, stem, leaves and flowers; tap one to read its job.',
      'Xylem carries water and minerals up from the roots; phloem carries sugar from the leaves to where it is used.',
    ],
    figure: {
      kind: 'parts',
      drawing: 'plant',
      parts: [
        {
          name: 'Roots',
          job: 'Anchor the plant and take in water and minerals through root hairs.',
        },
        { name: 'Stem', job: 'Holds up the leaves; its xylem and phloem carry water and sugar.' },
        {
          name: 'Leaves',
          job: 'Make sugar by photosynthesis; stomata let CO₂ in and water vapor out.',
        },
        {
          name: 'Flower',
          job: 'Makes pollen and eggs; after fertilization it forms seeds and fruit.',
        },
      ],
    },
    scenes: [
      {
        label: 'Roots',
        part: 'Roots',
        lines: [
          'Thousands of root hairs give the root a huge surface for taking in water and minerals.',
          'Water enters by osmosis, because the root’s cells hold more dissolved minerals than the soil water.',
        ],
      },
      {
        label: 'Stem',
        part: 'Stem',
        lines: [
          'Xylem tubes are made of dead cells that carry water and minerals up, one way.',
          'Living phloem cells carry sugar both ways: down to the roots and up to new leaves and fruit.',
        ],
      },
      {
        label: 'Leaves',
        part: 'Leaves',
        lines: [
          'Guard cells open the stomata to let CO₂ in, and water vapor escapes: transpiration.',
          'Water evaporating from the leaves pulls the next water up the xylem, since water molecules cling together.',
        ],
      },
      {
        label: 'Flower',
        part: 'Flower',
        lines: [
          'The anthers make pollen; the ovary holds the ovules, each with an egg.',
          'After fertilization each ovule becomes a seed, and the ovary becomes the fruit.',
        ],
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.plant-biology~xylem-phloem',
    title: 'Xylem or phloem?',
    use: 'Use this for “Which tissue carries sugar from the leaves to the roots?”',
    assumptions: [
      'Xylem and phloem run side by side in bundles through the roots, stem and leaves.',
      'Transpiration pulls water up the xylem; sugar is pushed through the phloem from a source to a sink.',
    ],
    question: 'Is it xylem or phloem?',
    bins: [
      {
        id: 'xylem',
        label: 'Xylem',
        why: 'Hollow tubes of dead cells carry water and minerals up from the roots.',
      },
      {
        id: 'phloem',
        label: 'Phloem',
        why: 'Living cells carry sugar from where it is made to where it is used or stored.',
      },
    ],
    cards: [
      { label: 'Carries water from the roots to the leaves', bin: 'xylem' },
      { label: 'Carries minerals such as nitrate up the plant', bin: 'xylem' },
      { label: 'Made of dead cells with thick walls', bin: 'xylem' },
      { label: 'Forms most of the wood of a tree', bin: 'xylem' },
      { label: 'Carries sugar from the leaves to the roots', bin: 'phloem' },
      { label: 'Carries sugar up to a growing fruit', bin: 'phloem' },
      { label: 'Made of living sieve-tube cells', bin: 'phloem' },
      { label: 'Aphids feed on its sugary sap', bin: 'phloem' },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.plant-biology~tropisms',
    title: 'Which tropism is it?',
    use: 'Use this for “Why does a houseplant bend toward the window?”',
    assumptions: [
      'A tropism is growth toward or away from a stimulus.',
      'The hormone auxin collects on one side of a shoot, where the cells lengthen, so the shoot bends.',
    ],
    question: 'Which stimulus is the plant responding to?',
    bins: [
      {
        id: 'photo',
        label: 'Phototropism (light)',
        why: 'Auxin gathers on the shaded side, which grows longer, so the shoot bends toward light.',
      },
      {
        id: 'gravi',
        label: 'Gravitropism (gravity)',
        why: 'Roots grow down with gravity and shoots grow up against it.',
      },
      {
        id: 'thigmo',
        label: 'Thigmotropism (touch)',
        why: 'Contact with an object makes the plant grow around it.',
      },
    ],
    cards: [
      { label: 'A houseplant bends toward the window', bin: 'photo' },
      { label: 'Sunflower seedlings lean toward the light', bin: 'photo' },
      { label: 'A seed’s root grows down however it is planted', bin: 'gravi' },
      { label: 'A pot on its side: the stem turns upward', bin: 'gravi' },
      { label: 'A pea tendril coils around a stick', bin: 'thigmo' },
      { label: 'A vine climbs by wrapping around a fence', bin: 'thigmo' },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.plant-biology~nutrients',
    title: 'Which nutrient is it?',
    use: 'Use this for “Why do farmers plant beans to add nitrogen to the soil?”',
    assumptions: [
      'Roots take up mineral nutrients dissolved in the soil water.',
      'A fertilizer label lists N, P and K, the three nutrients a plant needs most.',
    ],
    question: 'Which nutrient does it describe?',
    bins: [
      {
        id: 'n',
        label: 'Nitrogen (N)',
        why: 'Builds amino acids and proteins; plants take it up as nitrate or ammonium.',
      },
      {
        id: 'p',
        label: 'Phosphorus (P)',
        why: 'Builds the phosphate groups of ATP, DNA and cell membranes.',
      },
      {
        id: 'k',
        label: 'Potassium (K)',
        why: 'Keeps the water balance of cells and works the guard cells.',
      },
      {
        id: 'mg',
        label: 'Magnesium (Mg)',
        why: 'Sits at the center of every chlorophyll molecule.',
      },
    ],
    cards: [
      { label: 'Part of every amino acid', bin: 'n' },
      { label: 'Bacteria in bean root nodules turn N₂ from the air into it', bin: 'n' },
      { label: 'The phosphate groups in ATP', bin: 'p' },
      { label: 'Its cycle has no gas: weathering rock slowly frees it', bin: 'p' },
      { label: 'Moves in and out of guard cells to open and close stomata', bin: 'k' },
      { label: 'Short of it, leaf edges turn brown and scorched', bin: 'k' },
      { label: 'The atom at the center of chlorophyll', bin: 'mg' },
      { label: 'Short of it, leaves yellow between green veins', bin: 'mg' },
    ],
  },
  {
    kind: 'sequence',
    id: 's.9.plant-biology~life-cycle',
    title: 'A flowering plant’s life cycle',
    use: 'Use this for “Put these in order: pollination, fertilization, seed dispersal, germination.”',
    assumptions: [
      'Pollen carries the sperm; the egg is in an ovule inside the flower’s ovary.',
      'A seed holds an embryo and its food; the fruit around it helps spread it.',
    ],
    question: 'Put the stages in order, starting at the flower.',
    stages: [
      {
        label: 'Pollination: pollen lands on a stigma',
        figure: { kind: 'flowerCycle', stage: 'pollination' },
      },
      {
        label: 'A pollen tube grows down to an ovule',
        figure: { kind: 'flowerCycle', stage: 'pollen tube' },
      },
      {
        label: 'Fertilization: a sperm joins the egg',
        figure: { kind: 'flowerCycle', stage: 'fertilization' },
      },
      {
        label: 'The ovule becomes a seed, and the ovary a fruit',
        figure: { kind: 'flowerCycle', stage: 'seed and fruit' },
      },
      {
        label: 'Seed dispersal by wind, water or animals',
        figure: { kind: 'flowerCycle', stage: 'dispersal' },
      },
      {
        label: 'Germination: the root and shoot break out',
        figure: { kind: 'flowerCycle', stage: 'germination' },
      },
      {
        label: 'The seedling grows and flowers',
        figure: { kind: 'flowerCycle', stage: 'seedling' },
      },
    ],
  },
  {
    kind: 'explore',
    id: 's.9.plant-biology~flower',
    title: 'The parts of a flower',
    use: 'Use this for “Which part of the flower becomes the fruit?”',
    assumptions: [
      'The flower is cut in half from top to bottom, so the parts inside show.',
      'The stamen (anther and filament) is the male part; the pistil (stigma, style and ovary) is the female part.',
    ],
    figure: {
      kind: 'parts',
      drawing: 'flower',
      parts: [
        { name: 'Petal', job: 'Bright petals attract the insects and birds that carry pollen.' },
        { name: 'Sepal', job: 'Sepals wrap and protect the flower while it is a bud.' },
        { name: 'Anther', job: 'Makes pollen, which carries the sperm.' },
        { name: 'Filament', job: 'The stalk that holds the anther up.' },
        { name: 'Stigma', job: 'The sticky tip that catches pollen.' },
        { name: 'Style', job: 'The stalk a pollen tube grows down to reach the ovary.' },
        { name: 'Ovary', job: 'Holds the ovules; after fertilization it becomes the fruit.' },
        { name: 'Ovule', job: 'Holds an egg; after fertilization it becomes a seed.' },
      ],
    },
    scenes: [
      {
        label: 'Male parts',
        part: 'Anther',
        alsoLit: ['Filament'],
        lines: ['Each stamen is a filament with an anther on top, full of pollen.'],
      },
      {
        label: 'Female parts',
        part: 'Stigma',
        alsoLit: ['Style', 'Ovary'],
        lines: ['The pistil is the stigma, the style and the ovary at the base.'],
      },
      {
        label: 'Egg',
        part: 'Ovule',
        lines: ['Each ovule inside the ovary holds one egg cell.'],
      },
      {
        label: 'Fruit',
        part: 'Ovary',
        lines: ['After fertilization the ovules become seeds and the ovary swells into the fruit.'],
      },
      {
        label: 'Pollinators',
        part: 'Petal',
        lines: ['Colored petals, and often scent and nectar, bring pollinators to the flower.'],
      },
    ],
  },
];

/** Species B in the shared dish (~competition): it peaks, then is competed out. */
const COMPETITION_B = [10, 50, 70, 50, 20, 0];

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
  {
    kind: 'observe',
    id: 's.9.population-ecology~competition',
    title: 'Two species, one food',
    use: 'Use this for “Two protist species grow together in one dish. Which one wins, and why?”',
    assumptions: [
      'Two species that need the same food compete; the one that gets it faster grows, and the other shrinks.',
      'Grown apart, each species levels off at its own carrying capacity.',
      'When one species dies out in the shared dish, it has been competed out (competitive exclusion).',
    ],
    columns: ['Day 0', 'Day 4', 'Day 8', 'Day 12', 'Day 16', 'Day 20'],
    rowLabel: 'Species A',
    unit: 'per mL',
    max: 200,
    step: 10,
    initial: [10, 60, 130, 170, 180, 190],
    second: { rowLabel: 'Species B', initial: COMPETITION_B },
    pattern: (a, b = COMPETITION_B) => {
      const [la, lb] = [a[a.length - 1]!, b[b.length - 1]!];
      const peakB = Math.max(...b);
      if (lb === 0 && la > 0)
        return `Species B peaks at ${peakB} per mL, then dies out while species A reaches ${la}: A competes B out.`;
      if (la === 0 && lb > 0)
        return `Species A dies out while species B reaches ${lb}: B competes A out.`;
      if (la === 0 && lb === 0) return 'Both species die out: neither holds on to the food.';
      return `By the last day A has ${la} and B has ${lb} per mL: both still share the food.`;
    },
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
  {
    kind: 'explore',
    id: 's.9.ecosystem-dynamics~carbon',
    title: 'The carbon cycle and energy',
    use: 'Use this for “How do photosynthesis and respiration move carbon between the air and living things?”',
    assumptions: [
      'Photosynthesis, 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂, stores the Sun’s energy in sugar.',
      'Cellular respiration runs the same equation backward, releasing that energy and the carbon dioxide.',
      'Carbon atoms are never used up: they cycle, while energy flows through once and leaves as heat.',
    ],
    figure: { kind: 'carbonCycle' },
    scenes: [
      {
        label: 'The whole cycle',
        lines: [
          'Carbon is stored in the air as CO₂, in living things, in dead matter, in the ocean and in fossil fuels.',
          'Every arrow moves carbon from one store to another.',
        ],
        carbon: {},
      },
      {
        label: 'Photosynthesis',
        lines: [
          'Producers take in CO₂ and water and, with light energy, build glucose: carbon leaves the air.',
          'Six CO₂ molecules give the six carbon atoms of one glucose.',
        ],
        carbon: { process: 'photosynthesis' },
      },
      {
        label: 'Respiration',
        lines: [
          'Plants, animals and decomposers break glucose down with oxygen to make ATP.',
          'Each glucose returns six CO₂ to the air: the carbon photosynthesis took in.',
        ],
        carbon: { process: 'respiration' },
      },
      {
        label: 'Decomposition',
        lines: [
          'Fungi and bacteria respire the carbon in dead matter and wastes, returning it to the air as CO₂.',
        ],
        carbon: { process: 'decomposition' },
      },
      {
        label: 'Fossil fuels',
        lines: [
          'Buried dead matter became coal, oil and gas over millions of years.',
          'Burning them returns that old carbon to the air in years, faster than photosynthesis takes it back.',
        ],
        carbon: { process: 'burning' },
      },
      {
        label: 'The ocean',
        lines: [
          'The ocean dissolves CO₂ from the air and gives some back; it holds far more carbon than the air.',
          'Extra dissolved CO₂ makes seawater more acidic, which harms shell-building animals.',
        ],
        carbon: { process: 'dissolving' },
      },
    ],
  },
];

/** ~rainfall's monthly temperatures (°C): cold winters, warm summers. */
const RAINFALL_TEMPERATURE = [-5, -3, 3, 10, 16, 21, 24, 23, 18, 11, 4, -2];

const BIOMES: LayoutDef[] = [
  // ── Biomes and aquatic ecosystems (HS-LS2-1, HS-LS2-2) ──
  {
    kind: 'explore',
    id: 's.9.biomes',
    assumptions: [
      'A biome is a large region with a similar climate, and so similar plants and animals.',
      'Temperature and rainfall decide the biome; both change with latitude, and temperature with height.',
    ],
    figure: { kind: 'greenhouse' },
    scenes: [
      {
        label: 'Tropical',
        lines: [
          'Near the equator it is warm all year. With heavy rain all year: tropical rainforest, the most species of any biome.',
          'With a long dry season: savanna, grassland with scattered trees.',
        ],
        greenhouse: { view: 'zones', lit: 'tropical' },
      },
      {
        label: 'Deserts',
        lines: [
          'Near 30° north and south, dry air sinks, so the great deserts lie at the edge of the tropics.',
          'Deserts get under 25 cm of rain a year; cacti store water, and many animals come out at night.',
        ],
        greenhouse: { view: 'zones' },
      },
      {
        label: 'Temperate',
        lines: [
          'Warm summers and cold winters. With steady rain: temperate deciduous forest, whose trees drop their leaves in fall.',
          'With less rain: grassland, or prairie, whose deep roots survive drought and fire.',
          'Farther toward the poles: taiga, forests of conifers that keep their needles through long, cold winters.',
        ],
        greenhouse: { view: 'zones', lit: 'temperate' },
      },
      {
        label: 'Polar',
        lines: [
          'Tundra: too cold for trees. Only the top of the soil thaws in summer, above permafrost.',
          'Mosses, lichens and low shrubs grow in the short summer.',
        ],
        greenhouse: { view: 'zones', lit: 'polar' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.biomes~land',
    title: 'Which biome is it?',
    use: 'Use this for “Which biome has permafrost and no trees?”',
    assumptions: [
      'Each card describes a biome’s climate, its plants or its animals.',
      'Plants and animals have adaptations that suit their biome’s temperature and rainfall.',
    ],
    question: 'Which biome does it describe?',
    bins: [
      {
        id: 'rainforest',
        label: 'Tropical rainforest',
        why: 'Warm and wet all year.',
        figure: { kind: 'icon', icon: 'tropical rainforest' },
      },
      {
        id: 'desert',
        label: 'Desert',
        why: 'Under 25 cm of rain a year, hot or cold.',
        figure: { kind: 'icon', icon: 'desert' },
      },
      {
        id: 'grassland',
        label: 'Grassland',
        why: 'Too dry for many trees; grasses and fires.',
        figure: { kind: 'icon', icon: 'grassland' },
      },
      {
        id: 'deciduous',
        label: 'Temperate deciduous forest',
        why: 'Four seasons and steady rain; broad leaves fall in autumn.',
        figure: { kind: 'icon', icon: 'temperate deciduous forest' },
      },
      {
        id: 'taiga',
        label: 'Taiga',
        why: 'Long, cold winters; conifer forest.',
        figure: { kind: 'icon', icon: 'taiga' },
      },
      {
        id: 'tundra',
        label: 'Tundra',
        why: 'Very cold, no trees, permafrost below.',
        figure: { kind: 'icon', icon: 'tundra' },
      },
    ],
    cards: [
      { label: 'Layers of canopy trees, vines and orchids', bin: 'rainforest' },
      { label: 'Poor soil: dead leaves decay and are taken up fast', bin: 'rainforest' },
      { label: 'A cactus stores water in its thick stem', bin: 'desert' },
      { label: 'A kangaroo rat never needs to drink', bin: 'desert' },
      { label: 'Bison graze on the prairie', bin: 'grassland' },
      { label: 'Fires sweep through, and the grasses regrow from their roots', bin: 'grassland' },
      { label: 'Oaks and maples drop their leaves in fall', bin: 'deciduous' },
      { label: 'Spruce and fir forest with deep snow', bin: 'taiga' },
      { label: 'Moose and lynx through a long winter', bin: 'taiga' },
      { label: 'Permafrost lies under a thin summer soil', bin: 'tundra' },
      { label: 'Caribou graze lichens where no trees grow', bin: 'tundra' },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.biomes~aquatic',
    title: 'Which aquatic ecosystem is it?',
    use: 'Use this for “Where does fresh water mix with salt water?”',
    assumptions: [
      'Aquatic ecosystems are sorted by how salty the water is, how deep it is and how fast it moves.',
      'Sunlight reaches only the top 200 m or so of water, so producers live near the surface or the shore.',
    ],
    question: 'Which ecosystem does it describe?',
    bins: [
      { id: 'lake', label: 'Lake or pond', why: 'Still fresh water.' },
      { id: 'river', label: 'River or stream', why: 'Moving fresh water.' },
      { id: 'wetland', label: 'Wetland', why: 'Shallow water over soil for part of the year.' },
      { id: 'estuary', label: 'Estuary', why: 'Where a river’s fresh water meets the sea.' },
      { id: 'reef', label: 'Coral reef', why: 'Warm, clear, shallow sea water.' },
      { id: 'deep', label: 'Deep ocean', why: 'Salt water too deep for sunlight to reach.' },
    ],
    cards: [
      { label: 'Still water with lily pads and frogs', bin: 'lake' },
      { label: 'Trout in cold, fast-flowing water', bin: 'river' },
      { label: 'A marsh of cattails that filters runoff', bin: 'wetland' },
      { label: 'Brackish water where salmon pass from sea to river', bin: 'estuary' },
      { label: 'Oysters and young fish where a river meets the sea', bin: 'estuary' },
      { label: 'Colonies of tiny animals build limestone in warm, clear water', bin: 'reef' },
      { label: 'Anglerfish in total darkness', bin: 'deep' },
      { label: 'Life around hot vents, fed by bacteria rather than sunlight', bin: 'deep' },
    ],
  },
  {
    kind: 'observe',
    id: 's.9.biomes~rainfall',
    title: 'Rainfall and temperature by month',
    use: 'Use this to record a place’s rainfall and temperature each month and see which biome it suits.',
    assumptions: [
      'Rainfall is in millimeters: 10 mm is 1 cm of water over the ground.',
      'Temperature is the month’s average, in °C; bars below the line are below freezing.',
    ],
    columns: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    rowLabel: 'Rainfall',
    unit: 'mm',
    max: 400,
    step: 10,
    initial: [80, 70, 90, 90, 100, 100, 110, 100, 90, 80, 90, 90],
    second: {
      rowLabel: 'Temperature',
      unit: '°C',
      min: -30,
      max: 40,
      step: 1,
      initial: RAINFALL_TEMPERATURE,
    },
    pattern: (v, temp = RAINFALL_TEMPERATURE) => {
      const total = v.reduce((a, b) => a + b, 0);
      const wet = v.filter((x) => x >= 100).length;
      const dry = v.filter((x) => x < 20).length;
      const cm = Math.round(total / 10);
      const warmest = Math.max(...temp);
      const coldest = Math.min(...temp);
      if (warmest < 10)
        return `About ${cm} cm a year, and no month above 10 °C: too cold for trees, tundra.`;
      if (total < 250) return `About ${cm} cm a year: dry enough for a desert, hot or cold.`;
      if (coldest >= 18 && total >= 2000 && dry === 0)
        return `About ${cm} cm a year, wet and warm every month: a tropical rainforest.`;
      if (coldest >= 18 && dry >= 3 && wet >= 3)
        return `About ${cm} cm a year, warm all year with a long dry season: a savanna.`;
      if (coldest < -10)
        return `About ${cm} cm a year with long, freezing winters: taiga, a conifer forest.`;
      if (total < 750)
        return `About ${cm} cm a year: enough for grassland, but dry for most forests.`;
      if (coldest >= 18)
        return `About ${cm} cm a year and warm all year: a tropical forest, seasonal if some months are dry.`;
      return `About ${cm} cm a year, with winters near or below freezing and warm summers: a temperate deciduous forest.`;
    },
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
    intro: 'The nervous and endocrine systems coordinate the rest.',
    bins: [
      {
        id: 'nervous',
        label: 'Nervous',
        why: 'Neurons carry fast electrical signals.',
        figure: { kind: 'icon', icon: 'nervous system' },
      },
      {
        id: 'endocrine',
        label: 'Endocrine',
        why: 'Glands release hormones into the blood.',
        figure: { kind: 'icon', icon: 'endocrine system' },
      },
      {
        id: 'circulatory',
        label: 'Circulatory',
        why: 'Blood carries gases, food and heat.',
        figure: { kind: 'icon', icon: 'heart and blood vessels' },
      },
      {
        id: 'respiratory',
        label: 'Respiratory',
        why: 'The lungs trade O₂ and CO₂ with the air.',
        figure: { kind: 'icon', icon: 'respiratory system' },
      },
      {
        id: 'excretory',
        label: 'Excretory',
        why: 'The kidneys remove wastes and set the blood’s water.',
        figure: { kind: 'icon', icon: 'excretory system' },
      },
      {
        id: 'digestive',
        label: 'Digestive',
        why: 'Food is broken down and absorbed.',
        figure: { kind: 'icon', icon: 'digestive system' },
      },
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

const NERVOUS: LayoutDef[] = [
  // ── The nervous system and the senses (HS-LS1-2, HS-LS1-3) ──
  {
    kind: 'sequence',
    id: 's.9.nervous-system',
    assumptions: [
      'A neuron receives signals on its dendrites and sends an impulse along its axon to the next cell.',
      'In a reflex the spinal cord answers before the brain knows: that saves time.',
    ],
    question: 'Put the steps of a reflex in order: a hand touches a hot pan.',
    stages: [
      {
        label: 'Receptors in the skin detect the heat',
        figure: { kind: 'reflexArc', lit: 'receptor' },
      },
      {
        label: 'A sensory neuron carries the impulse to the spinal cord',
        figure: { kind: 'reflexArc', lit: 'sensory' },
      },
      {
        label: 'An interneuron in the spinal cord passes it on',
        figure: { kind: 'reflexArc', lit: 'interneuron' },
      },
      {
        label: 'A motor neuron carries the impulse to an arm muscle',
        figure: { kind: 'reflexArc', lit: 'motor' },
      },
      {
        label: 'The muscle contracts and pulls the hand away',
        figure: { kind: 'reflexArc', lit: 'effector' },
      },
      {
        label: 'The message reaches the brain, and you feel the pain',
        figure: { kind: 'reflexArc', lit: 'brain' },
      },
    ],
  },
  {
    kind: 'sequence',
    id: 's.9.nervous-system~action-potential',
    title: 'A nerve impulse',
    use: 'Use this for “What makes the inside of a neuron positive during an impulse?”',
    assumptions: [
      'At rest the inside of a neuron is about −70 mV, more negative than the outside.',
      'The Na⁺/K⁺ pump keeps more Na⁺ outside and more K⁺ inside, ready for the next impulse.',
      'Each patch of axon triggers the next, so the impulse travels along it one way.',
    ],
    question: 'Put the steps of an action potential in order, from rest.',
    stages: [
      { label: 'Resting: the inside is at −70 mV' },
      { label: 'A stimulus raises it to the threshold, about −55 mV' },
      { label: 'Na⁺ channels open and Na⁺ rushes in: the inside turns positive' },
      { label: 'K⁺ channels open and K⁺ flows out: the inside turns negative again' },
      { label: 'The inside dips just below −70 mV' },
      { label: 'The pump restores the ions: resting again' },
    ],
  },
  {
    kind: 'observe',
    id: 's.9.nervous-system~membrane-potential',
    title: 'Membrane potential through an impulse',
    use: 'Use this to record a neuron’s membrane potential through one impulse.',
    assumptions: [
      'At rest the inside of a neuron is about −70 mV, more negative than the outside.',
      'Past the threshold, about −55 mV, Na⁺ rushes in; then K⁺ flows out and the inside turns negative again.',
    ],
    columns: ['0 ms', '1 ms', '2 ms', '3 ms', '4 ms', '5 ms', '6 ms'],
    rowLabel: 'Membrane potential',
    unit: 'mV',
    min: -90,
    max: 40,
    step: 5,
    initial: [-70, -55, 30, -40, -80, -75, -70],
    guides: [
      { at: -55, label: 'Threshold' },
      { at: -70, label: 'Rest' },
    ],
    pattern: (v) => {
      const peak = Math.max(...v);
      const low = Math.min(...v);
      const sign = (x: number) => (x > 0 ? `+${x}` : x < 0 ? `−${-x}` : '0');
      if (peak < -55)
        return `It never passes the threshold of −55 mV, so no impulse fires: the neuron stays near rest.`;
      const dip =
        low < -70 ? ` It dips to ${sign(low)} mV, below rest, before the pump restores it.` : '';
      return `It passes the threshold and peaks at ${sign(peak)} mV as Na⁺ rushes in; then K⁺ flows out.${dip}`;
    },
  },
  {
    kind: 'sequence',
    id: 's.9.nervous-system~synapse',
    title: 'Across a synapse',
    use: 'Use this for “How does a signal pass from one neuron to the next?”',
    assumptions: [
      'Neurons do not touch: a tiny gap, the synapse, separates the end of one axon from the next cell.',
      'A chemical, the neurotransmitter, carries the signal across the gap, so it passes one way only.',
    ],
    question: 'Put the steps in order: an impulse reaches the end of an axon.',
    stages: [
      { label: 'The impulse reaches the end of the axon' },
      { label: 'Small sacs (vesicles) release neurotransmitter into the gap' },
      { label: 'The neurotransmitter crosses the gap' },
      { label: 'It binds to receptors on the next cell' },
      { label: 'The next cell starts a new impulse, or is held back from one' },
      { label: 'The neurotransmitter is broken down or taken back up' },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.nervous-system~divisions',
    title: 'Which part of the nervous system?',
    use: 'Use this for “Which part of the nervous system speeds up the heart in an emergency?”',
    assumptions: [
      'The central nervous system is the brain and spinal cord; every nerve outside them is peripheral.',
      'The peripheral system has a somatic part (the muscles you choose to move) and an autonomic part (the organs).',
      'The autonomic part has two sides: the sympathetic readies the body for action, the parasympathetic calms it.',
    ],
    question: 'Which part of the nervous system is it?',
    bins: [
      {
        id: 'cns',
        label: 'Central (brain and spinal cord)',
        why: 'It takes in the signals, makes sense of them and decides a response.',
      },
      {
        id: 'somatic',
        label: 'Somatic (voluntary)',
        why: 'Motor nerves to skeletal muscles, which you control.',
      },
      {
        id: 'sympathetic',
        label: 'Sympathetic (fight or flight)',
        why: 'Autonomic nerves that ready the body for danger: a faster heart, wider pupils.',
      },
      {
        id: 'parasympathetic',
        label: 'Parasympathetic (rest and digest)',
        why: 'Autonomic nerves that calm the body: a slower heart, digestion, narrower pupils.',
      },
    ],
    cards: [
      { label: 'The cerebrum plans a move and stores memories', bin: 'cns' },
      { label: 'The cerebellum keeps your balance', bin: 'cns' },
      { label: 'The brainstem keeps you breathing', bin: 'cns' },
      { label: 'Motor nerves carry the kick to the leg muscles', bin: 'somatic' },
      { label: 'Fingers typing a message', bin: 'somatic' },
      { label: 'The heart speeds up when you are frightened', bin: 'sympathetic' },
      { label: 'The pupils widen when you are startled', bin: 'sympathetic' },
      { label: 'The stomach churns food after a meal', bin: 'parasympathetic' },
      { label: 'The pupils narrow in bright light', bin: 'parasympathetic' },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.nervous-system~senses',
    title: 'Which receptor detects it?',
    use: 'Use this for “Which receptors in the eye respond to light?”',
    assumptions: [
      'A sensory receptor turns a stimulus into nerve impulses; the brain decides what they mean.',
      'Each kind of receptor responds best to one kind of stimulus.',
    ],
    question: 'Which kind of receptor detects it?',
    bins: [
      {
        id: 'photo',
        label: 'Photoreceptors',
        why: 'Rods and cones in the retina respond to light.',
      },
      {
        id: 'mechano',
        label: 'Mechanoreceptors',
        why: 'Respond to pressure, stretch or vibration: touch, hearing and balance.',
      },
      {
        id: 'chemo',
        label: 'Chemoreceptors',
        why: 'Respond to chemicals: taste, smell and the blood’s CO₂.',
      },
      {
        id: 'thermo',
        label: 'Thermoreceptors',
        why: 'Respond to warming and cooling of the skin.',
      },
    ],
    cards: [
      { label: 'Cones tell red from green', bin: 'photo' },
      { label: 'Rods let you see in dim light', bin: 'photo' },
      { label: 'Hair cells in the ear bend with sound', bin: 'mechano' },
      { label: 'Fluid in the inner ear tells which way is up', bin: 'mechano' },
      { label: 'A light touch on the skin', bin: 'mechano' },
      { label: 'Taste buds detect sweet and salty', bin: 'chemo' },
      { label: 'The nose picks up the smell of smoke', bin: 'chemo' },
      { label: 'Stepping into a cold pool', bin: 'thermo' },
      { label: 'A warm mug in your hands', bin: 'thermo' },
    ],
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
    ],
    question: 'What kind of pathogen causes it?',
    intro: 'Antibiotics work on bacteria only: they do nothing to viruses.',
    bins: [
      {
        id: 'virus',
        label: 'Virus',
        why: 'Genes in a protein coat, copied only inside a host’s cells.',
        figure: { kind: 'icon', icon: 'virus' },
      },
      {
        id: 'bacterium',
        label: 'Bacterium',
        why: 'A single cell with no nucleus.',
        figure: { kind: 'icon', icon: 'bacterium' },
      },
      {
        id: 'fungus',
        label: 'Fungus',
        why: 'Cells with a nucleus and a wall, living on the host.',
        figure: { kind: 'icon', icon: 'fungus' },
      },
      {
        id: 'parasite',
        label: 'Parasite',
        why: 'A protist or an animal that lives on or in the host.',
        figure: { kind: 'icon', icon: 'parasite' },
      },
    ],
    cards: [
      { label: 'Influenza', bin: 'virus' },
      { label: 'Measles', bin: 'virus' },
      { label: 'The common cold', bin: 'virus' },
      { label: 'Strep throat', bin: 'bacterium' },
      { label: 'Tuberculosis', bin: 'bacterium' },
      { label: 'Athlete’s foot', bin: 'fungus' },
      { label: 'Ringworm', bin: 'fungus' },
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
  ...REPRODUCTION,
  ...INHERITANCE,
  ...DNA,
  ...BIOTECH,
  ...EVOLUTION,
  ...CLASSIFICATION,
  ...PLANTS,
  ...POPULATION,
  ...ECOSYSTEMS,
  ...BIOMES,
  ...HOMEOSTASIS,
  ...NERVOUS,
  ...IMMUNE,
];
