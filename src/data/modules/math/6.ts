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
import { decimalLongDivision } from '../written';

const fmt = (x: number) => formatNumber(x);
/** Exact to 9 places: 7.5 ÷ 6 is 1.25, not 1.2499999999. */
const exact = (x: number) => Number(x.toFixed(9));
const q = (a: number, b: number) => (b === 0 ? undefined : exact(a / b));
const gcd = (a: number, b: number): number =>
  !Number.isFinite(a) || !Number.isFinite(b) ? 1 : b === 0 ? a : gcd(b, a % b);
const lcm = (a: number, b: number) => (a * b) / gcd(a, b);
/** How many digits after the point a decimal has (2.35 → 2, 3 → 0). */
const places = (x: number) => (String(exact(x)).split('.')[1] ?? '').length;
/** "$7.50": money to the cent. */
const money = (x: number) => `$${x.toFixed(2)}`;
const factorsOf = (n: number) =>
  Array.from({ length: n }, (_, i) => i + 1).filter((k) => n % k === 0);
/** "8/12 = 2/3" when a fraction simplifies (by the GCF), else nothing. */
const simplest = (top: number, bottom: number) => {
  const g = gcd(top, bottom);
  return g > 1 ? `${top}/${bottom} = ${top / g}/${bottom / g}` : '';
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
const DENOMS = [1, 2, 3, 4, 5, 6, 8, 10, 12];

const modules: (ModuleDef | ModuleDef[])[] = [
  // ── Ratios and ratio tables (6.RP.1, 6.RP.3a) ──
  {
    id: 'm.6.ratios',
    assumptions: [
      'Equivalent ratios multiply both parts by the same number.',
      'Adding the same number to both parts does not keep the ratio.',
      'The order matters: 3:2 is flour to milk, not milk to flour.',
      'Parts of the ratio are whole numbers to 50.',
    ],
    variables: [
      whole('a', 'a', 'First part of the ratio', 1, 50),
      whole('b', 'b', 'Second part of the ratio', 1, 50),
      { id: 'k', symbol: 'k', name: 'Multiply both by', min: 0.1, max: 100, step: 0.1 },
      { id: 'x', symbol: 'x', name: 'First amount', min: 0, max: 5000 },
      { id: 'y', symbol: 'y', name: 'Second amount', min: 0, max: 5000 },
    ],
    relations: [
      {
        id: 'x = a × k',
        display: '{a} × {k} = {x}',
        words: 'First part × multiply both by = first amount',
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
        words: 'Second part × multiply both by = second amount',
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
    title: 'Part-part-whole ratios',
    use: 'Use this when you know the ratio and the total, or how many more.',
    assumptions: [
      'Every box in the tape is worth the same amount.',
      'The second part of the ratio is at least the first, so “how many more” is never negative.',
      'Parts of the ratio are whole numbers to 20.',
    ],
    variables: [
      whole('a', 'a', 'First part of the ratio', 1, 20),
      whole('b', 'b', 'Second part of the ratio', 1, 20),
      { ...whole('n', 'n', 'Parts in all', 2, 40), derived: true },
      { id: 'u', symbol: 'u', name: 'One part is worth', min: 0, max: 10000, derived: true },
      { id: 'x', symbol: 'x', name: 'First amount', min: 0, max: 200000 },
      { id: 'y', symbol: 'y', name: 'Second amount', min: 0, max: 200000 },
      { id: 't', symbol: 't', name: 'Total', min: 0, max: 400000 },
      { id: 'd', symbol: 'd', name: 'How many more in the second', min: 0, max: 200000 },
    ],
    relations: [
      {
        id: 'b ≥ a',
        constraint: true,
        display: '{b} is at least {a}',
        vars: ['b', 'a'],
        residual: (v: Values) => (v.b! >= v.a! ? 0 : 1),
        solve: {},
      },
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
        check: (v: Values) => `${fmt(v.u!)} × ${v.n} = ${fmt(v.t!)}`,
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
        id: 'd = (b − a) × u',
        display: '({b} − {a}) × {u} = {d}',
        words: '(Second part − first part) × one part is worth = how many more in the second',
        vars: ['d', 'b', 'a', 'u'],
        residual: (v: Values) => v.d! - (v.b! - v.a!) * v.u!,
        solve: {
          d: (v: Values) => exact((v.b! - v.a!) * v.u!),
          u: (v: Values) => q(v.d!, v.b! - v.a!),
          a: () => undefined,
          b: () => undefined,
        },
      },
    ],
    steps: {
      'b ≥ a': {},
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
      'd = (b − a) × u': {
        d: {
          expr: '({b} − {a}) × {u}',
          how: 'The second tape has more boxes. Multiply the extra boxes by what one is worth.',
        },
        u: {
          expr: '{d} ÷ ({b} − {a})',
          how: 'The extra boxes in the second tape make the difference. Share it among them.',
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

  // ── Unit rates (6.RP.2, 6.RP.3b) ──
  {
    id: 'm.6.unit-rates',
    assumptions: [
      'Every item costs the same: the rate stays the same.',
      'The unit rate is the amount for 1.',
      'Prices are in dollars and cents; counts are whole numbers to 1,000.',
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
        step: 0.01,
        multipleOf: 0.01,
      },
    ],
    relations: [
      {
        id: 't = c × n',
        display: '{c} × {n} = {t}',
        words: 'Cost per item × number of items = total cost',
        vars: ['t', 'c', 'n'],
        residual: (v: Values) => v.t! - v.c! * v.n!,
        solve: {
          t: (v: Values) => exact(v.c! * v.n!),
          c: (v: Values) => q(v.t!, v.n!),
          n: (v: Values) => q(v.t!, v.c!),
        },
      },
    ],
    steps: {
      't = c × n': {
        c: {
          expr: '{t} ÷ {n}',
          how: 'The unit rate is the price of 1. Share the total cost equally among the items.',
          note: (v) => `(${money(v.c!)} for each item)`,
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
    use: 'Use this to compare two prices by the cost of one item.',
    assumptions: [
      'The better buy is the one with the lower price for one item.',
      'The two stores sell the same item.',
      'Prices are in dollars and cents; counts are whole numbers to 100.',
    ],
    variables: [
      {
        id: 'a',
        symbol: 'a',
        name: 'First store’s price',
        unit: '$',
        min: 0,
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
        name: 'Second store’s price',
        unit: '$',
        min: 0,
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
        p: { expr: '{a} ÷ {m}', how: 'Find the price of one at the first store: divide.' },
      },
      'r = b ÷ n': {
        r: { expr: '{b} ÷ {n}', how: 'Find the price of one at the second store: divide.' },
      },
      'd = p and r apart': {
        d: {
          expr: (v) => (v.p! >= v.r! ? '{p} − {r}' : '{r} − {p}'),
          how: 'Take the lower price for one from the higher one.',
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
    use: 'Use this for distance, time and speed when the speed stays the same.',
    assumptions: [
      'The speed stays the same the whole way.',
      'Speed is the distance in 1 hour.',
      'Times to 100 hours, in hours (half an hour is 0.5).',
    ],
    variables: [
      { id: 'd', symbol: 'd', name: 'Distance in kilometers', min: 0, max: 100000, step: 0.1 },
      { id: 't', symbol: 't', name: 'Time in hours', min: 0.1, max: 100, step: 0.1 },
      { id: 's', symbol: 's', name: 'Speed in kilometers per hour', min: 0, max: 1000, step: 0.1 },
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

  // ── Percent of a quantity (6.RP.3c) ──
  {
    id: 'm.6.percent',
    assumptions: [
      'Percent means out of 100: the whole is 100%.',
      'More than 100% means more than the whole.',
      'The part and the whole use the same unit.',
    ],
    variables: [
      { id: 'p', symbol: 'p', name: 'Percent', unit: '%', min: 0, max: 300, step: 0.1 },
      { id: 'w', symbol: 'w', name: 'Whole', min: 0, max: 100000 },
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
    use: 'Use this to write a fraction as a decimal and a percent.',
    assumptions: [
      'Make the denominator 100: the numerator is then the percent.',
      'A percent is hundredths: 60% = 60/100 = 0.6.',
      'The fraction is at most 1, with a denominator that divides 100.',
    ],
    variables: [
      whole('a', 'a', 'Numerator', 0, 100),
      { ...whole('b', 'b', 'Denominator', 2, 100), allowed: [2, 4, 5, 10, 20, 25, 50, 100] },
      { id: 'd', symbol: 'd', name: 'Decimal', min: 0, max: 1, step: 0.01, multipleOf: 0.01 },
      {
        id: 'p',
        symbol: 'p',
        name: 'Percent',
        unit: '%',
        min: 0,
        max: 100,
        step: 1,
        multipleOf: 1,
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
            return k === 1
              ? [`${v.a}/100 = ${fmt(v.d!)}`]
              : [
                  `${v.a}/${v.b} = ${v.a! * k}/100 (multiply both by ${k})`,
                  `${v.a! * k}/100 = ${fmt(v.d!)}`,
                ];
          },
          written: false,
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
      'Divisors are whole numbers from 2 to 99; quotients end within three decimal places.',
    ],
    variables: [
      { id: 'n', symbol: 'n', name: 'Dividend', min: 0, max: 99999, step: 0.01, multipleOf: 0.01 },
      whole('d', 'd', 'Divisor', 2, 99),
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
    id: 'm.6.multi-digit-decimals~multiply-decimals',
    title: 'Multiply decimals',
    use: 'Use this for 2.35 × 1.4: multiply as whole numbers, then place the point.',
    assumptions: [
      'Multiply without the points, then count the decimal places in both factors.',
      'The product has that many decimal places.',
      'Factors to two decimal places.',
    ],
    variables: [
      {
        id: 'a',
        symbol: 'a',
        name: 'First factor',
        min: 0.01,
        max: 999.99,
        step: 0.01,
        multipleOf: 0.01,
      },
      {
        id: 'b',
        symbol: 'b',
        name: 'Second factor',
        min: 0.01,
        max: 99.99,
        step: 0.01,
        multipleOf: 0.01,
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
          written: false,
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
    id: 'm.6.multi-digit-decimals~divide-by-decimal',
    title: 'Divide by a decimal',
    use: 'Use this for 1.26 ÷ 0.3: make the divisor whole, then divide.',
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
    const den = (id: string, name: string) => ({ ...whole(id, id, name, 1, 12), allowed: DENOMS });
    /** The picture lays out at most 40 groups. */
    const most40 = {
      id: 'quotient ≤ 40',
      constraint: true as const,
      display: '{a}/{b} ÷ {c}/{d} is at most 40',
      vars: ['a', 'b', 'c', 'd'],
      residual: (v: Values) => (v.a! * v.d! <= 40 * v.b! * v.c! ? 0 : 1),
      solve: {},
    };
    const pages: ModuleDef[] = [
      {
        id: 'm.6.divide-fractions',
        assumptions: [
          'Dividing by a fraction is multiplying by its reciprocal: flip its numerator and denominator.',
          'The divisor is never 0, and the quotient is at most 40.',
          'Write mixed numbers as fractions first: 2 1/4 = 9/4.',
        ],
        variables: [
          fr('a', 'Dividend numerator'),
          den('b', 'Dividend denominator'),
          { ...fr('c', 'Divisor numerator', 12), min: 1 },
          den('d', 'Divisor denominator'),
          { ...fr('e', 'Quotient numerator', 1200), derived: true },
          { ...fr('f', 'Quotient denominator', 144), min: 1, derived: true },
        ],
        relations: [
          most40,
          {
            id: 'e = a × d',
            display: '{a}/{b} × {d}/{c} = {e}/{f}',
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
            display: '{a}/{b} × {d}/{c} = {e}/{f}',
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
          'quotient ≤ 40': {},
          'e = a × d': {
            e: {
              expr: '{a} × {d}',
              how: 'Multiply by the reciprocal of the divisor: flip it. Then multiply the numerators.',
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
              note: (v) => {
                if (v.e === undefined) return '';
                const s = simplest(v.e, v.f!);
                const m = mixed(v.e, v.f!);
                const parts = [
                  s,
                  v.e! > v.f! && !m.includes('/') ? '' : v.e! > v.f! ? m : '',
                ].filter(Boolean);
                return parts.length ? `(${parts.join(' = ')})` : '';
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
          wholes: 2,
        },
      },
      {
        id: 'm.6.divide-fractions~how-many-fit',
        title: 'How many groups?',
        use: 'Use this for how many 3/4-cup servings are in 2 1/4 cups.',
        assumptions: [
          'Write both amounts with the same denominator. Then divide the numerators.',
          'A part of a group left over is a fraction of a group.',
          'Denominators from 1 to 12, up to 40 groups; write mixed numbers as fractions (2 1/4 = 9/4).',
        ],
        variables: [
          fr('a', 'Amount numerator'),
          den('b', 'Amount denominator'),
          { ...fr('c', 'Group size numerator', 12), min: 1 },
          den('d', 'Group size denominator'),
          { ...whole('m', 'm', 'Common denominator', 1, 144), derived: true },
          { id: 'g', symbol: 'g', name: 'Number of groups', min: 0, max: 1200, derived: true },
        ],
        relations: [
          most40,
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
            display: '({a} × {m} ÷ {b}) ÷ ({c} × {m} ÷ {d}) = {g}',
            words: 'Amount in the common denominator ÷ group size in it = number of groups',
            vars: ['g', 'a', 'm', 'b', 'c', 'd'],
            residual: (v: Values) => v.g! * v.c! * v.b! - v.a! * v.d!,
            solve: {
              g: (v: Values) => q(v.a! * v.d!, v.b! * v.c!),
              a: () => undefined,
              b: () => undefined,
              c: () => undefined,
              d: () => undefined,
              m: () => undefined,
            },
          },
        ],
        steps: {
          'quotient ≤ 40': {},
          'm = LCM of b and d': {
            m: {
              expr: 'least common multiple of {b} and {d}',
              how: 'The least common multiple of the two denominators.',
              work: (v) =>
                v.b === v.d
                  ? [`Both are in ${v.b}ths already`]
                  : [
                      `Multiples of ${v.b}: ${Array.from({ length: v.m! / v.b! }, (_, i) => (i + 1) * v.b!).join(', ')}`,
                      `Multiples of ${v.d}: ${Array.from({ length: v.m! / v.d! }, (_, i) => (i + 1) * v.d!).join(', ')}`,
                    ],
            },
          },
          'g = (a × m ÷ b) ÷ (c × m ÷ d)': {
            g: {
              expr: '({a} × {m} ÷ {b}) ÷ ({c} × {m} ÷ {d})',
              how: 'Write both with the common denominator. Then divide the numerators.',
              work: (v) => {
                const [A, C] = [(v.a! * v.m!) / v.b!, (v.c! * v.m!) / v.d!];
                return [
                  `${v.a}/${v.b} = ${A}/${v.m} and ${v.c}/${v.d} = ${C}/${v.m}`,
                  `${A} ÷ ${C} = ${A}/${C}`,
                ];
              },
              note: (v) => {
                const [A, C] = [(v.a! * v.m!) / v.b!, (v.c! * v.m!) / v.d!];
                const full = Math.floor(A / C);
                const left = A - full * C;
                return left === 0
                  ? `(${full} group${full === 1 ? '' : 's'})`
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
        title: 'How much in one group?',
        use: 'Use this when 2/3 gallon fills 3/4 of a tank: how much fills the whole tank?',
        assumptions: [
          'The amount fills part of one group. Find one of those parts, then the whole group.',
          'This is the same as dividing the amount by the fraction of a group.',
          'Denominators from 1 to 12; the whole group is at most 40 times the amount.',
        ],
        variables: [
          fr('a', 'Amount numerator'),
          den('b', 'Amount denominator'),
          { ...fr('c', 'Parts of the group it fills', 12), min: 1 },
          den('d', 'Parts in one group'),
          { ...fr('e', 'Whole group numerator', 1200), derived: true },
          { ...fr('f', 'Whole group denominator', 144), min: 1, derived: true },
        ],
        relations: [
          most40,
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
            words: 'Parts in one group × one part = whole group',
            shows: ['f'],
            check: (v: Values) => `${v.d} × ${v.a} = ${v.e}`,
            vars: ['e', 'a', 'd'],
            residual: (v: Values) => v.e! - v.a! * v.d!,
            solve: { e: (v: Values) => v.a! * v.d!, a: () => undefined, d: () => undefined },
          },
        ],
        steps: {
          'quotient ≤ 40': {},
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
                return `(the same as ${v.a}/${v.b} ÷ ${v.c}/${v.d} = ${v.e}/${v.f}${s ? `; ${s}` : ''})`;
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
        words: 'Greatest factor of both numbers = greatest common factor',
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
    use: 'Use this to find when two repeating things line up: the LCM of two numbers.',
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
    use: 'Use this to find the GCF and LCM of bigger numbers from their prime factors.',
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
    use: 'Use this to write 36 + 8 as 4 × (9 + 2).',
    assumptions: [
      'Both numbers are multiples of their GCF, so the sum is the GCF times a sum.',
      'Multiplying back gives the same sum: 4 × 9 + 4 × 2 = 36 + 8.',
      'Whole numbers from 1 to 100.',
    ],
    variables: [
      whole('a', 'a', 'First number', 1, 100),
      whole('b', 'b', 'Second number', 1, 100),
      { ...whole('g', 'g', 'Greatest common factor', 1, 100), derived: true },
      { ...whole('x', 'x', 'First number ÷ GCF', 1, 100), derived: true },
      { ...whole('y', 'y', 'Second number ÷ GCF', 1, 100), derived: true },
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
          note: (v) => `(${v.a} + ${v.b} = ${v.g} × (${v.x} + ${v.y}))`,
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
];

export const MATH_6_MODULES: ModuleDef[] = modules.flat();
