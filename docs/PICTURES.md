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
| `macromolecules`   | monomers into a chain by a value, "…" past 4; bonds and water counted | Grade 9 biomolecules (H100)         |
| `cellDivision`     | body cell 2n, gamete n, egg + sperm = zygote; one pair past 2n = 8    | Grade 9 chromosome counts (H100)    |
| `neuron`           | a neuron timing its impulse: m and ms scales; myelin at 3 m/s         | Grade 9 impulse speed (H109)        |
| `skeletal`         | line-angle structure: wedges, CIP ranks, R/S, IHD marks; the chair    | College organic chemistry (HC2)     |
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
| `chemDiagram`      | effusion trails ∝ 1/√M; 100 isotope atoms, a beam; ox. numbers; Δm    | Grade 10 gases, atoms, redox (H101) |
| `phaseEnvelope`    | binary Pxy, Txy, x–y: bubble/dew, tie line; McCabe–Thiele stairs      | College VLE, distillation (HC8)     |
| `earthLayers`      | Earth cut open: P, S paths, shadow zones; seismogram; epicenter       | Earth science interior (H72)        |
| `oceanProfile`     | the seafloor, shelf to trench, with a sonar ship; spring, neap tides  | Earth science ocean (H75)           |
| `atmosphereLayers` | temperature by altitude through four layers; a pressure map, winds    | Earth science atmosphere (H76)      |
| `hrDiagram`        | temperature against luminosity, log scales; regions, a star plotted   | Earth science stars (H79)           |
| `streamChannel`    | a channel to scale, w × d, and the water passing in 1 s: Q = A × v    | Earth science streams (H103)        |
| `reserve`          | a reserve as a bar cut into each year's use; empty after Q ÷ r years  | Earth science resources (H103)      |
| `geologicClock`    | Earth's history as one day: the event at t, the time since shaded     | Earth science history (H110)        |
| `coralSection`     | a fossil coral's daily lines across yearly bands; D beside 24 hours   | Earth science history (H110)        |
| `transit`          | a planet crossing its star to scale; the light curve dipping by δ     | Earth and space exoplanets (H110)   |
| `habitableZone`    | a star's zone 0.95√L to 1.37√L AU, green; the planet at a with T      | Earth and space exoplanets (H110)   |
| `parallax`         | Earth in January and July, a near star shifting on far stars; p, d    | Earth and space stars (H110)        |
| `controlVolume`    | a unit or steel device in a control volume; streams, Q̇, Ẇ, in = out   | College balances, devices (HC5)     |
| `velocityProfile`  | tube, vessel, plates or film: v arrows, v_max = 2v_avg, τ_w; c lines  | College transport, blood (HC13)     |
| `projectile`       | a launch to scale: path, vₓ and v_y at three points, H and R; drag θ  | Physics 2D motion, parametric (H59) |
| `freeBody`         | a block on a floor, ramp or rope; forces to scale, W sin θ; the net   | Physics forces, inclines (H60)      |
| `circularMotion`   | v tangent, v²/r to the center; Gm₁m₂/r² pulls; Kepler ellipse, areas  | Physics circles, gravity (H61)      |
| `collision`        | carts before and after: p = mv arrows, the total tip to tail; bounce  | Physics momentum (H62)              |
| `impulse`          | p₀, p and Δp arrows; F–t rectangle of area Δp; a slower stop dashed   | Physics momentum (H102)             |
| `powerLift`        | a crate hauled up h in t: stopwatch, W = mgh cut into J/s pieces      | Physics power (H102)                |
| `photoelectric`    | light of λ on a metal: E = 1240/λ, electrons with E − φ, λ₀ strip     | Physics modern (H102)               |
| `lightClock`       | light clock at rest and moving: the slant cΔt/2, γ; a rod L₀/γ        | Physics relativity (H102)           |
| `torque`           | a wrench or door: arm r, F at θ, F⊥ = F sin θ dashed, τ = rF⊥         | Physics rotation (H107)             |
| `rotor`            | hoop, disk, ball: I = cmr², τ = Iα; ω₀, ω; ω–t area; turn dials       | Physics rotation (H107)             |
| `oscillator`       | spring and block by its x–t trace, ±A, v_max, ½kx² + ½mv²; hung       | Physics oscillations (H107)         |
| `pendulum`         | a bob on L to a meter rule's scale, g named; T on a seconds strip     | Physics oscillations (H107)         |
| `capacitor`        | plates ±Q on a battery, even field, κ slab; the Q–V line, ½CV²        | Physics potential (H107)            |
| `section`          | a cross-section to scale: centroid, I; σ, τ blocks; RC bars, Whitney  | College mechanics, steel, RC (HC3)  |
| `beam`             | beam on supports: loads, reactions, V and M, bent shape; bar, column  | College mechanics, structures (HC1) |
| `simpleMachine`    | lever, block and tackle or ramp to scale; load, effort and the MA     | Physics simple machines (H63)       |
| `heatEngine`       | hot and cold reservoirs, Q_H = W + Q_L as bands; efficiency, Carnot   | Physics thermodynamics (H64)        |
| `rayDiagram`       | lens, mirror: principal rays, image; Snell, total reflection; slits   | Physics optics, telescopes (H66)    |
| `charges`          | point charges, traced field lines; kq₁q₂/r² forces; E at a point      | Physics electrostatics (H67)        |
| `induction`        | magnet into a coil, galvanometer; BIL on a wire; transformer turns    | Physics electromagnetism (H69)      |
| `fluidSystem`      | tank, manometer, gate, float; venturi, pitot, jet; pipe grade lines   | College fluids, pipe networks (HC6) |
| `none`             | no picture: the page opens on its values and equation, no labels      | Equation-only pages (H105)          |

`alleleFrequencies` (H38, a name too long for the table): 100 allele beads counted from p, a p
scale to drag, and the bars p², 2pq and q², for Grade 9 population genetics.

`fluidSystem` (HC6, `typesHe1g.ts`): college fluid mechanics and pipe networks by `mode`: `tank`
(P = ρgh), `manometer`, `gate` (F at the center of pressure), `buoyancy`, `venturi`, `pitot`, `jet`
(a fixed vane), `pipe` (grade lines; `pump: true` between reservoirs), `parallel`, `loop` (Hardy
Cross), `full` (a sewer in section), `plate` (a boundary layer) and `model` (Reynolds or Froude).
g and every density come from the page.

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
| `integerLine`      | `names: [first, second]` (with `second`) | each point named with its number under the line: "reactants 188"              |
| `linearFunction`   | `shade: { sign, flip? }`                 | the sign box's side (1 < 2 ≤ 3 > 4 ≥), reversed while `flip` < 0 (H90)        |
| `linearFunction`   | `test: { x, y }`                         | a point tested in the inequality: solid when true, worked below (H105)        |
| `lineSystem`       | `lines[i].shade: { sign, flip? }`        | each line's half-plane from its sign box; ax + by (sign) c, `flip: 'b'` (H90) |
| `lineSystem`       | `upright: [{ x, shade? }]`               | upright boundaries x ≥ k; with them only the overlap is shaded (a box) (H92)  |
| `lineSystem`       | `marks`, `given: { x, y }`               | arrows if parallel, a square if perpendicular; the given point marked (H92)   |
| `functionGraph`    | `inequality: { sign }`                   | f(x) (sign) 0 shaded to the x-axis; the solutions on it, open or closed (H90) |
| `functionGraph`    | `abs`                                    | abs(f(x)): the parts below the x-axis reflected up, f(x) dashed (H94)         |
| `functionGraph`    | `horizontal: b`                          | y = a·f(b(x − h)) + k: squeezed toward x = h, flipped for b < 0 (H94)         |
| `functionGraph`    | `restrict: { from?, to? }`               | the domain kept from a value, the rest dashed; the inverse of it (H94)        |
| `functionGraph`    | `family: 'rational'`, `p, q, r, s`       | (px + q) ÷ (rx + s) from its coefficients, asymptotes marked (H94)            |
| `functionGraph`    | `zeros: [{ x, times: n }]`               | a zero's multiplicity from a value, 1 to 9: touches or crosses (H105)         |
| `functionGraph`    | `family: 'arcsin'`, `degrees`            | sin⁻¹, cos⁻¹, tan⁻¹ read in degrees: ±90° on a plain axis (H105)              |
| `functionGraph`    | `unitsOf: { x, y }`                      | unit menus: parameters read in formula units, drawn in the shown ones (H106)  |
| `functionGraph`    | `transform: { a, h, k, from?, image? }`  | g(x) = a·f(x − h) + k beside f; an arrow from f's point to its image (H106)   |
| `functionGraph`    | `family: 'power'`, `a, p, q, h, k`       | a·(x − h)^(p/q) + k: odd roots of negatives, asymptotes when p < 0 (H106)     |
| `functionGraph`    | `family: 'logSum'`, `b, c`; `reject`     | log_b(x) + log_b(x + c) from max(0, −c); a candidate crossed out on x (H106)  |
| `functionGraph`    | `family: 'expr'`, `expr, of?, from?`     | an expression of the values: + − × ÷ ^, exp, ln, trig, √, abs, u (HC10)       |
| `functionGraph`    | `family: 'hill'`, `K, n?, top?`          | θ = top·Lⁿ ÷ (Kⁿ + Lⁿ), K ringed at half; n = 1 saturates (HC10)              |
| `functionGraph`    | `family: 'bateman'`; `feature`           | an oral dose's curve, t_max and C_max marked (HC10)                           |
| `functionGraph`    | `repeat: { every, count, avg? }`         | one-dose family summed into a sawtooth, C_ss,avg dashed (HC10)                |
| `functionGraph`    | `family: 'power'`, `exponent`            | a·(x − h)^z + k with a real exponent from a value (HC10)                      |
| `functionGraph`    | `family: 'erfc'`, `Cs, C0, width`        | C_s − (C_s − C₀)·erf(x ÷ w): a diffusion profile, C₀ dashed (HC10)            |
| `functionGraph`    | `area: { from, to, value?, signed? }`    | under f shaded, ∫f written; signed: + and − parts in two fills (HC12)         |
| `functionGraph`    | `between: { from?, to?, value? }`        | f and `other` shaded from the crossings, the area between written (HC12)      |
| `functionGraph`    | `strip: { at, dir? }`                    | one upright (dx) or flat (dy) slice of the shaded region (HC12)               |
| `functionGraph`    | `level: { y, label?, at? }`              | a dashed level (an energy, a half-power line), crossings ringed (HC12)        |
| `functionGraph`    | `accumulation: { from, x, value? }`      | a panel with F(x) = ∫f from `from`, its point and tangent f(x) (HC12)         |
| `functionGraph`    | `family: 'levenspiel'`                   | F_A0 ÷ (−r_A) against X: the CSTR rectangle and the PFR area (HC12)           |
| `functionGraph`    | `family: 'equalArea'`                    | P_max sin δ, the P_m line, A₁ and A₂ shaded at δ_cr (HC12)                    |
| `lineSystem`       | `lines[i].square`, `solutions`           | y = ax² + mx + b: a parabola and a line, 0–2 crossings ringed, shading (H106) |
| `polygon`          | `apothem`, `angle`, `area`               | the n triangles, the apothem square to a side, θ = 180° ÷ n, K = ½aP (H106)   |
| `venn`             | `chances.one`                            | one event: circle A in the rectangle, P(not A) = 1 − P(A) outside (H106)      |
| `table`            | `graph: { best }`, `rowsFrom: 'shown'`   | the output against the sweep under the table, the best point ringed (H106)    |
| `circle`           | `population: { people, density? }`       | a town's outline on a km grid, people as dots, the model circle r (H106)      |
| `transformation`   | `about: 'center'`                        | turns about the figure's own center; point symmetry pairs through it (H106)   |
| `rectangle`        | `bounds: { error, least?, greatest? }`   | (l ± e) by (w ± e) dashed, the band between shaded, a corner close-up (H106)  |
| `vectorDiagram`    | `space`, `z`; `cross`, `w`, `points`     | x, y, z axes, turnable: u × v, θ, areas, the box of u, v, w; PQ, M (H106)     |
| `polarGrid`        | `curve.shape: 'conic'`, `k, m, n, fn`    | r = k ÷ (m − n cos θ): focus at the pole, directrix, PF ÷ PD = e at P (H106)  |
| `conicGraph`       | `conic: 'turned'`, `A, B, C, F`; `angle` | Ax² + Bxy + Cy² = 1 with x′, y′ at θ, A′x′² + C′y′² = 1, its shape (H106)     |
| `functionGraph`    | `riemann: { n, to, from?, side?, sum? }` | n rectangles of equal width under the curve, right, left or middle; S (H106)  |
| `functionGraph`    | `family: 'rational'`, `top`, `poles`     | the top by coefficients over (x − p)… (x² + jx + k)…: a number on top (H106)  |
| `functionGraph`    | `family: 'response'`, `transient`        | x(t) = x_f + (x₀ − x_f)e^(−(t − θ)/τ): τ…5τ, 63.2%, 28.3%, a ramp (HC4)       |
| `functionGraph`    | `stepResponse: { wn, zeta, mode? }`      | 2nd-order step: ±2% band, peak, Tₛ, decay ratio; free decay, t½ (HC4)         |
| `functionGraph`    | `stepInput`, `error`, `second`           | the step above on its own axis; eₛₛ bracketed; a dashed open loop (HC4)       |
| `functionGraph`    | `scale: { x?, y? }`, `invertY`, `swap`   | log axes (decades, minor ticks); depth down; input on the vertical (HC9)      |
| `functionGraph`    | `family: 'gradation'`, `reads`           | % finer against log grain size, D₁₀, D₃₀, D₆₀; values dropped (HC9)           |
| `bars`             | `log`                                    | bars on a log scale, decade grid lines; a value ≤ 0 refused (HC9)             |
| `termsChart`       | `type: 'power'`, `step` (p)              | aₙ = a₁ × nᵖ: the squares 1, 4, 9 …, nᵖ labels, sums of squares, cubes (H106) |
| `normalCurve`      | `f: { df1, df2, stat, alpha, tails }`    | the F curve: P past F (or both tails), the critical value, decision (H106)    |
| `algebraTiles`     | `mode: 'box'`, `side`, `top`, `product`  | area box: row × column terms, like-term diagonals tinted, collected (H95)     |
| `algebraTiles`     | `mode: 'monomial'`, `a, m, b, n, c, k`   | a·xᵐ ÷ b·xⁿ as factors over a bar, cancelled pairs struck, c·xᵏ (H95)         |
| `integerLine`      | `compound.closed: [id, id]`              | each bound's circle from a sign box: 2 ≤, 4 ≥ closed; 1 <, 3 > open (H90)     |
| `integerLine`      | `fit`, `ticks`                           | the line spans its values (344–356 g → 340–360), not 0; a tick every 5 (H89)  |
| `integerLine`      | `compound: { join: 'equal', center, … }` | abs(x − c) = d: two closed dots at c ± d, distances bracketed, no band (H91)  |
| `normalCurve`      | `test.tail: { sign }`                    | Hₐ's sign box: 1 < 2 ≤ left, 3 > 4 ≥ right, 6 ≠ both tails (H90)              |
| `dnaStrand`        | `gene: { bases, stop? }`                 | a long gene: its first 12 bases, "…" and its stop; codons b ÷ 3 (H100)        |
| `dnaStrand`        | `mutation` at the start or stop codon    | start lost (no protein), stop lost (reads on), insertion before base 1 (H109) |
| `pieChart`         | `stages: [stage, …]`                     | a cellDivision card of each part’s phase beside its name (H109)               |
| `reaction`         | `many: true`                             | up to 18 molecules a formula in blocks; glucose as its 24-atom ring (H100)    |
| `bars`             | `flows: { out: [ids] }`                  | start, flows in (+, green) and out (−, red) as steps, end; axis cut (H100)    |
| `percentBar`       | `second: id`                             | a second percent on the bar: a band, a dashed line, its label (H104)          |
| `normalCurve`      | `t: { df }`                              | a t curve over the dashed normal; areas, t⋆ and the p-value by t (H99)        |
| `normalCurve`      | `intervals.count` (a value)              | how many simulated intervals, 20 to 100, typed; none drawn while ? (H105)     |
| `normalCurve`      | `meanName`                               | the mean's symbol when it is a number: μ_d for a mean difference              |
| `membrane`         | `counter`                                | a pump's second particle the other way (K⁺ in as Na⁺ goes out), own arrow     |
| `termsChart`       | `far`                                    | past 30 terms: the first six, a break, the nth lit (a₁₀₀) (H93)               |
| `termsChart`       | `type: 'recursive'`, `plus`              | aₙ = k × aₙ₋₁ + c from the one before, an arrow to each next (H93)            |
| `termsChart`       | `lit`, `litTerm`, `powers`               | a second lit term (B1 beside B2); terms as powers, 2² = 4 (H93)               |
| `scatter`          | `residuals`, `r`, `leastSquares`, …      | residual segments and plot, r, the least-squares line beside or given (H18)   |
| `scatter`          | `residualOf: { point: k }`               | a value picks the point, counted from 1: its residual lit and worked (H105)   |
| `boxPlot`          | `fences`; `second`, `labels`             | 1.5 × IQR fences, outliers as open dots; two box plots on one scale (H19)     |
| `dotPlot`          | `sd: { id, kind? }` (with `mean`)        | the mean as a line and a band one standard deviation either side (H19)        |
| `table`            | `twoWay: { rows, cols, cells, … }`       | two-way table: totals, lit cell/row/column, segmented bars, chi-square (H20)  |
| `treeDiagram`      | `chances: { first, second, names, … }`   | a chance per branch, B given A on the second stage, path products (H21)       |
| `venn`             | `chances: { a, b, both, shade, … }`      | probabilities per region; and, or, complement shaded; exclusive apart (H22)   |
| `venn`             | `chances.counts: { total, count? }`      | counts out of a total: regions as counts, neither outside, P = n/N (H97)      |
| `treeDiagram`      | `chances.third`, `thirdNames`, `path3`   | a third stage: 8 leaves, each path's product; three stages multiplied (H97)   |
| `treeDiagram`      | `namesBySize`                            | outcome names for a stage of each size: 2 H, T; 3 R, G, B; … (H105)           |
| `pascalTriangle`   | `fraction: { n, k, count?, chance? }`    | C(a, r) lit over C(n, r), drawn as a fraction: 10/84 = 5/42 (H97)             |
| `unitCircle`       | `through: { x, y, r? }`                  | a point off the circle: r, the legs, the unit point (x/r, y/r) (H98)          |
| `unitCircle`       | `pair: { a, b, op? }`                    | A, then B on (or back) to A ± B, arcs in turn; the formula worked (H98)       |
| `unitCircle`       | `solutions.also`                         | two values (sin x = −1/2 or 1): both lines, every solution marked (H98)       |
| `complexPlane`     | `power: n`; `roots: n`                   | z, z², …, zⁿ in turn; the n nth roots on a circle, a regular n-gon (H99)      |
| `complexPlane`     | `opFrom`                                 | a value picks the sum (1), difference (2 or −1) or product (3) (H105)         |
| `matrixGrid`       | `mode: 'determinant'`, `cramer`          | D by its diagonals or the first-row expansion; D, Dx, Dy side by side (H99)   |
| `matrixGrid`       | `steps: 'echelon' \| 'reduced'`          | row operations worked out from typed entries, a 0 row read out (H105)         |
| `histogram`        | `range: { from?, to?, total? }`          | bars k = from to to lit and added: P(X ≥ 4) = P(4) + P(5) (H99)               |
| `histogram`        | `clt: { mean, n, samples, se? }`         | CLT: a skewed population, the means of m samples, the normal σ/√n (H99)       |
| `histogram`        | `count` (with `data`)                    | a typed list's length: only its first n values are binned (H03)               |
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
| `transformation`   | `move: 'reflect'`, `slope`               | a value 1 or −1 picks the mirror y = x or y = −x (H105)                       |
| `scaleCopy`        | `center`; `splitter`                     | a dilation from any center with rays; DE ∥ BC cutting a triangle's sides      |
| `coordinatePlane`  | `midpoint`, `partition`; `polygon`       | M with equal halves ticked; P at m : n; side slopes, parallel and right marks |
| `circle`           | `sector`; `views`: `sector`, `radian`    | a sector by its angle (° or radians), arc and area; radius-long arcs around   |
| `curvedSolid`      | `net`, `slant`, `surface`; `cavalieri`   | the surface-area net (a cone's sector); two coin stacks, one leaning          |
| `crossSection`     | `solid: 'cylinder' \| 'cone'`            | a level cut (a circle) or upright cut, shaded and drawn flat beside           |
| `markedFigure`     | `regular`: `sides`, `triangles`          | a regular n-gon (3–30), n − 2 triangles from A, the exterior angle at B       |
| `markedFigure`     | `points: { D: { from, angle, meets? } }` | a point on a ray at a degree value, or where two such rays meet (H105)        |
| `markedFigure`     | `quadrilateral.across: [p, q]`           | a rhombus from its diagonals AC (level) and BD, not a side and angle (H105)   |
| `circleTheorems`   | `theorem`: `cyclic`, `arcAngle`          | an inscribed quadrilateral; an angle from two arcs, inside or outside         |
| `coordinatePlane`  | `fit`                                    | sized to the points: 5, 10 or 20 each way, up to `extent`                     |
| `factorTree`       | `root: { index, outside, inside }`       | equal pairs (or threes) ringed and brought out of the root: √72 = 6√2         |
| `powerScale`       | `log`                                    | a log₁₀ scale under the 1–10 ruler: log₁₀ 470,000 = 5 + 0.672                 |
| `punnettSquare`    | `inheritance` (Grade 9)                  | dihybrid 4 × 4 by phenotype; incomplete, codominant; X-linked with carriers   |
| `energyPyramid`    | `measure: 'biomass' \| 'numbers'`        | biomass or numbers: no share passed up unless `percent`; can be upside down   |
| `periodicTable`    | `trend: { property, value, compare }`    | a trend shaded (radius, ionization, electronegativity), arrows, a key         |
| `reaction`         | `limiting: { amounts, made, left }`      | particles on hand before; after: products made, the leftover ringed           |
| `reaction`         | `C{x}H{y}` terms, `most`, `ions`         | subscripts from values (a hydrocarbon chain), 32 a term, ions (H101)          |
| `moleMap`          | `limiting: { reactants, coef }`          | two reactants’ grams → moles → product, the smaller lit (H101)                |
| `energyProfile`    | `mode: 'ladder'`                         | enthalpy levels to scale, ΔH steps, a reversed one, the total (H101)          |
| `lewisStructure`   | hydrocarbon `branches: number[]`         | methyl groups on an alkane’s chain, named: 2,2-dimethylpropane (H101)         |
| `lewisStructure`   | ionic `charges: { metal, nonmetal }`     | the ions from their charges 1–3: Na⁺ Mg²⁺ Al³⁺, Cl⁻ O²⁻ N³⁻ → Al₂O₃ (H108)    |
| `chemDiagram`      | `mode: 'phase'`, `freezing`, `boiling`   | water's phase diagram, the solution's lines dashed at Tf and Tb (H108)        |
| `chemDiagram`      | `mode: 'rate'`, `times, concentrations`  | [A] against t through two readings, the secant, Δt and Δ[A], the rate (H108)  |
| `chemDiagram`      | `mode: 'cell'`, `cathode`, `anode`       | the galvanic cell of two E° values, its meter E°cell, the E° scale (H108)     |
| `chemDiagram`      | `mode: 'phase'`, `substance`             | any substance, log P: Clausius–Clapeyron vapor curve, F = C − P + 2 (HC8)     |
| `beaker`           | `solution: { mode, … }`                  | solute as dots by moles; a dilution’s two beakers; solubility (H52)           |
| `rockLayers`       | `dating` (Grades 9–12)                   | ages on dated layers, a dike cutting across, index fossils, 100 atoms         |
| `motionGraph`      | `kinematics: { view, at?, slope? }`      | signed v–t, + and − areas as Δx; x–t with a tangent at t₁; strobe (H58)       |
| `energyTrack`      | `spring: { k, compression, … }`          | spring launcher, rough patch (heat fd), ramp; start and now bars (H63)        |
| `wave`             | `standing`, `doppler`                    | string or pipe harmonic n, nodes and antinodes; Doppler fronts, cone (H65)    |
| `circuit`          | `mixed: { layout, resistors }`           | R₁ + R₂ ∥ R₃ or (R₁ + R₂) ∥ R₃; V, I, P at each resistor (H68)                |
| `seriesCircuit`    | `net: { topology, elements, … }`         | a schematic in textbook symbols; node V, mesh and branch I; KCL, KVL (HC7)    |
| `circuit`          | `net` (the same renderer)                | capacitor networks (Q, V at each), two batteries, internal r (HC7)            |
| `oscillator`       | `damping`, `phase`                       | dashpot; decaying trace in its envelope, log-dec crests; x₀, v₀, φ (HC11)     |
| `oscillator`       | `forcing`, `transmit`                    | F₀ sin ωt; X ÷ δ_st or TR against r, the point, √2 marked (HC11)              |
| `oscillator`       | `coupled`, `springs`                     | two blocks, mode arrows, beat traces; springs in series or parallel (HC11)    |
| `spectrum`         | `lines`, `photon`                        | H, He, Na lines, emission or absorption, shifted by z; E = hf (H70)           |
| `spectrum`         | `lines.line: 'rest'`                     | the lab line the rest value names (the nearest line): any Balmer line (H105)  |
| `collision`        | `type: 'general'`, `lost`                | v₁′ given, v₂′ from momentum; each cart's KE; KE lost (H102)                  |
| `collision`        | `spring` (with `explode`)                | the spring's energy named between the carts, KE gained (checked) (H105)       |
| `circularMotion`   | `mode: 'satellite'`, `central`           | orbit of r round M: v = √(GM/r), GM/r², T = 2πr/v; body to scale (H102)       |
| `motionGraph`      | `kinematics.strobe: 'vertical'`          | the strobe stood up left of the graph, + up: a dropped object (H102)          |
| `motionGraph`      | `acceleration: −9.8` (a number)          | free fall's gravity drawn with no value for it; the 9–12 v–t graph (H105)     |
| `projectile`       | `angle: 0` (a number)                    | a launch angle that never changes (level off a ledge): no handle (H105)       |
| `freeBody`         | `displacement`, `work` (floor)           | d bracketed, F cos θ dashed; W = Fd cos θ in the caption (H102)               |
| `gasPiston`        | `energy: { heat, work, change? }`        | first law: Q and W as bands, a Q, −W, ΔU waterfall (H102)                     |
| `gasPiston`        | `mixture: { gases, total?, fraction? }`  | 24 particles shared by partial pressure, colored by gas; stacked P bar (H108) |
| `charges`          | `mode: 'plates'`; `point`                | plates V, d: uniform E = V/d, F = qE; two charges: E₁, E₂, E at x (H102)      |
| `simpleMachine`    | `seesaw: { torque?, pivot? }`            | lever as a seesaw: F₁d₁ = F₂d₂ as curved arrows, Fₚ = F₁ + F₂ (H107)          |
| `charges`          | `equipotentials: { potential, … }`       | dashed circles r/2, r, 2r with V = kq/r; q₀ on r with U = q₀V (H107)          |
| `charges`          | plates `launch: { charge, mass }`        | a charge let go at a plate: strobed ∝ t², K = qΔV eV, v vs c/10 (H107)        |
| `induction`        | `mode: 'charge'`, `coulombs`             | a moving charge: F = qvB sin θ along qv × B; square to B, r = mv/qB (H107)    |
| `induction`        | `mode: 'field'`, `source`                | wire, loop, solenoid, toroid, plates: B lines, Amperian loop, B at r (HC19)   |
| `induction`        | `rails: { B, L, v, R }`                  | a rod on rails: ε = BLv, I round the loop by Lenz, F = BIL against v (HC19)   |
| `earthLayers`      | `mode: 'magnitude'`, `m1`, `m2`, …       | two seismograms to one scale; bars on a magnitude scale, 10^ΔM marked (H103)  |
| `oceanProfile`     | `mode: 'stripes'`, `distance`, `age`, …  | ridge from above: stripes mirrored, hatched past 12 Ma; a rock x km, t (H103) |
| `atmosphereLayers` | `mode: 'parcel'`, `temperature`, …       | a parcel cooling 10 °C/km, dew point 2 °C/km, meeting at a cloud base (H103)  |
| `atmosphereLayers` | `mode: 'balance'`, `albedo`, `sunlight`  | S ÷ 4 in, α reflected, F absorbed and sent out as σTₑ⁴; a thermometer (H103)  |
| `rockLayers`       | `dating.sample.second: { name, share }`  | a parent that decays two ways: the decayed atoms split by share (K-40) (H103) |
| `hrDiagram`        | `mass`, `luminosity?`, `lifetime?`       | a main-sequence star placed by mass, L = M^3.5; 3, 10, 30 M☉ marked (H103)    |
| `circularMotion`   | kepler `starMass`                        | round another star: a³ = M × T², star, closest and farthest labels (H110)     |
| `circularMotion`   | kepler `eccentricity` to 0.97            | long comet ellipses such as Halley's Comet (e = 0.967) (H110)                 |
| `rotor`            | `hollow: true`                           | the hollow ball (c = ⅔, a shell cut open) in the compare row (H111)           |
| `normalCurve`      | `f.tailsFrom: id`                        | one tail or two as the Hₐ value says (1, 3, 4 right; 0, 6 both) (H112)        |
| `pascalTriangle`   | `fraction.b`, `fraction.r`               | exactly k of r: C(a, k) × C(b, r − k) ÷ C(a + b, r), to 60 (H113)             |
| `reserve`          | `growth: id`, `lasts: id`                | use growing g% a year: slices grow, empty at T, beside steady Q ÷ r (H115)    |
| `photoelectric`    | `blank: true`                            | a "?" value draws nothing (no example φ, Kₘₐₓ or λ₀ faded behind it) (H116)   |

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
