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
  after each picture kind with a clear message, push, and don't open pull requests.
- Before each push: `pnpm check` (typecheck, lint, format, all tests). For a picture, also
  `pnpm build:web` and `NODE_PATH=$(npm root -g) pnpm shots -- <gallery ids> --widths 390`,
  and look at the shots in light and dark.

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
7. **Dark and light cups** in the sun with thermometers (reuse `thermometers`; add the cups). 8. **Fraction bars past one whole**: `fractionBars` rows that draw as many whole bars as
   the fraction needs (7/4 is one whole bar and 3/4 of the next), and **mixed-number jumps**
   on `fractionLine` (18 1/4 − 2 3/4).
8. **Set model for fractions**: `partition` with `shape: 'set'` (objects in a row, some
   marked: 3 of 7 umbrellas).
9. **Bills and coins together**: `coins` with bills ($1, $5, $10) beside the coins and one
   total.
10. **Center and spread with 3 to 10 values**: `dotPlot` and `boxPlot` that draw only the first
    n values (n is a value), the median marked for odd and even n.
11. **Inequalities on a number line**: `integerLine` with an open or closed circle at the
    bound, an arrow to the solutions, and a test point marked true or false.
12. **Scaled unit cubes**: `unitCubes` past 10 per edge draws a labelled box to scale
    (40 × 60 × 80 cm).
13. **Ratio graph on numbered axes**: the `ratioTable` graph's axes scale to the rows shown,
    with 3–4 numbered ticks per axis.
14. **3-digit number line**: `numberLine` from a start (500) with ticks every 1, 10 or 100
    and a point to place (540).
15. **Plot a point**: `coordinatePlane` first quadrant where the student taps or drags one
    point, with the path "across then up" drawn from the origin.
16. **Line plot of lengths**: `linePlot` with 6 marks starting at any whole number, in inches
    or centimeters, in halves, quarters or eighths.
17. **Measured leaves**: a plant in the sun and one in the shade with their green leaves
    counted (for the Grade 2 page that now counts leaves, not height).
18. **Protractor with neither arm at 0**: `protractor` reading two arm marks (45 and 135).
19. **Fraction answers**: pictures that show a quotient or a share as a mixed number
    (33 1/3 groups, 2 3/8 L), drawn from the value, not rounded decimals.

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

| Skill                      | Kind or figure (file)                                       | Gallery id                                                              | Spec                                                                                                                                                                      |
| -------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| atoms-molecules            | `molecules` (`reps/Molecules.tsx`, specs in `typesChem.ts`) | `g.water-molecules`, `g.carbon-dioxide-molecules`, `g.oxygen-molecules` | `{ kind: 'molecules', formula, count, atoms?: { H: '<var>', … }, name? }` (formulas plain: `'H2O'`)                                                                       |
| atoms-molecules            | explore figure `molecules`; card figure `molecule`          | `g.molecule-models`, `g.molecule-cards`                                 | scene `molecules: { items: { formula, count? }[], state?, after?, afterState? }`; card `{ kind: 'molecule', formula }`                                                    |
| phase-changes              | `heatingCurve` (`reps/HeatingCurve.tsx`)                    | `g.heating-curve`                                                       | `{ kind: 'heatingCurve', start, melt, boil, end?, spans: [4 or 5], at?, temp?, names?, units?, formula? }`                                                                |
| phase-changes              | explore figure `phases`                                     | `g.phases`                                                              | scene `phase: { state?, change?: 'melting' \| 'freezing' \| 'boiling' \| 'evaporation' \| 'condensation' \| 'sublimation' \| 'deposition', formula? }`                    |
| chemical-reactions         | `reaction` (`reps/Reaction.tsx`)                            | `g.balance-water`, `g.burning-methane`                                  | `{ kind: 'reaction', reactants: { formula, count }[], products: { formula, count }[], atoms?: { O: [before, after] } }`                                                   |
| periodic-table             | `periodicTable` (`reps/PeriodicTable.tsx`); explore figure  | `g.periodic-table`, `g.periodic-table-figure`                           | `{ kind: 'periodicTable', element?, group?, period?, families? }`; scene `elements: { element?, group?, period?, ring?, families? }`                                      |
| photosynthesis-respiration | explore figure `leafCell` (`layouts/figuresLife.tsx`)       | `g.leaf-cell`                                                           | scene `leafCell: { process: 'photosynthesis' \| 'respiration' \| 'both', lit?: 'light' \| 'water' \| 'carbon dioxide' \| 'sugar' \| 'oxygen' \| 'energy' }`               |
| ecosystem-energy           | `energyPyramid` (`reps/EnergyPyramid.tsx`)                  | `g.energy-pyramid`                                                      | `{ kind: 'energyPyramid', levels: [2–5 vars, producers first], percent?, names? }`                                                                                        |
| ecosystem-energy           | explore figure `carbonCycle`                                | `g.carbon-cycle`                                                        | scene `carbon: { process?: 'photosynthesis' \| 'respiration' \| 'eating' \| 'death' \| 'decomposition' \| 'burning' \| 'dissolving' \| 'burial' }`                        |
| punnett-squares            | explore figure `pedigree`                                   | `g.pedigree`                                                            | `figure: { kind: 'pedigree', people: { id, sex, generation, trait?, carrier?, parents?, partner?, genotype? }[] }`; scene `family: { lit?, carriers?, genotypes?, ask? }` |
| natural-selection          | `generations` (`reps/Generations.tsx`)                      | `g.beetle-generations`                                                  | `{ kind: 'generations', counts: string[][] (2–8 generations × 2–3 varieties), colors?, names?, follow?, label? }`                                                         |
| motion                     | `motionGraph` (`reps/MotionGraph.tsx`, `typesMechanics.ts`) | `g.distance-time`, `g.walk-graph`, `g.speed-time`                       | `{ kind: 'motionGraph', time, extent?, strip? }` plus `graph: 'distance', speed, distance, start?, then?` or `graph: 'speed', acceleration, speed, start?, distance?`     |
| newtons-laws               | `force` option (`reps/ForceCart.tsx`)                       | `g.cart-force`                                                          | existing `force` fields plus `object: 'cart'`, `block?` (one block's mass)                                                                                                |
| newtons-laws               | `skaters` (`reps/Skaters.tsx`)                              | `g.skaters`                                                             | `{ kind: 'skaters', force, masses: [m1, m2], accelerations?: [a1, a2], names? }`                                                                                          |
| kinetic-potential          | `energyTrack` (`reps/EnergyTrack.tsx`)                      | `g.roller-coaster`, `g.pendulum`                                        | `{ kind: 'energyTrack', track: 'coaster' \| 'pendulum', height, potential, kinetic, total?, top?, mass?, speed?, g? }` (add `atLeast(top, height)`)                       |
| em-spectrum                | `spectrum` (`reps/…`, specs in `typesPhysics8.ts`)          | `g.em-spectrum`, `g.visible-light`                                      | `{ kind: 'spectrum', wavelength, meters?, frequency?, speed? }`                                                                                                           |
| electricity-basics         | `circuit`                                                   | `g.series-circuit`, `g.parallel-circuit`, `g.bulbs-in-series`           | `{ kind: 'circuit', wiring: 'series' \| 'parallel', voltage, bulbs: [vars], count?, current, branches?, switch? }`                                                        |
| magnetic-fields            | `electromagnet`                                             | `g.electromagnet`                                                       | `{ kind: 'electromagnet', turns, current, strength?, clips? }`                                                                                                            |
| magnetic-fields            | `magnets` explore figure (field lines added)                | `g.magnetic-field`                                                      | scene `field: { single?, lines?, compasses? }`; N red, S blue, lines from N to S                                                                                          |
| gravity-orbits             | `orbit`                                                     | `g.orbit`, `g.orbit-mars`                                               | `{ kind: 'orbit', distance, pull, mass?, planet?: 'mercury' … 'neptune', moon? }`                                                                                         |
| gravity-orbits             | explore figure `planets` (to scale by size)                 | `g.planets-to-scale`                                                    | scene `planets: { lit?: PlanetName[] }`                                                                                                                                   |

Notes for the lesson pages:

- Molecules with a real shape drawn: H2, O2, N2, Cl2, F2, H2O, CO2, CO, NO, HCl, CH4, NH3, O3, SO2,
  NO2, H2O2, NaCl, MgO, C2H6, CH3OH; other formulas get a compact cluster with the right atoms.
- A heating curve's time value should have no switchable unit (the harness can't convert a
  piecewise check).
- A pedigree's people must be listed in a sensible order (partners side by side, children in
  their parents' order); the figure spaces them evenly.
- Energy bars assume joules; a fixed mass in the cart and skater captions assumes kilograms.
