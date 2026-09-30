# Picture catalog

Every picture kind the app draws (`src/components/module/reps/`), what it shows and which
lessons it is for, the options a kind takes, and the art direction. The standard for choosing a
picture is in `docs/MODULE_GUIDE.md` ("The best representation"); this file is the list to
choose from. Every kind has a page at `/gallery`.

Kinds built ahead of the sections that need them (see them at `/gallery`, one page per kind,
with a demo module each in `src/data/modules/gallery.ts`; the gallery is not in the taxonomy,
search or the sitemap, but the module tests and the harness run over it):

| Kind               | Shows                                                                 | For                                 |
| ------------------ | --------------------------------------------------------------------- | ----------------------------------- |
| `doubleNumberLine` | two lined-up number lines, a mark joining a reading on each           | conversions, ratios, rates, percent |
| `coordinatePlane`  | a point to drag; a second point with the line and a rise/run triangle | Grade 5 points, Grade 6–8 slope     |
| `boxPlot`          | the five-number summary on a number line, each mark draggable         | Grade 6 statistics                  |
| `pieChart`         | wedges by percent (or counts of a total)                              | percent, data in science            |
| `fractionArea`     | a square cut in columns and rows, the overlap of two fractions        | Grade 5 fraction × fraction         |
| `unitCubes`        | a box of unit cubes drawn in layers                                   | Grade 5 volume                      |
| `placeValueChart`  | digits in labelled columns, the point between ones and tenths         | Grade 5 decimals and powers of ten  |
| `factorTree`       | a number split down to circled primes                                 | Grade 4 primes, Grade 6 GCF and LCM |
| `protractor`       | both scales, an arm to drag                                           | Grade 4 measuring angles            |
| `wave`             | crests and troughs with wavelength (and amplitude) marked             | Grade 4 and 8 waves, physics        |
| `punnettSquare`    | two parents' alleles and the four offspring boxes                     | Grade 7 heredity, biology           |
| `factorPairs`      | each rectangle of its unit squares, pair outlined; thin bars past 100 | Grade 4 factors, primes, composites |
| `shareWholes`      | wholes cut into as many parts as people, one share shaded in each     | Grade 5 fractions as division       |
| `integerLine`      | a line through 0: a point, its opposite, its distance from 0, a jump  | Grade 6 negatives, temperature      |
| `percentBar`       | 0%–100% over 0–whole, the part shaded, 1% marked                      | Grade 6 percent                     |
| `ratioTable`       | equivalent ratios in rows, the current row outlined, its graph        | Grade 6 ratios                      |
| `fractionFit`      | groups of the divisor laid along the dividend, or one group filled    | Grade 6 dividing fractions          |
| `venn`             | two circles of factors, the shared ones in the overlap, GCF circled   | Grade 6 GCF                         |
| `baseHeight`       | a parallelogram, triangle, trapezoid or house; lean it by the top     | Grade 6 area                        |
| `net`              | a box, cube or square pyramid unfolded, faces labelled; Fold          | Grade 6 surface area                |
| `dotPlot`          | a dot per value; the mean as a balance point, the median, deviations  | Grade 6 statistics                  |
| `fieldOfView`      | the microscope circle with cells end to end across it                 | Grade 6 cells                       |
| `gradCylinder`     | mL marks, the level before and after, the rise as the object's volume | Grade 6 density                     |
| `grassSlope`       | soil trays on a slope, one grassed; the soil washed off in jars       | Grade 2 and 4 erosion               |
| `flashlights`      | a flashlight near and k times as far; k × k squares lit, one shaded   | Grade 5 star brightness             |
| `leafCount`        | a plant in the sun and one in the shade, green leaves counted         | Grade 2 plant needs                 |
| `zeroPairs`        | yellow + and red − counters; a + with a − circled as a zero pair      | Grade 7 adding, subtracting signs   |
| `signTable`        | the answer’s sign for each pair of signs, the numbers’ cell outlined  | Grade 7 multiplying, dividing signs |
| `hanger`           | a beam on a hook, x-blocks and unit weights on two trays; solve steps | Grade 7–8 equations                 |
| `scaleCopy`        | a figure and its scaled copy on one grid, the factor on an arrow      | Grade 7 scale drawings              |
| `curvedSolid`      | a glass cylinder, cone or sphere of water, its radius and height      | Grade 8 volume of curved solids     |
| `scatter`          | data points, a line of fit dragged by its ends, clusters, an outlier  | Grade 8 scatter plots               |
| `crossSection`     | a clear box, triangular prism or pyramid cut by a plane; drag it      | Grade 7 cross-sections, volume      |
| `sample`           | a population of dots, a random sample ringed; draw a new sample       | Grade 7 sampling, inferences        |
| `spinner`          | a spinner in equal colored sectors, the event outlined; Spin          | Grade 7 probability                 |
| `diceGrid`         | two dice's 36 pairs in a 6 × 6 grid, the event's cells shaded; tap    | Grade 7 compound probability        |
| `treeDiagram`      | 2 or 3 stages branching left to right, each branch 1/n; a path lit    | Grade 7 compound probability        |
| `marbles`          | a clear bag of colored glass marbles, mixed; draw one at random       | Grade 7 probability                 |
| `rootSquare`       | a square of area A on a grid, side √A dropped onto a number line      | Grade 8 square roots, irrationals   |
| `factorRows`       | powers as rows of factors: joined, cancelled in pairs, or stacked     | Grade 8 exponent rules              |
| `powerScale`       | a number on a 10ⁿ ruler, its decade opened up 1–10; `second` compares | Grade 8 scientific notation         |
| `equationBalance`  | x-blocks and counters on both pans, negatives as balloons; tips at x  | Grade 8 equations, both sides       |
| `linearFunction`   | y = mx + b: the intercept marked, a slope triangle; all three drag    | Grade 8 linear functions            |
| `lineSystem`       | two lines on one grid, their crossing marked (none when parallel)     | Grade 8 systems                     |
| `functionMachine`  | an input card through a rule's steps to the output; a tappable table  | Grade 8 functions                   |
| `mapping`          | pairs as arrows between two ovals; the graph with a vertical line     | Grade 8 functions (is it one?)      |
| `transformation`   | a figure and its image: slide arrow, mirror line, turn or rays        | Grade 8 transformations             |
| `energyPyramid`    | a tier per feeding level, to scale, 10% passed up each step; drag     | Grade 7 energy in ecosystems        |
| `generations`      | a stacked bar per generation (green and brown beetles), the share     | Grade 7 natural selection           |
| `molecules`        | ball-and-stick molecules in CPK colors, the atoms of each counted     | Grade 7 atoms and molecules         |
| `reaction`         | molecules before and after the arrow; each element's atoms counted    | Grade 7 reactions, balancing        |
| `heatingCurve`     | temperature against time, flat while melting and boiling; particles   | Grade 7 phase changes               |
| `periodicTable`    | the table as a grid: an element (its card), a group or a period lit   | Grade 8 periodic table              |
| `motionGraph`      | distance or speed against time; slope = rise ÷ run; a dot a second    | Grade 8 motion                      |
| `skaters`          | two skaters palm to palm: equal, opposite pushes; each a = F ÷ m      | Grade 8 Newton's laws               |
| `energyTrack`      | a coaster car or pendulum bob; PE, KE and total bars trade as it goes | Grade 8 kinetic, potential energy   |
| `spectrum`         | radio to gamma on a 10ⁿ band, the wave above, visible light opened up | Grade 8 electromagnetic spectrum    |
| `circuit`          | bulbs glowing by power, a switch, an ammeter; series or parallel      | Grade 8 circuits                    |
| `electromagnet`    | a coil on a nail, field lines by turns × current, clips at its point  | Grade 8 electromagnets              |
| `orbit`            | the sun, a planet on its orbit, its pull as an arrow; a moon; drag it | Grade 8 gravity and orbits          |
| `functionGraph`    | y = f(x) for any family: zeros, vertex, asymptotes, holes; drag it    | Grades 9–12 functions, calculus     |
| `triangleSolver`   | a triangle to scale from 3 parts; congruent, similar, SSA pairs; trig | Geometry triangles and trig         |
| `markedFigure`     | points and marks: transversal angles, triangle centers, quads, proofs | Geometry lines, proofs, quads       |
| `circleTheorems`   | inscribed, central angles; tangent ⟂ radius; chord, secant products   | Geometry circle theorems            |
| `normalCurve`      | normal or chi-square curve, x and z axes, areas to 4 decimals, tests  | Grades 11–12 statistics (H02)       |
| `histogram`        | bins of data or counts, mean, median, shape; probability bars, E(X)   | Grades 9–12 statistics (H03)        |
| `pascalTriangle`   | Pascal's triangle to row 12, C(n, k) lit; counting slots, ÷ r!        | Grades 10–11 counting (H13)         |
| `termsChart`       | a sequence's terms as bars or points, partial sums stepped, S dashed  | Grades 9 and 11 sequences (H15)     |
| `unitCircle`       | the angle θ, its point (cos θ, sin θ), reference triangle; sine graph | Grades 10–12 trigonometry           |
| `algebraTiles`     | x², x and unit tiles ±: collect, multiply, factor, complete a square  | Grade 9 polynomials, factoring      |
| `vectorDiagram`    | arrows by components or size and direction; sums, kv, angle, dot sign | Grade 12 vectors, physics forces    |
| `complexPlane`     | a + bi as a point and arrow: conjugate, sum, product, modulus, arg    | Grade 11 complex numbers, polar     |
| `polarGrid`        | (r, θ) on rings and rays; rose, cardioid, spiral; parametric paths    | Grade 12 polar, parametric          |
| `conicGraph`       | circle, parabola, ellipse, hyperbola: foci, directrix, asymptotes     | Grades 10–12 conics                 |
| `matrixGrid`       | matrices in brackets: a row times a column lit; row operations        | Grade 12 matrices, systems          |
| `membrane`         | a bilayer, particles counted on each side; channel, aquaporin or pump | Grade 9 membrane transport (H32)    |
| `dnaStrand`        | DNA ladder, mRNA codons, amino acids; a mutation lit; Chargaff        | Grade 9 DNA, mutations (H36)        |
| `gel`              | a gel: ladder and lanes, bands by log size; PCR copies per cycle      | Biology biotechnology (H37)         |
| `immuneResponse`   | antibody level by day: a slow low first response, a fast high second  | Biology immune system (H42)         |
| `unitChain`        | factors with cancelled units struck; a ruler read; accuracy target    | Chemistry measurement (H43)         |
| `atomModel`        | Bohr model: every proton and neutron, electrons on shells; ions       | Chemistry atoms, isotopes (H44)     |
| `orbitalDiagram`   | orbital boxes by Aufbau and Hund; hydrogen levels and emission lines  | Chemistry electrons, spectra (H45)  |
| `lewisStructure`   | electron dots: molecules, ions, ionic transfer, metals, hydrocarbons  | Chemistry bonding, organic (H47)    |
| `vsepr`            | ball-and-stick VSEPR shapes, bond angle, dipoles; hydrogen bonds      | Chemistry molecular shape (H48)     |
| `moleMap`          | grams, moles, particles, liters at STP; each factor; a mole ratio     | Chemistry mole, stoichiometry (H50) |
| `gasPiston`        | gas under a piston: particles by n, trails ∝ √T, a gauge and scale    | Grade 10 gas laws (H51)             |
| `energyProfile`    | reaction energy: levels, Eₐ hump, ΔH, catalyst dashed; calorimeter    | Grade 10 thermochemistry (H53)      |
| `equilibriumChart` | concentrations leveling off where Q = K; a stress and the shift       | Grade 10 equilibrium (H54)          |
| `phScale`          | pH 0–14 in indicator colors, [H⁺] as 10ⁿ; a titration curve           | Grade 10 acids and bases (H55)      |
| `decayChart`       | 100 atoms decaying, the half-life curve; nuclear equations balanced   | Grades 10, 12 nuclear, dating (H57) |
| `earthLayers`      | Earth cut open: P, S paths, shadow zones; seismogram; epicenter       | Earth science interior (H72)        |
| `oceanProfile`     | the seafloor, shelf to trench, with a sonar ship; spring, neap tides  | Earth science ocean (H75)           |
| `atmosphereLayers` | temperature by altitude through four layers; a pressure map, winds    | Earth science atmosphere (H76)      |
| `hrDiagram`        | temperature against luminosity, log scales; regions, a star plotted   | Earth science stars (H79)           |
| `projectile`       | a launch to scale: path, vₓ and v_y at three points, H and R; drag θ  | Physics 2D motion, parametric (H59) |
| `freeBody`         | a block on a floor, ramp or rope; forces to scale, W sin θ; the net   | Physics forces, inclines (H60)      |
| `circularMotion`   | v tangent, v²/r to the center; Gm₁m₂/r² pulls; Kepler ellipse, areas  | Physics circles, gravity (H61)      |
| `collision`        | carts before and after: p = mv arrows, the total tip to tail; bounce  | Physics momentum (H62)              |
| `simpleMachine`    | lever, block and tackle or ramp to scale; load, effort and the MA     | Physics simple machines (H63)       |
| `heatEngine`       | hot and cold reservoirs, Q_H = W + Q_L as bands; efficiency, Carnot   | Physics thermodynamics (H64)        |
| `rayDiagram`       | lens, mirror: principal rays, image; Snell, total reflection; slits   | Physics optics, telescopes (H66)    |
| `charges`          | point charges, traced field lines; kq₁q₂/r² forces; E at a point      | Physics electrostatics (H67)        |
| `induction`        | magnet into a coil, galvanometer; BIL on a wire; transformer turns    | Physics electromagnetism (H69)      |

`alleleFrequencies` (H38, a name too long for the table): 100 allele beads counted from p, a p
scale to drag, and the bars p², 2pq and q², for Grade 9 population genetics.

`expandingUniverse` (H80): galaxies spreading as space stretches by a factor, each old place
arrowed to its new one; or a Hubble plot, v = H₀d, for Earth science cosmology.

Options on existing kinds (K–5 rebuild; each one is checked in `harness/pictures.ts`):

| Kind               | Option                                   | Draws                                                                         |
| ------------------ | ---------------------------------------- | ----------------------------------------------------------------------------- |
| `compareRows`      | `object`                                 | the pencil, crayon or ribbon measured, above its row of cubes                 |
| `hundredChart`     | `piece`, `multiplesOf`, `max: 1000`      | the number and its 4 neighbors; or multiples shaded; 1000: its hundred only   |
| `hops`             | a hop `sign` naming a variable (1 or −1) | a + / − switch that flips that hop                                            |
| `rectangle`        | `grid`                                   | unit squares on a perimeter page                                              |
| `rectangle`        | `roof`                                   | a slate roof in perspective with rain falling on it (roof-rain page)          |
| `prism`            | `counting`                               | Faces / Edges / Corners buttons that number each one on the solid             |
| `polygon`          | `sideValues`, `around`                   | a shape with a length (or “?”) on each side, the perimeter under it           |
| `rectilinear`      | `cut` instead of `right`                 | a rectangle with a corner cut out, both areas labeled                         |
| `ruler`            | `marks: 2 \| 4`                          | half- or quarter-inch marks, lengths counted in marks                         |
| `equalGroups`      | `unit: 10`, `bundles`                    | ten-rods, `each` counted in tens; bundles: rows of ten circles, each numbered |
| `bars`             | `scale` as a variable                    | the grid spacing read from a value                                            |
| `bars`             | `icon` on a bar                          | a small card icon under the bar's name                                        |
| `pieChart`         | `colors`, `group`                        | palette colors that mean something; a group pulled out and bracketed          |
| `tally`            | `icons`                                  | a card icon beside each row's name                                            |
| `pictureGraph`     | (with a key)                             | half a picture for a half count                                               |
| `fractionLine`     | `second`, `decimal`                      | a second line with a dashed join when equal; tenths labeled 0.1 … 1           |
| `table`            | `rows` as a function of the values       | rows that follow a parameter                                                  |
| `array`            | `sides`                                  | the rows and columns labeled, “?” until solved                                |
| `timeline`         | `back`                                   | jumps counted back from the end (default: a page opening on the end time)     |
| `areaModel`        | `factors`; `divide`                      | parts split by place from the factors; partial quotients and the remainder    |
| `placeValueChart`  | `highlight`, `from`, `compare`           | a place with its × 10 neighbors; the number before × 10; the first difference |
| `placeValueChart`  | `periods`                                | whole numbers to hundred billions, columns grouped ones … billions            |
| `tape`             | `times`; groups past 12                  | the bigger bar as copies of the smaller; a label instead of dashes            |
| `grid100`          | `second`, `wholes`, `stack`, `past100`   | a grid to compare; ones grids (`stack` past 3); past 100%; `exact` tenths     |
| `rounding`         | `to` 1, 0.1 or 0.01                      | rounding decimals                                                             |
| `coordinatePlane`  | `trail`                                  | a pattern's earlier points and their table                                    |
| `unitCubes`        | `second`, `total`                        | two boxes joined into an L                                                    |
| `skipCount`        | a decimal `step`                         | jumps of 2.5 or 0.3                                                           |
| `tape`             | `ratio`                                  | two bars of equal boxes for a ratio, each box's worth, total and difference   |
| `skipCount`        | `second`                                 | a second row of multiples; the first landing both reach circled (LCM)         |
| `factorTree`       | `second`, `gcf`, `lcm`                   | two trees and the primes they share                                           |
| `coordinatePlane`  | `segment`, `reflect`, `rect`             | a labelled distance; images across the axes; a rectangle from its sides       |
| `unitCubes`        | `cube: 2 \| 3 \| 4`                      | fraction-edge cubes filling the box                                           |
| `boxPlot`          | `brackets`                               | the range and the interquartile range bracketed                               |
| `doubleNumberLine` | `prefix: '$'`                            | dollars to the cent                                                           |
| `plot`             | `reference`                              | a dashed comparison line through 0 ("Water")                                  |
| `thermometers`     | `cups`                                   | each thermometer in a dark or light cup of water in the sun                   |
| `fractionBars`     | `wholes`; a fraction past 1              | as many whole bars as it needs (7/4: a whole bar and 3/4 of the next), to 6   |
| `fractionArea`     | `wholes`                                 | a fraction past 1 (10/3): a block of unit squares, to `wholes` a side         |
| `fractionLine`     | `from` (counted in parts)                | mixed-number jumps (18 1/4 − 2 3/4): the wholes, then the parts left          |
| `fractionLine`     | `startWhole` (a number or value id)      | a line from any whole, start + `wholes` (1 to 3 in tenths, 2.6 marked)        |
| `partition`        | `shape: 'set'`, `object`                 | a set of umbrellas or counters, some shaded (3/7 of the set)                  |
| `numberLine`       | `from`, `every`, `span`; `jumps`         | a line from 500 by 1, 10 or 100; `jumps: 'ticks'` or `count`: a jump per tick |
| `tape`, `beaker`   | `mixed`                                  | shares and amounts as exact mixed numbers (33 1/3, 2 3/8 L)                   |
| `skipCount`        | (no `count`)                             | a quotient past whole jumps: the last part of a jump (33 1/3 jumps)           |
| `skipCount`        | `group`                                  | past 30 jumps (to 999): an arc per ten jumps, per hundred past 300            |
| `coins`            | bills (`cents` 100, 500, 1000) and coins | the bills beside the coins, one total in dollars and cents, the sum under it  |
| `dotPlot`          | `count`                                  | only the first n values (3–10), the middle one or two ringed at the median    |
| `boxPlot`          | `data`, `count`                          | the first n values as dots over the box, the middle ones ringed at the median |
| `integerLine`      | `inequality: { sign, test }`             | the bound's open or closed circle, an arrow over the solutions, a test point  |
| `integerLine`      | `inequality.twoStep: { times, plus, … }` | px + q < r solved in the caption; a negative p flips the sign drawn           |
| `circle`           | `views`, `wedges`                        | 'unroll': one turn along a line, π diameters; 'wedges': a near-parallelogram  |
| `unitCubes`        | `scale`                                  | past `max` a side, the box to scale, edges labelled, one unit cube for size   |
| `ratioTable`       | `graph`                                  | axes to the biggest row in 3–4 numbered steps; under the table on a phone     |
| `coordinatePlane`  | `plot`                                   | tap the grid or drag to place one point; the path from 0 across, then up      |
| `linePlot`         | `start`, `marks: 2 \| 4 \| 8`            | marks every 1/2, 1/4 or 1/8 from any whole number (12, 12 1/4, …)             |
| `linePlot`         | `startParts: 2 \| 4 \| 8` (with `marks`) | a fractional start (3 3/4), marks read 3 3/4, 4, 4 1/4 … 5 1/2                |
| `protractor`       | `arms: { first, second }`                | neither arm on 0: each reads on the inner scale; the angle is the difference  |
| `percentBar`       | `change: { total, direction?, bars? }`   | tax or discount: original, change, new amount; `bars: 2`: before and after    |
| `plot`             | `unitRate`, `table`                      | y = kx through (0, 0) with (1, k) ringed and dragged; x, y, y ÷ x beside it   |
| `integerLine`      | `jump: { by, result, op? }`              | signed jump from the value (+ right, − left); subtracting goes the other way  |
| `tape`             | `equation: { times, unknown, plus, … }`  | px + q = r: p boxes of x and q under r (−q taken off); `grouped`: p(x + q)    |
| `rightTriangle`    | `grid`                                   | each square ruled in unit squares (sides to 12); a² + b² = c² worked          |
| `coordinatePlane`  | `legs` (with `segment`)                  | the right triangle under the segment, legs labelled; d² = a² + b² worked      |
| `curvedSolid`      | `compare` (cone or sphere)               | the same cylinder beside it holding its water: 1/3 (cone) or 2/3 (sphere)     |
| `angles`           | `whole: 90 \| 180`, `cross`              | a right angle or a straight line split in two; `cross`: vertical angles       |
| `angles`           | `triangle: { third }`; `parallel`        | a triangle and its exterior angle (`whole`); two parallel lines, 8 angles     |
| `rootSquare`       | `between`; `solid: 'cube'`               | the whole numbers either side, checked; a cube with its edge on the line      |
| `diceGrid`         | `compare`                                | the event said in words: "a sum of at least 10"                               |
| `net`              | `solid: 'triangularPrism'`, `triangle`   | three rectangles and two triangles (right or isosceles); folds to the prism   |
| `dotPlot`          | `second`, `labels`, `difference`         | a second sample's dot plot under the first, same scale; the gap between means |
| `lineSystem`       | `shade` (a line), `test`, `sum`, `fixed` | inequalities: half-planes, dashed < >, overlap; elimination sum line (H16)    |
| `linearFunction`   | `shade`                                  | one inequality y < mx + b: its half-plane shaded, the boundary dashed (H16)   |
| `integerLine`      | `compound: { join, closed?, center? }`   | and / or between two bounds; abs(x − c) < d as a distance from c (H17)        |
| `linearFunction`   | `shade: { sign, flip? }`                 | the sign box's side (1 < 2 ≤ 3 > 4 ≥), reversed while `flip` < 0 (H90)        |
| `lineSystem`       | `lines[i].shade: { sign, flip? }`        | each line's half-plane from its sign box; ax + by (sign) c, `flip: 'b'` (H90) |
| `lineSystem`       | `upright: [{ x, shade? }]`               | upright boundaries x ≥ k; with them only the overlap is shaded (a box) (H92)  |
| `lineSystem`       | `marks`, `given: { x, y }`               | arrows if parallel, a square if perpendicular; the given point marked (H92)   |
| `functionGraph`    | `inequality: { sign }`                   | f(x) (sign) 0 shaded to the x-axis; the solutions on it, open or closed (H90) |
| `functionGraph`    | `abs`                                    | abs(f(x)): the parts below the x-axis reflected up, f(x) dashed (H94)         |
| `functionGraph`    | `horizontal: b`                          | y = a·f(b(x − h)) + k: squeezed toward x = h, flipped for b < 0 (H94)         |
| `functionGraph`    | `restrict: { from?, to? }`               | the domain kept from a value, the rest dashed; the inverse of it (H94)        |
| `functionGraph`    | `family: 'rational'`, `p, q, r, s`       | (px + q) ÷ (rx + s) from its coefficients, asymptotes marked (H94)            |
| `algebraTiles`     | `mode: 'box'`, `side`, `top`, `product`  | area box: row × column terms, like-term diagonals tinted, collected (H95)     |
| `algebraTiles`     | `mode: 'monomial'`, `a, m, b, n, c, k`   | a·xᵐ ÷ b·xⁿ as factors over a bar, cancelled pairs struck, c·xᵏ (H95)         |
| `integerLine`      | `compound.closed: [id, id]`              | each bound's circle from a sign box: 2 ≤, 4 ≥ closed; 1 <, 3 > open (H90)     |
| `integerLine`      | `fit`, `ticks`                           | the line spans its values (344–356 g → 340–360), not 0; a tick every 5 (H89)  |
| `integerLine`      | `compound: { join: 'equal', center, … }` | abs(x − c) = d: two closed dots at c ± d, distances bracketed, no band (H91)  |
| `normalCurve`      | `test.tail: { sign }`                    | Hₐ's sign box: 1 < 2 ≤ left, 3 > 4 ≥ right, 6 ≠ both tails (H90)              |
| `termsChart`       | `far`                                    | past 30 terms: the first six, a break, the nth lit (a₁₀₀) (H93)               |
| `termsChart`       | `type: 'recursive'`, `plus`              | aₙ = k × aₙ₋₁ + c from the one before, an arrow to each next (H93)            |
| `termsChart`       | `lit`, `litTerm`, `powers`               | a second lit term (B1 beside B2); terms as powers, 2² = 4 (H93)               |
| `scatter`          | `residuals`, `r`, `leastSquares`, …      | residual segments and plot, r, the least-squares line beside or given (H18)   |
| `boxPlot`          | `fences`; `second`, `labels`             | 1.5 × IQR fences, outliers as open dots; two box plots on one scale (H19)     |
| `dotPlot`          | `sd: { id, kind? }` (with `mean`)        | the mean as a line and a band one standard deviation either side (H19)        |
| `table`            | `twoWay: { rows, cols, cells, … }`       | two-way table: totals, lit cell/row/column, segmented bars, chi-square (H20)  |
| `treeDiagram`      | `chances: { first, second, names, … }`   | a chance per branch, B given A on the second stage, path products (H21)       |
| `venn`             | `chances: { a, b, both, shade, … }`      | probabilities per region; and, or, complement shaded; exclusive apart (H22)   |
| `venn`             | `chances.counts: { total, count? }`      | counts out of a total: regions as counts, neither outside, P = n/N (H97)      |
| `treeDiagram`      | `chances.third`, `thirdNames`, `path3`   | a third stage: 8 leaves, each path's product; three stages multiplied (H97)   |
| `pascalTriangle`   | `fraction: { n, k, count?, chance? }`    | C(a, r) lit over C(n, r), drawn as a fraction: 10/84 = 5/42 (H97)             |
| `coordinatePlane`  | `rise`, `run`                            | the rise/run triangle shaded, each leg heavy with an arrow and its value      |
| `force`            | `object: 'cart'`, `block`                | a lab cart with the mass as metal blocks, pulled by a rope; F = m × a         |
| `tenFrame`         | `takeAway`; `crossOut`                   | taken counters filled and crossed out; b crossed out inside the full ten      |
| `baseTen`          | `takeAway` (one group)                   | the blocks after any trade (boxed), those taken away faded and crossed out    |
| `pictureGraph`     | `icon` a card icon; `half`               | columns of apples, frogs …; a half picture in the key (key ÷ 2)               |
| `rounding`         | `second: { value, rounded, … }`          | a second number's line under the first; the estimate x + y (or − y)           |
| `polygon`          | `side` (with `sides`, `around`)          | every side labeled with the one length, sides × length under it               |
| `tape`             | `ratio` of three parts                   | a third bar of boxes, the total bracketed beside the three                    |
| `grid100`          | `product: [a, b]`                        | a tenths as columns × b tenths as rows, the overlap the product               |
| `placeValueChart`  | `plus`, `total`                          | two numbers stacked by place, points lined up, the sum under a rule           |
| `scale`            | `before`; `hanging`                      | two scales, before and after, gas bubbles labelled; a spring scale in N       |
| `transformation`   | `then`, `image2`; `symmetry`             | a second move from A′ (dashed) to A″; lines of symmetry and the turn order    |
| `scaleCopy`        | `center`; `splitter`                     | a dilation from any center with rays; DE ∥ BC cutting a triangle's sides      |
| `coordinatePlane`  | `midpoint`, `partition`; `polygon`       | M with equal halves ticked; P at m : n; side slopes, parallel and right marks |
| `circle`           | `sector`; `views`: `sector`, `radian`    | a sector by its angle (° or radians), arc and area; radius-long arcs around   |
| `curvedSolid`      | `net`, `slant`, `surface`; `cavalieri`   | the surface-area net (a cone's sector); two coin stacks, one leaning          |
| `crossSection`     | `solid: 'cylinder' \| 'cone'`            | a level cut (a circle) or upright cut, shaded and drawn flat beside           |
| `factorTree`       | `root: { index, outside, inside }`       | equal pairs (or threes) ringed and brought out of the root: √72 = 6√2         |
| `powerScale`       | `log`                                    | a log₁₀ scale under the 1–10 ruler: log₁₀ 470,000 = 5 + 0.672                 |
| `punnettSquare`    | `inheritance` (Grade 9)                  | dihybrid 4 × 4 by phenotype; incomplete, codominant; X-linked with carriers   |
| `energyPyramid`    | `measure: 'biomass' \| 'numbers'`        | biomass or numbers: no share passed up unless `percent`; can be upside down   |
| `periodicTable`    | `trend: { property, value, compare }`    | a trend shaded (radius, ionization, electronegativity), arrows, a key         |
| `reaction`         | `limiting: { amounts, made, left }`      | particles on hand before; after: products made, the leftover ringed           |
| `beaker`           | `solution: { mode, … }`                  | solute as dots by moles; a dilution’s two beakers; solubility (H52)           |
| `rockLayers`       | `dating` (Grades 9–12)                   | ages on dated layers, a dike cutting across, index fossils, 100 atoms         |
| `motionGraph`      | `kinematics: { view, at?, slope? }`      | signed v–t, + and − areas as Δx; x–t with a tangent at t₁; strobe (H58)       |
| `energyTrack`      | `spring: { k, compression, … }`          | spring launcher, rough patch (heat fd), ramp; start and now bars (H63)        |
| `wave`             | `standing`, `doppler`                    | string or pipe harmonic n, nodes and antinodes; Doppler fronts, cone (H65)    |
| `circuit`          | `mixed: { layout, resistors }`           | R₁ + R₂ ∥ R₃ or (R₁ + R₂) ∥ R₃; V, I, P at each resistor (H68)                |
| `spectrum`         | `lines`, `photon`                        | H, He, Na lines, emission or absorption, shifted by z; E = hf (H70)           |

If no existing representation fits, add a new kind in `src/components/module/reps/` rather than
forcing an existing one. A new kind gets: its spec in `types.ts`, a case in `reps/index.tsx`,
a name in `meta.ts`, its variables in `modules.test.ts`, a check in `harness/pictures.ts`,
and a lesson that uses it, or a gallery module until one exists.

**Art direction.** Real things look real; ideas stay flat.

- **Objects are drawn in their materials**, with the theme's material colors (`src/theme.ts`,
  "Materials") and the shading helpers in `reps/paint.tsx`. For example:
  - water in glass jugs and cylinders, with a surface and a meniscus;
  - a red-liquid thermometer on a board;
  - copper pennies and silver coins with ridged edges, and green bills;
  - a clock with a metal rim;
  - a scale and balance in metal, with two-color counters;
  - rock layers in rock colors, with grains and a fossil fish and shell;
  - wooden base-ten blocks, rulers, crates and solids;
  - pattern blocks in their classroom colors;
  - a lit microscope field with green cells;
  - copper circuit wires.
- **Shading is light from the top left:**
  - `TopLight` over flat faces and bars;
  - `Sheen` across round things (tubes, ribbons, cylinders);
  - `Ball` for counters and spheres;
  - a soft `FloorShadow` or `BoxShadow` under objects that stand on something.
  - Dark mode takes less shine (`sheen` in the palette), so dark fills don't turn grey.
- **Abstract diagrams stay flat:** number lines, grids, graphs, bars, pie charts, measured shapes,
  tables and trees.
  Shading there would add noise to what is read exactly.
- **Color never carries a meaning the text doesn't state.** Where a lesson says "solid" and
  "open" counters (ten frames, compare rows), that encoding stays. A second amount uses
  `chartSecond` (the yellow of two-color counters) beside the highlight.
- **Every color is a token.** Components hardcode no colors. Gradient ids come from
  `usePaintIds`, so two pictures on one page never share an id.
- **No outside images.** The app bundles no photos and makes no network calls, and licensed
  material is never used. Pictures are drawn in code.
