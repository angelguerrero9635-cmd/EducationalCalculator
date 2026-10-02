# Direction plan: higher education, aero-civil-chemical (21 courses, 85 topics)

Written from the brief, `src/data/taxonomy.ts` (`COURSES`, read only), `docs/MODULE_GUIDE.md`
("Standards"), `docs/LAYOUTS.md`, `docs/EQUATION_INPUTS.md`, `docs/PICTURES.md` and the model plan
`docs/plans/s.11.md`. Every example below is original and was worked by hand and rechecked by
script; nothing is copied from a textbook, a code book or a question source. `research/` holds no
college material yet, so the textbook and question columns name the common types; the research
chat fills them (part 4).

Courses: Aerospace — `he.engineering.aerodynamics`, `compressible-flow`, `flight-mechanics`,
`aerospace-structures`, `propulsion`, `orbital-mechanics`. Civil — `structural-analysis`,
`soil-mechanics`, `hydraulics-hydrology`, `transportation`, `steel-design`, `concrete-design`,
`environmental`, `surveying`. Chemical — `material-energy-balances`, `chemical-thermodynamics`,
`transport-phenomena`, `separations`, `reaction-engineering`, `process-control`, `process-design`.
Every id below starts `he.engineering.`; it is left off inside the blocks (`aerodynamics#0~naca`).

## Decisions

- **Page ids.** Topic page `<courseId>#<i>` (0-based, the taxonomy's order); problem types
  `<courseId>#<i>~<slug>`. A topic's main page is a calculator unless marked (sort, sequence,
  explore). No pilot exists in this group (`college.ts` has none); the model is
  `he.engineering.circuits-1#0` (values with name, symbol and unit; one relation per line; a
  picture whose labels are the values). With ~290 pages here, split `college.ts` into
  `src/data/modules/college/<field>.ts` (aerospace, civil, chemical) before building; the lead decides.
- **Word rules.** The Grades 9–12 rules hold for college: sentences ≤ 35 words, ≤ 10 values a
  page, every value named first with its symbol ("Overflow rate (v₀)"), 2–4 assumptions of ≤ 20
  words. College vocabulary is the textbook's (lift coefficient, effective stress, extent of
  reaction); no simplification of the term, one plain gloss at first use in the assumption.
- **Notation.** Textbook symbols with Unicode subscripts (C_L as C_L where no subscript glyph
  exists; σ′ for effective stress; ṁ, ṅ, Q̇ dotted, need N14). `ln` is natural log, `log` is
  base 10, always written out. Angles in degrees in inputs; a step converts to radians in its
  own line where a formula needs it (thin-airfoil theory, Ackeret, Prandtl–Meyer). Answers to 4
  significant figures; examples quoted to 3–4.
- **Constants (fixed, named in an assumption where used).** g = 9.81 m/s² (32.2 ft/s²), also
  for specific impulse; air γ = 1.4, R = 287 J/(kg·K), c_p = 1005 J/(kg·K), μ = 1.789 × 10⁻⁵
  Pa·s at sea level; sea-level ISA 288.15 K, 101.325 kPa, 1.225 kg/m³, lapse 0.0065 K/m to
  11 km; R_u = 8.314 J/(mol·K); Earth μ = 398,600 km³/s², radius 6378 km, sidereal day 86,164 s;
  Sun μ = 1.327 × 10¹¹ km³/s², 1 AU = 1.496 × 10⁸ km; water ρ = 1000 kg/m³, γ_w = 9.81 kN/m³
  (62.4 lb/ft³), μ = 1.0 × 10⁻³ Pa·s, ν = 1.0 × 10⁻⁶ m²/s (20 °C); steel E = 29,000 ksi
  (200 GPa); c = 299,792.458 km/s.
- **Code editions.** Design pages name their edition in one assumption: AISC 360-22 (LRFD),
  ACI 318-19, ASCE 7-22 load combinations, AASHTO Green Book 2018 (stopping sight distance),
  AASHTO 1993 pavement guide, HCM 7th edition. Code tables (W-shape properties, bar areas) are
  data rows the page offers (`allowed`, need N4), never copied tables: each row is the
  published dimension of a standard shape, a fact, entered by hand for the shapes used.
- **Units.** SI by default with the unit menu; US customary first on steel, concrete, pavement
  and capacity pages, where US courses and the FE exam work in kips, ksi, in and mi/h. New units
  the registry lacks: need N1.
- **Calculus and linear algebra in steps.** No symbolic engine: every derivative, integral or
  ODE result is the closed form the textbook derives, and the step names it in one line
  ("For a first-order reaction in a PFR, ∫ dX ÷ (k(1 − X)) from 0 to X gives τ = −ln(1 − X) ÷ k"),
  then substitutes. ODE responses (first- and second-order step responses, BOD, plume decay) are
  their closed-form solutions. Matrices stop at 2 × 2 solved by Cramer's rule (`matrixGrid`
  determinant mode). Implicit relations (Kepler's equation, the area–Mach relation, Prandtl–Meyer,
  θ–β–M, Manning normal depth) use the solver's root finder; the step shows the trial values
  (need N2) and a branch choice where there are two roots (need N3).
- **Layouts (34 pages).** Sorts 23, sequences 9, explores 2, listed in each block. Main pages
  that are layouts: `process-design#0` (sequence). Everything else is a calculator.
- **Equation inputs.** Two pages take an `equation`: `surveying#3` (`{H:unit} = {h:unit} − {N:unit}`)
  and `transportation#0~headway` (`{h:unit} = 3600 ÷ {q:unit}`); every other page keeps rows
  (units change, several steps).
- **Shared kinds with the mechanics/fluids group.** Prerequisite courses (Statics, Mechanics of
  Materials, Fluid Mechanics, Thermodynamics, Heat Transfer, Control Systems) belong to another
  group. If that group's plan requests a beam, column, Mohr circle, pipe, property diagram, block
  diagram or exchanger kind, merge its request with P14, P7, P18, P20, P10, P34, P35 here: one
  kind, the options of both.
- **Page count:** 85 topic pages + 205 problem types = **290 pages** (256 calculators, 34
  layouts); 61 wait on an engine or picture need (marked ⏳). Picture ids below are
  `HE-aero-civil-chemical-Pn`, written **Pn** in the blocks; needs are **Nn** (part 4).

## Aerospace

Textbooks for the field (part 4 lists licences): Leishman, _Introduction to Aerospace Flight
Vehicles_ (ERAU, CC BY-NC-ND); MIT OCW 16.01–16.04 Unified Engineering, 16.100, 16.120,
16.333, 16.20, 16.50, 16.512, 16.346 (CC BY-NC-SA); NASA Glenn _Beginner's Guide to
Aeronautics_ and NACA Report 1135 (public domain); Bar-Meir, _Fundamentals of Compressible Fluid
Mechanics_ (GNU FDL); JPL _Basics of Space Flight_ (public). Reference only.

### 1. aerodynamics — Aerodynamics (prereq Fluid Mechanics)

#### aerodynamics#0 — Airfoil theory

| Question type                                   | Page                   | Mark   |
| ----------------------------------------------- | ---------------------- | ------ |
| lift coefficient of a thin airfoil at α         | main                   | Solves |
| zero-lift angle from c_l at one α               | main                   | Solves |
| pressure coefficient from local speed           | ~pressure-coefficient  | Solves |
| lift per span from circulation (Kutta–Joukowski) | ~circulation          | Solves |
| what NACA 2412 means; thickness in meters       | ~naca                  | Solves |

- **Main — BUILD (calculator):** picture **P1** `wing` section mode (chord line, camber line,
  α between chord and relative wind, lift arrow ⟂ wind). Values: angle of attack α (−10 to 20°),
  zero-lift angle α_L0 (−6 to 0°), lift-curve slope a₀ (fixed 2π per rad, shown 0.1097 per
  degree), lift coefficient c_l (−1.5 to 2.5). Relation: c_l = 2π(α − α_L0), angles in radians.
  Assumptions: thin airfoil, small angles, no stall (thin-airfoil theory ignores separation past
  about 12–15°); a symmetric airfoil has α_L0 = 0; camber makes α_L0 negative. Example: α = 4°,
  α_L0 = −2° → 6° = 0.1047 rad → c_l = 0.658. startWith α, α_L0.
  Use line: "Use this for 'A cambered airfoil with zero-lift angle −2° flies at 4°. Find c_l.'"
- **~pressure-coefficient — BUILD:** P1 section with surface arrows (P1 `pressure`). Values ρ∞,
  V∞, local speed V, dynamic pressure q∞, C_p, p − p∞. Relations: q∞ = ½ρ∞V∞²; C_p = 1 − (V ÷ V∞)²;
  p − p∞ = C_p q∞. Example: 1.225 kg/m³, 50 m/s, 60 m/s on the upper surface → q∞ = 1531 Pa,
  C_p = −0.44, p − p∞ = −674 Pa (suction).
- **~circulation — BUILD:** P1 section with a circulation loop (P1 `circulation`). Values ρ∞,
  V∞, circulation Γ (m²/s), lift per span L′ (N/m), chord c, c_l. Relations: L′ = ρ∞V∞Γ;
  c_l = L′ ÷ (q∞c). Example: 1.225 kg/m³, 40 m/s, Γ = 20 m²/s → L′ = 980 N/m; c = 1.5 m → c_l = 0.667.
- **~naca — BUILD:** P1 section drawn from the digits. Values: first digit (0–9), second (0–9),
  last two (01–40, whole), chord c, max camber, its position, thickness. Relations: camber = d₁%
  of c at d₂ × 10% of c; thickness = d₃d₄% of c. Example: NACA 2412, c = 1.5 m → camber 0.03 m at
  0.6 m from the leading edge, thickness 0.18 m.
- **Verdict:** 4 pages.

#### aerodynamics#1 — Lift and drag

| Question type                                      | Page        | Mark   |
| -------------------------------------------------- | ----------- | ------ |
| lift and drag from C_L, C_D, speed, area           | main        | Solves |
| drag polar, maximum L/D                            | ~drag-polar | Solves |
| Reynolds number of a wing chord                    | ~reynolds   | Solves |
| which drag is skin friction, form, induced or wave | ~drag-types | Solves |

- **Main — BUILD:** P1 section with `forces` (L ⟂ wind, D along it, resultant). Values: density ρ
  (0.01–1.3 kg/m³), speed V (0–1000 m/s), wing area S (0.1–1000 m²), C_L (−1 to 3), C_D
  (0.003–2), q, L, D, L/D. Relations: q = ½ρV²; L = qSC_L; D = qSC_D; L/D = C_L ÷ C_D.
  Assumptions: coefficients come from a wind tunnel or a polar at this Reynolds and Mach number;
  lift is ⟂ the oncoming flow, not ⟂ the chord. Example: 1.225 kg/m³, 60 m/s, 16 m², C_L = 0.5,
  C_D = 0.03 → q = 2205 Pa, L = 17,640 N, D = 1058 N, L/D = 16.7. startWith ρ, V, S, C_L.
- **~drag-polar — BUILD:** `functionGraph` quadratic (C_D against C_L, C_D0 the vertex; the tangent
  from the origin marks the best L/D). Values C_D0, aspect ratio AR, Oswald e, K, C_L, C_D, (L/D)max.
  Relations: K = 1 ÷ (πeAR); C_D = C_D0 + KC_L²; (L/D)max = 1 ÷ (2√(C_D0K)). Example: C_D0 = 0.025,
  AR = 8, e = 0.8 → K = 0.0497, at C_L = 0.5 C_D = 0.0374, (L/D)max = 14.2.
- **~reynolds — BUILD:** `none`. Values ρ, V, chord c, viscosity μ, Re. Relation: Re = ρVc ÷ μ.
  Example: 1.225 kg/m³, 60 m/s, 1.5 m, 1.789 × 10⁻⁵ Pa·s → Re = 6.16 × 10⁶.
- **~drag-types — BUILD (sort):** bins "Skin friction", "Pressure (form)", "Induced", "Wave".
  Cards: a smooth flat plate edge-on; a golf ball's dimples move separation back; a parachute;
  wingtip vortices behind an airliner; a glider's long wings cut this drag; a fighter passing
  Mach 1; the area rule on a transonic fuselage; boundary-layer shear on a long fuselage.
  Sentence: "Induced drag comes from making lift; wave drag from shocks."
- **Verdict:** 4 pages.

#### aerodynamics#2 — Finite wings

| Question type                                   | Page           | Mark   |
| ----------------------------------------------- | -------------- | ------ |
| induced drag coefficient and induced angle      | main           | Solves |
| finite-wing lift slope from a₀ and AR           | ~lift-slope    | Solves |
| aspect ratio, taper, mean chord from a planform | ~aspect-ratio  | Solves |

- **Main — BUILD:** **P1** `wing` planform mode (span b, area S, trailing tip vortices, downwash
  arrows). Values C_L, AR, span efficiency e (0.5–1), C_Di, induced angle α_i (deg). Relations:
  C_Di = C_L² ÷ (πeAR); α_i = C_L ÷ (πAR) (elliptic). Assumptions: lifting-line theory; e = 1 only
  for an elliptic lift distribution; long wings (large AR) cut induced drag. Example: C_L = 0.6,
  AR = 8, e = 0.9 → C_Di = 0.0159; α_i = 0.0239 rad = 1.37° (elliptic). startWith C_L, AR, e.
- **~lift-slope — BUILD:** P1 planform. Values a₀ (per rad), AR, e, a (per rad and per degree).
  Relation: a = a₀ ÷ (1 + a₀ ÷ (πeAR)). Example: a₀ = 2π, AR = 8, e = 0.9 → a = 4.92 per rad
  = 0.0858 per degree (the 2-D slope was 0.1097).
- **~aspect-ratio — BUILD:** P1 planform, tapered. Values span b, root chord c_r, tip chord c_t,
  taper λ, area S, AR. Relations: λ = c_t ÷ c_r; S = b(c_r + c_t) ÷ 2; AR = b² ÷ S. Example:
  b = 12 m, c_r = 1.8 m, c_t = 0.9 m → λ = 0.5, S = 16.2 m², AR = 8.89.
- **Verdict:** 3 pages.

#### aerodynamics#3 — Intro to compressibility

| Question type                                      | Page             | Mark   |
| -------------------------------------------------- | ---------------- | ------ |
| Mach number at an altitude's temperature           | main             | Solves |
| Prandtl–Glauert correction of C_p                  | ~prandtl-glauert | Solves |
| subsonic, transonic, supersonic or hypersonic      | ~flow-regimes    | Solves |

- **Main — BUILD:** `none` until P3 (then P3 `mach` mode: a moving point with sound fronts, the
  Mach cone at M > 1). Values temperature T (150–400 K), γ (fixed 1.4), R (fixed 287), speed of
  sound a, speed V, Mach M. Relations: a = √(γRT); M = V ÷ a. Assumptions: air is a perfect gas;
  a depends on temperature only, not on pressure. Example: 11 km, T = 216.65 K → a = 295.0 m/s;
  V = 230 m/s → M = 0.780. startWith T, V.
- **~prandtl-glauert — BUILD:** `functionGraph` power family (C_p against M, the 1 ÷ √(1 − M²) rise).
  Values C_p0, M (0–0.8), C_p. Relation: C_p = C_p0 ÷ √(1 − M²). Example: C_p0 = −0.4, M = 0.6 → −0.5.
  Assumption: valid to about M 0.7; it fails near M 1.
- **~flow-regimes — BUILD (sort):** bins "Subsonic (M < 0.8)", "Transonic (0.8–1.2)",
  "Supersonic (1.2–5)", "Hypersonic (> 5)"; the sentence names this page's boundaries. Cards: a
  light plane at 60 m/s near sea level (M 0.18); an airliner cruising at M 0.85; a fighter at
  M 1.6; Concorde at M 2.0; a reentry capsule at M 25; a rocket plane at M 6.7; a helicopter
  blade tip at M 0.9.
- **Verdict:** 3 pages.

### 2. compressible-flow — Compressible Flow

#### compressible-flow#0 — Isentropic flow

| Question type                                         | Page          | Mark              |
| ----------------------------------------------------- | ------------- | ----------------- |
| T₀/T, p₀/p, ρ₀/ρ at a Mach number                     | main          | Solves            |
| A/A* at M; M from A/A* (subsonic or supersonic)       | ~area-mach    | Solves (⏳ N3)    |
| choked mass flow through a throat                     | ~choked       | Solves            |
| stagnation temperature on a probe tip                 | main          | Solves            |

- **Main — BUILD:** **P2** `duct` one station (a stream tube with M, T, p and the stagnation
  state in a box). Values Mach M (0–10), γ (fixed 1.4), T, T₀, p, p₀, ρ₀/ρ. Relations:
  T₀ ÷ T = 1 + ((γ − 1) ÷ 2)M²; p₀ ÷ p = (T₀ ÷ T)^(γ ÷ (γ − 1)); ρ₀ ÷ ρ = (T₀ ÷ T)^(1 ÷ (γ − 1)).
  Assumptions: adiabatic and frictionless, so p₀ and T₀ stay constant along the flow; calorically
  perfect air. Example: M = 2, T = 220 K, p = 20 kPa → T₀/T = 1.8, T₀ = 396 K, p₀/p = 7.824,
  p₀ = 156.5 kPa, ρ₀/ρ = 4.347. startWith M, T, p.
- **~area-mach — BUILD ⏳ N2, N3:** P2 converging–diverging duct to scale. Values M, A/A*,
  branch (subsonic or supersonic). Relation: A ÷ A* = (1 ÷ M)[(2 ÷ (γ + 1))(1 + ((γ − 1) ÷ 2)M²)]^((γ + 1) ÷ (2(γ − 1))).
  Example: M = 2 → A/A* = 1.6875; backward, A/A* = 1.6875 gives M = 2.0 (supersonic) or 0.37 (subsonic).
- **~choked — BUILD:** P2 throat lit. Values p₀, T₀, throat area A*, ṁ. Relation:
  ṁ = 0.6847 p₀A* ÷ √(RT₀) (γ = 1.4). Example: 500 kPa, 500 K, 0.001 m² → 0.904 kg/s.
  Assumption: the throat is at M = 1, so lowering the back pressure further adds no flow.
- **Verdict:** 3 pages.

#### compressible-flow#1 — Normal and oblique shocks

| Question type                                       | Page          | Mark            |
| --------------------------------------------------- | ------------- | --------------- |
| M₂, p₂/p₁, T₂/T₁, p₀₂/p₀₁ across a normal shock      | main          | Solves          |
| oblique shock: θ from β and M₁; M₂                   | ~oblique      | Solves          |
| β from θ and M₁ (weak or strong)                     | ~oblique      | Partly (⏳ N3)  |
| pitot tube in supersonic flow                       | ~pitot        | Solves (⏳ N2)  |

- **Main — BUILD:** **P3** `supersonicFlow` normal mode (shock line, M₁ > 1 in, M₂ < 1 out, ratio
  bars). Values M₁ (1–10), M₂, p₂/p₁, ρ₂/ρ₁, T₂/T₁, p₀₂/p₀₁. Relations: M₂² = (1 + ((γ − 1) ÷ 2)M₁²)
  ÷ (γM₁² − (γ − 1) ÷ 2); p₂ ÷ p₁ = 1 + (2γ ÷ (γ + 1))(M₁² − 1); ρ₂ ÷ ρ₁ = (γ + 1)M₁² ÷ ((γ − 1)M₁² + 2);
  T₂/T₁ = (p₂/p₁) ÷ (ρ₂/ρ₁); p₀₂/p₀₁ from the two. Assumptions: the shock is thin and adiabatic,
  so T₀ is the same both sides; entropy rises, so p₀ falls. Example: M₁ = 2 → M₂ = 0.577,
  p₂/p₁ = 4.5, ρ₂/ρ₁ = 2.667, T₂/T₁ = 1.6875, p₀₂/p₀₁ = 0.721. startWith M₁.
- **~oblique — BUILD:** P3 wedge mode (wedge angle θ, shock angle β, M₁, M₂). Values M₁, β, θ,
  normal Mach M_n1, M₂, p₂/p₁. Relations: M_n1 = M₁ sin β; tan θ = 2 cot β (M₁² sin²β − 1) ÷
  (M₁²(γ + cos 2β) + 2); the normal-shock relations on M_n1; M₂ = M_n2 ÷ sin(β − θ). Example:
  M₁ = 2, β = 40° → M_n1 = 1.286, θ = 10.6°, p₂/p₁ = 1.761, M₂ = 1.62. Typing θ first needs N3
  (weak or strong shock).
- **~pitot — BUILD ⏳ N2:** P3 normal mode with a probe. Values M₁, p₁, p₀₂ (probe reading),
  ratio p₀₂/p₁ (Rayleigh pitot formula). Example: M₁ = 2, p₁ = 20 kPa → p₀₂/p₁ = 5.640,
  p₀₂ = 112.8 kPa; typing the probe reading finds M₁ by trial.
- **Verdict:** 3 pages.

#### compressible-flow#2 — Nozzle flow

| Question type                                         | Page            | Mark              |
| ----------------------------------------------------- | --------------- | ----------------- |
| design exit Mach, pressure, temperature from Ae/At    | main            | Solves (⏳ N3)    |
| mass flow of a choked nozzle                          | main            | Solves            |
| what happens as back pressure is lowered              | ~back-pressure  | Solves            |
| over- or underexpanded at a given back pressure       | ~expansion      | Solves            |

- **Main — BUILD ⏳ N3:** **P2** `duct` nozzle (reservoir, throat, exit; p and M along the axis).
  Values p₀, T₀, throat area A_t, exit-to-throat ratio Ae/At, exit Mach M_e (supersonic branch),
  p_e, T_e, ṁ. Relations: the area–Mach relation at the exit; isentropic ratios at M_e; choked ṁ.
  Assumptions: isentropic to the exit; the design (shock-free) solution; back pressure equal to
  p_e. Example: p₀ = 1000 kPa, T₀ = 600 K, A_t = 0.002 m², Ae/At = 1.6875 → M_e = 2.0,
  p_e = 127.8 kPa, T_e = 333.3 K, ṁ = 3.30 kg/s. startWith p₀, T₀, A_t, Ae/At.
- **~back-pressure — BUILD (sequence):** stages as the back pressure p_b falls from p₀: no flow
  (p_b = p₀); subsonic throughout, venturi; throat reaches M = 1, subsonic exit (first critical);
  a normal shock stands in the diverging part; the shock reaches the exit plane; oblique shocks
  outside, overexpanded; shock-free design point (p_b = p_e); expansion fans outside,
  underexpanded. Spans: none (order only).
- **~expansion — BUILD (sort):** bins "Overexpanded (p_e < p_b)", "Ideally expanded",
  "Underexpanded (p_e > p_b)". Cards: a vacuum-optimized bell fired at sea level; an upper stage in
  space; a booster at the altitude where p_e equals the air pressure; a sea-level engine high in
  the climb; a plume pinched in with shock diamonds; a plume ballooning wide in thin air.
- **Verdict:** 3 pages.

#### compressible-flow#3 — Supersonic aerodynamics

| Question type                                         | Page          | Mark            |
| ----------------------------------------------------- | ------------- | --------------- |
| lift and wave drag of a thin airfoil (Ackeret)        | main          | Solves          |
| Mach angle                                            | ~mach-angle   | Solves          |
| Prandtl–Meyer expansion round a corner                | ~expansion-fan| Solves (⏳ N2)  |

- **Main — BUILD:** **P3** flat-plate mode (plate at α, shocks and fans at both edges). Values M∞
  (1.2–5), α (0–10°), c_l, c_d (wave), L/D. Relations: c_l = 4α ÷ √(M∞² − 1);
  c_d = 4α² ÷ √(M∞² − 1). Assumptions: thin airfoil, small α, linearized flow, no friction.
  Example: M∞ = 2, α = 3° = 0.05236 rad → c_l = 0.121, c_d = 0.00633, L/D = 19.1. startWith M∞, α.
- **~mach-angle — BUILD:** P3 `mach` mode. Values M, μ. Relation: μ = sin⁻¹(1 ÷ M). Example: M = 2 → 30°.
- **~expansion-fan — BUILD ⏳ N2:** P3 corner mode (fan between Mach lines). Values M₁, ν(M₁),
  turn θ, ν(M₂), M₂. Relations: ν(M) = √((γ + 1) ÷ (γ − 1)) tan⁻¹√(((γ − 1) ÷ (γ + 1))(M² − 1))
  − tan⁻¹√(M² − 1); ν₂ = ν₁ + θ. Example: M₁ = 2 → ν₁ = 26.38°; turn 10° → ν₂ = 36.38°, M₂ = 2.385.
- **Verdict:** 3 pages. Fanno and Rayleigh flow are missing from the course: see "Not in the taxonomy".

### 3. flight-mechanics — Flight Mechanics, Stability & Control

#### flight-mechanics#0 — Aircraft performance

| Question type                                  | Page        | Mark   |
| ---------------------------------------------- | ----------- | ------ |
| C_L, drag and thrust required in level flight  | main        | Solves |
| stall speed                                    | ~stall      | Solves |
| jet range (Breguet)                            | ~range      | Solves |
| rate of climb from excess thrust               | ~climb      | Solves |
| load factor and radius of a level turn         | ~turn       | Solves |
| density at an altitude (standard atmosphere)   | ~atmosphere | Solves |

- **Main — BUILD:** **P4** `freeBody` `object: 'aircraft'` (side view: L up, W down, T forward,
  D back, to scale). Values weight W (100–5 × 10⁶ N), ρ, V, S, C_L, C_D0, K, C_D, drag D (= thrust
  required). Relations: W = ½ρV²SC_L; C_D = C_D0 + KC_L²; D = ½ρV²SC_D. Assumptions: steady, level,
  unaccelerated flight, so L = W and T = D; a parabolic drag polar. Example: W = 50,000 N,
  ρ = 1.0 kg/m³, V = 80 m/s, S = 20 m², C_D0 = 0.025, K = 0.05 → q = 3200 Pa, C_L = 0.781,
  C_D = 0.0555, D = 3553 N. startWith W, ρ, S, V.
- **~stall — BUILD:** P4 aircraft. Values W, ρ, S, C_Lmax, V_stall. Relation:
  V_stall = √(2W ÷ (ρSC_Lmax)). Example: 10,000 N, 1.225 kg/m³, 16 m², 1.6 → 25.3 m/s.
- **~range — BUILD:** `functionGraph` log family (range against W₀/W₁). Values V, thrust-specific
  fuel consumption c_t (1/h), L/D, W₀/W₁, range R. Relation: R = (V ÷ c_t)(L/D) ln(W₀ ÷ W₁).
  Assumptions: constant V and L/D (cruise-climb); c_t in per second inside the formula. Example:
  230 m/s, 0.6 per h, L/D = 16, W₀/W₁ = 1.25 → R = 4927 km.
- **~climb — BUILD:** P4 aircraft with climb angle γ. Values T, D, V, W, rate of climb RC, γ.
  Relations: RC = V(T − D) ÷ W; sin γ = (T − D) ÷ W. Example: 6000 N, 3553 N, 80 m/s, 50,000 N
  → RC = 3.92 m/s, γ = 2.8°.
- **~turn — BUILD:** P4 aircraft front view with bank φ (P4 `bank`). Values φ, n, V, turn radius R,
  turn rate ω. Relations: n = 1 ÷ cos φ; R = V² ÷ (g√(n² − 1)); ω = V ÷ R. Example: 60°, 80 m/s
  → n = 2, R = 377 m, ω = 0.212 rad/s = 12.2°/s.
- **~atmosphere — BUILD:** `atmosphereLayers` (temperature by altitude, the point lit). Values
  altitude h (0–11,000 m), T, p, ρ. Relations: T = 288.15 − 0.0065h; p = 101,325(T ÷ 288.15)^5.2559;
  ρ = p ÷ (RT). Example: 3000 m → 268.65 K, 70.11 kPa, 0.909 kg/m³.
- **Verdict:** 6 pages.

#### flight-mechanics#1 — Static stability

| Question type                                         | Page          | Mark   |
| ----------------------------------------------------- | ------------- | ------ |
| neutral point and static margin                       | main          | Solves |
| trim angle of attack from C_m0 and C_mα               | ~trim         | Solves |
| stable or not from a C_m–α line                       | ~stable       | Solves |

- **Main — BUILD:** P4 aircraft with `stability` (aerodynamic center, CG and neutral point along
  the mean chord). Values wing h_ac (fraction of c̄), tail arm l_t, tail area S_t, c̄, S, tail
  volume V_H, slope ratio a_t ÷ a, downwash gradient dε/dα, neutral point h_n, CG h, static
  margin. 11 values, over the cap: merge a_t ÷ a and dε/dα into the input "tail effectiveness
  (a_t ÷ a)(1 − dε/dα)" → 10. Relations: V_H = l_tS_t ÷ (c̄S); h_n = h_ac + V_H × effectiveness;
  SM = h_n − h. Assumptions: stick-fixed; the tail's lift slope and downwash taken as constants;
  stable needs the CG ahead of the neutral point. Example: h_ac = 0.25, l_t = 4.0 m, S_t = 3.2 m²,
  c̄ = 1.6 m, S = 16 m² → V_H = 0.5; effectiveness 0.6 × 0.55 = 0.33 → h_n = 0.415; h = 0.30 →
  SM = 0.115 (11.5% of c̄). startWith the inputs, h last.
- **~trim — BUILD:** `linearFunction` (C_m against α: intercept C_m0, slope C_mα, the zero lit).
  Values C_m0, C_mα (per degree), α_trim. Relation: C_m0 + C_mα α_trim = 0. Example: 0.05,
  −0.012 per degree → 4.17°.
- **~stable — BUILD (sort):** bins "Statically stable and trims at positive lift", "Unstable",
  "Stable but trims at negative lift". Cards: C_m0 = +0.05, C_mα = −0.01 per degree; C_m0 = +0.04,
  C_mα = +0.01; C_m0 = −0.03, C_mα = −0.01; CG 10% c̄ ahead of the neutral point with positive C_m0;
  CG behind the neutral point; a flying wing with reflex giving C_m0 > 0 and the CG forward.
- **Verdict:** 3 pages.

#### flight-mechanics#2 — Dynamic stability

| Question type                                          | Page        | Mark   |
| ------------------------------------------------------ | ----------- | ------ |
| phugoid period and damping (Lanchester)                | main        | Solves |
| ω_n, ζ, period, time to half amplitude from λ = n ± iω | ~eigenvalue | Solves |
| which mode: short period, phugoid, Dutch roll, spiral   | ~modes      | Solves |

- **Main — BUILD ⏳ P5:** **P5** `stepResponse` oscillation mode (a disturbance decaying inside
  its envelope, period and t½ marked). Values V (20–300 m/s), L/D, ω_ph, period T, ζ, t½.
  Relations: ω_ph = √2 g ÷ V; T = 2π ÷ ω_ph; ζ = 1 ÷ (√2 (L/D)); t½ = ln 2 ÷ (ζω_ph).
  Assumptions: Lanchester's approximation (constant angle of attack, trades speed for height);
  light damping, so the damped and natural periods are about equal. Example: V = 100 m/s,
  L/D = 12 → ω = 0.1387 rad/s, T = 45.3 s, ζ = 0.0589, t½ = 84.8 s. startWith V, L/D.
- **~eigenvalue — BUILD:** `complexPlane` (the root as a point; left half-plane stable). Values real
  part n, imaginary part ω, ω_n, ζ, period, t½. Relations: ω_n = √(n² + ω²); ζ = −n ÷ ω_n;
  T = 2π ÷ ω; t½ = ln 2 ÷ (−n). Example: −0.5 ± 2i → ω_n = 2.06 rad/s, ζ = 0.243, T = 3.14 s,
  t½ = 1.39 s. Assumption: n > 0 means the motion grows (unstable), and t½ becomes a doubling time.
- **~modes — BUILD (sort):** bins "Longitudinal", "Lateral–directional". Cards: short-period
  pitching (seconds, well damped); phugoid (long, slow trade of speed and height); Dutch roll (yaw
  and roll out of phase); roll subsidence; spiral mode (slow bank divergence).
- **Verdict:** 3 pages.

#### flight-mechanics#3 — Flight control

| Question type                                   | Page              | Mark   |
| ----------------------------------------------- | ----------------- | ------ |
| elevator angle to trim at α                     | main              | Solves |
| which surface controls pitch, roll or yaw       | ~surfaces         | Solves |
| bank angle for a coordinated turn rate          | ~coordinated-turn | Solves |

- **Main — BUILD:** P4 aircraft side view with the elevator deflection drawn. Values C_m0, C_mα,
  α, C_mδe (per degree), δe. Relation: C_m0 + C_mα α + C_mδe δe = 0. Assumptions: linear
  coefficients; trailing edge up is negative δe; a forward CG needs more up elevator. Example:
  C_m0 = 0.05, C_mα = −0.012 per degree, α = 6°, C_mδe = −0.02 per degree → δe = −1.1°
  (trailing edge up). startWith C_m0, C_mα, C_mδe, α.
- **~surfaces — BUILD (sort):** bins "Pitch", "Roll", "Yaw". Cards: elevator; all-moving
  stabilator; canard; ailerons; roll spoilers on one wing; rudder; yaw damper on the rudder.
- **~coordinated-turn — BUILD:** P4 front view. Values V, turn rate ω (deg/s), bank φ, n.
  Relation: tan φ = Vω ÷ g. Example: standard rate 3°/s at 60 m/s → tan φ = 60 × 0.05236 ÷ 9.81
  = 0.320 → φ = 17.8°, n = 1.05.
- **Verdict:** 3 pages.

### 4. aerospace-structures — Aerospace Structures

#### aerospace-structures#0 — Thin-walled structures

| Question type                                         | Page        | Mark   |
| ----------------------------------------------------- | ----------- | ------ |
| shear flow and stress in a closed box under torque    | main        | Solves |
| twist rate of a closed cell                           | main        | Solves |
| hoop and axial stress in a pressurized fuselage       | ~cabin      | Solves |

- **Main — BUILD:** **P6** `section` thin-walled box (enclosed area A_m shaded, shear-flow arrows
  round the wall). Values torque T, width, height, wall t, enclosed area A_m, shear flow q,
  shear stress τ, shear modulus G, twist rate θ′ (deg/m). Relations: A_m = width × height;
  q = T ÷ (2A_m); τ = q ÷ t; θ′ = T(perimeter ÷ t) ÷ (4A_m²G). Assumptions: Bredt–Batho, one closed
  cell, uniform t, dimensions to the wall's mid-line. Example: 10 kN·m, 0.4 m × 0.2 m, t = 2 mm,
  G = 27 GPa → A_m = 0.08 m², q = 62.5 kN/m, τ = 31.3 MPa, θ′ = 0.00868 rad/m = 0.497°/m.
  startWith T, width, height, t, G.
- **~cabin — BUILD:** P6 `section` cylinder mode (hoop and axial arrows on a skin element).
  Values pressure difference Δp, radius r, skin t, hoop σ_h, axial σ_a. Relations: σ_h = Δpr ÷ t;
  σ_a = Δpr ÷ (2t). Example: 60 kPa, 2 m, 1.6 mm → 75 MPa and 37.5 MPa.
- **Verdict:** 2 pages.

#### aerospace-structures#1 — Composites

| Question type                                   | Page          | Mark   |
| ----------------------------------------------- | ------------- | ------ |
| longitudinal modulus by the rule of mixtures    | main          | Solves |
| transverse modulus                              | ~transverse   | Solves |
| density and specific stiffness                  | ~specific     | Solves |

- **Main — BUILD:** **P8** `lamina` (fibers in matrix; load along the fibers, the two as springs
  side by side). Values fiber modulus E_f, matrix modulus E_m, fiber fraction V_f (0–0.8),
  V_m (derived), E₁. Relations: V_m = 1 − V_f; E₁ = E_fV_f + E_mV_m. Assumptions: perfect bonding;
  fibers and matrix stretch equally along the fibers (iso-strain); no voids. Example: carbon
  230 GPa, epoxy 3.5 GPa, V_f = 0.6 → E₁ = 139.4 GPa. startWith E_f, E_m, V_f.
- **~transverse — BUILD:** P8 loaded across the fibers (springs in series). Relation:
  1 ÷ E₂ = V_f ÷ E_f + V_m ÷ E_m. Example: same → E₂ = 8.55 GPa (16 times softer across).
- **~specific — BUILD:** P8. Values ρ_f, ρ_m, V_f, ρ_c, E₁, E₁ ÷ ρ_c. Example: 1.8 and
  1.2 g/cm³ → 1.56 g/cm³; specific stiffness 89.4 MN·m/kg (aluminum about 26).
- **Verdict:** 3 pages.

#### aerospace-structures#2 — Buckling

| Question type                                         | Page            | Mark   |
| ----------------------------------------------------- | --------------- | ------ |
| Euler load of a pinned column                         | main            | Solves |
| effect of end conditions (K)                          | main            | Solves |
| critical stress of a skin panel between stringers     | ~plate          | Solves |
| short column: Johnson parabola                        | ~johnson        | Solves |

- **Main — BUILD:** **P7** `column` (ends drawn pinned, fixed or free; the buckled shape; KL).
  Values E, I, length L, K (allowed 0.5, 0.7, 1, 2), P_cr, area A, σ_cr. Relations:
  P_cr = π²EI ÷ (KL)²; σ_cr = P_cr ÷ A. Assumptions: straight, centrally loaded, elastic up to
  P_cr; K = 1 pinned–pinned, 0.5 fixed–fixed, 0.7 fixed–pinned, 2 fixed–free. Example: aluminum
  tube 70 GPa, I = 8.0 × 10⁻⁸ m⁴, 1.2 m, K = 1 → P_cr = 38.4 kN. startWith E, I, L, K.
- **~plate — BUILD:** P7 panel mode. Values k (allowed 4 simply supported, 6.97 clamped), E, ν,
  t, width b, σ_cr. Relation: σ_cr = kπ²E ÷ (12(1 − ν²)) × (t ÷ b)². Example: k = 4, 70 GPa,
  ν = 0.33, 2 mm, 100 mm → 103.4 MPa.
- **~johnson — BUILD:** P7. Values σ_y, E, slenderness KL ÷ r, transition (KL ÷ r)_t, σ_cr.
  Relations: (KL ÷ r)_t = √(2π²E ÷ σ_y); σ_cr = σ_y − (σ_y² ÷ (4π²E))(KL ÷ r)² below it.
  Example: σ_y = 350 MPa, E = 70 GPa → (KL/r)_t = 62.8; at 40 → σ_cr = 350 − 0.04432 × 1600
  = 279.1 MPa. ⏳ N9 (two formulas by a limit).
- **Verdict:** 3 pages.

#### aerospace-structures#3 — Fatigue

| Question type                                         | Page       | Mark   |
| ----------------------------------------------------- | ---------- | ------ |
| mean and alternating stress, Goodman safety factor    | main       | Solves |
| Miner's rule damage and repeats to failure            | ~miner     | Solves |
| cycles to failure from Basquin's law                  | ~basquin   | Solves |

- **Main — BUILD:** `linearFunction` with `test` (the Goodman line from (0, S_e) to (S_u, 0), the
  load point (σ_m, σ_a) inside or outside). Values σ_max, σ_min, σ_m, σ_a, fatigue strength S_e,
  ultimate S_u, safety factor n. Relations: σ_m = (σ_max + σ_min) ÷ 2; σ_a = (σ_max − σ_min) ÷ 2;
  1 ÷ n = σ_a ÷ S_e + σ_m ÷ S_u. Assumptions: S_e is the fatigue strength at the design life
  (aluminum has no endurance limit); the modified Goodman line. Example: 200 and 40 MPa,
  S_e = 300, S_u = 600 MPa → σ_m = 120, σ_a = 80, n = 2.14. startWith σ_max, σ_min, S_e, S_u.
- **~miner — BUILD:** `bars` (damage fraction per load block, total to 1). Values n₁, N₁, n₂,
  N₂, damage D, repeats to failure. Relations: D = n₁ ÷ N₁ + n₂ ÷ N₂; repeats = 1 ÷ D. Example:
  10⁴ of 10⁵ and 2 × 10³ of 10⁴ → D = 0.3, 3.33 repeats.
- **~basquin — BUILD ⏳ P37:** `functionGraph` power family on log axes (P37). Values σ′_f, b,
  σ_a, reversals 2N, N. Relation: σ_a = σ′_f(2N)^b. Example: 1000 MPa, b = −0.1, 300 MPa →
  2N = 1.69 × 10⁵, N = 84,700 cycles.
- **Verdict:** 3 pages.

### 5. propulsion — Propulsion

#### propulsion#0 — Gas turbine cycles

| Question type                                         | Page          | Mark   |
| ----------------------------------------------------- | ------------- | ------ |
| ideal Brayton efficiency and net work                 | main          | Solves |
| compressor exit temperature with an efficiency        | ~compressor   | Solves |
| turbojet thrust, propulsive efficiency, TSFC          | ~turbojet     | Solves |
| turbofan thrust with a bypass ratio                   | ~turbofan     | Solves |

- **Main — BUILD ⏳ P10:** **P10** `propertyDiagram` T–s mode (states 1–4, compression and
  expansion vertical, heat in and out on the constant-pressure lines). Values T₁, pressure ratio
  r_p, T₃, T₂, T₄, compressor work w_c, turbine work w_t, net work w_net, efficiency η. Relations:
  T₂ = T₁r_p^((γ − 1) ÷ γ); T₄ = T₃ ÷ r_p^((γ − 1) ÷ γ); w_c = c_p(T₂ − T₁); w_t = c_p(T₃ − T₄);
  w_net = w_t − w_c; η = 1 − 1 ÷ r_p^((γ − 1) ÷ γ). Assumptions: air-standard cycle, constant
  c_p = 1.005 kJ/(kg·K), isentropic compressor and turbine. Example: 300 K, r_p = 10, 1400 K →
  T₂ = 579.2 K, T₄ = 725.1 K, w_c = 280.6, w_t = 678.2, w_net = 397.6 kJ/kg, η = 48.2%.
  startWith T₁, r_p, T₃.
- **~compressor — BUILD:** P10 with the real path dashed. Values T₁, r_p, η_c, T₂s, T₂. Relation:
  T₂ = T₁(1 + (r_p^((γ − 1) ÷ γ) − 1) ÷ η_c). Example: 300 K, 10, 0.85 → T₂s = 579.2 K, T₂ = 628.5 K.
- **~turbojet — BUILD ⏳ P2:** P2 duct engine outline (inlet V₀, exit V_e). Values ṁ, V₀, V_e,
  thrust F, fuel flow ṁ_f, TSFC, η_p. Relations: F = ṁ(V_e − V₀); TSFC = ṁ_f ÷ F;
  η_p = 2 ÷ (1 + V_e ÷ V₀). Assumptions: exit pressure matched to ambient; fuel mass small beside
  air. Example: 50 kg/s, 250 → 600 m/s → F = 17.5 kN, η_p = 58.8%; 0.9 kg/s fuel → TSFC =
  5.14 × 10⁻⁵ kg/(N·s) = 0.185 kg/(N·h).
- **~turbofan — BUILD:** `bars` (core and bypass thrust stacked). Values core ṁ_c, bypass ratio
  BPR, ṁ_b, V₀, V_c, V_b, F. Relations: ṁ_b = BPR × ṁ_c; F = ṁ_c(V_c − V₀) + ṁ_b(V_b − V₀).
  Example: 20 kg/s, BPR 5, 230 m/s, 500 and 320 m/s → 5.4 + 9.0 = 14.4 kN.
- **Verdict:** 4 pages.

#### propulsion#1 — Rocket propulsion

| Question type                                   | Page           | Mark   |
| ----------------------------------------------- | -------------- | ------ |
| Δv from Isp and mass ratio (rocket equation)    | main           | Solves |
| propellant fraction for a Δv                    | main           | Solves |
| thrust with a pressure term; Isp from thrust    | ~thrust        | Solves |
| two-stage Δv                                    | ~staging       | Solves |

- **Main — BUILD ⏳ P11:** **P11** `rocket` (propellant and dry mass as bars, v_e arrow, Δv).
  Values specific impulse I_sp (100–500 s), initial mass m₀, final mass m_f, mass ratio, propellant
  fraction, Δv. Relations: Δv = I_sp g ln(m₀ ÷ m_f); fraction = 1 − m_f ÷ m₀. Assumptions: no
  gravity or drag losses (ideal Δv); constant exhaust speed; g = 9.81 m/s² defines I_sp here.
  The step says the equation comes from integrating m dv = −v_e dm. Example: 300 s, 50 t → 15 t
  → ln 3.333 = 1.204, Δv = 3543 m/s, fraction 0.70. Backward: Δv = 3000 m/s at 300 s needs a
  fraction of 0.639. startWith I_sp, m₀, m_f.
- **~thrust — BUILD:** P11 with the exit plane. Values ṁ, v_e, p_e, p_a, A_e, F, I_sp. Relations:
  F = ṁv_e + (p_e − p_a)A_e; I_sp = F ÷ (ṁg). Example: 250 kg/s, 2900 m/s, 70 kPa into
  101.325 kPa, 1.0 m² → F = 693.7 kN, I_sp = 282.8 s.
- **~staging — BUILD:** P11 `stages: 2`. Values I_sp1, m₀₁, m_f1, I_sp2, m₀₂, m_f2, Δv₁, Δv₂, Δv.
  Example: 300 s, 120 t → 50 t (drops 20 t) → 2577 m/s; 340 s, 30 t → 10 t → 3664 m/s; total 6241 m/s.
- **Verdict:** 3 pages.

#### propulsion#2 — Nozzle performance

| Question type                                         | Page             | Mark   |
| ----------------------------------------------------- | ---------------- | ------ |
| thrust from C_F, chamber pressure, throat area        | main             | Solves |
| c* and mass flow; I_sp from C_F and c*                | main             | Solves |
| ideal exhaust velocity from chamber state             | ~exhaust-velocity| Solves |
| over-, ideally or underexpanded                       | compressible-flow#2~expansion | cross-listed |

- **Main — BUILD:** P2 duct with a chamber (P2 `chamber`). Values chamber pressure p_c, throat
  A_t, thrust coefficient C_F, characteristic velocity c*, F, ṁ, I_sp. Relations: F = C_Fp_cA_t;
  ṁ = p_cA_t ÷ c*; I_sp = C_Fc* ÷ g. Assumptions: C_F holds the nozzle's expansion and the
  ambient pressure; c* holds the propellant and combustion. Example: 7 MPa, 0.05 m², 1.6,
  1600 m/s → F = 560 kN, ṁ = 218.8 kg/s, I_sp = 261 s. startWith p_c, A_t, C_F, c*.
- **~exhaust-velocity — BUILD:** P2 chamber. Values γ, gas constant R (J/(kg·K)), T_c, p_e ÷ p_c,
  v_e. Relation: v_e = √((2γRT_c ÷ (γ − 1))(1 − (p_e ÷ p_c)^((γ − 1) ÷ γ))). Example: 1.2,
  350 J/(kg·K), 3200 K, 0.01 → 2684 m/s.
- **Verdict:** 2 pages (the expansion sort is shared with compressible-flow#2).

#### propulsion#3 — Combustion

| Question type                                         | Page            | Mark   |
| ----------------------------------------------------- | --------------- | ------ |
| stoichiometric fuel–air ratio of a hydrocarbon        | main            | Solves |
| equivalence ratio                                     | main            | Solves |
| fuel–air ratio for a combustor exit temperature       | ~burner         | Solves |

- **Main — BUILD:** `reaction` (CₓH_y + O₂ + N₂ → CO₂ + H₂O + N₂, atoms counted; the `C{x}H{y}`
  terms option). Values carbon x, hydrogen y, moles of air (x + y ÷ 4) × 4.76, air mass, fuel
  molar mass, f_st, air–fuel ratio, actual f, equivalence ratio φ. Relations: air mass =
  (x + y ÷ 4) × 4.76 × 28.97; f_st = M_fuel ÷ air mass; φ = f ÷ f_st. Assumptions: air is 21% O₂
  and 79% N₂ (3.76 N₂ per O₂); complete combustion to CO₂ and H₂O. Example: methane x = 1,
  y = 4 → 275.8 kg air per kmol, f_st = 0.0582, AFR 17.2; f = 0.04 → φ = 0.69. startWith x, y.
- **~burner — BUILD ⏳ P9:** **P9** `controlVolume` combustor (air and fuel in, hot gas out, heat
  release). Values T₀₃, T₀₄, c_p, heating value Q_R, f, φ (with f_st). Relation:
  f = c_p(T₀₄ − T₀₃) ÷ (Q_R − c_pT₀₄). Example: 600 → 1400 K, 1.15 kJ/(kg·K), 43,000 kJ/kg →
  f = 0.0222, φ = 0.33 with f_st = 0.068.
- **Verdict:** 2 pages.

### 6. orbital-mechanics — Orbital Mechanics

#### orbital-mechanics#0 — Two-body problem

| Question type                                   | Page          | Mark   |
| ----------------------------------------------- | ------------- | ------ |
| circular speed and period at an altitude        | main          | Solves |
| escape speed                                    | main          | Solves |
| speed anywhere on an ellipse (vis-viva)         | ~vis-viva     | Solves |
| geostationary radius and altitude               | ~geostationary| Solves |

- **Main — BUILD:** `circularMotion` `mode: 'satellite'` (Earth to scale, v tangent). Values
  altitude z (100–400,000 km), radius r, μ (fixed), circular speed v, period T, escape speed
  v_esc. Relations: r = 6378 + z; v = √(μ ÷ r); T = 2π√(r³ ÷ μ); v_esc = √(2μ ÷ r). Assumptions:
  a point-mass Earth, no drag, the satellite's mass negligible. Example: 400 km → r = 6778 km,
  v = 7.669 km/s, T = 92.6 min, v_esc = 10.85 km/s. startWith z.
- **~vis-viva — BUILD ⏳ P12:** `circularMotion` kepler ellipse with the point (P12 `visViva`).
  Values r_p, r_a, a, r, v. Relations: a = (r_p + r_a) ÷ 2; v² = μ(2 ÷ r − 1 ÷ a). Example:
  6778 and 42,164 km → a = 24,471 km; at r = 20,000 km v = 4.855 km/s.
- **~geostationary — BUILD:** `circularMotion` satellite. Values T, r, altitude, v. Relation:
  r = (μT² ÷ (4π²))^(1/3). Example: 86,164 s → 42,164 km, altitude 35,786 km, 3.075 km/s.
- **Verdict:** 3 pages.

#### orbital-mechanics#1 — Orbital elements

| Question type                                          | Page          | Mark            |
| ------------------------------------------------------ | ------------- | --------------- |
| a, e, period, h from perigee and apogee                | main          | Solves          |
| radius at a true anomaly (orbit equation)              | ~orbit-equation| Solves         |
| position after a time (Kepler's equation)              | ~kepler       | Solves (⏳ N2)  |
| what i, Ω, ω and ν describe                            | ~elements     | Solves (⏳ P13) |

- **Main — BUILD:** `circularMotion` kepler (`eccentricity` to 0.97; perigee and apogee marked).
  Values r_p, r_a, a, e, period T, angular momentum h, v_p, v_a. Relations: a = (r_p + r_a) ÷ 2;
  e = (r_a − r_p) ÷ (r_a + r_p); T = 2π√(a³ ÷ μ); h = √(μa(1 − e²)); v_p = h ÷ r_p; v_a = h ÷ r_a.
  Assumptions: radii from Earth's center, not altitudes; two-body motion. Example: 6778 and
  42,164 km → a = 24,471 km, e = 0.7230, T = 10.58 h, h = 68,228 km²/s, v_p = 10.07 km/s,
  v_a = 1.618 km/s. startWith r_p, r_a.
- **~orbit-equation — BUILD:** same picture with the point at ν. Values a, e, ν, r. Relation:
  r = a(1 − e²) ÷ (1 + e cos ν). Example: a = 24,471 km, e = 0.723, ν = 90° → r = 11,679 km.
- **~kepler — BUILD ⏳ N2:** same picture, swept area shaded. Values a, e, time since perigee t,
  mean anomaly M, eccentric anomaly E, ν, r. Relations: M = 2πt ÷ T; M = E − e sin E;
  tan(ν ÷ 2) = √((1 + e) ÷ (1 − e)) tan(E ÷ 2); r = a(1 − e cos E). Example: GTO above, t = 1.684 h
  → M = 1.000 rad, E = 1.7155 rad (by trial), ν = 141.8°, r = 27,022 km.
- **~elements — BUILD (explore) ⏳ P13:** figure `orbitElements` (equatorial plane, the orbit
  tilted through the node line, vernal-equinox direction). Scenes: inclination i lit; right
  ascension of the ascending node Ω lit; argument of perigee ω lit; true anomaly ν lit; a and e
  as the ellipse's size and shape; i = 0 makes Ω undefined.
- **Verdict:** 4 pages.

#### orbital-mechanics#2 — Orbital maneuvers

| Question type                                         | Page          | Mark   |
| ----------------------------------------------------- | ------------- | ------ |
| Hohmann transfer Δv₁, Δv₂, time of flight             | main          | Solves |
| plane-change Δv                                       | ~plane-change | Solves |
| combined circularize-and-turn burn at apogee          | ~combined     | Solves |

- **Main — BUILD ⏳ P12:** **P12** `circularMotion` `mode: 'hohmann'` (both circles, the half
  ellipse, burn arrows). Values r₁, r₂, transfer a, v₁, v_p, v_a, v₂, Δv₁, Δv₂, TOF (10).
  Relations: a = (r₁ + r₂) ÷ 2; v₁ = √(μ ÷ r₁); v_p = √(μ(2 ÷ r₁ − 1 ÷ a)); likewise at r₂;
  Δv₁ = v_p − v₁; Δv₂ = v₂ − v_a; TOF = π√(a³ ÷ μ). Assumptions: coplanar circular orbits;
  impulsive burns; the cheapest two-burn transfer between them when r₂ ÷ r₁ < 11.9. Example: 6778 →
  42,164 km → Δv₁ = 2.398, Δv₂ = 1.457, total 3.854 km/s, TOF 5.29 h. startWith r₁, r₂.
- **~plane-change — BUILD:** `vectorDiagram` (v before and after, the Δv side of the isosceles
  triangle). Values v, Δi, Δv. Relation: Δv = 2v sin(Δi ÷ 2). Example: 3.075 km/s, 28.5° →
  1.514 km/s.
- **~combined — BUILD:** `vectorDiagram` (v_a and v₂ at angle Δi). Values v_a, v₂, Δi, Δv.
  Relation: Δv = √(v_a² + v₂² − 2v_av₂ cos Δi). Example: 1.618 and 3.075 km/s, 28.5° → 1.824 km/s
  (against 1.457 + 1.514 = 2.971 km/s done separately).
- **Verdict:** 3 pages.

#### orbital-mechanics#3 — Interplanetary transfers

| Question type                                          | Page        | Mark   |
| ------------------------------------------------------ | ----------- | ------ |
| v∞ and departure Δv from a parking orbit (patched conic)| main       | Solves |
| synodic period, next launch window                     | ~synodic    | Solves |
| sphere of influence radius                             | ~soi        | Solves |

- **Main — BUILD ⏳ P12:** P12 hohmann on the Sun's scale with the planet's hyperbola inset.
  Values r₁ (AU or km), r₂, v∞ (departure), parking radius r_p, v_c there, Δv, TOF (days).
  Relations: v∞ = √(μ_S(2 ÷ r₁ − 2 ÷ (r₁ + r₂))) − √(μ_S ÷ r₁); Δv = √(v∞² + 2μ_E ÷ r_p) − √(μ_E ÷ r_p);
  TOF = π√(((r₁ + r₂) ÷ 2)³ ÷ μ_S). Assumptions: circular coplanar planet orbits; patched conics
  (Sun's pull only between spheres of influence). Example: Earth → Mars, 1.496 × 10⁸ and
  2.279 × 10⁸ km → v∞ = 2.943 km/s; 300 km parking orbit (r_p = 6678 km) → Δv = 3.590 km/s;
  TOF = 259 days. startWith r₁, r₂, r_p.
- **~synodic — BUILD:** `circularMotion` satellite with two planets (P12 `pair`). Values T₁, T₂,
  synodic S. Relation: 1 ÷ S = 1 ÷ T₁ − 1 ÷ T₂. Example: 365.25 and 687 d → 780 d.
- **~soi — BUILD:** `none`. Values a, m ÷ M, r_SOI. Relation: r_SOI = a(m ÷ M)^(2/5). Example:
  Earth, 1.496 × 10⁸ km, 3.003 × 10⁻⁶ → 925,000 km.
- **Verdict:** 3 pages.

## Civil

Textbooks for the field (part 4): Udoeyo, _Structural Analysis_ (Temple, CC BY-NC-ND);
Levinson et al., _Fundamentals of Transportation_ (Wikibooks, CC BY-SA); Verruijt, _Soil
Mechanics_ (TU Delft, free to read); NRCS _National Engineering Handbook_ Part 630 Hydrology and
TR-55, FHWA HEC-22 and HDS-4, EPA and NGS publications (public domain); AISC _Design Examples_
and the 360-22 specification (free download, all rights reserved); MIT OCW 1.050, 1.060, 1.061,
1.201, 1.34, 1.571, 1.85 (CC BY-NC-SA). Reference only.

### 7. structural-analysis — Structural Analysis (prereq Mechanics of Materials)

#### structural-analysis#0 — Determinate structures

| Question type                                            | Page          | Mark   |
| -------------------------------------------------------- | ------------- | ------ |
| reactions and maximum moment, point load on a span       | main          | Solves |
| shear and moment of a uniform load                       | ~udl          | Solves |
| cantilever end reaction and fixed-end moment             | ~cantilever   | Solves |
| truss member force by the method of sections             | ~truss        | Solves (⏳ P15) |
| determinate, indeterminate or unstable                   | ~determinacy  | Solves |

- **Main — BUILD ⏳ P14:** **P14** `beam` (pin and roller, the load, reactions, shear and moment
  diagrams under the beam). Values span L, load P, distance a, b (derived), R_A, R_B, M_max.
  Relations: b = L − a; R_A = Pb ÷ L; R_B = Pa ÷ L; M_max = Pab ÷ L. Assumptions: simply supported,
  weight of the beam ignored; the moment peaks under the load. Example: 8 m, 40 kN at 3 m →
  R_A = 25 kN, R_B = 15 kN, M_max = 75 kN·m. startWith L, P, a.
- **~udl — BUILD ⏳ P14:** P14 with a uniform load. Values w, L, R, V_max, M_max. Relations:
  R = wL ÷ 2; M_max = wL² ÷ 8 at midspan. Example: 12 kN/m, 10 m → 60 kN, 150 kN·m.
- **~cantilever — BUILD ⏳ P14:** P14 fixed end. Values P, w, L, V at the wall, M at the wall.
  Relations: V = P + wL; M = PL + wL² ÷ 2. Example: 10 kN at the tip, 4 kN/m, 3 m → 22 kN, 48 kN·m.
- **~truss — BUILD ⏳ P15:** **P15** `truss` Pratt, section cut lit. Values panel length, height
  h, panels n (allowed 4, 6, 8), joint load P, reaction R, moment at the cut M, chord force F.
  Relations: R = (n − 1)P ÷ 2; F = M ÷ h. Example: 6 panels of 3 m, h = 3 m, 10 kN at the five
  inner bottom joints → R = 25 kN; at midspan M = 25 × 9 − 10 × (3 + 6) = 135 kN·m, bottom chord
  F = 45 kN tension.
- **~determinacy — BUILD:** P15 drawing the counts. Values members m, reactions r, joints j,
  degree of indeterminacy. Relation: degree = m + r − 2j. Example: the Pratt truss, m = 21, r = 3,
  j = 12 → 0, determinate. Assumption: a negative degree means unstable; a zero can still be
  unstable if members are badly arranged (the step says so).
- **Verdict:** 5 pages.

#### structural-analysis#1 — Influence lines

| Question type                                         | Page         | Mark   |
| ----------------------------------------------------- | ------------ | ------ |
| maximum moment at a section from a moving load        | main         | Solves |
| moment from a uniform live load on the influence area | main         | Solves |
| shear influence line ordinates                        | ~shear       | Solves |
| where to place live load on a continuous beam         | ~muller-breslau | Solves (⏳ P14) |

- **Main — BUILD ⏳ P14:** P14 `influence` (the triangle for moment at section C, the load's
  ordinate). Values L, section c, peak ordinate, point load P, uniform w, M from P, M from w.
  Relations: ordinate = c(L − c) ÷ L; M_P = P × ordinate; M_w = w × ½L × ordinate. Assumptions:
  simply supported; the peak is with the load right at C; the uniform load covers the whole span.
  Example: L = 10 m, c = 4 m → 2.4 m; 50 kN → 120 kN·m; 12 kN/m → 144 kN·m. startWith L, c.
- **~shear — BUILD:** P14 influence for shear. Values L, c, ordinates −c ÷ L and (L − c) ÷ L, P,
  V_max. Example: same beam → −0.4 and +0.6; 50 kN just right of C → V = 30 kN.
- **~muller-breslau — BUILD (explore) ⏳ P14:** figure: a three-span continuous beam (P14
  `deflected` drawn by Müller-Breslau). Scenes: release the moment at midspan of span 2, the shape
  says load spans 2 only for most positive moment; release at support B, load spans 1 and 2 for
  most negative moment; release a reaction; the checkerboard pattern of live load.
- **Verdict:** 3 pages.

#### structural-analysis#2 — Indeterminate structures

| Question type                                          | Page              | Mark   |
| ------------------------------------------------------ | ----------------- | ------ |
| propped cantilever reactions (force method)            | main              | Solves |
| fixed-end moments                                      | ~fixed-end        | Solves |
| two-span continuous beam by moment distribution        | ~moment-distribution | Solves (⏳ P14) |

- **Main — BUILD ⏳ P14:** P14 fixed–roller beam. Values w, L, prop reaction R_B, fixed reaction
  R_A, fixed-end moment M_A. Relations: R_B = 3wL ÷ 8 (from the compatibility condition: the
  prop's deflection cancels the load's); R_A = 5wL ÷ 8; M_A = wL² ÷ 8. Assumptions: constant EI;
  the step names the compatibility equation wL⁴ ÷ (8EI) = R_BL³ ÷ (3EI). Example: 20 kN/m, 6 m →
  45 kN, 75 kN, 90 kN·m. startWith w, L.
- **~fixed-end — BUILD:** P14 fixed–fixed. Values P, w, L, FEM for a central load PL ÷ 8, FEM for
  uniform load wL² ÷ 12. Example: 30 kN at midspan of 6 m → 22.5 kN·m; 10 kN/m → 30 kN·m.
- **~moment-distribution — BUILD ⏳ P14:** P14 continuous with a distribution table under it.
  Values L₁, L₂, w, stiffness k₁ = 3 ÷ L₁, k₂ = 3 ÷ L₂ (far ends pinned), DF₁, DF₂, FEM₁, FEM₂, M_B.
  Relations: DF = k ÷ Σk; FEM = wL² ÷ 8 (pinned far end); M_B = FEM₁ − DF₁(FEM₁ − FEM₂). Example:
  6 m and 4 m, 12 kN/m → DF 0.4 and 0.6; FEM 54 and 24 kN·m; unbalance 30 → M_B = 42 kN·m
  (one cycle settles it because both far ends are pinned).
- **Verdict:** 3 pages.

#### structural-analysis#3 — Matrix methods

| Question type                                          | Page          | Mark            |
| ------------------------------------------------------ | ------------- | --------------- |
| element stiffness AE ÷ L                               | main          | Solves          |
| displacements of two bars in series (assembled K)      | main          | Solves          |
| spring system by the direct stiffness method           | ~springs      | Solves          |
| beam element stiffness matrix                          | —             | No (⏳ N9, 4 × 4) |

- **Main — BUILD:** `matrixGrid` `mode: 'determinant'`, `cramer` (the 2 × 2 reduced K, u solved
  by Cramer's rule); a bar chain sketch from P14 `axial`. Values A₁, L₁, A₂, L₂, E, k₁, k₂, load P,
  u₂, u₃. Relations: k = AE ÷ L; [k₁ + k₂, −k₂; −k₂, k₂][u₂; u₃] = [0; P]. Assumptions: node 1 fixed;
  axial members only; small displacements. Example: E = 200 GPa, 1000 mm² × 2 m, 500 mm² × 2 m →
  k₁ = 1.0 × 10⁸ N/m, k₂ = 5.0 × 10⁷ N/m; 30 kN → u₂ = 0.3 mm, u₃ = 0.9 mm. startWith the sizes.
- **~springs — BUILD:** `matrixGrid` cramer. Values k₁, k₂, k₃ (a spring from node 3 to the wall),
  P₂, P₃, u₂, u₃. K = [k₁ + k₂, −k₂; −k₂, k₂ + k₃]. Example: 100, 50, 50 kN/m; 0 and 10 kN →
  det = 150 × 100 − 2500 = 12,500; u₂ = 500 ÷ 12,500 = 0.04 m, u₃ = 1500 ÷ 12,500 = 0.12 m.
- **Verdict:** 2 pages.

### 8. soil-mechanics — Soil Mechanics

#### soil-mechanics#0 — Soil classification

| Question type                                         | Page          | Mark            |
| ----------------------------------------------------- | ------------- | --------------- |
| void ratio, porosity, dry unit weight from w, G_s, S  | main          | Solves          |
| C_u, C_c and well or poorly graded                    | ~gradation    | Solves (⏳ N5)  |
| plasticity index and the A-line                       | ~plasticity   | Solves (⏳ N5)  |
| USCS group from gradation and limits                  | ~uscs         | Solves          |

- **Main — BUILD ⏳ P16:** **P16** `soilPhases` (air, water, solid blocks with volumes and weights).
  Values G_s (2.5–2.9), w, degree of saturation S, void ratio e, porosity n, dry unit weight γ_d,
  moist unit weight γ. Relations: Se = wG_s; n = e ÷ (1 + e); γ_d = G_sγ_w ÷ (1 + e); γ = γ_d(1 + w).
  Assumptions: γ_w = 9.81 kN/m³; air weighs nothing. Example: 2.70, 18%, 0.9 → e = 0.54,
  n = 0.351, γ_d = 17.20 kN/m³, γ = 20.30 kN/m³. startWith G_s, w, S.
- **~gradation — BUILD ⏳ P37, N5:** `functionGraph` on a log grain-size axis (P37) with D₁₀, D₃₀,
  D₆₀ marked. Values D₁₀, D₃₀, D₆₀, C_u, C_c, result (well or poorly graded). Relations:
  C_u = D₆₀ ÷ D₁₀; C_c = D₃₀² ÷ (D₁₀D₆₀). Example: 0.15, 0.45, 1.2 mm → 8, 1.125 → well graded
  sand (C_u ≥ 6 and 1 ≤ C_c ≤ 3).
- **~plasticity — BUILD ⏳ N5:** `linearFunction` with `test` (the A-line PI = 0.73(LL − 20), the
  soil's point). Values LL, PL, PI, A-line PI, result. Example: LL 45, PL 22 → PI 23 above 18.25 →
  CL (lean clay; LL < 50).
- **~uscs — BUILD (sort):** bins "Coarse-grained (more than half on the No. 200 sieve)",
  "Fine-grained", "Highly organic". Cards: well-graded sand with 3% fines (SW); poorly graded
  gravel (GP); clayey sand (SC); lean clay, LL 35 (CL); elastic silt, LL 60 (MH); peat (Pt);
  fat clay, LL 70 (CH).
- **Verdict:** 4 pages.

#### soil-mechanics#1 — Compaction

| Question type                                        | Page        | Mark   |
| ---------------------------------------------------- | ----------- | ------ |
| dry unit weight from a Proctor point                 | main        | Solves |
| zero-air-voids unit weight                           | main        | Solves |
| relative compaction against the specification        | main        | Solves |
| sand-cone field density                              | ~sand-cone  | Solves |

- **Main — BUILD:** `functionGraph` rational family (the zero-air-voids curve G_sγ_w ÷ (1 + G_sw)
  against w; the field point and γ_d,max marked). Values moist γ, w, γ_d, G_s, γ_zav, γ_d,max, RC.
  Relations: γ_d = γ ÷ (1 + w); γ_zav = G_sγ_w ÷ (1 + wG_s); RC = γ_d ÷ γ_d,max. Assumptions: the
  curve's peak from the lab test is γ_d,max; no point can lie above the zero-air-voids curve.
  Example: 19.8 kN/m³, 12%, G_s = 2.68 → γ_d = 17.68, γ_zav = 19.89, γ_d,max = 18.5 → RC = 95.6%.
  startWith γ, w, γ_d,max.
- **~sand-cone — BUILD:** P16 phases. Values sand mass used, sand density, hole volume V, wet
  soil mass, ρ, w, ρ_d, γ_d. Example: 1.62 kg of 1.50 g/cm³ sand → V = 1080 cm³; 2.07 kg wet →
  1.917 g/cm³; w = 10% → 1.742 g/cm³, γ_d = 17.09 kN/m³.
- **Verdict:** 2 pages.

#### soil-mechanics#2 — Consolidation

| Question type                                          | Page               | Mark   |
| ------------------------------------------------------ | ------------------ | ------ |
| primary settlement of a normally consolidated clay     | main               | Solves |
| effective stress at a depth (layers, water table)      | ~effective-stress  | Solves |
| settlement of an overconsolidated clay                 | ~overconsolidated  | Solves (⏳ N9) |
| time for a degree of consolidation                     | ~time-rate         | Solves |

- **Main — BUILD ⏳ P17:** **P17** `soilProfile` consolidation (a clay layer under a new load, its
  mid-depth point, drainage arrows, the settled surface dashed). Values thickness H, C_c, e₀,
  σ′₀, Δσ, settlement S. Relation: S = (C_cH ÷ (1 + e₀)) log((σ′₀ + Δσ) ÷ σ′₀). Assumptions:
  normally consolidated (σ′₀ is the most the clay has carried); σ′₀ and Δσ taken at the layer's
  middle; one-dimensional. Example: 4 m, 0.3, 0.9, 80 kPa, 60 kPa → log 1.75 = 0.2430 →
  S = 0.153 m. startWith H, C_c, e₀, σ′₀, Δσ.
- **~effective-stress — BUILD ⏳ P17:** P17 layers with the water table and σ, u, σ′ lines.
  Values depth to water z_w, γ above, γ_sat below, depth z, σ, u, σ′. Relations:
  σ = γz_w + γ_sat(z − z_w); u = γ_w(z − z_w); σ′ = σ − u. Example: sand 3 m at 18 kN/m³, clay
  γ_sat = 19, z = 5 m → σ = 92 kPa, u = 19.62 kPa, σ′ = 72.38 kPa.
- **~overconsolidated — BUILD ⏳ N9:** P17. Adds swell index C_s and preconsolidation σ′_p.
  Relation (when σ′₀ + Δσ > σ′_p): S = (H ÷ (1 + e₀))(C_s log(σ′_p ÷ σ′₀) + C_c log((σ′₀ + Δσ) ÷ σ′_p)).
  Example: C_s = 0.05, σ′_p = 120 kPa, same layer → 0.0185 + 0.0423 = 0.061 m.
- **~time-rate — BUILD:** `functionGraph` (U against T_v, the U < 60% parabola). Values c_v,
  drainage path H_dr (H ÷ 2 for double drainage), U, T_v, t. Relations: T_v = (π ÷ 4)U² (U ≤ 60%);
  t = T_vH_dr² ÷ c_v. Example: 2 m²/yr, 4 m layer drained both sides (H_dr = 2 m), U = 50% →
  T_v = 0.197, t = 0.394 yr.
- **Verdict:** 4 pages.

#### soil-mechanics#3 — Shear strength

| Question type                                         | Page          | Mark   |
| ----------------------------------------------------- | ------------- | ------ |
| σ′₁ at failure in a drained triaxial test             | main          | Solves |
| failure plane angle                                   | main          | Solves |
| c′ and φ′ from two direct shear tests                 | ~direct-shear | Solves |
| undrained shear strength from a UU test               | ~undrained    | Solves |

- **Main — BUILD ⏳ P18:** **P18** `mohrCircle` (circle from σ′₃ to σ′₁, the failure envelope
  touching it, the failure plane angle). Values c′, φ′, σ′₃, σ′₁, deviator stress, plane angle θ.
  Relations: σ′₁ = σ′₃ tan²(45° + φ′ ÷ 2) + 2c′ tan(45° + φ′ ÷ 2); θ = 45° + φ′ ÷ 2. Assumptions:
  Mohr–Coulomb failure; drained, so effective stresses; θ from the major principal plane.
  Example: c′ = 0, φ′ = 30°, σ′₃ = 100 kPa → σ′₁ = 300 kPa, deviator 200 kPa, θ = 60°.
  startWith c′, φ′, σ′₃.
- **~direct-shear — BUILD:** `linearFunction` (τ against σ′ through the two test points; intercept
  c′, slope tan φ′). Values σ₁, τ₁, σ₂, τ₂, φ′, c′. Example: (50, 40) and (150, 98) kPa →
  tan φ′ = 0.58, φ′ = 30.1°, c′ = 11.0 kPa.
- **~undrained — BUILD:** P18 with a flat envelope. Values σ₃, σ₁ at failure, s_u. Relation:
  s_u = (σ₁ − σ₃) ÷ 2. Example: 60 and 180 kPa → 60 kPa.
- **Verdict:** 3 pages.

#### soil-mechanics#4 — Bearing capacity

| Question type                                          | Page      | Mark   |
| ------------------------------------------------------ | --------- | ------ |
| ultimate and allowable bearing of a strip footing      | main      | Solves |
| bearing factors from φ′                                | main      | Solves |
| square footing (shape factors)                         | ~square   | Solves |

- **Main — BUILD ⏳ P17:** P17 `footing` (width B at depth D_f, the failure wedges, q at the base).
  Values φ′, c′, γ, B, D_f, N_q, N_c, N_γ, q_u, q_all (FS fixed 3 in the use line, or a value: 10
  with FS, so FS stays an assumption). Relations: N_q = e^(π tan φ′) tan²(45° + φ′ ÷ 2);
  N_c = (N_q − 1) cot φ′; N_γ = 2(N_q + 1) tan φ′; q_u = c′N_c + γD_fN_q + ½γBN_γ; q_all = q_u ÷ 3.
  Assumptions: general shear failure; the factors are the Reissner–Prandtl and Vesic forms most
  current texts tabulate (Terzaghi's own table differs slightly); no water table near the base.
  Example: φ′ = 30°, c′ = 0, 18 kN/m³, B = 2 m, D_f = 1.5 m → N_q = 18.40, N_c = 30.14,
  N_γ = 22.40; q_u = 496.8 + 403.2 = 900 kPa; q_all = 300 kPa. startWith φ′, c′, γ, B, D_f.
- **~square — BUILD:** P17 footing plan. q_u = 1.3c′N_c + γD_fN_q + 0.4γBN_γ. Example: same soil,
  2 m square → 496.8 + 322.6 = 819.4 kPa.
- **Verdict:** 2 pages.

### 9. hydraulics-hydrology — Hydraulics & Hydrology

#### hydraulics-hydrology#0 — Open-channel flow

| Question type                                          | Page              | Mark            |
| ------------------------------------------------------ | ----------------- | --------------- |
| discharge by Manning's equation                        | main              | Solves          |
| Froude number, sub- or supercritical                   | main              | Solves          |
| normal depth for a discharge                           | main (type Q)     | Solves (⏳ N2)  |
| critical depth and specific energy                     | ~critical-depth   | Solves          |
| hydraulic jump depth and head loss                     | ~jump             | Solves          |

- **Main — BUILD ⏳ P19:** `streamChannel` with **P19** `manning` and `froude` (rectangular section to
  scale, slope drawn, Q = A × V). Values width b, depth y, Manning n, slope S, area A, hydraulic
  radius R, discharge Q, velocity V, Froude Fr. Relations: A = by; R = A ÷ (b + 2y);
  Q = (1 ÷ n)AR^(2/3)S^(1/2) (SI; 1.49 in US units, need N1); V = Q ÷ A; Fr = V ÷ √(gy).
  Assumptions: uniform steady flow (depth is normal depth); rectangular channel; Fr < 1 is
  subcritical. Example: 3 m, 1.2 m, 0.015, 0.001 → A = 3.6 m², R = 0.667 m, Q = 5.79 m³/s,
  V = 1.61 m/s, Fr = 0.47. Typing Q first finds y by trial. startWith b, n, S, y.
- **~critical-depth — BUILD:** P19 `specificEnergy` (E against y, the minimum at y_c). Values Q, b,
  unit discharge q, y_c, E_min, y, E. Relations: y_c = (q² ÷ g)^(1/3); E_min = 1.5y_c;
  E = y + q² ÷ (2gy²). Example: 5.79 m³/s, 3 m → q = 1.93 m²/s, y_c = 0.724 m, E_min = 1.086 m;
  at y = 1.2 m, E = 1.332 m.
- **~jump — BUILD:** P19 `jump` (y₁, the roller, y₂). Values y₁, V₁, Fr₁, y₂, head loss h_L.
  Relations: y₂ = (y₁ ÷ 2)(√(1 + 8Fr₁²) − 1); h_L = (y₂ − y₁)³ ÷ (4y₁y₂). Example: 0.3 m at
  6 m/s → Fr₁ = 3.50, y₂ = 1.34 m, h_L = 0.70 m.
- **Verdict:** 3 pages.

#### hydraulics-hydrology#1 — Pipe networks

| Question type                                          | Page            | Mark            |
| ------------------------------------------------------ | --------------- | --------------- |
| head loss by Darcy–Weisbach with a friction factor     | main            | Solves          |
| head loss by Hazen–Williams                            | ~hazen-williams | Solves          |
| flow split between two parallel pipes                  | ~parallel       | Solves          |
| one Hardy Cross correction of a loop                   | ~hardy-cross    | Solves (⏳ P20) |

- **Main — BUILD ⏳ P20:** **P20** `pipeNetwork` single pipe with the energy and hydraulic grade
  lines. Values D, L, Q, roughness ε, V, Reynolds Re, friction factor f, head loss h_f. Relations:
  V = Q ÷ (πD² ÷ 4); Re = VD ÷ ν; f = 0.25 ÷ [log(ε ÷ (3.7D) + 5.74 ÷ Re^0.9)]² (Swamee–Jain,
  explicit, within 1% of Colebrook); h_f = f(L ÷ D)V² ÷ (2g). Assumptions: turbulent flow
  (Re > 4000); water at 20 °C, ν = 1.0 × 10⁻⁶ m²/s; minor losses ignored. Example: 0.3 m, 500 m,
  0.1 m³/s, steel ε = 0.045 mm → V = 1.415 m/s, Re = 4.24 × 10⁵, f = 0.0153, h_f = 2.60 m.
  startWith D, L, Q, ε.
- **~hazen-williams — BUILD:** P20. Values Q, D, L, C, h_f. Relation (SI):
  h_f = 10.67LQ^1.852 ÷ (C^1.852D^4.87). Example: 0.1 m³/s, 0.3 m, 500 m, C = 130 → 3.21 m.
- **~parallel — BUILD:** P20 two pipes between nodes. Values total Q, D₁, L₁, D₂, L₂, C, Q₁, Q₂,
  common h_f. Relations: Q₁ + Q₂ = Q; equal h_f by Hazen–Williams. Example: 0.15 m³/s, 0.3 m ×
  500 m and 0.2 m × 400 m, C = 130 → Q₁ = 0.1080, Q₂ = 0.0420 m³/s, h_f = 3.70 m (by the solver; ⏳ N2 shows it).
- **~hardy-cross — BUILD ⏳ P20:** P20 loop of four pipes. Values pipe constants K₁–K₄ (h_f = KQ²,
  Darcy with fixed f), assumed flows Q₁–Q₄ (signed, + clockwise), correction ΔQ (9 values; Σh_f and
  Σ2h_f ÷ Q are step lines). Relation: ΔQ = −Σh_f ÷ Σ(2h_f ÷ Q). One iteration is the page. Example:
  K = 200, 300, 200, 400; Q = +0.06, +0.03, −0.02, −0.04 m³/s → h_f = 0.72, 0.27, −0.08, −0.64 m,
  Σh_f = 0.27 m, Σ(2h_f ÷ Q) = 82 → ΔQ = −0.00329 m³/s; new flows 0.0567, 0.0267, −0.0233, −0.0433.
- **Verdict:** 4 pages.

#### hydraulics-hydrology#2 — Rainfall–runoff

| Question type                                         | Page          | Mark   |
| ----------------------------------------------------- | ------------- | ------ |
| runoff depth by the NRCS curve number                 | main          | Solves |
| peak flow by the rational method                      | ~rational     | Solves |
| time of concentration (Kirpich)                       | ~kirpich      | Solves |
| unit hydrograph convolution                           | —             | No (⏳ N7, a table of ordinates) |

- **Main — BUILD ⏳ P21:** **P21** `hydrograph` `split` (rain depth P cut into initial abstraction,
  infiltration and runoff bars). Values curve number CN (30–98), storage S, initial abstraction
  I_a, rainfall P, runoff Q. Relations: S = 1000 ÷ CN − 10 (inches); I_a = 0.2S;
  Q = (P − I_a)² ÷ (P + 0.8S) when P > I_a. Assumptions: US units, as NRCS TR-55 publishes it;
  antecedent moisture average; the 0.2 ratio of the method. Example: CN 80 → S = 2.5 in, I_a = 0.5 in;
  P = 4 in → Q = 2.04 in. startWith CN, P.
- **~rational — BUILD:** P21 rain bar over a watershed outline. Values C, intensity i (mm/h), area A
  (ha), Q (m³/s). Relation: Q = CiA ÷ 360. Example: 0.6, 50 mm/h, 20 ha → 1.667 m³/s.
- **~kirpich — BUILD:** `none`. Values length L (ft), slope S, t_c (min). Relation:
  t_c = 0.0078L^0.77S^(−0.385). Example: 3000 ft, 0.02 → 16.7 min.
- **Verdict:** 3 pages.

#### hydraulics-hydrology#3 — Stormwater design

| Question type                                           | Page         | Mark   |
| ------------------------------------------------------- | ------------ | ------ |
| storm sewer diameter flowing full (Manning)             | main         | Solves |
| detention volume from inflow and allowed outflow peaks  | ~detention   | Solves |
| order of the design steps                               | ~design-steps| Solves |

- **Main — BUILD ⏳ P20:** P20 pipe in section, full. Values Q, n, slope S, D (computed), next
  standard size (allowed list in mm, N4). Relation: D = (3.208Qn ÷ √S)^(3/8) (SI, full flow).
  Assumptions: full but not surcharged; round up to the next manufactured size; check the full
  velocity stays above about 0.9 m/s so solids keep moving. Example: 1.667 m³/s, 0.013, 0.005 →
  D = 0.994 m → 1050 mm. startWith Q, n, S.
- **~detention — BUILD ⏳ P21:** P21 `detention` (triangular inflow and outflow hydrographs, the
  storage between them shaded). Values inflow peak Q_i, outflow peak Q_o, base time t_b, storage V.
  Relation: V = ½t_b(Q_i − Q_o). Example: 3 and 1.2 m³/s over 2 h → 6480 m³.
- **~design-steps — BUILD (sequence):** delineate the drainage area; find the time of
  concentration; read the design intensity for that duration from the IDF curve; compute the peak
  flow; size each pipe; check full-flow velocity; route the flow through detention.
- **Verdict:** 3 pages.

### 10. transportation — Transportation Engineering

#### transportation#0 — Traffic flow

| Question type                                         | Page        | Mark   |
| ----------------------------------------------------- | ----------- | ------ |
| speed and flow at a density (Greenshields)            | main        | Solves |
| capacity and the density at capacity                  | main        | Solves |
| shock wave speed at a queue                           | ~shockwave  | Solves |
| headway and spacing                                   | ~headway    | Solves |

- **Main — BUILD:** `functionGraph` quadratic (flow q against density k, vertex at capacity, the
  current point; the chord from the origin has slope v). Values free-flow speed v_f, jam density
  k_j, density k, speed v, flow q, capacity q_max. Relations: v = v_f(1 − k ÷ k_j); q = kv;
  q_max = v_fk_j ÷ 4. Assumptions: Greenshields' straight-line speed–density model; one lane or
  per lane; uncongested when k < k_j ÷ 2. Example: 100 km/h, 120 veh/km, k = 40 → v = 66.7 km/h,
  q = 2667 veh/h, q_max = 3000 veh/h at 60 veh/km. startWith v_f, k_j, k.
- **~shockwave — BUILD:** the same graph with two points and the chord between them. Values k₁, q₁,
  k₂, q₂, wave speed u_w. Relation: u_w = (q₂ − q₁) ÷ (k₂ − k₁). Example: 40 veh/km at 2667 veh/h
  meets a queue at 100 veh/km and 1667 veh/h → u_w = −16.7 km/h (the back of the queue moves upstream).
- **~headway — BUILD:** equation `{h:unit} = 3600 ÷ {q:unit}`, then spacing = 1000 ÷ k in a second
  row. Example: 2667 veh/h → h = 1.35 s; 40 veh/km → 25 m.
- **Verdict:** 3 pages.

#### transportation#1 — Geometric design

| Question type                                          | Page              | Mark   |
| ------------------------------------------------------ | ----------------- | ------ |
| stopping sight distance at a design speed and grade    | main              | Solves |
| minimum radius of a horizontal curve                   | ~horizontal-curve | Solves |
| curve length and tangent from R and Δ                  | ~curve-elements   | Solves |
| length of a crest vertical curve for SSD               | ~crest-curve      | Solves (⏳ N9) |

- **Main — BUILD ⏳ P22:** **P22** `roadCurve` stopping (reaction strip, then braking strip, the
  object ahead). Values speed V (km/h), reaction time t (s), deceleration a (m/s²), grade G,
  reaction distance, braking distance, SSD. Relations: reaction = 0.278Vt;
  braking = V² ÷ (254(a ÷ 9.81 ± G)); SSD = reaction + braking. Assumptions: AASHTO 2018 values
  t = 2.5 s and a = 3.4 m/s²; G is + uphill; V in km/h gives meters. Example: 80 km/h, level →
  55.6 + 72.7 = 128.3 m (the published table rounds to 130 m). startWith V, t, a, G.
- **~horizontal-curve — BUILD ⏳ P22:** P22 plan with superelevation. Values V, e, f, R_min.
  Relation: R_min = V² ÷ (127(e + f)). Example: 100 km/h, 0.08, 0.12 → 394 m.
- **~curve-elements — BUILD ⏳ P22:** P22 plan (PC, PI, PT). Values R, Δ, length L, tangent T,
  external E. Relations: L = RΔπ ÷ 180; T = R tan(Δ ÷ 2); E = R(1 ÷ cos(Δ ÷ 2) − 1). Example: 400 m,
  30° → 209.4 m, 107.2 m, 14.1 m.
- **~crest-curve — BUILD ⏳ P22, N9:** P22 profile (two grades, the curve, the sight line).
  Values G₁, G₂, A = |G₁ − G₂| (%), S, L. Relations: L = AS² ÷ 658 when S < L; L = 2S − 658 ÷ A
  when S > L. Example: +3% to −2%, SSD 183.1 m (100 km/h) → L = 254.7 m (> S, first case holds).
- **Verdict:** 4 pages.

#### transportation#2 — Pavement design

| Question type                                         | Page    | Mark   |
| ----------------------------------------------------- | ------- | ------ |
| structural number of a flexible pavement              | main    | Solves |
| ESALs from an axle load (fourth-power law)            | ~esal   | Solves |
| layer thickness for a required SN                     | main    | Solves |

- **Main — BUILD ⏳ P17:** P17 `pavement` (surface, base, subbase to scale, each with a and m).
  Values a₁, D₁, a₂, D₂, m₂, a₃, D₃, m₃, SN. Relation: SN = a₁D₁ + a₂D₂m₂ + a₃D₃m₃. Assumptions:
  AASHTO 1993 method, thicknesses in inches; the required SN comes from the design chart for the
  ESALs and the subgrade (not on this page); m reflects drainage. Example: 0.44 × 4 + 0.14 × 8 × 1.0
  + 0.11 × 10 × 0.9 = 1.76 + 1.12 + 0.99 = 3.87. Typing SN finds D₃. startWith a's, m's, D₁, D₂, D₃.
- **~esal — BUILD:** `bars` (load equivalency per truck, total). Values axle load P (kN), standard
  80 kN, LEF, trucks per day, years, ESAL. Relations: LEF = (P ÷ 80)⁴; ESAL = LEF × trucks × 365 ×
  years. Assumptions: a single axle; no traffic growth; the fourth-power rule is an approximation of
  the AASHO road test. Example: 100 kN → 2.44; 500 a day for 20 years → 8.91 million.
- **Verdict:** 2 pages.

#### transportation#3 — Capacity analysis

| Question type                                          | Page       | Mark            |
| ------------------------------------------------------ | ---------- | --------------- |
| flow rate in passenger cars, density, level of service | main       | Solves (⏳ N5)  |
| heavy-vehicle factor                                   | main       | Solves          |
| optimum signal cycle (Webster)                         | ~webster   | Solves          |

- **Main — BUILD ⏳ P23, N5:** **P23** `losScale` (density bar with A–F bands, the segment marked).
  Values hourly volume V (veh/h), peak-hour factor PHF, lanes N, truck share P_T, truck equivalent
  E_T, f_HV, flow rate v_p (pc/h/ln), speed S (mi/h), density D, LOS. Relations:
  f_HV = 1 ÷ (1 + P_T(E_T − 1)); v_p = V ÷ (PHF × N × f_HV); D = v_p ÷ S; LOS by D (A ≤ 11,
  B ≤ 18, C ≤ 26, D ≤ 35, E ≤ 45 pc/mi/ln). Assumptions: HCM 7th edition basic freeway segment;
  S read from the speed–flow curve, typed here; US units as the manual uses. Example: 4000 veh/h,
  0.92, 3 lanes, 10% trucks, E_T = 2 → f_HV = 0.909, v_p = 1594 pc/h/ln, S = 70 mi/h → D = 22.8 →
  LOS C. startWith V, PHF, N, P_T, E_T, S. (10 values.)
- **~webster — BUILD:** `bars` (cycle split into lost time and green for each phase). Values lost
  time L, sum of critical flow ratios Y, cycle C₀. Relation: C₀ = (1.5L + 5) ÷ (1 − Y). Example:
  12 s, 0.6 → 57.5 s.
- **Verdict:** 2 pages.

### 11. steel-design — Steel Design (AISC 360-22, US units)

#### steel-design#0 — LRFD

| Question type                                          | Page        | Mark            |
| ------------------------------------------------------ | ----------- | --------------- |
| governing factored load from D, L, S                   | main        | Solves (⏳ N5)  |
| design strength φR_n against R_u; ASD R_n ÷ Ω          | ~phi-omega  | Solves          |
| dead, live or environmental load                       | ~load-types | Solves          |

- **Main — BUILD ⏳ N5:** `bars` (one bar per combination, the largest ringed). Values dead D,
  live L, snow S, 1.4D, 1.2D + 1.6L + 0.5S, 1.2D + 1.6S + L, U (the largest). Relations: the three
  ASCE 7-22 combinations; U = max. Assumptions: no wind or seismic here; roof live load not
  combined with snow. Example: D = 20, L = 30, S = 10 kips → 28, 77, 70 → U = 77 kips.
  startWith D, L, S.
- **~phi-omega — BUILD:** `bars` (R_n, φR_n, R_n ÷ Ω side by side). Values R_n, φ, Ω, φR_n, R_n ÷ Ω.
  Example: 100 kips, yielding (φ = 0.90, Ω = 1.67) → 90 and 59.9 kips.
- **~load-types — BUILD (sort):** bins "Dead (D)", "Live (L)", "Environmental (S, W, E)". Cards:
  steel beam self-weight; concrete floor slab; roofing membrane; office occupants; movable
  furniture; cars in a parking garage; roof snow; wind on a wall; earthquake shaking.
- **Verdict:** 3 pages.

#### steel-design#1 — Tension and compression members

| Question type                                          | Page       | Mark            |
| ------------------------------------------------------ | ---------- | --------------- |
| column design strength φP_n (W-shape, KL)              | main       | Solves (⏳ N4, N9) |
| tension member: yielding against rupture               | ~tension   | Solves (⏳ N9)  |
| slenderness limit KL ÷ r ≤ 200                         | main       | Solves          |

- **Main — BUILD ⏳ P7, N4, N9:** P7 `column` with P6 `section` W-shape inset. Values shape
  (allowed rows: W10×49, W12×65, W14×90, setting A_g and r_y), A_g, r_y, KL (ft), F_y, KL ÷ r,
  F_e, F_cr, φP_n. Relations: F_e = π²E ÷ (KL ÷ r)²; F_cr = 0.658^(F_y ÷ F_e)F_y when
  KL ÷ r ≤ 4.71√(E ÷ F_y), else 0.877F_e; φP_n = 0.90F_crA_g. Assumptions: E = 29,000 ksi; the
  weak axis governs; no slender elements. Example: W10×49 (A_g = 14.4 in², r_y = 2.54 in),
  KL = 15 ft = 180 in, F_y = 50 ksi → KL/r = 70.9 ≤ 113.4, F_e = 57.0 ksi, F_cr = 34.6 ksi,
  φP_n = 449 kips. startWith shape, KL, F_y.
- **~tension — BUILD ⏳ P24, N9:** **P24** `connection` plate with a bolt row and the net
  section. Values gross area A_g, holes, hole size, net A_n, U, A_e, F_y, F_u, φP_n. Relations:
  A_n = A_g − holes × size × t; A_e = UA_n; φP_n = min(0.90F_yA_g, 0.75F_uA_e). Example: 6 in ×
  ½ in A36 plate (F_y = 36, F_u = 58 ksi), 2 holes of 1 in → A_n = 2.0 in², U = 1 → yielding
  97.2, rupture 87.0 → 87.0 kips.
- **Verdict:** 2 pages.

#### steel-design#2 — Beams

| Question type                                           | Page        | Mark   |
| ------------------------------------------------------- | ----------- | ------ |
| plastic moment strength of a braced compact beam        | main        | Solves (⏳ N4) |
| L_p and whether lateral bracing is close enough         | main        | Solves |
| live-load deflection against L ÷ 360                    | ~deflection | Solves |
| shear strength of a rolled W-shape                      | ~shear      | Solves |

- **Main — BUILD ⏳ P14, N4:** P14 beam with uniform load, P6 W-shape inset. Values shape (W18×50,
  W21×44, W16×40 rows set Z_x, r_y), Z_x, F_y, φM_p (kip·ft), L_p (ft), w_u, span L, M_u.
  Relations: φM_p = 0.90F_yZ_x; L_p = 1.76r_y√(E ÷ F_y); M_u = w_uL² ÷ 8. Assumptions: compact
  section; unbraced length L_b ≤ L_p (else lateral–torsional buckling lowers φM_n, not this page).
  Example: W18×50 (Z_x = 101 in³, r_y = 1.65 in), 50 ksi → φM_p = 378.8 kip·ft, L_p = 5.83 ft;
  w_u = 1.2(1.0) + 1.6(1.5) = 3.6 kip/ft, 25 ft → M_u = 281.3 kip·ft ≤ 378.8, adequate.
- **~deflection — BUILD:** P14 deflected shape. Values w (service live), L, E, I_x, Δ, L ÷ 360.
  Relation: Δ = 5wL⁴ ÷ (384EI). Example: 1.5 kip/ft, 25 ft, I_x = 800 in⁴ → 0.568 in ≤ 0.833 in.
- **~shear — BUILD:** P6 W-shape web lit. Values d, t_w, A_w, F_y, φV_n. Relation:
  φV_n = 1.0 × 0.6F_yA_w (rolled I-shapes with h ÷ t_w ≤ 2.24√(E ÷ F_y)). Example: W18×50,
  18.0 × 0.355 = 6.39 in² → 191.7 kips.
- **Verdict:** 3 pages.

#### steel-design#3 — Connections

| Question type                                         | Page         | Mark            |
| ----------------------------------------------------- | ------------ | --------------- |
| bolt group in single shear                            | main         | Solves          |
| fillet weld strength per inch and total               | ~weld        | Solves          |
| block shear rupture                                   | ~block-shear | Solves (⏳ N9)  |

- **Main — BUILD ⏳ P24:** P24 lap splice with a bolt group. Values bolt diameter d (allowed ⅝,
  ¾, ⅞, 1 in), A_b, F_nv (allowed 54 Group A threads included, 68 excluded), bolts n, φr_n, φR_n.
  Relations: A_b = πd² ÷ 4; φr_n = 0.75F_nvA_b; φR_n = nφr_n. Assumptions: single shear plane;
  bearing at the holes checked separately; standard holes. Example: ¾ in, 54 ksi → A_b = 0.442 in²,
  17.9 kips a bolt, 4 bolts → 71.6 kips. startWith d, F_nv, n.
- **~weld — BUILD:** P24 `weld`. Values leg w, E70 electrode F_EXX, length L, throat 0.707w,
  φR_n per inch, φR_n. Relation: φR_n = 0.75 × 0.6F_EXX × 0.707w × L. Example: ¼ in, 70 ksi,
  two 10 in welds → 5.57 kip/in, 111.4 kips.
- **~block-shear — BUILD ⏳ N9:** P24 `blockShear` path. Values A_gv, A_nv, A_nt, F_y, F_u, U_bs,
  φR_n. Relation: φR_n = 0.75 × min(0.6F_uA_nv + U_bsF_uA_nt, 0.6F_yA_gv + U_bsF_uA_nt). Example:
  A_gv = 3.0, A_nv = 2.25, A_nt = 0.75 in², A36, U_bs = 1 → 0.75 × min(78.3 + 43.5, 64.8 + 43.5)
  = 0.75 × 108.3 = 81.2 kips.
- **Verdict:** 3 pages.

### 12. concrete-design — Reinforced Concrete Design (ACI 318-19, US units)

#### concrete-design#0 — Flexure

| Question type                                          | Page        | Mark            |
| ------------------------------------------------------ | ----------- | --------------- |
| φM_n of a singly reinforced rectangular beam           | main        | Solves          |
| tension-controlled check (ε_t ≥ 0.005)                 | main        | Solves (⏳ N5)  |
| minimum steel                                          | ~min-steel  | Solves (⏳ N9)  |
| steel needed for a factored moment                     | main (type φM_n) | Solves (⏳ N3) |

- **Main — BUILD ⏳ P6, N4:** **P6** `section` rectangular beam with bars and `whitney` (the
  0.85f′_c block of depth a, the strain line from 0.003 to ε_t). Values b, d, bars (allowed #3–#11
  with count, setting A_s), A_s, f′_c, f_y, a, c, ε_t, φM_n. Relations: a = A_sf_y ÷ (0.85f′_cb);
  c = a ÷ β₁ (β₁ = 0.85 up to 4000 psi); ε_t = 0.003(d − c) ÷ c; φM_n = 0.9A_sf_y(d − a ÷ 2).
  Assumptions: plane sections stay plane; concrete crushes at 0.003; steel has yielded; φ = 0.9
  only when ε_t ≥ 0.005. Example: 12 in × d = 20 in, 3 #8 (2.37 in²), 4000 psi, 60 ksi →
  a = 3.49 in, c = 4.10 in, ε_t = 0.0116, M_n = 216.3 kip·ft, φM_n = 194.7 kip·ft.
  startWith b, d, A_s, f′_c, f_y.
- **~min-steel — BUILD ⏳ N9:** P6 section. Values f′_c, f_y, b, d, A_s,min. Relation:
  A_s,min = max(3√f′_c, 200) × bd ÷ f_y (psi). Example: 4000 psi, 60,000 psi, 12 × 20 in →
  max(189.7, 200) → 0.80 in².
- **Verdict:** 2 pages.

#### concrete-design#1 — Shear

| Question type                                          | Page        | Mark   |
| ------------------------------------------------------ | ----------- | ------ |
| concrete shear strength φV_c                           | main        | Solves |
| stirrup spacing for a factored shear                   | main        | Solves |
| maximum spacing d ÷ 2                                  | main        | Solves |

- **Main — BUILD ⏳ P14:** P14 beam elevation with `stirrups` and the shear diagram; P6 section
  showing the two legs. Values b_w, d, f′_c, V_c, V_u, V_s, A_v, f_yt, spacing s. Relations:
  V_c = 2λ√f′_c b_wd (λ = 1); V_s = V_u ÷ 0.75 − V_c; s = A_vf_ytd ÷ V_s, at most d ÷ 2.
  Assumptions: the simplified V_c ACI allows with at least minimum stirrups; normal-weight
  concrete; vertical stirrups. Example: 12 × 20 in, 4000 psi → V_c = 30.4 kips (φV_c = 22.8);
  V_u = 50 kips → V_s = 36.3 kips; #3 two legs (0.22 in²), 60 ksi → s = 7.27 in → use 7 in
  (≤ 10 in). startWith b_w, d, f′_c, V_u, A_v, f_yt.
- **Verdict:** 1 page.

#### concrete-design#2 — Columns

| Question type                                         | Page          | Mark            |
| ----------------------------------------------------- | ------------- | --------------- |
| maximum axial strength of a tied column               | main          | Solves          |
| spiral column                                         | ~spiral       | Solves          |
| steel ratio between 1% and 8%                         | main          | Solves          |
| short or slender (kℓ_u ÷ r ≤ 22)                      | ~slenderness  | Solves (⏳ N5)  |
| P–M interaction diagram                               | —             | No (⏳ P6 `interaction`, N9) |

- **Main — BUILD:** P6 `section` square column with bars. Values width h, A_g, bars (count and
  size, setting A_st), A_st, f′_c, f_y, ρ_g, P₀, φP_n,max. Relations: A_g = h²; P₀ = 0.85f′_c(A_g −
  A_st) + f_yA_st; φP_n,max = 0.80 × 0.65 × P₀; ρ_g = A_st ÷ A_g. Assumptions: tied column, φ = 0.65;
  the 0.80 covers a small accidental eccentricity; short column. Example: 16 in, 8 #8 (6.32 in²),
  5000 psi, 60 ksi → P₀ = 1440 kips, φP_n,max = 749 kips, ρ_g = 2.47%. startWith h, bars, f′_c, f_y.
- **~spiral — BUILD:** same section, round tie. φP_n,max = 0.85 × 0.75 × P₀. Example: same → 918 kips.
- **~slenderness — BUILD ⏳ N5:** P7 column. Values k, ℓ_u, h, r = 0.3h, kℓ_u ÷ r, result. Example:
  k = 1, 12 ft, 16 in → 144 ÷ 4.8 = 30 > 22, slender (braced frames use 34 − 12M₁ ÷ M₂ instead).
- **Verdict:** 3 pages.

#### concrete-design#3 — Slabs and footings

| Question type                                          | Page           | Mark   |
| ------------------------------------------------------ | -------------- | ------ |
| spread footing size from the allowable soil pressure   | main           | Solves |
| two-way (punching) shear check                         | main           | Solves |
| minimum thickness of a one-way slab                    | ~slab-thickness| Solves |

- **Main — BUILD ⏳ P17:** P17 `footing` plan with the critical perimeter d ÷ 2 from the column.
  Values service load P, net allowable q, side B, factored P_u, column c, depth d, b₀, V_u, φV_c
  (9). Relations: B = √(P ÷ q) rounded up; b₀ = 4(c + d); V_u = (P_u ÷ B²)(B² − (c + d)²);
  φV_c = 0.75 × 4√f′_c b₀d (f′_c fixed 4000 psi in the assumption). Assumptions: square column
  centered; interior column, so the 4√f′_c term governs; soil pressure uniform under factored
  load. Example: D = 120, L = 80 kips → 200 kips at 4 ksf → 50 ft², B = 7.25 ft; P_u = 272 kips;
  16 in column, d = 15 in → b₀ = 124 in, V_u = 237.5 kips ≤ φV_c = 352.9 kips. startWith P, q,
  P_u, c, d.
- **~slab-thickness — BUILD ⏳ N4:** P14 beam strip with supports. Values span ℓ, support case
  (allowed: simply supported ℓ ÷ 20, one end continuous ℓ ÷ 24, both ends ℓ ÷ 28, cantilever
  ℓ ÷ 10), h_min. Example: 15 ft, one end continuous → 7.5 in.
- **Verdict:** 2 pages.

### 13. environmental — Environmental Engineering

#### environmental#0 — Water treatment

| Question type                                         | Page           | Mark   |
| ----------------------------------------------------- | -------------- | ------ |
| overflow rate and detention time of a settling tank   | main           | Solves |
| settling velocity (Stokes) and fraction removed       | main           | Solves |
| CT for disinfection                                   | ~ct            | Solves |
| order of a conventional treatment plant               | ~treatment-train | Solves |

- **Main — BUILD ⏳ P25:** **P25** `settlingTank` (basin to scale, a particle's path falling at
  v_s while crossing; the removed share). Values flow Q, length, width, depth, overflow rate v₀,
  detention t, particle d, settling v_s, removal. Relations: v₀ = Q ÷ (length × width);
  t = volume ÷ Q; v_s = g(ρ_p − ρ_w)d² ÷ (18μ); removal = v_s ÷ v₀, at most 100%. Assumptions:
  ideal (Camp) basin; discrete particles that don't flocculate; ρ_p = 2650 kg/m³ (sand) and
  water at 20 °C in the relation. Example: 0.1 m³/s, 30 × 10 × 3 m → v₀ = 3.33 × 10⁻⁴ m/s
  (28.8 m/d), t = 2.5 h; 15 μm → v_s = 2.02 × 10⁻⁴ m/s → 60.7% removed (20 μm → 100%).
  startWith Q, the dimensions, d.
- **~ct — BUILD:** `bars` (C × t as a rectangle against the required CT). Values chlorine C (mg/L),
  contact time t₁₀ (min), CT, required CT. Example: 1.2 mg/L for 25 min → 30 mg·min/L.
- **~treatment-train — BUILD (sequence):** intake screens; coagulation (rapid mix); flocculation
  (slow mix); sedimentation; filtration; disinfection; storage and distribution.
- **Verdict:** 3 pages.

#### environmental#1 — Wastewater treatment

| Question type                                         | Page              | Mark   |
| ----------------------------------------------------- | ----------------- | ------ |
| BOD exerted by day t; ultimate BOD                    | main              | Solves |
| BOD from a dilution test                              | ~dilution         | Solves |
| food-to-microorganism ratio, HRT                      | ~activated-sludge | Solves |
| order of a secondary treatment plant                  | ~plant-order      | Solves |

- **Main — BUILD:** `functionGraph` exponential with `r` (BOD_t = L₀ − L₀e^(−kt): a = −L₀, r = −k,
  k = L₀; the asymptote L₀ and the day-5 point). Values L₀ (mg/L), rate k (per day), t (days), BOD_t.
  Relation: BOD_t = L₀(1 − e^(−kt)). Assumptions: first-order decay of the organic matter; k at
  20 °C, base e (a base-10 k is 2.303 times smaller). Example: 250 mg/L, 0.23 per day → BOD₅ =
  170.8 mg/L. Backward: BOD₅ = 200 mg/L at k = 0.23 gives L₀ = 292.7 mg/L. startWith L₀, k, t.
- **~dilution — BUILD:** `bars` (DO before and after). Values D₁, D₂, sample volume, bottle volume,
  fraction P, BOD. Relation: BOD = (D₁ − D₂) ÷ P. Example: 8.8 → 4.3 mg/L, 6 mL in 300 mL →
  P = 0.02, BOD = 225 mg/L.
- **~activated-sludge — BUILD ⏳ P9:** P9 `controlVolume` aeration tank. Values Q, S₀, V, MLVSS X,
  F/M, HRT. Relations: F/M = QS₀ ÷ (VX); HRT = V ÷ Q. Example: 10,000 m³/d, 200 mg/L, 3000 m³,
  2500 mg/L → F/M = 0.267 per day, HRT = 7.2 h.
- **~plant-order — BUILD (sequence):** bar screens; grit removal; primary clarifier; aeration
  basin; secondary clarifier; disinfection; discharge. (Sludge handling is a side stream, named in
  the sentence, not a stage.)
- **Verdict:** 4 pages.

#### environmental#2 — Air pollution

| Question type                                          | Page           | Mark   |
| ------------------------------------------------------ | -------------- | ------ |
| ground-level centerline concentration (Gaussian plume) | main           | Solves |
| ppm to μg/m³                                           | ~ppm           | Solves |
| overall efficiency of control devices in series        | ~control       | Solves |

- **Main — BUILD ⏳ P26:** **P26** `plume` (stack, effective height H, the plume widening, a
  receptor downwind). Values emission Q (g/s), wind u, σ_y, σ_z, H, concentration C (μg/m³).
  Relation: C = (Q ÷ (πuσ_yσ_z)) e^(−H² ÷ (2σ_z²)). Assumptions: steady wind; ground reflects the
  plume; σ_y and σ_z read from the stability-class charts at this distance (typed here; N4 could
  later offer the chart's curves). Example: 100 g/s, 5 m/s, 100 m, 50 m, 60 m → e^(−0.72) = 0.487
  → C = 620 μg/m³. startWith Q, u, σ_y, σ_z, H.
- **~ppm — BUILD:** `none`. Values ppm, molar mass M, μg/m³. Relation: μg/m³ = ppm × M × 1000 ÷
  24.45 (25 °C, 1 atm). Example: SO₂ 0.075 ppm → 196.5 μg/m³.
- **~control — BUILD:** `bars` (what each device lets through). Values η₁, η₂, overall η. Relation:
  η = 1 − (1 − η₁)(1 − η₂). Example: 90% then 80% → 98%.
- **Verdict:** 3 pages.

#### environmental#3 — Solid waste

| Question type                                          | Page        | Mark   |
| ------------------------------------------------------ | ----------- | ------ |
| landfill volume a year and the life of a site          | main        | Solves |
| area needed for a depth                                | main        | Solves |
| waste hierarchy order                                  | ~hierarchy  | Solves |
| heating value of mixed waste                           | ~heating-value | Solves |

- **Main — BUILD:** `reserve` (the site as a bar cut into each year's volume). Values population,
  rate (kg per person per day), compacted density (kg/m³), cover ratio, volume a year, capacity,
  life (years). Relations: volume = population × rate × 365 ÷ density × (1 + cover); life =
  capacity ÷ volume. Assumptions: steady population and rate; cover soil as a share of the waste
  volume. Example: 50,000 people, 2.0 kg/d, 600 kg/m³, 0.25 → 76,042 m³ a year; a 1.52 × 10⁶ m³
  site lasts 20 years (7.6 ha at 20 m deep). startWith population, rate, density, cover, capacity.
- **~hierarchy — BUILD (sequence):** most to least preferred: reduce at the source; reuse;
  recycle and compost; recover energy; landfill.
- **~heating-value — BUILD:** `pieChart` (mass shares) beside `bars` (energy shares). Values shares
  of paper, plastic, food waste (rest inert), their heating values, mix HV. Relation:
  HV = Σ share × HV_i. Example: 40% paper at 16 MJ/kg, 15% plastic at 33, 25% food at 5, 20% inert
  → 6.4 + 4.95 + 1.25 = 12.6 MJ/kg.
- **Verdict:** 3 pages.

### 14. surveying — Surveying (prereq right-triangle trigonometry)

#### surveying#0 — Distance and angle measurement

| Question type                                         | Page             | Mark            |
| ----------------------------------------------------- | ---------------- | --------------- |
| horizontal and vertical distance from a slope reading | main             | Solves (⏳ N6)  |
| temperature correction of a steel tape                | ~tape            | Solves          |
| interior angle sum and misclosure of a polygon        | ~angle-closure   | Solves (⏳ N6)  |

- **Main — BUILD:** `triangleSolver` right triangle (slope distance as hypotenuse, vertical angle
  at the instrument). Values slope distance S, vertical angle α (degrees, minutes, seconds, N6),
  horizontal H, vertical V. Relations: H = S cos α; V = S sin α. Assumptions: α from horizontal
  (a zenith angle z gives α = 90° − z); instrument and target heights equal. Example: 245.30 m at
  4°30′00″ → H = 244.54 m, V = 19.25 m. startWith S, α.
- **~tape — BUILD:** `none`. Values measured length, coefficient α (fixed 11.6 × 10⁻⁶ per °C),
  field T, standard T (20 °C), correction, corrected length. Relation: C_t = αL(T − T_s). Example:
  182.45 m at 32 °C → +0.0254 m → 182.475 m.
- **~angle-closure — BUILD ⏳ N6:** P27 polygon. Values sides n, measured sum, required sum,
  misclosure, correction per angle. Relations: required = (n − 2) × 180°; correction =
  −misclosure ÷ n. Example: 5 sides, measured 540°00′25″ → required 540°, −5″ each.
- **Verdict:** 3 pages.

#### surveying#1 — Leveling

| Question type                                           | Page        | Mark   |
| ------------------------------------------------------- | ----------- | ------ |
| elevation by differential leveling (two setups)         | main        | Solves |
| arithmetic check ΣBS − ΣFS                              | main        | Solves |
| curvature and refraction over a long sight              | ~curvature  | Solves |
| trigonometric leveling                                  | ~trig       | Solves |

- **Main — BUILD ⏳ P28:** **P28** `levelRun` (two setups, rods at BM, TP1 and B; HI lines).
  Values BM elevation, BS₁, FS₁, TP1 elevation, BS₂, FS₂, HI₁, HI₂, B elevation (9). Relations:
  HI = elevation + BS; elevation = HI − FS. Assumptions: backsight and foresight distances
  balanced, so curvature, refraction and collimation errors cancel. Example: 100.000 m; BS 1.245,
  FS 2.110 → TP1 99.135 m; BS 0.876, FS 1.532 → B 98.479 m; check 2.121 − 3.642 = −1.521 m.
  startWith BM, BS₁, FS₁, BS₂, FS₂.
- **~curvature — BUILD:** P28 one long sight with the level line and Earth's curve. Values
  distance K (km), correction h (m). Relation: h = 0.0675K². Example: 2 km → 0.270 m.
- **~trig — BUILD:** `triangleSolver` with instrument and rod heights. Values S, α, instrument
  height h_i, target height h_r, ΔElev. Relation: ΔElev = S sin α + h_i − h_r. Example: 245.30 m,
  4°30′, 1.55 m, 1.80 m → 19.00 m.
- **Verdict:** 3 pages.

#### surveying#2 — Traverse computations

| Question type                                         | Page          | Mark            |
| ----------------------------------------------------- | ------------- | --------------- |
| latitude and departure of a course                    | main          | Solves (⏳ N6)  |
| linear misclosure and relative precision              | ~closure      | Solves          |
| compass-rule correction of one course                 | ~compass-rule | Solves          |
| area from coordinates                                 | ~area         | Solves          |

- **Main — BUILD ⏳ P27:** **P27** `traverse` one course lit, its north and east components drawn.
  Values azimuth (or bearing, N6), length L, latitude, departure. Relations: lat = L cos(azimuth);
  dep = L sin(azimuth). Assumptions: azimuth clockwise from north; north and east are +. Example:
  52°00′, 120.00 m → lat = 73.88 m, dep = 94.56 m. startWith azimuth, L.
- **~closure — BUILD ⏳ P27:** P27 traverse with the gap drawn. Values Σlat, Σdep, perimeter P,
  linear misclosure, precision 1 : x. Relations: e = √(Σlat² + Σdep²); x = P ÷ e. Example: +0.08,
  −0.06 m, 850 m → 0.10 m, 1 : 8500.
- **~compass-rule — BUILD:** P27. Values Σlat, Σdep, course length, P, corrections. Relations:
  c_lat = −Σlat × L ÷ P; c_dep = −Σdep × L ÷ P. Example: course 120 m → −0.0113 m and +0.0085 m.
- **~area — BUILD:** `coordinatePlane` `polygon` (four corners, the shoelace sum). Values x₁…y₄ (8),
  area. Relation: area = ½|Σ(x_iy_{i+1} − x_{i+1}y_i)|. Example: (0, 0), (100, 0), (120, 80),
  (10, 90) m → 9000 m².
- **Verdict:** 4 pages.

#### surveying#3 — GNSS

| Question type                                          | Page          | Mark   |
| ------------------------------------------------------ | ------------- | ------ |
| orthometric height from ellipsoid height and geoid     | main          | Solves |
| range from signal travel time; a clock error's effect  | ~pseudorange  | Solves |
| expected position error from DOP                       | ~dop          | Solves |
| which error source is which                            | ~errors       | Solves |

- **Main — BUILD ⏳ P29:** equation `{H:unit} = {h:unit} − {N:unit}`; **P29** `geoid` (terrain,
  geoid and ellipsoid curves, h, N and H at the point). Assumptions: h is what GNSS measures; N
  comes from a geoid model (negative across most of the US); H is the height above mean sea
  level surveyors use. Example: h = 45.320 m, N = −28.750 m → H = 74.070 m. startWith h, N.
- **~pseudorange — BUILD:** `none`. Values travel time Δt, c (fixed), range ρ, clock error δt,
  range error. Relations: ρ = cΔt; error = cδt. Example: 0.0723 s → 21,675 km; 1 μs → 300 m.
- **~dop — BUILD:** `bars`. Values PDOP, range error σ, position error. Relation: error = PDOP × σ.
  Example: 2.1 × 3 m = 6.3 m.
- **~errors — BUILD (sort):** bins "Satellite", "Signal path", "Receiver". Cards: satellite clock
  drift; broadcast orbit (ephemeris) error; ionospheric delay; tropospheric delay; receiver clock
  offset; receiver noise.
- **Verdict:** 4 pages.

