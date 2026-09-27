# Coverage of the reference question set

Generated from the JSONL files by `validate.py` (see the end of this page). Reference only —
never bundled or imported by the app. Sources and licenses: `SOURCES.md`.

## Totals by source

| Source                   | Questions |
| ------------------------ | --------: |
| NAEP (NCES)              |       616 |
| Illustrative Mathematics |       549 |
| **Total**                |  **1165** |

## Totals by subject and file grade

| Subject |   K |   1 |   2 |   3 |   4 |   5 |   6 |   7 |   8 | Total |
| ------- | --: | --: | --: | --: | --: | --: | --: | --: | --: | ----: |
| math    |  40 |  60 |  53 |  64 | 307 |  83 |  73 |  42 | 237 |   959 |
| science |   0 |   0 |   0 |   0 | 101 |   0 |   0 |   0 | 105 |   206 |

## Questions per skill (every K–8 skill in taxonomy.ts)

Filed: the question's `skillId`. Also: questions filed elsewhere that list this skill in
`alsoSkills` (an idea tested later that this lesson teaches).

| Skill id                               | Title                                                                   | Filed | Also |
| -------------------------------------- | ----------------------------------------------------------------------- | ----: | ---: |
| `m.K.count-100`                        | Count to 100 by ones and tens                                           |     1 |    0 |
| `m.K.count-objects`                    | Count objects and tell how many                                         |     8 |    0 |
| `m.K.compare-10`                       | Compare numbers within 10                                               |     8 |    0 |
| `m.K.add-sub-10`                       | Add and subtract within 10                                              |     8 |    0 |
| `m.K.make-10`                          | Make 10 from any number 1–9                                             |     8 |    0 |
| `m.K.teens-place-value`                | Teen numbers: 10 ones and some more ones                                |     8 |    0 |
| `m.K.measurable-attributes`            | Compare length, height, weight and capacity                             |     6 |    0 |
| `m.K.classify-count`                   | Sort things into groups and count them                                  |     0 |    0 |
| `m.K.shapes-2d-3d`                     | Name flat and solid shapes                                              |    10 |    0 |
| `m.K.position-words`                   | Position words: in front of, behind, next to                            |     0 |    0 |
| `m.K.compose-shapes`                   | Put shapes together to make bigger shapes                               |    10 |    0 |
| `m.1.add-sub-20`                       | Add and subtract within 20                                              |     8 |    0 |
| `m.1.addition-properties`              | Add in any order or grouping                                            |     0 |    0 |
| `m.1.equal-sign`                       | The equal sign and missing numbers                                      |    11 |    0 |
| `m.1.count-120`                        | Count, read and write numbers to 120                                    |     2 |    0 |
| `m.1.tens-ones`                        | Place value: tens and ones                                              |     8 |    0 |
| `m.1.add-within-100`                   | Add within 100 using place value                                        |     8 |    0 |
| `m.1.measure-nonstandard`              | Measure length with cubes or paper clips                                |     8 |    0 |
| `m.1.time-half-hour`                   | Tell time to the hour and half hour                                     |     4 |    0 |
| `m.1.data-3-categories`                | Sort and compare data in three groups                                   |     9 |    0 |
| `m.1.shape-attributes`                 | Shape attributes: sides, corners and closed shapes                      |     8 |    0 |
| `m.1.halves-fourths`                   | Cut shapes into halves and fourths                                      |     4 |    0 |
| `m.2.add-sub-100-fluency`              | Add and subtract fluently within 100                                    |     9 |    0 |
| `m.2.place-value-1000`                 | Place value to 1,000 (hundreds, tens, ones)                             |    11 |    0 |
| `m.2.add-sub-1000`                     | Add and subtract within 1,000                                           |     9 |    0 |
| `m.2.skip-count`                       | Skip-count by 5s, 10s and 100s                                          |     0 |    0 |
| `m.2.even-odd`                         | Even and odd numbers                                                    |    12 |    0 |
| `m.2.arrays`                           | Equal groups and rectangular arrays                                     |     7 |    0 |
| `m.2.standard-length`                  | Measure length in inches, feet, centimeters and meters                  |    11 |    0 |
| `m.2.money`                            | Word problems with dollars and cents                                    |     8 |    0 |
| `m.2.time-5-min`                       | Tell time to the nearest five minutes (a.m./p.m.)                       |     4 |    0 |
| `m.2.graphs-line-plots`                | Picture graphs, bar graphs and line plots                               |    10 |    0 |
| `m.2.thirds-polygons`                  | Thirds, and naming shapes and solids by sides, angles and faces         |    11 |    0 |
| `m.3.multiply-divide-100`              | Multiply and divide within 100                                          |    11 |    0 |
| `m.3.multiplication-properties`        | Properties of multiplication: order, grouping and breaking apart        |     8 |    0 |
| `m.3.two-step-problems`                | Two-step word problems with all four operations                         |    10 |    0 |
| `m.3.arithmetic-patterns`              | Patterns in addition and multiplication tables                          |    11 |    0 |
| `m.3.rounding`                         | Round to the nearest 10 or 100                                          |     8 |    0 |
| `m.3.add-sub-1000`                     | Add and subtract fluently within 1,000                                  |    10 |    0 |
| `m.3.multiply-by-tens`                 | Multiply by multiples of 10 (like 9 × 80)                               |     6 |    0 |
| `m.3.fractions-number-line`            | Unit fractions and fractions on a number line                           |    10 |    0 |
| `m.3.compare-fractions`                | Equivalent fractions and comparing fractions                            |     9 |    0 |
| `m.3.elapsed-time`                     | Time to the minute and elapsed time                                     |     8 |    0 |
| `m.3.mass-liquid-volume`               | Mass and liquid volume (g, kg, L)                                       |     7 |    0 |
| `m.3.area`                             | Area of rectangles                                                      |     8 |    0 |
| `m.3.perimeter`                        | Perimeter of polygons                                                   |    10 |    0 |
| `m.3.scaled-graphs`                    | Scaled picture and bar graphs                                           |    11 |    0 |
| `m.3.measure-line-plots`               | Measure to the half and quarter inch; line plots                        |     9 |    0 |
| `m.3.quadrilaterals`                   | Classify quadrilaterals                                                 |    11 |    0 |
| `m.4.factors-multiples`                | Factors, multiples, primes and composites                               |    14 |    0 |
| `m.4.place-value-million`              | Place value and rounding to 1,000,000                                   |    14 |    0 |
| `m.4.multi-digit-multiply`             | Multiply up to 4-digit × 1-digit and 2-digit × 2-digit                  |    11 |    0 |
| `m.4.long-division`                    | Divide up to 4-digit numbers by 1-digit divisors                        |    10 |    0 |
| `m.4.fraction-equivalence`             | Fraction equivalence with unlike denominators                           |    10 |    0 |
| `m.4.add-fractions-like`               | Add and subtract fractions and mixed numbers (like denominators)        |    11 |    0 |
| `m.4.fraction-times-whole`             | Multiply a fraction by a whole number                                   |     8 |    0 |
| `m.4.decimals-intro`                   | Decimal notation for tenths and hundredths                              |     9 |    0 |
| `m.4.unit-conversion`                  | Convert units within one measurement system                             |    11 |    0 |
| `m.4.area-perimeter-formulas`          | Apply area and perimeter formulas                                       |    11 |    0 |
| `m.4.angles`                           | Measure and draw angles in degrees                                      |    10 |    0 |
| `m.4.lines-symmetry`                   | Parallel and perpendicular lines; line symmetry                         |    11 |    0 |
| `m.5.order-of-operations`              | Order of operations with parentheses                                    |     3 |    0 |
| `m.5.powers-of-ten`                    | Powers of 10 and exponent notation                                      |     7 |    0 |
| `m.5.standard-algorithm`               | Fluent multi-digit multiplication (standard algorithm)                  |    10 |    0 |
| `m.5.divide-2-digit`                   | Divide by 2-digit divisors                                              |     9 |    0 |
| `m.5.decimal-operations`               | Four operations with decimals to hundredths                             |    12 |    0 |
| `m.5.add-fractions-unlike`             | Add and subtract fractions with unlike denominators                     |     9 |    0 |
| `m.5.multiply-fractions`               | Multiply fractions and mixed numbers                                    |     8 |    0 |
| `m.5.divide-unit-fractions`            | Divide unit fractions and whole numbers                                 |     8 |    0 |
| `m.5.volume-rectangular`               | Volume of rectangular prisms (V = l × w × h)                            |    11 |    0 |
| `m.5.coordinate-plane-q1`              | Graph points in the first quadrant                                      |     9 |    0 |
| `m.5.classify-2d`                      | Classify 2D figures in a hierarchy                                      |    10 |    0 |
| `m.6.ratios`                           | Ratios and ratio tables                                                 |    10 |    0 |
| `m.6.unit-rates`                       | Unit rates (speed, price per unit)                                      |    12 |    0 |
| `m.6.percent`                          | Percent of a quantity                                                   |    11 |    0 |
| `m.6.divide-fractions`                 | Divide fractions by fractions                                           |     8 |    0 |
| `m.6.multi-digit-decimals`             | Divide multi-digit numbers; add, subtract, multiply and divide decimals |    11 |    0 |
| `m.6.gcf-lcm`                          | Greatest common factor and least common multiple                        |    10 |    0 |
| `m.6.integers`                         | Negative numbers and absolute value                                     |    10 |    0 |
| `m.6.coordinate-plane-4q`              | Coordinate plane in all four quadrants                                  |    10 |    0 |
| `m.6.expressions-variables`            | Write and evaluate expressions with variables and exponents             |    12 |    0 |
| `m.6.one-step-equations`               | One-step equations and inequalities                                     |    11 |    0 |
| `m.6.area-polygons`                    | Area of triangles, parallelograms and trapezoids                        |    10 |    0 |
| `m.6.surface-area-nets`                | Surface area using nets                                                 |     9 |    0 |
| `m.6.center-spread`                    | Mean, median, mode, range and MAD                                       |    12 |    0 |
| `m.7.proportional-relationships`       | Proportional relationships and the constant of proportionality          |     9 |    0 |
| `m.7.percent-applications`             | Tax, tip, markup, discount and percent change                           |    12 |    0 |
| `m.7.rational-operations`              | Operations with positive and negative rational numbers                  |    11 |    0 |
| `m.7.two-step-equations`               | Two-step equations and inequalities                                     |     7 |    0 |
| `m.7.scale-drawings`                   | Scale drawings                                                          |    10 |    0 |
| `m.7.circles`                          | Circumference and area of circles                                       |    10 |    0 |
| `m.7.angle-relationships`              | Supplementary, complementary, vertical and adjacent angles              |    10 |    0 |
| `m.7.prisms`                           | Volume and surface area of prisms                                       |     9 |    0 |
| `m.7.sampling`                         | Random sampling and population inferences                               |    10 |    0 |
| `m.7.probability`                      | Probability of simple and compound events                               |    13 |    0 |
| `m.8.roots-irrationals`                | Square roots, cube roots and irrational numbers                         |     9 |    0 |
| `m.8.exponent-rules`                   | Integer exponent rules                                                  |     8 |    0 |
| `m.8.scientific-notation`              | Scientific notation                                                     |    10 |    0 |
| `m.8.slope`                            | Slope and rate of change                                                |    10 |    0 |
| `m.8.multi-step-equations`             | Linear equations with variables on both sides                           |    10 |    0 |
| `m.8.systems-linear`                   | Systems of two linear equations                                         |     9 |    0 |
| `m.8.functions-intro`                  | Functions: definition, tables and graphs                                |     9 |    0 |
| `m.8.linear-functions`                 | Linear functions (y = mx + b)                                           |    11 |    0 |
| `m.8.transformations`                  | Translations, rotations, reflections and dilations                      |    13 |    0 |
| `m.8.pythagorean`                      | Pythagorean theorem and distance between points                         |    10 |    0 |
| `m.8.volume-curved`                    | Volume of cylinders, cones and spheres                                  |    11 |    0 |
| `m.8.scatter-plots`                    | Scatter plots and lines of fit                                          |    10 |    0 |
| `s.K.pushes-pulls`                     | Pushes and pulls change motion                                          |     0 |    0 |
| `s.K.sunlight-warms`                   | Sunlight warms Earth's surface                                          |     5 |    0 |
| `s.K.living-needs`                     | What plants and animals need to survive                                 |     0 |    0 |
| `s.K.weather-patterns`                 | Observing local weather patterns                                        |     4 |    0 |
| `s.K.living-things-change-environment` | How living things change their environment                              |     0 |    0 |
| `s.1.sound-vibration`                  | Sound comes from vibrating materials                                    |     4 |    1 |
| `s.1.light-shadows`                    | Light, shadows and seeing objects                                       |     0 |    0 |
| `s.1.structures-function`              | Plant and animal parts and what they do                                 |     1 |    1 |
| `s.1.offspring`                        | Young plants and animals resemble their parents                         |     2 |    0 |
| `s.1.sky-patterns`                     | Patterns of the sun, moon and stars; daylight across seasons            |     3 |    4 |
| `s.2.material-properties`              | Properties of materials                                                 |     4 |    2 |
| `s.2.heating-cooling`                  | Reversible and irreversible changes from heating and cooling            |     1 |    5 |
| `s.2.plant-growth-investigation`       | Investigating what plants need to grow                                  |     3 |    0 |
| `s.2.pollination-dispersal`            | Pollination and seed dispersal                                          |     2 |    0 |
| `s.2.habitats`                         | Biodiversity in habitats                                                |     2 |    1 |
| `s.2.erosion-landforms`                | Landforms and fast or slow Earth changes                                |     4 |    0 |
| `s.2.water-on-earth`                   | Where water is found on Earth                                           |     1 |    0 |
| `s.3.balanced-forces`                  | Balanced and unbalanced forces                                          |     0 |    9 |
| `s.3.magnets`                          | Magnetic and electric forces at a distance                              |     1 |    1 |
| `s.3.life-cycles`                      | Life cycles of organisms                                                |     6 |    0 |
| `s.3.inherited-traits`                 | Inherited traits and environmental influence                            |     3 |    0 |
| `s.3.adaptation-fossils`               | Adaptations, survival and fossils                                       |     5 |    0 |
| `s.3.animal-groups`                    | Animals living in groups                                                |     0 |    0 |
| `s.3.weather-climate`                  | Weather data and climate regions                                        |     6 |    0 |
| `s.4.energy-speed`                     | Energy and speed; energy transfer in collisions                         |     1 |    6 |
| `s.4.energy-conversion`                | Energy conversion: light, heat, sound and electric current              |     6 |    4 |
| `s.4.wave-patterns`                    | Waves: amplitude and wavelength                                         |     4 |    2 |
| `s.4.vision-light`                     | How reflected light lets us see                                         |     3 |    0 |
| `s.4.internal-structures`              | Internal and external structures of organisms                           |     4 |    1 |
| `s.4.weathering`                       | Weathering, erosion and rock-layer evidence                             |     7 |    0 |
| `s.4.natural-resources`                | Energy resources and natural hazards                                    |     6 |    0 |
| `s.5.particles-matter`                 | Matter is made of particles too small to see                            |     2 |    3 |
| `s.5.conservation-mass`                | Conservation of mass                                                    |     2 |    1 |
| `s.5.mixtures`                         | Mixing substances and forming new substances                            |     3 |    0 |
| `s.5.gravity-down`                     | Earth's gravity pulls objects down                                      |     0 |    1 |
| `s.5.food-webs`                        | Matter and energy in food webs                                          |     8 |    7 |
| `s.5.plants-sunlight-energy`           | Plants use sunlight to make food                                        |     5 |    1 |
| `s.5.earth-spheres`                    | Earth systems: geosphere, hydrosphere, atmosphere, biosphere            |     2 |    0 |
| `s.5.sun-star-brightness`              | The sun as a star; brightness and distance                              |     1 |    0 |
| `s.5.shadows-day-night`                | Shadows, day and night, and seasonal star patterns                      |     7 |    0 |
| `s.5.protect-resources`                | Protecting Earth's resources and environment                            |     7 |    0 |
| `s.6.cells`                            | Cells as the basic unit of life                                         |     4 |    1 |
| `s.6.cell-organelles`                  | Cell parts and their functions                                          |     2 |    0 |
| `s.6.body-systems`                     | Body systems and how they interact                                      |     8 |    0 |
| `s.6.density`                          | Density: mass in each unit of volume                                    |     5 |    0 |
| `s.6.water-cycle`                      | The water cycle                                                         |     8 |    4 |
| `s.6.weather-fronts`                   | Air masses, fronts and weather prediction                               |     2 |    0 |
| `s.6.plate-tectonics`                  | Plate tectonics                                                         |     3 |    0 |
| `s.6.rock-cycle`                       | The rock cycle                                                          |     3 |    0 |
| `s.7.atoms-molecules`                  | Atoms, elements and molecules                                           |     1 |    0 |
| `s.7.phase-changes`                    | States of matter and phase changes                                      |     4 |    0 |
| `s.7.chemical-reactions`               | Chemical reactions and balancing basics                                 |     1 |    1 |
| `s.7.photosynthesis-respiration`       | Photosynthesis and cellular respiration                                 |     4 |    0 |
| `s.7.ecosystem-energy`                 | Energy flow and matter cycling in ecosystems                            |     8 |    1 |
| `s.7.punnett-squares`                  | Genes, alleles and Punnett squares                                      |     1 |    1 |
| `s.7.natural-selection`                | Natural selection                                                       |     1 |    0 |
| `s.8.motion`                           | Speed, velocity and acceleration                                        |     7 |    0 |
| `s.8.newtons-laws`                     | Newton's three laws of motion                                           |     7 |    0 |
| `s.8.kinetic-potential`                | Kinetic and potential energy                                            |     1 |    0 |
| `s.8.em-spectrum`                      | Wave properties and the electromagnetic spectrum                        |     0 |    0 |
| `s.8.electricity-basics`               | Electric charge, current and simple circuits                            |     4 |    0 |
| `s.8.magnetic-fields`                  | Magnetic fields and electromagnets                                      |     1 |    0 |
| `s.8.periodic-table`                   | The periodic table                                                      |     1 |    0 |
| `s.8.gravity-orbits`                   | Gravity and orbits in the solar system                                  |     5 |    0 |

## Skills with no questions

- `m.K.classify-count` — Sort things into groups and count them
- `m.K.position-words` — Position words: in front of, behind, next to
- `m.1.addition-properties` — Add in any order or grouping
- `m.2.skip-count` — Skip-count by 5s, 10s and 100s
- `s.K.pushes-pulls` — Pushes and pulls change motion
- `s.K.living-needs` — What plants and animals need to survive
- `s.K.living-things-change-environment` — How living things change their environment
- `s.1.light-shadows` — Light, shadows and seeing objects
- `s.3.animal-groups` — Animals living in groups
- `s.8.em-spectrum` — Wave properties and the electromagnetic spectrum

Science is tested only in Grades 4 and 8 (NAEP), but it is learned in every grade, so science
questions are filed by the lesson that teaches them, whatever grade took the test (a Grade 4
question on seed dispersal is filed under `s.2.pollination-dispersal`). A Grade 8 question on
an idea a K–6 lesson also teaches lists that lesson in `alsoSkills` (condensation under
`s.2.heating-cooling` and `s.6.water-cycle`; forces under `s.3.balanced-forces`), and the
review script shows it under both. On 2026-09-27 every record was re-read against its skill:
52 were re-filed (each says so in `notes`) and 50 science records gained `alsoSkills`.

Science questions exist only for grades 4 and 8 because NAEP tests only those grades and no
other allowed source with science questions was found. Grade 4 and 8 NAEP questions are
filed by the grade that took the test; their `skillId` is often an earlier grade (for example
a grade 4 NAEP question on seed dispersal maps to `s.2.pollination-dispersal`). Math K–3 and
5–7 come from Illustrative Mathematics practice problems.

## Picture kinds

Each question with a picture has a plain `picture.kind`, guessed from the source's own figure
description (`drawing` is the fallback when the description names nothing specific). The app
draws these representation kinds (the `case '…'` labels of `RepresentationView` in
`src/components/module/reps/index.tsx`, 75 kinds):

`angles`, `areaModel`, `array`, `balance`, `bars`, `baseHeight`, `baseTen`, `beaker`, `boxPlot`, `circle`, `clock`, `coinRow`, `coins`, `compareRows`, `coordinatePlane`, `cubeTrains`, `dotPlot`, `dotSet`, `doubleNumberLine`, `equalGroups`, `factorPairs`, `factorTree`, `fieldOfView`, `force`, `fractionArea`, `fractionBars`, `fractionFit`, `fractionLine`, `gradCylinder`, `hops`, `hundredChart`, `integerLine`, `linePlot`, `lineUp`, `net`, `numberBond`, `numberLine`, `pairs`, `partition`, `partnerList`, `patternBlocks`, `percentBar`, `pictureGraph`, `pieChart`, `placeValueChart`, `plot`, `polygon`, `prism`, `protractor`, `punnettSquare`, `pushes`, `quadrilateral`, `ratioTable`, `rectangle`, `rectilinear`, `rightTriangle`, `rockLayers`, `rounding`, `ruler`, `scale`, `seriesCircuit`, `shareWholes`, `skipCount`, `solid`, `table`, `tally`, `tape`, `tenFrame`, `thermometers`, `timeline`, `unitCubes`, `unitTiles`, `venn`, `waterfall`, `wave`

| Picture kind (questions) | Questions | Closest app representation                       |
| ------------------------ | --------: | ------------------------------------------------ |
| drawing                  |       167 | — (generic; not a picture kind)                  |
| shapes                   |       105 | polygon, quadrilateral, rectangle, rightTriangle |
| table                    |        43 | table                                            |
| 3D solid                 |        42 | solid, prism, unitCubes                          |
| grid                     |        39 | unitTiles / rectilinear (loose)                  |
| coordinate grid          |        20 | coordinatePlane                                  |
| graph                    |        18 | plot (loose)                                     |
| clock                    |        16 | clock                                            |
| number line              |        15 | numberLine (also fractionLine, integerLine)      |
| ten frame                |        14 | tenFrame                                         |
| bar graph                |        13 | bars                                             |
| angle diagram            |        12 | angles                                           |
| map                      |        10 | **not drawn yet**                                |
| dot plot                 |         9 | dotPlot                                          |
| coins                    |         8 | coins, coinRow                                   |
| ruler                    |         8 | ruler                                            |
| array                    |         7 | array                                            |
| scatter plot             |         7 | plot (loose: no line-of-fit view)                |
| scale                    |         6 | scale, balance                                   |
| diagram: containers      |         6 | beaker, gradCylinder (loose)                     |
| base-ten blocks          |         6 | baseTen                                          |
| picture graph            |         6 | pictureGraph                                     |
| area model               |         6 | areaModel                                        |
| diagram: sky/Earth       |         5 | **not drawn yet**                                |
| diagram: food web        |         5 | **not drawn yet**                                |
| circle                   |         5 | circle                                           |
| fraction bar             |         5 | fractionBars                                     |
| spinner                  |         4 | **not drawn yet**                                |
| tape diagram             |         4 | tape                                             |
| thermometer              |         3 | thermometers                                     |
| tally chart              |         3 | tally                                            |
| diagram: circuit         |         2 | seriesCircuit                                    |
| line plot                |         2 | linePlot                                         |
| net                      |         2 | net                                              |
| line graph               |         2 | plot (loose)                                     |
| photo                    |         1 | **not drawn yet**                                |
| protractor               |         1 | protractor                                       |
| calculator display       |         1 | **not drawn yet**                                |
| histogram                |         1 | **not drawn yet**                                |
| double number line       |         1 | doubleNumberLine                                 |

### Picture kinds the app does not draw yet

- **map** — 10 question(s)
- **diagram: sky/Earth** — 5 question(s)
- **diagram: food web** — 5 question(s)
- **spinner** — 4 question(s)
- **photo** — 1 question(s)
- **calculator display** — 1 question(s)
- **histogram** — 1 question(s)

The matching is loose: a kind with a close representation can still need a variant (for
example a scatter plot with a line of best fit, or a line graph with labelled time axes).

## Notes on the counts

- NAEP questions are capped at 10 per skill; 16 further mapped NAEP questions
  were left out by the cap. Illustrative Mathematics adds 3–8 per skill (fewer where NAEP
  already has many), so a skill can have up to about 13.
- Mapped NAEP items dropped while building: tableID 11628 (no usable English text), tableID 25221 (screenshot alt text does not contain the question).
- Every `skillId` is a real K–8 id from `src/data/taxonomy.ts`; no record uses `null`.

## Regenerate and validate

```sh
python3 research/questions/validate.py              # checks every line, prints totals
python3 research/questions/validate.py --markdown   # also prints the tables above
```

`validate.py` checks that every line parses as JSON, every required key is present, `grade`
and `subject` match the file, `type` is one of the four allowed values, `skillId` exists in
`src/data/taxonomy.ts` (or is `null` with notes) and belongs to the right subject, and that
ids are unique. It exits non-zero on any error. The collection scripts themselves (fetching,
parsing, mapping) are not kept in the repository; the per-record `source`, `notes` and
`SOURCES.md` say where each question came from and how it was mapped.
