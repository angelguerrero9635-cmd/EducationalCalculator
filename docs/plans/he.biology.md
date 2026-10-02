# Direction plan: higher education, group "biology" (13 courses, 53 topics)

Written from the brief (`he-plan-brief.md`), `src/data/taxonomy.ts` (`COURSES`, the Biology field
and the Bioengineering courses), `docs/MODULE_GUIDE.md` ("Standards"), `docs/LAYOUTS.md`,
`docs/EQUATION_INPUTS.md`, `docs/PICTURES.md` and the picture specs in `src/data/modules/types*.ts`.
The model is `docs/plans/s.11.md`, adapted to courses and topics. Every example below is original
and was worked by hand (and checked with a calculator); nothing is copied from `research/` or a
textbook. No college research exists in the repository yet, so the "Courses teach" lines name
open-text chapters from memory, and "Tests ask" lists the common exam and textbook question types;
the research chat (part 4) confirms both.

## Decisions

- **Ids.** A topic's page is `<courseId>#<i>` (0-based, in the taxonomy's order); a problem type is
  `<courseId>#<i>~<slug>`. Biology courses are `he.biology.<slug>`; the Bioengineering courses are
  `he.engineering.<slug>` with home field `bio`. All pages go in `src/data/modules/college.ts`
  (split it into `college/biology.ts` and `college/bioengineering.ts` when it passes ~3000 lines).
- **No pilot in this group.** The model page is `he.physics.university-1#0` (rows, one assumption a
  line, relations with `display`, guarded inverses through `div`, sign conventions in the
  assumptions). Biology pages copy its shape.
- **Word rules.** The Grades 9–12 rules hold for college: sentences ≤ 35 words, ≤ 10 values a page,
  2–4 assumptions, the name first on every value ("Equilibrium potential (E_K)"). No reason to relax
  them: every page below fits.
- **Notation.** Each course's textbook symbols: p, q, w̄ (population genetics); r, K, N, λ
  (ecology); E_ion, V_m, z (membranes); K_d, θ, n_H (binding); σ, ε, E, η, τ (biomechanics); Q, ΔP,
  μ, τ_w, Re (flow); D, J, k_La (transport); C, V, CL, k, t½, AUC (pharmacokinetics). Unicode
  subscripts where the font has them (N₀, C₀, t½), an underscore otherwise (E_K, k_La). Logarithms:
  `ln` for natural, `log` for base 10, always written; exponentials as `e^(−kt)`.
- **Constants** (fixed in the assumptions, never a value to type unless a page varies it):
  R = 8.314 J/(mol·K) (0.08206 L·atm/(mol·K); 0.00831 L·MPa/(mol·K) for water potential);
  F = 96,485 C/mol; body temperature 37 °C = 310 K, where 2.303RT/F = 61.5 mV (Nernst and Goldman
  pages use 61.5 mV ÷ z with log; a `T` value appears only on the page that varies it); ATP
  hydrolysis ΔG°′ = −30.5 kJ/mol; glucose oxidation −2870 kJ/mol; g = 9.8 m/s²; blood density
  1060 kg/m³; blood viscosity 3.5 mPa·s; culture medium 1.0 mPa·s; sound in soft tissue 1540 m/s;
  proton γ/2π = 42.58 MHz/T; a dalton-per-amino-acid average of 110 Da.
- **Units.** SI with the units biologists use: mM and nM for concentration, mV for potentials, MPa
  and GPa for tissues and implants, mmHg for blood pressure, mL/min and L/min for flows, mg/L and
  L/h for drugs, cm²/s for diffusivity, h⁻¹ and day⁻¹ for rate constants, kDa for polymers. Most are
  not in `src/engine/units.ts` yet (engine need 1). No page waits on it: a missing unit is a fixed
  label in the formula's unit until need 1 adds the family and its menu (CFU/mL, cM, bp and %
  stay fixed for good).
- **Calculus in the steps.** College biology uses the solutions of its differential equations,
  not the solving: each page states the model ODE in an assumption ("The population grows as
  dN/dt = rN(1 − N/K)") and the steps work its closed form (N = K ÷ (1 + ((K − N₀) ÷ N₀)e^(−rt))).
  No page differentiates or integrates symbolically; an area under a curve (AUC) is its closed form
  D ÷ CL. The Grade 6-on written work applies: rule, rearrangement, numbers in, one simplifying
  stage a line, the answer with its unit.
- **Statistics.** Chi-square goodness of fit (Mendelian ratios, Hardy–Weinberg) uses the existing
  `normalCurve` chi-square mode with df and α = 0.05; the decision reads "fits" or "does not fit".
- **Rows vs equation.** Every page here is rows (named science quantities, units that change).
  None takes an `equation`.
- **Layouts (36 pages).** Sorts (19): `principles-1#1~organelles`, `principles-2#0`,
  `principles-2#1`, `principles-2#4~biomes`, `genetics#0~modes`, `genetics#2~mutations`,
  `cell-molecular#3~checkpoints`, `microbiology#0`, `microbiology#2~transfer`,
  `ecology#1~interactions`, `evolution#3`, `evolution#3~modes`, `anatomy-physiology#0`,
  `anatomy-physiology#0~epithelia`, `anatomy-physiology#1~lever-class`, `biomaterials#1~classes`,
  `bioinstrumentation#2~modalities`, `tissue-engineering#0~fabrication`,
  `tissue-engineering#2~types`. Sequences (9): `principles-1#3~stages`, `cell-molecular#1~pathway`,
  `cell-molecular#3`, `microbiology#1~growth-curve`, `anatomy-physiology#1~cross-bridge`,
  `biomechanics#2~phases`, `biomaterials#0`, `biomaterials#3~design-controls`,
  `tissue-engineering#1~adhesion`. Explores (7): `principles-1#2~respiration` (`organelleEnergy`),
  `principles-2#1~key` (`dichotomousKey`), `principles-2#3~feedback` (`feedbackLoop`),
  `cell-molecular#2` (`geneExpression`), `microbiology#3~stages` (`immuneStages`),
  `ecology#2~cycles` (`nitrogenCycle`), `evolution#2` (`cladogram`). Observe (1):
  `anatomy-physiology#2~action-potential` (`min` −90 mV and `guides`). Every other page is a
  calculator: in this group the quantity is the lesson far more often than in Grade 9 biology.
- **Marks.** ⏳ marks a page that can't ship until a picture (Pn) or engine need lands. "later Pn"
  marks a page that ships now on the interim picture named and is upgraded when Pn lands.
- **No page.** None of the 53 topics is left without a page; topics that are only vocabulary
  (speciation, biocompatibility, tissues) get a sort or sequence rather than an invented quantity.
- **Overlaps settled (one idea, one page).** Hardy–Weinberg lives in `genetics#3` (Principles II
  and Evolution link to it). Selection lives in `evolution#0`; drift and heterozygosity loss in
  `evolution#1`; effective population size in `ecology#3`. The molecular clock lives in
  `evolution#2~distance` (with Jukes–Cantor), not in Principles II. Exponential growth with a
  doubling time lives in `microbiology#1` (cells in culture use it too); logistic growth in
  `ecology#0`. Mitotic index and phase lengths live in `principles-1#3~mitotic-index`; the Cell &
  Molecular cell-cycle topic is a sequence that links to it. Joint levers: the A&P page is the
  simple lever (no limb weight), the Biomechanics page adds the limb's weight and the joint force.
  Receptor occupancy (`cell-molecular#1`) is the one binding page; cell adhesion
  (`tissue-engineering#1`) is about ligand spacing instead.
- **What the engine can't do yet** (part 4): unit families for concentration, viscosity,
  diffusivity, flow, rate constants, stress and frequency (need 1); `!!` and base-10 `log` in step
  text (need 2); Σ is already read term by term (the s.9 Simpson page), so the fixed-count sums here
  (four classes, three genotypes, four ages) write their terms out (need 3 is only a check); log
  axes (need 6); the Hill, Bateman, repeated-dose and real-exponent function forms (pictures P10,
  P30, P36); page limits such as N₀ < K, p < 0.75, C_out ≤ C_in, r_i < r_o (need 4).
- **Page count:** 53 main pages + 87 problem types = **140 pages** (104 calculators, 36 layouts);
  **26 wait** (⏳) on a picture or engine need; 43 more ship now and are upgraded later (an interim
  picture, text cards or a linear axis, marked "later").

---

## Principles of Biology I (`he.biology.principles-1`)

### 1. he.biology.principles-1#0 — Chemistry of life

- **Courses teach:** OpenStax Biology 2e ch. 2 (water, pH), 3 (macromolecules); the solution and
  dilution arithmetic of the first labs.
- **Tests ask:**

  | Question type                                 | Page      | Mark   |
  | --------------------------------------------- | --------- | ------ |
  | grams of solute for a stock of given molarity | main      | Solves |
  | volume of stock for a working dilution (C₁V₁) | ~dilution | Solves |
  | [H⁺] from pH and how many times more acidic   | ~ph       | Solves |
  | water molecules released building a polymer   | ~polymer  | Solves |
  | mass of a protein from its length             | ~polymer  | Solves |

- **Main — BUILD `he.biology.principles-1#0`:** `beaker` `solution: { mode: 'molarity', moles: 'n',
volume: 'V', molarity: 'C', solute: 'NaCl' }`. Values: mass m (0.001–5000 g), molar mass M (1–10⁶
  g/mol), moles n (mol), volume V (0.001–100 L), molarity C (mM; a fixed label until need 1 adds M,
  μM, nM). Relations: n = m ÷ M; C = n ÷ V. Assumptions: the solute dissolves completely; V is the
  final volume of solution, not the water added. Example: 2.922 g NaCl (58.44 g/mol) in 0.500 L → n
  = 0.0500 mol, C = 0.100 M = 100 mM. startWith m, M, V.
- **~dilution — BUILD:** `beaker` `solution: { mode: 'dilution', stock: { molarity: 'C1', volume:
'V1' }, diluted: { molarity: 'C2', volume: 'V2' }, water: 'W' }`. Relations: C₁V₁ = C₂V₂;
  W = V₂ − V₁. Limit: C₂ ≤ C₁. Example: 1.0 M stock to 250 mL of 40 mM → V₁ = 10 mL, water 240 mL.
  Use line: "Use this for 'How much 1 M stock makes 250 mL of 40 mM buffer?'"
- **~ph — BUILD:** `phScale` (the [H⁺] as 10ⁿ). Values pH (0–14), [H⁺] (M), second pH, ratio.
  Relations: [H⁺] = 10^(−pH); ratio = 10^(pH₂ − pH₁). Example: blood 7.4 → 3.98 × 10⁻⁸ M; stomach
  pH 2 is 10^5.4 = 251,000 times more acidic.
  Use line: "Use this for 'How many times more acidic is pH 2 than pH 7.4?'"
- **~polymer — BUILD:** `macromolecules` (`macro: { kind: 'polypeptide', count }`, "…" past 4).
  Values: monomers n (2–5000), water released w, average residue mass (110 Da), polymer mass (kDa).
  Relations: w = n − 1; mass = n × 110 Da + 18 Da (the ends' water kept once). Assumptions: each
  bond releases one water (condensation); 110 Da already has the lost water taken out. Example: 300
  amino acids → 299 water, 33.0 kDa. Use line: "Use this for 'A protein has 300 amino acids. How
  many water molecules were released, and about what is its mass?'"
- **Verdict:** 4 calculators; the five common types Solve (the M and mM menu comes with need 1).

### 2. he.biology.principles-1#1 — Cell structure

- **Courses teach:** Biology 2e ch. 4 (cell size, surface-to-volume, prokaryote and eukaryote,
  organelles); the microscope lab.
- **Tests ask:**

  | Question type                                   | Page        | Mark   |
  | ----------------------------------------------- | ----------- | ------ |
  | why cells are small: surface area to volume     | main        | Solves |
  | actual size from a micrograph and magnification | ~micrograph | Solves |
  | which organelle is in plant, animal, prokaryote | ~organelles | Solves |

- **Main — BUILD:** `curvedSolid` sphere (radius r labeled; later P1 adds the SA ÷ V readout and a
  second, doubled cell beside it). Values: radius r (0.1–1000 μm), surface area A (μm²),
  volume V (μm³), ratio A ÷ V (per μm). Relations: A = 4πr²; V = (4/3)πr³; A ÷ V = 3 ÷ r.
  Assumptions: the cell is a sphere; nutrients enter through the surface but every bit of volume
  uses them, so a bigger cell feeds each μm³ through less membrane. Example: r = 5 μm →
  A = 314 μm², V = 524 μm³, A ÷ V = 0.6 per μm (r = 10 μm: 0.3 per μm). startWith r.
- **~micrograph — BUILD:** `fieldOfView` (field diameter, cells across). Values: image size (mm),
  magnification (×), actual size (μm), scale bar (μm). Relations: actual = image ÷ magnification.
  Example: 24 mm image at 4000× → 6.0 μm.
  Use line: "Use this for 'A cell is 24 mm long in a photo taken at 4000×. How long is it really?'"
- **~organelles — BUILD (sort):** bins "Prokaryotes and eukaryotes", "Eukaryotes only", "Plant cells
  only"; cards (Grade 6 `cell` card figure, one part lit): ribosome, plasma membrane, cytoplasm,
  DNA (all cells); nucleus, mitochondrion, endoplasmic reticulum, Golgi apparatus (eukaryotes);
  chloroplast, cell wall of cellulose, central vacuole (plant). Intro: "Bacteria have a cell wall
  too, but not of cellulose." Sentence: "Every cell has a membrane, ribosomes and DNA."
- **Verdict:** 3 pages (1 layout); the three common types Solve, the main's two-cell picture comes
  later (P1).

### 3. he.biology.principles-1#2 — Metabolism

- **Courses teach:** Biology 2e ch. 6 (free energy, ATP, enzymes), 7 (respiration), 8
  (photosynthesis).
- **Tests ask:**

  | Question type                                  | Page         | Mark   |
  | ---------------------------------------------- | ------------ | ------ |
  | is a coupled reaction spontaneous (sum of ΔG)  | main         | Solves |
  | ATP per glucose; efficiency of respiration     | ~atp-yield   | Solves |
  | where each stage happens, what goes in and out | ~respiration | Solves |
  | ΔG in the cell from ΔG°′ and concentrations    | ~delta-g     | Solves |

- **Main — BUILD:** `energyProfile` `mode: 'ladder'` with ⏳ P2 (`quantity: 'G'`, kJ/mol labels).
  Values: ΔG of the uphill reaction ΔG₁ (−100 to 100 kJ/mol), ATP used (1–3), ΔG of ATP hydrolysis
  (−30.5 fixed), total ΔG. Relations: ΔG = ΔG₁ + n × (−30.5). Assumptions: free energies add when
  reactions share an intermediate; ΔG < 0 runs forward on its own. Example: glutamate + NH₃ →
  glutamine, +14.2 kJ/mol, with one ATP → 14.2 − 30.5 = −16.3 kJ/mol, so it runs. startWith ΔG₁, n.
- **~atp-yield — BUILD:** `bars` (glucose's 2870 kJ/mol beside ATP's share). Values: glucose (mol),
  ATP per glucose (allowed 30, 32, 36, 38; default 32), energy kept (kJ), efficiency (%). Relations:
  kept = ATP × 30.5; efficiency = kept ÷ 2870. Example: 32 ATP → 976 kJ, 34.0%. Assumption: 30–32
  is today's count; older books say 36–38, which the menu keeps for their questions.
  Use line: "Use this for 'How efficient is respiration if one glucose makes 32 ATP?'"
- **~delta-g — BUILD:** `energyProfile` ladder (⏳ P2). Values ΔG°′, T (allowed 298, 310 K),
  [products], [reactants] (mM), Q, ΔG. Relations: Q = [P] ÷ [R]; ΔG = ΔG°′ + RT ln Q. Example: ΔG°′
  = +7.5 kJ/mol, Q = 0.01 at 310 K → 7.5 + 2.577 × (−4.605) = −4.37 kJ/mol (forward in the cell).
  Use line: "Use this for 'With ΔG°′ = +7.5 kJ/mol and products at 1% of reactants, does the
  reaction run forward at 37 °C?'"
- **~respiration — BUILD (explore, `organelleEnergy`):** scenes glycolysis (cytoplasm, 2 ATP net),
  Krebs cycle (matrix, CO₂ out), electron transport (cristae, O₂ in, most ATP), then the light
  reactions and Calvin cycle; each scene's caption names its inputs and outputs.
- **Verdict:** 4 pages (1 layout); the four types Solve once P2 lands (⏳ main, ~delta-g).

### 4. he.biology.principles-1#3 — Cell division

- **Courses teach:** Biology 2e ch. 10 (cell cycle, mitosis), 11 (meiosis, independent assortment).
- **Tests ask:**

  | Question type                                     | Page           | Mark   |
  | ------------------------------------------------- | -------------- | ------ |
  | chromosomes, chromatids, DNA (c) at each stage    | main           | Solves |
  | gametes possible from independent assortment (2ⁿ) | main           | Solves |
  | length of mitosis from a mitotic index            | ~mitotic-index | Solves |
  | order the stages of mitosis or meiosis            | ~stages        | Solves |

- **Main — BUILD:** `cellDivision` (2n, n; later P3 adds chromatids and the DNA content c a stage).
  Values: diploid number 2n (2–100, even), haploid n, chromatids in a G2 cell, DNA in G1 (2c),
  gamete DNA (1c), gamete combinations 2ⁿ. Relations: n = 2n ÷ 2; chromatids = 2 × 2n; combinations
  = 2ⁿ. Assumptions: G1 cells have 2c, S doubles it to 4c, each meiotic division halves it; crossing
  over is left out of 2ⁿ. Example: 2n = 46 → n = 23, 92 chromatids, 2²³ = 8,388,608 gametes.
  startWith 2n.
- **~mitotic-index — BUILD:** `pieChart` (cells by phase). Values: cells in mitosis, cells counted,
  index (%), cycle length (h), time in mitosis (h). Relations: index = mitosis ÷ counted; time =
  index × cycle. Assumption: the cells divide out of step, so the share in a phase is its share of
  the time. Example: 20 of 400 cells, 24 h cycle → 5%, 1.2 h. Use line: "Use this for 'Of 400 root
  tip cells, 20 are in mitosis. How long does mitosis last in a 24 h cycle?'"
- **~stages — BUILD (sequence):** card figure `cellDivision` `{ stage, diploid: 4 }`: interphase,
  prophase, prometaphase, metaphase, anaphase, telophase, cytokinesis, spans 22, 0.3, 0.2, 0.3,
  0.1, 0.4, 0.7 h (24 h). A second order for meiosis I and II is a separate page if asked.
- **Verdict:** 3 pages (1 layout); the four types Solve, the main's chromatid line comes later (P3).

### 5. he.biology.principles-1#4 — Genetics

- **Courses teach:** Biology 2e ch. 12 (Mendel, monohybrid, dihybrid, test crosses, product rule).
- **Tests ask:**

  | Question type                                          | Page          | Mark   |
  | ------------------------------------------------------ | ------------- | ------ |
  | monohybrid and test-cross ratios                       | main          | Solves |
  | dihybrid 9:3:3:1, chance of one phenotype              | main          | Solves |
  | AaBbCc × AaBbCc: chance of one genotype (product rule) | ~product-rule | Solves |

- **Main — BUILD:** `punnettSquare` with `inheritance: { pattern: 'dihybrid', firstB, secondB,
letterB: 'B' }`. Values: parent 1's dominant alleles for A (0–2) and B (0–2), parent 2's, boxes
  with both dominant traits (of 16), with neither, chance of both dominant. Example: AaBb × AaBb →
  9, 1, 9/16. startWith the four allele counts.
- **~product-rule — BUILD:** `treeDiagram` (one branch per gene). Values: genes (1–6), chance per
  gene (allowed 1/4, 1/2, 3/4, 1), chance of all. Relation: P = p₁ × p₂ × … (equal genes: pⁿ).
  Example: aabbcc from two AaBbCc parents → (1/4)³ = 1/64. Assumption: the genes assort
  independently (different chromosomes).
  Use line: "Use this for 'Two AaBbCc parents: what is the chance of an aabbcc child?'"
- **Verdict:** 2 calculators; the three types Solve.

---

## Principles of Biology II (`he.biology.principles-2`)

### 6. he.biology.principles-2#0 — Evolution

- **Courses teach:** Biology 2e ch. 18 (evidence, homology), 19 (population genetics; taught in
  `genetics#3` here).
- **Tests ask:** sort the evidence (main, Solves); Hardy–Weinberg frequency (link to
  `genetics#3`, Solves there); selection over generations (link to `evolution#0`).
- **Main — BUILD (sort):** bins "Homologous structure", "Analogous structure", "Vestigial
  structure"; cards (HH icons `human arm bones`, `bat wing bones`, `whale flipper bones`, `cat leg
bones`, `insect wing`, plus later P4 icons: whale pelvis, human appendix, bird wing beside a
  butterfly wing, shark fin beside a dolphin flipper). Intro: "Homologous parts share an ancestor's
  plan; analogous parts share a job." Sentence: "Shared bones in different jobs point to a common
  ancestor."
- **Verdict:** 1 layout; ships with the five drawn cards, four more later (P4).

### 7. he.biology.principles-2#1 — Biodiversity

- **Courses teach:** Biology 2e ch. 20–29 (classification, domains, the major groups).
- **Tests ask:** which domain or kingdom (main); identify with a key (~key); counting tree
  topologies is in `evolution#2`.
- **Main — BUILD (sort):** bins with the HH icons `domain Bacteria`, `domain Archaea`, `domain
Eukarya` (`figure` on each bin); cards: E. coli, methanogen in a cow's gut, a halophile in a salt
  pond, yeast, oak, amoeba, mushroom, Streptococcus, a thermophile in a hot spring. Sentence:
  "Archaea look like bacteria but share key genes with eukaryotes."
- **~key — BUILD (explore, `dichotomousKey`):** five invertebrates keyed in four questions (jointed
  legs? six legs? shell? segments?), a scene per specimen traced.
- **Verdict:** 2 layouts; both common types Solve.

### 8. he.biology.principles-2#2 — Plant form and function

- **Courses teach:** Biology 2e ch. 30 (water potential, transpiration, stomata).
- **Tests ask:**

  | Question type                                    | Page           | Mark   |
  | ------------------------------------------------ | -------------- | ------ |
  | solute potential of a sucrose solution (AP item) | main           | Solves |
  | which way water moves between cell and solution  | main           | Solves |
  | transpiration rate from a potometer              | ~transpiration | Solves |

- **Main — BUILD:** `membrane` `transport: 'osmosis'` with ⏳ P5 (`psi`: Ψ written on each side,
  water's arrow toward the lower Ψ). Values: ionization constant i (allowed 1, 2, 3), molarity C
  (0–5 M), temperature T (273–323 K), solute potential Ψs (MPa), pressure potential Ψp (−2 to 2
  MPa), water potential Ψ (MPa), cell's Ψ (MPa). Relations: Ψs = −iCRT (R = 0.00831 L·MPa/(mol·K));
  Ψ = Ψs + Ψp. Assumptions: water moves from higher to lower Ψ; an open beaker has Ψp = 0. Example:
  0.15 M sucrose at 295 K → Ψs = −0.368 MPa; Ψp = 0.20 → Ψ = −0.168 MPa. startWith i, C, T, Ψp.
- **~transpiration — BUILD:** `bars` (water lost per interval). Values: water lost (mL), time (min),
  leaf area (cm²), rate (μL/(cm²·min) fixed label). Relation: rate = lost ÷ (area × time). Example:
  0.90 mL in 30 min from 150 cm² → 0.200 μL/(cm²·min). Use line: "Use this for 'A shoot of 150 cm²
  of leaves loses 0.90 mL in 30 min. What is its transpiration rate?'"
- **Verdict:** 2 calculators (⏳ main on P5); the three types Solve.

### 9. he.biology.principles-2#3 — Animal form and function

- **Courses teach:** Biology 2e ch. 33 (body plans, metabolic rate and size, homeostasis).
- **Tests ask:** metabolic rate from mass, per kilogram (main, Solves); a negative feedback loop
  (~feedback, Solves); surface to volume (link to `principles-1#1`).
- **Main — BUILD:** `functionGraph` `family: 'power'` (a = 70, p = 3, q = 4, the animal's point
  traced; later need 6 for log–log axes, linear meanwhile). Values: body mass M (0.002–5000 kg),
  basal rate B (kcal/day), rate per kilogram (kcal/(kg·day)). Relations: B = 70M^0.75; per kg =
  B ÷ M. Assumptions: Kleiber's law fits mammals at rest; small animals burn more per kilogram.
  Example: 64 kg → 64^0.75 = 22.63, B = 1584 kcal/day, 24.7 per kg; a 25 g mouse → 4.40 kcal/day,
  176 per kg. startWith M.
- **~feedback — BUILD (explore, `feedbackLoop`):** scenes body temperature (−), blood glucose with
  insulin and glucagon (−), childbirth with oxytocin (+), blood clotting (+).
- **Verdict:** 2 pages (1 layout); the main's log–log view later need 6.

### 10. he.biology.principles-2#4 — Ecology

- **Courses teach:** Biology 2e ch. 44 (biomes), 46 (energy flow, trophic levels).
- **Tests ask:** energy reaching the top level (main, Solves); pyramid of numbers upside down
  (Partly: the Grade 9 page's `measure: 'numbers'`); biomes by climate (~biomes, Solves).
- **Main — BUILD:** `energyPyramid` (levels 4, `percent: 'e'`). Values: producers' energy
  (kJ/(m²·yr)), transfer efficiency e (1–20%, default 10), primary, secondary, tertiary consumers.
  Relations: each level = the one below × e. Example: 25,000 kJ/(m²·yr) at 10% → 2500, 250, 25.
- **~biomes — BUILD (sort):** bins with the H3D biome icons; cards by climate ("under 25 cm of rain,
  hot days and cold nights" …), two a biome.
- **Verdict:** 2 pages (1 layout); the three types Solve. The efficiencies inside a level are
  `ecology#2`.

---

## Genetics (`he.biology.genetics`)

### 11. he.biology.genetics#0 — Pedigrees and Mendelian genetics

- **Courses teach:** Online Open Genetics ch. 3–5 and 7 (pedigrees, chi-square), Biology 2e 12–13;
  MIT 7.03 problem sets (pedigree probability).
- **Tests ask:**

  | Question type                                                 | Page        | Mark           |
  | ------------------------------------------------------------- | ----------- | -------------- |
  | chance a child is affected, unaffected sibling of an affected | main        | Solves         |
  | chi-square: does 95:28:27:10 fit 9:3:3:1?                     | ~chi-square | Solves         |
  | mode of inheritance from a pedigree                           | ~modes      | Solves (⏳ P7) |
  | modified ratios (9:7, 9:3:4, 12:3:1, 15:1)                    | ~epistasis  | Solves         |

- **Main — BUILD:** `treeDiagram` (interim) later P6 (a `pedigree` calculator picture: the family
  with 2/3 and the partner's chance written on the people). Values: chance the parent is a carrier
  (default 2/3, an unaffected sib of an affected), chance the partner is a carrier (0–1), chance of
  an affected child, of an affected first child. Relations: P = p₁ × p₂ × 1/4. Assumptions:
  autosomal recessive; an unaffected sib of an affected child is a carrier 2 times in 3 (AA is ruled
  out). Example: 2/3 × 1/25 × 1/4 = 1/150 = 0.0067. startWith p₂.
- **~chi-square — BUILD:** `normalCurve` chi-square (df 3, α 0.05, the statistic shaded). Values:
  four observed counts, total, expected ratio (allowed 9:3:3:1, 1:1:1:1, 9:3:4, 9:7 as 3 classes),
  χ², df, decision. Relations: E_i = total × share; χ² = Σ (O − E)² ÷ E. Example: 95, 28, 27, 10 of
  160 → E = 90, 30, 30, 10; χ² = 0.278 + 0.133 + 0.300 + 0 = 0.711 < 7.815, fits. Σ is written term
  by term. Use line: "Use this for 'An F2 gives 95, 28, 27 and 10. Does it fit 9:3:3:1?'"
- **~modes — BUILD (sort, ⏳ P7 pedigree cards):** bins autosomal dominant, autosomal recessive,
  X-linked recessive; eight small pedigrees, each with one deciding clue (two unaffected parents
  with an affected daughter; an affected father with all daughters affected …). Intro names the
  clue to look for.
- **~epistasis — BUILD:** `bars` (classes out of 16). Values: offspring N, ratio (allowed 9:7,
  9:3:4, 12:3:1, 15:1, 13:3), expected count per class. Example: 9:3:4 with 160 → 90, 30, 40.
  Use line: "Use this for 'A 9:3:4 cross gives 160 offspring. How many are expected in each class?'"
- **Verdict:** 4 pages (1 layout); main ships on `treeDiagram` (later P6); ~modes ⏳ P7.

### 12. he.biology.genetics#1 — Linkage and mapping

- **Courses teach:** Online Open Genetics ch. 7 (linkage, recombination, mapping); MIT 7.03.
- **Tests ask:**

  | Question type                                     | Page         | Mark   |
  | ------------------------------------------------- | ------------ | ------ |
  | map distance from a test cross                    | main         | Solves |
  | gene order and distances from a three-point cross | ~three-point | Solves |
  | coefficient of coincidence and interference       | ~three-point | Solves |

- **Main — BUILD:** ⏳ P8 `linkageMap` (two loci on a chromosome, cM to scale, recombinants drawn as
  crossed strands). Values: parental offspring, recombinant offspring, total, RF (%), distance (cM).
  Relations: total = parental + recombinant; RF = recombinant ÷ total; distance = 100 × RF.
  Limit: RF ≤ 50% (genes farther apart assort independently). Example: 418 + 422 parental, 78 + 82
  recombinant → 160 of 1000, 16 cM.
- **~three-point — BUILD (⏳ P8 three loci):** Values: distance A–B, distance B–C (cM), offspring N,
  expected double crossovers, observed double crossovers, coincidence, interference. Relations:
  expected = (d₁ ÷ 100)(d₂ ÷ 100)N; c.o.c. = observed ÷ expected; I = 1 − c.o.c. Assumption: the
  middle gene is the one that switches in the double crossovers. Example: 12 cM and 20 cM, N = 1000
  → expected 24, observed 15, c.o.c. 0.625, I = 0.375. Use line: "Use this for 'Genes 12 cM and 20
  cM apart give 15 double crossovers in 1000. What is the interference?'"
- **Verdict:** 2 calculators, both ⏳ P8.

### 13. he.biology.genetics#2 — Molecular genetics

- **Courses teach:** Biology 2e ch. 14–15 (replication, transcription, translation), 17 (PCR).
- **Tests ask:**

  | Question type                                 | Page       | Mark   |
  | --------------------------------------------- | ---------- | ------ |
  | codons and amino acids from a gene's length   | main       | Solves |
  | copies after n PCR cycles, with an efficiency | ~pcr       | Solves |
  | silent, missense, nonsense or frameshift      | ~mutations | Solves |

- **Main — BUILD:** `dnaStrand` `gene: { bases, stop: true }`. Values: coding bases (mRNA open
  reading frame, 6–30,000 nt), codons, amino acids, protein mass (kDa). Relations: codons = bases ÷
  3; amino acids = codons − 1 (the stop codon codes none); mass = amino acids × 0.110 kDa. Limit:
  bases a multiple of 3. Example: 1500 nt → 500 codons, 499 amino acids, 54.9 kDa.
- **~pcr — BUILD:** `gel` `pcr: { cycles, start, copies }`. Values: starting copies N₀, cycles n
  (0–45), efficiency E (0–1, default 1), copies N. Relation: N = N₀(1 + E)ⁿ. Example: 100 copies, 30
  cycles, E = 0.9 → 1.9³⁰ × 100 = 2.30 × 10¹⁰ (E = 1: 1.07 × 10¹¹). Use line: "Use this for 'How
  many copies do 100 templates make after 30 cycles at 90% efficiency?'"
- **~mutations — BUILD (sort):** bins silent, missense, nonsense, frameshift; cards are original
  base changes shown on the `dnaStrand`-style codon strip (later P9 card figure `codons`, the old
  and new codon and amino acid). Ships with text cards first; the drawn figures replace them when
  they land.
- **Verdict:** 3 pages (1 layout); the sort ships with text codons (later P9).

### 14. he.biology.genetics#3 — Population genetics (Hardy–Weinberg)

- **Courses teach:** Biology 2e ch. 19; Online Open Genetics ch. 17.
- **Tests ask:**

  | Question type                                        | Page           | Mark   |
  | ---------------------------------------------------- | -------------- | ------ |
  | carriers from a disease's incidence (q² → 2pq)       | main           | Solves |
  | allele frequency from genotype counts; is it in H–W? | ~genotype-test | Solves |
  | X-linked: affected males vs females                  | ~x-linked      | Solves |

- **Main — BUILD:** `alleleFrequencies` (`p`, `q`, `genotypes: ['P2', 'H', 'Q2']`). Values: p, q,
  p², 2pq, q² (each 0–1), plus "1 in" forms of q² and 2pq. Relations: p + q = 1; the three
  genotypes. Assumptions: random mating, no selection, drift, migration or mutation; the trait is
  autosomal recessive so q² is the affected share. Example: 1 in 2500 affected → q = 0.02,
  p = 0.98, 2pq = 0.0392 (1 in 25.5). startWith q².
- **~genotype-test — BUILD:** `alleleFrequencies` fixed, beside `normalCurve` chi-square (df 1).
  Values: AA, Aa, aa counts, N, p, three expected counts, χ². Relations: p = (2AA + Aa) ÷ 2N; E = N
  × (p², 2pq, q²). Example: 380, 440, 180 → p = 0.6; E = 360, 480, 160; χ² = 1.11 + 3.33 + 2.50 =
  6.94 > 3.841, not in equilibrium (too few heterozygotes). Σ is written term by term (9 values).
  Use line: "Use this for 'A sample has 380 AA, 440 Aa and 180 aa. Is it in Hardy–Weinberg
  equilibrium?'"
- **~x-linked — BUILD:** `punnettSquare` `inheritance: { pattern: 'xLinked' }` (interim). Values q,
  affected males (q), affected females (q²), carrier females (2pq). Example: q = 0.08 → males 8%,
  females 0.64%, carriers 14.7%. Use line: "Use this for '8% of men are color-blind. What share of
  women are, and what share carry it?'"
- **Verdict:** 3 calculators; the three types Solve.

---

## Cell & Molecular Biology (`he.biology.cell-molecular`)

### 15. he.biology.cell-molecular#0 — Membrane biology

- **Courses teach:** Biology 2e ch. 5; A&P 2e 12.4 (resting potential); MIT 7.06 / 6.021J notes.
- **Tests ask:**

  | Question type                                        | Page     | Mark   |
  | ---------------------------------------------------- | -------- | ------ |
  | equilibrium potential of K⁺, Na⁺, Cl⁻, Ca²⁺ (Nernst) | main     | Solves |
  | resting potential from three ions (Goldman)          | ~goldman | Solves |
  | osmotic pressure of a solution                       | ~osmotic | Solves |

- **Main — BUILD:** `membrane` `transport: 'facilitated'` with ⏳ P5 (`potential`: + and − charges
  lined along each face, a voltmeter reading V in mV). Values: charge z (allowed −1, 1, 2), outside
  concentration C_o (0.001–1000 mM), inside C_i (mM), equilibrium potential E (mV). Relation:
  E = (61.5 mV ÷ z) log(C_o ÷ C_i) at 37 °C. Assumptions: only this ion can cross; E is inside
  relative to outside; at 20 °C the factor is 58 mV (assumption, not a value). Example: K⁺ 5 mM out,
  140 in → 61.5 × log(0.0357) = 61.5 × (−1.447) = −89.0 mV. startWith z, C_o, C_i.
- **~goldman — BUILD (⏳ P5):** Values: K⁺, Na⁺, Cl⁻ outside and inside (6, mM), relative
  permeabilities P_Na and P_Cl (P_K = 1 fixed), V_m. Relation: V_m = 61.5 log((K_o + P_Na·Na_o +
  P_Cl·Cl_i) ÷ (K_i + P_Na·Na_i + P_Cl·Cl_o)). Assumption: chloride's inside and outside swap
  because its charge is −1. Example: K 5/140, Na 145/15, Cl 110/10, P 1 : 0.04 : 0.45 → 15.3 ÷
  190.1, V_m = −67.3 mV. (9 values.) Use line: "Use this for 'With these K⁺, Na⁺ and Cl⁻ levels and
  permeabilities 1 : 0.04 : 0.45, what is the resting potential?'"
- **~osmotic — BUILD:** `membrane` `transport: 'osmosis'`. Values: i (1–3), C (M), T (K, default
  310), π (atm). Relation: π = iCRT. Example: 0.15 M NaCl (i = 2) at 310 K → 0.3 × 0.08206 × 310 =
  7.63 atm. Use line: "Use this for 'What osmotic pressure does 0.15 M NaCl have at body
  temperature?'"
- **Verdict:** 3 calculators; main and ~goldman ⏳ P5.

### 16. he.biology.cell-molecular#1 — Signal transduction

- **Courses teach:** Biology 2e ch. 9; MIT 7.06 (receptor binding, amplification).
- **Tests ask:**

  | Question type                                 | Page           | Mark            |
  | --------------------------------------------- | -------------- | --------------- |
  | fraction of receptors bound at a ligand level | main           | Solves          |
  | ligand needed for 90% occupancy               | main           | Solves          |
  | cooperative binding (Hill)                    | ~hill          | Solves (⏳ P10) |
  | molecules made by a cascade                   | ~amplification | Solves          |
  | order of a G-protein pathway                  | ~pathway       | Solves          |

- **Main — BUILD:** `functionGraph` `family: 'rational'`, `p: 1, q: 0, r: 1, s: 'Kd'` (θ against
  [L], K_d marked at half). Values: ligand [L] (0–10⁶ nM), dissociation constant K_d (0.001–10⁶ nM),
  fraction bound θ (0–1). Relation: θ = [L] ÷ (K_d + [L]); [L] = K_d θ ÷ (1 − θ). Limit: θ < 1.
  Assumption: one site per receptor, ligand far in excess. Example: K_d = 2 nM, [L] = 6 nM → 0.75;
  90% needs 18 nM. startWith K_d, [L].
- **~hill — BUILD (⏳ P10):** Values [L] and half-saturation K in one unit (nM; mmHg of O₂ for
  hemoglobin), Hill coefficient n_H (0.5–4), θ. Relation: θ = [L]ⁿ ÷ (Kⁿ + [L]ⁿ). Example: K = 26
  mmHg, n = 2.8, at 40 mmHg → (40/26)^2.8 = 3.34 → θ = 0.770. Use line: "Use this for 'With K = 26
  and n = 2.8, how saturated is the protein at 40?'"
- **~amplification — BUILD:** `bars` per stage (log, later need 6). Values: receptors (1–1000), G
  proteins per receptor, cAMP per enzyme per second, kinases per cAMP (0–1000 each), total.
  Relation: product. Example: 1 × 20 × 1000 → 20,000 cAMP a second. Use line: "Use this for 'One
  receptor activates 20 G proteins, each enzyme makes 1000 cAMP a second. How many cAMP a second?'"
- **~pathway — BUILD (sequence):** hormone binds receptor → G protein swaps GDP for GTP → adenylyl
  cyclase makes cAMP → protein kinase A → phosphorylated target → response; then shut-off (GTP
  hydrolysis, phosphodiesterase). Spans in seconds.
- **Verdict:** 4 pages (1 layout); ~hill ⏳ P10, ~amplification's log bars later need 6.

### 17. he.biology.cell-molecular#2 — Gene regulation

- **Courses teach:** Biology 2e ch. 16 (operons, eukaryotic control); qPCR in lab courses.
- **Tests ask:** lac operon on or off with lactose and glucose (main, Solves); fold change by ΔΔCt
  (~fold-change, Solves).
- **Main — BUILD (explore, `geneExpression`):** scenes: lac with no lactose (repressor on), lactose
  (repressor off), glucose high (no activator; low expression), trp with tryptophan (repressor on
  with its corepressor; later the figure's `corepressor` signal, P11).
- **~fold-change — BUILD:** ⏳ P12 (`functionGraph` logistic twice with a threshold line and the Ct's
  marked). Values: target Ct treated and control, reference Ct treated and control, ΔCt each, ΔΔCt,
  fold change. Relations: ΔCt = Ct_target − Ct_ref; ΔΔCt = ΔCt_treated − ΔCt_control; fold =
  2^(−ΔΔCt). Assumption: both genes double each cycle (100% efficiency). Example: 24 and 27 against
  18 and 18 → ΔCt 6 and 9, ΔΔCt = −3, 8-fold up. Use line: "Use this for 'The target's Ct drops from
  27 to 24 while the reference stays at 18. What is the fold change?'"
- **Verdict:** 2 pages (1 layout); ~fold-change ⏳ P12, the trp scene ⏳ P11.

### 18. he.biology.cell-molecular#3 — Cell-cycle control

- **Courses teach:** Biology 2e ch. 10.3 (checkpoints, cyclins, p53, cancer).
- **Tests ask:** what each checkpoint checks (main, Solves); phase length from a cell count
  (link to `principles-1#3~mitotic-index`).
- **Main — BUILD (sequence):** G1 (11 h; ends at the G1/S checkpoint: DNA undamaged, cell big
  enough, cyclin D–CDK4/6 frees E2F from Rb) → S (8 h) → G2 (4 h; ends at the G2/M checkpoint: DNA
  copied fully, cyclin B–CDK1 rises) → M (1 h; the spindle checkpoint holds anaphase until every
  kinetochore is attached). Spans add to 24 h; each card names its checkpoint in one line.
- **~checkpoints — BUILD (sort):** bins G1/S, G2/M, spindle; cards: DNA damage found by p53; cell
  big enough; enough nutrients; replication finished; chromosomes attached to both poles; tension
  across sister kinetochores.
- **Verdict:** 2 layouts.

---

## Microbiology (`he.biology.microbiology`)

### 19. he.biology.microbiology#0 — Microbial structure

- **Courses teach:** OpenStax Microbiology ch. 2 (microscopy), 3 (cell morphology, Gram stain).
- **Tests ask:** Gram-positive or negative feature (main, Solves); resolution limit of a lens
  (~resolution, Solves); total magnification (~resolution, Solves).
- **Main — BUILD (sort, later P13 icons):** bins Gram-positive, Gram-negative, both; cards: thick
  peptidoglycan, teichoic acids, outer membrane with LPS, a thin peptidoglycan layer, stains purple,
  stains pink, ribosomes 70S, plasma membrane. Bin figures: the two cell walls in section. Ships
  with text cards first; the drawn figures replace them when they land.
- **~resolution — BUILD:** `table` sweeping NA (0.25, 0.65, 0.95, 1.25) for d; later P13
  (`fieldOfView` with `resolution`: two points closing until they blur). Values: wavelength λ
  (380–700 nm), numerical aperture NA (0.1–1.4), resolution d (nm), objective (×), eyepiece (×),
  total (×). Relations: d = 0.61λ ÷ NA; total = objective × eyepiece. Example: 550 nm, NA 1.25 → 268
  nm; 100× × 10× = 1000×. Use line: "Use this for 'What is the smallest detail a 1.25 NA objective
  resolves in 550 nm light?'"
- **Verdict:** 2 pages (1 layout); both ship now (text cards, `table`), later P13.

### 20. he.biology.microbiology#1 — Microbial growth

- **Courses teach:** Microbiology ch. 9 (generation time, growth curve, plate counts), 13 (D-value).
- **Tests ask:**

  | Question type                                   | Page          | Mark            |
  | ----------------------------------------------- | ------------- | --------------- |
  | generations and generation time from two counts | main          | Solves          |
  | cells after t hours from the generation time    | main          | Solves          |
  | CFU/mL from a plate in a dilution series        | ~plate-count  | Solves (⏳ P14) |
  | name the phases of the growth curve             | ~growth-curve | Solves          |
  | time to kill to 10⁻⁶ with a D-value             | ~d-value      | Solves          |

- **Main — BUILD:** `functionGraph` `family: 'exponential'`, `a: 'N0', b: 2` over generations (later
  need 6 for the semi-log view). Values: starting cells N₀ (1–10¹²), final N, generations n, time t
  (min), generation time g (min). Relations: n = log(N ÷ N₀) ÷ log 2 (= 3.3 log(N ÷ N₀)); g = t ÷ n;
  N = N₀ × 2ⁿ. Assumptions: log phase, every cell divides in two; g is the doubling time. Example:
  1.0 × 10³ to 1.024 × 10⁶ in 5 h → n = 10, g = 30 min. startWith N₀, N, t.
- **~plate-count — BUILD (⏳ P14 `dilutionSeries`):** Values: colonies (30–300 countable), dilution
  factor (10⁻¹–10⁻¹⁰), volume plated (mL), CFU/mL. Relation: CFU/mL = colonies ÷ (dilution ×
  volume). Limit: colonies 30–300 (outside it the assumption says count another plate). Example: 156
  colonies at 10⁻⁶, 0.1 mL → 1.56 × 10⁹ CFU/mL. Use line: "Use this for '156 colonies grow from 0.1
  mL of the 10⁻⁶ dilution. How many CFU/mL were in the culture?'"
- **~growth-curve — BUILD (sequence):** lag, log, stationary, death; spans 2, 6, 10, 30 h; each card
  a curve segment (`scatter` card figure) and a one-line reason.
- **~d-value — BUILD:** `functionGraph` exponential base 10 (later need 6). Values N₀, D (min), t,
  N, log reductions. Relations: N = N₀ × 10^(−t ÷ D). Example: 10⁶ spores, D₁₂₁ = 0.2 min, 12D = 2.4
  min → 10⁻⁶ (one survivor in a million cans). Use line: "Use this for 'With D₁₂₁ = 0.2 min, how
  long does a 12D cook take, and how many of 10⁶ spores survive?'"
- **Verdict:** 4 pages (1 layout); ~plate-count ⏳ P14, the log views later need 6.

### 21. he.biology.microbiology#2 — Microbial genetics

- **Courses teach:** Microbiology ch. 11 (transformation, transduction, conjugation, mutation rate).
- **Tests ask:** transformation efficiency (main, Solves); which transfer route (~transfer,
  Solves); mutation rate by fluctuation test (~mutation-rate, Solves).
- **Main — BUILD:** `dilutionSeries` plate (later P14), `bars` meanwhile. Values: colonies, volume
  plated (μL), recovery volume (μL), DNA used (ng), transformants, efficiency (per μg). Relations:
  transformants = colonies × recovery ÷ plated; efficiency = transformants ÷ (DNA ÷ 1000). Example:
  120 colonies from 100 of 1000 μL, 10 ng → 1200, 1.2 × 10⁵ per μg.
- **~mutation-rate — BUILD:** `pieChart` (cultures with none). Values: cultures, cultures with no
  mutants, P₀, mutations per culture m, cells per culture N, rate μ. Relations: P₀ = none ÷
  cultures; m = −ln P₀; μ = m ÷ N. Example: 20 of 50 → P₀ = 0.4, m = 0.916, N = 2 × 10⁸ → 4.6 ×
  10⁻⁹. Use line: "Use this for '20 of 50 cultures of 2 × 10⁸ cells have no mutants. What is the
  mutation rate?'"
- **~transfer — BUILD (sort):** bins transformation, transduction, conjugation; cards: naked DNA
  from a dead cell; a phage carries the gene; a pilus joins two cells; F plasmid copied; competent
  cells; DNase stops it (transformation only).
- **Verdict:** 3 pages (1 layout); main ships on `bars` (later P14).

### 22. he.biology.microbiology#3 — Immunology and pathogens

- **Courses teach:** Microbiology ch. 16 (epidemiology, R₀), 18–20 (adaptive immunity, titers).
- **Tests ask:**

  | Question type                                     | Page      | Mark   |
  | ------------------------------------------------- | --------- | ------ |
  | herd immunity threshold from R₀; vaccine coverage | main      | Solves |
  | antibody titer from a two-fold dilution row       | ~titer    | Solves |
  | primary vs secondary response                     | ~response | Solves |
  | order of an adaptive response                     | ~stages   | Solves |

- **Main — BUILD:** ⏳ P15 (`sample` `herd` option: 100 people, immune shaded, one case's R
  contacts). Values: R₀ (1–20), threshold (%), vaccine effectiveness (%), coverage needed (%).
  Relations: threshold = 1 − 1/R₀; coverage = threshold ÷ effectiveness. Limit: coverage ≤ 100%
  (else the page says vaccination alone can't reach it). Example: R₀ = 12 → 91.7%; 95% effective →
  96.5%.
- **~titer — BUILD:** ⏳ P14 (`dilutionSeries` tubes, two-fold). Values: first dilution (1:10),
  positive tubes k, titer. Relation: titer = first × 2^(k − 1). Example: positive through tube 6 →
  10 × 32 = 1:320. Use line: "Use this for 'Two-fold dilutions from 1:10 are positive through tube 6. What is the titer?'"
- **~response — BUILD:** `immuneResponse` (first, second, days). Values: peak levels, days to peak,
  ratio. Example: 100 then 1500 → 15 times higher, at 6 days not 12.
  Use line: "Use this for 'Why is the antibody peak higher and sooner after a booster?'"
- **~stages — BUILD (explore, `immuneStages`):** scenes antigen, helper T, B cells, antibodies,
  killer T, memory.
- **Verdict:** 4 pages (1 layout); main and ~titer ⏳ P15, P14.

---

## Ecology (`he.biology.ecology`)

### 23. he.biology.ecology#0 — Population dynamics

- **Courses teach:** Biology 2e ch. 45 (exponential, logistic, life tables, mark–recapture).
- **Tests ask:**

  | Question type                             | Page        | Mark   |
  | ----------------------------------------- | ----------- | ------ |
  | logistic growth rate at N; fastest at K/2 | main        | Solves |
  | population after t years (logistic)       | main        | Solves |
  | R₀ and generation time from a life table  | ~life-table | Solves |
  | population size by mark–recapture         | ~recapture  | Solves |

- **Main — BUILD:** `functionGraph` `family: 'logistic'` (K dashed; the s.9 picture). Values: r
  (0–5 per yr), K (1–10⁹), N₀, t (yr), N, growth rate dN/dt (per yr). Relations: N = K ÷ (1 +
  ((K − N₀) ÷ N₀)e^(−rt)); dN/dt = rN(K − N) ÷ K. Limit: N₀ < K. Example: r = 0.5, K = 1000,
  N = 250 → 93.75 a year; the most is rK/4 = 125 at N = 500. startWith r, K, N₀.
- **~life-table — BUILD:** `table` (x, lₓ, mₓ, lₓmₓ). Values: lₓ and mₓ for ages 0–3 (8), R₀, T
  (10). Relations: R₀ = Σlₓmₓ; T = Σxlₓmₓ ÷ R₀. Example: lₓ 1, 0.5, 0.25, 0.1; mₓ 0, 1, 2, 2 → R₀ =
  1.2, T = 2.1 ÷ 1.2 = 1.75 yr. Σ is written term by term. Use line: "Use this for 'From this life
  table, what are R₀ and the generation time?'"
- **~recapture — BUILD:** `sample` (the second catch ringed, marked ones lit). Values marked M,
  caught C, recaptured R, estimate N. Relation: N = MC ÷ R. Example: 40, 50, 8 → 250.
  Use line: "Use this for '40 marked, 50 caught later, 8 of them marked. How many are in the pond?'"
- **Verdict:** 3 calculators; the four types Solve.

### 24. he.biology.ecology#1 — Community interactions

- **Courses teach:** Biology 2e ch. 45.6 (competition, predation, diversity); ecology texts on
  Lotka–Volterra.
- **Tests ask:** Shannon index and evenness (main, Solves); outcome of competition (~competition,
  Solves ⏳); name the interaction (~interactions, Solves).
- **Main — BUILD:** `pieChart` (each species' share). Values: counts of up to 4 species, shares,
  H′, evenness. Relations: pᵢ = nᵢ ÷ Σn; H′ = −Σ pᵢ ln pᵢ; J = H′ ÷ ln S. Example: 50, 30, 20 →
  H′ = 0.347 + 0.361 + 0.322 = 1.030, J = 0.937. Σ is written term by term.
- **~competition — BUILD (⏳ P16 `phasePlane`):** Values K₁, K₂, α, β, N₁*, N₂*. Relations: N₁* = (K₁
  − αK₂) ÷ (1 − αβ); N₂* = (K₂ − βK₁) ÷ (1 − αβ). Limits: αβ < 1, both N* > 0 (else the page names
  the winner). Example: 500, 400, 0.5, 0.6 → 428.6 and 142.9, they coexist. Use line: "Use this for
  'K₁ = 500, K₂ = 400, α = 0.5, β = 0.6. Do the species coexist, and at what sizes?'"
- **~interactions — BUILD (sort):** bins +/+ mutualism, +/− predation or parasitism, −/−
  competition, +/0 commensalism; eight cards.
- **Verdict:** 3 pages (1 layout); ~competition ⏳ P16.

### 25. he.biology.ecology#2 — Ecosystem energetics

- **Courses teach:** Biology 2e ch. 46 (GPP, NPP, efficiencies, biogeochemical cycles).
- **Tests ask:** NPP from GPP and respiration (main); assimilation, production and trophic
  efficiency (main); residence time of carbon (~residence); a cycle's process (~cycles).
- **Main — BUILD:** `bars` `flows: { out: ['Ra', 'egested', 'Rh'] }`. Values: GPP, plant respiration
  Rₐ, NPP, ingested I, assimilated A, herbivore production P (all kJ/(m²·yr)), assimilation
  efficiency, production efficiency, trophic efficiency (10). Relations: NPP = GPP − Rₐ; A ÷ I;
  P ÷ A; P ÷ NPP. Example: 20,000 − 11,000 = 9000; I = 1800, A = 720 (40%), P = 72 (10%) → 0.8%.
- **~residence — BUILD:** `reserve`. Values stock (Gt C), flux (Gt C/yr), residence time (yr).
  Example: 750 ÷ 120 = 6.25 years. Use line: "Use this for 'The air holds 750 Gt of carbon and
  exchanges 120 Gt a year. How long does carbon stay?'"
- **~cycles — BUILD (explore, `nitrogenCycle`):** scenes fixation, nitrification, assimilation,
  ammonification, denitrification, each caption naming the microbe and the form of nitrogen (the
  carbon cycle is the Grade 7 and 9 pages' `carbonCycle`; college adds no scene to it).
- **Verdict:** 3 pages (1 layout); all Solve.

### 26. he.biology.ecology#3 — Conservation biology

- **Courses teach:** Biology 2e ch. 47 (species–area, island biogeography, small populations).
- **Tests ask:** species left after habitat loss (~species-area); effective population size
  from the sex ratio (main); the 50/500 rule (main assumption).
- **Main — BUILD:** `bars` (males, females, Nₑ). Values: breeding males N_m, females N_f, census
  N, Nₑ, Nₑ ÷ N. Relation: Nₑ = 4N_mN_f ÷ (N_m + N_f). Assumption: Nₑ is the size of an ideal
  population that would lose diversity as fast; heterozygosity loss is `evolution#1`. Example: 10
  males, 40 females → Nₑ = 32 (64% of 50).
- **~species-area — BUILD:** `functionGraph` `family: 'power'` (a = c, later P36 `exponent` read
  from z; z allowed 0.15, 0.2, 0.25, 0.3, 0.35 until then, as p/q 3/20 … 7/20). Values c, z
  (0.1–0.4), area A (km²), species S, area kept (%), species kept (%). Relations: S = cA^z; kept =
  (share)^z. Example: c = 20, z = 0.25, 10,000 km² → 200 species; half the area → 0.841, 168
  species. Use line: "Use this for 'If a reserve keeps half its area and z = 0.25, what share of
  species remains?'"
- **Verdict:** 2 calculators; both Solve.

---

## Evolutionary Biology (`he.biology.evolution`)

### 27. he.biology.evolution#0 — Natural selection

- **Courses teach:** population genetics chapters of open evolution texts; MIT 7.03 (selection).
- **Tests ask:** p after one generation of selection (main); response to selection R = h²S
  (~breeders); relative fitness from survival (main).
- **Main — BUILD:** `alleleFrequencies` with ⏳ P17 (`after`: p′ beside p, Δp arrowed). Values: p, q,
  fitnesses w_AA, w_Aa, w_aa (0–1), mean fitness w̄, p′, Δp. Relations: w̄ = p²w_AA + 2pqw_Aa +
  q²w_aa; p′ = (p²w_AA + pqw_Aa) ÷ w̄. Example: p = 0.5, w = 1, 1, 0.5 → w̄ = 0.875, p′ = 0.571,
  Δp = 0.071. startWith p, the three w.
- **~breeders — BUILD:** `normalCurve` two curves (⏳ P18 `shift`, parents and selected group
  shaded). Values h² (0–1), selection differential S, response R, mean before, mean after. Relation:
  R = h²S. Example: h² = 0.4, S = 2 cm → R = 0.8 cm. Use line: "Use this for 'With h² = 0.4,
  breeders 2 cm taller than average give offspring how much taller?'"
- **Verdict:** 2 calculators, both ⏳ (P17, P18).

### 28. he.biology.evolution#1 — Genetic drift

- **Courses teach:** drift, fixation, heterozygosity decay, bottlenecks and founders.
- **Tests ask:** heterozygosity after t generations (main); chance a new allele fixes, time to
  fix (~fixation).
- **Main — BUILD:** later P19 `driftPaths` (12 populations' p across generations, H dashed);
  meanwhile `functionGraph` exponential. Values Nₑ (2–10⁶), H₀, t, H_t, share kept. Relation: H_t =
  H₀(1 − 1/(2Nₑ))ᵗ. Example: Nₑ = 50, H₀ = 0.5, t = 100 → 0.99¹⁰⁰ = 0.366, H = 0.183.
- **~fixation — BUILD:** `bars`. Values N, fixation chance (1/(2N)), mean time (4N generations).
  Example: N = 100 → 0.005, 400 generations. Assumption: a neutral new mutation.
  Use line: "Use this for 'What is the chance a new neutral mutation fixes in a population of 100?'"
- **Verdict:** 2 calculators; main ships on `functionGraph` (later P19).

### 29. he.biology.evolution#2 — Phylogenetics

- **Courses teach:** Biology 2e ch. 20 (cladistics, parsimony, molecular clocks).
- **Tests ask:** read a cladogram (main, Solves); number of possible trees (~tree-count);
  corrected distance and divergence time (~distance).
- **Main — BUILD (explore, `cladogram`):** six taxa (lamprey, shark, frog, lizard, mouse, human),
  traits jaws, lungs, amnion, hair; scenes light a clade, ring a sister pair, show that frog and
  lizard share lungs but not the amnion.
- **~tree-count — BUILD:** `table` (n, rooted, unrooted). Values taxa n (3–20), rooted trees,
  unrooted trees. Relations: rooted = (2n − 3)!!; unrooted = (2n − 5)!!. Example: n = 5 → 105, 15.
  ⏳ need 2 (double factorial in steps).
  Use line: "Use this for 'How many rooted trees can five species form?'"
- **~distance — BUILD:** `table` sweeping p (0.05, 0.15, 0.30, 0.50, 0.70) for d beside p (the
  correction growing toward saturation at 0.75); later a `functionGraph` `log` with `horizontal`.
  Values differences, sites, p, d (Jukes–Cantor), rate μ (per site per yr), time T. Relations: p =
  differences ÷ sites; d = −(3/4) ln(1 − 4p/3); T = d ÷ (2μ). Limit: p < 0.75. Example: 30 of 200 →
  p = 0.15, d = 0.167, μ = 10⁻⁹ → 8.37 × 10⁷ yr. Use line: "Use this for 'Two genes differ at 30 of
  200 sites. What is the Jukes–Cantor distance, and how long ago did they split?'"
- **Verdict:** 3 pages (1 layout); ~tree-count ⏳ need 2.

### 30. he.biology.evolution#3 — Speciation

- **Courses teach:** Biology 2e ch. 18.2–18.3 (barriers, allopatric and sympatric speciation).
- **Tests ask:** prezygotic or postzygotic barrier (main); mode of speciation (~modes).
- **Main — BUILD (sort):** bins prezygotic, postzygotic; cards: different mating seasons; mating
  calls differ; pollen can't grow on the stigma; hybrid mule is sterile; hybrid embryo dies early;
  hybrid's offspring weak (F2 breakdown); different habitats on one island; flower shapes fit
  different pollinators.
- **~modes — BUILD (sort):** bins allopatric, sympatric, parapatric; cards: a river splits a range;
  polyploid plant in one field; island colonists; a cline along a mountain slope; host shift in
  apple maggot flies.
- **Verdict:** 2 layouts.

---

## Human Anatomy & Physiology (`he.biology.anatomy-physiology`)

### 31. he.biology.anatomy-physiology#0 — Tissues

- **Courses teach:** OpenStax A&P 2e ch. 4.
- **Tests ask:** name the tissue type and the epithelium's shape and layers.
- **Main — BUILD (sort, ⏳ P20 icons):** bins epithelial, connective, muscle, nervous; cards: skin's
  surface, bone, blood, adipose, skeletal, cardiac, smooth, neuron with glia.
- **~epithelia — BUILD (sort, ⏳ P20):** bins simple squamous, simple cuboidal, simple columnar,
  stratified squamous; cards by place and job (air sacs, kidney tubules, gut lining, skin).
- **Verdict:** 2 layouts, both ⏳ P20.

### 32. he.biology.anatomy-physiology#1 — Musculoskeletal system

- **Courses teach:** A&P 2e ch. 9–11 (joints, levers, sliding filaments).
- **Tests ask:** muscle force for a load in the hand (main); class of lever (~lever-class); order
  the cross-bridge cycle (~cross-bridge).
- **Main — BUILD:** `simpleMachine` lever (later P21 `limb: 'forearm'` drawing). Values: load L (N),
  load arm d_L (cm), muscle arm d_M (cm), muscle force F_M (N), mechanical advantage. Relations: F_M
  d_M = L d_L; MA = d_M ÷ d_L. Assumptions: the elbow is the fulcrum, the forearm held level; its
  own weight is left out here (`biomechanics#1` adds it). Example: 20 N at 32 cm, biceps at 4 cm →
  160 N, MA = 0.125.
- **~lever-class — BUILD (sort):** first (nodding the head), second (rising on tiptoe), third
  (biceps curl); cards say where the fulcrum, effort and load sit.
- **~cross-bridge — BUILD (sequence):** Ca²⁺ binds troponin → myosin binds actin → power stroke
  (ADP and Pi leave) → ATP binds, myosin lets go → ATP split, head recocked.
- **Verdict:** 3 pages (2 layouts); main ships on the plain lever (later P21).

### 33. he.biology.anatomy-physiology#2 — Nervous system

- **Courses teach:** A&P 2e ch. 12 (action potential, conduction, synapses).
- **Tests ask:** reflex time from conduction and synapses (main); phases of an action potential
  (~action-potential).
- **Main — BUILD:** `neuron` (length, speed, time). Values: sensory length, motor length (m), speed
  (m/s), synapses, delay per synapse (ms), total time (ms). Relation: t = (L_s + L_m) ÷ v + k ×
  delay. Example: 1.0 m + 1.0 m at 60 m/s, two 0.5 ms synapses → 33.3 + 1.0 = 34.3 ms.
- **~action-potential — BUILD (observe):** columns 0–5 ms every 0.5 ms, `min` −90 mV, guides at −70
  (resting) and −55 (threshold); the pattern sentence names depolarization, repolarization and the
  undershoot.
- **Verdict:** 2 pages (1 layout).

### 34. he.biology.anatomy-physiology#3 — Cardiovascular and respiratory systems

- **Courses teach:** A&P 2e ch. 19.4 (cardiac output), 20.2 (MAP, resistance), 22.3 (ventilation).
- **Tests ask:**

  | Question type                                    | Page         | Mark   |
  | ------------------------------------------------ | ------------ | ------ |
  | cardiac output from heart rate and stroke volume | main         | Solves |
  | mean arterial pressure from 120/80               | main         | Solves |
  | ejection fraction                                | ~ejection    | Solves |
  | minute and alveolar ventilation                  | ~ventilation | Solves |

- **Main — BUILD:** later P22 `heartPump`; meanwhile `bars`. Values: HR (30–220 per min), SV (mL),
  CO (L/min), systolic, diastolic (mmHg), MAP, TPR (mmHg·min/L). Relations: CO = HR × SV;
  MAP = DBP + (SBP − DBP) ÷ 3; TPR = MAP ÷ CO. Example: 70 × 70 mL = 4.9 L/min; 120/80 → 93.3 mmHg;
  TPR = 19.0.
- **~ejection — BUILD:** `bars` (EDV, ESV and SV; later P22 the ventricle filling and emptying).
  Values EDV, ESV, SV, EF, HR, CO (mL, %, per min, L/min). Relations: SV = EDV − ESV; EF = SV ÷ EDV;
  CO = HR × SV. Example: 120 − 50 = 70 mL, EF 58.3%. Use line: "Use this for 'End-diastolic volume
  120 mL, end-systolic 50 mL. What are the stroke volume and ejection fraction?'"
- **~ventilation — BUILD:** `bars` (each breath split dead space / alveolar). Values VT, VD, f, VE,
  VA. Relations: VE = VT × f; VA = (VT − VD) × f. Example: 500, 150, 12 → 6.0 and 4.2 L/min. Use
  line: "Use this for 'Tidal volume 500 mL, dead space 150 mL, 12 breaths a minute. What is the
  alveolar ventilation?'"
- **Verdict:** 3 calculators; the four types Solve; main and ~ejection ship on `bars` (later P22).

---

## Biomechanics (`he.engineering.biomechanics`)

### 35. he.engineering.biomechanics#0 — Tissue mechanics

- **Courses teach:** MIT OCW 20.310J/2.797J (molecular, cellular and tissue biomechanics); the
  stress–strain chapters of biomechanics texts (tendon, ligament, cortical and trabecular bone).
- **Tests ask:**

  | Question type                                       | Page          | Mark   |
  | --------------------------------------------------- | ------------- | ------ |
  | stress, strain and stretch of a tendon under a load | main          | Solves |
  | modulus from a test's force and stretch             | main          | Solves |
  | bending stress in a hollow long bone                | ~bone-bending | Solves |
  | why a hollow bone is nearly as stiff as a solid one | ~bone-bending | Solves |

- **Main — BUILD `he.engineering.biomechanics#0`:** later P23 `tensileTest` (the specimen gripped, F
  arrows, L and ΔL bracketed; beside it the σ–ε curve with its toe region and the point at ε);
  meanwhile `functionGraph` linear through 0 (σ = Eε). Values: force F (0–10⁵ N), cross-section
  area A (0.1–5000 mm²), stress σ (MPa), modulus E (0.001–200 GPa), strain ε (0–0.5), resting
  length L (1–1000 mm), stretch ΔL (mm). Relations: σ = F ÷ A; ε = σ ÷ E; ΔL = εL. Assumptions: past
  the toe region the tissue is linear elastic; σ is engineering stress (the starting area); load
  along the fibers. Example: 2000 N on 50 mm² → 40 MPa; E = 1.2 GPa → ε = 0.0333 (3.33%),
  ΔL = 1.67 mm of 50 mm. startWith F, A, E, L.
- **~bone-bending — BUILD:** `table` sweeping r_i (0, 4, 8, 12 mm) for I and σ (later P23 `section:
'tube'`, the ring with its neutral axis and σ at the outer edge). Values: outer radius r_o (1–50
  mm), inner radius r_i (0–49 mm), second moment I (mm⁴), bending moment M (0–1000 N·m), stress σ
  (MPa), solid-bone I for comparison. Relations: I = π(r_o⁴ − r_i⁴) ÷ 4; σ = Mr_o ÷ I. Limit: r_i <
  r_o. Assumptions: the shaft is a round tube; the stress is largest at the outer surface. Example:
  15 and 8 mm → I = 36,544 mm⁴ (a solid 15 mm rod: 39,761, so 92% of the stiffness for 72% of the
  bone); 100 N·m → 41.0 MPa. Use line: "Use this for 'A femur shaft is a tube 30 mm across with a 16
  mm canal. What stress does 100 N·m of bending cause?'"
- **Verdict:** 2 calculators, both ship on interim pictures (later P23); MPa and GPa with need 1.

### 36. he.engineering.biomechanics#1 — Joint forces

- **Courses teach:** static joint models (elbow, hip, knee) in biomechanics texts; MIT 2.996-style
  notes.
- **Tests ask:**

  | Question type                                                | Page | Mark                                 |
  | ------------------------------------------------------------ | ---- | ------------------------------------ |
  | biceps force holding a ball, forearm's weight included       | main | Solves                               |
  | elbow joint reaction force                                   | main | Solves                               |
  | hip force in single-leg stance, as a multiple of body weight | ~hip | Solves                               |
  | muscle pulling at an angle (moment arm d sin θ)              | main | Partly (need the angle; see verdict) |

- **Main — BUILD:** `simpleMachine` lever, ⏳ P21 `limb: 'forearm'` (upper arm, elbow, forearm and
  hand to scale; the biceps' line, W_f at the forearm's center, the load at the hand, F_J at the
  elbow). Values: forearm weight W_f (0–100 N), its arm d_f (cm), load L (0–500 N), load arm d_L
  (cm), muscle arm d_M (1–10 cm), muscle force F_M (N), joint force F_J (N). Relations: F_M =
  (W_f d_f + L d_L) ÷ d_M; F_J = F_M − W_f − L. Assumptions: the forearm is level and still; muscle,
  weights and joint force are vertical; F_J > 0 means the upper arm pushes down on the forearm.
  Example: 15 N at 15 cm, 50 N at 35 cm, biceps at 4 cm → F_M = 1975 ÷ 4 = 493.8 N, F_J = 428.8 N.
  startWith L, d_L, W_f, d_f, d_M.
- **~hip — BUILD (⏳ P21 `limb: 'hip'`, pelvis on one leg):** Values: body weight W (100–2000 N),
  abductor arm d_ab (cm), weight arm d_W (cm), abductor force F_ab, joint force F_J, F_J ÷ W.
  Relations: F_ab = (5/6)W d_W ÷ d_ab; F_J = F_ab + (5/6)W. Assumptions: the stance leg is 1/6 of
  body weight, so 5/6 W acts at the body's center; forces vertical. Example: 700 N, 5 and 10 cm →
  F_ab = 1166.7 N, F_J = 1750 N = 2.5 W. Use line: "Use this for 'On one leg, how hard does the hip
  joint push when the abductors are half as far out as the body's weight?'"
- **Verdict:** 2 calculators, both ⏳ P21 (the forearm's weight is a second load); the angled muscle
  is a later option (`θ` on main, F_M d_M sin θ).

### 37. he.engineering.biomechanics#2 — Gait analysis

- **Courses teach:** gait chapters (stride, cadence, the gait cycle, ground reaction forces);
  Human Biomechanics (BCcampus Pressbooks).
- **Tests ask:**

  | Question type                                       | Page    | Mark   |
  | --------------------------------------------------- | ------- | ------ |
  | walking speed from step length and cadence          | main    | Solves |
  | Froude number; speed where walking turns to running | main    | Solves |
  | name and order the phases of the gait cycle         | ~phases | Solves |

- **Main — BUILD:** later P24 `footprints` (left and right prints to scale, a step and a stride
  bracketed, a metronome tick per step); meanwhile `bars`. Values: step length (0.1–3 m), cadence
  (20–250 steps/min), speed v (m/s), stride length (m), leg length L (0.3–1.2 m), Froude number Fr,
  walk–run speed (m/s). Relations: v = step × cadence ÷ 60; stride = 2 × step; Fr = v² ÷ (gL);
  v_run = √(0.5gL). Assumptions: steady level walking; a stride is two steps; people switch to a run
  near Fr = 0.5. Example: 0.70 m, 110 steps/min → 1.28 m/s, stride 1.40 m; L = 0.9 m → Fr = 0.187;
  running above 2.10 m/s. startWith step, cadence, L.
- **~phases — BUILD (sequence, ⏳ P24 card figure `gait`, a stick leg in each phase):** heel strike
  (0%), foot flat, midstance, heel off, toe off (60%), midswing; spans in % of the cycle (2, 10, 20,
  20, 8, 40); the strip adds to 100% with stance 60, swing 40.
- **Verdict:** 2 pages (1 layout); main ships on `bars` (later P24), ~phases ⏳ P24 cards.

### 38. he.engineering.biomechanics#3 — Viscoelasticity

- **Courses teach:** Maxwell, Kelvin–Voigt and standard linear solid models; creep and relaxation
  tests of cartilage and ligament.
- **Tests ask:** stress left after relaxation; creep strain at a time; time constant from E and η;
  which model shows creep with no flow.
- **Main — BUILD:** `functionGraph` `family: 'exponential'` decay (later P25 the spring and dashpot
  drawn beside, in series). Values: modulus E (0.01–10⁵ MPa), viscosity η (MPa·s), time constant τ
  (s), held strain ε₀ (0–0.5), starting stress σ₀ (MPa), time t (s), stress σ (MPa). Relations: τ =
  η ÷ E; σ₀ = Eε₀; σ = σ₀e^(−t/τ). Assumptions: a Maxwell solid (spring and dashpot in series) held
  at fixed strain; after one τ, 37% of the stress is left. Example: 10 MPa, 500 MPa·s → τ = 50 s; ε₀
  = 0.05 → σ₀ = 0.5 MPa; at 50 s, 0.184 MPa. startWith E, η, ε₀, t.
- **~creep — BUILD:** `functionGraph` exponential rise (later P25, the pair in parallel). Values σ,
  E, η, τ, t, ε, final strain. Relations: τ = η ÷ E; ε = (σ ÷ E)(1 − e^(−t/τ)). Assumption: a
  Kelvin–Voigt solid creeps toward σ ÷ E and never flows. Example: 0.5 MPa, 10 MPa, τ = 50 s, t =
  100 s → 0.05 × 0.865 = 0.0432. Use line: "Use this for 'A ligament model with E = 10 MPa and τ =
  50 s carries 0.5 MPa. What is its strain after 100 s?'"
- **Verdict:** 2 calculators; both Solve on `functionGraph`, P25 adds the model drawing.

---

## Biomaterials (`he.engineering.biomaterials`)

### 39. he.engineering.biomaterials#0 — Biocompatibility

- **Courses teach:** Ratner, Biomaterials Science (titles only) parts on host response; ISO 10993
  test families.
- **Tests ask:** order the foreign-body response (main, Solves); pass or fail an extract
  cytotoxicity test (~cytotoxicity, Solves).
- **Main — BUILD (sequence):** protein adsorption (seconds) → neutrophils arrive (hours) →
  macrophages (days) → foreign-body giant cells (1–2 weeks) → fibrous capsule (weeks to months).
  Spans in days (0.001, 0.1, 3, 10, 30); sentence: "Every implant is coated in protein before any
  cell arrives."
- **~cytotoxicity — BUILD:** `percentBar`. Values: sample absorbance A_s, blank A_b, control A_c
  (0–4), viability (%). Relation: viability = (A_s − A_b) ÷ (A_c − A_b). Limit: A_c > A_b.
  Assumptions: the dye's color tracks living cells; ISO 10993-5 calls under 70% viability
  cytotoxic. Example: 0.62, 0.05, 0.85 → 0.57 ÷ 0.80 = 71.3%, passes. Use line: "Use this for 'An
  extract reads 0.62 against a control of 0.85 and a blank of 0.05. Is it cytotoxic?'"
- **Verdict:** 2 pages (1 layout).

### 40. he.engineering.biomaterials#1 — Metals, polymers and ceramics in the body

- **Courses teach:** the classes of biomaterials, their moduli and uses; polymer molecular weight.
- **Tests ask:**

  | Question type                                        | Page              | Mark   |
  | ---------------------------------------------------- | ----------------- | ------ |
  | share of load an implant carries (stress shielding)  | main              | Solves |
  | Mn, Mw and dispersity of a polymer                   | ~molecular-weight | Solves |
  | which class (and why) for a hip, a suture, a coating | ~classes          | Solves |

- **Main — BUILD:** later P23 `tensileTest` `parallel` (implant and bone side by side under one
  load, each bar as wide as its share); meanwhile `percentBar`. Values: implant modulus E_i and area
  A_i, bone E_b and A_b, load F (N), implant share, bone stress (MPa). Relations: share = E_iA_i ÷
  (E_iA_i + E_bA_b); σ_b = F(1 − share) ÷ A_b. Assumption: bonded, so both strain the same. Example:
  Ti 110 GPa × 100 mm², bone 18 GPa × 300 mm² → 67.1% on the implant; 2000 N → bone carries 658 N,
  2.19 MPa. startWith E_i, A_i, E_b, A_b, F.
- **~molecular-weight — BUILD:** `bars` (chains at each mass). Values: three chain counts N₁…N₃ and
  masses M₁…M₃ (kDa), Mn, Mw, Đ (9). Relations: Mn = ΣNM ÷ ΣN; Mw = ΣNM² ÷ ΣNM; Đ = Mw ÷ Mn.
  Example: 10, 20, 10 chains at 10, 20, 40 kDa → Mn = 22.5, Mw = 27.8 kDa, Đ = 1.23. Σ is written
  term by term. Use line: "Use this for 'A PLGA sample has 10 chains of 10 kDa, 20 of 20 kDa and 10
  of 40 kDa. Find Mn, Mw and the dispersity.'"
- **~classes — BUILD (sort, later P26 icons):** bins metal, polymer, ceramic; cards Ti-6Al-4V hip
  stem, CoCrMo femoral head, 316L bone screw, UHMWPE cup liner, PMMA bone cement, PLGA suture,
  alumina head, hydroxyapatite coating. Intro: "Metals bear load, polymers bend or dissolve,
  ceramics wear little but crack." Ships with text cards first; the drawn figures replace them when
  they land.
- **Verdict:** 3 pages (1 layout); main ships on `percentBar` (later P23).

### 41. he.engineering.biomaterials#2 — Degradation

- **Tests ask:** molecular weight left after hydrolysis; half-life of a polyester; corrosion rate
  from a weight-loss test.
- **Main — BUILD:** `functionGraph` exponential decay. Values: starting Mn₀ (1–1000 kDa), rate
  constant k (0.001–1 per day), time t (days), Mn, half-life t½ (days). Relations: Mn = Mn₀e^(−kt);
  t½ = ln 2 ÷ k. Assumptions: bulk hydrolysis, first order in the ester bonds; mass loss starts
  later, once chains are short enough to dissolve. Example: 100 kDa, 0.05 per day → 49.7 kDa at
  14 days; t½ = 13.9 days. startWith Mn₀, k, t.
- **~corrosion — BUILD:** `table` sweeping the time (240, 480, 720 h). Values: mass lost W (g),
  area A (cm²), time T (h), density ρ (g/cm³), rate CR (mm/yr). Relation: CR = 87,600 W ÷ (ATρ)
  (8.76 × 10⁴ turns g, cm², h and g/cm³ into mm/yr). Example: 0.0050 g, 10 cm², 720 h, 8.0 g/cm³ →
  0.0076 mm/yr. Use line: "Use this for 'A 316L coupon of 10 cm² loses 5.0 mg in 30 days of
  saline. What is its corrosion rate?'"
- **Verdict:** 2 calculators.

### 42. he.engineering.biomaterials#3 — Implant design

- **Tests ask:** yearly wear of a polyethylene liner (Archard); fatigue safety factor; order of
  design controls.
- **Main — BUILD:** `bars` (wear per year, five years stacked). Values: wear factor k (10⁻⁸–10⁻⁴
  mm³/(N·m)), load F (N), sliding per step s (mm), steps per year n, wear V (mm³/yr). Relation:
  V = kFsn. Assumptions: Archard's law, wear grows with load and sliding distance; one step is one
  gait cycle. Example: 10⁻⁶ mm³/(N·m), 2000 N, 20 mm, 10⁶ steps → 40 mm³/yr. startWith k, F, s, n.
- **~safety-factor — BUILD:** `percentBar` (peak stress as a share of the endurance limit). Values
  endurance limit, peak stress (MPa), SF. Relation: SF = limit ÷ stress. Example: 500 ÷ 180 = 2.78.
  Use line: "Use this for 'A Ti alloy stem with a 500 MPa endurance limit sees 180 MPa. What is its
  safety factor?'"
- **~design-controls — BUILD (sequence):** user needs → design inputs → design outputs →
  verification (did we build it right) → validation (did we build the right thing) → transfer.
- **Verdict:** 3 pages (1 layout).

---

## Biotransport (`he.engineering.biotransport`)

### 43. he.engineering.biotransport#0 — Diffusion in tissue

- **Courses teach:** MIT OCW 20.330J (Fick's laws, diffusion time); Truskey, Transport Phenomena
  in Biological Systems (titles only).
- **Tests ask:**

  | Question type                                  | Page   | Mark   |
  | ---------------------------------------------- | ------ | ------ |
  | time to diffuse 100 μm vs 1 cm                 | main   | Solves |
  | deepest tissue oxygen reaches from a capillary | ~krogh | Solves |
  | flux across a layer (Fick's first law)         | ~fick  | Solves |

- **Main — BUILD:** later P27 `diffusionProfile` (a slab with the source at one face, the spreading
  profile at t, L marked); meanwhile `functionGraph` `family: 'root'` (L against t). Values:
  diffusivity D (10⁻¹⁰–10⁻¹ cm²/s), distance L (μm), time t (s). Relation: t = L² ÷ (2D).
  Assumptions: one-dimensional spread; t is a typical time, not an exact arrival; doubling L takes
  four times as long. Example: O₂ in tissue, 2 × 10⁻⁵ cm²/s, 100 μm → 2.5 s; 1 cm → 25,000 s =
  6.9 h. startWith D, L.
- **~krogh — BUILD:** `functionGraph` `family: 'quadratic'`, `form: 'vertex'`, a = Q ÷ (2D), h = L,
  k = 0 (the oxygen profile falling to zero at L). Values: surface concentration C₀ (mol/cm³),
  D, consumption Q (mol/(cm³·s)), depth L (μm). Relation: L = √(2DC₀ ÷ Q). Assumptions: a flat
  layer fed from one face, steady state, uniform consumption, no flux at the far side. Example:
  2 × 10⁻⁷ mol/cm³, 2 × 10⁻⁵ cm²/s, 2 × 10⁻⁸ mol/(cm³·s) → 0.020 cm = 200 μm. Use line: "Use this
  for 'How thick can an engineered tissue be before its center runs out of oxygen?'"
- **~fick — BUILD:** `membrane` `transport: 'diffusion'`. Values D, ΔC (mM), thickness Δx (μm),
  flux J (mol/(cm²·s)). Relation: J = DΔC ÷ Δx. Example: 10⁻⁵ cm²/s, 0.1 mM, 10 μm → 10⁻⁹
  mol/(cm²·s). Use line: "Use this for 'Glucose crosses a 10 μm layer with a 0.1 mM difference.
  What is the flux?'"
- **Verdict:** 3 calculators; need 1 (cm²/s, mol/cm³); main ships on `functionGraph` (later P27).

### 44. he.engineering.biotransport#1 — Blood flow

- **Courses teach:** 20.330J (Poiseuille flow); physiology texts on resistance and shear.
- **Tests ask:**

  | Question type                             | Page      | Mark   |
  | ----------------------------------------- | --------- | ------ |
  | flow through a vessel from ΔP, r, L, μ    | main      | Solves |
  | flow change when the radius halves (1/16) | main      | Solves |
  | wall shear stress on the endothelium      | ~shear    | Solves |
  | is the flow laminar (Reynolds number)     | ~reynolds | Solves |

- **Main — BUILD:** later P28 `vesselFlow` (a vessel cut lengthwise, P₁ and P₂ at its ends, the
  parabolic velocity arrows, r and L bracketed); meanwhile `functionGraph` power (Q against r).
  Values: pressure drop ΔP (0–20,000 Pa; mmHg by menu), radius r (0.001–15 mm), length L (0.01–100
  cm), viscosity μ (0.5–10 mPa·s, default 3.5), flow Q (mL/min), resistance R (Pa·s/m³).
  Relations: Q = πΔPr⁴ ÷ (8μL); R = ΔP ÷ Q. Assumptions: steady laminar flow of a Newtonian fluid in
  a rigid straight tube; blood is close to Newtonian in vessels wider than about 0.5 mm. Example:
  100 Pa, 2 mm, 10 cm, 3.5 mPa·s → 1.80 × 10⁻⁶ m³/s = 108 mL/min (r = 1 mm: 6.7 mL/min). startWith
  ΔP, r, L, μ.
- **~shear — BUILD:** the main's `functionGraph` (later P28). Values μ, Q, r, τ_w (Pa). Relation:
  τ_w = 4μQ ÷ (πr³). Example: the main's numbers → 1.00 Pa (10 dyn/cm²). Use line: "Use this for
  'What shear stress does 108 mL/min put on the wall of a 2 mm-radius artery?'"
- **~reynolds — BUILD:** `table` sweeping r (later P28). Values Q, r, mean speed v, density ρ
  (default 1060 kg/m³), μ, Re. Relations: v = Q ÷ (πr²); Re = ρv(2r) ÷ μ. Assumption: below about
  2000 the flow is laminar. Example: 0.143 m/s, Re = 173. Use line: "Use this for 'Is blood flowing
  at 108 mL/min through a 4 mm vessel laminar?'"
- **Verdict:** 3 calculators on interim pictures (later P28); need 1 (mPa·s, mL/min).

### 45. he.engineering.biotransport#2 — Mass transfer

- **Courses teach:** dialysis and oxygenator chapters (clearance, Kt/V, mass-transfer
  coefficients).
- **Tests ask:** dialyzer clearance from inlet and outlet; Kt/V and urea reduction ratio; flux
  from a mass-transfer coefficient.
- **Main — BUILD:** later P29 `dialyzer` (blood one way, dialysate the other through a fiber bundle;
  inlet and outlet concentrations written); meanwhile `bars`. Values: blood flow Q_b (50–600
  mL/min), inlet C_in, outlet C_out (mg/dL), clearance K (mL/min), session t (min), body water V
  (L), Kt/V, URR (%). Relations: K = Q_b(C_in − C_out) ÷ C_in; URR = 1 − e^(−Kt/V). Limit: C_out ≤
  C_in. Assumptions: one well-mixed body pool; urea made during the session ignored. Example: 300,
  100 → 40 → K = 180 mL/min; 240 min, 40 L → Kt/V = 1.08, URR = 66%. startWith Q_b, C_in, C_out.
- **~mass-transfer — BUILD:** `membrane` `transport: 'diffusion'`. Values k (cm/s), area A (cm²),
  ΔC (mM), rate (μmol/s). Relation: rate = kAΔC. Example: 10⁻⁴ cm/s, 10,000 cm², 5 mM →
  5 μmol/s. Use line: "Use this for 'A 1 m² membrane with k = 10⁻⁴ cm/s sees a 5 mM difference.
  How fast does solute cross?'"
- **Verdict:** 2 calculators; main ships on `bars` (later P29).

### 46. he.engineering.biotransport#3 — Pharmacokinetics

- **Courses teach:** one-compartment models (IV bolus, infusion, repeated doses); MIT OCW HST.151
  (principles of pharmacology).
- **Tests ask:**

  | Question type                                 | Page             | Mark            |
  | --------------------------------------------- | ---------------- | --------------- |
  | concentration t hours after an IV dose        | main             | Solves          |
  | half-life from clearance and volume           | main             | Solves          |
  | steady-state level on repeated doses          | ~multiple-dosing | Solves (⏳ P30) |
  | infusion rate for a target level; time to 90% | ~infusion        | Solves          |
  | peak time after an oral dose                  | ~oral            | Solves (⏳ P30) |

- **Main — BUILD:** `functionGraph` exponential decay (later need 6 for semi-log). Values: dose D
  (0.01–10,000 mg), volume V (1–1000 L), clearance CL (0.01–100 L/h), rate constant k (h⁻¹), t½ (h),
  time t (h), concentration C (mg/L), AUC (mg·h/L). Relations: C₀ = D ÷ V; k = CL ÷ V; t½ = ln 2 ÷
  k; C = C₀e^(−kt); AUC = D ÷ CL. Assumptions: one well-mixed compartment, first-order elimination,
  dose given at once. Example: 500 mg, 50 L, 5 L/h → 10 mg/L, 0.1 h⁻¹, t½ = 6.93 h; 3.01 mg/L at 12
  h; AUC = 100 mg·h/L. startWith D, V, CL, t.
- **~multiple-dosing — BUILD (⏳ P30 `repeat` sawtooth):** Values D, τ (h), CL, V, k, average
  steady level C_ss (mg/L), accumulation factor. Relations: C_ss = D ÷ (CLτ); factor = 1 ÷ (1 −
  e^(−kτ)). Example: 500 mg every 8 h → 12.5 mg/L, factor 1.82. Use line: "Use this for 'A 500 mg
  dose every 8 h, clearance 5 L/h. What is the average steady-state level?'"
- **~infusion — BUILD:** `functionGraph` exponential rise to C_ss. Values rate R (mg/h), CL, C_ss,
  t½, time to 90% (h). Relations: C_ss = R ÷ CL; t₉₀ = 3.32 t½. Example: 50 mg/h → 10 mg/L; 23.0 h.
  Use line: "Use this for 'What infusion rate holds 10 mg/L when clearance is 5 L/h?'"
- **~oral — BUILD (⏳ P30 `bateman`):** Values F, D, V, k_a, k, t_max, C_max. Relations: t_max =
  ln(k_a ÷ k) ÷ (k_a − k); C = (FDk_a ÷ (V(k_a − k)))(e^(−kt) − e^(−k_at)). Limit: k_a ≠ k. Example:
  F = 1, 500 mg, 50 L, k_a = 1 h⁻¹, k = 0.1 h⁻¹ → t_max = 2.56 h, C_max = 7.74 mg/L.
- **Verdict:** 4 calculators; need 1 (mg/L, L/h, h⁻¹); two ⏳ P30.

---

## Bioinstrumentation (`he.engineering.bioinstrumentation`)

### 47. he.engineering.bioinstrumentation#0 — Biosensors

- **Courses teach:** Webster, Medical Instrumentation (titles only); open BME lab manuals
  (calibration, detection limit, strain gauges).
- **Tests ask:** concentration from a calibration line; limit of detection; enzyme electrode
  saturation; strain gauge bridge output.
- **Main — BUILD:** `scatter` with `leastSquares` (five standards, the reading's point traced to
  its concentration). Values: sensitivity m (nA/mM), blank b (nA), blank noise σ (nA), reading S
  (nA), concentration C (mM), limit of detection (mM). Relations: C = (S − b) ÷ m; LOD = 3σ ÷ m.
  Assumptions: the reading lies inside the linear range; LOD is where the signal stands three noise
  widths above the blank. Example: 2.5 nA/mM, 0.4 nA, 0.05 nA, 15.4 nA → 6.0 mM; LOD 0.06 mM.
  startWith m, b, σ, S.
- **~saturation — BUILD:** `functionGraph` `family: 'rational'` (p = i_max, q = 0, r = 1, s = K_m).
  Values i_max, K_m (mM), C, current i. Relation: i = i_maxC ÷ (K_m + C). Example: 100 nA, 5 mM,
  6 mM → 54.5 nA; linear only well under K_m. Use line: "Use this for 'Why does a glucose sensor
  read low at 20 mM?'"
- **~strain-gauge — BUILD (⏳ P31 `bridge`):** Values excitation V_ex (V), gauge factor GF (1–5),
  strain ε (με), output V_out (mV). Relation: V_out = V_exGFε ÷ 4. Assumption: one active gauge in a
  balanced quarter bridge, small strain. Example: 5 V, GF 2, 500 με → 1.25 mV. Use line: "Use this
  for 'A quarter bridge at 5 V with GF = 2 sees 500 με. What is the output?'"
- **Verdict:** 3 calculators; ~strain-gauge ⏳ P31; need 1 (nA, mM).

### 48. he.engineering.bioinstrumentation#1 — Biopotential amplifiers

- **Courses teach:** ECG and EMG front ends, differential and instrumentation amplifiers, CMRR.
- **Tests ask:** output with common-mode hum; CMRR in dB; instrumentation amplifier gain from R_g.
- **Main — BUILD:** later P31 `opAmp` (differential amplifier, the two electrodes, V_d and V_cm
  drawn as sources); meanwhile `bars` (signal and hum at input and output). Values: differential
  gain A_d (1–10⁶), CMRR (dB, 40–140), common-mode gain A_c, signal V_d (mV), common-mode V_cm (V),
  signal out (V), hum out (mV). Relations: A_c = A_d ÷ 10^(CMRR ÷ 20); out = A_dV_d; hum = A_cV_cm.
  Assumptions: an ideal op-amp apart from its CMRR; linear, no clipping. Example: 1000, 100 dB → A_c
  = 0.01; 1 mV → 1 V; 0.5 V of hum → 5 mV. startWith A_d, CMRR, V_d, V_cm.
- **~inamp — BUILD (⏳ P31):** Values R (kΩ), R_g (Ω), gain G. Relation: G = 1 + 2R ÷ R_g. Example:
  25 kΩ, 100 Ω → 501. Use line: "Use this for 'Which gain resistor gives a three-op-amp
  instrumentation amplifier a gain of 500?'"
- **Verdict:** 2 calculators, ⏳ P31 (shared with the Electronics plan if it requests op-amps).

### 49. he.engineering.bioinstrumentation#2 — Medical imaging basics

- **Courses teach:** X-ray attenuation, ultrasound echo ranging and reflection, MRI Larmor
  frequency; which modality uses ionizing radiation.
- **Tests ask:**

  | Question type                                   | Page        | Mark   |
  | ----------------------------------------------- | ----------- | ------ |
  | X-rays left after a thickness; half-value layer | main        | Solves |
  | depth from an echo's time                       | ~ultrasound | Solves |
  | share reflected at a fat–muscle boundary        | ~ultrasound | Solves |
  | Larmor frequency at 1.5 or 3 T                  | ~larmor     | Solves |
  | ionizing or not; anatomy or function            | ~modalities | Solves |

- **Main — BUILD:** later P32 `attenuation` (a beam through a slab, photons thinning, HVL marks);
  meanwhile `functionGraph` exponential decay. Values: attenuation coefficient μ (0.01–10 per cm),
  thickness x (cm), transmitted share I ÷ I₀ (%), half-value layer (cm). Relations: I ÷ I₀ =
  e^(−μx); HVL = ln 2 ÷ μ. Assumption: a narrow beam of one energy. Example: 0.2 per cm, 10 cm →
  13.5%; HVL = 3.47 cm. startWith μ, x.
- **~ultrasound — BUILD:** `table` sweeping t (later P32 `echo`). Values echo time t (μs), depth d
  (cm), impedances Z₁, Z₂ (MRayl), reflected share R (%). Relations: d = ct ÷ 2 (c = 1540 m/s); R =
  ((Z₂ − Z₁) ÷ (Z₂ + Z₁))². Example: 130 μs → 10.0 cm; fat 1.38, muscle 1.70 → 1.08%. Use line: "Use
  this for 'An echo returns after 130 μs. How deep is the boundary?'"
- **~larmor — BUILD:** `table` sweeping B (0.5, 1.5, 3, 7 T). Values B, f (MHz). Relation:
  f = 42.58B. Example: 1.5 T → 63.9 MHz. Use line: "Use this for 'At what frequency do protons
  resonate in a 3 T scanner?'"
- **~modalities — BUILD (sort, later P26 icons):** bins ionizing, non-ionizing; cards X-ray, CT,
  PET, SPECT, MRI, ultrasound, optical coherence tomography. Ships with text cards first; the drawn
  figures replace them when they land.
- **Verdict:** 4 pages (1 layout); main and ~ultrasound ship on `functionGraph` and `table` (later
  P32); ~modalities on text cards.

### 50. he.engineering.bioinstrumentation#3 — Signal filtering

- **Courses teach:** RC filters, cutoff frequency, Bode plots, sampling and aliasing.
- **Tests ask:** cutoff of an RC filter; gain at a frequency in dB; minimum sampling rate; alias of
  60 Hz.
- **Main — BUILD:** `table` sweeping f (f_c ÷ 10, f_c ÷ 2, f_c, 2f_c, 10f_c) for |H| and dB, with
  the table's `graph` under it; later P31 `filter` (the RC drawn) and need 6 (log-x Bode). Values R
  (Ω–MΩ), C (pF–μF), cutoff f_c (Hz), frequency f (Hz), gain |H|, gain (dB). Relations: f_c = 1 ÷
  (2πRC); |H| = 1 ÷ √(1 + (f ÷ f_c)²); dB = 20 log|H|. Example: 10 kΩ, 0.1 μF → 159 Hz; at 500 Hz,
  0.303 = −10.4 dB. startWith R, C, f.
- **~nyquist — BUILD:** `wave` (a sine sampled at f_s, the alias drawn dashed). Values highest
  frequency f_max, sampling rate f_s, alias frequency (Hz). Relations: f_s ≥ 2f_max; alias = |f −
  kf_s| for the nearest whole k. Example: ECG to 150 Hz → at least 300 Hz; 60 Hz sampled at 50 Hz →
  10 Hz. Use line: "Use this for 'What is the slowest rate that samples a 150 Hz ECG without
  aliasing?'"
- **Verdict:** 2 calculators; main's Bode view later need 6, need 1 (Hz, dB).

---

## Tissue Engineering (`he.engineering.tissue-engineering`)

### 51. he.engineering.tissue-engineering#0 — Scaffolds

- **Courses teach:** scaffold porosity, pore size and stiffness (Gibson–Ashby foams); fabrication
  methods.
- **Tests ask:** porosity from densities; scaffold stiffness from relative density; which method
  makes aligned fibers.
- **Main — BUILD:** later P33 `scaffold` (a porous cube cut open, struts to the relative density);
  meanwhile `percentBar` (solid vs pore). Values: material density ρ_s (g/cm³), scaffold density ρ*
  (g/cm³), relative density, porosity (%), material modulus E_s (MPa), scaffold modulus E* (MPa).
  Relations: relative = ρ* ÷ ρ_s; porosity = 1 − relative; E* = E_s × relative². Limit: ρ* < ρ_s.
  Assumptions: an open-cell foam bends at its struts (Gibson–Ashby); pores connect. Example: PCL
  1.145 g/cm³, scaffold 0.229 → 0.2, 80% porous; 400 MPa → 16 MPa. startWith ρ_s, ρ*, E_s.
- **~fabrication — BUILD (sort):** bins electrospinning, 3D printing, freeze-drying, salt
  leaching; cards by result (aligned nanofibers; a set lattice; pores from ice crystals; pores the
  size of the salt grains …).
- **Verdict:** 2 pages (1 layout); main ships on `percentBar` (later P33).

### 52. he.engineering.tissue-engineering#1 — Cell–material interactions

- **Courses teach:** protein adsorption, integrins and RGD, focal adhesions; seeding efficiency.
- **Tests ask:** ligand spacing from density, will adhesions form; seeding efficiency; order of
  attachment events.
- **Main — BUILD:** later P34 `ligandGrid` (RGD dots on a square lattice at spacing d under a cell's
  edge, a 70 nm ring for one integrin cluster; adhesions drawn when d ≤ 70 nm); meanwhile `table`.
  Values: ligand density (1–10⁵ per μm²), spacing d (nm), threshold (70 nm). Relation: d = 1000 ÷
  √density nm. Assumptions: ligands on a square grid; focal adhesions need spacing near 70 nm or
  less (a measured threshold, stated, not derived). Example: 400 per μm² → 50 nm, adhesions form;
  100 per μm² → 100 nm, they don't. startWith density.
- **~seeding — BUILD:** `percentBar`. Values seeded, attached, efficiency, doubling time, days,
  cells later. Relations: efficiency = attached ÷ seeded; later = attached × 2^(days × 24 ÷ Td).
  Example: 1.0 × 10⁶ seeded, 7.5 × 10⁵ attached → 75%; Td = 24 h, 3 days → 6.0 × 10⁶. Use line:
  "Use this for 'Of 10⁶ cells seeded, 7.5 × 10⁵ attach. How many after 3 days at a 24 h doubling?'"
- **~adhesion — BUILD (sequence):** proteins adsorb → integrins bind RGD → clusters form focal
  adhesions → the cell spreads → it proliferates or differentiates; spans minutes to days.
- **Verdict:** 3 pages (1 layout); main ships on `table` (later P34).

### 53. he.engineering.tissue-engineering#2 — Bioreactors

- **Courses teach:** oxygen transfer (k_La), uptake rates, perfusion shear.
- **Tests ask:** dissolved oxygen at steady state; the most cells a vessel can feed; shear stress
  in a parallel-plate perfusion chamber; which bioreactor for which tissue.
- **Main — BUILD:** later P35 `bioreactor` (a vessel with a sparger, O₂ dissolving at k_La, cells
  drawing it down; a dissolved-oxygen gauge from 0 to C*); meanwhile `bars` `flows`. Values:
  saturation C* (mM), k_La (h⁻¹), uptake per cell q (pmol/(cell·h)), cell density X (cells/mL),
  uptake rate OUR (mM/h), dissolved O₂ C (mM), most cells X_max. Relations: OUR = qX; C = C* −
  OUR ÷ k_La; X_max = k_LaC* ÷ q. Limit: C ≥ 0. Assumptions: steady state, well mixed, supply
  equals uptake. Example: 0.21 mM, 5 h⁻¹, 0.2 pmol/(cell·h), 2 × 10⁶ cells/mL → OUR = 0.4 mM/h,
  C = 0.13 mM, X_max = 5.25 × 10⁶ cells/mL. startWith C*, k_La, q, X.
- **~shear — BUILD:** `table` sweeping Q (0.1, 1, 10 mL/min). Values μ (mPa·s), flow Q (mL/min),
  width w (mm), gap h (μm), τ (Pa). Relation: τ = 6μQ ÷ (wh²). Example: 1.0 mPa·s, 1 mL/min,
  20 mm, 500 μm → 0.020 Pa. Use line: "Use this for 'Medium flows at 1 mL/min through a 20 mm by
  0.5 mm chamber. What shear do the cells feel?'"
- **~types — BUILD (sort):** bins spinner flask, rotating wall, perfusion, compression; cards by
  tissue and need (cartilage under load; bone in perfusion; a soft gentle culture …).
- **Verdict:** 3 pages (1 layout); main ships on `bars` (later P35); need 1.

---

## Pictures for the pictures chat

`Pn` in the pages above is `HE-biology-Pn` here. Options on existing kinds come first in each
entry's "extends"; a new kind is proposed only where no kind draws the idea. Every entry's check
goes in `harness/pictures.ts` (or the layout checks for card figures and icons).

1. **HE-biology-P1 — `curvedSolid` option `ratio: { area, volume, ratio, compare? }`.** Pages:
   `principles-1#1`. Draws the sphere with A and V written beside it and the ratio A ÷ V; `compare`
   (a factor, default 2) draws a second sphere of r × factor at the same scale with its ratio.
   Check: area = 4πr², volume = (4/3)πr³, ratio = 3 ÷ r (to 3 significant figures). Extends
   `curvedSolid`.
2. **HE-biology-P2 — `energyProfile` `mode: 'ladder'` option `quantity: 'G'`.** Pages:
   `principles-1#2` main, ~delta-g. Labels levels and steps ΔG (kJ/mol) instead of ΔH; a coupled
   pair draws the uphill step, the ATP step down and the net arrow; ~delta-g draws ΔG°′ and the
   RT ln Q step. Check: the net equals the sum of the steps; arrows point down when ΔG < 0.
3. **HE-biology-P3 — `cellDivision` option `content: { chromatids, dna }`.** Pages:
   `principles-1#3`. Writes each stage's chromosomes, chromatids and DNA content in c under the
   cell (G1 2c, after S 4c, gamete 1c). Check: chromatids = 2 × chromosomes from S to metaphase
   (II), c halves at each meiotic division.
4. **HE-biology-P4 — card icons, evidence for evolution.** Pages: `principles-2#0`. `whale pelvis`
   (vestigial bones in the body outline), `human appendix`, `bird wing and butterfly wing`, `shark
fin and dolphin flipper` (analogous: one drawn with bones, one without). Check: layout harness
   (no icon in a bin it doesn't belong to). Extends `layouts/icons/hh.tsx`.
5. **HE-biology-P5 — `membrane` options `potential` and `psi`.** Pages: `cell-molecular#0` main,
   ~goldman; `principles-2#2`. `potential: { value, ions? }` lines + charges on the positive face
   and − on the other in proportion to |V| (capped at 8 a side), a voltmeter reading V (mV,
   inside relative to outside); `ions` lists up to three ions with each side's concentration as
   counts scaled to 0–40. `psi: { outside, inside }` writes Ψ (MPa) on each side and points water's
   arrow toward the lower Ψ. Check: the sign of V matches the charges; water's arrow toward the
   side with the lower Ψ, two-way when equal.
6. **HE-biology-P6 — `pedigree` as a calculator picture.** Pages: `genetics#0` main. Reuses the
   layout figure's `people` (two generations and the partner); `chances: { [person]: id }` writes a
   value on a person (2/3 on the unaffected sibling, the partner's carrier chance) and the child's
   chance under the couple. Check: the child's chance equals the product × 1/4 written. Extends the
   `pedigree` explore figure (`layouts/figuresLife.tsx`).
7. **HE-biology-P7 — card figure `pedigree`.** Pages: `genetics#0~modes`. A 2–3 generation family
   in the standard symbols, 112 × 76, `people` as in the explore figure. Check: the layout harness
   confirms each card's pattern is possible under its bin's mode and impossible under at least one
   other (so every card has one right bin).
8. **HE-biology-P8 — new kind `linkageMap`.** Pages: `genetics#1` main, ~three-point. A chromosome
   bar with 2 or 3 loci at distances in cM to scale; under it a pair of homologs with the
   recombinant strands crossed (one crossover, or two for the double crossovers in the middle).
   Fields: `loci: [names]`, `distances: [ids]`, `recombinant?`, `doubles?`. Check: the drawn spacing
   matches the distances; RF ≤ 50 cM between neighbors.
9. **HE-biology-P9 — card figure `codons`.** Pages: `genetics#2~mutations`. The old and new codon
   strip (3–4 codons) with the changed base lit and each codon's amino acid; a frameshift shows
   the reading frame moving. Check: the amino acids follow the standard genetic code (the
   `dnaStrand` table); the card's bin follows from the change (same amino acid, different,
   stop, or a length not a multiple of 3).
10. **HE-biology-P10 — `functionGraph` family `hill`: `{ family: 'hill', K, n, top? }`.** Pages:
    `cell-molecular#1~hill`, `bioinstrumentation#0~saturation` (n = 1). Draws θ = Lⁿ ÷ (Kⁿ + Lⁿ)
    (× top), K marked at half. Check: θ(K) = top ÷ 2; n = 1 matches the rational family.
11. **HE-biology-P11 — `geneExpression` signal `corepressor`.** Pages: `cell-molecular#2`. The trp
    repressor binds the operator only with its corepressor (tryptophan) bound. Check: the gene is
    on exactly when the corepressor is absent.
12. **HE-biology-P12 — `functionGraph` option `threshold` with a second curve.** Pages:
    `cell-molecular#2~fold-change`. Two logistic amplification curves (target, reference; treated
    dashed), a horizontal threshold and each curve's crossing marked as its Ct. Check: each marked
    Ct is where its curve meets the threshold; the curves are 2× apart per cycle in the log phase.
13. **HE-biology-P13 — Gram icons and `fieldOfView` option `resolution`.** Pages:
    `microbiology#0`, ~resolution. Icons: `Gram-positive wall`, `Gram-negative wall` (sections),
    `coccus`, `bacillus`, `spirillum`, `endospore`. `resolution: { d, gap }` draws two points `gap`
    apart, blurred to Airy disks of radius d: separate, just resolved, or one blob. Check: drawn
    as resolved exactly when gap ≥ d.
14. **HE-biology-P14 — new kind `dilutionSeries`.** Pages: `microbiology#1~plate-count`,
    `microbiology#2` main, `microbiology#3~titer`. A row of tubes (1:10 or 1:2 each, up to 10),
    the volume moved between them, one tube plated with its colonies drawn (dots, up to 300; a
    count above 300 drawn as "TNTC"); for titers, tubes lit while positive. Fields: `factor`,
    `tubes`, `plated`, `volume`, `colonies`, `positive?`. Check: CFU/mL = colonies ÷ (dilution ×
    volume) as written; the titer is the last lit tube's dilution.
15. **HE-biology-P15 — `sample` option `herd: { r0, immune }`.** Pages: `microbiology#3`. 100 people
    as dots, `immune` shaded; one case with arrows to R₀ contacts, the arrows to immune people
    stopped. Check: shaded count = round(immune × 100); stopped arrows ≈ R₀ × immune.
16. **HE-biology-P16 — new kind `phasePlane`.** Pages: `ecology#1~competition`. N₁ against N₂ with
    both zero-growth isoclines (intercepts K₁, K₁ ÷ α and K₂ ÷ β, K₂), their crossing ringed when
    both are positive, a few flow arrows. Fields: `K1`, `K2`, `alpha`, `beta`, `eq?`. Check: the
    ringed point equals the formulas; no ring when an N* ≤ 0.
17. **HE-biology-P17 — `alleleFrequencies` option `after: id`.** Pages: `evolution#0`. A second
    tray of beads for p′ beside p, Δp as an arrow on the scale. Check: p′ in [0, 1]; the arrow
    points the way Δp's sign says.
18. **HE-biology-P18 — `normalCurve` option `shift: { selected, response }`.** Pages:
    `evolution#0~breeders`. The parents' curve with the selected tail shaded and its mean marked
    (S from the mean), then the offspring curve shifted by R. Check: the offspring mean is the
    parents' mean + R; R = h²S.
19. **HE-biology-P19 — new kind `driftPaths`.** Pages: `evolution#1`. 12 fixed-seed populations'
    p over t generations at Nₑ (Wright–Fisher draws precomputed per Nₑ), the expected H_t dashed on
    a second axis. Fields: `ne`, `generations`, `p0`. Check: the curves start at p₀ and stay in
    [0, 1]; the dashed H follows H₀(1 − 1/(2Nₑ))ᵗ.
20. **HE-biology-P20 — card icons, tissues.** Pages: `anatomy-physiology#0`, ~epithelia. Drawn
    sections (not micrographs): simple squamous, simple cuboidal, simple columnar, stratified
    squamous; bone, cartilage, blood, adipose; skeletal, cardiac, smooth muscle; neuron with
    glia. Check: layout harness. New icon file (`layouts/icons/he-bio.tsx`).
21. **HE-biology-P21 — `simpleMachine` option `limb: 'forearm' | 'hip'` with loads `[ { force,
arm } ]`.** Pages: `anatomy-physiology#1` (later), `biomechanics#1` main, ~hip. Draws the bones
    to scale, the muscle's line of pull, each load at its arm, the joint force at the fulcrum.
    Check: Σ moments about the joint = 0 with the values; the joint force arrow equals the vertical
    balance.
22. **HE-biology-P22 — new kind `heartPump`.** Pages: `anatomy-physiology#3` main, ~ejection. The
    left ventricle filling to EDV and emptying to ESV (volumes as fill levels), a beat counter by
    HR, the outflow per minute, and a pressure gauge between DBP and SBP with MAP at one third.
    Check: SV = EDV − ESV; CO = HR × SV; MAP marked at DBP + (SBP − DBP) ÷ 3.
23. **HE-biology-P23 — new kind `tensileTest` (options `section: 'tube'`, `parallel`).** Pages:
    `biomechanics#0` main, ~bone-bending; `biomaterials#1` main. A specimen in grips, F, L, ΔL and
    the σ–ε curve with a toe region and the point at ε; `section` draws the cross-section ring
    with its neutral axis; `parallel` draws two members under one load, widths by share. Check:
    σ = F ÷ A, ε = ΔL ÷ L on the curve's linear part; the shares add to 1.
24. **HE-biology-P24 — new kind `footprints` and card figure `gait`.** Pages: `biomechanics#2`
    main, ~phases. Prints to scale with step and stride bracketed, a tick per step at the cadence;
    the card figure is a stick leg at each of six phases, 112 × 76. Check: stride = 2 × step; the
    six cards come in the cycle's order (as the reflex-arc card check does).
25. **HE-biology-P25 — new kind `springDashpot`.** Pages: `biomechanics#3` main, ~creep. A spring
    and a dashpot in series (Maxwell) or parallel (Kelvin–Voigt) beside its curve: stress falling
    at fixed strain, or strain rising at fixed stress, τ marked. Fields: `model`, `E`, `eta`, `t`.
    Check: τ = η ÷ E; the curve at τ reads 37% (relaxation) or 63% (creep).
26. **HE-biology-P26 — card icons, biomaterials and imaging.** Pages: `biomaterials#1~classes`,
    `bioinstrumentation#2~modalities`. Hip stem, femoral head, bone screw, cup liner, bone cement,
    suture, coated stem; X-ray tube, CT ring, MRI bore, ultrasound probe, PET ring, OCT probe.
    Check: layout harness.
27. **HE-biology-P27 — new kind `diffusionProfile`.** Pages: `biotransport#0` main. A tissue slab
    with the source face, concentration as shading and a profile curve at time t, L marked where
    it reaches about half. Fields: `D`, `L`, `t`. Check: the half-concentration depth ≈ √(2Dt)
    within the drawn scale.
28. **HE-biology-P28 — new kind `vesselFlow`.** Pages: `biotransport#1` main, ~shear, ~reynolds. A
    vessel cut lengthwise, P₁ and P₂ at its ends, parabolic velocity arrows (the center twice the
    mean), r and L bracketed, τ_w ticks at the wall. Check: center speed = 2Q ÷ (πr²); arrows
    scale with Q.
29. **HE-biology-P29 — new kind `dialyzer`.** Pages: `biotransport#2`. Blood in and out with C_in
    and C_out, dialysate the other way, the cleared share as a band. Check: K = Q_b(C_in − C_out) ÷
    C_in; C_out ≤ C_in.
30. **HE-biology-P30 — `functionGraph` options `repeat: { every, count }` and family `bateman`.**
    Pages: `biotransport#3~multiple-dosing`, ~oral. `repeat` sums exponential doses into a sawtooth
    with C_ss,avg dashed; `bateman` draws the oral curve with t_max and C_max marked. Check: the
    sawtooth's troughs rise toward the steady trough; the marked t_max = ln(k_a ÷ k) ÷ (k_a − k).
31. **HE-biology-P31 — `circuit` options `bridge`, `opAmp` and `filter`.** Pages:
    `bioinstrumentation#0~strain-gauge`, `#1` main and ~inamp, `#3` main. A Wheatstone bridge with
    one active gauge; a differential or three-op-amp instrumentation amplifier with V_d and V_cm
    sources; an RC low-pass. Check: V_out, G and f_c as written. Shared with the Electronics and
    Circuits plans (coordinate one spec).
32. **HE-biology-P32 — new kind `attenuation` (option `echo`).** Pages: `bioinstrumentation#2` main,
    ~ultrasound. A beam through a slab, photons drawn thinning with depth, each HVL marked; `echo`
    draws a probe, a boundary at depth d and the pulse's round trip with t. Check: transmitted =
    e^(−μx); d = ct ÷ 2.
33. **HE-biology-P33 — new kind `scaffold`.** Pages: `tissue-engineering#0`. A cube cut open with
    struts set by the relative density (pores open), porosity written. Check: the drawn solid share
    tracks ρ* ÷ ρ_s within 5 points.
34. **HE-biology-P34 — new kind `ligandGrid`.** Pages: `tissue-engineering#1`. Ligand dots on a
    square grid at spacing d (nm) under a cell's edge, a 70 nm ring; adhesion plaques drawn when
    d ≤ 70. Check: dots per μm² match the density; plaques only when d ≤ 70 nm.
35. **HE-biology-P35 — new kind `bioreactor`.** Pages: `tissue-engineering#2`. A vessel with a
    sparger, cells as dots by X, an O₂ gauge from 0 to C* at C. Check: C = C* − qX ÷ k_La; the gauge
    empty (and the page's limit message) when C ≤ 0.
36. **HE-biology-P36 — `functionGraph` `family: 'power'` option `exponent: id`.** Pages:
    `ecology#3~species-area` (and Kleiber if a page varies 0.75). A real exponent from a value
    instead of p/q. Check: the curve passes (1, a) and (x, a·x^z) at the traced point.

---

## Research to do (for a separate research chat)

Nothing below is collected here. Every source is reference only: no problem, text, number,
figure or screenshot from it goes into a page (`research/textbooks/README.md`). Record sources in
a new `research/textbooks/sources/he-bio.md` and questions under `research/questions/` filed by
page id (`he.biology.genetics#1`), as the K–12 records are filed by skill.

### Textbooks

| Text (URL)                                                                                                                                                                                                                                                                                                                                                                                             | Licence                                                                                              | Courses and topics                                                  | Extract                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OpenStax Biology 2e (openstax.org/details/books/biology-2e)                                                                                                                                                                                                                                                                                                                                            | CC BY 4.0, with OpenStax's no-LLM-ingestion statement; robots.txt disallows AI crawlers on `/books/` | Principles I and II, Genetics, Cell & Molecular, Ecology, Evolution | Chapter and section titles only, read by a person from the details page or the PDF's table of contents; no fetch of `/books/` by the agent (SOURCES.md "Off limits") |
| OpenStax Microbiology (openstax.org/details/books/microbiology)                                                                                                                                                                                                                                                                                                                                        | same                                                                                                 | Microbiology                                                        | same: section titles (growth, D-value, epidemiology, immunity)                                                                                                       |
| OpenStax Anatomy and Physiology 2e (openstax.org/details/books/anatomy-and-physiology-2e)                                                                                                                                                                                                                                                                                                              | same                                                                                                 | A&P; Biotransport, Biomechanics context                             | same: section titles (tissues, levers, action potential, cardiac output, ventilation)                                                                                |
| Online Open Genetics, Nickle and Barrette-Ng (LibreTexts Biology; open.umn.edu Open Textbook Library)                                                                                                                                                                                                                                                                                                  | CC BY-SA 3.0 (confirm on the book's page)                                                            | Genetics                                                            | chapter list; worked-example types (pedigree probability, chi-square, three-point crosses); typical counts                                                           |
| LibreTexts Biology and Engineering bookshelves (bio.libretexts.org; eng.libretexts.org Biological Engineering)                                                                                                                                                                                                                                                                                         | per book (CC BY, CC BY-NC-SA); eng.libretexts.org was blocked by this session's proxy                | Ecology, Evolution, Biotransport, Biomaterials                      | per book: licence quoted, chapter list, notation; check robots.txt first                                                                                             |
| Human Biomechanics / Biomechanics of Human Movement (pressbooks.bccampus.ca/humanbiomechanics)                                                                                                                                                                                                                                                                                                         | CC BY 4.0 per the search result (confirm)                                                            | Biomechanics (tissue, joint forces, gait)                           | chapter list; typical numbers (moment arms, tendon moduli, cadence)                                                                                                  |
| Biomedical Engineering Lab Manual (open.umn.edu/opentextbooks/textbooks/1472)                                                                                                                                                                                                                                                                                                                          | open (confirm the exact licence)                                                                     | Bioinstrumentation, Biomechanics labs                               | lab list; measured quantities and ranges                                                                                                                             |
| MIT OCW 20.330J Fields, Forces and Flows in Biological Systems (ocw.mit.edu/courses/20-330j-…-spring-2007)                                                                                                                                                                                                                                                                                             | CC BY-NC-SA 4.0                                                                                      | Biotransport (diffusion, flow), Bioinstrumentation context          | lecture topics, equation sheet's notation, typical D, μ and r values                                                                                                 |
| MIT OCW 20.310J / 2.797J Molecular, Cellular and Tissue Biomechanics                                                                                                                                                                                                                                                                                                                                   | CC BY-NC-SA 4.0                                                                                      | Biomechanics, Tissue Engineering                                    | topic order; viscoelastic models used                                                                                                                                |
| MIT OCW 7.012 / 7.013 / 7.016 Introductory Biology; 7.03 Genetics; 7.06 Cell Biology                                                                                                                                                                                                                                                                                                                   | CC BY-NC-SA 4.0                                                                                      | Principles I and II, Genetics, Cell & Molecular                     | lecture order; question types per topic                                                                                                                              |
| MIT OCW HST.151 Principles of Pharmacology; 6.021J Quantitative Physiology: Cells and Tissues                                                                                                                                                                                                                                                                                                          | CC BY-NC-SA 4.0                                                                                      | Biotransport#3, Cell & Molecular#0, A&P#2                           | the PK and membrane models used, notation                                                                                                                            |
| Commercial texts (titles only): Campbell Biology; Griffiths, Introduction to Genetic Analysis; Alberts, Molecular Biology of the Cell; Tortora, Microbiology; Molles, Ecology; Futuyma, Evolution; Marieb, Human A&P; Truskey, Transport Phenomena in Biological Systems; Ratner, Biomaterials Science; Webster, Medical Instrumentation; Enderle and Bronzino, Introduction to Biomedical Engineering | all rights reserved                                                                                  | every course                                                        | chapter titles from public tables of contents, cited, to check order and coverage                                                                                    |

### Questions

| Source (URL)                                                                                                              | Licence and robots                                                                                                                          | Courses                                                   | Record per question                                                                                                           | Target                                          |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| MIT OCW problem sets and exams: 7.012/7.013/7.016, 7.03 (exams 1993–2004 with solutions), 7.06, 20.330J, 20.310J, HST.151 | CC BY-NC-SA 4.0 (ocw.mit.edu allows crawling; check robots.txt)                                                                             | all but Microbiology                                      | course, topic page id, type (compute, explain, interpret a figure), the unknown, numbers as reference only, picture described | 30 a biology course, 15 a bioengineering course |
| AP Biology released free-response questions (apcentral.collegeboard.org)                                                  | © College Board; reference only; check robots.txt and terms first                                                                           | Principles I and II, Genetics, Ecology (the bridge level) | as above, plus which AP science practice it tests                                                                             | 40 in all                                       |
| OpenStax end-of-chapter questions (Biology 2e, Microbiology, A&P 2e)                                                      | CC BY 4.0 but no LLM ingestion, AI crawlers disallowed: **off limits** to the agent (SOURCES.md); a person may count question types by hand | —                                                         | counts of question types per section only, no text                                                                            | counts only                                     |
| USA Biology Olympiad open exams (cee.org)                                                                                 | © Center for Excellence in Education; check terms; likely titles only                                                                       | Genetics, Evolution, Ecology                              | type and topic only                                                                                                           | 20                                              |
| GRE Biology / Biochemistry, Cell and Molecular Biology practice books (ets.org)                                           | © ETS; the Biology test was discontinued in 2021; reference only, likely rejected                                                           | —                                                         | none unless terms allow                                                                                                       | 0                                               |
| NCEES FE Other Disciplines and Chemical (biomedical topics) sample questions                                              | © NCEES, paid; **rejected**                                                                                                                 | —                                                         | —                                                                                                                             | 0                                               |
| MCAT sample questions (aamc.org)                                                                                          | © AAMC, terms restrict reuse; **rejected**                                                                                                  | —                                                         | —                                                                                                                             | 0                                               |

The research chat also writes `research/textbooks/grades/he-biology.md` (each course's open-text
chapters mapped to the topic ids above) so the lesson reviewer's check F has a crosswalk.

### Engine needs

1. **Units** (`src/engine/units.ts`): molar concentration (M, mM, μM, nM; with mol/L and mol/cm³
   for transport), mass concentration (mg/L, mg/dL, g/L), stress (MPa, GPa with Pa and kPa),
   viscosity (Pa·s, mPa·s, cP), diffusivity (m²/s, cm²/s, μm²/s), volumetric flow (m³/s, mL/s,
   mL/min, L/min, L/h), rate constants (s⁻¹, min⁻¹, h⁻¹, day⁻¹), time (days, weeks), length (μm,
   nm), molar energy (kJ/mol, kcal/mol), frequency (Hz, kHz, MHz), current (nA, μA), molar mass
   (Da, kDa, g/mol), acoustic impedance (MRayl); fixed labels for CFU/mL, cM, bp, dB, %. Waits:
   none (pages use fixed labels), but 30+ pages gain a unit menu.
2. **Step phrases** (`harness/evaluate.ts` PHRASES): `(2n − 3)!!` written as its product; base-10
   `log(x)` beside the existing `ln` and `log_b`; fractional powers (64^0.75); `10^(−t ÷ D)`;
   primes and bars in names (p′, w̄). Waits: `evolution#2~tree-count`.
3. **Sums** (check only): the fixed-count Σ pages (chi-square, Hardy–Weinberg test, life table,
   Shannon, Mn and Mw) write their terms out; confirm `expandSums` reads "Σ (O − E)² ÷ E =
   0.278 + 0.133 + …" with names, not an index. Waits: none.
4. **Page limits**: N₀ < K, p < 0.75, RF ≤ 50%, θ < 1, C_out ≤ C_in, r_i < r_o, ρ* < ρ_s,
   colonies 30–300, coverage ≤ 100%, C ≥ 0 written as limits (never relations), each with a
   rejection reason a student reads. Waits: none (the limit mechanism exists); the reasons are
   new text.
5. **Solver inverses**: θ → [L] for Hill (n-th root), t from H_t (log), p from d (Jukes–Cantor
   inverse), R₀ from a threshold, k_a from t_max (no closed form: numeric, or left as an output
   only). Waits: none; the Bateman k_a stays output-only.
6. **Log axes** on `functionGraph`, `bars` and `table` graphs (semi-log y; log–log; log-x for
   Bode). Upgrades 8 pages (Kleiber, growth, D-value, amplification, PK, Bode).

---

## Priority

1. Calculators with drawn pictures and no waits: `genetics#3` (all three), `ecology#0`,
   `principles-1#0`, `principles-1#4`, `cell-molecular#1` main, `microbiology#1` main and ~d-value,
   `biotransport#3` main and ~infusion, `biomaterials#2`.
2. The sorts, sequences, explores and the observe page: 32 of 36 ship now (5 of them on text cards
   until their icons land).
3. P5 (membrane potential and Ψ: three pages), P14 (dilution series: three), P21 (limb levers:
   three), P23 (tensile test: four), P31 (circuits: four, shared with the electrical plans).
4. The rest of the ⏳ pages as their pictures land; need 1 units alongside.

## Summary

- **Pages:** 53 main pages + 87 problem types = **140 pages**: **104 calculators** and **36
  layouts** (19 sorts, 9 sequences, 7 explores, 1 observe). **26 wait** (⏳) on a picture or
  engine need; 43 more ship now and are upgraded later. No topic is left
  without a page.
- **Pictures:** 36 requests, `HE-biology-P1`–`P36`: 16 options on existing kinds (curvedSolid,
  energyProfile, cellDivision, membrane, the pedigree figure, geneExpression, functionGraph ×4,
  fieldOfView with Gram icons, sample, alleleFrequencies, normalCurve, simpleMachine, circuit), 15
  new kinds (linkageMap, dilutionSeries, phasePlane, driftPaths, heartPump, tensileTest, footprints
  with a gait card, springDashpot, diffusionProfile, vesselFlow, dialyzer, attenuation, scaffold,
  ligandGrid, bioreactor) and 5 sets of card figures or icons (evidence for evolution, pedigree
  cards, codons, tissues, biomaterials and imaging).
- **Engine needs:** 6: units (the largest: concentration, stress, viscosity, diffusivity, flow,
  rate constants, frequency), step phrases (`!!`, base-10 log, fractional powers), a Σ check, page
  limits with their reasons, solver inverses, log axes.
- **Research targets:** open texts (OpenStax titles by hand only, Online Open Genetics, LibreTexts,
  BCcampus Human Biomechanics, the UMN BME lab manual, MIT OCW 7.012/7.03/7.06/20.330J/20.310J/
  HST.151, commercial titles only) and questions (MIT OCW problem sets and exams, 30 per biology
  course and 15 per bioengineering course; AP Biology free response, 40, reference only; USABO,
  20, titles only; GRE, NCEES and MCAT rejected).
