/**
 * Grade 6 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 *
 * Pages name their values in words, as Grades 3–5 do, except where the standard is about
 * letters (6.EE, the area formulas, the cube formulas): those set `notation: 'letters'`.
 */
import { formatNumber, superscript } from '@/engine/format';
import type { Values } from '@/engine/types';

import { div, primeFactors, whole } from '../helpers';
import type { ModuleDef } from '../types';
import { decimalColumns, decimalLongDivision, decimalMultiply, longDivision } from '../written';

const fmt = (x: number) => formatNumber(x);
/** A number as the steps show it (rounded like `fmt`), to do arithmetic on what is written. */
const shownNum = (x: number) => Number(fmt(x).replace(/,/g, '').replace('−', '-'));
/** Exact to 9 places: 7.5 ÷ 6 is 1.25, not 1.2499999999. */
const exact = (x: number) => Number(x.toFixed(9));
const thousandths = (x: number) => Number(x.toFixed(3));
/** The exact quotient before a price is rounded to the cent ("10 ÷ 3 = 3.3333"), else nothing. */
const subCent = (x: number, sum: string) =>
  Math.abs(x * 100 - Math.round(x * 100)) < 1e-6 ? [] : [`${sum} = ${formatNumber(x)}`];
const q = (a: number, b: number) => (b === 0 ? undefined : exact(a / b));
const gcd = (a: number, b: number): number =>
  !Number.isFinite(a) || !Number.isFinite(b) ? 1 : b === 0 ? a : gcd(b, a % b);
const lcm = (a: number, b: number) => (a * b) / gcd(a, b);
/** How many digits after the point a decimal has (2.35 → 2, 3 → 0). */
const places = (x: number) => (String(exact(x)).split('.')[1] ?? '').length;
const factorsOf = (n: number) =>
  Array.from({ length: n }, (_, i) => i + 1).filter((k) => n % k === 0);
/** "8/12 = 2/3" (or "0/9 = 0", "12/4 = 3") when a fraction simplifies by the GCF, else nothing. */
const simplest = (top: number, bottom: number) => {
  const g = gcd(top, bottom);
  if (g <= 1) return '';
  return bottom / g === 1
    ? `${top}/${bottom} = ${top / g}`
    : `${top}/${bottom} = ${top / g}/${bottom / g}`;
};
/** A fraction as a mixed number when it is more than 1: 9/4 → "2 1/4". */
const mixed = (top: number, bottom: number) => {
  const g = gcd(top, bottom) || 1;
  const [t, b] = [top / g, bottom / g];
  if (b === 1) return fmt(t);
  const w = Math.floor(t / b);
  return w ? `${w} ${t - w * b}/${b}` : `${t}/${b}`;
};
/**
 * Dividing by a decimal: both numbers times the same power of ten, so the divisor is whole
 * (1.26 ÷ 0.3 = 12.6 ÷ 3).
 */
const wholeDivisor = (n: number, d: number) => {
  const k = 10 ** places(d);
  return { k, n: exact(n * k), d: exact(d * k) };
};
/** Prime factors with exponents: [2, 2, 2, 3] → "2^3 × 3". */
const powers = (primes: number[]) => {
  const counts = new Map<number, number>();
  for (const p of primes) counts.set(p, (counts.get(p) ?? 0) + 1);
  return [...counts].map(([p, k]) => (k > 1 ? `${p}^${k}` : String(p))).join(' × ');
};

/** Negative numbers written with a true minus: −4. */
const sgn = (x: number) => (x < 0 ? `−${fmt(-x)}` : fmt(x));
/** A constant after a term: "+ 5" or "− 3". */
const plusMinus = (k: number) => (k < 0 ? `− ${fmt(-k)}` : `+ ${fmt(k)}`);
/**
 * The distance between two numbers on a line, by their distances from 0 (6.NS.8): opposite
 * sides add ("|−4| + |5| = 4 + 5 = 9"), the same side subtracts ("|−7| − |−2| = 5").
 */
const apartLine = (a: number, b: number) => {
  const [lo, hi] = [Math.min(a, b), Math.max(a, b)];
  if (lo === hi) return `${sgn(lo)} to ${sgn(hi)} is 0`;
  if (lo < 0 && hi > 0)
    return `|${sgn(lo)}| + |${sgn(hi)}| = ${fmt(-lo)} + ${fmt(hi)} = ${fmt(hi - lo)}`;
  if (lo === 0 || hi === 0) return `|${sgn(lo === 0 ? hi : lo)}| = ${fmt(hi - lo)}`;
  const [far, near] = hi <= 0 ? [lo, hi] : [hi, lo];
  return `|${sgn(far)}| − |${sgn(near)}| = ${fmt(Math.abs(far))} − ${fmt(Math.abs(near))} = ${fmt(hi - lo)}`;
};
/** Where the two numbers sit, said before the distance line. */
const sidesLine = (a: number, b: number) =>
  a < 0 !== b < 0 && a !== 0 && b !== 0
    ? `${sgn(a)} and ${sgn(b)} are on opposite sides of 0: add their distances from 0.`
    : a === 0 || b === 0
      ? `One of them is 0: the distance is the other one's distance from 0.`
      : `${sgn(a)} and ${sgn(b)} are on the same side of 0: subtract their distances from 0.`;
/** The quadrant of a point, 1–4; 0 on an axis. */
const quadrant = (x: number, y: number) =>
  x === 0 || y === 0 ? 0 : x > 0 ? (y > 0 ? 1 : 4) : y > 0 ? 2 : 3;
/** The six data values of a median page. */
/** A data set of 3 to 10 values: the ids, the count and the values that are in the set. */
const DATA = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
const ORDINALS = [
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
const COUNT = whole('n', 'n', 'Number of values', 3, 10);
const DATA_VARS = DATA.map((id, i) => ({
  id,
  symbol: id,
  name: `${ORDINALS[i]} value`,
  min: 0,
  max: 1000,
  countedBy: { count: 'n', index: i + 1 },
}));
const counted = (v: Values) => DATA.slice(0, v.n);
/** The values as the step text lists them: "{a}, {b}, {c}". */
const listed = (v: Values) =>
  counted(v)
    .map((id) => `{${id}}`)
    .join(', ');
const dataOf = (v: Values) => counted(v).map((id) => v[id]!);
const sumOf = (xs: number[]) => xs.reduce((t, x) => t + x, 0);
/** The mean distance of the values from the mean m. */
const madOf = (v: Values) => sumOf(dataOf(v).map((x) => Math.abs(x - v.m!))) / v.n!;
/** The middle value in order, or halfway between the middle two. */
const median = (xs: number[]) => {
  const s = [...xs].sort((x, y) => x - y);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2]! : exact((s[n / 2 - 1]! + s[n / 2]!) / 2);
};
/** "mode: 5", "modes: 3 and 7" or "no mode" (every value once). */
const modeText = (xs: number[]) => {
  const counts = new Map<number, number>();
  for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
  const most = Math.max(...counts.values());
  if (most === 1) return 'no mode: every value appears once';
  const modes = [...counts].filter(([, k]) => k === most).map(([x]) => fmt(x));
  return modes.length === 1 ? `mode: ${modes[0]}` : `modes: ${modes.join(' and ')}`;
};
const DENOMS = [1, 2, 3, 4, 5, 6, 8, 10, 12];

const modules: (ModuleDef | ModuleDef[])[] = [
  // ── Ratios and ratio tables (6.RP.1, 6.RP.3a) ──
  {
    id: 'm.6.ratios',
    sliders: false,
    equation: '{a} : {b} = {x} : {y}',
    assumptions: [
      'Equivalent ratios multiply both parts by the same number.',
      'Adding the same number to both parts does not keep the ratio.',
      'The order matters: 3:2 is flour to milk, not milk to flour.',
      'Parts of the ratio are whole numbers to 50.',
    ],
    variables: [
      whole('a', 'a', 'First part of the ratio', 1, 50),
      whole('b', 'b', 'Second part of the ratio', 1, 50),
      { id: 'k', symbol: 'k', name: 'Multiplier', min: 0.1, max: 100, step: 0.1 },
      { id: 'x', symbol: 'x', name: 'First amount', min: 0.1, max: 5000 },
      { id: 'y', symbol: 'y', name: 'Second amount', min: 0.1, max: 5000 },
    ],
    relations: [
      {
        id: 'x = a × k',
        display: '{a} × {k} = {x}',
        words: 'First part × multiplier = first amount',
        vars: ['x', 'a', 'k'],
        residual: (v: Values) => v.x! - v.a! * v.k!,
        solve: {
          x: (v: Values) => exact(v.a! * v.k!),
          k: (v: Values) => q(v.x!, v.a!),
          a: (v: Values) => q(v.x!, v.k!),
        },
      },
      {
        id: 'y = b × k',
        display: '{b} × {k} = {y}',
        words: 'Second part × multiplier = second amount',
        vars: ['y', 'b', 'k'],
        residual: (v: Values) => v.y! - v.b! * v.k!,
        solve: {
          y: (v: Values) => exact(v.b! * v.k!),
          k: (v: Values) => q(v.y!, v.b!),
          b: (v: Values) => q(v.y!, v.k!),
        },
      },
    ],
    steps: {
      'x = a × k': {
        x: { expr: '{a} × {k}', how: 'Multiply the first part by the same number as the second.' },
        k: {
          expr: '{x} ÷ {a}',
          how: 'How many times bigger is the first amount than its part? Divide to find out.',
        },
        a: {
          expr: '{x} ÷ {k}',
          how: 'Divide the first amount by the number both were multiplied by.',
        },
      },
      'y = b × k': {
        y: {
          expr: '{b} × {k}',
          how: 'Multiply the second part by the same number, so the ratio stays the same.',
        },
        k: {
          expr: '{y} ÷ {b}',
          how: 'How many times bigger is the second amount than its part? Divide to find out.',
        },
        b: {
          expr: '{y} ÷ {k}',
          how: 'Divide the second amount by the number both were multiplied by.',
        },
      },
    },
    example: { a: 3, b: 2, k: 4, x: 12, y: 8 },
    startWith: ['a', 'b', 'x'],
    representation: {
      kind: 'ratioTable',
      first: 'a',
      second: 'b',
      times: 'k',
      amounts: ['x', 'y'],
      graph: true,
    },
  },
  {
    id: 'm.6.ratios~tape',
    sliders: true,
    title: 'Part-part-whole ratios',
    use: 'Use this for “The ratio of tokens is 8 to 7. There are 135 in all. How many more?”',
    assumptions: [
      'Every box in the tape is worth the same amount.',
      '“How many more” is the bigger amount minus the smaller: the extra boxes times what one is worth.',
      'Parts of the ratio are whole numbers to 20.',
    ],
    variables: [
      whole('a', 'a', 'First part of the ratio', 1, 20),
      whole('b', 'b', 'Second part of the ratio', 1, 20),
      { ...whole('n', 'n', 'Parts in all', 2, 40), derived: true },
      {
        id: 'u',
        symbol: 'u',
        name: 'One part is worth',
        min: 0,
        max: 200000,
        fraction: 40,
        derived: true,
      },
      { id: 'x', symbol: 'x', name: 'First amount', min: 0, max: 200000 },
      { id: 'y', symbol: 'y', name: 'Second amount', min: 0, max: 200000 },
      { id: 't', symbol: 't', name: 'Total', min: 0, max: 400000 },
      { id: 'd', symbol: 'd', name: 'How many more in the bigger', min: 0, max: 200000 },
    ],
    relations: [
      {
        id: 'n = a + b',
        display: '{a} + {b} = {n}',
        words: 'First part + second part = parts in all',
        vars: ['n', 'a', 'b'],
        residual: (v: Values) => v.n! - v.a! - v.b!,
        solve: {
          n: (v: Values) => v.a! + v.b!,
          a: (v: Values) => v.n! - v.b!,
          b: (v: Values) => v.n! - v.a!,
        },
      },
      {
        id: 't = n × u',
        display: '{t} ÷ {n} = {u}',
        words: 'Total ÷ parts in all = one part is worth',
        check: (v: Values) => `${formatNumber(v.u!, { fraction: 40 })} × ${v.n} = ${fmt(v.t!)}`,
        vars: ['t', 'n', 'u'],
        residual: (v: Values) => v.t! - v.n! * v.u!,
        solve: {
          u: (v: Values) => q(v.t!, v.n!),
          t: (v: Values) => exact(v.n! * v.u!),
          n: () => undefined,
        },
      },
      {
        id: 'x = a × u',
        display: '{a} × {u} = {x}',
        words: 'First part × one part is worth = first amount',
        vars: ['x', 'a', 'u'],
        residual: (v: Values) => v.x! - v.a! * v.u!,
        solve: {
          x: (v: Values) => exact(v.a! * v.u!),
          u: (v: Values) => q(v.x!, v.a!),
          a: () => undefined,
        },
      },
      {
        id: 'y = b × u',
        display: '{b} × {u} = {y}',
        words: 'Second part × one part is worth = second amount',
        vars: ['y', 'b', 'u'],
        residual: (v: Values) => v.y! - v.b! * v.u!,
        solve: {
          y: (v: Values) => exact(v.b! * v.u!),
          u: (v: Values) => q(v.y!, v.b!),
          b: () => undefined,
        },
      },
      {
        id: 'd = extra boxes × u',
        display: '{a} and {b} boxes differ by some; that many × {u} = {d}',
        words: '(Bigger part − smaller part) × one part is worth = how many more',
        check: (v: Values) =>
          `(${Math.max(v.a!, v.b!)} − ${Math.min(v.a!, v.b!)}) × ${formatNumber(v.u!, { fraction: 40 })} = ${fmt(v.d!)}`,
        vars: ['d', 'b', 'a', 'u'],
        residual: (v: Values) => v.d! - Math.abs(v.b! - v.a!) * v.u!,
        solve: {
          d: (v: Values) => exact(Math.abs(v.b! - v.a!) * v.u!),
          u: (v: Values) => q(v.d!, Math.abs(v.b! - v.a!)),
          a: () => undefined,
          b: () => undefined,
        },
      },
    ],
    steps: {
      'n = a + b': {
        n: { expr: '{a} + {b}', how: 'Count the boxes in both tapes.' },
        a: { expr: '{n} − {b}', how: 'Take the second part from the parts in all.' },
        b: { expr: '{n} − {a}', how: 'Take the first part from the parts in all.' },
      },
      't = n × u': {
        u: { expr: '{t} ÷ {n}', how: 'Share the total equally among all the boxes.' },
        t: { expr: '{n} × {u}', how: 'Every box is worth the same: multiply.' },
      },
      'x = a × u': {
        x: { expr: '{a} × {u}', how: 'The first tape has that many boxes, each worth the same.' },
        u: { expr: '{x} ÷ {a}', how: 'Share the first amount equally among its boxes.' },
      },
      'y = b × u': {
        y: { expr: '{b} × {u}', how: 'The second tape has that many boxes, each worth the same.' },
        u: { expr: '{y} ÷ {b}', how: 'Share the second amount equally among its boxes.' },
      },
      'd = extra boxes × u': {
        d: {
          expr: (v) => (v.b! >= v.a! ? '({b} − {a}) × {u}' : '({a} − {b}) × {u}'),
          how: 'One tape has more boxes. Multiply the extra boxes by what one is worth.',
        },
        u: {
          expr: (v) => (v.b! >= v.a! ? '{d} ÷ ({b} − {a})' : '{d} ÷ ({a} − {b})'),
          how: 'The extra boxes in the longer tape make the difference. Share it among them.',
        },
      },
    },
    example: { a: 3, b: 5, n: 8, u: 8, x: 24, y: 40, t: 64, d: 16 },
    startWith: ['a', 'b', 't'],
    representation: {
      kind: 'tape',
      ratio: ['a', 'b'],
      unit: 'u',
      amounts: ['x', 'y'],
      total: 't',
      difference: 'd',
    },
  },

  {
    id: 'm.6.ratios~three-parts',
    title: 'Ratios with three parts',
    use: 'Use this for “A ratio of 6:5:2 with 78 people in all. How many in each part?”',
    assumptions: [
      'Every box in the three tapes is worth the same amount.',
      'Share the total among all the boxes, then multiply for each part.',
      'Parts of the ratio are whole numbers to 12.',
    ],
    variables: [
      whole('a', 'a', 'First part of the ratio', 1, 12),
      whole('b', 'b', 'Second part of the ratio', 1, 12),
      whole('c', 'c', 'Third part of the ratio', 1, 12),
      { ...whole('n', 'n', 'Parts in all', 3, 36), derived: true },
      {
        id: 'u',
        symbol: 'u',
        name: 'One part is worth',
        min: 0,
        max: 200000,
        fraction: 60,
        derived: true,
      },
      { id: 'x', symbol: 'x', name: 'First amount', min: 0, max: 200000 },
      { id: 'y', symbol: 'y', name: 'Second amount', min: 0, max: 200000 },
      { id: 'z', symbol: 'z', name: 'Third amount', min: 0, max: 200000 },
      { id: 't', symbol: 't', name: 'Total', min: 0, max: 600000 },
    ],
    relations: [
      {
        id: 't = x + y + z',
        display: '{x} + {y} + {z} = {t}',
        words: 'First amount + second amount + third amount = total',
        vars: ['t', 'x', 'y', 'z'],
        residual: (v: Values) => v.t! - v.x! - v.y! - v.z!,
        solve: {
          t: (v: Values) => exact(v.x! + v.y! + v.z!),
          x: (v: Values) => exact(v.t! - v.y! - v.z!),
          y: (v: Values) => exact(v.t! - v.x! - v.z!),
          z: (v: Values) => exact(v.t! - v.x! - v.y!),
        },
      },
      {
        id: 'n = a + b + c',
        display: '{a} + {b} + {c} = {n}',
        words: 'First part + second part + third part = parts in all',
        vars: ['n', 'a', 'b', 'c'],
        residual: (v: Values) => v.n! - v.a! - v.b! - v.c!,
        solve: {
          n: (v: Values) => v.a! + v.b! + v.c!,
          a: (v: Values) => v.n! - v.b! - v.c!,
          b: (v: Values) => v.n! - v.a! - v.c!,
          c: (v: Values) => v.n! - v.a! - v.b!,
        },
      },
      {
        id: 't = n × u',
        display: '{t} ÷ {n} = {u}',
        words: 'Total ÷ parts in all = one part is worth',
        check: (v: Values) => `${formatNumber(v.u!, { fraction: 60 })} × ${v.n} = ${fmt(v.t!)}`,
        vars: ['t', 'n', 'u'],
        residual: (v: Values) => v.t! - v.n! * v.u!,
        solve: {
          u: (v: Values) => q(v.t!, v.n!),
          t: (v: Values) => exact(v.n! * v.u!),
          n: () => undefined,
        },
      },
      ...(
        [
          ['x', 'a', 'first'],
          ['y', 'b', 'second'],
          ['z', 'c', 'third'],
        ] as const
      ).map(([amt, part, which]) => ({
        id: `${amt} = ${part} × u`,
        display: `{${part}} × {u} = {${amt}}`,
        words: `${which[0]!.toUpperCase()}${which.slice(1)} part × one part is worth = ${which} amount`,
        vars: [amt, part, 'u'],
        residual: (v: Values) => v[amt]! - v[part]! * v.u!,
        solve: {
          [amt]: (v: Values) => exact(v[part]! * v.u!),
          u: (v: Values) => q(v[amt]!, v[part]!),
          [part]: () => undefined,
        },
      })),
    ],
    steps: {
      't = x + y + z': {
        t: { expr: '{x} + {y} + {z}', how: 'The three amounts make the total.' },
        x: { expr: '{t} − {y} − {z}', how: 'Take the other amounts from the total.' },
        y: { expr: '{t} − {x} − {z}', how: 'Take the other amounts from the total.' },
        z: { expr: '{t} − {x} − {y}', how: 'Take the other amounts from the total.' },
      },
      'n = a + b + c': {
        n: { expr: '{a} + {b} + {c}', how: 'Count the boxes in all three tapes.' },
        a: { expr: '{n} − {b} − {c}', how: 'Take the other parts from the parts in all.' },
        b: { expr: '{n} − {a} − {c}', how: 'Take the other parts from the parts in all.' },
        c: { expr: '{n} − {a} − {b}', how: 'Take the other parts from the parts in all.' },
      },
      't = n × u': {
        u: { expr: '{t} ÷ {n}', how: 'Share the total equally among all the boxes.' },
        t: { expr: '{n} × {u}', how: 'Every box is worth the same: multiply.' },
      },
      ...Object.fromEntries(
        (
          [
            ['x', 'a'],
            ['y', 'b'],
            ['z', 'c'],
          ] as const
        ).map(([amt, part]) => [
          `${amt} = ${part} × u`,
          {
            [amt]: { expr: `{${part}} × {u}`, how: 'That tape’s boxes, each worth the same.' },
            u: { expr: `{${amt}} ÷ {${part}}`, how: 'Share that amount equally among its boxes.' },
          },
        ]),
      ),
    },
    example: { a: 6, b: 5, c: 2, n: 13, u: 6, x: 36, y: 30, z: 12, t: 78 },
    startWith: ['a', 'b', 'c', 't'],
    representation: {
      kind: 'tape',
      ratio: ['a', 'b'],
      unit: 'u',
      amounts: ['x', 'y'],
      total: 't',
    },
  },

  // ── Unit rates (6.RP.2, 6.RP.3b) ──
  {
    id: 'm.6.unit-rates',
    assumptions: [
      'Every item costs the same: the rate stays the same.',
      'The unit rate is the amount for 1.',
      'Prices are in dollars and cents; counts are whole numbers to 1,000.',
      'A price for one that isn’t a whole number of cents is shown to the cent: $10 for 3 is about $3.33 each.',
    ],
    variables: [
      whole('n', 'n', 'Number of items', 1, 1000),
      {
        id: 't',
        symbol: 't',
        name: 'Total cost',
        unit: '$',
        min: 0,
        max: 10000,
        step: 0.01,
        multipleOf: 0.01,
      },
      {
        id: 'c',
        symbol: 'c',
        name: 'Cost per item',
        unit: '$',
        min: 0,
        max: 10000,
        // $10 for 3 is about $3.33 each: the price of one need not be a whole number of cents.
        step: 0.01,
      },
    ],
    relations: [
      {
        id: 't = c × n',
        display: '{c} × {n} = {t}',
        words: 'Cost per item × number of items = total cost',
        // Sub-cent prices: $10 ÷ 3 × 3 is $10 again, to the cent.
        check: (v: Values) =>
          Math.abs(v.c! * 100 - Math.round(v.c! * 100)) < 1e-6
            ? `${fmt(v.c!)} × ${v.n} = ${fmt(v.t!)}`
            : `${fmt(v.t!)} ÷ ${v.n} × ${v.n} = ${fmt(v.t!)}`,
        vars: ['t', 'c', 'n'],
        residual: (v: Values) => v.t! - v.c! * v.n!,
        solve: {
          t: (v: Values) => {
            const x = v.c! * v.n!;
            const cents = Math.round(x * 100) / 100;
            return Math.abs(x - cents) < 1e-6 ? cents : exact(x);
          },
          c: (v: Values) => q(v.t!, v.n!),
          // A price like $12.3386… is rounded: the count it gives is whole to within that.
          n: (v: Values) => {
            const x = q(v.t!, v.c!);
            return x !== undefined && Math.abs(x - Math.round(x)) < 1e-6 ? Math.round(x) : x;
          },
        },
      },
    ],
    steps: {
      't = c × n': {
        c: {
          expr: '{t} ÷ {n}',
          how: 'The unit rate is the price of 1. Share the total cost equally among the items.',
          work: (v) => subCent(v.c!, `${fmt(v.t!)} ÷ ${v.n}`),
        },
        t: { expr: '{c} × {n}', how: 'Every item costs the same: multiply the price of 1.' },
        n: {
          expr: '{t} ÷ {c}',
          how: 'How many of the price of 1 fit in the total? Divide.',
          writtenLast: true,
          written: (v) => {
            const s = wholeDivisor(v.t!, v.c!);
            return s.k > 1 ? decimalLongDivision(s.n, s.d) : undefined;
          },
        },
      },
    },
    example: { n: 6, t: 7.5, c: 1.25 },
    startWith: ['t', 'n'],
    representation: {
      kind: 'doubleNumberLine',
      top: 'n',
      bottom: 't',
      per: 'c',
      ticks: 6,
      prefix: '$',
    },
  },
  {
    id: 'm.6.unit-rates~better-buy',
    title: 'Which is the better buy?',
    use: 'Use this for “Which is the better buy?”: compare the price of one item.',
    assumptions: [
      'The better buy is the one with the lower price for one item.',
      'The two stores sell the same item.',
      'Prices are in dollars and cents; counts are whole numbers to 100.',
    ],
    variables: [
      {
        id: 'a',
        symbol: 'a',
        name: 'First store’s total price',
        unit: '$',
        min: 0.01,
        max: 1000,
        step: 0.01,
        multipleOf: 0.01,
      },
      whole('m', 'm', 'Items at the first store', 1, 100),
      {
        id: 'p',
        symbol: 'p',
        name: 'First store’s price for one',
        unit: '$',
        min: 0,
        max: 1000,
        derived: true,
      },
      {
        id: 'b',
        symbol: 'b',
        name: 'Second store’s total price',
        unit: '$',
        min: 0.01,
        max: 1000,
        step: 0.01,
        multipleOf: 0.01,
      },
      whole('n', 'n', 'Items at the second store', 1, 100),
      {
        id: 'r',
        symbol: 'r',
        name: 'Second store’s price for one',
        unit: '$',
        min: 0,
        max: 1000,
        derived: true,
      },
      {
        id: 'd',
        symbol: 'd',
        name: 'Difference for one item',
        unit: '$',
        min: 0,
        max: 1000,
        derived: true,
      },
    ],
    relations: [
      {
        id: 'p = a ÷ m',
        display: '{a} ÷ {m} = {p}',
        words: 'First store’s price ÷ items = price for one',
        check: (v: Values) => `${fmt(v.p!)} × ${v.m} = ${fmt(v.a!)}`,
        vars: ['p', 'a', 'm'],
        residual: (v: Values) => v.p! * v.m! - v.a!,
        solve: { p: (v: Values) => q(v.a!, v.m!), a: () => undefined, m: () => undefined },
      },
      {
        id: 'r = b ÷ n',
        display: '{b} ÷ {n} = {r}',
        words: 'Second store’s price ÷ items = price for one',
        check: (v: Values) => `${fmt(v.r!)} × ${v.n} = ${fmt(v.b!)}`,
        vars: ['r', 'b', 'n'],
        residual: (v: Values) => v.r! * v.n! - v.b!,
        solve: { r: (v: Values) => q(v.b!, v.n!), b: () => undefined, n: () => undefined },
      },
      {
        id: 'd = p and r apart',
        display: '{p} and {r} are {d} apart',
        words: 'Higher price for one − lower price for one = {d}',
        check: (v: Values) =>
          `${fmt(Math.max(v.p!, v.r!))} − ${fmt(Math.min(v.p!, v.r!))} = ${fmt(v.d!)}`,
        vars: ['d', 'p', 'r'],
        residual: (v: Values) => v.d! - Math.abs(v.p! - v.r!),
        solve: {
          d: (v: Values) => exact(Math.abs(v.p! - v.r!)),
          p: () => undefined,
          r: () => undefined,
        },
      },
    ],
    steps: {
      'p = a ÷ m': {
        p: {
          expr: '{a} ÷ {m}',
          how: 'Find the price of one at the first store: divide.',
          work: (v) => subCent(v.p!, `${fmt(v.a!)} ÷ ${v.m}`),
        },
      },
      'r = b ÷ n': {
        r: {
          expr: '{b} ÷ {n}',
          how: 'Find the price of one at the second store: divide.',
          work: (v) => subCent(v.r!, `${fmt(v.b!)} ÷ ${v.n}`),
        },
      },
      'd = p and r apart': {
        d: {
          expr: (v) => (v.p! >= v.r! ? '{p} − {r}' : '{r} − {p}'),
          how: 'Take the lower price for one from the higher one.',
          work: (v) => subCent(v.d!, `${fmt(Math.max(v.p!, v.r!))} − ${fmt(Math.min(v.p!, v.r!))}`),
          note: (v) =>
            v.p! === v.r!
              ? '(the same price: neither is the better buy)'
              : `(the ${v.p! < v.r! ? 'first' : 'second'} store is the better buy)`,
        },
      },
    },
    example: { a: 5, m: 4, p: 1.25, b: 6.9, n: 6, r: 1.15, d: 0.1 },
    startWith: ['a', 'm', 'b', 'n'],
    representation: {
      kind: 'tape',
      compare: ['p', 'r'],
      difference: 'd',
      caption: 'One item: {p} at the first store, {r} at the second.',
    },
  },
  {
    id: 'm.6.unit-rates~speed',
    title: 'Constant speed',
    use: 'Use this for “3 miles in 12 minutes. How long for 7 miles?” at the same speed.',
    assumptions: [
      'The speed stays the same the whole way.',
      'Speed is the distance in 1 hour.',
      'Times to 100 hours (half an hour is 0.5); distances and speeds in kilometers or miles.',
    ],
    variables: [
      { id: 'd', symbol: 'd', name: 'Distance', unit: 'km', min: 0.1, max: 10000, step: 0.1 },
      { id: 't', symbol: 't', name: 'Time', unit: 'h', min: 0.1, max: 100, step: 0.1 },
      { id: 's', symbol: 's', name: 'Speed', unit: 'km/h', min: 0.1, max: 1000, step: 0.1 },
    ],
    relations: [
      {
        id: 'd = s × t',
        display: '{s} × {t} = {d}',
        words: 'Speed × time = distance',
        vars: ['d', 's', 't'],
        residual: (v: Values) => v.d! - v.s! * v.t!,
        solve: {
          d: (v: Values) => exact(v.s! * v.t!),
          s: (v: Values) => q(v.d!, v.t!),
          t: (v: Values) => q(v.d!, v.s!),
        },
      },
    ],
    steps: {
      'd = s × t': {
        s: {
          expr: '{d} ÷ {t}',
          how: 'Speed is the distance in 1 hour: share the distance equally among the hours.',
          work: (v) => {
            const s = wholeDivisor(v.d!, v.t!);
            return s.k > 1 ? [`${fmt(v.d!)} ÷ ${fmt(v.t!)} = ${fmt(s.n)} ÷ ${fmt(s.d)}`] : [];
          },
          writtenLast: true,
          written: (v) => {
            const s = wholeDivisor(v.d!, v.t!);
            return Number.isInteger(s.n) || places(s.n) <= 2
              ? decimalLongDivision(s.n, s.d)
              : undefined;
          },
        },
        d: { expr: '{s} × {t}', how: 'Each hour covers the speed: multiply by the hours.' },
        t: {
          expr: '{d} ÷ {s}',
          how: 'How many hours of the speed fit in the distance? Divide.',
        },
      },
    },
    example: { d: 150, t: 2.5, s: 60 },
    startWith: ['d', 't'],
    representation: { kind: 'doubleNumberLine', top: 't', bottom: 'd', per: 's', ticks: 5 },
  },

  {
    id: 'm.6.unit-rates~convert',
    title: 'Convert units with a rate',
    use: 'Use this for “How many quarts is 168 fluid ounces?” with 32 fluid ounces in a quart.',
    assumptions: [
      'A conversion is a rate: how many of the new unit are in 1 of the old one (1 mile = 1,760 yards).',
      'To the smaller unit, multiply by the rate. To the bigger unit, divide by it.',
      'The double number line keeps the two amounts in the same ratio.',
    ],
    variables: [
      { id: 'a', symbol: 'a', name: 'Amount in the first unit', min: 0, max: 1000000, step: 0.01 },
      {
        id: 'k',
        symbol: 'k',
        name: 'Second units in 1 first unit',
        min: 0.001,
        max: 100000,
        step: 0.001,
      },
      { id: 'b', symbol: 'b', name: 'Amount in the second unit', min: 0, max: 1000000, step: 0.01 },
    ],
    relations: [
      {
        id: 'b = a × k',
        display: '{a} × {k} = {b}',
        words: 'Amount in the first unit × rate = amount in the second unit',
        vars: ['b', 'a', 'k'],
        residual: (v: Values) => v.b! - v.a! * v.k!,
        solve: {
          b: (v: Values) => exact(v.a! * v.k!),
          a: (v: Values) => q(v.b!, v.k!),
          k: (v: Values) => q(v.b!, v.a!),
        },
      },
    ],
    steps: {
      'b = a × k': {
        b: {
          expr: '{a} × {k}',
          how: 'Each first unit is that many second units: multiply by the rate.',
        },
        a: {
          expr: '{b} ÷ {k}',
          how: 'How many groups of the rate fit in the amount? Divide by the rate.',
        },
        k: { expr: '{b} ÷ {a}', how: 'The rate is the second amount for 1 of the first: divide.' },
      },
    },
    example: { a: 5.25, k: 32, b: 168 },
    startWith: ['b', 'k'],
    representation: { kind: 'doubleNumberLine', top: 'a', bottom: 'b', per: 'k', ticks: 5 },
  },

  // ── Percent of a quantity (6.RP.3c) ──
  {
    id: 'm.6.percent',
    sliders: false,
    equation: '{p}% of {w} = {x}',
    assumptions: [
      'Percent means out of 100: the whole is 100%.',
      'More than 100% means more than the whole.',
      'The part and the whole use the same unit.',
    ],
    variables: [
      { id: 'p', symbol: 'p', name: 'Percent', unit: '%', min: 0, max: 300, step: 0.1 },
      { id: 'w', symbol: 'w', name: 'Whole', min: 0.01, max: 100000 },
      { id: 'o', symbol: 'o', name: 'One percent of the whole', min: 0, max: 1000, derived: true },
      { id: 'x', symbol: 'x', name: 'Part', min: 0, max: 300000 },
    ],
    relations: [
      {
        id: 'o = w ÷ 100',
        display: '{w} ÷ 100 = {o}',
        words: 'Whole ÷ 100 = one percent',
        check: (v: Values) => `${fmt(v.o!)} × 100 = ${fmt(v.w!)}`,
        vars: ['o', 'w'],
        residual: (v: Values) => v.o! * 100 - v.w!,
        solve: { o: (v: Values) => v.w! / 100, w: (v: Values) => v.o! * 100 },
      },
      {
        id: 'x = o × p',
        display: '{o} × {p} = {x}',
        words: 'One percent × percent = part',
        vars: ['x', 'o', 'p'],
        residual: (v: Values) => v.x! - v.o! * v.p!,
        solve: {
          x: (v: Values) => exact(v.o! * v.p!),
          o: (v: Values) => q(v.x!, v.p!),
          p: (v: Values) => q(v.x!, v.o!),
        },
      },
    ],
    steps: {
      'o = w ÷ 100': {
        o: {
          expr: '{w} ÷ 100',
          how: 'The whole is 100%. Share it into 100 equal parts to find 1%.',
        },
        w: { expr: '{o} × 100', how: 'The whole is 100 of the one percent.' },
      },
      'x = o × p': {
        x: { expr: '{o} × {p}', how: 'The part is that many of the one percent.' },
        o: { expr: '{x} ÷ {p}', how: 'The part is that many percent. Share it to find 1%.' },
        p: {
          expr: '{x} ÷ {o}',
          how: 'How many of the one percent fit in the part? That many percent.',
          work: (v) =>
            v.w === undefined || v.w === 0
              ? []
              : [
                  `${fmt(v.x!)} ÷ ${fmt(v.w)} = ${fmt(v.x! / v.w)}`,
                  `${fmt(v.x! / v.w)} × 100 = ${fmt(v.p!)}`,
                ],
          written: false,
        },
      },
    },
    example: { p: 25, w: 80, o: 0.8, x: 20 },
    startWith: ['p', 'w'],
    representation: {
      kind: 'percentBar',
      percent: 'p',
      part: 'x',
      whole: 'w',
      onePercent: 'o',
      ticks: 10,
    },
  },
  {
    id: 'm.6.percent~fraction-decimal-percent',
    title: 'Fractions, decimals and percents',
    use: 'Use this for “Write 3/5 as a decimal and a percent,” or 3/8 = 37.5%.',
    assumptions: [
      'Make the denominator 100: the numerator is then the percent.',
      'A percent is hundredths: 60% = 60/100 = 0.6.',
      'Make the denominator 100 when it divides 100; else divide (3 ÷ 8 = 0.375 = 37.5%).',
      'The fraction is at most 1. Denominators 2, 4, 5, 8, 10, 20, 25, 40, 50 and 100.',
    ],
    variables: [
      whole('a', 'a', 'Numerator', 0, 100),
      { ...whole('b', 'b', 'Denominator', 2, 100), allowed: [2, 4, 5, 8, 10, 20, 25, 40, 50, 100] },
      { id: 'd', symbol: 'd', name: 'Decimal', min: 0, max: 1, step: 0.001, multipleOf: 0.001 },
      {
        id: 'p',
        symbol: 'p',
        name: 'Percent',
        unit: '%',
        min: 0,
        max: 100,
        step: 0.1,
        multipleOf: 0.1,
      },
    ],
    relations: [
      {
        id: 'a ≤ b',
        constraint: true,
        display: '{a}/{b} is at most 1',
        vars: ['a', 'b'],
        residual: (v: Values) => (v.a! <= v.b! ? 0 : 1),
        solve: {},
      },
      {
        id: 'd = a ÷ b',
        display: '{a} ÷ {b} = {d}',
        words: 'Numerator ÷ denominator = decimal',
        check: (v: Values) => `${fmt(v.d!)} × ${v.b} = ${v.a}`,
        vars: ['d', 'a', 'b'],
        residual: (v: Values) => v.d! * v.b! - v.a!,
        solve: {
          d: (v: Values) => q(v.a!, v.b!),
          a: (v: Values) => exact(v.d! * v.b!),
          b: (v: Values) => q(v.a!, v.d!),
        },
      },
      {
        id: 'p = d × 100',
        display: '{d} × 100 = {p}',
        words: 'Decimal × 100 = percent',
        vars: ['p', 'd'],
        residual: (v: Values) => v.p! - v.d! * 100,
        solve: { p: (v: Values) => exact(v.d! * 100), d: (v: Values) => exact(v.p! / 100) },
      },
    ],
    steps: {
      'a ≤ b': {},
      'd = a ÷ b': {
        d: {
          expr: '{a} ÷ {b}',
          how: 'Make the denominator 100: multiply the top and bottom by the same number.',
          work: (v) => {
            const k = 100 / v.b!;
            // Eighths and fortieths don't scale to hundredths by a whole number: divide.
            if (!Number.isInteger(k)) return [`${v.a} ÷ ${v.b} = ${fmt(v.d!)}`];
            return k === 1
              ? [`${v.a}/100 = ${fmt(v.d!)}`]
              : [
                  `${v.a}/${v.b} = ${v.a! * k}/100 (multiply both by ${k})`,
                  `${v.a! * k}/100 = ${fmt(v.d!)}`,
                ];
          },
          written: (v) =>
            Number.isInteger(100 / v.b!) ? undefined : decimalLongDivision(v.a!, v.b!),
        },
        a: {
          expr: '{d} × {b}',
          how: 'The numerator is the decimal of the denominator.',
          written: false,
        },
        b: { expr: '{a} ÷ {d}', how: 'Divide the numerator by the decimal.', written: false },
      },
      'p = d × 100': {
        p: { expr: '{d} × 100', how: 'Hundredths are percents: move the point two places.' },
        d: { expr: '{p} ÷ 100', how: 'A percent is that many hundredths.' },
      },
    },
    example: { a: 3, b: 5, d: 0.6, p: 60 },
    startWith: ['a', 'b'],
    representation: { kind: 'grid100', percent: 'p' },
  },

  // ── Multi-digit division and decimals (6.NS.2, 6.NS.3) ──
  {
    id: 'm.6.multi-digit-decimals',
    assumptions: [
      'Divide, multiply, subtract, bring down: the same steps for every digit.',
      'When the digits run out, write a point and zeros and keep going.',
      'Divisors are whole numbers from 2 to 999; quotients end within three decimal places (else use the remainder page).',
    ],
    variables: [
      { id: 'n', symbol: 'n', name: 'Dividend', min: 0, max: 99999, step: 0.01, multipleOf: 0.01 },
      whole('d', 'd', 'Divisor', 2, 999),
      {
        id: 'q',
        symbol: 'q',
        name: 'Quotient',
        min: 0,
        max: 50000,
        step: 0.001,
        multipleOf: 0.001,
      },
    ],
    relations: [
      {
        id: 'n = q × d',
        display: '{n} ÷ {d} = {q}',
        words: 'Dividend ÷ divisor = quotient',
        check: (v: Values) => `${fmt(v.q!)} × ${v.d} = ${fmt(v.n!)}`,
        vars: ['n', 'q', 'd'],
        residual: (v: Values) => v.n! - v.q! * v.d!,
        solve: {
          q: (v: Values) => q(v.n!, v.d!),
          n: (v: Values) => exact(v.q! * v.d!),
          d: (v: Values) => q(v.n!, v.q!),
        },
      },
    ],
    steps: {
      'n = q × d': {
        q: {
          expr: '{n} ÷ {d}',
          how: 'Divide place by place. Write the point in the quotient above the point in the dividend.',
        },
        n: { expr: '{q} × {d}', how: 'The quotient times the divisor gives the dividend.' },
        d: { expr: '{n} ÷ {q}', how: 'Divide the dividend by the quotient.' },
      },
    },
    example: { n: 1431, d: 27, q: 53 },
    startWith: ['n', 'd'],
    representation: {
      kind: 'areaModel',
      divide: { dividend: 'n', divisor: 'd', quotient: 'q' },
    },
  },
  {
    id: 'm.6.multi-digit-decimals~remainder',
    title: 'Divide with a remainder',
    use: 'Use this for “1,431 ÷ 99 = ?” when it doesn’t come out even: 14 remainder 45.',
    assumptions: [
      'Divide, multiply, subtract, bring down. What is left at the end is the remainder.',
      'The remainder is less than the divisor.',
      'As a decimal the quotient keeps going (14.4545…): round it, to hundredths say, if the question asks.',
      'Dividends to 99,999; divisors from 2 to 999.',
    ],
    variables: [
      whole('n', 'n', 'Dividend', 0, 99999),
      whole('d', 'd', 'Divisor', 2, 999),
      whole('w', 'w', 'Whole-number quotient', 0, 49999),
      { ...whole('m', 'm', 'Divisor × quotient', 0, 99999), derived: true },
      whole('r', 'r', 'Remainder', 0, 998),
    ],
    relations: [
      {
        id: 'r < d',
        constraint: true,
        display: '{r} is less than {d}',
        vars: ['r', 'd'],
        residual: (v: Values) => (v.r! < v.d! ? 0 : 1),
        solve: {},
      },
      {
        id: 'w = whole times d fits in n',
        display: '{n} ÷ {d} → {w} whole groups',
        words: 'Dividend ÷ divisor, whole number part = {w}',
        vars: ['w', 'n', 'd'],
        residual: (v: Values) => v.w! - Math.floor(v.n! / v.d!),
        solve: {
          w: (v: Values) => Math.floor(v.n! / v.d!),
          n: () => undefined,
          d: () => undefined,
        },
      },
      {
        id: 'm = w × d',
        display: '{w} × {d} = {m}',
        vars: ['m', 'w', 'd'],
        residual: (v: Values) => v.m! - v.w! * v.d!,
        solve: {
          m: (v: Values) => v.w! * v.d!,
          w: (v: Values) => q(v.m!, v.d!),
          d: (v: Values) => q(v.m!, v.w!),
        },
      },
      {
        id: 'n = m + r',
        display: '{m} + {r} = {n}',
        words: 'Divisor × quotient + remainder = dividend',
        vars: ['n', 'm', 'r'],
        residual: (v: Values) => v.n! - v.m! - v.r!,
        solve: {
          n: (v: Values) => v.m! + v.r!,
          m: (v: Values) => v.n! - v.r!,
          r: (v: Values) => v.n! - v.m!,
        },
      },
    ],
    steps: {
      'r < d': {},
      'w = whole times d fits in n': {
        w: {
          expr: 'whole groups of {d} in {n}',
          how: 'Divide place by place, and stop at the ones.',
          written: (v) => longDivision(v.n!, v.d!),
        },
      },
      'm = w × d': {
        m: { expr: '{w} × {d}', how: 'Multiply back: how much the whole quotient uses.' },
        w: { expr: '{m} ÷ {d}', how: 'Divide what is used by the divisor.' },
        d: { expr: '{m} ÷ {w}', how: 'Divide what is used by the quotient.' },
      },
      'n = m + r': {
        r: {
          expr: '{n} − {m}',
          how: 'What is left over is the remainder.',
          note: (v) =>
            v.r === 0 ? '(no remainder)' : `(as a decimal: about ${(v.n! / v.d!).toFixed(2)})`,
        },
        n: { expr: '{m} + {r}', how: 'What is used plus what is left is the dividend.' },
        m: { expr: '{n} − {r}', how: 'Take the remainder from the dividend.' },
      },
    },
    example: { n: 1431, d: 99, w: 14, m: 1386, r: 45 },
    startWith: ['n', 'd'],
    representation: {
      kind: 'areaModel',
      divide: { dividend: 'n', divisor: 'd', quotient: 'w', remainder: 'r' },
    },
  },
  {
    id: 'm.6.multi-digit-decimals~multiply-decimals',
    title: 'Multiply decimals',
    use: 'Use this for “Find the value of (0.061)(0.43),” or 2.35 × 1.4.',
    assumptions: [
      'Multiply without the points, then count the decimal places in both factors.',
      'The product has that many decimal places, before end zeros are dropped: 3.290 = 3.29.',
      'Factors to three decimal places.',
    ],
    variables: [
      {
        id: 'a',
        symbol: 'a',
        name: 'First factor',
        min: 0.001,
        max: 999.999,
        step: 0.001,
        multipleOf: 0.001,
      },
      {
        id: 'b',
        symbol: 'b',
        name: 'Second factor',
        min: 0.001,
        max: 99.999,
        step: 0.001,
        multipleOf: 0.001,
      },
      { id: 'p', symbol: 'p', name: 'Product', min: 0, max: 100000 },
    ],
    relations: [
      {
        id: 'p = a × b',
        display: '{a} × {b} = {p}',
        words: 'First factor × second factor = product',
        vars: ['p', 'a', 'b'],
        residual: (v: Values) => v.p! - v.a! * v.b!,
        solve: {
          p: (v: Values) => exact(v.a! * v.b!),
          a: (v: Values) => q(v.p!, v.b!),
          b: (v: Values) => q(v.p!, v.a!),
        },
      },
    ],
    steps: {
      'p = a × b': {
        p: {
          expr: '{a} × {b}',
          how: 'Multiply as whole numbers. Then count the decimal places in both factors.',
          work: (v) => {
            const [pa, pb] = [places(v.a!), places(v.b!)];
            const [A, B] = [Math.round(v.a! * 10 ** pa), Math.round(v.b! * 10 ** pb)];
            if (pa + pb === 0) return [];
            return [
              `${fmt(A)} × ${fmt(B)} = ${fmt(A * B)}`,
              `${pa} + ${pb} = ${pa + pb} decimal places: ${fmt(A * B)} ÷ ${fmt(10 ** (pa + pb))} = ${fmt(v.p!)}`,
            ];
          },
          written: (v) => decimalMultiply(v.a!, v.b!),
        },
        a: {
          expr: '{p} ÷ {b}',
          how: 'Divide the product by the other factor. Make the divisor whole first.',
          work: (v) => {
            const s = wholeDivisor(v.p!, v.b!);
            return s.k > 1
              ? [
                  `Multiply both by ${fmt(s.k)}: ${fmt(v.p!)} ÷ ${fmt(v.b!)} = ${fmt(s.n)} ÷ ${fmt(s.d)}`,
                ]
              : [];
          },
          writtenLast: true,
          written: (v) => {
            const s = wholeDivisor(v.p!, v.b!);
            return places(s.n) <= 3 ? decimalLongDivision(s.n, s.d) : undefined;
          },
        },
        b: {
          expr: '{p} ÷ {a}',
          how: 'Divide the product by the other factor. Make the divisor whole first.',
          work: (v) => {
            const s = wholeDivisor(v.p!, v.a!);
            return s.k > 1
              ? [
                  `Multiply both by ${fmt(s.k)}: ${fmt(v.p!)} ÷ ${fmt(v.a!)} = ${fmt(s.n)} ÷ ${fmt(s.d)}`,
                ]
              : [];
          },
          writtenLast: true,
          written: (v) => {
            const s = wholeDivisor(v.p!, v.a!);
            return places(s.n) <= 3 ? decimalLongDivision(s.n, s.d) : undefined;
          },
        },
      },
    },
    example: { a: 2.35, b: 1.4, p: 3.29 },
    startWith: ['a', 'b'],
    representation: { kind: 'areaModel', factors: ['a', 'b'], total: 'p' },
  },
  {
    id: 'm.6.multi-digit-decimals~add-subtract',
    title: 'Add and subtract decimals',
    use: 'Use this for “$14.50 − $4.35 − $5.25,” or 7.2 − 3.67.',
    assumptions: [
      'Line up the decimal points, so tenths are under tenths and hundredths under hundredths.',
      'Write zeros in empty places: 7.2 − 3.67 is 7.20 − 3.67. A whole number like 16 has its point after the ones.',
      'Numbers to 9,999.999 (three decimal places).',
    ],
    variables: [
      {
        id: 'a',
        symbol: 'a',
        name: 'First number',
        min: 0,
        max: 9999.999,
        step: 0.001,
        multipleOf: 0.001,
      },
      {
        id: 'b',
        symbol: 'b',
        name: 'Second number',
        min: 0,
        max: 9999.999,
        step: 0.001,
        multipleOf: 0.001,
      },
      {
        id: 's',
        symbol: 's',
        name: 'Sum',
        min: 0,
        max: 19999.998,
        step: 0.001,
        multipleOf: 0.001,
      },
    ],
    relations: [
      {
        id: 's = a + b',
        display: '{a} + {b} = {s}',
        words: 'First number + second number = sum',
        vars: ['s', 'a', 'b'],
        residual: (v: Values) => v.s! - v.a! - v.b!,
        solve: {
          // Every value is in thousandths: round the float error away on that grid.
          s: (v: Values) => thousandths(v.a! + v.b!),
          a: (v: Values) => thousandths(v.s! - v.b!),
          b: (v: Values) => thousandths(v.s! - v.a!),
        },
      },
    ],
    steps: {
      's = a + b': {
        s: {
          expr: '{a} + {b}',
          how: 'Line up the points and add each place, right to left.',
          written: (v) => decimalColumns('+', [v.a!, v.b!]),
        },
        a: {
          expr: '{s} − {b}',
          how: 'Subtract: line up the points, write zeros in empty places, and regroup where needed.',
          written: (v) => decimalColumns('−', [v.s!, v.b!]),
        },
        b: {
          expr: '{s} − {a}',
          how: 'Subtract: line up the points, write zeros in empty places, and regroup where needed.',
          written: (v) => decimalColumns('−', [v.s!, v.a!]),
        },
      },
    },
    example: { a: 3.67, b: 3.53, s: 7.2 },
    startWith: ['s', 'b'],
    representation: { kind: 'placeValueChart', value: 'a', decimals: 3, compare: 'b' },
  },
  {
    id: 'm.6.multi-digit-decimals~divide-by-decimal',
    title: 'Divide by a decimal',
    use: 'Use this for “2.1 ÷ 1.5”: make the divisor whole, then divide.',
    assumptions: [
      'Multiply the dividend and the divisor by the same 10 or 100: the quotient stays the same.',
      'Choose the power of ten that makes the divisor a whole number.',
      'Divisors from 0.01 to 9.99; quotients end within three decimal places.',
    ],
    variables: [
      {
        id: 'n',
        symbol: 'n',
        name: 'Dividend',
        min: 0,
        max: 9999.99,
        step: 0.01,
        multipleOf: 0.01,
      },
      { id: 'd', symbol: 'd', name: 'Divisor', min: 0.01, max: 9.99, step: 0.01, multipleOf: 0.01 },
      {
        id: 'q',
        symbol: 'q',
        name: 'Quotient',
        min: 0,
        max: 1000000,
        step: 0.001,
        multipleOf: 0.001,
      },
    ],
    relations: [
      {
        id: 'n = q × d',
        display: '{n} ÷ {d} = {q}',
        words: 'Dividend ÷ divisor = quotient',
        check: (v: Values) => `${fmt(v.q!)} × ${fmt(v.d!)} = ${fmt(v.n!)}`,
        vars: ['n', 'q', 'd'],
        residual: (v: Values) => v.n! - v.q! * v.d!,
        solve: {
          q: (v: Values) => q(v.n!, v.d!),
          n: (v: Values) => exact(v.q! * v.d!),
          d: (v: Values) => q(v.n!, v.q!),
        },
      },
    ],
    steps: {
      'n = q × d': {
        q: {
          expr: '{n} ÷ {d}',
          how: 'Multiply both by the same power of ten so the divisor is whole. Then divide.',
          work: (v) => {
            const s = wholeDivisor(v.n!, v.d!);
            return s.k > 1
              ? [
                  `Multiply both by ${fmt(s.k)}: ${fmt(v.n!)} ÷ ${fmt(v.d!)} = ${fmt(s.n)} ÷ ${fmt(s.d)}`,
                ]
              : [];
          },
          writtenLast: true,
          written: (v) => {
            const s = wholeDivisor(v.n!, v.d!);
            return s.d >= 2 && (s.n % s.d !== 0 || s.n / s.d >= 10)
              ? decimalLongDivision(s.n, s.d)
              : undefined;
          },
        },
        n: { expr: '{q} × {d}', how: 'The quotient times the divisor gives the dividend.' },
        d: { expr: '{n} ÷ {q}', how: 'Divide the dividend by the quotient.' },
      },
    },
    example: { n: 1.26, d: 0.3, q: 4.2 },
    startWith: ['n', 'd'],
    representation: { kind: 'skipCount', step: 'd', total: 'n' },
  },

  // ── Dividing fractions by fractions (6.NS.1) ──
  (() => {
    const fr = (id: string, name: string, max = 100) => whole(id, id, name, 0, max);
    // Denominators to 20 (14/15 ÷ 7/5).
    const den = (id: string, name: string) => ({
      ...whole(id, id, name, 1, 20),
      allowed: [...DENOMS, 15, 16, 20],
    });
    /** Quotients to 144 (12 ÷ 1/12); past 40 groups the picture draws one bar. */
    const most144 = {
      id: 'quotient ≤ 144',
      constraint: true as const,
      display: 'The quotient of {a}/{b} ÷ {c}/{d} is at most 144',
      vars: ['a', 'b', 'c', 'd'],
      residual: (v: Values) => (v.a! * v.d! <= 144 * v.b! * v.c! ? 0 : 1),
      solve: {},
    };
    const pages: ModuleDef[] = [
      {
        id: 'm.6.divide-fractions',
        // Typed into the equation as a student writes it, not slid.
        sliders: false,
        equation: '{a}/{b} ÷ {c}/{d} = {e}/{f}',
        assumptions: [
          'Dividing by a fraction is multiplying by its reciprocal: flip its numerator and denominator.',
          'The divisor is never 0, and the quotient is at most 144.',
          'Write mixed numbers as fractions first: 2 1/4 = 9/4.',
        ],
        variables: [
          fr('a', 'Dividend numerator'),
          den('b', 'Dividend denominator'),
          { ...fr('c', 'Divisor numerator', 12), min: 1 },
          den('d', 'Divisor denominator'),
          { ...fr('e', 'Quotient numerator', 2000), derived: true },
          { ...fr('f', 'Quotient denominator', 240), min: 1, derived: true },
        ],
        relations: [
          most144,
          {
            id: 'e = a × d',
            display: '{a}/{b} ÷ {c}/{d} = {e}/{f}',
            words: 'Dividend numerator × divisor denominator = quotient numerator',
            shows: ['b', 'c', 'f'],
            check: (v: Values) => `${v.a} × ${v.d} = ${v.e}`,
            vars: ['e', 'a', 'd'],
            residual: (v: Values) => v.e! - v.a! * v.d!,
            solve: {
              e: (v: Values) => v.a! * v.d!,
              a: (v: Values) => div(v.e!, v.d!),
              d: () => undefined,
            },
          },
          {
            id: 'f = b × c',
            display: '{a}/{b} ÷ {c}/{d} = {e}/{f}',
            words: 'Dividend denominator × divisor numerator = quotient denominator',
            shows: ['a', 'd', 'e'],
            check: (v: Values) => `${v.b} × ${v.c} = ${v.f}`,
            vars: ['f', 'b', 'c'],
            residual: (v: Values) => v.f! - v.b! * v.c!,
            solve: {
              f: (v: Values) => v.b! * v.c!,
              b: (v: Values) => div(v.f!, v.c!),
              c: () => undefined,
            },
          },
        ],
        steps: {
          'quotient ≤ 144': {},
          'e = a × d': {
            e: {
              expr: '{a} × {d}',
              how: (v) =>
                v.c === undefined
                  ? 'Dividing by a fraction is multiplying by its reciprocal. Multiply the numerators.'
                  : `Dividing by ${v.c}/${v.d} is multiplying by its reciprocal, ${v.d}/${v.c}. Multiply the numerators.`,
              work: (v) =>
                v.c === undefined || v.b === undefined
                  ? []
                  : [`${v.a}/${v.b} ÷ ${v.c}/${v.d} = ${v.a}/${v.b} × ${v.d}/${v.c}`],
            },
            a: {
              expr: '{e} ÷ {d}',
              how: 'Undo the multiplying: divide by the divisor’s denominator.',
            },
          },
          'f = b × c': {
            f: {
              expr: '{b} × {c}',
              how: 'Multiply the denominators: the dividend’s denominator times the divisor’s numerator.',
              // Check by multiplying back: quotient × divisor = dividend (6.NS.1).
              work: (v) =>
                ['a', 'b', 'c', 'd', 'e', 'f'].some((k) => v[k] === undefined)
                  ? []
                  : [
                      `${v.b} × ${v.c} = ${v.f}`,
                      `Check: ${v.e}/${v.f} × ${v.c}/${v.d} = ${v.e! * v.c!}/${v.f! * v.d!} = ${v.a}/${v.b}`,
                    ],
              note: (v) => {
                if (v.e === undefined) return '';
                if (v.e === 0) return '(the quotient is 0)';
                const s = simplest(v.e, v.f!);
                const m = v.e > v.f! ? mixed(v.e, v.f!) : '';
                return `(the quotient is ${[`${v.e}/${v.f}`, s.split(' = ')[1], m].filter((x, i, all) => x && all.indexOf(x) === i).join(' = ')})`;
              },
            },
            b: {
              expr: '{f} ÷ {c}',
              how: 'Undo the multiplying: divide by the divisor’s numerator.',
            },
          },
        },
        example: { a: 2, b: 3, c: 3, d: 4, e: 8, f: 9 },
        startWith: ['a', 'b', 'c', 'd'],
        representation: {
          kind: 'fractionFit',
          dividend: { num: 'a', den: 'b' },
          divisor: { num: 'c', den: 'd' },
          quotient: 'e',
          mode: 'groups',
          wholes: 1,
        },
      },
      {
        id: 'm.6.divide-fractions~how-many-fit',
        sliders: false,
        equation: '{a}/{b} ÷ {c}/{d} = {g}',
        title: 'How many groups?',
        use: 'Use this for “How many 3/4-cup servings are in 2 1/4 cups?”',
        assumptions: [
          'Write both amounts with the same denominator. Then divide the numerators.',
          'A part of a group left over is a fraction of a group.',
          'Denominators from 1 to 20, up to 144 groups; write mixed numbers as fractions (2 1/4 = 9/4).',
        ],
        variables: [
          fr('a', 'Amount numerator'),
          den('b', 'Amount denominator'),
          { ...fr('c', 'Group size numerator', 12), min: 1 },
          den('d', 'Group size denominator'),
          { ...whole('m', 'm', 'Common denominator', 1, 144), derived: true },
          {
            id: 'g',
            symbol: 'g',
            name: 'Number of groups',
            min: 0,
            max: 1200,
            fraction: 144,
            derived: true,
          },
        ],
        relations: [
          most144,
          {
            id: 'm = LCM of b and d',
            display: 'least common multiple of {b} and {d}: {m}',
            words: 'Least common multiple of the denominators = common denominator',
            vars: ['m', 'b', 'd'],
            residual: (v: Values) => v.m! - lcm(v.b!, v.d!),
            solve: { m: (v: Values) => lcm(v.b!, v.d!), b: () => undefined, d: () => undefined },
          },
          {
            id: 'g = (a × m ÷ b) ÷ (c × m ÷ d)',
            display: '{a}/{b} ÷ {c}/{d} = {g}',
            words: 'Amount in the common denominator ÷ group size in it = number of groups',
            vars: ['g', 'a', 'b', 'c', 'd'],
            residual: (v: Values) => v.g! * v.c! * v.b! - v.a! * v.d!,
            solve: {
              g: (v: Values) => q(v.a! * v.d!, v.b! * v.c!),
              a: () => undefined,
              b: () => undefined,
              c: () => undefined,
              d: () => undefined,
            },
          },
        ],
        steps: {
          'quotient ≤ 144': {},
          'm = LCM of b and d': {
            m: {
              expr: 'least common multiple of {b} and {d}',
              how: 'The least common multiple of the two denominators.',
              work: (v) =>
                v.b === v.d
                  ? [`Both denominators are already ${v.b}`]
                  : [
                      `Multiples of ${v.b}: ${Array.from({ length: v.m! / v.b! }, (_, i) => (i + 1) * v.b!).join(', ')}`,
                      `Multiples of ${v.d}: ${Array.from({ length: v.m! / v.d! }, (_, i) => (i + 1) * v.d!).join(', ')}`,
                    ],
            },
          },
          'g = (a × m ÷ b) ÷ (c × m ÷ d)': {
            g: {
              expr: '{a}/{b} ÷ {c}/{d}',
              how: 'Write both with the common denominator. Then divide the numerators.',
              work: (v) => {
                const [A, C] = [(v.a! * v.m!) / v.b!, (v.c! * v.m!) / v.d!];
                return [
                  ...(v.b === v.d
                    ? []
                    : [`${v.a}/${v.b} = ${A}/${v.m} and ${v.c}/${v.d} = ${C}/${v.m}`]),
                  A % C === 0 ? `${A} ÷ ${C} = ${A / C}` : `${A} ÷ ${C} = ${A}/${C}`,
                ];
              },
              note: (v) => {
                const [A, C] = [(v.a! * v.m!) / v.b!, (v.c! * v.m!) / v.d!];
                const full = Math.floor(A / C);
                const left = A - full * C;
                return left === 0
                  ? ''
                  : `(${mixed(A, C)}: ${full} full group${full === 1 ? '' : 's'} and ${left}/${C} of a group)`;
              },
              written: false,
            },
          },
        },
        example: { a: 9, b: 4, c: 3, d: 4, m: 4, g: 3 },
        startWith: ['a', 'b', 'c', 'd'],
        representation: {
          kind: 'fractionFit',
          dividend: { num: 'a', den: 'b' },
          divisor: { num: 'c', den: 'd' },
          quotient: 'g',
          mode: 'groups',
          wholes: 3,
        },
      },
      {
        id: 'm.6.divide-fractions~how-much-in-one',
        sliders: false,
        equation: '{a}/{b} ÷ {c}/{d} = {e}/{f}',
        title: 'How much in one group?',
        use: 'Use this when 2/3 gallon fills 3/4 of a tank: how much fills the whole tank?',
        assumptions: [
          'The amount fills part of one group. Find one of those parts, then the whole group.',
          'This is the same as dividing the amount by the fraction of a group.',
          'Denominators from 1 to 20; the whole group is at most 144 times the amount.',
        ],
        variables: [
          fr('a', 'Amount numerator'),
          den('b', 'Amount denominator'),
          { ...fr('c', 'Fraction of a group it fills: numerator', 12), min: 1 },
          den('d', 'Fraction of a group it fills: denominator'),
          { ...fr('e', 'Whole group numerator', 2000), derived: true },
          { ...fr('f', 'Whole group denominator', 240), min: 1, derived: true },
        ],
        relations: [
          most144,
          {
            id: 'f = b × c',
            display: '{a}/{b} ÷ {c} = {a}/{f}',
            words: 'Amount ÷ parts it fills = one part',
            shows: ['a'],
            check: (v: Values) => `${v.b} × ${v.c} = ${v.f}`,
            vars: ['f', 'b', 'c'],
            residual: (v: Values) => v.f! - v.b! * v.c!,
            solve: { f: (v: Values) => v.b! * v.c!, b: () => undefined, c: () => undefined },
          },
          {
            id: 'e = a × d',
            display: '{d} × {a}/{f} = {e}/{f}',
            words: 'Denominator of the fraction it fills × one part = whole group',
            shows: ['f'],
            check: (v: Values) => `${v.d} × ${v.a} = ${v.e}`,
            vars: ['e', 'a', 'd'],
            residual: (v: Values) => v.e! - v.a! * v.d!,
            solve: { e: (v: Values) => v.a! * v.d!, a: () => undefined, d: () => undefined },
          },
        ],
        steps: {
          'quotient ≤ 144': {},
          'f = b × c': {
            f: {
              expr: '{b} × {c}',
              how: (v) =>
                `The amount fills ${v.c} parts of the group. One part is the amount ÷ ${v.c}: multiply the denominator by ${v.c}.`,
            },
          },
          'e = a × d': {
            e: {
              expr: '{a} × {d}',
              how: (v) =>
                `The whole group is ${v.d} of those parts: multiply the numerator by ${v.d}.`,
              note: (v) => {
                if (['a', 'b', 'c', 'd', 'e', 'f'].some((k) => v[k] === undefined)) return '';
                const s = simplest(v.e!, v.f!);
                return `(one whole group holds ${v.e}/${v.f}: the same as ${v.a}/${v.b} ÷ ${v.c}/${v.d} = ${v.e}/${v.f}${s ? `; ${s}` : ''})`;
              },
            },
          },
        },
        example: { a: 2, b: 3, c: 3, d: 4, f: 9, e: 8 },
        startWith: ['a', 'b', 'c', 'd'],
        representation: {
          kind: 'fractionFit',
          dividend: { num: 'a', den: 'b' },
          divisor: { num: 'c', den: 'd' },
          quotient: 'e',
          mode: 'share',
          wholes: 1,
        },
      },
    ];
    return pages;
  })(),

  // ── Greatest common factor and least common multiple (6.NS.4) ──
  {
    id: 'm.6.gcf-lcm',
    sliders: true,
    assumptions: [
      'A common factor divides both numbers with nothing left over.',
      '1 is a common factor of any two numbers.',
      'Whole numbers from 1 to 100.',
    ],
    variables: [
      whole('a', 'a', 'First number', 1, 100),
      whole('b', 'b', 'Second number', 1, 100),
      { ...whole('g', 'g', 'Greatest common factor', 1, 100), derived: true },
    ],
    relations: [
      {
        id: 'g = GCF of a and b',
        display: 'greatest common factor of {a} and {b}: {g}',
        words: 'The greatest number that divides both = greatest common factor',
        vars: ['g', 'a', 'b'],
        residual: (v: Values) => v.g! - gcd(v.a!, v.b!),
        solve: { g: (v: Values) => gcd(v.a!, v.b!), a: () => undefined, b: () => undefined },
      },
    ],
    steps: {
      'g = GCF of a and b': {
        g: {
          expr: 'greatest common factor of {a} and {b}',
          how: 'List the factors of each number. Find the ones in both lists; take the greatest.',
          work: (v) => {
            const [fa, fb] = [factorsOf(v.a!), factorsOf(v.b!)];
            const both = fa.filter((x) => fb.includes(x));
            return [
              `Factors of ${v.a}: ${fa.join(', ')}`,
              `Factors of ${v.b}: ${fb.join(', ')}`,
              `Common factors: ${both.join(', ')}`,
            ];
          },
        },
      },
    },
    example: { a: 12, b: 18, g: 6 },
    startWith: ['a', 'b'],
    representation: { kind: 'venn', first: 'a', second: 'b', list: 'factors', gcf: 'g' },
  },
  {
    id: 'm.6.gcf-lcm~lcm',
    title: 'Least common multiple',
    use: 'Use this for “What is the least common multiple of 10 and 15?”',
    assumptions: [
      'A multiple is the number times 1, 2, 3 and so on.',
      'The least common multiple is the first number in both lists.',
      'Whole numbers from 1 to 12.',
    ],
    variables: [
      whole('a', 'a', 'First number', 1, 12),
      whole('b', 'b', 'Second number', 1, 12),
      { ...whole('l', 'l', 'Least common multiple', 1, 144), derived: true },
    ],
    relations: [
      {
        id: 'l = LCM of a and b',
        display: 'least common multiple of {a} and {b}: {l}',
        words: 'First number in both lists of multiples = least common multiple',
        vars: ['l', 'a', 'b'],
        residual: (v: Values) => v.l! - lcm(v.a!, v.b!),
        solve: { l: (v: Values) => lcm(v.a!, v.b!), a: () => undefined, b: () => undefined },
      },
    ],
    steps: {
      'l = LCM of a and b': {
        l: {
          expr: 'least common multiple of {a} and {b}',
          how: 'Count by each number. The first number in both lists is the LCM.',
          work: (v) => {
            const list = (n: number) =>
              Array.from({ length: v.l! / n }, (_, i) => (i + 1) * n).join(', ');
            return [`Multiples of ${v.a}: ${list(v.a!)}`, `Multiples of ${v.b}: ${list(v.b!)}`];
          },
        },
      },
    },
    example: { a: 6, b: 8, l: 24 },
    startWith: ['a', 'b'],
    representation: { kind: 'skipCount', step: 'a', total: 'l', second: { step: 'b' } },
  },
  {
    id: 'm.6.gcf-lcm~factor-tree',
    title: 'Prime factorization',
    use: 'Use this for “Find the greatest common factor of 90 and 75.”',
    assumptions: [
      'Split each number until every branch ends in a prime.',
      'The primes both numbers share multiply to the GCF.',
      'The LCM is the GCF times the primes left over from each number.',
    ],
    variables: [
      whole('a', 'a', 'First number', 2, 100),
      whole('b', 'b', 'Second number', 2, 100),
      { ...whole('g', 'g', 'Greatest common factor', 1, 100), derived: true },
      { ...whole('l', 'l', 'Least common multiple', 2, 10000), derived: true },
    ],
    relations: [
      {
        id: 'g = shared primes of a and b',
        display: 'shared prime factors of {a} and {b}: {g}',
        words: 'Primes both numbers share, multiplied = greatest common factor',
        vars: ['g', 'a', 'b'],
        residual: (v: Values) => v.g! - gcd(v.a!, v.b!),
        solve: { g: (v: Values) => gcd(v.a!, v.b!), a: () => undefined, b: () => undefined },
      },
      {
        id: 'l = a × b ÷ g',
        display: '{g} × ({a} ÷ {g}) × ({b} ÷ {g}) = {l}',
        words: 'GCF × primes left in the first × primes left in the second = least common multiple',
        check: (v: Values) => `${v.g} × ${fmt(v.l!)} = ${v.a} × ${v.b}`,
        vars: ['l', 'a', 'b', 'g'],
        residual: (v: Values) => v.l! * v.g! - v.a! * v.b!,
        solve: {
          l: (v: Values) => div(v.a! * v.b!, v.g!),
          a: () => undefined,
          b: () => undefined,
          g: () => undefined,
        },
      },
    ],
    steps: {
      'g = shared primes of a and b': {
        g: {
          expr: 'shared prime factors of {a} and {b}',
          how: 'Write each number as primes. Multiply the primes they share, as many times as both have them.',
          work: (v) => {
            const [pa, pb] = [primeFactors(v.a!), primeFactors(v.b!)];
            const rest = [...pb];
            const shared = pa.filter((p) => {
              const i = rest.indexOf(p);
              if (i < 0) return false;
              rest.splice(i, 1);
              return true;
            });
            const line = (n: number, ps: number[]) =>
              ps.length > 1 && powers(ps) !== ps.join(' × ')
                ? `${n} = ${ps.join(' × ')} = ${superscript(powers(ps))}`
                : `${n} = ${ps.join(' × ')}`;
            return [
              line(v.a!, pa),
              line(v.b!, pb),
              shared.length
                ? `Shared primes: ${shared.join(' × ')} = ${v.g}`
                : 'No shared primes: the GCF is 1',
            ];
          },
        },
      },
      'l = a × b ÷ g': {
        l: {
          expr: '{g} × ({a} ÷ {g}) × ({b} ÷ {g})',
          how: 'Start with the shared primes (the GCF). Multiply by the primes left over from each number.',
        },
      },
    },
    example: { a: 24, b: 36, g: 12, l: 72 },
    startWith: ['a', 'b'],
    representation: { kind: 'factorTree', value: 'a', second: 'b', gcf: 'g', lcm: 'l' },
  },
  {
    id: 'm.6.gcf-lcm~distributive',
    title: 'Factor out the GCF',
    use: 'Use this for “Write 36 + 8 as a product of the GCF and a sum.”',
    assumptions: [
      'Both numbers are multiples of their GCF, so the sum is the GCF times a sum.',
      'Multiplying back gives the same sum: 4 × 9 + 4 × 2 = 36 + 8.',
      'Whole numbers from 1 to 100.',
    ],
    variables: [
      whole('a', 'a', 'First number', 1, 100),
      whole('b', 'b', 'Second number', 1, 100),
      { ...whole('g', 'g', 'Greatest common factor', 1, 100), derived: true },
      { ...whole('x', 'x', 'First number inside the parentheses', 1, 100), derived: true },
      { ...whole('y', 'y', 'Second number inside the parentheses', 1, 100), derived: true },
      { ...whole('s', 's', 'Sum', 2, 200), derived: true },
    ],
    relations: [
      {
        id: 'g = GCF of a and b',
        display: 'greatest common factor of {a} and {b}: {g}',
        words: 'Greatest factor of both numbers = greatest common factor',
        vars: ['g', 'a', 'b'],
        residual: (v: Values) => v.g! - gcd(v.a!, v.b!),
        solve: { g: (v: Values) => gcd(v.a!, v.b!), a: () => undefined, b: () => undefined },
      },
      {
        id: 'x = a ÷ g',
        display: '{a} ÷ {g} = {x}',
        words: 'First number ÷ GCF = {x}',
        check: (v: Values) => `${v.g} × ${v.x} = ${v.a}`,
        vars: ['x', 'a', 'g'],
        residual: (v: Values) => v.x! * v.g! - v.a!,
        solve: { x: (v: Values) => div(v.a!, v.g!), a: () => undefined, g: () => undefined },
      },
      {
        id: 'y = b ÷ g',
        display: '{b} ÷ {g} = {y}',
        words: 'Second number ÷ GCF = {y}',
        check: (v: Values) => `${v.g} × ${v.y} = ${v.b}`,
        vars: ['y', 'b', 'g'],
        residual: (v: Values) => v.y! * v.g! - v.b!,
        solve: { y: (v: Values) => div(v.b!, v.g!), b: () => undefined, g: () => undefined },
      },
      {
        id: 's = g × (x + y)',
        display: '{g} × ({x} + {y}) = {s}',
        words: 'GCF × (first ÷ GCF + second ÷ GCF) = sum',
        check: (v: Values) => `${v.a} + ${v.b} = ${v.s}`,
        vars: ['s', 'g', 'x', 'y'],
        residual: (v: Values) => v.s! - v.g! * (v.x! + v.y!),
        solve: {
          s: (v: Values) => v.g! * (v.x! + v.y!),
          g: () => undefined,
          x: () => undefined,
          y: () => undefined,
        },
      },
    ],
    steps: {
      'g = GCF of a and b': {
        g: {
          expr: 'greatest common factor of {a} and {b}',
          how: 'List the factors of each number and take the greatest one in both lists.',
          work: (v) => [
            `Factors of ${v.a}: ${factorsOf(v.a!).join(', ')}`,
            `Factors of ${v.b}: ${factorsOf(v.b!).join(', ')}`,
          ],
        },
      },
      'x = a ÷ g': { x: { expr: '{a} ÷ {g}', how: 'How many of the GCF make the first number?' } },
      'y = b ÷ g': { y: { expr: '{b} ÷ {g}', how: 'How many of the GCF make the second number?' } },
      's = g × (x + y)': {
        s: {
          expr: '{g} × ({x} + {y})',
          how: 'The sum is the GCF times the two numbers left inside the parentheses.',
          note: (v) =>
            v.g === 1
              ? '(the GCF is 1: nothing bigger to factor out)'
              : `(${v.a} + ${v.b} = ${v.g} × (${v.x} + ${v.y}))`,
        },
      },
    },
    example: { a: 36, b: 8, g: 4, x: 9, y: 2, s: 44 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'areaModel',
      top: ['x', 'y'],
      side: ['g'],
      parts: [['a', 'b']],
      total: 's',
    },
  },

  // ── Negative numbers and absolute value (6.NS.5–7) ──
  {
    id: 'm.6.integers',
    assumptions: [
      'Numbers left of 0 are negative; numbers right of 0 are positive.',
      'The opposite of the opposite is the number: −(−4) = 4.',
      'Absolute value is the distance from 0, so it is never negative.',
      'Numbers from −100 to 100, in quarters.',
    ],
    variables: [
      { id: 'n', symbol: 'n', name: 'Number', min: -100, max: 100, step: 0.25, multipleOf: 0.25 },
      {
        id: 'o',
        symbol: 'o',
        name: 'Its opposite',
        min: -100,
        max: 100,
        step: 0.25,
        multipleOf: 0.25,
      },
      {
        id: 'a',
        symbol: 'a',
        name: 'Its absolute value',
        min: 0,
        max: 100,
        step: 0.25,
        multipleOf: 0.25,
      },
    ],
    relations: [
      {
        id: 'o = −n',
        display: '−{n} = {o}',
        words: 'The number with its sign changed = {o}',
        vars: ['o', 'n'],
        residual: (v: Values) => v.o! + v.n!,
        solve: { o: (v: Values) => 0 - v.n! || 0, n: (v: Values) => 0 - v.o! || 0 },
      },
      {
        id: 'a = |n|',
        display: '|{n}| = {a}',
        words: 'Distance of the number from 0 = {a}',
        vars: ['a', 'n'],
        residual: (v: Values) => v.a! - Math.abs(v.n!),
        solve: {
          a: (v: Values) => Math.abs(v.n!),
          n: (v: Values) => (v.a! === 0 ? 0 : [v.a!, -v.a!]),
        },
      },
    ],
    steps: {
      'o = −n': {
        o: {
          expr: (v) => (v.n === 0 ? '{n}' : '−{n}'),
          how: 'The opposite is the same distance from 0, on the other side of 0.',
          note: (v) => (v.n === 0 ? '(0 is its own opposite)' : ''),
        },
        n: {
          expr: (v) => (v.o === 0 ? '{o}' : '−{o}'),
          how: 'The number is the opposite of its opposite.',
        },
      },
      'a = |n|': {
        a: {
          expr: '|{n}|',
          how: 'Absolute value is the distance from 0: the number without its sign.',
        },
        n: {
          expr: (v) => (v.n! < 0 ? '−{a}' : '{a}'),
          how: 'Two numbers are that far from 0: one on each side.',
          note: (v) =>
            v.a === 0 ? '' : `(${fmt(v.a!)} and −${fmt(v.a!)} are both ${fmt(v.a!)} from 0)`,
        },
      },
    },
    example: { n: -4, o: 4, a: 4 },
    startWith: ['n'],
    representation: {
      kind: 'integerLine',
      value: 'n',
      opposite: 'o',
      absolute: 'a',
      min: -10,
      max: 10,
    },
  },
  {
    id: 'm.6.integers~change',
    title: 'How much warmer or colder?',
    use: 'Use this for the change from −5 °C up to 3 °C, or a drop from 8 °C to −2 °C.',
    assumptions: [
      'The change is the distance on the thermometer from the morning to the afternoon: positive when it rises, negative when it drops.',
      'Below 0 and above 0: add the two distances from 0.',
      'A higher temperature is warmer: −3 °C > −7 °C because −3 is higher up.',
      'Temperatures from −40 °C to 50 °C.',
    ],
    unitSystems: ['metric'],
    variables: [
      {
        id: 'm',
        symbol: 'm',
        name: 'Morning temperature',
        unit: '°C',
        min: -40,
        max: 50,
        step: 0.5,
        multipleOf: 0.5,
      },
      {
        id: 'n',
        symbol: 'n',
        name: 'Afternoon temperature',
        unit: '°C',
        min: -40,
        max: 50,
        step: 0.5,
        multipleOf: 0.5,
      },
      {
        id: 'r',
        symbol: 'r',
        name: 'Change',
        unit: '°C',
        min: -90,
        max: 90,
        step: 0.5,
        multipleOf: 0.5,
      },
    ],
    relations: [
      {
        id: 'r = n − m',
        display: 'The change from {m} to {n} is {r}',
        words: 'Afternoon temperature − morning temperature = change',
        check: (v: Values) => apartLine(v.m!, v.n!),
        vars: ['r', 'n', 'm'],
        residual: (v: Values) => v.r! - (v.n! - v.m!),
        solve: {
          r: (v: Values) => exact(v.n! - v.m!),
          n: (v: Values) => exact(v.m! + v.r!),
          m: (v: Values) => exact(v.n! - v.r!),
        },
      },
    ],
    steps: {
      'r = n − m': {
        r: {
          expr: 'change from {m} to {n}',
          how: (v) =>
            v.r! >= 0
              ? 'Count up the thermometer from the morning to the afternoon.'
              : 'Count down the thermometer from the morning to the afternoon: a drop is negative.',
          work: (v) => {
            const [lo, hi] = [Math.min(v.m!, v.n!), Math.max(v.m!, v.n!)];
            const way = v.r! >= 0 ? 'up' : 'down';
            const lines =
              lo < 0 && hi > 0
                ? [
                    `From ${sgn(v.m!)} ${way} to 0 is ${fmt(Math.abs(v.m!))}`,
                    `From 0 ${way} to ${sgn(v.n!)} is ${fmt(Math.abs(v.n!))}`,
                    `${fmt(Math.abs(v.m!))} + ${fmt(Math.abs(v.n!))} = ${fmt(Math.abs(v.r!))}`,
                  ]
                : [sidesLine(v.m!, v.n!), apartLine(v.m!, v.n!)];
            return v.r! < 0
              ? [...lines, `A drop of ${fmt(-v.r!)} °C is a change of −${fmt(-v.r!)} °C.`]
              : lines;
          },
          note: (v) =>
            v.r === 0
              ? '(no change)'
              : v.r! > 0
                ? `(${sgn(v.n!)} °C > ${sgn(v.m!)} °C: warmer)`
                : `(${sgn(v.n!)} °C < ${sgn(v.m!)} °C: colder)`,
          written: false,
        },
        n: {
          expr: '{m} + {r}',
          how: 'Count the change from the morning temperature: up if it rises, down if it drops.',
          written: false,
        },
        m: {
          expr: '{n} − {r}',
          how: 'Undo the change from the afternoon temperature.',
          written: false,
        },
      },
    },
    example: { m: -5, n: 3, r: 8 },
    startWith: ['m', 'n'],
    representation: {
      kind: 'integerLine',
      value: 'm',
      second: 'n',
      change: 'r',
      min: -10,
      max: 10,
      vertical: true,
      unit: '°C',
    },
  },

  {
    id: 'm.6.integers~compare',
    title: 'Compare rational numbers',
    use: 'Use this to compare −12.5 and −12, or |−7| and 5, on the number line.',
    assumptions: [
      'On a number line, the number further right is greater: −12 > −12.5.',
      'For negative numbers, the one closer to 0 is greater, though its absolute value is smaller.',
      'Absolute value is the distance from 0; comparing distances is not comparing the numbers.',
      'Numbers from −100 to 100.',
    ],
    variables: [
      { id: 'x', symbol: 'x', name: 'First number', min: -100, max: 100, step: 0.25 },
      { id: 'y', symbol: 'y', name: 'Second number', min: -100, max: 100, step: 0.25 },
      {
        id: 'p',
        symbol: 'p',
        name: 'First number’s absolute value',
        min: 0,
        max: 100,
        derived: true,
      },
      {
        id: 'q',
        symbol: 'q',
        name: 'Second number’s absolute value',
        min: 0,
        max: 100,
        derived: true,
      },
      { id: 'g', symbol: 'g', name: 'Distance apart', min: 0, max: 200, derived: true },
    ],
    relations: [
      {
        id: 'p = |x|',
        display: '|{x}| = {p}',
        vars: ['p', 'x'],
        residual: (v: Values) => v.p! - Math.abs(v.x!),
        solve: { p: (v: Values) => Math.abs(v.x!), x: () => undefined },
      },
      {
        id: 'q = |y|',
        display: '|{y}| = {q}',
        vars: ['q', 'y'],
        residual: (v: Values) => v.q! - Math.abs(v.y!),
        solve: { q: (v: Values) => Math.abs(v.y!), y: () => undefined },
      },
      {
        id: 'g = distance from x to y',
        display: 'From {x} to {y} is {g}',
        words: 'Distance between the two numbers on the line = {g}',
        check: (v: Values) => apartLine(v.x!, v.y!),
        vars: ['g', 'x', 'y'],
        residual: (v: Values) => v.g! - Math.abs(v.y! - v.x!),
        solve: {
          g: (v: Values) => exact(Math.abs(v.y! - v.x!)),
          x: () => undefined,
          y: () => undefined,
        },
      },
    ],
    steps: {
      'p = |x|': { p: { expr: '|{x}|', how: 'The first number’s distance from 0.' } },
      'q = |y|': { q: { expr: '|{y}|', how: 'The second number’s distance from 0.' } },
      'g = distance from x to y': {
        g: {
          expr: 'From {x} to {y}',
          how: 'Place both on the line. The one further right is greater.',
          work: (v) => [sidesLine(v.x!, v.y!), apartLine(v.x!, v.y!)],
          note: (v) => {
            const sign = v.x! < v.y! ? '<' : v.x! > v.y! ? '>' : '=';
            const abs = v.p! < v.q! ? '<' : v.p! > v.q! ? '>' : '=';
            return `(${sgn(v.x!)} ${sign} ${sgn(v.y!)}; |${sgn(v.x!)}| ${abs} |${sgn(v.y!)}|)`;
          },
        },
      },
    },
    example: { x: -12.5, y: -12, p: 12.5, q: 12, g: 0.5 },
    startWith: ['x', 'y'],
    representation: {
      kind: 'integerLine',
      value: 'x',
      second: 'y',
      change: 'g',
      min: -20,
      max: 20,
    },
  },

  // ── The coordinate plane in four quadrants (6.NS.6b–c, 6.NS.8, 6.G.3) ──
  (() => {
    const coord = (id: string, name: string) => ({
      id,
      symbol: id,
      name,
      min: -10000,
      max: 10000,
      step: 0.5,
      multipleOf: 0.5,
    });
    /** Points on one row or one column only. */
    const lined = {
      id: 'same row or column',
      constraint: true as const,
      display: '({x1}, {y1}) and ({x2}, {y2}) are on the same row or column',
      vars: ['x1', 'y1', 'x2', 'y2'],
      residual: (v: Values) => (v.x1 === v.x2 || v.y1 === v.y2 ? 0 : 1),
      solve: {},
    };
    const pages: ModuleDef[] = [
      {
        id: 'm.6.coordinate-plane-4q',
        assumptions: [
          'Use two points on the same row (the same y-coordinate) or the same column (the same x-coordinate).',
          'On opposite sides of an axis, add the distances from the axis; on the same side, subtract.',
          'Coordinates from −10,000 to 10,000 (a map of elevations); the distance is in units.',
        ],
        variables: [
          coord('x1', 'First point’s x-coordinate'),
          coord('y1', 'First point’s y-coordinate'),
          coord('x2', 'Second point’s x-coordinate'),
          coord('y2', 'Second point’s y-coordinate'),
          {
            id: 'd',
            symbol: 'd',
            name: 'Distance',
            min: 0,
            max: 20000,
            step: 0.5,
            multipleOf: 0.5,
          },
        ],
        relations: [
          lined,
          {
            id: 'd = distance',
            display: 'Distance from ({x1}, {y1}) to ({x2}, {y2}): {d}',
            words: 'Add or subtract the distances from 0 = {d}',
            check: (v: Values) =>
              v.y1 === v.y2 ? apartLine(v.x1!, v.x2!) : apartLine(v.y1!, v.y2!),
            vars: ['d', 'x1', 'y1', 'x2', 'y2'],
            residual: (v: Values) => v.d! - Math.abs(v.x2! - v.x1!) - Math.abs(v.y2! - v.y1!),
            solve: {
              d: (v: Values) => Math.abs(v.x2! - v.x1!) + Math.abs(v.y2! - v.y1!),
              x2: (v: Values) => (v.y1 === v.y2 ? [v.x1! + v.d!, v.x1! - v.d!] : v.x1!),
              x1: (v: Values) => (v.y1 === v.y2 ? [v.x2! - v.d!, v.x2! + v.d!] : v.x2!),
              y2: (v: Values) => (v.x1 === v.x2 ? [v.y1! + v.d!, v.y1! - v.d!] : v.y1!),
              y1: (v: Values) => (v.x1 === v.x2 ? [v.y2! - v.d!, v.y2! + v.d!] : v.y2!),
            },
          },
        ],
        steps: {
          'same row or column': {},
          'd = distance': {
            d: {
              expr: 'Distance from ({x1}, {y1}) to ({x2}, {y2})',
              how: 'The points share a coordinate, so count along one line between them.',
              work: (v) =>
                v.y1 === v.y2
                  ? [
                      `Same y-coordinate (${sgn(v.y1!)}): the points are on one row. Use the x-coordinates.`,
                      sidesLine(v.x1!, v.x2!),
                      apartLine(v.x1!, v.x2!),
                    ]
                  : [
                      `Same x-coordinate (${sgn(v.x1!)}): the points are on one column. Use the y-coordinates.`,
                      sidesLine(v.y1!, v.y2!),
                      apartLine(v.y1!, v.y2!),
                    ],
              written: false,
            },
            x2: {
              expr: (v) => (v.y1 !== v.y2 ? '{x1}' : v.x2! >= v.x1! ? '{x1} + {d}' : '{x1} − {d}'),
              how: (v) =>
                v.y1 !== v.y2
                  ? 'The points are on one column: the same x-coordinate.'
                  : 'Count the distance along the row from the first point.',
              note: (v) => (v.y1 === v.y2 && v.d ? '(the other way works too)' : ''),
              written: false,
            },
            x1: {
              expr: (v) => (v.y1 !== v.y2 ? '{x2}' : v.x1! >= v.x2! ? '{x2} + {d}' : '{x2} − {d}'),
              how: (v) =>
                v.y1 !== v.y2
                  ? 'The points are on one column: the same x-coordinate.'
                  : 'Count the distance along the row from the second point.',
              note: (v) => (v.y1 === v.y2 && v.d ? '(the other way works too)' : ''),
              written: false,
            },
            y2: {
              expr: (v) => (v.x1 !== v.x2 ? '{y1}' : v.y2! >= v.y1! ? '{y1} + {d}' : '{y1} − {d}'),
              how: (v) =>
                v.x1 !== v.x2
                  ? 'The points are on one row: the same y-coordinate.'
                  : 'Count the distance along the column from the first point.',
              note: (v) => (v.x1 === v.x2 && v.d ? '(the other way works too)' : ''),
              written: false,
            },
            y1: {
              expr: (v) => (v.x1 !== v.x2 ? '{y2}' : v.y1! >= v.y2! ? '{y2} + {d}' : '{y2} − {d}'),
              how: (v) =>
                v.x1 !== v.x2
                  ? 'The points are on one row: the same y-coordinate.'
                  : 'Count the distance along the column from the second point.',
              note: (v) => (v.x1 === v.x2 && v.d ? '(the other way works too)' : ''),
              written: false,
            },
          },
        },
        example: { x1: -4, y1: 3, x2: 5, y2: 3, d: 9 },
        startWith: ['x1', 'y1', 'x2', 'y2'],
        representation: {
          kind: 'coordinatePlane',
          x: 'x1',
          y: 'y1',
          second: { x: 'x2', y: 'y2' },
          segment: true,
          distance: 'd',
          extent: 10,
          quadrants: 4,
        },
      },
      {
        id: 'm.6.coordinate-plane-4q~reflect',
        title: 'Reflect across the axes',
        use: 'Use this for “Reflect (3, −4) across the x-axis. Which quadrant is it in?”',
        assumptions: [
          'Across the x-axis the y-coordinate changes sign; across the y-axis the x-coordinate does.',
          'Across both axes, both change sign.',
          'Coordinates from −10,000 to 10,000. A point on an axis is in no quadrant (0).',
        ],
        variables: [
          coord('x', 'x-coordinate'),
          coord('y', 'y-coordinate'),
          coord('p', 'Opposite of the x-coordinate'),
          coord('q', 'Opposite of the y-coordinate'),
          { ...whole('Q', 'Q', 'Quadrant', 0, 4), derived: true },
        ],
        relations: [
          {
            id: 'Q = quadrant of (x, y)',
            display: 'Quadrant of ({x}, {y}): {Q}',
            words: 'Quadrant from the signs of the coordinates = {Q}',
            vars: ['Q', 'x', 'y'],
            residual: (v: Values) => v.Q! - quadrant(v.x!, v.y!),
            solve: {
              Q: (v: Values) => quadrant(v.x!, v.y!),
              x: () => undefined,
              y: () => undefined,
            },
          },
          {
            id: 'p = −x',
            display: '−{x} = {p}',
            words: 'The x-coordinate with its sign changed = {p}',
            vars: ['p', 'x'],
            residual: (v: Values) => v.p! + v.x!,
            solve: { p: (v: Values) => 0 - v.x! || 0, x: (v: Values) => 0 - v.p! || 0 },
          },
          {
            id: 'q = −y',
            display: '−{y} = {q}',
            words: 'The y-coordinate with its sign changed = {q}',
            vars: ['q', 'y'],
            residual: (v: Values) => v.q! + v.y!,
            solve: { q: (v: Values) => 0 - v.y! || 0, y: (v: Values) => 0 - v.q! || 0 },
          },
        ],
        steps: {
          'Q = quadrant of (x, y)': {
            Q: {
              expr: 'Quadrant of ({x}, {y})',
              how: 'Read the signs: (+, +) is I, (−, +) is II, (−, −) is III, (+, −) is IV.',
              note: (v) =>
                v.Q === 0 ? '(on an axis)' : `(quadrant ${['', 'I', 'II', 'III', 'IV'][v.Q!]})`,
            },
          },
          'p = −x': {
            p: {
              expr: (v) => (v.x === 0 ? '{x}' : '−{x}'),
              how: 'Across the y-axis the point flips left to right: the x-coordinate changes sign.',
              note: (v) =>
                v.y === undefined ? '' : `(across the y-axis: (${sgn(-v.x! || 0)}, ${sgn(v.y)}))`,
            },
            x: {
              expr: (v) => (v.p === 0 ? '{p}' : '−{p}'),
              how: 'The x-coordinate is the opposite of its opposite.',
            },
          },
          'q = −y': {
            q: {
              expr: (v) => (v.y === 0 ? '{y}' : '−{y}'),
              how: 'Across the x-axis the point flips top to bottom: the y-coordinate changes sign.',
              note: (v) =>
                v.x === undefined
                  ? ''
                  : `(across the x-axis: (${sgn(v.x)}, ${sgn(-v.y! || 0)}); across both: (${sgn(-v.x || 0)}, ${sgn(-v.y! || 0)}))`,
            },
            y: {
              expr: (v) => (v.q === 0 ? '{q}' : '−{q}'),
              how: 'The y-coordinate is the opposite of its opposite.',
            },
          },
        },
        example: { x: 3, y: -2, p: -3, q: 2, Q: 4 },
        startWith: ['x', 'y'],
        representation: {
          kind: 'coordinatePlane',
          x: 'x',
          y: 'y',
          reflect: true,
          quadrantLabels: true,
          extent: 10,
          quadrants: 4,
        },
      },
      {
        id: 'm.6.coordinate-plane-4q~polygon',
        title: 'Rectangles on the coordinate plane',
        use: 'Use this for “A rectangle has corners at (−2, 3) and (5, −2). Find its area.”',
        assumptions: [
          'The sides run along the grid, so each side is a distance on one row or one column.',
          'Area = width × height; perimeter = 2 × (width + height).',
          'Coordinates from −10,000 to 10,000; lengths in units, area in square units.',
        ],
        variables: [
          { ...coord('l', 'Left x-coordinate'), max: 9999.5 },
          { ...coord('r', 'Right x-coordinate'), min: -9999.5 },
          { ...coord('b', 'Bottom y-coordinate'), max: 9999.5 },
          { ...coord('t', 'Top y-coordinate'), min: -9999.5 },
          {
            id: 'w',
            symbol: 'w',
            name: 'Width',
            unit: 'units',
            min: 0.5,
            max: 20000,
            step: 0.5,
            multipleOf: 0.5,
          },
          {
            id: 'h',
            symbol: 'h',
            name: 'Height',
            unit: 'units',
            min: 0.5,
            max: 20000,
            step: 0.5,
            multipleOf: 0.5,
          },
          {
            id: 'A',
            symbol: 'A',
            name: 'Area',
            unit: 'square units',
            min: 0,
            max: 400000000,
            derived: true,
          },
          {
            id: 'P',
            symbol: 'P',
            name: 'Perimeter',
            unit: 'units',
            min: 0,
            max: 80000,
            derived: true,
          },
        ],
        relations: [
          {
            id: 'w = r − l',
            display: 'From {l} across to {r}: {w}',
            words: 'From the left x-coordinate across to the right one = width',
            check: (v: Values) => apartLine(v.l!, v.r!),
            vars: ['w', 'r', 'l'],
            residual: (v: Values) => v.w! - (v.r! - v.l!),
            solve: {
              w: (v: Values) => v.r! - v.l!,
              r: (v: Values) => v.l! + v.w!,
              l: (v: Values) => v.r! - v.w!,
            },
          },
          {
            id: 'h = t − b',
            display: 'From {b} up to {t}: {h}',
            words: 'From the bottom y-coordinate up to the top one = height',
            check: (v: Values) => apartLine(v.b!, v.t!),
            vars: ['h', 't', 'b'],
            residual: (v: Values) => v.h! - (v.t! - v.b!),
            solve: {
              h: (v: Values) => v.t! - v.b!,
              t: (v: Values) => v.b! + v.h!,
              b: (v: Values) => v.t! - v.h!,
            },
          },
          {
            id: 'A = w × h',
            display: '{w} × {h} = {A}',
            words: 'Width × height = area',
            vars: ['A', 'w', 'h'],
            residual: (v: Values) => v.A! - v.w! * v.h!,
            solve: {
              A: (v: Values) => v.w! * v.h!,
              w: (v: Values) => q(v.A!, v.h!),
              h: (v: Values) => q(v.A!, v.w!),
            },
          },
          {
            id: 'P = 2 × (w + h)',
            display: '2 × ({w} + {h}) = {P}',
            words: '2 × (width + height) = perimeter',
            vars: ['P', 'w', 'h'],
            residual: (v: Values) => v.P! - 2 * (v.w! + v.h!),
            solve: {
              P: (v: Values) => 2 * (v.w! + v.h!),
              w: (v: Values) => v.P! / 2 - v.h!,
              h: (v: Values) => v.P! / 2 - v.w!,
            },
          },
        ],
        steps: {
          'w = r − l': {
            w: {
              expr: 'From {l} across to {r}',
              how: 'The width is the distance along a row from the left side to the right side.',
              work: (v) => [sidesLine(v.l!, v.r!), apartLine(v.l!, v.r!)],
              written: false,
            },
            r: {
              expr: '{l} + {w}',
              how: 'Count the width to the right of the left side.',
              written: false,
            },
            l: {
              expr: '{r} − {w}',
              how: 'Count the width to the left of the right side.',
              written: false,
            },
          },
          'h = t − b': {
            h: {
              expr: 'From {b} up to {t}',
              how: 'The height is the distance along a column from the bottom up to the top.',
              work: (v) => [sidesLine(v.b!, v.t!), apartLine(v.b!, v.t!)],
              written: false,
            },
            t: {
              expr: '{b} + {h}',
              how: 'Count the height up from the bottom side.',
              written: false,
            },
            b: {
              expr: '{t} − {h}',
              how: 'Count the height down from the top side.',
              written: false,
            },
          },
          'A = w × h': {
            A: { expr: '{w} × {h}', how: 'Multiply the width by the height.' },
            w: { expr: '{A} ÷ {h}', how: 'Divide the area by the height.' },
            h: { expr: '{A} ÷ {w}', how: 'Divide the area by the width.' },
          },
          'P = 2 × (w + h)': {
            P: {
              expr: '2 × ({w} + {h})',
              how: 'Add the width and height, then double: two of each side.',
            },
            w: { expr: '{P} ÷ 2 − {h}', how: 'Half the perimeter is one width and one height.' },
            h: { expr: '{P} ÷ 2 − {w}', how: 'Half the perimeter is one width and one height.' },
          },
        },
        example: { l: -3, r: 4, b: -2, t: 3, w: 7, h: 5, A: 35, P: 24 },
        startWith: ['l', 'r', 'b', 't'],
        representation: {
          kind: 'coordinatePlane',
          x: 'l',
          y: 'b',
          rect: { left: 'l', right: 'r', bottom: 'b', top: 't' },
          extent: 10,
          quadrants: 4,
        },
      },
    ];
    return pages;
  })(),

  // ── Expressions with variables and exponents (6.EE.1–4, 6.EE.6, 6.EE.9) ──
  {
    id: 'm.6.expressions-variables',
    notation: 'letters',
    letters: ['x'],
    // Only x is a letter here: the coefficient and the constant are numbers in "3x + 5", so the
    // page names them in words (the plan's rule for 6.EE.2).
    assumptions: [
      '3x means 3 × x: the coefficient 3 multiplies x. The 5 in 3x + 5 is the constant.',
      'A letter stands for a number that can change.',
      'Multiply before you add or subtract. The constant can be negative: 2w − 3 adds −3.',
    ],
    variables: [
      { id: 'c', symbol: 'c', name: 'Coefficient', min: 0, max: 20, step: 0.5, multipleOf: 0.5 },
      { id: 'k', symbol: 'k', name: 'Constant', min: -100, max: 100, step: 0.5, multipleOf: 0.5 },
      {
        id: 'x',
        symbol: 'x',
        name: 'Number put in for x',
        min: 0,
        max: 100,
        step: 0.5,
        multipleOf: 0.5,
      },
      {
        id: 'e',
        symbol: 'v',
        name: 'Value of the expression',
        min: -100,
        max: 2100,
        derived: true,
      },
    ],
    relations: [
      {
        id: 'v = cx + k',
        display: '{e} = {c}{x} + {k}',
        words: 'Value = coefficient × the number for x + constant',
        sentence: (v: Values) => `${fmt(v.c!)}x ${plusMinus(v.k!)} when x = ${fmt(v.x!)}: ?`,
        check: (v: Values) => `${sgn(v.e!)} = ${fmt(v.c!)} × ${fmt(v.x!)} ${plusMinus(v.k!)}`,
        vars: ['e', 'c', 'x', 'k'],
        residual: (v: Values) => v.e! - v.c! * v.x! - v.k!,
        solve: {
          e: (v: Values) => exact(v.c! * v.x! + v.k!),
          c: () => undefined,
          x: () => undefined,
          k: () => undefined,
        },
      },
    ],
    steps: {
      'v = cx + k': {
        e: {
          // A negative constant reads as taking away: 3 × 4 − 5, not 3 × 4 + −5.
          expr: (v) => `{c} × {x} ${v.k! < 0 ? `− ${fmt(-v.k!)}` : '+ {k}'}`,
          how: (v) =>
            `Put ${fmt(v.x!)} in for x. Multiply before you ${v.k! < 0 ? 'subtract' : 'add'}.`,
        },
      },
    },
    example: { c: 3, k: 5, x: 4, e: 17 },
    startWith: ['c', 'k', 'x'],
    representation: {
      kind: 'table',
      sweep: 'x',
      output: 'e',
      params: ['c', 'k'],
      rows: (v) => [...new Set([0, 1, 2, 3, 4, 5, v.x ?? 0])].sort((a, b) => a - b),
    },
  },
  {
    id: 'm.6.expressions-variables~exponents',
    sliders: false,
    equation: '{b}^{n} = {p}',
    title: 'Powers',
    use: 'Use this for “Find the value of 3⁴.”',
    assumptions: [
      'The exponent counts how many times the base is a factor: 3⁴ is 3 × 3 × 3 × 3, not 3 × 4.',
      'Any base to the exponent 1 is the base.',
      'Bases from 0 to 20 in halves; exponents from 1 to 6.',
    ],
    variables: [
      { id: 'b', symbol: 'b', name: 'Base', min: 0, max: 20, step: 0.5, multipleOf: 0.5 },
      whole('n', 'n', 'Exponent', 1, 6),
      { id: 'p', symbol: 'p', name: 'Value', min: 0, max: 64000000, derived: true },
    ],
    relations: [
      {
        id: 'p = b^n',
        display: '{b}^{n} = {p}',
        words: 'The base used as a factor, the exponent times = value',
        vars: ['p', 'b', 'n'],
        residual: (v: Values) => v.p! - v.b! ** v.n!,
        solve: { p: (v: Values) => v.b! ** v.n!, b: () => undefined, n: () => undefined },
      },
    ],
    steps: {
      'p = b^n': {
        p: {
          expr: '{b}^{n}',
          how: (v) =>
            `Write the base ${v.n} time${v.n === 1 ? '' : 's'} as a factor, then multiply.`,
          work: (v) =>
            v.n === 1
              ? []
              : [
                  `${superscript(`${fmt(v.b!)}^${v.n}`)} = ${Array(v.n!).fill(fmt(v.b!)).join(' × ')}`,
                ],
          written: false,
        },
      },
    },
    example: { b: 3, n: 4, p: 81 },
    startWith: ['b', 'n'],
    representation: {
      kind: 'table',
      sweep: 'n',
      output: 'p',
      params: ['b'],
      rows: [1, 2, 3, 4, 5, 6],
    },
  },
  {
    id: 'm.6.expressions-variables~order-of-operations',
    sliders: false,
    equation: '{a} + {b} × {c}^{e} = {v}',
    title: 'Order of operations with exponents',
    use: 'Use this for “Find the value of 2 + 3 × 4²”: exponents first, then multiply, then add.',
    assumptions: [
      'Parentheses first, then exponents, then × and ÷, then + and −, left to right.',
      'The exponent belongs to the number just before it: 3 × 4² squares only the 4.',
      'Numbers to 100, 20 and 10; the exponent is 2 or 3.',
    ],
    variables: [
      whole('a', 'a', 'Number added', 0, 100),
      whole('b', 'b', 'Number multiplied', 0, 20),
      whole('c', 'c', 'Base', 0, 10),
      { ...whole('e', 'e', 'Exponent', 2, 3), allowed: [2, 3] },
      { ...whole('v', 'v', 'Value', 0, 20100), derived: true },
    ],
    relations: [
      {
        id: 'v = a + b × c^e',
        display: '{a} + {b} × {c}^{e} = {v}',
        words: 'Number added + number multiplied × base to the exponent = value',
        vars: ['v', 'a', 'b', 'c', 'e'],
        residual: (v: Values) => v.v! - v.a! - v.b! * v.c! ** v.e!,
        solve: {
          v: (v: Values) => v.a! + v.b! * v.c! ** v.e!,
          a: () => undefined,
          b: () => undefined,
          c: () => undefined,
          e: () => undefined,
        },
      },
    ],
    steps: {
      'v = a + b × c^e': {
        v: {
          expr: '{a} + {b} × {c}^{e}',
          how: 'Exponent first, then multiply, then add.',
          work: (v) => {
            const p = v.c! ** v.e!;
            return [
              `${superscript(`${v.c}^${v.e}`)} = ${Array(v.e!).fill(v.c).join(' × ')} = ${fmt(p)}`,
              `${v.a} + ${v.b} × ${fmt(p)} = ${v.a} + ${fmt(v.b! * p)}`,
              `${v.a} + ${fmt(v.b! * p)} = ${fmt(v.v!)}`,
            ];
          },
          written: false,
        },
      },
    },
    example: { a: 2, b: 3, c: 4, e: 2, v: 50 },
    startWith: ['a', 'b', 'c', 'e'],
    representation: {
      kind: 'table',
      sweep: 'c',
      output: 'v',
      params: ['a', 'b', 'e'],
      rows: (v) => [...new Set([0, 1, 2, 3, 4, 5, v.c ?? 0])].sort((x, y) => x - y),
    },
  },
  {
    id: 'm.6.expressions-variables~distributive',
    notation: 'letters',
    letters: ['x'],
    title: 'Equivalent expressions',
    use: 'Use this for “Are 3(2 + x) and 6 + 3x equivalent?”',

    assumptions: [
      'Equivalent expressions are equal for every value of x.',
      '3(2 + x) = 3 × 2 + 3 × x = 6 + 3x: multiply each part inside by the number outside.',
      'Like terms add: 2x + 3x = 5x.',
      'Numbers to 12 outside and 20 inside; x from 0 to 20.',
    ],
    variables: [
      whole('n', 'n', 'Number outside', 1, 12),
      whole('m', 'm', 'Number inside', 0, 20),
      {
        id: 'x',
        symbol: 'x',
        name: 'Number put in for x',
        min: 0,
        max: 20,
        step: 0.5,
        multipleOf: 0.5,
      },
      { id: 'L', symbol: 'L', name: 'Value with parentheses', min: 0, max: 480, derived: true },
      {
        id: 'u',
        symbol: 'u',
        name: 'First part',
        min: 0,
        max: 240,
        derived: true,
      },
      { id: 'w', symbol: 'w', name: 'Second part', min: 0, max: 240, derived: true },
      { id: 'R', symbol: 'R', name: 'Value multiplied out', min: 0, max: 480, derived: true },
    ],
    relations: [
      {
        id: 'L = n(m + x)',
        display: '{L} = {n}({m} + {x})',
        sentence: (v: Values) => `${v.n}(${v.m} + x) when x = ${fmt(v.x!)}: ?`,
        check: (v: Values) => `${fmt(v.L!)} = ${v.n} × (${v.m} + ${fmt(v.x!)})`,
        words: 'Value with parentheses = number outside × (number inside + the number for x)',
        vars: ['L', 'n', 'm', 'x'],
        residual: (v: Values) => v.L! - v.n! * (v.m! + v.x!),
        solve: {
          L: (v: Values) => v.n! * (v.m! + v.x!),
          n: () => undefined,
          m: () => undefined,
          x: () => undefined,
        },
      },
      {
        id: 'u = nm',
        display: '{u} = {n} × {m}',
        sentence: (v: Values) => `${v.n} × ${v.m} = ?`,
        words: 'First part = number outside × number inside',
        vars: ['u', 'n', 'm'],
        residual: (v: Values) => v.u! - v.n! * v.m!,
        solve: { u: (v: Values) => v.n! * v.m!, n: () => undefined, m: () => undefined },
      },
      {
        id: 'w = nx',
        display: '{w} = {n}{x}',
        sentence: (v: Values) => `${v.n}x when x = ${fmt(v.x!)}: ?`,
        check: (v: Values) => `${fmt(v.w!)} = ${v.n} × ${fmt(v.x!)}`,
        words: 'Second part = number outside × the number for x',
        vars: ['w', 'n', 'x'],
        residual: (v: Values) => v.w! - v.n! * v.x!,
        solve: { w: (v: Values) => v.n! * v.x!, n: () => undefined, x: () => undefined },
      },
      {
        id: 'R = u + w',
        display: '{R} = {u} + {w}',
        sentence: (v: Values) => `${v.n! * v.m!} + ${v.n}x when x = ${fmt(v.x!)}: ?`,
        words: 'Value multiplied out = first part + second part',
        vars: ['R', 'u', 'w'],
        residual: (v: Values) => v.R! - v.u! - v.w!,
        solve: { R: (v: Values) => v.u! + v.w!, u: () => undefined, w: () => undefined },
      },
    ],
    steps: {
      'L = n(m + x)': {
        L: {
          expr: '{n} × ({m} + {x})',
          how: (v) => `Put ${fmt(v.x!)} in for x. Add inside the parentheses first.`,
          work: (v) => [`${v.n} × (${v.m} + ${fmt(v.x!)}) = ${v.n} × ${fmt(v.m! + v.x!)}`],
        },
      },
      'u = nm': {
        u: { expr: '{n} × {m}', how: 'Multiply the number inside by the number outside.' },
      },
      'w = nx': {
        w: {
          expr: '{n} × {x}',
          how: (v) => `Multiply x by the number outside: ${v.n}x with ${fmt(v.x!)} put in for x.`,
        },
      },
      'R = u + w': {
        R: {
          expr: '{u} + {w}',
          how: (v) =>
            `Multiply each part inside by ${v.n}: ${v.n}(${v.m} + x) = ${v.n} × ${v.m} + ${v.n} × x = ${v.n! * v.m!} + ${v.n}x. Add the two parts.`,
          note: (v) =>
            v.L === undefined
              ? ''
              : `(the value with parentheses is ${fmt(v.L)} too: the two match for every x)`,
        },
      },
    },
    example: { n: 3, m: 2, x: 4, L: 18, u: 6, w: 12, R: 18 },
    startWith: ['n', 'm', 'x'],
    representation: {
      kind: 'areaModel',
      top: ['m', 'x'],
      side: ['n'],
      parts: [['u', 'w']],
      total: 'L',
    },
  },
  {
    id: 'm.6.expressions-variables~two-quantities',
    title: 'Two quantities that change together',
    use: 'Use this for “She earns $12 an hour. Write an equation for pay and hours.”',
    notation: 'letters',
    assumptions: [
      'The hours are the independent variable: you choose them.',
      'The earnings depend on the hours: they are the dependent variable.',
      'Pay from $1 to $50 an hour; up to 40 hours.',
    ],
    variables: [
      {
        id: 'r',
        symbol: 'r',
        name: 'Pay per hour',
        unit: '$',
        min: 1,
        max: 50,
        step: 0.5,
        multipleOf: 0.5,
      },
      { id: 'h', symbol: 'h', name: 'Hours worked', min: 0, max: 40, step: 0.5, multipleOf: 0.5 },
      { id: 'e', symbol: 'e', name: 'Earnings', unit: '$', min: 0, max: 2000 },
    ],
    relations: [
      {
        id: 'e = rh',
        display: '{e} = {r}{h}',
        check: (v: Values) => `${fmt(v.e!)} = ${fmt(v.r!)} × ${fmt(v.h!)}`,
        words: 'Earnings = pay per hour × hours worked',
        vars: ['e', 'r', 'h'],
        residual: (v: Values) => v.e! - v.r! * v.h!,
        solve: {
          e: (v: Values) => v.r! * v.h!,
          r: (v: Values) => q(v.e!, v.h!),
          h: (v: Values) => q(v.e!, v.r!),
        },
      },
    ],
    steps: {
      'e = rh': {
        e: { expr: '{r} × {h}', how: 'Put the numbers in: the pay for each hour times the hours.' },
        h: {
          expr: '{e} ÷ {r}',
          how: 'Divide both sides by the pay per hour.',
          work: (v) => [`h = ${fmt(v.e!)} ÷ ${fmt(v.r!)}`],
        },
        r: {
          expr: '{e} ÷ {h}',
          how: 'Divide both sides by the hours.',
          work: (v) => [`r = ${fmt(v.e!)} ÷ ${fmt(v.h!)}`],
        },
      },
    },
    example: { r: 12, h: 5, e: 60 },
    startWith: ['r', 'h'],
    // The line e = rh through 0: dragging moves along it with the pay per hour held.
    representation: {
      kind: 'plot',
      x: { var: 'h', min: 0, max: 10 },
      y: { var: 'e', min: 0, max: 150 },
      params: ['r'],
      autoRange: true,
    },
  },

  // ── One-step equations and inequalities (6.EE.5–8) ──
  {
    id: 'm.6.one-step-equations',
    sliders: false,
    equation: '{x} + {p} = {q}',
    notation: 'letters',
    assumptions: [
      'Do the same to both sides, and the two sides stay equal.',
      'Subtracting undoes adding.',
      'Check by putting the answer back in.',
    ],
    variables: [
      { id: 'x', symbol: 'x', name: 'Unknown number', min: 0, max: 200, step: 0.01 },
      { id: 'p', symbol: 'p', name: 'Number added', min: 0, max: 100, step: 0.01 },
      { id: 'q', symbol: 'q', name: 'Total', min: 0, max: 200, step: 0.01 },
    ],
    relations: [
      {
        id: 'x + p = q',
        display: '{x} + {p} = {q}',
        words: 'Unknown number + number added = total',
        vars: ['x', 'p', 'q'],
        residual: (v: Values) => v.x! + v.p! - v.q!,
        solve: {
          x: (v: Values) => exact(v.q! - v.p!),
          p: (v: Values) => exact(v.q! - v.x!),
          q: (v: Values) => exact(v.x! + v.p!),
        },
      },
    ],
    steps: {
      'x + p = q': {
        x: {
          expr: '{q} − {p}',
          how: (v) =>
            `Subtract ${fmt(v.p!)} from both sides: it keeps the balance and leaves x alone.`,
          work: (v) => [`x + ${fmt(v.p!)} − ${fmt(v.p!)} = ${fmt(v.q!)} − ${fmt(v.p!)}`],
        },
        p: {
          expr: '{q} − {x}',
          how: (v) => `Subtract ${fmt(v.x!)} from both sides.`,
          work: (v) => [`${fmt(v.x!)} + p − ${fmt(v.x!)} = ${fmt(v.q!)} − ${fmt(v.x!)}`],
        },
        q: { expr: '{x} + {p}', how: 'Add the two numbers.' },
      },
    },
    example: { x: 5, p: 7, q: 12 },
    startWith: ['p', 'q'],
    representation: { kind: 'tape', parts: ['x', 'p'], total: 'q' },
  },
  {
    id: 'm.6.one-step-equations~multiply',
    sliders: false,
    equation: '{c} × {x} = {q}',
    title: 'Solve px = q',
    use: 'Use this for “Solve 10 = 4a,” or 0.6d = 1.8.',
    notation: 'letters',
    assumptions: [
      '4x means 4 × x.',
      'Dividing undoes multiplying: divide both sides by the same number.',
      'Check by putting the answer back in.',
    ],
    variables: [
      {
        id: 'c',
        symbol: 'p',
        name: 'Coefficient',
        min: 0.1,
        max: 100,
        step: 0.1,
        multipleOf: 0.1,
      },
      { id: 'x', symbol: 'x', name: 'Unknown number', min: 0, max: 10000 },
      { id: 'q', symbol: 'q', name: 'Product', min: 0, max: 1000 },
    ],
    relations: [
      {
        id: 'px = q',
        display: '{c}{x} = {q}',
        check: (v: Values) => `${fmt(v.c!)} × ${fmt(v.x!)} = ${fmt(v.q!)}`,
        words: 'Coefficient × unknown number = product',
        vars: ['q', 'c', 'x'],
        residual: (v: Values) => v.q! - v.c! * v.x!,
        solve: {
          q: (v: Values) => exact(v.c! * v.x!),
          x: (v: Values) => div(v.q!, v.c!),
          c: (v: Values) => div(v.q!, v.x!),
        },
      },
    ],
    steps: {
      'px = q': {
        x: {
          expr: '{q} ÷ {c}',
          how: (v) => `Divide both sides by ${fmt(v.c!)}: it keeps the balance and leaves x alone.`,
          work: (v) => [
            `${fmt(v.c!)}x ÷ ${fmt(v.c!)} = ${fmt(v.q!)} ÷ ${fmt(v.c!)}`,
            `x = ${fmt(v.q!)} ÷ ${fmt(v.c!)}`,
          ],
          writtenLast: true,
          written: (v) => {
            const s = wholeDivisor(v.q!, v.c!);
            return s.d >= 2 && (s.n % s.d !== 0 || s.n / s.d >= 10) && places(s.n) <= 2
              ? decimalLongDivision(s.n, s.d)
              : undefined;
          },
        },
        c: {
          expr: '{q} ÷ {x}',
          how: (v) => `Divide both sides by ${fmt(v.x!)}.`,
          work: (v) => [`p = ${fmt(v.q!)} ÷ ${fmt(v.x!)}`],
        },
        q: { expr: '{c} × {x}', how: 'Multiply the two numbers.' },
      },
    },
    example: { c: 4, x: 7.5, q: 30 },
    startWith: ['c', 'q'],
    // The equation with its coefficient, then the groups the tape shows: "4x = 30", "4 × 7.5 = 30".
    representation: {
      kind: 'tape',
      parts: ['x'],
      total: 'q',
      groups: 'c',
      caption: '{c}x = {q} · {c} × {x} = {q}',
    },
  },
  {
    id: 'm.6.one-step-equations~inequality-solutions',
    notation: 'letters',
    title: 'Solutions of an inequality',
    use: 'Use this for “Is 35 a solution of 2n < 71?” or “Which numbers make k > 5 true?”',
    assumptions: [
      'A solution makes the inequality true. Put the value in and compare the two sides.',
      'The boundary is where the two sides are equal: 2n = 71 at n = 35.5.',
      '< and > leave the boundary out (open circle); ≤ and ≥ take it in (closed circle).',
      'Coefficients from 0.01 to 100; bounds and values from −1,000 to 1,000.',
    ],
    variables: [
      { id: 'a', symbol: 'a', name: 'Coefficient', min: 0.01, max: 100, step: 0.01 },
      { id: 'c', symbol: 'c', name: 'Bound', min: -1000, max: 1000, step: 0.01 },
      { id: 'x', symbol: 'x', name: 'Value to test', min: -1000, max: 1000, step: 0.01 },
      {
        id: 'p',
        symbol: 'p',
        name: 'Left side at the value',
        min: -100000,
        max: 100000,
        derived: true,
      },
      { id: 'e', symbol: 'e', name: 'Boundary', min: -100000, max: 100000, derived: true },
      { id: 'd', symbol: 'd', name: 'Left side − bound', min: -200000, max: 200000, derived: true },
    ],
    relations: [
      {
        id: 'p = a × x',
        display: '{a} × {x} = {p}',
        vars: ['p', 'a', 'x'],
        residual: (v: Values) => v.p! - v.a! * v.x!,
        solve: {
          p: (v: Values) => exact(v.a! * v.x!),
          a: () => undefined,
          x: (v: Values) => q(v.p!, v.a!),
        },
      },
      {
        id: 'e = c ÷ a',
        display: '{c} ÷ {a} = {e}',
        words: 'Bound ÷ coefficient = boundary',
        vars: ['e', 'c', 'a'],
        residual: (v: Values) => v.e! * v.a! - v.c!,
        solve: { e: (v: Values) => q(v.c!, v.a!), c: () => undefined, a: () => undefined },
      },
      {
        id: 'd = p − c',
        display: '{p} − {c} = {d}',
        vars: ['d', 'p', 'c'],
        residual: (v: Values) => v.d! - v.p! + v.c!,
        solve: { d: (v: Values) => exact(v.p! - v.c!), p: () => undefined, c: () => undefined },
      },
    ],
    steps: {
      'p = a × x': {
        p: { expr: '{a} × {x}', how: 'Put the value in: work out the left side.' },
        x: { expr: '{p} ÷ {a}', how: 'Divide the left side by the coefficient.' },
      },
      'e = c ÷ a': {
        e: {
          expr: '{c} ÷ {a}',
          how: 'The boundary: the value that makes the two sides equal.',
        },
      },
      'd = p − c': {
        d: {
          expr: '{p} − {c}',
          how: 'Compare the left side with the bound: above it, below it, or on it.',
          note: (v) => {
            const [p, c] = [sgn(v.p!), sgn(v.c!)];
            const sign = v.d! > 0 ? '>' : v.d! < 0 ? '<' : '=';
            const yes = (t: boolean) => (t ? 'a solution' : 'not a solution');
            return `(${p} ${sign} ${c}: ${sgn(v.x!)} is ${yes(v.d! > 0)} of > and ${yes(v.d! >= 0)} of ≥; ${yes(v.d! < 0)} of < and ${yes(v.d! <= 0)} of ≤)`;
          },
        },
      },
    },
    example: { a: 2, c: 71, x: 35, p: 70, e: 35.5, d: -1 },
    startWith: ['a', 'c', 'x'],
    representation: {
      kind: 'integerLine',
      value: 'e',
      second: 'x',
      min: -40,
      max: 40,
    },
  },

  // ── Area of triangles, parallelograms and trapezoids (6.G.1) ──
  {
    id: 'm.6.area-polygons',
    notation: 'letters',
    assumptions: [
      'The height meets the base at a square corner: it is not the slanted side.',
      'Cut a triangle off one end and move it to the other: the parallelogram becomes a rectangle.',
      'Any side can be the base, with the height that meets it.',
    ],
    variables: [
      { id: 'b', symbol: 'b', name: 'Base', unit: 'cm', min: 0.1, max: 100, step: 0.1 },
      { id: 'h', symbol: 'h', name: 'Height', unit: 'cm', min: 0.1, max: 100, step: 0.1 },
      { id: 'A', symbol: 'A', name: 'Area', unit: 'cm²', min: 0, max: 10000 },
    ],
    relations: [
      {
        id: 'A = b × h',
        display: '{A} = {b} × {h}',
        words: 'Area = base × height',
        vars: ['A', 'b', 'h'],
        residual: (v: Values) => v.A! - v.b! * v.h!,
        solve: {
          A: (v: Values) => v.b! * v.h!,
          b: (v: Values) => div(v.A!, v.h!),
          h: (v: Values) => div(v.A!, v.b!),
        },
      },
    ],
    steps: {
      'A = b × h': {
        A: { expr: '{b} × {h}', how: 'Put the numbers in and multiply: the rectangle it makes.' },
        b: {
          expr: '{A} ÷ {h}',
          how: 'Divide both sides by the height to leave b alone.',
          work: (v) => [`${fmt(v.A!)} = b × ${fmt(v.h!)}`, `b = ${fmt(v.A!)} ÷ ${fmt(v.h!)}`],
        },
        h: {
          expr: '{A} ÷ {b}',
          how: 'Divide both sides by the base to leave h alone.',
          work: (v) => [`${fmt(v.A!)} = ${fmt(v.b!)} × h`, `h = ${fmt(v.A!)} ÷ ${fmt(v.b!)}`],
        },
      },
    },
    example: { b: 8, h: 5, A: 40 },
    startWith: ['b', 'h'],
    representation: {
      kind: 'baseHeight',
      shape: 'parallelogram',
      base: 'b',
      height: 'h',
      area: 'A',
      show: 'rearrange',
    },
  },
  {
    id: 'm.6.area-polygons~triangle',
    title: 'Triangles',
    use: 'Use this for “A triangle has base 3 and height 7. What is its area?”',
    notation: 'letters',
    assumptions: [
      'Two copies of a triangle make a parallelogram, so a triangle is half of base × height.',
      'In an obtuse triangle the height can fall outside the triangle.',
      'The height meets the base (or its line) at a square corner.',
    ],
    variables: [
      { id: 'b', symbol: 'b', name: 'Base', unit: 'cm', min: 0.1, max: 100, step: 0.1 },
      { id: 'h', symbol: 'h', name: 'Height', unit: 'cm', min: 0.1, max: 100, step: 0.1 },
      { id: 'A', symbol: 'A', name: 'Area', unit: 'cm²', min: 0, max: 5000 },
    ],
    relations: [
      {
        id: 'A = ½ × b × h',
        display: '{A} = ½ × {b} × {h}',
        words: 'Area = half of base × height',
        vars: ['A', 'b', 'h'],
        residual: (v: Values) => v.A! - 0.5 * v.b! * v.h!,
        solve: {
          A: (v: Values) => 0.5 * v.b! * v.h!,
          b: (v: Values) => div(2 * v.A!, v.h!),
          h: (v: Values) => div(2 * v.A!, v.b!),
        },
      },
    ],
    steps: {
      'A = ½ × b × h': {
        A: { expr: '½ × {b} × {h}', how: 'Half of the parallelogram two copies would make.' },
        b: {
          expr: '{A} ÷ ({h} ÷ 2)',
          how: 'Half of the height times b is the area. Divide both sides by half the height.',
          work: (v) => [
            `${fmt(v.A!)} = ${fmt(v.h! / 2)} × b`,
            `b = ${fmt(v.A!)} ÷ ${fmt(v.h! / 2)}`,
          ],
        },
        h: {
          expr: '{A} ÷ ({b} ÷ 2)',
          how: 'Half of the base times h is the area. Divide both sides by half the base.',
          work: (v) => [
            `${fmt(v.A!)} = ${fmt(v.b! / 2)} × h`,
            `h = ${fmt(v.A!)} ÷ ${fmt(v.b! / 2)}`,
          ],
        },
      },
    },
    example: { b: 10, h: 6, A: 30 },
    startWith: ['b', 'h'],
    representation: {
      kind: 'baseHeight',
      shape: 'triangle',
      base: 'b',
      height: 'h',
      area: 'A',
      show: 'double',
    },
  },
  {
    id: 'm.6.area-polygons~trapezoid',
    title: 'Trapezoids',
    use: 'Use this for “The bases are 16 and 19, the height 18. Find the area.”',
    notation: 'letters',
    assumptions: [
      'A diagonal cuts the trapezoid into two triangles with the same height.',
      'One triangle has the bottom base, the other the top base.',
      'The two bases are the parallel sides. It is the same area as ½ × (b₁ + b₂) × h.',
    ],
    variables: [
      { id: 'a', symbol: 'b₁', name: 'Bottom base', unit: 'cm', min: 0.1, max: 100, step: 0.1 },
      { id: 'c', symbol: 'b₂', name: 'Top base', unit: 'cm', min: 0.1, max: 100, step: 0.1 },
      { id: 'h', symbol: 'h', name: 'Height', unit: 'cm', min: 0.1, max: 100, step: 0.1 },
      { id: 'A', symbol: 'A', name: 'Area', unit: 'cm²', min: 0, max: 10000 },
    ],
    relations: [
      {
        id: 'A = ½ × b₁ × h + ½ × b₂ × h',
        display: '{A} = ½ × {a} × {h} + ½ × {c} × {h}',
        words: 'Area = one triangle + the other triangle',
        vars: ['A', 'a', 'c', 'h'],
        residual: (v: Values) => v.A! - 0.5 * (v.a! + v.c!) * v.h!,
        solve: {
          A: (v: Values) => 0.5 * (v.a! + v.c!) * v.h!,
          a: (v: Values) =>
            div(2 * v.A!, v.h!) === undefined ? undefined : (2 * v.A!) / v.h! - v.c!,
          c: (v: Values) =>
            div(2 * v.A!, v.h!) === undefined ? undefined : (2 * v.A!) / v.h! - v.a!,
          h: (v: Values) => div(2 * v.A!, v.a! + v.c!),
        },
      },
    ],
    steps: {
      'A = ½ × b₁ × h + ½ × b₂ × h': {
        A: {
          expr: '½ × {a} × {h} + ½ × {c} × {h}',
          how: 'Find each triangle’s area, then add them.',
          work: (v) => [
            `½ × ${fmt(v.a!)} × ${fmt(v.h!)} = ${fmt((v.a! * v.h!) / 2)}`,
            `½ × ${fmt(v.c!)} × ${fmt(v.h!)} = ${fmt((v.c! * v.h!) / 2)}`,
            `${fmt((v.a! * v.h!) / 2)} + ${fmt((v.c! * v.h!) / 2)} = ${fmt(v.A!)}`,
          ],
        },
        c: {
          expr: '({A} − {a} × {h} ÷ 2) ÷ ({h} ÷ 2)',
          how: 'Work out the bottom triangle, take it from both sides, then divide by half the height.',
          work: (v) => {
            // The difference of the numbers as shown, so each line adds up as written.
            const t = shownNum((v.a! * v.h!) / 2);
            const A = shownNum(v.A!);
            return [
              `${fmt(A)} = ${fmt(t)} + ${fmt(v.h! / 2)} × b₂`,
              `${fmt(A)} − ${fmt(t)} = ${fmt(exact(A - t))}`,
              `${fmt(exact(A - t))} = ${fmt(v.h! / 2)} × b₂`,
              `b₂ = ${fmt(exact(A - t))} ÷ ${fmt(v.h! / 2)}`,
            ];
          },
        },
        a: {
          expr: '({A} − {c} × {h} ÷ 2) ÷ ({h} ÷ 2)',
          how: 'Work out the top triangle, take it from both sides, then divide by half the height.',
          work: (v) => {
            // The difference of the numbers as shown, so each line adds up as written.
            const t = shownNum((v.c! * v.h!) / 2);
            const A = shownNum(v.A!);
            return [
              `${fmt(A)} = ${fmt(v.h! / 2)} × b₁ + ${fmt(t)}`,
              `${fmt(A)} − ${fmt(t)} = ${fmt(exact(A - t))}`,
              `${fmt(exact(A - t))} = ${fmt(v.h! / 2)} × b₁`,
              `b₁ = ${fmt(exact(A - t))} ÷ ${fmt(v.h! / 2)}`,
            ];
          },
        },
        h: {
          expr: '{A} ÷ (({a} + {c}) ÷ 2)',
          how: 'Both triangles have height h: half of each base times h. Add the halves, then divide.',
          work: (v) => [
            `${fmt(v.A!)} = ${fmt(v.a! / 2)} × h + ${fmt(v.c! / 2)} × h = ${fmt((v.a! + v.c!) / 2)} × h`,
            `h = ${fmt(v.A!)} ÷ ${fmt((v.a! + v.c!) / 2)}`,
          ],
        },
      },
    },
    example: { a: 4, c: 8, h: 5, A: 30 },
    startWith: ['a', 'c', 'h'],
    representation: {
      kind: 'baseHeight',
      shape: 'trapezoid',
      base: 'a',
      top: 'c',
      height: 'h',
      area: 'A',
    },
  },
  {
    id: 'm.6.area-polygons~composite',
    title: 'House shapes',
    use: 'Use this for the area of a house shape: a rectangle with a triangle on top.',
    assumptions: [
      'Split the shape into a rectangle and a triangle, find each area, then add.',
      'The triangle’s base is the rectangle’s width.',
      'Lengths in meters to 20, areas in square meters.',
    ],
    variables: [
      { id: 'w', symbol: 'w', name: 'Width', unit: 'm', min: 0.1, max: 20, step: 0.1 },
      { id: 'H', symbol: 'H', name: 'Wall height', unit: 'm', min: 0.1, max: 20, step: 0.1 },
      { id: 'r', symbol: 'r', name: 'Roof height', unit: 'm', min: 0.1, max: 20, step: 0.1 },
      {
        id: 'R',
        symbol: 'R',
        name: 'Rectangle area',
        unit: 'm²',
        min: 0,
        max: 400,
        derived: true,
      },
      { id: 'T', symbol: 'T', name: 'Triangle area', unit: 'm²', min: 0, max: 200, derived: true },
      { id: 'S', symbol: 'S', name: 'Total area', unit: 'm²', min: 0, max: 600, derived: true },
    ],
    relations: [
      {
        id: 'R = w × H',
        display: '{w} × {H} = {R}',
        words: 'Width × wall height = rectangle area',
        vars: ['R', 'w', 'H'],
        residual: (v: Values) => v.R! - v.w! * v.H!,
        solve: { R: (v: Values) => v.w! * v.H!, w: () => undefined, H: () => undefined },
      },
      {
        id: 'T = ½ × w × r',
        display: '½ × {w} × {r} = {T}',
        words: 'Half of width × roof height = triangle area',
        vars: ['T', 'w', 'r'],
        residual: (v: Values) => v.T! - 0.5 * v.w! * v.r!,
        solve: { T: (v: Values) => 0.5 * v.w! * v.r!, w: () => undefined, r: () => undefined },
      },
      {
        id: 'S = R + T',
        display: '{R} + {T} = {S}',
        words: 'Rectangle area + triangle area = total area',
        vars: ['S', 'R', 'T'],
        residual: (v: Values) => v.S! - v.R! - v.T!,
        solve: { S: (v: Values) => v.R! + v.T!, R: () => undefined, T: () => undefined },
      },
    ],
    steps: {
      'R = w × H': {
        R: {
          expr: '{w} × {H}',
          how: 'The walls are a rectangle: width times height.',
          written: false,
        },
      },
      'T = ½ × w × r': {
        T: {
          expr: '½ × {w} × {r}',
          how: 'The roof is a triangle on the same width: half of base × height.',
        },
      },
      'S = R + T': { S: { expr: '{R} + {T}', how: 'Add the two areas.', written: false } },
    },
    example: { w: 6, H: 4, r: 3, R: 24, T: 9, S: 33 },
    startWith: ['w', 'H', 'r'],
    representation: {
      kind: 'baseHeight',
      shape: 'house',
      base: 'w',
      height: 'H',
      top: 'r',
      area: 'S',
    },
  },

  // ── Surface area using nets (6.G.4, 6.EE.2c, 6.G.2) ──
  {
    id: 'm.6.surface-area-nets',
    assumptions: [
      'Surface area is the area of every face added together.',
      'A box has three pairs of matching faces.',
      'Area is in square units.',
    ],
    variables: [
      {
        id: 'l',
        symbol: 'l',
        name: 'Length',
        unit: 'cm',
        min: 0.1,
        max: 100,
        step: 0.1,
      },
      {
        id: 'w',
        symbol: 'w',
        name: 'Width',
        unit: 'cm',
        min: 0.1,
        max: 100,
        step: 0.1,
      },
      {
        id: 'h',
        symbol: 'h',
        name: 'Height',
        unit: 'cm',
        min: 0.1,
        max: 100,
        step: 0.1,
      },
      {
        id: 'T',
        symbol: 'T',
        name: 'Top and bottom',
        unit: 'cm²',
        min: 0,
        max: 20000,
        derived: true,
      },
      {
        id: 'F',
        symbol: 'F',
        name: 'Front and back',
        unit: 'cm²',
        min: 0,
        max: 20000,
        derived: true,
      },
      { id: 'E', symbol: 'E', name: 'Two ends', unit: 'cm²', min: 0, max: 20000, derived: true },
      {
        id: 'S',
        symbol: 'S',
        name: 'Surface area',
        unit: 'cm²',
        min: 0,
        max: 60000,
        derived: true,
      },
    ],
    relations: [
      {
        id: 'T = 2lw',
        display: '2 × ({l} × {w}) = {T}',
        words: '2 × (length × width) = top and bottom',
        vars: ['T', 'l', 'w'],
        residual: (v: Values) => v.T! - 2 * v.l! * v.w!,
        solve: { T: (v: Values) => 2 * v.l! * v.w!, l: () => undefined, w: () => undefined },
      },
      {
        id: 'F = 2lh',
        display: '2 × ({l} × {h}) = {F}',
        words: '2 × (length × height) = front and back',
        vars: ['F', 'l', 'h'],
        residual: (v: Values) => v.F! - 2 * v.l! * v.h!,
        solve: { F: (v: Values) => 2 * v.l! * v.h!, l: () => undefined, h: () => undefined },
      },
      {
        id: 'E = 2wh',
        display: '2 × ({w} × {h}) = {E}',
        words: '2 × (width × height) = two ends',
        vars: ['E', 'w', 'h'],
        residual: (v: Values) => v.E! - 2 * v.w! * v.h!,
        solve: { E: (v: Values) => 2 * v.w! * v.h!, w: () => undefined, h: () => undefined },
      },
      {
        id: 'S = T + F + E',
        display: '{T} + {F} + {E} = {S}',
        words: 'Top and bottom + front and back + two ends = surface area',
        vars: ['S', 'T', 'F', 'E'],
        residual: (v: Values) => v.S! - v.T! - v.F! - v.E!,
        solve: {
          S: (v: Values) => v.T! + v.F! + v.E!,
          T: () => undefined,
          F: () => undefined,
          E: () => undefined,
        },
      },
    ],
    steps: {
      'T = 2lw': {
        T: { expr: '2 × ({l} × {w})', how: 'The top and bottom are length by width: two of them.' },
      },
      'F = 2lh': {
        F: {
          expr: '2 × ({l} × {h})',
          how: 'The front and back are length by height: two of them.',
        },
      },
      'E = 2wh': {
        E: { expr: '2 × ({w} × {h})', how: 'The two ends are width by height: two of them.' },
      },
      'S = T + F + E': {
        S: { expr: '{T} + {F} + {E}', how: 'Add the areas of all six faces.', written: false },
      },
    },
    example: { l: 5, w: 3, h: 2, T: 30, F: 20, E: 12, S: 62 },
    startWith: ['l', 'w', 'h'],
    representation: { kind: 'net', solid: 'box', length: 'l', width: 'w', height: 'h', total: 'S' },
  },
  {
    id: 'm.6.surface-area-nets~cube',
    title: 'Cube formulas',
    use: 'Use this for “What is the volume and surface area of a cube with side 2?”',
    notation: 'letters',
    assumptions: [
      's³ means s × s × s; s² means s × s.',
      'A cube has 6 square faces, each s × s.',
      'Edges are whole numbers to 20 units; volume is in cubic units, surface area in square units.',
    ],
    variables: [
      { ...whole('s', 's', 'Edge', 1, 20), unit: 'units' },
      { id: 'V', symbol: 'V', name: 'Volume', unit: 'cubic units', min: 1, max: 8000 },
      { id: 'A', symbol: 'SA', name: 'Surface area', unit: 'square units', min: 6, max: 2400 },
    ],
    relations: [
      {
        id: 'V = s³',
        display: '{V} = {s}³',
        words: 'Volume = edge × edge × edge',
        vars: ['V', 's'],
        residual: (v: Values) => v.V! - v.s! ** 3,
        solve: {
          V: (v: Values) => v.s! ** 3,
          s: (v: Values) => Math.round(Math.cbrt(v.V!) * 1e9) / 1e9,
        },
      },
      {
        id: 'SA = 6s²',
        display: '{A} = 6 × {s}²',
        words: 'Surface area = 6 faces × edge × edge',
        vars: ['A', 's'],
        residual: (v: Values) => v.A! - 6 * v.s! ** 2,
        solve: {
          A: (v: Values) => 6 * v.s! ** 2,
          s: (v: Values) => Math.round(Math.sqrt(v.A! / 6) * 1e9) / 1e9,
        },
      },
    ],
    steps: {
      'V = s³': {
        V: {
          expr: '{s}³',
          how: 'Use the edge as a factor three times.',
          work: (v) => [`${fmt(v.s!)}³ = ${fmt(v.s!)} × ${fmt(v.s!)} × ${fmt(v.s!)}`],
        },
        s: {
          expr: '∛{V}',
          how: 'Which number times itself three times makes the volume?',
          work: (v) => [`${fmt(v.s!)} × ${fmt(v.s!)} × ${fmt(v.s!)} = ${fmt(v.V!)}`],
        },
      },
      'SA = 6s²': {
        A: {
          expr: '6 × {s}²',
          how: 'Square the edge for one face, then multiply by 6 faces.',
          work: (v) => [
            `${fmt(v.s!)}² = ${fmt(v.s! ** 2)}`,
            `6 × ${fmt(v.s! ** 2)} = ${fmt(v.A!)}`,
          ],
        },
        s: {
          expr: '√({A} ÷ 6)',
          how: 'Divide both sides by 6 for one face. Then find the number times itself that makes it.',
          work: (v) => [
            `s² = ${fmt(v.A!)} ÷ 6 = ${fmt(v.A! / 6)}`,
            `${fmt(v.s!)} × ${fmt(v.s!)} = ${fmt(v.A! / 6)}`,
          ],
        },
      },
    },
    example: { s: 3, V: 27, A: 54 },
    startWith: ['s'],
    representation: { kind: 'net', solid: 'cube', length: 's', total: 'A' },
  },
  {
    id: 'm.6.surface-area-nets~pyramid',
    title: 'Square pyramid',
    use: 'Use this for “Find the surface area of the square pyramid from its net.”',
    assumptions: [
      'The net is a square base and 4 matching triangles.',
      'Each triangle’s height is measured on its face, from the base edge to the top.',
      'The triangles must be tall enough to meet at the top: more than half the base side.',
      'Area is in square units.',
    ],
    variables: [
      {
        id: 'a',
        symbol: 'a',
        name: 'Base side',
        unit: 'cm',
        min: 0.1,
        max: 100,
        step: 0.1,
      },
      {
        id: 't',
        symbol: 't',
        name: 'Triangle height',
        unit: 'cm',
        min: 0.1,
        max: 100,
        step: 0.1,
      },
      { id: 'B', symbol: 'B', name: 'Base area', unit: 'cm²', min: 0, max: 10000, derived: true },
      { id: 'T', symbol: 'T', name: 'One triangle', unit: 'cm²', min: 0, max: 5000, derived: true },
      {
        id: 'S',
        symbol: 'S',
        name: 'Surface area',
        unit: 'cm²',
        min: 0,
        max: 30000,
        derived: true,
      },
    ],
    relations: [
      {
        id: 'B = a × a',
        display: '{a} × {a} = {B}',
        words: 'Base side × base side = base area',
        vars: ['B', 'a'],
        residual: (v: Values) => v.B! - v.a! * v.a!,
        solve: { B: (v: Values) => v.a! * v.a!, a: () => undefined },
      },
      {
        id: 'T = ½ × a × t',
        display: '½ × {a} × {t} = {T}',
        words: 'Half of base side × triangle height = one triangle',
        vars: ['T', 'a', 't'],
        residual: (v: Values) => v.T! - 0.5 * v.a! * v.t!,
        solve: { T: (v: Values) => 0.5 * v.a! * v.t!, a: () => undefined, t: () => undefined },
      },
      {
        // Triangles shorter than half the base side can't lean in to meet at the top.
        id: 't > a ÷ 2',
        constraint: true,
        display: 'The triangle height {t} is more than half the base side {a}',
        vars: ['t', 'a'],
        residual: (v: Values) => (v.t! > v.a! / 2 ? 0 : 1),
        solve: {},
      },
      {
        id: 'S = B + 4T',
        display: '{B} + 4 × {T} = {S}',
        words: 'Base area + 4 × one triangle = surface area',
        vars: ['S', 'B', 'T'],
        residual: (v: Values) => v.S! - v.B! - 4 * v.T!,
        solve: { S: (v: Values) => v.B! + 4 * v.T!, B: () => undefined, T: () => undefined },
      },
    ],
    steps: {
      'B = a × a': { B: { expr: '{a} × {a}', how: 'The base is a square.' } },
      't > a ÷ 2': {},
      'T = ½ × a × t': {
        T: {
          expr: '½ × {a} × {t}',
          how: 'Each face is a triangle on a base side: half of base × height.',
        },
      },
      'S = B + 4T': {
        S: {
          expr: '{B} + 4 × {T}',
          how: 'Add the square base and the four matching triangles.',
          work: (v) => [
            `4 × ${fmt(v.T!)} = ${fmt(4 * v.T!)}`,
            `${fmt(v.B!)} + ${fmt(4 * v.T!)} = ${fmt(v.S!)}`,
          ],
        },
      },
    },
    example: { a: 6, t: 5, B: 36, T: 15, S: 96 },
    startWith: ['a', 't'],
    representation: { kind: 'net', solid: 'squarePyramid', length: 'a', slant: 't', total: 'S' },
  },
  {
    id: 'm.6.surface-area-nets~volume-fractions',
    title: 'Volume with fraction edges',
    use: 'Use this for “A box is 2 1/2 by 1 1/2 by 2. What is its volume?”',
    assumptions: [
      'A half-unit cube has edges of 1/2, so 8 of them make one unit cube.',
      'Count the half-unit cubes along each edge: twice the length.',
      'Edges in halves, up to 5 units.',
    ],
    variables: [
      {
        id: 'l',
        symbol: 'l',
        name: 'Length',
        min: 0.5,
        max: 5,
        step: 0.5,
        multipleOf: 0.5,
        fraction: 2,
      },
      {
        id: 'w',
        symbol: 'w',
        name: 'Width',
        min: 0.5,
        max: 5,
        step: 0.5,
        multipleOf: 0.5,
        fraction: 2,
      },
      {
        id: 'h',
        symbol: 'h',
        name: 'Height',
        min: 0.5,
        max: 5,
        step: 0.5,
        multipleOf: 0.5,
        fraction: 2,
      },
      { ...whole('n', 'n', 'Half-unit cubes', 1, 1000), derived: true },
      {
        id: 'V',
        symbol: 'V',
        name: 'Volume in cubic units',
        min: 0,
        max: 125,
        fraction: 8,
        derived: true,
      },
    ],
    relations: [
      {
        id: 'n = 2l × 2w × 2h',
        display: '(2 × {l}) × (2 × {w}) × (2 × {h}) = {n}',
        words: 'Half-units along the length × along the width × along the height = half-unit cubes',
        vars: ['n', 'l', 'w', 'h'],
        residual: (v: Values) => v.n! - 8 * v.l! * v.w! * v.h!,
        solve: {
          n: (v: Values) => 8 * v.l! * v.w! * v.h!,
          l: () => undefined,
          w: () => undefined,
          h: () => undefined,
        },
      },
      {
        id: 'V = n ÷ 8',
        display: '{n} ÷ 8 = {V}',
        words: 'Half-unit cubes ÷ 8 = volume',
        check: (v: Values) => `${fmt(v.V!)} × 8 = ${fmt(v.n!)}`,
        vars: ['V', 'n'],
        residual: (v: Values) => v.V! * 8 - v.n!,
        solve: { V: (v: Values) => v.n! / 8, n: () => undefined },
      },
    ],
    steps: {
      'n = 2l × 2w × 2h': {
        n: {
          expr: '(2 × {l}) × (2 × {w}) × (2 × {h})',
          how: 'Count the half-unit cubes along each edge, then multiply.',
          work: (v) => [`${fmt(2 * v.l!)} × ${fmt(2 * v.w!)} × ${fmt(2 * v.h!)} = ${fmt(v.n!)}`],
        },
      },
      'V = n ÷ 8': {
        V: {
          expr: '{n} ÷ 8',
          how: '8 half-unit cubes fill one unit cube.',
          note: (v) =>
            v.l === undefined
              ? ''
              : `(the same as ${fmt(v.l)} × ${fmt(v.w!)} × ${fmt(v.h!)} = ${fmt(v.V!)})`,
        },
      },
    },
    example: { l: 2.5, w: 1.5, h: 2, n: 60, V: 7.5 },
    startWith: ['l', 'w', 'h'],
    representation: {
      kind: 'unitCubes',
      length: 'l',
      width: 'w',
      height: 'h',
      volume: 'V',
      max: 10,
      cube: 2,
    },
  },

  // ── Mean, median, mode, range and MAD (6.SP.1–5): data sets of 3 to 10 values ──
  {
    id: 'm.6.center-spread',
    use: 'Use this for the mean of a data set, or how many values there are from the sum and the mean.',
    assumptions: [
      'The mean shares the total equally among the values: sum ÷ number of values.',
      'It is the balance point of the dot plot.',
      'One very large or very small value moves the mean a lot.',
      'From 3 to 10 values.',
    ],
    variables: [
      COUNT,
      ...DATA_VARS,
      { id: 's', symbol: 's', name: 'Sum', min: 0, max: 10000 },
      { id: 'm', symbol: 'm', name: 'Mean', min: 0, max: 1000 },
    ],
    relations: [
      {
        id: 's = sum of the values',
        display: 'sum of the {n} values = {s}',
        words: 'Add all the values = sum',
        check: (v: Values) => `${dataOf(v).map(fmt).join(' + ')} = ${fmt(v.s!)}`,
        vars: ['s', 'n', ...DATA],
        residual: (v: Values) => v.s! - sumOf(dataOf(v)),
        solve: {
          s: (v: Values) => exact(sumOf(dataOf(v))),
          n: () => undefined,
          ...Object.fromEntries(
            DATA.map((id) => [
              id,
              (v: Values) =>
                exact(
                  v.s! -
                    sumOf(
                      counted(v)
                        .filter((x) => x !== id)
                        .map((x) => v[x]!),
                    ),
                ),
            ]),
          ),
        },
      },
      {
        id: 'm = s ÷ n',
        display: '{s} ÷ {n} = {m}',
        words: 'Sum ÷ number of values = mean',
        check: (v: Values) => `${fmt(v.m!)} × ${v.n} = ${fmt(v.s!)}`,
        vars: ['m', 's', 'n'],
        residual: (v: Values) => v.m! * v.n! - v.s!,
        solve: {
          m: (v: Values) => q(v.s!, v.n!),
          s: (v: Values) => exact(v.m! * v.n!),
          n: (v: Values) => q(v.s!, v.m!),
        },
      },
    ],
    steps: {
      's = sum of the values': {
        s: {
          expr: (v: Values) =>
            counted(v)
              .map((id) => `{${id}}`)
              .join(' + '),
          how: 'Add all the values.',
        },
        ...Object.fromEntries(
          DATA.map((id) => [
            id,
            {
              expr: (v: Values) =>
                `{s} − (${counted(v)
                  .filter((x) => x !== id)
                  .map((x) => `{${x}}`)
                  .join(' + ')})`,
              how: 'The sum less the values you know is the missing one.',
              work: (v: Values) => {
                const others = counted(v).filter((x) => x !== id);
                const known = sumOf(others.map((x) => v[x]!));
                return [
                  `${others.map((x) => fmt(v[x]!)).join(' + ')} = ${fmt(known)}`,
                  `${fmt(v.s!)} − ${fmt(known)} = ${fmt(v[id]!)}`,
                ];
              },
              written: false as const,
            },
          ]),
        ),
      },
      'm = s ÷ n': {
        m: { expr: '{s} ÷ {n}', how: 'Share the sum equally among the values.' },
        s: {
          expr: '{m} × {n}',
          how: 'Each value at the mean: the mean times the number of values.',
        },
        n: { expr: '{s} ÷ {m}', how: 'How many means make the sum: that many values.' },
      },
    },
    example: { n: 5, a: 4, b: 7, c: 9, d: 5, e: 10, s: 35, m: 7 },
    startWith: ['n', 'a', 'b', 'c', 'd', 'e'],
    representation: { kind: 'dotPlot', data: DATA, count: 'n', min: 0, max: 12, mean: 'm' },
  },
  {
    id: 'm.6.center-spread~median',
    title: 'Median, range and mode',
    use: 'Use this for “What is the median of these 7 numbers?” and the range and mode.',
    assumptions: [
      'Put the values in order first.',
      'An odd number of values: the median is the middle one. An even number: halfway between the middle two.',
      'The range is the greatest minus the least; the mode is the value that appears most often.',
      'From 3 to 10 values.',
    ],
    variables: [
      COUNT,
      ...DATA_VARS,
      { id: 'M', symbol: 'M', name: 'Median', min: 0, max: 1000, derived: true },
      { id: 'R', symbol: 'R', name: 'Range', min: 0, max: 1000, derived: true },
    ],
    relations: [
      {
        id: 'M = median',
        display: 'median of the {n} values: {M}',
        words: 'The middle of the values in order = median',
        check: (v: Values) => `median of ${dataOf(v).map(fmt).join(', ')}: ${fmt(v.M!)}`,
        vars: ['M', 'n', ...DATA],
        residual: (v: Values) => v.M! - median(dataOf(v)),
        solve: {
          M: (v: Values) => median(dataOf(v)),
          ...Object.fromEntries(['n', ...DATA].map((id) => [id, () => undefined])),
        },
      },
      {
        id: 'R = range',
        display: 'range of the {n} values: {R}',
        words: 'Greatest value − least value = range',
        check: (v: Values) =>
          `${fmt(Math.max(...dataOf(v)))} − ${fmt(Math.min(...dataOf(v)))} = ${fmt(v.R!)}`,
        vars: ['R', 'n', ...DATA],
        residual: (v: Values) => v.R! - (Math.max(...dataOf(v)) - Math.min(...dataOf(v))),
        solve: {
          R: (v: Values) => exact(Math.max(...dataOf(v)) - Math.min(...dataOf(v))),
          ...Object.fromEntries(['n', ...DATA].map((id) => [id, () => undefined])),
        },
      },
    ],
    steps: {
      'M = median': {
        M: {
          expr: (v: Values) => `median of ${listed(v)}`,
          how: (v: Values) =>
            v.n! % 2
              ? 'Put the values in order. With an odd number of values, the median is the middle one.'
              : 'Put the values in order. Find the number halfway between the middle two.',
          work: (v: Values) => {
            const xs = [...dataOf(v)].sort((x, y) => x - y);
            const k = xs.length;
            return k % 2
              ? [
                  `In order: ${xs.map(fmt).join(', ')}`,
                  `${(k - 1) / 2} values on each side of the middle one: ${fmt(xs[(k - 1) / 2]!)}`,
                ]
              : [
                  `In order: ${xs.map(fmt).join(', ')}`,
                  `The middle two are ${fmt(xs[k / 2 - 1]!)} and ${fmt(xs[k / 2]!)}.`,
                  `(${fmt(xs[k / 2 - 1]!)} + ${fmt(xs[k / 2]!)}) ÷ 2 = ${fmt(v.M!)}`,
                ];
          },
          note: (v: Values) => `(${modeText(dataOf(v))})`,
          written: false,
        },
      },
      'R = range': {
        R: {
          expr: (v: Values) => `range of ${listed(v)}`,
          how: 'Take the least value from the greatest.',
          work: (v: Values) => [
            `${fmt(Math.max(...dataOf(v)))} − ${fmt(Math.min(...dataOf(v)))} = ${fmt(v.R!)}`,
          ],
          written: false,
        },
      },
    },
    example: { n: 6, a: 8, b: 3, c: 12, d: 7, e: 5, f: 9, M: 7.5, R: 9 },
    startWith: ['n', 'a', 'b', 'c', 'd', 'e', 'f'],
    representation: {
      kind: 'dotPlot',
      data: DATA,
      count: 'n',
      min: 0,
      max: 15,
      median: 'M',
      range: 'R',
    },
  },
  {
    id: 'm.6.center-spread~mad',
    title: 'Mean absolute deviation',
    use: 'Use this for “Find the mean absolute deviation of the data.”',
    assumptions: [
      'Find the mean first.',
      'The distance of each value from the mean is never negative.',
      'The MAD is the mean of those distances: a bigger MAD means the data is more spread out.',
      'From 3 to 10 values.',
    ],
    variables: [
      COUNT,
      ...DATA_VARS,
      { id: 'm', symbol: 'm', name: 'Mean', min: 0, max: 1000, derived: true },
      { id: 'D', symbol: 'D', name: 'Mean absolute deviation', min: 0, max: 1000, derived: true },
    ],
    relations: [
      {
        id: 'm = mean',
        display: 'sum of the {n} values ÷ {n} = {m}',
        words: 'Sum of the values ÷ number of values = mean',
        check: (v: Values) => `(${dataOf(v).map(fmt).join(' + ')}) ÷ ${v.n} = ${fmt(v.m!)}`,
        vars: ['m', 'n', ...DATA],
        residual: (v: Values) => v.m! * v.n! - sumOf(dataOf(v)),
        solve: {
          m: (v: Values) => q(sumOf(dataOf(v)), v.n!),
          ...Object.fromEntries(['n', ...DATA].map((id) => [id, () => undefined])),
        },
      },
      {
        id: 'D = MAD',
        display: 'mean distance from {m} of the {n} values: {D}',
        words: 'Mean of the distances from the mean = mean absolute deviation',
        check: (v: Values) =>
          `mean distance from ${fmt(v.m!)} of ${dataOf(v).map(fmt).join(', ')}: ${fmt(v.D!)}`,
        vars: ['D', 'm', 'n', ...DATA],
        residual: (v: Values) => v.D! - madOf(v),
        solve: {
          D: (v: Values) => exact(madOf(v)),
          ...Object.fromEntries(['m', 'n', ...DATA].map((id) => [id, () => undefined])),
        },
      },
    ],
    steps: {
      'm = mean': {
        m: {
          expr: (v: Values) =>
            `(${counted(v)
              .map((id) => `{${id}}`)
              .join(' + ')}) ÷ {n}`,
          how: 'Add the values and share the sum equally among them.',
          work: (v: Values) => {
            const xs = dataOf(v);
            const t = sumOf(xs);
            return [`${xs.map(fmt).join(' + ')} = ${fmt(t)}`, `${fmt(t)} ÷ ${v.n} = ${fmt(v.m!)}`];
          },
          written: false,
        },
      },
      'D = MAD': {
        D: {
          expr: (v: Values) => `mean distance from {m} of ${listed(v)}`,
          how: 'Find how far each value is from the mean. Then find the mean of those distances.',
          work: (v: Values) => {
            const ds = dataOf(v).map((x) => exact(Math.abs(x - v.m!)));
            const t = exact(sumOf(ds));
            return [
              `Distances from ${fmt(v.m!)}: ${ds.map(fmt).join(', ')}`,
              `${ds.map(fmt).join(' + ')} = ${fmt(t)}`,
              `${fmt(t)} ÷ ${v.n} = ${fmt(v.D!)}`,
            ];
          },
          written: false,
        },
      },
    },
    example: { n: 5, a: 4, b: 7, c: 9, d: 5, e: 10, m: 7, D: 2 },
    startWith: ['n', 'a', 'b', 'c', 'd', 'e'],
    representation: {
      kind: 'dotPlot',
      data: DATA,
      count: 'n',
      min: 0,
      max: 12,
      mean: 'm',
      deviations: true,
    },
  },
  {
    id: 'm.6.center-spread~box-plot',
    title: 'Box plots',
    use: 'Use this for “What is the interquartile range?” from a box plot.',
    assumptions: [
      'The five numbers are in order: minimum, lower quartile, median, upper quartile, maximum.',
      'Each of the four parts holds about a quarter of the data: half the data is below the median.',
      'The interquartile range is the width of the box: the middle half of the data.',
    ],
    variables: [
      { id: 'a', symbol: 'a', name: 'Minimum', min: 0, max: 100, step: 0.5 },
      { id: 'b', symbol: 'b', name: 'Lower quartile', min: 0, max: 100, step: 0.5 },
      { id: 'c', symbol: 'c', name: 'Median', min: 0, max: 100, step: 0.5 },
      { id: 'd', symbol: 'd', name: 'Upper quartile', min: 0, max: 100, step: 0.5 },
      { id: 'e', symbol: 'e', name: 'Maximum', min: 0, max: 100, step: 0.5 },
      { id: 'R', symbol: 'R', name: 'Range', min: 0, max: 100 },
      { id: 'I', symbol: 'I', name: 'Interquartile range', min: 0, max: 100 },
    ],
    relations: [
      ...(
        [
          ['b', 'a'],
          ['c', 'b'],
          ['d', 'c'],
          ['e', 'd'],
        ] as const
      ).map(([big, small]) => ({
        id: `${big} ≥ ${small}`,
        constraint: true as const,
        display: `{${big}} is at least {${small}}`,
        vars: [big, small],
        residual: (v: Values) => (v[big]! >= v[small]! ? 0 : 1),
        solve: {},
      })),
      {
        id: 'R = e − a',
        display: '{e} − {a} = {R}',
        words: 'Maximum − minimum = range',
        vars: ['R', 'e', 'a'],
        residual: (v: Values) => v.R! - v.e! + v.a!,
        solve: {
          R: (v: Values) => exact(v.e! - v.a!),
          e: (v: Values) => exact(v.a! + v.R!),
          a: (v: Values) => exact(v.e! - v.R!),
        },
      },
      {
        id: 'I = d − b',
        display: '{d} − {b} = {I}',
        words: 'Upper quartile − lower quartile = interquartile range',
        vars: ['I', 'd', 'b'],
        residual: (v: Values) => v.I! - v.d! + v.b!,
        solve: {
          I: (v: Values) => exact(v.d! - v.b!),
          d: (v: Values) => exact(v.b! + v.I!),
          b: (v: Values) => exact(v.d! - v.I!),
        },
      },
    ],
    steps: {
      'b ≥ a': {},
      'c ≥ b': {},
      'd ≥ c': {},
      'e ≥ d': {},
      'R = e − a': {
        R: { expr: '{e} − {a}', how: 'The range runs from the minimum to the maximum.' },
        e: { expr: '{a} + {R}', how: 'Add the range to the minimum.' },
        a: { expr: '{e} − {R}', how: 'Take the range from the maximum.' },
      },
      'I = d − b': {
        I: {
          expr: '{d} − {b}',
          how: 'The box runs from the lower quartile to the upper quartile.',
        },
        d: { expr: '{b} + {I}', how: 'Add the interquartile range to the lower quartile.' },
        b: { expr: '{d} − {I}', how: 'Take the interquartile range from the upper quartile.' },
      },
    },
    example: { a: 2, b: 5, c: 8, d: 11, e: 15, R: 13, I: 6 },
    startWith: ['a', 'b', 'c', 'd', 'e'],
    representation: {
      kind: 'boxPlot',
      min: 'a',
      q1: 'b',
      median: 'c',
      q3: 'd',
      max: 'e',
      range: [0, 20],
      brackets: { range: 'R', iqr: 'I' },
    },
  },
];

export const MATH_6_MODULES: ModuleDef[] = modules.flat();
