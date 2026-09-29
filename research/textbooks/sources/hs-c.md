# Sources, group c, grades 9–12: Eureka Math high school and the commercial high-school math books

The Eureka Math / EngageNY high-school table of contents is openly licensed and complete (CC
BY-NC-SA), with a representative practice sample: the first Problem Set problem of each topic.
Big Ideas Math, enVision, HMH Into Math and Reveal Math (Algebra 1, Geometry, Algebra 2) and one
Precalculus and one Statistics text are commercial, so they have titles only. This is reference
material for the lesson chat. None of it is shipped, and lesson text stays original.

Every host's robots.txt was read first and obeyed. Requests were at most one per second per host,
with the User-Agent `EducationalCalculatorResearch/0.2 (offline study-app curriculum research;
contact angel.guerrero9635@gmail.com)`. Every page was cached in the scratch folder, so nothing
was fetched twice; the second pass built everything from that cache without new requests. No
logins, paywalls or captchas were involved. Retrieved 2026-09-28 (Eureka) and 2026-09-29
(commercial listings, read from the cache). To check the files, run
`python3 research/textbooks/tools/check_hs_c.py`.

| File                                      | What                                                                                                      |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `toc/math/eureka-hs.json`                 | Eureka / EngageNY Algebra I, Geometry, Algebra II, Precalculus: 19 modules, 72 topics, 403 lessons (full) |
| `practice/math/<grade>.eureka-hs.jsonl`   | 72 Eureka Problem Set problems, one per topic (a CC BY-NC-SA sample)                                      |
| `screenshots/eureka-hs/`                  | 42 WebP clips (0.43 MB)                                                                                   |
| `toc/math/big-ideas-hs.json`              | Big Ideas Math 2022 A1/G/A2: 36 chapters, 222 lessons (titles only)                                       |
| `toc/math/envision-aga.json`              | enVision A\|G\|A 2024: 35 topics, 194 lessons (titles only)                                               |
| `toc/math/hmh-into-hs.json`               | HMH Into Algebra 1, Geometry, Algebra 2: 29 units, 63 modules, 201 lessons (titles only)                  |
| `toc/math/reveal-hs.json`                 | Reveal Math 2020 A1/G/A2: 36 modules, 241 lessons (titles only)                                           |
| `toc/math/larson-precalculus-limits.json` | Precalculus with Limits (Cengage): 13 chapters, 80 sections (titles only)                                 |
| `toc/math/larson-farber-statistics.json`  | Elementary Statistics: Picturing the World (Pearson): 11 chapters, 28 sections (titles only)              |
| `tools/check_hs_c.py`                     | Checker: fields, skill ids, screenshots, sample marking, counts per grade                                 |

Courses are filed by grade as the taxonomy files them. Algebra 1 is grade 9, Geometry grade 10
and Algebra 2 grade 11. Eureka's Precalculus and Advanced Topics, the Precalculus text and the
Statistics text are grade 12.

## Counts per grade

| Grade | Eureka HS (modules / topics / lessons) | Practice (problems / screenshots / MB) | Big Ideas (ch / lessons) | enVision (topics / lessons) | Into Math (units / modules / lessons) | Reveal (modules / lessons) | Grade 12 texts                          |
| ----- | -------------------------------------- | -------------------------------------- | ------------------------ | --------------------------- | ------------------------------------- | -------------------------- | --------------------------------------- |
| 9     | 5 / 17 / 91                            | 17 / 8 / 0.12                          | 11 / 71                  | 11 / 62                     | 10 / 22 / 66                          | 12 / 78                    |                                         |
| 10    | 5 / 23 / 113                           | 23 / 17 / 0.10                         | 13 / 79                  | 12 / 63                     | 10 / 21 / 70                          | 12 / 90                    |                                         |
| 11    | 4 / 15 / 108                           | 15 / 7 / 0.11                          | 12 / 72                  | 12 / 69                     | 9 / 20 / 65                           | 12 / 73                    |                                         |
| 12    | 5 / 17 / 91                            | 17 / 10 / 0.10                         |                          |                             |                                       |                            | Precalculus 13 / 80; Statistics 11 / 28 |

## Eureka Math / EngageNY Mathematics, high school (`eureka-hs`): CC BY-NC-SA

- **What it is:** the 2015 EngageNY release of Eureka Math for high school (Algebra I, Geometry,
  Algebra II, Precalculus and Advanced Topics). Great Minds wrote it for the New York State
  Education Department.
- **Where it was found:** the Internet Archive item "EngageNY Mathematics Archive"
  (<https://archive.org/details/engageny-mathematics>), which has one zip per module. The archive's
  zip browser serves single files, so only the files needed were fetched: each module's listing,
  its Module Overview, and one student lesson PDF per topic. archive.org's robots.txt disallows
  only `/control/` and `/report/`. NYSED's own EngageNY archive page could not be reached from
  this environment (see the K–8 notes in `sources/c.md`).
- **License, as printed on every page of the files** (for example
  <https://archive.org/download/engageny-mathematics/Algebra%20I%20Module%201.zip/Module%201%2Falgebra-i-m1-student-materials%2Falgebra-i-m1-topic-a-lesson-1-student.pdf>):

  > "This work is derived from Eureka Math ™ and licensed by Great Minds. ©2015 Great Minds.
  > eureka-math.org This file derived from ALG I-M1-TE-1.3.0-07.2015 This work is licensed under a
  > Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License."

  We record **CC BY-NC-SA 3.0** (<https://creativecommons.org/licenses/by-nc-sa/3.0/>). Because the
  license is NonCommercial, the table of contents is kept in full for reference only, and the
  practice is a small, clearly marked sample (`"sample": true` in every record), not a full
  replication.

- **Table of contents:** built from each module's Module Overview, which gives module, topic and
  lesson titles; topic standards are in `standards`. Every topic is mapped to skills (see the
  file's `notes`).
- **Practice (`practice/math/<grade>.eureka-hs.jsonl`):** the first Problem Set problem of every
  topic, taken from the student PDF of the topic's first lesson that has a Problem Set. There are
  72 problems for 72 topics (G9 17, G10 23, G11 15, G12 17), and every record carries the footer
  attribution and the file's "derived from" id.
  - Each record was read against its page image. The PDFs typeset math in a symbol font that
    extracts badly: exponents are lost, fractions come out stacked, and overbars and matrices
    break. For 55 records the question text was therefore typed from the page, as published (the
    printed misspelling "represesnt" in Precalculus M5 Topic C is kept). Fractions are written
    as 3/4, exponents as x² or 2^(x−3), segments as "segment AB", arcs as "arc CD", and
    matrices row by row with ";" between rows. Tables are written one row per line, and figure-only
    parts are named in brackets. Each record's `notes` says which of these conventions it uses.
  - A problem that continues onto the next page is joined into one question, and its screenshot
    joins both page clips (Algebra II M3 Topic E, Precalculus M3 Topic C). In Algebra II M4
    Topic A the Problem Set opens with a scenario card, and problem 1 is on the next page, so the
    record holds both. Where problems 1–6 share a grid, only problem 1 is kept (noted).
  - Screenshots are clips of the problem from the PDF page, at most 640 px wide, saved as WebP at
    quality 70. There are 34 problems whose figure, graph or table carries the question, plus 8
    text problems whose math the plain text cannot show well (stacked fractions, exponents,
    matrices), for 42 in all and 0.43 MB. Blank answer grids do not count as figures (Algebra II M1
    Topic D, Precalculus M1 Topic B).
  - `picture.description` is our own short description, because the PDFs have no alt text.
    `answer` is null, because the answers are in the teacher materials, which were not extracted.
    `type` is our own classification.
  - `skillId` is the topic's first skill, except in 22 records where the problem itself fits another skill
    better (for example the Ferris wheel problem → `m.11.trig-graphs`, a linear system →
    `m.8.systems-linear`). Six records say "Loose fit" in `notes`: a floor (sawtooth)
    function, area as a count of unit squares, lines and planes in space, approximating a sum of
    irrational numbers, types of statistical studies, and linear transformations of the line.

## Commercial programs (titles only)

All six are all-rights-reserved textbooks. Only chapter, topic, module, unit, lesson and section
**titles** and their numbers are stored, as our own table of contents. No problems, lesson text,
images or PDFs were copied. Each unit's `url` cites the page its titles came from. Math that the
listing typesets in HTML is written plainly (for example `x² + bx + c`, `nth Roots`).

The public listing that covers these courses is IXL's textbook skill-plan pages,
`https://www.ixl.com/math/skill-plans/<plan>`. robots.txt (<https://www.ixl.com/robots.txt>)
disallows `/servlets`, `/practice/...`, `/signin/...` and similar paths for `User-agent: *`, but
not `/math/skill-plans/`, and the pages need no login. They name each textbook chapter and lesson
together with the IXL skills aligned to it. We keep only the textbook's own titles and numbers,
not IXL's skill names. IXL's statement on every plan, for example
<https://www.ixl.com/math/skill-plans/big-ideas-math-2022-algebra-1>:

> "This document includes the IXL® skill alignments to Big Ideas Learning's Big Ideas Math
> curriculum. IXL provides skill alignments as a service to teachers, students, and parents. The
> skill alignments are provided by IXL and are not affiliated with, sponsored by, reviewed,
> approved or endorsed by Big Ideas Learning or any other third party. IXL® and IXL Learning® are
> registered trademarks of IXL Learning, Inc. All other intellectual property rights (e.g.,
> unregistered and registered trademarks and copyrights) are the property of their respective
> owners."

The other plans carry the same text, naming the publisher and the curriculum as "Savvas Learning
Company's enVision Mathematics (2024)", "Houghton Mifflin Harcourt's Into Math", "McGraw Hill's
Reveal Math", "Cengage Learning's Precalc with Limits" and "Pearson's Elementary Statistics:
Picturing the World". IXL lists only the lessons it has aligned skills to, so a lesson with no IXL
skill may be missing. IXL's "Checkpoint opportunity" rows are its own and were dropped.

| Program (`id`)                                                          | Publisher, edition                   | IXL plans (unit `url`)                                     |
| ----------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------- |
| Big Ideas Math (`big-ideas-hs`)                                         | Big Ideas Learning, 2022             | `big-ideas-math-2022-{algebra-1,geometry,algebra-2}`       |
| enVision A\|G\|A (`envision-aga`)                                       | Savvas Learning Company, ©2024       | `envision-mathematics-2024-{algebra-1,geometry,algebra-2}` |
| HMH Into Math (`hmh-into-hs`)                                           | Houghton Mifflin Harcourt            | `into-math-{algebra-1,geometry,algebra-2}`                 |
| Reveal Math (`reveal-hs`)                                               | McGraw Hill, 2020                    | `reveal-math-2020-{algebra-1,geometry,algebra-2}`          |
| Precalculus with Limits (`larson-precalculus-limits`)                   | Cengage Learning, edition not stated | `precalc-with-limits-precalculus`                          |
| Elementary Statistics: Picturing the World (`larson-farber-statistics`) | Pearson, edition not stated          | `elementary-statistics`                                    |

- **Into Math:** the structure is Unit → Module (numbered through the course) → Lesson. Skills
  are mapped per module, and a unit's skills are the union of its modules' skills.
- **Big Ideas:** IXL lists Lesson 5.4 of Algebra 1 as "Solving Specials Systems of Linear
  Equations". It is kept as listed.
- **Grade 12 texts:** the cached IXL listings had four Precalculus plans and one Statistics plan.
  We chose Cengage's 13-chapter _Precalc with Limits_ because it also covers limits, conics,
  polar coordinates, 3-D vectors and statistics. We did not use _Precalculus with Limits: A
  Graphing Approach_, Sullivan's _Precalculus Enhanced with Graphing Utilities_ or Stewart's
  _Precalculus: Mathematics for Calculus_. IXL names the publisher but not the author or edition.
  The authors in the curriculum names (Ron Larson; Ron Larson and Betsy Farber) are these books'
  known authors and are not taken from the IXL page. For Statistics Chapters 7, 8, 10 and 11
  (hypothesis testing, chi-square, nonparametric tests), IXL gives only a section range such as
  "Sections 7.1 - 7.5". Those chapters therefore have no section titles, and their notes say so.
- **Skills:** every unit is mapped, some loosely, and those units say why in `notes`. The loose
  fits are:
  - solving linear equations in one variable, mapped to `m.8.multi-step-equations`
  - piecewise and step functions, mapped to `m.9.absolute-value`
  - two-way tables, mapped to `m.10.conditional-probability`
  - descriptive statistics, mapped to `m.6.center-spread`
  - triangle relationships and quadrilaterals, mapped to `m.10.proofs`
  - surface area, mapped to `m.10.volume-derivations` and `m.8.volume-curved`
  - Reveal Algebra 1 Module 1 (expressions review) and Reveal Geometry Module 2
  - key features of functions
  - three-dimensional analytic geometry
  - confidence intervals, chi-square and nonparametric tests

## Taxonomy gaps noticed (for `TAXONOMY_ISSUES.md`, not changed here)

Every high-school book teaches the following, but the grades 9–12 skills have no entry for them:

- solving linear equations and inequalities in one variable (grade 9)
- piecewise and step functions
- two-way frequency tables
- descriptive statistics in high school (box plots, standard deviation, shape)
- triangle relationships: bisectors, medians, midsegments, triangle inequalities
- properties of quadrilaterals and polygons
- parallel lines and transversals in proofs
- surface area of pyramids, cones and spheres
- study design (observational study, survey, experiment)
- three-dimensional coordinates and lines and planes in space
- partial fractions, linear programming and mathematical induction (Precalculus)
- confidence intervals and chi-square tests (Statistics)

## Skipped, and why

- **NYSED's EngageNY archive page:** not reachable from this environment (see `sources/c.md`). The
  archive.org copy was used instead. OER Commons answered 403 and was not used.
- **Eureka Math² and Great Minds' current editions:** separate commercial products, so not used.
- **Eureka answers:** they are in the teacher materials, which were not extracted, so `answer` is
  null.
- **Publisher platforms** (Big Ideas Math online, Savvas Realize, HMH Ed, McGraw Hill ConnectED,
  Cengage and Pearson sites): sign-in only for tables of contents, so not used. No publisher PDFs
  were stored.
- **Other IXL Precalculus plans** (A Graphing Approach, Sullivan, Stewart): one Precalculus text was
  enough (see above).
- **Unofficial answer-key and textbook-copy sites:** not official sources, so not used.
