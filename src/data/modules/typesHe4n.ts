/**
 * College pictures, round 4, group N (docs/RENDERINGS_HE.md): digital logic and computer
 * systems. HC184 `karnaugh` (calculator kind and explore figure, with its truth table).
 */
import type { NumOrVar } from './typesGraphs';

// ─── HC184: K-maps and truth tables ──────────────────────────────────────────

/**
 * A K-map of 2, 3 or 4 variables in Gray order (A down the side and B, C across for three;
 * A, B down and C, D across for four) with its truth table beside it, from the page's values:
 * `n` variables, the function's `minterms` and `dontCares` (fixed: a page's example) ringed in
 * its minimal sum of products (each group its own outline style, its product term written),
 * and the minterm `lit` (a value) lit in the map and the table with its product term. `rows`
 * (2ⁿ) and `functions` (2^(2ⁿ)) are said in the caption and checked.
 */
export interface KarnaughSpec {
  kind: 'karnaugh';
  n: NumOrVar;
  /** The variables' names (default A, B, C, D). */
  names?: string[];
  minterms?: number[];
  dontCares?: number[];
  lit?: NumOrVar;
  rows?: NumOrVar;
  functions?: NumOrVar;
}

/**
 * The explore figure: `map` (default) draws a scene's K-map and truth table with its groups
 * ringed; `table` draws a truth table with a column per sub-expression and the lit columns.
 */
export interface KarnaughFigure {
  kind: 'karnaugh';
  mode?: 'map' | 'table';
}

/** A `karnaugh` scene. */
export interface KarnaughScene {
  /** The variables (2–4 for a map; 1–4 for a table), the first the most significant. */
  names: string[];
  /** `map`: the 1s and don't-cares (minterm numbers). */
  minterms?: number[];
  dontCares?: number[];
  /**
   * `map`: the groups ringed, each a list of minterms (a power-of-two block, wrapping allowed,
   * of 1s and don't-cares); left out, the minimal sum of products is drawn.
   */
  groups?: number[][];
  /** `table`: the columns after the variables, each an expression (“p → q”, “¬q → ¬p”). */
  columns?: string[];
  /** `table`: the columns lit (indices into `columns`); two lit are compared row by row. */
  lit?: number[];
}

/** The scene field each group N explore figure reads (layouts.test). */
export const HE4N_SCENE_FIELD = { karnaugh: 'kmap' } as const;

export type He4nFigure = KarnaughFigure;

// ─── The group's calculator pictures ─────────────────────────────────────────

export type He4nSpec = KarnaughSpec;

const ids = (xs: unknown[]): string[] =>
  xs.flat(4).filter((x): x is string => typeof x === 'string');

/** The variable ids a group N picture reads (for the module tests). */
export function he4nSpecVars(r: He4nSpec): string[] {
  switch (r.kind) {
    case 'karnaugh':
      return ids([r.n, r.lit, r.rows, r.functions]);
  }
}

/** The scene fields group N's explore figures read. */
export interface He4nScene {
  kmap?: KarnaughScene;
}
