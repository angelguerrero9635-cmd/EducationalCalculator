/**
 * Harness checks for the Grades 9–12 data-picture options (group HE: H18–H22), kept apart from
 * pictures.ts so each kind's case there only calls in. `val` reads a value as shown (undefined
 * when it is "?").
 */
import {
  correlation,
  fences,
  leastSquares,
  quartile,
  standardDeviation,
} from '@/components/module/reps/stats';

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

/** H19 (boxPlot): the fences are 1.5 × IQR past the quartiles; a second plot is in order. */
export function boxPlotIssues(rep: Of<'boxPlot'>, val: Val): string[] {
  const out: string[] = [];
  const [q1, q3] = [val(rep.q1), val(rep.q3)];
  // With data, the quartiles are the medians of its halves (the median left out).
  if (rep.fences && rep.data) {
    const n = rep.count ? val(rep.count) : undefined;
    const xs = (n !== undefined ? rep.data.slice(0, Math.round(n)) : rep.data).map(val);
    if (xs.length > 1 && xs.every((x) => x !== undefined)) {
      const [w1, w3] = [quartile(xs as number[], 1), quartile(xs as number[], 3)];
      if (q1 !== undefined && w1 !== undefined && !close(q1, w1))
        out.push(`first quartile shows ${q1}, the data give ${w1}`);
      if (q3 !== undefined && w3 !== undefined && !close(q3, w3))
        out.push(`third quartile shows ${q3}, the data give ${w3}`);
    }
  }
  if (rep.fences && q1 !== undefined && q3 !== undefined) {
    const f = fences(q1, q3);
    const [lo, hi] = [rep.fences.lower, rep.fences.upper].map((x) => (x ? val(x) : undefined));
    if (lo !== undefined && !close(lo, f.lower))
      out.push(`lower fence shows ${lo}, not ${f.lower}`);
    if (hi !== undefined && !close(hi, f.upper))
      out.push(`upper fence shows ${hi}, not ${f.upper}`);
  }
  if (rep.second) {
    const five = [
      rep.second.min,
      rep.second.q1,
      rep.second.median,
      rep.second.q3,
      rep.second.max,
    ].map(val);
    for (let i = 1; i < 5; i++) {
      const [a, b] = [five[i - 1], five[i]];
      if (a !== undefined && b !== undefined && b < a - 1e-9)
        out.push(`second box plot out of order: ${a} then ${b}`);
    }
  }
  if (rep.labels && !rep.second) out.push('box plot labels name two plots, but there is one');
  return out;
}

/** H19 (dotPlot): the standard deviation band is the data's. */
export function dotPlotSdIssues(rep: Of<'dotPlot'>, val: Val): string[] {
  if (!rep.sd) return [];
  const out: string[] = [];
  if (!rep.mean) out.push('a standard deviation band needs the mean');
  if (rep.second) out.push('a standard deviation band is drawn on one sample');
  const n = rep.count ? val(rep.count) : undefined;
  const ids = n !== undefined ? rep.data.slice(0, Math.round(n)) : rep.data;
  const xs = ids.map(val);
  const s = val(rep.sd.id);
  if (xs.every((x) => x !== undefined) && s !== undefined) {
    const want = standardDeviation(xs as number[], rep.sd.kind ?? 'population');
    // Shown to two places (or more).
    if (want !== undefined && Math.abs(s - want) > 0.0051 + 1e-6 * want)
      out.push(`standard deviation shows ${s}, the data give ${want.toFixed(4)}`);
  }
  return out;
}
