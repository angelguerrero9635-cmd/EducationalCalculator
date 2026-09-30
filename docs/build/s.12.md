# Build notes: science grade 12 (Earth and space)

Built from `.review/plans/s.12/plan.md`, one skill at a time, the skills taken in the plan's
priority order of their main pages.

## Built

- s.12.earth-interior: 5 (main, ~epicenter, ~shadow-zone; sorts ~wave-types, ~heat-sources)

## Waiting

- s.12.earth-interior~magnitude: need 2 (two seismograms by magnitude, `earthLayers` mode
  `magnitude`).
- s.12.earth-interior~spreading-rate: need 3 (a ridge with magnetic stripes, `oceanProfile` mode
  `stripes`).

## Changed from the plan

- s.12.earth-interior: d starts at 1 km and L at 0.1 s, not 0: the seismogram draws no trace for
  a distance of 0 (the harness failed "distance 0 km is not positive"). The lag relation is
  written L = d ÷ vₛ − d ÷ vₚ (one relation, solvable for d, vₚ and vₛ) rather than L = tₛ − tₚ,
  so the page solves from its opening values L, vₚ and vₛ.
- s.12.earth-interior~epicenter: k is not a fixed value. A fixed k (a one-value range) broke the
  harness (retyping it read as a change), and d = 8.4 × L with no k left the three stations
  unconnected (the module test "connects every value" failed). k is worked out from vₚ and vₛ,
  k = 1 ÷ (1/vₛ − 1/vₚ), which opens at 6 and 3.5 km/s, k = 8.4. The distance range is widened
  past 1,000 km to follow any speeds typed.

## Shared needs found while building

- None yet.
