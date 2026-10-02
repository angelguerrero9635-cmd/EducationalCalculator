/**
 * Linear algebra in steps (HE-E16): matrices and vectors as plain arrays of numbers, the
 * operations a course works by hand, and the lines it writes for each — a product entry by
 * entry, a determinant (2 × 2, 3 × 3 by cofactors), Cramer's rule, the inverse by [A | I] with
 * one row operation a line, reduced echelon form with its pivots, rank and nullity with a basis
 * of the null space, 2 × 2 and 3 × 3 eigenvalues (the characteristic polynomial, then its roots)
 * with an eigenvector each, dot and cross products, and projection. Numbers print exactly as
 * fractions when they are ones (1/3, −7/2), else as decimals; every line is true as printed and
 * the harness reads each form back (`harness/algebraLines.ts`).
 *
 * Text forms: a matrix is "[[1, 2], [3, 4]]" (an augmented one "[[1, 1 | 6], [2, −1 | 3]]"), a
 * vector "⟨1, −2, 3⟩", a determinant "det [[…]]", a row operation "R₂ → R₂ − 2R₁" or "R₁ ↔ R₂".
 */
import { complex, type Complex } from './complex';
import { asFraction, formatNumber } from './format';

export type Matrix = number[][];
export type Vector = number[];

/** A number's display in a matrix, a vector or a line. */
export type Show = (x: number) => string;

/** Exactly as a fraction when it is one with a bottom up to 1000 (1/3, −7/2), else a decimal. */
export const exactShow: Show = (x) => {
  const t = tidy(x);
  return (fractionOf(t) ?? formatNumber(t)).replace(/(\d),(?=\d{3})/g, '$1');
};

/** x as an improper fraction with a bottom up to 1000 only when it is that fraction to 10⁻¹⁰. */
function fractionOf(x: number): string | undefined {
  if (Number.isInteger(x)) return undefined;
  for (let d = 2; d <= 1000; d++) {
    const n = Math.round(x * d);
    if (Math.abs(x - n / d) <= 1e-10 * Math.max(1, Math.abs(x))) return asFraction(n / d, d, true);
  }
  return undefined;
}

/** Float noise cleared: 2.9999999999999996 → 3, 1e-17 → 0. */
export function tidy(x: number): number {
  if (Math.abs(x) < 1e-12) return 0;
  const r = Math.round(x);
  if (Math.abs(x - r) < 1e-9 * Math.max(1, Math.abs(x))) return r;
  return x;
}

const SUB = '₀₁₂₃₄₅₆₇₈₉';
/** A whole number as subscript digits: 12 → "₁₂". */
export const sub = (n: number) => [...String(n)].map((d) => SUB[Number(d)]).join('');

/** A number after an operator, a negative one bracketed: 3, (−4), (−1/2). */
export const factor = (x: number, show: Show = exactShow) => {
  const s = show(x);
  return s.startsWith('−') ? `(${s})` : s;
};

// ── Text ──

/** "[[1, 2], [3, 4]]"; with `bar` columns on the left of a bar: "[[1, 2 | 5], [3, 4 | 6]]". */
export function matrixText(m: Matrix, show: Show = exactShow, bar?: number): string {
  const row = (r: number[]) =>
    bar === undefined
      ? r.map(show).join(', ')
      : `${r.slice(0, bar).map(show).join(', ')} | ${r.slice(bar).map(show).join(', ')}`;
  return `[${m.map((r) => `[${row(r)}]`).join(', ')}]`;
}

/** "⟨1, −2, 3⟩". */
export const vectorText = (v: Vector, show: Show = exactShow) => `⟨${v.map(show).join(', ')}⟩`;

// ── Arithmetic ──

export const identity = (n: number): Matrix =>
  Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
export const transpose = (m: Matrix): Matrix => m[0]!.map((_, j) => m.map((r) => r[j]!));
export const matMul = (a: Matrix, b: Matrix): Matrix =>
  a.map((r) => b[0]!.map((_, j) => tidy(r.reduce((s, x, k) => s + x * b[k]![j]!, 0))));
export const matVec = (a: Matrix, x: Vector): Vector =>
  a.map((r) => tidy(r.reduce((s, y, k) => s + y * x[k]!, 0)));
export const matAdd = (a: Matrix, b: Matrix, k = 1): Matrix =>
  a.map((r, i) => r.map((x, j) => tidy(x + k * b[i]![j]!)));
export const matScale = (a: Matrix, k: number): Matrix => a.map((r) => r.map((x) => tidy(k * x)));
export const dot = (u: Vector, v: Vector) => tidy(u.reduce((s, x, i) => s + x * v[i]!, 0));
export const cross = (u: Vector, v: Vector): Vector => [
  tidy(u[1]! * v[2]! - u[2]! * v[1]!),
  tidy(u[2]! * v[0]! - u[0]! * v[2]!),
  tidy(u[0]! * v[1]! - u[1]! * v[0]!),
];
export const norm = (u: Vector) => Math.hypot(...u);
export const trace = (a: Matrix) => tidy(a.reduce((s, r, i) => s + r[i]!, 0));

/** The determinant of a square matrix (any size), by elimination. */
export function det(a: Matrix): number {
  const m = a.map((r) => [...r]);
  const n = m.length;
  let d = 1;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(m[r]![c]!) > Math.abs(m[p]![c]!)) p = r;
    if (m[p]![c] === 0) return 0;
    if (p !== c) {
      [m[p], m[c]] = [m[c]!, m[p]!];
      d = -d;
    }
    d *= m[c]![c]!;
    for (let r = c + 1; r < n; r++) {
      const k = m[r]![c]! / m[c]![c]!;
      for (let j = c; j < n; j++) m[r]![j]! -= k * m[c]![j]!;
    }
  }
  return tidy(d);
}

/** A with row i and column j crossed out. */
export const minor = (a: Matrix, i: number, j: number): Matrix =>
  a.filter((_, r) => r !== i).map((r) => r.filter((_, c) => c !== j));

/** A with column j replaced by b (Cramer's rule). */
export const withColumn = (a: Matrix, j: number, b: Vector): Matrix =>
  a.map((r, i) => r.map((x, c) => (c === j ? b[i]! : x)));

// ── Lines ──

/** "a × e + b × g" for a row and a column. */
const sumOfProducts = (row: number[], col: number[], show: Show) =>
  row.map((x, k) => `${k ? factor(x, show) : show(x)} × ${factor(col[k]!, show)}`).join(' + ');

/**
 * A × x worked: "[[2, 1], [3, 4]] × ⟨5, −1⟩ = ⟨2 × 5 + 1 × (−1), 3 × 5 + 4 × (−1)⟩ = ⟨9, 11⟩".
 */
export function matVecLines(a: Matrix, x: Vector, show: Show = exactShow): string[] {
  const rows = a.map((r) => sumOfProducts(r, x, show));
  return [
    `${matrixText(a, show)} × ${vectorText(x, show)} = ⟨${rows.join(', ')}⟩ = ${vectorText(matVec(a, x), show)}`,
  ];
}

/**
 * A × B worked: in one line when the product has at most 4 entries, else one line a row
 * ("Row 1: [[2 × 1 + 0 × 3, …]] = [[2, …]]"), then the product.
 */
export function matMulLines(a: Matrix, b: Matrix, show: Show = exactShow): string[] {
  const p = matMul(a, b);
  const cols = transpose(b);
  const entries = a.map((r) => cols.map((c) => sumOfProducts(r, c, show)));
  const head = `${matrixText(a, show)} × ${matrixText(b, show)}`;
  if (p.length * p[0]!.length <= 4) {
    return [
      `${head} = [${entries.map((r) => `[${r.join(', ')}]`).join(', ')}] = ${matrixText(p, show)}`,
    ];
  }
  return [
    ...entries.map((r, i) => `Row ${i + 1}: [[${r.join(', ')}]] = ${matrixText([p[i]!], show)}`),
    `${head} = ${matrixText(p, show)}`,
  ];
}

/** "det [[4, 7], [2, 6]]". */
export const detText = (a: Matrix, show: Show = exactShow) => `det ${matrixText(a, show)}`;

/** The 2 × 2 determinant's arithmetic: "4 × 6 − 7 × 2". */
export const det2Arithmetic = (a: Matrix, show: Show = exactShow) =>
  `${show(a[0]![0]!)} × ${factor(a[1]![1]!, show)} − ${factor(a[0]![1]!, show)} × ${factor(a[1]![0]!, show)}`;

/**
 * A determinant worked. 2 × 2: "det [[4, 7], [2, 6]] = 4 × 6 − 7 × 2 = 10". 3 × 3 by cofactors
 * along the first row, signs +, −, +: the minors, their arithmetic, the products, the value.
 */
export function detLines(a: Matrix, show: Show = exactShow): string[] {
  const d = det(a);
  if (a.length === 2) return [`${detText(a, show)} = ${det2Arithmetic(a, show)} = ${show(d)}`];
  if (a.length !== 3) return [`${detText(a, show)} = ${show(d)}`];
  const top = a[0]!;
  const signs = ['', ' − ', ' + '];
  const minors = top.map((_, j) => minor(a, 0, j));
  const join = (parts: string[]) => parts.map((p, j) => `${signs[j]}${p}`).join('');
  const cof = top.map(
    (x, j) => `${j === 0 ? show(x) : factor(x, show)} × ${detText(minors[j]!, show)}`,
  );
  const arith = top.map(
    (x, j) => `${j === 0 ? show(x) : factor(x, show)} × (${det2Arithmetic(minors[j]!, show)})`,
  );
  const vals = top.map(
    (x, j) => `${j === 0 ? show(x) : factor(x, show)} × ${factor(det(minors[j]!), show)}`,
  );
  return [
    `${detText(a, show)} = ${join(cof)}`,
    `= ${join(arith)}`,
    `= ${join(vals)}`,
    `= ${show(d)}`,
  ];
}

/** The determinant's arithmetic in one go, as a Cramer line uses it. */
const detWorked = (a: Matrix, show: Show) => {
  if (a.length === 2) return `${det2Arithmetic(a, show)} = `;
  if (a.length !== 3) return '';
  const signs = ['', ' − ', ' + '];
  return `${a[0]!
    .map(
      (x, j) =>
        `${signs[j]}${j === 0 ? show(x) : factor(x, show)} × ${factor(det(minor(a, 0, j)), show)}`,
    )
    .join('')} = `;
};

/**
 * Cramer's rule for A x = b (2 × 2 or 3 × 3): "D = det [[…]] = 4 × 6 − 7 × 2 = 10", then for
 * each unknown "D₁ = det [[…]] = … = 20" and "x = D₁ ÷ D = 20 ÷ 10 = 2". `names` are the
 * unknowns (x, y, z). With D = 0 the lines stop at D and say so.
 */
export function cramerLines(
  a: Matrix,
  b: Vector,
  names: string[] = ['x', 'y', 'z'],
  show: Show = exactShow,
): string[] {
  const D = det(a);
  const lines = [`D = ${detText(a, show)} = ${detWorked(a, show)}${show(D)}`];
  if (D === 0) return [...lines, 'D = 0: no single solution, so Cramer’s rule doesn’t apply.'];
  a.forEach((_, j) => {
    const aj = withColumn(a, j, b);
    const Dj = det(aj);
    lines.push(`D${sub(j + 1)} = ${detText(aj, show)} = ${detWorked(aj, show)}${show(Dj)}`);
    lines.push(
      `${names[j]} = D${sub(j + 1)} ÷ D = ${show(Dj)} ÷ ${factor(D, show)} = ${show(tidy(Dj / D))}`,
    );
  });
  return lines;
}

/** Cramer's solution of A x = b, or undefined when det A = 0. */
export function cramer(a: Matrix, b: Vector): Vector | undefined {
  const D = det(a);
  if (D === 0) return undefined;
  return a.map((_, j) => tidy(det(withColumn(a, j, b)) / D));
}

// ── Row reduction ──

export type RowOp =
  | { kind: 'swap'; i: number; j: number }
  | { kind: 'scale'; i: number; k: number }
  /** Row i plus k times row j. */
  | { kind: 'add'; i: number; j: number; k: number };

const R = (i: number) => `R${sub(i + 1)}`;

/** A multiplier written before a row: "2", "(1/3)", "" for 1, "−" for −1. */
const coefficient = (k: number, show: Show) => {
  if (k === 1) return '';
  if (k === -1) return '−';
  const s = show(k);
  return /[/ .]/.test(s) && !/^−?\d+$/.test(s) ? `(${s})` : s;
};

/** "R₁ ↔ R₂", "R₁ → (1/2)R₁", "R₂ → R₂ − 2R₁". */
export function rowOpText(op: RowOp, show: Show = exactShow): string {
  if (op.kind === 'swap') return `${R(op.i)} ↔ ${R(op.j)}`;
  if (op.kind === 'scale') return `${R(op.i)} → ${coefficient(op.k, show)}${R(op.i)}`;
  const size = coefficient(Math.abs(op.k), show);
  return `${R(op.i)} → ${R(op.i)} ${op.k < 0 ? '−' : '+'} ${size}${R(op.j)}`;
}

/** The matrix after one row operation. */
export function applyRowOp(m: Matrix, op: RowOp): Matrix {
  const out = m.map((r) => [...r]);
  if (op.kind === 'swap') [out[op.i], out[op.j]] = [out[op.j]!, out[op.i]!];
  else if (op.kind === 'scale') out[op.i] = out[op.i]!.map((x) => tidy(op.k * x));
  else out[op.i] = out[op.i]!.map((x, c) => tidy(x + op.k * out[op.j]![c]!));
  return out;
}

export interface Reduction {
  /** Each operation with the matrix after it. */
  steps: { op: RowOp; matrix: Matrix }[];
  result: Matrix;
  /** The pivot columns, from 0. */
  pivots: number[];
  rank: number;
}

/**
 * Row reduction as by hand, one operation a step. `reduced` (the default) gives reduced echelon
 * form: each pivot scaled to 1 and cleared above and below. `echelon` clears below only and
 * never scales (det by row reduction keeps its pivots). Pivots are looked for in the first
 * `columns` columns (the coefficients of an augmented matrix); a swap brings up the first row
 * below with a nonzero entry, a 1 when there is one.
 */
export function rowReduce(
  m: Matrix,
  options: { columns?: number; mode?: 'reduced' | 'echelon' } = {},
): Reduction {
  const { columns = m[0]!.length, mode = 'reduced' } = options;
  let cur = m.map((r) => r.map(tidy));
  const steps: Reduction['steps'] = [];
  const pivots: number[] = [];
  const apply = (op: RowOp) => {
    cur = applyRowOp(cur, op);
    steps.push({ op, matrix: cur });
  };
  let row = 0;
  for (let c = 0; c < columns && row < cur.length; c++) {
    const below = cur.map((r, i) => i).filter((i) => i >= row && cur[i]![c] !== 0);
    if (!below.length) continue;
    if (cur[row]![c] === 0) {
      const one = below.find((i) => Math.abs(cur[i]![c]!) === 1) ?? below[0]!;
      apply({ kind: 'swap', i: row, j: one });
    }
    if (mode === 'reduced' && cur[row]![c] !== 1)
      apply({ kind: 'scale', i: row, k: tidy(1 / cur[row]![c]!) });
    for (let i = 0; i < cur.length; i++) {
      if (i === row || cur[i]![c] === 0) continue;
      if (mode === 'echelon' && i < row) continue;
      apply({ kind: 'add', i, j: row, k: tidy(-cur[i]![c]! / cur[row]![c]!) });
    }
    pivots.push(c);
    row++;
  }
  return { steps, result: cur, pivots, rank: pivots.length };
}

/** "R₂ → R₂ − 2R₁: [[1, 1 | 6], [0, 1 | −1]]", one row operation a line. */
export function reductionLines(r: Reduction, show: Show = exactShow, bar?: number): string[] {
  return r.steps.map((s) => `${rowOpText(s.op, show)}: ${matrixText(s.matrix, show, bar)}`);
}

/** "columns 1 and 3", "column 2", "columns 1, 2 and 4". */
const columnList = (cs: number[]) => {
  const n = cs.map((c) => String(c + 1));
  if (n.length === 1) return `column ${n[0]}`;
  return `columns ${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`;
};

/**
 * Reduced echelon form worked: the start, one row operation a line, then the pivots and the
 * rank ("Pivots in columns 1 and 3: rank 2"). `bar` marks an augmented matrix's coefficients.
 */
export function rrefLines(m: Matrix, show: Show = exactShow, bar?: number): string[] {
  const r = rowReduce(m, { columns: bar });
  return [
    `Start: ${matrixText(m, show, bar)}`,
    ...reductionLines(r, show, bar),
    r.rank ? `Pivots in ${columnList(r.pivots)}: rank ${r.rank}` : 'No pivots: rank 0',
  ];
}

/**
 * A basis of the null space from reduced echelon form: one vector a free column, that column's
 * entry 1 and each pivot variable the negative of its row's entry there.
 */
export function nullBasis(m: Matrix): Vector[] {
  const r = rowReduce(m);
  const n = m[0]!.length;
  const free = Array.from({ length: n }, (_, c) => c).filter((c) => !r.pivots.includes(c));
  return free.map((f) => {
    const v = Array<number>(n).fill(0);
    v[f] = 1;
    r.pivots.forEach((p, i) => (v[p] = tidy(-r.result[i]![f]!)));
    return v;
  });
}

/** The smallest whole multiple of v with its first nonzero entry positive, when there is one. */
export function wholeMultiple(v: Vector): Vector {
  const first = v.find((x) => x !== 0);
  if (first === undefined) return v;
  for (let q = 1; q <= 1000; q++) {
    const w = v.map((x) => (x / Math.abs(first)) * q);
    if (w.every((x) => Math.abs(x - Math.round(x)) < 1e-9)) {
      const ints = w.map(Math.round);
      const g = ints.reduce((a, b) => gcd(a, b), 0) || 1;
      const s = first < 0 ? -1 : 1;
      return ints.map((x) => tidy((s * x) / g));
    }
  }
  return v.map((x) => tidy(x / first));
}

function gcd(a: number, b: number): number {
  let [x, y] = [Math.abs(a), Math.abs(b)];
  while (y) [x, y] = [y, x % y];
  return x;
}

/**
 * Rank and nullity of an m × n matrix: the reduction, "rank 2", "nullity = 4 − 2 = 2", each
 * null basis vector with its check ("[[…]] × ⟨−2, 1, 0, 0⟩ = ⟨0, 0, 0⟩").
 */
export function rankNullityLines(m: Matrix, show: Show = exactShow): string[] {
  const r = rowReduce(m);
  const n = m[0]!.length;
  const basis = nullBasis(m);
  const zero = Array<number>(m.length).fill(0);
  return [
    ...rrefLines(m, show),
    `nullity = ${n} − ${r.rank} = ${n - r.rank}`,
    ...basis.map(
      (v, k) =>
        `Null vector ${k + 1}: ${matrixText(m, show)} × ${vectorText(v, show)} = ${vectorText(zero, show)}`,
    ),
  ];
}

/**
 * The inverse by [A | I] → [I | A⁻¹], one row operation a line: the start "[A | I] = […]", the
 * operations, "A⁻¹ = […]" and its check A × A⁻¹ = I. A singular A ends at the row of zeros and
 * says so.
 */
export function inverseLines(a: Matrix, show: Show = exactShow): string[] {
  const n = a.length;
  const aug = a.map((r, i) => [...r, ...identity(n)[i]!]);
  const r = rowReduce(aug, { columns: n });
  const lines = [`[A | I] = ${matrixText(aug, show, n)}`, ...reductionLines(r, show, n)];
  if (r.rank < n) return [...lines, 'A row of zeros on the left: A has no inverse.'];
  const inv = inverse(a)!;
  return [
    ...lines,
    `A⁻¹ = ${matrixText(inv, show)}`,
    `Check: ${matrixText(a, show)} × ${matrixText(inv, show)} = ${matrixText(identity(n), show)}`,
  ];
}

/** A⁻¹ by row reduction, or undefined when A is singular. */
export function inverse(a: Matrix): Matrix | undefined {
  const n = a.length;
  const r = rowReduce(
    a.map((row, i) => [...row, ...identity(n)[i]!]),
    { columns: n },
  );
  if (r.rank < n) return undefined;
  return r.result.map((row) => row.slice(n));
}

// ── Vectors ──

/** "⟨3, 1⟩ · ⟨1, 1⟩ = 3 × 1 + 1 × 1 = 4". */
export const dotLine = (u: Vector, v: Vector, show: Show = exactShow) =>
  `${vectorText(u, show)} · ${vectorText(v, show)} = ${sumOfProducts(u, v, show)} = ${show(dot(u, v))}`;

/** "⟨1, 2, 3⟩ × ⟨2, 0, 1⟩ = ⟨2 × 1 − 3 × 0, 3 × 2 − 1 × 1, 1 × 0 − 2 × 2⟩ = ⟨2, 5, −4⟩". */
export function crossLine(u: Vector, v: Vector, show: Show = exactShow): string {
  const part = (a: number, b: number, c: number, d: number) =>
    `${show(u[a]!)} × ${factor(v[b]!, show)} − ${factor(u[c]!, show)} × ${factor(v[d]!, show)}`;
  return `${vectorText(u, show)} × ${vectorText(v, show)} = ⟨${part(1, 2, 2, 1)}, ${part(2, 0, 0, 2)}, ${part(0, 1, 1, 0)}⟩ = ${vectorText(cross(u, v), show)}`;
}

/** "|⟨3, 4⟩| = √(3² + 4²) = 5". */
export const normLine = (u: Vector, show: Show = exactShow) =>
  `|${vectorText(u, show)}| = √(${u.map((x) => `${factor(x, show)}²`).join(' + ')}) = ${formatNumber(tidy(norm(u)))}`;

/**
 * The projection of u on v and the part square to v: u · v and v · v, then
 * "proj = (4 ÷ 2)⟨1, 1⟩ = ⟨2, 2⟩", "u − proj = ⟨3, 1⟩ − ⟨2, 2⟩ = ⟨1, −1⟩" and its check
 * "⟨1, −1⟩ · ⟨1, 1⟩ = … = 0". Empty when v is 0.
 */
export function projectionLines(u: Vector, v: Vector, show: Show = exactShow): string[] {
  const vv = dot(v, v);
  if (vv === 0) return [];
  const uv = dot(u, v);
  const p = v.map((x) => tidy((uv / vv) * x));
  const w = u.map((x, i) => tidy(x - p[i]!));
  return [
    dotLine(u, v, show),
    dotLine(v, v, show),
    `proj = (${show(uv)} ÷ ${factor(vv, show)})${vectorText(v, show)} = ${vectorText(p, show)}`,
    `u − proj = ${vectorText(u, show)} − ${vectorText(p, show)} = ${vectorText(w, show)}`,
    dotLine(w, v, show),
  ];
}

// ── Eigenvalues ──

/** "λ² − 7λ + 10", "λ³ − 6λ² + 11λ − 6" from the coefficients, highest power first. */
export function lambdaPolynomial(cs: number[], show: Show = exactShow): string {
  const n = cs.length - 1;
  const out: string[] = [];
  cs.forEach((c, i) => {
    const k = n - i;
    if (c === 0) return;
    const size = Math.abs(c) === 1 && k > 0 ? '' : show(Math.abs(c));
    const letter = k === 0 ? '' : k === 1 ? 'λ' : `λ${'⁰¹²³⁴⁵⁶⁷⁸⁹'[k]}`;
    out.push(`${out.length ? (c < 0 ? ' − ' : ' + ') : c < 0 ? '−' : ''}${size}${letter}`);
  });
  return out.length ? out.join('') : '0';
}

/** The entries of A − λI as text: "[[4 − λ, 1], [2, 3 − λ]]". */
export function minusLambdaText(a: Matrix, show: Show = exactShow): string {
  return `[${a
    .map(
      (r, i) =>
        `[${r.map((x, j) => (i !== j ? show(x) : x === 0 ? '−λ' : `${show(x)} − λ`)).join(', ')}]`,
    )
    .join(', ')}]`;
}

/**
 * The characteristic polynomial det(λI − A), highest power first: [1, −tr, det] for 2 × 2;
 * [1, −tr, the sum of the principal 2 × 2 minors, −det] for 3 × 3.
 */
export function characteristic(a: Matrix): number[] {
  if (a.length === 2) return [1, tidy(-trace(a)), det(a)];
  const m2 = [0, 1, 2].reduce((s, k) => s + det(minor(a, k, k)), 0);
  return [1, tidy(-trace(a)), tidy(m2), tidy(-det(a))];
}

/** The roots of a real polynomial of degree 2 or 3 (complex ones as a conjugate pair). */
export function polynomialRoots(cs: number[]): Complex[] {
  if (cs.length === 3) {
    const [a, b, c] = cs as [number, number, number];
    const d = b * b - 4 * a * c;
    if (d >= 0) {
      const s = Math.sqrt(d);
      return [complex(tidy((-b + s) / (2 * a))), complex(tidy((-b - s) / (2 * a)))];
    }
    const s = Math.sqrt(-d) / (2 * a);
    return [complex(tidy(-b / (2 * a)), tidy(s)), complex(tidy(-b / (2 * a)), tidy(-s))];
  }
  // A cubic: one real root by bisection on a bracket, then the quadratic left.
  const [, b, c, d] = cs.map((x) => x / cs[0]!) as [number, number, number, number];
  const p = (x: number) => ((x + b) * x + c) * x + d;
  const bound = 1 + Math.max(Math.abs(b), Math.abs(c), Math.abs(d));
  let [lo, hi] = [-bound, bound];
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    if (p(lo) * p(mid) <= 0) hi = mid;
    else lo = mid;
  }
  let r = (lo + hi) / 2;
  // A whole or simple fractional root is taken exactly.
  for (const q of [1, 2, 3, 4, 6]) {
    const t = Math.round(r * q) / q;
    if (Math.abs(p(t)) < 1e-9 * Math.max(1, Math.abs(d))) {
      r = t;
      break;
    }
  }
  // Divide out (λ − r): λ² + (b + r)λ + (c + r(b + r)).
  const b2 = b + r;
  const c2 = c + r * b2;
  // Largest first, as a class lists them.
  return [complex(tidy(r)), ...polynomialRoots([1, tidy(b2), tidy(c2)])].sort(
    (x, y) => y.re - x.re || y.im - x.im,
  );
}

/**
 * An eigenvector for a real eigenvalue: a basis vector of the null space of A − λI, as a whole
 * multiple when it has one. Undefined when A − λI is invertible (λ is not an eigenvalue).
 */
export function eigenvector(a: Matrix, lambda: number): Vector | undefined {
  const m = a.map((r, i) => r.map((x, j) => tidy(i === j ? x - lambda : x)));
  // An eigenvalue printed to 4 decimals leaves A − λI barely invertible: clear the noise.
  const r = rowReduce(m.map((row) => row.map((x) => (Math.abs(x) < 1e-9 ? 0 : x))));
  if (r.rank === a.length) {
    const basis = nullBasisLoose(m);
    return basis[0] && wholeMultiple(basis[0]);
  }
  const basis = nullBasis(m);
  return basis[0] && wholeMultiple(basis[0]);
}

/** A null vector of a nearly singular matrix (an eigenvalue known to some decimals). */
function nullBasisLoose(m: Matrix): Vector[] {
  const n = m.length;
  // Inverse iteration: solve (M + εI)x = x₀ a few times.
  let x = Array<number>(n).fill(1);
  const shifted = m.map((r, i) => r.map((y, j) => (i === j ? y + 1e-7 : y)));
  for (let k = 0; k < 4; k++) {
    const y = cramerSolve(shifted, x);
    if (!y) return [];
    const s = Math.max(...y.map(Math.abs));
    x = y.map((t) => t / s);
  }
  return [x.map((t) => Number(t.toPrecision(6)))];
}

const cramerSolve = (a: Matrix, b: Vector) => {
  const D = det(a);
  return D === 0 ? undefined : a.map((_, j) => det(withColumn(a, j, b)) / D);
};

/** A multiplier before a letter or a bracket: 1 is left off, −1 is "−", −2 is "(−2)". */
const times = (k: number, show: Show) => (k === 1 ? '' : k === -1 ? '−' : factor(k, show));

/** √x as written: √9, √(−4), √(17/4). */
const root = (x: number, show: Show) => {
  const s = show(x);
  return /^\d+$/.test(s) ? `√${s}` : `√(${s})`;
};

/** λ as written: 5, 1/2, 1.2679, 1 + 2i. */
export const lambdaText = (z: Complex, show: Show = exactShow) => {
  if (z.im === 0) return show(z.re);
  const im = show(Math.abs(z.im));
  return `${z.re === 0 ? '' : `${show(z.re)} ${z.im < 0 ? '−' : '+'} `}${z.re === 0 && z.im < 0 ? '−' : ''}${im === '1' ? '' : im}i`;
};

/**
 * Eigenvalues worked, 2 × 2 or 3 × 3: the characteristic polynomial from det(A − λI) (one
 * line), its roots (the quadratic formula for 2 × 2, "λ = 3: 3³ − 6 × 3² + 11 × 3 − 6 = 0" for
 * each root of a cubic), then for each real eigenvalue A − λI, an eigenvector and its check
 * "[[4, 1], [2, 3]] × ⟨1, 1⟩ = ⟨5, 5⟩ = 5⟨1, 1⟩".
 */
export function eigenLines(a: Matrix, show: Show = exactShow): string[] {
  const n = a.length;
  const cs = characteristic(a);
  const poly = lambdaPolynomial(cs, show);
  // det(A − λI) = (−1)ⁿ det(λI − A).
  const head = `det(${minusLambdaText(a, show)})`;
  const lines: string[] = [];
  if (n === 2) {
    const [, b, c] = cs as [number, number, number];
    lines.push(
      `${head} = (${show(a[0]![0]!)} − λ)(${show(a[1]![1]!)} − λ) − ${factor(a[0]![1]!, show)} × ${factor(a[1]![0]!, show)} = ${poly}`,
    );
    const disc = tidy(b * b - 4 * c);
    const roots = polynomialRoots(cs);
    const rootText =
      disc >= 0
        ? `${lambdaText(roots[0]!, show)} or ${lambdaText(roots[1]!, show)}`
        : `${show(roots[0]!.re)} ± ${show(Math.abs(roots[0]!.im)) === '1' ? '' : show(Math.abs(roots[0]!.im))}i`;
    lines.push(
      `${poly} = 0: λ = (${show(-b)} ± √(${factor(b, show)}² − 4 × ${factor(c, show)})) ÷ 2 = (${show(-b)} ± ${root(disc, show)}) ÷ 2 = ${rootText}`,
    );
  } else {
    lines.push(`${head} = −(${poly})`);
    const roots = polynomialRoots(cs);
    lines.push(`${poly} = 0: λ = ${roots.map((z) => lambdaText(z, show)).join(', ')}`);
    for (const z of roots.filter((r) => r.im === 0)) {
      const x = z.re;
      const t = cs
        .map((c, i) => {
          const k = 3 - i;
          const xs =
            k === 0 ? '' : k === 1 ? ` × ${factor(x, show)}` : ` × ${factor(x, show)}${'⁰¹²³'[k]}`;
          if (c === 0) return '';
          const size = show(Math.abs(c));
          return `${i === 0 ? (c < 0 ? '−' : '') : c < 0 ? ' − ' : ' + '}${size}${xs}`;
        })
        .join('');
      lines.push(`λ = ${show(x)}: ${t.replace(/^1 × /, '')} = 0`);
    }
  }
  const real = polynomialRoots(cs).filter((z) => z.im === 0);
  const seen = new Set<string>();
  for (const z of real) {
    const key = show(z.re);
    if (seen.has(key)) continue;
    seen.add(key);
    const shifted = a.map((r, i) => r.map((x, j) => tidy(i === j ? x - z.re : x)));
    const v = eigenvector(a, z.re);
    const shift = z.re < 0 ? `+ ${times(-z.re, show)}I` : `− ${times(z.re, show)}I`;
    lines.push(`${matrixText(a, show)} ${shift} = ${matrixText(shifted, show)}`);
    if (!v) continue;
    const av = matVec(a, v);
    lines.push(`λ = ${key}: v = ${vectorText(v, show)}`);
    lines.push(
      `Check: ${matrixText(a, show)} × ${vectorText(v, show)} = ${vectorText(av, show)} = ${times(z.re, show)}${vectorText(v, show)}`,
    );
  }
  return lines;
}
