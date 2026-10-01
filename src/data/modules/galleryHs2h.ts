/**
 * Grades 9–12 round 2 gallery demos (group H2H: the builders' options (H105); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in. Spread into
 * gallery.ts.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import { MATH_10_MODULES } from './math/10';
import { MATH_11_MODULES } from './math/11';
import { MATH_12_MODULES } from './math/12';
import { MATH_9_MODULES } from './math/9';
import { SCIENCE_10_MODULES } from './science/10';
import { SCIENCE_11_MODULES } from './science/11';
import { SCIENCE_12_MODULES } from './science/12';
import type { ModuleDef, Representation, StepText } from './types';

type Solver = (v: Values) => number | number[] | undefined;
type Rule = { relation: Relation; steps: Record<string, StepText> };

/** Rounded to 12 significant figures, so 0.1 + 0.2 is 0.3 when a value is worked out. */
const exact = (x: number) => Number(x.toPrecision(12));

/** A relation with its steps, each variable's solver, expression and explanation. */
function rule(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  parts: Record<string, [Solver, StepText['expr'], StepText['how'], Partial<StepText>?]>,
  more: Partial<Relation> = {},
): Rule {
  const solve: Record<string, Solver> = {};
  const steps: Record<string, StepText> = {};
  for (const [v, [fn, expr, how, extra]] of Object.entries(parts)) {
    solve[v] = fn;
    if (fn.length > 0) steps[v] = { expr, how, ...extra };
  }
  for (const v of vars) if (!(v in solve)) solve[v] = () => undefined;
  return { relation: { id, display, vars, residual, solve, ...more }, steps };
}

/** A value worked out from others, never solved backwards. */
function derive(
  id: string,
  x: string,
  inputs: string[],
  display: string,
  f: (v: Values) => number | undefined,
  expr: StepText['expr'],
  how: StepText['how'],
  more: Partial<StepText> = {},
  rel: Partial<Relation> = {},
): Rule {
  return rule(
    id,
    display,
    [x, ...inputs],
    (v) => v[x]! - (f(v) ?? NaN),
    { [x]: [(v: Values) => f(v), expr, how, more] },
    rel,
  );
}

/** A rule the values must keep (b ≠ 0), with the message when they don't. */
const limit = (id: string, display: string, ok: (v: Values) => boolean, message: string): Rule => ({
  relation: {
    id,
    display,
    constraint: true,
    vars: [...new Set([...display.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!))],
    residual: (v: Values) => (ok(v) ? 0 : 1),
    solve: {},
    message: (v: Values) => (ok(v) ? undefined : message),
  },
  steps: {},
});

/** A demo from its rules. */
function page(d: Omit<ModuleDef, 'relations' | 'steps'> & { rules: Rule[] }): ModuleDef {
  const { rules, ...rest } = d;
  return {
    ...rest,
    relations: rules.map((r) => r.relation),
    steps: Object.fromEntries(rules.map((r) => [r.relation.id, r.steps])),
  };
}

const PAGES = [
  ...MATH_9_MODULES,
  ...MATH_10_MODULES,
  ...MATH_11_MODULES,
  ...MATH_12_MODULES,
  ...SCIENCE_10_MODULES,
  ...SCIENCE_11_MODULES,
  ...SCIENCE_12_MODULES,
];

const pageOf = (id: string) => {
  const found = PAGES.find((m) => m.id === id);
  if (!found) throw new Error(`galleryHs2h: no page ${id}`);
  return found;
};

/**
 * A demo from the page that waits: its variables, rules, steps and example, with the picture
 * the page will pass. `vars` changes variables; `add` appends new ones; `drop` removes
 * relations (by id) that `rules` replace.
 */
function fromPage(
  pageId: string,
  id: string,
  title: string,
  representation: Representation,
  more: Partial<ModuleDef> & {
    vars?: Record<string, Partial<VariableDef>>;
    add?: VariableDef[];
    drop?: string[];
    rules?: Rule[];
    omit?: string[];
  } = {},
): ModuleDef {
  const found = pageOf(pageId);
  const { vars, add, drop, rules, omit, ...rest } = more;
  const kept = found.relations.filter((r) => !(drop ?? []).includes(r.id));
  const steps = Object.fromEntries(
    Object.entries(found.steps).filter(([k]) => !(drop ?? []).includes(k)),
  );
  return {
    ...found,
    id,
    title,
    representation,
    variables: [
      ...found.variables
        .filter((v) => !(omit ?? []).includes(v.id))
        .map((v) => (vars?.[v.id] ? { ...v, ...vars[v.id] } : v)),
      ...(add ?? []),
    ],
    relations: [...kept, ...(rules ?? []).map((r) => r.relation)],
    steps: { ...steps, ...Object.fromEntries((rules ?? []).map((r) => [r.relation.id, r.steps])) },
    ...rest,
  };
}

// ── H105 (1): scatter, the residual of point k ──

const regression = pageOf('m.9.regression');
const PRACTICE = (regression.representation as Extract<Representation, { kind: 'scatter' }>).points;
/** Point k's coordinates (k counted from 1). */
const pointK = (v: Values) => PRACTICE[Math.round(v.k!) - 1];

const residualK = fromPage(
  'm.9.regression',
  'g.m9-regression-point-k',
  'Residual of the point you pick',
  {
    ...(regression.representation as Extract<Representation, { kind: 'scatter' }>),
    residualOf: { point: 'k', residual: 'e' },
  },
  {
    vars: { e: { name: 'Residual of point k' } },
    add: [
      {
        id: 'k',
        symbol: 'k',
        name: 'Point number',
        min: 1,
        max: PRACTICE.length,
        integer: true,
        allowed: PRACTICE.map((_, i) => i + 1),
      },
    ],
    drop: ['e = 61 − (3m + b)'],
    rules: [
      derive(
        'e = y_k − (m x_k + b)',
        'e',
        ['k', 'm', 'b'],
        '{e} = y_k − ({m} × x_k + {b}) for point {k}',
        (v) => {
          const p = pointK(v);
          return p ? exact(p[1] - (v.m! * p[0] + v.b!)) : undefined;
        },
        (v) => {
          const p = pointK(v);
          return p ? `${p[1]} − ({m} × ${p[0]} + {b})` : '?';
        },
        (v) => {
          const p = pointK(v);
          return p
            ? `Point ${v.k} is (${p[0]}, ${p[1]}): its actual points minus the line’s prediction at x = ${p[0]}.`
            : 'Pick a point from 1 to 8.';
        },
        {},
        {
          check: (v) => {
            const p = pointK(v)!;
            return `${v.e} = ${p[1]} − (${v.m} × ${p[0]} + ${v.b})`;
          },
        },
      ),
    ],
    example: { m: 5, b: 47, x: 4.5, y: 69.5, k: 3, e: -1 },
    startWith: ['x', 'm', 'b', 'k'],
    use: 'Use this for “Find the residual of point 5 for the line ŷ = 5x + 47.”',
  },
);

// ── H105 (3): complexPlane, the operation from a sign box ──

const complexSign = fromPage(
  'm.11.complex-numbers~add-subtract',
  'g.m11-complex-numbers-sign-box',
  'Add or subtract: the sign box picks',
  {
    kind: 'complexPlane',
    z: { re: 'a', im: 'b' },
    w: { re: 'c', im: 'd' },
    opFrom: 'sg',
    result: { re: 'p', im: 'q' },
  },
);

// ── H105 (4): transformation, the mirror y = x or y = −x from a value ──

/** x′ = s × (the other coordinate): s = 1 swaps them, s = −1 swaps them and changes both signs. */
const swapBy = (to: string, from: string, name: string) =>
  rule(
    `${to} = s × ${from}`,
    `{${to}} = {s} × {${from}}`,
    [to, 's', from],
    (v) => v[to]! - v.s! * v[from]!,
    {
      [to]: [
        (v) => v.s! * v[from]!,
        `{s} × {${from}}`,
        (v) =>
          v.s === 1
            ? `Across y = x, the new ${name} is the old ${name === 'x' ? 'y' : 'x'}.`
            : `Across y = −x, the new ${name} is the old ${name === 'x' ? 'y' : 'x'} with its sign changed.`,
      ],
      [from]: [
        (v) => v.s! * v[to]!,
        `{s} × {${to}}`,
        'Undo the swap: s × s = 1, so multiply the image’s coordinate by s.',
      ],
    },
  );

const mirrorSign = fromPage(
  'm.10.rigid-motions~reflect-line',
  'g.m10-rigid-motions-mirror-sign',
  'Reflecting across y = x or y = −x',
  {
    kind: 'transformation',
    figure: [
      ['ax', 'ay'],
      [4, 4],
      [2, 4],
    ],
    move: 'reflect',
    mirror: 'y = −x',
    slope: 's',
    image: { x: 'px', y: 'py' },
    extent: 6,
  },
  {
    add: [
      {
        id: 's',
        symbol: 's',
        name: 'Mirror y = sx: 1 for y = x, −1 for y = −x',
        min: -1,
        max: 1,
        integer: true,
        allowed: [-1, 1],
      },
    ],
    drop: ['px = −ay', 'py = −ax'],
    rules: [swapBy('px', 'ay', 'x'), swapBy('py', 'ax', 'y')],
    standalone: undefined,
    example: { ax: 4, ay: 1, s: -1, px: -1, py: -4 },
    startWith: ['ax', 'ay', 's'],
    use: 'Use this for “Reflect A(4, 1) across the line y = x.”',
  },
);

// ── H105 (5): motionGraph and projectile with a number (free fall, a level launch) ──

const G = 9.8;

const freeFall = fromPage(
  's.11.kinematics-1d~free-fall',
  'g.s11-kinematics-1d-free-fall-number',
  'Free fall: gravity as a number',
  {
    kind: 'motionGraph',
    graph: 'speed',
    time: 't',
    acceleration: -G,
    speed: 'v',
    start: 0,
    kinematics: { view: 'velocity' },
  },
  {
    // The page keeps g in its steps and hides a; the picture takes −9.8 as a number instead.
    omit: ['a'],
    drop: ['a = v/t'],
    example: { t: 3, v: -G * 3, d: 0.5 * G * 9 },
  },
);

const ledge = fromPage(
  's.11.kinematics-2d~cliff',
  'g.s11-kinematics-2d-cliff-level',
  'Launched level off a ledge: θ = 0° as a number',
  {
    kind: 'projectile',
    speed: 'v',
    angle: 0,
    height: 'h',
    time: 'T',
    range: 'R',
  },
  {
    omit: ['q'],
    drop: ['θ = 0'],
    standalone: undefined,
    example: { v: 8, h: 45, T: Math.sqrt(90 / G), R: 8 * Math.sqrt(90 / G) },
  },
);

// ── H105 (6): linearFunction, a test point ──

const halfPlaneTest = fromPage(
  'm.9.linear-inequalities~two-variables',
  'g.m9-linear-inequalities-test-point',
  'Graph an inequality and test a point',
  {
    kind: 'linearFunction',
    slope: 'm',
    intercept: 'b',
    shade: '≥',
    test: { x: 'tx', y: 'ty' },
    keep: ['tx', 'ty'],
    extent: 10,
  },
  { pictureLabels: ['yl', 'h'] },
);

// ── H105 (8): functionGraph, inverse trig in degrees ──

const arcsinDegrees = fromPage(
  'm.12.inverse-trig',
  'g.m12-inverse-trig-degrees',
  'Inverse sine read in degrees',
  {
    kind: 'functionGraph',
    family: 'arcsin',
    degrees: true,
    at: { x: 'x', y: 'A' },
    marks: ['domain', 'range'],
    axes: { x: 'x', y: 'A (°)' },
  },
);

const arctanDegrees = fromPage(
  'm.12.inverse-trig~arctan',
  'g.m12-inverse-trig-arctan-degrees',
  'Inverse tangent read in degrees',
  {
    kind: 'functionGraph',
    family: 'arctan',
    degrees: true,
    at: { x: 'x', y: 'A' },
    marks: ['asymptotes', 'range'],
    axes: { x: 'Rise over run x', y: 'A (°)' },
  },
);

// ── H105 (9): matrixGrid, row operations worked out from typed coefficients ──

const coefficient = (id: string, symbol: string, name: string): VariableDef => ({
  id,
  symbol,
  name,
  min: -9,
  max: 9,
  integer: true,
});
const answer = (id: string, name: string): VariableDef => ({
  id,
  symbol: id,
  name,
  min: -1000,
  max: 1000,
  derived: true,
});
/** D = ad − bc. */
const det = (v: Values) => v.a! * v.d! - v.b! * v.c!;

const rowReduceTyped = page({
  id: 'g.m12-matrices-row-reduce-typed',
  title: 'Row reduction of a system you type',
  use: 'Use this for “Solve 2x + y = 5 and x − 3y = −1 by row reducing its augmented matrix.”',
  assumptions: [
    'The system ax + by = p, cx + dy = q as an augmented matrix [a b | p; c d | q].',
    'Each row operation keeps the same solutions; the goal is the identity on the left.',
    'When ad − bc = 0 the rows are parallel: a row of zeros shows no solution or infinitely many.',
  ],
  variables: [
    coefficient('a', 'a', 'Row 1: x coefficient'),
    coefficient('b', 'b', 'Row 1: y coefficient'),
    coefficient('p', 'p', 'Row 1: right side'),
    coefficient('c', 'c', 'Row 2: x coefficient'),
    coefficient('d', 'd', 'Row 2: y coefficient'),
    coefficient('q', 'q', 'Row 2: right side'),
    answer('x', 'x'),
    answer('y', 'y'),
  ],
  rules: [
    limit(
      'ad − bc ≠ 0',
      '{a} × {d} − {b} × {c} is not 0',
      (v) => det(v) !== 0,
      'ad − bc = 0: the rows are parallel, so there is no single solution.',
    ),
    derive(
      'x = (pd − bq) ÷ (ad − bc)',
      'x',
      ['a', 'b', 'c', 'd', 'p', 'q'],
      '{x} = ({p} × {d} − {b} × {q}) ÷ ({a} × {d} − {b} × {c})',
      (v) => (det(v) ? exact((v.p! * v.d! - v.b! * v.q!) / det(v)) : undefined),
      '({p} × {d} − {b} × {q}) ÷ ({a} × {d} − {b} × {c})',
      'Clearing y from row 1 leaves x alone: its right side over ad − bc.',
    ),
    derive(
      'y = (aq − pc) ÷ (ad − bc)',
      'y',
      ['a', 'b', 'c', 'd', 'p', 'q'],
      '{y} = ({a} × {q} − {p} × {c}) ÷ ({a} × {d} − {b} × {c})',
      (v) => (det(v) ? exact((v.a! * v.q! - v.p! * v.c!) / det(v)) : undefined),
      '({a} × {q} − {p} × {c}) ÷ ({a} × {d} − {b} × {c})',
      'Clearing x from row 2 leaves y alone: its right side over ad − bc.',
    ),
  ],
  example: { a: 2, b: 1, p: 5, c: 1, d: -3, q: -1, x: 2, y: 1 },
  startWith: ['a', 'b', 'p', 'c', 'd', 'q'],
  representation: {
    kind: 'matrixGrid',
    mode: 'rowReduce',
    system: [
      ['a', 'b', 'p'],
      ['c', 'd', 'q'],
    ],
    steps: 'reduced',
    solution: ['x', 'y'],
  },
});

const echelonTyped = fromPage(
  'm.12.matrices',
  'g.m12-matrices-echelon-auto',
  'Row reduction, the operations worked out',
  {
    kind: 'matrixGrid',
    mode: 'rowReduce',
    system: [
      [1, 1, 1, 'd1'],
      [2, -1, 1, 'd2'],
      [1, 2, -1, 'd3'],
    ],
    steps: 'echelon',
    solution: ['x', 'y', 'z'],
  },
);

// ── H105 (10): treeDiagram, outcome names by a stage's size ──

const coinsTree = fromPage(
  'm.10.probability-rules~sample-space',
  'g.m10-probability-rules-names-by-size',
  'Listing outcomes: a coin, a spinner or a four-sided die',
  {
    kind: 'treeDiagram',
    first: 'a',
    second: 'b',
    third: 'c',
    total: 'n',
    namesBySize: { 2: ['H', 'T'], 3: ['R', 'G', 'B'], 4: ['1', '2', '3', '4'] },
    stages: ['First', 'Second', 'Third'],
    path: [0, 0, 1],
  },
  {
    assumptions: [
      'A tree lists every outcome: each branch splits into every outcome of the next stage.',
      'When every path is equally likely, P(event) = favorable outcomes ÷ all outcomes.',
      'A stage of 2 is a coin (H, T), of 3 a spinner (R, G, B), of 4 a four-sided die (1 to 4).',
    ],
  },
);

// ── H105 (11): markedFigure, rays at a degree value ──

const angleAddition = fromPage(
  'm.10.constructions~angle-addition',
  'g.m10-constructions-angle-addition-rays',
  'Angle addition with rays drawn at the angles',
  {
    kind: 'markedFigure',
    points: {
      O: [0, 0],
      A: { from: 'O', angle: 0 },
      B: { from: 'O', angle: 'a' },
      C: { from: 'O', angle: 'c' },
    },
    parts: [
      { ray: 'OA' },
      { ray: 'OB' },
      { ray: 'OC' },
      { label: 'AOB', value: 'a' },
      { label: 'BOC', value: 'b' },
      { label: 'AOC', value: 'c', inCaption: true },
    ],
  },
  { vars: { a: { max: 179 }, b: { max: 179 }, c: { max: 180 } } },
);

const exteriorAngle = fromPage(
  'm.10.proofs~exterior-angle',
  'g.m10-proofs-exterior-angle-rays',
  'Exterior angle: the triangle from its angles',
  {
    kind: 'markedFigure',
    points: {
      B: [0, 0],
      C: [9, 0],
      D: [12, 0],
      A: { from: 'B', angle: 'b', meets: { from: 'C', angle: 'd' } },
    },
    parts: [
      { segment: 'AB' },
      { segment: 'BC' },
      { segment: 'CA' },
      { segment: 'CD', dashed: true },
      { label: 'BAC', value: 'a' },
      { label: 'ABC', value: 'b' },
      { label: 'ACB', value: 'c' },
      { label: 'ACD', value: 'd' },
    ],
  },
);

// ── H105 (12): markedFigure, a rhombus from its diagonals ──

const rhombusAcross = fromPage(
  'm.10.quadrilaterals~rhombus',
  'g.m10-quadrilaterals-rhombus-across',
  'Rhombus from its diagonals, drawn from them',
  {
    kind: 'markedFigure',
    quadrilateral: {
      family: 'rhombus',
      across: ['p', 'q'],
      diagonals: true,
      labels: { AB: 's', AO: 'hp', BO: 'hq' },
    },
  },
  { pictureLabels: ['p', 'q', 'K'] },
);

// ── H105 (13): collision, the spring's energy in an explosion ──

const explodeSpring = fromPage(
  's.11.momentum~explode',
  'g.s11-momentum-explode-spring',
  'Pushed apart from rest: the spring’s energy',
  {
    kind: 'collision',
    type: 'explode',
    masses: ['m', 'n'],
    before: [0],
    after: ['a', 'b'],
    spring: 'E',
  },
  { pictureLabels: undefined },
);

// ── H105 (17): no picture, for an equation-only page ──

const noPicture = fromPage(
  'm.12.matrices~determinant',
  'g.m12-matrices-determinant-none',
  'Determinant: the equation alone',
  { kind: 'none' },
  { pictureLabels: undefined },
);

export const HS2H_GALLERY_MODULES: ModuleDef[] = [
  noPicture,
  explodeSpring,
  angleAddition,
  exteriorAngle,
  rhombusAcross,
  coinsTree,
  rowReduceTyped,
  echelonTyped,
  arcsinDegrees,
  arctanDegrees,
  halfPlaneTest,
  residualK,
  complexSign,
  mirrorSign,
  freeFall,
  ledge,
];

export const HS2H_GALLERY_LAYOUTS: LayoutDef[] = [];
