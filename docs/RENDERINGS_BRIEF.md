# Renderings brief: pictures for every module through Grade 8

A prompt for a second chat working in this repository. Paste everything below the line.

---

You are working in the EducationalCalculator repository (Expo SDK 57, Expo Router, TypeScript
strict, react-native-svg). It is a study app for K–12 students, often minors. Read
`CLAUDE.md`, `docs/MODULE_GUIDE.md` (the picture catalog and the "Art direction" section) and
`src/theme.ts` before you start.

## Your job

Make every picture (charts, graphs, diagrams, object pictures, card icons and explore
figures) that the math and science modules need from Kindergarten through Grade 8: the ones
the built K–6 pages still lack, the changes to existing pictures listed below, and the ones
the planned Grade 7 and 8 skills will need. You own all image work: the lesson chat will not
draw or change pictures. It builds and changes the lesson pages at the same time, using the
closest existing picture until yours is ready, then pulls your branch and plugs yours in.

## Hard rules

- **Online images are reference only.** Look at photos and illustrations online (Wikimedia
  Commons, NASA, USGS, NOAA, Openverse, museum and field-guide pictures) to get shapes,
  proportions, colors and details right, then draw the picture yourself in code with
  react-native-svg. Never copy, trace, embed or download an image into the repository: no
  image files, no bundled assets, no network calls from the app. Lesson text and pictures
  stay original.
- **Values stay exact.** Anything that moves with the student's numbers (bars, lines,
  points, liquid levels, handles, labels) is drawn from the values; charts and number
  diagrams stay flat and exact.
- Ask before adding a dependency (an image or SVG library).
- **Every color is a theme token** (`usePalette()`; add tokens to `src/theme.ts` in both light
  and dark). `src/components/__tests__/colors.test.ts` fails on any hex or rgb literal in a
  component.
- **Art direction** (MODULE_GUIDE): real objects are drawn in their materials with the
  helpers in `src/components/module/reps/paint.tsx` (`usePaintIds`, `TopLight`, `Sheen`,
  `Ball`, `Glass`, `Metal`, `FloorShadow`, `BoxShadow`, `LitRect`); abstract diagrams (number
  lines, grids, graphs, bars, pie charts, measured shapes, tables, trees) stay flat. Light
  comes from the top left. Gradient ids come from `usePaintIds` only.
- **Pictures are driven by values.** A picture reads the module's values through `useRep(calc)`
  (`src/components/module/reps/common.tsx`): `rep.known(id)`, `rep.shown(id)`,
  `rep.value(id)`, `rep.label(id)`. A value that is "?" draws faded or as a placeholder and
  never as a number the student did not type. Captions say the equation the picture shows,
  with every number in it (a coefficient, a unit), in the grade's words: no letters for
  numbers before Grade 6 (K–5 name values in words).
- **Drags** use `DragHandle` and pass `rep.slide(id)` to `calc.set`, so a drag stops at the
  last value that fits. Labels stay inside the canvas (`fitLabel`). Nothing is cut off at
  390 px wide; no sideways scroll.
- **Registering a new picture kind** touches: its type in `src/data/modules/types.ts`
  (`Representation`), `src/components/module/reps/index.tsx`, `meta.ts`, the kind list in
  `src/data/modules/__tests__/modules.test.ts`, a check in
  `src/data/modules/harness/pictures.ts`, a demo module in `src/data/modules/gallery.ts` (so
  it shows on `/gallery`), and a line in the MODULE_GUIDE picture catalog. Layout figures
  (`CardFigure`, explore `figure` kinds, `CardIcon`) are typed in
  `src/data/modules/layouts/types.ts` and drawn in `src/components/module/layouts/`.
- **Don't edit lesson content** (`src/data/modules/math/*.ts`, `science/*.ts`,
  `layouts/math.ts`, `layouts/science.ts`) except the gallery demos; the other chat owns
  those. Add new files where you can; when you must touch a shared file (types, index, meta,
  theme), keep the edit small so merges are easy.
- **Work on your own branch** (start from `claude/ios-education-wireframe-313z7z`), commit
  after each picture kind with a clear message, push after each group, and don't open pull
  requests.
- **Test only what you touched** (see "Testing" below). Don't run `pnpm check`: it runs every
  test for every grade. The nightly CI run does the full suite.

## Testing

The full suite takes minutes and repeats checks your change can't affect. Run only what
covers it.

**While drawing a kind**, after each change:

1. `pnpm -s typecheck` and `pnpm -s exec eslint <the files you changed>`.
2. The module and sampling tests for the pages that show the kind: its gallery demos and every
   page whose `representation` (or layout figure) uses it. To find those pages, run
   `grep -rln "kind: '<kind>'" src/data/modules`. Then run, for example,
   `MODULE_IDS=g.,m.9.quadratic-functions pnpm test src/data/modules`. The cheap suites in
   that folder (the tracker, layouts, standards) run in full; `MODULE_IDS` only narrows the
   heavy ones.
3. If you changed a shared file (`types.ts`, `reps/index.tsx`, `meta.ts`, `theme.ts`), also run
   `pnpm test src/components src/data/__tests__`.

**Screenshots:** build only the pages in scope, then shoot the demos in light and dark:

```
PRERENDER_PREFIX=g.,m.9.quadratic pnpm build:web
NODE_PATH=$(npm root -g) pnpm shots -- <ids> --widths 390
```

**Before a push**, once per group (a tracker group or a subject), not after every kind:

- `pnpm -s format:check`;
- `node scripts/ci-test.mjs`. It runs every cheap suite, and the two heavy suites for the
  pages the push changed: a picture component or check runs the pages of the kinds it names.

No full runs and no deep runs: the lesson chat runs everything when it merges, and CI's
nightly run does every test.

## What exists (don't rebuild)

Picture kinds in `Representation`: angles, areaModel, array, balance, bars, baseHeight, baseTen,
beaker, boxPlot, circle, clock, coinRow, coins, compareRows, coordinatePlane, cubeTrains,
dotPlot, dotSet, doubleNumberLine, equalGroups, factorPairs, factorTree, fieldOfView, force,
fractionArea, fractionBars, fractionFit, fractionLine, gradCylinder, grid100, hops,
hundredChart, integerLine, linePlot, lineUp, net, numberBond, numberLine, pairs, partition,
partnerList, patternBlocks, percentBar, pictureGraph, pieChart, placeValueChart, plot,
polygon, prism, protractor, punnettSquare, pushes, quadrilateral, ratioTable, rectangle,
rectilinear, rightTriangle, rockLayers, rounding, ruler, scale, seriesCircuit, shareWholes,
skipCount, solid, table, tally, tape, tenFrame, thermometers, timeline, unitCubes, unitTiles,
venn, waterfall, wave.

Explore figures: parts, position, clock, dots, magnets, flashes, lightPath, particles, earth,
push, vibration, sky, static, timesTable, cell, bodySystems, waterCycle, front, plates,
continents, rockCycle. Card figures: lines, letter, polygon, circle, heart, solid, cut, bar,
dots, icon, fractionBars, ray, net, inequality, cell, rock. Card icons: sun, moon, feather,
leaf, crayon, sock, brick, watermelon, backpack, bowling ball, paper clip, door, eraser, bed,
bus.

## What to build, in this order

### 1. Pictures the K–6 pages need now

1. **Card icons** for new sorts (add to `CardIcon`, drawn in their materials): thermometer,
   rain gauge, wind vane, wind sock; bird, frog, grasshopper, turtle, fish, cat, dog, dolphin,
   person (eggs or born alive); green tree frog on a leaf, striped warbler on bark, white hare
   in snow, thick fur, blubber, camel hump, cactus stem (camouflage and survival); rabbit,
   deer, hawk, snake, heron, raccoon, bear (plant-eater / meat-eater / both); meter stick,
   classroom door, school bus, pencil, paper clip, workbook (about a meter); big water bottle,
   milk carton, juice box, eyedropper (about a liter); pan handle, oven mitt, kettle (heat).
2. **Food web** explore figure (`foodWeb`): sun, grass, rabbit, grasshopper, mouse, frog,
   snake, hawk, with arrows meaning "is eaten by"; a scene can light one chain or grey out a
   removed animal and show what grows or shrinks.
3. **Moon phases through a whole cycle** on the `sky` figure (waxing and waning, lit on the
   correct side for the Northern Hemisphere) and the moon rising in the east.
4. **Noon shadow by month**: a meter stick and its noon shadow for Dec–Oct, the sun higher
   in June (an observe-page figure or a `shadowStick` picture driven by a length value).
5. **Grass slope**: two trays of soil on a slope under a watering can, one with grass, with
   the soil washed off collected below (driven by two values).
6. **Two flashlights**: the same flashlight at one and at k times the distance, the lit
   circle k times as wide and k × k times the area, with one square of the grid shaded.
7. **Dark and light cups** in the sun with thermometers (reuse `thermometers`; add the cups).
8. **Fraction bars past one whole**: `fractionBars` rows that draw as many whole bars as
   the fraction needs (7/4 is one whole bar and 3/4 of the next), and **mixed-number jumps**
   on `fractionLine` (18 1/4 − 2 3/4).
9. **Set model for fractions**: `partition` with `shape: 'set'` (objects in a row, some
   marked: 3 of 7 umbrellas).
10. **Bills and coins together**: `coins` with bills ($1, $5, $10) beside the coins and one
    total.
11. **Center and spread with 3 to 10 values**: `dotPlot` already takes `count` and draws the
    first n values (done in the lesson branch); make the median mark clear for odd and even n.
12. **Inequalities on a number line**: `integerLine` with an open or closed circle at the
    bound, an arrow to the solutions, and a test point marked true or false.
13. **Scaled unit cubes**: `unitCubes` past 10 per edge draws a labelled box to scale
    (40 × 60 × 80 cm).
14. **Ratio graph on numbered axes**: the `ratioTable` graph's axes scale to the rows shown,
    with 3–4 numbered ticks per axis.
15. **3-digit number line**: `numberLine` from a start (500) with ticks every 1, 10 or 100
    and a point to place (540).
16. **Plot a point**: `coordinatePlane` first quadrant where the student taps or drags one
    point, with the path "across then up" drawn from the origin.
17. **Line plot of lengths**: `linePlot` with 6 marks starting at any whole number, in inches
    or centimeters, in halves, quarters or eighths.
18. **Measured leaves**: a plant in the sun and one in the shade with their green leaves
    counted (for the Grade 2 page that now counts leaves, not height).
19. **Protractor with neither arm at 0**: `protractor` reading two arm marks (45 and 135).
20. **Fraction answers**: pictures that show a quotient or a share as a mixed number
    (33 1/3 groups, 2 3/8 L), drawn from the value, not rounded decimals.

21. **Factor pairs past 100**: `factorPairs` for numbers to 200 (factors of 105, 126), and a
    `hundredChart` that shows the hundred around a number up to 1,000 (is 652 a multiple of 5?).
    The lesson chat will raise those pages' ranges once these draw.
22. **Line plot in quarter inches from any start**: `linePlot` whose marks step by 1/4 or 1/2
    from a start that is itself a fraction (straws from 3 3/4 to 5 1/2 inches).
23. **Hundredths grids past 3 ones**: `grid100` with `wholes` up to 99 (45.06 is 45 whole
    grids and 6 hundredths): draw a few whole grids and a count, so the Grade 4 decimals page can
    take ones to 99.
24. **Groups of many**: `equalGroups` with up to 90 groups (4 × 50 × 9 as 50 groups of 36), so
    the Grade 3 grouping page can take a factor that is a multiple of 10.
25. **Decimal number line from any start**: `fractionLine` with `decimal` that starts at a whole
    number (a line from 1 to 3 in tenths, with 2.6 marked).
26. **Fraction area past one whole**: `fractionArea` whose factors can be more than 1
    (5/7 × 10/3 as a 2-by-4 block of unit squares, 5/2 × 1 1/3), so Grade 5 multiplication can
    drop "each fraction at most 1".
27. **Place-value chart to billions**: `placeValueChart` with billions (10⁹ = 1,000,000,000),
    for Grade 5 powers of ten to exponent 9.
28. **Decimal jumps past 30**: the divide-by-a-decimal picture for quotients to 999
    (21 ÷ 0.2 = 105 jumps of 0.2): group the jumps by tens when there are many.
29. **Percent grids past 100% and in tenths**: `grid100` whose percent can pass 100 (whole
    grids first: 125% is one full grid and 25 squares) and shade part of a square (37.5%), so
    the Grade 6 fraction-decimal-percent page can take 5/4 = 125%.

### 2. Grade 7 math (planned skills in `src/data/taxonomy.ts`)

- proportional-relationships: a graph of y = kx through the origin with the point (1, k)
  marked; a table beside it.
- percent-applications: a percent bar for tax, tip, markup and discount (the original, the
  change and the new amount as three bars), and percent change as before/after bars.
- rational-operations: two-color counters (positive and negative) with zero pairs; a number
  line with signed jumps; a sign table for multiplying.
- two-step-equations: a balance (hanger) with x-blocks and unit weights; a tape for
  px + q = r; an inequality on a number line.
- scale-drawings: a figure on a grid and its scaled copy, with the scale factor labelled.
- circles: a circle with radius and diameter, the circumference unrolled along a line (π
  diameters), and the area as wedges rearranged into a near-parallelogram.
- angle-relationships: two crossing lines (vertical angles), a straight line split in two
  (supplementary), a right angle split in two (complementary), adjacent angles; all with
  draggable rays.
- prisms: a prism with its cross-section and its net (triangular and rectangular), and a
  plane slicing a prism or pyramid.
- sampling: a population of dots with a random sample circled; two samples' dot plots.
- probability: a spinner with sectors, a pair of dice as a 6 × 6 grid of outcomes, a tree
  diagram for two stages, a bag of colored marbles.

### 3. Grade 8 math

- roots-irrationals: a square whose area is the number and side is the root; a number line
  placing √2, √10, π between whole numbers.
- exponent-rules: repeated factors grouped (2³ × 2⁴ = 2⁷) as rows of factors.
- scientific-notation: a powers-of-ten scale (a log ruler) placing a number and its
  mantissa × 10ⁿ.
- slope: a line on a grid with the rise/run triangle drawn and labelled; two points
  draggable.
- multi-step-equations: a balance with x-blocks on both sides.
- systems-linear: two lines on one grid with the intersection marked (none when parallel).
- functions-intro: an input-output machine and a mapping diagram (arrows from inputs to
  outputs), a graph with the vertical-line test.
- linear-functions: y = mx + b with the intercept and slope triangle.
- transformations: a figure and its image on a grid for translation, reflection (the mirror
  line), rotation (the center and angle) and dilation (the center and factor).
- pythagorean: squares on the three sides of a right triangle; the distance between two
  grid points with its right triangle.
- volume-curved: a cylinder, cone and sphere with water levels (a cone fills 1/3 of the
  cylinder), dimensions labelled.
- scatter-plots: a scatter plot with a draggable line of fit, clusters and an outlier.

### 4. Grade 7 and 8 science

- atoms-molecules: ball-and-stick molecules (water, carbon dioxide, oxygen), atoms of an
  element as same-colored balls.
- phase-changes: a heating curve (temperature against time with flat melting and boiling
  steps) and particle boxes for solid, liquid and gas.
- chemical-reactions: particles before and after (atoms rearranged, none lost), balance
  counters on each side of the arrow.
- photosynthesis-respiration: a leaf and a cell with inputs and outputs (light, water, carbon
  dioxide in; sugar, oxygen out) as arrows.
- ecosystem-energy: an energy pyramid (10% to each level), the carbon cycle.
- punnett-squares: exists; add a pedigree chart.
- natural-selection: a population of beetles over generations as a stacked bar per
  generation, the colors shifting.
- motion: distance-time and speed-time graphs with the slope read as speed or acceleration.
- newtons-laws: a cart pulled by a force with mass blocks; action-reaction pairs on two
  skaters.
- kinetic-potential: a roller coaster or pendulum with energy bars (kinetic and potential)
  that trade as it moves.
- em-spectrum: the spectrum band from radio to gamma with wavelength drawn above it.
- electricity-basics: series and parallel circuits (parallel is new) with bulbs, a switch
  and a meter.
- magnetic-fields: field lines around a bar magnet, and an electromagnet (coil on a nail)
  whose strength follows the turns and the current.
- periodic-table: the table as a grid with a group, a period or an element highlighted.
- gravity-orbits: an orbit diagram (sun, planet, moon) with the pull drawn as an arrow;
  planets to scale by size.

## How to report

When each group is done, push, and write a short note in `docs/RENDERINGS_BRIEF.md` under a
"Done" heading: the kind or figure name, the file, the gallery id and its spec (the fields a
module passes), so the lesson chat can plug it in.

## Done

### Group 1: pictures the K–6 pages need now

All options below are optional fields, so existing modules are unchanged. Gallery demos are
in `src/data/modules/gallery.ts` and `galleryOptions.ts`.

| Item                            | Kind or figure (file)                                                                                    | Gallery id                                                                     | Spec                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Card icons                   | `CardIcon` (`layouts/cardIcons.tsx`)                                                                     | `g.icons-weather`, `-young`, `-survival`, `-diet`, `-meter`, `-liter`, `-heat` | `{ kind: 'icon', icon }` with `'thermometer'`, `'rain gauge'`, `'wind vane'`, `'wind sock'`, `'bird'`, `'frog'`, `'grasshopper'`, `'turtle'`, `'fish'`, `'cat'`, `'dog'`, `'dolphin'`, `'person'`, `'tree frog'`, `'warbler'`, `'white hare'`, `'thick fur'`, `'blubber'`, `'camel hump'`, `'cactus stem'`, `'rabbit'`, `'deer'`, `'hawk'`, `'snake'`, `'heron'`, `'raccoon'`, `'bear'`, `'meter stick'`, `'pencil'`, `'workbook'`, `'water bottle'`, `'milk carton'`, `'juice box'`, `'eyedropper'`, `'pan handle'`, `'oven mitt'`, `'kettle'`; the classroom door, school bus and paper clip are the redrawn `'door'`, `'bus'`, `'paper clip'` |
| 2. Food web                     | explore figure `foodWeb` (`layouts/foodWeb.tsx`)                                                         | `g.food-web`                                                                   | every scene sets `web: { chain?, removed?, more?, fewer? }` (`web: {}` for the whole web); members `'sun' \| 'grass' \| 'rabbit' \| 'grasshopper' \| 'mouse' \| 'frog' \| 'snake' \| 'hawk'`; arrows mean "is eaten by"                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 3. Moon phases, moonrise        | `sky` explore figure (`layouts/figures.tsx`)                                                             | `g.sky`                                                                        | `sky: { body: 'night', phase?: MoonPhase, rising?: boolean, cycle?: boolean }`; phases `'new'` … `'waning crescent'`, waxing lit on the right; `cycle` adds the strip of eight with the current one ringed                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 4. Noon shadow by month         | observe figure `shadowStick` (`layouts/ShadowStick.tsx`)                                                 | `g.noon-shadow`                                                                | on an `ObserveLayout`: `figure: { kind: 'shadowStick', stick: 100 }`; draws the tapped month's shadow to scale, the sun higher when the shadow is shorter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 5. Grass slope                  | `grassSlope` (`reps/GrassSlope.tsx`)                                                                     | `g.grass-slope`                                                                | `{ kind: 'grassSlope', bare, grass, difference?, max }`; the soil in each jar is the value and drags                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 6. Two flashlights              | `flashlights` (`reps/Flashlights.tsx`)                                                                   | `g.flashlights`                                                                | `{ kind: 'flashlights', near, times, far? }` (matches n, k, f on `s.5.sun-star-brightness~two-flashlights`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 7. Dark and light cups          | `thermometers` option (`reps/Thermometers.tsx`)                                                          | `g.dark-light-cups`                                                            | add `cups: ['dark', 'light']`, one per item                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 8. Fraction bars past one whole | `fractionBars` (`reps/FractionBars.tsx`)                                                                 | `g.fraction-bars-past-one`                                                     | automatic for a fraction past 1 (up to 6 wholes); `wholes?` fixes the width                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 8. Mixed-number jumps           | `fractionLine` option                                                                                    | `g.mixed-number-jumps`                                                         | `from`: the start value counted in parts (18 1/4 = 73 fourths); `numerator` is the answer in parts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 9. Set model                    | `partition` option                                                                                       | `g.fraction-of-a-set`                                                          | `shape: 'set'`, `object?: 'umbrella' \| 'counter'`; tap to shade                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 10. Bills and coins             | `coins` (`reps/Coins.tsx`, `MoneyArt.tsx`)                                                               | `g.bills-and-coins`                                                            | put bills (`cents` 100, 500, 1000) in `coins` beside the coins; one total and the sum under it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 11. 3 to 10 values              | `dotPlot`, `boxPlot` options                                                                             | `g.dot-plot-median`, `g.box-plot-data`                                         | `count: '<var>'` (and `data` on `boxPlot`): the first n values, the median ringed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 12. Inequalities                | `integerLine` option (`reps/Inequality.tsx`)                                                             | `g.inequality-line`                                                            | `inequality: { sign, test?, letter? }`; `sign` is `'<' \| '≤' \| '>' \| '≥'` or a variable (1–4); the bound is `value`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 13. Scaled unit cubes           | `unitCubes` option (`reps/ScaledBox.tsx`)                                                                | `g.scaled-box`                                                                 | `scale: true`: past `max` a side, a labelled box to scale                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 14. Ratio graph                 | `ratioTable` with `graph: true`                                                                          | `g.ratio-graph`                                                                | automatic: numbered axes to the biggest row; under the table on a phone                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 15. 3-digit number line         | `numberLine` option                                                                                      | `g.number-line-500`                                                            | `from`, `every` (1, 10 or 100), `span?`; `jumps: 'ticks'` for one jump per tick                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 16. Plot a point                | `coordinatePlane` option                                                                                 | `g.plot-point`                                                                 | `plot: true` (first quadrant): tap or drag one point; the path across, then up                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 17. Measured leaves             | `leafCount` (`reps/LeafCount.tsx`)                                                                       | `g.leaf-count`                                                                 | `{ kind: 'leafCount', items: [sun, shade], difference?, places? }`, unit `'leaves'`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 18. Line plot of lengths        | `linePlot` option                                                                                        | `g.line-plot-lengths`                                                          | `start` plus `marks: 2 \| 4 \| 8 \| '<var>'`; each point needs `at`; unit from `unit`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 19. Protractor arms             | `protractor` option                                                                                      | `g.protractor-arms`                                                            | `arms: { first, second }`; `angle` is the difference                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 20. Fraction answers            | `skipCount` (automatic), `shareWholes` (automatic), `tape` and `beaker` (`mixed: true`); `reps/exact.ts` | `g.jumps-in-a-quotient`, `g.share-as-mixed`, `g.liters-as-mixed`               | values that are fractions with a bottom up to 16 print as mixed numbers (33 1/3, 2 3/8 L); others keep their decimal                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

Notes for the lesson pages:

- Mixed-number jumps count values in parts; a page needs a "parts" value or a relation from
  wholes and tops to parts.
- Unit words "liters" and "meters" keep mixed-number labels exact; "L" and "m" convert units
  and print decimals.
- Captions list named values with " · " (one line each); "a. b." would read as one equation.

### Plugged in by the lesson chat

Group 1 pictures now on lesson pages:

- Card icons on 61 sort cards (weather tools, eggs or born alive, plant- and meat-eaters, desert
  survival, heat, about a meter, about a liter). The camouflage icons wait for a camouflage page.
- `foodWeb` on the new `s.5.food-webs~web` ("What happens if one is removed?").
- Moon phases: moonrise and moonset on `s.1.sky-patterns`, and the new
  `s.1.sky-patterns~moon-cycle`.
- `shadowStick` on `s.5.shadows-day-night~noon-shadow`.
- `grassSlope`: `s.4.weathering~grass-slope` is now a calculator page (it was an observe page).
- `flashlights`, dark and light `cups`, and `leafCount` on their pages.
- Mixed-number jumps on `m.4.add-fractions-like~mixed-add` and `~mixed-subtract`.
- The set model on the new `m.3.fractions-number-line~set`.
- The inequality line on `m.6.one-step-equations~inequality-solutions`, which now has a sign
  value.
- The scaled box on `m.5.volume-rectangular` (sides now go to 100).
- Plot a point on `m.5.coordinate-plane-q1`.
- Protractor arms on the new `m.4.angles~arms`.
- Mixed-number labels on `m.5.multiply-fractions~of-a-whole`.
- Bills and coins, fraction bars past one whole, and the ratio graph apply without changes.

Not used yet:

- The 3-digit `numberLine` needs a distance value, which Grade 2 would have to write as a
  multiplication.
- The `linePlot` `start` option would need values that aren't named after fixed marks.
- `boxPlot` `data`: no page builds a box plot from a list of values yet.

Items 21–29 are still open.

### Group 2: Grade 7 math

Gallery demos are in `galleryG7a.ts`, `galleryG7b.ts` and `galleryG7c.ts`. `NumOrVar` is a
fixed number or a variable id.

| Skill                      | Kind or option (file)                          | Gallery id                                                                                         | Spec                                                                                                                                                                     |
| -------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| proportional-relationships | `plot` option (`reps/Plot.tsx`)                | `g.proportional-graph`                                                                             | `unitRate: '<k>'` (also in `params`), `table?: number[]` (x values, up to 8): y = kx through (0, 0), (1, k) ringed and dragged, x, y, y ÷ x beside it                    |
| percent-applications       | `percentBar` option (`reps/PercentChange.tsx`) | `g.sales-tax`, `g.discount`, `g.percent-change`                                                    | `change: { total, direction?: 'up' \| 'down', bars?: 2 \| 3 }`; `part` is the change, `whole` the original                                                               |
| rational-operations        | `zeroPairs` (`reps/ZeroPairs.tsx`)             | `g.zero-pairs-add`, `g.zero-pairs-subtract`                                                        | `{ kind: 'zeroPairs', first, second, result, op?: '+' \| '−' }` (whole numbers, up to 20 a sign; set `sliders: true`)                                                    |
| rational-operations        | `integerLine` option (`reps/SignedJump.tsx`)   | `g.signed-jump-add`, `g.signed-jump-subtract`                                                      | `jump: { by, result, op? }`, `value` is the start                                                                                                                        |
| rational-operations        | `signTable` (`reps/SignTable.tsx`)             | `g.sign-table`                                                                                     | `{ kind: 'signTable', first, second, result, op?: '×' \| '÷' }`                                                                                                          |
| two-step-equations         | `hanger` (`reps/Hanger.tsx`)                   | `g.hanger`                                                                                         | `{ kind: 'hanger', unknown, left: { x?, units? }, right: { x?, units? }, steps? }`                                                                                       |
| two-step-equations         | `tape` option (`reps/TapeEquation.tsx`)        | `g.tape-equation`, `g.tape-equation-grouped`                                                       | `equation: { times, unknown, plus, total, grouped? }` (px + q = r; `grouped`: p(x + q) = r)                                                                              |
| two-step-equations         | `integerLine` option (`reps/Inequality.tsx`)   | `g.two-step-inequality`                                                                            | `inequality: { sign, test?, letter?, twoStep: { times, plus, total } }`, `value` = (total − plus) ÷ times; a negative `times` flips the sign                             |
| scale-drawings             | `scaleCopy` (`reps/ScaleCopy.tsx`)             | `g.scale-copy`, `g.scale-copy-area`                                                                | `{ kind: 'scaleCopy', factor, width, height, copyWidth?, copyHeight?, area?: [original, copy], shape?: 'L' \| 'rectangle' \| 'triangle' \| 'trapezoid' }`                |
| circles                    | `circle` option (`reps/CircleParts.tsx`)       | `g.circle-parts`                                                                                   | `views: ('radius' \| 'unroll' \| 'wedges')[]`, `wedges?: number \| var` (even, 4–24)                                                                                     |
| angle-relationships        | `angles` option (`reps/Angles.tsx`)            | `g.complementary-angles`, `g.supplementary-angles`, `g.vertical-angles`                            | `parts: [a, b], whole: 90 \| 180`; vertical angles: `whole: 180, cross: { first?, second? }`                                                                             |
| prisms                     | `net` option (`reps/Net.tsx`)                  | `g.triangular-prism-net`                                                                           | `solid: 'triangularPrism'`, `width`, `height`, `slant`, `length`, `total?`, `triangle?: 'right' \| 'isosceles'` (tie the three sides together)                           |
| prisms                     | `crossSection` (`reps/CrossSection.tsx`)       | `g.prism-cross-section`, `g.triangular-prism-volume`, `g.pyramid-slice`, `g.pyramid-upright-slice` | `{ kind: 'crossSection', solid: 'box' \| 'triangularPrism' \| 'pyramid', length, width?, height, triangle?, cut?: 'base' \| 'side' \| 'diagonal', at?, area?, volume? }` |
| sampling                   | `sample` (`reps/Sample.tsx`)                   | `g.random-sample`                                                                                  | `{ kind: 'sample', population, size, found, trait?, estimate?, labels?: [has, hasNot] }` (up to 400 dots)                                                                |
| sampling                   | `dotPlot` option (`reps/DotPlotPair.tsx`)      | `g.two-samples`                                                                                    | `second: { data, mean?, median? }`, `labels?`, `difference?`                                                                                                             |
| probability                | `spinner` (`reps/Spinner.tsx`)                 | `g.spinner`                                                                                        | `{ kind: 'spinner', parts, colors?, names?, pick?, chance?, total? }` (up to 24 sectors)                                                                                 |
| probability                | `diceGrid` (`reps/DiceGrid.tsx`)               | `g.two-dice`                                                                                       | `{ kind: 'diceGrid', target, event?: 'sum' \| 'difference' \| 'product', compare?, count?, chance? }`                                                                    |
| probability                | `treeDiagram` (`reps/TreeDiagram.tsx`)         | `g.tree-diagram`                                                                                   | `{ kind: 'treeDiagram', first, second, total?, names?: [[…], […]], stages?: [a, b], path?: [i, j], chance? }`                                                            |
| probability                | `marbles` (`reps/Marbles.tsx`)                 | `g.bag-of-marbles`                                                                                 | `{ kind: 'marbles', parts, colors?, names?, pick?, chance?, total? }` (up to 40)                                                                                         |

### Group 3: Grade 8 math

Gallery demos are in `galleryG8a.ts`, `galleryG8b.ts` and `galleryG8c.ts`.

| Skill                | Kind or option (file)                                        | Gallery id                                                        | Spec                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| roots-irrationals    | `rootSquare` (`reps/RootSquare.tsx`)                         | `g.root-square`                                                   | `{ kind: 'rootSquare', area, side, marks?: { at, label }[] }` (area up to 144)                                                                                           |
| exponent-rules       | `factorRows` (`reps/FactorRows.tsx`)                         | `g.exponent-product`, `g.exponent-quotient`, `g.exponent-power`   | `{ kind: 'factorRows', base, first, second, result, rule: 'product' \| 'quotient' \| 'power' }`                                                                          |
| scientific-notation  | `powerScale` (`reps/PowerScale.tsx`)                         | `g.scientific-notation`                                           | `{ kind: 'powerScale', number, mantissa, exponent }`                                                                                                                     |
| slope                | `coordinatePlane` option (`reps/SlopeLegs.tsx`)              | `g.slope-triangle`                                                | `x`, `y`, `second: { x, y }`, `slope`, plus `rise?`, `run?`                                                                                                              |
| multi-step-equations | `equationBalance` (`reps/EquationBalance.tsx`)               | `g.equation-balance`, `g.equation-balloons`                       | `{ kind: 'equationBalance', x, left: [coef, const], right: [coef, const], cancel? }`; negatives are balloons                                                             |
| systems-linear       | `lineSystem` (`reps/Lines.tsx`, specs in `typesGraphs.ts`)   | `g.line-system`, `g.line-system-context`                          | `{ kind: 'lineSystem', lines: [{ slope, intercept, label? }, …], solution?: { x, y }, extent?, quadrants?, axes? }`                                                      |
| functions-intro      | `functionMachine` (`reps/FunctionMachine.tsx`)               | `g.function-machine`                                              | `{ kind: 'functionMachine', input, output, rule: { op, by }[] (1–3), table?: number[] }`                                                                                 |
| functions-intro      | `mapping` (`reps/Mapping.tsx`)                               | `g.mapping`                                                       | `{ kind: 'mapping', pairs: { x, y }[] (1–8), view?: 'both' \| 'arrows' \| 'graph' }`; vertical-line test on the graph                                                    |
| linear-functions     | `linearFunction` (`reps/Lines.tsx`)                          | `g.linear-function`, `g.linear-function-context`                  | `{ kind: 'linearFunction', slope, intercept, point?: { x, y }, extent?, quadrants?, axes? }`                                                                             |
| transformations      | `transformation` (`reps/Transformation.tsx`, `transform.ts`) | `g.translation`, `g.reflection`, `g.rotation`, `g.dilation`       | `{ kind: 'transformation', figure: [x, y][] (2–6), image?: { x, y }, extent?, quadrants? }` plus `move: 'translate' \| 'reflect' \| 'rotate' \| 'dilate'` and its fields |
| pythagorean          | `rightTriangle` option                                       | `g.squares-on-sides`                                              | `{ kind: 'rightTriangle', a, b, c, extent, grid?: true }`                                                                                                                |
| pythagorean          | `coordinatePlane` option (`reps/DistanceLegs.tsx`)           | `g.grid-distance`                                                 | `second: { x, y }, segment: true, distance?, legs: true`                                                                                                                 |
| volume-curved        | `curvedSolid` (`reps/CurvedSolid.tsx`)                       | `g.cylinder-volume`, `g.cone-in-cylinder`, `g.sphere-in-cylinder` | `{ kind: 'curvedSolid', shape: 'cylinder' \| 'cone' \| 'sphere', radius, height?, volume?, compare?, extent }`                                                           |
| scatter-plots        | `scatter` (`reps/Scatter.tsx`)                               | `g.scatter-fit`                                                   | `{ kind: 'scatter', x, y (axes), points: [x, y][], slope, intercept, clusters?, outlier?, at?: { x, y } }`                                                               |

Notes for the lesson pages:

- A rotation page gives the angle `allowed` values (−270 to 270 by 90); rotation and dilation
  captions give an (x, y) rule only about (0, 0).
- On a phone the linear-function slope triangle can be drawn at a multiple of the slope (rise 4,
  run 2 for "up 2 for every 1 across").

### Group 4: Grade 7 and 8 science

Gallery demos are in `galleryS4a.ts` (chemistry), `galleryS4b.ts` (life science),
`galleryS4c.ts` (motion, forces, energy) and `galleryS4d.ts` (waves, circuits, magnets, orbits).
Explore figures are set on the layout (`figure: { kind }`) and lit per scene by the scene field
named in the table.

| Skill                      | Kind or figure (file)                                         | Gallery id                                                              | Spec                                                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| atoms-molecules            | `molecules` (`reps/Molecules.tsx`, specs in `typesChem.ts`)   | `g.water-molecules`, `g.carbon-dioxide-molecules`, `g.oxygen-molecules` | `{ kind: 'molecules', formula, count, atoms?: { H: '<var>', … }, name? }` (formulas plain: `'H2O'`)                                                                       |
| atoms-molecules            | explore figure `molecules`; card figure `molecule`            | `g.molecule-models`, `g.molecule-cards`                                 | scene `molecules: { items: { formula, count? }[], state?, after?, afterState? }`; card `{ kind: 'molecule', formula }`                                                    |
| phase-changes              | `heatingCurve` (`reps/HeatingCurve.tsx`)                      | `g.heating-curve`                                                       | `{ kind: 'heatingCurve', start, melt, boil, end?, spans: [4 or 5], at?, temp?, names?, units?, formula? }`                                                                |
| phase-changes              | explore figure `phases`                                       | `g.phases`                                                              | scene `phase: { state?, change?: 'melting' \| 'freezing' \| 'boiling' \| 'evaporation' \| 'condensation' \| 'sublimation' \| 'deposition', formula? }`                    |
| chemical-reactions         | `reaction` (`reps/Reaction.tsx`)                              | `g.balance-water`, `g.burning-methane`                                  | `{ kind: 'reaction', reactants: { formula, count }[], products: { formula, count }[], atoms?: { O: [before, after] } }`                                                   |
| periodic-table             | `periodicTable` (`reps/PeriodicTable.tsx`); explore figure    | `g.periodic-table`, `g.periodic-table-figure`                           | `{ kind: 'periodicTable', element?, group?, period?, families? }`; scene `elements: { element?, group?, period?, ring?, families? }`                                      |
| photosynthesis-respiration | explore figure `leafCell` (`layouts/figuresLife.tsx`)         | `g.leaf-cell`                                                           | scene `leafCell: { process: 'photosynthesis' \| 'respiration' \| 'both', lit?: 'light' \| 'water' \| 'carbon dioxide' \| 'sugar' \| 'oxygen' \| 'energy' }`               |
| ecosystem-energy           | `energyPyramid` (`reps/EnergyPyramid.tsx`)                    | `g.energy-pyramid`                                                      | `{ kind: 'energyPyramid', levels: [2–5 vars, producers first], percent?, names? }`                                                                                        |
| ecosystem-energy           | explore figure `carbonCycle`                                  | `g.carbon-cycle`                                                        | scene `carbon: { process?: 'photosynthesis' \| 'respiration' \| 'eating' \| 'death' \| 'decomposition' \| 'burning' \| 'dissolving' \| 'burial' }`                        |
| punnett-squares            | explore figure `pedigree`                                     | `g.pedigree`                                                            | `figure: { kind: 'pedigree', people: { id, sex, generation, trait?, carrier?, parents?, partner?, genotype? }[] }`; scene `family: { lit?, carriers?, genotypes?, ask? }` |
| natural-selection          | `generations` (`reps/Generations.tsx`)                        | `g.beetle-generations`                                                  | `{ kind: 'generations', counts: string[][] (2–8 generations × 2–3 varieties), colors?, names?, follow?, label? }`                                                         |
| motion                     | `motionGraph` (`reps/MotionGraph.tsx`, `typesMechanics.ts`)   | `g.distance-time`, `g.walk-graph`, `g.speed-time`                       | `{ kind: 'motionGraph', time, extent?, strip? }` plus `graph: 'distance', speed, distance, start?, then?` or `graph: 'speed', acceleration, speed, start?, distance?`     |
| newtons-laws               | `force` option (`reps/ForceCart.tsx`)                         | `g.cart-force`                                                          | existing `force` fields plus `object: 'cart'`, `block?` (one block's mass)                                                                                                |
| newtons-laws               | `skaters` (`reps/Skaters.tsx`)                                | `g.skaters`                                                             | `{ kind: 'skaters', force, masses: [m1, m2], accelerations?: [a1, a2], names? }`                                                                                          |
| kinetic-potential          | `energyTrack` (`reps/EnergyTrack.tsx`)                        | `g.roller-coaster`, `g.pendulum`                                        | `{ kind: 'energyTrack', track: 'coaster' \| 'pendulum', height, potential, kinetic, total?, top?, mass?, speed?, g? }` (add `atLeast(top, height)`)                       |
| em-spectrum                | `spectrum` (`reps/Spectrum.tsx`, specs in `typesPhysics8.ts`) | `g.em-spectrum`, `g.visible-light`                                      | `{ kind: 'spectrum', wavelength, meters?, frequency?, speed? }`                                                                                                           |
| electricity-basics         | `circuit` (`reps/Circuit.tsx`)                                | `g.series-circuit`, `g.parallel-circuit`, `g.bulbs-in-series`           | `{ kind: 'circuit', wiring: 'series' \| 'parallel', voltage, bulbs: [vars], count?, current, branches?, switch? }`                                                        |
| magnetic-fields            | `electromagnet` (`reps/Electromagnet.tsx`)                    | `g.electromagnet`                                                       | `{ kind: 'electromagnet', turns, current, strength?, clips? }`                                                                                                            |
| magnetic-fields            | `magnets` explore figure (field lines added)                  | `g.magnetic-field`                                                      | scene `field: { single?, lines?, compasses? }`; N red, S blue, lines from N to S                                                                                          |
| gravity-orbits             | `orbit` (`reps/Orbit.tsx`)                                    | `g.orbit`, `g.orbit-mars`                                               | `{ kind: 'orbit', distance, pull, mass?, planet?: 'mercury' … 'neptune', moon? }`                                                                                         |
| gravity-orbits             | explore figure `planets` (to scale by size)                   | `g.planets-to-scale`                                                    | scene `planets: { lit?: PlanetName[] }`                                                                                                                                   |

Notes for the lesson pages:

- Molecules with a real shape drawn: H2, O2, N2, Cl2, F2, H2O, CO2, CO, NO, HCl, CH4, NH3, O3, SO2,
  NO2, H2O2, NaCl, MgO, C2H6, CH3OH; other formulas get a compact cluster with the right atoms.
- A heating curve's time value should have no switchable unit (the harness can't convert a
  piecewise check).
- A pedigree's people must be listed in a sensible order (partners side by side, children in
  their parents' order); the figure spaces them evenly.
- Energy bars assume joules; a fixed mass in the cart and skater captions assumes kilograms.

### Round 2 (2026-09-27): range raises on K–6 pictures

Every `requested` entry in `src/data/modules/pictureRequests.ts` is now `drawn`: R15 and
R21–R29. The tracker is the record: each entry lists its gallery demos, the text a page will
contain once it uses the option (`uses`) and, in `notes`, the fields to pass and the ranges the
page must raise. All new fields are optional; pages that don't pass them draw as before.

### Round 3 (2026-09-27): the K–6 diagram review

Every `D..` entry in `src/data/modules/pictureRequests.ts` (D01–D101, 90 entries) is now
`drawn`: card icons for the sorts and sequences, the new card figures (`moon`, `stars`, `map`,
`dotPlot`, and `highlight` on `cell`), options on existing picture kinds, and the new explore,
observe and sort-header figures. The tracker is the record: each entry lists its gallery demos,
its `uses` text and, in `notes`, the exact fields and icon names each card takes. Round-3 card
icons are named per drawing group in `src/data/modules/layouts/icons/` and drawn in
`src/components/module/layouts/icons/`.

### Round 4 (2026-09-28): every picture not yet redrawn

Every `Q..` entry in `src/data/modules/pictureRequests.ts` (Q01–Q52) is now `drawn`: the 20
high-urgency pictures (real coins, a globe, a lamp and apple, a painted water cycle, a body
with its organs, Pangaea, fronts and plates …), the 24 medium and the 8 low. The tracker is
the record: each entry says what changed, "no page change" or the exact fields a page must
now pass (`uses`), and the gallery demos. Before-and-after contact sheets, one per urgency
band: `docs/renderings/round4-high.png`, `round4-medium.png`, `round4-low.png` (each entry's
first page at 390 px, light).

### Grades 9–12, group A (2026-09-29): new math picture kinds

H01–H15 in `src/data/modules/pictureRequestsHs.ts` are `drawn`: `functionGraph`,
`normalCurve`, `histogram`, `triangleSolver`, `markedFigure`, `unitCircle`, `algebraTiles`,
`vectorDiagram`, `complexPlane`, `polarGrid`, `conicGraph` (with the `doubleCone` explore
figure), `circleTheorems`, `pascalTriangle`, `matrixGrid` and `termsChart`. H30 (the
`studyDesign` explore figure) is drawn too. Each entry's notes give the fields a page passes,
with an example; the demos are in `galleryHsa.ts`–`galleryHsd.ts`. The harness reads trig in
degrees on a page whose angle variables have the unit °, in radians otherwise.

### Grades 9–12, group B (2026-09-29): extensions of existing math pictures

H16–H29 are `drawn`, each as optional fields, so existing pages are unchanged: shaded
half-planes and elimination's sum line (`lineSystem`), compound and absolute-value
inequalities (`integerLine`), residuals, r and least squares (`scatter`), outlier fences, paired
box plots and a standard-deviation band (`boxPlot`, `dotPlot`), two-way tables with relative
frequencies and chi-square (`table`), chance trees (`treeDiagram`) and Venns (`venn`), composed
moves and symmetry (`transformation`), dilation from a center and the side splitter
(`scaleCopy`), midpoint, partition and side slopes (`coordinatePlane`), sectors and radians
(`circle`), nets, Cavalieri and round cross sections (`curvedSolid`, `crossSection`), roots
from a factor tree (`factorTree`) and a log ruler (`powerScale`). Each entry's notes give the
fields and an example; the demos are in `galleryHse.ts` and `galleryHsf.ts`.

### Grades 9–12, biology (2026-09-30): H31–H42

H31–H42 are `drawn`: monomers into polymers (`macromolecules` explore figure), membrane
transport with tonicity card icons (`membrane`), the chloroplast and mitochondrion
(`organelleEnergy` explore figure), mitosis and meiosis stages (`cellDivision` card), Grade 9
inheritance on `punnettSquare` (`inheritance`), DNA to protein with mutations (`dnaStrand`),
gel electrophoresis and PCR (`gel`), Hardy–Weinberg beads (`alleleFrequencies`), the
`cladogram` explore figure with domain and kingdom icons, biomass and numbers pyramids
(`energyPyramid` `measure`) with succession icons and the `nitrogenCycle` figure, the
`feedbackLoop` figure, and the immune response (`immuneResponse`, `immuneStages`, pathogen
icons). Each entry's notes give the fields and an example; the demos are in `galleryHsg.ts` and
`galleryHsh.ts`.

### Grades 9–12, chemistry (2026-09-30): H43–H57

H43–H57 are `drawn`: unit chains, a ruler read and an accuracy target (`unitChain`), Bohr
models (`atomModel`), orbital boxes and hydrogen's energy levels (`orbitalDiagram`), periodic
trends on `periodicTable` (`trend`), Lewis structures (`lewisStructure`), VSEPR shapes and
hydrogen bonds (`vsepr`), limiting reactants on `reaction` (`limiting`) with reaction-type card
icons, the mole map (`moleMap`), the gas laws under a piston (`gasPiston`), molarity, dilution
and solubility on `beaker` (`solution`), energy profiles and calorimetry (`energyProfile`),
equilibrium and its shifts (`equilibriumChart`), pH and titration curves (`phScale`), the
`electrochemicalCell` explore figure and radioactive decay (`decayChart`). Each entry's notes
give the fields and an example; the demos are in `galleryHsi.ts` and `galleryHsj.ts`.

### Grades 9–12, earth and space (2026-09-30): H71–H80

H71–H80 are `drawn`: mineral card icons and the `mohsScale` explore figure, Earth's interior
with shadow zones, a seismogram and an epicenter (`earthLayers`), the `landforms` explore
figure, dated layers on `rockLayers` (`dating`), the seafloor and the tides (`oceanProfile`)
with the `oceanCurrents` figure, the atmosphere's layers and a pressure map
(`atmosphereLayers`), the `greenhouse` explore figure, solar panel and oil rig icons beside the
round 3 energy icons, the HR diagram with star life-cycle icons (`hrDiagram`), and the expanding
universe with galaxy and solar-system formation icons (`expandingUniverse`, a calculator kind
rather than an explore figure, because both of its parts are driven by values). Each entry's
notes give the fields and an example; the demos are in `galleryHsl.ts`.

### Grades 9–12, physics (2026-09-30): H58–H70

H58–H70 are `drawn`: signed velocity–time areas, a position tangent and a strobe diagram on
`motionGraph` (`kinematics`), projectiles to scale (`projectile`), free-body diagrams on a
floor, a ramp or a rope (`freeBody`), circular motion, gravitation and Kepler's ellipse
(`circularMotion`), collisions with momentum arrows (`collision`), levers, pulleys and ramps
(`simpleMachine`) and a spring launcher on `energyTrack` (`spring`), heat engines and
refrigerators (`heatEngine`), standing waves and the Doppler effect on `wave` (`standing`,
`doppler`), lenses, mirrors, refraction, the double slit and telescopes (`rayDiagram`), point
charges and field lines (`charges`), mixed circuits on `circuit` (`mixed`), induction, the
motor force and transformers (`induction`), and line spectra, redshift and photon energy on
`spectrum` (`lines`, `photon`). Each entry's notes give the fields and an example; the demos are
in `galleryHsk.ts`. Step text must put a divisor before a sine (`{a}/{b} × sin({t})`), as the
H66 and H69 notes say.

With physics, every Grades 9–12 entry (H01–H88) is drawn.
