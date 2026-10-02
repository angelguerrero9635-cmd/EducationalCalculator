# College sources: computer (plan group EC, research group R4)

Reference only (`../../README.md`). Retrieved 2026-10-02 by research group R4, User-Agent
`EducationalCalculatorResearch/0.3 (offline study-app research; contact …)`, sequentially, at most one
request per second per host (2.2 s on www.ibiblio.org).

| File                                             | What                                                              |
| ------------------------------------------------ | ----------------------------------------------------------------- |
| `toc/college/levin-discrete-mathematics-3e.json` | Levin, _Discrete Mathematics: An Open Introduction_, 3rd edition  |
| `toc/college/morin-open-data-structures.json`    | Morin, _Open Data Structures_                                     |
| `toc/college/mit-ocw-6-004.json`                 | 6.004 Computation Structures                                      |
| `toc/college/mit-ocw-6-006.json`                 | 6.006 Introduction to Algorithms                                  |
| `toc/college/kuphaldt-model.json`                | ModEL (digital modules listed there; subject electrical)          |
| `../questions/college/computer.jsonl`            | 102 records: 89 text (Levin 48, Morin 23, ModEL 18), 13 type only |
| `college/computer.md`                            | Crosswalk                                                         |

## 1. Levin, _Discrete Mathematics: An Open Introduction_ (used, text, 3rd edition)

- **robots.txt** (<https://discrete.openmathbooks.org/robots.txt>): only comments (a content-signals
  template with no signal set and no rules), so nothing is disallowed.
- **Licence discrepancy resolved.** The 4th edition (2025) page says "the book is still released under a
  Creative Commons License (but note the new Non-Commercial addition to the license)" and links
  <https://creativecommons.org/licenses/by-nc-sa/4.0/>. The 3rd edition page
  (<https://discrete.openmathbooks.org/dmoi3.html>) links <http://creativecommons.org/licenses/by-sa/4.0/>
  ("License", with the CC BY-SA badge). The brief's "CC BY-SA 4.0 (to confirm)" holds for the 3rd edition
  only; the 48 text records come from the 3rd edition (`/dmoi3/`), with attribution.
- Interactive (WeBWorK) exercises print randomized sample values; the text is as rendered on the page read.

## 2. Morin, _Open Data Structures_ (used, text)

- `opendatastructures.org` has no robots.txt (404). The home page links
  <http://creativecommons.org/licenses/by/2.5/ca/>; the book's preface says the source "is released under a
  Creative Commons Attribution license". The pseudocode (Python) edition PDF was read; 23 exercises copied.

## 3. MIT OpenCourseWare (used, type only)

Licence as in `he-aerospace.md` §1. 6.004 (Spring 2009) quizzes 1, 2, 3, 5 and 6.006 (Fall 2011) quiz 1
read. 6.829 (Computer Networks, Fall 2002) problem sets are scanned images with no text layer (not used);
6.828/6.1810 (operating systems) posts labs and exams that were not read in this round; 6.042J
(_Mathematics for Computer Science_, also at opendatastructures.org/mcs.pdf, CC BY-SA 3.0) was not used
because Levin covered the discrete-math target first.

## 4. Not fetched or not usable

| Source                                                                 | Status                                                                                                                                                                      |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Peterson and Davie, _Computer Networks: A Systems Approach_            | robots.txt (<https://book.systemsapproach.org/robots.txt>) lists AI crawlers (anthropic-ai among them) under `Disallow: /`; not fetched, in the spirit of the OpenStax rule |
| Bonaventure, _Computer Networking: Principles, Protocols and Practice_ | robots.txt allows all; the exercises page linked from the home page returned 404 and the beta site did not resolve; not used                                                |
| Erickson, _Algorithms_                                                 | `jeffe.cs.illinois.edu` robots.txt 404; not fetched (Morin covered the data-structures items)                                                                               |
| Arpaci-Dusseau, _OSTEP_; Hailperin                                     | not fetched in this round                                                                                                                                                   |
| Matthews et al., _Dive into Systems_ (CC BY-NC-ND)                     | not fetched                                                                                                                                                                 |
| Lee and Seshia, _Introduction to Embedded Systems_                     | not fetched                                                                                                                                                                 |
| RISC-V specification                                                   | not fetched                                                                                                                                                                 |

## 5. Counts and what is short

102 records against the plan's targets (40 each digital-logic, discrete-math, data-structures,
computer-architecture; 25 each embedded-systems, operating-systems, networks: 235): discrete-math 48,
data-structures 27, digital-logic 19, computer-architecture 3, embedded-systems 3, networks 1,
operating-systems 1. Operating systems, networks and architecture need a reachable open source with
exercises (OSTEP homework, Hailperin, a CC BY networking text).
