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

/**
 * Tenths or hundredths on a line from another whole number (R25): the page's own variables
 * (parts in one whole, parts from 0, the decimal). The first whole is a number, or `w`: the whole
 * just before the point, worked out from the parts.
 */
function decimalFrom(
  id: string,
  title: string,
  startWhole: number | 'w',
  wholes: number,
  example: Values,
): ModuleDef {
  const w = startWhole === 'w';
  return {
    id,
    title,
    assumptions: [
      'Cut each whole into 10 equal parts for tenths, or 100 for hundredths.',
      'Count the parts from 0: 26 tenths from 0 is 2.6.',
      w
        ? 'The line starts at the whole just before the point.'
        : `The line starts at ${startWhole}, so it shows only the wholes near the point.`,
    ],
    variables: [
      { ...whole('n', 'n', 'Parts from 0 to 1', 10, 100), allowed: [10, 100] },
      whole('k', 'k', 'Parts from 0', 0, 1000),
      { id: 'd', symbol: 'd', name: 'As a decimal', min: 0, max: 10, step: 0.01 },
      ...(w ? [{ ...whole('w', 'w', 'Whole before the point', 0, 10), derived: true }] : []),
    ],
    relations: [
      {
        id: 'd = k ÷ n',
        display: '{k}/{n} = {d}',
        vars: ['d', 'k', 'n'],
        residual: (v: Values) => v.d! - v.k! / v.n!,
        solve: {
          d: (v: Values) => v.k! / v.n!,
          k: (v: Values) => v.d! * v.n!,
          n: (v: Values) => (v.d ? v.k! / v.d : undefined),
        },
      },
      ...(w
        ? [
            {
              id: 'w = wholes in k/n',
              display: 'full wholes in {k}/{n}: {w}',
              vars: ['w', 'k', 'n'],
              residual: (v: Values) => v.w! - Math.floor(v.k! / v.n!),
              solve: {
                w: (v: Values) => Math.floor(v.k! / v.n!),
                k: () => undefined,
                n: () => undefined,
              },
            },
          ]
        : []),
    ],
    steps: {
      'd = k ÷ n': {
        d: { expr: '{k} ÷ {n}', how: 'Tenths: one place after the point. Hundredths: two.' },
        k: { expr: '{d} × {n}', how: 'Read the digits after the point as tenths or hundredths.' },
        n: { expr: '{k} ÷ {d}', how: 'How many of these parts make 1 whole?' },
      },
      ...(w
        ? {
            'w = wholes in k/n': {
              w: {
                expr: 'wholes in {k} parts of {n}',
                how: 'Every full set of parts makes 1 whole. The line starts there.',
              },
            },
          }
        : {}),
    },
    example,
    startWith: ['n', 'k'],
    representation: {
      kind: 'fractionLine',
      numerator: 'k',
      denominator: 'n',
      wholes,
      decimal: true,
      startWhole,
    },
  };
}

R2B_GALLERY_MODULES.push(
  // R25: the line from 1 to 3 in tenths with 2.6 marked.
  decimalFrom('g.decimal-line-from-whole', 'Tenths from 1 to 3', 1, 2, { n: 10, k: 26, d: 2.6 }),
  // R25 edge: hundredths on a line from the whole before the point, 7 to 9, with 7.84 marked.
  decimalFrom('g.decimal-line-from-whole-hundredths', 'Hundredths from 7 to 9', 'w', 2, {
    n: 100,
    k: 784,
    d: 7.84,
    w: 7,
  }),
);
