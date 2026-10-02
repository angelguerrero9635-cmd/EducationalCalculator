/**
 * Harness checks for the college pictures, round 3, group K: `waterfall` `decibels` (HC91),
 * `lamina` (HC86), `rocket` (HC87), `deviceCurves` (HC62) and `stemPlot` (HC63). Each check
 * recomputes what the picture draws, with the picture's own math (reps/he3kMath.ts), and
 * compares it with the page's values. Values arrive in the formula's units. Called from
 * `pictures.ts`.
 */
import {
  HEX_MAX,
  dbLevels,
  drawnFiberShare,
  inverseRule,
  ruleOfMixtures,
} from '@/components/module/reps/he3kMath';

import type { Representation } from '../types';
import type { He3kSpec, LaminaSpec } from '../typesHe3k';

type Val = (x: string | number) => number | undefined;

const near = (a: number, b: number, tol = 2e-3) =>
  Math.abs(a - b) <= tol * Math.max(Math.abs(a), Math.abs(b)) + 1e-9;

const reader = (val: Val) => (x: string | number | undefined) =>
  x === undefined ? undefined : val(x);

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

// ─── HC86 ────────────────────────────────────────────────────────────────────

/** The drawn fiber share is V_f within 2%; E₁, E₂ and ρ_c by their rules; E₂ ≤ E₁. */
export function laminaIssues(rep: LaminaSpec, val: Val): string[] {
  const out: string[] = [];
  const n = reader(val);
  const Vf = n(rep.Vf);
  if (Vf === undefined) return out;
  if (Vf < 0 || Vf > HEX_MAX) {
    out.push(`V_f = ${Vf} can't be drawn: fibers pack to ${HEX_MAX.toFixed(3)} at most`);
    return out;
  }
  const share = drawnFiberShare(Vf);
  if (Math.abs(share - Vf) > 0.02)
    out.push(`the drawn fiber share is ${share.toFixed(3)}, not V_f = ${Vf}`);
  const [Ef, Em, E1, E2] = [n(rep.Ef), n(rep.Em), n(rep.E1), n(rep.E2)];
  if (Ef !== undefined && Em !== undefined && Ef > 0 && Em > 0) {
    if (E1 !== undefined && !near(E1, ruleOfMixtures(Ef, Em, Vf)))
      out.push(`E₁ = ${E1}, the rule of mixtures gives ${ruleOfMixtures(Ef, Em, Vf)}`);
    if (E2 !== undefined && !near(E2, inverseRule(Ef, Em, Vf)))
      out.push(`E₂ = ${E2}, the inverse rule gives ${inverseRule(Ef, Em, Vf)}`);
  }
  if (E1 !== undefined && E2 !== undefined && E2 > E1 * (1 + 1e-9))
    out.push(`E₂ = ${E2} > E₁ = ${E1}`);
  if (rep.rho) {
    const [f, m, c] = [n(rep.rho.f), n(rep.rho.m), n(rep.rho.c)];
    if (f !== undefined && m !== undefined && c !== undefined && !near(c, ruleOfMixtures(f, m, Vf)))
      out.push(`ρ_c = ${c}, the mixture gives ${ruleOfMixtures(f, m, Vf)}`);
  }
  return out;
}

export function he3kIssues(rep: He3kSpec, val: Val): string[] {
  switch (rep.kind) {
    case 'lamina':
      return laminaIssues(rep, val);
  }
}
