# Build notes: science grade 9 (biology)

Built from `.review/plans/s.9/plan.md` in its Priority order, one skill at a time. The grade
files (`science/9.ts`, `layouts/science9.ts`) list the skills in taxonomy order. No new harness
phrase was needed (`phrasesS9.ts` stays empty).

## Built: 59 of the plan's 62 pages

By skill, in taxonomy order:

- `s.9.biomolecules`: 3 (main macromolecules explore with 6 scenes; ~classes and ~water sorts).
- `s.9.membrane-transport`: 4 (main diffusion and ~pump calculators; ~transport-types and
  ~tonicity sorts).
- `s.9.cellular-energy`: 4 (main organelle explore with 8 scenes; ~stages sequence; ~processes
  sort; ~enzymes observe, its columns temperatures, which `layouts.test.ts` accepts).
- `s.9.mitosis-meiosis`: 4 (main mitosis sequence; ~cell-cycle and ~meiosis sequences; ~compare
  sort).
- `s.9.inheritance-patterns`: 6 (main dihybrid, ~genotype-ratio, ~incomplete, ~x-linked
  calculators; ~blood-types sort; ~pedigree explore).
- `s.9.dna-protein-synthesis`: 4 (main codons and ~chargaff calculators; ~replication and
  ~protein-synthesis sequences).
- `s.9.biotechnology`: 5 (main substitution, ~frameshift, ~gel and ~pcr calculators; ~tools
  sort).
- `s.9.evolution-evidence`: 7 (main Hardy–Weinberg and ~allele-counts calculators; ~homologous
  and ~mechanisms sorts; ~common-ancestry explore; ~resistance and ~speciation sequences).
- `s.9.classification`: 4 (main cladogram explore; ~domains and ~kingdoms sorts; ~ranks
  sequence).
- `s.9.population-ecology`: 5 (main logistic, ~rates and ~doubling calculators;
  ~limiting-factors sort; ~growth-phases sequence).
- `s.9.ecosystem-dynamics`: 4 (main trophic-efficiency and ~biodiversity calculators;
  ~succession sequence; ~nitrogen explore).
- `s.9.homeostasis`: 4 (main feedback-loop explore with 6 scenes; ~systems and ~feedback-types
  sorts; ~blood-glucose observe).
- `s.9.immune-disease`: 5 (main antibody-peaks and ~herd-immunity calculators; ~pathogens and
  ~defenses sorts; ~stages explore).

21 calculators and 38 layout pages.

## Waiting: 3 pages

- `s.9.biomolecules~dehydration` (calculator): Engine need 1, `macromolecules` as a calculator
  picture (the count from a value, 2–4 drawn, more elided with the bond and water counts).
- `s.9.cellular-energy~equation` (calculator): Engine need 9. The `reaction` picture draws at
  most 8 molecules a formula (`chemPictures.ts`), and 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ needs 6 for one
  glucose and 18 for three; the plan's interim range 1–3 already needs 18, and g = 1 alone leaves
  the page nothing to type. Waits for 18 molecules a formula and a checked 24-atom glucose.
- `s.9.mitosis-meiosis~chromosome-count` (calculator): Engine need 3, `cellDivision` as a
  calculator picture with `diploid` from a value (2–8 drawn, past 8 one pair and the count).
  Allowed [2, 4, 6] would hide the human 2n = 46 case the page is for.

Later pages the plan names outside its 62 (not built): `s.9.population-ecology~competition`
(Engine need 4), `s.9.biotechnology~gene-expression` (need 5), `s.9.classification~key`
(need 12).

## Changed from the plan

- `s.9.membrane-transport` main: the limit m ≤ d ÷ 2 reads as 0 when the gradient is not above 0
  (O₂ then moves out or not at all, so none moves in). The after-counts o₂ and i₂ are labelled
  under the picture, which draws the counts before.
- `~pump`: added the limit i < o (Na⁺ is lower inside): the pump's arrow runs from fewer to more,
  so with more Na⁺ inside the picture would pump it in. K⁺ and the after-counts are labelled
  under the picture.
- `~transport-types`: text cards (Engine need 10, transport icons, would add pictures).
- `s.9.inheritance-patterns~genotype-ratio`: added `t`, the boxes of 4 showing the dominant
  trait (derived): the Grade 7 `punnettSquare` needs a `dominant` value to draw and check. The
  offspring count is `n` (the plan's N). 7 values.
- `s.9.dna-protein-synthesis` main: b runs 6–12, not 3–12: with b = 3 the one codon is the stop,
  so a = 0 amino acids and p = −1 peptide bonds. The picture draws the first b bases of the
  example gene with its mRNA only (`show: ['mrna']`): below 12 bases no stop codon is drawn, so a
  protein row would contradict a = c − 1. The amino acids and bonds are labelled under it. Both
  wait on Engine need 2 (a long gene drawn as its first 12 bases and "…", ending in its stop).
- `~chargaff`: A takes any whole percent (the ladder fades off multiples of 5, as drawn), so the
  pairs in 10 and the hydrogen bonds can be decimals: they read as averages per 10 pairs.
- `~replication`: text stages only (Engine need 6, the replication-fork figure).
- `s.9.biotechnology~frameshift`: added the limit p ≤ L (the plan's range 1–L).
- `s.9.evolution-evidence~common-ancestry`: the "Is reptiles without birds a clade?" scene rings
  the lizard alone (the plan's ring) and says the smallest clade holding it also holds the bird.
- `s.9.classification` main: the plan's example tree (Earthworm outside Insect + Fish + Human)
  groups an insect with the chordates, which today's tree does not; the page uses Sponge,
  Jellyfish, Earthworm, Sea star, Fish, Human with True tissues, Bilateral symmetry, Deuterostome
  embryo, Backbone and Hair, each one clade. Scenes: each trait lit, a clade, not a clade, and
  reading the nodes.
- `~domains`, `~blood-types`, `~systems`, `~pathogens`: the plan's header sentences are
  assumptions (sorts have no header text). `~pathogens`: bins cannot carry icons, so each
  kind's icon is a card of its own ("A virus").
- `s.9.population-ecology` main: `startWith` is ['t', 'K', 'N0', 'r'] (the demo's order), not
  ['K', 'N0', 'r', 't']: typing N must recalculate t, the value the relation can solve for; K,
  N₀ and r can't be found back from N. The N step divides by e^(rt) instead of multiplying by
  e^(−rt): the harness reads "−0.5" in a substituted step as a negative count.
- `~rates`: drawn with `bars` (N, B, D, I, E, N₁) as the plan's interim. Bars show the sizes
  but not which flows add and which take away (Engine need 8 still stands).
- `~doubling`: time t is 0–1,440 min (a day) and doublings g at most 40, so N stays a finite
  number; the plan's 0–10,000 min would overflow 2ᵍ.
- `s.9.ecosystem-dynamics~biodiversity`: Simpson's sum is written out term by term,
  1 − ((n₁ ÷ N)² + … + (n₄ ÷ N)²), so the harness reads it with no Σ phrase (Engine need 7 is not
  needed for this page). The four species are named (a pond survey) rather than numbered.
- `s.9.immune-disease` main: the days (d₁, d₂, s) are marked `standalone`: how much sooner and
  how much higher are separate comparisons with no formula between them.
- `~herd-immunity`: `percentBar` shades a part of a whole, so the page adds the people in the
  community P and the people to vaccinate V = P × C ÷ 100; the bar shades C. H is shown as a
  value, not shaded. Example R₀ = 5, e = 95%, P = 19,000 → H = 80%, C ≈ 84.2%, V = 16,000.

## Shared needs found while building

- **Negative exponents in step text** (harness): a substituted "e^(−0.5 × 6)" is flagged as a
  negative count. Letting a minus inside an exponent pass would let the logistic step read as
  textbooks write it (`s.9.population-ecology`, and any exponential-decay page).
- **Sort header text or bin icons** (layout engine): a line above the cards, and an icon on a
  bin, would carry the plan's header sentences and the pathogen and domain icons on their bins
  (`~blood-types`, `~systems`, `~pathogens`, `~domains`).
- **`percentBar` with a second mark** (picture): H and C shaded on one 0–100% bar
  (`s.9.immune-disease~herd-immunity`).
- **`dnaStrand` protein row for part of a gene** (Engine need 2): until then the main DNA page
  hides the protein row.
- **`reaction` past 8 molecules a formula** (Engine need 9) and **`bars` with in- and out-flows**
  (Engine need 8) are confirmed as needed.

## Lesson review fixes (`.review/hs-s.9/lesson-report.md`)

All 13 errors and 18 improvements are fixed in the grade files, except as noted:

- Error 1 (substitution at the start and stop codons): p is 4–9 (the codons between them), with
  the assumption saying so. The start-lost and stop-lost captions are a shared need.
- Error 5 (lowercased names): "Count of A alleles", "Diversity index (Simpson’s)"; the Na⁺ names
  wait on the lead's capitals rule.
- Error 8 (DNA main): b runs 6–3,000 (multiples of 3). The picture draws hidden values b_d and c_d:
  the whole gene up to 12 bases, its first 9 (no stop codon, so no protein row) past that. Added w,
  water molecules released (improvement 22).
- Error 10 (logistic): work lines for N (A, e^(rt), the sum, the quotient; when rt > 40, "so large
  that A ÷ e^(rt) is nearly 0") and for t (A, e^(rt) = A × N ÷ (K − N), ln). N and G carry an
  "about … individuals" note (improvement 24).
- Error 11 (herd immunity): the relation itself is V = P × H ÷ e, so the line is exact; the note
  rounds up. Improvement 12's message is on the C relation (H > e), not a separate limit.
- Improvement 14: a is typable, a = c both ways.
- Improvement 16: n is 1–1,000, the expected counts step 0.25, and P_ff, the chance of ff (%), added.
- Improvement 25: the growth-rate assumption is first; the closed form stays.
- Improvement 26: new page A (below).
- Every value symbol is a plain letter (no expressions), checked by grep.

New pages from the report: `s.9.biotechnology~mutation-types` (sort, page A) and
`s.9.ecosystem-dynamics~carbon` (explore on the Grade 7 `carbonCycle`, page B). Page C,
`s.9.biotechnology~fingerprint`, waits for `gel` as an explore figure.

## Added skills (see the plan's "Added skills")

- `s.9.mitosis-meiosis`: ~checkpoints and ~cancer sorts, ~mitotic-index calculator (`pieChart`).
- `s.9.reproduction-development`: main sequence, ~sexual-asexual and ~germ-layers sorts,
  ~menstrual-cycle sequence (spans in days).
- `s.9.plant-biology`: main explore (`parts` plant), ~xylem-phloem and ~tropisms sorts,
  ~life-cycle sequence, ~transpiration calculator (`doubleNumberLine`).
- `s.9.biomes`: main explore (`greenhouse` zones), ~land and ~aquatic sorts, ~rainfall observe.
- `s.9.nervous-system`: main reflex sequence, ~action-potential sequence, ~divisions and ~senses
  sorts, ~impulse-speed calculator (`doubleNumberLine`, ms per meter hidden).

23 new pages in all (2 from the report, 21 for the skills): 3 calculators and 20 layouts.

### Lesson review of the added skills

Report: `.review/new-sci/lesson-report.md`. Every finding is fixed:

- Wording: "The embryo grows until birth or hatching"; "Follicular phase"; "the empty follicle
  (corpus luteum)".
- One right bin: the maple-syrup card (maple sap is xylem) is now "Aphids feed on its sugary sap";
  the salt-marsh card (also a wetland) is "where a river meets the sea"; "You decide to kick a ball"
  (a decision in the cerebrum) is "Motor nerves carry the kick to the leg muscles".
- ~rainfall: deciduous forests have warm summers and cold winters (the sentence said mild winters);
  a wet year with 1–2 dry months now reads as a seasonal forest.
- ~transpiration: R is in mL/h (a fixed label).
- ~impulse-speed: the t step shows the seconds first ("d ÷ v = 1 ÷ 50 = 0.02 s", "t = 0.02 × 1,000").
- ~action-potential's "the pump restores the ions" stays (the report accepted it).
- New pages: `s.9.nervous-system~synapse` (sequence) and `s.9.plant-biology~nutrients` (sort).

### Second lesson-review fixes

Report: `.review/new-sci-2/lesson-report.md`. Every s.9 finding is fixed:

- ~divisions: the Autonomic bin is split into Sympathetic (fight or flight: the heart speeds up;
  new card "The pupils widen when you are startled") and Parasympathetic (rest and digest: the
  stomach churns food; the pupils narrow in bright light). Each card still has one right bin.
- ~senses: a second thermoreceptor card, "A warm mug in your hands".
- ~rainfall: the last pattern sentence no longer has two colons ("… spread through the year.
  That is enough for a forest: …").
- ~impulse-speed: the rule is now t = d ÷ v × 1,000, so the substituted line and the work lines
  follow one order. The rule printed twice is the engine's (lead).

## Shared needs (lesson review and added skills)

- **`dnaMath.effectOf` start-lost and stop-lost** (with their captions): then
  `s.9.biotechnology` p can run 1–12 again and ~frameshift p 1–12.
- **`dnaStrand` long gene** (first bases, "…", its stop; Engine need 2): `s.9.dna-protein-synthesis`
  draws only the first 9 bases past 12 until then.
- **`gel` as an explore figure** (suspects' and a family's lanes): `s.9.biotechnology~fingerprint`.
- **`cellDivision` as a calculator picture** (Engine need 3): `s.9.mitosis-meiosis~chromosome-count`
  still waits; phase icons on the `pieChart` wedges would also suit ~mitotic-index.
- **Neuron and reflex-arc figure** (dendrites, axon, myelin, synapse; skin, spinal cord, muscle):
  `s.9.nervous-system` and ~impulse-speed (text stages and a number line until then).
- **Observe with negative values or two rows**: a membrane-potential trace for
  `s.9.nervous-system~action-potential`; hormone levels by day for
  `s.9.reproduction-development~menstrual-cycle`; a climograph (temperature and rainfall) for
  `s.9.biomes~rainfall`.
- **Flower drawing with its parts** (anther, filament, stigma, style, ovary, ovule) and embryo stage
  icons (zygote, morula, blastula, gastrula): `s.9.plant-biology~life-cycle`,
  `s.9.reproduction-development`.
- **A biome map** (or biome icons for sort cards): `s.9.biomes`, ~land.
- **Search corpus**: rerun `scripts/build-match-corpus.mjs` for the 23 new pages.

### Pictures placed (H89–H110)

- `s.9.membrane-transport~transport-types` (H100 need 10, H104 part 1): the five bins wear the
  transport icons (simple diffusion, channel protein, aquaporin, protein pump, vesicle transport)
  and an `intro` says what they show; the cards stay text. No stand-in (text bins before).
- `s.9.biomolecules~dehydration` (H100 need 1): built (it was waiting) as the plan has it, n, b,
  w, m, M, with `macromolecules` { macro: carbohydrate, count: n, bonds: b, water: w }. No
  stand-in.
- `s.9.cellular-energy~equation` (H100 need 9): built (it was waiting) as the plan has it, g 1–3
  and the nine counts, with `reaction` `many: true` (up to 18 molecules a formula, glucose as its
  ring). No stand-in.
- `s.9.mitosis-meiosis~chromosome-count` (H100 need 3, H109 part 3): built (it was waiting) as the
  plan has it, 2n 2–100 (multipleOf 2), n, X, Z, C, with `cellDivision` { diploid, haploid,
  chromatids, zygote, combinations }. No stand-in.
- `s.9.mitosis-meiosis~mitotic-index` (H109 part 3): its `pieChart` adds `stages` (interphase to
  telophase), a phase card beside each part. No stand-in.
- `s.9.inheritance-patterns~blood-types` (H104 part 1): the plan's header sentence as `intro` and
  the four blood-type icons on the bins. No stand-in.
- `s.9.dna-protein-synthesis` main (H100 need 2): `dnaStrand` { sequence TACCGGTTCGGA, gene: {
  bases: b }, codons: c }, the protein row back on, b 6–3,000 drawn whole to 15 and past that the
  first 12, "…" and the stop. Stand-ins gone: the hidden bases-drawn and codons-drawn values and
  their rules, `show: ['mrna']`, and c and a under the picture (the caption reads them).
- `~replication` (H100 need 6): the four stages wear the `replication` card (unzip, pair, join,
  copies), labels as they were; an assumption says old strands are dark, new ones lit.
- `s.9.biotechnology` main (H109 part 1): p runs 1–12 (k 1–4), so a change to the start or stop
  codon reads start lost or stop lost; the assumption "this page changes the codons between
  them" went, and one says what start lost and stop lost mean.
- `~frameshift` (H109 part 1): p runs 2–12 (k and s 1–4): p = 2 or 3 breaks the start codon
  (start lost); p = 1 is kept out because s would read 1 while nothing shifts. The "p ≥ 4"
  assumption went.
- `~gene-expression` (H100 need 5): new explore on the `geneExpression` figure, the demo's five
  scenes (repressor on, lactose arrives, the promoter, no activator, activator bound).
- `~fingerprint` (H109 part 2, page C): new explore on the `gel` figure, the demo's eight lanes
  and five scenes (the gel, compare, a match, a family, ruled out).
- `s.9.classification~domains` (H104 part 1): the three domain icons on the bins and the virus
  sentence as `intro` (out of the assumptions). Stand-in gone: the icons on six cards (two domain,
  four kingdom), which gave the cards' bins away.
- `~key` (H100 need 12): new explore on the `dichotomousKey` figure, the demo's six animals and
  four scenes. (Sampling has no calculator under this prefix, so its suite reports an empty
  table; the other suites pass.)
- `s.9.population-ecology~rates` (H100 need 8): its `bars` add `flows: { out: ['D', 'E'] }`, the
  four counts drawn as steps from N to N₁. No other change.
- `~competition` (H100 need 4): new observe page with two rows (Species A and B per mL, days 0–20)
  and a pattern reading both, as the demo.
- `s.9.homeostasis~systems` (H104 part 1): the plan's sentence as `intro` and the six system
  icons on the bins. No stand-in.
- `s.9.immune-disease~pathogens` (H104 part 1): the antibiotics sentence as `intro` (out of the
  assumptions) and the virus, bacterium, fungus and parasite icons on the bins. Stand-in gone: the
  four "A virus" … "A parasite" icon cards.
- `~herd-immunity` (H104 part 3): `percentBar` adds `second: 'H'`, so H is marked on the bar beside
  the shaded C (it was a value only).
- `s.9.nervous-system` main (H109 part 4): the six stages wear the `reflexArc` card, receptor to
  brain, labels as they were. Stand-in gone: text-only stages. (The optional reflex-arc explore
  page, g.s9-nervous-system-reflex-arc, is not added.)
- `~impulse-speed` (H109 part 4): `neuron` { length: d, speed: v, time: t } in place of the
  `doubleNumberLine`. Stand-ins gone: the hidden k (ms per meter) and its rule, and v under the
  picture; the unused `hide` helper went with them.
- `~membrane-potential` (H109 part 7): new observe page beside the ~action-potential sequence, the
  demo's membrane-potential trace (−90 to 40 mV, 0–6 ms, bars up and down from 0).
- `s.9.plant-biology~life-cycle` (H109 part 5): the seven stages wear the `flowerCycle` card,
  pollination to seedling, labels as they were. Stand-in gone: text-only stages.
- `~flower` (H109 part 5): new explore on the `parts` flower drawing (petal, sepal, anther,
  filament, stigma, style, ovary, ovule), the demo's five scenes; the main page's Flower scene
  stays on the whole plant.
- `s.9.reproduction-development` main (H109 part 5): the zygote, morula, blastula and gastrula
  icons on fertilization, cleavage, blastula and gastrulation (the last two stages stay text).
  ~germ-layers keeps its bin names (the gastrula's colors are not named there).
- `~hormones` (H109 part 7): new observe page beside ~menstrual-cycle, estrogen and progesterone
  (0–100 of each one's peak) on days 1–28, as the demo.
- `s.9.biomes~land` (H109 part 6): the six biome icons on the bins; the cards stay text. No
  stand-in.
- `~rainfall` (H109 part 7): a second row, Temperature in °C (−30 to 40) on its own chart, and a
  pattern reading both (tundra by the warmest month, rainforest and savanna only when warm all
  year, taiga by freezing winters). Retitled "Rainfall and temperature by month". Stand-in gone:
  the assumption that temperature matters too, and the "if it is warm all year" hedges.

### Page-review fixes

From `.review/hs-page-s/page-report-s9-10.md` (science role):

- `~flower`: the "Male parts" scene lights the anther and the filament, "Female parts" the
  stigma, style and ovary (new scene field `alsoLit` on a drawn `parts` figure; the layout test
  checks its names). The Filament leader ends on the filament, not the petal. "Attract" is now
  "Pollinators".
- `~hormones`: estrogen and progesterone each peak at 100 (the assumption's 0–100 of each one's
  peak), and the table's corner reads "% of peak", not "Level".
- `~membrane-potential`: new observe field `guides` draws dashed lines at the threshold
  (−55 mV) and rest (−70 mV) with a scale (0 mV, −55, −70) at the left and a key under the
  chart; bars and table on a range below 0 show + on positive readings (+30).
- The observe table's row names (all three observe pages): one size on every page, in a column
  as wide as the longest name needs, so "Species A" no longer wraps in small grey type.
- `~mitotic-index`: I 0–300 and P, M, A, T 0–100 (N to 700, m to 400), one field's counts, so the
  sliders sit where the values are.
- `s.9.evolution-evidence`: the expected AA, Aa and aa counts add "(about 347 people)" when the
  product isn't whole.
- `~gene-expression`: the signal reads "inducer (lactose)". `~fingerprint`: the "A match" scene
  drops its line repeating the gel's own "matches in all 4 bands".
- Left for the shared role (components): the mitotic-index pie label and #418, `drag-p`
  snapping to 0.01 (AlleleFrequencies), population-ecology's caret caption and 4-decimal values
  (FunctionGraph), herd-immunity's 84.2105% (PercentBar), the pump's K⁺ (Membrane).

### Second page-review fixes

From `.review/hs-page2-s/page-report2-science.md` (science, s.9–s.12; the shared parts are
listed here once):

- `~mitotic-index` React #418: the pre-rendered bar said "Home" (its route id had lost its
  trailing "index") while the live page named the skill. `skillPageId` (selectors) restores the
  id for the page, its back label and its title; a build of the page loads with no error at 390,
  1024 and dark. The interphase card sits on its plate; a pie's fifth part is red, so prophase
  (amber) and telophase no longer share one brown in dark mode.
- Observe table (competition, hormones, membrane-potential, every observe page): one type size
  (13 px) for headers, row names and readings; the row-name column holds its width (it was
  `flex: 0` with a width, a 0% basis on the web, so it shrank to 45 px and wrapped "Species /
  A"); equal columns that never grow to their text, so readings sit under their headers; a
  twelve-month table scrolls sideways; one row reads its name with its unit, "Membrane
  potential (mV)".
- Drags pin only typed values (`rep.typed`, `rep.pinTyped` in `useRep`): gel has no handle on
  a band worked out from the others (drag-b dropped).
- `~pump`: "K⁺ in" at its arrow's tail on a halo; the side counts read "20 Na⁺", not "o = 20
  Na⁺". Ecosystem pyramid: level names at label size in full ink (dark mode).
- `s.9.population-ecology`: t ≈ 4.39 and N(6) ≈ 691 (a science page's FunctionGraph decimals to
  3 figures).
- Grades 9–12 science pictures write worked-out values to 3 significant figures, in plain digits
  between 10⁻⁴ and 10⁷ (`useRep`); typed values and variables with their own figures unchanged.
- Not done: `s.9.evolution-evidence`'s expected counts after a drag (344.45 people). They are
  N × p², worked out from a p on its 0.01 step; no step of p makes all three whole, and the
  steps already add "(about 344 people)".

### Round 4 placed

- `s.9.reproduction-development~germ-layers` (H114, P26): the sort bins take the gastrula card's
  colors, ectoderm `bioAmino`, mesoderm `organDeep`, endoderm `bioSugar` (a stripe and a swatch).
  Demo `g.s9-reproduction-development-germ-layers-colors` retired.

### Worked-out values to 3 figures

- Every Grades 9–12 science page shows a worked-out value to 3 significant figures in its box,
  under the picture and in its step's answer, as the pictures label values (F = −3.37 N,
  1.92 × 10⁻¹², not −3.3713 or 1.9231 × 10⁻¹²): `workedFigures` in grade.ts (a page can set
  `workedFigures`), `formatNumber`'s `worked`. Typed values show as typed, whole numbers stay
  whole, and a value with its own display (`figures`, `sigFigs`, `integer`, a fraction) keeps
  it; the working lines and the check keep their extra figures, as a worked answer is rounded
  only at the end.

### Drawn parts placed

| Page                                  | Entry | What it teaches                                                                                                            |
| ------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------- |
| `s.9.inheritance-patterns~codominant` | H35   | codominance in roan cattle: red, roan and white calves of 4 from the parents' Cᴿ counts, both colors showing (not a blend) |
