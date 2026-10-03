# College chemistry (`he.chemistry.*`): sources, licences and what was skipped

Research group R2, retrieved 2026-10-02. Reference only: nothing here, whatever its licence, goes
into a lesson, a picture or a test (`../../README.md`, `CLAUDE.md`). Every page was fetched with
`curl` through the environment's proxy, sequentially, with the User-Agent
`EducationalCalculatorResearch/0.3 (offline study-app research; contact …)`, at most one request
per second per host (5.2 s on `*.libretexts.org`, 121 s on `open.umn.edu`, their robots.txt
Crawl-delays), and cached in the group's scratch folder so nothing was fetched twice. robots.txt
was read before each host was used.

| File                                                                                                 | What                                                                                                 |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `toc/college/mit-ocw-5.111sc-2014.json`, `-5.111-2008`, `-5.112-2005`                                | MIT OCW general chemistry: lectures by unit, exam kinds, notation from the equation sheets           |
| `toc/college/mit-ocw-5.12-2005.json`, `-5.13-2006`                                                   | MIT OCW organic chemistry I and II: weekly and lecture topics                                        |
| `toc/college/mit-ocw-5.60-2008.json`, `-20.110j-2005`, `-5.61-2017`                                  | MIT OCW physical chemistry (thermodynamics and kinetics; quantum); 20.110J's problem sets            |
| `toc/college/mit-ocw-5.07sc-2013.json`, `-7.05-2020`                                                 | MIT OCW biochemistry                                                                                 |
| `toc/college/mit-ocw-5.310-2019.json`, `-5.35-2012`                                                  | MIT OCW laboratory courses (lab lists only)                                                          |
| `toc/college/harvey-analytical-2.1.json`                                                             | Harvey, _Analytical Chemistry 2.1_: 15 chapters, sections, worked-example kinds, notation            |
| `toc/college/libretexts-averill-general-chemistry.json`                                              | Averill and Eldredge, _General Chemistry: Principles, Patterns, and Applications_: 24 chapters       |
| `toc/college/libretexts-fleming-physical.json`, `libretexts-fleming-quantum.json`                    | Fleming, _Physical Chemistry_ and _Quantum Chemistry with Applications in Spectroscopy_              |
| `toc/college/libretexts-peverati-live-pchem.json`                                                    | Peverati, _The Live Textbook of Physical Chemistry_ (CC BY-SA; titles and order)                     |
| `toc/college/libretexts-intro-inorganic-wikibook.json`, `-nocera-inorganic-ii`, `-vallance-symmetry` | Inorganic: the Wikibook (CC BY-SA), Nocera's MIT 5.04 notes, Vallance's _Symmetry_ (CC BY)           |
| `toc/college/libretexts-biochemistry-free-for-all.json`                                              | Ahern, Rajagopal and Tan, _Biochemistry Free For All_ (chapter titles)                               |
| `../college/chemistry.md`                                                                            | Crosswalk: each `he.chemistry.*` topic → where each book teaches it, example kinds, ranges, notation |
| `../../questions/college/chemistry.jsonl`                                                            | 390 question records, all `"content": "type"` (no question text)                                     |

## 1. MIT OpenCourseWare (used)

- **robots.txt** (<https://ocw.mit.edu/robots.txt>): `User-Agent: * / Allow: /`. Course sitemaps
  (`/courses/<slug>/sitemap.xml`) were used to find exams, problem sets and lecture titles.
- **Licence.** Every course page's footer links "Creative Commons License" to
  <https://creativecommons.org/licenses/by-nc-sa/4.0/>. The terms page,
  <https://ocw.mit.edu/pages/privacy-and-terms-of-use/>, shows "Attribution-NonCommercial-ShareAlike
  4.0 International (CC BY-NC-SA 4.0)" and adds a section "Permitted Use of AI Training": "Unless
  otherwise specified, OCW content may be used to train, develop, and improve artificial
  intelligence and machine learning models, provided that such use complies fully with the
  restrictions set forth below and is consistent with the applicable Creative Commons License
  associated with the OCW content" (attribution, non-commercial use only, share-alike). This
  answers the brief's open point 7 for the chemistry courses: **CC BY-NC-SA 4.0, confirmed**. NC
  means every OCW record here is **type only**.
- **Courses read** (instructors as the course pages list them): 5.111SC Fall 2014 (Catherine
  Drennan): exams 1–4, final, practice exams 1–3 with equation sheets; 5.111 Fall 2008 (Drennan,
  Elizabeth Vogel Taylor): exams 1–3; 5.112 Fall 2005 (Christopher Cummins, Sylvia Ceyer): lecture
  titles only (no exams or problem sets published); 5.12 Spring 2005 (Kimberly Berkowski, Sarah
  O'Connor): exams 1, 3, 4, problem sets 1–2 and 4–7, calendar; 5.12 Spring 2003 (Sarah Tabacco,
  Barbara Imperiali): practice exams 1–4; 5.13 Fall 2006 (Berkowski, Timothy F. Jamison): exams 1,
  2, final, exam-3 extra problems, practice exams 3–4, problem sets 5–8, calendar; 5.60 Spring 2008
  (Keith A. Nelson, Moungi Bawendi): lecture list and lecture 2's sign convention only (no exams or
  problem sets published); 20.110J Fall 2005 (Linda Griffith, Kimberly Hamad-Schifferli, Bawendi,
  Robert Field): problem sets 1–10; 5.61 Fall 2017 (Field): problem sets 1–9, exams 1–3, calendar;
  5.07SC Fall 2013 (John Essigmann, JoAnne Stubbe, Bogdan Fedeles): problem sets 1–10, sessions;
  7.05 Spring 2020 (Michael Yaffe, Matthew Vander Heiden): problem sets 8–11, exam 3 (2019);
  5.310 Fall 2019 (John Dolhun, Sarah Hewett) and 5.35 Fall 2012 (Nelson, Mariusz Twardowski):
  lab lists only.
- **Skipped.** 5.12 Spring 2005 exam 2 and problem set 3, the 5.61 Fall 2007 exams and 5.07SC's
  exam pages: scanned images with no text layer, or no files published. Third-party figures in
  the PDFs ("Figure by MIT OCW", publisher figures) were not used. Solutions were not read for
  question records (only the question sheets).
- **Not on OCW.** 5.03 and 5.04 (Inorganic Chemistry) are not in the OCW sitemap (searched
  2026-10-02); Nocera's 5.04 notes on LibreTexts stand in for them (§4).

## 2. OpenStax: titles only, no fetch under `/books/`

- **robots.txt** (<https://openstax.org/robots.txt>): disallows `/accounts`, `/admin`, `/contents`,
  `/resources`, `/apps/archive`, `/apps/cms/api/spike` and others for everyone; `GPTBot` is
  disallowed `/books/`. Per the brief nothing under `/books/` (or `/apps/archive`) was fetched.
- **Licences read** from the CMS record behind each book's details page
  (`https://openstax.org/apps/cms/api/v2/pages/?type=books.Book&slug=<slug>&fields=license_name,license_url,…`,
  the data the page <https://openstax.org/details/books/chemistry-2e> renders):
  - Chemistry 2e: "Creative Commons Attribution-NonCommercial-ShareAlike License", version 4.0,
    <https://creativecommons.org/licenses/by-nc-sa/4.0/>.
  - Organic Chemistry ("Organic Chemistry: A Tenth Edition", John McMurry, 2023-09-20): the same,
    CC BY-NC-SA 4.0.
  - Chemistry: Atoms First 2e (checked in passing): CC BY-NC-SA 4.0.

  **Discrepancy 1 resolved:** Chemistry 2e is **CC BY-NC-SA 4.0**, as the repository already
  records (`toc/science/openstax-chemistry-2e.json`, `sources/hs-d.md`); the chemistry plan's "CC
  BY 4.0 on the book page" is wrong. The no-LLM-ingestion statement is quoted in `sources/hs-d.md`
  §1 (read from the books' citation panels in September); the CMS record carries no licence text,
  so it was not re-read here. Titles only either way.

- **Chemistry 2e titles:** taken from the existing `toc/science/openstax-chemistry-2e.json`; the
  crosswalk maps its chapters to college topics by hand (no new file).
- **Organic Chemistry titles: not recorded.** The details page
  (<https://openstax.org/details/books/organic-chemistry>, fetched once) is a script shell whose
  table of contents is loaded from `/apps/archive` (disallowed); no `toc/` file exists for it. The
  plan's McMurry chapter numbers (12.1–12.4, ch. 14, 17–18, 22, 25–28, 30–31) are therefore
  unverified. A person can read the titles from the details page in a browser if the owner wants
  them.
- **Exercises:** none recorded (the brief: OpenStax end-of-chapter exercises are off limits).

## 3. Harvey, _Analytical Chemistry 2.1_ (used, type only)

- **Where:** the LibreTexts edition,
  <https://chem.libretexts.org/Bookshelves/Analytical_Chemistry/Analytical_Chemistry_2.1_by_David_Harvey/Analytical_Chemistry_2.1_(Harvey)>:
  chapters 1–15, every section page (for worked-example kinds) and the problem pages of chapters
  4, 5, 9, 10, 11 and 12.
- **Licence:** every chapter and section page carries the tag `license:ccbyncsa` and links
  <https://creativecommons.org/licenses/by-nc-sa/4.0>. The Open Textbook Library page
  <https://open.umn.edu/opentextbooks/textbooks/analytical-chemistry-2-1> lists "Conditions of Use:
  Attribution-NonCommercial-ShareAlike, CC BY-NC-SA" (copyright year 2016, publisher David T.
  Harvey). **Confirmed CC BY-NC-SA** → type only (45 records, `HARVEY-AC2.1-*`).
- **Skipped:** chapter 16 (appendix tables): no figures, tables or numbers taken.

## 4. LibreTexts Chemistry (used, by licence; all type only)

- **robots.txt** (<https://chem.libretexts.org/robots.txt>): `Crawl-delay: 5`, `Request-rate: 1/5`;
  disallows `/Special:*`, `/Template:*`, `/User:*`, `/deki/`, `/*action=*`, `/@*`. Only book,
  chapter and section pages were fetched, 5.2 s apart. The licence of each page was read from its
  `license:` tag and CC link; pages without a tag ("undeclared") were not used for records.
- **Books** (licence as tagged): _Introduction to Inorganic Chemistry (Wikibook)_ —
  `license:ccbysa`, CC BY-SA 4.0 (problems of chapters 5, 6, 8, 9 recorded as types even though
  text would be allowed); _Principles of Inorganic Chemistry II (Nocera)_ — `license:ccbyncsa`
  (problem sets 1–5 and exams 1–3); _Symmetry (Vallance)_ — `license:ccby` (titles only);
  _Physical Chemistry (Fleming)_ — `license:ccbyncsa` (its exercise pages 2.E and 8.E–12.E were empty,
  redirected to the library home page, or "In preparation", so titles only); _Quantum Chemistry with
  Applications in Spectroscopy (Fleming)_ — `license:ccbyncsa` (problems of chapters 2, 4, 5, 6);
  _The Live Textbook of Physical Chemistry (Peverati)_ — `license:ccbysa` (titles only, no
  exercises); _General Chemistry: Principles, Patterns, and Applications (Averill)_ —
  `license:ccbyncsa`, page link to CC BY-NC-SA 3.0 (numerical problems of sections 10.3, 10.5,
  14.3–14.8, 15.3, 15.5, 16.4, 16.6, 17.2, 19.3, 19.5, 19.8). _Inorganic Chemistry (LibreTexts)_
  was listed (its chapters carry mixed tags: ccbyncsa, ccbysa, ccby, ccbync, and none on chapters
  4, 11, 15, 16) but not used for records.
- **"Map:" books.** The General Chemistry shelf holds maps of commercial texts (Brown, Tro,
  Petrucci, Oxtoby, Silberberg, Zumdahl, Kotz); the inorganic shelf a Housecroft map. They were
  not used. OpenStax-derived LibreTexts books (Chemistry 2e, Atoms First) were not used either.
- **Zielinski, _Quantum States of Atoms and Molecules_:** the crawl found no chapters at the
  shelf URL tried; skipped.

## 5. AP Chemistry released free-response questions (type only)

- **Where:** <https://apcentral.collegeboard.org/courses/ap-chemistry/exam/past-exam-questions>
  (the page offers "the three most recent years" plus the current one); the 2023, 2024, 2025 and
  2026 question PDFs (`/media/pdf/ap2X-frq-chemistry.pdf`). Scoring guidelines, sample responses
  and statistics were not fetched.
- **robots.txt:** disallows `/core/`, `/profiles/`, admin, search and user paths; `/media/pdf/` is
  allowed.
- **Terms:** each PDF page carries "© 2025 College Board" (year per exam); the brief classes these
  as © College Board, classroom copying only. **Type only:** 30 records, `AP-CHEM-<year>-Q<n>`,
  question type, unknown, sizes of givens, answer form and figure in our words; no text, no
  numbers.
- **Short of target:** 30 of 40 (only four years are public; parts of the long questions 1–3 are
  folded into one record each, with `alsoTopics`).

## 6. International Chemistry Olympiad preparatory problems (type only)

- **Where:** the IChO International Information Centre, <https://icho.sk/preparatory-problems/>
  (robots.txt: `Disallow: /wp-admin/`). The compiled "Series 4" volumes for 2018 (Bratislava–Prague)
  and 2019 (Paris) were read.
- **Terms** (Series 4 front matter, © 2020 IUVENTA): "You are free to copy, distribute, transmit or
  adapt this publication or its parts for unlimited teaching purposes, however, as it is usual and
  required in the chemical literature, you are obliged to attribute your copies, transmissions in
  internet or adaptations with a reference to: 'The Preparatory Problems from the International
  Chemistry Olympiads, Series 4', Iuventa, Bratislava, 2020." A custom free licence, not CC → type
  only (21 records, `ICHO-PREP-<year>-P<n>`). Problems credited to third parties inside the volume
  (photographs, CC BY-SA pictures) were not used.
- Host-year sites (`icho2023.ch` reset the connection; `icho2025.ae`, `icho2021.org` have no
  robots.txt) were not used; the Information Centre's compilations sufficed.

## 7. Off limits or not reached

- **US National Chemistry Olympiad (ACS):** not fetched (brief point 9: ACS material, off limits
  unless the owner allows). The plan's 30-record target from it is met from the sources above.
- **ACS standardized exams, GRE Chemistry, Chegg, Course Hero, Quizlet, solution manuals:** not
  used.
- **open.oregonstate.education** (_Biochemistry Free For All_'s publisher): every request,
  including robots.txt, returned HTTP 403 from CloudFront ("Request blocked"). Not retried or worked
  around; the book's own LibreTexts edition on `bio.libretexts.org` (tagged `license:ccbyncsa`) was
  read for chapter titles instead.
- **open.umn.edu:** robots.txt `Crawl-delay: 120` (obeyed); used only for the Harvey licence. Its
  search URLs returned 404; the default response without an `Accept: text/html` header is an Atom
  feed (two such responses were discarded and the pages re-read as HTML).

## 8. Records

`research/questions/college/chemistry.jsonl`: 390 records, all `"content": "type"`
(`question`, `choices`, `answer` null). By course: gen-chem-1 62, gen-chem-2 61, organic-1 43,
organic-2 40, analytical 51, physical-1 30, physical-2 38, biochemistry 32, inorganic 33 (targets
60, 60, 40, 40, 40, 30, 30, 30, 30: all met). By source: MIT OCW 229 (5.111SC 56, 5.12 49, 5.13 34, 20.110J 24, 5.61 21,
5.07SC 19, 5.111 16, 7.05 10), Harvey 45, AP 30, LibreTexts 65 (Averill 22, Nocera 15, Wikibook 15,
Fleming 13), IChO 21. Each record names its course, topic, `alsoTopics`, the question type in our words, the
unknown, the givens' sizes as ranges, the answer form and whether a figure carries the question.
`page` and `mark` are filled at the re-marking step (`questions/college/marks/chemistry.md`).
