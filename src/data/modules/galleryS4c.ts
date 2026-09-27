/**
 * Gallery demos for the Grade 8 physics pictures: distance-time and speed-time graphs, a cart
 * pulled with mass blocks, two skaters pushing apart, and a roller coaster and a pendulum
 * trading potential and kinetic energy. Spread into GALLERY_MODULES in gallery.ts; kept apart
 * so that file merges easily.
 */
import type { Values } from '@/engine/types';

import { atLeast, div } from './helpers';
import type { ModuleDef } from './types';

const T = { id: 't', symbol: 't', name: 'Time', unit: 's', min: 0, max: 20, step: 0.5 };
const D = { id: 'd', symbol: 'd', name: 'Distance', unit: 'm', min: 0, max: 400 };

/** d = v × t, with its steps. */
const steady = {
  relation: {
    id: 'd = v × t',
    display: '{d} = {v} × {t}',
    vars: ['d', 'v', 't'],
    residual: (v: Values) => v.d! - v.v! * v.t!,
    solve: {
      d: (v: Values) => v.v! * v.t!,
      v: (v: Values) => div(v.d!, v.t!),
      t: (v: Values) => div(v.d!, v.v!),
    },
  },
  steps: {
    d: { expr: '{v} × {t}', how: 'Each second covers v meters: multiply by the seconds.' },
    v: { expr: '{d} ÷ {t}', how: 'Speed is the slope: the rise (distance) over the run (time).' },
    t: { expr: '{d} ÷ {v}', how: 'Divide the distance by the meters covered each second.' },
  },
};

/** F = m × a, with its steps. */
const newton2 = {
  relation: {
    id: 'F = m × a',
    display: '{F} = {m} × {a}',
    vars: ['F', 'm', 'a'],
    residual: (v: Values) => v.F! - v.m! * v.a!,
    solve: {
      F: (v: Values) => v.m! * v.a!,
      m: (v: Values) => div(v.F!, v.a!),
      a: (v: Values) => div(v.F!, v.m!),
    },
  },
  steps: {
    F: { expr: '{m} × {a}', how: 'More mass or more acceleration needs more force.' },
    m: { expr: '{F} ÷ {a}', how: 'Divide the force by the acceleration it gives.' },
    a: { expr: '{F} ÷ {m}', how: 'The same pull speeds up a heavier cart less.' },
  },
};

/** Gravity's pull on each kilogram, in N/kg. */
const G = 9.8;

/**
 * Energy on a coaster or a pendulum: PE = m × g × h, the total m × g × top (it all starts as
 * potential energy), KE = total − PE; with `speed`, KE = 1/2 × m × v² too.
 */
function energyModule(
  id: string,
  title: string,
  track: 'coaster' | 'pendulum',
  what: string,
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
    title,
    assumptions: [
      `The ${what} starts at rest at the top, so all its energy starts as potential energy.`,
      'Friction and air are too small to count, so the total energy stays the same.',
      'Potential energy is m × g × h, with g = 9.8 N/kg; kinetic energy is the rest.',
    ],
    variables: [
      {
        id: 'm',
        symbol: 'm',
        name: 'Mass',
        unit: 'kg',
        min: limits.m[0],
        max: limits.m[1],
        step: 0.5,
      },
      {
        id: 'H',
        symbol: 'H',
        name: 'Top height',
        unit: 'm',
        min: limits.top[0],
        max: limits.top[1],
        step: 0.1,
      },
      {
        id: 'h',
        symbol: 'h',
        name: 'Height now',
        unit: 'm',
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
      ...(speed
        ? [
            {
              id: 'KE = 1/2 × m × v²',
              display: '{KE} = 1/2 × {m} × {v}²',
              vars: ['KE', 'm', 'v'],
              residual: (v: Values) => v.KE! - (v.m! * v.v! ** 2) / 2,
              solve: {
                v: (v: Values) =>
                  v.m! > 0 && v.KE! >= 0 ? Math.sqrt((2 * v.KE!) / v.m!) : undefined,
                KE: (v: Values) => (v.m! * v.v! ** 2) / 2,
                m: (v: Values) => div(2 * v.KE!, v.v! ** 2),
              },
            },
          ]
        : []),
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
      ...(speed
        ? {
            'KE = 1/2 × m × v²': {
              v: {
                expr: '√(2 × {KE} ÷ {m})',
                how: 'Double the kinetic energy, divide by the mass, take the root.',
              },
              KE: { expr: '1/2 × {m} × {v}²', how: 'Half the mass times the speed squared.' },
              m: { expr: '2 × {KE} ÷ {v}²', how: 'Double the kinetic energy and divide by v².' },
            },
          }
        : {}),
    },
    example: { m, H, h, PE, KE, E, ...(speed ? { v: Math.sqrt((2 * KE) / m) } : {}) },
    startWith: ['m', 'H', 'h'],
    unitSystems: ['metric'],
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

export const S4C_GALLERY_MODULES: ModuleDef[] = [
  {
    id: 'g.distance-time',
    title: 'Distance-time graph',
    assumptions: [
      'The walker moves at a steady speed v, starting at 0 m.',
      'The graph’s slope, rise over run, is the speed.',
    ],
    variables: [
      T,
      { id: 'v', symbol: 'v', name: 'Speed', unit: 'm/s', min: 0, max: 20, step: 0.5 },
      D,
    ],
    relations: [steady.relation],
    steps: { 'd = v × t': steady.steps },
    example: { t: 4, v: 3, d: 12 },
    startWith: ['v', 't'],
    unitSystems: ['metric'],
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
    id: 'g.walk-graph',
    title: 'A walk in three parts',
    assumptions: [
      'The walker goes out at a steady speed v for t seconds.',
      'Then she stands still for 3 s, and walks back at 0.25 m/s for 4 s.',
      'A flat part of the graph is standing still; a falling part is walking back.',
    ],
    variables: [
      { ...T, min: 2, max: 8 },
      { id: 'v', symbol: 'v', name: 'Speed', unit: 'm/s', min: 0.5, max: 2, step: 0.25 },
      { ...D, min: 1, max: 16 },
    ],
    relations: [steady.relation],
    steps: { 'd = v × t': steady.steps },
    example: { t: 4, v: 1, d: 4 },
    startWith: ['v', 't'],
    unitSystems: ['metric'],
    representation: {
      kind: 'motionGraph',
      graph: 'distance',
      time: 't',
      speed: 'v',
      distance: 'd',
      extent: { time: 14, value: 5 },
      then: [
        { time: 3, speed: 0 },
        { time: 4, speed: -0.25 },
      ],
    },
  },
  {
    id: 'g.speed-time',
    title: 'Speed-time graph',
    assumptions: [
      'The cart speeds up by the same amount each second: a steady acceleration a.',
      'The graph’s slope is the acceleration; the area under it is the distance.',
    ],
    variables: [
      T,
      {
        id: 'u',
        symbol: 'v₀',
        name: 'Starting speed',
        unit: 'm/s',
        min: 0,
        max: 20,
        step: 0.5,
      },
      { id: 'a', symbol: 'a', name: 'Acceleration', unit: 'm/s²', min: 0, max: 10, step: 0.5 },
      { id: 'v', symbol: 'v', name: 'Final speed', unit: 'm/s', min: 0, max: 220, derived: true },
      { ...D, max: 2400, derived: true },
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
    unitSystems: ['metric'],
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
  {
    id: 'g.cart-force',
    title: 'A cart pulled by a force',
    assumptions: [
      'The rope pulls the cart with a net force F; friction is too small to count.',
      'Each metal block on the cart is 1 kg, and the mass m counts the blocks.',
      'F = m × a: 1 N speeds up 1 kg by 1 m/s every second.',
    ],
    variables: [
      { id: 'F', symbol: 'F', name: 'Pull', unit: 'N', min: 0, max: 400, step: 1 },
      { id: 'm', symbol: 'm', name: 'Mass', unit: 'kg', min: 1, max: 20, step: 0.5 },
      { id: 'a', symbol: 'a', name: 'Acceleration', unit: 'm/s²', min: 0, max: 20, step: 0.5 },
    ],
    relations: [newton2.relation],
    steps: { 'F = m × a': newton2.steps },
    example: { m: 4, a: 2.5, F: 10 },
    startWith: ['m', 'a'],
    unitSystems: ['metric'],
    representation: {
      kind: 'force',
      object: 'cart',
      block: 1,
      force: 'F',
      mass: 'm',
      acceleration: 'a',
      forceExtent: 20,
      accelerationExtent: 5,
    },
  },
  {
    id: 'g.skaters',
    title: 'Two skaters push apart',
    assumptions: [
      'The ice is smooth enough that friction doesn’t count.',
      'When one skater pushes the other, the other pushes back just as hard (the third law).',
      'Each skater speeds up by the push ÷ its own mass (the second law).',
    ],
    variables: [
      { id: 'F', symbol: 'F', name: 'Push', unit: 'N', min: 0, max: 400, step: 5 },
      { id: 'm1', symbol: 'm₁', name: 'Mass of A', unit: 'kg', min: 20, max: 100, step: 1 },
      { id: 'm2', symbol: 'm₂', name: 'Mass of B', unit: 'kg', min: 20, max: 100, step: 1 },
      { id: 'a1', symbol: 'a₁', name: 'Acceleration of A', unit: 'm/s²', min: 0, max: 20 },
      { id: 'a2', symbol: 'a₂', name: 'Acceleration of B', unit: 'm/s²', min: 0, max: 20 },
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
    unitSystems: ['metric'],
    representation: {
      kind: 'skaters',
      force: 'F',
      masses: ['m1', 'm2'],
      accelerations: ['a1', 'a2'],
    },
  },
  energyModule(
    'g.roller-coaster',
    'Roller coaster energy',
    'coaster',
    'car',
    { m: [50, 1000], top: [5, 60] },
    { m: 200, H: 30, h: 12 },
    true,
  ),
  energyModule(
    'g.pendulum',
    'Pendulum energy',
    'pendulum',
    'bob',
    { m: [0.5, 10], top: [0.1, 2] },
    { m: 2, H: 0.5, h: 0.2 },
    false,
  ),
];
