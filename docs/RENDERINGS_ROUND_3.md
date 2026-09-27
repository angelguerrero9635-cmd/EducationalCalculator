# Renderings round 3: the K–6 diagram review

Paste everything below the line into the pictures chat.

---

You are working in the EducationalCalculator repository on your pictures branch
(`claude/edu-calc-assets-questions-379toc`). First merge `claude/ios-education-wireframe-313z7z`
into it: the lesson chat has changed pages since round 2. Then read:

- `CLAUDE.md`;
- `docs/RENDERINGS_BRIEF.md`: the hard rules and art direction still apply (original drawings
  in react-native-svg, online images as reference only, theme tokens, no new dependencies
  without asking);
- `docs/RENDERINGS_ROUND_2.md`: how the tracker works;
- `src/data/modules/pictureRequests.ts`: the tracker.

If round 2 (R15, R21–R29) isn't finished, finish it first.

## What this round is

Reviewers went through every K–6 page the earlier rounds didn't touch, about 440 pages. They
asked two questions:

- **Sort and sequence pages:** would a picture on a card help? Yes for real objects,
  organisms, tools, landforms and events a student must recognize. No for abstract words and
  number sentences.
- **Graphs, charts and other pictures:** is the current picture the best one for how the test
  question is asked? If not, what should it be?

Their answers are the tracker entries `D01`–`D101` with `status: 'requested'`. Some numbers in
that range are missing on purpose: those changes used pictures you have already drawn, so the
lesson chat made them itself.

**How to read an entry:**

- `pages`: the page it is for.
- `kind`: the picture kind, card figure or observe/explore figure to draw or extend.
- `notes`:
  - card entries: the exact cards, as `Card label → what to draw`;
  - picture entries: the picture wanted and why, citing the released question style.

Open each page in the web build before you draw, and read its module or layout file.

## The work, grouped

**1. Card pictures on sorts and sequences** (D01–D64). Draw each object in its materials
(`layouts/cardIcons.tsx`, `paint.tsx`), recognizable at card size, and add it to `CardIcon`.

- **Reuse first.** Where a note says "existing icon …", use it. Where one drawing fits several
  pages (sandbags, storm shutters, a nail, a rubber band, a caterpillar), draw it once and name
  it once.
- **New card figure kinds:**
  - `moon` with a `MoonPhase` (D15, D16): reuse the `sky` figure's moon drawing.
  - `stars`: a constellation as points and lines (D56).
  - `map`: a small world or North America outline with a region shaded or a pin at a point
    (D45, D60, D62). Never draw the answer: no plate boundaries on D62.
  - `dotPlot`: a tiny dot plot of fixed values (D64).
  - A `highlight` option on the existing `cell` card figure (D58).
- **Events and steps** ("Bike braking to a stop", "The bee flies to another flower"): draw a
  small scene. For sequences, keep the stages as consistent pictures of one scene changing.

**2. Options on existing picture kinds** (each is an optional field, so pages that don't use
it are unchanged):

| id  | Kind              | Option                                                         | Page                                    |
| --- | ----------------- | -------------------------------------------------------------- | --------------------------------------- |
| D65 | `tenFrame`        | `takeAway`: taken counters crossed out, not open               | `m.K.add-sub-10~take-away`              |
| D66 | `tenFrame`        | `crossOut`: counters crossed out inside the full ten           | `m.1.add-sub-20~take-from-ten`          |
| D68 | `baseTen`         | `takeAway`: blocks crossed out after any trade                 | `m.2.add-sub-1000~subtract`             |
| D70 | `pictureGraph`    | icons that match the categories (apple, banana, grapes)        | `m.1.data-3-categories`                 |
| D71 | `pictureGraph`    | `icon` accepts card icons (frog, fish, grasshopper)            | `s.2.habitats~pond-count`               |
| D81 | `rounding`        | `second`: a second number's rounding line under the first      | `m.3.rounding~estimate`                 |
| D82 | `rounding`        | the same                                                       | `m.3.rounding~estimate-difference`      |
| D85 | `polygon`         | `side`: every side labeled with its length, perimeter under    | `m.3.perimeter~equal-sides`             |
| D86 | `pictureGraph`    | `half`: half pictures, and one icon with a key                 | `m.3.scaled-graphs~picture-graph`       |
| D92 | `tape`            | a third ratio bar (6 : 5 : 2)                                  | `m.6.ratios~three-parts`                |
| D93 | `grid100`         | `product`: tenths columns × tenths rows, overlap = the product | `m.5.decimal-operations~times-decimal`  |
| D94 | `placeValueChart` | `total`: the sum in a third row, points lined up               | `m.6.multi-digit-decimals~add-subtract` |
| D96 | `scale`           | `before`: two readings, before and after                       | `s.5.conservation-mass~fizz`            |
| D97 | `scale`           | `hanging`: a spring scale with a hook, in newtons              | `s.5.gravity-down~spring-scale`         |
| D99 | `shadowStick`     | the shadow's side (morning points west, afternoon east)        | `s.5.shadows-day-night`                 |

**3. New figures:**

- **Explore figures:**
  - `plant` (D74): a plant with its tapped part lit.
  - `animal` (D75): a bear and a turtle, the tapped part lit.
  - `animal` option on `dots` (D89): a herd or huddle drawn as animals.
  - A body outline with its organs (D90), or a Grade 4 mode of `bodySystems`.
- **Observe-page figures, like `shadowStick`,** each showing the tapped column's value:
  - `thermometer` (D78);
  - `plantHeight` (D79);
  - `ramp` (D91);
  - `flashlight` (D100);
  - `cup` (D101).
- **A figure above a sort's bins** (D76, D77): the parent and the young animal, so cards like
  "Gray fur, not orange" can be judged. This needs a new optional `figure` on `SortLayout` and
  its drawing. The lesson chat fills in the data.

## Rules

Every picture you draw:

- Read the page it is for and draw for that page's values, ranges and question.
- Every value-driven part stays exact.
- Add a gallery demo with the page's own example, and a harness check in
  `src/data/modules/harness/pictures.ts` for any value-driven picture.
- Run `pnpm check`. Take screenshots at 390 px in light and dark.

**When you finish an entry:**

- Set it to `status: 'drawn'` and list its gallery ids.
- Set `uses` to the text a page will contain once it uses the drawing, such as
  `'"icon":"sandbag wall"'` or `'"takeAway"'`.
- Add to `notes` the exact field names and values the lesson chat must pass.

**Don't touch:**

- Lesson text, relations, cards or pages in `src/data/modules/math`, `science` or `layouts`.
  The lesson chat places your drawings and sets `placed`.
- The pages or status of other entries.

**If you disagree with a request** (it would mislead, or an existing picture already does it),
leave it `requested` and say why in its `notes`.

## How to report

Commit after each group of related pictures and push to your branch. When every `D..` entry is
`drawn`, add a short dated "Round 3" note under "Done" in `docs/RENDERINGS_BRIEF.md` that points
to the tracker.
