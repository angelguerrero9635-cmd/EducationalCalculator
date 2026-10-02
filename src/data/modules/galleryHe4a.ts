/**
 * College gallery demos, round 4, group A (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC94: `matrixGrid` `rowReduce` with `inverse` ([A | I]) and `tally` (det by row reduction).
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

export const HE4A_GALLERY_MODULES: ModuleDef[] = [inverse3, inverse4, tally3, tally4];

export const HE4A_GALLERY_LAYOUTS: LayoutDef[] = [];
