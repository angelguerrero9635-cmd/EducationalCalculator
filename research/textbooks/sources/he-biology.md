# College biology (`he.biology.*`): sources, licences and what was skipped

Research group R2, retrieved 2026-10-02. Reference only: nothing here, whatever its licence, goes
into a lesson, a picture or a test (`../../README.md`, `CLAUDE.md`). Every page was fetched with
`curl` through the environment's proxy, sequentially, with the User-Agent
`EducationalCalculatorResearch/0.3 (offline study-app research; contact …)`, at most one request
per second per host (5.2 s on `bio.libretexts.org`, its robots.txt Crawl-delay), and cached in the
group's scratch folder so nothing was fetched twice. robots.txt was read before each host was used.
The bioengineering courses of the same plan (`he.engineering.biomechanics` … `tissue-engineering`,
field `bio`) are in `he-bio.md`.

| File                                                                                       | What                                                                                       |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `toc/college/mit-ocw-7.016-2018.json`, `-7.013-2018`, `-7.014-2005`                        | MIT OCW introductory biology: lectures by part, exam and problem-set kinds                 |
| `toc/college/mit-ocw-7.03-2004.json`                                                       | MIT OCW 7.03 Genetics: lectures, mapping and population-genetics notation                  |
| `toc/college/mit-ocw-20.106j-2006.json`, `-1.018j-2009`                                    | MIT OCW Systems Microbiology; Ecology I: The Earth System                                  |
| `toc/college/mit-ocw-6.021j-2004.json`, `-hst.542j-2004`                                   | MIT OCW quantitative physiology (cells and tissues; organ transport systems)               |
| `toc/college/mit-ocw-20.181-2006.json`                                                     | MIT OCW 20.181: the phylogenetic-inference module                                          |
| `toc/college/libretexts-online-open-genetics.json`                                         | Nickle and Barrette-Ng, _Online Open Genetics_ (CC BY-SA 3.0): 14 chapters, example kinds  |
| `toc/college/libretexts-fisher-environmental-biology.json`                                 | Fisher (ed.), _Environmental Biology_ (CC BY)                                              |
| `toc/college/libretexts-wakim-human-biology.json`                                          | Wakim and Grewal, _Human Biology_ (CK-12, CC BY-NC 3.0)                                    |
| `toc/college/libretexts-kaiser-microbiology.json`                                          | Kaiser, _Microbiology_ (CC BY): units and chapters                                         |
| `toc/college/libretexts-harmon-phylogenetic-comparative-methods.json`                      | Harmon, _Phylogenetic Comparative Methods_ (CC BY)                                         |
| `toc/college/libretexts-lehman-quantitative-ecology.json`                                  | Lehman, Loberg and Clark, _Quantitative Ecology_ (CC BY-NC)                                |
| `toc/college/pearson-campbell-biology-12e.json`, `pearson-tortora-microbiology-14e`        | Commercial, titles only: Campbell Biology 12e; Tortora, Microbiology: An Introduction 14e  |
| `toc/college/pearson-marieb-human-ap-12e.json`, `macmillan-griffiths-genetic-analysis-12e` | Commercial, titles only: Marieb Human A&P 12e; Griffiths, Introduction to Genetic Analysis |
| `toc/college/mcgraw-molles-sher-ecology-9e.json`                                           | Commercial, titles only: Molles and Sher, Ecology: Concepts and Applications 9e            |
| `../college/biology.md`                                                                    | Crosswalk: each `he.biology.*` topic → where each book teaches it                          |
| `../../questions/college/biology.jsonl`                                                    | 209 question records, all `"content": "type"` (no question text)                           |

## 1. MIT OpenCourseWare (used)

- **robots.txt** (<https://ocw.mit.edu/robots.txt>): `User-Agent: * / Allow: /`. Course sitemaps
  and calendar or lecture-notes pages gave the lecture lists.
- **Licence.** CC BY-NC-SA 4.0, as confirmed for the chemistry courses (`he-chemistry.md` §1: page
  footers and the terms page, with its "Permitted Use of AI Training" section). NC: every OCW
  record is **type only**. Exams that OCW marks "© … All rights reserved. This content is excluded
  from our Creative Commons license" (figures inside 7.016, 7.013 and 1.018J exams) were read for
  the question type only; no figure was used.
- **Courses read** (instructors as the course pages list them): 7.016 Fall 2018 (Barbara
  Imperiali, Adam Martin, Diviya Ray): exams 1–3; 7.013 Spring 2018 (Angelika Amon, Hazel Sive,
  Diviya Ray): exam question papers 1–3; 7.014 Spring 2005 (Graham Walker, Penny Chisholm, Julia
  Khodor, Michelle Mischke): problem sets 5–8, quizzes 2–3; 7.03 Fall 2004 (Chris Kaiser, Gerald
  Fink, Leona Samson, Michelle Mischke): exams 1–3 of 2004, the 2002 and 2000 exam sets, problem
  sets 6–7; 20.106J Fall 2006 (David Schauer, Edward DeLong): problem sets 1–4, two practice exams;
  1.018J Fall 2009 (Edward DeLong, Penny Chisholm): quizzes 1–3 (posted with answers; only the
  questions were used); 6.021J Fall 2004 (Dennis Freeman): homework 1–9; HST.542J Spring 2004
  (Jose Venegas, Roger Mark): problem sets 1–10, quiz 1; 20.181 Fall 2006 (Eric Alm, Andrew Endy):
  homework 3–5 (phylogenetics). HST.151 (pharmacology) supplies two `cell-molecular#1` records; it
  is described in `he-bio.md`.
- **Skipped.** The 7.03 2001 exam set is a scan with no text layer. 7.012, 6.877J and
  HST.535 were looked at in their sitemaps and not used (lectures only, or no problem sets).
  Solutions and answer keys were not read for records.

## 2. LibreTexts Biology (used)

- **robots.txt** (<https://bio.libretexts.org/robots.txt>): `Crawl-delay: 5`, `/Special:` and search
  paths disallowed; book pages allowed. Each page's licence tag (`license:…` in the page metadata)
  and the Creative Commons links on it were read.
- **_Online Open Genetics_ (Nickle and Barrette-Ng).** Chapter pages tagged `license:ccbysa`; the
  exercise pages link `creativecommons.org/licenses/by-sa/3.0`. **CC BY-SA 3.0, confirmed** (the
  plan's "to confirm"). Exercises 2.E, 3.E, 5.E and 6.E read (8 records); answers not used.
- **_Environmental Biology_ (Fisher).** Tagged `license:ccby`; pages link CC BY 3.0 and 4.0. Chapter
  resources 3.5, 4.5, 5.6 (review questions) read (7 records).
- **_Human Biology_ (Wakim and Grewal).** Tagged `license:ck12` (CK-12 material, CC BY-NC 3.0).
  Review questions of sections 9.4–9.6, 10.3, 10.7, 11.4, 14.4, 14.6, 15.4, 16.3, 17.3, 17.4 read
  (12 records).
- **_Microbiology_ (Kaiser) and _Exercises: Microbiology_ (Kaiser).** The book's unit pages are tagged
  `license:ccby`; the exercise pages carry no tag. Exercises 2.E, 3.E, 4.E, 10.E, 11.E, 13.E, 17.E,
  18.E read (8 records, type only either way).
- **_Phylogenetic Comparative Methods_ (Harmon), CC BY; _Quantitative Ecology_ (Lehman, Loberg and
  Clark), CC BY-NC.** Chapter lists only (neither has exercise pages).
- **Crawled and not used:** _General Biology_ (Boundless) and _Microbiology_ (OpenStax, mirrored on
  LibreTexts). The OpenStax mirror was not opened: OpenStax content is kept to titles (§3).

## 3. OpenStax (titles only, nothing fetched under `/books/`)

- **robots.txt** (<https://openstax.org/robots.txt>): AI crawlers disallowed on `/books/`; the
  brief and `docs/RESEARCH_HE.md` keep OpenStax to titles.
- **Licences, from the OpenStax CMS API** (`/apps/cms/api/v2/pages/?type=books.Book&slug=…`, the
  same JSON the details pages load): Biology 2e, Microbiology and Anatomy and Physiology 2e all
  return `license_name` "Creative Commons Attribution-NonCommercial-ShareAlike License",
  `license_version` 4.0, `license_url` <https://creativecommons.org/licenses/by-nc-sa/4.0/>.
  **Discrepancy 2 (Biology 2e: CC BY 4.0 in the plan vs CC BY-NC-SA 4.0 in `sources/hs-d.md`)
  resolved: CC BY-NC-SA 4.0**; the plan's "CC BY 4.0" for all three is wrong. Discrepancy 3's
  Microbiology and A&P 2e: also CC BY-NC-SA 4.0.
- **Titles.** Biology 2e chapter numbers come from the existing `toc/science/openstax-biology-2e.json`
  and are mapped to topics by hand in the crosswalk. Microbiology and A&P 2e have no toc file and
  their details pages are JavaScript shells over `/apps/archive` (disallowed), so their titles are
  not recorded.

## 4. Commercial texts (titles only)

| Text                                        | Page read (robots.txt allows it)                               | Result                                                              |
| ------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------- |
| Campbell Biology 12e (Pearson)              | pearson.com product page 9780135988046                         | units and 56 chapter titles                                         |
| Tortora, Microbiology: An Introduction 14e  | pearson.com product page 9780138200398                         | 5 parts, 28 chapters                                                |
| Marieb Human Anatomy & Physiology 12e       | pearson.com product page 9780138244415                         | 5 units, 29 chapters                                                |
| Griffiths, Introduction to Genetic Analysis | macmillanlearning.com product page (12e digital update, ©2025) | 20 chapters                                                         |
| Molles and Sher, Ecology 9e (McGraw Hill)   | mheducation.com product page M9781260722208                    | 6 sections, 23 chapters                                             |
| Alberts, Molecular Biology of the Cell 7e   | wwnorton.com/books/9780393884821                               | **not recorded**: the contents load from `/api/` (robots disallows) |
| Futuyma and Kirkpatrick, Evolution 5e (OUP) | global.oup.com product page                                    | **not recorded**: the host answered 202 with a bot challenge        |

Pearson's "textbook solutions" channel pages, Scribd, test-bank and PDF-mirror sites that the
searches returned were not opened. A university library catalogue page for Alberts
(catalog.lib.uchicago.edu, robots.txt `Crawl-delay: 30`) answered 403 with an "Anubis" bot check
and was not retried.

## 5. Question sources

- **AP Biology free response 2023–2026** (apcentral.collegeboard.org; robots.txt allows
  `/media/pdf/`): © College Board, classroom use; **type only**. 24 questions recorded as 40
  records (each long question split into its concept, data and prediction parts): **40 of 40**.
- **USA Biology Olympiad** (cee.org → usabo-trc.org): the "About the Exams" page describes the
  rounds; past exams are given to registered test administrators through the site's login. Behind
  a login, so **0 of 20**; nothing was fetched past the public pages.
- **OpenStax end-of-chapter questions:** off limits (§3); not counted.
- **GRE Biology, MCAT, NCEES:** rejected by the plan and `docs/RESEARCH_HE.md`; not fetched.

## 6. Hosts blocked or skipped

open.oregonstate.education (403 CloudFront at robots.txt; chemistry), pressbooks.bccampus.ca
(Cloudflare challenge; see `he-bio.md`), catalog.lib.uchicago.edu (bot check), global.oup.com (bot
challenge), wwnorton.com `/api/` (robots.txt). None was worked around.
