/**
 * College gallery demos, round 3, group C (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC53: `polarGrid` areas, regions, tangent and the cycloid (calc-2#5, calc-3#2).
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

export const HE3C_GALLERY_MODULES: ModuleDef[] = [...HC53];

export const HE3C_GALLERY_LAYOUTS: LayoutDef[] = [];
