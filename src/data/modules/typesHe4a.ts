/**
 * Picture options for the college pictures of round 4, group A (docs/RENDERINGS_HE.md, HC94,
 * HC190, HC95, HC97, HC139, HC98). Kept apart from the shared type files, which only name them.
 * A `NumOrVar` field is a fixed number or a variable id. Every option is off unless a page sets
 * it, so no existing page changes.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── HC94: matrixGrid rowReduce, wide rows and a determinant tally ───────────

/**
 * HC94 (M-P11), options on `matrixGrid` `mode: 'rowReduce'` (drawn by MatrixReduceHe4a.tsx when
 * one is set).
 * - `inverse`: `system` is a square A (2 × 2 to 4 × 4); the picture reduces [A | I] (3 × 6,
 *   4 × 8), the bar after A, and reads the right block as A⁻¹ once the left block is I. A string
 *   `steps` pivots in A's columns only. `values` names A⁻¹'s entries (checked: they times A make
 *   I). A row of zeros in A's block says A has no inverse.
 * - `tally`: `system` is a square A (no bar). Beside each matrix, the running factor k with
 *   det A = k × det of that matrix (a swap flips the sign, scaling a row by c divides k by c,
 *   adding a multiple of a row keeps it); under the last, its diagonal's product and det A.
 *   With `steps: 'echelon'` the pivots are not scaled to 1 (the triangle keeps its pivots).
 *   `value` names det A (checked).
 */
export interface RowReduceHe4a {
  inverse?: { values?: string[][] };
  tally?: { value?: string };
}

// ─── HC190: matrixGrid mode routh ────────────────────────────────────────────

/**
 * HC190 (EC-P29): the Routh array of a characteristic polynomial (degree 2 to 6), rows sⁿ down
 * to s⁰, the first column lit and its sign changes counted (each change is a pole in the right
 * half-plane). Tap a computed cell to see its 2 × 2 cross product, (b₁ × a₂ − a₁ × b₂) ÷ b₁, the
 * four cells it uses lit. A row of zeros is replaced by the derivative of the auxiliary
 * polynomial from the row above (marked); a lone 0 in the first column by a small ε > 0.
 * - `coefficients`: highest power first (s³ + 6s² + 8s + K → [1, 6, 8, 'K']).
 * - `column`: the page's first-column values from sⁿ down (checked).
 * - `changes`: the number of sign changes (checked).
 * - `limit` (a cubic a₃s³ + a₂s² + a₁s + K): `kMax` = a₂a₁ ÷ a₃, the gain where the s¹ row is 0,
 *   and `omega` = √(a₁ ÷ a₃), the crossing frequency from the auxiliary a₂s² + K (checked;
 *   the caption works both).
 */
export interface MatrixRouthHe4a {
  mode: 'routh';
  coefficients: NumOrVar[];
  column?: NumOrVar[];
  changes?: string;
  limit?: { kMax?: string; omega?: string };
}

// ─── HC95: transformation move 'matrix' with eigen ───────────────────────────

/**
 * HC95 (M-P12): `transformation` `move: 'matrix'` (drawn by TransformationMatrixHe4a.tsx). The
 * figure (the unit square [[0, 0], [1, 0], [1, 1], [0, 1]] on the pages) dashed and its image
 * under A = [[a, b], [c, d]] filled, the unit circle dashed and its image ellipse, all to one
 * scale on a grid. No handles.
 * - `circle`: false leaves out the circle and the ellipse (default drawn).
 * - `eigen`: each real eigenvector's line through the origin dashed, a unit vector v on it and
 *   Av = λv along it labelled λ; complex eigenvalues are said in the caption. `values` names
 *   λ₁ ≥ λ₂ (checked).
 * - `det`: the page's det A = ad − bc; `area`: the image's area, |det A| × the figure's (both
 *   checked; the caption works |det A|).
 * `image` and `then` are not read.
 */
export interface MatrixMoveHe4a {
  move: 'matrix';
  matrix: [[NumOrVar, NumOrVar], [NumOrVar, NumOrVar]];
  circle?: boolean;
  eigen?: true | { values?: [string, string] };
  det?: string;
  area?: string;
}

/** Every variable id `move: 'matrix'` names. */
export const matrixMoveVars = (r: MatrixMoveHe4a): string[] =>
  ids(
    ...r.matrix.flat(),
    ...(typeof r.eigen === 'object' ? (r.eigen.values ?? []) : []),
    r.det,
    r.area,
  );

// ─── HC97: scatter points from a value group ─────────────────────────────────

/**
 * HC97 (M-P13), `scatter` `pointsFrom: '<group>'` (drawn by ScatterPointsHe4a.tsx, which hands
 * Scatter the points): the variables with that `group`, in their order, read as pairs x₁, y₁,
 * x₂, y₂, … (a value past its data set's `countedBy` count is left out; a pair with a "?" is not
 * drawn). `points` is then ignored (pass []), and the axes grow to hold every point. With
 * `leastSquares: 'fit'` and `residuals`, the page's slope and intercept are checked against
 * the typed points, as `fit` checks fixed ones.
 */
export interface ScatterHe4a {
  pointsFrom?: string;
}

/** Every variable id the matrixGrid options above name (for the module tests). */
export function matrixGridHe4aVars(r: object): string[] {
  const m = r as Partial<RowReduceHe4a & MatrixRouthHe4a> & { mode?: string };
  if (m.mode === 'routh')
    return ids(
      ...(m.coefficients ?? []),
      ...(m.column ?? []),
      m.changes,
      m.limit?.kMax,
      m.limit?.omega,
    );
  return ids(...(m.inverse?.values ?? []).flat(), m.tally?.value);
}
