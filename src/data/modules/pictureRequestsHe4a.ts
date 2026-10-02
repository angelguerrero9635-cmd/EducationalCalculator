/**
 * College pictures, round 4, group A (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
 */
import type { PictureRequest } from './pictureRequests';

const M = 'he.math.';
const EC = 'he.engineering.';

export const HE4A_REQUESTS: PictureRequest[] = [
  {
    id: 'HC94',
    kind: 'matrixGrid',
    what: 'Row reduction of [A | I] to [I | A⁻¹] (3 × 6 and 4 × 8), and det A by row reduction with a running tally and the pivot product',
    pages: [`${M}linear-algebra#0~inverse`, `${M}linear-algebra#2`],
    status: 'drawn',
    gallery: [
      'g.he-matrix-grid-inverse',
      'g.he-matrix-grid-inverse-4x4',
      'g.he-matrix-grid-tally',
      'g.he-matrix-grid-tally-4x4',
    ],
    notes: [
      'From M-P11 (HE-math-P11). Options on `matrixGrid` `mode: "rowReduce"` (typesHe4a.ts RowReduceHe4a, drawn by MatrixReduceHe4a.tsx when one is set; every existing rowReduce page unchanged).',
      'Fields: inverse?: { values?: string[][] } — `system` is the square A (2 × 2 to 4 × 4, values or numbers); the picture appends I and reduces [A | I] (3 × 6, 4 × 8), the bar after A, "A" and "I" over the blocks, "I" and "A⁻¹" under the last with the right block lit; a string `steps` pivots in A’s columns only; `values` names A⁻¹’s entries (checked: they times A make I); a singular A ends with a row of zeros and the caption says A has no inverse.',
      'tally?: { value?: string } — `system` is the square A (no bar); beside each matrix "det A = k × det of this" (a swap flips k, scaling a row by c divides k by c), each arrow’s operation says "sign flips", "det × c" or "det kept", and under the last "Triangular: det = 1 × 2 × 2 = 4" and "det A = (−1) × 4 = −4"; with steps: "echelon" the pivots are not scaled to 1; `value` names det A (checked, and the tally against the cofactor det).',
      'Columns are as wide as their widest entry so a 4 × 8 fits 358 px; more than three stages fold to the first and last behind "Show the n row operations", as rowReduce does. Any "?" entry shows "?" and nothing is reduced.',
      'Example (linear-algebra#0~inverse): { kind: "matrixGrid", mode: "rowReduce", system: [["a11", "a12", "a13"], ["a21", "a22", "a23"], ["a31", "a32", "a33"]], steps: "reduced", inverse: { values: [["b11", "b12", "b13"], ["b21", "b22", "b23"], ["b31", "b32", "b33"]] } } (A = [[2, 1, 0], [1, 1, 0], [0, 0, 3]] → [[1, −1, 0], [−1, 2, 0], [0, 0, 1/3]]).',
      'Example (linear-algebra#2): { kind: "matrixGrid", mode: "rowReduce", system: [["a11", "a12", "a13"], …], steps: "echelon", tally: { value: "D" } } ([[0, 2, 1], [1, 1, 1], [2, 0, 3]]: R₁ ↔ R₂, R₃ − 2R₁, R₃ + R₂, pivots 1, 2, 2, det = −4). A 4 × 4 works the same (the plan’s "P11 on 4 × 4 later").',
    ].join(' '),
  },
  {
    id: 'HC190',
    kind: 'matrixGrid',
    what: 'The Routh array of a characteristic polynomial: the first column lit, its sign changes counted, a cell’s 2 × 2 cross product on tap',
    pages: [`${EC}control-systems#2`, `${EC}control-systems#2~routh-count`],
    status: 'drawn',
    gallery: [
      'g.he-matrix-grid-routh',
      'g.he-matrix-grid-routh-limit',
      'g.he-matrix-grid-routh-count',
      'g.he-matrix-grid-routh-quartic',
    ],
    notes: [
      'From EC-P29 (HE-electrical-computer-P29). A new `matrixGrid` mode (typesHe4a.ts MatrixRouthHe4a, drawn by MatrixRouthHe4a.tsx; the other modes unchanged).',
      'Fields: mode: "routh"; coefficients: NumOrVar[] (highest power first, degree 2 to 6); column?: NumOrVar[] (the page’s first column from sⁿ down, checked; a replaced row may be given as its cross product, 0); changes?: string (the count of sign changes, checked); limit?: { kMax?, omega? } (a cubic a₃s³ + a₂s² + a₁s + K: K_max = a₂a₁ ÷ a₃ and ω_c = √(a₁ ÷ a₃), checked; the caption works the stable range and the crossing frequency).',
      'Drawn: the polynomial over the array, rows s³ … s⁰ labelled, the first column lit and bold, a + or − beside each row with a bracket and "change" at each sign change, and the verdict ("2 sign changes: 2 poles in the right half-plane"). Tap a worked-out cell: its four source cells outlined and "s¹: (6 × 8 − 1 × 20) ÷ 6 = 4.667" under the array. A row of zeros becomes the derivative of the auxiliary polynomial above it (teal, "d/ds of 6s² + 48 gives 12"); a lone 0 in the first column becomes ε. A "?" coefficient shows "?" and no row is worked out.',
      'Example (control-systems#2): { kind: "matrixGrid", mode: "routh", coefficients: [1, "a2", "a1", "K"], column: [1, "a2", "b1", "K"], limit: { kMax: "Km", omega: "wc" } } with b₁ = (a₂a₁ − K) ÷ a₂ (a₂ = 6, a₁ = 8 → K_max = 48, ω_c = 2.83 rad/s).',
      'Example (~routh-count): { kind: "matrixGrid", mode: "routh", coefficients: [1, "a2", "a1", "a0"], column: [1, "a2", "b1", "a0"] } (s³ + s² + 2s + 8 → 1, 1, −6, 8: 2 changes).',
    ].join(' '),
  },
  {
    id: 'HC95',
    kind: 'transformation',
    what: 'A 2 × 2 matrix as a map: the unit square and unit circle and their images, the eigenvector lines with v and Av = λv, the area scale |det A|',
    pages: [`${M}linear-algebra#3`, `${M}linear-algebra#2~volume`],
    status: 'drawn',
    gallery: [
      'g.he-transformation-matrix-eigen',
      'g.he-transformation-matrix-shear',
      'g.he-transformation-matrix-area',
      'g.he-transformation-matrix-complex',
    ],
    notes: [
      'From M-P12 (HE-math-P12). A new `transformation` move (typesHe4a.ts MatrixMoveHe4a, drawn by TransformationMatrixHe4a.tsx; the other moves unchanged).',
      'Fields: move: "matrix"; matrix: [[a, b], [c, d]] (values or numbers); figure (the unit square [[0, 0], [1, 0], [1, 1], [0, 1]]; any 2–8 corners); circle?: false (leaves out the unit circle and its ellipse); eigen?: true | { values?: [λ₁, λ₂] } (each real eigenvector’s line dashed through the origin, a unit v and Av = λv along it labelled λ; λ₁ ≥ λ₂ checked; a repeated λ is named twice; complex eigenvalues are said in the caption); det?: string (ad − bc, checked); area?: string (the image’s area, checked, |det A| × the figure’s). The view is sized from what is drawn, one scale on both axes; no handles. A "?" entry draws only the square and the circle.',
      'Caption: the columns as the images of (1, 0) and (0, 1), the area |det A| worked, a flip when det A < 0, and A(1, 1) = (5, 5) = 5(1, 1) for each eigenvector (or tr² − 4 det < 0).',
      'Example (linear-algebra#3): { kind: "transformation", figure: [[0, 0], [1, 0], [1, 1], [0, 1]], move: "matrix", matrix: [["a", "b"], ["c", "d"]], eigen: { values: ["l1", "l2"] }, det: "D" } ([[4, 1], [2, 3]] → λ = 5 along (1, 1), 2 along (1, −2)).',
      'Example (linear-algebra#2~volume, the 2-D case): { kind: "transformation", figure: [[0, 0], [1, 0], [1, 1], [0, 1]], move: "matrix", matrix: [["a", "b"], ["c", "d"]], det: "D", area: "S" } ([[3, 1], [1, 2]] → area 5). The page’s 3-D box stays `vectorDiagram` `space` with `volume`.',
    ].join(' '),
  },
];
