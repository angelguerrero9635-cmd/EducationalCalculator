/**
 * Matrix arithmetic for HC94 (an inverse by [A | I], a determinant's running tally) and HC190
 * (the Routh array). Pure, so the harness checks use it too.
 */
import type { RowOp } from '@/data/modules/typesHsd';

import { autoRowOps } from './hs2h';
import { reduceSteps, type Matrix } from './matrices';

const tiny = (x: number) => Math.abs(x) < 1e-9;

/** [A | I]. */
export const withIdentity = (a: Matrix): Matrix =>
  a.map((r, i) => [...r, ...a.map((_, j) => (i === j ? 1 : 0))]);

/**
 * The row operations: as listed, or worked out pivoting in the first `pivotCols` columns only
 * (A's block of [A | I], or every column of a determinant's square). `keepPivots` drops the
 * scalings an echelon form ends with, so a determinant's triangle keeps its pivots.
 */
export function opsFor(
  m: Matrix,
  steps: RowOp[] | 'echelon' | 'reduced',
  pivotCols: number,
  keepPivots = false,
): RowOp[] {
  if (typeof steps !== 'string') return steps;
  const ops = autoRowOps(
    m.map((r) => [...r.slice(0, pivotCols), 0]),
    steps,
  );
  return keepPivots && steps === 'echelon' ? ops.filter((op) => !('scale' in op)) : ops;
}

/**
 * The running factor k before each matrix (det A = k × det of that matrix): a swap flips the
 * sign, scaling a row by c divides k by c, adding a multiple of a row keeps it.
 */
export function tallyOf(ops: RowOp[]): number[] {
  const ks = [1];
  for (const op of ops) {
    const k = ks[ks.length - 1]!;
    ks.push('swap' in op ? -k : 'scale' in op ? k / op.by : k);
  }
  return ks;
}

/** A square matrix's determinant by the tally: k × the last matrix's diagonal product. */
export function tallyDet(a: Matrix, steps: RowOp[] | 'echelon' | 'reduced') {
  const ops = opsFor(a, steps, a.length, true);
  const stages = reduceSteps(a, ops);
  const last = stages[stages.length - 1]!;
  const k = tallyOf(ops).pop()!;
  const diagonal = last.map((r, i) => r[i]!);
  const triangular = last.every((r, i) => r.every((x, j) => j >= i || tiny(x)));
  const product = diagonal.reduce((p, x) => p * x, 1);
  return { ops, stages, k, diagonal, triangular, product, det: k * product };
}

/** [A | I] reduced: the right block, and whether the left block became I. */
export function inverseByRows(a: Matrix, steps: RowOp[] | 'echelon' | 'reduced') {
  const n = a.length;
  const start = withIdentity(a);
  const ops = opsFor(start, steps, n);
  const stages = reduceSteps(start, ops);
  const last = stages[stages.length - 1]!;
  const identity = last.every((r, i) => r.slice(0, n).every((x, j) => tiny(x - (i === j ? 1 : 0))));
  const zeroRow = last.some((r) => r.slice(0, n).every(tiny));
  return { ops, stages, identity, zeroRow, inverse: last.map((r) => r.slice(n)) };
}

// ─── HC190: the Routh array ──────────────────────────────────────────────────

export interface RouthRow {
  /** The power of s this row stands for. */
  power: number;
  cells: number[];
  /** 'given' (the coefficients), 'cross' (worked out), 'aux' (an auxiliary polynomial's derivative). */
  how: 'given' | 'cross' | 'aux';
  /** A first entry of 0 replaced by a small ε > 0. */
  epsilon?: boolean;
}

export const EPSILON = 1e-3;

/**
 * The Routh array of a₀sⁿ + a₁sⁿ⁻¹ + … + aₙ (coefficients highest power first). Each entry of a
 * new row is (b₁ × a_(j+1) − a₁ × b_(j+1)) ÷ b₁ from the two rows above (a the upper, b the
 * lower); a row of zeros becomes the derivative of the row above read as a polynomial in s².
 */
export function routhArray(coefficients: number[]): RouthRow[] {
  const n = coefficients.length - 1;
  const width = Math.floor(n / 2) + 1;
  const pad = (r: number[]) => [...r, ...Array(Math.max(0, width - r.length)).fill(0)];
  const rows: RouthRow[] = [
    { power: n, cells: pad(coefficients.filter((_, i) => i % 2 === 0)), how: 'given' },
    { power: n - 1, cells: pad(coefficients.filter((_, i) => i % 2 === 1)), how: 'given' },
  ];
  for (let p = n - 2; p >= 0; p--) {
    const a = rows[rows.length - 2]!.cells;
    const b = rows[rows.length - 1]!.cells;
    const cells = Array.from({ length: width }, (_, j) =>
      j + 1 < width ? (b[0]! * a[j + 1]! - a[0]! * b[j + 1]!) / b[0]! : 0,
    ).map((x) => (tiny(x) ? 0 : x));
    const row: RouthRow = { power: p, cells, how: 'cross' };
    if (cells.every(tiny)) {
      // A row of zeros: the auxiliary polynomial from the row above, b₁s^(p+1) + b₂s^(p−1) + …,
      // differentiated.
      row.cells = b.map((x, j) => (p + 1 - 2 * j > 0 ? x * (p + 1 - 2 * j) : 0));
      row.how = 'aux';
    }
    if (tiny(row.cells[0]!) && p > 0) {
      row.cells[0] = EPSILON;
      row.epsilon = true;
    }
    rows.push(row);
  }
  return rows;
}

/** The first column's sign changes. */
export function signChanges(rows: RouthRow[]): number {
  const col = rows.map((r) => r.cells[0]!).filter((x) => !tiny(x));
  let changes = 0;
  for (let i = 1; i < col.length; i++) if (Math.sign(col[i]!) !== Math.sign(col[i - 1]!)) changes++;
  return changes;
}
