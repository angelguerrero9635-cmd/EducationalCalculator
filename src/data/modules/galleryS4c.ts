/**
 * Gallery demos for the Grade 8 physics pictures: distance-time and speed-time graphs, a cart
 * pulled with mass blocks, two skaters pushing apart, and a roller coaster and a pendulum
 * trading potential and kinetic energy. Spread into GALLERY_MODULES in gallery.ts; kept apart
 * so that file merges easily.
 */
import type { Values } from '@/engine/types';

import { div } from './helpers';
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
];
