# Build notes: science grade 10 (chemistry)

Built from `.review/plans/s.10/plan.md` in its priority order: the calculators skill by skill,
then the layout pages. Calculators are in `src/data/modules/science/10.ts`, layouts in
`src/data/modules/layouts/science10.ts`, step phrases in `src/data/modules/harness/phrasesS10.ts`.

## Built: 73 pages (58 calculators, 15 layouts)

| Skill              | Calculators                                            | Layouts                                      |
| ------------------ | ------------------------------------------------------ | -------------------------------------------- |
| measurement        | 5: main, ~factor, ~rate, ~ruler, ~accuracy             | —                                            |
| atomic-structure   | 2: main, ~ions                                         | 1: ~models (sequence)                        |
| electrons-in-atoms | 4: main, ~ions, ~emission, ~photon                     | —                                            |
| periodic-trends    | 3: main, ~ionization, ~electronegativity               | 1: ~families (sort)                          |
| bonding            | 4: main, ~ionic, ~metallic, ~polarity                  | 2: ~properties, ~bond-type (sorts)           |
| molecular-shape    | 1: main                                                | 3: ~polarity, ~imf (sorts), ~water (explore) |
| reaction-types     | 3: ~combustion, ~synthesis, ~replacement               | 1: main (sort)                               |
| mole               | 5: main, ~molar-mass, ~factor, ~gas-volume, ~empirical | —                                            |
| stoichiometry      | 3: main, ~limiting, ~percent-yield                     | —                                            |
| gas-laws           | 5: main, ~boyle, ~charles, ~gay-lussac, ~combined      | —                                            |
| molarity           | 4: main, ~from-grams, ~dilution, ~solubility           | —                                            |
| thermochemistry    | 4: main, ~calorimetry, ~cold-pack, ~heating-curve      | —                                            |
| rates-equilibrium  | 3: main, ~le-chatelier, ~catalyst                      | 2: ~shift, ~rate-factors (sorts)             |
| acids-bases        | 5: main, ~from-ph, ~base, ~titration, ~weak-titration  | 1: ~classify (sort)                          |
| redox              | —                                                      | 2: main (explore), ~oxidized-reduced (sort)  |
| organic            | 3: main, ~alkene, ~alkyne                              | 1: ~functional-groups (sort)                 |
| nuclear-chemistry  | 4: main, ~alpha, ~beta, ~fission                       | 1: ~reactions (sort)                         |

Built with the plan's interim (the need would improve them):

- `s.10.bonding` main: only the drawn molecules (H₂O, NH₃, CH₄, CO₂, HCN, CH₂O, H₂, O₂, N₂) give
  shared and lone pairs; other counts leave them unknown (need 12). The assumptions list the
  drawn molecules.
- `s.10.reaction-types~combustion`: propane only (need 1 for any CₓHᵧ).
- `s.10.mole~empirical`: moles, smallest and the three ratios; the rounded formula line waits on
  need 11 (an assumption says how to round).
- `s.10.molecular-shape~water`: the "salt in water" scene waits on need 10.
- `s.10.molecular-shape~polarity`, `~imf`: ball-and-stick cards where the `molecule` card has a
  fair drawing; CHCl₃, BF₃, CCl₄ and CH₂O are text cards (need 9).
- `s.10.organic~functional-groups`: text cards with the condensed formula (need 9).
- `s.10.atomic-structure~models`: text stages (need 13, optional).

## Waiting: 8 pages

| Page                                 | Need | Why                                                              |
| ------------------------------------ | ---: | ---------------------------------------------------------------- |
| `s.10.measurement~sig-fig-math`      |    2 | Rounding to significant figures with trailing zeros kept         |
| `s.10.atomic-structure~average-mass` |    7 | An isotope-abundance picture                                     |
| `s.10.stoichiometry~limiting-grams`  |    4 | moleMap with two reactants, grams → moles → product, smaller lit |
| `s.10.gas-laws~effusion`             |    6 | Two gases and a pinhole, speed ∝ √(T/M) (NAEP-2000-12S11-#11)    |
| `s.10.thermochemistry~formation`     |    5 | An enthalpy ladder of levels, no hump                            |
| `s.10.thermochemistry~hess`          |    5 | The same ladder with steps stacked                               |
| `s.10.redox~oxidation-numbers`       |    8 | An oxidation-number tally per atom                               |
| `s.10.nuclear-chemistry~mass-defect` |   14 | Mass bars with a broken axis (NAEP-2000-12S11-#2)                |

## Changed from the plan

- **`s.10.atomic-structure` main:** the mass number and charge can be typed (the plan marked
  them derived), so "an isotope's mass number → its neutrons", a common question, solves.
- **`~combustion`:** the propane coefficient is fixed at 1. The `reaction` picture draws at most
  8 molecules a term, and b = 5a passes 8 at a = 2. The atom tally (C, H, O before and after)
  makes 10 values.
- **`~synthesis`:** a is 4 or 8 (multiples of 4 that keep the terms to 8); **`~replacement`:** a is
  1 to 4 (b = 2a ≤ 8).
- **`s.10.stoichiometry` main:** the example is 6.06 g of H₂, not 6.048 g: the mole map's molar
  masses come from the table to two decimals (H₂ = 2.02 g/mol), so 6.06 g is 3.000 mol →
  2.000 mol NH₃ → 34.06 g.
- **`s.10.gas-laws` main:** V = 24.63 L (P = 2.000 atm); the plan's 24.6 L gives 2.002 atm.
- **`~boyle`:** starts from P₁, V₁ and V₂ so the example solves P₂ (the plan's question).
- **`s.10.bonding~polarity`:** the difference is |EN₁ − EN₂| (worked forward only).
- **`s.10.electrons-in-atoms~emission`:** the ladder draws 8 levels (`levels: 8`) for u up to 8.
- **`~photon`:** f in Hz and E in J, both in scientific notation.
- **`s.10.mole~molar-mass`:** the pie's parts are the three percents.
- **`s.10.mole~empirical`:** adds "the percents add to 100" (so %O follows from %C and %H);
  10 values.
- **`s.10.thermochemistry~heating-curve`:** the curve is drawn against heat added (the four q's
  are the spans, in J), so the flat parts' lengths are the melting and boiling heats; need 5b is
  not needed.
- **`~cold-pack`:** 9 values (the plan counted 8); ΔH = qᵣₓₙ ÷ (n × 1000) in kJ/mol.
- **`s.10.acids-bases~titration`:** the example stops at equivalence (V₂ = 12.5 mL, r = 1).
- **`~weak-titration`:** adds the half-way volume V½ = Vₑ ÷ 2; Kₐ and pKₐ are marked standalone
  (the curve uses them, no volume does).
- **`s.10.molarity~solubility`:** r = S − m goes below 0 when salt settles out (one page, not the
  demo's two relations); 40 °C reads 63.9 g, so 13.9 g more dissolves.
- **`s.10.nuclear-chemistry~fission`:** adds N₁ = A₁ − Z₁ (the first fragment's neutrons): without
  it the mass and atomic numbers are two unconnected lessons (modules test).
- **Wording:** use lines drop trailing zeros the copy editor rejects ("6 L at 1 atm", "250 mL",
  "100 g … from 21 °C", "25 mL of 0.1 M HCl"), and Kw reads 1 × 10⁻¹⁴; the examples keep the
  plan's numbers.
- **`~water` explore:** adds a first scene, one water molecule drawn big (why it is polar); the
  liquid scene draws ice and liquid side by side.
- **`~models` sequence:** the assumptions give two likenesses and two differences between Bohr's
  model and the Solar System (the plan's fix for NAEP-2000-12S9-#13).
- **`~reactions` sort:** the fusion-versus-fission sentence is an assumption (sorts have no
  sentence field).
- **`s.10.redox` explore:** the big-voltage scene is Mg–Cu (2.71 V) as planned, not the demo's
  Mg–Ag.

## Shared needs found while building

1. **Harness, `search.ts` `affineOf`:** a product relation with a large constant (f × λ − 3 × 10¹⁷,
   or (f × λ × 10⁻⁹)/(3 × 10⁸) − 1) looks affine and constant at the small probe values, so the
   search calls every assignment hopeless ("accepts inputs that no valid values can satisfy").
   Worked around in `~photon` by writing the residual as f − 3 × 10¹⁷/λ. A probe at the
   variables' own ranges would catch it for every page.
2. **Engine, `holds`:** it re-solves the first `solve` entry and compares with an absolute-ish
   tolerance (TOLERANCE × (1 + |x|)), so a value near 10⁻¹⁹ listed first passes any check.
   Worked around in `~photon` by listing f first. A relative tolerance for scientific values
   would help every page with tiny quantities (photon energies, Kₐ).
3. **`reaction` picture:** at most 8 molecules a term, which caps the balancing pages (need 1
   should raise it or scale the drawing); ZnCl₂ and Al₂O₃ are drawn by the generic packer as
   bonded molecules, not ions.
4. **Sampling time:** `s.10.bonding` main takes about 400 s at `SAMPLES=100` (the search over
   the undrawn atom counts); need 12 (allowed count sets) would fix it. Default settings pass in
   seconds.
5. **Units (need 3):** atm, kJ, kJ/mol, J, mol, mol/L, Hz, pm and days are fixed labels.
6. **`docs/build/`** did not exist in the worktree; this file creates it.

## Lesson review fixes (`.review/hs-s.10/lesson-report.md`)

12 errors, 27 improvements, 2 layout proposals, 2 merge/trim, 5 new pages.

**Errors.** Fixed: 3 (bonding main: b = (2h + 8(c + n + o) − V) ÷ 2, and the undrawn counts
now solve), 4 and 5 (`~ionic` takes the two ion charges: t = lcm, a = t ÷ c₊, b = t ÷ c₋, a line
naming the formula; the names are "Metal ions in the formula" and "Nonmetal ions in the
formula", so no element symbol is lowercased), 6 (electronegativity 0–4, the difference ±4),
7 (rebuilt, below), 8 (a line comparing Q with K and naming the shift), 9 (solve entries for
[H₂], [I₂], [HI] from Q and for Vₑ from r), 10 (heating-curve names are "Heat to …"),
11 (`~ruler` use line and a sig-fig assumption), 12 (the card is 2Na + Cl₂ → 2NaCl, also in the
plan). Left to the lead's engine work: 1 (`simplify.ts` and `10²³`) and 2 (stale values after a
clear).

- **7, changed differently:** the `reaction` picture takes a fixed formula, so a CₓHᵧ page
  can't draw it. `~combustion` is now any alkane (x carbons, y = 2x + 2, a = 1 or 2, c = ax,
  d = ay/2, b = c + d/2) with the `lewisStructure` hydrocarbon picture drawing the fuel, and
  `~combustion-alkene` (y = 2x; example C₅H₁₀: 2, 15, 10, 10) covers the released item's
  kind (an alkene needing 2). x is 1–8 (no cap: the picture draws the fuel, not 25 O₂).

**Improvements.** Fixed as proposed: `~factor` units (km, m); `~ruler` start 1.25 cm (not 1)
and L ≥ 0.01; `~ions` keeps p, e, q only; the configuration line on the unpaired and valence
steps ("Z = 8 (oxygen): 1s² 2s² 2p⁴", "Shell 2 holds 2 + 4 = 6") and displays "of element {p}";
`~emission` works 1/4 − 1/9 = 5/36; `~photon` λ in two lines (meters, then nm); trend pages name
each element's period and group and give the trend reasoning (or say the table goes against
it); `~polarity` classifies the bond and names the δ− atom; the shape name and "like H₂O" on the
angle step, and the angles called measured ones; `~synthesis`/`~replacement` lowest-whole-number
assumption, {a}/2 and 3 × {c}/2, "formula units"; the sort assumption; the mole ranges
(n 10⁻⁶–10⁵ mol, N 6 × 10¹⁷–6 × 10²⁸); `~factor` units g, g/mol, mol with the unit-factor line;
`~empirical` n = %C ÷ 12.01 with "40% of 100 g is 40 g of C"; no brackets around a plain number
after "/" in this file's rules, and 16.00 in the %O rule; `~limiting` names the limiting
reactant, r is "Times the reaction happens"; Boyle's and Charles's own assumptions; °C values
(T = t + 273) on the gas main page and `~charles`, P min 0.001 atm; the saturation line on
`~solubility`; molarity min 10⁻⁶; the "gave off" line on `~calorimetry`; the ice's start
temperature as a value on `~heating-curve`; the pKₐ how; [H⁺] = 10^−pH; compound names on the
organic pages; the nucleus named on `~alpha`, `~beta`, `~fission` (Z′ = 90 is thorium: Th-234);
`~beta` A′ = A with a mass-number-0 how and −1 with a true minus; (1/2)ⁿ on the half-life page
(N₀ = N × 2ⁿ back); `~fission` limit N₁ ≥ Z₁ with its message; the fusion sentence and the
nuclear cards with atomic numbers; the model years moved to the total's label.

- **Not done (engine):** `~rate` and pH show 4 decimals, not 4 significant figures (the report's
  engine item); `10^−8.5` is not raised for a decimal exponent (the harness reads a bracketed
  negative, `10^(−8.5)`, as a negative count on an all-positive page).
- **Optional, not done:** the organic merge (three pages into one with a bond value: the
  `lewisStructure` hydrocarbon picture takes a fixed `bond`), and `~metallic` as an explore
  (the plan's calculator stays, as the report allows).

**New pages (5, all built):** `s.10.rates-equilibrium~average-rate` (a `functionGraph` line
through the two readings with the secant marked; a straight line, as no curve family fits any
two readings), `~ksp` (AgCl: Ksp = s², grams per liter; `equilibriumChart` with the two ions),
`s.10.gas-laws~partial-pressure` (`pieChart` of three partial pressures, the mole fraction),
`s.10.molarity~percent-mass` (`percentBar`), `s.10.redox~cell-voltage` (the eight table
potentials as `allowed`, a limit that the cathode is higher, a line naming the cell; a vertical
`integerLine` from E°anode to E°cathode, the jump E°cell).

## Added skills (built)

- `s.10.phase-colligative`: main (freezing and boiling points: b, i, ΔTf, Tf, ΔTb, Tb;
  `heatingCurve` with the plateaus at Tf and Tb), `~vapor-pressure` (Raoult; `pieChart`),
  `~boiling-point` and `~phase-heat` (sorts). NAEP-2005-12S13-#6 (the egg on a mountain) →
  `~boiling-point`.
- `s.10.entropy-free-energy`: main (ΔG = ΔH − TΔS with a spontaneity line; `functionGraph`
  ΔG against T), `~crossover` (T = 1000ΔH ÷ ΔS, a same-sign limit; the line's zero marked),
  `~entropy-sign` and `~spontaneity` (sorts).
- Widened titles: `s.10.reaction-types~activity-series`, `s.10.redox~electrolysis`,
  `s.10.organic~polymers` (sorts).

Now 90 pages: 68 calculators, 22 layouts.

### Lesson review of the added skills

Report: `.review/new-sci/lesson-report.md`. Fixed:

- Phase-colligative main: a dilute-solution assumption; b to 6 mol/kg, ΔTf to 35, Tf from −35,
  ΔTb to 10, Tb to 110 °C (no −111 °C freezing points); g (grams) and M (g/mol) with n = g ÷ M,
  opening on g, M, w, i, so molality from grams and a molar mass from ΔT both solve; i may be 4
  (FeCl₃). Example: 27.75 g of CaCl₂ (111 g/mol) = 0.25 mol.
- ~vapor-pressure: a limit that x is at least 0.5 ("Raoult’s law is for solutions that are
  mostly water"; a limit rather than `min`, so the reason shows); the assumption "dilute and
  ideal"; ΔP = n₂/n × P° ahead of ΔP = P° − P, so the forward solve no longer subtracts
  near-equal rounded values; the use line has numbers.
- ~boiling-point: the Lowers bin says food cooks more slowly (NAEP-2005-12S13-#6).
- Entropy main and ~crossover: the middle line is back ("ΔG = 50 − 60", "T = 60,000/150") and the
  verdict is a note after the answer; the ~crossover how is rewritten; Tc to 10,000 K; ΔH ±10,000
  kJ/mol (octane and sucrose combustion), ΔG ±40,000 to match.
- New page `s.10.entropy-free-energy~from-tables` "ΔS° from a table, then ΔG°" (`integerLine`
  from S°reactants to S°products): ΔS° = S°p − S°r, then ΔG° = ΔH° − TΔS°. Changed from the
  report: the ΔG°f sums (ΔG° = ΔG°f p − ΔG°f r) would be a second, unconnected pair on the page
  (the modules test asks for one connected lesson), so the assumptions say ΔG°f subtracts the
  same way and the page links ΔS° to ΔG° through ΔH° instead.
- Waiting: `s.10.phase-colligative~phase-diagram` (explore) on the H108 phase-diagram figure
  (P20, open).

### Second lesson-review fixes

Report: `.review/new-sci-2/lesson-report.md`.

- `s.10.phase-colligative`: the "100.8 = 100 + 0.768" check and the find-n line are fixed by the
  engine (4 figures are opt-in again; Tb shows 100.768). g runs 0.01–1,000 g, n from 0.00001 mol
  (to 1,000), b is wide, and two limits right after b = n/w say why instead of a silent clear:
  b at most 6 ("Past about 6 mol/kg the freezing-point rule no longer fits.") and b at least
  0.001 ("Below 0.001 mol/kg the freezing and boiling points barely move."; the deep harness found
  a boiling point of 100 that lost its 7 × 10⁻⁷ rise). ΔTf, Tf, ΔTb, Tb and the curve start are
  widened to fit i = 4 at 6 mol/kg.
- `~vapor-pressure`: the check line "0.01189 = 23.8 − 23.79" is the engine's (near-cancelling
  check lines; lead).
- `s.10.entropy-free-energy` (main, ~from-tables, ~crossover): a negative term in a work line is
  bracketed ("ΔG° = −50 − (−56.024)", "T = −60,000/(−150)"); the rules and their steps write
  1,000 ("T × ΔS/1,000", "T = 1,000 × ΔH/ΔS"), as the work lines do.
- `~from-tables`: S°products and S°reactants run 0–10,000 J/(mol·K) (propane's combustion sums
  past 1,000), ΔS° ±10,000, ΔG° ±60,000. The number line grows to fit. Its `change` is dropped:
  the line draws the jump from the two sums itself, and the deep harness flagged "jump from
  5,259.86159951 to 5,260.35 shows 0.4884004884" (values rounded to 12 figures, checked to an
  absolute 10⁻⁹: a harness tolerance for the lead).
- `~crossover`: ΔH = 10,000 with ΔS = 150 no longer drops ΔS silently; the rule's message says
  "That switch would be past 10,000 K, hotter than any compound survives."

## Shared needs (lesson review)

1. **Tracker, `pictureRequestsHs.ts` H49:** lists `s.10.reaction-types~combustion`, which now
   draws `lewisStructure` (hydrocarbon); move it to H47 with `~combustion-alkene`
   (`pictureRequests.test.ts` fails on it until then).
2. **`reaction` picture:** a formula from values (CₓHᵧ) and more than 8 molecules a term, so the
   combustion pages can show the atom tally again (`~combustion`, `~combustion-alkene`).
3. **`lewisStructure` ionic:** the metal and nonmetal from the charges (Al³⁺ with O²⁻), so
   `s.10.bonding~ionic` draws every pair it solves (it draws MgCl₂ only; others fade).
4. **Engine display:** 4 significant figures on scientific pages (`~rate` 277.7778 m/s, pH
   3.6021) and a raised decimal exponent (10^−8.5) (`s.10.acids-bases`, `~from-ph`, `~base`,
   `~weak-titration`).
5. **Pictures wanted for the added skills:** a phase diagram with the solution's lines shifted
   (`s.10.phase-colligative`, it now uses the heating curve); a concentration–time curve through
   two readings with the secant (`~average-rate`, now a straight line); a galvanic cell as a
   calculator picture (`s.10.redox~cell-voltage`, now a number line of potentials); a gas
   mixture in the piston colored by gas (`~partial-pressure`, now a pie).
6. **Question refiles (the lead's):** NAEP-2005-12S14-#7 now fits `~combustion-alkene`.
7. **Engine, a value in an exponent:** a power whose exponent shows in scientific notation is not
   bracketed (`2^4.8292 × 10⁻⁵`), so the step and check read wrong at tiny half-life counts
   (`s.10.nuclear-chemistry`, deep run only; the page writes (1/2)^n as the report asked).

### Pictures placed (H89–H110)

- `s.10.atomic-structure~average-mass` (H101 need 7): built (it was waiting) from the demo, m₁, m₂,
  f₁, f₂ = 100 − f₁ and A, on `chemDiagram` mode `isotopes` (boron). No stand-in.
- `~models` (H101 need 13): each stage wears its atom-model icon (Dalton, Thomson, Rutherford,
  Bohr, quantum). Stand-in gone: text-only stages.
- `s.10.bonding~ionic` (H108 part 2): `lewisStructure` ionic adds `charges: { metal: cp,
  nonmetal: cn }`, so every pair it solves is drawn (Al³⁺ with O²⁻ draws Al₂O₃). Stand-in gone:
  the assumption that the picture draws magnesium chloride only (it now names the ions drawn).
- `s.10.molecular-shape~polarity`, `~imf` (H101 need 9): CHCl₃, BF₃, CCl₄ and CH₂O get their
  `molecule` cards. Stand-in gone: the four text cards (every card is drawn now).
- `~water` (H101 need 10): the planned "Salt in water" scene, `hydration` { ions Na⁺ and Cl⁻,
  crystal }; the use line adds the dissolving question (NAEP-2009-12S10-#14).
- `s.10.reaction-types~combustion`, `~combustion-alkene` (H101 need 1, H108 part 1): `reaction`
  with the fuel `C{x}H{y}` drawn from the values and `most: 25` (octane's 25 O₂), so the atom
  tally shows again. Stand-in gone: the `lewisStructure` hydrocarbon drawing of the fuel alone.
- `~synthesis`, `~replacement` (H101 need 1, H105 part 15): `ions: true` (Al₂O₃ and ZnCl₂ drawn
  as ions; an assumption says so) and `most: 16`, so the ranges open up: Al 4–16 atoms (was 4
  or 8), Zn 1–8 (was 1–4).
- `s.10.stoichiometry~limiting-grams` (H101 need 4): built (it was waiting) from the demo, grams of
  N₂ and H₂ → moles → NH₃ each could make → the smaller → grams of NH₃, on `moleMap` with
  `limiting` (two columns, the smaller lit). No stand-in.
- `s.10.gas-laws~effusion` (H101 need 6): built (it was waiting) from the demo, M₁, M₂ and
  r = √(M₂ ÷ M₁) for H₂ and O₂, on `chemDiagram` mode `effusion`. No stand-in.
- `~partial-pressure` (H108 part 6): `gasPiston` `mixture` (He, O₂, N₂ by partial pressure, the
  total and helium's mole fraction). Stand-in gone: the pie of the three pressures.
- `s.10.thermochemistry~formation`, `~hess` (H101 need 5): built (they were waiting) from the
  demos, on `energyProfile` mode `ladder`: CH₄'s combustion from heats of formation (elements at
  0, reactants and products, ΔH lit) and C → CO → CO₂ with the given step flipped. No stand-in.
- `s.10.rates-equilibrium~average-rate` (H108 part 4): `chemDiagram` mode `rate`, [A] against t
  through both readings with the secant, the Δt and Δ[A] triangle and the rate. Stand-ins gone:
  the straight `functionGraph` line and its hidden m and b0 with their rules.
- `s.10.redox~oxidation-numbers` (H101 need 8): built (it was waiting) from the demo, the plan's
  x + h(+1) + o(−2) = q on `chemDiagram` mode `oxidation` with the formula H{h}SO{o} (H₂SO₄,
  SO₄²⁻, H₂S …). No stand-in.
- `~cell-voltage` (H108 part 5): `chemDiagram` mode `cell`, the galvanic cell of the two metals
  with its meter and the E° scale. Stand-in gone: the vertical number line of potentials.
- `s.10.organic~functional-groups` (H101 need 9): every card wears its `condensed` formula with the
  group lit; an assumption says so. Stand-in gone: text-only cards.
- `~isomers` (H101 need 9b): new calculator, a methyl group on the main chain's second carbon
  (n 3–7, c = n + 1, h = 2c + 2), on `lewisStructure` hydrocarbon `branches: [2]` (2-methylbutane
  is C₅H₁₂, like pentane). The plan had structural isomers as "No (need 9b)".
- `s.10.nuclear-chemistry~mass-defect` (H101 need 14): built (it was waiting) from the demo,
  U-238 → Th-234 + He-4, Δm and E = 931.5 × Δm, on `chemDiagram` mode `massDefect` (a broken
  axis so 0.0046 u shows; a limit keeps the mass after below the mass before). No stand-in.
