/**
 * Gallery demos for options on existing picture kinds (bills with coins, the first n values of
 * a data set, inequalities, scaled boxes, numbered ratio axes, plotting a point, line plots of
 * lengths, a protractor with neither arm on 0). Spread into GALLERY_MODULES in gallery.ts; kept
 * apart so that file's other demos merge easily.
 */
import type { Values } from '@/engine/types';

import { whole } from './helpers';
import type { ModuleDef } from './types';

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
];
