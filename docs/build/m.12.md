# Build notes: Grade 12 math (m.12)

Built from `.review/plans/m.12/plan.md` in its Priority order. Pages are in
`src/data/modules/math/12.ts`, layout pages in `src/data/modules/layouts/math12.ts`, step-text
phrases in `src/data/modules/harness/phrasesM12.ts`.

## Built

- `m.12.hypothesis-testing` (4): main (one-proportion, two-sided), `~mean` (left-tailed),
  `~two-sample`, `~errors` (sort).
- `m.12.confidence-intervals` (4): main (mean, σ known), `~proportion`, `~sample-size`,
  `~capture`.
- `m.12.sampling-distributions` (3): main (x̄), `~proportion` (p̂), `~counts` (binomial).
- `m.12.chi-square` (2): main (goodness of fit, 3 categories), `~independence` (2 × 3 table).
- `m.12.conics` (5): main (ellipse), `~parabola`, `~hyperbola`, `~identify` (sort), `~cone`
  (explore).
- `m.12.matrices` (5): main (row reduction, right sides typed), `~multiply`, `~determinant`
  (3 × 3), `~inverse`, `~cramer`.

## Waiting

## Changed from the plan

- **Tails are fixed per page (need 2 interim).** The main page is two-sided and `~mean` is
  left-tailed, as the plan's pictures say; a typed Hₐ waits on engine need 2.
- **p̂, SE derived.** On the test pages the sample proportion and the standard errors are worked
  out, never typed, so a typed z can't disagree with the sample.

- **C is a decimal (0.9, 0.95, 0.99), not a percent.** `normalCurve` reads a confidence level
  from 0 to 1 (its check rejects 95), so the confidence pages type C as 0.95.
- **SE added on the interval pages.** The curve under an interval is the sampling curve, so it
  needs the standard error as its spread: the main page has SE = σ ÷ √n and E = z⋆ × SE (9
  values); `~proportion` has SE = √(p̂(1 − p̂) ÷ n); `~sample-size` shows the SE the rounded-up
  n gives (the interval's level is left off that picture, since rounding n up makes its middle
  area a little more than C).
- **`~capture` draws 100 intervals; N is not a value.** `normalCurve` takes the number of
  intervals as a fixed number, not a variable, so N (20, 50, 100) would not move the picture:
  the page fixes 100 and K = 100 × C. The sample size n is standalone (it sets the widths only).

- **Chi-square contexts.** The goodness-of-fit page counts red, pink and white flowers against
  a 1 : 2 : 1 ratio; the independence table is grade (11, 12) by how students get to school
  (walk, bus, car). The expected counts are shown in the steps' work lines, not as values (the
  10-value limit).

- **Conic centers are standalone.** On the ellipse and hyperbola pages h and k only place the
  curve (c, e and the slope come from a and b), so they are marked `standalone`.

- **Row reduction as the reduced rows.** The main matrices page's three relations are the rows
  after the plan's row operations (x + y + z = d₁, y − 2z = d₃ − d₁, −7z = d₂ − 5d₁ + 3d₃), so
  the steps read as back-substitution: z, then y, then x. The coefficients stay fixed (need 3).
- **Interim pictures for the determinant and Cramer pages (need 5).** A page must have a
  picture, and "none drawn" is not a kind: `~determinant` shows a table of D as the last entry k
  changes (D moves by ae − bd each step), and `~cramer` plots the solution (x, y) where the two
  lines cross. Both switch to the determinant picture when need 5 lands.
- **`~inverse` keeps rows (need 4 interim)**; its picture multiplies A by A⁻¹ to show I.

## Shared needs found while building

- **An `allowed` list of decimals needs `min`, `max` and `multipleOf`.** The solver's
  whole-number search (`wholeSolutions` in `src/engine/solve.ts`) builds its bounds from
  `min`/`max` on a grid of `multipleOf` (default 1): with an allowed list of 0.9, 0.95, 0.99 and
  no grid, the bounds are empty or NaN and every consistent input is reported as a conflict. The
  confidence pages set `min`, `max` and `multipleOf: 0.01`; the search could read the grid from
  the allowed list instead (every page with a decimal `allowed` list).
- **`normalCurve` `intervals.count` from a variable** (20, 50 or 100 typed), so the capture page
  can take N as the plan planned (`m.12.confidence-intervals~capture`).
