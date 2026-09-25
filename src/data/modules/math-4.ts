/**
 * Grade 4 math (CCSS 4.OA, 4.NBT, 4.NF, 4.MD, 4.G). Letters appear only as labels next to a
 * name the student can see; the step explanations say names, not letters. Numbers reach
 * 1,000,000, fractions get unlike denominators and decimals appear (tenths, hundredths).
 */
import type { Values } from '@/engine/types';

import { formatNumber } from '@/engine/format';

import { div, whole } from './math-k2';
import type { ModuleDef } from './types';
import { addStrategy, divideWork, timesWork } from './work';

/** The factors of n in order: 24 → [1, 2, 3, 4, 6, 8, 12, 24]. */
const factorsOf = (n: number): number[] =>
  n < 1 ? [] : Array.from({ length: n }, (_, i) => i + 1).filter((k) => n % k === 0);

/** Factor pairs up to the square root: 24 → "1 × 24, 2 × 12, 3 × 8, 4 × 6". */
const factorPairs = (n: number): string =>
  factorsOf(n)
    .filter((k) => k * k <= n)
    .map((k) => `${k} × ${n / k}`)
    .join(', ');

export const MATH_4_MODULES: ModuleDef[] = [
  // ── Factors, multiples, primes and composites (4.OA.4) ──
  {
    id: 'm.4.factors-multiples',
    assumptions: [
      'A factor pair is two whole numbers that multiply to make the number.',
      'Find every pair by trying 1, 2, 3, … until the factors would swap places.',
      'A prime number has exactly 2 factors: 1 and itself. A composite number has more.',
      'The picture shows one factor pair as an array: rows × columns.',
    ],
    variables: [
      whole('n', 'n', 'Number', 1, 100),
      whole('a', 'a', 'One factor', 1, 12),
      whole('b', 'b', 'Its partner', 1, 12),
      { ...whole('f', 'f', 'Number of factors', 1, 12), derived: true },
    ],
    relations: [
      {
        id: 'n = a × b',
        display: '{a} × {b} = {n}',
        vars: ['n', 'a', 'b'],
        residual: (v: Values) => v.n! - v.a! * v.b!,
        solve: {
          n: (v: Values) => v.a! * v.b!,
          a: (v: Values) => div(v.n!, v.b!),
          b: (v: Values) => div(v.n!, v.a!),
        },
      },
      {
        id: 'f = factors of n',
        display: '{n} has {f} factors',
        vars: ['f', 'n'],
        residual: (v: Values) => v.f! - factorsOf(v.n!).length,
        // Many numbers share a factor count, so the number can't be found from it.
        solve: { f: (v: Values) => factorsOf(v.n!).length, n: () => undefined },
      },
    ],
    steps: {
      'n = a × b': {
        n: {
          expr: '{a} × {b}',
          how: 'Multiply the factor pair to get the number.',
          work: (v) => timesWork(v.a!, v.b!),
        },
        a: {
          expr: '{n} ÷ {b}',
          how: 'Divide the number by the partner factor.',
          work: (v) => divideWork(v.n!, v.b!),
        },
        b: {
          expr: '{n} ÷ {a}',
          how: 'Divide the number by the one factor you know.',
          work: (v) => divideWork(v.n!, v.a!, 'second'),
        },
      },
      'f = factors of n': {
        f: {
          expr: 'factors of {n}',
          how: 'List every factor pair from 1 up. Count the factors once each.',
          work: (v) => [
            `Factor pairs of ${v.n}: ${factorPairs(v.n!)}`,
            `Factors: ${factorsOf(v.n!).join(', ')} → ${v.f}`,
          ],
          note: (v) =>
            v.n === 1
              ? '(1 is neither prime nor composite)'
              : v.f === 2
                ? `(${v.n} is prime: only 1 and itself)`
                : `(${v.n} is composite: more than 2 factors)`,
        },
      },
    },
    example: { n: 24, a: 4, b: 6, f: 8 },
    startWith: ['a', 'b'],
    representation: { kind: 'array', rows: 'a', columns: 'b', total: 'n', max: 12 },
  },

  // ── Place value to 1,000,000: a digit's value and the place to its right (4.NBT.1) ──
  (() => {
    const fmt = (x: number) => formatNumber(x);
    const PLACES = [10, 100, 1000, 10000, 100000];
    const PLACE_NAMES: Record<number, string> = {
      10: 'tens',
      100: 'hundreds',
      1000: 'thousands',
      10000: 'ten thousands',
      100000: 'hundred thousands',
    };
    return {
      id: 'm.4.place-value-million',
      assumptions: [
        'A digit’s value is the digit times its place: 7 in the thousands place is 7,000.',
        'Each place is 10 times the place to its right. Moving a digit one place right divides its value by 10.',
        'Places up to hundred thousands: numbers to 999,999.',
        'Tap a row of the table to move the digit to that place.',
      ],
      variables: [
        whole('d', 'd', 'Digit', 1, 9),
        { ...whole('p', 'p', 'Its place', 10, 100000), allowed: PLACES },
        whole('v', 'v', 'Value of the digit', 10, 900000),
        whole('r', 'r', 'Same digit one place right', 1, 90000),
      ],
      relations: [
        {
          id: 'v = d × p',
          display: '{d} × {p} = {v}',
          vars: ['v', 'd', 'p'],
          residual: (v: Values) => v.v! - v.d! * v.p!,
          solve: {
            v: (v: Values) => v.d! * v.p!,
            d: (v: Values) => div(v.v!, v.p!),
            p: (v: Values) => div(v.v!, v.d!),
          },
        },
        {
          id: 'r = v ÷ 10',
          display: '{v} ÷ 10 = {r}',
          vars: ['r', 'v'],
          residual: (v: Values) => v.r! - v.v! / 10,
          solve: { r: (v: Values) => v.v! / 10, v: (v: Values) => v.r! * 10 },
        },
      ],
      steps: {
        'v = d × p': {
          v: {
            expr: '{d} × {p}',
            how: (v) =>
              `The digit is in the ${PLACE_NAMES[v.p!] ?? 'ones'} place. Multiply it by that place.`,
            work: (v) => [`${v.d} × ${fmt(v.p!)} = ${fmt(v.d! * v.p!)}`],
          },
          d: {
            expr: '{v} ÷ {p}',
            how: 'Divide the value by its place to get the digit.',
            work: (v) => [`${fmt(v.v!)} ÷ ${fmt(v.p!)} = ${v.v! / v.p!}`],
          },
          p: {
            expr: '{v} ÷ {d}',
            how: 'Divide the value by the digit to get its place.',
            work: (v) => [`${fmt(v.v!)} ÷ ${v.d} = ${fmt(v.v! / v.d!)}`],
          },
        },
        'r = v ÷ 10': {
          r: {
            expr: '{v} ÷ 10',
            how: 'One place to the right is worth ten times less: divide the value by 10.',
            work: (v) => [`${fmt(v.v!)} ÷ 10 = ${fmt(v.v! / 10)}`],
          },
          v: {
            expr: '{r} × 10',
            how: 'One place to the left is worth ten times more: multiply by 10.',
            work: (v) => [`${fmt(v.r!)} × 10 = ${fmt(v.r! * 10)}`],
          },
        },
      },
      example: { d: 7, p: 1000, v: 7000, r: 700 },
      startWith: ['d', 'p'],
      representation: { kind: 'table', sweep: 'p', output: 'v', params: ['d'], rows: PLACES },
    } satisfies ModuleDef;
  })(),

  // ── Multi-digit multiplication: the area model, 2-digit × 1-digit (4.NBT.5) ──
  (() => {
    const fmt = (x: number) => formatNumber(x);
    return {
      id: 'm.4.multi-digit-multiply',
      assumptions: [
        'Break the first factor into tens and ones: 43 = 40 + 3.',
        'Multiply each part by the second factor, then add the part products.',
        'The area model draws each part product as a box: 40 × 6 and 3 × 6.',
        'First factor to 99, second factor to 9.',
      ],
      variables: [
        whole('a', 'a', 'First factor', 10, 99),
        whole('b', 'b', 'Second factor', 1, 9),
        {
          ...whole('t', 't', 'Tens of the first factor', 10, 90),
          step: 10,
          multipleOf: 10,
          derived: true,
        },
        { ...whole('o', 'o', 'Ones of the first factor', 0, 9), derived: true },
        { ...whole('p', 'p', 'Tens part × second', 10, 810), derived: true },
        { ...whole('q', 'q', 'Ones part × second', 0, 81), derived: true },
        whole('n', 'n', 'Product', 10, 891),
      ],
      relations: [
        {
          id: 'a = t + o',
          display: '{a} = {t} + {o}',
          vars: ['a', 't', 'o'],
          residual: (v: Values) => v.a! - v.t! - v.o!,
          solve: {
            t: (v: Values) => 10 * Math.floor(v.a! / 10),
            o: (v: Values) => v.a! % 10,
            a: (v: Values) => v.t! + v.o!,
          },
        },
        {
          id: 'p = t × b',
          display: '{t} × {b} = {p}',
          vars: ['p', 't', 'b'],
          residual: (v: Values) => v.p! - v.t! * v.b!,
          solve: {
            p: (v: Values) => v.t! * v.b!,
            t: (v: Values) => div(v.p!, v.b!),
            b: (v: Values) => div(v.p!, v.t!),
          },
        },
        {
          id: 'q = o × b',
          display: '{o} × {b} = {q}',
          vars: ['q', 'o', 'b'],
          residual: (v: Values) => v.q! - v.o! * v.b!,
          solve: {
            q: (v: Values) => v.o! * v.b!,
            o: (v: Values) => div(v.q!, v.b!),
            b: (v: Values) => div(v.q!, v.o!),
          },
        },
        {
          id: 'n = p + q',
          display: '{p} + {q} = {n}',
          vars: ['n', 'p', 'q'],
          residual: (v: Values) => v.n! - v.p! - v.q!,
          // The parts come from the factors, never from the product alone (many pairs add
          // to one product).
          solve: { n: (v: Values) => v.p! + v.q!, p: () => undefined, q: () => undefined },
        },
        {
          id: 'n = a × b',
          display: '{a} × {b} = {n}',
          vars: ['n', 'a', 'b'],
          residual: (v: Values) => v.n! - v.a! * v.b!,
          // The product is built from the part products (the lesson), never in one jump.
          solve: {
            n: () => undefined,
            a: (v: Values) => div(v.n!, v.b!),
            b: (v: Values) => div(v.n!, v.a!),
          },
        },
      ],
      steps: {
        'a = t + o': {
          t: {
            expr: '{a} without its ones',
            how: 'The tens of the first factor: the number without its ones.',
          },
          o: {
            expr: '{a} − {t}',
            how: 'The ones of the first factor: what is left after the tens.',
          },
          a: { expr: '{t} + {o}', how: 'Put the tens and the ones back together.' },
        },
        'p = t × b': {
          p: {
            expr: '{t} × {b}',
            how: 'Multiply the tens part by the second factor: a basic fact, then a zero.',
            work: (v) => [
              `${v.t! / 10} × ${v.b} = ${(v.t! / 10) * v.b!}, so ${v.t} × ${v.b} = ${fmt(v.t! * v.b!)}`,
            ],
          },
          t: { expr: '{p} ÷ {b}', how: 'Divide the tens part product by the second factor.' },
          b: { expr: '{p} ÷ {t}', how: 'Divide the tens part product by the tens part.' },
        },
        'q = o × b': {
          q: {
            expr: '{o} × {b}',
            how: 'Multiply the ones part by the second factor: a basic fact.',
            work: (v) => timesWork(v.o!, v.b!),
          },
          o: { expr: '{q} ÷ {b}', how: 'Divide the ones part product by the second factor.' },
          b: { expr: '{q} ÷ {o}', how: 'Divide the ones part product by the ones part.' },
        },
        'n = p + q': {
          n: {
            expr: '{p} + {q}',
            how: 'Add the two part products.',
            work: (v) => addStrategy(v.p!, v.q!),
          },
        },
        'n = a × b': {
          a: {
            expr: '{n} ÷ {b}',
            how: 'Divide the product by the second factor.',
            work: (v) => divideWork(v.n!, v.b!),
          },
          b: {
            expr: '{n} ÷ {a}',
            how: 'Divide the product by the first factor.',
            work: (v) => divideWork(v.n!, v.a!, 'second'),
          },
        },
      },
      example: { a: 43, b: 6, t: 40, o: 3, p: 240, q: 18, n: 258 },
      startWith: ['a', 'b'],
      representation: {
        kind: 'areaModel',
        top: ['t', 'o'],
        side: ['b'],
        parts: [['p', 'q']],
        total: 'n',
      },
    } satisfies ModuleDef;
  })(),

  // ── Long division: partial quotients with a remainder (4.NBT.6) ──
  (() => {
    const fmt = (x: number) => formatNumber(x);
    /** Partial quotients by place: 743 ÷ 6 → 100 groups (600), 20 groups (120), 3 groups (18). */
    const partial = (n: number, d: number): string[] => {
      const lines: string[] = [];
      const chunks: number[] = [];
      let left = n;
      for (const place of [1000, 100, 10, 1]) {
        const k = Math.floor(left / (d * place)) * place;
        if (k === 0) continue;
        chunks.push(k);
        lines.push(
          `${d} × ${fmt(k)} = ${fmt(d * k)}, so ${fmt(k)} groups fit: ${fmt(left)} − ${fmt(d * k)} = ${fmt(left - d * k)}`,
        );
        left -= d * k;
      }
      if (chunks.length > 1)
        lines.push(
          `Groups: ${chunks.map(fmt).join(' + ')} = ${fmt(chunks.reduce((a, b) => a + b, 0))}`,
        );
      lines.push(`${fmt(left)} left over: less than ${d}, so it is the remainder`);
      return lines;
    };
    return {
      id: 'm.4.long-division',
      assumptions: [
        'Share the dividend into equal groups of the divisor. The number of groups is the quotient.',
        'Take out big chunks first: hundreds of groups, then tens, then ones. Add the chunks.',
        'What is left is the remainder. It is always less than the divisor.',
        'Check: quotient × divisor + remainder = dividend.',
      ],
      variables: [
        whole('n', 'n', 'Dividend', 10, 9999),
        whole('d', 'd', 'Divisor', 2, 9),
        whole('q', 'q', 'Quotient', 1, 4999),
        whole('r', 'r', 'Remainder', 0, 8),
        { ...whole('m', 'm', 'Shared out', 2, 9999), derived: true },
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
          // A remainder is always smaller than the divisor; nothing is solved from this.
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
          // The dividend and divisor can't be found from the number of whole groups alone.
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
            how: 'Take out chunks of groups by place, biggest first. Add the chunks.',
            work: (v) => partial(v.n!, v.d!),
          },
        },
      },
      example: { n: 743, d: 6, q: 123, r: 5, m: 738 },
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
    } satisfies ModuleDef;
  })(),

  // ── Comparing fractions with unlike denominators: a common denominator (4.NF.1, 4.NF.2) ──
  (() => {
    const sign = (v: Values) => (v.p! > v.q! ? '>' : v.p! < v.q! ? '<' : '=');
    const known = (v: Values) =>
      ['a', 'b', 'c', 'd', 'm', 'p', 'q'].every((k) => v[k] !== undefined);
    const scaled = (
      id: string,
      [top, other, out]: [string, string, string],
      [topName, otherName]: [string, string],
    ) => ({
      relation: {
        id,
        display: `{${top}} × {${other}} = {${out}}`,
        vars: [out, top, other],
        residual: (v: Values) => v[out]! - v[top]! * v[other]!,
        solve: {
          [out]: (v: Values) => v[top]! * v[other]!,
          [top]: (v: Values) => div(v[out]!, v[other]!),
          [other]: (v: Values) => div(v[out]!, v[top]!),
        },
      },
      steps: {
        [out]: {
          expr: `{${top}} × {${other}}`,
          how: `Multiply the ${topName} by the ${otherName}: the same factor as its bottom got.`,
          work: (v: Values) => timesWork(v[top]!, v[other]!),
        },
        [top]: {
          expr: `{${out}} ÷ {${other}}`,
          how: `Divide the new top by the ${otherName} to get the ${topName} back.`,
          work: (v: Values) => divideWork(v[out]!, v[other]!),
        },
        [other]: {
          expr: `{${out}} ÷ {${top}}`,
          how: `Divide the new top by the ${topName}.`,
          work: (v: Values) => divideWork(v[out]!, v[top]!, 'second'),
        },
      },
    });
    const first = scaled('p = a × d', ['a', 'd', 'p'], ['first top', 'second bottom']);
    const second = scaled('q = c × b', ['c', 'b', 'q'], ['second top', 'first bottom']);
    const common = scaled('m = b × d', ['b', 'd', 'm'], ['first bottom', 'second bottom']);
    return {
      id: 'm.4.fraction-equivalence',
      assumptions: [
        'Multiplying the top and the bottom of a fraction by the same number keeps its size.',
        'To compare two fractions, give them the same bottom: multiply each by the other’s bottom.',
        'With the same bottom, the bigger top is the bigger fraction.',
        'Fractions up to 1, bottoms from 2 to 6.',
      ],
      variables: [
        whole('a', 'a', 'First top', 0, 6),
        whole('b', 'b', 'First bottom', 2, 6),
        whole('c', 'c', 'Second top', 0, 6),
        whole('d', 'd', 'Second bottom', 2, 6),
        { ...whole('m', 'm', 'Common bottom', 4, 36), derived: true },
        { ...whole('p', 'p', 'First new top', 0, 36), derived: true },
        { ...whole('q', 'q', 'Second new top', 0, 36), derived: true },
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
          id: 'c ≤ d',
          constraint: true,
          display: '{c}/{d} is at most 1',
          vars: ['c', 'd'],
          residual: (v: Values) => (v.c! <= v.d! ? 0 : 1),
          solve: {},
        },
        common.relation,
        first.relation,
        {
          ...second.relation,
          check: (v: Values) =>
            known(v)
              ? `${v.c} × ${v.b} = ${v.q}, so ${v.a}/${v.b} ${sign(v)} ${v.c}/${v.d}`
              : `${v.c} × ${v.b} = ${v.q}`,
        },
      ],
      steps: {
        'a ≤ b': {},
        'c ≤ d': {},
        'm = b × d': {
          ...common.steps,
          m: {
            ...common.steps.m!,
            how: 'Multiply the two bottoms. Both fractions can be written over that number.',
          },
        },
        'p = a × d': first.steps,
        'q = c × b': {
          ...second.steps,
          q: {
            ...second.steps.q!,
            note: (v) =>
              known(v)
                ? `(${v.p}/${v.m} ${sign(v)} ${v.q}/${v.m}, so ${v.a}/${v.b} ${sign(v)} ${v.c}/${v.d})`
                : '',
          },
        },
      },
      example: { a: 3, b: 4, c: 2, d: 3, m: 12, p: 9, q: 8 },
      startWith: ['a', 'b', 'c', 'd'],
      representation: {
        kind: 'fractionBars',
        rows: [
          { num: 'a', den: 'b' },
          { num: 'p', den: 'm' },
          { num: 'c', den: 'd' },
          { num: 'q', den: 'm' },
        ],
        controls: ['a', 'b', 'c', 'd'],
        compare: [1, 3, 0, 2],
      },
    } satisfies ModuleDef;
  })(),
];
