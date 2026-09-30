# Direction plan: science grade 10 (chemistry, 17 skills)

Written from `.review/plans/s.10/brief.md`, `.review/plans/s.10/questions.md`, `docs/MODULE_GUIDE.md`
("Standards"), `docs/LAYOUTS.md`, `docs/EQUATION_INPUTS.md` (Grades 9–12 table), `docs/PICTURES.md`
(catalog table) and `research/textbooks/grades/10.md`. Every example below is original and was
worked by hand; no text or number is taken from a released question or a textbook. Constants
are the standard ones (N_A = 6.022 × 10²³ /mol, R = 0.0821 L·atm/(mol·K), 22.4 L/mol at STP,
c_water = 4.18 J/(g·°C), Kw = 1.0 × 10⁻¹⁴ at 25 °C, 931.5 MeV per u).

## Decisions

- **Notation.** Standard high-school chemistry notation: letters for quantities (P, V, n, T, m,
  M, q, ΔH, Eₐ, K, Q, [H⁺]), subscripts in formulas (H₂O, not H2O, in all text), charges as
  superscripts (Mg²⁺), nuclide symbols ²³⁸₉₂U, arrows → and ⇌. At most 10 values a page and
  35 words a sentence (standards.test.ts).
- **Units.** Every calculator page sets `unitSystems: ['metric']` (the drawn pictures write units
  as given). The registry (`src/engine/units.ts`) has no pressure, energy, amount or temperature
  dimension, so atm, kPa, mol, mol/L, g/mol, kJ, J, K, °C, eV, pm and u are fixed labels until
  engine need 3 lands; gas-law pages work in atm and K and say so in an assumption. mL and L
  convert today: keep rows on pages where the volume unit changes (molarity, dilution, titration).
- **Significant figures.** Examples are stated to their significant figures; the engine rounds
  display to 4 figures. The sig-fig rule is taught on one page (`s.10.measurement~sig-fig-math`),
  which waits on engine need 2; no other page depends on it.
- **Equation inputs** (Grades 9–12 table): balancing uses `{a:coef}`; the gram-to-mole factor
  uses the drawn `{m} g × {1 mol}/{{M} g} = {n} mol` (g.s10-mole-factor) rather than the table's
  `÷` form, since the chain is how the unit lesson writes it; `[H⁺] = 10^{−{p}}`; the nuclear
  equations use `^{A}_{Z}X`; the measurement factor uses `{a} km × {1000 m}/{1 km} = {b} m`.
  `s.10.molarity` main stays rows (its volume unit changes; EQUATION_INPUTS "Keep rows").
- **Sliders.** Every page on atomModel, orbitalDiagram, lewisStructure, vsepr, periodicTable
  trend and reaction limiting sets `sliders: true` (no handles), as the brief requires.
- **Layout pages (15):** `s.10.atomic-structure~models` (sequence), `s.10.periodic-trends~families`,
  `s.10.bonding~properties`, `s.10.bonding~bond-type`, `s.10.molecular-shape~imf`,
  `s.10.molecular-shape~polarity`, `s.10.reaction-types` (main, sort, drawn demo),
  `s.10.rates-equilibrium~shift`, `s.10.rates-equilibrium~rate-factors`,
  `s.10.acids-bases~classify`, `s.10.redox` (main, explore, drawn figure),
  `s.10.redox~oxidized-reduced`, `s.10.organic~functional-groups`, `s.10.nuclear-chemistry~reactions`
  (sorts unless named; `s.10.redox` is an explore), and `s.10.molecular-shape~water` (explore).
- **Not built as a calculator:** the hydrogen-bond demo (g.s10-molecular-shape-hydrogen-bonds)
  counts bonds = molecules − 1, which is the drawing's star arrangement, not chemistry; it is not
  a page. The metallic demo is kept (electrons freed = 3 × atoms for aluminum is true).
- **Pilots:** none exist for s.10 (`pilots.ts`, layouts). All pages are new in
  `src/data/modules/science/10.ts` and `layouts/science10.ts` (new file, registered in
  `layouts/index.ts`).
- **Question data:** 8 of the 17 released questions are filed under the wrong skill (see "Not
  in the taxonomy"); the tables below list each under the page that solves it.

### 1. s.10.measurement — Measurement, significant figures and dimensional analysis

- **Standard:** HSN-Q.A.1, HSN-Q.A.2, HSN-Q.A.3; NGSS practice 5 (mathematics and computational thinking).
- **Textbooks:** OpenStax Chemistry 2e ch. 1 (1.4–1.6); Glencoe ch. 1–2; HMH Science Dimensions Chemistry unit 1.
- **Tests ask:** no released questions. Common types:

  | Question type                                       | Page                 | Mark                     |
  | --------------------------------------------------- | -------------------- | ------------------------ |
  | Convert km to cm with a chain of factors            | main                 | Solves                   |
  | Convert a rate (km/h to m/s)                        | ~rate                | Solves                   |
  | Read a ruler to the estimated digit; count sig figs | ~ruler               | Solves                   |
  | Round a product or quotient to the fewest sig figs  | ~sig-fig-math        | Partly (waits on need 2) |
  | Accurate or precise? Percent error                  | ~accuracy            | Solves                   |
  | Scientific notation in a conversion                 | main (large results) | Solves                   |

- **Main — BUILD `s.10.measurement`:** unitChain chain, from g.s10-measurement-chain
  (`start: 'd', unit: 'km', factors: [1000 m/1 km, 100 cm/1 m], result: 'c'`). Values: distance
  d (km, 0.001–1000), length c (cm, 0.1–1 × 10⁸, `scientific: true`). Relation c = d × 1000 × 100.
  Assumptions: "A conversion factor equals 1, so multiplying by it changes the unit, not the
  amount." "Put the unit you want to cancel on the bottom of the factor." "Exact defined factors
  (1000 m in 1 km) never limit significant figures." Example: 2.5 km × 1000 m/1 km × 100 cm/1 m =
  250,000 cm = 2.5 × 10⁵ cm. startWith ['d'].
- **~factor — BUILD:** equationInput `{a} km × {1000 m}/{1 km} = {b} m` (g.s10-measurement-factor).
  a (0.001–1000 km), b = 1000a. Example 3.2 km → 3200 m. Use line: "Use this to change kilometers
  to meters with one conversion factor."
- **~rate — BUILD:** unitChain chain with `per: 'h'`, g.s10-measurement-rate: factors 1000 m/1 km
  and 1 h/3600 s; speed v (km/h, 1–1000), w (m/s) = v × 1000 ÷ 3600. Example 90 km/h → 25 m/s.
- **~ruler — BUILD:** unitChain ruler, g.s10-measurement-ruler (`division: 0.1, unit: 'cm',
span: 10`). start s (0–9 cm, `multipleOf: 0.01`), end e (0.01–10 cm, `multipleOf: 0.01`),
  length L = e − s. Assumption: "Read one digit past the smallest mark; that last digit is
  estimated and still significant." Example s 1.00 cm, e 7.46 cm → L 6.46 cm, 3 significant
  figures. (g.s10-measurement-ruler-coarse, division 1 cm, is its second assumption's picture in
  the review screenshots only: one page.)
- **~sig-fig-math — BUILD (waits on need 2):** density from a mass (g) and a volume (cm³):
  D = m ÷ V, then rounded to the fewer significant figures of m and V. Values m, V, D (unrounded),
  D₂ (reported, derived). Example 12.47 g ÷ 4.2 cm³ = 2.969… → 3.0 g/cm³ (2 figures). Picture:
  unitChain chain with one factor (m over V). Assumptions give the rule for × ÷ and for + −
  (fewest decimal places).
- **~accuracy — BUILD:** unitChain target, g.s10-measurement-accurate-precise: trials a, b, c
  (g/cm³), accepted t, mean m = (a + b + c) ÷ 3, percent error e = |m − t| ÷ t × 100.
  Assumptions: "Accurate means the mean is close to the accepted value." "Precise means the
  trials are close to each other." Example t 2.70 g/cm³ (aluminum), trials 2.68, 2.70, 2.69 →
  mean 2.69, error 0.37%: accurate and precise. The other two target demos are its screenshots.
- **Verdict:** 6 pages (1 waits on need 2); 5 of 6 common types solved.

### 2. s.10.atomic-structure — Atomic structure and isotopes

- **Standard:** HS-PS1-1; HS-PS1-8 (isotopes, in part).
- **Textbooks:** OpenSciEd Chemistry C.2, C.5; OpenStax ch. 2 (2.1–2.3), 6, 21.1; Glencoe ch. 4, 5, 24; HMH unit 2; Savvas units 1, 17.
- **Tests ask:**

  | Question                                                  | Page                                                        | Mark                                                                               |
  | --------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
  | NAEP-2009-12S9-#1 (which particle is a negative ion)      | ~ions                                                       | Solves                                                                             |
  | NAEP-2000-12S9-#12 (sketch an atom's parts)               | main (picture labels nucleus, protons, neutrons, electrons) | Solves                                                                             |
  | NAEP-2000-12S9-#13 (atom model vs Solar System model)     | ~models (Bohr stage)                                        | Partly: the stage text names one likeness and one difference; add a second of each |
  | Mass number and neutrons of an isotope (common)           | main                                                        | Solves                                                                             |
  | Average atomic mass from abundances (common)              | ~average-mass                                               | Solves                                                                             |
  | NAEP-2000-12S11-#2, NAEP-2009-12S9-#10, NAEP-2009-12S9-#2 | filed wrong: s.10.nuclear-chemistry                         | —                                                                                  |

- **Main — BUILD `s.10.atomic-structure`:** atomModel, g.s10-atomic-structure-carbon, fields
  `protons: 'p', neutrons: 'n', electrons: 'e', mass: 'A', charge: 'q'`, `sliders: true`. Values:
  protons p (1–54, integer), neutrons n (0–90, integer), electrons e (0–54, integer), mass number
  A = p + n (derived), charge q = p − e (derived). Assumptions: "The number of protons names the
  element." "Isotopes of an element differ only in neutrons, so only the mass number changes."
  "Electrons have almost no mass, so they are left out of the mass number." Example aluminum-27:
  p 13, n 14, e 13 → A 27, q 0; changing n to 15 shows the isotope (g.s10-atomic-structure-isotope
  as the second screenshot). startWith ['p', 'n', 'e'].
- **~ions — BUILD:** atomModel, g.s10-atomic-structure-anion; same values. Example sulfide ion:
  p 16, n 16, e 18 → A 32, q −2 (S²⁻). Use line: "Use this to find an ion's charge from its
  protons and electrons, or the electrons from its charge."
- **~average-mass — BUILD (picture waits on need 7):** average atomic mass = m₁ × f₁ + m₂ × f₂ with
  f₂ = 100% − f₁. Values m₁ (u), m₂ (u), f₁ (%), f₂ (%, derived), average (u). Example boron:
  10.01 u × 19.9% + 11.01 u × 80.1% = 1.99 + 8.82 = 10.81 u.
- **~models — BUILD (sequence):** stages in order, each span the years the model stood before
  the next: Dalton's solid sphere (1803, 94 years) → Thomson's plum pudding, electrons found
  (1897, 14) → Rutherford's nucleus from gold foil (1911, 2) → Bohr's energy levels (1913, 13) →
  the quantum (electron cloud) model (1926, still used). Spans add to 123 years. Card figures:
  text cards until need 13 (model icons).
- **Verdict:** 4 pages; 4 of 5 in-skill questions solved, 1 partly.

### 3. s.10.electrons-in-atoms — Electrons in atoms: energy levels, electron configuration and light

- **Standard:** HS-PS1-1; HS-PS4-1 (c = λf); HS-PS4-3 (photons, in part).
- **Textbooks:** OpenStax ch. 6 (6.1–6.4); Glencoe ch. 5; Savvas unit 1 (1.3–1.5).
- **Tests ask:** no released questions. Common types:

  | Question type                                              | Page                    | Mark   |
  | ---------------------------------------------------------- | ----------------------- | ------ |
  | Write the configuration of an element; noble-gas shorthand | main                    | Solves |
  | Count unpaired or valence electrons                        | main                    | Solves |
  | Configuration of an ion (Fe³⁺)                             | ~ions                   | Solves |
  | Energy and wavelength of an emission line (n = 3 → 2)      | ~emission               | Solves |
  | Frequency and energy of a photon from its wavelength       | ~photon                 | Solves |
  | Exceptions (Cr, Cu)                                        | main (allowed Z 24, 29) | Solves |

- **Main — BUILD `s.10.electrons-in-atoms`:** orbitalDiagram boxes, g.s10-electrons-in-atoms-oxygen
  (`element: 'p', unpaired: 'u'`), `sliders: true`. Values: atomic number Z (1–54, integer),
  unpaired electrons u (derived, "unpaired electrons of Z = {p}"), valence electrons v (derived,
  "valence electrons of Z = {p}"). Assumptions: "Fill the lowest energy first: 4s fills before
  3d." "One arrow in each box of a subshell before any pairs (Hund's rule)." "A pair points up
  and down (Pauli)." "Chromium and copper move one 4s electron to 3d." Example oxygen Z 8:
  1s² 2s² 2p⁴, u 2, v 6. startWith ['Z']. Iron, chromium and xenon demos are its screenshots.
  (g.s10-electrons-in-atoms-valence, an atomModel, is folded in: the boxes teach the same count.)
- **~ions — BUILD:** orbitalDiagram boxes with electrons, g.s10-electrons-in-atoms-ion. Values Z,
  electrons e (0–54), charge q = Z − e, u. Assumption: "A positive ion loses from the highest
  shell first, so iron loses 4s before 3d." Example Fe³⁺: Z 26, e 23, q +3, [Ar] 3d⁵, u 5.
- **~emission — BUILD:** orbitalDiagram ladder, g.s10-electrons-in-atoms-balmer. Values upper u
  (2–8), lower l (1–7), E = 13.6 × (1/l² − 1/u²) eV, λ = 1240 ÷ E nm. Page limit "the lower level
  is below the upper level" shown as a limit, not a relation. Example 3 → 2: E = 13.6 × 5/36 =
  1.89 eV, λ = 656 nm (red).
- **~photon — BUILD:** spectrum `photon` (H70). Values λ (nm), f = c ÷ λ, E = h × f.
  Example 656 nm → f = 4.57 × 10¹⁴ Hz, E = 3.03 × 10⁻¹⁹ J (matches ~emission's 1.89 eV).
- **Verdict:** 4 pages; 6 of 6 common types solved.

### 4. s.10.periodic-trends — The periodic table and periodic trends

- **Standard:** HS-PS1-1, HS-PS1-2.
- **Textbooks:** OpenSciEd C.2; OpenStax 2.5, 6.5; Glencoe ch. 6; HMH unit 2 (2.2); Savvas unit 2.
- **Tests ask:** no released questions. Common types:

  | Question type                                        | Page               | Mark                |
  | ---------------------------------------------------- | ------------------ | ------------------- |
  | Which atom is larger (across a period, down a group) | main               | Solves              |
  | Which has the higher first ionization energy         | ~ionization        | Solves              |
  | Which is more electronegative                        | ~electronegativity | Solves              |
  | Name the family (alkali metal, halogen, noble gas)   | ~families          | Solves              |
  | Explain a trend by nuclear charge and shielding      | main assumptions   | Partly (words only) |

- **Main — BUILD `s.10.periodic-trends`:** periodicTable trend radius, g.s10-periodic-trends-radius
  (`element: 'p', trend: { property: 'radius', value: 'r', compare: 'c', compareValue: 's' }`).
  Values: atomic number p and second atom c (`allowed` Z with data, 1–54 as the demo), radius r
  and s (pm, derived, "atomic radius of Z = {p}"), difference d = r − s (pm). Assumptions: "Across
  a period, more protons pull the same shell closer, so atoms shrink." "Down a group, each new
  shell makes atoms larger." Example Na (11) 155 pm, Cl (17) 99 pm → d 56 pm. startWith ['p','c'].
- **~ionization — BUILD:** same with `property: 'ionization'` (g.s10-periodic-trends-ionization);
  kJ/mol. Example Mg 738, Ca 590 → d 148 kJ/mol: lower down the group.
- **~electronegativity — BUILD:** `property: 'electronegativity'`
  (g.s10-periodic-trends-electronegativity); no unit; He, Ne, Ar not allowed. Example F 3.98,
  N 3.04 → d 0.94. (g.s10-periodic-trends-extremes is its screenshot.)
- **~families — BUILD (sort):** bins alkali metals, alkaline earth metals, transition metals,
  halogens, noble gases. Cards (one atom each, `molecule` card figure from the symbol): Li, K, Cs;
  Mg, Ca, Ba; Fe, Cu, Zn; F, Cl, I; Ne, Ar, Kr. Sentence: "Elements in a group share their number
  of valence electrons, so they react alike."
- **Verdict:** 4 pages; 4 of 5 common types solved, 1 partly.

### 5. s.10.bonding — Ionic, covalent and metallic bonding

- **Standard:** HS-PS1-1, HS-PS1-2, HS-PS1-3.
- **Textbooks:** OpenSciEd C.2; OpenStax 2.6–2.7, 7.1–7.3, ch. 8, 10.5; Glencoe ch. 7, 8, 12; HMH unit 3; Savvas units 3–4.
- **Tests ask:**

  | Question                                                      | Page                              | Mark                                        |
  | ------------------------------------------------------------- | --------------------------------- | ------------------------------------------- |
  | NAEP-2005-12S14-#2 (which observation shows a solid is ionic) | ~properties                       | Solves                                      |
  | Lewis structure and lone pairs of a small molecule (common)   | main                              | Solves                                      |
  | Formula of an ionic compound from its ions (common)           | ~ionic                            | Solves (Mg–Cl only; others wait on need 12) |
  | Bond polarity from electronegativity (common)                 | ~polarity                         | Solves                                      |
  | NAEP-2009-12S10-#14, NAEP-2009-12S9-#4, NAEP-2019-12S7-#18    | filed wrong: s.10.molecular-shape | —                                           |

- **Main — BUILD `s.10.bonding`:** lewisStructure molecule, g.s10-bonding-water, `atoms: { H: 'h',
C: 'c', N: 'n', O: 'o' }`, `valence: 'V', bonding: 'b', lone: 'l'`, `sliders: true`. Values: H
  atoms h (0–4), C atoms c (0–1), N atoms n (0–2), O atoms o (0–2), valence electrons
  V = h + 4c + 5n + 6o, shared pairs b = (2h + 8(c + n + o) − V) ÷ 2 (electrons needed minus
  electrons on hand, halved; the lesson review's change from a lookup of the drawn structure),
  lone pairs l, relation V = 2 × (b + l). Assumptions: "Each atom but hydrogen ends with 8 electrons around it;
  hydrogen with 2." "A shared pair counts for both atoms." "Two or three shared pairs make a
  double or triple bond." Example H₂O: h 2, o 1 → V 8, b 2, l 2. Other drawn counts: NH₃ (V 8, b 3,
  l 1), CH₄ (8, 4, 0), CO₂ (16, 4, 4), HCN (10, 4, 1). Counts with no drawing wait on need 12.
  startWith ['h', 'o'].
- **~ionic — BUILD:** lewisStructure ionic, g.s10-bonding-ionic-magnesium-chloride (`metal: 'Mg',
nonmetal: 'Cl', metals: 'a', nonmetals: 'b', transferred: 't'`). Values a (1–3), b = 2a,
  t = 2a. Assumption: "The total positive charge equals the total negative charge." Example
  MgCl₂: a 1, b 2, t 2. Aluminum oxide (Al₂O₃: 2, 3, 6) is its second screenshot.
- **~metallic — BUILD:** lewisStructure metallic, g.s10-bonding-metallic-aluminum: atoms n (1–24),
  freed electrons e = 3n. Example 6 Al → 18 electrons. Assumption names why metals conduct and bend.
- **~polarity — BUILD:** periodicTable electronegativity trend with compare. Values Z₁, Z₂
  (allowed with data), EN₁, EN₂ (derived), ΔEN = |EN₁ − EN₂|. Assumption: "Under about 0.4 the
  bond is nonpolar, up to about 1.7 polar covalent, above that mostly ionic; books draw the lines
  a little differently." Example H–Cl: 2.20, 3.16 → 0.96, polar covalent.
- **~properties — BUILD (sort):** bins ionic compound, molecular compound, metal. Cards: "Conducts
  when melted or dissolved, not as a solid", "Shatters along flat faces when struck", "Ions held
  in a repeating lattice" (ionic); "Does not conduct as a solid or when melted", "Many are gases or
  liquids at room temperature", "Made of separate molecules" (molecular); "Conducts as a solid",
  "Hammers into thin sheets", "Ions in a sea of moving electrons" (metal).
- **~bond-type — BUILD (sort):** bins ionic, covalent, metallic; `molecule` cards: NaCl, MgO, KBr;
  H₂O, CO₂, CH₄, Cl₂; Cu, Al, Fe. Sentence: "A metal with a nonmetal bonds ionically; nonmetals
  share; metals pool their electrons."
- **Verdict:** 6 pages; 4 of 4 in-skill questions solved.

### 6. s.10.molecular-shape — Molecular shape, polarity and intermolecular forces

- **Standard:** HS-PS1-3, HS-PS2-6.
- **Textbooks:** OpenStax 7.6, 10.1–10.2; Glencoe ch. 8, 12; Savvas units 3 (3.4), 4.
- **Tests ask:**

  | Question                                                        | Page      | Mark                                         |
  | --------------------------------------------------------------- | --------- | -------------------------------------------- |
  | NAEP-2019-12S7-#18 (why ice floats)                             | ~water    | Solves                                       |
  | NAEP-2009-12S10-#14 (why water dissolves many substances)       | ~water    | Partly: needs the dissolving scene (need 10) |
  | NAEP-2009-12S9-#4 (which liquid evaporated more; boiling point) | ~imf      | Solves                                       |
  | Shape and bond angle from Lewis structure (common)              | main      | Solves                                       |
  | Is the molecule polar (common)                                  | ~polarity | Solves                                       |

- **Main — BUILD `s.10.molecular-shape`:** vsepr shape, g.s10-molecular-shape-water
  (`bonded: 'b', lone: 'l', angle: 'a', polar: true`), `sliders: true`. Values: bonded atoms b
  (2–4), lone pairs l (0–2), electron domains d = b + l, bond angle a (°, derived, "bond angle with
  {b} bonded atoms and {l} lone pairs"). Page limit "d is at most 4" shown as a limit. Assumptions:
  "Electron domains spread as far apart as they can." "Lone pairs push harder than bonds, so
  angles shrink below 109.5°." "A molecule is polar when its bond dipoles don't cancel." Example
  H₂O: b 2, l 2 → d 4, bent, 104.5°. Ammonia, methane, trigonal planar, linear and bent-three
  demos are its screenshots. startWith ['b', 'l'].
- **~polarity — BUILD (sort):** bins polar, nonpolar. Cards: H₂O, NH₃, HCl, CHCl₃ (polar); CO₂,
  CH₄, BF₃, CCl₄ (nonpolar). Sentence: "Polar bonds in a symmetric shape cancel." Card figure
  `molecule`; formulas it can't draw wait on need 9.
- **~imf — BUILD (sort):** bins by strongest attraction between molecules: London dispersion,
  dipole–dipole, hydrogen bonding. Cards: CH₄, N₂, CO₂ (dispersion); HCl, H₂S, CH₂O (dipole);
  H₂O, NH₃, HF, CH₃OH (hydrogen bonding). Sentence: "Stronger attractions mean a higher boiling
  point and slower evaporation."
- **~water — BUILD (explore):** figure `molecules` (layouts/chemFigures.tsx). Scenes: "Ice" (state
  solid, open hexagons, each molecule hydrogen-bonded to four); "Liquid water" (state liquid,
  bonds break and re-form, molecules closer: ice is less dense, so it floats); "Salt in water"
  (Na⁺ ringed by water's O ends, Cl⁻ by H ends: waits on need 10). The two hbonds demos are
  reference for the ice scene only.
- **Verdict:** 4 pages; 4 of 5 questions solved, 1 partly (need 10).

### 7. s.10.reaction-types — Chemical equations: balancing and types of reactions

- **Standard:** HS-PS1-2, HS-PS1-7.
- **Textbooks:** OpenStax 4.1–4.2; Glencoe ch. 9; HMH unit 4 (4.1); Savvas units 6, 12.
- **Tests ask:**

  | Question                                                                           | Page         | Mark                                                  |
  | ---------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------- |
  | NAEP-2005-12S14-#7 (balance a hydrocarbon's combustion; filed under stoichiometry) | ~combustion  | Partly: the page is propane; any CₓHᵧ waits on need 1 |
  | Classify a reaction by type (common)                                               | main         | Solves                                                |
  | Balance a synthesis equation (common)                                              | ~synthesis   | Solves                                                |
  | Balance a single replacement (common)                                              | ~replacement | Solves                                                |
  | Predict products (common)                                                          | —            | No: see "Not in the taxonomy"                         |

- **Main — BUILD `s.10.reaction-types` (sort):** promote g.s10-reaction-types-sort. Bins synthesis,
  decomposition, single replacement, double replacement, combustion, each card `{ kind: 'icon',
icon: '<bin> reaction' }` as the demo, plus equation cards: 2Na + Cl₂ → 2NaCl (not 2Mg + O₂ → 2MgO, which is also a combustion); 2H₂O₂ → 2H₂O + O₂;
  Fe + CuSO₄ → FeSO₄ + Cu; AgNO₃ + NaCl → AgCl + NaNO₃; C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O (each
  balanced, checked). Sentence: "The pattern of what joins, splits or swaps names the type."
- **~combustion — REBUILT after the lesson review** as the general alkane page (x carbons,
  y = 2x + 2, a = 1 or 2, c = ax, d = ay/2, b = c + d/2; `lewisStructure` hydrocarbon picture),
  with `~combustion-alkene` beside it (y = 2x; C₅H₁₀: 2, 15, 10, 10). The original propane page:
- **~combustion (first build) — BUILD:** equationInput `{a:coef} C₃H₈ + {b:coef} O₂ → {c:coef} CO₂ + {d:coef}
H₂O` (g.s10-reaction-types-coefficient-one) and reaction picture with the atom tally. Value a
  (1–6, integer), b = 5a, c = 3a, d = 4a. Steps balance C, then H, then O last. Example a 1:
  C₃H₈ + 5O₂ → 3CO₂ + 4H₂O (C 3 = 3, H 8 = 8, O 10 = 6 + 4). After need 1: carbons x (1–8),
  hydrogens y (even, ≤ 2x + 2), a = 1 when y is a multiple of 4, else 2; b = a(x + y/4), c = ax,
  d = ay/2 (ethane: 2, 7, 4, 6).
- **~synthesis — BUILD:** `{a:coef} Al + {b:coef} O₂ → {c:coef} Al₂O₃`; a (`multipleOf: 4`),
  b = 3a/4, c = a/2. Example 4Al + 3O₂ → 2Al₂O₃ (Al 4 = 4, O 6 = 6).
- **~replacement — BUILD:** `{a:coef} Zn + {b:coef} HCl → {c:coef} ZnCl₂ + {d:coef} H₂`; a, b = 2a,
  c = a, d = a. Example Zn + 2HCl → ZnCl₂ + H₂. Check at build that the reaction picture draws
  Zn and ZnCl₂; if not, need 1.
- **Verdict:** 4 pages; 3 of 5 solved, 1 partly (need 1), 1 no.

### 8. s.10.mole — The mole and molar mass

- **Standard:** HS-PS1-7; HSN-Q.A.1.
- **Textbooks:** OpenSciEd C.3; OpenStax 3.1–3.2; Glencoe ch. 10; Savvas unit 5 (5.1–5.3).
- **Tests ask:** no released questions. Common types:

  | Question type                           | Page        | Mark                             |
  | --------------------------------------- | ----------- | -------------------------------- |
  | Grams to moles to particles             | main        | Solves                           |
  | Molar mass of a compound                | ~molar-mass | Solves                           |
  | Percent composition                     | ~molar-mass | Solves                           |
  | Grams to moles with the factor written  | ~factor     | Solves                           |
  | Liters of gas at STP to moles and grams | ~gas-volume | Solves                           |
  | Empirical formula from percents         | ~empirical  | Solves (ratio rounding: need 11) |

- **Main — BUILD `s.10.mole`:** moleMap, g.s10-mole-map-grams (`moles: 'n', mass: 'm', molarMass:
'M', particles: 'N'`). Values: mass m (g, 0.001–10,000), molar mass M (g/mol, 1–500), moles n,
  particles N (`scientific: true`, min 6 × 10¹⁹). Relations m = n × M, N = 6.022 × 10²³ × n.
  Assumptions: "One mole is 6.022 × 10²³ particles." "Molar mass is the formula's atomic masses
  added, in g/mol." Example water: 9.01 g ÷ 18.02 g/mol = 0.500 mol → 3.011 × 10²³ molecules.
  startWith ['m', 'M']. g.s10-mole-map-all and -large are its screenshots.
- **~molar-mass — BUILD:** pieChart (drawn, Grade 6) of mass by element. Values C atoms c (0–20),
  H atoms h (0–40), O atoms o (0–20), M = 12.01c + 1.008h + 16.00o, percents pC, pH, pO (each
  element's mass ÷ M × 100). Example glucose C₆H₁₂O₆: 72.06 + 12.10 + 96.00 = 180.16 g/mol;
  40.00% C, 6.71% H, 53.29% O.
- **~factor — BUILD:** equationInput `{m} g × {1 mol}/{{M} g} = {n} mol` (g.s10-mole-factor).
  Example 22.0 g CO₂ × 1 mol/44.01 g = 0.500 mol.
- **~gas-volume — BUILD:** moleMap, g.s10-mole-map-gas, `formula: 'O2'`: n, m = 32.00n,
  N, V = 22.4n. Assumption: "22.4 L per mole holds only for a gas at 0 °C and 1 atm (STP)."
  Example 11.2 L → 0.500 mol → 16.0 g, 3.011 × 10²³ molecules.
- **~empirical — BUILD:** pieChart by percent. Values pC, pH, pO (%), moles in 100 g
  (pC ÷ 12.01 …), smallest, the three ratios (derived), rounded formula (need 11). Example
  40.0% C, 6.7% H, 53.3% O → 3.33, 6.65, 3.33 mol → 1 : 2.00 : 1 → CH₂O (glucose's empirical
  formula, tying back to ~molar-mass).
- **Verdict:** 5 pages; 6 of 6 common types solved (one waits on need 11 for the ratio line).

### 9. s.10.stoichiometry — Stoichiometry and limiting reactants

- **Standard:** HS-PS1-7.
- **Textbooks:** OpenSciEd C.3; OpenStax 4.3–4.5; Glencoe ch. 9, 11; HMH unit 4; Savvas units 6–7.
- **Tests ask:**

  | Question                                           | Page                             | Mark            |
  | -------------------------------------------------- | -------------------------------- | --------------- |
  | NAEP-2005-12S14-#7                                 | filed wrong: s.10.reaction-types | —               |
  | Grams of product from grams of reactant (common)   | main                             | Solves          |
  | Limiting reactant from particles or moles (common) | ~limiting                        | Solves          |
  | Limiting reactant from grams (common)              | ~limiting-grams                  | No until need 4 |
  | Percent yield (common)                             | ~percent-yield                   | Solves          |
  | Mole ratio from coefficients (common)              | main                             | Solves          |

- **Main — BUILD `s.10.stoichiometry`:** moleMap with second, from g.s10-stoichiometry-grams-to-grams,
  set to N₂ + 3H₂ → 2NH₃: `formula: 'H2', moles: 'n', mass: 'm', second: { formula: 'NH3', ratio:
[3, 2], moles: 'p', mass: 'q' }`. Values m (g H₂), n = m ÷ 2.016, p = n × 2/3, q = p × 17.03.
  Assumptions: "Coefficients count moles, not grams." "Always go through moles: grams → moles →
  mole ratio → moles → grams." Example 6.048 g H₂ → 3.000 mol → 2.000 mol NH₃ → 34.06 g.
  startWith ['m'].
- **~limiting — BUILD:** reaction with limiting, g.s10-stoichiometry-limiting-ammonia: amounts a (N₂
  molecules, 0–12), b (H₂, 0–12), runs r = smaller of a ÷ 1 and b ÷ 3 rounded down, NH₃ made 2r,
  left x = a − r, y = b − 3r. Example a 3, b 6 → r 2, 4 NH₃, 1 N₂ left, H₂ limiting. Water and
  methane demos are its screenshots.
- **~limiting-grams — BUILD (waits on need 4):** masses of N₂ and H₂ → moles → NH₃ from each → the
  smaller is the yield. Example 28.02 g N₂ (1.000 mol) and 5.04 g H₂ (2.500 mol): 2.000 vs
  1.667 mol NH₃ → H₂ limits, 28.38 g NH₃.
- **~percent-yield — BUILD:** percentBar (drawn, Grade 6). Values theoretical t (g), actual y (g),
  percent p = y ÷ t × 100. Example 27.2 g of 34.06 g → 79.9%. Page limit "actual is at most
  theoretical" as a limit.
- **Verdict:** 4 pages (1 waits on need 4); 4 of 5 common types solved.

### 10. s.10.gas-laws — Gases and the gas laws (PV = nRT)

- **Standard:** HS-PS3-2 (particle motion); HSN-Q.A.1. (Gas laws are in state chemistry standards, not one NGSS PE.)
- **Textbooks:** OpenStax ch. 9 (9.1–9.5); Glencoe ch. 13; Savvas unit 9.
- **Tests ask:**

  | Question                                                | Page               | Mark                                     |
  | ------------------------------------------------------- | ------------------ | ---------------------------------------- |
  | NAEP-2000-12S11-#7 (equal volumes hold equal molecules) | main               | Solves (assumption says it)              |
  | NAEP-2000-12S11-#11 (which gas leaks faster)            | ~effusion          | No until need 6                          |
  | NAEP-2005-12S13-#6 (boiling at altitude)                | —                  | No: vapor pressure is not taught (see G) |
  | Ideal gas law, find P (common)                          | main               | Solves                                   |
  | Boyle, Charles, Gay-Lussac, combined (common)           | ~boyle … ~combined | Solves                                   |

- **Main — BUILD `s.10.gas-laws`:** gasPiston ideal, g.s10-gas-laws-ideal (`pressure: 'P', volume:
'V', temperature: 'T', moles: 'n', keep: ['n', 'T']`). Values P (atm, 0.01–200), V (L, 0.01–
  1000), n (mol, 0.001–100), T (K, 1–2000); R = 0.0821 L·atm/(mol·K) is a constant. Relation
  P × V = n × R × T. Assumptions: "Temperature must be in kelvins: add 273 to °C." "Equal volumes
  of any gases at the same T and P hold the same number of particles." "Real gases stray from
  this at high pressure and low temperature." Example 2.00 mol at 300 K in 24.6 L → P = 2.00 atm.
  startWith ['n', 'T', 'V']. g.s10-gas-laws-ideal-hot is its screenshot.
- **~boyle — BUILD:** gasPiston boyle, g.s10-gas-laws-boyle: P₁V₁ = P₂V₂. Example 1.00 atm,
  6.0 L → 3.0 L gives 2.0 atm.
- **~charles — BUILD:** g.s10-gas-laws-charles: V₁/T₁ = V₂/T₂. Example 2.00 L at 300 K → 450 K
  gives 3.00 L.
- **~gay-lussac — BUILD:** g.s10-gas-laws-gay-lussac: P₁/T₁ = P₂/T₂. Example a tire at 2.00 atm,
  280 K warms to 308 K → 2.20 atm.
- **~combined — BUILD:** g.s10-gas-laws-combined: P₁V₁/T₁ = P₂V₂/T₂. Example 1.00 atm, 5.00 L,
  300 K → 2.00 atm, 360 K gives 3.00 L.
- **~effusion — BUILD (waits on need 6):** Graham's law, rate₁ ÷ rate₂ = √(M₂ ÷ M₁). Values M₁,
  M₂ (g/mol), ratio. Example H₂ (2.016) vs O₂ (32.00) → 3.98 times faster.
- **Verdict:** 6 pages (1 waits on need 6); 3 of 5 questions solved, 2 no.

### 11. s.10.molarity — Solutions: solubility, concentration and molarity

- **Standard:** HS-PS1-3 (dissolving), HSN-Q.A.1. (Molarity is a state chemistry standard.)
- **Textbooks:** OpenStax 3.3–3.4, 11.1–11.3; Glencoe ch. 14; HMH unit 3 (3.2); Savvas units 4 (4.6), 5 (5.4).
- **Tests ask:** no released questions. Common types:

  | Question type                             | Page        | Mark       |
  | ----------------------------------------- | ----------- | ---------- |
  | Molarity from moles and volume            | main        | Solves     |
  | Molarity from grams and mL                | ~from-grams | Solves     |
  | Dilution (M₁V₁ = M₂V₂)                    | ~dilution   | Solves     |
  | Read a solubility curve; saturated or not | ~solubility | Solves     |
  | Freezing-point depression                 | —           | No (see G) |

- **Main — BUILD `s.10.molarity`:** beaker molarity, g.s10-molarity-moles-volume (`solution: { mode:
'molarity', moles: 'n', volume: 'V', molarity: 'M', solute: 'NaCl' }`), rows (V in L or mL).
  Values n (mol, 0.0001–10), V (L, 0.001–10), M (mol/L). Relation M = n ÷ V. Assumptions:
  "Molarity is moles of solute per liter of solution, not of water." "Change mL to L first."
  Example 0.50 mol in 2.0 L → 0.25 M. startWith ['n', 'V']. g.s10-molarity-concentrated is its
  screenshot.
- **~from-grams — BUILD:** g.s10-molarity-from-grams: m (g), molar mass (g/mol), n = m ÷ molar
  mass, V, M. Example 5.844 g NaCl ÷ 58.44 g/mol = 0.1000 mol in 250.0 mL → 0.4000 M.
- **~dilution — BUILD:** beaker dilution, g.s10-molarity-dilution: M₁V₁ = M₂V₂, water w = V₂ − V₁.
  Example 2.00 M, 50.0 mL diluted to 0.500 M → V₂ 200 mL, add 150 mL water.
- **~solubility — BUILD:** beaker solubility, g.s10-molarity-solubility (`salt: 'KNO3',
temperature: 'T', amount: 'm', solubility: 's', others: ['NaCl', 'KCl']`). Values T (0–100 °C),
  m (g per 100 g water), s (derived, "solubility of KNO₃ at {T} °C"), room r = s − m (negative:
  that much settles out). Example 40 °C, 50 g → the curve reads about 64 g, so unsaturated, 14 g
  more dissolves (check the value against the drawn table at build). -excess is its screenshot.
- **Verdict:** 4 pages; 4 of 5 common types solved.

### 12. s.10.thermochemistry — Thermochemistry: heat, enthalpy and calorimetry

- **Standard:** HS-PS1-4, HS-PS3-1, HS-PS3-4.
- **Textbooks:** OpenSciEd C.1, C.5; OpenStax ch. 5, ch. 16; Glencoe ch. 15; HMH unit 4 (4.3); Savvas unit 8.
- **Tests ask:**

  | Question                                               | Page           | Mark                                        |
  | ------------------------------------------------------ | -------------- | ------------------------------------------- |
  | NAEP-2005-12S14-#9 (source of heat when propane burns) | main           | Solves (assumption: energy stored in bonds) |
  | NAEP-2009-12S10-#12 (which cup releases more heat)     | ~calorimetry   | Solves                                      |
  | NAEP-2019-12S7-#1 (flat part of a heating curve)       | ~heating-curve | Solves                                      |
  | ΔH from heats of formation (common)                    | ~formation     | No until need 5                             |
  | Hess's law (common)                                    | ~hess          | No until need 5                             |

- **Main — BUILD `s.10.thermochemistry`:** energyProfile, g.s10-thermochemistry-exothermic
  (`reactants: 'Hr', products: 'Hp', activation: 'Ea', deltaH: 'dH', reverse: 'Er', keep:
['Hr', 'Hp']`). Values Hr, Hp, Eₐ (kJ), ΔH = Hp − Hr, reverse barrier = Eₐ − ΔH. Assumptions:
  "Energy is stored in chemical bonds; breaking bonds takes energy, forming them releases it."
  "ΔH below zero is exothermic: the surroundings warm." "Only differences matter; the zero of
  enthalpy is chosen." Example Hr 200 kJ, Hp 110 kJ, Eₐ 80 kJ → ΔH −90 kJ, peak 280 kJ, reverse
  170 kJ. startWith ['Hr', 'Hp', 'Ea']. -endothermic is its screenshot.
- **~calorimetry — BUILD:** energyProfile calorimeter, g.s10-thermochemistry-calorimeter: m (g),
  c 4.18 J/(g·°C), T₁, T₂, ΔT = T₂ − T₁, q = m × c × ΔT. Example 100.0 g water 21.0 → 27.5 °C:
  q = 2717 J = 2.72 kJ.
- **~cold-pack — BUILD:** energyProfile calorimeter, g.s10-thermochemistry-cold-pack: as
  ~calorimetry plus q_rxn = −q and ΔH = q_rxn ÷ n (8 values). Example 0.100 mol NH₄NO₃ in 100.0 g
  water, 22.0 → 15.9 °C: q = −2550 J, q_rxn +2550 J, ΔH = +25.5 kJ/mol (endothermic). Assumption:
  the solution's heat capacity is taken as the water's.
- **~heating-curve — BUILD:** heatingCurve (drawn, Grade 7). Values mass m (g), q for each stage:
  warm ice from −10 °C (m × 2.09 × 10), melt (m × 334), warm water (m × 4.18 × 100), boil
  (m × 2260), total. Example 10.0 g: 209 + 3340 + 4180 + 22,600 = 30,329 J ≈ 30.3 kJ. Check the
  heatingCurve fields at build; stage labels may need need 5b.
- **~formation — BUILD (waits on need 5):** ΔH = Σ ΔH_f(products) − Σ ΔH_f(reactants). Example
  CH₄ + 2O₂ → CO₂ + 2H₂O(l): (−393.5 + 2 × −285.8) − (−74.8) = −890.3 kJ.
- **~hess — BUILD (waits on need 5):** ΔH = ΔH₁ + ΔH₂, a reversed step changes sign. Example
  C + ½O₂ → CO (−110.5 kJ), CO + ½O₂ → CO₂ (−283.0 kJ) → C + O₂ → CO₂, −393.5 kJ.
- **Verdict:** 6 pages (2 wait on need 5); 3 of 5 questions solved.

### 13. s.10.rates-equilibrium — Reaction rates and chemical equilibrium

- **Standard:** HS-PS1-5, HS-PS1-6.
- **Textbooks:** OpenSciEd C.4; OpenStax ch. 12, 13, 15; Glencoe ch. 16–17; HMH unit 5; Savvas unit 12.
- **Tests ask:** no released questions. Common types:

  | Question type                                          | Page          | Mark   |
  | ------------------------------------------------------ | ------------- | ------ |
  | Write K and compute it from equilibrium concentrations | main          | Solves |
  | ICE table from a start concentration and K             | main          | Solves |
  | Which way does it shift (Q vs K)                       | ~le-chatelier | Solves |
  | Effect of T, P, adding or removing (Le Châtelier)      | ~shift        | Solves |
  | How a catalyst changes Eₐ                              | ~catalyst     | Solves |
  | What speeds a reaction (collision theory)              | ~rate-factors | Solves |

- **Main — BUILD `s.10.rates-equilibrium`:** equilibriumChart, g.s10-rates-equilibrium-ice
  (N₂O₄ ⇌ 2NO₂, `start: 'A0', eq: 'A'`; NO₂ start 0, `eq: 'B'`; `K: 'K'`). Values A₀ (M), change
  x (M), [N₂O₄] A = A₀ − x, [NO₂] B = 2x, K = B² ÷ A. Assumptions: "At equilibrium the forward and
  reverse rates are equal; amounts stop changing, reactions don't stop." "K depends only on
  temperature." "Pure solids and liquids are left out of K." Example A₀ 1.00 M, x 0.20 M → A 0.80,
  B 0.40, K = 0.16 ÷ 0.80 = 0.20. startWith ['A', 'B']. -nearly-complete is its screenshot.
- **~le-chatelier — BUILD:** equilibriumChart with stress add, g.s10-rates-equilibrium-add
  (H₂ + I₂ ⇌ 2HI). Values h, i, p (M), K = p² ÷ (h × i), added a (M), Q = p² ÷ ((h + a) × i).
  Example 0.10, 0.10, 0.70 → K 49; add 0.10 M H₂ → Q = 24.5 < K, shifts toward HI. Volume and
  heat demos are its screenshots.
- **~shift — BUILD (sort):** for N₂ + 3H₂ ⇌ 2NH₃ (ΔH < 0). Bins toward products, toward reactants,
  no shift. Cards: add N₂, remove NH₃, cool it, squeeze to a smaller volume (products); remove H₂,
  heat it, let it expand (reactants); add a catalyst, add argon at the same volume (no shift).
- **~catalyst — BUILD:** energyProfile with catalyst, g.s10-rates-equilibrium-catalyst. Values Hr,
  Hp, Eₐ, E_cat, lowered by d = Eₐ − E_cat, reverse barriers Eₐ − ΔH and E_cat − ΔH. Example 100,
  60, 90, 50 → ΔH −40, d 40, reverse 130 and 90 kJ: both directions lowered alike, ΔH unchanged.
  -reverse demo is its screenshot.
- **~rate-factors — BUILD (sort):** bins speeds up, slows down. Cards: warm the solution, crush the
  tablet to powder, use more concentrated acid, add a catalyst (up); cool it in ice, use one large
  lump, dilute the acid (down). Sentence: "More frequent, harder collisions make a faster reaction."
- **Verdict:** 5 pages; 6 of 6 common types solved.

### 14. s.10.acids-bases — Acids, bases and pH

- **Standard:** HS-PS1-6 (in part); HSF-LE.A.4 (logarithms). (pH is a state chemistry standard.)
- **Textbooks:** OpenSciEd C.4; OpenStax ch. 14 (14.1–14.3, 14.7), 15; Glencoe ch. 18; Savvas units 13–14.
- **Tests ask:** no released questions. Common types:

  | Question type                     | Page            | Mark   |
  | --------------------------------- | --------------- | ------ |
  | pH from [H⁺]; acidic or basic     | main            | Solves |
  | [H⁺] from pH                      | ~from-ph        | Solves |
  | pH of a strong base (via pOH)     | ~base           | Solves |
  | Equivalence volume in a titration | ~titration      | Solves |
  | pH = pKₐ at the half-way point    | ~weak-titration | Solves |
  | Classify acid, base, neutral      | ~classify       | Solves |

- **Main — BUILD `s.10.acids-bases`:** phScale, g.s10-acids-bases-ph (`pH: 'p', hydrogen: 'h',
hydroxide: 'o', pOH: 'q', examples: true`). Values [H⁺] h (M, 1 × 10⁻¹⁴–1, `scientific: true`),
  pH p = −log h, pOH q = 14 − p, [OH⁻] o = 1.0 × 10⁻¹⁴ ÷ h. Assumptions: "Each pH unit is ten
  times the [H⁺]." "pH + pOH = 14 at 25 °C." "Below 7 is acidic, above 7 basic." Example
  [H⁺] 2.5 × 10⁻⁴ M → pH 3.60, pOH 10.40, [OH⁻] 4.0 × 10⁻¹¹ M. startWith ['h'].
- **~from-ph — BUILD:** equationInput `[H⁺] = 10^{−{p}}` with phScale (g.s10-acids-bases-hydrogen);
  step text 1/(10^pH). Example pH 8.50 → 3.16 × 10⁻⁹ M.
- **~base — BUILD:** phScale, g.s10-acids-bases-base: [OH⁻] → pOH → pH. Example 0.010 M NaOH →
  pOH 2.00 → pH 12.00.
- **~titration — BUILD:** phScale titration, g.s10-acids-bases-titration (strong acid, NaOH):
  C₁, V₁, C₂, added V₂, Vₑ = C₁ × V₁ ÷ C₂; rows (mL). Example 0.100 M HCl, 25.0 mL, 0.200 M NaOH
  → Vₑ 12.5 mL, pH 7 there.
- **~weak-titration — BUILD:** g.s10-acids-bases-weak-titration (acetic acid, Kₐ 1.8 × 10⁻⁵): as
  above plus half-way V = Vₑ ÷ 2 and pKₐ = −log Kₐ. Example 0.100 M, 20.0 mL, 0.100 M NaOH → Vₑ
  20.0 mL, half-way 10.0 mL, pH = pKₐ = 4.74; equivalence above pH 7.
- **~classify — BUILD (sort):** bins acid, base, neutral. Cards: HCl(aq), HNO₃(aq), vinegar, lemon
  juice (acid); NaOH(aq), NH₃(aq), baking soda solution, soapy water (base); pure water, NaCl(aq),
  sugar water (neutral). Sentence: "An acid gives H⁺ to water; a base takes H⁺ or gives OH⁻."
- **Verdict:** 6 pages; 6 of 6 common types solved.

### 15. s.10.redox — Oxidation-reduction reactions and electrochemistry

- **Standard:** HS-PS1-2, HS-PS1-7 (in part); state chemistry standards.
- **Textbooks:** OpenStax ch. 17 (17.1–17.3, 17.6); Glencoe ch. 19–20; Savvas unit 15.
- **Tests ask:** no released questions. Common types:

  | Question type                             | Page                  | Mark                     |
  | ----------------------------------------- | --------------------- | ------------------------ |
  | Anode, cathode, electron flow in a cell   | main                  | Solves                   |
  | E°cell from reduction potentials          | main (scenes read E°) | Solves                   |
  | What is oxidized and reduced              | ~oxidized-reduced     | Solves                   |
  | Oxidation number of an atom in a compound | ~oxidation-numbers    | Partly (picture: need 8) |
  | Electrolysis, corrosion                   | —                     | No (see G)               |

- **Main — BUILD `s.10.redox` (explore):** figure `electrochemicalCell`, g.s10-redox-galvanic-cell.
  Scenes (E° from the figure's table, checked): "Electrons flow from zinc to copper" (Zn, Cu, lit
  electrons: 0.34 − (−0.76) = 1.10 V); "Oxidation at the anode" (lit anode: Zn → Zn²⁺ + 2e⁻, the
  zinc thins); "Reduction at the cathode" (lit cathode: Cu²⁺ + 2e⁻ → Cu, copper coats it); "The
  salt bridge" (lit bridge: NO₃⁻ toward the anode, K⁺ toward the cathode); "Copper can be the
  anode" (Ag, Cu, lit anode: 0.80 − 0.34 = 0.46 V); "A bigger gap, a bigger voltage" (Mg, Cu,
  lit meter: 2.71 V); "Light a bulb" (Zn, Cu, meter bulb).
- **~oxidized-reduced — BUILD (sort):** bins oxidized (loses electrons), reduced (gains electrons),
  neither. Cards: Zn in Zn + Cu²⁺ → Zn²⁺ + Cu; Cu²⁺ in the same; Na in 2Na + Cl₂ → 2NaCl; Cl₂ in
  the same; Fe in 4Fe + 3O₂ → 2Fe₂O₃; O₂ in the same; Mg in Mg + 2H⁺ → Mg²⁺ + H₂; H⁺ in the same;
  Na⁺ in NaCl + AgNO₃ → AgCl + NaNO₃ (neither: a spectator).
- **~oxidation-numbers — BUILD (picture waits on need 8):** equationInput `{x} + {h}(+1) +
{o}(−2) = {q}`: the unknown atom x, H atoms h, O atoms o, charge q. Example MnO₄⁻: x + 4(−2) =
  −1 → x = +7; H₂SO₄: x + 2 − 8 = 0 → +6.
- **Verdict:** 3 pages; 3 of 5 common types solved, 1 partly.

### 16. s.10.organic — Organic chemistry: hydrocarbons and functional groups

- **Standard:** HS-PS1-1, HS-PS2-6 (in part); HS-LS1-6 (carbon backbones).
- **Textbooks:** OpenStax ch. 20; Glencoe ch. 21–22; Savvas unit 16.
- **Tests ask:** no released questions. Common types:

  | Question type                                | Page               | Mark                   |
  | -------------------------------------------- | ------------------ | ---------------------- |
  | Formula and name of an alkane with n carbons | main               | Solves                 |
  | Alkene and alkyne formulas                   | ~alkene, ~alkyne   | Solves                 |
  | Identify a functional group                  | ~functional-groups | Solves (cards: need 9) |
  | Structural isomers                           | —                  | No (need 9b)           |
  | Addition polymers                            | —                  | No (see G)             |

- **Main — BUILD `s.10.organic`:** lewisStructure hydrocarbon, g.s10-organic-alkane (`carbons: 'n',
bond: 'single', hydrogens: 'h'`), `sliders: true`. Values n (1–8), h = 2n + 2. Assumptions:
  "Carbon makes four bonds, hydrogen one." "Alkanes have only single bonds." "The prefix counts
  carbons: meth-, eth-, prop-, but-, pent-, hex-, hept-, oct-." Example n 3 → C₃H₈, propane.
  -octane demo is its screenshot. startWith ['n'].
- **~alkene — BUILD:** g.s10-organic-alkene, bond 'double': n (2–8), h = 2n. Example C₄H₈, 1-butene.
- **~alkyne — BUILD:** g.s10-organic-alkyne, bond 'triple': n (2–8), h = 2n − 2. Example C₂H₂,
  ethyne.
- **~functional-groups — BUILD (sort):** bins alcohol (–OH), carboxylic acid (–COOH), ester
  (–COO–), amine (–NH₂), ketone (C=O between carbons). Cards: methanol, ethanol; acetic acid,
  formic acid; ethyl acetate, methyl butanoate; methylamine, ethylamine; acetone, 2-butanone.
  Text cards with the condensed formula until need 9.
- **Verdict:** 4 pages; 3 of 5 common types solved.

### 17. s.10.nuclear-chemistry — Nuclear chemistry: radioactive decay, half-life, fission and fusion

- **Standard:** HS-PS1-8.
- **Textbooks:** OpenSciEd C.5; OpenStax ch. 21 (21.1–21.4); Glencoe ch. 24; HMH unit 2 (2.3); Savvas unit 17.
- **Tests ask:**

  | Question                                                                    | Page          | Mark                                                                                           |
  | --------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------- |
  | NAEP-2009-12S9-#2 (which equation is fission; filed under atomic structure) | ~reactions    | Solves                                                                                         |
  | NAEP-2009-12S9-#10 (advantages of fusion over fission)                      | ~reactions    | Partly: the sort's cards name fuel and waste; the page states no comparison sentence (add one) |
  | NAEP-2000-12S11-#2 (why energy is released: mass lost)                      | ~mass-defect  | No until need 14                                                                               |
  | Amount left after n half-lives (common)                                     | main          | Solves                                                                                         |
  | Balance an alpha or beta decay (common)                                     | ~alpha, ~beta | Solves                                                                                         |

- **Main — BUILD `s.10.nuclear-chemistry`:** decayChart decay, g.s10-nuclear-chemistry-decay-grid
  (`halfLife: 'T', time: 't', start: 'N0', left: 'N', halves: 'n', parent: 'I-131', daughter:
'Xe-131', keep: ['T', 'N0']`). Values T (days), t (days), N₀ (mg), halves n = t ÷ T,
  N = N₀ × 0.5^(n). Assumptions: "Each half-life halves what is left, whatever the start."
  "Which atom decays next is random; the half-life is fixed." Example T 8.02 days, t 24.06 days,
  N₀ 80.0 mg → n 3, N 10.0 mg. startWith ['T', 'N0', 't'].
- **~alpha — BUILD:** equationInput `^{A}_{Z}X → ^{A2}_{Z2}Y + ^{4}_{2}He` (g.s10-nuclear-chemistry-alpha)
  with decayChart equation (g.s10-nuclear-chemistry-equation-alpha). A2 = A − 4, Z2 = Z − 2.
  Example ²³⁸₉₂U → ²³⁴₉₀Th + ⁴₂He.
- **~beta — BUILD:** `^{A}_{Z}X → ^{A2}_{Z2}Y + ^{0}_{−1}e` (g.s10-nuclear-chemistry-beta, -equation-beta):
  A2 = A, Z2 = Z + 1. Example ¹⁴₆C → ¹⁴₇N + ⁰₋₁e.
- **~fission — BUILD:** decayChart equation, g.s10-nuclear-chemistry-fission: ²³⁵U + n → fragment 1
  (A₁, Z₁ typed) + fragment 2 (derived) + k neutrons (allowed [2, 3]); A₂ = 236 − A₁ − k,
  Z₂ = 92 − Z₁. Example Ba-141 (56), k 3 → Kr-92 (36).
- **~reactions — BUILD (sort):** bins alpha decay, beta decay, fission, fusion. Cards: ²²⁶Ra →
  ²²²Rn + ⁴He; "gives off a helium-4 nucleus" (alpha); ³H → ³He + e⁻; "a neutron becomes a proton"
  (beta); ²³⁵U + n → ¹⁴⁴Ba + ⁸⁹Kr + 3n; "a heavy nucleus splits"; "runs today's nuclear power
  plants" (fission); ²H + ³H → ⁴He + n; "light nuclei join"; "powers the Sun" (fusion). Sentence:
  "Fusion's fuel is hydrogen from water and it leaves little long-lived waste; fission leaves
  radioactive waste."
- **~mass-defect — BUILD (waits on need 14):** Δm = mass before − mass after (u), E = Δm × 931.5
  MeV. Example U-238 → Th-234 + He-4: 238.050788 − (234.043601 + 4.002603) = 0.004584 u → 4.27 MeV.
- **Verdict:** 6 pages (1 waits on need 14); 4 of 5 questions solved, 1 partly.

## Page count

| Skill              |  Pages | Layouts | Waiting                                        |
| ------------------ | -----: | ------: | ---------------------------------------------- |
| measurement        |      6 |       0 | ~sig-fig-math (2)                              |
| atomic-structure   |      4 |       1 | ~average-mass picture (7)                      |
| electrons-in-atoms |      4 |       0 | —                                              |
| periodic-trends    |      4 |       1 | —                                              |
| bonding            |      6 |       2 | main's undrawn counts (12)                     |
| molecular-shape    |      4 |       3 | ~water scene 3 (10)                            |
| reaction-types     |      4 |       1 | ~combustion general (1)                        |
| mole               |      5 |       0 | ~empirical ratio line (11)                     |
| stoichiometry      |      4 |       0 | ~limiting-grams (4)                            |
| gas-laws           |      6 |       0 | ~effusion (6)                                  |
| molarity           |      4 |       0 | —                                              |
| thermochemistry    |      6 |       0 | ~formation, ~hess (5)                          |
| rates-equilibrium  |      5 |       2 | —                                              |
| acids-bases        |      6 |       1 | —                                              |
| redox              |      3 |       2 | ~oxidation-numbers picture (8)                 |
| organic            |      4 |       1 | ~functional-groups cards (9)                   |
| nuclear-chemistry  |      6 |       1 | ~mass-defect (14)                              |
| **Total**          | **81** |  **15** | 8 pages wait; 6 more build now with a fallback |

## Engine and picture needs

1. **Formula from variables in `reaction` (and its molar mass):** a term written `C_{x}H_{y}` whose
   subscripts are page values, drawn and tallied; plus a check that Zn, ZnCl₂ and Al₂O₃ draw.
   Waits: `s.10.reaction-types~combustion` general form (NAEP-2005-12S14-#7), ~replacement.
2. **Significant-figure rounding:** a step phrase "rounded to {k} significant figures" and a
   display that keeps trailing zeros (3.0, 2.50 × 10³). Waits: `s.10.measurement~sig-fig-math`;
   would improve every chemistry answer line.
3. **Units: pressure, energy, amount dimensions** in `units.ts` (atm, kPa, mmHg/torr; J, kJ, cal;
   mol, mmol). Temperature stays in K (affine). Waits: none; the gas-law and thermochemistry pages
   use fixed labels until then and should switch when it lands.
4. **Limiting reactant from masses:** moleMap with two reactants (each grams → moles → product
   moles), the smaller lit. Waits: `s.10.stoichiometry~limiting-grams`.
5. **energyProfile levels only (no hump):** an enthalpy ladder with steps stacked for Hess's law
   and formation enthalpies; 5b: heatingCurve labels q per stage (check fields first). Waits:
   `s.10.thermochemistry~formation`, `~hess` (and possibly `~heating-curve`).
6. **Effusion:** two gases in one box, speed trails ∝ √(T/M), a pinhole. Waits:
   `s.10.gas-laws~effusion` (NAEP-2000-12S11-#11).
7. **Isotope abundance picture:** 100 atoms of two masses (or dotPlot's balance point over counts
   at two values, if dotPlot takes counts). Waits: `s.10.atomic-structure~average-mass`.
8. **Oxidation-number tally:** each atom of a formula with its oxidation number, summing to the
   charge. Waits: `s.10.redox~oxidation-numbers`.
9. **Card figures for molecules the `molecule` card can't draw** (BF₃, CCl₄, CHCl₃, CH₃OH) and
   organic condensed formulas with the functional group lit; 9b: branched hydrocarbons in
   lewisStructure hydrocarbon (isomers). Waits: `s.10.molecular-shape~polarity`,
   `~imf`, `s.10.organic~functional-groups`.
10. **Hydration scene in `molecules`:** an ion ringed by water molecules turned by charge. Waits:
    `s.10.molecular-shape~water` scene 3 (NAEP-2009-12S10-#14).
11. **Whole-number ratio helper:** round mole ratios to whole numbers, multiplying by 2 or 3 at
    .5 and .33. Waits: `s.10.mole~empirical`.
12. **lewisStructure molecule: allowed count sets**, so the four count inputs accept only the drawn
    molecules (a variable's `allowed` can't express combinations). Waits: `s.10.bonding` main.
13. **Atomic model card icons** (Dalton, Thomson, Rutherford, Bohr, cloud). Optional for
    `s.10.atomic-structure~models`.
14. **Mass-defect picture:** mass before and after as bars with a broken axis so 0.005 u of 238
    shows. Waits: `s.10.nuclear-chemistry~mass-defect` (NAEP-2000-12S11-#2).

## Not in the taxonomy

- Predicting products (activity series, solubility rules for double replacement) is taught in
  OpenStax 4.2, Glencoe ch. 9 and Savvas 6.2–6.3 but has no skill; it would sit under
  `s.10.reaction-types` (propose a problem type later, or a skill `s.10.predicting-products`).
- Vapor pressure and boiling point with pressure (OpenStax 10.3–10.4, phase diagrams) has no
  skill; NAEP-2005-12S13-#6 needs it. Suggest `s.10.molecular-shape` or a new skill.
- Colligative properties (OpenStax 11.4) and electrolysis/corrosion (17.6–17.7), polymers
  (Savvas 16.3), entropy and free energy (OpenStax ch. 16, Savvas 12.4) have no skill.
- Question data to refile (`research/questions`): NAEP-2000-12S11-#2 → s.10.nuclear-chemistry;
  NAEP-2009-12S9-#10 → s.10.nuclear-chemistry; NAEP-2009-12S9-#2 → s.10.nuclear-chemistry;
  NAEP-2009-12S10-#14 → s.10.molecular-shape; NAEP-2009-12S9-#4 → s.10.molecular-shape;
  NAEP-2019-12S7-#18 → s.10.molecular-shape; NAEP-2005-12S14-#7 → s.10.reaction-types;
  NAEP-2005-12S13-#6 → s.10.molecular-shape (vapor pressure) rather than gas laws.

## Priority

1. Build the 58 calculator pages that wait on nothing (66 calculators less the 8 waiting), skill by skill in taxonomy order,
   promoting each demo with `promote-demo.mjs`; test each id as it lands.
2. The 15 layout pages next (new `layouts/science10.ts`), starting with the drawn-figure ones
   (`s.10.reaction-types`, `s.10.redox`).
3. Engine needs in this order: 1 (general combustion, a released item), 2 (sig figs), 4 (limiting
   from grams), 5 (Hess and formation), 3 (units), 6, 10, 14 (released items), then 7, 8, 9, 11,
   12, 13.
4. Then the lesson review (`pnpm review -- --prefix s.10. --stage lesson`) with the NAEP refiles
   applied, so each question is checked against the page it belongs to.

## Added skills

Two skills added to the taxonomy after the plan (`TAXONOMY_ISSUES.md`, "Grades 9–12 topics
without a skill"), and pages for the three widened titles. Built in `science/10.ts` and
`layouts/science10.ts` with pictures that exist; wanted pictures are in `docs/build/s.10.md`.

### 18. s.10.phase-colligative — Phase changes, vapor pressure and colligative properties

- **Standard:** HS-PS1-3 (bulk properties from the forces between particles).
- **Textbooks:** OpenStax Chemistry 2e 10.3–10.4 (phase transitions, phase diagrams) and 11.4
  (colligative properties); Savvas Experience 10.4. Practice: molality from a percent, a boiling
  point rise with K_b, a molar mass from ΔT.
- **Released questions:** NAEP-2005-12S13-#6 (an egg boiled high on a mountain) → the
  boiling-point sort.
- **Main page, "Freezing and boiling points of a solution":** n (mol), w (kg of water),
  b = n ÷ w (mol/kg), i (1, 2 or 3), ΔTf = i × 1.86 × b, Tf = 0 − ΔTf, ΔTb = i × 0.512 × b,
  Tb = 100 + ΔTb. Example by hand: 0.25 mol CaCl₂ in 0.5 kg → b = 0.5; ΔTf = 3 × 1.86 × 0.5 =
  2.79, Tf = −2.79 °C; ΔTb = 3 × 0.512 × 0.5 = 0.768, Tb = 100.768 °C. Picture: `heatingCurve`
  with the plateaus at Tf and Tb (a hidden start 10 °C below Tf). No `use` line (main page).
- **`~vapor-pressure`, "Vapor pressure of a solution":** n = n₁ + n₂, x = n₁ ÷ n,
  P = x × P°, ΔP = P° − P. Example: 9.5 mol water + 0.5 mol glucose → x = 0.95;
  P = 0.95 × 23.8 = 22.61 mmHg; ΔP = 1.19 mmHg. Picture: `pieChart` of the moles. Use: “Glucose
  is dissolved in water. How much does the vapor pressure drop?”
- **`~boiling-point` (sort):** raises / lowers / no change (salt, sugar, a pressure cooker, a
  mountain, a vacuum jar, a bigger burner, a bigger pot).
- **`~phase-heat` (sort):** takes heat in / gives heat off, one card per phase change.

### 19. s.10.entropy-free-energy — Entropy, free energy and spontaneity

- **Standard:** HS-PS3-4 (energy spreads out), with HS-PS1-4.
- **Textbooks:** OpenStax Chemistry 2e ch. 16 (spontaneity, entropy, the second law, free
  energy) and 17.4; Savvas Experience 12.4. Practice: predict the sign of ΔS, ΔG and spontaneity.
- **Released questions:** none.
- **Main page, "ΔG = ΔH − TΔS":** ΔH (kJ/mol), ΔS (J/(mol·K)), T (K), ΔG = ΔH − T × ΔS ÷ 1000;
  a work line says spontaneous or not. Example by hand: 50 − 300 × 200 ÷ 1000 = 50 − 60 =
  −10 kJ/mol, spontaneous. Picture: `functionGraph`, the line ΔG against T (slope −ΔS ÷ 1000,
  hidden) with the point at T.
- **`~crossover`, "The temperature where it turns spontaneous":** T = 1000 × ΔH ÷ ΔS, a limit
  that ΔH and ΔS share a sign. Example: 1000 × 60 ÷ 150 = 400 K, spontaneous above it. Picture:
  the same line with its zero marked.
- **`~entropy-sign` (sort):** ΔS up or down (melting, dissolving, gas made or used up).
- **`~spontaneity` (sort):** the four sign cases of ΔH and ΔS.

### Widened titles

- **`s.10.reaction-types~activity-series` (sort):** predicting a single replacement from the
  activity series (reacts / no reaction).
- **`s.10.redox~electrolysis` (sort):** galvanic or electrolytic cell.
- **`s.10.organic~polymers` (sort):** addition or condensation polymer.
