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
- **Layouts (24 pages).** Sorts 15, sequences 7, explores 2, listed in each block. One main page
  is a layout: `process-design#0` (the design hierarchy, a sequence). Most sequences here are an
  order with no time spans (N11). Everything else is a calculator.
- **Equation inputs.** Two pages take an `equation`: `surveying#3` (`{H:unit} = {h:unit} − {N:unit}`)
  and `transportation#0~headway` (`{h:unit} = 3600 ÷ {q:unit}`); every other page keeps rows
  (units change, several steps).
- **Shared kinds with `docs/plans/he.mechanical.md`.** The prerequisite courses (Statics,
  Mechanics of Materials, Fluid Mechanics, Thermodynamics, Heat Transfer) are planned there. Build
  one kind for both plans: P14 `beam` = HE-mechanical-P1; P15 `truss` = P2; P6 `section` = P3;
  P18 `mohrCircle` = P4 `stressElement` (its Mohr mode); P10 `propertyDiagram` = P10; P20
  `pipeNetwork` = P12 `fluidSystem`; P31 `temperature` mode = P14 `thermalWall`; P35
  `exchangerProfile` = P15 `heatExchanger`; P4 `freeBody` options join P27; the S–N page may use
  P17 `fatigueDiagram` instead of P37. Engine needs overlap the same way: N1 = E1, N2 = E6,
  N3 = E4, N4 (steam rows) = E5, N8 = E7, the 2 × 2 solves = E8. Whichever plan is built first
  owns the kind; the other adds its options.
- **Page count:** 85 topic pages + 169 problem types = **254 pages** (230 calculators, 24
  layouts); 102 wait on an engine or picture need (marked ⏳), most of them on a new picture kind.
  Picture ids below are `HE-aero-civil-chemical-Pn`, written **Pn** in the blocks; engine needs
  are **Nn** (part 4).

## Aerospace

Textbooks for the field (part 4 lists licences): Leishman, _Introduction to Aerospace Flight
Vehicles_ (ERAU, CC BY-NC-ND); MIT OCW 16.01–16.04 Unified Engineering, 16.100, 16.120,
16.333, 16.20, 16.50, 16.512, 16.346 (CC BY-NC-SA); NASA Glenn _Beginner's Guide to
Aeronautics_ and NACA Report 1135 (public domain); Bar-Meir, _Fundamentals of Compressible Fluid
Mechanics_ (GNU FDL); JPL _Basics of Space Flight_ (public). Reference only.

### 1. aerodynamics — Aerodynamics (prereq Fluid Mechanics)

#### aerodynamics#0 — Airfoil theory

| Question type                                    | Page                  | Mark   |
| ------------------------------------------------ | --------------------- | ------ |
| lift coefficient of a thin airfoil at α          | main                  | Solves |
| zero-lift angle from c_l at one α                | main                  | Solves |
| pressure coefficient from local speed            | ~pressure-coefficient | Solves |
| lift per span from circulation (Kutta–Joukowski) | ~circulation          | Solves |
| what NACA 2412 means; thickness in meters        | ~naca                 | Solves |

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

| Question type                                   | Page          | Mark   |
| ----------------------------------------------- | ------------- | ------ |
| induced drag coefficient and induced angle      | main          | Solves |
| finite-wing lift slope from a₀ and AR           | ~lift-slope   | Solves |
| aspect ratio, taper, mean chord from a planform | ~aspect-ratio | Solves |

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

| Question type                                 | Page             | Mark   |
| --------------------------------------------- | ---------------- | ------ |
| Mach number at an altitude's temperature      | main             | Solves |
| Prandtl–Glauert correction of C_p             | ~prandtl-glauert | Solves |
| subsonic, transonic, supersonic or hypersonic | ~flow-regimes    | Solves |

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

| Question type                                   | Page       | Mark           |
| ----------------------------------------------- | ---------- | -------------- |
| T₀/T, p₀/p, ρ₀/ρ at a Mach number               | main       | Solves         |
| A/A* at M; M from A/A* (subsonic or supersonic) | ~area-mach | Solves (⏳ N3) |
| choked mass flow through a throat               | ~choked    | Solves         |
| stagnation temperature on a probe tip           | main       | Solves         |

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

| Question type                                   | Page     | Mark           |
| ----------------------------------------------- | -------- | -------------- |
| M₂, p₂/p₁, T₂/T₁, p₀₂/p₀₁ across a normal shock | main     | Solves         |
| oblique shock: θ from β and M₁; M₂              | ~oblique | Solves         |
| β from θ and M₁ (weak or strong)                | ~oblique | Partly (⏳ N3) |
| pitot tube in supersonic flow                   | ~pitot   | Solves (⏳ N2) |

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

| Question type                                      | Page           | Mark           |
| -------------------------------------------------- | -------------- | -------------- |
| design exit Mach, pressure, temperature from Ae/At | main           | Solves (⏳ N3) |
| mass flow of a choked nozzle                       | main           | Solves         |
| what happens as back pressure is lowered           | ~back-pressure | Solves         |
| over- or underexpanded at a given back pressure    | ~expansion     | Solves         |

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

| Question type                                  | Page           | Mark           |
| ---------------------------------------------- | -------------- | -------------- |
| lift and wave drag of a thin airfoil (Ackeret) | main           | Solves         |
| Mach angle                                     | ~mach-angle    | Solves         |
| Prandtl–Meyer expansion round a corner         | ~expansion-fan | Solves (⏳ N2) |

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

| Question type                                 | Page        | Mark   |
| --------------------------------------------- | ----------- | ------ |
| C_L, drag and thrust required in level flight | main        | Solves |
| stall speed                                   | ~stall      | Solves |
| jet range (Breguet)                           | ~range      | Solves |
| rate of climb from excess thrust              | ~climb      | Solves |
| load factor and radius of a level turn        | ~turn       | Solves |
| density at an altitude (standard atmosphere)  | ~atmosphere | Solves |

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

| Question type                           | Page    | Mark   |
| --------------------------------------- | ------- | ------ |
| neutral point and static margin         | main    | Solves |
| trim angle of attack from C_m0 and C_mα | ~trim   | Solves |
| stable or not from a C_m–α line         | ~stable | Solves |

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
| which mode: short period, phugoid, Dutch roll, spiral  | ~modes      | Solves |

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

| Question type                             | Page              | Mark   |
| ----------------------------------------- | ----------------- | ------ |
| elevator angle to trim at α               | main              | Solves |
| which surface controls pitch, roll or yaw | ~surfaces         | Solves |
| bank angle for a coordinated turn rate    | ~coordinated-turn | Solves |

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

| Question type                                      | Page   | Mark   |
| -------------------------------------------------- | ------ | ------ |
| shear flow and stress in a closed box under torque | main   | Solves |
| twist rate of a closed cell                        | main   | Solves |
| hoop and axial stress in a pressurized fuselage    | ~cabin | Solves |

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

| Question type                                | Page        | Mark   |
| -------------------------------------------- | ----------- | ------ |
| longitudinal modulus by the rule of mixtures | main        | Solves |
| transverse modulus                           | ~transverse | Solves |
| density and specific stiffness               | ~specific   | Solves |

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

| Question type                                     | Page     | Mark   |
| ------------------------------------------------- | -------- | ------ |
| Euler load of a pinned column                     | main     | Solves |
| effect of end conditions (K)                      | main     | Solves |
| critical stress of a skin panel between stringers | ~plate   | Solves |
| short column: Johnson parabola                    | ~johnson | Solves |

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

| Question type                                      | Page     | Mark   |
| -------------------------------------------------- | -------- | ------ |
| mean and alternating stress, Goodman safety factor | main     | Solves |
| Miner's rule damage and repeats to failure         | ~miner   | Solves |
| cycles to failure from Basquin's law               | ~basquin | Solves |

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

| Question type                                  | Page        | Mark   |
| ---------------------------------------------- | ----------- | ------ |
| ideal Brayton efficiency and net work          | main        | Solves |
| compressor exit temperature with an efficiency | ~compressor | Solves |
| turbojet thrust, propulsive efficiency, TSFC   | ~turbojet   | Solves |
| turbofan thrust with a bypass ratio            | ~turbofan   | Solves |

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

| Question type                                | Page     | Mark   |
| -------------------------------------------- | -------- | ------ |
| Δv from Isp and mass ratio (rocket equation) | main     | Solves |
| propellant fraction for a Δv                 | main     | Solves |
| thrust with a pressure term; Isp from thrust | ~thrust  | Solves |
| two-stage Δv                                 | ~staging | Solves |

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

| Question type                                  | Page                          | Mark         |
| ---------------------------------------------- | ----------------------------- | ------------ |
| thrust from C_F, chamber pressure, throat area | main                          | Solves       |
| c* and mass flow; I_sp from C_F and c*         | main                          | Solves       |
| ideal exhaust velocity from chamber state      | ~exhaust-velocity             | Solves       |
| over-, ideally or underexpanded                | compressible-flow#2~expansion | cross-listed |

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

| Question type                                   | Page    | Mark   |
| ----------------------------------------------- | ------- | ------ |
| stoichiometric fuel–air ratio of a hydrocarbon  | main    | Solves |
| equivalence ratio                               | main    | Solves |
| fuel–air ratio for a combustor exit temperature | ~burner | Solves |

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

| Question type                            | Page           | Mark   |
| ---------------------------------------- | -------------- | ------ |
| circular speed and period at an altitude | main           | Solves |
| escape speed                             | main           | Solves |
| speed anywhere on an ellipse (vis-viva)  | ~vis-viva      | Solves |
| geostationary radius and altitude        | ~geostationary | Solves |

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

| Question type                             | Page            | Mark            |
| ----------------------------------------- | --------------- | --------------- |
| a, e, period, h from perigee and apogee   | main            | Solves          |
| radius at a true anomaly (orbit equation) | ~orbit-equation | Solves          |
| position after a time (Kepler's equation) | ~kepler         | Solves (⏳ N2)  |
| what i, Ω, ω and ν describe               | ~elements       | Solves (⏳ P13) |

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

| Question type                                | Page          | Mark   |
| -------------------------------------------- | ------------- | ------ |
| Hohmann transfer Δv₁, Δv₂, time of flight    | main          | Solves |
| plane-change Δv                              | ~plane-change | Solves |
| combined circularize-and-turn burn at apogee | ~combined     | Solves |

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

| Question type                                            | Page     | Mark   |
| -------------------------------------------------------- | -------- | ------ |
| v∞ and departure Δv from a parking orbit (patched conic) | main     | Solves |
| synodic period, next launch window                       | ~synodic | Solves |
| sphere of influence radius                               | ~soi     | Solves |

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

| Question type                                      | Page         | Mark            |
| -------------------------------------------------- | ------------ | --------------- |
| reactions and maximum moment, point load on a span | main         | Solves          |
| shear and moment of a uniform load                 | ~udl         | Solves          |
| cantilever end reaction and fixed-end moment       | ~cantilever  | Solves          |
| truss member force by the method of sections       | ~truss       | Solves (⏳ P15) |
| determinate, indeterminate or unstable             | ~determinacy | Solves          |

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

| Question type                                         | Page            | Mark            |
| ----------------------------------------------------- | --------------- | --------------- |
| maximum moment at a section from a moving load        | main            | Solves          |
| moment from a uniform live load on the influence area | main            | Solves          |
| shear influence line ordinates                        | ~shear          | Solves          |
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

| Question type                                   | Page                 | Mark            |
| ----------------------------------------------- | -------------------- | --------------- |
| propped cantilever reactions (force method)     | main                 | Solves          |
| fixed-end moments                               | ~fixed-end           | Solves          |
| two-span continuous beam by moment distribution | ~moment-distribution | Solves (⏳ P14) |

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

| Question type                                     | Page     | Mark              |
| ------------------------------------------------- | -------- | ----------------- |
| element stiffness AE ÷ L                          | main     | Solves            |
| displacements of two bars in series (assembled K) | main     | Solves            |
| spring system by the direct stiffness method      | ~springs | Solves            |
| beam element stiffness matrix                     | —        | No (⏳ N9, 4 × 4) |

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

| Question type                                        | Page        | Mark           |
| ---------------------------------------------------- | ----------- | -------------- |
| void ratio, porosity, dry unit weight from w, G_s, S | main        | Solves         |
| C_u, C_c and well or poorly graded                   | ~gradation  | Solves (⏳ N5) |
| plasticity index and the A-line                      | ~plasticity | Solves (⏳ N5) |
| USCS group from gradation and limits                 | ~uscs       | Solves         |

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

| Question type                                 | Page       | Mark   |
| --------------------------------------------- | ---------- | ------ |
| dry unit weight from a Proctor point          | main       | Solves |
| zero-air-voids unit weight                    | main       | Solves |
| relative compaction against the specification | main       | Solves |
| sand-cone field density                       | ~sand-cone | Solves |

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

| Question type                                      | Page              | Mark           |
| -------------------------------------------------- | ----------------- | -------------- |
| primary settlement of a normally consolidated clay | main              | Solves         |
| effective stress at a depth (layers, water table)  | ~effective-stress | Solves         |
| settlement of an overconsolidated clay             | ~overconsolidated | Solves (⏳ N9) |
| time for a degree of consolidation                 | ~time-rate        | Solves         |

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

| Question type                             | Page          | Mark   |
| ----------------------------------------- | ------------- | ------ |
| σ′₁ at failure in a drained triaxial test | main          | Solves |
| failure plane angle                       | main          | Solves |
| c′ and φ′ from two direct shear tests     | ~direct-shear | Solves |
| undrained shear strength from a UU test   | ~undrained    | Solves |

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

| Question type                                     | Page    | Mark   |
| ------------------------------------------------- | ------- | ------ |
| ultimate and allowable bearing of a strip footing | main    | Solves |
| bearing factors from φ′                           | main    | Solves |
| square footing (shape factors)                    | ~square | Solves |

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

| Question type                        | Page            | Mark           |
| ------------------------------------ | --------------- | -------------- |
| discharge by Manning's equation      | main            | Solves         |
| Froude number, sub- or supercritical | main            | Solves         |
| normal depth for a discharge         | main (type Q)   | Solves (⏳ N2) |
| critical depth and specific energy   | ~critical-depth | Solves         |
| hydraulic jump depth and head loss   | ~jump           | Solves         |

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

| Question type                                      | Page            | Mark            |
| -------------------------------------------------- | --------------- | --------------- |
| head loss by Darcy–Weisbach with a friction factor | main            | Solves          |
| head loss by Hazen–Williams                        | ~hazen-williams | Solves          |
| flow split between two parallel pipes              | ~parallel       | Solves          |
| one Hardy Cross correction of a loop               | ~hardy-cross    | Solves (⏳ P20) |

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

| Question type                         | Page      | Mark                             |
| ------------------------------------- | --------- | -------------------------------- |
| runoff depth by the NRCS curve number | main      | Solves                           |
| peak flow by the rational method      | ~rational | Solves                           |
| time of concentration (Kirpich)       | ~kirpich  | Solves                           |
| unit hydrograph convolution           | —         | No (⏳ N7, a table of ordinates) |

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

| Question type                                          | Page          | Mark   |
| ------------------------------------------------------ | ------------- | ------ |
| storm sewer diameter flowing full (Manning)            | main          | Solves |
| detention volume from inflow and allowed outflow peaks | ~detention    | Solves |
| order of the design steps                              | ~design-steps | Solves |

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

| Question type                              | Page       | Mark   |
| ------------------------------------------ | ---------- | ------ |
| speed and flow at a density (Greenshields) | main       | Solves |
| capacity and the density at capacity       | main       | Solves |
| shock wave speed at a queue                | ~shockwave | Solves |
| headway and spacing                        | ~headway   | Solves |

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

| Question type                                       | Page              | Mark           |
| --------------------------------------------------- | ----------------- | -------------- |
| stopping sight distance at a design speed and grade | main              | Solves         |
| minimum radius of a horizontal curve                | ~horizontal-curve | Solves         |
| curve length and tangent from R and Δ               | ~curve-elements   | Solves         |
| length of a crest vertical curve for SSD            | ~crest-curve      | Solves (⏳ N9) |

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

| Question type                              | Page  | Mark   |
| ------------------------------------------ | ----- | ------ |
| structural number of a flexible pavement   | main  | Solves |
| ESALs from an axle load (fourth-power law) | ~esal | Solves |
| layer thickness for a required SN          | main  | Solves |

- **Main — BUILD ⏳ P17:** P17 `pavement` (surface, base, subbase to scale, each with a and m).
  Values a₁, D₁, a₂, D₂, m₂, a₃, D₃, m₃, SN. Relation: SN = a₁D₁ + a₂D₂m₂ + a₃D₃m₃. Assumptions:
  AASHTO 1993 method, thicknesses in inches; the required SN comes from the design chart for the
  ESALs and the subgrade (not on this page); m reflects drainage. Example: 0.44 × 4 + 0.14 × 8 × 1.0
  - 0.11 × 10 × 0.9 = 1.76 + 1.12 + 0.99 = 3.87. Typing SN finds D₃. startWith a's, m's, D₁, D₂, D₃.
- **~esal — BUILD:** `bars` (load equivalency per truck, total). Values axle load P (kN), standard
  80 kN, LEF, trucks per day, years, ESAL. Relations: LEF = (P ÷ 80)⁴; ESAL = LEF × trucks × 365 ×
  years. Assumptions: a single axle; no traffic growth; the fourth-power rule is an approximation of
  the AASHO road test. Example: 100 kN → 2.44; 500 a day for 20 years → 8.91 million.
- **Verdict:** 2 pages.

#### transportation#3 — Capacity analysis

| Question type                                          | Page     | Mark           |
| ------------------------------------------------------ | -------- | -------------- |
| flow rate in passenger cars, density, level of service | main     | Solves (⏳ N5) |
| heavy-vehicle factor                                   | main     | Solves         |
| optimum signal cycle (Webster)                         | ~webster | Solves         |

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

| Question type                                 | Page        | Mark           |
| --------------------------------------------- | ----------- | -------------- |
| governing factored load from D, L, S          | main        | Solves (⏳ N5) |
| design strength φR_n against R_u; ASD R_n ÷ Ω | ~phi-omega  | Solves         |
| dead, live or environmental load              | ~load-types | Solves         |

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

| Question type                             | Page     | Mark               |
| ----------------------------------------- | -------- | ------------------ |
| column design strength φP_n (W-shape, KL) | main     | Solves (⏳ N4, N9) |
| tension member: yielding against rupture  | ~tension | Solves (⏳ N9)     |
| slenderness limit KL ÷ r ≤ 200            | main     | Solves             |

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

| Question type                                    | Page        | Mark           |
| ------------------------------------------------ | ----------- | -------------- |
| plastic moment strength of a braced compact beam | main        | Solves (⏳ N4) |
| L_p and whether lateral bracing is close enough  | main        | Solves         |
| live-load deflection against L ÷ 360             | ~deflection | Solves         |
| shear strength of a rolled W-shape               | ~shear      | Solves         |

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

| Question type                           | Page         | Mark           |
| --------------------------------------- | ------------ | -------------- |
| bolt group in single shear              | main         | Solves         |
| fillet weld strength per inch and total | ~weld        | Solves         |
| block shear rupture                     | ~block-shear | Solves (⏳ N9) |

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

| Question type                                | Page             | Mark           |
| -------------------------------------------- | ---------------- | -------------- |
| φM_n of a singly reinforced rectangular beam | main             | Solves         |
| tension-controlled check (ε_t ≥ 0.005)       | main             | Solves (⏳ N5) |
| minimum steel                                | ~min-steel       | Solves (⏳ N9) |
| steel needed for a factored moment           | main (type φM_n) | Solves (⏳ N3) |

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

| Question type                        | Page | Mark   |
| ------------------------------------ | ---- | ------ |
| concrete shear strength φV_c         | main | Solves |
| stirrup spacing for a factored shear | main | Solves |
| maximum spacing d ÷ 2                | main | Solves |

- **Main — BUILD ⏳ P14:** P14 beam elevation with `stirrups` and the shear diagram; P6 section
  showing the two legs. Values b_w, d, f′_c, V_c, V_u, V_s, A_v, f_yt, spacing s. Relations:
  V_c = 2λ√f′_c b_wd (λ = 1); V_s = V_u ÷ 0.75 − V_c; s = A_vf_ytd ÷ V_s, at most d ÷ 2.
  Assumptions: the simplified V_c ACI allows with at least minimum stirrups; normal-weight
  concrete; vertical stirrups. Example: 12 × 20 in, 4000 psi → V_c = 30.4 kips (φV_c = 22.8);
  V_u = 50 kips → V_s = 36.3 kips; #3 two legs (0.22 in²), 60 ksi → s = 7.27 in → use 7 in
  (≤ 10 in). startWith b_w, d, f′_c, V_u, A_v, f_yt.
- **Verdict:** 1 page.

#### concrete-design#2 — Columns

| Question type                           | Page         | Mark                         |
| --------------------------------------- | ------------ | ---------------------------- |
| maximum axial strength of a tied column | main         | Solves                       |
| spiral column                           | ~spiral      | Solves                       |
| steel ratio between 1% and 8%           | main         | Solves                       |
| short or slender (kℓ_u ÷ r ≤ 22)        | ~slenderness | Solves (⏳ N5)               |
| P–M interaction diagram                 | —            | No (⏳ P6 `interaction`, N9) |

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

| Question type                                        | Page            | Mark   |
| ---------------------------------------------------- | --------------- | ------ |
| spread footing size from the allowable soil pressure | main            | Solves |
| two-way (punching) shear check                       | main            | Solves |
| minimum thickness of a one-way slab                  | ~slab-thickness | Solves |

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

| Question type                                       | Page             | Mark   |
| --------------------------------------------------- | ---------------- | ------ |
| overflow rate and detention time of a settling tank | main             | Solves |
| settling velocity (Stokes) and fraction removed     | main             | Solves |
| CT for disinfection                                 | ~ct              | Solves |
| order of a conventional treatment plant             | ~treatment-train | Solves |

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

| Question type                        | Page              | Mark   |
| ------------------------------------ | ----------------- | ------ |
| BOD exerted by day t; ultimate BOD   | main              | Solves |
| BOD from a dilution test             | ~dilution         | Solves |
| food-to-microorganism ratio, HRT     | ~activated-sludge | Solves |
| order of a secondary treatment plant | ~plant-order      | Solves |

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

| Question type                                          | Page     | Mark   |
| ------------------------------------------------------ | -------- | ------ |
| ground-level centerline concentration (Gaussian plume) | main     | Solves |
| ppm to μg/m³                                           | ~ppm     | Solves |
| overall efficiency of control devices in series        | ~control | Solves |

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

| Question type                                 | Page           | Mark   |
| --------------------------------------------- | -------------- | ------ |
| landfill volume a year and the life of a site | main           | Solves |
| area needed for a depth                       | main           | Solves |
| waste hierarchy order                         | ~hierarchy     | Solves |
| heating value of mixed waste                  | ~heating-value | Solves |

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

| Question type                                         | Page           | Mark           |
| ----------------------------------------------------- | -------------- | -------------- |
| horizontal and vertical distance from a slope reading | main           | Solves (⏳ N6) |
| temperature correction of a steel tape                | ~tape          | Solves         |
| interior angle sum and misclosure of a polygon        | ~angle-closure | Solves (⏳ N6) |

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

| Question type                                   | Page       | Mark   |
| ----------------------------------------------- | ---------- | ------ |
| elevation by differential leveling (two setups) | main       | Solves |
| arithmetic check ΣBS − ΣFS                      | main       | Solves |
| curvature and refraction over a long sight      | ~curvature | Solves |
| trigonometric leveling                          | ~trig      | Solves |

- **Main — BUILD ⏳ P28:** **P28** `survey` level (two setups, rods at BM, TP1 and B; HI lines).
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

| Question type                            | Page          | Mark           |
| ---------------------------------------- | ------------- | -------------- |
| latitude and departure of a course       | main          | Solves (⏳ N6) |
| linear misclosure and relative precision | ~closure      | Solves         |
| compass-rule correction of one course    | ~compass-rule | Solves         |
| area from coordinates                    | ~area         | Solves         |

- **Main — BUILD ⏳ P27:** **P27** `survey` traverse, one course lit, its north and east components drawn.
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

| Question type                                         | Page         | Mark   |
| ----------------------------------------------------- | ------------ | ------ |
| orthometric height from ellipsoid height and geoid    | main         | Solves |
| range from signal travel time; a clock error's effect | ~pseudorange | Solves |
| expected position error from DOP                      | ~dop         | Solves |
| which error source is which                           | ~errors      | Solves |

- **Main — BUILD ⏳ P29:** equation `{H:unit} = {h:unit} − {N:unit}`; **P29** `survey` heights (terrain,
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

## Chemical

Textbooks for the field (part 4): Wikibooks _Introduction to Chemical Engineering Processes_
(CC BY-SA); LearnChemE screencasts, simulations and ConcepTests (Colorado, CC BY-SA 4.0); Woolf
et al., _Chemical Process Dynamics and Controls_ (Michigan, LibreTexts, CC BY 3.0); Rawlings and
Ekerdt, _Chemical Reactor Analysis and Design Fundamentals_ (free PDF from the publisher, all
rights reserved); Fogler's _Elements of CRE_ companion site (free to read, all rights reserved);
Northwestern _Process Design_ open wiki (licence to confirm); MIT OCW 10.213, 10.302, 10.37,
10.40, 10.450, 10.490, 10.50 (CC BY-NC-SA); U.S. CSB investigation reports (public domain).
Reference only.

### 15. material-energy-balances — Material & Energy Balances

#### material-energy-balances#0 — Process flow diagrams

| Question type                                          | Page     | Mark            |
| ------------------------------------------------------ | -------- | --------------- |
| mass flow to molar flow and mole fractions of a stream | main     | Solves          |
| degrees of freedom of a unit                           | ~dof     | Solves          |
| what each PFD symbol does                              | ~symbols | Solves (⏳ P36) |

- **Main — BUILD ⏳ P9:** **P9** `controlVolume` one stream (a labeled arrow with its flow and
  composition box). Values total mass flow ṁ, mass fraction w_A, molar masses M_A, M_B, molar
  flows ṅ_A, ṅ_B, total ṅ, mole fraction x_A. Relations: ṅ_A = w_Aṁ ÷ M_A; ṅ_B = (1 − w_A)ṁ ÷ M_B;
  ṅ = ṅ_A + ṅ_B; x_A = ṅ_A ÷ ṅ. Assumptions: two components; fractions sum to 1. Example: 100 kg/h,
  40% benzene (78.11) and toluene (92.14) → 0.5121 + 0.6512 = 1.163 kmol/h, x_A = 0.440.
  startWith ṁ, w_A, M_A, M_B.
- **~dof — BUILD:** P9 unit with its unknowns lit. Values unknowns, independent balances,
  specifications, other relations, degrees of freedom. Relation: DOF = unknowns − balances −
  specifications − relations. Example: a two-component splitter with 5 unknown flows and
  fractions, 2 balances, 2 specified values, 1 split relation → DOF = 0, solvable. Assumption: DOF > 0
  needs more information; DOF < 0 means over-specified or inconsistent.
- **~symbols — BUILD (sort) ⏳ P36:** card figure `pfdSymbol`. Bins "Moves fluid", "Changes
  temperature", "Separates", "Reacts". Cards: centrifugal pump; compressor; shell-and-tube heat
  exchanger; fired heater; distillation column; flash drum; packed absorber; CSTR; packed-bed reactor.
- **Verdict:** 3 pages.

#### material-energy-balances#1 — Material balances

| Question type                               | Page      | Mark   |
| ------------------------------------------- | --------- | ------ |
| mixer: outlet flow and composition          | main      | Solves |
| column split: distillate, bottoms, recovery | ~splitter | Solves |
| bypass around a unit                        | ~bypass   | Solves |

- **Main — BUILD ⏳ P9:** P9 mixer (two in, one out; the in = out check). Values F₁, x₁, F₂, x₂, F₃,
  x₃. Relations: F₁ + F₂ = F₃; F₁x₁ + F₂x₂ = F₃x₃. Assumptions: steady state, no reaction, so mass
  in equals mass out for each component. Example: 100 kg/h at 20% ethanol + 50 kg/h at 50% →
  150 kg/h at 30%. startWith F₁, x₁, F₂, x₂.
- **~splitter — BUILD ⏳ P9:** P9 column. Values F, z, x_D, x_B, D, B, recovery. Relations: F = D + B;
  Fz = Dx_D + Bx_B; recovery = Dx_D ÷ (Fz). Example: 100 kmol/h, 0.40, 0.95, 0.05 → D = 38.9,
  B = 61.1 kmol/h, 92.4% of the light key overhead.
- **~bypass — BUILD ⏳ P9:** P9 evaporator with a bypass line. Values fresh feed, feed solids,
  concentrate solids, product solids, bypass B, evaporator feed E, water removed W, product P.
  Relations: overall solids and water; solids at the evaporator; the mixing point. Example:
  100 kg/h juice at 12% solids, evaporator makes 58%, product 42% → P = 28.57, W = 71.43,
  E = 90.06, B = 9.94 kg/h.
- **Verdict:** 3 pages.

#### material-energy-balances#2 — Reactive systems

| Question type                                     | Page        | Mark   |
| ------------------------------------------------- | ----------- | ------ |
| outlet flows from conversion (extent of reaction) | main        | Solves |
| limiting reactant and percent excess              | main        | Solves |
| combustion with excess air; dry-basis CO₂ %       | ~combustion | Solves |

- **Main — BUILD:** `reaction` with `limiting` (N₂ + 3H₂ → 2NH₃, before and after counts). Values
  N₂ in, H₂ in, conversion of H₂ X, extent ξ, N₂ out, H₂ out, NH₃ out, % excess N₂. Relations:
  ξ = XH₂,in ÷ 3; ṅ_i = ṅ_i0 + ν_iξ; excess = (N₂ in − H₂ in ÷ 3) ÷ (H₂ in ÷ 3). Assumptions:
  one reaction; steady state; conversion is of the limiting reactant. Example: 100 and
  250 mol/h, X = 0.6 → ξ = 50 mol/h; out 50 N₂, 100 H₂, 100 NH₃; H₂ limits, N₂ 20% in excess.
  startWith the feeds and X.
- **~combustion — BUILD ⏳ P9:** P9 burner (fuel and air in, flue gas out). Values CH₄ fed, %
  excess air, O₂ fed, N₂ fed, CO₂, H₂O, O₂ left, dry CO₂ %. Relations: O₂ fed = 2 × CH₄ ×
  (1 + excess); N₂ = 3.76 × O₂; dry total = CO₂ + O₂ left + N₂. Example: 100 mol/h, 20% excess →
  240 O₂, 902.4 N₂; out 100 CO₂, 200 H₂O, 40 O₂; dry CO₂ = 100 ÷ 1042.4 = 9.59%.
- **Verdict:** 2 pages.

#### material-energy-balances#3 — Energy balances

| Question type                        | Page              | Mark                        |
| ------------------------------------ | ----------------- | --------------------------- |
| heat duty to warm a stream           | main              | Solves                      |
| steam needed for that duty           | main              | Solves                      |
| heat released by a reaction at 25 °C | ~heat-of-reaction | Solves                      |
| enthalpy from steam tables           | —                 | No (⏳ N4 steam table rows) |

- **Main — BUILD ⏳ P9:** P9 heater with a Q arrow and the steam line. Values ṁ, c_p, T_in, T_out,
  Q̇, latent heat λ, steam ṁ_s. Relations: Q̇ = ṁc_p(T_out − T_in); ṁ_s = Q̇ ÷ λ. Assumptions: steady
  open system, kinetic and potential energy changes negligible; constant c_p; steam condenses
  fully and leaves as saturated liquid. Example: water 2 kg/s, 4.18 kJ/(kg·K), 20 → 80 °C →
  501.6 kW; λ = 2257 kJ/kg at 100 °C → 0.222 kg/s of steam. startWith ṁ, c_p, T_in, T_out, λ.
- **~heat-of-reaction — BUILD:** `energyProfile` ladder (reactants, products, ΔH). Values extent ξ̇,
  ΔH_r°, Q̇. Relation: Q̇ = ξ̇ΔH_r° (feed and products at 25 °C). Example: 10 mol/s CH₄ burned,
  −802.3 kJ/mol (water as vapor) → Q̇ = −8023 kW (heat leaves).
- **Verdict:** 2 pages.

### 16. chemical-thermodynamics — Chemical Engineering Thermodynamics

#### chemical-thermodynamics#0 — Equations of state

| Question type                                        | Page           | Mark               |
| ---------------------------------------------------- | -------------- | ------------------ |
| compressibility factor from the virial (Pitzer) form | main           | Solves             |
| pressure from van der Waals at a molar volume        | ~van-der-waals | Solves             |
| volume from van der Waals at a pressure (cubic)      | ~van-der-waals | Partly (⏳ N2, N3) |
| Peng–Robinson                                        | —              | No (⏳ N2, N3, N4) |

- **Main — BUILD ⏳ N4:** **P10** `propertyDiagram` P–v mode (the isotherm, ideal dashed, the
  state). Values T_c, P_c, acentric ω (a compound row sets these, N4), T, P, T_r, P_r, B⁰, B¹, Z.
  10 values. Relations: T_r = T ÷ T_c; P_r = P ÷ P_c; B⁰ = 0.083 − 0.422 ÷ T_r^1.6;
  B¹ = 0.139 − 0.172 ÷ T_r^4.2; Z = 1 + (B⁰ + ωB¹)P_r ÷ T_r. Assumptions: low to moderate pressure
  (the two-term virial form holds roughly where V_r > 2); nonpolar gas. Example: propane (369.8 K,
  42.48 bar, 0.152) at 400 K and 10 bar → T_r = 1.082, P_r = 0.2354, B⁰ = −0.2892, B¹ = 0.0153,
  Z = 0.938. startWith compound, T, P.
- **~van-der-waals — BUILD ⏳ P10:** P10 P–v with the vdW isotherm. Values T_c, P_c, a, b, T, molar
  volume V, P, Z. Relations: a = 27R²T_c² ÷ (64P_c); b = RT_c ÷ (8P_c); P = RT ÷ (V − b) − a ÷ V²;
  Z = PV ÷ (RT). Example: CO₂ (304.2 K, 73.83 bar) → a = 0.3655 Pa·m⁶/mol², b = 4.28 × 10⁻⁵ m³/mol;
  300 K, 1.000 L/mol → P = 22.40 bar (ideal 24.94), Z = 0.898.
- **Verdict:** 2 pages.

#### chemical-thermodynamics#1 — Fugacity

| Question type                             | Page      | Mark   |
| ----------------------------------------- | --------- | ------ |
| fugacity coefficient from the virial form | main      | Solves |
| liquid fugacity with the Poynting factor  | ~poynting | Solves |

- **Main — BUILD:** `plot` with `reference` (f against P; the ideal line f = P dashed, the gas's
  point below it). Values T_r, P_r, B⁰ + ωB¹, ln φ, φ, P, f. Relations: ln φ = (B⁰ + ωB¹)P_r ÷ T_r;
  f = φP. Assumptions: same range as the virial page; φ = 1 is the ideal gas. Example: propane above
  → ln φ = −0.0624, φ = 0.939, f = 9.39 bar. startWith the virial values, P.
- **~poynting — BUILD:** `none`. Values P_sat, liquid volume V_L, P, T, Poynting factor, f.
  Relation: f = P_sat exp(V_L(P − P_sat) ÷ (RT)) (φ_sat ≈ 1). Example: water at 25 °C, 3.17 kPa,
  18.07 cm³/mol, 100 bar → factor 1.076, f = 3.41 kPa.
- **Verdict:** 2 pages.

#### chemical-thermodynamics#2 — Vapor–liquid equilibrium

| Question type                                  | Page          | Mark           |
| ---------------------------------------------- | ------------- | -------------- |
| bubble pressure and vapor composition (Raoult) | main          | Solves (⏳ N4) |
| dew pressure                                   | ~dew          | Solves         |
| binary flash: phase fractions at T and P       | ~flash        | Solves         |
| activity coefficients (one-parameter Margules) | ~margules     | Solves         |
| bubble temperature at a pressure               | main (type P) | Solves (⏳ N2) |

- **Main — BUILD ⏳ P30, N4:** **P30** `phaseEnvelope` Pxy (bubble and dew curves at T, the tie
  line at x). A pair row (N4) supplies both compounds' Antoine A, B, C as data, not values. Values
  T (°C), P₁sat, P₂sat, x₁, P, y₁. Relations:
  log P^sat = A − B ÷ (T + C) (mmHg, °C); P = x₁P₁sat + (1 − x₁)P₂sat; y₁ = x₁P₁sat ÷ P.
  Assumptions: ideal liquid (Raoult's law) and ideal vapor; the Antoine range covers T. Example:
  benzene–toluene at 90 °C → 1021 and 406.7 mmHg; x₁ = 0.5 → P = 713.9 mmHg, y₁ = 0.715.
  startWith the pair, T, x₁.
- **~dew — BUILD:** P30. Relation: 1 ÷ P = y₁ ÷ P₁sat + (1 − y₁) ÷ P₂sat. Example: y₁ = 0.5 at
  90 °C → 581.7 mmHg.
- **~flash — BUILD:** P30 with the feed point on the tie line (lever rule). Values P₁sat, P₂sat, P,
  K₁, K₂, z₁, x₁, y₁, V ÷ F. Relations: K = P^sat ÷ P; x₁ = (1 − K₂) ÷ (K₁ − K₂); y₁ = K₁x₁;
  V ÷ F = (z₁ − x₁) ÷ (y₁ − x₁). Example: 90 °C, 760 mmHg → K = 1.343 and 0.535, x₁ = 0.575,
  y₁ = 0.773; z₁ = 0.6 → V/F = 0.126.
- **~margules — BUILD:** P30 with a dashed Raoult line. Values A, x₁, γ₁, γ₂. Relations:
  ln γ₁ = A x₂²; ln γ₂ = A x₁². Example: A = 0.8, x₁ = 0.3 → γ₁ = 1.480, γ₂ = 1.075.
- **Verdict:** 4 pages.

#### chemical-thermodynamics#3 — Reaction equilibria

| Question type                          | Page        | Mark   |
| -------------------------------------- | ----------- | ------ |
| K from ΔG° at 298 K                    | main        | Solves |
| K at another temperature (van 't Hoff) | ~van-t-hoff | Solves |
| equilibrium conversion of A ⇌ B        | ~conversion | Solves |

- **Main — BUILD:** `equilibriumChart` (Q against K). Values ΔG° (kJ/mol), T, K, ln K. Relation:
  ln K = −ΔG° ÷ (RT). Assumptions: standard state 1 bar; ΔG° for the reaction as written.
  Example: N₂ + 3H₂ ⇌ 2NH₃, ΔG° = −32.9 kJ/mol at 298.15 K → ln K = 13.27, K = 5.81 × 10⁵.
  startWith ΔG°, T.
- **~van-t-hoff — BUILD:** `linearFunction` (ln K against 1 ÷ T, slope −ΔH° ÷ R). Values K₁, T₁,
  ΔH°, T₂, K₂. Relation: ln(K₂ ÷ K₁) = −(ΔH° ÷ R)(1 ÷ T₂ − 1 ÷ T₁). Assumption: ΔH° constant over the
  range. Example: −92.2 kJ/mol, 298.15 → 700 K → K₂ = 3.10 × 10⁻⁴ (why plants run hot only for
  speed, at high pressure).
- **~conversion — BUILD:** `equilibriumChart`. Values K, X. Relation: K = X ÷ (1 − X) (no change in
  moles, ideal). Example: K = 3 → X = 0.75.
- **Verdict:** 3 pages.

### 17. transport-phenomena — Transport Phenomena

#### transport-phenomena#0 — Momentum transport

| Question type                                   | Page     | Mark   |
| ----------------------------------------------- | -------- | ------ |
| laminar flow rate in a tube (Hagen–Poiseuille)  | main     | Solves |
| average and maximum velocity; wall shear stress | main     | Solves |
| shear stress and force in Couette flow          | ~couette | Solves |
| falling film average velocity                   | ~film    | Solves |

- **Main — BUILD ⏳ P31:** **P31** `velocityProfile` tube (parabolic arrows, v_max on the axis,
  τ_w at the wall). Values ΔP, length L, radius R, viscosity μ, Q, v_avg, v_max, τ_w, Re (ρ fixed
  1000 kg/m³ in the assumption). Relations: Q = πΔPR⁴ ÷ (8μL); v_avg = Q ÷ (πR²); v_max = 2v_avg;
  τ_w = ΔPR ÷ (2L); Re = ρv_avg(2R) ÷ μ. Assumptions: steady, laminar (Re < 2100), Newtonian,
  fully developed; the step names the shell balance that gives the parabola. Example: 1000 Pa,
  1 m, 1 mm, 0.001 Pa·s → Q = 3.93 × 10⁻⁷ m³/s, v_avg = 0.125 m/s, v_max = 0.25 m/s,
  τ_w = 0.5 Pa, Re = 250. startWith ΔP, L, R, μ.
- **~couette — BUILD:** P31 plates (linear profile). Values μ, plate speed V, gap h, τ, area A,
  force F. Relations: τ = μV ÷ h; F = τA. Example: oil 0.3 Pa·s, 2 m/s, 1 mm → 600 Pa; 0.5 m² → 300 N.
- **~film — BUILD:** P31 film on a wall. Values ρ, μ, thickness δ, angle β, v_avg. Relation:
  v_avg = ρgδ² cos β ÷ (3μ). Example: water, 0.5 mm, vertical (β = 0) → 0.818 m/s.
- **Verdict:** 3 pages.

#### transport-phenomena#1 — Heat transport

| Question type                                      | Page         | Mark   |
| -------------------------------------------------- | ------------ | ------ |
| heat flux through a composite wall with convection | main         | Solves |
| heat loss from an insulated pipe; critical radius  | ~cylinder    | Solves |
| center temperature of a wire with heat generation  | ~heated-wire | Solves |

- **Main — BUILD ⏳ P31:** P31 `temperature` through layers (a straight drop in each layer, steeper
  where k is small). Values T_in, h_in, L₁, k₁, L₂, k₂, h_out, T_out, total R, flux q″. Relations:
  R = 1 ÷ h_in + L₁ ÷ k₁ + L₂ ÷ k₂ + 1 ÷ h_out; q″ = (T_in − T_out) ÷ R. Assumptions: steady,
  one-dimensional; resistances in series like resistors; perfect contact between layers. Example:
  22 °C, 10 W/(m²·K), brick 0.2 m at 0.7, insulation 0.05 m at 0.04, 25 W/(m²·K), −5 °C →
  R = 1.676 m²·K/W, q″ = 16.1 W/m². startWith all but R and q″.
- **~cylinder — BUILD ⏳ P31:** P31 radial. Values r₁, r₂, k, h, T_i, T∞, R_cond, R_conv, q′, r_c.
  Relations: R_cond = ln(r₂ ÷ r₁) ÷ (2πk); R_conv = 1 ÷ (2πr₂h); q′ = (T_i − T∞) ÷ (R_cond + R_conv);
  r_c = k ÷ h. Example: 0.05 → 0.08 m, 0.04 W/(m·K), 10 W/(m²·K), 150 → 20 °C → 1.870 + 0.199 →
  62.8 W/m; r_c = 4 mm, so insulating this pipe only helps.
- **~heated-wire — BUILD ⏳ P31:** P31 radial with generation. Values heat generation S
  (W/m³), radius R, k, T_s, T_center. Relation: T_center − T_s = SR² ÷ (4k). Example: 5 × 10⁸ W/m³,
  1 mm, 12 W/(m·K) → 10.4 K above the surface.
- **Verdict:** 3 pages.

#### transport-phenomena#2 — Mass transport

| Question type                                    | Page            | Mark   |
| ------------------------------------------------ | --------------- | ------ |
| equimolar counterdiffusion flux (Fick)           | main            | Solves |
| evaporation through a stagnant gas (Stefan tube) | ~stagnant-film  | Solves |
| time to diffuse a distance                       | ~diffusion-time | Solves |

- **Main — BUILD ⏳ P31:** P31 `concentration` across a film (a straight line from c_A1 to c_A2).
  Values D_AB, c_A1, c_A2, thickness L, flux N_A. Relation: N_A = D_AB(c_A1 − c_A2) ÷ L.
  Assumptions: steady; equimolar counterdiffusion, so no bulk flow; constant D. Example:
  2.0 × 10⁻⁵ m²/s, 2.0 and 0.5 mol/m³, 0.05 m → 6.0 × 10⁻⁴ mol/(m²·s). startWith D_AB, c_A1, c_A2, L.
- **~stagnant-film — BUILD ⏳ P31:** P31 tube with liquid at the bottom (a curved profile). Values
  P, T, P_sat, c, x_A1, x_A2, D, L, N_A. Relations: c = P ÷ (RT); x_A1 = P_sat ÷ P;
  N_A = (cD ÷ L) ln((1 − x_A2) ÷ (1 − x_A1)). Example: water at 25 °C, 3.17 kPa, 2.6 × 10⁻⁵ m²/s,
  0.1 m, dry air at the top → c = 40.9 mol/m³, x_A1 = 0.0313, N_A = 3.38 × 10⁻⁴ mol/(m²·s).
- **~diffusion-time — BUILD:** `none`. Values distance L, D, t ≈ L² ÷ D. Example: 1 mm in water,
  10⁻⁹ m²/s → about 1000 s; 1 cm → about 28 hours, why stirring matters.
- **Verdict:** 3 pages.

#### transport-phenomena#3 — Transport analogies

| Question type                                             | Page           | Mark   |
| --------------------------------------------------------- | -------------- | ------ |
| Nusselt number from the friction factor (Chilton–Colburn) | main           | Solves |
| Sherwood number by the same analogy                       | ~mass-analogy  | Solves |
| Prandtl and Schmidt numbers and what they compare         | ~dimensionless | Solves |

- **Main — BUILD ⏳ P31:** P31 `analogy` (velocity, thermal and concentration boundary layers side
  by side, δ_T = δPr^(−1/3)). Values Re, Fanning f, Pr, j_H (= f ÷ 2), Nu, Dittus–Boelter Nu for
  comparison. Relations: f = 0.079Re^(−0.25) (smooth tube, 4000 < Re < 10⁵); Nu = (f ÷ 2)RePr^(1/3);
  Nu_DB = 0.023Re^0.8Pr^0.4. Assumptions: turbulent; 0.6 < Pr < 60; no form drag (the analogy
  links skin friction only). Example: Re = 50,000, Pr = 0.7 → f = 0.00528, Nu = 117.3 (Dittus–Boelter
  114.5, within 3%). startWith Re, Pr.
- **~mass-analogy — BUILD ⏳ P31:** same. Values Re, f, Sc, Sh. Relation: Sh = (f ÷ 2)ReSc^(1/3).
  Example: Re = 50,000, Sc = 0.6 → Sh = 111.4.
- **~dimensionless — BUILD:** `bars` (the two diffusivities compared). Values c_p, μ, k, Pr, ρ, D,
  Sc. Relations: Pr = c_pμ ÷ k; Sc = μ ÷ (ρD). Example: water at 20 °C → Pr = 4182 × 0.001 ÷ 0.598
  = 6.99 (heat diffuses 7 times slower than momentum).
- **Verdict:** 3 pages.

### 18. separations — Separation Processes

#### separations#0 — Distillation

| Question type                                     | Page            | Mark            |
| ------------------------------------------------- | --------------- | --------------- |
| minimum stages (Fenske)                           | main            | Solves          |
| minimum reflux (Underwood, saturated liquid feed) | ~min-reflux     | Solves          |
| rectifying operating line                         | ~operating-line | Solves          |
| stages by McCabe–Thiele stepping                  | ~mccabe-thiele  | Solves (⏳ P30) |

- **Main — BUILD ⏳ P30:** P30 `xy` (equilibrium curve for constant α, the 45° line, x_B and x_D
  marked, total-reflux steps). Values x_D, x_B, relative volatility α, N_min. Relation:
  N_min = ln[(x_D ÷ (1 − x_D))((1 − x_B) ÷ x_B)] ÷ ln α. Assumptions: constant α; total reflux; N_min
  counts the reboiler as a stage. Example: 0.95, 0.05, α = 2.5 → ln 361 ÷ ln 2.5 = 6.43 stages.
  startWith x_D, x_B, α.
- **~min-reflux — BUILD ⏳ P30:** P30 `xy` with the pinch at the feed. Values x_F, x_D, α, R_min,
  R = 1.5R_min. Relation: R_min = (1 ÷ (α − 1))[x_D ÷ x_F − α(1 − x_D) ÷ (1 − x_F)]. Example:
  x_F = 0.4, x_D = 0.95, α = 2.5 → 1.444; R = 2.167.
- **~operating-line — BUILD ⏳ P30:** P30 `xy` line. Values R, x_D, slope, intercept. Relations:
  slope = R ÷ (R + 1); intercept = x_D ÷ (R + 1). Example: R = 2.167 → 0.684 and 0.300.
- **~mccabe-thiele — BUILD ⏳ P30:** P30 `xy` `steps` (both operating lines, the q-line, the
  staircase). Values α, x_F, q, x_D, x_B, R, stages (counted by the picture), feed stage. Example
  from the three pages above; the count is the picture's, the page shows it as a derived whole
  number (⏳ N7: a count from a construction).
- **Verdict:** 4 pages.

#### separations#1 — Absorption

| Question type                  | Page        | Mark   |
| ------------------------------ | ----------- | ------ |
| stages by the Kremser equation | main        | Solves |
| minimum liquid-to-gas ratio    | ~min-liquid | Solves |

- **Main — BUILD ⏳ P30:** P30 `xy` with straight equilibrium y = mx and operating lines. Values
  y_in, y_out, x_in, m, absorption factor A, N. Relation: N = ln[((y_in − mx_in) ÷ (y_out −
  mx_in))(1 − 1 ÷ A) + 1 ÷ A] ÷ ln A, A = L ÷ (mG). Assumptions: dilute gas, so L and G are
  constant; linear equilibrium (Henry's law); isothermal. Example: 0.02, 0.001, 0, m = 1.5,
  A = 1.4 → 5.53 stages. startWith y_in, y_out, x_in, m, A.
- **~min-liquid — BUILD ⏳ P30:** P30 `xy` pinch at the bottom. Values y_in, y_out, x_in, m,
  (L ÷ G)min, L ÷ G at 1.5 × min. Relation: (L ÷ G)min = (y_in − y_out) ÷ (y_in ÷ m − x_in).
  Example: → 1.425; 1.5 × = 2.14, A = 1.425.
- **Verdict:** 2 pages.

#### separations#2 — Extraction

| Question type                             | Page          | Mark   |
| ----------------------------------------- | ------------- | ------ |
| fraction left after one equilibrium stage | main          | Solves |
| crosscurrent stages with split solvent    | ~crosscurrent | Solves |
| one large wash or several small ones      | ~crosscurrent | Solves |

- **Main — BUILD ⏳ P9:** P9 `stages: 1` (feed and solvent in, extract and raffinate out, solute
  amounts). Values distribution coefficient K_D, solvent-to-feed S ÷ F, extraction factor E,
  fraction left, fraction extracted. Relations: E = K_DS ÷ F; left = 1 ÷ (1 + E). Assumptions:
  immiscible solvents; dilute solute; one equilibrium stage. Example: K_D = 4, S/F = 0.5 → E = 2,
  one third left. startWith K_D, S/F.
- **~crosscurrent — BUILD ⏳ P9:** P9 `stages: n` crosscurrent. Values K_D, total S ÷ F, stages n,
  E per stage, left. Relation: left = (1 ÷ (1 + K_D(S ÷ F) ÷ n))ⁿ. Example: same solvent in three
  equal parts → (0.6)³ = 0.216, against 0.333 in one.
- **Verdict:** 2 pages.

#### separations#3 — Membranes

| Question type                         | Page            | Mark   |
| ------------------------------------- | --------------- | ------ |
| reverse-osmosis water flux            | main            | Solves |
| osmotic pressure of seawater          | main            | Solves |
| ideal selectivity and permeate purity | ~gas-permeation | Solves |

- **Main — BUILD ⏳ P9:** P9 `membrane` (feed, retentate, permeate; pressure and osmotic pressure
  bars). Values salt concentration (g/L), molar mass, ions i, T, osmotic π, applied ΔP,
  permeability A_w, flux J_w. Relations: π = i(c ÷ M)RT; J_w = A_w(ΔP − π). Assumptions: permeate
  nearly salt-free; van 't Hoff dilute form; no concentration polarization. Example: 35 g/L NaCl
  (58.44 g/mol), i = 2, 25 °C → π = 29.7 bar; ΔP = 60 bar, A_w = 1.0 L/(m²·h·bar) → J_w =
  30.3 L/(m²·h). startWith c, M, i, T, ΔP, A_w.
- **~gas-permeation — BUILD ⏳ P9:** P9 membrane. Values permeabilities P_A, P_B, selectivity α,
  feed x_A, permeate y_A (low pressure ratio limit). Relations: α = P_A ÷ P_B; y_A ÷ (1 − y_A) =
  α x_A ÷ (1 − x_A). Example: O₂/N₂ α = 5, air x = 0.21 → y = 1.05 ÷ 1.84 = 0.571.
- **Verdict:** 2 pages.

### 19. reaction-engineering — Chemical Reaction Engineering

#### reaction-engineering#0 — Rate laws

| Question type                                  | Page            | Mark   |
| ---------------------------------------------- | --------------- | ------ |
| rate constant at a new temperature (Arrhenius) | main            | Solves |
| activation energy from two rate constants      | main (type E)   | Solves |
| reaction order from initial rates              | ~order          | Solves |
| Arrhenius plot: E from the slope               | ~arrhenius-plot | Solves |

- **Main — BUILD:** `linearFunction` (ln k against 1 ÷ T through the two points; slope −E ÷ R).
  Values E (kJ/mol), k₁, T₁, T₂, k₂, ratio k₂ ÷ k₁. Relation: ln(k₂ ÷ k₁) = (E ÷ R)(1 ÷ T₁ − 1 ÷ T₂).
  Assumptions: E and the pre-exponential factor don't change with T; temperatures in kelvins.
  Example: 80 kJ/mol, 0.05 per min at 300 K → at 320 K ratio 7.42, k₂ = 0.371 per min (the
  "doubles every 10 K" rule is rough). startWith E, k₁, T₁, T₂.
- **~order — BUILD:** `chemDiagram` `mode: 'rate'`. Values C₁, rate₁, C₂, rate₂, order n, k.
  Relations: n = ln(r₂ ÷ r₁) ÷ ln(C₂ ÷ C₁); k = r₁ ÷ C₁ⁿ. Example: 0.5 → 1.0 mol/L, rate × 4 → n = 2.
- **~arrhenius-plot — BUILD:** `linearFunction`. Values slope m, E = −mR, intercept ln A, A.
  Example: slope −9622 K → E = 80.0 kJ/mol.
- **Verdict:** 3 pages.

#### reaction-engineering#1 — Batch, CSTR and PFR design

| Question type                                    | Page          | Mark            |
| ------------------------------------------------ | ------------- | --------------- |
| CSTR and PFR volume for a first-order conversion | main          | Solves          |
| second-order liquid reaction in each reactor     | ~second-order | Solves          |
| batch time for a conversion                      | ~batch        | Solves          |
| CSTRs in series                                  | ~series       | Solves          |
| Levenspiel plot: which reactor is smaller        | ~levenspiel   | Solves (⏳ P33) |

- **Main — BUILD:** `bars` (V_CSTR beside V_PFR) until P33. Values k (per min), X, v₀, τ_CSTR,
  V_CSTR, τ_PFR, V_PFR. Relations: τ_CSTR = X ÷ (k(1 − X)); τ_PFR = −ln(1 − X) ÷ k; V = v₀τ.
  Assumptions: first order, liquid phase (constant density), isothermal; the PFR line names the
  integral ∫dX ÷ (k(1 − X)) from 0 to X (N10). Example: 0.2 per min, X = 0.8, 10 L/min → CSTR
  20 min, 200 L; PFR 8.05 min, 80.5 L. startWith k, X, v₀.
- **~second-order — BUILD:** same. Values k, C_A0, X, τ_CSTR, τ_PFR. Relations:
  τ_CSTR = X ÷ (kC_A0(1 − X)²); τ_PFR = X ÷ (kC_A0(1 − X)). Example: 0.5 L/(mol·min), 2 mol/L, 0.8
  → 20 min and 4 min.
- **~batch — BUILD:** `functionGraph` exponential (C_A against t). Values k, X, t. Relation:
  t = −ln(1 − X) ÷ k. Example: 0.2 per min, X = 0.9 → 11.5 min.
- **~series — BUILD:** `bars` (conversion after each tank). Values k, τ each, n, X. Relation:
  X = 1 − 1 ÷ (1 + kτ)ⁿ. Example: two tanks of 5 min, 0.2 per min → 0.75.
- **~levenspiel — BUILD ⏳ P33:** `functionGraph` with **P33** `levenspiel` (F_A0 ÷ (−r_A) against
  X; the CSTR rectangle and the PFR area). Values F_A0, k, C_A0, X, V_CSTR, V_PFR. Example: the
  main page's numbers, the two areas 200 and 80.5 L.
- **Verdict:** 5 pages.

#### reaction-engineering#2 — Multiple reactions

| Question type                                             | Page         | Mark            |
| --------------------------------------------------------- | ------------ | --------------- |
| time and amount of the intermediate's maximum (A → B → C) | main         | Solves (⏳ P32) |
| instantaneous selectivity of parallel reactions           | ~selectivity | Solves          |

- **Main — BUILD ⏳ P32:** `chemDiagram` **P32** `mode: 'series'` (C_A, C_B, C_C against t, B's peak).
  Values k₁, k₂, C_A0, t_max, C_B,max, yield C_B,max ÷ C_A0. Relations: t_max = ln(k₂ ÷ k₁) ÷ (k₂ −
  k₁); C_B,max = C_A0(k₁ ÷ k₂)^(k₂ ÷ (k₂ − k₁)). Assumptions: first-order steps, batch or PFR, no B
  in the feed; k₁ ≠ k₂. Example: 0.5 and 0.2 per h, 2 mol/L → t_max = 3.05 h, C_B,max = 1.086 mol/L,
  yield 54%. startWith k₁, k₂, C_A0.
- **~selectivity — BUILD:** `functionGraph` linear (S against C_A). Values k_D, k_U, C_A, orders
  a_D = 2 and a_U = 1 (fixed), S. Relation: S = k_DC_A ÷ k_U. Example: 0.5 L/(mol·min), 0.1 per
  min, 1 mol/L → S = 5; high C_A favors the second-order product, so a PFR or batch beats a CSTR.
- **Verdict:** 2 pages.

#### reaction-engineering#3 — Catalysis

| Question type                                       | Page           | Mark           |
| --------------------------------------------------- | -------------- | -------------- |
| fractional coverage and rate (Langmuir)             | main           | Solves         |
| effectiveness factor of a spherical pellet (Thiele) | ~effectiveness | Solves (⏳ N8) |
| order of the steps on a catalyst                    | ~steps         | Solves         |

- **Main — BUILD:** `functionGraph` rational (θ = KP ÷ (1 + KP), approaching 1). Values K
  (per atm), P_A, θ, k, rate. Relations: θ = KP ÷ (1 + KP); rate = kθ. Assumptions: one adsorbed
  species per site; surface reaction limits the rate (Langmuir–Hinshelwood, single site). Example:
  0.5 per atm, 2 atm → θ = 0.5; k = 0.1 mol/(kg·s) → 0.05 mol/(kg·s). startWith K, P_A, k.
- **~effectiveness — BUILD ⏳ N8:** `functionGraph` (η against φ, the 3 ÷ φ tail). Values R, k,
  D_e, φ, η. Relations: φ = R√(k ÷ D_e); η = (3 ÷ φ²)(φ coth φ − 1). Example: 3 mm, 10 per s,
  10⁻⁶ m²/s → φ = 9.49, η = 0.283.
- **~steps — BUILD (sequence):** reactant diffuses from the bulk to the pellet surface; diffuses
  into the pores; adsorbs on a site; reacts on the surface; product desorbs; diffuses out of the
  pores; diffuses into the bulk fluid.
- **Verdict:** 3 pages.

### 20. process-control — Process Dynamics & Control

#### process-control#0 — Process dynamics

| Question type                                   | Page          | Mark   |
| ----------------------------------------------- | ------------- | ------ |
| first-order step response at a time; 63.2% at τ | main          | Solves |
| second-order overshoot, decay ratio, period     | ~second-order | Solves |
| time constant of a mixing tank                  | ~tank         | Solves |

- **Main — BUILD:** `functionGraph` exponential with `r` (y = KΔu − KΔue^(−t ÷ τ), the asymptote
  KΔu and t = τ marked) until P5. Values gain K, step Δu, time constant τ, time t, response y,
  final value. Relations: y = KΔu(1 − e^(−t ÷ τ)); final = KΔu. Assumptions: first-order, starts
  at steady state (deviation variables), no dead time; the step names the ODE τ dy ÷ dt + y = Ku
  it solves. Example: K = 2, Δu = 3, τ = 5 min → final 6; at 5 min 3.79 (63.2%); at 10 min 5.19.
  startWith K, Δu, τ, t.
- **~second-order — BUILD ⏳ P5:** **P5** `stepResponse` underdamped. Values ζ (0–0.99), ω_n,
  overshoot OS, decay ratio, period P. Relations: OS = e^(−πζ ÷ √(1 − ζ²)); decay = OS²;
  P = 2π ÷ (ω_n√(1 − ζ²)). Example: ζ = 0.3, ω_n = 0.5 per min → OS = 37.2%, decay 0.139, P = 13.2 min.
- **~tank — BUILD:** P9 tank. Values volume V, flow q, τ. Relation: τ = V ÷ q. Example: 2 m³,
  0.1 m³/min → 20 min.
- **Verdict:** 3 pages.

#### process-control#1 — Feedback control

| Question type                    | Page       | Mark   |
| -------------------------------- | ---------- | ------ |
| offset with proportional control | main       | Solves |
| closed-loop time constant        | main       | Solves |
| what P, I and D action each do   | ~modes     | Solves |
| fail-open or fail-closed valve   | ~fail-safe | Solves |

- **Main — BUILD ⏳ P34:** **P34** `blockDiagram` loop (setpoint, comparator, K_c, process K_p ÷
  (τs + 1), sensor). Values K_c, K_p, τ, setpoint change, loop gain K_cK_p, final value, offset,
  closed-loop τ_cl. Relations: final = setpoint × K_cK_p ÷ (1 + K_cK_p); offset = setpoint − final;
  τ_cl = τ ÷ (1 + K_cK_p). Assumptions: proportional-only control of a first-order process; ideal
  sensor and valve. Example: K_p = 2, K_c = 4, τ = 10 min, +5 → final 4.44, offset 0.556 (11.1%),
  τ_cl = 1.11 min. startWith K_c, K_p, τ, setpoint.
- **~modes — BUILD (sort):** bins "Proportional", "Integral", "Derivative". Cards: output in step
  with the error; leaves a steady offset alone; removes offset over time; can wind up while the
  valve is saturated; acts on how fast the error changes; amplifies measurement noise.
- **~fail-safe — BUILD (sort):** bins "Fail closed (air to open)", "Fail open (air to close)".
  Cards: fuel gas to a furnace; steam to a reboiler; feed to a reactor; cooling water to an
  exothermic reactor; quench water to a hot vessel.
- **Verdict:** 3 pages.

#### process-control#2 — Controller tuning

| Question type                                          | Page | Mark   |
| ------------------------------------------------------ | ---- | ------ |
| Ziegler–Nichols settings from K_u and P_u              | main | Solves |
| IMC PI settings for a first-order-plus-dead-time model | ~imc | Solves |
| FOPDT model from a step test (two-point method)        | ~fit | Solves |

- **Main — BUILD:** `table` (P, PI, PID rows: K_c, τ_I, τ_D). Values ultimate gain K_u, period P_u,
  then K_c, τ_I, τ_D for PID. Relations: PID K_c = 0.6K_u, τ_I = P_u ÷ 2, τ_D = P_u ÷ 8 (P: 0.5K_u;
  PI: 0.45K_u, P_u ÷ 1.2 in the table). Assumptions: K_u and P_u from a closed-loop test at the edge
  of stability; the settings are aggressive (quarter decay). Example: K_u = 8, P_u = 4 min → PID
  4.8, 2 min, 0.5 min. startWith K_u, P_u.
- **~imc — BUILD ⏳ P5:** P5 FOPDT curve. Values K, τ, θ, τ_c, K_c, τ_I. Relations: K_c = τ ÷
  (K(τ_c + θ)); τ_I = τ. Example: 2, 10 min, 2 min, τ_c = 4 min → K_c = 0.833, τ_I = 10 min.
- **~fit — BUILD ⏳ P5:** P5 step test with the 28.3% and 63.2% points. Values t₂₈, t₆₃, τ, θ.
  Relations: τ = 1.5(t₆₃ − t₂₈); θ = t₆₃ − τ. Example: 4 and 10 min → τ = 9 min, θ = 1 min.
- **Verdict:** 3 pages.

#### process-control#3 — Control-loop design

| Question type                              | Page          | Mark           |
| ------------------------------------------ | ------------- | -------------- |
| ultimate gain for three equal lags (Routh) | main          | Solves         |
| stable or not from a cubic's coefficients  | ~routh        | Solves (⏳ N5) |
| static feedforward gain                    | ~feedforward  | Solves         |
| feedback, feedforward, cascade or ratio    | ~architecture | Solves         |

- **Main — BUILD ⏳ P34:** P34 loop with three lags. Values τ, K_p, K_c,u, crossover ω_u, P_u.
  Relations: K_c,uK_p = 8; ω_u = √3 ÷ τ; P_u = 2π ÷ ω_u. Assumptions: three equal first-order lags,
  P control; the step names the Routh row (or s = iω substitution) that gives 8. Example: τ = 2 min,
  K_p = 0.5 → K_c,u = 16, P_u = 7.26 min. startWith τ, K_p.
- **~routh — BUILD ⏳ N5:** `table` (the Routh array). Values a₃, a₂, a₁, a₀, test a₂a₁ − a₃a₀,
  result. Example: s³ + 6s² + 11s + 6 → 66 − 6 = 60 > 0, all positive, stable.
- **~feedforward — BUILD ⏳ P34:** P34 `feedforward`. Values K_d, K_p, K_ff. Relation:
  K_ff = −K_d ÷ K_p. Example: 1.5 and 3 → −0.5.
- **~architecture — BUILD (sort):** bins "Feedback", "Feedforward", "Cascade", "Ratio". Cards:
  thermostat adjusts the heater from the room temperature; a measured feed-flow change moves the
  steam before the temperature drifts; a reactor temperature controller sets the jacket
  temperature controller's setpoint; fuel flow kept at a fixed share of air flow.
- **Verdict:** 4 pages.

### 21. process-design — Process Design

#### process-design#0 — Flowsheet synthesis

| Question type                                    | Page                | Mark   |
| ------------------------------------------------ | ------------------- | ------ |
| the order of design decisions (hierarchy)        | main                | Solves |
| economic potential of the input–output structure | ~economic-potential | Solves |
| separation-sequencing heuristics                 | ~heuristics         | Solves |

- **Main — BUILD (sequence):** batch or continuous; input–output structure; recycle structure;
  separation system; heat integration. Sentence: "Each level fixes the streams the next level
  designs around."
- **~economic-potential — BUILD:** `bars` `flows` (product value in, raw-material cost out).
  Values product rate, product price, feed rate, feed price, hours a year, EP. Relation:
  EP = (product × price − feed × price) × hours. Example: 100 kmol/h at $40, 105 kmol/h at $25,
  8000 h → $1375 an hour, $11.0 million a year (before any equipment or energy cost).
- **~heuristics — BUILD (sort):** bins "Remove early", "Remove late". Cards: a corrosive
  component; the most plentiful component; a component that is easy to separate; the hardest
  split (close boiling points); a hazardous component; the product needing the highest purity.
- **Verdict:** 3 pages.

#### process-design#1 — Equipment sizing

| Question type                             | Page  | Mark   |
| ----------------------------------------- | ----- | ------ |
| heat-exchanger area from duty, U and LMTD | main  | Solves |
| pump power                                | ~pump | Solves |
| drum diameter from holdup time and L ÷ D  | ~drum | Solves |

- **Main — BUILD ⏳ P35:** **P35** `exchangerProfile` countercurrent (hot and cold lines along the
  length, ΔT₁ and ΔT₂). Values duty Q, U, T_h,in, T_h,out, T_c,in, T_c,out, ΔT₁, ΔT₂, LMTD, A (10).
  Relations: ΔT₁ = T_h,in − T_c,out; ΔT₂ = T_h,out − T_c,in; LMTD = (ΔT₁ − ΔT₂) ÷ ln(ΔT₁ ÷ ΔT₂);
  A = Q ÷ (U × LMTD). Assumptions: countercurrent, no phase change, U constant along the exchanger.
  Example: 500 kW, 500 W/(m²·K), hot 150 → 90 °C, cold 30 → 80 °C → 70 and 60 K, LMTD = 64.9 K,
  A = 15.4 m². startWith Q, U, the four temperatures.
- **~pump — BUILD:** `none`. Values Q, head H, efficiency η, power P. Relation: P = ρgQH ÷ η.
  Example: 0.02 m³/s, 40 m, 0.7 → 11.2 kW.
- **~drum — BUILD:** `curvedSolid` cylinder. Values flow, holdup time, fill fraction, V, L ÷ D, D.
  Relations: V = flow × time ÷ fill; V = (π ÷ 4)D²L with L = 3D. Example: 0.5 m³/min, 10 min, half
  full → 10 m³ → D = 1.62 m, L = 4.86 m.
- **Verdict:** 3 pages.

#### process-design#2 — Process economics

| Question type                                          | Page | Mark   |
| ------------------------------------------------------ | ---- | ------ |
| equipment cost by the six-tenths rule and a cost index | main | Solves |
| net present value of a project                         | ~npv | Solves |
| simple payback                                         | ~npv | Solves |

- **Main — BUILD:** `functionGraph` power family (cost against size, exponent 0.6). Values base
  cost C₁, base size S₁, new size S₂, exponent n, index then I₁, index now I₂, C₂. Relation:
  C₂ = C₁(S₂ ÷ S₁)ⁿ(I₂ ÷ I₁). Assumptions: same equipment type and material; sizes within about a
  factor of 10; index values typed from the published CEPCI. Example: $80,000 for 100 m², 250 m²,
  0.6, indexes 550.8 and 800 → 80,000 × 1.733 × 1.452 = $201,000. startWith C₁, S₁, S₂, n, I₁, I₂.
- **~npv — BUILD:** `bars` `flows` (investment down, yearly cash up). Values investment C₀, annual
  cash A, rate i, years n, annuity factor, NPV, payback. Relations: factor = (1 − (1 + i)^(−n)) ÷ i;
  NPV = −C₀ + A × factor; payback = C₀ ÷ A. Example: $1,000,000, $200,000, 10%, 10 years →
  6.145, NPV = $228,900, payback 5 years.
- **Verdict:** 2 pages.

#### process-design#3 — Process safety

| Question type                              | Page   | Mark   |
| ------------------------------------------ | ------ | ------ |
| lower flammability limit of a fuel mixture | main   | Solves |
| mitigated event frequency (LOPA)           | ~lopa  | Solves |
| HAZOP guide word for a deviation           | ~hazop | Solves |

- **Main — BUILD:** `integerLine` `compound` (the flammable range from LFL to UFL, the mixture's
  concentration as a point). Values shares y₁, y₂, y₃ of the fuel, their LFLs, LFL_mix, the
  concentration in air, result (N5). Relation: LFL_mix = 1 ÷ Σ(y_i ÷ LFL_i). Assumptions:
  Le Chatelier's rule (works best for similar hydrocarbons); air at 25 °C and 1 atm. Example:
  80% methane (5.0%), 15% ethane (3.0%), 5% propane (2.1%) → 1 ÷ 0.2338 = 4.28% fuel in air.
  startWith shares, LFLs.
- **~lopa — BUILD:** `powerScale` (each frequency on the 10ⁿ ruler). Values initiating frequency f, PFD₁,
  PFD₂, mitigated frequency. Relation: f_m = f × PFD₁ × PFD₂. Example: 0.1 a year, 0.1, 0.01 →
  10⁻⁴ a year.
- **~hazop — BUILD (sort):** bins "No", "More", "Less", "Reverse", "Other than". Cards: pump
  stops, no flow to the reactor; control valve sticks open, too much feed; fouled exchanger
  passes too little cooling; check valve fails and product flows back; wrong drum unloaded into
  the tank; heater trips, temperature falls below the set point (Less).
- **Verdict:** 3 pages.

## Pictures for the pictures chat

Each request: the pages, what it draws, its fields (variable ids or numbers), what must stay true
(the harness check in `harness/pictures.ts`), and the kind it extends. Options on existing kinds
come first where one fits: 27 new kinds, 6 options on existing kinds, 2 layout figures. Every label is a page value with
its symbol (`rep.label`, `rep.tag`); nothing depends on color alone.

1. **P1 `wing` (new kind).** Pages: aerodynamics#0, its 3 types, #1 main, #2 and its 2 types.
   Draws a section (chord line, camber line from NACA digits, angle of attack against the
   relative wind) or a planform (span, root and tip chord, trailing vortices, downwash). Options:
   `forces` (L ⟂ wind and D along it, to scale), `pressure` (C_p arrows, suction outward),
   `circulation` (a loop of Γ), `mode: 'section' | 'planform'`. Fields: alpha, alphaL0, digits
   (d1, d2, d34), chord, cl, cd, span, rootChord, tipChord. Must stay true: lift is drawn ⟂ the
   wind, not the chord; the camber peak sits at d2 × 10% of the chord; AR read off the drawing
   equals b² ÷ S within 2%.
2. **P2 `duct` (new kind).** Pages: compressible-flow#0 (all), #2 main, propulsion#0~turbojet,
   #2 (both). A stream tube or converging–diverging nozzle drawn to scale by A ÷ A*, stations with
   M, p, T; `chamber` (a rocket chamber before the throat); `shock` at a station; `engine`
   (turbojet outline, V₀ in, V_e out). Fields: M, areaRatio, p0, T0, pe, Me, shockAt. Must stay
   true: the throat is the narrowest section and is where M = 1 when choked; M < 1 before the
   throat on the subsonic branch; drawn exit width ÷ throat width = √(Ae ÷ At) for a round nozzle.
3. **P3 `supersonicFlow` (new kind).** Pages: aerodynamics#3 main, compressible-flow#1 (all), #3
   (all). Modes: `normal` (a vertical shock, M₁ > 1 to M₂ < 1, ratio bars), `wedge` (wedge θ,
   oblique shock at β), `corner` (expansion fan between Mach lines at μ₁ and μ₂), `flatPlate`
   (Ackeret plate at α with shocks and fans at the edges), `mach` (sound fronts from a moving
   point; the cone at M > 1). Fields: M1, beta, theta, M2, alpha. Must stay true: β > θ and
   β ≥ μ₁ = sin⁻¹(1 ÷ M₁); the fan opens by exactly θ; no cone drawn at M < 1.
4. **P4 `freeBody` options `object: 'aircraft'`, `bank`, `stability` (extends `freeBody`).**
   Pages: flight-mechanics#0 (5 pages), #1 main, #3 main and ~coordinated-turn. Side view with L,
   W, T, D to scale and the climb angle γ; front view banked at φ with L cos φ and L sin φ
   dashed; `stability` marks the aerodynamic center, CG and neutral point on the mean chord with
   the static margin bracket. Fields: W, L, T, D, gamma, phi, hac, h, hn. Must stay true: in level
   flight the L and W arrows are equal; L cos φ equals W in a level turn; the CG mark is ahead of
   the neutral point exactly when SM > 0.
5. **P5 `stepResponse` (new kind).** Pages: flight-mechanics#2 main, process-control#0~second-order,
   #2~imc, #2~fit (and the first-order main once drawn). Input step under the output against
   time; first-order with dead time θ (63.2% at θ + τ marked, the final value dashed);
   second-order with overshoot, period and decay ratio marked; `oscillation` (free decay from a
   disturbance inside the e^(−ζω_n t) envelope, t½ marked); `points` (28.3% and 63.2% times).
   Fields: K, du, tau, theta, zeta, wn, t. Must stay true: the curve passes 63.2% of the final
   value at t = θ + τ; the first peak's height ÷ final equals 1 + OS; the envelope bounds every peak.
6. **P6 `section` (new kind).** Pages: aerospace-structures#0 (both), steel-design#1 main, #2 main
   and ~shear, concrete-design#0 (both), #1 main, #2 (main, ~spiral). Cross-sections to scale:
   W-shape (d, b_f, t_f, t_w, axes), rectangular RC beam or column with bars (count, size,
   cover), `whitney` (the 0.85f′_c block depth a, the strain line 0.003 to ε_t, the neutral axis at
   c), `thinWalled` (box or tube, shear-flow arrows, enclosed area shaded), `cylinder` (pressurized
   skin element, hoop and axial arrows), `interaction` (a later P–M curve for columns). Fields:
   b, d, h, bars, barSize, As, a, c, epsT, q, Am. Must stay true: a = β₁c; the strain line is
   straight and crosses zero at c; bars sit inside the cover; shear flow is the same value all round
   a single closed cell.
7. **P7 `column` (new kind).** Pages: aerospace-structures#2 (all), steel-design#1 main,
   concrete-design#2~slenderness. A column with its end conditions drawn (pin, fixed, free), the
   buckled half-wave over KL, the load P; `panel` (a skin panel between stringers buckling in
   half-waves). Fields: L, K, P, Pcr. Must stay true: the drawn half-wave length is K × L; K is
   one of 0.5, 0.7, 1, 2 and matches the ends drawn.
8. **P8 `lamina` (new kind).** Pages: aerospace-structures#1 (all). A block of fibers in matrix at
   V_f, loaded along (fiber and matrix as springs side by side) or across (in series), E bars
   for fiber, matrix and composite. Fields: Vf, Ef, Em, E1, E2. Must stay true: the fiber share of
   the drawn cross-section is V_f within 2%; E₂ ≤ E₁.
9. **P9 `controlVolume` (new kind).** Pages: propulsion#3~burner, environmental#1~activated-sludge,
   material-energy-balances (#0 main and ~dof, #1 all, #2~combustion, #3 main), separations#2
   (both), #3 (both), process-control#0~tank. A unit as a box (mixer, splitter, column,
   evaporator with bypass, burner, tank, membrane, a chain of `stages`, crosscurrent or
   countercurrent) with labeled streams (flow and composition), heat and work arrows, and a
   balance line "in = out" per component. Fields: streams[{ flow, fractions }], Q, W, stages.
   Must stay true: every component's total in equals total out (plus generation where a
   reaction is named) within 0.1%; the stream arrows point the way the flow goes.
10. **P10 `propertyDiagram` (new kind).** Pages: propulsion#0 (main, ~compressor),
    chemical-thermodynamics#0 (both). Modes: `Ts` (Brayton states 1–4, constant-pressure lines,
    the real compression dashed), `Pv` (isotherms ideal and van der Waals, the state point, the
    critical point). Fields: T1, rp, T3, T2, T4, P, V, T, a, b. Must stay true: T₂ > T₁ and
    T₃ > T₄; the real T₂ lies right of the ideal one; the vdW isotherm meets the ideal one at
    large V.
11. **P11 `rocket` (new kind).** Pages: propulsion#1 (all). A rocket with dry and propellant mass
    as bars, v_e out of the nozzle, Δv beside; `stages: 2` stacks two with the drop between.
    Fields: m0, mf, Isp, dv, stages. Must stay true: the propellant bar ÷ total equals
    1 − m_f ÷ m₀; Δv grows with the mass ratio.
12. **P12 `circularMotion` options `mode: 'hohmann'`, `visViva`, `pair` (extends
    `circularMotion`).** Pages: orbital-mechanics#0~vis-viva, #2 main, #3 main and ~synodic.
    Hohmann: two circles, the transfer half-ellipse tangent to both, Δv₁ and Δv₂ arrows, TOF;
    Sun-centered scale for interplanetary. `visViva`: a point on the kepler ellipse with r and v.
    `pair`: two planets with their angular positions. Fields: r1, r2, a, r, v, dv1, dv2. Must stay
    true: the ellipse touches the inner circle at perigee and the outer at apogee; a =
    (r₁ + r₂) ÷ 2 measured on the drawing.
13. **P13 explore figure `orbitElements` (layout figure).** Page: orbital-mechanics#1~elements.
    The equatorial plane, the orbit tilted by i, the node line, the vernal-equinox direction;
    scenes light i, Ω, ω, ν or the ellipse's a and e. Must stay true: Ω is measured in the
    equatorial plane, ω in the orbit plane.
14. **P14 `beam` (new kind).** Pages: structural-analysis (#0 main, ~udl, ~cantilever; #1 all; #2
    all; #3 main sketch `axial`), steel-design#2 (main, ~deflection), concrete-design#1 main,
    #3~slab-thickness. A beam with pins, rollers or fixed ends, point and uniform loads,
    reactions, and the shear and moment diagrams under it; `influence` (the influence line for a
    reaction, shear or moment at a section); `continuous` (two or three spans, the distribution
    table under it); `deflected` (the deflected shape, Δ); `stirrups` (spacing marks along the
    span); `axial` (bars in series with nodes). Fields: L, loads[{ P, a } | { w, from, to }],
    supports, RA, RB, Mmax, c. Must stay true: the shear diagram's area between two points equals
    the change in moment; reactions balance the loads (ΣF = 0, ΣM = 0); the moment peak is where
    shear crosses zero.
15. **P15 `truss` (new kind).** Pages: structural-analysis#0~truss, ~determinacy. Pratt, Howe or
    Warren panels, joint loads, reactions, a section cut; member forces labeled with T or C (and
    drawn as pulling or pushing arrows on the joints). Fields: panels, panelLength, height, P,
    cutPanel. Must stay true: m + r − 2j shown equals the drawing's own counts; the cut chord
    force × height equals the moment at the cut joint.
16. **P16 `soilPhases` (new kind).** Pages: soil-mechanics#0 main, #1~sand-cone. The three-phase
    block (air, water, solids) with volumes on one side and weights on the other. Fields: e, w,
    Gs, S, Vv, Vs. Must stay true: the drawn void height ÷ solid height equals e; the water share
    of the voids equals S.
17. **P17 `soilProfile` (new kind).** Pages: soil-mechanics#2 (all), #4 (both), transportation#2
    main, concrete-design#3 main. Layers to scale with the water table; `stress` (σ, u, σ′ lines
    with depth); `consolidation` (a clay layer under a load, drainage arrows, the settled surface);
    `footing` (width B at D_f, failure wedges, the critical perimeter for punching shear in plan);
    `pavement` (surface, base, subbase with a, D, m and the axle load). Fields: layers[{ thickness,
    gamma }], zw, z, B, Df, q, D1–D3. Must stay true: σ′ = σ − u at the marked depth; u is 0
    above the water table; the footing's drawn depth ÷ width equals D_f ÷ B.
18. **P18 `mohrCircle` (new kind).** Pages: soil-mechanics#3 main, ~undrained. A Mohr circle from
    σ₃ to σ₁, the Mohr–Coulomb line (c, φ) tangent to it, the failure plane angle; a flat
    envelope for undrained tests. Fields: s3, s1, c, phi. Must stay true: the line touches the
    circle (distance from center = radius within 0.5%) at failure; the angle drawn is 45° + φ ÷ 2.
19. **P19 `streamChannel` options `manning`, `froude`, `specificEnergy`, `jump` (extends
    `streamChannel`).** Pages: hydraulics-hydrology#0 (all). The slope and n beside the section;
    Fr with "sub" or "super" by the depth; an E–y curve with y_c at its minimum; a jump with y₁,
    the roller and y₂. Fields: n, S, Fr, q, yc, y1, y2. Must stay true: E is least at y_c;
    y₂ > y₁ and Fr₁ > 1 for a jump.
20. **P20 `pipeNetwork` (new kind).** Pages: hydraulics-hydrology#1 (all), #3 main. One pipe with
    the energy and hydraulic grade lines falling by h_f; two parallel pipes between nodes; a loop
    of four with flow arrows and ΔQ; `full` pipe in section. Fields: D, L, Q, hf, pipes[{ K, Q }].
    Must stay true: the grade lines fall in the flow direction; the two parallel pipes' h_f are
    equal; the gap between EGL and HGL is V² ÷ (2g).
21. **P21 `hydrograph` (new kind).** Pages: hydraulics-hydrology#2 (main, ~rational), #3~detention.
    Rain bars hanging from the top, the runoff hydrograph below with peak and t_c; `split` (P cut
    into I_a, infiltration and runoff Q); `detention` (inflow and outflow triangles, storage
    shaded). Fields: P, Ia, Q, Qp, tc, Qin, Qout, tb. Must stay true: I_a + F + Q = P; the shaded
    storage area equals ½t_b(Q_i − Q_o).
22. **P22 `roadCurve` (new kind).** Pages: transportation#1 (all). `stopping` (reaction then
    braking distance as two strips ahead of a car), `plan` (PC, PI, PT, R, Δ, T, L), `profile`
    (two grades, the vertical curve, the sight line of length S). Fields: V, t, a, G, R, Delta,
    G1, G2, L, S. Must stay true: T = R tan(Δ ÷ 2) on the drawing; the sight line clears the crest
    exactly when L meets the formula.
23. **P23 `losScale` (new kind).** Page: transportation#3 main. A density bar 0–45+ pc/mi/ln cut
    into A–F bands with the letters printed, the segment's density marked. Fields: D. Must stay
    true: the marked letter is the band containing D.
24. **P24 `connection` (new kind).** Pages: steel-design#1~tension, #3 (all). A plate with bolt
    holes (rows, pitch, gage), the net section line, the block-shear path, fillet welds with leg
    and length. Fields: plateWidth, t, holes, holeSize, n, weldLeg, weldLength. Must stay true:
    holes drawn = the holes value; the net width drawn = width − holes × size.
25. **P25 `settlingTank` (new kind).** Page: environmental#0 main. A basin to scale, a particle
    entering at the top and falling at v_s while crossing at the flow speed; the share settled.
    Fields: length, width, depth, Q, vs, v0. Must stay true: the particle lands inside the basin
    exactly when v_s ≥ v₀.
26. **P26 `plume` (new kind).** Page: environmental#2 main. Stack, plume rise to H, the plume's
    Gaussian spread (σ_z), a receptor at ground level downwind. Fields: H, sy, sz, u, Q, C. Must
    stay true: the drawn plume centerline sits at H; the spread grows with distance.
27. **P27 `survey` (new kind), mode `traverse`.** Pages: surveying#0~angle-closure, #2 (main, ~closure,
    ~compass-rule). Stations and courses with azimuths, one course's latitude and departure
    drawn, the misclosure gap. Fields: courses[{ azimuth, length }], lat, dep. Must stay true:
    lat² + dep² = L²; north is up.
28. **P28 `survey` mode `level` (same kind as P27).** Pages: surveying#1 (main, ~curvature). A level between two
    rods, BS and FS readings, the HI line, the ground, BM and TP elevations; one long sight over a
    curved Earth for curvature and refraction. Fields: BM, BS1, FS1, BS2, FS2. Must stay true:
    each elevation equals the HI − FS shown.
29. **P29 `survey` mode `heights` (same kind as P27).** Page: surveying#3 main. Terrain, geoid and ellipsoid curves with h,
    N and H at a point. Fields: h, N, H. Must stay true: H = h − N on the drawing, N drawn below
    the ellipsoid when negative.
30. **P30 `phaseEnvelope` (new kind).** Pages: chemical-thermodynamics#2 (all), separations#0
    (all), #1 (both). `Pxy` (bubble and dew curves at T, a tie line at x), `xy` (equilibrium
    curve for constant α or a line y = mx, the 45° line, operating lines, q-line, `steps`
    McCabe–Thiele staircase). Fields: P1sat, P2sat, x1, y1, alpha, m, R, xD, xB, xF, q. Must stay
    true: the bubble curve lies above the dew curve in Pxy; the step count shown equals the
    stairs drawn; operating lines cross on the q-line.
31. **P31 `velocityProfile` (new kind).** Pages: transport-phenomena (all 12 pages). Tube or plates
    with velocity arrows (parabolic or linear) and τ_w; `film` on a wall; `temperature` through
    wall layers (a straight drop per layer, ∝ L ÷ k); `concentration` across a film or a Stefan
    tube; `analogy` (three boundary layers side by side, δ_T = δPr^(−1/3)). Fields: R, vmax,
    tauW, layers[{ L, k }], cA1, cA2, Pr, Sc. Must stay true: v_max = 2v_avg in a tube; the
    drop in each layer is proportional to its L ÷ k.
32. **P32 `chemDiagram` option `mode: 'series'` (extends `chemDiagram`).** Page:
    reaction-engineering#2 main. C_A, C_B, C_C against t for A → B → C, B's peak marked. Fields:
    k1, k2, CA0, tmax. Must stay true: C_A + C_B + C_C = C_A0 at every t; the B peak is at t_max.
33. **P33 `functionGraph` option `levenspiel` (extends `functionGraph`).** Page:
    reaction-engineering#1~levenspiel. F_A0 ÷ (−r_A) against X; the CSTR rectangle and the PFR area
    under the curve, each labeled with its volume. Fields: FA0, k, CA0, X. Must stay true: the
    rectangle's area equals V_CSTR and the shaded area equals V_PFR within 1%.
34. **P34 `blockDiagram` (new kind).** Pages: process-control#1 main, #3 (main, ~feedforward).
    Setpoint, comparator, controller, valve, process, sensor blocks with gains, the disturbance
    entering; `feedforward` and `cascade` wiring. Fields: Kc, Kp, tau, Kd, Kff. Must stay true:
    the feedback sign at the comparator is minus; every block's gain shown is a value.
35. **P35 `exchangerProfile` (new kind).** Page: process-design#1 main. Hot and cold temperature
    lines along the length, countercurrent (or cocurrent), ΔT₁ and ΔT₂ at the ends. Fields: Thi,
    Tho, Tci, Tco. Must stay true: the hot line stays above the cold line (no temperature cross).
36. **P36 card figure `pfdSymbol` (layout figure).** Page: material-energy-balances#0~symbols.
    The standard PFD symbols for pump, compressor, shell-and-tube exchanger, fired heater, column,
    flash drum, packed absorber, CSTR, packed bed, each a card image with its name.
37. **P37 `functionGraph` option `logAxes: { x?, y? }` (extends `functionGraph`).** Pages:
    aerospace-structures#3~basquin, soil-mechanics#0~gradation. Log-scaled axes with decade ticks
    (S–N curve on log–log; grain size on a log x-axis with D₁₀, D₃₀, D₆₀ marked). Must stay true:
    a power law draws as a straight line on log–log axes.

## Research to do

For a separate research chat. Everything collected goes under `research/` (new folders
`research/textbooks/college/` and `research/questions/college/`) and is reference only:
no problem, number set, figure or sentence goes into a page. Licences below were checked on the
publisher's page where marked ✓; the rest are to confirm. robots.txt was not checked here; the
research chat checks it per site, as `research/questions/SOURCES.md` describes, and records it.

### Textbooks

| Source                                                                                        | URL                                                                                                                      | Licence                                               | Courses (topics)                                                                 | Extract                                                                                                                             |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Leishman, _Introduction to Aerospace Flight Vehicles_                                         | https://eaglepubs.erau.edu/introductiontoaerospaceflightvehicles/                                                        | CC BY-NC-ND 4.0 ✓                                     | aerodynamics (all), flight-mechanics#0–1, propulsion#0–1, aerospace-structures#0 | chapter list, worked-example types, typical numbers (wing loading, C_L, I_sp), notation                                             |
| NASA Glenn, _Beginner's Guide to Aeronautics_                                                 | https://www.grc.nasa.gov/www/k-12/airplane/                                                                              | U.S. government, public domain (confirm page notices) | aerodynamics#0–1, #3; compressible-flow#0–1; propulsion#0–1                      | equations as NASA writes them, the standard atmosphere, nozzle and shock pages                                                      |
| NACA Report 1135, _Equations, Tables, and Charts for Compressible Flow_                       | https://ntrs.nasa.gov (report 1135)                                                                                      | public domain                                         | compressible-flow (all)                                                          | the relation forms and symbols; check values for the harness (A/A*, shock ratios)                                                   |
| Bar-Meir, _Fundamentals of Compressible Fluid Mechanics_ (Potto)                              | http://www.potto.org                                                                                                     | GNU FDL (confirm version)                             | compressible-flow (all), propulsion#2                                            | chapter order (isentropic, shocks, nozzle, Fanno, Rayleigh), example types                                                          |
| MIT OCW 16.01–16.04 Unified Engineering; 16.100, 16.120, 16.333, 16.20, 16.50, 16.512, 16.346 | https://ocw.mit.edu                                                                                                      | CC BY-NC-SA 4.0                                       | all aerospace courses                                                            | lecture order per course, problem-set types, number ranges                                                                          |
| MIT 16 Unified, _Thermodynamics and Propulsion_ notes (Greitzer, Spakovszky, Waitz)           | https://web.mit.edu/16.unified/www/FALL/thermodynamics/                                                                  | freely readable, licence to confirm                   | propulsion#0–1                                                                   | Brayton and thrust derivations, efficiency definitions                                                                              |
| JPL, _Basics of Space Flight_                                                                 | https://science.nasa.gov/learn/basics-of-space-flight/                                                                   | NASA, public (confirm)                                | orbital-mechanics (all)                                                          | element definitions, Hohmann and gravity-assist explanations                                                                        |
| Udoeyo, _Structural Analysis_                                                                 | https://temple.manifoldapp.org/projects/structural-analysis                                                              | CC BY-NC-ND 4.0 ✓                                     | structural-analysis (all)                                                        | chapter list (loads, determinate, influence lines, deflections, force method, slope-deflection, moment distribution), example types |
| Verruijt, _Soil Mechanics_                                                                    | https://geo.verruijt.net                                                                                                 | free to read, all rights reserved (confirm)           | soil-mechanics (all)                                                             | chapter order, effective-stress and consolidation conventions                                                                       |
| Wikibooks, _Fundamentals of Transportation_                                                   | https://en.wikibooks.org/wiki/Fundamentals_of_Transportation                                                             | CC BY-SA                                              | transportation (all)                                                             | traffic flow, SSD, curves, pavement, queueing; example types                                                                        |
| NRCS _National Engineering Handbook_ Part 630; TR-55                                          | https://www.nrcs.usda.gov                                                                                                | public domain                                         | hydraulics-hydrology#2–3                                                         | curve-number method, t_c, unit hydrograph                                                                                           |
| FHWA HEC-22 (urban drainage), HDS-4 (highway hydraulics), HDS-5 (culverts)                    | https://www.fhwa.dot.gov/engineering/hydraulics/                                                                         | public domain                                         | hydraulics-hydrology (all)                                                       | rational method, inlet and pipe design, Manning forms in SI and US                                                                  |
| AISC 360-22 specification; AISC _Design Examples_                                             | https://www.aisc.org/publications/steel-standards/                                                                       | free download, all rights reserved                    | steel-design (all)                                                               | equation numbers, φ and Ω, the shapes used (the facts only: A, r, Z, I)                                                             |
| ACI 318-19 (summary pages only; the code is paid)                                             | https://www.concrete.org                                                                                                 | all rights reserved                                   | concrete-design (all)                                                            | which provisions the course teaches; no text                                                                                        |
| EPA water and wastewater manuals; CT tables (SWTR guidance)                                   | https://www.epa.gov                                                                                                      | public domain                                         | environmental#0–1                                                                | treatment train order, CT ranges, BOD test                                                                                          |
| EPA AP-42 and dispersion-model guidance                                                       | https://www.epa.gov/air-emissions-factors-and-quantification                                                             | public domain                                         | environmental#2                                                                  | Gaussian plume form, stability classes                                                                                              |
| NOAA NGS, _Geodesy for the Layman_, GNSS guidance                                             | https://geodesy.noaa.gov                                                                                                 | public domain                                         | surveying#3                                                                      | h, N, H; error sources                                                                                                              |
| MIT OCW 1.050, 1.060, 1.061, 1.201, 1.34, 1.571, 1.85                                         | https://ocw.mit.edu                                                                                                      | CC BY-NC-SA 4.0                                       | civil courses                                                                    | topic order, problem types                                                                                                          |
| Wikibooks, _Introduction to Chemical Engineering Processes_                                   | https://en.wikibooks.org/wiki/Introduction_to_Chemical_Engineering_Processes                                             | CC BY-SA                                              | material-energy-balances (all)                                                   | DOF analysis, recycle and bypass, extent of reaction                                                                                |
| LearnChemE (screencasts, simulations, ConcepTests)                                            | https://learncheme.com                                                                                                   | CC BY-SA 4.0 ✓                                        | every chemical course                                                            | topic lists per course; ConcepTest question types                                                                                   |
| Woolf et al., _Chemical Process Dynamics and Controls_                                        | https://eng.libretexts.org/Bookshelves/Industrial_and_Systems_Engineering/Chemical_Process_Dynamics_and_Controls_(Woolf) | CC BY 3.0 ✓                                           | process-control (all), process-design#3 (HAZOP)                                  | chapter order, tuning rules as taught, worked examples' types                                                                       |
| Rawlings and Ekerdt, _Chemical Reactor Analysis and Design Fundamentals_                      | https://sites.engineering.ucsb.edu/~jbraw/chemreacfun/                                                                   | free PDF, all rights reserved (confirm)               | reaction-engineering (all)                                                       | rate laws, reactor design equations, notation                                                                                       |
| Fogler, _Elements of CRE_ companion site                                                      | http://umich.edu/~elements/                                                                                              | free to read, all rights reserved                     | reaction-engineering (all)                                                       | problem types, Levenspiel plots, catalysis steps                                                                                    |
| Northwestern _Process Design_ open textbook (wiki)                                            | https://processdesign.mccormick.northwestern.edu                                                                         | licence to confirm                                    | process-design (all)                                                             | sizing heuristics, economics, safety chapters                                                                                       |
| MIT OCW 10.213, 10.302, 10.37, 10.40, 10.450, 10.490, 10.50                                   | https://ocw.mit.edu                                                                                                      | CC BY-NC-SA 4.0                                       | chemical courses                                                                 | lecture order, problem-set types                                                                                                    |
| U.S. Chemical Safety Board reports and videos                                                 | https://www.csb.gov                                                                                                      | public domain                                         | process-design#3                                                                 | hazard types for the HAZOP sort (paraphrased, no case text)                                                                         |
| NCEES _FE Reference Handbook_ (current version)                                               | https://ncees.org/exams/fe-exam/                                                                                         | free to view, all rights reserved                     | every course                                                                     | notation, constants and which formulas the FE gives; units conventions                                                              |

### Questions

| Source                                                                        | URL                                | Licence                   | Courses                                                        | Record per question                                                                              | Target                 |
| ----------------------------------------------------------------------------- | ---------------------------------- | ------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------- |
| NCEES FE exam specifications (Civil, Chemical, Mechanical, Other Disciplines) | https://ncees.org/exams/fe-exam/   | free, all rights reserved | all                                                            | the topic list and item counts per area only (no items exist free); use to weight coverage       | 4 specs                |
| MIT OCW problem sets and exams (courses above)                                | https://ocw.mit.edu                | CC BY-NC-SA 4.0           | all                                                            | course, topic, question type, unknown asked, the given quantities' sizes as ranges, picture used | 30 per course          |
| LearnChemE ConcepTests                                                        | https://learncheme.com             | CC BY-SA 4.0              | chemical courses; fluids and thermo prerequisites              | course, topic, conceptual type, the answer's idea                                                | 40 per chemical course |
| Woolf, end-of-section exercises                                               | (as above)                         | CC BY 3.0                 | process-control                                                | type, numbers as ranges                                                                          | 20                     |
| Wikibooks _Fundamentals of Transportation_ and _ICEP_ exercises               | (as above)                         | CC BY-SA                  | transportation, material-energy-balances                       | type, ranges                                                                                     | 20 each                |
| NASA Glenn and JPL worked problems                                            | (as above)                         | public domain             | aerodynamics, compressible-flow, propulsion, orbital-mechanics | type, ranges                                                                                     | 15 per course          |
| AP Physics C: Mechanics released free-response (bridge level)                 | https://apcentral.collegeboard.org | all rights reserved       | orbital-mechanics#0 (gravitation, orbits)                      | type only                                                                                        | 5                      |
| GRE Physics practice book (gravitation, fluids)                               | https://www.ets.org/gre            | all rights reserved       | orbital-mechanics#0, aerodynamics#1                            | type only                                                                                        | 5                      |

Target: 30–40 recorded questions per course (about 700 in all), each filed under its topic id
(`he.engineering.<course>#<i>`), so the next review's "Tests ask" tables cite real items.

### Engine needs

1. **N1 Units.** MPa, GPa, ksi, ksf, psf, kip·ft, kip·in, kN·m, N/m, kN/m, kip/ft, kN/m³, in³,
   in⁴, mm⁴, m⁴, m³/s, ft³/s, L/s, m³/d, MGD, kg/s, kmol/h, mol/s, kJ/kg, kJ/(kg·K), J/(mol·K),
   kJ/mol, Pa·s, cP, m²/s, W/(m·K), W/(m²·K), W/m³, mg/L, μg/m³, ppm, veh/h, veh/km, pc/h/ln,
   pc/mi/ln, bar, km³/s², rad/s, °/s, 1/s, 1/min, 1/h, L/(mol·min), L/(m²·h), $ and $/yr.
   Manning's 1.49 in US units needs the step to convert or the page to fix SI. Topics: almost all.
2. **N2 Trial lines for implicit relations.** The solver's root finder already solves them; the
   step must show two or three trial values and the converged one ("Try M = 2.2: A/A* = 2.005;
   …") and the harness must read it. Topics: compressible-flow#0–3, orbital-mechanics#1~kepler,
   hydraulics-hydrology#0 and #1~parallel, chemical-thermodynamics#0 and #2 (bubble T),
   concrete-design#0 (A_s for M_u).
3. **N3 Branch choice.** Where a relation has two physical roots, a value the student picks
   (subsonic or supersonic; weak or strong shock; the alternate depth; vapor or liquid volume) and
   the solver keeps to it. Topics: compressible-flow#0–2, hydraulics-hydrology#0,
   chemical-thermodynamics#0, concrete-design#0.
4. **N4 Data rows.** Picking a named row sets several values or hidden constants: W-shapes (A, r,
   Z, I, d, t_w), bar sizes (#3–#11 areas), compounds (T_c, P_c, ω; Antoine A, B, C), standard pipe
   sizes, slab support cases, steam saturation (T, P, h_f, h_g). Topics: steel-design#1–2,
   concrete-design#0, #2–3, chemical-thermodynamics#0 and #2, hydraulics-hydrology#3,
   material-energy-balances#3.
5. **N5 Category results.** A derived word or letter from thresholds, shown as an answer line:
   LOS A–F, well or poorly graded, USCS group, tension-controlled, short or slender, stable or not,
   inside or outside the flammable range, which combination governs. Topics: soil-mechanics#0,
   transportation#3, steel-design#0, concrete-design#0 and #2, process-control#3, process-design#3.
6. **N6 Degrees, minutes, seconds and bearings.** Input and display of 4°30′00″ and N 52°10′ E,
   arithmetic on them in steps. Topics: surveying#0–2.
7. **N7 Lists and counts from a construction.** A table of ordinates as a value (unit hydrograph
   convolution) and a whole number read off a picture's construction (McCabe–Thiele stages).
   Topics: hydraulics-hydrology#2 (unit hydrograph, not planned yet), separations#0~mccabe-thiele.
8. **N8 Hyperbolic functions.** sinh, cosh, tanh, coth in relations, `toLatex` and the harness.
   Topics: reaction-engineering#3~effectiveness (later fin efficiency and catenary pages elsewhere).
9. **N9 min, max and piecewise relations.** A relation whose formula switches at a limit (Euler
   or inelastic buckling, yielding or rupture, NC or OC clay, S < L or S > L, A_s,min), solved
   forward and, where single-valued, backward; the step names which case holds and why.
   Topics: aerospace-structures#2, steel-design#1–3, soil-mechanics#2, transportation#1,
   concrete-design#0 and #2.
10. **N10 Integral and ODE result lines.** A step line kind that states the integral or ODE and
    its closed-form result before substituting ("∫ dX ÷ (k(1 − X)) from 0 to X = −ln(1 − X) ÷ k"),
    typeset by `toLatex` with ∫ and limits; the harness checks the result line, not the
    calculus. Topics: reaction-engineering#1, propulsion#1, process-control#0, flight-mechanics#0~range.
11. **N11 Sequences without spans.** The sequence layout shows stages in order with no time
    span (or spans hidden). Topics: the 7 sequences.
12. **N12 Money.** $ values with thousands separators and a money unit in relations (annuity
    factor, NPV); the `dollars` formatter exists, a unit for it does not. Topics: process-design#0, #2.
13. **N13 Harness phrases.** The new step words: "by trial", "branch", "governs", "case",
    "integrate", "for a first-order", "Routh", "LMTD", "compass rule". Taught to `PHRASES` as
    pages are built.
14. **N14 Symbols.** Dotted symbols (ṁ, ṅ, Q̇, ξ̇) and multi-letter subscripts (C_L, C_D0, f′_c,
    σ′₃, K_c,u) in `subscripts.ts` and `toLatex` (\dot{m}, C_{D0}). Topics: almost all.

## Not in the taxonomy

- **Structural Analysis has no deflection topic** (virtual work, conjugate beam, double
  integration). Every textbook teaches it before the force method; `structural-analysis#2` leans
  on it. Add "Deflections" between determinate and indeterminate structures.
- **Compressible Flow lacks Fanno and Rayleigh flow** (duct friction, heat addition), standard in
  the course after shocks. Add a topic or fold into "Nozzle flow".
- **Soil Mechanics lacks permeability and seepage** (Darcy's law, flow nets) and **lateral earth
  pressure** (Rankine, retaining walls); both are core and on the FE Civil specification.
- **Hydraulics & Hydrology lacks pumps** (system curve, NPSH) and **culverts**.
- **Reaction Engineering lacks nonisothermal reactors** (energy balance, adiabatic temperature
  rise).
- **Civil has no Construction Engineering course** (CPM scheduling, earthwork) and no
  **engineering economics** home; FE Civil tests both. Process economics here covers the second
  for chemical only.
- **Aerospace has no spacecraft attitude dynamics or aircraft design (sizing) course**; Propulsion
  lacks **electric propulsion**.
- **Prerequisites:** `transportation` needs only Calculus I in the taxonomy; its geometric and
  pavement topics also assume Statics. `surveying` lists a Grade 10 skill only, which is right for
  its level.

## Summary

- **Pages:** 254 (85 topic pages + 169 problem types): 230 calculators and 24 layouts (15 sorts,
  7 sequences, 2 explores); 102 marked ⏳, most waiting on a new picture kind, the rest on N2–N9.
  Ready to build now with existing kinds: about 150 pages (all `functionGraph`, `linearFunction`,
  `circularMotion`, `reaction`, `equilibriumChart`, `bars`, `matrixGrid`, `triangleSolver`,
  `streamChannel`, `reserve`, `pieChart`, `integerLine`, `complexPlane`, `vectorDiagram`,
  `atmosphereLayers`, `powerScale`, `table`, `none` pages, and the sorts).
- **Pictures:** 37 requests (P1–P37): 27 new kinds (wing, duct, supersonicFlow, stepResponse,
  section, column, lamina, controlVolume, propertyDiagram, rocket, beam, truss, soilPhases,
  soilProfile, mohrCircle, pipeNetwork, hydrograph, roadCurve, losScale, connection,
  settlingTank, plume, survey, phaseEnvelope, velocityProfile, blockDiagram, exchangerProfile),
  6 options on existing kinds (freeBody aircraft, circularMotion hohmann, streamChannel manning,
  chemDiagram series, functionGraph levenspiel and logAxes) and 2 layout figures (orbitElements,
  pfdSymbol). The most-used: P9 controlVolume, P14 beam, P31 velocityProfile, P30 phaseEnvelope.
  Eight are shared with the mechanical plan (Decisions): build each once.
- **Engine needs:** 14 (N1 units; N2 trial lines; N3 branch choice; N4 data rows; N5 category
  results; N6 DMS angles; N7 lists and constructed counts; N8 hyperbolic functions; N9 piecewise
  relations; N10 integral result lines; N11 sequences without spans; N12 money; N13 harness
  phrases; N14 symbols).
- **Research:** 27 textbook sources (6 openly licensed with the licence checked: Leishman,
  Udoeyo, Woolf, LearnChemE, and the public-domain NASA and NRCS sets) and 8 question sources;
  target 30–40 questions per course, about 700 in all, filed by topic id.
