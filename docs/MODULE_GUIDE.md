# Module content guide

Each problem type is its own module and page (`<skill id>~<slug>`, listed under its skill);
there are no switchers between modules.

Every skill and course topic ("module") has four sections, shown in this order: a
**table, chart or diagram**, **Formulas** (live calculator; "Number sentences" in K–2),
**Assumptions**, and a **Step-by-step** walkthrough. Under them, **Refresh** (the lessons to
review first) sits right above the related lessons. Content lives in
`src/data/modules/`. This guide is the standard every module is written and reviewed against.

## Standards

### 1. Accurate

- Formulas, rearrangements, units and constants are correct. Check every number in the worked
  example by hand.
- Variable ranges (`min`/`max`) are realistic for the lesson and never exclude a normal answer.
  For example, if the legs can be 12, the hypotenuse must be allowed past 12.
- Assumptions are true, and they are the conditions the formula actually needs.
- Vocabulary and notation match what students see in class at that level (Common Core for K–12
  math, NGSS for K–12 science, standard textbooks for college).

### 2. Most helpful for the student

- Assumptions say when the formula applies and what could trip the student up, not trivia.
- The worked example uses realistic, easy-to-check numbers.
- Step explanations say _why_ the rearrangement works in one sentence ("Divide both sides by
  the width"), not just what to type.
- Include the relations students actually use together, so any sensible set of inputs solves the
  rest. Don't add formulas that aren't part of the lesson.
- Order `startWith` so the value students most often solve for comes first. When a student types
  a new value, the oldest input is the one recalculated. For example, typing f(x) should move x,
  not the function's constants.

### 3. Simple and concise

- 2–4 assumptions, one line each where possible (about 20 words or fewer).
- Reading level fits the grade. Kindergarten through Grade 2 uses short, concrete words.
- Variable names are 1–3 words. Symbols are the ones the lesson uses.
- Nothing is explained twice across sections.

### 4. The best representation, not just one that works

Pick the picture a teacher would draw on the board for _this_ lesson. It should make the key idea
visible, and every value it shows must be a module variable, so moving it updates the formulas.
Label every value in the picture with the same letter or symbol the formulas use (`B = 11`, or a
name with its symbol, "Bigger amount (B)"), so students can match the picture to the formulas.
Use `rep.label(id)` and `rep.tag(id)` in picture components.

Letters standing for numbers start in Grade 6 (6.EE.2). Kindergarten through Grade 5 pages
show no letters anywhere (inputs, pictures, formulas, steps): values are named in words
("Bigger amount: 11"), and Grades 3–5 read each rule in words under its number sentence
("Length × width = area") and write equations with the name ("Area = 4 × 3"). In K–2, "="
appears only inside number sentences such as 8 + 5 = 13. The shared helpers do this for you: there `rep.label(id)` gives just the
value, `rep.tag(id)` just the name, and `rep.named(id)` a standalone "Name: value"; write any
other picture text with `rep.early` in mind.

| Lesson idea                                | Representation                                                   |
| ------------------------------------------ | ---------------------------------------------------------------- |
| Counting, adding/subtracting small numbers | Counters or number line (jumps)                                  |
| Place value                                | Base-ten blocks (hundreds, tens, ones)                           |
| Comparing quantities, data categories      | Bar chart / picture graph                                        |
| Fractions                                  | Fraction bar or partitioned shape                                |
| Percent                                    | 10 × 10 grid                                                     |
| Area / perimeter / volume                  | The shape with unit squares or cubes                             |
| Angles, circles, triangles                 | The geometric figure with labeled parts                          |
| Time                                       | Clock face                                                       |
| Measurement / length                       | Ruler or scale                                                   |
| Money                                      | Coins and bills                                                  |
| Functions and rates                        | Graph with the point, slope or area that matters                 |
| Growth over steps                          | Table of values (and/or graph)                                   |
| Forces, motion                             | Free-body or motion diagram                                      |
| Circuits                                   | Circuit diagram or I–V graph                                     |
| Processes with no formula                  | Labeled diagram or table, with a counting model if one is honest |

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
| `treeDiagram`      | two stages branching left to right, each branch 1/n; a path lit       | Grade 7 compound probability        |
| `marbles`          | a clear bag of colored glass marbles, mixed; draw one at random       | Grade 7 probability                 |
| `rootSquare`       | a square of area A on a grid, side √A dropped onto a number line      | Grade 8 square roots, irrationals   |
| `factorRows`       | powers as rows of factors: joined, cancelled in pairs, or stacked     | Grade 8 exponent rules              |
| `powerScale`       | a number on a 10ⁿ ruler, its decade opened up 1–10 (4.7 × 10⁵)        | Grade 8 scientific notation         |
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

Options on existing kinds (K–5 rebuild; each one is checked in `harness/pictures.ts`):

| Kind               | Option                                   | Draws                                                                         |
| ------------------ | ---------------------------------------- | ----------------------------------------------------------------------------- |
| `compareRows`      | `object`                                 | the pencil, crayon or ribbon measured, above its row of cubes                 |
| `hundredChart`     | `piece`, `multiplesOf`, `max: 1000`      | the number and its 4 neighbors; or multiples shaded; 1000: its hundred only   |
| `hops`             | a hop `sign` naming a variable (1 or −1) | a + / − switch that flips that hop                                            |
| `rectangle`        | `grid`                                   | unit squares on a perimeter page                                              |
| `rectangle`        | `roof`                                   | a slate roof in perspective with rain falling on it (roof-rain page)          |
| `polygon`          | `sideValues`, `around`                   | a shape with a length (or “?”) on each side, the perimeter under it           |
| `rectilinear`      | `cut` instead of `right`                 | a rectangle with a corner cut out, both areas labeled                         |
| `ruler`            | `marks: 2 \| 4`                          | half- or quarter-inch marks, lengths counted in marks                         |
| `equalGroups`      | `unit: 10`, `bundles`                    | ten-rods, `each` counted in tens; bundles: rows of ten circles, each numbered |
| `bars`             | `scale` as a variable                    | the grid spacing read from a value                                            |
| `pictureGraph`     | (with a key)                             | half a picture for a half count                                               |
| `fractionLine`     | `second`, `decimal`                      | a second line with a dashed join when equal; tenths labeled 0.1 … 1           |
| `table`            | `rows` as a function of the values       | rows that follow a parameter                                                  |
| `array`            | `sides`                                  | the rows and columns labeled, “?” until solved                                |
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
| `net`              | `solid: 'triangularPrism'`, `triangle`   | three rectangles and two triangles (right or isosceles); folds to the prism   |
| `dotPlot`          | `second`, `labels`, `difference`         | a second sample's dot plot under the first, same scale; the gap between means |
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

**Sliders.** Not every picture needs them. A slider row appears only for kinds where sweeping a
value teaches something the input boxes can't and the picture has no handle or tap of its own
(`src/components/module/sliderPolicy.ts`: fraction bars, the fraction and whole-number area
models, partitions, rectilinear shapes, the pie chart and unit cubes). Everything else has the input boxes and the picture's own touch controls. A module
can set `sliders: true | false` to override its kind; `docs/SLIDERS.md` lists every page.

## Written work in the step-by-step

The walkthrough shows the work a student at that grade writes, the way a teacher sets it out:

- **K–2**: number sentences and counting lines ("Count on from 3: 4, 5, 6, 7"); from Grade 2,
  a column sum or difference with the carries and regrouped digits marked, beside the jumps
  the number line shows.
- **Grades 3–5**: the number sentence, then the rule in words ("Length × width = area"), then
  the work on paper with the value named in words ("Area = 4 × 3"): column addition
  and subtraction, partial products and the long-division bracket (Grade 4 on). Running totals
  ("300 + 70 = 370") are left out when the columns show them; lines with words ("Tens: 40 + 30
  = 70") stay as the thinking behind the columns.
- **Grade 6 on and college**: the rule in letters, the rearrangement, the numbers put in, then
  one line per stage of simplifying in the order of operations (`c = √(3² + 4²)`,
  `c = √(9 + 16)`, `c = √25`), and the answer with its unit.

The grids and chains come from the engine (`src/data/modules/written.ts`, `simplify.ts`), so a
module only writes its `expr`, `how` and any `work` lines of its own. `autoWritten` picks a grid
for a plain arithmetic line by grade and by whether a student would do it in their head (no grid
for 30 + 20, 40 × 6 or 360 ÷ 4); a step can name its own grid (`written: (v) => longDivision(v.n,
v.d)`) or refuse one (`written: false`, as on the change-making pages, where counting up coins
is the lesson). The simplifying chain appears only where a step has no work lines or grid and
its expression has two or more operations. The dump prints each grid boxed under its step, and
the harness checks the equation a grid says against the step's answer.

## Units

- Give each variable its formula unit (`unit`) from the registry in `src/engine/units.ts`, e.g.
  `cm`, `g/cm³`, `m/s²`. Labels that aren't convertible (`%`, `per 1,000`, `years`) stay fixed.
- Students pick Metric or US customary for the module and any unit within that system for each
  value (m, km, ft, mi, …), or Mixed to use both systems together. The calculator converts. If the formulas hold directly in the chosen units, the steps
  are worked in them; otherwise the step-by-step converts to the formula's units first and
  converts the answers back.
- Ranges on physical quantities are physical limits and don't change with the unit.
- Whole-number lesson values (`integer: true`, e.g. Grade 3 side lengths) keep their number when
  the unit changes (4 cm → 4 in). In those modules, length, area and volume units change together
  (m → m²), and Mixed isn't offered.

## Module layouts

Every module today uses the **calculator** layout: values, relations, a picture, a
walkthrough. That fits a lesson whose idea is a quantity relationship. When the numbers are
incidental to what the lesson teaches, forcing them into a calculator gives a page that is true
but beside the point. The lesson reviewer's check L names the better layout from this catalog;
the engine builds a layout when a section needs it (log it in `ENGINE_LOG.md`).

| Layout     | Teaches                                                                                    | Page                                                                                    | Status     |
| ---------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | ---------- |
| calculator | a relationship between quantities                                                          | picture, numbers, formulas, walkthrough                                                 | built      |
| sort       | putting things into groups by a property (materials, shapes, changes you can undo)         | cards tapped into labelled groups, a count per group, one sentence about the property   | built      |
| sequence   | stages in order and how long each takes (life cycles, a day, a story problem's steps)      | stages tapped into order, each with its span, the spans added under the strip           | built      |
| compare    | two things side by side and what differs (two habitats, two beaks, two shadows)            | the calculator's compare pictures (rows, bars, rulers, thermometers) with a result line | calculator |
| observe    | a quantity recorded over time (plant height by week, temperature by hour, a weather chart) | a bar per column tapped to a height, the table, the pattern in a sentence               | built      |
| explore    | an idea with no honest quantity (what light does through a mirror, why shadows form)       | a figure with scenes (the figures are listed below)                                     | built      |

A layout page is data in `src/data/modules/layouts/` (`math.ts`, `science.ts`; types in
`types.ts`): a sort lists its bins and cards, a sequence its stages and spans, an exploration
its figure and scenes, an observation its columns and pattern sentence. The components in
`src/components/module/layouts/` draw any of them; never put a lesson's words in a component.
A skill id or problem-type id is either a calculator module or a layout page, never both
(`getPage`). `layouts.test.ts` checks the page belongs to a skill, fits together (every card
has a group, every scene fits the figure) and reads at the grade level. A review proposal
names the layout and gives its data; a new figure kind is engine work (log it).

Explore figures: `parts` (tap a part), `position`, `clock`, `dots`, `magnets`, `flashes`,
`lightPath` (lamp, object, eye, hand or mirror; with `wall`, a `height` and clear, cloudy or
solid blockers it traces the shadow), `particles`, `earth`, `push` (a ball pushed from
behind, the front or the side, gently or hard, or pulled), `vibration` (a band, drum, bell or
voice, still or shaking), `sky` (the sun east, high or west; the night sky with the moon in a `phase`, waxing lit on the right; `rising` for sunrise or moonrise in the east; `cycle` for the strip of eight shapes), `static` (a
balloon, rubbed or not, near paper, hair, a wall or a balloon) and `timesTable` (a 0–10
addition or times table lighting rows, columns, even or odd cells or the mirror line).
Grade 6 science adds `cell` (a plant, animal or bacterial cell with one part lit),
`bodySystems`, `waterCycle` (one process lit, with its driver), `front` (cold, warm or
stationary; or a high or low), `plates` (five boundaries, with rock ages or the mantle's
flow), `continents` (250, 150 and 0 million years ago, with a fossil, rock or shape clue)
and `rockCycle`, in `layouts/figures6.tsx`. `foodWeb` (`layouts/foodWeb.tsx`): sun, grass,
rabbit, grasshopper, mouse, frog, snake and hawk, each arrow "is eaten by"; a scene's `web`
lights one `chain`, crosses out a `removed` animal and marks members that grow (`more`) or
shrink (`fewer`). Grade 7 life science adds, in `layouts/figuresLife.tsx`: `leafCell` (a leaf in
the light and a cell with its mitochondria, the inputs and outputs as arrows and the word
equations; `leafCell: { process, lit? }` shows photosynthesis, respiration or both trading
their outputs), `carbonCycle` (air, a tree, a rabbit, dead matter and mushrooms, coal and oil,
a factory and the ocean; `carbon: { process? }` lights one process) and `pedigree` (a family
given as `people` in the standard symbols; `family: { lit?, carriers?, genotypes?, ask? }`).
shrink (`fewer`). Grade 7–8 chemistry (`layouts/chemFigures.tsx`): `molecules` (ball-and-stick
molecules in the classroom colors: one alone drawn big with each element named, or a scene's
`items` in a box packed as a `state`, with `after` in a second box behind an arrow),
`phases` (solid, liquid and gas boxes of the same particles, the changes between them as
arrows; a scene lights a `state` and a `change`) and `periodicTable` (an `element` with its
card, a `group`, a `period`, a `ring` of elements, `families` filled).
shrink (`fewer`). Grade 8, in `layouts/figures8.tsx`: a `magnets` scene can set
`field` (the field lines from N to S, `compasses` round the magnets, or one magnet `single`;
magnets are painted N red, S blue), and `planets` draws the planets and the moon to scale by
size beside the sun's edge, ringing a scene's `lit` ones with their widths in Earths.

Observe figures: an observation can set `figure: { kind: 'shadowStick', stick: 100 }`
(`layouts/ShadowStick.tsx`): a meter stick and its noon shadow for the column tapped last, to
scale, with the sun on the line over the stick's top (higher for a shorter shadow); `sides`
(one per column: `west`, `east`, `north`) turns the shadow through the day. Also, in
`layouts/observeFigures.tsx`: `thermometer`, `plantHeight` (a potted plant beside a cm ruler),
`ramp` (`heights` per column; the cup slid the value), `flashlight` (`distances` per column;
the lit circle side on and face on) and `cup` (an open cup, the first column's level dashed).

Drawn explore figures: a `parts` figure with `drawing: 'plant' | 'animal' | 'body'`
(`layouts/partsDrawings.tsx`) draws the thing, labels every part and lights the scene's part;
a `dots` scene with `animal: 'deer' | 'penguin'` draws a herd or huddle
(`layouts/animalFigures.tsx`). A sort can set `header: { kind: 'offspring', animals }`: the
parents and young (cats or deer) above the cards.

Card figures (sort cards and sequence stages): `lines`, `letter`, `polygon` (with a `curved`
side, or `marks` for square corners and equal sides), `circle`, `heart`, `solid`, `cut`
(equal or unequal parts, some shaded), `bar` (a ribbon with cubes laid right or wrong),
`dots` (pairs), `molecule` (a ball-and-stick molecule or one atom from a `formula`), `icon` (a fixed set of everyday things: flat outlines, and weather tools,
animals, adaptations and classroom, kitchen and drink things drawn in their materials in
`layouts/cardIcons.tsx`, shown on `/gallery` as `g.icons-*`), `fractionBars`, `ray` (segment,
ray, line or point), `net` (six squares), `inequality` (an open or closed circle and an
arrow), `cell` (a small cell) and `rock` (a texture); a `polygon` can mark its `base`, a
`dashed` height and the base `extend`ed. Every figure and card figure has a page at `/gallery`.

## Topics without a natural formula

Use the simplest honest quantity model (counts, totals, rates, percentages) so the calculator
still teaches something true. If no quantity model is honest, say so in review and show only
the assumptions and a table or diagram.

## Review process (required for every new or changed module)

1. **Automated checks:** `pnpm test`. Every value must connect to the others through the
   formulas; a separate group of values means two lessons (split it) unless the module lists it
   in `standalone` with a reason. These check that each module matches the taxonomy, that the
   example satisfies every formula and range, that every rearrangement agrees with its formula and
   has an explanation, that every input combination reproduces the example, and that the
   walkthrough balances. Two tests carry the reviewers' own expectations, so a section meets
   them before the review starts:
   - `standards.test.ts` reads everything a student sees (assumptions, names, number
     sentences, the walkthrough from the example, titles and `use` lines) and enforces the
     reading level for the grade, notation the grade has met (no letters standing for
     numbers before Grade 6, no "=" outside a number sentence in K–2, no × and ÷ or
     fractions before Grade 3, no negatives before Grade 6), no shorthand ("incl.", "e.g.") or jargon, formatting (true minus, curly
     quotes, no "1 tens", thousands separators), sentence punctuation and how many values a
     grade can hold.
   - `sampling.test.ts` runs random inputs, edit sequences and unit choices through the solver
     and the step builder, evaluates every step and check line, and fails on any line it can't
     read or that two steps share: when you write a new phrase or picture kind, teach the
     harness (`PHRASES` in `harness/evaluate.ts`, the picture checks in `harness/pictures.ts`)
     as part of the module.
   - Values that a lesson names (`allowed: [5, 10, 100]`) and working values nobody types
     (`derived: true`) are declared on the variable; the solver, sliders, harness and dump
     respect both. An answer the question gives as a fraction or mixed number takes
     `fraction: <largest denominator>` (5 1/4, 3 7/8 inches); a data set of 3 to 10 values puts
     `countedBy: { count: 'n', index }` on each value, and the relations read only the first
     n (`dotPlot` takes the same `count`). Money that isn't whole cents shows as "about $3.33".
   - A page whose problem is written as one equation (dividing fractions) can set `equation:
'{a}/{b} ÷ {c}/{d} = {e}/{f}'`: the boxes sit in the equation, `{a}/{b}` stacked as a
     fraction, worked-out values dashed; values not in it keep their rows. `1/{b}` puts a fixed
     number in a fraction, `{w} {a}/{b}` is a mixed number, `{b}^{n}` a power; text between
     the boxes (`%`, `:`, `of`) is written as is. On a letters page each box shows its letter.
     Used on the fraction pages (Grades 3–6), powers, percent, ratios, one-step equations and
     equivalent expressions (`{n}({m} + {x}) = {u} + {w}`).
   - Step text stays plain; the step-by-step typesets it at render time (`toLatex` in
     `src/engine/latex.ts`, drawn by `MathLine`): fractions and mixed numbers stacked from
     Grade 3, powers and roots, letters in italic and solving lines stacked on Grade 6 letter
     pages, divisions stacked from high school. K–2 stays plain. `latex.test.ts` checks every
     page's lines come back to the same text. The Formulas section uses the same rules, with
     three differences: Grade 6 formulas state rules, so ÷ stays inline; the rule in words
     under a Grade 3–5 number sentence gets only small number fractions.
   - Page limits (`constraint`: "3/4 is at most 1", "at most 24 wholes") are never shown as
     formulas or checks, since a student takes them for a step of the problem. A value that
     breaks one is refused under its box: "This page only works when …", in words.
   - A picture a page needs and the app lacks goes in `pictureRequests.ts` with the page ids it
     is for. Once it is on every page it names, set `status: 'placed'`; the test checks it.
   - The `use` line quotes the kind of released question the page solves, in the question's
     own words ("Which number is greater, 54 or 36?"), and never promises more.
   - `layouts.test.ts` covers the sort, sequence, explore and observe pages.
2. **Evidence, gathered once with no model involved:**
   `pnpm build:web && node scripts/review-evidence.mjs --prefix <ids or prefixes>`. It writes
   `.review/dump.txt` (every module's definition and the walkthroughs a student reads, from the
   opening values, from each other value as the unknown and at two range edges; layout pages'
   text), `.review/harness.txt`, `.review/shots/` (screenshots with the layout checks:
   sideways scroll, overlaps, K–2 letters, one-screen fit, cut-short slider text, small tap
   targets), `.review/sheets/` (one page per picture kind, 9 per sheet) and
   `.review/evidence.md` (the index, each page's picture kind and controls, and everything the
   scripts flagged).
3. **Two reviewers, in parallel, each reading only its own evidence:**
   - `lesson-reviewer` (`.claude/agents/lesson-reviewer.md`) reads the dump and the harness
     report: accuracy, **layout fit** (is a calculator how this lesson is taught? if not, which
     layout from the catalog above), split or merge, step clarity, language, plain language,
     exam and curriculum coverage. It fixes harness gaps and text formatting itself.
   - `page-reviewer` (`.claude/agents/page-reviewer.md`) reads the screenshots and runs one
     browser session: classroom use, tutoring, layout, formatting and the picture's
     interaction. It fixes small layout and formatting issues itself.
     Each keeps resumable notes in `.review/` and ends its report with an **Engine** section and
     a **Reviewer** section.
4. **Fix or answer every finding.** Record findings you intentionally don't act on, with the
   reason, in the pull request or commit message.
5. **Improve the engine.** Turn each finding the engine or its tests could have prevented into
   a shared helper, a test, a harness check or a picture feature before the next section, and
   log it in `docs/ENGINE_LOG.md`.
6. **Improve the reviewers.** Take out of the reviewers' instructions what is now automated,
   add what they missed or over-reported, add missing evidence to `review-evidence.mjs`, and
   log it with the review's token cost in `docs/REVIEW_LOG.md`.
7. **Visual check:** open each module and confirm the representation reads well at phone width,
   in light and dark mode.
8. **Slider check:** `NODE_PATH=$(npm root -g) node scripts/test-sliders.mjs [--prefix m.4.]`
   after `pnpm build:web` taps and drags every slider on every module page and fails on one
   that doesn't move, goes blank, leaves its range, disagrees with its input box, or throws.
   The report is `.review/sliders.md`.

The reviewers use `scripts/review-shots.mjs` and the Playwright installed in the dev container
(`NODE_PATH=$(npm root -g)`), not a project dependency.
