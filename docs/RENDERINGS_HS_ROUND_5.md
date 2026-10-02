# Grades 9–12 pictures, round 5

Paste everything below the line into the pictures chat.

---

You are working in the EducationalCalculator repository on your pictures branch
(`claude/edu-calc-assets-questions-379toc`). First merge `claude/ios-education-wireframe-313z7z`
into it.

## Since round 4

Every round-4 part (H111–H114) is placed. The tracker now records H01–H88 part by part: 80 are
placed and 436 gallery demos were retired because real pages show the same options. The eight
still `drawn` (H01, H03, H10, H35, H36, H40, H48, H74) and R01b are already drawn; the lesson
chat is placing them on pages, so leave those entries alone.

You will also see shared changes in the merge: graph drags keep their window
(`useFrozen().freezeAt` in `reps/common.tsx`), "?" values are no longer drawn with the example's
numbers on `gasPiston` and `lightClock`, Σ with limits in step text (`MathLine`), and relative
comparisons in the solver.

## This round: three small parts (docs/HS_NEEDS.md, P27–P29)

1. **P27 `reserve` `growth`:** use that grows by g% a year. Draw each year's slice larger than the
   last, mark the year T the reserve runs out, and keep the constant-use lifetime Q ÷ r marked
   beside it for comparison. Growth is continuous (use r × e^(kt), k = g ÷ 100), as the page's
   assumption says. Page: `s.12.resource-management~growing-use` (it uses the `reserve` picture as
   it is today, with a caption saying "if use stays the same").
2. **P28 `photoelectric` with unknown values:** when φ (or K, or λ₀) shows "?", the picture still
   draws the example's φ, K and λ₀ faded behind the "?". Draw nothing for a value that is
   unknown, as `gasPiston` and `lightClock` now do. Page: `s.11.modern-physics~photoelectric`.
3. **P29 sort layout on a phone:** with six strobe-dot cards, the groups sit below the cards, so a
   student scrolls between tapping a card and tapping its group. Keep the groups in reach (for
   example a group bar that stays on screen while a card is picked, or compact cards), as an
   option of the sort layout that existing sorts don't change without. Page:
   `s.11.kinematics-1d~motion-diagrams`.

Add each as a tracker entry (`H115`–`H117` in `src/data/modules/pictureRequestsHs.ts`) with a
gallery demo, the fields in its notes, a check in `harness/pictures*.ts` where it draws values,
and a line in `docs/PICTURES.md` or `docs/LAYOUTS.md`. A new option never changes a page that
exists, and you don't edit the grade files: the lesson chat places each part.

## Checks (essentials only)

- `npx tsc --noEmit -p .` and eslint on the files you changed.
- The tests of your demos by id: `MODULE_IDS=<demo ids> npx jest --maxWorkers=1 src/data/modules`.
- One screenshot per demo at 390 px:
  `NODE_PATH=$(npm root -g) pnpm shots -- <ids> --widths 390 --out .review/r5`.
- Before a push, `node scripts/ci-test.mjs` (the cheap suites).

No `--heavy`, `--full` or deep runs: the heavy suites run once a day, nightly, and the lesson chat
checks the pages when it places the parts.
