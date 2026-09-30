/**
 * Matrix arithmetic for the matrix picture (pure, so the harness checks use it too): the
 * product, row operations applied in turn, and entries written exactly (1/2, −3).
 */
import type { RowOp } from '@/data/modules/typesHsd';

import { toFraction } from './exact';
import { short } from './hsdKit';

export type Matrix = number[][];

/** A × B, or undefined when A's columns don't match B's rows. */
export function multiply(a: Matrix, b: Matrix): Matrix | undefined {
  if (!a.length || a[0]!.length !== b.length) return undefined;
  return a.map((row) => b[0]!.map((_, j) => row.reduce((sum, x, k) => sum + x * b[k]![j]!, 0)));
}

/** One row operation, returning a new matrix (rows count from 1). */
export function applyOp(m: Matrix, op: RowOp): Matrix {
  const out = m.map((r) => [...r]);
  if ('swap' in op) {
    const [i, j] = op.swap;
    [out[i - 1], out[j - 1]] = [out[j - 1]!, out[i - 1]!];
  } else if ('scale' in op) {
    out[op.scale - 1] = out[op.scale - 1]!.map((x) => x * op.by);
  } else {
    out[op.add - 1] = out[op.add - 1]!.map((x, j) => x + op.times * out[op.from - 1]![j]!);
  }
  return out.map((r) => r.map((x) => (Math.abs(x) < 1e-12 ? 0 : x)));
}

/** Every matrix from the first through each operation. */
export const reduceSteps = (m: Matrix, ops: RowOp[]) =>
  ops.reduce<Matrix[]>((all, op) => [...all, applyOp(all[all.length - 1]!, op)], [m]);

const SUB = '₀₁₂₃₄₅₆₇₈₉';
/** R₂ */
export const rowName = (i: number) => `R${String(i).replace(/\d/g, (d) => SUB[Number(d)]!)}`;

/** An entry as a lesson writes it: whole, a fraction (−1/7) or a short decimal. */
export function entryText(x: number): string {
  const f = toFraction(x, 60);
  if (f && f[1] !== 1) return `${f[0] < 0 ? '−' : ''}${Math.abs(f[0])}/${f[1]}`;
  return short(x);
}

/** "R₂ − 2R₁ → R₂", "R₂ ↔ R₃", "(−1/7)R₃ → R₃". */
export function opText(op: RowOp): string {
  if ('swap' in op) return `${rowName(op.swap[0])} ↔ ${rowName(op.swap[1])}`;
  if ('scale' in op) {
    const k = entryText(op.by);
    const lead = k.includes('/') || k.startsWith('−') ? `(${k})` : k;
    return `${lead}${rowName(op.scale)} → ${rowName(op.scale)}`;
  }
  const t = op.times;
  const mag = entryText(Math.abs(t));
  const k = mag === '1' ? '' : mag.includes('/') ? `(${mag})` : mag;
  return `${rowName(op.add)} ${t < 0 ? '−' : '+'} ${k}${rowName(op.from)} → ${rowName(op.add)}`;
}
