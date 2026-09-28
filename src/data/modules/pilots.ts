/**
 * Pilot modules for grades not built yet (Section 0). Each moves to its grade file when that
 * grade is written. Keyed by taxonomy skill id.
 */
import { div } from './helpers';
import type { ModuleDef } from './types';

export const PILOT_MODULES: ModuleDef[] = [
  {
    id: 'm.9.exponential-functions',
    assumptions: [
      'The amount changes by the same percent every time period (it compounds).',
      'A positive rate means growth; a negative rate means decay.',
      'All time periods are the same length.',
    ],
    variables: [
      { id: 'a', symbol: 'a', name: 'Starting amount', min: 0, max: 1000000 },
      { id: 'r', symbol: 'r', name: 'Rate per period', unit: '%', min: -100, max: 100, step: 1 },
      { id: 't', symbol: 't', name: 'Time periods', min: 0, max: 50, step: 1 },
      { id: 'y', symbol: 'y', name: 'Amount after t periods', min: 0, max: 1e12 },
    ],
    relations: [
      {
        id: 'y = a(1 + r/100)^t',
        display: '{y} = {a} × (1 + {r} ÷ 100)^{t}',
        vars: ['y', 'a', 'r', 't'],
        residual: (v) => v.y! - v.a! * (1 + v.r! / 100) ** v.t!,
        solve: {
          y: (v) => v.a! * (1 + v.r! / 100) ** v.t!,
          a: (v) => div(v.y!, (1 + v.r! / 100) ** v.t!),
          t: (v) => {
            const base = 1 + v.r! / 100;
            const ratio = v.y! / v.a!;
            if (!(base > 0) || base === 1 || !(ratio > 0)) return undefined;
            return Math.log(ratio) / Math.log(base);
          },
          r: (v) => {
            const ratio = v.y! / v.a!;
            if (v.t === 0 || !(ratio >= 0)) return undefined;
            return 100 * (ratio ** (1 / v.t!) - 1);
          },
        },
      },
    ],
    steps: {
      'y = a(1 + r/100)^t': {
        y: {
          expr: '{a} × (1 + {r} ÷ 100)^{t}',
          how: 'The growth factor is 1 + r/100. Multiply by it once per period, starting from a.',
        },
        a: {
          expr: '{y} ÷ (1 + {r} ÷ 100)^{t}',
          how: 'Divide both sides by the growth factor raised to t.',
        },
        t: {
          expr: 'ln({y} ÷ {a}) ÷ ln(1 + {r} ÷ 100)',
          how: 'Divide both sides by a. In Algebra 1, find t in the table where y is reached; with logarithms (Algebra 2), take the log of both sides to bring t down.',
        },
        r: {
          expr: '100 × (({y} ÷ {a})^(1 ÷ {t}) − 1)',
          how: 'Divide by a and take the t-th root to get the growth factor. Subtract 1 and write it as a percent.',
        },
      },
    },
    example: { a: 100, r: 10, t: 3, y: 133.1 },
    startWith: ['t', 'a', 'r'],
    representation: {
      kind: 'table',
      sweep: 't',
      output: 'y',
      params: ['a', 'r'],
      rows: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
  },
];
