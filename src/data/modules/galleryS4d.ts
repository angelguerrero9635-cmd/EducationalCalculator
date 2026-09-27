/**
 * Gallery demos for the Grade 8 physical and space science pictures: the electromagnetic
 * spectrum, circuits with bulbs, the electromagnet and bar-magnet field lines, orbits and the
 * planets to scale. Spread into GALLERY_MODULES and GALLERY_LAYOUTS in gallery.ts; kept apart so
 * that file's other demos merge easily.
 */
import type { Values } from '@/engine/types';

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
];

export const S4D_GALLERY_LAYOUTS: LayoutDef[] = [];
