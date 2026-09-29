# Sources

Reference only; never bundled or imported by the app (see `../README.md`). Every K–8 record
in `math/*.jsonl` and `science/*.jsonl` came from a page fetched between 2026-09-26 and
2026-09-27 (UTC); each carries `"retrieved": "2026-09-26"`, the day the collection started.
The Grades 9–12 records (§1a, §4) were fetched 2026-09-28 and 2026-09-29 and carry
`"retrieved": "2026-09-28"`, with the User-Agent version `0.2`. Fetching was sequential, at most one request per second per host, with the
User-Agent `EducationalCalculatorResearch/0.1 (offline study-app research; contact …)`, and
followed each site's robots.txt.

## 1. NAEP released questions (NCES) — used first

- **Where:** NAEP Questions Tool (NQT), <https://www.nationsreportcard.gov/nqt/>. The tool is a
  single-page app; its own public JSON endpoints (found in its JS bundle
  `static/js/main.3ba7a6ab.chunk.js`) were used:
  `api/querypanel/subjectgradeinfo` and `api/queryresults/getTabular` (item lists),
  `api/queryresults/GetItem?tableID=…` (question HTML; this is each record's `itemUrl`) and
  `api/queryresults/GetItemScoreGuide?tableID=…` (answer key or scoring guide).
  `GetItemSampleResponses` (scored student responses) and `GetItemPerformanceData` were
  **not** fetched, so no student work is stored. nationsreportcard.gov has no robots.txt
  (404).
- **Reuse statement** (NQT → footer → "Copyright Policy", text served in the same bundle,
  <https://www.nationsreportcard.gov/nqt/>):

  > "Material contained in the NAEP Questions Tool is from the National Assessment of
  > Educational Progress (NAEP). This material is in the public domain (excluding any
  > third-party copyrighted material it may contain), and permission is therefore not
  > required to reproduce it. Users of NAEP items that include third-party copyrighted
  > materials, e.g., reading passages, photographs, images, etc., must seek and receive
  > copyright permission from the copyright holder before that material is reproduced
  > elsewhere. Material that is copyrighted contains a citation line specifying the owner of
  > the content."

  > "Although all other material in the NQT is in the public domain and permission is not
  > required to reproduce it, please print an acknowledgment of its source. … SOURCE: U.S.
  > Department of Education, Institute of Education Sciences, National Center for Education
  > Statistics, National Assessment of Educational Progress (NAEP), 2013 Reading Assessment."

  Each NAEP record's `license.attribution` is that acknowledgment with the item's year and
  subject. No separate statement was found on the nces.ed.gov pages checked
  (`/nationsreportcard/about/`); the NQT statement above is the one relied on.

- **Third-party copyright check:** any item whose HTML carries a citation line (©,
  "copyright") was skipped. Found and skipped (all grade 8 science, photo credits to
  Shutterstock/iStockphoto/agefotostock): 2024-8S2 #3, 2024-8S5 #9, 2024-8S8 #10 and #11,
  2024-8S10 #9, and the 2024-8S85 scenario task (#1–#5). None of the chosen math items had a
  citation line.
- **What was taken:** grades 4 and 8 here; grade 12 was added later (§1a). Mathematics and Science.
  Items were chosen per taxonomy skill from the NQT descriptions and then read; at most 10
  NAEP questions per skill (newest first, alternating grade 4 and grade 8).
- **Also skipped:** NAEP scenario-based tasks (SBT: "How Seeds Travel", "Clear Water") —
  multi-screen simulations whose text does not stand alone; duplicate items given at both grades (2005-8S13/8S14 and 2000-8S9 repeat
  grade 4 blocks — only the grade 4 copy is kept).
- **Dropped after reading:** items whose image alt text is missing ("No Alt Text"), is only
  in Spanish, or does not contain the question itself (for example tableIDs 90204, 90205,
  11628, 25221), items that refer to another question for context, and items whose choices
  are unlabelled pictures ("Graph").
- **Text notes:** newer (2017+) items are images in NQT; their question text is NCES's own
  alt text for the image (noted per record). MathML was rendered to plain text
  (`4/6 - 1/6 =`). Correct-answer markers in alt text were removed from the question and
  the answer comes from the score guide. Constructed-response `answer` is the top score
  level of the NAEP scoring guide (rubric wording only).

## 1a. NAEP grade 12 released questions (NCES) — for Grades 9–12

- **Where and terms:** the same NQT endpoints and the same public-domain statement as §1
  (`subjectgradeinfo` / `getTabular` with `gradeStr: "12"`, then `GetItem` and
  `GetItemScoreGuide` per chosen item; no sample responses or performance data). NQT lists
  258 grade 12 Mathematics items (1990–2024) and 133 grade 12 Science items (2000–2019).
- **Filing:** by the taxonomy skill the item tests, one course per grade (9 Algebra 1 /
  Biology, 10 Geometry / Chemistry, 11 Algebra 2 / Physics, 12 Precalculus & Statistics /
  Earth & Space). The record's `grade` and file are the **skill's** grade; the test grade (12)
  is in the id (`12M`, `12S`) and the notes ("tested at grade 12; filed by the lesson's grade
  …"). An idea an earlier lesson teaches is listed in `alsoSkills`. At most 10 per skill.
- **Chosen:** 187 of the 391 items (math 95, science 92), each read with its score guide.
  Candidates were picked from the NQT descriptions for every m.9–m.12 and s.9–s.12 skill;
  items whose main idea is a K–8 skill only (systems of linear equations, slope, percent,
  order of operations, cylinder volume, mean/median, sampling, food webs, rock cycle,
  weathering, chemical vs physical change, element counts in a formula, …) were left out.
- **Skipped — third-party copyright:** the 2000-12S15 block (#1–#8) is built on a passage
  "adapted from an article in the March 1990 issue of Discover magazine" by Geoffrey
  Montgomery; it has no © line in the HTML but is third-party text, so none of it is used.
- **Also skipped after reading:** items whose figure carries the question and has no
  description in the NCES alt text ("Figure shows… End figure description" with nothing
  between: 2024-12M11 #3, #12; 2024-12M4 #11, #13; 2024-12M2 #5, #12), items that depend on
  another question's answer (1990-12M7 #17, 2005-12M4 #6 and #7), a key that contradicts
  itself (1992-12M7 #3), a stem that contradicts its own graph (2005-12M4 #10: f(x) = 2x^2
  in the text, "2x to the 3rd power" in the alt text), a chip picture with no numbers
  (1990-12M7 #8), and the scenario-based task 2019-12S99.
- **Hand fixes (noted per record):** 2013-12M99 #9 is an image whose alt text reads
  "(16 and one-half) cubed equals"; it is written as `16^(3/2) =` (keyed answer 64).
  1992-12M14 #10 had its three example equations run together. 2024-12M11 #10's two-part
  choices are written into the question. The keys of 2009-12M2 #9 and 1992-12M15 #4 are
  figures; their alt text is used as the answer. For 2017+ items (screenshots) the
  `picture` field was set by hand, and number words in the alt text ("two point seventy
  five") were kept as NCES wrote them.
- **Loose fits worth knowing:** 2013-12M99 #10 (a proof by induction of a geometric-series
  sum) is filed under `m.11.series`; 2005-12S11 #15 (radio-wave frequency and wavelength)
  under `s.11.sound-waves`; 2005-12S13 #2 (most abundant elements in the Solar System)
  under `s.12.stellar-evolution`; 2019-12S7 #7 (early photosynthesis and red beds) under
  `s.12.climate-systems`; 2019-12S7 #17 (plant succession) under `s.9.population-ecology`.
- **No NAEP grade 12 item fits:** m.11 complex numbers, polynomial functions, logarithms,
  unit circle; m.12 law of sines/cosines, trig formulas, vectors, matrices, polar,
  parametric, conics (one via `alsoSkills`), limits; s.9 membrane transport; s.10 periodic
  trends, mole, molarity, acids and bases, rates and equilibrium; s.11 momentum, circuits,
  electromagnetism, optics.

## 2. Other U.S. federal public-domain material

None used. No other federal source with released K–8 question sets and an explicit
public-domain statement was found in the time available.

## 3. Illustrative Mathematics (CC BY 4.0)

- **Where:** <https://curriculum.illustrativemathematics.org/> (IM's curriculum site;
  robots.txt allows all). Public "Practice" pages only: IM K–5 Math unit practice pages
  (`/k5/teachers/<grade>/unit-N/practice.html`) and IM 6–8 Math lesson practice pages
  (`/MS/teachers/<course>/<unit>/<lesson>/practice.html`).
- **License statements (page footers):**
  - K–5 (e.g. <https://curriculum.illustrativemathematics.org/k5/curriculum.html>):
    > "© 2021 Illustrative Mathematics®. Licensed under the Creative Commons Attribution 4.0
    > license. The Illustrative Mathematics name and logo are not subject to the Creative
    > Commons license …"
  - 6–8 (e.g. <https://curriculum.illustrativemathematics.org/MS/index.html>):
    > "IM 6–8 Math was originally developed by Open Up Resources and authored by Illustrative
    > Mathematics®, and is copyright 2017-2019 by Open Up Resources. It is licensed under the
    > Creative Commons Attribution 4.0 International License (CC BY 4.0). … Adaptations and
    > updates to IM 6–8 Math are copyright 2019 by Illustrative Mathematics, and are licensed
    > under the Creative Commons Attribution 4.0 International License (CC BY 4.0)."
  - Both footers also note: "These materials include public domain images or openly licensed
    images that are copyrighted by their respective owners." Only the problem text and the
    page's own image alt text/long descriptions are stored — no images.
- **Attribution:** every IM record has `license.attribution` with the footer text, course,
  grade/unit/section or lesson, problem number and page URL.
- **Not used:** solutions ("Teachers with a valid work email address can … sign in") and all
  assessments (checkpoints, mid/end-of-unit) sit behind a sign-in, so IM `answer` is `null`.
  "Exploration" problems were left out. Kindergarten unit 1 and 8, grade 1 unit 8 and
  grade 5 unit 8 have no public practice page (404).
- **Skill mapping:** pre-unit problems carry a CCSS code ("Practicing Standards"), which is
  kept in `standardCode` and drives the mapping; other problems are mapped by section (K–5)
  or lesson (6–8) topic. Review problems in 6–8 ("From Unit X, Lesson Y") are mapped by the
  lesson they come from. IM questions per skill: 3–8, fewer where NAEP already has many.

## 4. State released items

A state is used only where it grants reuse in writing. For K–8 none was confirmed (the MCAS
release **web page** states no grant). For Grades 9–12 the MCAS release **documents** were
read and do carry one, so Massachusetts is used for high school; the others were rejected.

### 4a. Massachusetts MCAS, Spring 2026 high school — used

- **Where:** <https://www.doe.mass.edu/mcas/2026/release/> (index linked from
  <https://www.doe.mass.edu/mcas/release.html>): `g10-math.pdf`, `hs-biology.pdf`,
  `hs-physics.pdf`. robots.txt was followed: `/mcas/question.asp` and `/mcas/search` were
  not visited and every request to www.doe.mass.edu waited the 15 s `Crawl-delay`. The 2025
  and 2024 grade 10 math and the 2025 physics PDFs were also downloaded but not transcribed;
  `2025/release/hs-biology.pdf` does not exist (404).
- **Reuse grant** (inside cover of each release document, e.g.
  <https://www.doe.mass.edu/mcas/2026/release/g10-math.pdf>, page 2):

  > "© 2026 Massachusetts Department of Elementary and Secondary Education. Permission is
  > hereby granted to copy for non-commercial educational purposes any or all parts of this
  > document with the exception of English Language Arts passages that are not designated as
  > in the public domain. Permission to copy all other passages must be obtained from the
  > copyright holder. Please credit the "Massachusetts Department of Elementary and Secondary
  > Education.""

  The math, biology and physics documents have no passages and no photo credit lines. This
  folder is non-commercial, educational reference material, and each record's
  `license.attribution` carries the credit and the grant. The mass.gov page "Permissions to
  Reproduce Content or Images" linked from DESE's policies page returned 403 and was not
  used.

- **What was taken:** 63 items (31 grade 10 math, 14 biology, 18 introductory physics), chosen
  for m.9–m.12 and s.9/s.11 skills, favouring skills NAEP grade 12 leaves thin (circuits,
  electromagnetism, momentum, optics, membrane transport, meiosis). Each item was read on the
  rendered page and replicated as text; the answer is the release's own key table
  (selected-response and short-answer only). Constructed-response items (math 13, 27, 34) have
  `answer: null`: DESE posts their scoring guides later. Items that are only K–8 skills
  (median, rounding, unit rates, systems of linear equations) or whose meaning sits in
  answer-choice graphs (math 11, 31, 37) were left out.
- **Pictures:** the PDFs have no alt text, so every `picture.description` is our own short
  description of the figure; where the answer choices are drawings (biology 2, physics 2, 14, 27) the choice wording is ours too, and the record says so. `standardCode` is the
  Massachusetts framework code from the key table (`A-REI.B.3`, `HS.LS.3.1`, `HS.PHY.2.9`).
- **Filing:** as §1a, by the skill's grade; id `MCAS-2026-<G10M|HSBIO|HSPHY>-#<item>`.

### 4b. Rejected (no usable written grant)

- **New York Regents** (<https://www.nysedregents.org/>; no robots.txt, 404): the exam,
  rating-guide and scoring-key PDFs (checked: June 2026 Algebra I exam and rating guide) and
  the exam index pages carry no copyright or reuse statement. The site's only terms link is
  <http://www.nysed.gov/terms-of-use>, which could not be read: TLS to www.nysed.gov fails
  through this environment's proxy and WebFetch got 503 twice, so no grant could be quoted.
  Rejected; worth rechecking from another network.
- **Texas STAAR** (tea.texas.gov): the site footer reads "© Copyright 2026 Texas Education
  Agency. All Rights Reserved."; no grant found (as the K–8 group found).
- **North Carolina** (<https://www.nc.gov/disclaimer-terms-use>, linked from dpi.nc.gov): "the
  State of North Carolina grants permission to copy and distribute non-image files,
  documents, and information for non-commercial use, provided they are copied and
  distributed without alteration and appropriately cite to the source. … Use of any photos
  or images appearing on any State of North Carolina website is strictly prohibited."
  Replicating single questions as text is an alteration, and the released items live in an
  online tutorial app on data.ncsu.edu. Rejected.
- **Louisiana LEAP 2025** (louisianabelieves.com practice-test library; doe.louisiana.gov has
  no robots.txt): the Algebra I practice-test answer key PDF and the library page state no
  reuse terms. Rejected.
- **Tennessee TCAP** (tn.gov; robots.txt allows all): the Web Policies pages (privacy,
  linking, DMCA, …) contain no reuse grant for content. Rejected.
- **Virginia** (www.doe.virginia.gov) and **Florida** (www.fldoe.org) answered 403 to
  robots.txt, so nothing further was fetched.

## Off limits, not visited

IXL, Khan Academy, Quizlet, Chegg, TPT, publisher sites (including im.kendallhunt.com
sign-in pages), OpenStax (its robots.txt disallows `/books/` for AI crawlers), and anything
behind a login or under NC/ND/all-rights-reserved terms (for example the old Illustrative
Mathematics task library, CC BY-NC-SA).
