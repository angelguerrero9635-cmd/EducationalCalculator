# Direction plan: science grade 9 (biology, 13 skills, 62 pages)

## Decisions

- **Notation.** Grades 9–12 use standard notation: symbols with subscripts (N₀, p², 2pq), exponents,
  ⌈ ⌉ only in the step text the harness already reads ("the codon holding base {p}"). Sentences at
  most 35 words; a page holds at most 10 values (the photosynthesis page uses exactly 10).
- **Rows, not equation templates.** `docs/EQUATION_INPUTS.md` keeps biology as rows; every
  calculator here has named quantities (births, alleles, bases), so no `equation` field.
- **Units.** `unitSystems: ['metric']` everywhere. Counts are whole and carry no unit (particles,
  codons, offspring). Fixed labels: `%`, `bp`, `g/mol` (not in the registry), `days`, `per day`,
  `min`, `mg/dL`, `kcal` (the Grade 7 `energy` helper). No value converts units.
- **Layouts.** 38 of the 62 pages are layouts (24 calculators). The honest calculators are the ones with a counting
  or rate model textbooks and tests compute: diffusion and pump counts, molecule and atom counts,
  chromosome counts, Punnett boxes, codons, Chargaff, PCR, gels, Hardy–Weinberg, population growth,
  trophic efficiency, Simpson's index, antibody peaks, herd immunity. Everything else (stages,
  classification, feedback, pathogen types) is a sort, sequence, explore or observe.
- **Main pages that are layouts:** biomolecules, cellular energy, mitosis–meiosis, classification
  and homeostasis. The skill id is the layout; its calculators are problem types.
- **Pilots.** None exist for `s.9.` (checked `pilots.ts`); every page is BUILD. Start each drawn
  page with `node scripts/promote-demo.mjs <demo> <id>`.
- **Refresh links** follow the brief's prerequisites; the Grade 7 Punnett, energy-pyramid and
  natural-selection pages stay the refreshers, and Grade 9 pages don't repeat their one-gene or
  10% arithmetic as a new page.
- **Order in the grade file** is taxonomy order; within a skill, main page first.

### 1. s.9.biomolecules — The chemistry of life: water and biomolecules

- **Standard:** HS-LS1-6 (sugars rebuilt into other carbon-based molecules); HS-LS1-1 (protein structure).
- **Textbooks:** OpenStax Biology 2e ch. 2 (water, carbon), ch. 3 (macromolecules); Glencoe HS 10.23; HMH Dimensions 2 (Carbon-Based Molecules); Miller & Levine 1.
- **Tests ask:**

  | Question                                             | Page                                                               | Mark                              |
  | ---------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------- |
  | NAEP-2019-12S7-#15 (protein subunit)                 | ~classes                                                           | Solves                            |
  | MCAS-2026-HSBIO-#32 (antibodies are made of)         | ~classes (card "Antibody" → Proteins)                              | Solves                            |
  | NAEP-2019-12S7-#2 (CO₂ carbon into carbohydrate)     | s.9.cellular-energy main                                           | Solves (filed here; see data)     |
  | MCAS-2026-HSBIO-#5 (cycads, soil nitrogen, proteins) | s.9.ecosystem-dynamics~nitrogen + main scene "amino acids carry N" | Partly (graph reading not taught) |
  | common: bonds and water in a polymer of n units      | ~dehydration                                                       | Solves                            |
  | common: which property of water explains …           | ~water                                                             | Solves                            |

- **Main — BUILD `s.9.biomolecules` (explore):** figure `macromolecules` from demo
  `g.s9-biomolecules-polymers`. Scenes (5): "Carbohydrates" `macro: { kind: 'carbohydrate', count: 2 }`
  ("Two glucose join into maltose; one water leaves."); "Starch" `{ kind: 'carbohydrate', count: 4 }`;
  "Proteins" `{ kind: 'protein', count: 4 }` (amino acids join by peptide bonds; each carries an amine
  group, so proteins hold nitrogen; the chain folds into its shape); "Nucleic acids" `{ kind:
'nucleicAcid', count: 3 }`; "Fats" `{ kind: 'lipid' }` (glycerol + 3 fatty acids, 3 ester bonds);
  "Digestion" `{ kind: 'protein', count: 3, split: true }` (hydrolysis adds water back). Assumptions:
  monomers join by dehydration synthesis, one water per bond; hydrolysis reverses it; fats are not
  true polymers (always 3 fatty acids).
- **~classes — BUILD (sort):** "Which class of biomolecule is it?" Bins: Carbohydrates, Lipids,
  Proteins, Nucleic acids. Cards: glucose, starch, cellulose, glycogen → Carbohydrates; fatty acid,
  triglyceride (fat), phospholipid, cholesterol → Lipids; amino acid, enzyme (amylase), antibody,
  hemoglobin → Proteins; nucleotide, DNA, RNA → Nucleic acids. One right bin each.
- **~dehydration — BUILD (calculator):** "How many water molecules leave, and what is the polymer's
  mass?" Values: n monomers (2–1,000, whole), b bonds (derived), w water released (derived), m
  monomer mass (g/mol, 50–1,000; glucose 180, glycine 75), M polymer mass (g/mol, derived). Relations:
  b = n − 1; w = b; M = n × m − 18 × w. Assumptions: every bond releases one H₂O (18 g/mol); a chain,
  not a ring; a fat is the exception (3 water). Example: n = 3 glucose, m = 180 → b = 2, w = 2,
  M = 540 − 36 = 504 g/mol (check: 2 glucose → 342 = maltose). startWith ['n', 'm']. Picture:
  `macromolecules` as a calculator picture (Engine need 1); until then no picture, so build after it.
- **~water — BUILD (sort):** "Which property of water explains it?" Bins: Cohesion (surface
  tension), High specific heat, Good solvent, Ice floats. Cards: an insect stands on a pond; water
  beads into round drops on a leaf → Cohesion; a lake warms slowly in spring; seaside towns have
  milder winters than inland towns → High specific heat; salt disappears when stirred into water;
  blood carries dissolved glucose → Good solvent; ponds freeze from the top down; fish live all
  winter under lake ice → Ice floats. Header sentence: water is polar, and hydrogen bonds cause all four.
- **Verdict:** 4 pages (explore, 2 sorts, 1 calculator); 4 of 4 released items Solves or Partly here or on the page they belong to.

### 2. s.9.membrane-transport — Cell membranes and transport: diffusion, osmosis and active transport

- **Standard:** HS-LS1-2, HS-LS1-3.
- **Textbooks:** OpenStax Biology 2e ch. 5 (5.2 passive, 5.3 active, 5.4 bulk) and 41.1 (osmoregulation).
- **Tests ask:**

  | Question                                                               | Page             | Mark   |
  | ---------------------------------------------------------------------- | ---------------- | ------ |
  | MCAS-2026-HSBIO-#28 (onion cells in salt water lose water, by osmosis) | ~tonicity        | Solves |
  | common: which way does O₂ diffuse, and when does it stop               | main             | Solves |
  | common: passive or active, needs a protein or not                      | ~transport-types | Solves |
  | common: how many Na⁺ and K⁺ per ATP                                    | ~pump            | Solves |

- **Main — BUILD `s.9.membrane-transport` (calculator):** picture `membrane` from demo
  `g.s9-membrane-transport-diffusion`: `{ kind: 'membrane', outside: 'o', inside: 'i', transport:
'diffusion', particle: 'O₂', moved: 'm', gradient: 'd' }`. Values: o O₂ outside (0–40), i O₂
  inside (0–40), d difference outside − inside (derived, −40–40), m moved in now (0–12), o₂ outside
  after (derived), i₂ inside after (derived). Relations: d = o − i; o₂ = o − m; i₂ = i + m. Page
  limits (not relations): m ≤ o; m ≤ d ÷ 2 (net movement stops at equal counts). Assumptions: particles
  move both ways at random, so the net flow runs from more to fewer; small nonpolar molecules (O₂, CO₂)
  pass the bilayer without a protein and without ATP; at equal counts movement goes on but the net
  is zero. Example: o = 20, i = 8 → d = 12; m = 6 → o₂ = 14, i₂ = 14 (equilibrium). startWith ['o', 'i', 'm'].
- **~pump — BUILD (calculator):** picture `membrane` from `g.s9-membrane-transport-pump`:
  `{ transport: 'active', particle: 'Na⁺', outside: 'o', inside: 'i', moved: 's', atp: 'a' }`.
  Values: o Na⁺ outside (0–40), i Na⁺ inside (0–40), c pump cycles (1–4), s Na⁺ moved out (derived),
  k K⁺ moved in (derived), a ATP used (derived), o₂, i₂ after (derived). Relations: s = 3c; k = 2c;
  a = c; o₂ = o + s; i₂ = i − s. Limits: s ≤ i; o₂ ≤ 40. Assumptions: the sodium–potassium pump moves
  3 Na⁺ out and 2 K⁺ in for each ATP; it moves ions from fewer to more, so it needs energy. Example:
  o = 20, i = 8, c = 2 → s = 6, k = 4, a = 2, o₂ = 26, i₂ = 2. startWith ['o', 'i', 'c'].
- **~transport-types — BUILD (sort):** bins Simple diffusion, Facilitated diffusion, Osmosis, Active
  transport, Bulk transport. Cards: O₂ enters a lung cell; CO₂ leaves a muscle cell → Simple;
  glucose enters a red blood cell through a carrier protein; K⁺ leaves through an open channel,
  high to low → Facilitated; water enters a root cell through aquaporins → Osmosis; the Na⁺/K⁺ pump
  spends ATP; root cells take in minerals from soil that has fewer of them → Active; a white blood
  cell engulfs a bacterium; a gland cell releases insulin in vesicles → Bulk.
- **~tonicity — BUILD (sort):** from `g.s9-membrane-transport-tonicity`. Bins: Hypotonic water
  (water moves in), Isotonic water (no net flow), Hypertonic water (water moves out). Cards: the six
  icons (`red blood cell in …`, `plant cell in …` × 3) plus text: wilted lettuce in fresh water turns
  crisp → Hypotonic; red blood cells in 0.9% saline → Isotonic; celery in salty water goes limp;
  red onion skin in salt water shrinks from its wall → Hypertonic.
- **Verdict:** 4 pages (2 calculators, 2 sorts); the one released item Solves.

### 3. s.9.cellular-energy — Cellular energy: ATP, photosynthesis and cellular respiration

- **Standard:** HS-LS1-5, HS-LS1-7, HS-LS2-3, HS-LS2-5.
- **Textbooks:** OpenStax Biology 2e ch. 6 (6.4 ATP, 6.5 enzymes), ch. 7, ch. 8, 22.3; HMH Dimensions 3.1–3.2; Miller & Levine 2.
- **Tests ask** (no released items filed; common types plus the misfiled NAEP item):

  | Question                                                | Page                       | Mark   |
  | ------------------------------------------------------- | -------------------------- | ------ |
  | NAEP-2019-12S7-#2 (carbon from CO₂ into carbohydrate)   | main, scene "Calvin cycle" | Solves |
  | common: molecules of CO₂ for n glucose; atoms conserved | ~equation                  | Solves |
  | common: where each stage happens, which makes most ATP  | ~stages, main              | Solves |
  | common: fermentation vs respiration vs photosynthesis   | ~processes                 | Solves |
  | common: enzyme activity against temperature             | ~enzymes                   | Solves |

- **Main — BUILD `s.9.cellular-energy` (explore):** figure `organelleEnergy` from
  `g.s9-cellular-energy-organelles`. Scenes (8): "The cycle" `energy: {}`; "Photosynthesis"
  `{ process: 'photosynthesis' }`; "Light reactions" `{ process: 'lightReactions', lit: 'light' }`
  (thylakoids split water, release O₂, make ATP and NADPH); "Calvin cycle" `{ process: 'calvinCycle',
lit: 'CO₂' }` (carbon from CO₂ is fixed into sugar); "Respiration" `{ process: 'respiration' }`;
  "Glycolysis" `{ process: 'glycolysis', lit: 'glucose' }` (cytoplasm, no O₂ needed, 2 ATP);
  "Krebs cycle" `{ process: 'krebsCycle', lit: 'CO₂' }`; "Electron transport" `{ process:
'electronTransport', lit: 'O₂' }` (O₂ takes the electrons; most ATP made here). Assumptions: ATP
  carries energy the cell spends; textbooks give 30 to 38 ATP per glucose, so no single total is stated.
- **~equation — BUILD (calculator):** picture `reaction` (Grade 7 kind): reactants CO₂ 'c', H₂O
  'w'; products C₆H₁₂O₆ 'g', O₂ 'o'; `atoms: { C: ['C1','C2'], H: ['H1','H2'], O: ['O1','O2'] }`.
  Values (10): g glucose (1–3), c, w, o (derived), C, H, O atoms on each side (derived). Relations:
  c = 6g; w = 6g; o = 6g; C1 = c, C2 = 6g; H1 = 2w, H2 = 12g; O1 = 2c + w, O2 = 6g + 2o. Assumptions:
  respiration is the same equation read backwards; atoms are rearranged, never made or lost. Example:
  g = 1 → c = w = o = 6; C 6 = 6, H 12 = 12, O 18 = 18. startWith ['g']. Range 1–3 until the picture
  is checked with 18 molecules a formula (Engine need 9).
- **~stages — BUILD (sequence):** "Put the stages of cellular respiration in order." Stages: Glycolysis
  splits glucose into 2 pyruvate in the cytoplasm → Pyruvate enters the mitochondrion and gives off CO₂
  → The Krebs cycle gives off CO₂ and loads NADH → The electron transport chain uses O₂ and makes most
  of the ATP. No spans.
- **~processes — BUILD (sort):** bins Photosynthesis, Aerobic respiration, Fermentation. Cards: uses
  light energy; gives off O₂; happens in chloroplasts → Photosynthesis; happens in mitochondria;
  uses O₂ to release the most ATP → Aerobic respiration; yeast makes bread dough rise with no O₂;
  sprinting muscles make lactic acid; makes only 2 ATP per glucose, with no O₂ → Fermentation.
  (No "gives off CO₂" card: two bins would fit.)
- **~enzymes — BUILD (observe):** "Enzyme activity by temperature." Columns 10, 20, 30, 37, 45,
  55 °C; rowLabel "Reaction rate"; unit "% of the fastest"; max 100, step 5; initial [20, 45, 80,
  100, 60, 10]. Pattern: "Activity rises to a peak near {the tallest column} °C, then falls as heat
  changes the enzyme's shape (it denatures)." Assumptions: a human enzyme; enzymes lower activation
  energy and are not used up. Columns are temperatures, not times (Engine need 11).
- **Verdict:** 5 pages (explore, sequence, sort, observe, 1 calculator); all common types Solves.

### 4. s.9.mitosis-meiosis — The cell cycle, mitosis and meiosis

- **Standard:** HS-LS1-4, HS-LS3-2.
- **Textbooks:** OpenSciEd B.3; OpenStax Biology 2e ch. 10–11; HMH Dimensions 5, 7.1; Miller & Levine 3, 4.
- **Tests ask:**

  | Question                                                    | Page                            | Mark   |
  | ----------------------------------------------------------- | ------------------------------- | ------ |
  | NAEP-2000-12S11-#1 (sexual reproduction, more variation)    | ~compare                        | Solves |
  | NAEP-2009-12S10-#2 (offspring vary from parents)            | ~compare                        | Solves |
  | MCAS-2026-HSBIO-#2 (final products of meiosis)              | ~meiosis (telophase II card)    | Solves |
  | MCAS-2026-HSBIO-#18 (crossing over: meiosis, variation)     | ~meiosis (prophase I), ~compare | Solves |
  | MCAS-2026-HSBIO-#22 (the false sentence: gametes identical) | ~compare                        | Solves |
  | MCAS-2026-HSBIO-#24 Part B (replicate before mitosis)       | ~cell-cycle                     | Solves |
  | MCAS-2026-HSBIO-#39 (event in interphase)                   | ~cell-cycle                     | Solves |
  | common: 2n = 46, how many in a gamete, how many chromatids  | ~chromosome-count               | Solves |

- **Main — BUILD `s.9.mitosis-meiosis` (sequence):** from `g.s9-mitosis-meiosis-mitosis`. "Put the
  stages of mitosis in order." Stages with `cellDivision` figures, diploid 4: Interphase, Prophase,
  Metaphase, Anaphase, Telophase, Cytokinesis. No spans. Assumptions: DNA is copied in interphase, so
  each chromosome enters mitosis as two sister chromatids; the two daughter cells match the parent.
- **~cell-cycle — BUILD (sequence):** stages G1 (cell grows, 11 h), S (DNA replicated, 8 h), G2
  (checks the copies, 4 h), M (mitosis and cytokinesis, 1 h); unit "hours", totalLabel "One cycle of a
  dividing human cell" = 24 h. Assumption: times are typical for a human cell in culture and vary by cell.
- **~meiosis — BUILD (sequence):** from `g.s9-mitosis-meiosis-meiosis`. Stages, diploid 4:
  Interphase, Prophase I, Metaphase I, Anaphase I, Telophase I, Prophase II, Metaphase II,
  Anaphase II, Telophase II. Assumptions: homologs pair and cross over in prophase I; anaphase I
  separates homologs, anaphase II separates sisters; four haploid cells, all different.
- **~compare — BUILD (sort):** bins Mitosis, Meiosis, Both. Cards: makes 2 identical cells; body
  growth and wound repair; daughter cells are diploid → Mitosis; makes 4 cells with half the
  chromosomes; homologous chromosomes pair and cross over; makes eggs and sperm; two divisions in a
  row; gametes differ from one another → Meiosis; DNA is copied beforehand; sister chromatids separate
  (`cellDivision` anaphase card) → Both. Figures: `cellDivision` prophase I on the crossing-over card.
- **~chromosome-count — BUILD (calculator):** values: D chromosomes in a body cell, 2n (2–100,
  multipleOf 2; human 46, fruit fly 8), n in a gamete (derived), X chromatids at metaphase (derived),
  Z chromosomes in a zygote (derived), C chromosome combinations in gametes (derived, 2ⁿ, no crossing
  over). Relations: n = D ÷ 2; X = 2D; Z = n + n; C = 2ⁿ. Example: D = 8 → n = 4, X = 16, Z = 8,
  C = 16; human D = 46 → C = 2²³ = 8,388,608. startWith ['D']. Picture: `cellDivision` driven by a
  value (Engine need 3); until then allowed [2, 4, 6] would hide the human case, so wait for it.
- **Verdict:** 5 pages (3 sequences, 1 sort, 1 calculator); 7 of 7 released items Solves.

### 5. s.9.inheritance-patterns — Mendelian and non-Mendelian inheritance

- **Standard:** HS-LS3-2, HS-LS3-3.
- **Textbooks:** OpenSciEd B.3; OpenStax Biology 2e ch. 12–13; HMH Dimensions 7.2–7.3; Miller & Levine 4, 7.
- **Tests ask:**

  | Question                                                             | Page                                  | Mark                                                                         |
  | -------------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------- |
  | NAEP-2019-12S7-#10 (parents of 25/50/25 children: Ff × Ff)           | ~genotype-ratio                       | Solves                                                                       |
  | NAEP-2019-12S7-#9 (group 2 is Ff)                                    | ~genotype-ratio                       | Solves                                                                       |
  | MCAS-2026-HSBIO-#9 (EE × ee, chance of dark brown)                   | ~genotype-ratio (a = 2, c = 0 → 0 ff) | Solves                                                                       |
  | MCAS-2026-HSBIO-#13 (two normal parents, some king cubs → recessive) | ~genotype-ratio                       | Partly (the page shows the cross; inferring the pattern is a reasoning step) |
  | MCAS-2026-HSBIO-#33 (two genotypes, same blood type)                 | ~blood-types                          | Solves                                                                       |
  | MCAS-2026-HSBIO-#18 (crossing over)                                  | s.9.mitosis-meiosis~meiosis           | Solves (duplicate filing)                                                    |
  | common: dihybrid 9:3:3:1, test cross 1:1:1:1                         | main                                  | Solves                                                                       |
  | common: carrier mother, chance of an affected son                    | ~x-linked                             | Solves                                                                       |

- **Main — BUILD `s.9.inheritance-patterns` (calculator, dihybrid):** picture `punnettSquare` from
  `g.s9-inheritance-patterns-dihybrid`: `{ first: 'a', second: 'c', letter: 'R', dominant: 'D',
recessive: 'N', inheritance: { pattern: 'dihybrid', firstB: 'b', secondB: 'e', letterB: 'Y', names:
['round yellow', 'round green', 'wrinkled yellow', 'wrinkled green'] } }`. Values (10): a, c first
  and second parent's R alleles (0–2); b, e their Y alleles (0–2); tR, tY boxes of 4 showing round,
  yellow (derived); D both dominant, F round green, S wrinkled yellow, N neither (boxes of 16, derived).
  Relations: tR = 4 − (2 − a)(2 − c); tY = 4 − (2 − b)(2 − e); D = tR × tY; F = tR × (4 − tY);
  S = (4 − tR) × tY; N = (4 − tR)(4 − tY). Assumptions: the two genes are on different chromosomes
  and sort independently; each box is 1/16; the product rule multiplies the one-gene chances. Example:
  RrYy × RrYy (1, 1, 1, 1) → tR = tY = 3; D = 9, F = 3, S = 3, N = 1. Test cross (1, 0, 1, 0) → 4, 4,
  4, 4. startWith ['a', 'c', 'b', 'e'].
- **~genotype-ratio — BUILD (calculator):** picture Grade 7 `punnettSquare` (no `inheritance`), letter
  F. Values: a, c parents' F alleles (0–2); N children (4–1,000, multipleOf 4); nFF, nFf, nff expected
  (derived). Relations: nFF = N × a × c ÷ 4; nFf = N × (a(2 − c) + c(2 − a)) ÷ 4; nff = N × (2 − a)(2 −
  c) ÷ 4. Assumption: expected counts are averages; real families vary. Example: a = c = 1, N = 100 →
  25, 50, 25. Use line: "Use this for “Two carriers (Ff) have 100 children in all. How many are
  expected to be Ff?”" startWith ['a', 'c', 'N'].
- **~incomplete — BUILD (calculator):** from `g.s9-inheritance-patterns-incomplete`:
  `inheritance: { pattern: 'incomplete', alleles: ['R', 'W'], names: ['red', 'pink', 'white'], middle:
'P' }`, letter C, flowers of snapdragons. Values: a, c parents' Cᴿ alleles (0–2); R red, P pink, W
  white boxes of 4 (derived). Relations: R = a × c; P = a(2 − c) + c(2 − a); W = (2 − a)(2 − c).
  Example: pink × pink → 1, 2, 1; red × white → 0, 4, 0. Assumption contrasts codominance (roan
  cattle, AB blood: both show, no blend) so no separate codominance page is needed.
- **~x-linked — BUILD (calculator):** from `g.s9-inheritance-patterns-x-linked`: `{ first: 'm',
second: 'f', letter: 'B', dominant: 't', recessive: 'r', inheritance: { pattern: 'xLinked', carriers:
'k' } }` (red–green color blindness). Values: m mother's Xᴮ (0–2), f father's Xᴮ (0–1), t boxes
  without the trait, r with it, k carrier daughters, s chance a son is affected (%) (all derived).
  Relations: r = (2 − m)(2 − f); t = 4 − r; k = (2 − m) × f + m × (1 − f); s = 50 × (2 − m). Example:
  m = 1, f = 1 → r = 1, t = 3, k = 1, s = 50%. m = 1, f = 0 → r = 2, k = 1. Assumptions: sons get their
  X from the mother; males have no carriers; daughters need two recessive alleles to show the trait.
- **~blood-types — BUILD (sort):** bins Type A, Type B, Type AB, Type O. Cards: IᴬIᴬ, Iᴬi → A; IᴮIᴮ,
  Iᴮi → B; IᴬIᴮ → AB; ii → O. Header sentence: three alleles; Iᴬ and Iᴮ are codominant, i is recessive.
- **~pedigree — BUILD (explore):** figure `pedigree` from `g.s9-inheritance-patterns-x-pedigree`
  (X-linked, carriers half-shaded). Scenes: read the symbols; find the carriers (`family.carriers`);
  show genotypes (`family.genotypes`); ask "Can an affected son have an unaffected mother?"
  (`family.ask`, a carrier mother lit).
- **Verdict:** 6 pages (4 calculators, 1 sort, 1 explore); 5 of 6 released items Solves, 1 Partly.

### 6. s.9.dna-protein-synthesis — DNA structure, replication and protein synthesis

- **Standard:** HS-LS1-1, HS-LS3-1.
- **Textbooks:** OpenSciEd B.3; OpenStax Biology 2e ch. 14 (14.2–14.3), ch. 15, 16.1; HMH Dimensions 6.1–6.2; Miller & Levine 5.
- **Tests ask:**

  | Question                                                 | Page                           | Mark                                        |
  | -------------------------------------------------------- | ------------------------------ | ------------------------------------------- |
  | NAEP-2019-12S7-#11 (mutation → defective protein)        | s.9.biotechnology main         | Solves                                      |
  | MCAS-2026-HSBIO-#24 Part A (complementary base pairing)  | ~replication                   | Solves                                      |
  | MCAS-2026-HSBIO-#39 (interphase)                         | s.9.mitosis-meiosis~cell-cycle | Solves (misfiled)                           |
  | common: 30% A, find G                                    | ~chargaff                      | Solves                                      |
  | common: mRNA of 300 bases, how many amino acids          | main                           | Partly until Engine need 2 (range 3–12 now) |
  | common: template → mRNA → amino acids with a codon table | main (picture)                 | Solves                                      |

- **Main — BUILD `s.9.dna-protein-synthesis` (calculator):** picture `dnaStrand` from
  `g.s9-dna-protein-synthesis-codons`: `{ sequence: 'TACCGGTTCATT', length: 'b', codons: 'c' }` →
  mRNA AUG GCC AAG UAA = Met–Ala–Lys–Stop. Values: b bases in the coding mRNA (3–12 now, 3–30,000
  after Engine need 2; multipleOf 3), c codons (derived), a amino acids (derived), p peptide bonds
  (derived). Relations: c = b ÷ 3; a = c − 1 (the last codon is a stop); p = a − 1. Assumptions: 3 bases
  make a codon; AUG starts and codes Met; a stop codon adds no amino acid; each peptide bond releases
  one water (link to biomolecules). Example: b = 12 → c = 4, a = 3, p = 2. startWith ['b'].
- **~chargaff — BUILD (calculator):** from `g.s9-dna-protein-synthesis-chargaff`: `{ percentA: 'A',
pairs: 10 }`. Values: A, T, G, C (% of bases); AT, GC pairs in 10 (derived); H hydrogen bonds in the
  10 pairs (derived). Relations: T = A; C = G; G = 50 − A; AT = (A + T) ÷ 10; GC = 10 − AT;
  H = 2 × AT + 3 × GC. Example: A = 30 → T = 30, G = C = 20; AT = 6, GC = 4, H = 24. A range 0–50;
  limit: A a multiple of 5 draws whole pairs (else the ladder fades, as drawn). startWith ['A'].
- **~replication — BUILD (sequence):** "Put the steps of DNA replication in order." Stages: helicase
  unzips the double helix at an origin → free nucleotides pair with each old strand, A with T and G
  with C → DNA polymerase joins the new nucleotides into a strand → two DNA molecules, each one old
  strand and one new (semiconservative). Figure: Engine need 6 (labels only now).
- **~protein-synthesis — BUILD (sequence):** stages: RNA polymerase copies a gene into mRNA in the
  nucleus → the mRNA leaves through a nuclear pore → a ribosome reads the mRNA from the start codon
  AUG → tRNAs bring amino acids that match each codon → peptide bonds link the amino acids → a stop
  codon releases the finished chain, which folds into a protein.
- **Verdict:** 4 pages (2 calculators, 2 sequences); both items filed here Solves (one on its home page).

### 7. s.9.biotechnology — Mutations, gene expression and biotechnology

- **Standard:** HS-LS3-1, HS-LS3-2; HS-LS1-1 (gene expression).
- **Textbooks:** OpenStax Biology 2e ch. 16 (gene expression), ch. 17; HMH Dimensions 6.3, 7.4–7.5; Miller & Levine 7.
- **Tests ask** (none released; common types):

  | Question                                                           | Page        | Mark                         |
  | ------------------------------------------------------------------ | ----------- | ---------------------------- |
  | NAEP-2019-12S7-#11 (mutation → defective protein; filed under DNA) | main        | Solves                       |
  | common: silent, missense or nonsense after a substitution          | main        | Solves                       |
  | common: why an insertion changes every amino acid after it         | ~frameshift | Solves                       |
  | common: fragment sizes from a cut, read a gel                      | ~gel        | Solves                       |
  | common: copies after n PCR cycles                                  | ~pcr        | Solves                       |
  | common: how gene expression is switched on or off                  | none        | No (Engine need 5, new page) |

- **Main — BUILD `s.9.biotechnology` (calculator, substitution):** picture `dnaStrand` from
  `g.s9-biotechnology-substitution`: `{ sequence: 'TACCGGTTCATT', mutation: { type: 'substitution',
at: 'p' } }`. Values: p base changed (1–12), k codon holding it (derived), j its place in the codon
  (derived, 1–3). Relation: p = 3(k − 1) + j (step text "the codon holding base {p}"). Assumptions: one
  base swapped changes at most one codon; the caption names the effect (silent, missense, nonsense);
  the default swap is the transition A↔G, C↔T. Example: p = 5 → k = 2, j = 2; template CGG → CAG, mRNA
  GCC → GUC, Ala → Val (missense). startWith ['p'].
- **~frameshift — BUILD (calculator):** from `g.s9-biotechnology-insertion` (`mutation: { type:
'insertion', at: 'p' }`). Values: L template bases (6–12, multipleOf 3), c codons (derived), p base
  where one is inserted (1–L), k codon holding it (derived), s codons read in a shifted frame (derived).
  Relations: c = L ÷ 3; k = ⌈p ÷ 3⌉ (the step phrase "the codon holding base {p}"); s = c − k + 1. Example: L = 12, p = 5 → c = 4, k = 2, s = 3.
  Assumption: a deletion shifts the frame the same way; inserting 3 bases keeps the frame.
- **~gel — BUILD (calculator):** from `g.s9-biotechnology-gel`: `{ lanes: [{ label: 'Uncut', bands:
['L'] }, { label: 'Cut', bands: ['a', 'b'] }], keep: ['L'] }`. Values: L uncut DNA (bp, 200–10,000),
  a, b fragments (bp, 100–9,900). Relation: L = a + b. Assumptions: DNA is negative and moves toward +;
  smaller fragments travel farther; the ladder's known sizes give the scale. Example: L = 5,000,
  a = 3,000 → b = 2,000. startWith ['L', 'a'].
- **~pcr — BUILD (calculator):** from `g.s9-biotechnology-pcr`: `{ pcr: { cycles: 'n', start: 'N0',
copies: 'N' } }`. Values: N₀ starting copies (1–1,000), n cycles (1–40), N copies (derived).
  Relation: N = N₀ × 2ⁿ. Assumptions: each cycle heats (95 °C), cools (55 °C), warms (72 °C) and
  doubles every double strand; real runs level off as primers run out. Example: N₀ = 2, n = 10 →
  N = 2,048; one copy after 30 cycles → 1,073,741,824. startWith ['N0', 'n'].
- **~tools — BUILD (sort):** bins PCR (copies DNA), Gel electrophoresis (sorts by size), Cutting DNA
  (restriction enzymes, CRISPR), Genetic engineering (moves a gene). Cards: millions of copies from
  one hair's DNA; heat, cool and warm again 30 times → PCR; shorter pieces travel farther toward +;
  a child's bands compared with each parent's → Gel; an enzyme cuts only at GAATTC; Cas9 led to a gene
  by a guide RNA → Cutting; bacteria given the human insulin gene; corn with a bacterial gene that
  kills caterpillars → Genetic engineering.
- **Verdict:** 5 pages (4 calculators, 1 sort); gene expression uncovered (Engine need 5).

### 8. s.9.evolution-evidence — Evidence for evolution, population genetics and speciation

- **Standard:** HS-LS4-1, HS-LS4-2, HS-LS4-3, HS-LS4-4, HS-LS4-5; HS-LS3-3.
- **Textbooks:** OpenSciEd B.4, B.5; OpenStax Biology 2e ch. 18–20; HMH Dimensions 8, 9; Miller & Levine 10.
- **Tests ask:**

  | Question                                                   | Page                                        | Mark                                                                                                                           |
  | ---------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
  | NAEP-2000-12S11-#8 (tree of vertebrate groups)             | ~common-ancestry                            | Partly: the keyed tree makes birds and mammals sisters; the page draws today's tree (mammals branch before reptiles and birds) |
  | NAEP-2000-12S11-#9 (not part of Darwin's theory)           | ~resistance (assumptions list the 4 points) | Solves                                                                                                                         |
  | NAEP-2005-12S13-#7 (long beak → nectar)                    | none                                        | No: adaptation of form is s.7.natural-selection                                                                                |
  | NAEP-2009-12S10-#10 (which forelimb is not homologous)     | ~homologous                                 | Solves                                                                                                                         |
  | NAEP-2009-12S10-#11 (mutations → gradual change, selected) | ~resistance                                 | Solves                                                                                                                         |
  | NAEP-2009-12S10-#6 (antibiotic-resistant bacteria)         | ~resistance                                 | Solves                                                                                                                         |
  | NAEP-2009-12S9-#5 (tree built from DNA sequences)          | ~common-ancestry                            | Solves                                                                                                                         |
  | NAEP-2009-12S9-#6 (most closely related species)           | ~common-ancestry                            | Solves                                                                                                                         |
  | NAEP-2019-12S7-#12 (whale ancestor walked on land)         | ~homologous (vestigial card)                | Partly (fossil reasoning)                                                                                                      |
  | NAEP-2019-12S7-#8 (antibiotic overuse)                     | ~resistance                                 | Solves                                                                                                                         |
  | common: 16% show the recessive trait, find carriers        | main                                        | Solves                                                                                                                         |

- **Main — BUILD `s.9.evolution-evidence` (calculator, Hardy–Weinberg):** picture `alleleFrequencies`
  from `g.s9-evolution-evidence-hardy-weinberg`: `{ p: 'p', q: 'q', genotypes: ['P2', 'H', 'Q2'],
keep: ['N'] }`. Values (9): p, q (0–1), P2 = p², H = 2pq, Q2 = q² (0–1), N people (2–1,000,000),
  nAA, nAa, naa (derived). Relations: p + q = 1; P2 = p²; H = 2pq; Q2 = q²; nAA = N × P2; nAa = N × H;
  naa = N × Q2. Assumptions: the five conditions hold (large population, random mating, no mutation, no
  migration, no selection); only aa can be seen, so start from q²; carriers are 2pq. Example: Q2 = 0.16
  → q = 0.4, p = 0.6, P2 = 0.36, H = 0.48; N = 500 → 180, 240, 80. startWith ['Q2', 'N'].
- **~allele-counts — BUILD (calculator):** from `g.s9-evolution-evidence-allele-counts`: `{ p: 'p', q:
'q', genotypes: [null, null, null], fixed: true }`. Values: nAA, nAa, naa (0–10,000), N (derived),
  A, a allele counts (derived), p, q (derived). Relations: N = nAA + nAa + naa; A = 2nAA + nAa; a =
  2naa + nAa; p = A ÷ 2N; q = a ÷ 2N. Example: 49, 42, 9 → N = 100, A = 140, a = 60, p = 0.7, q = 0.3.
  startWith ['nAA', 'nAa', 'naa'].
- **~homologous — BUILD (sort):** from `g.s9-evolution-evidence-limbs`. Bins: Homologous, Analogous,
  Vestigial. Cards: icons `human arm bones`, `bat wing bones`, `whale flipper bones`, `cat leg bones`
  → Homologous; `insect wing`; a shark's fin beside a dolphin's flipper → Analogous; a whale's small hip
  bones; the human tailbone → Vestigial.
- **~common-ancestry — BUILD (explore):** figure `cladogram` from `g.s9-evolution-evidence-cladogram`,
  tree ["Lamprey", ["Shark", ["Bony fish", ["Frog", ["Mouse", ["Lizard", "Bird"]]]]]], traits Jaws,
  Bony skeleton, Four limbs, Amniotic egg, Feathers. Scenes: each trait `lit`; "Closest relatives"
  `ring: ['Lizard', 'Bird']`; "Is 'reptiles' without birds a clade?" `ring: ['Lizard']` (no); "Trees
  from DNA": sequence differences place branches the same way.
- **~resistance — BUILD (sequence):** stages: bacteria vary, and a few carry a mutation for resistance
  → an antibiotic kills most of the susceptible bacteria → the resistant survivors divide and pass on the
  mutation → the next population is mostly resistant. Assumptions: Darwin's points (variation, heredity,
  more offspring than survive, differential survival); mutations are random, not caused by the need.
- **~speciation — BUILD (sequence):** one interbreeding population → a barrier splits it (a river,
  a mountain range) → mutations, selection and drift differ on each side → the groups can no longer
  interbreed: two species.
- **~mechanisms — BUILD (sort):** bins Keeps allele frequencies steady, Changes allele frequencies.
  Cards: a very large population; random mating; no mutation; no one moves in or out; every genotype
  survives equally → Steady; genetic drift in a small population; gene flow from migrants; natural
  selection; a new mutation; mates chosen by a trait → Changes.
- **Verdict:** 7 pages (2 calculators, 2 sorts, 2 sequences, 1 explore); 7 of 10 released items Solves, 2 Partly, 1 No (belongs to Grade 7).

### 9. s.9.classification — Classification and the diversity of life: domains, kingdoms and cladograms

- **Standard:** HS-LS4-1.
- **Textbooks:** OpenStax Biology 2e ch. 20–29 (20.1–20.2 phylogeny, 21 viruses, 22 prokaryotes, 23–29 diversity); HMH Dimensions 7, 10.
- **Tests ask** (none released; common types):

  | Question                                                      | Page                | Mark                          |
  | ------------------------------------------------------------- | ------------------- | ----------------------------- |
  | common: which traits do these groups share; build a cladogram | main                | Solves                        |
  | common: which domain or kingdom is it                         | ~domains, ~kingdoms | Solves                        |
  | common: order of the ranks, which rank is most specific       | ~ranks              | Solves                        |
  | common: dichotomous key                                       | none                | No (new page, Engine need 12) |

- **Main — BUILD `s.9.classification` (explore):** figure `cladogram` from
  `g.s9-classification-cladogram` (a different tree from evolution's: e.g. ["Sponge", ["Jellyfish",
  ["Earthworm", ["Insect", ["Fish", "Human"]]]]] with traits True tissues, Bilateral symmetry,
  Segmented body… checked at build so each trait is one clade). Scenes: each shared derived trait `lit`;
  "A clade" ring; "Not a clade" ring; "Reading the nodes: the last common ancestor sits at a branch point."
  Assumptions: branch order, not branch length, shows relationship; groups are named by shared derived traits.
- **~domains — BUILD (sort):** from `g.s9-classification-domains`. Bins: Bacteria, Archaea, Eukarya
  (domain icons on the bins). Cards: E. coli in the gut; streptococcus that causes strep throat;
  cyanobacteria in a pond → Bacteria; methane-making microbes in a cow's stomach; Halobacterium in a
  salt pond → Archaea; icons `kingdom Protista`, `kingdom Fungi`, `kingdom Plantae`, `kingdom Animalia`
  → Eukarya. Header: viruses are not placed in any domain.
- **~kingdoms — BUILD (sort):** bins Protists, Fungi, Plants, Animals. Cards: amoeba; paramecium;
  kelp → Protists; yeast; bread mold; mushroom → Fungi; moss; fern; pine → Plants; sponge; jellyfish;
  earthworm → Animals.
- **~ranks — BUILD (sequence):** "Order the ranks from broadest to most specific, for humans."
  Domain Eukarya → Kingdom Animalia → Phylum Chordata → Class Mammalia → Order Primates → Family
  Hominidae → Genus Homo → Species Homo sapiens. Assumption: the scientific name is genus + species, italic.
- **Verdict:** 4 pages (explore, 2 sorts, sequence); common types Solves except the dichotomous key.

### 10. s.9.population-ecology — Population growth and carrying capacity

- **Standard:** HS-LS2-1, HS-LS2-2.
- **Textbooks:** OpenSciEd B.1; OpenStax Biology 2e ch. 45 (45.1–45.4); HMH Dimensions 4.1, 10.1; Miller & Levine 15.
- **Tests ask:**

  | Question                                                   | Page                                | Mark                                      |
  | ---------------------------------------------------------- | ----------------------------------- | ----------------------------------------- |
  | NAEP-2005-12S14-#4 (plot two species by day)               | none                                | No (observe with two rows: Engine need 4) |
  | NAEP-2005-12S14-#5 (which species out-competes)            | ~limiting-factors                   | Partly                                    |
  | NAEP-2009-12S10-#4 (when growth is fastest)                | main (steepest near K/2), ~doubling | Solves                                    |
  | NAEP-2009-12S10-#5 (why the growth rate slows, then falls) | main, ~growth-phases                | Solves                                    |
  | NAEP-2019-12S7-#17 (succession order)                      | s.9.ecosystem-dynamics~succession   | Solves (misfiled)                         |
  | MCAS-2026-HSBIO-#14 (habitat loss → competition)           | ~limiting-factors                   | Solves                                    |
  | common: births, deaths, migration → new size and rate      | ~rates                              | Solves                                    |

- **Main — BUILD `s.9.population-ecology` (calculator, logistic):** picture `functionGraph` from
  `g.s9-population-ecology-logistic`: `{ family: 'logistic', K: 'K', start: 'N0', r: 'r', at: { x: 't',
y: 'N' }, axes: { x: 'Time (days)', y: 'Population' } }` with K dashed. Values: K carrying capacity
  (10–1,000,000), N₀ start (1–K), r growth rate (0.01–5 per day), t time (0–1,000 days), N population
  (derived or typed to find t), G growth now (per day, derived). Relations: N = K ÷ (1 + ((K − N₀) ÷
  N₀)e^(−rt)); G = rN(K − N) ÷ K. Limits: N₀ < K; N < K. Assumptions: growth is nearly exponential while
  N is small, fastest at N = K ÷ 2, and stops at K when resources run short. Example: K = 1,000,
  N₀ = 100, r = 0.5, t = 6 → e^(−3) ≈ 0.0498, N ≈ 1,000 ÷ 1.448 ≈ 691, G ≈ 0.5 × 691 × 0.309 ≈ 107 per
  day; N = 500 at t = ln 9 ÷ 0.5 ≈ 4.39 days. startWith ['K', 'N0', 'r', 't'].
- **~rates — BUILD (calculator):** values: N start (1–1,000,000), B births, D deaths, I immigrants,
  E emigrants (0–1,000,000), ΔN change (derived), N₁ next size (derived), r per-capita rate (%,
  derived). Relations: ΔN = B − D + I − E; N₁ = N + ΔN; r = 100 × (B − D) ÷ N. Example: N = 500 deer,
  B = 90, D = 40, I = 10, E = 20 → ΔN = 40, N₁ = 540, r = 10% a year. Picture: `bars` of B, D, I, E
  beside N and N₁ (confirm at build; else Engine need 8).
- **~doubling — BUILD (calculator):** picture `functionGraph` exponential (`g.m9-exponential-functions-growth`
  shape): `{ family: 'exponential', a: 'N0', b: 2, at: { x: 'g', y: 'N' } }`. Values: N₀ (1–1,000,000),
  d doubling time (1–600 min), t time (0–10,000 min), g doublings (derived), N (derived). Relations:
  g = t ÷ d; N = N₀ × 2ᵍ. Example: N₀ = 100, d = 20 min, t = 120 min → g = 6, N = 6,400.
- **~limiting-factors — BUILD (sort):** bins Density-dependent, Density-independent. Cards:
  competition for food; disease spreading in a crowded herd; predators catching more prey when prey
  are many; parasites; less nesting space after habitat loss → Dependent; a wildfire; a flood; a late
  frost; a hurricane; a drought → Independent.
- **~growth-phases — BUILD (sequence):** bacteria in a flask: lag (adjusting, little division) →
  exponential (doubling at a steady rate) → stationary (births equal deaths as food runs low) → death
  (wastes build up, deaths exceed births). No spans.
- **Verdict:** 5 pages (3 calculators, 1 sort, 1 sequence); 4 of 6 released items Solves (1 misfiled), 1 Partly, 1 No.

### 11. s.9.ecosystem-dynamics — Ecosystems: energy pyramids, matter cycles, succession and biodiversity

- **Standard:** HS-LS2-2, HS-LS2-4, HS-LS2-5, HS-LS2-6, HS-LS2-7.
- **Textbooks:** OpenSciEd B.1, B.2; OpenStax Biology 2e ch. 44–47 (46.2 energy flow, 46.3 cycles, 47 biodiversity); HMH Dimensions 3.3–3.4, 4.2; Miller & Levine 14, 15.
- **Tests ask** (none filed here; misfiled and common):

  | Question                                         | Page                                       | Mark                   |
  | ------------------------------------------------ | ------------------------------------------ | ---------------------- |
  | NAEP-2019-12S7-#17 (succession order)            | ~succession                                | Solves                 |
  | MCAS-2026-HSBIO-#5 (cycads add nitrogen to soil) | ~nitrogen (fixation scene)                 | Partly (graph reading) |
  | common: percent of energy passed up from data    | main                                       | Solves                 |
  | common: which community is more diverse          | ~biodiversity                              | Solves                 |
  | common: carbon cycle processes                   | s.7.ecosystem-energy refresh (carbonCycle) | Partly                 |

- **Main — BUILD `s.9.ecosystem-dynamics` (calculator, trophic efficiency):** picture `energyPyramid`
  `{ measure: 'energy', levels: ['E1', 'E2', 'E3', 'E4'], percent: 'p', names: ['grasses',
'grasshoppers', 'shrews', 'owls'] }` (Grade 7 kind, measure energy). Values: E₁–E₄ (kcal, Grade 7
  `energy` helper), p efficiency (%, 1–25, no `allowed`: Grade 9 computes it). Relations: E₂ = E₁ × p ÷
  100; E₃ = E₂ × p ÷ 100; E₄ = E₃ × p ÷ 100. Assumptions: the efficiency varies, about 5–20%; the rest is
  used in respiration or lost as heat; biomass pyramids follow, but numbers pyramids (one oak, thousands
  of caterpillars) and some ocean biomass pyramids stand upside down. Example: E₁ = 12,000, E₂ = 960 →
  p = 8%, E₃ = 76.8, E₄ ≈ 6.1 kcal. startWith ['E1', 'E2'] (differs from Grade 7's ['E1', 'p']).
- **~succession — BUILD (sequence):** from `g.s9-ecosystem-dynamics-succession`, icons in order:
  `bare rock` → `lichens on rock` → `mosses and thin soil` → `grasses and flowers` → `shrubs` →
  `young trees` → `mature forest`. No spans. Assumption: secondary succession (after a fire) starts at
  grasses because soil remains.
- **~nitrogen — BUILD (explore):** figure `nitrogenCycle` from `g.s9-ecosystem-dynamics-nitrogen`.
  Scenes: whole cycle; fixation (bacteria in root nodules turn N₂ into ammonia); lightning;
  nitrification; assimilation (plants build amino acids and DNA); eating; ammonification;
  denitrification.
- **~biodiversity — BUILD (calculator):** picture `pieChart` (counts of a total). Values (6): n₁–n₄
  individuals of four species (0–1,000), N total (derived), S Simpson's index 1 − Σ(n ÷ N)² (derived).
  Relations: N = n₁ + n₂ + n₃ + n₄; S = 1 − ((n₁ ÷ N)² + (n₂ ÷ N)² + (n₃ ÷ N)² + (n₄ ÷ N)²). Assumptions:
  S is the chance two individuals picked at random are different species; more species and more even
  counts raise it. Example: 10, 10, 10, 10 → S = 0.75; 25, 5, 5, 5 → 1 − (0.390625 + 0.046875) = 0.5625.
  Harness phrase for Σ needed (Engine need 7).
- **Verdict:** 4 pages (2 calculators, sequence, explore); both misfiled items covered, 1 Partly.

### 12. s.9.homeostasis — Body systems, homeostasis and feedback loops

- **Standard:** HS-LS1-2, HS-LS1-3.
- **Textbooks:** OpenStax Biology 2e 9 (cell signaling), 33.3, 37, 41; HMH Dimensions 1.2–1.3; Miller & Levine 12.
- **Tests ask:**

  | Question                                              | Page                                 | Mark                              |
  | ----------------------------------------------------- | ------------------------------------ | --------------------------------- |
  | NAEP-2005-12S11-#13 (cooling during exercise)         | main, scene "Too hot"                | Solves                            |
  | NAEP-2005-12S13-#3 (function of a neuron)             | ~systems                             | Solves                            |
  | NAEP-2005-12S13-#8 (nervous and endocrine coordinate) | ~systems (header)                    | Solves                            |
  | NAEP-2005-12S14-#13 (menstruation stops in pregnancy) | none                                 | No (reproduction not in taxonomy) |
  | MCAS-2026-HSBIO-#4 (sodium restored, hormone stops)   | ~feedback-types, main                | Solves                            |
  | MCAS-2026-HSBIO-#40 (kidneys filter, regulate water)  | ~systems, main scene "Water balance" | Solves                            |

- **Main — BUILD `s.9.homeostasis` (explore):** figure `feedbackLoop` from `g.s9-homeostasis-feedback`.
  Scenes (5), each `loop` with roles: "Too hot" (negative): Stimulus: body temperature rises above its
  set point during exercise; Sensor: nerve endings in the skin and brain detect the rise; Control center:
  the hypothalamus compares it with the set point; Effector: sweat glands release sweat, skin blood
  vessels widen; Response: sweat evaporates and blood sheds heat, so temperature falls. "Too cold"
  (shivering, vessels narrow). "Blood sugar high" (pancreas releases insulin; cells take in glucose;
  liver stores glycogen). "Blood sugar low" (glucagon; liver releases glucose). "Water balance" (blood
  too concentrated → pituitary releases ADH → kidneys return water). "Childbirth" (positive: stretch →
  oxytocin → stronger contractions → more stretch, until birth). Assumption: negative feedback undoes
  the change and stops when the set point returns; positive feedback grows the change until an event ends it.
- **~systems — BUILD (sort):** bins Nervous, Endocrine, Circulatory, Respiratory, Excretory, Digestive.
  Cards (2 each): neurons carry signals from sense receptors; reflexes pull a hand from heat →
  Nervous; the pancreas releases insulin; adrenal glands release adrenaline → Endocrine; red blood
  cells carry oxygen; skin blood vessels widen to release heat → Circulatory; alveoli exchange O₂
  and CO₂; faster breathing removes extra CO₂ → Respiratory; kidneys filter urea from blood; kidneys
  adjust the water in urine → Excretory; enzymes break food into small molecules; the small intestine
  absorbs glucose → Digestive. Header: nervous and endocrine systems coordinate the rest.
- **~feedback-types — BUILD (sort):** bins Negative feedback, Positive feedback. Cards: sweating when
  hot; shivering when cold; insulin after a meal; glucagon between meals; ADH when dehydrated;
  aldosterone stops once blood sodium is normal → Negative; contractions during childbirth; platelets
  calling more platelets to a cut; ripe fruit releasing ethylene that ripens nearby fruit → Positive.
- **~blood-glucose — BUILD (observe):** columns 0, 30, 60, 90, 120, 150 min after a meal; rowLabel
  "Blood glucose"; unit "mg/dL"; max 200, step 5; initial [85, 135, 120, 100, 90, 85]. Pattern: "Glucose
  peaks at {max} mg/dL {when} minutes after the meal, then insulin brings it back near {last}." Assumption:
  a healthy fasting level is about 70–99 mg/dL; values are typical, not a diagnosis.
- **Verdict:** 4 pages (explore, 2 sorts, observe); 5 of 6 released items Solves, 1 No (not in taxonomy).

### 13. s.9.immune-disease — Disease and the immune system

- **Standard:** HS-LS1-2 (the immune system as interacting parts); HS-LS1-3.
- **Textbooks:** OpenStax Biology 2e 21.2–21.3, 22.4, 24.4, ch. 42; Miller & Levine 13.
- **Tests ask** (none released; MCAS-2026-HSBIO-#32 antibodies is filed under biomolecules):

  | Question                                                 | Page           | Mark   |
  | -------------------------------------------------------- | -------------- | ------ |
  | common: why a second exposure is faster and stronger     | main           | Solves |
  | common: what share must be immune to protect a community | ~herd-immunity | Solves |
  | common: virus or bacterium; do antibiotics work          | ~pathogens     | Solves |
  | common: order of the adaptive response                   | ~stages        | Solves |
  | common: innate or adaptive defense                       | ~defenses      | Solves |

- **Main — BUILD `s.9.immune-disease` (calculator):** picture `immuneResponse` from
  `g.s9-immune-disease-antibodies`: `{ first: 'P1', second: 'P2', firstDays: 'd1', secondDays: 'd2',
secondAt: 40, axis: 'Antibody level' }`. Values: P₁, P₂ peak levels (relative units, 1–1,000), d₁, d₂
  days to peak (1–30), R times higher (derived), s days sooner (derived). Relations: R = P₂ ÷ P₁;
  s = d₁ − d₂. Limits: P₂ ≥ P₁; d₂ ≤ d₁. Assumptions: memory B and T cells from the first exposure (or a
  vaccine) answer the second faster and stronger; levels here are relative, as on textbook graphs.
  Example: P₁ = 10, P₂ = 100, d₁ = 12, d₂ = 6 → R = 10, s = 6 days. startWith ['P1', 'P2', 'd1', 'd2'].
- **~herd-immunity — BUILD (calculator):** picture `percentBar` (H and C shaded over 0–100%).
  Values: R₀ people one case infects (1.1–20), H share immune to stop spread (%, derived), e vaccine
  effectiveness (%, 50–100), C share to vaccinate (%, derived). Relations: H = 100 × (1 − 1 ÷ R₀);
  C = 100 × H ÷ e. Limit: C ≤ 100 (else no coverage reaches it). Assumptions: everyone mixes evenly;
  R₀ differs by disease (measles about 12–18). Example: R₀ = 5 → H = 80%; e = 95% → C ≈ 84.2%.
  startWith ['R0', 'e'].
- **~pathogens — BUILD (sort):** from `g.s9-immune-disease-pathogens`. Bins Virus, Bacterium, Fungus,
  Parasite (icons). Cards: influenza; measles; the common cold → Virus; strep throat; tuberculosis →
  Bacterium; athlete's foot; ringworm → Fungus; malaria; tapeworm → Parasite. Header: antibiotics
  work on bacteria only.
- **~stages — BUILD (explore):** figure `immuneStages` from `g.s9-immune-disease-stages`. Scenes:
  whole response; antigen (a macrophage engulfs a pathogen and shows its antigen); helperT; bCells
  (plasma cells); antibodies (bind antigens, mark them); killerT (destroy infected cells); memory.
- **~defenses — BUILD (sort):** bins Innate (first and second lines), Adaptive. Cards: skin; mucus
  and cilia; stomach acid; fever; inflammation; phagocytes engulfing any invader → Innate; antibodies
  from B cells; killer T cells; memory cells; a vaccine's protection → Adaptive.
- **Verdict:** 5 pages (2 calculators, 2 sorts, 1 explore); all common types Solves.

## Engine and picture needs

1. **`macromolecules` as a calculator picture** (count from a value, 2–4 drawn, more elided with the
   bond and water counts written): `s.9.biomolecules~dehydration`.
2. **`dnaStrand` for long genes:** draw the first 12 bases of a coding sequence of b bases with "…",
   and check `codons` as b ÷ 3: `s.9.dna-protein-synthesis` (range 3–12 until then).
3. **`cellDivision` as a calculator picture** with `diploid` from a value (2–8 drawn; past 8 one pair
   and the count): `s.9.mitosis-meiosis~chromosome-count`.
4. **Observe with two rows** (two species counted per day, one competing out): a later
   `s.9.population-ecology~competition`.
5. **Gene-expression explore figure** (a gene with promoter, repressor or activator; on and off):
   a later `s.9.biotechnology~gene-expression`.
6. **Replication figure** (a fork, old strands dark, new ones lit; semiconservative):
   `s.9.dna-protein-synthesis~replication` (labels only until then).
7. **Harness phrases:** Σ in the Simpson step, e^(−rt) in the logistic steps, ⌈p ÷ 3⌉ reused:
   `~biodiversity`, `s.9.population-ecology`.
8. **`bars` with four flows beside N and N₁**, or a `populationFlow` kind if `bars` can't show
   in- and out-flows: `s.9.population-ecology~rates`.
9. **`reaction` with glucose** (24-atom C₆H₁₂O₆) and up to 18 molecules a formula:
   `s.9.cellular-energy~equation`.
10. **Transport card icons** (channel, carrier, pump, vesicle): `s.9.membrane-transport~transport-types`
    (text cards work now).
11. **Observe columns that are not times** (temperatures): `s.9.cellular-energy~enzymes`; if
    `layouts.test.ts` rejects it, the page becomes an explore with a new rate-by-temperature figure.
12. **Dichotomous-key layout** (a branching yes/no key): a later `s.9.classification~key`.

## Not in the taxonomy

- Reproduction and development (OpenStax 43; NAEP-2005-12S14-#13 has nowhere to go).
- Plant structure, transport and reproduction (OpenStax 30–32; Miller & Levine 11).
- Nervous and sensory systems beyond one card (OpenStax 35–36).
- Cell-cycle control and cancer (OpenStax 10.3–10.4) fits `s.9.mitosis-meiosis`; no page yet.
- Biomes and biogeography (OpenStax 44) sit under `s.9.ecosystem-dynamics` without a page.
- Data filing (`research/questions`): NAEP-2019-12S7-#2 → s.9.cellular-energy; MCAS-2026-HSBIO-#5 →
  s.9.ecosystem-dynamics; NAEP-2019-12S7-#17 → s.9.ecosystem-dynamics; MCAS-2026-HSBIO-#39 → only
  s.9.mitosis-meiosis; MCAS-2026-HSBIO-#18 → only s.9.mitosis-meiosis; NAEP-2005-12S13-#7 →
  s.7.natural-selection.

## Priority

1. Tested calculators with drawn pictures: inheritance (main, ~genotype-ratio, ~x-linked), evolution
   main (Hardy–Weinberg), population main (logistic), membrane main.
2. Tested layouts with drawn figures: mitosis sequences and ~compare, ~cell-cycle, evolution
   ~homologous, ~common-ancestry, ~resistance, succession, homeostasis main and ~systems, ~tonicity.
3. Drawn untested pages: DNA main and ~chargaff, biotechnology calculators, cellular-energy explore,
   nitrogen, immune pages, classification.
4. Pages needing no new art: every other sort and sequence, ~rates, ~doubling, ~biodiversity, ~herd-immunity.
5. Engine needs in order 2, 3, 1, 9, 4, 5; then the pages waiting on them.
