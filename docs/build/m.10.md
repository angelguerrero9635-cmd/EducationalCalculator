# Build notes: math Grade 10 (m.10)

Built from `.review/plans/m.10/plan.md` in its Priority order. Calculators are in
`src/data/modules/math/10.ts`, layouts in `src/data/modules/layouts/math10.ts`. No new phrases
were needed in `harness/phrasesM10.ts`: every step line (sin(38°), tan⁻¹(…), C(8, 3), n!, |a − b|)
already reads.

## Built

100 of the plan's 105 pages (83 calculators, 17 layouts).

| Skill                        | Pages | Calculators | Layouts                        |
| ---------------------------- | ----- | ----------- | ------------------------------ |
| m.10.constructions           | 8     | 4           | 3 sequences, 1 sort            |
| m.10.proofs                  | 4     | 1           | 2 sequences (main one), 1 sort |
| m.10.parallel-lines          | 8     | 7           | 1 sequence                     |
| m.10.rigid-motions           | 6     | 5           | 1 sort                         |
| m.10.congruence              | 4     | 1           | 2 sorts (main one), 1 sequence |
| m.10.triangle-relationships  | 6     | 5           | 1 sort                         |
| m.10.quadrilaterals          | 5     | 4           | 1 sort                         |
| m.10.similarity              | 7     | 6           | 1 sort                         |
| m.10.special-right-triangles | 3     | 3           |                                |
| m.10.right-triangle-trig     | 5     | 5           |                                |
| m.10.law-sines-cosines       | 5     | 5           |                                |
| m.10.coordinate-geometry     | 6     | 6           |                                |
| m.10.circle-theorems         | 6     | 6           |                                |
| m.10.circle-equations        | 3     | 3           |                                |
| m.10.arc-sector              | 2     | 2           |                                |
| m.10.volume-derivations      | 9     | 7           | 2 sorts                        |
| m.10.probability-rules       | 8     | 8           |                                |
| m.10.conditional-probability | 5     | 5           |                                |

## Waiting

- `m.10.proofs~isosceles` — need 1 (figure-only values): the drawing's BD = s sin(A/2) and
  AD = s cos(A/2) would be Formulas rows and steps with a sine before the trig lesson.
- `m.10.quadrilaterals~parallelogram` — need 1: the base and height only place the drawing.
- `m.10.quadrilaterals` (main, polygon angle sums) — need 4 (a regular n-gon cut into n − 2
  triangles from one corner, one exterior angle marked). An interim is possible now with the K–2
  `polygon` picture (`sides: 'n'`, a regular n-gon with no triangles); not built, since the plan
  gives no interim. The skill has no main page until then.
- `m.10.circle-theorems~cyclic-quadrilateral` and `~chord-angle` — need 7 (`circleTheorems`
  `cyclic` and `arcAngle`).

## Changed from the plan

- **Need 2 is met:** the signed boxes flip a written + or −, so the pages the plan held for it are
  built as planned: circle-equations main and `~general-form`, `constructions~midpoint`,
  `parallel-lines~algebra`, `congruence~corresponding-parts`.
- **Need 3 is met for the arc and volume pages:** `pi: true` on the arc, area and volume values
  shows 5π and takes “3π” typed. Their lengths are kept to mm, cm and m and volumes to mm³, cm³
  and m³ (in L the step check printed a cm³ π-multiple the page never shows).
- `congruence~corresponding-parts` built, not waiting: `triangleSolver` already takes fixed
  numbers for parts (`parts: { c: 'L', a: 16, b: 12 }`), so need 1 isn't needed there.
- `constructions~angle-addition` and `proofs~exterior-angle` use the `angles` picture (parts and
  whole; the triangle with its exterior angle), not `markedFigure`: rays at typed angles would
  need coordinates from sines (need 1).
- `triangle-relationships~centroid` keeps the plan's values (AD, AG, GD, no sides) and draws its
  own honest figure from points: B(0, 0), D(GD, 0), C(AG, 0), A(GD, AD), G(GD, GD), which puts
  D at BC's midpoint and G at the centroid for every AD. The demo's median-from-sides formula
  is dropped (not in the course).
- `quadrilaterals~rhombus` draws from points with the half diagonals as values (p/2, q/2), since
  the family preset needs an angle (a cosine). `~trapezoid` uses the preset at a fixed 70° base
  angle (the old standalone angle only placed the drawing); its example lists the bases as 15
  and 9 so AB is the longer base.
- `rigid-motions~reflect-line` is y = −x only: the `transformation` mirror is a fixed line, so a
  sign switch can't move it; y = x is in the assumptions. `~symmetry` works lines of symmetry,
  the order and “carried onto itself (1 or 0)” from w, h and the turn.
- `parallel-lines~algebra` highlights corresponding angles 1 and 5 (the preset's value is angle
  1), not alternate interior 3 and 6.
- `parallel-lines~parallel-line` and `~perpendicular-line`: the given line's intercept is
  `standalone` (it only draws that line). The point isn't drawn (need 10).
- `similarity` main drops the demo's angles (they need the law of cosines); `~scale-area` is on
  the grid (whole-square sides 1–12, perimeter and area worked out), as `scaleCopy` requires.
- `similarity~splitter-base` example: AC = 16 added (12, 16, 20 closes), AE = 4.
- `special-right-triangles` main example is 8, 15, 17 as planned; the sign box reads 5 for =,
  1 for <, 3 for > (as on `m.6.integers~compare`).
- `circle-equations` main shows r² in its own box (`… = {q}`, 25) with the center `standalone`;
  the point on the circle is its own page (`~point`).
- `conditional-probability` main: P(Bus | Late) is worked from the row directly and the grand
  total N is shown, keeping 10 values; `~venn` works P(B | A) and P(A | B) with the overlap shaded.
- `probability-rules~permutations` stops at n = 14 (P(20, 20) passes 12 digits);
  `~combinations` and `~counting-probability` stop at 12 (Pascal's triangle rows). The
  counting-probability picture shows C(a + b, r) only (need 16 for the fraction of two).
- `probability-rules~sample-space` names outcomes 1–4 (1 heads, 2 tails), since a stage can
  have 2 to 4 outcomes.
- Coordinate pages use a fixed extent of 20 (need 11 would fit the grid to the values).
- Sequence stages have no card figures (need 5); sort cards are text (needs 6 and 12), and the
  naming sort has no `polygon` figures, which would give the answer away.
- Circle-theorem angles keep the drawn ranges (central 1°–359°, the semicircle's angles
  1°–89°); smaller ones draw wrong.

## Shared needs found while building

- **Unit menu with π values:** a `pi: true` volume shown in liters makes the check line use a
  cm³ π-multiple that isn't shown (`check uses numbers not shown elsewhere`). Worked around with
  `units` lists; the engine could convert before writing the π form. Helps every π page.
- **`transformation` mirror from a value** (y = x or y = −x by a sign): `rigid-motions~reflect-line`.
- **`treeDiagram` outcome names by stage size:** equally likely stages of 2 to 4 need names that
  fit each size (H, T for a coin): `probability-rules~sample-space`.
- **`markedFigure` rays at an angle** (a ray drawn from a degree value, not coordinates): angle
  addition and exterior-angle pages could then use it, as the plan wanted.
- **`quadrilateral` rhombus from its diagonals** (not side and angle): `quadrilaterals~rhombus`.

## After the build (lead)

- `m.10.proofs~isosceles`: built with figure-only values (engine need 1, `hidden`): BD, AD and BC
  place the drawing, and only the base-angle rule is shown.
- `m.10.quadrilaterals~parallelogram`: built with the drawing's width and height as fixed
  numbers (the picture takes them), so the page is the angles alone: ∠B = 180° − ∠A, ∠C = ∠A.

## After the lesson review (`.review/hs-m.10/lesson-report.md`)

**Built:** six new pages, 108 in all. Calculators: `similarity~splitter-converse` (the two
ratios and a sign box; a `markedFigure` from points, AC drawn at 60° to AB through figure-only
values, no parallel marks since DE isn't always parallel), `quadrilaterals~regular-area`
(n 3–12, θ = 180° ÷ n, apothem, K = ½aP on the `polygon` picture), `volume-derivations~pyramid-surface`
(the square pyramid `net`), `volume-derivations~density` (a `curvedSolid` cylinder, ρ = m ÷ V; now
the main page of `m.10.modeling-density`).
Sorts: `triangle-relationships~angle-side-order`, `proofs~reasoning`.

**Rebuilt:** `law-sines-cosines~ambiguous-case` is its own page: h = b sin A, the triangle count
n with the case in its how and the comparison after it, B by the law of sines, B₂ = 180° − B,
C, C₂, c, c₂. The second triangle's values are left blank when fewer than two fit; A is acute
(1°–89°). `triangleSolver` already draws the second SSA triangle dashed.

**Changed from the report:**

- `bothSides` (midpoint, parallel-lines algebra, corresponding parts): the smaller x term is
  taken first, then the number, then a divide line (“Take 3x … 1 = 2x − 7”, “Add 7 … 8 = 2x”,
  “Divide both sides by 2: x = 4”). The rearranged line (x = (q − s) ÷ (r − p)) stays: the
  engine always prints it; it is now written in the same direction as the balancing.
- Counting pages: n to 60, r to 14, and a limit of 10¹² ways (P, C, C(n, r)) with its own
  message; the factors are written out (P = 8 × 7 × 6; C = (8 × 7 × 6) ÷ (3 × 2 × 1), 336 ÷ 6).
  `pascalTriangle` can't skip the triangle past row 12, so these pages show the slots only.
- Right-triangle trig pages open in metric (7.5 m ladder, 0.5 m over 6 m, 36 m and 1.5 m).
- `right-triangle-trig` main: s, k, t (fraction up to /100) named “Sine of A” …; the three
  ratio rules are listed as s = a ÷ c (sin A) and so on, apart from the law rules.
- `probability-rules~complement` keeps P(Wind) and P(Rain and Wind): the `venn` picture has
  no one-circle form. Only the how changed.
- `rigid-motions~symmetry`: r, u, a, b are figure-only; f keeps 1 and 0 with “(yes)” or “(no)”
  after it.
- `quadrilaterals~regular-area` draws no perimeter under the polygon: the harness check of
  sides × length against it has an absolute tolerance, which 12-figure values miss.
- `volume-derivations~density` (now `modeling-density`): V is a plain decimal (a π volume's check shows a cm³ multiple
  under mm³, the unit-menu need above).
- `conditional-probability` main: N is replaced by the late total L; e and h (on time by walk
  or car) are standalone table cells.

**Waiting:** none of the report's new pages.

**Shared needs from the review:**

- Engine: step lines drop the repeated answer of a pick rule (“L = 2”, then “→ L = 2”):
  `rigid-motions~symmetry`, the ambiguous case's n.
- Engine 7, exact radicals (“l = 5√3 ≈ 8.6603”, “b = √52 = 2√13”): special-right-triangles
  ~45-45-90, ~30-60-90, `similarity~right-altitude`.
- Engine 10, one π stage (“56 × π” then “56π”): every volume page.
- Engine: a fraction substituted into a later line switches to a decimal (3 − (−1/2) × 4, then
  3 − (−0.5) × 4): `parallel-lines~perpendicular-line`.
- Engine 3: the step heading repeats a name that holds its symbol (“Find side d (EF): d”):
  `similarity`, the probability pages.
- Engine: a value symbol P(…) is probability notation, not an expression; the new symbol test
  should allow it (every probability page).
- Picture: `pascalTriangle` draws the triangle only when n ≤ 12 and the slots alone past it:
  `probability-rules~combinations`, `~counting-probability`.
- Picture: `venn` with one event (no B circle): `probability-rules~complement`.
- Picture: `polygon` with its apothem drawn and labelled: `quadrilaterals~regular-area`.
- Picture: `transformation` symmetry of a parallelogram (a 180° turn about its center):
  `rigid-motions~symmetry`.
- Harness: the `polygon` perimeter check needs a relative tolerance:
  `quadrilaterals~regular-area`.

## Added skills (`m.10.modeling-density`)

Planned in `docs/plans/m.10.md` ("Added skills", section 19).

**Built:** 5 calculators. `m.10.modeling-density` (main: the density page moved from
`m.10.volume-derivations~density`, same values, now with m and ρ in `pictureLabels`),
`~sphere` (mass of a ball, `curvedSolid` sphere), `~population` (people per km² in a circular
region, `circle`), `~can-design` (least metal for a fixed volume, `table` of S over radii),
`~fence` (most area for a fixed perimeter, `rectangle` with `around` and `inside`). No layout
pages; no new phrases in `harness/phrasesM10.ts`.

**Waiting:** none.

**Changed from the plan:** none. Notes: `~population`'s A is a plain decimal (a π area's check
misreads under mm² and m², as the density page's V did) and D has a positive minimum (a D of 0
with a population of 1 was a false conflict). `~can-design` keeps every value in cm (`units`),
so the table's radii are in the unit shown.

**Shared needs found while building:**

- `functionGraph` (or `table` with a `graph`): an output against the swept value, the least
  point marked: surface area S against radius r with V held, the best r = ∛(V ÷ 2π) ringed;
  driven by V, r, S. Pages: `modeling-density~can-design` (and `~fence`, A against x).
- `table` rows in the shown unit: the rows function gets values in formula units, so a page
  with a unit menu can't give rows that follow it. Pages: `modeling-density~can-design`.
- `region` (or a `circle` option): an irregular outline on a km grid with people as dots, its
  area modeled by the circle of radius r; driven by r, A, N, D. Pages:
  `modeling-density~population`.
- `unitCubes` with `scale` for sides that aren't whole cubes (a 2.5 × 3 × 5.2 cm block), or a
  plain box solid: the lesson review's box density page (V = lwh, a 2 × 3 × 5 cm block of 81 g
  is 2.7 g/cm³) waits on it; the cone version was built instead.
- Engine: a new value that makes an older input impossible clears the older one silently (h at
  r = 0.01 on the main page). The ρ ≤ 23 g/cm³ limit now gives the reason for the densest cases.

### Lesson-review fixes (`.review/new-math/lesson-report.md`)

- `~can-design`: r_best = ∛(V ÷ 2π) and S_min = 2πr_best² + 2V ÷ r_best (500 cm³: 4.3013 cm,
  348.73 cm²); with V known the S step works as "S = 2 × π × 4² + 2 × 500 ÷ 4", "S = 32π + 250".
- `~fence`: s = P ÷ 4 and A_max = s² (40 m: 10 m, 100 m²).
- `~population`: r up to 3,000 km, N up to 9 × 10⁹.
- Main, `~sphere` and the new pages: a limit ρ ≤ 23 g/cm³ ("No material is denser than about
  22.6 g/cm³ (osmium) …").
- New page `~cone` (mass of a cone from its density, `curvedSolid` cone; r = 3, h = 4, aluminum
  2.7 g/cm³: V = 12π cm³, m ≈ 101.79 g). The box version waits (shared needs).

### Second lesson-review fixes (`.review/new-math-2/lesson-report.md`)

- `~sphere`: m runs 10⁻⁶..10¹¹ g, as V's range times ρ's implies, so r = 0.01 and 1000 no
  longer clear ρ.
- `~population`: a limit D ≤ 2,000,000 people per km² ("No place is more crowded than about 2
  million people per km² …").
- `~can-design`: with V known the S step's line is "S = 2 × π × r² + 2 × 500 ÷ r" (V's value is
  written in, since V is not in that rule), so no rounded h is multiplied; the how adds "The
  side 2πrh is 2V ÷ r, since h = V ÷ πr²". V 1..100,000 cm³ and h max 10,000 cm.
- `~fence`: s runs from 0.0025 m (a quarter of the least fence), so P = 0.01 after x = 12 is
  refused with the x < P ÷ 2 reason.
- Not done (engine, the lead's): main's r = 0.01 and 1000 still clear h silently; `~cone` and
  `~can-design` "÷ 4π" brackets (`simplify.ts`). The box page still waits.

### Pictures placed (H89–H110)

| Page                                                                             | Entry       | What changed                                                                                                                                          | Stand-in gone                                 |
| -------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| m.10.parallel-lines~parallel-line, ~perpendicular-line                           | H92         | `lineSystem` `marks: true`, `given: { x: 'x0', y: 'y0' }`                                                                                             | — (the point wasn't drawn)                    |
| m.10.constructions~bisector-steps, ~angle-bisector-steps, ~find-center           | H96 need 5  | a `construction` card figure on every stage, its new step lit                                                                                         | text-only stages                              |
| m.10.proofs, m.10.parallel-lines~triangle-sum-proof, m.10.congruence~cpctc-proof | H96 need 5  | `construction` stage figures, following each page's own stages (triangle sum: ∠1, ∠3 and ∠B; CPCTC: the given midpoint, the ticks, SAS, then PR ≅ QS) | text-only stages                              |
| m.10.congruence (12 cards), m.10.similarity~similar-or-not (8 cards)             | H96 need 6  | `markedTriangles` card figures, the marks saying what each card says                                                                                  | text-only cards                               |
| m.10.volume-derivations~cross-section-shapes                                     | H96 need 12 | `solidCut` on all eleven cards                                                                                                                        | text-only cards                               |
| m.10.quadrilaterals (new main)                                                   | H96 need 4  | polygon angle sums on `markedFigure` `regular` (n 3–30, a 9-gon example)                                                                              | — (the skill had no main page)                |
| m.10.quadrilaterals~rhombus                                                      | H105(12)    | `quadrilateral: { family: 'rhombus', across: ['p', 'q'] }`; p, q, K under the picture                                                                 | the hand-placed points                        |
| m.10.quadrilaterals~regular-area                                                 | H106(6)     | `polygon` with `apothem`, `angle`, `around` and `area`                                                                                                | the plain polygon                             |
| m.10.circle-theorems~cyclic-quadrilateral (new)                                  | H96 need 7  | `circleTheorems` `cyclic` (m∠A = 84°, m∠C = 96°)                                                                                                      | — (was waiting)                               |
| m.10.circle-theorems~chord-angle (new)                                           | H96 need 7  | `circleTheorems` `arcAngle`: chords inside (+) or secants outside (−) from the + − box                                                                | — (was waiting)                               |
| m.10.coordinate-geometry (all six pages)                                         | H96 need 11 | `fit: true` with extent 20                                                                                                                            | the fixed ±20 grid                            |
| m.10.constructions~angle-addition                                                | H105(11)    | `markedFigure` rays OA, OB and OC at the typed angles (a and b to 179°)                                                                               | the `angles` picture                          |
| m.10.proofs~exterior-angle                                                       | H105(11)    | `markedFigure`, A where the rays from B (at b) and C (at d) meet                                                                                      | the `angles` picture                          |
| m.10.rigid-motions~reflect-line                                                  | H105(4)     | s (1 or −1) picks y = x or y = −x (`slope: 's'`); x′ = s·y, y′ = s·x                                                                                  | the y = −x-only rules and the standalone note |
| m.10.rigid-motions~symmetry                                                      | H106(10)    | `about: 'center'`                                                                                                                                     | the hidden center a, b and their rules        |
| m.10.probability-rules~neither                                                   | H97         | a Venn of counts out of N (NAEP-2024-12M4-#18): the union, neither and P(neither) worked out                                                          | the chances version                           |
| m.10.probability-rules~sample-space                                              | H105(10)    | `namesBySize` (H, T; R, G, B; 1 to 4)                                                                                                                 | the 1/2 code for heads and tails              |
| m.10.probability-rules~complement                                                | H106(7)     | a one-event Venn (`one: true`)                                                                                                                        | P(Wind) and P(Rain and Wind)                  |
| m.10.conditional-probability~venn                                                | H97         | a Venn of counts; P(A and B), P(B \| A) and P(A \| B) as fractions                                                                                    | the chances version                           |
| m.10.conditional-probability~independent                                         | H97         | a three-stage chance tree (NAEP-2009-12M7-#12): all on time, at least one late                                                                        | the two-stage tree                            |
| m.10.modeling-density~can-design                                                 | H106(8)     | the table with its graph (`graph: { best: 'min' }`, `rowsFrom: 'shown'`)                                                                              | the cm pins and `unitSystems: ['metric']`     |
| m.10.modeling-density~fence                                                      | H106(8)     | the table of A over x with its graph (`best: 'max'`)                                                                                                  | the rectangle                                 |
| m.10.modeling-density~population                                                 | H106(9)     | `circle` `population: { people: 'N', density: 'D' }`                                                                                                  | N and D under the picture                     |

Not placed:

- **m.10.probability-rules~counting-probability (H97, `pascalTriangle` `fraction`)**: the fraction
  draws C(a, r) ÷ C(a + b, r), the case k = r alone, and the triangle only to row 12, while the page
  counts k of the r from the first group (C(a, k) × C(b, r − k)) among up to 60 people. Placing it
  would cut the "exactly 2" half of the lesson and the range, so the slots stay.
- **H96 need 14 (a parallelogram turning about its center)**: ~symmetry is a rectangle page, and
  H106(10) (`about: 'center'`) went on it instead. The MCAS-2026-G10M-#41 parallelogram would be a
  page of its own.

Gallery demos built from these pages that no longer pass (the lead's to retire):
`g.m10-rigid-motions-mirror-sign` (it adds s a second time).

### Page-review fixes (`.review/hs-page-m/page-report-m9-10.md`)

- parallel-lines~algebra: the transversal is `fixed` (new `transversal.fixed`): its angle is
  worked out from the typed expressions, so the drag no longer clears p, q, r.
- circle-equations~general-form: the circle is `fixed`; the drags erased D, E and F.
- constructions~perpendicular-bisector: AM moves to the caption, off M and its tick.
- rigid-motions~glide: the figure's B is (−3, 5), so B′ no longer lands beside A, and the
  extent is 8, so A′ at x = 7 sits inside the plot.
- proofs: the vertical-angle numbers sit 22 out from the crossing (new `r` on a card text).
- Left for the shared fixer (component only): "r = 5" on a tick, the circumcenter O over F,
  "d = 13" over O (rectangle), the find-angle ramp drawn to scale and its labels, the
  ambiguous-case labels and decimals, the coordinate-geometry label halos, the Venn "only"
  caption lines (~neither), the 80 px stage figures (constructions).

### Round 4 placed

- `m.10.probability-rules~counting-probability` (H113, P25): `pascalTriangle` with `k: 'r'` and
  `fraction: { n: 'a', k: 'k', b: 'b', r: 'r', count: 'f', chance: 'P' }` under the slots, so it
  draws C(a, k) × C(b, r − k) over C(n, r) (the "not placed" note above is done). Two fixes the
  pictures chat found: b runs from 1 (the lesson is two groups; with b = 0 every pick is "all
  from the first", and P = 1 was left unknown), a to 59; and two case rules, f = C(b, r) when
  k = 0 and f = C(a, r) when k = r, find f before the group that gives no one is typed (a page
  sampling run found f left unknown there too). The slots put "= 2.7359 × 10¹⁷" on its own line
  and split the ÷ r! line before "→ … groups" when they pass the width (10 or more places at
  390 px), and a count of groups past 2⁵³ is rounded (C(36, 14) read 3,796,297,200.0000005).
  Demos `g.m10-probability-rules-exactly-k` and `g.m10-probability-rules-exactly-k-sixty` retired.
