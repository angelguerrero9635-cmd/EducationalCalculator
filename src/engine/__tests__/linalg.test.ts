import {
  characteristic,
  cramer,
  cross,
  det,
  eigenvector,
  exactShow,
  inverse,
  inverseLines,
  lambdaPolynomial,
  matMul,
  matrixText,
  nullBasis,
  polynomialRoots,
  rankNullityLines,
  rowOpText,
  rowReduce,
  rrefLines,
  vectorText,
  wholeMultiple,
} from '../linalg';

/** The plans' examples (docs/plans/he.math.md, LA#0–LA#4), worked by the engine. */
describe('linear algebra (HE-E16)', () => {
  it('writes matrices, vectors and row operations', () => {
    expect(
      matrixText([
        [1, -2],
        [0.5, 3],
      ]),
    ).toBe('[[1, −2], [1/2, 3]]');
    expect(
      matrixText(
        [
          [1, 1, 6],
          [2, -1, 3],
        ],
        exactShow,
        2,
      ),
    ).toBe('[[1, 1 | 6], [2, −1 | 3]]');
    expect(vectorText([1, -2, 1000])).toBe('⟨1, −2, 1000⟩');
    expect(rowOpText({ kind: 'swap', i: 0, j: 1 })).toBe('R₁ ↔ R₂');
    expect(rowOpText({ kind: 'scale', i: 2, k: 1 / 3 })).toBe('R₃ → (1/3)R₃');
    expect(rowOpText({ kind: 'scale', i: 0, k: -1 })).toBe('R₁ → −R₁');
    expect(rowOpText({ kind: 'add', i: 1, j: 0, k: -2 })).toBe('R₂ → R₂ − 2R₁');
    expect(rowOpText({ kind: 'add', i: 0, j: 1, k: 0.5 })).toBe('R₁ → R₁ + (1/2)R₂');
    expect(exactShow(2.9999999999999996)).toBe('3');
    expect(exactShow(Math.SQRT2)).toBe('1.4142');
  });

  it('reduces a system and finds its rank (LA#0)', () => {
    const r = rowReduce(
      [
        [1, 1, 1, 6],
        [2, 3, 1, 11],
        [3, 4, 2, 17],
      ],
      { columns: 3 },
    );
    expect(r.result).toEqual([
      [1, 0, 2, 7],
      [0, 1, -1, -1],
      [0, 0, 0, 0],
    ]);
    expect(r.pivots).toEqual([0, 1]);
    // With 18 for 17 the last row reads 0 = 1: no solution, rank [A | b] = 3.
    const none = rowReduce([
      [1, 1, 1, 6],
      [2, 3, 1, 11],
      [3, 4, 2, 18],
    ]);
    expect(none.rank).toBe(3);
    expect(
      rrefLines([
        [0, 1],
        [1, 2],
      ])[1],
    ).toBe('R₁ ↔ R₂: [[1, 2], [0, 1]]');
  });

  it('inverts by [A | I] (LA#0 ~inverse)', () => {
    expect(
      inverse([
        [2, 1, 0],
        [1, 1, 0],
        [0, 0, 3],
      ]),
    ).toEqual([
      [1, -1, 0],
      [-1, 2, 0],
      [0, 0, 1 / 3],
    ]);
    const lines = inverseLines([
      [2, 1, 0],
      [1, 1, 0],
      [0, 0, 3],
    ]);
    expect(lines[0]).toBe(
      '[A | I] = [[2, 1, 0 | 1, 0, 0], [1, 1, 0 | 0, 1, 0], [0, 0, 3 | 0, 0, 1]]',
    );
    expect(lines[lines.length - 2]).toBe('A⁻¹ = [[1, −1, 0], [−1, 2, 0], [0, 0, 1/3]]');
    expect(
      inverse([
        [1, 2],
        [2, 4],
      ]),
    ).toBeUndefined();
    expect(
      inverseLines([
        [1, 2],
        [2, 4],
      ]).pop(),
    ).toBe('A row of zeros on the left: A has no inverse.');
  });

  it('finds rank, nullity and a null basis (LA#1)', () => {
    const A = [
      [1, 2, 0, 1],
      [2, 4, 1, 4],
      [3, 6, 1, 5],
    ];
    expect(nullBasis(A)).toEqual([
      [-2, 1, 0, 0],
      [-1, 0, -2, 1],
    ]);
    const lines = rankNullityLines(A);
    expect(lines).toContain('Pivots in columns 1 and 3: rank 2');
    expect(lines).toContain('nullity = 4 − 2 = 2');
  });

  it('works determinants, Cramer and products (LA#2, m.12)', () => {
    expect(
      det([
        [0, 2, 1],
        [1, 1, 1],
        [2, 0, 3],
      ]),
    ).toBe(-4);
    expect(
      det([
        [2, 0, 0],
        [1, 3, 0],
        [0, 1, 4],
      ]),
    ).toBe(24);
    expect(
      cramer(
        [
          [2, 3],
          [1, -1],
        ],
        [13, -1],
      ),
    ).toEqual([2, 3]);
    expect(
      cramer(
        [
          [1, 2],
          [2, 4],
        ],
        [1, 2],
      ),
    ).toBeUndefined();
    expect(
      matMul(
        [
          [2, 1],
          [3, 4],
        ],
        [
          [1, 0],
          [2, 5],
        ],
      ),
    ).toEqual([
      [4, 5],
      [11, 20],
    ]);
    expect(cross([1, 2, 3], [2, 0, 1])).toEqual([2, 5, -4]);
  });

  it('finds eigenvalues and eigenvectors (LA#3)', () => {
    expect(
      characteristic([
        [4, 1],
        [2, 3],
      ]),
    ).toEqual([1, -7, 10]);
    expect(lambdaPolynomial([1, -7, 10])).toBe('λ² − 7λ + 10');
    expect(polynomialRoots([1, -7, 10]).map((z) => z.re)).toEqual([5, 2]);
    expect(
      eigenvector(
        [
          [4, 1],
          [2, 3],
        ],
        5,
      ),
    ).toEqual([1, 1]);
    expect(
      eigenvector(
        [
          [4, 1],
          [2, 3],
        ],
        2,
      ),
    ).toEqual([1, -2]);
    // Complex: [[a, −b], [b, a]] → a ± bi.
    expect(
      polynomialRoots(
        characteristic([
          [1, -1],
          [1, 1],
        ]),
      ),
    ).toEqual([
      { re: 1, im: 1 },
      { re: 1, im: -1 },
    ]);
    const A3 = [
      [2, 0, 0],
      [1, 3, 0],
      [0, 1, 1],
    ];
    expect(characteristic(A3)).toEqual([1, -6, 11, -6]);
    expect(polynomialRoots(characteristic(A3)).map((z) => z.re)).toEqual([3, 2, 1]);
    expect(eigenvector(A3, 3)).toEqual([0, 2, 1]);
    // A symmetric 3 × 3 (a stress tensor): real eigenvalues 2 + √2, 2, 2 − √2.
    const roots = polynomialRoots(
      characteristic([
        [2, 1, 0],
        [1, 2, 1],
        [0, 1, 2],
      ]),
    );
    expect(roots.map((z) => z.re)).toEqual(
      [2 + Math.SQRT2, 2, 2 - Math.SQRT2].map((x) => expect.closeTo(x, 9)),
    );
    expect(wholeMultiple([0.5, -1, 1.5])).toEqual([1, -2, 3]);
  });
});
