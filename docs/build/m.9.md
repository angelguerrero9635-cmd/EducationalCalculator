# Build notes: math Grade 9 (Algebra 1)

Built from `.review/plans/m.9/plan.md` in its Priority order. Pages are in
`src/data/modules/math/9.ts`, sorts in `src/data/modules/layouts/math9.ts`, step phrases in
`src/data/modules/harness/phrasesM9.ts`.

## Built

- m.9.exponential-functions: 4 calculators (~percent-growth, ~decay, ~doubling, and the main page
  written as `EXPONENTIAL_MAIN`, see Waiting) and 1 sort (~linear-or-exponential).

## Waiting

- **Pilot move + galleryR4d repoint (lead does at merge).** The main page
  `m.9.exponential-functions` is written and tested (as `EXPONENTIAL_MAIN` in `math/9.ts`, tested
  under a temporary id), but it is not in `MATH_9_MODULES` and `pilots.ts` still holds the pilot:
  `galleryR4d.ts` builds `g.r4d-table-growth` from the pilot by id, so removing it stops every
  suite from loading, and that file is outside this builder's files. At merge: in
  `galleryR4d.ts` import `MATH_9_MODULES` from `./math/9`, add it to `PAGES`, point the demo at
  `m.9.exponential-functions~decay` (the pilot's sweep table lives there now; its example
  passes); then empty `PILOT_MODULES` and put `EXPONENTIAL_MAIN` first in `MATH_9_MODULES`.

## Changed from the plan

- **Percent pages write the percent sign in the template.** The plan's `{A} = {P}(1 + {r})^{t}`
  with r typed as a percent would read "(1 + 3)"; the templates are `{A} = {P}(1 + {r}%)^{t}` and
  `{A} = {P}(1 − {r}%)^{t}`. The pages carry the growth (decay) factor g = 1 ± r ÷ 100 as a
  worked-out value, so the step writes the decimal once ("3% = 0.03") and the `functionGraph`
  has its base.
- **Money ranges.** ~percent-growth: P up to $1,000,000 and A under $1,000,000,000; ~decay: P and A
  up to $1,000,000 (at least $0.01) and t up to 50. Dollar answers past a billion are drawn in
  scientific notation, which the harness can't read after a "$" (a shared need below).
- **Main page:** a `b ≠ 1` check (the picture's base can't be 1).
- **~doubling** works out the number of doublings k = t ÷ T as a value, so the power's steps read
  N = N₀ × 2ᵏ.

## Shared needs found while building

- **galleryR4d.ts** reads the Grade 9 pilot by id (see Waiting).
- **Harness: a dollar answer in scientific notation** ("A = $6.0972 × 10⁹") is read as its
  leading number only (`resultNumber`), so the step check fails. Would let the money pages keep
  wider ranges.
