/**
 * Course taxonomy
 *
 *   K–12:        Grade → Subject (math | science) → Skills
 *   Higher Ed:   Division (math | science | engineering) → Field → Course
 *
 * Rules
 * - Each K–12 skill is defined exactly once, in the grade where it is first taught.
 *   Later grades never repeat it; they reference it in `prereqs`, which the UI
 *   renders as a "Refresh: Grade X" link (see refreshLinks()).
 * - K–12 prereqs must point to an EARLIER grade.
 * - Higher-ed courses shared across engineering disciplines are defined once and
 *   cross-listed via `fields` (same no-repeat principle).
 * - Run validateTaxonomy() in CI to enforce all of the above.
 */

export const GRADES = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] as const;
export type Grade = (typeof GRADES)[number];
export type K12Subject = "math" | "science";
export type Division = "math" | "science" | "engineering";

/** Display titles for K–12 subjects and higher-ed divisions. */
export const SUBJECT_TITLES: Record<K12Subject, string> = { math: "Math", science: "Science" };
export const DIVISION_TITLES: Record<Division, string> = {
  math: "Math",
  science: "Science",
  engineering: "Engineering",
};

export interface Skill {
  id: string; // m.<grade>.<slug> | s.<grade>.<slug>
  title: string;
  grade: Grade;
  subject: K12Subject;
  strand: string;
  prereqs: string[];
}

export interface Course {
  id: string; // he.<field|engineering>.<slug>
  title: string;
  division: Division;
  /** Cross-listed fields; the first is the course's home field and leads in labels. */
  fields: string[];
  prereqs: string[];
  topics: string[];
}

export interface Field { id: string; title: string }

export const HE_FIELDS: Record<Division, Field[]> = {
  math: [{ id: "math", title: "Mathematics" }],
  science: [
    { id: "chemistry", title: "Chemistry" },
    { id: "physics", title: "Physics" },
    { id: "earth-science", title: "Earth Science" },
    { id: "geography", title: "Geography" },
    { id: "biology", title: "Biology" },
  ],
  engineering: [
    { id: "aerospace", title: "Aerospace" },
    { id: "mechanical", title: "Mechanical" },
    { id: "classical", title: "Classical (Engineering Mechanics)" },
    { id: "electrical", title: "Electrical" },
    { id: "bio", title: "Bioengineering" },
    { id: "chemical", title: "Chemical" },
    { id: "civil", title: "Civil" },
    { id: "computer", title: "Computer" },
  ],
};

// ─── K–12 ────────────────────────────────────────────────────────────────────

type Row = [slug: string, title: string, strand: string, prereqs?: string[]];

// Math strands (Common Core-aligned)
const CC = "Counting & Cardinality", OA = "Operations & Algebraic Thinking", NBT = "Number & Base Ten",
  NF = "Fractions", MD = "Measurement & Data", G = "Geometry", RP = "Ratios & Proportions",
  NS = "The Number System", EE = "Expressions & Equations", F = "Functions", SP = "Statistics & Probability",
  A1 = "Algebra 1", GEO = "Geometry", A2 = "Algebra 2", PC = "Precalculus & Statistics";
// Science strands (NGSS-aligned; HS sequence Bio → Chem → Physics → Earth & Space)
const PS = "Physical Science", LS = "Life Science", ESS = "Earth & Space Science",
  BIO = "Biology", CHEM = "Chemistry", PHYS = "Physics";

const MATH: Record<Grade, Row[]> = {
  "K": [
    ["count-100", "Count to 100 by ones and tens", CC],
    ["count-objects", "Count objects and tell how many", CC],
    ["compare-10", "Compare numbers within 10", CC],
    ["add-sub-10", "Add and subtract within 10", OA],
    ["make-10", "Make 10 from any number 1–9", OA],
    ["teens-place-value", "Teen numbers: 10 ones and some more ones", NBT],
    ["measurable-attributes", "Compare length, height, weight and capacity", MD],
    ["classify-count", "Sort things into groups and count them", MD],
    ["shapes-2d-3d", "Name flat and solid shapes", G],
    ["position-words", "Position words: in front of, behind, next to", G],
    ["compose-shapes", "Put shapes together to make bigger shapes", G],
  ],
  "1": [
    ["add-sub-20", "Add and subtract within 20", OA, ["m.K.add-sub-10", "m.K.make-10"]],
    ["addition-properties", "Add in any order or grouping", OA, ["m.K.add-sub-10"]],
    ["equal-sign", "The equal sign and missing numbers", OA],
    ["count-120", "Count, read and write numbers to 120", NBT, ["m.K.count-100"]],
    ["tens-ones", "Place value: tens and ones", NBT, ["m.K.teens-place-value"]],
    ["add-within-100", "Add within 100 using place value", NBT],
    ["measure-nonstandard", "Measure length with cubes or paper clips", MD, ["m.K.measurable-attributes"]],
    ["time-half-hour", "Tell time to the hour and half hour", MD],
    ["data-3-categories", "Sort and compare data in three groups", MD, ["m.K.classify-count"]],
    ["shape-attributes", "Shape attributes: sides, corners and closed shapes", G, ["m.K.shapes-2d-3d"]],
    ["halves-fourths", "Cut shapes into halves and fourths", G, ["m.K.shapes-2d-3d"]],
  ],
  "2": [
    ["add-sub-100-fluency", "Add and subtract fluently within 100", NBT, ["m.1.add-within-100", "m.1.add-sub-20"]],
    ["place-value-1000", "Place value to 1,000 (hundreds, tens, ones)", NBT, ["m.1.tens-ones"]],
    ["add-sub-1000", "Add and subtract within 1,000", NBT, ["m.1.tens-ones"]],
    ["skip-count", "Skip-count by 5s, 10s and 100s", NBT, ["m.1.count-120"]],
    ["even-odd", "Even and odd numbers", OA],
    ["arrays", "Equal groups and rectangular arrays", OA, ["m.1.add-sub-20"]],
    ["standard-length", "Measure length in inches, feet, centimeters and meters", MD, ["m.1.measure-nonstandard"]],
    ["money", "Word problems with dollars and cents", MD],
    ["time-5-min", "Tell time to the nearest five minutes (a.m./p.m.)", MD, ["m.1.time-half-hour"]],
    ["graphs-line-plots", "Picture graphs, bar graphs and line plots", MD, ["m.1.data-3-categories"]],
    ["thirds-polygons", "Thirds, and naming shapes and solids by sides, angles and faces", G, ["m.1.halves-fourths"]],
  ],
  "3": [
    ["multiply-divide-100", "Multiply and divide within 100", OA, ["m.2.arrays", "m.2.skip-count"]],
    ["multiplication-properties", "Properties of multiplication: order, grouping and breaking apart", OA, ["m.1.addition-properties"]],
    ["two-step-problems", "Two-step word problems with all four operations", OA],
    ["arithmetic-patterns", "Patterns in addition and multiplication tables", OA, ["m.2.even-odd"]],
    ["rounding", "Round to the nearest 10 or 100", NBT, ["m.2.place-value-1000"]],
    ["add-sub-1000", "Add and subtract within 1,000", NBT, ["m.2.add-sub-1000"]],
    ["multiply-by-tens", "Multiply by multiples of 10 (like 9 × 80)", NBT, ["m.2.skip-count"]],
    ["fractions-number-line", "Unit fractions and fractions on a number line", NF, ["m.2.thirds-polygons"]],
    ["compare-fractions", "Equivalent fractions and comparing fractions", NF],
    ["elapsed-time", "Time to the minute and elapsed time", MD, ["m.2.time-5-min"]],
    ["mass-liquid-volume", "Mass and liquid volume (g, kg, L)", MD],
    ["area", "Area of rectangles", MD],
    ["perimeter", "Perimeter of polygons", MD, ["m.2.standard-length"]],
    ["scaled-graphs", "Scaled picture and bar graphs", MD, ["m.2.graphs-line-plots"]],
    ["measure-line-plots", "Measure to the half and quarter inch; line plots", MD, ["m.2.standard-length", "m.2.graphs-line-plots"]],
    ["quadrilaterals", "Classify quadrilaterals", G, ["m.2.thirds-polygons"]],
  ],
  "4": [
    ["factors-multiples", "Factors, multiples, primes and composites", OA],
    ["place-value-million", "Place value and rounding to 1,000,000", NBT, ["m.3.rounding"]],
    ["multi-digit-multiply", "Multiply up to 4-digit × 1-digit and 2-digit × 2-digit", NBT, ["m.3.multiply-by-tens", "m.3.multiplication-properties"]],
    ["long-division", "Divide up to 4-digit numbers by 1-digit divisors", NBT, ["m.3.multiply-divide-100"]],
    ["fraction-equivalence", "Fraction equivalence with unlike denominators", NF, ["m.3.compare-fractions"]],
    ["add-fractions-like", "Add and subtract fractions and mixed numbers (like denominators)", NF, ["m.3.fractions-number-line"]],
    ["fraction-times-whole", "Multiply a fraction by a whole number", NF, ["m.3.multiply-divide-100"]],
    ["decimals-intro", "Decimal notation for tenths and hundredths", NF],
    ["unit-conversion", "Convert units within one measurement system", MD, ["m.3.mass-liquid-volume"]],
    ["area-perimeter-formulas", "Apply area and perimeter formulas", MD, ["m.3.area", "m.3.perimeter"]],
    ["angles", "Measure and draw angles in degrees", MD],
    ["lines-symmetry", "Parallel and perpendicular lines; line symmetry", G, ["m.3.quadrilaterals"]],
  ],
  "5": [
    ["order-of-operations", "Order of operations with parentheses", OA, ["m.3.two-step-problems"]],
    ["powers-of-ten", "Powers of 10 and exponent notation", NBT, ["m.4.place-value-million"]],
    ["standard-algorithm", "Fluent multi-digit multiplication (standard algorithm)", NBT, ["m.4.multi-digit-multiply"]],
    ["divide-2-digit", "Divide by 2-digit divisors", NBT, ["m.4.long-division"]],
    ["decimal-operations", "Four operations with decimals to hundredths", NBT, ["m.4.decimals-intro"]],
    ["add-fractions-unlike", "Add and subtract fractions with unlike denominators", NF, ["m.4.add-fractions-like", "m.4.fraction-equivalence"]],
    ["multiply-fractions", "Multiply fractions and mixed numbers", NF, ["m.4.fraction-times-whole"]],
    ["divide-unit-fractions", "Divide unit fractions and whole numbers", NF],
    ["volume-rectangular", "Volume of rectangular prisms (V = l × w × h)", MD, ["m.4.area-perimeter-formulas"]],
    ["coordinate-plane-q1", "Graph points in the first quadrant", G],
    ["classify-2d", "Classify 2D figures in a hierarchy", G, ["m.4.lines-symmetry"]],
  ],
  "6": [
    ["ratios", "Ratios and ratio tables", RP, ["m.5.multiply-fractions"]],
    ["unit-rates", "Unit rates (speed, price per unit)", RP, ["m.5.divide-2-digit"]],
    ["percent", "Percent of a quantity", RP, ["m.5.decimal-operations"]],
    ["divide-fractions", "Divide fractions by fractions", NS, ["m.5.divide-unit-fractions"]],
    ["gcf-lcm", "Greatest common factor and least common multiple", NS, ["m.4.factors-multiples"]],
    ["integers", "Negative numbers and absolute value", NS],
    ["coordinate-plane-4q", "Coordinate plane in all four quadrants", NS, ["m.5.coordinate-plane-q1"]],
    ["expressions-variables", "Write and evaluate expressions with variables and exponents", EE, ["m.5.order-of-operations", "m.5.powers-of-ten"]],
    ["one-step-equations", "One-step equations and inequalities", EE],
    ["area-polygons", "Area of triangles, parallelograms and trapezoids", G, ["m.4.area-perimeter-formulas"]],
    ["surface-area-nets", "Surface area using nets", G, ["m.5.volume-rectangular"]],
    ["center-spread", "Mean, median, mode, range and MAD", SP, ["m.3.scaled-graphs"]],
  ],
  "7": [
    ["proportional-relationships", "Proportional relationships and the constant of proportionality", RP, ["m.6.ratios", "m.6.unit-rates"]],
    ["percent-applications", "Tax, tip, markup, discount and percent change", RP, ["m.6.percent"]],
    ["rational-operations", "Operations with positive and negative rational numbers", NS, ["m.6.integers", "m.6.divide-fractions"]],
    ["two-step-equations", "Two-step equations and inequalities", EE, ["m.6.one-step-equations"]],
    ["scale-drawings", "Scale drawings", G, ["m.6.ratios"]],
    ["circles", "Circumference and area of circles", G, ["m.6.area-polygons"]],
    ["angle-relationships", "Supplementary, complementary, vertical and adjacent angles", G, ["m.4.angles"]],
    ["prisms", "Volume and surface area of prisms", G, ["m.6.surface-area-nets"]],
    ["sampling", "Random sampling and population inferences", SP, ["m.6.center-spread"]],
    ["probability", "Probability of simple and compound events", SP],
  ],
  "8": [
    ["roots-irrationals", "Square roots, cube roots and irrational numbers", NS, ["m.7.rational-operations"]],
    ["exponent-rules", "Integer exponent rules", EE, ["m.6.expressions-variables"]],
    ["scientific-notation", "Scientific notation", EE, ["m.5.powers-of-ten"]],
    ["slope", "Slope and rate of change", EE, ["m.7.proportional-relationships"]],
    ["multi-step-equations", "Linear equations with variables on both sides", EE, ["m.7.two-step-equations"]],
    ["systems-linear", "Systems of two linear equations", EE],
    ["functions-intro", "Functions: definition, tables and graphs", F, ["m.6.coordinate-plane-4q"]],
    ["linear-functions", "Linear functions (y = mx + b)", F],
    ["transformations", "Translations, rotations, reflections and dilations", G, ["m.7.scale-drawings"]],
    ["pythagorean", "Pythagorean theorem and distance between points", G],
    ["volume-curved", "Volume of cylinders, cones and spheres", G, ["m.7.circles", "m.7.prisms"]],
    ["scatter-plots", "Scatter plots and lines of fit", SP, ["m.7.sampling"]],
  ],
  "9": [
    ["linear-modeling", "Linear models: interpreting slope and intercept in context", A1, ["m.8.linear-functions", "m.8.slope"]],
    ["inequality-systems", "Linear inequalities and systems of inequalities", A1, ["m.8.systems-linear"]],
    ["absolute-value", "Absolute value equations and functions", A1, ["m.6.integers"]],
    ["polynomial-operations", "Add, subtract and multiply polynomials", A1, ["m.8.exponent-rules"]],
    ["factoring", "Factoring quadratics (GCF, trinomials, difference of squares)", A1, ["m.6.gcf-lcm"]],
    ["quadratic-functions", "Quadratic functions: graphs, vertex and roots", A1, ["m.8.functions-intro"]],
    ["quadratic-formula", "Quadratic formula and completing the square", A1, ["m.8.roots-irrationals"]],
    ["exponential-functions", "Exponential growth and decay", A1, ["m.7.percent-applications"]],
    ["radicals", "Simplifying radicals and rational exponents", A1, ["m.8.roots-irrationals"]],
    ["sequences", "Arithmetic and geometric sequences", A1, ["m.8.linear-functions"]],
    ["regression", "Correlation, residuals and linear regression", A1, ["m.8.scatter-plots"]],
  ],
  "10": [
    ["proofs", "Logic and geometric proofs", GEO, ["m.7.angle-relationships"]],
    ["congruence", "Triangle congruence (SSS, SAS, ASA, AAS)", GEO, ["m.8.transformations"]],
    ["similarity", "Similar triangles and proportional reasoning", GEO, ["m.8.transformations", "m.7.proportional-relationships"]],
    ["right-triangle-trig", "Right-triangle trigonometry (sin, cos, tan)", GEO, ["m.8.pythagorean"]],
    ["special-right-triangles", "Special right triangles (45-45-90, 30-60-90)", GEO, ["m.8.pythagorean", "m.9.radicals"]],
    ["coordinate-geometry", "Distance, midpoint and slope proofs on the coordinate plane", GEO, ["m.8.pythagorean", "m.8.slope"]],
    ["circle-theorems", "Arcs, chords, tangents and inscribed angles", GEO, ["m.7.circles"]],
    ["arc-sector", "Arc length, sector area and intro to radians", GEO, ["m.7.circles"]],
    ["volume-derivations", "Deriving area and volume formulas (Cavalieri's principle)", GEO, ["m.8.volume-curved"]],
    ["constructions", "Compass-and-straightedge constructions", GEO],
    ["conditional-probability", "Conditional probability and independence", GEO, ["m.7.probability"]],
  ],
  "11": [
    ["complex-numbers", "Complex numbers", A2, ["m.9.quadratic-formula"]],
    ["polynomial-functions", "Polynomial functions, division and the remainder theorem", A2, ["m.9.polynomial-operations", "m.9.factoring"]],
    ["rational-functions", "Rational expressions and functions", A2, ["m.9.factoring"]],
    ["inverse-functions", "Function composition and inverses", A2, ["m.8.functions-intro"]],
    ["logarithms", "Logarithms and log properties", A2, ["m.9.exponential-functions"]],
    ["exp-log-equations", "Exponential and logarithmic equations (incl. e)", A2, ["m.9.exponential-functions"]],
    ["unit-circle", "The unit circle and radian measure", A2, ["m.10.arc-sector", "m.10.special-right-triangles"]],
    ["trig-graphs", "Graphs of sine, cosine and tangent", A2, ["m.10.right-triangle-trig"]],
    ["pythagorean-identities", "Pythagorean trigonometric identities", A2, ["m.10.right-triangle-trig"]],
    ["series", "Arithmetic and geometric series (sigma notation)", A2, ["m.9.sequences"]],
    ["normal-distribution", "Normal distribution, z-scores and margin of error", A2, ["m.9.regression"]],
  ],
  "12": [
    ["law-sines-cosines", "Law of sines and law of cosines", PC, ["m.10.right-triangle-trig"]],
    ["trig-formulas-equations", "Sum, difference and double-angle formulas; trig equations", PC, ["m.11.pythagorean-identities"]],
    ["vectors", "Vectors: components, magnitude and dot product", PC, ["m.10.coordinate-geometry"]],
    ["matrices", "Matrix operations and solving systems with matrices", PC, ["m.8.systems-linear"]],
    ["polar", "Polar coordinates and polar form of complex numbers", PC, ["m.11.unit-circle", "m.11.complex-numbers"]],
    ["parametric", "Parametric equations", PC, ["m.8.functions-intro"]],
    ["conics", "Conic sections", PC, ["m.9.quadratic-functions"]],
    ["binomial-theorem", "Binomial theorem and combinatorics", PC, ["m.9.polynomial-operations"]],
    ["limits-intro", "Introduction to limits and continuity", PC, ["m.11.rational-functions"]],
    ["probability-distributions", "Discrete probability distributions and expected value", PC, ["m.10.conditional-probability"]],
    ["hypothesis-testing", "Introduction to hypothesis testing", PC, ["m.11.normal-distribution"]],
  ],
};

const SCIENCE: Record<Grade, Row[]> = {
  "K": [
    ["pushes-pulls", "Pushes and pulls change motion", PS],
    ["sunlight-warms", "Sunlight warms Earth's surface", PS],
    ["living-needs", "What plants and animals need to survive", LS],
    ["weather-patterns", "Observing local weather patterns", ESS],
    ["living-things-change-environment", "How living things change their environment", ESS],
  ],
  "1": [
    ["sound-vibration", "Sound comes from vibrating materials", PS],
    ["light-shadows", "Light, shadows and seeing objects", PS, ["s.K.sunlight-warms"]],
    ["structures-function", "Plant and animal parts and what they do", LS, ["s.K.living-needs"]],
    ["offspring", "Young plants and animals resemble their parents", LS],
    ["sky-patterns", "Patterns of the sun, moon and stars; daylight across seasons", ESS, ["s.K.weather-patterns"]],
  ],
  "2": [
    ["material-properties", "Properties of materials", PS],
    ["heating-cooling", "Reversible and irreversible changes from heating and cooling", PS, ["s.K.sunlight-warms"]],
    ["plant-growth-investigation", "Investigating what plants need to grow", LS, ["s.K.living-needs"]],
    ["pollination-dispersal", "Pollination and seed dispersal", LS, ["s.1.structures-function"]],
    ["habitats", "Biodiversity in habitats", LS],
    ["erosion-landforms", "Landforms and fast or slow Earth changes", ESS],
    ["water-on-earth", "Where water is found on Earth", ESS],
  ],
  "3": [
    ["balanced-forces", "Balanced and unbalanced forces", PS, ["s.K.pushes-pulls"]],
    ["magnets", "Magnetic and electric forces at a distance", PS],
    ["life-cycles", "Life cycles of organisms", LS, ["s.1.offspring"]],
    ["inherited-traits", "Inherited traits and environmental influence", LS, ["s.1.offspring"]],
    ["adaptation-fossils", "Adaptations, survival and fossils", LS, ["s.2.habitats"]],
    ["animal-groups", "Animals living in groups", LS, ["s.2.habitats"]],
    ["weather-climate", "Weather data and climate regions", ESS, ["s.K.weather-patterns"]],
  ],
  "4": [
    ["energy-speed", "Energy and speed; energy transfer in collisions", PS, ["s.3.balanced-forces"]],
    ["energy-conversion", "Energy conversion: light, heat, sound and electric current", PS, ["s.1.sound-vibration"]],
    ["wave-patterns", "Waves: amplitude and wavelength", PS, ["s.1.sound-vibration"]],
    ["vision-light", "How reflected light lets us see", PS, ["s.1.light-shadows"]],
    ["internal-structures", "Internal and external structures of organisms", LS, ["s.1.structures-function"]],
    ["weathering", "Weathering, erosion and rock-layer evidence", ESS, ["s.2.erosion-landforms"]],
    ["natural-resources", "Energy resources and natural hazards", ESS],
  ],
  "5": [
    ["particles-matter", "Matter is made of particles too small to see", PS, ["s.2.material-properties"]],
    ["conservation-mass", "Conservation of mass", PS, ["s.2.heating-cooling"]],
    ["mixtures", "Mixing substances and forming new substances", PS],
    ["gravity-down", "Earth's gravity pulls objects down", PS, ["s.3.balanced-forces"]],
    ["food-webs", "Matter and energy in food webs", LS, ["s.2.habitats"]],
    ["plants-sunlight-energy", "Plants use sunlight to make food", LS, ["s.2.plant-growth-investigation"]],
    ["earth-spheres", "Earth systems: geosphere, hydrosphere, atmosphere, biosphere", ESS, ["s.2.water-on-earth"]],
    ["sun-star-brightness", "The sun as a star; brightness and distance", ESS, ["s.1.sky-patterns"]],
    ["shadows-day-night", "Shadows, day and night, and seasonal star patterns", ESS, ["s.1.sky-patterns"]],
    ["protect-resources", "Protecting Earth's resources and environment", ESS, ["s.4.natural-resources"]],
  ],
  "6": [
    ["cells", "Cells as the basic unit of life", LS, ["s.4.internal-structures"]],
    ["cell-organelles", "Cell parts and their functions", LS],
    ["body-systems", "Body systems and how they interact", LS, ["s.4.internal-structures"]],
    ["density", "Density (ρ = m / V)", PS, ["s.5.particles-matter"]],
    ["water-cycle", "The water cycle", ESS, ["s.5.earth-spheres"]],
    ["weather-fronts", "Air masses, fronts and weather prediction", ESS, ["s.3.weather-climate"]],
    ["plate-tectonics", "Plate tectonics", ESS, ["s.4.weathering"]],
    ["rock-cycle", "The rock cycle", ESS, ["s.4.weathering"]],
  ],
  "7": [
    ["atoms-molecules", "Atoms, elements and molecules", PS, ["s.5.particles-matter"]],
    ["phase-changes", "States of matter and phase changes", PS, ["s.2.heating-cooling"]],
    ["chemical-reactions", "Chemical reactions and balancing basics", PS, ["s.5.conservation-mass", "s.5.mixtures"]],
    ["photosynthesis-respiration", "Photosynthesis and cellular respiration", LS, ["s.5.plants-sunlight-energy", "s.6.cell-organelles"]],
    ["ecosystem-energy", "Energy flow and matter cycling in ecosystems", LS, ["s.5.food-webs"]],
    ["punnett-squares", "Genes, alleles and Punnett squares", LS, ["s.3.inherited-traits"]],
    ["natural-selection", "Natural selection", LS, ["s.3.adaptation-fossils"]],
  ],
  "8": [
    ["motion", "Speed, velocity and acceleration", PS, ["s.4.energy-speed"]],
    ["newtons-laws", "Newton's three laws of motion", PS, ["s.3.balanced-forces"]],
    ["kinetic-potential", "Kinetic and potential energy", PS, ["s.4.energy-speed"]],
    ["em-spectrum", "Wave properties and the electromagnetic spectrum", PS, ["s.4.wave-patterns"]],
    ["electricity-basics", "Electric charge, current and simple circuits", PS, ["s.3.magnets"]],
    ["magnetic-fields", "Magnetic fields and electromagnets", PS, ["s.3.magnets"]],
    ["periodic-table", "The periodic table", PS, ["s.7.atoms-molecules"]],
    ["gravity-orbits", "Gravity and orbits in the solar system", ESS, ["s.5.gravity-down", "s.5.shadows-day-night"]],
  ],
  "9": [
    ["biomolecules", "Biomolecules: carbohydrates, lipids, proteins, nucleic acids", BIO, ["s.7.atoms-molecules"]],
    ["membrane-transport", "Cell membranes, diffusion and osmosis", BIO, ["s.6.cell-organelles"]],
    ["dna-protein-synthesis", "DNA replication, transcription and translation", BIO, ["s.7.punnett-squares"]],
    ["mitosis-meiosis", "Mitosis and meiosis", BIO, ["s.6.cells"]],
    ["inheritance-patterns", "Mendelian and non-Mendelian inheritance", BIO, ["s.7.punnett-squares"]],
    ["evolution-evidence", "Evidence for evolution and speciation", BIO, ["s.7.natural-selection"]],
    ["population-ecology", "Population growth and carrying capacity", BIO, ["s.7.ecosystem-energy"]],
    ["homeostasis", "Homeostasis and feedback loops", BIO, ["s.6.body-systems"]],
  ],
  "10": [
    ["atomic-structure", "Atomic structure, isotopes and electron configuration", CHEM, ["s.8.periodic-table"]],
    ["periodic-trends", "Periodic trends", CHEM, ["s.8.periodic-table"]],
    ["bonding", "Ionic, covalent and metallic bonding", CHEM, ["s.7.atoms-molecules"]],
    ["mole", "The mole and molar mass", CHEM, ["m.8.scientific-notation"]],
    ["stoichiometry", "Stoichiometry and limiting reactants", CHEM, ["s.7.chemical-reactions"]],
    ["gas-laws", "Gas laws (PV = nRT)", CHEM, ["s.7.phase-changes"]],
    ["molarity", "Solutions and molarity", CHEM, ["s.6.density"]],
    ["acids-bases", "Acids, bases and pH", CHEM, ["m.8.scientific-notation"]],
    ["thermochemistry", "Thermochemistry and enthalpy", CHEM, ["s.8.kinetic-potential"]],
    ["rates-equilibrium", "Reaction rates and chemical equilibrium", CHEM],
  ],
  "11": [
    ["kinematics-2d", "Kinematics in 1D and 2D; projectile motion", PHYS, ["s.8.motion", "m.10.right-triangle-trig"]],
    ["dynamics-vectors", "Forces with vectors: friction, inclines and tension", PHYS, ["s.8.newtons-laws"]],
    ["work-energy-power", "Work, conservation of energy and power", PHYS, ["s.8.kinetic-potential"]],
    ["momentum", "Momentum, impulse and collisions", PHYS, ["s.8.newtons-laws"]],
    ["circular-gravitation", "Circular motion and universal gravitation", PHYS, ["s.8.gravity-orbits"]],
    ["sound-waves", "Sound, standing waves and the Doppler effect", PHYS, ["s.8.em-spectrum"]],
    ["circuits", "Circuits: Ohm's law, series and parallel", PHYS, ["s.8.electricity-basics"]],
    ["electromagnetism", "Electric fields, magnetic forces and induction", PHYS, ["s.8.magnetic-fields"]],
    ["optics", "Reflection, refraction and lenses", PHYS, ["s.8.em-spectrum"]],
  ],
  "12": [
    ["stellar-evolution", "Stellar evolution and nucleosynthesis", ESS, ["s.5.sun-star-brightness"]],
    ["cosmology", "Big Bang evidence and cosmology basics", ESS],
    ["earth-interior", "Earth's interior and seismic waves", ESS, ["s.6.plate-tectonics"]],
    ["radiometric-dating", "Geologic time and radiometric dating", ESS, ["s.6.rock-cycle", "m.9.exponential-functions"]],
    ["climate-systems", "Climate systems, feedbacks and climate change", ESS, ["s.6.weather-fronts"]],
    ["ocean-atmosphere", "Ocean currents and ocean–atmosphere interaction", ESS, ["s.6.water-cycle"]],
    ["resource-management", "Human impacts and resource management", ESS, ["s.4.natural-resources"]],
  ],
};

function buildSkills(subject: K12Subject, data: Record<Grade, Row[]>): Skill[] {
  const prefix = subject === "math" ? "m" : "s";
  return GRADES.flatMap((grade) =>
    data[grade].map(([slug, title, strand, prereqs = []]) => ({
      id: `${prefix}.${grade}.${slug}`, title, grade, subject, strand, prereqs,
    })),
  );
}

export const SKILLS: Skill[] = [...buildSkills("math", MATH), ...buildSkills("science", SCIENCE)];

// ─── Higher Education ────────────────────────────────────────────────────────

const math = (slug: string, title: string, prereqs: string[], topics: string[]): Course =>
  ({ id: `he.math.${slug}`, title, division: "math", fields: ["math"], prereqs, topics });

const sci = (field: string) => (slug: string, title: string, prereqs: string[], topics: string[]): Course =>
  ({ id: `he.${field}.${slug}`, title, division: "science", fields: [field], prereqs, topics });

const eng = (slug: string, title: string, fields: string[], prereqs: string[], topics: string[]): Course =>
  ({ id: `he.engineering.${slug}`, title, division: "engineering", fields, prereqs, topics });

const chem = sci("chemistry"), phys = sci("physics"), earth = sci("earth-science"),
  geog = sci("geography"), bio = sci("biology");

export const COURSES: Course[] = [
  // Math
  math("calc-1", "Calculus I", ["m.12.limits-intro", "m.11.unit-circle", "m.11.exp-log-equations"],
    ["Limits and continuity", "Derivatives and differentiation rules", "Related rates and optimization", "Definite integrals and the Fundamental Theorem", "u-substitution"]),
  math("calc-2", "Calculus II", ["he.math.calc-1"],
    ["Integration by parts, partial fractions, trig substitution", "Improper integrals", "Volume, arc length and work", "Sequences, series and convergence tests", "Taylor and power series", "Parametric and polar calculus"]),
  math("calc-3", "Calculus III (Multivariable)", ["he.math.calc-2", "m.12.vectors"],
    ["Vectors and 3D geometry", "Partial derivatives and gradients", "Multiple integrals", "Line and surface integrals", "Green's, Stokes' and Divergence theorems"]),
  math("diff-eq", "Differential Equations", ["he.math.calc-2"],
    ["First-order ODEs", "Second-order linear ODEs", "Laplace transforms", "Systems of ODEs", "Series solutions"]),
  math("linear-algebra", "Linear Algebra", ["m.12.matrices"],
    ["Row reduction", "Vector spaces and subspaces", "Determinants", "Eigenvalues and eigenvectors", "Orthogonality and least squares"]),

  // Chemistry
  chem("gen-chem-1", "General Chemistry I", ["s.10.stoichiometry", "s.10.gas-laws"],
    ["Atomic structure and periodicity", "Stoichiometry", "Gases", "Thermochemistry", "Bonding and molecular geometry"]),
  chem("gen-chem-2", "General Chemistry II", ["he.chemistry.gen-chem-1"],
    ["Kinetics", "Equilibrium", "Acid–base equilibria and buffers", "Entropy and Gibbs free energy", "Electrochemistry"]),
  chem("organic-1", "Organic Chemistry I", ["he.chemistry.gen-chem-2"],
    ["Structure and nomenclature", "Stereochemistry", "Substitution and elimination", "Alkenes and alkynes", "IR and NMR spectroscopy"]),
  chem("organic-2", "Organic Chemistry II", ["he.chemistry.organic-1"],
    ["Aromatic chemistry", "Carbonyl chemistry", "Carboxylic acid derivatives", "Amines", "Multistep synthesis"]),
  chem("analytical", "Analytical Chemistry", ["he.chemistry.gen-chem-2"],
    ["Error analysis and statistics", "Titrations", "Spectrophotometry (Beer–Lambert)", "Chromatography", "Electroanalytical methods"]),
  chem("physical-1", "Physical Chemistry I: Thermodynamics & Kinetics", ["he.chemistry.gen-chem-2", "he.math.calc-3"],
    ["Laws of thermodynamics", "Phase equilibria", "Chemical equilibrium", "Rate laws and mechanisms"]),
  chem("physical-2", "Physical Chemistry II: Quantum & Spectroscopy", ["he.chemistry.physical-1", "he.math.diff-eq"],
    ["Schrödinger equation", "Particle in a box and harmonic oscillator", "Hydrogen atom", "Molecular orbital theory", "Spectroscopy"]),
  chem("biochemistry", "Biochemistry", ["he.chemistry.organic-2"],
    ["Protein structure", "Enzyme kinetics (Michaelis–Menten)", "Metabolic pathways", "Bioenergetics"]),
  chem("inorganic", "Inorganic Chemistry", ["he.chemistry.gen-chem-2"],
    ["Symmetry and group theory", "Coordination chemistry", "Crystal field theory", "Solid-state structures"]),

  // Physics
  phys("university-1", "University Physics I: Mechanics", ["s.11.kinematics-2d", "he.math.calc-1"],
    ["Kinematics", "Newton's laws", "Work and energy", "Momentum", "Rotation and torque", "Oscillations"]),
  phys("university-2", "University Physics II: Electricity & Magnetism", ["he.physics.university-1", "he.math.calc-2"],
    ["Electric fields and Gauss's law", "Potential and capacitance", "DC circuits", "Magnetic fields and induction", "AC circuits"]),
  phys("university-3", "University Physics III: Waves, Optics & Modern", ["he.physics.university-2"],
    ["Waves", "Interference and diffraction", "Special relativity", "Photons and quantum basics", "Nuclear physics"]),
  phys("classical-mechanics", "Classical Mechanics", ["he.physics.university-1", "he.math.diff-eq"],
    ["Lagrangian mechanics", "Hamiltonian mechanics", "Central forces", "Rigid-body motion", "Coupled oscillations"]),
  phys("electromagnetism", "Electromagnetic Theory", ["he.physics.university-2", "he.math.calc-3"],
    ["Electrostatics", "Magnetostatics", "Maxwell's equations", "Electromagnetic waves"]),
  phys("quantum", "Quantum Mechanics", ["he.physics.university-3", "he.math.linear-algebra", "he.math.diff-eq"],
    ["Wavefunctions and operators", "Solving the Schrödinger equation", "Angular momentum and spin", "Perturbation theory"]),
  phys("thermal-statistical", "Thermal & Statistical Physics", ["he.physics.university-3"],
    ["Laws of thermodynamics", "Entropy and ensembles", "Partition functions", "Quantum statistics"]),

  // Earth Science
  earth("physical-geology", "Physical Geology", ["s.12.earth-interior"],
    ["Minerals and rocks", "Plate tectonics", "Earthquakes and volcanoes", "Surface processes"]),
  earth("historical-geology", "Historical Geology", ["he.earth-science.physical-geology"],
    ["Stratigraphy", "Radiometric dating", "The fossil record", "Earth history"]),
  earth("mineralogy", "Mineralogy", ["he.earth-science.physical-geology", "he.chemistry.gen-chem-1"],
    ["Crystallography", "Mineral chemistry", "Optical mineralogy"]),
  earth("meteorology", "Meteorology", ["s.12.climate-systems", "he.math.calc-1"],
    ["Atmospheric structure", "Atmospheric thermodynamics", "Clouds and precipitation", "Weather systems and forecasting"]),
  earth("oceanography", "Oceanography", ["s.12.ocean-atmosphere"],
    ["Ocean basins", "Seawater chemistry", "Currents and circulation", "Waves and tides"]),
  earth("hydrology", "Hydrology", ["he.math.calc-1"],
    ["Water budgets", "Surface runoff", "Groundwater flow (Darcy's law)", "Flood frequency"]),
  earth("geophysics", "Geophysics", ["he.physics.university-2", "he.earth-science.physical-geology"],
    ["Seismology", "Gravity and magnetics", "Heat flow", "Geophysical imaging"]),

  // Geography
  geog("physical-geography", "Physical Geography", ["s.12.climate-systems"],
    ["Earth–sun relationships", "Climate classification", "Landforms", "Biogeography"]),
  geog("human-geography", "Human Geography", [],
    ["Population and migration", "Urbanization", "Economic geography", "Cultural landscapes"]),
  geog("cartography", "Cartography", ["m.10.coordinate-geometry"],
    ["Map projections", "Scale and coordinate systems", "Thematic mapping", "Map design"]),
  geog("gis", "Geographic Information Systems (GIS)", ["he.geography.cartography"],
    ["Vector and raster data", "Spatial analysis", "Geoprocessing", "Spatial statistics"]),
  geog("climatology", "Climatology", ["he.geography.physical-geography"],
    ["Energy balance", "General circulation", "Climate variability", "Climate models"]),
  geog("remote-sensing", "Remote Sensing", ["he.geography.gis"],
    ["Electromagnetic radiation and sensors", "Image processing", "Classification", "Change detection"]),

  // Biology
  bio("principles-1", "Principles of Biology I", ["s.9.dna-protein-synthesis"],
    ["Chemistry of life", "Cell structure", "Metabolism", "Cell division", "Genetics"]),
  bio("principles-2", "Principles of Biology II", ["he.biology.principles-1"],
    ["Evolution", "Biodiversity", "Plant form and function", "Animal form and function", "Ecology"]),
  bio("genetics", "Genetics", ["he.biology.principles-1"],
    ["Pedigrees and Mendelian genetics", "Linkage and mapping", "Molecular genetics", "Population genetics (Hardy–Weinberg)"]),
  bio("cell-molecular", "Cell & Molecular Biology", ["he.biology.principles-1", "he.chemistry.gen-chem-2"],
    ["Membrane biology", "Signal transduction", "Gene regulation", "Cell-cycle control"]),
  bio("microbiology", "Microbiology", ["he.biology.principles-1"],
    ["Microbial structure", "Microbial growth", "Microbial genetics", "Immunology and pathogens"]),
  bio("ecology", "Ecology", ["he.biology.principles-2"],
    ["Population dynamics", "Community interactions", "Ecosystem energetics", "Conservation biology"]),
  bio("evolution", "Evolutionary Biology", ["he.biology.principles-2", "he.biology.genetics"],
    ["Natural selection", "Genetic drift", "Phylogenetics", "Speciation"]),
  bio("anatomy-physiology", "Human Anatomy & Physiology", ["s.9.homeostasis"],
    ["Tissues", "Musculoskeletal system", "Nervous system", "Cardiovascular and respiratory systems"]),

  // Engineering — shared core (defined once, cross-listed)
  eng("statics", "Statics", ["classical", "aerospace", "mechanical", "civil", "bio"], ["he.physics.university-1", "he.math.calc-1"],
    ["Force vectors and equilibrium", "Trusses and frames", "Centroids", "Moments of inertia", "Friction"]),
  eng("dynamics", "Dynamics", ["classical", "aerospace", "mechanical", "civil"], ["he.engineering.statics", "he.math.calc-2"],
    ["Particle kinematics", "Kinetics of particles", "Work–energy and impulse–momentum", "Rigid-body dynamics"]),
  eng("mechanics-of-materials", "Mechanics of Materials (Solid Mechanics I)", ["classical", "aerospace", "mechanical", "civil", "bio"], ["he.engineering.statics"],
    ["Stress and strain", "Axial loading", "Torsion", "Bending and shear", "Beam deflection", "Column buckling"]),
  eng("materials-science", "Materials Science & Material Properties", ["classical", "aerospace", "mechanical", "civil", "chemical", "bio"], ["he.chemistry.gen-chem-1"],
    ["Crystal structures", "Defects and diffusion", "Phase diagrams", "Mechanical properties"]),
  eng("thermodynamics", "Engineering Thermodynamics", ["aerospace", "mechanical"], ["he.physics.university-1", "he.math.calc-2"],
    ["Properties of pure substances", "First law", "Second law and entropy", "Power and refrigeration cycles"]),
  eng("fluid-mechanics", "Fluid Mechanics", ["aerospace", "mechanical", "civil", "chemical"], ["he.physics.university-1", "he.math.diff-eq"],
    ["Fluid statics", "Bernoulli equation", "Control-volume analysis", "Dimensional analysis", "Pipe flow", "Boundary layers"]),
  eng("heat-transfer", "Heat Transfer", ["aerospace", "mechanical", "chemical"], ["he.engineering.thermodynamics", "he.math.diff-eq"],
    ["Conduction", "Convection", "Radiation", "Heat exchangers"]),
  eng("control-systems", "Control Systems", ["aerospace", "mechanical", "electrical"], ["he.math.diff-eq"],
    ["Laplace-domain modeling", "Transfer functions", "Stability and root locus", "Frequency response", "PID control"]),
  eng("circuits-1", "Circuit Analysis I", ["electrical", "computer", "bio"], ["he.physics.university-2"],
    ["Ohm's and Kirchhoff's laws", "Node and mesh analysis", "Thévenin and Norton equivalents", "Op-amps", "RC and RL transients"]),
  eng("digital-logic", "Digital Logic Design", ["electrical", "computer"], [],
    ["Number systems and Boolean algebra", "Combinational logic", "Sequential logic and flip-flops", "State machines"]),
  eng("signals-systems", "Signals & Systems", ["electrical", "computer", "bio"], ["he.math.diff-eq"],
    ["Continuous and discrete signals", "Convolution", "Fourier series and transforms", "Laplace and z-transforms", "Sampling"]),

  // Aerospace
  eng("aerodynamics", "Aerodynamics", ["aerospace"], ["he.engineering.fluid-mechanics"],
    ["Airfoil theory", "Lift and drag", "Finite wings", "Intro to compressibility"]),
  eng("compressible-flow", "Compressible Flow", ["aerospace"], ["he.engineering.aerodynamics", "he.engineering.thermodynamics"],
    ["Isentropic flow", "Normal and oblique shocks", "Nozzle flow", "Supersonic aerodynamics"]),
  eng("flight-mechanics", "Flight Mechanics, Stability & Control", ["aerospace"], ["he.engineering.aerodynamics", "he.engineering.dynamics"],
    ["Aircraft performance", "Static stability", "Dynamic stability", "Flight control"]),
  eng("aerospace-structures", "Aerospace Structures", ["aerospace"], ["he.engineering.mechanics-of-materials"],
    ["Thin-walled structures", "Composites", "Buckling", "Fatigue"]),
  eng("propulsion", "Propulsion", ["aerospace"], ["he.engineering.thermodynamics", "he.engineering.compressible-flow"],
    ["Gas turbine cycles", "Rocket propulsion", "Nozzle performance", "Combustion"]),
  eng("orbital-mechanics", "Orbital Mechanics", ["aerospace"], ["he.engineering.dynamics"],
    ["Two-body problem", "Orbital elements", "Orbital maneuvers", "Interplanetary transfers"]),

  // Mechanical
  eng("machine-design", "Machine Design", ["mechanical"], ["he.engineering.mechanics-of-materials"],
    ["Failure theories", "Fatigue", "Shafts and bearings", "Gears and fasteners"]),
  eng("vibrations", "Mechanical Vibrations", ["mechanical"], ["he.engineering.dynamics", "he.math.diff-eq"],
    ["Free vibration", "Forced vibration and resonance", "Damping", "Multi-degree-of-freedom systems"]),
  eng("manufacturing", "Manufacturing Processes", ["mechanical"], ["he.engineering.materials-science"],
    ["Casting and forming", "Machining", "Additive manufacturing", "Tolerances"]),

  // Electrical
  eng("circuits-2", "Circuit Analysis II", ["electrical"], ["he.engineering.circuits-1"],
    ["Phasors and AC steady state", "AC power", "Frequency response and filters", "Transformers", "Three-phase circuits"]),
  eng("electronics", "Electronics", ["electrical"], ["he.engineering.circuits-1"],
    ["Diodes", "BJTs and MOSFETs", "Amplifiers", "Op-amp circuits"]),
  eng("electromagnetics", "Engineering Electromagnetics", ["electrical"], ["he.physics.university-2", "he.math.calc-3"],
    ["Transmission lines", "Maxwell's equations", "Wave propagation", "Antennas"]),
  eng("power-systems", "Power Systems", ["electrical"], ["he.engineering.circuits-2"],
    ["Power flow", "Transformers and machines", "Fault analysis", "Grid stability"]),
  eng("communication-systems", "Communication Systems", ["electrical"], ["he.engineering.signals-systems"],
    ["AM and FM", "Digital modulation", "Noise", "Information theory basics"]),

  // Bioengineering
  eng("biomechanics", "Biomechanics", ["bio"], ["he.engineering.mechanics-of-materials"],
    ["Tissue mechanics", "Joint forces", "Gait analysis", "Viscoelasticity"]),
  eng("biomaterials", "Biomaterials", ["bio"], ["he.engineering.materials-science"],
    ["Biocompatibility", "Metals, polymers and ceramics in the body", "Degradation", "Implant design"]),
  eng("biotransport", "Biotransport", ["bio"], ["he.math.diff-eq", "he.biology.anatomy-physiology"],
    ["Diffusion in tissue", "Blood flow", "Mass transfer", "Pharmacokinetics"]),
  eng("bioinstrumentation", "Bioinstrumentation", ["bio"], ["he.engineering.circuits-1"],
    ["Biosensors", "Biopotential amplifiers", "Medical imaging basics", "Signal filtering"]),
  eng("tissue-engineering", "Tissue Engineering", ["bio"], ["he.biology.cell-molecular"],
    ["Scaffolds", "Cell–material interactions", "Bioreactors"]),

  // Chemical
  eng("material-energy-balances", "Material & Energy Balances", ["chemical"], ["he.chemistry.gen-chem-2", "he.math.calc-2"],
    ["Process flow diagrams", "Material balances", "Reactive systems", "Energy balances"]),
  eng("chemical-thermodynamics", "Chemical Engineering Thermodynamics", ["chemical"], ["he.engineering.material-energy-balances"],
    ["Equations of state", "Fugacity", "Vapor–liquid equilibrium", "Reaction equilibria"]),
  eng("transport-phenomena", "Transport Phenomena", ["chemical"], ["he.engineering.fluid-mechanics", "he.engineering.heat-transfer"],
    ["Momentum transport", "Heat transport", "Mass transport", "Transport analogies"]),
  eng("separations", "Separation Processes", ["chemical"], ["he.engineering.chemical-thermodynamics"],
    ["Distillation", "Absorption", "Extraction", "Membranes"]),
  eng("reaction-engineering", "Chemical Reaction Engineering", ["chemical"], ["he.engineering.chemical-thermodynamics", "he.math.diff-eq"],
    ["Rate laws", "Batch, CSTR and PFR design", "Multiple reactions", "Catalysis"]),
  eng("process-control", "Process Dynamics & Control", ["chemical"], ["he.math.diff-eq"],
    ["Process dynamics", "Feedback control", "Controller tuning", "Control-loop design"]),
  eng("process-design", "Process Design", ["chemical"], ["he.engineering.separations", "he.engineering.reaction-engineering"],
    ["Flowsheet synthesis", "Equipment sizing", "Process economics", "Process safety"]),

  // Civil
  eng("structural-analysis", "Structural Analysis", ["civil"], ["he.engineering.mechanics-of-materials"],
    ["Determinate structures", "Influence lines", "Indeterminate structures", "Matrix methods"]),
  eng("soil-mechanics", "Soil Mechanics", ["civil"], ["he.engineering.mechanics-of-materials"],
    ["Soil classification", "Compaction", "Consolidation", "Shear strength", "Bearing capacity"]),
  eng("hydraulics-hydrology", "Hydraulics & Hydrology", ["civil"], ["he.engineering.fluid-mechanics"],
    ["Open-channel flow", "Pipe networks", "Rainfall–runoff", "Stormwater design"]),
  eng("transportation", "Transportation Engineering", ["civil"], ["he.math.calc-1"],
    ["Traffic flow", "Geometric design", "Pavement design", "Capacity analysis"]),
  eng("steel-design", "Steel Design", ["civil"], ["he.engineering.structural-analysis"],
    ["LRFD", "Tension and compression members", "Beams", "Connections"]),
  eng("concrete-design", "Reinforced Concrete Design", ["civil"], ["he.engineering.structural-analysis"],
    ["Flexure", "Shear", "Columns", "Slabs and footings"]),
  eng("environmental", "Environmental Engineering", ["civil"], ["he.chemistry.gen-chem-1"],
    ["Water treatment", "Wastewater treatment", "Air pollution", "Solid waste"]),
  eng("surveying", "Surveying", ["civil"], ["m.10.right-triangle-trig"],
    ["Distance and angle measurement", "Leveling", "Traverse computations", "GNSS"]),

  // Computer
  eng("discrete-math", "Discrete Mathematics", ["computer"], ["m.12.binomial-theorem"],
    ["Logic and proofs", "Sets and functions", "Combinatorics", "Graph theory", "Recurrences"]),
  eng("data-structures", "Data Structures & Algorithms", ["computer"], ["he.engineering.discrete-math"],
    ["Lists, stacks and queues", "Trees and graphs", "Sorting and searching", "Big-O analysis"]),
  eng("computer-architecture", "Computer Organization & Architecture", ["computer"], ["he.engineering.digital-logic"],
    ["Instruction sets", "Datapath and control", "Pipelining", "Memory hierarchy"]),
  eng("embedded-systems", "Embedded Systems", ["computer"], ["he.engineering.computer-architecture", "he.engineering.circuits-1"],
    ["Microcontrollers", "Interrupts and timers", "Serial protocols", "Real-time constraints"]),
  eng("operating-systems", "Operating Systems", ["computer"], ["he.engineering.computer-architecture", "he.engineering.data-structures"],
    ["Processes and threads", "Scheduling", "Memory management", "File systems"]),
  eng("networks", "Computer Networks", ["computer"], ["he.engineering.data-structures"],
    ["Layered models", "TCP/IP", "Routing", "Network performance"]),

  // Classical (Engineering Mechanics) — shared core above is cross-listed; below are its own courses
  eng("engineering-programming", "Engineering Programming (MATLAB/Python)", ["classical", "mechanical", "aerospace", "civil", "chemical", "bio"], ["he.math.calc-1"],
    ["Variables, arrays and control flow", "Vectorized computation", "Plotting and data import", "Scripting engineering calculations"]),
  eng("cad-graphics", "Engineering Graphics & CAD", ["classical", "mechanical", "aerospace", "civil"], ["m.10.constructions"],
    ["Orthographic and isometric projection", "Dimensioning and GD&T basics", "Parametric solid modeling", "Assemblies and drawings"]),
  eng("numerical-methods", "Numerical Methods for Engineers", ["classical", "mechanical", "aerospace", "civil", "chemical", "electrical"], ["he.engineering.engineering-programming", "he.math.diff-eq", "he.math.linear-algebra"],
    ["Root finding", "Solving linear systems", "Interpolation and curve fitting", "Numerical integration", "Numerical ODE solvers (Euler, Runge–Kutta)"]),
  eng("advanced-solid-mechanics", "Advanced Solid Mechanics (Solid Mechanics II)", ["classical", "mechanical", "aerospace", "civil"], ["he.engineering.mechanics-of-materials", "he.math.linear-algebra"],
    ["Stress and strain tensors", "Generalized Hooke's law", "Energy methods", "Plasticity and failure criteria", "Plates and shells"]),
  eng("finite-element-analysis", "Finite Element Analysis", ["classical", "mechanical", "aerospace", "civil"], ["he.engineering.numerical-methods", "he.engineering.mechanics-of-materials"],
    ["Direct stiffness method", "Shape functions", "Truss, beam and 2D elements", "Meshing and convergence", "Interpreting FEA results"]),
];

// ─── Lookups & navigation ────────────────────────────────────────────────────

type Node = Skill | Course;
const NODES = new Map<string, Node>([...SKILLS, ...COURSES].map((n) => [n.id, n]));

export const gradeLabel = (g: Grade) => (g === "K" ? "Kindergarten" : `Grade ${g}`);

export const getNode = (id: string) => NODES.get(id);

export const skillsFor = (grade: Grade, subject: K12Subject) =>
  SKILLS.filter((s) => s.grade === grade && s.subject === subject);

export const coursesFor = (division: Division, field: string) =>
  COURSES.filter((c) => c.division === division && c.fields.includes(field));

/** "Refresh" links rendered under a skill/course, pointing back to where each prereq was taught. */
export function refreshLinks(id: string) {
  const node = NODES.get(id);
  if (!node) return [];
  return node.prereqs.flatMap((p) => {
    const target = NODES.get(p);
    if (!target) return [];
    // Skills name the subject too, since a prereq can be in another subject ("Grade 8 · Math").
    const where = "grade" in target
      ? `${gradeLabel(target.grade)} · ${SUBJECT_TITLES[target.subject]}`
      : target.title;
    return [{ id: target.id, title: target.title, label: `Refresh: ${where}` }];
  });
}

// ─── Validation (run in CI) ──────────────────────────────────────────────────

export function validateTaxonomy() {
  const errors: string[] = [];
  const warnings: string[] = [];
  const all: Node[] = [...SKILLS, ...COURSES];

  const seen = new Set<string>();
  for (const n of all) {
    if (seen.has(n.id)) errors.push(`Duplicate id: ${n.id}`);
    seen.add(n.id);
  }

  // No-repeat rule: a K–12 skill title may appear only once per subject.
  const firstTaught = new Map<string, Grade>();
  for (const s of SKILLS) {
    const key = `${s.subject}:${s.title.toLowerCase()}`;
    const prior = firstTaught.get(key);
    if (prior) errors.push(`"${s.title}" repeated in ${gradeLabel(s.grade)} (first taught in ${gradeLabel(prior)})`);
    else firstTaught.set(key, s.grade);
  }

  const rank = (n: Node) => ("grade" in n ? GRADES.indexOf(n.grade) : GRADES.length);
  for (const n of all) {
    for (const p of n.prereqs) {
      const target = NODES.get(p);
      if (!target) { errors.push(`${n.id}: unknown prereq ${p}`); continue; }
      if ("grade" in n && rank(target) >= rank(n)) errors.push(`${n.id}: prereq ${p} must come from an earlier grade`);
    }
  }

  // Cycle detection
  const state = new Map<string, 1 | 2>();
  const visit = (id: string, path: string[]): void => {
    if (state.get(id) === 2) return;
    if (state.get(id) === 1) { errors.push(`Prereq cycle: ${[...path, id].join(" → ")}`); return; }
    state.set(id, 1);
    for (const p of NODES.get(id)?.prereqs ?? []) if (NODES.has(p)) visit(p, [...path, id]);
    state.set(id, 2);
  };
  for (const n of all) visit(n.id, []);

  for (const division of ["math", "science", "engineering"] as const) {
    for (const f of HE_FIELDS[division]) {
      if (coursesFor(division, f.id).length === 0) warnings.push(`${division}/${f.id} has no courses`);
    }
  }

  for (const c of COURSES) {
    const known = new Set(HE_FIELDS[c.division].map((f) => f.id));
    for (const f of c.fields) if (!known.has(f)) errors.push(`${c.id}: unknown field ${f}`);
    if (c.topics.length === 0) errors.push(`${c.id}: no topics`);
    const topics = new Set<string>();
    for (const t of c.topics) {
      if (topics.has(t.toLowerCase())) errors.push(`${c.id}: topic "${t}" listed twice`);
      topics.add(t.toLowerCase());
    }
  }

  // Skills of one strand sit together in each grade, so file order is teaching order.
  for (const subject of ["math", "science"] as const) {
    for (const grade of GRADES) {
      const strands = skillsFor(grade, subject).map((s) => s.strand);
      const done = new Set<string>();
      strands.forEach((strand, i) => {
        if (i > 0 && strands[i - 1] !== strand) {
          if (done.has(strand)) warnings.push(`${gradeLabel(grade)} ${subject}: ${strand} is split up`);
          done.add(strands[i - 1]!);
        }
      });
    }
  }

  return { errors, warnings };
}
