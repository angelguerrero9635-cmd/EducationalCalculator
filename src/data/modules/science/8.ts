/**
 * Grade 8 science: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/science8.ts`.
 */
import { groupOf, periodOf } from '@/components/module/reps/chem';
import { formatNumber as fmt } from '@/engine/format';
import type { Relation, Values } from '@/engine/types';

import { atLeast, div, whole } from '../helpers';
import type { ModuleDef, StepText } from '../types';

/** `c = a × b` with plain steps; `plain` keeps nine-digit numbers out of the written grid. */
const product = (
  c: string,
  a: string,
  b: string,
  how: [string, string, string],
  plain = false,
): { relation: Relation; steps: Record<string, StepText> } => ({
  relation: {
    id: `${c} = ${a} × ${b}`,
    display: `{${c}} = {${a}} × {${b}}`,
    vars: [c, a, b],
    residual: (v: Values) => v[c]! - v[a]! * v[b]!,
    solve: {
      [c]: (v: Values) => v[a]! * v[b]!,
      [a]: (v: Values) => div(v[c]!, v[b]!),
      [b]: (v: Values) => div(v[c]!, v[a]!),
    },
  },
  steps: {
    [c]: { expr: `{${a}} × {${b}}`, how: how[0], ...(plain ? { written: false } : {}) },
    [a]: { expr: `{${c}} ÷ {${b}}`, how: how[1], ...(plain ? { written: false } : {}) },
    [b]: { expr: `{${c}} ÷ {${a}}`, how: how[2], ...(plain ? { written: false } : {}) },
  },
});

const T = { id: 't', symbol: 't', name: 'Time', unit: 's', min: 0, max: 60, step: 0.5 };

/** d = v × t, with its steps. */
const steady = product('d', 'v', 't', [
  'Each second covers v meters: multiply by the seconds.',
  'Speed is the slope: the rise in distance over the run in time.',
  'Divide the distance by the meters covered each second.',
]);

/** F = m × a, with its steps. */
const newton2 = product('F', 'm', 'a', [
  'A bigger mass or a bigger acceleration needs more force: multiply them.',
  'Divide the force by the acceleration it gives.',
  'Divide the force by the mass: the same pull speeds up a heavier cart less.',
]);

/** Gravity's pull on each kilogram, in N/kg. */
const G = 9.8;

/** KE = 1/2 × m × v², with its steps. */
const kinetic: { relation: Relation; steps: Record<string, StepText> } = {
  relation: {
    id: 'KE = 1/2 × m × v²',
    display: '{KE} = 1/2 × {m} × {v}²',
    vars: ['KE', 'm', 'v'],
    residual: (v: Values) => v.KE! - (v.m! * v.v! ** 2) / 2,
    solve: {
      v: (v: Values) => (v.m! > 0 && v.KE! >= 0 ? Math.sqrt((2 * v.KE!) / v.m!) : undefined),
      KE: (v: Values) => (v.m! * v.v! ** 2) / 2,
      m: (v: Values) => div(2 * v.KE!, v.v! ** 2),
    },
  },
  steps: {
    v: {
      expr: '√(2 × {KE} ÷ {m})',
      how: 'Double the kinetic energy, divide by the mass, take the square root.',
    },
    KE: { expr: '1/2 × {m} × {v}²', how: 'Half the mass times the speed squared.' },
    m: { expr: '2 × {KE} ÷ {v}²', how: 'Double the kinetic energy and divide by v².' },
  },
};

/**
 * Energy on a coaster or a pendulum: PE = m × g × h, the total m × g × H (it all starts as
 * potential energy), KE = E − PE; with `speed`, KE = 1/2 × m × v² too.
 */
function energyPage(
  id: string,
  title: string | undefined,
  use: string | undefined,
  track: 'coaster' | 'pendulum',
  assumptions: string[],
  limits: { m: [number, number]; top: [number, number] },
  example: { m: number; H: number; h: number },
  speed: boolean,
): ModuleDef {
  const { m, H, h } = example;
  const E = m * G * H;
  const PE = m * G * h;
  const KE = E - PE;
  return {
    id,
    ...(title ? { title } : {}),
    ...(use ? { use } : {}),
    unitSystems: ['metric'],
    assumptions,
    variables: [
      {
        id: 'm',
        symbol: 'm',
        name: 'Mass',
        unit: 'kg',
        units: ['kg'],
        min: limits.m[0],
        max: limits.m[1],
        step: 0.5,
      },
      {
        id: 'H',
        symbol: 'H',
        name: 'Top height',
        unit: 'm',
        units: ['m'],
        min: limits.top[0],
        max: limits.top[1],
        step: 0.1,
      },
      {
        id: 'h',
        symbol: 'h',
        name: 'Height now',
        unit: 'm',
        units: ['m'],
        min: 0,
        max: limits.top[1],
        step: 0.1,
      },
      { id: 'PE', symbol: 'PE', name: 'Potential energy', unit: 'J', min: 0, max: 1e7 },
      { id: 'KE', symbol: 'KE', name: 'Kinetic energy', unit: 'J', min: 0, max: 1e7 },
      { id: 'E', symbol: 'E', name: 'Total energy', unit: 'J', min: 0, max: 1e7 },
      ...(speed
        ? [{ id: 'v', symbol: 'v', name: 'Speed', unit: 'm/s', min: 0, max: 100, derived: true }]
        : []),
    ],
    relations: [
      atLeast('H', 'h'),
      {
        id: 'PE = m × g × h',
        display: `{PE} = {m} × ${G} × {h}`,
        vars: ['PE', 'm', 'h'],
        residual: (v: Values) => v.PE! - v.m! * G * v.h!,
        solve: {
          PE: (v: Values) => v.m! * G * v.h!,
          m: (v: Values) => div(v.PE!, G * v.h!),
          h: (v: Values) => div(v.PE!, G * v.m!),
        },
      },
      {
        id: 'E = m × g × H',
        display: `{E} = {m} × ${G} × {H}`,
        vars: ['E', 'm', 'H'],
        residual: (v: Values) => v.E! - v.m! * G * v.H!,
        solve: {
          E: (v: Values) => v.m! * G * v.H!,
          m: (v: Values) => div(v.E!, G * v.H!),
          H: (v: Values) => div(v.E!, G * v.m!),
        },
      },
      {
        id: 'PE + KE = E',
        display: '{PE} + {KE} = {E}',
        vars: ['PE', 'KE', 'E'],
        residual: (v: Values) => v.PE! + v.KE! - v.E!,
        solve: {
          E: (v: Values) => v.PE! + v.KE!,
          KE: (v: Values) => v.E! - v.PE!,
          PE: (v: Values) => v.E! - v.KE!,
        },
      },
      ...(speed ? [kinetic.relation] : []),
    ],
    steps: {
      'H ≥ h': {},
      'PE = m × g × h': {
        PE: { expr: `{m} × ${G} × {h}`, how: 'Each kilogram lifted each meter stores 9.8 J.' },
        m: { expr: `{PE} ÷ (${G} × {h})`, how: 'Divide by g × h.' },
        h: { expr: `{PE} ÷ ({m} × ${G})`, how: 'Divide by m × g.' },
      },
      'E = m × g × H': {
        E: { expr: `{m} × ${G} × {H}`, how: 'At the top it is all potential energy.' },
        m: { expr: `{E} ÷ (${G} × {H})`, how: 'Divide by g × H.' },
        H: { expr: `{E} ÷ ({m} × ${G})`, how: 'Divide by m × g.' },
      },
      'PE + KE = E': {
        E: { expr: '{PE} + {KE}', how: 'The two kinds add up to the total.' },
        KE: { expr: '{E} − {PE}', how: 'What is not potential energy is kinetic energy.' },
        PE: { expr: '{E} − {KE}', how: 'What is not kinetic energy is potential energy.' },
      },
      ...(speed ? { [kinetic.relation.id]: kinetic.steps } : {}),
    },
    example: { m, H, h, PE, KE, E, ...(speed ? { v: Math.sqrt((2 * KE) / m) } : {}) },
    startWith: ['m', 'H', 'h'],
    representation: {
      kind: 'energyTrack',
      track,
      height: 'h',
      potential: 'PE',
      kinetic: 'KE',
      total: 'E',
      top: 'H',
      mass: 'm',
      ...(speed ? { speed: 'v' } : {}),
    },
  };
}

/** A circuit branch's current: `i = V ÷ r`. */
const ohm = (i: string, r: string): Relation => ({
  id: `${i === 'I1' ? 'I₁' : 'I₂'} = V ÷ ${r === 'R1' ? 'R₁' : 'R₂'}`,
  display: `{${i}} = {V} ÷ {${r}}`,
  vars: [i, 'V', r],
  residual: (v: Values) => v[i]! * v[r]! - v.V!,
  solve: {
    [i]: (v: Values) => v.V! / v[r]!,
    V: (v: Values) => v[i]! * v[r]!,
    [r]: (v: Values) => (v[i] ? v.V! / v[i]! : undefined),
  },
});
const ohmSteps = (i: string, r: string): Record<string, StepText> => ({
  [i]: {
    expr: `{V} ÷ {${r}}`,
    how: 'The branch gets the whole voltage: divide it by the resistance.',
  },
  V: { expr: `{${i}} × {${r}}`, how: 'Multiply the branch’s current by its resistance.' },
  [r]: { expr: `{V} ÷ {${i}}`, how: 'Divide the voltage by the branch’s current.' },
});

const battery = {
  id: 'V',
  symbol: 'V',
  name: 'Battery voltage',
  unit: 'V',
  min: 0,
  max: 12,
  step: 0.5,
};
const bulb = (id: string, symbol: string, name: string) => ({
  id,
  symbol,
  name,
  unit: 'Ω',
  min: 1,
  max: 20,
  step: 0.5,
});

/** An element's group or period, read off the table: solvable only for the group or period. */
const placeOn = (
  id: string,
  what: 'group' | 'period',
  of: (z: number) => number | undefined,
): { relation: Relation; steps: Record<string, StepText> } => ({
  relation: {
    id: `${id} = ${what} of Z`,
    display: `{${id}} = the ${what} of element {Z}`,
    vars: [id, 'Z'],
    // The lanthanides and actinides have no group here: nothing to check.
    residual: (v: Values) => (of(v.Z!) === undefined ? 0 : v[id]! - of(v.Z!)!),
    solve: { [id]: (v: Values) => of(v.Z!), Z: () => undefined },
    check: (v: Values) => `${fmt(v[id]!)} = ${fmt(of(v.Z!) ?? NaN)}`,
  },
  steps: {
    [id]: {
      expr: (v: Values) => fmt(of(v.Z!) ?? NaN),
      how:
        what === 'group'
          ? 'Find the element on the table and read the number at the top of its column.'
          : 'Find the element on the table and read the number at the start of its row.',
    },
  },
});
const tablePlace = [placeOn('g', 'group', groupOf), placeOn('p', 'period', periodOf)];

/** The color of visible light by wavelength in nanometers. */
export const colorOf = (nm: number): string =>
  nm < 450
    ? 'violet'
    : nm < 495
      ? 'blue'
      : nm < 570
        ? 'green'
        : nm < 590
          ? 'yellow'
          : nm < 620
            ? 'orange'
            : 'red';

/** Gravity's pull on one kilogram at the surface, in N/kg, and the world's name. */
const WORLDS: [number, string][] = [
  [1.6, 'Moon'],
  [3.7, 'Mars'],
  [8.9, 'Venus'],
  [9.8, 'Earth'],
  [10.4, 'Saturn'],
  [11.2, 'Neptune'],
  [24.8, 'Jupiter'],
];

/** Distance from the sun in AU and the planet's name. */
const PLANETS: [number, string][] = [
  [0.39, 'Mercury'],
  [0.72, 'Venus'],
  [1, 'Earth'],
  [1.52, 'Mars'],
  [5.2, 'Jupiter'],
  [9.5, 'Saturn'],
  [19.2, 'Uranus'],
  [30.1, 'Neptune'],
];

const waveSpeed = product('v', 'f', 'L', [
  'Each second f waves pass, each λ long: the wave front moves f × λ meters.',
  'Divide the speed by one wave’s length: waves passing each second.',
  'Divide the speed by the waves each second.',
]);
const strength = product('S', 'N', 'I', [
  'Multiply the turns by the current: each turn carries the whole current round the nail once.',
  'Divide the strength by the current.',
  'Divide the strength by the turns.',
]);
const weight = product('W', 'm', 'g', [
  'Each kilogram is pulled with g newtons: multiply.',
  'Divide the weight by the pull on one kilogram.',
  'Divide the weight by the mass.',
]);

export const SCIENCE_8_MODULES: ModuleDef[] = [
  // ── Speed, velocity and acceleration (MS-PS2-2) ──
  {
    id: 's.8.motion',
    unitSystems: ['metric'],
    assumptions: [
      'Speed is the distance covered each second, in meters per second (m/s). 1 m/s is 3.6 km/h.',
      'On a distance-time graph a steady speed is a straight line; the steeper, the faster. A flat line is standing still.',
      'Velocity is speed with a direction: 3 m/s east. Walking back toward the start is a negative velocity.',
      'The dots above the graph are the position each second: evenly spaced at a steady speed.',
    ],
    variables: [
      T,
      { id: 'v', symbol: 'v', name: 'Speed', unit: 'm/s', min: 0, max: 20, step: 0.1 },
      { id: 'd', symbol: 'd', name: 'Distance', unit: 'm', min: 0, max: 1200 },
    ],
    relations: [steady.relation],
    steps: { 'd = v × t': steady.steps },
    example: { t: 4, v: 3, d: 12 },
    startWith: ['v', 't'],
    representation: {
      kind: 'motionGraph',
      graph: 'distance',
      time: 't',
      speed: 'v',
      distance: 'd',
      extent: { time: 10, value: 30 },
    },
  },
  {
    id: 's.8.motion~walk-graph',
    title: 'A walk along a tape measure',
    use: 'Use this for “During which time interval was she standing still, walking fastest, or walking back toward 0?”',
    unitSystems: ['metric'],
    assumptions: [
      'A walker starts at the 0 m mark and records her position every second.',
      'Her first leg is yours to set. Then she walks slower for 3 s, stands still for 5 s and walks back at 0.5 m/s for 4 s.',
      'Steepest part: fastest. Flat part: standing still. Falling part: walking back toward 0.',
    ],
    variables: [
      { ...T, name: 'Time of the first leg', min: 1, max: 8 },
      {
        id: 'v',
        symbol: 'v',
        name: 'Speed on the first leg',
        unit: 'm/s',
        min: 0.5,
        max: 2,
        step: 0.25,
      },
      {
        id: 'd',
        symbol: 'd',
        name: 'Distance after the first leg',
        unit: 'm',
        min: 0.5,
        max: 16,
      },
    ],
    relations: [steady.relation],
    steps: { 'd = v × t': steady.steps },
    example: { t: 2, v: 1.5, d: 3 },
    startWith: ['v', 't'],
    representation: {
      kind: 'motionGraph',
      graph: 'distance',
      time: 't',
      speed: 'v',
      distance: 'd',
      extent: { time: 14, value: 5 },
      then: [
        { time: 3, speed: 0.5 },
        { time: 5, speed: 0 },
        { time: 4, speed: -0.5 },
      ],
    },
  },
  {
    id: 's.8.motion~speed-time',
    title: 'Speeding up: a speed-time graph',
    use: 'Use this for “A cart speeds up from 2 m/s at 1.5 m/s² for 4 s. How fast is it going, and how far did it go?”',
    unitSystems: ['metric'],
    assumptions: [
      'Acceleration is how much the speed changes each second, in m/s² (meters per second, per second).',
      'On a speed-time graph the slope is the acceleration and the area under the line is the distance.',
      'The dots above spread out as the cart speeds up.',
    ],
    variables: [
      { ...T, max: 20 },
      { id: 'u', symbol: 'v₀', name: 'Starting speed', unit: 'm/s', min: 0, max: 20, step: 0.5 },
      { id: 'a', symbol: 'a', name: 'Acceleration', unit: 'm/s²', min: 0, max: 10, step: 0.5 },
      { id: 'v', symbol: 'v', name: 'Final speed', unit: 'm/s', min: 0, max: 220, derived: true },
      { id: 'd', symbol: 'd', name: 'Distance', unit: 'm', min: 0, max: 2400, derived: true },
    ],
    relations: [
      {
        id: 'v = v₀ + a × t',
        display: '{v} = {u} + {a} × {t}',
        vars: ['v', 'u', 'a', 't'],
        residual: (v: Values) => v.v! - v.u! - v.a! * v.t!,
        solve: {
          v: (v: Values) => v.u! + v.a! * v.t!,
          u: (v: Values) => v.v! - v.a! * v.t!,
          a: (v: Values) => div(v.v! - v.u!, v.t!),
          t: (v: Values) => div(v.v! - v.u!, v.a!),
        },
      },
      {
        id: 'd = (v₀ + v) ÷ 2 × t',
        display: '{d} = ({u} + {v}) ÷ 2 × {t}',
        vars: ['d', 'u', 'v', 't'],
        residual: (v: Values) => v.d! - ((v.u! + v.v!) / 2) * v.t!,
        solve: {
          d: (v: Values) => ((v.u! + v.v!) / 2) * v.t!,
          u: (v: Values) => div(2 * v.d!, v.t!)! - v.v!,
          v: (v: Values) => div(2 * v.d!, v.t!)! - v.u!,
          t: (v: Values) => div(2 * v.d!, v.u! + v.v!),
        },
      },
    ],
    steps: {
      'v = v₀ + a × t': {
        v: { expr: '{u} + {a} × {t}', how: 'Start at v₀ and add a for every second.' },
        a: { expr: '({v} − {u}) ÷ {t}', how: 'The slope: the rise in speed over the run of time.' },
        u: { expr: '{v} − {a} × {t}', how: 'Take off the speed gained: a for every second.' },
        t: { expr: '({v} − {u}) ÷ {a}', how: 'Divide the speed gained by the gain each second.' },
      },
      'd = (v₀ + v) ÷ 2 × t': {
        d: {
          expr: '({u} + {v}) ÷ 2 × {t}',
          how: 'The area under the line: the average speed times the time.',
        },
        u: { expr: '2 × {d} ÷ {t} − {v}', how: 'Twice the average speed, less the final speed.' },
        v: {
          expr: '2 × {d} ÷ {t} − {u}',
          how: 'Twice the average speed, less the starting speed.',
        },
        t: { expr: '{d} ÷ (({u} + {v}) ÷ 2)', how: 'Divide the distance by the average speed.' },
      },
    },
    example: { t: 4, u: 2, a: 1.5, v: 8, d: 20 },
    startWith: ['u', 'a', 't'],
    representation: {
      kind: 'motionGraph',
      graph: 'speed',
      time: 't',
      acceleration: 'a',
      speed: 'v',
      start: 'u',
      distance: 'd',
      extent: { time: 10, value: 10 },
    },
  },

  // ── Newton's three laws of motion (MS-PS2-1, MS-PS2-2) ──
  {
    id: 's.8.newtons-laws',
    unitSystems: ['metric'],
    assumptions: [
      'The net force is all the forces on the cart added together, pulls one way minus pulls the other way. Friction is too small to count here.',
      'First law: with no net force the motion does not change, at rest or at a steady speed.',
      'Second law: F = m × a. 1 newton speeds up 1 kilogram by 1 m/s every second.',
      'Third law: forces come in pairs. The rope pulls the cart forward; the cart pulls the rope back just as hard.',
    ],
    variables: [
      { id: 'F', symbol: 'F', name: 'Net force', unit: 'N', min: 0, max: 500, step: 1 },
      { id: 'm', symbol: 'm', name: 'Mass', unit: 'kg', min: 0.5, max: 100, step: 0.5 },
      { id: 'a', symbol: 'a', name: 'Acceleration', unit: 'm/s²', min: 0, max: 20, step: 0.1 },
    ],
    relations: [newton2.relation],
    steps: { 'F = m × a': newton2.steps },
    example: { m: 4, a: 2.5, F: 10 },
    startWith: ['m', 'a'],
    representation: {
      kind: 'force',
      object: 'cart',
      force: 'F',
      mass: 'm',
      acceleration: 'a',
      forceExtent: 20,
      accelerationExtent: 5,
    },
  },
  {
    id: 's.8.newtons-laws~third-law',
    title: 'Two skaters push apart: force pairs',
    use: 'Use this for “Two skaters push off each other. Who moves, and who speeds up more?”',
    unitSystems: ['metric'],
    assumptions: [
      'When A pushes B, B pushes A back with the same force the other way: the third law. It does not matter who “does” the pushing.',
      'Both move: each speeds up by the push divided by its own mass, so the lighter skater speeds up more.',
      'The ice is smooth enough that friction does not count.',
    ],
    variables: [
      { id: 'F', symbol: 'F', name: 'Push', unit: 'N', min: 0, max: 400, step: 5 },
      { id: 'm1', symbol: 'm₁', name: 'Mass of A', unit: 'kg', min: 20, max: 100, step: 1 },
      { id: 'm2', symbol: 'm₂', name: 'Mass of B', unit: 'kg', min: 20, max: 100, step: 1 },
      {
        id: 'a1',
        symbol: 'a₁',
        name: 'Acceleration of A',
        unit: 'm/s²',
        min: 0,
        max: 20,
        derived: true,
      },
      {
        id: 'a2',
        symbol: 'a₂',
        name: 'Acceleration of B',
        unit: 'm/s²',
        min: 0,
        max: 20,
        derived: true,
      },
    ],
    relations: [
      {
        id: 'a₁ = F ÷ m₁',
        display: '{a1} = {F} ÷ {m1}',
        vars: ['a1', 'F', 'm1'],
        residual: (v: Values) => v.a1! * v.m1! - v.F!,
        solve: {
          a1: (v: Values) => div(v.F!, v.m1!),
          F: (v: Values) => v.a1! * v.m1!,
          m1: (v: Values) => div(v.F!, v.a1!),
        },
      },
      {
        id: 'a₂ = F ÷ m₂',
        display: '{a2} = {F} ÷ {m2}',
        vars: ['a2', 'F', 'm2'],
        residual: (v: Values) => v.a2! * v.m2! - v.F!,
        solve: {
          a2: (v: Values) => div(v.F!, v.m2!),
          F: (v: Values) => v.a2! * v.m2!,
          m2: (v: Values) => div(v.F!, v.a2!),
        },
      },
    ],
    steps: {
      'a₁ = F ÷ m₁': {
        a1: { expr: '{F} ÷ {m1}', how: 'A feels the whole push: divide it by A’s mass.' },
        F: { expr: '{a1} × {m1}', how: 'The push is A’s mass times A’s acceleration.' },
        m1: { expr: '{F} ÷ {a1}', how: 'Divide the push by the acceleration it gives A.' },
      },
      'a₂ = F ÷ m₂': {
        a2: { expr: '{F} ÷ {m2}', how: 'B feels the same push the other way: divide by B’s mass.' },
        F: { expr: '{a2} × {m2}', how: 'The push is B’s mass times B’s acceleration.' },
        m2: { expr: '{F} ÷ {a2}', how: 'Divide the push by the acceleration it gives B.' },
      },
    },
    example: { F: 60, m1: 40, m2: 60, a1: 1.5, a2: 1 },
    startWith: ['F', 'm1', 'm2'],
    representation: {
      kind: 'skaters',
      force: 'F',
      masses: ['m1', 'm2'],
      accelerations: ['a1', 'a2'],
    },
  },
  {
    id: 's.8.newtons-laws~net-force',
    title: 'Net force: a pull against friction',
    use: 'Use this for “A 50 N pull against 30 N of friction on an 8 kg box. What is the acceleration?” and “Why must you keep pushing to keep a box sliding at a steady speed?”',
    unitSystems: ['metric'],
    assumptions: [
      'Two forces along a line: subtract the one pointing back from the one pointing forward.',
      'Friction always points against the sliding.',
      'Pull equal to friction: net force 0, so the box keeps its speed. That is why a steady slide still needs a steady pull.',
    ],
    variables: [
      // Whole newtons: the pushes picture draws its arrows in whole steps.
      { ...whole('F', 'F', 'Pull', 0, 500), unit: 'N', units: ['N'] },
      { ...whole('f', 'f', 'Friction', 0, 500), unit: 'N', units: ['N'] },
      {
        id: 'n',
        symbol: 'n',
        name: 'Net force',
        unit: 'N',
        units: ['N'],
        min: 0,
        max: 500,
        step: 1,
        integer: true,
        derived: true,
      },
      { id: 'm', symbol: 'm', name: 'Mass', unit: 'kg', min: 0.5, max: 100, step: 0.5 },
      {
        id: 'a',
        symbol: 'a',
        name: 'Acceleration',
        unit: 'm/s²',
        min: 0,
        max: 1000,
        step: 0.01,
        derived: true,
      },
    ],
    relations: [
      atLeast('F', 'f'),
      {
        id: 'n = F − f',
        display: '{n} = {F} − {f}',
        vars: ['n', 'F', 'f'],
        residual: (v: Values) => v.n! - v.F! + v.f!,
        solve: {
          n: (v: Values) => v.F! - v.f!,
          F: (v: Values) => v.n! + v.f!,
          f: (v: Values) => v.F! - v.n!,
        },
      },
      {
        id: 'a = n ÷ m',
        display: '{a} = {n} ÷ {m}',
        vars: ['a', 'n', 'm'],
        residual: (v: Values) => v.a! * v.m! - v.n!,
        solve: {
          a: (v: Values) => div(v.n!, v.m!),
          n: (v: Values) => v.a! * v.m!,
          m: (v: Values) => div(v.n!, v.a!),
        },
      },
    ],
    steps: {
      'F ≥ f': {},
      'n = F − f': {
        n: { expr: '{F} − {f}', how: 'Friction points back, so take it away from the pull.' },
        F: {
          expr: '{n} + {f}',
          how: 'The pull is the net force plus the friction it has to beat.',
        },
        f: { expr: '{F} − {n}', how: 'What the pull lost to friction.' },
      },
      'a = n ÷ m': {
        a: {
          expr: '{n} ÷ {m}',
          how: 'Only the net force speeds the box up: divide it by the mass.',
        },
        n: { expr: '{a} × {m}', how: 'Mass times acceleration is the net force.' },
        m: { expr: '{n} ÷ {a}', how: 'Divide the net force by the acceleration it gives.' },
      },
    },
    example: { F: 50, f: 30, n: 20, m: 8, a: 2.5 },
    startWith: ['F', 'f', 'm'],
    pictureLabels: ['m', 'a'],
    representation: { kind: 'pushes', right: 'F', left: 'f', extra: 'n', max: 500 },
  },

  // ── Kinetic and potential energy (MS-PS3-1, MS-PS3-2, MS-PS3-5) ──
  energyPage(
    's.8.kinetic-potential',
    undefined,
    undefined,
    'coaster',
    [
      'The car starts at rest at the top, so all its energy is potential energy: m × g × h, with g = 9.8 N/kg.',
      'As it drops, potential energy becomes kinetic energy: 1/2 × m × v². The total stays the same.',
      'Friction and air are too small to count here; on a real coaster they turn some energy into heat, so each hill is lower than the last.',
      'Energy is in joules (J): 1 J lifts 1 newton by 1 meter.',
    ],
    { m: [50, 1000], top: [5, 60] },
    { m: 200, H: 30, h: 12 },
    true,
  ),
  {
    id: 's.8.kinetic-potential~kinetic',
    title: 'Kinetic energy: mass and speed',
    use: 'Use this for “What has a bigger effect on kinetic energy, doubling the speed or doubling the mass?”',
    unitSystems: ['metric'],
    assumptions: [
      'Kinetic energy is the energy of moving: 1/2 × m × v².',
      'Twice the mass, twice the energy. Twice the speed, four times the energy, because the speed is squared.',
      'A moving bat at 30 m/s carries 9 times the energy it has at 10 m/s: speed matters most in a collision.',
    ],
    variables: [
      {
        id: 'm',
        symbol: 'm',
        name: 'Mass',
        unit: 'kg',
        units: ['kg'],
        min: 0.1,
        max: 2000,
        step: 0.1,
      },
      { id: 'v', symbol: 'v', name: 'Speed', unit: 'm/s', min: 0, max: 60, step: 0.1 },
      { id: 'KE', symbol: 'KE', name: 'Kinetic energy', unit: 'J', min: 0, max: 4e6 },
    ],
    relations: [kinetic.relation],
    steps: { [kinetic.relation.id]: kinetic.steps },
    example: { m: 2, v: 10, KE: 100 },
    startWith: ['m', 'v'],
    representation: {
      kind: 'table',
      sweep: 'v',
      output: 'KE',
      params: ['m'],
      rows: [5, 10, 15, 20, 25, 30],
    },
  },
  energyPage(
    's.8.kinetic-potential~pendulum',
    'A pendulum trades energy',
    'Use this for “Where is the pendulum fastest, and where does it have the most potential energy?”',
    'pendulum',
    [
      'The bob is let go from rest at height H.',
      'At the bottom all its energy is kinetic: it is fastest there. At each end it stops for an instant: all potential.',
      'Without air it would rise to the same height each swing; air takes a little energy, so each swing is a little lower.',
    ],
    { m: [0.5, 10], top: [0.1, 2] },
    { m: 2, H: 0.5, h: 0.2 },
    false,
  ),

  // ── Wave properties and the electromagnetic spectrum (MS-PS4-1, MS-PS4-2) ──
  {
    id: 's.8.em-spectrum',
    unitSystems: ['metric'],
    assumptions: [
      'Radio waves, microwaves, infrared, visible light, ultraviolet, X-rays and gamma rays are all the same kind of wave, at different wavelengths.',
      'In empty space they all travel at the speed of light, 300,000,000 m/s.',
      'Wavelength × frequency = speed, so a shorter wavelength means a higher frequency and more energy in each wave.',
      'This page runs from 1,000 m radio waves to 10 nm ultraviolet. X-rays and gamma rays are shorter still.',
    ],
    variables: [
      {
        id: 'L',
        symbol: 'λ',
        name: 'Wavelength',
        unit: 'm',
        units: ['m'],
        min: 1e-8,
        max: 1000,
        step: 1e-9,
      },
      { id: 'f', symbol: 'f', name: 'Frequency', unit: 'Hz', min: 3e5, max: 3e16, step: 1 },
    ],
    relations: [
      {
        id: 'c = λf',
        display: '300,000,000 = {L} × {f}',
        vars: ['f', 'L'],
        residual: (v: Values) => (v.L! * v.f!) / 3e8 - 1,
        solve: { f: (v: Values) => 3e8 / v.L!, L: (v: Values) => 3e8 / v.f! },
      },
    ],
    steps: {
      'c = λf': {
        f: {
          expr: '300,000,000 ÷ {L}',
          how: 'Divide the speed of light by the wavelength: shorter waves pass by more often.',
          written: false,
        },
        L: {
          expr: '300,000,000 ÷ {f}',
          how: 'Divide the speed of light by the frequency.',
          written: false,
        },
      },
    },
    example: { L: 3, f: 100_000_000 },
    startWith: ['L'],
    representation: { kind: 'spectrum', wavelength: 'L', frequency: 'f', speed: 300_000_000 },
  },
  {
    id: 's.8.em-spectrum~visible-light',
    title: 'Colors of visible light',
    use: 'Use this for “Which color of light has the longest wavelength?” and “How many waves of green light fit in one millimeter?”',
    unitSystems: ['metric'],
    assumptions: [
      'Visible light runs from red at about 700 nm to violet at about 400 nm. A nanometer is a billionth of a meter.',
      'Red has the longest wavelength and the least energy per wave; violet the shortest and the most.',
      'Beyond red is infrared, felt as heat; beyond violet is ultraviolet, which sunburns.',
    ],
    variables: [
      { id: 'L', symbol: 'λ', name: 'Wavelength', unit: 'nm', min: 400, max: 700, step: 1 },
      {
        id: 'w',
        symbol: 'w',
        name: 'Waves in one millimeter',
        min: 1000,
        max: 2500,
        step: 0.1,
        derived: true,
      },
    ],
    relations: [
      {
        id: 'w = 1,000,000 ÷ λ',
        display: '{w} = 1,000,000 ÷ {L}',
        vars: ['w', 'L'],
        residual: (v: Values) => v.w! * v.L! - 1e6,
        solve: { w: (v: Values) => 1e6 / v.L!, L: (v: Values) => 1e6 / v.w! },
      },
    ],
    steps: {
      'w = 1,000,000 ÷ λ': {
        w: {
          expr: '1,000,000 ÷ {L}',
          how: 'A millimeter is 1,000,000 nanometers: divide it by one wave’s length.',
          note: (v: Values) => `(${colorOf(v.L!)} light)`,
        },
        L: { expr: '1,000,000 ÷ {w}', how: 'Share the millimeter out among the waves.' },
      },
    },
    example: { L: 500, w: 2000 },
    startWith: ['L'],
    pictureLabels: ['w'],
    representation: { kind: 'spectrum', wavelength: 'L', meters: 1e-9 },
  },
  {
    id: 's.8.em-spectrum~wave-speed',
    title: 'Wave speed: frequency times wavelength',
    use: 'Use this for “A wave on a rope has a frequency of 2 Hz and a wavelength of 1.5 m. How fast does it travel?”',
    unitSystems: ['metric'],
    assumptions: [
      'Frequency is how many waves pass a point each second, in hertz (Hz). Wavelength is crest to crest.',
      'Sound travels at about 340 m/s in air; light at 300,000,000 m/s.',
      'A wave’s energy grows with its amplitude: twice the height, four times the energy. Amplitude does not change the speed.',
    ],
    variables: [
      { id: 'f', symbol: 'f', name: 'Frequency', unit: 'Hz', min: 0.1, max: 20000, step: 0.1 },
      {
        id: 'L',
        symbol: 'λ',
        name: 'Wavelength',
        unit: 'm',
        units: ['m'],
        min: 0.01,
        max: 100,
        step: 0.01,
      },
      { id: 'v', symbol: 'v', name: 'Wave speed', unit: 'm/s', min: 0.01, max: 1500, step: 0.01 },
    ],
    relations: [waveSpeed.relation],
    steps: { [waveSpeed.relation.id]: waveSpeed.steps },
    example: { f: 2, L: 1.5, v: 3 },
    startWith: ['f', 'L'],
    representation: { kind: 'wave', wavelength: 'L', frequency: 'f', extent: 4 },
  },

  // ── Electric charge, current and simple circuits (MS-PS2-3, MS-PS2-5) ──
  {
    id: 's.8.electricity-basics',
    unitSystems: ['metric'],
    assumptions: [
      'A circuit is a closed loop of conductor from one end of the battery to the other. Open it anywhere and the current stops.',
      'Voltage (V) is the battery’s push. Current (A) is how much charge flows each second. Resistance (Ω) is how hard a part makes it to flow.',
      'In series the bulbs are in one loop, so the same current goes through each and their resistances add: I = V ÷ (R₁ + R₂).',
      'The switch value is 1 closed, 0 open. Tap it in the picture.',
    ],
    variables: [
      battery,
      bulb('R1', 'R₁', 'First bulb'),
      bulb('R2', 'R₂', 'Second bulb'),
      { ...whole('s', 's', 'Switch closed', 0, 1), allowed: [0, 1] },
      { id: 'I', symbol: 'I', name: 'Current', unit: 'A', min: 0, max: 12, step: 0.01 },
    ],
    relations: [
      {
        id: 'I = sV ÷ (R₁ + R₂)',
        display: '{I} = {s} × {V} ÷ ({R1} + {R2})',
        vars: ['I', 's', 'V', 'R1', 'R2'],
        residual: (v: Values) => v.I! * (v.R1! + v.R2!) - v.s! * v.V!,
        solve: {
          I: (v: Values) => (v.s! * v.V!) / (v.R1! + v.R2!),
          V: (v: Values) => (v.s ? (v.I! * (v.R1! + v.R2!)) / v.s : undefined),
          R1: (v: Values) => (v.s && v.I ? (v.s * v.V!) / v.I - v.R2! : undefined),
          R2: (v: Values) => (v.s && v.I ? (v.s * v.V!) / v.I - v.R1! : undefined),
          s: () => undefined,
        },
      },
    ],
    steps: {
      'I = sV ÷ (R₁ + R₂)': {
        I: {
          expr: '{s} × {V} ÷ ({R1} + {R2})',
          how: 'Add the resistances, then divide the voltage by the total. An open switch (0) stops the current.',
        },
        V: { expr: '{I} × ({R1} + {R2})', how: 'Multiply the current by the total resistance.' },
        R1: { expr: '{V} ÷ {I} − {R2}', how: 'Find the total resistance, then take away R₂.' },
        R2: { expr: '{V} ÷ {I} − {R1}', how: 'Find the total resistance, then take away R₁.' },
      },
    },
    example: { V: 6, R1: 2, R2: 4, s: 1, I: 1 },
    startWith: ['V', 'R1', 'R2', 's'],
    representation: {
      kind: 'circuit',
      wiring: 'series',
      voltage: 'V',
      bulbs: ['R1', 'R2'],
      current: 'I',
      switch: 's',
    },
  },
  {
    id: 's.8.electricity-basics~parallel',
    title: 'Bulbs in parallel',
    use: 'Use this for “Two bulbs are wired in parallel across a 6 V battery. What current does each get, and what does the meter read?”',
    unitSystems: ['metric'],
    assumptions: [
      'Each bulb has its own branch across the battery, so each gets the full voltage.',
      'The branch currents add at the meter: more branches, more current from the battery.',
      'One bulb burning out does not put the other out. That is how house wiring works.',
    ],
    variables: [
      battery,
      bulb('R1', 'R₁', 'First bulb'),
      bulb('R2', 'R₂', 'Second bulb'),
      {
        id: 'I1',
        symbol: 'I₁',
        name: 'First branch current',
        unit: 'A',
        min: 0,
        max: 12,
        step: 0.01,
        derived: true,
      },
      {
        id: 'I2',
        symbol: 'I₂',
        name: 'Second branch current',
        unit: 'A',
        min: 0,
        max: 12,
        step: 0.01,
        derived: true,
      },
      {
        id: 'I',
        symbol: 'I',
        name: 'Current at the meter',
        unit: 'A',
        min: 0,
        max: 24,
        step: 0.01,
      },
    ],
    relations: [
      ohm('I1', 'R1'),
      ohm('I2', 'R2'),
      {
        id: 'I = I₁ + I₂',
        display: '{I} = {I1} + {I2}',
        vars: ['I', 'I1', 'I2'],
        residual: (v: Values) => v.I! - v.I1! - v.I2!,
        solve: {
          I: (v: Values) => v.I1! + v.I2!,
          I1: (v: Values) => v.I! - v.I2!,
          I2: (v: Values) => v.I! - v.I1!,
        },
      },
    ],
    steps: {
      'I₁ = V ÷ R₁': ohmSteps('I1', 'R1'),
      'I₂ = V ÷ R₂': ohmSteps('I2', 'R2'),
      'I = I₁ + I₂': {
        I: { expr: '{I1} + {I2}', how: 'The branch currents join at the meter.' },
        I1: { expr: '{I} − {I2}', how: 'Take the second branch’s current from the total.' },
        I2: { expr: '{I} − {I1}', how: 'Take the first branch’s current from the total.' },
      },
    },
    example: { V: 6, R1: 2, R2: 4, I1: 3, I2: 1.5, I: 4.5 },
    startWith: ['V', 'R1', 'R2'],
    representation: {
      kind: 'circuit',
      wiring: 'parallel',
      voltage: 'V',
      bulbs: ['R1', 'R2'],
      branches: ['I1', 'I2'],
      current: 'I',
    },
  },
  {
    id: 's.8.electricity-basics~more-bulbs',
    title: 'More bulbs in series',
    use: 'Use this for “A third identical bulb is added in series. What happens to the current and the brightness?”',
    unitSystems: ['metric'],
    assumptions: [
      'The bulbs are all the same, in one loop.',
      'Each bulb adds its resistance, so more bulbs share less current and each glows dimmer.',
      'Bulbs glow by the power they get, so the picture dims as you add bulbs.',
    ],
    variables: [
      battery,
      whole('n', 'n', 'Bulbs', 1, 4),
      bulb('R', 'R', 'Each bulb'),
      { id: 'I', symbol: 'I', name: 'Current', unit: 'A', min: 0, max: 12, step: 0.01 },
    ],
    relations: [
      {
        id: 'I = V ÷ nR',
        display: '{I} = {V} ÷ ({n} × {R})',
        vars: ['I', 'V', 'n', 'R'],
        residual: (v: Values) => v.I! * v.n! * v.R! - v.V!,
        solve: {
          I: (v: Values) => v.V! / (v.n! * v.R!),
          V: (v: Values) => v.I! * v.n! * v.R!,
          R: (v: Values) => (v.I && v.n ? v.V! / (v.I * v.n) : undefined),
          n: () => undefined,
        },
      },
    ],
    steps: {
      'I = V ÷ nR': {
        I: {
          expr: '{V} ÷ ({n} × {R})',
          how: 'The total resistance is n × R; divide the voltage by it.',
        },
        V: { expr: '{I} × {n} × {R}', how: 'Multiply the current by the total resistance.' },
        R: { expr: '{V} ÷ ({I} × {n})', how: 'Divide the voltage by the current times n.' },
      },
    },
    example: { V: 6, n: 3, R: 2, I: 1 },
    startWith: ['V', 'n', 'R'],
    representation: {
      kind: 'circuit',
      wiring: 'series',
      voltage: 'V',
      bulbs: ['R'],
      count: 'n',
      current: 'I',
    },
  },

  // ── Magnetic fields and electromagnets (MS-PS2-3, MS-PS2-5) ──
  {
    id: 's.8.magnetic-fields',
    unitSystems: ['metric'],
    assumptions: [
      'A current in a coil of wire makes a magnetic field. An iron nail inside makes it much stronger, and it switches off with the current.',
      'More turns or more current makes a stronger electromagnet: strength follows turns × current, measured in amp-turns.',
      'Clips picked up is how a class measures strength. The 5 amp-turns per clip here is this coil and nail’s result; yours will differ.',
      'Turns come in tens because a class winds and counts them that way.',
    ],
    variables: [
      {
        ...whole('N', 'N', 'Turns of wire', 10, 60),
        unit: 'turns',
        allowed: [10, 20, 30, 40, 50, 60],
      },
      { id: 'I', symbol: 'I', name: 'Current', unit: 'A', min: 0, max: 2, step: 0.1 },
      { id: 'S', symbol: 'S', name: 'Strength', unit: 'amp-turns', min: 0, max: 120, step: 0.1 },
      { ...whole('k', 'k', 'Paper clips picked up', 0, 24), unit: 'clips', derived: true },
    ],
    relations: [
      strength.relation,
      {
        id: 'k = S ÷ 5',
        display: '{k} = {S} ÷ 5',
        vars: ['k', 'S'],
        residual: (v: Values) => v.k! - v.S! / 5,
        solve: { k: (v: Values) => v.S! / 5, S: (v: Values) => 5 * v.k! },
      },
    ],
    steps: {
      [strength.relation.id]: strength.steps,
      'k = S ÷ 5': {
        k: {
          expr: '{S} ÷ 5',
          how: 'For this coil and nail, about one clip for every 5 amp-turns.',
        },
        S: { expr: '5 × {k}', how: 'Each clip takes 5 amp-turns.' },
      },
    },
    example: { N: 20, I: 1.5, S: 30, k: 6 },
    startWith: ['N', 'I'],
    representation: {
      kind: 'electromagnet',
      turns: 'N',
      current: 'I',
      strength: 'S',
      clips: 'k',
    },
  },

  // ── The periodic table (MS-PS1-1): the main page is an explore (layouts) ──
  {
    id: 's.8.periodic-table~group-period',
    title: 'Reading an element’s group and period',
    use: 'Use this for “In which group and period is element 17?”',
    unitSystems: ['metric'],
    assumptions: [
      'The atomic number counts the protons in one atom and sets the element’s place.',
      'Groups are numbered 1 to 18 across the top; periods 1 to 7 down the side.',
      'The two rows under the table belong in periods 6 and 7 and have no group number here.',
      'Tap an element to choose it.',
    ],
    variables: [
      whole('Z', 'Z', 'Atomic number', 1, 118),
      { ...whole('g', 'g', 'Group', 1, 18), derived: true },
      { ...whole('p', 'p', 'Period', 1, 7), derived: true },
    ],
    relations: tablePlace.map((r) => r.relation),
    steps: Object.fromEntries(tablePlace.map((r) => [r.relation.id, r.steps])),
    example: { Z: 8, g: 16, p: 2 },
    startWith: ['Z'],
    representation: { kind: 'periodicTable', element: 'Z', families: true },
  },
  {
    id: 's.8.periodic-table~protons-neutrons',
    title: 'Protons, neutrons and electrons from the card',
    use: 'Use this for “An atom has 8 protons and a mass number of 16. How many neutrons does it have?”',
    unitSystems: ['metric'],
    assumptions: [
      'Protons and neutrons sit in the nucleus; electrons move round it.',
      'The mass number is the protons plus the neutrons. Round the card’s mass to the nearest whole number for the common form of the element.',
      'Atoms of one element can differ in neutrons (isotopes); they never differ in protons.',
    ],
    variables: [
      whole('Z', 'Z', 'Atomic number', 1, 118),
      whole('A', 'A', 'Mass number', 1, 300),
      { ...whole('p', 'p', 'Protons', 1, 118), derived: true },
      { ...whole('e', 'e', 'Electrons', 1, 118), derived: true },
      { ...whole('n', 'n', 'Neutrons', 0, 200), derived: true },
    ],
    relations: [
      {
        id: 'p = Z',
        display: '{p} = {Z}',
        vars: ['p', 'Z'],
        residual: (v: Values) => v.p! - v.Z!,
        solve: { p: (v: Values) => v.Z!, Z: (v: Values) => v.p! },
      },
      {
        id: 'e = Z',
        display: '{e} = {Z}',
        vars: ['e', 'Z'],
        residual: (v: Values) => v.e! - v.Z!,
        solve: { e: (v: Values) => v.Z!, Z: (v: Values) => v.e! },
      },
      atLeast('A', 'Z'),
      {
        id: 'n = A − Z',
        display: '{n} = {A} − {Z}',
        vars: ['n', 'A', 'Z'],
        residual: (v: Values) => v.n! - v.A! + v.Z!,
        solve: {
          n: (v: Values) => v.A! - v.Z!,
          A: (v: Values) => v.n! + v.Z!,
          Z: (v: Values) => v.A! - v.n!,
        },
      },
    ],
    steps: {
      'p = Z': {
        p: { expr: '{Z}', how: 'The atomic number is the number of protons.' },
        Z: { expr: '{p}', how: 'Count the protons: that is the atomic number.' },
      },
      'e = Z': {
        e: { expr: '{Z}', how: 'A neutral atom has as many electrons as protons.' },
        Z: { expr: '{e}', how: 'A neutral atom has as many protons as electrons.' },
      },
      'A ≥ Z': {},
      'n = A − Z': {
        n: {
          expr: '{A} − {Z}',
          how: 'The mass number counts protons and neutrons together, so take the protons away.',
        },
        A: { expr: '{n} + {Z}', how: 'Add the neutrons and the protons.' },
        Z: { expr: '{A} − {n}', how: 'Take the neutrons away from the mass number.' },
      },
    },
    example: { Z: 8, A: 16, p: 8, e: 8, n: 8 },
    startWith: ['Z', 'A'],
    representation: { kind: 'periodicTable', element: 'Z' },
  },

  // ── Gravity and orbits in the solar system (MS-ESS1-2, MS-ESS1-3, MS-PS2-4) ──
  {
    id: 's.8.gravity-orbits',
    unitSystems: ['metric'],
    assumptions: [
      'Gravity pulls every mass toward every other mass. The sun’s pull keeps the planets on their orbits; without it each would fly off in a straight line.',
      'The pull grows with the planet’s mass and falls with the square of its distance.',
      'Pull is counted in Earth’s pull (1), mass in Earth masses, distance in AU: Earth’s distance from the sun, 150 million km.',
      'The same law holds the moon round Earth and the stars in a galaxy. Drag the planet in or out.',
    ],
    variables: [
      {
        id: 'd',
        symbol: 'd',
        name: 'Distance from the sun',
        unit: 'AU',
        min: 0.3,
        max: 40,
        step: 0.01,
      },
      {
        id: 'm',
        symbol: 'm',
        name: 'Mass',
        unit: 'Earth masses',
        min: 0.05,
        max: 320,
        step: 0.001,
      },
      {
        id: 'F',
        symbol: 'F',
        name: 'Pull of the sun, in Earth’s pull',
        min: 0,
        max: 4000,
        step: 0.0001,
      },
    ],
    relations: [
      {
        id: 'F = m ÷ d²',
        display: '{F} = {m} ÷ {d}²',
        vars: ['F', 'm', 'd'],
        residual: (v: Values) => v.F! * v.d! ** 2 - v.m!,
        solve: {
          F: (v: Values) => v.m! / v.d! ** 2,
          m: (v: Values) => v.F! * v.d! ** 2,
          d: (v: Values) => (v.F! > 0 ? Math.sqrt(v.m! / v.F!) : undefined),
        },
      },
    ],
    steps: {
      'F = m ÷ d²': {
        F: {
          expr: '{m} ÷ {d}²',
          how: 'Square the distance, then divide the mass by it: twice as far, a quarter of the pull.',
        },
        m: { expr: '{F} × {d}²', how: 'Multiply the pull by the distance squared.' },
        d: { expr: '√({m} ÷ {F})', how: 'Divide the mass by the pull, then take the square root.' },
      },
    },
    example: { d: 1, m: 1, F: 1 },
    startWith: ['d', 'm'],
    representation: {
      kind: 'orbit',
      distance: 'd',
      pull: 'F',
      mass: 'm',
      planet: 'earth',
      moon: true,
    },
  },
  {
    id: 's.8.gravity-orbits~weight',
    title: 'Your weight on other worlds',
    use: 'Use this for “A 50 kg student weighs 490 N on Earth. What would she weigh on the moon?”',
    unitSystems: ['metric'],
    assumptions: [
      'Mass is how much matter you are made of: the same everywhere. Weight is gravity’s pull on it, in newtons.',
      'On Earth each kilogram is pulled with 9.8 N; on the moon with 1.6 N, so you would weigh about a sixth as much.',
      'A bigger planet does not always pull harder at its surface: Saturn is huge but spread out, so its surface pull is close to Earth’s.',
    ],
    variables: [
      {
        id: 'm',
        symbol: 'm',
        name: 'Mass',
        unit: 'kg',
        units: ['kg'],
        min: 1,
        max: 1000,
        step: 0.1,
      },
      {
        id: 'g',
        symbol: 'g',
        name: 'Pull on each kilogram',
        unit: 'N/kg',
        min: 1,
        max: 25,
        step: 0.1,
        allowed: WORLDS.map(([g]) => g),
      },
      {
        id: 'W',
        symbol: 'W',
        name: 'Weight',
        unit: 'N',
        units: ['N'],
        min: 0,
        max: 25000,
        step: 0.1,
      },
    ],
    relations: [weight.relation],
    steps: { [weight.relation.id]: weight.steps },
    example: { m: 50, g: 9.8, W: 490 },
    startWith: ['m', 'g'],
    representation: {
      kind: 'table',
      sweep: 'g',
      output: 'W',
      params: ['m'],
      rows: WORLDS.map(([g]) => g),
      rowNames: WORLDS.map(([, name]) => name),
    },
  },
  {
    id: 's.8.gravity-orbits~year-length',
    title: 'Farther out, longer year',
    use: 'Use this for “Mars is 1.5 times as far from the sun as Earth. How long is its year?”',
    unitSystems: ['metric'],
    assumptions: [
      'A year is one trip round the sun. Earth’s is 1 year at 1 AU.',
      'Farther from the sun the pull is weaker, so a planet moves slower and has farther to go.',
      'Kepler found the pattern 400 years ago: the year squared equals the distance cubed, in Earth years and AU.',
    ],
    variables: [
      {
        id: 'd',
        symbol: 'd',
        name: 'Distance from the sun',
        unit: 'AU',
        min: 0.3,
        max: 40,
        step: 0.01,
      },
      {
        id: 'T',
        symbol: 'T',
        name: 'Length of its year',
        unit: 'Earth years',
        min: 0.1,
        max: 300,
        step: 0.01,
        derived: true,
      },
    ],
    relations: [
      {
        id: 'T = √(d³)',
        display: '{T} = √({d}³)',
        vars: ['T', 'd'],
        residual: (v: Values) => v.T! ** 2 - v.d! ** 3,
        solve: { T: (v: Values) => Math.sqrt(v.d! ** 3), d: () => undefined },
      },
    ],
    steps: {
      'T = √(d³)': {
        T: {
          expr: '√({d}³)',
          how: 'Cube the distance, then take the square root: farther planets move slower on longer paths.',
        },
      },
    },
    example: { d: 1.52, T: Math.sqrt(1.52 ** 3) },
    startWith: ['d'],
    representation: {
      kind: 'table',
      sweep: 'd',
      output: 'T',
      params: [],
      rows: PLANETS.map(([d]) => d),
      rowNames: PLANETS.map(([, name]) => name),
    },
  },
];
