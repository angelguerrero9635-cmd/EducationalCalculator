/**
 * Harness checks for the college pictures, round 3, group K: `waterfall` `decibels` (HC91),
 * `lamina` (HC86), `rocket` (HC87), `deviceCurves` (HC62) and `stemPlot` (HC63). Each check
 * recomputes what the picture draws, with the picture's own math (reps/he3kMath.ts), and
 * compares it with the page's values. Values arrive in the formula's units. Called from
 * `pictures.ts`.
 */
import { dbLevels } from '@/components/module/reps/he3kMath';

import type { Representation } from '../types';

type Val = (x: string | number) => number | undefined;

const near = (a: number, b: number, tol = 2e-3) =>
  Math.abs(a - b) <= tol * Math.max(Math.abs(a), Math.abs(b)) + 1e-9;

// ─── HC91 ────────────────────────────────────────────────────────────────────

type Waterfall = Extract<Representation, { kind: 'waterfall' }>;

/** The end bar is the sum of the signed items; the margin is the gap to the floor. */
export function waterfallDecibelsIssues(rep: Waterfall, val: Val): string[] {
  const out: string[] = [];
  if (!rep.decibels) return out;
  const opts = rep.decibels === true ? {} : rep.decibels;
  const xs = rep.items.map((i) => val(i.var));
  const total = val(rep.total);
  if (xs.some((x) => x === undefined) || total === undefined) return out;
  const levels = dbLevels(rep.items.map((i, k) => ({ sign: i.sign, value: xs[k]! })));
  const end = levels[levels.length - 1]?.to ?? 0;
  if (Math.abs(end - total) > 0.05)
    out.push(`the end bar ${total} dB is not the sum of the signed items (${end.toFixed(2)})`);
  if (opts.margin) {
    const floor = opts.floor === undefined ? undefined : val(opts.floor);
    const margin = val(opts.margin);
    if (opts.floor === undefined) out.push('a margin is bracketed with no floor to bracket it to');
    else if (
      floor !== undefined &&
      margin !== undefined &&
      Math.abs(Math.abs(total - floor) - Math.abs(margin)) > 0.05
    )
      out.push(
        `the bracket from ${total} to ${floor} is ${Math.abs(total - floor)} dB, not ${margin}`,
      );
  }
  return out;
}

export { near };
