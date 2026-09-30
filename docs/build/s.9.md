# Build notes: science grade 9 (biology)

Built from `.review/plans/s.9/plan.md` in its Priority order, one skill at a time.

## Built

- `s.9.inheritance-patterns`: 6 (main dihybrid, ~genotype-ratio, ~incomplete, ~x-linked
  calculators; ~blood-types sort; ~pedigree explore).
- `s.9.evolution-evidence`: 7 (main Hardy–Weinberg and ~allele-counts calculators; ~homologous
  and ~mechanisms sorts; ~common-ancestry explore; ~resistance and ~speciation sequences).
- `s.9.population-ecology`: 5 (main logistic, ~rates and ~doubling calculators;
  ~limiting-factors sort; ~growth-phases sequence).
- `s.9.membrane-transport`: 4 (main diffusion and ~pump calculators; ~transport-types and
  ~tonicity sorts).
- `s.9.mitosis-meiosis`: 4 (main mitosis sequence; ~cell-cycle and ~meiosis sequences; ~compare
  sort).
- `s.9.ecosystem-dynamics`: 4 (main trophic-efficiency and ~biodiversity calculators;
  ~succession sequence; ~nitrogen explore).
- `s.9.homeostasis`: 4 (main feedback-loop explore with 6 scenes; ~systems and ~feedback-types
  sorts; ~blood-glucose observe).

## Waiting

- `s.9.mitosis-meiosis~chromosome-count` (calculator): Engine need 3, `cellDivision` as a
  calculator picture with `diploid` from a value (2–8 drawn, past 8 one pair and the count).
  Allowed [2, 4, 6] would hide the human 2n = 46 case the page is for.

## Changed from the plan

- `~genotype-ratio`: added `t`, the boxes of 4 showing the dominant trait (derived): the Grade 7
  `punnettSquare` needs a `dominant` value to draw and check. The offspring count is `n`
  (the plan's N). 7 values.

- `s.9.evolution-evidence~common-ancestry`: the "Is reptiles without birds a clade?" scene rings
  the lizard alone (the plan's ring) and says the smallest clade holding it also holds the bird.

- `s.9.population-ecology` main: `startWith` is ['t', 'K', 'N0', 'r'] (the demo's order), not
  ['K', 'N0', 'r', 't']: typing N must recalculate t, the value the relation can solve for; K,
  N₀ and r can't be found back from N. The N step divides by e^(rt) instead of multiplying by
  e^(−rt): the harness reads "−0.5" in a substituted step as a negative count.
- `~rates`: drawn with `bars` (N, B, D, I, E, N₁) as the plan's interim. Bars show the sizes
  but not which flows add and which take away (Engine need 8 still stands).
- `~doubling`: time t is 0–1,440 min (a day) and doublings g at most 40, so N stays a finite
  number; the plan's 0–10,000 min would overflow 2ᵍ.

- `s.9.membrane-transport` main: the limit m ≤ d ÷ 2 reads as 0 when the gradient is not above 0
  (O₂ then moves out or not at all, so none moves in). The after-counts o₂ and i₂ are labelled
  under the picture, which draws the counts before.
- `~pump`: added the limit i < o (Na⁺ is lower inside): the pump's arrow runs from fewer to more,
  so with more Na⁺ inside the picture would pump it in. K⁺ and the after-counts are labelled
  under the picture.
- `~transport-types`: text cards (Engine need 10, transport icons, would add pictures).

- `~biodiversity`: Simpson's sum is written out term by term, 1 − ((n₁ ÷ N)² + … + (n₄ ÷ N)²),
  so the harness reads it with no Σ phrase (Engine need 7 is not needed for this page). The four
  species are named (a pond survey) rather than numbered.

## Shared needs found while building
