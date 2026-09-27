/**
 * Gallery demos for options on existing picture kinds (bills with coins, the first n values of
 * a data set, inequalities, scaled boxes, numbered ratio axes, plotting a point, line plots of
 * lengths, a protractor with neither arm on 0). Spread into GALLERY_MODULES in gallery.ts; kept
 * apart so that file's other demos merge easily.
 */
import type { Relation, Values } from '@/engine/types';

import { whole } from './helpers';
import type { ModuleDef, StepText } from './types';

/** Bills and coins with what each is worth in cents. */
const MONEY = [
  { id: 't', name: '$10 bills', cents: 1000 },
  { id: 'f', name: '$5 bills', cents: 500 },
  { id: 'o', name: '$1 bills', cents: 100 },
  { id: 'q', name: 'Quarters', cents: 25 },
  { id: 'd', name: 'Dimes', cents: 10 },
  { id: 'p', name: 'Pennies', cents: 1 },
] as const;
/** One line per kind there is some of: "2 × 1000 = 2000". */
const partLines = (v: Values, skip?: string) =>
  MONEY.filter((m) => m.id !== skip && v[m.id]! > 0).map(
    (m) => `${v[m.id]} × ${m.cents} = ${v[m.id]! * m.cents}`,
  );
const worth = (v: Values, skip?: string) =>
  MONEY.reduce((s, m) => s + (m.id === skip ? 0 : m.cents * v[m.id]!), 0);

/** Up to ten data values; `n` says how many of them (from the first) are the data. */
const DATA = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] as const;
const ORDINAL = [
  'First',
  'Second',
  'Third',
  'Fourth',
  'Fifth',
  'Sixth',
  'Seventh',
  'Eighth',
  'Ninth',
  'Tenth',
];
const dataVariables = [
  ...DATA.map((id, i) => whole(id, id, `${ORDINAL[i]} value`, 0, 20)),
  whole('n', 'n', 'How many values', 3, 10),
];
const firstN = (v: Values) => DATA.slice(0, v.n!).map((id) => v[id]!);
const inOrder = (v: Values) => [...firstN(v)].sort((x, y) => x - y);
const medianOf = (s: number[]) =>
  s.length % 2 ? s[(s.length - 1) / 2]! : (s[s.length / 2 - 1]! + s[s.length / 2]!) / 2;
/** The values below the median and above it (the median itself left out when n is odd). */
const halves = (s: number[]) => [
  s.slice(0, Math.floor(s.length / 2)),
  s.slice(Math.ceil(s.length / 2)),
];
/** "median of 3, 5, 7" (or the one value when a half holds only one). */
const ofList = (what: string, xs: number[]) =>
  xs.length > 1 ? `${what} of ${xs.join(', ')}` : `${xs[0]}`;

/** A value read from the first n data values, with its step: the median, a quartile, … */
function stat(
  id: string,
  name: string,
  pick: (s: number[]) => { what: string; list: number[] },
  how: string,
): { relation: Relation; steps: Record<string, StepText> } {
  const value = (v: Values) => {
    const { what, list } = pick(inOrder(v));
    return what === 'median'
      ? medianOf(list)
      : what === 'least'
        ? Math.min(...list)
        : Math.max(...list);
  };
  return {
    relation: {
      id: `${id} = ${name}`,
      display: `${name} of the first {n} of ${DATA.map((x) => `{${x}}`).join(', ')}: {${id}}`,
      check: (v: Values) => `${ofList(pick(inOrder(v)).what, pick(inOrder(v)).list)} = ${v[id]}`,
      vars: [id, 'n', ...DATA],
      residual: (v: Values) => v[id]! - value(v),
      solve: {
        [id]: value,
        ...Object.fromEntries(['n', ...DATA].map((x) => [x, () => undefined])),
      },
    },
    steps: {
      [id]: {
        expr: (v: Values) => ofList(pick(inOrder(v)).what, pick(inOrder(v)).list),
        how,
        work: (v: Values) => [`In order: ${inOrder(v).join(', ')}`],
        written: false,
      },
    },
  };
}
const MEDIAN = stat(
  'M',
  'median',
  (s) => ({ what: 'median', list: s }),
  'Put the first values in order. Take the middle one, or halfway between the middle two.',
);
const BOX = [
  stat('L', 'least', (s) => ({ what: 'least', list: s }), 'The least value is first in order.'),
  stat(
    'Q',
    'first quartile',
    (s) => ({ what: 'median', list: halves(s)[0]! }),
    'The first quartile is the median of the values below the median.',
  ),
  MEDIAN,
  stat(
    'U',
    'third quartile',
    (s) => ({ what: 'median', list: halves(s)[1]! }),
    'The third quartile is the median of the values above the median.',
  ),
  stat(
    'G',
    'greatest',
    (s) => ({ what: 'greatest', list: s }),
    'The greatest value is last in order.',
  ),
];

/** Whether the test number t meets the inequality with sign s (1 <, 2 ≤, 3 >, 4 ≥) and bound b. */
const holds = (v: Values) =>
  [v.t! < v.b!, v.t! <= v.b!, v.t! > v.b!, v.t! >= v.b!][v.s! - 1] ?? false;

export const OPTION_GALLERY_MODULES: ModuleDef[] = [
  {
    id: 'g.bills-and-coins',
    title: 'Bills and coins',
    assumptions: [
      'A dollar is 100¢. A $5 bill is 500¢ and a $10 bill is 1,000¢.',
      'Count the bills first, then the coins worth the most.',
    ],
    variables: [
      ...MONEY.map((m) => whole(m.id, m.id, m.name, 0, 9)),
      { ...whole('T', 'T', 'In all', 0, 15000), unit: '¢' },
    ],
    relations: [
      {
        id: 'T = bills + coins',
        check: (v: Values) =>
          `${
            MONEY.map((m) => v[m.id]! * m.cents)
              .filter((x) => x > 0)
              .join(' + ') || '0'
          } = ${v.T}`,
        display: '{t} × $10 + {f} × $5 + {o} × $1 + {q} × 25¢ + {d} × 10¢ + {p} × 1¢ = {T}',
        vars: ['T', ...MONEY.map((m) => m.id)],
        residual: (v: Values) => v.T! - worth(v),
        solve: {
          T: (v: Values) => worth(v),
          ...Object.fromEntries(
            MONEY.map((m) => [m.id, (v: Values) => (v.T! - worth(v, m.id)) / m.cents]),
          ),
        },
      },
    ],
    steps: {
      'T = bills + coins': {
        T: {
          expr: '{t} × 1000 + {f} × 500 + {o} × 100 + {q} × 25 + {d} × 10 + {p}',
          how: 'Count the bills by 10s, 5s and 1s of dollars. Count on the coins in cents.',
          work: (v: Values) => partLines(v),
        },
        ...Object.fromEntries(
          MONEY.map((m) => [
            m.id,
            {
              expr: (v: Values) =>
                m.cents > 1 ? `({T} − ${worth(v, m.id)}) ÷ ${m.cents}` : `{T} − ${worth(v, m.id)}`,
              how: `Take away what the rest is worth. Count the ${m.cents}s in what is left.`,
              work: (v: Values) => [
                ...partLines(v, m.id),
                `${v.T} − ${worth(v, m.id)} = ${v.T! - worth(v, m.id)}`,
                ...(m.cents > 1 ? [`${v.T! - worth(v, m.id)} ÷ ${m.cents} = ${v[m.id]}`] : []),
              ],
            },
          ]),
        ),
      },
    },
    example: { t: 1, f: 1, o: 2, q: 3, d: 2, p: 4, T: 1799 },
    clearTo: { t: 0, f: 0, o: 0, q: 0, d: 0, p: 0 },
    startWith: ['t', 'f', 'o', 'q', 'd', 'p'],
    representation: {
      kind: 'coins',
      coins: MONEY.map((m) => ({ var: m.id, cents: m.cents, name: m.name })),
      total: 'T',
    },
  },
  {
    id: 'g.dot-plot-median',
    title: 'Median of 3 to 10 values',
    assumptions: [
      'Only the first values count: as many as “How many values” says.',
      'Put them in order. The median is the middle one, or halfway between the middle two.',
    ],
    variables: [
      ...dataVariables,
      { id: 'M', symbol: 'M', name: 'Median', min: 0, max: 20, step: 0.5, derived: true },
    ],
    relations: [MEDIAN.relation],
    steps: { [MEDIAN.relation.id]: MEDIAN.steps },
    example: { a: 6, b: 3, c: 9, d: 4, e: 6, f: 11, g: 2, h: 8, i: 5, j: 7, n: 7, M: 6 },
    startWith: [...DATA, 'n'],
    representation: { kind: 'dotPlot', data: [...DATA], count: 'n', median: 'M', min: 0, max: 12 },
  },
  {
    id: 'g.box-plot-data',
    title: 'Box plot from 3 to 10 values',
    assumptions: [
      'Only the first values count: as many as “How many values” says.',
      'The quartiles are the medians of the values below and above the median.',
    ],
    variables: [
      ...dataVariables,
      ...(
        [
          ['L', 'Least'],
          ['Q', 'First quartile'],
          ['M', 'Median'],
          ['U', 'Third quartile'],
          ['G', 'Greatest'],
        ] as const
      ).map(([id, name]) => ({ id, symbol: id, name, min: 0, max: 20, step: 0.5, derived: true })),
    ],
    relations: BOX.map((b) => b.relation),
    steps: Object.fromEntries(BOX.map((b) => [b.relation.id, b.steps])),
    example: {
      ...{ a: 12, b: 5, c: 9, d: 14, e: 7, f: 3, g: 10, h: 16, i: 8, j: 11, n: 8 },
      ...{ L: 3, Q: 6, M: 9.5, U: 13, G: 16 },
    },
    startWith: [...DATA, 'n'],
    representation: {
      kind: 'boxPlot',
      min: 'L',
      q1: 'Q',
      median: 'M',
      q3: 'U',
      max: 'G',
      range: [0, 20],
      data: [...DATA],
      count: 'n',
    },
  },
  {
    id: 'g.inequality-line',
    title: 'Inequality on a number line',
    notation: 'letters',
    assumptions: [
      'An open circle leaves the number out (< or >); a closed circle takes it in (≤ or ≥).',
      'The arrow covers every solution. A test number is true when it is on the arrow.',
    ],
    variables: [
      whole('b', 'b', 'Bound', -10, 10),
      whole('s', 's', 'Sign (1 <, 2 ≤, 3 >, 4 ≥)', 1, 4),
      whole('t', 't', 'Test number', -10, 10),
      { ...whole('h', 'h', 'True (1) or false (0)', 0, 1), derived: true },
    ],
    relations: [
      {
        id: 'h = test',
        display: 'test {t} with sign {s} and bound {b}: {h}',
        check: (v: Values) => `${holds(v) ? 1 : 0} = ${v.h}`,
        vars: ['h', 't', 's', 'b'],
        // Not a sum: NaN off the four signs, so the solver never treats it as one.
        residual: (v: Values) => ([1, 2, 3, 4].includes(v.s!) ? v.h! - (holds(v) ? 1 : 0) : NaN),
        solve: {
          h: (v: Values) => (holds(v) ? 1 : 0),
          t: () => undefined,
          s: () => undefined,
          b: () => undefined,
        },
      },
    ],
    steps: {
      'h = test': {
        h: {
          expr: (v: Values) => `${holds(v) ? 1 : 0}`,
          how: 'Is the test number on the arrow? True is 1, false is 0.',
          work: (v: Values) => [
            `${v.t} ${'<≤>≥'[v.s! - 1]} ${v.b} is ${holds(v) ? 'true' : 'false'}`,
          ],
          written: false,
        },
      },
    },
    example: { b: 3, s: 3, t: 5, h: 1 },
    startWith: ['b', 's', 't'],
    representation: {
      kind: 'integerLine',
      value: 'b',
      min: -5,
      max: 10,
      inequality: { sign: 's', test: 't', letter: 'x' },
    },
  },
];
