/**
 * Harness checks for the Grades 9–12 data-picture options (group HE: H18–H22), kept apart from
 * pictures.ts so each kind's case there only calls in. `val` reads a value as shown (undefined
 * when it is "?").
 */
import {
  chiSquare,
  correlation,
  expectedCounts,
  fences,
  leastSquares,
  quartile,
  shadedChance,
  standardDeviation,
} from '@/components/module/reps/stats';

import type { Representation } from '../types';
import type { TreeChances, TwoWaySpec, VennChances } from '../typesHse';

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

const ids = (...xs: (string | number | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

/** The variable ids a two-way table names (for the module tests). */
export const twoWayVars = (t: TwoWaySpec) =>
  ids(
    ...t.cells.flat(),
    ...(Array.isArray(t.expected) ? t.expected.flat() : []),
    t.frequency,
    t.chiSquare,
  );

/**
 * H20: a two-way table's shape, its lit relative frequency (row, column or grand total as the
 * whole) and chi-square from its expected counts.
 */
export function twoWayIssues(t: TwoWaySpec, val: Val): string[] {
  const out: string[] = [];
  const [R, C] = [t.rows.length, t.cols.length];
  if (t.cells.length !== R || t.cells.some((r) => r.length !== C))
    out.push(`a ${R} × ${C} table needs ${R} rows of ${C} cells`);
  if (
    Array.isArray(t.expected) &&
    (t.expected.length !== R || t.expected.some((r) => r.length !== C))
  )
    out.push('expected counts are not the table’s shape');
  if (t.lit) {
    const { row, col } = t.lit;
    if (row === undefined && col === undefined) out.push('a lit part names no row or column');
    if (row !== undefined && !(row >= 0 && row < R)) out.push(`there is no row ${row}`);
    if (col !== undefined && !(col >= 0 && col < C)) out.push(`there is no column ${col}`);
    if ((t.of === 'row' && row === undefined) || (t.of === 'col' && col === undefined))
      out.push(`a frequency of its ${t.of} needs a lit ${t.of}`);
  }
  const cells = t.cells.map((r) => r.map(val));
  if (cells.flat().some((x) => x !== undefined && x < 0)) out.push('a negative count');
  if (!cells.flat().every((x) => x !== undefined)) return out;
  const n = cells as number[][];
  const rowT = n.map((r) => r.reduce((a, b) => a + b, 0));
  const colT = n[0]!.map((_, j) => n.reduce((a, r) => a + r[j]!, 0));
  const all = rowT.reduce((a, b) => a + b, 0);
  if (t.lit && t.frequency) {
    const { row, col } = t.lit;
    const part =
      row !== undefined && col !== undefined
        ? n[row]?.[col]
        : row !== undefined
          ? rowT[row]
          : colT[col!];
    const whole = t.of === 'row' ? rowT[row!] : t.of === 'col' ? colT[col!] : all;
    const f = val(t.frequency);
    // Shown to two places, or as a percent is not used here: a fraction of 1.
    if (part !== undefined && whole && f !== undefined && Math.abs(f - part / whole) > 0.0051)
      out.push(`relative frequency shows ${f}, the table gives ${part}/${whole}`);
  }
  if (t.chiSquare && t.expected) {
    const e = t.expected === 'independence' ? expectedCounts(n) : t.expected.map((r) => r.map(val));
    // Given expected counts (goodness of fit) share out the same total as the observed.
    const eSum = e.flat().reduce<number>((acc, v) => acc + (v ?? NaN), 0);
    if (Array.isArray(t.expected) && Number.isFinite(eSum) && !close(eSum, all))
      out.push(`expected counts add to ${eSum}, the observed to ${all}`);
    const x = val(t.chiSquare);
    if (e.flat().every((v) => v !== undefined && v > 0) && x !== undefined) {
      const want = chiSquare(n, e as number[][]);
      if (Math.abs(x - want) > 0.0051 + 1e-6 * want)
        out.push(`chi-square shows ${x}, the counts give ${want.toFixed(4)}`);
    }
  }
  return out;
}

/** The variable ids a probability tree names (for the module tests). */
export const treeChanceVars = (t: TreeChances) =>
  ids(...t.first, ...t.second.flat(), t.chance, t.total);

/**
 * H21: every node's branches add to 1 (a branch left out is the complement), the lit path's
 * chance is the product along it, and the total adds one second outcome over every path.
 */
export function treeChanceIssues(t: TreeChances, val: Val): string[] {
  const out: string[] = [];
  const [A, B] = [t.names[0].length, t.names[1].length];
  if (A < 2 || B < 2 || A > 4 || B > 4) out.push(`a tree of ${A} × ${B} outcomes (2 to 4 a stage)`);
  const fits = (n: number, k: number) => n === k || n === k - 1;
  if (!fits(t.first.length, A)) out.push(`${t.first.length} first chances for ${A} outcomes`);
  if (t.second.length !== A) out.push(`${t.second.length} second-stage rows for ${A} outcomes`);
  t.second.forEach((r, i) => {
    if (!fits(r.length, B)) out.push(`${r.length} chances after outcome ${i} for ${B} outcomes`);
  });
  if (t.path && !(t.path[0] < A && t.path[1] < B))
    out.push(`path ${t.path.join(', ')} is not a branch`);
  if (t.totalOf !== undefined && !(t.totalOf >= 0 && t.totalOf < B))
    out.push(`no second outcome ${t.totalOf}`);
  if (t.total && t.totalOf === undefined) out.push('a total needs the outcome it adds (totalOf)');
  const full = (xs: (number | undefined)[], k: number) =>
    xs.every((x) => x !== undefined)
      ? xs.length === k - 1
        ? [...(xs as number[]), 1 - (xs as number[]).reduce((a, b) => a + b, 0)]
        : (xs as number[])
      : undefined;
  const pA = full(t.first.map(val), A);
  const pB = t.second.map((r) => full(r.map(val), B));
  for (const xs of [pA, ...pB]) {
    if (!xs) continue;
    if (xs.some((p) => p < -1e-9 || p > 1 + 1e-9))
      out.push(`a branch chance outside 0 to 1: ${xs.join(', ')}`);
    else if (Math.abs(xs.reduce((a, b) => a + b, 0) - 1) > 1e-6)
      out.push(`branches add to ${xs.reduce((a, b) => a + b, 0)}, not 1`);
  }
  if (!pA || pB.some((r) => !r)) return out;
  const leaf = (i: number, j: number) => pA[i]! * pB[i]![j]!;
  if (t.path && t.chance && !t.third) {
    const x = val(t.chance);
    const want = leaf(t.path[0], t.path[1]);
    if (x !== undefined && !close(x, want))
      out.push(`path chance shows ${x}, the branches give ${want}`);
  }
  if (t.totalOf !== undefined && t.total) {
    const x = val(t.total);
    const want = pA.reduce((s, _, i) => s + leaf(i, t.totalOf!), 0);
    if (x !== undefined && !close(x, want)) out.push(`total shows ${x}, the paths give ${want}`);
  }
  return out;
}

/** The variable ids a Venn diagram of probabilities names (for the module tests). */
export const vennChanceVars = (v: VennChances) => ids(v.a, v.b, v.both, v.result);

/**
 * H22: the probabilities fit together (P(A and B) at most either, P(A or B) at most 1),
 * mutually exclusive events share nothing, and the shaded result is the shaded region's.
 */
export function vennChanceIssues(v: VennChances, val: Val): string[] {
  const out: string[] = [];
  const [a, b, both] = [val(v.a), val(v.b), val(v.both)];
  if (v.result && !v.shade) out.push('a Venn result with nothing shaded');
  if (v.counts) return out; // H97: counts, checked in picturesHs2g.ts
  if (a === undefined || b === undefined || both === undefined) return out;
  for (const [name, x] of [
    ['P(A)', a],
    ['P(B)', b],
    ['P(A and B)', both],
  ] as const)
    if (x < -1e-9 || x > 1 + 1e-9) out.push(`${name} = ${x} is not between 0 and 1`);
  if (both > Math.min(a, b) + 1e-9) out.push(`P(A and B) = ${both} is more than P(A) or P(B)`);
  if (a + b - both > 1 + 1e-9) out.push(`P(A or B) = ${a + b - both} is more than 1`);
  if (v.exclusive && Math.abs(both) > 1e-9) out.push(`mutually exclusive events share ${both}`);
  const r = v.result ? val(v.result) : undefined;
  if (v.shade && r !== undefined) {
    const want = shadedChance(v.shade, a, b, v.exclusive ? 0 : both);
    if (!close(r, want)) out.push(`shaded ${v.shade} is ${want}, result shows ${r}`);
  }
  return out;
}
