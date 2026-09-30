Layouts other than the calculator, when a lesson's idea is not a quantity relationship, and
every explore figure, observe figure and card figure the layout pages can use. The lesson
reviewer's check L proposes from this catalog. Data lives in `src/data/modules/layouts/`.

# Module layouts

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
and `rockCycle` (each in its own file there; the cell in `layouts/figuresR4h.tsx`). `foodWeb` (`layouts/foodWeb.tsx`): sun, grass,
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
Grades 10–12 (`layouts/coneFigure.tsx`): `doubleCone` cuts two cones tip to tip with a plane;
a scene's `cone` (`circle`, `ellipse`, `parabola`, `hyperbola`) tilts the plane and draws the curve.
Grade 10 chemistry (`layouts/galvanicFigure.tsx`): `electrochemicalCell`, a galvanic cell of two
metals in their ions' solutions, a wire through a voltmeter or bulb and a KNO₃ salt bridge; a
scene's `galvanic: { metals, meter?, lit? }` picks the metals (the anode, E° and both
half-reactions are worked out from the reduction potentials) and rings the electrons, anode,
cathode, bridge or meter.

Earth and space (HS group L, `layouts/hslFigures.tsx`): `mohsScale` (`layouts/mohsFigure.tsx`), the
ten Mohs minerals as a ladder with the scratch tools dashed at 2.5, 3.5, 5.5 and 6.5; `mohs: { lit?,
between?, absolute? }` lights a rank, shades an unknown's range or bars absolute hardness. Mineral
icons (`layouts/icons/hl.tsx`): `quartz`, `feldspar`, `mica`, `calcite`, `halite`, `pyrite`,
`hematite`; energy icons `solar panel` and `oil rig` (beside round 3's wind turbine, dam, coal,
oil pump, gas flame and nuclear power plant). A star's life, on night sky: `stellar nebula`, `protostar`,
`Sun-like star`, `massive star`, `red giant`, `red supergiant`, `planetary nebula`, `white dwarf`,
`supernova`, `neutron star`, `black hole`. Galaxies: `spiral galaxy`, `barred spiral galaxy`, `elliptical
galaxy`, `irregular galaxy`; the forming solar system: `solar nebula`, `spinning disk`, `protosun`,
`planetesimals`, `young planets`. `landforms` (`layouts/landformsFigure.tsx`): `landform: { kind }` draws a shield,
composite or cinder-cone volcano, folds, a normal, reverse or strike-slip fault, a V- or U-shaped
valley, a meander, an aquifer or a dune, its parts labeled. `oceanCurrents`
(`layouts/currentsFigure.tsx`): `currents: { view }`, the `gyres` or the deep `conveyor` on a world map. `greenhouse`
(`layouts/greenhouseFigure.tsx`): `greenhouse: { view: 'energy', co2? }` (sunlight in, infrared out
and back, a thermometer) or `{ view: 'zones', lit? }` (climate zones by latitude).

Grade 9 biology (HS group G): `macromolecules` (`layouts/macroFigure.tsx`): monomers on their own
cards joining into a polymer, the joining groups and new bonds lit and one water molecule drawn per
bond; `macro: { kind, count?, split? }` builds starch, a polypeptide (folded), a DNA strand or a fat
(glycerol and three fatty acids), 2 to 4 units; `split` runs it as hydrolysis. Card icons (drawn in
`layouts/icons/hg.tsx`): `red blood cell in hypotonic water` (swollen round), `… isotonic water`
(a dimpled disc), `… hypertonic water` (shriveled, crenated), and `plant cell in hypotonic water`
(turgid), `… isotonic water` (flaccid), `… hypertonic water` (plasmolyzed), each in water with
its solute dots and the water's net flow as arrows. `organelleEnergy`
(`layouts/organelleFigure.tsx`): a chloroplast (grana of thylakoids, stroma) and a mitochondrion
(cristae, matrix) in the cytoplasm, glucose and O₂ flowing over the top, CO₂ and H₂O back under,
light in and ATP out; `energy: { process?, lit? }` lights the whole `cycle`, `photosynthesis`,
`respiration` or a stage (`lightReactions`, `calvinCycle`, `glycolysis`, `krebsCycle`,
`electronTransport`) with its part and its equation, and rings one substance. Card figure
`cellDivision` (`layouts/divisionCard.tsx`, 96 × 76, for sequence stages and sort cards):
`{ kind: 'cellDivision', stage, diploid? }` draws interphase, prophase … cytokinesis, or
prophase I … telophase II, the chromosomes counted from 2n (2, 4 or 6), maternal red and paternal
blue, crossed-over tips from prophase I, four different cells of n after telophase II.

Grades 11–12 statistics, in `layouts/studyDesignFigure.tsx`: `studyDesign` (a population of 48
people, the sample a `method` takes from it, then a `survey`, an `observational` study sorted by
what people already do, or an `experiment` assigned at random to a treatment and a control group;
`study: { design, method?, sample?, groups?, lit? }`). The sampling methods are also card icons
(`simple random sample`, `stratified sample`, `cluster sample`, `systematic sample`, `convenience
sample`), each 36 dots with its 9 picked, drawn in `layouts/icons/hb.tsx`.

Grade 9 biology card icons (group HH, `layouts/icons/hh.tsx`): homologous limbs with each bone
group in its own color (`human arm bones`, `bat wing bones`, `whale flipper bones`, `cat leg
bones`) and an `insect wing` with none; the domains and kingdoms (`domain Bacteria`, `domain
Archaea`, `domain Eukarya`, `kingdom Protista`, `kingdom Fungi`, `kingdom Plantae`, `kingdom
Animalia`). Explore figure `cladogram` (`layouts/cladogramFigure.tsx`): `{ tree, traits }`, a
tree of taxon names as nested lists and each trait's taxa (one clade) marked as a numbered bar
on the branch into it; a scene's `clade: { lit?, ring? }` lights a trait's clade or rings taxa.
Primary succession stage icons (`bare rock`, `lichens on rock`, `mosses and thin soil`, `grasses
and flowers`, `shrubs`, `young trees`, `mature forest`). Explore figures `nitrogenCycle`
(`layouts/nitrogenCycleFigure.tsx`; `nitrogen: { process? }` lights fixation, lightning,
nitrification, assimilation, eating, ammonification or denitrification) and `feedbackLoop`
(`layouts/feedbackLoopFigure.tsx`; `loop: { steps, sign, lit?, back? }`, the scene's own words
in 3 to 6 boxes and the arrow back marked − or +) and `immuneStages`
(`layouts/immuneStagesFigure.tsx`; `immune: { stage? }` lights antigen, helperT, bCells, antibodies,
killerT or memory). Pathogen icons: `virus`, `bacterium`, `fungus`, `parasite`.

Chemistry reaction types (H49) are card icons in `layouts/icons/hi.tsx`: `synthesis reaction`,
`decomposition reaction`, `single replacement reaction`, `double replacement reaction` and
`combustion reaction`, lit atom balls with the reactants above an arrow and the products below.

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
arrow), `scatter` (dots that rise, fall, scatter or curve), `cell` (a small cell) and `rock` (a texture); a `polygon` can mark its `base`, a
`dashed` height and the base `extend`ed. Geometry cards (`layouts/cardFiguresHs2b.tsx`):
`markedTriangles` (two triangles from their sides at one scale, with ticks, arcs, right-angle
marks and side lengths that mean what they say). Every figure and card figure has a page at
`/gallery`.
