# College sources: Classical engineering mechanics (research group R3)

Reference only; nothing here is part of the app (`research/README.md`). Plan:
`docs/plans/he.mechanical.md`, courses 1–9 (Statics, Dynamics, Mechanics of Materials, Materials
Science, Engineering Programming, Engineering Graphics and CAD, Numerical Methods, Advanced Solid
Mechanics, Finite Element Analysis). Everything was fetched on 2026-10-02 (UTC) with `curl`
through the environment's proxy, sequentially, at most one request per second per host (five
seconds on LibreTexts, ten on ncees.org, thirty on ahtt.mit.edu, as their robots.txt files ask),
with the User-Agent `EducationalCalculatorResearch/0.3 (offline study-app research; contact …)`.
robots.txt was read first on every host and obeyed. Records:
`research/questions/college/classical.jsonl` (489 records); tables of contents:
`research/textbooks/toc/college/*.json`; crosswalk: `research/textbooks/college/classical.md`;
marks: `research/questions/college/marks/mechanical.md`. The thermal-fluid and design courses
are in `he-mechanical.md`.

## Hosts and robots.txt

| Host                                                                                        | robots.txt                                                                                                | Used                                                                                |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| engineeringstatics.org                                                                      | none (404)                                                                                                | yes: front matter, chapter pages and the Numbas exercise pages                      |
| eng.libretexts.org                                                                          | `Crawl-delay: 5`, `Request-rate: 1/5`; disallows `/Special:*`, `/@*` (except files) and operational paths | yes, 5 s apart: book, chapter and exercise pages                                    |
| workforce.libretexts.org                                                                    | the same LibreTexts rules (`Crawl-delay: 5`)                                                              | yes: two drafting books' indexes, chapters and self-tests                           |
| nm.mathforcollege.com                                                                       | `Allow: /`                                                                                                | yes: chapter pages of chapters 03–08 and the multiple-choice test PDFs              |
| www.doitpoms.ac.uk                                                                          | disallows the `tlplib` intro and tag listing pages (among admin paths)                                    | yes: the `questions.php` page of 27 teaching packages only                          |
| ocw.mit.edu                                                                                 | `User-Agent: * Allow: /`                                                                                  | yes: course pages and problem-set, quiz and exam PDFs (no solutions)                |
| engineeringmechanicsoer.github.io                                                           | none (GitHub Pages 404 page)                                                                              | yes: the Strength of Materials index, chapters 12 and 14, and 12 problem pages      |
| ncees.org                                                                                   | `Crawl-delay: 10`; disallows `/*?`, `/calendar/action*`, `/events/action*`, `/cdn-cgi*`                   | yes, 10 s apart: the six FE exam specification PDFs                                 |
| pythonnumericalmethods.berkeley.edu                                                         | none (404)                                                                                                | home page only (licence line); no TOC written                                       |
| nptel.ac.in                                                                                 | `User-agent: * Disallow:` (allows all); archive.nptel.ac.in serves an HTML page at /robots.txt            | robots only; the course pages are script-rendered and the licence unclear: not used |
| mechanicsmap.psu.edu                                                                        | **connection reset** on every attempt                                                                     | no; Mechanics Map was read on LibreTexts                                            |
| uw.pressbooks.pub (Ford, _Engineering Graphics_), wtcs.pressbooks.pub (_Blueprint Reading_) | **403** from the site's bot protection, robots.txt included                                               | no; drafting questions came from two Workforce LibreTexts books instead             |
| potto.org (Bar-Meir)                                                                        | **TLS certificate expired**                                                                               | no (verification was not disabled)                                                  |

The 403s and resets came from the sites themselves, not from this environment's proxy. Reading an
openly licensed book on LibreTexts, a separate publisher whose robots.txt allows it, is recorded
here so the owner can judge it; no block was worked around on the blocked host.

## Textbooks

### Baker and Haynes, _Engineering Statics: Open and Interactive_ (CC BY-NC-SA 4.0) — `baker-haynes-engineering-statics`

- Read: the book's own table of contents (10 chapters, 81 sections) and the nine "Exercises"
  pages with their Numbas exams.
- Licence, from the preface: "Engineering Statics: Open and Interactive is licensed under a
  Creative Commons Attribution-Non Commercial-Share Alike 4.0 International License". Confirms
  the plan.
- Recorded: 111 type-only records (`ES-C<ch>-<n>`), every exercise of chapters 2–10 (100 under
  Statics, 11 shear-and-moment exercises under Mechanics of Materials #3). The Numbas items
  randomize their numbers, so ranges are given as the generator's sizes.

### Moore et al., _Mechanics Map_ (CC BY-SA 4.0) — `moore-mechanics-map`

- Read on LibreTexts (15 chapters and 2 appendices, 98 sections; mechanicsmap.psu.edu reset the connection).
- Licence, as each page states: "… is shared under a CC BY-SA 4.0 license and was authored,
  remixed, and/or curated by Jacob Moore and Contributors". The book page: "All content is
  licensed under a …" (CC BY-SA). The plan's "to confirm" is confirmed for the LibreTexts copy.
- Recorded: 94 records **with text and the book's answers** (CC BY-SA 4.0, attributed), every
  chapter homework problem of chapters 1–14 (`MM-C<ch>-<n>`); the figure is described in
  `picture.description` from the page's own alt text.

### Roylance, _Mechanics of Materials_ (CC BY-NC-SA 4.0) — `roylance-mechanics-of-materials`

- Read on LibreTexts: 6 chapters, 24 sections. Licence line: "shared under a CC BY-NC-SA 4.0
  license and was authored, remixed, and/or curated by David Roylance". Confirms.
- Recorded: 66 type-only records from the section exercises (`ROY-<sec>-<n>`; 57 here, 9 in
  `mechanical.jsonl` for machine design, vibrations and manufacturing).

### Lord et al., _Strength of Materials_ (Virginia Tech, CC BY-NC-SA 4.0) — `lord-strength-of-materials`

- Read: index (15 chapters), chapters 12 and 14, and 12 pages of the companion _Problem Set for
  Strength of Materials_. Licence: "Strength of Materials by James K. Lord, Amy Richardson, Sneha
  Davison, and David A. Dillard is licensed under a Creative Commons
  Attribution-NonCommercial-ShareAlike 4.0 International License, except where otherwise noted."
  Problem statements say "[Problem adapted from © Kurt Gramoll CC BY NC-SA 4.0]". Confirms.
- Transformation (ch. 12) and thin-walled vessels (ch. 13) are chapters of their own, and so is
  combined loading (ch. 14): the plan's question is answered.
- Recorded: 8 type-only records (`SOM-…`; 5 here, 3 in mechanical).

### Wierzbicki, _Structural Mechanics_; Steeneken, _Introductory Dynamics_; Yano et al., _Math, Numerics, and Programming_

- `wierzbicki-structural-mechanics` (11 chapters; CC BY-NC-SA 4.0 per page), `steeneken-introductory-dynamics`
  (14 chapters; the page reads "shared under a CC BY 4.0 license … by Peter Steeneken") and
  `patera-math-numerics-and-programming` (29 chapters in 6 units; CC BY-NC-SA 4.0), all on
  LibreTexts. Chapter lists and topic mapping only: none has exercise sections on LibreTexts
  (Steeneken's would have allowed text). Their problem types come from MIT OCW 2.080J, 2.003SC and
  2.086.

### Kaw et al., _Holistic Numerical Methods_ — `kaw-holistic-numerical-methods`

- Read: 33 chapter pages of chapters 03–08 and the 20 multiple-choice test PDFs of those chapters.
- **Licence discrepancy resolved:** every page reads "Based on work at Holistic Numerical Methods
  licensed under an Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)"
  and links `creativecommons.org/licenses/by-nc-nd/4.0/`. The plan said CC BY-NC-SA 3.0 US. The
  stricter licence changes nothing here: type only either way.
- Recorded: 72 type-only records (`KAW-<quiz>-<n>`).

### DoITPoMS teaching and learning packages — `doitpoms-teaching-and-learning-packages`

- Read: the questions page of 27 packages (diffusion, crystallography, Miller indices, phase
  diagrams, slip, fracture, forming, casting, additive manufacturing, FEM and others).
- **Licence discrepancy resolved:** the site footer reads "© 2004-2026 University of Cambridge.
  Except where otherwise noted, content is licensed under a Creative Commons Attribution -
  NonCommercial-ShareAlike 4.0 International." The plan said CC BY-NC-SA 2.0 UK (an older
  version). Type only.
- Recorded: 64 type-only records (`DOIT-…`; 52 here, 12 in mechanical).

### Drafting and CAD: Workforce LibreTexts

- `fundamentals-drawings-and-specifications` (7 chapters): pages state "shared under a CC BY 4.0
  license". Recorded 12 self-test items **with text and choices** (`FDS-…`); the book gives no
  answer key (answer null).
- `baumback-introduction-to-drafting-and-autodesk-inventor` (5 parts): pages state "shared under a
  CC BY license … by Wally Baumback (BCcampus)"; the Module 26 test page states "not declared"
  and was not used. Recorded 5 generic CAD items with text (`BAUM-…`); most of the tests are
  Inventor menu questions and were not recorded.
- The plan's CAD sources (Ford, UW Tacoma; _Blueprint Reading_, WisTech) are on blocked
  Pressbooks hosts (above).

### MIT OpenCourseWare (CC BY-NC-SA 4.0)

- Licence: each course page's metadata links `creativecommons.org/licenses/by-nc-sa/4.0/`.
  Confirmed. Third-party content inside the files (figures "© … All rights reserved. This content
  is excluded from our Creative Commons license") was not used.
- Courses with records here (each has `toc/college/mit-ocw-*.json`): 2.003SC Engineering Dynamics
  (Fall 2011), 2.002 Mechanics and Materials II (Spring 2004), 2.007 Design and Manufacturing I
  (Spring 2009, the CAD and mechanism items), 2.086 Numerical Computation for Mechanical Engineers
  (Fall 2014), 2.092 Finite Element Analysis of Solids and Fluids I (Fall 2009), 3.032 Mechanical
  Behavior of Materials (Fall 2007), 3.35 Fracture and Fatigue (Fall 2003), 6.0001 Introduction to
  Computer Science and Programming in Python (Fall 2016).
- Harvested (problem sets fetched) but not recorded: 2.001 (Fall 2006), 1.050 (Fall 2007), 2.080J (Fall 2013),
  2.032 (Fall 2004), 3.091 (Fall 2018), 3.11 (Fall 1999), 3.012 (Fall 2005), 18.330 (Spring
  2012): the targets were met from the sources above first. Problems the courses cite from
  commercial texts ("Problem 7.90, VW, S&B") were not recorded.

### NCEES FE exam specifications — `ncees-fe-*-specifications` (six files)

- Read: the Mechanical, Civil, Chemical, Electrical and Computer, Environmental and Other
  Disciplines CBT specifications (topic lists and question counts per knowledge area only).
  © NCEES, free to view. No practice items were read.
- **Discrepancy 8 resolved (FE Reference Handbook):** the NCEES page says "Create an account or
  log in to MyNCEES to register for the exam and download your free copy of the FE Reference
  Handbook". It sits behind a login, so it was not read at all; notation comes from the open
  texts.

### Not read

- _Python Programming and Numerical Methods_ (Kong, Siauw, Bayen): the site reads © Elsevier
  (code under the MIT licence); titles-only TOC not written in the time available.
- Bower, _Applied Mechanics of Solids_; Felippa, _Introduction to Finite Element Methods_; _Essential
  Mechanics_ (RIT): not reached. Commercial texts (Hibbeler, Beer and Johnston, Callister, Chapra
  and Canale, Logan): no titles-only files.

## Question sources

| Source                                              | Licence         | Content | Records |
| --------------------------------------------------- | --------------- | ------- | ------- |
| Engineering Statics (Numbas exercises)              | CC BY-NC-SA 4.0 | type    | 111     |
| Mechanics Map (LibreTexts) homework problems        | CC BY-SA 4.0    | text    | 94      |
| Kaw, multiple-choice tests                          | CC BY-NC-ND 4.0 | type    | 72      |
| Roylance (LibreTexts) exercises                     | CC BY-NC-SA 4.0 | type    | 57      |
| DoITPoMS questions                                  | CC BY-NC-SA 4.0 | type    | 52      |
| MIT OCW (eight courses above)                       | CC BY-NC-SA 4.0 | type    | 81      |
| Fundamentals: Drawings and Specifications; Baumback | CC BY 4.0       | text    | 17      |
| Strength of Materials problem set                   | CC BY-NC-SA 4.0 | type    | 5       |

By course (target in brackets): statics 164 (40), dynamics 52 (40), mechanics of materials 50
(40), materials science 48 (30), numerical methods 82 (30), advanced solid mechanics 26 (20),
finite element analysis 20 (20), engineering programming 20 (20), CAD 27 (20). Not used: NCEES
practice items and the FE Reference Handbook (off limits), Chegg-type sites, solution manuals.
