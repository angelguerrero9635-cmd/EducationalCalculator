/**
 * Grades 9–12 gallery demos (group HD; see pictureRequestsHs.ts and docs/RENDERINGS_HS.md).
 * Each demo stands in for a planned page: real variables, relations, steps and a use line, so
 * `scripts/promote-demo.mjs` can copy it into a grade file. Spread into gallery.ts.
 */
import type { Relation, VariableDef, Values } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

const RAD = Math.PI / 180;
const div = (a: number, b: number) => (b === 0 ? undefined : a / b);

/** A relation and its step text, built together so a demo lists both from one place. */
interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

/** Gathers rules into a module's `relations` and `steps`. */
const rules = (...rs: Rule[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

// ─── H06 unitCircle ──────────────────────────────────────────────────────────

/** An angle θ in degrees. */
const angle = (id = 't', name = 'Angle', min = -720, max = 720): VariableDef => ({
  id,
  symbol: 'θ',
  name,
  unit: '°',
  min,
  max,
  step: 1,
});

/** A coordinate or trig value from −1 to 1. */
const unitValue = (id: string, symbol: string, name: string): VariableDef => ({
  id,
  symbol,
  name,
  min: -1,
  max: 1,
  step: 0.0001,
});

/**
 * x = cos θ or y = sin θ (θ in degrees). Worked forward only: one value of cos θ belongs to two
 * angles on a turn, so the angle is typed or dragged, never worked back.
 */
const onCircle = (out: string, fn: 'cos' | 'sin', t = 't'): Rule => {
  const f = fn === 'cos' ? Math.cos : Math.sin;
  const id = `${out} = ${fn} θ`;
  return {
    relation: {
      id,
      display: `{${out}} = ${fn}({${t}})`,
      vars: [out, t],
      residual: (v) => v[out]! - f(v[t]! * RAD),
      solve: { [out]: (v) => f(v[t]! * RAD), [t]: () => undefined },
    },
    steps: {
      [out]: {
        expr: `${fn}({${t}})`,
        how:
          fn === 'cos'
            ? 'The point where the angle’s side meets the unit circle has x-coordinate cos θ.'
            : 'The point where the angle’s side meets the unit circle has y-coordinate sin θ.',
      },
    },
  };
};

/** tan θ = sin θ ÷ cos θ. */
const tangent: Rule = {
  relation: {
    id: 'tan θ = sin θ ÷ cos θ',
    display: '{m} = {y}/{x}',
    vars: ['m', 'y', 'x'],
    residual: (v) => v.m! * v.x! - v.y!,
    solve: {
      m: (v) => div(v.y!, v.x!),
      y: (v) => v.m! * v.x!,
      x: (v) => div(v.y!, v.m!),
    },
  },
  steps: {
    m: { expr: '{y}/{x}', how: 'The tangent is the sine divided by the cosine: rise over run.' },
    y: { expr: '{m} × {x}', how: 'Multiply both sides by cos θ.' },
    x: { expr: '{y}/{m}', how: 'Divide sin θ by tan θ.' },
  },
};

/** θ in degrees from k, the angle in radians as a multiple of π (θ = kπ). */
const fromPi: Rule = {
  relation: {
    id: 'θ = 180k',
    display: '{t} = 180 × {k}',
    vars: ['t', 'k'],
    residual: (v) => v.t! - 180 * v.k!,
    solve: { t: (v) => 180 * v.k!, k: (v) => v.t! / 180 },
  },
  steps: {
    t: { expr: '180 × {k}', how: 'π radians is 180°, so kπ radians is 180k degrees.' },
    k: { expr: '{t}/180', how: 'Divide the degrees by 180 to get the multiple of π.' },
  },
};

/** k: the angle in radians as a multiple of π, shown as a fraction (5/6 for 5π/6). */
const piMultiple: VariableDef = {
  id: 'k',
  symbol: 'k',
  name: 'Angle in radians ÷ π',
  min: -4,
  max: 4,
  step: 1 / 12,
  fraction: 12,
};

/** The angles with sin θ = c (or tan θ = c) on one turn, from the inverse function. */
const firstSolution = (fn: 'sin' | 'cos' | 'tan', a = 'a'): Rule => {
  const inv = fn === 'sin' ? Math.asin : fn === 'cos' ? Math.acos : Math.atan;
  const f = fn === 'sin' ? Math.sin : fn === 'cos' ? Math.cos : Math.tan;
  const id = `θ₁ = arc${fn} c`;
  return {
    relation: {
      id,
      display: `{${a}} = arc${fn}({c})`,
      vars: [a, 'c'],
      residual: (v) => f(v[a]! * RAD) - v.c!,
      solve: { [a]: (v) => inv(v.c!) / RAD, c: (v) => f(v[a]! * RAD) },
    },
    steps: {
      [a]: {
        expr: `arc${fn}({c})`,
        how:
          fn === 'cos'
            ? 'The inverse cosine gives the one angle from 0° to 180° with this cosine.'
            : `The inverse ${fn === 'sin' ? 'sine' : 'tangent'} gives the one angle from −90° to 90° with this ${fn === 'sin' ? 'sine' : 'tangent'}.`,
      },
      c: {
        expr: `${fn}({${a}})`,
        how: `Take the ${fn === 'sin' ? 'sine' : fn === 'cos' ? 'cosine' : 'tangent'} of the angle.`,
      },
    },
  };
};

/** The second solution on one turn: 180° − θ₁ (sine) or θ₁ + 180° (tangent). */
const secondSolution = (fn: 'sin' | 'tan'): Rule => {
  const id = fn === 'sin' ? 'θ₂ = 180° − θ₁' : 'θ₂ = θ₁ + 180°';
  return {
    relation: {
      id,
      display: fn === 'sin' ? '{b} = 180 − {a}' : '{b} = {a} + 180',
      vars: ['b', 'a'],
      residual: (v) => v.b! - (fn === 'sin' ? 180 - v.a! : v.a! + 180),
      solve:
        fn === 'sin'
          ? { b: (v) => 180 - v.a!, a: (v) => 180 - v.b! }
          : { b: (v) => v.a! + 180, a: (v) => v.b! - 180 },
    },
    steps:
      fn === 'sin'
        ? {
            b: { expr: '180 − {a}', how: 'The mirror image across the y-axis has the same sine.' },
            a: { expr: '180 − {b}', how: 'Mirror the second angle back across the y-axis.' },
          }
        : {
            b: {
              expr: '{a} + 180',
              how: 'Half a turn on, the opposite point has the same tangent.',
            },
            a: { expr: '{b} − 180', how: 'Half a turn back gives the first angle.' },
          },
  };
};

/** A unit circle page: θ, the point (x, y) and the options the case adds. */
const circleDemo = (
  id: string,
  title: string,
  use: string,
  assumptions: string[],
  example: Values,
  representation: ModuleDef['representation'],
  extra: { variables?: VariableDef[]; rules?: Rule[]; pi?: boolean; startWith?: string[] } = {},
): ModuleDef => {
  const rs = rules(
    ...(extra.pi ? [fromPi] : []),
    onCircle('x', 'cos'),
    onCircle('y', 'sin'),
    ...(extra.rules ?? []),
  );
  return {
    id,
    title,
    use,
    assumptions,
    variables: [
      ...(extra.pi ? [piMultiple] : []),
      angle(),
      unitValue('x', 'x', 'cos θ, the x-coordinate'),
      unitValue('y', 'y', 'sin θ, the y-coordinate'),
      ...(extra.variables ?? []),
    ],
    ...rs,
    example,
    startWith: extra.startWith ?? [extra.pi ? 'k' : 't'],
    ...(extra.pi ? { pictureLabels: ['t'] } : {}),
    representation,
  };
};

const cs = (d: number) => [Math.cos(d * RAD), Math.sin(d * RAD)] as const;
const xy = (d: number) => ({ t: d, x: cs(d)[0], y: cs(d)[1] });

const UNIT_CIRCLE: ModuleDef[] = [
  circleDemo(
    'g.m11-unit-circle-degrees',
    'The point at an angle',
    'Use this for the coordinates of the point at an angle on the unit circle.',
    [
      'The circle has radius 1 and its center at the origin.',
      'θ is measured from the positive x-axis, counterclockwise for a positive angle.',
    ],
    xy(150),
    { kind: 'unitCircle', angle: 't', cos: 'x', sin: 'y' },
  ),
  circleDemo(
    'g.m11-unit-circle-radians',
    'The point at an angle in radians',
    'Use this for an angle in radians, such as 7π/6, and its point on the unit circle.',
    [
      'The circle has radius 1 and its center at the origin.',
      'Type the angle as a multiple of π: 7/6 for 7π/6.',
    ],
    { k: 7 / 6, ...xy(210) },
    { kind: 'unitCircle', angle: 'k', measure: 'pi', cos: 'x', sin: 'y' },
    { pi: true },
  ),
  circleDemo(
    'g.m11-unit-circle-negative',
    'A negative angle',
    'Use this for a negative angle, measured clockwise from the positive x-axis.',
    ['The circle has radius 1.', 'A negative angle turns clockwise.'],
    xy(-135),
    { kind: 'unitCircle', angle: 't', cos: 'x', sin: 'y' },
  ),
  circleDemo(
    'g.m11-unit-circle-past-a-turn',
    'More than one turn',
    'Use this for an angle of more than 360°, which ends where a smaller angle does.',
    ['The circle has radius 1.', 'Every full turn of 360° comes back to the same point.'],
    xy(480),
    { kind: 'unitCircle', angle: 't', cos: 'x', sin: 'y' },
  ),
  circleDemo(
    'g.m11-trig-graphs-sine',
    'The sine graph from the circle',
    'Use this to see the graph of y = sin θ unrolled from the unit circle.',
    ['The circle has radius 1.', 'The graph’s height at θ is the point’s y-coordinate.'],
    xy(120),
    { kind: 'unitCircle', angle: 't', cos: 'x', sin: 'y', graph: 'sin' },
  ),
  circleDemo(
    'g.m11-trig-graphs-cosine',
    'The cosine graph from the circle',
    'Use this to see the graph of y = cos θ, in radians, from the unit circle.',
    ['The circle has radius 1.', 'The graph’s height at θ is the point’s x-coordinate.'],
    { k: 5 / 3, ...xy(300) },
    { kind: 'unitCircle', angle: 'k', measure: 'pi', cos: 'x', sin: 'y', graph: 'cos' },
    { pi: true },
  ),
  circleDemo(
    'g.m11-pythagorean-identities',
    'Sine, cosine and tangent at one angle',
    'Use this for tan θ and sin²θ + cos²θ = 1 at any angle.',
    [
      'The point (cos θ, sin θ) is on the circle x² + y² = 1.',
      'tan θ has no value where cos θ = 0.',
    ],
    { ...xy(40), m: Math.tan(40 * RAD) },
    { kind: 'unitCircle', angle: 't', cos: 'x', sin: 'y', tan: 'm' },
    {
      variables: [
        { id: 'm', symbol: 'tan θ', name: 'Tangent', min: -1000, max: 1000, step: 0.0001 },
      ],
      rules: [tangent],
    },
  ),
  {
    id: 'g.m10-arc-sector-radians',
    title: 'Radians as arc length',
    use: 'Use this for the arc length an angle cuts from the unit circle: θ in radians.',
    assumptions: [
      'The circle has radius 1.',
      'An arc of length 1 on it makes an angle of 1 radian.',
    ],
    variables: [
      angle('t', 'Angle', 0, 720),
      { id: 's', symbol: 's', name: 'Arc length (radians)', min: 0, max: 13, step: 0.0001 },
    ],
    ...rules({
      relation: {
        id: 's = θπ/180',
        display: '{s} = {t} × π/180',
        vars: ['s', 't'],
        residual: (v) => v.s! - v.t! * RAD,
        solve: { s: (v) => v.t! * RAD, t: (v) => v.s! / RAD },
      },
      steps: {
        s: { expr: '{t} × π/180', how: 'A half turn, 180°, is an arc of π, so multiply by π/180.' },
        t: { expr: '{s} × 180/π', how: 'Multiply the radians by 180/π to get degrees.' },
      },
    }),
    example: { t: 120, s: (2 * Math.PI) / 3 },
    startWith: ['t'],
    representation: { kind: 'unitCircle', angle: 't', arc: 's' },
  },
  {
    id: 'g.m12-trig-formulas-equations-sine',
    title: 'Solve sin θ = c',
    use: 'Use this for every angle on one turn with a given sine.',
    assumptions: [
      'Solutions from 0° up to 360°.',
      'c is from 0 to 1, so both angles are on the top half.',
    ],
    variables: [
      unitValue('c', 'c', 'The sine, c'),
      angle('a', 'First solution', -90, 90),
      angle('b', 'Second solution', 90, 270),
    ],
    ...rules(firstSolution('sin'), secondSolution('sin')),
    example: { c: 0.5, a: 30, b: 150 },
    startWith: ['c'],
    representation: {
      kind: 'unitCircle',
      angle: 'a',
      fixed: true,
      solutions: { fn: 'sin', value: 'c', angles: ['a', 'b'] },
    },
  },
  {
    id: 'g.m12-trig-formulas-equations-tangent',
    title: 'Solve tan θ = c',
    use: 'Use this for the two angles on one turn with a given tangent.',
    assumptions: [
      'Solutions from 0° up to 360°.',
      'c is 0 or more, so the first angle is from 0° to 90°.',
    ],
    variables: [
      { id: 'c', symbol: 'c', name: 'The tangent, c', min: 0, max: 1000, step: 0.0001 },
      angle('a', 'First solution', 0, 90),
      angle('b', 'Second solution', 180, 270),
    ],
    ...rules(firstSolution('tan'), secondSolution('tan')),
    example: { c: Math.sqrt(3), a: 60, b: 240 },
    startWith: ['c'],
    representation: {
      kind: 'unitCircle',
      angle: 'a',
      fixed: true,
      solutions: { fn: 'tan', value: 'c', angles: ['a', 'b'] },
    },
  },
  {
    id: 'g.m12-inverse-trig-arccos',
    title: 'The inverse cosine',
    use: 'Use this for arccos c: the one angle from 0° to 180° with cosine c.',
    assumptions: ['arccos gives an angle from 0° to 180°.', 'c is from −1 to 1.'],
    variables: [unitValue('c', 'c', 'The cosine, c'), angle('a', 'arccos c', 0, 180)],
    ...rules(firstSolution('cos')),
    example: { c: -0.5, a: 120 },
    startWith: ['c'],
    representation: {
      kind: 'unitCircle',
      angle: 'a',
      fixed: true,
      solutions: { fn: 'cos', value: 'c', angles: ['a'], principal: true },
    },
  },
];

// ─── H07 algebraTiles ────────────────────────────────────────────────────────

/** A whole-number coefficient (a count of tiles, −10 to 10 by default). */
const coef = (id: string, symbol: string, name: string, min = -10, max = 10): VariableDef => ({
  id,
  symbol,
  name,
  min,
  max,
  step: 1,
  integer: true,
});

/** out = a + b (collecting like terms), both ways. */
const plus = (out: string, a: string, b: string, what: string): Rule => ({
  relation: {
    id: `${out} = ${a} + ${b}`,
    display: `{${out}} = {${a}} + {${b}}`,
    vars: [out, a, b],
    residual: (v) => v[out]! - v[a]! - v[b]!,
    solve: {
      [out]: (v) => v[a]! + v[b]!,
      [a]: (v) => v[out]! - v[b]!,
      [b]: (v) => v[out]! - v[a]!,
    },
  },
  steps: {
    [out]: { expr: `{${a}} + {${b}}`, how: `Add the ${what}: each zero pair adds nothing.` },
    [a]: { expr: `{${out}} − {${b}}`, how: `Take the second polynomial’s ${what} from the sum’s.` },
    [b]: { expr: `{${out}} − {${a}}`, how: `Take the first polynomial’s ${what} from the sum’s.` },
  },
});

/** The product's coefficients from the factors (px + q)(rx + s). */
const productRules = (): Rule[] => [
  {
    relation: {
      id: 'A = pr',
      display: '{A} = {p} × {r}',
      vars: ['A', 'p', 'r'],
      residual: (v) => v.A! - v.p! * v.r!,
      solve: { A: (v) => v.p! * v.r!, p: (v) => div(v.A!, v.r!), r: (v) => div(v.A!, v.p!) },
    },
    steps: {
      A: { expr: '{p} × {r}', how: 'The x tiles on the two edges meet in x² tiles.' },
      p: { expr: '{A}/{r}', how: 'Divide the x² tiles by the x tiles down the side.' },
      r: { expr: '{A}/{p}', how: 'Divide the x² tiles by the x tiles across the top.' },
    },
  },
  {
    relation: {
      id: 'B = ps + qr',
      display: '{B} = {p} × {s} + {q} × {r}',
      vars: ['B', 'p', 'q', 'r', 's'],
      residual: (v) => v.B! - v.p! * v.s! - v.q! * v.r!,
      solve: {
        B: (v) => v.p! * v.s! + v.q! * v.r!,
        q: (v) => div(v.B! - v.p! * v.s!, v.r!),
        s: (v) => div(v.B! - v.q! * v.r!, v.p!),
      },
    },
    steps: {
      B: {
        expr: '{p} × {s} + {q} × {r}',
        how: 'Each x tile meets a unit tile on the other edge in an x tile.',
      },
      q: {
        expr: '({B} − {p} × {s})/{r}',
        how: 'Take away the x tiles the top’s x tiles make, then divide.',
      },
      s: {
        expr: '({B} − {q} × {r})/{p}',
        how: 'Take away the x tiles the side’s x tiles make, then divide.',
      },
    },
  },
  {
    relation: {
      id: 'C = qs',
      display: '{C} = {q} × {s}',
      vars: ['C', 'q', 's'],
      residual: (v) => v.C! - v.q! * v.s!,
      solve: { C: (v) => v.q! * v.s!, q: (v) => div(v.C!, v.s!), s: (v) => div(v.C!, v.q!) },
    },
    steps: {
      C: { expr: '{q} × {s}', how: 'The unit tiles on the two edges meet in unit tiles.' },
      q: { expr: '{C}/{s}', how: 'Divide the unit tiles by the units down the side.' },
      s: { expr: '{C}/{q}', how: 'Divide the unit tiles by the units across the top.' },
    },
  },
];

const factorVars = [
  coef('p', 'p', 'x tiles across the top', -3, 3),
  coef('q', 'q', 'Unit tiles across the top'),
  coef('r', 'r', 'x tiles down the side', -3, 3),
  coef('s', 's', 'Unit tiles down the side'),
  coef('A', 'a', 'x² tiles in the product'),
  coef('B', 'b', 'x tiles in the product', -20, 20),
  coef('C', 'c', 'Unit tiles in the product', -100, 100),
];

const multiplyDemo = (id: string, title: string, use: string, example: Values): ModuleDef => ({
  id,
  title,
  use,
  assumptions: [
    'The factors are (px + q) across the top and (rx + s) down the side.',
    'A negative tile times a negative tile is a positive tile.',
  ],
  variables: factorVars,
  ...rules(...productRules()),
  example,
  startWith: ['p', 'q', 'r', 's'],
  representation: {
    kind: 'algebraTiles',
    mode: 'rectangle',
    factors: { p: 'p', q: 'q', r: 'r', s: 's' },
    product: { x2: 'A', x: 'B', unit: 'C' },
  },
});

/** Factor x² + bx + c: q is a root of t² − bt + c = 0 (the smaller), s = b − q. */
const factorDemo = (id: string, title: string, example: Values): ModuleDef => ({
  id,
  title,
  use: 'Use this to factor x² + bx + c by arranging its tiles into a rectangle.',
  assumptions: [
    'The trinomial starts with one x² tile.',
    'Factor it as (x + q)(x + s): q + s = b and q × s = c.',
  ],
  variables: [
    coef('b', 'b', 'x tiles'),
    coef('c', 'c', 'Unit tiles'),
    coef('q', 'q', 'First number'),
    coef('s', 's', 'Second number'),
  ],
  ...rules(
    {
      relation: {
        id: 'q² − bq + c = 0',
        display: '{q}² − {b} × {q} + {c} = 0',
        vars: ['q', 'b', 'c'],
        residual: (v) => v.q! ** 2 - v.b! * v.q! + v.c!,
        solve: {
          q: (v) => {
            const d = v.b! ** 2 - 4 * v.c!;
            return d < 0 ? [NaN] : [(v.b! - Math.sqrt(d)) / 2, (v.b! + Math.sqrt(d)) / 2];
          },
          b: (v) => div(v.q! ** 2 + v.c!, v.q!),
          c: (v) => v.b! * v.q! - v.q! ** 2,
        },
      },
      steps: {
        q: {
          expr: '({b} − √({b}² − 4 × {c}))/2',
          how: 'q and s add to b and multiply to c, so each solves t² − bt + c = 0.',
        },
        b: { expr: '({q}² + {c})/{q}', how: 'Add c to q², then divide by q.' },
        c: { expr: '{b} × {q} − {q}²', how: 'Take q² from b times q.' },
      },
    },
    {
      relation: {
        id: 's = b − q',
        display: '{s} = {b} − {q}',
        vars: ['s', 'b', 'q'],
        residual: (v) => v.s! - v.b! + v.q!,
        solve: { s: (v) => v.b! - v.q!, b: (v) => v.s! + v.q!, q: (v) => v.b! - v.s! },
      },
      steps: {
        s: { expr: '{b} − {q}', how: 'The two numbers add to b.' },
        b: { expr: '{s} + {q}', how: 'The x tiles are the two numbers added.' },
        q: { expr: '{b} − {s}', how: 'The two numbers add to b.' },
      },
    },
  ),
  example,
  startWith: ['b', 'c'],
  representation: {
    kind: 'algebraTiles',
    mode: 'rectangle',
    given: 'product',
    factors: { p: 1, q: 'q', r: 1, s: 's' },
    product: { x2: 1, x: 'b', unit: 'c' },
  },
});

/** Complete the square: k = b/2, the corner k², and n = c − k². */
const squareDemo = (id: string, title: string, example: Values): ModuleDef => ({
  id,
  title,
  use: 'Use this to complete the square of x² + bx + c with tiles.',
  assumptions: [
    'b is even, so half of it is a whole number of x tiles.',
    'The trinomial starts with one x² tile.',
  ],
  variables: [
    coef('b', 'b', 'x tiles', -16, 16),
    coef('c', 'c', 'Unit tiles'),
    coef('k', 'k', 'Half of b', -8, 8),
    coef('m', 'm', 'Tiles in the missing corner', 0, 64),
    coef('n', 'n', 'Constant after completing', -74, 10),
  ],
  ...rules(
    {
      relation: {
        id: 'k = b/2',
        display: '{k} = {b}/2',
        vars: ['k', 'b'],
        residual: (v) => v.k! - v.b! / 2,
        solve: { k: (v) => v.b! / 2, b: (v) => 2 * v.k! },
      },
      steps: {
        k: {
          expr: '{b}/2',
          how: 'Split the x tiles in half: one half on each side of the x² tile.',
        },
        b: { expr: '2 × {k}', how: 'Both sides together hold twice k.' },
      },
    },
    {
      relation: {
        id: 'm = k²',
        display: '{m} = {k}²',
        vars: ['m', 'k'],
        residual: (v) => v.m! - v.k! ** 2,
        solve: { m: (v) => v.k! ** 2, k: () => undefined },
      },
      steps: { m: { expr: '{k}²', how: 'The missing corner is k by k unit tiles.' } },
    },
    {
      relation: {
        id: 'n = c − m',
        display: '{n} = {c} − {m}',
        vars: ['n', 'c', 'm'],
        residual: (v) => v.n! - v.c! + v.m!,
        solve: { n: (v) => v.c! - v.m!, c: (v) => v.n! + v.m!, m: (v) => v.c! - v.n! },
      },
      steps: {
        n: {
          expr: '{c} − {m}',
          how: 'Borrow the corner’s tiles from c: what is left stays outside.',
        },
        c: { expr: '{n} + {m}', how: 'Add the corner’s tiles back to what is left.' },
        m: { expr: '{c} − {n}', how: 'The corner is what c lost.' },
      },
    },
  ),
  example,
  startWith: ['b', 'c'],
  representation: { kind: 'algebraTiles', mode: 'square', b: 'b', c: 'c', k: 'k', missing: 'm' },
});

/** ax + b = cx + d on a mat, solved for x. */
const equationDemo = (id: string, title: string, example: Values): ModuleDef => ({
  id,
  title,
  use: 'Use this to solve an equation with x on both sides, using tiles on a mat.',
  assumptions: [
    'Take the same tiles from both sides, or add zero pairs.',
    'The x tiles on the two sides differ.',
  ],
  variables: [
    coef('a', 'a', 'x tiles on the left'),
    coef('b', 'b', 'Unit tiles on the left'),
    coef('c', 'c', 'x tiles on the right'),
    coef('d', 'd', 'Unit tiles on the right'),
    { id: 'x', symbol: 'x', name: 'Solution', min: -100, max: 100, step: 0.01 },
  ],
  ...rules({
    relation: {
      id: 'ax + b = cx + d',
      display: '{a} × {x} + {b} = {c} × {x} + {d}',
      vars: ['x', 'a', 'b', 'c', 'd'],
      residual: (v) => v.a! * v.x! + v.b! - v.c! * v.x! - v.d!,
      solve: {
        x: (v) => div(v.d! - v.b!, v.a! - v.c!),
        b: (v) => v.c! * v.x! + v.d! - v.a! * v.x!,
        d: (v) => v.a! * v.x! + v.b! - v.c! * v.x!,
      },
    },
    steps: {
      x: {
        expr: '({d} − {b})/({a} − {c})',
        how: 'Take c x tiles and b unit tiles from both sides, then share the units among the x tiles.',
      },
      b: { expr: '{c} × {x} + {d} − {a} × {x}', how: 'The left’s units make the two sides equal.' },
      d: {
        expr: '{a} × {x} + {b} − {c} × {x}',
        how: 'The right’s units make the two sides equal.',
      },
    },
  }),
  example,
  startWith: ['a', 'b', 'c', 'd'],
  representation: {
    kind: 'algebraTiles',
    mode: 'equation',
    left: { x: 'a', unit: 'b' },
    right: { x: 'c', unit: 'd' },
    solution: 'x',
  },
});

/** Two polynomials added, with the sum checked at a value of x. */
const collectDemo: ModuleDef = {
  id: 'g.m9-polynomial-operations-add',
  title: 'Add polynomials with tiles',
  use: 'Use this to add two polynomials by collecting like tiles.',
  assumptions: [
    'Tiles of the same size and opposite colors are zero pairs.',
    'v checks the sum at one value of x.',
  ],
  variables: [
    coef('a1', 'a₁', 'x² tiles, first'),
    coef('b1', 'b₁', 'x tiles, first'),
    coef('c1', 'c₁', 'Unit tiles, first'),
    coef('a2', 'a₂', 'x² tiles, second'),
    coef('b2', 'b₂', 'x tiles, second'),
    coef('c2', 'c₂', 'Unit tiles, second'),
    coef('A', 'A', 'x² tiles in the sum', -20, 20),
    coef('B', 'B', 'x tiles in the sum', -20, 20),
    coef('C', 'C', 'Unit tiles in the sum', -20, 20),
    coef('x', 'x', 'Value of x'),
    coef('v', 'v', 'The sum at x', -10000, 10000),
  ],
  ...rules(
    plus('A', 'a1', 'a2', 'x² tiles'),
    plus('B', 'b1', 'b2', 'x tiles'),
    plus('C', 'c1', 'c2', 'unit tiles'),
    {
      relation: {
        id: 'v = Ax² + Bx + C',
        display: '{v} = {A} × {x}² + {B} × {x} + {C}',
        vars: ['v', 'A', 'B', 'C', 'x'],
        residual: (v) => v.v! - v.A! * v.x! ** 2 - v.B! * v.x! - v.C!,
        solve: {
          v: (v) => v.A! * v.x! ** 2 + v.B! * v.x! + v.C!,
          C: (v) => v.v! - v.A! * v.x! ** 2 - v.B! * v.x!,
        },
      },
      steps: {
        v: { expr: '{A} × {x}² + {B} × {x} + {C}', how: 'Put the value of x into the sum.' },
        C: { expr: '{v} − {A} × {x}² − {B} × {x}', how: 'Take the x² and x terms from the value.' },
      },
    },
  ),
  example: { a1: 2, b1: -3, c1: 4, a2: -1, b2: 5, c2: -6, A: 1, B: 2, C: -2, x: 2, v: 6 },
  startWith: ['a1', 'b1', 'c1', 'a2', 'b2', 'c2', 'x'],
  representation: {
    kind: 'algebraTiles',
    mode: 'collect',
    tiles: { x2: 'a1', x: 'b1', unit: 'c1' },
    plus: { x2: 'a2', x: 'b2', unit: 'c2' },
    sum: { x2: 'A', x: 'B', unit: 'C' },
  },
};

const ALGEBRA_TILES: ModuleDef[] = [
  collectDemo,
  multiplyDemo(
    'g.m9-polynomial-operations-multiply',
    'Multiply binomials with tiles',
    'Use this to multiply two binomials as the area of a rectangle of tiles.',
    { p: 1, q: 3, r: 1, s: 2, A: 1, B: 5, C: 6 },
  ),
  multiplyDemo(
    'g.m9-polynomial-operations-zero-pairs',
    'A product whose x tiles cancel',
    'Use this for a product like (x + 2)(x − 2), whose x tiles are zero pairs.',
    { p: 1, q: 2, r: 1, s: -2, A: 1, B: 0, C: -4 },
  ),
  multiplyDemo(
    'g.m9-polynomial-operations-edge',
    'A larger product',
    'Use this for a product with two x tiles on an edge, such as (2x + 1)(x + 4).',
    { p: 2, q: 1, r: 1, s: 4, A: 2, B: 9, C: 4 },
  ),
  factorDemo('g.m9-factoring-trinomial', 'Factor a trinomial with tiles', {
    b: 5,
    c: 6,
    q: 2,
    s: 3,
  }),
  factorDemo('g.m9-factoring-negative', 'Factor with negative tiles', {
    b: -1,
    c: -6,
    q: -3,
    s: 2,
  }),
  squareDemo('g.m9-quadratic-formula-complete-square', 'Complete the square with tiles', {
    b: 6,
    c: 5,
    k: 3,
    m: 9,
    n: -4,
  }),
  squareDemo('g.m9-quadratic-formula-square-negative', 'Complete the square: negative b', {
    b: -8,
    c: 7,
    k: -4,
    m: 16,
    n: -9,
  }),
  equationDemo('g.m9-solving-equations-tiles', 'Solve an equation with tiles', {
    a: 2,
    b: 3,
    c: 1,
    d: 7,
    x: 4,
  }),
  equationDemo('g.m9-solving-equations-negative-tiles', 'Solve with negative tiles', {
    a: 3,
    b: -4,
    c: -1,
    d: 8,
    x: 3,
  }),
];

// ─── H08 vectorDiagram ───────────────────────────────────────────────────────

/** A component or a size that may be negative, to 2 decimals. */
const real = (id: string, symbol: string, name: string, min = -20, max = 20, unit?: string) =>
  ({ id, symbol, name, min, max, step: 0.01, ...(unit ? { unit } : {}) }) as VariableDef;

/** out = a + b for components (both ways). */
const addParts = (out: string, a: string, b: string, axis: 'x' | 'y'): Rule => ({
  relation: {
    id: `${out} = ${a} + ${b}`,
    display: `{${out}} = {${a}} + {${b}}`,
    vars: [out, a, b],
    residual: (v) => v[out]! - v[a]! - v[b]!,
    solve: {
      [out]: (v) => v[a]! + v[b]!,
      [a]: (v) => v[out]! - v[b]!,
      [b]: (v) => v[out]! - v[a]!,
    },
  },
  steps: {
    [out]: { expr: `{${a}} + {${b}}`, how: `Add the ${axis}-components.` },
    [a]: { expr: `{${out}} − {${b}}`, how: `Take the second ${axis}-component from the sum’s.` },
    [b]: { expr: `{${out}} − {${a}}`, how: `Take the first ${axis}-component from the sum’s.` },
  },
});

/** |r| = √(x² + y²). */
const magnitude = (out: string, x: string, y: string): Rule => ({
  relation: {
    id: `${out} = √(${x}² + ${y}²)`,
    display: `{${out}} = √({${x}}² + {${y}}²)`,
    vars: [out, x, y],
    residual: (v) => v[out]! - Math.hypot(v[x]!, v[y]!),
    solve: {
      [out]: (v) => Math.hypot(v[x]!, v[y]!),
      [x]: () => undefined,
      [y]: () => undefined,
    },
  },
  steps: {
    [out]: {
      expr: `√({${x}}² + {${y}}²)`,
      how: 'The components are the legs of a right triangle; the length is its hypotenuse.',
    },
  },
});

/** A component from a magnitude and a direction: m cos θ or m sin θ. */
const component = (out: string, m: string, d: string, fn: 'cos' | 'sin'): Rule => {
  const f = fn === 'cos' ? Math.cos : Math.sin;
  return {
    relation: {
      id: `${out} = ${m} ${fn} ${d}`,
      display: `{${out}} = {${m}} × ${fn}({${d}})`,
      vars: [out, m, d],
      residual: (v) => v[out]! - v[m]! * f(v[d]! * RAD),
      solve: {
        [out]: (v) => v[m]! * f(v[d]! * RAD),
        [m]: (v) => div(v[out]!, f(v[d]! * RAD)),
        [d]: () => undefined,
      },
    },
    steps: {
      [out]: {
        expr: `{${m}} × ${fn}({${d}})`,
        how:
          fn === 'cos'
            ? 'The x-component is the length times the cosine of the direction.'
            : 'The y-component is the length times the sine of the direction.',
      },
      [m]: {
        expr: `{${out}}/${fn}({${d}})`,
        how: `Divide the component by the ${fn === 'cos' ? 'cosine' : 'sine'} of the direction.`,
      },
    },
  };
};

const vectorSum = (
  id: string,
  title: string,
  sum: 'tipToTail' | 'parallelogram',
  example: Values,
): ModuleDef => ({
  id,
  title,
  use:
    sum === 'tipToTail'
      ? 'Use this to add two vectors by placing the second’s tail at the first’s tip.'
      : 'Use this to add two vectors as the diagonal of a parallelogram.',
  assumptions: [
    'Vectors are given by their components ⟨x, y⟩.',
    'Add vectors by adding components.',
  ],
  variables: [
    real('ux', 'u₁', 'x-component of u', -10, 10),
    real('uy', 'u₂', 'y-component of u', -10, 10),
    real('vx', 'v₁', 'x-component of v', -10, 10),
    real('vy', 'v₂', 'y-component of v', -10, 10),
    real('sx', 's₁', 'x-component of u + v'),
    real('sy', 's₂', 'y-component of u + v'),
    real('r', '|u + v|', 'Length of u + v', 0, 30),
  ],
  ...rules(
    addParts('sx', 'ux', 'vx', 'x'),
    addParts('sy', 'uy', 'vy', 'y'),
    magnitude('r', 'sx', 'sy'),
  ),
  example,
  startWith: ['ux', 'uy', 'vx', 'vy'],
  representation: {
    kind: 'vectorDiagram',
    vectors: [
      { name: 'u', x: 'ux', y: 'uy' },
      { name: 'v', x: 'vx', y: 'vy' },
    ],
    sum,
    result: { name: 'u + v', x: 'sx', y: 'sy', magnitude: 'r' },
  },
});

const VECTORS: ModuleDef[] = [
  vectorSum('g.m12-vectors-tip-to-tail', 'Add vectors tip to tail', 'tipToTail', {
    ux: 3,
    uy: 1,
    vx: 1,
    vy: 3,
    sx: 4,
    sy: 4,
    r: Math.hypot(4, 4),
  }),
  vectorSum('g.m12-vectors-parallelogram', 'Add vectors as a parallelogram', 'parallelogram', {
    ux: 4,
    uy: -1,
    vx: -2,
    vy: 3,
    sx: 2,
    sy: 2,
    r: Math.hypot(2, 2),
  }),
  {
    id: 'g.m12-vectors-scalar',
    title: 'A scalar multiple',
    use: 'Use this for k times a vector: k times as long, reversed when k is negative.',
    assumptions: ['k multiplies each component.', 'A negative k turns the vector around.'],
    variables: [
      real('k', 'k', 'Scalar', -5, 5),
      real('vx', 'v₁', 'x-component of v', -10, 10),
      real('vy', 'v₂', 'y-component of v', -10, 10),
      real('wx', 'w₁', 'x-component of kv', -50, 50),
      real('wy', 'w₂', 'y-component of kv', -50, 50),
    ],
    ...rules(
      {
        relation: {
          id: 'w₁ = k v₁',
          display: '{wx} = {k} × {vx}',
          vars: ['wx', 'k', 'vx'],
          residual: (v) => v.wx! - v.k! * v.vx!,
          solve: {
            wx: (v) => v.k! * v.vx!,
            k: (v) => div(v.wx!, v.vx!),
            vx: (v) => div(v.wx!, v.k!),
          },
        },
        steps: {
          wx: { expr: '{k} × {vx}', how: 'Multiply the x-component by k.' },
          k: { expr: '{wx}/{vx}', how: 'Divide the new x-component by the old.' },
          vx: { expr: '{wx}/{k}', how: 'Divide the new x-component by k.' },
        },
      },
      {
        relation: {
          id: 'w₂ = k v₂',
          display: '{wy} = {k} × {vy}',
          vars: ['wy', 'k', 'vy'],
          residual: (v) => v.wy! - v.k! * v.vy!,
          solve: {
            wy: (v) => v.k! * v.vy!,
            k: (v) => div(v.wy!, v.vy!),
            vy: (v) => div(v.wy!, v.k!),
          },
        },
        steps: {
          wy: { expr: '{k} × {vy}', how: 'Multiply the y-component by k.' },
          k: { expr: '{wy}/{vy}', how: 'Divide the new y-component by the old.' },
          vy: { expr: '{wy}/{k}', how: 'Divide the new y-component by k.' },
        },
      },
    ),
    example: { k: -2, vx: 2, vy: 1, wx: -4, wy: -2 },
    startWith: ['k', 'vx', 'vy'],
    representation: {
      kind: 'vectorDiagram',
      vectors: [{ name: 'v', x: 'vx', y: 'vy' }],
      scalar: { k: 'k', x: 'wx', y: 'wy' },
    },
  },
  {
    id: 'g.m12-vectors-angle',
    title: 'The angle between two vectors',
    use: 'Use this for the dot product of two vectors and the angle between them.',
    assumptions: [
      'u · v = u₁v₁ + u₂v₂.',
      'cos θ = u · v ÷ (|u||v|): a positive dot product means an acute angle.',
    ],
    variables: [
      real('ux', 'u₁', 'x-component of u', -10, 10),
      real('uy', 'u₂', 'y-component of u', -10, 10),
      real('vx', 'v₁', 'x-component of v', -10, 10),
      real('vy', 'v₂', 'y-component of v', -10, 10),
      real('d', 'u · v', 'Dot product', -200, 200),
      real('mu', '|u|', 'Length of u', 0, 15),
      real('mv', '|v|', 'Length of v', 0, 15),
      { ...angle('t', 'Angle between', 0, 180), step: 0.1 },
    ],
    ...rules(
      {
        relation: {
          id: 'u · v = u₁v₁ + u₂v₂',
          display: '{d} = {ux} × {vx} + {uy} × {vy}',
          vars: ['d', 'ux', 'vx', 'uy', 'vy'],
          residual: (v) => v.d! - v.ux! * v.vx! - v.uy! * v.vy!,
          solve: { d: (v) => v.ux! * v.vx! + v.uy! * v.vy! },
        },
        steps: {
          d: { expr: '{ux} × {vx} + {uy} × {vy}', how: 'Multiply matching components and add.' },
        },
      },
      magnitude('mu', 'ux', 'uy'),
      magnitude('mv', 'vx', 'vy'),
      {
        relation: {
          id: 'θ = arccos(u · v/(|u||v|))',
          display: '{t} = arccos({d}/({mu} × {mv}))',
          vars: ['t', 'd', 'mu', 'mv'],
          residual: (v) => Math.cos(v.t! * RAD) * v.mu! * v.mv! - v.d!,
          solve: {
            t: (v) => {
              const q = div(v.d!, v.mu! * v.mv!);
              return q === undefined ? undefined : Math.acos(Math.max(-1, Math.min(1, q))) / RAD;
            },
            d: (v) => Math.cos(v.t! * RAD) * v.mu! * v.mv!,
          },
        },
        steps: {
          t: {
            expr: 'arccos({d}/({mu} × {mv}))',
            how: 'The cosine of the angle is the dot product over the product of the lengths.',
          },
          d: {
            expr: '{mu} × {mv} × cos({t})',
            how: 'The dot product is the lengths times the cosine of the angle.',
          },
        },
      },
    ),
    example: {
      ux: 3,
      uy: 4,
      vx: 4,
      vy: -1,
      d: 8,
      mu: 5,
      mv: Math.sqrt(17),
      t: Math.acos(8 / (5 * Math.sqrt(17))) / RAD,
    },
    startWith: ['ux', 'uy', 'vx', 'vy'],
    representation: {
      kind: 'vectorDiagram',
      vectors: [
        { name: 'u', x: 'ux', y: 'uy' },
        { name: 'v', x: 'vx', y: 'vy' },
      ],
      angle: { value: 't', dot: 'd' },
    },
  },
  {
    id: 'g.m12-vectors-magnitude-direction',
    title: 'Components from length and direction',
    use: 'Use this to find a vector’s components from its length and direction.',
    assumptions: [
      'The direction is measured from the positive x-axis.',
      'Counterclockwise is positive.',
    ],
    variables: [
      real('m', '|v|', 'Length', 0, 20),
      { ...angle('t', 'Direction', 0, 360), step: 1 },
      real('vx', 'v₁', 'x-component'),
      real('vy', 'v₂', 'y-component'),
    ],
    ...rules(component('vx', 'm', 't', 'cos'), component('vy', 'm', 't', 'sin')),
    example: { m: 10, t: 30, vx: 10 * Math.cos(30 * RAD), vy: 5 },
    startWith: ['m', 't'],
    representation: {
      kind: 'vectorDiagram',
      vectors: [{ name: 'v', magnitude: 'm', direction: 't' }],
      components: true,
    },
    pictureLabels: ['vx', 'vy'],
  },
  {
    id: 'g.s11-kinematics-2d-boat',
    title: 'A boat crossing a current',
    use: 'Use this for a velocity made of two perpendicular velocities, like a boat and a current.',
    assumptions: [
      'The boat heads straight across (north); the current flows east.',
      'The ground velocity is the sum of the two velocities.',
    ],
    variables: [
      {
        id: 'b',
        symbol: 'b',
        name: 'Boat’s speed in still water',
        unit: 'm/s',
        min: 0.1,
        max: 20,
        step: 0.1,
      },
      { id: 'w', symbol: 'w', name: 'Current’s speed', unit: 'm/s', min: 0.1, max: 20, step: 0.1 },
      {
        id: 'r',
        symbol: 'v',
        name: 'Speed over the ground',
        unit: 'm/s',
        min: 0,
        max: 30,
        step: 0.01,
      },
      { ...angle('a', 'Direction, from east', 0, 90), step: 0.1 },
    ],
    ...rules(
      {
        relation: {
          id: 'v = √(b² + w²)',
          display: '{r} = √({b}² + {w}²)',
          vars: ['r', 'b', 'w'],
          residual: (v) => v.r! - Math.hypot(v.b!, v.w!),
          solve: {
            r: (v) => Math.hypot(v.b!, v.w!),
            b: (v) => (v.r! < v.w! ? undefined : Math.sqrt(v.r! ** 2 - v.w! ** 2)),
            w: (v) => (v.r! < v.b! ? undefined : Math.sqrt(v.r! ** 2 - v.b! ** 2)),
          },
        },
        steps: {
          r: {
            expr: '√({b}² + {w}²)',
            how: 'The two velocities are at right angles: add them by Pythagoras.',
          },
          b: {
            expr: '√({r}² − {w}²)',
            how: 'Take the current’s square from the ground speed’s square.',
          },
          w: {
            expr: '√({r}² − {b}²)',
            how: 'Take the boat’s square from the ground speed’s square.',
          },
        },
      },
      {
        relation: {
          id: 'θ = arctan(b/w)',
          display: '{a} = arctan({b}/{w})',
          vars: ['a', 'b', 'w'],
          residual: (v) => Math.tan(v.a! * RAD) * v.w! - v.b!,
          solve: {
            a: (v) => Math.atan2(v.b!, v.w!) / RAD,
            b: (v) => v.w! * Math.tan(v.a! * RAD),
            w: (v) => div(v.b!, Math.tan(v.a! * RAD)),
          },
        },
        steps: {
          a: {
            expr: 'arctan({b}/{w})',
            how: 'The tangent of the angle from east is north over east.',
          },
          b: { expr: '{w} × tan({a})', how: 'North is east times the tangent of the angle.' },
          w: { expr: '{b}/tan({a})', how: 'East is north over the tangent of the angle.' },
        },
      },
    ),
    example: { b: 4, w: 3, r: 5, a: Math.atan2(4, 3) / RAD },
    startWith: ['b', 'w'],
    representation: {
      kind: 'vectorDiagram',
      vectors: [
        { name: 'boat', magnitude: 'b', direction: 90 },
        { name: 'current', magnitude: 'w', direction: 0 },
      ],
      sum: 'tipToTail',
      result: { name: 'v', magnitude: 'r', direction: 'a' },
      unit: 'm/s',
      axes: { x: 'east', y: 'north' },
    },
  },
  {
    id: 'g.s11-dynamics-vectors-forces',
    title: 'Two forces on one object',
    use: 'Use this for the net force of two pulls at an angle, added as a parallelogram.',
    assumptions: [
      'F₁ pulls east; F₂ pulls at the angle θ north of east.',
      'The net force is their vector sum.',
    ],
    variables: [
      { id: 'f1', symbol: 'F₁', name: 'First force', unit: 'N', min: 0, max: 100, step: 1 },
      { id: 'f2', symbol: 'F₂', name: 'Second force', unit: 'N', min: 0, max: 100, step: 1 },
      { ...angle('a', 'Angle of F₂', 0, 90), step: 1 },
      { id: 'fx', symbol: 'X', name: 'Net force east', unit: 'N', min: 0, max: 200, step: 0.01 },
      { id: 'fy', symbol: 'Y', name: 'Net force north', unit: 'N', min: 0, max: 100, step: 0.01 },
      { id: 'f', symbol: 'F', name: 'Net force', unit: 'N', min: 0, max: 200, step: 0.01 },
    ],
    ...rules(
      {
        relation: {
          id: 'X = F₁ + F₂ cos θ',
          display: '{fx} = {f1} + {f2} × cos({a})',
          vars: ['fx', 'f1', 'f2', 'a'],
          residual: (v) => v.fx! - v.f1! - v.f2! * Math.cos(v.a! * RAD),
          solve: {
            fx: (v) => v.f1! + v.f2! * Math.cos(v.a! * RAD),
            f1: (v) => v.fx! - v.f2! * Math.cos(v.a! * RAD),
            a: () => undefined,
            f2: () => undefined,
          },
        },
        steps: {
          fx: {
            expr: '{f1} + {f2} × cos({a})',
            how: 'Add the east parts: all of F₁, and F₂ times cos θ.',
          },
          f1: {
            expr: '{fx} − {f2} × cos({a})',
            how: 'Take F₂’s east part from the net east force.',
          },
        },
      },
      component('fy', 'f2', 'a', 'sin'),
      magnitude('f', 'fx', 'fy'),
    ),
    example: {
      f1: 30,
      f2: 40,
      a: 60,
      fx: 30 + 40 * Math.cos(60 * RAD),
      fy: 40 * Math.sin(60 * RAD),
      f: Math.hypot(30 + 40 * Math.cos(60 * RAD), 40 * Math.sin(60 * RAD)),
    },
    startWith: ['f1', 'f2', 'a'],
    representation: {
      kind: 'vectorDiagram',
      vectors: [
        { name: 'F₁', magnitude: 'f1', direction: 0 },
        { name: 'F₂', magnitude: 'f2', direction: 'a' },
      ],
      sum: 'parallelogram',
      result: { name: 'F', x: 'fx', y: 'fy', magnitude: 'f' },
      unit: 'N',
      axes: { x: 'east', y: 'north' },
    },
  },
];

// ─── H09 complexPlane ────────────────────────────────────────────────────────

/** |z| = √(a² + b²), and arg z from the parts (degrees, 0° up to 360°). */
const modulusRule = magnitude('m', 'a', 'b');

/** A part of a sum or product of complex numbers. */
const complexPart = (
  out: string,
  display: string,
  vars: string[],
  f: (v: Values) => number,
  how: string,
  expr: string,
): Rule => ({
  relation: {
    id: display.replace(/[{}]/g, ''),
    display,
    vars: [out, ...vars],
    residual: (v) => v[out]! - f(v),
    solve: { [out]: f, ...Object.fromEntries(vars.map((x) => [x, () => undefined])) },
  },
  steps: { [out]: { expr, how } },
});

const COMPLEX: ModuleDef[] = [
  {
    id: 'g.m11-complex-numbers-plot',
    title: 'A complex number in the plane',
    use: 'Use this to plot a + bi, its conjugate and its modulus.',
    assumptions: [
      'The real part runs across; the imaginary part runs up.',
      'The conjugate of a + bi is a − bi.',
    ],
    variables: [
      real('a', 'a', 'Real part', -10, 10),
      real('b', 'b', 'Imaginary part', -10, 10),
      real('m', '|z|', 'Modulus', 0, 15),
    ],
    ...rules(modulusRule),
    example: { a: 3, b: 2, m: Math.hypot(3, 2) },
    startWith: ['a', 'b'],
    representation: {
      kind: 'complexPlane',
      z: { re: 'a', im: 'b' },
      conjugate: true,
      modulus: 'm',
    },
  },
  {
    id: 'g.m11-complex-numbers-negative',
    title: 'Modulus and argument',
    use: 'Use this for the modulus and argument of a complex number in any quadrant.',
    assumptions: ['The argument is measured from the positive real axis, 0° up to 360°.'],
    variables: [
      real('a', 'a', 'Real part', -10, 10),
      real('b', 'b', 'Imaginary part', -10, 10),
      real('m', '|z|', 'Modulus', 0, 15),
    ],
    ...rules(modulusRule),
    example: { a: -4, b: -3, m: 5 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'complexPlane',
      z: { re: 'a', im: 'b' },
      modulus: 'm',
      polar: true,
    },
  },
  {
    id: 'g.m11-complex-numbers-sum',
    title: 'Add complex numbers',
    use: 'Use this to add two complex numbers: the parallelogram in the plane.',
    assumptions: ['Add the real parts and the imaginary parts.'],
    variables: [
      real('a', 'a', 'Real part of z', -10, 10),
      real('b', 'b', 'Imaginary part of z', -10, 10),
      real('c', 'c', 'Real part of w', -10, 10),
      real('d', 'd', 'Imaginary part of w', -10, 10),
      real('e', 'e', 'Real part of z + w'),
      real('f', 'f', 'Imaginary part of z + w'),
      real('m', '|z + w|', 'Modulus of z + w', 0, 30),
    ],
    ...rules(addParts('e', 'a', 'c', 'x'), addParts('f', 'b', 'd', 'y'), magnitude('m', 'e', 'f')),
    example: { a: 3, b: 1, c: 1, d: 2, e: 4, f: 3, m: 5 },
    startWith: ['a', 'b', 'c', 'd'],
    representation: {
      kind: 'complexPlane',
      z: { re: 'a', im: 'b' },
      w: { re: 'c', im: 'd' },
      op: 'sum',
      result: { re: 'e', im: 'f' },
    },
    pictureLabels: ['m'],
  },
  {
    id: 'g.m11-complex-numbers-product',
    title: 'Multiply complex numbers',
    use: 'Use this to multiply two complex numbers and see the turn it makes.',
    assumptions: ['i² = −1.', 'Moduli multiply and arguments add.'],
    variables: [
      real('a', 'a', 'Real part of z', -10, 10),
      real('b', 'b', 'Imaginary part of z', -10, 10),
      real('c', 'c', 'Real part of w', -10, 10),
      real('d', 'd', 'Imaginary part of w', -10, 10),
      real('e', 'e', 'Real part of zw', -200, 200),
      real('f', 'f', 'Imaginary part of zw', -200, 200),
    ],
    ...rules(
      complexPart(
        'e',
        '{e} = {a} × {c} − {b} × {d}',
        ['a', 'c', 'b', 'd'],
        (v) => v.a! * v.c! - v.b! * v.d!,
        'The real part: ac, and bi × di = bd × i² = −bd.',
        '{a} × {c} − {b} × {d}',
      ),
      complexPart(
        'f',
        '{f} = {a} × {d} + {b} × {c}',
        ['a', 'd', 'b', 'c'],
        (v) => v.a! * v.d! + v.b! * v.c!,
        'The imaginary part: a × di and bi × c.',
        '{a} × {d} + {b} × {c}',
      ),
    ),
    example: { a: 1, b: 2, c: 2, d: 1, e: 0, f: 5 },
    startWith: ['a', 'b', 'c', 'd'],
    representation: {
      kind: 'complexPlane',
      z: { re: 'a', im: 'b' },
      w: { re: 'c', im: 'd' },
      op: 'product',
      result: { re: 'e', im: 'f' },
    },
  },
  {
    id: 'g.m12-polar-complex-form',
    title: 'Polar form of a complex number',
    use: 'Use this to write r(cos θ + i sin θ) as a + bi.',
    assumptions: ['r is the modulus and θ the argument, from the positive real axis.'],
    variables: [
      real('r', 'r', 'Modulus', 0, 10),
      { ...angle('t', 'Argument', 0, 360), step: 1 },
      real('a', 'a', 'Real part', -10, 10),
      real('b', 'b', 'Imaginary part', -10, 10),
    ],
    ...rules(component('a', 'r', 't', 'cos'), component('b', 'r', 't', 'sin')),
    example: { r: 2, t: 60, a: 1, b: Math.sqrt(3) },
    startWith: ['r', 't'],
    representation: { kind: 'complexPlane', z: { modulus: 'r', argument: 't' }, polar: true },
    pictureLabels: ['a', 'b'],
  },
];

// ─── H10 polarGrid ───────────────────────────────────────────────────────────

/** r = f(θ) for a polar curve, worked forward (θ in degrees). */
const polarRule = (
  display: string,
  f: (v: Values) => number,
  vars: string[],
  how: string,
): Rule => ({
  relation: {
    id: display.replace(/[{}]/g, ''),
    display,
    vars: ['r', ...vars],
    residual: (v) => v.r! - f(v),
    solve: { r: f, ...Object.fromEntries(vars.map((x) => [x, () => undefined])) },
  },
  steps: { r: { expr: display.slice(display.indexOf('=') + 2), how } },
});

const polarCurveDemo = (
  id: string,
  title: string,
  use: string,
  assumptions: string[],
  extra: VariableDef[],
  rule: Rule,
  example: Values,
  representation: ModuleDef['representation'],
): ModuleDef => ({
  id,
  title,
  use,
  assumptions,
  variables: [
    ...extra,
    { ...angle('t', 'Angle θ', 0, 720), step: 1 },
    real('r', 'r', 'Distance r', -50, 50),
  ],
  ...rules(rule),
  example,
  startWith: [...extra.map((v) => v.id), 't'],
  representation,
});

const PATH_T = { id: 't', symbol: 't', name: 'Time t (s)', min: 0, max: 10, step: 0.01 };

const POLAR: ModuleDef[] = [
  {
    id: 'g.m12-polar-point',
    title: 'A point in polar coordinates',
    use: 'Use this to plot (r, θ) and change it to x and y.',
    assumptions: ['θ is measured from the positive x-axis.', 'x = r cos θ and y = r sin θ.'],
    variables: [
      real('r', 'r', 'Distance r', -10, 10),
      { ...angle('t', 'Angle θ', 0, 360), step: 1 },
      real('x', 'x', 'x-coordinate'),
      real('y', 'y', 'y-coordinate'),
    ],
    ...rules(component('x', 'r', 't', 'cos'), component('y', 'r', 't', 'sin')),
    example: { r: 3, t: 60, x: 1.5, y: 3 * Math.sin(60 * RAD) },
    startWith: ['r', 't'],
    representation: { kind: 'polarGrid', point: { r: 'r', theta: 't', x: 'x', y: 'y' } },
  },
  polarCurveDemo(
    'g.m12-polar-rose',
    'A rose curve',
    'Use this for a rose r = a cos(nθ): n petals when n is odd, 2n when even.',
    ['θ is in degrees.', 'A negative r is plotted on the opposite ray.'],
    [real('a', 'a', 'Petal length a', -10, 10), coef('n', 'n', 'n', 1, 8)],
    polarRule(
      '{r} = {a} × cos({n} × {t})',
      (v) => v.a! * Math.cos(v.n! * v.t! * RAD),
      ['a', 'n', 't'],
      'Put θ into the curve’s equation.',
    ),
    { a: 3, n: 3, t: 20, r: 3 * Math.cos(60 * RAD) },
    { kind: 'polarGrid', curve: { shape: 'rose', a: 'a', n: 'n' }, point: { r: 'r', theta: 't' } },
  ),
  polarCurveDemo(
    'g.m12-polar-cardioid',
    'A cardioid',
    'Use this for the cardioid r = a + a cos θ.',
    ['θ is in degrees.', 'The curve passes through the pole at θ = 180°.'],
    [real('a', 'a', 'a', 0.5, 10)],
    polarRule(
      '{r} = {a} + {a} × cos({t})',
      (v) => v.a! + v.a! * Math.cos(v.t! * RAD),
      ['a', 't'],
      'Put θ into the curve’s equation.',
    ),
    { a: 2, t: 60, r: 3 },
    { kind: 'polarGrid', curve: { shape: 'cardioid', a: 'a' }, point: { r: 'r', theta: 't' } },
  ),
  polarCurveDemo(
    'g.m12-polar-limacon',
    'A limaçon with an inner loop',
    'Use this for r = a + b cos θ with b bigger than a: the curve loops inside itself.',
    ['θ is in degrees.', 'A negative r is plotted on the opposite ray.'],
    [real('a', 'a', 'a', -10, 10), real('b', 'b', 'b', -10, 10)],
    polarRule(
      '{r} = {a} + {b} × cos({t})',
      (v) => v.a! + v.b! * Math.cos(v.t! * RAD),
      ['a', 'b', 't'],
      'Put θ into the curve’s equation.',
    ),
    { a: 1, b: 2, t: 150, r: 1 + 2 * Math.cos(150 * RAD) },
    {
      kind: 'polarGrid',
      curve: { shape: 'cardioid', a: 'a', b: 'b' },
      point: { r: 'r', theta: 't' },
    },
  ),
  polarCurveDemo(
    'g.m12-polar-circle',
    'A circle through the pole',
    'Use this for the circle r = a cos θ, which passes through the pole.',
    ['θ is in degrees.', 'The whole circle is drawn as θ runs from 0° to 180°.'],
    [real('a', 'a', 'Diameter a', -10, 10)],
    polarRule(
      '{r} = {a} × cos({t})',
      (v) => v.a! * Math.cos(v.t! * RAD),
      ['a', 't'],
      'Put θ into the curve’s equation.',
    ),
    { a: 4, t: 30, r: 4 * Math.cos(30 * RAD) },
    {
      kind: 'polarGrid',
      curve: { shape: 'circle', a: 'a', fn: 'cos' },
      point: { r: 'r', theta: 't' },
    },
  ),
  polarCurveDemo(
    'g.m12-polar-spiral',
    'A spiral',
    'Use this for the spiral r = aθ, with θ in radians.',
    ['θ in radians inside the equation: θ° × π/180.', 'Two turns are drawn.'],
    [real('a', 'a', 'a', 0.1, 5)],
    polarRule(
      '{r} = {a} × {t} × π/180',
      (v) => v.a! * v.t! * RAD,
      ['a', 't'],
      'Change θ to radians, then multiply by a.',
    ),
    { a: 0.5, t: 270, r: 0.5 * 270 * RAD },
    {
      kind: 'polarGrid',
      curve: { shape: 'spiral', a: 'a' },
      point: { r: 'r', theta: 't' },
      show: 'radians',
    },
  ),
  {
    id: 'g.m12-parametric-projectile',
    title: 'A path traced as t grows',
    use: 'Use this for a projectile’s path x(t), y(t), with the point at time t.',
    assumptions: ['No air resistance; g = 9.8 m/s².', 'The launch is at t = 0 from height h.'],
    variables: [
      { id: 'v', symbol: 'v', name: 'Launch speed (m/s)', min: 1, max: 40, step: 0.1 },
      { ...angle('a', 'Launch angle', 0, 90), step: 1 },
      { id: 'h', symbol: 'h', name: 'Launch height (m)', min: 0, max: 50, step: 0.1 },
      PATH_T,
      { id: 'x', symbol: 'x', name: 'Distance across (m)', min: 0, max: 200, step: 0.01 },
      { id: 'y', symbol: 'y', name: 'Height (m)', min: -500, max: 100, step: 0.01 },
    ],
    ...rules(
      {
        relation: {
          id: 'x = v cos α · t',
          display: '{x} = {v} × cos({a}) × {t}',
          vars: ['x', 'v', 'a', 't'],
          residual: (v) => v.x! - v.v! * Math.cos(v.a! * RAD) * v.t!,
          solve: {
            x: (v) => v.v! * Math.cos(v.a! * RAD) * v.t!,
            t: (v) => div(v.x!, v.v! * Math.cos(v.a! * RAD)),
            v: (v) => div(v.x!, Math.cos(v.a! * RAD) * v.t!),
            a: () => undefined,
          },
        },
        steps: {
          x: { expr: '{v} × cos({a}) × {t}', how: 'Across, the speed stays v cos α.' },
          t: {
            expr: '{x}/(cos({a}) × {v})',
            how: 'Divide the distance across by the speed across.',
          },
          v: { expr: '{x}/(cos({a}) × {t})', how: 'Divide the distance across by cos α times t.' },
        },
      },
      {
        relation: {
          id: 'y = h + v sin α · t − 4.9t²',
          display: '{y} = {h} + {v} × sin({a}) × {t} − 4.9 × {t}²',
          vars: ['y', 'h', 'v', 'a', 't'],
          residual: (v) => v.y! - v.h! - v.v! * Math.sin(v.a! * RAD) * v.t! + 4.9 * v.t! ** 2,
          solve: {
            y: (v) => v.h! + v.v! * Math.sin(v.a! * RAD) * v.t! - 4.9 * v.t! ** 2,
            h: (v) => v.y! - v.v! * Math.sin(v.a! * RAD) * v.t! + 4.9 * v.t! ** 2,
            v: () => undefined,
            a: () => undefined,
            t: () => undefined,
          },
        },
        steps: {
          y: {
            expr: '{h} + {v} × sin({a}) × {t} − 4.9 × {t}²',
            how: 'Up, the start height, plus v sin α each second, less the fall ½gt².',
          },
          h: {
            expr: '{y} − {v} × sin({a}) × {t} + 4.9 × {t}²',
            how: 'Undo the climb and the fall from the height at t.',
          },
        },
      },
    ),
    example: {
      v: 20,
      a: 40,
      h: 1.5,
      t: 1.2,
      x: 20 * Math.cos(40 * RAD) * 1.2,
      y: 1.5 + 20 * Math.sin(40 * RAD) * 1.2 - 4.9 * 1.44,
    },
    startWith: ['t', 'v', 'a', 'h'],
    representation: {
      kind: 'polarGrid',
      parametric: {
        family: 'projectile',
        v: 'v',
        angle: 'a',
        y0: 'h',
        t: 't',
        range: [0, 2.7],
        x: 'x',
        y: 'y',
      },
    },
  },
  {
    id: 'g.m12-parametric-line',
    title: 'A line traced by a parameter',
    use: 'Use this for a line x = x₀ + at, y = y₀ + bt, and which way it runs.',
    assumptions: ['t runs from −2 to 4.', 'The arrows show the way the point moves as t grows.'],
    variables: [
      real('p', 'x₀', 'Start x', -10, 10),
      real('q', 'y₀', 'Start y', -10, 10),
      real('a', 'a', 'x change per unit of t', -5, 5),
      real('b', 'b', 'y change per unit of t', -5, 5),
      { id: 't', symbol: 't', name: 'Parameter t', min: -2, max: 4, step: 0.1 },
      real('x', 'x', 'x at t', -50, 50),
      real('y', 'y', 'y at t', -50, 50),
    ],
    ...rules(
      {
        relation: {
          id: 'x = x₀ + at',
          display: '{x} = {p} + {a} × {t}',
          vars: ['x', 'p', 'a', 't'],
          residual: (v) => v.x! - v.p! - v.a! * v.t!,
          solve: {
            x: (v) => v.p! + v.a! * v.t!,
            p: (v) => v.x! - v.a! * v.t!,
            t: (v) => div(v.x! - v.p!, v.a!),
            a: (v) => div(v.x! - v.p!, v.t!),
          },
        },
        steps: {
          x: { expr: '{p} + {a} × {t}', how: 'Start at x₀ and move a for each unit of t.' },
          p: { expr: '{x} − {a} × {t}', how: 'Take the move from x.' },
          t: { expr: '({x} − {p})/{a}', how: 'The move across divided by a gives t.' },
          a: { expr: '({x} − {p})/{t}', how: 'The move across divided by t gives a.' },
        },
      },
      {
        relation: {
          id: 'y = y₀ + bt',
          display: '{y} = {q} + {b} × {t}',
          vars: ['y', 'q', 'b', 't'],
          residual: (v) => v.y! - v.q! - v.b! * v.t!,
          solve: {
            y: (v) => v.q! + v.b! * v.t!,
            q: (v) => v.y! - v.b! * v.t!,
            b: (v) => div(v.y! - v.q!, v.t!),
          },
        },
        steps: {
          y: { expr: '{q} + {b} × {t}', how: 'Start at y₀ and move b for each unit of t.' },
          q: { expr: '{y} − {b} × {t}', how: 'Take the move from y.' },
          b: { expr: '({y} − {q})/{t}', how: 'The move up divided by t gives b.' },
        },
      },
    ),
    example: { p: 1, q: 3, a: 2, b: -1, t: 1.5, x: 4, y: 1.5 },
    startWith: ['t', 'p', 'q', 'a', 'b'],
    representation: {
      kind: 'polarGrid',
      parametric: {
        family: 'line',
        x0: 'p',
        y0: 'q',
        a: 'a',
        b: 'b',
        t: 't',
        range: [-2, 4],
        x: 'x',
        y: 'y',
      },
    },
  },
  {
    id: 'g.m12-parametric-ellipse',
    title: 'An ellipse traced by an angle',
    use: 'Use this for x = a cos t, y = b sin t: an ellipse traced counterclockwise.',
    assumptions: ['t is an angle in degrees, from 0° to 360°.', 'a = b makes a circle.'],
    variables: [
      real('a', 'a', 'Half-width a', 0.5, 10),
      real('b', 'b', 'Half-height b', 0.5, 10),
      { ...angle('t', 'Parameter t', 0, 360), symbol: 't', step: 1 },
      real('x', 'x', 'x at t'),
      real('y', 'y', 'y at t'),
    ],
    ...rules(component('x', 'a', 't', 'cos'), component('y', 'b', 't', 'sin')),
    example: { a: 4, b: 2, t: 60, x: 2, y: 2 * Math.sin(60 * RAD) },
    startWith: ['a', 'b', 't'],
    representation: {
      kind: 'polarGrid',
      parametric: {
        family: 'ellipse',
        h: 0,
        k: 0,
        a: 'a',
        b: 'b',
        t: 't',
        range: [0, 360],
        x: 'x',
        y: 'y',
      },
    },
  },
];

// ─── H11 conicGraph ──────────────────────────────────────────────────────────

/** A circle through a point: r = √((x − h)² + (y − k)²). */
const circleEquationDemo = (id: string, title: string, example: Values): ModuleDef => ({
  id,
  title,
  use: 'Use this for the equation of a circle from its center and a point on it.',
  assumptions: ['(x − h)² + (y − k)² = r²: every point is r from the center (h, k).'],
  variables: [
    real('h', 'h', 'Center, x', -10, 10),
    real('k', 'k', 'Center, y', -10, 10),
    real('x', 'x', 'Point, x', -20, 20),
    real('y', 'y', 'Point, y', -20, 20),
    real('r', 'r', 'Radius', 0, 30),
  ],
  ...rules({
    relation: {
      id: 'r = √((x − h)² + (y − k)²)',
      display: '{r} = √(({x} − {h})² + ({y} − {k})²)',
      vars: ['r', 'x', 'h', 'y', 'k'],
      residual: (v) => v.r! - Math.hypot(v.x! - v.h!, v.y! - v.k!),
      solve: {
        r: (v) => Math.hypot(v.x! - v.h!, v.y! - v.k!),
        y: (v) => {
          const d = v.r! ** 2 - (v.x! - v.h!) ** 2;
          return d < 0 ? [NaN] : [v.k! + Math.sqrt(d), v.k! - Math.sqrt(d)];
        },
        x: (v) => {
          const d = v.r! ** 2 - (v.y! - v.k!) ** 2;
          return d < 0 ? [NaN] : [v.h! + Math.sqrt(d), v.h! - Math.sqrt(d)];
        },
        h: () => undefined,
        k: () => undefined,
      },
    },
    steps: {
      r: {
        expr: '√(({x} − {h})² + ({y} − {k})²)',
        how: 'The radius is the distance from the center to the point.',
      },
      y: { expr: '{k} ± √({r}² − ({x} − {h})²)', how: 'Solve the circle’s equation for y.' },
      x: { expr: '{h} ± √({r}² − ({y} − {k})²)', how: 'Solve the circle’s equation for x.' },
    },
  }),
  example,
  startWith: ['h', 'k', 'x', 'y'],
  representation: {
    kind: 'conicGraph',
    conic: 'circle',
    h: 'h',
    k: 'k',
    r: 'r',
    point: { x: 'x', y: 'y' },
  },
});

/** A parabola from its vertex and p, with a point on it: y = k + (x − h)²/(4p). */
const parabolaDemo = (
  id: string,
  title: string,
  axis: 'vertical' | 'horizontal',
  example: Values,
): ModuleDef => {
  const v = axis === 'vertical';
  return {
    id,
    title,
    use: v
      ? 'Use this for a parabola (x − h)² = 4p(y − k): its focus and directrix.'
      : 'Use this for a parabola (y − k)² = 4p(x − h) that opens left or right.',
    assumptions: [
      'The focus is p from the vertex, the directrix p on the other side.',
      v ? 'p > 0 opens up; p < 0 opens down.' : 'p > 0 opens right; p < 0 opens left.',
    ],
    variables: [
      real('h', 'h', 'Vertex, x', -10, 10),
      real('k', 'k', 'Vertex, y', -10, 10),
      real('p', 'p', 'Vertex to focus', -10, 10),
      real('f', 'F', v ? 'Focus, y' : 'Focus, x', -20, 20),
      real('d', 'd', 'Directrix', -20, 20),
      real('u', v ? 'x' : 'y', v ? 'Point, x' : 'Point, y', -20, 20),
      real('w', v ? 'y' : 'x', v ? 'Point, y' : 'Point, x', -200, 200),
    ],
    ...rules(
      {
        relation: {
          id: 'F = vertex + p',
          display: v ? '{f} = {k} + {p}' : '{f} = {h} + {p}',
          vars: ['f', v ? 'k' : 'h', 'p'],
          residual: (x) => x.f! - (v ? x.k! : x.h!) - x.p!,
          solve: {
            f: (x) => (v ? x.k! : x.h!) + x.p!,
            p: (x) => x.f! - (v ? x.k! : x.h!),
            [v ? 'k' : 'h']: (x) => x.f! - x.p!,
          },
        },
        steps: {
          f: {
            expr: v ? '{k} + {p}' : '{h} + {p}',
            how: 'The focus is p from the vertex along the axis.',
          },
          p: { expr: v ? '{f} − {k}' : '{f} − {h}', how: 'p is the vertex-to-focus distance.' },
          [v ? 'k' : 'h']: { expr: '{f} − {p}', how: 'Step back p from the focus.' },
        },
      },
      {
        relation: {
          id: 'd = vertex − p',
          display: v ? '{d} = {k} − {p}' : '{d} = {h} − {p}',
          vars: ['d', v ? 'k' : 'h', 'p'],
          residual: (x) => x.d! - (v ? x.k! : x.h!) + x.p!,
          solve: {
            d: (x) => (v ? x.k! : x.h!) - x.p!,
            p: (x) => (v ? x.k! : x.h!) - x.d!,
            [v ? 'k' : 'h']: (x) => x.d! + x.p!,
          },
        },
        steps: {
          d: {
            expr: v ? '{k} − {p}' : '{h} − {p}',
            how: 'The directrix is p from the vertex, away from the focus.',
          },
          p: { expr: v ? '{k} − {d}' : '{h} − {d}', how: 'p is the directrix-to-vertex distance.' },
          [v ? 'k' : 'h']: { expr: '{d} + {p}', how: 'Step p from the directrix to the vertex.' },
        },
      },
      {
        relation: {
          id: 'point on the parabola',
          display: v ? '{w} = {k} + ({u} − {h})²/(4 × {p})' : '{w} = {h} + ({u} − {k})²/(4 × {p})',
          vars: ['w', 'u', 'h', 'k', 'p'],
          residual: (x) => x.w! - (v ? x.k! : x.h!) - (x.u! - (v ? x.h! : x.k!)) ** 2 / (4 * x.p!),
          solve: {
            w: (x) =>
              x.p === 0
                ? undefined
                : (v ? x.k! : x.h!) + (x.u! - (v ? x.h! : x.k!)) ** 2 / (4 * x.p!),
            u: () => undefined,
            h: () => undefined,
            k: () => undefined,
            p: () => undefined,
          },
        },
        steps: {
          w: {
            expr: v ? '{k} + ({u} − {h})²/(4 × {p})' : '{h} + ({u} − {k})²/(4 × {p})',
            how: 'Solve the parabola’s equation for the other coordinate.',
          },
        },
      },
    ),
    example,
    startWith: ['h', 'k', 'p', 'u'],
    representation: {
      kind: 'conicGraph',
      conic: 'parabola',
      axis,
      h: 'h',
      k: 'k',
      p: 'p',
      c: 'p',
      point: v ? { x: 'u', y: 'w' } : { x: 'w', y: 'u' },
    },
    pictureLabels: ['f', 'd'],
  };
};

/** An ellipse or hyperbola centered at the origin: c from a and b. */
const focalDemo = (
  id: string,
  title: string,
  conic: 'ellipse' | 'hyperbola',
  axis: 'horizontal' | 'vertical',
  example: Values,
): ModuleDef => {
  const e = conic === 'ellipse';
  // An ellipse whose b is longer has its foci up and down: c² = b² − a².
  const tall = e && axis === 'vertical';
  // (The long axis must stay the long one: the other way round has no c here, NaN.)
  const f = (x: Values) =>
    e ? Math.sqrt(tall ? x.b! ** 2 - x.a! ** 2 : x.a! ** 2 - x.b! ** 2) : Math.hypot(x.a!, x.b!);
  const display = e
    ? tall
      ? '{c} = √({b}² − {a}²)'
      : '{c} = √({a}² − {b}²)'
    : '{c} = √({a}² + {b}²)';
  return {
    id,
    title,
    use: e
      ? 'Use this for an ellipse x²/a² + y²/b² = 1: its axes and foci.'
      : 'Use this for a hyperbola: its vertices, asymptotes and foci.',
    assumptions: e
      ? [
          'Centered at the origin.',
          tall ? 'b > a: the long axis is up and down.' : 'a > b: the long axis is across.',
        ]
      : [
          'Centered at the origin.',
          axis === 'vertical'
            ? 'It opens up and down: y²/a² − x²/b² = 1.'
            : 'It opens left and right: x²/a² − y²/b² = 1.',
        ],
    variables: [
      real('a', 'a', e ? 'Half-width a' : 'Center to vertex a', 0.5, 10),
      real('b', 'b', e ? 'Half-height b' : 'Half the box b', 0.5, 10),
      real('c', 'c', 'Center to focus c', 0, 15),
    ],
    ...rules({
      relation: {
        id: display.replace(/[{}]/g, ''),
        display,
        vars: ['c', 'a', 'b'],
        residual: (x) => x.c! - f(x),
        solve: {
          c: f,
          ...(e
            ? tall
              ? {
                  b: (x: Values) => Math.hypot(x.c!, x.a!),
                  a: (x: Values) => (x.b! < x.c! ? undefined : Math.sqrt(x.b! ** 2 - x.c! ** 2)),
                }
              : {
                  a: (x: Values) => Math.hypot(x.c!, x.b!),
                  b: (x: Values) => (x.a! < x.c! ? undefined : Math.sqrt(x.a! ** 2 - x.c! ** 2)),
                }
            : {
                a: (x: Values) => (x.c! < x.b! ? undefined : Math.sqrt(x.c! ** 2 - x.b! ** 2)),
                b: (x: Values) => (x.c! < x.a! ? undefined : Math.sqrt(x.c! ** 2 - x.a! ** 2)),
              }),
        },
      },
      steps: e
        ? tall
          ? {
              c: {
                expr: '√({b}² − {a}²)',
                how: 'For an ellipse, c² is the difference of the squares.',
              },
              b: { expr: '√({c}² + {a}²)', how: 'The long half-axis squared is c² + a².' },
              a: { expr: '√({b}² − {c}²)', how: 'The short half-axis squared is b² − c².' },
            }
          : {
              c: {
                expr: '√({a}² − {b}²)',
                how: 'For an ellipse, c² is the difference of the squares.',
              },
              a: { expr: '√({c}² + {b}²)', how: 'The long half-axis squared is c² + b².' },
              b: { expr: '√({a}² − {c}²)', how: 'The short half-axis squared is a² − c².' },
            }
        : {
            c: { expr: '√({a}² + {b}²)', how: 'For a hyperbola, c² is the sum of the squares.' },
            a: { expr: '√({c}² − {b}²)', how: 'Take b² from c².' },
            b: { expr: '√({c}² − {a}²)', how: 'Take a² from c².' },
          },
    }),
    example,
    startWith: ['a', 'b'],
    representation: {
      kind: 'conicGraph',
      conic,
      a: 'a',
      b: 'b',
      c: 'c',
      ...(conic === 'hyperbola' ? { axis } : {}),
    } as ModuleDef['representation'],
  };
};

const CONICS: ModuleDef[] = [
  circleEquationDemo('g.m10-circle-equations-center', 'A circle from its center and a point', {
    h: 2,
    k: -1,
    x: 5,
    y: 3,
    r: 5,
  }),
  circleEquationDemo('g.m10-circle-equations-origin', 'A large circle at the origin', {
    h: 0,
    k: 0,
    x: -6,
    y: 8,
    r: 10,
  }),
  parabolaDemo('g.m12-conics-parabola', 'A parabola’s focus and directrix', 'vertical', {
    h: 1,
    k: -2,
    p: 1.5,
    f: -0.5,
    d: -3.5,
    u: 4,
    w: -2 + 9 / 6,
  }),
  parabolaDemo('g.m12-conics-parabola-left', 'A parabola opening left', 'horizontal', {
    h: 2,
    k: 1,
    p: -1,
    f: 1,
    d: 3,
    u: 3,
    w: 2 - 4 / 4,
  }),
  focalDemo('g.m12-conics-ellipse', 'An ellipse and its foci', 'ellipse', 'horizontal', {
    a: 5,
    b: 3,
    c: 4,
  }),
  focalDemo('g.m12-conics-ellipse-tall', 'A tall ellipse', 'ellipse', 'vertical', {
    a: 2,
    b: 4,
    c: Math.sqrt(12),
  }),
  focalDemo('g.m12-conics-hyperbola', 'A hyperbola and its asymptotes', 'hyperbola', 'horizontal', {
    a: 3,
    b: 4,
    c: 5,
  }),
  focalDemo(
    'g.m12-conics-hyperbola-vertical',
    'A hyperbola opening up and down',
    'hyperbola',
    'vertical',
    {
      a: 2,
      b: 3,
      c: Math.sqrt(13),
    },
  ),
];

const CONE_LAYOUT: LayoutDef = {
  id: 'g.m12-conics-cone',
  title: 'Cutting a double cone',
  kind: 'explore',
  assumptions: ['Two cones meet tip to tip.', 'A flat plane cuts through them.'],
  figure: { kind: 'doubleCone' },
  scenes: [
    { label: 'Circle', cone: 'circle', lines: ['A level plane cuts a circle.'] },
    {
      label: 'Ellipse',
      cone: 'ellipse',
      lines: ['Tilt the plane, less steep than the cone’s side: an ellipse.'],
    },
    {
      label: 'Parabola',
      cone: 'parabola',
      lines: ['Tilt it as steep as the side: the curve never closes. A parabola.'],
    },
    {
      label: 'Hyperbola',
      cone: 'hyperbola',
      lines: ['Steeper still, the plane cuts both cones: the two branches of a hyperbola.'],
    },
  ],
};

export const HSD_GALLERY_MODULES: ModuleDef[] = [
  ...UNIT_CIRCLE,
  ...ALGEBRA_TILES,
  ...VECTORS,
  ...COMPLEX,
  ...POLAR,
  ...CONICS,
];
export const HSD_GALLERY_LAYOUTS: LayoutDef[] = [CONE_LAYOUT];
