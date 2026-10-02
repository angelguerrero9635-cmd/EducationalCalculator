# College: engine needs

What the eight college direction plans (`docs/plans/he.*.md`) need from the engine before their
pages can be built, merged into one list. Each plan numbered its own needs (math, physics,
chemistry, earth and geography, mechanical, electrical and computer: `E1`…; aero, civil and
chemical: `N1`…; biology: `1`…); **HE-E** items here merge them. Group tags: **M** math, **P**
physics, **C** chemistry, **EG** earth and geography, **B** biology and bioengineering, **ME**
mechanical, **ACC** aero, civil and chemical, **EC** electrical and computer. "From" names the
plan items merged (`ME-E1` is the mechanical plan's E1). Pictures are in
`docs/RENDERINGS_HE.md` (`HC1`–`HC191`); the biology plan's need 6 (log axes) is a picture
there (HC9), not an engine item.

The plans total **1,460 pages** (1,243 calculators, 217 layouts; 1,033 of them problem types),
522 marked ⏳. The plans listed **91** engine needs; merged, they are **32**.

## The four that block every college page

None of the 1,456 new pages (the four pilots aside) can ship before these. **All four are done
(2026-10-02)**; the pilots are redone to their plans (decision 6), with `~rates` and
`~transition` as the first topic problem types.

### HE-E1 Topic problem types (`<course>#<i>~<slug>`)

`problemTypes()` (`src/data/selectors.ts`) takes a K–12 skill id only. It, `moduleOwner`, the
topic route (`/course/<id>/topic/<i>`), search and the problem matcher corpus
(`scripts/build-match-corpus.mjs`) must take `<courseId>#<i>~<slug>`, with the topic page as
the owner of its types.

- **From:** M-E1 (every other plan's "Ids" decision assumes it).
- **Waiting:** every problem-type page: M 93, P 83, C 111, EG 119, B 87, ME 180, ACC 169,
  EC 191 (**1,033**).
- **Done:** `problemTypes`/`getProblemType` take a topic key (`ProblemType.topic`), routed by
  `topicRoute(course, i, slug)` to `/course/<id>/topic/<i>~<slug>` (`pageRoute`, `topicOf`,
  `topicPageId`, `TOPIC_TYPE_IDS`); the topic page, side menu, search, recents, nav bar, meta,
  matcher (`MatchResult.owner`) and corpus script (`topicKey`) list them as skills' types.

### HE-E2 College layouts

There is no `layouts/college*.ts`, and `getLayout`/`getPage` don't look up `#` ids. Add college
layout files read for `he.*` ids and the Grades 9–12 reading rules for courses in
`layouts.test.ts`.

- **From:** M-E2, P-E1; the chemistry plan's `layouts/collegeChemistry.ts`.
- **Waiting:** every sort, sequence, explore and observe page: M 13, P 4, C 36, EG 45, B 36,
  ME 26, ACC 24, EC 33 (**217**).
- **Done:** `layouts/college<Field>.ts` spread into `COLLEGE_LAYOUTS` and `LAYOUTS`, found by
  `getLayout`/`getPage` under `#` ids; `layouts.test.ts` takes a topic as owner, reads college
  pages at 35 words and checks each lookup (first page: `human-geography#0~transition`).

### HE-E3 College standards

`valueLimit()` in `standards.test.ts` returns `undefined` for a course id, so no college page
is held to a value cap, and the sentence limits key on grade. Map `he.` ids to the Grade 12
rules every plan adopted: sentences ≤ 35 words, ≤ 10 values a page (a matrix, point or vector
typed as one group counts once), the name first on every value, 2–4 assumptions (ME and ACC add
"≤ 20 words each").

- **From:** M-E3; the "Word rules" decision of all eight plans.
- **Waiting:** the tests of every page (**1,460**). No plan asks to relax a rule; pages that
  would pass 10 values are split into problem types instead.
- **Done:** `standards.test.ts` reads `he.` pages at Grade 12 (`rulesGrade`): sentences ≤ 35
  words, ≤ 10 values (a group once), 2–4 assumptions; human-geography#0 split to 9 + `~rates`.

### HE-E4 Splitting `college.ts`, and college ids in the scripts

`src/data/modules/college.ts` (690 lines, four pilots) can't hold 1,456 more pages. Decide the
split (see "Decisions for the owner") and build it: `src/data/modules/college/<field>.ts` and
`layouts/college<Field>.ts`, all spread into `COLLEGE_MODULES`. `scripts/new-module.mjs` and
`scripts/promote-demo.mjs` accept K–12 ids only (`<m|s>.<grade>.<skill>`); extend both to
college ids so builders scaffold pages and promote the pictures chat's demos.

- **From:** the "Ids" decision of every plan (math and physics: split at about 2,000 lines;
  biology and mechanical: at about 3,000; chemistry and aero-civil-chemical: before building).
- **Waiting:** no page by itself, but every page lands in the new files.
- **Done:** `college/<field>.ts` (the course's home field: its id's field, or an engineering
  course's first) spread into `COLLEGE_MODULES`; `pnpm new-module` and `promote-demo.mjs` take
  `he.<field>.<course>#<i>[~slug]` and create a missing field file (`scripts/college-files.mjs`).

## The other needs

### HE-E5 Units (with a temperature-difference dimension)

Add the units each group uses (fixed labels until then). Mechanical: MPa, GPa, ksi, N·m, kN·m,
lbf·ft, N/m, mm⁴, kJ/kg, kJ/(kg·K), W/(m·K), W/(m²·K), Pa·s, m²/s, kg/s, m³/s, rpm, Hz, μm,
microstrain, MPa√m, and **a ΔT dimension** (K = °C, °F = °R, converted without offset). Civil
and chemical: ksf, psf, kip·ft, kN/m³, in⁴, MGD, kmol/h, mol/s, J/(mol·K), mg/L, μg/m³, ppm,
veh/h, pc/mi/ln, bar, km³/s², L/(mol·min), $/yr. Electrical: H, mH, Hz–GHz, rad/s, ns, VA, var,
S, T, Wb, V/m, A/m, nH/m, pF/m, S/m, dB, dBm, dBi (logarithmic, never converted with the
others), pu, bits and bytes (KiB and kB), b/s. Physics: nm, pm, mT, N/C, kg·m², kg·m/s, N·s,
J·s, J/K, keV, MeV, u, Bq, W/m², A·m². Chemistry: M, mM, μM, g/mol, kJ/mol, kcal/mol, s⁻¹,
M⁻¹s⁻¹, cm⁻¹, Da, L/(mol·cm), Å. Earth: Sv, m/day, mm/h, mm/yr, mW/m², °C/km, mGal, nT, Ω·m,
dpm/g; Myr and years to seconds inside one relation. Biology: mmHg, mL/min, L/h, cP, cm²/s,
day⁻¹, kDa, MRayl (CFU/mL, cM, bp stay fixed labels).

- **From:** M-E10, P-E3, C-E1, EG-E1, EG-E8, B-1, ME-E1, ACC-N1, EC-E1.
- **Waiting (blocked):** ME 18 (the ΔT unit: mechanics-of-materials#1~thermal and all 17
  heat-transfer pages), EC 19, EG 2 (Sv; long-time conversions). **Upgraded** (fixed labels
  until then): most pages in every group.
- **Done:** `src/engine/units.ts` has 298 more units (404 in all) in 63 more dimensions, every
  one in the list above but the fixed labels it names (CFU/mL, cM, bp) and `$/yr` (HE-E30).
  A temperature difference is its own dimension: a value marked `difference: true` reads K,
  °C, °F and R as differences (10 °C → 10 K → 18 °F, no 273.15 or 32), and its US unit is °F.
  `kJ/(kg·K)`, `W/(m·K)` and `°C/km` are per-kelvin units with no offset. dB, dBm/dBW and
  dBi/dBd are three dimensions of their own; VA and var never convert to W; Hz never to rad/s;
  N·m (moment) never to J. Years convert to seconds (Julian year). Every unit added is
  `listed`: it acts as a unit only on a value that lists another unit beside it in `units` (or
  on a page with a unit set), so the K–12 pages that write Hz, nm, g/mol, u or days as labels
  are unchanged (their unit menus, systems and contexts were compared page by page before and
  after). "Sv" is the sverdrup (oceanography); dose pages use mSv and μSv.

### HE-E6 Calculus lines and notation

A step line that states the integral, derivative or ODE result and its closed form ("∫ from a
to b of (x² + 1) dx = 32/3", "W = ∫P dV = (P₂V₂ − P₁V₁) ÷ (1 − n)"), typeset by `toLatex` (∫
with limits like Σ, d/dx, ∂/∂T, ∇, D_u f, lim as h → 0, ⟨ ⟩, ħ), checked by the harness by
quadrature or a finite difference at the page's values, never solved symbolically. A **form
line** with the free variable ("V′(x) = 12x² − 240x + 900") checked at sample points.

- **From:** M-E4, M-E5, P-E2, C-E10, ME-E3 (calculus part), ACC-N10.
- **Waiting:** M every calc-1–3 and diff-eq page (100); P 13 (a `how` sentence until then:
  university-1#0~calculus, #2, ~power-law-force, university-2#0, electromagnetism#0, #1,
  quantum#0, #3, thermal-statistical#0, #1, classical-mechanics#0~atwood, #1); ME the
  thermodynamics#2–3, numerical-methods#0, #3 and ASM#2 topics; ACC reaction-engineering#1,
  propulsion#1, process-control#0, flight-mechanics#0~range; C none (assumptions and `how` only).

### HE-E7 Symbols and typesetting

Dotted symbols (ṁ, ṅ, Q̇, ξ̇), multi-letter subscripts (C_L, C_D0, S_ut, ΔT_lm, Re_L, Nu_D,
h_fg, T_h,in, f′_c, σ′₃, K_c,u) in `subscripts.ts` and `toLatex`; ⌊ ⌋ and ⌈ ⌉; roots of sums;
fractional exponents ((k − 1)/k).

- **From:** ME-E3 (rest), ACC-N14.
- **Waiting:** ME and ACC almost every page reads better; none blocked.
- **Status: done (2026-10-02).** Write them as text: ṁ, Q̇ and x̂ with combining marks (or
  precomposed ṁ, ŷ), 𝐅 or F⃗ for vectors, `T_wall`, `σ_max`, `T_h,in`, `f′_c` (subscripts up to 8
  characters, Greek too, in two parts with a comma), ∂, ∇, ħ, ⌊ ⌋, ⌈ ⌉. `subscripts.ts` draws the
  subscripts lowered (Unicode where it has the letters: σₘₐₓ); `toLatex` keeps marks and
  subscripts whole, italicises a marked symbol like any other, stacks ∂U ÷ ∂P, raises
  (P₂ ÷ P₁)^((k − 1)/k) and typesets **"∫ from a to b of (body) dx"** as ∫ with its limits (the
  `\int` node, drawn by `MathLine` like Σ; the body is a bracket, a term or sin(t); or "dX ÷
  (…)"). The screen reader hears "the integral from …", "partial U", "del", "m dot", "x bar",
  "floor of", "T sub wall". Indefinite ∫P dV stays text. ∫ result lines are checked (HE-E8);
  calculus form lines are HE-E6.

### HE-E8 Harness phrases

Teach `harness/evaluate.ts` (PHRASES) each group's words as pages are built: tension,
compression, sagging, quality, isentropic, film temperature, found numerically, Colebrook, by
trial, branch, governs, case, for a first-order, Routh, LMTD, compass rule; dB, dBm, ∠, j, log₂,
⌈ ⌉, mod, Σ; `(2n − 3)!!`, base-10 log, fractional powers (64^0.75), 10^(−t ÷ D), primes and
bars in names (p′, w̄). A sign-convention check (tension +, heat in +, work out +) on pages that
state one.

- **From:** ME-E10, ACC-N13, EC-E11, B-2 (phrases), EG-E3 (phrases).
- **Waiting:** every page, as it is built.
- **Status: done for the listed words (2026-10-02); new words join as pages are built.**
  `harness/phrasesHe.ts` (first in PHRASES) and `evaluate.ts` read: ∫ with its limits worked out
  by quadrature at the page's values ("∫ from 0 to 0.5 of dX ÷ (0.2 × (1 − X))"); `log(…)` and
  `log 1000` as base 10, `log₂`, `ln 2` without brackets, `20 log₁₀(…)` (a number before a
  function multiplies it), `min(…)`, `max(…)`; `n!!`; `10∠36.87°` (its magnitude; "the real part
  of", "the imaginary part of"), `|8 + j6|`, "the angle of (8 − j6)"; a level in dB, dBm or dBi
  as its number, "dB as a power ratio", "dB as a voltage ratio", "dBm in W", "mW in dBm"; the
  sign words (tension +, compression −, sagging +, hogging −, heat in +, heat out −, work out
  +, work in −); label words that leave a number as it is ("(found numerically)", "by trial",
  isentropic, film temperature, quality, Colebrook, governs, case n, branch n, LMTD, Routh,
  compass rule, integrated, ", for a first-order …"); `LMTD(a, b)`. Already read: ⌈ ⌉, ⌊ ⌋,
  mod, Σ from …, 64^0.75, 10^(−t ÷ D). A name's e with a prime or mark (e′, ē) is never Euler's
  number. Complex arithmetic with i or j, polar values and matrices are read by HE-E16 and
  HE-E17 (`harness/algebraLines.ts`). **Left:** a sign-convention _check_ per page (the phrases give the sign; a page that states a convention
  still needs its own assertion in the sampling test, when the first such page is built).

### HE-E9 Constants registry and g per page

One registry (R in J/(mol·K) and L·atm/(mol·K), F, N_A, h, c, k_B, R_H, a₀, e, ε₀, μ₀, mₑ, u,
K_w, 0.05916 V, σ, G, GM, Earth radius, γ and R of air), step lines that print "R = 8.314
J/(mol·K)", the harness reading it; **g per page**, so a picture never hard-codes 9.8 (the
owner's decision below).

- **From:** C-E2, EG-E10; the "Constants" decision of every plan.
- **Waiting:** EG meteorology#1, oceanography, geophysics#1 pictures; every page reads its
  constants from one place.
- **Done:** `src/engine/constants.ts`: `CONSTANTS` (39: g, g₀, G, c, h, ħ, k_B, N_A, R in
  J/(mol·K) and L·atm/(mol·K), F, e, ε₀, μ₀, k, mₑ, mₚ, mₙ, u, σ, R_H, R∞, a₀, K_w, the Nernst
  slopes at 25 °C and 37 °C, V_T at 300 K, Earth's GM, mass, mean and equatorial radius, the
  Sun's mass and GM, AU, γ and R of air, 1 atm, 273.15 K, V_m), each with its symbol, the value
  pages compute with and print, its unit and the precise value behind it. `gFor(pageId)` and
  `constant('g', pageId)` give 9.81 on `he.` pages and 9.8 on K–12 pages; `constantLine('R')`
  prints "R = 8.314 J/(mol·K)"; `readConstant(line, pageId)` reads such a line back for the
  harness (wiring it into `harness/evaluate.ts` and the pictures' `g` is left to their owners).
  No K–12 page's numbers changed.

### HE-E10 Number display and range

Display and harness tolerance from 10⁻³⁵ to 10³¹ (relative, 4 significant figures);
scientific notation kept with its number in steps; exponents beyond ±30 (K = 1.5 × 10³⁷); 3–4
significant figures by page; pH decimals from the concentration's figures; signed charges (+3,
−1) and °′.

- **From:** P-E7, C-E14.
- **Waiting:** P university-3, quantum and thermal-statistical pages (about 45); C pages with
  large K or pH answers.
- **Status: done (2026-10-02).** Display already reached 10⁻³⁹ to 10³⁹ (scientific notation
  past 10⁷ and under 10⁻⁴; `sigFigs`, `figures`, `worked`, `scientificFigures` set 3–4
  figures by page). New: the harness compares values under 10⁻⁴ relative to their size (half a
  percent; the absolute floor let any two pass), the solver's zero floor for a scientific value
  with no step is 10⁻⁴⁵, `parseNumber` reads "1.5 × 10^37" exactly; `decimals` (pH 2.60 with its
  zeros) with `figuresIn` and `logDecimals` for the concentration's figures; `signed` (+3, −1)
  and `signedText`; `engineering` (47 × 10³) for a plan that asks; `MathLine` never wraps
  "6.626 × 10⁻³⁴" between its parts. °′ is plain text (ΔG°′). Values from 10⁻⁴ up keep the K–12
  tolerance.

### HE-E11 Category answers

A derived answer that is a word or a letter from thresholds, with its own choice box and a
harness check: converges or diverges, the damping regime, one, none or many solutions, the
equilibrium type, QAP field, Köppen class, ENSO phase, burn severity, FS stable or not, the
nearest class, LOS A–F, USCS group, tension-controlled, short or slender, which combination
governs, underdamped, Θ(n log n), stable. Until then the class goes in the picture's caption.

- **From:** M-E6 (answer part), EG-E5, ACC-N5, EC-E10.
- **Waiting:** M 7 (calc-1#0, calc-2#1, calc-2#3, calc-2#4~radius, diff-eq#1, diff-eq#3,
  linear-algebra#0); EG about 10; ACC about 7 (soil-mechanics#0, transportation#3,
  steel-design#0, concrete-design#0, #2, process-control#3, process-design#3); EC 4
  (circuits-1#4~rlc-damping, control#1~step-error, data-structures#3~master, networks#2).

### HE-E12 Piecewise and choice-switched relations

A relation whose formula switches by a case or a choice value (order 0/1/2, inhibitor type,
lattice type, Euler or inelastic buckling, NC or OC clay, S < L or S > L, A_s,min), with min,
max and floor (`derived`) and a rejection for an empty result; solved forward and, where single
valued, backward; the step names the case and why; the harness samples each choice.

- **From:** M-E6 (relation part), C-E11, EG-E6, ACC-N9.
- **Waiting:** C gen-chem-2#0, biochemistry#0, #1~inhibition, inorganic#3; EG
  historical-geology#2, mineralogy#2, cartography#2; ACC aerospace-structures#2,
  steel-design#1–3, soil-mechanics#2, transportation#1, concrete-design#0, #2.

### HE-E13 Named choices and data rows

An `allowed` choice shown by name (electron, proton, alpha; hoop, disk; monatomic; Earth, Sun)
that sets one or several values: an acid's Kₐ, a half-reaction's E°, bond enthalpies, Madelung
constants, Δₒ and P; W-shapes (A, r, Z, I, d, t_w), bar sizes #3–#11, compounds (T_c, P_c, ω,
Antoine A, B, C), standard pipe sizes, slab cases. Rows are facts entered by hand, never a copied
table.

- **From:** P-E8, C-E3, ACC-N4.
- **Waiting:** P about 15; C gen-chem-1#3~bond-enthalpy (⏳; improves gen-chem-2#2, #4,
  inorganic#2, #3~born-lande); ACC steel-design#1–2, concrete-design#0, #2–3,
  chemical-thermodynamics#0, #2, hydraulics-hydrology#3, material-energy-balances#3.

### HE-E14 Iteration and trial steps

The solver's root finder already solves implicit relations; the walkthrough must show it: two
or three trial values and the converged one ("Try M = 2.2: A/A\* = 2.005; …"), or a table of
iterations (n, xₙ, f(xₙ), error) with the stopping rule, read by the harness. One-variable root
finding with a bracket for transcendental equations (finite well, Kepler's equation).

- **From:** ACC-N2, EG-E7, ME-E6, EC-E5, P-E10.
- **Waiting:** ACC compressible-flow#0–3, orbital-mechanics#1~kepler, hydraulics-hydrology#0,
  #1~parallel, chemical-thermodynamics#0, #2, concrete-design#0; EG hydrology#1,
  physical-geography#0~declination; ME 5 (numerical-methods#0, ~bisection, #1~gauss-seidel, #4,
  ~rk4); EC 4 (embedded#3~response-time, OS#1~round-robin, OS#2~replacement, power#0~load-flow);
  P none now (proposed quantum#1~finite-well and a Kepler-time page).

### HE-E15 Branches and ordered roots

Where a relation has two or three physical roots: a value the student picks (subsonic or
supersonic, weak or strong shock, the alternate depth, vapor or liquid volume) that the solver
keeps to; roots filled in order (σ₁ ≥ σ₂ ≥ σ₃, ω₁ < ω₂); the quadratic formula's lines with the
negative-concentration root rejected in one line and the small-x check.

- **From:** ACC-N3, ME-E4 (ordered roots), C-E4.
- **Waiting:** ACC compressible-flow#0–2, hydraulics-hydrology#0, chemical-thermodynamics#0,
  concrete-design#0; ME ASM#0, ~invariants, vibrations#3; C gen-chem-2#1, #2, ~weak-base,
  ~common-ion.

### HE-E16 Linear algebra in steps

⟨a, b, c⟩ arithmetic (dot, cross, scale, sums), matrix products and A − λI lines evaluated by
the harness, 3 × 4 groups and 4-vectors; 2 × 2 (later 3 × 3 and 4 × 4) systems solved together
as one relation whose steps are `matrixGrid`'s Cramer or row-operation lines (K u = F);
symmetric 2 × 2 and 3 × 3 eigenvalues (stress tensor, K − ω²M); λ² − (trace)λ + det = 0.

- **From:** M-E9, P-E5, ME-E8, ME-E4 (eigenvalues), EC-E8.
- **Waiting:** M calc-3, diff-eq#3, linear-algebra (about 40); P 4 (university-2#2,
  classical-mechanics#4, ~chain, quantum#3~two-level); ME FEA#0, #2~beam,
  numerical-methods#1, vibrations#3; EC 3 (circuits-1#1, ~mesh, ~supernode; closed form until
  then).
- **Status: done but for 4 × 4 lines and K − ω²M (2026-10-02).** `src/engine/linalg.ts` writes
    each line true as printed, exact fractions where they are ones (1/3, −7/2): a matrix
    "[[1, 2], [3, 4]]" (augmented "[[1, 1 | 6], …]"), a vector "⟨1, −2, 3⟩"; `matVecLines`,
  `matMulLines` (one line, or a line a row past 4 entries); `detLines` (2 × 2 arithmetic, 3 × 3
    by cofactors along the first row, then the minors' arithmetic, the products, the value);
  `cramerLines` (D, then Dⱼ and xⱼ = Dⱼ ÷ D each); `inverseLines` ([A | I], one row operation a
    line, "R₂ → R₂ − 2R₁: […]", A⁻¹ and its check A × A⁻¹ = I; a singular A stops at the row of
    zeros); `rrefLines` (pivots and rank), `rankNullityLines` (nullity = n − rank and each null
    basis vector with A × v = 0); `eigenLines` (det(A − λI) worked to the characteristic
    polynomial, the roots by the quadratic formula (2 × 2, real or a ± bi) or each root of the
    cubic checked "λ = 3: 3³ − 6 × 3² + 11 × 3 − 6 = 0" (3 × 3), then A − λI, an eigenvector as a
    whole multiple and "A × v = λv"); `dotLine`, `crossLine`, `normLine`, `projectionLines`
    (u · v, v · v, the projection, the part square to v and its dot product 0). The harness
    (`harness/algebraLines.ts`, run by `sampling.test.ts` on every step's lines) reads matrices,
    vectors, det, ᵀ, ⁻¹, I, λ as a variable (a polynomial line is checked at four values of λ), ±
    and "or", and checks each row operation against the matrix before it; `evaluate` reads
  `det [[…]]` in a substituted line. Pages: `matrixVariables`/`vectorVariables` declare the
    group (3 × 4 and 4-vectors too; a group counts once), `matrixOf`/`vectorOf` read it, and
  `cramerRules` (written.ts) solves A x = b with D and each unknown a relation whose steps are
    the determinant and Cramer lines (K u = F, node and mesh equations). **Left:** 4 × 4
    determinants print only their value (no cofactor lines); K − ω²M needs its own line
    (det(K − ω²M) = 0 in ω²; today a page can use the eigenvalues of M⁻¹K); a cubic's irrational
    roots print as decimals (checked within display rounding), not surds; a system solved by row
    operations has the lines (`rrefLines`) but no page helper yet (a page puts them in a step's
  `work`).

### HE-E17 Complex values

A value that is a + jb (or A∠θ), with product, quotient, conjugate and polar ↔ rectangular
lines, and the picture reading both parts; a value pair α ± βi from one relation ("r = −1 ± 3i").

- **From:** EC-E2, M-E7.
- **Waiting:** EC 4 (electromagnetics#0~input-impedance, power#0~load-flow,
  power#1~sync-generator, power#2~sym-components; later parallel impedances in circuits-2#0); M 4
  (diff-eq#1, ~characteristic, diff-eq#3, linear-algebra#3~complex).
- **Status: done but for the one-box entry and solving backwards (2026-10-02).**
  `src/engine/complex.ts`: the value (`Complex`), its arithmetic, and the text a page shows:
  "3 + 4i", "2/5 − 1/5 i" (math), "8 + j6", "40 − j30", "−j6" (electrical, decision 9), polar
  "10∠36.87°" (`complexText`, `polarText`, the page's `show` for figures or fractions). Lines:
  `complexSumLines`, `complexProductLines` (term by term, then i² = −1), `complexQuotientLines`
  (by the conjugate of the bottom, its c² + d², the parts), `polarProductLines` and
  `polarQuotientLines` ((10 × 2)∠(30° + 45°)), `toPolarLines` (|z| = √(a² + b²), θ = ∠(z) =
  tan⁻¹(b ÷ a) ± 180° on the left half), `toRectangularLines` (r cos θ + jr sin θ),
  `conjugateLine`; `parseComplex` reads a typed "8 − j6", "3 - 4i" or "10∠36.87°". The harness
  reads i, j, ∠, polar and rectangular arithmetic, √ of a negative number, ± pairs ("r = (−2 ±
  √(4 − 40)) ÷ 2 = −1 ± 3i") and a conjugate "(3 + j4)*", and checks each chain; `evaluate`
  reads Re(…), Im(…), arg(…) and |…| of a complex expression in a substituted line. One value
  on a page: `complexVariables` (real and imaginary parts) or `polarVariables` (magnitude and
  angle, as a phasor is given) declare it as one group (counted once), `complexOf` reads it,
  and `complexRule` (written.ts) works a complex value from complex and real inputs as two
  relations: the real part's step shows the worked lines, the imaginary part's ends with the one
  value ("→ Z_in = 40 − j30 Ω = 50∠−36.87° Ω"). Tested on the plans' input impedance (50 Ω line,
  100 Ω load, λ/8 → 40 − j30 Ω) and synchronous generator (E = V + jXₛI) as test-only pages.
  `complexPlane` already takes `{ re, im }` or `{ modulus, argument }` ids, so a group draws as
  it is. **Left:** a box that takes "8 + j6" as one typed value (the two parts are two boxes;
  `parseComplex` is ready for it); a complex value is found forward only (no input worked back
  from a complex result); α ± βi as one solver value (a page gives α and β as two values and
  says "r = α ± βi" in its note; HE-E6 names the case).

### HE-E18 Exponentials, logs and powers in solves and the simplifying chain

Solving t from 1 − e^(−t/τ) and r from 10 log(I ÷ I₀) with "Take ln of both sides"; ln, log₁₀,
eˣ, 10ˣ, a power of a quotient ((1,000 ÷ p)^0.286), fractional powers and ∜ worked one stage a
line; solver inverses (θ → [L] for Hill, t from H_t, p from the Jukes–Cantor distance).

- **From:** P-E4, EG-E3, B-2 (step text), B-5.
- **Waiting:** P 6 (university-1#1~drag, #3~rocket, university-2#2~rc-charging,
  #3~rl-circuit, university-3#0~intensity-db, #4~decay-law); EG meteorology#0–2,
  historical-geology#1, hydrology#1, climatology, physical-geography#3; B evolution#2~tree-count.

### HE-E19 Angles: units, atan2, bearings, DMS

Calculus pages in radians, polar and parametric pictures in degrees with a derived radian value;
"rad" as a label; atan2 with the quadrant named; inverse trig in degrees; a compass bearing
0–360°; input and display of 4°30′00″ and N 52°10′ E, with arithmetic on them in steps.

- **From:** M-E12, P-E6, EG-E4, ACC-N6, EC-E7 (atan2).
- **Waiting:** M calc-1#1~trig, calc-2#5, diff-eq#1; P 3 (university-1#5, #0~projectile-at-t,
  #3); EG geophysics#0, #1~paleolatitude, mineralogy#0, cartography#1, physical-geography#0,
  #2, gis#2; ACC surveying#0–2; EC every phasor page.

### HE-E20 Special functions

erf, erfc and their inverse; sinh, cosh, tanh, coth; Q(x) (from the normal tail already
drawn); sinc; each in relations, `toLatex` and the harness ("erf(0.329) = 0.359, from the error
function").

- **From:** ME-E7, ACC-N8, EC-E7.
- **Waiting:** ME materials-science#1, heat-transfer#0~fin, engineering-programming#0, #3,
  numerical-methods#0~bisection; ACC reaction-engineering#3~effectiveness; EC 2
  (comm#1~bpsk-ber, signals#2~pulse-spectrum).

### HE-E21 Integer functions, bases and big integers

⌊ ⌋, ⌈ ⌉, mod, round, exact log₂ of a power of 2, min and sort of a short list as step lines;
whole numbers shown and typed in base 2, 8 or 16 at a width (two's complement) and IPv4 dotted
quads; exact integers past 2⁵³ (n!, C(n, r), 2⁶⁴); C(n, k) past row 12 with ln Ω by Stirling.

- **From:** EC-E3, EC-E4, EC-E9, P-E9, ME-E7 (floor and ceiling).
- **Waiting:** EC 25 (integer functions) + 6 (bases) + discrete#2 at large n; P 2
  (thermal-statistical#1~einstein-solid, ~two-state).

### HE-E22 Sums, series and recurrences

`partialSum(term, N)` up to N = 1,000, a recurrence table (aₙ from a₀, a₁), n! in the harness;
confirm `expandSums` reads fixed-count sums with names ("Σ (O − E)² ÷ E = 0.278 + 0.133 + …").

- **From:** M-E8, B-3.
- **Waiting:** M calc-2#3, calc-2#4, diff-eq#4 (about 13); B none (a check).

### HE-E23 Data lists

A typed list with its length (1–8 numbers, or replicate readings and calibration standards):
mean, s, least-squares slope, intercept and r²; x[n] and h[n] with Σ over an index; a table of
ordinates; a whole number read off a picture's construction (McCabe–Thiele stages).

- **From:** EG-E2, C-E13, ACC-N7, EC-E6.
- **Waiting:** EG climatology#2~trend; C analytical#0, #2~calibration; ACC
  separations#0~mccabe-thiele; EC signals#1.

### HE-E24 Limits with reasons, inequality answers, out-of-domain messages

Page limits written as limits, never relations, each with a reason a student reads (N₀ < K,
p < 0.75, RF ≤ 50%, C_out ≤ C_in, r_i < r_o, 0 ≤ x ≤ 1, σ_cr below σ_Y, Re below 5 × 10⁵);
limits comparing two values; answers that are a least value ("Δp ≥ …", printed "at least");
out-of-domain messages ("midnight sun" when |tan φ tan δ| > 1; no runoff when P ≤ I_a; no head
wave when v₂ ≤ v₁).

- **From:** B-4, ME-E9, P-E11, EG-E9.
- **Waiting:** ME mechanics-of-materials#5~slenderness, fluid-mechanics#5, thermodynamics#0,
  cad-graphics#1~virtual; P university-3#3~uncertainty, university-1#4~ladder; EG
  physical-geography#0, hydrology#1, geophysics#0; B none (the reasons are new text).

### HE-E25 Layout text and sequences

Sort cards and sequence stages that hold chemistry text (subscripts, charges, arrows,
(2R,3S)-stereodescriptors, Greek letters; the reading checks count a formula as one word) and
code in a code font with straight quotes; sequences with no time spans (or spans hidden);
signed sequence spans (ATP per glycolysis step, net +2).

- **From:** C-E15, C-E12, ME-E11, ACC-N11.
- **Waiting:** C 36 layouts (the chemistry plan puts this first); ME 5 (programming sorts and
  the trace page); ACC 7 sequences; C biochemistry#2 (spans).
- **Status: done for sorts and sequences (2026-10-02).** Chemistry is written as text on cards
  and stages (H₂O, Fe³⁺, ⇌, (2R,3S)-…; `K_a` drawn lowered) and `layouts.test.ts` counts a
  formula with subscripts or a charge as one word. `code: true` on a sort or sequence draws
  its cards or stages in a code font exactly as written (`LabelText`; straight quotes, no
  subscripts from `_`) and skips the copy-editing checks for them. `signed: true` on a
  sequence shows signed spans and a net total ("−1 + 0 − 1 + … = +2", "Net: +2 ATP"). A
  sequence with no spans shows stages only (N11 needed nothing new). The wrong-tap hint keeps
  a stage's capitals (CO₂, NADH, Prophase I). **Left:** code text in explore scenes (ME-E11
  mentions them; no plan page needs one yet).

### HE-E26 Formula unit sets

A page names its working set ("N–mm–MPa", "SI base", "kJ–kg–K") and the steps convert into it
first, so they read like the textbook (σ = 50,000 N ÷ 314.2 mm²).

- **From:** ME-E2.
- **Waiting:** ME every solid-mechanics page (mechanics-of-materials 24, advanced-solid-mechanics
  14, FEA 14, machine-design 15: about 67).
- **Done:** `src/engine/unitSets.ts`: `UNIT_SETS` (SI base, N–mm–MPa, kN–m–kPa, kip–in–ksi,
  lbf–in–psi, kip–ft–ksf, kJ–kg–K, Btu–lb–R). A page sets `unitSet: 'N-mm-MPa'` or
  `{ metric: 'N-mm-MPa', us: 'kip-in-ksi' }` and writes its values in the set; a value typed in
  kN or m² converts into it first (the usual "F = 50 kN = 50,000 N" line), and under US
  customary a page with a US set shows every value in that set (squares and fourth powers of
  its length implied: in², in⁴) and works the steps in it directly, with no conversion lines.
  `unitSetProblems(page)` (run on every page that names a set) reports a value not written in
  its set and a set the relations don't hold in.

### HE-E27 Water and steam properties

A routine from the public IAPWS-IF97 equations: saturation by T or P (P_sat, T_sat, v_f, v_g,
h_f, h_fg, s_f, s_fg) and superheated v, h, s; later R-134a and air's c_p(T). Pages keep typed
table values until then (fully usable).

- **From:** ME-E5, ACC-N4 (steam rows).
- **Waiting (for automatic look-ups):** ME thermodynamics#0, #1~steady-flow, #3~rankine,
  ~refrigeration; ACC material-energy-balances#3; the vapor dome of HC17.

### HE-E28 Statistics critical values

t (two-sided, by df and confidence), Dixon's Q and Grubbs' G by n, with harness phrases ("t for
4 degrees of freedom at 95%").

- **From:** C-E5.
- **Waiting:** C analytical#0 and its types.

### HE-E29 Chemistry structure models

Whole-number ratios (multiply by 2–6 until all are within 0.05 of a whole); diatomic MO filling
(the N₂ and O₂ orders), bonding and antibonding counts, unpaired electrons; Hückel cyclic levels
(Frost); d-orbital filling by geometry and spin with CFSE; character tables (C₂ᵥ now; C₃ᵥ, D₃ₕ,
T_d, D₄ₕ, O_h as data) with the reduction formula's lines.

- **From:** C-E6, C-E7, C-E8, C-E9.
- **Waiting:** C gen-chem-1#1, ~hydrate; gen-chem-1#4~bond-order (⏳), physical-2#3~huckel
  (⏳); inorganic#2 (⏳); inorganic#0~reduce beyond C₂ᵥ.

### HE-E30 Money

$ values with thousands separators and a money unit in relations (annuity factor, NPV); the
`dollars` formatter exists, the unit does not.

- **From:** ACC-N12.
- **Waiting:** ACC process-design#0, #2.

### HE-E31 Integral templates in equation inputs

`∫_{a}^{b} ({p}x² + {q}x + {r}) dx = {I}` with boxed limits.

- **From:** M-E11.
- **Waiting:** M calc-1#3, calc-1#4, calc-2#0 (rows until then).

### HE-E32 Typed functions (later)

A small parser for a student's own f(x) with a symbolic derivative and antiderivative
(polynomials, exp, ln, sin, cos, products, compositions). Lifts the math plan's "Partly (E13)"
marks; no page waits.

- **From:** M-E13.

## Suggested order

| Step | Needs                                                  | Why                                                                                      |
| ---- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| 1    | HE-E4 (decide the split), HE-E1, HE-E2, HE-E3          | Nothing ships without them; decide the split first so E1–E3 are written against it       |
| 2    | HE-E5, HE-E9, HE-E7, HE-E8 (ongoing), HE-E25           | Every page reads right; the ΔT unit unblocks 18 mechanical pages; chemistry's 36 layouts |
| 3    | HE-E6, HE-E10, HE-E16, HE-E26                          | Calculus lines gate math and physics; linear algebra and unit sets gate solid mechanics  |
| 4    | HE-E11, HE-E12, HE-E14, HE-E15, HE-E19, HE-E18, HE-E21 | The bulk of the ⏳ engine waits (categories, cases, trials, branches, angles, integers)  |
| 5    | HE-E13, HE-E17, HE-E20, HE-E22, HE-E23, HE-E24         | Smaller groups of pages; each page ships with a typed value or a closed form until then  |
| 6    | HE-E27, HE-E28, HE-E29, HE-E30, HE-E31, then HE-E32    | One course each, or a convenience over typed values                                      |

Pictures run alongside: `docs/RENDERINGS_HE.md` round 1 (HC1–HC13) unblocks about 220 pages.
Each engine change is tested by the ids it is about (`MODULE_IDS=…`), never by a heavy run
without the owner's approval.

## Decisions (settled 2026-10-02)

The owner answered 1–7; the lead settled the rest (marked) following the owner's answers. Each
can be revisited.

1. **g = 9.81 m/s² on every college page** (owner). Grades K–12 keep 9.8. Earth radius: name the
   one a page uses in its assumption (6,371 km mean; 6,378 km equatorial on orbit pages).
2. **⏳ pages with no stand-in wait for their picture** (owner). They are not shipped on `none`.
3. **Design codes** (lead, owner delegated): AISC 360-22 (LRFD), ACI 318-19, ASCE 7-22, AASHTO
   Green Book 2018, AASHTO 1993 pavements, HCM 7th edition, each named in one assumption. US
   customary leads on steel, concrete, pavement and capacity pages (as the US courses teach);
   SI everywhere else. Code data (W-shapes, bar areas) is entered as facts by hand, never copied
   tables.
4. **OpenStax: titles only** (owner). No exercises or text. The ACS olympiad papers and exams stay
   off limits. Nothing a page shows may need an attribution: pages are original; research stays
   reference-only and is never shipped.
5. **Split `college.ts`: one file per field** (owner): `src/data/modules/college/<field>.ts` and
   `layouts/college<Field>.ts`.
6. **Pilot pages are redone to match their plans** (owner): circuits-1#0 labels "Resistance 1
   (R₁)"; human-geography#0 trimmed to 9 values with `~rates`; university-1#0 on `motionGraph`
   velocity with "Displacement (Δx)"; calc-1#1 on `functionGraph` tangent once HC37 is drawn.
   Done 2026-10-02 but for calc-1#1, which keeps its `plot` (and gains its use line) until
   **HC37** is drawn; move it then (a comment on its picture says so).
7. **Licence mismatch on Chemistry 2e and Biology 2e** (owner asked what it means): with titles
   only, nothing. Only chapter and section titles are recorded from any OpenStax book, and
   titles carry no licence terms. The mismatch would matter only if their text or exercises
   were stored, which the rule above forbids. The research chat records the licence each book
   states today in `research/textbooks/sources/`, for the record.
8. **Value cap ≤ 10 a page on college pages** (lead): split a page rather than raise it.
9. **Notation** (lead): j on electrical pages, i on math pages; KiB for memory, decimal prefixes
   for networks; thermal voltage 25.85 mV at 300 K; 61.5 mV at 37 °C on biology pages.
10. **Property tables** (lead): steam, refrigerant, fits and factors are typed by the student from
    their own table until HE-E27; HE-E27 builds water and steam from the published IAPWS-IF97
    equations (the equations, not a copied table).
11. **NCEES FE Reference Handbook** (lead): table of contents only, like OpenStax.
12. **Question records** (lead): question text only from public-domain, CC BY and CC BY-SA
    sources; the question type only from all others (MIT OCW included). Records stay in
    `research/` and are never shipped, so no page needs an attribution.
13. **Taxonomy gaps** (owner authorized taxonomy updates): the needed ones in
    `docs/HE_TAXONOMY_GAPS.md` are added to `taxonomy.ts` and logged in `TAXONOMY_ISSUES.md`.
