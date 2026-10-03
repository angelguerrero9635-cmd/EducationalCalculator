# College sources: aerospace (plan group ACC, research group R4)

Reference only: nothing recorded here goes into a lesson, picture or test (`../../README.md`). Retrieved
2026-10-02 by research group R4, sequentially, at most one request per second per host (longer where
robots.txt asks), with the User-Agent
`EducationalCalculatorResearch/0.3 (offline study-app research; contact …)`, through the environment's
proxy. Raw pages were kept in a scratch folder and not committed.

| File                                          | What                                                                              |
| --------------------------------------------- | --------------------------------------------------------------------------------- |
| `toc/college/mit-ocw-16-01.json`              | 16.01–16.04 Unified Engineering, fluids lectures (fall and spring), problem kinds |
| `toc/college/mit-ocw-16-001.json`             | 16.001 Unified Engineering: Materials and Structures (Fall 2021)                  |
| `toc/college/mit-ocw-16-07.json`              | 16.07 Dynamics (rocket equation, orbits)                                          |
| `toc/college/mit-ocw-16-100.json`             | 16.100 Aerodynamics                                                               |
| `toc/college/mit-ocw-16-120.json`             | 16.120 Compressible Flow (graduate)                                               |
| `toc/college/mit-ocw-16-20.json`              | 16.20 Structural Mechanics                                                        |
| `toc/college/mit-ocw-16-333.json`             | 16.333 Aircraft Stability and Control                                             |
| `toc/college/mit-ocw-16-346.json`             | 16.346 Astrodynamics (graduate)                                                   |
| `toc/college/mit-ocw-16-50.json`              | 16.50 Introduction to Propulsion Systems                                          |
| `toc/college/mit-ocw-16-512.json`             | 16.512 Rocket Propulsion (graduate; calendar only)                                |
| `toc/college/nasa-glenn-beginners-guide.json` | NASA Glenn _Beginner's Guide to Aeronautics_ (section and activity titles)        |
| `toc/college/jpl-basics-of-space-flight.json` | JPL _Basics of Space Flight_ (chapter titles)                                     |
| `../questions/college/aerospace.jsonl`        | 144 question records (type only)                                                  |
| `college/aerospace.md`                        | Crosswalk: topic → units, examples, ranges, notation; question counts             |

## 1. MIT OpenCourseWare (used)

- **robots.txt** (<https://ocw.mit.edu/robots.txt>): `User-Agent: * / Allow: /`, sitemap only. The course
  lists came from the sitemap index (<https://ocw.mit.edu/sitemap.xml>) and each course's own
  `sitemap.xml`; course pages (syllabus, calendar, lecture notes, assignments, exams) and the problem-set
  and exam PDFs linked from them were read.
- **Licence, confirmed** (open point 7). Every course page links
  <https://creativecommons.org/licenses/by-nc-sa/4.0/>; the terms page
  (<https://ocw.mit.edu/pages/privacy-and-terms-of-use/>, "Last Updated: 08/11/2026") says:

  > "Creative Commons License — Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)"

  and, new since the plans were written:

  > "Permitted Use of AI Training — Unless otherwise specified, OCW content may be used to train, develop,
  > and improve artificial intelligence and machine learning models, provided that such use complies fully
  > with the restrictions set forth below and is consistent with the applicable Creative Commons License
  > associated with the OCW content."

  (the restrictions: attribution, non-commercial use only, share-alike). NC, so every record is **type
  only** (`"question": null`); attribution per record is the OCW citation form (instructor, course number
  and title, term, MIT OpenCourseWare, URL, CC BY-NC-SA).

- **Third-party content**: course images credited to others (e.g. the 16.100 NASA sketch) and textbook
  problems cited by number (16.01 F6 "Anderson Chapter 5, p 416"; 16.333 "Adapted from Etkin and Reid")
  were not recorded as items, or are recorded only as the OCW set's own type.
- **Courses read** (the brief's list, 16.01–16.04, 16.100, 16.120, 16.333, 16.20, 16.50, 16.512, 16.346,
  plus 16.07 Dynamics and 16.001, which carry the orbit and structures problems an undergraduate course
  sets): 16.100 (9 homework sets, 2 take-home exams), 16.01 Unified (Spring 2004 fluids problems F1–F20,
  fluids quizzes 1–2; lecture list), 16.120 (problem sets 3–8, oral final), 16.333 (4 homework sets),
  16.20 (11 home assignments), 16.50 (10 homework sets, 3 quizzes), 16.346 (16 exercise sets), 16.07
  (homework 5–7, 10–12; three finals), 16.001 (problem sets 7–13). 16.512 publishes no problem sets.
- **Not on OCW**: no 16.02/16.03/16.04 pages (the Unified sequence is one OCW course, 16.01).

## 2. NASA Glenn, _Beginner's Guide to Aeronautics_ (used, type only)

- **robots.txt**: <https://www.grc.nasa.gov/robots.txt> returned 404 (none);
  <https://www1.grc.nasa.gov/robots.txt> (the site's new home): `User-agent: * / Disallow:` (all allowed).
- **Statement** on the guide's index (<https://www.grc.nasa.gov/www/k-12/airplane/>): "You are
  encouraged to download and modify these presentations for your own use. … All of this information
  was developed in the public domain." The activity pages are written by named contributing teachers
  ("A wide variety of aerospace activities and lesson plans have been generated by active teachers,
  educators, and NASA engineers and scientists"), so authorship is mixed; the nine activity records are
  **type only** to be safe, and are bridge level (grades 9–12).
- **Worked problems**: the guide explains equations; it has no college problem sets. The brief's 15
  NASA records a course could not be met from it.

## 3. JPL, _Basics of Space Flight_ (titles only)

- **robots.txt** (<https://science.nasa.gov/robots.txt>): `User-agent: * / Allow: /`.
- **Licence**: to confirm. The index, chapters 3–5 and the editorial page were read; no reuse statement
  was found, and JPL is run by Caltech under contract, so NASA's general public-domain status is not
  assumed. Chapter titles only; the book has no exercises.

## 4. Skipped or blocked

| Source                                                       | What happened                                                                                            |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Leishman, _Introduction to Aerospace Flight Vehicles_ (ERAU) | `eaglepubs.erau.edu` returned HTTP 403 to every request (robots.txt included) through the proxy: skipped |
| Bar-Meir, _Compressible Fluid Mechanics_ (Potto)             | `www.potto.org` did not resolve (curl status 000): skipped                                               |
| NACA Report 1135                                             | `ntrs.nasa.gov` reachable (robots.txt 200); not fetched in this round (relation forms only were wanted)  |
| MIT 16 Unified _Thermodynamics and Propulsion_ notes         | web.mit.edu, no licence stated (open point 7); not fetched                                               |
| AP Physics C and GRE Physics (orbital bridge items)          | type-only sources the plan lists for 5 items each; not fetched in this round                             |
| Commercial titles (Anderson, Nelson, Megson, Sutton, Curtis) | named only where an OCW syllabus cites them; no publisher pages fetched                                  |
| NCEES FE specifications                                      | owned by research group R3 (earth and geography) under the brief's ownership rule; referenced, not filed |

## 5. Counts and what is short

144 records against a target of 30–40 a course (180–240): aerodynamics 40, aerospace-structures 29,
orbital-mechanics 22, flight-mechanics 20, propulsion 17, compressible-flow 16. Short because Leishman
was blocked, NASA has activities rather than problems, and the graduate OCW courses (16.120, 16.346)
set derivations. Compressible flow and propulsion are the thinnest; AP Physics C (orbits), GRE Physics and
a reachable compressible-flow text would close the gap.
