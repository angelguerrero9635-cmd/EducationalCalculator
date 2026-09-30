/**
 * Harness checks for the round 2 group G options (H93–H95, H97–H99): sequences past 30 terms,
 * by a recursive rule and with a second lit term, and the function-graph, polynomial,
 * probability, unit-circle, statistics and complex-number options. Called from each kind's case
 * in `pictures.ts`.
 */
import { termsModel } from '@/components/module/reps/termsModel';

import type { Representation } from '../types';

type Val = (x: string | number) => number | undefined;

export function hs2gIssues(rep: Representation, val: Val): string[] {
  const out: string[] = [];
  const get = (x: string | number | undefined) => (x === undefined ? undefined : val(x));
  const near = (a: number, b: number, tol = 1e-6) =>
    Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
  switch (rep.kind) {
    case 'termsChart': {
      if (rep.plus !== undefined && rep.type !== 'recursive')
        out.push('terms chart: `plus` is for a recursive rule');
      const a = get(rep.first);
      const d = get(rep.step);
      if (rep.powers && rep.type === 'geometric' && a !== undefined && d !== undefined && a !== d)
        out.push(`terms chart: powers need r = a₁ (${d} ≠ ${a})`);
      if (rep.powers && rep.type !== 'geometric') out.push('terms chart: powers need a geometric');
      const lit = get(rep.lit);
      if (rep.lit === undefined || lit === undefined) break;
      if (!Number.isInteger(lit) || lit < 1 || lit > 30)
        out.push(`terms chart: lit term ${lit} (whole, 1 to 30)`);
      const m = termsModel(rep, (x) => get(x));
      if (m.problem || lit < 1 || lit > m.terms.length) break;
      const want = m.terms[lit - 1]!;
      const typed = get(rep.litTerm);
      if (typed !== undefined && !near(typed, want))
        out.push(`terms chart: lit term ${lit} is ${want}, but the value is ${typed}`);
      break;
    }
    default:
      break;
  }
  return out;
}
