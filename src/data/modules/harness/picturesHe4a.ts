/**
 * Picture checks for college round 4, group A (`typesHe4a.ts`): HC94 and HC190 on
 * `matrixGrid`, HC95 `transformation` `move: 'matrix'`, HC97 and HC139 on `scatter`, HC98
 * `treeDiagram` `chain`. What the picture draws must agree with the page's values. Called from
 * `repIssues` in `pictures.ts`. Test-only.
 */
import { det } from '@/components/module/reps/determinant';
import { multiply } from '@/components/module/reps/matrices';
import {
  eigen2,
  inverseByRows,
  polygonArea,
  routhArray,
  signChanges,
  tallyDet,
  type M2,
} from '@/components/module/reps/matrixHe4a';

import type { TransformationSpec } from '../typesGraphs';
import type { MatrixGridSpec } from '../typesHsd';

type Val = (id: string | number) => number | undefined;

const near = (a: number, b: number, rel = 1e-4, abs = 1e-6) =>
  Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b)) + abs;

/** A grid of values, once every entry is known. */
const readAll = (m: (string | number)[][], val: Val) => {
  const out = m.map((r) => r.map((x) => val(x)));
  return out.some((r) => r.some((x) => x === undefined)) ? undefined : (out as number[][]);
};

/** HC94 (`inverse`, `tally`) and HC190 (`routh`). */
export function matrixGridHe4aIssues(rep: MatrixGridSpec, val: Val): string[] {
  const out: string[] = [];
  if (rep.mode === 'routh') {
    const n = rep.coefficients.length - 1;
    if (n < 2 || n > 6) out.push(`a Routh array of degree ${n} (2 to 6)`);
    const a = rep.coefficients.map((x) => val(x));
    if (a.some((x) => x === undefined)) return out;
    const co = a as number[];
    if (co[0] === 0) out.push('the leading coefficient is 0');
    const rows = routhArray(co);
    if (rep.column && rep.column.length !== rows.length)
      out.push(`${rep.column.length} first-column values for ${rows.length} rows`);
    rep.column?.forEach((id, i) => {
      const got = val(id);
      const want = rows[i]?.cells[0];
      // A replaced row (ε, or the auxiliary's derivative) may be given as its cross product, 0.
      const zeroOk = (rows[i]?.epsilon || rows[i]?.how === 'aux') && near(got ?? 1, 0);
      if (got !== undefined && want !== undefined && !zeroOk && !near(got, want))
        out.push(`first column, row s${n - i}: ${got}, the array gives ${want}`);
    });
    const ch = rep.changes ? val(rep.changes) : undefined;
    if (ch !== undefined && ch !== signChanges(rows))
      out.push(`${ch} sign changes, the first column has ${signChanges(rows)}`);
    if (rep.limit) {
      if (n !== 3) out.push('limit is for a cubic');
      const [a3, a2, a1] = co;
      const kMax = rep.limit.kMax ? val(rep.limit.kMax) : undefined;
      if (kMax !== undefined && !near(kMax, (a2! * a1!) / a3!))
        out.push(`K_max = ${kMax}, a₂a₁ ÷ a₃ = ${(a2! * a1!) / a3!}`);
      const w = rep.limit.omega ? val(rep.limit.omega) : undefined;
      if (w !== undefined && !near(w, Math.sqrt(a1! / a3!), 1e-3))
        out.push(`ω_c = ${w}, √(a₁ ÷ a₃) = ${Math.sqrt(a1! / a3!)}`);
    }
    return out;
  }
  if (rep.mode !== 'rowReduce' || !(rep.inverse || rep.tally)) return out;
  const n = rep.system.length;
  if (n < 2 || n > 4 || rep.system.some((r) => r.length !== n))
    out.push(`${rep.inverse ? 'inverse' : 'tally'} needs a square A, 2 × 2 to 4 × 4`);
  if (rep.inverse && rep.tally) out.push('inverse and tally together (pick one)');
  const A = readAll(rep.system, val);
  if (!A || out.length) return out;
  if (rep.inverse) {
    const r = inverseByRows(A, rep.steps);
    const D = det(A);
    if (r.identity !== !near(D, 0))
      out.push(`the left block ${r.identity ? 'is' : 'is not'} I, det A = ${D}`);
    if (r.identity) {
      const I = multiply(r.inverse, A)!;
      I.forEach((row, i) =>
        row.forEach((x, j) => {
          if (!near(x, i === j ? 1 : 0))
            out.push(`(right block × A) entry (${i + 1}, ${j + 1}) is ${x}`);
        }),
      );
      rep.inverse.values?.forEach((row, i) =>
        row.forEach((id, j) => {
          const got = val(id);
          if (got !== undefined && !near(got, r.inverse[i]![j]!))
            out.push(
              `A⁻¹ entry (${i + 1}, ${j + 1}) is ${got}, the reduction gives ${r.inverse[i]![j]}`,
            );
        }),
      );
    }
  }
  if (rep.tally) {
    const t = tallyDet(A, rep.steps);
    if (!t.triangular) out.push('the row operations do not end in a triangle');
    const D = det(A);
    if (t.triangular && !near(t.det, D)) out.push(`the tally gives ${t.det}, det A = ${D}`);
    const got = rep.tally.value ? val(rep.tally.value) : undefined;
    if (got !== undefined && !near(got, D)) out.push(`det A = ${got}, the matrix gives ${D}`);
  }
  return out;
}

/** HC95: Av = λv on each drawn eigen line, λ₁ ≥ λ₂ as named; the image's area is |det A| × the figure's. */
export function matrixMoveIssues(
  rep: Extract<TransformationSpec, { move: 'matrix' }>,
  val: Val,
): string[] {
  const out: string[] = [];
  if (rep.figure.length < 2 || rep.figure.length > 8)
    out.push(`a figure with ${rep.figure.length} corners (2 to 8)`);
  const m = rep.matrix.flat().map((x) => val(x));
  if (m.some((x) => x === undefined)) return out;
  const [a, b, c, d] = m as M2;
  const e = eigen2([a, b, c, d]);
  for (const { lambda, v } of e.pairs) {
    const Av = [a * v[0] + b * v[1], c * v[0] + d * v[1]];
    if (Math.hypot(v[0], v[1]) < 1e-12) out.push('an eigenvector of length 0');
    if (!near(Av[0]!, lambda * v[0]) || !near(Av[1]!, lambda * v[1]))
      out.push(`A(${v}) = (${Av}) is not ${lambda}(${v})`);
  }
  if (typeof rep.eigen === 'object' && rep.eigen.values) {
    const ls = e.pairs.map((p) => p.lambda);
    const want = ls.length === 1 ? [ls[0]!, ls[0]!] : ls;
    rep.eigen.values.forEach((id, i) => {
      const got = val(id);
      if (got === undefined) return;
      if (!want.length) out.push(`λ${i + 1} = ${got}, but A has no real eigenvalues`);
      else if (!near(got, want[i]!)) out.push(`λ${i + 1} = ${got}, A gives ${want[i]}`);
    });
  }
  const D = a * d - b * c;
  const got = rep.det ? val(rep.det) : undefined;
  if (got !== undefined && !near(got, D)) out.push(`det A = ${got}, ad − bc = ${D}`);
  const fig = rep.figure.map(([x, y]) => [val(x), val(y)]);
  if (fig.flat().every((x) => x !== undefined)) {
    const pts = fig as [number, number][];
    const img = pts.map(([x, y]) => [a * x + b * y, c * x + d * y] as [number, number]);
    const before = polygonArea(pts);
    if (before > 0 && !near(polygonArea(img) / before, Math.abs(D)))
      out.push(`the area ratio is ${polygonArea(img) / before}, |det A| = ${Math.abs(D)}`);
    const area = rep.area ? val(rep.area) : undefined;
    if (area !== undefined && !near(area, polygonArea(img)))
      out.push(`the image's area is ${polygonArea(img)}, not ${area}`);
  }
  return out;
}
