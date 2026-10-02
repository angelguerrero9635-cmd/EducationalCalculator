# College sources: chemical (plan group ACC, research group R4)

Reference only (`../../README.md`). Retrieved 2026-10-02 by research group R4, User-Agent
`EducationalCalculatorResearch/0.3 (offline study-app research; contact …)`, sequentially; at most one
request per second per host, five seconds on `eng.libretexts.org` (its `Crawl-delay: 5`), four seconds on
Wikibooks after one HTTP 429.

| File                                                                        | What                                                 |
| --------------------------------------------------------------------------- | ---------------------------------------------------- |
| `toc/college/mit-ocw-10-302.json`                                           | 10.302 Transport Processes                           |
| `toc/college/mit-ocw-10-32.json`                                            | 10.32 Separation Processes                           |
| `toc/college/mit-ocw-10-37.json`                                            | 10.37 Chemical and Biological Reaction Engineering   |
| `toc/college/mit-ocw-10-40.json`                                            | 10.40 Chemical Engineering Thermodynamics            |
| `toc/college/mit-ocw-10-450.json`                                           | 10.450 Process Dynamics, Operations, and Control     |
| `toc/college/woolf-chemical-process-dynamics-and-controls.json`             | Woolf et al. (LibreTexts)                            |
| `toc/college/wikibooks-introduction-to-chemical-engineering-processes.json` | Wikibooks ICEP                                       |
| `toc/college/learncheme-screencasts.json`                                   | LearnChemE screencast topic lists (titles)           |
| `toc/college/northwestern-process-design.json`                              | Northwestern Process Design wiki (titles)            |
| `../questions/college/chemical.jsonl`                                       | 69 records: 19 text (Woolf 10, ICEP 9), 50 type only |
| `college/chemical.md`                                                       | Crosswalk                                            |

## 1. MIT OpenCourseWare (used, type only)

Licence and robots.txt as in `he-aerospace.md` §1. Of the brief's list, 10.213 and 10.50 are not in the OCW
sitemap (removed or renamed); 10.302, 10.37, 10.40, 10.450 and 10.490 are; 10.32 (Separation Processes) was
added. Problems set from textbooks (Incropera and DeWitt "I&D" in 10.302, Tester and Modell in 10.40,
Seader and Henley in 10.32, Fogler in 10.37) were skipped; OCW also removed some tables "due to copyright
considerations". 10.490 (design memos) was listed but not read.

## 2. Woolf et al., _Chemical Process Dynamics and Controls_ (used, text)

- **robots.txt** (<https://eng.libretexts.org/robots.txt>): `Crawl-delay: 5`, `Request-rate: 1/5`; operational
  paths (`/Special:*`, `/@*`, `/deki/`, `*action=*`) disallowed; book pages allowed. eng.libretexts.org was
  reachable this time (the plans had found it blocked).
- **Licence, confirmed**: the book page carries the tag "CC BY 3.0" (`mt-classification-license-cc by`).
  Text copied with attribution; only the problem statement is copied (the worked solution is not). Woolf's
  pages are student-written: one exercise's answer reads "TBA".

## 3. Wikibooks, _Introduction to Chemical Engineering Processes_ (used, text)

robots.txt as in `he-civil.md` §2; licence CC BY-SA 4.0 (page footer). The practice-problem pages for
chapters 2 and 3 were copied (9 problems). One later page returned HTTP 429 (rate limit); the request was
not retried in this round and the delay was raised.

## 4. LearnChemE (titles only)

- **robots.txt** (<https://learncheme.com/robots.txt>): disallows `/wp-admin/` only.
- **ConcepTests: behind a login.** The Instructor Resources page says "Click here to sign in to the
  ConcepTest Inventory, Course Packages, & Design Hub. For access, email us using your university account to
  verify instructor status." Off limits under the brief (anything behind a login); the plan's 40 ConcepTest
  records a course could not be made.
- **Licence**: no statement was found on the home, screencast or instructor pages read (the plan listed CC
  BY-SA 4.0 as confirmed; its source page was not located). Only topic headings and video counts recorded.
- The quiz screencasts are video-embedded and were not used.

## 5. Northwestern _Process Design_ wiki (titles only)

<https://processdesign.mccormick.northwestern.edu/> has no robots.txt (404); no licence statement on the main
page. Titles only.

## 6. Not fetched

Rawlings and Ekerdt (all rights reserved), Fogler's companion site (all rights reserved; problem types
only), U.S. Chemical Safety Board reports (time), NCEES FE Chemical specification (ownership: research group
R3 holds the NCEES source; R4 did not fetch it).

## 7. Counts and what is short

69 records against 40 a course (280): process-control 21, reaction-engineering 14,
material-energy-balances 10, separations 9, chemical-thermodynamics 7, transport-phenomena 5,
process-design 3. The ConcepTest login is the main reason; the next sources to try are LibreTexts
chemical-engineering books with CC BY exercises and the Wikibooks ICEP worked examples beyond chapter 3.
