/**
 * Grade 11 science: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md; the
 * direction plan and build notes: docs/BUILD_HS.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/science11.ts`.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import { scientific } from '@/engine/format';

import { atLeast } from '../helpers';
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
  steps: Object.fromEntries(
    rs.filter((r) => !r.relation.hidden).map((r) => [r.relation.id, r.steps]),
  ),
});

/** A number for a work line: plain from 0.001 to 9,999, else in scientific notation (4.388 × 10⁴⁷). */
const sci = (x: number) =>
  Math.abs(x) >= 0.001 && Math.abs(x) < 10000
    ? String(Number(x.toPrecision(5))).replace('-', '−')
    : scientific(x);

/** A number for a work line written out with separators (167,000). */
const plain = (x: number) =>
  Number(x.toPrecision(8)).toLocaleString('en-US', { maximumFractionDigits: 6 });

/** A rule with work lines (the parts worked out first) on the step for `id`. */
const withWork = (r: Rule, id: string, work: StepText['work']): Rule => ({
  relation: r.relation,
  steps: { ...r.steps, [id]: { ...r.steps[id]!, work } },
});

/** A rule that only places the picture: solved like any other, never shown as a step. */
const hide = (r: Rule): Rule => ({ relation: { ...r.relation, hidden: true }, steps: {} });

/** `rules`, with an order the story fixes (the top is at least the height now) first. */
const withOrder = (order: Relation, ...rs: Rule[]) => {
  const r = rules(...rs);
  return { relations: [order, ...r.relations], steps: { [order.id]: {}, ...r.steps } };
};

/**
 * A check that two values are at least `gap` apart (a difference the steps divide by), with the
 * reason shown when they aren't.
 */
const apart = (a: string, b: string, gap: number, message: string): Relation => {
  const ok = (v: Values) => Math.abs(v[a]! - v[b]!) >= gap - 1e-9;
  return {
    id: `|${a} − ${b}| ≥ ${gap}`,
    constraint: true,
    display: `{${a}} is at least ${gap} from {${b}}`,
    vars: [a, b],
    residual: (v) => (ok(v) ? 0 : 1),
    solve: {},
    message: (v) => (ok(v) ? undefined : message),
  };
};

/** `rules`, with checks (`apart`, `atLeast`) first. */
const withChecks = (checks: Relation[], ...rs: Rule[]) => {
  const r = rules(...rs);
  return {
    relations: [...checks, ...r.relations],
    steps: { ...Object.fromEntries(checks.map((c) => [c.id, {}])), ...r.steps },
  };
};

type Solve = (v: Values) => number | number[] | undefined;

/**
 * A rule from its display, its residual and, per variable, how to solve for it with the step
 * text: `[solve, expr, how]`. A variable given `undefined` is solved numerically, with no step;
 * one given `null` is never worked out from this rule (one value, many answers).
 */
const rule = (
  id: string,
  display: string,
  residual: (v: Values) => number,
  parts: Record<string, [Solve, StepText['expr'], string] | undefined | null>,
): Rule => ({
  relation: {
    id,
    display,
    vars: [
      ...new Set([...Object.keys(parts), ...[...display.matchAll(/\{(\w+)\}/g)].map((x) => x[1]!)]),
    ],
    residual,
    solve: Object.fromEntries(
      Object.entries(parts).flatMap(([k, p]) =>
        p ? [[k, p[0]]] : p === null ? [[k, () => undefined]] : [],
      ),
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
        { ...TIME, max: 30 },
        { ...V1, name: 'Velocity', min: -300, max: 0, derived: true },
        q('d', 'd', 'Drop', 'm', 0, 5000, 0.01),
      ],
      ...rules(
        rule('v = −gt', '{v} = −9.8 × {t}', (v) => v.v! + G * v.t!, {
          v: [
            (v) => -G * v.t!,
            '−9.8 × {t}',
            'From rest, the velocity is g times the time, downward.',
          ],
          t: [
            (v) => div(v.v!, -G),
            '{v}/(−9.8)',
            'Divide the velocity by −9.8 m/s² to count the seconds.',
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
      example: { t, v: -G * t, d: 0.5 * G * t * t },
      startWith: ['t'],
      representation: {
        kind: 'motionGraph',
        graph: 'speed',
        time: 't',
        acceleration: -G,
        speed: 'v',
        start: 0,
        kinematics: { view: 'velocity', strobe: 'vertical' },
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
      variables: [
        { ...V0, min: 0 },
        { ...V1, min: 0, max: 100 },
        { ...ACC1, max: -0.1 },
        { ...DX, min: 0 },
        TIME,
      ],
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
        'Where the tangent is flat, it stops for an instant and turns round: type v₁ = 0 to find when.',
      ],
      variables: [
        q('p', 'x₀', 'Starting position', 'm', -1e4, 1e4, 0.1),
        V0,
        ACC1,
        { ...TIME, name: 'Time shown on the graph' },
        { ...V1, derived: true, hidden: true },
        q('s', 't₁', 'Time of the tangent', 's', 0, 120, 0.1),
        q('w', 'v₁', 'Velocity at t₁ (the slope)', 'm/s', -500, 500, 0.01),
        q('x', 'x₁', 'Position at t₁', 'm', -1e5, 1e5, 0.01),
      ],
      ...rules(
        hide(velocityRule),
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
            y: [
              (v) => (v.H! >= v.h! ? Math.sqrt(2 * G * (v.H! - v.h!)) : undefined),
              '√(2 × 9.8 × ({H} − {h}))',
              'At the top v_y is 0, so v_y² = 2g(H − h).',
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
        { ...LAUNCH_V, name: 'Speed off the edge' },
        { ...LAUNCH_H, name: 'Height of the ledge', min: 0.01 },
        FLIGHT,
        RANGE,
      ],
      ...rules(
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
      example: { v, h, T, R: v * T },
      startWith: ['v', 'h'],
      representation: {
        kind: 'projectile',
        speed: 'v',
        angle: 0,
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
        q('t', 'θ', 'Direction, from east', '°', 0, 360, 1),
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
  n: [(v) => v.a! * v.m!, '{m} × {a}', 'The net force is the mass times the acceleration.'],
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
        'If friction is more than the push, a < 0: the sliding block slows down.',
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
          W: [(v) => v.N!, '{N}', 'The weight balances the normal force.'],
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
        'The block is sliding down, so kinetic friction acts up the slope; if friction wins, a < 0 and it slows.',
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
        'Less normal force means less friction; the sled is already sliding, and a < 0 means it slows.',
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
        rule('F_net = T − W', '{n} = {T} − {W}', (v) => v.n! - (v.T! - v.W!), {
          n: [(v) => v.T! - v.W!, '{T} − {W}', 'Up is +: the tension up less the weight down.'],
          T: [
            (v) => v.n! + v.W!,
            '{n} + {W}',
            'The cord holds up the weight and also gives the net force.',
          ],
          W: [(v) => v.T! - v.n!, '{T} − {n}', 'The tension less the net force is the weight.'],
        }),
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
        q('t', 'θ', 'Angle of F₂', '°', 0, 180, 1),
        q('x', 'Fₓ', 'Net force east', 'N', -1e5, 2e5, 0.01, { derived: true }),
        q('y', 'F_y', 'Net force north', 'N', 0, 1e5, 0.01, { derived: true }),
        q('F', 'F', 'Net force', 'N', 0, 2e5, 0.01),
        q('d', 'φ', 'Direction, from east', '°', 0, 180, 0.1, { derived: true }),
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
          'tan φ = F_y/Fₓ',
          'tan({d}) = {y}/{x}',
          (v) => Math.sin(v.d! * RAD) * v.x! - Math.cos(v.d! * RAD) * v.y!,
          {
            d: [
              (v) => Math.atan2(v.y!, v.x!) / RAD,
              (v) =>
                Math.abs(v.x!) < 1e-9
                  ? '90'
                  : v.x! < 0
                    ? '180 + arctan({y}/{x})'
                    : 'arctan({y}/{x})',
              'The direction from east: the angle whose tangent is north over east, in the right quarter.',
            ],
          },
        ),
        rule('a = F ÷ m', '{a} = {F}/{m}', (v) => v.a! * v.m! - v.F!, {
          a: [
            (v) => div(v.F!, v.m!),
            '{F}/{m}',
            'Newton’s second law: the net force over the mass.',
          ],
          F: [(v) => v.a! * v.m!, '{m} × {a}', 'The net force is the mass times the acceleration.'],
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
      pictureLabels: ['m', 'a'],
    } satisfies ModuleDef;
  })(),
];

// ─── s.11.circular-gravitation ──────────────────────────────────────────────

const RADIUS = q('r', 'r', 'Radius', 'm', 0.01, 10000, 0.01);
const SPEED = q('v', 'v', 'Speed', 'm/s', 0.01, 10000, 0.01);
const AC = q('a', 'a_c', 'Centripetal acceleration', 'm/s²', 0.001, 1e9, 0.001);
const FC = q('F', 'F_c', 'Centripetal force', 'N', 0.001, 1e12, 0.001);

/** a_c = v² ÷ r. */
const centripetalRule = rule('a_c = v²/r', '{a} = {v}²/{r}', (v) => v.a! * v.r! - v.v! * v.v!, {
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
const centripetalForce = product('F', 'm', 'a', 'F_c = ma_c', [
  'Newton’s second law toward the center: the mass times the centripetal acceleration.',
  'Divide the force by the acceleration.',
  'Divide the force by the mass.',
]);

const circularPages: ModuleDef[] = [
  (() => {
    const [m, r, v] = [0.5, 1.2, 6];
    const a = (v * v) / r;
    return {
      id: 's.11.circular-gravitation',
      unitSystems: ['metric'],
      assumptions: [
        'The ball goes round a flat circle at a constant speed: only its direction changes.',
        'The net force (here the string’s pull) points to the center: F_c = mv²/r.',
        'Let go, it moves off in a straight line along the tangent, not outward.',
      ],
      variables: [
        q('m', 'm', 'Mass', 'kg', 0.001, 10000, 0.001),
        RADIUS,
        SPEED,
        AC,
        FC,
        q('T', 'T', 'Period', 's', 0.0001, 1e7, 0.0001),
      ],
      ...rules(
        centripetalRule,
        centripetalForce,
        rule('T = 2πr/v', '{T} = 2π × {r}/{v}', (v) => v.T! * v.v! - 2 * Math.PI * v.r!, {
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
      ),
      example: { m, r, v, a, F: m * a, T: (2 * Math.PI * r) / v },
      startWith: ['m', 'r', 'v'],
      representation: {
        kind: 'circularMotion',
        mode: 'string',
        radius: 'r',
        speed: 'v',
        mass: 'm',
        acceleration: 'a',
        force: 'F',
        period: 'T',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [m, r, v] = [1200, 50, 15];
    const a = (v * v) / r;
    return {
      id: 's.11.circular-gravitation~car',
      title: 'A car rounding a flat curve',
      use: 'Use this for “A 1,200 kg car takes a 50 m curve at 15 m/s. How much friction does it need, and what is the least μₛ that holds it?”',
      unitSystems: ['metric'],
      assumptions: [
        'On a flat curve, static friction between the tires and the road pulls the car toward the center.',
        'The tires don’t slide sideways, so the friction is static: it can be at most μₛ F_N.',
        'Too fast, and friction can’t supply mv²/r: the car slides off along the tangent.',
      ],
      variables: [
        q('m', 'm', 'Mass of the car', 'kg', 1, 1e5, 1),
        RADIUS,
        { ...SPEED, max: 100 },
        AC,
        { ...FC, name: 'Friction needed' },
        q('k', 'μₛ', 'Least coefficient of static friction', undefined, 0, 10, 0.001),
      ],
      ...rules(
        centripetalRule,
        centripetalForce,
        rule('μₛ = v²/(rg)', '{k} = {v}²/({r} × 9.8)', (v) => v.k! * v.r! * G - v.v! * v.v!, {
          k: [
            (v) => div(v.v! * v.v!, v.r! * G),
            '{v}²/({r} × 9.8)',
            'Friction μₛmg must give mv²/r: the mass cancels, leaving v²/(rg).',
          ],
          v: [
            (v) => Math.sqrt(Math.max(0, v.k! * v.r! * G)),
            '√({k} × {r} × 9.8)',
            'The fastest safe speed: undo v²/(rg).',
          ],
          r: [
            (v) => div(v.v! * v.v!, v.k! * G),
            '{v}²/({k} × 9.8)',
            'The tightest safe radius: undo v²/(rg).',
          ],
        }),
      ),
      example: { m, r, v, a, F: m * a, k: (v * v) / (r * G) },
      startWith: ['m', 'r', 'v'],
      representation: {
        kind: 'circularMotion',
        mode: 'car',
        radius: 'r',
        speed: 'v',
        mass: 'm',
        acceleration: 'a',
        force: 'F',
      },
      pictureLabels: ['k'],
    } satisfies ModuleDef;
  })(),
  (() => {
    const [m, v, r] = [2, 3, 1.5];
    const a = (v * v) / r;
    const W = m * G;
    return {
      id: 's.11.circular-gravitation~swing',
      title: 'At the bottom of a swing',
      use: 'Use this for “A 2 kg ball on a 1.5 m string swings through the bottom at 3 m/s. What is the tension there?”',
      unitSystems: ['metric'],
      assumptions: [
        'At the bottom the center of the circle is straight up, so the net force points up.',
        'The tension must hold up the weight and also supply mv²/r: T = m(g + v²/r).',
        'Up is +; the string is the radius r.',
      ],
      variables: [
        q('m', 'm', 'Mass', 'kg', 0.001, 10000, 0.001),
        { ...SPEED, max: 1000 },
        { ...RADIUS, name: 'Length of the string (radius)' },
        { ...AC, max: 1e7 },
        WEIGHT,
        q('T', 'T', 'Tension', 'N', 0, 1e8, 0.01),
        { ...NET, min: 0, max: 1e8 },
      ],
      ...rules(
        centripetalRule,
        weightRule,
        rule('F_net = ma_c', '{n} = {m} × {a}', (v) => v.n! - v.m! * v.a!, {
          n: [
            (v) => v.m! * v.a!,
            '{m} × {a}',
            'The net force up is the mass times the centripetal acceleration.',
          ],
          m: [(v) => div(v.n!, v.a!), '{n}/{a}', 'Divide the net force by the acceleration.'],
          a: [(v) => div(v.n!, v.m!), '{n}/{m}', 'Divide the net force by the mass.'],
        }),
        sum(
          'T',
          'W',
          'n',
          'T = W + F_net',
          'The string holds the weight and adds the pull to the center.',
        ),
      ),
      example: { m, v, r, a, W, T: W + m * a, n: m * a },
      startWith: ['m', 'v', 'r'],
      representation: {
        kind: 'freeBody',
        support: 'hanging',
        mass: 'm',
        tension: 'T',
        weight: 'W',
        net: 'n',
        acceleration: 'a',
      },
      pictureLabels: ['v', 'r'],
    } satisfies ModuleDef;
  })(),
  (() => {
    const [M, n, d] = [5.97e24, 7.35e22, 3.84e8];
    return {
      id: 's.11.circular-gravitation~gravitation',
      title: 'Universal gravitation',
      use: 'Use this for “How hard do Earth (5.97 × 10²⁴ kg) and the Moon (7.35 × 10²² kg), 3.84 × 10⁸ m apart, pull on each other? What if they were twice as far?”',
      unitSystems: ['metric'],
      assumptions: [
        'Every two masses pull on each other: F = Gm₁m₂/r², G = 6.674 × 10⁻¹¹ N·m²/kg².',
        'r is the distance between their centers. Twice as far gives a quarter of the pull.',
        'The pulls on the two are equal and opposite, whatever their masses.',
      ],
      variables: [
        q('M', 'm₁', 'First mass', 'kg', 1, 1e31, 1, { scientific: true }),
        q('n', 'm₂', 'Second mass', 'kg', 1, 1e31, 1, { scientific: true }),
        q('d', 'r', 'Distance between centers', 'm', 0.01, 1e13, 0.01, { scientific: true }),
        q('F', 'F', 'Pull of gravity', 'N', 0, 1e45, 1, { scientific: true }),
      ],
      ...rules(
        withWork(
          rule(
            'F = Gm₁m₂/r²',
            '{F} = 6.674 × 10⁻¹¹ × {M} × {n}/{d}²',
            (v) => v.F! / ((6.674e-11 * v.M! * v.n!) / (v.d! * v.d!)) - 1,
            {
              F: [
                (v) => div(6.674e-11 * v.M! * v.n!, v.d! * v.d!),
                '6.674 × 10⁻¹¹ × {M} × {n}/({d}²)',
                'G = 6.674 × 10⁻¹¹ N·m²/kg²: multiply G by both masses and divide by the distance squared.',
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
          'F',
          (v) => [
            `m₁ × m₂ = (${sci(v.M!)}) × (${sci(v.n!)}) = ${sci(v.M! * v.n!)} kg²`,
            `r² = (${sci(v.d!)})² = ${sci(v.d! * v.d!)} m²`,
            `F = 6.674 × 10⁻¹¹ × (${sci(v.M! * v.n!)})/(${sci(v.d! * v.d!)})`,
          ],
        ),
      ),
      example: { M, n, d, F: (6.674e-11 * M * n) / (d * d) },
      startWith: ['M', 'n', 'd'],
      representation: {
        kind: 'circularMotion',
        mode: 'gravity',
        masses: ['M', 'n'],
        distance: 'd',
        force: 'F',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [M, r] = [5.97e24, 7.0e6];
    const v = Math.sqrt((6.674e-11 * M) / r);
    return {
      id: 's.11.circular-gravitation~orbit',
      title: 'A satellite in orbit',
      use: 'Use this for “A satellite circles Earth (5.97 × 10²⁴ kg) 7 × 10⁶ m from its center. How fast does it go, and how long is one orbit?”',
      unitSystems: ['metric'],
      assumptions: [
        'The orbit is a circle, and gravity is the only force: it supplies the centripetal force.',
        'GMm/r² = mv²/r, so v = √(GM/r), with G = 6.674 × 10⁻¹¹ N·m²/kg²; the satellite’s mass cancels.',
        'r is measured from the center of the planet, not from its surface.',
      ],
      variables: [
        q('M', 'M', 'Central mass', 'kg', 1e10, 1e32, 1, { scientific: true }),
        q('r', 'r', 'Orbit radius', 'm', 1, 1e13, 1, { scientific: true }),
        q('v', 'v', 'Orbital speed', 'm/s', 1e-3, 1e7, 0.1),
        q('T', 'T', 'Period', 's', 1, 1e11, 1, { scientific: true, units: ['s'] }),
      ],
      ...rules(
        rule(
          'v = √(GM/r)',
          '{v} = √(6.674 × 10⁻¹¹ × {M}/{r})',
          (x) => (x.v! * x.v! * x.r!) / (6.674e-11 * x.M!) - 1,
          {
            v: [
              (x) => Math.sqrt(Math.max(0, div(6.674e-11 * x.M!, x.r!) ?? 0)),
              '√(6.674 × 10⁻¹¹ × {M}/{r})',
              'G times the central mass, over r, then the square root.',
            ],
            r: [
              (x) => div(6.674e-11 * x.M!, x.v! * x.v!),
              '6.674 × 10⁻¹¹ × {M}/({v}²)',
              'Square both sides: r = GM/v².',
            ],
            M: [
              (x) => div(x.v! * x.v! * x.r!, 6.674e-11),
              '{v}² × {r}/(6.674 × 10⁻¹¹)',
              'Square both sides: M = v²r/G.',
            ],
          },
        ),
        rule('T = 2πr/v', '{T} = 2π × {r}/{v}', (x) => (x.T! * x.v!) / (2 * Math.PI * x.r!) - 1, {
          T: [
            (x) => div(2 * Math.PI * x.r!, x.v!),
            '2π × {r}/{v}',
            'Once round the circle, 2πr, at speed v.',
          ],
          v: [
            (x) => div(2 * Math.PI * x.r!, x.T!),
            '2π × {r}/{T}',
            'Once round the circle in one period.',
          ],
          r: [
            (x) => (x.v! * x.T!) / (2 * Math.PI),
            '{v} × {T}/(2π)',
            'The distance in one period is 2πr.',
          ],
        }),
      ),
      example: { M, r, v, T: (2 * Math.PI * r) / v },
      startWith: ['M', 'r'],
      representation: {
        kind: 'circularMotion',
        mode: 'satellite',
        central: 'M',
        radius: 'r',
        speed: 'v',
        period: 'T',
        body: 'earth',
        bodyRadius: 6.371e6,
      },
    } satisfies ModuleDef;
  })(),
];

// ─── s.11.momentum ──────────────────────────────────────────────────────────

const M1 = q('m', 'm₁', 'Mass of cart 1', 'kg', 0.01, 1e5, 0.01);
const M2 = q('n', 'm₂', 'Mass of cart 2', 'kg', 0.01, 1e5, 0.01);
const V1B = q('v', 'v₁', 'Velocity of cart 1 before', 'm/s', -100, 100, 0.01);
const V2B = q('w', 'v₂', 'Velocity of cart 2 before', 'm/s', -100, 100, 0.01);
const V1A = q('a', 'v₁′', 'Velocity of cart 1 after', 'm/s', -300, 300, 0.01);
const V2A = q('b', 'v₂′', 'Velocity of cart 2 after', 'm/s', -300, 300, 0.01);
const KE = (id: string, symbol: string, name: string) => q(id, symbol, name, 'J', 0, 1e10, 0.0001);

/** K = ½m₁v₁² + ½m₂v₂² for the two carts at velocities x and y. */
const keRule = (out: string, x: string, y: string, sym: string, when: string): Rule =>
  rule(
    sym,
    `{${out}} = ½ × {m} × {${x}}² + ½ × {n} × {${y}}²`,
    (v) => v[out]! - 0.5 * v.m! * v[x]! ** 2 - 0.5 * v.n! * v[y]! ** 2,
    {
      [out]: [
        (v) => 0.5 * v.m! * v[x]! ** 2 + 0.5 * v.n! * v[y]! ** 2,
        `½ × {m} × {${x}}² + ½ × {n} × {${y}}²`,
        `Add each cart’s ½mv² ${when}: kinetic energy has no direction.`,
      ],
    },
  );

/** p = m₁v₁ + m₂v₂, the total momentum before. */
const momentumRule = rule(
  'p = m₁v₁ + m₂v₂',
  '{p} = {m} × {v} + {n} × {w}',
  (v) => v.p! - v.m! * v.v! - v.n! * v.w!,
  {
    p: [
      (v) => v.m! * v.v! + v.n! * v.w!,
      '{m} × {v} + {n} × {w}',
      'Add the carts’ momenta, signs and all.',
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
  },
);
const MOMENTUM = q('p', 'p', 'Total momentum', 'kg·m/s', -1e7, 1e7, 0.01);

const momentumPages: ModuleDef[] = [
  (() => {
    const [m, n, v, w] = [2, 1, 3, -3];
    const p = m * v + n * w;
    const u = p / (m + n);
    return {
      id: 's.11.momentum',
      unitSystems: ['metric'],
      assumptions: [
        'No outside push along the track, so the total momentum is the same before and after.',
        '+ is to the right: a cart moving left has a negative velocity and momentum.',
        'The carts stick together: momentum is kept, but some kinetic energy turns to heat and sound.',
      ],
      variables: [
        M1,
        M2,
        V1B,
        V2B,
        MOMENTUM,
        q('u', 'v′', 'Velocity together after', 'm/s', -100, 100, 0.0001),
        KE('K', 'KE', 'Kinetic energy before'),
        KE('L', 'KE′', 'Kinetic energy after'),
      ],
      ...rules(
        momentumRule,
        rule('v′ = p/(m₁ + m₂)', '{u} = {p}/({m} + {n})', (v) => v.u! * (v.m! + v.n!) - v.p!, {
          u: [
            (v) => div(v.p!, v.m! + v.n!),
            '{p}/({m} + {n})',
            'The same momentum, now carried by both masses together.',
          ],
          p: [
            (v) => v.u! * (v.m! + v.n!),
            '{u} × ({m} + {n})',
            'Both masses at the shared velocity.',
          ],
        }),
        keRule('K', 'v', 'w', 'KE = ½m₁v₁² + ½m₂v₂²', 'before'),
        rule(
          'KE′ = ½(m₁ + m₂)v′²',
          '{L} = ½ × ({m} + {n}) × {u}²',
          (v) => v.L! - 0.5 * (v.m! + v.n!) * v.u! ** 2,
          {
            L: [
              (v) => 0.5 * (v.m! + v.n!) * v.u! ** 2,
              '½ × ({m} + {n}) × {u}²',
              'After, both masses move together at v′.',
            ],
            u: null,
          },
        ),
      ),
      example: { m, n, v, w, p, u, K: 0.5 * m * v * v + 0.5 * n * w * w, L: 0.5 * (m + n) * u * u },
      startWith: ['m', 'v', 'n', 'w'],
      representation: {
        kind: 'collision',
        type: 'stick',
        masses: ['m', 'n'],
        before: ['v', 'w'],
        after: ['u'],
        momentum: 'p',
        energy: ['K', 'L'],
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [m, n, v, w] = [1, 3, 4, -2];
    const a = ((m - n) * v + 2 * n * w) / (m + n);
    const b = ((n - m) * w + 2 * m * v) / (m + n);
    return {
      id: 's.11.momentum~elastic',
      title: 'An elastic collision',
      use: 'Use this for “A 1 kg cart at 4 m/s meets a 3 kg cart coming the other way at 2 m/s. They bounce apart elastically. What are their velocities after?”',
      unitSystems: ['metric'],
      assumptions: [
        'Elastic: the carts bounce apart keeping both the total momentum p and the total kinetic energy.',
        '+ is to the right; a cart moving left has a negative velocity.',
        'Magnets or springy bumpers make a collision close to elastic.',
      ],
      variables: [
        M1,
        M2,
        V1B,
        V2B,
        V1A,
        V2A,
        { ...MOMENTUM, derived: true },
        KE('K', 'KE', 'Kinetic energy before'),
        KE('L', 'KE′', 'Kinetic energy after'),
      ],
      ...rules(
        momentumRule,
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
        keRule('K', 'v', 'w', 'KE = ½m₁v₁² + ½m₂v₂²', 'before'),
        keRule('L', 'a', 'b', 'KE′ = ½m₁v₁′² + ½m₂v₂′²', 'after'),
      ),
      example: {
        m,
        n,
        v,
        w,
        a,
        b,
        p: m * v + n * w,
        K: 0.5 * m * v * v + 0.5 * n * w * w,
        L: 0.5 * m * a * a + 0.5 * n * b * b,
      },
      startWith: ['m', 'n', 'v', 'w'],
      representation: {
        kind: 'collision',
        type: 'elastic',
        masses: ['m', 'n'],
        before: ['v', 'w'],
        after: ['a', 'b'],
        momentum: 'p',
        energy: ['K', 'L'],
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [m, n, a] = [1.5, 0.5, -1];
    const b = (-m * a) / n;
    return {
      id: 's.11.momentum~explode',
      title: 'Pushed apart from rest',
      use: 'Use this for “A spring pushes a 1.5 kg cart and a 0.5 kg cart apart from rest. The big cart moves left at 1 m/s. How fast does the small one go, and how much energy did the spring give?”',
      unitSystems: ['metric'],
      assumptions: [
        'They start at rest, so the total momentum is 0 before and after: m₁v₁′ + m₂v₂′ = 0.',
        'The carts move off in opposite directions; the lighter one faster.',
        'The spring’s stored energy becomes the carts’ kinetic energy.',
      ],
      variables: [M1, M2, V1A, V2A, KE('E', 'E', 'Energy from the spring')],
      ...rules(
        rule('v₂′ = −m₁v₁′/m₂', '{b} = −{m} × {a}/{n}', (v) => v.b! * v.n! + v.m! * v.a!, {
          b: [
            (v) => div(-v.m! * v.a!, v.n!),
            '−{m} × {a}/{n}',
            'Cart 2’s momentum must cancel cart 1’s: the same size, the other way.',
          ],
          a: [
            (v) => div(-v.n! * v.b!, v.m!),
            '−{n} × {b}/{m}',
            'Cart 1’s momentum must cancel cart 2’s.',
          ],
          n: [
            (v) => div(-v.m! * v.a!, v.b!),
            '−{m} × {a}/{b}',
            'The mass whose momentum cancels cart 1’s.',
          ],
          m: [
            (v) => div(-v.n! * v.b!, v.a!),
            '−{n} × {b}/{a}',
            'The mass whose momentum cancels cart 2’s.',
          ],
        }),
        keRule('E', 'a', 'b', 'E = ½m₁v₁′² + ½m₂v₂′²', 'after'),
      ),
      example: { m, n, a, b, E: 0.5 * m * a * a + 0.5 * n * b * b },
      startWith: ['m', 'n', 'a'],
      representation: {
        kind: 'collision',
        type: 'explode',
        masses: ['m', 'n'],
        before: [0],
        after: ['a', 'b'],
        spring: 'E',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [m, n, v, w, a] = [0.6, 0.4, 0.5, -0.25, 0.1];
    const b = (m * v + n * w - m * a) / n;
    const X = 0.5 * m * v * v + 0.5 * n * w * w - 0.5 * m * a * a - 0.5 * n * b * b;
    return {
      id: 's.11.momentum~one-after',
      title: 'One velocity after, the other from momentum',
      use: 'Use this for “A 0.6 kg cart at 0.5 m/s meets a 0.4 kg cart rolling the other way at 0.25 m/s. The first cart slows to 0.1 m/s. How fast does the other cart move, and how much kinetic energy is lost?”',
      unitSystems: ['metric'],
      assumptions: [
        'No outside push along the track, so the total momentum is the same before and after.',
        '+ is to the right: a cart moving left has a negative velocity.',
        'Kinetic energy is not always kept: what is lost turns to heat and sound.',
      ],
      variables: [
        M1,
        M2,
        V1B,
        V2B,
        V1A,
        { ...V2A, step: 0.0001 },
        KE('X', 'ΔKE', 'Kinetic energy lost'),
      ],
      ...rules(
        rule(
          'm₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′',
          '{m} × {v} + {n} × {w} = {m} × {a} + {n} × {b}',
          (x) => x.m! * x.v! + x.n! * x.w! - x.m! * x.a! - x.n! * x.b!,
          {
            b: [
              (x) => div(x.m! * x.v! + x.n! * x.w! - x.m! * x.a!, x.n!),
              '({m} × {v} + {n} × {w} − {m} × {a})/{n}',
              'The momentum before, less cart 1’s after, is cart 2’s after; divide by m₂.',
            ],
            a: null,
            v: null,
            w: null,
          },
        ),
        rule(
          'ΔKE = KE before − KE after',
          '{X} = ½ × {m} × {v}² + ½ × {n} × {w}² − ½ × {m} × {a}² − ½ × {n} × {b}²',
          (x) =>
            x.X! -
            (0.5 * x.m! * x.v! ** 2 +
              0.5 * x.n! * x.w! ** 2 -
              0.5 * x.m! * x.a! ** 2 -
              0.5 * x.n! * x.b! ** 2),
          {
            X: [
              (x) =>
                0.5 * x.m! * x.v! ** 2 +
                0.5 * x.n! * x.w! ** 2 -
                0.5 * x.m! * x.a! ** 2 -
                0.5 * x.n! * x.b! ** 2,
              '½ × {m} × {v}² + ½ × {n} × {w}² − ½ × {m} × {a}² − ½ × {n} × {b}²',
              'Each cart’s ½mv² before, less each cart’s ½mv² after.',
            ],
            m: null,
            n: null,
            v: null,
            w: null,
            a: null,
            b: null,
          },
        ),
      ),
      example: { m, n, v, w, a, b, X },
      startWith: ['m', 'v', 'n', 'w', 'a'],
      representation: {
        kind: 'collision',
        type: 'general',
        masses: ['m', 'n'],
        before: ['v', 'w'],
        after: ['a', 'b'],
        lost: 'X',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [m, u, v, t] = [0.2, 25, -15, 0.05];
    const P = m * (v - u);
    return {
      id: 's.11.momentum~impulse',
      title: 'Impulse: force × time = change in momentum',
      use: 'Use this for “A 0.2 kg ball at 25 m/s bounces straight back at 15 m/s after touching a wall for 0.05 s. What average force acts on it? Why would a softer wall push less hard?”',
      unitSystems: ['metric'],
      assumptions: [
        '+ is the way the object first moves; a force against it is negative.',
        'F is the average force over the time Δt.',
        'The dashed rectangle is the same change in momentum spread over 0.2 s: a longer push is a smaller force.',
      ],
      variables: [
        q('m', 'm', 'Mass', 'kg', 0.001, 1e4, 0.001),
        q('u', 'v₀', 'Velocity before', 'm/s', -300, 300, 0.1),
        q('v', 'v', 'Velocity after', 'm/s', -300, 300, 0.1),
        q('P', 'Δp', 'Change in momentum', 'kg·m/s', -1e7, 1e7, 0.001),
        q('t', 'Δt', 'Time of the push', 's', 0.0001, 100, 0.001),
        q('F', 'F', 'Average force', 'N', -1e9, 1e9, 0.01),
      ],
      ...rules(
        rule('Δp = m(v − v₀)', '{P} = {m} × ({v} − {u})', (x) => x.P! - x.m! * (x.v! - x.u!), {
          P: [
            (x) => x.m! * (x.v! - x.u!),
            '{m} × ({v} − {u})',
            'The momentum after less the momentum before.',
          ],
          m: [
            (x) => div(x.P!, x.v! - x.u!),
            '{P}/({v} − {u})',
            'Divide Δp by the change in velocity.',
          ],
          v: [
            (x) => div(x.P! + x.m! * x.u!, x.m!),
            '{u} + {P}/{m}',
            'Add Δp/m to the velocity before.',
          ],
          u: [
            (x) => div(x.m! * x.v! - x.P!, x.m!),
            '{v} − {P}/{m}',
            'Take Δp/m from the velocity after.',
          ],
        }),
        rule('F = Δp/Δt', '{F} = {P}/{t}', (x) => x.F! * x.t! - x.P!, {
          F: [(x) => div(x.P!, x.t!), '{P}/{t}', 'The change in momentum per second.'],
          P: [(x) => x.F! * x.t!, '{F} × {t}', 'The impulse: force × time.'],
          t: [(x) => div(x.P!, x.F!), '{P}/{F}', 'How long the force must push for this Δp.'],
        }),
      ),
      example: { m, u, v, P, t, F: P / t },
      startWith: ['m', 'u', 'v', 't'],
      representation: {
        kind: 'impulse',
        mass: 'm',
        before: 'u',
        after: 'v',
        time: 't',
        change: 'P',
        force: 'F',
        compare: 0.2,
      },
    } satisfies ModuleDef;
  })(),
];

// ─── s.11.work-energy-power ─────────────────────────────────────────────────

const LOAD = q('W', 'F_L', 'Load', 'N', 1, 1e6, 1);
const EFFORT = q('F', 'F_E', 'Effort', 'N', 0, 1e6, 0.01);
const MA = q('A', 'MA', 'Mechanical advantage', undefined, 0.01, 1000, 0.01);
const IMA = { ...MA, symbol: 'IMA', name: 'Ideal mechanical advantage' };
const EFFICIENCY = q('p', 'e', 'Efficiency', '%', 1, 100, 1);

/** F_E = F_L ÷ (IMA × e): the actual effort. */
const effortRule = rule(
  'F_E = F_L/(IMA × e)',
  '{F} = {W}/({A} × {p}/100)',
  (v) => (v.F! * v.A! * v.p!) / 100 - v.W!,
  {
    F: [
      (v) => div(100 * v.W!, v.A! * v.p!),
      '{W}/({A} × {p}/100)',
      'The ideal effort is the load over IMA; friction makes it bigger: divide by the efficiency too.',
    ],
    W: [
      (v) => (v.F! * v.A! * v.p!) / 100,
      '{F} × {A} × {p}/100',
      'The load is the effort times IMA, times the efficiency.',
    ],
    A: [
      (v) => div(100 * v.W!, v.F! * v.p!),
      '100 × {W}/({F} × {p})',
      'Load over effort is the actual advantage; divide by the efficiency for the ideal one.',
    ],
    p: [
      (v) => div(100 * v.W!, v.F! * v.A!),
      '100 × {W}/({F} × {A})',
      'The ideal effort over the actual effort, as a percent.',
    ],
  },
);

const energyPages: ModuleDef[] = [
  (() => {
    const [m, H, h] = [0.25, 8, 3];
    const E = m * G * H;
    const U = m * G * h;
    const K = E - U;
    return {
      id: 's.11.work-energy-power',
      unitSystems: ['metric'],
      assumptions: [
        'The car starts at rest at height h₀, and heights are measured from the lowest point.',
        'No friction or air resistance, so the total energy E stays the same: U + K = E.',
        'Mass cancels out of the speed: every car from the same height has the same v there.',
      ],
      variables: [
        q('m', 'm', 'Mass', 'kg', 0.01, 10000, 0.01),
        q('H', 'h₀', 'Starting height', 'm', 0.01, 500, 0.01),
        q('h', 'h', 'Height now', 'm', 0, 500, 0.01),
        q('v', 'v', 'Speed now', 'm/s', 0, 200, 0.01),
        q('U', 'U', 'Potential energy', 'J', 0, 1e8, 0.0001),
        q('K', 'K', 'Kinetic energy', 'J', 0, 1e8, 0.0001),
        q('E', 'E', 'Total energy', 'J', 0, 1e8, 0.0001),
      ],
      ...withOrder(
        atLeast('H', 'h'),
        rule('E = mgh₀', '{E} = {m} × 9.8 × {H}', (v) => v.E! - v.m! * G * v.H!, {
          E: [
            (v) => v.m! * G * v.H!,
            '{m} × 9.8 × {H}',
            'At the start it is all potential energy.',
          ],
          m: [(v) => div(v.E!, G * v.H!), '{E}/(9.8 × {H})', 'Divide by g × h₀.'],
          H: [(v) => div(v.E!, G * v.m!), '{E}/({m} × 9.8)', 'Divide by m × g.'],
        }),
        rule('U = mgh', '{U} = {m} × 9.8 × {h}', (v) => v.U! - v.m! * G * v.h!, {
          U: [
            (v) => v.m! * G * v.h!,
            '{m} × 9.8 × {h}',
            'Each kilogram lifted each meter stores 9.8 J.',
          ],
          h: [(v) => div(v.U!, G * v.m!), '{U}/({m} × 9.8)', 'Divide by m × g.'],
        }),
        difference('K', 'E', 'U', 'K = E − U', 'What is not potential energy is kinetic energy.'),
        rule('K = ½mv²', '{K} = ½ × {m} × {v}²', (v) => v.K! - 0.5 * v.m! * v.v! * v.v!, {
          v: [
            (v) => (v.K! >= 0 && v.m! > 0 ? Math.sqrt((2 * v.K!) / v.m!) : undefined),
            '√(2 × {K}/{m})',
            'Double the kinetic energy, divide by the mass, take the square root.',
          ],
          K: [
            (v) => 0.5 * v.m! * v.v! * v.v!,
            '½ × {m} × {v}²',
            'Half the mass times the speed squared.',
          ],
        }),
      ),
      example: { m, H, h, v: Math.sqrt((2 * K) / m), U, K, E },
      startWith: ['m', 'H', 'h'],
      representation: {
        kind: 'energyTrack',
        track: 'coaster',
        height: 'h',
        potential: 'U',
        kinetic: 'K',
        total: 'E',
        top: 'H',
        mass: 'm',
        speed: 'v',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [m, F, a, d] = [5, 40, 30, 15];
    return {
      id: 's.11.work-energy-power~work',
      title: 'Work done by a pull at an angle',
      use: 'Use this for “A crate is pulled 15 m across a floor by a 40 N force at 30° above level. How much work does the force do?”',
      unitSystems: ['metric'],
      assumptions: [
        'Only the part of the force along the motion, F cos θ, does work: W = Fd cos θ.',
        'At θ = 0 the whole force is along the motion; at 90° it does no work.',
        'The weight and the normal force are at right angles to the motion, so they do no work.',
      ],
      variables: [
        q('m', 'm', 'Mass of the crate', 'kg', 0.1, 1e4, 0.1),
        q('G', 'F_g', 'Weight', 'N', 0, 1e6, 0.01),
        q('N', 'F_N', 'Normal force', 'N', 0, 1e6, 0.01),
        q('F', 'F', 'Pull', 'N', 0.1, 1e5, 0.1),
        q('q', 'θ', 'Angle above level', '°', 0, 89, 1),
        q('d', 'd', 'Distance moved', 'm', 0.01, 1e4, 0.01),
        q('W', 'W', 'Work done by the pull', 'J', 0, 1e9, 0.01),
      ],
      ...rules(
        rule('F_g = mg', '{G} = {m} × 9.8', (x) => x.G! - x.m! * G, {
          G: [(x) => x.m! * G, '{m} × 9.8', 'The weight is the mass times g.'],
          m: [(x) => x.G! / G, '{G}/9.8', 'Divide the weight by g.'],
        }),
        rule(
          'F_N = F_g − F sin θ',
          '{N} = {G} − {F} × sin({q})',
          (x) => x.N! - (x.G! - x.F! * Math.sin(x.q! * RAD)),
          {
            N: [
              (x) => x.G! - x.F! * Math.sin(x.q! * RAD),
              '{G} − {F} × sin({q})',
              'The pull’s part up, F sin θ, lifts a little: the floor pushes up less.',
            ],
          },
        ),
        rule(
          'W = Fd cos θ',
          '{W} = {F} × {d} × cos({q})',
          (x) => x.W! - x.F! * x.d! * Math.cos(x.q! * RAD),
          {
            W: [
              (x) => x.F! * x.d! * Math.cos(x.q! * RAD),
              '{F} × {d} × cos({q})',
              'The pull’s part along the floor, F cos θ, times the distance.',
            ],
            F: [
              (x) => div(x.W!, x.d! * Math.cos(x.q! * RAD)),
              '{W}/(cos({q}) × {d})',
              'Divide the work by d cos θ.',
            ],
            d: [
              (x) => div(x.W!, x.F! * Math.cos(x.q! * RAD)),
              '{W}/(cos({q}) × {F})',
              'Divide the work by the pull’s part along the floor.',
            ],
            q: undefined,
          },
        ),
      ),
      example: {
        m,
        G: m * G,
        N: m * G - F * Math.sin(a * RAD),
        F,
        q: a,
        d,
        W: F * d * Math.cos(a * RAD),
      },
      startWith: ['m', 'F', 'q', 'd'],
      representation: {
        kind: 'freeBody',
        support: 'floor',
        mass: 'm',
        weight: 'G',
        normal: 'N',
        applied: 'F',
        appliedAngle: 'q',
        displacement: 'd',
        work: 'W',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [m, h, t] = [60, 4.5, 6];
    const W = m * G * h;
    return {
      id: 's.11.work-energy-power~power',
      title: 'Power: work done each second',
      use: 'Use this for “A 60 kg student runs up 4.5 m of stairs in 6 s. How much work does she do, and what is her power?”',
      unitSystems: ['metric'],
      assumptions: [
        'Lifting at a steady speed takes a force equal to the weight, mg, over the height: W = mgh.',
        'Power is work per second: P = W/t. One watt is one joule each second.',
        'The path does not matter, only the height gained: stairs or a rope, the work is the same.',
      ],
      variables: [
        q('m', 'm', 'Mass', 'kg', 0.1, 1e5, 0.1),
        q('h', 'h', 'Height raised', 'm', 0.01, 1e4, 0.01),
        q('t', 't', 'Time taken', 's', 0.01, 1e6, 0.01, { units: ['s'] }),
        q('W', 'W', 'Work done', 'J', 0, 1e10, 0.01),
        q('P', 'P', 'Power', 'W', 0, 1e9, 0.01),
      ],
      ...rules(
        rule('W = mgh', '{W} = {m} × 9.8 × {h}', (x) => x.W! - x.m! * G * x.h!, {
          W: [
            (x) => x.m! * G * x.h!,
            '{m} × 9.8 × {h}',
            'The weight, mg, times the height raised.',
          ],
          m: [(x) => div(x.W!, G * x.h!), '{W}/(9.8 × {h})', 'Divide the work by gh.'],
          h: [(x) => div(x.W!, x.m! * G), '{W}/({m} × 9.8)', 'Divide the work by the weight.'],
        }),
        rule('P = W/t', '{P} = {W}/{t}', (x) => x.P! * x.t! - x.W!, {
          P: [(x) => div(x.W!, x.t!), '{W}/{t}', 'The joules for each second.'],
          W: [(x) => x.P! * x.t!, '{P} × {t}', 'Joules each second times the seconds.'],
          t: [(x) => div(x.W!, x.P!), '{W}/{P}', 'How many seconds at P joules each second.'],
        }),
      ),
      example: { m, h, t, W, P: W / t },
      startWith: ['m', 'h', 't'],
      representation: {
        kind: 'powerLift',
        mass: 'm',
        height: 'h',
        time: 't',
        work: 'W',
        power: 'P',
      },
    } satisfies ModuleDef;
  })(),
  {
    id: 's.11.work-energy-power~lever',
    title: 'A lever',
    use: 'Use this for “A 600 N load sits 0.4 m from the fulcrum, and you push 1.6 m from it. What is the mechanical advantage, and what effort lifts it?”',
    unitSystems: ['metric'],
    assumptions: [
      'A lever balances when effort × effort arm = load × load arm.',
      'The ideal mechanical advantage is the effort arm over the load arm: a long effort arm means less force.',
      'Less force, more distance: the work you put in is the work done on the load.',
    ],
    variables: [
      LOAD,
      q('e', 'L_E', 'Effort arm', 'm', 0.01, 100, 0.01),
      q('l', 'L_L', 'Load arm', 'm', 0.01, 100, 0.01),
      MA,
      EFFORT,
    ],
    ...rules(
      rule('MA = L_E/L_L', '{A} = {e}/{l}', (v) => v.A! * v.l! - v.e!, {
        A: [(v) => div(v.e!, v.l!), '{e}/{l}', 'Effort arm over load arm.'],
        e: [(v) => v.A! * v.l!, '{A} × {l}', 'The mechanical advantage times the load arm.'],
        l: [(v) => div(v.e!, v.A!), '{e}/{A}', 'The effort arm over the mechanical advantage.'],
      }),
      rule('F_E = F_L/MA', '{F} = {W}/{A}', (v) => v.F! * v.A! - v.W!, {
        F: [
          (v) => div(v.W!, v.A!),
          '{W}/{A}',
          'An ideal machine divides the load by its mechanical advantage.',
        ],
        W: [(v) => v.F! * v.A!, '{F} × {A}', 'The effort times the mechanical advantage.'],
        A: [
          (v) => div(v.W!, v.F!),
          '{W}/{F}',
          'How many times the load is bigger than the effort.',
        ],
      }),
    ),
    example: { W: 600, e: 1.6, l: 0.4, A: 4, F: 150 },
    startWith: ['W', 'e', 'l'],
    representation: {
      kind: 'simpleMachine',
      machine: 'lever',
      load: 'W',
      effortArm: 'e',
      loadArm: 'l',
      advantage: 'A',
      effort: 'F',
    },
  },
  (() => {
    const [W, n, p, h] = [800, 4, 80, 0.5];
    return {
      id: 's.11.work-energy-power~pulley',
      title: 'A block and tackle',
      use: 'Use this for “Four strands hold up an 800 N crate and the pulleys are 80% efficient. What pull lifts it, and how much rope do you pull to lift it 0.5 m?”',
      unitSystems: ['metric'],
      assumptions: [
        'Each supporting strand holds an equal share of the load: the ideal mechanical advantage IMA is the number of strands.',
        'Less force, more distance: pull the rope IMA times as far as the load rises.',
        'Friction in the pulleys wastes some work: divide the ideal effort by the efficiency.',
      ],
      variables: [
        LOAD,
        q('n', 'n', 'Supporting strands', undefined, 1, 6, 1, { integer: true }),
        IMA,
        EFFICIENCY,
        EFFORT,
        q('h', 'd_L', 'Load lifted', 'm', 0.01, 100, 0.01),
        q('d', 'd_E', 'Rope pulled', 'm', 0.01, 1000, 0.01),
      ],
      ...rules(
        rule('IMA = n', '{A} = {n}', (v) => v.A! - v.n!, {
          A: [(v) => v.n!, '{n}', 'Count the strands holding up the moving pulley.'],
          n: [(v) => v.A!, '{A}', 'The strands are the ideal mechanical advantage.'],
        }),
        effortRule,
        product('d', 'A', 'h', 'd_E = IMA × d_L', [
          'Each strand shortens by the lift, so pull IMA times as much rope.',
          'Divide the rope pulled by the lift.',
          'Divide the rope pulled by the ideal mechanical advantage.',
        ]),
      ),
      example: { W, n, A: n, p, F: (100 * W) / (n * p), h, d: n * h },
      startWith: ['W', 'n', 'p', 'h'],
      representation: {
        kind: 'simpleMachine',
        machine: 'pulley',
        load: 'W',
        strands: 'n',
        advantage: 'A',
        efficiency: 'p',
        effort: 'F',
        loadDistance: 'h',
        effortDistance: 'd',
      },
    } satisfies ModuleDef;
  })(),
  {
    id: 's.11.work-energy-power~ramp',
    title: 'A ramp',
    use: 'Use this for “A 900 N crate is pushed up a 3 m ramp onto a 1 m platform. What is the ideal mechanical advantage and the effort? What if the ramp is 75% efficient?”',
    unitSystems: ['metric'],
    assumptions: [
      'The ideal mechanical advantage of a ramp is its length over its height.',
      'Friction wastes some of the work: the actual effort is the ideal effort divided by the efficiency.',
      'A smooth ramp is 100% efficient.',
    ],
    variables: [
      LOAD,
      q('L', 'L', 'Ramp length', 'm', 0.1, 1000, 0.1),
      q('h', 'h', 'Ramp height', 'm', 0.01, 1000, 0.01),
      EFFICIENCY,
      IMA,
      EFFORT,
    ],
    ...rules(
      rule('IMA = L/h', '{A} = {L}/{h}', (v) => v.A! * v.h! - v.L!, {
        A: [(v) => div(v.L!, v.h!), '{L}/{h}', 'The ramp’s length over its height.'],
        L: [(v) => v.A! * v.h!, '{A} × {h}', 'The ideal mechanical advantage times the height.'],
        h: [(v) => div(v.L!, v.A!), '{L}/{A}', 'The length over the ideal mechanical advantage.'],
      }),
      effortRule,
    ),
    example: { W: 900, L: 3, h: 1, p: 100, A: 3, F: 300 },
    startWith: ['W', 'L', 'h', 'p'],
    representation: {
      kind: 'simpleMachine',
      machine: 'incline',
      load: 'W',
      length: 'L',
      height: 'h',
      efficiency: 'p',
      advantage: 'A',
      effort: 'F',
    },
  },
  (() => {
    const [k, x, m, f, d, h] = [400, 0.15, 0.5, 2, 0.5, 0.5];
    const E = 0.5 * k * x * x;
    const Q = f * d;
    const U = m * G * h;
    return {
      id: 's.11.work-energy-power~spring',
      title: 'A spring launcher, friction and a ramp',
      use: 'Use this for “A spring (k = 400 N/m) pressed 0.15 m launches a 0.5 kg block over 0.5 m of floor with 2 N of friction. How high up the smooth ramp does it go?”',
      unitSystems: ['metric'],
      assumptions: [
        'The spring stores ½kx²; friction turns fd into heat; the smooth ramp trades kinetic energy for mgh.',
        'The total never changes: spring energy = heat + potential + kinetic.',
        'At the highest point the block stops for an instant: type K = 0 to find that height.',
      ],
      variables: [
        q('k', 'k', 'Spring constant', 'N/m', 1, 100000, 1),
        q('x', 'x', 'Compression', 'm', 0.001, 2, 0.001),
        q('m', 'm', 'Mass', 'kg', 0.01, 100, 0.01),
        q('f', 'f', 'Friction', 'N', 0, 1000, 0.1),
        q('d', 'd', 'Rough patch', 'm', 0, 100, 0.01),
        q('h', 'h', 'Height on the ramp', 'm', 0, 100, 0.001),
        q('E', 'Eₛ', 'Spring energy', 'J', 0, 1e6, 0.0001),
        q('Q', 'Q', 'Heat', 'J', 0, 1e6, 0.0001),
        q('U', 'U', 'Potential energy', 'J', 0, 1e6, 0.0001),
        q('K', 'K', 'Kinetic energy', 'J', 0, 1e6, 0.0001),
      ],
      ...rules(
        rule('Eₛ = ½kx²', '{E} = ½ × {k} × {x}²', (v) => v.E! - 0.5 * v.k! * v.x! * v.x!, {
          E: [(v) => 0.5 * v.k! * v.x! * v.x!, '½ × {k} × {x}²', 'A spring pressed x stores ½kx².'],
          k: [(v) => div(2 * v.E!, v.x! * v.x!), '2 × {E}/({x}²)', 'Undo ½kx² for k.'],
          x: [
            (v) => Math.sqrt(Math.max(0, div(2 * v.E!, v.k!) ?? 0)),
            '√(2 × {E}/{k})',
            'Undo ½kx² for x.',
          ],
        }),
        product('Q', 'f', 'd', 'Q = fd', [
          'Friction’s work on the rough patch becomes heat: force times distance.',
          'Divide the heat by the distance.',
          'Divide the heat by the friction.',
        ]),
        rule('U = mgh', '{U} = {m} × 9.8 × {h}', (v) => v.U! - v.m! * G * v.h!, {
          U: [(v) => v.m! * G * v.h!, '{m} × 9.8 × {h}', 'Lifting m to height h stores mgh.'],
          h: [(v) => div(v.U!, v.m! * G), '{U}/({m} × 9.8)', 'Divide the potential energy by mg.'],
          m: [(v) => div(v.U!, G * v.h!), '{U}/(9.8 × {h})', 'Divide the potential energy by gh.'],
        }),
        rule('K = Eₛ − Q − U', '{K} = {E} − {Q} − {U}', (v) => v.K! - v.E! + v.Q! + v.U!, {
          K: [
            (v) => v.E! - v.Q! - v.U!,
            '{E} − {Q} − {U}',
            'What the spring gave, less the heat and the height gained.',
          ],
          U: [
            (v) => v.E! - v.Q! - v.K!,
            '{E} − {Q} − {K}',
            'What is left after the heat and the kinetic energy.',
          ],
          E: [
            (v) => v.K! + v.Q! + v.U!,
            '{K} + {Q} + {U}',
            'All the energy now came from the spring.',
          ],
          Q: [
            (v) => v.E! - v.U! - v.K!,
            '{E} − {U} − {K}',
            'The energy missing from potential and kinetic is heat.',
          ],
        }),
      ),
      example: { k, x, m, f, d, h, E, Q, U, K: E - Q - U },
      startWith: ['k', 'x', 'm', 'f', 'd', 'h'],
      representation: {
        kind: 'energyTrack',
        track: 'coaster',
        height: 'h',
        potential: 'U',
        kinetic: 'K',
        mass: 'm',
        spring: { k: 'k', compression: 'x', stored: 'E', friction: 'f', rough: 'd', heat: 'Q' },
      },
    } satisfies ModuleDef;
  })(),
];

// ─── s.11.sound-waves ───────────────────────────────────────────────────────

const WAVE_SPEED = q('v', 'v', 'Wave speed', 'm/s', 0.1, 10000, 0.1);
const LAMBDA = q('l', 'λ', 'Wavelength', 'm', 0.0001, 1e5, 0.0001);
const FREQ = q('f', 'f', 'Frequency', 'Hz', 0.1, 1e6, 0.1);

/** v = fλ. */
const freqRule = rule('v = fλ', '{v} = {f} × {l}', (v) => v.f! * v.l! - v.v!, {
  f: [
    (v) => div(v.v!, v.l!),
    '{v}/{l}',
    'Waves pass at v; each is λ long: v/λ of them each second.',
  ],
  v: [(v) => v.f! * v.l!, '{f} × {l}', 'The frequency times the wavelength.'],
  l: [(v) => div(v.v!, v.f!), '{v}/{f}', 'The speed over the frequency.'],
});

/** A standing wave on a string or in a pipe: λ = 2L ÷ n (or 4L ÷ n), then f = v ÷ λ. */
const standingPage = (
  id: string,
  title: string,
  use: string,
  assumptions: string[],
  medium: 'string' | 'open' | 'closed',
  ex: { n: number; L: number; v: number },
): ModuleDef => {
  const k = medium === 'closed' ? 4 : 2;
  const l = (k * ex.L) / ex.n;
  const part = medium === 'closed' ? 'quarter' : 'half';
  return {
    id,
    title,
    use,
    unitSystems: ['metric'],
    assumptions,
    variables: [
      medium === 'closed'
        ? q('n', 'n', 'Harmonic (odd)', undefined, 1, 9, 2, {
            integer: true,
            allowed: [1, 3, 5, 7, 9],
          })
        : q('n', 'n', 'Harmonic', undefined, 1, 10, 1, { integer: true }),
      q('L', 'L', medium === 'string' ? 'String length' : 'Pipe length', 'm', 0.01, 100, 0.01),
      { ...WAVE_SPEED, min: 1 },
      LAMBDA,
      FREQ,
    ],
    ...rules(
      rule(`λ = ${k}L/n`, `{l} = ${k} × {L}/{n}`, (v) => v.l! * v.n! - k * v.L!, {
        l: [
          (v) => div(k * v.L!, v.n!),
          `${k} × {L}/{n}`,
          `Harmonic n fits n ${part} wavelengths in the length.`,
        ],
        L: [(v) => (v.l! * v.n!) / k, `{l} × {n}/${k}`, `n ${part} wavelengths make the length.`],
        n: [(v) => div(k * v.L!, v.l!), `${k} × {L}/{l}`, `How many ${part} wavelengths fit.`],
      }),
      freqRule,
    ),
    example: { ...ex, l, f: ex.v / l },
    startWith: ['n', 'L', 'v'],
    representation: {
      kind: 'wave',
      wavelength: 'l',
      frequency: 'f',
      extent: 1,
      standing: { medium, harmonic: 'n', length: 'L', speed: 'v' },
    },
  };
};

const soundPages: ModuleDef[] = [
  (() => {
    const [v, f, A] = [343, 440, 0.02];
    return {
      id: 's.11.sound-waves',
      unitSystems: ['metric'],
      assumptions: [
        'The medium sets the wave speed, so a new frequency changes the wavelength, not the speed.',
        'The amplitude is the loudness (or the height of the wave): it doesn’t change λ or v.',
        'Sound in air at 20 °C travels at 343 m/s.',
      ],
      variables: [
        WAVE_SPEED,
        FREQ,
        LAMBDA,
        q('T', 'T', 'Period', 's', 1e-6, 10, 0.000001),
        q('A', 'A', 'Amplitude', 'm', 0.0001, 100, 0.0001),
      ],
      standalone: {
        vars: ['A'],
        why: 'The amplitude sets how loud or tall the wave is; no formula here links it to v, f or λ.',
      },
      ...rules(
        freqRule,
        rule('T = 1/f', '{T} = 1/{f}', (v) => v.T! * v.f! - 1, {
          T: [
            (v) => div(1, v.f!),
            '1/{f}',
            'The period is the time for one wave: 1 over the frequency.',
          ],
          f: [(v) => div(1, v.T!), '1/{T}', 'The frequency is how many periods fit in a second.'],
        }),
      ),
      example: { v, f, l: v / f, T: 1 / f, A },
      startWith: ['v', 'f', 'A'],
      representation: { kind: 'wave', amplitude: 'A', wavelength: 'l', frequency: 'f', extent: 4 },
      pictureLabels: ['v', 'T'],
    } satisfies ModuleDef;
  })(),
  standingPage(
    's.11.sound-waves~string',
    'A standing wave on a string',
    'Use this for “A 0.65 m guitar string carries waves at 286 m/s. What frequency is its first harmonic?”',
    [
      'Both ends are fixed, so they are nodes: harmonic n fits n half wavelengths, λ = 2L/n.',
      'Nodes (N) never move; antinodes (A) swing the most.',
      'The string’s tension and mass set the wave speed v.',
    ],
    'string',
    { n: 1, L: 0.65, v: 286 },
  ),
  standingPage(
    's.11.sound-waves~open-pipe',
    'A pipe open at both ends',
    'Use this for “A 0.50 m flute-like pipe is open at both ends. What is its lowest note in 343 m/s air?”',
    [
      'The curves show how far the air moves: both open ends are antinodes.',
      'Harmonic n fits n half wavelengths: λ = 2L/n, every whole n allowed.',
    ],
    'open',
    { n: 1, L: 0.5, v: 343 },
  ),
  standingPage(
    's.11.sound-waves~closed-pipe',
    'A pipe closed at one end',
    'Use this for “A 0.25 m tube is closed at the bottom. What are its first two notes in 343 m/s air?”',
    [
      'The closed end is a node and the open end an antinode: odd numbers of quarter wavelengths fit, λ = 4L/n.',
      'Only odd harmonics sound: n = 1, 3, 5, …',
    ],
    'closed',
    { n: 1, L: 0.25, v: 343 },
  ),
  (() => {
    const [s, v, f] = [25, 343, 700];
    return {
      id: 's.11.sound-waves~doppler',
      title: 'The Doppler effect',
      use: 'Use this for “A 700 Hz siren passes you at 25 m/s. What pitch do you hear as it comes and as it goes?”',
      unitSystems: ['metric'],
      assumptions: [
        'The source sends out one wavefront each period, from wherever it is then; the air carries each out at v.',
        'Ahead the fronts bunch up: a higher frequency. Behind they spread out: a lower one.',
        'The listener stands still (one moving toward a still source hears f(v + v_L)/v); the source moves slower than sound.',
      ],
      variables: [
        q('s', 'vₛ', 'Speed of the source', 'm/s', 0.1, 300, 0.1),
        { ...WAVE_SPEED, min: 301, max: 2000 },
        { ...FREQ, name: 'Frequency sent out', min: 1, max: 1e5 },
        LAMBDA,
        q('a', 'f′₁', 'Frequency heard ahead', 'Hz', 0.01, 1e7, 0.01),
        q('b', 'f′₂', 'Frequency heard behind', 'Hz', 0.01, 1e7, 0.01),
      ],
      ...rules(
        rule('λ = v/f', '{l} = {v}/{f}', (v) => v.l! * v.f! - v.v!, {
          l: [(v) => div(v.v!, v.f!), '{v}/{f}', 'At rest the waves are v/f apart.'],
          f: [(v) => div(v.v!, v.l!), '{v}/{l}', 'The speed over the wavelength.'],
          v: [(v) => v.l! * v.f!, '{l} × {f}', 'The speed is the wavelength times the frequency.'],
        }),
        rule(
          'f′ = fv/(v − vₛ)',
          '{a} = {f} × {v}/({v} − {s})',
          (v) => v.a! * (v.v! - v.s!) - v.f! * v.v!,
          {
            a: [
              (v) => div(v.f! * v.v!, v.v! - v.s!),
              '{f} × {v}/({v} − {s})',
              'Ahead the fronts are only (v − vₛ)/f apart: a higher pitch.',
            ],
            f: [
              (v) => div(v.a! * (v.v! - v.s!), v.v!),
              '{a} × ({v} − {s})/{v}',
              'Undo the Doppler shift.',
            ],
            s: [
              (v) => v.v! - div(v.f! * v.v!, v.a!)!,
              '{v} − {f} × {v}/{a}',
              'Solve the Doppler formula for vₛ.',
            ],
          },
        ),
        rule(
          'f′ = fv/(v + vₛ)',
          '{b} = {f} × {v}/({v} + {s})',
          (v) => v.b! * (v.v! + v.s!) - v.f! * v.v!,
          {
            b: [
              (v) => div(v.f! * v.v!, v.v! + v.s!),
              '{f} × {v}/({v} + {s})',
              'Behind the fronts are (v + vₛ)/f apart: a lower pitch.',
            ],
            f: [
              (v) => div(v.b! * (v.v! + v.s!), v.v!),
              '{b} × ({v} + {s})/{v}',
              'Undo the Doppler shift.',
            ],
            s: [
              (v) => div(v.f! * v.v!, v.b!)! - v.v!,
              '{f} × {v}/{b} − {v}',
              'Solve the Doppler formula for vₛ.',
            ],
          },
        ),
      ),
      example: { s, v, f, l: v / f, a: (f * v) / (v - s), b: (f * v) / (v + s) },
      startWith: ['s', 'v', 'f'],
      representation: {
        kind: 'wave',
        wavelength: 'l',
        frequency: 'f',
        extent: 1,
        doppler: { sourceSpeed: 's', waveSpeed: 'v', frequency: 'f', ahead: 'a', behind: 'b' },
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const I = 1e-5;
    const L = Math.log10(I);
    return {
      id: 's.11.sound-waves~sound-level',
      title: 'Sound level in decibels',
      use: 'Use this for “A busy street has a sound intensity of 10⁻⁵ W/m². What is its sound level in decibels?”',
      assumptions: [
        'Hearing starts at I₀ = 10⁻¹² W/m² (0 dB); β = 10 log(I ÷ I₀).',
        'Each power of ten in intensity adds 10 dB: ten times the intensity, 10 dB louder.',
      ],
      variables: [
        q('I', 'I', 'Intensity', 'W/m²', 1e-12, 100, 1e-12, { scientific: true }),
        q('a', 'a', 'Number in front (1 to 10)', undefined, 1, 9.999, 0.001, {
          derived: true,
          hidden: true,
        }),
        q('n', 'n', 'Power of ten', undefined, -12, 2, 1, {
          integer: true,
          derived: true,
          hidden: true,
        }),
        q('L', 'L', 'Log of the intensity', undefined, -12, 2, 0.001, { derived: true }),
        q('B', 'β', 'Sound level', 'dB', 0, 140, 0.01),
      ],
      ...rules(
        hide(
          rule('I = a × 10^n', '{I} = {a} × 10^{n}', (v) => v.I! - v.a! * 10 ** v.n!, {
            a: [(v) => v.I! / 10 ** v.n!, '{I} ÷ 10^{n}', ''],
          }),
        ),
        hide(
          rule(
            'n from I',
            '{n} = exponent of the power of ten at or below {I}',
            (v) => v.n! - Math.floor(Math.log10(v.I!) + 1e-9),
            {
              n: [
                (v) => (v.I! > 0 ? Math.floor(Math.log10(v.I!) + 1e-9) : undefined),
                'exponent of the power of ten at or below {I}',
                'The whole part of the log: the power of ten the intensity sits at.',
              ],
              I: null,
            },
          ),
        ),
        rule('L = log₁₀ I', '{L} = log₁₀({I})', (v) => v.L! - Math.log10(v.I!), {
          L: [
            (v) => (v.I! > 0 ? Math.log10(v.I!) : undefined),
            'log₁₀({I})',
            'The power of ten that makes the intensity.',
          ],
          I: [(v) => 10 ** v.L!, '10^{L}', 'Undo the log: 10 to that power.'],
        }),
        rule('β = 10 × (L + 12)', '{B} = 10 × ({L} + 12)', (v) => v.B! - 10 * (v.L! + 12), {
          B: [
            (v) => 10 * (v.L! + 12),
            '10 × ({L} + 12)',
            'log(I ÷ 10⁻¹²) is log I + 12: the powers of ten above the threshold, 10 dB each.',
          ],
          L: [
            (v) => v.B! / 10 - 12,
            '{B}/10 − 12',
            'Undo the decibel scale: divide by 10, take 12.',
          ],
        }),
      ),
      example: { I, a: 1, n: -5, L, B: 10 * (L + 12) },
      startWith: ['I'],
      representation: {
        kind: 'powerScale',
        number: 'I',
        mantissa: 'a',
        exponent: 'n',
        log: 'L',
        fixed: true,
      },
      pictureLabels: ['B'],
    } satisfies ModuleDef;
  })(),
];

// ─── s.11.optics ────────────────────────────────────────────────────────────

/** A lens or mirror page: 1/f = 1/dₒ + 1/dᵢ, m = −dᵢ/dₒ, hᵢ = m hₒ (f signed). */
const opticsPage = (
  id: string,
  title: string | undefined,
  use: string | undefined,
  assumptions: string[],
  mode: 'lens' | 'mirror',
  shape: 'converging' | 'diverging' | 'concave' | 'convex',
  ex: { f: number; o: number; h: number },
): ModuleDef => {
  const i = 1 / (1 / ex.f - 1 / ex.o);
  const m = -i / ex.o;
  const positive = shape === 'converging' || shape === 'concave';
  return {
    id,
    ...(title ? { title } : {}),
    ...(use ? { use } : {}),
    unitSystems: ['metric'],
    assumptions,
    variables: [
      positive
        ? q('f', 'f', 'Focal length', 'cm', 1, 500, 0.1)
        : q('f', 'f', 'Focal length (negative)', 'cm', -500, -1, 0.1),
      q('o', 'dₒ', 'Object distance', 'cm', 1, 10000, 0.1),
      q('i', 'dᵢ', 'Image distance', 'cm', -1e6, 1e6, 0.01),
      q('m', 'm', 'Magnification', undefined, -100, 100, 0.001),
      q('h', 'hₒ', 'Object height', 'cm', 0.1, 1000, 0.1),
      q('k', 'hᵢ', 'Image height', 'cm', -1e6, 1e6, 0.01),
    ],
    ...withChecks(
      [],
      rule('1/f = 1/dₒ + 1/dᵢ', '1/{f} = 1/{o} + 1/{i}', (v) => 1 / v.f! - 1 / v.o! - 1 / v.i!, {
        i: [
          (v) => div(1, 1 / v.f! - 1 / v.o!),
          '1/(1/{f} − 1/{o})',
          'Take 1/dₒ from 1/f, then flip.',
        ],
        o: [
          // An image at F is an object at infinity: past 1000 f the object distance is lost.
          (v) => {
            const o = div(1, 1 / v.f! - 1 / v.i!);
            return o === undefined || Math.abs(o) > 1000 * Math.abs(v.f!) ? undefined : o;
          },
          '1/(1/{f} − 1/{i})',
          'Take 1/dᵢ from 1/f, then flip.',
        ],
        f: [
          (v) => div(1, 1 / v.o! + 1 / v.i!),
          '1/(1/{o} + 1/{i})',
          'Add 1/dₒ and 1/dᵢ, then flip.',
        ],
      }),
      rule('m = −dᵢ/dₒ', '{m} = −{i}/{o}', (v) => v.m! * v.o! + v.i!, {
        m: [
          (v) => div(-v.i!, v.o!),
          '−{i}/{o}',
          'The magnification: negative means the image is upside down.',
        ],
        i: [(v) => -v.m! * v.o!, '−{m} × {o}', 'Undo m = −dᵢ/dₒ for dᵢ.'],
        o: [(v) => div(-v.i!, v.m!), '−{i}/{m}', 'Divide the image distance by −m.'],
      }),
      product('k', 'm', 'h', 'hᵢ = m hₒ', [
        'The image is m times as tall as the object.',
        'Divide the image height by the object height.',
        'Divide the image height by the magnification.',
      ]),
    ),
    example: { ...ex, i, m, k: m * ex.h },
    startWith: ['f', 'o', 'h'],
    representation: {
      kind: 'rayDiagram',
      mode,
      shape,
      focal: 'f',
      objectDistance: 'o',
      objectHeight: 'h',
      imageDistance: 'i',
      magnification: 'm',
      imageHeight: 'k',
    },
  };
};

const SIGNS =
  'dᵢ > 0 is a real image (light really meets there); dᵢ < 0 is a virtual one. m < 0 means upside down.';

const opticsPages: ModuleDef[] = [
  opticsPage(
    's.11.optics',
    undefined,
    undefined,
    [
      'A thin converging lens: f > 0, and distances are measured from the lens.',
      'dᵢ > 0: a real image on the far side, where light really meets; dᵢ < 0: a virtual one on the object’s side.',
      'm < 0 means the image is upside down.',
    ],
    'lens',
    'converging',
    { f: 10, o: 30, h: 4 },
  ),
  opticsPage(
    's.11.optics~diverging',
    'A diverging lens',
    'Use this for “An object is 24 cm from a diverging lens with f = −12 cm. Where is the image, and how big?”',
    [
      'A diverging lens spreads rays out: f < 0.',
      'Its image is always virtual, upright and smaller, between F and the lens.',
      SIGNS,
    ],
    'lens',
    'diverging',
    { f: -12, o: 24, h: 3 },
  ),
  opticsPage(
    's.11.optics~concave',
    'A concave mirror',
    'Use this for “A candle is 45 cm from a concave mirror with f = 15 cm. Where does its image form, and how big is it?”',
    [
      'A concave mirror brings light together: f > 0. Beyond F the image is real, in front; inside F it is virtual, behind the mirror.',
      'Rays: parallel then through F, through F then parallel, and through C straight back.',
      SIGNS,
    ],
    'mirror',
    'concave',
    { f: 15, o: 45, h: 4 },
  ),
  opticsPage(
    's.11.optics~convex',
    'A convex mirror',
    'Use this for “A car is 30 cm from a convex mirror with f = −20 cm. Where is its image, and how big?”',
    [
      'A convex mirror spreads light out: f < 0.',
      'The image is behind it: virtual, upright and smaller, showing a wide view.',
      SIGNS,
    ],
    'mirror',
    'convex',
    { f: -20, o: 30, h: 5 },
  ),
  (() => {
    const [a, b, t] = [1, 1.33, 40];
    const s = (a / b) * Math.sin(t * RAD);
    return {
      id: 's.11.optics~refraction',
      title: 'Refraction: Snell’s law',
      use: 'Use this for “Light goes from air into water (n = 1.33) at 40° from the normal. At what angle does it travel in the water, and how fast?”',
      unitSystems: ['metric'],
      assumptions: [
        'Light slows in glass or water (v = c/n); crossing at an angle, it bends.',
        'n₁ sin θ₁ = n₂ sin θ₂, with the angles measured from the normal (dashed).',
        'Into a slower medium (bigger n), the ray bends toward the normal.',
      ],
      variables: [
        q('a', 'n₁', 'Index of the first medium', undefined, 1, 2.42, 0.01),
        q('b', 'n₂', 'Index of the second medium', undefined, 1, 2.42, 0.01),
        q('t', 'θ₁', 'Angle in', '°', 0, 89, 1),
        q('s', 's', 'Sine of the angle out', undefined, 0, 1, 0.0001),
        q('r', 'θ₂', 'Angle out', '°', 0, 90, 0.01),
        q('w', 'v₂', 'Speed in the second medium', 'm/s', 1e8, 3e8, 1, {
          scientific: true,
          units: ['m/s'],
        }),
      ],
      ...rules(
        rule(
          's = (n₁/n₂) sin θ₁',
          '{s} = {a} ÷ {b} × sin({t})',
          (v) => v.s! * v.b! - v.a! * Math.sin(v.t! * RAD),
          {
            s: [
              (v) => div(v.a! * Math.sin(v.t! * RAD), v.b!),
              '{a} ÷ {b} × sin({t})',
              'Snell’s law n₁ sin θ₁ = n₂ sin θ₂, solved for sin θ₂.',
            ],
            t: [
              (v) => {
                const r = (v.b! * v.s!) / v.a!;
                return r > 1 ? undefined : Math.asin(r) / RAD;
              },
              'arcsin({b} × {s}/{a})',
              'Snell’s law solved for sin θ₁, then the angle with that sine.',
            ],
            b: [
              (v) => div(v.a! * Math.sin(v.t! * RAD), v.s!),
              '{a} ÷ {s} × sin({t})',
              'Solve Snell’s law for n₂.',
            ],
            a: [
              (v) => div(v.b! * v.s!, Math.sin(v.t! * RAD)),
              '{b} × {s}/sin({t})',
              'Solve Snell’s law for n₁.',
            ],
          },
        ),
        rule('θ₂ = arcsin(s)', '{r} = arcsin({s})', (v) => Math.sin(v.r! * RAD) - v.s!, {
          r: [
            (v) => (v.s! > 1 ? undefined : Math.asin(v.s!) / RAD),
            'arcsin({s})',
            'The angle whose sine it is.',
          ],
          s: [(v) => Math.sin(v.r! * RAD), 'sin({r})', 'The sine of the angle out.'],
        }),
        rule('v₂ = c/n₂', '{w} = 3 × 10⁸/{b}', (v) => v.w! * v.b! - 3e8, {
          w: [
            (v) => div(3e8, v.b!),
            '3 × 10⁸/{b}',
            'Light is n times slower in a medium than in a vacuum: c over n.',
          ],
          b: [(v) => div(3e8, v.w!), '3 × 10⁸/{w}', 'The index is c over the speed.'],
        }),
      ),
      example: { a, b, t, s, r: Math.asin(s) / RAD, w: 3e8 / b },
      startWith: ['a', 'b', 't'],
      pictureLabels: ['s', 'w'],
      representation: {
        kind: 'rayDiagram',
        mode: 'refraction',
        n1: 'a',
        n2: 'b',
        angle: 't',
        refracted: 'r',
        media: ['air', 'water'],
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [a, b, t] = [1.5, 1, 50];
    return {
      id: 's.11.optics~critical',
      title: 'The critical angle',
      use: 'Use this for “What is the critical angle from glass (n = 1.50) into air? Does light hitting the surface at 50° get out?”',
      unitSystems: ['metric'],
      assumptions: [
        'Going into a faster medium (smaller n) the ray bends away from the normal.',
        'At the critical angle θc the ray skims the surface: sin θc = n₂/n₁.',
        'Past it sin θ₂ would be more than 1: all the light reflects. Optical fibers work this way.',
      ],
      variables: [
        q('a', 'n₁', 'Index of the first medium', undefined, 1.01, 2.42, 0.01),
        q('b', 'n₂', 'Index of the second medium', undefined, 1, 2.42, 0.01),
        q('t', 'θ₁', 'Angle in', '°', 0, 89, 1),
        q('c', 'θc', 'Critical angle', '°', 0, 90, 0.01),
        q('s', 's', 'What sin θ₂ would be', undefined, 0, 5, 0.0001),
      ],
      ...rules(
        rule('sin θc = n₂/n₁', 'sin({c}) = {b}/{a}', (v) => Math.sin(v.c! * RAD) * v.a! - v.b!, {
          c: [
            (v) => (v.b! > v.a! ? undefined : Math.asin(v.b! / v.a!) / RAD),
            'arcsin({b}/{a})',
            'At the critical angle θ₂ = 90°: sin θc = n₂/n₁.',
          ],
          b: [(v) => v.a! * Math.sin(v.c! * RAD), '{a} × sin({c})', 'Undo sin θc = n₂/n₁ for n₂.'],
          a: [
            (v) => div(v.b!, Math.sin(v.c! * RAD)),
            '{b}/sin({c})',
            'Undo sin θc = n₂/n₁ for n₁.',
          ],
        }),
        rule(
          's = n₁ sin θ₁/n₂',
          '{s} = {a} ÷ {b} × sin({t})',
          (v) => v.s! * v.b! - v.a! * Math.sin(v.t! * RAD),
          {
            s: [
              (v) => div(v.a! * Math.sin(v.t! * RAD), v.b!),
              '{a} ÷ {b} × sin({t})',
              'Snell’s law solved for sin θ₂: more than 1 means no ray gets out.',
            ],
            t: [
              (v) => {
                const r = (v.b! * v.s!) / v.a!;
                return r > 1 ? undefined : Math.asin(r) / RAD;
              },
              'arcsin({b} × {s}/{a})',
              'Snell’s law solved for sin θ₁, then the angle with that sine.',
            ],
            b: [
              (v) => div(v.a! * Math.sin(v.t! * RAD), v.s!),
              '{a} ÷ {s} × sin({t})',
              'Solve Snell’s law for n₂.',
            ],
          },
        ),
      ),
      example: { a, b, t, c: Math.asin(b / a) / RAD, s: (a / b) * Math.sin(t * RAD) },
      startWith: ['a', 'b', 't'],
      pictureLabels: ['s'],
      representation: {
        kind: 'rayDiagram',
        mode: 'refraction',
        n1: 'a',
        n2: 'b',
        angle: 't',
        critical: 'c',
        media: ['glass', 'air'],
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [l, d, L] = [633, 0.25, 2];
    return {
      id: 's.11.optics~double-slit',
      title: 'Double-slit interference',
      use: 'Use this for “Laser light (633 nm) passes two slits 0.25 mm apart onto a screen 2 m away. How far apart are the bright fringes?”',
      assumptions: [
        'Each slit spreads the light out (diffraction); where the two overlap they interfere.',
        'Bright where the waves arrive in step, dark where they cancel.',
        'Bright fringes are Δy = λL/d apart, with the screen far away compared with d.',
      ],
      variables: [
        q('l', 'λ', 'Wavelength', 'nm', 100, 2000, 1),
        q('d', 'd', 'Slit spacing', 'mm', 0.01, 10, 0.01),
        q('L', 'L', 'Distance to the screen', 'm', 0.1, 20, 0.1),
        q('y', 'Δy', 'Fringe spacing', 'mm', 0.0001, 10000, 0.001),
      ],
      ...rules(
        withWork(
          rule(
            'Δy = λL/d',
            '{y} = {l} × 10⁻⁹ × {L}/({d} × 10⁻³) × 1000',
            (v) => v.y! * v.d! - (v.l! * v.L!) / 1000,
            {
              y: [
                (v) => div((v.l! * v.L!) / 1000, v.d!),
                '{l} × 10⁻⁹ × {L}/({d} × 10⁻³) × 1000',
                'λL/d in meters (1 nm = 10⁻⁹ m, 1 mm = 10⁻³ m), then × 1,000 for mm.',
              ],
              l: [
                (v) => div(1000 * v.y! * v.d!, v.L!),
                '1000 × {y} × {d}/{L}',
                'Undo Δy = λL/d for λ.',
              ],
              d: [
                (v) => div((v.l! * v.L!) / 1000, v.y!),
                '{l} × {L}/{y}/1000',
                'Undo Δy = λL/d for d.',
              ],
              L: [
                (v) => div(1000 * v.y! * v.d!, v.l!),
                '1000 × {y} × {d}/{l}',
                'Undo Δy = λL/d for L.',
              ],
            },
          ),
          'y',
          (v) => [
            `λ = ${sci(v.l!)} nm = ${sci(v.l! * 1e-9)} m`,
            `d = ${sci(v.d!)} mm = ${sci(v.d! * 1e-3)} m`,
            `Δy = ${sci(v.l! * 1e-9)} × ${sci(v.L!)}/(${sci(v.d! * 1e-3)}) = ${sci((v.l! * 1e-9 * v.L!) / (v.d! * 1e-3))} m`,
          ],
        ),
      ),
      example: { l, d, L, y: (l * L) / 1000 / d },
      startWith: ['l', 'd', 'L'],
      representation: {
        kind: 'rayDiagram',
        mode: 'doubleSlit',
        wavelength: 'l',
        spacing: 'd',
        screen: 'L',
        fringe: 'y',
      },
    } satisfies ModuleDef;
  })(),
];

// ─── s.11.thermodynamics ────────────────────────────────────────────────────

/** Water's specific heat, J/(kg·°C). */
const C_WATER = 4180;
const celsius = (id: string, symbol: string, name: string): VariableDef =>
  q(id, symbol, name, '°C', -50, 1000, 0.1);
/** A temperature of liquid water: nothing on the page freezes or boils. */
const waterCelsius = (id: string, symbol: string, name: string): VariableDef =>
  q(id, symbol, name, '°C', 0, 100, 0.1);
const kilograms = (id: string, symbol: string, name: string): VariableDef =>
  q(id, symbol, name, 'kg', 0.001, 1000, 0.001, { units: ['kg'] });
const specificHeat = (id: string, symbol: string, name: string): VariableDef =>
  q(id, symbol, name, 'J/(kg·°C)', 100, 5000, 1);
const TH = q('H', 'Tₕ', 'Hot reservoir temperature', 'K', 1, 5000, 1);
const TL = q('L', 'T_c', 'Cold reservoir temperature', 'K', 1, 5000, 1);
const WORK = q('W', 'W', 'Work', 'J', 0.1, 1e9, 0.1);

const thermoPages: ModuleDef[] = [
  (() => {
    const [w, a, m, c, b] = [0.25, 20, 0.15, 900, 90];
    const F = (w * C_WATER * a + m * c * b) / (w * C_WATER + m * c);
    return {
      id: 's.11.thermodynamics',
      unitSystems: ['metric'],
      assumptions: [
        'No heat leaves the cup: the heat the metal gives off is the heat the water takes in.',
        'Heat flows from hot to cold until both are at one temperature T_f (thermal equilibrium).',
        'Water’s specific heat is 4180 J/(kg·°C); aluminum 900, iron 450, copper 385.',
      ],
      variables: [
        { ...kilograms('w', 'm_w', 'Mass of water'), max: 10 },
        waterCelsius('a', 'T_w', 'Water’s starting temperature'),
        kilograms('m', 'mₘ', 'Mass of the metal'),
        specificHeat('c', 'cₘ', 'Specific heat of the metal'),
        celsius('b', 'Tₘ', 'Metal’s starting temperature'),
        waterCelsius('F', 'T_f', 'Final temperature'),
        q('q', 'q', 'Heat the water takes in', 'J', -1e9, 1e9, 0.1),
      ],
      ...withChecks(
        [
          apart(
            'b',
            'F',
            0.5,
            'The metal must start at least 0.5 °C from the final temperature, or too little heat moves to measure.',
          ),
          apart(
            'F',
            'a',
            0.1,
            'The water must warm or cool by at least 0.1 °C, or too little heat moves to measure.',
          ),
        ],
        rule(
          'm_w c_w (T_f − T_w) = mₘcₘ(Tₘ − T_f)',
          '{w} × 4180 × ({F} − {a}) = {m} × {c} × ({b} − {F})',
          (v) =>
            v.F! * (v.w! * C_WATER + v.m! * v.c!) - (v.w! * C_WATER * v.a! + v.m! * v.c! * v.b!),
          {
            F: [
              (v) => div(v.w! * C_WATER * v.a! + v.m! * v.c! * v.b!, v.w! * C_WATER + v.m! * v.c!),
              '({w} × 4180 × {a} + {m} × {c} × {b})/({w} × 4180 + {m} × {c})',
              'Set the heat the metal loses equal to the heat the water gains and solve for T_f.',
            ],
            w: null,
            a: null,
            m: null,
            c: null,
            b: null,
          },
        ),
        rule(
          'q = m_w c_w (T_f − T_w)',
          '{q} = {w} × 4180 × ({F} − {a})',
          (v) => v.q! - v.w! * C_WATER * (v.F! - v.a!),
          {
            q: [
              (v) => v.w! * C_WATER * (v.F! - v.a!),
              '{w} × 4180 × ({F} − {a})',
              'The water’s heat: its mass times 4180 J/(kg·°C) times how much it warmed.',
            ],
            w: [
              (v) => div(v.q!, C_WATER * (v.F! - v.a!)),
              '{q}/(4180 × ({F} − {a}))',
              'Divide the heat by c_w times the rise.',
            ],
            a: [
              (v) => v.F! - v.q! / (v.w! * C_WATER),
              '{F} − {q}/({w} × 4180)',
              'Take the water’s rise off the final temperature.',
            ],
            F: [
              (v) => v.a! + div(v.q!, v.w! * C_WATER)!,
              '{a} + {q}/({w} × 4180)',
              'Add the water’s rise to its starting temperature.',
            ],
          },
        ),
        rule(
          'q = mₘcₘ(Tₘ − T_f)',
          '{q} = {m} × {c} × ({b} − {F})',
          (v) => v.q! - v.m! * v.c! * (v.b! - v.F!),
          {
            q: [
              (v) => v.m! * v.c! * (v.b! - v.F!),
              '{m} × {c} × ({b} − {F})',
              'The metal’s heat: its mass times cₘ times how much it cooled.',
            ],
            F: [
              (v) => v.b! - div(v.q!, v.m! * v.c!)!,
              '{b} − {q}/({m} × {c})',
              'Take the metal’s drop off its starting temperature.',
            ],
            m: [
              (v) => div(v.q!, v.c! * (v.b! - v.F!)),
              '{q}/({c} × ({b} − {F}))',
              'The metal gave off the water’s heat: divide by cₘ times its drop.',
            ],
            c: [
              (v) => div(v.q!, v.m! * (v.b! - v.F!)),
              '{q}/({m} × ({b} − {F}))',
              'The metal gave off the water’s heat: divide by its mass times its drop.',
            ],
            b: [
              (v) => v.F! + div(v.q!, v.m! * v.c!)!,
              '{F} + {q}/({m} × {c})',
              'Add the metal’s drop to the final temperature.',
            ],
          },
        ),
      ),
      example: { w, a, m, c, b, F, q: w * C_WATER * (F - a) },
      startWith: ['w', 'a', 'm', 'c', 'b'],
      representation: {
        kind: 'energyProfile',
        mode: 'calorimeter',
        mass: 'w',
        heat: C_WATER,
        start: 'a',
        end: 'F',
        q: 'q',
        metal: { name: 'metal', mass: 'm', start: 'b', heat: 'c' },
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [m, c, a, b] = [2, 4180, 15, 65];
    return {
      id: 's.11.thermodynamics~specific-heat',
      title: 'Heat to warm something: Q = mcΔT',
      use: 'Use this for “How much heat warms 2 kg of water from 15 °C to 65 °C?”',
      unitSystems: ['metric'],
      assumptions: [
        'The specific heat c is the heat that warms 1 kg by 1 °C: water 4180 J/(kg·°C), aluminum 900, iron 450, copper 385.',
        'Nothing melts or boils between T₁ and T₂.',
        'A negative Q means heat was given off as it cooled.',
      ],
      variables: [
        kilograms('m', 'm', 'Mass'),
        specificHeat('c', 'c', 'Specific heat'),
        celsius('a', 'T₁', 'Starting temperature'),
        celsius('b', 'T₂', 'Final temperature'),
        q('d', 'ΔT', 'Change in temperature', '°C', -1000, 1000, 0.1),
        q('Q', 'Q', 'Heat', 'J', -1e10, 1e10, 0.1),
      ],
      ...rules(
        difference(
          'd',
          'b',
          'a',
          'ΔT = T₂ − T₁',
          'The change is the final temperature less the first.',
        ),
        rule('Q = mcΔT', '{Q} = {m} × {c} × {d}', (v) => v.Q! - v.m! * v.c! * v.d!, {
          Q: [
            (v) => v.m! * v.c! * v.d!,
            '{m} × {c} × {d}',
            'Heat is the mass times the specific heat times the change in temperature.',
          ],
          m: [(v) => div(v.Q!, v.c! * v.d!), '{Q}/({c} × {d})', 'Divide the heat by cΔT.'],
          c: [(v) => div(v.Q!, v.m! * v.d!), '{Q}/({m} × {d})', 'Divide the heat by mΔT.'],
          d: [(v) => div(v.Q!, v.m! * v.c!), '{Q}/({m} × {c})', 'Divide the heat by mc.'],
        }),
      ),
      example: { m, c, a, b, d: b - a, Q: m * c * (b - a) },
      startWith: ['m', 'c', 'a', 'b'],
      representation: {
        kind: 'energyProfile',
        mode: 'calorimeter',
        mass: 'm',
        heat: 'c',
        start: 'a',
        end: 'b',
        change: 'd',
        q: 'Q',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [m, P] = [0.5, 500];
    const f = m * 334;
    const qw = m * 418;
    const v = m * 2260;
    /** t = 1000Q ÷ P: the heat in kJ as joules, over the power. */
    const timeRule = (t: string, heat: string, sym: string, how: string): Rule =>
      withWork(
        rule(sym, `{${t}} = 1000 × {${heat}}/{P}`, (x) => x[t]! * x.P! - 1000 * x[heat]!, {
          [t]: [(x) => div(1000 * x[heat]!, x.P!), `1000 × {${heat}}/{P}`, how],
          [heat]: [
            (x) => (x[t]! * x.P!) / 1000,
            `{${t}} × {P}/1000`,
            'The power times the time, in kJ.',
          ],
          P: [
            (x) => div(1000 * x[heat]!, x[t]!),
            `1000 × {${heat}}/{${t}}`,
            'The heat in joules over the time.',
          ],
        }),
        t,
        (x) => [`${plain(x[heat]!)} kJ = ${plain(1000 * x[heat]!)} J`],
      );
    return {
      id: 's.11.thermodynamics~latent-heat',
      title: 'Melting and boiling: latent heat',
      use: 'Use this for “How much heat turns 0.5 kg of ice at 0 °C into steam at 100 °C, and how long does each stage take with a 500 W heater?”',
      unitSystems: ['metric'],
      assumptions: [
        'While ice melts or water boils the temperature stays put: the heat breaks bonds, Q = mL.',
        'Ice melts with L_f = 334 kJ/kg; water boils away with L_v = 2260 kJ/kg; warming water takes 4.18 kJ/(kg·°C).',
        'The heater gives P joules each second, all of it to the water: t = Q ÷ P.',
      ],
      variables: [
        kilograms('m', 'm', 'Mass of ice'),
        q('P', 'P', 'Heater power', 'W', 1, 1e6, 1),
        q('f', 'Q_f', 'Heat to melt it', 'kJ', 0, 1e7, 0.01),
        q('a', 't_f', 'Time to melt', 's', 0, 1e9, 0.01),
        q('q', 'Q_w', 'Heat to warm the water to 100 °C', 'kJ', 0, 1e7, 0.01),
        q('w', 't_w', 'Time to warm the water', 's', 0, 1e9, 0.01),
        q('v', 'Q_v', 'Heat to boil it away', 'kJ', 0, 1e8, 0.01),
        q('b', 't_v', 'Time to boil', 's', 0, 1e9, 0.01),
        q('Q', 'Q_total', 'Heat from ice to steam', 'kJ', 0, 1e8, 0.01),
      ],
      ...rules(
        product('f', 'm', 334, 'Q_f = mL_f', [
          'Each kilogram of ice takes 334 kJ to melt.',
          'Divide the heat by 334 kJ/kg.',
        ]),
        timeRule(
          'a',
          'f',
          't_f = Q_f ÷ P',
          'A watt is a joule each second: the heat in joules over the power.',
        ),
        rule('Q_w = m × 4.18 × 100', '{q} = {m} × 4.18 × 100', (x) => x.q! - x.m! * 418, {
          q: [
            (x) => x.m! * 418,
            '{m} × 4.18 × 100',
            'Warming the melted water from 0 °C to 100 °C: mcΔT with c = 4.18 kJ/(kg·°C).',
          ],
          m: [(x) => x.q! / 418, '{q}/(4.18 × 100)', 'Divide the heat by cΔT.'],
        }),
        timeRule('w', 'q', 't_w = Q_w ÷ P', 'The heat in joules over the power.'),
        product('v', 'm', 2260, 'Q_v = mL_v', [
          'Each kilogram of water takes 2260 kJ to boil away.',
          'Divide the heat by 2260 kJ/kg.',
        ]),
        timeRule(
          'b',
          'v',
          't_v = Q_v ÷ P',
          'The heat in joules over the power: boiling takes much longer than melting.',
        ),
        rule(
          'Q_total = Q_f + Q_w + Q_v',
          '{Q} = {f} + {q} + {v}',
          (x) => x.Q! - x.f! - x.q! - x.v!,
          {
            Q: [
              (x) => x.f! + x.q! + x.v!,
              '{f} + {q} + {v}',
              'Add the heat for each stage: melt, warm, boil.',
            ],
            f: [
              (x) => x.Q! - x.q! - x.v!,
              '{Q} − {q} − {v}',
              'Take the other two stages from the total.',
            ],
            q: [
              (x) => x.Q! - x.f! - x.v!,
              '{Q} − {f} − {v}',
              'Take the other two stages from the total.',
            ],
            v: [
              (x) => x.Q! - x.f! - x.q!,
              '{Q} − {f} − {q}',
              'Take the other two stages from the total.',
            ],
          },
        ),
      ),
      example: {
        m,
        P,
        f,
        a: (1000 * f) / P,
        q: qw,
        w: (1000 * qw) / P,
        v,
        b: (1000 * v) / P,
        Q: f + qw + v,
      },
      startWith: ['m', 'P'],
      representation: {
        kind: 'heatingCurve',
        start: 0,
        melt: 0,
        boil: 100,
        spans: [0, 'a', 'w', 'b'],
        units: { time: 's', temp: '°C' },
        formula: 'H2O',
      },
      pictureLabels: ['m', 'P', 'f', 'q', 'v', 'Q'],
    } satisfies ModuleDef;
  })(),
  {
    id: 's.11.thermodynamics~first-law',
    title: 'The first law of thermodynamics',
    use: 'Use this for “A gas takes in 500 J of heat and does 200 J of work pushing a piston out. How much does its internal energy change?”',
    unitSystems: ['metric'],
    assumptions: [
      'Energy is kept: the heat in goes to the gas’s internal energy or out as work. ΔU = Q − W.',
      'Q is + for heat into the gas and − for heat out of it.',
      'W is + when the gas does work by expanding and − when work is done on it (it is squeezed).',
    ],
    variables: [
      q('Q', 'Q', 'Heat into the gas', 'J', -1e9, 1e9, 0.01),
      q('W', 'W', 'Work done by the gas', 'J', -1e9, 1e9, 0.01),
      q('U', 'ΔU', 'Change in internal energy', 'J', -1e9, 1e9, 0.01),
    ],
    ...rules(
      rule('ΔU = Q − W', '{U} = {Q} − {W}', (x) => x.U! - (x.Q! - x.W!), {
        U: [(x) => x.Q! - x.W!, '{Q} − {W}', 'The heat in less the work out.'],
        Q: [
          (x) => x.U! + x.W!,
          '{U} + {W}',
          'The heat must cover the rise in internal energy and the work.',
        ],
        W: [
          (x) => x.Q! - x.U!,
          '{Q} − {U}',
          'What the heat did not keep in the gas went out as work.',
        ],
      }),
    ),
    example: { Q: 500, W: 200, U: 300 },
    startWith: ['Q', 'W'],
    representation: {
      kind: 'gasPiston',
      law: 'ideal',
      energy: { heat: 'Q', work: 'W', change: 'U' },
    },
  },
  (() => {
    const [Q, W, H, L] = [2000, 500, 600, 300];
    const e = (100 * W) / Q;
    const c = 100 * (1 - L / H);
    return {
      id: 's.11.thermodynamics~engine',
      title: 'A heat engine and the Carnot limit',
      use: 'Use this for “An engine takes in 2000 J from a 600 K source and does 500 J of work. How much heat goes to the 300 K sink, and how efficient is it compared with the most it could be?”',
      assumptions: [
        'First law: the heat taken in becomes work plus the heat given out, Qₕ = W + Q_c.',
        'Second law: some heat always goes to the cold reservoir.',
        'The best possible efficiency is the Carnot limit, 1 − T_c/Tₕ, with temperatures in kelvins.',
      ],
      variables: [
        q('Q', 'Qₕ', 'Heat in from the hot reservoir', 'J', 0.1, 1e9, 0.1),
        WORK,
        q('C', 'Q_c', 'Heat out to the cold reservoir', 'J', 0, 1e9, 0.1),
        q('e', 'e', 'Efficiency', '%', 0, 100, 0.1),
        TH,
        TL,
        q('c', 'e_C', 'Carnot limit', '%', 0.1, 100, 0.1),
        q('r', 'r', 'Share of the Carnot limit', '%', 0, 100, 0.1),
      ],
      ...rules(
        difference(
          'C',
          'Q',
          'W',
          'Q_c = Qₕ − W',
          'The heat not turned into work goes to the cold reservoir.',
        ),
        rule('e = W/Qₕ', '{e} = 100 × {W}/{Q}', (v) => v.e! * v.Q! - 100 * v.W!, {
          e: [
            (v) => div(100 * v.W!, v.Q!),
            '100 × {W}/{Q}',
            'The share of the heat that became work, as a percent.',
          ],
          W: [(v) => (v.e! * v.Q!) / 100, '{e}/100 × {Q}', 'The efficiency times the heat in.'],
          Q: [(v) => div(100 * v.W!, v.e!), '100 × {W}/{e}', 'The work over the efficiency.'],
        }),
        rule(
          'e_C = 1 − T_c/Tₕ',
          '{c} = 100 × (1 − {L}/{H})',
          (v) => v.c! - 100 * (1 - v.L! / v.H!),
          {
            c: [
              (v) => 100 * (1 - v.L! / v.H!),
              '100 × (1 − {L}/{H})',
              'No engine between these temperatures can beat 1 − T_c/Tₕ (in kelvins).',
            ],
            L: [
              (v) => v.H! * (1 - v.c! / 100),
              '{H} × (1 − {c}/100)',
              'Undo the Carnot formula for T_c.',
            ],
            H: [
              (v) => div(v.L!, 1 - v.c! / 100),
              '{L}/(1 − {c}/100)',
              'Undo the Carnot formula for Tₕ.',
            ],
          },
        ),
        rule('r = e/e_C', '{r} = 100 × {e}/{c}', (v) => v.r! * v.c! - 100 * v.e!, {
          r: [
            (v) => div(100 * v.e!, v.c!),
            '100 × {e}/{c}',
            'How close the engine comes to the best possible: e over the Carnot limit.',
          ],
          e: [(v) => (v.r! * v.c!) / 100, '{r}/100 × {c}', 'The share times the limit.'],
          c: [(v) => div(100 * v.e!, v.r!), '100 × {e}/{r}', 'The efficiency over the share.'],
        }),
      ),
      example: { Q, W, C: Q - W, e, H, L, c, r: (100 * e) / c },
      startWith: ['Q', 'W', 'H', 'L'],
      representation: {
        kind: 'heatEngine',
        hotHeat: 'Q',
        work: 'W',
        coldHeat: 'C',
        efficiency: 'e',
        hot: 'H',
        cold: 'L',
        carnot: 'c',
      },
      pictureLabels: ['r'],
    } satisfies ModuleDef;
  })(),
  (() => {
    const [C, W, H, L] = [900, 300, 300, 270];
    const k = C / W;
    const m = L / (H - L);
    return {
      id: 's.11.thermodynamics~refrigerator',
      title: 'A refrigerator',
      use: 'Use this for “A fridge removes 900 J from its 270 K inside using 300 J of work. How much heat reaches the 300 K kitchen, and what are its COP and the best possible COP?”',
      assumptions: [
        'Heat flows from hot to cold by itself; moving it the other way takes work.',
        'The kitchen gets the heat from inside plus the work: Qₕ = Q_c + W.',
        'COP = Q_c/W; the best possible (Carnot) COP is T_c/(Tₕ − T_c), in kelvins.',
      ],
      variables: [
        q('C', 'Q_c', 'Heat taken from inside', 'J', 0.1, 1e9, 0.1),
        WORK,
        q('Q', 'Qₕ', 'Heat given to the room', 'J', 0.1, 1e9, 0.1),
        q('k', 'COP', 'Coefficient of performance', undefined, 0.01, 100, 0.01),
        TH,
        TL,
        q('m', 'COP_C', 'Carnot COP', undefined, 0.01, 100, 0.01),
        q('r', 'r', 'Share of the Carnot COP', '%', 0, 100, 0.1),
      ],
      ...rules(
        rule('Qₕ = Q_c + W', '{Q} = {C} + {W}', (v) => v.Q! - v.C! - v.W!, {
          Q: [(v) => v.C! + v.W!, '{C} + {W}', 'The room gets the heat from inside plus the work.'],
          C: [(v) => v.Q! - v.W!, '{Q} − {W}', 'Take the work from the heat given out.'],
          W: [(v) => v.Q! - v.C!, '{Q} − {C}', 'The extra heat given out is the work put in.'],
        }),
        rule('COP = Q_c/W', '{k} = {C}/{W}', (v) => v.C! - v.k! * v.W!, {
          k: [(v) => div(v.C!, v.W!), '{C}/{W}', 'Divide the heat moved by the work.'],
          C: [(v) => v.k! * v.W!, '{k} × {W}', 'The heat moved is the COP times the work.'],
          W: [(v) => div(v.C!, v.k!), '{C}/{k}', 'Divide the heat moved by the COP.'],
        }),
        rule(
          'COP_C = T_c/(Tₕ − T_c)',
          '{m} = {L}/({H} − {L})',
          (v) => v.m! * (v.H! - v.L!) - v.L!,
          {
            m: [
              (v) => div(v.L!, v.H! - v.L!),
              '{L}/({H} − {L})',
              'The Carnot COP: the cold temperature over the difference, in kelvins.',
            ],
            H: [(v) => v.L! + div(v.L!, v.m!)!, '{L} + {L}/{m}', 'Undo the Carnot COP for Tₕ.'],
            L: [
              (v) => (v.m! * v.H!) / (1 + v.m!),
              '{m} × {H}/(1 + {m})',
              'Solve COP_C × (Tₕ − T_c) = T_c for T_c.',
            ],
          },
        ),
        rule('r = COP/COP_C', '{r} = 100 × {k}/{m}', (v) => v.r! * v.m! - 100 * v.k!, {
          r: [
            (v) => div(100 * v.k!, v.m!),
            '100 × {k}/{m}',
            'How close the fridge comes to the best possible.',
          ],
          k: [(v) => (v.r! * v.m!) / 100, '{r}/100 × {m}', 'The share times the Carnot COP.'],
          m: [(v) => div(100 * v.k!, v.r!), '100 × {k}/{r}', 'The COP over the share.'],
        }),
      ),
      example: { C, W, Q: C + W, k, H, L, m, r: (100 * k) / m },
      startWith: ['C', 'W', 'H', 'L'],
      representation: {
        kind: 'heatEngine',
        mode: 'refrigerator',
        coldHeat: 'C',
        work: 'W',
        hotHeat: 'Q',
        efficiency: 'k',
        hot: 'H',
        cold: 'L',
        carnot: 'm',
      },
      pictureLabels: ['r'],
    } satisfies ModuleDef;
  })(),
];

// ─── s.11.electrostatics ────────────────────────────────────────────────────

const charge = (id: string, symbol: string, name: string) =>
  q(id, symbol, name, 'μC', -1000, 1000, 0.01);

const electroPages: ModuleDef[] = [
  (() => {
    const [a, b, r] = [3, -5, 0.2];
    return {
      id: 's.11.electrostatics',
      unitSystems: ['metric'],
      assumptions: [
        'Point charges: each is small next to the distance r between them.',
        'Like charges repel (F > 0); unlike charges attract (F < 0). 1 μC = 10⁻⁶ C.',
        'F = kq₁q₂/r² with k = 8.99 × 10⁹ N·m²/C²: doubling r gives a quarter of the force.',
      ],
      variables: [
        charge('a', 'q₁', 'First charge'),
        charge('b', 'q₂', 'Second charge'),
        q('r', 'r', 'Distance apart', 'm', 0.001, 100, 0.001),
        q('F', 'F', 'Force', 'N', -1e10, 1e10, 0.0001),
      ],
      ...rules(
        withWork(
          rule(
            'F = kq₁q₂/r²',
            '{F} = 8.99 × 10⁹ × {a} × 10⁻⁶ × {b} × 10⁻⁶/({r}²)',
            (v) => v.F! * v.r! * v.r! - 8.99e-3 * v.a! * v.b!,
            {
              F: [
                (v) => div(8.99e-3 * v.a! * v.b!, v.r! * v.r!),
                '8.99 × 10⁹ × {a} × 10⁻⁶ × {b} × 10⁻⁶/({r}²)',
                'Coulomb’s law: k = 8.99 × 10⁹ N·m²/C² times the two charges in coulombs (1 μC = 10⁻⁶ C), over r².',
              ],
              r: [
                (v) => {
                  const x = div(8.99e-3 * v.a! * v.b!, v.F!);
                  return x === undefined || x < 0 ? undefined : Math.sqrt(x);
                },
                '√(8.99 × 10⁹ × {a} × 10⁻⁶ × {b} × 10⁻⁶/{F})',
                'Solve Coulomb’s law for r², then take the square root.',
              ],
              a: [
                (v) => div(v.F! * v.r! * v.r!, 8.99e-3 * v.b!),
                '{F} × {r}²/(8.99 × 10⁻³ × {b})',
                'Solve Coulomb’s law for q₁.',
              ],
              b: [
                (v) => div(v.F! * v.r! * v.r!, 8.99e-3 * v.a!),
                '{F} × {r}²/(8.99 × 10⁻³ × {a})',
                'Solve Coulomb’s law for q₂.',
              ],
            },
          ),
          'F',
          (v) => [
            `q₁ × q₂ = (${sci(v.a! * 1e-6)}) × (${sci(v.b! * 1e-6)}) = ${sci(v.a! * v.b! * 1e-12)} C²`,
            `r² = (${sci(v.r!)})² = ${sci(v.r! * v.r!)} m²`,
          ],
        ),
      ),
      example: { a, b, r, F: (8.99e-3 * a * b) / (r * r) },
      startWith: ['a', 'b', 'r'],
      representation: { kind: 'charges', charges: ['a', 'b'], distance: 'r', force: 'F' },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [a, r, t] = [2, 0.3, 1];
    const E = (8.99e3 * a) / (r * r);
    return {
      id: 's.11.electrostatics~field',
      title: 'The field of a point charge',
      use: 'Use this for “What is the electric field 0.30 m from a +2 μC charge, and the force on a 1 μC test charge there?”',
      unitSystems: ['metric'],
      assumptions: [
        'The field is the force on each coulomb of a small test charge: E = kq/r².',
        'It points away from a + charge and toward a − charge (E < 0 here).',
        'A test charge q₀ there feels F = q₀E; a negative q₀ is pushed against the field.',
      ],
      variables: [
        charge('a', 'q', 'Charge'),
        q('r', 'r', 'Distance', 'm', 0.001, 100, 0.001),
        q('E', 'E', 'Field', 'N/C', -1e13, 1e13, 1, { scientific: true }),
        charge('t', 'q₀', 'Test charge'),
        q('F', 'F', 'Force on the test charge', 'N', -1e10, 1e10, 0.0001),
      ],
      ...rules(
        withWork(
          rule(
            'E = kq/r²',
            '{E} = 8.99 × 10⁹ × {a} × 10⁻⁶/({r}²)',
            (v) => v.E! * v.r! * v.r! - 8.99e3 * v.a!,
            {
              E: [
                (v) => div(8.99e3 * v.a!, v.r! * v.r!),
                '8.99 × 10⁹ × {a} × 10⁻⁶/({r}²)',
                'k = 8.99 × 10⁹ N·m²/C² times the charge in coulombs, over r².',
              ],
              a: [
                (v) => (v.E! * v.r! * v.r!) / 8.99e3,
                '{E} × {r}²/(8.99 × 10³)',
                'Solve for the charge.',
              ],
              r: [
                (v) => {
                  const x = div(8.99e3 * v.a!, v.E!);
                  return x === undefined || x < 0 ? undefined : Math.sqrt(x);
                },
                '√(8.99 × 10⁹ × {a} × 10⁻⁶/{E})',
                'Solve for r², then take the square root.',
              ],
            },
          ),
          'E',
          (v) => [
            `q = ${sci(v.a!)} μC = ${sci(v.a! * 1e-6)} C`,
            `r² = (${sci(v.r!)})² = ${sci(v.r! * v.r!)} m²`,
          ],
        ),
        rule('F = q₀E', '{F} = {t} × 10⁻⁶ × {E}', (v) => v.F! - v.t! * 1e-6 * v.E!, {
          F: [
            (v) => v.t! * 1e-6 * v.E!,
            '{t} × 10⁻⁶ × {E}',
            'The field is newtons per coulomb: times the test charge in coulombs.',
          ],
          t: [(v) => div(v.F!, 1e-6 * v.E!), '{F}/({E} × 10⁻⁶)', 'Divide the force by the field.'],
          E: [
            (v) => div(v.F!, v.t! * 1e-6),
            '{F}/({t} × 10⁻⁶)',
            'The field is the force on each coulomb of test charge.',
          ],
        }),
      ),
      example: { a, r, E, t, F: t * 1e-6 * E },
      startWith: ['a', 'r', 't'],
      representation: { kind: 'charges', charges: ['a'], distance: 'r', field: 'E' },
      pictureLabels: ['t', 'F'],
    } satisfies ModuleDef;
  })(),
  (() => {
    const [a, b, r, x] = [4, -2, 0.5, 0.2];
    const E1 = (8.99e3 * a) / (x * x);
    const E2 = (-8.99e3 * b) / ((r - x) * (r - x));
    const between: Relation = {
      id: 'x < r',
      constraint: true,
      display: '{x} is less than {r}',
      vars: ['x', 'r'],
      residual: (v) => (v.x! < v.r! ? 0 : 1),
      solve: {},
      message: (v) =>
        v.x! < v.r! ? undefined : 'The point must lie between the charges: x is less than r.',
    };
    return {
      id: 's.11.electrostatics~two-charges',
      title: 'The field between two charges',
      use: 'Use this for “A +4 μC and a −2 μC charge are 0.5 m apart. What is the electric field 0.2 m from the +4 μC charge?”',
      unitSystems: ['metric'],
      assumptions: [
        'The point is on the line between the charges, x from q₁; + means toward q₂.',
        'Each charge’s field points away from it if it is + and toward it if it is −.',
        'The fields add: between unlike charges both point the same way; between like charges they partly cancel.',
        'k = 8.99 × 10⁹ N·m²/C², and 1 μC = 10⁻⁶ C.',
      ],
      variables: [
        charge('a', 'q₁', 'First charge'),
        charge('b', 'q₂', 'Second charge'),
        q('r', 'r', 'Distance between the charges', 'm', 0.001, 100, 0.001),
        q('x', 'x', 'Distance of the point from q₁', 'm', 0.0001, 100, 0.0001),
        q('c', 'E₁', 'Field from q₁ (+ toward q₂)', 'N/C', -1e15, 1e15, 0.01, {
          scientific: true,
        }),
        q('d', 'E₂', 'Field from q₂ (+ toward q₂)', 'N/C', -1e15, 1e15, 0.01, {
          scientific: true,
        }),
        q('E', 'E', 'Field at the point (+ toward q₂)', 'N/C', -1e15, 1e15, 0.01, {
          scientific: true,
        }),
      ],
      ...withChecks(
        [between],
        rule(
          'E₁ = kq₁/x²',
          '{c} = 8.99 × 10⁹ × {a} × 10⁻⁶/({x}²)',
          (v) => v.c! * v.x! * v.x! - 8.99e3 * v.a!,
          {
            c: [
              (v) => div(8.99e3 * v.a!, v.x! * v.x!),
              '8.99 × 10⁹ × {a} × 10⁻⁶/({x}²)',
              'q₁’s field points away from a + q₁, which is toward q₂, so it is + when q₁ is +.',
            ],
            a: [(v) => (v.c! * v.x! * v.x!) / 8.99e3, '{c} × {x}²/(8.99 × 10³)', 'Solve for q₁.'],
            x: null,
          },
        ),
        rule(
          'E₂ = −kq₂/(r − x)²',
          '{d} = −8.99 × 10⁹ × {b} × 10⁻⁶/(({r} − {x})²)',
          (v) => v.d! * (v.r! - v.x!) * (v.r! - v.x!) + 8.99e3 * v.b!,
          {
            d: [
              (v) => div(-8.99e3 * v.b!, (v.r! - v.x!) * (v.r! - v.x!)),
              '−8.99 × 10⁹ × {b} × 10⁻⁶/(({r} − {x})²)',
              'The point is r − x from q₂. A + q₂ pushes back toward q₁, so its field gets a minus sign.',
            ],
            b: [
              (v) => (-v.d! * (v.r! - v.x!) * (v.r! - v.x!)) / 8.99e3,
              '−{d} × ({r} − {x})²/(8.99 × 10³)',
              'Solve for q₂.',
            ],
            r: null,
            x: null,
          },
        ),
        rule('E = E₁ + E₂', '{E} = {c} + {d}', (v) => v.E! - v.c! - v.d!, {
          E: [(v) => v.c! + v.d!, '{c} + {d}', 'The two fields add as arrows along the line.'],
          c: [(v) => v.E! - v.d!, '{E} − {d}', 'The total less q₂’s part.'],
          d: [(v) => v.E! - v.c!, '{E} − {c}', 'The total less q₁’s part.'],
        }),
      ),
      example: { a, b, r, x, c: E1, d: E2, E: E1 + E2 },
      startWith: ['a', 'b', 'r', 'x'],
      representation: {
        kind: 'charges',
        charges: ['a', 'b'],
        distance: 'r',
        point: 'x',
        field: 'E',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [V, d, e] = [12, 0.003, -1.602e-19];
    return {
      id: 's.11.electrostatics~plates',
      title: 'The field between charged plates',
      use: 'Use this for “Two plates 3 mm apart have 12 V across them. What is the field between them, and the force on an electron there?”',
      unitSystems: ['metric'],
      assumptions: [
        'Between large parallel plates the field is uniform: E = V/d, from the + plate to the − plate.',
        'A charge there feels F = qE: a + charge along the field, a − charge against it.',
        'An electron’s charge is −1.602 × 10⁻¹⁹ C; a proton’s is +1.602 × 10⁻¹⁹ C.',
      ],
      variables: [
        q('V', 'V', 'Voltage across the plates', 'V', 0.001, 1e6, 0.001),
        q('d', 'd', 'Gap between the plates', 'm', 1e-6, 10, 1e-6, { scientific: true }),
        q('E', 'E', 'Field between the plates', 'V/m', 0, 1e12, 0.01, { scientific: true }),
        q('q', 'q', 'Charge', 'C', -1, 1, 1e-22, { scientific: true }),
        q('F', 'F', 'Force on the charge', 'N', -1e12, 1e12, 1e-22, {
          scientific: true,
          units: ['N'],
        }),
      ],
      ...rules(
        rule('E = V/d', '{E} = {V}/{d}', (x) => x.E! * x.d! - x.V!, {
          E: [(x) => div(x.V!, x.d!), '{V}/{d}', 'The voltage for each meter of the gap.'],
          V: [(x) => x.E! * x.d!, '{E} × {d}', 'The field times the gap.'],
          d: [(x) => div(x.V!, x.E!), '{V}/{E}', 'Divide the voltage by the field.'],
        }),
        rule('F = qE', '{F} = {q} × {E}', (x) => x.F! - x.q! * x.E!, {
          // A charge of 10⁻¹⁹ C is far below `div`'s zero.
          E: [
            (x) => (x.q === 0 ? undefined : x.F! / x.q!),
            '{F}/{q}',
            'The force for each coulomb of charge.',
          ],
          F: [(x) => x.q! * x.E!, '{q} × {E}', 'Charge times field; its sign gives the direction.'],
          q: [(x) => div(x.F!, x.E!), '{F}/{E}', 'Divide the force by the field.'],
        }),
      ),
      example: { V, d, E: V / d, q: e, F: (e * V) / d },
      startWith: ['V', 'd', 'q'],
      representation: {
        kind: 'charges',
        mode: 'plates',
        voltage: 'V',
        gap: 'd',
        field: 'E',
        charge: 'q',
        force: 'F',
      },
    } satisfies ModuleDef;
  })(),
];

// ─── s.11.electromagnetism ──────────────────────────────────────────────────

const inductionPages: ModuleDef[] = [
  (() => {
    const [N, f, t] = [50, 0.012, 0.2];
    return {
      id: 's.11.electromagnetism',
      unitSystems: ['metric'],
      assumptions: [
        'Only a changing magnetic flux through the coil induces an emf: a magnet held still makes none.',
        'Faraday’s law: emf = NΔΦ/Δt, so more turns or a faster change give a bigger emf.',
        'Lenz’s law: the current’s own field opposes the change, so pulling the magnet out swings the meter the other way.',
      ],
      variables: [
        q('N', 'N', 'Turns', undefined, 1, 10000, 1, { integer: true }),
        // Ranges as wide as each other in powers of ten, so any two values typed leave room
        // for the other two.
        q('f', 'ΔΦ', 'Change in flux', 'Wb', 0.0001, 1, 0.0001),
        q('t', 'Δt', 'Time', 's', 0.001, 10, 0.001),
        q('e', 'emf', 'Induced emf', 'V', 0.1, 1000, 0.0001),
      ],
      ...rules(
        rule('emf = NΔΦ/Δt', '{e} = {N} × {f}/{t}', (v) => v.e! * v.t! - v.N! * v.f!, {
          e: [
            (v) => div(v.N! * v.f!, v.t!),
            '{N} × {f}/{t}',
            'Each turn gets ΔΦ/Δt; N turns add up.',
          ],
          f: [(v) => div(v.e! * v.t!, v.N!), '{e} × {t}/{N}', 'Solve Faraday’s law for ΔΦ.'],
          t: [(v) => div(v.N! * v.f!, v.e!), '{N} × {f}/{e}', 'Solve Faraday’s law for Δt.'],
          N: [
            (v) => div(v.e! * v.t!, v.f!),
            '{e} × {t}/{f}',
            'Solve Faraday’s law for the number of turns.',
          ],
        }),
      ),
      example: { N, f, t, e: (N * f) / t },
      startWith: ['N', 'f', 't'],
      representation: {
        kind: 'induction',
        mode: 'coil',
        turns: 'N',
        flux: 'f',
        time: 't',
        emf: 'e',
        direction: 'in',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [N, b, c, A, t] = [200, 0.1, 0.5, 0.02, 0.1];
    const f = (c - b) * A;
    return {
      id: 's.11.electromagnetism~flux-change',
      title: 'Flux from a changing field',
      use: 'Use this for “A 200-turn coil of area 0.02 m² sits in a field that grows from 0.1 T to 0.5 T in 0.1 s. What emf is induced?”',
      unitSystems: ['metric'],
      assumptions: [
        'The field is square to the coil’s face, so the flux is Φ = BA.',
        'The area stays the same, so the flux changes by ΔΦ = (B₂ − B₁)A.',
        'The field grows here; a shrinking one gives the same size emf the other way (Lenz’s law).',
      ],
      variables: [
        q('N', 'N', 'Turns', undefined, 1, 10000, 1, { integer: true }),
        q('b', 'B₁', 'Field at the start', 'T', 0, 10, 0.0001),
        q('c', 'B₂', 'Field at the end', 'T', 0.001, 10, 0.0001),
        q('A', 'A', 'Area of the coil', 'm²', 0.0001, 10, 0.0001),
        q('f', 'ΔΦ', 'Change in flux', 'Wb', 0, 100, 0.0001, { derived: true }),
        q('t', 'Δt', 'Time', 's', 0.001, 10, 0.001),
        q('e', 'emf', 'Induced emf', 'V', 0, 1e10, 0.0001, { derived: true }),
      ],
      ...withChecks(
        [
          apart(
            'c',
            'b',
            0.001,
            'The field must change by at least 0.001 T: with no change in flux there is no emf.',
          ),
        ],
        rule('ΔΦ = (B₂ − B₁)A', '{f} = ({c} − {b}) × {A}', (v) => v.f! - (v.c! - v.b!) * v.A!, {
          f: [
            (v) => (v.c! - v.b!) * v.A!,
            '({c} − {b}) × {A}',
            'The change in the field times the area it passes through.',
          ],
          A: [
            (v) => div(v.f!, v.c! - v.b!),
            '{f}/({c} − {b})',
            'Divide the change in flux by the change in the field.',
          ],
          c: [
            (v) => div(v.f!, v.A!)! + v.b!,
            '{b} + {f}/{A}',
            'Add the change in the field to B₁.',
          ],
          b: [
            (v) => v.c! - div(v.f!, v.A!)!,
            '{c} − {f}/{A}',
            'Take the change in the field from B₂.',
          ],
        }),
        rule('emf = NΔΦ/Δt', '{e} = {N} × {f}/{t}', (v) => v.e! * v.t! - v.N! * v.f!, {
          e: [
            (v) => div(v.N! * v.f!, v.t!),
            '{N} × {f}/{t}',
            'Each turn gets ΔΦ/Δt; N turns add up.',
          ],
          f: [(v) => div(v.e! * v.t!, v.N!), '{e} × {t}/{N}', 'Solve Faraday’s law for ΔΦ.'],
          t: [(v) => div(v.N! * v.f!, v.e!), '{N} × {f}/{e}', 'Solve Faraday’s law for Δt.'],
          N: [
            (v) => div(v.e! * v.t!, v.f!),
            '{e} × {t}/{f}',
            'Solve Faraday’s law for the number of turns.',
          ],
        }),
      ),
      example: { N, b, c, A, f, t, e: (N * f) / t },
      startWith: ['N', 'b', 'c', 'A', 't'],
      representation: {
        kind: 'induction',
        mode: 'coil',
        turns: 'N',
        flux: 'f',
        time: 't',
        emf: 'e',
        direction: 'in',
      },
      pictureLabels: ['b', 'c', 'A'],
    } satisfies ModuleDef;
  })(),
  (() => {
    const [B, I, L, t] = [0.4, 5, 0.25, 90];
    return {
      id: 's.11.electromagnetism~force',
      title: 'The force on a current in a magnetic field',
      use: 'Use this for “A 0.25 m wire carrying 5 A crosses a 0.40 T field at 90°. What force acts on it? What if the angle is 30°?”',
      unitSystems: ['metric'],
      assumptions: [
        'A current in a magnetic field feels F = BIL sin θ, θ the angle between the wire and the field.',
        'The force is greatest at 90° and zero along the field; its direction comes from the right-hand rule.',
        'This push on a current is what turns an electric motor.',
      ],
      variables: [
        q('B', 'B', 'Magnetic field', 'T', 0.0001, 10, 0.0001),
        q('I', 'I', 'Current', 'A', 0.01, 1000, 0.01),
        q('L', 'L', 'Length in the field', 'm', 0.01, 100, 0.01),
        q('q', 'θ', 'Angle to the field', '°', 1, 179, 1),
        q('F', 'F', 'Force', 'N', 0, 1e6, 0.0001),
      ],
      ...rules(
        rule(
          'F = BIL sin θ',
          '{F} = {B} × {I} × {L} × sin({q})',
          (v) => v.F! - v.B! * v.I! * v.L! * Math.sin(v.q! * RAD),
          {
            F: [
              (v) => v.B! * v.I! * v.L! * Math.sin(v.q! * RAD),
              '{B} × {I} × {L} × sin({q})',
              'Multiply the field, current, length and sin θ.',
            ],
            B: [
              (v) => div(v.F!, v.I! * v.L! * Math.sin(v.q! * RAD)),
              '{F} ÷ (sin({q}) × {I} × {L})',
              'Divide the force by sin θ, the current and the length.',
            ],
            I: [
              (v) => div(v.F!, v.B! * v.L! * Math.sin(v.q! * RAD)),
              '{F} ÷ (sin({q}) × {B} × {L})',
              'Divide the force by sin θ, the field and the length.',
            ],
            L: [
              (v) => div(v.F!, v.B! * v.I! * Math.sin(v.q! * RAD)),
              '{F} ÷ (sin({q}) × {B} × {I})',
              'Divide the force by sin θ, the field and the current.',
            ],
            q: [
              (v) => {
                const r = div(v.F!, v.B! * v.I! * v.L!);
                return r === undefined || r > 1 ? undefined : Math.asin(r) / RAD;
              },
              'arcsin({F}/({B} × {I} × {L}))',
              'Divide F by BIL, then take arcsin (θ or 180° − θ).',
            ],
          },
        ),
      ),
      example: { B, I, L, q: t, F: B * I * L * Math.sin(t * RAD) },
      startWith: ['B', 'I', 'L', 'q'],
      representation: {
        kind: 'induction',
        mode: 'force',
        field: 'B',
        current: 'I',
        length: 'L',
        angle: 'q',
        force: 'F',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [a, v, B, t] = [5, 400, 0.3, 90];
    const sinOf = (x: Values) => Math.sin(x.t! * RAD);
    return {
      id: 's.11.electromagnetism~moving-charge',
      title: 'The force on a moving charge',
      use: 'Use this for “A 5 μC charge moves at 400 m/s across a 0.3 T field. What force acts on it? What if it moves at 30° to the field?”',
      unitSystems: ['metric'],
      assumptions: [
        'A charge moving through a magnetic field feels F = |q|vB sin θ, θ the angle between v and B.',
        'The force is square to both v and B (F = qv × B): a − charge is pushed the other way.',
        'A charge moving along the field feels no force.',
      ],
      variables: [
        q('a', 'q', 'Charge', 'μC', -1e4, 1e4, 0.001),
        q('v', 'v', 'Speed', 'm/s', 0.001, 1e8, 0.001, { units: ['m/s'] }),
        q('B', 'B', 'Magnetic field', 'T', 0.0001, 10, 0.0001),
        q('t', 'θ', 'Angle to the field', '°', 1, 179, 1),
        q('F', 'F', 'Force', 'N', 0, 1e6, 0.000001, { scientific: true }),
      ],
      ...rules(
        rule(
          'F = |q|vB sin θ',
          '{F} = |{a}| × 10⁻⁶ × {v} × {B} × sin({t})',
          (x) => x.F! - Math.abs(x.a!) * 1e-6 * x.v! * x.B! * sinOf(x),
          {
            F: [
              (x) => Math.abs(x.a!) * 1e-6 * x.v! * x.B! * sinOf(x),
              '|{a}| × 10⁻⁶ × {v} × {B} × sin({t})',
              'The charge in coulombs times the speed, the field and sin θ.',
            ],
            v: [
              (x) => div(x.F!, Math.abs(x.a!) * 1e-6 * x.B! * sinOf(x)),
              '{F} ÷ (|{a}| × 10⁻⁶ × {B} × sin({t}))',
              'Divide the force by the charge, the field and sin θ.',
            ],
            B: [
              (x) => div(x.F!, Math.abs(x.a!) * 1e-6 * x.v! * sinOf(x)),
              '{F} ÷ (|{a}| × 10⁻⁶ × {v} × sin({t}))',
              'Divide the force by the charge, the speed and sin θ.',
            ],
            a: null,
            t: null,
          },
        ),
      ),
      example: { a, v, B, t, F: a * 1e-6 * v * B * Math.sin(t * RAD) },
      startWith: ['a', 'v', 'B', 't'],
      representation: {
        kind: 'induction',
        mode: 'charge',
        charge: 'a',
        coulombs: 1e-6,
        speed: 'v',
        field: 'B',
        angle: 't',
        force: 'F',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [p, s, V, I] = [400, 20, 120, 0.1];
    return {
      id: 's.11.electromagnetism~transformer',
      title: 'A transformer',
      use: 'Use this for “A transformer steps 120 V down with 400 primary turns and 20 secondary turns. What voltage comes out, and what current if 0.1 A goes in?”',
      unitSystems: ['metric'],
      assumptions: [
        'An alternating current makes a changing flux in the iron core, which induces a voltage in the secondary coil.',
        'The voltage per turn is the same in both coils: Vₛ/Vₚ = Nₛ/Nₚ.',
        'An ideal transformer keeps the power, VₚIₚ = VₛIₛ: stepping the voltage down steps the current up.',
      ],
      variables: [
        q('p', 'Nₚ', 'Primary turns', undefined, 1, 100000, 1, { integer: true }),
        q('s', 'Nₛ', 'Secondary turns', undefined, 1, 100000, 1, { integer: true }),
        q('V', 'Vₚ', 'Primary voltage', 'V', 0.1, 1e6, 0.1),
        q('W', 'Vₛ', 'Secondary voltage', 'V', 0, 1e8, 0.001),
        q('I', 'Iₚ', 'Primary current', 'A', 0.001, 10000, 0.001),
        q('J', 'Iₛ', 'Secondary current', 'A', 0, 1e6, 0.0001),
      ],
      ...rules(
        rule('Vₛ = Vₚ Nₛ/Nₚ', '{W} = {V} × {s}/{p}', (v) => v.W! * v.p! - v.V! * v.s!, {
          W: [
            (v) => div(v.V! * v.s!, v.p!),
            '{V} × {s}/{p}',
            'The same voltage per turn: multiply by the turns ratio.',
          ],
          V: [(v) => div(v.W! * v.p!, v.s!), '{W} × {p}/{s}', 'Undo the turns ratio.'],
          s: [(v) => div(v.W! * v.p!, v.V!), '{W} × {p}/{V}', 'Solve for Nₛ.'],
        }),
        rule('Iₛ = Iₚ Nₚ/Nₛ', '{J} = {I} × {p}/{s}', (v) => v.J! * v.s! - v.I! * v.p!, {
          J: [
            (v) => div(v.I! * v.p!, v.s!),
            '{I} × {p}/{s}',
            'Power kept: the current changes the other way from the voltage.',
          ],
          I: [(v) => div(v.J! * v.s!, v.p!), '{J} × {s}/{p}', 'Undo the turns ratio.'],
        }),
      ),
      example: { p, s, V, W: (V * s) / p, I, J: (I * p) / s },
      startWith: ['p', 's', 'V', 'I'],
      representation: {
        kind: 'induction',
        mode: 'transformer',
        primary: 'p',
        secondary: 's',
        voltage: 'V',
        output: 'W',
        current: 'I',
        outputCurrent: 'J',
      },
    } satisfies ModuleDef;
  })(),
];

// ─── s.11.modern-physics ────────────────────────────────────────────────────

/** Hydrogen's photon between levels u and l (eV). */
const hydrogenEnergy = (u: number, l: number) => 13.6 * (1 / (l * l) - 1 / (u * u));

const modernPages: ModuleDef[] = [
  (() => {
    const l = 532;
    const f = 3e8 / (l * 1e-9);
    const E = 6.626e-34 * f;
    return {
      id: 's.11.modern-physics',
      assumptions: [
        'Light comes in photons, each with energy E = hf, h = 6.626 × 10⁻³⁴ J·s.',
        'A shorter wavelength means a higher frequency and more energy per photon; c = fλ = 3.00 × 10⁸ m/s.',
        'Brighter light has more photons, not more energetic ones. 1 eV = 1.602 × 10⁻¹⁹ J.',
      ],
      variables: [
        q('l', 'λ', 'Wavelength', 'nm', 0.01, 1e6, 0.01),
        q('f', 'f', 'Frequency', 'Hz', 3e11, 3e19, 1, { scientific: true }),
        q('E', 'E_J', 'Photon energy in joules', 'J', 1e-22, 2e-14, 1e-25, {
          scientific: true,
          derived: true,
        }),
        q('e', 'E', 'Photon energy', 'eV', 0.001, 130000, 0.0001),
      ],
      ...rules(
        withWork(
          rule('f = c/λ', '{f} = 3 × 10⁸/({l} × 10⁻⁹)', (v) => v.l! - 3e17 / v.f!, {
            f: [
              (v) => div(3e8, v.l! * 1e-9),
              '3 × 10⁸/({l} × 10⁻⁹)',
              'c = fλ: the speed of light over the wavelength in meters (1 nm = 10⁻⁹ m).',
            ],
            l: [
              (v) => div(3e8, v.f! * 1e-9),
              '3 × 10⁸/({f} × 10⁻⁹)',
              'The speed of light over the frequency, in nm.',
            ],
          }),
          'f',
          (v) => [`λ = ${sci(v.l!)} nm = ${sci(v.l! * 1e-9)} m`],
        ),
        // f and eV first in these two: the solver checks a relation by its first rearrangement,
        // and joules this small would pass any check.
        rule('E_J = hf', '{E} = 6.626 × 10⁻³⁴ × {f}', (v) => v.f! - v.E! / 6.626e-34, {
          f: [(v) => v.E! / 6.626e-34, '{E}/(6.626 × 10⁻³⁴)', 'The energy over Planck’s constant.'],
          E: [
            (v) => 6.626e-34 * v.f!,
            '6.626 × 10⁻³⁴ × {f}',
            'Planck’s constant times the frequency, in joules.',
          ],
        }),
        rule(
          'E = E_J/(1.602 × 10⁻¹⁹)',
          '{e} = {E}/(1.602 × 10⁻¹⁹)',
          (v) => v.e! - v.E! / 1.602e-19,
          {
            e: [
              (v) => v.E! / 1.602e-19,
              '{E}/(1.602 × 10⁻¹⁹)',
              'Each electronvolt is 1.602 × 10⁻¹⁹ J.',
            ],
            E: [
              (v) => v.e! * 1.602e-19,
              '{e} × 1.602 × 10⁻¹⁹',
              'Each electronvolt is 1.602 × 10⁻¹⁹ J.',
            ],
          },
        ),
      ),
      example: { l, f, E, e: E / 1.602e-19 },
      startWith: ['l'],
      representation: {
        kind: 'spectrum',
        wavelength: 'l',
        meters: 1e-9,
        photon: { frequency: 'f', energy: 'E', electronVolts: 'e' },
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [u, l] = [3, 2];
    const E = hydrogenEnergy(u, l);
    return {
      id: 's.11.modern-physics~hydrogen-lines',
      title: 'Hydrogen’s spectral lines',
      use: 'Use this for “An electron in hydrogen drops from n = 3 to n = 2. What are the photon’s energy and wavelength?”',
      assumptions: [
        'Hydrogen’s levels have energies Eₙ = −13.6/n² eV; the electron can only be on a level.',
        'A drop from the upper level to the lower one gives off one photon with the difference in energy.',
        'Drops to n = 1 are ultraviolet, to n = 2 visible, to n = 3 infrared. λ = 1240/E nm.',
      ],
      variables: [
        q('u', 'n_u', 'Upper level', undefined, 2, 8, 1, { integer: true }),
        q('l', 'n_l', 'Lower level', undefined, 1, 7, 1, { integer: true }),
        q('E', 'E', 'Photon energy', 'eV', 0.01, 13.6, 0.0001),
        q('w', 'λ', 'Wavelength', 'nm', 50, 20000, 0.1),
      ],
      ...withChecks(
        [
          {
            id: 'n_u > n_l',
            constraint: true,
            display: '{u} is more than {l}',
            vars: ['u', 'l'],
            residual: (v) => (v.u! > v.l! ? 0 : 1),
            solve: {},
            message: (v) =>
              v.u! > v.l!
                ? undefined
                : 'The electron drops from a higher level: n_u must be more than n_l.',
          },
        ],
        rule(
          'E = 13.6(1/n_l² − 1/n_u²)',
          '{E} = 13.6 × (1/{l}² − 1/{u}²)',
          (v) => v.E! - hydrogenEnergy(v.u!, v.l!),
          {
            E: [
              (v) => hydrogenEnergy(v.u!, v.l!),
              '13.6 × (1/{l}² − 1/{u}²)',
              'The photon carries the energy between the two levels.',
            ],
            u: [
              (v) => {
                const k = 1 / v.l! ** 2 - v.E! / 13.6;
                return k > 0 ? 1 / Math.sqrt(k) : undefined;
              },
              '1/√(1/{l}² − {E}/13.6)',
              'Solve the level formula for the upper level.',
            ],
            l: [
              (v) => 1 / Math.sqrt(v.E! / 13.6 + 1 / v.u! ** 2),
              '1/√({E}/13.6 + 1/{u}²)',
              'Solve the level formula for the lower level.',
            ],
          },
        ),
        rule('λ = 1240/E', '{w} = 1240/{E}', (v) => v.w! * v.E! - 1240, {
          w: [
            (v) => div(1240, v.E!),
            '1240/{E}',
            'hc = 1240 eV·nm, so the wavelength in nm is 1240 divided by the energy in eV.',
          ],
          E: [(v) => div(1240, v.w!), '1240/{w}', 'Divide 1240 eV·nm by the wavelength.'],
        }),
      ),
      example: { u, l, E, w: 1240 / E },
      startWith: ['u', 'l'],
      sliders: true,
      representation: {
        kind: 'orbitalDiagram',
        mode: 'ladder',
        upper: 'u',
        lower: 'l',
        energy: 'E',
        wavelength: 'w',
        levels: 8,
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [l, p] = [250, 2.3];
    return {
      id: 's.11.modern-physics~photoelectric',
      title: 'The photoelectric effect',
      use: 'Use this for “Light of 250 nm falls on a metal with a work function of 2.3 eV. What is the most kinetic energy an electron can leave with? What is the threshold wavelength?”',
      unitSystems: ['metric'],
      assumptions: [
        'Light comes in photons of E = hc/λ = 1240/λ eV, with λ in nm.',
        'One photon frees at most one electron; the work function φ is the least energy that takes.',
        'Below the threshold wavelength λ₀ = 1240/φ no electron leaves, however bright the light.',
      ],
      variables: [
        q('l', 'λ', 'Wavelength of the light', 'nm', 10, 2000, 0.1, { units: ['nm'] }),
        q('E', 'E', 'Photon energy', 'eV', 0.62, 124, 0.001),
        q('p', 'φ', 'Work function of the metal', 'eV', 0.5, 10, 0.01),
        q('K', 'Kₘₐₓ', 'Greatest kinetic energy of an electron', 'eV', 0, 124, 0.001),
        q('z', 'λ₀', 'Threshold wavelength', 'nm', 124, 2480, 0.1, { units: ['nm'] }),
      ],
      ...rules(
        rule('E = 1240/λ', '{E} = 1240/{l}', (x) => x.E! * x.l! - 1240, {
          E: [(x) => div(1240, x.l!), '1240/{l}', 'hc in eV·nm over the wavelength in nm.'],
          l: [(x) => div(1240, x.E!), '1240/{E}', 'The wavelength whose photons carry E.'],
        }),
        rule('Kₘₐₓ = E − φ', '{K} = {E} − {p}', (x) => x.K! - (x.E! - x.p!), {
          K: [
            (x) => x.E! - x.p!,
            '{E} − {p}',
            'What is left of the photon’s energy after freeing the electron.',
          ],
          E: [
            (x) => x.K! + x.p!,
            '{K} + {p}',
            'The photon paid the work function and the kinetic energy.',
          ],
          p: [
            (x) => x.E! - x.K!,
            '{E} − {K}',
            'The part of the photon’s energy that freed the electron.',
          ],
        }),
        rule('λ₀ = 1240/φ', '{z} = 1240/{p}', (x) => x.z! * x.p! - 1240, {
          z: [(x) => div(1240, x.p!), '1240/{p}', 'The wavelength whose photons carry just φ.'],
          p: [
            (x) => div(1240, x.z!),
            '1240/{z}',
            'A photon at the threshold carries just the work function.',
          ],
        }),
      ),
      example: { l, E: 1240 / l, p, K: 1240 / l - p, z: 1240 / p },
      startWith: ['l', 'p'],
      representation: {
        kind: 'photoelectric',
        wavelength: 'l',
        workFunction: 'p',
        energy: 'E',
        kinetic: 'K',
        threshold: 'z',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [b, s, L] = [0.6, 10, 100];
    const g = 1 / Math.sqrt(1 - b * b);
    return {
      id: 's.11.modern-physics~relativity',
      title: 'Moving clocks run slow',
      use: 'Use this for “A spaceship passes at 0.6c. A clock on board ticks 10 s. How long does that take as we see it? How long is the 100 m ship to us?”',
      unitSystems: ['metric'],
      assumptions: [
        'Light moves at c for every observer, however they move.',
        'γ = 1/√(1 − β²), with β = v/c. It is 1 at rest and grows without limit near c.',
        'Δt₀ and L₀ are measured beside the clock or rod; moving past us, Δt = γΔt₀ and L = L₀/γ.',
      ],
      variables: [
        q('b', 'β', 'Speed as a fraction of c', undefined, 0, 0.99, 0.001),
        q('g', 'γ', 'Lorentz factor', undefined, 1, 7.09, 0.0001),
        q('s', 'Δt₀', 'Time on the moving clock', 's', 0.001, 1e9, 0.001),
        q('t', 'Δt', 'Time as we measure it', 's', 0.001, 1e11, 0.001),
        q('L', 'L₀', 'Length at rest', 'm', 0.001, 1e9, 0.001),
        q('m', 'L', 'Length as we measure it moving', 'm', 0.0001, 1e9, 0.0001),
      ],
      ...rules(
        rule(
          'γ = 1/√(1 − β²)',
          '{g} = 1/√(1 − {b}²)',
          (x) => x.g! * Math.sqrt(Math.max(0, 1 - x.b! * x.b!)) - 1,
          {
            g: [
              (x) => (x.b! < 1 ? 1 / Math.sqrt(1 - x.b! * x.b!) : undefined),
              '1/√(1 − {b}²)',
              'The Lorentz factor for this speed.',
            ],
            b: [
              (x) => (x.g! >= 1 ? Math.sqrt(1 - 1 / (x.g! * x.g!)) : undefined),
              '√(1 − 1/({g}²))',
              'Undo γ: 1 − β² = 1/γ².',
            ],
          },
        ),
        rule('Δt = γΔt₀', '{t} = {g} × {s}', (x) => x.t! - x.g! * x.s!, {
          t: [(x) => x.g! * x.s!, '{g} × {s}', 'The moving clock’s tick, stretched by γ.'],
          s: [(x) => div(x.t!, x.g!), '{t}/{g}', 'The time on the moving clock itself.'],
          g: [(x) => div(x.t!, x.s!), '{t}/{s}', 'How many times longer we measure it.'],
        }),
        rule('L = L₀/γ', '{m} = {L}/{g}', (x) => x.m! * x.g! - x.L!, {
          m: [(x) => div(x.L!, x.g!), '{L}/{g}', 'Shorter along the motion by γ.'],
          L: [(x) => x.m! * x.g!, '{m} × {g}', 'The length at rest is γ times longer.'],
          g: [(x) => div(x.L!, x.m!), '{L}/{m}', 'How many times shorter it looks.'],
        }),
      ),
      example: { b, g, s, t: g * s, L, m: L / g },
      startWith: ['b', 's', 'L'],
      representation: {
        kind: 'lightClock',
        speed: 'b',
        gamma: 'g',
        proper: 's',
        dilated: 't',
        length: 'L',
        contracted: 'm',
      },
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
          '{V}/{R}',
          'Divide the voltage by the resistance: more resistance, less current.',
        ],
        R: [(v) => div(v.V!, v.I!), '{V}/{I}', 'Divide the voltage by the current.'],
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
        amps('I', 'I', 'Total current'),
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
          i: [
            (v) => v.I! - v.j! - v.k!,
            '{I} − {j} − {k}',
            'Take the other branches from the total.',
          ],
          j: [
            (v) => v.I! - v.i! - v.k!,
            '{I} − {i} − {k}',
            'Take the other branches from the total.',
          ],
          k: [
            (v) => v.I! - v.i! - v.j!,
            '{I} − {i} − {j}',
            'Take the other branches from the total.',
          ],
        }),
        withWork(
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
          'R',
          (v) => {
            const [x, y, z] = [1 / v.a!, 1 / v.b!, 1 / v.c!].map((n) => Number(n.toPrecision(4)));
            return [`1/R = ${x} + ${y} + ${z} = ${Number((x! + y! + z!).toPrecision(4))}`];
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
        { ...amps('I', 'I', 'Current'), min: 0.001 },
        resistor('R', 'R', 'Resistance'),
        q('P', 'P', 'Power', 'W', 0.001, 1e7, 0.01),
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

// ─── s.11.rotation ──────────────────────────────────────────────────────────

const TORQUE = q('t', 'τ', 'Torque', 'N·m', 0, 1e7, 0.001);

const rotationPages: ModuleDef[] = [
  (() => {
    // F⊥ = 80 sin 30° = 40 N and τ = 0.25 × 40 = 10 N·m, stored exactly (not 39.99999999999999).
    const [r, F, a] = [0.25, 80, 30];
    return {
      id: 's.11.rotation',
      unitSystems: ['metric'],
      assumptions: [
        'The lever arm r runs from the pivot to where the force pushes.',
        'Only the part of F at right angles to the arm turns it: all of F at 90°, none at 0°.',
        'The same force turns harder on a longer arm: τ = rF sin θ.',
      ],
      variables: [
        q('r', 'r', 'Lever arm', 'm', 0.001, 100, 0.001),
        q('F', 'F', 'Force', 'N', 0, 1e5, 0.01),
        q('a', 'θ', 'Angle between arm and force', '°', 0, 180, 1),
        q('p', 'F⊥', 'Force across the arm', 'N', 0, 1e5, 0.01),
        TORQUE,
      ],
      ...rules(
        componentOf(
          'p',
          'F',
          'a',
          'sin',
          'F⊥ = F sin θ',
          'The part of the force across the arm is F times sin θ.',
        ),
        product('t', 'r', 'p', 'τ = rF⊥', [
          'Torque is the lever arm times the force across it.',
          'Divide the torque by the force across the arm.',
          'Divide the torque by the lever arm.',
        ]),
      ),
      example: { r, F, a, p: 40, t: 10 },
      startWith: ['r', 'F', 'a'],
      representation: {
        kind: 'torque',
        arm: 'r',
        force: 'F',
        angle: 'a',
        across: 'p',
        torque: 't',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [W, l, F] = [300, 2, 400];
    return {
      id: 's.11.rotation~seesaw',
      title: 'Balancing a seesaw',
      use: 'Use this for “A 300 N child sits 2 m from the pivot. Where must a 400 N child sit to balance, and how hard does the pivot push up?”',
      unitSystems: ['metric'],
      assumptions: [
        'Balanced means no net torque and no net force: the two torques match, and the pivot holds up both weights.',
        'Each torque is a weight times its distance from the pivot.',
        'The plank is light and pivoted at its middle, so its own weight is left out.',
      ],
      variables: [
        q('W', 'F₁', 'First weight', 'N', 1, 1e5, 0.01),
        q('l', 'd₁', 'First distance', 'm', 0.01, 100, 0.01),
        q('F', 'F₂', 'Second weight', 'N', 1, 1e5, 0.01),
        // Wide, so a d₂ off the plank meets the check below (with its reason), not a silent clear.
        q('e', 'd₂', 'Second distance', 'm', 0.0000001, 1e7, 0.01),
        { ...TORQUE, name: 'Torque on each side' },
        q('P', 'F_p', 'Pivot force', 'N', 0, 2e5, 0.01),
      ],
      ...withChecks(
        [
          {
            id: 'd₂ from 0.01 to 100',
            constraint: true,
            display: '{e} is from 0.01 to 100',
            vars: ['e'],
            residual: (v) => (v.e! >= 0.01 - 1e-9 && v.e! <= 100 + 1e-9 ? 0 : 1),
            solve: {},
            message: (v) =>
              v.e! > 100 + 1e-9
                ? 'The second weight would sit past the end of any plank.'
                : v.e! < 0.01 - 1e-9
                  ? 'The second weight would sit almost on the pivot.'
                  : undefined,
          },
        ],
        product('t', 'W', 'l', 'τ = F₁d₁', [
          'The first child’s torque: weight times distance from the pivot.',
          'Divide the torque by the distance.',
          'Divide the torque by the weight.',
        ]),
        product('t', 'F', 'e', 'τ = F₂d₂', [
          'Balanced, the second torque equals the first.',
          'Divide the torque by the distance.',
          'Divide the torque by the weight: the heavier child sits closer.',
        ]),
        sum(
          'P',
          'W',
          'F',
          'F_p = F₁ + F₂',
          'No net force: the pivot pushes up as hard as both weights push down.',
        ),
      ),
      example: { W, l, F, e: (W * l) / F, t: W * l, P: W + F },
      startWith: ['W', 'l', 'F'],
      representation: {
        kind: 'simpleMachine',
        machine: 'lever',
        load: 'W',
        loadArm: 'l',
        effortArm: 'e',
        effort: 'F',
        seesaw: { torque: 't', pivot: 'P' },
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [d, r] = [135, 0.4];
    const t = d * RAD;
    return {
      id: 's.11.rotation~arc-length',
      title: 'Angle in radians and arc length',
      use: 'Use this for “A wheel of radius 0.4 m turns through 135°. What is that angle in radians, and how far does a point on its rim travel?”',
      unitSystems: ['metric'],
      assumptions: [
        'One radian is the angle whose arc is one radius long, so a full turn of 360° is 2π radians.',
        'To change degrees to radians, multiply by π/180.',
        'The arc length is s = rθ, with θ in radians: the radius times the angle.',
      ],
      variables: [
        q('d', 'θ°', 'Angle in degrees', '°', 0.1, 360, 1),
        q('t', 'θ', 'Angle in radians', 'rad', 0.001, 2 * Math.PI, 0.0001, { pi: 'fraction' }),
        q('r', 'r', 'Radius', 'm', 0.001, 100, 0.001),
        q('s', 's', 'Arc length', 'm', 0.000001, 1000, 0.0001),
      ],
      ...rules(
        rule('θ = θ° × π/180', '{t} = {d} × π/180', (v) => v.t! - v.d! * RAD, {
          t: [
            (v) => v.d! * RAD,
            '{d} × π/180',
            'Half a turn is 180°, or π radians: each degree is π/180 radians.',
          ],
          d: [(v) => v.t! / RAD, '{t} × 180/π', 'Each radian is 180/π degrees.'],
        }),
        product('s', 'r', 't', 's = rθ', [
          'Each radian of turn moves a point on the rim one radius along the circle.',
          'Divide the arc length by the angle in radians.',
          'Divide the arc length by the radius: how many radius lengths the arc is.',
        ]),
      ),
      example: { d, t, r, s: r * t },
      startWith: ['d', 'r'],
      representation: {
        kind: 'circle',
        radius: 'r',
        // The example's 0.4 m fills the picture (at 1 m its radius was 40 px).
        extent: 0.4,
        views: ['sector', 'radian'],
        sector: { angle: 't', unit: 'radians', arc: 's' },
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [r, N] = [0.3, 120];
    const w = (2 * Math.PI * N) / 60;
    return {
      id: 's.11.rotation~angular-speed',
      title: 'Angular speed and rim speed',
      use: 'Use this for “A wheel of radius 0.30 m turns at 120 rpm. What is its angular speed in rad/s, and how fast does its rim move?”',
      unitSystems: ['metric'],
      assumptions: [
        'One turn is 2π radians, so N turns a minute is 2πN/60 radians a second.',
        'Every point on the wheel has the same ω, but points farther out move faster: v = rω.',
        'The rim’s velocity is along the tangent; the angle must be in radians for v = rω.',
      ],
      variables: [
        q('r', 'r', 'Radius', 'm', 0.001, 100, 0.001),
        q('N', 'N', 'Turning rate', 'rpm', 0.01, 1e5, 0.01),
        q('w', 'ω', 'Angular speed', 'rad/s', 0.001, 1e4, 0.001),
        q('T', 'T', 'Period', 's', 0.0001, 1e5, 0.0001),
        // Wide, so a rim past 2,000 m/s meets the check below (with its reason), not a silent clear.
        q('v', 'v', 'Rim speed', 'm/s', 0, 1e6, 0.001),
      ],
      ...withChecks(
        [
          {
            id: 'v ≤ 2,000',
            constraint: true,
            display: '{v} is at most 2,000',
            vars: ['v'],
            residual: (v) => (v.v! <= 2000 + 1e-9 ? 0 : 1),
            solve: {},
            message: (v) =>
              v.v! <= 2000 + 1e-9
                ? undefined
                : 'No wheel holds together with its rim past 2,000 m/s.',
          },
        ],
        withWork(
          rule('ω = 2πN/60', '{w} = 2π × {N}/60', (v) => 60 * v.w! - 2 * Math.PI * v.N!, {
            w: [
              (v) => (2 * Math.PI * v.N!) / 60,
              '2π × {N}/60',
              'Each turn is 2π radians, and a minute is 60 seconds.',
            ],
            N: [
              (v) => (60 * v.w!) / (2 * Math.PI),
              '60 × {w}/(2π)',
              'Radians a second times 60, over 2π radians a turn.',
            ],
          }),
          'w',
          (v) => [`ω = ${sci(v.N! / 30)}π`],
        ),
        rule('T = 2π/ω', '{T} = 2π/{w}', (v) => v.T! * v.w! - 2 * Math.PI, {
          T: [
            (v) => div(2 * Math.PI, v.w!),
            '2π/{w}',
            'One turn, 2π radians, at ω radians a second.',
          ],
          w: [(v) => div(2 * Math.PI, v.T!), '2π/{T}', 'One turn, 2π radians, in one period.'],
        }),
        product('v', 'r', 'w', 'v = rω', [
          'Each radian turned moves the rim one radius along.',
          'Divide the rim speed by the angular speed.',
          'Divide the rim speed by the radius.',
        ]),
      ),
      example: { r, N, w, T: (2 * Math.PI) / w, v: r * w },
      startWith: ['r', 'N'],
      representation: { kind: 'rotor', radius: 'r', rpm: 'N', speed: 'w', period: 'T', rim: 'v' },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [u, a, t] = [3, 2, 4];
    const d = u * t + 0.5 * a * t * t;
    return {
      id: 's.11.rotation~angular-acceleration',
      title: 'A wheel speeding up',
      use: 'Use this for “A fan turning at 3 rad/s speeds up at 2 rad/s² for 4 s. How fast is it turning, and how many turns does it make?”',
      unitSystems: ['metric'],
      assumptions: [
        'The angular acceleration α is constant.',
        'These are the straight-line motion equations with θ, ω and α in place of x, v and a.',
        'The area under the ω–t line is the angle turned; one turn is 2π radians.',
      ],
      variables: [
        q('u', 'ω₀', 'Starting angular speed', 'rad/s', -1000, 1000, 0.01),
        q('a', 'α', 'Angular acceleration', 'rad/s²', -500, 500, 0.01),
        q('t', 't', 'Time', 's', 0.01, 600, 0.01),
        q('w', 'ω', 'Angular speed', 'rad/s', -1e5, 1e5, 0.01),
        q('d', 'Δθ', 'Angle turned', 'rad', -1e7, 1e7, 0.01),
        q('n', 'n', 'Net turns', undefined, -1e6, 1e6, 0.001),
      ],
      ...withChecks(
        [
          {
            id: 'ω₀ and ω have the same sign',
            constraint: true,
            display: '{u} and {w} have the same sign',
            vars: ['u', 'w'],
            residual: (v) => (v.u! * v.w! >= 0 ? 0 : 1),
            solve: {},
            message: (v) =>
              v.u! * v.w! >= 0
                ? undefined
                : 'The wheel turns back partway; this page counts turns in one direction only.',
          },
        ],
        rule('ω = ω₀ + αt', '{w} = {u} + {a} × {t}', (v) => v.w! - v.u! - v.a! * v.t!, {
          w: [
            (v) => v.u! + v.a! * v.t!,
            '{u} + {a} × {t}',
            'Start at ω₀ and add α for every second.',
          ],
          u: [(v) => v.w! - v.a! * v.t!, '{w} − {a} × {t}', 'Take off α for every second.'],
          a: [
            (v) => div(v.w! - v.u!, v.t!),
            '({w} − {u})/{t}',
            'The slope of the ω–t line: the change in angular speed over the time.',
          ],
          t: [
            (v) => div(v.w! - v.u!, v.a!),
            '({w} − {u})/{a}',
            'Divide the change in angular speed by the change each second.',
          ],
        }),
        rule(
          'Δθ = ω₀t + ½αt²',
          '{d} = {u} × {t} + ½ × {a} × {t}²',
          (v) => v.d! - v.u! * v.t! - 0.5 * v.a! * v.t! * v.t!,
          {
            d: [
              (v) => v.u! * v.t! + 0.5 * v.a! * v.t! * v.t!,
              '{u} × {t} + ½ × {a} × {t}²',
              'The angle at the starting speed, plus the extra the steady α adds.',
            ],
            u: [
              (v) => div(v.d! - 0.5 * v.a! * v.t! * v.t!, v.t!),
              '({d} − ½ × {a} × {t}²)/{t}',
              'Take off what α added, then divide by the time.',
            ],
            a: [
              (v) => div(2 * (v.d! - v.u! * v.t!), v.t! * v.t!),
              '2 × ({d} − {u} × {t})/({t}²)',
              'Take off the angle at ω₀, then undo ½t².',
            ],
            t: [
              (v) => {
                if (v.a! === 0) {
                  const t = div(v.d!, v.u!);
                  return t !== undefined && t > 0 ? t : undefined;
                }
                const D = v.u! * v.u! + 2 * v.a! * v.d!;
                if (D < 0) return undefined;
                const t = (-v.u! + Math.sqrt(D)) / v.a!;
                return t > 0 ? t : undefined;
              },
              '(−{u} + √({u}² + 2 × {a} × {d}))/{a}',
              'Solve the quadratic for the positive time.',
            ],
          },
        ),
        rule('n = Δθ/2π', '{n} = {d}/(2π)', (v) => 2 * Math.PI * v.n! - v.d!, {
          n: [(v) => v.d! / (2 * Math.PI), '{d}/(2π)', 'Each turn is 2π radians.'],
          d: [(v) => 2 * Math.PI * v.n!, '2π × {n}', 'Each turn is 2π radians.'],
        }),
      ),
      example: { u, a, t, w: u + a * t, d, n: d / (2 * Math.PI) },
      startWith: ['u', 'a', 't'],
      representation: {
        kind: 'rotor',
        start: 'u',
        acceleration: 'a',
        time: 't',
        speed: 'w',
        angle: 'd',
        turns: 'n',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [c, m, r, t] = [0.5, 2, 0.5, 3];
    const I = c * m * r * r;
    return {
      id: 's.11.rotation~rotational-inertia',
      title: 'Torque and rotational inertia',
      use: 'Use this for “A 3 N·m torque turns a 2 kg disk of radius 0.5 m. What is its angular acceleration? What if it were a hoop?”',
      unitSystems: ['metric'],
      assumptions: [
        'Rotational inertia I is how hard a body is to spin up: mass farther from the axis counts more.',
        'I = cmr² about the center: c = 1 for a hoop, ⅔ for a hollow ball, ½ for a solid disk, 0.4 for a solid ball.',
        'Newton’s second law for turning: τ = Iα, with α in rad/s².',
      ],
      variables: [
        // ⅔ for a hollow ball shows as 2/3 (and ½ as 1/2), never 0.6667.
        q('c', 'c', 'Shape factor', undefined, 0.4, 1, 0.0001, {
          allowed: [1, 2 / 3, 0.5, 0.4],
          fraction: 3,
        }),
        q('m', 'm', 'Mass', 'kg', 0.001, 1e5, 0.001),
        q('r', 'r', 'Radius', 'm', 0.001, 100, 0.001),
        q('I', 'I', 'Rotational inertia', 'kg·m²', 0.000001, 1e9, 0.0001),
        TORQUE,
        q('a', 'α', 'Angular acceleration', 'rad/s²', 0, 1e6, 0.001),
      ],
      ...rules(
        rule('I = cmr²', '{I} = {c} × {m} × {r}²', (v) => v.I! - v.c! * v.m! * v.r! * v.r!, {
          I: [
            (v) => v.c! * v.m! * v.r! * v.r!,
            '{c} × {m} × {r}²',
            'The shape factor times the mass times the radius squared.',
          ],
          m: [(v) => div(v.I!, v.c! * v.r! * v.r!), '{I}/({c} × {r}²)', 'Divide I by c × r².'],
          r: [
            (v) => {
              const x = div(v.I!, v.c! * v.m!);
              return x === undefined || x < 0 ? undefined : Math.sqrt(x);
            },
            '√({I}/({c} × {m}))',
            'Divide I by c × m, then take the square root.',
          ],
          c: [(v) => div(v.I!, v.m! * v.r! * v.r!), '{I}/({m} × {r}²)', 'Divide I by m × r².'],
        }),
        product('t', 'I', 'a', 'τ = Iα', [
          'The torque is the rotational inertia times the angular acceleration.',
          'Divide the torque by the angular acceleration.',
          'Divide the torque by the rotational inertia: a bigger I spins up more slowly.',
        ]),
      ),
      example: { c, m, r, I, t, a: t / I },
      startWith: ['c', 'm', 'r', 't'],
      representation: {
        kind: 'rotor',
        shape: 'c',
        mass: 'm',
        radius: 'r',
        inertia: 'I',
        torque: 't',
        acceleration: 'a',
        compare: true,
        hollow: true,
      },
    } satisfies ModuleDef;
  })(),
];

// ─── s.11.oscillations ──────────────────────────────────────────────────────

/** T = 2π√(a/b), each way: a spring's m over k, a pendulum's L over g. */
const periodRule = (sym: string, a: string, b: string, hows: [string, string, string]): Rule =>
  rule(
    sym,
    `{T} = 2π × √({${a}}/{${b}})`,
    (v) => (v[a]! / v[b]! >= 0 ? v.T! - 2 * Math.PI * Math.sqrt(v[a]! / v[b]!) : 1),
    {
      T: [
        (v) => {
          const x = div(v[a]!, v[b]!);
          return x === undefined || x < 0 ? undefined : 2 * Math.PI * Math.sqrt(x);
        },
        `2π × √({${a}}/{${b}})`,
        hows[0],
      ],
      [a]: [(v) => v[b]! * (v.T! / (2 * Math.PI)) ** 2, `{${b}} × ({T}/(2π))²`, hows[1]],
      [b]: [(v) => div(v[a]!, (v.T! / (2 * Math.PI)) ** 2), `{${a}}/(({T}/(2π))²)`, hows[2]],
    },
  );

/** A number for a work line to 4 significant figures, as the values show (2.236, 0.08163). */
const sci4 = (x: number) =>
  Math.abs(x) >= 0.001 && Math.abs(x) < 10000
    ? String(Number(x.toPrecision(4))).replace('-', '−')
    : scientific(Number(x.toPrecision(4)));

/** A square root in a work line: √5 for a plain number, √(2.5 × 10⁻⁵) for a longer one. */
const root = (x: string) => (/^[\d.]+$/.test(x) ? `√${x}` : `√(${x})`);

/**
 * `periodRule` with the square root worked out first on the step for T, and T ÷ 2π squared,
 * then the multiplication, on the step for `a` (the value under the root's top: m or L).
 */
const periodWithWork = (sym: string, a: string, b: string, hows: [string, string, string]) =>
  withWork(
    withWork(periodRule(sym, a, b, hows), 'T', (v) => {
      const x = v[a]! / v[b]!;
      const r = Math.sqrt(x);
      const k = 2 * r;
      // "= 0.1π" only for a short multiple of π; "4.4721π" reads worse than the number.
      const short = Math.abs(k * 100 - Math.round(k * 100)) < 1e-9;
      return [
        `${root(sci4(x))} = ${sci4(r)}`,
        `T = 2π × ${sci4(r)}${short ? ` = ${sci4(k)}π` : ''}`,
      ];
    }),
    a,
    (v) => {
      const h = v.T! / (2 * Math.PI);
      return [
        `T ÷ 2π = ${sci4(h)}`,
        `(${sci4(h)})² = ${sci4(h * h)}`,
        `${a} = ${sci4(v[b]!)} × ${sci4(h * h)}`,
      ];
    },
  );

/** f = 1/T. */
const frequencyRule = rule('f = 1/T', '{f} = 1/{T}', (v) => v.f! * v.T! - 1, {
  f: [(v) => div(1, v.T!), '1/{T}', 'The frequency is how many swings fit in one second.'],
  T: [(v) => div(1, v.f!), '1/{f}', 'The period is the time for one swing: 1 over f.'],
});

const PERIOD = q('T', 'T', 'Period', 's', 0.0001, 1e4, 0.0001);
const FREQUENCY = q('f', 'f', 'Frequency', 'Hz', 0.0001, 1e4, 0.0001);

const oscillationPages: ModuleDef[] = [
  (() => {
    const [m, k, A] = [0.5, 200, 0.1];
    const T = 2 * Math.PI * Math.sqrt(m / k);
    const w = (2 * Math.PI) / T;
    return {
      id: 's.11.oscillations',
      unitSystems: ['metric'],
      assumptions: [
        'The spring obeys Hooke’s law (F = −kx) and nothing rubs, so the swing never dies down.',
        'The period depends only on m and k: pulling it farther (a bigger A) doesn’t change T.',
        'It moves fastest through the middle and stops for an instant at each end.',
      ],
      variables: [
        q('m', 'm', 'Mass', 'kg', 0.001, 1000, 0.001),
        q('k', 'k', 'Spring constant', 'N/m', 0.1, 1e6, 0.1),
        PERIOD,
        FREQUENCY,
        q('w', 'ω', 'Angular frequency', 'rad/s', 0.001, 1e5, 0.001),
        q('A', 'A', 'Amplitude', 'm', 0.001, 10, 0.001),
        q('v', 'v_max', 'Top speed', 'm/s', 0, 1e5, 0.001),
        q('E', 'E', 'Energy', 'J', 0, 1e8, 0.0001),
      ],
      ...rules(
        periodWithWork('T = 2π√(m/k)', 'm', 'k', [
          'A heavier mass swings more slowly; a stiffer spring, faster.',
          'Undo the square root: square T ÷ 2π, then multiply by k.',
          'Undo the square root: square T ÷ 2π, then divide the mass by it.',
        ]),
        rule('ω = √(k/m)', '{w} = √({k}/{m})', (v) => v.w! * v.w! * v.m! - v.k!, {
          w: [
            (v) => (v.k! / v.m! >= 0 ? Math.sqrt(v.k! / v.m!) : undefined),
            '√({k}/{m})',
            'A stiffer spring or a lighter mass swings faster: the square root of k over m.',
          ],
          k: [(v) => v.w! * v.w! * v.m!, '{w}² × {m}', 'Square ω, then multiply by the mass.'],
          m: [(v) => div(v.k!, v.w! * v.w!), '{k}/({w}²)', 'Divide k by ω squared.'],
        }),
        frequencyRule,
        rule('ω = 2π/T', '{w} = 2π/{T}', (v) => v.w! * v.T! - 2 * Math.PI, {
          w: [
            (v) => div(2 * Math.PI, v.T!),
            '2π/{T}',
            'One full swing is 2π radians of the cycle, done in one period.',
          ],
          T: [(v) => div(2 * Math.PI, v.w!), '2π/{w}', 'Divide 2π by the angular frequency.'],
        }),
        product('v', 'A', 'w', 'v_max = Aω', [
          'Through the middle it moves fastest: the amplitude times ω.',
          'Divide the top speed by ω.',
          'Divide the top speed by the amplitude.',
        ]),
        rule('E = ½kA²', '{E} = ½ × {k} × {A}²', (v) => v.E! - 0.5 * v.k! * v.A! * v.A!, {
          E: [
            (v) => 0.5 * v.k! * v.A! * v.A!,
            '½ × {k} × {A}²',
            'At each end it is all spring energy, stretched by A.',
          ],
          k: [
            (v) => (v.A! > 0 ? (2 * v.E!) / (v.A! * v.A!) : undefined),
            '2 × {E}/{A}²',
            'Double the energy and divide by the amplitude squared.',
          ],
          A: [
            (v) => (v.E! >= 0 && v.k! > 0 ? Math.sqrt((2 * v.E!) / v.k!) : undefined),
            '√(2 × {E}/{k})',
            'Double the energy, divide by k, take the square root.',
          ],
        }),
      ),
      example: { m, k, T, f: 1 / T, w, A, v: A * w, E: 0.5 * k * A * A },
      startWith: ['m', 'k', 'A'],
      representation: {
        kind: 'oscillator',
        mass: 'm',
        spring: 'k',
        amplitude: 'A',
        period: 'T',
        frequency: 'f',
        angular: 'w',
        top: 'v',
        energy: 'E',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [m, x] = [2, 0.08];
    const F = m * G;
    const k = F / x;
    return {
      id: 's.11.oscillations~hooke',
      title: 'Hooke’s law: a spring’s stiffness',
      use: 'Use this for “A 2 kg mass hung on a spring stretches it 8 cm. What is k, and how much energy does the stretched spring store?”',
      unitSystems: ['metric'],
      assumptions: [
        'The spring pulls back in proportion to the stretch: F = kx, until it is overstretched.',
        'A hung mass at rest stretches it until the spring’s pull equals the weight mg.',
        'The stored energy is the area under the F–x line: ½kx².',
      ],
      variables: [
        q('m', 'm', 'Hung mass', 'kg', 0.001, 10000, 0.001),
        q('F', 'F', 'Force', 'N', 0, 1e6, 0.001),
        q('x', 'x', 'Stretch', 'm', 0.0001, 10, 0.0001),
        q('k', 'k', 'Spring constant', 'N/m', 0.1, 1e7, 0.1),
        q('U', 'U', 'Stored energy', 'J', 0, 1e8, 0.0001),
      ],
      ...rules(
        product('F', 'm', G, 'F = mg', [
          'At rest, the spring holds up the weight: 9.8 N for each kilogram.',
          'Divide the force by 9.8 N/kg.',
        ]),
        product('F', 'k', 'x', 'F = kx', [
          'Hooke’s law: k newtons for each meter of stretch.',
          'Divide the force by the stretch.',
          'Divide the force by the spring constant.',
        ]),
        rule('U = ½kx²', '{U} = ½ × {k} × {x}²', (v) => v.U! - 0.5 * v.k! * v.x! * v.x!, {
          U: [
            (v) => 0.5 * v.k! * v.x! * v.x!,
            '½ × {k} × {x}²',
            'The triangle under the F–x line: ½ × k × x², half the stretch times the force kx.',
          ],
          k: [
            (v) => (v.x! > 0 ? (2 * v.U!) / (v.x! * v.x!) : undefined),
            '2 × {U}/{x}²',
            'Double the energy and divide by the stretch squared.',
          ],
          x: [
            (v) => (v.U! >= 0 && v.k! > 0 ? Math.sqrt((2 * v.U!) / v.k!) : undefined),
            '√(2 × {U}/{k})',
            'Double the energy, divide by k, take the square root.',
          ],
        }),
      ),
      example: { m, F, x, k, U: 0.5 * k * x * x },
      startWith: ['m', 'x'],
      representation: {
        kind: 'oscillator',
        mode: 'hang',
        mass: 'm',
        stretch: 'x',
        spring: 'k',
        force: 'F',
        energy: 'U',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [L, g] = [0.8, 9.8];
    const T = 2 * Math.PI * Math.sqrt(L / g);
    return {
      id: 's.11.oscillations~pendulum',
      title: 'A simple pendulum',
      use: 'Use this for “How long is a pendulum that swings once every 2 s? What would its period be on the Moon?”',
      unitSystems: ['metric'],
      assumptions: [
        'Small swings, under about 15°: then the period doesn’t depend on how far it swings.',
        'The bob’s mass doesn’t change the period; only the length and gravity do.',
        'g is 9.8 m/s² on Earth and 1.62 m/s² on the Moon.',
      ],
      variables: [
        q('L', 'L', 'Length', 'm', 0.001, 1000, 0.001),
        q('g', 'g', 'Gravity', 'm/s²', 0.1, 30, 0.01),
        PERIOD,
        FREQUENCY,
      ],
      ...rules(
        periodWithWork('T = 2π√(L/g)', 'L', 'g', [
          'A longer string swings more slowly; stronger gravity, faster.',
          'Undo the square root: square T ÷ 2π, then multiply by g.',
          'Undo the square root: square T ÷ 2π, then divide the length by it.',
        ]),
        frequencyRule,
      ),
      example: { L, g, T, f: 1 / T },
      startWith: ['L', 'g'],
      representation: { kind: 'pendulum', length: 'L', gravity: 'g', period: 'T', frequency: 'f' },
    } satisfies ModuleDef;
  })(),
];

// ─── s.11.electric-potential ────────────────────────────────────────────────

/** The charge of one electron or proton, C (also the joules in 1 eV). */
const E_CHARGE = 1.602e-19;

/** `sci`, with a thousands separator from 1,000 to 9,999 (−1,000 μC). */
const sep = (x: number) =>
  Math.abs(x) >= 1000 && Math.abs(x) < 10000 ? plain(x).replace('-', '−') : sci(x);

/** The top speed K = ½mv² is used for: a tenth of light's, in m/s. */
const SLOW = 3e7;
const TOO_FAST = 'That is past a tenth of light’s speed, where K = ½mv² no longer works.';

/**
 * The v = √(2K/m) rule, saying why when the speed it gives is past SLOW: a speed past v's
 * range would otherwise leave no answer and clear a value without a reason.
 */
const withSlowLimit = (r: Rule): Rule => ({
  ...r,
  relation: {
    ...r.relation,
    message: (v) =>
      v.K !== undefined &&
      v.m !== undefined &&
      v.K >= 0 &&
      v.m > 0 &&
      Math.sqrt((2 * v.K * E_CHARGE) / v.m) > SLOW * (1 + 1e-9)
        ? TOO_FAST
        : undefined,
  },
});

const potentialPages: ModuleDef[] = [
  (() => {
    const [a, r, t] = [4, 0.5, 2];
    const V = (8.99e3 * a) / r;
    return {
      id: 's.11.electric-potential',
      unitSystems: ['metric'],
      assumptions: [
        'Potential V is energy per coulomb, counted from far away, where V = 0: V = kq/r.',
        'V takes the charge’s sign and has no direction, so potentials add as plain numbers.',
        'A second charge there has potential energy U = q₀V: like charges give U > 0, the work done to push them together.',
      ],
      variables: [
        charge('a', 'q', 'Charge'),
        q('r', 'r', 'Distance', 'm', 0.001, 100, 0.001),
        q('V', 'V', 'Potential', 'V', -1e13, 1e13, 0.01, { scientific: true }),
        charge('t', 'q₀', 'Second charge'),
        q('U', 'U', 'Potential energy', 'J', -1e10, 1e10, 0.0001),
      ],
      ...rules(
        withWork(
          rule(
            'V = kq/r',
            '{V} = 8.99 × 10⁹ × {a} × 10⁻⁶/{r}',
            (v) => v.V! * v.r! - 8.99e3 * v.a!,
            {
              V: [
                (v) => div(8.99e3 * v.a!, v.r!),
                '8.99 × 10⁹ × {a} × 10⁻⁶/{r}',
                'k = 8.99 × 10⁹ N·m²/C² times the charge in coulombs, over r (not r²).',
              ],
              a: [
                (v) => (v.V! * v.r!) / 8.99e3,
                '{V} × {r}/(8.99 × 10³)',
                'Multiply V by r and divide by k; dividing by 8.99 × 10³ rather than 8.99 × 10⁹ gives the charge in μC.',
              ],
              r: [
                (v) => {
                  const x = div(8.99e3 * v.a!, v.V!);
                  return x === undefined || x <= 0 ? undefined : x;
                },
                '8.99 × 10⁹ × {a} × 10⁻⁶/{V}',
                'Swap r and V: kq over the potential.',
              ],
            },
          ),
          'V',
          (v) => [`q = ${sep(v.a!)} μC = ${sci(v.a! * 1e-6)} C`],
        ),
        rule('U = q₀V', '{U} = {t} × 10⁻⁶ × {V}', (v) => v.U! - v.t! * 1e-6 * v.V!, {
          U: [
            (v) => v.t! * 1e-6 * v.V!,
            '{t} × 10⁻⁶ × {V}',
            'The potential is joules per coulomb: times the second charge in coulombs.',
          ],
          t: [
            (v) => div(v.U!, 1e-6 * v.V!),
            '{U}/({V} × 10⁻⁶)',
            'Divide the energy by the potential.',
          ],
          V: [
            (v) => div(v.U!, v.t! * 1e-6),
            '{U}/({t} × 10⁻⁶)',
            'The potential is the energy on each coulomb of the second charge.',
          ],
        }),
      ),
      example: { a, r, V, t, U: t * 1e-6 * V },
      startWith: ['a', 'r', 't'],
      representation: {
        kind: 'charges',
        charges: ['a'],
        distance: 'r',
        equipotentials: { potential: 'V', test: 't', energy: 'U' },
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [n, V, m] = [1, 100, 9.109e-31];
    return {
      id: 's.11.electric-potential~voltage-energy',
      title: 'Speeding a charge through a voltage',
      use: 'Use this for “An electron starts at rest and crosses a 100 V potential difference. How much energy does it gain, in eV and in joules, and how fast does it go?”',
      unitSystems: ['metric'],
      assumptions: [
        'It starts at rest and only the electric force does work on it: K = qΔV.',
        '1 eV is the energy one electron charge gains through 1 V: 1 eV = 1.602 × 10⁻¹⁹ J.',
        'Electron 9.109 × 10⁻³¹ kg, proton 1.673 × 10⁻²⁷ kg; speeds past a tenth of light’s need relativity.',
      ],
      variables: [
        q('q', 'q', 'Charge', 'e', 1, 10, 1, { integer: true }),
        q('V', 'ΔV', 'Potential difference', 'V', 0.001, 1e6, 0.001),
        q('K', 'K', 'Energy gained', 'eV', 0.001, 1e7, 0.001),
        q('m', 'm', 'Mass', 'kg', 9.109e-31, 1.673e-27, 1e-34, {
          scientific: true,
          allowed: [9.109e-31, 1.673e-27],
          // The two masses are listed in kg: in g or mg the list would be read in that unit.
          units: ['kg'],
        }),
        // Up to light's speed; past SLOW the check below (and the v rule's message, for a speed
        // past this range) says why. The typed particle stays: its mass is never searched.
        q('v', 'v', 'Speed', 'm/s', 0, 3e8, 1, { scientific: true, units: ['m/s'] }),
      ],
      ...withChecks(
        [
          {
            id: 'v ≤ 3 × 10⁷',
            constraint: true,
            display: '{v} is at most 3 × 10⁷',
            vars: ['v'],
            residual: (v) => (v.v! <= SLOW * (1 + 1e-9) ? 0 : 1),
            solve: {},
            message: (v) => (v.v! <= SLOW * (1 + 1e-9) ? undefined : TOO_FAST),
          },
        ],
        product('K', 'q', 'V', 'K = qΔV', [
          'Each electron charge gains 1 eV for every volt it crosses.',
          'Divide the energy by the potential difference.',
          'Divide the energy by the charge.',
        ]),
        withSlowLimit(
          withWork(
            withWork(
              rule(
                'v = √(2K/m)',
                `{v} = √(2 × {K} × 1.602 × 10⁻¹⁹/{m})`,
                (v) => (v.K! >= 0 && v.m! > 0 ? v.v! - Math.sqrt((2 * v.K! * E_CHARGE) / v.m!) : 1),
                {
                  v: [
                    (v) =>
                      v.K! >= 0 && v.m! > 0 ? Math.sqrt((2 * v.K! * E_CHARGE) / v.m!) : undefined,
                    '√(2 × {K} × 1.602 × 10⁻¹⁹/{m})',
                    'Change eV to joules, then solve K = ½mv² for v.',
                  ],
                  K: [
                    (v) => (v.m! * v.v! * v.v!) / (2 * E_CHARGE),
                    '{m} × {v}²/(2 × 1.602 × 10⁻¹⁹)',
                    'K = ½mv² in joules, then divide by 1.602 × 10⁻¹⁹ J for each eV.',
                  ],
                  m: null,
                },
              ),
              'v',
              (v) => [`K = ${sep(v.K!)} eV × 1.602 × 10⁻¹⁹ = ${sci(v.K! * E_CHARGE)} J`],
            ),
            'K',
            // The square in scientific form, never 35,174,388,640,000 written out.
            (v) => [
              `v² = (${sci4(v.v!)})² = ${sci4(v.v! * v.v!)}`,
              `K = ${sci4(v.m!)} × ${sci4(v.v! * v.v!)}/(3.204 × 10⁻¹⁹)`,
            ],
          ),
        ),
      ),
      example: {
        q: n,
        V,
        K: n * V,
        m,
        v: Math.sqrt((2 * n * V * E_CHARGE) / m),
      },
      startWith: ['V', 'q', 'm'],
      representation: {
        kind: 'charges',
        mode: 'plates',
        voltage: 'V',
        launch: { charge: 'q', mass: 'm', energy: 'K', speed: 'v' },
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [C, V] = [470, 9];
    return {
      id: 's.11.electric-potential~capacitor',
      title: 'Charge and energy on a capacitor',
      use: 'Use this for “A 470 μF capacitor is charged to 9 V. How much charge does it hold, and how much energy does it store?”',
      unitSystems: ['metric'],
      assumptions: [
        'Q is the charge on each plate, +Q on one and −Q on the other: Q = CV.',
        'The energy is stored in the field between the plates: U = ½CV², so twice the voltage stores four times the energy.',
        '1 μF = 10⁻⁶ F, so μF × V gives μC.',
      ],
      variables: [
        q('C', 'C', 'Capacitance', 'μF', 0.001, 1e6, 0.001),
        q('V', 'V', 'Voltage', 'V', 0.000001, 1e5, 0.000001),
        q('Q', 'Q', 'Charge', 'μC', 0, 1e11, 0.001),
        q('U', 'U', 'Stored energy', 'J', 0, 1e10, 0.000001),
      ],
      ...rules(
        product('Q', 'C', 'V', 'Q = CV', [
          'Each volt puts C more microcoulombs on each plate.',
          'Divide the charge by the voltage.',
          'Divide the charge by the capacitance.',
        ]),
        withWork(
          withWork(
            rule(
              'U = ½CV²',
              '{U} = ½ × {C} × 10⁻⁶ × {V}²',
              (v) => v.U! - 0.5e-6 * v.C! * v.V! * v.V!,
              {
                U: [
                  (v) => 0.5e-6 * v.C! * v.V! * v.V!,
                  '½ × {C} × 10⁻⁶ × {V}²',
                  'Half the capacitance in farads times the voltage squared.',
                ],
                C: [
                  (v) => div(v.U!, 0.5e-6 * v.V! * v.V!),
                  '2 × {U}/({V}² × 10⁻⁶)',
                  'Double the energy and divide by V², in microfarads.',
                ],
                V: [
                  (v) => (v.U! >= 0 && v.C! > 0 ? Math.sqrt(v.U! / (0.5e-6 * v.C!)) : undefined),
                  '√(2 × {U}/({C} × 10⁻⁶))',
                  'Double the energy, divide by C in farads, take the square root.',
                ],
              },
            ),
            'U',
            (v) => [`U = ½ × ${sci(v.C! * 1e-6)} × ${sep(v.V! * v.V!)}`],
          ),
          'C',
          (v) => [`C = ${sci(2 * v.U!)}/(${sci(v.V! * v.V! * 1e-6)})`],
        ),
      ),
      example: { C, V, Q: C * V, U: 0.5e-6 * C * V * V },
      startWith: ['C', 'V'],
      representation: {
        kind: 'capacitor',
        capacitance: 'C',
        voltage: 'V',
        charge: 'Q',
        energy: 'U',
        farads: 1e-6,
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [k, A, d, V] = [1, 0.01, 1, 12];
    const C = (8.85 * k * A) / (d * 1e-3);
    return {
      id: 's.11.electric-potential~parallel-plate',
      title: 'A parallel-plate capacitor',
      use: 'Use this for “Two 0.01 m² plates sit 1 mm apart in air. What is the capacitance, what charge does 12 V put on it, and how strong is the field?”',
      unitSystems: ['metric'],
      assumptions: [
        'The gap is small next to the plates, so the field between them is even: C = κε₀A/d.',
        'ε₀ = 8.85 × 10⁻¹² F/m, which is 8.85 pF/m; κ = 1 for air, and an insulator between the plates raises C κ times.',
        'Bigger plates or a smaller gap hold more charge at the same voltage.',
      ],
      variables: [
        q('k', 'κ', 'Dielectric constant', undefined, 1, 100, 0.1),
        q('A', 'A', 'Plate area', 'm²', 0.000001, 100, 0.000001, { units: ['m²'] }),
        q('d', 'd', 'Gap', 'mm', 0.001, 1000, 0.001, { units: ['mm'] }),
        q('C', 'C', 'Capacitance', 'pF', 0, 1e12, 0.001),
        q('V', 'V', 'Voltage', 'V', 0.001, 1e5, 0.001),
        q('Q', 'Q', 'Charge', 'pC', 0, 1e17, 0.001),
        q('E', 'E', 'Field between the plates', 'V/m', 0, 1e11, 0.001),
      ],
      ...rules(
        rule(
          'C = κε₀A/d',
          '{C} = {k} × 8.85 × {A}/({d} × 10⁻³)',
          (v) => v.C! * v.d! * 1e-3 - 8.85 * v.k! * v.A!,
          {
            C: [
              (v) => div(8.85 * v.k! * v.A!, v.d! * 1e-3),
              '{k} × 8.85 × {A}/({d} × 10⁻³)',
              'κ times ε₀ = 8.85 pF/m times the area, over the gap in meters.',
            ],
            A: [
              (v) => (v.C! * v.d! * 1e-3) / (8.85 * v.k!),
              '{C} × {d} × 10⁻³/(8.85 × {k})',
              'Solve for the area: C times the gap, over κε₀.',
            ],
            d: [
              (v) => div(8.85 * v.k! * v.A!, v.C! * 1e-3),
              '{k} × 8.85 × {A}/({C} × 10⁻³)',
              'Swap d and C: κε₀A over the capacitance, in millimeters.',
            ],
            k: [
              (v) => (v.C! * v.d! * 1e-3) / (8.85 * v.A!),
              '{C} × {d} × 10⁻³/(8.85 × {A})',
              'How many times the air value the capacitance is.',
            ],
          },
        ),
        product('Q', 'C', 'V', 'Q = CV', [
          'Each volt puts C more picocoulombs on each plate.',
          'Divide the charge by the voltage.',
          'Divide the charge by the capacitance.',
        ]),
        rule('E = ΔV/d', '{E} = {V}/({d} × 10⁻³)', (v) => v.E! * v.d! * 1e-3 - v.V!, {
          E: [
            (v) => div(v.V!, v.d! * 1e-3),
            '{V}/({d} × 10⁻³)',
            'The field is even between the plates: the voltage over the gap in meters.',
          ],
          V: [(v) => v.E! * v.d! * 1e-3, '{E} × {d} × 10⁻³', 'The field times the gap in meters.'],
          d: [
            (v) => div(v.V!, v.E! * 1e-3),
            '{V}/({E} × 10⁻³)',
            'The voltage over the field, in millimeters.',
          ],
        }),
      ),
      example: { k, A, d, C, V, Q: C * V, E: V / (d * 1e-3) },
      startWith: ['k', 'A', 'd', 'V'],
      representation: {
        kind: 'capacitor',
        dielectric: 'k',
        area: 'A',
        gap: 'd',
        meters: 1e-3,
        capacitance: 'C',
        voltage: 'V',
        charge: 'Q',
        farads: 1e-12,
      },
      // The capacitor draws the even field but not its value.
      pictureLabels: ['E'],
    } satisfies ModuleDef;
  })(),
];

export const SCIENCE_11_MODULES: ModuleDef[] = [
  ...kinematicsPages,
  ...projectilePages,
  ...dynamicsPages,
  ...circularPages,
  ...rotationPages,
  ...momentumPages,
  ...energyPages,
  ...oscillationPages,
  ...thermoPages,
  ...soundPages,
  ...opticsPages,
  ...electroPages,
  ...potentialPages,
  ...circuitPages,
  ...inductionPages,
  ...modernPages,
];
