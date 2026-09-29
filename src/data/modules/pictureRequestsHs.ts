/**
 * Pictures requested for Grades 9–12 (ids H..), from the high-school textbook research
 * (research/textbooks/grades/9.md–12.md) and the skills in taxonomy.ts. Spread into
 * PICTURE_REQUESTS; the picture chat's brief is docs/RENDERINGS_HS.md, which gives each one's
 * full spec. `pages` are the planned skills (their main pages until the lesson chat names the
 * problem types).
 */
import type { PictureRequest } from './pictureRequests';

const ask = (
  id: string,
  kind: string,
  what: string,
  pages: string[],
  notes?: string,
): PictureRequest => ({
  id,
  what,
  kind,
  pages,
  status: 'requested',
  gallery: [],
  ...(notes ? { notes } : {}),
});

export const HS_PICTURE_REQUESTS: PictureRequest[] = [
  // ── A. Shared math pictures (new kinds, most pages first) ──
  ask(
    'H01',
    'functionGraph',
    'Graph of y = f(x) for each function family, with its features marked',
    [
      'm.9.function-notation',
      'm.9.piecewise-functions',
      'm.9.absolute-value',
      'm.9.exponential-functions',
      'm.9.quadratic-functions',
      'm.9.quadratic-formula',
      'm.11.function-transformations',
      'm.11.polynomial-functions',
      'm.11.polynomial-equations',
      'm.11.inverse-functions',
      'm.11.radical-functions',
      'm.11.logarithms',
      'm.11.exp-log-equations',
      'm.11.rational-functions',
      'm.11.trig-graphs',
      'm.12.inverse-trig',
      'm.12.limits-intro',
      's.9.population-ecology',
    ],
    'Families: linear, absolute value, piecewise (pieces with open or closed ends), quadratic, exponential, logistic, logarithmic, square and cube root, polynomial, rational (asymptotes, holes), sine, cosine, tangent, inverse trig. Marks: zeros, y-intercept, vertex and axis, extrema, asymptotes, domain and range on the axes, a traced point with a handle, a second curve (the parent dashed, or f and its inverse with y = x), a shaded region, a limit approached from both sides, a secant turning into a tangent.',
  ),
  ask(
    'H02',
    'normalCurve',
    'Normal curve with shaded areas, z and x axes, the 68–95–99.7 bands, tails, intervals',
    [
      'm.11.normal-distribution',
      'm.12.sampling-distributions',
      'm.12.confidence-intervals',
      'm.12.hypothesis-testing',
      'm.12.chi-square',
    ],
    'Also a chi-square curve by degrees of freedom, a sampling distribution narrower than the population, and a stack of confidence intervals around the true value showing how many capture it.',
  ),
  ask(
    'H03',
    'histogram',
    'Histogram with bins from the data, and probability bars with the expected value',
    ['m.9.data-displays', 'm.11.probability-distributions', 'm.12.sampling-distributions'],
    'Shape words (symmetric, skewed left or right, uniform, bimodal) in the caption; mean and median marked; binomial bars from n and p.',
  ),
  ask(
    'H04',
    'triangleSolver',
    'Any triangle to scale from three given parts, sides and angles labelled',
    [
      'm.10.congruence',
      'm.10.special-right-triangles',
      'm.10.right-triangle-trig',
      'm.10.law-sines-cosines',
      'm.10.similarity',
    ],
    'SSS, SAS, ASA, AAS, HL and the ambiguous SSA case (two triangles); the given parts marked; opposite, adjacent and hypotenuse named from angle θ; 45-45-90 and 30-60-90 with side ratios in radicals; a second, similar triangle at a scale factor.',
  ),
  ask(
    'H05',
    'markedFigure',
    'Geometry figure with congruence ticks, arcs, right-angle and parallel marks, from a point list',
    [
      'm.10.constructions',
      'm.10.proofs',
      'm.10.parallel-lines',
      'm.10.triangle-relationships',
      'm.10.quadrilaterals',
    ],
    'Parallel lines cut by a transversal with the eight angles; triangle centers (centroid, incenter, circumcenter, orthocenter) with medians, bisectors and altitudes; midsegments; quadrilateral families with diagonals; a proof figure whose given and proved parts light up by step.',
  ),
  ask(
    'H06',
    'unitCircle',
    'Unit circle with an angle, its point (cos θ, sin θ), reference triangle and special angles',
    [
      'm.10.arc-sector',
      'm.11.unit-circle',
      'm.11.trig-graphs',
      'm.11.pythagorean-identities',
      'm.12.inverse-trig',
      'm.12.trig-formulas-equations',
    ],
    'Degrees and radians; drag the angle; the sine and cosine as segments; optional linked sine graph unrolled beside it; every solution of a trig equation on one turn marked.',
  ),
  ask(
    'H07',
    'algebraTiles',
    'Algebra tiles: x², x and unit tiles, positive and negative, arranged as a rectangle',
    [
      'm.9.solving-equations',
      'm.9.polynomial-operations',
      'm.9.factoring',
      'm.9.quadratic-formula',
    ],
    'Multiply two binomials as a rectangle, factor a trinomial by arranging its tiles, complete the square (the missing corner), zero pairs cancel.',
  ),
  ask(
    'H08',
    'vectorDiagram',
    'Vectors as arrows on a grid: components, sums, scalar multiples, the angle between',
    ['m.12.vectors', 's.11.kinematics-2d', 's.11.dynamics-vectors'],
    'Tip to tail and parallelogram sums, magnitude and direction, dot product sign from the angle; drag a tip.',
  ),
  ask(
    'H09',
    'complexPlane',
    'Complex plane: a + bi as a point and arrow, conjugate, sum, modulus and argument',
    ['m.11.complex-numbers', 'm.12.polar'],
  ),
  ask(
    'H10',
    'polarGrid',
    'Polar grid with a point (r, θ) and polar curves (circle, rose, cardioid, spiral)',
    ['m.12.polar', 'm.12.parametric'],
    'Parametric mode: a path traced as t grows, with direction arrows and the point at t.',
  ),
  ask(
    'H11',
    'conicGraph',
    'Circle, parabola, ellipse and hyperbola from their equations, with center, foci, directrix, asymptotes',
    ['m.10.circle-equations', 'm.12.conics'],
    'Drag the center and the radius or axes; cross sections of a double cone as the explore figure for the same page.',
  ),
  ask(
    'H12',
    'circleTheorems',
    'Circle with central and inscribed angles, chords, tangents and secants, points draggable on the circle',
    ['m.10.circle-theorems'],
    'Inscribed angle half the central angle; angle in a semicircle; tangent perpendicular to the radius; intersecting chords, secant–secant and secant–tangent products.',
  ),
  ask(
    'H13',
    'pascalTriangle',
    "Pascal's triangle with row n and entry k lit, and the counting slots n × (n − 1) × …",
    ['m.10.probability-rules', 'm.11.binomial-theorem'],
    'Slots for permutations and combinations (choose, then divide by the orders); the binomial expansion coefficients from row n.',
  ),
  ask(
    'H14',
    'matrixGrid',
    'Matrices in brackets: a row times a column lit for multiplication, row operations, a 3 × 3 system',
    ['m.12.matrices'],
  ),
  ask(
    'H15',
    'termsChart',
    'Terms of a sequence as bars or points, with the running sum approaching its limit',
    ['m.9.sequences', 'm.11.series'],
  ),

  // ── B. Changes to existing math pictures ──
  ask(
    'H16',
    'lineSystem',
    'Shaded half-planes: dashed or solid boundaries and the overlap of two inequalities',
    ['m.9.inequality-systems', 'm.9.linear-inequalities'],
    'Also elimination: the two equations and their sum drawn as three lines through one point.',
  ),
  ask(
    'H17',
    'integerLine',
    'Compound inequalities (and, or) and absolute value as a distance on the number line',
    ['m.9.linear-inequalities', 'm.9.absolute-value'],
  ),
  ask(
    'H18',
    'scatter',
    'Residual segments, a residual plot below, the correlation r and the least-squares line',
    ['m.9.regression'],
  ),
  ask(
    'H19',
    'boxPlot',
    'Outliers past 1.5 × IQR fences, and two box plots on one scale; a dot plot with mean ± 1 SD',
    ['m.9.data-displays'],
    'The mean and standard deviation band belong on dotPlot.',
  ),
  ask(
    'H20',
    'table',
    'Two-way table with totals and a lit cell, row or column, its relative frequency, and a segmented bar',
    ['m.9.two-way-tables', 'm.10.conditional-probability', 'm.12.chi-square'],
    'Chi-square: observed and expected counts side by side.',
  ),
  ask(
    'H21',
    'treeDiagram',
    'Branches with their own probabilities (not all 1/n), P(B | A) on the second stage',
    ['m.10.conditional-probability', 'm.10.probability-rules'],
  ),
  ask(
    'H22',
    'venn',
    'Venn diagram with probabilities: A and B, A or B, mutually exclusive, the complement shaded',
    ['m.10.probability-rules', 'm.10.conditional-probability'],
  ),
  ask(
    'H23',
    'transformation',
    'Compositions of two moves with the middle image, any reflection line, rotation about any point, symmetry',
    ['m.10.rigid-motions', 'm.10.congruence'],
  ),
  ask(
    'H24',
    'scaleCopy',
    'Dilation from any center with rays, scale factors under 1, the side-splitter (parallel line in a triangle)',
    ['m.10.similarity'],
  ),
  ask(
    'H25',
    'coordinatePlane',
    'Segment with midpoint and a point that partitions it in a ratio; distance as a right triangle; side slopes',
    ['m.10.coordinate-geometry'],
  ),
  ask(
    'H26',
    'circle',
    'Sector shaded by a central angle in degrees or radians, arc length, radius-length arcs around the circle',
    ['m.10.arc-sector', 'm.11.unit-circle'],
  ),
  ask(
    'H27',
    'curvedSolid',
    'Pyramids, cones and spheres with surface area nets (the cone as a sector), and Cavalieri stacks',
    ['m.10.volume-derivations'],
    'crossSection: a plane through a cube, cylinder or cone, the section drawn beside it.',
  ),
  ask('H28', 'factorTree', 'Pairs of equal factors circled, coming out of the root: √72 = 6√2', [
    'm.9.radicals',
  ]),
  ask('H29', 'powerScale', 'A log mode: the exponent read off the ruler, log₁₀ 470,000 ≈ 5.67', [
    'm.11.logarithms',
  ]),

  // ── C. Statistics and study design figures ──
  ask(
    'H30',
    'studyDesign',
    'Explore figure: population to sample to randomly assigned groups; survey, observational study, experiment',
    ['m.11.study-design'],
    'Card figures for the sampling methods: simple random, stratified, cluster, systematic, convenience.',
  ),

  // ── D. Biology ──
  ask(
    'H31',
    'macromolecules',
    'Explore figure: monomers joining into polymers (sugars to starch, amino acids to a protein, nucleotides, fats)',
    ['s.9.biomolecules'],
  ),
  ask(
    'H32',
    'membrane',
    'Membrane with particles on each side, counts from the values, arrows high to low; cells in hypotonic, isotonic and hypertonic water',
    ['s.9.membrane-transport'],
  ),
  ask(
    'H33',
    'organelleEnergy',
    'Explore figure: chloroplast and mitochondrion, glucose, oxygen, carbon dioxide, water and ATP cycling between them',
    ['s.9.cellular-energy'],
  ),
  ask(
    'H34',
    'cellDivision',
    'Sequence stage figures: the cell cycle, mitosis phases and meiosis I and II with chromosomes by parent color, crossing over',
    ['s.9.mitosis-meiosis'],
    'Chromosome count driven by 2n; gametes with n.',
  ),
  ask(
    'H35',
    'punnettSquare',
    'Dihybrid 4 × 4 square, incomplete dominance and codominance colors, sex-linked alleles on X',
    ['s.9.inheritance-patterns'],
    'Pedigree: sex-linked carriers (half-shaded).',
  ),
  ask(
    'H36',
    'dnaStrand',
    'DNA ladder from a base sequence, its complement, the mRNA, codons and the amino acids',
    ['s.9.dna-protein-synthesis', 's.9.biotechnology'],
    'A mutation (substitution, insertion, deletion) lit in the sequence and its effect on the protein.',
  ),
  ask(
    'H37',
    'gel',
    'Gel electrophoresis: bands placed by fragment size, a ladder lane; PCR copies doubling each cycle',
    ['s.9.biotechnology'],
  ),
  ask(
    'H38',
    'alleleFrequencies',
    'Hardy–Weinberg: p and q as beads in a population, genotype bars p², 2pq, q²',
    ['s.9.evolution-evidence'],
    'Card figures: homologous limbs (arm, wing, flipper, leg) with matching bones colored.',
  ),
  ask(
    'H39',
    'cladogram',
    'Cladogram with shared traits on the branches; domain and kingdom card icons',
    ['s.9.classification', 's.9.evolution-evidence'],
  ),
  ask(
    'H40',
    'energyPyramid',
    'Pyramids of energy, biomass and numbers; succession stages; the nitrogen cycle as an explore figure',
    ['s.9.ecosystem-dynamics'],
  ),
  ask(
    'H41',
    'feedbackLoop',
    'Explore figure: stimulus, sensor, control center, effector, response; body temperature and blood sugar',
    ['s.9.homeostasis', 's.12.climate-systems'],
    'The climate page uses the same loop for the ice-albedo and water-vapor feedbacks.',
  ),
  ask(
    'H42',
    'immuneResponse',
    'Pathogen card icons (virus, bacterium, fungus, parasite); the immune response in stages; antibody levels after a first and second exposure',
    ['s.9.immune-disease'],
  ),

  // ── E. Chemistry ──
  ask(
    'H43',
    'unitChain',
    'Conversion factors in a chain with units crossed out; a ruler read to the estimated digit; accuracy and precision targets',
    ['s.10.measurement'],
  ),
  ask(
    'H44',
    'atomModel',
    'Bohr model from protons, neutrons and electrons: isotopes and ions change the picture',
    ['s.10.atomic-structure', 's.10.electrons-in-atoms', 's.10.nuclear-chemistry'],
  ),
  ask(
    'H45',
    'orbitalDiagram',
    'Orbital boxes filled in Aufbau order with up and down arrows, the energy ladder, and emission lines from jumps',
    ['s.10.electrons-in-atoms', 's.11.modern-physics'],
  ),
  ask(
    'H46',
    'periodicTable',
    'A trend as shading across the table (radius, ionization energy, electronegativity) with arrows',
    ['s.10.periodic-trends'],
  ),
  ask(
    'H47',
    'lewisStructure',
    'Electron-dot structures, electron transfer in ionic bonds, the sea of electrons; hydrocarbons from n carbons',
    ['s.10.bonding', 's.10.organic'],
  ),
  ask(
    'H48',
    'vsepr',
    'Ball-and-stick shapes with bond angles and dipole arrows; hydrogen bonds between water molecules',
    ['s.10.molecular-shape'],
  ),
  ask(
    'H49',
    'reaction',
    'Coefficients set the molecule counts and an atom tally; leftover reactant lit (limiting reactant); reaction-type card figures',
    ['s.10.reaction-types', 's.10.stoichiometry'],
  ),
  ask(
    'H50',
    'moleMap',
    'Grams ↔ moles ↔ particles ↔ liters of gas, each arrow with its factor, the current value lit',
    ['s.10.mole', 's.10.stoichiometry'],
  ),
  ask(
    'H51',
    'gasPiston',
    'Cylinder with a piston, particles moving by temperature, a pressure gauge and a volume scale',
    ['s.10.gas-laws'],
  ),
  ask(
    'H52',
    'beaker',
    'Solute particles per volume, dilution as two beakers (M₁V₁ = M₂V₂); a solubility curve',
    ['s.10.molarity'],
  ),
  ask(
    'H53',
    'energyProfile',
    'Reaction energy diagram: reactant and product levels, ΔH, activation energy, the catalyst path dashed',
    ['s.10.thermochemistry', 's.10.rates-equilibrium'],
    'Also a coffee-cup calorimeter (q = mcΔT) for thermochemistry and thermodynamics.',
  ),
  ask(
    'H54',
    'equilibriumChart',
    'Concentrations against time leveling off, and the shift after a change (Le Châtelier)',
    ['s.10.rates-equilibrium'],
  ),
  ask(
    'H55',
    'phScale',
    'pH scale 0–14 in indicator colors with the value marked and [H⁺] as a power of ten; a titration curve',
    ['s.10.acids-bases'],
  ),
  ask(
    'H56',
    'electrochemicalCell',
    'Explore figure: galvanic cell with two electrodes, a salt bridge and electrons flowing through the wire',
    ['s.10.redox'],
  ),
  ask(
    'H57',
    'decayChart',
    'Half-life: a grid of atoms decaying, what is left after n half-lives, the decay curve; nuclear equations',
    ['s.10.nuclear-chemistry', 's.12.radiometric-dating'],
  ),

  // ── F. Physics ──
  ask(
    'H58',
    'motionGraph',
    'Area under velocity–time shaded as displacement, the tangent slope, a strobe motion diagram',
    ['s.11.kinematics-1d'],
  ),
  ask(
    'H59',
    'projectile',
    'Trajectory from launch speed, angle and height, velocity components along it, maximum height and range',
    ['s.11.kinematics-2d', 'm.12.parametric'],
  ),
  ask(
    'H60',
    'freeBody',
    'Free-body diagram with scaled force arrows (weight, normal, friction, tension, applied); an incline with components',
    ['s.11.dynamics-vectors', 's.11.circular-gravitation'],
  ),
  ask(
    'H61',
    'circularMotion',
    'Object on a circle with velocity tangent and acceleration toward the center; two masses and the pull between them',
    ['s.11.circular-gravitation'],
    'Orbit: Kepler ellipse with foci and equal-area sectors for the solar system page.',
  ),
  ask(
    'H62',
    'collision',
    'Carts on a track before and after, momentum arrows, sticking together or bouncing',
    ['s.11.momentum'],
  ),
  ask(
    'H63',
    'simpleMachine',
    'Lever, pulley system and inclined plane with effort, load and mechanical advantage from the values',
    ['s.11.work-energy-power'],
    'energyTrack: a friction-heat bar and a spring.',
  ),
  ask(
    'H64',
    'heatEngine',
    'Hot reservoir, engine, work out and heat to the cold reservoir, with the efficiency',
    ['s.11.thermodynamics'],
  ),
  ask(
    'H65',
    'wave',
    'Standing waves on a string and in pipes (harmonic n, nodes and antinodes); Doppler wavefronts from a moving source',
    ['s.11.sound-waves'],
  ),
  ask(
    'H66',
    'rayDiagram',
    'Lenses and mirrors with principal rays, object and image from 1/f = 1/d₀ + 1/dᵢ; refraction with the normal and angles',
    ['s.11.optics', 's.12.starlight-spectra'],
    'Total internal reflection past the critical angle; double-slit fringes; telescopes for the Earth and space page.',
  ),
  ask(
    'H67',
    'charges',
    'Point charges with field lines and the Coulomb force arrows scaled by q₁, q₂ and r',
    ['s.11.electrostatics'],
  ),
  ask('H68', 'circuit', 'Mixed series-parallel circuits, meter readings at each resistor, power', [
    's.11.circuits',
  ]),
  ask(
    'H69',
    'induction',
    'Magnet moving through a coil with a meter; force on a current in a field (right-hand rule); a transformer by turns',
    ['s.11.electromagnetism'],
  ),
  ask(
    'H70',
    'spectrum',
    'Emission and absorption lines of H, He, Na; the lines shifted red; photon energy from frequency',
    ['s.11.modern-physics', 's.12.starlight-spectra', 's.12.cosmology'],
  ),

  // ── G. Earth and space ──
  ask(
    'H71',
    'mineralIcons',
    'Card icons of minerals in their materials (quartz, feldspar, mica, calcite, halite, pyrite, hematite) and the Mohs scale',
    ['s.12.minerals-rocks'],
  ),
  ask(
    'H72',
    'earthLayers',
    'Cross-section of Earth with P and S wave paths and the shadow zone; a seismogram; locating an epicenter from three stations',
    ['s.12.earth-interior'],
  ),
  ask(
    'H73',
    'landforms',
    'Explore figures: volcano types, folds and faults, a U- and a V-shaped valley, a meandering river, an aquifer and water table, dunes',
    ['s.12.volcanoes-mountains', 's.12.surface-processes'],
  ),
  ask(
    'H74',
    'rockLayers',
    'Absolute ages on layers, an igneous intrusion cutting across, index fossils',
    ['s.12.radiometric-dating'],
  ),
  ask(
    'H75',
    'oceanProfile',
    'Ocean floor profile (shelf, slope, ridge, trench); surface currents and gyres on a map; the deep conveyor; tides from the moon and sun',
    ['s.12.ocean-atmosphere'],
  ),
  ask(
    'H76',
    'atmosphereLayers',
    'Layers of the atmosphere with the temperature profile; a pressure map with highs, lows and wind arrows turned by Coriolis',
    ['s.12.atmosphere-weather'],
  ),
  ask(
    'H77',
    'greenhouse',
    'Explore figure: sunlight in, infrared out and back; climate zones by latitude',
    ['s.12.climate-systems'],
  ),
  ask(
    'H78',
    'energySources',
    'Card icons for energy sources (solar panel, wind turbine, dam, coal, oil rig, nuclear plant) and a resource bar or pie',
    ['s.12.resource-management'],
  ),
  ask(
    'H79',
    'hrDiagram',
    'H–R diagram (temperature against luminosity, log scales) with the main sequence, giants and white dwarfs; star life-cycle stages',
    ['s.12.stellar-evolution'],
  ),
  ask(
    'H80',
    'expandingUniverse',
    'Explore figure: galaxies spreading apart as space stretches; Hubble plot of speed against distance; galaxy type card figures',
    ['s.12.cosmology', 's.12.solar-system'],
    'Solar system page: nebula to planets as sequence stages.',
  ),
  // ── H. Equation inputs (docs/RENDERINGS_HS_EQUATIONS.md, docs/EQUATION_INPUTS.md) ──
  {
    ...ask(
      'H81',
      'equationInput',
      'Expression slots: a fraction part or an exponent mixing boxes, text and signs',
      [
        'm.10.law-sines-cosines',
        'm.11.normal-distribution',
        'm.12.conics',
        's.10.measurement',
        'm.9.sequences',
        'm.11.exp-log-equations',
      ],
    ),
    status: 'drawn',
    gallery: [
      'g.m10-law-sines-cosines-sines',
      'g.m11-normal-distribution-z',
      'g.m9-sequences-geometric',
      'g.m11-exp-log-equations-continuous',
      'g.s10-measurement-factor',
      'g.s10-mole-factor',
      'g.m12-conics-ellipse',
    ],
    notes:
      'Template syntax: a group in braces (anything but a lone {id}) is an expression slot, as a fraction’s top or bottom or an exponent: `{z} = {{x} − {m}}/{s}`, `{a}/{sin({A}°)} = {b}/{sin({B}°)}`, `{a} km × {1000 m}/{1 km} = {b} m`, `{m} g × {1 mol}/{{M} g} = {n} mol`, `aₙ = {a1} × {r}^{{n} − 1} = {an}`, `{A} = {P}e^{{r}{t}}`, `{({x} − {h})²}/{a}^2 + {({y} − {k})²}/{b}^2 = 1`. A bare word after ^ stays text (`{b}^x`, `e^rt`); a letter or number before ^ is a base (`e^`, `10^`). The exponent binds before the bar. The step harness now reads sin/cos/tan of degrees and e^.',
  },
  {
    ...ask('H82', 'equationInput', 'An exponent on a bracket: (1 + {r})^{t}, ({b}^{m})^{n}', [
      'm.9.exponential-functions',
      'm.11.binomial-theorem',
      'm.11.pythagorean-identities',
    ]),
    status: 'drawn',
    gallery: [
      'g.m9-exponential-functions-compound',
      'g.m11-complex-numbers-square',
      'g.m11-pythagorean-identities',
      'g.s10-nuclear-chemistry-half-life',
      'g.m8-exponent-rules-power-of-power',
    ],
    notes:
      'Also lets m.8.exponent-rules~power-of-power take its equation: `({b}^{m})^{n} = {b}^{k} = {P}`. Template syntax: a bracketed group followed by ^ is the base, its brackets drawn, written against the box before it: `{A} = {P}(1 + {r})^{t}`, `({a} + {b}i)^2 = {p} + {q}i`, `({s})^2 + ({c})^2 = 1`, `y = {a}({b})^x`, `{N} = {N0}(1/2)^{{t}/{T}}` (brackets as tall as a fraction inside). Brackets with no ^ after them stay text.',
  },
  {
    ...ask('H83', 'equationInput', 'Radicals with a bar over the box or group, and cube roots', [
      'm.9.radicals',
      'm.11.radical-functions',
      'm.10.special-right-triangles',
      'm.12.confidence-intervals',
    ]),
    status: 'drawn',
    gallery: [
      'g.m9-radicals-simplify',
      'g.m11-radical-functions-equation',
      'g.m12-confidence-intervals-margin',
      'g.m10-special-right-triangles-45',
      'g.m9-radicals-cube-root',
    ],
    notes:
      'Template syntax: √ (∛ for a cube root, ∜ a fourth) before a box, a number, a group in braces or a bracketed group puts the bar over it, the brackets not drawn: `√{n} = {k}√{r}`, `√({a}x + {b}) = {c}`, `{c} = {s}√2`, `∛{n} = {k}`; a radical can be a fraction’s top or bottom: `{E} = {z} × {s}/√{n}`. Written against a box it touches it ({k}√{r}). The step harness reads “largest square factor of 72”.',
  },
  {
    ...ask(
      'H84',
      'equationInput',
      'A sign or operator choice box (<, ≤, >, ≥; + or −) tied to a coded value',
      ['m.9.linear-inequalities', 'm.9.inequality-systems', 'm.7.two-step-equations~inequality'],
    ),
    status: 'drawn',
    gallery: [
      'g.m7-two-step-equations-inequality',
      'g.m9-linear-inequalities-both-sides',
      'g.m7-rational-operations-add-subtract',
      'g.m6-integers-compare',
    ],
    notes:
      'Template syntax: `{s:sign}` cycles <, ≤, >, ≥ (value 1–4, as the inequality pages store it); `{s:relation}` adds = as 5; `{o:op}` cycles + and − (1, 2). A tap sets the value (calc.set); a worked-out sign is dashed and can’t be tapped; a line may break before it. m.7.two-step-equations~inequality: `{p}x + {q} {s:sign} {r}`; both sides: `{a}x + {b} {s:sign} {c}x + {d}`; `{a} {o:op} {b} = {r}`; a worked-out comparison `{a} {c:relation} {b}`; scientific-notation add and subtract: `({a} × 10^{n}) {o:op} ({c} × 10^{n}) = {p} × 10^{n}`. The Grade 7 page’s work lines print “undefined” for the sign while it is not chosen (its demo waits for the sign).',
  },
  {
    ...ask(
      'H85',
      'equationInput',
      'Subscript boxes (log base, aₙ) and stacked mass and atomic numbers on the left',
      ['m.11.logarithms', 's.10.nuclear-chemistry'],
    ),
    status: 'drawn',
    gallery: [
      'g.m11-logarithms-log-form',
      'g.m9-sequences-arithmetic',
      'g.s10-nuclear-chemistry-alpha',
      'g.s10-nuclear-chemistry-beta',
    ],
    notes:
      'Template syntax: letters (or a box) then _ and a slot is a subscript, small and lowered: `log_{b}({x}) = {y}`, `a_{n} = {a1} + (n − 1){d} = {an}` (a_n with a bare letter stays text). A ^ with nothing before it starts scripts stacked on the left of the symbol after them, mass number over atomic number: `^{A}_{Z}X → ^{A2}_{Z2}Y + ^{4}_{2}He`, beta `^{0}_{−1}e`. A brace holding only digits ({4}) is a fixed number, not a box.',
  },
  {
    ...ask('H86', 'equationInput', 'A matrix grid of boxes, augmented bar and determinant bars', [
      'm.12.matrices',
    ]),
    status: 'drawn',
    gallery: [
      'g.m12-matrices-determinant',
      'g.m12-matrices-times-vector',
      'g.m12-matrices-augmented',
    ],
    notes:
      'Template syntax: `[[…]]` is a matrix in brackets, `||…||` a determinant between bars; rows are split by `;` and cells by `,`, each cell a box, a number or a small expression; a `|` at the same place in every row draws the augmented bar. Columns are as wide as their widest cell; brackets and bars grow with the rows. 2 × 2 to 3 × 4: `||{a}, {b}; {c}, {d}|| = {D}`, `[[{a}, {b}; {c}, {d}]] [[{x}; {y}]] = [[{p}; {q}]]`, `[[{a}, {b}, {c} | {p}; {d}, {e}, {f} | {q}; {g}, {h}, {k} | {r}]]` with `x = {x}, y = {y}, z = {z}` on a second line. More than 6 boxes draws compact cells (32 px, tap target still 44).',
  },
  ask('H87', 'equationInput', 'A unit label after a box that follows the unit menu', [
    's.11.circuits',
    'm.3.area~missing-side',
  ]),
  ask(
    'H88',
    'equationInput',
    'Hide zero parts of mixed numbers, blank chemical coefficient 1, stacked worked-out fractions',
    ['s.10.reaction-types', 'm.5.divide-unit-fractions~fraction-as-division'],
  ),
];
