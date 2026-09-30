# Direction plan: science grade 11 (physics, 13 skills)

Written from `brief.md`, `questions.md`, `docs/MODULE_GUIDE.md` ("Standards"), `docs/LAYOUTS.md`,
`docs/EQUATION_INPUTS.md` and the textbook lesson lists in `research/textbooks/grades/11.md`. Every
example below is original and was worked by hand; nothing is copied from `research/`.

## Decisions

- **Notation.** Standard physics symbols with the name first on every value ("Initial velocity
  (v₀)", "Net force (F_net)"), Unicode subscripts where the font has them (v₀, vₓ, Qₕ), SI
  units, sentences ≤ 35 words, ≤ 10 values a page. g = 9.8 m/s² (the drawn pictures use it);
  k = 8.99 × 10⁹ N·m²/C², G = 6.674 × 10⁻¹¹ N·m²/kg², h = 6.626 × 10⁻³⁴ J·s, c = 3.00 × 10⁸ m/s,
  hc = 1240 eV·nm. Velocities, forces along a line and charges are signed (+ right, up, or
  repel); the assumption line says which way is +.
- **Rows vs equation.** Physics formulas whose units change stay rows. One page takes an
  `equation`: `s.11.circuits` uses `{V:unit} = {I:unit} × {R:unit}` (H87, SI only), as the
  Grades 9–12 table in `docs/EQUATION_INPUTS.md` lists.
- **Layouts (9 pages).** Sorts: `s.11.kinematics-1d~motion-diagrams`, `s.11.dynamics-vectors~balanced`,
  `s.11.thermodynamics~laws`, `s.11.sound-waves~wave-types`, `s.11.optics~wave-behaviors`,
  `s.11.electrostatics~charging`, `s.11.electromagnetism~motor-generator`. Sequence:
  `s.11.work-energy-power~pogo-energy`. Explore: `s.11.electromagnetism~magnet-poles` (the
  Grade 8 `magnets` figure with `field` and `compasses`). Every main page is a calculator.
- **Pilots.** None: `pilots.ts` has no `s.11.` page; the grade file `src/data/modules/science/11.ts`
  is new. Start each page with `node scripts/promote-demo.mjs <demo> <id>` where a demo is named.
- **Grade 8 kinds reused.** `wave` (plain), `circuit` (series, parallel), `energyTrack`
  (coaster), `heatingCurve` (`g.heating-curve`), `powerScale`, and the Grade 10 `energyProfile`
  calorimeter (`g.s10-thermochemistry-calorimeter`); each is unchanged.
- **Question data** (for `research/questions/`): MCAS-2026-HSPHY-#1, #6, #25 and NAEP-2005-12S11-#5
  are 1-D motion → `s.11.kinematics-1d` (filed under kinematics-2d). MCAS-2026-HSPHY-#5 and #11
  → `s.11.electrostatics` (filed under electromagnetism). NAEP-2000-12S9 #5, #6, #7, #8, #10, #14
  (planet table, Kepler, the solar-system model) → `s.12.solar-system`; #9 (orbital speed from
  radius and period) stays here.
- **Page count:** 13 main + 61 problem types = **74 pages** (65 calculators, 9 layouts); 12 wait
  on an engine or picture need (marked ⏳).

### 1. s.11.kinematics-1d — Motion in one dimension: displacement, velocity and acceleration

- **Standard:** HS-PS2-1 (motion data); CCSS HSF-IF.B.6 (rate of change on a graph).
- **Textbooks:** OpenStax Physics 2 (2.1–2.4), 3 (3.1–3.2); Glencoe 2, 3, 4; Savvas Experience 1.1–1.2.
- **Tests ask:**

  | Question                                    | Page                   | Mark                                          |
  | ------------------------------------------- | ---------------------- | --------------------------------------------- |
  | MCAS-2026-HSPHY-#1 (v from v₀, a, t)        | main                   | Solves                                        |
  | MCAS-2026-HSPHY-#6 (which Δx equation)      | main                   | Solves                                        |
  | MCAS-2026-HSPHY-#25 (drop height from time) | ~free-fall             | Solves (19.6 m, the choice 20 m; see need 13) |
  | NAEP-2005-12S11-#5 (strobe runners)         | ~motion-diagrams       | Solves once need 5 lands; main's strip Partly |
  | common: stopping distance with no time      | ~braking               | Solves                                        |
  | common: slope of x–t graph, turnaround      | ~position-graph, ~turn | Solves                                        |

- **Main — BUILD `s.11.kinematics-1d`:** `motionGraph` velocity view, demo `g.s11-kinematics-1d-velocity`
  (graph: "speed", kinematics: { view: "velocity" }). Values: initial velocity v₀ (−100 to 100 m/s),
  acceleration a (−50 to 50 m/s²), time t (0 to 120 s), final velocity v (−500 to 500 m/s),
  displacement Δx (−10⁵ to 10⁵ m). Relations: v = v₀ + at; Δx = v₀t + ½at². Assumptions: the
  acceleration is constant the whole time; + is the direction of the start, so a slowing object has
  a < 0; displacement is where it ends up, not how far it went; shaded area under v–t is Δx. Example:
  v₀ = 4 m/s, a = 2.5 m/s², t = 6 s → v = 4 + 15 = 19 m/s, Δx = 24 + 45 = 69 m (check (4 + 19)/2 × 6 = 69).
  startWith v₀, a, t.
- **~free-fall — BUILD:** `motionGraph` velocity view (demo `g.s11-kinematics-1d-velocity`, start 0,
  acceleration fixed −9.8; ⏳ need 4 for a vertical strip). Values: time t (0–30 s), velocity v
  (derived sign: down), drop d (0–5000 m). Relations: v = −gt; d = ½gt². Assumptions: dropped from
  rest; air resistance ignored; mass doesn't matter. Example: t = 3 s → v = −29.4 m/s, d = 44.1 m.
  startWith t. Use line: "Use this for 'A stone falls from rest for 3 s. How far does it fall?'"
- **~braking — BUILD:** `motionGraph`, demo `g.s11-kinematics-1d-braking`. Values v₀, v, a, Δx, t.
  Relations: v² = v₀² + 2aΔx; v = v₀ + at. Example: 25 m/s to 0 at −5 m/s² → Δx = 625 ÷ 10 = 62.5 m,
  t = 5 s. startWith v₀, v, a.
- **~position-graph — BUILD:** `motionGraph` position view, demo `g.s11-kinematics-1d-tangent`.
  Values: x₀, v₀, a, tangent time t₁, slope v₁, position x₁. Relations: x₁ = x₀ + v₀t₁ + ½at₁²;
  v₁ = v₀ + at₁. Example: x₀ = 0, v₀ = −6 m/s, a = 2 m/s², t₁ = 5 s → v₁ = 4 m/s, x₁ = −30 + 25 = −5 m.
  startWith v₀, a, t₁.
- **~turn — BUILD:** `motionGraph` velocity view, demo `g.s11-kinematics-1d-turn`. Values v₀, a, t, v,
  Δx, distance (derived; v₀ and v opposite signs, assumption says so). Relations: main's two plus
  distance = (v₀² + v²) ÷ (2|a|). Example: v₀ = 12 m/s, a = −4 m/s², t = 5 s → v = −8 m/s,
  Δx = 10 m, turns at 3 s after 18 m, comes back 8 m, distance 26 m.
- **~motion-diagrams — BUILD (sort, ⏳ need 5):** bins "Constant velocity", "Speeding up",
  "Slowing down"; cards (strobe figure, dots every second): even gaps 2 m; gaps 1, 3, 5, 7 m; gaps
  8, 6, 4, 2 m; even gaps 5 m leftward; gaps growing leftward; a ball rolling up a ramp (shrinking
  gaps). Sentence: "Equal gaps in equal times mean constant velocity."
- **Verdict:** 6 pages; 3 of 4 released items Solve, the strobe item waits on a card figure.

### 2. s.11.kinematics-2d — Motion in two dimensions: vectors and projectile motion

- **Standard:** HS-PS2-1; CCSS HSN-VM.A.1–3 (vector components).
- **Textbooks:** OpenStax Physics 5.1–5.3; Glencoe 6; HMH Dimensions 1.2; Savvas 1.3; OpenSciEd P.4.
- **Tests ask:** its four filed items are 1-D (moved above). Common types:

  | Question type                           | Page        | Mark   |
  | --------------------------------------- | ----------- | ------ |
  | range and flight time on level ground   | main        | Solves |
  | maximum height                          | main        | Solves |
  | ball rolled off a table or cliff        | ~cliff      | Solves |
  | boat crossing a river, drift downstream | ~boat       | Solves |
  | components of a velocity                | ~components | Solves |

- **Main — BUILD `s.11.kinematics-2d`:** `projectile`, demo `g.s11-kinematics-2d-level`
  (speed "v", angle "q", height "h", vx, vy, time, range, peak). Values: launch speed v₀ (0–150 m/s),
  angle θ (0–90°), launch height h (0–500 m), vₓ, v_y (derived), flight time T, range R, peak height H.
  Relations: vₓ = v₀ cos θ; v_y = v₀ sin θ; T = (v_y + √(v_y² + 2gh)) ÷ g; R = vₓT; H = h + v_y² ÷ (2g).
  Assumptions: no air resistance; vₓ stays the same, v_y drops 9.8 m/s each second; it lands on level
  ground below the launch. Example: v₀ = 20 m/s, θ = 30°, h = 0 → vₓ = 17.32 m/s, v_y = 10 m/s,
  T = 2.04 s, R = 35.3 m, H = 5.10 m. startWith v₀, θ, h.
- **~cliff — BUILD:** `projectile`, demo `g.s11-kinematics-2d-cliff`, angle fixed 0. Values v₀, h, T, R.
  Relations: T = √(2h ÷ g); R = v₀T. Example: 8 m/s off a 45 m ledge → T = 3.03 s, R = 24.2 m.
- **~boat — BUILD:** `vectorDiagram`, demo `g.s11-kinematics-2d-boat` (tipToTail, unit m/s, axes
  east/north). Values: boat speed (4 m/s north), current (3 m/s east), resultant speed, direction
  (degrees from east), river width, crossing time, drift. Relations: resultant = √(b² + c²);
  direction = tan⁻¹(b ÷ c); time = width ÷ b; drift = c × time. Example: 5 m/s at 53.1°; 120 m wide
  → 30 s, drift 90 m.
- **~components — BUILD:** `vectorDiagram` one vector by magnitude and direction, `components: true`
  (start from `g.m12-vectors-magnitude-direction`, unit m/s). Values speed, angle, vₓ, v_y. Example:
  15 m/s at 40° → vₓ = 11.49 m/s, v_y = 9.64 m/s.
- **Verdict:** 4 pages; no released item belongs here, the five common types Solve.

### 3. s.11.dynamics-vectors — Forces and Newton's laws: friction, inclines and tension

- **Standard:** HS-PS2-1.
- **Textbooks:** OpenStax Physics 4.1–4.4, 5.4; Glencoe 4, 5; HMH 1.3; Savvas 2.1–2.3; OpenSciEd P.3.
- **Tests ask:**

  | Question                                                  | Page                       | Mark                           |
  | --------------------------------------------------------- | -------------------------- | ------------------------------ |
  | NAEP-2005-12S11-#4 (greatest a = F/m)                     | main (μ = 0)               | Solves                         |
  | NAEP-2009-12S10-#3 (10 N push, 2 N friction, 2 kg)        | main (type friction)       | Solves                         |
  | MCAS-2026-HSPHY-#27 (two pushers vs friction diagram)     | main                       | Solves                         |
  | NAEP-2009-12S9-#16 (two dogs, resultant direction)        | ~force-sum                 | Solves                         |
  | NAEP-2009-12S10-#1 (floating cork: upward force)          | ~balanced                  | Partly (names the upward push) |
  | common: block down an incline; rope at an angle; elevator | ~incline, ~rope, ~elevator | Solves                         |

- **Main — BUILD `s.11.dynamics-vectors`:** `freeBody` floor, demo `g.s11-dynamics-vectors-push`,
  moving "right". Values: mass m (0.1–5000 kg), applied force F (0–10⁵ N), coefficient μₖ (0–1.5),
  weight W, normal force F_N (derived), friction f, net force F_net, acceleration a. Relations:
  W = mg; F_N = W; f = μₖF_N; F_net = F − f; a = F_net ÷ m. Assumptions: the push is level; the
  block is already sliding so friction is kinetic; friction points against the motion. Example:
  20 kg, 120 N, μₖ = 0.3 → W = 196 N, f = 58.8 N, F_net = 61.2 N, a = 3.06 m/s². startWith m, F, μₖ.
- **~incline — BUILD:** `freeBody` incline, demo `g.s11-dynamics-vectors-incline`, moving "down".
  Values m, θ (0–89°), W, along (W sin θ), F_N (W cos θ), μₖ, f, F_net, a. Example: 5 kg, 30°,
  μₖ = 0.2 → 24.5 N along, F_N = 42.4 N, f = 8.49 N, F_net = 16.0 N, a = 3.20 m/s².
- **~rope — BUILD:** `freeBody` floor with tension, demo `g.s11-dynamics-vectors-rope`. Values m, T,
  angle α, μₖ, F_N, f, F_net, a. Relations: F_N = mg − T sin α; F_net = T cos α − μₖF_N. Example:
  10 kg sled, 50 N at 30°, μₖ = 0.1 → F_N = 73 N, f = 7.3 N, F_net = 36.0 N, a = 3.60 m/s².
- **~elevator — BUILD:** `freeBody` hanging, demo `g.s11-dynamics-vectors-elevator`. Values m, a
  (signed, + up), W, tension T, F_net. Relations: F_net = ma; T = W + ma. Example: 3 kg lamp,
  a = 2 m/s² up → W = 29.4 N, T = 35.4 N.
- **~force-sum — BUILD:** `vectorDiagram` parallelogram, demo `g.s11-dynamics-vectors-forces`
  (unit N). Values F₁, F₂, angle of F₂, resultant F, its direction, mass, a. Example: 60 N east,
  80 N north → 100 N at 53.1°; 25 kg → 4 m/s².
- **~balanced — BUILD (sort):** bins "Net force zero", "Net force not zero". Cards: cork floating
  still; book resting on a desk; car at a steady 25 m/s on a straight road; skydiver at terminal
  speed; crate speeding up; ball at the top of its flight; car turning a corner at steady speed.
  Sentence: "Zero net force means constant velocity, not zero speed."
- **Verdict:** 6 pages; 4 of 5 released items Solve, the buoyancy item Partly.

### 4. s.11.circular-gravitation — Circular motion and universal gravitation

- **Standard:** HS-PS2-4; HS-ESS1-4.
- **Textbooks:** OpenStax Physics 6.1–6.2, 7.1–7.2; Glencoe 6, 7, 8; HMH 3.1; Savvas 3.1–3.3; OpenSciEd P.4.
- **Tests ask:**

  | Question                                                                     | Page                               | Mark               |
  | ---------------------------------------------------------------------------- | ---------------------------------- | ------------------ |
  | NAEP-2009-12S9-#13 (twice as far → ¼)                                        | ~gravitation                       | Solves             |
  | MCAS-2026-HSPHY-#5 (both forces weaken with distance)                        | ~gravitation + electrostatics main | Solves             |
  | NAEP-2000-12S9-#9 (planet speed from r and T)                                | ~orbit                             | Solves (⏳ need 3) |
  | NAEP-2000-12S9-#5, #6, #7, #8, #10, #14                                      | s.12.solar-system (data move)      | No here            |
  | common: centripetal force on a string; car on a curve; tension at the bottom | main, ~car, ~swing                 | Solves             |

- **Main — BUILD `s.11.circular-gravitation`:** `circularMotion` string, demo
  `g.s11-circular-gravitation-string`. Values radius r (0.01–10⁴ m), speed v (0–10⁴ m/s), mass m
  (0.001–10⁴ kg), centripetal acceleration a_c, force F_c, period T. Relations: a_c = v² ÷ r;
  F_c = mv² ÷ r; T = 2πr ÷ v. Assumptions: constant speed; the net force points to the center;
  let go, it moves straight along the tangent. Example: 0.5 kg, r = 1.2 m, v = 6 m/s → a_c = 30 m/s²,
  F_c = 15 N, T = 1.26 s. startWith m, r, v.
- **~car — BUILD:** `circularMotion` car, demo `g.s11-circular-gravitation-car`. Values m, r, v, F (friction
  needed), least μₛ. Relation: μₛ = v² ÷ (rg). Example: 1200 kg, r = 50 m, 15 m/s → 5400 N, μₛ ≥ 0.459.
- **~swing — BUILD:** `freeBody` hanging (the brief's bottom-of-swing case; start from
  `g.s11-dynamics-vectors-elevator`). Values m, v, r, W, T. Relation: T = m(g + v² ÷ r). Example:
  2 kg, 3 m/s, r = 1.5 m → T = 31.6 N.
- **~gravitation — BUILD:** `circularMotion` gravity, demo `g.s11-circular-gravitation-gravity`.
  Values m₁, m₂ (kg, 1–10³¹), distance r (m), force F. Relation: F = Gm₁m₂ ÷ r². Example: Earth
  5.97 × 10²⁴ kg, Moon 7.35 × 10²² kg, 3.84 × 10⁸ m → F = 1.99 × 10²⁰ N; doubling r gives ¼.
- **~orbit — BUILD (⏳ need 3):** values central mass M, orbit radius r, speed v, period T.
  Relations: v = √(GM ÷ r); T = 2πr ÷ v. Example: M = 5.97 × 10²⁴ kg, r = 7.0 × 10⁶ m →
  v = 7545 m/s, T = 5830 s (97.2 min). Second example in the use line: Earth, r = 1.496 × 10¹¹ m,
  T = 365.25 d → v = 29.8 km/s.
- **Verdict:** 5 pages; 3 released items Solve, 6 move to s.12.solar-system.

### 5. s.11.momentum — Momentum, impulse and collisions

- **Standard:** HS-PS2-2, HS-PS2-3.
- **Textbooks:** OpenStax Physics 8.1–8.3; Glencoe 9; HMH 2.1; Savvas 8.1–8.2; OpenSciEd P.3.
- **Tests ask:**

  | Question                                                 | Page                     | Mark                              |
  | -------------------------------------------------------- | ------------------------ | --------------------------------- |
  | MCAS-2026-HSPHY-#14 (Y's momentum after, from X's)       | ~one-after               | Solves (⏳ need 1)                |
  | MCAS-2026-HSPHY-#13 (X's kinetic energy fell, went to Y) | ~elastic, ~one-after     | Partly (KE per cart needs need 1) |
  | MCAS-2026-HSPHY-#33 (slower landing → less force)        | ~impulse                 | Solves (⏳ need 2)                |
  | common: carts stick; recoil; elastic bounce              | main, ~explode, ~elastic | Solves                            |

- **Main — BUILD `s.11.momentum`:** `collision` stick, demo `g.s11-momentum-stick`. Values m₁, m₂
  (0.01–10⁵ kg), v₁, v₂ (signed, −100 to 100 m/s), v′, total momentum p, KE before, KE after.
  Relations: p = m₁v₁ + m₂v₂; v′ = p ÷ (m₁ + m₂); KE before = ½m₁v₁² + ½m₂v₂²; KE after =
  ½(m₁ + m₂)v′². Assumptions: no outside push along the track; + is to the right; sticking loses
  kinetic energy but keeps momentum. Example: 2 kg at 3 m/s into 1 kg at rest → p = 6 kg·m/s,
  v′ = 2 m/s, 9 J → 6 J. startWith m₁, v₁, m₂, v₂.
- **~elastic — BUILD:** `collision` elastic, demo `g.s11-momentum-elastic`. Relations: v₁′ =
  ((m₁ − m₂)v₁ + 2m₂v₂) ÷ (m₁ + m₂); v₂′ = ((m₂ − m₁)v₂ + 2m₁v₁) ÷ (m₁ + m₂). Example: 1 kg at
  4 m/s into 3 kg at rest → v₁′ = −2 m/s, v₂′ = 2 m/s; 8 J before and after.
- **~explode — BUILD:** `collision` explode, demo `g.s11-momentum-explode`. Values m₁, m₂, v₁′, v₂′,
  energy from the spring. Example: 1.5 kg and 0.5 kg from rest, v₁′ = −1 m/s → v₂′ = 3 m/s, 3 J.
- **~one-after — BUILD (⏳ need 1):** values m₁, m₂, v₁, v₂, v₁′, v₂′, KE lost. Relation:
  m₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′. Example: 0.6 kg at 0.5 m/s into 0.4 kg at rest, v₁′ = 0.2 m/s →
  v₂′ = 0.45 m/s; 0.075 J → 0.0525 J.
- **~impulse — BUILD (⏳ need 2):** values m, v₀, v, Δp, Δt, average force F. Relations:
  Δp = m(v − v₀); F = Δp ÷ Δt. Example: 0.2 kg ball at 25 m/s stopped in 0.05 s → Δp = −5 kg·m/s,
  F = −100 N; from 15 m/s, −60 N.
- **Verdict:** 5 pages; 2 of 3 released items Solve once needs 1–2 land.

### 6. s.11.work-energy-power — Work, energy, power and simple machines

- **Standard:** HS-PS3-1, HS-PS3-2, HS-PS3-3.
- **Textbooks:** OpenStax Physics 9.1–9.3; Glencoe 10, 11; HMH 2.2; Savvas 7.1–7.3; OpenSciEd P.1.
- **Tests ask:**

  | Question                                                   | Page                           | Mark                     |
  | ---------------------------------------------------------- | ------------------------------ | ------------------------ |
  | NAEP-2009-12S10-#7, #8 (trampoline transfers)              | ~pogo-energy                   | Solves                   |
  | NAEP-2019-12S7-#4 (PE vs KE from four heights)             | main                           | Solves                   |
  | NAEP-2019-12S7-#5, #6 (improve the experiment; extra push) | —                              | No (inquiry, not a page) |
  | MCAS-2026-HSPHY-#28 (10 N lifted 5 m)                      | ~work                          | Solves                   |
  | MCAS-2026-HSPHY-#13                                        | s.11.momentum                  | cross-listed             |
  | common: power of a climber; lever, pulley, ramp effort     | ~power, ~lever, ~pulley, ~ramp | Solves                   |

- **Main — BUILD `s.11.work-energy-power`:** `energyTrack` coaster (Grade 8 kind, as on
  `s.8.kinetic-potential`). Values mass m (0.01–10⁴ kg), start height h₀ (0–500 m), height h,
  speed v, potential U, kinetic K, total E. Relations: E = mgh₀; U = mgh; K = E − U; K = ½mv².
  Assumptions: starts at rest; no friction or air resistance, so E stays the same; heights from the
  lowest point. Example: 0.25 kg from 8 m, at 3 m → E = 19.6 J, U = 7.35 J, K = 12.25 J, v = 9.90 m/s.
  startWith m, h₀, h.
- **~work — BUILD (⏳ need 6):** `freeBody` floor with applied and appliedAngle (demo
  `g.s11-dynamics-vectors-push`). Values F, angle θ, distance d, work W. Relation: W = Fd cos θ.
  Example: 40 N at 30° for 15 m → 520 J; θ = 0 reads the lift case.
- **~power — BUILD (⏳ need 7):** values m, height h, time t, work W, power P. Relations: W = mgh;
  P = W ÷ t. Example: 60 kg up 4.5 m of stairs in 6 s → 2646 J, 441 W.
- **~lever — BUILD:** `simpleMachine` lever, demo `g.s11-work-energy-power-lever`. Example: 600 N
  load, load arm 0.4 m, effort arm 1.6 m → MA 4, effort 150 N.
- **~pulley — BUILD:** `simpleMachine` pulley, demo `g.s11-work-energy-power-pulley`, efficiency
  (%). Example: 800 N, 4 strands, 80% → effort 250 N; pull 2 m to lift 0.5 m.
- **~ramp — BUILD:** `simpleMachine` incline, demo `g.s11-work-energy-power-ramp`. Example: 900 N
  crate, 3 m long, 1 m high → MA 3, effort 300 N.
- **~spring — BUILD:** `energyTrack` spring option, demo `g.s11-work-energy-power-spring`. Values k,
  x, stored, friction f, rough d, heat, m, highest point. Example: k = 400 N/m, x = 0.15 m → 4.5 J;
  2 N over 0.5 m → 1 J heat; 0.5 kg rises 0.714 m.
- **~pogo-energy — BUILD (sequence):** stages with spans: spring squeezed at the bottom, at rest
  (elastic, 0.1 s); spring pushes up (elastic → kinetic, 0.1 s); rising (kinetic → gravitational,
  0.45 s); top, still for an instant (all gravitational); falling (gravitational → kinetic, 0.45 s);
  landing squeezes the spring (kinetic → elastic, 0.1 s). A 1 m hop rises in √(2 ÷ 9.8) = 0.45 s.
- **Verdict:** 8 pages; 4 released items Solve, 2 inquiry items No.

### 7. s.11.thermodynamics — Thermal energy, heat and the laws of thermodynamics

- **Standard:** HS-PS3-1, HS-PS3-2, HS-PS3-4.
- **Textbooks:** OpenStax Physics 11.1–11.3, 12.1–12.4; Glencoe 12; HMH 2.3; Savvas 9.1–9.2.
- **Tests ask:** no released items. Common types:

  | Question type                                     | Page                   | Mark               |
  | ------------------------------------------------- | ---------------------- | ------------------ |
  | final temperature of hot metal in water           | main                   | Solves             |
  | heat to warm a mass by ΔT                         | ~specific-heat         | Solves             |
  | heat to melt or boil                              | ~latent-heat           | Solves             |
  | ΔU from heat and work                             | ~first-law             | Solves (⏳ need 8) |
  | engine efficiency, Carnot limit; refrigerator COP | ~engine, ~refrigerator | Solves             |
  | which law explains …                              | ~laws                  | Solves             |

- **Main — BUILD `s.11.thermodynamics`:** `energyProfile` calorimeter with `metal`
  (from `g.s10-thermochemistry-calorimeter`; ⏳ need 14 for kg). Values water mass, water start,
  metal mass, metal specific heat (allowed: aluminum 900, iron 450, copper 385 J/(kg·°C)), metal
  start, final temperature T_f, heat q. Relations: m_w c_w (T_f − T_w) = m_m c_m (T_m − T_f);
  q = m_w c_w (T_f − T_w); c_w = 4180 J/(kg·°C). Assumptions: no heat leaves the cup; both end at
  one temperature (thermal equilibrium); heat flows from hot to cold. Example: 0.150 kg aluminum at
  90 °C into 0.250 kg water at 20 °C → T_f = 28.0 °C, q = 8.37 kJ. startWith the five masses and
  starts.
- **~specific-heat — BUILD:** calorimeter without metal. Values m, c (allowed water, aluminum, iron,
  copper), T₁, T₂, ΔT, Q. Relation: Q = mcΔT. Example: 2 kg water 15 → 65 °C → 418 kJ.
- **~latent-heat — BUILD:** `heatingCurve`, demo `g.heating-curve`, melt span from Q ÷ P. Values m,
  L (allowed fusion 334 kJ/kg, vaporization 2260 kJ/kg), Q, heater power P, time t. Relations:
  Q = mL; t = Q ÷ P. Example: 0.5 kg ice at 0 °C → 167 kJ; a 500 W heater takes 334 s.
- **~first-law — BUILD (⏳ need 8):** `gasPiston` (from `g.s10-gas-laws-charles`). Values Q (in +),
  W (by the gas +), ΔU. Relation: ΔU = Q − W. Example: 500 J in, 200 J of work → ΔU = 300 J.
- **~engine — BUILD:** `heatEngine`, demos `g.s11-thermodynamics-engine`, `g.s11-thermodynamics-carnot`.
  Values Qₕ, W, Qₗ, efficiency e, Tₕ, Tₗ (K), Carnot limit. Relations: Qₕ = W + Qₗ; e = W ÷ Qₕ;
  e_Carnot = 1 − Tₗ ÷ Tₕ. Example: 2000 J in, 500 J out → Qₗ = 1500 J, e = 25%; 600 K and 300 K → 50%.
- **~refrigerator — BUILD:** `heatEngine` refrigerator, demo `g.s11-thermodynamics-refrigerator`.
  Example: removes 900 J with 300 J → Qₕ = 1200 J, COP 3; 270 K and 300 K → Carnot COP 9.
- **~laws — BUILD (sort):** bins "Zeroth law", "First law", "Second law". Cards: a thermometer
  reads the cup once they match (0); two blocks touching end at one temperature (0); a gas heated
  pushes a piston and warms less (1); squeezing a gas fast warms it (1); heat flows on its own from
  hot to cold (2); no engine turns all its heat into work (2); a refrigerator needs work to move
  heat out (2).
- **Verdict:** 7 pages; no released items, the six common types Solve.

### 8. s.11.sound-waves — Waves and sound: wave properties, standing waves and the Doppler effect

- **Standard:** HS-PS4-1.
- **Textbooks:** OpenStax Physics 13.1–13.3, 14.1–14.4; Glencoe 14, 15; HMH 5.1; Savvas 11.1–11.2.
- **Tests ask:**

  | Question                                               | Page                                                      | Mark                               |
  | ------------------------------------------------------ | --------------------------------------------------------- | ---------------------------------- |
  | NAEP-2005-12S11-#11 (louder → amplitude)               | main                                                      | Solves (assumption names loudness) |
  | NAEP-2005-12S11-#15 (f up → speed same, λ down)        | main                                                      | Solves (v kept)                    |
  | NAEP-2005-12S13-#1 (which distance is λ)               | main                                                      | Solves                             |
  | common: string harmonics; pipes; siren pitch; decibels | ~string, ~open-pipe, ~closed-pipe, ~doppler, ~sound-level | Solves                             |

- **Main — BUILD `s.11.sound-waves`:** `wave` (Grade 8 kind: amplitude, wavelength, frequency,
  extent). Values wave speed v (0.1–10⁴ m/s; the medium sets it), frequency f (0.1–10⁶ Hz),
  wavelength λ, period T, amplitude A. Relations: v = fλ; T = 1 ÷ f. Assumptions: the medium sets
  the speed, so a new frequency changes the wavelength; amplitude is loudness and doesn't change λ;
  sound in 20 °C air is 343 m/s. Example: 343 m/s, 440 Hz → λ = 0.780 m, T = 2.27 ms. startWith v, f.
- **~string — BUILD:** `wave` standing string, demo `g.s11-sound-waves-string`. Values L, v, n
  (whole, 1–10), λ, f. Relations: λ = 2L ÷ n; f = v ÷ λ. Example: 0.65 m, 286 m/s, n = 1 → λ = 1.30 m, f = 220 Hz.
- **~open-pipe — BUILD:** demo `g.s11-sound-waves-open-pipe`. λ = 2L ÷ n. Example: 0.50 m, n = 1 → 343 Hz.
- **~closed-pipe — BUILD:** demo `g.s11-sound-waves-closed-pipe`, n allowed [1, 3, 5, 7, 9].
  λ = 4L ÷ n. Example: 0.25 m → 343 Hz; n = 3 → 1029 Hz.
- **~doppler — BUILD:** `wave` doppler, demo `g.s11-sound-waves-doppler` (and `…-sonic-boom` at
  vₛ ≥ v). Values f, v, vₛ, f ahead, f behind. Relations: f′ = fv ÷ (v − vₛ) ahead, fv ÷ (v + vₛ)
  behind. Example: 700 Hz siren at 25 m/s → 755 Hz ahead, 652 Hz behind.
- **~sound-level — BUILD:** `powerScale` (Grade 8 kind; intensity on the 10ⁿ ruler). Values I
  (W/m², 10⁻¹² to 10²), level β (dB). Relation: β = 10 log(I ÷ 10⁻¹²). Example: 10⁻⁵ W/m² → 70 dB.
- **~wave-types — BUILD (sort):** bins "Transverse", "Longitudinal". Cards: sound in air; a
  plucked guitar string; light; a spring toy pushed and pulled along its length; ultrasound in the
  body; a rope shaken up and down; P waves in rock; S waves in rock.
- **Verdict:** 7 pages; all 3 released items Solve.

### 9. s.11.optics — Light: reflection, refraction, mirrors, lenses and interference

- **Standard:** HS-PS4-1, HS-PS4-3.
- **Textbooks:** OpenStax Physics 15.1–15.2, 16.1–16.3, 17.1–17.2; Glencoe 16–19; Savvas 11.3; OpenSciEd P.5.
- **Tests ask:**

  | Question                                                                   | Page                                                                      | Mark   |
  | -------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------ |
  | MCAS-2026-HSPHY-#24 (slits diffract; fringes are interference)             | ~wave-behaviors, ~double-slit                                             | Solves |
  | common: image from a lens or mirror; Snell; critical angle; fringe spacing | main, ~diverging, ~concave, ~convex, ~refraction, ~critical, ~double-slit | Solves |

- **Main — BUILD `s.11.optics`:** `rayDiagram` lens converging, demo `g.s11-optics-lens-real`
  (also shows `g.s11-optics-magnifier` when dₒ < f). Values focal length f (1–500 cm), object
  distance dₒ, image distance dᵢ, magnification m, object height hₒ, image height hᵢ. Relations:
  1 ÷ f = 1 ÷ dₒ + 1 ÷ dᵢ; m = −dᵢ ÷ dₒ; hᵢ = m hₒ. Assumptions: a thin lens; dᵢ < 0 is a virtual
  image on the object's side; m < 0 is upside down. Example: f = 10 cm, dₒ = 30 cm, hₒ = 4 cm →
  dᵢ = 15 cm, m = −0.5, hᵢ = −2 cm. startWith f, dₒ, hₒ.
- **~diverging — BUILD:** demo `g.s11-optics-diverging` (f negative). Example: f = −12 cm, dₒ = 24 cm → dᵢ = −8 cm, m = 0.33.
- **~concave — BUILD:** demo `g.s11-optics-concave`. Example: f = 15 cm, dₒ = 45 cm → dᵢ = 22.5 cm, m = −0.5.
- **~convex — BUILD:** demo `g.s11-optics-convex`. Example: f = −20 cm, dₒ = 30 cm → dᵢ = −12 cm, m = 0.4.
- **~refraction — BUILD:** `rayDiagram` refraction, demo `g.s11-optics-refraction`. Values n₁, n₂
  (1.00–2.42), θ₁, θ₂, speed in medium 2. Relations: n₁ sin θ₁ = n₂ sin θ₂; v₂ = c ÷ n₂. Step text
  writes n₁ ÷ n₂ × sin θ₁. Example: air to water, 40° → 28.9°, 2.26 × 10⁸ m/s.
- **~critical — BUILD:** demo `g.s11-optics-total-internal`. Relation: sin θc = n₂ ÷ n₁. Example: glass
  1.50 to air → 41.8°.
- **~double-slit — BUILD:** demo `g.s11-optics-double-slit`. Values λ (nm), d (mm), L (m), Δy (mm).
  Relation: Δy = λL ÷ d. Example: 633 nm, 0.25 mm, 2.0 m → 5.06 mm.
- **~wave-behaviors — BUILD (sort):** bins "Reflection", "Refraction", "Diffraction",
  "Interference". Cards: image in a bathroom mirror; echo off a cliff; straw looks bent in water;
  mirage over a hot road; sound heard round a corner; light spreading past a narrow slit; bands
  from two slits; colors on a soap film.
- **Verdict:** 8 pages; the released item Solves.

### 10. s.11.electrostatics — Static electricity: charge, Coulomb's law and electric fields

- **Standard:** HS-PS2-4, HS-PS3-5.
- **Textbooks:** OpenStax Physics 18.1–18.4; Glencoe 20, 21; Savvas 4.1–4.2.
- **Tests ask:** none filed; moved here:

  | Question                                                                         | Page                             | Mark                                       |
  | -------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------ |
  | MCAS-2026-HSPHY-#5 (weaker with distance)                                        | main                             | Solves                                     |
  | MCAS-2026-HSPHY-#11 (field strength at three points)                             | ~field                           | Partly (one charge; need 10b for a dipole) |
  | common: force between two charges; field of a charge; plates; how it got charged | main, ~field, ~plates, ~charging | Solves                                     |

- **Main — BUILD `s.11.electrostatics`:** `charges`, demos `g.s11-electrostatics-attract`, `…-repel`,
  `…-unequal`. Values q₁, q₂ (μC, −1000 to 1000), distance r (0.001–100 m), force F (signed: +
  repel). Relation: F = kq₁q₂ ÷ r². Assumptions: point charges; like charges repel; doubling r
  gives ¼ the force. Example: +3 μC and −5 μC, 0.20 m → F = −3.37 N (attract). startWith q₁, q₂, r.
- **~field — BUILD:** demo `g.s11-electrostatics-field`. Values q, r, E, test charge q₀, force on it.
  Relations: E = k|q| ÷ r²; F = q₀E. Example: +2 μC at 0.30 m → 2.00 × 10⁵ N/C.
- **~plates — BUILD (⏳ need 10):** values V, gap d, field E, charge q, force F. Relations: E = V ÷ d;
  F = qE. Example: 12 V across 3.0 mm → 4000 V/m; an electron feels 6.4 × 10⁻¹⁶ N.
- **~charging — BUILD (sort):** bins "Friction", "Conduction", "Induction". Cards: balloon rubbed on
  hair; socks on carpet; tape pulled off a roll; charged rod touched to a metal sphere; hand on a
  charged dome; charged rod held near a can pulls it without touching; sphere grounded while a rod
  is near, then the ground removed.
- **Verdict:** 4 pages; the moved items Solve or Partly.

### 11. s.11.circuits — Circuits: Ohm's law, series and parallel

- **Standard:** HS-PS3-1 (energy in circuits), HS-PS2-5 context; CCSS HSA-CED.A.4.
- **Textbooks:** OpenStax Physics 19.1–19.4; Glencoe 22, 23; HMH 4.1; Savvas 4.3, 10.2.
- **Tests ask:**

  | Question                                                            | Page      | Mark                             |
  | ------------------------------------------------------------------- | --------- | -------------------------------- |
  | MCAS-2026-HSPHY-#2 (add a cell to brighten)                         | ~series   | Solves (higher V, brighter bulb) |
  | MCAS-2026-HSPHY-#17 (which parallel resistor gives the new current) | ~parallel | Solves                           |
  | MCAS-2026-HSPHY-#32 (series drops in ratio)                         | ~series   | Solves                           |
  | MCAS-2026-HSPHY-#35 (ammeter reading)                               | ~series   | Solves                           |

- **Main — BUILD `s.11.circuits`:** equation `{V:unit} = {I:unit} × {R:unit}`, demo `g.s11-circuits-ohm`.
  Values V (0–10⁴ V), I (0–100 A), R (0.01–10⁶ Ω). Assumptions: the resistor keeps its resistance;
  V is across it and I through it. Example: 9 V = 0.45 A × 20 Ω. startWith V, R.
- **~series — BUILD:** `circuit` series, two or three resistors. Values V, R₁, R₂, I, V₁, V₂.
  Relations: R = R₁ + R₂; I = V ÷ R; V₁ = IR₁. Example: 12 V, 10 Ω and 20 Ω → 0.4 A, 4 V and 8 V.
- **~parallel — BUILD:** `circuit` parallel, three resistors with branches. Relations: 1 ÷ R =
  Σ 1 ÷ Rₙ; Iₙ = V ÷ Rₙ; I = ΣIₙ. Example: 24 V, 40, 60 and 120 Ω → 0.6 + 0.4 + 0.2 = 1.2 A, 20 Ω.
- **~mixed — BUILD:** `circuit` mixed seriesParallel, demo `g.s11-circuits-series-parallel`. Example:
  24 V, R₁ = 4 Ω, R₂ = 6 Ω ∥ R₃ = 12 Ω → 8 Ω, 3 A, V₁ = 12 V, I₂ = 2 A, I₃ = 1 A, 72 W.
- **~power — BUILD:** `circuit` series, one resistor. Values V, I, R, P, energy in time t. Relations:
  P = VI; P = I²R; E = Pt. Example: 120 V, 0.5 A → 60 W, 240 Ω; 2 h → 432 kJ.
- **Verdict:** 5 pages; all 4 released items Solve.

### 12. s.11.electromagnetism — Magnetic fields, magnetic forces and electromagnetic induction

- **Standard:** HS-PS2-5, HS-PS3-5.
- **Textbooks:** OpenStax Physics 20.1–20.3; Glencoe 24–26; HMH 3.2, 4.2; Savvas 5.1–5.3; OpenSciEd P.1.
- **Tests ask:**

  | Question                                                             | Page                            | Mark   |
  | -------------------------------------------------------------------- | ------------------------------- | ------ |
  | MCAS-2026-HSPHY-#8 (magnet turned: same size, reversed)              | ~magnet-poles                   | Solves |
  | MCAS-2026-HSPHY-#12 (generator: mechanical → electrical, changing B) | ~motor-generator, main          | Solves |
  | MCAS-2026-HSPHY-#36 (motor spins: current's field pushes magnets)    | ~motor-generator, ~force        | Partly |
  | MCAS-2026-HSPHY-#5, #11                                              | s.11.electrostatics (data move) | —      |

- **Main — BUILD `s.11.electromagnetism`:** `induction` coil, demos `g.s11-electromagnetism-coil`,
  `…-coil-out`. Values turns N (1–10⁴), flux change ΔΦ (Wb), time Δt (s), emf. Relation:
  emf = NΔΦ ÷ Δt. Assumptions: only a changing flux makes a current; the current's field opposes
  the change (Lenz), so pulling out swings the meter the other way. Example: 50 turns, 0.012 Wb
  in 0.2 s → 3 V. startWith N, ΔΦ, Δt.
- **~force — BUILD:** `induction` force, demos `g.s11-electromagnetism-force`, `…-force-angle`.
  Values B, I, L, θ, F. Relation: F = BIL sin θ (steps write F ÷ (sin θ × I × L)). Example:
  0.40 T, 5 A, 0.25 m, 90° → 0.5 N; 30° → 0.25 N.
- **~transformer — BUILD:** `induction` transformer, demos `g.s11-electromagnetism-transformer`,
  `…-step-up`. Relations: Vₛ = VₚNₛ ÷ Nₚ; Iₛ = IₚNₚ ÷ Nₛ. Example: 120 V, 400 → 20 turns, 0.1 A →
  6 V, 2 A (12 W both sides).
- **~motor-generator — BUILD (sort):** bins "Motor: electrical to motion", "Generator: motion to
  electrical". Cards: electric fan; blender; electric car driving; wind turbine; hand-crank
  flashlight; bike dynamo light; electric car braking to charge its battery.
- **~magnet-poles — BUILD (explore, `magnets` figure):** scenes: N facing N, pushing apart; one
  magnet turned so N faces S, pulling with the same size of force; `field` lines from N to S;
  `compasses` round one magnet (`single`) pointing along the lines.
- **Verdict:** 5 pages; 2 released items Solve, 1 Partly.

### 13. s.11.modern-physics — Modern physics: photons, atomic spectra and relativity

- **Standard:** HS-PS4-3, HS-PS4-4 (relativity is beyond NGSS; textbook only).
- **Textbooks:** OpenStax Physics 7.2, 10.1–10.2, 21.1–21.3, 22.1, 23.1; Glencoe 27, 28.
- **Tests ask:** no released items. Common types:

  | Question type                     | Page            | Mark                |
  | --------------------------------- | --------------- | ------------------- |
  | photon energy from λ or f         | main            | Solves              |
  | wavelength of a hydrogen line     | ~hydrogen-lines | Solves              |
  | photoelectron energy, threshold   | ~photoelectric  | Solves (⏳ need 11) |
  | time dilation, length contraction | ~relativity     | Solves (⏳ need 12) |

- **Main — BUILD `s.11.modern-physics`:** `spectrum` photon, demo `g.s11-modern-physics-photon`.
  Values wavelength λ (nm, 0.01–10⁶), frequency f (Hz), energy E (J), E (eV). Relations: c = fλ;
  E = hf; E(eV) = E ÷ 1.602 × 10⁻¹⁹. Assumptions: light comes in photons; a shorter wavelength
  means more energy per photon; brightness is the number of photons. Example: 532 nm → 5.64 × 10¹⁴ Hz,
  3.74 × 10⁻¹⁹ J, 2.33 eV. startWith λ.
- **~hydrogen-lines — BUILD:** `orbitalDiagram` ladder, demos `g.s11-modern-physics-lyman`,
  `g.s11-modern-physics-paschen`, `sliders: true`. Values upper n, lower n (whole, 1–8), E (eV),
  λ (nm). Relations: E = 13.6(1 ÷ l² − 1 ÷ u²); λ = 1240 ÷ E. Example: 3 → 2 → 1.89 eV, 656 nm.
- **~photoelectric — BUILD (⏳ need 11):** values λ, photon E (eV), work function φ, K_max,
  threshold λ. Relations: E = 1240 ÷ λ; K_max = E − φ; λ₀ = 1240 ÷ φ. Example: 250 nm on a metal
  with φ = 2.3 eV → 4.96 eV, K_max = 2.66 eV, λ₀ = 539 nm.
- **~relativity — BUILD (⏳ need 12):** values speed as a fraction of c (0–0.999), γ, proper time
  Δt₀, Δt, proper length L₀, L. Relations: γ = 1 ÷ √(1 − β²); Δt = γΔt₀; L = L₀ ÷ γ. Example:
  0.6c → γ = 1.25; 10 s → 12.5 s; 100 m → 80 m.
- **Verdict:** 4 pages; no released items, the four common types Solve (two after engine work).

## Engine and picture needs

1. `collision` type "general": both after-velocities given, momentum checked, each cart's KE shown
   — `s.11.momentum~one-after` (MCAS #13, #14).
2. Impulse picture: force–time rectangle whose area is Δp, with a slower-stop comparison —
   `s.11.momentum~impulse`.
3. `circularMotion` mode "satellite": a planet or satellite round a central mass, v = √(GM/r),
   T = 2πr/v — `s.11.circular-gravitation~orbit`.
4. `motionGraph` vertical strobe strip for a dropped object — `s.11.kinematics-1d~free-fall`
   (can ship horizontal first).
5. Card figure `strobe` (dots every second with a gap pattern, direction) —
   `s.11.kinematics-1d~motion-diagrams`.
6. `freeBody` `displacement` bracket and the F cos θ component dashed — `s.11.work-energy-power~work`.
7. Power picture (a mass lifted h in time t with a timer and a J/s bar) —
   `s.11.work-energy-power~power`.
8. `gasPiston` energy option: Q in, W out as bands, ΔU bar — `s.11.thermodynamics~first-law`.
9. `heatingCurve` flat span sized from Q ÷ P (a variable span) — `s.11.thermodynamics~latent-heat`
   (confirm spans accept variables).
10. `charges` mode "plates": two plates, uniform field lines, a charge and its force —
    `s.11.electrostatics~plates`; 10b: two unequal charges with E at a chosen point for MCAS #11.
11. Photoelectric picture: light on a metal plate, electrons out with K_max, none below threshold —
    `s.11.modern-physics~photoelectric`.
12. Relativity light clock (a moving clock's diagonal path, γ) — `s.11.modern-physics~relativity`.
13. A `g` value choice (9.8 or 10 m/s²) on `projectile`, `freeBody`, `motionGraph`: tests round g
    to 10 (MCAS #25) — kinematics-1d, dynamics-vectors pages.
14. Calorimeter in SI (kg, J/(kg·°C)) through the unit menu — `s.11.thermodynamics`,
    `~specific-heat`.

## Not in the taxonomy

- Electric potential, potential energy and capacitors (OpenStax 18.4–18.5, Glencoe 21): only the
  plates page touches them; a `s.11.electric-potential` skill or a note on electrostatics.
- Simple harmonic motion (OpenStax 5.5; springs and pendulums): no s.11 skill owns it.
- Rotational motion and torque (OpenStax 6.3, Glencoe 8): no skill; torque fits dynamics-vectors
  or a new `s.11.rotation`.
- Mass–energy E = mc², fission and fusion (OpenStax 10.2, 22.4): split between modern-physics and
  s.10 nuclear chemistry; say which owns E = mc².
- Kepler's laws are taught in Grade 11 physics (OpenStax 7.1, Savvas 3.3) but live in
  `s.12.solar-system`; add it to circular-gravitation's Refresh or related list.

## Priority

1. Calculators with drawn demos and no needs: circuits (5, all released items), dynamics-vectors
   (5 calculators), kinematics-1d main + braking + position-graph + turn, kinematics-2d (4),
   optics (7), sound-waves (6), momentum main + elastic + explode, circular main + car + swing +
   gravitation, electromagnetism (3), electrostatics main + field, modern-physics main + lines,
   work-energy-power main + machines + spring, thermodynamics engine + refrigerator + specific-heat.
2. The layout pages (9) with existing figures (the strobe sort after need 5).
3. Needs 1, 2, 3 (released items waiting), then 13, 14, 8, 6, 7, 10, 11, 12, 4.
4. Question data moves (Decisions) before the section review, so the evidence files them right.

## Added skills

Three skills added after the grade was built (`TAXONOMY_ISSUES.md`, "Grades 9–12 topics without
a skill"): they hold the units the "Not in the taxonomy" list above named. No released question in
`research/questions/` is filed under them (`COVERAGE.md`: 0 each), so each page answers the
common textbook problem types of its unit; the textbook practice sets (OpenStax 5.5, 6.1, 6.3,
18.4, 18.5) were read for their kinds only, and every number below is our own, worked by hand.
Pictures are existing kinds; where the right one doesn't exist the page uses the nearest one or a
`table` and the picture it wants is listed in `docs/build/s.11.md` ("Shared needs").

### 14. s.11.rotation — Torque, rotation and static equilibrium

- **Standard:** HS-PS2-1 (Newton's second law, here for turning); CCSS HSG-SRT.C.8 (sine of the angle).
- **Textbooks:** OpenStax Physics 6.1 (angle of rotation, angular velocity), 6.3 (rotational motion,
  torque); Glencoe 8 (Rotational Motion; titles only).
- **Tests ask:** no released items. Common types:

  | Question type                                      | Page                    | Mark   |
  | -------------------------------------------------- | ----------------------- | ------ |
  | torque from a force at an angle on a wrench, door  | main                    | Solves |
  | where to sit to balance a seesaw; the pivot's push | ~seesaw                 | Solves |
  | rpm to rad/s, rim speed of a wheel                 | ~angular-speed          | Solves |
  | a wheel speeding up: ω, angle turned, turns        | ~angular-acceleration   | Solves |
  | τ = Iα for a hoop, disk or sphere                  | ~rotational-inertia     | Solves |

- **Main — BUILD `s.11.rotation`:** `vectorDiagram`, one force by size and direction with
  `components: true`, the lever arm along the x-axis (axes "along the arm", "across the arm", unit
  N); the dashed across-part is the part that turns (interim; a torque picture is a shared need).
  Values: lever arm r (0.001–100 m), force F (0–10⁵ N), angle θ between arm and force (0–180°),
  perpendicular part F⊥ (derived), torque τ (N·m). Relations: F⊥ = F sin θ; τ = rF⊥.
  Assumptions: r runs from the pivot to where the force pushes; only the part of F at right angles
  to the arm turns it (90° turns best, 0° not at all); torque grows with a longer arm. Example:
  r = 0.25 m, F = 80 N, θ = 30° → F⊥ = 40 N, τ = 10 N·m (at 90°, 20 N·m). startWith r, F, θ.
- **~seesaw — BUILD:** `simpleMachine` lever (load F₁ at d₁, effort F₂ at d₂). Values: F₁, d₁, F₂,
  d₂, torque τ, pivot force F_p. Relations: τ = F₁d₁; τ = F₂d₂ (the torques balance); F_p = F₁ + F₂
  (the forces balance). Assumptions: balanced means no net torque and no net force; the plank's
  own weight acts at the pivot, so it adds no torque. Example: 300 N child 2 m out, 400 N child
  → d₂ = 1.5 m, τ = 600 N·m, F_p = 700 N. startWith F₁, d₁, F₂. Use line: "Use this for 'A 300 N
  child sits 2 m from the pivot. Where must a 400 N child sit to balance?'"
- **~angular-speed — BUILD:** `circularMotion` string (a point on the rim). Values: radius r,
  turning rate N (rpm), ω (rad/s), period T, rim speed v. Relations: ω = 2πN/60; T = 2π/ω; v = rω.
  Assumptions: one turn is 2π rad; every point has the same ω, but points farther out move
  faster. Example: r = 0.3 m, 120 rpm → ω = 4π = 12.57 rad/s, T = 0.5 s, v = 3.77 m/s.
  startWith r, N.
- **~angular-acceleration — BUILD:** `motionGraph` velocity view in rad/s (strobe off). Values:
  ω₀, α, t, ω, angle Δθ (rad), turns n. Relations: ω = ω₀ + αt; Δθ = ω₀t + ½αt²; n = Δθ/2π.
  Assumptions: α is constant; the same equations as straight-line motion with θ, ω, α for x, v, a;
  the area under ω–t is the angle. Example: ω₀ = 3 rad/s, α = 2 rad/s², t = 4 s → ω = 11 rad/s,
  Δθ = 28 rad, n = 4.46 turns. startWith ω₀, α, t.
- **~rotational-inertia — BUILD:** `table` (interim) sweeping the shape factor c (rows hoop 1,
  disk ½, solid ball 0.4) for α, with m, r and τ held. Values: c (allowed 1, 0.5, 0.4), m, r,
  moment of inertia I, τ, α. Relations: I = cmr²; τ = Iα. Assumptions: I is how hard it is to spin
  up: mass farther out counts more; a hoop has all its mass at r. Example: 2 kg disk, r = 0.5 m,
  τ = 3 N·m → I = 0.25 kg·m², α = 12 rad/s² (a hoop: 6 rad/s²).
- **Verdict:** 5 pages; the five common types Solve.

### 15. s.11.oscillations — Simple harmonic motion: springs and pendulums

- **Standard:** HS-PS3-2 (energy stored in a stretched spring); HS-PS4-1 context (period and
  frequency of a repeating motion).
- **Textbooks:** OpenStax Physics 5.5 (simple harmonic motion: Hooke's law, period of a spring and
  a pendulum); Glencoe 14 (Vibrations and Waves, shared with `s.11.sound-waves`; titles only).
- **Tests ask:** no released items. Common types:

  | Question type                                  | Page      | Mark   |
  | ---------------------------------------------- | --------- | ------ |
  | period and frequency of a mass on a spring     | main      | Solves |
  | amplitude, top speed, energy of the oscillator | main      | Solves |
  | spring constant from a hung mass; energy      | ~hooke    | Solves |
  | pendulum length for a period; on the Moon      | ~pendulum | Solves |

- **Main — BUILD `s.11.oscillations`:** `functionGraph` cos, x = A cos(ωt), time from 0, marks
  amplitude and period (shows A and T; interim for a mass on a spring beside its trace). Values:
  mass m (0.001–1000 kg), spring constant k (0.1–10⁶ N/m), period T, frequency f, angular
  frequency ω, amplitude A (m), top speed v_max, energy E. Relations: T = 2π√(m/k); f = 1/T;
  ω = 2π/T; v_max = Aω; E = ½kA². Assumptions: the spring obeys Hooke's law and nothing rubs;
  T depends on m and k, not on A; fastest through the middle, still for an instant at each end.
  Example: m = 0.5 kg, k = 200 N/m, A = 0.10 m → T = 0.1π = 0.314 s, f = 3.18 Hz,
  ω = 20 rad/s, v_max = 2 m/s, E = 1 J (= ½ × 0.5 × 2²). startWith m, k, A.
- **~hooke — BUILD:** `functionGraph` linear F = kx through 0, the point (x, F) traced, the area
  under it shaded (the stored energy). Values: hung mass m, force F, stretch x, k, stored energy U.
  Relations: F = mg; F = kx; U = ½kx². Example: 2 kg stretches 0.08 m → F = 19.6 N, k = 245 N/m,
  U = 0.784 J. startWith m, x.
- **~pendulum — BUILD:** `table` sweeping L (0.25, 0.5, 1, 2, 4 m) for T with g held (4× the
  length, 2× the period). Values: L, g (default 9.8; 1.62 on the Moon), T, f. Relations:
  T = 2π√(L/g); f = 1/T. Assumptions: small swings (under about 15°); the bob's mass and the
  swing's size don't change T. Example: L = 0.80 m → √(0.8/9.8) = 2/7, T = 4π/7 = 1.80 s,
  f = 0.557 Hz. startWith L, g.
- **Verdict:** 3 pages; the four common types Solve.

### 16. s.11.electric-potential — Electric potential, voltage and capacitors

- **Standard:** HS-PS3-2 (energy stored in a field); HS-PS3-5 (fields and the energy of charges in them).
- **Textbooks:** OpenStax Physics 18.4 (electric potential), 18.5 (capacitors and dielectrics);
  Savvas Experience 10.1 (electric potential); Glencoe 21 (Electric Fields; titles only).
- **Tests ask:** no released items. Common types:

  | Question type                                        | Page              | Mark   |
  | ---------------------------------------------------- | ----------------- | ------ |
  | potential near a point charge; energy of a 2nd charge | main              | Solves |
  | energy (eV, J) and speed of an electron through ΔV    | ~voltage-energy   | Solves |
  | charge and energy on a capacitor                      | ~capacitor        | Solves |
  | capacitance of two plates, with a dielectric          | ~parallel-plate   | Solves |
  | field between plates, E = V/d                         | electrostatics~plates (⏳ need 10) | — |

- **Main — BUILD `s.11.electric-potential`:** `charges` one charge at r (the `~field` picture).
  Values: charge q (μC), distance r (m), potential V (V), second charge q₀ (μC), its potential
  energy U (J). Relations: V = kq/r; U = q₀V. Assumptions: V is energy per coulomb, 0 far away;
  V takes the charge's sign and is not a vector; like charges give U > 0 (work was done to push
  them together). Example: q = +4 μC, r = 0.50 m → V = 71,920 V; q₀ = 2 μC → U = 0.144 J.
  startWith q, r, q₀.
- **~voltage-energy — BUILD:** `table` (interim; the plates picture is need 10) sweeping ΔV
  (1, 10, 100, 1000 V) for v. Values: charge q (in e, 1–2), ΔV, energy K (eV), energy K (J), mass
  m (allowed electron 9.109 × 10⁻³¹, proton 1.673 × 10⁻²⁷ kg), speed v. Relations: K = qΔV (eV);
  K(J) = 1.602 × 10⁻¹⁹ × K(eV); v = √(2K/m). Assumptions: starts at rest, only the electric force
  works; 1 eV is what one electron charge gains through 1 V; slow next to light (v up to 3 × 10⁷
  m/s). Example: an electron through 100 V → 100 eV = 1.602 × 10⁻¹⁷ J, v = 5.93 × 10⁶ m/s.
  startWith ΔV, q, m.
- **~capacitor — BUILD:** `table` (interim) sweeping V (3, 6, 9, 12 V) for U with C held (2× the
  voltage, 4× the energy). Values: C (μF), V, Q (μC), U (J). Relations: Q = CV; U = ½CV².
  Assumptions: Q is the charge on each plate (+Q and −Q); a capacitor stores energy in the field
  between its plates. Example: 470 μF at 9 V → Q = 4230 μC, U = 0.0190 J. startWith C, V.
- **~parallel-plate — BUILD:** `table` (interim) sweeping the gap d (0.5, 1, 2, 4 mm) for C.
  Values: dielectric constant κ (1–100; air 1), plate area A (m²), gap d (mm), C (pF), V, Q (pC).
  Relations: C = κε₀A/d, ε₀ = 8.85 × 10⁻¹² F/m; Q = CV. Example: κ = 1, A = 0.010 m², d = 1.0 mm →
  C = 88.5 pF; at 12 V, Q = 1062 pC.
- **Verdict:** 4 pages; the four common types Solve, the plates field waits with electrostatics.

### Priority (added skills)

1. `s.11.rotation`: main, ~seesaw, ~angular-speed, ~angular-acceleration, ~rotational-inertia.
2. `s.11.oscillations`: main, ~hooke, ~pendulum.
3. `s.11.electric-potential`: main, ~voltage-energy, ~capacitor, ~parallel-plate.
