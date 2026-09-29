/**
 * Harness checks for the Grades 9–12 data-picture options (group HE: H18–H22), kept apart from
 * pictures.ts so each kind's case there only calls in. `val` reads a value as shown (undefined
 * when it is "?").
 */
import { correlation, leastSquares } from '@/components/module/reps/stats';

import type { Representation } from '../types';

type Val = (x: string | number) => number | undefined;
type Of<K extends Representation['kind']> = Extract<Representation, { kind: K }>;

const close = (a: number, b: number, tol = 1e-6) =>
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

/** H18: r, the least-squares line and one point's residual agree with the points. */
export function scatterIssues(rep: Of<'scatter'>, val: Val): string[] {
  const out: string[] = [];
  if (typeof rep.r === 'string') {
    const r = val(rep.r);
    const want = correlation(rep.points);
    // r is shown to two places (or more): it must round the same way.
    if (r !== undefined && want !== undefined && Math.abs(r - want) > 0.0051)
      out.push(`r shows ${r}, the points give ${want.toFixed(4)}`);
    if (r !== undefined && Math.abs(r) > 1 + 1e-9) out.push(`r = ${r} is past ±1`);
  }
  const [m, b] = [val(rep.slope), val(rep.intercept)];
  if (rep.leastSquares === 'fit' && m !== undefined && b !== undefined) {
    const ls = leastSquares(rep.points);
    if (!ls) out.push('a least-squares line through points that all share one x');
    // A page may round the line to the cent.
    else if (
      Math.abs(m - ls.m) > 0.0051 + 1e-6 * Math.abs(ls.m) ||
      Math.abs(b - ls.b) > 0.0051 + 1e-6 * Math.abs(ls.b)
    )
      out.push(
        `line y = ${m}x + ${b} is not the least-squares line (${ls.m.toFixed(4)}, ${ls.b.toFixed(4)})`,
      );
  }
  if (rep.residualOf) {
    const p = rep.points[rep.residualOf.point];
    if (!p) out.push(`there is no point ${rep.residualOf.point}`);
    const d = rep.residualOf.residual ? val(rep.residualOf.residual) : undefined;
    if (
      p &&
      d !== undefined &&
      m !== undefined &&
      b !== undefined &&
      !close(d, p[1] - (m * p[0] + b), 1e-6)
    )
      out.push(`residual shows ${d}, the point and line give ${p[1] - (m * p[0] + b)}`);
  }
  return out;
}
