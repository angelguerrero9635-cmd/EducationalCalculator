/**
 * Grades 9–12 round 2 gallery demos (group H2C: physics (H102); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in. Spread into
 * gallery.ts.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import { atLeast } from './helpers';
import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

// ─── Helpers (the Grade 11 file's, kept here so a demo promotes as it is) ────

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
 * text: `[solve, expr, how]`. A variable given `undefined` is solved numerically, with no step;
 * one given `null` is never worked out from this rule.
 */
const rule = (
  id: string,
  display: string,
  residual: (v: Values) => number,
  parts: Record<string, [Solve, string, string] | undefined | null>,
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

// ─── H102.2 impulse: the force–time rectangle, and a slower stop ─────────────

const impulse: ModuleDef = (() => {
  const [m, u, v, t] = [0.2, 25, -15, 0.05];
  const P = m * (v - u);
  return {
    id: 'g.s11-momentum-impulse',
    title: 'Impulse: force × time = change in momentum',
    use: 'Use this for “A 0.2 kg ball at 25 m/s is stopped by a glove in 0.05 s. What average force acts on it? Why does pulling the glove back help?”',
    unitSystems: ['metric'],
    assumptions: [
      '+ is the way the object first moves; a force against it is negative.',
      'F is the average force over the time Δt.',
      'The dashed rectangle is the same change in momentum spread over 0.2 s.',
    ],
    variables: [
      q('m', 'm', 'Mass', 'kg', 0.001, 1e5, 0.001),
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
  };
})();

// ─── H102.3 circularMotion `satellite`: v = √(GM/r), T = 2πr/v ──────────────

const GRAV = 6.674e-11;

const orbit: ModuleDef = (() => {
  const [M, r] = [5.97e24, 7.0e6];
  const v = Math.sqrt((GRAV * M) / r);
  return {
    id: 'g.s11-circular-gravitation-orbit',
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
        (x) => (x.v! * x.v! * x.r!) / (GRAV * x.M!) - 1,
        {
          v: [
            (x) => Math.sqrt(Math.max(0, div(GRAV * x.M!, x.r!) ?? 0)),
            '√(6.674 × 10⁻¹¹ × {M}/{r})',
            'G times the central mass, over r, then the square root.',
          ],
          r: [
            (x) => div(GRAV * x.M!, x.v! * x.v!),
            '6.674 × 10⁻¹¹ × {M}/({v}²)',
            'Square both sides: r = GM/v².',
          ],
          M: [
            (x) => div(x.v! * x.v! * x.r!, GRAV),
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
  };
})();

// ─── H102.4 motionGraph `strobe: 'vertical'`: a dropped stone ────────────────

const G_EARTH = 9.8;

const freeFall: ModuleDef = (() => {
  const t = 3;
  return {
    id: 'g.s11-kinematics-1d-free-fall-vertical',
    title: 'Free fall, the strobe stood up',
    use: 'Use this for “A stone falls from rest for 3 s. How far does it fall, and how fast is it going?”',
    unitSystems: ['metric'],
    assumptions: [
      'Dropped from rest, so it starts at v₀ = 0.',
      'Air resistance is ignored: every object falls with a = −9.8 m/s², whatever its mass.',
      'Up is +, so the velocity is negative on the way down; the drop d is how far it fell.',
    ],
    variables: [
      q('a', 'a', 'Acceleration of gravity', 'm/s²', -50, 50, 0.1, { derived: true }),
      q('t', 't', 'Time', 's', 0.01, 30, 0.01),
      q('v', 'v', 'Velocity (− is down)', 'm/s', -300, 0, 0.01, { derived: true }),
      q('d', 'd', 'Drop', 'm', 0, 5000, 0.01),
    ],
    ...rules(
      rule('a = −9.8', '{a} = −9.8', (x) => x.a! + G_EARTH, {
        a: [
          (x) => -G_EARTH + 0 * (x.a ?? 0),
          '−9.8',
          'Near Earth’s surface gravity speeds a falling object up by 9.8 m/s each second, downward.',
        ],
      }),
      rule('v = at', '{v} = {a} × {t}', (x) => x.v! - x.a! * x.t!, {
        v: [
          (x) => x.a! * x.t!,
          '{a} × {t}',
          'From rest, the velocity is the acceleration times the time.',
        ],
      }),
      rule('d = ½gt²', '{d} = ½ × 9.8 × {t}²', (x) => x.d! - 0.5 * G_EARTH * x.t! * x.t!, {
        d: [
          (x) => 0.5 * G_EARTH * x.t! * x.t!,
          '½ × 9.8 × {t}²',
          'From rest the drop is ½gt²: it grows with the square of the time.',
        ],
        t: [
          (x) => (x.d! >= 0 ? Math.sqrt((2 * x.d!) / G_EARTH) : undefined),
          '√(2 × {d}/9.8)',
          'Undo ½gt²: double the drop, divide by g, take the square root.',
        ],
      }),
    ),
    example: { a: -G_EARTH, t, v: -G_EARTH * t, d: 0.5 * G_EARTH * t * t },
    startWith: ['t'],
    representation: {
      kind: 'motionGraph',
      graph: 'speed',
      time: 't',
      acceleration: 'a',
      speed: 'v',
      start: 0,
      kinematics: { view: 'velocity', strobe: 'vertical' },
    },
    pictureLabels: ['d'],
  };
})();

// ─── H102.6 freeBody `displacement`: work W = Fd cos θ ──────────────────────

const RAD = Math.PI / 180;

const work: ModuleDef = (() => {
  const [m, F, q0, d] = [5, 40, 30, 15];
  const Wg = m * G_EARTH;
  return {
    id: 'g.s11-work-energy-power-work',
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
      rule('F_g = mg', '{G} = {m} × 9.8', (x) => x.G! - x.m! * G_EARTH, {
        G: [(x) => x.m! * G_EARTH, '{m} × 9.8', 'The weight is the mass times g.'],
        m: [(x) => x.G! / G_EARTH, '{G}/9.8', 'Divide the weight by g.'],
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
      G: Wg,
      N: Wg - F * Math.sin(q0 * RAD),
      F,
      q: q0,
      d,
      W: F * d * Math.cos(q0 * RAD),
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
  };
})();

// ─── H102.7 powerLift: work and power, a stopwatch and J/s ──────────────────

const power: ModuleDef = (() => {
  const [m, h, t] = [60, 4.5, 6];
  const W = m * G_EARTH * h;
  return {
    id: 'g.s11-work-energy-power-power',
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
      rule('W = mgh', '{W} = {m} × 9.8 × {h}', (x) => x.W! - x.m! * G_EARTH * x.h!, {
        W: [
          (x) => x.m! * G_EARTH * x.h!,
          '{m} × 9.8 × {h}',
          'The weight, mg, times the height raised.',
        ],
        m: [(x) => div(x.W!, G_EARTH * x.h!), '{W}/(9.8 × {h})', 'Divide the work by gh.'],
        h: [(x) => div(x.W!, x.m! * G_EARTH), '{W}/({m} × 9.8)', 'Divide the work by the weight.'],
      }),
      rule('P = W/t', '{P} = {W}/{t}', (x) => x.P! * x.t! - x.W!, {
        P: [(x) => div(x.W!, x.t!), '{W}/{t}', 'The joules for each second.'],
        W: [(x) => x.P! * x.t!, '{P} × {t}', 'Joules each second times the seconds.'],
        t: [(x) => div(x.W!, x.P!), '{W}/{P}', 'How many seconds at P joules each second.'],
      }),
    ),
    example: { m, h, t, W, P: W / t },
    startWith: ['m', 'h', 't'],
    representation: { kind: 'powerLift', mass: 'm', height: 'h', time: 't', work: 'W', power: 'P' },
  };
})();

// ─── H102.8 gasPiston `energy`: the first law, ΔU = Q − W ───────────────────

const firstLaw: ModuleDef = {
  id: 'g.s11-thermodynamics-first-law',
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
};

// ─── H102.10 charges `plates`, and the field at a point between two charges ──

const plates: ModuleDef = (() => {
  const [V, d, qe] = [12, 0.003, -1.602e-19];
  return {
    id: 'g.s11-electrostatics-plates',
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
        E: [
          (x) => (x.q === 0 ? undefined : x.F! / x.q!),
          '{F}/{q}',
          'The force for each coulomb of charge.',
        ],
        F: [(x) => x.q! * x.E!, '{q} × {E}', 'Charge times field; its sign gives the direction.'],
        q: [(x) => div(x.F!, x.E!), '{F}/{E}', 'Divide the force by the field.'],
      }),
    ),
    example: { V, d, E: V / d, q: qe, F: (qe * V) / d },
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
  };
})();

const K_E = 8.99e9;

const pointField: ModuleDef = (() => {
  const [a, b, r, x] = [3, -1, 0.4, 0.1];
  const E = (K_E * a * 1e-6) / (x * x) - (K_E * b * 1e-6) / ((r - x) * (r - x));
  return {
    id: 'g.s11-electrostatics-point-field',
    title: 'The field at a point between two charges',
    use: 'Use this for “+3 μC and −1 μC are 0.4 m apart. What is the field 0.1 m from the +3 μC charge, on the line between them?”',
    unitSystems: ['metric'],
    assumptions: [
      'The point is on the line between the charges, x from q₁; + is toward q₂.',
      'Each charge’s field points away from it if +, toward it if −, and the two fields add.',
      'E = kq₁/x² − kq₂/(r − x)², with k = 8.99 × 10⁹ N·m²/C² and the charges in μC × 10⁻⁶.',
    ],
    variables: [
      q('a', 'q₁', 'First charge', 'μC', -1000, 1000, 0.01),
      q('b', 'q₂', 'Second charge', 'μC', -1000, 1000, 0.01),
      q('r', 'r', 'Distance between the charges', 'm', 0.001, 100, 0.001),
      q('x', 'x', 'Distance of the point from q₁', 'm', 0.0001, 100, 0.0001),
      q('E', 'E', 'Field at the point (+ toward q₂)', 'N/C', -1e15, 1e15, 0.01, {
        scientific: true,
      }),
    ],
    ...rules(
      { relation: atLeast('r', 'x'), steps: {} },
      rule(
        'E = kq₁/x² − kq₂/(r − x)²',
        '{E} = 8.99 × 10⁹ × {a} × 10⁻⁶/{x}² − 8.99 × 10⁹ × {b} × 10⁻⁶/({r} − {x})²',
        (v) =>
          v.E! -
          ((K_E * v.a! * 1e-6) / (v.x! * v.x!) -
            (K_E * v.b! * 1e-6) / ((v.r! - v.x!) * (v.r! - v.x!))),
        {
          E: [
            (v) =>
              v.x! > 0 && v.r! > v.x!
                ? (K_E * v.a! * 1e-6) / (v.x! * v.x!) -
                  (K_E * v.b! * 1e-6) / ((v.r! - v.x!) * (v.r! - v.x!))
                : undefined,
            '8.99 × 10⁹ × {a} × 10⁻⁶/({x}²) − 8.99 × 10⁹ × {b} × 10⁻⁶/(({r} − {x})²)',
            'For + charges, q₁’s part points toward q₂ and q₂’s points back toward q₁: subtract it.',
          ],
          a: null,
          b: null,
          r: null,
          x: null,
        },
      ),
    ),
    example: { a, b, r, x, E },
    startWith: ['a', 'b', 'r', 'x'],
    representation: {
      kind: 'charges',
      charges: ['a', 'b'],
      distance: 'r',
      point: 'x',
      field: 'E',
    },
  };
})();

// ─── H102.11 photoelectric: photons free electrons above a threshold ─────────

const photoelectric: ModuleDef = (() => {
  const [lam, phi] = [250, 2.3];
  return {
    id: 'g.s11-modern-physics-photoelectric',
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
    example: { l: lam, E: 1240 / lam, p: phi, K: 1240 / lam - phi, z: 1240 / phi },
    startWith: ['l', 'p'],
    representation: {
      kind: 'photoelectric',
      wavelength: 'l',
      workFunction: 'p',
      energy: 'E',
      kinetic: 'K',
      threshold: 'z',
    },
  };
})();

// ─── H102.12 lightClock: time dilation and length contraction ────────────────

const relativity: ModuleDef = (() => {
  const [b, t0, L0] = [0.6, 10, 100];
  const g = 1 / Math.sqrt(1 - b * b);
  return {
    id: 'g.s11-modern-physics-relativity',
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
    example: { b, g, s: t0, t: g * t0, L: L0, m: L0 / g },
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
  };
})();

export const HS2C_GALLERY_MODULES: ModuleDef[] = [
  impulse,
  orbit,
  freeFall,
  work,
  power,
  firstLaw,
  plates,
  pointField,
  photoelectric,
  relativity,
];

// ─── H102.5 card figure `strobe`: sorting motion diagrams ───────────────────

const motionDiagrams: LayoutDef = {
  kind: 'sort',
  id: 'g.s11-kinematics-1d-motion-diagrams',
  title: 'Reading a motion diagram',
  use: 'Use this for “A strobe photo shows a runner every second. Is the runner speeding up, slowing down or steady?”',
  assumptions: [
    'Each dot is where the object is, one second apart; the open dot is the first.',
    'Equal gaps in equal times mean constant velocity; growing gaps, speeding up; shrinking gaps, slowing down.',
    'The arrow is the way it moves: the gaps tell the speed whichever way that is.',
  ],
  question: 'How is it moving?',
  bins: [
    {
      id: 'steady',
      label: 'Constant velocity',
      why: 'The gaps are equal: the same distance every second.',
    },
    { id: 'faster', label: 'Speeding up', why: 'Each gap is longer than the one before.' },
    { id: 'slower', label: 'Slowing down', why: 'Each gap is shorter than the one before.' },
  ],
  cards: [
    {
      label: 'Gaps of 2 m each second',
      bin: 'steady',
      figure: { kind: 'strobe', gaps: [2, 2, 2, 2] },
    },
    {
      label: 'Gaps of 1, 3, 5 and 7 m',
      bin: 'faster',
      figure: { kind: 'strobe', gaps: [1, 3, 5, 7] },
    },
    {
      label: 'Gaps of 8, 6, 4 and 2 m',
      bin: 'slower',
      figure: { kind: 'strobe', gaps: [8, 6, 4, 2] },
    },
    {
      label: 'Gaps of 5 m each second, moving left',
      bin: 'steady',
      figure: { kind: 'strobe', gaps: [5, 5, 5, 5], dir: 'left' },
    },
    {
      label: 'Gaps growing as it moves left',
      bin: 'faster',
      figure: { kind: 'strobe', gaps: [2, 4, 6, 8], dir: 'left' },
    },
    {
      label: 'A ball rolling up a ramp',
      bin: 'slower',
      figure: { kind: 'strobe', gaps: [7, 5, 3, 1.5], ramp: true },
    },
  ],
};

export const HS2C_GALLERY_LAYOUTS: LayoutDef[] = [motionDiagrams];
