# College sources: civil (plan group ACC, research group R4)

Reference only: nothing recorded here goes into a lesson, picture or test (`../../README.md`). Retrieved
2026-10-02 by research group R4 with the User-Agent
`EducationalCalculatorResearch/0.3 (offline study-app research; contact …)`, sequentially, at most one request
per second per host (five seconds on `*.libretexts.org`, as its robots.txt asks). Raw pages stayed in a scratch
folder.

| File                                                        | What                                                                  |
| ----------------------------------------------------------- | --------------------------------------------------------------------- |
| `toc/college/mit-ocw-1-060.json`                            | 1.060 Engineering Mechanics II (pipe and open-channel hydraulics)     |
| `toc/college/mit-ocw-1-85.json`                             | 1.85 Water and Wastewater Treatment Engineering                       |
| `toc/college/mit-ocw-1-061.json`                            | 1.061 Transport Processes in the Environment                          |
| `toc/college/mit-ocw-1-34.json`                             | 1.34 Waste Containment and Remediation Technology                     |
| `toc/college/mit-ocw-1-051.json`                            | 1.051 Structural Engineering Design (concrete and steel)              |
| `toc/college/mit-ocw-1-054.json`                            | 1.054 Mechanics and Design of Concrete Structures                     |
| `toc/college/mit-ocw-1-364.json`                            | 1.364 Advanced Geotechnical Engineering                               |
| `toc/college/mit-ocw-1-571.json`                            | 1.571 Structural Analysis and Control                                 |
| `toc/college/wikibooks-fundamentals-of-transportation.json` | Wikibooks _Fundamentals of Transportation_                            |
| `toc/college/udoeyo-structural-analysis.json`               | Udoeyo, _Structural Analysis_                                         |
| `toc/college/verruijt-soil-mechanics.json`                  | Verruijt, _Soil Mechanics_ (titles)                                   |
| `toc/college/fhwa-hec-22.json`                              | FHWA HEC-22 _Urban Drainage Design Manual_                            |
| `toc/college/dma-geodesy-for-the-layman.json`               | _Geodesy for the Layman_ (titles)                                     |
| `../questions/college/civil.jsonl`                          | 179 records: 51 text (Wikibooks 37, HEC-22 14), 128 type only         |
| `college/civil.md`                                          | Crosswalk: topic → units, examples, ranges, notation; question counts |

## 1. MIT OpenCourseWare (used, type only)

robots.txt and licence as in `he-aerospace.md` §1 (CC BY-NC-SA 4.0, confirmed on
<https://ocw.mit.edu/pages/privacy-and-terms-of-use/>). Courses on OCW from the brief's list: 1.050, 1.060,
1.061, 1.201J, 1.34, 1.571, 1.85; added 1.051, 1.054 and 1.364, which carry the design and foundation sets.
1.050 (Fall 2007) lists no problem-set files in its sitemap; 1.201J (transportation systems analysis, demand
and economics) has no geometric or traffic-flow problems and was not read; no 1.361 resources are posted.
Problems that OCW marks "Content removed due to copyright reasons" (textbook problems, e.g. 1.060 PS3,
1.051 "Solve problem 3.11 in the textbook") were skipped. 1.571 problem sets 5–6 are scanned images with
no text layer and were not used.

## 2. Wikibooks, _Fundamentals of Transportation_ (used, text)

- **robots.txt** (<https://en.wikibooks.org/robots.txt>): `User-agent: *` disallows `/w/`, `/api/`,
  `/wiki/Special:` and others; `/wiki/` pages are allowed. Only `/wiki/Fundamentals_of_Transportation/…`
  pages were read (no `action=raw`, which sits under `/w/`).
- **Licence, confirmed**: every page's footer links <https://creativecommons.org/licenses/by-sa/4.0/>
  ("Text is available under the Creative Commons Attribution-ShareAlike License"). CC BY-SA allows copying
  with attribution, so the 37 records carry the problem text as published (mathematics re-typed from the
  page's alt text, labels such as "TProblem" dropped) and the example's published answer. Two published
  worked examples carry errors (Traffic Flow Example 1 uses 60 for a listed 50; Example 3 sorts a different
  list); the records say so in `notes`.
- **Not in the book**: pavement design and freeway capacity (LOS) pages.

## 3. Udoeyo, _Structural Analysis_ (used, type only)

- Manifold project page <https://temple.manifoldapp.org/projects/structural-analysis>; `temple.manifoldapp.org`
  has no robots.txt (404) and the PDF's host `cdn.temple.manifoldapp.org` answered 403 for robots.txt (an
  object store with no file); the PDF itself (the page's "Download PDF") was read once.
- **Licence, confirmed** (copyright page of the PDF): "Copyright © 2020 by Felix F. Udoeyo. All material in
  this work is licensed under a Creative Commons Attribution-NonCommercial-No Derivatives 4.0 United States
  License unless otherwise noted." NC-ND: types only.

## 4. Verruijt, _Soil Mechanics_ (titles and types only)

- <https://geo.verruijt.net/robots.txt>: `User-agent: *` with no rules (all allowed). The 2012 screen edition
  PDF (<https://geo.verruijt.net/software/SoilMechBook2012.pdf>) was read; its title page says only that it is
  "the screen version of the book SOIL MECHANICS, an elementary textbook for students of civil engineering",
  with no licence (open point 11: free to read, all rights reserved). Chapter titles and problem types only.

## 5. U.S. government sources (public domain)

- **FHWA HEC-22** (3rd ed., 2009, archived), <https://www.fhwa.dot.gov/engineering/hydraulics/pubs/10009/10009.pdf>.
  robots.txt (<https://www.fhwa.dot.gov/robots.txt>): `Crawl-delay: 1`; `/engineering/hydraulics/` is not
  disallowed (the Disallow line is commented out). A U.S. government work; the 14 records copy each worked
  example's "Given … Find" text with attribution. HDS-4, HDS-5 and NRCS NEH 630 / TR-55 were not fetched
  (time); the NRCS curve-number method appears through HEC-22 chapter 3.
- **Geodesy for the Layman** (DMA TR 80-003, on geodesy.noaa.gov): robots.txt disallows only `/orbits/…`,
  `/PUBS_LIB/BC-4/`, `/initiatives/HeightMod/HModReport/` and `/cgi-bin/`. The front matter says "DMA TR
  80-003 contains no copyrighted material, nor is a copyright pending. This publication is approved for public
  release; distribution unlimited." Titles only (no exercises).
- **Not fetched**: EPA water and wastewater manuals and SWTR CT tables, EPA AP-42 and dispersion guidance,
  FHWA HDS-4/HDS-5, NRCS NEH 630 and TR-55 (time; the OCW courses cover the same kinds).

## 6. Code documents and the FE specification

AISC 360-22, AISC _Design Examples_ and ACI 318-19 were not fetched (facts only would be allowed; the plans'
pages need shape properties, which are entered by hand). The NCEES FE Civil specification is owned by research
group R3 under the brief's ownership rule.

## 7. Counts and what is short

179 records against 30–40 a course (240–320 for 8 courses): environmental 37, transportation 37,
hydraulics-hydrology 33, structural-analysis 26, soil-mechanics 25, concrete-design 13, steel-design 8,
surveying 0. No open source with problems was reached for surveying, pavement design (transportation#2) or
compaction (soil-mechanics#1); steel design has only the 1.051 and Udoeyo load-combination items. A
surveying text (e.g. a LibreTexts or Pressbooks surveying book) and FHWA pavement manuals are the next
places to look.
