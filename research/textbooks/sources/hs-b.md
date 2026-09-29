# Group hs-b: OpenStax high-school math books (Grades 9, 11, 12)

Reference only: nothing here is imported, bundled or shipped.

| File                                             | What                                                                                               |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `toc/math/openstax-algebra-trig-2e.json`         | Algebra and Trigonometry 2e: every chapter and section, with URLs and skill ids (Grades 9, 11, 12) |
| `toc/math/openstax-precalculus-2e.json`          | Precalculus 2e (Grade 12)                                                                          |
| `toc/math/openstax-statistics-2e.json`           | Introductory Statistics 2e (Grade 12)                                                              |
| `toc/math/openstax-elementary-algebra-2e.json`   | Elementary Algebra 2e (Grade 9)                                                                    |
| `toc/math/openstax-intermediate-algebra-2e.json` | Intermediate Algebra 2e (Grade 11)                                                                 |
| `practice/math/<grade>.<id>.jsonl`               | A representative practice sample per book and grade                                                |
| `screenshots/<id>/<record id>.webp`              | The problem with its figure, for figure problems                                                   |
| `tools/check_hs_b.py`                            | Checks the files above and prints the counts below                                                 |

## Source: OpenStax (openstax.org), Rice University

- **Pages:** `https://openstax.org/books/<slug>/pages/<page>`. The page list comes from OpenStax's
  sitemap (`https://openstax.org/rex/sitemaps/<slug>.xml`, listed in `robots.txt`); chapter and
  section numbers and titles come from the book tree embedded in every page. Only the numbered
  section pages and the answer-key pages were fetched.
- **robots.txt** (<https://openstax.org/robots.txt>): for `User-agent: *` it disallows `/accounts`,
  `/admin`, `/l/`, `/r/`, `/confirmation/`, `/adoption-confirmation`, `/general`, `/contents`,
  `/extras`, `/errata`, `/resources`, `/apps/archive`, `/apps/archive-preview` and
  `/apps/cms/api/spike`; `/books/` is disallowed only for `GPTBot`. Book pages are therefore
  allowed for our User-Agent (`EducationalCalculatorResearch/0.2 (offline study-app curriculum
research; contact …)`). The fetcher refuses every disallowed path. Figure images are served
  from `/apps/image-cdn/v1/…` (not disallowed) and were fetched only for the screenshots.
- **Politeness:** the pages were fetched one request every 4.5 s, the few images later at one
  per 1.1 s, and every response is cached so nothing was fetched twice.

### License (quoted from each book page's "Citation/Attribution" panel)

> This book uses the Creative Commons Attribution-NonCommercial-ShareAlike License, which means
> that you can reuse and modify the material only for noncommercial purposes, must attribute
> OpenStax, and must distribute any derivative works under the same license.

> OpenStax-copyrighted images, activities, assessments, and similar components of this book are
> subject to the same licensing — CC-BY-NC-SA. They can be used for noncommercial purposes with
> attribution. Commercial use requires permission.

Attribution requirement, same panel:

> If you are redistributing all or part of this book in a noncommercial digital format, then for
> every page that includes OpenStax content, you must license the derivative work under the same
> CC-BY-NC-SA license as the original, and include on every digital page view the following
> attribution: Access for free at https://openstax.org/books/algebra-and-trigonometry-2e/pages/1-introduction-to-prerequisites

(Each book gives the same text with its own URL.) License: CC BY-NC-SA 4.0,
<https://creativecommons.org/licenses/by-nc-sa/4.0/>. **The books are CC BY-NC-SA, not CC BY 4.0**
as the brief expected; by the brief's rule this means a full table of contents (reference only)
and no more than a representative practice sample, clearly marked. Every practice record has
`"sample": true`, a `licenseNote`, and `license.attribution` ending "Access for free at <page URL>".

The same panel also says: "This book may not be used in the training of large language models
or otherwise be ingested into large language models or generative AI offerings without OpenStax's
prior written permission." These files are reference material for people who write and review
lessons; they must not be used as training data or fed to a generative AI product. Lesson text
stays original (`CLAUDE.md`), so nothing from these records goes into lessons.

## Algebra and Trigonometry 2e (`openstax-algebra-trig-2e`)

<https://openstax.org/books/algebra-and-trigonometry-2e/pages/preface>. 13 chapters, 79 sections.
Filed by content (one book, three grade entries):

| Chapters                                                                                                             | Grade | Why                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------- |
| 1–4 Prerequisites; Equations and Inequalities; Functions; Linear Functions                                           | 9     | Algebra 1 content: radicals, polynomials, factoring, linear and quadratic equations, functions, linear models              |
| 5–8 Polynomial and Rational; Exponential and Logarithmic; Unit Circle; Periodic Functions                            | 11    | Algebra 2 content: polynomial, rational, exponential, logarithmic and trigonometric functions                              |
| 9–13 Identities and Equations; Further Trigonometry; Systems; Analytic Geometry; Sequences, Probability and Counting | 12    | Precalculus content: trig identities, law of sines/cosines, polar, parametric, vectors, matrices, conics, binomial theorem |

### Practice sample

Per section: every **Try It** problem (the in-text checks after each worked example, numbered per
section) and the **first 6 numbered section exercises** (usually the "Verbal" questions and the
start of "Algebraic"/"Numeric"). Each record says which one it is in `exercise` (`kind`: "Try It"
or "Section Exercises", `n`, the exercise `group` such as "Verbal", and the `instruction` line
"For the following exercises, …" that the book puts before a run of exercises, also prefixed to
`question`).

- **Answers:** Try It answers come from the book's "Try It" answer section (all public);
  section-exercise answers from the "Answer Key" chapter page (`/pages/chapter-N`), which gives
  **odd-numbered** exercises only, so even-numbered exercises have `answer: null`.
  `source.answerUrl` says where the answer came from.
- **Math as plain text:** MathML is converted: fractions `a/b` with parentheses around compound
  parts (`-5/(2x)`, `(3/4)x`), powers `x²`, `x^(-4)`, roots `√(x)`, `∛(x)`, `ⁿ√(x)`, function names
  spaced (`sin^(-1) x`, `cos^4 θ`), subscripts `log_2(8)`, repeating decimals `0.3̄`, aligned
  working and systems as `[row; row]`. Circled labels (ⓐ, ⓑ) become `(a)`, `(b)`. An empty
  superscript in the book's markup (it displays nothing) is dropped. HTML tables become `[Table: row ; row]` with cells
  separated by `|`. Each image becomes `[Figure: <the page's alt text>]`.
- **Figures and tables referenced elsewhere:** when a Try It or exercise links to a figure or
  table elsewhere on the same page ("Using Figure 4, solve f(x) = 1"), that figure's alt text or
  table is appended as `[Figure 4, shown elsewhere on the page: …]` and it is included in the
  screenshot; `exercise.referenced` lists the labels. Links to worked Examples are left as text
  (not copied). A few Try Its refer to "the table from … above" without a link; they are left as
  published.
- **Screenshots:** for every sampled problem whose figure is an image (in the problem, in the
  run's context, or referenced). The problem's own HTML (context, problem, referenced figure,
  no solution) was rendered in Chromium on a local page with the images fetched through the
  cache (all other network blocked), clipped to the problem at 640 px, and saved as WebP q70.
  Each was looked at. Tables in HTML get no screenshot: they are in the text.
  `picture.involved` is true for images and HTML tables.

### Skill mapping

Every section maps to taxonomy skills, best match first; a chapter's `skills` are the union.
Where no skill of the filed grade fits, the nearest skill of another grade is used and the
lesson (or unit) has a `notes` line: real numbers (1.1 → `m.8.roots-irrationals`), integer
exponents and scientific notation (1.2 → Grade 8), rational expressions (1.6 →
`m.11.rational-functions`), coordinate plane and one-variable linear equations (2.1, 2.2 → Grade 8),
complex numbers (2.4 → `m.11.complex-numbers`), function notation (3.1 → `m.8.functions-intro`),
composition and inverses (3.4, 3.7 → `m.11.inverse-functions`), angles (7.1 →
`m.10.arc-sector`), right-triangle trig (7.2 → `m.10.right-triangle-trig`), two-variable systems
(11.1 → `m.8.systems-linear`), partial fractions (11.4 → nearest `m.11.rational-functions`),
probability (13.7 → `m.10.conditional-probability`, `m.7.probability`). Chapter 13's sequences
(13.1–13.3) map to `m.9.sequences` and series (13.4) to `m.11.series` although the chapter is filed
under Grade 12.

### Counts

| Grade | Chapters | Sections | Problems | Try It | Section exercises | With answer | With a picture or table | Screenshots |   MB |
| ----: | -------: | -------: | -------: | -----: | ----------------: | ----------: | ----------------------: | ----------: | ---: |
|     9 |        4 |       23 |      324 |    186 |               138 |         255 |                      17 |           8 | 0.10 |
|    11 |        4 |       23 |      319 |    181 |               138 |         250 |                      25 |          21 | 0.26 |
|    12 |        5 |       33 |      383 |    185 |               198 |         284 |                       5 |           4 | 0.06 |
|   all |       13 |       79 |     1026 |    552 |               474 |         789 |                      47 |          33 | 0.41 |

## Precalculus 2e (`openstax-precalculus-2e`)

<https://openstax.org/books/precalculus-2e/pages/preface>. 12 chapters, 73 sections, all filed
under Grade 12. It is Algebra and Trigonometry 2e from Chapter 3 on, renumbered (Functions,
Linear, Polynomial and Rational, Exponential and Logarithmic, Trigonometric, Periodic, Identities,
Further Trigonometry, Systems, Analytic Geometry, Sequences/Probability), plus 3.1 Complex
Numbers, 7.6 Modeling with Trigonometric Functions and **Chapter 12 Introduction to Calculus**
(limits numerically, graphically and by properties; continuity; derivatives → `m.12.limits-intro`).
Many problems repeat those of Algebra and Trigonometry 2e word for word; both are kept because
each record points at its own book's page. Sampling, answers (Answer Key chapter pages,
odd-numbered exercises), text conversion and screenshots are as above; skill mapping is the
Algebra and Trigonometry mapping of the same sections. Loose fits: 1.1 function notation, 2.2
graphs of linear functions, 9.1 two-variable systems (Grade 8 skills), 9.4 partial fractions,
11.7 probability. The early chapters (functions, linear, quadratic) are Algebra 1 and 2 content
filed under Grade 12 because the book is a Precalculus course.

| Grade | Chapters | Sections | Problems | Try It | Section exercises | With answer | With a picture or table | Screenshots |   MB |
| ----: | -------: | -------: | -------: | -----: | ----------------: | ----------: | ----------------------: | ----------: | ---: |
|    12 |       12 |       73 |      920 |    482 |               438 |         701 |                      56 |          40 | 0.53 |

## Introductory Statistics 2e (`openstax-statistics-2e`)

<https://openstax.org/books/introductory-statistics-2e/pages/preface>. 13 chapters, 80 sections,
filed under Grade 12. The book is laid out differently: exercises are not at the end of each
section but on chapter pages "Practice" (`N-practice`), "Homework" and "Bringing It Together",
numbered through the chapter. The Practice page groups its exercises by section (a link to the
section starts each block), so the sample is: per section, every **Try It** (numbered through
the chapter, e.g. "Try It 2.13"; `exercise.kind` "Try It") and the **first 6 Practice exercises
for that section** (`exercise.kind` "Practice", `n` is the book's chapter-wide number). Homework
and Bringing It Together pages were not sampled.

- **Context:** most Practice exercises follow "Use the following information to answer the next
  N exercises" with data or a table; that text (and any table or figure between it and the
  exercise) is prefixed to `question` and kept in `exercise.instruction`.
- **Answers:** from the chapter "Solutions" page (`N-solutions`), matched by page and exercise id
  (ids repeat between the Practice and Homework pages). The key covers odd-numbered exercises
  and a few even ones. **Try It problems in this book have no published answers** (`answer: null`).
- Some Try It boxes hold several lettered exercises (e.g. Try It 10.10 a–j); they are separate
  records (`…-TI10-10`, `…-TI10-10b`, …) and the shared stem is in the first.
- One figure's alt text on the page is in Spanish ("Gráfico de dispersión…", 12.6); it is kept as
  published.
- 145 problems carry a picture or table; most are HTML data tables (in the text, no screenshot);
  30 have image figures (histograms, box plots, normal and chi-square curves, scatter plots, tree
  diagrams) and are screenshotted.

**Skill mapping (the loosest of the three books):** the taxonomy has few statistics skills in
Grades 9–12 (`m.9.regression`, `m.10.conditional-probability`, `m.11.normal-distribution`,
`m.11.probability-distributions`, `m.12.hypothesis-testing`). Chapter 1 (sampling and data) maps to
`m.7.sampling`; Chapter 2 (descriptive statistics, graphs, quartiles, box plots, standard
deviation) to `m.6.center-spread` and `m.11.normal-distribution`; Chapter 3 to conditional
probability; 4–5 (discrete and continuous distributions) to `m.11.probability-distributions`; 6–8
(normal, central limit theorem, confidence intervals) to `m.11.normal-distribution`; 9–11 and 13
(one- and two-sample tests, chi-square, ANOVA) to `m.12.hypothesis-testing`; 12 (regression) to
`m.9.regression`.

| Grade | Chapters | Sections | Problems | Try It | Practice exercises | With answer | With a picture or table | Screenshots |   MB |
| ----: | -------: | -------: | -------: | -----: | -----------------: | ----------: | ----------------------: | ----------: | ---: |
|    12 |       13 |       80 |      558 |    242 |                316 |         164 |                     145 |          30 | 0.42 |

(Lab sections such as 1.5 "Data Collection Experiment" have no Practice exercises or Try Its.)

## Elementary Algebra 2e (`openstax-elementary-algebra-2e`) and Intermediate Algebra 2e (`openstax-intermediate-algebra-2e`)

<https://openstax.org/books/elementary-algebra-2e/pages/preface> (10 chapters, 71 sections, filed
under **Grade 9**, Algebra 1) and <https://openstax.org/books/intermediate-algebra-2e/pages/preface>
(12 chapters, 70 sections, filed under **Grade 11**, Algebra 2). Both pages carry the same license
panel quoted above (CC BY-NC-SA 4.0, "Access for free at https://openstax.org/books/elementary-algebra-2e/pages/1-introduction"
and "…/intermediate-algebra-2e/pages/1-introduction"), so they get the same treatment: full table
of contents, a marked sample.

- **Layout:** Try Its are numbered through the chapter ("Try It 2.13"); most worked examples have
  two, so these books have many more Try Its per section than the others (about 20). Section
  exercises are grouped "Practice Makes Perfect", "Everyday Math", "Writing Exercises" and are
  numbered through the chapter; within "Practice Makes Perfect" a subheading and an instruction
  ("In the following exercises, …") precede each run, and both are prefixed to `question`. The
  sample is every Try It and the first 6 exercises of each section, as for the other books.
- **Answers:** Try It answers and odd-numbered exercise answers from the "Answer Key" chapter pages
  (`/pages/chapter-N`), matched by page and exercise id. Nearly every Try It has one.
- **Skill mapping:** both books open with review chapters (Elementary 1 Foundations: whole numbers,
  integers, fractions, decimals, real numbers; Intermediate 1–3: arithmetic, linear equations,
  lines and functions) that map to Grade 6–8 skills; units and sections say so in `notes`.
  Elementary 8 (rational expressions) maps to `m.11.rational-functions` and 6.6 (dividing
  polynomials) to `m.11.polynomial-functions` although filed under Grade 9; Intermediate 4.4–4.6
  (three-variable systems, matrices, determinants) map to `m.12.matrices`, 6 and 8–9 (factoring,
  radicals, quadratics) to the Grade 9 skills, 11 (conics) to `m.12.conics`, 12.4 to
  `m.11.binomial-theorem`.

| Book                    | Grade | Chapters | Sections | Problems | Try It | Section exercises | With answer | With a picture or table | Screenshots |   MB |
| ----------------------- | ----: | -------: | -------: | -------: | -----: | ----------------: | ----------: | ----------------------: | ----------: | ---: |
| Elementary Algebra 2e   |     9 |       10 |       71 |     2175 |   1749 |               426 |        1962 |                      59 |          55 | 0.50 |
| Intermediate Algebra 2e |    11 |       12 |       70 |     1806 |   1386 |               420 |        1596 |                      54 |          54 | 0.59 |

## Other OpenStax books: checked, not used

Found in the OpenStax sitemap index (<https://openstax.org/rex/sitemaps/index.xml>); each page's
license panel quoted as above (CC BY-NC-SA 4.0 unless noted).

- **Elementary Algebra 2e** and **Intermediate Algebra 2e**: used, see the next two sections.
- **Algebra 1** (`algebra-1`): an OpenStax high-school Algebra 1 course (977 pages: units of
  mini-lessons, reviews, "Desmos" activities). Same CC BY-NC-SA license. Not used this round: it is
  a different page structure (unit overviews, mini-lessons, no numbered section exercises with an
  answer key); worth a separate pass for Grade 9.
- **Statistics** (`statistics`): a high-school statistics book whose license panel reads "This book
  uses the Creative Commons Attribution License, which means that you can reuse and modify the
  material only for noncommercial purposes, must attribute Texas Education Agency (TEA)…" (the
  panel mixes CC BY and noncommercial wording). Its chapters match Introductory Statistics 2e, so it
  was not duplicated.
- College Algebra 2e, Prealgebra 2e, Calculus: outside this group's list.

## Taxonomy gaps noticed

- No Grade 9–12 skill for **descriptive statistics** (graphs of data, quartiles, box plots,
  standard deviation), **sampling and study design**, **confidence intervals**, the **central
  limit theorem**, **chi-square/ANOVA**, **function notation, domain and range**, **transformations
  of functions**, **systems in three variables**, **partial fractions**, **rotation of axes**, or
  **derivatives** (Precalculus 12.4). They map to the nearest skill with a note.
- `m.11.binomial-theorem` covers combinatorics too; counting principles (13.5/11.5) map there.
- Real numbers, integer exponents and one-variable linear equations open both algebra books but
  exist only as Grade 8 skills.
