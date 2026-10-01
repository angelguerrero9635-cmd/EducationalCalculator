/**
 * Picture checks for the Grades 9–12 statistics and counting pictures of group HB
 * (`typesHsb.ts`): what each one draws must agree with the values. Called from `repIssues` in
 * `pictures.ts`. Test-only.
 */
import { histModel } from '@/components/module/reps/histModel';
import { normalModel, type Span } from '@/components/module/reps/normalModel';
import { pascalRows, slotsOf } from '@/components/module/reps/pascal';
import { termsModel } from '@/components/module/reps/termsModel';
import { binomialPmf, choose, simpson } from '@/components/module/reps/statMath';

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
      // H105: the count may be a value, a whole number 20 to 100.
      const count = get(rep.intervals?.count);
      if (count !== undefined && (count < 20 || count > 100 || !Number.isInteger(count)))
        out.push(`${count} simulated intervals (20 to 100 fit)`);
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
          if (!(hi > lo)) return t + (m.tails?.(a, b) ?? 0);
          // Near 0 a chi-square density with df 1 is unbounded: integrate the rest and subtract.
          if (chi && lo < 1e-9) return t + 1 - simpson(m.pdf, hi, 200, 20000);
          // H99: a t curve's heavy tails past ±12 scales are added exactly.
          return t + simpson(m.pdf, lo, hi, 20000) + (m.tails?.(a, b) ?? 0);
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
    case 'histogram': {
      const needed = [
        ...(rep.data ?? []),
        ...(rep.counts ?? []),
        rep.width,
        rep.start,
        rep.end,
        ...(rep.probability?.probs ?? []),
        ...(rep.probability?.values ?? []),
        rep.binomial?.n,
        rep.binomial?.p,
      ];
      if (needed.some((x) => x !== undefined && get(x) === undefined)) break;
      const m = histModel(rep, get);
      const sum = m.bars.reduce((t, b) => t + b.h, 0);
      if (m.mode === 'probability') {
        if (m.problem) out.push(`probability bars: ${m.problem}`);
        else if (!near(sum, 1, 1e-9)) out.push(`probability bars add to ${sum}, not 1`);
        if (rep.binomial) {
          const n = get(rep.binomial.n)!;
          const p = get(rep.binomial.p)!;
          m.bars.forEach((b, k) => {
            if (!near(b.h, binomialPmf(n, p, k), 1e-12)) out.push(`binomial bar ${k} is ${b.h}`);
          });
          const e = get(rep.binomial.mean);
          if (e !== undefined && !near(e, n * p, 1e-6))
            out.push(`E(X) ${e} is not n × p = ${n * p}`);
        }
        const e = get(rep.probability?.mean);
        if (e !== undefined && !m.problem && !near(e, m.mean!, 1e-6))
          out.push(`E(X) ${e} is not the sum of k × P(X = k), ${m.mean}`);
        break;
      }
      if (m.problem) {
        out.push(`histogram: ${m.problem}`);
        break;
      }
      if (rep.counts) {
        const typed = rep.counts.map((x) => get(x)!);
        typed.forEach((x, i) => {
          if (x < 0 || !Number.isInteger(x)) out.push(`count ${i + 1} is ${x}, not a whole number`);
        });
        if (
          !near(
            sum,
            typed.reduce((t, x) => t + x, 0),
            1e-9,
          )
        )
          out.push('bar heights are not the counts');
      } else {
        // Recount the data into the bins drawn, independently.
        const data = (rep.data ?? []).map((x) => get(x)!);
        const inBins = data.filter((x) =>
          m.bars.some((b) => x >= b.lo - 1e-9 && x < b.hi - 1e-9),
        ).length;
        if (sum !== inBins || sum + m.outside !== data.length)
          out.push(
            `bar heights add to ${sum}, but ${inBins} of ${data.length} values are in the bins`,
          );
        const e = typeof rep.mean === 'string' ? get(rep.mean) : undefined;
        const mean = data.reduce((t, x) => t + x, 0) / data.length;
        if (e !== undefined && !near(e, mean, 1e-6))
          out.push(`mean ${e} is not the data's ${mean}`);
      }
      break;
    }
    case 'pascalTriangle': {
      const n = get(rep.n);
      const k = get(rep.k);
      const r = get(rep.slots?.r);
      for (const [x, what] of [
        [n, 'row n'],
        [k, 'entry k'],
        [r, 'places r'],
      ] as const)
        if (x !== undefined && (x < 0 || !Number.isInteger(x)))
          out.push(`${what} ${x} is not whole`);
      if (n !== undefined && rep.triangle !== false && n > 12) out.push(`row ${n} is past row 12`);
      // Every entry drawn is the sum of the two above, and is C(row, col).
      const rows = pascalRows(Math.min(12, Math.max(rep.rows ?? 6, n ?? 0)));
      rows.forEach((row, i) =>
        row.forEach((v, j) => {
          if (v !== choose(i, j)) out.push(`entry ${j} of row ${i} is ${v}, not C(${i}, ${j})`);
        }),
      );
      if (n !== undefined && r !== undefined && rep.slots) {
        const s = slotsOf(n, r, !!rep.slots.choose);
        const want = rep.slots.choose ? choose(n, r) : choose(n, r) * slotsOf(r, r, false).product;
        if (r <= n && s.value !== want) out.push(`slots give ${s.value}, not ${want}`);
        const typed = get(rep.slots.result);
        if (typed !== undefined && r <= n && typed !== s.value)
          out.push(`slots give ${s.value}, but the value is ${typed}`);
      }
      break;
    }
    case 'termsChart': {
      const a = get(rep.first);
      const d = get(rep.step);
      const n = get(rep.count);
      if (a === undefined || d === undefined || n === undefined) break;
      const most = rep.far ? 10000 : 30; // H93: `far` draws past 30
      if (n < 1 || n > most || !Number.isInteger(n)) out.push(`${n} terms (whole, 1 to ${most})`);
      const m = termsModel(rep, get);
      if (m.problem) {
        out.push(`terms chart: ${m.problem}`);
        break;
      }
      const tol = (x: number) => 1e-9 * Math.max(1, Math.abs(x));
      m.terms.forEach((t, i) => {
        const want =
          rep.type === 'power' // H106: a₁ × nᵖ
            ? a * (i + 1) ** d
            : rep.type === 'arithmetic'
              ? a + i * d
              : rep.type === 'recursive' // H93: k × the term before + c
                ? i
                  ? d * m.terms[i - 1]! + (get(rep.plus) ?? 0)
                  : a
                : a * d ** i;
        if (!near(t, want, tol(want))) out.push(`term ${i + 1} is ${t}, not ${want}`);
        const s = m.terms.slice(0, i + 1).reduce((x, y) => x + y, 0);
        if (!near(m.sums[i]!, s, tol(s))) out.push(`partial sum ${i + 1} is ${m.sums[i]}`);
      });
      const last = m.terms[m.count - 1]!;
      const typed = get(rep.term);
      if (typed !== undefined && !near(typed, last, 1e-6 * Math.max(1, Math.abs(last))))
        out.push(`term ${typed} is not the last term drawn, ${last}`);
      const S = get(rep.sum);
      const Sn = m.sums[m.count - 1]!;
      if (S !== undefined && !near(S, Sn, 1e-6 * Math.max(1, Math.abs(Sn))))
        out.push(`sum ${S} is not the partial sum drawn, ${Sn}`);
      const lim = typeof rep.limit === 'string' ? get(rep.limit) : undefined;
      if (
        lim !== undefined &&
        m.limit !== undefined &&
        !near(lim, m.limit, 1e-6 * Math.max(1, Math.abs(lim)))
      )
        out.push(`S ${lim} is not a₁ ÷ (1 − r) = ${m.limit}`);
      // The partial sums close in on the limit: |S − Sₙ| = |a rⁿ ÷ (1 − r)|.
      if (m.limit !== undefined) {
        const gap = Math.abs(m.limit - Sn);
        const want = Math.abs((a * d ** m.count) / (1 - d));
        if (!near(gap, want, 1e-9 * Math.max(1, Math.abs(m.limit))))
          out.push(`gap to S is ${gap}, not ${want}`);
      }
      break;
    }
  }
  return out;
}
