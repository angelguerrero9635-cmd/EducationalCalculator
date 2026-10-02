# Direction plan: higher education, Earth Science and Geography (13 courses, 51 topics)

Group `earth-geography`: the Earth Science field (Physical Geology, Historical Geology, Mineralogy,
Meteorology, Oceanography, Hydrology, Geophysics; 27 topics) and the Geography field (Physical
Geography, Human Geography, Cartography, GIS, Climatology, Remote Sensing; 24 topics, one of them the
pilot `he.geography.human-geography#0`). Written from the brief, `src/data/taxonomy.ts` (`COURSES`),
`docs/MODULE_GUIDE.md` ("Standards"), `docs/LAYOUTS.md`, `docs/EQUATION_INPUTS.md`, `docs/PICTURES.md`,
the HS earth-science picture specs (`typesHsl.ts`, `typesHs2f.ts`, `typesHs3c.ts`, `typesHsj.ts`) and the
pilot in `src/data/modules/college.ts`. There are no college questions or textbook lists in
`research/` yet, so every "Asks" table lists the common exam and textbook question types from what
intro courses teach (from memory, to be checked by the research in part 4). Every example below is
original and was worked by hand; nothing is copied from `research/` or from a textbook.

## Decisions

- **Notation.** The name first, then the symbol, on every value ("Hydraulic conductivity (K)",
  "Seismic moment (M₀)"), Unicode subscripts, SI units, sentences ≤ 35 words, ≤ 10 values a page,
  3 significant figures in answers (the Grades 9–12 rules; nothing here needs more). One symbol, one
  meaning on a page: latitude is φ everywhere; longitude λ only on Cartography pages; λ is the decay
  constant on dating pages and the wavelength on Mineralogy, Climatology and Remote Sensing pages, never
  two of these on one page. Depth is positive down (z), altitude positive up (z). Ages are in Ma or Ga
  ("million years ago"), durations in Myr or yr (both are already units: `Ma`, `Ga`, `kyr`, `years`).
- **Constants** (named in an assumption on every page that uses one): g = 9.81 m/s² (Stull, geophysics
  texts; no picture in this plan hard-codes 9.8 except `atmosphereLayers` parcel, see P12); Earth radius
  R = 6,371 km; Ω = 7.292 × 10⁻⁵ rad/s; σ = 5.67 × 10⁻⁸ W/(m²·K⁴); S₀ = 1,361 W/m² (the `balance`
  default); R_d = 287 J/(kg·K), c_p = 1,004 J/(kg·K), κ = R_d/c_p = 0.286; seawater 1,025 kg/m³, fresh
  water 1,000 kg/m³; G = 6.674 × 10⁻¹¹ N·m²/kg²; GM = 3.986 × 10¹⁴ m³/s²; Wien b = 2,898 μm·K;
  hc = 1,240 eV·nm; c = 3.00 × 10⁸ m/s; Avogadro 6.022 × 10²³. Half-lives: U-238 4,468 Ma, K-40
  1,250 Ma (λ = 5.54 × 10⁻¹⁰ per year, 10.5 % of decays give Ar-40), Rb-87 λ = 1.42 × 10⁻¹¹ per year,
  C-14 5,730 yr. Dry adiabatic lapse rate 9.8 °C/km, dew point 1.8 °C/km (LCL 125 m per °C of spread),
  standard troposphere 6.5 °C/km.
- **Calculus and logs in steps.** These courses are taught algebra-based (Stull's subtitle is "an
  algebra-based survey"); the derivative forms (dp/dz = −ρg, q = −k dT/dz, Darcy's dh/dl) appear only
  in the rule in words, and the steps work the difference form ("Δh ÷ L", "ΔT ÷ Δz"). Logs and powers
  are worked one stage a line: ln, log₁₀, eˣ, 10ˣ, fractional powers (R^(2/3), (1000/p)^0.286),
  √ and ∜, each with its value. Trig takes degrees (`sind`, `asind`, …), and a compass bearing comes
  from an atan2 in degrees (E4). No integrals, matrices or ODEs in this group; the two places a
  closed form replaces one (the hypsometric equation with a mean temperature; half-space cooling) say
  so in an assumption.
- **Rows, not equations.** Every page keeps rows (named physical quantities whose units change, or
  several relations), except `he.geography.cartography#1~dms`, which takes `{d}° {m}′ {s}″ = {x}°`
  (fixed degree marks as text; one number sentence).
- **Category answers.** Several pages end in a class (BS or BW, El Niño, high burn severity, FS < 1
  unstable, clustered or dispersed, first-order white). Until the engine has a category result
  (E5), the class goes in the picture's caption or label (the picture checks it), never in a value.
- **Physical limits on ranges** (allowed edges a reviewer will try): ages ≤ 4,600 Ma; ocean depth
  ≤ 11,000 m; |φ| ≤ 90°; Mw ≤ 9.6 (the 1960 Chile quake was 9.5); slopes ≤ 70°; seawater salinity
  0–42 g/kg; relative humidity ≤ 100 % (supersaturation is not taught here); reflectances 0–1;
  albedo 0–1; population counts whole. Working values nobody types are `derived: true`; values a lesson
  names (crystal systems' shared oxygens, Köppen season factors) are `allowed: [...]`.
- **Layouts (45 pages).** Six main pages are layouts: `he.earth-science.historical-geology#0` and `#3`
  (sequences), `he.geography.physical-geography#1`, `he.geography.human-geography#3`,
  `he.geography.cartography#3` (sorts), `he.geography.climatology#2` (observe). The other 39 are
  problem types (33 sorts, 5 sequences, 3 explores, 4 observes in all; listed per topic). A topic whose
  idea is a classification, an order of events or a pattern over time is a layout; anything with a
  quantity relationship a teacher would work on the board is a calculator.
- **Pilot.** `he.geography.human-geography#0` has 12 values, over the cap of 10. Trim: the main keeps
  the components of change (P₀, B, D, I, E, N, M, ΔP and RNI from N ÷ P₀ × 100: 9 values, the
  waterfall unchanged), and a new `~rates` takes CBR, CDR, RNI and T₂ with P₀, B and D (7 values).
  Its example still works: CBR 12, CDR 8 → RNI 0.4 %, T₂ = 175 years. The rest of the pilot is
  sound (relations re-derived, example checked: 6,000 − 4,000 + 3,000 − 1,000 = 4,000).
- **Refresh.** Each course lists its K–12 pages to review first (the s.12 earth-science pages carry
  most of the HS versions of these ideas: `s.12.earth-interior`, `~magnitude`, `~spreading-rate`,
  `s.12.radiometric-dating`, `s.12.surface-processes~discharge`, `s.12.atmosphere-weather~cloud-base`,
  `s.12.climate-systems~energy-balance`). A college page never repeats an HS page: it adds the college
  quantity (moment magnitude, not the amplitude ratio; the isochron, not the half-life count).
- **Interims.** A page whose picture is a new request ships with the named interim (`table`,
  `functionGraph`, `bars`) and is marked ⏳; the picture replaces it when drawn.
- **Page count:** 51 topics, 170 pages (the pilot included, 169 to build): **125 calculators,
  45 layouts; 52 marked ⏳** (50 wait on a picture, 2 on an engine need only). Per course: Physical
  Geology 16, Historical Geology 13, Mineralogy 10, Meteorology 14, Oceanography 14, Hydrology 14,
  Geophysics 13, Physical Geography 13, Human Geography 16, Cartography 12, GIS 11, Climatology 12,
  Remote Sensing 12.

## Part 2. Courses and topics

### Physical Geology — `he.earth-science.physical-geology`

- **Prerequisite:** `s.12.earth-interior`. **Refresh:** `s.12.minerals-rocks`, `s.12.earth-interior`,
  `s.12.volcanoes-mountains`, `s.12.surface-processes`.
- **Textbooks:** Earle, Physical Geology 2e (ch. 2–3 minerals and igneous rocks, 4–7 rock types,
  10 plate tectonics, 11 earthquakes, 4 volcanism, 13 streams, 15 mass wasting, 16 glaciers).

#### #0 Minerals and rocks

| Question type                                          | Page         | Mark          |
| ------------------------------------------------------ | ------------ | ------------- |
| name a plutonic rock from its mineral percents (QAP)   | main         | Solves (⏳ P1) |
| formula and charge of a silicate structure             | ~silicates   | Solves (⏳ P2) |
| density or specific gravity of a mineral from a sample | ~density     | Solves        |
| igneous, sedimentary or metamorphic from a texture     | ~textures    | Solves        |
| order of crystallization (Bowen's series)              | ~bowen       | Solves        |

- **Main — BUILD `…#0`:** the IUGS QAP classification. Picture: new `ternary` (P1) with
  `fields: 'qap'`; interim `bars` (Q′, A′, P′). Values: quartz Q, alkali feldspar A, plagioclase P,
  mafic minerals M (% of the rock, 0–100 each, Q + A + P + M = 100), the sum Q + A + P (derived),
  normalized Q′, A′, P′ (%), plagioclase share P ÷ (A + P) (%). Relations: Q′ = 100Q ÷ (Q + A + P),
  and the same for A′, P′; share = 100P ÷ (A + P). Assumptions: QAP is for coarse-grained (plutonic)
  rocks with less than 90 % mafic minerals; the mafic minerals are left out before plotting; the
  field names the rock. Example: Q 25, A 30, P 20, M 25 → 75; Q′ 33.3, A′ 40.0, P′ 26.7 %; share
  40 % → granite (monzogranite field, P share 35–65 %). startWith Q, A, P, M. Use: "Use this for 'A
  rock is 25 % quartz, 30 % K-feldspar, 20 % plagioclase and 25 % biotite. Name it.'"
- **~silicates — BUILD (⏳ P2):** shared oxygens per tetrahedron s (allowed 0, 1, 2, 2.5, 3, 4),
  Si in the formula unit n (whole, 1–6), O per Si, O in the unit, the unit's charge. Relations:
  O per Si = 4 − s ÷ 2; O = n(4 − s ÷ 2); charge = −n(4 − s). Assumptions: each shared O is split
  between two tetrahedra; sharing more oxygens means less charge for cations to balance; ring and
  single-chain silicates both share 2. Example: double chain s = 2.5, n = 4 → O = 11, charge −6
  (Si₄O₁₁⁶⁻, amphiboles); sheet s = 3, n = 2 → Si₂O₅²⁻. Interim `table` (rows s = 0 … 4).
- **~density — BUILD:** `gradCylinder` (before, after, volume). Values: mass m (g, 0.1–1,000),
  level before and after (mL), volume V (cm³), density ρ (g/cm³), specific gravity G (ρ ÷ 1 g/cm³).
  Example: 26.5 g raises 50.0 → 60.0 mL → V = 10.0 cm³, ρ = 2.65 g/cm³ (quartz).
- **~textures — BUILD (sort):** bins Igneous, Sedimentary, Metamorphic, each with a `rock` card
  figure. Cards: interlocking coarse crystals (granite); fine crystals with gas holes (basalt);
  glassy with curved fracture (obsidian); rounded sand grains in cement (sandstone); rounded pebbles
  in sand (conglomerate); fossil shells in calcite (limestone); aligned mica flakes, wavy shine
  (schist); light and dark bands (gneiss); interlocking calcite that fizzes, no layers (marble).
  Sentence: "Texture records how a rock formed: cooling, cementing or recrystallizing."
- **~bowen — BUILD (sequence):** stages, hottest first: olivine; pyroxene with calcium plagioclase;
  amphibole; biotite with sodium plagioclase; K-feldspar, muscovite and quartz. Span: cooling
  range in °C (about 1,200 → 700). Sentence: "Minerals that crystallize first are the last to weather."
- **Verdict:** 5 pages (3 calculators, 2 layouts); the five common types Solve, two after P1 and P2.

#### #1 Plate tectonics

| Question type                                            | Page        | Mark          |
| -------------------------------------------------------- | ----------- | ------------- |
| plate speed at a point from the Euler pole and rotation  | main        | Solves (⏳ P3) |
| plate speed from a hotspot track; an island's age        | ~hotspot    | Solves        |
| boundary type of a named feature                         | ~boundaries | Solves        |
| spreading rate from magnetic stripes                     | Refresh `s.12.earth-interior~spreading-rate` | cross-listed |

- **Main — BUILD `…#1`:** speed on a rotating plate. Picture: new `globe` mode `euler` (P3); interim
  `functionGraph` sine (v against Δ, 0–180°). Values: rotation rate ω (°/Myr, 0–5), angular distance
  from the Euler pole Δ (°, 0–180), rotation rate in rad/Myr (derived), speed v (mm/yr, 0–250).
  Relations: ω_rad = ω × π ÷ 180; v = ω_rad × 6,371 km × sin Δ (km/Myr = mm/yr). Assumptions: a
  plate turns as a rigid cap about its Euler pole; speed is greatest 90° from the pole and 0 at it;
  1 km per million years is 1 mm per year. Example: ω = 0.5 °/Myr, Δ = 60° → 0.008727 rad/Myr ×
  6,371 = 55.6 km/Myr × 0.866 = 48.1 mm/yr. startWith ω, Δ. Use: "Use this for 'A plate turns
  0.5° per million years. How fast does a point 60° from its pole move?'"
- **~hotspot — BUILD:** `plot` with `unitRate` (age across, distance along the track up; slope =
  speed). Values: distance along the track d (km, 0–6,000), age t (Ma, 0–80), speed v (mm/yr).
  Relation: v = d ÷ t. Assumptions: the hotspot stays still; each volcano formed over it; km per
  Myr equals mm per year. Example: a seamount 2,400 km from the active volcano is 30 Ma old →
  80 mm/yr; one at 600 km → 7.5 Ma.
- **~boundaries — BUILD (sort):** bins Divergent, Convergent, Transform; `plates` boundary icons on
  the bins when H-cards allow. Cards: Mid-Atlantic Ridge; East African Rift; Iceland's rift valleys;
  Andes volcanoes; Himalaya; Japan Trench; Aleutian Islands; San Andreas Fault; Alpine Fault (New
  Zealand); offsets between ridge segments. Sentence: "Plates move apart, together or past each other."
- **Verdict:** 3 pages; the Euler page waits on P3 for its globe, the interim graph teaches sin Δ.

#### #2 Earthquakes and volcanoes

| Question type                                         | Page       | Mark          |
| ----------------------------------------------------- | ---------- | ------------- |
| moment magnitude from fault size and slip             | main       | Solves (⏳ P5) |
| distance to a quake from the S − P lag                | ~lag       | Solves        |
| yearly rate and 30-year chance from Gutenberg–Richter | ~frequency | Solves        |
| volcano type from magma and shape                     | ~volcanoes | Solves        |

- **Main — BUILD `…#2`:** moment magnitude. Picture: new `earthLayers` mode `rupture` (P5); interim
  `earthLayers` mode `magnitude` (m1 fixed 6.0, m2 = Mw). Values: rigidity μ (GPa, 10–70; default
  30), rupture length L (km, 0.01–1,500), width W (km, 0.01–300), slip D (m, 0.001–60), area A (km²,
  derived), seismic moment M₀ (N·m), moment magnitude Mw (0–9.6). Relations: A = LW; M₀ = μAD (in
  SI); Mw = (2 ÷ 3)(log₁₀ M₀ − 9.1). Assumptions: Mw measures the work of slip on the fault, so it
  doesn't saturate the way local magnitudes do; each whole step is about 32 times the energy; the
  largest quakes recorded are near 9.5. Example: 30 GPa, 100 km × 20 km, 2 m → A = 2 × 10⁹ m²,
  M₀ = 1.2 × 10²⁰ N·m, log₁₀ M₀ = 20.08, Mw = 7.32. startWith L, W, D, μ.
- **~lag — BUILD:** `earthLayers` mode `seismogram` (km, vp, vs, lag). Values: P speed v_P (km/s,
  4–14; default 6.0), S speed v_S (km/s, 2–8; 3.5), lag Δt (s, 0–600), distance d (km). Relation:
  d = Δt × v_P v_S ÷ (v_P − v_S). Assumption: both waves start at the focus together and travel at
  steady speeds (true near the surface; distant stations need travel-time curves). Example: 25 s →
  8.4 km/s × 25 = 210 km. v_S < v_P is a rule ("S waves are always slower").
- **~frequency — BUILD:** `functionGraph` linear (log₁₀ N against M, the point at M). Values: a
  (activity, 0–10), b (0.5–1.5; usually near 1), magnitude M (0–9.6), quakes per year at or above it
  N, recurrence T (years), window t (years), chance P (%). Relations: log₁₀ N = a − bM; T = 1 ÷ N;
  P = 100(1 − e^(−Nt)). Example: a = 5, b = 1, M 6 → N = 0.1, T = 10 yr; in 30 yr P = 95.0 %.
- **~volcanoes — BUILD (explore, `landforms`):** scenes shield (runny basalt, low silica, gentle
  slopes, quiet flows), composite (andesite, layers of lava and ash, explosive), cinder cone
  (loose cinders from one vent, steep, short-lived). Each scene's text names silica and gas.
- **Verdict:** 4 pages; the three numerical types Solve now (main on its interim picture).

#### #3 Surface processes

| Question type                                      | Page      | Mark          |
| -------------------------------------------------- | --------- | ------------- |
| factor of safety of a soil slope                   | main      | Solves (⏳ P4) |
| shear stress under a glacier; thickness for flow   | ~glacier  | Solves (⏳ P4) |
| settling speed and time of silt and clay           | ~settling | Solves        |
| landform → agent (water, ice, wind, gravity)       | ~agents   | Solves        |
| stream discharge Q = Av                            | Refresh `s.12.surface-processes~discharge` | cross-listed |

- **Main — BUILD `…#3`:** an infinite slope. Picture: `freeBody` incline with the new `slab` option
  (P4); interim `freeBody` incline. Values: cohesion c (kPa, 0–100), unit weight γ (kN/m³, 10–25),
  depth to the slip surface z (m, 0.1–50), slope θ (°, 1–70), friction angle φ (°, 10–50), normal
  stress σ, driving shear τ, strength s (kPa), factor of safety FS. Relations: σ = γz cos²θ;
  τ = γz sin θ cos θ; s = c + σ tan φ; FS = s ÷ τ. Assumptions: the slab is long next to its
  depth; the soil is dry (water would cut σ); FS below 1 means it slides. Example: c 5, γ 20,
  z 2 m, 30°, φ 35° → σ = 30 kPa, τ = 17.3 kPa, s = 26.0 kPa, FS = 1.50. startWith θ, z, c, φ, γ.
- **~glacier — BUILD (⏳ P4, `material: 'ice'`):** values ice density ρ (kg/m³, 917), thickness H
  (m, 1–4,000), surface slope α (°, 0.1–30), basal shear τ_b (kPa). Relation: τ_b = ρgH sin α.
  Assumptions: ice flows when τ_b nears about 100 kPa; the slope is the ice surface's, not the
  bed's. Example: 300 m on 3° → 141 kPa; for 100 kPa on 2°, H = 319 m.
- **~settling — BUILD:** `functionGraph` power (w against d, p/q = 2). Values: grain diameter d (mm,
  0.0005–0.1), grain density ρ_s (kg/m³, 2,650), water viscosity μ (mPa·s, 1.0), settling speed w
  (mm/s), time to sink 1 m t (h). Relations: w = (ρ_s − 1,000) g d² ÷ (18μ); t = 1 m ÷ w.
  Assumptions: Stokes' law holds for grains finer than about 0.1 mm; still water. Example: silt
  0.02 mm → 0.360 mm/s, 1 m in 46 min; clay 0.002 mm → 1 m in 3.2 days.
- **~agents — BUILD (sort, `pickBar`):** bins Running water, Glaciers, Wind, Gravity (mass wasting).
  Cards: oxbow lake; delta; alluvial fan; cirque; arête; moraine; drumlin; esker; barchan dune;
  loess; desert pavement; talus slope; slump scar; debris-flow lobe.
- **Verdict:** 4 pages; the four types Solve, the slope pages fully after P4.

### Historical Geology — `he.earth-science.historical-geology`

- **Prerequisite:** Physical Geology. **Refresh:** `s.12.radiometric-dating` (and its `~relative-order`,
  `~bracket`, `~potassium`), `s.12.earth-history`.
- **Textbooks:** OpenGeology Historical Geology (stratigraphy, geologic time, fossils, Earth history
  by eon); Earle ch. 8 (measuring geologic time).

#### #0 Stratigraphy

| Question type                                             | Page             | Mark           |
| --------------------------------------------------------- | ---------------- | -------------- |
| order the events in a cross-section                       | main             | Solves (⏳ P6b) |
| deposition rate between two dated beds; a layer's age     | ~deposition-rate | Solves         |
| which principle dates this relation                       | ~principles      | Solves         |
| name the unconformity                                     | ~unconformities  | Solves         |

- **Main — BUILD `…#0` (sequence, ⏳ P6b for the cross-section above the stages):** a cross-section
  of three tilted beds, an angular unconformity, two flat beds and a dike through all of them.
  Stages, oldest first: sandstone, shale, then limestone laid down flat; the three beds tilted;
  erosion planes them off; conglomerate then siltstone laid down; a basalt dike cuts every layer;
  erosion shapes today's surface. One order only (the dike cuts the youngest bed). Until P6b, the
  stage text names each bed and the sentence states the cross-section; the page reads but teaches
  less. Sentence: "Read a cross-section from the bottom up, then place what cuts across."
- **~deposition-rate — BUILD:** `rockLayers` `dating` with `bracket` (an ash bed at the top, a
  lava flow at the base, the bracketed layer between). Values: age of the top bed (Ma), age of the
  base bed (Ma), thickness between H (m, 0.1–5,000), rate r (m/Myr), height of a layer above the base
  h (m), its age (Ma). Relations: r = H ÷ (base age − top age); layer age = base age − h ÷ r.
  Assumptions: steady deposition and no gaps (an unconformity breaks this); compaction ignored.
  Example: 252.0 and 254.5 Ma, 50 m → 20 m/Myr; a fossil bed 30 m up is 253.0 Ma. The base must be
  older than the top (a rule: "lower beds are older").
- **~principles — BUILD (sort):** bins Superposition, Original horizontality, Cross-cutting
  relationships, Inclusions, Faunal succession. Cards: a fault breaks three beds; pebbles of granite
  sit in a sandstone; trilobites below, ammonites above everywhere; folded beds were once flat; the
  lowest undisturbed bed is oldest; a dike cuts a sill; a lava flow carries pieces of the bed below.
- **~unconformities — BUILD (sort):** bins Angular unconformity, Disconformity, Nonconformity.
  Cards: flat beds over tilted beds; sandstone over eroded granite; two parallel beds with a buried
  river channel between them; flat limestone over folded shale; a soil horizon between parallel
  beds with a 20-Myr gap in fossils; sediment on top of eroded schist.
- **Verdict:** 4 pages (1 calculator, 3 layouts); the main needs its cross-section figure (P6b).

#### #1 Radiometric dating

| Question type                                    | Page           | Mark   |
| ------------------------------------------------ | -------------- | ------ |
| age from the daughter-to-parent ratio            | main           | Solves |
| age from an isochron's slope                     | ~isochron      | Solves |
| K–Ar age with the branching decay                | ~potassium-argon | Solves |
| radiocarbon age from activity                    | ~radiocarbon   | Solves |

- **Main — BUILD `…#1`:** `decayChart` (halfLife, time, start 100, left; parent "U-238", daughter
  "Pb-206"). Values: half-life t½ (Ma, 0.001–50,000), decay constant λ (per Myr), daughter-to-parent
  ratio D/P (0–100), age t (Ma, 0–4,600), parent left (%). Relations: λ = ln 2 ÷ t½;
  t = ln(1 + D/P) ÷ λ; left = 100 ÷ (1 + D/P). Assumptions: the mineral held no daughter when it
  formed and lost none since (a closed system); the half-life is fixed. Example: U-238, D/P = 0.5 →
  λ = 1.551 × 10⁻⁴ per Myr, t = 0.4055 ÷ λ = 2,614 Ma, 66.7 % left. startWith t½, D/P.
- **~isochron — BUILD:** `functionGraph` linear (⁸⁷Sr/⁸⁶Sr against ⁸⁷Rb/⁸⁶Sr, the sample's point and
  the intercept). Values: slope m, decay constant λ (1.42 × 10⁻¹¹ per year), initial ratio (0.700–
  0.720), a sample's ⁸⁷Rb/⁸⁶Sr x (0–50) and ⁸⁷Sr/⁸⁶Sr y, age t (Ma). Relations: m = e^(λt) − 1;
  y = initial + m x. Assumptions: the samples formed together with one initial ratio; the slope
  grows with age, so no starting daughter needs guessing. Example: m = 0.0145 → t = ln 1.0145 ÷ λ =
  1,014 Ma; with initial 0.7045, x = 2.0 → y = 0.7335.
- **~potassium-argon — BUILD:** `rockLayers` `dating.sample` with `second: { name: 'calcium-40',
  share: 89.5 }`. Values: Ar/K ratio (0–10), age t (Ma), K-40 left (%). Relation: t = (1 ÷ λ) ×
  ln(1 + (Ar/K) ÷ 0.105). Assumptions: argon is a gas, so heating resets the clock; 10.5 % of
  decays give argon-40. Example: Ar/K = 0.01 → ln 1.0952 = 0.0910 → 164 Ma.
- **~radiocarbon — BUILD:** `decayChart` (parent "C-14", daughter "N-14"). Values: activity A
  (decays per minute per gram, 0.01–13.6), modern activity A₀ (13.6), fraction left F, age t (yr,
  0–50,000). Relations: F = A ÷ A₀; t = 5,730 × log₂(1 ÷ F). Assumptions: only for once-living
  carbon younger than about 50,000 years; the air's C-14 is taken as steady (labs calibrate it).
  Example: 3.4 → F = 0.25 → two half-lives, 11,460 yr.
- **Verdict:** 4 calculators; every type Solves with drawn pictures.

#### #2 The fossil record

| Question type                                   | Page           | Mark          |
| ----------------------------------------------- | -------------- | ------------- |
| age window from two index fossils' ranges       | main           | Solves (⏳ P6) |
| body fossil or trace fossil                     | ~preservation  | Solves        |

- **Main — BUILD `…#2` (⏳ P6, `rockLayers` `ranges`; interim `table`):** values: fossil A first
  appears (Ma) and last appears (Ma), fossil B the same, oldest possible age (derived: the younger of
  the two first appearances), youngest possible age (derived: the older of the two last
  appearances), window (Myr). Relations: oldest = min(A first, B first); youngest = max(A last,
  B last); window = oldest − youngest (one way only, `derived: true`). Assumptions: a bed holding
  both fossils formed while both lived; ranges come from dated sections elsewhere. Example: A
  420–380 Ma, B 400–360 Ma → 400 to 380 Ma, a 20-Myr window. Ranges that don't overlap are rejected:
  "These fossils never lived at the same time."
- **~preservation — BUILD (sort):** bins Body fossil, Trace fossil. Cards: ammonite shell;
  petrified wood; insect in amber; mammoth frozen in permafrost; fern carbon film; dinosaur
  footprints; worm burrows; coprolite; gastroliths; a shell's mold in sandstone.
- **Verdict:** 2 pages; the window needs a min/max relation solved one way (E6) and P6.

#### #3 Earth history

| Question type                                       | Page        | Mark   |
| --------------------------------------------------- | ----------- | ------ |
| order the eons and eras, with their lengths         | main        | Solves |
| which eon an event belongs to                       | ~events     | Solves |
| the faint young Sun: how cold without more CO₂      | ~faint-sun  | Solves |

- **Main — BUILD `…#3` (sequence, spans in Myr, sum "Earth's history"):** Hadean 600; Archean
  1,500; Proterozoic 1,961; Paleozoic 287; Mesozoic 186; Cenozoic 66 (sum 4,600). Sentence: "The
  Phanerozoic's three eras fill only the last 539 million years."
- **~events — BUILD (sort):** bins Archean, Proterozoic, Phanerozoic. Cards: oldest stromatolites;
  first continents' cratons; the Great Oxidation Event; first eukaryotes; snowball Earth glaciations;
  Cambrian explosion; first land plants; Pangaea assembles; the end-Permian extinction; dinosaurs
  die out.
- **~faint-sun — BUILD:** `atmosphereLayers` mode `balance` (albedo, sunlight, absorbed,
  temperature). Values: time ago (Ga, 0–4.5), Sun's brightness then L (fraction of today's), sunlight
  S (W/m²), albedo α (0–1), absorbed F, balance temperature Tₑ (K). Relations: L = 1 ÷ (1 + 0.4(1 −
  (4.57 − ago) ÷ 4.57)); S = 1,361L; F = S(1 − α) ÷ 4; Tₑ = (F ÷ σ)^(1/4). Assumptions: the Sun
  brightened about 30 % since it formed; no greenhouse effect in Tₑ; albedo kept at today's. Example:
  4.0 Ga → L = 0.741, S = 1,008, F = 176 W/m², Tₑ = 236 K, 18 K below today's 255 K.
- **Verdict:** 3 pages (1 calculator, 2 layouts); every type Solves.

### Mineralogy — `he.earth-science.mineralogy`

- **Prerequisites:** Physical Geology, General Chemistry I. **Refresh:** `s.12.minerals-rocks`
  (and `~density`, `~mineral-groups`), the chemistry mole pages (`moleMap`).
- **Textbooks:** Perkins, Mineralogy (OpenGeology: crystal chemistry, crystallography, X-ray
  diffraction, optical mineralogy, mineral groups).

#### #0 Crystallography

| Question type                                           | Page             | Mark          |
| ------------------------------------------------------- | ---------------- | ------------- |
| d-spacing from a diffraction angle (Bragg)              | main             | Solves (⏳ P7) |
| d-spacing of a cubic plane (hkl); its 2θ peak           | ~cubic-d         | Solves (⏳ P8) |
| density of a mineral from its unit cell                 | ~cell-density    | Solves (⏳ P8) |
| crystal system from axes and angles                     | ~crystal-systems | Solves        |

- **Main — BUILD `…#0`:** Bragg's law. Picture: `rayDiagram` mode `bragg` (P7); interim `table`
  (2θ = 20°, 30°, 40°, 50° → d). Values: order n (whole, 1–4), X-ray wavelength λ (Å, 0.5–3;
  copper Kα 1.5406), detector angle 2θ (°, 2–170), Bragg angle θ (derived), spacing d (Å).
  Relations: θ = 2θ ÷ 2; nλ = 2d sin θ. Assumptions: diffractometers report 2θ, the angle between
  the beam in and out; a peak needs the path difference 2d sin θ to be a whole number of
  wavelengths. Example: Cu Kα, 2θ = 26.64° → θ = 13.32°, sin θ = 0.2304, d = 3.343 Å (quartz's
  strongest peak). startWith 2θ, λ, n.
- **~cubic-d — BUILD (⏳ P8):** values cell edge a (Å, 2–30), Miller indices h, k, l (whole, 0–6,
  not all 0), spacing d (Å), λ, 2θ. Relations: d = a ÷ √(h² + k² + l²); λ = 2d sin(2θ ÷ 2).
  Assumption: cubic cells only (other systems have their own d formulas). Example: halite a =
  5.640 Å, (200) → d = 2.820 Å, sin θ = 0.2732, 2θ = 31.70°. Interim `table` of (100) … (222).
- **~cell-density — BUILD (⏳ P8):** values formula units per cell Z (whole, 1–16), molar mass M
  (g/mol), cell edge a (Å), cell volume V (Å³), density ρ (g/cm³). Relations: V = a³; ρ = ZM ÷
  (6.022 × 10²³ × V × 10⁻²⁴). Example: halite Z = 4, 58.44 g/mol, 5.640 Å → V = 179.4 Å³,
  ρ = 233.8 ÷ 108.0 = 2.164 g/cm³.
- **~crystal-systems — BUILD (sort, `pickBar`):** bins Cubic, Tetragonal, Orthorhombic, Hexagonal,
  Trigonal, Monoclinic, Triclinic. Cards (axes and one mineral each): a = b = c, all 90° (halite);
  a = b ≠ c, all 90° (zircon); a ≠ b ≠ c, all 90° (olivine); a 6-fold axis (beryl); a 3-fold axis
  (quartz); one angle not 90° (orthoclase); no angle 90° (plagioclase). `intro` gives the rule.
- **Verdict:** 4 pages; the three calculators ship on `table` interims.

#### #1 Mineral chemistry

| Question type                                         | Page             | Mark          |
| ----------------------------------------------------- | ---------------- | ------------- |
| formula from an oxide analysis; forsterite content    | main             | Solves        |
| plagioclase An content; coupled substitution balance  | ~plagioclase     | Solves (⏳ P1) |
| mineral class from a formula                          | ~mineral-classes | Solves        |

- **Main — BUILD `…#1`:** `table` (oxide, wt %, moles, oxygens, cations per 4 O). Values: SiO₂,
  MgO, FeO (wt %, 0–100, sum ≤ 100), oxygen moles (derived), normalizing factor (derived), Si, Mg, Fe
  (cations per 4 oxygens), forsterite Fo (%). Relations: moles = wt ÷ molar mass (60.08, 40.30,
  71.84); O = 2 × SiO₂ + MgO + FeO moles; factor = 4 ÷ O; each cation = its moles × factor;
  Fo = 100Mg ÷ (Mg + Fe). Assumptions: olivine has 4 oxygens per formula; all iron is Fe²⁺; Mg and Fe
  share one site, so Mg + Fe should come to about 2. Example: 40.0, 49.0, 11.0 wt % → 0.666, 1.216,
  0.153 mol; O = 2.701; factor 1.481; Si 0.99, Mg 1.80, Fe 0.23 → Fo 88.8 (Fo₈₉). startWith the oxides.
- **~plagioclase — BUILD (⏳ P1, `ternary` `fields: 'feldspar'`; interim `percentBar`):** values Ca
  and Na per 8 oxygens (0–1, Ca + Na = 1), anorthite An (%), Al, Si (per 8 O), cation charge (16).
  Relations: An = 100Ca ÷ (Ca + Na); Al = 1 + Ca; Si = 3 − Ca; charge = Na + 2Ca + 3Al + 4Si.
  Assumption: Ca²⁺ for Na⁺ is paid for by Al³⁺ for Si⁴⁺ (coupled substitution). Example: Ca 0.6 →
  An₆₀ (labradorite), Al 1.6, Si 2.4, charge 0.4 + 1.2 + 4.8 + 9.6 = 16.
- **~mineral-classes — BUILD (sort):** bins Silicates, Carbonates, Oxides, Sulfides, Sulfates,
  Halides, Native elements. Cards (formula and name): KAlSi₃O₈ orthoclase; Mg₂SiO₄ forsterite; CaCO₃
  calcite; Fe₂O₃ hematite; FeS₂ pyrite; CaSO₄·2H₂O gypsum; NaCl halite; CaF₂ fluorite; Au gold; C
  graphite.
- **Verdict:** 3 pages; every type Solves (the feldspar triangle after P1).

#### #2 Optical mineralogy

| Question type                                         | Page        | Mark          |
| ----------------------------------------------------- | ----------- | ------------- |
| retardation and interference color from δ and t       | main        | Solves (⏳ P9) |
| birefringence from a color and a thickness            | main        | Solves (⏳ P9) |
| relief from refractive index                          | ~relief     | Solves        |
| isotropic or anisotropic under crossed polars         | ~isotropic  | Solves        |

- **Main — BUILD `…#2`:** retardation. Picture: new `michelLevy` (P9); interim `bars` (Γ against
  the 550, 1,100, 1,650 nm order lines). Values: thickness t (μm, 1–100; a standard section is 30),
  birefringence δ (0.001–0.30), retardation Γ (nm), order (derived, `floor(Γ ÷ 550) + 1`). Relation:
  Γ = 1,000 tδ. Assumptions: δ is n_high − n_low for the grain as cut, so grains of one mineral show
  colors up to the maximum; each order spans about 550 nm. Example: quartz δ = 0.009 in 30 μm →
  Γ = 270 nm, first-order white; olivine δ = 0.035 → 1,050 nm, second order. startWith δ, t.
- **~relief — BUILD (sort):** bins Low relief (n within 0.04 of 1.54), Moderate (0.04–0.12 away),
  High (more than 0.12 away); the rule is the `intro`. Cards with n: quartz 1.55; orthoclase 1.52;
  muscovite 1.60; fluorite 1.43; hornblende 1.65; augite 1.70; garnet 1.77; zircon 1.95.
- **~isotropic — BUILD (sort):** bins Isotropic (dark in every turn), Anisotropic. Cards: garnet;
  halite; fluorite; volcanic glass; quartz; calcite; biotite; olivine. Sentence: "Cubic minerals and
  glass have one refractive index, so crossed polars stay dark."
- **Verdict:** 3 pages; the main ships on its `bars` interim and gains the chart with P9.

### Meteorology — `he.earth-science.meteorology`

- **Prerequisites:** `s.12.climate-systems`, Calculus I. **Refresh:** `s.12.atmosphere-weather`
  (and `~pressure`, `~humidity`, `~cloud-base`, `~air-masses`).
- **Textbooks:** Stull, Practical Meteorology (ch. 1 atmosphere basics, 3 thermodynamics, 4–5
  moisture and stability, 6–8 clouds and precipitation, 10 dynamics, 12 fronts, 20 forecasting).

#### #0 Atmospheric structure

| Question type                                         | Page               | Mark           |
| ----------------------------------------------------- | ------------------ | -------------- |
| thickness between two pressure levels                 | main               | Solves (⏳ P10) |
| pressure at an altitude; altitude of a pressure       | ~pressure-altitude | Solves         |
| layer of the atmosphere from a feature                | ~layers            | Solves         |

- **Main — BUILD `…#0`:** the hypsometric equation. Picture: `atmosphereLayers` mode `thickness`
  (P10); interim `functionGraph` exponential (p against z). Values: lower pressure p₁ (hPa, 100–
  1,050), upper p₂ (hPa, 1–1,050, below p₁), mean temperature T̄ (K, 180–320), scale height H (m),
  thickness Δz (m). Relations: H = R_d T̄ ÷ g; Δz = H ln(p₁ ÷ p₂). Assumptions: dry air in
  hydrostatic balance; T̄ is the layer's mean, so warm layers are thicker (why the 500 hPa height
  maps temperature). Example: 1,000 → 500 hPa, 255 K → H = 7,460 m, Δz = 7,460 × 0.693 = 5,171 m.
  startWith p₁, p₂, T̄.
- **~pressure-altitude — BUILD:** `functionGraph` exponential with the point. Values: sea-level
  pressure p₀ (hPa, 950–1,050), altitude z (km, 0–50), scale height H (km, 6–9; default 8.0), pressure
  p (hPa). Relation: p = p₀e^(−z/H). Example: 1,013.25 hPa, 1.6 km → e^(−0.2) = 0.8187, p = 830 hPa.
- **~layers — BUILD (sort):** bins Troposphere, Stratosphere, Mesosphere, Thermosphere (the `profile`
  picture's bands as bin figures when allowed). Cards: most clouds and weather; cools about 6.5 °C per
  km; the ozone layer peaks; warms with height as ozone absorbs ultraviolet; meteors burn up; the
  coldest air, near −90 °C; auroras glow; the International Space Station orbits.
- **Verdict:** 3 pages; every type Solves.

#### #1 Atmospheric thermodynamics

| Question type                                          | Page       | Mark           |
| ------------------------------------------------------ | ---------- | -------------- |
| potential temperature of a parcel                      | main       | Solves (⏳ P11) |
| lifting condensation level; temperature at cloud base  | ~lcl       | Solves (⏳ P12) |
| saturation vapor pressure, RH and mixing ratio         | ~humidity  | Solves (⏳ P11) |
| stable, conditionally unstable or unstable air         | ~stability | Solves         |

- **Main — BUILD `…#1`:** potential temperature. Picture: `atmosphereLayers` mode `adiabat` (P11);
  interim `functionGraph` power (θ against p). Values: temperature T (K, 180–330), pressure p (hPa,
  10–1,050), exponent κ (0.286, fixed), potential temperature θ (K). Relation: θ = T(1,000 ÷ p)^κ.
  Assumptions: θ is the temperature the air would have brought dry and adiabatically to 1,000 hPa;
  it stays the same for a parcel rising or sinking without heat or condensation. Example: 263.15 K at
  700 hPa → 1.4286^0.286 = 1.1074, θ = 291.4 K. startWith T, p.
- **~lcl — BUILD:** `atmosphereLayers` mode `parcel` (temperature, dewPoint, base), with the `dry`
  and `dewLapse` options of P12 (until then the picture's 10 and 2 °C/km give the same base).
  Values: temperature T and dew point T_d at the ground (°C), spread (°C), cloud base z_LCL (m),
  temperature at the base (°C). Relations: z_LCL = 125 m × (T − T_d); T_base = T − 9.8 × z_LCL ÷ 1,000.
  Example: 30 °C, 14 °C → 2,000 m, 10.4 °C. T_d ≤ T is a rule.
- **~humidity — BUILD (⏳ P11 `saturation`; interim `functionGraph` exponential):** values T (°C,
  −40–50), dew point T_d (°C), saturation vapor pressure e_s and vapor pressure e (hPa), relative
  humidity RH (%), pressure p (hPa), mixing ratio r (g/kg). Relations: e_s = 6.112e^(17.67T ÷ (T +
  243.5)); e = the same at T_d; RH = 100e ÷ e_s; r = 622e ÷ (p − e). Example: 25 °C, T_d 15 °C →
  e_s = 31.7, e = 17.0 hPa, RH = 53.8 %; at 1,000 hPa r = 10.8 g/kg.
- **~stability — BUILD (sort):** bins Absolutely stable, Conditionally unstable, Absolutely
  unstable; `intro`: "Compare the air's lapse rate with 9.8 °C/km (dry) and about 6 °C/km (saturated)."
  Cards: cools 4 °C per km; an inversion, warming 2 °C per km; cools 7.5 °C per km; cools 8 °C per km;
  cools 11 °C per km over hot desert ground; cools 13 °C per km in the lowest 100 m on a sunny day.
- **Verdict:** 4 pages; the three calculators ship on interims and gain P11 and P12.

#### #2 Clouds and precipitation

| Question type                                         | Page         | Mark   |
| ----------------------------------------------------- | ------------ | ------ |
| how many cloud droplets make one raindrop             | main         | Solves |
| a droplet's fall speed and time to fall 1 km          | main         | Solves |
| rain rate from radar reflectivity (Z–R)               | ~radar       | Solves |
| cloud genus from height and form                      | ~cloud-types | Solves |
| the ice-crystal (Bergeron) process in order           | ~bergeron    | Solves |

- **Main — BUILD `…#2`:** `powerScale` with `second` (the droplet's and the drop's radii on one 10ⁿ
  ruler). Values: droplet radius r (μm, 1–50), raindrop radius R (mm, 0.1–3), droplets per drop N,
  droplet fall speed v (cm/s), time to fall 1 km t (h). Relations: N = (1,000R ÷ r)³;
  v = 1.19 × 10⁶ × (r × 10⁻⁴)² (Stokes, r in cm); t = 100,000 ÷ v ÷ 3,600. Assumptions: Stokes' law
  for droplets under about 40 μm; still air (updrafts hold droplets up). Example: 10 μm and 1 mm →
  N = 100³ = 1,000,000; v = 1.19 cm/s; t = 23 h, so cloud droplets alone never reach the ground.
  startWith r, R.
- **~radar — BUILD:** `functionGraph` exponential (rain rate against dBZ). Values: rain rate R
  (mm/h, 0.1–300), reflectivity Z (mm⁶/m³), dBZ (−10–75). Relations: Z = 200R^1.6; dBZ = 10 log₁₀ Z.
  Assumptions: the Marshall–Palmer relation for steady rain; hail makes Z too large for its rain.
  Example: 10 mm/h → Z = 7,962, 39.0 dBZ; 50 dBZ → 48.6 mm/h.
- **~cloud-types — BUILD (sort, `pickBar`):** bins High, Middle, Low, Vertical growth. Cards:
  cirrus; cirrostratus with a halo; cirrocumulus; altostratus; altocumulus; stratus; stratocumulus;
  nimbostratus; cumulus; cumulonimbus.
- **~bergeron — BUILD (sequence):** supercooled droplets and a few ice crystals share a cloud below
  0 °C; the air is saturated for ice before water, so droplets evaporate; ice crystals grow on the
  vapor; big crystals fall and collect droplets (riming) and each other; they melt to rain in warm air
  below, or fall as snow.
- **Verdict:** 4 pages; every type Solves.

#### #3 Weather systems and forecasting

| Question type                                          | Page           | Mark   |
| ------------------------------------------------------ | -------------- | ------ |
| geostrophic wind from isobar spacing                   | main           | Solves |
| Coriolis parameter at a latitude                       | main           | Solves |
| tornado wind from its pressure drop; is Coriolis small | ~cyclostrophic | Solves |
| front type from the weather as it passes               | ~fronts        | Solves |

- **Main — BUILD `…#3`:** `atmosphereLayers` mode `pressure` (high, low, distance, hemisphere).
  Values: high and low pressures (hPa, 870–1,085), distance between centres Δn (km, 50–5,000),
  pressure difference Δp (hPa), latitude φ (°, 5–90 either side; `hemisphere` from its sign),
  Coriolis parameter f (s⁻¹), air density ρ (kg/m³, 0.4–1.4; 1.2), geostrophic wind V_g (m/s).
  Relations: Δp = high − low; f = 2Ω sin|φ|; V_g = Δp ÷ (ρfΔn) (in Pa and m). Assumptions: straight
  isobars, no friction (above about 1 km); the wind blows along the isobars, low pressure on its left
  in the north; near the equator f → 0 and the balance fails (hence the 5° limit). Example: 1,020 and
  1,004 hPa, 800 km, 45° N, 1.2 kg/m³ → f = 1.031 × 10⁻⁴ s⁻¹, V_g = 1,600 ÷ 99.0 = 16.2 m/s.
  startWith high, low, Δn, φ.
- **~cyclostrophic — BUILD:** `functionGraph` power (V against Δp, p/q = 1/2). Values: pressure drop
  Δp (hPa, 1–100), ρ, wind speed V (m/s), radius r (m, 10–5,000), latitude φ, f, Rossby number Ro.
  Relations: V = √(Δp ÷ ρ); f = 2Ω sin φ; Ro = V ÷ (fr). Example: 50 hPa → 64.5 m/s; r = 200 m at 35° N
  → Ro = 3,860, so the Coriolis force is negligible and tornadoes spin either way.
- **~fronts — BUILD (sort):** bins Cold front, Warm front, Occluded front, Stationary front. Cards:
  temperature drops sharply, wind veers, a narrow line of thunderstorms; hours of steady rain from
  nimbostratus, then warmer; cirrus thickening to altostratus a day ahead; the front hardly moves for
  days; a cold front overtakes a warm front, warm air lifted aloft.
- **Verdict:** 3 pages; every type Solves.

### Oceanography — `he.earth-science.oceanography`

- **Prerequisite:** `s.12.ocean-atmosphere`. **Refresh:** `s.12.ocean-atmosphere` (and `~tides`,
  `~currents`, `~density`), `s.12.earth-interior~spreading-rate`.
- **Textbooks:** Webb, Introduction to Oceanography (ch. 4 ocean basins, 5 seawater, 9 circulation,
  10 waves, 11 tides).

#### #0 Ocean basins

| Question type                                     | Page        | Mark   |
| ------------------------------------------------- | ----------- | ------ |
| depth from an echo sounder's two-way time         | main        | Solves |
| seafloor depth from crust age (ridge subsidence)  | ~age-depth  | Solves |
| active or passive margin                          | ~margins    | Solves |

- **Main — BUILD `…#0`:** `oceanProfile` mode `profile` (depth, over). Values: two-way time t (s,
  0–15), sound speed v (m/s, 1,450–1,550; default 1,500), depth d (m, 0–11,000), the part of the floor
  (picture only). Relation: d = vt ÷ 2. Assumptions: the ping goes down and back, so half the time
  is one way; sound speed changes with temperature and pressure by a few percent. Example: 6.4 s →
  4,800 m, the abyssal plain; 1.0 s → 750 m, the continental slope. startWith t, v.
- **~age-depth — BUILD:** `functionGraph` power (d against t, p/q = 1/2, k = 2,500; `invertY` of P19
  when drawn). Values: distance from the ridge x (km, 0–4,000), half spreading rate u (mm/yr, 5–100),
  age t (Myr, 0–80), depth d (m). Relations: t = x ÷ u; d = 2,500 + 350√t. Assumptions: the plate
  cools and shrinks as it ages; the square-root fit holds to about 80 Myr, after which the floor
  flattens near 5,500–6,000 m. Example: 1,225 km at 25 mm/yr → 49 Myr → 2,500 + 350 × 7 = 4,950 m.
- **~margins — BUILD (sort):** bins Active margin, Passive margin. Cards: deep trench just offshore;
  volcanic mountains on the coast; frequent large earthquakes; wide continental shelf; thick wedge of
  sediment with no plate boundary nearby; the US Atlantic coast; the west coast of South America.
- **Verdict:** 3 pages; every type Solves.

#### #1 Seawater chemistry

| Question type                                      | Page        | Mark           |
| -------------------------------------------------- | ----------- | -------------- |
| density of seawater from temperature and salinity  | main        | Solves (⏳ P15) |
| freezing point of seawater                         | main        | Solves (⏳ P15) |
| salinity from chlorinity; one ion's mass in a kg   | ~salinity   | Solves         |
| residence time of a dissolved element              | ~residence  | Solves         |

- **Main — BUILD `…#1`:** a linear equation of state. Picture: new `tsDiagram` (P15); interim `table`
  (T = 0, 5, 10, 15, 20 °C at the page's S). Values: temperature T (°C, −2–35), salinity S (g/kg,
  0–42), density ρ (kg/m³), freezing point T_f (°C). Relations: ρ = 1,027(1 − 1.7 × 10⁻⁴(T − 10) +
  7.6 × 10⁻⁴(S − 35)); T_f = −0.054S. Assumptions: a straight-line fit near 10 °C and 35 g/kg (cold
  water's density changes less with T); pressure ignored (surface water); colder or saltier water
  sinks. Example: 2 °C, 34.7 → 1,027 × 1.00113 = 1,028.2 kg/m³; T_f = −1.87 °C. startWith T, S.
  T ≥ T_f is a rule ("below its freezing point seawater is ice").
- **~salinity — BUILD:** `pieChart` of the major ions' shares (chloride 55.0, sodium 30.6, sulfate
  7.7, magnesium 3.7, calcium 1.2, potassium 1.1, others 0.7 %). Values: chlorinity Cl (g/kg),
  salinity S (g/kg), an ion's share (%, allowed the seven), its mass (g/kg). Relations: S = 1.80655Cl;
  mass = S × share ÷ 100. Assumption: the ions keep fixed proportions everywhere (Forchhammer's
  principle). Example: Cl = 19.37 → S = 35.0; sodium → 10.7 g/kg.
- **~residence — BUILD:** `reserve` (reserve, rate, years: the ocean's store cut into each year's
  supply). Values: amount in the ocean M (kg), yearly input F (kg/yr), residence time τ (yr).
  Relation: τ = M ÷ F. Assumption: steady state: what rivers add, sediments remove. Example:
  6.0 × 10¹⁸ kg, 1.5 × 10¹¹ kg/yr → 4.0 × 10⁷ yr.
- **Verdict:** 3 pages; every type Solves.

#### #2 Currents and circulation

| Question type                                         | Page        | Mark           |
| ----------------------------------------------------- | ----------- | -------------- |
| geostrophic current from the sea-surface slope        | main        | Solves (⏳ P14) |
| Ekman transport and coastal upwelling                 | ~ekman      | Solves         |
| volume transport of a current in sverdrups            | ~transport  | Solves (⏳ E1)  |
| gyres, western intensification, the conveyor          | ~gyres      | Solves         |

- **Main — BUILD `…#2`:** `oceanProfile` mode `slope` (P14); interim `vectorDiagram` (the
  pressure-gradient and Coriolis arrows, equal and opposite). Values: sea-surface rise Δη (m, 0–3),
  across Δx (km, 10–1,000), latitude φ (°, 5–90), f (s⁻¹), current speed v (m/s). Relations:
  f = 2Ω sin φ; v = (g ÷ f) Δη ÷ Δx. Assumptions: steady flow, no friction, below the wind-driven
  top layer; the water flows along the slope with high sea level on its right in the north.
  Example: 1 m over 100 km at 35° N → f = 8.37 × 10⁻⁵ s⁻¹, v = 1.17 m/s (a Gulf Stream speed).
  startWith Δη, Δx, φ.
- **~ekman — BUILD:** `vectorDiagram` (wind stress and the Ekman transport 90° to its right).
  Values: wind speed U (m/s, 0–40), air density 1.2, drag coefficient 1.3 × 10⁻³, wind stress τ
  (N/m²), latitude φ, f, transport per metre of coast M (kg/(m·s)), coast length (km), upwelling
  (Sv). Relations: τ = ρ_air C_d U²; M = τ ÷ f; upwelling = M ÷ 1,025 × length ÷ 10⁶. Example:
  10 m/s at 40° → τ = 0.156 N/m², M = 1,664 kg/(m·s), along 1,000 km 1.62 Sv.
- **~transport — BUILD (⏳ E1 for Sv):** `streamChannel` (width, depth, speed, area, discharge).
  Values: width (km), depth (m), mean speed (m/s), area (m²), transport (m³/s and Sv). Relation:
  Q = width × depth × speed; 1 Sv = 10⁶ m³/s. Example: 80 km × 400 m at 1.2 m/s → 3.84 × 10⁷ m³/s =
  38.4 Sv, about 180 times the Amazon's flow (0.21 Sv).
- **~gyres — BUILD (explore, `oceanCurrents`):** scenes `gyres` (five subtropical gyres, clockwise in
  the north); western boundary currents narrow and fast (the Gulf Stream, Kuroshio); `conveyor`
  (sinking in the North Atlantic, the slow deep return).
- **Verdict:** 4 pages; three calculators ship now (main on its interim), the gyres explore too.

#### #3 Waves and tides

| Question type                                          | Page          | Mark           |
| ------------------------------------------------------ | ------------- | -------------- |
| deep-water wavelength and speed from the period        | main          | Solves         |
| tsunami speed and crossing time                        | ~tsunami      | Solves (⏳ P16) |
| wave energy and power per metre of crest               | ~wave-energy  | Solves         |
| why spring tides; the Sun's share of the tide          | ~tides        | Solves         |

- **Main — BUILD `…#3`:** `wave` (wavelength, amplitude), with P16's `depth` when drawn. Values:
  period T (s, 1–25), wavelength L (m), speed c (m/s), water depth d (m), depth ÷ wavelength
  (derived). Relations: L = gT² ÷ 2π; c = L ÷ T. Assumptions: deep water means d > L ÷ 2, where the
  floor doesn't touch the wave's orbits; storm swell sorts itself by period. Example: 10 s → L =
  156 m, c = 15.6 m/s; deep where d > 78 m. startWith T, d. The page says "shallow-water rules
  apply" when d < L ÷ 2 (caption) rather than giving a deep-water answer there.
- **~tsunami — BUILD (⏳ P16):** values depth d (m, 1–8,000), speed c (m/s, km/h), distance (km),
  travel time (h). Relations: c = √(gd); time = distance ÷ c. Assumption: shallow-water wave, since a
  tsunami's wavelength (hundreds of km) is far longer than the ocean is deep. Example: 4,000 m →
  198 m/s = 713 km/h; 3,000 km in 4.2 h.
- **~wave-energy — BUILD:** `wave` (amplitude = H ÷ 2). Values: wave height H (m, 0–20), period T,
  energy E (J/m²), group speed c_g (m/s), power P (kW per m of crest). Relations: E = ρgH² ÷ 8;
  c_g = gT ÷ 4π; P = Ec_g. Example: 2 m, 10 s → E = 5,028 J/m², c_g = 7.81 m/s, P = 39.2 kW/m.
- **~tides — BUILD:** `oceanProfile` mode `tides` (angle, range). Values: Moon's and Sun's masses
  (kg) and distances (m), Sun's tide ÷ Moon's tide, spring ÷ neap range, Moon's angle (°, 0–180).
  Relations: ratio = (M_S ÷ M_M)(d_M ÷ d_S)³; spring ÷ neap = (1 + ratio) ÷ (1 − ratio).
  Assumptions: tide-raising force falls as distance cubed, so the nearer Moon wins; spring tides at
  new and full Moon. Example: 1.989 × 10³⁰ kg at 1.496 × 10¹¹ m, 7.35 × 10²² kg at 3.844 × 10⁸ m →
  0.459; spring ranges 2.70 times neap.
- **Verdict:** 4 pages; every type Solves, the tsunami fully with P16.

### Hydrology — `he.earth-science.hydrology`

- **Prerequisite:** Calculus I. **Refresh:** `s.12.surface-processes~discharge`, `s.6.water-cycle`.
- **Textbooks:** Earle ch. 13–14 (streams, groundwater); Heath, Basic Ground-Water Hydrology (USGS);
  Freeze & Cherry, Groundwater (Groundwater Project edition); a hydrology text with runoff and
  frequency chapters (part 4).

#### #0 Water budgets

| Question type                                             | Page        | Mark   |
| --------------------------------------------------------- | ----------- | ------ |
| runoff from P, ET and storage change; volume and mean Q   | main        | Solves |
| monthly surplus and deficit (P against PET)               | ~monthly    | Solves |
| residence time of a lake                                  | ~residence  | Solves |

- **Main — BUILD `…#0`:** `waterfall` (items: precipitation +, evapotranspiration −, runoff −; total
  the storage change), as on the pilot. Values: precipitation P, evapotranspiration ET, runoff Q,
  storage change ΔS (mm/yr, −2,000–10,000), basin area A (km², 0.01–7,000,000), runoff volume V (m³),
  mean discharge (m³/s), runoff ratio Q ÷ P. Relations: P = ET + Q + ΔS; V = Q × A (1 mm over 1 km² =
  1,000 m³); mean discharge = V ÷ 31,557,600 s; ratio = Q ÷ P. Assumptions: a closed basin with no
  groundwater leaving underground; depths over the basin let basins of any size be compared.
  Example: 900, 550, ΔS 20 mm → Q = 330 mm; 250 km² → 8.25 × 10⁷ m³, 2.61 m³/s; ratio 0.367.
  startWith P, ET, ΔS, A.
- **~monthly — BUILD (observe, `second` with its own unit off: both rows mm):** columns Jan … Dec,
  rows precipitation and potential ET; `guides` none. A made-up mid-latitude basin: P 80, 70, 75, 70,
  65, 55, 45, 50, 60, 75, 85, 90; PET 10, 15, 35, 60, 95, 125, 140, 120, 80, 45, 20, 10. Pattern:
  "Where PET passes P (May to September here), soil water runs down; where P passes PET, it refills."
- **~residence — BUILD:** `reserve` (reserve, rate, years). Values: lake volume V (m³), outflow Q
  (m³/s), residence time τ (s and years). Relation: τ = V ÷ Q. Example: 2.4 × 10⁹ m³ at 30 m³/s →
  8.0 × 10⁷ s = 2.54 yr.
- **Verdict:** 3 pages; every type Solves.

#### #1 Surface runoff

| Question type                                         | Page        | Mark           |
| ----------------------------------------------------- | ----------- | -------------- |
| peak discharge by the rational method                 | main        | Solves (⏳ P18) |
| storm runoff depth by the SCS curve number            | ~curve-number | Solves       |
| channel velocity and discharge by Manning's equation  | ~manning    | Solves         |
| lag between rain peak and flow peak (hydrograph)      | ~hydrograph | Solves         |

- **Main — BUILD `…#1`:** the rational method. Picture: new `catchment` (P18); interim `percentBar`
  (C as the share that runs off). Values: runoff coefficient C (0.05–0.95), rainfall intensity i
  (mm/h, 1–300), area A (km², 0.01–10), peak discharge Q_p (m³/s). Relation: Q_p = CiA ÷ 3.6.
  Assumptions: small basins only (under about 10 km² as the page allows); rain lasts at least the
  time water takes to cross the basin; pavement has C near 0.9, woods near 0.2. Example: 0.6,
  50 mm/h, 2 km² → 16.7 m³/s. startWith C, i, A.
- **~curve-number — BUILD:** `table` (P = 25, 50, 75, 100 mm → Q). Values: curve number CN (30–100),
  storage S (mm), initial abstraction I_a (mm), rain P (mm, 0–500), runoff Q (mm). Relations:
  S = 25,400 ÷ CN − 254; I_a = 0.2S; Q = (P − I_a)² ÷ (P + 0.8S) when P > I_a, else 0 (a rule).
  Example: CN 80, 75 mm → S = 63.5, I_a = 12.7, Q = 62.3² ÷ 125.8 = 30.9 mm.
- **~manning — BUILD:** `streamChannel` (width, depth, speed, area, discharge). Values: width b (m),
  depth y (m), area A, wetted perimeter P_w (m), hydraulic radius R (m), roughness n (0.01–0.15),
  slope S (0.00001–0.1), velocity v (m/s), discharge Q (m³/s). Relations: A = by; P_w = b + 2y;
  R = A ÷ P_w; v = R^(2/3)S^(1/2) ÷ n; Q = Av. Assumptions: steady uniform flow in a rectangular
  channel; n from tables (0.035 for a natural stream). Example: 10 m × 2 m, n 0.035, S 0.001 →
  R = 1.43 m, v = 1.15 m/s, Q = 22.9 m³/s; depth for a given Q is found by trial (E8).
- **~hydrograph — BUILD (observe, `second` with its own unit):** columns hours 0–12; rows rain (mm
  each hour) and discharge (m³/s). Made-up storm: rain 2, 10, 14, 6, 1, 0 …; flow 3, 3, 5, 12, 25, 34,
  30, 22, 15, 10, 7, 5, 4. Pattern: "The flow peaks about three hours after the heaviest rain, then
  falls slowly."
- **Verdict:** 4 pages; three calculators ship now (main on its interim), the hydrograph too.

#### #2 Groundwater flow (Darcy's law)

| Question type                                            | Page        | Mark           |
| -------------------------------------------------------- | ----------- | -------------- |
| flow through an aquifer; seepage speed; travel time      | main        | Solves (⏳ P17) |
| hydraulic conductivity from a permeameter                | main        | Solves (⏳ P17) |
| hydraulic head from elevation and pressure               | ~head       | Solves (⏳ P17) |
| well yield from two observation wells (Thiem)            | ~thiem      | Solves (⏳ P17) |
| aquifer or aquitard                                      | ~materials  | Solves         |

- **Main — BUILD `…#2`:** Darcy's law. Picture: new `aquifer` mode `section` (P17); interim
  `functionGraph` linear (head against distance). Values: hydraulic conductivity K (m/day, 10⁻⁶–
  1,000), head drop Δh (m), flow length L (m), gradient i (derived), area A (m²), discharge Q
  (m³/day), Darcy flux q (m/day), porosity n (0.01–0.5), seepage velocity v (m/day), travel time t
  (days). Relations: i = Δh ÷ L; Q = KAi; q = Q ÷ A; v = q ÷ n; t = L ÷ v. Assumptions: laminar flow
  through connected pores; water flows from high head to low; the seepage velocity is faster than q
  because water only moves through the pores. Example: 10 m/day, 2 m over 400 m, 1,000 m², n 0.25 →
  i = 0.005, Q = 50 m³/day, q = 0.05, v = 0.2 m/day, t = 2,000 days (5.5 yr). startWith K, Δh, L, A, n.
- **~head — BUILD (⏳ P17; interim `bars` stacked: z and p ÷ ρg):** values elevation z (m),
  pressure p (kPa), pressure head (m), total head h (m). Relations: pressure head = p ÷ (ρg);
  h = z + pressure head. Example: 120 m, 98.1 kPa → 10.0 m, h = 130 m.
- **~thiem — BUILD (⏳ P17 mode `well`; interim `functionGraph` log):** values K (m/day), aquifer
  thickness b (m), heads h₁, h₂ (m) at radii r₁, r₂ (m), pumping rate Q (m³/day). Relation:
  Q = 2πKb(h₂ − h₁) ÷ ln(r₂ ÷ r₁). Assumptions: a confined aquifer pumped steadily for a long time;
  heads rise toward the far well. Example: 20 m/day, 15 m, 1.2 m between 10 and 100 m → 982 m³/day.
- **~materials — BUILD (sort):** bins Aquifer, Aquitard. Cards: clean gravel; well-sorted sand;
  fractured basalt; cave-riddled limestone; clay; shale; unfractured granite; glacial till rich in
  clay.
- **Verdict:** 4 pages; the three calculators ship on interims and gain the aquifer picture (P17).

#### #3 Flood frequency

| Question type                                        | Page      | Mark   |
| ---------------------------------------------------- | --------- | ------ |
| chance of at least one T-year flood in N years       | main      | Solves |
| return period from a flood's rank in the record      | ~weibull  | Solves |
| the 100-year flood from the mean and SD (Gumbel)     | ~gumbel   | Solves |

- **Main — BUILD `…#3`:** `functionGraph` exponential (risk against N: 1 − (1 − p)^N). Values: return
  period T (years, 1.01–10,000), yearly chance p (%), years N (1–200), risk R (%). Relations: p =
  100 ÷ T; R = 100(1 − (1 − p ÷ 100)^N). Assumptions: each year is independent; the "100-year flood"
  has a 1 % chance every year, not once a century. Example: T = 100, N = 30 → 26.0 %. startWith T, N.
- **~weibull — BUILD:** `table` (ranks 1–5 → T). Values: years of record n (whole, 5–200), rank m
  (whole, 1–n), return period T (years), chance p (%). Relations: T = (n + 1) ÷ m; p = 100 ÷ T.
  Example: 49 years, rank 1 → 50 yr (2 %); rank 5 → 10 yr. `logX` of P19 adds the plot later.
- **~gumbel — BUILD:** `table` (T = 2, 10, 50, 100 → x_T). Values: mean annual peak x̄ (m³/s), standard
  deviation s, return period T, frequency factor K_T, design flood x_T. Relations: K_T = −(√6 ÷
  π)(0.5772 + ln(ln(T ÷ (T − 1)))); x_T = x̄ + K_T s. Assumptions: yearly peaks follow a Gumbel
  distribution; a long record (the factor here is for large n). Example: 500 and 150 m³/s → T = 2:
  475; 10: 696; 50: 889; 100: K = 3.137, 971 m³/s.
- **Verdict:** 3 pages; every type Solves.

### Geophysics — `he.earth-science.geophysics`

- **Prerequisites:** University Physics II, Physical Geology. **Refresh:** `s.12.earth-interior`
  (and `~shadow-zone`, `~epicenter`), `s.11.optics` (Snell's law), `s.11.circular-gravitation`.
- **Textbooks:** UBC Geophysics for Practicing Geoscientists (seismic, gravity, magnetics, DC
  resistivity, GPR); MIT OCW Essentials of Geophysics notes (heat flow, isostasy).

#### #0 Seismology

| Question type                                          | Page            | Mark           |
| ------------------------------------------------------ | --------------- | -------------- |
| depth to a layer from a refraction crossover distance  | main            | Solves (⏳ P20) |
| reflection time at an offset; normal moveout           | ~reflection     | Solves (⏳ P20) |
| critical angle; refraction of a seismic ray            | ~critical-angle | Solves (⏳ P21) |

- **Main — BUILD `…#0`:** two-layer refraction. Picture: new `refraction` (P20); interim
  `functionGraph` two lines (direct t = x ÷ v₁, head wave t = tᵢ + x ÷ v₂). Values: upper speed v₁
  (m/s, 300–6,000), lower speed v₂ (m/s, above v₁, to 8,500), crossover distance x_c (m, 1–10,000),
  critical angle i_c (°), intercept time tᵢ (ms), depth h (m). Relations: sin i_c = v₁ ÷ v₂;
  h = (x_c ÷ 2)√((v₂ − v₁) ÷ (v₂ + v₁)); tᵢ = 2h cos i_c ÷ v₁. Assumptions: flat layers, the lower
  one faster (else no head wave: a rule); beyond the crossover the head wave arrives first. Example:
  1,500 and 4,500 m/s, x_c = 60 m → i_c = 19.47°, h = 30 × 0.7071 = 21.2 m, tᵢ = 26.7 ms (check:
  60 ÷ 1,500 = 0.0267 + 60 ÷ 4,500). startWith v₁, v₂, x_c.
- **~reflection — BUILD (⏳ P20 mode `reflection`; interim `functionGraph` hyperbola from
  `conicGraph`):** values depth h (m), speed v (m/s), offset x (m), zero-offset time t₀ (s), time
  t(x) (s), moveout Δt (s). Relations: t₀ = 2h ÷ v; t = √(x² + 4h²) ÷ v; Δt = t − t₀. Example:
  600 m, 2,000 m/s → t₀ = 0.600 s; x = 800 m → 1,442 ÷ 2,000 = 0.721 s, Δt = 0.121 s.
- **~critical-angle — BUILD (⏳ P21; interim `rayDiagram` Snell with n ∝ 1 ÷ v):** values v₁, v₂,
  incidence angle (°), refraction angle (°), critical angle (°). Relations: sin r = (v₂ ÷ v₁) sin i;
  sin i_c = v₁ ÷ v₂. Example: 1,500 to 4,500 m/s, 10° → sin r = 0.521, r = 31.4°; i_c = 19.47°.
- **Verdict:** 3 calculators; all ship on interims, the survey picture (P20) is the real teacher.

#### #1 Gravity and magnetics

| Question type                                            | Page            | Mark           |
| -------------------------------------------------------- | --------------- | -------------- |
| free-air and Bouguer corrections; the Bouguer anomaly    | main            | Solves         |
| anomaly over a buried sphere                             | ~sphere         | Solves (⏳ P22) |
| depth of a mountain's root (Airy isostasy)               | ~isostasy       | Solves (⏳ P22) |
| paleolatitude from magnetic inclination                  | ~paleolatitude  | Solves (⏳ P3)  |

- **Main — BUILD `…#1`:** `waterfall` (items: observed minus normal gravity, + free-air correction,
  − Bouguer slab; total the Bouguer anomaly). Values: station elevation h (m, 0–6,000), slab density ρ
  (g/cm³, 1.5–3.3; 2.67), observed minus normal gravity Δg (mGal, −500–500), free-air correction
  (mGal), Bouguer correction (mGal), free-air anomaly (mGal), Bouguer anomaly (mGal). Relations:
  FA = 0.3086h; B = 0.04193ρh; FA anomaly = Δg + FA; Bouguer anomaly = FA anomaly − B. Assumptions:
  gravity falls 0.3086 mGal per metre up; the rock between the station and sea level is a flat slab;
  terrain corrections left out. Example: 250 m, 2.67, −40.0 → FA 77.15, B 27.99, FA anomaly 37.15,
  Bouguer anomaly 9.16 mGal. startWith h, ρ, Δg. Needs the mGal unit (E1).
- **~sphere — BUILD (⏳ P22 `gravityProfile` mode `sphere`; interim `functionGraph`):** values radius
  R (m), density contrast Δρ (kg/m³, −3,000–3,000), depth to centre z (m, above R), excess mass
  (kg), peak anomaly Δg_max (mGal), half-width x½ (m). Relations: mass = (4 ÷ 3)πR³Δρ; Δg_max =
  G × mass ÷ z² (× 10⁵ for mGal); x½ = 0.766z. Example: 100 m, 500 kg/m³, 200 m → 2.09 × 10⁹ kg,
  0.349 mGal, x½ = 153 m. z > R is a rule ("the sphere must be buried").
- **~isostasy — BUILD (⏳ P22 mode `airy`):** values mountain height h (km), crust density ρ_c (2.8),
  mantle density ρ_m (3.3, above ρ_c), root r (km), normal crust T (km, 35), crust under the peak (km).
  Relations: r = hρ_c ÷ (ρ_m − ρ_c); total = T + h + r. Example: 3 km → 16.8 km root, 54.8 km crust.
- **~paleolatitude — BUILD (⏳ P3 `globe` mode `dipole`; interim `functionGraph` arctan):** values
  inclination I (°, −90–90), latitude φ (°). Relation: tan I = 2 tan φ. Assumptions: Earth's field
  averaged over thousands of years is a dipole on the spin axis; I is down in the north. Example:
  I = 49.1° → tan φ = 0.577, φ = 30.0°.
- **Verdict:** 4 calculators; the main ships now, the others on interims.

#### #2 Heat flow

| Question type                                          | Page            | Mark   |
| ------------------------------------------------------ | --------------- | ------ |
| heat flow from conductivity and geothermal gradient    | main            | Solves |
| temperature at depth (no heat production)              | main            | Solves |
| temperature at depth with radiogenic heat              | ~heat-production| Solves |
| seafloor heat flow from its age (half-space cooling)   | ~cooling        | Solves |

- **Main — BUILD `…#2`:** `functionGraph` linear (T against depth; `invertY` of P19 when drawn).
  Values: conductivity k (W/(m·K), 0.5–6), gradient G (°C/km, 5–100), heat flow q (mW/m²), surface
  temperature T₀ (°C), depth z (km, 0–50), temperature T (°C). Relations: q = kG; T = T₀ + Gz.
  Assumptions: steady conduction, no heat made in the layer; heat flows up, from hot to cold.
  Example: 2.5, 25 °C/km → 62.5 mW/m²; 10 °C at the surface → 260 °C at 10 km. startWith k, G, T₀, z.
- **~heat-production — BUILD:** `functionGraph` quadratic. Values: q₀, k, heat production A (μW/m³,
  0–10), z, T₀, T. Relation: T = T₀ + q₀z ÷ k − Az² ÷ (2k). Example: 62.5 mW/m², 2.5, 1 μW/m³,
  10 km → 10 + 250 − 20 = 240 °C.
- **~cooling — BUILD:** `functionGraph` power (q against t, p/q = −1/2). Values: age t (Myr,
  0.1–180), k (3.3), temperature drop ΔT (K, 1,300), diffusivity κ (10⁻⁶ m²/s), heat flow q
  (mW/m²). Relation: q = kΔT ÷ √(πκt) (t in seconds, E12). Example: 50 Myr → √(π × 10⁻⁶ ×
  1.578 × 10¹⁵) = 70,400 m, q = 60.9 mW/m².
- **Verdict:** 3 calculators; every type Solves.

#### #3 Geophysical imaging

| Question type                                         | Page      | Mark           |
| ----------------------------------------------------- | --------- | -------------- |
| apparent resistivity from a Wenner survey             | main      | Solves (⏳ P23) |
| GPR depth from two-way time and permittivity          | ~gpr      | Solves (⏳ P20) |
| which method finds this target                        | ~methods  | Solves         |

- **Main — BUILD `…#3`:** Wenner resistivity. Picture: new `electrodeArray` (P23); interim `table`
  (a = 1, 2, 5, 10, 20 m at the page's V ÷ I). Values: spacing a (m, 0.1–500), voltage V (V),
  current I (A), resistance V ÷ I (Ω), apparent resistivity ρ_a (Ω·m). Relations: R = V ÷ I;
  ρ_a = 2πaR. Assumptions: four electrodes evenly spaced in a line, current through the outer two;
  wider spacing samples deeper; ρ_a is the true resistivity only for uniform ground. Example: 10 m,
  0.30 V at 0.20 A → 1.5 Ω, 94.2 Ω·m. startWith a, V, I. Needs the Ω·m unit (E1).
- **~gpr — BUILD (⏳ P20 mode `gpr`):** values relative permittivity εᵣ (1–81), speed v (m/ns), two-way
  time t (ns), depth d (m). Relations: v = 0.3 ÷ √εᵣ; d = vt ÷ 2. Example: εᵣ 9 → 0.1 m/ns; 40 ns →
  2.0 m.
- **~methods — BUILD (sort):** bins Gravity, Magnetics, Resistivity, Ground-penetrating radar,
  Seismic reflection. Cards: a low-density salt dome; buried steel drums; a plume of salty
  groundwater; a plastic pipe 1 m down; sedimentary layers 3 km down; a dense ore body with no magnetic minerals; a
  basalt dike under farmland.
- **Verdict:** 3 pages; the two calculators wait on their pictures for the real teaching.

### Physical Geography — `he.geography.physical-geography`

- **Prerequisite:** `s.12.climate-systems`. **Refresh:** `s.12.climate-systems~zones`,
  `s.12.atmosphere-weather`, `s.12.surface-processes`, `s.9.biomes`.
- **Textbooks:** Dastrup, Physical Geography and Natural Disasters (Earth–sun, climate, landforms,
  biogeography chapters).

#### #0 Earth–sun relationships

| Question type                                         | Page          | Mark           |
| ----------------------------------------------------- | ------------- | -------------- |
| noon sun angle at a latitude on a date                | main          | Solves (⏳ P3)  |
| day length at a latitude on a date                    | main          | Solves (⏳ P3)  |
| the Sun's declination on a day of the year            | ~declination  | Solves         |
| daily sunlight at the top of the atmosphere           | ~insolation   | Solves (⏳ P3)  |

- **Main — BUILD `…#0`:** `globe` mode `sun` (P3); interim `functionGraph` (day length against
  latitude at the page's δ). Values: latitude φ (°, −90–90), declination δ (°, −23.44–23.44), noon
  sun angle (°), sunrise hour angle H (°), day length (h). Relations: noon angle = 90 − |φ − δ|;
  cos H = −tan φ tan δ; day = 2H ÷ 15. Assumptions: δ is the latitude where the Sun is overhead at
  noon; 15° of turning is one hour; refraction and the Sun's width (a few minutes) ignored; past
  the polar circles the day is 0 or 24 h (the page says "polar night" or "midnight sun"). Example:
  40° N at the June solstice → 73.4°; cos H = −0.3638, H = 111.3°, day 14.8 h; at the December
  solstice 26.6° and 9.2 h. startWith φ, δ.
- **~declination — BUILD:** `functionGraph` sine over the year. Values: day of year n (whole,
  1–365), declination δ (°). Relation: δ = 23.44 sin(360(284 + n) ÷ 365). Example: n = 172 (21 June)
  → 23.44°; n = 80 → −0.40°.
- **~insolation — BUILD (⏳ P3; interim `table` of latitudes 0–90 at the page's δ):** values φ, δ,
  H (from main's relation), daily mean sunlight Q (W/m²). Relation: Q = (1,361 ÷ π)(H_rad sin φ sin δ +
  cos φ cos δ sin H). Example: 40° N, June solstice → 499 W/m²; the equator at an equinox → 433 W/m².
- **Verdict:** 3 calculators; all ship on interims, the globe (P3) is the picture a teacher draws.

#### #1 Climate classification

| Question type                                         | Page         | Mark   |
| ----------------------------------------------------- | ------------ | ------ |
| Köppen group from monthly temperatures and rain       | main         | Solves |
| arid (B) or not; steppe or desert                     | ~arid        | Solves |
| read a climograph and name its climate                | ~climograph  | Solves |

- **Main — BUILD `…#1` (sort, `pickBar`):** bins A Tropical, B Dry, C Temperate, D Continental,
  E Polar; `intro` gives the rules (A: coldest month 18 °C or more; C: coldest between 0 and 18 °C;
  D: coldest below 0 °C, warmest above 10 °C; E: warmest below 10 °C; B: too little rain for the
  heat, checked first). Cards: coldest month 26 °C, 2,800 mm rain; mean 24 °C, 120 mm rain; coldest
  6 °C, warmest 23 °C, 1,000 mm; coldest −14 °C, warmest 19 °C, 600 mm; warmest 5 °C; coldest 21 °C,
  1,500 mm with a dry winter; coldest −30 °C, warmest 14 °C, 400 mm; mean 19 °C, 250 mm.
- **~arid — BUILD:** `bars` (P beside the threshold and half of it). Values: mean annual temperature
  T (°C, −30–35), yearly rain P (mm, 0–12,000), rain season (allowed 0 winter, 140 even, 280 summer:
  the added mm), threshold P_th (mm), P ÷ P_th. Relation: P_th = 20T + season. Assumptions: B if
  P < P_th; desert BW below half of it, steppe BS between; h if T ≥ 18 °C, k below (in the caption,
  E5). Example: 18 °C, even rain, 300 mm → P_th = 500 → 0.6 → BSh.
- **~climograph — BUILD (observe, `second` with its own unit: a climograph):** columns Jan … Dec,
  temperature (°C, `min` −20) and rain (mm). A made-up inland city: −8, −6, 0, 8, 15, 20, 23, 21, 16,
  9, 1, −5 °C; 20, 20, 35, 55, 85, 100, 95, 85, 70, 45, 35, 25 mm. Pattern: "Coldest month below 0 °C,
  warmest above 10 °C, rain all year: a D climate (Dfa)."
- **Verdict:** 3 pages (1 calculator, 2 layouts); every type Solves.

#### #2 Landforms

| Question type                                        | Page       | Mark           |
| ---------------------------------------------------- | ---------- | -------------- |
| slope and gradient along a line on a contour map     | main       | Solves (⏳ P24) |
| drainage density and bifurcation ratio of a basin    | ~drainage  | Solves         |
| landform from its shape and process                  | ~landforms | Solves         |

- **Main — BUILD `…#2`:** a contour-map profile. Picture: new `contourMap` (P24); interim
  `triangleSolver` (rise over run, the angle). Values: contour interval CI (m, 1–500), intervals
  crossed n (whole, 0–100), rise (m), map distance (cm, 0.1–100), scale denominator (whole,
  1,000–10,000,000), ground distance (m), gradient (%), slope angle (°). Relations: rise = n × CI;
  ground = map × denominator ÷ 100; gradient = 100 × rise ÷ ground; angle = tan⁻¹(rise ÷ ground).
  Assumptions: the slope is even between the two points; close contours mean steep ground. Example:
  20 m, 5 intervals → 100 m; 5 cm at 1:50,000 → 2,500 m; 4 %, 2.29°. startWith CI, n, map, scale.
- **~drainage — BUILD:** `table` (order, streams, ratio). Values: total stream length L (km), basin
  area A (km²), drainage density D_d (km/km²), streams of order 1, 2 and 3 (whole), ratios R_b12,
  R_b23. Relations: D_d = L ÷ A; R_b12 = N₁ ÷ N₂; R_b23 = N₂ ÷ N₃. Assumptions: Strahler ordering
  (two streams of one order make the next); high D_d means impermeable ground or steep slopes.
  Example: 180 km over 75 km² → 2.4 km/km²; 40, 9, 2 streams → 4.44 and 4.5.
- **~landforms — BUILD (explore, `landforms`):** scenes V-shaped valley (a river cutting down), U-
  shaped valley (a glacier scouring), meander (outer bank cut, inner bar), dune (wind from the gentle
  side), normal fault (crust pulled apart), aquifer (water under the land).
- **Verdict:** 3 pages; every type Solves (the map picture after P24).

#### #3 Biogeography

| Question type                                         | Page           | Mark   |
| ----------------------------------------------------- | -------------- | ------ |
| species expected on an island of a given area         | main           | Solves |
| share of species lost when habitat shrinks            | ~habitat-loss  | Solves |
| treeline elevation from sea-level temperature         | ~treeline      | Solves |
| biome from its climate                                | ~biomes        | Solves |

- **Main — BUILD `…#3`:** `functionGraph` power (S against A; `logX`/`logY` of P19 later). Values:
  constant c (0.1–1,000), exponent z (0.1–0.5; islands near 0.25–0.35), area A (km², 0.001–10⁷),
  species S. Relation: S = cA^z. Assumptions: c and z are fitted for one group of species in one
  region; 10 times the area gives about twice the species when z ≈ 0.3. Example: c 20, z 0.25,
  10,000 km² → 200 species. startWith c, z, A.
- **~habitat-loss — BUILD:** `functionGraph` power. Values: area kept (%), z, species kept (%),
  species lost (%). Relation: kept S = 100(kept A ÷ 100)^z. Example: 10 % of the forest kept, z 0.25
  → 56.2 % of species kept, 43.8 % lost in time.
- **~treeline — BUILD:** `atmosphereLayers` mode `profile` (altitude, temperature, ground). Values:
  warmest-month temperature at sea level T₀ (°C, 0–35), lapse rate (6.5 °C/km), treeline z (km).
  Relation: z = (T₀ − 10) ÷ 6.5. Assumption: trees need a warmest month of about 10 °C. Example:
  24 °C → 2.15 km.
- **~biomes — BUILD (sort):** bins with the biome icons: tropical rainforest, desert, grassland,
  temperate deciduous forest, taiga, tundra. Cards: hot and wet all year; under 250 mm of rain;
  cold winters, warm summers, 750–1,500 mm; long cold winters, conifers; permafrost, short summer;
  hot summers, 300–800 mm, fires.
- **Verdict:** 4 pages; every type Solves.

### Human Geography — `he.geography.human-geography`

- **Prerequisites:** none. **Refresh:** `m.9.exponential-functions` (growth), `m.7.percent-applications`,
  `m.11.exp-log-equations`.
- **Textbooks:** Dastrup, Introduction to Human Geography (population, migration, urban, economic,
  culture, language and religion chapters).

#### #0 Population and migration (pilot)

| Question type                                          | Page         | Mark           |
| ------------------------------------------------------ | ------------ | -------------- |
| natural increase, net migration, population change     | main (pilot) | Solves         |
| CBR, CDR, RNI; doubling time by the rule of 70         | ~rates       | Solves         |
| population after t years; exact doubling time         | ~doubling    | Solves         |
| which city draws more migrants (gravity model)         | ~gravity     | Solves         |
| dependency ratio from age groups                       | ~dependency  | Solves (⏳ P29) |
| stage of the demographic transition                    | ~transition  | Solves         |

- **Main — REVIEW the pilot `…#0`:** trim to 9 values as in Decisions (P₀, B, D, I, E, N, M, ΔP,
  RNI = N ÷ P₀ × 100), `waterfall` unchanged. Its use line: "Use this for 'A city of 500,000 had 6,000
  births, 4,000 deaths, 3,000 arrivals and 1,000 departures. How much did it grow?'"
- **~rates — BUILD (from the pilot):** `bars` (CBR, CDR and the gap RNI × 10). Values: P₀, B, D,
  CBR, CDR (per 1,000), RNI (%), T₂ (years). Relations: the pilot's CBR, CDR, RNI = (CBR − CDR) ÷ 10
  and T₂ ≈ 70 ÷ RNI. Example: as the pilot, T₂ = 175 years.
- **~doubling — BUILD:** `functionGraph` exponential (P against t). Values: starting population P₀,
  growth rate r (%/yr, −5–10), years t (0–200), population P_t, exact doubling time T₂ (years),
  rule-of-70 estimate. Relations: P_t = P₀(1 + r ÷ 100)^t; T₂ = ln 2 ÷ ln(1 + r ÷ 100); estimate =
  70 ÷ r. Example: 1,000,000 at 2 % for 20 yr → 1,485,947; T₂ = 35.0 yr (the rule gives 35).
- **~gravity — BUILD:** `bars` (each city's pull). Values: populations of cities A and B, distances
  d_A, d_B (km), pulls I_A = P_A ÷ d_A², I_B, share drawn to A (%). Relations: I = P ÷ d²; share =
  100I_A ÷ (I_A + I_B). Assumptions: migration grows with a place's size and falls with distance
  squared (the gravity model); jobs, family and borders change it. Example: 1,000,000 at 100 km,
  4,000,000 at 300 km → 100 and 44.4 → 69.2 % to A.
- **~dependency — BUILD (⏳ P29 `populationPyramid`; interim `pieChart`):** values ages 0–14,
  15–64, 65 and over (people), dependency ratio, youth ratio, old-age ratio (per 100 of working
  age). Relations: youth = 100 × young ÷ working; old = 100 × old ÷ working; total = youth + old.
  Example: 2.4, 6.0, 1.2 million → 40 + 20 = 60.
- **~transition — BUILD (sequence):** Stage 1 high births and deaths, slow growth; Stage 2 deaths
  fall (food, clean water, medicine), fast growth; Stage 3 births fall (cities, schooling, women's
  work), growth slows; Stage 4 low births and deaths; Stage 5 births below deaths, decline.
- **Verdict:** 6 pages (the pilot, 4 calculators, 1 sequence); every type Solves, the pyramid after P29.

#### #1 Urbanization

| Question type                                          | Page              | Mark   |
| ------------------------------------------------------ | ----------------- | ------ |
| expected size of the nth city (rank–size rule)         | main              | Solves |
| density at a distance from the centre                  | ~density-gradient | Solves |
| a city's yearly growth rate; its doubling time         | ~growth-rate      | Solves |
| concentric, sector or multiple-nuclei model            | ~models           | Solves |

- **Main — BUILD `…#1`:** `bars` (expected and actual size, the largest city beside them). Values:
  largest city P₁ (people), rank n (whole, 1–100), expected P_n, actual P_n, actual ÷ expected.
  Relation: P_n = P₁ ÷ n. Assumptions: the rank–size rule describes many countries' city systems; a
  primate city is far more than twice the second. Example: 8,400,000; rank 3 → 2,800,000 expected;
  2,100,000 actual → 0.75. startWith P₁, n.
- **~density-gradient — BUILD:** `functionGraph` exponential, or `circle` with `population` (a town's
  outline with its people) for the centre's density. Values: central density D₀ (people/km²),
  gradient b (per km, 0.01–2), distance x (km), density D. Relation: D = D₀e^(−bx). Example:
  20,000, 0.2, 10 km → 2,707 per km².
- **~growth-rate — BUILD:** `functionGraph` exponential. Values: P₁, P₂, years t, rate r (%/yr),
  doubling time (yr). Relations: r = 100 ln(P₂ ÷ P₁) ÷ t; T₂ = 100 ln 2 ÷ r. Example: 1.2 to 3.0
  million in 25 yr → 3.67 %/yr, doubling in 18.9 yr.
- **~models — BUILD (sort):** bins Concentric zone (Burgess), Sector (Hoyt), Multiple nuclei
  (Harris–Ullman). Cards: rings of land use around one centre; wedges along rail lines and highways;
  several business centres, an airport district; the poorest housing just outside downtown, wealthier
  rings farther out; a high-income wedge along a lakeshore; an industrial park far from downtown.
- **Verdict:** 4 pages; every type Solves.

#### #2 Economic geography

| Question type                                         | Page       | Mark   |
| ----------------------------------------------------- | ---------- | ------ |
| location quotient of an industry                      | main       | Solves |
| land rent at a distance from market (von Thünen)      | ~bid-rent  | Solves |
| least-cost site: at the mine or the market (Weber)    | ~weber     | Solves |
| economic sector of a job                              | ~sectors   | Solves |

- **Main — BUILD `…#2`:** `percentBar` with `second` (the local share as a band, the national share
  dashed). Values: local jobs in the industry eᵢ, all local jobs e, national jobs in it Eᵢ, all
  national jobs E, local share (%), national share (%), location quotient LQ. Relations: local =
  100eᵢ ÷ e; national = 100Eᵢ ÷ E; LQ = local ÷ national. Assumptions: LQ above 1 means the area
  specializes in the industry (and likely exports it). Example: 24,000 of 200,000 (12 %) against
  12 million of 150 million (8 %) → LQ 1.5. startWith eᵢ, e, Eᵢ, E.
- **~bid-rent — BUILD:** `functionGraph` linear (rent against distance). Values: yield Y (t/ha),
  price p ($/t), cost c ($/t), freight f ($/t per km), distance d (km), rent R ($/ha), edge of farming
  d_max (km). Relations: R = Y(p − c) − Yfd; d_max = (p − c) ÷ f. Example: 4 t/ha, $200, $120,
  $0.50 → R = 320 − 2d, zero at 160 km.
- **~weber — BUILD:** `functionGraph` linear (cost against the site's distance from the mine).
  Values: freight rate ($/t·km), material per tonne of product (t), product (1 t), mine-to-market
  distance D (km), site's distance from the mine x (km), cost per tonne ($), material index.
  Relations: cost = rate × (material × x + product × (D − x)); index = material ÷ product.
  Example: $0.10, 5 t of ore per t of metal, 300 km → $30 at the mine, $150 at the market: build at
  the mine (weight-losing, index 5).
- **~sectors — BUILD (sort):** bins Primary, Secondary, Tertiary, Quaternary. Cards: fishing;
  copper mining; logging; steel mill; car assembly; bakery making bread; nurse; truck driver; retail
  clerk; university research lab; software design; financial data analysis.
- **Verdict:** 4 pages; every type Solves.

#### #3 Cultural landscapes

| Question type                                          | Page        | Mark   |
| ------------------------------------------------------ | ----------- | ------ |
| type of cultural diffusion from an example             | main        | Solves |
| language or religious diversity of a country           | ~diversity  | Solves |

- **Main — BUILD `…#3` (sort):** bins Relocation, Contagious, Hierarchical, Stimulus diffusion.
  Cards: emigrants bring their cuisine to a new country; a song spreads friend to friend online;
  a fashion reaches big cities first, then towns; a fast-food chain adds vegetarian menus in India;
  a disease spreads house to house; missionaries move to a new land, their religion with them; a new phone model
  launches in capital cities first.
- **~diversity — BUILD:** `pieChart`. Values: shares of four groups (%, the fourth = 100 − the
  others), sum of squares, diversity index F (0–1). Relations: Σ = (s₁² + s₂² + s₃² + s₄²) ÷ 10,000;
  F = 1 − Σ. Assumption: F is the chance two people picked at random belong to different groups.
  Example: 50, 30, 20, 0 % → Σ = 0.38, F = 0.62.
- **Verdict:** 2 pages (1 calculator, 1 sort); every type Solves.

### Cartography — `he.geography.cartography`

- **Prerequisite:** `m.10.coordinate-geometry`. **Refresh:** `m.7.scale-drawings`, `m.11.unit-circle`,
  `m.10.coordinate-geometry`.
- **Textbooks:** Snyder, Map Projections — A Working Manual (USGS); Penn State GEOG 486
  (cartography and visualization); DiBiase, The Nature of Geographic Information.

#### #0 Map projections

| Question type                                          | Page          | Mark           |
| ------------------------------------------------------ | ------------- | -------------- |
| Mercator scale factor and area distortion at φ         | main          | Solves (⏳ P28) |
| where a parallel is drawn (Mercator, equal-area)       | main, ~equal-area | Solves (⏳ P28) |
| conformal, equal-area, equidistant or compromise       | ~properties   | Solves         |

- **Main — BUILD `…#0`:** Mercator. Picture: new `projection` (P28) with a Tissot circle at φ;
  interim `table` (φ = 0, 30, 45, 60, 75° → k, area, y). Values: latitude φ (°, −85–85), scale factor
  k, area factor, globe radius R (cm, 1–100), map height of the parallel y (cm). Relations: k =
  1 ÷ cos φ; area = k²; y = R ln tan(45° + φ ÷ 2). Assumptions: a sphere; conformal, so small shapes
  keep their angles while area grows as k²; the poles never fit. Example: 60° → k = 2, area × 4;
  R = 10 cm → y = 10 × ln 3.732 = 13.2 cm. startWith φ, R.
- **~equal-area — BUILD (⏳ P28 `cylindrical equal-area`):** values φ, R, y, east–west scale k_E,
  north–south scale k_N, area factor. Relations: y = R sin φ; k_E = 1 ÷ cos φ; k_N = cos φ; area =
  k_E k_N = 1. Example: 60° → y = 8.66 cm, k_E = 2, k_N = 0.5, area 1 (shapes squashed, areas true).
- **~properties — BUILD (sort):** bins Conformal, Equal-area, Equidistant, Compromise (the P28 card
  figure when drawn). Cards: Mercator; Lambert conformal conic; stereographic; Albers equal-area
  conic; Mollweide; Gall–Peters; azimuthal equidistant; Robinson; Winkel tripel.
- **Verdict:** 3 pages; the two calculators ship on `table` interims.

#### #1 Scale and coordinate systems

| Question type                                         | Page           | Mark          |
| ----------------------------------------------------- | -------------- | ------------- |
| ground distance from a map distance and scale         | main           | Solves        |
| great-circle distance between two places              | ~great-circle  | Solves (⏳ P3) |
| degrees–minutes–seconds to decimal degrees            | ~dms           | Solves        |

- **Main — BUILD `…#1`:** `doubleNumberLine` (map cm over ground m or km). Values: map distance
  (cm, 0.01–200), scale denominator (whole, 100–100,000,000), ground distance (m, unit menu km, mi).
  Relation: ground = map × denominator. Assumptions: the representative fraction has no units, so
  1 cm on the map is 24,000 cm on the ground at 1:24,000; a large scale shows a small area in detail.
  Example: 4.2 cm at 1:24,000 → 100,800 cm = 1,008 m. startWith map, denominator.
- **~great-circle — BUILD (⏳ P3 `globe` mode `route`; interim `none`):** values latitudes φ₁, φ₂ and
  longitudes λ₁, λ₂ (°), central angle c (°), distance d (km). Relations: cos c = sin φ₁ sin φ₂ +
  cos φ₁ cos φ₂ cos(λ₂ − λ₁); d = 6,371 × c × π ÷ 180. Assumptions: a sphere (within 0.5 % of the
  ellipsoid); the shortest route is an arc of a great circle, not a straight line on a Mercator map.
  Example: (40° N, 75° W) to (52° N, 0°) → cos c = 0.6286, c = 51.05°, d = 5,677 km.
- **~dms — BUILD (equation `{d}° {m}′ {s}″ = {x}°`, picture `none`):** values degrees (whole, 0–180),
  minutes (whole, 0–59), seconds (0–59.99), decimal degrees. Relation: x = d + m ÷ 60 + s ÷ 3,600.
  Example: 40° 26′ 46″ = 40.4461°.
- **Verdict:** 3 pages; every type Solves (the globe after P3).

#### #2 Thematic mapping

| Question type                                        | Page           | Mark   |
| ---------------------------------------------------- | -------------- | ------ |
| equal-interval class breaks; a value's class         | main           | Solves |
| rates, not counts, on a choropleth                   | ~normalize     | Solves |
| proportional-symbol radius                           | ~proportional  | Solves |
| best map type for a data set                         | ~map-types     | Solves |

- **Main — BUILD `…#2`:** `histogram` (the data's bins at the class breaks). Values: minimum, maximum,
  classes k (whole, 2–9), class width w, a value v, its class (derived, `floor((v − min) ÷ w) + 1`).
  Relation: w = (max − min) ÷ k. Assumptions: equal intervals suit evenly spread data; skewed data
  leaves most places in one class (quantiles fix that). Example: 12 to 92, 5 classes → w = 16;
  breaks 28, 44, 60, 76; v = 50 → class 3. startWith min, max, k.
- **~normalize — BUILD:** `bars` (counts and rates for two counties side by side). Values: cases and
  population in county A and in county B, rate per 100,000 in each. Relation: rate = 100,000 ×
  cases ÷ population. Example: 340 of 85,000 → 400; 900 of 450,000 → 200: fewer cases, twice the rate.
- **~proportional — BUILD:** `circle` (radius). Values: largest value, its symbol radius (mm), a
  value, its radius. Relation: r = r_max√(v ÷ v_max). Assumption: area, not radius, stands for the
  value. Example: 1,000,000 at 20 mm; 250,000 → 10 mm.
- **~map-types — BUILD (sort):** bins Choropleth, Dot density, Proportional symbol, Isarithmic,
  Flow. Cards: median income by county; farms, one dot per 100; city populations; temperature
  everywhere in a state; migrants moving between states; percent of homes with broadband; air
  pressure across a continent.
- **Verdict:** 4 pages; every type Solves.

#### #3 Map design

| Question type                                         | Page               | Mark   |
| ----------------------------------------------------- | ------------------ | ------ |
| color scheme for a data set                           | main               | Solves |
| visual variable for nominal or ordered data           | ~visual-variables  | Solves |

- **Main — BUILD `…#3` (sort):** bins Sequential, Diverging, Qualitative. Cards: elevation above sea
  level; percent change in population (+ and −); land-use classes; temperature anomaly from the
  1991–2020 mean; percent with broadband; languages spoken; votes for two parties as a margin; soil
  orders. Sentence: "Ordered data gets ordered lightness; data with a meaningful middle gets two hues."
- **~visual-variables — BUILD (sort):** bins Shows categories (nominal), Shows order or amount. Cards:
  hue; shape; texture pattern; lightness (value); size; color saturation.
- **Verdict:** 2 sorts; map design has no honest quantity at this level.

### Geographic Information Systems (GIS) — `he.geography.gis`

- **Prerequisite:** Cartography. **Refresh:** `m.10.coordinate-geometry`, `m.8` slope and Pythagorean
  pages (`m.8.slope`, `m.8.pythagorean`), the Grades 9–12 statistics pages.
- **Textbooks:** Campbell & Shin, Essentials of Geographic Information Systems; Penn State GEOG 586
  (geographic information analysis); DiBiase, The Nature of Geographic Information.

#### #0 Vector and raster data

| Question type                                           | Page          | Mark           |
| ------------------------------------------------------- | ------------- | -------------- |
| rows, columns, cells and file size of a raster          | main          | Solves (⏳ P25) |
| vector or raster for a data set                         | ~data-model   | Solves         |
| point, line or polygon for a feature at a scale         | ~geometry     | Solves         |

- **Main — BUILD `…#0`:** raster size. Picture: new `rasterGrid` (P25); interim `rectangle` with
  `grid` at a coarse cell. Values: extent width and height (km, 0.01–20,000), cell size c (m, 0.1–
  100,000), columns, rows, cells, bytes per cell (allowed 1, 2, 4, 8), file size (MB). Relations:
  columns = 1,000 × width ÷ c; rows likewise; cells = columns × rows; size = cells × bytes ÷ 10⁶.
  Assumptions: no compression; one band; halving the cell size makes four times the cells.
  Example: 30 km × 30 km at 30 m → 1,000 × 1,000 = 10⁶ cells × 2 bytes = 2 MB; at 10 m → 18 MB.
  startWith width, height, c, bytes.
- **~data-model — BUILD (sort):** bins Vector, Raster. Cards: road network; parcel boundaries;
  well locations; elevation everywhere; a satellite image; land surface temperature; addresses;
  rainfall surface from a radar.
- **~geometry — BUILD (sort):** bins Point, Line, Polygon. Cards: fire hydrants; a city on a world
  map; a river on a state map; bus routes; a lake on a county map; census tracts; a city on a street
  map of itself.
- **Verdict:** 3 pages; the main ships on its interim.

#### #1 Spatial analysis

| Question type                                         | Page       | Mark           |
| ----------------------------------------------------- | ---------- | -------------- |
| area of a polygon from its vertices                   | main       | Solves (⏳ P26) |
| area inside a buffer round a line or point            | ~buffer    | Solves (⏳ P26) |
| straight-line and grid (Manhattan) distance           | ~distance  | Solves         |

- **Main — BUILD `…#1`:** the shoelace formula. Picture: `coordinatePlane` option `polygon` (P26);
  interim `coordinatePlane` `plot` of the four points. Values: x₁, y₁ … x₄, y₄ (m, −10⁶–10⁶), area
  (m², ha by the menu). Relation: area = ½|x₁y₂ − x₂y₁ + x₂y₃ − x₃y₂ + x₃y₄ − x₄y₃ + x₄y₁ − x₁y₄|.
  Assumptions: vertices in order round the edge, which doesn't cross itself; projected coordinates
  in metres. Example: (0, 0), (500, 100), (400, 400), (100, 300) → ½ × (0 + 160,000 + 80,000 + 0)
  = 120,000 m² = 12 ha. 9 values; the vertices are the inputs.
- **~buffer — BUILD (⏳ P26 `buffer`):** values line length L (m), buffer radius r (m), area (m²).
  Relation: area = 2rL + πr² (round ends; a point buffer is L = 0). Example: 2 km road, 100 m →
  400,000 + 31,416 = 431,416 m² = 43.1 ha.
- **~distance — BUILD:** `coordinatePlane` `segment`. Values: Δx, Δy (km), straight-line distance,
  grid distance. Relations: d = √(Δx² + Δy²); grid = |Δx| + |Δy|. Example: (2, 3) to (8, 11) → 10
  and 14 km.
- **Verdict:** 3 calculators; the two area pages gain their pictures with P26.

#### #2 Geoprocessing

| Question type                                         | Page             | Mark           |
| ----------------------------------------------------- | ---------------- | -------------- |
| slope and aspect of a DEM cell                        | main             | Solves (⏳ P25) |
| weighted-overlay suitability score                    | ~weighted-overlay| Solves         |

- **Main — BUILD `…#2`:** slope from a 3 × 3 window. Picture: `rasterGrid` mode `window` (P25);
  interim `vectorDiagram` (the gradient's east and north parts). Values: cell size c (m), elevations
  east, west, north and south of the cell (m), east gradient, north gradient, slope (°), slope (%),
  aspect (° from north). Relations: east = (z_E − z_W) ÷ 2c; north = (z_N − z_S) ÷ 2c; slope =
  tan⁻¹√(east² + north²); aspect = the bearing downhill (atan2, E4). Assumptions: the centre cell's
  own height doesn't enter; aspect is the way the slope faces. Example: 10 m; 112, 100, 106, 98 →
  0.6 and 0.4, slope 35.8° (72.1 %), aspect 236° (south-west). 10 values.
- **~weighted-overlay — BUILD:** `bars` (each layer's weighted score stacked). Values: three weights
  (sum 1), three scores (1–5), suitability. Relation: S = w₁s₁ + w₂s₂ + w₃s₃. Example: 0.5, 0.3, 0.2
  with 4, 2, 5 → 3.6.
- **Verdict:** 2 calculators; the main ships on its interim.

#### #3 Spatial statistics

| Question type                                         | Page          | Mark           |
| ----------------------------------------------------- | ------------- | -------------- |
| nearest-neighbor index and its z-score                | main          | Solves (⏳ P27) |
| clustering from quadrat counts (variance ÷ mean)      | ~quadrat      | Solves         |
| mean center and standard distance                     | ~mean-center  | Solves (⏳ P26) |

- **Main — BUILD `…#3`:** nearest-neighbor analysis. Picture: `sample` option `pattern` (P27); interim
  `normalCurve` (the z-score). Values: points n (whole, 2–10,000), area A (km²), observed mean
  distance d̄ (km), expected mean distance (km), index R, standard error, z. Relations: expected =
  0.5 ÷ √(n ÷ A); R = d̄ ÷ expected; SE = 0.26136 ÷ √(n² ÷ A); z = (d̄ − expected) ÷ SE.
  Assumptions: R near 1 is random, toward 0 clustered, up to 2.15 dispersed; edge effects ignored.
  Example: 50 points in 100 km², d̄ = 0.9 km → expected 0.707, R = 1.27, SE 0.0523, z = 3.69:
  dispersed. startWith n, A, d̄.
- **~quadrat — BUILD:** `histogram` (quadrats by count). Values: quadrats m (whole), mean count,
  variance, VMR, chi-square. Relations: VMR = variance ÷ mean; χ² = (m − 1) × VMR. Example: 40
  quadrats, mean 2.5, variance 6.0 → VMR 2.4 (clustered), χ² = 93.6.
- **~mean-center — BUILD (⏳ P26 `points`):** values three points' x and y, mean center (x̄, ȳ),
  standard distance. Relations: x̄ = (x₁ + x₂ + x₃) ÷ 3; ȳ likewise; SD = √(Σ((x − x̄)² + (y − ȳ)²) ÷ 3).
  Example: (2, 1), (4, 5), (9, 3) → (5, 3), SD = √(34 ÷ 3) = 3.37.
- **Verdict:** 3 calculators; every type Solves on interims.

### Climatology — `he.geography.climatology`

- **Prerequisite:** Physical Geography. **Refresh:** `s.12.climate-systems` (and `~energy-balance`,
  `~feedbacks`, `~co2-record`), `s.11.modern-physics` (photons).
- **Textbooks:** Schmittner, Introduction to Climate Science (energy balance, greenhouse effect,
  circulation, variability, models); Stull ch. 2 and 11 (radiation, general circulation).

#### #0 Energy balance

| Question type                                          | Page    | Mark           |
| ------------------------------------------------------ | ------- | -------------- |
| surface temperature with a one-layer greenhouse        | main    | Solves (⏳ P13) |
| peak wavelength of the Sun's and Earth's radiation     | ~wien   | Solves         |
| balance temperature with no greenhouse                 | Refresh `s.12.climate-systems~energy-balance` | cross-listed |

- **Main — BUILD `…#0`:** `atmosphereLayers` mode `balance` with the `layer` option (P13; until then
  the mode draws Tₑ only). Values: sunlight S (W/m², 0–3,000), albedo α (0–1), absorbed F (W/m²),
  balance temperature Tₑ (K), layer emissivity ε (0–1), surface temperature T_s (K). Relations:
  F = S(1 − α) ÷ 4; Tₑ = (F ÷ σ)^(1/4); T_s = Tₑ(2 ÷ (2 − ε))^(1/4). Assumptions: one atmospheric
  layer, transparent to sunlight, absorbing a share ε of the infrared and sending half back down;
  ε = 1 gives T_s = 2^(1/4)Tₑ. Example: 1,361, 0.30 → F = 238.2, Tₑ = 254.6 K; ε = 0.78 → T_s =
  254.6 × 1.1315 = 288.1 K (15 °C). startWith S, α, ε.
- **~wien — BUILD:** `spectrum` with the peak marked. Values: temperature T (K, 3–50,000), peak
  wavelength λ_max (μm). Relation: λ_max = 2,898 ÷ T. Example: the Sun 5,772 K → 0.502 μm (visible);
  Earth 288 K → 10.1 μm (infrared), so greenhouse gases act on the outgoing light, not the sunlight.
- **Verdict:** 2 calculators; every type Solves.

#### #1 General circulation

| Question type                                            | Page        | Mark          |
| -------------------------------------------------------- | ----------- | ------------- |
| wind of air carried poleward keeping angular momentum    | main        | Solves (⏳ P3) |
| Coriolis parameter; inertial circle radius and period    | ~coriolis   | Solves        |
| which cell holds the trades, westerlies, ITCZ            | ~cells      | Solves        |

- **Main — BUILD `…#1`:** `globe` mode `momentum` (P3); interim `table` (φ = 10, 20, 30, 40° → u).
  Values: latitude φ (°, 0–60), Earth's rim speed ΩR (464.6 m/s), eastward wind u (m/s). Relation:
  u = ΩR sin²φ ÷ cos φ. Assumptions: air leaves the equator at rest with the ground and keeps its
  angular momentum, so it turns east as its distance from the axis shrinks; real Hadley flow loses
  some to friction and eddies. Example: 30° → 464.6 × 0.25 ÷ 0.866 = 134 m/s, far above the real
  subtropical jet (about 40 m/s), so the cell must end near 30°. startWith φ.
- **~coriolis — BUILD:** `vectorDiagram` (velocity and the Coriolis acceleration at 90° to it).
  Values: latitude φ, f (s⁻¹), speed U (m/s), inertial radius r (m), inertial period (h).
  Relations: f = 2Ω sin φ; r = U ÷ f; period = 2π ÷ f. Example: 45°, 0.2 m/s → f = 1.031 × 10⁻⁴,
  r = 1,939 m, period 16.9 h.
- **~cells — BUILD (sort; the explore of P33 later):** bins Hadley cell, Ferrel cell, Polar cell.
  Cards: trade winds; the ITCZ's rising air; subtropical deserts under sinking air; westerlies;
  mid-latitude storms; polar easterlies; air sinking over the poles.
- **Verdict:** 3 pages; the main ships on its table interim.

#### #2 Climate variability

| Question type                                            | Page       | Mark          |
| -------------------------------------------------------- | ---------- | ------------- |
| El Niño or La Niña from the Niño-3.4 index               | main       | Solves        |
| which orbital cycle (Milankovitch) from its description  | ~orbital   | Solves        |
| warming trend per decade from yearly anomalies           | ~trend     | Solves (⏳ E2) |

- **Main — BUILD `…#2` (observe, `min` −2, `guides` at +0.5 and −0.5 named "El Niño threshold",
  "La Niña threshold"):** columns are overlapping three-month seasons (JJA … FMA), the Niño-3.4 sea
  surface temperature anomaly (°C). A made-up event: +0.3, +0.6, +0.9, +1.2, +1.5, +1.6, +1.4, +1.0,
  +0.6. Pattern: "Five or more seasons in a row at +0.5 °C or above make an El Niño (here eight)."
- **~orbital — BUILD (sort):** bins Eccentricity, Obliquity, Precession. Cards: the orbit's shape
  changes, about 100,000 years; Earth's tilt swings between 22.1° and 24.5°; about 41,000 years;
  which season comes when Earth is nearest the Sun; about 23,000 years; the spin axis wobbles like a
  top.
- **~trend — BUILD (⏳ E2, a data list):** `scatter` with `leastSquares` over ten years of anomalies.
  Values: the list, slope (°C/yr), trend per decade. Relation: least-squares slope; per decade = 10 ×
  slope. Example (made up): 0.32, 0.41, 0.35, 0.47, 0.44, 0.52, 0.50, 0.58, 0.55, 0.63 °C → slope
  0.0308 °C/yr, 0.31 °C per decade.
- **Verdict:** 3 pages (1 calculator, 2 layouts); the trend waits on list values.

#### #3 Climate models

| Question type                                           | Page        | Mark   |
| ------------------------------------------------------- | ----------- | ------ |
| CO₂ forcing and equilibrium warming                     | main        | Solves |
| warming after t years of a slow response                | ~response   | Solves |
| warming with feedbacks from the no-feedback warming     | ~feedback   | Solves |
| cost of a finer model grid                              | ~grid       | Solves |

- **Main — BUILD `…#3`:** `functionGraph` log (ΔF against C). Values: starting CO₂ C₀ (ppm, 180–
  2,000; 280), CO₂ C (ppm), forcing ΔF (W/m²), sensitivity parameter λ (K per W/m², 0.3–1.5; 0.8),
  equilibrium warming ΔT (K). Relations: ΔF = 5.35 ln(C ÷ C₀); ΔT = λΔF. Assumptions: forcing grows
  with the log of CO₂, so each doubling adds the same 3.7 W/m²; λ includes the feedbacks. Example:
  560 ppm → 3.71 W/m², ΔT = 2.97 K. startWith C₀, C, λ.
- **~response — BUILD:** `functionGraph` exponential. Values: equilibrium warming ΔT_eq, response
  time τ (yr, 1–1,000), years t, warming ΔT(t). Relation: ΔT = ΔT_eq(1 − e^(−t/τ)). Assumption: one
  ocean layer with one time scale. Example: 3 K, τ 30 yr, t 30 yr → 1.90 K.
- **~feedback — BUILD:** `bars` (ΔT₀ beside ΔT). Values: no-feedback warming ΔT₀ (K), feedback factor
  f (0–0.95), warming ΔT, gain. Relations: ΔT = ΔT₀ ÷ (1 − f); gain = 1 ÷ (1 − f). Example: 1.2 K,
  f = 0.6 → 3.0 K (gain 2.5).
- **~grid — BUILD:** `table` (spacing 2°, 1°, 0.5°, 0.25° → boxes, cost). Values: grid spacing (°),
  levels (whole), columns, boxes, cost against a 1° grid. Relations: columns = (360 ÷
  spacing)(180 ÷ spacing); boxes = columns × levels; cost = (1 ÷ spacing)³ (the time step shrinks
  with the spacing). Example: 1°, 50 levels → 64,800 columns, 3.24 million boxes; halving the
  spacing costs 8 times as much.
- **Verdict:** 4 calculators; every type Solves.

### Remote Sensing — `he.geography.remote-sensing`

- **Prerequisite:** GIS. **Refresh:** `s.8.em-spectrum`, `s.11.modern-physics`,
  `s.11.circular-gravitation~orbit`.
- **Textbooks:** Natural Resources Canada, Fundamentals of Remote Sensing; the USGS Landsat data
  users handbook (radiance and reflectance); Penn State GEOG 883 (remote sensing image analysis).

#### #0 Electromagnetic radiation and sensors

| Question type                                         | Page          | Mark           |
| ----------------------------------------------------- | ------------- | -------------- |
| ground pixel size and swath from altitude and angles  | main          | Solves (⏳ P30) |
| frequency and photon energy of a band                 | ~wavelength   | Solves         |
| orbital period and orbits a day of a satellite        | ~orbit        | Solves         |
| spatial, spectral, radiometric or temporal resolution | ~resolutions  | Solves         |

- **Main — BUILD `…#0`:** sensor geometry. Picture: new `sensorGeometry` (P30); interim
  `triangleSolver` (half the swath over the altitude). Values: altitude H (km, 100–40,000),
  instantaneous field of view IFOV (μrad, 1–10,000), ground pixel (m), field of view FOV (°, 0.1–
  120), swath (km). Relations: pixel = 1,000 H × IFOV × 10⁻⁶ (H in km gives m); swath = 2H tan(FOV ÷ 2).
  Assumptions: looking straight down over flat ground; pixels at the swath's edges are larger.
  Example: 705 km, 42.5 μrad → 30.0 m; 15° → 185.6 km. startWith H, IFOV, FOV.
- **~wavelength — BUILD:** `spectrum` with `photon` (the band named). Values: wavelength λ (nm,
  10–10⁸), frequency f (Hz), photon energy E (eV). Relations: f = c ÷ λ; E = 1,240 ÷ λ. Example:
  850 nm (near infrared) → 3.53 × 10¹⁴ Hz, 1.46 eV.
- **~orbit — BUILD:** `circularMotion` mode `satellite` (central, r). Values: altitude H (km),
  orbit radius r (km), period T (min), orbits a day. Relations: r = 6,371 + H; T = 2π√(r³ ÷ GM) ÷ 60;
  orbits = 1,440 ÷ T. Example: 705 km → r = 7,076 km, T = 98.7 min, 14.6 orbits a day.
- **~resolutions — BUILD (sort):** bins Spatial, Spectral, Radiometric, Temporal. Cards: 30 m pixels;
  11 bands; 12 bits a pixel (4,096 levels); revisits every 16 days; a 0.5 m panchromatic band; a
  hyperspectral sensor with 200 narrow bands; images every 10 minutes from geostationary orbit;
  8-bit images with 256 levels.
- **Verdict:** 4 pages; every type Solves (main on its interim).

#### #1 Image processing

| Question type                                          | Page         | Mark           |
| ------------------------------------------------------ | ------------ | -------------- |
| linear contrast stretch of a pixel                     | main         | Solves         |
| radiance and top-of-atmosphere reflectance from DN     | ~reflectance | Solves         |
| NDVI of a pixel                                        | ~ndvi        | Solves (⏳ P31) |

- **Main — BUILD `…#1`:** `functionGraph` linear (output against input brightness, clipped at 0 and
  255). Values: pixel value DN (0–255), image minimum and maximum (DN), stretched value. Relation:
  out = 255(DN − min) ÷ (max − min), rounded and kept in 0–255. Assumptions: 8-bit display; values
  outside min–max saturate. Example: 70 in a 40–120 image → 95.6, shown as 96. startWith DN, min, max.
- **~reflectance — BUILD:** `table` (the steps' values). Values: DN, gain, offset, radiance L
  (W/(m²·sr·μm)), Earth–Sun distance d (AU, 0.983–1.017), solar irradiance ESUN (W/(m²·μm)), sun
  zenith θ_s (°, 0–85), reflectance ρ. Relations: L = gain × DN + offset; ρ = πLd² ÷ (ESUN cos θ_s).
  Example: 100, 0.8, −1.5 → 78.5; 1.0 AU, 1,550, 35° → ρ = 246.6 ÷ 1,269.7 = 0.194.
- **~ndvi — BUILD (⏳ P31 `spectralCurve`; interim `bars`):** values red and near-infrared reflectance
  (0–1), NDVI (−1–1). Relation: NDVI = (NIR − red) ÷ (NIR + red). Assumptions: healthy leaves reflect
  near infrared strongly and absorb red; water and bare soil give values near or below 0.2.
  Example: 0.45 and 0.08 → 0.37 ÷ 0.53 = 0.698.
- **Verdict:** 3 calculators; every type Solves.

#### #2 Classification

| Question type                                            | Page           | Mark           |
| -------------------------------------------------------- | -------------- | -------------- |
| overall, producer's and user's accuracy; kappa           | main           | Solves         |
| minimum-distance class of a pixel                        | ~min-distance  | Solves (⏳ P32) |
| supervised or unsupervised step                          | ~methods       | Solves         |

- **Main — BUILD `…#2`:** `table` `twoWay` (rows: classified forest, non-forest; columns: reference;
  the diagonal lit). Values: the four counts (whole), total N, overall accuracy OA (%), producer's
  accuracy for forest (%), user's accuracy for forest (%), chance agreement p_e, kappa κ. Relations:
  OA = 100(a + d) ÷ N; PA = 100a ÷ (a + c); UA = 100a ÷ (a + b); p_e = ((a + b)(a + c) + (c + d)(b +
  d)) ÷ N²; κ = (OA ÷ 100 − p_e) ÷ (1 − p_e). Example: 45, 10 (classified forest), 5, 40 → OA 85 %,
  PA 90 %, UA 81.8 %, p_e = 0.5, κ = 0.70. 10 values.
- **~min-distance — BUILD (⏳ P32; interim `coordinatePlane` with the points):** class means fixed in
  the assumptions (water red 0.05, NIR 0.03; vegetation 0.06, 0.45; soil 0.20, 0.28). Values: the
  pixel's red and NIR, its distance to each class mean. Relation: d = √((red − r̄)² + (NIR − n̄)²).
  Example: (0.10, 0.40) → 0.373, 0.064, 0.156: vegetation.
- **~methods — BUILD (sort):** bins Supervised, Unsupervised. Cards: the analyst draws training areas
  first; k-means groups pixels, then the analyst names the clusters; ISODATA; maximum likelihood with
  training statistics; a random forest trained on labeled points; the number of clusters is chosen
  before any labels exist.
- **Verdict:** 3 pages; every type Solves.

#### #3 Change detection

| Question type                                         | Page          | Mark   |
| ----------------------------------------------------- | ------------- | ------ |
| burn severity from pre- and post-fire NBR (dNBR)      | main          | Solves |
| percent and yearly rate of area change                | ~area-change  | Solves |

- **Main — BUILD `…#3`:** `bars` (NBR before, after and the difference; P31's `spectralCurve` beside
  it later). Values: NIR and SWIR before, NIR and SWIR after (0–1), NBR before, NBR after, dNBR.
  Relations: NBR = (NIR − SWIR) ÷ (NIR + SWIR); dNBR = NBR before − NBR after. Assumptions: burning
  drops near-infrared and raises shortwave-infrared reflectance; severity classes are thresholds
  (above 0.66 high, 0.44–0.66 moderate-high: in the caption, E5). Example: 0.40, 0.15 → 0.455; 0.20,
  0.25 → −0.111; dNBR = 0.566, moderate-high. 7 values.
- **~area-change — BUILD:** `percentBar` with `change` (total, direction). Values: area before A₁,
  area after A₂ (km²), years t, change (%), yearly rate r (%/yr). Relations: change = 100(A₂ − A₁) ÷
  A₁; r = 100 ln(A₂ ÷ A₁) ÷ t. Example: 1,200 to 1,050 km² in 10 yr → −12.5 %, −1.34 %/yr.
- **Verdict:** 2 calculators; every type Solves.
