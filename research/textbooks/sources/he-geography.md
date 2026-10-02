# College sources: Geography (research group R3)

Reference only; nothing here is part of the app (`research/README.md`). Plan:
`docs/plans/he.earth-geography.md` (Physical Geography, Human Geography, Cartography, GIS,
Climatology, Remote Sensing). Fetching rules, dates, User-Agent and the host table are as in
`he-earth-science.md` (same session, 2026-10-02). Records: `research/questions/college/geography.jsonl`
(227 records); crosswalk: `research/textbooks/college/geography.md`.

## Hosts and robots.txt (geography only)

| Host                                                | robots.txt                                                               | Used                                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| saylordotorg.github.io                              | none (404)                                                               | yes: Campbell and Shin licence page and 18 section pages                                              |
| apcentral.collegeboard.org                          | Drupal default (disallows `/core/`, `/admin/`, `/search/`, `/user/*`, …) | yes: AP Human Geography and AP Environmental Science past-exam pages and 2023–2025 free-response PDFs |
| natural-resources.canada.ca                         | Drupal default                                                           | yes: remote-sensing tutorial pages, the tutorial PDF and the terms page                               |
| www.e-education.psu.edu                             | `Crawl-delay: 10`; Drupal default                                        | DiBiase home page only; lesson quizzes need a Penn State login (not used)                             |
| pressbooks.pub (Dastrup, _Human Geography_)         | readable (disallows `/wp/wp-admin/`, `/feed/`, …)                        | **the book itself answered 403 "Attention Required! Cloudflare"**; not read                           |
| slcc.pressbooks.pub (Dastrup, _Physical Geography_) | 403 to every request, robots.txt included                                | not read; LibreTexts copy used                                                                        |
| open.oregonstate.education (Schmittner)             | 403 to every request, robots.txt included                                | not read; LibreTexts copy used                                                                        |

## Textbooks

### Dastrup, _Physical Geography and Natural Disasters_ (CC BY-NC-SA 4.0) — `dastrup-physical-geography`

- Read on LibreTexts (10 chapters, 63 sections); pages state "shared under a CC BY-NC-SA 4.0
  license … by Adam Dastrup". Confirms the plan. Titles and mapping only; no review questions on
  these pages (no records). Biogeography has no chapter.

### Dastrup, _Introduction to Human Geography_ (CC BY 4.0 per the plan) — not read

- pressbooks.pub served a Cloudflare challenge page for the book (its robots.txt was readable
  and allows `/humangeography/`); the SLCC copy is blocked. **Discrepancy 5 (CC BY on
  pressbooks.pub vs CC BY-NC-SA on SLCC) could not be checked**: neither copy was readable.
  No Human Geography textbook was read; the course's 34 records are NAEP Geography (text) and AP
  Human Geography (type).

### Schmittner, _Introduction to Climate Science_ — `schmittner-introduction-to-climate-science`

- Read on LibreTexts: 11 chapters (one page each). Each page states "shared under a CC BY-NC-SA
  4.0 license … by Andreas Schmittner (Oregon State University, Open Educational Resources
  Unit)". The plan read **CC BY-NC 4.0** on the OSU copy (now blocked): both are NonCommercial,
  so the record is type only either way. Recorded 24 type-only questions (`SCHM-<ch>-Q<n>`) from
  the chapters' "Questions" boxes.

### Campbell and Shin, _Essentials of Geographic Information Systems_ (CC BY-NC-SA 3.0) — `campbell-shin-essentials-of-gis`

- Titles from LibreTexts (pages state CC BY-NC-SA 3.0); exercises from the Saylor copy, whose
  licence page reads: "This text was adapted by Saylor Academy under a Creative Commons
  Attribution-NonCommercial-ShareAlike 3.0 License without attribution as requested by the work's
  original creator or licensor." Confirms the plan's "CC BY-NC-SA 3.0 (to confirm)". 19
  type-only records (`CAMPBELL-…`).

### DiBiase et al., _The Nature of Geographic Information_ (CC BY-NC-SA 3.0) — `dibiase-nature-of-geographic-information`

- LibreTexts pages state CC BY-NC-SA 3.0 (confirms the plan's "CC BY-NC-SA"). Chapter titles and
  mapping; no exercises on these pages.

### _Fundamentals of Remote Sensing_ (Natural Resources Canada) — `nrcan-fundamentals-of-remote-sensing`

- Read: the tutorial page and its PDF
  (<https://natural-resources.canada.ca/sites/nrcan/files/earthsciences/pdf/resource/tutor/fundam/pdf/fundamentals_e.pdf>, 258 pages).
- Terms (<https://natural-resources.canada.ca/terms-conditions>): "Permission to reproduce
  Government of Canada works, in part or in whole, and by any means, for personal or public
  non-commercial purposes, or for cost-recovery purposes, is not required, unless otherwise
  specified in the material you wish to reproduce. A reproduction means making a copy of
  information in the manner that it is originally published – the reproduction must remain as
  is, and must not contain any alterations whatsoever." **Discrepancy**: the plan and brief listed
  the Open Government Licence – Canada; the page's own terms are non-commercial, unaltered
  reproduction. Treated as a custom licence: type only. 20 records (`NRCAN-FRS-…`) from the
  Whiz Quizzes.

### Remote Sensing (Knudby), LibreTexts — skipped

- The chapter pages state "shared under a not declared license": skipped under the rule for
  undeclared LibreTexts pages.

### MIT OpenCourseWare (CC BY-NC-SA 4.0)

- 11.205 Introduction to Spatial Analysis (Fall 2019), 11.520 A Workshop on Geographic
  Information Systems (Fall 2005; its in-lab tests of 2004 and 2005), 1.963 Environmental
  Engineering Applications of GIS (Fall 2004); plus geography-topic records from 12.003, 12.340,
  12.808 and 2.011 (see `he-earth-science.md`). Licence as there.

### Not read

- Snyder, _Map Projections — A Working Manual_; the Landsat 8–9 Data Users Handbook; Penn State
  GEOG 486/586/883 notes (login for quizzes); NASA ARSET; commercial titles (Christopherson,
  Rubenstein, Slocum, Bolstad, Lillesand): not reached in the time available; no titles-only files.

## Question sources

| Source                                                    | Licence                                                        | Content | Records in `geography.jsonl`          |
| --------------------------------------------------------- | -------------------------------------------------------------- | ------- | ------------------------------------- |
| NAEP Geography, grades 8 and 12 (NQT)                     | public domain (NQT statement, `../../questions/SOURCES.md` §1) | text    | 68 (11 more in `earth-science.jsonl`) |
| AP Human Geography free response 2023–2025 (sets 1 and 2) | © College Board ("© 2024 College Board" on every page)         | type    | 19                                    |
| Stull exercises                                           | CC BY-NC-SA 4.0                                                | type    | 29                                    |
| Schmittner chapter questions                              | CC BY-NC-SA 4.0 (LibreTexts) / CC BY-NC 4.0 (OSU)              | type    | 24                                    |
| NRCan Whiz Quizzes                                        | Government of Canada terms                                     | type    | 20                                    |
| Campbell and Shin exercises                               | CC BY-NC-SA 3.0                                                | type    | 19                                    |
| MIT OCW                                                   | CC BY-NC-SA 4.0                                                | type    | 42                                    |
| Earle                                                     | CC BY 4.0                                                      | text    | 5                                     |
| NAEP grade 12 science (cross-list)                        | public domain                                                  | text    | 1                                     |

- **NAEP Geography**: NQT `subjectgradeinfo` (POST, `{"SubjectCode": "GEO", "GradeStr": "12" | "8"}`),
  `getTabular` (81 grade 12 and 137 grade 8 items listed), then `GetItem` and
  `GetItemScoreGuide` per chosen item; no sample responses or performance data. 79 items chosen
  for college bridge topics (map reading, climate graphs, population pyramids, diffusion, urban
  models). Third-party check: no item chosen carries a © or "courtesy" line. Items that refer to
  the NAEP atlas (not stored) say so in the question text ("[The item refers to the NAEP atlas,
  not stored.]"); 2017+ items are images whose text is NCES's alt text (noted per record), with
  the "Screenshot of eNAEP geography item" prefix removed. `answer` is the key or the top score
  level of the scoring guide.
- **AP**: the free-response PDFs were read for question types; no text, numbers or figures are
  stored (`question` null), per the brief. The AP Environmental Science 2024 and 2025 set-1 PDFs
  were read; their questions (stream oxygen, protein production, energy) fit no college
  geography topic closely enough and were not recorded.
- Not used: IGeO tests (terms unclear; not fetched); Penn State quizzes (login).
