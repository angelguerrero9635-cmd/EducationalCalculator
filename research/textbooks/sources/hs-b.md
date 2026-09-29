# Group hs-b: OpenStax high-school math books (Grades 9, 11, 12)

Reference only: nothing here is imported, bundled or shipped.

| File | What |
| --- | --- |
| `toc/math/openstax-algebra-trig-2e.json` | Algebra and Trigonometry 2e: every chapter and section, with URLs and skill ids (Grades 9, 11, 12) |
| `practice/math/<grade>.openstax-algebra-trig-2e.jsonl` | A representative practice sample, Grades 9, 11 and 12 |
| `screenshots/openstax-algebra-trig-2e/<record id>.webp` | The problem with its figure, for figure problems |
| `tools/check_hs_b.py` | Checks the files above and prints the counts below |

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

| Chapters | Grade | Why |
| --- | --- | --- |
| 1–4 Prerequisites; Equations and Inequalities; Functions; Linear Functions | 9 | Algebra 1 content: radicals, polynomials, factoring, linear and quadratic equations, functions, linear models |
| 5–8 Polynomial and Rational; Exponential and Logarithmic; Unit Circle; Periodic Functions | 11 | Algebra 2 content: polynomial, rational, exponential, logarithmic and trigonometric functions |
| 9–13 Identities and Equations; Further Trigonometry; Systems; Analytic Geometry; Sequences, Probability and Counting | 12 | Precalculus content: trig identities, law of sines/cosines, polar, parametric, vectors, matrices, conics, binomial theorem |

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
  spaced (`sin^(-1) x`, `cos^4 θ`), subscripts `log_2(8)`, aligned working as `[row; row]`. Lists
  with circled letters become `(a)`, `(b)`. HTML tables become `[Table: row ; row]` with cells
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

| Grade | Chapters | Sections | Problems | Try It | Section exercises | With answer | With a picture or table | Screenshots | MB |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 9 | 4 | 23 | 323 | 185 | 138 | 254 | 17 | 8 | 0.10 |
| 11 | 4 | 23 | 300 | 162 | 138 | 231 | 20 | 16 | 0.20 |
| 12 | 5 | 33 | 371 | 173 | 198 | 272 | 4 | 3 | 0.04 |
| all | 13 | 79 | 994 | 520 | 474 | 757 | 41 | 27 | 0.34 |
