# Building Grades 9–12

Grades 9–12 are built from the direction plans the lesson reviewers wrote, one builder per grade
and subject, working in parallel. This file is the builder's brief. Read it, then
`docs/MODULE_GUIDE.md` ("Standards"), then your plan.

## Your files

Each builder owns one grade and subject and edits only these files:

| File                                                 | What                                       |
| ---------------------------------------------------- | ------------------------------------------ |
| `src/data/modules/<math\|science>/<grade>.ts`        | The calculator pages, main page first      |
| `src/data/modules/layouts/<math\|science><grade>.ts` | Sort, sequence, explore and observe pages  |
| `src/data/modules/harness/phrases<M\|S><grade>.ts`   | Step-text phrases the harness must read    |
| `docs/build/<m\|s>.<grade>.md`                       | Your build notes (below)                   |
| `src/data/modules/pilots.ts` (Grade 9 math only)     | Move `m.9.exponential-functions` out of it |

All of them already exist and are registered. **Never edit** the engine (`src/engine/`), the
components (`src/components/`), `types.ts`, `helpers.ts`, `work.ts`, the shared harness files, the
gallery files, the picture trackers, `taxonomy.ts` or another grade's files: other builders work
at the same time, and a shared change is made once, centrally. A helper only your grade needs goes
at the top of your own grade file.

## Pages

1. Build in the plan's **Priority** order, one skill at a time: its main page, then its problem
   types, then its layout pages.
2. A page whose picture has a demo starts from it:
   `node scripts/promote-demo.mjs --no-tracker g.<demo> <page id> ["Title"]`, then edit it to the
   plan (id, title, `use` line, assumptions, ranges, `allowed`/`derived`, example, `startWith`,
   `equation`). A page without a demo starts from `pnpm new-module <page id> ["Title"]` or from a
   similar page in the Grade 7–8 files.
3. The plan's numbers are its decisions: ranges, examples (worked by hand) and templates. Change
   one only when a test or the math proves it wrong, and say so in your notes.
4. **Waiting pages.** A page the plan marks as waiting on an engine or picture need is not built;
   list it in your notes with the need. A page with a planned interim (two fixed-sign pages, a
   table instead of a missing picture) is built with the interim.
5. Never copy text, numbers or figures from `research/`; lesson text is original.

What the engine already does for you:

- Equation templates (`docs/EQUATION_INPUTS.md`): boxes, fractions, powers, radicals, expression
  slots, sign and operator boxes, subscripts, matrices, `{a:unit}`, `{a:coef}`.
- A written + or − before a box holding a negative value flips when drawn: `x − {h}` with
  h = −3 reads "x + 3", and `{m}x + {b}` with b = −3 reads "2x − 3". Write templates the plain way.
- Grades 9–12 limits (`standards.test.ts`): sentences at most 35 words, at most 10 values a page.

## Testing

- After each page: `MODULE_IDS=<page id> pnpm test src/data/modules`. A new phrase in step text
  goes into your phrases file; a gap the harness can't read fails the test.
- After each skill: `MODULE_IDS=<skill id> pnpm test src/data/modules`, then
  `npx tsc --noEmit -p .`, `npx eslint <your files>` and `npx prettier --write <your files>`, then
  commit (`git add <your files>`; a clear message; the repository's commit trailers).
- At the end: `MODULE_IDS=<m|s>.<grade>. pnpm test src/data/modules` and
  `pnpm test src/data/__tests__`. Never `pnpm check` or the full suite; the lead runs it after the
  merge.
- In a git worktree, link the main checkout's packages first:
  `ln -s /home/user/EducationalCalculator/node_modules node_modules`.

## Build notes

Write `docs/build/<m|s>.<grade>.md` as you go:

- **Built:** the pages, by skill (a count per skill is enough).
- **Waiting:** each page not built and the need it waits on (the plan's need number and a line).
- **Changed from the plan:** each decision you changed, and why.
- **Shared needs found while building:** an engine, picture or harness change you would have made
  outside your files, with the pages it would help.
