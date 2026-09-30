# Build notes: math grade 11 (Algebra 2)

Built from `.review/plans/m.11/plan.md`, in its Priority order.

## Built

- m.11.normal-distribution: 6 (main, ~between, ~outside, ~empirical, ~percentile, ~margin)

## Waiting

## Changed from the plan

- **normal-distribution main:** the equation writes each box's unit,
  `{z} = {{x:unit} − {m:unit}}/{s:unit}`, since heights are in cm.
- **normal-distribution~outside:** the example is μ = 500 g, σ = 2 g, d = 3 g (the plan's
  μ = 0 g fails the "no zero example with a unit" test). The same z = 1.5 and P = 0.1336; of
  500 packages about 67. The cutoffs L = μ − d and U = μ + d are values, so the curve can shade
  outside them.
- **normal-distribution~empirical:** the shade has no `area`: the rule's 95% is rounded, the
  curve's area is 0.9545. The step reads "share within 2 standard deviations" (a phrase in
  `phrasesM11.ts`).
- **normal-distribution~margin:** the interval has no `level`: E = 2 SE covers 95.45%, and the
  picture check wants the level to equal the drawn area. SE is its own value, so the curve's
  spread is shown.

## Shared needs found while building
