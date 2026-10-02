# Engine log

After every section review, the findings that the engine (solver, step builder, shared
helpers, pictures, tests, harness) could have prevented are turned into engine work before the
next section is written, so each section starts from a better engine than the last. One entry
per review; each line names the finding and what the engine now does about it.

## HE-E19: angles as units, atan2, bearings and DMS

- **An angle was a number with a ° label**, so no page could take 4°30′00″ or N 52°10′ E, show a
  surveyor's angle, or convert degrees to radians in its steps; each grade file kept its own
  `sin(d * RAD)`. → `engine/angles.ts` (trig in degrees, `atan2D`, `azimuthD`, both answers of
  sin⁻¹ and cos⁻¹, DMS and bearing text and parsing) and the `angle` dimension in `units.ts` (°,
  rad, grad, ′, ″, rev, mrad, μrad, all `listed`: K–12 labels unchanged). `VariableDef.angleForm`
  shows a value as DMS, a bearing or an azimuth in boxes and steps and takes it typed;
  `conversionRule` writes "180° = π rad" in a conversion line.
- **tan⁻¹(y ÷ x) gives the wrong quadrant when x < 0**, and nothing checked it. → `atan2Lines`
  names the quadrant ("(−8, 6) is in quadrant II: add 180°") and writes the turn; `bearingLines`
  does the same for a compass bearing; `atan2Rule` and `bearingRule` (`data/modules/angles.ts`)
  make them a page's forward-only rule. The harness (`harness/angles.ts`) checks the quadrant and
  compass claims against the signs and fails a tan⁻¹ of a negative bottom left unturned.
- **The evaluator stopped at a degree mark** outside sin( ) and could not read rad, atan2, DMS or
  bearings. → `evaluate` reads them (a lone 12.5′ is its number; 4°30′ is 4.5°), and a line marked
  "rad" reads in radians on a page of degrees. DMS sides are compared to half their last part
  (one second), not the 0.2% of display rounding.
- **A template's "−0" rule dropped the sign of −0°00′05″** → `renderTemplate` keeps a minus before
  a DMS angle; `sin({α})` with a DMS α no longer adds a second °.
- K–12 text unchanged (every listed unit is a label without `units`; no K–12 value has
  `angleForm`). Ids run: m.10.right-triangle-trig, m.10.law-sines-cosines, m.11.unit-circle,
  m.12.vectors, s.11.kinematics-2d, s.11.dynamics-vectors and every `he.` page; tests
  `engine/__tests__/angles.test.ts`, `harness/__tests__/angles.test.ts` (every form on 300 random
  points, each wrong variant caught), `__tests__/angles.test.ts` (test-only plan pages).

## HE-E6: calculus lines and notation in steps

- **The solver is numeric, so a calculus page states closed forms, and nothing read them**: a
  form line "V′(x) = 12x² − 240x + 900" was unreadable to the harness, an antiderivative at its
  limits or a limit could not be checked, and a wrong derivative would pass. →
  `harness/calculus.ts` reads a walkthrough's lines (and checks) in order, clause by clause
  (" → ", ", so ", "; "), and checks each numerically, never symbolically: a **form** with its free
  variable (`f(x) = …`, `y(t) = …`, `f(x, y) = …`); a **derivative form** (`f′(x)`, `f″(x)`,
  `dy/dx`, `d²y/dx²`, `d/dx (…)`, `f_x(x, y)`, `f_xy`, `∂f/∂x`, `∂f ÷ ∂y`, `∂²f/∂x∂y`) against
  central differences of the stated function at seven sample points (or read there, when the
  function isn't stated); a **value** at a point (`f′(2) = 3(2)² − 4 = 8`, `f_x(1, 2)`,
  `∂f/∂x at (1, 2)`, `dy/dx at x = 2`, `y(3)`, `y′(0)`) against every side that reads; a
  **definite integral** with its antiderivative (`∫ from 0 to 2 of x² dx = [x³ ÷ 3] from 0 to 2 = 8 ÷ 3`:
  quadrature, F(b) − F(a), and F′ = the integrand between the limits, so an antiderivative
  right only at its ends fails) and an **indefinite** one (`∫ 3x² dx = x³ + C`); a **limit**
  (`lim x → 2 of …`, `lim as h → 0 of …`, `x → 0⁺`, `x → ∞`); an **ODE** with its closed-form
  solution (`y′ = −0.2y` with `y(t) = 50e^(−0.2t)`, `y″ + 2y′ + 5y = 0` with the under-,
  critically and overdamped solutions), its residual within 2 parts in 1000 of its terms (a
  frequency shown to 4 figures passes). A clause in letters (a rule: "f′(x) = n·c·xⁿ⁻¹",
  "∫ from a to b of f(x) dx") is not checked.
- **`evaluate` reads the new pieces anywhere** (substituted lines and checks too): `[F] from a
to b` as F(b) − F(a) (its one letter is its variable), `lim … of …` evaluated near the point
  (from both sides, extrapolated from h and h/2; slow ones like √x at 0⁺ from 10⁻⁴, 10⁻⁶, 10⁻⁸;
  far out for ∞; sides that disagree or values that run off give no limit), and forms with
  their letters put in (`evaluateAt`, `plugIn`, `implicitTimes`: 3(2)², 50e^(…), 2cos(…),
  (1 + 3t)e^(−2t), 2xy; never 1e-7 or sin⁻¹). The ∫ integrand uses the same reading, so
  `(50e^(−0.2t)) dt` reads now.
- **Pages need to write form lines with their signs** → `college/forms.ts`: `termsForm`,
  `polyForm([12, −240, 900])` = "12x² − 240x + 900", `polyDerivative`, `expForm(50, −0.2)` =
  "50e^(−0.2t)". Put form lines in a step's `work` (or a relation's `check`); `how` is a
  sentence and is not read.
- **Grades 9–12 primes are names, not derivatives** (x′ and y″ for image points, A′ and C′ on
  rotated conics). → the sampling test runs the checker only on college pages and lines with a
  calculus mark (`CALCULUS_MARK`: ∫, ∂, lim, `] from … to`, d/dx, dy/dx, f′(…), f_x(…)); an ODE
  is read only when its function is stated as a form in one variable; a substituted line with
  numbers only ("f′(x) = 2 × 1 × 1.5") is a value at the page's point, not a form. K–12 step
  text is unchanged (no step-building code changed); m.12 limits-intro, matrix-transformations,
  polar-conics~rotated-equation and m.10 rigid-motions run clean.
- **Left:** typesetting. `toLatex` already stacks ∂U ÷ ∂P and draws ∫ with limits; d/dx and
  dy/dx written with "/", `[F] from a to b` (an evaluation bar) and `lim x → a` (a limit under
  "lim") are shown as text until `latex.ts` and `MathLine` gain those nodes.
- Tests: `harness/__tests__/calculus.test.ts` (each form right and wrong, the three damped
  regimes, rules in letters and K–12 primes left alone, the forms `college/forms.ts` writes),
  `evaluate.test.ts`; the pages by id: every `he.` page, m.12.limits-intro,
  m.12.matrix-transformations, m.12.polar-conics~rotated-equation, m.10.rigid-motions.

## E33: category answers, relations that switch, and roots a rule keeps (HE-E11, E12, E15)

- **A college answer is often a word worked out from thresholds** (laminar or turbulent,
  underdamped, LOS C, converges), and only s.9's silent/missense/nonsense did that, with its
  own phrases. → `engine/cases.ts`: `categoryVariable` (the words coded 1, 2, 3 in `labels`,
  derived, or `pick: true` for a choice box) and `classify` (bands, first match wins, each
  with its test as a template, "{Re} ≥ 2300"). The box, the steps and the check show the word
  (the `labels` path s.9 already used); the step's case line says why ("3400 ≥ 2300:
  turbulent") and the check repeats the test ("3400 ≥ 2300, so turbulent"). One way: the
  thresholds are never worked backward. s.9.biotechnology~substitution is unchanged (its
  effect is from codons, not thresholds; it keeps its phrases).
- **A relation that switches at a limit or by a choice had no way to be inverted case by
  case** (64 ÷ Re below 2,300, Blasius above; order 0, 1 or 2; subsonic or supersonic). →
  `Relation.branches` (`Branch`: name, `when` template, `applies`, residual, optional `solve`,
  `display`, `check`) built by `piecewise`. Its residual is the case that applies; a value
  every case rearranges for is solved exactly, each answer kept only where its own case
  applies (f = 0.05 gives Re = 1,280, not the Blasius 1,596, which would be laminar); any other
  value is found in `solve.ts` case by case (a choice box's codes tried, so the order the
  numbers fit is found; else roots of each case's formula across the range). `TraceStep.branch`
  names the case; `branchOf` and `byCase` give it to step text.
- **The step must say which case applies.** → `buildSteps` (one additive hook): a step from a
  relation with `branches` shows that case's `display` as its rule and opens its work with the
  case line, printed with more figures when the shown ones would read false (2,299.96 is
  "2299.96 < 2300", not "2,300 < 2,300"); the check uses the case's `check` or `display`. A
  case line already shown in an earlier step is not repeated. No page has `branches` yet, so
  no K–12 walkthrough changes (the units and unit-set suites build every page's steps).
- **Two or three physical roots** (the ICE quadratic's negative root, a cubic equation of
  state, σ₁ ≥ σ₂ ≥ σ₃). → `realRoots` (closed-form quadratics and cubics, three real roots by
  the cosine rule so a symmetric tensor never loses a pair to rounding, a repeated root as
  often as it repeats; Durand–Kerner above degree 3; Newton-polished), `rootRule` (the root a
  stated rule keeps: a test, or least, greatest, median; the step writes the quadratic formula
  with the sign kept, or "greatest of −1, 2, 5" for a cubic, then "Rejected: 0.139, since x
  must leave every concentration at least 0"; inputs worked back numerically unless
  `backward: false`) and `orderedRoots` (σ₁, σ₂, σ₃ or ω₁ < ω₂, one way). A branch the
  student picks (subsonic or supersonic, vapor or liquid) is a `piecewise` case on a
  `categoryVariable({ pick: true })`.
- **The harness must check the word and the case.** → `harness/cases.ts` `caseIssues`, hooked
  into `sampling.test.ts`: the case named is the one the values are in, its comparisons hold
  as printed (`comparisonHolds`, also used by `buildSteps`), no other case is named, and a
  category answer reads as its code's word (then its substituted line is not read by phrases).
- Tests: `engine/__tests__/cases.test.ts` (roots, friction factor both ways and numerically,
  reaction order by choice and found back, damping regime, ICE root and K back, principal
  stresses with a double root, A/A* subsonic and supersonic), `harness/__tests__/cases.test.ts`
  (walkthroughs of synthetic pages: case lines, words, checks, quadratic and rank lines read by
  the harness). Pages run by id: m.9.quadratic-formula, m.10.law-sines-cosines,
  m.11.polynomial-equations, s.9.biotechnology~substitution, s.10.atomic-structure~ions,
  s.10.electrons-in-atoms~ions, s.10.rates-equilibrium, s.10.acids-bases, every `he.` page; the
  engine suites.

## HE-E16, HE-E17: linear algebra and complex values in steps, read back by the harness

- **About 50 college pages need matrix, vector and eigenvalue lines and 8 need complex
  arithmetic, and the harness read none of them** (a work line was checked only when it was a
  sum: `[[2, 1], [3, 4]] × ⟨5, −1⟩ = ⟨9, 11⟩` or "(30 + j40) ÷ (1 − j2) = −10 + j20" could have
  been wrong unseen, and so could Grade 11's "(2 + 3i)(1 − 4i) = 2 − 8i + 3i − 12i²"). →
  `engine/linalg.ts` and `engine/complex.ts` write the lines (products, determinants, Cramer,
  `[A | I]` and reduced echelon form one row operation a line, rank and nullity, eigenvalues and
  eigenvectors, dot, cross, projection; complex sums, products, quotients by the conjugate,
  polar products and quotients, polar ↔ rectangular), and `harness/algebraLines.ts` reads every
  form back: each chain of equal sides must hold (exactly on a line of whole numbers and
  fractions, within display rounding on one with decimals or angles), a λ polynomial at four
  values of λ, ± as both signs, and each row operation against the matrix before it.
  `sampling.test.ts` runs it on every step's lines (one added loop); `evaluate` reads Re(…),
  Im(…), `|a + jb|` and `det [[…]]` (one pre-pass line).
- **The solver has numbers only, so a matrix or a phasor was nine or two unrelated values.** →
  `written.ts`: `matrixVariables`, `vectorVariables`, `complexVariables`, `polarVariables` give
  a group (counted once toward the 10 values), `cramerRules` solves A x = b with its lines, and
  `complexRule` works a complex value as one: its real part's step shows the arithmetic, its
  imaginary part's ends "→ Z = 40 − j30 Ω = 50∠−36.87° Ω".
- **A rounded number can pass for a fraction** (49.6488 is 34208/689 to 10⁻⁹ of its top):
  `exactShow` writes a fraction only when the value is one to 10⁻¹⁰, and a magnitude that is a
  fraction is bracketed before ∠ ((2/5)∠−90°, never 2/5∠−90°, which reads 2 ÷ (5∠−90°)).
- **A factor written beside another must be bracketed even when it is one number**: the
  quotient line read "(−7 + 5i)4 ÷ (44)" for a real bottom, and "j6* = −j6" conjugated the 6.
  → `complexText` products and conjugates bracket every factor.
- **A page whose example doesn't hold exactly loses its notes** (`units.coherent`): an angle
  typed as 36.87° in an example makes E = V + jXₛI miss by 10⁻⁵, and the one-value note goes.
  Page builders take an example angle from its exact pair (the angle of 0.8 − j0.6).
- Left: 4 × 4 cofactor lines, K − ω²M, a cubic's surd roots, a row-operation page helper; a
  box that takes "8 + j6" as one value, complex values found backwards, α ± βi as one solver
  value (docs/HE_NEEDS.md).
- Tests: `engine/__tests__/complex.test.ts`, `linalg.test.ts` (the plans' examples: LA#0–LA#4,
  10∠36.87° = 8 + j6, 30 + j40 over 1 − j2), `__tests__/algebraLines.test.ts` (every builder
  over 150 seeded inputs reads true; a wrong number in any line read is caught, over 1,000
  lines; Grade 11's product lines read; test-only pages for input impedance, a synchronous
  generator and a 3 × 3 Cramer system). Pages tested by id: m.12.matrices,
  m.12.matrix-transformations, m.12.polar, m.12.vectors, m.11.complex-numbers, every college
  page; no K–12 text changed.

## E31: college units, temperature differences, unit sets and constants (HE-E5, E26, E9)

- **The college plans need about 300 units the registry lacked, and a temperature difference
  converted like a thermometer reading** (a rise of 10 °C shown as 50 °F; `kJ/(kg·K)` and ΔT_lm
  pages blocked). → `units.ts` adds 298 units in 63 dimensions (stress, moment, line load,
  second moment, specific energy, conductivity, film coefficient, viscosity, flows, rpm, Hz,
  inductance, field, conductance, VA and var, dB/dBm/dBi, pu, bits and bytes, molarity, mass
  concentration, molar energy, rate constants, cm⁻¹, Da, dose, activity, traffic…) and a
  `temperatureDifference` dimension: `difference: true` on a value makes `getUnit`, `convert`,
  `unitInSystem` and the conversion line read K, °C, °F and R without the offset. dBm/dBW and
  dBi/dBd are affine within their own dimensions; years convert to seconds.
- **New units must not change a K–12 page** (s.10 writes g/mol, u, nm and kJ/mol as labels,
  s.11 N·m and N/m, which have US counterparts now). → every added unit is `listed`: a menu,
  a system switch and a conversion only on a value listing another unit beside it, or on a page
  with a unit set (`unitHere`). Checked by comparing every page's unit options, menus, shown
  units and factors in all three systems before and after: identical.
- **Solid mechanics reads in N–mm–MPa or kip–in–ksi, not SI base** (HE-E26). → `unitSets.ts`
  and `ModuleDef.unitSet`; the unit context shows a page's values in its set for the chosen
  system, so the US steps are written in kip, in² and ksi with no conversion lines, and
  `unitSetProblems` keeps every page that names a set honest.
- **Constants were typed per page, and g must be 9.81 on college pages and 9.8 on K–12**
  (decision 1). → `constants.ts`: one registry with symbols, printed values and the precise
  values, `gFor(pageId)`, `constantLine` and `readConstant` for the harness.
- **The absolute-temperature menu is still a scale only**: the unit context converts by a
  factor, so a thermometer reading offered in both °C and K would show the wrong number. No
  page lists both today; a page that needs it waits for an affine unit context.
- Tests: `units.test.ts` (college conversions, logarithmic and reactive units kept apart, ΔT
  against T, K–12 labels unchanged), `unitSets.test.ts`, `constants.test.ts`; the pages tested
  by id: s.11 rotation, oscillations, thermodynamics; s.12 surface-processes, climate-systems;
  s.10 entropy-free-energy, nuclear-chemistry, gas-laws; m.6 unit-rates; m.7
  proportional-relationships; s.8 newtons-laws; every college page.

## E32: the four college blockers (HE-E1–E4) and the pilots redone

- **College pages had one file, no problem types, no layouts and no value cap**
  (docs/HE_NEEDS.md HE-E1–E4: 1,456 planned pages blocked). → `college.ts` is one file per field
  (`college/<field>.ts`, `layouts/college<Field>.ts`; `scripts/college-files.mjs` reads a
  course's home field from taxonomy.ts and creates a missing file for `new-module` and
  `promote-demo`). `problemTypes` and `getProblemType` take a topic key as they take a skill id
  (`ProblemType.owner`, `.topic`; `.skill` is now optional), and every view that lists a
  skill's types lists a topic's: the topic page (its types as tiles, a type's related lessons),
  the side menu, search, recents, the nav bar (a type's back button goes to its topic), page
  meta, the matcher (`MatchResult.owner` replaces `.skill`) and the corpus script. A type lives
  at `/course/<id>/topic/<i>~<slug>` (`topicRoute(course, i, slug)`, `pageRoute(id)`) and is
  pre-rendered (`TOPIC_TYPE_IDS`; a review build's PRERENDER_PREFIX now limits topic pages
  too). College layouts are read under `#` ids. `standards.test.ts` holds `he.` pages to the
  Grade 12 rules (35 words, 10 values, 2–4 assumptions); `layouts.test.ts` reads them at 35.
- **The problem-type id lists are computed when selectors.ts loads**, and the first topic type
  made them call `getCourse`, a `const` defined further down (a temporal-dead-zone crash in
  every suite that imports the menu). → `getCourse` and `topicKey` are function declarations.
- **The kinematics pilot on `motionGraph`: a time of −1 × 10⁻⁶ s** (d typed in mm, the
  quadratic's root a rounding crumb below 0) fails the graph's check, where the old `plot`
  drew it. → `atLeastZero` (college/shared.ts) reads such a crumb as 0 in each time solver.
- **A scratch build drew another checkout's routes**: with node_modules symlinked to the main
  checkout, the shared Metro cache served expo-router's `_ctx` transform from a build there, so
  the export rendered that checkout's `src/app` with this one's data (no `~` topic pages, and
  PRERENDER_PREFIX ignored on topics). → Build a copy with its own cache (`TMPDIR=<scratch>`), or
  `--clear`.
- Pilots: circuits-1#0 "Resistance 1 (R₁)", "Resistance 2 (R₂)"; human-geography#0 trimmed to 9
  values, `~rates` (P₀, B, D, CBR, CDR, RNI, T₂; bars of CBR and CDR) and the plan's
  `~transition` sequence; university-1#0 on the s.11 v–t graph with Δx and g = 9.81; calc-1#1
  waits for HC37. Tested by id (`MODULE_IDS=he.`) and in `src/data/__tests__`.

## HE-E7, HE-E8, HE-E10, HE-E25: college symbols, number range, harness phrases, layout text

Engine work the college plans asked for before their pages are built (`docs/HE_NEEDS.md`). Each
change was checked against every step line in the review dumps (about 61,600 K–12 lines): no
number shown, no value the harness reads and no line of a page below Grade 9 changed; the
Grades 9–12 lines that changed were wrong before (below).

- **Symbols (HE-E7).** `toLatex` typesets "∫ from a to b of (body) dx" as ∫ with its limits
  (`\int`, drawn by `MathLine` like Σ), keeps letters with combining marks (ṁ, Q̇, x̂, p̂, x̄,
  F⃗) and subscripts of several letters, Greek or in two parts (σ_max, T_wall, T_h,in) whole,
  stacks ∂U ÷ ∂P, and raises an exponent with a bracket inside ((P₂ ÷ P₁)^((k − 1)/k),
  10^(1.5 × (−4))). `subscripts.ts` takes marks and primes on the base, 8-character subscripts
  and a comma part. `spokenMath` says the integral, ∂, ∇, floor and ceiling, dotted, hatted,
  barred and arrowed letters, and subscripts ("T sub wall", never an underscore).
- **K–12 fixes found on the way.** A stacked division drew a function's name alone over its
  bracket (m.10.law-sines-cosines and its five types: 9 × sin(80°) ÷ sin(35°) was "sin" under
  "(80°)"; m.10.right-triangle-trig~elevation, m.11.logarithms~change-of-base log₁₀ 12 ÷ log₁₀ 2,
  m.11.exp-log-equations~continuous, m.11.pythagorean-identities~tangent, m.12.conics c ÷ max(a,
  b), m.12.induction~divisible f(n) ÷ 3, s.11.circuits~parallel, s.11.dynamics-vectors ~incline
  and ~rope, s.12.resource-management~growing-use ln(1.8) ÷ 0.02, the P(A ∩ B) ÷ P(A) lines): the
  function now stays whole. Marked symbols (p̂, x̄, d̄) were upright beside italic letters and
  kept a division inline (m.9.data-displays and ~standard-deviation, ~histogram-from-list;
  m.11.normal-distribution~margin; m.12.sampling-distributions and its types, confidence-intervals
  and its types, hypothesis-testing and its types, anova~groups; s.10.measurement~accuracy): now
  italic like every symbol, divisions stacked. `1/n₁^2` read as 1/n then a stray "₁^2"
  (s.10.electrons-in-atoms~emission, s.11.modern-physics~hydrogen-lines). (a² + b²)^(n ÷ 2) showed
  a raw caret (m.12.polar~de-moivre); s.12.earth-interior~magnitude 10^(1.5 × (−4)) too. The
  sequence hint lowered a whole label ("gives off co₂", "loads nadh", "prophase i", "an arc from
  a": s.9.cellular-energy~stages, s.9.mitosis-meiosis~cell-cycle and ~meiosis, m.10.constructions,
  m.10.proofs, s.8.em-spectrum~spectrum-order): it now uses `lowerFirst`. A fraction of a letter
  with a subscript split the subscript off (`1/R₁` drew 1/R then "₁"; s.11.circuits~parallel,
  ~series, ~mixed; s.10.gas-laws~charles, ~gay-lussac, ~effusion, ~partial-pressure;
  s.11.rotation~seesaw `τ/F₁`; s.11.optics~critical `n₂/n₁`; s.11.modern-physics~relativity,
  ~photoelectric; s.12.cosmology `1/H₀`; s.10 acids-bases ~titration,
  atomic-structure~average-mass, molarity~percent-mass, nuclear-chemistry,
  phase-colligative~vapor-pressure, thermochemistry~heating-curve), and a letter's power was drawn
  outside its fraction (`E/A²` as (E/A)²: s.11.oscillations, ~hooke): both now stack right; `1/2²`
  keeps its old drawing. Screen readers heard "A underscore ft" on typeset lines with a subscript;
  they now hear "A sub ft" (spoken labels only, every page with an underscore subscript).
- **Number range (HE-E10).** Values under 10⁻⁴ compare relative to their size in the harness
  (half a percent); the solver's zero floor for a scientific value with no step is 10⁻⁴⁵;
  "1.5 × 10^37" parses exactly; new `decimals` and `signed` display options with `figuresIn`,
  `logDecimals`, `signedText` and `engineering`; scientific notation never wraps between its
  parts on screen.
- **Harness phrases (HE-E8).** `phrasesHe.ts`: n!!, phasors (∠ and j), dB, dBm and dBi, the sign
  words (tension, compression, sagging, hogging, heat in and out, work in and out), label words,
  LMTD; `evaluate.ts`: integrals with limits by Gauss–Legendre quadrature, log as base 10, log₂,
  logs without brackets, a number before a function multiplying it, min and max. Seven K–12
  lines that could not be read now can (β = 70 dB, ln 1.5); none changed value.
- **Layout text (HE-E25).** `code: true` on sorts and sequences (a code font, exactly as
  written, no copy-editing checks); `signed: true` on sequences (signed spans and a net total);
  the reading check counts a formula as one word.
- Tested: the engine and harness unit suites; by id m.10.law-sines-cosines,
  m.12.hypothesis-testing, m.9.data-displays~standard-deviation, s.11.modern-physics,
  s.10.electrons-in-atoms, s.10.acids-bases, s.10.mole, s.11.electrostatics, s.11.optics,
  s.11.circular-gravitation, s.11.circuits, s.12.starlight-spectra; `layouts.test.ts` in full.

## E30: checks with ln, log or e^ printed worked-out values with their extra figures

- **A check whose right side has a logarithm or e to a power kept its extra figures**
  (s.12.resource-management~growing-use `29.3893 = ln(1 + 0.02 × 600 ÷ 15) ÷ 0.02` under the
  step's `T = 29.4 years`; s.9.population-ecology `690.5679 = 1,000 ÷ (1 + … × e^(−0.5 × 6))`).
  `checkLine` tries the page's figures first, but the line's two sides are compared by
  `evaluatePrinted`, whose tokenizer read only sin, cos, tan and √: a side with ln(…) could not
  be read, so `firstTrue` fell back to the unread line. → `simplify.ts` reads the functions as
  the pages print them: ln(x) and ln|x|; log(x), log₁₀(x) and log_10(x) as the common log;
  log₂(x), log_2(x) and log₃ 20 as a log to that base (a log written without brackets takes the
  one number after it: `log₁₀ 20 ÷ log₁₀ 2`); e as a number (so e^(0.05 × 8.1093), e^0.15 and e³
  work, and 10^−3.5 already did); absolute-value bars |−4|. A log is worked out exactly where it
  can be (log₁₀ 1000 is 3, ln(1) is 0), and a log of 0 or a negative is no value. The checks now
  print at the page's figures (`29.4 = ln(…) ÷ 0.02 ✓`, `691 = 1,000 ÷ (…) ✓`), a substituted
  line with a log takes them too (s.12.radiometric-dating `n = ln(100/99.84)/ln(2)`, not
  99.8403), and the working shows the stage inside the log when it comes out exactly
  (m.11.exp-log-equations~continuous `r = ln(1.5) ÷ 8.1093`; s.9.biotechnology~pcr
  `n = log_2(1,024)`; m.11.logarithms~common-log `L = −3 + 0`). The harness already read these
  forms. Unit tests in `written.test.ts` cover each function; the pages tested by id:
  s.12 growing-use, earth-interior~magnitude, radiometric-dating; s.11 sound-waves~sound-level;
  s.10 acids-bases, nuclear-chemistry; s.9 biotechnology~pcr, population-ecology; m.11
  logarithms, exp-log-equations, series; m.12 sampling-distributions~clt (invNorm untouched).

## The full run after the refusal and step-order changes: 12 regressions, three causes

- **Worked examples refused as "older"** (m.6.gcf-lcm "the first number would be 0.7059, but it
  must be a whole number"; m.3.elapsed-time "the minutes it takes less than 0"; m.9.factoring~gcf
  "the other numbers can't reach this"; the gallery copies), and m.9.factoring~gcf refusing a
  and b that were possible. → `outOfReach` bounded any rule its fixed probes read as straight
  in each value at the corners of the ranges; a greatest common factor and "(m + d) % 60"
  happen to read straight at those small probes. Before the corners are trusted, inside points
  of the actual box (its centre, a quarter and three quarters along each value, three scattered
  ones, each on its own grid) must come out as the corners predict; a rule that doesn't is left
  to the search, as before.
- **A step from a rule that only applies when k = 0** (m.10.probability-rules~counting-probability
  "f = C(59, 6)" for f = 5,006,386 with k = 1). → `directFor` handed the rearrangement every
  known value, so "f = C(b, r) when k = 0", whose fallback computes the full count from a, was
  taken as explaining f before a was. It now sees only the values explained so far (and a
  rearrangement that throws on a missing one explains nothing).
- **A worked line that misses the printed answer** (s.10.electrons-in-atoms~emission
  "λ = 1240/12.1", 102.48, under "λ = 103 nm"; the new older-input fallback now keeps these
  inputs, and the line was accepted as within 10⁻³ of the exact 102.57). → `misses` compares a
  line with the answer as the step prints it (to the page's figures) and takes more figures
  when it would not round to it ("λ = 1240/12.09").
- **K–5 pages read the Grade 6 wording for a pinned value** ("Only 12 fits every rule here: no
  other number works."). → K–5 says "12 is the only number that works here."; standards.test
  leaves each opening value out in turn and checks a pinned step's wording against the grade.

## Lesson reviews of today's engine changes: refusals a student reads, steps in order

- **K–2 children saw raw engine sentences** ("These numbers can’t all be true together", "The
  other numbers can’t reach this…", "Left would have to be −178, but it can be at least 0" on
  m.2.add-sub-1000~subtract at a = 0, b = 178). → `kidMessage` catches every engine sentence
  and keeps its direction: "That doesn’t fit. Try a smaller (larger) number." when the
  sentence says which way.
- **Value names that aren't nouns** ("the in all", "the how many more (or fewer)", "the not
  shaded", "for the today"). → `VariableDef.inSentence` names a value inside a sentence; the
  K–5 `whole` helper sets it for the common labels (In all → the total, In each group → the
  number in each group, Left → what is left, How many more → the difference, …), and the
  weather pages say "today’s temperature". Without it a label that starts with a preposition,
  wh-word or adverb, is a lone participle, or ends in a number is quoted (“Side 4”).
- **Grade 3 refusals showed decimals and negatives** ("the groups 0.1667", "width 16.6667 cm",
  "books left −247"). → On a K–5 page (`System.id`, set by the unit context) a value that isn't
  whole is not named ("That wouldn’t make the groups a whole number.") and one below 0 is "less
  than 0".
- **`outOfReach` was not the range sentence** (no period, "X would have to be …"). → It is
  built from `rangeSentence`; with several values open, every typed value is tried together
  before the generic "The other numbers can’t reach this: they would go past their limits."
  (now with its period): m.3.perimeter~missing-side at P = 4 names side 4, and
  s.6.density~displacement at a = 1000 after c = 62 names the volume. It bounds products too
  (any rule straight in each value: the least and greatest at the corners of the ranges).
- **Numbers in refusals** were rounded to 6 figures (19,996.5 for 19,996.468; months
  −1.3846), printed decimals on fraction pages (0.25, "0, 0.5, 1, …."), lost the space in
  "−57 °C" and said "at least 1 cubes". → A refused value reads as its box shows it (the
  fraction 1/4, "0, 1/2, 1, …" with no period after "…"), a range refusal to the step's decimals
  and one more at a time while the rounded number would still pass; "°C" keeps its space; 1
  takes the singular unit.
- **Regression: "0.1 × 10²" read as scientific notation** (s.8.kinetic-potential~kinetic lost
  "KE = 1/2 × 0.1 × 100"). → `SCI_WORK` gives decimals the same powers as whole numbers (not ²
  or ³ alone); written.test checks the chain.
- **A branch the whole-number search then rejected was kept** (m.3.scaled-graphs~picture-more:
  d = 1, n₂ = 1, p₁ = 0 cleared d, where n₁ = 0 works). → `propagate` vets each branch for the
  values it leaves open (`outOfReach`, `wholeSolutions`) and keeps the first that can still be
  filled in.
- **A non-whole older input refused the newest** (clt-sums: Σx typed after x̄ and n gave "sample
  size 35.96"). → The older input is worked out again when the inputs older still fix it
  (x̄ = Σx ÷ n), as a value newer input determines is.
- **Steps used values before the step that finds them** (add-fractions-unlike~subtract at
  a = 12: "? and 3 both go into ?" → "Common denominator = 12"; "?/12 − ?/12" printing 8 + 4;
  convert-units~multi-step "Left over = 0" from "? − ? × 8 = ?"). → Filled values are ordered so
  each step uses only values found before it; a value only the search pins is its own step,
  marked `pinned`, that says "Only 12 fits every rule here: no other number works."
- **Grades 9–12 printed the rule twice** ("SE = σ ÷ √n" as the formula and the first work line).
  → The rearranged line is left out when it reads the same as the formula.
- **Data.** m.7 percent-change finds the original from the new amount and the percent (b = a ÷
  (1 + p ÷ 100), 7.RP.3). Ranges every edge reaches: plate distance from 0.1 km, displacement
  levels (before to 999.9 mL, after from 5.1 mL, and a rule that the level rises), dividend to
  989.01 (999 × 0.99), a fraction of a whole from 1/12, mixed-number common denominators to 132. Grass-slope's soil is more, not its tray. The m.12 complement reads P as its box shows
  it (1 − 0.06681 = 0.93319).
- **Reviewer gap**: most K–5 edge walkthroughs in the dump were a refusal only. → The dump
  types an edge with only the opening values that fit it (the others listed as left out), so
  the edge itself is walked through.

## Lesson review of the new Grades 11–12 pages: tiny values, lines as shown; today's regressions

- **Checks on tiny values always passed.** `closeTo` was |x − t| ≤ 10⁻⁶ × (1 + |t|), so any
  two values under 10⁻⁶ were equal: s.11 electromagnetism~charge-circle printed "1 × 10⁻⁹ =
  2π × (1.57 × 10⁻¹)/(3 × 10⁶) ✓" (the right side is 3.28 × 10⁻⁷) and F = 5 × 10⁻¹⁴ N checked
  against 9.61 × 10⁻¹⁴ N; the harness's `complete` and `holds` inherited it. → Values are
  compared relative to the larger size, |x − t| ≤ 10⁻⁶ × max(|x|, |t|), with a floor only near
  0: a millionth of the value's step (`floorOf`; a millionth with no step, next to nothing for
  scientific notation with none). `holds` takes the variables for it (the solver, the step
  check marks, the unit context, the harness search and modules.test pass them), and the
  sampling test's own comparisons do the same.
- **A fraction exponent lost its brackets** (m.11 radical-functions~rational-exponent, a = 1,
  p = 3, q = 2, y = 27: "x = 27²/3", which reads as 243). → `simplify` brackets a printed
  exponent that is not a plain whole number: 27^(2/3), drawn raised.
- **Scientific notation and rounding in chains.** Three figures dropped their zeros (1.9978 ×
  10⁵ → "2 × 10⁵"; E = "1.1 × 10⁶" on ~two-charges) → a page's figures keep them (2.00 × 10⁵,
  1.10 × 10⁶), and × 10⁰ is left out (1.2 N). Later lines used more digits than the answer
  showed (orbit v = 7,540 then 7,544.5136; work W = 520 then a check with 519.6152;
  charge-circle r = 1.57 × 10⁻¹ then 1.5665 × 10⁻¹; potassium n = 0.129 then the false
  "161.1222 = 0.1289 × 1250") → a worked-out value reads in every later line, work line and
  check as its box shows it, and a line that is then not true as printed takes one more figure
  at a time, up to 8 (`firstTrue`). True as printed: sides within 10⁻³ (plus a millionth of
  the line's largest term, for lines that cancel to near 0); a substituted line that rounds to
  the answer it shows; a check whose left side, shown to the page's figures, is what the right
  side rounds to ("161 = 0.129 × 1250", 161.25). A line no set makes true (½ × 10⁵ × (25.04² −
  25²) for a ΔKE of 6.08 J), or one `evaluatePrinted` can't work out (arcsin(0.417)), is
  printed as before, decimals with their extra figures. `evaluatePrinted` reads 2π as 2 × π
  (only when checking; the working still writes it as one number). Mixed forms: 10^(−6) is
  raised to 10⁻⁶; a line worked in scientific notation keeps its results in it (no
  "√(398,437,800,000,000/(7 × 10⁶))"), reads 4 × 10³ as one number (never "(4 × 1,000)"),
  and brackets a root of one (√(5.692 × 10⁷)). The harness's check-line test knows the same
  rounding rule, and its fraction phrase no longer reads 2/(5)² as 2/(5 with the bracket left
  open (it returned nothing, or worse, for any N/(…)²: s.11 gravitation's "F = G × m₁ ×
  m₂/(2.53 × 10¹²)²" check went unread).
- **Fallback refusals a student couldn't read** ("Makes potassium-40 left impossible";
  "Density would have to be 1.08 × 10⁻⁵ g/cm³, but it can be at least 0.0001 g/cm³"). → "That
  would leave no possible value for the potassium-40 left." and "That would make the density
  1.08 × 10⁻⁵ g/cm³, but it must be at least 0.0001 g/cm³.", the name as the steps write it
  (the Carnot limit), and "Try a smaller (larger) number for the …" when halving or doubling
  the newest value fits and the other doesn't. A newest value impossible on its own now gives
  that sentence too, not the generic one. The harness counts both forms as the engine's own
  refusals (a range sentence on the newest alone, not against older inputs, is not a rule
  speaking), and K–2 read them as "That doesn’t fit."
- **Reviewer gap**: the 27²/3 line only showed when x was the value to find, and x is an
  opening value. → The dump's "find …" walkthroughs cover every value that isn't derived, the
  opening ones too.
- **Today's regressions.** m.9 units-precision~bounds (and two demos) said "not a reading to
  the nearest NaN cm": the refuse-with-reason pass asked every rule's message, and a check rule
  speaks for a missing u as if it failed → a check rule explains a conflict only once its
  values are known. g.s-11-electric-potential-parallel-plate and ~dielectric drew C 1000 times
  the relation's: the page now counts the gap in meters, the demos still said `meters: 1e-3`
  (and the dielectric demo's example d = 0.2) → the demos follow the page (d = 2 × 10⁻⁴ m).
  m.10 law-sines-cosines~area at a = 1000, b = 0.1, C = 178° was the picture's SAS solve, not
  the solver: acos near 1 loses half the digits of a 0.0002° angle → the triangle's angles come
  from its area (Kahan's form) with atan2, the largest by subtraction. The absolute-value graph
  marked a vertex and zeros at a = 0 (the line y = k): no longer. g.m9-absolute-value-vertex and
  g.m12-chi-square-independence are retired; the pages they stood for (m.9
  piecewise-functions~absolute-function, m.11 function-transformations, m.12
  chi-square~independence) pass at SAMPLES=150, SEQUENCES=30.
- Tests: `solve.test.ts` "tiny values are compared relative to their size", the refusal
  sentences and the hint; `format.test.ts` figures with their zeros, no × 10⁰;
  `written.test.ts` the bracketed fraction exponent.

## Grades 9–12 picture tracker: H01–H88 by parts, demos retired

- **H01–H88 all still said `drawn`** though most pictures had long been on their pages, and a
  probe by kind could not see parts drawn under another kind (icon cards, explore figures,
  equation templates). → Each request was checked part by part against its notes: 80 are
  `placed`, their page lists naming the problem types where a skill's main page lacks the
  picture, and requests in parts (H16, H19, H71, H78, H80, H81–H88) map each page to the text
  that shows its part. Pages whose part lives elsewhere are dropped with a note (H01, H06, H23,
  H26, H44). Eight stay `drawn`, each note naming the part no page shows: H01 cube root, H03
  bins from data and the median, H10 polar circle and spiral, H35 codominance, H36 deletion,
  H40 biomass and numbers pyramids, H48 hydrogen bonds, H74 the intrusion. Two small page
  changes finished requests: the kingdom icons on s.9.classification~kingdoms (H39) and the
  augmented matrix on m.12.matrices (H86). K–8: R11b and R18 placed where their option is shown;
  R01b waits on the camouflage page.
- **436 gallery demos repeated what a lesson page now shows.** → They join `RETIRED` in
  gallery.ts; a demo stays where it is the only place an option is shown (the unit circle's
  linked graph and `arc`, `window`, the emission `lines`, the hydrogen-bond mode, …).

## Σ with limits (E5)

- **The sigma page could only say its sum in words** (m.11 series~sigma: "the sum from k = 1
  to 8 of (3k − 1)" lived in the `use` line; the steps went straight to a₁, aₙ and Sₙ). → Step
  text writes a sum with its limits as "Σ from k = 1 to {n} of ({c}k + {e})": the index is one
  letter, each limit one token (a number, a letter, a value slot), the body a bracket (one
  bracket deep, maybe raised: (x − 5)²) or one term (k², 2^k). `toLatex` (standard band) draws
  it `\sum_{k=1}^{n}{(3k − 1)}`, the index italic; `parseMath` gives a `sum` node that
  `MathLine` stacks (upper limit, Σ, lower limit) before its body, and `fromLatex` reads it
  back. `spokenMath` gives screen readers "the sum from k = 1 to 8 of (3k − 1)" (step lines and
  assumptions).
- **The harness couldn't check a sum.** → `expandSums` (in `evaluate`) adds the terms one by
  one, the index put into the body (3k is 3 × k); limits that are not whole numbers in order
  leave the line unread. A check line's "k = 1" no longer splits it into three sides, and a
  line or sentence saying "Σ … = N" must add up to N. Changing the sigma page's body to
  (c + 1)k failed its check on every sample.
- m.11 series~sigma: the first step opens "S = Σ from k = 1 to 8 of (3k − 1) adds the terms for
  k = 1 to 8", and the check adds the terms: "Σ from k = 1 to 8 of (3k − 1) = 100".
- Not changed: Σ without limits in formulas (X² = Σ(O − E)² ÷ E, S = Σ(x − x̄)², MSB =
  nΣ(x̄ᵢ − x̄)² ÷ 2), where the sum runs over the data; the induction pages' "1 + 3 + … +
  (2n − 1)", as the proofs are stated; and the Riemann pages' "Σi² = …" assumptions, which are
  plain text (not typeset), where the long form reads worse.
- Tests: `latex.test.ts` "draws a sum with its limits as Σ" and "says a sum … for a screen
  reader", `harness/__tests__/evaluate.test.ts` "adds a sum with its limits term by term".

## Solver open items: silent clears, rounding chains (E29), circular fills (E21)

- **A newer value cleared an older one with no reason** (m.10 modeling-density main r = 0.01
  and 1000 cleared h; m.12 area-under-curve~line m = −100 cleared k; s.11 ~voltage-energy
  ΔV = 10⁶ after the electron cleared m). → When a rule's message or the range a worked-out
  value would break says why, `solve` refuses the newest entry with that sentence and keeps the
  older inputs (`rejected.older`): "No material is denser than about 22.6 g/cm³ …", "The line
  dips below the x-axis before b …", "That is past a tenth of light’s speed …", else "Density
  would have to be 1.0823 × 10⁻⁵ g/cm³, but it can be at least 0.0001 g/cm³". A propagation
  that fails on an out-of-range value carries `why` (worked out only when asked); the
  whole-number search's sentence (`none`, `outOfReach`) now counts as a reason too. Only a
  conflict nothing explains still clears the oldest. A slider refused this way looks 25 steps
  out, as for a moved typed value. Rounding dust gets no sentence ("60,300 must be a whole
  number").
- **Rounding through several values** (E29: normal-distribution~outside, starlight-spectra
  ~doppler). Three causes: whole numbers and listed values were checked to 1e-9 absolute (N =
  E ÷ P from an E rounded to 12 figures is 60,300.00000008), now to 11 figures of their size (1e-9 the floor, so −999,999,999.5 is still not whole); the
  whole-number search's `narrow` emptied a range when one step was counted two ways (6563 × 0.1
  = 656.3000000000001 against the list's 656.3), which cleared λ for consistent λ₀, λ, z and v;
  and a typed shown value whose rounding runs through a listed or whole value. → `roundedOut`:
  on a conflict, one typed value (newest first) that the other typed values work out within
  half its step is worked out instead, the rest kept exactly as typed (two at once worked out
  more than needed) (tried before
  a refusal or a clear, so a retyped shown value is never refused for its rounding). Both pages
  pass the deep run (SAMPLES=100, SEQUENCES=15, UNIT_CASES=10) on seeds 1–5.
- **Circular fills** (E21: emission's E and λ were filled from n₁ = ±1 after n₁ was cleared,
  and explained as "E from λ, λ from E"). → A filled value must follow from the values known
  without it: one at a time by a formula whose other values are known, or as a group its own
  formulas fix (c + s = 20 with c = s). A group only an unknown pins is left for the student,
  except the values the solutions with every range widened (`loosened`, as the harness's
  `relax`) agree on (bonding's lone pairs l = 2 whatever the carbon count; ΔTf = ΔTb × Kf ÷ Kb
  whatever i). The emission page's n₂ > n₁ rule
  now has its message, so a level at or below the other is refused and the other stays.
- **From the heavy run** (`ci-test --heavy`: 433 of 1,768 pages say something different).
  An older conflict no longer replaces the newest entry's own range message (g.r4f-waterfall);
  `outOfReach` skips a rule no open value moves (the dice-pairs lookup said "Sum would have to
  be NaN × 10" on m.7 probability~two-dice's own example, and m.9 ~whole-number-answers'); a
  rule the values leave indifferent to a value (Δx = (v₀ + v) ÷ 2 × t at t = 0 and Δx = 0, where
  v = 0 ÷ 0) says nothing about it, in the solver (`indifferent`) and the harness search alike.
  Still failing, not the solver's: m.10 law-sines-cosines~area's picture check on a = 1000,
  b = 0.1, C = 178° (reachable now that K = 10⁶ is refused instead of clearing b), and
  g.m11-normal-distribution-left's "invNorm(1)" step for P = 0.99999999614 (z worked out from a
  P shown as 1; the base solver does the same, a new sample reaches it).
- Tests: `solve.test.ts` "a newer value that doesn’t fit the older ones", "typed values rounded
  to their step", "values the search fills in (E21)".

## Display open items: exact answers, coded values, charge units, figures

- **E22: special-angle values, radicals and complex roots were answered in decimals** (cos 5π/6
  = −0.866, q = 1.3919 for √31/4, x₂ = 0.2808 for (−3 + √17)/4) → `VariableDef.exact` with
  `src/engine/exact.ts`: `true` finds the exact form from the value itself, only when it is
  exact (k√n/q when x² is a whole number over q² to within float error, q up to the
  variable's `fraction` or 12; a table of the special values that are not one root,
  (√6 ± √2)/4 and 2 ± √3); a function gives it from the page's values (`quadraticRoot`, the
  roots from the discriminant). `formatNumber` writes it in the box, the lines and the checks
  (`renderTemplate` passes its values and brackets an exact sum, 3 × (2 − √3)); the answer and
  the box say the decimal beside it ("√2/2 ≈ 0.7071"; the box under its name). `complexRoots`
  writes a conjugate pair (2 ± 3i, −1/2 ± (√3/2)i, ±3i√2); `radical` moved to the engine.
  `parseNumber` takes "√3/2", "3√2", "sqrt(2)/2". LaTeX stacks a root over its bottom
  (\frac{\sqrt{3}}{2}, (√6 + √2)/4) and no longer divides from a fraction's bottom (1/2 ÷ 3 was
  drawn 1 over 2 ÷ 3). Harness: `evaluate` reads 3√2 as 3 × √2 and √3/2 as √3 over 2 (it read
  √(3/2)); the sampling reads an answer's decimal after "≈". Pages: m.11 unit-circle (x, y, m),
  complex-numbers~quadratic (q, the pair), polynomial-equations (x₂, x₃, the check and the
  factored line; a root that simplifies is simplified in the work, (2 + 2√2) ÷ 2), m.12
  trig-formulas-equations and ~difference (S, K; the work line no longer repeats the decimal).
- **A coded value showed its code** ("Hₐ = 0" in the "we know" line and a 0 in the box, the
  page names carrying "β ≠ 0 (0), > 0 (1) or < 0 (−1)") → `VariableDef.labels`, what each
  `allowed` code means: the row's box shows the meaning and is tapped through the codes
  (`LabelBox`, `nextCode`), and the "we know" line reads "Hₐ: β ≠ 0" (`codeLabel` in
  buildSteps). `modules.test` checks every allowed code has a label. m.12 regression-inference,
  ~correlation and anova~two-variances: the name is "Alternative hypothesis" and the decision
  note opens with the tail alone ("Two tails: …").
- **Charge and capacitance had no unit menu, and the parallel-plate gap carried its own 10⁻³**
  → `charge` (pC, nC, μC, mC, C) and `capacitance` (pF, nF, μF, F) dimensions in `units.ts`
  (opt-in: a menu only where a value lists its `units`), and `VariableDef.shownIn`, the unit a
  value is shown in first when the rule counts another (`makeUnitContext`; a unit picked from the
  menu still wins). A conversion factor that is a power of ten reads 1 C = 10⁶ μC (never
  1000000), and `parseNumber` takes a bare 10⁶; an answer whose unit needs no converting keeps
  its own display on a converting page (V = 7.19 × 10⁴ V, not 71,920). s.11 electric-potential
  main and ~capacitor offer nC/μC/C and pF/nF/μF/F; ~parallel-plate counts the gap in meters,
  shown in mm (C = κ × 8.85 × A/d, E = V/d: no 10⁻³ in either rule; gap from 0.01 mm and plates
  from 1 cm², where the solver's tolerance still tells values apart). **Not done: the rules in
  coulombs and farads.** The solver compares values to 10⁻⁶ absolute (`closeTo`, `TOLERANCE`)
  and rounds |x| < 10⁻¹² to 0 (`normalizeValue`), so a charge of 4 × 10⁻⁶ C or a capacitance
  of 8.85 × 10⁻¹¹ F counts as equal to any other: conflicts went unseen in the sampling. The rules
  keep μC, μF, pF and pC, with the main page's 10⁻⁶ and its “q = 4 μC = 4 × 10⁻⁶ C” line and
  ~capacitor's 10ⁿ lines (dropping them skipped the step they show). A relative tolerance in
  `solve.ts` (another agent's) would let these pages count in SI.
- **Scientific notation in the lines kept 5 figures on 3-figure pages** ("check: 5.9308 × 10⁶ =
  …" under "v = 5.93 × 10⁶ m/s"; "E = 6.626 × 10⁻³⁴ × (4.5732 × 10¹⁴)") → `formatNumber` takes
  `scientificFigures`, figures for scientific notation alone, and buildSteps gives the lines and
  checks the page's worked figures for every worked-out value that `withWorkedFigures` would
  round (`lineVars`): 5.93 × 10⁶, 4.57 × 10¹⁴. Typed values read as typed, decimals keep their
  extra figures (the lines still add up), and the 8-figure fallback for a line that would miss
  its answer clears it. 19 pages' lines changed (s.10 mole, photon, ksp; s.11 gravitation,
  electrostatics, electric potential, modern physics; s.12 dating, starlight, stellar evolution).
- **s.11.thermodynamics~first-law: "Q = 500 J in" ran under the cylinder's left edge** at
  phone width (the label starts at the left margin, the glass at 0.3 of the width) → the
  `gasPiston` energy view (`GasFirstLaw.tsx`) keeps the label over the heat band only when it
  fits left of the cylinder, and otherwise sets it under the cylinder's base, clear of the glass.

## Grades 9–12 leftovers: the tracker by parts, figures, science figures, review scripts

- **Twelve picture requests stayed `drawn` though every part was on its page** (H89–H110 span
  several kinds and pages, and the tracker test wanted one kind on every page named). → `uses`
  may now map each page to the text that shows its part (`ask` takes that map in place of the
  page list, so `pages` are its keys, the real `~` pages rather than the skills), and
  `pictureRequests.test.ts` checks every built page shows its part, even while the request
  waits on a page not built yet. H90, H92, H93, H95–H97, H100, H101, H104, H105, H108 and H109
  are `placed`; H94, H98, H99, H102, H103, H106, H107 and H110 stay `drawn`, their notes naming
  the unbuilt pages (each in `pages` with its mark, so a builder adding one is told if the
  picture is missing).
- **Pictures the second math page review left** → a y-axis number gives way to a handle drawn
  on it (`FunctionGraph`: percent-growth's start sat on "800"); the slope triangle keeps its
  run and rise labels off the test point's label (`LinearFunction`, `triangleAt`'s
  `labelsFree`); construction stage figures draw 1.5× (`ZOOM`, 156 px) and find-center's
  bisectors cross short X arcs with O between each pair; the double cone runs each curve to the
  rim exactly and fits its plane inside the picture, the hyperbola's plane facing the viewer.
- **Science 9–12 boxes and steps showed 5 figures where the pictures show 3** (1.9231 × 10⁻¹²
  beside a picture's 1.92 × 10⁻¹²) → `ModuleDef.workedFigures`, 3 by default on s.9–s.12
  (`workedFigures`, `withWorkedFigures` in grade.ts): `formatNumber` takes `worked`, rounding a
  worked-out value's decimals and its scientific mantissa (`scientific(x, figures)`) but never a
  whole number, in the box (InputsSection), the picture labels (ModuleSections) and the step
  answers and quantities (buildSteps); typed values as typed. The sampling harness allows half a
  unit in the last figure where a step's answer, a check's number or a conversion meets such a
  value (`figuresClose`), and `helpers.test.ts` pins the display.
- **Review scripts** → `review-shots.mjs` leaves an intended sideways-scroll frame alone
  (WideTable's ScrollView carries `testID="wide-frame"`; what it scrolls to is meant to be
  wider), so the periodic-table pages no longer report "wider than the screen" and "sticks out
  past the screen" at 390 px; `review-interact.mjs` shoots every explore scene in dark mode
  too (`scenes/<id>-<n>-dark.png`).

## Grades 9–12 second page review: the drag rule

- **A handle on a worked-out value froze the page and did nothing** (12 handles on m.9:
  linear-inequalities k, ~compound and ~or L and U, ~whole-number-answers n, the three
  absolute-value pages' h and d; 15–30 s per move event). `set` judged a handle "stuck" by
  giving it its own current value, which always fits, so `driveTyped` never ran and the
  400 × 2 step search tried about 800 solves per move; each try put the handle's value on top
  of the values it comes from, and on that overdetermined input the solver can take seconds.
  → **The drag rule** (`setInput` in `engine/state.ts`, which `useCalculator.set` now calls):
  a handle whose value is worked out (not among the typed values) never tries its own value
  and never steps; it goes straight to `driveTyped`, which moves one typed value, holds the
  rest and keeps every worked-out value the handle pinned (dragging d leaves h). A page names
  that typed value per handle with `drives` (`{ h: 'b', d: 'c' }`); without it the typed
  values are tried newest first. `driveTyped` tries secant steps first (on the typed value's
  own step: a whole-number l is tried at −4, never −4.95) and the slower solve with the value
  freed second. A typed handle's step search looks only 25 steps out when nothing of its own
  was refused (only a typed value would move). `drag.test.ts` checks every one of the 12
  handles moves only its typed value in fewer than 10 solves (2 today). In the browser a move
  event now takes 40–90 ms on absolute-value h and d, whole-number-answers n and
  linear-inequalities k (was 15–31 s, and k hung), and 0.4–0.65 s on ~or.
- The science pages' dead handles had the same cause: s.9 herd-immunity's C now drives R₀
  (e and P held), s.12 uranium's age drives R.
- Other drag fixes from the review: the standard-form stretch sets a alone again (b and c stay
  as typed; following with b and c clamped b and still moved the vertex); a short distance's
  handle and a near focus's handle step clear of the center's.
- **Captions.** A chain too long for one line is stacked with as many "= …" steps a line as
  fit, not one a line (they ran 100–250 px tall); a sentence that only ends in a chain ("With
  R = 0.0821, PV = nRT: …") is never stacked, and "With" counts as a word (the number-sentence
  test read it as "W" plus a unit).
- **Review scripts.** review-interact allows (and names, "drove b") the one typed value a
  handle on a worked-out value moves; flags "?" only on typed boxes; counts a changed picture
  or a drag-turn as live and tries a longer drag before "nothing changed"; flags a move event
  over 500 ms (it would have caught the freeze); says "made typed m worked out" when only the
  status changed. review-shots no longer flags a haloed label against its own backing copy.
- **Labels that knew only their own point.** Several pictures placed a tag beside its point
  without the tags or numbers nearby: a test point's and the crossing's tags swapped sides
  (~modeling), an angle's tag under a vector's name, a point's tag over a rim label or an
  axis number, "d = 13" on O (a label's middle, not its box, was kept off point names), "c"
  on B′. → Tags near another point go on the far side; vector names are placed after the
  angle tags and try three spots along the arrow; ComplexPlane and ComplexPowers leave out
  an axis number under a tag (`HsdGrid clear`), and arc tags keep off arrows and go above
  the real axis; TriangleSolver measures a side's outward normal from its true middle.
- Still open from the report: constructions' 80 px stage figures (and bisectors through the
  arc crossings), the cone scenes' hyperbola arms and plane, the percent-growth start handle
  over the "800" tick, the limits caption's final periods.
- Still slow: one solve on linear-inequalities~or takes about 0.4 s under Jest even with
  nothing to clear (its test rule); worth a look in the solver.

## Grades 9–12 page review (shared fixes)

### Page-review fixes

The four page reports (m.9–10, m.11–12, s.9–10, s.11–12) found errors whose cause was shared.
What the engine and the pictures now do:

- **Drags keep typed values.** A drag or a slider (`set` with `slide`) may change only the values
  it sends: one that would clear or change another typed value (or the example's) is refused, and
  the handle stops at the last value that keeps them all (`movedGivens`). A handle on a worked-out
  value moves the one typed value behind it instead (`driveTyped`: from a rule when one gives it,
  else by secant steps): the radius of x² + y² + Dx + Ey + F = 0 sets F, a parabola's focus sets
  q = 4p, normal~outside's cutoffs set d. A statistic worked out from data gets no handle.
  FunctionGraph holds only typed values; FreeBody holds a typed μ.
- **Subscripts.** `v_y`, `t_h`, `T_c` in steps, captions, input rows and picture labels are drawn
  as subscripts (`engine/subscripts.ts`: Unicode where every character has one, a small lowered
  run otherwise); the typesetter no longer splits a subscripted symbol.
- **Sign boxes with codes.** `engine/choices.ts`: `{h:alt}` (< > ≠ stored 1, 3, 6) and `{g:pm}`
  (+ − stored 1, −1); "we know" prints the sign ("Hₐ: p ≠ p₀"), never the code.
- **Labels over plots.** `ChartText halo` puts a callout on a band of the page colour; HsdGrid
  `clear` leaves out a tick number under a handle; captions keep a one-step chain on one line.
- **Pictures.** AlgebraTiles mats under the tiles; letter superscripts (ᵗ ˣ ⁿ); NormalCurve
  rejects when p < α and draws the rejection region as an outline; HeatingCurve's energy axis
  reads "Heat added"; the periodic table scrolls sideways at 24 px cells; ice drawn as open
  hexagons; many label placements (projectile, vectors, tides, Ksp, catalyst, dilution, phase
  diagram, power scale, box plot, transformations).
- **Mitotic index React #418.** Static rendering drops a trailing "index" from a route, so the
  page was pre-rendered as "Skill not found"; the skill screen puts it back.
- **Review scripts.** Every DragHandle has a `drag-` test id; input boxes carry `data-status`;
  `review-interact.mjs` marks as ERROR a drag that leaves "?", changes a typed value besides the
  one it drives or changes nothing, overlapping handles, a handle with no test id, and a scene
  shot under 100 px.

## Grades 9–12 follow-up: the shared engine needs

The 21 added Grade 9–12 skills had their own lesson review (math: 13 errors, 29 improvements;
science: 15 errors, about 30 improvements), fixed by one fixer per subject. Then the shared
needs (`docs/HS_NEEDS.md`, E20–E29) were worked through:

- **A rule that informs** (E20). A relation's `explain` gives the hint line when the values leave
  nothing to find ("Both sides are the same: every number is a solution"), instead of "Type one
  more number".
- **US-only pages** (E25). `unitSystems: ['us']` offers no metric menu, and a page asked for
  metric falls back to US.
- **The harness's limits** (E26). `affineOf` no longer reads a limit that fails every probe as a
  constant.
- **Rounded typed values agree** (E29, part). A typed value within half its box's step of the
  worked-out value is consistent with it (d = 463.6 against 463.601). A rounding that runs
  through several values still conflicts.
- **Significant figures.** A tie rounds up (4.35 → 4.4), and a value with more whole digits than
  figures goes to scientific notation (1234 at 2 → 1.2 × 10³).
- **Working lines through functions** (E23). `simplify.ts` works sin, cos and tan of a degree
  angle as a stage when the value is exact (98 − 50 × sin(30°) → 98 − 25 → 73). A chain that
  stops before a value needing rounding keeps its last line (√(24.5/0.25) → √98), which the
  caller used to drop as if it were the answer.
- **Working lines as written.** Whole-number exponents are raised (2⁶, 1.05²). Each bracket group
  at the deepest level advances its own stage, so a quotient's top and bottom are worked in the
  same lines ((2⁶ − 1) ÷ (2 − 1) → (64 − 1) ÷ 1). A signed number in brackets, (−100), is a
  number, not a stage.
- **p-values.** A variable can set `belowStep`: a worked-out value under half its step reads
  "< 0.0001" in its box. The m.12 p-values set it, so a tiny p-value no longer shows 0.
- **4 significant figures on science pages** (E24). A variable's `figures` caps the figures shown
  from 1 up (277.8 m/s, pH 3.602, not 277.7778 and 3.6021); `index.ts` sets 4 on every 9–12
  science value without its own sig figs.
- **A value picked from a list stays the student's.** A value with an `allowed` list that every
  rule marks never worked out (an electron or proton mass) is not filled by the search.
- **Lines that nearly cancel** (E27). A substituted line is evaluated as printed; when it misses
  the answer (1/(1/1 + 1/(−0.994)) for f = −166.4), its numbers are printed with 8 figures. The
  optics pages' "object at least |f| ÷ 10 away" limit, added to dodge this, is gone.
- **Named constants** (E28). No change: every page writes its constant as a number in the rule
  line (6.674 × 10⁻¹¹, 8.99 × 10⁹), which the check line evaluates.
- **Still open:** circular fills after a clear (E21), exact trig and radical answers (E22),
  a rounding that runs through several values (E29).

## Grades 9–12 lesson review: fractions, powers, names and reasons

Eight lesson reviews (one per grade and subject) found about 110 errors and 230 improvements;
one fixer per section applied them. What the engine could have prevented is now the engine's:

- **A rule's message is the rejection reason.** A conflict used to say "These numbers can't all
  be true together" even where a rule had the sentence ("an absolute value is never negative").
  `solve.ts` now asks the rules for their message first.
- **Numbers written as students write them.**
  - Grades 9–12 show improper fractions (11/5, not 2 1/5), set centrally in `index.ts`.
  - A value shows as a fraction only when it is exactly that fraction (0.0099995 is not 1/100).
  - A fraction or mixed number raised to a power, divided into, or used as an exponent is
    bracketed: (5/7)², 1/(1/15), 2^(4.8292 × 10⁻⁵).
  - `2^−10` is superscripted.
  - Negative money reads −$10, and rounded money groups its thousands.
  - A degree angle inside sin, cos or tan keeps its sign: sin(40°).
- **Working lines that add up.**
  - `simplify.ts` read 10²³ as (10²)³, which made the mole pages' lines false. A run of raised
    digits is now one exponent, and scientific notation is one number.
  - Grades 9–12 add a list in one line (the total), not one addition per line.
- **Names and symbols.**
  - `lowerFirst` (shared) keeps codes (P arrival, A⁻¹), isotopes (C-14), element symbols (Cl,
    Na⁺) and proper names (Carnot, Simpson's).
  - A standards test rejects a symbol that is an expression or a Greek look-alike (−q, ᵦ), so no
    step reads "−q = −q".
- **Ranges.** A range's slack shrinks for small units, so −1 mm no longer passes a km range at 0.
- **Harness.**
  - It reads −$10, a superscript digit before °, and gcd of negatives.
  - The review dump prints each rule's messages.
- **Still open** (shared needs in `docs/build/*.md`):
  - A message that informs without refusing (m.9 "every number is a solution").
  - Values left over after a clear used as knowns in a walkthrough (s.10 emission, bonding).
  - Exact trig and radical answers, and complex roots in polynomial answers.
  - `functionGraph` following the unit menu.
  - `affineOf` taking a limit that fails every probe as a constant.

## Grades 7–8 review: exact steps, drags that keep typed numbers, pages that fit

- **Exact simplifying.** `simplify.ts` reads a fraction as one number, keeps results exact
  (fractions when the line had them, denominators to 100), keeps π as a factor ("9π") and stops
  before a line that would have to round (`≈`), so no chain rounds halfway. Negatives are
  bracketed only after an operator; lines that differ only by brackets are dropped.
- **Numbers.** Scientific notation keeps 5 significant figures; a π answer adds its decimal in
  brackets after "≈"; units say the singular for 1 with a capitalised name ("1 Earth
  mass").
- **Drags keep what was typed.** `lineSystem` lines and `linearFunction` take `keep` (the
  typed values held while a handle moves) and `fixed` (no handles when every value comes from
  typed points); `powerScale` takes `fixed`. Rate pages solve both ways (`rate()` in
  `math/8.ts`), so a drag moves the answer instead of clearing a typed box to "?".
- **Fraction boxes** on the web get the text keyboard (a "/" key), as do π, scientific and
  repeating boxes.
- **Long quotients wrap.** A division whose top is over 28 characters stays inline text
  (`latex.ts`), so a sum of eight distances ÷ 8 no longer makes the page scroll sideways.
- **Pictures.** The balance draws tens and ones past 15; the orbit's pull reads to 3 figures in
  Earth's pull, moves to the corner near the sun and titles the planet "Planet" unless it is
  Earth; a rate race says its rates in the axes' units ("$24.50 per cubic yard"); intercept
  chips leave the x-axis numbers; worked chains in a caption share one left edge; a battery
  reads "6 V", not "V = 6 V"; the moon sits under Earth; a solid packs as a near-square block
  (16 salt units 4 × 4).
- **Harness.** Nets check that a triangle closes, not that it is right-angled; the balance
  counts to 100; power rows past 24; the sample holds 1,000; picture values compare to 12
  figures; a refusal with its own reason is not a failure.
- **Follow-up, all logged items closed.** "At least" constraints allow rounding (a top height
  worked out as 59.0999… is at least the 59.1 typed), which was the `s.8.kinetic-potential`
  conflict. Repeating decimals are drawn with a bar over the block (`\rep` in `latex.ts`,
  `repeatingParts` in `format.ts`). `treeDiagram` takes a `third` stage
  (`m.7.probability~three-stages`); `powerScale` takes a `second` number, marked on the ruler
  or at its end (the compare page); the association sort's cards show a `scatter` card
  figure; the carbon cycle's decomposer arrow reads "decay". A chance already shown as its
  fraction is not repeated ("1/8 = 1/8").

## Grade 7–8 math engine, second half: repeating decimals, angles, roots, lines

- **Repeating decimals (E3).** `repeating: true` prints 1/6 as "0.1666…" (the block written to
  at least three digits, twice when longer; blocks over 6 digits print as usual), and boxes,
  the answer reader and the harness read it back as the exact fraction. `decimalLongDivision`
  takes `repeat`: it stops when a remainder comes back and notes "Remainder 4 again, so 6
  repeats". Pages: `m.7.rational-operations~fraction-to-decimal`,
  `m.8.roots-irrationals~repeating-decimal`. The steps write "0.1666…" and the math renderer
  draws the bar over the block (see the review entry).
- **Angles (E7).** The angles picture takes `triangle: { third }` (three angles and the
  exterior angle, `TriangleAngles.tsx`) and `parallel: true` (two parallel lines cut by a
  transversal, the eight angles numbered, `ParallelAngles.tsx`); the harness checks the angle
  sum and the straight whole.
- **Dice (E9).** The dice grid says its comparison in words: "pairs with a sum of at least 10".
- **Roots (E10).** `rootSquare` takes `between` (the whole numbers on either side, checked) and
  `solid: 'cube'` (`CubeRoot.tsx`: a cube whose edge drops onto the number line). The harness
  reads "whole number at or below the square root of 39".
- **L-shaped base (E14)** uses `rectilinear` with `cut` and lists the height, volume and
  surface area under it, as the plan allowed; no new solid.
- **Numbers in full.** `full: true` writes 3,800,000,000,000 and 0.0000003973 out (the
  scientific-notation main page); the unrounded-number check ignores leading zeros.
- **Tiny values survive.** The solver rounded anything under 10⁻¹² to 0, so 2 × 10⁻¹⁵ became 0;
  a `scientific` value now keeps it. The harness compares picture values to 12 significant
  figures instead of 9 decimals.
- **π in a division.** The harness read "90 ÷ 9π" as (90 ÷ 9) × π; "9π" is now one bracketed
  number.
- **Two lines for big numbers.** The balance holds 10 x-blocks and 15 counters, so
  "2(3x + 2) = 2x + 28" is drawn as two lines crossing at the answer, and "2/5 b + 1 = −11" as a
  line meeting a level. Lines through (0, 0) with no solution name the steeper one instead of
  "They cross at (0, 0)".
- **Not built at the time (listed for the review):** E11 (not needed: the two-points page
  uses `linearFunction`, which marks the intercept) and the explore figure `graph`
  (read-a-graph stays optional). E13, the `powerScale` `second` marker and the `treeDiagram`
  `third` stage were built in the review's follow-up.

## Grade 7–8 math engine: π, scientific notation, rules that say why

- **π values (E1).** `pi: true` on a variable prints a whole or two-decimal multiple of π as
  "36π" or "2.25π"; boxes take "36π", "36 pi", "36*pi". The harness reads "6π" as 6 × π.
- **Scientific notation (E2).** `scientific: true` prints "4.7 × 10⁵". Every value that used to
  fall back to the calculator's "3.000e16" now prints "3 × 10¹⁶", bracketed where a negative
  would be ("÷ (3.1 × 10⁻⁷)"). Boxes take "4.7 × 10^5", "4.7 x 10^-3", "3 × 10⁻⁴" and "4.7e5".
  Negative exponents are raised (⁻) in `superscript`, typeset by `toLatex` and read by the
  harness; the harness's number pattern (`NUM`), answer reader and conversion-line reader take
  scientific notation as one number. `math/6.ts`'s `shownNum` parses with `parseNumber`.
- **A rule that says why (E4).** A relation's `message(values)` returns a sentence when it has no
  single answer (equal slopes; the same x on both sides). The newest input is then refused with
  that sentence under its box, and the student's earlier numbers stay.
- **Negatives (E5)** were already bracketed after an operator or before a power
  (`renderTemplate`), as the Grade 7 pages need.

## MODULE_IDS scopes every per-page suite

Only the sampling harness honored `MODULE_IDS`; the modules, standards, latex, layouts and
layout-figure suites ran every page, so a one-grade run took 160 s and per-grade CI saved
little. `harness/scope.ts` now scopes all of them (`pages()` gives the `each` table, with a
skipped stand-in when nothing is in scope, since Jest refuses an empty table). A Grade 8 science
run takes 11 s; the full suite about 3 minutes.

## Building and reviewing with less

- `scripts/review-evidence.mjs` runs in stages (`--stage lesson` needs no build or browser;
  `--stage page` builds only the pages in scope, 10 s instead of minutes, and reuses `dist/`
  while it is newer than `src/`), reviews only changed pages with `--changed` (a hash per dump
  section in `.review/page-hashes.json`), skips screenshots of text-only sorts and sequences
  (the dump prints `figures: n`) and drags only picture kinds not dragged before
  (`.review/interact-kinds.json`). `PRERENDER_PREFIX` limits `generateStaticParams`
  (`src/data/prerender.ts`).
- `scripts/ci-test.mjs`: every cheap suite in full; the modules and sampling suites only for
  the grades a push changed (full when the engine, a component or a shared file changed, on a
  pull request, and nightly).
- `scripts/plan-brief.mjs` gathers a grade's planning brief; `scripts/promote-demo.mjs` copies
  a gallery demo into a grade file as a page.
- The gallery keeps one demo per picture kind once the kind is on a lesson page: 251 of 425
  demos retired (ten round files deleted, the rest filtered by `RETIRED` in `gallery.ts` until
  their files are tidied). The tracker test lets a placed picture have no demos.
- `docs/MODULE_GUIDE.md` is the standards and the process (1,900 words, from 6,700); the picture
  catalog and art direction are `docs/PICTURES.md`, the layouts `docs/LAYOUTS.md`, opened only
  when choosing one. The reviewer prompts read the guide's Standards only.

## Test suite trimmed

A full `pnpm test` took 19 minutes, 99% of it the sampling harness (100 random givens and 15
edit sequences per module, 647 modules). Every failure it found while Grade 7 science was built
showed up within the first few samples (×19, ×20, ×60 repeats), so the defaults are now 12
givens, 2 edit sequences and 3 cases per unit choice (`UNIT_CASES`); the modules test tries at
most 20 input combinations per page. `scripts/review-evidence.mjs` runs the harness deep
(`SAMPLES=100 SEQUENCES=15 UNIT_CASES=10`), so the review still sees the full sampling. The round-3 card-figure test
folded into `layoutFigures.test.ts` (one figure-fit test per layout page). Everything else
stays: each of the other suites runs in under ten seconds and each has caught a real defect
(`standards`, `layouts`, `units` and `pictureRequests` all did this week).

## Round 4 pictures reviewed (Q01–Q52)

- 45 of 52 kinds passed as drawn. Fixed: the Pangaea "Australia" label clipped at the board
  edge (`continentsFigure.tsx`); double-number-line drags landed on 3.003 (now a tenth of a
  mark, `DoubleNumberLine.tsx`); the weathering page's typed bars drew in the calculated
  (dashed) style for want of `editable: true`.
- Open: `Bars.tsx` should draw a start value solid even without `editable`, and
  `harness/pictures.ts` flag a bars spec whose start values aren't editable; the amplitude
  handle on `Wave.tsx` also moves the wavelength (pin it on the amplitude page); `Hops.tsx`
  prints a stop label twice at 0 → 100; `BaseHeight.tsx` and `FractionFit.tsx` overlap labels
  on slivers (hide or merge pills under a minimum height; thin group labels).

## Before Grades 7–8

- Grades 7 and 8 read in the `middle` band (`grade.ts`): the formula in letters with its
  meaning, the numbers put in with the unknown kept, then one undo step per line. `standard`
  (rearranged letter lines) starts in Grade 9.
- A tape draws no handle on a derived part (`Tape.tsx`): dragging a rounded value or a sum
  could only clear or rewrite what the student typed. Two part boundaries closer than a handle
  sit in the upper and lower halves of the bar, so both can be grabbed.
- A net with its length unknown labels the length and every face "?" instead of the example's
  numbers (`Net.tsx`).
- `autoWritten` draws no column grid for round numbers with at most two figures each
  (36,000 + 23,000; 61,000 − 28,000): they are done in the head, as the step says.
- `standards.test.ts` fails a convertible value named by a plural unit word ("Minutes cut",
  "Liters saved"): the name must survive the units menu.

## Textbook-gap pages review

- A sort's wrong-bin hint repeated the whole card; over 60 characters it now says "Look
  again." and the question (`SortLayout.tsx`).
- A `cut` card figure drew 4 equal parts of a square as a 2 × 2 grid even with
  `cuts: 'straight'`; it honors the cut now (`CardFigure.tsx`).
- The plot caption in words mode names each value (`rep.named`); a tape's group label sits
  under the part, and a label wider than a short compare bar sits past its handle (`Tape.tsx`).
- Open, from the page reviewer: a tape whose parts are derived erases the typed inputs on a
  drag (a `static` option or back-solving); two handles within 24 px are unreachable (stagger
  them); a compare tape needs a `mark` for a value between the bars; `Net.tsx` prints the
  example's length for a "?" value; `autoWritten` draws column grids for round numbers a step
  says to add in the head; a variable named by a unit word on a convertible value should fail
  `standards.test.ts`.

## Round 3 pictures placed (D01–D101)

- 432 card pictures on 64 sorts and sequences, taken from the pictures chat's gallery demos by
  card label. The cards the reviewers left as words stay text.
- Pictures:
  - crossed-out counters and blocks for take-away;
  - fruit and animal icons in picture graphs;
  - half pictures with one key;
  - two rounding lines for an estimate;
  - equal sides labeled on a polygon;
  - a third ratio bar;
  - tenths × tenths on a 10 × 10 grid;
  - decimals stacked by place with their sum;
  - a scale before and after, and a spring scale.
- Drawn figures:
  - a plant, a bear and turtle, and a body with its organs;
  - the parent and young above two offspring sorts;
  - deer and penguins for animal groups;
  - a thermometer, a plant beside a ruler, a ramp, the noon shadow's side, a flashlight and a
    cup on six observe pages.
- The three-part ratio page's amounts could each reach only 200,000 while the total reached
  600,000, so a large total had no split the solver could find. The amounts now run to 600,000,
  and start at 1: a total of 0.1 split 3 : 9 : 7 broke the typed decimals. Seeds 1–20 now pass.

## Round 2 pictures placed (R15, R21–R29)

- Ranges raised to the released questions:
  - factor pairs to 200, multiples to 1,000;
  - hundredths with ones to 99;
  - the grouping page's third factor to 90;
  - powers of ten to 10⁹;
  - decimal division with quotients to 999;
  - percents past 100% (5/4 = 125%) and in tenths of a square;
  - fraction multiplication past one whole (10/3 × 5/7).
- New pictures:
  - the Grade 2 number line counts its ticks from the start;
  - the decimal line starts at the whole before the point (a derived value);
  - a new quarter-inch line plot page from a fractional start (3 3/4 to 5 1/4 in), written in
    mixed numbers; the toothpick page stays in eighths.
- The power of 10 is worked out from the exponent: with no allowed list, a typed 999,999,999 had
  passed as 10⁹.
- A value longer than 11 characters gets a wider input box and smaller digits.

## K–6 diagram review (three lesson-reviewers)

- Pictures changed to existing kinds:
  - Grade 1 compare problems draw cube trains (`compareProblem(…, cubes)`).
  - Meters and centimeters draw meter sticks.
  - Plant heights draw rulers.
  - The two-step share draws one bar joined, then split into groups.
  - The same-perimeter and same-area pages draw a rectangle of unit squares.
  - Take-away is drawn as part and whole.
  - The remainder page draws the full groups plus the leftover piece.
  - Pay and hours has the table and the unit rate.
  - The plant's gain against the soil's loss is a compare tape.
- Equation inputs on 43 more pages: sentences as written, including `{n} = 10 + {o}`,
  `({a} + {b}) × {c} − {d} = {r}`, `{k} × [{a} + ({b} × {c})] = {r}`,
  `{n} ÷ {d} = {q} remainder {r}` and `{a} + {b} = {g}({x} + {y})`.
- The 90 pictures still to draw are in the tracker (D..) with the pages they are for.

## Sliders on iPhone (user feedback)

- On the equivalent-expressions page a slider took a tap but not a slide on an iPhone. iOS
  Safari doesn't always honor `touch-action: none`: it took the finger's movement along the
  vertical track for a page scroll and cancelled the drag. → The shared drag helper
  (`pointerDrag.ts`) cancels `touchmove` on the element with a non-passive listener. That
  covers every slider, every draggable picture handle, and the observe pages' bars, which now
  use the same helper on the web.
- Checked with an iPhone touch emulation on all 25 pages with sliders: every slider that isn't
  held moves both ways; an observe bar follows a drag.
- The equivalent-expressions page takes the equation instead of sliders:
  `{n}({m} + {x}) = {u} + {w}`. An equation with more than 4 columns side by side uses the
  compact boxes, so it fits on a phone line.

## Pictures from the other chat merged

- Their branch merged. Conflicts were in `dotPlot` (their count handling was kept, along with our
  harness median check) and in `SLIDERS.md`.
- A "$10" in step text ended typeset math. → Dollar signs outside math are written `\$` and
  split correctly.
- A price answered "about $0.03" left the check showing a number the steps never showed. →
  - The steps add the exact value ("0.02 × 161.9 ÷ 100 = 0.03238") when every input was typed.
  - The harness reads the exact value behind "about $" and "less than 1 cent".
- With sides to 100, the whole-number search gave up before it could prove that a volume like
  677,020 can't be made. → The search budget is 20,000 tries (from 4,000).
- The grass-slope caption repeated the value's name. → It now reads "More washed off the bare
  tray: 260 g."

## Fraction division picture words (user feedback, lesson-reviewer)

- "2/3 is 3/4 of a group, so a whole group is 8/9" was hard to follow: an amount and a
  fraction of the whole in one clause joined by "is", "group" where the question says "the
  whole tank", and no step for what one part holds. → The `share` picture labels each part
  with what it holds (2/9), the top bracket "2/3 fills 3 of 4 parts", the bottom "the whole:
  4 × 2/9 = 8/9"; the caption: "2/3 fills 3 of the 4 parts, so one part holds 2/3 ÷ 3 = 2/9.
  The whole holds 4 × 2/9 = 8/9." Its math never breaks across lines.
- An amount past the whole (2/3 fills 5/4) drew only 4 parts. → It draws 5, with the whole
  bracketed under the first 4.
- The page says "the whole" throughout (title "How much fills the whole?", value names,
  steps, note).
- `groups` captions: "0 full groups … : 8/9 groups" → "Not one whole group of 3/4 fits in 2/3;
  it holds 8/9 of a group."; "1 groups" → singular; a partial last group ends "so 1 2/3
  groups in all".

## Page limits out of the formulas (user feedback)

- Limits ("3/4 is at most 1", "is at most 24 wholes") in the Formulas section and the Check
  read as steps for solving the problem. → Constraint relations are left out of both; a value
  that breaks one gets "This page only works when …" (the rule in words) under its box instead
  of "Doesn’t fit p/b ≤ 24". The module test counts checks without the limits.

## Typeset math in the Formulas section (lesson-reviewer, focused)

- Formulas were flat text while the steps under them were typeset. → `FormulaSection` draws
  its lines with `MathLine`: Grades 3–5 number sentences stacked; Grade 6 letters in italic
  with ÷ inline (`solving: false`) and the meaning in words after them as text; high school
  letters and numbers with divisions stacked; the words line only small number fractions
  (`words: true`), so "natural increase ÷ population" never stacks.
- `(1 + r ÷ 100)^t` left a raw ^ (the division split the bracket first). → Bracket powers are
  found first, with their divisions typeset inside.
- `v₀²` lost its power; `cx`, `rh`, `px` were upright; `a/b` on a letters page stayed flat;
  `f(x)` was upright; `x^power` took the p of "power". → Subscripted letters take powers,
  runs of up to three module letters are italic products outside sentences (never a short
  word like "at"), two module letters stack as a fraction, f/g/h before a bracket is italic,
  and ^ takes a whole letter only.
- Limit lines ("3/4 is at most 1", "fills", "full wholes in") read as sentences. → Their
  fractions are drawn small.
- `v = cx + k` read "17 = 34 + 5" with numbers in. → `renderTemplate` writes × between side by
  side letters when it fills in numbers (17 = 3 × 4 + 5).
- "24/6 = 4 0/6" → the Formulas section drops an empty fraction part (24/6 = 4); the Grade 5
  regrouping line says "rename 1 whole as 24/24 first if needed".
- `latex.test.ts` also round-trips every page's formula lines (letters, numbers, words).

## Typeset math in the step-by-step (lesson-reviewer, focused)

- Steps showed 2/3 ÷ 3/4 and √(3² + 4²) as flat text. → A LaTeX subset drawn by the app
  (`engine/latex.ts`, `components/MathLine.tsx`): no dependency, no network, iOS and the web.
  The text stays plain for the harness; `toLatex` typesets at render time, by grade band.
- The reviewer's rules: units never become powers or letters (36 m²); a fraction before a period
  counts; bracket and ^ powers; math inside roots; stacked divisions from high school and on
  Grade 6 solving lines; letters in italic on letter pages; smaller fractions in sentences.
- A typeset fraction "=" a rounded decimal (31/24 = 1.2917) read as false. → Mixed-number lines
  use fractions to 144 (31/24 = 1 7/24).
- `latex.test.ts` round-trips every page's step lines and parses them.

## Pages built from the released questions (K–6, after the edge-case review)

- Center and spread took exactly 5 or 6 values; released items use 4, 7 and 10. → A value can
  belong to a list whose length is itself a value (`countedBy` on the variable): past the
  count it is hidden, never asked for and left out of every relation. `dotPlot` takes `count`
  and draws the first n. The module, standards and sampling tests read counted lists.
- A price for one item that isn't a whole number of cents ($10 for 3) was dropped. →
  `dollarsOf` shows "about $3.33" (or "less than 1 cent") in the answer, the picture and the
  value box, after a work line with the exact quotient; the harness reads "about $…" answers.
- A check-only rule (0 when it holds, 1 when not) passed once the values reached the thousands,
  because `holds` scaled its tolerance by the values. → Rules are exact: `holds` returns
  residual === 0 for a constraint.
- 9,449.871 failed "multiple of 0.001" (9,449,871.000000002 thousandths). → The multiple-of
  check is relative to the number of steps.
- A signed change (a drop of 10 °C) was drawn as a jump and checked as a distance. → The
  integer-line check takes a signed change; the harness reads "change from a to b" as b − a.
- Answers a question asks as a fraction or a mixed number (5 1/4, 3 7/8 inches, 8 7/24) come from
  `fraction` on the variable; the new pages use it for fractions of a whole, line plot totals
  and mixed-number sums.
- Pictures that cap a range (100-square grids, 3 whole grids, 30 jumps, fraction area of one
  whole, a 12-group limit, charts to millions) are listed in `docs/RENDERINGS_BRIEF.md` for the
  picture branch; the pages keep their ranges until those pictures land.

## K–6 edge-case review (math and science, 12 reviewers, low sampling, every edge)

- A value the student typed that no longer fitted was dropped silently, and the evidence
  hid why. → The dump's edge blocks put the edited value last (as a student types it), so
  the rejection and its reason print; the values line shows `allowed`, `multipleOf` and
  `derived`. Sampling snaps typed values to each variable's step and puts the edges (min,
  max, one step in, 0, 1, 2) first.
- Picture drags that went past what the other values allow were refused, and a refused
  drag marked the held values "doesn't fit" (box plot boxes showing old numbers). → Every
  single-value drag passes `rep.slide(id)`: it stops at the last value that fits. A refused
  drag marks only the dragged value.
- Labels ran off the canvas at the edges of a range. → `fitLabel` in `reps/common.tsx` flips
  or slides a label inside (coordinate plane, dot plot, tape). Two points in one place share
  a label; a zero-length segment has none.
- Large units (miles) broke the solver's narrowing and reach checks. → Slopes are measured
  per grid step and tolerances scale with the size of the terms (solve.ts and the harness).
- "6.400e7" and "9.999e8" in Grade 6 answers. → Whole numbers below 10^15 print in full with
  separators. "1 units", "1 minutes", "1 days" → `unitFor` gives the singular after 1 (word
  units only; symbols such as ms stay).
- Step text: teen factors break apart (6 × 14 = 60 + 24), two multiples of ten use the fact,
  "1 ten", divisor 1, where 1,000's hundreds come from, no lines for places that are 0 in
  both numbers, millions in place compares, separators in every sum, count-up and written
  header. The repeated "q groups make n" after a strategy line that already says n is gone.
- Compare pages said "9 is longer than 6" and never "the same". → `difference` takes
  `bigger`/`equal` sentences and `moreThan` names the bigger thing; pages with a direction
  ("more with water", "warmest") add `atLeast` so the other way round is refused.
- Add and subtract "how" lines were fixed strings that didn't fit 0 + 5 or 36 + 30. →
  `addSub` takes a function of the values.
- Harness: a minus before a power ("−(0.04)^(1 ÷ 2)"), rounding "to the hundredths" by name,
  and more than 40 fraction groups (FractionFit now draws one bar past 40).
- Still open (engine work listed for the owner): a fraction display for measure and quotient
  answers (33 1/3, 2 3/8 L); per-variable unit lists (no rain in km); an inequality never
  being the step that finds a value; K–2 rejection wording that names the value and its
  limit; display precision on a variable (density to 2 significant figures).

## Picture art pass (owner request: better-quality images for every diagram type)

- Photos could not be used:
  - Every image host (Wikimedia Commons, NASA, USGS, Unsplash, Pixabay, Openclipart) was
    blocked from the build environment.
  - The app makes no network calls, so images would have to be bundled.
  - Licensed material is never used.
    → Pictures are drawn in code in the style of photographs and classroom materials.
- Diagrams were grey outlines with one indigo accent, so a jug of water, a penny and a crate
  looked alike. Fixes:
  - The palette has **materials**: water, glass, mercury, copper, silver, bills, wood, metal,
    paper, six rock colors, plastic, life greens, pattern-block colors, a second counter color
    (`chartSecond`), shadow, shade and shine. Each has light and dark values.
  - `reps/paint.tsx` has the shading and object helpers:
    - gradients: `Sheen`, `TopLight`, `Deepen`, `Glass`, `Metal`, `Ball`;
    - shadows: `FloorShadow`, `BoxShadow`;
    - objects: `LitRect`, `Crate`, `Tag`, `CounterDot`, `raised`;
    - `usePaintIds`, which makes gradient ids unique on the page.
- Redrawn:
  - water and glass: the jug, the graduated cylinder (with meniscus and foot);
  - instruments: thermometers on boards, the clock (metal rim, tapered hands), the scale, the
    balance (metal dishes, two-color counters), the protractor (clear plastic), the wooden ruler
    with satin ribbons;
  - coins and bills (copper, silver, ridged edges);
  - rock layers (strata colors, grains, fossils);
  - classroom materials: base-ten blocks (wood with unit lines and depth), unit cubes (lit
    faces), cube trains, pattern blocks (red, blue, green);
  - the microscope field (eyepiece, lamp light, green cells);
  - crates for forces;
  - counters (ball-lit) in ten frames, arrays, dot sets, number bonds, pairs and compare rows;
  - bars, tapes, fraction bars, shared wholes and percent bars (lit fills);
  - the pie (depth), the wave (glow), the circuit (copper wires), the prism (see-through
    faces), the wooden solids;
  - the card icons and rocks in their colors, and cells tinted like a stained slide.
- The drag handle was a hollow ring. → A white knob with an accent ring, a center dot and a
  shadow.
- Dark mode turned lit empty cells grey. → The palette's `sheen` scales every highlight; dark
  uses 0.4.
- Guard: `src/components/__tests__/colors.test.ts` fails on any hex or rgb literal in
  components or screens. Dropdown's backdrop moved to a `scrim` token.

## Direction plans for K–5 (before the rebuild)

- Four lesson reviewers planned K–2 math, Grade 3 math, Grades 4–5 math and K–3 science from
  scratch (`.review/plan/plan-*.md`): what each skill's pages should be, a verdict per page
  (keep, update, replace, add, remove), new graphics and engine needs.
- Rules in words came out garbled when a name met its own word ("Shaded shaded", "full groups
  full groups", "are layers apart apart"). → A repeated run of one to three words collapses;
  `apart` reads "Difference between … and … = …"; a relation can carry its own `words`
  sentence; `standards.test.ts` fails an "are … apart" rule or a doubled word. The Grade 4
  perimeter rule read "2 × length + width"; it now reads "2 × (length + width) = perimeter".
- Grades 3–5 still counted facts ("Count by 7s, 10 times"). → `byGrade` in the walkthrough:
  Grade 3 turns a count of more than 3 groups into the fact strategy (`factWork`: double,
  double again, five and one more, ten less one, five and two or three); Grade 4 on drops
  counting lines and chains of make-ten jumps. The standards test fails a counting line from
  Grade 4 and a count of more than 4 jumps in Grade 3 (counting by 5s and 10s aside).

## Graphics for the K–5 rebuild (before any module changes)

The four direction plans named the pictures their pages need; all were built first, each
with a gallery page (`/gallery`, now showing layout demos too) and a harness check.

- Explore figures: `push`, `vibration`, `sky`, `static`, `timesTable`; `lightPath` traces a
  shadow from the lamp over the object (a low lamp's shadow runs up the wall). Figures moved
  to `layouts/figures.tsx`; `layouts.test.ts` now checks each figure's scene field from one
  table instead of a line per figure.
- Card figures moved to `layouts/CardFigure.tsx` (also used by sequence stages): solids, cut
  shapes (unequal parts sized 1, 2, 3 so the difference is plain), ribbons measured right or
  wrong, dots in pairs, fraction bars, segment/ray/line/point, curved sides, and polygon
  marks worked out from the corners (square corners, equal-side ticks).
- New kinds `factorPairs` and `shareWholes`. `areaModel` splits typed factors by place
  (`placeParts` in `helpers.ts`, decimals too) and has a division mode, so modules stop
  holding one variable per box.
- Options on 20 existing kinds (listed in MODULE_GUIDE). Two were bugs found on the way: the
  tape clamped groups to 20 before its "past 24" check, so 86 groups drew 20 parts (dashes
  now stop at 12 and a label names the groups); the skip count rounded its step to a whole
  number, so jumps of 2.5 were drawn as 3.

## K–2 rebuild (science K–3 and math K–2 plans)

- **A story's order is a constraint** (`atLeast` in `helpers.ts`): a hard push rolls at least
  as far as a gentle one, the sunny spot is at least as warm. The solver rejects the other
  order, so a note never calls the smaller one bigger; with the order fixed, K–2 pages read
  the sentence as a take-away (9 − 4 = 5) instead of "9 and 4 are 5 apart".
- **Echo lines** are gone: a K–5 step no longer prints "3 + 4" under its question "3 + 4 = ?".
  Grade 2 column sums also drop running totals ("300 + 70 = 370") when the place lines
  ("Hundreds: 200 + 100 = 300") are there.
- **A fixed whole on the tape** (`total: { value, label }`): Earth's water is 100 cups, and
  the page asks for the fresh cups.
- `regroupLine` in `work.ts` ("23 ones = 2 tens and 3 ones") replaces a hard-coded "1 ten
  and N − 10 ones" that read "23 ones = 1 ten and 13 ones".
- `apart` takes the note for equal values ("balanced: the box stays still").
- Harness phrases: "jumps to 40" (tens counted), "4 jumps of 10", "whole hundreds in 347".
- Layout test: every Kindergarten math sort card carries a drawing (non-readers).
- **Still open.** A compare answer (a result that is a word or sign: more, fewer, the same;
  > , <, =) needs an input that is not a number. Until then the compare pages name the count
  > left over ("Left over", "How far apart") and put the compare sentence ("7 is more than 4")
  > first, as the plan's interim says. The four Grade 2 two-step pages stay separate: merged,
  > the direction of each step would be a value a Grade 2 student reads as −1 (the hop switch
  > is built for when a page can hide that value).

## Grade 3 rebuild (math 3 plan)

- **A choice of scale or key** (`allowed: [2, 5, 10]`): the bar graph reads its line spacing
  from a value (`bars.scale` names it; `standalone` because no rule uses it), and the picture
  graph's key is 2, 5 or 10 with half pictures (`step: 0.5`); the work counts the whole
  pictures and then adds half the key.
- **The ruler reads its marks per inch from a value** (`ruler.marks` takes an id), so one
  page reads halves or quarters; the harness checks it is 2 or 4. The page no longer writes
  "9/4 inch" but "2 inches of 4 marks and 1 mark".
- **A range can enforce an order**: the cut-out page uses "width left" and "height left" (at
  least 1) instead of a constraint the brute-force search could not reject well.
- **Unreachable values.** A picture graph's total with a key of 5 or 10 must be a multiple of
  5 past 60; the solver can't see that, so the total stays on the bar graph page only. A
  perimeter `multipleOf: 2` failed in miles (the check runs in centimeters); the same-area
  page keeps to metric.
- `tradeLines` (the trades a student writes, "No tens to trade: trade 1 hundred for 10 tens")
  moved to `work.ts` for Grades 2 and 3.
- Harness phrases: "N inches of 4 marks and 1 mark", "N marks".

## Grades 4–5 rebuild (math 4–5 plan)

- **Written work by grade.** `partialQuotients` (Grade 4: groups taken away by place, each
  partial quotient beside it, then added) and `standardMultiply` (Grade 5: carries above, one
  row per digit, the tens row's 0, the rows added). `autoWritten` uses them; no grid for a
  division whose digits each share evenly (26 ÷ 2) or for adding one place unit
  (999,000 + 1,000).
- **A step's grid can come after its work lines** (`writtenLast`): compare place by place
  first, then subtract; the standard algorithm's rows in words, then the grid.
- **Exponents are written raised.** `renderTemplate` turns a whole-number caret power into
  superscript digits (10^3 → 10³); the harness reads them back.
- `placeCompareLines` (whole numbers and decimals to thousandths) and `numberWords` to a
  million (expanded form's number name).
- **Pictures:** the angles picture takes a fixed whole (a full turn, 360), so a turn no longer
  needs a "Full turn" value; the double number line reads a decimal top (2.5 m); grid100 checks
  a percent's range rather than whole squares.
- **Harness phrases:** place parts by name ("the ten thousands part of 347,812"), "rounded
  down to the 1,000s", "common denominator of 4 and 6", a line plot's spread in eighths.
- **Still open.** A fraction value (typed 3/4 or 2 3/4) would bring the fraction pages to 3–4
  values and allow adding mixed numbers; a unit-pair value would name real units (feet and
  inches) instead of "bigger" and "smaller" units. Names like "x-coordinate" stay out before
  Grade 6: the pages say across and up.

## Grade 6 (Sections 3 and 7, first review)

- Metric-only pages still offered Mixed (US) units. → `unitOptions` honors `unitSystems` for
  Mixed too.
- A Grade 6 words page could not show "3x + 5" without every value becoming a letter. → A page
  can list the letters it teaches (`letters: ['x']`); the standards test allows only those.
- Explore figures reused React keys between scenes and left stale shapes; a map was scaled by
  width only and cut off. → Unique keys per figure part; figures fit both dimensions. Still
  wanted: a check that every shape fits inside its picture, and one for a label drawn over an
  arrow of its own color.
- A drag moved a point off the line it stands for. → The two-quantities page uses the plot
  (the point moves along the line with its rate held). Still wanted: a test that drags every
  handle and checks the relations still hold.

## Grade 6 build (Sections 3 and 7, from the reviewer's plans)

- Grade 6 is where letters arrive, but a student can open ratios before expressions. → A
  `middle` band: pages set `notation: 'letters'` only where the standard is about letters
  (6.EE, the area and cube formulas); every other Grade 6 page (and all of Grade 6 science)
  reads like Grades 3–5. A letter page gives the rule glossed ("A = b × h (area = base ×
  height)"), puts the numbers in with the unknown kept as its letter ("40 = b × 5"), then
  undoes one step per line, with no college rearrangement line.
- Negatives were bracketed everywhere ("((−4), 3)") and printed with a hyphen. → Numbers print
  a true minus (−4) and a negative is bracketed only after an operation sign or before an
  exponent; a relation can set its own number `sentence` so a signed difference never reads
  "3 − (−5)" (Grade 7). Distances across 0 are worked by distances from 0 ("|−4| + |5|").
- No written work past Grade 5. → Grade 6 long division carries the point up and writes zeros
  until the division ends; facts with zeros (300 ÷ 30, 1,800 ÷ 6) and multiplying by 10, 100
  or 1,000 stay in the head; Grade 6 science leaves the grids to math.
- Money showed "$7.5". → Dollars always show their cents.
- The solver accepted inputs no value could complete (a sum of five values of 0, with three
  already typed). → Before keeping an input, the solver checks that every straight-line
  relation can still reach its value with the unknowns inside their ranges, and says why not.
- A parallelogram's base in millimeters and its height in centimeters drew the wrong shape. →
  A shape's lengths, areas and volumes change unit together, and so do two values of one kind
  (water levels before and after).
- The area model ran off the screen past four places. → It keeps the smallest places together
  in the last box (5,430.76 as 5,000 + 400 + 30 + 0.76).
- The harness read "x + 7 − 7 = 12 − 7" as the sum 7 − 7 = 12. → A sum after a letter term is
  not checked as arithmetic. It now reads the greatest common factor, least common multiple,
  shared prime factors, signed distances, quadrants, medians, ranges, mean absolute deviations
  and cube roots.

## Science Grades 4–5 (Section 6, first review)

- `apart` (no direction) was used for a rise, a loss and how much farther, so a drop from
  120 °F to 50 °F showed a rise of 70 °F. → `minus` in `helpers.ts` for after − before, and a
  module test fails a relation built with `apart` whose value is named a rise, loss, gain,
  escaped, worn or farther.
- The wave picture drew a fixed number of waves whatever was typed. → `wave.extent` takes a
  value; the harness checks it is drawn.
- A fixed count ("4 quarters in a minute") had to be a fake input. → `skipCount.count` takes a
  number; no handle or stepper for it.
- Grids for 50 + 20 + 30 and for 1,000 − 998. → No grid for tens that add to 100 or less, and
  none for a difference under 10 (counted up).
- A rule that two values are equal printed as a step plus a check that repeated it. → The
  conservation page names one total "before and after stirring" instead.
- Pictures (page reviewer): Earth's night half was lighter than its day half in dark mode (new
  `chartDay` and `chartNight` tokens); gas particles sat on one line (fixed scatter); observe
  columns overflowed at six (they share the row); the sort hint quotes a card as written; the
  waterfall showed a letter on a Grade 5 page and now names its bars; a pie keys wedges under
  12°; thermometer numbers space themselves; a parts figure picks its scene by tapping a part.
- Open: `unitSystems: ['metric']` still offers kN on a newton page; no food-web figure yet;
  the waterfall's scale leaves room above the bars.

## Word rules read as sentences (Grades 3–5)

- A fraction in a word rule read "First numerator/First denominator", and names kept their
  capitals mid-rule. → `wordRule` (in `grade.ts`) reads a fraction of names with "over" and
  lowercases every name after the first: "First numerator over first denominator is at most
  1", "Length × width = area". The formula box, the walkthrough and `standards.test.ts` all
  use it.

## Science Grades 4–5 build (Section 6, from the reviewer's plan)

- The lesson reviewer planned all 16 skills before the build (`.review/science-4-5-plan.md`):
  page kind, honest quantities, picture, problem types, exam coverage, engine needs.
- Three ideas had no figure: the path of light to the eye, particles too small to see, and
  down as toward Earth's center (with day and night). → Explore figures `lightPath`,
  `particles` and `earth`, their scene fields, and fit checks in `layouts.test.ts`.
- Word units that must not convert (liters on the water-share page, seconds on a stopwatch
  page) are fixed labels; the units test lists them.
- Observe columns can be times with a.m. and p.m.: the label check allows that period.
- Skip counts draw whole steps only, so a decimal pull per washer uses a table instead.

## No letters before Grade 6 (after the Grade 5 review)

- Grades 3–5 showed letters as labels ("Rows (r): 3"), rules in letters under the number
  sentence ("l × w = A") and lines like "A = 4 × 3", though variables are introduced in Grade
  6 (6.EE.2). → K–5 name every value in words: the formula box reads the rule in words
  ("Length × width = area", `namedVariables`), the walkthrough writes "Area = 4 × 3" and
  "Area = 12 cm²", the input rows drop the symbol column, pictures use `rep.words` for
  names and captions, and `standards.test.ts` fails a letter standing for a number in any
  grade below 6 (a unit's abbreviation after its name, "grams (g)", is allowed).

## Grade 5 (Section 2, first review)

- Step text used skip-count lines ("Count by 4s, 8 times") for facts a Grade 5 student
  knows. → Grade 5 modules give no work lines for a fact; the substituted line is the work.
- The decimal grid left a place blank ("0 . _ 5" for 0.05). → Every empty place after the
  point is a 0; the harness checks it.
- A number taken from itself got a column grid (1,978 − 1,978). → No grid when the two are equal.
- The common denominator was the product of the denominators (144 parts for twelfths and
  twelfths). → The least common multiple, with the multiples counted in a work line; the
  harness reads "smallest common multiple of 4 and 6".
- A product of fractions was left unsimplified (6/12). → A note gives the simplest form.
- A whole-number volume lesson's base area was named "cubes in one layer" with a square unit.
  → "Base area".
- Pictures (page reviewer): the place-value chart wrapped past five columns (tight cells);
  point labels sat on a rising line (label on the free side); fraction bars past 24 parts
  merged into a band (unlined parts, one outline); tables show values to the variable's step.
- A slider the other values hold to one value looked movable. → Dimmed and marked disabled;
  the sweep accepts it.
- Open: exponents show a caret (10^2) everywhere; no superscript rendering yet.

## Grade 5 build (Section 2, while writing)

- The written-work grids stopped at Grade 4's layouts. → `columnMultiply(a, b, true)` sets
  out one row per digit of the second factor (the standard algorithm) and `autoWritten` uses
  it from Grade 5; `decimalColumns` lines up the points for decimal sums and differences.
- Fraction bars could only caption a comparison. → `caption` on the picture, for a sum or a
  sharing ("{p}/{m} + {q}/{m} = {s}/{m}").
- A whole-number volume lesson offered liters for its cubic centimeters, and mm, km, yd and
  mi had no cubic unit. → Cubic units for every length in the registry; `unitChoices` with
  the module's variables offers only squares and cubes of lengths for a length lesson's
  areas and volumes.
- The unit-cubes caption counted the clipped drawing, not the box. → It counts the real box.
- "zeros in 1,000" is a phrase the harness reads (the exponent).

## Written work (before Grade 5)

- The steps read as prose lines ("6 × 100 = 600, so 100 groups fit: 743 − 600 = 143") where a
  student writes columns and a bracket, and Grade 6+ jumped from the substituted line to the
  answer (`c = √(3² + 4²)`, then `c = 5 cm`). → `written.ts`: column addition and subtraction
  with carries and regrouping marks, partial products with the fact beside each row, the
  long-division bracket with each product taken away and the next digit brought down;
  `autoWritten` picks one by grade for a plain arithmetic line, a step can name or refuse one.
  `simplify.ts`: one line per stage of the order of operations under a substituted formula
  (brackets, roots and exponents first). `WrittenWork.tsx` draws a grid; the dump boxes it;
  the harness checks the equation each grid says and its answer. Grades 3–5 drop running
  totals a column sum already shows.
- The long-division page's partial-quotient chunks were the only "written" layout, and were
  data in the module. → The page names the bracket (`written: longDivision`), and its work lines
  read the quotient's places and the remainder.

## Repository layout (before Grade 5)

- Module data was in ten files named by section and review round (`math-k2-extra.ts`,
  `math-3-more.ts` …), and a problem type's "use" line lived in a separate map. → One file
  per subject and grade (`math/4.ts`, `science/2.ts`), the skill's main page followed by its
  problem types, `use` on the module, K–2 helpers in `helpers.ts`, the few helpers two grade
  files share in `shared/`, pilots for unbuilt grades in `pilots.ts`. `pnpm new-module`
  scaffolds a module in the right file; `CLAUDE.md` maps the repository and the commands.
- The sampling harness was one 1,800-line test. → Its three libraries (`harness/evaluate.ts`
  for the phrases step text uses, `harness/pictures.ts` for the check per picture kind,
  `harness/search.ts` for the brute-force search) are the files a module writer touches.
- Every picture registered sliders, so pages with their own handles or taps carried a second
  set of controls. → `sliderPolicy.ts`: sliders only for kinds where sweeping teaches and the
  picture has no touch control of its own; `sliders` on a module overrides; `pnpm docs:sliders`
  writes `docs/SLIDERS.md`.

## Picture kinds built ahead (before Grade 5 and Sections 3–8)

Eleven diagram kinds written before the lessons that need them, each with its spec, harness
check and test coverage: double number line, coordinate plane (point, second point, line and
rise/run), box plot, pie chart, fraction × fraction area, unit cubes in layers, place-value
chart, factor tree, protractor, wave, Punnett square. Three are on Grade 4 pages now (factor
tree, double number line, protractor); the rest live in a picture gallery (`/gallery`, one
demo module per kind in `gallery.ts`) that the module tests, the harness, the shots script
and the slider test all cover, so a kind is reviewed before its first lesson. Lessons from
building them: a kind whose variables don't connect through a formula (a wave's amplitude
beside speed = frequency × wavelength) makes the demo two lessons, so the amplitude is
optional on the picture; a phrase in the harness ("prime factors of") must come before a
shorter phrase it contains ("factors of"); a product with a zero factor (a Punnett parent
with no dominant allele) is determined but not solvable pairwise, so parents take `allowed`
values.

## Slider sweep (all sections)

`scripts/test-sliders.mjs` drove all 235 sliders on the 110 module pages that have them
(tap the top, tap the bottom, drag to the middle, three taps down the track; read the value
under the slider and the input box). What it found and what the engine now does:

- A slider tap whose value didn't fit with the values it holds still (start 10 with 30 to
  take away; a start of 1,000 with four jumps of 10; a product no top and bottom can make)
  was rejected by the solver, and the rejection dropped the slider's own old value: the box
  went blank with a message far below the picture. Seven pages, both directions. →
  `Calculator.set` treats a picture update as one move: if the newest value is rejected, or
  a value it holds still would be cleared, nothing changes and the reason shows under the
  box. With `slide` (every slider), the value walks back toward where it was one step at a
  time and stops at the last value that fits, so a slider goes as far as the other values
  allow instead of sticking. The harness's model (`setValues`, newest wins, an invalid
  typed value drops the old one) is unchanged: typing keeps its text in the box.
- A slider's track ran over the variable's whole range, so a finger at the top of "Start"
  (20 to add, 100 the most in all) got 95 and watched the knob spring back: the value it
  showed was not the value it kept. → Each slider's track covers only the values that fit
  with the others held still (`Calculator.fits`, probed by halving from the current value
  toward each end, on the variable's own steps), so the knob stays under the finger.
- On a phone a slider moved one step and then snapped back to (or near) its old value: the
  page's scroll lock turned `scrollEnabled` off on the first move, and changing a scroll
  container mid-gesture cancels the touch on iOS. → The lock is gone. On the web the track
  and the handles carry `touch-action: none`, and on native they hold the responder and
  refuse to give it up, which is all that is needed to keep the page still.
- On the web a slider let go snapped back to (or near) its old value: after a touch that
  has moved, the browser's emulated mouse events on lift reach the responder system as a
  fresh press. → On the web, sliders and drag handles use pointer events with pointer
  capture (`pointerDrag.ts`); the responder props stay for native. The track's top is
  measured once at the press, so a page shift mid-drag can't move the value.
- A page whose whole is fixed (a full turn of 360°) had two part sliders that could never
  move: each pinned the other, so the whole always changed. → `angles.sliders` names the
  values that get sliders instead (parts of the turn, parts in the angle); the rays are not
  dragged there.
- Sliders' `accessibilityValue` never reached the DOM on web. → `aria-valuemin/max/now/text`
  are written too (screen readers and the sweep read them).
- Sweep lesson: a slider's range is the variable's, not what the other values allow; a check
  that a slider reaches its range's ends is wrong, a check that it moves and stops is right.

## Grade 4 (Section 2, first review)

One lesson-reviewer and one page-reviewer on 13 pages. What the engine now does:

- A relation of the form `h = 10t + u` with pairwise solves could not fill the tenths and the
  extra hundredths from the hundredths alone (the grid sets `h`), and `a = t + o` left the
  tens and ones blank from the factor alone. The harness's "determined but left unknown"
  check stayed quiet because only the digit ranges (0–9), not the formulas, pin the parts
  down. → Relations that solve the place part from the number alone (`t = tenths in h`,
  `t = tens of a`, `placePart()` in math-4-more.ts). Rule for writers: a value read off a
  number's digits gets its own relation from that number.
- Typing a prime above 12 was rejected ("No whole numbers fit"): the factor pair 1 × 13 was
  out of range. → Factors range to 100; the array draws at most `max` dots and its caption
  says "(the first 20 shown)"; the harness no longer flags a factor past the drawing.
- A product of two typed factors where the zero top (0 × any bottom) made the new top 0
  whatever the bottom: the search saw a determined value the solver could not reach. → Tops
  start at 1 on the equivalence page; a factor that can be 0 in a product needs its own
  thought before the range is written.
- The fraction line drew one run of jumps for a sum or a product, so 3/8 + 6/8 and 4 × 2/3
  looked like 9/8 and 8/3 typed in. → `fractionLine.parts` (addends: alternate shade, one
  label per run, the point drags the last addend) and `fractionLine.copies` (the runs
  alternate every copy).
- Only the first angle had a handle; the whole-angle label sat on the middle ray when the two
  parts were equal; a reflex whole went off the canvas. → A second handle on the outer ray
  moves the second angle; the label steps off the bisector; the vertex moves to the middle
  past 180°.
- Canvases sized for a square extent left blank bands under a wide rectangle and under the
  hundred grid. → Canvas heights come from the drawn figure (Rectangle, Grid100).
- Sort cards were words only, a memory test for the shape or the line pair. → `card.figure`
  on sort cards (`lines`, `letter`, `polygon` (open or closed), `circle`, `heart`), drawn by
  `SortLayout`.
- The rounded number and the two neighbours were typed, so a typed 853,520 sat beside a place
  of 100,000. → They are `derived` on the rounding page; the picture's `to` can be a variable.
- The Grade 3–5 value cap (8) counted read-only boxes, so a four-box area model (11 values,
  3 typed) failed the standard. → The cap counts values the student holds (not `derived`).
- Harness: check lines ending in ", so …" and "n ÷ d = q remainder r" now balance; phrases for
  full tenths, "the tens in", "N with the places under P made 0"; the shots script fails loudly
  when its section-header anchor is missing (it had measured from the page top for a whole
  section) and reports where each page's height goes.
- `Sliders`: a 120 px track when there are at most four (four 88 px sliders wrap on a phone, so widths stay);
  `Tape` labels at `chart.label`; `AreaModel` boxes get at least 36% of the width.

## Grade 4 build (Section 2, while writing)

- A remainder must be smaller than the divisor, but a relation with nothing to solve was
  root-found numerically (picked any divisor above the remainder). → `Relation.constraint`:
  a check-only rule the solver never works a value out of, only rejects with once every
  variable in it is known; `narrow` and the search skip it.
- A product could be found in one jump before its part products, so the area-model
  walkthrough started at the answer. → The lesson's `n = a × b` relation solves only the
  factors (`n: () => undefined`); the product comes from the parts.
- The harness retyped a derived value ("same" edits) and read new phrases. → Derived values
  are left out of retype edits; phrases for factor counts, whole groups, leftovers and
  "q remainder r".

## K–3 math and science (Sections 1, 2 and 6, second review)

Four reviewers (lesson and page, math and science) on 173 pages. What the engine now does:

- Lessons whose idea is a sort, a sequence, an idea with no honest quantity, or a quantity over
  time were forced into a calculator (22 pages named across both subjects). → Four layouts
  built: `sort`, `sequence`, `explore`, `observe` (`src/data/modules/layouts/`, components in
  `src/components/module/layouts/`), all content in data; a page is either a calculator module
  or a layout page (`getPage`). `layouts.test.ts` checks each one belongs to a skill, fits
  together and reads at the grade level; the dump prints layout pages for the lesson reviewer.
- Ranges admitted values the lesson forbids (count by 7s, 7¢ coins, thirds on the halves page,
  1 or 3 right angles) and the harness solved from working values nobody types (the ones with
  the ten, an estimate's parts, a prism's faces). → `VariableDef.allowed` (the solver rejects
  the rest, sliders snap to the nearest, the harness samples them and tests a value between)
  and `VariableDef.derived` (a read-only box; the harness, the dump and the combination test
  never start from it).
- Known facts within 10 × 10 were broken apart (8 × 3 = 5 × 3 + 3 × 3); division past ten
  counts listed fifteen terms. → `timesWork` counts by for times ≤ 10; `divideWork` uses the
  fact past ten counts.
- The count-on helper silently started from the second addend. → `addStrategy` says it
  ("Start with the bigger number, 9." within 20; "Start with the bigger number: 57 + 43." to
  100).
- Compare lines skipped the places that tie; K compare pages gave the difference before
  saying which is more. → `compareLine` names ties first ("Hundreds: 3 = 3. Tens: 4 < 7, so
  347 < 374"); `difference()` takes `compareWords` and says "7 is more than 4" before counting
  on; K–2 drops the bare subtraction line when a compare line leads.
- The same line appeared in two steps (the expanded form for tens and ones; pairing lines on
  even/odd), and a bare "35 + 20" preceded "35 + 20 = 55". → `buildSteps` shows a line once
  per walkthrough and drops a bare line the first work line repeats, a K–2 three-term line,
  and (Grades 3–5 too) a wordy line the work lines replace; the harness fails a line shown in
  two steps.
- Comparison notes said the obvious ("the warmest month is warmer"). → `apart()` drops its
  parenthetical when a name contains the comparing word's stem, and takes a replacement.
- `moreThan` was called with the wrong grade mode; three Grade 2 pages counted by ones. →
  Still by hand (a flag), now with a custom difference line; still open: derive the mode from
  the module id.
- A false assumption said the numbers shrink in inches (whole-number lengths keep their
  number); K names used letters ("Pencil A"). → `standards.test.ts` fails an assumption that
  mentions the units menu and a K–2 name with a lone capital letter.
- A hundred chart's marks could run past the chart. → `modules.test.ts` requires every mark's
  range to fit the chart. Bars and rulers grow to fit and stay as they are.
- Base-ten pictures drew the number's digits, not the typed tens and ones, on regroup pages.
  → `baseTen.places` draws the counts, each full ten of cubes boxed.
- A refused number vanished from its box; thermometers had a slider row that repeated the
  tube; ten-frame legends repeated the slider names; picture-graph icons were 32 px; a K hop
  said "−2"; captions joined with "·" ran on; five sliders wrapped. → All fixed in the page
  components (commit "science lesson fixes and page fixes").
- Reviewers judged one-screen fit, slider truncation and tap targets by hand. →
  `review-shots.mjs` measures the span from the picture header to the first input row (flag
  over 844 px at 390 wide), flags slider text cut short and picture tap targets under 36 px,
  and prints each page's controls; `review-evidence.mjs` adds a per-page picture-kind and
  controls index and contact sheets (one page per picture kind, 9 per sheet). The dump prints
  every other value as the unknown and two boundary samples per module.

Findings recorded but not acted on, with the reason: keeping the example's other values faded
when the first box is typed (the example leaves by design, and the science page reviewer found
that clear); `m.K.count-100` starting only on a ten (tapping any chart number and counting on
by tens is in the K curricula we map); capping the Grade 1 compare difference at 20 (the
count-up shows the tens jump); one relation for elapsed time setting hour and minutes
together (the two-relation model keeps every unknown solvable); a table picture for
arithmetic patterns and a second rectangle on the same-perimeter page (picture work for the
next section); merging money change/more-needed, the four two-step pages and the two compare
pages (each keeps a distinct use line); sharing the fractions helper with the quarter-inch
page.

## Science K–3 (Section 6, first review)

- Two comparison helpers wrote "The today is warmer" and "the long-beaked birds is more": names
  were pasted into a sentence template with no grammar check. → The comparison helpers now live
  in `helpers.ts` with the sentence shapes in one place; the standards test's sentence checks
  run over their output. Still open: a check that a name used as a sentence subject is
  singular.
- Grade 1 equal groups were explained with skip counting and sharing (Grade 2 methods). → The
  `groupsOf` helper has a K–1 mode that adds one group at a time; sections choose the mode.
- The check line skipped plural agreement ("1 pushes of 1 spaces"). → Check lines go through
  `agree()` like every other line.
- Comparison pages drew the two amounts but not the difference. → Pictures that don't draw a
  value list it in `pictureLabels`; the harness flags a value neither drawn nor labeled.
- Table headers showed bare letters in Grade 3. → `ValueTable` headers use the grade's label
  form.
- Thermometers: a "?" reading started at 1 °F; the 32 °F freezing mark was missing. → Sliders
  start beside the other reading; thermometers take `marks`.
- The main lesson was sometimes a side quantity, with the standard's investigation as a
  problem type. → No engine change; a lesson-reviewer check ("L. Layout fit") now asks whether
  the calculator layout is how the lesson is taught, with a catalog to propose from.
- Reviewer time went to writing dump and browser scripts. → `scripts/review-evidence.mjs` and
  `dump.review.test.ts` produce the evidence with no model involved.
- The science files each carried their own copies of sum, groups, comparison and times
  helpers. → Moved to `src/data/modules/helpers.ts`, shared by every section from here on.
