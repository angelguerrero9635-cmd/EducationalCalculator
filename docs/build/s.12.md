# Build notes: science grade 12 (Earth and space)

Built from `.review/plans/s.12/plan.md`, one skill at a time, the skills taken in the plan's
priority order of their main pages.

## Built

- s.12.earth-interior: 5 (main, ~epicenter, ~shadow-zone; sorts ~wave-types, ~heat-sources)
- s.12.radiometric-dating: 5 (main C-14, ~uranium, ~bracket; sequences ~relative-order, ~time-scale)
- s.12.ocean-atmosphere: 4 (main sonar, ~tides; explore ~currents, sort ~density)
- s.12.atmosphere-weather: 5 (main lapse rate, ~pressure, ~humidity; sequence ~hurricane, sort ~air-masses)
- s.12.solar-system: 3 (main Kepler; sequence ~formation, sort ~planet-types)
- s.12.starlight-spectra: 4 (main Wien, ~doppler, ~telescope; sort ~space-telescopes)
- s.12.stellar-evolution: 5 (main H–R diagram, ~fusion; sequences ~sunlike, ~massive; sort ~elements)

## Waiting

- s.12.earth-interior~magnitude: need 2 (two seismograms by magnitude, `earthLayers` mode
  `magnitude`).
- s.12.earth-interior~spreading-rate: need 3 (a ridge with magnetic stripes, `oceanProfile` mode
  `stripes`).
- s.12.starlight-spectra~lines: need 8 (spectra side by side: the star’s strip over the H, He
  and Na reference strips).

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
- s.12.radiometric-dating~uranium and ~bracket: the fixed half-lives (4.47 × 10⁹ years, 704
  million years) are written into the formula (t = n × 4.47 × 10⁹) instead of a value with
  `allowed: [T]`. With T a value, typing t and R together made the solver work T out from them
  and refuse it (the harness: "consistent inputs reported as a conflict"). Each page names its
  half-life in an assumption. The uranium page's age reaches 1.8 × 10¹⁰ years, not 1.6 × 10¹⁰,
  so R up to 15 (p down to 6.25 %, n = 4) stays in range; the age is shown in full digits, since
  scientific display rounded it to 5 digits and retyping it read as a conflict.
- s.12.radiometric-dating~bracket: a bracket width w = t − u is added, so the upper ash's age is
  joined to the rest by a formula (a check alone does not connect it).
- s.12.radiometric-dating: C-14 left starts at 0.01 %, not 0.1 %, so an age of 60,000 years
  with T = 5,000 years stays in range.

- s.12.ocean-atmosphere: echo time starts at 0.01 s and depth at 1 m (the plan's 0 draws no
  ping), as the sonar demo does.
- s.12.starlight-spectra~doppler: the lab wavelength is Hα, 656.3 nm, written into the formula,
  not a value with `allowed: [656.3, 486.1, 434.0, 410.2]`. The `spectrum` picture draws its
  observed line from one fixed lab line (`lines.line`), so any other λ₀ would draw the wrong
  shift (the harness checks the observed wavelength against λ₀(1 + z) of that line). The
  observed wavelength covers z = ±0.01 (649–663 nm).
- s.12.starlight-spectra~telescope: the aperture D and light gathered G are marked
  `standalone`: they are joined to each other but to no other value, as the plan's relations have
  them.

## Shared needs found while building

- Harness (`harness/search.ts`, `affineOf` in the engine): a relation whose residual is a
  product scaled by a large constant, such as f × λ ÷ 3 × 10¹⁷ − 1, reads as affine at the probe
  points (the product is tiny beside the constant), so the search calls it hopeless and reports
  "accepts inputs that no valid values can satisfy". Written as f − 3 × 10¹⁷ ÷ λ it passes. A
  probe at larger values, or a check that the coefficients are not all zero, would catch it.
- `spectrum` lines: a `rest` variable can't choose which lab line is drawn; an option to follow
  it (the nearest of the element's lines) would let the Doppler page take any Balmer line.
- Fixed constants as values: a value pinned by `allowed: [x]` (a half-life, a km-per-second
  factor) makes the solver work it out from two typed values and refuse it. Pages here write
  such constants into the formula; a solver rule that never solves for a one-value variable
  would let a page show it as a value.
