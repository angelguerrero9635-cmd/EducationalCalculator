# Build notes: science grade 11 (physics)

Built from `.review/plans/s.11/plan.md` in its priority order: the calculators with drawn demos
first, then the layout pages. Every page passes `MODULE_IDS=s.11. pnpm test src/data/modules`.

## Built: 64 pages (56 calculators, 8 layouts)

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
| `s.11.electromagnetism`     | 5     | main, force, transformer; sort motor-generator; explore magnet-poles                     |
| `s.11.modern-physics`       | 2     | main, hydrogen-lines                                                                     |

No new step-text phrases were needed: `harness/phrasesS11.ts` stays empty.

## Waiting: 10 pages

| Page                                 | Need | What it waits on                                                             |
| ------------------------------------ | ---- | ---------------------------------------------------------------------------- |
| `s.11.kinematics-1d~motion-diagrams` | 5    | Card figure `strobe` (dots every second with a gap pattern and direction)    |
| `s.11.circular-gravitation~orbit`    | 3    | `circularMotion` mode `satellite` (v = √(GM/r), T = 2πr/v)                   |
| `s.11.momentum~one-after`            | 1    | `collision` type `general`: both after-velocities given, each cart's KE      |
| `s.11.momentum~impulse`              | 2    | Impulse picture: force–time rectangle with area Δp, a slower stop beside     |
| `s.11.work-energy-power~work`        | 6    | `freeBody` displacement bracket and the dashed F cos θ component             |
| `s.11.work-energy-power~power`       | 7    | Power picture: a mass lifted h in time t, a timer and a J/s bar              |
| `s.11.thermodynamics~first-law`      | 8    | `gasPiston` energy option: Q in, W out as bands, a ΔU bar                    |
| `s.11.electrostatics~plates`         | 10   | `charges` mode `plates`: two plates, a uniform field, a charge and its force |
| `s.11.modern-physics~photoelectric`  | 11   | Photoelectric picture: light on a plate, electrons out with K_max            |
| `s.11.modern-physics~relativity`     | 12   | Relativity light clock (a moving clock's diagonal path, γ)                   |

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
