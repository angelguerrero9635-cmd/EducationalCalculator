# Problem matching in Search

A student types a homework or practice-test problem into the Search tab and the pages that
solve it appear above the ordinary word matches, under "Lessons that solve this problem".
Everything runs on the device: no network, no account, nothing stored. The matching is in
`src/data/match.ts`; the Search tab (`src/app/(tabs)/search.tsx`) calls it when the query has
three or more words or any digit and the filter is "All" or "Skills".

## How matching works (`src/data/match.ts`)

Every K–8 page (a skill's main page and its problem types, calculators and layouts) becomes a
document of weighted words: the skill title, the page title and use line, its notes, its value
names, and a sort's question, bins and cards. To that are added the words that set the skill's
practice problems apart (`src/data/matchCorpus.json`, see below). The problem is scored against
each document with BM25, then adjusted by what its numbers say:

- decimals, fractions, percents, money and negatives each favor pages that take them and count
  against pages that don't;
- units in the problem (inches, liters, °C …) favor pages whose values use that family;
- a number bigger than any value the page accepts counts against it;
- "Grade 4" in the text favors that grade.

Symbols become words first ("0.7 × 0.4" → multiply, decimal), so a bare expression matches.
The result is the best page per skill, at most three.

## Word weights (`scripts/build-match-corpus.mjs`)

`node scripts/build-match-corpus.mjs` reads the practice problems in `research/textbooks/practice`
from the openly licensed programs only (Illustrative Mathematics and OpenSciEd, CC BY 4.0; the
Eureka Math problems are non-commercial and are skipped), and writes, per skill, its sixty most
telling words with a weight from 0 to 1. Only these statistics ship; no problem text does. The
Settings screen credits the sources. Rerun the script after adding or renaming pages so new
skills get weights.

## Accuracy

`src/data/__tests__/match.test.ts` scores the released test questions in `research/questions`
(NAEP and Illustrative Mathematics; reference only, read by the test, never shipped) and
prints top-1 and top-3 accuracy with the first misses. At the time of writing: 895 K–6
questions, top-1 53%, top-3 74%. The test fails below 65% top-3, so a change that hurts
matching is caught. To improve it: add use lines and notes in the words students' problems use,
and rerun the corpus script.

## Not built

Reading a problem from a photo was built and then removed: the app takes no pictures and has
no camera or photo permissions. On an iPhone a student can still select the text of a problem
in the Camera or Photos app (Live Text) and paste it into Search.
