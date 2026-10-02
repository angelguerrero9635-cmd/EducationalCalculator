# Direction plan: higher education, Physics (7 courses, 37 topics)

Written from the brief, `src/data/taxonomy.ts` (`COURSES`, Physics), `docs/MODULE_GUIDE.md`
("Standards"), `docs/LAYOUTS.md`, `docs/PICTURES.md`, `docs/EQUATION_INPUTS.md`, the pilot
`he.physics.university-1#0` in `src/data/modules/college.ts` and the model plan `docs/plans/s.11.md`.
No college questions or textbooks are in `research/` yet, so each topic lists the common textbook
and exam question types (part 4 plans the research that will check them). Every example below
is original and was worked by hand; nothing is copied from a textbook or problem set.

## Decisions

- **Ids.** A topic page is `<courseId>#<i>` (0-based, the taxonomy order); a problem type is
  `<courseId>#<i>~<slug>`. Courses: `he.physics.university-1` (UP1), `university-2` (UP2),
  `university-3` (UP3), `classical-mechanics` (CM), `electromagnetism` (EM), `quantum` (QM),
  `thermal-statistical` (TS). Pages live in `src/data/modules/college.ts`; split it by course
  (`college/physics.ts`) once it passes ~2,000 lines.
- **Word rules.** The Grades 9–12 rules hold: sentences ≤ 35 words, ≤ 10 values a page, the name
  first on every value ("Spring constant (k)"), 2–4 assumptions. No new rule is argued for: every
  page below fits 10 values.
- **Notation.** The symbols of OpenStax University Physics for UP1–3; Taylor (CM), Griffiths (EM,
  QM) and Schroeder (TS) symbols for the upper-level courses, which are what students see in
  class: ħ, k_B, μ₀, ε₀, ψₙ, ⟨x⟩, Z, β = v/c, γ. Vectors are given by components or by magnitude
  and direction (degrees from +x); a picture draws the arrow. Unicode sub- and superscripts as
  in s.11 (v₀, E₀, ωₙ, x′).
- **Constants** (fixed numbers in the relations, named once in an assumption, never inputs):
  g = 9.80 m/s²; G = 6.674 × 10⁻¹¹ N·m²/kg²; GM_Earth = 3.986 × 10¹⁴ m³/s², R_Earth = 6.371 × 10⁶ m;
  k = 8.99 × 10⁹ N·m²/C²; ε₀ = 8.85 × 10⁻¹² F/m; μ₀ = 4π × 10⁻⁷ T·m/A; c = 3.00 × 10⁸ m/s;
  e = 1.602 × 10⁻¹⁹ C; mₑ = 9.109 × 10⁻³¹ kg (0.511 MeV/c²); m_p = 1.673 × 10⁻²⁷ kg;
  h = 6.626 × 10⁻³⁴ J·s; ħ = 1.0546 × 10⁻³⁴ J·s; hc = 1240 eV·nm; h/(mₑc) = 2.426 pm;
  k_B = 1.381 × 10⁻²³ J/K = 8.617 × 10⁻⁵ eV/K; R = 8.314 J/(mol·K); σ = 5.670 × 10⁻⁸ W/(m²·K⁴);
  1 u = 931.5 MeV/c²; μ_B = 5.788 × 10⁻⁵ eV/T; b (Wien) = 2.898 × 10⁻³ m·K.
  Where a test rounds (g = 10, k = 9 × 10⁹), the page keeps the textbook value; s.11 need 13
  (a `g` choice) covers the difference.
- **Units.** SI, with the unit menus the registry already has (m, s, kg, N, J, eV, V, A, Ω, C, F,
  K, Pa, W). Units the physics courses need that the registry lacks (Hz, rad/s, nm, pm, μm, T, mT,
  Wb, H, mH, N/C, V/m, N·m, kg·m², kg·m/s, N·s, J·s, J/K, keV, MeV, u, Bq, W/m², A·m², rad) are
  fixed labels until engine need E3 adds them. Angles in geometry and direction are degrees;
  phases (ωt + φ) are radians, the unit printed.
- **How calculus is shown.** A page never asks the solver to integrate. Each relation that comes
  from a derivative or integral carries its derivation as the first work line of the step, once,
  in the form the textbook writes it ("W = ∫ from x₂ to x₁ of kx dx = ½k(x₁² − x₂²)"), then the
  numbers go into the closed form, one stage a line. Polynomial motion uses the power rule as the
  `he.math.calc-1#1` pilot does. The harness checks a derivation line by numeric quadrature or a
  finite difference at the page's values (engine need E2); until then it is a `how` sentence.
- **Linear algebra, ODEs, complex numbers.** 2 × 2 only: Kirchhoff's two loops, coupled modes and
  two-level quantum systems are solved by Cramer's rule or the characteristic equation
  λ² − (trace)λ + det = 0, shown on `matrixGrid` (E5). ODEs appear only through their textbook
  solutions (RC, RL, damped oscillator, drag, SHM with phase). AC circuits use the impedance as
  a point R + iX on `complexPlane`; every value the student types is real.
- **Calculator or layout.** Every topic main page is a calculator except two: CM#0 (Lagrangian
  mechanics) is a sequence (the method is the lesson; the calculators are its problem types) and
  EM#2 (Maxwell's equations) is a sort (what each equation says; displacement current is its
  calculator problem type). Two more sorts are problem types: `he.physics.quantum#0~commute`,
  `he.physics.thermal-statistical#1~ensembles`. Layout pages need college layout data (E1).
  "No page": derivations and proofs (Noether's theorem, Liouville's theorem, the uniqueness
  theorem, the virial theorem as a proof, Legendre transforms in general) stay in assumptions and
  `how` lines of the pages that use their results.
- **Overlap with s.11.** UP1–3 repeat Grade 11 ideas with calculus, vectors and two-body systems.
  Each college page links its s.11 skill in Refresh (kinematics-1d → UP1#0 and so on) and does
  not rebuild a Grade 11 page: s.11 owns constant-force single-block problems, Ohm's law, the
  light clock's γ alone, the photoelectric threshold and the Doppler effect.
- **Pilot.** `he.physics.university-1#0` stays as built (v₀, v, a, t, d; four relations; example
  v₀ = 5, a = 2, t = 4 → v = 13 m/s, d = 36 m). Change its picture from `plot` to `motionGraph`
  `kinematics: { view: 'velocity' }` (the s.11 v–t graph with the area as Δx) so the two levels
  look alike; rename `d` "Displacement (Δx)" to match s.11.
- **Value caps and ranges.** Ranges are physical limits (a mass is > 0, a speed below c, a
  probability 0–1). Where a range admits impossible inputs, `allowed` lists the named choices
  (particle masses, shape factors) and worked-out values are `derived`. Scientific notation
  from 10⁻³⁵ to 10³¹ with 3–4 significant figures (E7).
- **Page count:** 37 main + 83 problem types = **120 pages**: 116 calculators, 4 layouts. **56**
  calculators are marked ⏳ (a picture request in part 3 or an engine need in part 4); 30 of them
  name an interim picture and can ship first. The 4 layouts wait on E1 (college layout data).

Picture options named below are the ones `docs/PICTURES.md` lists. `HE-physics-Pn` is a request in
part 3; "table (interim)" is the `table` kind sweeping one value, used until the request is drawn.

## Course 1. he.physics.university-1 — University Physics I: Mechanics

Prerequisites: `s.11.kinematics-2d`, `he.math.calc-1`. Textbook: OpenStax University Physics
Vol. 1 (UP-V1), chapters 2–15; AP Physics C: Mechanics is the bridge level.

### UP1#0 he.physics.university-1#0 — Kinematics

- **Textbooks:** UP-V1 3 (Motion along a straight line: 3.1–3.6, including 3.6 "Finding velocity
  and displacement from acceleration"), 4 (Motion in two and three dimensions).
- **Main — KEEP (pilot):** see Decisions (picture → `motionGraph` velocity view). Use line:
  "Use this for 'A car at 5 m/s speeds up at 2 m/s² for 4 s. How fast is it going, and how far
  has it gone?'"
- **~calculus — BUILD (⏳ HE-physics-P1, E2):** position as a polynomial in time; velocity and
  acceleration by the power rule. Values: c₀ (m, −10⁴–10⁴), c₁ (m/s, −10³–10³), c₂ (m/s²,
  −100–100), c₃ (m/s³, −50–50), time t (0–100 s), position x, velocity v, acceleration a
  (derived). Relations: x = c₀ + c₁t + c₂t² + c₃t³; v = dx/dt = c₁ + 2c₂t + 3c₃t²;
  a = dv/dt = 2c₂ + 6c₃t. Assumptions: x(t) is given; the derivative of tⁿ is ntⁿ⁻¹; v = 0 marks a
  turnaround. Example: x = 2t³ − 9t² + 12t, t = 3 s → x = 54 − 81 + 36 = 9 m, v = 54 − 54 + 12 =
  12 m/s, a = 36 − 18 = 18 m/s² (turns at t = 1 s and 2 s). startWith c₃, c₂, c₁, c₀, t. Interim
  picture: `functionGraph` cubic in t with the tangent at t (as the calc-1 pilot's `plot`
  `tangentSlope`). Use line: "Use this for 'x = 2t³ − 9t² + 12t. Find the velocity and
  acceleration at t = 3 s.'"
- **~projectile-at-t — BUILD:** `projectile` with `at`, `x`, `y` (the parametric option, captions
  off). Values: launch speed v₀ (0–500 m/s), angle θ (−90–90°), height h (0–1000 m), time t
  (0–200 s), x, y, vₓ, v_y, speed v, direction φ (derived). Relations: x = v₀cos θ·t;
  y = h + v₀ sin θ·t − ½gt²; vₓ = v₀cos θ; v_y = v₀ sin θ − gt; v = √(vₓ² + v_y²);
  φ = tan⁻¹(v_y/vₓ). Example: 20 m/s at 30°, h = 0, t = 1.5 s → x = 25.98 m, y = 15 − 11.025 =
  3.975 m, v_y = −4.7 m/s, v = 17.95 m/s at −15.2°. startWith v₀, θ, h, t.
- **Answers:** v and a from x(t) (AP C Mech FR staple) — ~calculus Solves; turnaround time —
  ~calculus Solves (v = 0 by the quadratic); constant-a pairs — main Partly (multi-phase motions: elevator trips, a stone released from a rocket); velocity vector of
  a projectile at a time — ~projectile-at-t Solves; x(t) from a(t) by integrating — Partly (the
  inverse direction: same polynomial page read backwards once E2 lands); relative velocity —
  s.11 `~boat` (Refresh); average acceleration vector and centripetal acceleration on a loop — No [new-page].
- **Verdict:** 3 pages (1 kept, 2 new).

### UP1#1 he.physics.university-1#1 — Newton's laws

- **Textbooks:** UP-V1 5 (Newton's laws of motion), 6 (Applications: friction, centripetal force,
  drag force and terminal speed).
- **Main — BUILD (⏳ HE-physics-P2): a block on a table pulled by a hanging block.** Values:
  table mass m₁ (0.01–1000 kg), hanging mass m₂ (0.01–1000 kg), kinetic coefficient μₖ (0–1.5),
  acceleration a, tension T (derived). Relations: a = (m₂ − μₖm₁)g ÷ (m₁ + m₂);
  T = m₂(g − a). Assumptions: light string and frictionless, massless pulley, so T is the same
  on both sides; the blocks move together with one a; a ≤ 0 means μₖ is large enough that
  nothing slides once at rest (the page says so instead of a negative a). Example: m₁ = 4 kg,
  m₂ = 2 kg, μₖ = 0.25 → a = (19.6 − 9.8) ÷ 6 = 1.633 m/s², T = 2(9.8 − 1.633) = 16.33 N (check
  on m₁: 16.33 − 9.8 = 4 × 1.633). startWith m₁, m₂, μₖ. Interim picture: `freeBody` floor with
  tension for m₁. Use line: "Use this for 'A 4 kg block on a table (μₖ = 0.25) is pulled by a
  2 kg hanging block. Find a and T.'"
- **~atwood — BUILD (⏳ P2):** both blocks hanging. Values m₁, m₂, a, T. Relations:
  a = (m₂ − m₁)g ÷ (m₁ + m₂); T = 2m₁m₂g ÷ (m₁ + m₂). Example: 3 kg and 5 kg → a = 2.45 m/s²,
  T = 36.75 N.
- **~drag — BUILD:** linear drag from rest. Values: mass m (0.001–1000 kg), drag constant b
  (0.001–1000 kg/s), terminal speed v_T, time constant τ, time t, speed v. Relations: v_T = mg/b;
  τ = m/b; v = v_T(1 − e^(−t/τ)). Assumptions: drag is bv (slow, small objects); v_T is where
  drag equals weight; after 5τ it is within 1% of v_T. Example: m = 2 kg, b = 4 kg/s →
  v_T = 4.9 m/s, τ = 0.5 s; t = 1 s → v = 4.9(1 − e⁻²) = 4.237 m/s. Picture: `functionGraph`
  exponential approach with its asymptote at v_T and τ marked.
- **~banked — BUILD (⏳ HE-physics-P3):** the speed a frictionless bank is made for. Values:
  radius r (1–10⁴ m), bank angle θ (0–80°), speed v, mass m, normal force N. Relations:
  tan θ = v² ÷ (rg); N = mg ÷ cos θ. Example: r = 50 m, θ = 15° → v = √(490 × 0.2679) =
  11.46 m/s. Interim: `freeBody` incline (N and W drawn, net force to the center).
- **Answers:** connected blocks and pulleys (AP C Mech FR) — main, ~atwood Partly (two-pulley constraints, incline with static friction, stacked blocks); terminal speed,
  v(t) with linear drag — ~drag Solves; banked curve — ~banked Solves; quadratic drag v_T =
  √(2mg/(ρCA)) — Partly (only terminal speed; add as a value if the research shows it is common);
  static friction "will it slide" — s.11 dynamics-vectors (Refresh); Partly at this level (stacked blocks, capstan, cube against a wall); forces in an accelerating or rotating frame (rope angle in a braking truck, tension in a whirled rope) — No [new-page].
- **Verdict:** 4 pages.

### UP1#2 he.physics.university-1#2 — Work and energy

- **Textbooks:** UP-V1 7 (Work and kinetic energy: work done by a spring, the work–energy
  theorem, power), 8 (Potential energy and conservation; potential energy diagrams and stability).
- **Main — BUILD: work by a spring and the speed it gives.** Values: spring constant k
  (0.1–10⁶ N/m), start stretch x₁ (−5–5 m), end stretch x₂ (−5–5 m), work by the spring W, mass m
  (0.001–10⁴ kg), start speed v₁, end speed v₂. Relations: W = ½k(x₁² − x₂²);
  ½mv₂² = ½mv₁² + W. Assumptions: the spring obeys F = −kx; W is the area under the F–x line
  between x₁ and x₂ (shown once as ∫ kx dx); the floor is smooth. Example: k = 400 N/m, x₁ = 0.10 m,
  x₂ = 0, m = 0.25 kg from rest → W = 2 J, v₂ = 4 m/s. startWith k, x₁, x₂, m, v₁. Picture:
  `functionGraph` line F = kx with the area from x₂ to x₁ shaded (⏳ HE-physics-P18 `area` for the
  band between two x values; interim: area from 0, as s.11.oscillations~hooke).
- **~power-law-force — BUILD (E2):** W = ∫ from x₁ to x₂ of c xⁿ dx = c(x₂ⁿ⁺¹ − x₁ⁿ⁺¹) ÷ (n + 1).
  Values: c (N/mⁿ), n (0–4, integer), x₁, x₂ (0–100 m), W. Example: F = 30x² N, 0 to 2 m →
  W = 30 × 8 ÷ 3 = 80 J. Picture: `functionGraph` power family with P18 `area`.
- **~potential-curve — BUILD (⏳ P18 `level`):** force and equilibrium from U(x) = ax³ − bx².
  Values: a (J/m³), b (J/m²), position x, U, force F, stable point x_s, its energy U_s. Relations:
  F = −dU/dx = −3ax² + 2bx; x_s = 2b ÷ (3a) (U″ > 0 there; x = 0 is unstable when b > 0).
  Example: a = 1, b = 3 → at x = 1 m: U = −2 J, F = +3 N; stable at x_s = 2 m, U_s = −4 J.
  Picture: `functionGraph` cubic with the tangent (slope = −F) and the minimum ringed.
- **~friction-energy — BUILD:** energy with friction on a slope. Values: mass m, slope length d
  (0–10⁴ m), angle θ (0–89°), μₖ (0–1.5), start speed v₀, height drop h, heat Q, end speed v.
  Relations: h = d sin θ; Q = μₖmg cos θ·d; ½mv² = ½mv₀² + mgh − Q. Example: 5 kg sled from rest,
  20 m at 30°, μₖ = 0.1 → h = 10 m, Q = 84.87 J, v = √(2(98 − 16.97)) = 12.73 m/s. Picture:
  `energyTrack` ramp with the rough patch (`spring` option's rough patch, spring 0).
- **Answers:** work of a spring / speed from a compressed spring — main Solves; work of a variable
  force F(x) — ~power-law-force Solves for powers, Partly for other F(x) (E2); F from U(x),
  equilibria and stability (UP-V1 8.4) — ~potential-curve Solves; turning points for energy E —
  Partly (P18 `level`); energy with friction — ~friction-energy Partly (chained through a collision); power P = Fv — s.11
  (Refresh); lab analysis: linearize data, slope gives k, μ or g (an AP C free-response every year) — No [new-page].
- **Verdict:** 4 pages.

### UP1#3 he.physics.university-1#3 — Momentum

- **Textbooks:** UP-V1 9 (Linear momentum and collisions: impulse, collisions in 2D, center of
  mass, rocket propulsion).
- **Main — BUILD: a 2D perfectly inelastic collision.** Values: m₁ (0.001–10⁵ kg), v₁ east
  (0–500 m/s), m₂, v₂ north, total momentum pₓ, p_y, final speed v, direction θ (degrees north of
  east). Relations: pₓ = m₁v₁; p_y = m₂v₂; v = √(pₓ² + p_y²) ÷ (m₁ + m₂); tan θ = p_y/pₓ.
  Assumptions: momentum is kept in each direction separately; the two stick; kinetic energy is not
  kept (the page shows how much is lost as a check). Example: 1500 kg at 20 m/s east, 2500 kg at
  15 m/s north → pₓ = 30,000, p_y = 37,500 kg·m/s, v = 48,023 ÷ 4000 = 12.01 m/s at 51.3°.
  startWith m₁, v₁, m₂, v₂. Picture: `vectorDiagram` tipToTail, p₁ and p₂ to p (unit "kg·m/s",
  axes east/north).
- **~elastic — BUILD:** 1D elastic, both moving. Values m₁, v₁, m₂, v₂, v₁′, v₂′. Relations:
  v₁′ = ((m₁ − m₂)v₁ + 2m₂v₂) ÷ (m₁ + m₂); v₂′ = ((m₂ − m₁)v₂ + 2m₁v₁) ÷ (m₁ + m₂). Example: 2 kg
  at 6 m/s hits 4 kg at rest → v₁′ = −2 m/s, v₂′ = 4 m/s (KE 36 J before and after). Picture:
  `collision` elastic.
- **~center-of-mass — BUILD (⏳ HE-physics-P4):** up to three masses on a line. Values m₁, x₁, m₂,
  x₂, m₃, x₃, total M, x_cm. Relation: x_cm = (m₁x₁ + m₂x₂ + m₃x₃) ÷ M. Example: 2 kg at 0, 3 kg at
  1 m, 5 kg at 2 m → x_cm = 13 ÷ 10 = 1.3 m.
- **~impulse-curve — BUILD (⏳ HE-physics-P5):** J = ∫F dt for a triangular force pulse. Values: peak
  force F_max, contact time Δt, impulse J, average force F_avg, mass m, change in speed Δv.
  Relations: J = ½F_maxΔt; F_avg = J/Δt; Δv = J/m. Example: 1200 N peak over 0.010 s → J =
  6 N·s, F_avg = 600 N; a 0.15 kg ball from rest leaves at 40 m/s. Interim: `impulse` (rectangle of
  the same area, F_avg).
- **~rocket — BUILD:** Δv = u ln(m₀/m_f). Values: exhaust speed u (10–5000 m/s), start mass m₀,
  end mass m_f (< m₀), Δv. Example: u = 2500 m/s, 5000 kg to 2000 kg → Δv = 2500 × 0.9163 =
  2291 m/s. Picture: `functionGraph` log of the mass ratio with the point.
- **Answers:** 2D collision speed and direction — main Solves; elastic 1D with both moving —
  ~elastic Solves; center of mass of point masses — ~center-of-mass Solves (items ask non-uniform rods and a projectile splitting: Partly) (continuous rod with
  λ(x) — No; propose later with E2); impulse from an F–t graph — ~impulse-curve Solves for a
  triangle, Partly for other shapes; rocket equation — ~rocket Partly (two-stage rocket, raindrop gaining mass); ballistic pendulum — Partly; ranked high (bullet in a block, acrobat catch, AP C 2024–2025): `~ballistic` [new-page]; variable mass (raindrop gaining mass) — No.
- **Verdict:** 5 pages.

### UP1#4 he.physics.university-1#4 — Rotation and torque

- **Textbooks:** UP-V1 10 (Fixed-axis rotation: moment of inertia, parallel-axis theorem,
  Newton's second law for rotation), 11 (Angular momentum: rolling, conservation), 12 (Static
  equilibrium).
- **Main — BUILD (⏳ HE-physics-P6): rolling down a ramp.** Values: shape factor c (allowed: hoop 1,
  hollow ball ⅔, disk ½, solid ball 0.4), mass m, radius r, drop h (0–1000 m), speed v, spin ω,
  translational KE K_t, rotational KE K_r. Relations: v = √(2gh ÷ (1 + c)); ω = v/r; K_t = ½mv²;
  K_r = cK_t. Assumptions: rolls without slipping, so v = rω and static friction does no work;
  I = cmr²; mass and radius cancel from v. Example: solid ball, 2 kg, r = 0.1 m, h = 1.5 m →
  v = √21 = 4.583 m/s, ω = 45.8 rad/s, K_t = 21 J, K_r = 8.4 J (sum 29.4 J = mgh). Interim: `rotor`
  compare row (hoop, disk, ball) with `hollow`.
- **~parallel-axis — BUILD:** I = I_cm + Md² for a rod. Values: mass M, length L, I_cm, distance d,
  I. Relations: I_cm = ML²/12; I = I_cm + Md². Example: 1.2 kg, 0.9 m, d = 0.45 m → I_cm =
  0.081, I = 0.081 + 0.243 = 0.324 kg·m² (= ML²/3, the end). Picture: `rotor` (⏳ P6 `rod` with the
  two axes).
- **~pulley-inertia — BUILD:** a block hanging from a disk pulley. Values: block m, pulley mass M,
  radius r, I (= ½Mr²), a, T, α. Relations: a = mg ÷ (m + I/r²); T = m(g − a); α = a/r.
  Example: 2 kg on a 4 kg, 0.1 m disk → I = 0.02 kg·m², a = 4.9 m/s², T = 9.8 N, α = 49 rad/s².
  Picture: `rotor` disk with τ = Tr.
- **~angular-momentum — BUILD:** I₁ω₁ = I₂ω₂. Values I₁, ω₁, I₂, ω₂, K₁, K₂. Example: a skater
  4 kg·m² at 2 rad/s pulls in to 1.6 kg·m² → ω₂ = 5 rad/s, K from 8 J to 20 J (the arms do work).
  Picture: `rotor` turn dials.
- **~ladder — BUILD (⏳ HE-physics-P7):** a uniform ladder on a rough floor against a smooth wall.
  Values: weight W, angle with the floor θ (1–89°), wall force N_w, floor normal N_f, friction f,
  least μₛ. Relations: N_f = W; N_w = W ÷ (2 tan θ); f = N_w; μₛ ≥ 1 ÷ (2 tan θ). Example:
  W = 200 N, θ = 60° → N_w = f = 57.7 N, μₛ ≥ 0.289.
- **Answers:** rolling race and speed at the bottom — main Partly (sliding then rolling, yo-yo, heights reached on a ramp); I by the parallel-axis theorem —
  ~parallel-axis Solves (rod; other shapes by c); pulley with mass — ~pulley-inertia Solves;
  spinning skater, KE change — ~angular-momentum Partly (pivoted rods striking, a cube tipping); ladder or beam statics — ~ladder Partly; cable-held beam and pivoted rod with a string ranked high (8.01SC, AP C 2024): `~beam` [new-page]; torque τ = rF sin θ — s.11
  rotation (Refresh).
- **Verdict:** 5 pages.

### UP1#5 he.physics.university-1#5 — Oscillations

- **Textbooks:** UP-V1 15 (Oscillations: SHM, energy, pendulums, damped and forced oscillations).
- **Main — BUILD (⏳ HE-physics-P8): SHM from a start position and velocity.** Values: mass m
  (0.001–1000 kg), spring constant k (0.1–10⁶ N/m), ω, start position x₀ (m), start velocity v₀
  (m/s), amplitude A, phase φ (rad, −π–π), time t, position x. Relations: ω = √(k/m);
  A = √(x₀² + (v₀/ω)²); φ = atan2(−v₀/ω, x₀); x = A cos(ωt + φ). Assumptions: no friction;
  x(t) = A cos(ωt + φ) solves m ẍ = −kx (shown once); φ is in radians. Example: m = 0.5 kg,
  k = 50 N/m → ω = 10 rad/s; x₀ = 0.03 m, v₀ = 0.4 m/s → A = 0.05 m, φ = −0.927 rad; at t = 0.2 s,
  x = 0.05 cos(1.073) = 0.0239 m. startWith m, k, x₀, v₀, t. Interim: `oscillator` trace (φ = 0).
- **~damped — BUILD (⏳ P8 `damping`):** Values m, k, damping b (kg/s), ω′, quality Q, start
  amplitude A₀, time t, amplitude A(t). Relations: ω′ = √(k/m − (b/2m)²); A = A₀e^(−bt/2m);
  Q = mω₀/b. Assumption: underdamped only (b < 2√(mk); the page names critical damping at the
  limit). Example: m = 0.5, k = 50, b = 0.4 → ω′ = 9.992 rad/s, Q = 12.5; A₀ = 0.05 m, t = 5 s →
  A = 0.05e⁻² = 0.00677 m. Interim: `functionGraph` exponential envelope.
- **~physical-pendulum — BUILD (⏳ HE-physics-P9):** T = 2π√(I ÷ (mgd)). Values: mass m, I about
  the pivot, pivot-to-center distance d, T. Example: a 1.0 m rod pivoted at its end: I = mL²/3,
  d = L/2 → T = 2π√(2L/3g) = 1.64 s. Interim: `pendulum` (simple, with L = 2/3 m: the equivalent
  length, said in an assumption).
- **Answers:** A and φ from initial conditions — main Solves; x, v at a time — main Solves;
  damped amplitude decay, Q — ~damped Partly (damping read from a graph); physical pendulum period — ~physical-pendulum
  Solves; driven resonance amplitude — No (propose `~driven` after the research; P8 can draw it);
  spring period T = 2π√(m/k) — s.11.oscillations (Refresh); springs in series and parallel, effective k — No [new-page]; small oscillations about the minimum of U(x) — No [new-page].
- **Verdict:** 3 pages.

## Course 2. he.physics.university-2 — University Physics II: Electricity & Magnetism

Prerequisites: UP1, `he.math.calc-2`. Textbook: OpenStax University Physics Vol. 2 (UP-V2),
chapters 5–16; AP Physics C: E&M is the bridge level.

### UP2#0 he.physics.university-2#0 — Electric fields and Gauss's law

- **Textbooks:** UP-V2 5 (Electric charges and fields: field of a charge distribution), 6 (Gauss's
  law: flux, applying Gauss's law, conductors).
- **Main — BUILD (⏳ HE-physics-P10): a uniformly charged solid sphere, inside and outside.**
  Values: charge Q (−10⁻³–10⁻³ C, menu nC, μC), radius R (0.001–100 m), distance r (0–1000 m),
  field E (N/C), flux through a sphere of radius r Φ (N·m²/C). Relations: E = kQr ÷ R³ for r ≤ R;
  E = kQ ÷ r² for r ≥ R; Φ = Q_enc ÷ ε₀ with Q_enc = Q(r/R)³ inside, Q outside. Assumptions: the
  charge is spread evenly, so E points straight out and is the same all over a sphere of radius
  r; Gauss's law Φ = Q_enc/ε₀ (shown once); outside, it acts like a point charge. Example:
  Q = 2.0 μC, R = 0.10 m → at r = 0.30 m, E = 17,980 ÷ 0.09 = 2.00 × 10⁵ N/C, Φ = 2.26 × 10⁵
  N·m²/C; at r = 0.05 m, E = 8.99 × 10⁵ N/C (half the surface value). startWith Q, R, r.
  Interim: `charges` one charge with traced field lines (outside only).
- **~line — BUILD (⏳ P10):** E = λ ÷ (2πε₀r) = 2kλ/r. Values λ (C/m), r, E. Example: 5.0 nC/m at
  0.20 m → 449.5 N/C.
- **~plane — BUILD (⏳ P10):** E = σ ÷ (2ε₀), the same at every distance; two opposite sheets
  σ/ε₀ between. Values σ (C/m²), E single, E between. Example: σ = 8.85 nC/m² → 500 N/C;
  1000 N/C between two opposite sheets.
- **~superposition — BUILD:** two point charges on a line, the field at a point between or beyond.
  `charges` `point` (E₁, E₂, E at x). Values q₁ at 0, q₂ at x₂, point x, E₁, E₂, E (signed, + is
  +x). Example: +4 nC at 0, +1 nC at 0.30 m, point at 0.10 m → E₁ = +3596, E₂ = −224.8,
  E = +3371 N/C.
- **Answers:** E inside and outside a charged sphere, flux through a closed surface — main
  Solves; line and sheet fields — ~line, ~plane Solve; net field from two charges — ~superposition
  Solves on a line, Partly off the line (needs 2D: `charges` with a point off axis; propose with
  P10); field of a ring or rod by integration — EM#0 (Refresh up; AP C 2026 integrates two rods); flux EA cos θ through a flat
  surface — main's assumption only, Partly.
- **Verdict:** 4 pages.

### UP2#1 he.physics.university-2#1 — Potential and capacitance

- **Textbooks:** UP-V2 7 (Electric potential: of a point charge, of a charged sphere,
  equipotentials), 8 (Capacitance: series and parallel, energy, dielectrics).
- **Main — BUILD (⏳ HE-physics-P11): a capacitor network, C₁ in series with C₂ ∥ C₃.** Values: C₁,
  C₂, C₃ (1 pF–1 F, menu μF), source voltage V (0–10⁵ V), equivalent C_eq, charge Q, energy U,
  voltage on C₁ V₁. Relations: C_eq = C₁(C₂ + C₃) ÷ (C₁ + C₂ + C₃); Q = C_eqV; U = ½C_eqV²;
  V₁ = Q/C₁. Assumptions: in parallel, C adds; in series, the charge is the same on each and
  1/C adds; the capacitors start uncharged. Example: 6, 2, 1 μF at 12 V → C₂ ∥ C₃ = 3 μF,
  C_eq = 18 ÷ 9 = 2 μF, Q = 24 μC, U = 144 μJ, V₁ = 4 V (8 V on the pair). startWith C₁, C₂, C₃, V.
  Interim: `capacitor` (one plate pair, C_eq).
- **~coax — BUILD:** C = 2πε₀L ÷ ln(b/a). Values: inner radius a, outer radius b (> a), length L,
  C. Example: a = 0.5 mm, b = 2.0 mm, L = 1 m → C = 5.56 × 10⁻¹¹ ÷ 1.386 = 40.1 pF. Picture: table
  (interim) sweeping b/a (2, 4, 8, 16) for C.
- **~sphere-potential — BUILD:** V = kQ/r outside a charged sphere; work to move a charge.
  `charges` `equipotentials`. Values Q, r₁, r₂, V₁, V₂, ΔV, test charge q, work W = qΔV.
  Example: Q = 2.0 μC; V(0.30 m) = 59,933 V, V(0.10 m) = 179,800 V, ΔV = 119,867 V; moving 1 nC in
  takes W = 1.20 × 10⁻⁴ J.
- **~dielectric — BUILD:** a slab slid in with the battery removed. `capacitor` with the κ slab.
  Values C₀, V₀, κ (1–100), Q, C, V, U₀, U. Relations: Q = C₀V₀; C = κC₀; V = V₀/κ; U = Q² ÷ (2C).
  Example: 10 pF at 100 V, κ = 4 → Q = 1000 pC, V = 25 V, U from 50 nJ to 12.5 nJ (the slab is
  pulled in).
- **Answers:** series–parallel C_eq, Q and V on each — main Solves; energy stored — main Solves;
  cylindrical capacitor — ~coax Solves; spherical capacitor C = 4πε₀ab/(b − a) — No (add as an
  `allowed` geometry on ~coax if research ranks it); potential and work near a charged sphere —
  ~sphere-potential Solves; dielectric with battery on or off — ~dielectric Solves for off, Partly
  for on (one assumption flips: V fixed; propose a `connected` choice); E from V by the gradient — No [new-page].
- **Verdict:** 4 pages.

### UP2#2 he.physics.university-2#2 — DC circuits

- **Textbooks:** UP-V2 9 (Current and resistance: resistivity, power), 10 (Direct-current
  circuits: emf and internal resistance, Kirchhoff's rules, RC circuits).
- **Main — BUILD (⏳ HE-physics-P12, E5): two batteries, three branches.** ε₁ with R₁ on the left,
  R₃ in the middle, ε₂ with R₂ on the right. Values: ε₁, ε₂ (0–1000 V), R₁, R₂, R₃ (0.01–10⁶ Ω),
  branch currents I₁, I₂, I₃ (signed; + up through each battery, down through R₃). Relations:
  I₃ = I₁ + I₂ (junction); ε₁ = I₁R₁ + I₃R₃ (left loop); ε₂ = I₂R₂ + I₃R₃ (right loop). Steps: the
  two loop equations in I₁ and I₂ as a 2 × 2 system, Cramer's rule on `matrixGrid`. Assumptions:
  ideal batteries and wires; a negative current flows against its arrow. Example: ε₁ = 12 V,
  ε₂ = 9 V, every R = 2 Ω → 4I₁ + 2I₂ = 12, 2I₁ + 4I₂ = 9 → I₁ = 2.5 A, I₂ = 1 A, I₃ = 3.5 A
  (left loop 12 − 5 − 7 = 0). startWith ε₁, ε₂, R₁, R₂, R₃. Interim: `matrixGrid` only.
- **~rc-charging — BUILD:** Values R, C, emf ε, τ = RC, time t, charge q, current I. Relations:
  q = Cε(1 − e^(−t/τ)); I = (ε/R)e^(−t/τ). Example: 10 kΩ, 100 μF, 9 V → τ = 1 s; at t = 2 s,
  q = 900 × 0.8647 = 778 μC, I = 0.9 × 0.1353 = 0.122 mA. Picture: `functionGraph` exponential
  with its asymptote Cε and τ marked; `capacitor` beside it (⏳ none).
- **~internal-resistance — BUILD (⏳ P12 `internal`):** Values ε, internal r, load R, I, terminal
  V, power in R. Relations: I = ε ÷ (R + r); V = ε − Ir; P = I²R. Example: 12 V, r = 0.5 Ω,
  R = 5.5 Ω → I = 2 A, V = 11 V, P = 22 W. Interim: `circuit` series, two resistors named r and R.
- **Answers:** two-loop Kirchhoff (AP C E&M FR, UP-V2 10.3) — main Solves; RC charging q(t),
  I(t), time to a fraction — ~rc-charging Solves (t from q by the log); RC discharging — Partly
  (propose `~rc-discharging`, the same page with q = Q₀e^(−t/τ)); terminal voltage, best load —
  ~internal-resistance Solves; resistivity R = ρL/A — s.11.circuits (Refresh; Partly: coax and wire sizing); Ohm's law,
  series–parallel — s.11 and `he.engineering.circuits-1#0`; charge from a current that varies in time, q = ∫ I dt — No [new-page].
- **Verdict:** 3 pages.

### UP2#3 he.physics.university-2#3 — Magnetic fields and induction

- **Textbooks:** UP-V2 11 (Magnetic forces and fields: a charge in a field), 12 (Sources of
  magnetic fields: Biot–Savart, the long wire, Ampère's law, solenoids), 13 (Electromagnetic
  induction: Faraday's law, motional emf), 14 (Inductance: RL circuits, energy).
- **Main — BUILD: emf in a coil from a changing field.** `induction` (magnet into a coil,
  galvanometer). Values: turns N (1–10⁵, integer), area A (m²), start field B₁ (T), end field B₂,
  time Δt, emf ε, resistance R, current I. Relations: ε = NA(B₂ − B₁) ÷ Δt; I = ε/R. Assumptions:
  B is square to the coil and changes steadily, so ε = −N dΦ/dt is constant (shown once); the sign
  (Lenz) is said in words, ε is reported as a size. Example: 200 turns, 0.01 m², 0.1 T → 0.5 T in
  0.2 s → ε = 4 V; R = 8 Ω → I = 0.5 A. startWith N, A, B₁, B₂, Δt.
- **~moving-rod — BUILD (⏳ HE-physics-P13):** Values B, rod length L, speed v, ε, R, I, force
  needed F, power P. Relations: ε = BLv; I = ε/R; F = BIL; P = Fv. Example: 0.5 T, 0.4 m, 5 m/s →
  ε = 1 V; R = 2 Ω → I = 0.5 A, F = 0.1 N, P = 0.5 W (= I²R). Interim: `induction` BIL on a wire.
- **~wire-field — BUILD (⏳ HE-physics-P14):** Values I₁, distance r, field B, second current I₂,
  force per length F/L. Relations: B = μ₀I₁ ÷ (2πr); F/L = μ₀I₁I₂ ÷ (2πr). Example: 10 A at 5 cm →
  B = 4.0 × 10⁻⁵ T; I₂ = 10 A → F/L = 4.0 × 10⁻⁴ N/m (attract, same direction).
- **~solenoid — BUILD (⏳ P14):** Values turns N, length ℓ, area A, current I, n = N/ℓ, B,
  inductance L, energy U. Relations: B = μ₀nI; L = μ₀N²A ÷ ℓ; U = ½LI². Example: 100 turns on
  0.1 m, A = 1 cm², 2 A → n = 1000 /m, B = 2.51 mT, L = 12.6 μH, U = 25.1 μJ.
- **~charged-particle — BUILD:** `induction` `mode: 'charge'`. Values charge q, mass m (allowed
  electron, proton, alpha), speed v, B, radius r, frequency f. Relations: r = mv ÷ (qB);
  f = qB ÷ (2πm). Example: proton, 2.0 × 10⁶ m/s, 0.5 T → r = 4.18 cm, f = 7.62 MHz.
- **~rl-circuit — BUILD:** Values ε, R, L, τ = L/R, t, I, final energy U. Relations:
  I = (ε/R)(1 − e^(−t/τ)); U = ½L(ε/R)². Example: 12 V, 6 Ω, 3 H → τ = 0.5 s; at 0.5 s,
  I = 2(1 − e⁻¹) = 1.26 A; U = 6 J. Picture: `functionGraph` exponential approach.
- **Answers:** Faraday's law, induced current — main Solves; rod on rails (AP C E&M FR) — ~moving-rod Partly (spring-launched bar, loop through field regions); field of a long wire, force between wires — ~wire-field Solves; solenoid
  field and inductance — ~solenoid Solves; radius and cyclotron frequency — ~charged-particle Partly (velocity selector, Hall effect, force directions); RL rise — ~rl-circuit Solves; a loop rotating in a field (generator ε = NBAω sin ωt) — No; ranked high (AP C 2025, Ellingson 8.7 twice): `~generator` [new-page].
- **Verdict:** 6 pages.

### UP2#4 he.physics.university-2#4 — AC circuits

- **Textbooks:** UP-V2 15 (Alternating-current circuits: reactance, series RLC, power, resonance,
  transformers).
- **Main — BUILD: series RLC driven at a frequency.** `complexPlane` with z = R + iX: the arrow is
  Z, its angle φ. Values: R (0.01–10⁶ Ω), L (H), C (F, menu μF), frequency f (Hz), X_L, X_C,
  impedance Z, rms voltage V, rms current I, phase φ (degrees). Relations: X_L = 2πfL;
  X_C = 1 ÷ (2πfC); Z = √(R² + (X_L − X_C)²); I = V/Z; tan φ = (X_L − X_C)/R. Assumptions: rms
  values (V_rms = V₀/√2); φ > 0 means the current lags; one current through all three.
  Example: 30 Ω, 0.2 H, 50 μF at 60 Hz, 120 V → X_L = 75.4 Ω, X_C = 53.1 Ω, Z = 37.4 Ω, I = 3.21 A,
  φ = 36.7°. startWith R, L, C, f, V.
- **~resonance — BUILD:** Values L, C, R, f₀, quality Q, bandwidth Δf. Relations:
  f₀ = 1 ÷ (2π√(LC)); Q = (1/R)√(L/C); Δf = f₀/Q. Example: 0.2 H, 50 μF, 30 Ω → f₀ = 50.3 Hz,
  Q = 2.11, Δf = 23.9 Hz. Picture: `functionGraph` I(f) peak (⏳ P18 `level` for the half-power
  line; interim the peak only).
- **~ac-power — BUILD:** Values V, I, φ, power factor cos φ, average power P, R. Relations:
  P = VI cos φ; P = I²R; cos φ = R/Z. Example (the main page's circuit): cos φ = 0.802,
  P = 120 × 3.21 × 0.802 = 309 W = 3.21² × 30. Picture: `complexPlane` (R on the real axis).
- **Answers:** impedance, current and phase (UP-V2 15.3) — main Solves; resonant frequency, Q — ~resonance Partly (tuner capacitance range); average power and power factor — ~ac-power Solves; reactance of one part —
  main Solves; transformer turns ratio — s.11.electromagnetism (Refresh); phasor diagram reading
  — main's picture; inductors in series and parallel — No.
- **Verdict:** 3 pages.

## Course 3. he.physics.university-3 — University Physics III: Waves, Optics & Modern

Prerequisite: UP2. Textbooks: UP-V1 16–17 (waves, sound) and OpenStax University Physics Vol. 3
(UP-V3) 3–10.

### UP3#0 he.physics.university-3#0 — Waves

- **Textbooks:** UP-V1 16 (Waves: wave speed on a string, energy and power, standing waves), 17
  (Sound: intensity and decibels).
- **Main — BUILD: a sinusoidal wave on a string.** `wave` (wavelength and amplitude marked).
  Values: tension F_T (0.01–10⁵ N), linear density μ (kg/m), speed v, frequency f (Hz), wavelength
  λ, wave number k (rad/m), angular frequency ω (rad/s), amplitude A, power P. Relations:
  v = √(F_T/μ); v = fλ; k = 2π/λ; ω = 2πf; P = ½μvω²A². Assumptions: y(x, t) = A sin(kx − ωt) moves
  toward +x; v depends on the string, f on the source; small amplitudes. Example: 100 N,
  0.01 kg/m → v = 100 m/s; f = 50 Hz → λ = 2 m, k = π rad/m, ω = 314 rad/s; A = 5 mm →
  P = 1.23 W. startWith F_T, μ, f, A.
- **~standing-string — BUILD:** `wave` `standing` string. Values L, v (or F_T, μ), harmonic n, λₙ,
  fₙ. Relations: λₙ = 2L/n; fₙ = nv ÷ (2L). Example: 0.8 m, 100 m/s, n = 3 → λ = 0.533 m,
  f = 187.5 Hz.
- **~intensity-db — BUILD:** Values source power P, distance r, intensity I, level β (dB).
  Relations: I = P ÷ (4πr²); β = 10 log(I/I₀), I₀ = 10⁻¹² W/m². Example: 1 W at 10 m →
  I = 7.96 × 10⁻⁴ W/m², β = 89.0 dB. Picture: table (interim) sweeping r (1, 2, 4, 8 m): −6 dB a
  doubling.
- **Answers:** speed on a string, λ from f — main Solves; wave function parameters from
  y = A sin(kx − ωt) — main Solves; power carried — main Solves; harmonics of a string — ~standing-string Partly (free end, open and closed pipes); decibels and the inverse square — ~intensity-db Solves; beats f = |f₁ − f₂| and Doppler
  — s.11.sound-waves (Refresh); normal modes from an initial shape by Fourier series (8.03SC) — No [new-page]; dispersion, group and phase velocity — No [new-page].
- **Verdict:** 3 pages.

### UP3#1 he.physics.university-3#1 — Interference and diffraction

- **Textbooks:** UP-V3 3 (Interference: Young's double slit, thin films), 4 (Diffraction: single
  slit, gratings, resolution).
- **Main — BUILD: Young's double slit.** `rayDiagram` slits. Values: wavelength λ (100–2000 nm),
  slit spacing d (mm), screen distance L (m), order m (integer −20–20), angle θ, position y.
  Relations: d sin θ = mλ (bright); y = L tan θ. Assumptions: one wavelength, both slits in step;
  the small-angle y ≈ mλL/d is named but the page uses tan, so it holds at any angle. Example:
  600 nm, 0.25 mm, 2.0 m, m = 3 → sin θ = 7.2 × 10⁻³, θ = 0.41°, y = 14.4 mm. startWith λ, d, L, m.
- **~single-slit — BUILD (⏳ HE-physics-P15 `singleSlit`):** a sin θ = mλ (dark). Values λ, slit
  width a, L, central width w. Relation: w = 2L tan θ₁. Example: 500 nm, 0.10 mm, 1.5 m →
  w = 15 mm. Interim: `rayDiagram` slits.
- **~grating — BUILD (⏳ P15 `grating`):** Values lines per mm N, d = 1/N, λ, order m, θ, highest
  order m_max = floor(d/λ). Example: 600 lines/mm, 500 nm → d = 1.667 μm, θ₁ = 17.5°,
  θ₂ = 36.9°, θ₃ = 64.2°, m_max = 3.
- **~thin-film — BUILD (⏳ P15 `thinFilm`):** Values film index n, thickness t, order m (0–10),
  reflected bright λ. Relation: 2nt = (m + ½)λ (one reflection flips, film in air). Example: soap
  n = 1.33, t = 100 nm, m = 0 → λ = 532 nm (green). Assumption names the other case (both or
  neither flip: 2nt = mλ).
- **Answers:** fringe position and spacing — main Solves; central maximum width — ~single-slit
  Solves; grating angles and orders — ~grating Solves; thin-film color, least thickness —
  ~thin-film Solves; Rayleigh resolution θ = 1.22λ/D — No (propose `~resolution` with the
  `rayDiagram` telescope); two-slit intensity I₀cos²(πd sin θ/λ) — Partly (add I as a value on
  main if the research ranks it); Michelson fringe counting — No [new-page]; read a diffraction pattern (which slits, which wavelength) — No [new-page]; geometric optics (refraction, fibres, telescopes) — No (no taxonomy topic).
- **Verdict:** 4 pages.

### UP3#2 he.physics.university-3#2 — Special relativity

- **Textbooks:** UP-V3 5 (Relativity: time dilation, length contraction, Lorentz transformation,
  velocity addition, relativistic momentum and energy).
- **Main — BUILD: time dilation and length contraction.** `lightClock` (the slant, γ, the rod
  L₀/γ). Values: speed β = v/c (0–0.9999), γ, proper time Δt₀, moving time Δt, proper length L₀,
  contracted length L. Relations: γ = 1 ÷ √(1 − β²); Δt = γΔt₀; L = L₀/γ. Assumptions: Δt₀ and L₀
  are measured in the object's own frame; only lengths along the motion shrink. Example: β = 0.6
  → γ = 1.25; a muon's 2.2 μs → 2.75 μs; a 100 m ship → 80 m. startWith β, Δt₀, L₀.
- **~velocity-addition — BUILD (⏳ HE-physics-P16):** u = (v + u′) ÷ (1 + vu′/c²) in units of c.
  Values v, u′, u. Example: 0.6c + 0.6c → 1.2 ÷ 1.36 = 0.882c. Interim: table sweeping u′ (0.2,
  0.6, 0.9, 0.99) for u.
- **~energy-momentum — BUILD:** `vectorDiagram` components: legs pc and mc², hypotenuse E.
  Values: rest energy mc² (allowed electron 0.511, proton 938.3 MeV; any), β, γ, total E, kinetic
  K, momentum pc (MeV). Relations: E = γmc²; K = (γ − 1)mc²; pc = γβmc²; E² = (pc)² + (mc²)².
  Example: electron at 0.6c → E = 0.639 MeV, K = 0.128 MeV, pc = 0.383 MeV (√(0.383² + 0.511²) =
  0.639).
- **~lorentz — BUILD (⏳ P16):** Values β, γ, event x (m), ct (m), x′, ct′, interval s².
  Relations: x′ = γ(x − β·ct); ct′ = γ(ct − βx); s² = (ct)² − x². Example: β = 0.6, x = 900 m,
  ct = 600 m → x′ = 675 m, ct′ = 75 m; s² = −450,000 m² in both frames.
- **Answers:** dilated lifetime, contracted length — main Solves; relativistic velocity addition
  — ~velocity-addition Solves; total and kinetic energy, momentum, speed from K — ~energy-momentum Partly (decay products, ultrarelativistic limits); Lorentz transformation of an event, simultaneity — ~lorentz Solves;
  invariant interval — ~lorentz Solves; Doppler for light — No (s.12 cosmology redshift covers
  z; propose later).
- **Verdict:** 4 pages.

### UP3#3 he.physics.university-3#3 — Photons and quantum basics

- **Textbooks:** UP-V3 6 (Photons and matter waves: blackbody, photoelectric, Compton, Bohr,
  de Broglie, wave–particle duality), 7.2 (the uncertainty principle).
- **Main — BUILD (⏳ HE-physics-P17): Compton scattering.** Values: incoming wavelength λ
  (1–1000 pm), angle θ (0–180°), shift Δλ, scattered λ′, photon energies E, E′ (keV), electron
  kinetic energy K. Relations: Δλ = (h/mₑc)(1 − cos θ) = 2.426 pm × (1 − cos θ); λ′ = λ + Δλ;
  E = hc/λ; K = E − E′. Assumptions: the electron starts free and at rest; energy and momentum are
  both kept; the shift doesn't depend on λ. Example: 71.0 pm at 90° → Δλ = 2.43 pm, λ′ = 73.4 pm,
  E = 17.46 keV, E′ = 16.89 keV, K = 0.58 keV. startWith λ, θ. Interim: table sweeping θ (0°, 45°, 90°,
  135°, 180°) for λ′ and K.
- **~photoelectric — BUILD:** `photoelectric` (with `blank`). Values λ, photon energy E (eV), work
  function φ, K_max, stopping potential V₀, threshold λ₀. Relations: E = 1240/λ; K_max = E − φ;
  V₀ = K_max/e; λ₀ = 1240/φ. Example: 250 nm on sodium (φ = 2.28 eV) → 4.96 eV, K_max = 2.68 eV,
  V₀ = 2.68 V, λ₀ = 544 nm. (The s.11 page has no V₀; this one adds it and the Millikan line
  K_max against f in an assumption.)
- **~de-broglie — BUILD:** λ = h/p, p = √(2mK) (slow next to c). Values: particle mass (allowed
  electron, proton, neutron), accelerating voltage V or kinetic energy K (eV), momentum p, λ.
  Example: an electron through 100 V → p = 5.40 × 10⁻²⁴ kg·m/s, λ = 0.123 nm. Picture: table
  sweeping V (1, 10, 100, 1000 V).
- **~uncertainty — BUILD:** Δx·Δp ≥ ħ/2. Values: particle mass, Δx, least Δp, least Δv.
  Example: an electron in 0.1 nm → Δp ≥ 5.27 × 10⁻²⁵ kg·m/s, Δv ≥ 5.79 × 10⁵ m/s. Picture: `none`.
  The relation is an inequality: the page shows the least values and says "at least" in the
  answer line (a page limit, never a step).
- **~bohr — BUILD:** `orbitalDiagram` hydrogen levels and emission lines. Values n_upper,
  n_lower, Eᵤ, Eₗ, photon energy ΔE, λ, series name. Relations: Eₙ = −13.6 eV ÷ n²;
  λ = 1240/ΔE. Example: 3 → 2: ΔE = 1.89 eV, λ = 656 nm (H-alpha, Balmer).
- **Answers:** Compton shift and electron energy — main Solves; stopping potential, threshold —
  ~photoelectric Solves; de Broglie wavelength of an accelerated electron — ~de-broglie Solves;
  least speed uncertainty — ~uncertainty Solves; hydrogen line wavelengths — ~bohr Partly (Z scaling, positronium reduced mass);
  blackbody peak and power — TS#3~photon-gas (cross-link); atomic spectra and scales (X-ray lines, Franck–Hertz, Z scaling) — No (no taxonomy topic).
- **Verdict:** 5 pages.

### UP3#4 he.physics.university-3#4 — Nuclear physics

- **Textbooks:** UP-V3 10 (Nuclear physics: binding energy, decay rates, decay types, fission and
  fusion).
- **Main — BUILD: binding energy from the mass defect.** `chemDiagram` Δm (the mass defect bars).
  Values: protons Z (1–118), neutrons N (0–180), atomic mass M (u), mass defect Δm, binding
  energy B (MeV), B per nucleon. Relations: Δm = Z × 1.007825 u + N × 1.008665 u − M;
  B = 931.5 MeV × Δm (per u); B/A with A = Z + N. Assumptions: atomic masses (the electrons
  cancel by using hydrogen-atom masses); higher B/A is more tightly bound, iron's region is the
  peak. Example: He-4, M = 4.002603 u → Δm = 0.030377 u, B = 28.3 MeV, 7.07 MeV per nucleon.
  startWith Z, N, M.
- **~decay-law — BUILD:** `decayChart` (100 atoms, half-life curve). Values half-life T½, decay
  constant λ, N₀, time t, N, activity A (Bq). Relations: λ = ln 2 ÷ T½; N = N₀e^(−λt); A = λN.
  Example: I-131 (T½ = 8.02 d), N₀ = 1.0 × 10¹⁵, t = 24.06 d → N = 1.25 × 10¹⁴,
  λ = 1.00 × 10⁻⁶ /s, A = 1.25 × 10⁸ Bq.
- **~q-value — BUILD:** `decayChart` nuclear equation balanced. Values: parent mass, daughter
  mass, emitted particle mass (allowed alpha 4.002603 u, electron mass via atomic masses), Q (MeV).
  Relation: Q = (M_parent − M_daughter − M_particle) × 931.5 MeV/u. Example: U-238 → Th-234 + α:
  Δm = 0.004584 u → Q = 4.27 MeV. Assumption: Q > 0 means it can happen on its own.
- **Answers:** binding energy per nucleon — main Solves; activity and remaining nuclei, age from
  a fraction — ~decay-law Solves; energy released in alpha decay — ~q-value Solves; fission energy
  of one event — ~q-value Partly (two products and neutrons: up to 3 masses on the right needs a
  fourth value; propose `products` 1–3 as an allowed count); dose and shielding — No (out of the
  core topics).
- **Verdict:** 3 pages.

## Course 4. he.physics.classical-mechanics — Classical Mechanics

Prerequisites: UP1, `he.math.diff-eq`. Standard text: Taylor, Classical Mechanics (all rights
reserved; chapter titles only): 7 Lagrange's equations, 8 Two-body central-force problems,
9 Mechanics in noninertial frames, 10 Rotational motion of rigid bodies, 11 Coupled oscillators
and normal modes, 13 Hamiltonian mechanics. Open: Cline, Variational Principles in Classical
Mechanics (LibreTexts); Tong, Classical Dynamics.

### CM#0 he.physics.classical-mechanics#0 — Lagrangian mechanics

- **Main — BUILD (layout: sequence, E1): "The Lagrangian method".** The method is the lesson; the
  numbers come in the problem types. Stages, one right order: "Pick one generalized coordinate
  for each degree of freedom", "Write the kinetic energy T in those coordinates and their rates",
  "Write the potential energy V in the same coordinates", "Form the Lagrangian L = T − V", "Write
  d/dt(∂L/∂q̇) = ∂L/∂q for each coordinate", "Solve the equations of motion, or read off what is
  conserved". (T and V are separate stages in a fixed order so the sequence has one answer; the
  assumption says either could come first on paper — if the reviewer objects, merge them into
  one stage.) Question: "Put the steps of the Lagrangian method in order." Assumptions:
  constraints are holonomic; forces come from a potential; a coordinate missing from L has a
  conserved momentum. No spans.
- **~atwood — BUILD (⏳ HE-physics-P2):** an Atwood machine with a disk pulley, by Lagrange.
  Values m₁, m₂, pulley mass M (I = ½MR²), a, T₁, T₂. Steps: the coordinate x (m₂'s drop); T =
  ½(m₁ + m₂ + I/R²)ẋ²; V = (m₁ − m₂)gx; Euler–Lagrange → a = (m₂ − m₁)g ÷ (m₁ + m₂ + ½M);
  T₁ = m₁(g + a); T₂ = m₂(g − a). Example: 3 kg, 5 kg, M = 2 kg → a = 19.6 ÷ 9 = 2.18 m/s²,
  T₁ = 35.9 N, T₂ = 38.1 N (their difference turns the pulley). Each step's how line names the
  Lagrangian stage it is (E2 for ∂ lines).
- **~bead-hoop — BUILD:** a bead on a hoop spun about its vertical diameter. Values: hoop radius
  R, spin ω (rad/s), critical spin ω_c = √(g/R), off-bottom angle θ₀, small-oscillation frequency
  Ω. Relations: cos θ₀ = g ÷ (ω²R) (only when ω > ω_c; else θ₀ = 0); Ω = ω sin θ₀ (above ω_c),
  Ω = √(ω_c² − ω²) (below). Example: R = 0.2 m, ω = 10 rad/s → ω_c = 7.0 rad/s, cos θ₀ = 0.49,
  θ₀ = 60.7°, Ω = 8.72 rad/s. Picture: table (interim) sweeping ω (5, 7, 10, 20 rad/s) for θ₀;
  ⏳ HE-physics-P20 `hoop` (the bead and its effective-potential curve).
- **Answers:** derive the equation of motion for a given system (Taylor 7) — the sequence names
  the method, Partly (no symbolic engine: the result is checked, not derived for any system);
  Atwood with a massive pulley — ~atwood Solves; bead on a rotating hoop, equilibria and
  stability — ~bead-hoop Solves; pendulum on a moving support, double pendulum — No (7 items, the most common kind) (symbolic;
  "no page" unless a closed form is common in the research); calculus of variations (brachistochrone, catenary) — No [new-page].
- **Verdict:** 3 pages (1 sequence, 2 calculators).

### CM#1 he.physics.classical-mechanics#1 — Hamiltonian mechanics

- **Main — BUILD (⏳ HE-physics-P20): a harmonic oscillator in phase space.** Values: mass m
  (0.001–1000 kg), spring constant k, position x, momentum p (kg·m/s), energy H (J), velocity
  ẋ = ∂H/∂p, force ṗ = −∂H/∂x, angular frequency ω, phase-space area 𝒜 (J·s). Relations:
  H = p²/2m + ½kx²; ẋ = p/m; ṗ = −kx; ω = √(k/m); 𝒜 = 2πH/ω. Assumptions: H is the total energy
  and is conserved, so the point stays on one ellipse; Hamilton's equations give the flow (shown
  once); the ellipse's half-widths are √(2H/k) and √(2mH). Example: m = 2 kg, k = 8 N/m (ω = 2);
  x = 0.5 m, p = 2 kg·m/s → H = 1 + 1 = 2 J, ẋ = 1 m/s, ṗ = −4 N, 𝒜 = 2π = 6.28 J·s. startWith
  m, k, x, p. Interim: `conicGraph` ellipse (x, p axes) with the point.
- **~pendulum-phase — BUILD (⏳ P20):** swing or go over the top. Values: mass m, length L,
  speed at the bottom ω₀ (rad/s), energy E, separatrix energy E_s, largest angle θ_max (or "goes
  over the top"). Relations: E = ½mL²ω₀²; E_s = 2mgL; cos θ_max = 1 − E ÷ (mgL) (when E < E_s).
  Example: 1 kg, 1 m, ω₀ = 5 rad/s → E = 12.5 J < 19.6 J, θ_max = 106.0°; it goes over the top
  when ω₀ > √(4g/L) = 6.26 rad/s.
- **Answers:** Hamilton's equations for a given H — main Solves for the oscillator, Partly
  otherwise; phase-space trajectories and areas — main Solves; libration vs rotation —
  ~pendulum-phase Solves; Legendre transform from L to H — No (symbolic; the main page's
  assumption states H = pẋ − L for this system); Poisson brackets — no page (symbolic); canonical transformations, Hamilton–Jacobi, action–angle variables — No [new-page] (11 items, 8.09).
- **Verdict:** 2 pages.

### CM#2 he.physics.classical-mechanics#2 — Central forces

- **Main — BUILD: an orbit from its closest point.** `circularMotion` kepler (ellipse with the
  areas). Values: GM (allowed Earth 3.986 × 10¹⁴, Sun 1.327 × 10²⁰ m³/s²; any), closest distance
  r_p, speed there v_p, eccentricity e, semi-major axis a, farthest distance r_a, period T.
  Relations: e = r_pv_p² ÷ GM − 1; 1/a = 2/r_p − v_p² ÷ GM; r_a = a(1 + e); T = 2π√(a³ ÷ GM).
  Assumptions: the central body is far heavier (one-body form; the reduced mass is named);
  e < 1 is an ellipse, e ≥ 1 escapes (the page stops at e < 1 and says so); L and E are
  conserved. Example: Earth, r_p = 7000 km, v_p = 8.5 km/s → e = 0.269, a = 9574 km,
  r_a = 12,147 km, T = 9322 s (2.59 h). startWith GM, r_p, v_p.
- **~turning-points — BUILD (⏳ HE-physics-P18 `level`):** the effective potential per unit mass,
  U_eff = −GM/r + h²/(2r²). Values GM, energy per mass ε (J/kg, < 0), angular momentum per mass h
  (m²/s), r_min, r_max. Relation: εr² + GMr − h²/2 = 0, its two roots. Example (the main page's
  orbit): ε = −2.082 × 10⁷ J/kg, h = 5.95 × 10¹⁰ m²/s → r = 7000 km and 12,147 km. Picture:
  `functionGraph` rational (top −GM·r + h²/2 over r²) with the ε line and its crossings ringed.
- **~escape — BUILD:** `circularMotion` `mode: 'satellite'`. Values GM, r, circular speed v_c,
  escape speed v_esc. Relations: v_c = √(GM/r); v_esc = √2·v_c. Example: Earth's surface → v_c =
  7.91 km/s, v_esc = 11.19 km/s.
- **~hohmann — BUILD (⏳ HE-physics-P3 `transfer`):** Values GM, r₁, r₂, Δv₁, Δv₂, total Δv, transfer
  time t. Relations: Δv₁ = √(GM/r₁)(√(2r₂ ÷ (r₁ + r₂)) − 1); Δv₂ = √(GM/r₂)(1 − √(2r₁ ÷ (r₁ + r₂)));
  t = π√(((r₁ + r₂)/2)³ ÷ GM). Example: 6700 km to 42,164 km round Earth → Δv₁ = 2.42 km/s,
  Δv₂ = 1.46 km/s, total 3.88 km/s, t = 5.28 h. Interim: `circularMotion` kepler with
  e = (r₂ − r₁)/(r₂ + r₁).
- **Answers:** orbit shape and period from one point — main Solves; turning points from E and L —
  ~turning-points Solves; escape speed — ~escape Solves; Hohmann transfer — ~hohmann Solves;
  the orbit equation r(θ) = p ÷ (1 + e cos θ) — Partly (main's picture; propose θ as a value if
  ranked); two-body reduced mass — main's assumption, Partly; power-law forces other than 1/r² —
  No; scattering cross-section (hard sphere, Rutherford) — No [new-page].
- **Verdict:** 4 pages.

### CM#3 he.physics.classical-mechanics#3 — Rigid-body motion

- **Main — BUILD (⏳ HE-physics-P21): gyroscope precession.** Values: rotor mass m, rotor radius R,
  I = ½mR², spin ω (rad/s), spin angular momentum L, pivot-to-center distance r, torque τ,
  precession rate Ω, precession period T_p. Relations: L = Iω; τ = mgr; Ω = τ/L; T_p = 2π/Ω.
  Assumptions: fast spin (L much larger than the precession's own angular momentum); the axle is
  level; the torque turns L sideways, not down. Example: 0.5 kg, R = 4 cm → I = 4 × 10⁻⁴ kg·m²;
  ω = 300 rad/s → L = 0.12 kg·m²/s; r = 5 cm → τ = 0.245 N·m, Ω = 2.04 rad/s, T_p = 3.08 s.
  startWith m, R, ω, r. Interim: `rotor` disk.
- **~principal-axes — BUILD (⏳ HE-physics-P22):** a thin rectangular plate. Values mass M, sides
  a, b, I₁ = Mb²/12, I₂ = Ma²/12, I₃ = I₁ + I₂ (perpendicular-axis theorem), the spin-stable axes.
  Example: 3 kg, 0.4 m × 0.3 m → I₁ = 0.0225, I₂ = 0.04, I₃ = 0.0625 kg·m²; spin about the largest
  or smallest is stable, about the middle one it tumbles (the tennis-racket theorem).
- **~coriolis — BUILD:** the noninertial terms on Earth. Values latitude λ (−90–90°), speed v,
  Coriolis acceleration a_c, Foucault period T_F. Relations: a_c = 2Ωv sin λ (horizontal part),
  Ω = 7.292 × 10⁻⁵ rad/s; T_F = 23.93 h ÷ sin λ. Example: 500 m/s at 45° → a_c = 0.0516 m/s²;
  T_F = 33.8 h. Picture: table (interim) sweeping λ (15°, 30°, 45°, 60°, 90°).
- **Answers:** precession rate — main Solves; principal moments and stability — ~principal-axes
  Solves; Coriolis deflection, Foucault pendulum — ~coriolis Solves; Euler's equations for torque-
  free motion of a symmetric top (body-frame precession Ω_b = ω₃(I₃ − I₁)/I₁) — No (propose
  `~free-top` once P22 draws the body cone); inertia tensor with products of inertia — No
  (needs 3 × 3; E5 is 2 × 2); Euler angles and rotation matrices — No.
- **Verdict:** 3 pages.

### CM#4 he.physics.classical-mechanics#4 — Coupled oscillations

- **Main — BUILD (⏳ HE-physics-P23, E5): two equal masses, three springs.** Values: mass m, outer
  springs k, coupling spring k′, slow-mode ω₁, fast-mode ω₂, frequencies f₁, f₂, energy-exchange
  period T_ex. Relations: ω₁ = √(k/m) (in step); ω₂ = √((k + 2k′)/m) (opposite); T_ex = 2π ÷ (ω₂ −
  ω₁). Steps: the 2 × 2 matrix (k + k′, −k′; −k′, k + k′)/m, its characteristic equation, the
  two eigenvalues, each mode's shape (1, 1) and (1, −1) on `matrixGrid`. Assumptions: small motions
  along the line, no friction; any motion is a mix of the two modes. Example: 1 kg, k = 100 N/m,
  k′ = 10.5 N/m → ω₁ = 10, ω₂ = 11 rad/s; T_ex = 6.28 s (one mass started alone hands all its
  motion to the other and back). startWith m, k, k′. Interim: `matrixGrid`.
- **~chain — BUILD (E5):** wall–k₁–m₁–k₂–m₂, the far end free. Values m₁, m₂, k₁, k₂, ω₁, ω₂,
  amplitude ratios r₁, r₂ (x₂/x₁ in each mode). Relations: the characteristic equation
  m₁m₂ω⁴ − (m₂(k₁ + k₂) + m₁k₂)ω² + k₁k₂ = 0; r = (k₁ + k₂ − m₁ω²)/k₂. Example: 1 kg each,
  k₁ = 200, k₂ = 100 N/m → ω² = 100(2 ∓ √2) → ω₁ = 7.65, ω₂ = 18.48 rad/s; r₁ = 2.41, r₂ = −0.41.
  Picture: `matrixGrid` (⏳ P23 for the masses).
- **Answers:** normal-mode frequencies and shapes — main, ~chain Solve; beats and energy
  exchange — main Solves; initial conditions into modes — Partly (propose x₁(0), x₂(0) values on
  main: amplitudes (x₁ ± x₂)/2); three masses or a string of beads — No (3 × 3).
- **Verdict:** 2 pages.

## Course 5. he.physics.electromagnetism — Electromagnetic Theory

Prerequisites: UP2, `he.math.calc-3`. Standard text: Griffiths, Introduction to Electrodynamics
(all rights reserved; chapter titles only): 2 Electrostatics, 3 Potentials (Laplace, images,
multipoles), 5 Magnetostatics, 7 Electrodynamics, 9 Electromagnetic waves. Open: Ellingson,
Electromagnetics Vol. 1–2; Tong, Electromagnetism; MIT OCW 8.07.

### EM#0 he.physics.electromagnetism#0 — Electrostatics

- **Main — BUILD (⏳ HE-physics-P24): a charged ring, on its axis.** Values: charge Q (C, menu nC),
  ring radius R, axial distance z, potential V, field E_z. Relations: V = kQ ÷ √(z² + R²);
  E_z = −dV/dz = kQz ÷ (z² + R²)^(3/2). Assumptions: charge spread evenly round a thin ring; on the
  axis the sideways parts cancel; V is found first (a scalar integral, shown once) and E from its
  slope. Example: 10 nC, R = 0.3 m, z = 0.4 m → √(z² + R²) = 0.5 m, V = 179.8 V,
  E = 89.9 × 0.4 ÷ 0.125 = 287.7 N/C. startWith Q, R, z. Interim: `functionGraph` of E_z(z) with
  the point (the maximum at z = R/√2 ringed).
- **~disk — BUILD (⏳ P24):** E = 2πkσ(1 − z ÷ √(z² + R²)). Values σ, R, z, E, the sheet limit
  2πkσ. Example: 1 μC/m², R = 0.3 m, z = 0.4 m → 2πkσ = 56,486 N/C, E = 11,297 N/C (far from the
  edge it nears the sheet value; far away, a point charge).
- **~images — BUILD (⏳ P24 `image`):** a charge above a grounded plane. Values q, height d, force
  F, induced charge density under it σ₀, total induced charge. Relations: F = kq² ÷ (2d)²;
  σ₀ = −q ÷ (2πd²); total = −q. Example: 1 nC at 5 cm → F = 8.99 × 10⁻⁷ N (toward the plane),
  σ₀ = −6.37 × 10⁻⁸ C/m².
- **~dipole — BUILD:** `charges` with `equipotentials`. Values q, separation s, dipole moment
  p = qs, distance r, angle θ, potential V. Relation: V = kp cos θ ÷ r² (r ≫ s). Example: 1 nC,
  1 mm → p = 10⁻¹² C·m; r = 0.1 m, θ = 0 → V = 0.899 V; θ = 90° → 0.
- **Answers:** V and E of a ring, disk, line segment by integration (Griffiths 2) — ring, disk
  Solve; line segment — No (propose `~segment`, the same pattern); method of images — ~images
  Solves (plane; sphere images — No); dipole potential and field — ~dipole Solves for V; energy of
  a charge configuration W = ½Σ qV — No (propose with P24); Laplace's equation by separation —
  no page (a derivation; its results feed ~images and the assumptions); multipole expansion and Laplace in spherical coordinates — No [new-page]; divergence and curl of a given field — No [new-page]; fields in dielectrics, D and bound charge — Partly (UP2#1~dielectric).
- **Verdict:** 4 pages.

### EM#1 he.physics.electromagnetism#1 — Magnetostatics

- **Main — BUILD (⏳ HE-physics-P14): a current loop, on its axis (Biot–Savart).** Values: current
  I, loop radius R, axial distance z, field B, field at the center B₀. Relations:
  B = μ₀IR² ÷ (2(z² + R²)^(3/2)); B₀ = μ₀I ÷ (2R). Assumptions: each piece dl adds dB by
  Biot–Savart; on the axis the sideways parts cancel (shown once); far away it is a dipole,
  B ≈ μ₀IR²/(2z³). Example: 5 A, R = 0.1 m → B₀ = 31.4 μT; z = 0.1 m → B = 11.1 μT (B₀ × 0.354).
  startWith I, R, z. Interim: `functionGraph` of B(z).
- **~ampere-wire — BUILD (⏳ P14):** a thick wire with even current. Values I, wire radius a, r,
  B. Relations: B = μ₀Ir ÷ (2πa²) inside; B = μ₀I ÷ (2πr) outside. Example: 20 A, a = 2 mm →
  r = 1 mm: 1.0 mT; r = 4 mm: 1.0 mT (the peak, 2.0 mT, at the surface).
- **~toroid — BUILD (⏳ P14):** B = μ₀NI ÷ (2πr) inside the windings, 0 outside. Values N, I, r,
  B. Example: 500 turns, 2 A, r = 0.1 m → B = 2.0 mT.
- **~loop-torque — BUILD:** a coil in a uniform field. Values turns N, current I, area A, moment
  μ = NIA, field B, angle θ (between μ and B), torque τ, energy U. Relations: τ = μB sin θ;
  U = −μB cos θ. Example: 50 turns, 0.5 A, 0.01 m² → μ = 0.25 A·m²; 0.2 T at 30° → τ =
  0.025 N·m, U = −0.0433 J. Picture: `torque` (⏳ P14 `loop` for the coil in its field).
- **Answers:** field of a loop on its axis — main Solves; Ampère's law, inside and outside a
  wire — ~ampere-wire Solves; toroid, solenoid — ~toroid Solves, solenoid in UP2#3~solenoid;
  magnetic dipole torque and energy — ~loop-torque Solves; vector potential A — no page (calc-3
  symbolic); field of a finite straight segment — No (propose with P14); magnetization and magnetic dipoles in matter — No [new-page].
- **Verdict:** 4 pages.

### EM#2 he.physics.electromagnetism#2 — Maxwell's equations

- **Main — BUILD (layout: sort, E1): "What each of Maxwell's equations says".** Bins: "Gauss's law",
  "Gauss's law for magnetism", "Faraday's law", "Ampère–Maxwell law". Cards (each one right bin):
  "Field lines start on positive charge and end on negative charge" → Gauss; "∇·E = ρ/ε₀" →
  Gauss; "Coulomb's law follows from it for a point charge" → Gauss; "Every magnetic field line
  closes on itself" → magnetism; "∇·B = 0" → magnetism; "Cutting a bar magnet in half gives two
  magnets" → magnetism; "A changing magnetic flux drives a current round a loop" → Faraday;
  "∇×E = −∂B/∂t" → Faraday; "A transformer steps a voltage up or down" → Faraday; "A current in a
  wire is circled by a magnetic field" → Ampère–Maxwell; "∇×B = μ₀J + μ₀ε₀∂E/∂t" → Ampère–Maxwell;
  "A charging capacitor has a magnetic field between its plates" → Ampère–Maxwell. `pickBar`
  (12 cards). Sentence: "Two equations say where fields come from; two say how a changing field
  makes the other." Assumptions: SI units, fields in vacuum; the integral and differential forms
  say the same thing.
- **~displacement-current — BUILD (⏳ P14):** between round capacitor plates while charging.
  Values: charging current I, plate radius R, distance from the axis r (≤ R), displacement current
  inside r I_d, field B, rate dE/dt. Relations: dE/dt = I ÷ (ε₀πR²); I_d = I(r/R)²;
  B = μ₀I_d ÷ (2πr) = μ₀Ir ÷ (2πR²). Example: 2 A, R = 5 cm, r = 3 cm → dE/dt = 2.88 × 10¹³ V/(m·s),
  I_d = 0.72 A, B = 4.8 μT. Interim: `capacitor` plates.
- **Answers:** which law explains a phenomenon — main Solves; displacement current and B between
  plates — ~displacement-current Solves; Maxwell's equations in integral form applied to a
  symmetric case — UP2#0, EM#1 pages (Refresh); continuity equation, gauge — no page (derivations).
- **Verdict:** 2 pages (1 sort).

### EM#3 he.physics.electromagnetism#3 — Electromagnetic waves

- **Main — BUILD (⏳ HE-physics-P25): a plane wave's fields, intensity and pressure.** Values: field
  amplitude E₀ (V/m), magnetic amplitude B₀ (T), intensity I (W/m²), radiation pressure on an
  absorber P_a, on a mirror P_r, wavelength λ, frequency f. Relations: B₀ = E₀/c;
  I = ½cε₀E₀²; P_a = I/c; P_r = 2I/c; c = fλ. Assumptions: in vacuum, E ⟂ B ⟂ the direction of
  travel; I is the time-averaged Poynting vector (shown once, S = E × B/μ₀). Example: sunlight
  at Earth, I = 1361 W/m² → E₀ = 1013 V/m, B₀ = 3.38 μT, P_a = 4.54 μPa. startWith I. Interim:
  `wave` plain with E₀ as its amplitude.
- **~point-source — BUILD:** Values power P, distance r, I, E₀. Relations: I = P ÷ (4πr²);
  E₀ = √(2I ÷ (cε₀)). Example: 100 W at 2 m → I = 1.99 W/m², E₀ = 38.7 V/m. Picture: table
  sweeping r.
- **~reflection — BUILD:** `rayDiagram` Snell (normal incidence drawn). Values n₁, n₂, reflected
  fraction R, transmitted T. Relations: R = ((n₁ − n₂) ÷ (n₁ + n₂))²; T = 1 − R. Example: air to
  glass 1.5 → R = 0.04, T = 0.96.
- **Answers:** E₀, B₀ from intensity; radiation pressure and force on a sail — main Solves;
  intensity and field from a lamp or antenna — ~point-source Solves; normal-incidence reflection —
  ~reflection Solves; oblique Fresnel equations, Brewster's angle — Partly (Brewster
  tan θ_B = n₂/n₁ fits ~reflection as a value; propose it); waves in conductors, skin depth — No; ranked high (9 items, Ellingson Vol. 2): `~skin-depth` [new-page]; radiation from accelerating charges and dipoles (Larmor) — No [new-page]; waveguide modes and cutoff — No [new-page].
- **Verdict:** 3 pages.

## Course 6. he.physics.quantum — Quantum Mechanics

Prerequisites: UP3, `he.math.linear-algebra`, `he.math.diff-eq`. Standard text: Griffiths,
Introduction to Quantum Mechanics (all rights reserved; chapter titles only): 1 The wave
function, 2 Time-independent Schrödinger equation, 3 Formalism, 4 Quantum mechanics in three
dimensions (angular momentum, spin), 7 Time-independent perturbation theory (3rd ed.). Open: MIT
OCW 8.04/8.05; Tong, Quantum Mechanics; LibreTexts (Fitzpatrick).

### QM#0 he.physics.quantum#0 — Wavefunctions and operators

- **Main — BUILD (⏳ HE-physics-P19, P18 `area`): the chance of finding a particle in a region of
  a box.** Values: state n (1–20, integer), box width L (nm), from x₁, to x₂ (0 ≤ x₁ < x₂ ≤ L),
  probability P. Relation: P = ∫ from x₁ to x₂ of (2/L)sin²(nπx/L) dx = (x₂ − x₁)/L −
  (sin(2nπx₂/L) − sin(2nπx₁/L)) ÷ (2nπ). Assumptions: ψₙ = √(2/L) sin(nπx/L) is normalized
  (∫|ψ|² = 1 over the box, shown once); |ψ|² is a probability per length; the sines are in
  radians. Example: n = 1, L = 1 nm, 0 to 0.25 nm → P = 0.25 − 1/(2π) = 0.0908; for n = 2 the same
  region gives 0.25. startWith n, L, x₁, x₂. Interim: `functionGraph` sin² with `riemann`
  (n = 50 middle strips) shading the region.
- **~spread — BUILD (⏳ P19):** ⟨x⟩, Δx, Δp in the box. Values n, L, ⟨x⟩ = L/2, ⟨x²⟩, Δx, Δp,
  product ΔxΔp in units of ħ. Relations: ⟨x²⟩ = L²(1/3 − 1 ÷ (2n²π²)); Δx = √(⟨x²⟩ − ⟨x⟩²);
  Δp = nπħ/L. Example: n = 1, 1 nm → Δx = 0.181 nm, Δp = 3.31 × 10⁻²⁵ kg·m/s, ΔxΔp = 0.568ħ
  (≥ ħ/2, as it must be).
- **~superposition — BUILD:** `histogram` probability bars (E(X) marked). Values: amplitudes c₁,
  c₂ (real, any size: the page normalizes), probabilities P₁, P₂, energies E₁ (eV), E₂ = 4E₁, ⟨E⟩.
  Relations: Pᵢ = cᵢ² ÷ (c₁² + c₂²); ⟨E⟩ = P₁E₁ + P₂E₂. Example: c₁ = c₂ = 1, E₁ = 0.376 eV
  (electron, 1 nm box) → P = ½ each, ⟨E⟩ = 0.940 eV. Assumption: a measurement gives E₁ or E₂,
  never ⟨E⟩.
- **~commute — BUILD (layout: sort, E1):** bins "Commute: can be known together", "Don't
  commute: an uncertainty relation". Cards: x and p_x (don't); x and p_y (commute); L² and L_z
  (commute); L_x and L_y (don't); S_z and S_x (don't); H and p for a free particle (commute);
  H and x (don't); x and y (commute). Sentence: "[A, B] = AB − BA; when it is not 0, A and B have
  no full set of shared eigenstates."
- **Answers:** normalization and probability in a region — main Solves (box states; other ψ —
  Partly, E2); expectation values and uncertainties — ~spread Solves; measurement outcomes of a
  superposition — ~superposition Solves; commutators of standard pairs — ~commute Solves;
  time evolution of a superposition (|ψ|² sloshing at (E₂ − E₁)/ħ) — Partly (propose t as a value
  on ~superposition once P19 animates); linear-algebra formalism: bases, operators as matrices — No [new-page].
- **Verdict:** 4 pages (1 sort).

### QM#1 he.physics.quantum#1 — Solving the Schrödinger equation

- **Main — BUILD (⏳ HE-physics-P19): the infinite square well and its photon.** Values: particle
  mass m (allowed electron, proton; any), width L, upper n (1–20), lower n′, energies Eₙ, Eₙ′ (eV),
  photon energy ΔE, wavelength λ. Relations: Eₙ = n²h² ÷ (8mL²); ΔE = Eₙ − Eₙ′; λ = 1240 eV·nm ÷
  ΔE. Assumptions: the walls are infinitely high, so ψ = 0 there and only whole half-waves fit;
  E grows as n² and shrinks as 1/L². Example: electron, 1 nm → E₁ = 0.376 eV, E₂ = 1.504 eV,
  2 → 1 gives 1.128 eV at λ = 1099 nm. startWith m, L, n, n′.
- **~harmonic — BUILD (⏳ P19 `harmonic`):** Values ω (rad/s) or k and m, level n, Eₙ, spacing
  ħω, photon λ. Relations: Eₙ = (n + ½)ħω; λ = 2πc/ω. Example: ω = 1.0 × 10¹⁴ rad/s → ħω =
  0.0658 eV, E₀ = 0.0329 eV, λ = 18.8 μm (infrared, as for molecular vibrations).
- **~tunneling — BUILD (⏳ P19 `barrier`):** Values mass, barrier height above the energy U − E
  (eV), width a, decay constant κ, transmission T ≈ e^(−2κa). Relation: κ = √(2m(U − E)) ÷ ħ.
  Example: electron, 1 eV, 0.5 nm → κ = 5.12 nm⁻¹, T ≈ e^(−5.12) = 0.0060. Assumption: the
  estimate for a thick barrier (2κa ≫ 1), leaving out a prefactor near 1.
- **~step — BUILD (⏳ P19 `step`):** Values E, step height U₀ (< E), k₁ ∝ √E, k₂ ∝ √(E − U₀),
  reflection R, transmission T. Relations: R = ((k₁ − k₂) ÷ (k₁ + k₂))²; T = 1 − R. Example: E =
  4 eV, U₀ = 3 eV → k₁/k₂ = 2, R = 1/9 = 0.111, T = 0.889 (a classical particle would never
  reflect).
- **Answers:** energy levels and transition wavelength in a box — main Solves; oscillator levels
  and photon — ~harmonic Solves; tunneling probability estimate — ~tunneling Solves; reflection at
  a step — ~step Solves; finite square well bound states — No (a transcendental root, E10; propose
  `~finite-well` after); hydrogen radial solutions — QM#2 and UP3#3~bohr; 3-D box and isotropic well, degeneracy — No [new-page].
- **Verdict:** 4 pages.

### QM#2 he.physics.quantum#2 — Angular momentum and spin

- **Main — BUILD (⏳ HE-physics-P26): the vector model of L.** Values: ℓ (0–10, integer), m_ℓ
  (−ℓ–ℓ), size |L| (in ħ), L_z (in ħ), angle θ to the z-axis, states 2ℓ + 1. Relations:
  |L| = √(ℓ(ℓ + 1))ħ; L_z = m_ℓħ; cos θ = m_ℓ ÷ √(ℓ(ℓ + 1)). Assumptions: only |L| and one
  component can be known together (L_x, L_y spread round a cone); L can never point straight
  along z. Example: ℓ = 2, m_ℓ = 1 → |L| = 2.449ħ, L_z = ħ, θ = 65.9°, 5 states. startWith ℓ, m_ℓ.
  Interim: `vectorDiagram` `space` with L and its z-part.
- **~spin-measurement — BUILD:** `histogram` probability bars. Values: angle between the prepared
  axis and the measured one θ, P(up), P(down), ⟨S⟩ (in ħ/2). Relations: P(up) = cos²(θ/2);
  P(down) = sin²(θ/2); ⟨S⟩ = cos θ. Example: 60° → 0.75, 0.25, ⟨S⟩ = 0.5 (ħ/2).
- **~zeeman — BUILD:** `energyProfile` `mode: 'ladder'` (levels to scale). Values field B (T),
  ℓ, splitting ΔE = μ_BB (eV), levels 2ℓ + 1, spin-flip photon f = gμ_BB/h (g = 2). Example: 2 T →
  ΔE = 1.16 × 10⁻⁴ eV a step; electron spin flip at f = 56.0 GHz.
- **~addition — BUILD:** two angular momenta j₁, j₂ (0–5 in halves). Values j₁, j₂, smallest j,
  largest j, how many j values, total states (2j₁ + 1)(2j₂ + 1). Relations: j runs from |j₁ − j₂|
  to j₁ + j₂ in steps of 1; Σ(2j + 1) = (2j₁ + 1)(2j₂ + 1). Example: ℓ = 1 and s = ½ → j = ½ or
  3/2, 2 + 4 = 6 states. Picture: table of the j values and their 2j + 1.
- **Answers:** |L|, L_z, the cone angle — main Solves; Stern–Gerlach probabilities —
  ~spin-measurement Solves; Zeeman splitting, ESR frequency — ~zeeman Solves; allowed total j and
  state counts — ~addition Solves; Pauli matrices and spin eigenvectors along x — Partly (the
  2 × 2 eigenproblem on QM#3~two-level; propose `~pauli`); Clebsch–Gordan coefficients — No; 3-D oscillator degeneracy and ℓ content — No [new-page].
- **Verdict:** 4 pages.

### QM#3 he.physics.quantum#3 — Perturbation theory

- **Main — BUILD (⏳ HE-physics-P19 `bump`): a first-order shift from a step inside a box.**
  Values: n, L, bump height V₀ (eV), from x₁, to x₂, first-order shift E⁽¹⁾, unperturbed Eₙ,
  estimate E. Relations: E⁽¹⁾ = ⟨ψₙ|V|ψₙ⟩ = V₀ × P(x₁ to x₂) (the QM#0 integral); Eₙ = n²h² ÷
  (8mL²) (electron); E = Eₙ + E⁽¹⁾. Assumptions: V₀ is small next to the gap to the next level;
  first order uses the unperturbed ψ; a bump where ψ is large shifts E most. Example: electron,
  1 nm, n = 1, V₀ = 0.05 eV from 0.25 to 0.75 nm → P = 0.5 + 1/π = 0.818, E⁽¹⁾ = 0.0409 eV,
  E ≈ 0.376 + 0.041 = 0.417 eV. startWith n, L, V₀, x₁, x₂.
- **~two-level — BUILD (E5):** exact vs second order. `matrixGrid` (H with rows E₁, V and V, E₂).
  Values E₁, E₂, coupling V (eV), exact lower E₋, second-order estimate E₁ − V² ÷ (E₂ − E₁), the
  difference. Relations: E± = (E₁ + E₂)/2 ± √(((E₂ − E₁)/2)² + V²). Example: 0, 1 eV, V = 0.1 eV
  gives E₋ = −0.00990 eV, estimate −0.0100 eV (1% apart: V ≪ E₂ − E₁ is when it works).
- **Answers:** first-order energy shifts — main Solves for box states; second-order and exact
  two-level comparison — ~two-level Solves; degenerate perturbation theory — Partly (~two-level
  with E₁ = E₂ gives ±V; propose saying so in its use line); Stark and fine-structure corrections
  — No; time-dependent perturbation, Fermi's golden rule — No (out of the topic title).
- **Verdict:** 2 pages.

## Course 7. he.physics.thermal-statistical — Thermal & Statistical Physics

Prerequisite: UP3. Textbooks: UP-V2 1–4 (temperature, kinetic theory, first and second laws) for
the review level; Schroeder, An Introduction to Thermal Physics (all rights reserved; chapter
titles only): 1 Energy in thermal physics, 2 The second law, 3 Interactions and implications,
4 Engines and refrigerators, 6 Boltzmann statistics, 7 Quantum statistics. Open: MIT OCW 8.044;
Tong, Statistical Physics; LibreTexts (Fitzpatrick).

### TS#0 he.physics.thermal-statistical#0 — Laws of thermodynamics

- **Main — BUILD (⏳ HE-physics-P27): an isothermal expansion of an ideal gas.** Values: moles n
  (0.001–1000 mol), temperature T (1–5000 K), V₁, V₂ (L or m³), work by the gas W, heat in Q,
  energy change ΔU, entropy change ΔS (J/K). Relations: W = nRT ln(V₂/V₁); ΔU = 0; Q = W;
  ΔS = Q/T. Assumptions: ideal gas, slow (quasi-static) process at fixed T; W is the area under
  the P–V curve, ∫ P dV with P = nRT/V (shown once); ΔU = Q − W (first law). Example: 1 mol at
  300 K doubles its volume → W = 8.314 × 300 × 0.6931 = 1729 J = Q, ΔS = 5.76 J/K. startWith n,
  T, V₁, V₂. Interim: `gasPiston` `energy` (Q, W, ΔU bands).
- **~adiabatic — BUILD (⏳ P27):** Values n, γ (allowed 5/3 monatomic, 7/5 diatomic), T₁, V₁, V₂,
  T₂, W. Relations: T₂ = T₁(V₁/V₂)^(γ−1); W = nC_V(T₁ − T₂), C_V = R ÷ (γ − 1). Example: 1 mol
  monatomic at 300 K doubles → T₂ = 300 × 2^(−2/3) = 189.0 K, W = 12.47 × 111.0 = 1384 J (less than
  the isothermal 1729 J: no heat comes in).
- **~otto — BUILD:** `heatEngine` (Q_H = W + Q_L bands, efficiency). Values compression ratio r
  (1–25), γ, efficiency e, heat in Q_H, work W, heat out Q_L. Relations: e = 1 − r^(1−γ);
  W = eQ_H; Q_L = Q_H − W. Example: r = 8, γ = 1.4 → e = 56.5%; Q_H = 1000 J → W = 565 J.
- **~heat-capacity — BUILD:** `gasPiston` `energy`. Values n, degrees of freedom f (allowed 3, 5,
  7), C_V = (f/2)R, C_P = C_V + R, ΔT, Q at constant volume, Q at constant pressure, work at
  constant pressure. Example: 2 mol diatomic (f = 5), ΔT = 50 K → Q_V = 2079 J, Q_P = 2910 J,
  W = nRΔT = 831 J.
- **Answers:** isothermal work, heat and entropy — main Solves; adiabatic end state and work —
  ~adiabatic Solves; cycle efficiency — ~otto Solves (Carnot in s.11.thermodynamics, Refresh);
  C_V, C_P by equipartition — ~heat-capacity Solves; full cycle on a P–V diagram (net work as the
  enclosed area) — Partly (needs P27 `cycle`; propose `~cycle`); free expansion ΔS = nR ln(V₂/V₁)
  — main's assumption, Partly; response functions and Maxwell relations for a given equation of state — No [new-page].
- **Verdict:** 4 pages.

### TS#1 he.physics.thermal-statistical#1 — Entropy and ensembles

- **Main — BUILD: entropy made by mixing hot and cold water.** `bars` `flows` (ΔS of the hot water
  down, the cold water up, the total). Values: masses m₁, m₂ (kg), temperatures T₁, T₂ (K, °C by
  the unit menu), specific heat c (J/(kg·°C)), final T_f, ΔS₁, ΔS₂, total ΔS. Relations:
  T_f = (m₁T₁ + m₂T₂) ÷ (m₁ + m₂); ΔSᵢ = mᵢc ln(T_f/Tᵢ) (from ∫ dQ/T, shown once, in kelvin);
  ΔS = ΔS₁ + ΔS₂. Assumptions: no heat lost to the room; c is constant; the total is > 0 for any
  T₁ ≠ T₂, the second law. Example: 1 kg at 80 °C with 1 kg at 20 °C, c = 4186 → T_f = 50 °C,
  ΔS₁ = −371.6 J/K, ΔS₂ = +407.9 J/K, ΔS = +36.2 J/K. startWith m₁, T₁, m₂, T₂.
- **~einstein-solid — BUILD:** `pascalTriangle` (C(n, k) lit). Values oscillators N (1–12), energy
  units q (0–12), multiplicity Ω = C(q + N − 1, q), entropy S/k_B = ln Ω, S (J/K). Example: N = 3,
  q = 4 → Ω = 15, S = 2.71k_B = 3.74 × 10⁻²³ J/K. (Past row 12: E9.)
- **~two-state — BUILD:** `pascalTriangle`. Values spins N (1–12), spins up n, Ω = C(N, n), S/k_B.
  Example: N = 12, n = 6 → Ω = 924, S = 6.83k_B; n = 12 → Ω = 1, S = 0.
- **~ensembles — BUILD (layout: sort, E1):** bins "Microcanonical (fixed E, N, V)", "Canonical
  (fixed T, N, V)", "Grand canonical (fixed T, μ, V)". Cards: a sealed, insulated box of gas; an
  isolated star cluster's stars as a whole; a protein in a water bath at 310 K; one molecule's
  vibration in a gas at room temperature; gas molecules sticking to sites on a surface in contact
  with a gas; electrons in a metal joined to a battery terminal; a small open region of a large
  gas. Sentence: "What a system shares with its surroundings picks the ensemble."
- **Answers:** ΔS for heating and mixing — main Solves; multiplicity and entropy of an Einstein
  solid or a two-state paramagnet — ~einstein-solid, ~two-state Solve (N ≤ 12; larger by Stirling
  — Partly, E9); temperature from 1/T = ∂S/∂U for two solids sharing energy — No (propose
  `~sharing`: Ω_A × Ω_B by q_A on `table` with `graph: { best }`, which rings the most likely
  split); which ensemble — ~ensembles
  Solves; probability distributions: normalize, mean, variance (8.044 opens with these) — No [new-page].
- **Verdict:** 4 pages (1 sort).

### TS#2 he.physics.thermal-statistical#2 — Partition functions

- **Main — BUILD: a two-level system.** `histogram` probability bars. Values: level gap ε (eV),
  temperature T (K), ε/k_BT, partition function Z, ground share p₀, upper share p₁, mean energy
  ⟨E⟩ (eV). Relations: Z = 1 + e^(−ε/k_BT); p₀ = 1/Z; p₁ = e^(−ε/k_BT) ÷ Z; ⟨E⟩ = εp₁.
  Assumptions: the system trades energy with a reservoir at T (canonical); a state's share is its
  Boltzmann factor over Z; both levels single (no degeneracy). Example: ε = 0.05 eV, 300 K →
  ε/k_BT = 1.934, Z = 1.1446, p₀ = 0.874, p₁ = 0.126, ⟨E⟩ = 0.00632 eV. startWith ε, T.
- **~oscillator — BUILD:** `histogram` (the first six levels' shares). Values ħω (eV), T, x = ħω/k_BT,
  Z = 1 ÷ (1 − e^(−x)) (levels from 0), mean quanta ⟨n⟩ = 1 ÷ (e^x − 1), ⟨E⟩ = ⟨n⟩ħω. Example:
  ħω = k_BT at 300 K (0.02585 eV) → Z = 1.582, ⟨n⟩ = 0.582.
- **~thermal-wavelength — BUILD:** Values particle mass (allowed He, N₂, electron; any), T,
  λ_th = h ÷ √(2πmk_BT), volume V, Z₁ = V/λ_th³, number density n, nλ_th³. Example: helium at 300 K
  → λ_th = 0.0504 nm; V = 1 L → Z₁ = 7.8 × 10²⁷; at 1 atm, nλ_th³ = 3.1 × 10⁻⁶ ≪ 1 (classical).
  Picture: table sweeping T (1, 10, 100, 300 K).
- **~speeds — BUILD (⏳ HE-physics-P28 `maxwell`):** Values molar mass M (g/mol), T, most probable
  v_p = √(2k_BT/m), mean ⟨v⟩ = √(8k_BT/πm), rms v_rms = √(3k_BT/m). Example: N₂ (28.01 g/mol) at
  300 K → 422, 476, 517 m/s. Interim: `gasPiston` (trails ∝ √T).
- **Answers:** populations and mean energy of levels — main Solves; Einstein solid heat
  capacity, mean quanta — ~oscillator Solves (C_V as a value — Partly, propose); ideal-gas Z and
  the classical limit — ~thermal-wavelength Solves; Maxwell speeds — ~speeds Solves; free energy
  F = −k_BT ln Z and S from Z — Partly (add F as a value on main; propose); paramagnet magnetization tanh(μB/k_BT) — No; ranked high (3 items, 8.044): `~paramagnet` [new-page]; 1-D Ising chain — No [new-page].
- **Verdict:** 4 pages.

### TS#3 he.physics.thermal-statistical#3 — Quantum statistics

- **Main — BUILD (⏳ HE-physics-P28 `occupancy`): Fermi–Dirac, Bose–Einstein and Boltzmann
  occupancy.** Values: energy above μ, E − μ (eV; > 0 for bosons), temperature T, x = (E − μ)/k_BT,
  f_FD, f_BE, f_MB. Relations: f_FD = 1 ÷ (e^x + 1); f_BE = 1 ÷ (e^x − 1); f_MB = e^(−x).
  Assumptions: f is the mean number in one state; fermions never exceed 1; all three agree when
  x ≫ 1. Example: 0.05 eV above μ at 300 K → x = 1.934, f_FD = 0.126, f_BE = 0.169, f_MB = 0.145.
  startWith E − μ, T. Interim: table sweeping x (0.5, 1, 2, 4, 8).
- **~fermi-energy — BUILD:** Values electron density n (m⁻³), E_F = (ħ²/2m)(3π²n)^(2/3) (eV), Fermi
  temperature T_F = E_F/k_B, Fermi speed v_F. Example: copper, n = 8.47 × 10²⁸ m⁻³ → E_F = 7.04 eV,
  T_F = 81,700 K, v_F = 1.57 × 10⁶ m/s. Picture: table of metals (Na, Cu, Al) as rows.
- **~photon-gas — BUILD (⏳ P28 `planck`):** a blackbody. Values T, peak λ_max = b/T, power per
  area σT⁴, area A, total power P. Example: 5800 K → λ_max = 500 nm, σT⁴ = 6.42 × 10⁷ W/m².
  Interim: `spectrum` with the peak marked.
- **~bec — BUILD:** Values atom mass (allowed ⁸⁷Rb, ²³Na, ⁴He), density n, T_c =
  (2πħ²/mk_B)(n/2.612)^(2/3). Example: ⁸⁷Rb at 10²⁰ m⁻³ → T_c = 0.40 μK. Picture: table sweeping n.
- **Answers:** occupancies compared — main Solves; Fermi energy, temperature, speed — ~fermi-energy
  Solves; Wien and Stefan–Boltzmann — ~photon-gas Solves; BEC temperature — ~bec Solves; electron
  heat capacity C ≈ (π²/2)Nk_B(T/T_F) — Partly (propose as a value on ~fermi-energy); degeneracy
  pressure of a white dwarf — No; Fermi and photon gases in two dimensions — No [new-page].
- **Verdict:** 4 pages.

## Pictures for the pictures chat

Options on existing kinds first; three new kinds (P16, P19, P20). Each option is
checked in `harness/pictures.ts` as its line says. Field names are proposals; variable ids or
numbers as everywhere.

1. **HE-physics-P1 — `motionGraph` `polynomial: { c0, c1, c2, c3, at }`.** Pages: UP1#0~calculus.
   Draws x–t, v–t and a–t stacked on one time axis, the point at t on each, the tangent on x–t
   whose slope is v, the turnarounds (v = 0) ringed on both. Check: v and a at t equal the power
   rule of the coefficients; each ringed turnaround has v = 0 within 10⁻⁶.
2. **HE-physics-P2 — `freeBody` `pulley: { layout: 'table' | 'atwood', m1, m2, mu?, a, T, T2?,
pulleyMass? }`.** Pages: UP1#1 main, ~atwood; CM#0~atwood. Two blocks joined over a pulley
   (one on a table or both hanging), each with its own force diagram (W, N, f, T) to one scale,
   the shared a arrow; a pulley with mass shows T₁ ≠ T₂. Check: each block's net force = its
   mass × a (sign by the arrow); T₂ − T₁ = ½·pulleyMass·a when given.
3. **HE-physics-P3 — `circularMotion` `bank: θ` and `transfer: { r1, r2 }`.** Pages: UP1#1~banked;
   CM#2~hohmann. `bank`: the car on a banked road in section, N and W, N's level part pointing to
   the center. `transfer`: two circular orbits and the half-ellipse between, Δv₁ and Δv₂ arrows.
   Check: N sin θ = mv²/r and N cos θ = mg; the ellipse's ends touch r₁ and r₂.
4. **HE-physics-P4 — `vectorDiagram` `masses: [{ m, x, y? }]`, `centerOfMass`.** Pages:
   UP1#3~center-of-mass. Dots sized by mass on a line (or plane) with a ruler, the balance point
   marked as a triangle under it. Check: the marked point = Σmx/Σm.
5. **HE-physics-P5 — `impulse` `shape: 'rectangle' | 'triangle' | 'halfSine'`, `peak`.** Pages:
   UP1#3~impulse-curve. The F–t pulse in its shape, its area shaded and written as J, the
   rectangle of the same area dashed at F_avg. Check: area = J; F_avg·Δt = J.
6. **HE-physics-P6 — `rotor` `rolling: { height, shapes? }` and `rod: { axis: 'center' | 'end' |
d }`.** Pages: UP1#4 main, ~parallel-axis. `rolling`: the chosen shape(s) at the top and
   bottom of a ramp of drop h, KE split into translation and rotation bars. `rod`: a rod with the
   center axis dashed and the shifted axis lit, d bracketed. Check: K_t + K_r = mgh; v = rω;
   I = I_cm + Md².
7. **HE-physics-P7 — `freeBody` `ladder: { angle, weight, wall?, floor? }`.** Pages: UP1#4~ladder
   (later a beam on a cable). A ladder against a wall, W at its middle, N_w, N_f, f to scale, the
   pivot at the foot with the lever arms dashed. Check: forces sum to 0 both ways; torques about
   the foot sum to 0.
8. **HE-physics-P8 — `oscillator` `phase: φ`, `damping: b`.** Pages: UP1#5 main, ~damped.
   `phase`: the x–t trace starting at x₀ with slope v₀, φ shown as the shift of the first crest.
   `damping`: the e^(−bt/2m) envelope dashed, ω′ marked on the crests. Check: x(0) = A cos φ;
   crest heights follow the envelope.
9. **HE-physics-P9 — `pendulum` `rod: { length, pivot }`.** Pages: UP1#5~physical-pendulum. A
   rigid rod or plate swinging about a pivot, the center of mass marked at d, the equivalent
   simple length I/(md) dashed beside it. Check: T = 2π√(I/(mgd)).
10. **HE-physics-P10 — `charges` `gauss: { shape: 'sphere' | 'line' | 'plane', R?, r, Q }`.**
    Pages: UP2#0 main, ~line, ~plane. The charge (a shaded ball, a rod, a sheet in perspective),
    the Gaussian surface dashed at r (sphere, cylinder, pillbox), E arrows on it, the enclosed
    charge shaded inside r < R. Check: E·(area) = Q_enc/ε₀ for the drawn surface.
11. **HE-physics-P11 — `circuit` `mixed.capacitors: true`.** Pages: UP2#1 main. The `mixed` layouts
    with capacitor symbols, Q and V at each. Check: series parts share Q; parallel parts share V;
    ΣV round the loop = V.
12. **HE-physics-P12 — `circuit` `twoLoop: { e1, e2, r1, r2, r3, currents }` and `internal: r`.**
    Pages: UP2#2 main, ~internal-resistance. Two batteries and three branches, each current's
    arrow drawn the way it really flows (sign from the value), loop arrows for the two KVL
    equations; `internal` draws r inside a dashed battery box, terminal V across the box. Check:
    junction sum 0; each loop's drops sum to its emf.
13. **HE-physics-P13 — `induction` `rails: { B, L, v, R }`.** Pages: UP2#3~moving-rod. A rod
    sliding on two rails closed by R, B as dots or crosses, v, the induced I round the loop and
    the BIL force against v. Check: ε = BLv; F opposes v.
14. **HE-physics-P14 — `induction` `mode: 'field', source: 'wire' | 'loop' | 'solenoid' |
'toroid' | 'plates'`.** Pages: UP2#3~wire-field, ~solenoid; EM#1 main, ~ampere-wire, ~toroid,
    ~loop-torque (`loop` in a uniform B, μ arrow and θ); EM#2~displacement-current (`plates`: B
    circles between charging plates). The source with its B lines (circles round a wire, the
    loop's axis field, a solenoid's even inside, a toroid's ring) and an Amperian loop at r.
    Check: the value at r matches the source's formula; B inside a solenoid is drawn even.
15. **HE-physics-P15 — `rayDiagram` `singleSlit`, `grating`, `thinFilm`.** Pages: UP3#1~single-slit,
    ~grating, ~thin-film. Single slit: the central bright band 2× the others, w bracketed.
    Grating: the orders as rays at their angles, m_max the last one under 90°. Thin film: two
    reflected rays with the path 2nt and the flip marked. Check: angles from the grating
    equation; no order past sin θ = 1.
16. **HE-physics-P16 — new kind `spacetime`.** Pages: UP3#2~lorentz, ~velocity-addition. A
    Minkowski diagram: x and ct axes, the light lines at 45°, the moving frame's x′ and ct′ axes
    tilted by tan⁻¹β, an event plotted with its coordinates read on both sets; for velocity
    addition, two world lines. Check: (ct)² − x² is the same read on both frames; the drawn
    tilt is tan⁻¹β.
17. **HE-physics-P17 — `photoelectric` `mode: 'compton'`.** Pages: UP3#3 main. A photon in, the
    scattered photon at θ with its longer wave drawn, the electron's recoil at its angle, λ and
    λ′ wave strips to one scale. Check: λ′ − λ = 2.426 pm (1 − cos θ); momentum closes in x and y.
18. **HE-physics-P18 — `functionGraph` `area: { from, to }` and `level: { y, label }`.** Pages:
    UP1#2 main, ~power-law-force, ~potential-curve; UP2#4~resonance; CM#2~turning-points;
    QM#0 main. `area`: the region under f between two x values shaded and its value written.
    `level`: a horizontal line (an energy E, a half-power line) with its crossings ringed. Check:
    the written area equals the integral by quadrature within 0.1%; each ring is a root.
19. **HE-physics-P19 — new kind `potentialWell` (modes `box`, `harmonic`, `step`, `barrier`,
    `bump`).** Pages: QM#0 main, ~spread; QM#1 main, ~harmonic, ~tunneling, ~step; QM#3 main.
    The potential drawn in ink, the energy levels as lines (Eₙ labeled), on chosen levels ψ or
    |ψ|² drawn on their own level line, a transition arrow with its photon λ; `barrier` shows the
    decaying ψ inside; `bump` shades the perturbing region. Check: levels follow n² or (n + ½);
    the arrow's ΔE gives the stated λ; ψ has n − 1 nodes in the box.
20. **HE-physics-P20 — new kind `phaseSpace` (with `hoop`).** Pages: CM#1 main, ~pendulum-phase;
    CM#0~bead-hoop. x–p axes, the energy ellipse (or the pendulum's θ–ω curves with the
    separatrix), the point and its velocity arrow (ẋ, ṗ); `hoop`: the bead on the spinning hoop
    beside its U_eff(θ) curve with the minimum ringed. Check: H at the point = the drawn curve's
    H; the arrow is (∂H/∂p, −∂H/∂x).
21. **HE-physics-P21 — `rotor` `precession: { r, omega }`.** Pages: CM#3 main. A gyroscope on a
    pivot, L along the axle, the torque arrow sideways, the precession circle with Ω. Check:
    Ω = mgr/(Iω).
22. **HE-physics-P22 — `rotor` `plate: { a, b }`.** Pages: CM#3~principal-axes. A thin plate with
    its three principal axes, the moments written on each, the middle axis marked "tumbles".
    Check: I₃ = I₁ + I₂.
23. **HE-physics-P23 — `oscillator` `coupled: { m, k, kc, mode }`.** Pages: CM#4 main, ~chain.
    Two blocks between walls (or the chain), each mode's shape as arrows (in step, opposite), a
    pair of x–t traces showing the energy hand-off. Check: each mode's ω² is an eigenvalue of
    the drawn spring matrix.
24. **HE-physics-P24 — `charges` `distribution: 'ring' | 'disk' | 'image'`.** Pages: EM#0 main,
    ~disk, ~images. Ring or disk in perspective with a point on the axis, dE from two opposite
    pieces with their sideways parts cancelling, E_z summed; `image`: the charge above a grounded
    plane, the image charge dashed below, field lines meeting the plane square, σ shaded.
    Check: E_z at z from the formula; image charge = −q at −d.
25. **HE-physics-P25 — `wave` `em: { E0, B0 }`.** Pages: EM#3 main. E (vertical) and B
    (horizontal, in perspective) in step along the direction of travel, E₀ and B₀ marked, S
    arrow. Check: B₀ = E₀/c.
26. **HE-physics-P26 — `vectorDiagram` `cone: { l, m }`.** Pages: QM#2 main. In `space`, the L
    vector of length √(ℓ(ℓ + 1)) on its cone about z at height m, all 2ℓ + 1 cones faint. Check:
    cos θ = m/√(ℓ(ℓ + 1)).
27. **HE-physics-P27 — `gasPiston` `pv: { process: 'isothermal' | 'adiabatic' | 'isobaric' |
'isochoric' | 'cycle', … }`.** Pages: TS#0 main, ~adiabatic (later `~cycle`). A P–V graph with
    the process curve from state 1 to 2, the area under it shaded as W, the isotherms dashed for
    comparison. Check: the shaded area equals W within 0.1%; PV = nRT at both ends.
28. **HE-physics-P28 — `functionGraph` `distribution: 'maxwell' | 'planck' | 'occupancy'`.**
    Pages: TS#2~speeds, TS#3 main, ~photon-gas. Maxwell f(v) with v_p, ⟨v⟩, v_rms marked; Planck's
    curve with λ_max and the visible band tinted; the three occupancy curves against
    (E − μ)/k_BT with the point at x. Check: the marked speeds and λ_max are the formulas'; the
    curves meet as x grows.

## Research to do

### Textbooks

Reference only, never copied. OpenStax books also state that they "may not be used in the training
of large language models" (see `research/textbooks/README.md`): the research chat records tables
of contents and kinds, never text for any AI use.

| Source                                                                                                                                    | URL                                                             | Licence                                                                                                        | Covers         | Extract                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| OpenStax University Physics Vol. 1, 2, 3                                                                                                  | openstax.org/details/books/university-physics-volume-1 (‑2, ‑3) | CC BY 4.0 (checked via mirrors; the openstax.org page was not reachable from here) + the OpenStax AI statement | UP1–UP3, TS#0  | full chapter and section lists; worked-example kinds per section; the number sizes in examples; notation (symbols, sign rules) |
| MIT OCW 8.01, 8.02, 8.03, 8.04, 8.05, 8.07, 8.09, 8.044                                                                                   | ocw.mit.edu                                                     | CC BY-NC-SA 4.0                                                                                                | all 7 courses  | lecture topic order per course; problem-set question kinds; exam formats                                                       |
| David Tong, Lectures on Theoretical Physics (Classical Dynamics, Electromagnetism, Quantum Mechanics, Statistical Physics)                | damtp.cam.ac.uk/user/tong                                       | © Tong; free to copy unaltered, with attribution, not for profit (not CC; checked)                             | CM, EM, QM, TS | section lists; which worked examples recur; notation                                                                           |
| LibreTexts Physics (Cline, Variational Principles; Fitzpatrick, Quantum Mechanics and Thermodynamics & Statistical Mechanics; Tatum)      | phys.libretexts.org                                             | per book, mostly CC BY-NC-SA (to confirm per book)                                                             | CM, QM, TS     | chapter lists, example kinds                                                                                                   |
| Ellingson, Electromagnetics Vol. 1–2                                                                                                      | vtechworks.lib.vt.edu (Open Electromagnetics)                   | CC BY-SA 4.0 (to confirm)                                                                                      | EM             | chapter list, examples                                                                                                         |
| Crowell, Simple Nature / Light and Matter                                                                                                 | lightandmatter.com                                              | CC BY-SA                                                                                                       | UP1–3          | chapter order (cross-check only)                                                                                               |
| Taylor, Classical Mechanics; Griffiths, Introduction to Electrodynamics and Introduction to Quantum Mechanics; Schroeder, Thermal Physics | publishers' pages                                               | all rights reserved                                                                                            | CM, EM, QM, TS | chapter and section titles only, cited (the "titles" kind), to set order and names                                             |

Record per source as `research/textbooks/toc/physics/<source>.json` with a new `"level":
"college"` and a crosswalk from each section to `<courseId>#<i>` (a college CROSSWALK table).

### Questions (reference only; numbers kept for range checks, never reused)

| Source                                                                           | URL                        | Licence / robots                                                          | Courses                   | Target                                   |
| -------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------- | ------------------------- | ---------------------------------------- |
| OpenStax University Physics end-of-chapter problems                              | openstax.org               | CC BY 4.0 + AI statement; robots.txt to check                             | UP1–3                     | 15 per topic (240)                       |
| AP Physics C: Mechanics and E&M released free-response                           | apcentral.collegeboard.org | © College Board, all rights reserved, reference only; robots.txt to check | UP1, UP2                  | 30 each                                  |
| MIT OCW problem sets and exams (8.01, 8.02, 8.03, 8.04, 8.05, 8.07, 8.09, 8.044) | ocw.mit.edu                | CC BY-NC-SA 4.0                                                           | all                       | 40 per upper course, 20 per intro course |
| Physics GRE practice book (ETS)                                                  | ets.org                    | © ETS, reference only                                                     | all 7 (classify by topic) | all items, kind and topic only (no text) |
| Tong example sheets                                                              | damtp.cam.ac.uk/user/tong  | as above                                                                  | CM, EM, QM, TS            | 15 per course                            |

Record per question: source id, course and topic (`<courseId>#<i>`), question kind (find v at t;
two-loop currents; …), the unknown and the givens with their sizes and units, the picture it
uses, the answer form (number with unit, expression, choice), and the licence. Targets by course:
UP1 90, UP2 75, UP3 75, CM 50, EM 40, QM 40, TS 40 (410). Then each topic's "Answers" line in
this plan is re-marked Solves / Partly / No against real items.

### Engine needs

- **E1 — College layout pages.** `src/data/modules/layouts/college.ts` read by `getPage` for
  `he.*` ids, the Grades 9–12 reading rules in `layouts.test.ts`. Waiting: CM#0, EM#2,
  QM#0~commute, TS#1~ensembles.
- **E2 — Calculus lines in steps.** A derivation line kind ("∫ from a to b of f dx = F(b) − F(a)",
  "dx/dt = …", "∂L/∂q̇") taught to `PHRASES` and checked by quadrature or a finite difference
  at the page's values; `toLatex` for ∫ with limits, d/dt, ∂, ∇, ⟨ ⟩, ħ. Waiting: UP1#0~calculus,
  UP1#2 main and ~power-law-force, UP2#0 main, EM#0, EM#1, QM#0, QM#3, TS#0, TS#1 main,
  CM#0~atwood, CM#1 (each has a `how` sentence until then).
- **E3 — Units.** Hz, kHz, MHz, GHz; rad/s; nm, pm, μm; T, mT, μT; Wb; H, mH, μH; N/C ≡ V/m;
  N·m; kg·m²; kg·m/s; N·s; J·s; J/K; keV, MeV, GeV; u and MeV/c²; Bq; W/m²; A·m²; rad;
  lines/mm; m³/s² (GM). Every page in the plan uses some; until then they are fixed labels.
- **E4 — Exponentials and logs in solves.** Solving t from 1 − e^(−t/τ), r from 10 log(I/I₀):
  closed forms exist; a shared helper and the step text ("Take ln of both sides"). Waiting:
  UP1#1~drag, UP2#2~rc-charging, UP2#3~rl-circuit, UP3#4~decay-law, UP1#3~rocket, UP3#0~intensity-db.
- **E5 — 2 × 2 systems and eigenvalues in steps.** Cramer's rule and λ² − (trace)λ + det = 0 on
  `matrixGrid` with the step lines and harness checks. Waiting: UP2#2 main, CM#4 main and
  ~chain, QM#3~two-level.
- **E6 — atan2 and signed angles.** A helper for φ from (x₀, −v₀/ω) and directions in any
  quadrant, with step text that names the quadrant. Waiting: UP1#5 main, UP1#0~projectile-at-t,
  UP1#3 main.
- **E7 — Very large and small numbers.** Display and harness tolerance from 10⁻³⁵ to 10³¹
  (relative, 4 significant figures), scientific notation in steps (×10ⁿ kept with its number).
  Waiting: UP3, QM, TS pages.
- **E8 — Named choices.** `allowed` values shown by name (electron, proton, alpha; hoop, disk;
  monatomic, diatomic; Earth, Sun) in the box's menu. Waiting: about 15 pages.
- **E9 — Big binomials.** C(n, k) past row 12 with ln Ω by Stirling, the picture capped.
  Waiting: TS#1~einstein-solid, ~two-state past N = 12.
- **E10 — Transcendental roots.** One-variable root finding with a bracket (finite well, Kepler's
  equation M = E − e sin E). Waiting: no page now; proposed `QM#1~finite-well`, a Kepler-time page.
- **E11 — Inequality answers.** A relation whose answer is a least value ("Δp ≥ …", "μₛ ≥ …")
  printed as "at least" in the answer line and never as a step. Waiting: UP3#3~uncertainty,
  UP1#4~ladder.

## Not in the taxonomy

- UP-V1 13 (Gravitation) and 14 (Fluid mechanics) have no UP1 topic; gravitation is partly in
  CM#2. Add "Gravitation and fluids" to UP1 or a topic to each.
- UP-V2 1–4 (temperature, kinetic theory, first and second laws) are in no University Physics
  topic; TS#0 covers the laws at the upper level. Add "Heat and kinetic theory" to UP2 or UP1.
- UP-V3 2 (Geometric optics: mirrors, lenses), 8 (Atomic structure), 9 (Condensed matter) and 11
  (Particle physics and cosmology) are in no UP3 topic.
- Classical Mechanics has no "Noninertial frames" topic (Taylor 9); CM#3~coriolis sits under
  rigid bodies for now.
- Quantum Mechanics has no "Hydrogen atom" topic (the core of Griffiths 4); QM#2 and UP3#3~bohr
  cover parts. `he.chemistry.physical-2` lists "Hydrogen atom": link it in Refresh.

## Priority

1. Calculators with drawn pictures and no needs: UP1#0 (picture swap), UP1#1~drag, UP1#2~friction-
   energy, UP1#3 main, ~elastic, ~rocket, UP1#4~pulley-inertia, ~angular-momentum, UP2#0~superposition,
   UP2#1~sphere-potential, ~dielectric, UP2#3 main, ~charged-particle, UP2#4 (3), UP3#0 main,
   ~standing-string, UP3#1 main, UP3#2 main, ~energy-momentum, UP3#3~photoelectric, ~bohr,
   UP3#4 (3), CM#2 main, ~escape, EM#0~dipole, EM#3~reflection, QM#0~superposition,
   QM#2~spin-measurement, ~zeeman, TS#0~otto, ~heat-capacity, TS#1 main, ~einstein-solid,
   ~two-state, TS#2 main, ~oscillator.
2. The 30 ⏳ pages with an interim picture, then E1 and the four layouts.
3. Engine needs E3, E2, E5, E4 (they unblock the most pages), then pictures P19, P14, P10, P18,
   P2, P27, P28, P24 (most pages each), the rest in order.
4. The question research before the section review, so the review marks against real items.

## Summary

- **Pages:** 120 (37 topic pages + 83 problem types): 116 calculators, 4 layouts (1 sequence:
  CM#0; 3 sorts: EM#2, QM#0~commute, TS#1~ensembles). 56 calculators ⏳ (30 with an interim
  picture); the 4 layouts wait on E1. One pilot kept (UP1#0, picture swapped to `motionGraph`).
  By course: UP1 24, UP2 20, UP3 19, CM 14, EM 13, QM 14, TS 16.
- **Picture requests (28):** P1 motionGraph polynomial; P2 freeBody pulley; P3 circularMotion bank
  and transfer; P4 vectorDiagram masses; P5 impulse shapes; P6 rotor rolling and rod; P7 freeBody
  ladder; P8 oscillator phase and damping; P9 pendulum rod; P10 charges Gauss surfaces; P11 circuit
  capacitors; P12 circuit two-loop and internal r; P13 induction rails; P14 induction field
  sources; P15 rayDiagram single slit, grating, thin film; P16 new `spacetime`; P17 photoelectric
  Compton; P18 functionGraph area and level; P19 new `potentialWell`; P20 new `phaseSpace`; P21
  rotor precession; P22 rotor plate; P23 oscillator coupled; P24 charges ring, disk, image; P25 wave
  EM; P26 vectorDiagram cone; P27 gasPiston P–V; P28 functionGraph distributions. 25 are options
  on existing kinds, 3 new kinds (P16, P19, P20).
- **Engine needs (11):** E1 college layouts, E2 calculus lines, E3 units, E4 exp/log solves,
  E5 2 × 2 systems and eigenvalues, E6 atan2, E7 number range, E8 named choices, E9 big binomials,
  E10 transcendental roots, E11 inequality answers.
- **Research:** textbooks: OpenStax University Physics 1–3 (CC BY 4.0), MIT OCW (CC BY-NC-SA),
  Tong (custom free licence), LibreTexts, Ellingson, Crowell, and the standard upper-level texts
  as titles only; questions: 410 records (UP1 90, UP2 75, UP3 75, CM 50, EM 40, QM 40, TS 40) from
  OpenStax, AP Physics C, MIT OCW, the Physics GRE practice book and Tong's example sheets.
