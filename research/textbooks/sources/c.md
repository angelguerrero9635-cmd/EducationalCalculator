# Sources, group c: other widely used K–8 math programs

Tables of contents for Eureka Math / EngageNY (open license, full), enVision, HMH Into Math,
Big Ideas Math and McGraw Hill Reveal Math (commercial, titles only), and a representative set of
Eureka Problem Set problems. Reference material for the lesson chat only: nothing here is
shipped, and lesson text stays original.

Every host's robots.txt was read first and obeyed; at most one request per second per host;
User-Agent `EducationalCalculatorResearch/0.2 (offline study-app curriculum research; contact
angel.guerrero9635@gmail.com)`; every page cached so nothing was fetched twice. No logins,
paywalls or captchas were involved. Retrieved 2026-09-28. Check the files with
`python3 research/textbooks/tools/check_c.py`.

| File                                 | What                                                                 |
| ------------------------------------ | -------------------------------------------------------------------- |
| `toc/math/eureka.json`               | Eureka / EngageNY K–8: 59 modules, 287 topics, 1,183 lessons (full)  |
| `toc/math/envision.json`             | enVision Mathematics 2024 K–8: 122 topics, 862 lessons (titles only) |
| `toc/math/hmh-math.json`             | HMH Into Math K–8: 56 units, 165 modules, 683 lessons (titles only)  |
| `toc/math/big-ideas.json`            | Big Ideas Math 2022 K–8: 115 chapters, 745 lessons (titles only)     |
| `toc/math/mcgraw-math.json`          | Reveal Math 2020 K–8: 112 units/modules, 725 lessons (titles only)   |
| `practice/math/<grade>.eureka.jsonl` | 283 Eureka Problem Set problems, one per topic                       |
| `screenshots/eureka/`                | 198 WebP clips (2.4 MB)                                              |
| `tools/check_c.py`                   | Checker: fields, skill ids, screenshots, counts per grade            |

## Eureka Math / EngageNY Mathematics (`eureka`), openly licensed

- **What:** the 2015 EngageNY release of Eureka Math (A Story of Units K–5, A Story of Ratios
  6–8), written by Great Minds for the New York State Education Department (NYSED).
- **Where it is published now:** engageny.org is retired and redirects to
  <https://www.nysed.gov/curriculum-instruction/engageny>. NYSED's own archive page
  (<https://www.nysed.gov/curriculum-instruction/engageny-mathematics-curriculum-files-archive>)
  could not be read from this environment (its TLS chain failed verification through the
  session proxy, and a second fetcher got HTTP 503), so its wording is not quoted here. The
  files themselves are in the Internet Archive item **"EngageNY Mathematics Archive"**,
  creator "New York State Education Department", <https://archive.org/details/engageny-mathematics>
  (one zip per module; archive.org's zip browser serves single files, so only the files needed
  were fetched: each module's listing, its Module Overview, and one lesson PDF per topic).
  The item was uploaded by ISKME (OER Commons) and its description says: "These resources were
  originally housed at engageny.org before being migrated to a Sharepoint server managed by
  NYSED ... These resources have been added to Archive.org to help teachers more easily find
  and use them in their own classrooms." archive.org's robots.txt only disallows `/control/`
  and `/report/`. OER Commons, which also indexes EngageNY, answered 403 to our requests
  (including robots.txt), so it was not used.
- **License, as printed on every page of the files** (for example
  <https://archive.org/download/engageny-mathematics/Grade%203%20Module%201.zip/Module%201%2FMath%20G3-M1%20Lessons%2FMath-G3-M1-Topic-A-Lessons-1-3%2Fmath-g3-m1-topic-a-lesson-1.pdf>):

  > "This work is derived from Eureka Math ™ and licensed by Great Minds. ©2015 -Great Minds.
  > eureka math.org This file derived from G3-M1-TE-1.3.0-06.2015 This work is licensed under a
  > Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License."

  The archive.org item's metadata gives `licenseurl: https://creativecommons.org/licenses/by-nc-sa/4.0/`.
  We record **CC BY-NC-SA 3.0**, the license printed on the files; every practice record carries
  the footer attribution and the file's "derived from" id. The newer Eureka Math² and Great
  Minds' current editions are separate commercial products and were not used.

- **Table of contents:** parsed from each module's Module Overview (.docx): the table of
  contents gives module and topic titles (and 6–8 lesson titles); the "Overview of Module Topics
  and Lesson Objectives" table gives K–5 lessons. **K–5 lessons have no titles in Eureka; their
  `title` is the lesson objective word for word.** Multi-day lessons keep their range ("7–8").
  Topic standards (6–8) are kept in `standards`. Units link to the module zip, `overviewUrl`
  to the overview, lessons to the lesson PDF (6–8: the teacher PDF).
- **Skills:** every topic is mapped; 15 topics have no Grade-level skill in the taxonomy
  (year-in-review topics, Grade 1 coins, Grade 4 multi-digit addition and subtraction, Grade 5
  line plots and fractions as division, Grade 6 volume with fractional edges, Grade 7 equivalent
  expressions, constructing triangles and slicing solids) and say so in `notes`.
- **Practice (`practice/math/<grade>.eureka.jsonl`):** the first Problem Set problem of every
  topic, from the first lesson in the topic that has a Problem Set (K–5 from the lesson PDF,
  6–8 from the student PDF). Counts: K 34, G1 35, G2 35, G3 35, G4 36, G5 35, G6 27, G7 23,
  G8 23 = **283** of 287 topics. Not included: G2 M1 Topic A and G5 M6 Topic E (no Problem Set
  in the topic's lessons), G2 M2 Topic D (the lesson files are missing from the archived zip),
  G4 M6 Topic E (only .docx files in the zip). Kindergarten Problem Sets are unnumbered picture
  pages, so a K record is the whole first page (noted in each record).
  - Text is extracted from the PDF and then read against the page: stacked fractions, digit-by-
    digit vertical algorithms, drawn blanks and symbol-font letters were corrected by hand for
    53 records (fractions are written 3/4 and 2 1/12, exponents ^, spelled-out segment/ray/
    line). Remaining layout noise is mostly in picture-heavy K–2 pages, where the screenshot
    carries the problem.
  - `picture.description` is our own short description: the PDFs have no alt text.
  - Screenshots: a clip of the problem from the PDF page, 640 px wide, WebP quality 70, for
    every problem with a figure (174) and for 24 text problems whose math the text cannot show;
    2.4 MB in all.
  - `answer` is null: the Problem Set answers are in the modules' teacher materials and were not
    extracted. `type` is our classification (constructed response or short answer).
  - `skillId` is the topic's first skill, `alsoSkills` the rest; 14 records have `skillId: null`
    because their topic has no matching skill.

## Commercial programs (titles only)

All four are all-rights-reserved textbooks. Only chapter, unit, module, topic and lesson
**titles** are stored, as our own table of contents; no problems, lesson text, images or PDFs
were copied into the repo. Publisher PDFs that are publicly served were read in the scratch
cache to take titles only.

The one public listing that covers every grade K–8 for all four programs is IXL's textbook
skill-plan pages, `https://www.ixl.com/math/skill-plans/<plan>` (robots.txt allows
`/math/skill-plans/`; the pages need no login). They name each textbook chapter and lesson and
the IXL skills aligned to it; we keep only the textbook's own titles and numbers, not IXL's
skill names. IXL's statement on every plan (for example
<https://www.ixl.com/math/skill-plans/envision-mathematics-common-core-2024-grade-3>):

> "This document includes the IXL® skill alignments to Savvas Learning Company's enVision
> Mathematics (2024) curriculum. IXL provides skill alignments as a service to teachers,
> students, and parents. The skill alignments are provided by IXL and are not affiliated with,
> sponsored by, reviewed, approved or endorsed by Savvas Learning Company or any other third
> party. IXL® and IXL Learning® are registered trademarks of IXL Learning, Inc. All other
> intellectual property rights (e.g., unregistered and registered trademarks and copyrights)
> are the property of their respective owners."

(The Into Math, Big Ideas and Reveal plans carry the same text naming Houghton Mifflin Harcourt,
Big Ideas Learning and McGraw Hill.) IXL lists the lessons it has aligned skills for, so a
lesson with no IXL skill may be missing; where we could compare with a publisher or district
listing the lesson sets matched.

### enVision Mathematics (`envision`), Savvas Learning Company, ©2024

- Source: IXL plans `envision-mathematics-common-core-2024-{kindergarten,grade-1..8}` (each
  unit's `url`). K–5 topic titles cross-checked against Harford County Public Schools' public
  curriculum documents, which name "enVision Mathematics Grade N, Savvas Learning Company, 2024"
  as their primary resource and list each topic and its lesson titles:
  `https://www.hcps.org/departments/docs/Curriculum/Math/{Kindergarten,Grade%201..5}%20Mathematics.pdf`
  (robots.txt allows `/departments/docs/`; `crossCheckUrl` on each unit). The topic titles match
  (HCPS writes "&" for "and" in two titles, and leaves out the "Step Up" topics).
- 122 topics, 862 lessons; lesson numbers are enVision's (topic-lesson, e.g. 3-4). Three G2
  lessons listed without a number got it from their neighbours (`numberInferred`).
- The Savvas program overviews on mysavvastraining.com (public PDFs, no robots.txt) were read
  but contain no table of contents; the Savvas Realize table of contents needs a login and was
  not used.
- Skills: 110 topics mapped; 12 not mapped: the six "Step Up to Grade N" topics (preview of the
  next grade) and six topics with no Grade-level skill (noted in `notes`).

### HMH Into Math (`hmh-math`), Houghton Mifflin Harcourt

- **Chosen over Go Math!** because a public listing covers every grade K–8: IXL's Go Math!
  2023 plans stop at Grade 6 and the middle-school Go Math! plans are the 2014 edition.
- Source: IXL plans `into-math-{kindergarten,grade-1..8}`. Units → modules (numbered through the
  grade) → lessons (restart at 1 in each module; Into Math prints them as module.lesson).
- 56 units, 165 modules, 683 lessons. For Kindergarten IXL lists its own skill groups instead of
  Into Math lesson titles, so K has modules only (noted in each K module). hmhco.com's robots.txt
  was read; no hmhco.com page with a table of contents was found without a login.
- Skills: mapped per module (unit skills are the union); 4 modules have no Grade-level skill.

### Big Ideas Math: Modeling Real Life (`big-ideas`), Big Ideas Learning, 2022

- Grades 6–8: section titles from the publisher's publicly served front-matter PDFs (the
  table of contents of the teacher edition), e.g.
  <https://static.bigideasmath.com/protected/content/ipe/cc22/cc22_6thgrade_ipe_fm.pdf>
  (`_7thgrade_`, `_8thgrade_`; no robots.txt on that host, served without login; read in the
  scratch cache only, not stored). Its notice: "Copyright © 2022 by Big Ideas Learning, LLC.
  All rights reserved. No part of this work may be reproduced or transmitted in any form or by
  any means ... without prior written permission of ..." We store titles only. Chapter numbers
  and titles were checked against IXL's `big-ideas-math-2022-grade-6..8` plans
  (`crossCheckUrl`); the section lists matched (IXL shortens a few titles; the publisher's are
  kept).
- Grades K–5: IXL plans `big-ideas-math-2022-{kindergarten,grade-1..5}` (no K–5 front matter was
  found at the same address pattern).
- 115 chapters, 745 lessons/sections. Skills: 111 chapters mapped, 4 not (noted).

### McGraw Hill Reveal Math (`mcgraw-math`), 2020

- **Reveal Math chosen over My Math** because it covers K–8 (My Math stops at Grade 5). Grades
  6–8 are Reveal Math Course 1, 2 and 3.
- Source: IXL plans `reveal-math-2020-{kindergarten,1st-grade..8th-grade}`. Rows that pair two
  lessons ("Lesson 1-1: … Lesson 1-2: …") were split. mheducation.com's robots.txt was read; no
  public table of contents was found there.
- 112 units/modules, 725 lessons. Skills: 103 mapped; the "Math Is..." opening units (K–5) and
  three units with no Grade-level skill are not (noted).

## Skipped

- NYSED's EngageNY archive pages: not reachable from this environment (TLS verification failure
  through the proxy; HTTP 503 from a second fetcher). The files were taken from the archive.org
  copy instead.
- OER Commons (oercommons.org): 403 to every request, robots.txt included; not used.
- Savvas Realize, HMH Ed, McGraw Hill ConnectED, Big Ideas Math online: sign-in only; not used.
- Unofficial answer-key and textbook-copy sites (search results such as envisionmathanswerkey.com,
  scribd.com, mathleaks.com): not official sources; not used.
