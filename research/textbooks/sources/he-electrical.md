# College sources: electrical (plan group EC, research group R4)

Reference only (`../../README.md`). Retrieved 2026-10-02 by research group R4, User-Agent
`EducationalCalculatorResearch/0.3 (offline study-app research; contact …)`, sequentially; at most one
request per second per host, 2.2 s on www.ibiblio.org (its `Crawl-delay: 2`), 4 s on Wikibooks.

| File                                         | What                                                             |
| -------------------------------------------- | ---------------------------------------------------------------- |
| `toc/college/kuphaldt-model.json`            | ModEL: 34 modules with their quantitative-question titles        |
| `toc/college/mit-ocw-6-003.json`             | 6.003 Signals and Systems                                        |
| `toc/college/mit-ocw-6-061.json`             | 6.061 Introduction to Electric Power Systems                     |
| `toc/college/mit-ocw-6-02.json`              | 6.02 Digital Communication Systems                               |
| `toc/college/mit-ocw-6-013.json`             | 6.013 Electromagnetics and Applications                          |
| `toc/college/mit-ocw-16-06.json`             | 16.06 Principles of Automatic Control                            |
| `toc/college/wikibooks-control-systems.json` | Wikibooks _Control Systems_ (two pages)                          |
| `../questions/college/electrical.jsonl`      | 107 records: 76 text (ModEL 72, Wikibooks 4), 31 type only (OCW) |
| `college/electrical.md`                      | Crosswalk                                                        |

## 1. Kuphaldt, _Modular Electronics Learning_ (used, text)

- **robots.txt** (<https://www.ibiblio.org/robots.txt>): `User-agent: *`, `Crawl-delay: 2`; disallowed paths
  are other projects' folders (`/dbarberi/wiki/`, `/designerunits/…`, …), none under `/kuphaldt/`.
- **Licence, confirmed** (front matter of each module PDF): "© 2016-2026 by Tony R. Kuphaldt – under the
  terms and conditions of the Creative Commons Attribution 4.0 International Public License". The plan had
  this as confirmed. Question text copied from the PDF text layer; circuit-figure labels come out inline
  (e.g. "R1 R2 R3 14 V 780 Ω …"), so each record's `picture` says a schematic is involved.
- _Lessons in Electric Circuits_ (Design Science License) and _Lessons in Industrial Instrumentation_ were not
  used: the DSL is a copyleft licence outside the brief's text list (public domain, CC BY, CC BY-SA), and
  ModEL covers the same material under CC BY.

## 2. MIT OpenCourseWare (used, type only)

Licence and robots.txt as in `he-aerospace.md` §1. Read: 6.003 quizzes (Fall 2011), 6.061 quizzes,
6.02 problem sets 1, 2, 5, 7 and quiz 1, 6.013 problem sets 7, 8, 10, 11, 16.06 problem sets (textbook
problems skipped). Not read in this round: 6.002, 6.012, 6.302, 6.450, 6.011.

## 3. Wikibooks, _Control Systems_ (used, text)

Licence CC BY-SA 4.0 (page footer). Two pages read (Routh–Hurwitz Criterion, Root Locus); the problem
statement before each worked solution is copied. Wikibooks then answered HTTP 429 (rate limit) and no
further pages were requested.

## 4. Not fetched or not usable

| Source                                 | Status                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------ |
| Ellingson, _Electromagnetics_ Vols 1–2 | owned by research group R1 (physics comes first); not fetched here                   |
| Fiore (LibreTexts), Johnson, Baraniuk  | not fetched in this round (LibreTexts `Crawl-delay: 5`)                              |
| Åström and Murray, _Feedback Systems_  | free PDF, licence to confirm; not fetched                                            |
| Downey, _Think DSP_                    | CC BY-NC (type only); not fetched                                                    |
| NCEES FE Electrical and Computer spec  | NCEES source owned by research group R3; the FE Reference Handbook is behind a login |
| AP Physics C E&M (bridge)              | type only; not fetched                                                               |

## 5. Counts and what is short

107 records against the plan's targets (40 each circuits-1, circuits-2, signals-systems, control-systems;
25 each electronics, electromagnetics, power-systems, communication-systems: 360): circuits-1 32,
circuits-2 21, electromagnetics 14, communication-systems 11, electronics 9, signals-systems 9,
control-systems 6, power-systems 5. ModEL has many more modules (semiconductors, amplifiers, power
grids, protective relays, motors, RF) for a next round.
