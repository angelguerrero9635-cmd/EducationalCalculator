/**
 * Grades 9–12 gallery demos (group HK; see pictureRequestsHs.ts and docs/RENDERINGS_HS.md).
 * Each demo stands in for a planned page: real variables, relations, steps and a use line, so
 * `scripts/promote-demo.mjs` can copy it into a grade file. Spread into gallery.ts.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

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

type Solve = (v: Values) => number | number[] | undefined;

/**
 * A rule from its display, its residual and, per variable, how to solve for it with the step
 * text: `[solve, expr, how]`. A variable given `undefined` is solved numerically, with no step.
 */
const rule = (
  id: string,
  display: string,
  residual: (v: Values) => number,
  parts: Record<string, [Solve, string, string] | undefined>,
): Rule => ({
  relation: {
    id,
    display,
    vars: [
      ...new Set([...Object.keys(parts), ...[...display.matchAll(/\{(\w+)\}/g)].map((x) => x[1]!)]),
    ],
    residual,
    solve: Object.fromEntries(
      Object.entries(parts).flatMap(([k, p]) => (p ? [[k, p[0]]] : [])),
    ) as Relation['solve'],
  },
  steps: Object.fromEntries(
    Object.entries(parts).flatMap(([k, p]) => (p ? [[k, { expr: p[1], how: p[2] }]] : [])),
  ),
});

/** A measured value with its unit and range. */
const q = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  step = 0.1,
  extra: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...(unit ? { unit } : {}), min, max, step, ...extra });

/** Division that gives undefined for a zero divisor (the solver then skips it). */
const div = (a: number, b: number) => (Math.abs(b) < 1e-12 ? undefined : a / b);

// ─── H58 motionGraph: velocity, displacement and the tangent ────────────────

const T = q('t', 't', 'Time', 's', 0, 60);
const V0 = q('u', 'v₀', 'Starting velocity', 'm/s', -60, 60, 0.5);
const A = q('a', 'a', 'Acceleration', 'm/s²', -20, 20, 0.1);
const V = q('v', 'v', 'Final velocity', 'm/s', -300, 300, 0.1);
const DX = q('d', 'Δx', 'Displacement', 'm', -5000, 5000, 0.1);

/** v = v₀ + at. */
const velocityRule = rule('v = v₀ + at', '{v} = {u} + {a}{t}', (v) => v.v! - v.u! - v.a! * v.t!, {
  v: [(v) => v.u! + v.a! * v.t!, '{u} + {a} × {t}', 'Start at v₀ and add a for every second.'],
  u: [(v) => v.v! - v.a! * v.t!, '{v} − {a} × {t}', 'Take off the change: a for every second.'],
  a: [
    (v) => div(v.v! - v.u!, v.t!),
    '({v} − {u})/{t}',
    'The slope of the v–t line: the change in velocity over the time.',
  ],
  t: [
    (v) => div(v.v! - v.u!, v.a!),
    '({v} − {u})/{a}',
    'Divide the change in velocity by the change each second.',
  ],
});

/** Δx = (v₀ + v)/2 × t: the signed area under the v–t line. */
const displacementRule = rule(
  'Δx = (v₀ + v)/2 × t',
  '{d} = ({u} + {v})/2 × {t}',
  (v) => v.d! - ((v.u! + v.v!) / 2) * v.t!,
  {
    d: [
      (v) => ((v.u! + v.v!) / 2) * v.t!,
      '({u} + {v})/2 × {t}',
      'The area under the v–t line: the average velocity times the time (below the axis counts as negative).',
    ],
    u: [
      (v) => div(2 * v.d!, v.t!)! - v.v!,
      '2 × {d}/{t} − {v}',
      'Twice the average velocity, less v.',
    ],
    v: [
      (v) => div(2 * v.d!, v.t!)! - v.u!,
      '2 × {d}/{t} − {u}',
      'Twice the average velocity, less v₀.',
    ],
    t: [
      (v) => div(2 * v.d!, v.u! + v.v!),
      '{d}/(({u} + {v})/2)',
      'Divide the displacement by the average velocity.',
    ],
  },
);

const kinematicsDemo = (
  id: string,
  title: string,
  use: string,
  assumptions: string[],
  example: { u: number; a: number; t: number },
): ModuleDef => {
  const v = example.u + example.a * example.t;
  return {
    id,
    title,
    use,
    unitSystems: ['metric'],
    assumptions,
    variables: [T, V0, A, V, DX],
    ...rules(velocityRule, displacementRule),
    example: { ...example, v, d: ((example.u + v) / 2) * example.t },
    startWith: ['u', 'a', 't'],
    representation: {
      kind: 'motionGraph',
      graph: 'speed',
      time: 't',
      acceleration: 'a',
      speed: 'v',
      start: 'u',
      distance: 'd',
      kinematics: { view: 'velocity' },
    },
  };
};

const KINEMATICS_DEMOS: ModuleDef[] = [
  kinematicsDemo(
    'g.s11-kinematics-1d-velocity',
    'Velocity–time: displacement as area',
    'Use this for “A car moving at 4 m/s speeds up at 2 m/s² for 6 s. How fast is it going, and how far did it go?”',
    [
      'Velocity is signed: + is forward, − is backward. Acceleration is the slope of the v–t line.',
      'The area between the v–t line and the time axis is the displacement Δx.',
      'The dots above are the car every second: they spread out as it speeds up.',
    ],
    { u: 4, a: 2, t: 6 },
  ),
  kinematicsDemo(
    'g.s11-kinematics-1d-turn',
    'Thrown up: the velocity changes sign',
    'Use this for “A ball is thrown straight up at 15 m/s. Where is it and how fast is it moving 3 s later?”',
    [
      'Up is +. Gravity gives a = −9.8 m/s² the whole time, going up and coming down.',
      'The ball stops for an instant at the top, where the line crosses the axis, then falls.',
      'Area above the axis counts +, area below counts −; together they give the displacement.',
    ],
    { u: 15, a: -9.8, t: 3 },
  ),
  kinematicsDemo(
    'g.s11-kinematics-1d-braking',
    'Braking hard',
    'Use this for “A car at 25 m/s brakes at 5 m/s² for 4 s. How fast is it going now, and how far did it go?”',
    [
      'Braking against the motion is a negative acceleration: a = −5 m/s².',
      'The line slopes down toward v = 0; the area under it is how far the car went while braking.',
    ],
    { u: 25, a: -5, t: 4 },
  ),
  {
    id: 'g.s11-kinematics-1d-tangent',
    title: 'Position–time: the tangent’s slope',
    use: 'Use this for “x = −4t + t². How fast is it moving at t = 4 s, and which way?”',
    unitSystems: ['metric'],
    assumptions: [
      'With a steady acceleration the position is x = x₀ + v₀t + ½at², a parabola against time.',
      'The slope of the tangent at a moment is the velocity at that moment.',
      'Where the tangent is flat, the object is at rest for an instant and turns round.',
    ],
    variables: [
      T,
      V0,
      A,
      V,
      q('s', 't₁', 'Time of the tangent', 's', 0, 60),
      q('w', 'v₁', 'Velocity at t₁ (the slope)', 'm/s', -300, 300),
    ],
    ...rules(
      velocityRule,
      rule('v₁ = v₀ + at₁', '{w} = {u} + {a}{s}', (v) => v.w! - v.u! - v.a! * v.s!, {
        w: [
          (v) => v.u! + v.a! * v.s!,
          '{u} + {a} × {s}',
          'The tangent’s slope is the velocity then: v₀ plus a for every second up to t₁.',
        ],
        u: [(v) => v.w! - v.a! * v.s!, '{w} − {a} × {s}', 'Take off the change up to t₁.'],
        a: [
          (v) => div(v.w! - v.u!, v.s!),
          '({w} − {u})/{s}',
          'The change in velocity over the time.',
        ],
        s: [
          (v) => div(v.w! - v.u!, v.a!),
          '({w} − {u})/{a}',
          'Divide the change in velocity by a.',
        ],
      }),
    ),
    example: { u: -4, a: 2, t: 6, v: 8, s: 4, w: 4 },
    startWith: ['u', 'a', 't', 's'],
    representation: {
      kind: 'motionGraph',
      graph: 'speed',
      time: 't',
      acceleration: 'a',
      speed: 'v',
      start: 'u',
      kinematics: { view: 'position', at: 's', slope: 'w' },
    },
  },
];

// ─── H59 projectile ──────────────────────────────────────────────────────────

const RAD = Math.PI / 180;
const G = 9.8;

const LAUNCH_V = q('v', 'v₀', 'Launch speed', 'm/s', 0.5, 100, 0.5);
const LAUNCH_ANGLE = q('q', 'θ', 'Launch angle', '°', 0, 90, 1);
const LAUNCH_H = q('h', 'h', 'Launch height', 'm', 0, 200, 0.5);

/** vₓ = v₀ cos θ and v_y = v₀ sin θ. */
const component = (id: string, fn: 'cos' | 'sin', what: string): Rule => {
  const f = fn === 'cos' ? Math.cos : Math.sin;
  const inv = fn === 'cos' ? Math.acos : Math.asin;
  const sym = fn === 'cos' ? 'vₓ' : 'v_y';
  return rule(
    `${sym} = v₀ ${fn} θ`,
    `{${id}} = {v} × ${fn}({q})`,
    (v) => v[id]! - v.v! * f(v.q! * RAD),
    {
      [id]: [
        (v) => v.v! * f(v.q! * RAD),
        `{v} × ${fn}({q})`,
        `The ${what} part of the launch velocity: v₀ times ${fn} θ.`,
      ],
      v: [
        (v) => div(v[id]!, f(v.q! * RAD)),
        `{${id}}/${fn}({q})`,
        `Divide the ${what} part by ${fn} θ.`,
      ],
      q: [
        (v) => {
          const r = div(v[id]!, v.v!);
          return r === undefined || Math.abs(r) > 1 ? undefined : inv(r) / RAD;
        },
        `arc${fn}({${id}}/{v})`,
        `The angle whose ${fn} is the ${what} part over the speed.`,
      ],
    },
  );
};

const PROJECTILE_VARS: VariableDef[] = [
  LAUNCH_V,
  LAUNCH_ANGLE,
  LAUNCH_H,
  q('x', 'vₓ', 'Horizontal velocity', 'm/s', 0, 100, 0.1),
  q('y', 'v_y', 'Vertical launch velocity', 'm/s', 0, 100, 0.1),
  q('T', 'T', 'Time in the air', 's', 0, 60, 0.01),
  q('R', 'R', 'Range', 'm', 0, 12000, 0.1),
  q('H', 'H', 'Maximum height', 'm', 0, 3000, 0.1),
];

const PROJECTILE_RULES = rules(
  component('x', 'cos', 'horizontal'),
  component('y', 'sin', 'vertical'),
  rule(
    'H = h + v_y²/(2g)',
    '{H} = {h} + {y}²/(2 × 9.8)',
    (v) => v.H! - v.h! - (v.y! * v.y!) / (2 * G),
    {
      H: [
        (v) => v.h! + (v.y! * v.y!) / (2 * G),
        '{h} + {y}²/(2 × 9.8)',
        'At the top v_y is 0: the height gained is v_y² over 2g.',
      ],
      h: [
        (v) => v.H! - (v.y! * v.y!) / (2 * G),
        '{H} − {y}²/(2 × 9.8)',
        'Take the height gained from the top.',
      ],
      y: [
        (v) => (v.H! >= v.h! ? Math.sqrt(2 * G * (v.H! - v.h!)) : undefined),
        '√(2 × 9.8 × ({H} − {h}))',
        'The launch v_y that rises H − h before stopping.',
      ],
    },
  ),
  rule(
    'T = (v_y + √(v_y² + 2gh))/g',
    '{T} = ({y} + √({y}² + 2 × 9.8 × {h}))/9.8',
    (v) => v.h! + v.y! * v.T! - (G / 2) * v.T! * v.T!,
    {
      T: [
        (v) => (v.y! + Math.sqrt(v.y! * v.y! + 2 * G * v.h!)) / G,
        '({y} + √({y}² + 2 × 9.8 × {h}))/9.8',
        'It lands when h + v_y t − ½gt² = 0: the positive root of the quadratic.',
      ],
      y: [
        (v) => div((G / 2) * v.T! * v.T! - v.h!, v.T!),
        '(4.9 × {T}² − {h})/{T}',
        'Solve h + v_y T − 4.9T² = 0 for v_y.',
      ],
      h: [
        (v) => (G / 2) * v.T! * v.T! - v.y! * v.T!,
        '4.9 × {T}² − {y} × {T}',
        'The drop that the flight time covers.',
      ],
    },
  ),
  rule('R = vₓT', '{R} = {x} × {T}', (v) => v.R! - v.x! * v.T!, {
    R: [(v) => v.x! * v.T!, '{x} × {T}', 'Across, the speed stays vₓ for the whole flight.'],
    x: [(v) => div(v.R!, v.T!), '{R}/{T}', 'Divide the range by the time in the air.'],
    T: [(v) => div(v.R!, v.x!), '{R}/{x}', 'Divide the range by the horizontal speed.'],
  }),
);

const projectileDemo = (
  id: string,
  title: string,
  use: string,
  assumptions: string[],
  launch: { v: number; q: number; h: number },
): ModuleDef => {
  const vx = launch.v * Math.cos(launch.q * RAD);
  const vy = launch.v * Math.sin(launch.q * RAD);
  const T = (vy + Math.sqrt(vy * vy + 2 * G * launch.h)) / G;
  return {
    id,
    title,
    use,
    unitSystems: ['metric'],
    assumptions: ['No air resistance; g = 9.8 m/s² downward.', ...assumptions],
    variables: PROJECTILE_VARS,
    ...PROJECTILE_RULES,
    example: { ...launch, x: vx, y: vy, T, R: vx * T, H: launch.h + (vy * vy) / (2 * G) },
    startWith: ['v', 'q', 'h'],
    representation: {
      kind: 'projectile',
      speed: 'v',
      angle: 'q',
      height: 'h',
      vx: 'x',
      vy: 'y',
      time: 'T',
      range: 'R',
      peak: 'H',
    },
  };
};

const PROJECTILE_DEMOS: ModuleDef[] = [
  projectileDemo(
    'g.s11-kinematics-2d-level',
    'A throw over level ground',
    'Use this for “A ball is thrown at 20 m/s, 45° up, from 1.5 m above the ground. How high does it go and how far does it land?”',
    [
      'Split the launch velocity into vₓ = v₀ cos θ across and v_y = v₀ sin θ up.',
      'Across nothing pushes, so vₓ stays the same; up and down, v_y falls by 9.8 m/s every second.',
    ],
    { v: 20, q: 45, h: 1.5 },
  ),
  projectileDemo(
    'g.s11-kinematics-2d-cliff',
    'Launched from a cliff',
    'Use this for “A stone is thrown at 15 m/s, 30° up, from a cliff 20 m high. How long is it in the air, and how far out does it land?”',
    [
      'The stone lands when its height h + v_y t − ½gt² comes back to 0: the ground below the cliff.',
      'It rises to the top, then falls past its launch height to the ground.',
    ],
    { v: 15, q: 30, h: 20 },
  ),
  projectileDemo(
    'g.s11-kinematics-2d-steep',
    'A steep launch',
    'Use this for “A model rocket leaves a 1 m pad at 25 m/s, 75° up. How high and how far does it go?”',
    [
      'A steep launch goes high but not far: most of the speed is vertical.',
      'From the ground, angles that add to 90° (75° and 15°) would land at the same range.',
    ],
    { v: 25, q: 75, h: 1 },
  ),
  {
    id: 'g.m12-parametric-launch',
    title: 'A launch as parametric equations',
    use: 'Use this for “x(t) = 16t, y(t) = 2 + 12t − 4.9t². Where is the ball at t = 1.5?”',
    unitSystems: ['metric'],
    assumptions: [
      'No air resistance; g = 9.8 m/s².',
      'x(t) = (v₀ cos θ)t and y(t) = h + (v₀ sin θ)t − 4.9t²: the parameter t is the time.',
    ],
    variables: [
      LAUNCH_V,
      LAUNCH_ANGLE,
      LAUNCH_H,
      q('t', 't', 'Time', 's', 0, 60, 0.1),
      q('X', 'x', 'Distance across', 'm', 0, 6000, 0.01),
      q('Y', 'y', 'Height', 'm', -20000, 1000, 0.01),
    ],
    ...rules(
      rule(
        'x = v₀ cos θ · t',
        '{X} = {v} × cos({q}) × {t}',
        (v) => v.X! - v.v! * Math.cos(v.q! * RAD) * v.t!,
        {
          X: [
            (v) => v.v! * Math.cos(v.q! * RAD) * v.t!,
            '{v} × cos({q}) × {t}',
            'Across, the speed stays v₀ cos θ.',
          ],
          t: [
            (v) => div(v.X!, v.v! * Math.cos(v.q! * RAD)),
            '{X}/(cos({q}) × {v})',
            'Divide the distance across by the speed across.',
          ],
          v: [
            (v) => div(v.X!, Math.cos(v.q! * RAD) * v.t!),
            '{X}/(cos({q}) × {t})',
            'Divide the distance across by cos θ times t.',
          ],
          q: undefined,
        },
      ),
      rule(
        'y = h + v₀ sin θ · t − 4.9t²',
        '{Y} = {h} + {v} × sin({q}) × {t} − 4.9 × {t}²',
        (v) => v.Y! - v.h! - v.v! * Math.sin(v.q! * RAD) * v.t! + 4.9 * v.t! * v.t!,
        {
          Y: [
            (v) => v.h! + v.v! * Math.sin(v.q! * RAD) * v.t! - 4.9 * v.t! * v.t!,
            '{h} + {v} × sin({q}) × {t} − 4.9 × {t}²',
            'Start at h, rise at v₀ sin θ, and fall ½gt².',
          ],
          h: [
            (v) => v.Y! - v.v! * Math.sin(v.q! * RAD) * v.t! + 4.9 * v.t! * v.t!,
            '{Y} − {v} × sin({q}) × {t} + 4.9 × {t}²',
            'Undo the rise and the fall.',
          ],
          v: undefined,
          q: undefined,
          t: undefined,
        },
      ),
    ),
    example: {
      v: 20,
      q: 36.87,
      h: 2,
      t: 1.5,
      X: 20 * Math.cos(36.87 * RAD) * 1.5,
      Y: 2 + 20 * Math.sin(36.87 * RAD) * 1.5 - 4.9 * 2.25,
    },
    startWith: ['v', 'q', 'h', 't'],
    representation: {
      kind: 'projectile',
      speed: 'v',
      angle: 'q',
      height: 'h',
      at: 't',
      x: 'X',
      y: 'Y',
      parametric: true,
    },
  },
];

// ─── Shared rules: a product, a difference, a sum ───────────────────────────

/** out = a × b (or k × a with a number), each way, with the step text for each. */
const product = (
  out: string,
  a: string,
  b: string | number,
  sym: string,
  hows: [string, string, string?],
): Rule => {
  const bv = (v: Values) => (typeof b === 'number' ? b : v[b]!);
  const bt = typeof b === 'number' ? String(b) : `{${b}}`;
  return rule(sym, `{${out}} = {${a}} × ${bt}`, (v) => v[out]! - v[a]! * bv(v), {
    [out]: [(v) => v[a]! * bv(v), `{${a}} × ${bt}`, hows[0]],
    [a]: [(v) => div(v[out]!, bv(v)), `{${out}}/${bt}`, hows[1]],
    ...(typeof b === 'string'
      ? { [b]: [(v: Values) => div(v[out]!, v[a]!), `{${out}}/{${a}}`, hows[2] ?? hows[1]] }
      : {}),
  } as Record<string, [Solve, string, string]>);
};

/** out = a − b, each way. */
const difference = (out: string, a: string, b: string, sym: string, how: string): Rule =>
  rule(sym, `{${out}} = {${a}} − {${b}}`, (v) => v[out]! - (v[a]! - v[b]!), {
    [out]: [(v) => v[a]! - v[b]!, `{${a}} − {${b}}`, how],
    [a]: [(v) => v[out]! + v[b]!, `{${out}} + {${b}}`, 'Add back what was taken away.'],
    [b]: [(v) => v[a]! - v[out]!, `{${a}} − {${out}}`, 'Take the result from the first.'],
  });

// ─── H60 freeBody ────────────────────────────────────────────────────────────

const MASS = q('m', 'm', 'Mass', 'kg', 0.1, 1000, 0.1);
const MU = q('k', 'μ', 'Coefficient of friction', undefined, 0.01, 1.5, 0.01);
const WEIGHT = q('W', 'W', 'Weight', 'N', 0, 10000, 0.1);
const NORMAL = q('N', 'Fₙ', 'Normal force', 'N', 0, 10000, 0.1);
const FRICTION = q('f', 'f', 'Friction', 'N', 0, 10000, 0.1);
const NET = q('n', 'Fₙₑₜ', 'Net force', 'N', -10000, 10000, 0.1);
const ACC = q('a', 'a', 'Acceleration', 'm/s²', -100, 100, 0.01);

const weightRule = product('W', 'm', 9.8, 'W = mg', [
  'Earth pulls each kilogram with 9.8 N.',
  'Divide the weight by 9.8 N/kg.',
]);
const frictionRule = product('f', 'k', 'N', 'f = μFₙ', [
  'Friction is μ times the normal force pressing the surfaces together.',
  'Divide the friction by the normal force.',
  'Divide the friction by μ.',
]);
const newtonRule = product('n', 'm', 'a', 'Fₙₑₜ = ma', [
  'Newton’s second law: the net force is the mass times the acceleration.',
  'Divide the net force by the acceleration.',
  'Divide the net force by the mass.',
]);

const FREE_BODY_DEMOS: ModuleDef[] = [
  {
    id: 'g.s11-dynamics-vectors-push',
    title: 'Pushing a crate across the floor',
    use: 'Use this for “A 10 kg crate is pushed with 50 N across a floor with μ = 0.3. What is its acceleration?”',
    unitSystems: ['metric'],
    assumptions: [
      'Up and down nothing moves: the normal force balances the weight.',
      'Kinetic friction f = μFₙ acts against the motion.',
      'The net force is the push minus friction, and Fₙₑₜ = ma.',
    ],
    variables: [
      MASS,
      q('F', 'F', 'Push', 'N', 0, 10000, 1),
      MU,
      WEIGHT,
      NORMAL,
      FRICTION,
      NET,
      ACC,
    ],
    ...rules(
      weightRule,
      rule('Fₙ = W', '{N} = {W}', (v) => v.N! - v.W!, {
        N: [
          (v) => v.W!,
          '{W}',
          'Nothing else pushes up or down, so the floor pushes up with the weight.',
        ],
        W: [(v) => v.N!, '{N}', 'The weight equals the normal force.'],
      }),
      frictionRule,
      difference('n', 'F', 'f', 'Fₙₑₜ = F − f', 'The push forward less friction backward.'),
      newtonRule,
    ),
    example: { m: 10, F: 50, k: 0.3, W: 98, N: 98, f: 29.4, n: 20.6, a: 2.06 },
    startWith: ['m', 'F', 'k'],
    representation: {
      kind: 'freeBody',
      support: 'floor',
      moving: 'right',
      mass: 'm',
      applied: 'F',
      weight: 'W',
      normal: 'N',
      friction: 'f',
      mu: 'k',
      net: 'n',
      acceleration: 'a',
    },
  },
  {
    id: 'g.s11-dynamics-vectors-rope',
    title: 'Pulling a sled by a rope at an angle',
    use: 'Use this for “A 20 kg sled is pulled by a rope at 30° above level with 100 N; μ = 0.2. Find the normal force and the acceleration.”',
    unitSystems: ['metric'],
    assumptions: [
      'The rope’s tension has a part across, T cos θ, and a part up, T sin θ.',
      'The part up lifts a little, so the ground pushes up less: Fₙ = W − T sin θ.',
      'Less normal force means less friction.',
    ],
    variables: [
      MASS,
      q('T', 'T', 'Tension in the rope', 'N', 0, 10000, 1),
      q('q', 'θ', 'Angle of the rope', '°', 0, 80, 1),
      MU,
      WEIGHT,
      NORMAL,
      FRICTION,
      NET,
      ACC,
    ],
    ...rules(
      weightRule,
      rule(
        'Fₙ = W − T sin θ',
        '{N} = {W} − {T} × sin({q})',
        (v) => v.N! - v.W! + v.T! * Math.sin(v.q! * RAD),
        {
          N: [
            (v) => v.W! - v.T! * Math.sin(v.q! * RAD),
            '{W} − {T} × sin({q})',
            'The rope lifts T sin θ of the weight; the ground holds the rest.',
          ],
          W: [
            (v) => v.N! + v.T! * Math.sin(v.q! * RAD),
            '{N} + {T} × sin({q})',
            'The ground and the rope together hold the weight.',
          ],
          T: [
            (v) => div(v.W! - v.N!, Math.sin(v.q! * RAD)),
            '({W} − {N})/sin({q})',
            'The rope lifts what the ground doesn’t.',
          ],
          q: undefined,
        },
      ),
      frictionRule,
      rule(
        'Fₙₑₜ = T cos θ − f',
        '{n} = {T} × cos({q}) − {f}',
        (v) => v.n! - v.T! * Math.cos(v.q! * RAD) + v.f!,
        {
          n: [
            (v) => v.T! * Math.cos(v.q! * RAD) - v.f!,
            '{T} × cos({q}) − {f}',
            'The rope’s pull across, less friction.',
          ],
          f: [
            (v) => v.T! * Math.cos(v.q! * RAD) - v.n!,
            '{T} × cos({q}) − {n}',
            'The pull across less the net force.',
          ],
          T: [
            (v) => div(v.n! + v.f!, Math.cos(v.q! * RAD)),
            '({n} + {f})/cos({q})',
            'The pull across is the net force plus friction.',
          ],
          q: undefined,
        },
      ),
      newtonRule,
    ),
    example: {
      m: 20,
      T: 100,
      q: 30,
      k: 0.2,
      W: 196,
      N: 146,
      f: 29.2,
      n: 100 * Math.cos(30 * RAD) - 29.2,
      a: (100 * Math.cos(30 * RAD) - 29.2) / 20,
    },
    startWith: ['m', 'T', 'q', 'k'],
    representation: {
      kind: 'freeBody',
      support: 'floor',
      moving: 'right',
      mass: 'm',
      tension: 'T',
      tensionAngle: 'q',
      weight: 'W',
      normal: 'N',
      friction: 'f',
      mu: 'k',
      net: 'n',
      acceleration: 'a',
    },
  },
  ...[
    {
      id: 'g.s11-dynamics-vectors-incline',
      title: 'A block sliding down an incline',
      use: 'Use this for “A 5 kg block slides down a 30° ramp with μ = 0.2. What is its acceleration?”',
      ex: { m: 5, q: 30, k: 0.2 },
    },
    {
      id: 'g.s11-dynamics-vectors-steep',
      title: 'A steep, slippery ramp',
      use: 'Use this for “A 2 kg box slides down a 60° ramp with μ = 0.1. How fast does it speed up?”',
      ex: { m: 2, q: 60, k: 0.1 },
    },
  ].map(({ id, title, use, ex }): ModuleDef => {
    const W = ex.m * 9.8;
    const P = W * Math.sin(ex.q * RAD);
    const N = W * Math.cos(ex.q * RAD);
    const f = ex.k * N;
    return {
      id,
      title,
      use,
      unitSystems: ['metric'],
      assumptions: [
        'Tilt the axes with the slope: the weight splits into W sin θ down the slope and W cos θ into it.',
        'Into the slope nothing moves, so Fₙ = W cos θ.',
        'Friction acts up the slope, against the sliding.',
      ],
      variables: [
        MASS,
        q('q', 'θ', 'Angle of the ramp', '°', 1, 80, 1),
        MU,
        WEIGHT,
        q('P', 'W∥', 'Weight down the slope', 'N', 0, 10000, 0.1),
        NORMAL,
        FRICTION,
        NET,
        ACC,
      ],
      ...rules(
        weightRule,
        rule('W∥ = W sin θ', '{P} = {W} × sin({q})', (v) => v.P! - v.W! * Math.sin(v.q! * RAD), {
          P: [
            (v) => v.W! * Math.sin(v.q! * RAD),
            '{W} × sin({q})',
            'The part of the weight along the slope.',
          ],
          W: [
            (v) => div(v.P!, Math.sin(v.q! * RAD)),
            '{P}/sin({q})',
            'Divide the part along the slope by sin θ.',
          ],
          q: [
            (v) => {
              const r = div(v.P!, v.W!);
              return r === undefined || r > 1 ? undefined : Math.asin(r) / RAD;
            },
            'arcsin({P}/{W})',
            'The angle whose sine is the part along the slope over the weight.',
          ],
        }),
        rule('Fₙ = W cos θ', '{N} = {W} × cos({q})', (v) => v.N! - v.W! * Math.cos(v.q! * RAD), {
          N: [
            (v) => v.W! * Math.cos(v.q! * RAD),
            '{W} × cos({q})',
            'Into the slope the forces balance: the normal force is the weight’s part into it.',
          ],
          W: [
            (v) => div(v.N!, Math.cos(v.q! * RAD)),
            '{N}/cos({q})',
            'Divide the normal force by cos θ.',
          ],
          q: [
            (v) => {
              const r = div(v.N!, v.W!);
              return r === undefined || r > 1 ? undefined : Math.acos(r) / RAD;
            },
            'arccos({N}/{W})',
            'The angle whose cosine is the normal force over the weight.',
          ],
        }),
        frictionRule,
        difference(
          'n',
          'P',
          'f',
          'Fₙₑₜ = W sin θ − f',
          'Down the slope: the weight’s part less friction.',
        ),
        newtonRule,
      ),
      example: { ...ex, W, P, N, f, n: P - f, a: (P - f) / ex.m },
      startWith: ['m', 'q', 'k'],
      representation: {
        kind: 'freeBody',
        support: 'incline',
        moving: 'down',
        mass: 'm',
        incline: 'q',
        weight: 'W',
        along: 'P',
        normal: 'N',
        friction: 'f',
        mu: 'k',
        net: 'n',
        acceleration: 'a',
      },
    };
  }),
  {
    id: 'g.s11-dynamics-vectors-elevator',
    title: 'An elevator speeding up',
    use: 'Use this for “The cable pulls a 600 kg elevator up with 7,000 N. What is its acceleration?”',
    unitSystems: ['metric'],
    assumptions: [
      'Only two forces: the cable’s tension up and the weight down.',
      'More tension than weight: the net force is up and the elevator speeds up going up.',
    ],
    variables: [MASS, q('T', 'T', 'Tension in the cable', 'N', 0, 100000, 10), WEIGHT, NET, ACC],
    ...rules(
      weightRule,
      difference('n', 'T', 'W', 'Fₙₑₜ = T − W', 'Up is +: the tension up less the weight down.'),
      newtonRule,
    ),
    example: { m: 600, T: 7000, W: 5880, n: 1120, a: 1120 / 600 },
    startWith: ['m', 'T'],
    representation: {
      kind: 'freeBody',
      support: 'hanging',
      mass: 'm',
      tension: 'T',
      weight: 'W',
      net: 'n',
      acceleration: 'a',
    },
  },
];

// ─── H61 circularMotion ──────────────────────────────────────────────────────

const RADIUS = q('r', 'r', 'Radius', 'm', 0.1, 1000, 0.1);
const SPEED = q('v', 'v', 'Speed', 'm/s', 0.1, 100, 0.1);
const AC = q('a', 'aᶜ', 'Centripetal acceleration', 'm/s²', 0, 100000, 0.01);
const FC = q('F', 'Fᶜ', 'Centripetal force', 'N', 0, 1e7, 0.1);

/** a = v²/r. */
const centripetalRule = rule('a = v²/r', '{a} = {v}²/{r}', (v) => v.a! - (v.v! * v.v!) / v.r!, {
  a: [
    (v) => div(v.v! * v.v!, v.r!),
    '{v}²/{r}',
    'Turning takes an acceleration toward the center: v² over r.',
  ],
  v: [
    (v) => Math.sqrt(Math.max(0, v.a! * v.r!)),
    '√({a} × {r})',
    'Undo v²/r: multiply by r, take the square root.',
  ],
  r: [(v) => div(v.v! * v.v!, v.a!), '{v}²/{a}', 'Divide v² by the acceleration.'],
});

const circleDemo = (
  id: string,
  title: string,
  use: string,
  assumptions: string[],
  mode: 'string' | 'car',
  ex: { m: number; r: number; v: number },
): ModuleDef => {
  const a = (ex.v * ex.v) / ex.r;
  return {
    id,
    title,
    use,
    unitSystems: ['metric'],
    assumptions,
    variables: [
      { ...MASS, max: 5000 },
      RADIUS,
      SPEED,
      AC,
      FC,
      ...(mode === 'string' ? [q('T', 'T', 'Time for one turn', 's', 0.01, 10000, 0.01)] : []),
    ],
    ...rules(
      centripetalRule,
      product('F', 'm', 'a', 'Fᶜ = maᶜ', [
        'Newton’s second law toward the center: mass times the centripetal acceleration.',
        'Divide the force by the acceleration.',
        'Divide the force by the mass.',
      ]),
      ...(mode === 'string'
        ? [
            rule('T = 2πr/v', '{T} = 2π × {r}/{v}', (v) => v.T! - (2 * Math.PI * v.r!) / v.v!, {
              T: [
                (v) => div(2 * Math.PI * v.r!, v.v!),
                '2π × {r}/{v}',
                'One turn is the circumference, 2πr, at speed v.',
              ],
              r: [
                (v) => (v.T! * v.v!) / (2 * Math.PI),
                '{T} × {v}/(2π)',
                'The distance in one turn, over 2π.',
              ],
              v: [
                (v) => div(2 * Math.PI * v.r!, v.T!),
                '2π × {r}/{T}',
                'The circumference over the time for a turn.',
              ],
            }),
          ]
        : []),
    ),
    example: {
      ...ex,
      a,
      F: ex.m * a,
      ...(mode === 'string' ? { T: (2 * Math.PI * ex.r) / ex.v } : {}),
    },
    startWith: ['m', 'r', 'v'],
    representation: {
      kind: 'circularMotion',
      mode,
      radius: 'r',
      speed: 'v',
      mass: 'm',
      acceleration: 'a',
      force: 'F',
      ...(mode === 'string' ? { period: 'T' } : {}),
    },
  };
};

const CIRCULAR_DEMOS: ModuleDef[] = [
  circleDemo(
    'g.s11-circular-gravitation-string',
    'A ball whirled on a string',
    'Use this for “A 0.5 kg ball on a 1.2 m string goes round at 6 m/s. What is the tension?”',
    [
      'Seen from above, the ball goes round a flat circle at a steady speed.',
      'Its velocity is along the tangent; its acceleration v²/r points to the center.',
      'The string’s pull is the centripetal force: F = mv²/r.',
    ],
    'string',
    { m: 0.5, r: 1.2, v: 6 },
  ),
  circleDemo(
    'g.s11-circular-gravitation-car',
    'A car rounding a curve',
    'Use this for “A 1,200 kg car takes a 50 m curve at 15 m/s. How much friction does it need?”',
    [
      'On a flat curve, friction between the tires and the road pulls the car toward the center.',
      'Too fast, and friction can’t supply mv²/r: the car slides off along the tangent.',
    ],
    'car',
    { m: 1200, r: 50, v: 15 },
  ),
  {
    id: 'g.s11-circular-gravitation-gravity',
    title: 'Universal gravitation',
    use: 'Use this for “How hard do Earth and the Moon pull on each other?”',
    unitSystems: ['metric'],
    assumptions: [
      'Every two masses pull on each other: F = Gm₁m₂/r², G = 6.674 × 10⁻¹¹ N·m²/kg².',
      'r is the distance between their centers. Twice as far, a quarter of the pull.',
    ],
    variables: [
      q('M', 'm₁', 'First mass', 'kg', 1, 1e31, 1, { scientific: true }),
      q('n', 'm₂', 'Second mass', 'kg', 1, 1e31, 1, { scientific: true }),
      q('d', 'r', 'Distance between centers', 'm', 1, 1e13, 1, { scientific: true }),
      q('F', 'F', 'Pull of gravity', 'N', 0, 1e40, 1, { scientific: true }),
    ],
    ...rules(
      rule(
        'F = Gm₁m₂/r²',
        '{F} = 6.674 × 10⁻¹¹ × {M} × {n}/{d}²',
        (v) => v.F! / ((6.674e-11 * v.M! * v.n!) / (v.d! * v.d!)) - 1,
        {
          F: [
            (v) => div(6.674e-11 * v.M! * v.n!, v.d! * v.d!),
            '6.674 × 10⁻¹¹ × {M} × {n}/{d}²',
            'Multiply G by both masses and divide by the distance squared.',
          ],
          d: [
            (v) => Math.sqrt(Math.max(0, div(6.674e-11 * v.M! * v.n!, v.F!) ?? 0)),
            '√(6.674 × 10⁻¹¹ × {M} × {n}/{F})',
            'Solve for r²: G m₁ m₂ over F, then take the square root.',
          ],
          M: [
            (v) => div(v.F! * v.d! * v.d!, 6.674e-11 * v.n!),
            '{F} × {d}²/(6.674 × 10⁻¹¹ × {n})',
            'Undo the formula for m₁.',
          ],
          n: [
            (v) => div(v.F! * v.d! * v.d!, 6.674e-11 * v.M!),
            '{F} × {d}²/(6.674 × 10⁻¹¹ × {M})',
            'Undo the formula for m₂.',
          ],
        },
      ),
    ),
    example: {
      M: 5.97e24,
      n: 7.35e22,
      d: 3.84e8,
      F: (6.674e-11 * 5.97e24 * 7.35e22) / (3.84e8 * 3.84e8),
    },
    startWith: ['M', 'n', 'd'],
    representation: {
      kind: 'circularMotion',
      mode: 'gravity',
      masses: ['M', 'n'],
      distance: 'd',
      force: 'F',
    },
  },
  ...[
    {
      id: 'g.s12-solar-system-kepler',
      title: 'Kepler’s laws: an orbit as an ellipse',
      use: 'Use this for “Mars orbits at a = 1.52 AU with e = 0.093. How close and how far does it get, and how long is its year?”',
      ex: { a: 1.52, e: 0.093 },
    },
    {
      id: 'g.s12-solar-system-comet',
      title: 'A comet’s stretched orbit',
      use: 'Use this for “A comet has a = 3 AU and e = 0.8. Where is it fastest, and what is its period?”',
      ex: { a: 3, e: 0.8 },
    },
  ].map(({ id, title, use, ex }): ModuleDef => ({
    id,
    title,
    use,
    assumptions: [
      'First law: each planet moves on an ellipse with the sun at one focus.',
      'Second law: the line to the sun sweeps equal areas in equal times, so the planet is fastest at perihelion.',
      'Third law: T² = a³, with T in years and a in AU.',
    ],
    variables: [
      q('a', 'a', 'Semi-major axis', 'AU', 0.1, 100, 0.01),
      q('e', 'e', 'Eccentricity', undefined, 0, 0.95, 0.001),
      q('q', 'q', 'Perihelion distance', 'AU', 0, 200, 0.001),
      q('Q', 'Q', 'Aphelion distance', 'AU', 0, 200, 0.001),
      q('T', 'T', 'Period', 'years', 0.01, 1000, 0.01),
    ],
    ...rules(
      rule('q = a(1 − e)', '{q} = {a} × (1 − {e})', (v) => v.q! - v.a! * (1 - v.e!), {
        q: [
          (v) => v.a! * (1 - v.e!),
          '{a} × (1 − {e})',
          'Closest: a less the sun’s offset from the center, ae.',
        ],
        a: [
          (v) => div(v.q!, 1 - v.e!),
          '{q}/(1 − {e})',
          'Divide the perihelion distance by 1 − e.',
        ],
        e: [(v) => div(v.a! - v.q!, v.a!), '({a} − {q})/{a}', 'The offset a − q, over a.'],
      }),
      rule('Q = a(1 + e)', '{Q} = {a} × (1 + {e})', (v) => v.Q! - v.a! * (1 + v.e!), {
        Q: [(v) => v.a! * (1 + v.e!), '{a} × (1 + {e})', 'Farthest: a plus the offset ae.'],
        a: [(v) => div(v.Q!, 1 + v.e!), '{Q}/(1 + {e})', 'Divide the aphelion distance by 1 + e.'],
        e: [(v) => div(v.Q! - v.a!, v.a!), '({Q} − {a})/{a}', 'The offset Q − a, over a.'],
      }),
      rule('T² = a³', '{T}² = {a}³', (v) => v.T! * v.T! - v.a! ** 3, {
        T: [
          (v) => Math.pow(v.a!, 1.5),
          '√({a}³)',
          'Kepler’s third law: T is the square root of a³.',
        ],
        a: [(v) => Math.cbrt(v.T! * v.T!), '∛({T}²)', 'a is the cube root of T².'],
      }),
    ),
    example: {
      a: ex.a,
      e: ex.e,
      q: ex.a * (1 - ex.e),
      Q: ex.a * (1 + ex.e),
      T: Math.pow(ex.a, 1.5),
    },
    startWith: ['a', 'e'],
    representation: {
      kind: 'circularMotion',
      mode: 'kepler',
      semiMajor: 'a',
      eccentricity: 'e',
      perihelion: 'q',
      aphelion: 'Q',
      period: 'T',
    },
  })),
];

// ─── H62 collision ───────────────────────────────────────────────────────────

const M1 = q('m', 'm₁', 'Mass of cart 1', 'kg', 0.1, 100, 0.1);
const M2 = q('n', 'm₂', 'Mass of cart 2', 'kg', 0.1, 100, 0.1);
const V1 = q('v', 'v₁', 'Velocity of cart 1 before', 'm/s', -50, 50, 0.1);
const V2 = q('w', 'v₂', 'Velocity of cart 2 before', 'm/s', -50, 50, 0.1);
const P = q('p', 'p', 'Total momentum', 'kg·m/s', -10000, 10000, 0.1);

/** p = m₁v₁ + m₂v₂. */
const momentumRule = rule(
  'p = m₁v₁ + m₂v₂',
  '{p} = {m} × {v} + {n} × {w}',
  (v) => v.p! - v.m! * v.v! - v.n! * v.w!,
  {
    p: [
      (v) => v.m! * v.v! + v.n! * v.w!,
      '{m} × {v} + {n} × {w}',
      'Add the carts’ momenta, signs and all: + to the right.',
    ],
    v: [
      (v) => div(v.p! - v.n! * v.w!, v.m!),
      '({p} − {n} × {w})/{m}',
      'Take cart 2’s momentum from the total, divide by m₁.',
    ],
    w: [
      (v) => div(v.p! - v.m! * v.v!, v.n!),
      '({p} − {m} × {v})/{n}',
      'Take cart 1’s momentum from the total, divide by m₂.',
    ],
    m: [
      (v) => div(v.p! - v.n! * v.w!, v.v!),
      '({p} − {n} × {w})/{v}',
      'Cart 1’s momentum over its velocity.',
    ],
    n: [
      (v) => div(v.p! - v.m! * v.v!, v.w!),
      '({p} − {m} × {v})/{w}',
      'Cart 2’s momentum over its velocity.',
    ],
  },
);

const stickDemo = (
  id: string,
  title: string,
  use: string,
  ex: { m: number; n: number; v: number; w: number },
): ModuleDef => {
  const p = ex.m * ex.v + ex.n * ex.w;
  const u = p / (ex.m + ex.n);
  return {
    id,
    title,
    use,
    unitSystems: ['metric'],
    assumptions: [
      'No friction on the track: the carts’ total momentum is the same before and after.',
      'Velocity to the right is +, to the left −.',
      'They couple and move on together: a perfectly inelastic collision. Kinetic energy is lost to heat and sound.',
    ],
    variables: [M1, M2, V1, V2, P, q('u', 'v′', 'Velocity together after', 'm/s', -50, 50, 0.01)],
    ...rules(
      momentumRule,
      rule('v′ = p/(m₁ + m₂)', '{u} = {p}/({m} + {n})', (v) => v.u! * (v.m! + v.n!) - v.p!, {
        u: [
          (v) => div(v.p!, v.m! + v.n!),
          '{p}/({m} + {n})',
          'The same momentum now carried by both masses together.',
        ],
        p: [
          (v) => v.u! * (v.m! + v.n!),
          '{u} × ({m} + {n})',
          'Both masses at the shared velocity.',
        ],
      }),
    ),
    example: { ...ex, p, u },
    startWith: ['m', 'n', 'v', 'w'],
    representation: {
      kind: 'collision',
      type: 'stick',
      masses: ['m', 'n'],
      before: ['v', 'w'],
      after: ['u'],
      momentum: 'p',
    },
  };
};

const COLLISION_DEMOS: ModuleDef[] = [
  stickDemo(
    'g.s11-momentum-stick',
    'Carts that stick together',
    'Use this for “A 2 kg cart at 3 m/s hits a 1 kg cart at rest and they stick. How fast do they move off?”',
    { m: 2, n: 1, v: 3, w: 0.5 },
  ),
  stickDemo(
    'g.s11-momentum-head-on',
    'A head-on crash',
    'Use this for “A 3 kg cart at 2 m/s meets a 2 kg cart coming the other way at 4 m/s. They lock together. Which way do they go?”',
    { m: 3, n: 2, v: 2, w: -4 },
  ),
  {
    id: 'g.s11-momentum-elastic',
    title: 'An elastic collision',
    use: 'Use this for “A 1 kg cart at 4 m/s bounces off a 3 kg cart moving at 1 m/s. What are their velocities after?”',
    unitSystems: ['metric'],
    assumptions: [
      'Magnets on the carts: they bounce apart without touching, keeping both momentum and kinetic energy.',
      'v₁′ = ((m₁ − m₂)v₁ + 2m₂v₂)/(m₁ + m₂) and v₂′ = ((m₂ − m₁)v₂ + 2m₁v₁)/(m₁ + m₂).',
    ],
    variables: [
      M1,
      M2,
      V1,
      V2,
      q('a', 'v₁′', 'Velocity of cart 1 after', 'm/s', -100, 100, 0.01),
      q('b', 'v₂′', 'Velocity of cart 2 after', 'm/s', -100, 100, 0.01),
    ],
    ...rules(
      rule(
        'v₁′ = ((m₁ − m₂)v₁ + 2m₂v₂)/(m₁ + m₂)',
        '{a} = (({m} − {n}) × {v} + 2 × {n} × {w})/({m} + {n})',
        (v) => v.a! * (v.m! + v.n!) - ((v.m! - v.n!) * v.v! + 2 * v.n! * v.w!),
        {
          a: [
            (v) => div((v.m! - v.n!) * v.v! + 2 * v.n! * v.w!, v.m! + v.n!),
            '(({m} − {n}) × {v} + 2 × {n} × {w})/({m} + {n})',
            'Momentum and kinetic energy both kept: this is cart 1’s velocity after.',
          ],
          w: [
            (v) => div(v.a! * (v.m! + v.n!) - (v.m! - v.n!) * v.v!, 2 * v.n!),
            '({a} × ({m} + {n}) − ({m} − {n}) × {v})/(2 × {n})',
            'Undo the formula for v₂.',
          ],
        },
      ),
      rule(
        'v₂′ = ((m₂ − m₁)v₂ + 2m₁v₁)/(m₁ + m₂)',
        '{b} = (({n} − {m}) × {w} + 2 × {m} × {v})/({m} + {n})',
        (v) => v.b! * (v.m! + v.n!) - ((v.n! - v.m!) * v.w! + 2 * v.m! * v.v!),
        {
          b: [
            (v) => div((v.n! - v.m!) * v.w! + 2 * v.m! * v.v!, v.m! + v.n!),
            '(({n} − {m}) × {w} + 2 × {m} × {v})/({m} + {n})',
            'The same rule with the carts swapped.',
          ],
          v: [
            (v) => div(v.b! * (v.m! + v.n!) - (v.n! - v.m!) * v.w!, 2 * v.m!),
            '({b} × ({m} + {n}) − ({n} − {m}) × {w})/(2 × {m})',
            'Undo the formula for v₁.',
          ],
        },
      ),
    ),
    example: { m: 1, n: 3, v: 4, w: 1, a: -0.5, b: 2.5 },
    startWith: ['m', 'n', 'v', 'w'],
    representation: {
      kind: 'collision',
      type: 'elastic',
      masses: ['m', 'n'],
      before: ['v', 'w'],
      after: ['a', 'b'],
    },
  },
  {
    id: 'g.s11-momentum-explode',
    title: 'Pushed apart by a spring',
    use: 'Use this for “Two carts, 2 kg and 3 kg, roll together at 1 m/s. A spring pushes them apart and the 2 kg cart leaves at 2 m/s backward. How fast is the other?”',
    unitSystems: ['metric'],
    assumptions: [
      'The spring pushes both carts equally and oppositely, so the total momentum doesn’t change.',
      'The spring’s stored energy becomes extra kinetic energy.',
    ],
    variables: [
      M1,
      M2,
      q('v', 'v', 'Velocity together before', 'm/s', -50, 50, 0.1),
      P,
      q('a', 'v₁′', 'Velocity of cart 1 after', 'm/s', -100, 100, 0.1),
      q('b', 'v₂′', 'Velocity of cart 2 after', 'm/s', -100, 100, 0.01),
    ],
    ...rules(
      rule('p = (m₁ + m₂)v', '{p} = ({m} + {n}) × {v}', (v) => v.p! - (v.m! + v.n!) * v.v!, {
        p: [(v) => (v.m! + v.n!) * v.v!, '({m} + {n}) × {v}', 'Both masses moving together at v.'],
        v: [
          (v) => div(v.p!, v.m! + v.n!),
          '{p}/({m} + {n})',
          'Share the momentum over both masses.',
        ],
      }),
      rule(
        'v₂′ = (p − m₁v₁′)/m₂',
        '{b} = ({p} − {m} × {a})/{n}',
        (v) => v.b! * v.n! - (v.p! - v.m! * v.a!),
        {
          b: [
            (v) => div(v.p! - v.m! * v.a!, v.n!),
            '({p} − {m} × {a})/{n}',
            'The momentum cart 1 doesn’t carry is cart 2’s.',
          ],
          a: [
            (v) => div(v.p! - v.n! * v.b!, v.m!),
            '({p} − {n} × {b})/{m}',
            'The momentum cart 2 doesn’t carry is cart 1’s.',
          ],
        },
      ),
    ),
    example: { m: 2, n: 3, v: 1, p: 5, a: -2, b: 3 },
    startWith: ['m', 'n', 'v', 'a'],
    representation: {
      kind: 'collision',
      type: 'explode',
      masses: ['m', 'n'],
      before: ['v'],
      after: ['a', 'b'],
      momentum: 'p',
    },
  },
];

export const HSK_GALLERY_MODULES: ModuleDef[] = [
  ...KINEMATICS_DEMOS,
  ...PROJECTILE_DEMOS,
  ...FREE_BODY_DEMOS,
  ...CIRCULAR_DEMOS,
  ...COLLISION_DEMOS,
];
export const HSK_GALLERY_LAYOUTS: LayoutDef[] = [];
