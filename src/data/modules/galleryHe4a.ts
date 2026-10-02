/**
 * College gallery demos, round 4, group A (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC94: `matrixGrid` `rowReduce` with `inverse` ([A | I]) and `tally` (det by row reduction).
 * HC190: `matrixGrid` `mode: 'routh'`.
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

export const HE4A_GALLERY_MODULES: ModuleDef[] = [
  inverse3,
  inverse4,
  tally3,
  tally4,
  routhMain,
  routhLimit,
  routhCount,
  routhQuartic,
];

export const HE4A_GALLERY_LAYOUTS: LayoutDef[] = [];
