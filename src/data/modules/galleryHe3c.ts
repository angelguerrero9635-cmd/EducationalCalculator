/**
 * College gallery demos, round 3, group C (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC53: `polarGrid` areas, regions, tangent and the cycloid (calc-2#5, calc-3#2).
 * HC54: `rightTriangle` rates and `curvedSolid` fill and slab (calc-1#2, calc-2#2).
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

type Solver = (v: Values) => number | number[] | undefined;
type Rule = { relation: Relation; steps: Record<string, StepText> };

/** A finite value, or nothing. */
const fin = (x: number) => (Number.isFinite(x) ? x : undefined);
const div = (a: number, b: number) => (b === 0 ? undefined : fin(a / b));
/** √x, or nothing below 0. */
const root = (x: number) => (x < 0 ? undefined : Math.sqrt(x));
const RAD = Math.PI / 180;

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

/** a ≤ b, checked only (a page limit); `why` is the reason a conflict is refused. */
const atMost = (a: string, b: string, display: string, why: string): Rule => ({
  relation: {
    id: `${a} ≤ ${b}`,
    constraint: true,
    display,
    vars: [a, b],
    residual: (v: Values) => (v[a]! <= v[b]! * (1 + 1e-9) ? 0 : 1),
    solve: {},
    message: () => why,
  },
  steps: {},
});

// ─── HC53: polarGrid areas, regions, tangent, cycloid ─────────────────────────

/** calc-2#5~polar-area: the area inside r = a + b cos θ, A = π(a² + b²/2). */
const polarArea = page({
  id: 'g.he-polarGrid-area',
  title: 'Area inside a limaçon',
  use: 'Use this for “Find the area inside r = 2 + 2 cos θ.”',
  assumptions: [
    'a ≥ |b| > 0, so r never goes negative and one turn traces the curve once.',
    'A = ½∫ r² dθ from 0 to 2π; the cos θ term integrates to 0 over a full turn.',
    'θ is shown in degrees on the grid and taken in radians inside the integral.',
  ],
  variables: [
    num('a', 'a', 'Constant term', undefined, 0.1, 50, { step: 0.1 }),
    num('b', 'b', 'Cosine coefficient', undefined, 0, 50, { step: 0.1 }),
    num('A', 'A', 'Area enclosed', undefined, 0, 1e5),
  ],
  rules: [
    rule(
      'A = π(a² + b²/2)',
      '{A} = π × ({a}² + {b}² ÷ 2)',
      ['A', 'a', 'b'],
      (v) => v.A! - Math.PI * (v.a! ** 2 + v.b! ** 2 / 2),
      {
        A: [
          (v) => Math.PI * (v.a! ** 2 + v.b! ** 2 / 2),
          'π × ({a}² + {b}² ÷ 2)',
          'Square r and integrate over a full turn: a² gives 2πa², b² cos² θ gives πb², and half of it is the area.',
        ],
        a: [
          (v) => root(v.A! / Math.PI - v.b! ** 2 / 2),
          '√({A} ÷ π − {b}² ÷ 2)',
          'Divide the area by π, take away b²/2, then take the square root.',
        ],
        b: [
          (v) => root(2 * (v.A! / Math.PI - v.a! ** 2)),
          '√(2 × ({A} ÷ π − {a}²))',
          'Divide the area by π, take away a², double it, then take the square root.',
        ],
      },
    ),
  ],
  example: { a: 2, b: 2, A: 6 * Math.PI },
  startWith: ['a', 'b'],
  representation: {
    kind: 'polarGrid',
    curve: { shape: 'cardioid', a: 'a', b: 'b' },
    area: { from: 0, to: 360, value: 'A' },
  },
});

/** The edge: one petal of a rose, swept from −90°/n to 90°/n, A = πa²/(4n). */
const polarPetal = page({
  id: 'g.he-polarGrid-petal',
  title: 'Area of one rose petal',
  use: 'Use this for “Find the area of one petal of r = 3 cos 3θ.”',
  assumptions: [
    'r = a cos(nθ): a petal runs between the zeros of cos(nθ) on either side of θ = 0.',
    'A = ½∫ a² cos²(nθ) dθ over the petal; the cos(2nθ) part integrates to 0.',
  ],
  variables: [
    num('a', 'a', 'Petal length', undefined, 0.1, 50, { step: 0.1 }),
    num('n', 'n', 'Frequency', undefined, 1, 12, { step: 1, integer: true }),
    num('al', 'α', 'Petal start', '°', -90, -7.5, { derived: true }),
    num('be', 'β', 'Petal end', '°', 7.5, 90, { derived: true }),
    num('A', 'A', 'Petal area', undefined, 0, 1e4),
  ],
  rules: [
    rule('α = −90° ÷ n', '{al} = −90 ÷ {n}', ['al', 'n'], (v) => v.al! * v.n! + 90, {
      al: [(v) => div(-90, v.n!), '−90 ÷ {n}', 'cos(nθ) first reaches 0 below θ = 0 at nθ = −90°.'],
    }),
    rule('β = 90° ÷ n', '{be} = 90 ÷ {n}', ['be', 'n'], (v) => v.be! * v.n! - 90, {
      be: [(v) => div(90, v.n!), '90 ÷ {n}', 'cos(nθ) next reaches 0 above θ = 0 at nθ = 90°.'],
      n: [
        (v) => div(90, v.be!),
        '90 ÷ {be}',
        'The petal’s half-width is 90° ÷ n, so divide 90° by it.',
      ],
    }),
    rule(
      'A = πa²/(4n)',
      '{A} = π × {a}² ÷ (4 × {n})',
      ['A', 'a', 'n'],
      (v) => v.A! * 4 * v.n! - Math.PI * v.a! ** 2,
      {
        A: [
          (v) => div(Math.PI * v.a! ** 2, 4 * v.n!),
          'π × {a}² ÷ (4 × {n})',
          'Half of a² times the petal’s width in radians, π/n, halved again by the average of cos².',
        ],
        a: [
          (v) => root((4 * v.n! * v.A!) / Math.PI),
          '√(4 × {n} × {A} ÷ π)',
          'Multiply the area by 4n, divide by π, then take the square root.',
        ],
      },
    ),
  ],
  example: { a: 3, n: 3, al: -30, be: 30, A: (9 * Math.PI) / 12 },
  startWith: ['a', 'n'],
  representation: {
    kind: 'polarGrid',
    curve: { shape: 'rose', a: 'a', n: 'n' },
    area: { from: 'al', to: 'be', value: 'A' },
  },
});

/** calc-2#5~polar-slope: the tangent's slope on r = a + b cos θ. */
const polarSlope = page({
  id: 'g.he-polarGrid-tangent',
  title: 'Slope of a polar curve',
  use: 'Use this for “Find dy/dx on r = 1 + cos θ at θ = π/2.”',
  assumptions: [
    'x = r cos θ and y = r sin θ, so dy/dx = (dy/dθ) ÷ (dx/dθ).',
    'r′ = dr/dθ with θ in radians; the grid shows θ in degrees.',
    'The tangent is vertical where r′ cos θ − r sin θ = 0.',
  ],
  variables: [
    num('a', 'a', 'Constant term', undefined, -50, 50, { step: 0.1 }),
    num('b', 'b', 'Cosine coefficient', undefined, -50, 50, { step: 0.1 }),
    num('t', 'θ', 'Angle', '°', 0, 360, { step: 1 }),
    num('r', 'r', 'Distance from the pole', undefined, -100, 100),
    num('rp', 'r′', 'Rate dr/dθ', undefined, -50, 50),
    num('m', 'dy/dx', 'Tangent slope', undefined, -1e6, 1e6),
  ],
  rules: [
    rule(
      'r = a + b cos θ',
      '{r} = {a} + {b} × cos({t})',
      ['r', 'a', 'b', 't'],
      (v) => v.r! - v.a! - v.b! * Math.cos(v.t! * RAD),
      {
        r: [
          (v) => v.a! + v.b! * Math.cos(v.t! * RAD),
          '{a} + {b} × cos({t})',
          'Put θ into the curve’s equation.',
        ],
        a: [
          (v) => v.r! - v.b! * Math.cos(v.t! * RAD),
          '{r} − {b} × cos({t})',
          'Take the cosine term from r.',
        ],
      },
    ),
    rule(
      'r′ = −b sin θ',
      '{rp} = −{b} × sin({t})',
      ['rp', 'b', 't'],
      (v) => v.rp! + v.b! * Math.sin(v.t! * RAD),
      {
        rp: [
          (v) => -v.b! * Math.sin(v.t! * RAD),
          '−{b} × sin({t})',
          'The derivative of cos θ is −sin θ; the constant a drops out.',
        ],
        b: [(v) => div(-v.rp!, Math.sin(v.t! * RAD)), '−{rp} ÷ sin({t})', 'Divide r′ by −sin θ.'],
      },
    ),
    rule(
      'dy/dx = (r′ sin θ + r cos θ) ÷ (r′ cos θ − r sin θ)',
      '{m} = ({rp} × sin({t}) + {r} × cos({t})) ÷ ({rp} × cos({t}) − {r} × sin({t}))',
      ['m', 'rp', 'r', 't'],
      (v) => {
        const [s, c] = [Math.sin(v.t! * RAD), Math.cos(v.t! * RAD)];
        return v.m! * (v.rp! * c - v.r! * s) - (v.rp! * s + v.r! * c);
      },
      {
        m: [
          (v) => {
            const [s, c] = [Math.sin(v.t! * RAD), Math.cos(v.t! * RAD)];
            return div(v.rp! * s + v.r! * c, v.rp! * c - v.r! * s);
          },
          '({rp} × sin({t}) + {r} × cos({t})) ÷ ({rp} × cos({t}) − {r} × sin({t}))',
          'Differentiate y = r sin θ and x = r cos θ by the product rule, then divide dy/dθ by dx/dθ.',
        ],
      },
    ),
  ],
  example: { a: 1, b: 1, t: 90, r: 1, rp: -1, m: 1 },
  startWith: ['a', 'b', 't'],
  representation: {
    kind: 'polarGrid',
    curve: { shape: 'cardioid', a: 'a', b: 'b' },
    point: { r: 'r', theta: 't' },
    tangent: { slope: 'm' },
  },
});

/**
 * calc-3#2~polar: ∬ (x² + y²) dA over r₁ ≤ r ≤ r₂, α ≤ θ ≤ β = (β − α)(r₂⁴ − r₁⁴)/4.
 * `sector` makes α a value too (a part turn); otherwise α = 0.
 */
function polarRegion(id: string, title: string, use: string, sector: boolean, ex: Values) {
  const al = (v: Values) => (sector ? v.al! : 0);
  const span = (v: Values) => (v.be! - al(v)) * RAD;
  const less = sector ? '({be} − {al})' : '{be}';
  return page({
    id,
    title,
    use,
    assumptions: [
      'dA = r dr dθ, so x² + y² = r² makes the integrand r³.',
      'The inner integral over r gives (r₂⁴ − r₁⁴)/4; the outer over θ multiplies by β − α in radians.',
      ...(sector ? [] : ['The region starts at α = 0.']),
    ],
    variables: [
      num('r1', 'r₁', 'Inner radius', undefined, 0, 100, { step: 0.1 }),
      num('r2', 'r₂', 'Outer radius', undefined, 0.1, 100, { step: 0.1 }),
      ...(sector ? [num('al', 'α', 'Start angle', '°', 0.1, 360, { step: 1 })] : []),
      num('be', 'β', 'End angle', '°', 0.1, 720, { step: 1 }),
      num('I', 'I', 'Integral of x² + y²', undefined, 0, 1e9),
      num('A', 'A', 'Region area', undefined, 0, 1e6),
    ],
    rules: [
      rule(
        'I = (β − α)(r₂⁴ − r₁⁴)/4',
        `{I} = ${less} × π ÷ 180 × ({r2}⁴ − {r1}⁴) ÷ 4`,
        ['I', 'r1', 'r2', 'be', ...(sector ? ['al'] : [])],
        (v) => v.I! - (span(v) * (v.r2! ** 4 - v.r1! ** 4)) / 4,
        {
          I: [
            (v) => (span(v) * (v.r2! ** 4 - v.r1! ** 4)) / 4,
            `${less} × π ÷ 180 × ({r2}⁴ − {r1}⁴) ÷ 4`,
            'Integrate r³ from r₁ to r₂, then multiply by the angle swept in radians.',
          ],
          r2: [
            (v) => {
              const q = v.r1! ** 4 + div(4 * v.I!, span(v))!;
              return q < 0 ? undefined : q ** 0.25;
            },
            `∜({r1}⁴ + 4 × {I} ÷ (${less} × π ÷ 180))`,
            'Divide 4I by the angle in radians, add r₁⁴, then take the fourth root.',
          ],
        },
      ),
      rule(
        'A = ½(β − α)(r₂² − r₁²)',
        `{A} = ½ × ${less} × π ÷ 180 × ({r2}² − {r1}²)`,
        ['A', 'r1', 'r2', 'be', ...(sector ? ['al'] : [])],
        (v) => v.A! - 0.5 * span(v) * (v.r2! ** 2 - v.r1! ** 2),
        {
          A: [
            (v) => 0.5 * span(v) * (v.r2! ** 2 - v.r1! ** 2),
            `½ × ${less} × π ÷ 180 × ({r2}² − {r1}²)`,
            'Integrate r dr from r₁ to r₂, then multiply by the angle swept in radians.',
          ],
          r1: [
            (v) => root(v.r2! ** 2 - div(2 * v.A!, span(v))!),
            `√({r2}² − 2 × {A} ÷ (${less} × π ÷ 180))`,
            'Take 2A over the angle in radians from r₂², then take the square root.',
          ],
        },
      ),
    ],
    example: ex,
    startWith: ['r1', 'r2', ...(sector ? ['al'] : []), 'be'],
    representation: {
      kind: 'polarGrid',
      region: { r1: 'r1', r2: 'r2', from: sector ? 'al' : 0, to: 'be', area: 'A' },
    },
  });
}

/** calc-2#5~cycloid-arc: x = r(t − sin t), y = r(1 − cos t), L = 4r(1 − cos(T/2)). */
function cycloid(id: string, title: string, use: string, ex: Values) {
  return page({
    id,
    title,
    use,
    assumptions: [
      'A circle of radius r rolls along the x-axis; t is the angle it has turned, in radians.',
      'Speed: √(x′² + y′²) = 2r sin(t/2) for 0 ≤ t ≤ 2π, so L = ∫ 2r sin(t/2) dt.',
      'One arch is 0 ≤ T ≤ 2π.',
    ],
    variables: [
      num('r', 'r', 'Rolling radius', undefined, 0.1, 100, { step: 0.1 }),
      num('T', 'T', 'Turn at the end', undefined, 0.01, 6.2832, { step: 0.01 }),
      num('x', 'x', 'x at T', undefined, 0, 1e4),
      num('y', 'y', 'y at T', undefined, 0, 1e4),
      num('L', 'L', 'Arc length', undefined, 0, 1e4),
    ],
    rules: [
      rule(
        'x = r(t − sin t)',
        '{x} = {r} × ({T} − sin({T}))',
        ['x', 'r', 'T'],
        (v) => v.x! - v.r! * (v.T! - Math.sin(v.T!)),
        {
          x: [
            (v) => v.r! * (v.T! - Math.sin(v.T!)),
            '{r} × ({T} − sin({T}))',
            'The center has rolled rT; the point sits r sin T behind it.',
          ],
        },
      ),
      rule(
        'y = r(1 − cos t)',
        '{y} = {r} × (1 − cos({T}))',
        ['y', 'r', 'T'],
        (v) => v.y! - v.r! * (1 - Math.cos(v.T!)),
        {
          y: [
            (v) => v.r! * (1 - Math.cos(v.T!)),
            '{r} × (1 − cos({T}))',
            'The center is r up; the point sits r cos T below it.',
          ],
        },
      ),
      rule(
        'L = 4r(1 − cos(T/2))',
        '{L} = 4 × {r} × (1 − cos({T} ÷ 2))',
        ['L', 'r', 'T'],
        (v) => v.L! - 4 * v.r! * (1 - Math.cos(v.T! / 2)),
        {
          L: [
            (v) => 4 * v.r! * (1 - Math.cos(v.T! / 2)),
            '4 × {r} × (1 − cos({T} ÷ 2))',
            'Integrate the speed 2r sin(t/2) from 0 to T.',
          ],
          r: [
            (v) => div(v.L!, 4 * (1 - Math.cos(v.T! / 2))),
            '{L} ÷ (4 × (1 − cos({T} ÷ 2)))',
            'Divide the length by 4(1 − cos(T/2)).',
          ],
          T: [
            (v) => {
              const c = 1 - div(v.L!, 4 * v.r!)!;
              return c < -1 || c > 1 ? undefined : 2 * Math.acos(c);
            },
            '2 × cos⁻¹(1 − {L} ÷ (4 × {r}))',
            'Solve 1 − cos(T/2) = L ÷ 4r for T/2, then double it.',
          ],
        },
      ),
    ],
    example: ex,
    startWith: ['r', 'T'],
    representation: {
      kind: 'polarGrid',
      parametric: {
        family: 'cycloid',
        r: 'r',
        t: 'T',
        range: [0, 2 * Math.PI],
        x: 'x',
        y: 'y',
        radians: true,
        length: 'L',
      },
    },
  });
}

const cyc = (r: number, T: number) => ({
  r,
  T,
  x: r * (T - Math.sin(T)),
  y: r * (1 - Math.cos(T)),
  L: 4 * r * (1 - Math.cos(T / 2)),
});

const HC53: ModuleDef[] = [
  polarArea,
  polarPetal,
  polarSlope,
  polarRegion(
    'g.he-polarGrid-region',
    'Integral over a polar ring',
    'Use this for “Evaluate ∬ (x² + y²) dA over 1 ≤ r ≤ 2.”',
    false,
    { r1: 1, r2: 2, be: 360, I: 7.5 * Math.PI, A: 3 * Math.PI },
  ),
  polarRegion(
    'g.he-polarGrid-sector',
    'Integral over a polar sector',
    'Use this for “Evaluate ∬ (x² + y²) dA over 1 ≤ r ≤ 3, π/6 ≤ θ ≤ 2π/3.”',
    true,
    { r1: 1, r2: 3, al: 30, be: 120, I: 10 * Math.PI, A: 2 * Math.PI },
  ),
  cycloid(
    'g.he-polarGrid-cycloid',
    'Length of a cycloid arch',
    'Use this for “Find the length of one arch of x = t − sin t, y = 1 − cos t.”',
    cyc(1, 2 * Math.PI),
  ),
  cycloid(
    'g.he-polarGrid-cycloid-part',
    'Length of part of a cycloid',
    'Use this for “Find the length of x = 2(t − sin t), y = 2(1 − cos t) from t = 0 to π.”',
    cyc(2, Math.PI),
  ),
];

// ─── HC54: related rates and pumping work ────────────────────────────────────

/** calc-1#2~ladder: a ladder of length L slides; dy/dt = −x·(dx/dt) ÷ y. */
function ladder(id: string, title: string, use: string, ex: Values) {
  return page({
    id,
    title,
    use,
    assumptions: [
      'The wall is vertical and the floor level, so x² + y² = L² at every instant.',
      'L does not change, so differentiating gives x·(dx/dt) + y·(dy/dt) = 0.',
      'A negative dy/dt means the top slides down.',
    ],
    variables: [
      num('L', 'L', 'Ladder length', 'm', 0.1, 100, { step: 0.1 }),
      num('x', 'x', 'Foot from the wall', 'm', 0.01, 100, { step: 0.01 }),
      num('y', 'y', 'Top up the wall', 'm', 0.01, 100),
      num('dx', 'dx/dt', 'Foot’s speed out', 'm/s', -100, 100, { step: 0.01 }),
      num('dy', 'dy/dt', 'Top’s rate up', 'm/s', -1e4, 1e4),
    ],
    rules: [
      rule(
        'x² + y² = L²',
        '{x}² + {y}² = {L}²',
        ['x', 'y', 'L'],
        (v) => v.x! ** 2 + v.y! ** 2 - v.L! ** 2,
        {
          y: [
            (v) => root(v.L! ** 2 - v.x! ** 2),
            '√({L}² − {x}²)',
            'The ladder is the hypotenuse: take x² from L², then the root.',
          ],
          x: [
            (v) => root(v.L! ** 2 - v.y! ** 2),
            '√({L}² − {y}²)',
            'Take y² from L², then the square root.',
          ],
          L: [
            (v) => Math.hypot(v.x!, v.y!),
            '√({x}² + {y}²)',
            'Add the squares of the two legs, then the square root.',
          ],
        },
      ),
      rule(
        'x·x′ + y·y′ = 0',
        '{x} × {dx} + {y} × {dy} = 0',
        ['x', 'dx', 'y', 'dy'],
        (v) => v.x! * v.dx! + v.y! * v.dy!,
        {
          dy: [
            (v) => div(-v.x! * v.dx!, v.y!),
            '−{x} × {dx} ÷ {y}',
            'Differentiate x² + y² = L² with L fixed, then solve for dy/dt.',
          ],
          dx: [
            (v) => div(-v.y! * v.dy!, v.x!),
            '−{y} × {dy} ÷ {x}',
            'Differentiate x² + y² = L² with L fixed, then solve for dx/dt.',
          ],
        },
      ),
    ],
    example: ex,
    startWith: ['L', 'x', 'dx'],
    representation: {
      kind: 'rightTriangle',
      a: 'y',
      b: 'x',
      c: 'L',
      extent: 5,
      rates: { a: 'dy', b: 'dx' },
      scene: 'ladder',
      keep: ['dx'],
    },
  });
}

const ladderEx = (L: number, x: number, dx: number) => {
  const y = Math.sqrt(L * L - x * x);
  return { L, x, y, dx, dy: (-x * dx) / y };
};

/** calc-1#2~two-cars: cars on perpendicular roads; D′ = (x·x′ + y·y′) ÷ D. */
const twoCars = page({
  id: 'g.he-rightTriangle-cars',
  title: 'Two cars moving apart',
  use: 'Use this for “Two cars leave a crossing, one east at 60 km/h, one north at 80 km/h. How fast is the distance growing when they are 30 km and 40 km out?”',
  assumptions: [
    'The roads cross at a right angle, so D² = x² + y² at every instant.',
    'Differentiating gives D·D′ = x·x′ + y·y′.',
  ],
  variables: [
    num('x', 'x', 'East car’s distance', 'km', 0.01, 1000, { step: 0.1 }),
    num('y', 'y', 'North car’s distance', 'km', 0.01, 1000, { step: 0.1 }),
    num('vx', 'x′', 'East car’s speed', 'km/h', -300, 300, { step: 1 }),
    num('vy', 'y′', 'North car’s speed', 'km/h', -300, 300, { step: 1 }),
    num('D', 'D', 'Distance between', 'km', 0.01, 1500),
    num('vD', 'D′', 'Rate the distance grows', 'km/h', -1e3, 1e3),
  ],
  rules: [
    rule(
      'D² = x² + y²',
      '{D}² = {x}² + {y}²',
      ['D', 'x', 'y'],
      (v) => v.D! ** 2 - v.x! ** 2 - v.y! ** 2,
      {
        D: [
          (v) => Math.hypot(v.x!, v.y!),
          '√({x}² + {y}²)',
          'The cars and the crossing make a right triangle: Pythagoras.',
        ],
        x: [
          (v) => root(v.D! ** 2 - v.y! ** 2),
          '√({D}² − {y}²)',
          'Take y² from D², then the square root.',
        ],
        y: [
          (v) => root(v.D! ** 2 - v.x! ** 2),
          '√({D}² − {x}²)',
          'Take x² from D², then the square root.',
        ],
      },
    ),
    rule(
      'D·D′ = x·x′ + y·y′',
      '{D} × {vD} = {x} × {vx} + {y} × {vy}',
      ['D', 'vD', 'x', 'vx', 'y', 'vy'],
      (v) => v.D! * v.vD! - v.x! * v.vx! - v.y! * v.vy!,
      {
        vD: [
          (v) => div(v.x! * v.vx! + v.y! * v.vy!, v.D!),
          '({x} × {vx} + {y} × {vy}) ÷ {D}',
          'Differentiate D² = x² + y², then divide by D.',
        ],
        vx: [
          (v) => div(v.D! * v.vD! - v.y! * v.vy!, v.x!),
          '({D} × {vD} − {y} × {vy}) ÷ {x}',
          'Take y·y′ from D·D′, then divide by x.',
        ],
        vy: [
          (v) => div(v.D! * v.vD! - v.x! * v.vx!, v.y!),
          '({D} × {vD} − {x} × {vx}) ÷ {y}',
          'Take x·x′ from D·D′, then divide by y.',
        ],
      },
    ),
  ],
  example: { x: 30, y: 40, vx: 60, vy: 80, D: 50, vD: 100 },
  startWith: ['x', 'y', 'vx', 'vy'],
  representation: {
    kind: 'rightTriangle',
    a: 'y',
    b: 'x',
    c: 'D',
    extent: 40,
    rates: { a: 'vy', b: 'vx', c: 'vD' },
    scene: 'roads',
    keep: ['vx', 'vy', 'y'],
  },
});

/** calc-1#2~cone-tank: water into a cone on its apex; r = Rh ÷ H, dh/dt = (dV/dt) ÷ (πr²). */
function coneTank(id: string, title: string, use: string, ex: Values) {
  return page({
    id,
    title,
    use,
    assumptions: [
      'The tank is a cone on its apex: the water is a smaller cone of the same shape.',
      'Similar triangles: r ÷ h = R ÷ H.',
      'V = ⅓πr²h, so dV/dt = πr²·(dh/dt): the inflow spreads over the surface.',
    ],
    variables: [
      num('R', 'R', 'Rim radius', 'm', 0.01, 100, { step: 0.1 }),
      num('H', 'H', 'Tank height', 'm', 0.01, 100, { step: 0.1 }),
      num('h', 'h', 'Water depth', 'm', 0.01, 100, { step: 0.01 }),
      num('q', 'dV/dt', 'Inflow', 'm³/min', 0.001, 1000, { step: 0.01 }),
      num('r', 'r', 'Surface radius', 'm', 0.001, 100),
      num('dh', 'dh/dt', 'Rise rate', 'm/min', 0, 1e6),
    ],
    rules: [
      rule(
        'r = Rh/H',
        '{r} = {R} × {h} ÷ {H}',
        ['r', 'R', 'h', 'H'],
        (v) => v.r! * v.H! - v.R! * v.h!,
        {
          r: [
            (v) => div(v.R! * v.h!, v.H!),
            '{R} × {h} ÷ {H}',
            'Similar triangles: the surface radius is to the depth as R is to H.',
          ],
          h: [
            (v) => div(v.r! * v.H!, v.R!),
            '{r} × {H} ÷ {R}',
            'Similar triangles, solved for the depth.',
          ],
        },
      ),
      rule(
        'dh/dt = (dV/dt) ÷ (πr²)',
        '{dh} = {q} ÷ (π × {r}²)',
        ['dh', 'q', 'r'],
        (v) => v.dh! * Math.PI * v.r! ** 2 - v.q!,
        {
          dh: [
            (v) => div(v.q!, Math.PI * v.r! ** 2),
            '{q} ÷ (π × {r}²)',
            'The inflow spreads over the surface’s area πr².',
          ],
          q: [
            (v) => v.dh! * Math.PI * v.r! ** 2,
            '{dh} × π × {r}²',
            'Multiply the rise by the surface’s area.',
          ],
        },
      ),
      atMost('h', 'H', '{h} ≤ {H}', 'The water can’t be deeper than the tank.'),
    ],
    example: ex,
    startWith: ['R', 'H', 'h', 'q'],
    representation: {
      kind: 'curvedSolid',
      shape: 'cone',
      radius: 'R',
      height: 'H',
      extent: 4,
      fill: { depth: 'h', r: 'r', inflow: 'q', rise: 'dh' },
    },
  });
}

const coneEx = (R: number, H: number, h: number, q: number) => {
  const r = (R * h) / H;
  return { R, H, h, q, r, dh: q / (Math.PI * r * r) };
};

/** calc-2#2~pump-work: pump a full cylinder out over its top plus h; W = ρgπr²(H²/2 + hH). */
function pumping(id: string, title: string, use: string, ex: Values) {
  const work = (v: Values) => v.rho! * 9.8 * Math.PI * v.r! ** 2 * (v.H! ** 2 / 2 + v.h! * v.H!);
  return page({
    id,
    title,
    use,
    assumptions: [
      'g = 9.8 m/s². A slab dy thick at height y weighs ρgπr² dy and rises H + h − y.',
      'W = ∫ ρgπr²(H + h − y) dy from 0 to H = ρgπr²(H²/2 + hH).',
      'The tank starts full; water leaves at h above the rim.',
    ],
    variables: [
      num('r', 'r', 'Tank radius', 'm', 0.01, 100, { step: 0.1 }),
      num('H', 'H', 'Tank height', 'm', 0.01, 100, { step: 0.1 }),
      num('h', 'h', 'Outlet above the rim', 'm', 0.01, 100, { step: 0.1 }),
      num('rho', 'ρ', 'Liquid density', 'kg/m³', 1, 20000, { step: 10 }),
      num('y', 'y', 'Slab height', 'm', 0.01, 100, { step: 0.01 }),
      num('lift', 'd', 'Slab’s lift', 'm', 0, 200),
      num('W', 'W', 'Work to empty it', 'J', 0, 1e12),
    ],
    rules: [
      rule(
        'd = H + h − y',
        '{lift} = {H} + {h} − {y}',
        ['lift', 'H', 'h', 'y'],
        (v) => v.lift! - v.H! - v.h! + v.y!,
        {
          lift: [
            (v) => v.H! + v.h! - v.y!,
            '{H} + {h} − {y}',
            'The slab rises to the rim, then h more to the outlet.',
          ],
          y: [
            (v) => v.H! + v.h! - v.lift!,
            '{H} + {h} − {lift}',
            'Take the lift from the outlet’s height.',
          ],
        },
      ),
      rule(
        'W = ρgπr²(H²/2 + hH)',
        '{W} = {rho} × 9.8 × π × {r}² × ({H}² ÷ 2 + {h} × {H})',
        ['W', 'rho', 'r', 'H', 'h'],
        (v) => v.W! - work(v),
        {
          W: [
            work,
            '{rho} × 9.8 × π × {r}² × ({H}² ÷ 2 + {h} × {H})',
            'Add up each slab’s weight times its lift from the bottom to the top.',
          ],
          rho: [
            (v) => div(v.W!, 9.8 * Math.PI * v.r! ** 2 * (v.H! ** 2 / 2 + v.h! * v.H!)),
            '{W} ÷ (9.8 × π × {r}² × ({H}² ÷ 2 + {h} × {H}))',
            'Divide the work by g, πr² and the lift integral.',
          ],
          h: [
            (v) => {
              const k = div(v.W!, v.rho! * 9.8 * Math.PI * v.r! ** 2);
              return k === undefined ? undefined : div(k - v.H! ** 2 / 2, v.H!);
            },
            '({W} ÷ ({rho} × 9.8 × π × {r}²) − {H}² ÷ 2) ÷ {H}',
            'Divide the work by ρgπr², take away H²/2, then divide by H.',
          ],
        },
      ),
      atMost('y', 'H', '{y} ≤ {H}', 'The slab has to be inside the tank.'),
    ],
    example: ex,
    startWith: ['r', 'H', 'h', 'rho', 'y'],
    representation: {
      kind: 'curvedSolid',
      shape: 'cylinder',
      radius: 'r',
      height: 'H',
      extent: 3,
      slab: { y: 'y', above: 'h', lift: 'lift', density: 'rho', g: 9.8, work: 'W' },
    },
  });
}

const pumpEx = (r: number, H: number, h: number, rho: number, y: number) => ({
  r,
  H,
  h,
  rho,
  y,
  lift: H + h - y,
  W: rho * 9.8 * Math.PI * r * r * ((H * H) / 2 + h * H),
});

const HC54: ModuleDef[] = [
  ladder(
    'g.he-rightTriangle-ladder',
    'A sliding ladder',
    'Use this for “A 5 m ladder slides away from a wall at 0.5 m/s. How fast does the top fall when the foot is 3 m out?”',
    ladderEx(5, 3, 0.5),
  ),
  ladder(
    'g.he-rightTriangle-ladder-low',
    'A ladder near the floor',
    'Use this for “A 5 m ladder’s foot slides out at 0.5 m/s. How fast does the top fall when the foot is 4.8 m out?”',
    ladderEx(5, 4.8, 0.5),
  ),
  twoCars,
  coneTank(
    'g.he-curvedSolid-cone-tank',
    'Filling a cone tank',
    'Use this for “Water runs at 0.5 m³/min into a cone tank of rim radius 2 m and depth 4 m. How fast does it rise at 2 m deep?”',
    coneEx(2, 4, 2, 0.5),
  ),
  coneTank(
    'g.he-curvedSolid-cone-shallow',
    'A cone tank just starting to fill',
    'Use this for “How fast does the water rise in the same tank when it is only 0.5 m deep?”',
    coneEx(2, 4, 0.5, 0.5),
  ),
  pumping(
    'g.he-curvedSolid-pump',
    'Pumping a tank empty',
    'Use this for “A cylinder 1 m in radius and 2 m tall is full of water. How much work pumps it out 1 m above the rim?”',
    pumpEx(1, 2, 1, 1000, 0.5),
  ),
  pumping(
    'g.he-curvedSolid-pump-oil',
    'Pumping oil from a tall tank',
    'Use this for “Oil of 900 kg/m³ fills a tank 0.5 m in radius and 3 m tall. How much work pumps it 2 m above the rim?”',
    pumpEx(0.5, 3, 2, 900, 2.5),
  ),
];

export const HE3C_GALLERY_MODULES: ModuleDef[] = [...HC53, ...HC54];

export const HE3C_GALLERY_LAYOUTS: LayoutDef[] = [];
