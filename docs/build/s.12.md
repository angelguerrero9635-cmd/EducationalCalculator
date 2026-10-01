# Build notes: science grade 12 (Earth and space)

Built from `.review/plans/s.12/plan.md`, one skill at a time, the skills taken in the plan's
priority order of their main pages.

## Built

- s.12.minerals-rocks: 6 (main Mohs explore, ~density; sorts ~mineral-groups, ~cleavage, ~igneous,
  ~metamorphic)
- s.12.earth-interior: 5 (main, ~epicenter, ~shadow-zone; sorts ~wave-types, ~heat-sources)
- s.12.volcanoes-mountains: 4 (main volcano explore, ~deformation and ~mountain-building explores,
  sort ~magma)
- s.12.surface-processes: 3 (main landforms explore; sorts ~weathering, ~agents)
- s.12.radiometric-dating: 6 (main C-14, ~uranium, ~bracket, ~half-life; sequences ~relative-order,
  ~time-scale)
- s.12.ocean-atmosphere: 4 (main sonar, ~tides; explore ~currents, sort ~density)
- s.12.atmosphere-weather: 5 (main lapse rate, ~pressure, ~humidity; sequence ~hurricane, sort ~air-masses)
- s.12.climate-systems: 5 (main greenhouse explore, ~zones and ~feedbacks explores, sort ~carbon,
  observe ~co2-record)
- s.12.resource-management: 3 (main renewable sort, ~energy-mix, sequence ~fossil-fuels)
- s.12.solar-system: 3 (main Kepler; sequence ~formation, sort ~planet-types)
- s.12.starlight-spectra: 4 (main Wien, ~doppler, ~telescope; sort ~space-telescopes)
- s.12.stellar-evolution: 5 (main H–R diagram, ~fusion; sequences ~sunlike, ~massive; sort ~elements)
- s.12.cosmology: 5 (main Hubble’s law, ~redshift, ~stretch; sort ~galaxies, sequence ~big-bang)

58 pages: 23 calculators (8 mains, 15 problem types) and 35 layouts (5 mains, 30 problem types).
The order of work was the plan's priority order of the mains (the 8 calculator mains, then the
5 layout mains), each skill finished and committed before the next; both files list the pages
in taxonomy order.

## Waiting

- s.12.earth-interior~magnitude: need 2 (two seismograms by magnitude, `earthLayers` mode
  `magnitude`).
- s.12.earth-interior~spreading-rate: need 3 (a ridge with magnetic stripes, `oceanProfile` mode
  `stripes`).
- s.12.surface-processes~discharge: need 4 (a stream channel cross-section: width × depth with
  the flow speed as an arrow).
- s.12.atmosphere-weather~cloud-base: need 5 (a rising air parcel, `atmosphereLayers` mode
  `parcel`).
- s.12.climate-systems~energy-balance: need 6 (the `greenhouse` energy view as a calculator,
  driven by S and α).
- s.12.resource-management~reserves: need 7 (a reserve drawn down year by year).
- s.12.starlight-spectra~lines: need 8 (spectra side by side: the star’s strip over the H, He
  and Na reference strips).
- s.12.stellar-evolution~lifetime: need 10 (`hrDiagram` option `mass`).
- s.12.starlight-spectra~parallax (from the lesson review, N2): distance from parallax, d = 1 ÷ p
  parsecs and 3.26 × d light-years (p = 0.001–1″). No picture draws a parallax yet: Earth's orbit
  as the baseline, the near star shifting against far stars, the angle p marked.

Built with a planned interim: the climate main's "Ash and smoke" scene says in its lines what
need 8's `particles` option would draw (the energy view has no aerosol particles yet).

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
- s.12.cosmology~redshift: z runs 0–0.1 and λ 656.3–721.9 nm (656.3 × 1.1), not z from −0.01
  and λ from 600 nm. The page works d = v ÷ H₀, which gives a negative distance for a
  blueshift; blueshifts stay on ~doppler. H₀ is an input (50–100, opening at 70), not a fixed
  value, for the reason under ~uranium.
- s.12.stellar-evolution~fusion: the `decayChart` equation mode has no `fixed` option; the
  equation 4 ¹H → ⁴He + 2 e⁺ is drawn from constants, and L, m and H are `pictureLabels`.
- s.12.resource-management~energy-mix: o (other) is worked out, like F and R, from
  o = 100 − F − n − R; a bar for it joins the six icon bars.
- Sort cards, sequence stages and scene lines follow the plan; where the plan gave only a
  label, the bins' `why` sentences, scene lines and the second assumption the layout test asks
  of each problem type (~deformation, ~mountain-building) are new.
- Units stay fixed labels (km/s, hPa, °C, K, years, million years, AU, Mpc, L☉, R☉), as the plan
  decided (need 1).

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

## Lesson review fixes (`.review/hs-s.12/lesson-report.md`)

- Seismic pages: `vₛ < vₚ` became the limit vₛ ≤ 0.7 × vₚ with its reason (in rock vₚ ÷ vₛ ≥ √2);
  it keeps 1 ÷ vₛ − 1 ÷ vₚ away from 0, the cause of the six harness errors. Main: d 0.2–12,700 km
  (0.2, not the report's 0.5: L = 0.1 s at 4 and 2 km/s is 0.4 km), tₚ and tₛ widened to match.
  ~epicenter: k "Km of distance per second of lag", 2–35; d₁–d₃ to 4,000 km.
- ~shadow-zone stays a calculator (no explore figure draws `earthLayers`): Δ from the epicenter,
  1–180°, s = Δ ÷ 360 × 2 × π × 6,371 shown to 4 figures.
- C-14 left from 0.1 % (the plan's), not the report's 0.025 %: at the opening half-life 5,730
  years 0.025 % is 68,500 years, past t's 60,000, and the edge dropped T.
- ~uranium: R 0.0016–1.04, t 10⁷–4.6 × 10⁹ years (the report's 0.0015 and 1.05 give ages just
  outside t's range at the edges); the solar system's age is an assumption.
- ~bracket: P to 99 %, u to 700; the u < t limit has a reason, so an upper ash older than the
  lower is refused, not silently dropped.
- New ~half-life (N1): any isotope, T typed; a limit t ≤ 1.38 × 10¹⁰ years with its reason
  refuses ages older than the universe.
- Rounding so a step evaluates as written: z to 5 figures (Doppler, redshift), v to 4, telescope
  G and Kepler q, Q to 3 (`sigFigs`). The pressure gradient keeps 4 decimals: at 2 figures the
  harness recomputes 76.1 ÷ 416.3 × 100 = 18.3 against "18", and 4.0 breaks the trailing-.0 rule.
- Kepler e stays at most 0.95: the `circularMotion` kepler picture refuses more (the report's
  0.97 for Halley's Comet).

## Shared needs (lesson review)

- `earthLayers` as an explore figure (mode `section`, a Δ per scene) so ~shadow-zone can become
  the report's explore: which waves reach 60°, 104°, 120°, 150° (s.12.earth-interior~shadow-zone).
- `circularMotion` mode `kepler`: eccentricity up to 0.97 (Halley's Comet) (s.12.solar-system).
- A display rounding to the value's `step` (0.01, whole numbers) that keeps the steps exact, for
  values `sigFigs` can't serve: the pressure gradient G (s.12.atmosphere-weather~pressure).
- A parallax picture (s.12.starlight-spectra~parallax, above).
- Simplifier: "0 × 2 × π × 6,371 → 0π × 6,371" (s.12.earth-interior~shadow-zone; Δ now starts at
  1° to avoid it).
- The time-scale span prints "4059 million years" without a separator
  (s.12.radiometric-dating~time-scale).

## Added skills (plan "Added skills", sections 14 and 15)

### Built

- s.12.earth-history: 5 (main one-day clock and ~day-length calculators; sequences ~oxygen and
  ~life, sort ~atmosphere)
- s.12.exoplanets: 5 (main transit, ~orbit and ~habitable-zone calculators; sorts ~methods and
  ~life)

10 pages, none waiting. Every calculator is built with the planned interim: a `table` of the
page's own formula (event rows, days-per-year rows, the solar system's planets across the star,
periods, orbit distances), the values it doesn't draw as `pictureLabels`.

### Changed from the plan

- Earth-history main: the first-life row is 3,500 million years ago (the plan's draft said 3,800;
  the plan now says 3,500, the widely agreed age of the oldest fossil microbes).
- ~day-length: the table's first row is 365.25 days (today's day of exactly 24 h), not 365.
- Units stay fixed labels (million years, minutes, hours, days, R☉, R⊕, M☉, L☉, AU, K). Minutes
  and hours are written out, not the registry's `min` and `h`, so the one-day clock's 24 and
  1,440 stay in the formula's own units.

### Lesson review of the added skills

Report: `.review/new-sci/lesson-report.md`. Fixed:

- Earth-history main: t has a note with the clock time ("(11:39 p.m.)", "(12:00 noon)").
- ~day-length: n runs 360–4,500, so every n fits N 360–450 for some b.
- Exoplanets main: δ has no significant-figure pin, so it reads "1%", not "1.000%".
- ~orbit: a work line "a = ∛0.008"; the use line says 36.525 days, as the example.
- ~habitable-zone: a middle line "T = 278 × 0.7071 ÷ 0.7071" and the verdict as a note after T
  ("(0.475 < 0.5 < 0.685 AU: in the zone)", too hot, too cold); a limit that a is more than
  0.005 × √L AU ("That orbit is inside the star.").
- Not built: a ~drake page (the report's "Not in the taxonomy" note, not a proposed page).

### Second lesson-review fixes

Report: `.review/new-sci-2/lesson-report.md`.

- Earth-history main: under a minute before midnight the t note gives the seconds ("Our species":
  "(about 6 seconds before midnight)"), not "12:00 midnight".
- ~day-length: the 21.915 → 21.91 tie is the engine's (fixed by the lead: 21.915 now shows as
  typed or rounds up). A count giving a year outside 360–450 days no longer drops b silently: the
  N = n ÷ b rule says "That many lines across those bands gives a year shorter than 360 or longer
  than 450 days." (on the rule, not a separate check: a check whose residual is 1 at every probe
  of the harness's `affineOf`, as "N from 360 to 450" is, reads as a constant and marks every
  branch hopeless; a harness note for the lead).
- ~atmosphere: "About 21% oxygen" (no space before %).
- Exoplanets main: δ that gives a planet past 25 R⊕ or under 0.3 R⊕ says why ("That dip needs a
  body over 25 Earths wide: a small star, not a planet." / "… too small to find this way.");
  r's range is wide behind the check. "× 1" carried through the r step is the engine's (lead).
- ~orbit: example M 0.5 M☉, P 1,461 days, so T = 4 years and a = ∛8 = 2 AU, with the use line
  "A planet circles a star of 0.5 solar masses every 1,461 days. …"; the table's periods are 10,
  100, 365.25, 1,461 and 3,652.5 days.
- ~habitable-zone: no brackets round a lone value: "T = 278 × L^(1/4) ÷ √a", "d₁ = 0.95 × √L",
  so the lines read "÷ √0.5".

### Shared needs (pictures)

- `geologicClock` (new kind, or a `timeline` mode): a 24-hour dial with Earth's formation at
  midnight, the event at `A` marked at clock time `t` and the last `m` minutes shaded
  (s.12.earth-history).
- `coralSection` (new kind): a fossil coral cut open, `n` fine daily lines across `b` yearly
  bands, the day's length `D` beside today's 24 h (s.12.earth-history~day-length).
- `transit` (new kind, or a `spectrum`-style star option): the star's disk of radius `R` with the
  planet of radius `r` crossing it to scale, and the light curve dipping by `δ` (s.12.exoplanets).
- `habitableZone` (new kind, or a `circularMotion` option): the star at the center sized by `L`
  or `M`, the zone from `d₁` to `d₂` shaded green, the planet's orbit at `a` with `T`
  (s.12.exoplanets~habitable-zone, ~orbit). The `kepler` mode can't serve ~orbit: its caption
  always states T² = a³, true only round the Sun; a `starMass` option would fix it.

### Pictures placed (H89–H110)

| Page                             | Entry   | What changed                                                                                                                                                                                                                     | Stand-in gone                                                                              |
| -------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `s.12.starlight-spectra~doppler` | H105.14 | `spectrum` `lines.rest: 'r', line: 'rest'`; a new value λ₀ (`allowed` 410.2, 434.0, 486.1, 656.3 nm) and the rule z = (λ − λ₀) ÷ λ₀; λ is "Observed wavelength", 400–665 nm; the third assumption says to pick the measured line | the Hα-only rule z = (λ − 656.3) ÷ 656.3 (kept for `~redshift`) and the Hα-only assumption |
| `s.12.earth-history`             | H110.1  | `geologicClock` (A, t, m, p) with the page's six events round the rim                                                                                                                                                            | `table` of clock times by event; pictureLabels p, m                                        |
| `s.12.earth-history~day-length`  | H110.2  | `coralSection` (n, b, N, D)                                                                                                                                                                                                      | `table` of day length by days a year; pictureLabels n, b                                   |
