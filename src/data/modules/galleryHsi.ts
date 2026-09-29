/**
 * Grades 9–12 gallery demos (group HI; see pictureRequestsHs.ts and docs/RENDERINGS_HS.md).
 * Each demo stands in for a planned page: real variables, relations, steps and a use line, so
 * `scripts/promote-demo.mjs` can copy it into a grade file. Spread into gallery.ts.
 */
import type { Relation, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

/** A relation and its step text, built together so a demo lists both from one place. */
interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

/** Gathers rules into a module's `relations` and `steps`. */
const rules = (...rs: Rule[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

/** A value with a unit the unit menu keeps (never switched to another unit). */
const quantity = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  step = 0.01,
  more: Partial<VariableDef> = {},
): VariableDef => ({
  id,
  symbol,
  name,
  ...(unit ? { unit, units: [unit] } : {}),
  min,
  max,
  step,
  ...more,
});

// ─── H43 unitChain ───────────────────────────────────────────────────────────

/**
 * out = start × k, the chain's factors multiplied into k: `factorText` is how the steps write
 * them ("1000 × 100", or "1609.344/3600").
 */
const chainRule = (
  out: string,
  start: string,
  k: number,
  factorText: string,
  how: string,
): Rule => ({
  relation: {
    id: `${out} = ${start} × factors`,
    display: `{${out}} = {${start}} × ${factorText}`,
    vars: [out, start],
    residual: (v) => v[out]! - v[start]! * k,
    solve: { [out]: (v) => v[start]! * k, [start]: (v) => v[out]! / k },
  },
  steps: {
    [out]: { expr: `{${start}} × ${factorText}`, how },
    [start]: {
      expr: `{${out}}/(${factorText})`,
      how: 'Run the chain backwards: divide by the product of the factors.',
    },
  },
});

/** A rod on a ruler marked every `division` cm: its start, its end and its length. */
const rulerDemo = (
  id: string,
  title: string,
  use: string,
  assumptions: string[],
  division: number,
  example: { s: number; e: number; L: number },
): ModuleDef => {
  const step = division / 10;
  return {
    id,
    title,
    use,
    assumptions,
    unitSystems: ['metric'],
    variables: [
      quantity('s', 'x₁', 'Start of the rod', 'cm', 0, 10, step),
      quantity('e', 'x₂', 'End of the rod', 'cm', 0, 10, step),
      quantity('L', 'L', 'Length of the rod', 'cm', 0, 10, step),
    ],
    ...rules({
      relation: {
        id: 'L = x₂ − x₁',
        display: '{L} = {e} − {s}',
        vars: ['L', 'e', 's'],
        residual: (v) => v.L! - (v.e! - v.s!),
        solve: { L: (v) => v.e! - v.s!, e: (v) => v.L! + v.s!, s: (v) => v.e! - v.L! },
      },
      steps: {
        L: { expr: '{e} − {s}', how: 'The length is the end reading minus the start reading.' },
        e: { expr: '{L} + {s}', how: 'Add the length to the start reading.' },
        s: { expr: '{e} − {L}', how: 'Take the length away from the end reading.' },
      },
    }),
    example,
    startWith: ['s', 'e'],
    sliders: true,
    representation: {
      kind: 'unitChain',
      mode: 'ruler',
      start: 's',
      end: 'e',
      length: 'L',
      division,
      unit: 'cm',
      span: 10,
    },
  };
};

const MEASUREMENT: ModuleDef[] = [
  {
    id: 'g.s10-measurement-chain',
    title: 'Converting with a chain of factors',
    unitSystems: ['metric'],
    use: 'Use this to convert a length through more than one metric unit, cancelling units as you go.',
    assumptions: [
      '1 km = 1000 m and 1 m = 100 cm exactly, so each factor equals 1.',
      'Write each factor with the unit to cancel on the bottom.',
    ],
    variables: [
      quantity('d', 'd', 'Distance in kilometers', 'km', 0, 1000),
      quantity('c', 'c', 'Distance in centimeters', 'cm', 0, 1e8, 1),
    ],
    ...rules(
      chainRule(
        'c',
        'd',
        1e5,
        '1000 × 100',
        'Multiply by 1000 m per km, then by 100 cm per m: km and m cancel.',
      ),
    ),
    example: { d: 2.5, c: 250000 },
    startWith: ['d'],
    representation: {
      kind: 'unitChain',
      mode: 'chain',
      start: 'd',
      unit: 'km',
      factors: [
        { top: 1000, topUnit: 'm', bottom: 1, bottomUnit: 'km' },
        { top: 100, topUnit: 'cm', bottom: 1, bottomUnit: 'm' },
      ],
      result: 'c',
    },
  },
  {
    id: 'g.s10-measurement-rate',
    title: 'Converting a rate',
    use: 'Use this to change a rate’s top and bottom units at once, such as miles per hour to meters per second.',
    assumptions: [
      '1 mi = 1609.344 m and 1 h = 3600 s exactly.',
      'The hour is on the bottom of the rate, so its factor puts hours on top.',
    ],
    variables: [
      quantity('v', 'v', 'Speed in miles per hour', undefined, 0, 500, 0.1),
      quantity('u', 'u', 'Speed in meters per second', undefined, 0, 250, 0.0001),
    ],
    ...rules(
      chainRule(
        'u',
        'v',
        1609.344 / 3600,
        '1609.344/3600',
        'Multiply by 1609.344 m per mi and by 1 h per 3600 s: mi and h cancel.',
      ),
    ),
    example: { v: 65, u: (65 * 1609.344) / 3600 },
    startWith: ['v'],
    representation: {
      kind: 'unitChain',
      mode: 'chain',
      start: 'v',
      unit: 'mi',
      per: 'h',
      factors: [
        { top: 1609.344, topUnit: 'm', bottom: 1, bottomUnit: 'mi' },
        { top: 1, topUnit: 'h', bottom: 3600, bottomUnit: 's' },
      ],
      result: 'u',
    },
  },
  {
    id: 'g.s10-measurement-chain-long',
    title: 'A long chain: years to seconds',
    use: 'Use this for a conversion that needs several factors in a row, such as years to seconds.',
    assumptions: [
      'A year is taken as 365 days.',
      'Each factor cancels the unit the one before it left on top.',
    ],
    variables: [
      quantity('y', 'y', 'Time in years', undefined, 0, 100, 0.01),
      quantity('s', 's', 'Time in seconds', undefined, 0, 1e10, 1, { scientific: true }),
    ],
    ...rules(
      chainRule(
        's',
        'y',
        365 * 24 * 60 * 60,
        '365 × 24 × 60 × 60',
        'Multiply by 365 d per yr, 24 h per d, 60 min per h and 60 s per min.',
      ),
    ),
    example: { y: 1, s: 31536000 },
    startWith: ['y'],
    representation: {
      kind: 'unitChain',
      mode: 'chain',
      start: 'y',
      unit: 'yr',
      factors: [
        { top: 365, topUnit: 'd', bottom: 1, bottomUnit: 'yr' },
        { top: 24, topUnit: 'h', bottom: 1, bottomUnit: 'd' },
        { top: 60, topUnit: 'min', bottom: 1, bottomUnit: 'h' },
        { top: 60, topUnit: 's', bottom: 1, bottomUnit: 'min' },
      ],
      result: 's',
    },
  },
  rulerDemo(
    'g.s10-measurement-ruler',
    'Reading a ruler to the estimated digit',
    'Use this to read a length to one digit past the smallest marks, from a start that is not zero.',
    [
      'The ruler is marked every 0.1 cm (every millimeter).',
      'Every digit the marks give is certain; one more digit is estimated between two marks.',
    ],
    0.1,
    { s: 1, e: 4.47, L: 3.47 },
  ),
  rulerDemo(
    'g.s10-measurement-ruler-coarse',
    'A ruler marked only in centimeters',
    'Use this to see how a coarser ruler gives fewer significant figures.',
    [
      'The ruler is marked every 1 cm, so the tenths of a centimeter are estimated.',
      'A coarser scale gives a reading with fewer significant figures.',
    ],
    1,
    { s: 2, e: 8.3, L: 6.3 },
  ),
];

/** The mean of three trials, and its percent error against the accepted value. */
const trialRules = (): Rule[] => [
  {
    relation: {
      id: 'mean',
      display: '{m} = ({a} + {b} + {c})/3',
      vars: ['m', 'a', 'b', 'c'],
      residual: (v) => v.m! - (v.a! + v.b! + v.c!) / 3,
      solve: {
        m: (v) => (v.a! + v.b! + v.c!) / 3,
        a: (v) => 3 * v.m! - v.b! - v.c!,
        b: (v) => 3 * v.m! - v.a! - v.c!,
        c: (v) => 3 * v.m! - v.a! - v.b!,
      },
    },
    steps: {
      m: { expr: '({a} + {b} + {c})/3', how: 'Add the three trials and divide by 3.' },
      a: {
        expr: '3 × {m} − {b} − {c}',
        how: 'Three times the mean is the sum; take away the other two.',
      },
      b: {
        expr: '3 × {m} − {a} − {c}',
        how: 'Three times the mean is the sum; take away the other two.',
      },
      c: {
        expr: '3 × {m} − {a} − {b}',
        how: 'Three times the mean is the sum; take away the other two.',
      },
    },
  },
  {
    relation: {
      id: 'percent error',
      display: '{e} = |{m} − {t}|/{t} × 100',
      vars: ['e', 'm', 't'],
      residual: (v) => v.e! - (Math.abs(v.m! - v.t!) / v.t!) * 100,
      solve: {
        e: (v) => (v.t! === 0 ? undefined : (Math.abs(v.m! - v.t!) / v.t!) * 100),
        m: () => undefined,
        t: () => undefined,
      },
    },
    steps: {
      e: {
        expr: '|{m} − {t}|/{t} × 100',
        how: 'The error is how far the mean is from the accepted value, as a percent of it.',
      },
    },
  },
];

const trialDemo = (
  id: string,
  title: string,
  use: string,
  what: string,
  trials: [number, number, number],
  ring?: number,
): ModuleDef => {
  const m = (trials[0] + trials[1] + trials[2]) / 3;
  return {
    id,
    title,
    use,
    unitSystems: ['metric'],
    assumptions: [
      `Three students measured ${what}; the accepted value is 9.81 m/s².`,
      'Accurate: the mean is close to the accepted value. Precise: the trials are close to each other.',
    ],
    variables: [
      quantity('a', 'x₁', 'Trial 1', 'm/s²', 0, 20, 0.01),
      quantity('b', 'x₂', 'Trial 2', 'm/s²', 0, 20, 0.01),
      quantity('c', 'x₃', 'Trial 3', 'm/s²', 0, 20, 0.01),
      quantity('m', 'x̄', 'Mean', 'm/s²', 0, 20, 0.0001),
      quantity('t', 'A', 'Accepted value', 'm/s²', 0.01, 20, 0.01),
      quantity('e', 'E', 'Percent error', '%', 0, 1000, 0.0001),
    ],
    ...rules(...trialRules()),
    example: {
      a: trials[0],
      b: trials[1],
      c: trials[2],
      m,
      t: 9.81,
      e: (Math.abs(m - 9.81) / 9.81) * 100,
    },
    startWith: ['a', 'b', 'c', 't'],
    representation: {
      kind: 'unitChain',
      mode: 'target',
      trials: ['a', 'b', 'c'],
      accepted: 't',
      unit: 'm/s²',
      mean: 'm',
      error: 'e',
      ...(ring ? { ring } : {}),
    },
  };
};

MEASUREMENT.push(
  trialDemo(
    'g.s10-measurement-accurate-precise',
    'Accurate and precise',
    'Use this to judge a set of trials that agree with each other and with the accepted value.',
    'the acceleration of a falling ball',
    [9.8, 9.83, 9.78],
  ),
  trialDemo(
    'g.s10-measurement-precise-not-accurate',
    'Precise but not accurate',
    'Use this for trials that agree with each other but are all off in the same direction.',
    'the acceleration of a falling ball with a slow timer',
    [9.5, 9.52, 9.48],
  ),
  trialDemo(
    'g.s10-measurement-neither',
    'Neither accurate nor precise',
    'Use this for trials scattered far from each other and from the accepted value.',
    'the acceleration of a falling ball timed by hand',
    [9.3, 10.2, 9.0],
    2,
  ),
);

export const HSI_GALLERY_MODULES: ModuleDef[] = [...MEASUREMENT];
export const HSI_GALLERY_LAYOUTS: LayoutDef[] = [];
