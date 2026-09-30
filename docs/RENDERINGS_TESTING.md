# Update: test only what you touched

Paste everything below the line into the pictures chat.

---

Merge `claude/ios-education-wireframe-313z7z` into your branch, then read the new "Testing"
section in `docs/RENDERINGS_BRIEF.md`. It replaces every "run `pnpm check`" in the briefs:
`RENDERINGS_BRIEF.md`, `RENDERINGS_ROUND_4.md`, `RENDERINGS_HS.md` and
`RENDERINGS_HS_EQUATIONS.md`, which now point to it.

`pnpm check` runs every test for every grade: the module and sampling suites alone take about 5
minutes. Running it for each picture repeats checks your change can't affect. From now on:

1. **While drawing a kind, after each change:**
   - `pnpm -s typecheck` and `pnpm -s exec eslint <files you changed>`;
   - the module tests for the pages that show the kind, and only those: its gallery demos and
     the pages that use it. Find them with `grep -rln "kind: '<kind>'" src/data/modules`, then
     run `MODULE_IDS=g.,<page ids> pnpm test src/data/modules`;
   - if you touched a shared file (`types.ts`, `reps/index.tsx`, `meta.ts`, `theme.ts`), also
     `pnpm test src/components src/data/__tests__`.
2. **Screenshots:** build only the pages in scope
   (`PRERENDER_PREFIX=g.,<page prefixes> pnpm build:web`). Shoot only the demos you changed,
   in light and dark.
3. **Commit after each kind, but push once per group** (a tracker group such as H31–H42, or a
   subject), not after every kind.
4. **Before each push:** `pnpm -s format:check` and `node scripts/ci-test.mjs`, once. It runs
   every cheap suite and the heavy suites for what the push changed (in full when a picture
   component changed). The nightly CI run does the complete suite, so nothing goes unchecked.
5. **In each push's last commit message**, say which of these you ran, so the lesson chat can
   see the checks when it merges.

Don't run `pnpm check` unless a test fails in a way the scoped runs can't explain.
