import { formatNumber } from '@/engine/format';
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { StepText } from '../types';

/**
 * Relation helpers the college field files share (`college/<field>.ts`). K–12 helpers
 * (`div`, `whole`, …) are in `../helpers.ts`.
 */

/**
 * √x for a quantity computed as a sum of terms of size `scale`: a tiny negative from rounding
 * (a double root, e.g. an object that just stops) counts as 0 instead of no answer.
 */
export const rootOf = (x: number, scale: number) => (x < 0 && x > -1e-5 * scale ? 0 : Math.sqrt(x));

/**
 * A time worked out by division, with a rounding crumb below 0 (−1 × 10⁻⁶ s from a value typed
 * in another unit) read as 0, so a clock that starts at 0 never reads a moment before it.
 */
export function atLeastZero(t: number | undefined): number | undefined {
  return t !== undefined && t < 0 && t > -1e-5 ? 0 : t;
}

/** Both signs of a square root (one value when it is 0). */
export const plusMinus = (x: number) => (x === 0 ? [0] : [x, -x]);

/**
 * Real k-th roots of v (k a positive whole number). Even k: ±root, or NaN when v < 0 so the
 * solver reports the impossibility instead of leaving the value blank.
 */
export const realRoots = (v: number, k: number): number[] | undefined => {
  if (!Number.isInteger(k) || k < 1 || !Number.isFinite(v)) return undefined;
  if (k % 2 === 1) return [Math.sign(v) * Math.abs(v) ** (1 / k)];
  return v < 0 ? [NaN] : plusMinus(v ** (1 / k));
};

/** d/dx of c·xⁿ = n·c·xⁿ⁻¹ (0 when n = 0, avoiding 0⁻¹). */
export const powerRule = (c: number, n: number, x: number) => (n === 0 ? 0 : n * c * x ** (n - 1));

// ── Relation builders (the same shapes Grade 12 uses in math/12.ts) ──

type Rel = { relation: Relation; steps: Record<string, StepText> };
type Solver = (v: Values) => number | number[] | undefined;

/** A value: id, symbol, name, and anything else (range, unit, derived). */
export const V = (
  id: string,
  symbol: string,
  name: string,
  extra: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...extra });

/** Rounded to 12 significant figures, so 0.1 + 0.2 is 0.3 when a value is worked out. */
export const exact = (x: number) => Number(x.toPrecision(12));

/** The relations and their step text, as a page spreads them. */
export const rels = (...rs: Rel[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(
    rs.filter((r) => !r.relation.hidden).map((r) => [r.relation.id, r.steps]),
  ),
});

/**
 * One relation: its display (`{id}` for each value), the residual, and each rearrangement as
 * [solver, expression, why]. Values it names without a rearrangement are never solved from it.
 */
export function rel(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  solves: Record<string, [Solver, StepText['expr'], StepText['how']]>,
  extra: Partial<Relation> = {},
): Rel {
  return {
    relation: {
      id,
      display,
      vars,
      residual,
      solve: {
        ...Object.fromEntries(vars.filter((x) => !(x in solves)).map((x) => [x, () => undefined])),
        ...Object.fromEntries(Object.entries(solves).map(([x, [f]]) => [x, f])),
      },
      ...extra,
    },
    steps: Object.fromEntries(
      Object.entries(solves).map(([x, [, expr, how]]) => [x, { expr, how }]),
    ),
  };
}

/** x = f(inputs), worked one way only (undefined when f has no value there). */
export function derive(
  id: string,
  display: string,
  x: string,
  inputs: string[],
  f: (v: Values) => number | undefined,
  expr: StepText['expr'],
  how: StepText['how'],
): Rel {
  return rel(id, display, [x, ...inputs], (v) => v[x]! - (f(v) ?? NaN), {
    [x]: [
      (v) => {
        const y = f(v);
        return y === undefined || !Number.isFinite(y) ? undefined : exact(y);
      },
      expr,
      how,
    ],
  });
}

/** A relation with more said under one of its steps (work lines, a note). */
export const withStep = (r: Rel, id: string, more: Partial<StepText>): Rel => ({
  ...r,
  steps: { ...r.steps, [id]: { ...r.steps[id]!, ...more } },
});

/** A rule that only checks (never solved): `why` is the reason shown when it does not hold. */
export const rule = (
  id: string,
  display: string,
  vars: string[],
  ok: (v: Values) => boolean,
  why: string | ((v: Values) => string),
): Rel => ({
  relation: {
    id,
    constraint: true,
    display,
    vars,
    residual: (v) => (ok(v) ? 0 : 1),
    solve: {},
    message: (v) => (ok(v) ? undefined : typeof why === 'string' ? why : why(v)),
  },
  steps: {},
});

/** A number as a line prints it, in brackets when negative: "(−2)". */
export const signed = (x: number) => (x < 0 ? `(${formatNumber(x)})` : formatNumber(x));
