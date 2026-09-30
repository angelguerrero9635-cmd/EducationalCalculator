# Renderings round 4: redraw every picture not yet redrawn

Paste everything below the line into the pictures chat.

---

You are working in the EducationalCalculator repository on your pictures branch
(`claude/edu-calc-assets-questions-379toc`). First merge `claude/ios-education-wireframe-313z7z`
into it: the lesson chat has placed round 3 and changed pages since. Then read:

- `CLAUDE.md`;
- `docs/RENDERINGS_BRIEF.md`. The hard rules and art direction still apply:
  - original drawings in react-native-svg;
  - online images as reference only;
  - theme tokens;
  - the paint helpers for real objects;
  - flat for abstract diagrams;
  - no new dependencies without asking.
- `docs/RENDERINGS_ROUND_2.md`: how the tracker works;
- `src/data/modules/pictureRequests.ts`: the tracker.

If any round-3 entry (`D..`) is still `requested`, finish it first.

## What this round is

The owner wants every picture you have not redrawn yet to be redone, and at the least to look
better. The lesson chat found every picture kind and explore figure your branch has never
changed, took screenshots of each at 390 px, and had three page-reviewers say what is weak and
how to redraw it.

Their answers are the tracker entries `Q01`–`Q52`, all with `status: 'requested'`, ordered most
urgent first:

- **High (Q01–Q20):** flat clip-art where a real object is wanted, or a picture that misstates
  the lesson. Examples:
  - one hop of 30 on a "subtract tens" page;
  - "above" drawn touching the box;
  - pie colours that mean the wrong thing.
- **Medium (Q21–Q44):** readable, but small, crowded, off-centre or wireframe.
- **Low (Q45–Q52):** close to the standard; polish only.

**How to read an entry:**

- `kind`: the picture kind (`src/components/module/reps/`) or explore figure (`figures.tsx`,
  `figures6.tsx`; the explore clock is `ClockFace` in `ExploreLayout.tsx`).
- `pages`: every page that uses it. Your redraw must work on all of them. College topics
  (`he.…#n`) open at `/course/<course>/topic/<n>`.
- `notes`: the urgency, what is weak now, and the reviewer's redo.

The redo is the reviewer's suggestion, not a spec. Where you see a better drawing that meets the
same aim, draw it and say why in `notes`.

Kinds you only extended in earlier rounds (TenFrame, Tape, BaseTen and the like) are not in this
round.

## Rules for every redraw

**Quality floor**, whatever the entry says:

- No label below 12 px. Labels use `chart.value`, and any label a student must read uses
  `chart.label` or larger.
- Size the drawing from the values shown, not from `spec.max`. Centre it and use the width;
  don't leave large empty areas.
- Keep labels inside the canvas, and never on top of a line, handle or another label.
- Real objects (coins, balloons, balances, cubes, bodies, landscapes, rocks, lab glass) are
  painted with the paint helpers (`Metal`, `Ball`, `Glass`, `TopLight`, `FloorShadow`, `Wood` …).
  Abstract diagrams (number lines, charts, tables, trees, area models) stay flat and crisp.
- Colours carry meaning only when a key or label says so.
- Handles keep a 44 px hit area and never cover a label.
- Check light and dark mode.

**Keep the page working:**

- Every spec field a page passes keeps working. New options are optional fields.
- Every value-driven part stays exact: counts, lengths, positions, angles and scale ticks.
- Keep the drag behaviour, the slider policy and the harness check the kind already has, and
  extend the check if you add value-driven parts.

**For each entry:**

- Open every page in `pages` in the web build, and read its module or layout file. Draw for
  those pages' values, ranges and questions.
- Add or update a gallery demo with a page's own example, plus one at the edge of its range.
- Test it as "Testing" in `docs/RENDERINGS_BRIEF.md` says (not `pnpm check`). Take before and
  after screenshots at 390 px, in light and dark
  (`NODE_PATH=$(npm root -g) pnpm shots -- <page ids> --widths 390`).

**When you finish an entry:**

- Set it to `status: 'drawn'` and list its gallery ids.
- If the redraw needs no lesson change, say "no page change" in `notes`. The lesson chat checks
  the pages and sets `placed`.
- If a page must pass a new field (a roof option, a broken ruler start, a viewer figure), set
  `uses` to the text the page will then contain, and add the exact field names and values to
  `notes`.

**Don't touch:**

- Lesson text, relations, cards or pages in `src/data/modules/math`, `science`, `layouts` or
  `college.ts`. The lesson chat places your drawings and sets `placed`.
- The pages or status of other entries.

**If you disagree with a redo** (it would mislead, or the current picture is already right),
leave the entry `requested` and say why in its `notes`.

## How to report

Work in urgency order. Commit after each redrawn kind and push to your branch. When every `Q..`
entry is `drawn`, add a short dated "Round 4" note under "Done" in `docs/RENDERINGS_BRIEF.md`
that points to the tracker, with a contact sheet of before and after screenshots.
