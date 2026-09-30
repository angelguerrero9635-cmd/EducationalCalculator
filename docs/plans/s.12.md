# Direction plan: science grade 12 (Earth and space, 13 skills)

## Decisions

- **Notation.** Standard notation (Grades 9–12): letters with subscripts (vₚ, vₛ, T½ written `T`,
  N₀, H₀, λ₀), powers of ten as 4.47 × 10⁹, sentences of at most 35 words, at most 10 values a page.
  Every page keeps **rows**: `docs/EQUATION_INPUTS.md` keeps Earth and space science on rows (named
  quantities are the lesson), so no `equation` templates in this grade.
- **Units.** The registry has no km/s, hPa, K, °C, AU, Mpc, L☉, R☉, years, Ma or ppm. They stay
  fixed labels (`unit: 'km/s'` as text, no menu), as the drawn demos already do. Registry units are
  used where they exist: m, km, s, m/s, g, mL, cm³, g/cm³, mm, m³/s. See Engine need 1.
- **Layouts.** 36 of the 65 pages are layouts, in a new `src/data/modules/layouts/science12.ts`: sorts,
  sequences, explores and one observe. Main pages that are layouts: `s.12.minerals-rocks`
  (explore, mohsScale), `s.12.volcanoes-mountains` (explore, landforms), `s.12.surface-processes`
  (explore, landforms), `s.12.climate-systems` (explore, greenhouse), `s.12.resource-management`
  (sort, energy icons). The other 8 mains are calculators in `src/data/modules/science/12.ts`.
- **Start from demos.** Every page with a drawn demo starts with `node scripts/promote-demo.mjs
<demo> <page id>`; the demo's picture fields are kept, and its values, ranges, assumptions and
  example are replaced by the ones below.
- **Pilots.** There are no s.12 pages in `pilots.ts`, and none in the grade files. Nothing moves;
  every page is BUILD.
- **Not repeated from Grade 6.** `s.6.rock-cycle~rock-types` already sorts the three rock
  families and `s.6.plate-tectonics~boundaries` sorts the boundaries. Grade 12 goes one level
  deeper: igneous texture shows cooling rate, metamorphic foliation, and mountain building.
- **One card, one bin; one right order.** Every sort card below was checked for a single right
  bin, and every sequence for a single order. Cards whose answer depends on the source (hematite's
  luster, helium's origin, shell formation and CO₂) were left out on purpose.
- **Waiting pages.** 8 pages wait on a picture (listed under Engine needs). The other 57 can be built now.
- **A demo not in the brief.** `g.s12-solar-system-kepler` (kind `circularMotion`, mode
  `kepler`, H61, drawn, `galleryHsk.ts`) is the solar-system main. `g.s12-solar-system-comet`
  uses the same model, so it becomes that page's edge case and does not get its own page.

### 1. s.12.minerals-rocks — Minerals and rocks: properties and how they form

- **Standard:** HS-ESS2-1, HS-ESS2-3 (NGSS names no mineral PE; the content follows the textbooks).
- **Textbooks:** tarbuck-lutgens 2 (Matter and Minerals), 3 (Rocks).
- **Tests ask:** no released questions. The common types, each with the page that answers it:

  | Question (common type)                                           | Page            |        |
  | ---------------------------------------------------------------- | --------------- | ------ |
  | Unknown scratches glass, is scratched by a steel file: hardness? | main            | Solves |
  | Mass and water displacement: density, which mineral?             | ~density        | Solves |
  | Breaks along flat planes or curved surfaces?                     | ~cleavage       | Solves |
  | Silicate or not, from its name or formula                        | ~mineral-groups | Solves |
  | Large crystals or glass: how fast did it cool?                   | ~igneous        | Solves |
  | Foliated or not; parent rock                                     | ~metamorphic    | Solves |

- **Main — BUILD `s.12.minerals-rocks`:** explore, figure `mohsScale` (demo
  `g.s12-minerals-rocks-mohs`). Assumptions: "A mineral scratches every mineral below it on the
  scale and is scratched by those above it." "The scale ranks hardness only; the steps are not equal."
  Scenes:
  1. "The ten minerals", no `lit`: talc 1 to diamond 10.
  2. "Scratched by a coin, not a fingernail": `between: [2.5, 3.5]`, `lit: 3`; calcite fits.
  3. "Scratches glass, not a steel file": `between: [5.5, 6.5]`, `lit: 6`; feldspar.
  4. "Scratches glass and steel": `lit: 7`; quartz.
  5. "How far apart the ranks are": `absolute: true`. Diamond is about four times as hard as
     corundum, but only one rank above it.
- **~density — BUILD:** calculator, picture `gradCylinder` { before: 'a', after: 'b', volume: 'V', max: 100 }.
  - Values:
    - m, mass, g, 0.1–500;
    - V₁, water before, mL, 0–90;
    - V₂, water after, mL, 1–100, constraint V₂ > V₁;
    - V, volume, cm³, 0.1–100;
    - ρ, density, g/cm³, 1–20.
  - Relations: V = V₂ − V₁; ρ = m ÷ V.
  - Assumptions: "1 mL of water displaced = 1 cm³ of mineral." "The sample sinks and has no air
    pockets." "Density is a clue, not proof: compare it with hardness and streak too."
  - Example: m = 26.5 g, V₁ = 50.0 mL, V₂ = 60.0 mL → V = 10.0 cm³, ρ = 2.65 g/cm³ (quartz's density).
  - startWith m, V₁, V₂.
- **~mineral-groups — BUILD:** sort. Question: "Is it a silicate?"
  - Bins: "Silicate (built on silicon and oxygen)" and "Not a silicate".
  - Cards (icons from demo `g.s12-minerals-rocks-luster`):
    - quartz (SiO₂), feldspar, mica → silicate;
    - calcite (CaCO₃), halite (NaCl), pyrite (FeS₂), hematite (Fe₂O₃) → not a silicate.
  - Hematite stays off the luster demo's metallic/nonmetallic bins: it can be either.
- **~cleavage — BUILD:** sort (demo `g.s12-minerals-rocks-cleavage`). Question: "How does it break?"
  - Bins: "Cleavage (flat planes)" and "Fracture (uneven or curved)".
  - Cards:
    - mica (one direction), feldspar (two at 90°), halite (three at 90°), calcite (three, not
      at 90°) → cleavage;
    - quartz (curved, conchoidal), pyrite, hematite → fracture.
- **~igneous — BUILD:** sort. Question: "Where did this rock cool?"
  - Bins: "Slowly, underground (intrusive)" and "Quickly, at the surface (extrusive)".
  - Cards (texture): granite (crystals), gabbro (crystals), diorite (crystals), peridotite
    (crystals) → intrusive; basalt (fine), rhyolite (fine), andesite (fine), obsidian (glassy),
    pumice (holes) → extrusive.
  - Porphyritic rocks are left out: they cooled in two stages.
- **~metamorphic — BUILD:** sort. Question: "Are the minerals lined up?"
  - Bins: "Foliated" and "Nonfoliated".
  - Cards: "Slate, from shale" (layers), "Schist, from slate" (layers), "Gneiss, from granite"
    (bands) → foliated; "Marble, from limestone" (crystals), "Quartzite, from sandstone"
    (grains), "Hornfels, from shale baked by magma" (fine) → nonfoliated.
- **Verdict:** 6 pages (1 calculator, 5 layouts). Covers every common type; no released questions.

### 2. s.12.earth-interior — Earthquakes, seismic waves and Earth's interior

- **Standard:** HS-ESS2-3, HS-ESS1-5, HS-ESS3-1.
- **Textbooks:** tarbuck 4, 5, 6; openstax-astronomy 8; openscied-hs 11.P.2; savvas-experience-hs 11.9.
- **Tests ask:**

  | Question                                             | Page                                        |                |
  | ---------------------------------------------------- | ------------------------------------------- | -------------- |
  | NAEP-2005-12S13-#10 (why three stations)             | ~epicenter                                  | Solves         |
  | NAEP-2019-12S7-#16 (internal heat → hot springs)     | ~heat-sources                               | Solves         |
  | NAEP-2019-12S7-#3 (convection pulls plates)          | volcanoes ~mountain-building (mantle scene) | Solves         |
  | NAEP-2000-12S11-#5 (mountains at a subduction coast) | volcanoes ~mountain-building                | Solves         |
  | NAEP-2005-12S14-#3 (rift valley widens)              | volcanoes ~mountain-building                | Solves         |
  | NAEP-2009-12S9-#17 (folded layers)                   | volcanoes ~deformation                      | Solves         |
  | (common) S − P lag of 100 s: distance?               | main                                        | Solves         |
  | (common) Why no S waves past 104°?                   | ~shadow-zone                                | Solves         |
  | (common) Magnitude 6 vs 4: how much more shaking?    | ~magnitude                                  | Waits (need 2) |

  NAEP-2000-12S11-#5, NAEP-2005-12S14-#3 and NAEP-2009-12S9-#17 are about mountain building:
  `[data] → s.12.volcanoes-mountains`.

- **Main — BUILD `s.12.earth-interior`:** calculator, picture `earthLayers` { mode: 'seismogram',
  km: 'd', vp: 'vp', vs: 'vs', lag: 'L' } (demo `g.s12-earth-interior-seismogram`).
  - Values:
    - d, distance to the focus, km, 0–10,000;
    - vₚ, P-wave speed, km/s, 4–14;
    - vₛ, S-wave speed, km/s, 2–8, constraint vₛ < vₚ;
    - tₚ, P arrival, s, derived;
    - tₛ, S arrival, s, derived;
    - L, S − P lag, s, 0–1,500.
  - Relations: tₚ = d ÷ vₚ; tₛ = d ÷ vₛ; L = tₛ − tₚ, so d = L ÷ (1/vₛ − 1/vₚ).
  - Assumptions: "S waves are slower, so the lag grows with distance." "Average speeds of 6 and
    3.5 km/s are for the crust; real travel-time curves bend because deeper rock is faster."
    "One station gives a distance, not a direction."
  - Example: vₚ = 6 km/s, vₛ = 3.5 km/s, L = 100 s → d = 840 km, tₚ = 140 s, tₛ = 240 s
    (check: 840 ÷ 3.5 = 240, 240 − 140 = 100).
  - startWith L, vₚ, vₛ.
- **~epicenter — BUILD:** calculator, picture `earthLayers` { mode: 'epicenter', stations:
  [{ name: '1', x: 0, y: 0, r: 'd1' }, { name: '2', x: 168, y: 210, r: 'd2' }, { name: '3',
  x: 336, y: 0, r: 'd3' }] } (demo `g.s12-earth-interior-epicenter`).
  - Values: L₁, L₂, L₃ (lags, s, 0–120); d₁, d₂, d₃ (km, 0–1,000); k (km per s of lag), derived,
    fixed at 8.4.
  - Relations: dᵢ = k × Lᵢ, with k = 1 ÷ (1/3.5 − 1/6) = 8.4.
  - Assumptions: "Each distance is a circle round its station." "Two circles meet at two points;
    the third picks one." "The stations must not lie in one line."
  - Example: L₁ = 25 s, L₂ = 10 s, L₃ = 25 s → d₁ = 210 km, d₂ = 84 km, d₃ = 210 km. All three
    circles meet at (168, 126) km: 42 × √(4² + 3²) = 210, and 210 − 126 = 84.
  - startWith L₁, L₂, L₃.
- **~shadow-zone — BUILD:** calculator, picture `earthLayers` { mode: 'section', distance: 'D' }
  (demos `g.s12-earth-interior-shadow-zone`, `…-shadow-direct`, `…-shadow-core`, `…-shadow-edge`).
  - Values: Δ, angle from the focus, °, 0–180; s, distance along the surface, km.
  - Relation: s = Δ × π × 6,371 ÷ 180.
  - Assumptions: "P waves arrive directly out to 104°, then not again until 140°." "S waves stop at
    104° because they cannot cross the liquid outer core." "The outer core starts 2,890 km down."
  - Example: Δ = 120° → s = 13,343 km. The station is in the P shadow zone and gets no S waves.
  - startWith Δ.
- **~wave-types — BUILD:** sort. Question: "Which wave is it?"
  - Bins: "P wave", "S wave", "Surface wave".
  - Cards:
    - "Arrives first", "Squeezes and stretches rock along its path", "Crosses the liquid outer
      core" → P wave;
    - "Arrives second", "Shakes rock across its path", "Stopped by liquid" → S wave;
    - "Travels along the ground and arrives last", "Causes most damage to buildings" → surface wave.
- **~heat-sources — BUILD:** sort. Question: "What powers it?"
  - Bins: "Earth's internal heat" and "Energy from the Sun".
  - Cards:
    - hot springs, a geyser, lava from a volcano, mantle convection moving plates, magma cooling
      into granite → internal heat;
    - wind, evaporation from the ocean, a hurricane, surface ocean currents, a glacier melting in
      summer → the Sun.
- **~magnitude — BUILD (waits on need 2):** calculator.
  - Values: M₁, M₂ (0–10); ΔM = M₂ − M₁; A, amplitude ratio = 10^ΔM; E, energy ratio = 10^(1.5 ΔM).
  - Example: M₁ = 4.0, M₂ = 6.0 → ΔM = 2, A = 100, E = 1,000.
- **~spreading-rate — BUILD (waits on need 3):** calculator.
  - Values: x, distance from the ridge, km; t, rock age, million years; v = x ÷ t, km per million
    years = mm/yr; w = 2v, the full spreading rate.
  - Example: x = 100 km, t = 4 million years → v = 25 mm/yr, w = 50 mm/yr.
  - It sits here because tarbuck 4 (plate tectonics) is on this skill's crosswalk row.
- **Verdict:** 7 pages (5 now, 2 waiting). Covers all 6 released items (3 on another skill's page)
  and the common types.

### 3. s.12.volcanoes-mountains — Volcanoes, crustal deformation and mountain building

- **Standard:** HS-ESS2-1, HS-ESS2-3, HS-ESS3-1.
- **Textbooks:** tarbuck 6 (Volcanoes), 7 (Crustal Deformation and Mountain Building).
- **Tests ask:** no released questions of its own. It takes three NAEP items from earth-interior
  (see there), and common types:

  | Question                                                     | Page               |        |
  | ------------------------------------------------------------ | ------------------ | ------ |
  | NAEP-2009-12S9-#17 (folds)                                   | ~deformation       | Solves |
  | NAEP-2000-12S11-#5, NAEP-2005-12S14-#3, NAEP-2019-12S7-#3    | ~mountain-building | Solves |
  | (common) Which volcano is steep and explosive, and why?      | main               | Solves |
  | (common) Silica and gas → eruption style                     | ~magma             | Solves |
  | (common) Hanging wall dropped: which fault and which stress? | ~deformation       | Solves |

- **Main — BUILD `s.12.volcanoes-mountains`:** explore, figure `landforms` (demo
  `g.s12-volcanoes-mountains-volcanoes`). Assumptions: "Silica makes magma sticky; sticky magma
  traps gas." "Trapped gas makes eruptions explosive." Scenes:
  - "Shield volcano" (shield): runny basalt flows spread thin, building gentle slopes, as on Hawaii.
  - "Composite volcano" (composite): layers of sticky lava and ash, steep sides, explosive eruptions.
  - "Cinder cone" (cinderCone): a small steep cone of cinders; lava leaks from its base.
- **~deformation — BUILD:** explore, figure `landforms` (demo `g.s12-volcanoes-mountains-deformation`).
  Assumptions: "Compression shortens rock, tension stretches it, shear slides it sideways." Scenes:
  - "Folds" (folds): slow compression bends layers into anticlines and synclines.
  - "Normal fault" (normalFault): tension; the hanging wall drops.
  - "Reverse fault" (reverseFault): compression; the hanging wall is pushed up.
  - "Strike-slip fault" (strikeSlip): shear, as on the San Andreas; a fence is offset.
- **~magma — BUILD:** sort. Question: "Which magma does this describe?"
  - Bins: "Low silica (basaltic)" and "High silica (andesitic to rhyolitic)".
  - Cards:
    - "Runny lava that flows far", "Gas escapes easily", "Builds broad shield volcanoes",
      "Erupts at mid-ocean ridges and hot spots" → low silica;
    - "Sticky lava that traps gas", "Explosive eruptions of ash and pumice", "Builds steep
      composite volcanoes", "Forms above subduction zones" → high silica.
- **~mountain-building — BUILD:** explore, the Grade 6 figure `plates` with Grade 12 lines.
  Assumptions: "Mantle convection and the pull of sinking slabs move the plates." Scenes:
  - "Subduction" (`subduction`): the ocean plate sinks, melts at depth and builds a volcanic arc
    and coastal mountains.
  - "Collision" (`collision`): neither plate sinks; the crust folds and thickens into ranges
    like the Himalayas.
  - "Rift" (`rift`): the crust stretches on normal faults; the valley widens and deepens, and the
    sea may flood it.
  - "Ridge and mantle" (`divergent`, `mantle: true`): convection currents under the plates pull
    them apart.
- **Verdict:** 4 layout pages. Covers the 4 NAEP items on mountains and folds and the common types.

### 4. s.12.surface-processes — Weathering, erosion, groundwater, glaciers and wind

- **Standard:** HS-ESS2-1, HS-ESS2-2, HS-ESS2-5.
- **Textbooks:** tarbuck 8 (Weathering, Soil, Mass Movement), 9 (Running Water and Groundwater),
  10 (Glaciers, Deserts, Wind).
- **Tests ask:** no released questions. Common types:

  | Question (common)                                   | Page                 |                |
  | --------------------------------------------------- | -------------------- | -------------- |
  | Which agent carved a U-shaped valley?               | main, ~agents        | Solves         |
  | Frost wedging or oxidation: mechanical or chemical? | ~weathering          | Solves         |
  | Where is the water table; why does a well go dry?   | main (aquifer scene) | Solves         |
  | Width, depth and speed of a stream: discharge?      | ~discharge           | Waits (need 4) |

- **Main — BUILD `s.12.surface-processes`:** explore, figure `landforms` (demo
  `g.s12-surface-processes-landforms`). Assumptions: "Weathering breaks rock in place; erosion
  carries it away." "Water, ice and wind each leave their own shapes." Scenes:
  - "River valley" (vValley): a stream cuts down, and the slopes slide in.
  - "Glacial valley" (uValley): ice scrapes the floor and walls wide.
  - "Meander" (meander): fastest water erodes the cut bank and slow water drops a point bar;
    a cut-off loop leaves an oxbow lake.
  - "Aquifer" (aquifer): water fills the pores below the water table; pumping faster than
    rain refills it lowers the table.
  - "Dunes" (dunes): wind bounces sand up the gentle side, and it slides down the 33° slip face.
- **~weathering — BUILD:** sort. Question: "How does this break rock down?"
  - Bins: "Mechanical (pieces, same minerals)" and "Chemical (new substances)".
  - Cards:
    - frost wedging, roots growing in cracks, salt crystals growing, sheets peeling off as
      rock above erodes → mechanical;
    - carbonic acid dissolving limestone, iron minerals rusting, feldspar turning to clay,
      acid rain on marble → chemical.
- **~agents — BUILD:** sort. Question: "What made this landform?"
  - Bins: "Running water or groundwater", "Glacier ice", "Wind".
  - Cards:
    - V-shaped valley, delta, oxbow lake, limestone cave → water;
    - U-shaped valley, moraine, cirque, erratic boulder → ice;
    - sand dune, loess, desert pavement, ventifact → wind.
- **~discharge — BUILD (waits on need 4):** calculator.
  - Values: w, width, m; d, depth, m; v, speed, m/s; A = w × d, m²; Q = A × v, m³/s.
  - Example: w = 12 m, d = 1.5 m, v = 0.8 m/s → A = 18 m², Q = 14.4 m³/s.
- **Verdict:** 4 pages (3 now). Covers the common types; no released questions.

### 5. s.12.radiometric-dating — Geologic time and radiometric dating

- **Standard:** HS-ESS1-5, HS-ESS1-6, HS-PS1-8.
- **Textbooks:** tarbuck 11, 12; openstax-astronomy 9, 14; openstax-chemistry 21; openstax-physics
  22; glencoe-hs 24 (grade 10), 30 (grade 11); savvas-experience-hs 17 (grade 10), 15 (grade 11);
  openscied-hs 11.P.2.
- **Tests ask:**

  | Question                                           | Page            |                                          |
  | -------------------------------------------------- | --------------- | ---------------------------------------- |
  | NAEP-2000-12S11-#3 (C-14, 25 % left)               | main            | Solves (T range takes 5,700; n = 2)      |
  | NAEP-2009-12S9-#3 (meteorites date Earth)          | ~uranium        | Solves (assumption)                      |
  | NAEP-2005-12S13-#4 (older rock nearer the surface) | ~relative-order | Partly: needs an uplift or fold stage    |
  | NAEP-2005-12S11-#3 (same fossil, two continents)   | ~bracket        | Partly: correlation is only in the lines |
  | NAEP-2019-12S7-#7 (oxygen and red beds)            | ~time-scale     | Partly                                   |
  | (common) Parent-to-daughter ratio 1 : 3: age?      | ~uranium        | Solves                                   |

  NAEP-2019-12S7-#7 is filed under climate: `[data] → s.12.radiometric-dating` (Earth's history).

- **Main — BUILD `s.12.radiometric-dating`:** calculator, picture `decayChart` { halfLife: 'T',
  time: 't', start: 100, left: 'p', halves: 'n', parent: 'C-14', daughter: 'N-14' } (demo
  `g.s12-radiometric-dating-carbon`).
  - Values:
    - T, half-life, years, 5,000–6,000;
    - t, age, years, 0–60,000;
    - n, half-lives, derived;
    - p, C-14 left, %, 0.1–100;
    - q, C-14 decayed, %, derived.
  - Relations: n = t ÷ T; p = 100 × 0.5^n; q = 100 − p.
  - Assumptions: "Living things keep the same C-14 level as the air; decay starts when they die."
    "After about 50,000 years too little is left to measure." "Only for once-living material."
  - Example: T = 5,730 years, p = 12.5 % → n = 3, t = 17,190 years, q = 87.5 %.
  - startWith p, T.
- **~uranium — BUILD:** calculator, picture `decayChart` (demo
  `g.s12-radiometric-dating-uranium`, parent U-238, daughter Pb-206).
  - Values:
    - T = 4.47 × 10⁹ years (`allowed: [4.47e9]`);
    - R, daughter-to-parent ratio, 0–15;
    - p, U-238 left, %;
    - n, half-lives;
    - t, years, 0–1.6 × 10¹⁰.
  - Relations: p = 100 ÷ (1 + R); p = 100 × 0.5^n; t = n × T.
  - Assumptions: "The rock started with no lead-206 and lost none." "Most surface rocks were
    melted or weathered since Earth formed. Meteorites were not, so they date the solar system."
  - Example: R = 1 → p = 50 %, n = 1, t = 4.47 × 10⁹ years (a meteorite). Check R = 3: p = 25 %,
    n = 2, t = 8.94 × 10⁹ years.
  - startWith R.
- **~bracket — BUILD:** calculator, picture `rockLayers` with `dating` (demo
  `g.s12-radiometric-dating-bracket`).
  - Layers: sandstone (ammonite), ash (age u), shale (ammonite, bracketed), ash (age t, sampled),
    limestone.
  - Values:
    - T = 704 million years (U-235 → Pb-207, `allowed: [704]`);
    - P, U-235 left in the lower ash, %, 50–100;
    - n, half-lives;
    - t, lower ash age, Ma, 0–704;
    - u, upper ash age, Ma, constraint u < t.
  - Relations: P = 100 × 0.5^n; t = n × T.
  - Assumptions: "Ash layers can be dated; sandstone and shale cannot." "A layer between two dated
    ash beds is younger than the one below and older than the one above." "The same index fossil
    marks rock of the same age anywhere."
  - Example: P = 93.3 % → n = 0.100, t = 70.4 Ma; u = 66.0 Ma, so the shale is 66.0–70.4 million
    years old.
  - Do not use the demo's K-40 → Ar-40 sample: only about 11 % of K-40 atoms become argon (need 9).
- **~relative-order — BUILD:** sequence. Question: "A cliff has limestone at the bottom, then shale,
  then sandstone. A dike cuts all three and ends at an eroded surface under a lava flow. Put the
  events in order."
  - Stages, with rock card figures: "Limestone is laid down" (shells), "Shale is laid down"
    (layers), "Sandstone is laid down" (grains), "Magma cuts through as a dike" (crystals),
    "Erosion cuts the top flat", "Lava flows over the eroded surface" (fine).
  - Assumptions: "Superposition: lower layers are older unless folded or overturned."
    "Cross-cutting: a rock is younger than what it cuts." "An eroded surface is a gap in the record."
- **~time-scale — BUILD:** sequence with spans (unit "million years", total 4,600).
  - Stages and spans:
    - "Precambrian: Earth forms; oxygen builds up and iron rusts into red beds", 4,059;
    - "Paleozoic: shelled animals, fish, the first land plants", 289;
    - "Mesozoic: dinosaurs; ends with an asteroid impact", 186;
    - "Cenozoic: mammals spread; humans appear", 66.
  - Check: 4,059 + 289 + 186 + 66 = 4,600.
- **Verdict:** 5 pages (3 calculators, 2 sequences). 2 of the 5 released items Solve and 3 are
  Partly. For NAEP-2005-12S13-#4, a later round adds a "Layers are folded and pushed up" stage to
  a second sequence.

### 6. s.12.ocean-atmosphere — The ocean: seafloor, currents and ocean–atmosphere interaction

- **Standard:** HS-ESS2-4, HS-ESS2-5, HS-ESS1-4 (tides).
- **Textbooks:** tarbuck 14, 15, 16, 18; openstax-astronomy 4 (tides); openscied-hs 10.C.1;
  savvas-experience-hs 10.10, 10.14.
- **Tests ask:**

  | Question                                                | Page                |                                          |
  | ------------------------------------------------------- | ------------------- | ---------------------------------------- |
  | NAEP-2000-12S11-#4 (warm air rises at the equator)      | ~density            | Solves                                   |
  | NAEP-2005-12S13-#11 (design an oil-spill experiment)    | none                | No: experimental design, not in any page |
  | (common) Sonar echo of 6 s: depth?                      | main                | Solves                                   |
  | (common) Spring or neap tide at first quarter?          | ~tides              | Solves                                   |
  | (common) Why the west side of a basin has warm currents | ~currents           | Solves                                   |
  | (common) What drives the deep conveyor?                 | ~currents, ~density | Solves                                   |

  NAEP-2000-12S11-#4 is about air: `[data] → s.12.atmosphere-weather`.

- **Main — BUILD `s.12.ocean-atmosphere`:** calculator, picture `oceanProfile` { mode: 'profile',
  depth: 'd', over: 'plain' } (demo `g.s12-ocean-atmosphere-sonar`; the ridge and trench demos
  are edge cases).
  - Values: v, speed of sound in seawater, m/s, 1,450–1,550; t, echo time, s, 0–15; d, depth,
    m, 0–11,000.
  - Relation: d = v × t ÷ 2.
  - Assumptions: "The ping goes down and back, so halve the path." "Sound travels about 1,500 m/s
    in seawater." "The shelf is under 200 m and trenches reach almost 11,000 m."
  - Example: v = 1,500 m/s, t = 6.0 s → d = 4,500 m (the abyssal plain).
  - startWith t, v.
- **~tides — BUILD:** calculator, picture `oceanProfile` { mode: 'tides', angle: 'A', range: 'R' }
  (demos `g.s12-ocean-atmosphere-tides`, `…-tides-neap`, `…-tides-full`).
  - Values: θ, Moon's angle from the Sun, °, 0–180; m, range from the Moon alone, m, 0.1–10;
    R, tidal range, m.
  - Relation: R = m × √(1 + 0.46² + 2 × 0.46 × cos(2θ)).
  - Assumptions: "The Sun's tidal pull is 0.46 of the Moon's." "In line (new or full Moon): spring
    tides; at right angles (quarter Moon): neap tides." "Coastlines make real ranges differ."
  - Example: m = 2.0 m, θ = 90° → R = 2.0 × √0.2916 = 1.08 m (neap). At θ = 0°, R = 2.92 m.
  - startWith θ, m.
- **~currents — BUILD:** explore, figure `oceanCurrents` (demo `g.s12-ocean-atmosphere-currents`).
  Scenes:
  - "Gyres" (gyres): trade winds and westerlies push surface water; the Coriolis effect turns the
    flow into gyres, clockwise in the north.
  - "Warm and cold sides" (gyres): warm water flows poleward on each basin's west side; cold
    water flows back on the east.
  - "The conveyor" (conveyor): cold, salty water sinks near Greenland and Antarctica and creeps
    through the deep ocean for about 1,000 years.
- **~density — BUILD:** sort. Question: "Does it sink or rise compared with what is around it?"
  - Bins: "Sinks (denser)" and "Rises or stays on top (less dense)".
  - Cards:
    - cold, salty water near Greenland; seawater left saltier as sea ice forms; cold air over
      the poles → sinks;
    - warm tropical surface water; fresh river water entering the sea; warm, moist air over the
      equator → rises.
- **Verdict:** 4 pages (2 calculators, 2 layouts). 1 released item Solves; the design item is out
  of scope.

### 7. s.12.atmosphere-weather — The atmosphere: structure, air pressure, wind and severe weather

- **Standard:** HS-ESS2-4, HS-ESS2-5, HS-ESS3-1.
- **Textbooks:** tarbuck 8, 10, 16, 17, 18, 19; openstax-astronomy 6, 8, 10, 11, 15.
- **Tests ask:** no released questions filed here. It takes these three:

  | Question                                                               | Page               |                                     |
  | ---------------------------------------------------------------------- | ------------------ | ----------------------------------- |
  | NAEP-2005-12S11-#9 (nitrogen and oxygen), from climate                 | main (assumption)  | Solves                              |
  | NAEP-2005-12S11-#6 (ozone and UV), from climate                        | main (ozone scene) | Partly: the figure has no UV arrows |
  | NAEP-2000-12S11-#4 (convection), from ocean                            | ocean ~density     | Solves                              |
  | (common) Ground 20 °C: temperature at 8 km?                            | main               | Solves                              |
  | (common) Isobars and the pressure gradient; wind direction round a low | ~pressure          | Solves                              |
  | (common) Relative humidity from vapor and capacity                     | ~humidity          | Solves                              |
  | (common) Stages of a hurricane                                         | ~hurricane         | Solves                              |

  NAEP-2005-12S11-#9 and NAEP-2005-12S11-#6 are about the atmosphere, not climate change:
  `[data] → s.12.atmosphere-weather`.

- **Main — BUILD `s.12.atmosphere-weather`:** calculator, picture `atmosphereLayers` { mode:
  'profile', altitude: 'h', temperature: 'T', ground: 'T0' } (demo `g.s12-atmosphere-weather-layers`;
  tropopause and hot-day demos are edge cases).
  - Values: T₀, ground temperature, °C, −40–50; h, altitude, km, 0–11; T, temperature at h, °C,
    −90–50.
  - Relation: T = T₀ − 6.5 × h.
  - Assumptions: "Air is 78 % nitrogen and 21 % oxygen." "The troposphere cools about 6.5 °C per km
    up to about 11 km." "Above that, ozone in the stratosphere absorbs the Sun's UV and warms the air."
  - Example: T₀ = 20 °C, h = 8 km → T = 20 − 52 = −32 °C.
  - startWith T₀, h.
- **~pressure — BUILD:** calculator, picture `atmosphereLayers` { mode: 'pressure', high: 'H',
  low: 'Lw', distance: 'D' } (demo `g.s12-atmosphere-weather-pressure`; `-south` and `-weak` as
  edge cases).
  - Values:
    - H, high, hPa, 1,000–1,050;
    - L, low, hPa, 900–1,020, constraint L < H;
    - ΔP, derived;
    - D, distance between the centers, km, 100–3,000;
    - G, gradient, hPa per 100 km.
  - Relations: ΔP = H − L; G = ΔP ÷ D × 100.
  - Assumptions: "Wind blows from high to low, faster where isobars are closer." "The Coriolis
    effect turns it right in the Northern Hemisphere, so it circles a low counterclockwise."
    "Friction near the ground turns it partway back toward the low."
  - Example: H = 1,024 hPa, L = 996 hPa, D = 700 km → ΔP = 28 hPa, G = 4.0 hPa per 100 km.
  - startWith H, L, D.
- **~humidity — BUILD:** calculator, picture `percentBar` { percent: 'RH', part: 'w', whole: 'ws' }.
  - Values: w, water vapor, g/kg, 0–40; wₛ, capacity at this temperature, g/kg, 0.1–40; RH, %, 0–100.
  - Relation: RH = w ÷ wₛ × 100.
  - Assumptions: "Warm air can hold more water vapor than cold air." "Cooling the air raises RH
    without adding water." "At 100 % the air is at its dew point."
  - Example: w = 6 g/kg, wₛ = 15 g/kg (about 20 °C) → RH = 40 %.
  - startWith w, wₛ.
- **~hurricane — BUILD:** sequence.
  - Stages:
    1. "Thunderstorms cluster over ocean water warmer than about 27 °C";
    2. "Tropical depression: winds circle a low, under 63 km/h";
    3. "Tropical storm: winds 63–118 km/h; it gets a name";
    4. "Hurricane: winds of 119 km/h or more; an eye forms";
    5. "Landfall: cut off from warm water, it weakens".
- **~air-masses — BUILD:** sort. Question: "Which air mass is this?"
  - Bins: "Continental polar (cP)", "Maritime polar (mP)", "Maritime tropical (mT)",
    "Continental tropical (cT)".
  - Cards:
    - "Cold and dry, from northern Canada", "Brings lake-effect snow" → cP;
    - "Cool and damp, from the North Pacific", "Brings drizzle to the Pacific Northwest" → mP;
    - "Warm and humid, from the Gulf of Mexico", "Brings summer thunderstorms to the Southeast" → mT;
    - "Hot and dry, from the deserts of northern Mexico", "Brings heat waves to the southern
      Plains" → cT.
- **~cloud-base — BUILD (waits on need 5):** calculator.
  - Values: T and T_d (°C); h = (T − T_d) ÷ 8 km. A rising parcel cools 10 °C per km, and its dew
    point falls 2 °C per km.
  - Example: T = 24 °C, T_d = 12 °C → h = 1.5 km.
- **Verdict:** 6 pages (5 now, 1 waiting). Covers 3 released items taken from other skills (2
  Solve, 1 Partly) and the common types.

### 8. s.12.climate-systems — Climate systems, feedbacks and climate change

- **Standard:** HS-ESS2-2, HS-ESS2-4, HS-ESS2-6, HS-ESS3-5, HS-ESS3-6.
- **Textbooks:** tarbuck 16, 20; openstax-astronomy 8, 10; openstax-biology 44 (grade 9);
  openscied-hs 10.C.1; savvas-experience-hs 10.10, 10.11.
- **Tests ask:**

  | Question                                                 | Page                         |                                       |
  | -------------------------------------------------------- | ---------------------------- | ------------------------------------- |
  | NAEP-2005-12S11-#2 (temperate zones)                     | ~zones                       | Solves                                |
  | NAEP-2009-12S9-#8 (carbon into sugars)                   | ~carbon                      | Solves                                |
  | NAEP-2009-12S9-#9 (carbon out of the crust by volcanoes) | ~carbon                      | Solves                                |
  | NAEP-2019-12S7-#13 (what releases CO₂)                   | ~carbon                      | Solves                                |
  | NAEP-2009-12S9-#12 (smoke and ash cool Earth)            | main ("Ash and smoke" scene) | Partly: the figure draws no particles |
  | NAEP-2005-12S11-#6, #9                                   | atmosphere main              | see there                             |
  | NAEP-2019-12S7-#7                                        | radiometric ~time-scale      | see there                             |
  | (common) Ice melts, and then? (positive feedback)        | ~feedbacks                   | Solves                                |
  | (common) Read the CO₂ record: rate per decade            | ~co2-record                  | Solves                                |

- **Main — BUILD `s.12.climate-systems`:** explore, figure `greenhouse` (demo
  `g.s12-climate-systems-greenhouse`). Assumptions: "Sunlight passes through the air; the warm
  ground sends out infrared." "CO₂ and water vapor absorb infrared and send some back down."
  Scenes:
  - "No greenhouse gases" (`co2: 'none'`): Earth would average about −18 °C.
  - "Before 1800" (`preindustrial`): about 14 °C.
  - "Today" (`today`): more CO₂ sends more infrared back; about 15.2 °C.
  - "Ash and smoke" (`co2: 'today'`): the lines say particles reflect sunlight before it reaches
    the ground, which cools Earth. Need 8 draws them.
- **~zones — BUILD:** explore, figure `greenhouse` zones view (demo `g.s12-climate-systems-zones`).
  Scenes:
  - "Tropical" (`lit: 'tropical'`): between 23.5° N and S; the Sun is high all year.
  - "Temperate" (`lit: 'temperate'`): 23.5° to 66.5°; warm summers and cold winters.
  - "Polar" (`lit: 'polar'`): past 66.5°; the same beam spreads over more ground.
- **~feedbacks — BUILD:** explore, figure `feedbackLoop` (demo `g.s12-climate-systems-feedback`),
  roles left out. Scenes:
  - "Ice and albedo" (positive): warming melts ice → darker ground and sea absorb more sunlight
    → more warming.
  - "Water vapor" (positive): warmer air holds more vapor → vapor traps infrared → more warming.
  - "Rock weathering" (negative): warmer, wetter climate → faster weathering of silicate rock
    → CO₂ drawn out of the air → cooling.
- **~carbon — BUILD:** sort. Question: "Does this add CO₂ to the air or take it out?"
  - Bins: "Adds CO₂ to the air" and "Takes CO₂ out of the air".
  - Cards (energy icons where drawn):
    - a volcanic eruption, burning coal in a power plant (lumps of coal), animals breathing out,
      dead leaves decaying, a forest fire → adds;
    - photosynthesis making sugars, the ocean dissolving CO₂, rain weathering silicate rock,
      buried plants turning to coal → takes out.
  - Shell formation is left out: it releases CO₂ at first but stores carbon when buried.
- **~co2-record — BUILD:** observe. Columns, CO₂ in ppm (NOAA Mauna Loa yearly means, rounded):
  1960 317, 1970 326, 1980 339, 1990 354, 2000 370, 2010 390, 2020 414.
  - Pattern: "CO₂ rises every decade, and faster each time: about 9 ppm in the 1960s and 24 ppm in
    the 2010s."
- **~energy-balance — BUILD (waits on need 6):** calculator.
  - Values:
    - S, sunlight, W/m², 1,361;
    - α, albedo, 0–1;
    - F, absorbed, W/m²;
    - Tₑ, K.
  - Relations: F = S(1 − α) ÷ 4; Tₑ = (F ÷ σ)^¼, σ = 5.67 × 10⁻⁸.
  - Example: α = 0.30 → F = 238 W/m², Tₑ = 255 K (−18 °C), the main page's "no greenhouse" value.
- **Verdict:** 6 pages (5 now). 4 of the 5 released items filed here Solve; NAEP-2009-12S9-#12 is Partly.

### 9. s.12.resource-management — Human impacts and resource management

- **Standard:** HS-ESS3-1, HS-ESS3-2, HS-ESS3-3, HS-ESS3-4.
- **Textbooks:** openscied-hs 10.C.3, 11.P.1; openstax-biology 47 (grade 9); hmh-science-dimensions
  10 (grade 9); miller-levine 16 (grade 9); savvas-experience-hs 18 (grade 10), 10 (grade 11).
- **Tests ask:**

  | Question                                               | Page          |                                      |
  | ------------------------------------------------------ | ------------- | ------------------------------------ |
  | NAEP-2009-12S10-#15 (how fossil fuels form)            | ~fossil-fuels | Solves                               |
  | NAEP-2005-12S13-#13 (hunger: factors and a solution)   | none          | No: an argument, not in the taxonomy |
  | NAEP-2009-12S10-#9 (lead in soil: weigh three methods) | none          | No: engineering tradeoff             |
  | NAEP-2019-12S7-#14 (salt or sand on roads)             | none          | No: engineering tradeoff             |
  | (common) Renewable or not?                             | main          | Solves                               |
  | (common) Share of electricity from fossil fuels        | ~energy-mix   | Solves                               |
  | (common) How many years will a reserve last?           | ~reserves     | Waits (need 7)                       |

- **Main — BUILD `s.12.resource-management`:** sort (demo `g.s12-resource-management-renewable`).
  Question: "Can people use it up?"
  - Bins: "Renewable" and "Nonrenewable".
  - Cards:
    - solar panel, wind turbine, dam, "Heat from deep underground", "Wood from a replanted
      forest" → renewable;
    - lumps of coal, oil rig, gas stove flame, nuclear power plant ("uranium is mined and runs
      out") → nonrenewable.
  - Assumptions: "Renewable resources are replaced as fast as we use them." "Fossil fuels took
    millions of years to form."
- **~energy-mix — BUILD:** calculator, picture `bars` with icons (demo
  `g.s12-resource-management-mix`).
  - Values (%, 0–100): g, gas; n, nuclear; k, coal; w, wind; h, hydro; s, solar; o, other;
    F, fossil (derived); R, renewable (derived).
  - Relations: F = g + k; R = w + h + s; o = 100 − F − n − R.
  - Assumptions: "Shares of US electricity in about 2023, rounded." "Oil makes almost no
    electricity; it fuels transport." "Biomass and geothermal are in other."
  - Example: g 43, n 19, k 16, w 10, h 6, s 4 → F = 59, R = 20, o = 2.
  - The world pie (`g.s12-resource-management-world`) is the same idea: merge, no second page.
- **~fossil-fuels — BUILD:** sequence (icon: lumps of coal on the last stage).
  - Stages:
    1. "Swamp plants die and sink into water with little oxygen";
    2. "Sediment buries them; they pack into peat";
    3. "Heat and pressure turn peat into lignite";
    4. "Deeper burial makes bituminous coal";
    5. "Folding and more heat make anthracite".
  - Assumptions: "Oil and gas form the same way from tiny sea organisms buried in mud."
- **~reserves — BUILD (waits on need 7):** calculator.
  - Values: Q, reserve; r, use per year; y, years = Q ÷ r.
  - Example: 400 billion barrels at 12.5 billion a year → 32 years.
  - Assumption: "Use and reserves stay the same."
- **Verdict:** 4 pages (3 now). 1 of the 4 released items Solves; the 3 constructed tradeoff
  items are out of scope (Not in the taxonomy).

### 10. s.12.solar-system — The solar system: formation, planets and small bodies

- **Standard:** HS-ESS1-4, HS-ESS1-6.
- **Textbooks:** openstax-astronomy 3, 7, 9, 10, 11, 12, 13, 14, 21; tarbuck 22, 24.
- **Tests ask:** no released questions. Common types:

  | Question (common)                                          | Page          |        |
  | ---------------------------------------------------------- | ------------- | ------ |
  | a = 1.52 AU: period? (T² = a³)                             | main          | Solves |
  | Perihelion and aphelion from a and e; where is it fastest? | main          | Solves |
  | Order the stages of the solar system's formation           | ~formation    | Solves |
  | Terrestrial, Jovian or small body?                         | ~planet-types | Solves |

- **Main — BUILD `s.12.solar-system`:** calculator, picture `circularMotion` { mode: 'kepler',
  semiMajor: 'a', eccentricity: 'e', perihelion: 'q', aphelion: 'Q', period: 'T' } (demo
  `g.s12-solar-system-kepler`; `g.s12-solar-system-comet` is the edge case with e = 0.8).
  - Values: a, AU, 0.1–100; e, 0–0.95; q, AU; Q, AU; T, years, 0.03–1,000.
  - Relations: q = a(1 − e); Q = a(1 + e); T² = a³.
  - Assumptions: the demo's three laws; add "T² = a³ holds only for bodies orbiting the Sun."
  - Example: a = 1.52 AU, e = 0.093 → q = 1.38 AU, Q = 1.66 AU, T = 1.87 years.
  - startWith a, e.
- **~formation — BUILD:** sequence, icons "solar nebula", "spinning disk", "protosun",
  "planetesimals", "young planets" (demo `g.s12-solar-system-formation`).
  - Stages:
    1. "A cloud of gas and dust collapses";
    2. "It spins faster and flattens into a disk";
    3. "The center heats into the protosun";
    4. "Dust clumps into planetesimals: rock near the Sun, ice beyond the frost line";
    5. "Planetesimals collide into planets; the Sun's wind clears the gas".
- **~planet-types — BUILD:** sort. Question: "What kind of body is it?"
  - Bins: "Terrestrial planet", "Jovian planet", "Dwarf planet or small body".
  - Cards: Mercury, Venus, Earth, Mars; Jupiter, Saturn, Uranus, Neptune; Pluto, Ceres, Halley's
    Comet, the asteroid Vesta.
- **Verdict:** 3 pages. Covers the common types; no released questions.

### 11. s.12.starlight-spectra — Light, spectra and telescopes: how we study stars

- **Standard:** HS-ESS1-1, HS-ESS1-2, HS-ESS1-3, HS-PS4-3.
- **Textbooks:** openstax-astronomy 5, 6, 17, 18; tarbuck 23.
- **Tests ask:** no released questions filed here. It takes one from stellar-evolution:

  | Question                                              | Page              |                                                    |
  | ----------------------------------------------------- | ----------------- | -------------------------------------------------- |
  | NAEP-2009-12S9-#18 (match a star's lines to elements) | ~lines            | Waits (need 8); Partly on ~doppler without a shift |
  | (common) Star at 5,800 K: peak wavelength and color   | main              | Solves                                             |
  | (common) Hα seen at 656.5 nm: speed and direction     | ~doppler          | Solves                                             |
  | (common) fₒ = 900 mm, fₑ = 25 mm: magnification       | ~telescope        | Solves                                             |
  | (common) Why X-ray telescopes go to space             | ~space-telescopes | Solves                                             |

  NAEP-2009-12S9-#18 is a spectra question: `[data] → s.12.starlight-spectra`.

- **Main — BUILD `s.12.starlight-spectra`:** calculator (Wien's law), picture `spectrum`
  { wavelength: 'l', meters: 1e-9, frequency: 'f' }, the visible strip with the peak marked.
  - Values: T, surface temperature, K, 2,500–40,000; λ, peak wavelength, nm, 70–1,200; f, Hz.
  - Relations: λ = 2.898 × 10⁶ ÷ T (nm·K); f = c ÷ λ.
  - Assumptions: "Hotter stars peak at shorter wavelengths, so they look bluer." "A star glows at
    every wavelength; λ is only the brightest one." "c = 3.00 × 10⁸ m/s."
  - Example: T = 5,772 K (the Sun) → λ = 502 nm, f = 5.98 × 10¹⁴ Hz.
  - startWith T.
- **~doppler — BUILD:** calculator, picture `spectrum` { wavelength: 'l', meters: 1e-9, lines:
  { element: 'H', mode: 'absorption', redshift: 'z', velocity: 'v' } } (demo
  `g.s12-starlight-spectra-absorption`).
  - Values:
    - λ₀, rest wavelength, nm (`allowed: [656.3, 486.1, 434.0, 410.2]`);
    - λ, observed, nm;
    - z, −0.01–0.01;
    - v, km/s, −3,000–3,000.
  - Relations: z = (λ − λ₀) ÷ λ₀; v = c × z, with c = 3.00 × 10⁵ km/s.
  - Assumptions: "Moving away stretches the lines red (+v); moving toward shifts them blue (−v)."
    "Only motion along our line of sight shows." "The pattern of lines names the element."
  - Example: λ₀ = 656.3 nm, λ = 656.5 nm → z = 3.05 × 10⁻⁴, v = 91.4 km/s away.
  - startWith λ, λ₀.
- **~telescope — BUILD:** calculator, picture `rayDiagram` { mode: 'telescope', design: 'refracting',
  objective: 'o', eyepiece: 'e', magnification: 'M', length: 'L' } (demo
  `g.s12-starlight-spectra-refractor`; the reflector demo is the edge case).
  - Values:
    - fₒ, objective focal length, mm, 100–5,000;
    - fₑ, eyepiece focal length, mm, 3–60;
    - M, magnification;
    - L, tube length, mm;
    - D, aperture, mm, 10–1,000;
    - G, light gathered compared with the eye.
  - Relations: M = fₒ ÷ fₑ; L = fₒ + fₑ; G = (D ÷ 7)², for a 7 mm pupil.
  - Assumptions: "Aperture, not magnification, sets how faint a star you can see." "Mirrors can be
    made far larger than lenses."
  - Example: fₒ = 900 mm, fₑ = 25 mm, D = 100 mm → M = 36, L = 925 mm, G = 204.
  - startWith fₒ, fₑ, D.
- **~space-telescopes — BUILD:** sort. Question: "Can a telescope on the ground see it?"
  - Bins: "From the ground" and "Only from space".
  - Cards: "Radio waves from a galaxy", "Visible light from a star" → ground; "X-rays from hot gas",
    "Gamma rays from an explosion", "Ultraviolet from a young star", "Far infrared from cold dust"
    → space.
- **~lines — BUILD (waits on need 8):** explore. The star's strip over the H, He and Na reference
  strips; a scene lights the matches.
- **Verdict:** 5 pages (4 now). Covers the common types; NAEP-2009-12S9-#18 is Partly until ~lines.

### 12. s.12.stellar-evolution — The sun and stellar evolution: fusion, the H-R diagram and nucleosynthesis

- **Standard:** HS-ESS1-1, HS-ESS1-3.
- **Textbooks:** openstax-astronomy 16, 18, 21, 22, 23; tarbuck 23, 24; openscied-hs 11.P.6;
  savvas-experience-hs 11.16.
- **Tests ask:**

  | Question                                                 | Page                       |           |
  | -------------------------------------------------------- | -------------------------- | --------- |
  | NAEP-2005-12S13-#2 (two most common elements)            | ~elements                  | Solves    |
  | NAEP-2009-12S9-#18                                       | moved to starlight-spectra | see there |
  | (common) Hot and faint: which region of the H–R diagram? | main                       | Solves    |
  | (common) Order a Sun-like star's life                    | ~sunlike                   | Solves    |
  | (common) What is left after a supernova?                 | ~massive                   | Solves    |
  | (common) Sun's mass lost each second to fusion           | ~fusion                    | Solves    |

- **Main — BUILD `s.12.stellar-evolution`:** calculator, picture `hrDiagram` { temperature: 'T',
  luminosity: 'L', radius: 'R', name: 'Sirius A' } (demo `g.s12-stellar-evolution-hr`; the giant,
  supergiant and white-dwarf demos are edge cases).
  - Values: T, K, 2,500–40,000; R, R☉, 0.005–1,500; L, L☉, 10⁻⁴–10⁶.
  - Relation: L = R² × (T ÷ 5,772)⁴.
  - Assumptions: "A bigger or hotter star gives off more light." "Main-sequence stars fuse hydrogen
    in their cores; mass sets where they sit." "Giants are cool but huge; white dwarfs are hot but tiny."
  - Example: T = 9,940 K, R = 1.71 R☉ → L = 25.7 L☉ (main sequence).
  - startWith T, R.
- **~fusion — BUILD:** calculator, picture `decayChart` { mode: 'equation', left: [4 × (1, 1)],
  right: [(4, 2), 2 positrons], fixed: true }. The equation is fixed: 4 ¹H → ⁴He + 2 e⁺.
  - Values: L, W, 10²⁰–10³²; m, mass turned to energy, kg/s; H, hydrogen fused, kg/s.
  - Relations: m = L ÷ c²; H = m ÷ 0.007.
  - Assumptions: "0.7 % of the hydrogen's mass becomes energy (E = mc²)." "The Sun shines by this
    chain in its core."
  - Example: L = 3.828 × 10²⁶ W → m = 4.26 × 10⁹ kg/s, H = 6.08 × 10¹¹ kg/s.
  - startWith L.
- **~sunlike — BUILD:** sequence, icons (demo `g.s12-stellar-evolution-sunlike`): stellar nebula →
  protostar → Sun-like star → red giant → planetary nebula → white dwarf.
- **~massive — BUILD:** sequence, icons (demo `g.s12-stellar-evolution-massive`): stellar nebula →
  protostar → massive star → red supergiant → supernova → neutron star. The black-hole ending
  goes in the assumptions: "above about 20 Sun masses, a black hole."
- **~elements — BUILD:** sort. Question: "Where were most of these atoms made?"
  - Bins: "The Big Bang", "Fusion inside stars", "Supernovas and neutron-star mergers".
  - Cards:
    - hydrogen, most of the helium → Big Bang;
    - carbon in your body, oxygen in the air, iron in a massive star's core → stars;
    - gold, uranium → supernovas and mergers.
  - Assumptions: "Hydrogen and helium are most of the Sun and the solar system."
- **~lifetime — BUILD (waits on need 10):** calculator.
  - Values: M, M☉; L = M^3.5; t = 10¹⁰ × M^−2.5 years.
  - Example: M = 2 → L = 11.3 L☉, t = 1.77 × 10⁹ years.
- **Verdict:** 6 pages (5 now). The released item filed here Solves (the other moves to
  starlight-spectra); covers the common types.

### 13. s.12.cosmology — Galaxies, the Big Bang and the expanding universe

- **Standard:** HS-ESS1-2.
- **Textbooks:** openstax-astronomy 26, 28, 29; tarbuck 24; openscied-hs 11.P.6;
  savvas-experience-hs 11.16.
- **Tests ask:**

  | Question                                                 | Page      |                     |
  | -------------------------------------------------------- | --------- | ------------------- |
  | NAEP-2005-12S13-#9 (light shifted to longer wavelengths) | ~redshift | Solves              |
  | NAEP-2009-12S10-#13 (what every galaxy has)              | ~galaxies | Solves (assumption) |
  | (common) d = 200 Mpc: speed; the age from 1/H₀           | main      | Solves              |
  | (common) z = 0.03: speed and distance                    | ~redshift | Solves              |
  | (common) Space doubles: how far does each galaxy move?   | ~stretch  | Solves              |
  | (common) Order the universe's history; what the CMB is   | ~big-bang | Solves              |

- **Main — BUILD `s.12.cosmology`:** calculator, picture `expandingUniverse` { mode: 'hubble',
  distance: 'd', speed: 'v', constant: 'H' } (demo `g.s12-cosmology-hubble`; `-far` is the edge).
  - Values:
    - d, Mpc, 1–1,000;
    - v, km/s, 0–70,000;
    - H₀, km/s per Mpc, 50–100;
    - t, 1/H₀ age, billion years.
  - Relations: v = H₀ × d; t = 977.8 ÷ H₀.
  - Assumptions: "Farther galaxies move away faster because space itself stretches." "1/H₀ is the
    age if expansion had never changed speed." "Nearby galaxies such as Andromeda can approach us."
  - Example: H₀ = 70, d = 200 Mpc → v = 14,000 km/s, t = 14.0 billion years.
  - startWith H₀, d.
- **~redshift — BUILD:** calculator, picture `spectrum` { wavelength: 'l', meters: 1e-9, lines:
  { element: 'H', mode: 'absorption', redshift: 'z', velocity: 'v' } } (demo
  `g.s12-cosmology-redshift`; `-blueshift` is the edge).
  - Values:
    - λ, observed Hα, nm, 600–730;
    - z, −0.01–0.1;
    - v, km/s;
    - H₀ (70);
    - d, Mpc.
  - Relations: z = (λ − 656.3) ÷ 656.3; v = c × z; d = v ÷ H₀.
  - Assumptions: "v = cz only for z under about 0.1." "A redshift means longer wavelengths and a
    galaxy moving away."
  - Example: λ = 676.0 nm → z = 0.030, v = 9,000 km/s, d = 129 Mpc.
  - startWith λ, H₀.
  - Different from starlight ~doppler: this page links the shift to distance.
- **~stretch — BUILD:** calculator, picture `expandingUniverse` { mode: 'stretch', scale: 'a',
  distance: 'd', after: 'D' } (demo `g.s12-cosmology-stretch`).
  - Values: a, stretch factor, 1–4; d, distance before, million light-years, 1–1,000; D, after;
    Δ, how far it moved.
  - Relations: D = a × d; Δ = D − d.
  - Example: a = 2, d = 100 → D = 200, Δ = 100; a galaxy at 300 moves 300. Twice as far moves
    twice as far, the Hubble law.
  - startWith a, d.
- **~galaxies — BUILD:** sort, icons (demo `g.s12-cosmology-galaxies`). Question: "What type of
  galaxy is it?"
  - Bins: "Spiral", "Elliptical", "Irregular".
  - Cards:
    - "The Milky Way" (barred spiral galaxy), "Andromeda" (spiral galaxy), "A disk with arms and
      young blue stars" → spiral;
    - "A giant ball of old red stars" (elliptical galaxy), "Round or oval, with little gas" →
      elliptical;
    - "The Large Magellanic Cloud" (irregular galaxy), "No clear shape, lots of gas and new stars"
      → irregular.
  - Assumptions: "Every galaxy holds millions to trillions of stars bound by gravity."
- **~big-bang — BUILD:** sequence.
  - Stages:
    1. "Space expands from a hot, dense state";
    2. "Protons and neutrons form in the first second";
    3. "Hydrogen and helium nuclei form in the first minutes";
    4. "Atoms form and light goes free, seen today as the microwave background (380,000 years)";
    5. "The first stars shine (about 200 million years)";
    6. "The Sun and Earth form (about 9 billion years)";
    7. "Today (13.8 billion years)".
- **Verdict:** 5 pages (3 calculators, 2 layouts). Both released items Solve; covers the common types.

## Engine and picture needs

1. **Units** (all calculator pages): register km/s (speed), hPa (a pressure dimension), K and °C (a
   temperature dimension, with offsets), and years / Ma / billion years (long time), so typed
   values convert. Until then they are fixed labels. AU, Mpc, L☉ and R☉ can stay fixed.
2. **Two seismograms by magnitude** (earth-interior ~magnitude): two traces on one scale with the
   amplitude ratio 10^ΔM bracketed, or a log-scale bar pair. New `earthLayers` mode `magnitude`.
3. **Ridge with magnetic stripes** (earth-interior ~spreading-rate): a ridge from above with
   normal and reversed stripes, symmetric ages, and a distance and age marked. New
   `oceanProfile` mode `stripes`.
4. **Stream channel cross-section** (surface-processes ~discharge): width × depth with the flow
   speed as an arrow and Q in the caption. New kind, or a `landforms` calculator mode.
5. **Rising air parcel** (atmosphere-weather ~cloud-base): a parcel cooling 10 °C/km, its dew
   point falling 2 °C/km, and the cloud base where they meet. New `atmosphereLayers` mode `parcel`.
6. **Energy balance as a calculator** (climate-systems ~energy-balance): the `greenhouse` energy
   view driven by S and α, with the thermometer at Tₑ. It is an explore figure only today.
7. **Reserve drawn down** (resource-management ~reserves): a stock bar emptying at r per year with
   the years marked. The `bars` or `tape` kinds could take an option.
8. **Spectra side by side** (starlight-spectra ~lines; NAEP-2009-12S9-#18): an explore figure or a
   `spectrum` option with the star's strip over the H, He and Na reference strips, matched lines
   joined. Also used by climate's "Ash and smoke" scene: the `greenhouse` energy view has no
   aerosol particles (option `particles: true`).
9. **`rockLayers` dating sample, K-40** (radiometric ~bracket): the demo counts every lost K-40
   atom as argon-40, but only about 11 % become argon. Either draw Ca-40 and Ar-40, or retire
   K-40 in favor of U-235 → Pb-207. The plan uses U-235.
10. **Mass on the H–R diagram** (stellar-evolution ~lifetime): `hrDiagram` option `mass` placing
    the star on the main sequence by mass, with the lifetime in the caption.
11. **`carbonCycle` volcano** (optional): add `volcano` to CarbonProcess, so a later explore can
    light outgassing (NAEP-2009-12S9-#9, NAEP-2019-12S7-#13). The ~carbon sort covers them today.

## Not in the taxonomy

- Engineering tradeoffs on human impacts: weighing cleanup or road-safety methods by cost,
  benefit and harm (HS-ESS3-2, HS-ETS1-3). Three constructed NAEP grade-12 items are filed under
  s.12.resource-management (NAEP-2009-12S10-#9, NAEP-2019-12S7-#14, NAEP-2005-12S13-#13) and no
  calculator or layout page solves them.
- Experimental design in Earth science (NAEP-2005-12S13-#11, an oil-spill wave test): a practices
  skill, not ocean content.
- OpenStax Astronomy units no skill claims:
  - 19, Celestial Distances: parallax, d = 1/p, and the distance ladder. A good calculator.
  - 20, the interstellar medium.
  - 24, black holes and general relativity.
  - 25, the Milky Way.
  - 27, quasars.
  - 30, life in the universe.
  - Exoplanet detection (transits and wobble, 21.4–21.5) could join s.12.solar-system.
- tarbuck 13 (The Ocean Floor) maps only to s.6.plate-tectonics. The s.12 ocean main (sonar
  depth) teaches it at Grade 12 level: add `s.12.ocean-atmosphere` to its crosswalk row.
- Earth's changing atmosphere and early life (red beds, the rise of oxygen; tarbuck 12) sits
  between radiometric-dating and climate. Name it in the radiometric-dating title, or add
  `s.12.earth-history`.

## Priority

1. The 8 calculator mains, each promoted from its demo (every picture is drawn):
   - earth-interior (seismogram), radiometric-dating (carbon), ocean-atmosphere (sonar);
   - atmosphere-weather (profile), solar-system (kepler), starlight-spectra (Wien on `spectrum`);
   - stellar-evolution (hrDiagram), cosmology (hubble).
2. The 5 layout mains:
   - minerals-rocks (mohsScale), volcanoes-mountains (landforms), surface-processes (landforms);
   - climate-systems (greenhouse), resource-management (renewable sort).
3. Problem types that solve a released item:
   - ~epicenter, ~heat-sources, ~deformation, ~mountain-building;
   - ~uranium, ~density (ocean), ~zones, ~carbon, ~fossil-fuels, ~redshift, ~galaxies, ~elements.
4. The remaining calculators on drawn pictures:
   - ~density (minerals), ~shadow-zone, ~tides, ~pressure, ~humidity, ~bracket;
   - ~doppler, ~telescope, ~fusion, ~stretch.
5. The remaining layouts:
   - ~mineral-groups, ~cleavage, ~igneous, ~metamorphic, ~wave-types, ~magma, ~weathering, ~agents;
   - ~relative-order, ~time-scale, ~currents, ~hurricane, ~air-masses, ~feedbacks, ~co2-record;
   - ~formation, ~planet-types, ~space-telescopes, ~sunlike, ~massive, ~big-bang.
6. Engine needs, in this order: 8 (spectra side by side, for a released item), 1 (units),
   9 (the K-40 fix), 6, 2, 3, 5, 4, 7, 10. Then the pages waiting on each.

Totals: 65 pages. 29 calculators (8 mains, 21 problem types) and 36 layouts (5 mains, 31 problem
types). 57 can be built now and 8 wait on a picture.

## Added skills

Two skills added to the taxonomy after Grades 9–12 were built (TAXONOMY_ISSUES.md, "Grades 9–12
topics without a skill"). Same rules as above: rows, fixed unit labels, original text. No drawn
picture fits their calculators yet, so each uses a `table` of the page's own formula (the rows a
student would compare) and names the picture it wants under "Added needs" (12–15).

### 14. s.12.earth-history — Earth's history: the early Earth, its atmosphere and the history of life

- **Standard:** HS-ESS2-7 (Earth's systems and life change together), HS-ESS1-6, HS-ESS1-5.
- **Textbooks:** no crosswalk row yet. tarbuck 12 (Earth's Evolution Through Geologic Time),
  mapped to radiometric-dating, teaches this skill: the early atmosphere from outgassing, the
  rise of oxygen, banded iron and red beds, and the history of life by era. openstax-astronomy
  14 (the Moon slowing Earth's spin) and 30.1 (the cosmic context for life) touch it.
- **Tests ask:**

  | Question                                                 | Page        |        |
  | -------------------------------------------------------- | ----------- | ------ |
  | NAEP-2019-12S7-#7 (oxygen and red beds)                  | ~oxygen     | Solves |
  | (common) Earth's history as one day: when did X happen?  | main        | Solves |
  | (common) What was the early atmosphere made of?          | ~atmosphere | Solves |
  | (common) Order the major steps in the history of life    | ~life       | Solves |
  | (common) Fossil corals show 400 days a year: day length? | ~day-length | Solves |

  NAEP-2019-12S7-#7 is filed under radiometric-dating (its ~time-scale names red beds):
  `[data] → s.12.earth-history`. NAEP-2009-12S9-#3 (meteorites) and NAEP-2005-12S11-#3 (index
  fossils) stay on radiometric-dating's pages.

- **Main — BUILD `s.12.earth-history`:** calculator, "Earth's history in one day", picture
  `table` { sweep: 'A', output: 't', rows: the events below, rowNames } (interim; need 12).
  - Values:
    - A, how long ago, million years, 0–4,600;
    - p, share of Earth's history since then, %, derived;
    - m, minutes before midnight on the one-day clock, 0–1,440;
    - t, clock time, hours after the midnight Earth formed, 0–24.
  - Relations: p = A ÷ 4,600 × 100; m = p ÷ 100 × 1,440; t = 24 − m ÷ 60.
  - Assumptions: "Earth formed about 4,600 million years ago: midnight at the start of the day."
    "Today is the next midnight, so each hour stands for about 192 million years." "Event ages
    are rounded; new finds move them."
  - Example: A = 2,300 (oxygen building up in the air) → p = 50 %, m = 720 minutes, t = 12 h,
    noon. Check: dinosaurs gone, A = 66 → m = 20.7 minutes, t = 23.66 h (about 11:40 pm).
  - Table rows (million years ago): Earth forms 4,600; first life 3,500; oxygen in the air
    2,300; animals with shells 540; the dinosaurs die out 66; our species 0.3.
  - startWith A.
- **~day-length — BUILD:** calculator, "Day length from fossil coral", picture `table`
  { sweep: 'N', output: 'D', rows: [365, 380, 400, 420, 440] } (interim; need 13).
  - Values:
    - n, daily growth lines counted, 1–5,000;
    - b, yearly bands they span, 1–10;
    - N, days in a year, 360–450;
    - D, day length, hours.
  - Relations: N = n ÷ b; D = 8,766 ÷ N (365.25 days × 24 hours in a year).
  - Assumptions: "A coral adds one thin growth line a day and one band a year." "The year's
    length in hours has not changed; the Moon's tides slow Earth's spin." "So long ago there
    were more, shorter days in a year."
  - Example: n = 1,200 lines over b = 3 bands → N = 400 days, D = 21.9 h.
  - startWith n, b.
- **~oxygen — BUILD:** sequence, "How oxygen filled the air". Question: "Put the changes to
  Earth's early air and oceans in order." Stages:
  1. "Volcanoes release water vapor, carbon dioxide and nitrogen";
  2. "Water vapor condenses, and rain fills the first oceans";
  3. "Cyanobacteria in the sea release oxygen by photosynthesis";
  4. "The oxygen rusts dissolved iron into banded iron layers on the seafloor" (rock `layers`);
  5. "Oxygen builds up in the air, and iron rusts on land into red beds" (rock `grains`);
  6. "An ozone layer forms and blocks UV, so life can move onto land".
  - Assumptions: "Oxygen first reacted with iron; only after the iron was used up did it build
    up in the air." "Red beds need oxygen in the air, so they date its rise."
- **~atmosphere — BUILD:** sort. Question: "Early Earth's air or today's air?"
  - Bins: "Early Earth (about 4 billion years ago)" and "Today".
  - Cards: "Almost no free oxygen", "Far more carbon dioxide", "No ozone layer, so UV reaches the
    ground", "Rich in water vapor that later rained out" → early; "About 21 % oxygen", "Mostly
    nitrogen and oxygen", "An ozone layer blocks most UV", "Its oxygen was made by photosynthesis"
    → today.
- **~life — BUILD:** sequence, "The history of life". Stages: first single-celled life in the
  sea; cells with a nucleus, after oxygen builds up; soft-bodied many-celled animals on the
  seafloor; the Cambrian burst of animals with shells and skeletons; plants, then animals, move
  onto land; dinosaurs and the first mammals; an asteroid ends the dinosaurs and mammals spread;
  humans appear.
  - Assumptions: "Each step built on the ones before." "Mass extinctions cleared the way for new
    groups." Different from radiometric ~time-scale: that page orders the eras and their spans;
    this one orders the steps of life.
- **Verdict:** 5 pages (2 calculators, 3 layouts). The one released item Solves; covers the
  common types.

### 15. s.12.exoplanets — Exoplanets and the search for life

- **Standard:** HS-ESS1-4 (orbits), HS-ESS1-1, HS-PS4-3.
- **Textbooks:** openstax-astronomy 21.4 (search and discovery), 21.5 (exoplanets everywhere),
  30.1–30.4 (life in the universe, astrobiology, the search for life, SETI); tarbuck 24.
- **Tests ask:** no released questions. The textbook's review questions and common types:

  | Question                                                    | Page            |        |
  | ----------------------------------------------------------- | --------------- | ------ |
  | (common) A star dims 1 %: how big is the planet?            | main            | Solves |
  | (common) Period 36.5 days round a 0.8 M☉ star: how far out? | ~orbit          | Solves |
  | (common) Is the planet in its star's habitable zone?        | ~habitable-zone | Solves |
  | (textbook) Which planets do Doppler and transits find best? | ~methods        | Solves |
  | (textbook) Why are young Jupiters easier to image?          | ~methods        | Solves |
  | (common) Habitable, sign of life or sign of technology?     | ~life           | Solves |

- **Main — BUILD `s.12.exoplanets`:** calculator, "The transit method", picture `table`
  { sweep: 'r', output: 'd', params: ['R'], rows: Mars 0.53, Earth 1, Neptune 3.88, Saturn
  9.45, Jupiter 11.21 } (interim; need 14).
  - Values: R, star's radius, R☉, 0.1–10; r, planet's radius, R⊕ (Earth radii), 0.3–25;
    δ, transit depth, %.
  - Relation: δ = 100 × (r ÷ (109 × R))², with 1 R☉ = 109 R⊕. Limit: r < 109 × R, with the
    reason "a planet is smaller than its star, so it blocks only part of it".
  - Assumptions: "The dip is the share of the star's disk the planet covers." "The orbit must be
    nearly edge-on to us, or there is no transit." "Repeated dips a period apart confirm a planet."
  - Example: R = 1, δ = 1.00 % → r = 10.9 R⊕, about Jupiter's size. An Earth across the Sun dims
    it only 0.0084 %.
  - startWith δ, R.
- **~orbit — BUILD:** calculator, "An exoplanet's orbit from its period", picture `table`
  { sweep: 'P', output: 'a', params: ['M'] } (interim; need 15: the `kepler` picture's caption
  states T² = a³, true only round the Sun).
  - Values: M, star's mass, M☉, 0.1–5; P, period, days, 0.2–10,000; T, period, years; a,
    orbit size, AU.
  - Relations: T = P ÷ 365.25; a³ = M × T² (Kepler's third law with the star's mass).
  - Assumptions: "The planet's mass is tiny beside its star's." "With M = 1 this is the solar
    system's T² = a³." "A heavier star pulls harder, so the same period means a wider orbit."
  - Example: M = 0.8, P = 36.525 days → T = 0.1 years, a³ = 0.008, a = 0.2 AU.
  - startWith P, M.
- **~habitable-zone — BUILD:** calculator, picture `table` { sweep: 'a', output: 'T', params:
  ['L'], rows: [0.25, 0.5, 0.75, 1, 1.5, 2] } (interim; need 15).
  - Values: L, star's luminosity, L☉, 0.001–100; d₁, inner edge, AU; d₂, outer edge, AU; a,
    planet's orbit, AU, 0.01–100; T, planet's temperature, K.
  - Relations: d₁ = 0.95 × √L; d₂ = 1.37 × √L; T = 278 × L^(1/4) ÷ √a.
  - Assumptions: "Between d₁ and d₂ a planet like Earth could keep liquid water." "Light spreads
    out as the square of distance, so the zone moves out as √L." "T leaves out clouds and
    greenhouse gases: it gives Earth 278 K, but Earth averages about 288 K."
  - Example: L = 0.25 → d₁ = 0.475 AU, d₂ = 0.685 AU; a = 0.5 AU → T = 278 K, inside the zone.
  - startWith L, a.
- **~methods — BUILD:** sort. Question: "Which method is it?"
  - Bins: "Transit (the star dims)", "Radial velocity (the star wobbles)", "Direct imaging".
  - Cards: "Gives the planet's size", "Needs the orbit edge-on to us", "The star dims on a regular
    schedule" → transit; "Gives a lowest possible mass for the planet", "The star's lines shift
    red, then blue", "Measures the star's speed toward and away from us" → radial velocity;
    "Blocks the star's glare to catch the planet's own light", "Works best for big, young planets
    far from their star" → imaging.
- **~life — BUILD:** sort. Question: "What does this finding tell us?"
  - Bins: "Habitable: life could live there", "Biosignature: a sign of life", "Technosignature:
    a sign of technology".
  - Cards: "Liquid water on its surface", "An orbit inside the habitable zone", "A rocky surface
    under a thick enough atmosphere" → habitable; "Oxygen and methane together in its air",
    "Fossil microbes in a rock" → biosignature; "A narrow radio signal no natural source makes",
    "Laser flashes repeating in a pattern" → technosignature.
- **Verdict:** 5 pages (3 calculators, 2 sorts). No released questions; covers the common types
  and the textbook's review questions.

### Added needs

12. **Geologic clock** (earth-history main): a 24-hour dial with Earth's formation at midnight,
    the event at `A` marked at clock time `t`, the last `m` minutes shaded.
13. **Coral growth lines** (earth-history ~day-length): a coral section with `n` daily lines
    across `b` yearly bands, and the day's length `D` beside today's 24 h.
14. **Transit light curve** (exoplanets main): the star's disk with the planet crossing it (radii
    `R` and `r` to scale), and the brightness dipping by `δ`.
15. **Star, habitable zone and orbit** (exoplanets ~orbit, ~habitable-zone): the star at the
    center scaled by `L` or `M`, the zone from `d₁` to `d₂` shaded, the planet's orbit at `a`.
