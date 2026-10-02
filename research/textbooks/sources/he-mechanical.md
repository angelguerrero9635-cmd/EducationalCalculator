# College sources: Mechanical engineering (research group R3)

Reference only; nothing here is part of the app (`research/README.md`). Plan:
`docs/plans/he.mechanical.md`, courses 10–15 (Engineering Thermodynamics, Fluid Mechanics, Heat
Transfer, Machine Design, Mechanical Vibrations, Manufacturing Processes). Fetching followed the
rules in `he-classical.md` (same date, User-Agent, delays and robots.txt reading; that file has
the host table, including the blocked hosts). Records: `research/questions/college/mechanical.jsonl`
(227 records); tables of contents: `research/textbooks/toc/college/*.json`; crosswalk:
`research/textbooks/college/mechanical.md`; marks: `research/questions/college/marks/mechanical.md`.

## Hosts added for this field

| Host                      | robots.txt                    | Used                                                                        |
| ------------------------- | ----------------------------- | --------------------------------------------------------------------------- |
| ahtt.mit.edu              | `Crawl-delay: 30`             | yes: the home page (licence) and the book PDF, one request each, 30 s apart |
| pressbooks.bccampus.ca    | **403** (site bot protection) | no; Yan was read on LibreTexts                                              |
| openoregon.pressbooks.pub | **403**                       | no; Virasak was read on Workforce LibreTexts                                |
| potto.org                 | **TLS certificate expired**   | no (Bar-Meir not read)                                                      |

## Textbooks

### Lienhard IV and Lienhard V, _A Heat Transfer Textbook_ (copyrighted, free to download) — `lienhard-a-heat-transfer-textbook`

- Read: version 6.00 (19 April 2024), the end-of-chapter problems of chapters 1–8 and 10.
- Licence, from <https://ahtt.mit.edu/>: "Please note that this material is copyrighted under U.S.
  Copyright Law. The authors grant you the right to download and print it for your personal use
  or for non-profit instructional use. Any other use, including copying, distributing or
  modifying the work for commercial purposes, is subject to the restrictions of U.S. Copyright
  Law and the Berne International Copyright Convention." Confirms the plan. Titles only in the
  TOC; questions as types.
- Recorded: 56 type-only records (`AHTT-<problem>`).

### Yan, _Introduction to Engineering Thermodynamics_ (CC BY-NC-SA 4.0) — `yan-introduction-to-engineering-thermodynamics`

- Read on LibreTexts (6 chapters, 44 sections; the BCcampus copy returned 403). Licence line:
  "shared under a CC BY-NC-SA 4.0 license and was authored, remixed, and/or curated by Claire Yu
  Yan". Confirms the plan.
- The LibreTexts chapter reviews are summaries with no problems, and the practice problems of the
  BCcampus edition were unreachable: **no Yan question records**. Thermodynamics reached its target
  from MIT OCW 16.050.

### Virasak, _Manufacturing Processes 4-5_ (CC BY 4.0) — `virasak-manufacturing-processes-4-5`

- Read on Workforce LibreTexts (8 chapters, 24 units; the Open Oregon copy returned 403); the
  index states CC BY. Chapter and unit titles only: the review questions sit inside the unit
  pages, which were not fetched. Manufacturing reached its target from MIT OCW 2.008 and DoITPoMS.

### Bar-Meir, _Fluid Mechanics_ (GNU FDL)

- potto.org has an expired TLS certificate and was not read; no LibreTexts copy was found on the
  Mechanical Engineering shelf. Fluid mechanics comes from MIT OCW 2.06.

### MIT OpenCourseWare (CC BY-NC-SA 4.0)

- Courses with records here (each has `toc/college/mit-ocw-*.json`): 16.050 Thermal Energy (Fall
  2002), 2.06 Fluid Dynamics (Spring 2013), 2.003SC Engineering Dynamics (Fall 2011, the
  vibration problem sets 9–11 and the final), 2.003J Dynamics and Vibration (Fall 2002, problem
  sets 11–12), 2.008 Design and Manufacturing II (Spring 2025), 2.007 Design and Manufacturing I
  (Spring 2009, gears), 3.35 Fracture and Fatigue (Fall 2003, fatigue). Licence as in
  `he-classical.md`.
- 2.051 Introduction to Heat Transfer (Fall 2015) has only one review sheet on OCW (3 problems):
  read, not recorded (AHTT covered heat transfer). 2.72 Elements of Mechanical Design (Spring 2009) publishes no problem sets (a lathe project only): no records, which is why machine design
  is short. 2.51 and 2.830J were in the harvest list; 2.51 returned no problem files and 2.830J
  (control of manufacturing processes) was not used.
- 16.050 problem sets cite problems from commercial texts by number ("Reynolds and Perkins, Problem
  9.61"); those were not looked up or recorded.

### DoITPoMS, Roylance, Strength of Materials

- See `he-classical.md`. Their machine-design, forming, casting and additive-manufacturing items
  are filed here (DoITPoMS 12, Roylance 9, Strength of Materials 3).

### Not read

- IAPWS-IF97 (an engine source, not a question source), the 16.Unified thermodynamics notes
  (licence to confirm; 16.050 covered the same course), NPTEL _Design of Machine Elements_ (pages
  script-rendered, licence not shown), and commercial texts (Çengel, Fox and McDonald, Incropera,
  Shigley, Rao, Kalpakjian): no titles-only files.

## Question sources

| Source                                    | Licence                                 | Content | Records |
| ----------------------------------------- | --------------------------------------- | ------- | ------- |
| A Heat Transfer Textbook problems         | © authors, free for non-profit teaching | type    | 56      |
| MIT OCW 16.050                            | CC BY-NC-SA 4.0                         | type    | 45      |
| MIT OCW 2.06                              | CC BY-NC-SA 4.0                         | type    | 40      |
| MIT OCW 2.003SC and 2.003J (vibrations)   | CC BY-NC-SA 4.0                         | type    | 29      |
| MIT OCW 2.008, 2.007, 3.35, 3.032, 2.092  | CC BY-NC-SA 4.0                         | type    | 33      |
| DoITPoMS, Roylance, Strength of Materials | CC BY-NC-SA 4.0                         | type    | 24      |

By course (target in brackets): thermodynamics 43 (40), fluid mechanics 40 (40), heat transfer
59 (40), machine design **22 (30)**, vibrations 31 (30), manufacturing 32 (30). Machine design is
short: no open machine-design problem set was reachable (2.72 has none on OCW; the Pressbooks and
NPTEL sources were blocked or unclear).
