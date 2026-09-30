# Grades 9–12 pictures, round 3

Paste everything below the line into the pictures chat.

---

You are working in the EducationalCalculator repository on your pictures branch
(`claude/edu-calc-assets-questions-379toc`). First merge `claude/ios-education-wireframe-313z7z`
into it.

## What happened since round 2

Round 2 (`H89`–`H105`) is drawn and merged into the lesson branch. Since then the lesson chat:

- ran a lesson review of all eight Grade 9–12 sections and fixed what it found;
- added 21 skills the textbooks teach and the taxonomy lacked (TAXONOMY_ISSUES.md, "Grades 9–12
  topics without a skill"), and built their pages: torque and rotation, oscillations, electric
  potential; phase changes and colligative properties, entropy and free energy; reproduction and
  development, plants, biomes, the nervous system; Earth's history, exoplanets; density modeling;
  and more in Grades 9 and 12 math.

Those pages were built with the nearest existing picture or a `table`. Each builder listed the
picture it wanted under "Shared needs" in `docs/build/<m|s>.<grade>.md`. They are collected as
**P18–P22** in `docs/HS_NEEDS.md` and as tracker entries **`H106`–`H110`** in
`src/data/modules/pictureRequestsHs.ts`, all `requested`.

## Read first

- `CLAUDE.md`, `docs/RENDERINGS_BRIEF.md` (hard rules, art direction, "Testing") and the quality
  floor in `docs/RENDERINGS_ROUND_4.md`. They all still apply.
- `docs/HS_NEEDS.md`, the Pictures table, rows P18–P22.
- For each part, the build note it came from (`docs/build/<plan>.md`, "Shared needs" and "Added
  skills"): it says what the page shows, which values drive the picture and which page uses a
  stand-in today. The page itself is in `src/data/modules/<math|science>/<grade>.ts`: read its
  values and relations before you choose the fields.

## Order

0. **Repair the demos the merge breaks.** The lesson review renamed and hid values on the pages
   some of your round-2 demos are built from, so after merging five demos fail. Rebuild each on
   the page as it is now (read the page in the grade file; keep the demo's own option), then run
   `MODULE_IDS=g. npx jest --maxWorkers=1 src/data/modules` until it is clean:
   - `g.m9-sequences-far`: the far-term values no longer match the page (its example and
     `startWith` fail).
   - `g.m9-radicals-monomials-factors`: the page's check now compares both sides; the demo's
     check line prints numbers the steps don't show.
   - `g.m10-probability-rules-counting-fraction`: `pascalTriangle` rows past 12 and C(n, r) with
     r > n.
   - `g.m11-complex-numbers-sign-box`: the page's sign value `o` became `s` (±1).
   - `g.s11-kinematics-1d-free-fall-number`: the page's `a` is gone (g is hidden or a number now).
     Then continue in this order, most pages first:

1. **H107 (P19): Physics.** New kinds `torque`, `rotor`, `oscillator`, `capacitor`; a `pendulum`
   driven by length; the lever's `seesaw` option; `charges` equipotentials and a charge
   accelerated between plates; `induction` with a moving charge. About 13 pages.
2. **H106 (P18): Math options.** `functionGraph` that follows the unit menu (it reads shown
   numbers today, so pages pin their units), two curves on one graph, the power family
   y = a·x^(p/q), a log-sum curve; `lineSystem` with a parabola; `polygon` with its apothem; a
   one-event `venn`; a `table` with its graph and the best point marked; a region for
   population density; symmetry about a center on `transformation`.
3. **H110 (P22): Earth and space.** `geologicClock`, `coralSection`, `transit`,
   `habitableZone` (or `circularMotion` options: a star mass for Kepler's third law, e to 0.97),
   `earthLayers` as an explore figure, a parallax picture.
4. **H109 (P21): Biology.** `gel` as an explore figure, `cellDivision` as a calculator picture, a
   neuron and reflex-arc figure, a flower with its parts and embryo-stage icons, biome icons or a
   biome map, observe pages with two rows or negative values, and `dnaMath` start-lost and
   stop-lost effects.
5. **H108 (P20): Chemistry.** `reaction` formulas from values (CₓHᵧ) and ionic compounds from
   their charges, a phase diagram, a concentration–time curve, a galvanic cell as a calculator
   picture, colored gases in `gasPiston`.

## Rules for this round

- **A new option never changes a page that exists.** It is off unless a page sets it. K–12 pages
  keep drawing as they do.
- **Kinds and figures only.** Never edit the grade files (`math/*.ts`, `science/*.ts`,
  `layouts/*.ts`): the lesson chat places each picture on its pages and removes the stand-ins.
  Show each part in a gallery demo.
- **When a part is drawn:**
  - add its demo;
  - list the demo under the entry's `gallery` and write the fields you chose in its `notes`;
  - set the entry to `drawn` when all its parts are;
  - add the kind's checks in `harness/pictures.ts`;
  - document the option in `docs/PICTURES.md` or `docs/LAYOUTS.md`.
- **Units:** a picture that draws a length, time or force reads the value in the formula's
  units, not the shown unit (the P18 `functionGraph` part is the model: convert once, draw in
  base units), so pages can keep their unit menus.
- **Test** as "Testing" in `docs/RENDERINGS_BRIEF.md` says: your demos by id, then
  `npx jest --maxWorkers=1 src/components src/data/__tests__ src/engine/__tests__/units.test.ts`,
  then `JEST_WORKERS=1 node scripts/ci-test.mjs` once before each push. Memory is tight: one jest
  process at a time, one worker.
- Keep `docs/HS_NEEDS.md` current: mark a P item `done` when its entry is `drawn`.
