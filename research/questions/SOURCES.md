# Sources

Reference only; never bundled or imported by the app (see `../README.md`). Every record in
`math/*.jsonl` and `science/*.jsonl` came from a page fetched between 2026-09-26 and
2026-09-27 (UTC); each record carries `"retrieved": "2026-09-26"`, the day the collection
started. Fetching was sequential, at most one request per second per host, with the
User-Agent `EducationalCalculatorResearch/0.1 (offline study-app research; contact …)`, and
followed each site's robots.txt.

## 1. NAEP released questions (NCES) — used first

- **Where:** NAEP Questions Tool (NQT), <https://www.nationsreportcard.gov/nqt/>. The tool is a
  single-page app; its own public JSON endpoints (found in its JS bundle
  `static/js/main.3ba7a6ab.chunk.js`) were used:
  `api/querypanel/subjectgradeinfo` and `api/queryresults/getTabular` (item lists),
  `api/queryresults/GetItem?tableID=…` (question HTML; this is each record's `itemUrl`) and
  `api/queryresults/GetItemScoreGuide?tableID=…` (answer key or scoring guide).
  `GetItemSampleResponses` (scored student responses) and `GetItemPerformanceData` were
  **not** fetched, so no student work is stored. nationsreportcard.gov has no robots.txt
  (404).
- **Reuse statement** (NQT → footer → "Copyright Policy", text served in the same bundle,
  <https://www.nationsreportcard.gov/nqt/>):

  > "Material contained in the NAEP Questions Tool is from the National Assessment of
  > Educational Progress (NAEP). This material is in the public domain (excluding any
  > third-party copyrighted material it may contain), and permission is therefore not
  > required to reproduce it. Users of NAEP items that include third-party copyrighted
  > materials, e.g., reading passages, photographs, images, etc., must seek and receive
  > copyright permission from the copyright holder before that material is reproduced
  > elsewhere. Material that is copyrighted contains a citation line specifying the owner of
  > the content."

  > "Although all other material in the NQT is in the public domain and permission is not
  > required to reproduce it, please print an acknowledgment of its source. … SOURCE: U.S.
  > Department of Education, Institute of Education Sciences, National Center for Education
  > Statistics, National Assessment of Educational Progress (NAEP), 2013 Reading Assessment."

  Each NAEP record's `license.attribution` is that acknowledgment with the item's year and
  subject. No separate statement was found on the nces.ed.gov pages checked
  (`/nationsreportcard/about/`); the NQT statement above is the one relied on.

- **Third-party copyright check:** any item whose HTML carries a citation line (©,
  "copyright") was skipped. Found and skipped (all grade 8 science, photo credits to
  Shutterstock/iStockphoto/agefotostock): 2024-8S2 #3, 2024-8S5 #9, 2024-8S8 #10 and #11,
  2024-8S10 #9, and the 2024-8S85 scenario task (#1–#5). None of the chosen math items had a
  citation line.
- **What was taken:** grades 4 and 8 only (grade 12 skipped), Mathematics and Science.
  Items were chosen per taxonomy skill from the NQT descriptions and then read; at most 10
  NAEP questions per skill (newest first, alternating grade 4 and grade 8).
- **Also skipped:** NAEP scenario-based tasks (SBT: "How Seeds Travel", "Clear Water") —
  multi-screen simulations whose text does not stand alone; duplicate items given at both grades (2005-8S13/8S14 and 2000-8S9 repeat
  grade 4 blocks — only the grade 4 copy is kept).
- **Dropped after reading:** items whose image alt text is missing ("No Alt Text"), is only
  in Spanish, or does not contain the question itself (for example tableIDs 90204, 90205,
  11628, 25221), items that refer to another question for context, and items whose choices
  are unlabelled pictures ("Graph").
- **Text notes:** newer (2017+) items are images in NQT; their question text is NCES's own
  alt text for the image (noted per record). MathML was rendered to plain text
  (`4/6 - 1/6 =`). Correct-answer markers in alt text were removed from the question and
  the answer comes from the score guide. Constructed-response `answer` is the top score
  level of the NAEP scoring guide (rubric wording only).

## 2. Other U.S. federal public-domain material

None used. No other federal source with released K–8 question sets and an explicit
public-domain statement was found in the time available.

## 3. Illustrative Mathematics (CC BY 4.0)

- **Where:** <https://curriculum.illustrativemathematics.org/> (IM's curriculum site;
  robots.txt allows all). Public "Practice" pages only: IM K–5 Math unit practice pages
  (`/k5/teachers/<grade>/unit-N/practice.html`) and IM 6–8 Math lesson practice pages
  (`/MS/teachers/<course>/<unit>/<lesson>/practice.html`).
- **License statements (page footers):**
  - K–5 (e.g. <https://curriculum.illustrativemathematics.org/k5/curriculum.html>):
    > "© 2021 Illustrative Mathematics®. Licensed under the Creative Commons Attribution 4.0
    > license. The Illustrative Mathematics name and logo are not subject to the Creative
    > Commons license …"
  - 6–8 (e.g. <https://curriculum.illustrativemathematics.org/MS/index.html>):
    > "IM 6–8 Math was originally developed by Open Up Resources and authored by Illustrative
    > Mathematics®, and is copyright 2017-2019 by Open Up Resources. It is licensed under the
    > Creative Commons Attribution 4.0 International License (CC BY 4.0). … Adaptations and
    > updates to IM 6–8 Math are copyright 2019 by Illustrative Mathematics, and are licensed
    > under the Creative Commons Attribution 4.0 International License (CC BY 4.0)."
  - Both footers also note: "These materials include public domain images or openly licensed
    images that are copyrighted by their respective owners." Only the problem text and the
    page's own image alt text/long descriptions are stored — no images.
- **Attribution:** every IM record has `license.attribution` with the footer text, course,
  grade/unit/section or lesson, problem number and page URL.
- **Not used:** solutions ("Teachers with a valid work email address can … sign in") and all
  assessments (checkpoints, mid/end-of-unit) sit behind a sign-in, so IM `answer` is `null`.
  "Exploration" problems were left out. Kindergarten unit 1 and 8, grade 1 unit 8 and
  grade 5 unit 8 have no public practice page (404).
- **Skill mapping:** pre-unit problems carry a CCSS code ("Practicing Standards"), which is
  kept in `standardCode` and drives the mapping; other problems are mapped by section (K–5)
  or lesson (6–8) topic. Review problems in 6–8 ("From Unit X, Lesson Y") are mapped by the
  lesson they come from. IM questions per skill: 3–8, fewer where NAEP already has many.

## 4. State released items

None used. The Massachusetts DESE release page
(<https://www.doe.mass.edu/mcas/release.html>) was checked and states no written reuse grant
(its robots.txt also disallows `/mcas/question.asp` and sets a 15 s crawl delay). Other
states were not pursued: by the brief, a state is used only when its page grants reuse in
writing, and none was confirmed.

## Off limits, not visited

IXL, Khan Academy, Quizlet, Chegg, TPT, publisher sites (including im.kendallhunt.com
sign-in pages), OpenStax (its robots.txt disallows `/books/` for AI crawlers), and anything
behind a login or under NC/ND/all-rights-reserved terms (for example the old Illustrative
Mathematics task library, CC BY-NC-SA).
