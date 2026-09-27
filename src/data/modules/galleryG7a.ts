/**
 * Gallery demos for Grade 7 ratios, percents and signed numbers: a proportional graph with its
 * table, tax and discount bars, percent change, zero pairs, signed jumps and the sign table.
 * Spread into GALLERY_MODULES in gallery.ts; kept apart so that file's other demos merge easily.
 */
import { formatNumber } from '@/engine/format';
import type { Values } from '@/engine/types';

import type { ModuleDef } from './types';

const fmt = (x: number) => formatNumber(x);
const exact = (x: number) => Number(x.toFixed(9));
const q = (a: number, b: number) => (b === 0 ? undefined : exact(a / b));

export const G7A_GALLERY_MODULES: ModuleDef[] = [
  {
    id: 'g.proportional-graph',
    title: 'Proportional relationship',
    notation: 'letters',
    assumptions: [
      'In a proportional relationship y = kx, y ÷ x is the same k in every row.',
      'The graph is a line through (0, 0), and it passes through (1, k).',
    ],
    variables: [
      {
        id: 'k',
        symbol: 'k',
        name: 'Constant of proportionality',
        min: 0.1,
        max: 20,
        step: 0.1,
      },
      { id: 'x', symbol: 'x', name: 'Pounds of apples', min: 0, max: 20, step: 0.5 },
      { id: 'y', symbol: 'y', name: 'Cost in dollars', min: 0, max: 400 },
    ],
    relations: [
      {
        id: 'y = kx',
        display: '{y} = {k}{x}',
        check: (v: Values) => `${fmt(v.y!)} = ${fmt(v.k!)} × ${fmt(v.x!)}`,
        vars: ['y', 'k', 'x'],
        residual: (v: Values) => v.y! - v.k! * v.x!,
        solve: {
          y: (v: Values) => exact(v.k! * v.x!),
          k: (v: Values) => q(v.y!, v.x!),
          x: (v: Values) => q(v.y!, v.k!),
        },
      },
    ],
    steps: {
      'y = kx': {
        y: { expr: '{k} × {x}', how: 'Multiply the pounds by the constant of proportionality.' },
        k: { expr: '{y} ÷ {x}', how: 'Divide both sides by x: k = y ÷ x.' },
        x: { expr: '{y} ÷ {k}', how: 'Divide both sides by k.' },
      },
    },
    example: { k: 2.5, x: 4, y: 10 },
    startWith: ['k', 'x'],
    representation: {
      kind: 'plot',
      x: { var: 'x', min: 0, max: 5 },
      y: { var: 'y', min: 0, max: 15 },
      params: ['k'],
      autoRange: true,
      unitRate: 'k',
      table: [0, 1, 2, 3],
    },
  },
];
