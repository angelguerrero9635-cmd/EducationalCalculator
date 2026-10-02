# Direction plan: higher education, Chemistry (9 courses, 42 topics)

Written from the brief (`he-plan-brief.md`), `src/data/taxonomy.ts` (`COURSES`, the `chem(…)`
rows), `docs/MODULE_GUIDE.md` ("Standards"), `docs/LAYOUTS.md`, `docs/PICTURES.md`, the trackers
`pictureRequests.ts` / `pictureRequestsHs.ts`, the college pilots in `src/data/modules/college.ts`
(no chemistry pilot: `he.physics.university-1#0` is the model of a college page), the Grade 10
chemistry plan and pages (`docs/plans/s.10.md`, `src/data/modules/science/10.ts`), and the
OpenStax Chemistry 2e table of contents already in `research/textbooks/toc/science/`. Every
example below is original and was worked by hand and checked with a script; nothing is copied
from `research/` or from any textbook.

## Decisions

- **Ids.** A topic page is `he.chemistry.<course>#<i>` (0-based, the taxonomy's topic order); a
  problem type `he.chemistry.<course>#<i>~<slug>`. 153 pages is too many for `college.ts`: put
  them in `src/data/modules/college/chemistry.ts` (and `layouts/collegeChemistry.ts` for sorts
  and sequences), exported into `COLLEGE_MODULES`. The lead decides; nothing below depends on it.
- **Prerequisite pages, never rebuilt.** Grade 10 already has the mole map, stoichiometry,
  limiting reactant, percent yield, empirical formula, the gas laws (Boyle … ideal, partial
  pressure, effusion), molarity and dilution, calorimetry, Hess's law, ΔH°f, heating curves,
  the ICE chart, Le Châtelier, Ksp, pH, strong and weak titration curves, ΔG = ΔH − TΔS,
  E°cell and oxidation numbers (`s.10.*`, 90 pages). College pages start one step past them and
  list the Grade 10 page under "Refresh" (the course prerequisites `s.10.stoichiometry`,
  `s.10.gas-laws` already point there). Where a college page would repeat a Grade 10 page, it is
  left out and named (for example the photoelectric effect stays in `s.11.modern-physics`).
- **Word rules.** The Grades 9–12 rules hold for college: sentences ≤ 35 words, ≤ 10 values a
  page, every value named first and then its symbol ("Rate constant (k)", "Molar absorptivity
  (ε)"). College vocabulary is the textbook's (IUPAC names, "molar absorptivity", "retention
  factor", "Michaelis constant"); no reading-level cap beyond the sentence length. Units after
  the number with a space (0.100 M, 298.15 K, 1.10 V), "× 10ⁿ" for scientific notation.
- **Notation.** [A] is a concentration in M (mol/L); a subscript 0 is the start ([A]₀). Standard
  state ° (1 bar, but gas-law pages keep atm as in class); biochemistry's ΔG°′ (pH 7) is named as
  such. ln for kinetics and thermodynamics, log for pH, pKₐ and the Nernst 0.05916 form. Formal
  charge, oxidation state and ion charges are signed with the sign first (+3, −1). Organic names
  are IUPAC (2013), with the common name in brackets once (ethanoic acid (acetic acid)).
- **Constants** (one registry, engine need E2; steps print the value with its unit): R =
  8.314 J/(mol·K) or 0.08206 L·atm/(mol·K) by the page's units; F = 96,485 C/mol; N_A =
  6.022 × 10²³ mol⁻¹; h = 6.626 × 10⁻³⁴ J·s; c = 2.998 × 10⁸ m/s; k_B = 1.381 × 10⁻²³ J/K;
  R_H = 1.097 × 10⁷ m⁻¹; mₑ = 9.109 × 10⁻³¹ kg; u = 1.6605 × 10⁻²⁷ kg; e = 1.602 × 10⁻¹⁹ C;
  K_w = 1.0 × 10⁻¹⁴ at 25 °C; 2.303RT/F = 0.05916 V at 298.15 K; STP 0 °C and 1 atm (22.41 L/mol).
  Temperatures are typed in °C or K (unit menu) and worked in K; 25 °C is 298.15 K.
- **Significant figures.** Answers show 3–4 significant figures; a constant carries one more
  than the data. pH and log answers show as many decimals as the concentration has
  significant figures (an assumption line says so once per page that uses it).
- **Calculus and linear algebra in steps.** Physical chemistry pages state the derivative or
  integral once, in an assumption or a step's `how` ("w = −∫ nRT/V dV from V₁ to V₂"), and the
  step lines use the integrated result (w = −nRT ln(V₂ ÷ V₁)) with one line per stage of
  simplifying. No symbolic integration in the solver. Two-by-two systems (two-component
  absorbance, the secular determinant) show the matrix in `matrixGrid` and solve by Cramer's
  rule in three lines. Character-table reduction shows one row × column product per symmetry
  species.
- **Calculators vs layouts.** A topic whose exam problems are numbers (kinetics, equilibrium,
  thermodynamics, electrochemistry, analytical, physical chemistry, enzyme kinetics,
  bioenergetics, crystal field, unit cells) is a calculator. Organic reaction topics are taught
  as patterns (which product, which mechanism, which order): their main pages are **sorts and
  sequences** with text cards (formulas with subscripts, the `condensed` card where its groups
  fit), each with a calculator problem type where a quantity is honest (unsaturation, pKₐ
  equilibria, rotation, yield). No calculator invents a number to make a page.
- **Layouts: 36 pages.** Sorts 24, sequences 12 (listed per topic). One right bin per card and
  one right order per sequence was checked for every card below. Explore figures are not used
  yet; two are requested (P18 symmetry, P20 pathways) to upgrade sorts later.
- **Data tables (engine need E3).** Many college pages pick a substance and read its constant
  (Kₐ, E°, bond enthalpies, Slater groups, t and Q critical values, Δₒ). Until E3 lands, such a
  page takes the constant as a typed value with a sensible default and its source named in an
  assumption ("Kₐ of ethanoic acid is 1.8 × 10⁻⁵ at 25 °C").
- **What the engine can't do yet** is listed under "Engine needs" (E1–E15); pages that cannot
  ship without one are marked ⏳ with the need. Pages that can ship with an interim picture
  name it ("interim") and the request that replaces it.
- **Use lines.** Each calculator's use line is its worked example asked as a question, in the
  textbook's words ("Use this for 'Find the pH of 0.100 M ethanoic acid (Kₐ = 1.8 × 10⁻⁵).'");
  pages above that write one out show the form. A layout's use line is its sort or order
  question ("Use this for 'Which mechanism, SN1, SN2, E1 or E2, does each reaction follow?'").
  Never promise a type the page marks Partly or No.
- **Question data.** No college questions are in `research/questions/` yet (`COVERAGE.md`), so
  every "Tests ask" table lists the common exam and textbook question types for the topic
  (OpenStax end-of-chapter kinds, MIT OCW exam kinds, AP Chemistry free-response kinds as the
  bridge level), read for their kinds only. Marks are against those types.
- **Page count:** 42 main + 111 problem types = **153 pages** (117 calculators, 36 layouts);
  24 wait on an engine or picture need (⏳).

## General Chemistry I — `he.chemistry.gen-chem-1`

Prerequisites `s.10.stoichiometry`, `s.10.gas-laws`. Textbooks: OpenStax Chemistry 2e ch. 3–9
(titles in `research/textbooks/toc/science/openstax-chemistry-2e.json`); MIT OCW 5.111.

### gen-chem-1#0 — Atomic structure and periodicity

- **Textbooks:** Chemistry 2e 6.1–6.5 (light, Bohr model, quantum theory, configurations,
  periodic variation); 5.111 lectures on the hydrogen atom and periodic trends.
- **Refresh:** `s.10.electrons-in-atoms` (configurations, the eV ladder), `s.10.periodic-trends`.
- **Tests ask:**

  | Question type                                       | Page              | Mark   |
  | --------------------------------------------------- | ----------------- | ------ |
  | wavelength, frequency, energy of a hydrogen line    | main              | Solves |
  | energy per mole of photons (kJ/mol)                 | main              | Solves |
  | de Broglie wavelength of an electron or a ball      | ~de-broglie       | Solves |
  | least uncertainty in speed from a position          | ~uncertainty      | Solves |
  | effective nuclear charge (Slater) and the trend     | ~zeff             | Solves |
  | explain an ionization-energy exception (Mg/Al, P/S) | ~ionization-order | Solves |

- **Main — BUILD `he.chemistry.gen-chem-1#0`:** `orbitalDiagram` mode `ladder` (start from
  `g.s10-electrons-in-atoms` ladder demo; `upper`, `lower`, `energy` in eV, `wavelength`).
  Values: upper level n₂ (whole, 2–20), lower level n₁ (whole, 1–19), wavelength λ (nm,
  10–10⁵), frequency ν (Hz), photon energy E (J), energy per mole E_m (kJ/mol), energy in eV
  E_eV (derived, for the ladder). Relations: 1/λ = R_H(1/n₁² − 1/n₂²); ν = c/λ; E = hν;
  E_m = E·N_A ÷ 1000; E_eV = E ÷ e. Assumptions: one electron (hydrogen) only; emission drops
  from n₂ to n₁ < n₂ and the photon carries the difference; n₁ names the series (1 Lyman,
  2 Balmer, 3 Paschen). Example: 4 → 2: λ = 486.2 nm, ν = 6.167 × 10¹⁴ Hz, E = 4.086 × 10⁻¹⁹ J,
  E_m = 246.1 kJ/mol, 2.551 eV. startWith n₂, n₁. Use: "Use this for 'Find the wavelength
  and energy of the photon when hydrogen's electron drops from n = 4 to n = 2.'"
- **~de-broglie — BUILD:** `functionGraph` sin with `marks: ['period']` (the period is λ;
  interim, axes in nm). Values: mass m (kg, 10⁻³¹–10), speed v (m/s, 0–3 × 10⁷), momentum p,
  wavelength λ (m, shown in nm or m by unit). Relations: p = mv; λ = h/p. Assumptions: speeds
  below a tenth of light's (no relativity); any moving mass has a wavelength, but a ball's is far
  too small to see. Example: electron at 2.00 × 10⁶ m/s → p = 1.822 × 10⁻²⁴ kg·m/s,
  λ = 0.364 nm; a 0.145 kg ball at 40 m/s → 1.14 × 10⁻³⁴ m. startWith m, v.
- **~uncertainty — BUILD:** `none` (H105). Values m, position uncertainty Δx (m), least Δp,
  least Δv. Relations: Δx·Δp ≥ h/(4π) (the page solves the equality: "at least"); Δv = Δp/m.
  Example: electron held to 0.100 nm → Δv ≥ 5.79 × 10⁵ m/s. Use: "Use this for 'An electron
  is located to within 0.100 nm. What is the least uncertainty in its speed?'"
- **~zeff — BUILD:** `orbitalDiagram` boxes (`element: 'Z'`; the shielding groups lit is a
  later option on P3). Values: atomic number Z (1–36), electrons in the same (n) group a (0–7),
  electrons in shell n − 1 b (0–8), electrons deeper c (0–28), shielding S, Z_eff. Relations:
  S = 0.35a + 0.85b + 1.00c; Z_eff = Z − S. Assumptions: Slater's rules for an s or p electron
  (a 1s partner shields 0.30; d and f electrons follow other rules); higher Z_eff pulls the
  electron closer. Example: N's 2p electron: a = 4, b = 2, c = 0 → S = 3.10, Z_eff = 3.90; Na's
  3s: b = 8, c = 2 → Z_eff = 2.20. startWith Z, a, b, c.
- **~ionization-order — BUILD (sort):** bins "Rises: one more proton, same shell", "Falls: a
  shell farther out", "Falls: first electron in a p subshell", "Falls: first paired p
  electron". Cards (first ionization energy going from the first to the second element):
  Li → Be, Na → Mg, Si → P, O → F (rises); Li → Na, Mg → Ca (shell); Be → B, Mg → Al (p
  subshell); N → O, P → S (paired). Sentence: "Across a period the energy rises, except where
  the electron removed starts a p subshell or is the first to share a p orbital."
- **Verdict:** 5 pages (4 calculators, 1 sort); the six common types Solve. The photoelectric
  effect stays in `s.11.modern-physics~photoelectric` (linked, not rebuilt).

### gen-chem-1#1 — Stoichiometry

- **Textbooks:** Chemistry 2e 3.1–3.4, 4.3–4.5 (empirical and molecular formulas, molarity,
  reaction and solution stoichiometry, quantitative analysis).
- **Refresh:** `s.10.mole`, `s.10.mole~empirical`, `s.10.stoichiometry`, `~limiting-grams`,
  `~percent-yield`, `s.10.molarity`.
- **Tests ask:**

  | Question type                                        | Page               | Mark             |
  | ---------------------------------------------------- | ------------------ | ---------------- |
  | empirical formula from combustion analysis (C, H, O) | main               | Solves           |
  | molecular formula from the empirical formula and M   | ~molecular-formula | Solves           |
  | water of hydration from a heating experiment         | ~hydrate           | Solves           |
  | volume of titrant to react (mole ratio ≠ 1)          | ~solution-stoich   | Solves (⏳ P24)  |
  | limiting reactant, percent yield                     | Grade 10 pages     | Solves (Refresh) |

- **Main — BUILD `he.chemistry.gen-chem-1#1`:** `bars` (interim: moles of C, H, O side by side,
  the ratio over each; P24 draws the combustion train). Values: sample mass m (g, 0.001–100),
  CO₂ mass (g), H₂O mass (g), moles of C n_C, moles of H n_H, mass of O m_O (derived), moles of O
  n_O, H per C (ratio), O per C (ratio). Relations: n_C = m_CO₂ ÷ 44.01; n_H = 2m_H₂O ÷ 18.02;
  m_O = m − 12.01n_C − 1.008n_H; n_O = m_O ÷ 16.00; ratios n_H ÷ n_C, n_O ÷ n_C. Assumptions:
  all C ends in CO₂ and all H in H₂O; O is what is left of the mass (it can't be weighed in the
  O₂ used); ratios within 0.05 of a whole number round, otherwise multiply all by 2, 3 … (E6).
  Example: 0.2500 g → 0.3664 g CO₂ and 0.1500 g H₂O: n_C = 8.325 × 10⁻³ mol, n_H = 1.665 × 10⁻²
  mol, m_O = 0.1332 g, n_O = 8.326 × 10⁻³ mol → 1 : 2.00 : 1.00, CH₂O. startWith m, m_CO₂, m_H₂O.
- **~molecular-formula — BUILD:** `none`. Values: empirical formula mass (g/mol, 1–1000), molar
  mass M (g/mol, 1–10⁶), multiplier n (whole, 1–100). Relation: n = M ÷ empirical mass.
  Example: CH₂O (30.03) and M = 180.16 g/mol → n = 6.000, C₆H₁₂O₆. Use: "Use this for 'The
  empirical formula is CH₂O and the molar mass is 180 g/mol. Find the molecular formula.'"
- **~hydrate — BUILD:** `scale` with `before` (two balances, before and after heating). Values:
  hydrate mass, anhydrous mass, water mass, moles of water, salt molar mass (g/mol), moles of
  salt, water per formula unit x. Relations: m_water = m_hydrate − m_anhydrous; n = m ÷ M for
  each; x = n_water ÷ n_salt. Example: 2.50 g → 1.60 g CuSO₄ (159.61 g/mol): 0.90 g water =
  0.0499 mol, 0.01002 mol salt → x = 4.98 ≈ 5, CuSO₄·5H₂O. startWith the two masses.
- **~solution-stoich — BUILD (⏳ P24):** `moleMap` with a `solution` box (M × L → mol). Values:
  acid concentration C₁ (M), acid volume V₁ (mL), moles of acid, mole ratio r (base per acid,
  allowed 1, 2, 3, ½, ⅓), moles of base, base concentration C₂, base volume V₂. Relations:
  n₁ = C₁V₁; n₂ = r·n₁; V₂ = n₂ ÷ C₂. Example: 25.00 mL of 0.150 M H₂SO₄ with 0.100 M NaOH →
  3.75 mmol × 2 = 7.50 mmol → 75.0 mL. startWith C₁, V₁, C₂.
- **Verdict:** 4 calculators; four types Solve, one after P24.

### gen-chem-1#2 — Gases

- **Textbooks:** Chemistry 2e 9.2–9.6 (ideal gas law with density and molar mass, gas
  stoichiometry, kinetic-molecular theory, non-ideal gases).
- **Refresh:** `s.10.gas-laws` and its six problem types.
- **Tests ask:**

  | Question type                              | Page        | Mark            |
  | ------------------------------------------ | ----------- | --------------- |
  | molar mass from gas density                | main        | Solves          |
  | real-gas pressure (van der Waals) vs ideal | ~real-gas   | Solves (⏳ P10) |
  | rms speed and average kinetic energy       | ~kinetic    | Solves          |
  | gas collected over water                   | ~over-water | Solves          |
  | volume of gas a reaction makes at T and P  | ~gas-stoich | Solves (⏳ P24) |

- **Main — BUILD `he.chemistry.gen-chem-1#2`:** `gasPiston` ideal (`g.s10-gas-laws-ideal`).
  Values: pressure P (atm, 0.001–1000), volume V (L), amount n (mol), temperature T (K,
  1–5000), mass m (g), molar mass M (g/mol), density d (g/L). Relations: PV = nRT; n = m ÷ M;
  d = m ÷ V (together M = dRT ÷ P, shown as a check line). Assumptions: ideal gas (low P, high
  T); R = 0.08206 L·atm/(mol·K) with P in atm and V in L; T in kelvin. Example: d = 1.25 g/L
  at 0 °C and 1.00 atm → M = 28.0 g/mol (N₂ or CO). startWith d, T, P.
- **~real-gas — BUILD (⏳ P10):** values n, V, T, a (L²·atm/mol², 0–50), b (L/mol, 0–0.5),
  ideal pressure P_id, van der Waals pressure P, compressibility Z. Relations: P_id = nRT ÷ V;
  P = nRT ÷ (V − nb) − an² ÷ V²; Z = PV ÷ (nRT). Assumptions: b is the molecules' own volume, a
  their attraction; Z < 1 means attraction wins. Example: 1.00 mol CO₂ (a = 3.59, b = 0.0427)
  in 0.500 L at 300 K → P_id = 49.2 atm, P = 53.8 − 14.4 = 39.5 atm, Z = 0.802.
- **~kinetic — BUILD:** `gasPiston` (trails ∝ √T; P10 adds the speed distribution). Values T,
  M (g/mol), rms speed u (m/s), average kinetic energy per mole KE (J/mol). Relations:
  u = √(3RT ÷ M) with M in kg/mol (a step line converts); KE = (3/2)RT. Assumptions: R =
  8.314 J/(mol·K); KE depends on T only, so lighter gases move faster at the same T. Example:
  N₂ at 300 K → u = 517 m/s, KE = 3741 J/mol. startWith T, M.
- **~over-water — BUILD:** `gasPiston` mixture (H108, gases H₂ and H₂O). Values: total
  pressure (torr), water vapor pressure (torr, default 23.8 at 25 °C), gas pressure, V, T, n.
  Relations: P_gas = P_total − P_water; n = P_gas V ÷ (RT) (a step converts torr to atm).
  Example: 0.250 L at 25 °C, 755 torr → 731.2 torr = 0.9621 atm → n = 9.83 × 10⁻³ mol.
- **~gas-stoich — BUILD (⏳ P24):** `moleMap` with a `gas: { temperature, pressure }` box.
  Values: reactant mass, molar mass, reactant moles, mole ratio r (product per reactant),
  product moles, T, P, gas volume. Relations: n₁ = m ÷ M; n₂ = r·n₁; V = n₂RT ÷ P. Example:
  5.00 g KClO₃ (122.55 g/mol; 2KClO₃ → 2KCl + 3O₂) → 0.04080 mol × 3/2 = 0.06120 mol O₂ →
  1.50 L at 25 °C and 1.00 atm.
- **Verdict:** 5 calculators; five types Solve, two after their pictures.

### gen-chem-1#3 — Thermochemistry

- **Textbooks:** Chemistry 2e 5.1–5.3 (calorimetry, bomb calorimeter, enthalpy, bond energies
  in 7.5).
- **Refresh:** `s.10.thermochemistry~calorimetry`, `~hess`, `~formation`.
- **Tests ask:**

  | Question type                                   | Page           | Mark             |
  | ----------------------------------------------- | -------------- | ---------------- |
  | ΔH per mole from a coffee-cup temperature rise  | main           | Solves           |
  | ΔU and ΔH of combustion from a bomb calorimeter | ~bomb          | Solves (⏳ P15)  |
  | estimate ΔH from bond enthalpies                | ~bond-enthalpy | Solves (⏳ E3)   |
  | ΔH°rxn from ΔH°f, Hess's law                    | Grade 10 pages | Solves (Refresh) |

- **Main — BUILD `he.chemistry.gen-chem-1#3`:** `energyProfile` calorimeter
  (`g.s10-thermochemistry-calorimeter`). Values: solution mass m (g), specific heat c
  (J/(g·°C), default 4.184), temperature change ΔT (°C), heat gained by the solution q (J),
  moles reacting n, enthalpy change ΔH (kJ/mol). Relations: q = mcΔT; ΔH = −q ÷ (1000n).
  Assumptions: the solution has water's density and c; no heat goes to the cup or air; the
  heat the solution gains came from the reaction, so a rise means ΔH < 0. Example: 50.0 mL of
  1.00 M HCl + 50.0 mL of 1.00 M NaOH (100.0 g), ΔT = 6.70 °C → q = 2803 J, n = 0.0500 mol,
  ΔH = −56.1 kJ/mol. startWith m, ΔT, n.
- **~bomb — BUILD (⏳ P15, calorimeter `bomb`):** values sample mass m, molar mass M, moles n,
  calorimeter constant C_cal (kJ/°C), ΔT, heat q (kJ), ΔU (kJ/mol), change in moles of gas Δn_g,
  T, ΔH (kJ/mol). Relations: q = C_cal ΔT; ΔU = −q ÷ n; ΔH = ΔU + Δn_g RT (R in kJ). Assumptions:
  constant volume, so the heat is ΔU; Δn_g counts gases only (water as liquid). Example: 0.6400 g
  naphthalene (128.17 g/mol, C₁₀H₈ + 12O₂ → 10CO₂ + 4H₂O(l), Δn_g = −2), C_cal = 10.00 kJ/°C,
  ΔT = 2.57 °C → q = 25.70 kJ, ΔU = −5147 kJ/mol, ΔH = −5152 kJ/mol. 10 values.
- **~bond-enthalpy — BUILD (⏳ E3):** `energyProfile` mode `ladder` (atoms at the top: up by the
  bonds broken, down by the bonds formed). Values: reaction (picked from a list: methane,
  hydrogen + chlorine, ethene + hydrogen, ammonia synthesis), energy to break bonds B (kJ),
  energy released forming bonds F (kJ), ΔH. Relation: ΔH = B − F (the step lines list each bond:
  4 × 413 + 2 × 495). Assumptions: average bond enthalpies of gases, so the answer is an
  estimate. Example: CH₄ + 2O₂ → CO₂ + 2H₂O(g): B = 2642, F = 3450 → ΔH ≈ −808 kJ/mol.
- **Verdict:** 3 calculators; all types Solve once P15 and E3 land.

### gen-chem-1#4 — Bonding and molecular geometry

- **Textbooks:** Chemistry 2e 7.1–7.6 (Lewis structures, formal charge, resonance, lattice
  energy, VSEPR), 8.1–8.4 (hybrid orbitals, MO theory).
- **Refresh:** `s.10.bonding`, `s.10.molecular-shape` (2–4 domains).
- **Tests ask:**

  | Question type                                     | Page           | Mark            |
  | ------------------------------------------------- | -------------- | --------------- |
  | shape, angle and hybridization of SF₄, XeF₄, PCl₅ | main           | Solves (⏳ P13) |
  | formal charges; the best resonance structure      | ~formal-charge | Solves (⏳ P12) |
  | lattice energy from a Born–Haber cycle            | ~born-haber    | Solves          |
  | bond order and magnetism of O₂, N₂⁺ from MOs      | ~bond-order    | Solves (⏳ P3)  |

- **Main — BUILD `he.chemistry.gen-chem-1#4` (⏳ P13):** `vsepr` with 5–6 domains and the hybrid
  named. Values: total valence electrons V (2–60), bonded atoms b (1–6), electrons on the outer
  atoms o (lone electrons, 0–42), lone pairs on the center l, electron domains d, smallest
  ideal bond angle θ (derived). Relations: l = (V − 2b − o) ÷ 2; d = b + l; θ from d (180°,
  120°, 109.5°, 90°, 90°). Assumptions: count the ion's charge in V; hybrid orbitals = d (sp …
  sp³d²); lone pairs take the roomiest places (equatorial in 5 domains). Example: XeF₄:
  V = 8 + 28 = 36, b = 4, o = 24 → l = 2, d = 6, sp³d², square planar, 90°. startWith V, b, o.
- **~formal-charge — BUILD (⏳ P12):** values valence electrons of the free atom v, nonbonding
  electrons N, bonding electrons B, formal charge FC. Relation: FC = v − N − B ÷ 2. Assumptions:
  the charges in one structure add to the ion's charge; the best structure has charges nearest
  zero, a negative one on the more electronegative atom. Example: nitrate, N with one double
  and two single bonds: 5 − 0 − 4 = +1; a single-bonded O: 6 − 6 − 1 = −1.
- **~born-haber — BUILD:** `energyProfile` mode `ladder` (H101). Values: sublimation ΔH_sub,
  first ionization energy IE, half the bond energy ½D, electron affinity EA (signed), ΔH°f,
  lattice energy U (all kJ/mol). Relation: ΔH°f = ΔH_sub + IE + ½D + EA + U. Assumptions: U is
  the gaseous ions forming the solid (negative; some books quote the reverse, positive). Example:
  NaCl: 107 + 496 + 121 − 349 + U = −411 → U = −786 kJ/mol. startWith all but U.
- **~bond-order — BUILD (⏳ P3, E7):** values valence electrons of the diatomic (2–20; Li₂ to
  Ne₂ and ions), bonding electrons, antibonding electrons, bond order, unpaired electrons.
  Relations: filling by the MO order (σ2s, σ*2s, π2p, σ2p up to N₂; σ2p below π2p from O₂);
  bond order = (bonding − antibonding) ÷ 2. Example: O₂ (12) → 8 and 4, bond order 2, two
  unpaired (paramagnetic); O₂⁺ → 2.5.
- **Verdict:** 4 calculators; four types Solve, three after their pictures.

## General Chemistry II — `he.chemistry.gen-chem-2`

Prerequisite `he.chemistry.gen-chem-1`. Textbooks: OpenStax Chemistry 2e ch. 12–17; MIT OCW
5.112 and the second half of 5.111.

### gen-chem-2#0 — Kinetics

- **Textbooks:** Chemistry 2e 12.3 (rate laws, method of initial rates), 12.4 (integrated rate
  laws, half-lives), 12.5 (Arrhenius), 12.6 (mechanisms).
- **Refresh:** `s.10.rates-equilibrium~average-rate`, `~rate-factors`, `~catalyst`.
- **Tests ask:**

  | Question type                                     | Page           | Mark   |
  | ------------------------------------------------- | -------------- | ------ |
  | concentration after t, time to reach a level, t½  | main           | Solves |
  | second-order: [A] at t, half-life depends on [A]₀ | ~second-order  | Solves |
  | zero-order: when it runs out                      | ~zero-order    | Solves |
  | order and k from a table of initial rates         | ~initial-rates | Solves |
  | Eₐ from k at two temperatures; k at a new T       | ~arrhenius     | Solves |
  | which mechanism fits the observed rate law        | ~mechanism     | Solves |

- **Main — BUILD `he.chemistry.gen-chem-2#0`:** `chemDiagram` mode `rate` (H108, interim: [A]
  against t through (0, [A]₀) and (t, [A]); P7 adds the ln[A] line and half-lives). Values: rate
  constant k (s⁻¹, 10⁻¹⁰–10⁶), starting concentration [A]₀ (M), time t (s), concentration [A]
  (M), half-life t½ (s), fraction left f. Relations: ln([A]₀ ÷ [A]) = kt; t½ = ln 2 ÷ k;
  f = [A] ÷ [A]₀. Assumptions: first order in A; t½ doesn't depend on [A]₀; a straight ln[A]–t
  line is the test for first order. Example: k = 5.0 × 10⁻⁴ s⁻¹, [A]₀ = 0.200 M, t = 1000 s →
  [A] = 0.200e^(−0.50) = 0.121 M, t½ = 1386 s, f = 0.607. startWith k, [A]₀, t.
- **~second-order — BUILD:** `chemDiagram` rate (as main). Values k (M⁻¹s⁻¹), [A]₀, t, [A], t½.
  Relations: 1/[A] = 1/[A]₀ + kt; t½ = 1 ÷ (k[A]₀). Example: k = 0.50 M⁻¹s⁻¹, [A]₀ = 0.100 M,
  t = 60 s → 1/[A] = 10 + 30 = 40 M⁻¹, [A] = 0.0250 M; t½ = 20 s.
- **~zero-order — BUILD:** `chemDiagram` rate. Values k (M/s), [A]₀, t, [A], t½, time to run
  out t_end. Relations: [A] = [A]₀ − kt; t½ = [A]₀ ÷ (2k); t_end = [A]₀ ÷ k (page limit:
  t ≤ t_end, never a relation). Example: k = 2.0 × 10⁻³ M/s, [A]₀ = 0.500 M, t = 100 s →
  [A] = 0.300 M, t½ = 125 s, t_end = 250 s.
- **~initial-rates — BUILD:** `table` sweeping [A] (0.05, 0.10, 0.20, 0.40 M) for the rate with
  k, m, [B], n held. Values: [A] in run 1 and run 2, rate in run 1 and run 2 (M/s), order in A
  m, [B] (held), order in B n (given), rate constant k. Relations: m = log(rate₂ ÷ rate₁) ÷
  log([A]₂ ÷ [A]₁); k = rate₁ ÷ ([A]₁^m[B]ⁿ). Example: 0.10 → 0.20 M, 2.0 × 10⁻³ →
  8.0 × 10⁻³ M/s → m = 2; [B] = 0.10 M, n = 1 → k = 2.0 M⁻²s⁻¹. startWith the four readings.
- **~arrhenius — BUILD:** `functionGraph` linear (ln k against 1/T, slope −Eₐ/R, the two
  readings marked; P7 `arrhenius` later). Values k₁, T₁, k₂, T₂, activation energy Eₐ
  (kJ/mol), frequency factor A. Relations: ln(k₂ ÷ k₁) = (Eₐ ÷ R)(1/T₁ − 1/T₂); k₁ = A e^(−Eₐ/RT₁).
  Example: k doubles from 25 °C to 35 °C → Eₐ = 52.9 kJ/mol; with k₁ = 1.0 × 10⁻³ s⁻¹,
  A = 1.9 × 10⁶ s⁻¹. Serves `physical-1#3` too (no second page).
- **~mechanism — BUILD (sort):** bins "rate = k[A]²", "rate = k[A][B]", "rate = k[A]". Cards:
  "slow: A + A → C + D; fast: D + B → A + E"; "one step: 2A → C" (k[A]²); "slow: A + B → C;
  fast: C + A → D"; "one step: A + B → C" (k[A][B]); "slow: A → C + D; fast: C + B → E";
  "slow: A → C; fast: C + B → D" (k[A]); "slow: NO₂ + NO₂ → NO₃ + NO; fast: NO₃ + CO → NO₂ +
  CO₂" (k[NO₂]², in the first bin with A = NO₂). Sentence: "The slow step sets the rate: its
  reactants, counted by their coefficients, give the rate law." Intro: no card starts with a
  fast equilibrium (that case needs the steady-state page, `physical-1#3`).
- **Verdict:** 6 pages (5 calculators, 1 sort); the six common types Solve.

### gen-chem-2#1 — Equilibrium

- **Textbooks:** Chemistry 2e 13.2 (K, Kp and Kc), 13.4 (equilibrium calculations), 15.1
  (precipitation and the common ion).
- **Refresh:** `s.10.rates-equilibrium` (ICE chart), `~shift`, `~le-chatelier`, `~ksp`.
- **Tests ask:**

  | Question type                                 | Page          | Mark   |
  | --------------------------------------------- | ------------- | ------ |
  | equilibrium concentrations from K (quadratic) | main          | Solves |
  | convert Kc to Kp                              | ~kp-kc        | Solves |
  | K of a reversed, scaled or added reaction     | ~manipulate-k | Solves |
  | solubility with a common ion                  | ~common-ion   | Solves |

- **Main — BUILD `he.chemistry.gen-chem-2#1`:** `equilibriumChart` (species H₂, I₂ reactants, HI
  product with coef 2, `K: 'K'`, each `eq` checked; from `g.s10-rates-equilibrium-add`). Values:
  K (10⁻⁶–10⁶), [H₂]₀, [I₂]₀, [HI]₀ (M, 0–10), change x, [H₂], [I₂], [HI]. Relations:
  K = [HI]² ÷ ([H₂][I₂]); [H₂] = [H₂]₀ − x; [I₂] = [I₂]₀ − x; [HI] = [HI]₀ + 2x. Assumptions:
  concentrations at equilibrium, not at the start, go into K; x must leave no concentration
  below 0 (the other root of the quadratic is rejected; E4 writes that line). Example: K = 50.5,
  0.100 M H₂ and I₂ → 2x ÷ (0.100 − x) = √50.5 = 7.106 → x = 0.0780, [HI] = 0.156 M,
  [H₂] = [I₂] = 0.0220 M. startWith K, [H₂]₀, [I₂]₀.
- **~kp-kc — BUILD:** `table` sweeping T (300, 400, 500, 600 K) for Kp with Kc held. Values Kc,
  change in moles of gas Δn (whole, −4 to 4), T, Kp. Relation: Kp = Kc(RT)^Δn with R = 0.08206
  (pressures in atm). Example: N₂ + 3H₂ ⇌ 2NH₃, Kc = 0.50 at 400 K, Δn = −2 → Kp = 4.64 × 10⁻⁴.
- **~manipulate-k — BUILD:** `none`. Values K₁, multiplier n (−3 to 3; −1 reverses, ½ halves),
  K₂ of a reaction added (default 1), overall K. Relation: K = K₁ⁿ × K₂. Example: K₁ =
  4.0 × 10⁻³ reversed → 250; halved → 0.0632. Use: "Use this for 'K = 4.0 × 10⁻³ for
  A ⇌ 2B. What is K for 2B ⇌ A, and for ½A ⇌ B?'"
- **~common-ion — BUILD:** `beaker` solubility (H52, `g.s10-molarity-solubility`). Values
  solubility product Ksp, common-ion concentration c (M), molar solubility s, solubility in
  pure water s₀. Relations: Ksp = s(c + s) for a 1:1 salt (solved exactly); s₀ = √Ksp.
  Example: AgCl, Ksp = 1.8 × 10⁻¹⁰, in 0.10 M NaCl → s = 1.8 × 10⁻⁹ M, against 1.3 × 10⁻⁵ M in
  water (about 7500 times less).
- **Verdict:** 4 calculators; four types Solve (E4 improves the quadratic's lines).

### gen-chem-2#2 — Acid–base equilibria and buffers

- **Textbooks:** Chemistry 2e 14.3 (Kₐ, Kb, percent ionization), 14.4 (salts), 14.6 (buffers),
  14.7 (titrations).
- **Refresh:** `s.10.acids-bases`, `~titration`, `~weak-titration`.
- **Tests ask:**

  | Question type                                        | Page            | Mark   |
  | ---------------------------------------------------- | --------------- | ------ |
  | pH and percent ionization of a weak acid             | main            | Solves |
  | pH of a weak base                                    | ~weak-base      | Solves |
  | buffer pH; pH after adding strong acid or base       | ~buffer         | Solves |
  | pH of a salt solution                                | ~salt-ph        | Solves |
  | pH at the equivalence point of a weak-acid titration | ~equivalence-ph | Solves |

- **Main — BUILD `he.chemistry.gen-chem-2#2`:** `phScale` (`g.s10-acids-bases-ph`, `pH: 'p',
hydrogen: 'x'`). Values: acid constant Kₐ (10⁻¹⁴–10), starting concentration C (M), [H⁺] x,
  pH, pKₐ, percent ionized. Relations: Kₐ = x² ÷ (C − x) (solved by the quadratic formula);
  pH = −log x; pKₐ = −log Kₐ; % = 100x ÷ C. Assumptions: water's own H⁺ is left out (fine
  while x > 10⁻⁶ M); a check line compares the shortcut √(KₐC) (within 5% is fine). Example:
  ethanoic acid, Kₐ = 1.8 × 10⁻⁵, C = 0.100 M → x = 1.33 × 10⁻³ M, pH = 2.88, 1.33% (shortcut
  1.34 × 10⁻³). startWith Kₐ, C.
- **~weak-base — BUILD:** `phScale` (`g.s10-acids-bases-base`). Values Kb, C, [OH⁻], pOH, pH.
  Relations: Kb = y² ÷ (C − y); pOH = −log y; pH = 14.00 − pOH. Example: 0.100 M NH₃
  (Kb = 1.8 × 10⁻⁵) → pOH 2.88, pH 11.12.
- **~buffer — BUILD:** `phScale` (interim; P6 adds the buffer bracket and the HA and A⁻ bars).
  Values pKₐ, moles HA, moles A⁻, strong acid added a (mol, signed: − for strong base), pH
  before, pH after. Relations: pH = pKₐ + log(n_A⁻ ÷ n_HA); after = pKₐ + log((n_A⁻ − a) ÷
  (n_HA + a)). Assumptions: both amounts much larger than a; the volume cancels in the ratio.
  Example: pKₐ 4.74, 0.100 mol HA, 0.150 mol A⁻ → 4.92; add 0.010 mol HCl → 4.85.
- **~salt-ph — BUILD:** `phScale`. Values Kₐ of the parent acid, Kb = K_w ÷ Kₐ, salt
  concentration C, [OH⁻], pH. Example: 0.100 M sodium ethanoate → Kb = 5.6 × 10⁻¹⁰,
  [OH⁻] = 7.45 × 10⁻⁶ M, pH 8.87.
- **~equivalence-ph — BUILD:** `phScale` titration (`g.s10-acids-bases-weak-titration`). Values
  acid concentration C_a, acid volume V_a, base concentration C_b, equivalence volume V_e,
  conjugate base concentration at equivalence [A⁻], Kb, pH. Relations: V_e = C_aV_a ÷ C_b;
  [A⁻] = C_aV_a ÷ (V_a + V_e); [OH⁻] = √(Kb[A⁻]). Example: 25.00 mL of 0.100 M ethanoic acid
  with 0.100 M NaOH → V_e = 25.00 mL, [A⁻] = 0.0500 M, pH 8.72.
- **Verdict:** 5 calculators; the five common types Solve.

### gen-chem-2#3 — Entropy and Gibbs free energy

- **Textbooks:** Chemistry 2e 16.2–16.4 (entropy, the second law, free energy and K); 17.4 for
  ΔG and E°.
- **Refresh:** `s.10.entropy-free-energy` (ΔG = ΔH − TΔS, crossover, from tables, sign of ΔS).
- **Tests ask:**

  | Question type                               | Page           | Mark   |
  | ------------------------------------------- | -------------- | ------ |
  | K from ΔG°, and ΔG° from K                  | main           | Solves |
  | ΔG under non-standard conditions; which way | ~nonstandard   | Solves |
  | entropy of vaporization or fusion           | ~phase-entropy | Solves |
  | ΔS of the universe; is it spontaneous       | ~second-law    | Solves |

- **Main — BUILD `he.chemistry.gen-chem-2#3`:** `table` (interim) sweeping ΔG° (−20, −10, 0, 10,
  20 kJ/mol) for K at the page's T (each 10 kJ/mol is a factor of 56.5 at 25 °C); P23 draws
  G against the extent. Values: standard free energy change ΔG° (kJ/mol, −1000 to 1000), T (K),
  ln K, K. Relations: ΔG° = −RT ln K. Assumptions: R = 8.314 J/(mol·K), so ΔG° goes into J;
  ΔG° < 0 means K > 1 (products favored), not that the reaction is fast. Example: ΔG° =
  −33.0 kJ/mol at 298.15 K → ln K = 13.31, K = 6.0 × 10⁵. startWith ΔG°, T.
- **~nonstandard — BUILD:** `none` (P23 later). Values ΔG°, T, reaction quotient Q, ΔG.
  Relation: ΔG = ΔG° + RT ln Q. Example: ΔG° = −33.0 kJ/mol, Q = 1.0 × 10⁶ at 298.15 K →
  ΔG = +1.2 kJ/mol: Q > K, so the reaction runs backward.
- **~phase-entropy — BUILD:** `heatingCurve` (`g.heating-curve`, the boiling flat lit). Values
  ΔH_vap (kJ/mol), boiling point T_b (K), ΔS_vap (J/(mol·K)). Relation: ΔS = 1000ΔH ÷ T_b (at
  the transition ΔG = 0). Example: water 40.7 kJ/mol at 373.15 K → 109 J/(mol·K); benzene 30.7
  at 353.2 K → 86.9 (Trouton's rule, about 85–88; water is higher because of hydrogen bonds).
- **~second-law — BUILD:** `none`. Values ΔS_sys (J/(mol·K)), ΔH_sys (kJ/mol), T, ΔS_surr,
  ΔS_univ. Relations: ΔS_surr = −1000ΔH_sys ÷ T; ΔS_univ = ΔS_sys + ΔS_surr. Example: water
  freezing at −10 °C (using the 0 °C values −22.0 J/(mol·K) and −6.01 kJ/mol) → ΔS_surr = +22.8,
  ΔS_univ = +0.8 J/(mol·K) > 0, so it freezes.
- **Verdict:** 4 calculators; the four common types Solve.

### gen-chem-2#4 — Electrochemistry

- **Textbooks:** Chemistry 2e 17.3–17.4 (cell potentials, ΔG, K, Nernst), 17.7 (electrolysis).
- **Refresh:** `s.10.redox~cell-voltage`, `~oxidation-numbers`, `~electrolysis` (the sort).
- **Tests ask:**

  | Question type                                 | Page                | Mark           |
  | --------------------------------------------- | ------------------- | -------------- |
  | cell potential at non-standard concentrations | main                | Solves         |
  | ΔG° and K from E°cell                         | ~free-energy-k      | Solves         |
  | mass plated by a current in a time            | ~electrolysis       | Solves (⏳ P9) |
  | voltage of a concentration cell               | ~concentration-cell | Solves         |

- **Main — BUILD `he.chemistry.gen-chem-2#4`:** `chemDiagram` mode `cell` (H108, `cathode`,
  `anode` E° values; P9 adds each beaker's concentration and Q). Values: standard cell
  potential E° (V, −6 to 6), electrons transferred n (whole, 1–6), T (K, default 298.15),
  anode ion concentration (M), cathode ion concentration (M), Q, E (V). Relations: Q =
  [anode ion] ÷ [cathode ion] (for M | M²⁺ ‖ N²⁺ | N, assumption says so); E = E° − (RT ÷ nF)
  ln Q. Assumptions: at 25 °C this is E° − (0.05916 ÷ n) log Q; solids are left out of Q.
  Example: Zn | Zn²⁺ (1.0 M) ‖ Cu²⁺ (0.010 M) | Cu: E° = 1.10 V, n = 2, Q = 100 →
  E = 1.10 − 0.059 = 1.04 V. startWith E°, n, the two concentrations.
- **~free-energy-k — BUILD:** `chemDiagram` cell (as main). Values n, E°, ΔG° (kJ/mol), T, K.
  Relations: ΔG° = −nFE°; ln K = nFE° ÷ RT. Example: n = 2, E° = 1.10 V → ΔG° = −212 kJ/mol,
  K = 1.5 × 10³⁷.
- **~electrolysis — BUILD (⏳ P9):** values current I (A), time t (s; min by unit), charge Q
  (C), moles of electrons, electrons per ion z, moles of metal, molar mass M, mass m.
  Relations: Q = It; n_e = Q ÷ F; n = n_e ÷ z; m = nM. Example: 2.00 A for 30.0 min plating
  copper(II) → 3600 C, 0.0373 mol e⁻, 0.0187 mol, 1.19 g Cu. Serves `analytical#4`
  electrogravimetry too.
- **~concentration-cell — BUILD:** `chemDiagram` cell with one metal both sides (E° = 0; P9
  draws the two concentrations). Values n, dilute concentration, concentrated concentration, E.
  Relation: E = (0.05916 ÷ n) log(c_conc ÷ c_dil) at 25 °C. Example: Cu²⁺ at 1.0 M and
  1.0 × 10⁻³ M → 0.0887 V.
- **Verdict:** 4 calculators; four types Solve, one after P9.

## Organic Chemistry I — `he.chemistry.organic-1`

Prerequisite `he.chemistry.gen-chem-2`. Textbooks: OpenStax Organic Chemistry (McMurry, 10th
ed.) ch. 1–13; MIT OCW 5.12. Most topics are patterns, so the main pages are sorts and
sequences; text cards ship now and P14 (skeletal cards) adds the structures.

### organic-1#0 — Structure and nomenclature

- **Textbooks:** Organic Chemistry ch. 1–3 (bonding, polar bonds, acids and bases with pKₐ,
  alkanes and their names), 4 (cycloalkanes).
- **Refresh:** `s.10.organic` (hydrocarbons), `s.10.organic~functional-groups`, `~isomers`.
- **Tests ask:**

  | Question type                                       | Page               | Mark   |
  | --------------------------------------------------- | ------------------ | ------ |
  | IUPAC name of a branched alkane                     | main               | Solves |
  | name a compound with two functional groups (suffix) | ~functional-groups | Solves |
  | degree of unsaturation from a formula               | ~unsaturation      | Solves |
  | which way an acid–base reaction lies; its K         | ~pka-equilibrium   | Solves |
  | rank acids by strength                              | ~acid-order        | Solves |

- **Main — BUILD `he.chemistry.organic-1#0` (sequence):** "Name a branched alkane." Stages:
  "Find the longest carbon chain: the parent", "Number the chain from the end nearer the first
  branch", "Name each branch and give it its number", "List the branches in alphabetical order
  (di- and tri- don't count)", "Write the numbers, the branch names, then the parent". Intro:
  the worked molecule (3-ethyl-2-methylhexane) in condensed form. Spans: none.
- **~functional-groups — BUILD (sort):** bins by the name's ending: "-oic acid", "-oate",
  "-amide", "-nitrile", "-al", "-one", "-ol", "-amine". Cards (`condensed` where its groups
  exist, text for amide and nitrile until P14): CH₃CH₂COOH, CH₃COOCH₂CH₃, CH₃CONH₂, CH₃CH₂CN,
  CH₃CH₂CHO, CH₃COCH₃, CH₃CH₂OH, CH₃CH₂NH₂, HOCH₂CH₂COOH (-oic acid), CH₃COCH₂CH₂OH (-one).
  Sentence: "With two groups, the one higher in priority gives the ending; the other becomes a
  prefix (hydroxy-)." `pickBar: true`.
- **~unsaturation — BUILD:** `none` (P14 draws a structure with its rings and π bonds counted).
  Values: carbons C (1–40), hydrogens H (0–82), nitrogens N (0–10), halogens X (0–20), index
  of hydrogen deficiency IHD. Relation: IHD = (2C + 2 + N − H − X) ÷ 2. Assumptions: O and S
  don't change it; each ring or π bond counts 1, a triple bond 2, a benzene ring 4. Example:
  C₆H₁₀O → (12 + 2 − 10) ÷ 2 = 2 (cyclohexanone: one ring, one C=O). startWith C, H, N, X.
- **~pka-equilibrium — BUILD:** `none` (P22 pKₐ ladder later). Values: pKₐ of the acid on the
  left, pKₐ of the acid formed on the right, log K, K. Relations: log K = pKₐ(right) −
  pKₐ(left); K = 10^log K. Assumptions: the reaction favors the side with the weaker acid
  (the larger pKₐ). Example: ethanoic acid (4.76) + hydroxide → water (15.7) → log K = 10.94,
  K = 8.7 × 10¹⁰. Use: "Use this for 'Does sodium hydroxide deprotonate ethanoic acid? Find K.'"
- **~acid-order — BUILD (sequence):** "Order from the strongest acid to the weakest": HCl,
  ethanoic acid, phenol, water, ethyne, ammonia, ethane (pKₐ about −7, 4.8, 10, 15.7, 25, 38,
  50, shown after each is placed). Ethanol is left out (its pKₐ is too close to water's for one
  right order).
- **Verdict:** 5 pages (2 calculators, 2 sequences, 1 sort); the five common types Solve.

### organic-1#1 — Stereochemistry

- **Textbooks:** Organic Chemistry ch. 4 (chair cyclohexane), 5 (chirality, R/S, optical
  activity, diastereomers, meso compounds).
- **Tests ask:**

  | Question type                                           | Page              | Mark                            |
  | ------------------------------------------------------- | ----------------- | ------------------------------- |
  | enantiomers, diastereomers, identical or constitutional | main              | Solves                          |
  | rank groups by CIP priority; assign R or S              | ~cip              | Partly (ranking; R/S needs P14) |
  | specific rotation; enantiomeric excess                  | ~optical-rotation | Solves                          |
  | percent of the equatorial chair conformer               | ~chair            | Solves                          |

- **Main — BUILD `he.chemistry.organic-1#1` (sort):** bins "Identical", "Enantiomers",
  "Diastereomers", "Constitutional isomers". Cards (pairs): (R)- and (S)-butan-2-ol;
  (2R,3R)- and (2S,3S)-2,3-dibromobutane (enantiomers); (2R,3S)- and (2S,3R)-2,3-dibromobutane
  (identical: meso); (2R,3R)- and (2R,3S)-2,3-dibromobutane; cis- and trans-but-2-ene;
  (2R,3R)- and (2S,3R)-2-bromo-3-chlorobutane (diastereomers); butan-1-ol and butan-2-ol;
  1-chloropropane and 2-chloropropane (constitutional); (R)-2-chlorobutane and the same drawing
  turned over (identical). Sentence: "Enantiomers flip every stereocenter; diastereomers flip
  some but not all; a meso compound is its own mirror image."
- **~cip — BUILD (sequence):** "Order by CIP priority, highest first": –Br, –OH, –NH₂, –CH₂OH,
  –CH₃, –H (atomic number first; –CH₂OH beats –CH₃ at the first point of difference, O over H).
- **~optical-rotation — BUILD:** `none`. Values: observed rotation α (°, −180 to 180), path
  length l (dm, default 1.00), concentration c (g/mL), specific rotation [α], pure enantiomer's
  [α]₀, enantiomeric excess ee (%), major enantiomer (%). Relations: [α] = α ÷ (lc);
  ee = 100[α] ÷ [α]₀; major = (100 + ee) ÷ 2. Assumptions: a racemic mixture reads 0; the sign
  (+ or −) says nothing about R or S. Example: α = +2.66°, l = 1.00 dm, c = 0.0500 g/mL →
  [α] = +53.2°; [α]₀ = +66.4° → ee = 80.1%, 90.1% (+). startWith α, l, c.
- **~chair — BUILD:** `none` (P14 chair later). Values: A-value A (kJ/mol, 0–25), T (K),
  equilibrium constant K (equatorial ÷ axial), percent equatorial. Relations: K = e^(A/RT);
  % = 100K ÷ (1 + K). Assumptions: A is the axial conformer's extra free energy (1,3-diaxial
  strain); a bulkier group has a larger A. Example: methyl, A = 7.3 kJ/mol at 298.15 K →
  K = 19.0, 95.0% equatorial.
- **Verdict:** 4 pages (2 calculators, 1 sort, 1 sequence); R/S on a drawn molecule waits on P14.

### organic-1#2 — Substitution and elimination

- **Textbooks:** Organic Chemistry ch. 10–11 (alkyl halides; SN2, SN1, E2, E1 and how to tell
  which).
- **Tests ask:**

  | Question type                                        | Page            | Mark            |
  | ---------------------------------------------------- | --------------- | --------------- |
  | predict SN1, SN2, E1 or E2 from the conditions       | main            | Solves          |
  | rank substrates by SN2 rate                          | ~sn2-order      | Solves          |
  | how the rate changes when [RX] or [Nu] changes       | ~rate-law       | Solves          |
  | read a reaction energy diagram (steps, intermediate) | ~energy-diagram | Solves (⏳ P15) |

- **Main — BUILD `he.chemistry.organic-1#2` (sort):** bins SN2, SN1, E2, E1. Cards:
  CH₃CH₂Br + NaCN in DMSO; CH₃I + NaOCH₃ in CH₃OH (SN2); (CH₃)₃CBr in water at 25 °C;
  (CH₃)₃CBr in methanol at 25 °C; (CH₃)₃COH + HBr (SN1); (CH₃)₃CBr + NaOCH₂CH₃ in ethanol;
  2-bromopropane + KOC(CH₃)₃ (E2); 2-methylbutan-2-ol + H₂SO₄, heated (E1). Sentence: "Methyl
  and primary carbons with a good nucleophile substitute in one step; tertiary carbons form a
  cation unless a strong base takes a proton." `pickBar: true`.
- **~sn2-order — BUILD (sequence):** "Order by SN2 rate with I⁻ in acetone, fastest first":
  CH₃Br, CH₃CH₂Br, (CH₃)₂CHBr, (CH₃)₃CBr (crowding at the carbon blocks the backside attack).
- **~rate-law — BUILD:** `none`. Values: order in nucleophile p (allowed 0: SN1, 1: SN2),
  factor on [RX] (0.1–10), factor on [Nu] (0.1–10), factor on the rate. Relation: rate factor =
  f_RX × f_Nu^p. Example: SN2, [RX] doubled and [Nu] tripled → × 6; SN1 → × 2.
- **~energy-diagram — BUILD (⏳ P15):** `energyProfile` `steps`. Values: step 1 barrier Eₐ₁,
  intermediate energy I, step 2 barrier Eₐ₂ (from I), product energy P, first transition state
  T₁, second T₂, highest barrier, ΔH (kJ/mol, reactants at 0). Relations: T₁ = Eₐ₁; T₂ = I + Eₐ₂;
  highest = max(T₁, T₂); ΔH = P. Example: Eₐ₁ = 90, I = 60, Eₐ₂ = 10, P = −20 → T₁ = 90,
  T₂ = 70: step 1 is rate-determining; ΔH = −20 kJ/mol (an SN1 shape).
- **Verdict:** 4 pages (2 calculators, 1 sort, 1 sequence).

### organic-1#3 — Alkenes and alkynes

- **Textbooks:** Organic Chemistry ch. 7–9 (alkene stability, electrophilic addition,
  Markovnikov's rule, hydroboration, halogenation, oxidation; alkynes).
- **Tests ask:**

  | Question type                                  | Page                          | Mark                  |
  | ---------------------------------------------- | ----------------------------- | --------------------- |
  | where the new group goes (Markovnikov or not)  | main                          | Solves                |
  | syn or anti addition; which stereoisomer forms | ~stereo                       | Solves                |
  | rings and π bonds from formula and H₂ uptake   | ~hydrogenation                | Solves                |
  | deprotonate a terminal alkyne with NaNH₂?      | `organic-1#0~pka-equilibrium` | Solves (pKₐ 25 vs 38) |

- **Main — BUILD `he.chemistry.organic-1#3` (sort):** bins "The new group goes to the more
  substituted carbon (Markovnikov)", "… to the less substituted carbon (anti-Markovnikov)",
  "The same group goes to both carbons". Cards: HBr; HCl; H₂O with H₂SO₄; Br₂ in water (OH to
  the more substituted carbon); HBr with peroxides; BH₃ then H₂O₂ and NaOH; H₂ with Pd; Br₂ in
  CH₂Cl₂; OsO₄ then NaHSO₃. Sentence: "Where a cation forms, it forms on the more substituted
  carbon, and the new group bonds there."
- **~stereo — BUILD (sort):** bins "Syn: both to the same face", "Anti: opposite faces",
  "Either face: a flat cation". Cards: H₂ with Pd; BH₃ then H₂O₂, NaOH; OsO₄ (syn); Br₂; Br₂ in
  water; a peroxyacid then H₃O⁺ (anti); HBr; H₂O with H₂SO₄ (either).
- **~hydrogenation — BUILD:** `none` (P14 later). Values: carbons C, hydrogens H, IHD, sample
  mass m, molar mass M, moles of compound n, moles of H₂ taken up, π bonds, rings. Relations:
  IHD = (2C + 2 − H) ÷ 2; n = m ÷ M; π = n_H₂ ÷ n; rings = IHD − π. Example: 0.500 g of C₆H₁₀
  (82.14 g/mol, 6.09 mmol) takes up 6.09 mmol of H₂ → IHD 2, 1 π bond, 1 ring (cyclohexene).
- **Verdict:** 3 pages (1 calculator, 2 sorts).

### organic-1#4 — IR and NMR spectroscopy

- **Textbooks:** Organic Chemistry ch. 12 (IR), 13 (¹H and ¹³C NMR: shift, integration,
  splitting).
- **Tests ask:**

  | Question type                                       | Page       | Mark                                                |
  | --------------------------------------------------- | ---------- | --------------------------------------------------- |
  | how many H each signal stands for (integration)     | main       | Solves                                              |
  | multiplicity and intensities from neighbors (n + 1) | ~splitting | Solves                                              |
  | convert Hz from TMS to δ (ppm) at a field           | ~splitting | Solves                                              |
  | which functional group a band shows                 | ~ir-bands  | Solves                                              |
  | propose a structure from IR, NMR and the formula    | —          | No (a multi-clue puzzle; see "Not in the taxonomy") |

- **Main — BUILD `he.chemistry.organic-1#4`:** `bars` (interim: one bar per signal by its
  integral, its H count over it; P5 `nmr` later). Values: H in the formula (1–60), integrals
  I₁, I₂, I₃ (any units), their sum, H in each signal h₁, h₂, h₃. Relations: sum = I₁ + I₂ + I₃;
  hᵢ = H × Iᵢ ÷ sum. Assumptions: an integral counts H, not carbons; round each to a whole
  number. Example: C₄H₈O₂, integrals 26.0, 17.4, 26.1 → 3.0, 2.0, 3.0 H (ethyl ethanoate).
- **~splitting — BUILD:** `pascalTriangle` (row n lit: the line intensities). Values: neighbor
  H n (0–8), lines n + 1, coupling constant J (Hz), spectrometer frequency ν₀ (MHz), multiplet
  width (Hz), width (ppm), shift from TMS (Hz), chemical shift δ (ppm). Relations: lines =
  n + 1; width = nJ; width (ppm) = width ÷ ν₀; δ = shift ÷ ν₀. Assumptions: equal J to
  equivalent neighbors; δ stays the same on any magnet, Hz don't. Example: an ethyl CH₃ (n = 2)
  → triplet 1 : 2 : 1, J = 7.1 Hz → 14.2 Hz = 0.0355 ppm at 400 MHz; 1200 Hz from TMS → δ 3.00.
- **~ir-bands — BUILD (sort):** bins "Alcohol O–H (broad, 3200–3550 cm⁻¹)", "Acid O–H (very
  broad, 2500–3300)", "C=O (1670–1780)", "C≡N or C≡C (2100–2260)", "C=C (1620–1680)". Cards: a
  broad band at 3350; a broad band at 3400; a very broad band from
  2500 to 3300; a strong sharp band at 1715; a strong band at 1735; a sharp band at 2250; a weak
  band at 1650. Bond strength and wavenumber (Hooke's law) are `physical-2#1~oscillator`.
- **Verdict:** 3 pages (2 calculators, 1 sort); structure puzzles are left to a later page.

## Organic Chemistry II — `he.chemistry.organic-2`

Prerequisite `he.chemistry.organic-1`. Textbooks: OpenStax Organic Chemistry ch. 15–24;
MIT OCW 5.13.

### organic-2#0 — Aromatic chemistry

- **Textbooks:** Organic Chemistry ch. 15 (aromaticity, Hückel's rule, heterocycles), 16
  (electrophilic aromatic substitution, substituent effects).
- **Tests ask:**

  | Question type                                         | Page                  | Mark                          |
  | ----------------------------------------------------- | --------------------- | ----------------------------- |
  | aromatic, antiaromatic or nonaromatic                 | main                  | Solves                        |
  | activating or deactivating; where the next group goes | ~directing            | Solves                        |
  | π energies of benzene; delocalization energy          | `physical-2#3~huckel` | Solves (⏳ P3)                |
  | product of a nitration, bromination, acylation        | —                     | Partly (needs P14 structures) |

- **Main — BUILD `he.chemistry.organic-2#0` (sort):** bins "Aromatic", "Antiaromatic",
  "Nonaromatic". Cards: benzene; the cyclopentadienyl anion; the cycloheptatrienyl cation;
  pyridine; pyrrole; furan (aromatic); cyclobutadiene; the cyclopentadienyl cation
  (antiaromatic); cyclopenta-1,3-diene (an sp³ carbon breaks the ring of p orbitals);
  cyclooctatetraene (tub-shaped, not flat); cyclohexene (nonaromatic). Intro: "Aromatic: a flat
  ring of p orbitals with 4n + 2 π electrons (2, 6, 10). Antiaromatic: the same with 4n (4, 8)."
- **~directing — BUILD (sort):** bins "Activating, ortho/para", "Deactivating, ortho/para",
  "Deactivating, meta". Cards –OH, –NH₂, –OCH₃, –CH₃, –NHCOCH₃; –F, –Cl, –Br; –NO₂, –CN, –CHO,
  –COOH, –SO₃H, –CF₃. Sentence: "Groups that give electrons speed the ring up and send the
  next group ortho and para; halogens slow it but still send it ortho and para."
- **Verdict:** 2 sorts; the two pattern types Solve, products wait on P14.

### organic-2#1 — Carbonyl chemistry

- **Textbooks:** Organic Chemistry ch. 19 (nucleophilic addition: hydrates, Grignard,
  hydride, imines, acetals, Wittig), 22–23 (enols, enolates, aldol).
- **Tests ask:**

  | Question type                                  | Page                 | Mark   |
  | ---------------------------------------------- | -------------------- | ------ |
  | product of a Grignard, hydride, Wittig, acetal | main                 | Solves |
  | how much is hydrate (or enol) at equilibrium   | ~equilibrium-percent | Solves |
  | steps of the aldol reaction in order           | ~aldol               | Solves |

- **Main — BUILD `he.chemistry.organic-2#1` (sort):** bins "Primary alcohol", "Secondary
  alcohol", "Tertiary alcohol", "Alkene", "Acetal", "Imine". Cards: methanal + CH₃MgBr, then
  H₃O⁺; butanal + NaBH₄, then H₃O⁺ (primary); ethanal + CH₃MgBr, then H₃O⁺; propanone +
  NaBH₄, then H₃O⁺ (secondary); propanone + CH₃MgBr, then H₃O⁺ (tertiary); cyclohexanone +
  Ph₃P=CH₂ (alkene); propanone + 2 CH₃OH with H⁺; cyclohexanone + HOCH₂CH₂OH with H⁺ (acetal);
  ethanal + CH₃NH₂ in mild acid (imine). `pickBar: true`.
- **~equilibrium-percent — BUILD:** `none`. Values equilibrium constant K (10⁻¹²–10⁶), percent
  in the added (or enol) form, ΔG° (kJ/mol), T. Relations: % = 100K ÷ (1 + K); ΔG° = −RT ln K.
  Assumptions: K here folds in water's concentration (a hydrate's K); bulky or electron-giving
  groups lower it. Example: a hydrate K of 2.3 × 10³ → 99.96%; K = 1.4 × 10⁻³ → 0.14%,
  ΔG° = +16.3 kJ/mol at 298.15 K.
- **~aldol — BUILD (sequence):** "A base removes an α hydrogen: the enolate forms", "The
  enolate's α carbon attacks a second molecule's carbonyl carbon", "The alkoxide takes a proton
  from water: a β-hydroxy carbonyl (the aldol)", "Heating removes water: an α,β-unsaturated
  carbonyl".
- **Verdict:** 3 pages (1 calculator, 1 sort, 1 sequence).

### organic-2#2 — Carboxylic acid derivatives

- **Textbooks:** Organic Chemistry ch. 20 (acidity, substituent effects), 21 (nucleophilic
  acyl substitution; acid halides, anhydrides, esters, amides).
- **Tests ask:**

  | Question type                                   | Page               | Mark   |
  | ----------------------------------------------- | ------------------ | ------ |
  | rank derivatives by reactivity                  | main               | Solves |
  | product of an acyl substitution                 | ~acyl-substitution | Solves |
  | percent ionized at a pH; compare acid strengths | ~ionized           | Solves |

- **Main — BUILD `he.chemistry.organic-2#2` (sequence):** "Order from most to least reactive
  toward a nucleophile": acid chloride, acid anhydride, thioester, ester, amide, carboxylate.
  Sentence: "A derivative can be made from any one above it, never from one below."
- **~acyl-substitution — BUILD (sort):** bins Ester, Amide, Carboxylic acid, Anhydride.
  Cards: ethanoyl chloride + ethanol with pyridine; ethanoic acid + ethanol with H₂SO₄, heated;
  ethanoic anhydride + methanol (ester); ethanoyl chloride + NH₃ (2 equivalents); ethanoic
  anhydride + CH₃NH₂ (amide); ethanoyl chloride + water; ethyl ethanoate + NaOH(aq), then H₃O⁺;
  ethanamide + H₃O⁺, heated (acid); ethanoyl chloride + sodium ethanoate (anhydride).
- **~ionized — BUILD:** `phScale` (pH marked). Values pKₐ (−2 to 50), pH (0–14), ratio
  [A⁻] ÷ [HA], percent ionized. Relations: log ratio = pH − pKₐ; % = 100 × ratio ÷ (1 + ratio).
  Assumptions: for an amine, use its conjugate acid's pKₐ and read the percent as the neutral
  base. Example: ethanoic acid (4.76) at pH 7.40 → ratio 437, 99.77% ionized. Second use:
  chloroethanoic acid (2.86) is 10^1.90 = 79 times stronger. startWith pKₐ, pH.
- **Verdict:** 3 pages (1 calculator, 1 sort, 1 sequence).

### organic-2#3 — Amines

- **Textbooks:** Organic Chemistry ch. 24 (basicity, pKₐ of ammonium ions, aryl amines,
  heterocycles, extraction).
- **Tests ask:**

  | Question type                              | Page                  | Mark   |
  | ------------------------------------------ | --------------------- | ------ |
  | rank amines by basicity                    | main                  | Solves |
  | primary, secondary, tertiary or quaternary | ~classify             | Solves |
  | which layer an amine is in at a pH         | ~extraction           | Solves |
  | percent protonated at pH 7.4               | `organic-2#2~ionized` | Solves |

- **Main — BUILD `he.chemistry.organic-2#3` (sequence):** "Order from strongest base to
  weakest": dimethylamine, ammonia, pyridine, aniline, pyrrole (conjugate-acid pKₐ about 10.7,
  9.3, 5.3, 4.6, below 0, shown once placed). Methylamine is left out (too close to
  dimethylamine for one right order). Sentence: "A lone pair shared with a ring or a C=O is less
  free to take a proton."
- **~classify — BUILD (sort):** bins Primary, Secondary, Tertiary, "Quaternary ammonium".
  Cards: CH₃CH₂NH₂; (CH₃)₃CNH₂; aniline (primary); (CH₃)₂NH; piperidine (secondary); (CH₃)₃N;
  N-methylpiperidine (tertiary); (CH₃)₄N⁺ Cl⁻ (quaternary). Sentence: "Count the carbons on
  the nitrogen, not on the carbon next to it."
- **~extraction — BUILD:** `none`. Values: conjugate acid's pKₐ (pKₐH), pH of the water layer,
  fraction neutral f, partition coefficient of the neutral amine K_D (organic ÷ water),
  distribution ratio D. Relations: f = 1 ÷ (1 + 10^(pKₐH − pH)); D = K_D f. Example: pKₐH 10.6,
  K_D = 20: at pH 2.0 → f = 2.5 × 10⁻⁹, D = 5.0 × 10⁻⁸ (stays in the acid water); at pH 13.0 →
  f = 0.996, D = 19.9 (moves to the organic layer).
- **Verdict:** 3 pages (1 calculator, 1 sort, 1 sequence).

### organic-2#4 — Multistep synthesis

- **Textbooks:** Organic Chemistry 16.10 (synthesis of substituted benzenes), and the
  "synthesis" sections closing ch. 17–24.
- **Tests ask:**

  | Question type                                 | Page           | Mark                                  |
  | --------------------------------------------- | -------------- | ------------------------------------- |
  | put the steps of a route in a working order   | main           | Solves                                |
  | overall yield of a multistep route            | ~overall-yield | Solves                                |
  | atom economy of a reaction                    | ~atom-economy  | Solves                                |
  | design a route from a target (retrosynthesis) | —              | No (open-ended; a later explore page) |

- **Main — BUILD `he.chemistry.organic-2#4` (sequence):** "Make 3-bromoaniline from benzene":
  "HNO₃ with H₂SO₄ (nitration)", "Br₂ with FeBr₃ (the nitro group sends Br meta)", "Fe with
  HCl, then NaOH (NO₂ to NH₂)". Sentence: "Brominate while the meta-director is on the ring;
  reduce last, or the NH₂ sends Br ortho and para."
- **~overall-yield — BUILD:** `bars` (moles left after each step). Values: step yields y₁, y₂,
  y₃, y₄ (%, 100 for a step not used), overall yield Y, starting moles, product moles.
  Relations: Y = y₁y₂y₃y₄ ÷ 100³; n_product = n_start × Y ÷ 100. Example: 85%, 70%, 90%
  → 53.6%; 10.0 mmol → 5.36 mmol.
- **~atom-economy — BUILD:** `none`. Values: product molar mass, reactant molar masses M₁ and
  M₂, atom economy (%). Relation: AE = 100M_product ÷ (M₁ + M₂). Example: ethanoic acid (60.05)
  - ethanol (46.07) → ethyl ethanoate (88.11) + water: 83.0%; ethene + water → ethanol: 100%.
- **Verdict:** 3 pages (2 calculators, 1 sequence).

## Analytical Chemistry — `he.chemistry.analytical`

Prerequisite `he.chemistry.gen-chem-2`. Textbooks: Harvey, Analytical Chemistry 2.1 (ch. 4
data, 5 calibration, 9 titrations, 10 spectroscopy, 11 electrochemistry, 12 chromatography);
MIT OCW 5.35 (lab notes).

### analytical#0 — Error analysis and statistics

- **Textbooks:** Analytical Chemistry 2.1 ch. 4 (mean, standard deviation, confidence
  intervals, propagation of uncertainty, t-tests, outliers).
- **Refresh:** `s.10.measurement~accuracy`; the statistics pages of `m.12` (normal curve).
- **Tests ask:**

  | Question type                                  | Page         | Mark                      |
  | ---------------------------------------------- | ------------ | ------------------------- |
  | 95% confidence interval of a mean              | main         | Solves (⏳ P19)           |
  | uncertainty of a computed result               | ~propagation | Solves                    |
  | may a suspect value be rejected (Q test)       | ~q-test      | Solves                    |
  | does a mean differ from a known value (t-test) | ~t-test      | Solves (⏳ P19)           |
  | mean and s from a list of replicates           | main         | Partly (E13: a data list) |

- **Main — BUILD `he.chemistry.analytical#0` (⏳ P19):** `normalCurve` with `family: 't', df`.
  Values: measurements n (whole, 2–30), mean x̄, standard deviation s, t for n − 1 degrees of
  freedom at 95% (typed, default 2.776, picked by n after E5), half-width, lower end, upper
  end. Relations: half-width = ts ÷ √n; lower = x̄ − half-width; upper = x̄ + half-width.
  Assumptions: random error only; the interval is where the true mean lies with 95%
  confidence, not where 95% of the readings lie. Example: n = 5, x̄ = 10.12, s = 0.15 →
  ± 0.19 (9.93 to 10.31). startWith n, x̄, s.
- **~propagation — BUILD:** `none`. Values: mass m (g), its uncertainty s_m, volume V (L), its
  uncertainty s_V, molar mass M (exact), concentration c (M), relative uncertainty, absolute
  uncertainty s_c. Relations: c = m ÷ (MV); relative = √((s_m ÷ m)² + (s_V ÷ V)²);
  s_c = c × relative. Assumptions: independent random errors; in a product or quotient the
  relative uncertainties add in quadrature. Example: 0.2500 ± 0.0002 g NaCl (58.44 g/mol) in
  0.2500 ± 0.0001 L → c = 0.01711 M, relative 8.9 × 10⁻⁴, s_c = 1.5 × 10⁻⁵ M.
- **~q-test — BUILD:** `histogram` (the readings as dots, the suspect ringed). Values: suspect
  value, its nearest neighbor, highest, lowest, gap, range, Q, Q critical (typed; 0.710 for
  n = 5 at 95%, by n after E5). Relations: gap = |suspect − nearest|; range = highest − lowest;
  Q = gap ÷ range. Example: 10.09, 10.12, 10.15, 10.18, 10.45 → Q = 0.27 ÷ 0.36 = 0.75 > 0.710:
  reject 10.45.
- **~t-test — BUILD (⏳ P19):** values x̄, known value μ, s, n, t calculated, t critical.
  Relation: t = |x̄ − μ|√n ÷ s. Example: x̄ = 10.12, μ = 10.00, s = 0.15, n = 5 → t = 1.79 <
  2.776: no significant difference at 95%.
- **Verdict:** 4 calculators; four types Solve, two after P19; data lists wait on E13.

### analytical#1 — Titrations

- **Textbooks:** Analytical Chemistry 2.1 ch. 9 (acid–base, complexation with EDTA, back
  titrations, polyprotic curves, indicators).
- **Refresh:** `gen-chem-2#2~equivalence-ph`, `s.10.acids-bases~titration`.
- **Tests ask:**

  | Question type                                 | Page            | Mark           |
  | --------------------------------------------- | --------------- | -------------- |
  | standardize NaOH with KHP                     | main            | Solves         |
  | analyte from a back titration (antacid)       | ~back-titration | Solves         |
  | water hardness by EDTA (mg/L CaCO₃)           | ~edta           | Solves         |
  | equivalence volumes and pH of a diprotic acid | ~polyprotic     | Solves (⏳ P6) |
  | choose an indicator                           | ~indicator      | Solves         |

- **Main — BUILD `he.chemistry.analytical#1`:** `phScale` titration (from
  `g.s10-acids-bases-weak-titration`; acid KHP, Kₐ 3.9 × 10⁻⁶, `name: 'KHP'`). Values: KHP mass
  m (g), molar mass M (204.22 g/mol), moles of KHP n, endpoint volume V (mL), NaOH
  concentration C (M). Relations: n = m ÷ M; C = n ÷ V. Assumptions: KHP reacts 1 : 1 with
  NaOH; KHP is a primary standard (pure, weighed dry). Example: 0.5105 g → 2.500 mmol; 24.95 mL
  → 0.1002 M. startWith m, V.
- **~back-titration — BUILD:** `tape` (interim: the acid added as one tape split into "reacted
  with the sample" and "left over"). Values: HCl concentration, HCl volume, moles of HCl added,
  NaOH concentration, NaOH volume, moles left over, moles reacted, mole ratio (HCl per analyte),
  moles of analyte, analyte mass (mg). Relations: n_added = CV; n_left = C_b V_b; n_reacted =
  n_added − n_left; n_analyte = n_reacted ÷ ratio; mass = n_analyte × 100.09. Example: 50.00 mL
  of 0.1000 M HCl (5.000 mmol); 18.20 mL of 0.1000 M NaOH (1.820 mmol) → 3.180 mmol ÷ 2 =
  1.590 mmol CaCO₃ = 159.1 mg. 10 values.
- **~edta — BUILD:** `beaker` solution (interim). Values: sample volume (mL), EDTA
  concentration (M), EDTA volume (mL), moles of metal ion, hardness (mg/L as CaCO₃).
  Relations: n = C × V (EDTA binds 1 : 1); hardness = n × 100.09 ÷ sample volume. Example:
  50.00 mL sample, 12.40 mL of 0.01000 M EDTA → 0.1240 mmol → 12.41 mg → 248 mg/L.
- **~polyprotic — BUILD (⏳ P6):** `phScale` titration with `polyprotic`. Values pKₐ₁, pKₐ₂,
  acid concentration, acid volume, base concentration, first and second equivalence volumes,
  pH at the first equivalence. Relations: V₁ = C_aV_a ÷ C_b; V₂ = 2V₁; pH₁ = (pKₐ₁ + pKₐ₂) ÷ 2
  (pH = pKₐ₁ at V₁ ÷ 2). Example: pKₐ₁ = 2.00, pKₐ₂ = 6.00, 25.00 mL of 0.100 M with 0.100 M
  NaOH → 25.0 mL and 50.0 mL, pH 4.00 at the first.
- **~indicator — BUILD (sort):** bins "Methyl red (pH 4.4–6.2)", "Bromothymol blue (6.0–7.6)",
  "Phenolphthalein (8.2–10.0)". Cards (equivalence pH shown): HCl with NaOH (7.0); HNO₃ with KOH
  (7.0); ethanoic acid with NaOH (8.7); benzoic acid with NaOH (8.6); NH₃ with HCl (5.3);
  methylamine with HCl (5.9). Sentence: "Pick the indicator whose color change brackets the
  equivalence-point pH."
- **Verdict:** 5 pages (4 calculators, 1 sort); the five types Solve, one after P6.

### analytical#2 — Spectrophotometry (Beer–Lambert)

- **Textbooks:** Analytical Chemistry 2.1 ch. 5 (calibration curves, standard additions), 10
  (Beer's law, mixtures).
- **Tests ask:**

  | Question type                                  | Page               | Mark         |
  | ---------------------------------------------- | ------------------ | ------------ |
  | absorbance, %T, ε or c from Beer's law         | main               | Solves       |
  | unknown from a calibration line, with dilution | ~calibration       | Solves       |
  | two absorbing species at two wavelengths       | ~mixture           | Solves       |
  | standard addition                              | ~standard-addition | Solves       |
  | least-squares line from standards              | ~calibration       | Partly (E13) |

- **Main — BUILD `he.chemistry.analytical#2`:** `functionGraph` linear (interim: A against c,
  slope εb, the point marked; P16 draws the cuvette and the light). Values: molar absorptivity
  ε (L/(mol·cm), 1–10⁶), path length b (cm, default 1.00), concentration c (M), absorbance A
  (no unit), transmittance %T. Relations: A = εbc; A = −log(%T ÷ 100). Assumptions: one
  wavelength; dilute solutions (A up to about 1 stays on the line); A has no unit. Example:
  ε = 1.20 × 10⁴, b = 1.00 cm, c = 4.00 × 10⁻⁵ M → A = 0.480, %T = 33.1%. startWith ε, b, c.
- **~calibration — BUILD:** `functionGraph` linear with `at` (the unknown read across and
  down). Values: slope m (per mg/L), intercept b, unknown absorbance A, measured concentration
  c, dilution factor D, original concentration c₀. Relations: c = (A − b) ÷ m; c₀ = Dc.
  Example: A = 0.0950c + 0.0040; A = 0.524 → c = 5.47 mg/L; diluted 10 times → 54.7 mg/L.
- **~mixture — BUILD:** `matrixGrid` (the ε matrix times the concentration column). Values
  ε_X and ε_Y at λ₁, ε_X and ε_Y at λ₂, A₁, A₂, c_X, c_Y (b = 1.00 cm). Relations:
  A₁ = ε_X1c_X + ε_Y1c_Y; A₂ = ε_X2c_X + ε_Y2c_Y (Cramer's rule, three lines). Example: 5000,
  1000; 500, 4000; A₁ = 0.280, A₂ = 0.340 → c_X = 4.0 × 10⁻⁵ M, c_Y = 8.0 × 10⁻⁵ M.
- **~standard-addition — BUILD:** `functionGraph` linear (signal against added concentration,
  the x-intercept marked with `zeros`). Values: sample volume V_x, standard volume V_s,
  standard concentration c_s, signal of the sample alone A₁, signal with the standard A₂,
  unknown concentration c_x. Relation: c_x = A₁c_sV_s ÷ ((A₂ − A₁)V_x). Assumptions: both
  flasks are filled to the same mark; the signal is proportional to concentration. Example:
  10.00 mL sample, 1.00 mL of 100.0 mg/L, A 0.200 → 0.300 → c_x = 20.0 mg/L.
- **Verdict:** 4 calculators; four types Solve; fitting from a data list waits on E13.

### analytical#3 — Chromatography

- **Textbooks:** Analytical Chemistry 2.1 ch. 12 (retention, resolution, plates, van Deemter,
  GC, HPLC, ion-exchange and size-exclusion).
- **Tests ask:**

  | Question type                                     | Page         | Mark           |
  | ------------------------------------------------- | ------------ | -------------- |
  | resolution, retention factor, selectivity, plates | main         | Solves (⏳ P5) |
  | best flow rate from the van Deemter equation      | ~van-deemter | Solves         |
  | plates needed for a resolution                    | ~purnell     | Solves         |
  | which technique for a sample                      | ~technique   | Solves         |

- **Main — BUILD `he.chemistry.analytical#3` (⏳ P5):** `instrumentTrace` `chromatogram`.
  Values: dead time t_M (min), retention times t₁, t₂, base widths w₁, w₂, resolution R,
  retention factors k₁, k₂, selectivity α, plates N (peak 2). Relations: R = 2(t₂ − t₁) ÷
  (w₁ + w₂); kᵢ = (tᵢ − t_M) ÷ t_M; α = k₂ ÷ k₁; N = 16(t₂ ÷ w₂)². Assumptions: widths at the
  base; R of 1.5 or more separates to the baseline. Example: t_M = 1.00 min, 5.00 and 5.60 min,
  widths 0.30 and 0.32 min → R = 1.94, k = 4.00 and 4.60, α = 1.15, N = 4900.
- **~van-deemter — BUILD:** `functionGraph` rational by top (H106: top C, A, B over x;
  `marks: ['extrema']`). Values A (cm), B (cm²/s), C (s), flow speed u (cm/s), plate height H
  (cm), best speed u_opt, least height H_min. Relations: H = A + B ÷ u + Cu; u_opt = √(B ÷ C);
  H_min = A + 2√(BC). Example: A = 0.050 cm, B = 0.40 cm²/s, C = 0.010 s → u_opt = 6.32 cm/s,
  H_min = 0.176 cm; at 10 cm/s, H = 0.190 cm.
- **~purnell — BUILD:** `table` sweeping N (1000, 2000, 4000, 8000) for R (four times the
  plates, twice the resolution). Values N, α, k₂, R. Relation: R = (√N ÷ 4)((α − 1) ÷ α)(k₂ ÷
  (1 + k₂)). Example: N = 4900, α = 1.15, k₂ = 4.6 → R = 1.88; R = 1.5 needs N = 3136.
- **~technique — BUILD (sort):** bins "Gas chromatography", "HPLC (reversed phase)",
  "Ion-exchange", "Size-exclusion". Cards: hydrocarbons in petrol; ethanol in blood (GC); a
  heat-sensitive drug and its impurities; caffeine in a soft drink (HPLC); nitrate and sulfate
  in tap water; sodium and potassium ions (ion-exchange); proteins by size; a polymer's spread
  of chain lengths (size-exclusion).
- **Verdict:** 4 pages (3 calculators, 1 sort); the main waits on P5.

### analytical#4 — Electroanalytical methods

- **Textbooks:** Analytical Chemistry 2.1 ch. 11 (potentiometry, ion-selective and glass
  electrodes, coulometry, voltammetry).
- **Tests ask:**

  | Question type                                   | Page                        | Mark                           |
  | ----------------------------------------------- | --------------------------- | ------------------------------ |
  | concentration from an ion-selective electrode   | main                        | Solves                         |
  | calibrate a pH meter with two buffers           | ~ph-meter                   | Solves                         |
  | moles from a constant-current (coulometric) run | `gen-chem-2#4~electrolysis` | Solves (⏳ P9)                 |
  | current in voltammetry against concentration    | —                           | No (see "Not in the taxonomy") |

- **Main — BUILD `he.chemistry.analytical#4`:** `functionGraph` linear (E against log c, slope
  0.05916 ÷ z, the standard and the sample marked). Values: ion charge z (allowed ±1, ±2),
  slope (V per decade, derived), standard concentration c_s, its reading E_s (V), sample
  reading E_x, sample concentration c_x. Relations: slope = 0.05916 ÷ z; log(c_x ÷ c_s) =
  (E_x − E_s) ÷ slope. Assumptions: 25 °C; same ionic strength in standard and sample.
  Example: fluoride (z = −1), 1.00 × 10⁻³ M reads −0.120 V, the sample −0.085 V → log ratio
  = −0.592 → c_x = 2.56 × 10⁻⁴ M.
- **~ph-meter — BUILD:** `functionGraph` linear (E against pH through two buffers). Values pH₁,
  E₁, pH₂, E₂, slope (V/pH), percent of the ideal 0.05916, sample reading E_x, sample pH.
  Relations: slope = (E₂ − E₁) ÷ (pH₂ − pH₁); % = 100|slope| ÷ 0.05916; pH_x = pH₂ +
  (E_x − E₂) ÷ slope. Example: pH 4.00 at +0.1720 V, pH 7.00 at −0.0050 V → slope −0.0590 V/pH
  (99.7%); a sample at +0.0500 V → pH 6.07.
- **Verdict:** 2 calculators; coulometry shares the electrolysis page (same relations).

## Physical Chemistry I: Thermodynamics & Kinetics — `he.chemistry.physical-1`

Prerequisites `he.chemistry.gen-chem-2`, `he.math.calc-3`. Textbooks: LibreTexts Physical &
Theoretical Chemistry bookshelf (thermodynamics, phase equilibria, kinetics); MIT OCW 5.60.
Calculus is stated once (Decisions) and the steps use the integrated forms.

### physical-1#0 — Laws of thermodynamics

- **Textbooks:** 5.60 lectures on the first law (reversible isothermal and adiabatic work),
  heat capacities, Kirchhoff's law, entropy changes; LibreTexts thermodynamics chapters.
- **Refresh:** `s.11.thermodynamics` (first law, heat engines; the Carnot engine is there, not
  rebuilt), `gen-chem-2#3`.
- **Tests ask:**

  | Question type                                        | Page             | Mark   |
  | ---------------------------------------------------- | ---------------- | ------ |
  | w, q, ΔU, ΔS of a reversible isothermal expansion    | main             | Solves |
  | final T and work of a reversible adiabatic expansion | ~adiabatic       | Solves |
  | ΔH and ΔS of heating at constant pressure            | ~heating-entropy | Solves |
  | ΔH at another temperature (Kirchhoff)                | ~kirchhoff       | Solves |
  | state or path function                               | ~state-functions | Solves |

- **Main — BUILD `he.chemistry.physical-1#0`:** `gasPiston` ideal (interim; P11 draws the P–V
  path with the work as the area under it). Values: amount n (mol), T (K), V₁ (L), V₂ (L), work
  on the gas w (J), heat q (J), entropy change ΔS (J/K). Relations: w = −nRT ln(V₂ ÷ V₁);
  q = −w; ΔS = q ÷ T. Assumptions: ideal gas, reversible, constant T, so ΔU = 0 and q = −w;
  w = −∫ P dV with P = nRT ÷ V gives the ln. Example: 1.00 mol at 298.15 K, 10.0 L → 20.0 L
  → w = −1718 J, q = +1718 J, ΔS = +5.76 J/K. startWith n, T, V₁, V₂.
- **~adiabatic — BUILD:** `gasPiston` ideal (interim, P11). Values n, molar heat capacity C_V
  (allowed 12.47 = 3R/2 for a monatomic gas, 20.79 = 5R/2 for a diatomic one), T₁, T₂, V₁, V₂,
  work w. Relations: T₂ = T₁(V₁ ÷ V₂)^(R/C_V); w = nC_V(T₂ − T₁). Assumptions: q = 0, so ΔU = w;
  the gas cools as it expands. Example: 1.00 mol monatomic at 300 K, 10.0 → 20.0 L →
  T₂ = 189.0 K, w = −1384 J.
- **~heating-entropy — BUILD:** `none`. Values n, C_p (J/(mol·K)), T₁, T₂, ΔH (J), ΔS (J/K).
  Relations: ΔH = nC_p(T₂ − T₁); ΔS = nC_p ln(T₂ ÷ T₁) (from dS = C_p dT ÷ T). Assumptions: C_p
  constant over the range; no phase change between T₁ and T₂. Example: 1.00 mol liquid water
  (75.3 J/(mol·K)) from 25 °C to 75 °C → ΔH = 3765 J, ΔS = 11.7 J/K.
- **~kirchhoff — BUILD:** `none`. Values ΔH at T₁ (kJ/mol), heat capacity change ΔC_p
  (J/(mol·K)), T₁, T₂, ΔH at T₂. Relation: ΔH₂ = ΔH₁ + ΔC_p(T₂ − T₁) ÷ 1000. Assumptions:
  ΔC_p = ΣC_p(products) − ΣC_p(reactants), constant over the range. Example: ΔH = −92.2 kJ/mol
  at 298.15 K, ΔC_p = −45.0 J/(mol·K) → −101.3 kJ/mol at 500 K.
- **~state-functions — BUILD (sort):** bins "State function: depends only on where it starts
  and ends", "Path function: depends on the way". Cards: internal energy U, enthalpy H,
  entropy S, Gibbs energy G, pressure, volume (state); heat q, work w, the heat taken in on a
  reversible expansion, the work done pushing against 1 atm (path).
- **Verdict:** 5 pages (4 calculators, 1 sort); the five common types Solve.

### physical-1#1 — Phase equilibria

- **Textbooks:** 5.60 (Clapeyron and Clausius–Clapeyron, the phase rule, ideal solutions and
  Raoult's law); LibreTexts phase-equilibria chapters.
- **Refresh:** `s.10.phase-colligative~vapor-pressure`, `s.10.phase-colligative`.
- **Tests ask:**

  | Question type                                       | Page        | Mark   |
  | --------------------------------------------------- | ----------- | ------ |
  | vapor pressure at another T; ΔH_vap from two points | main        | Solves |
  | slope of the melting line; pressure to melt ice     | ~clapeyron  | Solves |
  | vapor pressure and vapor composition of a mixture   | ~raoult     | Solves |
  | degrees of freedom at a point of a phase diagram    | ~phase-rule | Solves |

- **Main — BUILD `he.chemistry.physical-1#1`:** `table` (interim) sweeping T (300, 325, 350,
  375 K) for the vapor pressure; P8 draws the curve through both points. Values ΔH_vap
  (kJ/mol), T₁, P₁ (atm), T₂, P₂. Relation: ln(P₂ ÷ P₁) = −(ΔH_vap ÷ R)(1/T₂ − 1/T₁).
  Assumptions: the vapor is ideal; the liquid's volume is tiny next to the gas's; ΔH_vap
  constant over the range. Example: water, 40.7 kJ/mol, 1.000 atm at 373.15 K → 0.131 atm at
  323.15 K (measured 0.122: ΔH_vap grows as T falls). startWith ΔH_vap, T₁, P₁, T₂.
- **~clapeyron — BUILD:** `chemDiagram` mode `phase` (H108, water's melting line). Values
  ΔH_fus (J/mol), T (K), volume change ΔV (cm³/mol, signed), slope dP/dT (atm/K). Relation:
  dP/dT = ΔH ÷ (TΔV) (steps convert cm³ to m³ and Pa to atm). Example: ice → water, 6010 J/mol,
  273.15 K, ΔV = −1.63 cm³/mol → −1.35 × 10⁷ Pa/K = −133 atm/K: pressure lowers ice's melting
  point.
- **~raoult — BUILD:** `gasPiston` mixture (interim, H108; P8 `binary` later). Values mole
  fraction of A in the liquid x_A, vapor pressures of the pure liquids P*\_A and P*_B (torr),
  total pressure P, mole fraction of A in the vapor y_A. Relations: P = x_AP*\_A + (1 − x_A)P*_B;
  y_A = x_AP*_A ÷ P. Example: benzene (95.1 torr) with methylbenzene (28.4 torr) at 25 °C,
  x_A = 0.600 → P = 68.4 torr, y_A = 0.834 (the vapor is richer in the more volatile liquid).
- **~phase-rule — BUILD:** `chemDiagram` mode `phase` (water, the point named). Values
  components C (1–5), phases P (1–5), degrees of freedom F. Relation: F = C − P + 2 (page limit:
  F ≥ 0). Example: water at its triple point: C = 1, P = 3 → F = 0; boiling water → F = 1.
- **Verdict:** 4 calculators; the four common types Solve.

### physical-1#2 — Chemical equilibrium

- **Textbooks:** 5.60 (K and ΔG°, van 't Hoff, degree of dissociation, activities); LibreTexts
  (Debye–Hückel).
- **Refresh:** `gen-chem-2#3` (ΔG° = −RT ln K), `gen-chem-2#1`.
- **Tests ask:**

  | Question type                           | Page          | Mark   |
  | --------------------------------------- | ------------- | ------ |
  | K at another T; ΔH° from K at two T     | main          | Solves |
  | degree of dissociation from Kp and P    | ~dissociation | Solves |
  | ionic strength and activity coefficient | ~debye-huckel | Solves |

- **Main — BUILD `he.chemistry.physical-1#2`:** `functionGraph` linear (ln K against 1/T,
  slope −ΔH°/R, both points marked). Values ΔH° (kJ/mol), K₁, T₁, T₂, K₂. Relation:
  ln(K₂ ÷ K₁) = −(ΔH° ÷ R)(1/T₂ − 1/T₁). Assumptions: ΔH° constant over the range; an
  endothermic reaction's K grows with T. Example: N₂O₄ ⇌ 2NO₂, ΔH° = +57.2 kJ/mol,
  K = 0.148 at 298.15 K → K = 4.07 at 348.15 K. startWith ΔH°, K₁, T₁, T₂.
- **~dissociation — BUILD:** `equilibriumChart` (N₂O₄ reactant, NO₂ product coef 2, levels in
  bar). Values Kp, total pressure P (bar), degree of dissociation α, partial pressures
  p(N₂O₄) and p(NO₂). Relations: Kp = 4α²P ÷ (1 − α²); p(N₂O₄) = P(1 − α) ÷ (1 + α);
  p(NO₂) = 2αP ÷ (1 + α). Example: Kp = 0.148, P = 1.00 bar → α = 0.189, 0.682 and 0.318 bar
  (check 0.318² ÷ 0.682 = 0.148). Raising P lowers α (Le Châtelier).
- **~debye-huckel — BUILD:** `none`. Values salt concentration c (M), charges z₊ and z₋ (sizes),
  ions per formula ν₊ and ν₋, ionic strength I, mean activity coefficient γ±. Relations:
  I = ½(ν₊cz₊² + ν₋cz₋²); log γ± = −0.509z₊z₋√I (25 °C, water). Assumptions: the limiting law,
  good below about I = 0.01 M; above it the real drop is smaller. Example: 0.010 M CaCl₂ →
  I = 0.030 M, log γ± = −0.176, γ± = 0.666.
- **Verdict:** 3 calculators; the three common types Solve.

### physical-1#3 — Rate laws and mechanisms

- **Textbooks:** 5.60 (consecutive reactions, steady state, Lindemann, transition-state
  theory); LibreTexts kinetics chapters.
- **Refresh:** `gen-chem-2#0` and its `~arrhenius` (Eₐ and A; not rebuilt here).
- **Tests ask:**

  | Question type                                         | Page       | Mark                                               |
  | ----------------------------------------------------- | ---------- | -------------------------------------------------- |
  | intermediate's concentration; when it peaks (A→B→C)   | main       | Solves                                             |
  | rate constant from ΔG‡ (Eyring); ΔH‡ and ΔS‡          | ~eyring    | Solves                                             |
  | unimolecular rate against pressure (steady state)     | ~lindemann | Solves                                             |
  | rate law from a mechanism with a fast pre-equilibrium | —          | No (a symbolic derivation; see "Engine needs" E10) |

- **Main — BUILD `he.chemistry.physical-1#3`:** `table` (interim) sweeping t (0, 5, 10, 20, 40 s)
  for [A], [B], [C]; P7 `consecutive` draws the three curves. Values k₁, k₂ (s⁻¹), [A]₀, t,
  [A], [B], [C], time of the most B t_max. Relations: [A] = [A]₀e^(−k₁t); [B] = [A]₀k₁(e^(−k₁t)
  − e^(−k₂t)) ÷ (k₂ − k₁); [C] = [A]₀ − [A] − [B]; t_max = ln(k₁ ÷ k₂) ÷ (k₁ − k₂) (page limit:
  k₁ ≠ k₂). Example: k₁ = 0.10 s⁻¹, k₂ = 0.050 s⁻¹, [A]₀ = 1.00 M, t = 10 s → 0.368, 0.477,
  0.155 M; t_max = 13.9 s. startWith k₁, k₂, [A]₀, t.
- **~eyring — BUILD:** `energyProfile` (the barrier drawn as ΔG‡). Values ΔH‡ (kJ/mol), ΔS‡
  (J/(mol·K)), T, ΔG‡, rate constant k (s⁻¹). Relations: ΔG‡ = ΔH‡ − TΔS‡ ÷ 1000;
  k = (k_BT ÷ h)e^(−ΔG‡/RT). Example: ΔG‡ = 80.0 kJ/mol at 298.15 K → k_BT/h = 6.21 × 10¹² s⁻¹,
  k = 0.0599 s⁻¹.
- **~lindemann — BUILD:** `functionGraph` rational by coefficients (H94: (px + q) ÷ (rx + s)
  with p = k₁k₂, q = 0, r = k₋₁, s = k₂; the point at [M]). Values k₁ (M⁻¹s⁻¹), k₋₁ (M⁻¹s⁻¹),
  k₂ (s⁻¹), bath gas [M] (M), k_uni (s⁻¹), high-pressure limit k_∞. Relations: k_uni =
  k₁k₂[M] ÷ (k₋₁[M] + k₂); k_∞ = k₁k₂ ÷ k₋₁. Assumptions: the energized A* is at steady state;
  first order at high pressure, second order at low. Example: 1.0 × 10⁶, 1.0 × 10⁹, 1.0 × 10⁶,
  [M] = 1.0 × 10⁻³ M → k_uni = 500 s⁻¹, half of k_∞ = 1000 s⁻¹.
- **Verdict:** 3 calculators; three of four types Solve; mechanism derivations are not a
  calculator.

## Physical Chemistry II: Quantum & Spectroscopy — `he.chemistry.physical-2`

Prerequisites `he.chemistry.physical-1`, `he.math.diff-eq`. Textbooks: LibreTexts Physical &
Theoretical Chemistry (quantum chapters), MIT OCW 5.61.

### physical-2#0 — Schrödinger equation

- **Textbooks:** 5.61 (operators, eigenfunctions, the free particle).
- **Refresh:** `gen-chem-1#0~de-broglie`, `~uncertainty`.
- **Tests ask:**

  | Question type                                        | Page           | Mark                          |
  | ---------------------------------------------------- | -------------- | ----------------------------- |
  | energy and momentum of a free particle from λ or k   | main           | Solves                        |
  | is f an eigenfunction of an operator; its eigenvalue | ~eigenfunction | Solves (which, not the value) |
  | normalize a wavefunction; ⟨x⟩                        | —              | No (symbolic integrals, E10)  |

- **Main — BUILD `he.chemistry.physical-2#0`:** `functionGraph` cos (the real part of e^(ikx),
  `marks: ['period']`, period λ). Values: mass m (allowed electron, proton, neutron; or typed),
  wavelength λ (nm), wavenumber k (m⁻¹), momentum p, energy E (J), energy E_eV. Relations:
  k = 2π ÷ λ; p = h ÷ λ; E = p² ÷ (2m); E_eV = E ÷ e. Assumptions: V = 0, so ψ = e^(ikx) solves
  −(ħ² ÷ 2m)ψ″ = Eψ with E = ħ²k² ÷ 2m. Example: electron, λ = 0.500 nm → k = 1.26 × 10¹⁰ m⁻¹,
  p = 1.33 × 10⁻²⁴ kg·m/s, E = 9.64 × 10⁻¹⁹ J = 6.02 eV.
- **~eigenfunction — BUILD (sort):** bins "Eigenfunction of d/dx (so also of d²/dx²)",
  "Eigenfunction of d²/dx² only", "Eigenfunction of neither". Cards: e^(3x), e^(−2ix); sin(4x),
  cos(2x), sin x + cos x; x², ln x, x e^x. Sentence: "f is an eigenfunction when the operator
  gives back f times a number, the eigenvalue."
- **Verdict:** 2 pages (1 calculator, 1 sort).

### physical-2#1 — Particle in a box and harmonic oscillator

- **Textbooks:** 5.61 (the box, conjugated dyes, the harmonic oscillator, zero-point energy).
- **Tests ask:**

  | Question type                                        | Page         | Mark           |
  | ---------------------------------------------------- | ------------ | -------------- |
  | energy levels; wavelength of a transition; a dye     | main         | Solves (⏳ P1) |
  | probability of finding it in part of the box         | ~probability | Solves         |
  | vibrational frequency, wavenumber, zero-point energy | ~oscillator  | Solves (⏳ P1) |

- **Main — BUILD `he.chemistry.physical-2#1` (⏳ P1):** `orbitalDiagram` mode `well` (`model:
'box'`). Values: mass m (default electron), box length L (nm), lower level n₁, upper level n₂,
  ground energy E₁ (J), gap ΔE (J), wavelength λ (nm). Relations: E₁ = h² ÷ (8mL²); ΔE =
  (n₂² − n₁²)E₁; λ = hc ÷ ΔE. Assumptions: V = 0 inside, infinite walls; n starts at 1, so
  E₁ > 0 (zero-point energy); for a dye with N π electrons, n₁ = N ÷ 2. Example: electron,
  L = 1.00 nm → E₁ = 6.02 × 10⁻²⁰ J (0.376 eV); 1 → 2: ΔE = 1.81 × 10⁻¹⁹ J, λ = 1099 nm.
- **~probability — BUILD:** `functionGraph` cos with `shade: { from, to }` (ψ² = (1/L)(1 −
  cos(2nπx/L)), drawn exactly from derived a, b, k). Values n, L, x₁, x₂, probability P.
  Relation: P = (x₂ − x₁) ÷ L − [sin(2nπx₂/L) − sin(2nπx₁/L)] ÷ (2nπ). Example: n = 1, 0 to
  L/4 → 0.250 − 0.159 = 0.0908 (a classical particle: 0.25).
- **~oscillator — BUILD (⏳ P1, `model: 'oscillator'`):** values atom masses m₁, m₂ (u),
  reduced mass μ (kg), force constant k (N/m), frequency ν (Hz), wavenumber ν̃ (cm⁻¹),
  zero-point energy E₀ (J), per mole (kJ/mol). Relations: μ = m₁m₂ ÷ (m₁ + m₂) × u;
  ν = √(k ÷ μ) ÷ (2π); ν̃ = ν ÷ c (c in cm/s); E₀ = ½hν. Example: H–³⁵Cl (1.008, 34.97 u),
  k = 480 N/m → μ = 1.627 × 10⁻²⁷ kg, ν = 8.64 × 10¹³ Hz, ν̃ = 2884 cm⁻¹, E₀ = 2.86 × 10⁻²⁰ J
  (17.2 kJ/mol). Stronger bonds and lighter atoms absorb at higher ν̃ (the IR link).
- **Verdict:** 3 calculators; two wait on P1.

### physical-2#2 — Hydrogen atom

- **Textbooks:** 5.61 (hydrogen-like energies, quantum numbers, nodes, radial distributions).
- **Refresh:** `gen-chem-1#0` (Rydberg lines).
- **Tests ask:**

  | Question type                                    | Page             | Mark           |
  | ------------------------------------------------ | ---------------- | -------------- |
  | energy, nodes and degeneracy of an orbital (He⁺) | main             | Solves (⏳ P2) |
  | mean and most probable radius                    | ~radius          | Solves (⏳ P2) |
  | which quantum-number sets are allowed            | ~quantum-numbers | Solves         |

- **Main — BUILD `he.chemistry.physical-2#2` (⏳ P2):** `orbitalDiagram` ladder with `Z`. Values:
  nuclear charge Z (1–10), n (1–10), l (0 to n − 1), energy E (eV), radial nodes, angular
  nodes, degeneracy g. Relations: E = −13.6Z² ÷ n²; radial = n − l − 1; angular = l; g = n².
  Example: He⁺, 2p → E = −13.6 eV, 0 radial and 1 angular node, 4 orbitals at that energy.
- **~radius — BUILD (⏳ P2, `mode: 'radial'`):** values Z, n, l, mean radius ⟨r⟩ (in a₀ and nm),
  most probable radius r_mp (for l = n − 1). Relations: ⟨r⟩ = (a₀ ÷ 2Z)(3n² − l(l + 1));
  r_mp = n²a₀ ÷ Z. Example: hydrogen 2p → ⟨r⟩ = 5a₀ = 0.265 nm, r_mp = 4a₀ = 0.212 nm; 1s r_mp
  = a₀ = 0.0529 nm.
- **~quantum-numbers — BUILD (sort):** bins "Allowed", "Not allowed: l is n or more", "Not
  allowed: m_l is beyond ±l", "Not allowed: m_s is not ±½". Cards (n, l, m_l, m_s): (2, 1, −1,
  +½), (3, 2, 2, −½), (1, 0, 0, +½), (4, 3, −3, −½); (2, 2, 0, +½), (1, 1, 0, −½); (3, 1, 2, +½),
  (2, 0, 1, −½); (3, 2, 1, 1), (2, 1, 0, 0). Each wrong card breaks one rule only.
- **Verdict:** 3 pages (2 calculators, 1 sort).

### physical-2#3 — Molecular orbital theory

- **Textbooks:** 5.61 (LCAO, the secular determinant, Hückel theory).
- **Refresh:** `gen-chem-1#4~bond-order` (diatomic MO diagrams and bond order; not rebuilt).
- **Tests ask:**

  | Question type                                       | Page      | Mark           |
  | --------------------------------------------------- | --------- | -------------- |
  | bonding and antibonding energies of two AOs (2 × 2) | main      | Solves         |
  | Hückel energies; delocalization energy of a ring    | ~huckel   | Solves (⏳ P3) |
  | σ, σ*, π or π* from how two orbitals overlap        | ~mo-types | Solves         |

- **Main — BUILD `he.chemistry.physical-2#3`:** `matrixGrid` (interim: the secular determinant
  |α_A − E, β; β, α_B − E| = 0; P3 `heteronuclear` draws the two AO levels and the MOs). Values
  α_A, α_B (eV), resonance integral β (eV, negative), bonding energy E₊, antibonding energy E₋,
  splitting. Relations: E± = (α_A + α_B) ÷ 2 ∓ √(((α_A − α_B) ÷ 2)² + β²); splitting = E₋ − E₊.
  Assumptions: overlap S neglected; equal α gives α ± β. Example: −10.0, −14.0, β = −3.0 →
  −12.0 ∓ 3.61 → E₊ = −15.61 eV, E₋ = −8.39 eV, splitting 7.21 eV.
- **~huckel — BUILD (⏳ P3, E7):** `orbitalDiagram` `frost`. Values ring carbons N (3–8), π
  electrons (N minus the charge), π energy (in β, beyond Nα), the same electrons in isolated
  double bonds (in β), delocalization energy, unpaired electrons. Relations: levels α +
  2β cos(2πk ÷ N); fill from the lowest. Example: benzene: 2(2β) + 4(β) = 8β against 6β →
  delocalization 2β; cyclobutadiene: 4β against 4β → 0, two unpaired (antiaromatic).
- **~mo-types — BUILD (sort):** bins "σ bonding", "σ* antibonding", "π bonding", "π*
  antibonding". Cards: two 1s in phase; 2s with 2s in phase; two 2p pointing at each other, in
  phase (σ); two 1s out of phase; two 2p end on, out of phase (σ*); two 2p side by side, in
  phase (π); side by side, out of phase (π*).
- **Verdict:** 3 pages (2 calculators, 1 sort).

### physical-2#4 — Spectroscopy

- **Textbooks:** 5.61 and LibreTexts (rigid rotor, selection rules, Boltzmann populations,
  vibrational spectra in #1).
- **Tests ask:**

  | Question type                                   | Page             | Mark           |
  | ----------------------------------------------- | ---------------- | -------------- |
  | B, I, bond length from line spacing (microwave) | main             | Solves (⏳ P5) |
  | population ratio of two levels                  | ~boltzmann       | Solves         |
  | allowed or forbidden transition                 | ~selection-rules | Solves         |
  | absorbance and concentration (UV–vis)           | `analytical#2`   | Solves         |

- **Main — BUILD `he.chemistry.physical-2#4` (⏳ P5, `rotational`):** values m₁, m₂ (u), μ (kg),
  bond length r (pm), moment of inertia I (kg·m²), rotational constant B (cm⁻¹), lower level J,
  line ν̃ (cm⁻¹). Relations: μ as above; I = μr²; B = h ÷ (8π²cI) (c in cm/s); ν̃ = 2B(J + 1).
  Assumptions: a rigid rotor; absorption ΔJ = +1, so the lines are 2B apart; only polar
  molecules show them. Example: H–³⁵Cl, r = 127.5 pm → I = 2.645 × 10⁻⁴⁷ kg·m², B = 10.58 cm⁻¹,
  J = 0 → 1 at 21.2 cm⁻¹. startWith m₁, m₂, r (or the spacing for r).
- **~boltzmann — BUILD:** `bars` (the two levels' shares). Values degeneracies g₁, g₂, gap ΔE
  (cm⁻¹), T, ratio N₂ ÷ N₁. Relation: N₂ ÷ N₁ = (g₂ ÷ g₁)e^(−1.4388ΔE ÷ T) (hc ÷ k_B =
  1.4388 cm·K). Example: 1000 cm⁻¹ at 298 K, equal g → 0.0080; HCl's J = 1 against J = 0
  (g = 3 and 1, 21.2 cm⁻¹) → 2.71.
- **~selection-rules — BUILD (sort):** bins Allowed, Forbidden. Cards: HCl rotation J = 0 → 1;
  HCl vibration v = 0 → 1; hydrogen 2p → 1s (allowed); HCl rotation J = 0 → 2; N₂ vibration in
  the IR (no dipole change); H₂ in the microwave (no permanent dipole); hydrogen 2s → 1s
  (Δl = 0); v = 0 → 2 of a perfect harmonic oscillator (forbidden).
- **Verdict:** 3 pages (2 calculators, 1 sort).

## Biochemistry — `he.chemistry.biochemistry`

Prerequisite `he.chemistry.organic-2`. Textbooks: Ahern, Rajagopal & Tan, Biochemistry Free
For All (protein structure, catalysis, energy, metabolism); MIT OCW 5.07SC.

### biochemistry#0 — Protein structure

- **Textbooks:** Biochemistry Free For All (amino acids and their charges, levels of
  structure); 5.07SC (pKₐ values and pI).
- **Refresh:** `s.9.biomolecules` (macromolecules), `organic-2#2~ionized`.
- **Tests ask:**

  | Question type                                      | Page        | Mark                                               |
  | -------------------------------------------------- | ----------- | -------------------------------------------------- |
  | isoelectric point of an amino acid                 | main        | Solves                                             |
  | net charge of an amino acid at a pH                | main        | Solves                                             |
  | which level of structure a feature belongs to      | ~levels     | Solves                                             |
  | length of a helix or strand of n residues          | ~dimensions | Solves                                             |
  | net charge of a peptide (several ionizable groups) | —           | Partly (main takes one side chain; E11 for a list) |

- **Main — BUILD `he.chemistry.biochemistry#0`:** `phScale` (interim, the pH and the pI marked;
  P6 draws the amino acid's titration curve). Values: α-carboxyl pKₐ₁, α-amino pKₐ₂, side-chain
  pKₐR, side-chain kind (allowed none, acidic, basic), pH, net charge, isoelectric point pI.
  Relations: charge = −1 ÷ (1 + 10^(pKₐ₁ − pH)) + 1 ÷ (1 + 10^(pH − pKₐ₂)) + the side chain's
  term (acidic −1 ÷ (1 + 10^(pKₐR − pH)), basic +1 ÷ (1 + 10^(pH − pKₐR))); pI = the mean of the
  two pKₐ values on either side of the neutral form. Assumptions: free amino acid in water;
  each group follows Henderson–Hasselbalch. Example: glycine (2.34, 9.60) → pI 5.97; at pH 7.40
  the net charge is −0.006 (a zwitterion); lysine (2.18, 8.95, 10.53) → pI 9.74.
- **~levels — BUILD (sort):** bins Primary, Secondary, Tertiary, Quaternary. Cards: the order
  of amino acids from the N-terminus; a peptide bond joining glycine to alanine (primary); an
  α-helix held by C=O···H–N bonds four residues apart; a β-pleated sheet (secondary); a
  disulfide bond between two cysteines far apart in the chain; a core of leucine and valine
  side chains (tertiary); hemoglobin's four chains fitting together; two identical enzyme
  subunits held by salt bridges (quaternary). `macromolecules` explore (P21) later.
- **~dimensions — BUILD:** `macromolecules` polypeptide (H100, interim). Values residues n
  (whole, 2–1000), rise per residue (allowed 0.15 nm α-helix, 0.34 nm β-strand), length (nm),
  helix turns. Relations: length = n × rise; turns = n ÷ 3.6 (α-helix). Example: 18 residues →
  2.70 nm and 5.0 turns as an α-helix; 6.12 nm as a β-strand.
- **Verdict:** 3 pages (2 calculators, 1 sort).

### biochemistry#1 — Enzyme kinetics (Michaelis–Menten)

- **Textbooks:** Biochemistry Free For All (catalysis: Michaelis–Menten, k_cat, inhibition,
  Lineweaver–Burk); 5.07SC.
- **Tests ask:**

  | Question type                                       | Page             | Mark   |
  | --------------------------------------------------- | ---------------- | ------ |
  | rate at a substrate level; V_max from k_cat and [E] | main             | Solves |
  | K_m and V_max from two (or more) rate readings      | ~lineweaver      | Solves |
  | rate with an inhibitor; apparent K_m and V_max      | ~inhibition      | Solves |
  | which inhibitor type a graph or result shows        | ~inhibitor-types | Solves |
  | specificity constant k_cat/K_m                      | main             | Solves |

- **Main — BUILD `he.chemistry.biochemistry#1`:** `functionGraph` rational (`a: 'V', zeros: [0],
poles: [-Km]` from a derived value, `marks: ['asymptotes']`, `at` the point). Values total
  enzyme [E]ₜ (μM), turnover number k_cat (s⁻¹), V_max (μM/s), Michaelis constant K_m (μM),
  substrate [S] (μM), rate v (μM/s), specificity k_cat/K_m (M⁻¹s⁻¹). Relations:
  V_max = k_cat[E]ₜ; v = V_max[S] ÷ (K_m + [S]); specificity = k_cat ÷ K_m (a step turns μM into
  M). Assumptions: initial rates, [S] ≫ [E]ₜ, steady state of ES; at [S] = K_m, v = V_max ÷ 2.
  Example: [E]ₜ = 0.010 μM, k_cat = 500 s⁻¹ → V_max = 5.0 μM/s; K_m = 20 μM, [S] = 60 μM →
  v = 3.75 μM/s; k_cat/K_m = 2.5 × 10⁷ M⁻¹s⁻¹. startWith [E]ₜ, k_cat, K_m, [S].
- **~lineweaver — BUILD:** `functionGraph` linear (1/v against 1/[S]; `zeros` at −1/K_m,
  `intercept` 1/V_max). Values [S]₁, v₁, [S]₂, v₂, slope (s), intercept (s/μM), V_max, K_m.
  Relations: slope = (1/v₂ − 1/v₁) ÷ (1/[S]₂ − 1/[S]₁); intercept = 1/v₁ − slope/[S]₁;
  V_max = 1 ÷ intercept; K_m = slope × V_max. Example: (10 μM, 1.667 μM/s), (40 μM, 3.333 μM/s)
  → slope 4.0 s, intercept 0.20 s/μM → V_max = 5.0 μM/s, K_m = 20 μM.
- **~inhibition — BUILD:** `functionGraph` rational with `other` (the curve without the
  inhibitor, dashed). Values: inhibitor type (allowed competitive, uncompetitive,
  noncompetitive; E11), V_max, K_m, [I], K_i, factor α = 1 + [I] ÷ K_i, apparent K_m′, apparent
  V_max′, [S], v. Relations by type: competitive K_m′ = αK_m; uncompetitive K_m′ = K_m ÷ α,
  V′ = V ÷ α; noncompetitive V′ = V ÷ α; v = V′[S] ÷ (K_m′ + [S]). Example: competitive,
  K_i = 5.0 μM, [I] = 10 μM → α = 3, K_m′ = 60 μM; at [S] = 60 μM, v = 2.50 μM/s (3.75 without).
  10 values.
- **~inhibitor-types — BUILD (sort):** bins Competitive, Uncompetitive, Noncompetitive. Cards:
  "K_m rises, V_max stays"; "Lineweaver–Burk lines meet on the y-axis"; "binds the free enzyme
  at the active site" (competitive); "K_m and V_max fall by the same factor"; "parallel
  Lineweaver–Burk lines"; "binds only the enzyme–substrate complex" (uncompetitive); "V_max
  falls, K_m stays"; "lines meet on the x-axis"; "binds the enzyme and the complex equally,
  away from the active site" (noncompetitive).
- **Verdict:** 4 pages (3 calculators, 1 sort); the five types Solve.

### biochemistry#2 — Metabolic pathways

- **Textbooks:** Biochemistry Free For All (glycolysis, citric acid cycle, fatty acid
  oxidation); 5.07SC.
- **Refresh:** `s.9.cellular-energy` (the `organelleEnergy` explore).
- **Tests ask:**

  | Question type                                    | Page            | Mark   |
  | ------------------------------------------------ | --------------- | ------ |
  | glycolysis steps and enzymes in order            | main            | Solves |
  | citric acid cycle in order; where NADH, CO₂ form | ~krebs          | Solves |
  | ATP from one glucose (with either shuttle)       | ~atp-yield      | Solves |
  | ATP from a fatty acid                            | ~beta-oxidation | Solves |

- **Main — BUILD `he.chemistry.biochemistry#2` (sequence):** "Glycolysis, from glucose": hexokinase
  (glucose → glucose 6-phosphate, uses ATP); phosphoglucose isomerase (→ fructose 6-phosphate);
  phosphofructokinase-1 (→ fructose 1,6-bisphosphate, uses ATP); aldolase (→ DHAP and
  glyceraldehyde 3-phosphate); triose phosphate isomerase (DHAP → glyceraldehyde 3-phosphate);
  glyceraldehyde 3-phosphate dehydrogenase (→ 1,3-bisphosphoglycerate, makes NADH);
  phosphoglycerate kinase (→ 3-phosphoglycerate, makes ATP); phosphoglycerate mutase (→
  2-phosphoglycerate); enolase (→ phosphoenolpyruvate); pyruvate kinase (→ pyruvate, makes
  ATP). Spans (ATP per glucose: −1, 0, −1, 0, 0, 0, +2, 0, 0, +2, net +2) wait on E12; ship
  without them. P20 adds stage cards.
- **~krebs — BUILD (sequence):** "The citric acid cycle, from acetyl-CoA and oxaloacetate":
  citrate synthase (→ citrate); aconitase (→ isocitrate); isocitrate dehydrogenase (→
  α-ketoglutarate, NADH, CO₂); α-ketoglutarate dehydrogenase (→ succinyl-CoA, NADH, CO₂);
  succinyl-CoA synthetase (→ succinate, GTP); succinate dehydrogenase (→ fumarate, FADH₂);
  fumarase (→ malate); malate dehydrogenase (→ oxaloacetate, NADH).
- **~atp-yield — BUILD:** `bars` (interim: ATP from NADH, from FADH₂, made directly; P20 the
  pathway figure). Values NADH, FADH₂, ATP or GTP made directly, ATP per NADH (default 2.5),
  ATP per FADH₂ (default 1.5), total ATP. Relation: total = 2.5 × NADH + 1.5 × FADH₂ + direct.
  Assumptions: P/O ratios 2.5 and 1.5 (older books use 3 and 2, giving 36–38). Example:
  glucose: 10 NADH, 2 FADH₂, 4 direct → 32 ATP; with the glycerol-phosphate shuttle, the two
  NADH from glycolysis give 1.5 each → 30.
- **~beta-oxidation — BUILD:** `bars` (interim). Values carbons n (even, 4–26), rounds of
  β-oxidation, acetyl-CoA, NADH, FADH₂, total ATP. Relations: rounds = n ÷ 2 − 1; acetyl-CoA =
  n ÷ 2; NADH = rounds + 3 × acetyl-CoA; FADH₂ = rounds + acetyl-CoA; ATP = 2.5NADH + 1.5FADH₂ +
  acetyl-CoA − 2 (activation). Assumptions: a saturated, even chain; the GTP of each turn of the
  cycle counted as ATP. Example: palmitate (16) → 7 rounds, 8 acetyl-CoA, 31 NADH, 15 FADH₂ →
  106 ATP.
- **Verdict:** 4 pages (2 calculators, 2 sequences).

### biochemistry#3 — Bioenergetics

- **Textbooks:** Biochemistry Free For All (energy: ΔG°′, coupled reactions, redox potentials,
  chemiosmosis); 5.07SC.
- **Refresh:** `gen-chem-2#3~nonstandard`, `gen-chem-2#4~free-energy-k`.
- **Tests ask:**

  | Question type                                      | Page           | Mark            |
  | -------------------------------------------------- | -------------- | --------------- |
  | ΔG of ATP hydrolysis in a cell                     | main           | Solves          |
  | ΔG°′ and K′ of a coupled reaction                  | ~coupled       | Solves (⏳ P15) |
  | ΔG°′ from reduction potentials (NADH → O₂)         | ~redox         | Solves          |
  | free energy of moving one H⁺ (proton-motive force) | ~proton-motive | Solves          |

- **Main — BUILD `he.chemistry.biochemistry#3`:** `none` (P23 later). Values ΔG°′ (kJ/mol,
  default −30.5), T (K, default 310.15), [ATP], [ADP], [Pᵢ] (mM), Q, ΔG. Relations: Q = [ADP][Pᵢ]
  ÷ [ATP] (concentrations in M, a step converts mM); ΔG = ΔG°′ + RT ln Q. Assumptions: °′ means
  pH 7 and 1 M for everything else; a cell keeps ATP high, so ΔG is far below ΔG°′. Example:
  5.0, 0.50 and 5.0 mM at 37 °C → Q = 5.0 × 10⁻⁴, RT ln Q = −19.6 kJ/mol, ΔG = −50.1 kJ/mol.
  startWith the three concentrations.
- **~coupled — BUILD (⏳ P15, ladder with `quantity: 'G'`):** values ΔG°′ of the uphill step,
  ΔG°′ of the downhill step, total ΔG°′, T, K′. Relations: total = ΔG₁ + ΔG₂; K′ = e^(−total/RT).
  Example: glucose + Pᵢ → glucose 6-phosphate (+13.8) with ATP hydrolysis (−30.5) → −16.7
  kJ/mol, K′ = 843 at 298.15 K.
- **~redox — BUILD:** `chemDiagram` mode `cell` (its E° scale; interim). Values E°′ of the
  acceptor and of the donor (V), ΔE°′, electrons n, ΔG°′, ATP worth (ΔG ÷ 30.5). Relations:
  ΔE°′ = E°′(acceptor) − E°′(donor); ΔG°′ = −nFΔE°′; worth = −ΔG°′ ÷ 30.5. Example: NADH
  (−0.320 V) to O₂ (+0.815 V), n = 2 → ΔE°′ = 1.135 V, ΔG°′ = −219 kJ/mol, enough for 7.2 ATP
  (about 2.5 are made).
- **~proton-motive — BUILD:** `membrane` (H32; H⁺ dots more on the outside, the pump lit).
  Values membrane potential Δψ (V), pH difference ΔpH (inside minus outside), T, electrical part
  (kJ/mol), chemical part (kJ/mol), ΔG per H⁺ moved in. Relations: electrical = FΔψ ÷ 1000;
  chemical = 2.303RTΔpH ÷ 1000; ΔG = −(electrical + chemical). Example: Δψ = 0.150 V,
  ΔpH = 0.75 at 37 °C → 14.5 + 4.5 → ΔG = −18.9 kJ/mol for each H⁺ that flows back in.
- **Verdict:** 4 calculators; four types Solve, one after P15.

## Inorganic Chemistry — `he.chemistry.inorganic`

Prerequisite `he.chemistry.gen-chem-2`. Textbooks: LibreTexts Inorganic Chemistry bookshelf
(symmetry, coordination, crystal field, solid state); OpenStax Chemistry 2e ch. 10 and 19 for
the general-chemistry level; MIT OCW 5.03 and 5.04.

### inorganic#0 — Symmetry and group theory

- **Textbooks:** 5.04 (point groups, character tables, reducible representations, IR and Raman
  activity); LibreTexts symmetry chapters.
- **Refresh:** `gen-chem-1#4` (shapes).
- **Tests ask:**

  | Question type                                   | Page               | Mark                               |
  | ----------------------------------------------- | ------------------ | ---------------------------------- |
  | point group of a molecule                       | main               | Solves                             |
  | reduce Γ; how many IR-active vibrations (C₂ᵥ)   | ~reduce            | Solves                             |
  | the order of questions in the point-group chart | ~point-group-steps | Solves                             |
  | reduce Γ in C₃ᵥ, D₄ₕ …                          | —                  | Partly (E9: more character tables) |

- **Main — BUILD `he.chemistry.inorganic#0` (sort):** bins C₂ᵥ, C₃ᵥ, D₃ₕ, T_d, D₄ₕ, O_h, D∞h,
  C∞v (`pickBar: true`). Cards (`molecule` card where drawn; text with the shape named until
  P18): H₂O, CH₂Cl₂, SO₂; NH₃, CHCl₃, PCl₃; BF₃, PCl₅; CH₄, CCl₄; XeF₄, [PtCl₄]²⁻; SF₆,
  [Fe(CN)₆]⁴⁻; CO₂, HC≡CH; HCl, HCN. Intro: "Find the shape first (VSEPR), then its symmetry."
- **~reduce — BUILD:** `matrixGrid` (the C₂ᵥ character table, a row times the Γ row lit).
  Values: characters of Γ under E, C₂, σᵥ(xz), σᵥ′(yz), and the counts of A₁, A₂, B₁, B₂.
  Relation: nᵢ = (1/4)Σ χ_Γ(R)χᵢ(R), one line per species. Assumptions: a planar molecule lies
  in the yz plane; subtract translations (A₁ + B₁ + B₂) and rotations (A₂ + B₁ + B₂) for the
  vibrations; A₁, B₁, B₂ are IR active. Example: H₂O, all 3N motions: Γ = 9, −1, 1, 3 →
  3A₁ + A₂ + 2B₁ + 3B₂ → vibrations 2A₁ + B₂, all three IR active.
- **~point-group-steps — BUILD (sequence):** "Is it linear?", "Does it have several high-order
  axes (T_d, O_h)?", "Find the principal axis Cₙ", "Are there n C₂ axes perpendicular to it
  (a D group)?", "Is there a mirror plane perpendicular to the axis (σₕ)?", "Are there mirror
  planes containing the axis (σᵥ)?".
- **Verdict:** 3 pages (1 calculator, 1 sort, 1 sequence).

### inorganic#1 — Coordination chemistry

- **Textbooks:** Chemistry 2e 19.2 (coordination compounds, isomers); LibreTexts coordination
  and organometallic chapters (the 18-electron rule).
- **Tests ask:**

  | Question type                                 | Page               | Mark                                |
  | --------------------------------------------- | ------------------ | ----------------------------------- |
  | oxidation state, d count, coordination number | main               | Solves                              |
  | does a complex obey the 18-electron rule      | ~eighteen-electron | Solves                              |
  | which isomers a complex has                   | ~isomers           | Solves                              |
  | name a complex                                | —                  | No (naming rules; a later sequence) |

- **Main — BUILD `he.chemistry.inorganic#1`:** `none` (P13 `complex` later). Values: charge of
  the complex ion q (−4 to 4), total ligand charge (−6 to 0), metal oxidation state, metal group
  number (3–12), d electrons, coordination number (allowed 2, 4, 5, 6). Relations: oxidation
  state = q − ligand charge; d = group − oxidation state. Example: [Co(NH₃)₅Cl]²⁺ → +2 − (−1) =
  +3, cobalt(III); group 9 → d⁶; coordination number 6.
- **~eighteen-electron — BUILD:** `none`. Values metal group G, two-electron (L) ligands, one-
  electron (X) ligands, complex charge, electron count. Relation: count = G + 2L + X − charge
  (neutral counting). Example: Fe(CO)₅ → 8 + 10 = 18; [Mn(CO)₆]⁺ → 7 + 12 − 1 = 18; Ni(CO)₄ → 18.
- **~isomers — BUILD (sort):** bins "Cis and trans isomers", "Fac and mer isomers", "Optical
  isomers only", "No stereoisomers". Cards: square-planar [Pt(NH₃)₂Cl₂]; octahedral
  [Co(NH₃)₄Cl₂]⁺; [Co(NH₃)₃Cl₃]; [Co(en)₃]³⁺; tetrahedral [NiCl₄]²⁻; [Co(NH₃)₅Cl]²⁺;
  square-planar [Pt(NH₃)₃Cl]⁺. ([Co(en)₂Cl₂]⁺ is left out: it has both kinds.)
- **Verdict:** 3 pages (2 calculators, 1 sort).

### inorganic#2 — Crystal field theory

- **Textbooks:** Chemistry 2e 19.3 (crystal field, color, magnetism); LibreTexts (CFSE, spin
  state, spectrochemical series).
- **Tests ask:**

  | Question type                                   | Page             | Mark           |
  | ----------------------------------------------- | ---------------- | -------------- |
  | high or low spin; unpaired electrons; CFSE; μ   | main             | Solves (⏳ P4) |
  | Δₒ from the absorbed wavelength; the color seen | ~color           | Solves         |
  | rank ligands by field strength                  | ~spectrochemical | Solves         |

- **Main — BUILD `he.chemistry.inorganic#2` (⏳ P4, E8):** `orbitalDiagram` mode `crystalField`.
  Values d electrons (0–10), splitting Δₒ (cm⁻¹), pairing energy P (cm⁻¹), electrons in t₂g,
  electrons in e_g, unpaired electrons, CFSE (cm⁻¹), spin-only moment μ (BM). Relations: low spin
  when Δₒ > P; CFSE = (−0.4t₂g + 0.6e_g)Δₒ + (extra pairs) × P; μ = √(n(n + 2)). Assumptions:
  octahedral (tetrahedral Δₜ ≈ 4/9 Δₒ is always high spin; a later option); pairs counted
  against the free ion. Example: Fe²⁺ (d⁶) with water, Δₒ = 10,400, P = 17,600 → high spin
  t₂g⁴e_g², 4 unpaired, CFSE = −4160 cm⁻¹, μ = 4.90 BM; with cyanide, Δₒ = 33,000 → low spin
  t₂g⁶, 0 unpaired, CFSE = −79,200 + 35,200 = −44,000 cm⁻¹.
- **~color — BUILD:** `spectrum` with `photon` (the absorbed wavelength on the visible band).
  Values wavelength absorbed λ (nm), Δₒ (cm⁻¹), Δₒ (kJ/mol). Relations: Δ = 10⁷ ÷ λ;
  Δ(kJ/mol) = 0.011963 × Δ(cm⁻¹). Example: [Ti(H₂O)₆]³⁺ (d¹) absorbs at 500 nm → 20,000 cm⁻¹ =
  239 kJ/mol; it looks red-violet, the light left over.
- **~spectrochemical — BUILD (sequence):** "Order from the weakest-field ligand to the
  strongest": I⁻, Cl⁻, F⁻, H₂O, NH₃, CN⁻.
- **Verdict:** 3 pages (2 calculators, 1 sequence).

### inorganic#3 — Solid-state structures

- **Textbooks:** Chemistry 2e 10.6 (lattice structures, unit cells, X-ray diffraction);
  LibreTexts (radius ratios, Madelung constants, Born–Landé).
- **Refresh:** `gen-chem-1#4~born-haber`.
- **Tests ask:**

  | Question type                                           | Page          | Mark            |
  | ------------------------------------------------------- | ------------- | --------------- |
  | density, radius or edge from the unit cell              | main          | Solves (⏳ P17) |
  | coordination number from the radius ratio; NaCl density | ~radius-ratio | Solves (⏳ P17) |
  | diffraction angle or spacing (Bragg)                    | ~bragg        | Solves          |
  | lattice energy from Born–Landé                          | ~born-lande   | Solves          |

- **Main — BUILD `he.chemistry.inorganic#3` (⏳ P17):** `unitCell`. Values: lattice (allowed
  simple, body-centered, face-centered cubic; E11), atoms per cell Z (1, 2, 4), atomic radius r
  (pm), edge a (pm), molar mass M, density ρ (g/cm³), packing fraction (%). Relations: a = 2r,
  4r ÷ √3 or 2√2 r; ρ = ZM ÷ (N_A a³) (a in cm); packing = Z(4/3)πr³ ÷ a³. Example: copper, fcc,
  r = 128 pm → a = 362 pm, ρ = 8.90 g/cm³, 74.0%.
- **~radius-ratio — BUILD (⏳ P17):** values cation radius r₊ and anion radius r₋ (pm), ratio,
  predicted coordination number, rock-salt edge a, formula mass M, density. Relations: ratio =
  r₊ ÷ r₋ (0.225–0.414 → 4, 0.414–0.732 → 6, above 0.732 → 8); rock salt a = 2(r₊ + r₋),
  ρ = 4M ÷ (N_A a³). Example: NaCl, 102 and 181 pm → 0.564 → 6; a = 566 pm, ρ = 2.14 g/cm³
  (measured 2.17).
- **~bragg — BUILD:** `none` (P17 `planes` later). Values wavelength λ (pm), Miller indices h,
  k, l, edge a (pm), spacing d, angle θ. Relations: d = a ÷ √(h² + k² + l²); λ = 2d sin θ.
  Example: Cu Kα (154.2 pm) on copper (a = 361.5 pm), (111) → d = 208.7 pm, θ = 21.68°,
  2θ = 43.36°.
- **~born-lande — BUILD:** `none`. Values Madelung constant A (allowed rock salt 1.7476, CsCl
  1.7627, zinc blende 1.6381), charge sizes z₊ and z₋, nearest distance r₀ (pm), Born exponent n
  (5–12), lattice energy U (kJ/mol). Relation: U = −N_A A z₊z₋e²(1 − 1/n) ÷ (4πε₀r₀).
  Example: NaCl, r₀ = 282 pm, n = 8 → U = −753 kJ/mol (Born–Haber gives −786: the bonding is
  not purely ionic).
- **Verdict:** 4 calculators; two wait on P17.

## Pictures for the pictures chat

Options on existing kinds first; four new kinds (P5, P14, P17, P18 figure). Each option is off
unless a page sets it, and each gets its check in `harness/pictures.ts` and a gallery demo.

1. **HE-chemistry-P1 — `orbitalDiagram` mode `well`.** Pages: `physical-2#1`, `~oscillator`.
   Draws the potential (box walls, or the parabola ½kx²), levels to scale up to n = 6 (or
   v = 5), ψ (or ψ²) drawn on its level, the transition as an arrow with ΔE and λ. Fields:
   `model: 'box' | 'oscillator'`, `length` or `force`/`mass` (variable ids), `lower`, `upper`,
   `gap?`, `wavelength?`, `square?`. Must stay true: box levels ∝ n², oscillator levels evenly
   spaced from ½hν; ψ has n − 1 nodes (box) or v nodes; ΔE and λ = hc ÷ ΔE checked.
2. **HE-chemistry-P2 — `orbitalDiagram` ladder `Z` and mode `radial`.** Pages:
   `physical-2#2`, `~radius`. Ladder: levels −13.6Z²/n² for a hydrogen-like ion. Radial:
   P(r) = r²R²(r) for n ≤ 4, l < n, with the nodes marked, ⟨r⟩ dashed and r_mp ringed, r in a₀.
   Fields `Z`, `n`, `l`, `mean?`, `peak?`. Checks: radial nodes = n − l − 1; area 1; ⟨r⟩ and
   r_mp agree with the formulas.
3. **HE-chemistry-P3 — `orbitalDiagram` mode `mo`.** Pages: `gen-chem-1#4~bond-order`,
   `physical-2#3`, `~huckel`. Three views: `diatomic` (2nd-period homonuclear and ions; s–p
   mixing order through N₂, the other order from O₂; electrons filled, bond order and
   para/diamagnetic in the caption); `heteronuclear` (two AO levels α_A, α_B and the two MOs
   from E±, the gap); `frost` (a ring of N in a circle of radius 2β, levels at the vertices,
   electrons filled). Fields: `electrons`, `alphaA`, `alphaB`, `beta`, `ring`, `bondOrder?`,
   `unpaired?`. Checks: electron count, bond order, unpaired, E± from the 2 × 2 determinant,
   Frost levels 2β cos(2πk/N).
4. **HE-chemistry-P4 — `orbitalDiagram` mode `crystalField`.** Pages: `inorganic#2` (and the
   d count on `inorganic#1`). The five d boxes split into t₂g and e_g by Δₒ (to scale against
   P), filled high or low spin, CFSE and μ in the caption; `geometry: 'octahedral' |
'tetrahedral' | 'squarePlanar'` (octahedral first). Fields `d`, `split`, `pairing`, `t2g?`,
   `eg?`, `unpaired?`, `cfse?`. Checks: spin from Δ vs P; counts add to d; CFSE formula.
5. **HE-chemistry-P5 — new kind `instrumentTrace`.** Pages: `organic-1#4` (`nmr`),
   `analytical#3` (`chromatogram`), `physical-2#4` (`rotational`); `ir` for the IR sort's cards
   (card figure, 140 × 60). `nmr`: signals at δ (12 to 0 ppm, reversed axis), each an n + 1
   multiplet with Pascal intensities and its integral step; `chromatogram`: Gaussian peaks from
   t_M, tᵢ, wᵢ, the resolution bracket; `rotational`: lines at 2B(J + 1) with Boltzmann
   heights; `ir`: bands at given wavenumbers (4000 to 400 cm⁻¹, reversed). Checks: peak
   positions and widths from the values; multiplet line count n + 1; line spacing 2B.
6. **HE-chemistry-P6 — `phScale` titration options.** Pages: `gen-chem-2#2~buffer`,
   `analytical#1~polyprotic`, `biochemistry#0`. `polyprotic: { Ka2, Ka3? }` (two or three
   equivalence points, each half-way pH = pKₐ marked); `buffer: true` (the ±1 pH band around
   pKₐ shaded, HA and A⁻ as two bars with the HH ratio); `aminoAcid` (the curve of a free
   amino acid with the pI marked). Checks: equivalence volumes in ratio 1 : 2 (: 3); pH at
   half-way points = pKₐ within 0.05; the pI between its two pKₐ.
7. **HE-chemistry-P7 — `chemDiagram` mode `rate` options.** Pages: `gen-chem-2#0` (main,
   ~second-order, ~zero-order, ~arrhenius), `physical-1#3`. `integrated: { order, k, start, t }`:
   [A] against t with half-lives marked, and beside it the straight-line plot (ln[A] or
   1/[A]) whose slope is ±k; `arrhenius: { k1, T1, k2, T2 }`: ln k against 1/T, slope −Eₐ/R;
   `consecutive: { k1, k2, start, t }`: [A], [B], [C] with t_max. Checks: the curve passes
   through the page's values; half-life spacing (constant for order 1); [A] + [B] + [C] =
   [A]₀ at every point.
8. **HE-chemistry-P8 — `chemDiagram` mode `phase` options.** Pages: `physical-1#1` (main,
   ~raoult, ~clapeyron, ~phase-rule). `substance: { triple, critical, normalBoiling?,
meltSlope? }` for any one-component diagram, with the vapor curve through two (T, P) points
   from Clausius–Clapeyron; `binary: { PA, PB, x }`: the liquid line and vapor curve of an
   ideal mixture, a tie line at x. Checks: the curve passes both points; y_A ≥ x_A for the more
   volatile A; F = C − P + 2 at a marked point.
9. **HE-chemistry-P9 — `chemDiagram` mode `cell` options.** Pages: `gen-chem-2#4` (main,
   ~concentration-cell, ~electrolysis), `analytical#4`. `concentrations: { anode, cathode }`
   (ion dots by concentration in each beaker, Q and E beside E°); one metal both sides (a
   concentration cell, E° = 0); `electrolysis: { current, time, z }` (a power supply driving a
   plating cell, electrons counted as Q ÷ F, metal deposited). Checks: E from Nernst; moles
   from It ÷ (zF).
10. **HE-chemistry-P10 — `gasPiston` options `real` and `speeds`.** Pages:
    `gen-chem-1#2~real-gas`, `~kinetic`. `real: { a, b }`: particles drawn with their own volume
    and short attraction lines, two gauges (ideal and van der Waals), Z in the caption;
    `speeds: { molar, temperature }`: the Maxwell–Boltzmann curve with v_mp, v_avg, v_rms marked
    (and a second gas or T dashed). Checks: P from the vdW equation; v_rms = √(3RT/M), v_mp <
    v_avg < v_rms; area 1.
11. **HE-chemistry-P11 — `gasPiston` option `pv`.** Pages: `physical-1#0` (main, ~adiabatic).
    The P–V diagram beside the piston: `path: 'isothermal' | 'adiabatic' | 'isobaric' |
'isochoric'` from (V₁, P₁) to V₂, the area under it shaded as the work, its sign named.
    Checks: the path's end pressure (P₂ = P₁V₁/V₂, or P₁(V₁/V₂)^γ); the shaded area = |w|.
12. **HE-chemistry-P12 — `lewisStructure` options `formal`, `resonance`, expanded octets.**
    Page: `gen-chem-1#4~formal-charge`. Formal charges on every atom (signed, circled);
    `resonance: 2 | 3` forms side by side with double-headed arrows (NO₃⁻, CO₃²⁻, O₃, SO₄²⁻);
    expanded octets (PCl₅, SF₄, SF₆, ClF₃, XeF₄, I₃⁻). Checks: charges add to the ion's
    charge; electrons counted equal V.
13. **HE-chemistry-P13 — `vsepr` 5–6 domains and `complex`.** Pages: `gen-chem-1#4`,
    `inorganic#1` (and ~isomers cards). Bonded 2–6 and lone 0–3 (trigonal bipyramidal,
    seesaw, T-shaped, linear from 5; octahedral, square pyramidal, square planar from 6), the
    hybrid named; `complex: { geometry, ligands, isomer? }` draws a metal with named ligands,
    cis/trans or fac/mer. Checks: lone pairs equatorial in 5 domains, trans in 6; angles.
14. **HE-chemistry-P14 — new kind `skeletal` and card figure `skeletal`.** Pages: every
    organic sort and sequence, `organic-1#0~unsaturation`, `~chair`, `#3~hydrogenation`. A
    line-angle structure from a small spec (a SMILES-like string), heteroatoms and H on
    heteroatoms drawn, wedges and dashes, CIP ranks 1–4 and R/S on a chosen center, the parent
    chain numbered, a functional group lit; `chair` (cyclohexane with axial and equatorial
    groups, ring flip); rings and π bonds counted for the IHD. Checks: valence 4 on every C;
    the IHD from the drawing equals the formula's; R/S from the ranks and the wedge.
15. **HE-chemistry-P15 — `energyProfile` options `steps`, `bomb`, `quantity: 'G'`.** Pages:
    `organic-1#2~energy-diagram`, `gen-chem-1#3~bomb`, `biochemistry#3~coupled`. `steps`: a
    coordinate with 2–3 humps and the intermediates between, the highest transition state
    marked rate-determining; calorimeter `bomb: true` (a steel bomb in water, ignition wires,
    constant volume); `quantity: 'G'` relabels ΔH as ΔG (°′ allowed) on the profile and the
    ladder. Checks: each hump's top = the level before + its Eₐ; ΔH (ΔG) = products −
    reactants; ladder total = the sum of steps.
16. **HE-chemistry-P16 — `beaker` option `cuvette`.** Page: `analytical#2`. A cuvette of path b,
    a beam from I₀ narrowing to I, %T and A in the caption, the color of the solution by c.
    Fields `path`, `absorbance`, `transmittance?`. Checks: A = −log(I ÷ I₀); beam width ∝ T.
17. **HE-chemistry-P17 — new kind `unitCell`.** Pages: `inorganic#3` (main, ~radius-ratio,
    ~bragg). `lattice: 'sc' | 'bcc' | 'fcc' | 'rocksalt' | 'cesiumChloride' | 'zincBlende'`;
    atoms cut at corners (1/8), edges (1/4), faces (1/2) and counted to Z; the edge a and the
    touching direction (edge, body or face diagonal) with r marked; `planes: { h, k, l }`
    shades a lattice plane and its spacing d. Checks: Z per lattice; a from r by the touching
    direction; d = a ÷ √(h² + k² + l²).
18. **HE-chemistry-P18 — explore figure `symmetryElements` and `molecule` card formulas.**
    Page: `inorganic#0` (sort cards; an explore page later). A molecule (H₂O, NH₃, BF₃, CH₄,
    XeF₄, SF₆, PCl₅, CO₂, trans-N₂F₂, CH₂Cl₂) with a scene lighting one Cₙ axis, σ plane, i or
    Sₙ; the `molecule` card adds SO₂, PCl₃, PCl₅, XeF₄, SF₆, [PtCl₄]²⁻, [Fe(CN)₆]⁴⁻, HCN, C₂H₂.
    Checks: each lit element maps the molecule onto itself.
19. **HE-chemistry-P19 — `normalCurve` option `family: 't', df`.** Pages: `analytical#0` (main,
    ~t-test). The t curve for df = n − 1 beside the normal (dashed), ±t marked, the interval
    x̄ ± ts/√n bracketed on a value axis, an observed t placed. Checks: the critical t gives
    95% (two-sided) within 0.001; the bracket width = 2ts/√n.
20. **HE-chemistry-P20 — `organelleEnergy` option `detail` and stage card `pathwayStep`.**
    Pages: `biochemistry#2` (both sequences, ~atp-yield, ~beta-oxidation). `detail:
'glycolysis' | 'krebs' | 'etc'`: each step's substrate, enzyme and the ATP, NADH, FADH₂,
    CO₂ made, tallied; the card draws one step (112 × 76). Checks: tallies (2 ATP net, 2 NADH
    for glycolysis; per acetyl-CoA 3 NADH, 1 FADH₂, 1 GTP, 2 CO₂); cards in order.
21. **HE-chemistry-P21 — `macromolecules` option `level`.** Page: `biochemistry#0~levels` (an
    explore later). The same chain shown as its sequence, a helix and a sheet, the folded
    chain, and two chains packed; `level: 1–4` lights one. Checks: the residue count is the
    same in every view.
22. **HE-chemistry-P22 — `phScale` mode `pka`.** Pages: `organic-1#0~pka-equilibrium`,
    `~acid-order`, `organic-2#3`. A vertical pKₐ ladder from −10 to 50 with named acids, the
    two acids of a reaction lit and the equilibrium arrow toward the weaker acid, log K =
    ΔpKₐ. Checks: positions by pKₐ; the arrow's side.
23. **HE-chemistry-P23 — `equilibriumChart` mode `gibbs`.** Pages: `gen-chem-2#3` (main,
    ~nonstandard), `physical-1#2`, `biochemistry#3`. G against the extent from pure reactants
    to pure products, the minimum at the equilibrium extent (from K), the current Q placed with
    the slope's sign as ΔG. Checks: the minimum where Q = K; the slope's sign = ΔG's sign.
24. **HE-chemistry-P24 — `moleMap` boxes `solution` and `gas: { temperature, pressure }`, and
    `reaction` term `C{x}H{y}O{z}`.** Pages: `gen-chem-1#1~solution-stoich`, `#2~gas-stoich`,
    `#1` (combustion). A molarity box (M × L → mol) at either end of the map; a gas box with
    V = nRT ÷ P at any T and P; a combustion train (sample, CO₂ and H₂O absorbers weighed)
    with the CₓHᵧO_z formula from values. Checks: each factor's arithmetic; atoms balance.

## Research to do

For a separate research chat: plan only, nothing collected here. The reference-only rule of
`research/textbooks/README.md` holds for every source below, whatever its licence: record
chapter lists, worked-example kinds, number ranges and notation; never copy a problem, text,
figure or number into a lesson. Respect robots.txt (OpenStax disallows `/books/` for AI
crawlers, `research/questions/SOURCES.md`); the licences below are as stated on each site and
should be re-quoted with the URL in `research/textbooks/sources/he-chemistry.md`.

### Textbooks

| Title (URL)                                                                                                    | Licence                                                                                            | Courses, topics                                     | Extract                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| OpenStax Chemistry 2e — https://openstax.org/details/books/chemistry-2e                                        | CC BY 4.0 on the book page; the repo records CC BY-NC-SA (confirm); OpenStax forbids LLM ingestion | gen-chem-1, gen-chem-2; inorganic#1–#3 (ch. 10, 19) | chapter and section titles (already in `toc/science/`), worked-example kinds per section, number ranges; titles only unless the owner approves more |
| OpenStax Organic Chemistry (McMurry, 10th ed., 2023) — https://openstax.org/details/books/organic-chemistry    | CC BY-NC-SA 4.0; LLM-ingestion restriction                                                         | organic-1, organic-2; biochemistry#0 (ch. 26)       | chapter and section titles; which reagents and mechanisms each chapter teaches; spectroscopy tables' ranges                                         |
| Harvey, Analytical Chemistry 2.1 — https://open.umn.edu/opentextbooks/textbooks/486 (also LibreTexts)          | CC BY-NC-SA                                                                                        | analytical (all five topics)                        | chapter list; worked-example kinds; t and Q tables' layout; typical concentrations and volumes                                                      |
| Ahern, Rajagopal & Tan, Biochemistry Free For All — https://open.oregonstate.education/biochemfreeforall/      | CC BY-NC 4.0                                                                                       | biochemistry (all four)                             | chapter list; the enzyme-kinetics and energy sections' numbers (K_m, k_cat, ΔG°′ ranges)                                                            |
| LibreTexts Chemistry bookshelves (Physical & Theoretical; Inorganic; Analytical) — https://chem.libretexts.org | per page, mostly CC BY-NC-SA; some pages "undeclared" (skip those); check robots.txt               | physical-1, physical-2, inorganic                   | table of contents per book; which "Map:" books mirror commercial texts (titles only)                                                                |
| MIT OCW 5.111 / 5.112 Principles of Chemical Science — https://ocw.mit.edu                                     | CC BY-NC-SA 4.0                                                                                    | gen-chem-1, gen-chem-2                              | lecture list and order; exam topics                                                                                                                 |
| MIT OCW 5.12 Organic Chemistry I, 5.13 Organic Chemistry II                                                    | CC BY-NC-SA 4.0                                                                                    | organic-1, organic-2                                | syllabus order; problem-set kinds                                                                                                                   |
| MIT OCW 5.60 Thermodynamics & Kinetics; 5.61 Physical Chemistry                                                | CC BY-NC-SA 4.0                                                                                    | physical-1, physical-2                              | lecture notes' notation (sign of w, units), worked-example kinds                                                                                    |
| MIT OCW 5.07SC Biological Chemistry I                                                                          | CC BY-NC-SA 4.0                                                                                    | biochemistry                                        | problem kinds (pI, Michaelis–Menten, ΔG°′)                                                                                                          |
| MIT OCW 5.03 / 5.04 Inorganic Chemistry                                                                        | CC BY-NC-SA 4.0                                                                                    | inorganic                                           | point groups and character tables used; crystal field examples                                                                                      |
| MIT OCW 5.35 / 5.310 Laboratory Chemistry                                                                      | CC BY-NC-SA 4.0                                                                                    | analytical                                          | lab calculations (KHP, Beer's law, standard addition)                                                                                               |

### Questions

| Source (URL)                                                                                                 | Licence / terms                     | Courses                                           | Record per question                                                       | Target            |
| ------------------------------------------------------------------------------------------------------------ | ----------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------- | ----------------- |
| MIT OCW exams and problem sets (courses above)                                                               | CC BY-NC-SA 4.0                     | all nine                                          | course, topic, question type, unknown asked, number sizes (reference)     | 15 per course     |
| AP Chemistry released free-response questions — https://apcentral.collegeboard.org                           | © College Board; reference only     | gen-chem-1, gen-chem-2 (the bridge level)         | topic, type, the parts asked, which page answers it                       | 40                |
| Harvey, Analytical Chemistry 2.1 end-of-chapter problems                                                     | CC BY-NC-SA                         | analytical                                        | topic, type, data size (replicates, standards)                            | 30                |
| OpenStax Chemistry 2e and Organic Chemistry end-of-chapter exercises                                         | as above; LLM-ingestion restriction | gen-chem, organic                                 | only with the owner's approval: question type counts per section, no text | 0 unless approved |
| US National Chemistry Olympiad past exams (ACS) — https://www.acs.org/education/students/highschool/olympiad | © ACS; reference only; check terms  | gen-chem-1/2, organic-1, physical-1, inorganic    | topic, type, answer kind                                                  | 30                |
| International Chemistry Olympiad preparatory problems (host-country sites)                                   | terms vary by year; check each      | physical-1/2, inorganic, analytical, biochemistry | topic, type, multi-step structure                                         | 20                |
| LibreTexts homework and exercise pages                                                                       | per page; skip undeclared           | physical-2, inorganic, biochemistry               | topic, type                                                               | 20                |

Off limits: ACS standardized exams (secure, never released) and their commercial study guides;
GRE Chemistry (ETS ended it in 2023; its practice book is © ETS, reference only if at all);
Chegg, Quizlet, course-hero copies and anything behind a login. Targets per course: gen-chem-1
60, gen-chem-2 60, organic-1 40, organic-2 40, analytical 40, physical-1 30, physical-2 30,
biochemistry 30, inorganic 30 (360 in all, mixed from the rows above).

### Engine needs

- **E1 Chemistry units** in `src/engine/units.ts`: M (mol/L) with mM, μM, nM; g/mol;
  kJ/mol ↔ J/mol ↔ kcal/mol; J/(mol·K); bar beside atm, kPa, torr; s⁻¹, M⁻¹s⁻¹, M⁻²s⁻¹, M/s,
  μM/s; cm⁻¹; Da, kDa; L/(mol·cm); mg/L (ppm); pm, Å; kJ/°C; BM as a label. Nearly every page.
- **E2 Constants registry** (R in both units, F, N_A, h, c, k_B, R_H, a₀, e, ε₀, mₑ, u, K_w,
  0.05916 V): one source, step lines print "R = 8.314 J/(mol·K)", the harness reads them.
- **E3 Data pickers:** an `allowed` choice with a name that sets several values (an acid's Kₐ,
  a half-reaction's E°, bond enthalpies of a reaction, Madelung constants, Δₒ and P of a
  complex). Waiting: `gen-chem-1#3~bond-enthalpy` (⏳); improves `gen-chem-2#2`, `#4`,
  `inorganic#2`, `#3~born-lande`.
- **E4 Quadratic with the physical root:** a helper that writes the quadratic formula's lines,
  rejects the root that makes a concentration negative (one line saying why), and adds the
  small-x check (within 5%). `gen-chem-2#1`, `#2` (main, ~weak-base, ~common-ion).
- **E5 Critical values:** t (two-sided, by df and confidence), Q (Dixon) and G (Grubbs) by n,
  with harness phrases ("t for 4 degrees of freedom at 95%"). `analytical#0`.
- **E6 Whole-number ratio:** multiply ratios by 2, 3, 4, 5, 6 until all are within 0.05 of a
  whole, with one step line. `gen-chem-1#1` (main, ~hydrate).
- **E7 MO filling:** diatomic MO order (switch between N₂ and O₂), bonding and antibonding
  counts, unpaired; Hückel cyclic levels (Frost). `gen-chem-1#4~bond-order` (⏳),
  `physical-2#3~huckel` (⏳).
- **E8 d-orbital filling** by geometry and spin, CFSE with pairing. `inorganic#2` (⏳).
- **E9 Character tables:** C₂ᵥ (in the page now), then C₃ᵥ, D₃ₕ, T_d, D₄ₕ, O_h as data, with
  the reduction formula's lines. `inorganic#0~reduce` beyond C₂ᵥ.
- **E10 Calculus notation:** `toLatex` for ∫ with limits, d/dx, ∂/∂T, ψ, ħ, ⟨r⟩ in assumptions,
  `how` lines and the Formulas section; no symbolic integration in the solver (normalization,
  ⟨x⟩ and mechanism derivations stay out of calculators: "No" rows above).
- **E11 Relations switched by a choice:** order 0/1/2, inhibitor type, lattice type, side-chain
  kind, Madelung structure: confirm the solver and the walkthrough handle a choice value in
  relations and in step text (and the harness samples each choice). `gen-chem-2#0`,
  `biochemistry#0`, `#1~inhibition`, `inorganic#3`.
- **E12 Signed sequence spans** (ATP per glycolysis step, net +2) in sequence layouts.
  `biochemistry#2`.
- **E13 Data list input:** replicate readings (mean, s) and calibration standards (slope,
  intercept, r²) typed as a list; reuse the statistics pages' data entry if it exists.
  `analytical#0`, `#2~calibration`.
- **E14 Number display at college:** exponents beyond ±30 (K = 1.5 × 10³⁷), 3–4 significant
  figures by page, pH decimals from the concentration's figures, signed charges (+3, −1), °′.
- **E15 Chemistry text in layouts:** subscripts, charges, arrows, stereodescriptors
  ((2R,3S)-…) and Greek letters in sort cards and sequence stages, accepted by the layout
  reading checks (which count a formula as one word).

## Not in the taxonomy

- General chemistry: intermolecular forces and liquids and solids (Chemistry 2e ch. 10);
  solutions and colligative properties (ch. 11, taught in General Chemistry II at most
  colleges); solubility equilibria (ch. 15; only `gen-chem-2#1~common-ion` here); nuclear
  chemistry (ch. 21); descriptive main-group and transition-metal chemistry (ch. 18–19).
- Organic I: mass spectrometry (McMurry 12.1–12.4); alcohols, ethers and epoxides (ch. 17–18);
  radical halogenation; structure puzzles from IR, NMR and MS together.
- Organic II: conjugated dienes, Diels–Alder and UV (ch. 14, 30); enolate alkylation (ch. 22);
  carbohydrates, amino acids, lipids, nucleic acids (ch. 25–28); synthetic polymers (ch. 31).
- Analytical: gravimetric analysis (Harvey ch. 8), sampling (ch. 7), kinetic methods (ch. 13),
  voltammetry and amperometry, mass spectrometry, quality assurance (ch. 15).
- Physical I: statistical thermodynamics; chemical potential and solutions; the kinetic theory
  of gases at the physical-chemistry level.
- Physical II: multi-electron atoms and term symbols; the variational and perturbation
  methods; magnetic resonance theory.
- Biochemistry: carbohydrates; lipids and membranes; nucleic acids and the flow of genetic
  information; gluconeogenesis and glycogen; amino-acid metabolism; signaling.
- Inorganic: descriptive main-group chemistry; organometallic reactions and catalysis;
  electronic spectra (Tanabe–Sugano); hard and soft acids and bases; bioinorganic chemistry.

## Priority

1. The 93 calculators not marked ⏳ (each uses a drawn kind or `none`): gen-chem-2 (all but
   ~electrolysis), gen-chem-1#0, #1 main + ~molecular-formula + ~hydrate, #2 main + ~kinetic +
   ~over-water, #3 main, #4 ~born-haber; analytical#1, #2, #4, #0 ~propagation + ~q-test,
   #3 ~van-deemter + ~purnell; physical-1 (all 14); biochemistry#0, #1, #2, #3 (but ~coupled);
   physical-2#0, #1 ~probability, #3 main, #4 ~boltzmann; inorganic#0 ~reduce, #1, #2 ~color,
   #3 ~bragg + ~born-lande; the organic calculators (13).
2. The 36 layout pages with text cards (E15 first).
3. Engine needs E1, E2, E14 (every page reads better), then E4, E11, E6, E5, E13, E3, E7, E8,
   E9, E12, E10.
4. Pictures that unblock pages: P24, P15, P1, P2, P3, P5, P17, P19, P6, P9, P10, P12, P13, P4;
   then the interim upgrades P7, P8, P11, P16, P22, P23, P14, P18, P20, P21.
5. Research (textbook tables of contents and question types) before the section's lesson
   review, so the evidence has questions to mark against.

## Summary

- **Pages:** 9 courses, 42 topics: 42 main pages + 111 problem types = **153 pages**:
  **117 calculators** and **36 layouts** (24 sorts, 12 sequences); **24 wait** (⏳) on a
  picture or engine need. Organic chemistry is mostly layouts (19 of 33 pages); every other
  course is mostly calculators.
- **Pictures (24 requests, HE-chemistry-P1–P24):** 4 new kinds or figures (`instrumentTrace`,
  `skeletal` with its card, `unitCell`, the `symmetryElements` explore figure) and 20 options
  on drawn kinds (`orbitalDiagram` ×4, `phScale` ×2, `chemDiagram` ×3, `gasPiston` ×2,
  `lewisStructure`, `vsepr`, `energyProfile`, `beaker`, `normalCurve`, `organelleEnergy`,
  `macromolecules`, `equilibriumChart`, `moleMap`/`reaction`).
- **Engine (E1–E15):** chemistry units and constants; data pickers; the quadratic with its
  physical root; critical-value tables; whole-number ratios; MO, Hückel and d-orbital filling;
  character tables; calculus notation (no symbolic integration); choice-switched relations;
  signed sequence spans; data lists; college number display; chemistry text in layout cards.
- **Research:** open textbooks (OpenStax Chemistry 2e and Organic Chemistry, Harvey's
  Analytical Chemistry 2.1, Biochemistry Free For All, LibreTexts, MIT OCW 5.111/5.112, 5.12,
  5.13, 5.60, 5.61, 5.07SC, 5.03/5.04, 5.35) for tables of contents and example kinds; 360
  reference questions (MIT OCW exams, AP Chemistry free response, Harvey's problems, the US
  and international olympiads), with the OpenStax and ACS limits named.
