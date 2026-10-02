/**
 * College gallery demos, round 4, group A (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC94: `matrixGrid` `rowReduce` with `inverse` ([A | I]) and `tally` (det by row reduction).
 * HC190: `matrixGrid` `mode: 'routh'`.
 * HC95: `transformation` `move: 'matrix'` with `eigen`.
 * HC97: `scatter` `pointsFrom` (least squares from typed points).
 * HC139: `scatter` `classes` (minimum distance in feature space).
 * HC98: `treeDiagram` `chain` (the multivariable chain rule).
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

type Solver = (v: Values) => number | number[] | undefined;
type Rule = { relation: Relation; steps: Record<string, StepText> };

/** A finite value, or nothing. */
const fin = (x: number) => (Number.isFinite(x) ? x : undefined);
const div = (a: number, b: number) => (b === 0 ? undefined : fin(a / b));

/** A value typed or worked out: min to max. */
const num = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...(unit ? { unit } : {}), min, max, ...more });

/** A relation with its steps: each variable's solver, expression and explanation. */
function rule(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  parts: Record<string, [Solver, StepText['expr'], StepText['how']]>,
): Rule {
  const solve: Record<string, Solver> = {};
  const steps: Record<string, StepText> = {};
  for (const [v, [fn, expr, how]] of Object.entries(parts)) {
    solve[v] = fn;
    steps[v] = { expr, how };
  }
  for (const v of vars) if (!(v in solve)) solve[v] = () => undefined;
  return { relation: { id, display, vars, residual, solve }, steps };
}

/** A demo from its rules. */
function page(d: Omit<ModuleDef, 'relations' | 'steps'> & { rules: Rule[] }): ModuleDef {
  const { rules, ...rest } = d;
  return {
    workedFigures: 4,
    ...rest,
    relations: rules.map((r) => r.relation),
    steps: Object.fromEntries(rules.map((r) => [r.relation.id, r.steps])),
  };
}

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sub = (n: number) => String(n).replace(/\d/g, (d) => SUB[Number(d)]!);

// ── HC94: matrices by row reduction (linear-algebra#0~inverse, #2) ──

type Grid = string[][];

/** The ids of an n × n matrix: a11, a12, … */
const gridIds = (p: string, n: number): Grid =>
  Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => `${p}${i + 1}${j + 1}`));

/** A grid with row i and column j struck out. */
const strike = <T>(m: T[][], i: number, j: number) =>
  m.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j));

/** The determinant of a grid of values, along the first row. */
function detOf(m: number[][]): number {
  if (m.length === 1) return m[0]![0]!;
  return m[0]!.reduce((s, a, j) => s + (j % 2 ? -1 : 1) * a * detOf(strike(m, 0, j)), 0);
}

/** The same determinant as step text: {a11} × {a22} − {a12} × {a21}, minors in parentheses. */
function detText(g: Grid): string {
  if (g.length === 1) return `{${g[0]![0]}}`;
  if (g.length === 2) return `{${g[0]![0]}} × {${g[1]![1]}} − {${g[0]![1]}} × {${g[1]![0]}}`;
  return g[0]!
    .map(
      (id, j) => `${j === 0 ? '' : j % 2 ? ' − ' : ' + '}{${id}} × (${detText(strike(g, 0, j))})`,
    )
    .join('');
}

const valuesOf = (g: Grid, v: Values) => g.map((r) => r.map((id) => v[id]!));

/** Matrix entry variables: a₁₁ … in a group, as a page's 3 × 3 matrix is one thing. */
const entryVars = (g: Grid, letter: string, what: string, more: Partial<VariableDef> = {}) =>
  g.flatMap((r, i) =>
    r.map((id, j) =>
      num(
        id,
        `${letter}${sub(i + 1)}${sub(j + 1)}`,
        `${what}, row ${i + 1}, column ${j + 1}`,
        undefined,
        -1e6,
        1e6,
        {
          step: 0.01,
          group: letter,
          ...more,
        },
      ),
    ),
  );

/** D = det A, worked out from the entries. */
function determinantRule(g: Grid, how: string): Rule {
  const ids = g.flat();
  return rule(
    'D = det A (first row)',
    `{D} = ${detText(g)}`,
    ['D', ...ids],
    (v) => v.D! - detOf(valuesOf(g, v)),
    { D: [(v) => detOf(valuesOf(g, v)), detText(g), how] },
  );
}

/** Entry (i, j) of A⁻¹ = the cofactor of entry (j, i) ÷ D. */
function inverseRule(g: Grid, inv: Grid, i: number, j: number): Rule {
  // A negative cofactor is the minor with its first two rows swapped (no leading minus).
  const minor = strike(g, j, i);
  const signed = (i + j) % 2 ? [minor[1]!, minor[0]!, ...minor.slice(2)] : minor;
  const text = `(${detText(signed)}) ÷ {D}`;
  const cof = (v: Values) => detOf(valuesOf(signed, v));
  const id = inv[i]![j]!;
  return rule(
    `${id} = C${sub(j + 1)}${sub(i + 1)} ÷ D`,
    `{${id}} = ${text}`,
    [id, 'D', ...minor.flat()],
    (v) => v[id]! * v.D! - cof(v),
    {
      [id]: [
        (v) => div(cof(v), v.D!),
        text,
        `Entry (${i + 1}, ${j + 1}) of A⁻¹ is the cofactor of entry (${j + 1}, ${i + 1}) over det A: it agrees with the right block of the reduction.`,
      ],
    },
  );
}

const MATRIX = (g: Grid) => `[[${g.map((r) => r.map((id) => `{${id}}`).join(', ')).join('; ')}]]`;

/** linear-algebra#0~inverse: A⁻¹ by reducing [A | I]. */
function inverseDemo(id: string, title: string, use: string, a: number[][]): ModuleDef {
  const n = a.length;
  const g = gridIds('a', n);
  const inv = gridIds('b', n);
  const ex: Values = { D: detOf(a) };
  g.forEach((r, i) => r.forEach((k, j) => (ex[k] = a[i]![j]!)));
  const rules = [
    determinantRule(g, 'Expand along the first row: a nonzero det means A has an inverse.'),
    ...inv.flatMap((r, i) => r.map((_, j) => inverseRule(g, inv, i, j))),
  ];
  for (const r of rules.slice(1))
    ex[r.relation.vars[0]!] = r.relation.solve![r.relation.vars[0]!]!(ex) as number;
  return page({
    id,
    title,
    use,
    assumptions: [
      'Row operations on [A | I] that turn A into I turn I into A⁻¹.',
      'Each operation is a swap, a row times a nonzero number, or a multiple of one row added to another.',
      'det A = 0 leaves a row of zeros in A’s block: A has no inverse.',
    ],
    variables: [
      ...entryVars(g, 'a', 'A'),
      num('D', 'det A', 'Determinant of A', undefined, -1e12, 1e12, {
        derived: true,
        step: 0.0001,
      }),
      ...entryVars(inv, 'b', 'A⁻¹', { derived: true, step: 0.0001, fraction: 1000 }),
    ],
    rules,
    example: ex,
    startWith: g.flat(),
    equation: `${MATRIX(g)}^{−1} = ${MATRIX(inv)}`,
    representation: {
      kind: 'matrixGrid',
      mode: 'rowReduce',
      system: g,
      steps: 'reduced',
      inverse: { values: inv },
    },
  });
}

/** linear-algebra#2: det A by row reduction, the running factor beside each step. */
function tallyDemo(id: string, title: string, use: string, a: number[][]): ModuleDef {
  const g = gridIds('a', a.length);
  const ex: Values = { D: detOf(a) };
  g.forEach((r, i) => r.forEach((k, j) => (ex[k] = a[i]![j]!)));
  return page({
    id,
    title,
    use,
    assumptions: [
      'A swap flips the sign of det; a row times c multiplies det by c; adding a multiple of a row keeps det.',
      'A triangular matrix’s det is the product of its diagonal.',
      'So det A = (−1)ˢ × (product of the pivots) ÷ (product of the scale factors).',
    ],
    variables: [
      ...entryVars(g, 'a', 'A'),
      num('D', 'det A', 'Determinant of A', undefined, -1e12, 1e12, {
        derived: true,
        step: 0.0001,
      }),
    ],
    rules: [
      determinantRule(
        g,
        'Row reduction gives the same number: the tally beside the picture keeps track of each swap and scaling.',
      ),
    ],
    example: ex,
    startWith: g.flat(),
    equation: `det ${MATRIX(g)} = {D}`,
    representation: {
      kind: 'matrixGrid',
      mode: 'rowReduce',
      system: g,
      steps: 'echelon',
      tally: { value: 'D' },
    },
  });
}

const inverse3 = inverseDemo(
  'g.he-matrix-grid-inverse',
  'Inverse by row reduction: [A | I] → [I | A⁻¹]',
  'Use this for “Find the inverse of [[2, 1, 0], [1, 1, 0], [0, 0, 3]] by row reduction.”',
  [
    [2, 1, 0],
    [1, 1, 0],
    [0, 0, 3],
  ],
);

const inverse4 = inverseDemo(
  'g.he-matrix-grid-inverse-4x4',
  'A 4 × 4 inverse: [A | I] is 4 × 8',
  'Use this for “Find the inverse of the 4 × 4 matrix [[1, 2, 0, 1], [0, 1, 1, 0], [1, 2, 1, 1], [0, 1, 0, 2]].”',
  [
    [1, 2, 0, 1],
    [0, 1, 1, 0],
    [1, 2, 1, 1],
    [0, 1, 0, 2],
  ],
);

const tally3 = tallyDemo(
  'g.he-matrix-grid-tally',
  'det A by row reduction, with a running tally',
  'Use this for “Find det A by row reduction for A = [[0, 2, 1], [1, 1, 1], [2, 0, 3]].”',
  [
    [0, 2, 1],
    [1, 1, 1],
    [2, 0, 3],
  ],
);

const tally4 = tallyDemo(
  'g.he-matrix-grid-tally-4x4',
  'A 4 × 4 determinant by row reduction',
  'Use this for “Find the determinant of the 4 × 4 matrix [[2, 4, 0, 2], [1, 3, 1, 0], [0, 2, 5, 1], [1, 0, 1, 3]].”',
  [
    [2, 4, 0, 2],
    [1, 3, 1, 0],
    [0, 2, 5, 1],
    [1, 0, 1, 3],
  ],
);

// ── HC190: the Routh array (control-systems#2, ~routh-count) ──

/** b = (p × q − r) ÷ p, a first-column entry from the two rows above (lead 1). */
const crossRule = (b: string, p: string, q: string, r: string, how: string) =>
  rule(
    `${b} = (${p}${q} − ${r}) ÷ ${p}`,
    `{${b}} = ({${p}} × {${q}} − {${r}}) ÷ {${p}}`,
    [b, p, q, r],
    (v) => v[b]! * v[p]! - (v[p]! * v[q]! - v[r]!),
    {
      [b]: [(v) => div(v[p]! * v[q]! - v[r]!, v[p]!), `({${p}} × {${q}} − {${r}}) ÷ {${p}}`, how],
      [r]: [
        (v) => v[p]! * v[q]! - v[b]! * v[p]!,
        `{${p}} × {${q}} − {${b}} × {${p}}`,
        'Undo the cross product: multiply back by the row’s lead and take it from the product.',
      ],
    },
  );

/** control-systems#2 main: the stable range of K for s³ + a₂s² + a₁s + K. */
function routhGain(id: string, title: string, use: string, a2: number, a1: number, K: number) {
  return page({
    id,
    title,
    use,
    assumptions: [
      'The Routh first column is 1, a₂, (a₂a₁ − K) ÷ a₂, K; the system is stable when all four are positive.',
      'At K_max the s¹ row is 0, and the auxiliary a₂s² + K = 0 gives the crossing frequency ω_c.',
      'K > 0 is the controller gain; a₂ and a₁ come from the plant.',
    ],
    variables: [
      num('a2', 'a₂', 'Coefficient of s²', undefined, 0.01, 10000, { step: 0.01 }),
      num('a1', 'a₁', 'Coefficient of s', undefined, 0.01, 10000, { step: 0.01 }),
      num('K', 'K', 'Gain', undefined, 0.001, 1e8, { step: 0.01 }),
      num('b1', 'b₁', 'First-column entry of the s¹ row', undefined, -1e8, 1e8, { derived: true }),
      num('Km', 'K_max', 'Largest stable gain', undefined, 0, 1e8, { derived: true }),
      num('wc', 'ω_c', 'Crossing frequency', 'rad/s', 0.01, 1000, { derived: true }),
    ],
    rules: [
      crossRule(
        'b1',
        'a2',
        'a1',
        'K',
        'The s¹ entry is the 2 × 2 cross product of the two rows above, over the s² row’s lead.',
      ),
      rule('K_max = a₂a₁', '{Km} = {a2} × {a1}', ['Km', 'a2', 'a1'], (v) => v.Km! - v.a2! * v.a1!, {
        Km: [
          (v) => v.a2! * v.a1!,
          '{a2} × {a1}',
          'The s¹ entry (a₂a₁ − K) ÷ a₂ stays positive while K is under a₂a₁.',
        ],
        a1: [(v) => div(v.Km!, v.a2!), '{Km} ÷ {a2}', 'Divide K_max by a₂.'],
        a2: [(v) => div(v.Km!, v.a1!), '{Km} ÷ {a1}', 'Divide K_max by a₁.'],
      }),
      rule('ω_c = √a₁', '{wc} = √{a1}', ['wc', 'a1'], (v) => v.wc! ** 2 - v.a1!, {
        wc: [
          (v) => Math.sqrt(v.a1!),
          '√{a1}',
          'At K_max, a₂s² + a₂a₁ = 0 gives s = ±j√a₁: the poles cross the jω axis there.',
        ],
        a1: [(v) => v.wc! ** 2, '{wc}²', 'Square the crossing frequency.'],
      }),
    ],
    example: { a2, a1, K, b1: (a2 * a1 - K) / a2, Km: a2 * a1, wc: Math.sqrt(a1) },
    startWith: ['a2', 'a1', 'K'],
    equation: 's³ + {a2}s² + {a1}s + {K} = 0',
    representation: {
      kind: 'matrixGrid',
      mode: 'routh',
      coefficients: [1, 'a2', 'a1', 'K'],
      column: [1, 'a2', 'b1', 'K'],
      limit: { kMax: 'Km', omega: 'wc' },
    },
  });
}

const routhMain = routhGain(
  'g.he-matrix-grid-routh',
  'Routh array: the range of K for stability',
  'Use this for “For what K is s³ + 6s² + 8s + K = 0 stable?”',
  6,
  8,
  20,
);

const routhLimit = routhGain(
  'g.he-matrix-grid-routh-limit',
  'Routh array at K_max: a row of zeros',
  'Use this for “At what K does s³ + 6s² + 8s + K = 0 oscillate, and at what frequency?”',
  6,
  8,
  48,
);

/** control-systems#2~routh-count: right-half-plane poles from the first column's sign changes. */
const routhCount = page({
  id: 'g.he-matrix-grid-routh-count',
  title: 'Routh array: counting right-half-plane poles',
  use: 'Use this for “How many roots of s³ + s² + 2s + 8 = 0 lie in the right half-plane?”',
  assumptions: [
    'Each sign change down the first column is one pole in the right half-plane.',
    'The s¹ entry is (a₂a₁ − a₀) ÷ a₂ for s³ + a₂s² + a₁s + a₀.',
    'A first column with no sign changes and no zeros means every pole is in the left half-plane.',
  ],
  variables: [
    num('a2', 'a₂', 'Coefficient of s²', undefined, -10000, 10000, { step: 0.01 }),
    num('a1', 'a₁', 'Coefficient of s', undefined, -10000, 10000, { step: 0.01 }),
    num('a0', 'a₀', 'Constant term', undefined, -10000, 10000, { step: 0.01 }),
    num('b1', 'b₁', 'First-column entry of the s¹ row', undefined, -1e8, 1e8, { derived: true }),
  ],
  rules: [
    crossRule(
      'b1',
      'a2',
      'a1',
      'a0',
      'The s¹ entry is the 2 × 2 cross product of the two rows above, over the s² row’s lead.',
    ),
  ],
  example: { a2: 1, a1: 2, a0: 8, b1: -6 },
  startWith: ['a2', 'a1', 'a0'],
  equation: 's³ + {a2}s² + {a1}s + {a0} = 0',
  representation: {
    kind: 'matrixGrid',
    mode: 'routh',
    coefficients: [1, 'a2', 'a1', 'a0'],
    column: [1, 'a2', 'b1', 'a0'],
  },
});

/** A quartic: the array's width 3, two worked-out rows (the edge of the plan's cubics). */
const routhQuartic = page({
  id: 'g.he-matrix-grid-routh-quartic',
  title: 'Routh array of a quartic',
  use: 'Use this for “Is s⁴ + 3s³ + 5s² + 4s + 2 = 0 stable?”',
  assumptions: [
    'Rows s⁴ and s³ hold the coefficients by turns; each row below is cross products of the two above.',
    'For s⁴ + a₃s³ + a₂s² + a₁s + a₀: b₁ = (a₃a₂ − a₁) ÷ a₃, b₂ = a₀ and c₁ = (b₁a₁ − a₃a₀) ÷ b₁.',
    'Stable when the whole first column is positive.',
  ],
  variables: [
    num('a3', 'a₃', 'Coefficient of s³', undefined, -10000, 10000, { step: 0.01 }),
    num('a2', 'a₂', 'Coefficient of s²', undefined, -10000, 10000, { step: 0.01 }),
    num('a1', 'a₁', 'Coefficient of s', undefined, -10000, 10000, { step: 0.01 }),
    num('a0', 'a₀', 'Constant term', undefined, -10000, 10000, { step: 0.01 }),
    num('b1', 'b₁', 'First-column entry of the s² row', undefined, -1e8, 1e8, { derived: true }),
    num('c1', 'c₁', 'First-column entry of the s¹ row', undefined, -1e8, 1e8, { derived: true }),
  ],
  rules: [
    crossRule(
      'b1',
      'a3',
      'a2',
      'a1',
      'The s² entry: the cross product of rows s⁴ and s³ over the s³ row’s lead.',
    ),
    rule(
      'c₁ = (b₁a₁ − a₃a₀) ÷ b₁',
      '{c1} = ({b1} × {a1} − {a3} × {a0}) ÷ {b1}',
      ['c1', 'b1', 'a1', 'a3', 'a0'],
      (v) => v.c1! * v.b1! - (v.b1! * v.a1! - v.a3! * v.a0!),
      {
        c1: [
          (v) => div(v.b1! * v.a1! - v.a3! * v.a0!, v.b1!),
          '({b1} × {a1} − {a3} × {a0}) ÷ {b1}',
          'The s¹ entry: the cross product of rows s³ and s² over the s² row’s lead.',
        ],
      },
    ),
  ],
  example: { a3: 3, a2: 5, a1: 4, a0: 2, b1: 11 / 3, c1: 26 / 11 },
  startWith: ['a3', 'a2', 'a1', 'a0'],
  equation: 's⁴ + {a3}s³ + {a2}s² + {a1}s + {a0} = 0',
  representation: {
    kind: 'matrixGrid',
    mode: 'routh',
    coefficients: [1, 'a3', 'a2', 'a1', 'a0'],
    column: [1, 'a3', 'b1', 'c1', 'a0'],
  },
});

// ── HC95: a 2 × 2 matrix as a map of the plane (linear-algebra#3, #2~volume) ──

const UNIT_SQUARE: [number, number][] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];

const entry2 = (id: string, symbol: string, where: string) =>
  num(id, symbol, `A, ${where}`, undefined, -1000, 1000, { step: 0.01, group: 'A' });

const ENTRIES = [
  entry2('a', 'a', 'row 1, column 1'),
  entry2('b', 'b', 'row 1, column 2'),
  entry2('c', 'c', 'row 2, column 1'),
  entry2('d', 'd', 'row 2, column 2'),
];

const traceRule = rule(
  'tr A = a + d',
  '{tr} = {a} + {d}',
  ['tr', 'a', 'd'],
  (v) => v.tr! - v.a! - v.d!,
  {
    tr: [(v) => v.a! + v.d!, '{a} + {d}', 'The trace is the sum of the diagonal entries.'],
  },
);

const detRule = rule(
  'det A = ad − bc',
  '{D} = {a} × {d} − {b} × {c}',
  ['D', 'a', 'b', 'c', 'd'],
  (v) => v.D! - (v.a! * v.d! - v.b! * v.c!),
  {
    D: [
      (v) => v.a! * v.d! - v.b! * v.c!,
      '{a} × {d} − {b} × {c}',
      'Down the main diagonal, minus the other diagonal.',
    ],
  },
);

const discRule = rule(
  'Δ = tr² − 4 det',
  '{disc} = {tr}² − 4 × {D}',
  ['disc', 'tr', 'D'],
  (v) => v.disc! - (v.tr! ** 2 - 4 * v.D!),
  {
    disc: [
      (v) => v.tr! ** 2 - 4 * v.D!,
      '{tr}² − 4 × {D}',
      'The discriminant of λ² − (tr A)λ + det A = 0 says whether the eigenvalues are real.',
    ],
  },
);

const traceVars = [
  num('tr', 'tr A', 'Trace of A', undefined, -2000, 2000, { derived: true }),
  num('D', 'det A', 'Determinant of A', undefined, -2e6, 2e6, { derived: true }),
  num('disc', 'Δ', 'Discriminant tr² − 4 det', undefined, -1e7, 1e7, { derived: true }),
];

/** linear-algebra#3 main: eigenvalues and eigenvectors, drawn as the lines A keeps. */
function eigenDemo(
  id: string,
  title: string,
  use: string,
  [a, b, c, d]: [number, number, number, number],
) {
  const tr = a + d;
  const D = a * d - b * c;
  const disc = tr ** 2 - 4 * D;
  const l1 = (tr + Math.sqrt(disc)) / 2;
  const l2 = (tr - Math.sqrt(disc)) / 2;
  const lambdaRule = (l: string, sign: 1 | -1) =>
    rule(
      `${l} = (tr ${sign > 0 ? '+' : '−'} √Δ) ÷ 2`,
      `{${l}} = ({tr} ${sign > 0 ? '+' : '−'} √{disc}) ÷ 2`,
      [l, 'tr', 'disc'],
      (v) => 2 * v[l]! - (v.tr! + sign * Math.sqrt(Math.max(0, v.disc!))),
      {
        [l]: [
          (v) => (v.disc! < 0 ? undefined : (v.tr! + sign * Math.sqrt(v.disc!)) / 2),
          `({tr} ${sign > 0 ? '+' : '−'} √{disc}) ÷ 2`,
          'The quadratic formula on λ² − (tr A)λ + det A = 0.',
        ],
      },
    );
  const slopeRule = (p: string, l: string) =>
    rule(
      `${p} = (${l} − a) ÷ b`,
      `{${p}} = ({${l}} − {a}) ÷ {b}`,
      [p, l, 'a', 'b'],
      (v) => v[p]! * v.b! - (v[l]! - v.a!),
      {
        [p]: [
          (v) => div(v[l]! - v.a!, v.b!),
          `({${l}} − {a}) ÷ {b}`,
          'Row 1 of (A − λI)v = 0 is (a − λ)x + by = 0: with x = 1, y = (λ − a) ÷ b.',
        ],
      },
    );
  return page({
    id,
    title,
    use,
    assumptions: [
      'Av = λv means A only stretches v: the line along v maps onto itself.',
      'λ² − (tr A)λ + det A = 0; real eigenvalues need a discriminant of 0 or more.',
      'Each eigenvector is written v = (1, p), so b must not be 0.',
    ],
    variables: [
      ...ENTRIES,
      ...traceVars,
      num('l1', 'λ₁', 'Larger eigenvalue', undefined, -2000, 2000, { derived: true }),
      num('l2', 'λ₂', 'Smaller eigenvalue', undefined, -2000, 2000, { derived: true }),
      num('p1', 'p₁', 'Slope of v₁ = (1, p₁)', undefined, -1e6, 1e6, { derived: true }),
      num('p2', 'p₂', 'Slope of v₂ = (1, p₂)', undefined, -1e6, 1e6, { derived: true }),
    ],
    rules: [
      traceRule,
      detRule,
      discRule,
      lambdaRule('l1', 1),
      lambdaRule('l2', -1),
      slopeRule('p1', 'l1'),
      slopeRule('p2', 'l2'),
    ],
    example: { a, b, c, d, tr, D, disc, l1, l2, p1: (l1 - a) / b, p2: (l2 - a) / b },
    startWith: ['a', 'b', 'c', 'd'],
    equation: '[[{a}, {b}; {c}, {d}]] [[1; {p1}]] = {l1} [[1; {p1}]]',
    representation: {
      kind: 'transformation',
      figure: UNIT_SQUARE,
      move: 'matrix',
      matrix: [
        ['a', 'b'],
        ['c', 'd'],
      ],
      eigen: { values: ['l1', 'l2'] },
      det: 'D',
    },
  });
}

const eigenMain = eigenDemo(
  'g.he-transformation-matrix-eigen',
  'Eigenvectors: the lines a matrix keeps',
  'Use this for “Find the eigenvalues and eigenvectors of [[4, 1], [2, 3]].”',
  [4, 1, 2, 3],
);

const eigenShear = eigenDemo(
  'g.he-transformation-matrix-shear',
  'A shear: one repeated eigenvalue, one line',
  'Use this for “Find the eigenvalues and eigenvectors of the shear [[1, 1], [0, 1]].”',
  [1, 1, 0, 1],
);

/** linear-algebra#2~volume in 2-D: the unit square's image has area |det A|. */
const areaDemo = page({
  id: 'g.he-transformation-matrix-area',
  title: 'det A as an area scale',
  use: 'Use this for “The matrix [[3, 1], [1, 2]] maps the unit square to a parallelogram. Find its area.”',
  assumptions: [
    'A sends (1, 0) and (0, 1) to its columns, so the unit square goes to the parallelogram on them.',
    'Every area is multiplied by |det A|; a negative det A also flips the figure over.',
    'The unit circle goes to an ellipse with area π|det A|.',
  ],
  variables: [
    ...ENTRIES,
    num('D', 'det A', 'Determinant of A', undefined, -2e6, 2e6, { derived: true }),
    num('S', 'S', 'Area of the image square', undefined, 0, 2e6, { derived: true }),
  ],
  rules: [
    detRule,
    rule('S = |det A|', '{S} = |{D}|', ['S', 'D'], (v) => v.S! - Math.abs(v.D!), {
      S: [
        (v) => Math.abs(v.D!),
        '|{D}|',
        'The unit square has area 1, so the image has area |det A| × 1.',
      ],
    }),
  ],
  example: { a: 3, b: 1, c: 1, d: 2, D: 5, S: 5 },
  startWith: ['a', 'b', 'c', 'd'],
  equation: 'det [[{a}, {b}; {c}, {d}]] = {D}',
  representation: {
    kind: 'transformation',
    figure: UNIT_SQUARE,
    move: 'matrix',
    matrix: [
      ['a', 'b'],
      ['c', 'd'],
    ],
    det: 'D',
    area: 'S',
  },
});

/** linear-algebra#3~complex at the edge: no real eigenvector, a turn with a stretch. */
const eigenComplex = page({
  id: 'g.he-transformation-matrix-complex',
  title: 'No real eigenvectors: a turn and a stretch',
  use: 'Use this for “Does [[1, −1], [1, 1]] have real eigenvalues? What does it do to the plane?”',
  assumptions: [
    'λ² − (tr A)λ + det A = 0 has no real roots when tr² − 4 det < 0.',
    'Then no line through the origin maps onto itself: A turns every direction.',
    '[[a, −b], [b, a]] turns by θ with tan θ = b ÷ a and stretches by √(a² + b²).',
  ],
  variables: [...ENTRIES, ...traceVars],
  rules: [traceRule, detRule, discRule],
  example: { a: 1, b: -1, c: 1, d: 1, tr: 2, D: 2, disc: -4 },
  startWith: ['a', 'b', 'c', 'd'],
  equation: 'λ² − {tr}λ + {D} = 0',
  representation: {
    kind: 'transformation',
    figure: UNIT_SQUARE,
    move: 'matrix',
    matrix: [
      ['a', 'b'],
      ['c', 'd'],
    ],
    eigen: true,
    det: 'D',
  },
});

// ── HC97: least squares from typed points (linear-algebra#4) ──

/** linear-algebra#4 main: the least-squares line by the normal equations, the points typed. */
function leastSquaresDemo(id: string, title: string, use: string, pts: [number, number][]) {
  const n = pts.length;
  const xs = pts.map((_, i) => `x${i + 1}`);
  const ys = pts.map((_, i) => `y${i + 1}`);
  const sum = (f: (i: number) => number) => pts.reduce((s, _, i) => s + f(i), 0);
  const sx = sum((i) => pts[i]![0]);
  const sy = sum((i) => pts[i]![1]);
  const sxx = sum((i) => pts[i]![0] ** 2);
  const sxy = sum((i) => pts[i]![0] * pts[i]![1]);
  const m = (n * sxy - sx * sy) / (n * sxx - sx ** 2);
  const b = (sy - m * sx) / n;
  const E = sum((i) => (pts[i]![1] - m * pts[i]![0] - b) ** 2);
  const ex: Values = { sx, sy, sxx, sxy, m, b, E };
  pts.forEach(([x, y], i) => {
    ex[xs[i]!] = x;
    ex[ys[i]!] = y;
  });
  const total = (
    id2: string,
    name: string,
    term: (i: number) => string,
    f: (v: Values, i: number) => number,
    how: string,
  ) => {
    const text = pts.map((_, i) => term(i)).join(' + ');
    const vars = [
      ...new Set(pts.flatMap((_, i) => [...term(i).matchAll(/\{(\w+)\}/g)].map((x) => x[1]!))),
    ];
    return rule(
      name,
      `{${id2}} = ${text}`,
      [id2, ...vars],
      (v) => v[id2]! - pts.reduce((s, _, i) => s + f(v, i), 0),
      {
        [id2]: [(v) => pts.reduce((s, _, i) => s + f(v, i), 0), text, how],
      },
    );
  };
  const point = (i: number) =>
    [
      num(xs[i]!, `x${sub(i + 1)}`, `Point ${i + 1}, x`, undefined, -1e4, 1e4, {
        step: 0.01,
        group: 'P',
      }),
      num(ys[i]!, `y${sub(i + 1)}`, `Point ${i + 1}, y`, undefined, -1e4, 1e4, {
        step: 0.01,
        group: 'P',
      }),
    ] as VariableDef[];
  const residual = (i: number) => `({${ys[i]}} − {m} × {${xs[i]}} − {b})²`;
  return page({
    id,
    title,
    use,
    assumptions: [
      'A’s rows are (xᵢ, 1) and b holds the yᵢ: AᵀA x̂ = Aᵀb gives the slope m and intercept b.',
      'Ax̂ is the projection of b onto Col A, so the residual is square to every column.',
      'The least-squares line makes the sum of the squared residuals as small as any line can.',
    ],
    variables: [
      ...pts.flatMap((_, i) => point(i)),
      num('sxx', 'Σx²', 'Top left of AᵀA', undefined, 0, 1e9, { derived: true }),
      num('sx', 'Σx', 'Sum of the x values', undefined, -1e6, 1e6, { derived: true }),
      num('sxy', 'Σxy', 'First entry of Aᵀb', undefined, -1e9, 1e9, { derived: true }),
      num('sy', 'Σy', 'Sum of the y values', undefined, -1e6, 1e6, { derived: true }),
      num('m', 'm', 'Slope', undefined, -1e6, 1e6, { derived: true }),
      num('b', 'b', 'Intercept', undefined, -1e7, 1e7, { derived: true }),
      num('E', '‖b − Ax̂‖²', 'Squared error', undefined, 0, 1e12, { derived: true }),
    ],
    rules: [
      total(
        'sx',
        'Σx',
        (i) => `{${xs[i]}}`,
        (v, i) => v[xs[i]!]!,
        'Add the x values: the off-diagonal of AᵀA.',
      ),
      total(
        'sy',
        'Σy',
        (i) => `{${ys[i]}}`,
        (v, i) => v[ys[i]!]!,
        'Add the y values: the second entry of Aᵀb.',
      ),
      total(
        'sxx',
        'Σx²',
        (i) => `{${xs[i]}}²`,
        (v, i) => v[xs[i]!]! ** 2,
        'Add the squares of the x values: the top left of AᵀA.',
      ),
      total(
        'sxy',
        'Σxy',
        (i) => `{${xs[i]}} × {${ys[i]}}`,
        (v, i) => v[xs[i]!]! * v[ys[i]!]!,
        'Add each x times its y: the first entry of Aᵀb.',
      ),
      rule(
        'm from the normal equations',
        `{m} = (${n} × {sxy} − {sx} × {sy}) ÷ (${n} × {sxx} − {sx}²)`,
        ['m', 'sxy', 'sx', 'sy', 'sxx'],
        (v) => v.m! * (n * v.sxx! - v.sx! ** 2) - (n * v.sxy! - v.sx! * v.sy!),
        {
          m: [
            (v) => div(n * v.sxy! - v.sx! * v.sy!, n * v.sxx! - v.sx! ** 2),
            `(${n} × {sxy} − {sx} × {sy}) ÷ (${n} × {sxx} − {sx}²)`,
            'Solve the 2 × 2 normal equations AᵀA x̂ = Aᵀb for the slope (Cramer’s rule).',
          ],
        },
      ),
      rule(
        'b = (Σy − mΣx) ÷ n',
        `{b} = ({sy} − {m} × {sx}) ÷ ${n}`,
        ['b', 'sy', 'm', 'sx'],
        (v) => n * v.b! - (v.sy! - v.m! * v.sx!),
        {
          b: [
            (v) => (v.sy! - v.m! * v.sx!) / n,
            `({sy} − {m} × {sx}) ÷ ${n}`,
            'The second normal equation: the line passes through the mean point.',
          ],
        },
      ),
      total(
        'E',
        'E = Σ residual²',
        residual,
        (v, i) => (v[ys[i]!]! - v.m! * v[xs[i]!]! - v.b!) ** 2,
        'Square each residual, actual minus predicted, and add.',
      ),
    ],
    example: ex,
    startWith: pts.flatMap((_, i) => [xs[i]!, ys[i]!]),
    equation: `[[{sxx}, {sx}; {sx}, ${n}]] [[{m}; {b}]] = [[{sxy}; {sy}]]`,
    representation: {
      kind: 'scatter',
      x: { label: 'x', min: 0, max: 4 },
      y: { label: 'y', min: 0, max: 5 },
      points: [],
      pointsFrom: 'P',
      slope: 'm',
      intercept: 'b',
      leastSquares: 'fit',
      residuals: 'segments',
    },
  });
}

const leastSquares4 = leastSquaresDemo(
  'g.he-scatter-points-from',
  'Least squares by the normal equations',
  'Use this for “Find the least-squares line through (0, 1), (1, 2), (2, 2), (3, 4).”',
  [
    [0, 1],
    [1, 2],
    [2, 2],
    [3, 4],
  ],
);

const leastSquares8 = leastSquaresDemo(
  'g.he-scatter-points-from-eight',
  'Least squares through eight typed points',
  'Use this for “Fit a line by least squares to the eight readings (1, 2.1), (2, 2.9), …, (8, 8.9).”',
  [
    [1, 2.1],
    [2, 2.9],
    [3, 4.2],
    [4, 4.8],
    [5, 6.1],
    [6, 6.8],
    [7, 8.2],
    [8, 8.9],
  ],
);

// ── HC139: minimum-distance classification (remote-sensing#2~min-distance) ──

/** The class means fixed in the page's assumptions: (red, near infrared) reflectance. */
const CLASS_MEANS = [
  { id: 'dW', name: 'Water', x: 0.05, y: 0.03 },
  { id: 'dV', name: 'Vegetation', x: 0.06, y: 0.45 },
  { id: 'dS', name: 'Soil', x: 0.2, y: 0.28 },
];

/** remote-sensing#2~min-distance: a pixel's distance to each class mean; the nearest wins. */
function minDistanceDemo(id: string, title: string, use: string, red: number, nir: number) {
  const distanceRule = (k: (typeof CLASS_MEANS)[number]) => {
    const expr = `√(({R} − ${k.x})² + ({N} − ${k.y})²)`;
    return rule(
      `${k.id} = distance to ${k.name.toLowerCase()}`,
      `{${k.id}} = ${expr}`,
      [k.id, 'R', 'N'],
      (v) => v[k.id]! ** 2 - ((v.R! - k.x) ** 2 + (v.N! - k.y) ** 2),
      {
        [k.id]: [
          (v) => Math.hypot(v.R! - k.x, v.N! - k.y),
          expr,
          `Pythagoras in feature space, from the pixel to the ${k.name.toLowerCase()} mean (${k.x}, ${k.y}).`,
        ],
      },
    );
  };
  const ex: Values = { R: red, N: nir };
  for (const k of CLASS_MEANS) ex[k.id] = Math.hypot(red - k.x, nir - k.y);
  return page({
    id,
    title,
    use,
    assumptions: [
      'Class means (red, near infrared): water (0.05, 0.03), vegetation (0.06, 0.45), soil (0.20, 0.28).',
      'Distance is straight-line (Euclidean) in the plane of the two bands.',
      'The pixel goes to the class whose mean is nearest.',
    ],
    variables: [
      num('R', 'ρ_red', 'Pixel’s red reflectance', undefined, 0, 1, { step: 0.001 }),
      num('N', 'ρ_NIR', 'Pixel’s near-infrared reflectance', undefined, 0, 1, { step: 0.001 }),
      ...CLASS_MEANS.map((k) =>
        num(k.id, `d_${k.name[0]!}`, `Distance to ${k.name.toLowerCase()}`, undefined, 0, 2, {
          derived: true,
        }),
      ),
    ],
    rules: CLASS_MEANS.map(distanceRule),
    example: ex,
    startWith: ['R', 'N'],
    representation: {
      kind: 'scatter',
      x: { label: 'Red reflectance', min: 0, max: 0.5, step: 0.1 },
      y: { label: 'Near-infrared reflectance', min: 0, max: 0.5, step: 0.1 },
      classes: CLASS_MEANS.map((k) => ({ name: k.name, x: k.x, y: k.y })),
      pixel: { x: 'R', y: 'N' },
      distances: CLASS_MEANS.map((k) => k.id),
    },
  });
}

const minDistance = minDistanceDemo(
  'g.he-scatter-classes',
  'Minimum-distance classification',
  'Use this for “A pixel has red 0.10 and NIR 0.40. Which class mean is nearest?”',
  0.1,
  0.4,
);

const minDistanceClose = minDistanceDemo(
  'g.he-scatter-classes-close',
  'Minimum distance: a pixel between two classes',
  'Use this for “A pixel reads red 0.20, NIR 0.10. Is it water or soil by minimum distance?”',
  0.2,
  0.1,
);

// ── HC98: the chain rule as a tree (calc-3#1~chain) ──

/** calc-3#1~chain: dz/dt = Σ ∂z/∂xᵢ × dxᵢ/dt over the middle variables. */
function chainDemo(
  id: string,
  title: string,
  use: string,
  middle: string[],
  partials: number[],
  rates: number[],
) {
  const pIds = middle.map((m) => `f${m}`);
  const rIds = middle.map((m) => `${m}p`);
  const terms = middle.map((_, i) => `{${pIds[i]}} × {${rIds[i]}}`).join(' + ');
  const sum = (v: Values, skip = -1) =>
    middle.reduce((s, _, i) => (i === skip ? s : s + v[pIds[i]!]! * v[rIds[i]!]!), 0);
  const others = (i: number) =>
    middle
      .map((_, j) => j)
      .filter((j) => j !== i)
      .map((j) => ` − {${pIds[j]}} × {${rIds[j]}}`)
      .join('');
  const ex: Values = { dz: 0 };
  middle.forEach((_, i) => {
    ex[pIds[i]!] = partials[i]!;
    ex[rIds[i]!] = rates[i]!;
  });
  ex.dz = sum(ex);
  const rel = rule(
    'dz/dt = Σ ∂z/∂x · dx/dt',
    `{dz} = ${terms}`,
    ['dz', ...pIds, ...rIds],
    (v) => v.dz! - sum(v),
    {
      dz: [(v) => sum(v), terms, 'Multiply along each path from z down to t, then add the paths.'],
      ...Object.fromEntries(
        middle.map((m, i) => [
          rIds[i]!,
          [
            (v: Values) => div(v.dz! - sum(v, i), v[pIds[i]!]!),
            `({dz}${others(i)}) ÷ {${pIds[i]}}`,
            `Take the other paths from dz/dt, then divide by ∂z/∂${m}.`,
          ],
        ]),
      ),
    },
  );
  return page({
    id,
    title,
    use,
    assumptions: [
      `z depends on ${middle.join(middle.length === 2 ? ' and ' : ', ')}, and each of them on t.`,
      'Along each path, multiply the rates: how fast z changes with the middle variable times how fast it changes with t.',
      'Each path is one way t moves z, so dz/dt adds the paths.',
    ],
    variables: [
      ...middle.flatMap((m, i) => [
        num(pIds[i]!, `∂z/∂${m}`, `Partial of z with respect to ${m}`, undefined, -1e6, 1e6, {
          step: 0.01,
        }),
        num(rIds[i]!, `d${m}/dt`, `Rate of ${m} with respect to t`, undefined, -1e6, 1e6, {
          step: 0.01,
        }),
      ]),
      num('dz', 'dz/dt', 'Rate of z with respect to t', undefined, -1e12, 1e12, { derived: true }),
    ],
    rules: [rel],
    example: ex,
    startWith: [...pIds, ...rIds],
    representation: {
      kind: 'treeDiagram',
      chain: { middle, partials: pIds, rates: rIds, total: 'dz' },
    },
  });
}

const chainTwo = chainDemo(
  'g.he-tree-diagram-chain',
  'The chain rule as a tree',
  'Use this for “At a point, ∂z/∂x = 4 and ∂z/∂y = 9, while dx/dt = 2 and dy/dt = −1. Find dz/dt.”',
  ['x', 'y'],
  [4, 9],
  [2, -1],
);

const chainThree = chainDemo(
  'g.he-tree-diagram-chain-three',
  'The chain rule with three middle variables',
  'Use this for “z = f(x, y, w) with ∂z/∂x = 2, ∂z/∂y = −3, ∂z/∂w = 1.5 and dx/dt = 4, dy/dt = 1, dw/dt = −2. Find dz/dt.”',
  ['x', 'y', 'w'],
  [2, -3, 1.5],
  [4, 1, -2],
);

export const HE4A_GALLERY_MODULES: ModuleDef[] = [
  inverse3,
  inverse4,
  tally3,
  tally4,
  routhMain,
  routhLimit,
  routhCount,
  routhQuartic,
  eigenMain,
  eigenShear,
  areaDemo,
  eigenComplex,
  leastSquares4,
  leastSquares8,
  minDistance,
  minDistanceClose,
  chainTwo,
  chainThree,
];

export const HE4A_GALLERY_LAYOUTS: LayoutDef[] = [];
