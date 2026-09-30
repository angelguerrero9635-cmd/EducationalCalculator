/**
 * H99: determinants for `matrixGrid` `mode: 'determinant'` (pure, so the harness checks what
 * `MatrixDeterminant.tsx` draws): a 2 × 2 or 3 × 3 determinant, a 3 × 3's first-row minors, and
 * Cramer's rule, each column replaced by the right sides in turn.
 */
export type Square = number[][];

/** The matrix with row i and column j struck out. */
export const minorOf = (m: Square, i: number, j: number): Square =>
  m.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j));

/** The determinant, by cofactor expansion along the first row. */
export function det(m: Square): number {
  if (m.length === 1) return m[0]![0]!;
  if (m.length === 2) return m[0]![0]! * m[1]![1]! - m[0]![1]! * m[1]![0]!;
  return m[0]!.reduce((s, a, j) => s + (j % 2 ? -1 : 1) * a * det(minorOf(m, 0, j)), 0);
}

/** The matrix with column j replaced by the right sides. */
export const withColumn = (m: Square, j: number, rhs: number[]): Square =>
  m.map((row, i) => row.map((x, c) => (c === j ? rhs[i]! : x)));

/** D, each Dᵢ and each unknown Dᵢ ÷ D (none when D = 0). */
export function cramerOf(m: Square, rhs: number[]) {
  const D = det(m);
  const Ds = m[0]!.map((_, j) => det(withColumn(m, j, rhs)));
  return { D, Ds, solution: D === 0 ? undefined : Ds.map((x) => x / D) };
}
