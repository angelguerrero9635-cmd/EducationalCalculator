/**
 * College gallery demos, round 3, group C (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC53: `polarGrid` areas, regions, tangent and the cycloid (calc-2#5, calc-3#2).
 * HC54: `rightTriangle` rates and `curvedSolid` fill and slab (calc-1#2, calc-2#2).
 * HC66: `termsChart` series: n·rⁿ, cⁿ ÷ n!, alternating signs, bounds (calc-2#3).
 * HC67: `rectangle` grow; `conicGraph` circle under and tangent (calc-1#1, calc-2#0).
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
    steps: Object.fromEntries(
      rules.filter((r) => !r.relation.hidden).map((r) => [r.relation.id, r.steps]),
    ),
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

// ─── HC66: termsChart series ─────────────────────────────────────────────────

/** n! for a whole n. */
const factorialOf = (n: number) => {
  let f = 1;
  for (let k = 2; k <= n; k++) f *= k;
  return f;
};

/** −p for the chart's power rule (aₙ = n⁻ᵖ), never shown. */
const negP: Rule = {
  relation: {
    id: 'mp = −p',
    display: '{mp} = −{p}',
    vars: ['mp', 'p'],
    residual: (v) => v.mp! + v.p!,
    solve: { mp: (v) => -v.p!, p: (v) => -v.mp! },
    hidden: true,
  },
  steps: {},
};
const MP = num('mp', 'k', 'Power on n (−p)', undefined, -5, 0, { hidden: true });

/** Σ from n = 1 to N of 1/nᵖ (the sum's terms put in one by one by the step check). */
const pSum = (N: number, p: number) =>
  Array.from({ length: N }, (_, i) => 1 / (i + 1) ** p).reduce((s, t) => s + t, 0);

/** calc-2#3 main: a p-series and the integral test's bounds. */
function pSeries(id: string, title: string, use: string, ex: Values) {
  return page({
    id,
    title,
    use,
    assumptions: [
      'The terms 1/nᵖ are positive and decreasing, so the integral test applies.',
      'The tail after N lies between ∫ from N + 1 to ∞ and ∫ from N to ∞ of x⁻ᵖ dx.',
      'p ≤ 1 diverges; this page takes p > 1.',
    ],
    variables: [
      num('p', 'p', 'Power', undefined, 1.1, 5, { step: 0.1 }),
      num('N', 'N', 'Terms added', undefined, 1, 30, { step: 1, integer: true }),
      num('S', 'S_N', 'Partial sum', undefined, 0, 100),
      num('lo', 'L', 'Lower bound', undefined, 0, 1000),
      num('hi', 'U', 'Upper bound', undefined, 0, 1000),
      MP,
    ],
    rules: [
      negP,
      rule(
        'S_N = Σ 1/nᵖ',
        '{S} = Σ from n = 1 to {N} of (1/n)^{p}',
        ['S', 'N', 'p'],
        (v) => v.S! - pSum(Math.round(v.N!), v.p!),
        {
          S: [
            (v) => (Number.isInteger(v.N) ? pSum(v.N!, v.p!) : undefined),
            'Σ from n = 1 to {N} of (1/n)^{p}',
            'Add the first N terms one by one.',
          ],
        },
      ),
      rule(
        'L = S_N + 1/((p − 1)(N + 1)ᵖ⁻¹)',
        '{lo} = {S} + 1 ÷ (({p} − 1) × ({N} + 1)^({p} − 1))',
        ['lo', 'S', 'p', 'N'],
        (v) => v.lo! - v.S! - 1 / ((v.p! - 1) * (v.N! + 1) ** (v.p! - 1)),
        {
          lo: [
            (v) => v.S! + 1 / ((v.p! - 1) * (v.N! + 1) ** (v.p! - 1)),
            '{S} + 1 ÷ (({p} − 1) × ({N} + 1)^({p} − 1))',
            'The tail is at least the integral of x⁻ᵖ from N + 1 to ∞.',
          ],
        },
      ),
      rule(
        'U = S_N + 1/((p − 1)Nᵖ⁻¹)',
        '{hi} = {S} + 1 ÷ (({p} − 1) × {N}^({p} − 1))',
        ['hi', 'S', 'p', 'N'],
        (v) => v.hi! - v.S! - 1 / ((v.p! - 1) * v.N! ** (v.p! - 1)),
        {
          hi: [
            (v) => v.S! + 1 / ((v.p! - 1) * v.N! ** (v.p! - 1)),
            '{S} + 1 ÷ (({p} − 1) × {N}^({p} − 1))',
            'The tail is at most the integral of x⁻ᵖ from N to ∞.',
          ],
        },
      ),
    ],
    example: ex,
    startWith: ['p', 'N'],
    representation: {
      kind: 'termsChart',
      type: 'power',
      first: 1,
      step: 'mp',
      count: 'N',
      as: 'bars',
      sums: true,
      sum: 'S',
      bounds: { low: 'lo', high: 'hi' },
      limit: true,
    },
  });
}

const pEx = (p: number, N: number) => {
  const S = pSum(N, p);
  return {
    p,
    N,
    S,
    lo: S + 1 / ((p - 1) * (N + 1) ** (p - 1)),
    hi: S + 1 / ((p - 1) * N ** (p - 1)),
    mp: -p,
  };
};

/** calc-2#3~ratio: Σ n·rⁿ and the ratio test. */
const ratioTest = page({
  id: 'g.he-termsChart-ratio',
  title: 'The ratio test on n·rⁿ',
  use: 'Use this for “Does Σ n(0.5)ⁿ converge? Use the ratio test.”',
  assumptions: [
    'aₙ₊₁ ÷ aₙ = ((n + 1) ÷ n) × r, which tends to |r| as n grows.',
    'The ratio test: L < 1 converges, L > 1 diverges, L = 1 says nothing.',
    'For |r| < 1 the sum is r ÷ (1 − r)².',
  ],
  variables: [
    num('r', 'r', 'Ratio in the rule', undefined, 0.01, 0.99, { step: 0.01 }),
    num('N', 'n', 'Term number', undefined, 1, 29, { step: 1, integer: true }),
    num('aN', 'aₙ', 'Term n', undefined, 0, 100),
    num('aN1', 'aₙ₊₁', 'Next term', undefined, 0, 100),
    num('q', 'aₙ₊₁/aₙ', 'Ratio of terms', undefined, 0, 100),
    num('L', 'L', 'Limit of the ratio', undefined, 0, 1),
    num('S', 'S', 'Sum of the series', undefined, 0, 1e5),
  ],
  rules: [
    rule(
      'aₙ = n·rⁿ',
      '{aN} = {N} × {r}^({N})',
      ['aN', 'N', 'r'],
      (v) => v.aN! - v.N! * v.r! ** v.N!,
      {
        aN: [(v) => v.N! * v.r! ** v.N!, '{N} × {r}^({N})', 'Put the term number into n·rⁿ.'],
      },
    ),
    rule(
      'aₙ₊₁ = (n + 1)·rⁿ⁺¹',
      '{aN1} = ({N} + 1) × {r}^({N} + 1)',
      ['aN1', 'N', 'r'],
      (v) => v.aN1! - (v.N! + 1) * v.r! ** (v.N! + 1),
      {
        aN1: [
          (v) => (v.N! + 1) * v.r! ** (v.N! + 1),
          '({N} + 1) × {r}^({N} + 1)',
          'Put the next term number, n + 1, into n·rⁿ.',
        ],
      },
    ),
    rule(
      'ratio = aₙ₊₁ ÷ aₙ',
      '{q} = {aN1} ÷ {aN}',
      ['q', 'aN1', 'aN'],
      (v) => v.q! * v.aN! - v.aN1!,
      {
        q: [(v) => div(v.aN1!, v.aN!), '{aN1} ÷ {aN}', 'Divide the next term by this one.'],
      },
    ),
    rule(
      'ratio = (n + 1)r ÷ n',
      '{q} = ({N} + 1) × {r} ÷ {N}',
      ['q', 'N', 'r'],
      (v) => v.q! * v.N! - (v.N! + 1) * v.r!,
      {
        q: [
          (v) => div((v.N! + 1) * v.r!, v.N!),
          '({N} + 1) × {r} ÷ {N}',
          'The n·rⁿ terms divide to ((n + 1) ÷ n) × r.',
        ],
        N: [
          (v) => div(v.r!, v.q! - v.r!),
          '{r} ÷ ({q} − {r})',
          'Solve (n + 1)r = n × ratio for n.',
        ],
      },
    ),
    rule('L = |r|', '{L} = |{r}|', ['L', 'r'], (v) => v.L! - Math.abs(v.r!), {
      L: [(v) => Math.abs(v.r!), '|{r}|', '(n + 1) ÷ n tends to 1, so the ratio tends to |r|.'],
      r: [(v) => v.L!, '{L}', 'Here r is positive, so r is the limit itself.'],
    }),
    rule(
      'S = r ÷ (1 − r)²',
      '{S} = {r} ÷ (1 − {r})²',
      ['S', 'r'],
      (v) => v.S! * (1 - v.r!) ** 2 - v.r!,
      {
        S: [
          (v) => div(v.r!, (1 - v.r!) ** 2),
          '{r} ÷ (1 − {r})²',
          'Differentiate the geometric series Σ xⁿ = 1 ÷ (1 − x), then multiply by x.',
        ],
      },
    ),
  ],
  example: { r: 0.5, N: 5, aN: 0.15625, aN1: 0.09375, q: 0.6, L: 0.5, S: 2 },
  startWith: ['r', 'N'],
  representation: {
    kind: 'termsChart',
    type: 'nr',
    first: 1,
    step: 'r',
    count: 'N',
    as: 'bars',
    sums: true,
    term: 'aN',
    next: 'aN1',
    ratio: 'q',
    limit: 'S',
  },
});

/** The factorial rule: Σ cⁿ ÷ n! = eᶜ − 1, the ratio c ÷ (n + 1). */
const factorialSeries = page({
  id: 'g.he-termsChart-factorial',
  title: 'The ratio test on cⁿ ÷ n!',
  use: 'Use this for “Does Σ 2ⁿ ÷ n! converge? Find its sum.”',
  assumptions: [
    'aₙ₊₁ ÷ aₙ = c ÷ (n + 1), which tends to 0 for any c: the series always converges.',
    'Σ from n = 0 of cⁿ ÷ n! is eᶜ, so from n = 1 the sum is eᶜ − 1.',
  ],
  variables: [
    num('c', 'c', 'Base', undefined, 0.1, 5, { step: 0.1 }),
    num('N', 'n', 'Term number', undefined, 1, 29, { step: 1, integer: true }),
    num('aN', 'aₙ', 'Term n', undefined, 0, 1e4),
    num('aN1', 'aₙ₊₁', 'Next term', undefined, 0, 1e4),
    num('q', 'aₙ₊₁/aₙ', 'Ratio of terms', undefined, 0, 10),
    num('S', 'S', 'Sum of the series', undefined, 0, 1000),
  ],
  rules: [
    rule(
      'aₙ = cⁿ ÷ n!',
      '{aN} = {c}^({N}) ÷ {N}!',
      ['aN', 'c', 'N'],
      (v) => v.aN! - v.c! ** v.N! / factorialOf(v.N!),
      {
        aN: [
          (v) => v.c! ** v.N! / factorialOf(v.N!),
          '{c}^({N}) ÷ {N}!',
          'Put the term number into cⁿ ÷ n!.',
        ],
      },
    ),
    rule(
      'ratio = c ÷ (n + 1)',
      '{q} = {c} ÷ ({N} + 1)',
      ['q', 'c', 'N'],
      (v) => v.q! * (v.N! + 1) - v.c!,
      {
        q: [
          (v) => v.c! / (v.N! + 1),
          '{c} ÷ ({N} + 1)',
          'cⁿ⁺¹ ÷ (n + 1)! over cⁿ ÷ n! leaves c ÷ (n + 1).',
        ],
      },
    ),
    rule(
      'aₙ₊₁ = aₙ × ratio',
      '{aN1} = {aN} × {q}',
      ['aN1', 'aN', 'q'],
      (v) => v.aN1! - v.aN! * v.q!,
      {
        aN1: [(v) => v.aN! * v.q!, '{aN} × {q}', 'Multiply this term by the ratio.'],
      },
    ),
    rule('S = eᶜ − 1', '{S} = e^({c}) − 1', ['S', 'c'], (v) => v.S! - Math.exp(v.c!) + 1, {
      S: [
        (v) => Math.exp(v.c!) - 1,
        'e^({c}) − 1',
        'The exponential series without its n = 0 term, 1.',
      ],
      c: [
        (v) => (v.S! > -1 ? Math.log(v.S! + 1) : undefined),
        'ln({S} + 1)',
        'Add 1, then take the natural log.',
      ],
    }),
  ],
  example: (() => {
    const [c, N] = [2, 6];
    const aN = c ** N / factorialOf(N);
    const q = c / (N + 1);
    return { c, N, aN, q, aN1: aN * q, S: Math.exp(c) - 1 };
  })(),
  startWith: ['c', 'N'],
  representation: {
    kind: 'termsChart',
    type: 'factorial',
    first: 1,
    step: 'c',
    count: 'N',
    as: 'bars',
    sums: true,
    term: 'aN',
    next: 'aN1',
    ratio: 'q',
    limit: 'S',
  },
});

/** Σ from n = 1 to N of (−1)ⁿ⁺¹/nᵖ. */
const altSum = (N: number, p: number) =>
  Array.from({ length: N }, (_, i) => (i % 2 ? -1 : 1) / (i + 1) ** p).reduce((s, t) => s + t, 0);

/** calc-2#3~alternating: Σ (−1)ⁿ⁺¹/nᵖ, the error at most the next term. */
const alternating = page({
  id: 'g.he-termsChart-alternating',
  title: 'The alternating series error bound',
  use: 'Use this for “How close is the 9th partial sum of 1 − 1/2 + 1/3 − … to the sum?”',
  assumptions: [
    'The terms 1/nᵖ shrink to 0 and the signs alternate, so the series converges.',
    'The partial sums zig-zag about S, so |S − S_N| ≤ the next term’s size, 1/(N + 1)ᵖ.',
    'For p = 1 the sum is ln 2.',
  ],
  variables: [
    num('p', 'p', 'Power', undefined, 0.1, 5, { step: 0.1 }),
    num('N', 'N', 'Terms added', undefined, 1, 29, { step: 1, integer: true }),
    num('S', 'S_N', 'Partial sum', undefined, -10, 10),
    num('b', 'b', 'Error bound', undefined, 0, 1),
    num('lo', 'S_N − b', 'Lowest the sum can be', undefined, -10, 10),
    num('hi', 'S_N + b', 'Highest the sum can be', undefined, -10, 10),
    MP,
  ],
  rules: [
    negP,
    rule(
      'S_N = Σ (−1)ⁿ⁺¹/nᵖ',
      '{S} = Σ from n = 1 to {N} of (−1)^(n+1)/n^{p}',
      ['S', 'N', 'p'],
      (v) => v.S! - altSum(Math.round(v.N!), v.p!),
      {
        S: [
          (v) => (Number.isInteger(v.N) ? altSum(v.N!, v.p!) : undefined),
          'Σ from n = 1 to {N} of (−1)^(n+1)/n^{p}',
          'Add the first N terms, the signs taking turns.',
        ],
      },
    ),
    rule(
      'b = 1/(N + 1)ᵖ',
      '{b} = 1 ÷ ({N} + 1)^({p})',
      ['b', 'N', 'p'],
      (v) => v.b! - 1 / (v.N! + 1) ** v.p!,
      {
        b: [
          (v) => 1 / (v.N! + 1) ** v.p!,
          '1 ÷ ({N} + 1)^({p})',
          'The first term left out is the bound.',
        ],
      },
    ),
    rule('low = S_N − b', '{lo} = {S} − {b}', ['lo', 'S', 'b'], (v) => v.lo! - v.S! + v.b!, {
      lo: [(v) => v.S! - v.b!, '{S} − {b}', 'The sum is at most b below S_N.'],
    }),
    rule('high = S_N + b', '{hi} = {S} + {b}', ['hi', 'S', 'b'], (v) => v.hi! - v.S! - v.b!, {
      hi: [(v) => v.S! + v.b!, '{S} + {b}', 'The sum is at most b above S_N.'],
    }),
  ],
  example: (() => {
    const [p, N] = [1, 9];
    const S = altSum(N, p);
    const b = 1 / (N + 1) ** p;
    return { p, N, S, b, lo: S - b, hi: S + b, mp: -p };
  })(),
  startWith: ['p', 'N'],
  representation: {
    kind: 'termsChart',
    type: 'power',
    first: 1,
    step: 'mp',
    count: 'N',
    as: 'bars',
    sums: true,
    sum: 'S',
    alternate: true,
    next: 'b',
    bounds: { low: 'lo', high: 'hi' },
    limit: true,
  },
});

const HC66: ModuleDef[] = [
  pSeries(
    'g.he-termsChart-pseries',
    'The integral test’s bounds',
    'Use this for “Estimate Σ 1/n² with 10 terms. How far off can it be?”',
    pEx(2, 10),
  ),
  pSeries(
    'g.he-termsChart-pseries-slow',
    'A slowly converging p-series',
    'Use this for “Bound Σ 1/n^1.1 with 30 terms.”',
    pEx(1.1, 30),
  ),
  ratioTest,
  factorialSeries,
  alternating,
];

// ─── HC67: the product rule's rectangle; a circle's area and tangent ─────────

/** calc-1#1~product-quotient: (uv)′ = u′v + uv′ and (u/v)′ = (u′v − uv′) ÷ v² from a table. */
function productRule(id: string, title: string, use: string, ex: Values) {
  return page({
    id,
    title,
    use,
    assumptions: [
      'u, u′, v and v′ are the values at one x = a (from a table).',
      'In a short time Δt the u × v rectangle gains a strip u′Δt × v and a strip u × v′Δt; the corner u′v′Δt² vanishes faster than Δt.',
      'The quotient rule needs v ≠ 0.',
    ],
    variables: [
      num('u', 'u', 'u at a', undefined, -1000, 1000, { step: 0.1 }),
      num('du', 'u′', 'u′ at a', undefined, -1000, 1000, { step: 0.1 }),
      num('v', 'v', 'v at a', undefined, -1000, 1000, { step: 0.1 }),
      num('dv', 'v′', 'v′ at a', undefined, -1000, 1000, { step: 0.1 }),
      num('P', 'P′', 'Product’s slope', undefined, -2e6, 2e6),
      num('Q', 'Q′', 'Quotient’s slope', undefined, -1e9, 1e9),
    ],
    rules: [
      rule(
        'P′ = u′v + uv′',
        '{P} = {du} × {v} + {u} × {dv}',
        ['P', 'du', 'v', 'u', 'dv'],
        (v) => v.P! - v.du! * v.v! - v.u! * v.dv!,
        {
          P: [
            (v) => v.du! * v.v! + v.u! * v.dv!,
            '{du} × {v} + {u} × {dv}',
            'The product rule: each strip is one factor’s change times the other factor.',
          ],
          du: [
            (v) => div(v.P! - v.u! * v.dv!, v.v!),
            '({P} − {u} × {dv}) ÷ {v}',
            'Take u·v′ from P′, then divide by v.',
          ],
          dv: [
            (v) => div(v.P! - v.du! * v.v!, v.u!),
            '({P} − {du} × {v}) ÷ {u}',
            'Take u′·v from P′, then divide by u.',
          ],
        },
      ),
      rule(
        'Q′ = (u′v − uv′) ÷ v²',
        '{Q} = ({du} × {v} − {u} × {dv}) ÷ {v}²',
        ['Q', 'du', 'v', 'u', 'dv'],
        (v) => v.Q! * v.v! ** 2 - (v.du! * v.v! - v.u! * v.dv!),
        {
          Q: [
            (v) => div(v.du! * v.v! - v.u! * v.dv!, v.v! ** 2),
            '({du} × {v} − {u} × {dv}) ÷ {v}²',
            'The quotient rule: low d-high minus high d-low, over the bottom squared.',
          ],
        },
      ),
    ],
    example: ex,
    startWith: ['u', 'du', 'v', 'dv'],
    representation: {
      kind: 'rectangle',
      length: 'u',
      width: 'v',
      extent: 4,
      grow: { du: 'du', dv: 'dv', product: 'P', quotient: 'Q' },
      fixed: true,
    },
  });
}

const prodEx = (u: number, du: number, v: number, dv: number) => ({
  u,
  du,
  v,
  dv,
  P: du * v + u * dv,
  Q: (du * v - u * dv) / (v * v),
});

/** calc-2#0~trig-sub: ∫ from 0 to b of √(r² − x²) dx = triangle + sector. */
function trigSub(id: string, title: string, use: string, ex: Values) {
  return page({
    id,
    title,
    use,
    assumptions: [
      'x = r sin θ turns √(r² − x²) dx into r² cos² θ dθ.',
      'The area under the arc from 0 to b is the triangle (½ · b · √(r² − b²)) plus the sector (½ r² θ), θ = sin⁻¹(b ÷ r).',
      'θ in degrees here; the sector uses it in radians, θ × π ÷ 180.',
    ],
    variables: [
      num('r', 'r', 'Radius', undefined, 0.1, 100, { step: 0.1 }),
      num('b', 'b', 'Upper limit', undefined, 0.01, 100, { step: 0.01 }),
      num('t', 'θ', 'Angle at b', '°', 0.01, 90),
      num('T', 'T', 'Triangle', undefined, 0, 1e4),
      num('S', 'S', 'Sector', undefined, 0, 1e4),
      num('I', 'I', 'Integral', undefined, 0, 1e4),
    ],
    rules: [
      rule(
        'θ = sin⁻¹(b/r)',
        '{t} = sin⁻¹({b} ÷ {r})',
        ['t', 'b', 'r'],
        (v) => Math.sin(v.t! * RAD) * v.r! - v.b!,
        {
          t: [
            (v) => (v.b! <= v.r! ? Math.asin(v.b! / v.r!) / RAD : undefined),
            'sin⁻¹({b} ÷ {r})',
            'x = r sin θ, so at x = b, sin θ = b ÷ r.',
          ],
          b: [
            (v) => v.r! * Math.sin(v.t! * RAD),
            '{r} × sin({t})',
            'Undo the substitution: b = r sin θ.',
          ],
        },
      ),
      rule(
        'T = ½·b·√(r² − b²)',
        '{T} = ½ × {b} × √({r}² − {b}²)',
        ['T', 'b', 'r'],
        (v) => v.T! - 0.5 * v.b! * Math.sqrt(Math.max(0, v.r! ** 2 - v.b! ** 2)),
        {
          T: [
            (v) => (v.b! <= v.r! ? 0.5 * v.b! * Math.sqrt(v.r! ** 2 - v.b! ** 2) : undefined),
            '½ × {b} × √({r}² − {b}²)',
            'Half the base b times the height of the arc above x = b.',
          ],
        },
      ),
      rule(
        'S = ½r²θ',
        '{S} = ½ × {r}² × {t} × π ÷ 180',
        ['S', 'r', 't'],
        (v) => v.S! - 0.5 * v.r! ** 2 * v.t! * RAD,
        {
          S: [
            (v) => 0.5 * v.r! ** 2 * v.t! * RAD,
            '½ × {r}² × {t} × π ÷ 180',
            'A sector is ½r²θ with θ in radians.',
          ],
        },
      ),
      rule('I = T + S', '{I} = {T} + {S}', ['I', 'T', 'S'], (v) => v.I! - v.T! - v.S!, {
        I: [
          (v) => v.T! + v.S!,
          '{T} + {S}',
          'The region under the arc is the triangle and the sector together.',
        ],
        S: [(v) => v.I! - v.T!, '{I} − {T}', 'Take the triangle from the whole.'],
      }),
      atMost('b', 'r', '{b} ≤ {r}', 'b is past the circle: it must be at most r.'),
    ],
    example: ex,
    startWith: ['r', 'b'],
    representation: {
      kind: 'conicGraph',
      conic: 'circle',
      h: 0,
      k: 0,
      r: 'r',
      under: { to: 'b', triangle: 'T', sector: 'S', integral: 'I', angle: 't' },
      fixed: true,
    },
  });
}

const subEx = (r: number, b: number) => {
  const t = Math.asin(b / r) / RAD;
  const T = 0.5 * b * Math.sqrt(Math.max(0, r * r - b * b));
  const S = 0.5 * r * r * t * RAD;
  return { r, b, t, T, S, I: T + S };
};

/** calc-1#1~implicit: x² + y² = r² at (x₀, y₀), slope −x₀ ÷ y₀ and the tangent line. */
function implicitTangent(id: string, title: string, use: string, ex: Values) {
  return page({
    id,
    title,
    use,
    assumptions: [
      'Differentiate x² + y² = r² with y a function of x: 2x + 2y·(dy/dx) = 0.',
      'So dy/dx = −x ÷ y: the tangent is square to the radius (y₀ ≠ 0).',
    ],
    variables: [
      num('x0', 'x₀', 'Point’s x', undefined, -100, 100, { step: 0.1 }),
      num('y0', 'y₀', 'Point’s y', undefined, -100, 100, { step: 0.1 }),
      num('r', 'r', 'Radius', undefined, 0.01, 200),
      num('m', 'm', 'Slope dy/dx', undefined, -1e5, 1e5),
      num('c', 'c', 'Tangent’s y-intercept', undefined, -1e7, 1e7),
    ],
    rules: [
      rule(
        'r = √(x₀² + y₀²)',
        '{r} = √({x0}² + {y0}²)',
        ['r', 'x0', 'y0'],
        (v) => v.r! ** 2 - v.x0! ** 2 - v.y0! ** 2,
        {
          r: [
            (v) => Math.hypot(v.x0!, v.y0!),
            '√({x0}² + {y0}²)',
            'The point is on the circle: its distance from the center.',
          ],
        },
      ),
      rule('m = −x₀ ÷ y₀', '{m} = −{x0} ÷ {y0}', ['m', 'x0', 'y0'], (v) => v.m! * v.y0! + v.x0!, {
        m: [
          (v) => div(-v.x0!, v.y0!),
          '−{x0} ÷ {y0}',
          'Solve 2x + 2y·(dy/dx) = 0 for dy/dx at the point.',
        ],
        x0: [(v) => -v.m! * v.y0!, '−{m} × {y0}', 'Multiply the slope by −y₀.'],
      }),
      rule(
        'c = y₀ − m·x₀',
        '{c} = {y0} − {m} × {x0}',
        ['c', 'y0', 'm', 'x0'],
        (v) => v.c! - v.y0! + v.m! * v.x0!,
        {
          c: [
            (v) => v.y0! - v.m! * v.x0!,
            '{y0} − {m} × {x0}',
            'The tangent y = mx + c passes through the point.',
          ],
        },
      ),
    ],
    example: ex,
    startWith: ['x0', 'y0'],
    representation: {
      kind: 'conicGraph',
      conic: 'circle',
      h: 0,
      k: 0,
      r: 'r',
      point: { x: 'x0', y: 'y0' },
      tangent: { slope: 'm', intercept: 'c' },
      fixed: true,
    },
  });
}

const tanEx = (x0: number, y0: number) => {
  const m = -x0 / y0;
  return { x0, y0, r: Math.hypot(x0, y0), m, c: y0 - m * x0 };
};

const HC67: ModuleDef[] = [
  productRule(
    'g.he-rectangle-grow',
    'The product and quotient rules from a table',
    'Use this for “f(2) = 3, f′(2) = −1, g(2) = 4, g′(2) = 5. Find (fg)′(2) and (f/g)′(2).”',
    prodEx(3, -1, 4, 5),
  ),
  productRule(
    'g.he-rectangle-grow-both',
    'Both factors growing',
    'Use this for “u = 2 and v = 3 grow at 0.5 and 1 per second. How fast does uv grow?”',
    prodEx(2, 0.5, 3, 1),
  ),
  trigSub(
    'g.he-conicGraph-under',
    'Trig substitution as triangle plus sector',
    'Use this for “Evaluate ∫ from 0 to 1 of √(4 − x²) dx.”',
    subEx(2, 1),
  ),
  trigSub(
    'g.he-conicGraph-under-quarter',
    'A quarter circle by trig substitution',
    'Use this for “Evaluate ∫ from 0 to 3 of √(9 − x²) dx.”',
    subEx(3, 3),
  ),
  implicitTangent(
    'g.he-conicGraph-tangent',
    'Implicit slope on a circle',
    'Use this for “Find dy/dx on x² + y² = 25 at (3, 4), and the tangent line.”',
    tanEx(3, 4),
  ),
  implicitTangent(
    'g.he-conicGraph-tangent-steep',
    'A tangent near the side of a circle',
    'Use this for “Find the tangent to x² + y² = r² at (4.9, 1).”',
    tanEx(4.9, 1),
  ),
];

export const HE3C_GALLERY_MODULES: ModuleDef[] = [...HC53, ...HC54, ...HC66, ...HC67];

export const HE3C_GALLERY_LAYOUTS: LayoutDef[] = [];
