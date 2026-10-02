# College pictures (higher education), all rounds

Paste everything below the line into the pictures chat.

---

You are working in the EducationalCalculator repository on your pictures branch
(`claude/edu-calc-assets-questions-379toc`). First merge `claude/ios-education-wireframe-313z7z`
into it.

## Context

The lesson chat has written eight college direction plans, one per group of courses in
`src/data/taxonomy.ts` (`COURSES`):

| Group               | Plan                                   | Courses | Pages | Picture requests in the plan           |
| ------------------- | -------------------------------------- | ------- | ----- | -------------------------------------- |
| Mathematics         | `docs/plans/he.math.md`                | 5       | 119   | 19 (`HE-math-P1`–`P19`)                |
| Physics             | `docs/plans/he.physics.md`             | 7       | 120   | 28 (`HE-physics-P1`–`P28`)             |
| Chemistry           | `docs/plans/he.chemistry.md`           | 9       | 153   | 24 (`HE-chemistry-P1`–`P24`)           |
| Earth and geography | `docs/plans/he.earth-geography.md`     | 13      | 170   | 33 (`HE-earth-geography-P1`–`P33`)     |
| Biology and bioeng. | `docs/plans/he.biology.md`             | 13      | 140   | 36 (`HE-biology-P1`–`P36`)             |
| Mechanical          | `docs/plans/he.mechanical.md`          | 15      | 248   | 31 (`HE-mechanical-P1`–`P31`)          |
| Aero, civil, chem.  | `docs/plans/he.aero-civil-chemical.md` | 21      | 254   | 37 (`HE-aero-civil-chemical-P1`–`P37`) |
| Electrical, comp.   | `docs/plans/he.electrical-computer.md` | 15      | 256   | 32 (`HE-electrical-computer-P1`–`P32`) |

That is 1,460 planned pages and 240 picture requests. Many ask for the same drawing (a beam, a
cross-section, Mohr's circle, a schematic, log axes, a step response). This brief merges them
into **191 requests, `HC1`–`HC191`**, each listing every page it serves in every group. Build
each once; a page in another group passes its own options.

Only four college pages exist today (pilots in `src/data/modules/college.ts`:
`he.math.calc-1#1`, `he.physics.university-1#0`, `he.engineering.circuits-1#0`,
`he.geography.human-geography#0`). The rest wait on engine work (`docs/HE_NEEDS.md`, HE-E1–E4:
topic problem types, college layouts, college standards, the file split). So **your gallery
demos are the first college pages anyone sees**: build each from the plan's worked example.

Read first:

- `CLAUDE.md`;
- `docs/RENDERINGS_BRIEF.md` (hard rules and art direction: original react-native-svg drawings,
  theme tokens only, the paint helpers for real objects, abstract diagrams flat, no new
  dependencies without asking) and the quality floor in `docs/RENDERINGS_ROUND_4.md` ("Rules for
  every redraw");
- `docs/PICTURES.md` and `docs/LAYOUTS.md`: every kind and figure that exists, with its options;
- for each request you draw, the plan entries it names under **Spec**. The plans hold the full
  field lists, the pages' worked examples (use them for demos) and the reasons. This brief is the
  merge and the order; where they differ, this brief's merged fields win, and the plan says what
  each page needs.

## How to read a request

- **Pages** are written `<course slug>#<topic>[~<slug>]`; the full id adds the course's prefix
  from `taxonomy.ts` (`he.math.`, `he.physics.`, `he.chemistry.`, `he.earth-science.`,
  `he.geography.`, `he.biology.`, `he.engineering.`). Short names used below:
  `MoM` = `mechanics-of-materials`, `ASM` = `advanced-solid-mechanics`,
  `FEA` = `finite-element-analysis`, `control` = `control-systems`, `signals` =
  `signals-systems`, `power` = `power-systems`, `comm` = `communication-systems`, `architecture`
  = `computer-architecture`, `embedded` = `embedded-systems`, `OS` = `operating-systems`, `discrete`
  = `discrete-math`. Group tags: **M** math, **P** physics, **C** chemistry, **EG** earth and
  geography, **B** biology and bioengineering, **ME** mechanical, **ACC** aero, civil and chemical,
  **EC** electrical and computer.
- **Extends** names the existing kind (an option on it) or says **new kind**, **card figure**,
  **explore figure**.
- **Check** is the harness check in `harness/pictures.ts` (layout checks for card and explore
  figures).
- **Spec** names the plan requests merged into it (`ME-P1` = `HE-mechanical-P1`, and so on).

## Rules for every college picture

- **Driven by values**, as in K–12: values through `useRep(calc)`; a "?" draws nothing for that
  value (as `gasPiston` and `lightClock` now do), never the example's number faded; drags through
  `DragHandle` and `rep.slide`; `keep` pins typed values; set `fixed` where a picture can't solve
  backwards from a drag.
- **College notation** (the `standard` band): letters italic, Unicode sub- and superscripts (σ₁,
  ω_n, ΔT_lm, C_L, ṁ, Q̇), "× 10ⁿ" never "e", units after the number with a space (12.5 kN·m,
  0.100 M). Electrical pages write **j** for the imaginary unit; math pages write i.
- **Constants come from the page.** Never hard-code g, R, γ or a lapse rate in a picture: the
  plans disagree (g = 9.81 m/s² on engineering and earth pages, 9.80 on physics, 9.8 on Grade 11;
  the owner decides, `docs/HE_NEEDS.md`). Take the value the page passes, with the plan's value
  as the demo default.
- **Diagrams flat, real parts painted.** Curves, charts, Mohr's circle, Bode plots, phase
  diagrams, block diagrams and schematics are flat. Beams, shafts, gears, pipes, tanks, wings,
  nozzles, rockets, soil, concrete and glassware are painted in their materials (steel, aluminum,
  concrete with bars, sand and clay, water in glass). Nothing depends on color alone: a T or C
  letter, a dashed or solid line, a label.
- **To scale, or say why not.** Sections, beams, ducts, orbits and unit cells are drawn from the
  values. A case the values can't make (a reaction that doesn't balance, x > 1 under the dome, a
  nozzle exit narrower than its throat) draws faded with the reason in the caption.
- **Computed, never copied.** Moody curves from Colebrook, the vapor dome from the public
  IAPWS-IF97 saturation equations, Michel-Lévy colors from a ramp in code, A/A\* and shock ratios
  from the relations. No chart, table, figure or screenshot from `research/`, a textbook, a code
  book or the web is traced or digitized.
- **Registering a new kind** touches `types.ts` (or a `typesHe*.ts`), `reps/index.tsx`,
  `meta.ts`, the kind list in `modules.test.ts`, a check in `harness/pictures.ts`, a gallery demo
  and a line in `docs/PICTURES.md`. An explore, sequence or card figure goes in `layouts/types.ts`,
  is drawn in `src/components/module/layouts/` and gets a line in `docs/LAYOUTS.md`.
- **An option never changes a page that exists.** Every option is off unless a page sets it.
- **Gallery demos stand in for the pages.** Name them `g.he-<kind>-<case>`, one per mode or
  case plus one at the edge of a sensible range, built from the plan's worked example with real
  values, relations, steps and use lines. Put them in new `src/data/modules/galleryHe*.ts` files
  spread into `gallery.ts`. (`scripts/promote-demo.mjs` takes K–12 ids only today; HE-E4 extends
  it to college ids, so keep each demo complete enough to promote.)
- **Tracker.** Create `src/data/modules/pictureRequestsHe.ts`, shaped like
  `pictureRequestsHs.ts` (`HE_PICTURE_REQUESTS`, spread into `PICTURE_REQUESTS`). Add each `HC`
  entry when you start it, with its pages (full ids), `what`, and in `notes` the source plan
  requests and the fields a page passes, with an example. Set `status: 'drawn'` and list the
  gallery ids when done.
- **Don't touch** lesson and college data (`src/data/modules/math`, `science`, `layouts`,
  `college.ts` or any `college/` split), `taxonomy.ts`, the plans, or other entries. **The lesson
  chat places each part on its pages**; you never edit a grade or college data file.

## Round 1 — shared foundations (13 requests, about 220 pages)

Each serves 12 or more pages or three or more groups. Draw these first, in this order.

### HC1 `beam` (new kind) — 31 pages

- **Pages.** ME: statics#0~reactions, #2~distributed; MoM#0, #1, #1~thermal, #3~diagrams, #4
  and its three types, #5; ASM#2, #4. ACC: structural-analysis#0, ~udl, ~cantilever, #1 (3
  pages), #2 (3 pages); steel-design#2, ~deflection; concrete-design#1, #3~slab-thickness;
  aerospace-structures#2 (3 pages), steel-design#1, concrete-design#2~slenderness (column mode).
- **Draws.** A steel (or concrete) beam to scale on `pin`, `roller` and `fixed` supports, with
  point, uniform and triangular loads (arrows as tall as w) and reactions with their values.
  `diagrams` puts the shear and moment diagrams under it on one x axis, V(x) and M(x) at a
  marked x, maxima labelled. `deflection` draws the bent shape dashed with δ_max and the end
  slope. `influence` draws the influence line of a reaction, shear or moment at a section.
  `continuous` draws two or three spans with the distribution table under them. `stirrups` marks
  spacing along the span. `axial`: a bar of 1–3 segments (L, A, E, loads, δ brackets; `walls` for
  a restrained bar). `column`: end symbols (pin, fixed, free), the buckled half-waves over KL, P;
  `panel`: a skin panel between stringers buckling. `plate`: a circular plate's section under p.
- **Fields.** `length`, `supports: [{ at, kind }]`, `loads: [{ kind: 'point' | 'uniform' |
'triangle', at, from?, to?, size }]`, `reactions?`, `at?`, `shear?`, `moment?`, `deflection?`,
  `slope?`, `mode?`, `segments?`, `k?` (column), `pcr?`, `plate?`.
- **Check.** ΣF = 0 and ΣM = 0 with the drawn reactions; V jumps by each point load; the area
  under V between two points equals the change in M; M peaks where V crosses zero; the deflected
  shape meets every support; the drawn half-wave length is K × L with K one of 0.5, 0.7, 1, 2
  matching the ends.
- **Spec.** ME-P1; ACC-P14 (less its `axial` sketch, which is HC41), ACC-P7.

### HC2 `skeletal` (new kind) and card figure `skeletal` — 22 pages

- **Pages.** C: every organic-1 and organic-2 sort and sequence (19 layout pages, as cards);
  organic-1#0~unsaturation, ~chair; organic-1#3~hydrogenation.
- **Draws.** A line-angle structure from a small SMILES-like spec: heteroatoms and their H, wedges
  and dashes, CIP ranks 1–4 and R/S on a chosen center, the parent chain numbered, a functional
  group lit; `chair` (cyclohexane with axial and equatorial groups and the ring flip); rings and π
  bonds counted for the IHD. The card draws one structure (112 × 76).
- **Check.** Valence 4 on every C; the IHD from the drawing equals the formula's; R/S from the
  ranks and the wedge.
- **Spec.** C-P14.

### HC3 `section` (new kind) — 21 pages

- **Pages.** ME: statics#2, #2~hole, #3 and its three types; MoM#0~vessel, #3, #3~shear-stress;
  ASM#3, #4~thick. ACC: aerospace-structures#0 (2 pages); steel-design#1, #2, #2~shear;
  concrete-design#0 (2 pages), #1, #2, #2~spiral.
- **Draws.** A cross-section to scale: rectangle, T, I (W-shape with d, b_f, t_f, t_w), L,
  circle, tube, plate with a hole, thin or thick cylinder wall, rectangular RC beam or column with
  bars (count, size, cover). The centroid with x̄, ȳ; reference and centroidal axes and the
  parallel-axis offset d. `stress: 'bending' | 'shear' | 'plastic' | 'torsion' | 'hoop'` draws the
  stress block beside it. `whitney`: the 0.85f′_c block of depth a, the strain line from 0.003 to
  ε_t, the neutral axis at c. `thinWalled`: box or tube with shear-flow arrows, enclosed area
  shaded. `interaction`: a P–M curve (later).
- **Fields.** `shape`, sizes, `centroid?`, `inertia?`, `axis?`, `stress?`, edge values, `bars?`,
  `barSize?`, `cover?`, `a?`, `c?`, `epsT?`, `q?`, `area?`.
- **Check.** The centroid is inside the bounding box and equals ΣAy ÷ ΣA; I ≥ Ī; the bending
  block is zero at ȳ; a = β₁c; the strain line is straight and crosses zero at c; bars sit inside
  the cover; shear flow is the same all round a single closed cell.
- **Spec.** ME-P3, ACC-P6.

### HC4 `functionGraph` time responses: `transient` and `stepResponse` — 18 pages

- **Pages.** EC: circuits-1#4, ~discharge, ~rl, ~general, ~rlc-damping; control#0, #1,
  #1~from-spec, #3~bandwidth, #4, #4~pi; electronics#3~integrator; signals#1~exp-step. ACC:
  flight-mechanics#2; process-control#0, #0~second-order, #2~imc, #2~fit.
- **Draws.** `transient: { initial, final, tau, time?, deadTime? }`: x(t) = x_f + (x₀ − x_f)
  e^(−(t − θ)/τ), the final value dashed, τ to 5τ ticks, the 63.2% point at θ + τ, the point at
  `time`, the input step above it on its own axis; a ramp when `tau` is absent (integrator);
  `points` marks the 28.3% and 63.2% times (fitting). `stepResponse: { zeta, wn, gain?, overshoot?,
peak?, settling? }`: the second-order step response with the ±2% band, the peak at (T_p,
  1 + %OS), T_s where it enters the band, the decay ratio; over- and critically damped curves for
  ζ ≥ 1; `oscillation` (free decay inside the e^(−ζω_n t) envelope, t½ marked).
- **Check.** The marked point equals the page's value; the curve passes 63.2% of the change at
  θ + τ; the first peak ÷ final equals 1 + OS to 0.5%; the envelope bounds every peak.
- **Extends** `functionGraph` (ACC asked for a new kind `stepResponse`; one implementation
  serves both).
- **Spec.** EC-P4, EC-P5, ACC-P5.

### HC5 `controlVolume` (new kind) — 17 pages

- **Pages.** ACC: material-energy-balances#0, ~dof, #1 (3 pages), #2~combustion, #3;
  separations#2 (2 pages), #3 (2 pages); propulsion#3~burner; environmental#1~activated-sludge;
  process-control#0~tank. ME: thermodynamics#1~steady-flow, ~nozzle, ~mixing.
- **Draws.** A unit as a box or a device: mixer, splitter, column, evaporator with bypass,
  burner, tank, membrane, a chain of `stages` (crosscurrent or countercurrent), and the metal
  devices turbine, compressor, pump, nozzle, diffuser, throttling valve and mixing chamber.
  Labelled streams (flow, composition, and ṁ, h, V), Q̇ and Ẇ arrows, a balance line "in = out"
  per component, and an energy bar for devices.
- **Fields.** `unit` or `device`, `streams: [{ flow, fractions?, h?, V? }]`, `heat?`, `work?`,
  `stages?`, `reaction?`.
- **Check.** Every component's total in equals total out (plus generation where a reaction is
  named) within 0.1%; Σṁh in + Q̇ = Σṁh out + Ẇ; stream arrows point the way the flow goes.
- **Spec.** ACC-P9, ME-P11. Biology's dialyzer (HC160) and bioreactor (HC164) may build on it.

### HC6 `fluidSystem` (new kind, with pipe networks) — 16 pages

- **Pages.** ME: fluid-mechanics#0 and its three types, #1, #1~pitot, #2, #2~pump, #3, #4, #5.
  ACC: hydraulics-hydrology#1 (4 pages), #3.
- **Draws.** Modes `tank` (water in glass, depth h, P = ρgh), `manometer` (U-tube, two fluids),
  `gate` (submerged rectangle, F at the center of pressure), `buoyancy`, `venturi` (piezometer
  columns), `pitot`, `jet` (a jet on a vane, the control volume dashed), `pipe` (length,
  diameter, pump, the energy and hydraulic grade lines falling by h_L), `parallel` (two pipes
  between nodes), `loop` (four pipes with flow arrows and ΔQ), `full` (a pipe in section),
  `plate` (the boundary layer δ ∝ √x, two velocity profiles), `model` (prototype and model).
- **Check.** Column heights equal ΔP ÷ ρg; A₁V₁ = A₂V₂; the grade lines fall in the flow
  direction by h_L; EGL − HGL = V² ÷ 2g; parallel pipes' h_f are equal; the jet force opposes the
  jet's turn.
- **Spec.** ME-P12, ACC-P20.

### HC7 schematics: `seriesCircuit` option `net` (passive circuits) — 15 pages

- **Pages.** EC: circuits-1#0~parallel, ~power-sign; #1, ~mesh, ~supernode; #2, ~norton,
  ~max-power, ~superposition; #4 (the switch circuit). P: university-2#1 (capacitors),
  university-2#2, ~internal-resistance. B: bioinstrumentation#0~strain-gauge (bridge),
  bioinstrumentation#3 (RC low-pass).
- **Draws.** A schematic in textbook symbols (zig-zag R, plates C, coil L, circle sources with +
  and arrow, ground) for a `topology`: `parallel`, `twoNode`, `twoMesh`, `twoLoop` (two emfs,
  three branches, each current arrow the way it really flows), `supernode`, `thevenin` (circuit
  and its equivalent side by side), `superposition` (the one-source circuits under the full one),
  `rc`, `rl`, `rlc`, `element` (one box with + − and a current arrow), `bridge` (Wheatstone with
  one active gauge), `lowpass`, and the `mixed` layouts with capacitor symbols (Q and V at each).
  `internal` draws r inside a dashed battery box, terminal V across it.
- **Fields.** `elements: [{ id, kind: 'R' | 'C' | 'L' | 'V' | 'I' }]`, `nodes`, `meshes`,
  `branches`, `topology`, `internal?`.
- **Check.** KCL at every drawn node and KVL round every drawn loop to 0.1%; series capacitors
  share Q, parallel ones share V; every label is a value on the page.
- **Extends** `seriesCircuit` (EC) and `circuit` `mixed` (P): draw one schematic renderer
  reachable from both kinds. The pilot circuits-1#0 keeps its picture.
- **Spec.** EC-P1, P-P11, P-P12, B-P31 (bridge and filter parts).

### HC8 phase diagrams: `phaseEnvelope` (new kind) and `chemDiagram` `phase` options — 14 pages

- **Pages.** ACC: chemical-thermodynamics#2 (4 pages), separations#0 (4 pages), #1 (2 pages). C:
  physical-1#1, ~raoult, ~clapeyron, ~phase-rule.
- **Draws.** `Pxy`/`Txy`: bubble and dew curves of an ideal (or constant-α) binary, a tie line at
  x. `xy`: the equilibrium curve, the 45° line, operating lines, the q-line and the
  McCabe–Thiele staircase (`steps`). One-component `substance: { triple, critical,
normalBoiling?, meltSlope? }` with the vapor curve through two (T, P) points by
  Clausius–Clapeyron; F = C − P + 2 at a marked point.
- **Check.** The bubble curve lies above the dew curve in Pxy; y_A ≥ x_A for the more volatile
  A; the step count shown equals the stairs drawn; operating lines cross on the q-line; the
  vapor curve passes both points.
- **Spec.** ACC-P30, C-P8. (Solid–liquid diagrams with the lever rule are HC82.)

### HC9 `functionGraph` log axes and flipped axes — 14 pages

- **Pages.** EG: oceanography#0~age-depth, geophysics#2 (depth down); physical-geography#3,
  hydrology#3~weibull (log axes). ACC: soil-mechanics#0~gradation (log x with D₁₀, D₃₀, D₆₀). ME:
  engineering-programming#2. B (upgrades, biology need 6): the Kleiber, growth, D-value,
  amplification, pharmacokinetics and filter pages (semi-log y, log–log, log x), 8 pages.
- **Draws.** `scale: { x?: 'log', y?: 'log' }` with decade ticks and minor ticks; `invertY` (depth
  down). Also on `bars` and `table` graphs where the biology pages need it.
- **Check.** Points sit at (x, f(x)) read on the flipped or log axis; a power law draws straight
  on log–log axes; log axes refuse values ≤ 0.
- **Spec.** EG-P19, ACC-P37 (gradation part; the S–N page is HC52), ME-P9 (`scale`), biology
  engine need 6.

### HC10 `functionGraph` families: `expr`, `hill`, `bateman`, `repeat`, real `power`, `erfc` — 14 pages

- **Pages.** M: calc-1#4, calc-2#0, ~parts-trig, calc-2#4~integrate-series, diff-eq#0~linear,
  diff-eq#2, ~inverse, diff-eq#4~airy. B: cell-molecular#1~hill,
  bioinstrumentation#0~saturation, biotransport#3~multiple-dosing, ~oral,
  ecology#3~species-area. ME: materials-science#1.
- **Draws.** `family: 'expr'`: any expression from a whitelisted grammar (+ − × ÷ ^, exp, ln, sin,
  cos, tan, sqrt, abs, step u(x − c)) over parameter ids, e.g. `'x * exp(k * x)'`, parsed by a
  small parser (no `eval`). Named families: `hill` (θ = Lⁿ ÷ (Kⁿ + Lⁿ) × top, K marked at half),
  `bateman` (the oral curve with t_max and C_max), `repeat: { every, count }` (exponential doses
  summed into a sawtooth, C_ss,avg dashed), `power` with a real `exponent` id, `erfc` (C(x) =
  C_s − (C_s − C₀) erf(x ÷ 2√(Dt)), the depth marked).
- **Check.** Every name is a page value or x; the curve passes through `at`; θ(K) = top ÷ 2;
  t_max = ln(k_a ÷ k) ÷ (k_a − k); sawtooth troughs rise toward the steady trough; the power curve
  passes (1, a); erfc at the marked depth equals the page's C.
- **Spec.** M-P3, B-P10, B-P30, B-P36, ME-P9 (`erfc`).

### HC11 `oscillator` damping, forcing, phase and coupled masses — 13 pages

- **Pages.** M: diff-eq#1 (later ~resonance). P: university-1#5, ~damped;
  classical-mechanics#4, ~chain. ME: vibrations#0~springs, #1, #1~transmissibility, #2,
  #2~log-dec, #3. EC: control#0~mass-spring.
- **Draws.** `damping: { c, zeta? }` (a dashpot labelled b or c; the x–t trace e^(αt)(C₁ cos βt
  - C₂ sin βt) inside the dashed ±Xe^(−ζω_n t) envelope, over- and critically damped forms, peaks
    marked for the log decrement); `phase: φ` (the trace starts at x₀ with slope v₀, φ as the shift
    of the first crest); `forcing: { amplitude, frequency }` (F₀ sin ωt on the block, the
    steady response, and the X ÷ δ_st curve against r with the point and the phase); `transmit`
    (TR against r with √2 marked); `coupled: { m, k, kc, mode }` (two blocks and three springs,
    each mode's shape as arrows, x–t traces showing the energy hand-off; the chain);
    `springs: { k1, k2, layout }` (series or parallel).
- **Check.** ω_d < ω_n; ω_n and ζ in the caption equal the page's; x(0) = A cos φ; crest heights
  follow the envelope; peak ratio matches δ; the point lies on the response curve; each mode's ω²
  is an eigenvalue of the drawn spring matrix.
- **Spec.** M-P10, P-P8, P-P23, ME-P16, EC-P30.

### HC12 `functionGraph` regions: signed and between areas, a level line, accumulation, Levenspiel, equal area — 12 pages

- **Pages.** M: calc-1#3 (`signed`), ~area-between, ~accumulation; calc-3#2~region. P:
  university-1#2, ~power-law-force, ~potential-curve; university-2#4~resonance;
  classical-mechanics#2~turning-points; quantum#0. ACC: reaction-engineering#1~levenspiel. EC:
  power#3.
- **Draws.** `area: { from, to }` shaded with its value written; `signed` (above and below the
  axis in two fills labelled + and −); `shade: 'between'` (f and `other`, from the crossings or
  from/to); `strip: { at, dir }` one representative slice; `level: { y, label }` (an energy E or a
  half-power line, crossings ringed); `accumulation` (a second panel with F(x) = ∫ₐˣ f, its point
  traced, slope at x equal to f(x)). Presets: `levenspiel` (F_A0 ÷ (−r_A) against X, the CSTR
  rectangle and the PFR area, each labelled with its volume) and `equalArea` (the P–δ sine, the
  P_m line, A₁ and A₂ shaded).
- **Check.** Every written area equals the integral by quadrature within 0.1%; each ring is a
  root of f − y; F at x equals the page's value; rectangle = V_CSTR and area = V_PFR within 1%;
  A₁ = A₂ within 1% at the critical angle.
- **Spec.** M-P2, M-P5, P-P18, ACC-P33, EC-P14.

### HC13 `velocityProfile` (new kind) — 12 pages

- **Pages.** ACC: transport-phenomena#0, #2, #3 and their types (9 pages). B: biotransport#1,
  ~shear, ~reynolds.
- **Draws.** A tube, a vessel cut lengthwise or two plates with velocity arrows (parabolic or
  linear) and τ_w ticks at the wall; P₁ and P₂ at a vessel's ends, r and L bracketed; `film` on a
  wall; `concentration` across a film or a Stefan tube; `analogy` (three boundary layers side by
  side, δ_T = δ Pr^(−1/3)). The temperature-through-layers mode is HC23 `thermalWall`.
- **Fields.** `R`, `vmax` or `Q`, `tauW`, `P1?`, `P2?`, `L?`, `cA1?`, `cA2?`, `Pr?`, `Sc?`.
- **Check.** v_max = 2v_avg in a tube (center speed = 2Q ÷ πr²); arrows scale with Q; the
  concentration line is straight in steady film diffusion.
- **Spec.** ACC-P31 (less `temperature`), B-P28.

## Round 2 — the next shared kinds and each course's anchor (26 requests)

6–11 pages each. Same detail as round 1; the plan entries under **Spec** give the full fields.

- **HC14 `complexPlane` options `j`, `axes`, `phasors`, `poles`, `locus` (9 pages).** EC:
  circuits-2#0, ~phasor-form, ~parallel-rc; circuits-2#4, ~delta; control#0~feedback,
  #1~dc-gain, #2~root-locus; signals#3. `j` writes j for i; `axes` renames them (R, X; σ, jω);
  `phasors: [{ mag, angle, name }]` (a three-phase star, V_ab tip to tail); × poles and ○ zeros;
  `locus: { poles, zeros?, gain }` (branches, asymptotes from the centroid, closed-loop poles at
  the gain). Check: each arrow's length and angle; the closed-loop poles solve the
  characteristic equation at the gain. Spec: EC-P6.
- **HC15 `potentialWell` (new kind; modes `box`, `harmonic`, `step`, `barrier`, `bump`) (9
  pages).** P: quantum#0, ~spread; quantum#1, ~harmonic, ~tunneling, ~step; quantum#3. C:
  physical-2#1, ~oscillator. The potential in ink, levels to scale (Eₙ labelled, up to n = 6 or
  v = 5), ψ or |ψ|² on its own level line, a transition arrow with ΔE and the photon λ;
  `barrier` shows the decaying ψ inside; `bump` shades the perturbation. Fields: `model`,
  `length` or `force`/`mass`, `lower`, `upper`, `square?`. Check: levels ∝ n² (box) or (v + ½)
  (oscillator); ψ has n − 1 (box) or v nodes; λ = hc ÷ ΔE. Spec: P-P19, C-P1 (chemistry asked for
  an `orbitalDiagram` mode `well`; one kind serves both).
- **HC16 `unitCell` (new kind) (9 pages).** C: inorganic#3, ~radius-ratio, ~bragg. ME:
  materials-science#0 and its two types. EG: mineralogy#0 (Bragg), #0~cubic-d, #0~cell-density.
  `lattice: 'sc' | 'bcc' | 'fcc' | 'rocksalt' | 'cesiumChloride' | 'zincBlende'`, atoms cut at
  corners, edges and faces and counted to Z, `touching` lit along the edge, body or face
  diagonal with a and r; `planes: { h, k, l }` shades a plane, the next one and d; `bragg`: three
  or more planes d apart, the rays at θ, the extra path 2d sin θ lit, "in phase" when whole.
  Check: Z per lattice; a from r by the touching direction; d = a ÷ √(h² + k² + l²); nλ = 2d sin θ
  (0.1%); intercepts a ÷ h. Spec: C-P17, ME-P7, EG-P7 (`rayDiagram` `bragg`), EG-P8
  (`crossSection` `cell`).
- **HC17 `propertyDiagram` (new kind) (9 pages).** ME: thermodynamics#0, #2~entropy,
  #2~isentropic, #3, #3~rankine. ACC: propulsion#0, ~compressor; chemical-thermodynamics#0 (2
  pages). T–v, P–v and T–s planes with water's vapor dome (from IAPWS-IF97 saturation, computed),
  the critical point, numbered states, processes (isobars; isentropic solid, actual dashed), a tie
  line with x, whole cycles (Rankine, Brayton, Otto, Diesel, refrigeration) with q_in and q_out;
  `Pv` with ideal and van der Waals isotherms. Check: 0 < x < 1 lies under the dome; isentropic
  segments vertical on T–s; T₂ > T₁, the real T₂ right of the ideal; the vdW isotherm meets the
  ideal one at large V. Spec: ME-P10, ACC-P10.
- **HC18 op-amp circuits: `seriesCircuit` option `amp` (9 pages).** EC: circuits-1#3 (4 pages);
  electronics#3~integrator, ~active-lowpass, ~schmitt. B: bioinstrumentation#1, ~inamp. `amp:
'inverting' | 'nonInverting' | 'summing' | 'difference' | 'integrator' | 'activeLowPass' |
'schmitt' | 'instrumentation'` with `vin` (one or two; V_d and V_cm sources for the
  instrumentation amplifier), `rin`, `rf`, `rg`, `c`, `vout`, `rail`; the Schmitt loop beside it.
  Check: v₊ = v₋ within 1 mV unless at a rail; |v_out| never past the rail; G as written. Spec:
  EC-P2, B-P31 (op-amp part). Uses HC7's renderer.
- **HC19 `induction` field sources and rails (9 pages).** P: university-2#3~wire-field,
  ~solenoid, ~moving-rod; electromagnetism#1, ~ampere-wire, ~toroid, ~loop-torque;
  electromagnetism#2~displacement-current. EC: electromagnetics#1. `mode: 'field'` with `source:
'wire' | 'loop' | 'solenoid' | 'toroid' | 'plates'` (B lines, an Amperian loop at r, the loop's μ
  and θ in a uniform B); `rails: { B, L, v, R }` (a sliding rod, I round the loop, the BIL force
  against v). Check: the field at r matches the source's formula; B even inside a solenoid; ε =
  BLv; F opposes v. Spec: P-P13, P-P14, EC-P31 (wire).
- **HC20 `freeBody` mechanics options (9 pages).** P: university-1#1, ~atwood, ~banked,
  university-1#4~ladder; classical-mechanics#0~atwood. ME: statics#4~tip, #4~belt; dynamics#1,
  #1~banked. `g` from the page; `pulley: { layout: 'table' | 'atwood', m1, m2, mu?, a, T, T2?,
pulleyMass? }` (each block's diagram to one scale; T₁ ≠ T₂ with a massive pulley); `ladder: {
angle, weight, wall?, floor? }` (lever arms dashed); `tip` (push height h, the tipping edge,
  P_tip and P_slip); `drum` (rope round a drum, wrap β, T₁, T₂); `banked: θ` (a car in section, N
  and mg, N's level part to the center). Check: each block's net force = m × a; T₂ − T₁ =
  ½ m_p a; forces and torques about the foot sum to 0; T₂ = T₁e^(μβ); the smaller force governs;
  N sin θ = mv²/r, N cos θ = mg. Spec: P-P2, P-P7, P-P3 (bank), ME-P27.
- **HC21 `fieldPlot` (new kind) (8 pages).** M: diff-eq#0~euler, diff-eq#3, ~solution,
  ~predator-prey; calc-3#3, ~conservative; calc-3#4. B: ecology#1~competition. Modes `slope`
  (segments on a grid, the solution through (x₀, y₀), Euler's polyline for h and n), `vector` (F
  = ⟨P, Q⟩, a path with its direction and a work tally per side), `phase` (x′ = Ax, eigenvector
  lines dashed, six trajectories, the type named; Lotka–Volterra with its equilibrium) and
  `isoclines` (two species' zero-growth lines with intercepts K₁, K₁ ÷ α, K₂ ÷ β, K₂, the crossing
  ringed when both are positive, flow arrows). Check: Euler points and side integrals equal the
  page's; eigenvalues equal λ; no ring when an N\* ≤ 0. Spec: M-P9, B-P16 (`phasePlane`). Share
  the Euler polyline with HC45.
- **HC22 `bode` (new kind) (8 pages).** EC: circuits-2#2, ~high-pass, ~band-pass; control#3,
  ~asymptotes, ~gain-margin; electronics#3, ~active-lowpass. Magnitude (dB) and phase (°) over a
  log-frequency axis, asymptotes dashed, corners, a marked frequency, crossovers with PM and GM.
  Fields: `poles`, `zeros`, `gain`, `integrators`, `at`, `crossover?`, `margin?`. Check: marked
  gain and phase within 0.1 dB and 0.5°. Spec: EC-P7.
- **HC23 `thermalWall` (new kind) (8 pages).** ME: heat-transfer#0, ~cylinder, ~fin, #1, #2.
  ACC: transport-phenomena#1 and its two types. Layered walls (brick, foam, steel) with the
  temperature stepping through each layer and the films, the resistance network beneath;
  `cylinder` (pipe and insulation rings), `fin` (a pin fin fading), `tube` (flow with h),
  `radiation` (εσT⁴ arrows). Check: each layer's drop equals q × its R (∝ L ÷ k). Spec: ME-P14
  (Planck curves go to HC42), ACC-P31 `temperature`.
- **HC24 `wing` (new kind) (8 pages).** ACC: aerodynamics#0 and its three types, #1, #2 and its
  two types. Section (chord, NACA camber line, α against the relative wind) or planform (span,
  chords, trailing vortices, downwash); `forces`, `pressure`, `circulation`. Check: lift ⟂ the
  wind; camber peak at d2 × 10% of the chord; AR = b² ÷ S within 2%. Spec: ACC-P1.
- **HC25 `freeBody` aircraft options (8 pages).** ACC: flight-mechanics#0 (5 pages), #1, #3,
  #3~coordinated-turn. Side view with L, W, T, D and γ; front view banked at φ with L cos φ and
  L sin φ; `stability` (aerodynamic center, CG and neutral point on the mean chord, static-margin
  bracket). Check: L = W in level flight; L cos φ = W in a level turn; CG ahead of the neutral
  point exactly when SM > 0. Spec: ACC-P4.
- **HC26 `soilProfile` (new kind) (8 pages).** ACC: soil-mechanics#2 (4 pages), #4 (2 pages);
  transportation#2; concrete-design#3. Layers with the water table; `stress` (σ, u, σ′ with
  depth); `consolidation`; `footing` (B at D_f, wedges, the punching perimeter); `pavement` (layers
  with a, D, m and the axle). Check: σ′ = σ − u; u = 0 above the water table; D_f ÷ B to scale.
  Spec: ACC-P17.
- **HC27 `truss` (new kind) and card figure `trussJoint` (7 pages).** ME: statics#1,
  #1~sections, #1~zero-force (cards); ASM#2~truss; FEA#2. ACC: structural-analysis#0~truss,
  ~determinacy. Joints and members (steel angle), supports, loads, Pratt, Howe or Warren panels,
  each member's force with T or C (and pulling or pushing arrows), a section `cut` with its free
  body shaded, `element` labels for FEA. Check: every joint balances; zero-force members show 0;
  T/C letters match signs; m + r − 2j equals the drawing's counts; the cut chord force × height
  equals the moment at the cut joint. Spec: ME-P2, ACC-P15.
- **HC28 `stressStrain` (new kind, with a specimen) (7 pages).** ME: MoM#0; materials-science#3,
  ~resilience; ASM#3. B: biomechanics#0, ~bone-bending; biomaterials#1. The engineering curve
  (elastic slope E, 0.2% offset to σ_Y, UTS, necking, fracture), the true curve dashed, the
  resilience triangle or toughness area, an elastic–perfectly-plastic option, a toe region
  (tissue); `specimen` (in grips, F, L, ΔL beside the curve); `section: 'tube'` (the ring and its
  neutral axis); `parallel` (two members under one load, widths by share). Check: the point is on
  the elastic line below yield; σ = F ÷ A, ε = ΔL ÷ L; resilience = σ_Y² ÷ 2E; shares add to 1.
  Spec: ME-P5, B-P23 (`tensileTest`).
- **HC29 `charges` Gauss surfaces and continuous distributions (7 pages).** P: university-2#0,
  ~line, ~plane; electromagnetism#0, ~disk, ~images. EC: electromagnetics#1~gauss-line. `gauss: {
shape: 'sphere' | 'line' | 'plane', R?, r, Q }` (the charge, the dashed Gaussian surface, E
  arrows, Q_enc shaded); `distribution: 'ring' | 'disk' | 'image'` (dE from two opposite pieces,
  sideways parts cancelling; the image charge dashed below a grounded plane, σ shaded). Check:
  E·area = Q_enc ÷ ε₀; E_z from the formula; image charge −q at −d. Spec: P-P10, P-P24, EC-P31
  (line charge).
- **HC30 `duct` (new kind) (7 pages).** ACC: compressible-flow#0 (3 pages), #2;
  propulsion#0~turbojet, propulsion#2 (2 pages). A stream tube or converging–diverging nozzle to
  scale by A ÷ A\*, stations with M, p, T; `chamber`, `shock` at a station, `engine` (turbojet
  outline). Check: the throat is narrowest and M = 1 there when choked; exit ÷ throat width =
  √(A_e ÷ A_t). Spec: ACC-P2.
- **HC31 `supersonicFlow` (new kind) (7 pages).** ACC: aerodynamics#3; compressible-flow#1 (3
  pages), #3 (3 pages). Modes `normal`, `wedge` (θ, β), `corner` (expansion fan), `flatPlate`,
  `mach` (fronts from a moving point). Check: β > θ and β ≥ sin⁻¹(1 ÷ M₁); the fan opens by θ; no
  cone at M < 1. Spec: ACC-P3.
- **HC32 `survey` (new kind; modes `traverse`, `level`, `heights`) (7 pages).** ACC:
  surveying#0~angle-closure, #2, ~closure, ~compass-rule (traverse); #1, ~curvature (level);
  #3 (heights). Check: lat² + dep² = L², north up; each elevation = HI − FS; H = h − N. Spec:
  ACC-P27, P28, P29.
- **HC33 `stressElement` with Mohr's circle (6 pages).** ME: MoM#0~mohr; ASM#0, #3~yield;
  machine-design#0. ACC: soil-mechanics#3, ~undrained. The element with σₓ, σ_y, τₓ_y; turned to
  θ_p; Mohr's circle (center, R, the two points, 2θ_p); `three` (three circles); `envelope:
'vonMises' | 'tresca' | 'coulombMohr'` in the σ₁–σ₂ plane with the load and n-scaled points;
  `mohrCoulomb: { c, phi }` (the line tangent to the circle, the failure plane at 45° + φ ÷ 2; a
  flat envelope for undrained tests). Check: center and radius from the inputs; principal points
  on the axis; load inside the envelope when n > 1; the line's distance from the center = R
  within 0.5% at failure. Spec: ME-P4, ACC-P18 (`mohrCircle`).
- **HC34 `chemDiagram` `rate` options with consecutive reactions (6 pages).** C: gen-chem-2#0,
  ~second-order, ~zero-order, ~arrhenius; physical-1#3. ACC: reaction-engineering#2.
  `integrated: { order, k, start, t }` ([A] against t, half-lives, the straight-line plot);
  `arrhenius`; `consecutive` (A → B → C with B's peak at t_max). Check: the curve passes the
  page's values; constant half-life spacing for order 1; [A] + [B] + [C] = [A]₀ everywhere. Spec:
  C-P7, ACC-P32 (`series`).
- **HC35 `circularMotion` orbits and path coordinates (6 pages).** P:
  classical-mechanics#2~hohmann. ACC: orbital-mechanics#0~vis-viva, #2, #3, ~synodic. ME:
  dynamics#0~nt. `hohmann` (two circles, the transfer half-ellipse, Δv₁, Δv₂, TOF; Sun-centered
  for interplanetary); `visViva` (r and v on the ellipse); `pair` (two planets' angles);
  `tangential` (v and a_t along a curve, a_n toward the center of curvature ρ). Check: the
  ellipse touches the inner circle at perigee and the outer at apogee; a = (r₁ + r₂) ÷ 2 on the
  drawing. Spec: P-P3 (transfer), ACC-P12, ME-P28.
- **HC36 `globe` (new kind; modes `sun`, `route`, `euler`, `dipole`, `momentum`) (6 pages).**
  EG: physical-geography#0, ~insolation; cartography#1~great-circle; physical-geology#1;
  geophysics#1~paleolatitude; climatology#1. Check: noon = 90 − |φ − δ| (0.1°); lit share = H ÷
  180; the central angle by the spherical law of cosines; v = ωR sin Δ; tan I = 2 tan φ;
  u = ΩR sin²φ ÷ cos φ. Spec: EG-P3.
- **HC37 `functionGraph` `tangent` and `band` (6 pages).** M: calc-1#1 (the pilot, moving to
  `family: 'power'` with `tangent`), ~linear-approx, ~chain, ~trig, ~exp; calc-1#0~epsilon-delta.
  `tangent: { x, slope, y? }` with its slope triangle; `band: { x, y, dx, dy }` (y ± ε and x ± δ).
  Check: slope = a central difference of f at x (10⁻⁶ relative); f(x ± δ) within y ± ε. Spec:
  M-P1. HC45's Newton tangents reuse it.
- **HC38 `functionGraph` `series` overlay (6 pages).** M: calc-2#4, ~sin-cos,
  ~from-derivatives, ~integrate-series; diff-eq#4, ~airy. A dashed polynomial from coefficients
  or derivatives at a center over the true f, the gap at x bracketed with the error. Check: the
  polynomial is Σ cₖ(x − a)ᵏ; the bracket equals the page's error. Spec: M-P4.
- **HC39 semiconductor circuits: `seriesCircuit` option `device` (6 pages).** EC:
  electronics#0, ~zener, ~rectifier; electronics#1; electronics#2, ~cs-mosfet. `device:
'diodeR' | 'zener' | 'bridge' | 'bjtDivider' | 'mosfetCS' | 'hybridPi'`; `bridge` draws the
  rectified wave with ripple. Check: node voltages match the page's relations; the BJT drawn
  active only when V_CE > 0.2 V. Spec: EC-P3. Uses HC7's renderer.

## Round 3 — course pictures with 3–5 pages (54 requests)

Do them as batches by field if that suits you (engineering mechanics and thermal: HC40–41,
HC52, HC59, HC82–84; chemistry: HC42–44, HC55–58, HC70–74; mathematics: HC45–47, HC53–54,
HC65–67; computing and signals: HC48–51, HC62–64, HC91–92; earth and civil: HC60–61, HC75–78,
HC86–90; physics and waves: HC68–69, HC93; biology: HC79–81, HC85). Each line gives the pages,
what it adds, the check and the spec.

- **HC40 `heatExchanger` (new kind) (5).** ME: heat-transfer#3 (4 pages). ACC: process-design#1.
  Hot and cold lines along the length, counter or parallel flow, ΔT₁, ΔT₂, the LMTD dashed,
  C_min named. Check: no crossing in parallel flow; the hot line above the cold; ΔT_lm between
  ΔT₁ and ΔT₂. Spec: ME-P15, ACC-P35.
- **HC41 `elementChain` (new kind) (5).** ME: FEA#0 and its two types, FEA#3~count. ACC:
  structural-analysis#3 (bars in series with nodes). Nodes joined by springs or bars, fixed nodes
  hatched, nodal forces and displacements, element numbers and k; `mesh: { nx, ny }` with node
  and DOF counts. Check: nodal forces balance the element forces; counts match. Spec: ME-P25,
  ACC-P14 `axial`.
- **HC42 `functionGraph` `distribution: 'maxwell' | 'planck' | 'occupancy'` (5).** P:
  thermal-statistical#2~speeds, #3, ~photon-gas. C: gen-chem-1#2~kinetic. ME:
  heat-transfer#2~blackbody. Maxwell f(v) with v_p, ⟨v⟩, v_rms (a second gas or T dashed); Planck
  curves with λ_max and the visible band; the three occupancy curves. Check: marked speeds and
  λ_max by formula; v_mp < v_avg < v_rms; area 1. Spec: P-P28, C-P10 (`speeds`), ME-P14
  (`blackbody`).
- **HC43 `gasPiston` options `pv` and `real` (5).** P: thermal-statistical#0, ~adiabatic (later
  ~cycle). C: physical-1#0, ~adiabatic; gen-chem-1#2~real-gas. A P–V graph beside the piston:
  `path: 'isothermal' | 'adiabatic' | 'isobaric' | 'isochoric' | 'cycle'`, the area shaded as W
  with its sign, isotherms dashed; `real: { a, b }` (particles with their own volume and
  attraction lines, ideal and van der Waals gauges, Z in the caption). Check: shaded area = |W|
  within 0.1%; PV = nRT at both ends; P₂ by the path; P from the vdW equation. Spec: P-P27,
  C-P11, C-P10 (`real`).
- **HC44 `energyProfile` `quantity: 'G'`, `steps`, `bomb` (5).** B: principles-1#2, ~delta-g.
  C: organic-1#2~energy-diagram, gen-chem-1#3~bomb, biochemistry#3~coupled. ΔG (°′ allowed)
  instead of ΔH on the profile and the ladder; coupled steps with the ATP step and the net arrow;
  2–3 humps with intermediates and the rate-determining step; a bomb calorimeter. Check: net =
  sum of steps; arrows down when ΔG < 0; each hump's top = level before + Eₐ. Spec: B-P2, C-P15.
- **HC45 `functionGraph` numerical methods (5).** ME: numerical-methods#0, #0~bisection, #2, #3,
  #4. `newton: { x0, steps }`, `bisect: { a, b, steps }`, `riemann.side: 'trapezoid' |
'simpson'`, `steps: { method: 'euler' | 'heun' | 'rk4', h, n, y0 }` over the exact curve,
  `through: [points]` (interpolation nodes). Check: each drawn iterate equals the walkthrough's;
  the trapezoid sum equals T. Spec: ME-P9 (methods).
- **HC46 `surfacePlot` (new kind) (5).** M: calc-3#1, ~extrema; calc-3#2; later ~directional,
  ~lagrange. z = f(x, y) (plane or quadratic) on the `vectorDiagram` `space` camera; `point` with
  traces and slopes, `tangentPlane`, `contour` (level curves, ∇f, a direction, a constraint),
  `critical`, `region` (prisms and their sum). Check: analytic partials; the prism sum; ∇f square
  to the level curve. Spec: M-P7.
- **HC47 `vectorDiagram` `space` objects (5).** M: calc-3#0, ~line, ~helix; calc-3#3~flux;
  calc-3#4~stokes. `plane`, `line`, `curve: { helix }`, `sphere`, `circle` with a capping surface.
  Check: the plane passes through the point; the line point at t and the foot of the drop.
  Spec: M-P8.
- **HC48 explore figure `codeTrace` and card figure `code` (5).** ME:
  engineering-programming#0~trace and the programming sorts (~syntax, ~elementwise, ~which-axes,
  ~error-types). A snippet with the current line lit and a variables table per scene, MATLAB and
  Python side by side; straight quotes kept (HE-E25). Spec: ME-P24.
- **HC49 `timingDiagram` (new kind) (5).** EC: digital-logic#2; embedded#1, ~pwm; embedded#2;
  networks#3 (`link`). Stacked waveforms with interval brackets; a UART frame; the packet
  space–time diagram. Check: brackets equal values; the frame's bit count. Spec: EC-P20.
- **HC50 `graph` (new kind and card figure) (5).** EC: discrete#3; data-structures#1;
  networks#2, ~dijkstra; comm#3~code-length (`tree`). Fixed embeddings, degrees or costs, a lit
  path; a rooted code tree with 0/1 edges. Check: degree sum = 2E; the path's cost. Spec: EC-P22.
- **HC51 `scheduleChart` (new kind) (5).** EC: embedded#3, ~response-time, ~edf; OS#1,
  ~round-robin. A Gantt chart with releases, deadlines and waits. Check: slices add to each
  burst; no deadline missed unless the page says so. Spec: EC-P24.
- **HC52 `fatigueDiagram` (new kind) (4).** ME: machine-design#1, ~sn, ~miner. ACC:
  aerospace-structures#3~basquin. Goodman diagram with the load line and n; S–N on log–log axes
  from 10³ to 10⁶ (S_e flat after; Basquin's line); a Miner bar. Check: the point and n agree; N
  read off the line matches. Spec: ME-P17, ACC-P37 (S–N part).
- **HC53 `polarGrid` areas, regions, tangent, cycloid (4).** M: calc-2#5~cycloid-arc,
  ~polar-area, ~polar-slope; calc-3#2~polar. Check: area = ½∫r² dθ; the tangent slope. Spec:
  M-P15.
- **HC54 related-rates and work options (4).** M: calc-1#2~cone-tank, ~ladder, ~two-cars;
  calc-2#2~pump-work. `rightTriangle` `rates`, `curvedSolid` cone `fill` and cylinder `slab`.
  Check: r = Rh ÷ H; the rates satisfy the page's relation. Spec: M-P16.
- **HC55 `instrumentTrace` (new kind, plus an `ir` card) (4).** C: organic-1#4 (`nmr`, and the
  IR sort's cards), analytical#3 (`chromatogram`), physical-2#4 (`rotational`). Check: peak
  positions and widths; n + 1 lines; spacing 2B. Spec: C-P5.
- **HC56 `chemDiagram` `cell` options (4).** C: gen-chem-2#4, ~concentration-cell,
  ~electrolysis; analytical#4. Ion dots by concentration, Q and E beside E°, electrolysis
  counting electrons. Check: Nernst; moles = It ÷ zF. Spec: C-P9.
- **HC57 `organelleEnergy` `detail` and stage card `pathwayStep` (4).** C: biochemistry#2 (two
  sequences), ~atp-yield, ~beta-oxidation. Check: glycolysis 2 ATP net, 2 NADH; per acetyl-CoA 3
  NADH, 1 FADH₂, 1 GTP, 2 CO₂; cards in order. Spec: C-P20.
- **HC58 `equilibriumChart` mode `gibbs` (4).** C: gen-chem-2#3, ~nonstandard; physical-1#2;
  biochemistry#3. G against extent, the minimum at K, Q placed with the slope's sign. Check: the
  minimum where Q = K; slope sign = ΔG sign. Spec: C-P23.
- **HC59 `shaft` (new kind) (4).** ME: MoM#2 and its two types; machine-design#2. Torque arrows,
  the scribed line twisting by φ, τ on the end face (hollow when d_i > 0), `bending` with M and
  the surface element. Check: τ_max = 16T ÷ πd³ (solid); φ in proportion. Spec: ME-P6.
- **HC60 `roadCurve` (new kind) (4).** ACC: transportation#1 (4 pages). `stopping`, `plan`,
  `profile`. Check: T = R tan(Δ ÷ 2); the sight line clears the crest exactly when L meets the
  formula. Spec: ACC-P22.
- **HC61 `connection` (new kind) (4).** ACC: steel-design#1~tension, #3 (3 pages). Bolt holes,
  the net-section line, the block-shear path, fillet welds. Check: holes drawn = holes; net width
  = width − holes × size. Spec: ACC-P24.
- **HC62 `deviceCurves` (new kind) (4).** EC: electronics#0, ~shockley; electronics#1~mosfet-sat,
  ~mosfet-triode. Check: Q on both the device curve and the load line. Spec: EC-P8.
- **HC63 `stemPlot` (new kind) (4).** EC: signals#0~discrete-period, #1, #3~difference-eq, #4.
  `convolve`, `sampled` with the alias. Check: the sum equals y[n]; the alias passes every sample.
  Spec: EC-P9.
- **HC64 `bitFields` (new kind) (4).** EC: architecture#0, #3; networks#0 (`headers`), #1.
  Check: field widths add to the word size; bytes add to the frame. Spec: EC-P18.
- **HC65 `solidOfRevolution` (new kind) (3).** M: calc-2#2, ~washer, ~shells. Check: V equals
  the method's integral; the slice radius equals f(at). Spec: M-P6.
- **HC66 `termsChart` series options (3).** M: calc-2#3, ~ratio, ~alternating. `type: 'nr' |
'factorial'`, `alternate`, `bounds`. Check: terms and sums by rule; the band contains the
  limit. Spec: M-P17.
- **HC67 `rectangle` `grow` and `conicGraph` circle `under` and `tangent` (3).** M:
  calc-1#1~product-quotient, ~implicit; calc-2#0~trig-sub. Check: strip areas add to first
  order; triangle + sector = the integral. Spec: M-P18.
- **HC68 `rayDiagram` `singleSlit`, `grating`, `thinFilm` (3).** P: university-3#1~single-slit,
  ~grating, ~thin-film. Check: angles from the grating equation; no order past sin θ = 1. Spec:
  P-P15.
- **HC69 `phaseSpace` (new kind, with `hoop`) (3).** P: classical-mechanics#1,
  ~pendulum-phase; classical-mechanics#0~bead-hoop. Check: H at the point = the curve's H; the
  arrow is (∂H/∂p, −∂H/∂x). Spec: P-P20.
- **HC70 `orbitalDiagram` mode `mo` (3).** C: gen-chem-1#4~bond-order, physical-2#3, ~huckel.
  `diatomic`, `heteronuclear`, `frost`. Check: electron count, bond order, unpaired, E± from the
  2 × 2 determinant, Frost levels 2β cos(2πk/N). Spec: C-P3.
- **HC71 `phScale` titration options (3).** C: gen-chem-2#2~buffer, analytical#1~polyprotic,
  biochemistry#0. `polyprotic`, `buffer`, `aminoAcid`. Check: equivalence volumes 1 : 2 (: 3);
  half-way pH = pKₐ within 0.05; pI between its pKₐs. Spec: C-P6.
- **HC72 `vsepr` 5–6 domains and `complex` (3).** C: gen-chem-1#4, inorganic#1 (and its isomer
  cards). Check: lone pairs equatorial in 5 domains, trans in 6; angles. Spec: C-P13.
- **HC73 `phScale` mode `pka` (3).** C: organic-1#0~pka-equilibrium, ~acid-order; organic-2#3.
  Check: positions by pKₐ; the arrow toward the weaker acid. Spec: C-P22.
- **HC74 `moleMap` `solution` and `gas` boxes, `reaction` CₓHᵧO_z (3).** C:
  gen-chem-1#1~solution-stoich, #2~gas-stoich, #1. Check: each factor's arithmetic; atoms
  balance. Spec: C-P24.
- **HC75 `aquifer` (new kind) (3).** EG: hydrology#2, ~head, ~thiem. Check: i = Δh ÷ L; flow high
  to low head; the Thiem curve through both heads. Spec: EG-P17.
- **HC76 `refraction` (new kind) (3).** EG: geophysics#0, ~reflection, geophysics#3~gpr. Check:
  i_c = sin⁻¹(v₁ ÷ v₂); the lines cross at x_c; t(x) = √(x² + 4h²) ÷ v. Spec: EG-P20.
- **HC77 `coordinatePlane` `polygon`, `buffer`, `center` (3).** EG: gis#1, ~buffer,
  gis#3~mean-center. Check: shoelace area; 2rL + πr²; mean center and SD circle. Spec: EG-P26.
- **HC78 `projection` (new kind, with a card figure) (3).** EG: cartography#0, ~equal-area,
  ~properties (cards). Check: y(φ) by formula; Tissot axes k_E, k_N; product 1 on equal area.
  Spec: EG-P28.
- **HC79 `membrane` `potential` and `psi` (3).** B: cell-molecular#0, ~goldman;
  principles-2#2. Check: V's sign matches the charges; water toward lower Ψ. Spec: B-P5.
- **HC80 `dilutionSeries` (new kind) (3).** B: microbiology#1~plate-count, microbiology#2,
  microbiology#3~titer. Check: CFU/mL = colonies ÷ (dilution × volume); the titer tube. Spec:
  B-P14.
- **HC81 `simpleMachine` `limb` (3).** B: anatomy-physiology#1 (later), biomechanics#1, ~hip.
  Check: Σ moments about the joint = 0; the joint force from vertical balance. Spec: B-P21.
- **HC82 `binaryPhase` (new kind) (3).** ME: materials-science#2 and its two types. Isomorphous
  lens, eutectic, the iron–carbon steel corner (0.76 wt% C, 727 °C), tie line and lever arms,
  phase-fraction bars. Check: fractions add to 1 and match the lever arms. Spec: ME-P8.
- **HC83 `machining` (new kind) (3).** ME: manufacturing#1, ~milling, ~finish. Check: v = πDN;
  cusp height matches R_a. Spec: ME-P19.
- **HC84 `linkage` (new kind) (3).** ME: dynamics#3~rolling, ~ic; cad-graphics#3. Check:
  velocities ⟂ to their IC rays and ∝ distance. Spec: ME-P29.
- **HC85 card icons: crystal defects, process families, additive families (3).** ME:
  materials-science#1~defects, manufacturing#0~families, #2~families. Check: layout harness.
  Spec: ME-P31.
- **HC86 `lamina` (new kind) (3).** ACC: aerospace-structures#1 (3 pages). Fibers in matrix at
  V_f, springs in parallel (along) or series (across), E bars. Check: fiber share = V_f within 2%;
  E₂ ≤ E₁. Spec: ACC-P8.
- **HC87 `rocket` (new kind) (3).** ACC: propulsion#1 (3 pages). Check: propellant share = 1 −
  m_f ÷ m₀; Δv grows with the mass ratio. Spec: ACC-P11.
- **HC88 `streamChannel` `manning`, `froude`, `specificEnergy`, `jump` (3).** ACC:
  hydraulics-hydrology#0 (3 pages). Check: E least at y_c; y₂ > y₁ and Fr₁ > 1 for a jump. Spec:
  ACC-P19.
- **HC89 `hydrograph` (new kind) (3).** ACC: hydraulics-hydrology#2, ~rational, #3~detention.
  Check: I_a + F + Q = P; storage = ½t_b(Q_i − Q_o). Spec: ACC-P21. (EG's `catchment`, HC129, is
  the same rational method from above.)
- **HC90 `blockDiagram` (new kind) (3).** ACC: process-control#1, #3, ~feedforward. Check: minus
  at the comparator; every gain shown is a value. Spec: ACC-P34.
- **HC91 `waterfall` `decibels` (3).** EC: electromagnetics#3, comm#2, electronics#2~cascade.
  Check: the end bar equals the sum of the signed items. Spec: EC-P12.
- **HC92 `functionGraph` `quantizer` (3).** EC: embedded#0, ~dac; signals#4~quantization. Check:
  the lit step's code equals D. Spec: EC-P26.
- **HC93 `wave` `em` and `line` (3).** P: electromagnetism#3. EC: electromagnetics#0 (`line`),
  #2 (`em`). E and B (or H) in step along the travel direction, E₀, B₀, λ, S; the standing-wave
  envelope on a line with V_max, V_min and the load. Check: B₀ = E₀ ÷ c; V_max ÷ V_min = VSWR.
  Spec: P-P25, EC-P11.

## Round 4 — single-page and two-page pictures, cards and explore figures (98 requests)

One or two pages each. Batch them by group; the spec line names the plan entry with the full
fields and check.

- **Mathematics.** HC94 `matrixGrid` 3 × 6 and 4 × 8 rows with a determinant `tally` (2:
  linear-algebra#0~inverse, #2; M-P11). HC95 `transformation` `move: 'matrix'` with `eigen` (2:
  linear-algebra#3, #2~volume; M-P12). HC96 `vectorDiagram` `project` (2: linear-algebra#4
  ~projection, ~gram-schmidt; M-P14). HC97 `scatter` `pointsFrom` (1: linear-algebra#4; M-P13).
  HC98 `treeDiagram` `chain` (1: calc-3#1~chain; M-P19).
- **Physics.** HC99 `motionGraph` `polynomial` (1: university-1#0~calculus; P-P1). HC100
  `vectorDiagram` `masses` and `centerOfMass` (1: university-1#3~center-of-mass; P-P4). HC101
  `impulse` shapes (1: university-1#3~impulse-curve; P-P5). HC102 `rotor` `rolling` and `rod` (2:
  university-1#4, ~parallel-axis; P-P6). HC103 `pendulum` `rod` (1:
  university-1#5~physical-pendulum; P-P9). HC104 `spacetime` (new kind) (2: university-3#2
  ~lorentz, ~velocity-addition; P-P16). HC105 `photoelectric` `mode: 'compton'` (1:
  university-3#3; P-P17). HC106 `rotor` `precession` (1: classical-mechanics#3; P-P21). HC107
  `rotor` `plate` (1: classical-mechanics#3~principal-axes; P-P22). HC108 `vectorDiagram` `cone`
  (1: quantum#2; P-P26).
- **Chemistry.** HC109 `orbitalDiagram` ladder `Z` and mode `radial` (2: physical-2#2, ~radius;
  C-P2). HC110 `orbitalDiagram` mode `crystalField` (2: inorganic#2, inorganic#1's d count;
  C-P4). HC111 `lewisStructure` `formal`, `resonance`, expanded octets (1:
  gen-chem-1#4~formal-charge; C-P12). HC112 `beaker` `cuvette` (1: analytical#2; C-P16). HC113
  explore figure `symmetryElements` and `molecule` card formulas (1: inorganic#0; C-P18). HC114
  `normalCurve` `family: 't'` (2: analytical#0, ~t-test; C-P19). HC115 `macromolecules` `level`
  (1: biochemistry#0~levels; C-P21).
- **Earth and geography.** HC116 `ternary` (new kind; QAP and feldspar fields, later soil
  texture) (2: physical-geology#0, mineralogy#1~plagioclase; EG-P1). HC117 `silicateChain` (new
  kind) (1: physical-geology#0~silicates; EG-P2). HC118 `freeBody` incline `slab` (2:
  physical-geology#3, ~glacier; EG-P4). HC119 `earthLayers` `rupture` (1: physical-geology#2;
  EG-P5). HC120 `rockLayers` `ranges` and the dated cliff as a sequence `header` figure (2:
  historical-geology#2, #0; EG-P6). HC121 `michelLevy` (new kind) (1: mineralogy#2; EG-P9).
  HC122 `atmosphereLayers` `thickness` (2: meteorology#0, ~pressure-altitude; EG-P10). HC123
  `atmosphereLayers` `adiabat` and `saturation` (2: meteorology#1, ~humidity; EG-P11). HC124
  `atmosphereLayers` parcel `dry` and `dewLapse` (1: meteorology#1~lcl; EG-P12). HC125
  `atmosphereLayers` balance `layer` (1: climatology#0; EG-P13). HC126 `oceanProfile` `slope` (1:
  oceanography#2; EG-P14). HC127 `tsDiagram` (new kind) (1: oceanography#1; EG-P15). HC128 `wave`
  `depth` (2: oceanography#3, ~tsunami; EG-P16). HC129 `catchment` (new kind) (1: hydrology#1;
  EG-P18). HC130 `rayDiagram` Snell `speeds` (1: geophysics#0~critical-angle; EG-P21). HC131
  `gravityProfile` (new kind) (2: geophysics#1~sphere, ~isostasy; EG-P22). HC132 `electrodeArray`
  (new kind) (1: geophysics#3; EG-P23). HC133 `contourMap` (new kind) (1: physical-geography#2;
  EG-P24). HC134 `rasterGrid` (new kind) (2: gis#0, gis#2; EG-P25). HC135 `sample` `pattern` (1:
  gis#3; EG-P27). HC136 `populationPyramid` (new kind) (1: human-geography#0~dependency; EG-P29).
  HC137 `sensorGeometry` (new kind) (1: remote-sensing#0; EG-P30). HC138 `spectralCurve` (new
  kind) (2: remote-sensing#1~ndvi, #3; EG-P31). HC139 `scatter` `classes` (1:
  remote-sensing#2~min-distance; EG-P32). HC140 explore figure `circulationCells` (1:
  climatology#1~cells; EG-P33).
- **Biology and bioengineering.** HC141 `curvedSolid` `ratio` (1: principles-1#1; B-P1). HC142
  `cellDivision` `content` (1: principles-1#3; B-P3). HC143 card icons, evidence for evolution
  (1: principles-2#0; B-P4). HC144 `pedigree` as a calculator picture and as a card figure (2:
  genetics#0, ~modes; B-P6, B-P7, one drawing of `people`). HC145 `linkageMap` (new kind) (2:
  genetics#1, ~three-point; B-P8). HC146 card figure `codons` (1: genetics#2~mutations; B-P9).
  HC147 `geneExpression` `corepressor` (1: cell-molecular#2; B-P11). HC148 `functionGraph`
  `threshold` with a second curve (1: cell-molecular#2~fold-change; B-P12). HC149 Gram icons and
  `fieldOfView` `resolution` (2: microbiology#0, ~resolution; B-P13). HC150 `sample` `herd` (1:
  microbiology#3; B-P15). HC151 `alleleFrequencies` `after` (1: evolution#0; B-P17). HC152
  `normalCurve` `shift` (1: evolution#0~breeders; B-P18). HC153 `driftPaths` (new kind) (1:
  evolution#1; B-P19). HC154 card icons, tissues (2: anatomy-physiology#0, ~epithelia; B-P20).
  HC155 `heartPump` (new kind) (2: anatomy-physiology#3, ~ejection; B-P22). HC156 `footprints`
  (new kind) and card figure `gait` (2: biomechanics#2, ~phases; B-P24). HC157 `springDashpot`
  (new kind) (2: biomechanics#3, ~creep; B-P25). HC158 card icons, biomaterials and imaging (2:
  biomaterials#1~classes, bioinstrumentation#2~modalities; B-P26). HC159 `diffusionProfile` (new
  kind) (1: biotransport#0; B-P27). HC160 `dialyzer` (new kind; may build on HC5) (1:
  biotransport#2; B-P29). HC161 `attenuation` (new kind, `echo`) (2: bioinstrumentation#2,
  ~ultrasound; B-P32). HC162 `scaffold` (new kind) (1: tissue-engineering#0; B-P33). HC163
  `ligandGrid` (new kind) (1: tissue-engineering#1; B-P34). HC164 `bioreactor` (new kind; may
  build on HC5) (1: tissue-engineering#2; B-P35).
- **Mechanical.** HC165 `moodyChart` (new kind; curves from Colebrook) (1: fluid-mechanics#4;
  ME-P13). HC166 `gearPair` (new kind) (2: machine-design#3, ~train; ME-P18). HC167 `printLayers`
  (new kind) (2: manufacturing#2, ~cusp; ME-P20). HC168 `fitDiagram` (new kind) (2:
  manufacturing#3, ~stack; ME-P21). HC169 explore figure `orthographic` with line-type card icons
  (1: cad-graphics#0; ME-P22). HC170 card icons, GD&T symbols (1: cad-graphics#1; ME-P23). HC171
  `vectorDiagram` `forces` (2: statics#0, ~components; ME-P26). HC172 `casting` (new kind, low
  priority) (2: manufacturing#0, ~riser; ME-P30).
- **Aero, civil, chemical.** HC173 explore figure `orbitElements` (1:
  orbital-mechanics#1~elements; ACC-P13). HC174 `soilPhases` (new kind) (2: soil-mechanics#0,
  #1~sand-cone; ACC-P16). HC175 `losScale` (new kind) (1: transportation#3; ACC-P23). HC176
  `settlingTank` (new kind) (1: environmental#0; ACC-P25). HC177 `plume` (new kind) (1:
  environmental#2; ACC-P26). HC178 card figure `pfdSymbol` (1:
  material-energy-balances#0~symbols; ACC-P36).
- **Electrical and computer.** HC179 `functionGraph` `fourier` (1: signals#2; EC-P10). HC180
  `oneLine` (new kind) (2: power#2, ~slg; EC-P13). HC181 `rfSpectrum` (new kind) (2: comm#0, ~fm;
  EC-P15). HC182 `complexPlane` `constellation` (1: comm#1; EC-P16). HC183 `placeValueChart`
  `base` 2, 8, 16 (1: digital-logic#0; EC-P17). HC184 `karnaugh` (new calculator kind and explore
  figure) (2: digital-logic#1, discrete#0~truth-table; EC-P19). HC185 explore figure
  `stateDiagram` (1: digital-logic#3; EC-P21). HC186 `pipelineDiagram` (new kind) (1:
  architecture#2; EC-P23). HC187 explore figure `dataStructure` (2: data-structures#0, #2;
  EC-P25). HC188 `venn` `three` (1: discrete#1; EC-P27). HC189 `memoryMap` (new kind) (2: OS#2,
  OS#3; EC-P28). HC190 `matrixGrid` `routh` (2: control#2, ~routh-count; EC-P29). HC191 `datapath`
  (new kind) (2: architecture#1, ~critical-path; EC-P32).

## Checks (essentials only)

- `npx tsc --noEmit -p .` and eslint on the files you changed.
- The tests of your demos by id: `MODULE_IDS=<demo ids> npx jest --maxWorkers=1 src/data/modules`.
- One screenshot per demo at 390 px:
  `NODE_PATH=$(npm root -g) pnpm shots -- <ids> --widths 390 --out .review/he-r<round>`.
- Before a push, `node scripts/ci-test.mjs` (the cheap suites).

No `--heavy`, `--full` or deep runs: the heavy suites run once a day, nightly, and the owner
authorizes any other heavy run. The lesson chat checks the pages when it places the parts.

## When you finish

- Commit after each kind with a clear message; push once per round (or per batch in rounds 3–4)
  after `node scripts/ci-test.mjs`.
- Set the tracker entry to `drawn`, list its gallery ids, and in `notes` give the fields a page
  passes with an example: that is the lesson chat's instruction for placing it.
- Add a dated line under "Done" in `docs/RENDERINGS_BRIEF.md` after each round, naming the `HC`
  ids drawn, so the lesson chat knows which courses it can start.

## Tracker

Every merged request, with the number of planned pages it serves (across groups) and its round.
"From" names the plan requests merged into it.

| Id    | Kind or figure                                   | From                               | Pages | Round |
| ----- | ------------------------------------------------ | ---------------------------------- | ----- | ----- |
| HC1   | `beam` (new)                                     | ME-P1, ACC-P14, ACC-P7             | 31    | 1     |
| HC2   | `skeletal` (new) + card                          | C-P14                              | 22    | 1     |
| HC3   | `section` (new)                                  | ME-P3, ACC-P6                      | 21    | 1     |
| HC4   | `functionGraph` `transient`, `stepResponse`      | EC-P4, EC-P5, ACC-P5               | 18    | 1     |
| HC5   | `controlVolume` (new)                            | ACC-P9, ME-P11                     | 17    | 1     |
| HC6   | `fluidSystem` (new)                              | ME-P12, ACC-P20                    | 16    | 1     |
| HC7   | `seriesCircuit`/`circuit` schematic `net`        | EC-P1, P-P11, P-P12, B-P31         | 15    | 1     |
| HC8   | `phaseEnvelope` (new) + `chemDiagram` phase      | ACC-P30, C-P8                      | 14    | 1     |
| HC9   | `functionGraph` log and flipped axes             | EG-P19, ACC-P37, ME-P9, B need 6   | 14    | 1     |
| HC10  | `functionGraph` families                         | M-P3, B-P10, B-P30, B-P36, ME-P9   | 14    | 1     |
| HC11  | `oscillator` damping, forcing, phase, coupled    | M-P10, P-P8, P-P23, ME-P16, EC-P30 | 13    | 1     |
| HC12  | `functionGraph` regions                          | M-P2, M-P5, P-P18, ACC-P33, EC-P14 | 12    | 1     |
| HC13  | `velocityProfile` (new)                          | ACC-P31, B-P28                     | 12    | 1     |
| HC14  | `complexPlane` phasors, poles, locus             | EC-P6                              | 9     | 2     |
| HC15  | `potentialWell` (new)                            | P-P19, C-P1                        | 9     | 2     |
| HC16  | `unitCell` (new)                                 | C-P17, ME-P7, EG-P7, EG-P8         | 9     | 2     |
| HC17  | `propertyDiagram` (new)                          | ME-P10, ACC-P10                    | 9     | 2     |
| HC18  | `seriesCircuit` `amp`                            | EC-P2, B-P31                       | 9     | 2     |
| HC19  | `induction` field sources, rails                 | P-P13, P-P14, EC-P31               | 9     | 2     |
| HC20  | `freeBody` pulley, ladder, tip, drum, banked     | P-P2, P-P7, P-P3, ME-P27           | 9     | 2     |
| HC21  | `fieldPlot` (new)                                | M-P9, B-P16                        | 8     | 2     |
| HC22  | `bode` (new)                                     | EC-P7                              | 8     | 2     |
| HC23  | `thermalWall` (new)                              | ME-P14, ACC-P31                    | 8     | 2     |
| HC24  | `wing` (new)                                     | ACC-P1                             | 8     | 2     |
| HC25  | `freeBody` aircraft                              | ACC-P4                             | 8     | 2     |
| HC26  | `soilProfile` (new)                              | ACC-P17                            | 8     | 2     |
| HC27  | `truss` (new) + card                             | ME-P2, ACC-P15                     | 7     | 2     |
| HC28  | `stressStrain` (new)                             | ME-P5, B-P23                       | 7     | 2     |
| HC29  | `charges` Gauss, ring, disk, image               | P-P10, P-P24, EC-P31               | 7     | 2     |
| HC30  | `duct` (new)                                     | ACC-P2                             | 7     | 2     |
| HC31  | `supersonicFlow` (new)                           | ACC-P3                             | 7     | 2     |
| HC32  | `survey` (new)                                   | ACC-P27, ACC-P28, ACC-P29          | 7     | 2     |
| HC33  | `stressElement` (new) with Mohr's circle         | ME-P4, ACC-P18                     | 6     | 2     |
| HC34  | `chemDiagram` rate, consecutive                  | C-P7, ACC-P32                      | 6     | 2     |
| HC35  | `circularMotion` orbits, n–t                     | P-P3, ACC-P12, ME-P28              | 6     | 2     |
| HC36  | `globe` (new)                                    | EG-P3                              | 6     | 2     |
| HC37  | `functionGraph` `tangent`, `band`                | M-P1                               | 6     | 2     |
| HC38  | `functionGraph` `series`                         | M-P4                               | 6     | 2     |
| HC39  | `seriesCircuit` `device`                         | EC-P3                              | 6     | 2     |
| HC40  | `heatExchanger` (new)                            | ME-P15, ACC-P35                    | 5     | 3     |
| HC41  | `elementChain` (new)                             | ME-P25, ACC-P14                    | 5     | 3     |
| HC42  | `functionGraph` `distribution`                   | P-P28, C-P10, ME-P14               | 5     | 3     |
| HC43  | `gasPiston` `pv`, `real`                         | P-P27, C-P11, C-P10                | 5     | 3     |
| HC44  | `energyProfile` `G`, `steps`, `bomb`             | B-P2, C-P15                        | 5     | 3     |
| HC45  | `functionGraph` numerical methods                | ME-P9                              | 5     | 3     |
| HC46  | `surfacePlot` (new)                              | M-P7                               | 5     | 3     |
| HC47  | `vectorDiagram` `space` objects                  | M-P8                               | 5     | 3     |
| HC48  | explore `codeTrace` + card `code`                | ME-P24                             | 5     | 3     |
| HC49  | `timingDiagram` (new)                            | EC-P20                             | 5     | 3     |
| HC50  | `graph` (new) + card                             | EC-P22                             | 5     | 3     |
| HC51  | `scheduleChart` (new)                            | EC-P24                             | 5     | 3     |
| HC52  | `fatigueDiagram` (new)                           | ME-P17, ACC-P37                    | 4     | 3     |
| HC53  | `polarGrid` options                              | M-P15                              | 4     | 3     |
| HC54  | `rightTriangle` `rates`, `curvedSolid` fill/slab | M-P16                              | 4     | 3     |
| HC55  | `instrumentTrace` (new) + card                   | C-P5                               | 4     | 3     |
| HC56  | `chemDiagram` `cell`                             | C-P9                               | 4     | 3     |
| HC57  | `organelleEnergy` `detail` + card                | C-P20                              | 4     | 3     |
| HC58  | `equilibriumChart` `gibbs`                       | C-P23                              | 4     | 3     |
| HC59  | `shaft` (new)                                    | ME-P6                              | 4     | 3     |
| HC60  | `roadCurve` (new)                                | ACC-P22                            | 4     | 3     |
| HC61  | `connection` (new)                               | ACC-P24                            | 4     | 3     |
| HC62  | `deviceCurves` (new)                             | EC-P8                              | 4     | 3     |
| HC63  | `stemPlot` (new)                                 | EC-P9                              | 4     | 3     |
| HC64  | `bitFields` (new)                                | EC-P18                             | 4     | 3     |
| HC65  | `solidOfRevolution` (new)                        | M-P6                               | 3     | 3     |
| HC66  | `termsChart` series                              | M-P17                              | 3     | 3     |
| HC67  | `rectangle` `grow`, `conicGraph` `under`         | M-P18                              | 3     | 3     |
| HC68  | `rayDiagram` slit, grating, thin film            | P-P15                              | 3     | 3     |
| HC69  | `phaseSpace` (new)                               | P-P20                              | 3     | 3     |
| HC70  | `orbitalDiagram` `mo`                            | C-P3                               | 3     | 3     |
| HC71  | `phScale` titration                              | C-P6                               | 3     | 3     |
| HC72  | `vsepr` 5–6 domains, `complex`                   | C-P13                              | 3     | 3     |
| HC73  | `phScale` `pka`                                  | C-P22                              | 3     | 3     |
| HC74  | `moleMap` boxes, `reaction` CₓHᵧO_z              | C-P24                              | 3     | 3     |
| HC75  | `aquifer` (new)                                  | EG-P17                             | 3     | 3     |
| HC76  | `refraction` (new)                               | EG-P20                             | 3     | 3     |
| HC77  | `coordinatePlane` polygon, buffer, center        | EG-P26                             | 3     | 3     |
| HC78  | `projection` (new) + card                        | EG-P28                             | 3     | 3     |
| HC79  | `membrane` `potential`, `psi`                    | B-P5                               | 3     | 3     |
| HC80  | `dilutionSeries` (new)                           | B-P14                              | 3     | 3     |
| HC81  | `simpleMachine` `limb`                           | B-P21                              | 3     | 3     |
| HC82  | `binaryPhase` (new)                              | ME-P8                              | 3     | 3     |
| HC83  | `machining` (new)                                | ME-P19                             | 3     | 3     |
| HC84  | `linkage` (new)                                  | ME-P29                             | 3     | 3     |
| HC85  | card icons: defects, process families            | ME-P31                             | 3     | 3     |
| HC86  | `lamina` (new)                                   | ACC-P8                             | 3     | 3     |
| HC87  | `rocket` (new)                                   | ACC-P11                            | 3     | 3     |
| HC88  | `streamChannel` options                          | ACC-P19                            | 3     | 3     |
| HC89  | `hydrograph` (new)                               | ACC-P21                            | 3     | 3     |
| HC90  | `blockDiagram` (new)                             | ACC-P34                            | 3     | 3     |
| HC91  | `waterfall` `decibels`                           | EC-P12                             | 3     | 3     |
| HC92  | `functionGraph` `quantizer`                      | EC-P26                             | 3     | 3     |
| HC93  | `wave` `em`, `line`                              | P-P25, EC-P11                      | 3     | 3     |
| HC94  | `matrixGrid` wide rows, `tally`                  | M-P11                              | 2     | 4     |
| HC95  | `transformation` matrix, `eigen`                 | M-P12                              | 2     | 4     |
| HC96  | `vectorDiagram` `project`                        | M-P14                              | 2     | 4     |
| HC97  | `scatter` `pointsFrom`                           | M-P13                              | 1     | 4     |
| HC98  | `treeDiagram` `chain`                            | M-P19                              | 1     | 4     |
| HC99  | `motionGraph` `polynomial`                       | P-P1                               | 1     | 4     |
| HC100 | `vectorDiagram` `masses`                         | P-P4                               | 1     | 4     |
| HC101 | `impulse` shapes                                 | P-P5                               | 1     | 4     |
| HC102 | `rotor` `rolling`, `rod`                         | P-P6                               | 2     | 4     |
| HC103 | `pendulum` `rod`                                 | P-P9                               | 1     | 4     |
| HC104 | `spacetime` (new)                                | P-P16                              | 2     | 4     |
| HC105 | `photoelectric` `compton`                        | P-P17                              | 1     | 4     |
| HC106 | `rotor` `precession`                             | P-P21                              | 1     | 4     |
| HC107 | `rotor` `plate`                                  | P-P22                              | 1     | 4     |
| HC108 | `vectorDiagram` `cone`                           | P-P26                              | 1     | 4     |
| HC109 | `orbitalDiagram` `Z`, `radial`                   | C-P2                               | 2     | 4     |
| HC110 | `orbitalDiagram` `crystalField`                  | C-P4                               | 2     | 4     |
| HC111 | `lewisStructure` formal, resonance               | C-P12                              | 1     | 4     |
| HC112 | `beaker` `cuvette`                               | C-P16                              | 1     | 4     |
| HC113 | explore `symmetryElements` + card                | C-P18                              | 1     | 4     |
| HC114 | `normalCurve` `t`                                | C-P19                              | 2     | 4     |
| HC115 | `macromolecules` `level`                         | C-P21                              | 1     | 4     |
| HC116 | `ternary` (new)                                  | EG-P1                              | 2     | 4     |
| HC117 | `silicateChain` (new)                            | EG-P2                              | 1     | 4     |
| HC118 | `freeBody` `slab`                                | EG-P4                              | 2     | 4     |
| HC119 | `earthLayers` `rupture`                          | EG-P5                              | 1     | 4     |
| HC120 | `rockLayers` ranges, header figure               | EG-P6                              | 2     | 4     |
| HC121 | `michelLevy` (new)                               | EG-P9                              | 1     | 4     |
| HC122 | `atmosphereLayers` `thickness`                   | EG-P10                             | 2     | 4     |
| HC123 | `atmosphereLayers` `adiabat`, `saturation`       | EG-P11                             | 2     | 4     |
| HC124 | `atmosphereLayers` parcel lapse rates            | EG-P12                             | 1     | 4     |
| HC125 | `atmosphereLayers` balance `layer`               | EG-P13                             | 1     | 4     |
| HC126 | `oceanProfile` `slope`                           | EG-P14                             | 1     | 4     |
| HC127 | `tsDiagram` (new)                                | EG-P15                             | 1     | 4     |
| HC128 | `wave` `depth`                                   | EG-P16                             | 2     | 4     |
| HC129 | `catchment` (new)                                | EG-P18                             | 1     | 4     |
| HC130 | `rayDiagram` Snell `speeds`                      | EG-P21                             | 1     | 4     |
| HC131 | `gravityProfile` (new)                           | EG-P22                             | 2     | 4     |
| HC132 | `electrodeArray` (new)                           | EG-P23                             | 1     | 4     |
| HC133 | `contourMap` (new)                               | EG-P24                             | 1     | 4     |
| HC134 | `rasterGrid` (new)                               | EG-P25                             | 2     | 4     |
| HC135 | `sample` `pattern`                               | EG-P27                             | 1     | 4     |
| HC136 | `populationPyramid` (new)                        | EG-P29                             | 1     | 4     |
| HC137 | `sensorGeometry` (new)                           | EG-P30                             | 1     | 4     |
| HC138 | `spectralCurve` (new)                            | EG-P31                             | 2     | 4     |
| HC139 | `scatter` `classes`                              | EG-P32                             | 1     | 4     |
| HC140 | explore `circulationCells`                       | EG-P33                             | 1     | 4     |
| HC141 | `curvedSolid` `ratio`                            | B-P1                               | 1     | 4     |
| HC142 | `cellDivision` `content`                         | B-P3                               | 1     | 4     |
| HC143 | card icons, evidence for evolution               | B-P4                               | 1     | 4     |
| HC144 | `pedigree` calculator picture + card             | B-P6, B-P7                         | 2     | 4     |
| HC145 | `linkageMap` (new)                               | B-P8                               | 2     | 4     |
| HC146 | card `codons`                                    | B-P9                               | 1     | 4     |
| HC147 | `geneExpression` `corepressor`                   | B-P11                              | 1     | 4     |
| HC148 | `functionGraph` `threshold`                      | B-P12                              | 1     | 4     |
| HC149 | Gram icons, `fieldOfView` `resolution`           | B-P13                              | 2     | 4     |
| HC150 | `sample` `herd`                                  | B-P15                              | 1     | 4     |
| HC151 | `alleleFrequencies` `after`                      | B-P17                              | 1     | 4     |
| HC152 | `normalCurve` `shift`                            | B-P18                              | 1     | 4     |
| HC153 | `driftPaths` (new)                               | B-P19                              | 1     | 4     |
| HC154 | card icons, tissues                              | B-P20                              | 2     | 4     |
| HC155 | `heartPump` (new)                                | B-P22                              | 2     | 4     |
| HC156 | `footprints` (new) + card `gait`                 | B-P24                              | 2     | 4     |
| HC157 | `springDashpot` (new)                            | B-P25                              | 2     | 4     |
| HC158 | card icons, biomaterials and imaging             | B-P26                              | 2     | 4     |
| HC159 | `diffusionProfile` (new)                         | B-P27                              | 1     | 4     |
| HC160 | `dialyzer` (new)                                 | B-P29                              | 1     | 4     |
| HC161 | `attenuation` (new)                              | B-P32                              | 2     | 4     |
| HC162 | `scaffold` (new)                                 | B-P33                              | 1     | 4     |
| HC163 | `ligandGrid` (new)                               | B-P34                              | 1     | 4     |
| HC164 | `bioreactor` (new)                               | B-P35                              | 1     | 4     |
| HC165 | `moodyChart` (new)                               | ME-P13                             | 1     | 4     |
| HC166 | `gearPair` (new)                                 | ME-P18                             | 2     | 4     |
| HC167 | `printLayers` (new)                              | ME-P20                             | 2     | 4     |
| HC168 | `fitDiagram` (new)                               | ME-P21                             | 2     | 4     |
| HC169 | explore `orthographic` + line-type cards         | ME-P22                             | 1     | 4     |
| HC170 | card icons, GD&T                                 | ME-P23                             | 1     | 4     |
| HC171 | `vectorDiagram` `forces`                         | ME-P26                             | 2     | 4     |
| HC172 | `casting` (new)                                  | ME-P30                             | 2     | 4     |
| HC173 | explore `orbitElements`                          | ACC-P13                            | 1     | 4     |
| HC174 | `soilPhases` (new)                               | ACC-P16                            | 2     | 4     |
| HC175 | `losScale` (new)                                 | ACC-P23                            | 1     | 4     |
| HC176 | `settlingTank` (new)                             | ACC-P25                            | 1     | 4     |
| HC177 | `plume` (new)                                    | ACC-P26                            | 1     | 4     |
| HC178 | card `pfdSymbol`                                 | ACC-P36                            | 1     | 4     |
| HC179 | `functionGraph` `fourier`                        | EC-P10                             | 1     | 4     |
| HC180 | `oneLine` (new)                                  | EC-P13                             | 2     | 4     |
| HC181 | `rfSpectrum` (new)                               | EC-P15                             | 2     | 4     |
| HC182 | `complexPlane` `constellation`                   | EC-P16                             | 1     | 4     |
| HC183 | `placeValueChart` `base`                         | EC-P17                             | 1     | 4     |
| HC184 | `karnaugh` (new) + explore                       | EC-P19                             | 2     | 4     |
| HC185 | explore `stateDiagram`                           | EC-P21                             | 1     | 4     |
| HC186 | `pipelineDiagram` (new)                          | EC-P23                             | 1     | 4     |
| HC187 | explore `dataStructure`                          | EC-P25                             | 2     | 4     |
| HC188 | `venn` `three`                                   | EC-P27                             | 1     | 4     |
| HC189 | `memoryMap` (new)                                | EC-P28                             | 2     | 4     |
| HC190 | `matrixGrid` `routh`                             | EC-P29                             | 2     | 4     |
| HC191 | `datapath` (new)                                 | EC-P32                             | 2     | 4     |
