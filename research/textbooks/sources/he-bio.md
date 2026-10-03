# College bioengineering (`he.engineering.biomechanics` … `tissue-engineering`, field `bio`): sources

Research group R2, retrieved 2026-10-02, under the same fetching rules as `he-biology.md` (User-Agent,
one request per second per host or the host's Crawl-delay, robots.txt first, scratch cache). These
are the five Bioengineering courses of the biology plan (`docs/plans/he.biology.md`). Reference
only: nothing here goes into a lesson, a picture or a test.

| File                                                                                                                           | What                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `toc/college/mit-ocw-20.330j-2007.json`                                                                                        | MIT OCW Fields, Forces and Flows in Biological Systems (fluids, fields, transport) |
| `toc/college/mit-ocw-20.310j-2015.json`                                                                                        | MIT OCW Molecular, Cellular, and Tissue Biomechanics                               |
| `toc/college/mit-ocw-hst.151-2005.json`                                                                                        | MIT OCW Principles of Pharmacology (receptors, pharmacokinetics)                   |
| `toc/college/mit-ocw-20.309-2006.json`                                                                                         | MIT OCW Instrumentation and Measurement (four lab modules)                         |
| `toc/college/mit-ocw-20.441j-2009.json`, `-3.051j-2006`, `-20.462j-2006`                                                       | MIT OCW biomaterials courses                                                       |
| `toc/college/shareok-breen-bme-lab-manual-v1.json`                                                                             | Breen, _Biomedical Engineering Lab Manual, Volume 1_ (CC BY-NC-SA 4.0): 7 modules  |
| `toc/college/pearson-truskey-transport-2e.json`, `elsevier-enderle-bronzino-bme-3e`, `elsevier-ratner-biomaterials-science-4e` | Commercial, titles only                                                            |
| `../college/bio.md`                                                                                                            | Crosswalk: each bioengineering topic → where each book teaches it                  |
| `../../questions/college/bio.jsonl`                                                                                            | 74 question records, all `"content": "type"`                                       |

The 6.021J and HST.542J courses (`he-biology.md` §1) also supply biotransport records.

## 1. MIT OpenCourseWare (used; CC BY-NC-SA 4.0, type only)

Licence as confirmed in `he-chemistry.md` §1. Courses read: 20.330J Spring 2007 (Jongyoon Han,
Scott Manalis): problem sets 1, 4 and 10; 20.310J Spring 2015 (Roger
Kamm, Alan Grodzinsky): problem sets 1–8 (sets 3–5 only cite textbook problems by number; set 7's
PDF has no extractable text); HST.151 Spring 2005 (Carl Rosow, David Standaert, Gary Strichartz):
midterm and final (the posted copies include the answer key; only the questions were used); 20.309
Fall 2006 (Maxim Shusteff, Peter So, Scott Manalis): homework 1–3; 20.441J Fall 2009 (Ioannis
Yannas, Myron Spector): homework 1–5; 3.051J Spring 2006 (Anne Mayes): problem sets 1–7 and the
practice final; 20.462J Spring 2006 (Darrell Irvine): problem sets 1–5, exams 1–2. Journal figures
that OCW removed or marks as excluded from its licence were not used. 2.79J and 2.787J were checked
and have no problem sets.

## 2. Biomedical Engineering Lab Manual, Volume 1 (used)

- **Where.** Listed in the Open Textbook Library (<https://open.umn.edu/opentextbooks/textbooks/1472>,
  robots.txt Crawl-delay 120, honoured); the file is in the University of Oklahoma's SHAREOK
  repository. robots.txt of shareok.org disallows search, admin and workflow paths, not items or
  bitstreams; the PDF came from `/server/api/core/bitstreams/<id>/content` (95 pages).
- **Licence.** The SHAREOK item record gives `dc.rights` "Attribution-NonCommercial-ShareAlike 4.0
  International" with <http://creativecommons.org/licenses/by-nc-sa/4.0/>; the PDF says "© Sarah
  Breen, PhD … 2023 … released under the Creative Commons License" without naming one. Recorded as
  **CC BY-NC-SA 4.0** (the plan's "open (confirm the exact licence)").
- **Read.** Pre-lab and post-lab questions of modules 1–7 (levers, functional arm and leg models,
  ultrasound phantoms, EMG and grip strength, uniaxial and viscoelastic testing): 14 records.

## 3. Commercial texts (titles only)

| Text                                           | Page read (robots.txt allows it)       | Result                                                                                           |
| ---------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Truskey, Yuan and Katz, Transport Phenomena 2e | pearson.com product page 9780131569881 | 17 chapters in three sections                                                                    |
| Enderle and Bronzino, Introduction to BME 3e   | shop.elsevier.com product page         | 17 chapters                                                                                      |
| Ratner et al., Biomaterials Science 4e         | shop.elsevier.com product page         | 3 parts and their sections (chapter headings not copied)                                         |
| Webster, Medical Instrumentation 5e (Wiley)    | wiley.com product page                 | **chapters not recorded**: the contents are a PDF on media.wiley.com, which robots.txt disallows |
| Library contents scans (toc.library.ethz.ch)   | —                                      | robots.txt disallows; not used                                                                   |

## 4. Not reachable

- **Human Biomechanics / Biomechanics of Human Movement** (pressbooks.bccampus.ca): the host
  answers with a Cloudflare challenge, so no chapter list or licence could be read; not worked
  around. This leaves gait analysis (`biomechanics#2`) with no records.
- **eng.libretexts.org (Biological Engineering):** robots.txt read; its shelf was not used for records.
- **NCEES FE (biomedical items), MCAT:** rejected; not fetched.

## 5. Records against the target (15 a course)

biomechanics 17, biomaterials 18, biotransport 18, bioinstrumentation 11 (short by 4),
tissue-engineering 10 (short by 5; `tissue-engineering#2` bioreactors has none).
