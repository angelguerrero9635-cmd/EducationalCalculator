/**
 * Round-2 gallery demos (range raises on existing picture kinds, see pictureRequests.ts). Spread
 * into GALLERY_MODULES in gallery.ts; kept apart so that file's other demos merge easily.
 */
import type { Values } from '@/engine/types';

import { whole } from './helpers';
import type { ModuleDef } from './types';

/** Ones and hundredths on hundredths grids, ones to 99 (m.4.decimals-intro, R23). */
const onesAndHundredths = (id: string, title: string, o: number, h: number): ModuleDef => ({
  id,
  title,
  assumptions: [
    'The grid has 100 squares, so each square is a hundredth.',
    'A number past 1 has ones before the point: 45.06 is 45 ones and 6 hundredths.',
  ],
  variables: [
    whole('h', 'h', 'Hundredths past the ones', 0, 99),
    whole('o', 'o', 'Ones', 0, 99),
    { id: 'd', symbol: 'd', name: 'As a decimal', min: 0, max: 99.99, step: 0.01 },
  ],
  relations: [
    {
      id: 'd = o + h ÷ 100',
      display: '{o} + {h}/100 = {d}',
      words: 'Ones + hundredths past the ones ÷ 100 = {d}',
      vars: ['d', 'o', 'h'],
      residual: (v: Values) => v.d! - v.o! - v.h! / 100,
      solve: {
        d: (v: Values) => Number((v.o! + v.h! / 100).toFixed(2)),
        h: (v: Values) => Math.round((v.d! - v.o!) * 100),
        o: (v: Values) => Number((v.d! - v.h! / 100).toFixed(2)),
      },
    },
  ],
  steps: {
    'd = o + h ÷ 100': {
      d: {
        expr: '{o} + {h} ÷ 100',
        how: 'The ones go before the point. The tenths digit, then the hundredths digit, after it.',
        work: (v) => [`${v.o} ones and ${v.h} hundredths = ${v.o}.${String(v.h).padStart(2, '0')}`],
      },
      h: {
        expr: '({d} − {o}) × 100',
        how: 'Read the two digits after the point as hundredths.',
        work: (v) => [`${v.d!.toFixed(2)}: ${v.h} hundredths after the point`],
      },
      o: {
        expr: '{d} − {h} ÷ 100',
        how: 'The ones are the digits before the point.',
        work: (v) => [`${v.d!.toFixed(2)}: ${v.o} before the point`],
      },
    },
  },
  example: { o, h, d: Number((o + h / 100).toFixed(2)) },
  startWith: ['o', 'h'],
  representation: { kind: 'grid100', percent: 'h', wholes: 'o', stack: true },
});

export const R2C_GALLERY_MODULES: ModuleDef[] = [
  onesAndHundredths('g.hundredths-ones', 'Ones and hundredths', 2, 34),
  onesAndHundredths('g.hundredths-many-ones', 'Many ones and hundredths', 45, 6),
  onesAndHundredths('g.hundredths-ones-99', 'Ones to 99', 99, 99),
];
