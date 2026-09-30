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
