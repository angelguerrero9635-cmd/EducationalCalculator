# Find my lesson

A student types a homework or practice-test problem, or takes or chooses a picture of it, and
the app opens the lesson that solves it. Everything runs on the device: no network, no account,
and the picture is read once and dropped. The button is on the Home screen's hero, under search;
the screen is `src/app/match.tsx`, route `/match`.

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

## Reading a picture (`modules/vision-ocr/`)

On iOS the picture goes to Apple's Vision framework (`VNRecognizeTextRequest`, accurate mode,
English) in a local Expo module, and the lines come back top to bottom. Printed worksheets read
well; handwriting and stacked fractions are unreliable, so the recognized text is shown in the
box for the student to fix before matching. The camera and photo picker come from
`expo-image-picker`; `app.json` carries the two permission strings.

The module is native code, so it needs a native build:

1. `npx expo prebuild --platform ios` (autolinking finds `modules/vision-ocr` through its
   `expo-module.config.json`);
2. build and run on a device or simulator (`pnpm ios`, or an EAS build).

On the web and in tests the native module is absent: `ocrAvailable` is false and the screen
offers typing only, with a line saying the iPhone app can read pictures. The web bundle never
loads Vision.

## Paywall

The screen checks `isLocked('feature.find-my-lesson')` (`src/config/access.ts`), so the feature
can sit behind the subscription with the same gate the lessons use.
