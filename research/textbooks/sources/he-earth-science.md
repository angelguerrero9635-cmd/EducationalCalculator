# College sources: Earth Science (research group R3)

Reference only; nothing here is part of the app (`research/README.md`). Plan:
`docs/plans/he.earth-geography.md` (Physical Geology, Historical Geology, Mineralogy, Meteorology,
Oceanography, Hydrology, Geophysics). Everything was fetched on 2026-10-02 (UTC) with `curl`
through the environment's proxy, sequentially, at most one request per second per host (five
seconds on LibreTexts, whose robots.txt asks for it), with the User-Agent
`EducationalCalculatorResearch/0.3 (offline study-app research; contact …)`. robots.txt was read
first on every host and obeyed; what it said is recorded below. Records:
`research/questions/college/earth-science.jsonl` (242 records); tables of contents:
`research/textbooks/toc/college/*.json`; crosswalk: `research/textbooks/college/earth-science.md`;
marks: `research/questions/college/marks/earth-geography.md`.

## Hosts and robots.txt

| Host                                                               | robots.txt                                                                                                                              | Used                                                                                                                                                           |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| geo.libretexts.org                                                 | `Crawl-delay: 5`, `Request-rate: 1/5`; disallows `/Special:*`, `/Template:*`, `/User:*`, `/deki/`, `/@*` (except files) and `*action=*` | yes, 5 s between requests; content pages only                                                                                                                  |
| www.eoas.ubc.ca (Stull)                                            | Drupal default: disallows `/core/`, `/profiles/`, `/admin/`, `/search/`, `/user/*`                                                      | yes: book page and chapter PDFs                                                                                                                                |
| ocw.mit.edu                                                        | `User-Agent: * Allow: /`                                                                                                                | yes: course pages, sitemaps, problem-set and exam PDFs (no solutions)                                                                                          |
| www.nationsreportcard.gov                                          | none (404)                                                                                                                              | yes: NQT API, as `../../questions/SOURCES.md` §1                                                                                                               |
| opengeology.org                                                    | disallows `/wp-admin/` only                                                                                                             | home page of the textbook only                                                                                                                                 |
| pubs.usgs.gov                                                      | disallows `/archive/`                                                                                                                   | WSP 2220 landing page only                                                                                                                                     |
| fc79.gw-project.org                                                | disallows `/wp-admin/` only                                                                                                             | home page only (no time to read the book)                                                                                                                      |
| gpg.geosci.xyz                                                     | none (404)                                                                                                                              | home page only; no exercises found                                                                                                                             |
| opentextbc.ca (Earle 2e)                                           | **robots.txt returned a Cloudflare challenge (403)** twice                                                                              | no; the home page had been fetched once before the second robots.txt attempt, and was used only to read its licence line. Earle was read on LibreTexts instead |
| rwu.pressbooks.pub (Webb), open.oregonstate.education (Schmittner) | **403 "Request blocked" (CloudFront) to every request, robots.txt included**                                                            | no; both books were read on LibreTexts                                                                                                                         |
| www.ieso-info.org, www.geoolympiad.org                             | IESO serves an HTML page at /robots.txt; IGeO: `Crawl-delay: 10`                                                                        | not used (terms unclear; time)                                                                                                                                 |

The 403s above came from the sites' own bot protection (CloudFront, Cloudflare), not from this
environment's proxy (its status page showed no denial for them). Reading the same openly licensed
book on LibreTexts, a separate publisher whose robots.txt allows it, is recorded here so the owner
can judge it; no block was bypassed on the blocked host itself.

## Textbooks

### Earle, _Physical Geology_ (open; CC BY 4.0) — `earle-physical-geology`

- Read: <https://geo.libretexts.org/Bookshelves/Geology/Physical_Geology_(Earle)>, all 22
  chapters and 128 sections (the LibreTexts edition of the BCcampus first edition).
- Licence, as each page states: "This page titled 1.7: Summary … is shared under a CC BY 4.0
  license and was authored, remixed, and/or curated by Steven Earle (BCCampus) via source content
  that was edited to the style and standards of the LibreTexts platform." Every Earle page sampled
  (one per chapter) states CC BY 4.0. The BCcampus 2nd edition's home page (fetched once) reads:
  "© 2019 Steven Earle The CC licence permits you to retain, reuse, copy, redistribute, and revise
  this book … Physical Geology – 2nd Edition by Steven Earle is used under a Creative Commons
  Attribution 4.0 International Licence." The plan's "CC BY 4.0 (checked)" is confirmed.
- Recorded: 95 question records with text (CC BY 4.0, attributed): exercise boxes (`EARLE-EX…`)
  and end-of-chapter review questions (`EARLE-RQ…`). Answers are in the book's appendices, which
  were not fetched (`answer` null). Exercises whose question is carried by a figure (8.1, 12.2,
  12.3, 14.1, 14.2, 15.3, 18.5, 19.2, 19.4) were skipped, as K–12 did with figure-only items.

### Stull, _Practical Meteorology_ (CC BY-NC-SA 4.0) — `stull-practical-meteorology`

- Read: <https://www.eoas.ubc.ca/books/Practical_Meteorology/> and the v1.02b PDFs of the
  contents and chapters 1–13 and 21.
- Licence, from the book page: "Creative Commons License: This work is licensed under a Creative
  Commons Attribution-NonCommercial-ShareAlike 4.0 International License. 'Practical Meteorology:
  An Algebra-based Survey of Atmospheric Science' and 'Meteorology for Scientists and Engineers,
  3rd Edition' by Roland Stull are licensed under a Creative Commons
  Attribution-NonCommercial-ShareAlike 4.0 International License." The cover photo is "copyright ©
  by Warren Faidley / weatherstock.com. Used with permission." (excluded). Confirmed as the plan
  stated.
- Recorded: 87 type-only records (`STULL-<ch>-<ex>`), from the "Apply" (A) exercises, which are
  the numerical ones; the B (web data), E and S exercises were read but not recorded.

### Webb, _Introduction to Oceanography_ (CC BY 4.0) — `webb-introduction-to-oceanography`

- Read on LibreTexts (<https://geo.libretexts.org/Bookshelves/Oceanography/Introduction_to_Oceanography_(Webb)>):
  14 chapters, 59 sections. The book page and the sections read state "shared under a CC BY 4.0
  license … by Paul Webb"; one chapter page (1, Introduction to the Oceans) states "a not declared
  license": only its title is used.
- The publisher's copy is blocked (above), and the LibreTexts sections carry no review
  questions, so **no Webb question records** (target 30). Oceanography reached 25 records from
  Earle, MIT OCW 2.011 and 12.808, and NAEP cross-lists.

### Perkins et al., _Mineralogy_ (CC BY-NC-SA 4.0) — `perkins-mineralogy`

- Read on LibreTexts (14 chapters, 94 sections; pages state CC BY-NC-SA 4.0, "authored, remixed,
  and/or curated by Dexter Perkins"). Confirms the plan's "to confirm". Titles and topic mapping
  only; the sections read have no exercises (no records).

### Johnson et al., _Introduction to Historical Geology_ and _An Introduction to Geology_ (CC BY-NC-SA 4.0)

- `johnson-historical-geology` (13 chapters, 54 sections) and `johnson-introduction-to-geology`
  (16 chapters, 95 sections), read on LibreTexts; pages state CC BY-NC-SA 4.0 (confirms the
  plan). Titles and mapping only. opengeology.org (robots.txt allows) was read for its textbook
  home page only.

### MIT OpenCourseWare (CC BY-NC-SA 4.0)

- Licence: each course page's metadata reads `"license": "https://creativecommons.org/licenses/by-nc-sa/4.0/"`
  and its footer links "Creative Commons License" and "Terms and Conditions". Confirmed (the
  brief's open point 7 for these courses). Third-party items inside course files ("Image removed
  due to copyright restrictions", figures "Courtesy of …", "taken from Introduction to
  Seismology [Shearer]") were not used.
- Courses read (each has its own `toc/college/mit-ocw-*.json`, units = the assignments read):
  12.001 Introduction to Geology (Fall 2013), 12.003 Atmosphere, Ocean and Climate Dynamics (Fall
  2008), 12.090 The Environment of the Earth's Surface (Spring 2007), 12.108 Structure of Earth
  Materials (Fall 2004), 12.163 Surface Processes and Landscape Evolution (Fall 2004), 12.201
  Essentials of Geophysics (Fall 2004), 12.340 Global Warming Science (Spring 2012), 12.510
  Introduction to Seismology (Spring 2010), 12.808 Introduction to Observational Physical
  Oceanography (Fall 2004), 1.72 Groundwater Hydrology (Fall 2005), 2.011 Introduction to Ocean
  Science and Engineering (Spring 2006). The brief's numbers were confirmed against the OCW
  sitemap; 12.520 Geodynamics (graduate) and 12.571 (project-based, no problem sets) were read and
  not recorded for this group.
- 12.201's PDFs have an unreadable text layer (font encoding); pages were rendered to images and
  read (noted per record). 1.72 PS1 and PS3 are scanned images and were skipped.
- Recorded: type only (`OCW-<course>-…`), no solutions fetched.

### Not read (time, or titles only by rule)

- Freeze and Cherry, _Groundwater_ (CC BY-NC-ND 4.0, the plan checked it): home page only.
- Heath, _Basic Ground-Water Hydrology_ (USGS WSP 2220): landing page only; public domain not
  re-confirmed. Bulletin 17C, Margulis' hydrology text, _Geophysics for Practicing Geoscientists_
  (gpg.geosci.xyz, CC BY 4.0 to confirm; no exercises found on its home page): not read.
- Commercial texts (Tarbuck and Lutgens, Wicander and Monroe, Klein and Dutrow, Ahrens, Garrison,
  Dingman, Lowrie): **no titles-only files**; publishers' pages were not reached in the time
  available. The topic order comes from the open books instead.

## Question sources

| Source                                                                         | Licence         | Content         | Records                               |
| ------------------------------------------------------------------------------ | --------------- | --------------- | ------------------------------------- |
| Earle (LibreTexts) exercises and review questions                              | CC BY 4.0       | text            | 90 (5 more in `geography.jsonl`)      |
| Stull exercises                                                                | CC BY-NC-SA 4.0 | type            | 58 (29 more in `geography.jsonl`)     |
| MIT OCW (courses above)                                                        | CC BY-NC-SA 4.0 | type            | 70 (42 more in `geography.jsonl`)     |
| NAEP grade 12 science, cross-listed from `research/questions/science/12.jsonl` | public domain   | text (as filed) | 13 (`XL-NAEP-…`; 1 more in geography) |
| NAEP Geography (see `he-geography.md`)                                         | public domain   | text            | 11 filed under earth-science topics   |

Not used: NCEES FE practice items (off limits); the IESO and IGeO tests (terms unclear: not
fetched); NOAA JetStream and the USGS Water Science School (not reached in time).

## Licence discrepancies resolved (brief §"Licence discrepancies")

- **Webb**: CC BY 4.0 on the LibreTexts book and section pages, as the plan read on Pressbooks;
  one LibreTexts chapter page says "not declared" (title only used).
- **Schmittner**: see `he-geography.md` (CC BY-NC 4.0 at OSU, CC BY-NC-SA 4.0 on LibreTexts).
- **MIT OCW**: CC BY-NC-SA 4.0 confirmed on every course used.
