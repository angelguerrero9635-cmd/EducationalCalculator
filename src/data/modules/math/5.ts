/**
 * Grade 5 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { formatNumber } from '@/engine/format';
import type { Values } from '@/engine/types';

import { div, sum2, times, whole } from '../helpers';
import type { ModuleDef, Representation } from '../types';
import { longDivision } from '../written';

const fmt = (x: number) => formatNumber(x);
/** t = the `place` part of a: 't = tens of b' solves t = 10 × ⌊b ÷ 10⌋ from b alone. */
const placePart = (out: string, of: string, place: number, name: string) => ({
  id: `${out} = ${name} of ${of}`,
  display: `{${of}} has {${out}} in its ${name}`,
  vars: [out, of],
  residual: (v: Values) => v[out]! - place * Math.floor((v[of]! % (place * 10)) / place),
  // Every number from 50 to 59 has 50 in its tens: the number can't be found from it.
  solve: {
    [out]: (v: Values) => place * Math.floor((v[of]! % (place * 10)) / place),
    [of]: () => undefined,
  },
});
/** A fraction is at most 1 (a check-only relation). */
const atMostOne = (top: string, bottom: string) => ({
  id: `${top} ≤ ${bottom}`,
  constraint: true as const,
  display: `{${top}}/{${bottom}} is at most 1`,
  vars: [top, bottom],
  residual: (v: Values) => (v[top]! <= v[bottom]! ? 0 : 1),
  solve: {},
});
const BOTTOMS = [2, 3, 4, 5, 6, 8, 10, 12];
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const lcm = (a: number, b: number) => (a * b) / gcd(a, b);
/** "(6/12 = 1/2)" when a fraction simplifies, else nothing. */
const simplerNote = (top: number, bottom: number) => {
  const g = gcd(top, bottom);
  return g > 1 ? `(${top}/${bottom} = ${top / g}/${bottom / g})` : '';
};
/** "5/4 = 1 whole and 1/4" for a top past the bottom, else nothing. */
const wholesNote = (top: number, bottom: number) => {
  if (top < bottom) return '';
  const w = Math.floor(top / bottom);
  const r = top - w * bottom;
  const wholes = w === 1 ? '1 whole' : `${w} wholes`;
  return `(${top}/${bottom} = ${wholes}${r ? ` and ${r}/${bottom}` : ''})`;
};
/** How many digits after the point a decimal has (2.5 → 1, 3 → 0). */
const places = (x: number) => (String(x).split('.')[1] ?? '').length;
/** A power of ten, the way it is unfolded: "10^3 = 10 × 10 × 10 = 1,000". */
const unfold = (k: number) =>
  k === 0
    ? '10^0 = 1: no tens multiplied'
    : `10^${k} = ${Array(k).fill(10).join(' × ')} = ${fmt(10 ** k)}`;
/** Under the long-division bracket: the quotient's places and what is left over. */
const quotientLines = (n: number, d: number): string[] => {
  const q = Math.floor(n / d);
  const r = n - q * d;
  const digits = String(q).split('');
  const names = ['ones', 'tens', 'hundreds', 'thousands'];
  const placesRead = digits.map((x, i) => `${x} ${names[digits.length - 1 - i]}`).join(', ');
  return [
    `Quotient: ${placesRead}${digits.length > 1 ? ` → ${fmt(q)}` : ''}`,
    `${fmt(r)} left over: less than ${d}, so it is the remainder`,
  ];
};

const modules: (ModuleDef | ModuleDef[])[] = [
  // ── Order of operations with parentheses (5.OA.1) ──
  (() => {
    const inside = sum2(
      's = a + b',
      ['a', 'b', 's'],
      ['first number in the parentheses', 'second number in the parentheses', 'value inside'],
    );
    const product = times('p = s × c', ['s', 'c', 'p'], ['value inside', 'multiplier', 'product']);
    const pages: ModuleDef[] = [
      {
        id: 'm.5.order-of-operations',
        assumptions: [
          'Work inside the parentheses first. Then multiply or divide. Then add or subtract.',
          'The tape shows the value inside as equal groups, with the last number taken off the end.',
          'Numbers inside the parentheses to 20, the multiplier to 10.',
        ],
        variables: [
          whole('a', 'a', 'First number inside', 0, 20),
          whole('b', 'b', 'Second number inside', 0, 20),
          { ...whole('s', 's', 'Value inside the parentheses', 0, 40), derived: true },
          whole('c', 'c', 'Multiplier', 1, 10),
          { ...whole('p', 'p', 'Product', 0, 400), derived: true },
          whole('d', 'd', 'Subtracted', 0, 400),
          whole('r', 'r', 'Result', 0, 400),
        ],
        relations: [
          inside.relation,
          product.relation,
          {
            id: 'r = p − d',
            display: '{p} − {d} = {r}',
            vars: ['r', 'p', 'd'],
            residual: (v: Values) => v.r! - v.p! + v.d!,
            solve: {
              r: (v: Values) => v.p! - v.d!,
              p: (v: Values) => v.r! + v.d!,
              d: (v: Values) => v.p! - v.r!,
            },
          },
        ],
        steps: {
          's = a + b': {
            ...inside.steps,
            s: { ...inside.steps.s!, how: 'Parentheses first: add the two numbers inside.' },
          },
          'p = s × c': {
            ...product.steps,
            p: {
              ...product.steps.p!,
              how: 'Multiply next: the value inside times the multiplier.',
            },
          },
          'r = p − d': {
            r: { expr: '{p} − {d}', how: 'Subtract last: the product minus the last number.' },
            p: { expr: '{r} + {d}', how: 'Add back what was subtracted to get the product.' },
            d: { expr: '{p} − {r}', how: 'The product minus the result is what was subtracted.' },
          },
        },
        example: { a: 3, b: 5, s: 8, c: 4, p: 32, d: 7, r: 25 },
        startWith: ['a', 'b', 'c', 'd'],
        pictureLabels: ['r'],
        representation: {
          kind: 'tape',
          parts: ['r', 'd'],
          total: 'p',
          groups: 's',
          caption: '({a} + {b}) × {c} = {p}. Subtract {d}: {r}.',
        },
      },
      {
        id: 'm.5.order-of-operations~divide',
        title: 'Add inside, then divide',
        use: 'Use this for (18 + 6) ÷ 4 and other expressions with parentheses and division.',
        assumptions: [
          'Work inside the parentheses first. Then divide.',
          'Without the parentheses, 18 + 6 ÷ 4 would divide first: only the 6 would be shared.',
          'Numbers inside to 50, dividing by 2 to 10.',
        ],
        variables: [
          whole('a', 'a', 'First number inside', 0, 50),
          whole('b', 'b', 'Second number inside', 0, 50),
          { ...whole('s', 's', 'Value inside the parentheses', 0, 100), derived: true },
          whole('c', 'c', 'Divided by', 2, 10),
          whole('q', 'q', 'Result', 0, 50),
        ],
        relations: [
          inside.relation,
          {
            id: 's = q × c',
            display: '{s} ÷ {c} = {q}',
            check: (v: Values) => `${v.q} × ${v.c} = ${v.s}`,
            vars: ['s', 'q', 'c'],
            residual: (v: Values) => v.s! - v.q! * v.c!,
            solve: {
              s: (v: Values) => v.q! * v.c!,
              q: (v: Values) => div(v.s!, v.c!),
              c: (v: Values) => div(v.s!, v.q!),
            },
          },
        ],
        steps: {
          's = a + b': {
            ...inside.steps,
            s: { ...inside.steps.s!, how: 'Parentheses first: add the two numbers inside.' },
          },
          's = q × c': {
            q: { expr: '{s} ÷ {c}', how: 'Divide next: the value inside shared into equal parts.' },
            s: { expr: '{q} × {c}', how: 'The result times the divisor gives the value inside.' },
            c: { expr: '{s} ÷ {q}', how: 'The value inside divided by the result.' },
          },
        },
        example: { a: 18, b: 6, s: 24, c: 4, q: 6 },
        startWith: ['a', 'b', 'c'],
        representation: { kind: 'equalGroups', groups: 'c', each: 'q', total: 's' },
      },
    ];
    return pages;
  })(),
  // ── Powers of 10 and exponents (5.NBT.2) ──
  {
    id: 'm.5.powers-of-ten',
    assumptions: [
      'The exponent counts how many tens are multiplied: 10^3 = 10 × 10 × 10 = 1,000.',
      'Multiplying by 10 moves every digit one place to the left. The chart shows the places.',
      'Multiplying by 10^3 moves the digits three places: write three zeros after the number.',
      'Numbers to 999, exponents to 4.',
    ],
    variables: [
      whole('n', 'n', 'Number', 1, 999),
      whole('k', 'k', 'Exponent', 0, 4),
      { ...whole('e', 'e', 'Power of 10', 1, 10000), allowed: [1, 10, 100, 1000, 10000] },
      whole('p', 'p', 'Product', 1, 9990000),
    ],
    relations: [
      {
        id: 'e = 10^k',
        display: '10^{k} = {e}',
        vars: ['e', 'k'],
        residual: (v: Values) => v.e! - 10 ** v.k!,
        solve: {
          e: (v: Values) => 10 ** v.k!,
          k: (v: Values) => {
            const k = Math.round(Math.log10(v.e!));
            return 10 ** k === v.e ? k : undefined;
          },
        },
      },
      {
        id: 'p = n × e',
        display: '{n} × {e} = {p}',
        vars: ['p', 'n', 'e'],
        residual: (v: Values) => v.p! - v.n! * v.e!,
        solve: {
          p: (v: Values) => v.n! * v.e!,
          n: (v: Values) => div(v.p!, v.e!),
          e: (v: Values) => div(v.p!, v.n!),
        },
      },
    ],
    steps: {
      'e = 10^k': {
        e: {
          expr: '10^{k}',
          how: 'Multiply that many tens together. The exponent is also the number of zeros.',
          work: (v: Values) => [unfold(v.k!)],
        },
        k: {
          expr: 'zeros in {e}',
          how: 'Count the zeros after the 1: that many tens were multiplied.',
        },
      },
      'p = n × e': {
        p: {
          expr: '{n} × {e}',
          how: 'Every digit moves left one place for each ten. Write the zeros after the number.',
          work: (v: Values) =>
            v.k
              ? [`${v.n} with ${v.k} ${v.k === 1 ? 'zero' : 'zeros'} after it: ${fmt(v.p!)}`]
              : ['Times 1 changes nothing.'],
          written: false,
        },
        n: {
          expr: '{p} ÷ {e}',
          how: 'Dividing by a power of 10 moves every digit right: take the zeros off the end.',
          written: false,
        },
        e: {
          expr: '{p} ÷ {n}',
          how: 'Divide the product by the number: the power of 10 is what is left.',
          written: false,
        },
      },
    },
    example: { n: 34, k: 3, e: 1000, p: 34000 },
    startWith: ['n', 'k'],
    representation: { kind: 'placeValueChart', value: 'p', decimals: 0 },
  },
  {
    id: 'm.5.powers-of-ten~decimals',
    title: 'Move the decimal point',
    use: 'Use this for 3.45 × 10^2 = 345 and other decimals times a power of 10.',
    assumptions: [
      'Multiplying a decimal by 10 moves every digit one place left: the point moves one place right.',
      'Multiplying by 10^2 moves the point two places right. Dividing moves it left.',
      'Decimals to hundredths, exponents to 3.',
    ],
    variables: [
      { id: 'n', symbol: 'n', name: 'Decimal', min: 0.01, max: 99.99, step: 0.01 },
      whole('k', 'k', 'Exponent', 0, 3),
      { ...whole('e', 'e', 'Power of 10', 1, 1000), allowed: [1, 10, 100, 1000] },
      { id: 'p', symbol: 'p', name: 'Product', min: 0.01, max: 99990, step: 0.01 },
    ],
    relations: [
      {
        id: 'e = 10^k',
        display: '10^{k} = {e}',
        vars: ['e', 'k'],
        residual: (v: Values) => v.e! - 10 ** v.k!,
        solve: {
          e: (v: Values) => 10 ** v.k!,
          k: (v: Values) => {
            const k = Math.round(Math.log10(v.e!));
            return 10 ** k === v.e ? k : undefined;
          },
        },
      },
      {
        id: 'p = n × e',
        display: '{n} × {e} = {p}',
        vars: ['p', 'n', 'e'],
        residual: (v: Values) => v.p! - v.n! * v.e!,
        solve: {
          p: (v: Values) => v.n! * v.e!,
          n: (v: Values) => div(v.p!, v.e!),
          e: (v: Values) => div(v.p!, v.n!),
        },
      },
    ],
    steps: {
      'e = 10^k': {
        e: {
          expr: '10^{k}',
          how: 'Multiply that many tens together. The exponent is also the number of zeros.',
          work: (v: Values) => [unfold(v.k!)],
        },
        k: {
          expr: 'zeros in {e}',
          how: 'Count the zeros after the 1: that many tens were multiplied.',
        },
      },
      'p = n × e': {
        p: {
          expr: '{n} × {e}',
          how: 'Move the point right one place for each ten. Fill any empty places with zeros.',
          work: (v: Values) =>
            v.k
              ? [
                  `Point moves ${v.k} ${v.k === 1 ? 'place' : 'places'} right: ${fmt(v.n!)} → ${fmt(v.p!)}`,
                ]
              : ['Times 1 changes nothing.'],
          written: false,
        },
        n: {
          expr: '{p} ÷ {e}',
          how: 'Dividing by a power of 10 moves the point left, one place for each ten.',
          written: false,
        },
        e: {
          expr: '{p} ÷ {n}',
          how: 'Divide the product by the decimal: the power of 10 is what is left.',
          written: false,
        },
      },
    },
    example: { n: 3.45, k: 2, e: 100, p: 345 },
    startWith: ['n', 'k'],
    representation: { kind: 'placeValueChart', value: 'p', decimals: 2 },
  },
  // ── The standard algorithm for multiplication (5.NBT.5) ──
  {
    id: 'm.5.standard-algorithm',
    assumptions: [
      'Multiply by the ones digit of the second factor, then by its tens digit (a zero first).',
      'Add the two rows. The area model shows the same two parts as boxes.',
      'First factor from 10 to 999, second factor from 10 to 99.',
    ],
    variables: [
      whole('a', 'a', 'First factor', 10, 999),
      whole('b', 'b', 'Second factor', 10, 99),
      { ...whole('t', 't', 'Tens of the second factor', 10, 90), derived: true },
      { ...whole('o', 'o', 'Ones of the second factor', 0, 9), derived: true },
      { ...whole('x', 'x', 'First factor × ones', 0, 8991), derived: true },
      { ...whole('y', 'y', 'First factor × tens', 100, 89910), derived: true },
      whole('p', 'p', 'Product', 100, 98901),
    ],
    relations: [
      placePart('t', 'b', 10, 'tens'),
      {
        id: 'b = t + o',
        display: '{b} = {t} + {o}',
        vars: ['b', 't', 'o'],
        residual: (v: Values) => v.b! - v.t! - v.o!,
        solve: {
          b: (v: Values) => v.t! + v.o!,
          t: (v: Values) => v.b! - v.o!,
          o: (v: Values) => v.b! - v.t!,
        },
      },
      {
        id: 'x = a × o',
        display: '{a} × {o} = {x}',
        vars: ['x', 'a', 'o'],
        residual: (v: Values) => v.x! - v.a! * v.o!,
        solve: {
          x: (v: Values) => v.a! * v.o!,
          a: (v: Values) => div(v.x!, v.o!),
          o: (v: Values) => div(v.x!, v.a!),
        },
      },
      {
        id: 'y = a × t',
        display: '{a} × {t} = {y}',
        vars: ['y', 'a', 't'],
        residual: (v: Values) => v.y! - v.a! * v.t!,
        solve: {
          y: (v: Values) => v.a! * v.t!,
          a: (v: Values) => div(v.y!, v.t!),
          t: (v: Values) => div(v.y!, v.a!),
        },
      },
      {
        id: 'p = x + y',
        display: '{x} + {y} = {p}',
        vars: ['p', 'x', 'y'],
        residual: (v: Values) => v.p! - v.x! - v.y!,
        solve: {
          p: (v: Values) => v.x! + v.y!,
          x: (v: Values) => v.p! - v.y!,
          y: (v: Values) => v.p! - v.x!,
        },
      },
      {
        id: 'p = a × b',
        display: '{a} × {b} = {p}',
        vars: ['p', 'a', 'b'],
        residual: (v: Values) => v.p! - v.a! * v.b!,
        solve: {
          p: (v: Values) => v.a! * v.b!,
          a: (v: Values) => div(v.p!, v.b!),
          b: (v: Values) => div(v.p!, v.a!),
        },
      },
    ],
    steps: {
      't = tens of b': {
        t: { expr: '{b} without its ones', how: 'The tens of the second factor.' },
      },
      'b = t + o': {
        o: {
          expr: '{b} − {t}',
          how: 'The ones of the second factor: what is left after the tens.',
        },
        t: { expr: '{b} − {o}', how: 'The tens: the second factor without its ones.' },
        b: { expr: '{t} + {o}', how: 'Tens and ones together make the second factor.' },
      },
      'x = a × o': {
        x: {
          expr: '{a} × {o}',
          how: 'First row: the first factor times the ones digit.',
        },
        a: { expr: '{x} ÷ {o}', how: 'Divide the first row by the ones digit.' },
        o: { expr: '{x} ÷ {a}', how: 'Divide the first row by the first factor.' },
      },
      'y = a × t': {
        y: {
          expr: '{a} × {t}',
          how: 'Second row: a zero in the ones place, then the first factor times the tens digit.',
          work: (v: Values) => [
            `${v.a} × ${v.t! / 10} = ${fmt((v.a! * v.t!) / 10)}`,
            `${v.a} × ${v.t} = ${fmt(v.y!)}`,
          ],
          written: false,
        },
        a: { expr: '{y} ÷ {t}', how: 'Divide the second row by the tens.', written: false },
        t: { expr: '{y} ÷ {a}', how: 'Divide the second row by the first factor.', written: false },
      },
      'p = x + y': {
        p: { expr: '{x} + {y}', how: 'Add the two rows.' },
        x: { expr: '{p} − {y}', how: 'Take the tens row from the product.' },
        y: { expr: '{p} − {x}', how: 'Take the ones row from the product.' },
      },
      'p = a × b': {
        p: {
          expr: '{a} × {b}',
          how: 'The standard algorithm: a row for the ones, a row for the tens, then add.',
        },
        a: {
          expr: '{p} ÷ {b}',
          how: 'Divide the product by the second factor.',
          work: (v: Values) => quotientLines(v.p!, v.b!).slice(0, 1),
        },
        b: {
          expr: '{p} ÷ {a}',
          how: 'Divide the product by the first factor.',
          written: false,
        },
      },
    },
    example: { a: 234, b: 56, t: 50, o: 6, x: 1404, y: 11700, p: 13104 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'areaModel',
      top: ['a'],
      side: ['t', 'o'],
      parts: [['y'], ['x']],
      total: 'p',
    },
  },
  // ── Division by a 2-digit divisor (5.NBT.6) ──
  {
    id: 'm.5.divide-2-digit',
    assumptions: [
      'Share the dividend into equal groups of the divisor. The number of groups is the quotient.',
      'Work one place at a time, biggest first: estimate how many fit, multiply, take away, bring down.',
      'What is left is the remainder. It is always less than the divisor.',
      'Dividends to 9,999, divisors from 10 to 99.',
    ],
    variables: [
      whole('n', 'n', 'Dividend', 100, 9999),
      whole('d', 'd', 'Divisor', 10, 99),
      whole('q', 'q', 'Quotient', 1, 999),
      whole('r', 'r', 'Remainder', 0, 98),
      { ...whole('m', 'm', 'Shared out', 10, 9999), derived: true },
    ],
    relations: [
      {
        id: 'm = q × d',
        display: '{q} × {d} = {m}',
        vars: ['m', 'q', 'd'],
        residual: (v: Values) => v.m! - v.q! * v.d!,
        solve: {
          m: (v: Values) => v.q! * v.d!,
          q: (v: Values) => div(v.m!, v.d!),
          d: (v: Values) => div(v.m!, v.q!),
        },
      },
      {
        id: 'n = m + r',
        display: '{m} + {r} = {n}',
        vars: ['n', 'm', 'r'],
        residual: (v: Values) => v.n! - v.m! - v.r!,
        solve: {
          n: (v: Values) => v.m! + v.r!,
          m: (v: Values) => v.n! - v.r!,
          r: (v: Values) => v.n! - v.m!,
        },
      },
      {
        id: 'r < d',
        constraint: true,
        display: '{r} is less than {d}',
        vars: ['r', 'd'],
        residual: (v: Values) => (v.r! < v.d! ? 0 : 1),
        solve: {},
      },
      {
        id: 'q = whole groups of d in n',
        display: '{n} ÷ {d} → {q} whole groups',
        check: (v: Values) => `${fmt(v.n!)} ÷ ${v.d} = ${fmt(v.q!)} remainder ${v.n! % v.d!}`,
        vars: ['q', 'n', 'd'],
        residual: (v: Values) => v.q! - Math.floor(v.n! / v.d!),
        solve: {
          q: (v: Values) => Math.floor(v.n! / v.d!),
          n: () => undefined,
          d: () => undefined,
        },
      },
    ],
    steps: {
      'r < d': {},
      'm = q × d': {
        m: { expr: '{q} × {d}', how: 'The groups times the divisor: what was shared out.' },
        q: { expr: '{m} ÷ {d}', how: 'Divide what was shared out by the divisor.' },
        d: { expr: '{m} ÷ {q}', how: 'Divide what was shared out by the quotient.' },
      },
      'n = m + r': {
        n: { expr: '{m} + {r}', how: 'The dividend is what was shared out plus the remainder.' },
        m: { expr: '{n} − {r}', how: 'Take the remainder away from the dividend.' },
        r: { expr: '{n} − {m}', how: 'The remainder is what is left after sharing out.' },
      },
      'q = whole groups of d in n': {
        q: {
          expr: 'whole groups of {d} in {n}',
          how: 'Estimate each digit with a rounded divisor, multiply, take away, bring the next digit down.',
          work: (v: Values) => quotientLines(v.n!, v.d!),
          written: (v: Values) => longDivision(v.n!, v.d!),
        },
      },
    },
    example: { n: 1987, d: 23, q: 86, r: 9, m: 1978 },
    startWith: ['n', 'd'],
    pictureLabels: ['q'],
    representation: {
      kind: 'tape',
      parts: ['m', 'r'],
      total: 'n',
      groups: 'q',
      groupsPart: 'm',
      caption: '{q} groups of {d} make {m}, and {r} left over.',
    },
  },
  // ── Decimals to hundredths: add and subtract (5.NBT.7) ──
  {
    id: 'm.5.decimal-operations',
    assumptions: [
      'Line up the decimal points, so tenths sit under tenths and hundredths under hundredths.',
      'Add or take away each place from the right, regrouping like whole numbers.',
      'The point in the answer goes under the other points. Numbers to 99.99.',
    ],
    variables: [
      { id: 'a', symbol: 'a', name: 'First number', min: 0, max: 99.99, step: 0.01 },
      { id: 'b', symbol: 'b', name: 'Second number', min: 0, max: 99.99, step: 0.01 },
      { id: 'c', symbol: 'c', name: 'Total', min: 0, max: 199.98, step: 0.01 },
    ],
    relations: [
      {
        id: 'c = a + b',
        display: '{a} + {b} = {c}',
        vars: ['c', 'a', 'b'],
        residual: (v: Values) => v.c! - v.a! - v.b!,
        solve: {
          c: (v: Values) => v.a! + v.b!,
          a: (v: Values) => v.c! - v.b!,
          b: (v: Values) => v.c! - v.a!,
        },
      },
    ],
    steps: {
      'c = a + b': {
        c: {
          expr: '{a} + {b}',
          how: 'Line up the points. Add hundredths, then tenths, then ones, regrouping as you go.',
        },
        a: {
          expr: '{c} − {b}',
          how: 'Line up the points. Take away place by place from the right.',
        },
        b: {
          expr: '{c} − {a}',
          how: 'Line up the points. Take away place by place from the right.',
        },
      },
    },
    example: { a: 12.5, b: 3.75, c: 16.25 },
    startWith: ['a', 'b'],
    representation: { kind: 'tape', parts: ['a', 'b'], total: 'c' },
  },
  {
    id: 'm.5.decimal-operations~multiply',
    title: 'Multiply a decimal by a whole number',
    use: 'Use this for 2.5 × 4 and other decimals times a whole number.',
    assumptions: [
      'Multiply as if both were whole numbers. Then put the point back.',
      'The product has as many places after the point as the decimal had.',
      'Decimals to 9.99, whole numbers to 12.',
    ],
    variables: [
      { id: 'a', symbol: 'a', name: 'Decimal', min: 0.1, max: 9.99, step: 0.01 },
      whole('b', 'b', 'Whole number', 1, 12),
      { id: 'p', symbol: 'p', name: 'Product', min: 0.1, max: 119.88, step: 0.01 },
    ],
    relations: [
      {
        id: 'p = a × b',
        display: '{a} × {b} = {p}',
        vars: ['p', 'a', 'b'],
        residual: (v: Values) => v.p! - v.a! * v.b!,
        solve: {
          p: (v: Values) => v.a! * v.b!,
          a: (v: Values) => div(v.p!, v.b!),
          b: (v: Values) => div(v.p!, v.a!),
        },
      },
    ],
    steps: {
      'p = a × b': {
        p: {
          expr: '{a} × {b}',
          how: 'Multiply the digits as whole numbers, then count the decimal places back in.',
          work: (v: Values) => {
            const k = places(v.a!);
            if (k > 2) return [];
            const w = Math.round(v.a! * 10 ** k);
            return [
              `${w} × ${v.b} = ${fmt(w * v.b!)}`,
              `${k} ${k === 1 ? 'place' : 'places'} after the point: ${fmt(v.p!)}`,
            ];
          },
        },
        a: {
          expr: '{p} ÷ {b}',
          how: 'Share the product into that many equal parts, keeping the point in line.',
        },
        b: {
          expr: '{p} ÷ {a}',
          how: 'How many copies of the decimal make the product.',
        },
      },
    },
    example: { a: 2.5, b: 4, p: 10 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'table',
      sweep: 'b',
      output: 'p',
      params: ['a'],
      rows: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
  },
  {
    id: 'm.5.decimal-operations~divide',
    title: 'Divide a decimal by a whole number',
    use: 'Use this for 7.2 ÷ 4 and other decimals shared into equal parts.',
    assumptions: [
      'Think of the decimal as tenths or hundredths: 7.2 is 72 tenths.',
      'Share the tenths, then write the answer back as a decimal.',
      'Decimals to 99.9, whole numbers from 2 to 9.',
    ],
    variables: [
      { id: 'n', symbol: 'n', name: 'Decimal', min: 0.1, max: 99.9, step: 0.1 },
      whole('d', 'd', 'Shared among', 2, 9),
      { id: 'q', symbol: 'q', name: 'Each share', min: 0.01, max: 49.95, step: 0.01 },
    ],
    relations: [
      {
        id: 'n = q × d',
        display: '{n} ÷ {d} = {q}',
        check: (v: Values) => `${fmt(v.q!)} × ${v.d} = ${fmt(v.n!)}`,
        vars: ['n', 'q', 'd'],
        residual: (v: Values) => v.n! - v.q! * v.d!,
        solve: {
          n: (v: Values) => v.q! * v.d!,
          q: (v: Values) => div(v.n!, v.d!),
          d: (v: Values) => div(v.n!, v.q!),
        },
      },
    ],
    steps: {
      'n = q × d': {
        q: {
          expr: '{n} ÷ {d}',
          how: 'Write the decimal as tenths (or hundredths), share them, then write the decimal.',
          work: (v: Values) => {
            if (places(v.n!) > 1) return [];
            const tenths = Math.round(v.n! * 10);
            if (tenths % v.d! === 0) {
              return [
                `${fmt(v.n!)} = ${tenths} tenths`,
                `${tenths} ÷ ${v.d} = ${tenths / v.d!} tenths = ${fmt(v.q!)}`,
              ];
            }
            const hundredths = tenths * 10;
            return [
              `${fmt(v.n!)} = ${fmt(hundredths)} hundredths`,
              `${hundredths} ÷ ${v.d} = ${fmt(hundredths / v.d!)} hundredths = ${fmt(v.q!)}`,
            ];
          },
        },
        n: { expr: '{q} × {d}', how: 'Each share times the number of shares.' },
        d: { expr: '{n} ÷ {q}', how: 'How many shares of that size make the decimal.' },
      },
    },
    example: { n: 7.2, d: 4, q: 1.8 },
    startWith: ['n', 'd'],
    representation: {
      kind: 'table',
      sweep: 'd',
      output: 'q',
      params: ['n'],
      rows: [2, 3, 4, 5, 6, 7, 8, 9],
    },
  },
  {
    id: 'm.5.decimal-operations~subtract',
    title: 'Subtract decimals',
    use: 'Use this for 12.5 − 3.75 and other differences of decimals.',
    assumptions: [
      'Line up the decimal points. Write a 0 in any empty place: 12.5 is 12.50.',
      'Subtract each place from the right, regrouping like whole numbers.',
      'The point in the answer goes under the other points. Numbers to 99.99.',
    ],
    variables: [
      { id: 'c', symbol: 'c', name: 'Start', min: 0, max: 99.99, step: 0.01 },
      { id: 'b', symbol: 'b', name: 'Subtracted', min: 0, max: 99.99, step: 0.01 },
      { id: 'a', symbol: 'a', name: 'Difference', min: 0, max: 99.99, step: 0.01 },
    ],
    relations: [
      {
        id: 'a = c − b',
        display: '{c} − {b} = {a}',
        vars: ['a', 'c', 'b'],
        residual: (v: Values) => v.a! - v.c! + v.b!,
        solve: {
          a: (v: Values) => v.c! - v.b!,
          c: (v: Values) => v.a! + v.b!,
          b: (v: Values) => v.c! - v.a!,
        },
      },
    ],
    steps: {
      'a = c − b': {
        a: {
          expr: '{c} − {b}',
          how: 'Line up the points, fill empty places with 0, then subtract place by place.',
        },
        c: { expr: '{a} + {b}', how: 'Add back what was subtracted, points lined up.' },
        b: { expr: '{c} − {a}', how: 'Start minus the difference, points lined up.' },
      },
    },
    example: { c: 12.5, b: 3.75, a: 8.75 },
    startWith: ['c', 'b'],
    representation: { kind: 'tape', parts: ['a', 'b'], total: 'c' },
  },
  {
    id: 'm.5.decimal-operations~times-decimal',
    title: 'Multiply two decimals',
    use: 'Use this for 0.4 × 0.3 and other tenths times tenths.',
    assumptions: [
      'Multiply the digits as whole numbers: 4 × 3 = 12.',
      'Tenths times tenths are hundredths, so the product has two decimal places: 0.12.',
      'Both numbers are tenths, from 0.1 to 9.9.',
    ],
    variables: [
      { id: 'a', symbol: 'a', name: 'First decimal', min: 0.1, max: 9.9, step: 0.1 },
      { id: 'b', symbol: 'b', name: 'Second decimal', min: 0.1, max: 9.9, step: 0.1 },
      { id: 'p', symbol: 'p', name: 'Product', min: 0.01, max: 98.01, step: 0.01 },
    ],
    relations: [
      {
        id: 'p = a × b',
        display: '{a} × {b} = {p}',
        vars: ['p', 'a', 'b'],
        residual: (v: Values) => v.p! - v.a! * v.b!,
        solve: {
          p: (v: Values) => v.a! * v.b!,
          a: (v: Values) => div(v.p!, v.b!),
          b: (v: Values) => div(v.p!, v.a!),
        },
      },
    ],
    steps: {
      'p = a × b': {
        p: {
          expr: '{a} × {b}',
          how: 'Multiply the tenths as whole numbers. Tenths times tenths are hundredths: two places.',
          work: (v: Values) => {
            if (places(v.a!) > 1 || places(v.b!) > 1) return [];
            const [x, y] = [Math.round(v.a! * 10), Math.round(v.b! * 10)];
            return [
              `${x} tenths × ${y} tenths = ${fmt(x * y)} hundredths`,
              `${fmt(x * y)} hundredths = ${fmt(v.p!)}`,
            ];
          },
        },
        a: { expr: '{p} ÷ {b}', how: 'Divide the product by the other decimal.' },
        b: { expr: '{p} ÷ {a}', how: 'Divide the product by the other decimal.' },
      },
    },
    example: { a: 0.4, b: 0.3, p: 0.12 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'table',
      sweep: 'b',
      output: 'p',
      params: ['a'],
      rows: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    },
  },
  // ── Adding fractions with unlike denominators (5.NF.1) ──
  (() => {
    const scaled = (id: string, [top, out]: [string, string], bottom: string, which: string) => ({
      relation: {
        id,
        display: `{${top}} × ({m} ÷ {${bottom}}) = {${out}}`,
        vars: [out, top, 'm', bottom],
        residual: (v: Values) => v[out]! - (v[top]! * v.m!) / v[bottom]!,
        solve: {
          [out]: (v: Values) => (v[top]! * v.m!) / v[bottom]!,
          [top]: (v: Values) => div(v[out]! * v[bottom]!, v.m!),
          m: () => undefined,
          [bottom]: () => undefined,
        },
      },
      steps: {
        [out]: {
          expr: `{${top}} × ({m} ÷ {${bottom}})`,
          how: `Multiply the ${which} numerator by the same number its denominator was multiplied by.`,
        },
        [top]: {
          expr: `{${out}} ÷ ({m} ÷ {${bottom}})`,
          how: `Divide the new numerator by that number to get the ${which} numerator back.`,
        },
      },
    });
    const common = {
      id: 'm = lcm of b and d',
      display: '{b} and {d} both go into {m}',
      vars: ['m', 'b', 'd'],
      residual: (v: Values) => v.m! - lcm(v.b!, v.d!),
      // Many pairs share a common denominator: the denominators can't be found from it.
      solve: { m: (v: Values) => lcm(v.b!, v.d!), b: () => undefined, d: () => undefined },
    };
    const first = scaled('p = a × m ÷ b', ['a', 'p'], 'b', 'first');
    const second = scaled('q = c × m ÷ d', ['c', 'q'], 'd', 'second');
    const fractions = (op: '+' | '−') => [
      whole('a', 'a', 'First numerator', 1, 12),
      { ...whole('b', 'b', 'First denominator', 2, 12), allowed: BOTTOMS },
      whole('c', 'c', 'Second numerator', 1, 12),
      { ...whole('d', 'd', 'Second denominator', 2, 12), allowed: BOTTOMS },
      { ...whole('m', 'm', 'Common denominator', 2, 120), derived: true },
      { ...whole('p', 'p', 'First new numerator', 1, 120), derived: true },
      { ...whole('q', 'q', 'Second new numerator', 1, 120), derived: true },
      op === '+'
        ? whole('s', 's', 'Numerator of the sum', 2, 240)
        : whole('s', 's', 'Numerator of the difference', 0, 119),
    ];
    const bars = (op: '+' | '−'): Representation => ({
      kind: 'fractionBars',
      rows: [
        { num: 'a', den: 'b' },
        { num: 'p', den: 'm' },
        { num: 'c', den: 'd' },
        { num: 'q', den: 'm' },
      ],
      controls: ['a', 'b', 'c', 'd'],
      caption: `{p}/{m} ${op} {q}/{m} = {s}/{m}`,
    });
    const commonSteps = {
      'm = lcm of b and d': {
        m: {
          expr: 'smallest common multiple of {b} and {d}',
          how: 'Count by the bigger denominator until you reach a multiple of the smaller one.',
          work: (v: Values) => {
            const [big, small] = v.b! >= v.d! ? [v.b!, v.d!] : [v.d!, v.b!];
            const steps = Array.from({ length: v.m! / big }, (_, i) => big * (i + 1));
            return [
              `Multiples of ${big}: ${steps.join(', ')} → ${v.m} is also a multiple of ${small}`,
            ];
          },
        },
      },
      'p = a × m ÷ b': first.steps,
      'q = c × m ÷ d': second.steps,
    };
    return [
      {
        id: 'm.5.add-fractions-unlike',
        assumptions: [
          'Fractions can only be added when the parts are the same size: give them a common denominator.',
          'Use the smallest number both denominators go into. Rewrite each fraction over it, then add the numerators.',
          'Each fraction is at most 1. Denominators 2, 3, 4, 5, 6, 8, 10 and 12.',
        ],
        variables: fractions('+'),
        relations: [
          atMostOne('a', 'b'),
          atMostOne('c', 'd'),
          common,
          first.relation,
          second.relation,
          {
            id: 's = p + q',
            display: '{p}/{m} + {q}/{m} = {s}/{m}',
            check: (v: Values) => `${v.p} + ${v.q} = ${v.s}`,
            vars: ['s', 'p', 'q'],
            shows: ['m'],
            residual: (v: Values) => v.s! - v.p! - v.q!,
            solve: {
              s: (v: Values) => v.p! + v.q!,
              p: (v: Values) => v.s! - v.q!,
              q: (v: Values) => v.s! - v.p!,
            },
          },
        ],
        steps: {
          'a ≤ b': {},
          'c ≤ d': {},
          ...commonSteps,
          's = p + q': {
            s: {
              expr: '{p} + {q}',
              how: 'Same denominator now: add the numerators and keep the denominator.',
              note: (v: Values) => wholesNote(v.s!, v.m!) || simplerNote(v.s!, v.m!),
            },
            p: { expr: '{s} − {q}', how: 'Subtract the second new numerator from the sum’s.' },
            q: { expr: '{s} − {p}', how: 'Subtract the first new numerator from the sum’s.' },
          },
        },
        example: { a: 1, b: 2, c: 1, d: 3, m: 6, p: 3, q: 2, s: 5 },
        startWith: ['a', 'b', 'c', 'd'],
        representation: bars('+'),
      },
      {
        id: 'm.5.add-fractions-unlike~subtract',
        title: 'Subtract fractions with unlike denominators',
        use: 'Use this for 3/4 − 1/3 and other differences with different denominators.',
        assumptions: [
          'Give both fractions a common denominator: the smallest number both denominators go into.',
          'Then subtract the smaller new numerator from the bigger one and keep the denominator.',
          'The first fraction is the bigger one. Denominators 2, 3, 4, 5, 6, 8, 10 and 12.',
        ],
        variables: fractions('−'),
        relations: [
          atMostOne('a', 'b'),
          atMostOne('c', 'd'),
          common,
          first.relation,
          second.relation,
          {
            id: 's = p − q',
            display: '{p}/{m} − {q}/{m} = {s}/{m}',
            check: (v: Values) => `${v.p} − ${v.q} = ${v.s}`,
            vars: ['s', 'p', 'q'],
            shows: ['m'],
            residual: (v: Values) => v.s! - v.p! + v.q!,
            solve: {
              s: (v: Values) => v.p! - v.q!,
              p: (v: Values) => v.s! + v.q!,
              q: (v: Values) => v.p! - v.s!,
            },
          },
        ],
        steps: {
          'a ≤ b': {},
          'c ≤ d': {},
          ...commonSteps,
          's = p − q': {
            s: {
              expr: '{p} − {q}',
              how: 'Same denominator now: subtract the numerators and keep the denominator.',
              note: (v: Values) => simplerNote(v.s!, v.m!),
            },
            p: { expr: '{s} + {q}', how: 'Add the second new numerator back to the difference.' },
            q: { expr: '{p} − {s}', how: 'Subtract the difference from the first new numerator.' },
          },
        },
        example: { a: 3, b: 4, c: 1, d: 3, m: 12, p: 9, q: 4, s: 5 },
        startWith: ['a', 'b', 'c', 'd'],
        representation: bars('−'),
      },
    ] satisfies ModuleDef[];
  })(),
  // ── Multiplying fractions (5.NF.4) ──
  {
    id: 'm.5.multiply-fractions',
    assumptions: [
      'A fraction of a fraction: multiply the numerators and multiply the denominators.',
      'The square shows why: columns for one fraction, rows for the other, and the overlap.',
      'Each fraction is at most 1. Denominators from 2 to 12.',
    ],
    variables: [
      whole('a', 'a', 'First numerator', 1, 12),
      whole('b', 'b', 'First denominator', 2, 12),
      whole('c', 'c', 'Second numerator', 1, 12),
      whole('d', 'd', 'Second denominator', 2, 12),
      { ...whole('p', 'p', 'Product numerator', 1, 144), derived: true },
      { ...whole('q', 'q', 'Product denominator', 4, 144), derived: true },
    ],
    relations: [
      atMostOne('a', 'b'),
      atMostOne('c', 'd'),
      {
        id: 'p = a × c',
        display: '{a} × {c} = {p}',
        vars: ['p', 'a', 'c'],
        residual: (v: Values) => v.p! - v.a! * v.c!,
        solve: {
          p: (v: Values) => v.a! * v.c!,
          a: (v: Values) => div(v.p!, v.c!),
          c: (v: Values) => div(v.p!, v.a!),
        },
      },
      {
        id: 'q = b × d',
        display: '{b} × {d} = {q}',
        check: (v: Values) =>
          [v.a, v.b, v.c, v.d, v.p, v.q].every((x) => x !== undefined)
            ? `${v.a}/${v.b} × ${v.c}/${v.d} = ${v.p}/${v.q}`
            : `${v.b} × ${v.d} = ${v.q}`,
        vars: ['q', 'b', 'd'],
        residual: (v: Values) => v.q! - v.b! * v.d!,
        solve: {
          q: (v: Values) => v.b! * v.d!,
          b: (v: Values) => div(v.q!, v.d!),
          d: (v: Values) => div(v.q!, v.b!),
        },
      },
    ],
    steps: {
      'a ≤ b': {},
      'c ≤ d': {},
      'p = a × c': {
        p: {
          expr: '{a} × {c}',
          how: 'Multiply the numerators: the shaded columns times the shaded rows.',
        },
        a: { expr: '{p} ÷ {c}', how: 'Divide the product numerator by the second numerator.' },
        c: { expr: '{p} ÷ {a}', how: 'Divide the product numerator by the first numerator.' },
      },
      'q = b × d': {
        q: {
          expr: '{b} × {d}',
          how: 'Multiply the denominators: all the columns times all the rows.',
          note: (v: Values) =>
            v.p === undefined || v.q === undefined ? '' : simplerNote(v.p, v.q),
        },
        b: { expr: '{q} ÷ {d}', how: 'Divide the product denominator by the second denominator.' },
        d: { expr: '{q} ÷ {b}', how: 'Divide the product denominator by the first denominator.' },
      },
    },
    example: { a: 2, b: 3, c: 3, d: 4, p: 6, q: 12 },
    startWith: ['a', 'b', 'c', 'd'],
    representation: {
      kind: 'fractionArea',
      first: { num: 'a', den: 'b' },
      second: { num: 'c', den: 'd' },
      product: { num: 'p', den: 'q' },
    },
  },
  {
    id: 'm.5.multiply-fractions~of-a-whole',
    title: 'A fraction of a whole number',
    use: 'Use this for 3/4 of 8 and other fractions times a whole number.',
    assumptions: [
      'A fraction of a number: multiply the numerator by the number, keep the denominator.',
      'The product can be more than 1: write it as wholes and parts.',
      'The fraction is at most 1. Whole numbers to 12, denominators to 12.',
    ],
    variables: [
      whole('a', 'a', 'Numerator', 1, 12),
      whole('b', 'b', 'Denominator', 2, 12),
      whole('n', 'n', 'Whole number', 1, 12),
      whole('p', 'p', 'Numerator of the product', 1, 144),
    ],
    relations: [
      atMostOne('a', 'b'),
      {
        id: 'p = a × n',
        display: '{a}/{b} × {n} = {p}/{b}',
        check: (v: Values) => `${v.a} × ${v.n} = ${v.p}`,
        vars: ['p', 'a', 'n'],
        shows: ['b'],
        residual: (v: Values) => v.p! - v.a! * v.n!,
        solve: {
          p: (v: Values) => v.a! * v.n!,
          a: (v: Values) => div(v.p!, v.n!),
          n: (v: Values) => div(v.p!, v.a!),
        },
      },
    ],
    steps: {
      'a ≤ b': {},
      'p = a × n': {
        p: {
          expr: '{a} × {n}',
          how: 'Multiply the numerator by the whole number. The denominator stays.',
          note: (v: Values) =>
            v.b === undefined ? '' : wholesNote(v.p!, v.b) || simplerNote(v.p!, v.b),
        },
        a: { expr: '{p} ÷ {n}', how: 'Divide the product’s numerator by the whole number.' },
        n: {
          expr: '{p} ÷ {a}',
          how: 'Divide the product’s numerator by the fraction’s numerator.',
        },
      },
    },
    example: { a: 3, b: 4, n: 8, p: 24 },
    startWith: ['a', 'b', 'n'],
    representation: {
      kind: 'fractionLine',
      numerator: 'p',
      denominator: 'b',
      wholes: 2,
      copies: 'n',
    },
  },
  // ── Dividing with unit fractions (5.NF.7) ──
  {
    id: 'm.5.divide-unit-fractions',
    assumptions: [
      'Dividing by a unit fraction asks how many of those pieces fit: how many fourths in 3?',
      'Each whole holds as many pieces as the denominator says. Multiply the whole number by the denominator.',
      'Whole numbers to 6, denominators from 2 to 8.',
    ],
    variables: [
      whole('n', 'n', 'Whole number', 1, 6),
      whole('b', 'b', 'Denominator of the unit fraction', 2, 8),
      whole('q', 'q', 'Pieces', 2, 48),
    ],
    relations: [
      {
        id: 'q = n × b',
        display: '{n} ÷ 1/{b} = {q}',
        check: (v: Values) => `${v.n} × ${v.b} = ${v.q}`,
        vars: ['q', 'n', 'b'],
        residual: (v: Values) => v.q! - v.n! * v.b!,
        solve: {
          q: (v: Values) => v.n! * v.b!,
          n: (v: Values) => div(v.q!, v.b!),
          b: (v: Values) => div(v.q!, v.n!),
        },
      },
    ],
    steps: {
      'q = n × b': {
        q: {
          expr: '{n} × {b}',
          how: 'Each whole is cut into that many pieces. Count the pieces in all the wholes.',
        },
        n: {
          expr: '{q} ÷ {b}',
          how: 'Every full set of pieces makes one whole. Divide the pieces by the denominator.',
        },
        b: {
          expr: '{q} ÷ {n}',
          how: 'Share the pieces among the wholes: that many pieces in each whole is the denominator.',
        },
      },
    },
    example: { n: 3, b: 4, q: 12 },
    startWith: ['n', 'b'],
    representation: { kind: 'fractionLine', numerator: 'q', denominator: 'b', wholes: 4 },
  },
  {
    id: 'm.5.divide-unit-fractions~unit-by-whole',
    title: 'Divide a unit fraction by a whole number',
    use: 'Use this for 1/3 ÷ 4: one piece shared among 4.',
    assumptions: [
      'Sharing one piece among more people makes smaller pieces.',
      'Cut the piece into that many parts: the new bottom is the old denominator times the number sharing.',
      'Denominators from 2 to 6, shared among 2 to 6.',
    ],
    variables: [
      whole('b', 'b', 'Denominator', 2, 6),
      whole('n', 'n', 'Shared among', 2, 6),
      whole('m', 'm', 'New denominator', 4, 36),
    ],
    relations: [
      {
        id: 'm = b × n',
        display: '1/{b} ÷ {n} = 1/{m}',
        check: (v: Values) => `${v.b} × ${v.n} = ${v.m}`,
        vars: ['m', 'b', 'n'],
        residual: (v: Values) => v.m! - v.b! * v.n!,
        solve: {
          m: (v: Values) => v.b! * v.n!,
          b: (v: Values) => div(v.m!, v.n!),
          n: (v: Values) => div(v.m!, v.b!),
        },
      },
    ],
    steps: {
      'm = b × n': {
        m: {
          expr: '{b} × {n}',
          how: 'Each of the denominator’s pieces is cut into that many parts: multiply.',
        },
        b: {
          expr: '{m} ÷ {n}',
          how: 'Undo the cutting: divide the new bottom by the number sharing.',
        },
        n: {
          expr: '{m} ÷ {b}',
          how: 'How many parts each old piece was cut into.',
        },
      },
    },
    example: { b: 3, n: 4, m: 12 },
    startWith: ['b', 'n'],
    representation: {
      kind: 'fractionBars',
      rows: [{ num: 'n', den: 'm' }],
      controls: ['b', 'n'],
      caption: '1/{b} is {n} pieces of 1/{m}. One person gets 1/{m}.',
    },
  },
  // ── Volume of a rectangular prism (5.MD.5) ──
  {
    id: 'm.5.volume-rectangular',
    assumptions: [
      'Volume counts the unit cubes that fill the box.',
      'The base area is length × width: the cubes in one layer. The box has a layer for every unit of height.',
      'Volume = length × width × height, in cubic units. Sides to 10.',
    ],
    variables: [
      { ...whole('l', 'l', 'Length', 1, 10), unit: 'cm' },
      { ...whole('w', 'w', 'Width', 1, 10), unit: 'cm' },
      { ...whole('h', 'h', 'Height', 1, 10), unit: 'cm' },
      { ...whole('B', 'B', 'Base area', 1, 100), unit: 'cm²', derived: true },
      { ...whole('V', 'V', 'Volume', 1, 1000), unit: 'cm³' },
    ],
    relations: [
      {
        id: 'B = l × w',
        display: '{l} × {w} = {B}',
        vars: ['B', 'l', 'w'],
        residual: (v: Values) => v.B! - v.l! * v.w!,
        solve: {
          B: (v: Values) => v.l! * v.w!,
          l: (v: Values) => div(v.B!, v.w!),
          w: (v: Values) => div(v.B!, v.l!),
        },
      },
      {
        id: 'V = B × h',
        display: '{B} × {h} = {V}',
        vars: ['V', 'B', 'h'],
        residual: (v: Values) => v.V! - v.B! * v.h!,
        solve: {
          V: (v: Values) => v.B! * v.h!,
          B: (v: Values) => div(v.V!, v.h!),
          h: (v: Values) => div(v.V!, v.B!),
        },
      },
    ],
    steps: {
      'B = l × w': {
        B: {
          expr: '{l} × {w}',
          how: 'The base area: rows of cubes along the length, one row for each unit of width.',
        },
        l: { expr: '{B} ÷ {w}', how: 'Divide the base area by the width.' },
        w: { expr: '{B} ÷ {l}', how: 'Divide the base area by the length.' },
      },
      'V = B × h': {
        V: {
          expr: '{B} × {h}',
          how: 'A layer for every unit of height: multiply the base area by the height.',
        },
        B: { expr: '{V} ÷ {h}', how: 'Divide the volume by the height to get the base area.' },
        h: { expr: '{V} ÷ {B}', how: 'Divide the volume by the base area: how many layers.' },
      },
    },
    example: { l: 4, w: 3, h: 2, B: 12, V: 24 },
    startWith: ['l', 'w', 'h'],
    representation: {
      kind: 'unitCubes',
      length: 'l',
      width: 'w',
      height: 'h',
      volume: 'V',
      max: 10,
    },
  },
  // ── Graphing points in the first quadrant (5.G.1, 5.OA.3) ──
  {
    id: 'm.5.coordinate-plane-q1',
    assumptions: [
      'A point is named by two numbers: how far across, then how far up, starting at 0.',
      'A rule makes points: the up number is the multiplier times the across number.',
      'The next point is one step across. Both points follow the rule. Across to 10, multipliers to 5.',
    ],
    variables: [
      whole('x', 'x', 'Across', 0, 10),
      whole('k', 'k', 'Multiplier', 1, 5),
      whole('y', 'y', 'Up', 0, 50),
      { ...whole('x2', 'x₂', 'Next across', 1, 11), derived: true },
      { ...whole('y2', 'y₂', 'Next up', 1, 55), derived: true },
    ],
    relations: [
      {
        id: 'y = k × x',
        display: '{y} = {k} × {x}',
        vars: ['y', 'k', 'x'],
        residual: (v: Values) => v.y! - v.k! * v.x!,
        solve: {
          y: (v: Values) => v.k! * v.x!,
          k: (v: Values) => div(v.y!, v.x!),
          x: (v: Values) => div(v.y!, v.k!),
        },
      },
      {
        id: 'x₂ = x + 1',
        display: '{x2} = {x} + 1',
        vars: ['x2', 'x'],
        residual: (v: Values) => v.x2! - v.x! - 1,
        solve: { x2: (v: Values) => v.x! + 1, x: (v: Values) => v.x2! - 1 },
      },
      {
        id: 'y₂ = k × x₂',
        display: '{y2} = {k} × {x2}',
        vars: ['y2', 'k', 'x2'],
        residual: (v: Values) => v.y2! - v.k! * v.x2!,
        solve: {
          y2: (v: Values) => v.k! * v.x2!,
          k: (v: Values) => div(v.y2!, v.x2!),
          x2: (v: Values) => div(v.y2!, v.k!),
        },
      },
    ],
    steps: {
      'y = k × x': {
        y: {
          expr: '{k} × {x}',
          how: 'The rule: multiply the across number by the multiplier to get the up number.',
        },
        k: { expr: '{y} ÷ {x}', how: 'Divide the up number by the across number.' },
        x: { expr: '{y} ÷ {k}', how: 'Divide the up number by the multiplier.' },
      },
      'x₂ = x + 1': {
        x2: { expr: '{x} + 1', how: 'The next point is one step across.' },
        x: { expr: '{x2} − 1', how: 'The first point is one step back.' },
      },
      'y₂ = k × x₂': {
        y2: {
          expr: '{k} × {x2}',
          how: 'The same rule for the next point: multiplier times its across number.',
        },
        k: { expr: '{y2} ÷ {x2}', how: 'Divide the next up number by the next across number.' },
        x2: { expr: '{y2} ÷ {k}', how: 'Divide the next up number by the multiplier.' },
      },
    },
    example: { x: 2, k: 3, y: 6, x2: 3, y2: 9 },
    startWith: ['x', 'k'],
    representation: {
      kind: 'coordinatePlane',
      x: 'x',
      y: 'y',
      second: { x: 'x2', y: 'y2' },
      extent: 10,
      quadrants: 1,
    },
  },
  {
    id: 'm.5.coordinate-plane-q1~move',
    title: 'Move from point to point',
    use: 'Use this for “Start at (2, 3). Go right 4 and up 2. Where are you?”',
    assumptions: [
      'Going right adds to the across number. Going up adds to the up number.',
      'The two moves are separate: right changes only across, up changes only up.',
      'Numbers to 10.',
    ],
    standalone: {
      vars: ['y1', 'u', 'y2'],
      why: 'The move right and the move up are separate steps to the same end point.',
    },
    variables: [
      whole('x1', 'x₁', 'Start across', 0, 10),
      whole('y1', 'y₁', 'Start up', 0, 10),
      whole('r', 'r', 'Steps right', 0, 10),
      whole('u', 'u', 'Steps up', 0, 10),
      whole('x2', 'x₂', 'End across', 0, 20),
      whole('y2', 'y₂', 'End up', 0, 20),
    ],
    relations: [
      {
        id: 'x₂ = x₁ + r',
        display: '{x1} + {r} = {x2}',
        vars: ['x2', 'x1', 'r'],
        residual: (v: Values) => v.x2! - v.x1! - v.r!,
        solve: {
          x2: (v: Values) => v.x1! + v.r!,
          x1: (v: Values) => v.x2! - v.r!,
          r: (v: Values) => v.x2! - v.x1!,
        },
      },
      {
        id: 'y₂ = y₁ + u',
        display: '{y1} + {u} = {y2}',
        vars: ['y2', 'y1', 'u'],
        residual: (v: Values) => v.y2! - v.y1! - v.u!,
        solve: {
          y2: (v: Values) => v.y1! + v.u!,
          y1: (v: Values) => v.y2! - v.u!,
          u: (v: Values) => v.y2! - v.y1!,
        },
      },
    ],
    steps: {
      'x₂ = x₁ + r': {
        x2: { expr: '{x1} + {r}', how: 'Going right adds the steps to the across number.' },
        x1: { expr: '{x2} − {r}', how: 'Go back left to find where you started.' },
        r: { expr: '{x2} − {x1}', how: 'End across minus start across: the steps right.' },
      },
      'y₂ = y₁ + u': {
        y2: { expr: '{y1} + {u}', how: 'Going up adds the steps to the up number.' },
        y1: { expr: '{y2} − {u}', how: 'Go back down to find where you started.' },
        u: { expr: '{y2} − {y1}', how: 'End up minus start up: the steps up.' },
      },
    },
    example: { x1: 2, y1: 3, r: 4, u: 2, x2: 6, y2: 5 },
    startWith: ['x1', 'y1', 'r', 'u'],
    representation: {
      kind: 'coordinatePlane',
      x: 'x1',
      y: 'y1',
      second: { x: 'x2', y: 'y2' },
      extent: 10,
      quadrants: 1,
    },
  },
];
export const MATH_5_MODULES: ModuleDef[] = modules.flat();
