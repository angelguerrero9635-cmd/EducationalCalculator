/**
 * Gallery demos for the Grade 8 physical and space science pictures: the electromagnetic
 * spectrum, circuits with bulbs, the electromagnet and bar-magnet field lines, orbits and the
 * planets to scale. Spread into GALLERY_MODULES and GALLERY_LAYOUTS in gallery.ts; kept apart so
 * that file's other demos merge easily.
 */
import type { Values } from '@/engine/types';

import { whole } from './helpers';
import type { LayoutDef } from './layouts';
import type { ModuleDef } from './types';

/** `c = a × b` with plain steps (no written grid: the numbers run to scientific notation). */
const product = (
  c: string,
  a: string,
  b: string,
  how: [string, string, string],
  id = `${c} = ${a} × ${b}`,
) => ({
  relation: {
    id,
    display: `{${c}} = {${a}} × {${b}}`,
    vars: [c, a, b],
    residual: (v: Values) => v[c]! - v[a]! * v[b]!,
    solve: {
      [c]: (v: Values) => v[a]! * v[b]!,
      [a]: (v: Values) => (v[b] ? v[c]! / v[b]! : undefined),
      [b]: (v: Values) => (v[a] ? v[c]! / v[a]! : undefined),
    },
  },
  steps: {
    [c]: { expr: `{${a}} × {${b}}`, how: how[0], written: false as const },
    [a]: { expr: `{${c}} ÷ {${b}}`, how: how[1], written: false as const },
    [b]: { expr: `{${c}} ÷ {${a}}`, how: how[2], written: false as const },
  },
});

/** A branch's current: `i = V ÷ r`. */
const ohm = (i: string, r: string) => ({
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
const ohmSteps = (i: string, r: string) => ({
  [i]: {
    expr: `{V} ÷ {${r}}`,
    how: 'The branch gets the whole voltage: divide it by the resistance.',
  },
  V: { expr: `{${i}} × {${r}}`, how: 'Multiply the branch’s current by its resistance.' },
  [r]: { expr: `{V} ÷ {${i}}`, how: 'Divide the voltage by the branch’s current.' },
});
const sum = {
  relation: {
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
  steps: {
    I: { expr: '{I1} + {I2}', how: 'The branch currents join at the meter.' },
    I1: { expr: '{I} − {I2}', how: 'Take the second branch’s current from the total.' },
    I2: { expr: '{I} − {I1}', how: 'Take the first branch’s current from the total.' },
  },
};

export const S4D_GALLERY_MODULES: ModuleDef[] = [
  {
    id: 'g.em-spectrum',
    title: 'Electromagnetic spectrum',
    assumptions: [
      'Light, radio waves and X-rays are all electromagnetic waves.',
      'They all travel at the speed of light, c = 300,000,000 m/s.',
      'A shorter wavelength means a higher frequency. Drag the mark along the band.',
      'This demo stops at 10 nm, in the ultraviolet.',
    ],
    variables: [
      { id: 'L', symbol: 'λ', name: 'Wavelength', unit: 'm', min: 1e-8, max: 1000, step: 1e-9 },
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
          how: 'Divide the speed of light by the wavelength.',
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
    unitSystems: ['metric'],
    representation: { kind: 'spectrum', wavelength: 'L', frequency: 'f', speed: 300_000_000 },
  },
  {
    id: 'g.visible-light',
    title: 'Colors of visible light',
    assumptions: [
      'Visible light runs from red (about 700 nm) to violet (about 400 nm).',
      'A nanometer (nm) is a billionth of a meter.',
    ],
    variables: [
      { id: 'L', symbol: 'λ', name: 'Wavelength', unit: 'nm', min: 400, max: 700, step: 1 },
      { id: 'd', symbol: 'd', name: 'Shorter than red light by', unit: 'nm', min: 0, max: 300 },
    ],
    relations: [
      {
        id: 'd = 700 − λ',
        display: '{d} = 700 − {L}',
        vars: ['d', 'L'],
        residual: (v: Values) => v.d! - (700 - v.L!),
        solve: { d: (v: Values) => 700 - v.L!, L: (v: Values) => 700 - v.d! },
      },
    ],
    steps: {
      'd = 700 − λ': {
        d: { expr: '700 − {L}', how: 'Red light is about 700 nm long.' },
        L: { expr: '700 − {d}', how: 'Take the difference from red light’s 700 nm.' },
      },
    },
    example: { L: 530, d: 170 },
    startWith: ['L'],
    pictureLabels: ['d'],
    representation: { kind: 'spectrum', wavelength: 'L', meters: 1e-9 },
  },
  {
    id: 'g.series-circuit',
    title: 'Series circuit',
    assumptions: [
      'The bulbs are in one loop, so the same current goes through each.',
      'The resistances add: the current is the voltage divided by their total.',
      'The switch value s is 1 when it is closed and 0 when it is open. Tap the switch.',
    ],
    variables: [
      { id: 'V', symbol: 'V', name: 'Battery', unit: 'V', min: 0, max: 12, step: 0.5 },
      { id: 'R1', symbol: 'R₁', name: 'First bulb', unit: 'Ω', min: 1, max: 20, step: 0.5 },
      { id: 'R2', symbol: 'R₂', name: 'Second bulb', unit: 'Ω', min: 1, max: 20, step: 0.5 },
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
          how: 'Add the resistances, then divide the voltage by the total.',
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
    id: 'g.parallel-circuit',
    title: 'Parallel circuit',
    assumptions: [
      'Each bulb has its own branch across the battery, so each gets the whole voltage.',
      'Each branch’s current is the voltage divided by its resistance.',
      'The branch currents add up to the current through the meter.',
    ],
    variables: [
      { id: 'V', symbol: 'V', name: 'Battery', unit: 'V', min: 0, max: 12, step: 0.5 },
      { id: 'R1', symbol: 'R₁', name: 'First bulb', unit: 'Ω', min: 1, max: 20, step: 0.5 },
      { id: 'R2', symbol: 'R₂', name: 'Second bulb', unit: 'Ω', min: 1, max: 20, step: 0.5 },
      { id: 'I1', symbol: 'I₁', name: 'First branch', unit: 'A', min: 0, max: 12, step: 0.01 },
      { id: 'I2', symbol: 'I₂', name: 'Second branch', unit: 'A', min: 0, max: 12, step: 0.01 },
      { id: 'I', symbol: 'I', name: 'Current', unit: 'A', min: 0, max: 24, step: 0.01 },
    ],
    relations: [ohm('I1', 'R1'), ohm('I2', 'R2'), sum.relation],
    steps: {
      'I₁ = V ÷ R₁': ohmSteps('I1', 'R1'),
      'I₂ = V ÷ R₂': ohmSteps('I2', 'R2'),
      'I = I₁ + I₂': sum.steps,
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
    id: 'g.bulbs-in-series',
    title: 'More bulbs in series',
    assumptions: [
      'The bulbs are all the same and in one loop.',
      'Each bulb adds its resistance, so more bulbs let less current through.',
    ],
    variables: [
      { id: 'V', symbol: 'V', name: 'Battery', unit: 'V', min: 0, max: 12, step: 0.5 },
      { ...whole('n', 'n', 'Bulbs', 1, 4) },
      { id: 'R', symbol: 'R', name: 'Each bulb', unit: 'Ω', min: 1, max: 20, step: 0.5 },
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
];

export const S4D_GALLERY_LAYOUTS: LayoutDef[] = [];
