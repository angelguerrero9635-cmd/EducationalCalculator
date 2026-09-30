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
    vars: Object.keys(parts),
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

export const HSK_GALLERY_MODULES: ModuleDef[] = [...KINEMATICS_DEMOS, ...PROJECTILE_DEMOS];
export const HSK_GALLERY_LAYOUTS: LayoutDef[] = [];
