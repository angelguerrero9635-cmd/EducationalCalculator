/**
 * Picture checks for the Grades 9–12 statistics and counting pictures of group HB
 * (`typesHsb.ts`): what each one draws must agree with the values. Called from `repIssues` in
 * `pictures.ts`. Test-only.
 */
import { normalModel, type Span } from '@/components/module/reps/normalModel';
import { simpson } from '@/components/module/reps/statMath';

import type { NumOrVar } from '../typesGraphs';
import type { HsbSpec } from '../typesHsb';

export function hsbIssues(rep: HsbSpec, val: (id: string) => number | undefined): string[] {
  const out: string[] = [];
  const get = (v: NumOrVar | undefined) =>
    v === undefined ? undefined : typeof v === 'number' ? v : val(v);
  const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;
  switch (rep.kind) {
    case 'normalCurve': {
      const sd = get(rep.sd);
      if (sd !== undefined && !(sd > 0)) out.push(`standard deviation ${sd} is not above 0`);
      const df = get(rep.chiSquare?.df);
      if (df !== undefined && (df < 1 || df > 10 || !Number.isInteger(df)))
        out.push(`df ${df} is not a whole number from 1 to 10`);
      for (const [v, what] of [
        [rep.test?.alpha, 'α'],
        [rep.chiSquare?.alpha, 'α'],
        [rep.intervals?.level, 'confidence level'],
        [rep.interval?.level, 'confidence level'],
      ] as const) {
        const x = get(v);
        if (x !== undefined && !(x > 0 && x < 1)) out.push(`${what} ${x} is not between 0 and 1`);
      }
      if (rep.intervals && (rep.intervals.count < 20 || rep.intervals.count > 100))
        out.push(`${rep.intervals.count} simulated intervals (20 to 100 fit)`);
      // Checked once the curve's own values are known (a "?" draws the example's, faded).
      const unknown = (x: NumOrVar | undefined) => x !== undefined && get(x) === undefined;
      if ([rep.mean, rep.sd, rep.sample?.n, rep.chiSquare?.df, rep.intervals?.n].some(unknown))
        break;
      const m = normalModel(rep, get);
      if (m.problem) break;
      const shadeKnown = !rep.shade || (!unknown(rep.shade.from) && !unknown(rep.shade.to));
      // The drawn regions, integrated from the density the picture draws, against the areas
      // written (from the CDF), to 1e-4.
      const chi = m.df !== undefined;
      const integrate = (spans: Span[]) =>
        spans.reduce((t, [a, b]) => {
          const lo = chi ? Math.max(a, 0) : Math.max(a, m.m - 12 * m.s);
          const hi = chi ? Math.min(b, 200) : Math.min(b, m.m + 12 * m.s);
          if (!(hi > lo)) return t;
          // Near 0 a chi-square density with df 1 is unbounded: integrate the rest and subtract.
          if (chi && lo < 1e-9) return t + 1 - simpson(m.pdf, hi, 200, 20000);
          return t + simpson(m.pdf, lo, hi, 20000);
        }, 0);
      if (m.area !== undefined) {
        const drawn = integrate(m.regions);
        if (!near(drawn, m.area, 1e-4))
          out.push(
            `shaded area written ${m.area.toFixed(4)} but the drawn region holds ${drawn.toFixed(4)}`,
          );
        const typed = get(rep.shade?.area);
        if (typed !== undefined && shadeKnown && !near(typed, m.area, 1e-4))
          out.push(`shaded area ${m.area.toFixed(4)} doesn't match the value ${typed}`);
        const level = get(rep.interval?.level);
        const ivKnown = !unknown(rep.interval?.center) && !unknown(rep.interval?.margin);
        if (level !== undefined && ivKnown && !rep.shade && !near(level, m.area, 1e-4))
          out.push(`interval's middle area ${m.area.toFixed(4)} isn't the level ${level}`);
      }
      if (m.reject) {
        const alpha = get(rep.test?.alpha ?? rep.chiSquare?.alpha);
        const drawn = integrate(m.reject);
        if (alpha !== undefined && !near(drawn, alpha, 1e-4))
          out.push(`rejection region holds ${drawn.toFixed(4)}, not α = ${alpha}`);
      }
      if (m.pRegions && m.pValue !== undefined) {
        const drawn = integrate(m.pRegions);
        if (!near(drawn, m.pValue, 1e-4))
          out.push(
            `p-value written ${m.pValue.toFixed(4)} but its region holds ${drawn.toFixed(4)}`,
          );
        const typed = get(rep.test?.p ?? rep.chiSquare?.p);
        if (typed !== undefined && !near(typed, m.pValue, 1e-4))
          out.push(`p-value ${m.pValue.toFixed(4)} doesn't match the value ${typed}`);
      }
      if (rep.mark?.z) {
        const x = get(rep.mark.x);
        const z = get(rep.mark.z);
        if (
          x !== undefined &&
          z !== undefined &&
          !near(z, (x - m.m) / m.s, 1e-6 * (1 + Math.abs(z)))
        )
          out.push(`z = ${z} is not (${x} − ${m.m}) ÷ ${m.s}`);
      }
      if (m.intervals) {
        const mu = get(rep.mean) ?? 0;
        const widths = new Set(m.intervals.map((i) => (i.hi - i.lo).toFixed(9)));
        if (widths.size !== 1) out.push('simulated intervals are not all the same width');
        for (const iv of m.intervals) {
          if (iv.hit !== (iv.lo <= mu + 1e-12 && mu <= iv.hi + 1e-12))
            out.push(`an interval (${iv.lo}, ${iv.hi}) is counted wrongly around μ = ${mu}`);
        }
      }
      break;
    }
  }
  return out;
}
