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
