# Build notes: science grade 11 (physics)

Built from `.review/plans/s.11/plan.md` in its priority order: the calculators with drawn demos
first, then the layout pages. Every page passes `MODULE_IDS=s.11. pnpm test src/data/modules`.

## Built: 65 pages (57 calculators, 8 layouts)

| Skill                       | Pages | Which                                                                                    |
| --------------------------- | ----- | ---------------------------------------------------------------------------------------- |
| `s.11.kinematics-1d`        | 5     | main, free-fall, braking, position-graph, turn                                           |
| `s.11.kinematics-2d`        | 4     | main, cliff, boat, components                                                            |
| `s.11.dynamics-vectors`     | 6     | main, incline, rope, elevator, force-sum; sort balanced                                  |
| `s.11.circular-gravitation` | 4     | main, car, swing, gravitation                                                            |
| `s.11.momentum`             | 3     | main, elastic, explode                                                                   |
| `s.11.work-energy-power`    | 6     | main, lever, pulley, ramp, spring; sequence pogo-energy                                  |
| `s.11.thermodynamics`       | 6     | main, specific-heat, latent-heat, engine, refrigerator; sort laws                        |
| `s.11.sound-waves`          | 7     | main, string, open-pipe, closed-pipe, doppler, sound-level; sort wave-types              |
| `s.11.optics`               | 8     | main, diverging, concave, convex, refraction, critical, double-slit; sort wave-behaviors |
| `s.11.electrostatics`       | 3     | main, field; sort charging                                                               |
| `s.11.circuits`             | 5     | main, series, parallel, mixed, power                                                     |
| `s.11.electromagnetism`     | 6     | main, flux-change, force, transformer; sort motor-generator; explore magnet-poles        |
| `s.11.modern-physics`       | 2     | main, hydrogen-lines                                                                     |

No new step-text phrases were needed: `harness/phrasesS11.ts` stays empty.

## Waiting: 11 pages

| Page                                  | Need | What it waits on                                                                                         |
| ------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------- |
| `s.11.kinematics-1d~motion-diagrams`  | 5    | Card figure `strobe` (dots every second with a gap pattern and direction)                                |
| `s.11.circular-gravitation~orbit`     | 3    | `circularMotion` mode `satellite` (v = √(GM/r), T = 2πr/v)                                               |
| `s.11.momentum~one-after`             | 1    | `collision` type `general`: both after-velocities given, each cart's KE                                  |
| `s.11.momentum~impulse`               | 2    | Impulse picture: force–time rectangle with area Δp, a slower stop beside                                 |
| `s.11.work-energy-power~work`         | 6    | `freeBody` displacement bracket and the dashed F cos θ component                                         |
| `s.11.work-energy-power~power`        | 7    | Power picture: a mass lifted h in time t, a timer and a J/s bar                                          |
| `s.11.thermodynamics~first-law`       | 8    | `gasPiston` energy option: Q in, W out as bands, a ΔU bar                                                |
| `s.11.electrostatics~plates`          | 10   | `charges` mode `plates`: two plates, a uniform field, a charge and its force                             |
| `s.11.modern-physics~photoelectric`   | 11   | Photoelectric picture: light on a plate, electrons out with K_max                                        |
| `s.11.modern-physics~relativity`      | 12   | Relativity light clock (a moving clock's diagonal path, γ)                                               |
| `s.11.electromagnetism~moving-charge` | —    | `induction` force mode with a moving charge in place of the wire (F = qvB sin θ; from the lesson review) |

Built although the plan marked them ⏳: `s.11.thermodynamics` (need 14; the calorimeter picture
is unit-agnostic, so the page works in kg with `units: ['kg']`; only the g ↔ kg menu waits) and
`s.11.kinematics-1d~free-fall` (need 4; the plan allows shipping the horizontal strip first).
Need 9 is confirmed: `heatingCurve` spans take variables (used on `~latent-heat`).

The question data moves in the plan's Decisions (`research/questions/`) are outside this build's
files and are not done.

## Changed from the plan

- **Examples with a zero.** `modules.test.ts` rejects a zero example value on a variable with a
  unit, so:
  - `~braking`: 25 m/s to 5 m/s at −5 m/s² → Δx = 60 m, t = 4 s (a stop, v = 0, is typed);
  - `~position-graph`: x₀ = 10 m, so x₁ = 5 m; the graph also shows its own time span
    (t = 8 s, v = 10 m/s), which the picture needs;
  - `s.11.kinematics-2d`: h = 1.5 m → T = 2.18 s, R = 37.8 m, H = 6.60 m (h = 0 is typed);
  - `s.11.momentum`: 2 kg at 3 m/s meets 1 kg at −3 m/s → p = 3 kg·m/s, v′ = 1 m/s,
    13.5 J → 1.5 J;
  - `~elastic`: 1 kg at 4 m/s meets 3 kg at −2 m/s → v₁′ = −5 m/s, v₂′ = 1 m/s, 14 J both;
  - `~explode`: the carts start at rest, drawn as `before: [0]` with no velocity value;
  - `~spring`: the example is 0.5 m up the ramp (K = 1.05 J); the highest point (0.714 m) is
    found by typing K = 0, since a separate value would make 11.
- **`~series`** draws `seriesCircuit` (each resistor with its voltage drop), not the bulb
  `circuit`, which can't show V₁ and V₂; two resistors.
- **`~power`**: time in s (7200 s for 2 h) and energy in J (432,000 J).
- **`~latent-heat`**: melting (334 kJ/kg) and boiling (2260 kJ/kg) are separate values, not one
  L with two allowed values, so the heating curve's melt, warm and boil spans all come from
  Q ÷ P (ice from 0 °C): 334 s, 418 s, 2260 s for the plan's 0.5 kg and 500 W.
- **`~free-fall`**: `motionGraph` needs an acceleration value, so a = −9.8 m/s² is a worked-out
  value; the drop d is labeled under the picture (the graph's area is the signed displacement).
- **`~cliff`**: `projectile` needs an angle value: θ = 0° is a fixed, standalone value.
- **`~turn`**: the distance is (v₀² + v²) ÷ (−2a) with a ≤ −0.1 on the page (the harness misread
  |a|).
- **`~force-sum`**: the angle of F₂ is 0–90° (the direction is arctan of north over east).
- **`~sound-level`**: `powerScale` needs the number in front and the power of ten, so the page
  has 5 values (both worked out, not typed).
- **`~field`**: E is signed (− toward the charge), as the demo draws it, not k|q|/r².
- **`s.11.modern-physics`**: E in eV is typed; the energy in joules is worked out only.
- **`s.11.electromagnetism`** ranges: ΔΦ 0.0001–1 Wb, Δt 0.001–10 s, emf 0.1–1000 V (N 1–10⁴
  as planned). With four values in one product, any two typed must leave room for the other
  two; that needs ranges equally wide in powers of ten.
- Kinematics times start at 0.01 s: at t = 0 the displacement is left undetermined.
- `~pogo-energy`: the still instant at the top has a span of 0 s; one bounce is 1.2 s.

## Lesson review fixes (`.review/hs-s.11/lesson-report.md`)

All 19 errors and 31 improvements are fixed in these files, except as listed here.

- **Changed differently.**
  - `~gravitation` and the Coulomb pages keep the constant as a number in the rule line: the
    rule line is also the check line, and a letter G or k there can't be evaluated. The how names
    G (k), and work lines give m₁m₂ (q₁q₂ in C) and r² before the answer.
  - `~double-slit` keeps nm and mm with the conversion in the rule (no nm unit in the registry);
    the step is written in meters with work lines "633 nm = 6.33 × 10⁻⁷ m" and Δy in m.
  - `~doppler` moving listener: noted in the assumption (f(v + v_L)/v), no listener value.
  - `electromagnetism` flux from B and A: a new page `~flux-change` (N, B₁, B₂, A, Δt; ΔΦ and
    emf worked out), not three more values on the main page, whose ranges are balanced for four.
  - `thermodynamics` main: the balance m_w c_w(T_f − T_w) = mₘcₘ(Tₘ − T_f) is now the rule line,
    so it comes before the rearranged T_f line.
  - `~parallel` sum of reciprocals: a work line "1/R = 0.025 + 0.01667 + 0.008333 = 0.05".
  - `~force-sum` direction: the rule is tan φ = F_y/Fₓ (the check reads right for φ > 90°); the
    step writes 180 + arctan(F_y/Fₓ) when Fₓ < 0.
- **Near-singular differences** (harness errors): calorimeter checks |Tₘ − T_f| ≥ 0.5 °C and
  |T_f − T_w| ≥ 0.1 °C with messages; lens and mirror |m| ≤ 100 (and dₒ ≥ 1 cm).
- **Symbols that were expressions**: `log I` → L (`~sound-level`), `sin θ₂` → s (`~refraction`,
  `~critical`).
- **Also renamed**: IMA on `~pulley` and `~ramp`; names without a bracketed gloss (Velocity,
  Period, Force, Field).
- **Picture-only values hidden**: `~free-fall` a, `~cliff` θ, `~position-graph` v,
  `~sound-level` a and n.
- **Not done here (engine or harness)**: E8 (Carnot capitals), E10 (1/(1/15) brackets), the
  `~diverging`/`~convex` near-cancelling 1/(1/1 + 1/(−0.994)) at dₒ = 1 cm (deep run, ×1 each),
  `~refraction` θ₂ = 90 drawn as 89.9999 (harness tolerance), `circular-gravitation` F = 0.01
  drawn as 0.0063 (deep run ×1; no lesson cause found), the kinematics quadratic walkthrough,
  "1 × 10⁰".

## Shared needs found while building

- **Engine, `affineOf` (`src/engine/solve.ts`).** A product whose residual is dwarfed by a
  huge constant (f·λ − 3 × 10¹⁷) or shrunk by a tiny one (f·λ·10⁻⁹ ÷ 3 × 10⁸ − 1) probes as
  affine at the small probe points, so `outOfReach` and the harness call every input
  impossible. Written here as λ − 3 × 10¹⁷ ÷ f. Probing at values scaled to each variable's
  range would fix it for every page (the app's "can never be completed" note uses it too).
- **Engine, `holds`.** A relation is checked by its first rearrangement with a tolerance of
  about 10⁻⁹ × (1 + |value|), so values near 10⁻¹⁹ (a photon's joules) always pass. Here the
  large-valued rearrangement is listed first; a relative tolerance for `scientific` values would
  make the order not matter.
- **Harness, `evaluate.ts`.** `a/b²` without brackets is misread (`60/0.5²` ≠ 240): write
  `a/(b²)`. Worth fixing in the evaluator or checking in the tests.
- **Pictures.** `motionGraph.acceleration` and `projectile.angle` could take a number, so free
  fall and a level launch need no fixed value. `collision` `energy` takes only [before, after]
  values, so an explode from rest can't name its spring energy in the picture. The calorimeter
  spec's docs say g and J/(g·°C); it works in any consistent units (need 14 is only the menu).
- **Gallery helper.** The group HK `rule` helper has no way to say "never worked out from this
  relation" (the Grade 9–12 `R` helpers' `null`); this grade's copy adds it.
- **Engine, from the lesson review.** A named constant in a rule line (G, k, h) that the check
  line substitutes (`~gravitation`, `electrostatics`, `~field`, `modern-physics`); an nm unit and
  a page default shown unit, so λ and d can be SI in the relation (`~double-slit`,
  `modern-physics`); more digits carried into a near-cancelling sum (`~diverging`, `~convex`);
  a quadratic-formula step for t from Δx, v₀ and a (`s.11.kinematics-1d`).
- **Picture.** `induction` force mode with a moving charge (q, v) in place of the wire, for
  `s.11.electromagnetism~moving-charge`.

## Added skills (rotation, oscillations, electric potential)

Built from the plan's "Added skills" section (`docs/plans/s.11.md`, skills 14–16), in its order.
Every page passes `MODULE_IDS=<skill> npx jest --maxWorkers=1 src/data/modules` and the deep run
(`SAMPLES=100 SEQUENCES=15 UNIT_CASES=10`).

### Built: 12 pages, all calculators

| Skill                     | Pages | Which                                                                 |
| ------------------------- | ----- | --------------------------------------------------------------------- |
| `s.11.rotation`           | 5     | main, seesaw, angular-speed, angular-acceleration, rotational-inertia |
| `s.11.oscillations`       | 3     | main, hooke, pendulum                                                 |
| `s.11.electric-potential` | 4     | main, voltage-energy, capacitor, parallel-plate                       |

No new step-text phrases: `harness/phrasesS11.ts` stays empty. The new fixed unit labels (N·m,
rpm, rad, rad/s, rad/s², kg·m², e, μF, pF, pC) are in `src/engine/__tests__/units.test.ts`'s
`fixed` list, as the brief says.

### Waiting

None of the added pages. The field between two plates (E = ΔV/d, F = qE) stays with
`s.11.electrostatics~plates`, waiting on need 10.

### Changed from the plan

- **Unit menus off on the graph pages.** `functionGraph` reads its values in their shown units,
  so a period in ms (or a force in kN, a stretch in cm) put the drawn curve out of step with the
  numbers: the main page's period is in s only, `~hooke`'s force in N and stretch in m.
- **`~voltage-energy`:** the mass is one of the two allowed values (electron, proton) and is never
  worked out from the speed; the speed stops at 3 × 10⁷ m/s (a tenth of light's), where the
  non-relativistic K = ½mv² ends. The eV → J change is a work line, not a separate value.
- **Period steps** show the square root first as a work line (√(0.0025) = 0.05).
- **Use lines:** "2 m", not "2.0 m" (the copy editor's trailing .0 rule).

### Shared needs (pictures), found while building

Each page uses the nearest existing picture or a `table` until these exist:

- `torque` (new kind): a wrench or door on its pivot, the lever arm r, the force F at θ, its
  across-the-arm part F⊥ dashed and τ = rF⊥; values r, F, θ (F⊥, τ) — `s.11.rotation` (now a
  `vectorDiagram` of F with its components).
- `simpleMachine` lever option `seesaw`: a weight on each side named F₁ and F₂ (not load and
  effort), the two torques and the pivot's push F_p up; values F₁, d₁, F₂, d₂, τ, F_p —
  `s.11.rotation~seesaw`.
- `rotor` (new kind): a hoop, disk or solid ball turning about its center, ω as a curved arrow,
  the angle swept counted in turns, I = cmr² and τ = Iα; values c, m, r, τ, α (ω₀, ω, t, Δθ, n) —
  `~rotational-inertia` (now a `table` by shape), `~angular-acceleration` (now an ω–t graph),
  `~angular-speed` (now `circularMotion` string).
- `oscillator` (new kind): a mass on a spring at x beside its x–t trace, the rest line, ±A, v_max
  through the middle and bars for ½kx² and ½mv²; values m, k, A (T, ω, v_max, E) —
  `s.11.oscillations` (now the x–t cosine alone); a hanging option stretched by x under mg for
  `~hooke` (now the F–x line).
- `pendulum` (a length-driven option of `energyTrack`'s pendulum, or a new kind): a bob on a
  string of length L to scale, a small swing, T and the g it swings in; values L, g, T —
  `~pendulum` (now a `table` of T by L).
- `charges` mode `plates` (need 10) with a charge let go at one plate: it crosses ΔV, gains K in
  eV and reaches speed v; values q, ΔV, m, v — `~voltage-energy` (now a `table` of v by ΔV).
- `capacitor` (new kind): two plates of area A a gap d apart, an optional dielectric slab κ, a
  battery V, +Q and −Q on the plates, the field between and an energy bar ½CV²; values C (or κ,
  A, d), V, Q, U — `~capacitor`, `~parallel-plate` (now `table`s).
- `charges` option `equipotentials`: circles of equal V round a point charge, V = kq/r labelled at
  r, a second charge q₀ with its U; values q, r, V, q₀, U — `s.11.electric-potential` (now the
  charge and its field lines).

### Lesson review of the added skills

Report: `.review/new-sci/lesson-report.md`. Fixed:

- ~seesaw: the plank is light and pivoted at its middle (the old "weight acts at the pivot"
  contradicted F_p = F₁ + F₂); τ is "Torque on each side".
- ~angular-speed: the use line says "a wheel of radius 0.30 m"; a work line "ω = 4π"; v to 2,000
  m/s.
- ~angular-acceleration: n is "Net turns", with a limit that ω₀ and ω share a sign ("The wheel
  turns back partway…"); t from Δθ, ω₀ and α by the quadratic (no numeric step). The "1 × 16"
  after ½ × 2 is the engine's simplifier (shared needs).
- ~rotational-inertia: a hollow ball (c = ⅔) in the allowed list, the table and the assumption.
- Main: the example stores p 40 and τ 10.
- Oscillations: k from E = ½kA² and k, x from U = ½kx² (no "Try numbers"); the period step shows
  "T = 2π × 0.05 = 0.1π"; ω = √(k/m) comes before ω = 2π/T (ω = √400 = 20, not 2π/0.3142);
  the step for L or m shows T ÷ 2π and its square.
- ~voltage-energy: changed from the report. A limit on v (or on K and m) made the solver drop
  the student's typed electron as the older input and search the proton in its place, the very
  swap the report found. The page now keeps v's range wide enough for both particles (3 × 10⁹
  m/s), so the search never finds a single mass, and a note after v says when it passes a tenth
  of light's speed, or light's itself ("faster than light, which is impossible…"). The swap is
  gone from the samples except odd unit cases (m typed in g or t), listed below.
- Main: the q step's how says why 8.99 × 10³ gives μC; work numbers from 1,000 to 9,999 have a
  separator ("−1,000 μC").
- ~capacitor: a work line "U = ½ × 4.7 × 10⁻⁴ × 81" and U to 5 significant figures (0.019035 J).
- ~parallel-plate: E "Field between the plates" (V/m), E = V ÷ (d × 10⁻³); the use line asks for
  it. The field page `s.11.electrostatics~plates` still waits on need 10 for the picture.
- Not done (engine): the unit-change work lines ("q = 4 μC = 4 × 10⁻⁶ C", "K = 100 eV × …")
  still print after the substituted line; `StepText` has no lines before it. The q step's
  10ⁿ rewriting lines are the engine's.

### Shared needs (lesson review of the added skills)

- **Engine: a `null` solve part is still filled by the whole-number search** (an `allowed` mass),
  and a limit on a newer value drops an older allowed input instead of refusing the newer one.
  Then `~voltage-energy` could refuse speeds past 3 × 10⁷ m/s.
- **Engine: work lines before the substituted line** (unit changes first), for the main page and
  `~voltage-energy`.
- **Engine: simplify "1 × 16"** after ½ × 2 (`~angular-acceleration`).

### Outside these files

`pictureRequests.test.ts` (H49, `s.10.reaction-types~combustion`) and `units.test.ts` (five
`s.10` labels) fail on the branch as it came to this build; neither is from these pages.
