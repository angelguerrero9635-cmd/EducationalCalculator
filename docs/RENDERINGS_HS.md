# Renderings for Grades 9–12

Paste everything below the line into the pictures chat.

---

You are working in the EducationalCalculator repository on your pictures branch
(`claude/edu-calc-assets-questions-379toc`). First merge `claude/ios-education-wireframe-313z7z`
into it. The lesson chat has since:

- merged your grades 9–12 research;
- aligned the grades 9–12 taxonomy with it;
- listed every picture the high-school skills need.

Then read:

- `CLAUDE.md`;
- `docs/RENDERINGS_BRIEF.md`. Its hard rules and art direction still apply:
  - original drawings in react-native-svg;
  - online images as reference only;
  - theme tokens only;
  - the paint helpers for real objects;
  - abstract diagrams flat;
  - no new dependencies without asking.
- the quality floor in `docs/RENDERINGS_ROUND_4.md` ("Rules for every redraw");
- `docs/PICTURES.md` and `docs/LAYOUTS.md`: every picture kind and figure that exists, with its
  options;
- `TAXONOMY_ISSUES.md`, the entry "Grades 9–12 aligned with the high-school textbooks": the
  skills these pictures are for;
- `src/data/modules/pictureRequestsHs.ts`: the tracker entries `H01`–`H80`, all `requested`.

## What this round is

No Grade 9–12 page is built yet. The lesson chat will build them skill by skill, in taxonomy
order, starting with Algebra 1 and Biology. It needs your pictures first. Each entry names:

- the planned skills it is for (`pages`, the skill ids);
- what to draw (`what`);
- the extra uses (`notes`).

The specs below are the lesson chat's suggestion, not a contract. Where a better drawing meets
the same aim, draw it and say why in the entry's `notes`.

Build in this order. The early groups unblock the most pages.

1. **A: shared math pictures:** `H01`–`H15`. Start with `H01` `functionGraph`, which 18 skills
   use, then `H02`–`H07`.
2. **B: extensions of existing math pictures:** `H16`–`H29`. Each is an optional field on a
   kind that exists; every current page must keep working.
3. **D: Biology, `H31`–`H42`; E: Chemistry, `H43`–`H57`.** These are the first science
   courses built.
4. **C, F and G: statistics figures, Physics and Earth and space:** `H30`, `H58`–`H80`.

## Rules for this round

- **Calculator pictures are driven by values**, as in K–8:
  - read the module's values through `useRep(calc)`;
  - a "?" draws faded;
  - drags go through `DragHandle` and `rep.slide`;
  - pin typed values with a `keep` list, as `lineSystem` does since the Grade 8 review.
  - Where a picture can't solve backwards from a drag, set `fixed` (no handles) rather than let
    a drag clear what the student typed.
- **High-school notation.** Grades 9–12 steps use the `standard` math band:
  - letters in italic;
  - powers with ^ or superscripts;
  - every division stacked.

  Picture labels follow the same notation:
  - _f_(_x_), not f(x);
  - x², √2, π/3;
  - "5 × 10⁻³", never "5e-3".

  Keep radicals and π exact where the lesson is exact: 3√2, not 4.2426. Give the decimal only
  in a caption after "≈".

- **Graphs.**
  - Choose the window from the values, with nice ticks: 1, 2 or 5 × 10ⁿ, or multiples of π/6 on
    a trig axis.
  - Label axes with names and units when the page passes them.
  - Put the origin in view unless the page says otherwise.
  - Clip curves to the window. Draw asymptotes dashed and holes as open circles.
  - Sample curves densely enough that tan and 1/x never draw a line across an asymptote.
  - Harness checks: every marked feature (a zero, the vertex, an intercept, an asymptote) lies on
    or at the curve to 1e-6.
- **Geometry to scale.** Triangles, circles and solids are drawn from the values. Marks mean
  what they say:
  - one tick for one pair of equal sides, two for the next;
  - one arc per pair of equal angles;
  - a square for a right angle;
  - arrows for parallel lines.

  A figure the values can't make (sides that don't close, an inscribed angle bigger than its
  arc) draws faded with the reason in the caption. Never draw a wrong figure.

- **Science pictures.** Real apparatus is painted in its materials: glassware, pistons, magnets,
  coils, cells. Particle models are counted exactly from the values. Explore and sequence figures
  follow `docs/LAYOUTS.md`, and each scene lights one process. Draw cells, organelles, DNA and
  molecules from references, never from memory alone: mitosis phase shapes, VSEPR angles, and
  orbital order are checked facts.
- **Registering a new kind** (from `RENDERINGS_BRIEF.md`) touches:
  - `types.ts`;
  - `reps/index.tsx`;
  - `meta.ts`;
  - the kind list in `modules.test.ts`;
  - a check in `harness/pictures.ts`;
  - a gallery demo, whose module id is the skill it is for (`m.9.quadratic-functions`) so
    `/gallery` groups it;
  - a line in `docs/PICTURES.md`.

  An explore, sequence or card figure goes in `layouts/types.ts`, is drawn in
  `src/components/module/layouts/`, and gets a line in `docs/LAYOUTS.md`.

- **Gallery demos stand in for the missing pages.** For each entry, add demos that cover the
  cases in its `what` and `notes`: one per family, criterion or mode, plus one at the edge of a
  sensible range. The lesson chat copies them into the grade files with
  `node scripts/promote-demo.mjs`, so give each demo real variables, relations, steps and use
  lines, as a page would have.
- **Don't touch** lesson files (`src/data/modules/math`, `science`, `layouts`, `college.ts`), the
  taxonomy, or other entries' pages and status.

## The pictures

### A. Shared math pictures

- **H01 `functionGraph`.**
  - One picture for every function family. The spec gives `family` and the variable ids of its
    parameters, for example `{ family: 'quadratic', form: 'vertex', a, h, k }`. The families
    are:
    - linear, absolute, piecewise (a list of pieces, each with its own formula and end types);
    - quadratic (standard, vertex and factored forms);
    - exponential (with base b or with e), logistic (carrying capacity K);
    - log (base b), root (square and cube);
    - polynomial (coefficients, or zeros with multiplicities);
    - rational (numerator and denominator zeros; draw vertical and horizontal or slant
      asymptotes and holes);
    - sin, cos, tan, and the inverse trig functions on their restricted domains.
  - Optional marks: `zeros`, `intercept`, `vertex` (with the axis of symmetry), `extrema`,
    `asymptotes`, and `domain` and `range` drawn as brackets on the axes.
  - A traced point `at` shows _f_(_x_) with a handle that moves along the curve.
  - A second curve: `parent` (dashed), `inverse` (with the line y = x), or `other` (a second
    family, for solving _f_(_x_) = _g_(_x_) at the crossing).
  - `shade` fills above or below the curve, or between two x values.
  - Calculus preview: `limit` (approach arrows from the left and right to a hole or a jump) and
    `secant` (a secant through two points that turns into the tangent as h shrinks).
  - Drags: the vertex, a point on the curve, and a stretch handle for _a_.
  - Harness: each marked feature satisfies the formula.
- **H02 `normalCurve`.**
  - A normal curve over mean μ and standard deviation σ, with both an x axis and a z axis.
  - Shade between two values, or one tail or two. Show the area as a probability to 4 decimals.
  - `bands` draws the 68–95–99.7 rule.
  - `sample` draws the sampling distribution of the mean (σ/√n) over the population's curve.
  - `interval` draws a confidence interval as a bar under the curve.
  - `intervals` stacks 20–100 simulated intervals around the true mean and counts how many
    capture it, from a fixed seed.
  - `test` shades the rejection region and the p-value, and marks the test statistic.
  - `chiSquare` draws the chi-square curve for df 1–10 with its right tail.
  - Harness: shaded areas match the normal CDF to 1e-4.
- **H03 `histogram`.**
  - Bins from data or from counts, with a bin width and a start value.
  - Optional mean and median markers, and a shape word in the caption.
  - `probability` mode draws a probability distribution: bars of P(X = k) with E(X) marked.
    `binomial` computes the bars from n and p.
  - Harness: the bar heights sum to the data count, or to 1 in probability mode.
- **H04 `triangleSolver`.**
  - A triangle to scale from three given parts. Parts are named by vertex: A, B, C and sides a,
    b, c.
  - The given parts are marked. The worked-out parts are drawn once known.
  - For congruence pages, draw two triangles with matching marks and a criterion label: SSS,
    SAS, ASA, AAS or HL. For similarity pages, a second triangle at a scale factor k.
  - For trig pages:
    - angle θ with its opposite, adjacent and hypotenuse named;
    - 45-45-90 and 30-60-90 with side ratios as radicals.
  - The SSA ambiguous case draws both triangles when two exist.
  - An optional scene makes the triangle a ramp, a ladder or a line of sight at an angle of
    elevation.
  - Harness: the drawn sides and angles satisfy the laws of sines and cosines.
- **H05 `markedFigure`.**
  - A figure from named points with coordinates, or from lengths and angles given as values.
    The parts are segments, rays, lines, arcs, tick and arc marks, right-angle squares and
    parallel arrows.
  - Presets:
    - parallel lines cut by a transversal, with angles 1–8;
    - a triangle with a median, angle bisector, perpendicular bisector, altitude or midsegment,
      and its center (centroid, incenter, circumcenter, orthocenter);
    - quadrilateral families (parallelogram, rectangle, rhombus, square, trapezoid, kite) with
      diagonals and their marks.
  - `highlight` lights the parts one proof step uses: givens in one tint, the part proved in
    another.
- **H06 `unitCircle`.**
  - An angle θ in degrees or radians, dragged around the circle.
  - The point (cos θ, sin θ), with the reference triangle and the reference angle.
  - The special angles marked, with exact coordinates such as √3/2.
  - `graph` unrolls sine or cosine beside the circle, with the same point marked.
  - `solutions` marks every angle on one turn with a given sine, cosine or tangent.
  - Harness: the point lies on the circle, and the marked angles satisfy the equation.
- **H07 `algebraTiles`.**
  - x² tiles, x tiles and unit tiles in two colors for positive and negative.
  - For multiplication, the factors run along two edges and the product fills the rectangle.
    Factoring arranges a trinomial's tiles into that rectangle.
  - Completing the square shows the missing corner tiles. Zero pairs cancel with a strike.
  - Counts come from the coefficients, from −10 to 10.
  - Harness: the tiles add up to the polynomial.
- **H08 `vectorDiagram`.**
  - Arrows on a grid, given by components or by magnitude and direction.
  - Sums tip to tail, or as a parallelogram; a scalar multiple; the angle between two vectors,
    with the sign of the dot product.
  - Drag a tip.
  - Physics pages pass names and units: velocity in m/s, force in N.
- **H09 `complexPlane`.**
  - The number a + bi as a point and an arrow, with the real and imaginary axes.
  - The conjugate as a reflection, a sum as a parallelogram, and the modulus and argument.
  - For polar form, the point written r(cos θ + i sin θ).
- **H10 `polarGrid`.**
  - A polar grid, a point (r, θ), and curves: a circle, the rose r = a cos(nθ), a cardioid and
    a spiral.
  - `parametric` traces x(t) and y(t) with direction arrows and the point at t, dragged.
- **H11 `conicGraph`.**
  - A circle (x − h)² + (y − k)² = r², a parabola with its focus and directrix, an ellipse with
    its foci and axes, and a hyperbola with its asymptotes.
  - Drag the center and the radius or the axes.
  - An explore figure cuts a double cone to show each conic.
- **H12 `circleTheorems`.**
  - Points on a circle, dragged along it, give central and inscribed angles, the angle in a
    semicircle, and a tangent at right angles to the radius.
  - Chord–chord, secant–secant and secant–tangent segments are labelled with their products.
  - Harness: the angle and product relations hold.
- **H13 `pascalTriangle`.**
  - Rows 0 to 12, with row n and entry k lit.
  - Counting slots (n × (n − 1) × … for r places), with the division by r! for combinations.
- **H14 `matrixGrid`.**
  - Matrices in brackets, up to 4 × 4.
  - For multiplication, a row and a column are lit and their products summed into the entry.
  - Row operations on an augmented 3 × 3 system, with the step written beside the arrow.
- **H15 `termsChart`.**
  - The terms of a sequence as bars or points, and partial sums as a stepped line.
  - An infinite geometric series approaches its sum S, drawn dashed.

### B. Changes to existing math pictures

Each change is an optional field:

- **H16:** `lineSystem` shades half-planes, with a dashed or solid boundary, and the overlap of
  two. Elimination draws the sum of the two equations as a third line through the solution.
- **H17:** `integerLine` draws compound inequalities ("and" as the overlap, "or" as the union),
  and |x − c| < d as a distance from c.
- **H18:** `scatter` draws residual segments, a residual plot underneath, r, and the
  least-squares line.
- **H19:** `boxPlot` marks outliers past the 1.5 × IQR fences and can stack two box plots on one
  scale. `dotPlot` gets a mean line with a ±1 SD band.
- **H20:** `table` draws a two-way table:
  - totals;
  - a lit cell, row or column, with its relative frequency;
  - a segmented bar beside it;
  - for chi-square, observed and expected counts.
- **H21:** `treeDiagram` takes a probability per branch, and draws P(B | A) on the second stage.
- **H22:** `venn` takes probabilities, and shades A ∩ B, A ∪ B, or the complement. Mutually
  exclusive sets draw apart.
- **H23:** `transformation` composes two moves and shows the image in between. It reflects in any
  line (y = x, y = −x, x = k) and rotates about any point. It can draw lines of symmetry and the
  order of rotational symmetry.
- **H24:** `scaleCopy` dilates from any center, with rays, and takes scale factors below 1. It
  can draw the side-splitter: a line parallel to one side of a triangle.
- **H25:** `coordinatePlane` draws a segment's midpoint and the point that partitions it in the
  ratio m : n. It draws distance as the legs of a right triangle, and the slopes of a polygon's
  sides.
- **H26:** `circle` shades a sector by its central angle in degrees or radians, labels the arc
  length, and can wrap radius-length arcs around the circle to show what a radian is.
- **H27:**
  - `curvedSolid` adds pyramids, cones and spheres with their surface-area nets (a cone's net
    is a sector) and Cavalieri stacks: two stacks of coins, one leaning.
  - `crossSection` cuts a cube, a cylinder or a cone with a plane and draws the section beside
    it.
- **H28:** `factorTree` circles pairs of equal factors and brings one of each out of the root:
  √72 = 6√2.
- **H29:** `powerScale` gets a log mode that reads the exponent off the ruler: log₁₀ 470,000 ≈
  5.67.

### C. Statistics

- **H30 `studyDesign` (explore figure).**
  - Population → sample → groups assigned at random, with scenes for:
    - a survey;
    - an observational study;
    - an experiment with a control group.
  - Card figures for five sampling methods: simple random, stratified, cluster, systematic and
    convenience.

### D. Biology

- **H31 `macromolecules` (explore):** monomers joining into polymers: glucose rings into starch,
  amino acids into a folded chain, nucleotides into a strand, glycerol and three fatty acids
  into a fat.
- **H32 `membrane`:**
  - A phospholipid bilayer, with particles on each side counted from the values. Arrows point
    from high to low concentration, and a protein channel carries active transport.
  - Card figures: a red blood cell and a plant cell in hypotonic, isotonic and hypertonic water.
- **H33 `organelleEnergy` (explore):** a chloroplast and a mitochondrion, with glucose, O₂, CO₂,
  H₂O, light and ATP flowing between them. A scene lights one process.
- **H34 `cellDivision` (sequence stage figures):**
  - interphase, then prophase through telophase and cytokinesis;
  - meiosis I and II, with homologous chromosomes colored by parent and crossing over;
  - chromosome counts driven by 2n.
- **H35:** `punnettSquare` draws a dihybrid 4 × 4 square, colors for incomplete dominance and
  codominance, and X-linked alleles. `pedigree` half-shades carriers.
- **H36 `dnaStrand`:**
  - A DNA ladder from a base sequence (up to 12 pairs), its complement, and the mRNA.
  - The codons bracketed, with their amino acids from the codon table.
  - A mutation (substitution, insertion or deletion) lit in the sequence, with its effect on the
    protein.
- **H37 `gel`:** gel electrophoresis, with a ladder lane and bands placed by fragment size (log
  scale). PCR as copies doubling per cycle.
- **H38 `alleleFrequencies`:**
  - Hardy–Weinberg: p and q as beads in a population of 100, with bars for p², 2pq and q².
  - Card figures: homologous limbs (arm, wing, flipper, leg) with matching bones colored alike.
- **H39 `cladogram`:** traits marked where they appear on the branches. Card icons for the
  domains and kingdoms.
- **H40:** `energyPyramid` adds pyramids of biomass and numbers. Also sequence stages of
  succession (bare rock to forest), and a nitrogen-cycle explore figure beside `carbonCycle`.
- **H41 `feedbackLoop` (explore):**
  - Stimulus → sensor → control center → effector → response, with the negative-feedback
    arrow.
  - Scenes for body temperature, and for blood sugar with insulin and glucagon.
  - The climate page reuses the loop for the ice–albedo and water-vapor feedbacks.
- **H42 `immuneResponse`:**
  - Pathogen card icons: a virus, a bacterium, a fungus and a parasite.
  - The immune response in stages: antigen, B and T cells, antibodies, memory cells.
  - A plot of antibody levels, the second exposure faster and higher.

### E. Chemistry

- **H43 `unitChain`:**
  - Conversion factors in a chain, with cancelled units struck through.
  - A ruler read to one estimated digit.
  - Accuracy and precision shown as dots on a target.
- **H44 `atomModel`:** a Bohr model from Z, A and charge: protons and neutrons in the nucleus,
  electrons on shells. Isotopes change the neutrons; ions change the electrons.
- **H45 `orbitalDiagram`:**
  - Boxes filled in Aufbau order with up and down arrows (Hund's rule, Pauli), with the
    notation beside them (1s² 2s² 2p⁴).
  - An energy ladder, with emission lines from electron jumps.
- **H46:** `periodicTable` shades a trend across the table (atomic radius, ionization energy,
  electronegativity) with the trend arrows.
- **H47 `lewisStructure`:**
  - Electron-dot structures for H₂O, CO₂, NH₃, CH₄, O₂ and N₂, and simple ions.
  - Electrons moving across in an ionic bond, and the sea of electrons in a metal.
  - Hydrocarbon chains from n carbons, single or double bonds.
- **H48 `vsepr`:** ball-and-stick shapes (linear, bent, trigonal planar, trigonal pyramidal,
  tetrahedral) with their bond angles and dipole arrows. Hydrogen bonds between water molecules
  drawn dotted.
- **H49:** `reaction` draws molecules from the coefficients, with an atom tally on each side and
  the leftover reactant lit to show the limiting one. Reaction-type card figures: synthesis,
  decomposition, single and double replacement, combustion.
- **H50 `moleMap`:**
  - Grams ↔ moles ↔ particles ↔ liters of gas at STP.
  - Each arrow carries its factor (molar mass, 6.022 × 10²³, 22.4 L), and the current value is
    lit.
- **H51 `gasPiston`:**
  - A glass cylinder with a metal piston.
  - Particles whose count follows n and whose speed follows T.
  - A pressure gauge and a volume scale.
  - Boyle, Charles and combined modes pin the right variables.
- **H52:** `beaker` counts solute particles per volume, and shows dilution as two beakers
  (M₁V₁ = M₂V₂). Solubility curves use `functionGraph`, or `plot` with data.
- **H53 `energyProfile`:**
  - Reactant and product levels, ΔH, and the activation hump, with the catalyst path dashed.
  - A coffee-cup calorimeter, q = mcΔT, shared with physics.
- **H54 `equilibriumChart`:** concentrations against time, leveling off, and the shift after a
  stress (Le Châtelier).
- **H55 `phScale`:**
  - A 0–14 scale in indicator colors, with the value marked and [H⁺] written as a power of ten.
  - A titration curve with its equivalence point.
- **H56 `electrochemicalCell` (explore):** a galvanic cell with two metal electrodes in their
  solutions, a salt bridge, and electrons flowing through the wire to a bulb or a meter.
- **H57 `decayChart`:** a grid of atoms decaying at random from a fixed seed, with what is left
  after n half-lives and the decay curve. Nuclear equations with mass and atomic numbers. The
  radiometric-dating page reuses it.

### F. Physics

- **H58:** `motionGraph` shades the area under a velocity–time graph as the displacement, draws
  the tangent slope, and adds a strobe motion diagram.
- **H59 `projectile`:** a trajectory from launch speed, angle and height, with velocity
  components at three points, the maximum height and the range. Drag the angle. The parametric
  page reuses it.
- **H60 `freeBody`:** a block with scaled force arrows (weight, normal, friction, tension,
  applied), the net force, and an incline with the weight's components.
- **H61 `circularMotion`:**
  - An object on a string, or a car on a curve, with velocity tangent to the path and
    acceleration toward the center.
  - Two masses with the gravitational pull between them.
  - `orbit` gets Kepler's ellipse with foci and equal-area sectors.
- **H62 `collision`:** carts on a track before and after, with momentum arrows scaled from the
  values. They stick together (inelastic) or bounce (elastic).
- **H63 `simpleMachine`:** a lever, a pulley system and an inclined plane, with effort, load and
  mechanical advantage. `energyTrack` gets a friction-heat bar and a spring.
- **H64 `heatEngine`:** a hot reservoir, the engine, work out and heat to the cold reservoir,
  with an efficiency bar.
- **H65:** `wave` draws standing waves on strings and in open and closed pipes (harmonic n,
  nodes and antinodes), and Doppler wavefronts bunched ahead of a moving source.
- **H66 `rayDiagram`:**
  - Converging and diverging lenses, and concave and convex mirrors. Three principal rays; the
    object and image from 1/f = 1/d₀ + 1/dᵢ, real or virtual, upright or inverted.
  - Refraction with the normal and Snell's law, and total internal reflection.
  - Double-slit fringes.
  - Refracting and reflecting telescopes for the Earth and space page.
- **H67 `charges`:** point charges with field lines, and Coulomb force arrows scaled by q₁, q₂
  and r.
- **H68:** `circuit` draws mixed series-parallel circuits with meter readings at each resistor,
  and power.
- **H69 `induction`:**
  - A magnet moving through a coil, with a needle meter.
  - The force on a current in a magnetic field (right-hand rule).
  - A transformer with turns Nₚ and Nₛ.
- **H70:** `spectrum` draws emission and absorption lines for H, He and Na, the same lines
  redshifted, and the photon energy from the frequency.

### G. Earth and space

- **H71 `mineralIcons` (card icons):** quartz, feldspar, mica, calcite, a halite cube, pyrite and
  hematite, in their materials, and the Mohs hardness scale.
- **H72 `earthLayers`:**
  - A cross-section of Earth with P- and S-wave paths and the shadow zone.
  - A seismogram with the P and S arrivals.
  - An epicenter located from three stations' distance circles, driven by the values.
- **H73 `landforms` (explore):**
  - volcano types (shield, composite, cinder cone);
  - folds, and normal, reverse and strike-slip faults;
  - a U-shaped and a V-shaped valley, a meandering river;
  - an aquifer and the water table, and dunes.
- **H74:** `rockLayers` gets absolute ages, an igneous intrusion cutting across the layers, and
  index fossils.
- **H75 `oceanProfile`:**
  - The ocean floor profile: shelf, slope, ridge and trench.
  - Surface currents and gyres on a map, and the deep conveyor.
  - Tides from the moon and the sun (spring and neap).
- **H76 `atmosphereLayers`:**
  - The layers of the atmosphere with the temperature profile.
  - A pressure map with highs, lows and isobars, and wind arrows turned by the Coriolis effect.
- **H77 `greenhouse` (explore):** sunlight in, infrared out and some sent back, as scenes with
  more and less CO₂. Climate zones by latitude.
- **H78 `energySources`:** card icons for a solar panel, wind turbine, dam, coal, an oil rig and
  a nuclear plant, and a bar or pie of an energy mix.
- **H79 `hrDiagram`:**
  - Temperature (hot on the left) against luminosity, both on log scales.
  - The main sequence, giants, supergiants and white dwarfs, with a star plotted from its
    values.
  - The life-cycle sequence stages: nebula to white dwarf, or to supernova, neutron star or
    black hole.
- **H80 `expandingUniverse` (explore):**
  - Galaxies spreading apart as space stretches, and a Hubble plot of speed against distance.
  - Galaxy type card figures: spiral, elliptical, irregular.
  - Solar-system formation as sequence stages, from nebula to planets.

## When you finish an entry

- Set it to `status: 'drawn'` and list its gallery ids.
- In `notes`, give the spec fields a page passes, with an example. This is the lesson chat's
  instruction for placing it.
- Commit after each kind with a clear message, and push to your branch. Before each push, run
  `pnpm check`, build, and take 390 px shots of the demos in light and dark.

When A and B are drawn, add a dated line under "Done" in `docs/RENDERINGS_BRIEF.md`. Do the same
after each later group, so the lesson chat knows which courses it can start. The lesson chat
merges your branch and places the pictures (`placed`) as it builds each grade.
