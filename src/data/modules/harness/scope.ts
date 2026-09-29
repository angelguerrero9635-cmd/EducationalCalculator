/**
 * The pages a test run covers. `MODULE_IDS` (comma-separated ids or id prefixes) limits every
 * per-page suite to those pages, so `MODULE_IDS=s.8. pnpm test src/data/modules` tests one
 * grade and CI tests only the grades a push changed (scripts/ci-test.mjs). Unset: every page.
 * Checks across all pages (unique ids, the tracker) are not scoped.
 */
const env: Record<string, string | undefined> =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

export const SCOPE = (env.MODULE_IDS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

/** Whether a page id is in this run's scope. */
export const inScope = (id: string): boolean =>
  SCOPE.length === 0 || SCOPE.some((p) => id === p || id.startsWith(p));

/** The items of a list whose ids are in scope. */
export function scoped<T extends { id: string }>(items: readonly T[]): T[] {
  return items.filter((x) => inScope(x.id));
}

/**
 * `each`'s table for the items in scope, as [id, item] rows. Jest refuses an empty table, so
 * when nothing is in scope the one row is a stand-in the callers skip (`isStandIn`).
 */
export function pages<T extends { id: string }>(items: readonly T[]): [string, T][] {
  const rows = scoped(items).map((x) => [x.id, x] as [string, T]);
  return rows.length ? rows : [[STAND_IN, { id: STAND_IN } as T]];
}

const STAND_IN = '(no pages in scope)';
/** The stand-in row `pages` returns when nothing is in scope. */
export const isStandIn = (id: string) => id === STAND_IN;
