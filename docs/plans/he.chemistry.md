# Direction plan: higher education, Chemistry (9 courses, 43 topics)

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
  problem type `he.chemistry.<course>#<i>~<slug>`. 154 pages is too many for `college.ts`: put
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
- **Layouts: 36 pages.** Sorts 26, sequences 10 (listed per topic). One right bin per card and
  one right order per sequence was checked for every card below. Explore figures are not used
  yet; two are requested (P18 symmetry, P20 pathways) to upgrade sorts later.
- **Data tables (engine need E3).** Many college pages pick a substance and read its constant
  (Kₐ, E°, bond enthalpies, Slater groups, t and Q critical values, Δₒ). Until E3 lands, such a
  page takes the constant as a typed value with a sensible default and its source named in an
  assumption ("Kₐ of ethanoic acid is 1.8 × 10⁻⁵ at 25 °C").
- **What the engine can't do yet** is listed under "Engine needs" (E1–E14); pages that cannot
  ship without one are marked ⏳ with the need. Pages that can ship with an interim picture
  name it ("interim") and the request that replaces it.
- **Question data.** No college questions are in `research/questions/` yet (`COVERAGE.md`), so
  every "Tests ask" table lists the common exam and textbook question types for the topic
  (OpenStax end-of-chapter kinds, MIT OCW exam kinds, AP Chemistry free-response kinds as the
  bridge level), read for their kinds only. Marks are against those types.
- **Page count:** 43 main + 111 problem types = **154 pages** (118 calculators, 36 layouts);
  28 wait on an engine or picture need (⏳).

## General Chemistry I — `he.chemistry.gen-chem-1`

Prerequisites `s.10.stoichiometry`, `s.10.gas-laws`. Textbooks: OpenStax Chemistry 2e ch. 3–9
(titles in `research/textbooks/toc/science/openstax-chemistry-2e.json`); MIT OCW 5.111.

### gen-chem-1#0 — Atomic structure and periodicity

- **Textbooks:** Chemistry 2e 6.1–6.5 (light, Bohr model, quantum theory, configurations,
  periodic variation); 5.111 lectures on the hydrogen atom and periodic trends.
- **Refresh:** `s.10.electrons-in-atoms` (configurations, the eV ladder), `s.10.periodic-trends`.
- **Tests ask:**

  | Question type                                         | Page                 | Mark   |
  | ----------------------------------------------------- | -------------------- | ------ |
  | wavelength, frequency, energy of a hydrogen line      | main                 | Solves |
  | energy per mole of photons (kJ/mol)                   | main                 | Solves |
  | de Broglie wavelength of an electron or a ball        | ~de-broglie          | Solves |
  | least uncertainty in speed from a position            | ~uncertainty         | Solves |
  | effective nuclear charge (Slater) and the trend       | ~zeff                | Solves |
  | explain an ionization-energy exception (Mg/Al, P/S)   | ~ionization-order    | Solves |

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

  | Question type                                        | Page                | Mark                |
  | ---------------------------------------------------- | ------------------- | ------------------- |
  | empirical formula from combustion analysis (C, H, O) | main                | Solves              |
  | molecular formula from the empirical formula and M   | ~molecular-formula  | Solves              |
  | water of hydration from a heating experiment         | ~hydrate            | Solves              |
  | volume of titrant to react (mole ratio ≠ 1)          | ~solution-stoich    | Solves (⏳ P24)     |
  | limiting reactant, percent yield                     | Grade 10 pages      | Solves (Refresh)    |

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

  | Question type                                   | Page          | Mark            |
  | ----------------------------------------------- | ------------- | --------------- |
  | molar mass from gas density                     | main          | Solves          |
  | real-gas pressure (van der Waals) vs ideal      | ~real-gas     | Solves (⏳ P10) |
  | rms speed and average kinetic energy            | ~kinetic      | Solves          |
  | gas collected over water                        | ~over-water   | Solves          |
  | volume of gas a reaction makes at T and P       | ~gas-stoich   | Solves (⏳ P24) |

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

  | Question type                                     | Page            | Mark              |
  | ------------------------------------------------- | --------------- | ----------------- |
  | ΔH per mole from a coffee-cup temperature rise    | main            | Solves            |
  | ΔU and ΔH of combustion from a bomb calorimeter   | ~bomb           | Solves (⏳ P15)   |
  | estimate ΔH from bond enthalpies                  | ~bond-enthalpy  | Solves (⏳ E3)    |
  | ΔH°rxn from ΔH°f, Hess's law                      | Grade 10 pages  | Solves (Refresh)  |

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

  | Question type                                         | Page            | Mark             |
  | ----------------------------------------------------- | --------------- | ---------------- |
  | shape, angle and hybridization of SF₄, XeF₄, PCl₅     | main            | Solves (⏳ P13)  |
  | formal charges; the best resonance structure          | ~formal-charge  | Solves (⏳ P12)  |
  | lattice energy from a Born–Haber cycle                | ~born-haber     | Solves           |
  | bond order and magnetism of O₂, N₂⁺ from MOs          | ~bond-order     | Solves (⏳ P3)   |

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

  | Question type                                         | Page            | Mark   |
  | ----------------------------------------------------- | --------------- | ------ |
  | concentration after t, time to reach a level, t½      | main            | Solves |
  | second-order: [A] at t, half-life depends on [A]₀     | ~second-order   | Solves |
  | zero-order: when it runs out                          | ~zero-order     | Solves |
  | order and k from a table of initial rates             | ~initial-rates  | Solves |
  | Eₐ from k at two temperatures; k at a new T           | ~arrhenius      | Solves |
  | which mechanism fits the observed rate law            | ~mechanism      | Solves |

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

  | Question type                                         | Page            | Mark   |
  | ----------------------------------------------------- | --------------- | ------ |
  | equilibrium concentrations from K (quadratic)         | main            | Solves |
  | convert Kc to Kp                                      | ~kp-kc          | Solves |
  | K of a reversed, scaled or added reaction             | ~manipulate-k   | Solves |
  | solubility with a common ion                          | ~common-ion     | Solves |

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

  | Question type                                      | Page            | Mark   |
  | -------------------------------------------------- | --------------- | ------ |
  | pH and percent ionization of a weak acid           | main            | Solves |
  | pH of a weak base                                  | ~weak-base      | Solves |
  | buffer pH; pH after adding strong acid or base     | ~buffer         | Solves |
  | pH of a salt solution                              | ~salt-ph        | Solves |
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

  | Question type                                     | Page            | Mark   |
  | ------------------------------------------------- | --------------- | ------ |
  | K from ΔG°, and ΔG° from K                        | main            | Solves |
  | ΔG under non-standard conditions; which way       | ~nonstandard    | Solves |
  | entropy of vaporization or fusion                 | ~phase-entropy  | Solves |
  | ΔS of the universe; is it spontaneous             | ~second-law     | Solves |

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

  | Question type                                       | Page                 | Mark            |
  | --------------------------------------------------- | -------------------- | --------------- |
  | cell potential at non-standard concentrations       | main                 | Solves          |
  | ΔG° and K from E°cell                               | ~free-energy-k       | Solves          |
  | mass plated by a current in a time                  | ~electrolysis        | Solves (⏳ P9)  |
  | voltage of a concentration cell                     | ~concentration-cell  | Solves          |

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

  | Question type                                        | Page                | Mark   |
  | ---------------------------------------------------- | ------------------- | ------ |
  | IUPAC name of a branched alkane                      | main                | Solves |
  | name a compound with two functional groups (suffix)  | ~functional-groups  | Solves |
  | degree of unsaturation from a formula                | ~unsaturation       | Solves |
  | which way an acid–base reaction lies; its K          | ~pka-equilibrium    | Solves |
  | rank acids by strength                               | ~acid-order         | Solves |

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

  | Question type                                         | Page               | Mark   |
  | ----------------------------------------------------- | ------------------ | ------ |
  | enantiomers, diastereomers, identical or constitutional | main             | Solves |
  | rank groups by CIP priority; assign R or S            | ~cip               | Partly (ranking; R/S needs P14) |
  | specific rotation; enantiomeric excess                | ~optical-rotation  | Solves |
  | percent of the equatorial chair conformer             | ~chair             | Solves |

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

  | Question type                                       | Page             | Mark            |
  | --------------------------------------------------- | ---------------- | --------------- |
  | predict SN1, SN2, E1 or E2 from the conditions      | main             | Solves          |
  | rank substrates by SN2 rate                         | ~sn2-order       | Solves          |
  | how the rate changes when [RX] or [Nu] changes      | ~rate-law        | Solves          |
  | read a reaction energy diagram (steps, intermediate)| ~energy-diagram  | Solves (⏳ P15) |

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

  | Question type                                         | Page            | Mark   |
  | ----------------------------------------------------- | --------------- | ------ |
  | where the new group goes (Markovnikov or not)         | main            | Solves |
  | syn or anti addition; which stereoisomer forms        | ~stereo         | Solves |
  | rings and π bonds from formula and H₂ uptake          | ~hydrogenation  | Solves |
  | deprotonate a terminal alkyne with NaNH₂?             | `organic-1#0~pka-equilibrium` | Solves (pKₐ 25 vs 38) |

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

  | Question type                                       | Page        | Mark   |
  | --------------------------------------------------- | ----------- | ------ |
  | how many H each signal stands for (integration)     | main        | Solves |
  | multiplicity and intensities from neighbors (n + 1) | ~splitting  | Solves |
  | convert Hz from TMS to δ (ppm) at a field           | ~splitting  | Solves |
  | which functional group a band shows                 | ~ir-bands   | Solves |
  | propose a structure from IR, NMR and the formula    | —           | No (a multi-clue puzzle; see "Not in the taxonomy") |

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

  | Question type                                         | Page          | Mark   |
  | ----------------------------------------------------- | ------------- | ------ |
  | aromatic, antiaromatic or nonaromatic                 | main          | Solves |
  | activating or deactivating; where the next group goes | ~directing    | Solves |
  | π energies of benzene; delocalization energy          | `physical-2#3~huckel` | Solves (⏳ P3) |
  | product of a nitration, bromination, acylation        | —             | Partly (needs P14 structures) |

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

  | Question type                                        | Page                    | Mark   |
  | ---------------------------------------------------- | ----------------------- | ------ |
  | product of a Grignard, hydride, Wittig, acetal       | main                    | Solves |
  | how much is hydrate (or enol) at equilibrium         | ~equilibrium-percent    | Solves |
  | steps of the aldol reaction in order                 | ~aldol                  | Solves |

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

  | Question type                                       | Page                 | Mark   |
  | --------------------------------------------------- | -------------------- | ------ |
  | rank derivatives by reactivity                      | main                 | Solves |
  | product of an acyl substitution                     | ~acyl-substitution   | Solves |
  | percent ionized at a pH; compare acid strengths     | ~ionized             | Solves |

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

  | Question type                                     | Page          | Mark   |
  | ------------------------------------------------- | ------------- | ------ |
  | rank amines by basicity                           | main          | Solves |
  | primary, secondary, tertiary or quaternary        | ~classify     | Solves |
  | which layer an amine is in at a pH                | ~extraction   | Solves |
  | percent protonated at pH 7.4                      | `organic-2#2~ionized` | Solves |

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

  | Question type                                       | Page            | Mark   |
  | --------------------------------------------------- | --------------- | ------ |
  | put the steps of a route in a working order         | main            | Solves |
  | overall yield of a multistep route                  | ~overall-yield  | Solves |
  | atom economy of a reaction                          | ~atom-economy   | Solves |
  | design a route from a target (retrosynthesis)       | —               | No (open-ended; a later explore page) |

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
  + ethanol (46.07) → ethyl ethanoate (88.11) + water: 83.0%; ethene + water → ethanol: 100%.
- **Verdict:** 3 pages (2 calculators, 1 sequence).

