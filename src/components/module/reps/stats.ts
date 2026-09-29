/**
 * Statistics the Grades 9–12 data pictures draw and the harness checks (H18–H20): the
 * least-squares line and the correlation of points, the mean and standard deviation, the
 * 1.5 × IQR fences, and chi-square's expected counts. Plain numbers in, plain numbers out.
 */

type Pt = readonly [number, number];

const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);
export const mean = (xs: readonly number[]) => (xs.length ? sum(xs) / xs.length : NaN);

/** The least-squares line y = mx + b through the points (undefined when every x is the same). */
export function leastSquares(points: readonly Pt[]) {
  const mx = mean(points.map((p) => p[0]));
  const my = mean(points.map((p) => p[1]));
  const sxx = sum(points.map(([x]) => (x - mx) ** 2));
  const sxy = sum(points.map(([x, y]) => (x - mx) * (y - my)));
  if (!(sxx > 0)) return undefined;
  const m = sxy / sxx;
  return { m, b: my - m * mx };
}

/** The correlation coefficient r of the points (undefined when x or y never changes). */
export function correlation(points: readonly Pt[]) {
  const mx = mean(points.map((p) => p[0]));
  const my = mean(points.map((p) => p[1]));
  const sxx = sum(points.map(([x]) => (x - mx) ** 2));
  const syy = sum(points.map(([, y]) => (y - my) ** 2));
  const sxy = sum(points.map(([x, y]) => (x - mx) * (y - my)));
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : undefined;
}

/** How strong a correlation is, in words: "strong positive", "no clear". */
export function strength(r: number) {
  const a = Math.abs(r);
  const size = a >= 0.8 ? 'strong' : a >= 0.5 ? 'moderate' : a >= 0.3 ? 'weak' : undefined;
  return size ? `${size} ${r > 0 ? 'positive' : 'negative'}` : 'little or no';
}

/** The sum of squared residuals of the points about y = mx + b. */
export const squaredResiduals = (points: readonly Pt[], m: number, b: number) =>
  sum(points.map(([x, y]) => (y - (m * x + b)) ** 2));

/** The standard deviation: σ over n (population) or s over n − 1 (sample). */
export function standardDeviation(xs: readonly number[], kind: 'population' | 'sample') {
  const n = xs.length;
  if (n < (kind === 'sample' ? 2 : 1)) return undefined;
  const m = mean(xs);
  return Math.sqrt(sum(xs.map((x) => (x - m) ** 2)) / (kind === 'sample' ? n - 1 : n));
}

/** The first or third quartile: the median of the lower or upper half, the median left out. */
export function quartile(xs: readonly number[], which: 1 | 3) {
  const s = [...xs].sort((a, b) => a - b);
  const half = Math.floor(s.length / 2);
  const part = which === 3 ? s.slice(s.length - half) : s.slice(0, half);
  const n = part.length;
  if (!n) return undefined;
  return n % 2 ? part[(n - 1) / 2]! : (part[n / 2 - 1]! + part[n / 2]!) / 2;
}

/** The 1.5 × IQR fences: Q₁ − 1.5 × IQR and Q₃ + 1.5 × IQR. */
export const fences = (q1: number, q3: number) => ({
  lower: q1 - 1.5 * (q3 - q1),
  upper: q3 + 1.5 * (q3 - q1),
});

/** A two-way table's expected counts: row total × column total ÷ grand total. */
export function expectedCounts(cells: readonly (readonly number[])[]) {
  const rows = cells.map(sum);
  const cols = cells[0]?.map((_, j) => sum(cells.map((r) => r[j] ?? 0))) ?? [];
  const total = sum(rows);
  return cells.map((r, i) => r.map((_, j) => (total ? (rows[i]! * cols[j]!) / total : NaN)));
}

/** Chi-square: the sum of (observed − expected)² ÷ expected over every cell. */
export function chiSquare(
  observed: readonly (readonly number[])[],
  expected: readonly (readonly number[])[],
) {
  return sum(
    observed.flatMap((r, i) => r.map((o, j) => (o - expected[i]![j]!) ** 2 / expected[i]![j]!)),
  );
}

/** A number to two places, and whether rounding changed it (to write "≈"). */
export function twoPlaces(x: number) {
  const r = Number(x.toFixed(2));
  return { value: r, exact: Math.abs(r - x) < 1e-9 };
}
