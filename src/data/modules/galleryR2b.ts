/**
 * Round-2 gallery demos (range raises on existing picture kinds, see pictureRequests.ts). Spread
 * into GALLERY_MODULES in gallery.ts; kept apart so that file's other demos merge easily.
 */
import type { Values } from '@/engine/types';

import { whole } from './helpers';
import type { ModuleDef } from './types';

/** Up to eight marks on a line plot of lengths from a fractional start (R22). */
const MARKS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

/**
 * A line plot of straw lengths in inches from a start that is itself a fraction (3 3/4), marked
 * every 1/2 or 1/4 inch (`m` fixed or a value), with `n` marks.
 */
function quarterPlot(
  id: string,
  title: string,
  n: number,
  m: 2 | 4 | 'm',
  example: Values,
): ModuleDef {
  const ids = MARKS.slice(0, n);
  const step = (v: Values) => (typeof m === 'number' ? m : v.m!);
  const length = (v: Values, x: string) =>
    Number((v.s! + ids.indexOf(x as (typeof MARKS)[number]) / step(v)).toFixed(6));
  const total = (v: Values) => Number(ids.reduce((t, x) => t + v[x]! * length(v, x), 0).toFixed(6));
  const terms = (v: Values) =>
    ids
      .filter((x) => v[x]! > 0)
      .map((x) => `${v[x]} × ${length(v, x)}`)
      .join(' + ') || '0';
  const list = ids.map((x) => `{${x}}`).join(', ');
  return {
    id,
    title,
    assumptions: [
      'Each X is one straw measured to the nearest mark.',
      typeof m === 'number'
        ? `The marks are 1/${m} inch apart, starting at a length that can be a fraction.`
        : 'The marks are 1/2 or 1/4 inch apart, starting at a length that can be a fraction.',
    ],
    variables: [
      {
        id: 's',
        symbol: 's',
        name: 'Shortest mark (in)',
        min: 0,
        max: 20,
        step: 0.25,
        multipleOf: 0.25,
      },
      ...(m === 'm' ? [{ ...whole('m', 'm', 'Marks in each inch', 2, 4), allowed: [2, 4] }] : []),
      ...ids.map((x, i) => whole(x, x, `Straws at mark ${i + 1}`, 0, 10)),
      { ...whole('T', 'T', 'Straws in all', 0, 80), derived: true },
      {
        id: 'S',
        symbol: 'S',
        name: 'All the lengths together (in)',
        min: 0,
        max: 2000,
        step: 0.125,
        derived: true,
      },
    ],
    relations: [
      {
        id: 'T = all the X marks',
        display: `${ids.map((x) => `{${x}}`).join(' + ')} = {T}`,
        vars: ['T', ...ids],
        residual: (v: Values) => v.T! - ids.reduce((t, x) => t + v[x]!, 0),
        solve: { T: (v: Values) => ids.reduce((t, x) => t + v[x]!, 0) },
      },
      {
        id: 'S = lengths',
        display:
          m === 'm'
            ? `the lengths from {s} in steps of 1/{m}, ${list} of each: {S}`
            : `the lengths from {s} in steps of 1/${m}, ${list} of each: {S}`,
        check: (v: Values) => `${terms(v)} = ${v.S}`,
        vars: ['S', 's', ...(m === 'm' ? ['m'] : []), ...ids],
        residual: (v: Values) => v.S! - total(v),
        solve: { S: total },
      },
    ],
    steps: {
      'T = all the X marks': {
        T: { expr: ids.map((x) => `{${x}}`).join(' + '), how: 'Count every X.' },
      },
      'S = lengths': {
        S: {
          expr: terms,
          how: 'Each length times the X’s above it, all added.',
          work: (v: Values) =>
            ids
              .filter((x) => v[x]! > 0)
              .map(
                (x) => `${v[x]} × ${length(v, x)} = ${Number((v[x]! * length(v, x)).toFixed(6))}`,
              ),
        },
      },
    },
    example,
    startWith: ['s', ...(m === 'm' ? ['m'] : []), ...ids],
    representation: {
      kind: 'linePlot',
      start: 's',
      marks: m,
      startParts: 4,
      unit: 'in',
      points: ids.map((x, i) => ({ var: x, at: i })),
    },
  };
}

export const R2B_GALLERY_MODULES: ModuleDef[] = [
  // R22: straws from 3 3/4 to 5 1/2 inches, a mark every 1/4 inch.
  quarterPlot('g.line-plot-quarter-start', 'Line plot from 3 3/4 inches', 8, 4, {
    s: 3.75,
    a: 1,
    b: 2,
    c: 0,
    d: 3,
    e: 1,
    f: 2,
    g: 0,
    h: 1,
    T: 10,
    S: 45.5,
  }),
  // R22 edge: half-inch marks from a quarter-inch start past 12, the marks' size a value.
  quarterPlot('g.line-plot-quarter-start-halves', 'Half-inch marks from 12 3/4 inches', 6, 'm', {
    s: 12.75,
    m: 2,
    a: 2,
    b: 1,
    c: 4,
    d: 0,
    e: 1,
    f: 3,
    T: 11,
    S: 154.25,
  }),
];
