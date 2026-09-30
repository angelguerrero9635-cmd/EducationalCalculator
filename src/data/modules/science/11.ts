/**
 * Grade 11 science: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md; the
 * direction plan and build notes: docs/BUILD_HS.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/science11.ts`.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { ModuleDef, StepText } from '../types';

// ─── Helpers for this grade (the group HK gallery's, kept here) ─────────────

/** A relation and its step text, built together so a page lists both from one place. */
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

/** Degrees to radians. */
const RAD = Math.PI / 180;
/** Gravity's pull on each kilogram, N/kg (m/s²). */
const G = 9.8;

/** out = a × b (or a × a fixed number), each way, with the step text for each. */
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

/** out = a ÷ b, each way. */
const quotient = (
  out: string,
  a: string,
  b: string,
  sym: string,
  hows: [string, string, string],
): Rule =>
  rule(sym, `{${out}} = {${a}}/{${b}}`, (v) => v[out]! * v[b]! - v[a]!, {
    [out]: [(v) => div(v[a]!, v[b]!), `{${a}}/{${b}}`, hows[0]],
    [a]: [(v) => v[out]! * v[b]!, `{${out}} × {${b}}`, hows[1]],
    [b]: [(v) => div(v[a]!, v[out]!), `{${a}}/{${out}}`, hows[2]],
  });

/** out = a − b, each way. */
const difference = (out: string, a: string, b: string, sym: string, how: string): Rule =>
  rule(sym, `{${out}} = {${a}} − {${b}}`, (v) => v[out]! - (v[a]! - v[b]!), {
    [out]: [(v) => v[a]! - v[b]!, `{${a}} − {${b}}`, how],
    [a]: [(v) => v[out]! + v[b]!, `{${out}} + {${b}}`, 'Add back what was taken away.'],
    [b]: [(v) => v[a]! - v[out]!, `{${a}} − {${out}}`, 'Take the result from the first.'],
  });

/** out = a + b, each way. */
const sum = (out: string, a: string, b: string, sym: string, how: string): Rule =>
  rule(sym, `{${out}} = {${a}} + {${b}}`, (v) => v[out]! - v[a]! - v[b]!, {
    [out]: [(v) => v[a]! + v[b]!, `{${a}} + {${b}}`, how],
    [a]: [(v) => v[out]! - v[b]!, `{${out}} − {${b}}`, 'Take the second part from the total.'],
    [b]: [(v) => v[out]! - v[a]!, `{${out}} − {${a}}`, 'Take the first part from the total.'],
  });

/** A value fixed by the page (g, a level launch): `id = value`, worked out, never typed. */
const fixed = (id: string, sym: string, value: number, how: string): Rule =>
  rule(`${sym} = ${value}`, `{${id}} = ${String(value).replace('-', '−')}`, (v) => v[id]! - value, {
    [id]: [(v) => value + 0 * (v[id] ?? 0), String(value).replace('-', '−'), how],
  });

/** |r| = √(x² + y²), worked forward only. */
const magnitude = (out: string, x: string, y: string, sym: string, how: string): Rule => ({
  relation: {
    id: sym,
    display: `{${out}} = √({${x}}² + {${y}}²)`,
    vars: [out, x, y],
    residual: (v) => v[out]! - Math.hypot(v[x]!, v[y]!),
    solve: {
      [out]: (v) => Math.hypot(v[x]!, v[y]!),
      [x]: () => undefined,
      [y]: () => undefined,
    },
  },
  steps: { [out]: { expr: `√({${x}}² + {${y}}²)`, how } },
});

/** A component from a size and a direction in degrees: m cos θ or m sin θ. */
const componentOf = (
  out: string,
  m: string,
  d: string,
  fn: 'cos' | 'sin',
  sym: string,
  how: string,
): Rule => {
  const f = fn === 'cos' ? Math.cos : Math.sin;
  return {
    relation: {
      id: sym,
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
      [out]: { expr: `{${m}} × ${fn}({${d}})`, how },
      [m]: {
        expr: `{${out}}/${fn}({${d}})`,
        how: `Divide the component by the ${fn === 'cos' ? 'cosine' : 'sine'} of the angle.`,
      },
    },
  };
};

// ─── s.11.kinematics-1d ─────────────────────────────────────────────────────

const TIME = q('t', 't', 'Time', 's', 0.01, 120, 0.01);
const V0 = q('u', 'v₀', 'Initial velocity', 'm/s', -100, 100, 0.1);
const ACC1 = q('a', 'a', 'Acceleration', 'm/s²', -50, 50, 0.1);
const V1 = q('v', 'v', 'Final velocity', 'm/s', -500, 500, 0.01);
const DX = q('d', 'Δx', 'Displacement', 'm', -1e5, 1e5, 0.01);

/** v = v₀ + at. */
const velocityRule = rule(
  'v = v₀ + at',
  '{v} = {u} + {a} × {t}',
  (v) => v.v! - v.u! - v.a! * v.t!,
  {
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
  },
);

/** Δx = v₀t + ½at². */
const displacementRule = rule(
  'Δx = v₀t + ½at²',
  '{d} = {u} × {t} + ½ × {a} × {t}²',
  (v) => v.d! - v.u! * v.t! - 0.5 * v.a! * v.t! * v.t!,
  {
    d: [
      (v) => v.u! * v.t! + 0.5 * v.a! * v.t! * v.t!,
      '{u} × {t} + ½ × {a} × {t}²',
      'The distance at the starting velocity, plus the extra that the steady acceleration adds.',
    ],
    u: [
      (v) => div(v.d! - 0.5 * v.a! * v.t! * v.t!, v.t!),
      '({d} − ½ × {a} × {t}²)/{t}',
      'Take off what the acceleration added, then divide by the time.',
    ],
    a: [
      (v) => div(2 * (v.d! - v.u! * v.t!), v.t! * v.t!),
      '2 × ({d} − {u} × {t})/({t}²)',
      'Take off the distance at v₀, then undo ½t².',
    ],
  },
);

const kinematicsPages: ModuleDef[] = [
  (() => {
    const [u, a, t] = [4, 2.5, 6];
    return {
      id: 's.11.kinematics-1d',
      unitSystems: ['metric'],
      assumptions: [
        'The acceleration is constant the whole time.',
        '+ is the direction it starts moving, so an object slowing down has a < 0.',
        'Displacement Δx is where it ends up from the start, not how far it went.',
        'The shaded area under the v–t line is the displacement.',
      ],
      variables: [V0, ACC1, TIME, V1, DX],
      ...rules(velocityRule, displacementRule),
      example: { u, a, t, v: u + a * t, d: u * t + 0.5 * a * t * t },
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
    } satisfies ModuleDef;
  })(),
  (() => {
    const t = 3;
    return {
      id: 's.11.kinematics-1d~free-fall',
      title: 'Free fall from rest',
      use: 'Use this for “A stone falls from rest for 3 s. How far does it fall, and how fast is it going?”',
      unitSystems: ['metric'],
      assumptions: [
        'Dropped from rest, so it starts at v₀ = 0.',
        'Air resistance is ignored: every object falls with a = −9.8 m/s², whatever its mass.',
        'Up is +, so the velocity is negative on the way down; the drop d is how far it fell.',
      ],
      variables: [
        { ...ACC1, name: 'Acceleration of gravity', derived: true },
        { ...TIME, max: 30 },
        { ...V1, name: 'Velocity (− is down)', min: -300, max: 0, derived: true },
        q('d', 'd', 'Drop', 'm', 0, 5000, 0.01),
      ],
      ...rules(
        fixed(
          'a',
          'a',
          -G,
          'Near Earth’s surface gravity speeds a falling object up by 9.8 m/s each second, downward.',
        ),
        rule('v = at', '{v} = {a} × {t}', (v) => v.v! - v.a! * v.t!, {
          v: [
            (v) => v.a! * v.t!,
            '{a} × {t}',
            'From rest, the velocity is the acceleration times the time.',
          ],
        }),
        rule('d = ½gt²', '{d} = ½ × 9.8 × {t}²', (v) => v.d! - 0.5 * G * v.t! * v.t!, {
          d: [
            (v) => 0.5 * G * v.t! * v.t!,
            '½ × 9.8 × {t}²',
            'From rest the drop is ½gt²: it grows with the square of the time.',
          ],
          t: [
            (v) => (v.d! >= 0 ? Math.sqrt((2 * v.d!) / G) : undefined),
            '√(2 × {d}/9.8)',
            'Undo ½gt²: double the drop, divide by g, take the square root.',
          ],
        }),
      ),
      example: { a: -G, t, v: -G * t, d: 0.5 * G * t * t },
      startWith: ['t'],
      representation: {
        kind: 'motionGraph',
        graph: 'speed',
        time: 't',
        acceleration: 'a',
        speed: 'v',
        start: 0,
        kinematics: { view: 'velocity' },
      },
      pictureLabels: ['d'],
    } satisfies ModuleDef;
  })(),
  (() => {
    const [u, v, a] = [25, 5, -5];
    return {
      id: 's.11.kinematics-1d~braking',
      title: 'Braking distance',
      use: 'Use this for “A car at 25 m/s brakes at 5 m/s² to a stop. How far does it go, and how long does it take?”',
      unitSystems: ['metric'],
      assumptions: [
        'The brakes give a steady acceleration against the motion: a < 0.',
        'v² = v₀² + 2aΔx needs no time: use it when the time is not given.',
        'A stop is v = 0.',
      ],
      variables: [{ ...V0, min: 0 }, { ...V1, min: 0, max: 100 }, ACC1, { ...DX, min: 0 }, TIME],
      ...rules(
        rule(
          'v² = v₀² + 2aΔx',
          '{v}² = {u}² + 2 × {a} × {d}',
          (v) => v.v! * v.v! - v.u! * v.u! - 2 * v.a! * v.d!,
          {
            v: [
              (v) => {
                const s = v.u! * v.u! + 2 * v.a! * v.d!;
                return s < 0 ? undefined : Math.sqrt(s);
              },
              '√({u}² + 2 × {a} × {d})',
              'Square v₀, add 2aΔx, then take the square root.',
            ],
            u: [
              (v) => {
                const s = v.v! * v.v! - 2 * v.a! * v.d!;
                return s < 0 ? undefined : Math.sqrt(s);
              },
              '√({v}² − 2 × {a} × {d})',
              'Take 2aΔx from v², then take the square root.',
            ],
            a: [
              (v) => div(v.v! * v.v! - v.u! * v.u!, 2 * v.d!),
              '({v}² − {u}²)/(2 × {d})',
              'The change in the square of the speed, over twice the distance.',
            ],
            d: [
              (v) => div(v.v! * v.v! - v.u! * v.u!, 2 * v.a!),
              '({v}² − {u}²)/(2 × {a})',
              'The change in the square of the speed, over 2a.',
            ],
          },
        ),
        velocityRule,
      ),
      example: { u, v, a, d: (v * v - u * u) / (2 * a), t: (v - u) / a },
      startWith: ['u', 'v', 'a'],
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
    } satisfies ModuleDef;
  })(),
  (() => {
    const [p, u, a, t, s] = [10, -6, 2, 8, 5];
    const w = u + a * s;
    return {
      id: 's.11.kinematics-1d~position-graph',
      title: 'Position–time graph: velocity is the slope',
      use: 'Use this for “x = 10 − 6t + t². How fast is it moving at t = 5 s, where is it, and when does it turn round?”',
      unitSystems: ['metric'],
      assumptions: [
        'With a steady acceleration the position is x = x₀ + v₀t + ½at², a parabola against time.',
        'The slope of the tangent at a moment is the velocity at that moment.',
        'Where the tangent is flat, the object stops for an instant and turns round.',
      ],
      variables: [
        q('p', 'x₀', 'Starting position', 'm', -1e4, 1e4, 0.1),
        V0,
        ACC1,
        { ...TIME, name: 'Time shown on the graph' },
        V1,
        q('s', 't₁', 'Time of the tangent', 's', 0, 120, 0.1),
        q('w', 'v₁', 'Velocity at t₁ (the slope)', 'm/s', -500, 500, 0.01),
        q('x', 'x₁', 'Position at t₁', 'm', -1e5, 1e5, 0.01),
      ],
      ...rules(
        velocityRule,
        rule('v₁ = v₀ + at₁', '{w} = {u} + {a} × {s}', (v) => v.w! - v.u! - v.a! * v.s!, {
          w: [
            (v) => v.u! + v.a! * v.s!,
            '{u} + {a} × {s}',
            'The tangent’s slope is the velocity then: v₀ plus a for every second up to t₁.',
          ],
          u: [(v) => v.w! - v.a! * v.s!, '{w} − {a} × {s}', 'Take off the change up to t₁.'],
          a: [(v) => div(v.w! - v.u!, v.s!), '({w} − {u})/{s}', 'The change in velocity over t₁.'],
          s: [
            (v) => div(v.w! - v.u!, v.a!),
            '({w} − {u})/{a}',
            'Divide the change in velocity by a.',
          ],
        }),
        rule(
          'x₁ = x₀ + v₀t₁ + ½at₁²',
          '{x} = {p} + {u} × {s} + ½ × {a} × {s}²',
          (v) => v.x! - v.p! - v.u! * v.s! - 0.5 * v.a! * v.s! * v.s!,
          {
            x: [
              (v) => v.p! + v.u! * v.s! + 0.5 * v.a! * v.s! * v.s!,
              '{p} + {u} × {s} + ½ × {a} × {s}²',
              'Start at x₀, then add the displacement up to t₁.',
            ],
            p: [
              (v) => v.x! - v.u! * v.s! - 0.5 * v.a! * v.s! * v.s!,
              '{x} − {u} × {s} − ½ × {a} × {s}²',
              'Take the displacement up to t₁ from the position then.',
            ],
          },
        ),
      ),
      example: { p, u, a, t, v: u + a * t, s, w, x: p + u * s + 0.5 * a * s * s },
      startWith: ['p', 'u', 'a', 't', 's'],
      representation: {
        kind: 'motionGraph',
        graph: 'speed',
        time: 't',
        acceleration: 'a',
        speed: 'v',
        start: 'u',
        kinematics: { view: 'position', at: 's', slope: 'w', position: 'p' },
      },
      pictureLabels: ['x'],
    } satisfies ModuleDef;
  })(),
  (() => {
    const [u, a, t] = [12, -4, 5];
    const v = u + a * t;
    return {
      id: 's.11.kinematics-1d~turn',
      title: 'Turning round: displacement and distance',
      use: 'Use this for “A ball rolls up a ramp at 12 m/s and slows at 4 m/s². Where is it after 5 s, and how far has it rolled?”',
      unitSystems: ['metric'],
      assumptions: [
        '+ is the way it starts, so a < 0 slows it, stops it for an instant and brings it back.',
        'For the distance, v₀ and v have opposite signs: it has turned round.',
        'Distance adds the way out and the way back; displacement takes the way back away.',
      ],
      variables: [
        { ...V0, min: 0 },
        { ...ACC1, max: -0.1 },
        TIME,
        { ...V1, max: 0 },
        DX,
        q('D', 'D', 'Distance traveled', 'm', 0, 1e6, 0.01, { derived: true }),
      ],
      ...rules(
        velocityRule,
        displacementRule,
        rule(
          'D = (v₀² + v²)/(−2a)',
          '{D} = ({u}² + {v}²)/(−2 × {a})',
          (v) => v.D! + (v.u! * v.u! + v.v! * v.v!) / (2 * v.a!),
          {
            D: [
              (v) => div(v.u! * v.u! + v.v! * v.v!, -2 * v.a!),
              '({u}² + {v}²)/(−2 × {a})',
              'Out to the stop is v₀² ÷ (−2a) and back is v² ÷ (−2a), both positive since a < 0: add them.',
            ],
          },
        ),
      ),
      example: {
        u,
        a,
        t,
        v,
        d: u * t + 0.5 * a * t * t,
        D: (u * u + v * v) / (-2 * a),
      },
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
      pictureLabels: ['D'],
    } satisfies ModuleDef;
  })(),
];

// ─── s.11.kinematics-2d ─────────────────────────────────────────────────────

const LAUNCH_V = q('v', 'v₀', 'Launch speed', 'm/s', 0.1, 150, 0.1);
const LAUNCH_ANGLE = q('q', 'θ', 'Launch angle', '°', 0, 90, 1);
const LAUNCH_H = q('h', 'h', 'Launch height', 'm', 0, 500, 0.1);
const FLIGHT = q('T', 'T', 'Time in the air', 's', 0, 100, 0.01);
const RANGE = q('R', 'R', 'Range', 'm', 0, 1e5, 0.01);

/** vₓ = v₀ cos θ and v_y = v₀ sin θ. */
const launchPart = (id: string, fn: 'cos' | 'sin', what: string): Rule => {
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
        `The angle whose ${fn === 'cos' ? 'cosine' : 'sine'} is the ${what} part over the speed.`,
      ],
    },
  );
};

const rangeRule = rule('R = vₓT', '{R} = {x} × {T}', (v) => v.R! - v.x! * v.T!, {
  R: [(v) => v.x! * v.T!, '{x} × {T}', 'Across, the speed stays vₓ for the whole flight.'],
  x: [(v) => div(v.R!, v.T!), '{R}/{T}', 'Divide the range by the time in the air.'],
  T: [(v) => div(v.R!, v.x!), '{R}/{x}', 'Divide the range by the horizontal speed.'],
});

const projectilePages: ModuleDef[] = [
  (() => {
    const [v, qq, h] = [20, 30, 1.5];
    const x = v * Math.cos(qq * RAD);
    const y = v * Math.sin(qq * RAD);
    const T = (y + Math.sqrt(y * y + 2 * G * h)) / G;
    return {
      id: 's.11.kinematics-2d',
      unitSystems: ['metric'],
      assumptions: [
        'No air resistance, and g = 9.8 m/s² downward.',
        'Across nothing pushes, so vₓ stays the same; v_y drops by 9.8 m/s every second.',
        'It lands on level ground h below the launch point (h = 0 for a launch from the ground).',
      ],
      variables: [
        LAUNCH_V,
        LAUNCH_ANGLE,
        LAUNCH_H,
        q('x', 'vₓ', 'Horizontal velocity', 'm/s', 0, 150, 0.01, { derived: true }),
        q('y', 'v_y', 'Vertical launch velocity', 'm/s', 0, 150, 0.01, { derived: true }),
        FLIGHT,
        RANGE,
        q('H', 'H', 'Maximum height', 'm', 0, 5000, 0.01),
      ],
      ...rules(
        launchPart('x', 'cos', 'horizontal'),
        launchPart('y', 'sin', 'vertical'),
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
        rangeRule,
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
          },
        ),
      ),
      example: { v, q: qq, h, x, y, T, R: x * T, H: h + (y * y) / (2 * G) },
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
    } satisfies ModuleDef;
  })(),
  (() => {
    const [v, h] = [8, 45];
    const T = Math.sqrt((2 * h) / G);
    return {
      id: 's.11.kinematics-2d~cliff',
      title: 'Launched level off a ledge',
      use: 'Use this for “A ball rolls off a 45 m ledge at 8 m/s. How long is it in the air, and how far out does it land?”',
      unitSystems: ['metric'],
      assumptions: [
        'It leaves level (θ = 0), so it starts with no vertical velocity.',
        'It falls as if dropped, while moving across at a steady v₀.',
        'No air resistance, and g = 9.8 m/s².',
      ],
      variables: [
        { ...LAUNCH_ANGLE, derived: true },
        { ...LAUNCH_V, name: 'Speed off the edge' },
        { ...LAUNCH_H, name: 'Height of the ledge', min: 0.01 },
        FLIGHT,
        RANGE,
      ],
      standalone: {
        vars: ['q'],
        why: 'The launch is level on this page: θ = 0 is drawn but never changes.',
      },
      ...rules(
        fixed('q', 'θ', 0, 'Rolled straight off the edge, the launch is level.'),
        rule('T = √(2h/g)', '{T} = √(2 × {h}/9.8)', (v) => v.T! - Math.sqrt((2 * v.h!) / G), {
          T: [
            (v) => (v.h! >= 0 ? Math.sqrt((2 * v.h!) / G) : undefined),
            '√(2 × {h}/9.8)',
            'Falling from rest through h: h = ½gT², so T = √(2h/g).',
          ],
          h: [(v) => (G * v.T! * v.T!) / 2, '9.8 × {T}²/2', 'The drop in time T: ½gT².'],
        }),
        product('R', 'v', 'T', 'R = v₀T', [
          'Across, it keeps v₀ for the whole fall.',
          'Divide the range by the time in the air.',
          'Divide the range by the speed off the edge.',
        ]),
      ),
      example: { q: 0, v, h, T, R: v * T },
      startWith: ['v', 'h'],
      representation: {
        kind: 'projectile',
        speed: 'v',
        angle: 'q',
        height: 'h',
        time: 'T',
        range: 'R',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [b, c, w] = [4, 3, 120];
    const t = w / b;
    return {
      id: 's.11.kinematics-2d~boat',
      title: 'A boat crossing a river',
      use: 'Use this for “A boat heads straight across a 120 m river at 4 m/s; the current is 3 m/s. How long does it take, and how far downstream does it land?”',
      unitSystems: ['metric'],
      assumptions: [
        'The boat heads straight across (north); the current flows east.',
        'Its velocity over the ground is the vector sum of the two: they are at right angles.',
        'The current doesn’t slow the crossing: the time is the width over the boat’s own speed.',
      ],
      variables: [
        q('b', 'b', 'Boat’s speed in still water', 'm/s', 0.1, 50, 0.1),
        q('c', 'c', 'Current’s speed', 'm/s', 0.1, 50, 0.1),
        q('r', 'v', 'Speed over the ground', 'm/s', 0, 100, 0.01),
        q('a', 'θ', 'Direction, from east', '°', 0, 90, 0.1),
        q('w', 'W', 'River width', 'm', 1, 10000, 1),
        q('t', 't', 'Crossing time', 's', 0, 1e5, 0.01),
        q('s', 's', 'Drift downstream', 'm', 0, 1e6, 0.01),
      ],
      ...rules(
        {
          relation: {
            id: 'v = √(b² + c²)',
            display: '{r} = √({b}² + {c}²)',
            vars: ['r', 'b', 'c'],
            residual: (v) => v.r! - Math.hypot(v.b!, v.c!),
            solve: {
              r: (v) => Math.hypot(v.b!, v.c!),
              b: (v) => (v.r! < v.c! ? undefined : Math.sqrt(v.r! ** 2 - v.c! ** 2)),
              c: (v) => (v.r! < v.b! ? undefined : Math.sqrt(v.r! ** 2 - v.b! ** 2)),
            },
          },
          steps: {
            r: {
              expr: '√({b}² + {c}²)',
              how: 'The two velocities are at right angles: add them by Pythagoras.',
            },
            b: {
              expr: '√({r}² − {c}²)',
              how: 'Take the current’s square from the ground speed’s square.',
            },
            c: {
              expr: '√({r}² − {b}²)',
              how: 'Take the boat’s square from the ground speed’s square.',
            },
          },
        },
        rule(
          'θ = arctan(b/c)',
          '{a} = arctan({b}/{c})',
          (v) => Math.tan(v.a! * RAD) * v.c! - v.b!,
          {
            a: [
              (v) => Math.atan2(v.b!, v.c!) / RAD,
              'arctan({b}/{c})',
              'The tangent of the angle from east is north over east.',
            ],
            b: [(v) => v.c! * Math.tan(v.a! * RAD), '{c} × tan({a})', 'North is east times tan θ.'],
            c: [
              (v) => div(v.b!, Math.tan(v.a! * RAD)),
              '{b}/tan({a})',
              'East is north over tan θ.',
            ],
          },
        ),
        quotient('t', 'w', 'b', 't = W ÷ b', [
          'Only the boat’s own speed carries it across: the width over that speed.',
          'The boat’s speed times the time is the width.',
          'Divide the width by the crossing time.',
        ]),
        product('s', 'c', 't', 's = ct', [
          'All the while, the current carries it east: the current’s speed times the time.',
          'Divide the drift by the crossing time.',
          'Divide the drift by the current’s speed.',
        ]),
      ),
      example: { b, c, r: Math.hypot(b, c), a: Math.atan2(b, c) / RAD, w, t, s: c * t },
      startWith: ['b', 'c', 'w'],
      representation: {
        kind: 'vectorDiagram',
        vectors: [
          { name: 'boat', magnitude: 'b', direction: 90 },
          { name: 'current', magnitude: 'c', direction: 0 },
        ],
        sum: 'tipToTail',
        result: { name: 'v', magnitude: 'r', direction: 'a' },
        unit: 'm/s',
        axes: { x: 'east', y: 'north' },
      },
      pictureLabels: ['w', 't', 's'],
    } satisfies ModuleDef;
  })(),
  (() => {
    const [m, d] = [15, 40];
    return {
      id: 's.11.kinematics-2d~components',
      title: 'Components of a velocity',
      use: 'Use this for “A ball leaves at 15 m/s, 40° above level. What are its horizontal and vertical velocities?”',
      unitSystems: ['metric'],
      assumptions: [
        'The angle is measured from the horizontal (east), counterclockwise.',
        'The two components are the legs of a right triangle; the speed is its hypotenuse.',
      ],
      variables: [
        q('m', 'v', 'Speed', 'm/s', 0, 1000, 0.01),
        q('t', 'θ', 'Angle above level', '°', 0, 360, 1),
        q('x', 'vₓ', 'Horizontal velocity', 'm/s', -1000, 1000, 0.01),
        q('y', 'v_y', 'Vertical velocity', 'm/s', -1000, 1000, 0.01),
      ],
      ...rules(
        componentOf(
          'x',
          'm',
          't',
          'cos',
          'vₓ = v cos θ',
          'The horizontal part is the speed times cos θ.',
        ),
        componentOf(
          'y',
          'm',
          't',
          'sin',
          'v_y = v sin θ',
          'The vertical part is the speed times sin θ.',
        ),
      ),
      example: { m, t: d, x: m * Math.cos(d * RAD), y: m * Math.sin(d * RAD) },
      startWith: ['m', 't'],
      representation: {
        kind: 'vectorDiagram',
        vectors: [{ name: 'v', magnitude: 'm', direction: 't' }],
        components: true,
        unit: 'm/s',
      },
      pictureLabels: ['x', 'y'],
    } satisfies ModuleDef;
  })(),
];

// ─── s.11.dynamics-vectors ──────────────────────────────────────────────────

const MASS = q('m', 'm', 'Mass', 'kg', 0.1, 5000, 0.1);
const MU = q('k', 'μₖ', 'Coefficient of kinetic friction', undefined, 0, 1.5, 0.01);
const WEIGHT = q('W', 'W', 'Weight', 'N', 0, 1e5, 0.01);
const NORMAL = q('N', 'F_N', 'Normal force', 'N', 0, 1e5, 0.01);
const FRICTION = q('f', 'f', 'Friction', 'N', 0, 1e5, 0.01);
const NET = q('n', 'F_net', 'Net force', 'N', -1e5, 1e5, 0.01);
const ACC = q('a', 'a', 'Acceleration', 'm/s²', -1000, 1000, 0.01);

const weightRule = product('W', 'm', G, 'W = mg', [
  'Earth pulls each kilogram with 9.8 N.',
  'Divide the weight by 9.8 N/kg.',
]);
const frictionRule = product('f', 'k', 'N', 'f = μₖF_N', [
  'Friction is μₖ times the normal force pressing the surfaces together.',
  'Divide the friction by the normal force.',
  'Divide the friction by μₖ.',
]);
const newtonRule = rule('a = F_net ÷ m', '{a} = {n}/{m}', (v) => v.a! * v.m! - v.n!, {
  a: [(v) => div(v.n!, v.m!), '{n}/{m}', 'Newton’s second law: the net force over the mass.'],
  n: [(v) => v.a! * v.m!, '{a} × {m}', 'The net force is the mass times the acceleration.'],
  m: [(v) => div(v.n!, v.a!), '{n}/{a}', 'Divide the net force by the acceleration.'],
});

const dynamicsPages: ModuleDef[] = [
  (() => {
    const [m, F, k] = [20, 120, 0.3];
    const W = m * G;
    const f = k * W;
    return {
      id: 's.11.dynamics-vectors',
      unitSystems: ['metric'],
      assumptions: [
        'The push is level, and the block is already sliding, so friction is kinetic.',
        'Up and down nothing moves: the normal force balances the weight.',
        'Friction points against the motion; the net force is the push minus friction.',
      ],
      variables: [
        MASS,
        q('F', 'F', 'Applied force', 'N', 0, 1e5, 0.1),
        MU,
        WEIGHT,
        { ...NORMAL, derived: true },
        FRICTION,
        NET,
        ACC,
      ],
      ...rules(
        weightRule,
        rule('F_N = W', '{N} = {W}', (v) => v.N! - v.W!, {
          N: [
            (v) => v.W!,
            '{W}',
            'Nothing else pushes up or down, so the floor pushes up with the weight.',
          ],
        }),
        frictionRule,
        difference('n', 'F', 'f', 'F_net = F − f', 'The push forward less friction backward.'),
        newtonRule,
      ),
      example: { m, F, k, W, N: W, f, n: F - f, a: (F - f) / m },
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
    } satisfies ModuleDef;
  })(),
  (() => {
    const [m, qq, k] = [5, 30, 0.2];
    const W = m * G;
    const P = W * Math.sin(qq * RAD);
    const N = W * Math.cos(qq * RAD);
    const f = k * N;
    return {
      id: 's.11.dynamics-vectors~incline',
      title: 'A block sliding down an incline',
      use: 'Use this for “A 5 kg block slides down a 30° ramp with μₖ = 0.2. What is its acceleration?”',
      unitSystems: ['metric'],
      assumptions: [
        'Tilt the axes with the slope: the weight splits into W sin θ down it and W cos θ into it.',
        'Into the slope nothing moves, so F_N = W cos θ.',
        'The block is sliding down, so kinetic friction acts up the slope.',
      ],
      variables: [
        MASS,
        q('q', 'θ', 'Angle of the ramp', '°', 0, 89, 1),
        MU,
        WEIGHT,
        q('P', 'W∥', 'Weight along the slope', 'N', 0, 1e5, 0.01),
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
        rule('F_N = W cos θ', '{N} = {W} × cos({q})', (v) => v.N! - v.W! * Math.cos(v.q! * RAD), {
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
          'F_net = W sin θ − f',
          'Down the slope: the weight’s part less friction.',
        ),
        newtonRule,
      ),
      example: { m, q: qq, k, W, P, N, f, n: P - f, a: (P - f) / m },
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
    } satisfies ModuleDef;
  })(),
  (() => {
    const [m, T, qq, k] = [10, 50, 30, 0.1];
    const W = m * G;
    const N = W - T * Math.sin(qq * RAD);
    const f = k * N;
    const n = T * Math.cos(qq * RAD) - f;
    return {
      id: 's.11.dynamics-vectors~rope',
      title: 'Pulling by a rope at an angle',
      use: 'Use this for “A 10 kg sled is pulled with 50 N by a rope 30° above level; μₖ = 0.1. Find the normal force and the acceleration.”',
      unitSystems: ['metric'],
      assumptions: [
        'The rope’s tension has a part across, T cos α, and a part up, T sin α.',
        'The part up lifts a little, so the ground pushes up less: F_N = W − T sin α.',
        'Less normal force means less friction; the sled is already sliding.',
      ],
      variables: [
        MASS,
        q('T', 'T', 'Tension in the rope', 'N', 0, 1e5, 0.1),
        q('q', 'α', 'Angle of the rope', '°', 0, 80, 1),
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
          'F_N = W − T sin α',
          '{N} = {W} − {T} × sin({q})',
          (v) => v.N! - v.W! + v.T! * Math.sin(v.q! * RAD),
          {
            N: [
              (v) => v.W! - v.T! * Math.sin(v.q! * RAD),
              '{W} − {T} × sin({q})',
              'The rope lifts T sin α of the weight; the ground holds the rest.',
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
          },
        ),
        frictionRule,
        rule(
          'F_net = T cos α − f',
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
          },
        ),
        newtonRule,
      ),
      example: { m, T, q: qq, k, W, N, f, n, a: n / m },
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
    } satisfies ModuleDef;
  })(),
  (() => {
    const [m, a] = [3, 2];
    const W = m * G;
    return {
      id: 's.11.dynamics-vectors~elevator',
      title: 'Hanging in an elevator',
      use: 'Use this for “A 3 kg lamp hangs from the ceiling of an elevator speeding up at 2 m/s² going up. What is the tension in its cord?”',
      unitSystems: ['metric'],
      assumptions: [
        'Only two forces: the cord’s tension up and the weight down.',
        'Up is +: a > 0 when it speeds up going up or slows going down.',
        'The tension is more than the weight when a > 0, less when a < 0.',
      ],
      variables: [
        MASS,
        { ...ACC, min: -9.8, max: 100 },
        WEIGHT,
        q('T', 'T', 'Tension in the cord', 'N', 0, 1e6, 0.01),
        NET,
      ],
      ...rules(
        weightRule,
        newtonRule,
        difference('n', 'T', 'W', 'F_net = T − W', 'Up is +: the tension up less the weight down.'),
      ),
      example: { m, a, W, T: W + m * a, n: m * a },
      startWith: ['m', 'a'],
      representation: {
        kind: 'freeBody',
        support: 'hanging',
        mass: 'm',
        tension: 'T',
        weight: 'W',
        net: 'n',
        acceleration: 'a',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [p, b, t, m] = [60, 80, 90, 25];
    const x = p + b * Math.cos(t * RAD);
    const y = b * Math.sin(t * RAD);
    const F = Math.hypot(x, y);
    return {
      id: 's.11.dynamics-vectors~force-sum',
      title: 'Adding two forces',
      use: 'Use this for “Two dogs pull a 25 kg sled: 60 N east and 80 N north. What is the net force, which way, and the acceleration?”',
      unitSystems: ['metric'],
      assumptions: [
        'F₁ pulls east; F₂ pulls at the angle θ north of east. No other force acts sideways.',
        'The net force is their vector sum: add the east parts and the north parts.',
        'The acceleration points the way the net force does: a = F ÷ m.',
      ],
      variables: [
        q('p', 'F₁', 'First force', 'N', 0, 1e5, 0.1),
        q('b', 'F₂', 'Second force', 'N', 0, 1e5, 0.1),
        q('t', 'θ', 'Angle of F₂', '°', 0, 90, 1),
        q('x', 'Fₓ', 'Net force east', 'N', 0, 2e5, 0.01, { derived: true }),
        q('y', 'F_y', 'Net force north', 'N', 0, 1e5, 0.01, { derived: true }),
        q('F', 'F', 'Net force', 'N', 0, 2e5, 0.01),
        q('d', 'φ', 'Direction, from east', '°', 0, 90, 0.1, { derived: true }),
        MASS,
        { ...ACC, min: 0 },
      ],
      ...rules(
        rule(
          'Fₓ = F₁ + F₂ cos θ',
          '{x} = {p} + {b} × cos({t})',
          (v) => v.x! - v.p! - v.b! * Math.cos(v.t! * RAD),
          {
            x: [
              (v) => v.p! + v.b! * Math.cos(v.t! * RAD),
              '{p} + {b} × cos({t})',
              'Add the east parts: all of F₁, and F₂ times cos θ.',
            ],
            p: [
              (v) => v.x! - v.b! * Math.cos(v.t! * RAD),
              '{x} − {b} × cos({t})',
              'Take F₂’s east part from the net east force.',
            ],
          },
        ),
        componentOf('y', 'b', 't', 'sin', 'F_y = F₂ sin θ', 'Only F₂ pulls north: F₂ times sin θ.'),
        magnitude(
          'F',
          'x',
          'y',
          'F = √(Fₓ² + F_y²)',
          'The parts are at right angles: add them by Pythagoras.',
        ),
        rule(
          'φ = arctan(F_y/Fₓ)',
          '{d} = arctan({y}/{x})',
          (v) => Math.tan(v.d! * RAD) * v.x! - v.y!,
          {
            d: [
              (v) => Math.atan2(v.y!, v.x!) / RAD,
              'arctan({y}/{x})',
              'The tangent of the direction is the north part over the east part.',
            ],
          },
        ),
        rule('a = F ÷ m', '{a} = {F}/{m}', (v) => v.a! * v.m! - v.F!, {
          a: [
            (v) => div(v.F!, v.m!),
            '{F}/{m}',
            'Newton’s second law: the net force over the mass.',
          ],
          F: [(v) => v.a! * v.m!, '{a} × {m}', 'The net force is the mass times the acceleration.'],
          m: [(v) => div(v.F!, v.a!), '{F}/{a}', 'Divide the net force by the acceleration.'],
        }),
      ),
      example: { p, b, t, x, y, F, d: Math.atan2(y, x) / RAD, m, a: F / m },
      startWith: ['p', 'b', 't', 'm'],
      representation: {
        kind: 'vectorDiagram',
        vectors: [
          { name: 'F₁', magnitude: 'p', direction: 0 },
          { name: 'F₂', magnitude: 'b', direction: 't' },
        ],
        sum: 'parallelogram',
        result: { name: 'F', x: 'x', y: 'y', magnitude: 'F', direction: 'd' },
        unit: 'N',
        axes: { x: 'east', y: 'north' },
      },
      pictureLabels: ['m'],
    } satisfies ModuleDef;
  })(),
];

// ─── s.11.circuits ───────────────────────────────────────────────────────────

const VOLTS = q('V', 'V', 'Battery voltage', 'V', 0.01, 10000, 0.01);
const resistor = (id: string, symbol: string, name: string) =>
  q(id, symbol, name, 'Ω', 0.01, 1e6, 0.01);
const amps = (id: string, symbol: string, name: string, derived = false) =>
  q(id, symbol, name, 'A', 0, 100, 0.0001, derived ? { derived: true } : {});

/** Iₙ = V ÷ Rₙ for one parallel branch. */
const branchRule = (i: string, r: string, n: string): Rule =>
  quotient(i, 'V', r, `I${n} = V ÷ R${n}`, [
    'Each branch has the whole battery voltage across it: divide by its resistance.',
    'The branch current times its resistance is the battery voltage.',
    'Divide the battery voltage by the branch current.',
  ]);

const circuitPages: ModuleDef[] = [
  {
    id: 's.11.circuits',
    unitSystems: ['metric'],
    assumptions: [
      'The resistor keeps the same resistance whatever the current (it obeys Ohm’s law).',
      'V is the voltage across the resistor and I the current through it.',
      'Volts, amps and ohms go together: 1 V = 1 A × 1 Ω.',
    ],
    variables: [
      { ...VOLTS, name: 'Voltage', max: 10000 },
      amps('I', 'I', 'Current'),
      resistor('R', 'R', 'Resistance'),
    ],
    ...rules(
      rule('V = IR', '{V} = {I} × {R}', (v) => v.V! - v.I! * v.R!, {
        V: [(v) => v.I! * v.R!, '{I} × {R}', 'The voltage is the current times the resistance.'],
        I: [
          (v) => div(v.V!, v.R!),
          '{V} ÷ {R}',
          'Divide the voltage by the resistance: more resistance, less current.',
        ],
        R: [(v) => div(v.V!, v.I!), '{V} ÷ {I}', 'Divide the voltage by the current.'],
      }),
    ),
    example: { V: 9, I: 0.45, R: 20 },
    startWith: ['V', 'R'],
    equation: '{V:unit} = {I:unit} × {R:unit}',
    representation: {
      kind: 'seriesCircuit',
      source: 'V',
      current: 'I',
      resistors: [{ r: 'R', v: 'V' }],
    },
  },
  (() => {
    const [V, a, b] = [12, 10, 20];
    const I = V / (a + b);
    return {
      id: 's.11.circuits~series',
      title: 'Resistors in series',
      use: 'Use this for “A 12 V battery drives 10 Ω and 20 Ω in series. What does the ammeter read, and what is the voltage across each?”',
      unitSystems: ['metric'],
      assumptions: [
        'In series there is one path, so the same current I flows through each resistor.',
        'Series resistances add: R = R₁ + R₂.',
        'The battery’s voltage is shared in the ratio of the resistances: V₁ + V₂ = V.',
      ],
      variables: [
        VOLTS,
        resistor('a', 'R₁', 'First resistor'),
        resistor('b', 'R₂', 'Second resistor'),
        resistor('R', 'R', 'Total resistance'),
        amps('I', 'I', 'Current'),
        q('x', 'V₁', 'Voltage across R₁', 'V', 0, 10000, 0.001),
        q('y', 'V₂', 'Voltage across R₂', 'V', 0, 10000, 0.001),
      ],
      ...rules(
        sum('R', 'a', 'b', 'R = R₁ + R₂', 'The current passes through both: the resistances add.'),
        quotient('I', 'V', 'R', 'I = V ÷ R', [
          'Ohm’s law for the whole loop: the battery voltage over the total resistance.',
          'The current times the total resistance is the battery voltage.',
          'Divide the battery voltage by the current.',
        ]),
        product('x', 'I', 'a', 'V₁ = IR₁', [
          'Ohm’s law for R₁ alone: the current times its resistance.',
          'Divide R₁’s voltage by its resistance.',
          'Divide R₁’s voltage by the current.',
        ]),
        product('y', 'I', 'b', 'V₂ = IR₂', [
          'Ohm’s law for R₂ alone: the current times its resistance.',
          'Divide R₂’s voltage by its resistance.',
          'Divide R₂’s voltage by the current.',
        ]),
      ),
      example: { V, a, b, R: a + b, I, x: I * a, y: I * b },
      startWith: ['V', 'a', 'b'],
      representation: {
        kind: 'seriesCircuit',
        source: 'V',
        current: 'I',
        resistors: [
          { r: 'a', v: 'x' },
          { r: 'b', v: 'y' },
        ],
      },
      pictureLabels: ['R'],
    } satisfies ModuleDef;
  })(),
  (() => {
    const [V, a, b, c] = [24, 40, 60, 120];
    const [i, j, k] = [V / a, V / b, V / c];
    return {
      id: 's.11.circuits~parallel',
      title: 'Resistors in parallel',
      use: 'Use this for “40 Ω, 60 Ω and 120 Ω are in parallel on 24 V. Find each branch current, the total current and the equivalent resistance.”',
      unitSystems: ['metric'],
      assumptions: [
        'Each branch is connected straight across the battery, so each has the full voltage V.',
        'The branch currents add at the junction: I = I₁ + I₂ + I₃.',
        'The equivalent resistance is less than the smallest branch: 1/R = 1/R₁ + 1/R₂ + 1/R₃.',
      ],
      variables: [
        VOLTS,
        resistor('a', 'R₁', 'First resistor'),
        resistor('b', 'R₂', 'Second resistor'),
        resistor('c', 'R₃', 'Third resistor'),
        amps('i', 'I₁', 'Current in R₁'),
        amps('j', 'I₂', 'Current in R₂'),
        amps('k', 'I₃', 'Current in R₃'),
        amps('I', 'I', 'Total current', true),
        resistor('R', 'R', 'Equivalent resistance'),
      ],
      ...rules(
        branchRule('i', 'a', '₁'),
        branchRule('j', 'b', '₂'),
        branchRule('k', 'c', '₃'),
        rule('I = I₁ + I₂ + I₃', '{I} = {i} + {j} + {k}', (v) => v.I! - v.i! - v.j! - v.k!, {
          I: [
            (v) => v.i! + v.j! + v.k!,
            '{i} + {j} + {k}',
            'The branch currents join again: add them.',
          ],
        }),
        rule(
          '1/R = 1/R₁ + 1/R₂ + 1/R₃',
          '1/{R} = 1/{a} + 1/{b} + 1/{c}',
          (v) => 1 / v.R! - 1 / v.a! - 1 / v.b! - 1 / v.c!,
          {
            R: [
              (v) => div(1, 1 / v.a! + 1 / v.b! + 1 / v.c!),
              '1/(1/{a} + 1/{b} + 1/{c})',
              'Add the reciprocals of the branch resistances, then flip the sum.',
            ],
          },
        ),
      ),
      example: { V, a, b, c, i, j, k, I: i + j + k, R: 1 / (1 / a + 1 / b + 1 / c) },
      startWith: ['V', 'a', 'b', 'c'],
      representation: {
        kind: 'circuit',
        wiring: 'parallel',
        voltage: 'V',
        bulbs: ['a', 'b', 'c'],
        branches: ['i', 'j', 'k'],
        current: 'I',
      },
      pictureLabels: ['R'],
    } satisfies ModuleDef;
  })(),
  (() => {
    const [V, a, b, c] = [24, 4, 6, 12];
    const R = a + (b * c) / (b + c);
    const I = V / R;
    const x = I * a;
    return {
      id: 's.11.circuits~mixed',
      title: 'A series-parallel circuit',
      use: 'Use this for “24 V drives R₁ = 4 Ω in series with 6 Ω and 12 Ω in parallel. Find the total current, the voltage across R₁ and each branch current.”',
      unitSystems: ['metric'],
      assumptions: [
        'R₁ carries the whole current; then it splits between R₂ and R₃, which share one voltage.',
        'Work from the inside out: the parallel pair is R₂R₃/(R₂ + R₃), then add R₁ in series.',
        'The pair’s voltage is what R₁ leaves of the battery’s: V − V₁.',
      ],
      variables: [
        VOLTS,
        resistor('a', 'R₁', 'Resistor 1'),
        resistor('b', 'R₂', 'Resistor 2'),
        resistor('c', 'R₃', 'Resistor 3'),
        resistor('R', 'Rₜₒₜ', 'Total resistance'),
        amps('I', 'I', 'Total current'),
        q('x', 'V₁', 'Voltage across R₁', 'V', 0, 10000, 0.001),
        amps('j', 'I₂', 'Current in R₂', true),
        amps('k', 'I₃', 'Current in R₃', true),
        q('P', 'P', 'Total power', 'W', 0, 1e7, 0.01),
      ],
      ...rules(
        rule(
          'Rₜₒₜ = R₁ + R₂R₃/(R₂ + R₃)',
          '{R} = {a} + {b} × {c}/({b} + {c})',
          (v) => v.R! - v.a! - (v.b! * v.c!) / (v.b! + v.c!),
          {
            R: [
              (v) => v.a! + div(v.b! * v.c!, v.b! + v.c!)!,
              '{a} + {b} × {c}/({b} + {c})',
              'R₂ and R₃ in parallel, then R₁ in series.',
            ],
            a: [
              (v) => v.R! - div(v.b! * v.c!, v.b! + v.c!)!,
              '{R} − {b} × {c}/({b} + {c})',
              'Take the parallel pair from the total.',
            ],
          },
        ),
        quotient('I', 'V', 'R', 'I = V/Rₜₒₜ', [
          'Ohm’s law for the whole circuit: the voltage over the total resistance.',
          'The current times the total resistance.',
          'The voltage over the current.',
        ]),
        product('x', 'I', 'a', 'V₁ = IR₁', [
          'All the current passes through R₁: Ohm’s law for R₁.',
          'Divide R₁’s voltage by its resistance.',
          'Divide R₁’s voltage by the current.',
        ]),
        rule('I₂ = (V − V₁)/R₂', '{j} = ({V} − {x})/{b}', (v) => v.j! * v.b! - (v.V! - v.x!), {
          j: [
            (v) => div(v.V! - v.x!, v.b!),
            '({V} − {x})/{b}',
            'The pair has what R₁ leaves of the voltage: divide it by R₂.',
          ],
        }),
        rule('I₃ = (V − V₁)/R₃', '{k} = ({V} − {x})/{c}', (v) => v.k! * v.c! - (v.V! - v.x!), {
          k: [
            (v) => div(v.V! - v.x!, v.c!),
            '({V} − {x})/{c}',
            'The same voltage across R₃: divide it by R₃.',
          ],
        }),
        product('P', 'V', 'I', 'P = VI', [
          'The battery’s power: its voltage times the current it drives.',
          'Divide the power by the current.',
          'Divide the power by the voltage.',
        ]),
      ),
      example: { V, a, b, c, R, I, x, j: (V - x) / b, k: (V - x) / c, P: V * I },
      startWith: ['V', 'a', 'b', 'c'],
      representation: {
        kind: 'circuit',
        wiring: 'series',
        voltage: 'V',
        bulbs: [],
        current: 'I',
        mixed: {
          layout: 'seriesParallel',
          resistors: ['a', 'b', 'c'],
          equivalent: 'R',
          power: 'P',
          voltages: ['x'],
          currents: [undefined, 'j', 'k'],
        },
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [V, I, t] = [120, 0.5, 7200];
    return {
      id: 's.11.circuits~power',
      title: 'Electric power and energy',
      use: 'Use this for “A lamp on 120 V draws 0.5 A. What is its power and resistance, and how much energy does it use in 2 h (7200 s)?”',
      unitSystems: ['metric'],
      assumptions: [
        'Power is the energy each second: P = VI, in watts (1 W = 1 J/s).',
        'With V = IR, the same power is P = I²R.',
        'The energy used is the power times the time: E = Pt, in joules when t is in seconds.',
      ],
      variables: [
        VOLTS,
        amps('I', 'I', 'Current'),
        resistor('R', 'R', 'Resistance'),
        q('P', 'P', 'Power', 'W', 0, 1e7, 0.01),
        q('t', 't', 'Time', 's', 0.01, 1e7, 0.01),
        q('E', 'E', 'Energy used', 'J', 0, 1e12, 0.01),
      ],
      ...rules(
        product('P', 'V', 'I', 'P = VI', [
          'The power is the voltage times the current.',
          'Divide the power by the current.',
          'Divide the power by the voltage.',
        ]),
        rule('P = I²R', '{P} = {I}² × {R}', (v) => v.P! - v.I! * v.I! * v.R!, {
          R: [
            (v) => div(v.P!, v.I! * v.I!),
            '{P}/({I}²)',
            'Divide the power by the current squared.',
          ],
          P: [(v) => v.I! * v.I! * v.R!, '{I}² × {R}', 'The current squared times the resistance.'],
        }),
        product('E', 'P', 't', 'E = Pt', [
          'Each second uses P joules: multiply by the seconds.',
          'Divide the energy by the time.',
          'Divide the energy by the power.',
        ]),
      ),
      example: { V, I, R: V / I, P: V * I, t, E: V * I * t },
      startWith: ['V', 'I', 't'],
      representation: {
        kind: 'circuit',
        wiring: 'series',
        voltage: 'V',
        bulbs: ['R'],
        current: 'I',
      },
      pictureLabels: ['P', 't', 'E'],
    } satisfies ModuleDef;
  })(),
];

export const SCIENCE_11_MODULES: ModuleDef[] = [
  ...kinematicsPages,
  ...projectilePages,
  ...dynamicsPages,
  ...circuitPages,
];
