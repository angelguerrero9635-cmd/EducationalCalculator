# Direction plan: higher education, group "mechanical" (15 courses, 68 topics)

Written from the brief, `src/data/taxonomy.ts` (`COURSES`), `docs/MODULE_GUIDE.md` ("Standards"),
`docs/LAYOUTS.md`, `docs/EQUATION_INPUTS.md`, `docs/PICTURES.md`, the HS picture trackers and the
model plan `docs/plans/s.11.md`. No pilot page belongs to this group (`college.ts` has none); the
nearest model is `he.engineering.circuits-1#0` (rows, Kirchhoff and Ohm relations, a picture of the
whole system). Every example below is original and was worked by hand and checked by a script in
the scratchpad; nothing is copied from a textbook, an exam or `research/`.

Courses in scope (field, id, topics):

| Field     | Course                                    | Id (`he.engineering.…`)    | Topics |
| --------- | ----------------------------------------- | -------------------------- | ------ |
| classical | Statics                                   | `statics`                  | 5      |
| classical | Dynamics                                  | `dynamics`                 | 4      |
| classical | Mechanics of Materials (Solid Mech. I)    | `mechanics-of-materials`   | 6      |
| classical | Materials Science & Material Properties   | `materials-science`        | 4      |
| classical | Engineering Programming (MATLAB/Python)   | `engineering-programming`  | 4      |
| classical | Engineering Graphics & CAD                | `cad-graphics`             | 4      |
| classical | Numerical Methods for Engineers           | `numerical-methods`        | 5      |
| classical | Advanced Solid Mechanics (Solid Mech. II) | `advanced-solid-mechanics` | 5      |
| classical | Finite Element Analysis                   | `finite-element-analysis`  | 5      |
| mechanical| Engineering Thermodynamics                | `thermodynamics`           | 4      |
| mechanical| Fluid Mechanics                           | `fluid-mechanics`          | 6      |
| mechanical| Heat Transfer                             | `heat-transfer`            | 4      |
| mechanical| Machine Design                            | `machine-design`           | 4      |
| mechanical| Mechanical Vibrations                     | `vibrations`               | 4      |
| mechanical| Manufacturing Processes                   | `manufacturing`            | 4      |

## Decisions

- **Ids.** A topic's page is `he.engineering.<slug>#<i>` (0-based, the taxonomy's order); its
  problem types are `…#<i>~<slug>`. Below, inside a course block, `#0` and `#0~mohr` stand for the
  full ids. Every page goes in `src/data/modules/college.ts` (or a split `college/mechanical.ts`
  once the file passes ~3,000 lines; the engine decides).
- **Word rules.** The Grades 9–12 rules hold: sentences ≤ 35 words, ≤ 10 values a page, every
  value named first with its symbol ("Normal stress (σ)", "Quality (x)"). College adds no
  reading-level cap, but assumptions stay 2–4 lines of ≤ 20 words. Where a page would need more
  than 10 values (Rankine with all states, a composite wall with areas), it is split into two
  problem types rather than raising the cap.
- **Notation.** The symbols of the common US texts and the NCEES FE Reference Handbook (used for
  notation only): σ, τ, ε, γ, E, G, ν, I, J, Q, M, V, P, δ, φ for solids; P, v, T, u, h, s, x
  (quality), ṁ, Q̇, Ẇ for thermodynamics; ρ, μ, ν (kinematic viscosity), Re, f, h_L for fluids;
  k, h, q, q″, ε, σ for heat transfer; m, k, c, ω_n, ζ, ω_d, r = ω/ω_n for vibrations. ν means
  Poisson's ratio on solids pages and kinematic viscosity on fluids pages; no page has both.
  Multi-letter subscripts are Unicode where the font has them (σ₁, ω_n, ΔT_lm); the engine's
  `subscripts.ts` gets the missing ones (need E3).
- **Sign conventions** (one assumption line on each page that uses them): tension +, compression
  −; counterclockwise moments +; beam shear and moment by the "smile" convention (sagging M > 0);
  heat into a system +, work by a system + (ΔU = Q − W, as the Grade 11 page writes it); shaft
  work out of a turbine +, into a pump or compressor written as Ẇ_in > 0.
- **Constants.** g = 9.81 m/s² on every engineering page (the textbooks and the FE handbook use
  it; the Grade 11 pages keep 9.8, and `freeBody` takes `g: 9.81`, P27). σ_SB = 5.67 × 10⁻⁸
  W/(m²·K⁴); R_u = 8.314 kJ/(kmol·K); air as an ideal gas R = 0.287 kJ/(kg·K), c_p = 1.005,
  c_v = 0.718 kJ/(kg·K), k = 1.4 (cold-air standard, said in the assumption); water ρ = 1000
  kg/m³, ν = 1.0 × 10⁻⁶ m²/s at 20 °C; steel E = 200 GPa, G = 77 GPa, ν = 0.3; aluminum E = 70
  GPa; N_A = 6.022 × 10²³ mol⁻¹; k_B = 8.617 × 10⁻⁵ eV/K; P_atm = 101.325 kPa.
- **Units.** SI first with the US customary menu wherever the registry can convert (lbf, kip,
  psi, ft, in, °F). Solid-mechanics pages work in N, mm and MPa (N/mm²), as the texts do: a
  page's formula units are a unit set ("N–mm–MPa"), and steps convert to it first (need E2).
  Temperature differences use a ΔT dimension (K = °C, °F = °R) so a 40 °C rise never converts with
  an offset (need E1). Missing units are need E1 (MPa, GPa, ksi, N·m, N/m, mm⁴, kJ/kg,
  W/(m·K), Pa·s, m²/s, kg/s, m³/s, rpm, Hz, μm, microstrain, MPa√m, …).
- **Rows, not equations.** Every page here keeps rows: named measurements whose units change
  (`docs/EQUATION_INPUTS.md`, "Science formulas with named quantities"). No `equation` template.
- **Property data.** Steam and refrigerant properties are typed by the student from their own
  table, as in class ("hf and hfg at 200 kPa, from the saturated-water table"), with the page
  naming which entries to read. Values in our examples are physical facts rounded by us; no
  table is copied. A built-in water routine from the public IAPWS-IF97 equations is need E5
  (pages then look values up; until then they are fully usable). ISO 286 fit deviations, Marin
  factors, Lewis form factors and Kt charts are typed the same way.
- **Calculus in steps.** College steps show the rule in letters, the rearrangement, the numbers,
  then one line per stage (`docs/MODULE_GUIDE.md`). Where a relation comes from an integral
  (boundary work, beam deflection, centroids by integration, Castigliano), the relation is the
  closed form and the `how` names the integral in one sentence ("W = ∫P dV; with PVⁿ = C this is
  (P₂V₂ − P₁V₁) ÷ (1 − n)"). Derivatives at a point reuse the calc-1#1 pilot's power-rule
  relation. Typeset ∫, ∂, Σ and ln in steps are need E3.
- **Matrices and iterations.** Small linear systems (FEA, 2-DOF, Gauss elimination) use the
  existing `matrixGrid` (`rowReduce`, `determinant`) with variable entries. A walkthrough that
  repeats a method (Newton, bisection, Gauss–Seidel, Euler, RK4) shows one step worked and the
  further iterations as a table (need E6); until then those pages show the first step and say so.
- **Solver.** Implicit relations (Colebrook, NTU inversions, the 2-DOF frequency quadratic,
  Taylor's tool life) use the solver's numeric root-finding within [min, max] (`solve.ts`); the
  walkthrough says "found numerically" (exists). Three ordered roots (σ₁ ≥ σ₂ ≥ σ₃) and
  eigenvalues are need E4.
- **Layouts (24 pages).** Sorts: `statics#1~zero-force`, `materials-science#1~defects`,
  `thermodynamics#0~regions`, `thermodynamics#2~possible`, `fluid-mechanics#3~which-number`,
  `manufacturing#0~families`, `manufacturing#2~families`, `manufacturing#3~fit-type`,
  `engineering-programming#0~syntax`, `#1~elementwise`, `#2~which-axes`, `#3~error-types`,
  `cad-graphics#0~line-types`, `#0~angle`, `#1` (GD&T categories, main), `#2~features`,
  `#3~drawing-sort`, `numerical-methods#0~families`, `finite-element-analysis#3~quality`,
  `#4~singularity`. Sequences: `manufacturing#2~workflow`, `engineering-programming#2~import`,
  `#3~function`, `cad-graphics#2` (main). Explore: `cad-graphics#0` (main, ⏳ P22) and
  `engineering-programming#0~trace` (⏳ P24). Every other main page is a calculator.
- **No page.** None of the 68 topics is left without a page. The full Buckingham-Π derivation,
  plate and shell theory beyond the circular plate, and 2D element formulation (CST, quads) are
  served only in part; each says so in its verdict.
- **Question data.** No released college questions are in `research/questions/` yet; every
  "Asks" line below lists the common textbook and FE-style types, to be checked against the
  research targets at the end.
- **Page count:** 68 main + 197 problem types = **265 pages** (241 calculators, 24 layouts);
  **98 wait on a picture or engine need** (⏳), most of them with an interim picture so they can
  ship first.

## Classical (Engineering Mechanics)

### 1. he.engineering.statics — Statics

- **Prereqs:** he.physics.university-1, he.math.calc-1. **Textbooks:** Engineering Statics: Open
  and Interactive (Baker & Haynes); Mechanics Map (Penn State); MIT OCW 2.001. **FE:** Statics
  (resultants, equilibrium, trusses, centroids, moments of inertia, friction).

#### #0 — Force vectors and equilibrium

- **Asks:** two-cable tensions holding a weight (main); resultant of 3 forces by components
  (~components); moment of a force about a point (~moment); beam reactions (~reactions).
- **Main — calculator:** a weight hung from two cables. Values: weight W (0–10⁶ N), cable angles
  θ₁, θ₂ above level (0.1–89.9°), tensions T₁, T₂ (N). Relations: ΣFₓ = 0: T₂ cos θ₂ = T₁ cos θ₁;
  ΣF_y = 0: T₁ sin θ₁ + T₂ sin θ₂ = W; solved form T₁ = W cos θ₂ ÷ sin(θ₁ + θ₂), T₂ = W cos θ₁ ÷
  sin(θ₁ + θ₂). Assumptions: the knot is a particle, so forces balance and moments don't enter;
  cables pull only (T ≥ 0); + x right, + y up. Example: W = 500 N, θ₁ = 30°, θ₂ = 60° → T₁ = 250 N,
  T₂ = 433.0 N (check ΣFₓ: 216.5 = 216.5). startWith W, θ₁, θ₂. Picture: `vectorDiagram`
  (existing), T₁ at direction 180° − θ₁ and T₂ at θ₂ by magnitude, `sum: 'parallelogram'`,
  result magnitude W at 90°, unit N; ⏳ P26 for the closed force triangle with W drawn.
  Use line: "Use this for 'A 500 N sign hangs from two cables at 30° and 60°. Find each tension.'"
- **~components:** resultant of three coplanar forces. Values F₁, α₁, F₂, α₂, F₃, α₃ (angles from
  + x), R_x, R_y, R, direction β (10). Relations: R_x = ΣF cos α; R_y = ΣF sin α; R = √(R_x² + R_y²);
  β = atan2(R_y, R_x). Example: 200 N at 0°, 300 N at 90°, 100 N at 225° → R_x = 129.3 N,
  R_y = 229.3 N, R = 263.2 N at 60.6°. ⏳ P26 (three arrows tip to tail); interim `vectorDiagram`
  of R alone with `components`.
- **~moment:** M_O = xF_y − yF_x (2-D cross product), and |M| = Fd. Values x, y (m), F_x, F_y (N),
  M_O (N·m, + counterclockwise), F, d. Example: F = (30, 40) N at (2, 1) m → M_O = 80 − 30 =
  50 N·m counterclockwise; F = 50 N, d = 1 m. Picture: `vectorDiagram` `space` with z = 0 and
  `cross` (r × F along z). Use line: "Use this for 'Find the moment of F = 30i + 40j N at (2, 1) m
  about the origin.'"
- **~reactions:** simply supported beam with one point load: R_A = P(L − a) ÷ L, R_B = Pa ÷ L.
  Values L, P, a, R_A, R_B. Example: L = 6 m, P = 12 kN at a = 2 m → R_A = 8 kN, R_B = 4 kN (ΣM_A:
  12 × 2 = 4 × 6). ⏳ P1 (`beam`, loads and reactions); interim `none`.
- **Verdict:** 4 pages; the four common types Solve (3-D cable systems are Partly: a 3 × 3 system
  on `numerical-methods#1`).

#### #1 — Trusses and frames

- **Asks:** member forces by joints (main); method of sections (~sections); zero-force members
  (~zero-force); a frame or pliers (~frame).
- **Main — calculator:** symmetric triangular truss, load P at the apex, pin and roller. Values
  span L (0.1–100 m), height h, P (N), slope θ (derived), reactions R, inclined members F_AC (−),
  bottom chord F_AB (+) (7). Relations: θ = tan⁻¹(2h ÷ L); R = P ÷ 2; F_AC = −P ÷ (2 sin θ);
  F_AB = P ÷ (2 tan θ). Assumptions: pin joints, loads only at joints, so each member is
  two-force; + tension. Example: L = 8 m, h = 3 m, P = 10 kN → θ = 36.87°, R = 5 kN,
  F_AC = −8.333 kN (C), F_AB = +6.667 kN (T). ⏳ P2 (`truss`); interim `vectorDiagram` of the apex
  joint (P down, two member forces, closed).
- **~sections:** Values R (left reaction), P, a (its position), cut joint x, h, panel angle θ,
  M, V, chord F, diagonal F_d (10). Relations: M = Rx − P(x − a); V = R − P; F = M ÷ h;
  F_d = V ÷ sin θ. Example: R = 15 kN, P = 10 kN at 3 m, x = 6 m, h = 4 m, θ = 53.13° → M = 60 kN·m,
  F = 15 kN, V = 5 kN, F_d = 6.25 kN. ⏳ P2 with a cut line.
- **~zero-force — sort:** bins "Zero-force member", "Carries force". Cards (P2 card figure
  `trussJoint`, text interim): an unloaded joint with two members at an angle (both zero); an
  unloaded T-joint, the stem (zero); the same T-joint with a load along the stem (carries); a
  loaded apex with two members (carries); a support joint with two members and a reaction
  (carries). Sentence: "At an unloaded joint, a member that nothing else can balance carries
  nothing."
- **~frame:** pliers as two levers on a pin. Values grip F (N), handle arm a, jaw arm b (mm), jaw
  force F_j, pin force F_p. Relations: F_j = Fa ÷ b; F_p = F + F_j. Example: 50 N, a = 120 mm,
  b = 30 mm → F_j = 200 N, F_p = 250 N. Picture: `simpleMachine` lever with `seesaw` (existing).
- **Verdict:** 4 pages; joints, sections and zero-force types Solve once P2 lands.

#### #2 — Centroids

- **Asks:** centroid of a composite (T, L) section (main); with a hole (~hole); resultant of a
  distributed load (~distributed); centroid under a curve by integration (~integration);
  Pappus volume (~pappus).
- **Main — calculator:** T-section from two rectangles. Values flange width b_f, flange
  thickness t_f, web height h_w, web thickness t_w (mm), areas A₁, A₂, centroid height ȳ (7).
  Relations: A₁ = b_f t_f; A₂ = t_w h_w; ȳ = (A₁(h_w + t_f/2) + A₂ h_w/2) ÷ (A₁ + A₂). Example:
  100 × 20 flange on an 80 × 20 web → A₁ = 2000, A₂ = 1600 mm², ȳ = 244,000 ÷ 3600 = 67.78 mm
  from the bottom. ⏳ P3 (`section`, centroid marked); interim `none`.
- **~hole:** plate with a round hole as a negative area. Values w, h, hole d, its center x_h,
  x̄. Example: 200 × 100 mm plate, d = 40 mm at x_h = 150 → x̄ = (2,000,000 − 188,496) ÷ 18,743.4 =
  96.65 mm. ⏳ P3.
- **~distributed:** triangular load w₀ over L → resultant w₀L ÷ 2 at L ÷ 3 from the high end.
  Example: 6 kN/m over 4.5 m → 13.5 kN at 1.5 m. ⏳ P1.
- **~integration:** area under y = kxⁿ from 0 to a: A = ka^(n+1) ÷ (n + 1), x̄ = (n + 1)a ÷ (n + 2),
  ȳ = (n + 1)kaⁿ ÷ (2(2n + 1)). Example: k = 1, n = 2, a = 3 → A = 9, x̄ = 2.25, ȳ = 2.7.
  Picture: `functionGraph` `family: 'power'` with `shade: { from: 0, to: 'a' }` (existing).
- **~pappus:** V = 2πr̄A. Example: 2 × 4 cm rectangle, r̄ = 5 cm → V = 251.3 cm³. Picture
  `curvedSolid` (existing, a cylinder ring stand-in) or `none`.
- **Verdict:** 5 pages; all five types Solve (I- and L-sections by setting a part to the right
  sizes; a third rectangle waits on P3).

#### #3 — Moments of inertia

- **Asks:** I of a rectangle about its centroid and a parallel axis (main); composite T-section
  (~composite); polar moment of a circle or tube (~polar); radius of gyration (~gyration).
- **Main — calculator:** Values b, h (mm), d (axis offset), Ī = bh³ ÷ 12, A, I = Ī + Ad² (mm⁴).
  Assumptions: d is measured from the centroid; the parallel-axis theorem only adds to the
  centroidal I. Example: b = 50, h = 100, d = 150 mm → Ī = 4.167 × 10⁶, Ad² = 112.5 × 10⁶,
  I = 116.7 × 10⁶ mm⁴. ⏳ P3.
- **~composite:** the #2 T-section, I about its centroid. Values b_f, t_f, h_w, t_w, ȳ, d₁, d₂,
  I (8). Example: d₁ = 22.22, d₂ = −27.78 mm → I = 66,667 + 987,654 + 853,333 + 1,234,568 =
  3.142 × 10⁶ mm⁴. ⏳ P3.
- **~polar:** J = π(d_o⁴ − d_i⁴) ÷ 32 (d_i = 0 for solid). Example: 60/40 mm tube → J =
  1.021 × 10⁶ mm⁴. ⏳ P3.
- **~gyration:** k = √(I ÷ A). Example: I = 2 × 10⁶ mm⁴, A = 2000 mm² → k = 31.62 mm (feeds
  `mechanics-of-materials#5~slenderness`).
- **Verdict:** 4 pages; the four types Solve.

#### #4 — Friction

- **Asks:** force to push a crate up a slope and to hold it (main); slip or tip (~tip); belt
  or rope on a drum (~belt).
- **Main — calculator:** Values W (N), θ (0–89°), μ_s (0–1.5), P_up, P_hold (N). Relations:
  P_up = W(sin θ + μ_s cos θ); P_hold = W(sin θ − μ_s cos θ) (0 when tan θ ≤ μ_s: it holds by
  itself). Assumptions: P acts along the slope; friction is at its limit μ_sN; impending
  motion. Example: 400 N, 25°, μ_s = 0.3 → P_up = 277.8 N, P_hold = 60.3 N. Picture: `freeBody`
  incline with `applied` along the slope and static friction (existing), `g: 9.81`.
- **~tip:** crate width b, push height h, W, μ_s: P_tip = Wb ÷ (2h); P_slip = μ_sW; the smaller
  wins. Example: 300 N, b = 0.6 m, h = 1.2 m, μ_s = 0.4 → tips at 75 N before slipping at 120 N.
  ⏳ P27 `tip`; interim `freeBody` floor.
- **~belt:** T₂ = T₁e^(μβ), β in radians. Example: T₁ = 100 N, μ = 0.3, β = 180° → T₂ = 256.6 N.
  ⏳ P27 `drum`.
- **Verdict:** 3 pages; wedges and square screws are Partly (not built; the incline page covers
  the wedge's single face).

### 2. he.engineering.dynamics — Dynamics

- **Prereqs:** statics, he.math.calc-2. **Textbooks:** Mechanics Map (dynamics); MIT OCW 2.003SC;
  OpenStax University Physics Vol. 1 (bridge, reference only). **FE:** Dynamics, kinematics.

#### #0 — Particle kinematics

- **Asks:** v and a from s(t) (main); normal and tangential acceleration on a curve (~nt);
  launch speed for a target (~projectile); relative velocity (~relative).
- **Main — calculator:** s(t) = c₃t³ + c₂t² + c₁t + c₀. Values c₃…c₀, time t (0–100 s),
  s (m), v (m/s), a (m/s²) (8). Relations: v = 3c₃t² + 2c₂t + c₁; a = 6c₃t + 2c₂ (the calc-1#1
  power rule term by term). Example: s = 2t³ − 9t² + 12t + 5, t = 3 s → s = 14 m, v = 12 m/s,
  a = 18 m/s². startWith c₃, c₂, c₁, c₀, t. Picture: `plot` with `tangentSlope` (as calc-1#1).
- **~nt:** a_n = v² ÷ ρ; a = √(a_t² + a_n²). Example: v = 20 m/s, ρ = 100 m, a_t = 3 m/s² →
  a_n = 4, a = 5 m/s². ⏳ P28; interim `circularMotion` string.
- **~projectile:** v₀ = √(gR ÷ sin 2θ) (level ground). Example: R = 40 m at 45° → v₀ = 19.81 m/s.
  Picture: `projectile` (existing).
- **~relative:** v_B/A = v_B − v_A. Example: A 20 m/s east, B 15 m/s north → 25 m/s at 143.1°.
  Picture: `vectorDiagram` tip to tail (v_B plus −v_A).
- **Verdict:** 4 pages; the four types Solve (polar coordinates are Partly).

#### #1 — Kinetics of particles

- **Asks:** block on a table pulled by a hanging mass (main); banked curve speed (~banked);
  elevator or crate with F = ma (covered by Grade 11 `s.11.dynamics-vectors`, linked).
- **Main — calculator:** Values m₁ (table), m₂ (hanging) (kg), μ_k, a (m/s²), T (N). Relations:
  a = (m₂ − μ_km₁)g ÷ (m₁ + m₂); T = m₂(g − a). Assumptions: light rope and pulley; m₁ already
  sliding; a ≤ 0 means it doesn't start (the page says so). Example: 10 kg, 4 kg, μ_k = 0.2 →
  a = 1.401 m/s², T = 33.63 N. ⏳ P27 `hangingMass`; interim `freeBody` floor with `tension`.
- **~banked:** v = √(gR tan θ) with no friction; with μ_s: v_max = √(gR(sin θ + μ cos θ) ÷ (cos θ −
  μ sin θ)). Example: R = 50 m, 20° → 13.36 m/s. ⏳ P27 `banked`.
- **Verdict:** 2 pages; both types Solve.

#### #2 — Work–energy and impulse–momentum

- **Asks:** spring compression after a rough patch (main); input power with efficiency
  (~power); average force from impulse (~impulse); restitution (~restitution).
- **Main — calculator:** Values m, v₀, μ_k, rough length d, spring k, compression x, heat
  W_f (J). Relations: ½mv₀² = μ_kmgd + ½kx²; W_f = μ_kmgd. Example: 2 kg at 5 m/s, μ_k = 0.25,
  d = 2 m, k = 800 N/m → W_f = 9.81 J, x = 0.1949 m. Picture: `energyTrack` `spring` with the
  rough patch (existing).
- **~power:** P_out = mgv; P_in = P_out ÷ η. Example: 500 kg at 0.8 m/s, η = 0.85 → 3924 W, 4616 W.
  Picture `powerLift`.
- **~impulse:** F_avg = m(v − v₀) ÷ Δt. Example: 0.145 kg, +40 → −30 m/s in 0.002 s → −5075 N.
  Picture `impulse`.
- **~restitution:** v₁′ = ((m₁ − em₂)v₁ + (1 + e)m₂v₂) ÷ (m₁ + m₂), and v₂′ likewise. Example:
  2 kg at 6 m/s into 3 kg at rest, e = 0.5 → 0.6 and 3.6 m/s. Picture `collision` `general`.
- **Verdict:** 4 pages; the four types Solve.

#### #3 — Rigid-body dynamics

- **Asks:** pulley with inertia and a hanging mass (main); rolling down a slope (~rolling);
  ladder or link by its instantaneous center (~ic); flywheel energy (~flywheel).
- **Main — calculator:** Values pulley mass M, radius r, I = ½Mr² (disk), hanging m, a, α, T.
  Relations: a = mg ÷ (m + I ÷ r²); α = a ÷ r; T = m(g − a). Example: M = 4 kg, r = 0.2 m, m = 2 kg
  → I = 0.08 kg·m², a = 4.905 m/s², α = 24.5 rad/s², T = 9.81 N. Picture: `rotor` with torque and
  acceleration (existing).
- **~rolling:** a = g sin θ ÷ (1 + c), c = I ÷ (mr²) (hoop 1, disk ½, ball 0.4). Example: ball on
  30° → 3.504 m/s². Picture: `rotor` `compare` `hollow` (existing); ⏳ P29 `rolling` for the slope.
- **~ic:** ladder of length L sliding, foot speed v_A, angle θ with the floor: ω = v_A ÷ (L sin θ);
  v_B = v_A ÷ tan θ. Example: L = 5 m, θ = 60°, v_A = 2 m/s → ω = 0.462 rad/s, v_B = 1.155 m/s
  down. ⏳ P29.
- **~flywheel:** E = ½Iω², ω = 2πN ÷ 60. Example: I = 2 kg·m², 3000 rpm → 98.7 kJ. Picture `rotor`.
- **Verdict:** 4 pages; the four types Solve once P29 lands (two ship now).

### 3. he.engineering.mechanics-of-materials — Mechanics of Materials (Solid Mechanics I)

- **Prereqs:** statics. **Textbooks:** Mechanics of Materials (Roylance, LibreTexts); Strength of
  Materials (Engineering Mechanics OER); Essential Mechanics (RIT); MIT OCW 2.001. **FE:**
  Mechanics of materials (stress, strain, torsion, bending, deflection, buckling, Mohr's circle).
- Every page: N–mm–MPa formula units (E2), steel by default (E = 200 GPa, ν = 0.3), linear
  elastic and small deflections (one assumption line).

#### #0 — Stress and strain

- **Asks:** stress, strain and elongation of a rod (main); bolt in single or double shear
  (~shear); diameter change by Poisson (~poisson); size a member for a factor of safety
  (~safety); principal stresses and Mohr's circle (~mohr); pressure vessel (~vessel).
- **Main — calculator:** Values load P (N), diameter d (mm), area A, length L, stress σ, strain
  ε, elongation δ, modulus E (8). Relations: A = πd² ÷ 4; σ = P ÷ A; ε = δ ÷ L; σ = Eε.
  Assumptions: the load is axial through the centroid; stress below the proportional limit.
  Example: 50 kN on d = 20 mm, L = 2 m → A = 314.2 mm², σ = 159.2 MPa, ε = 7.96 × 10⁻⁴,
  δ = 1.592 mm. startWith P, d, L, E. ⏳ P5 (σ–ε line with the point) and P1 `axial`; interim
  `functionGraph` linear σ = Eε with the point.
- **~shear:** τ = P ÷ (nA), n = 1 or 2 shear planes (`allowed: [1, 2]`). Example: 30 kN, double,
  d = 16 mm → 74.6 MPa.
- **~poisson:** ε_lat = −νε; Δd = ε_lat d. Example: from main, ν = 0.3 → −2.39 × 10⁻⁴,
  Δd = −0.00477 mm.
- **~safety:** σ_allow = σ_Y ÷ n; A = P ÷ σ_allow; d = √(4A ÷ π). Example: 80 kN, 250 MPa, n = 2 →
  125 MPa, 640 mm², d = 28.55 mm.
- **~mohr:** plane-stress transformation. Values σₓ, σ_y, τₓ_y, σ_avg, R, σ₁, σ₂, θ_p, τ_max (9).
  Relations: σ_avg = (σₓ + σ_y) ÷ 2; R = √(((σₓ − σ_y) ÷ 2)² + τₓ_y²); σ₁,₂ = σ_avg ± R;
  tan 2θ_p = 2τₓ_y ÷ (σₓ − σ_y); τ_max = R (in plane). Example: 80, −20, 40 MPa → σ_avg = 30,
  R = 64.03, σ₁ = 94.03, σ₂ = −34.03 MPa, θ_p = 19.33°. ⏳ P4 (element and circle).
- **~vessel:** σ_h = pr ÷ t; σ_a = pr ÷ (2t) (thin wall, r ÷ t ≥ 10, said). Example: 2 MPa,
  r = 500 mm, t = 10 mm → 100 and 50 MPa. ⏳ P3 `vessel`.
- **Verdict:** 6 pages; all six types Solve (transformation and vessels aren't topics of their
  own; see "Not in the taxonomy").

#### #1 — Axial loading

- **Asks:** elongation of a stepped bar (main); thermal stress in a restrained bar (~thermal);
  bar fixed at both ends (~indeterminate); two materials sharing a load (~composite).
- **Main — calculator:** Values P, E, L₁, A₁, L₂, A₂, δ₁, δ₂, δ (9). Relations: δᵢ = PLᵢ ÷ (AᵢE);
  δ = δ₁ + δ₂. Example: aluminum, 20 kN, 400 mm × 400 mm² and 300 mm × 200 mm² → δ₁ = 0.286,
  δ₂ = 0.429, δ = 0.714 mm. ⏳ P1 `axial`.
- **~thermal:** δ_T = αΔT L; restrained σ = −EαΔT. Example: steel α = 12 × 10⁻⁶ /°C, ΔT = 40 °C →
  −96 MPa. Needs the ΔT unit (E1). ⏳ P1 `axial` between walls.
- **~indeterminate:** load P at a from the left wall, both ends fixed: R_A = Pb ÷ L, R_B = Pa ÷ L.
  Example: 30 kN, a = 0.4, b = 0.6 m → 18 kN and 12 kN. Assumption: one material and area.
- **~composite:** steel rods in a concrete post: P_s = P(EA)_s ÷ ((EA)_s + (EA)_c). Example:
  1000 kN, A_s = 2000 mm² at 200 GPa, A_c = 88,000 mm² at 25 GPa → P_s = 153.8 kN, σ_s = 76.9 MPa,
  σ_c = 9.62 MPa.
- **Verdict:** 4 pages; the four types Solve (three-segment bars are Partly).

#### #2 — Torsion

- **Asks:** max shear and twist of a solid shaft (main); hollow shaft (~hollow); diameter for
  a power and speed (~power).
- **Main — calculator:** Values T (N·m), d, L (mm), G, J, τ_max, φ (rad and °). Relations:
  J = πd⁴ ÷ 32; τ_max = T(d ÷ 2) ÷ J; φ = TL ÷ (GJ). Example: 2 kN·m, d = 50 mm, L = 1.5 m, G = 77 GPa
  → J = 613,592 mm⁴, τ_max = 81.49 MPa, φ = 0.0635 rad = 3.64°. ⏳ P6 (`shaft`).
- **~hollow:** J = π(d_o⁴ − d_i⁴) ÷ 32. Example: 60/40 mm, 2 kN·m → 58.76 MPa.
- **~power:** T = P ÷ ω, ω = 2πN ÷ 60; d = (16T ÷ (πτ_allow))^(1/3). Example: 30 kW at 1200 rpm →
  T = 238.7 N·m; τ_allow = 60 MPa → d = 27.26 mm. Use line: "Use this for 'Size a solid shaft to
  carry 30 kW at 1200 rpm with 60 MPa allowed.'"
- **Verdict:** 3 pages; the three types Solve (statically indeterminate shafts are Partly).

#### #3 — Bending and shear

- **Asks:** bending stress (main); shear and moment at a point and the maxima (~diagrams);
  shear stress at the neutral axis (~shear-stress); pick a section by S (~modulus).
- **Main — calculator:** rectangle b × h under M. Values M (N·m), b, h, I, c, σ_max (6). Relations:
  I = bh³ ÷ 12; c = h ÷ 2; σ = Mc ÷ I. Example: 20 kN·m, 100 × 200 mm → I = 66.67 × 10⁶ mm⁴,
  σ = 30 MPa. ⏳ P3 with the linear stress block.
- **~diagrams:** simply supported, uniform w: R = wL ÷ 2; V(x) = w(L ÷ 2 − x); M(x) = wx(L − x) ÷ 2;
  M_max = wL² ÷ 8. Example: 10 kN/m, 6 m, x = 2 m → V = 10 kN, M = 40 kN·m, M_max = 45 kN·m.
  ⏳ P1 with V and M diagrams (the biggest picture need of the group).
- **~shear-stress:** τ = VQ ÷ (It); rectangle at the neutral axis τ_max = 1.5V ÷ A. Example:
  30 kN on 100 × 200 mm → 2.25 MPa. ⏳ P3 with the parabola.
- **~modulus:** S_req = M ÷ σ_allow; rectangle with b = h ÷ 2: h = (12S)^(1/3). Example: 45 kN·m,
  150 MPa → S = 300 × 10³ mm³, h = 153.3 mm. Use line: "Use this for 'Choose the depth of a beam
  that carries 45 kN·m at 150 MPa allowed.'"
- **Verdict:** 4 pages; the four types Solve after P1 and P3 (I-beams by typed I).

#### #4 — Beam deflection

- **Asks:** cantilever tip deflection and slope (main); simply supported, uniform load (~udl);
  superposition (~superpose); deflection at any x by integration (~curve).
- **Main — calculator:** Values P, L, E, I, δ_max, θ_max. Relations: δ = PL³ ÷ (3EI);
  θ = PL² ÷ (2EI). Example: 5 kN, 2 m, 200 GPa, 8 × 10⁶ mm⁴ → δ = 8.333 mm, θ = 0.00625 rad.
  ⏳ P1 deflected shape; interim `functionGraph` polynomial (the curve below).
- **~udl:** δ_max = 5wL⁴ ÷ (384EI) and the L ÷ 360 limit. Example: 10 kN/m, 6 m, I = 80 × 10⁶ mm⁴ →
  10.55 mm < 16.7 mm.
- **~superpose:** δ = PL³ ÷ (3EI) + wL⁴ ÷ (8EI). Example: main plus 2 kN/m → 8.333 + 2.5 = 10.83 mm.
- **~curve:** from EIy″ = M(x): y(x) = Px²(3L − x) ÷ (6EI) (downward). Example: x = 1 m → 2.604 mm.
  Picture: `functionGraph` `family: 'polynomial'` coefficients in x (existing), the point at x.
- **Verdict:** 4 pages; the four types Solve (propped cantilevers are Partly, through FEA#2).

#### #5 — Column buckling

- **Asks:** Euler load with end conditions (main); slenderness and whether Euler applies
  (~slenderness); intermediate columns, Johnson (~johnson).
- **Main — calculator:** Values E, I, L, K (`allowed: [0.5, 0.7, 1, 2]`, named fixed–fixed,
  fixed–pinned, pinned–pinned, fixed–free), P_cr. Relation: P_cr = π²EI ÷ (KL)². Example: pinned,
  3 m, I = 2 × 10⁶ mm⁴ → 438.6 kN. ⏳ P1 `column`.
- **~slenderness:** r = √(I ÷ A); λ = KL ÷ r; σ_cr = π²E ÷ λ². Example: A = 2000 mm² → r = 31.62 mm,
  λ = 94.87, σ_cr = 219.3 MPa < σ_Y = 250 (Euler holds). A limit line, not a relation: "σ_cr must be
  below σ_Y for Euler's formula".
- **~johnson:** σ_cr = σ_Y − (σ_Yλ ÷ (2π))² ÷ E, for λ < λ_c = √(2π²E ÷ σ_Y). Example: λ = 60 →
  221.5 MPa; λ_c = 125.7.
- **Verdict:** 3 pages; the three types Solve.

### 4. he.engineering.materials-science — Materials Science & Material Properties

- **Prereqs:** he.chemistry.gen-chem-1. **Textbooks:** DoITPoMS teaching packages (Cambridge);
  MIT OCW 3.091; OpenStax Chemistry 2e (solids; reference only). **FE:** Materials (crystal
  structures, phase diagrams, properties).

#### #0 — Crystal structures

- **Asks:** density from the unit cell (main); packing factor (~apf); X-ray peak by Bragg's law
  for a plane (~bragg).
- **Main — calculator:** Values structure atoms n (`allowed: [1, 2, 4]`, SC, BCC, FCC), radius R
  (nm), edge a (nm), molar mass A (g/mol), density ρ (g/cm³). Relations: a = 2R, 4R ÷ √3 or 2√2R
  (by n); ρ = nA ÷ (a³N_A). Example: FCC copper, R = 0.128 nm, A = 63.55 → a = 0.3620 nm,
  ρ = 8.90 g/cm³. ⏳ P7 (`unitCell`).
- **~apf:** APF = n(4/3)πR³ ÷ a³ → 0.52, 0.68, 0.74. Example: BCC → 0.680. ⏳ P7.
- **~bragg:** d = a ÷ √(h² + k² + l²); nλ = 2d sin θ. Example: a = 0.3615 nm, (111), λ = 0.1542 nm →
  d = 0.2087 nm, θ = 21.68°, 2θ = 43.36°. ⏳ P7 with the plane.
- **Verdict:** 3 pages; the three types Solve (HCP and Miller-direction drawing are Partly).

#### #1 — Defects and diffusion

- **Asks:** carbon content at a depth after carburizing (main); D at a temperature
  (~arrhenius); vacancies (~vacancies); steady flux, Fick's first law (~flux); defect types
  (~defects).
- **Main — calculator:** Values C₀, C_s (wt%), depth x (mm), D (m²/s), time t (h), z, C_x (7).
  Relations: z = x ÷ (2√(Dt)); (C_x − C₀) ÷ (C_s − C₀) = 1 − erf(z). Example: 0.20 → 1.00 wt%,
  x = 0.5 mm, D = 1.6 × 10⁻¹¹, 10 h → z = 0.329, erf = 0.359, C_x = 0.713 wt%. Needs erf and its
  inverse in the engine (E7). ⏳ P9 `erfc` profile.
- **~arrhenius:** D = D₀e^(−Q_d ÷ RT). Example: D₀ = 2.3 × 10⁻⁵ m²/s, 148 kJ/mol, 1173 K →
  5.9 × 10⁻¹² m²/s. Picture `functionGraph` exponential (ln D against 1/T is P9's `axes` option).
- **~vacancies:** N_v = Ne^(−Q_v ÷ kT). Example: 8.0 × 10²⁸ m⁻³, 0.9 eV, 1273 K → 2.19 × 10²⁵ m⁻³.
- **~flux:** J = −D ΔC ÷ Δx. Example: 3 × 10⁻¹¹ m²/s, 0.4 kg/m³ over 5 mm → 2.4 × 10⁻⁹ kg/(m²·s).
- **~defects — sort:** bins "Point", "Line", "Interfacial", "Volume". Cards (P31 icons): vacancy,
  interstitial atom, substitutional impurity, edge dislocation, screw dislocation, grain
  boundary, twin boundary, pore, inclusion. Sentence: "Defects are sorted by how many dimensions
  they extend in."
- **Verdict:** 5 pages; the five types Solve.

#### #2 — Phase diagrams

- **Asks:** phase fractions by the lever rule (main); eutectic microconstituents (~eutectic);
  pearlite and proeutectoid ferrite in a steel (~steel).
- **Main — calculator:** Values alloy C₀, liquid C_L, solid C_α (wt%), W_L, W_α (5). Relations:
  W_L = (C_α − C₀) ÷ (C_α − C_L); W_α = 1 − W_L. Assumptions: the alloy is inside the two-phase
  region; C_L and C_α are read on the tie line at T. Example: 35, 31.5, 42.5 → W_L = 0.682,
  W_α = 0.318. ⏳ P8 (`binaryPhase` isomorphous).
- **~eutectic:** W_e = (C₀ − C_α) ÷ (C_E − C_α). Example: C_α = 18.3, C_E = 61.9, C₀ = 40 → 0.498.
  ⏳ P8 eutectic.
- **~steel:** W_P = (C₀ − 0.022) ÷ (0.76 − 0.022); W_α′ = 1 − W_P. Example: 0.40 wt% C → 0.512, 0.488.
  Assumption names the eutectoid composition the texts use (0.76 wt% C; some write 0.77 or 0.8).
- **Verdict:** 3 pages; the three types Solve once P8 lands.

#### #3 — Mechanical properties

- **Asks:** tensile strength, elongation and reduction of area (main); true stress and strain
  (~true); resilience (~resilience); critical crack size (~fracture).
- **Main — calculator:** Values d₀, F_max, L₀, L_f, d_f, UTS, %EL, %RA (8). Relations: UTS =
  F_max ÷ (πd₀² ÷ 4); %EL = (L_f − L₀) ÷ L₀; %RA = 1 − (d_f ÷ d₀)². Example: 12.8 mm, 50 kN, 50 → 62 mm,
  d_f = 9.0 mm → 388.6 MPa, 24 %, 50.6 %. ⏳ P5.
- **~true:** σ_T = σ(1 + ε); ε_T = ln(1 + ε) (before necking, said). Example: 400 MPa at 0.10 → 440
  MPa, 0.0953.
- **~resilience:** U_r = σ_Y² ÷ (2E). Example: 250 MPa, 200 GPa → 0.156 MJ/m³. ⏳ P5 area.
- **~fracture:** K_Ic = Yσ√(πa); a_c = (K_Ic ÷ (Yσ))² ÷ π. Example: 50 MPa√m, 300 MPa, Y = 1 → 8.84 mm.
- **Verdict:** 4 pages; the four types Solve (hardness conversions are Partly, empirical).

### 5. he.engineering.engineering-programming — Engineering Programming (MATLAB/Python)

- **Prereqs:** he.math.calc-1. **Textbooks:** Python Programming and Numerical Methods (Kong,
  Siauw, Bayen; free to read online); MIT OCW 2.086 (MATLAB) and 6.0001 (Python).
- Code appears only as short snippets on layout cards and in use lines, in a code font (need
  E11); both MATLAB and Python are shown wherever they differ. Calculators here count honest
  quantities: elements, iterations, sizes, bits.

#### #0 — Variables, arrays and control flow

- **Asks:** how many times a loop runs and the sum it builds (main); the last index and range
  of an integer type (~int-range); which language a line is (~syntax); trace a while loop
  (~trace).
- **Main — calculator:** MATLAB `a:s:b` and Python `range(a, b + s, s)` give the same terms here.
  Values start a, step s, stop b, count n, last term ℓ, sum S (6). Relations: n = ⌊(b − a) ÷ s⌋ + 1;
  ℓ = a + (n − 1)s; S = n(a + ℓ) ÷ 2. Assumptions: s > 0 and whole numbers; Python's stop is
  excluded, so `range(1, 10, 2)` is 1, 3, 5, 7, 9. Example: 1:2:10 → n = 5, ℓ = 9, S = 25.
  Picture: `termsChart` (bars and stepped partial sums, existing). Use line: "Use this for 'How
  many times does for k = 1:2:10 run, and what is the total?'"
- **~int-range:** n-bit signed: −2^(n−1) to 2^(n−1) − 1; unsigned 0 to 2ⁿ − 1. Values bits n
  (`allowed: [8, 16, 32, 64]`), min, max. Example: int8 → −128 to 127; uint8 → 0 to 255.
- **~syntax — sort:** bins "MATLAB only", "Python only", "Both". Cards: `A(end)`, `A[-1]`,
  `x = 1:5`, `x += 1`, `y = x'` (transpose), `% note`, `# note`, `if x > 3 … end`, `x = 5`,
  `a == b`. Sentence: "MATLAB counts from 1 with ( ); Python counts from 0 with [ ]."
- **~trace — explore:** ⏳ P24 `codeTrace`. Scenes: a while loop doubling x from 1 until x > 20,
  each scene one pass with the variables table (1, 2, 4, 8, 16, 32) and the test that ends it.
- **Verdict:** 4 pages; counting and syntax types Solve; tracing waits on P24.

#### #1 — Vectorized computation

- **Asks:** size of a matrix product and the multiplications it takes (main); element-wise or
  matrix operator (~elementwise); broadcasting shape (~broadcast).
- **Main — calculator:** Values rows m, inner n, columns p, result rows, result columns,
  multiplications m·n·p (6). Example: (3 × 4)(4 × 2) → 3 × 2, 24 multiplications. A limit line:
  "the inner sizes must match". Picture: `matrixGrid` `multiply` with numbered entries (existing).
- **~elementwise — sort:** bins "Element by element", "Matrix product", "Error: sizes don't fit".
  Cards: MATLAB `A .* B` (3 × 3, 3 × 3); MATLAB `A * B` (3 × 4, 4 × 2); NumPy `A @ B` (3 × 4, 4 × 2);
  NumPy `A * B` (3 × 3, 3 × 3); MATLAB `A + B` (2 × 3, 3 × 2); MATLAB `A .^ 2`; MATLAB `A * B`
  (2 × 3, 2 × 3). Sentence: "In NumPy * works element by element; in MATLAB * is the matrix product."
- **~broadcast:** NumPy rule per axis: equal, or one of them is 1. Values a₁, a₂, b₁, b₂, r₁, r₂.
  Example: (3, 1) + (1, 4) → (3, 4). A mismatch is rejected with the rule as its reason.
- **Verdict:** 3 pages; the three types Solve.

#### #2 — Plotting and data import

- **Asks:** which axes make the data a straight line (~which-axes); exponent of a power law from
  two points on log–log axes (main); rate of exponential data on semilog axes (~semilog);
  steps to read and plot a data file (~import).
- **Main — calculator:** y = axⁿ through (x₁, y₁), (x₂, y₂). Values x₁, y₁, x₂, y₂, n, a. Relations:
  n = log(y₂ ÷ y₁) ÷ log(x₂ ÷ x₁); a = y₁ ÷ x₁ⁿ. Example: (2, 10), (8, 80) → n = 1.5, a = 3.536.
  Picture: `functionGraph` `family: 'power'` (existing); a log–log axis option is P9.
- **~semilog:** y = y₀e^(kx): k = ln(y₂ ÷ y₁) ÷ (x₂ − x₁). Example: (0, 5), (4, 20) → k = 0.3466.
- **~which-axes — sort:** bins "Plain axes", "Semilog (log y)", "Log–log". Cards: y = 4x + 1;
  y = 3e^(0.5x); y = 2x^1.5; counts of a decaying sample against time; T² ∝ a³ for planets;
  bacteria doubling each hour; S–N fatigue data; voltage against current in a resistor.
  Sentence: "A straight line on log axes means a power law; on semilog, an exponential."
- **~import — sequence:** read the file → keep the columns you need → drop rows with missing
  values → convert to the formula's units → plot → label axes with units → save the figure.
- **Verdict:** 4 pages; the four types Solve.

#### #3 — Scripting engineering calculations

- **Asks:** loop over a design variable until a check passes (main); write a function in order
  (~function); classify bugs (~error-types).
- **Main — calculator:** sweep a beam depth. Values M, b, σ_allow, start h₀, step Δh, h_min,
  first passing depth h* (7). Relations: h_min = √(6M ÷ (bσ_allow)); h* = h₀ + ⌈(h_min − h₀) ÷ Δh⌉Δh.
  Example: 10 kN·m, b = 50 mm, 150 MPa, from 50 mm by 10 → h_min = 89.44 mm, h* = 90 mm (σ = 148.1
  MPa; 80 mm gives 187.5). Picture: `table` with `rows` of h and σ and `graph: { best }`
  (existing), the first pass ringed.
- **~function — sequence:** name the inputs and their units → check the inputs → compute →
  return the result → test it against a hand calculation.
- **~error-types — sort:** bins "Syntax error (won't run)", "Runtime error (stops)", "Logic error
  (wrong answer)". Cards: misspelled `fro` for `for`; a missing parenthesis; index past the end;
  an undefined variable; a data file not found; `sin(30)` meant as 30°; mm left in a formula
  in m; a loop one pass short.
- **Verdict:** 3 pages; the three types Solve.

### 6. he.engineering.cad-graphics — Engineering Graphics & CAD

- **Prereqs:** m.10.constructions. **Textbooks:** Engineering Graphics and Design (Ford, UW
  Tacoma Pressbooks); Blueprint Reading (WisTech Open); ASME Y14.5 (titles and symbol names only).
- This course is drawn, not computed: 3 of 4 mains are layouts; calculators only where a number
  is the point (scale, bonus tolerance, sketch and mechanism DOF).

#### #0 — Orthographic and isometric projection

- **Asks:** which view is the top view; hidden and center lines; first- vs third-angle; true
  length on an isometric projection.
- **Main — explore:** ⏳ P22 figure `orthographic` (a stepped block with a hole). Scenes: the
  glass box unfolding; front view lit; top view lit, placed above the front (third angle);
  right view lit; a hidden edge dashed; the hole's center lines; the isometric view on 120° axes.
- **~line-types — sort:** bins "Visible", "Hidden", "Center", "Dimension or extension". Cards: an
  edge you can see; an edge behind a face; the axis of a hole; the line a size is written on;
  the short line carried out from an edge; a circle's symmetry line.
- **~angle — sort:** bins "Third angle (US)", "First angle (ISO)". Cards: top view above the front;
  top view below the front; right view to the right of the front; right view on the left.
- **~isometric:** projected length = L√(2/3) on a true isometric projection; an isometric
  drawing uses full size. Values L, ratio (0.8165), projected length. Example: 50 mm → 40.82 mm.
- **Verdict:** 4 pages; the four types Solve once P22 lands (the sorts ship now with text cards).

#### #1 — Dimensioning and GD&T basics

- **Asks:** which category a symbol is in (main); bonus tolerance at MMC (~bonus); virtual
  condition and whether parts fit (~virtual).
- **Main — sort:** bins "Form", "Orientation", "Location", "Profile", "Runout". Cards (P23 icons):
  straightness, flatness, circularity, cylindricity; perpendicularity, parallelism,
  angularity; position; profile of a line, profile of a surface; circular runout, total
  runout. Sentence: "Form controls need no datum; the other four are measured from datums."
- **~bonus:** bonus = |actual size − MMC size|; total = stated + bonus. Values MMC size, actual
  size, stated tolerance, bonus, total. Example: hole Ø10.0–10.2 at MMC, position Ø0.1, actual
  Ø10.15 → bonus 0.15, total Ø0.25.
- **~virtual:** hole VC = MMC − tol; shaft VC = MMC + tol; fits when shaft VC ≤ hole VC. Example: hole
  Ø10.0, tol 0.1 → 9.9; shaft Ø9.8 MMC, tol 0.05 → 9.85: fits with 0.05 to spare.
- **Verdict:** 3 pages; the three types Solve.

#### #2 — Parametric solid modeling

- **Asks:** the order of building a part (main); is the sketch fully defined (~sketch-dof);
  which feature adds or removes material (~features).
- **Main — sequence:** choose a sketch plane → sketch the profile → constrain and dimension it
  fully → extrude it into a solid → sketch a circle on a face → cut the hole through → pattern
  the hole → check the mass properties. Each stage needs the one before it.
- **~sketch-dof:** DOF = 2 × points + 3 × circles − constraints removed. Values points p, circles
  c, removed r, DOF. Example: a rectangle's 4 corners = 8; 2 horizontal + 2 vertical + width +
  height + a corner fixed at the origin (2) remove 8 → 0, fully defined. A negative DOF is
  rejected: "over-defined: remove a constraint".
- **~features — sort:** bins "Adds material", "Removes material", "Copies features". Cards: boss
  extrude, revolve, loft, sweep, cut extrude, hole, shell, linear pattern, circular pattern,
  mirror.
- **Verdict:** 3 pages; the three types Solve.

#### #3 — Assemblies and drawings

- **Asks:** degrees of freedom of a linkage (main); drawing scale (~scale); what belongs on a
  part or an assembly drawing (~drawing-sort).
- **Main — calculator:** Gruebler: M = 3(n − 1) − 2j₁ − j₂. Values links n (with the ground),
  full joints j₁ (pins, sliders), half joints j₂, mobility M. Example: four-bar, n = 4, j₁ = 4 →
  M = 1; a five-bar → 2. ⏳ P29 `linkage`; interim `none`.
- **~scale:** drawn = true × scale. Example: 1:5, 300 mm → 60 mm.
- **~drawing-sort — sort:** bins "Part (detail) drawing", "Assembly drawing". Cards: every size
  needed to make it; one part's tolerances; its material; balloons with item numbers; the bill
  of materials; an exploded view; surface-finish symbols; fastener torque notes.
- **Verdict:** 3 pages; the three types Solve.

### 7. he.engineering.numerical-methods — Numerical Methods for Engineers

- **Prereqs:** engineering-programming, he.math.diff-eq, he.math.linear-algebra. **Textbooks:**
  Holistic Numerical Methods (Kaw, USF); Python Programming and Numerical Methods; MIT OCW 2.086.
- One step is worked in full; the iteration table is E6.

#### #0 — Root finding

- **Asks:** one Newton step and the approximate error (main); bisection bracket and the number of
  halvings (~bisection); secant step (~secant); bracketing vs open (~families).
- **Main — calculator:** f(x) = c₃x³ + c₂x² + c₁x + c₀. Values c₃…c₀, x₀, f(x₀), f′(x₀), x₁, error
  ε_a (9). Relations: f′ by the power rule; x₁ = x₀ − f(x₀) ÷ f′(x₀); ε_a = |x₁ − x₀| ÷ |x₁|.
  Example: x³ − x − 3 from x₀ = 2 → f = 3, f′ = 11, x₁ = 1.7273, ε_a = 15.8 %. Picture: `plot`
  with `tangentSlope` (as calc-1#1); ⏳ P9 `newton` for the steps.
- **~bisection:** midpoint m = (a + b) ÷ 2; halvings n = ⌈log₂((b − a) ÷ tol)⌉. Values a, b, f(a),
  f(m), m, tol, n. Example: [1, 2], f(1.5) = −1.125 < 0 → [1.5, 2]; tol 10⁻⁴ → 14. ⏳ P9 `bisect`.
- **~secant:** x₂ = x₁ − f(x₁)(x₁ − x₀) ÷ (f(x₁) − f(x₀)). Example: (1, −3), (2, 3) → 1.5.
- **~families — sort:** bins "Bracketing", "Open". Cards: bisection, false position, Newton–Raphson,
  secant, fixed-point iteration. Sentence: "A bracketing method keeps a sign change; an open one
  can be faster but may run away."
- **Verdict:** 4 pages; the four types Solve (several iterations wait on E6).

#### #1 — Solving linear systems

- **Asks:** Gaussian elimination on 3 × 3 (main); one Gauss–Seidel sweep (~gauss-seidel);
  condition number and ill-conditioning (~condition).
- **Main — calculator:** `matrixGrid` `rowReduce` with typed entries (existing, `steps: 'echelon'`).
  Example: 2x + y − z = 1; x + 3y + 2z = 13; 3x − y + z = 4 → (1, 2, 3).
- **~gauss-seidel:** 2 × 2: x₁ = (b₁ − a₁₂y₀) ÷ a₁₁; y₁ = (b₂ − a₂₁x₁) ÷ a₂₂. Values a₁₁, a₁₂, a₂₁, a₂₂,
  b₁, b₂, x₀, y₀, x₁, y₁ (10). Example: 4x + y = 9, x + 3y = 5 from (0, 0) → (2.25, 0.917); the
  answer is (2, 1).
- **~condition:** κ∞ = ‖A‖∞‖A⁻¹‖∞ for 2 × 2. Example: [[1, 1], [1, 1.001]] → det 0.001, κ = 4004.
  Picture: `matrixGrid` `determinant`.
- **Verdict:** 3 pages; the three types Solve (LU is Partly: same eliminations, no L shown).

#### #2 — Interpolation and curve fitting

- **Asks:** quadratic (Lagrange) interpolation (main); linear interpolation in a table (~linear);
  least-squares line and r² (~least-squares).
- **Main — calculator:** Values x₀, y₀, x₁, y₁, x₂, y₂, x, y (8). Relation: Lagrange's three-term sum.
  Example: (1, 2), (2, 3), (4, 11) at x = 3 → 6. ⏳ P9 `through`; interim `functionGraph`
  quadratic.
- **~linear:** y = y₁ + (x − x₁)(y₂ − y₁) ÷ (x₂ − x₁). Example: (100, 2676), (150, 2776) at 120 → 2716.
- **~least-squares:** `scatter` with `leastSquares` (existing). Example: x = 0…4, y = 1.1, 2.9,
  5.2, 7.1, 8.8 → y = 1.96x + 1.10, r² = 0.9976.
- **Verdict:** 3 pages; the three types Solve (splines are Partly).

#### #3 — Numerical integration

- **Asks:** composite trapezoid and Simpson (main); integral of tabulated data (~data); error
  estimate (~error); two-point Gauss (~gauss).
- **Main — calculator:** f(x) = kx^p. Values k, p (0–5, whole), a, b, n (even), h, trapezoid T,
  Simpson S, exact I, error (10). Example: x³ on [0, 2], n = 4 → T = 4.25, S = 4 (exact for a
  cubic), error 6.25 %. Picture: `functionGraph` `riemann` (existing, middle); ⏳ P9 `trapezoid`.
- **~data:** distance from speeds every h seconds: T = h(v₀ ÷ 2 + v₁ + v₂ + v₃ ÷ 2). Example: 0, 12, 20,
  24 m/s every 10 s → 440 m. Picture: `table` (interim).
- **~error:** E ≈ −(b − a)h²f″ ÷ 12. Example: h = 0.5, average f″ = 6 → −0.25 (matches 4 − 4.25).
- **~gauss:** ∫ ≈ ((b − a) ÷ 2)(f(x₋) + f(x₊)), x± = mid ± ((b − a) ÷ 2) ÷ √3. Example: x³ on [0, 2] → 4.000.
- **Verdict:** 4 pages; the four types Solve.

#### #4 — Numerical ODE solvers (Euler, Runge–Kutta)

- **Asks:** n Euler steps against the exact answer (main); one RK4 step (~rk4); Heun (~heun);
  step size for stability (~stability).
- **Main — calculator:** dy/dt = ky. Values y₀, k, h, steps n, t, y_Euler, y_exact, error (8).
  Relations: y_Euler = y₀(1 + kh)ⁿ; y_exact = y₀e^(knh). Example: y₀ = 10, k = −0.5, h = 0.5, n = 4 →
  3.164 vs 3.679, error 14.0 %. Picture: `functionGraph` exponential; ⏳ P9 `euler` steps.
- **~rk4:** k₁…k₄ for one step. Example: same ODE, h = 0.5 → k₁ = −5, k₂ = −4.375, k₃ = −4.4531,
  k₄ = −3.8867, y₁ = 7.7881 (exact 7.7880).
- **~heun:** y₁ = y₀ + (h ÷ 2)(k₁ + k₂). Example → 7.8125.
- **~stability:** growth factor g = 1 + kh; stable when |g| ≤ 1. Example: k = −50, h = 0.05 → −1.5
  (unstable); h ≤ 0.04 is stable.
- **Verdict:** 4 pages; the four types Solve (systems of ODEs are Partly).

### 8. he.engineering.advanced-solid-mechanics — Advanced Solid Mechanics (Solid Mechanics II)

- **Prereqs:** mechanics-of-materials, he.math.linear-algebra. **Textbooks:** Applied Mechanics of
  Solids (Bower, solidmechanics.org, free to read, all rights reserved); MIT OCW 2.002 and
  2.080J. Notation: matrices written out in full, no index notation in steps (need E3 covers
  σᵢⱼ only in assumptions).

#### #0 — Stress and strain tensors

- **Asks:** principal stresses and τ_max when one principal is known (main); invariants of a
  full tensor (~invariants); octahedral stresses (~octahedral); strain rosette (~rosette).
- **Main — calculator:** τ_yz = τ_zx = 0, so σ_z is principal. Values σₓ, σ_y, σ_z, τₓ_y, σ₁, σ₂,
  σ₃, τ_max (8). Relations: in-plane σ_avg ± R; order the three; τ_max = (σ₁ − σ₃) ÷ 2. Example: 60,
  20, −30, 15 MPa → in plane 65 and 15 → σ₁ = 65, σ₂ = 15, σ₃ = −30, τ_max = 47.5 MPa. Ordering three
  roots is E4. ⏳ P4 three Mohr circles.
- **~invariants:** I₁ = σₓ + σ_y + σ_z; I₂ = σₓσ_y + σ_yσ_z + σ_zσₓ − τₓ_y² − τ_yz² − τ_zx²; I₃ = det σ.
  Example: [[50, 20, 0], [20, −10, 10], [0, 10, 30]] → I₁ = 70, I₂ = 200, I₃ = −32,000 (MPa³).
  Picture: `matrixGrid` `determinant` (existing). Principal stresses from the cubic wait on E4.
- **~octahedral:** σ_oct = I₁ ÷ 3; τ_oct = (1/3)√((σ₁ − σ₂)² + (σ₂ − σ₃)² + (σ₃ − σ₁)²). Example: main's
  principals → 16.67 and 38.80 MPa.
- **~rosette:** 45° rosette: εₓ = ε_a, ε_y = ε_c, γₓ_y = 2ε_b − ε_a − ε_c; principal strains.
  Example: 600, 300, −200 μ → γ = 200 μ, ε₁ = 612.3 μ, ε₂ = −212.3 μ. Microstrain unit (E1).
- **Verdict:** 4 pages; the four types Solve once E4 lands for the cubic (main ships now).

#### #1 — Generalized Hooke's law

- **Asks:** three strains and the volume change from three stresses (main); G, K and λ from E
  and ν (~constants); plane strain's σ_z (~plane-strain).
- **Main — calculator:** Values E, ν, σₓ, σ_y, σ_z, εₓ, ε_y, ε_z, volumetric e (9). Relations:
  εₓ = (σₓ − ν(σ_y + σ_z)) ÷ E (and the other two); e = εₓ + ε_y + ε_z. Example: steel, 100, 50, 0 MPa →
  4.25 × 10⁻⁴, 1.0 × 10⁻⁴, −2.25 × 10⁻⁴, e = 3.0 × 10⁻⁴.
- **~constants:** G = E ÷ (2(1 + ν)); K = E ÷ (3(1 − 2ν)); λ = Eν ÷ ((1 + ν)(1 − 2ν)). Example: 200 GPa,
  0.3 → 76.9, 166.7, 115.4 GPa. A limit line: ν < 0.5.
- **~plane-strain:** σ_z = ν(σₓ + σ_y). Example: 100, 50 → 45 MPa.
- **Verdict:** 3 pages; the three types Solve (anisotropic stiffness is Partly).

#### #2 — Energy methods

- **Asks:** strain energy and Castigliano deflection (main); truss joint deflection by unit load
  (~truss); impact of a dropped weight (~impact).
- **Main — calculator:** cantilever, tip load. Values P, L, E, I, U, δ. Relations: U = P²L³ ÷ (6EI);
  δ = ∂U ÷ ∂P = PL³ ÷ (3EI). Example: as MoM#4 → U = 20.83 J, δ = 8.333 mm (check U = ½Pδ).
  ⏳ P1; interim `functionGraph` linear P–δ with the triangle (area U).
- **~truss:** δ = ΣFfL ÷ (AE) for statics#1's truss. Values P, A, E, F_incl, F_bot, δ (geometry
  fixed: 8 m by 3 m). Example: 10 kN, 1000 mm², 200 GPa → 0.525 mm. ⏳ P2.
- **~impact:** δ_max = δ_st(1 + √(1 + 2h ÷ δ_st)); σ = kδ_max ÷ A, k = AE ÷ L. Example: 100 N from
  50 mm onto a 1 m bar, 100 mm², steel → δ_st = 0.005 mm, δ_max = 0.712 mm, σ = 142.4 MPa.
- **Verdict:** 3 pages; the three types Solve (statically indeterminate by Castigliano is Partly).

#### #3 — Plasticity and failure criteria

- **Asks:** yield and plastic moments, shape factor (main); von Mises and Tresca from three
  principal stresses (~yield).
- **Main — calculator:** rectangle. Values b, h, σ_Y, S = bh² ÷ 6, Z = bh² ÷ 4, M_Y, M_p, shape factor
  f (8). Example: 50 × 100 mm, 250 MPa → M_Y = 20.83 kN·m, M_p = 31.25 kN·m, f = 1.5. ⏳ P3 plastic
  block and P5 elastic–perfectly plastic.
- **~yield:** σ_vm = √(½((σ₁ − σ₂)² + (σ₂ − σ₃)² + (σ₃ − σ₁)²)); σ_Tresca = σ₁ − σ₃; yields when either
  reaches σ_Y. Example: 65, 15, −30 MPa → 82.3 and 95 MPa. ⏳ P4 envelopes.
- **Verdict:** 2 pages; both types Solve (hardening laws and residual stress are Partly).

#### #4 — Plates and shells

- **Asks:** deflection and stress of a circular plate (main); thick cylinder, Lamé (~thick).
- **Main — calculator:** Values E, ν, t, D, p, a, edge factor (`allowed`: clamped 1, simply
  supported (5 + ν) ÷ (1 + ν)), w_max, σ_max (clamped) (9). Relations: D = Et³ ÷ (12(1 − ν²));
  w = factor × pa⁴ ÷ (64D); σ = 3pa² ÷ (4t²). Example: steel, t = 10 mm, a = 200 mm, 100 kPa →
  D = 1.83 × 10⁷ N·mm, w = 0.137 mm (simply supported 0.557 mm), σ = 30 MPa. ⏳ P1 `plate`.
- **~thick:** σ_θ(r) = p_ir_i² ÷ (r_o² − r_i²) × (1 + r_o² ÷ r²); σ_r(r_i) = −p_i. Example: 50/100 mm,
  50 MPa → σ_θ = 83.3 MPa at the bore (thin-wall estimate 75). ⏳ P3 `vessel` thick option.
- **Verdict:** 2 pages; plates under uniform pressure and thick cylinders Solve; rectangular
  plates and shell bending are Partly (coefficients typed from a table).

### 9. he.engineering.finite-element-analysis — Finite Element Analysis

- **Prereqs:** numerical-methods, mechanics-of-materials. **Textbooks:** MIT OCW 2.092/2.093
  (Bathe); Introduction to Finite Element Methods (Felippa, Colorado, free to read).
- Systems up to 4 × 4 go through `matrixGrid` `rowReduce` with variable entries (existing).

#### #0 — Direct stiffness method

- **Asks:** assemble two springs in series and solve (main); bar element stiffness and stress
  (~bar); load between two fixed ends (~fixed-fixed).
- **Main — calculator:** node 1 fixed, force F at node 3. Values k₁, k₂, F, u₂, u₃, element forces
  f₁, f₂, reaction R₁ (8). Relations: reduced K = [[k₁ + k₂, −k₂], [−k₂, k₂]]; K u = (0, F); f = k(Δu);
  R₁ = −k₁u₂. Example: 1000 and 500 N/mm, 2000 N → u₂ = 2 mm, u₃ = 6 mm, f = 2000 N each,
  R₁ = −2000 N. Picture: `matrixGrid` `rowReduce` (existing); ⏳ P25 `elementChain` beside it.
- **~bar:** k = AE ÷ L; f = k(u₂ − u₁); σ = f ÷ A. Example: 100 mm², 200 GPa, 1 m → 20,000 N/mm;
  Δu = 0.1 mm → 2000 N, 20 MPa.
- **~fixed-fixed:** u₂ = F ÷ (k₁ + k₂); R₁ = −k₁u₂; R₃ = −k₂u₂. Example: 3000 N, 1000 and 2000 N/mm →
  1 mm, −1000 N, −2000 N (compare MoM#1~indeterminate).
- **Verdict:** 3 pages; the three types Solve.

#### #1 — Shape functions

- **Asks:** displacement inside a linear element (main); quadratic element (~quadratic);
  mapping x(ξ) and the Jacobian (~mapping).
- **Main — calculator:** Values x₁, x₂, u₁, u₂, x, N₁, N₂, u, ε (9). Relations: N₁ = (x₂ − x) ÷ L;
  N₂ = (x − x₁) ÷ L; u = N₁u₁ + N₂u₂; ε = (u₂ − u₁) ÷ L. Example: 0–100 mm, 0.02 and 0.05 mm, x = 30 →
  N₁ = 0.7, N₂ = 0.3, u = 0.029 mm, ε = 3 × 10⁻⁴. Picture: `functionGraph` linear (existing).
- **~quadratic:** N₁ = ξ(ξ − 1) ÷ 2, N₂ = 1 − ξ², N₃ = ξ(ξ + 1) ÷ 2. Example: u = 0, 0.03, 0.05 at ξ = 0.5 →
  N = −0.125, 0.75, 0.375; u = 0.04125 mm. Picture `functionGraph` quadratic.
- **~mapping:** x = N₁x₁ + N₂x₂ (ξ form); J = L ÷ 2. Example: 20 to 60 mm, ξ = 0.5 → x = 50, J = 20.
- **Verdict:** 3 pages; 1-D shape functions Solve; 2-D (CST, Q4) are Partly (a picture and six
  coordinates exceed one page; see "Not in the taxonomy").

#### #2 — Truss, beam and 2D elements

- **Asks:** axial force of a 2-D truss member from nodal displacements (main); element stiffness
  terms (~k-matrix); a one-element cantilever (~beam).
- **Main — calculator:** Values A, E, L, θ, Δu, Δv, elongation δ, f, σ (9). Relations:
  δ = Δu cos θ + Δv sin θ; f = (AE ÷ L)δ; σ = f ÷ A. Example: 500 mm², 200 GPa, 2 m, 30°, Δu = 0.5,
  Δv = 0.2 mm → δ = 0.533 mm, f = 26.65 kN, σ = 53.3 MPa. ⏳ P2 with element labels; interim
  `vectorDiagram` (Δ and its part along the member, `angle.dot`).
- **~k-matrix:** (AE ÷ L)c², cs, s². Example: 50,000 N/mm, 30° → 37,500, 21,651, 12,500 N/mm.
  Picture `matrixGrid` (4 × 4 with ± signs).
- **~beam:** reduced [[12, 6L], [6L, 4L²]]EI ÷ L³ with P at the tip → v = PL³ ÷ (3EI), θ = PL² ÷ (2EI).
  Example: the MoM#4 beam → 8.333 mm, 0.00625 rad (one element is exact for a tip load).
  Picture `matrixGrid` `rowReduce`.
- **Verdict:** 3 pages; truss and beam types Solve; 2-D elements are Partly.

#### #3 — Meshing and convergence

- **Asks:** observed order and extrapolated answer from three meshes (main); node and DOF count
  (~count); element quality (~quality).
- **Main — calculator:** Values f₁ (fine), f₂, f₃ (coarse), ratio r, order p, extrapolated f_ext,
  error of f₁ (7). Relations: p = ln((f₃ − f₂) ÷ (f₂ − f₁)) ÷ ln r; f_ext = f₁ + (f₁ − f₂) ÷ (rᵖ − 1).
  Example: 8.30, 8.20, 7.80 mm, r = 2 → p = 2, f_ext = 8.333 mm, error 0.40 %. Picture: `table`
  with `graph` (existing).
- **~count:** nodes = (nₓ + 1)(n_y + 1); DOF = 2 × nodes (2-D). Example: 10 × 5 → 66 nodes, 132 DOF;
  20 × 10 → 231, 462. ⏳ P25 `mesh`.
- **~quality — sort:** bins "Fine to use", "Fix the mesh". Cards: aspect ratio 1.2; aspect ratio
  15; a quad angle of 88°; a quad angle of 165°; a negative Jacobian; a triangle near
  equilateral.
- **Verdict:** 3 pages; the three types Solve.

#### #4 — Interpreting FEA results

- **Asks:** check a peak stress against a hand calculation and the yield strength (main); real
  stress or singularity (~singularity).
- **Main — calculator:** Values σ_nom, K_t, σ_hand, σ_FEA, difference, S_Y, n (7). Relations:
  σ_hand = K_tσ_nom; difference = (σ_FEA − σ_hand) ÷ σ_hand; n = S_Y ÷ σ_FEA. Example: 50 MPa, 2.5 → 125;
  FEA 131 → 4.8 %; 250 MPa → n = 1.91.
- **~singularity — sort:** bins "Trust the peak", "Singularity: don't trust it". Cards: under a
  point load; at a sharp inside corner with no radius; at a fixed support's corner; at a
  filleted hole that converges as the mesh refines; mid-span far from loads and supports.
- **Verdict:** 2 pages; both types Solve.

## Mechanical

### 10. he.engineering.thermodynamics — Engineering Thermodynamics

- **Prereqs:** he.physics.university-1, he.math.calc-2. **Textbooks:** Introduction to Engineering
  Thermodynamics (Yan, BCcampus); MIT Thermodynamics and Propulsion notes (16.Unified); IAPWS-IF97
  (the public equations, for E5). **FE:** Thermodynamics (properties, first and second laws,
  cycles).
- Table values are typed (see Decisions); air pages use the cold-air standard.

#### #0 — Properties of pure substances

- **Asks:** quality and enthalpy of a wet mixture (main); mass of an ideal gas in a tank
  (~ideal-gas); region of a state (~regions); linear interpolation in a table (~interpolate).
- **Main — calculator:** Values P (kPa, shown only), v_f, v_g, v (m³/kg), x, h_f, h_fg, h (kJ/kg)
  (8). Relations: x = (v − v_f) ÷ (v_g − v_f); h = h_f + xh_fg. Assumptions: the state is under the
  dome (0 ≤ x ≤ 1, a limit line); read v_f, v_g, h_f, h_fg at the same P. Example: water at 200 kPa,
  v_f = 0.001061, v_g = 0.8857, v = 0.4 → x = 0.451; h_f = 504.7, h_fg = 2201.6 → h = 1497.5 kJ/kg.
  ⏳ P10 (T–v dome, the state on the tie line).
- **~ideal-gas:** m = PV ÷ (RT). Example: air, 0.5 m³, 500 kPa, 300 K → 2.904 kg. Picture:
  `gasPiston` `ideal` with `R: 8.314`, moles in kmol (0.1002) (existing).
- **~regions — sort:** bins "Compressed liquid", "Saturated mixture", "Superheated vapor".
  Cards (each with its T_sat): 100 kPa at 50 °C (T_sat 99.6 °C); 100 kPa at 150 °C; 500 kPa at
  200 °C (T_sat 151.8 °C); 2 MPa at 150 °C (T_sat 212.4 °C); 200 kPa with v = 0.5 m³/kg (v_g 0.8857);
  200 kPa with v = 1.2 m³/kg. Sentence: "Compare T with T_sat at that pressure, or v with v_f and v_g."
- **~interpolate:** the numerical-methods#2~linear relation with h and T names. Example: 2855 at
  200 °C, 2961 at 250 °C → 2908 kJ/kg at 225 °C.
- **Verdict:** 4 pages; the four types Solve (superheated look-ups wait on E5 to be automatic).

#### #1 — First law

- **Asks:** heat for a constant-pressure heating of air (main); polytropic boundary work
  (~polytropic); turbine power (~steady-flow); nozzle exit speed (~nozzle); mixing chamber
  (~mixing).
- **Main — calculator:** Values m, P, T₁, T₂, V₁, V₂, W, ΔU, Q (9; R and c_v for air in the
  assumption). Relations: V = mRT ÷ P (each state); W = P(V₂ − V₁); ΔU = mc_v(T₂ − T₁); Q = ΔU + W.
  Example: 0.5 kg, 200 kPa, 300 → 500 K → V₁ = 0.2153, V₂ = 0.3588 m³, W = 28.7 kJ, ΔU = 71.8 kJ,
  Q = 100.5 kJ (= mc_pΔT). Picture: `gasPiston` with `energy: { heat, work, change }` (existing).
- **~polytropic:** P₂ = P₁(V₁ ÷ V₂)ⁿ; W = (P₂V₂ − P₁V₁) ÷ (1 − n); n = 1 uses P₁V₁ ln(V₂ ÷ V₁).
  Example: 100 kPa, 0.8 → 0.2 m³, n = 1.3 → P₂ = 606.3 kPa, W = −137.5 kJ (done on the gas).
  Picture: `functionGraph` `family: 'power'` (p ÷ q = 13 ÷ 10) with `shade` from V₂ to V₁ (existing).
- **~steady-flow:** Ẇ = ṁ(h₁ − h₂) + Q̇ (KE and PE neglected, said). Example: 2 kg/s, 3230 → 2600
  kJ/kg, Q̇ = −20 kW → 1240 kW. ⏳ P11 (turbine).
- **~nozzle:** V₂ = √(V₁² + 2(h₁ − h₂)), h in J/kg (the 1000 shown). Example: 30 m/s, 50 kJ/kg drop
  → 317.6 m/s. ⏳ P11.
- **~mixing:** h₃ = (ṁ₁h₁ + ṁ₂h₂) ÷ (ṁ₁ + ṁ₂). Example: 2 kg/s at 335, 3 kg/s at 84 → 184.4 kJ/kg.
  ⏳ P11.
- **Verdict:** 5 pages; the five types Solve.

#### #2 — Second law and entropy

- **Asks:** Carnot limit and entropy generated by an engine (main); Δs of an ideal gas
  (~entropy); compressor with an isentropic efficiency (~isentropic); a hot block in a lake
  (~block); possible or impossible devices (~possible).
- **Main — calculator:** Values T_H, T_L (K), Q_H, W, Q_L, η, η_Carnot, S_gen (8). Relations:
  Q_H = W + Q_L; η = W ÷ Q_H; η_C = 1 − T_L ÷ T_H; S_gen = Q_L ÷ T_L − Q_H ÷ T_H. Example: 800 K, 300 K,
  1000 kJ, 400 kJ → η = 0.40, η_C = 0.625, Q_L = 600 kJ, S_gen = 0.75 kJ/K. Picture: `heatEngine`
  with `carnot` (existing).
- **~entropy:** Δs = c_p ln(T₂ ÷ T₁) − R ln(P₂ ÷ P₁). Example: air 300 K, 100 kPa → 500 K, 300 kPa →
  0.1981 kJ/(kg·K). ⏳ P10 T–s.
- **~isentropic:** T₂s = T₁(P₂ ÷ P₁)^((k−1)/k); T₂ = T₁ + (T₂s − T₁) ÷ η_c; w = c_p(T₂ − T₁). Example:
  300 K, ratio 8, η_c = 0.85 → 543.4 K, 586.4 K, 287.8 kJ/kg. ⏳ P10.
- **~block:** ΔS_block = mc ln(T₂ ÷ T₁); ΔS_lake = Q ÷ T_lake; S_gen = their sum. Example: 2 kg iron
  (0.45 kJ/(kg·K)), 623 K into a 298 K lake → −0.664 + 0.982 = 0.318 kJ/K.
- **~possible — sort:** bins "Possible", "Impossible". Cards: an engine turning all heat from one
  reservoir into work; a refrigerator with no work in; 30 % between 600 K and 300 K; 60 % between
  600 K and 300 K; a heat pump with COP 4 between 293 K and 273 K; heat flowing by itself from
  cold to hot. Sentence: "No engine beats the Carnot efficiency of its two reservoirs."
- **Verdict:** 5 pages; the five types Solve.

#### #3 — Power and refrigeration cycles

- **Asks:** ideal Brayton (main); Otto (~otto); Diesel (~diesel); Rankine from typed enthalpies
  (~rankine); vapor-compression refrigerator (~refrigeration).
- **Main — calculator:** Values pressure ratio r_p, T₁, T₃, T₂, T₄, w_c, w_t, w_net, η (9). Relations:
  T₂ = T₁r_p^((k−1)/k); T₄ = T₃ ÷ r_p^((k−1)/k); w = c_pΔT; η = 1 − 1 ÷ r_p^((k−1)/k). Example: r_p = 10,
  300 K, 1400 K → T₂ = 579.2 K, T₄ = 725.1 K, w_c = 280.6, w_t = 678.2, w_net = 397.6 kJ/kg, η = 0.482.
  Picture: `heatEngine` (existing); ⏳ P10 T–s cycle.
- **~otto:** η = 1 − 1 ÷ r^(k−1). Example: r = 9 → 0.585 (T₂ = 722.5 K from 300 K).
- **~diesel:** η = 1 − (1 ÷ r^(k−1))(r_c^k − 1) ÷ (k(r_c − 1)). Example: r = 18, r_c = 2 → 0.632.
- **~rankine:** Values v₁, P₁, P₂, h₁, h₃, h₄, w_p, q_in, w_net, η (10). Relations: w_p = v₁(P₂ − P₁);
  q_in = h₃ − h₁ − w_p; w_net = (h₃ − h₄) − w_p. Example: 0.00101 m³/kg, 10 kPa → 8 MPa, h₁ = 192, h₃ = 3400,
  h₄ = 2100 → w_p = 8.07, q_in = 3199.9, w_net = 1291.9 kJ/kg, η = 0.404. ⏳ P10.
- **~refrigeration:** q_L = h₁ − h₄, w = h₂ − h₁, h₄ = h₃, COP = q_L ÷ w; Q̇_L = ṁq_L. Example: 244.5,
  275.4, 95.5 kJ/kg → 149.0, 30.9, COP 4.82; 0.05 kg/s → 7.45 kW. Picture: `heatEngine`
  `refrigerator` (existing).
- **Verdict:** 5 pages; the five types Solve (reheat, regeneration and air-standard dual cycles
  are Partly).

### 11. he.engineering.fluid-mechanics — Fluid Mechanics

- **Prereqs:** he.physics.university-1, he.math.diff-eq. **Textbooks:** Fluid Mechanics (Bar-Meir,
  Potto project, LibreTexts); MIT OCW 2.06; OpenStax University Physics Vol. 1 ch. on fluids
  (bridge, reference only). **FE:** Fluid mechanics (statics, Bernoulli, momentum, pipe flow,
  similitude).

#### #0 — Fluid statics

- **Asks:** pressure at a depth, gauge and absolute (main); differential manometer
  (~manometer); force on a submerged gate (~gate); buoyancy (~buoyancy).
- **Main — calculator:** Values P_atm, ρ, h, P_gauge, P_abs (5). Relations: P_gauge = ρgh;
  P_abs = P_atm + P_gauge. Example: water, 15 m → 147.2 kPa gauge, 248.5 kPa absolute. ⏳ P12 `tank`.
- **~manometer:** ΔP = (ρ_m − ρ)gh. Example: mercury under water, 0.12 m → 14.83 kPa. ⏳ P12.
- **~gate:** F = ρgh_cA; y_cp = h_c + I ÷ (h_cA) = h_c + H² ÷ (12h_c) (vertical rectangle). Example:
  2 m wide, 3 m tall, top 1 m down → F = 147.2 kN at 2.8 m depth. ⏳ P12 `gate`.
- **~buoyancy:** F_B = ρgV_sub; floating: V_sub ÷ V = ρ_body ÷ ρ_fluid. Example: 0.06 m³ of wood at
  600 kg/m³ → 60 % under, F_B = 353.2 N. ⏳ P12.
- **Verdict:** 4 pages; the four types Solve once P12 lands.

#### #1 — Bernoulli equation

- **Asks:** venturi flow rate (main); pitot-tube speed (~pitot); draining tank (~drain).
- **Main — calculator:** Values D₁, D₂, ρ, ΔP, V₁, V₂, Q (7). Relations: A₁V₁ = A₂V₂;
  ΔP = ½ρ(V₂² − V₁²). Assumptions: steady, incompressible, no losses, along a streamline, level.
  Example: water, 100 → 50 mm, 30 kPa → V₂ = 8 m/s, V₁ = 2 m/s, Q = 0.0157 m³/s. ⏳ P12 `venturi`.
- **~pitot:** V = √(2ΔP ÷ ρ). Example: air 1.2 kg/m³, 600 Pa → 31.6 m/s. ⏳ P12.
- **~drain:** V = √(2gh); Q = C_dAV. Example: 5 m, 50 mm hole, C_d = 1 → 9.90 m/s, 0.0194 m³/s
  (C_d = 0.61 for a sharp hole, typed).
- **Verdict:** 3 pages; the three types Solve (siphons by the same relations are Partly).

#### #2 — Control-volume analysis

- **Asks:** force of a jet on a vane (main); tank level rate (~continuity); pump power with
  losses (~pump).
- **Main — calculator:** Values ρ, V, A, ṁ, turning angle θ, Fₓ, F_y (7). Relations: ṁ = ρVA;
  Fₓ = ṁV(1 − cos θ); F_y = ṁV sin θ. Assumptions: a fixed vane; speed unchanged on it; atmospheric
  pressure all round. Example: 20 m/s, 0.002 m² → ṁ = 40 kg/s; flat plate (90°) 800 N; θ = 120° →
  Fₓ = 1200 N, F_y = 692.8 N. ⏳ P12 `jet`.
- **~continuity:** dh/dt = (Q_in − Q_out) ÷ A. Example: 0.020 in, 0.012 out, 2 m² → 4 mm/s.
- **~pump:** h_p = Δz + h_L (+ ΔP ÷ ρg); P = ρgQh_p ÷ η. Example: 0.01 m³/s, 20 m, 4 m loss, η = 0.75 →
  3.14 kW. ⏳ P12 `pipe` with a pump.
- **Verdict:** 3 pages; the three types Solve (moving vanes and the angular momentum of a
  sprinkler are Partly).

#### #3 — Dimensional analysis

- **Asks:** model speed by Reynolds matching (main); by Froude matching (~froude); which number
  to match (~which-number); prototype force from a model (~force).
- **Main — calculator:** Values V_p, L_p, L_m, ν_p, ν_m, V_m, Re (7). Relation: V_mL_m ÷ ν_m = V_pL_p ÷ ν_p.
  Example: 30 m/s car, 1:4 model in the same air → 120 m/s (why water tunnels are used). ⏳ P12
  `model`; interim `none`.
- **~froude:** V_m = V_p√(L_m ÷ L_p). Example: 10 m/s ship, 1:25 → 2 m/s.
- **~which-number — sort:** bins "Reynolds", "Froude", "Mach", "Weber". Cards: waves made by a
  ship's hull; a spillway; flow in a pipe; a submarine deep under water; a jet airliner at
  cruise; small droplets from a spray nozzle; blood in an artery.
- **~force:** F_p = F_m(ρ_p ÷ ρ_m)(V_p ÷ V_m)²(L_p ÷ L_m)². Example: same air, 30 vs 120 m/s, 4× size →
  F_p = F_m (200 N each).
- **Verdict:** 4 pages; the four types Solve; deriving Π groups by repeating variables is Partly
  (explained, not computed: a count k = n − r is on the main's assumption).

#### #4 — Pipe flow

- **Asks:** head loss and pressure drop in a turbulent pipe (main); laminar pressure drop
  (~laminar); minor losses (~minor).
- **Main — calculator:** Values V, D, L, ν, roughness ε, Re, f, h_L, ΔP (9). Relations:
  Re = VD ÷ ν; 1 ÷ √f = −2 log(ε ÷ (3.7D) + 2.51 ÷ (Re√f)) (Colebrook, found numerically; f = 64 ÷ Re when
  Re < 2300); h_L = f(L ÷ D)V² ÷ (2g); ΔP = ρgh_L. Example: water, 2 m/s, 0.1 m, 100 m, ε = 0.045 mm →
  Re = 200,000, f = 0.0186, h_L = 3.78 m, ΔP = 37.1 kPa (Haaland gives 0.0184). ⏳ P13 Moody point and
  P12 `pipe`.
- **~laminar:** ΔP = 128μLQ ÷ (πD⁴). Example: oil μ = 0.1 Pa·s, 10 m, 20 mm, 10⁻⁴ m³/s → 25.5 kPa (Re 57).
- **~minor:** h_m = ΣK V² ÷ (2g). Example: ΣK = 3.5 at 2 m/s → 0.714 m.
- **Verdict:** 3 pages; the three types Solve (finding D or Q for a given loss works through the
  numeric solver; networks are Partly).

#### #5 — Boundary layers

- **Asks:** laminar thickness and plate drag (main); turbulent plate (~turbulent); bluff-body
  drag and power (~drag).
- **Main — calculator:** Values V, L, ν, ρ, width b, Re_L, δ(L), C_f, F_D (9). Relations: Re = VL ÷ ν;
  δ = 5L ÷ √Re; C_f = 1.328 ÷ √Re; F_D = ½ρV²C_f bL. Example: air, 5 m/s, 1 m, 0.5 m wide → Re = 333,333,
  δ = 8.66 mm, C_f = 0.00230, F_D = 0.0173 N (one side). A limit line: Re < 5 × 10⁵ for laminar.
  ⏳ P12 `plate`; interim `functionGraph` `family: 'root'` (δ ∝ √x).
- **~turbulent:** δ = 0.37x ÷ Re_x^0.2; C_f = 0.074 ÷ Re_L^0.2. Example: water 3 m/s, 2 m → Re = 6 × 10⁶,
  δ = 32.6 mm, C_f = 0.00326.
- **~drag:** F_D = ½ρV²C_DA; P = F_DV. Example: C_D = 0.3, 2.2 m², 30 m/s → 356 N, 10.7 kW.
- **Verdict:** 3 pages; the three types Solve.

