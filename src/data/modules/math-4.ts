/**
 * Grade 4 math (CCSS 4.OA, 4.NBT, 4.NF, 4.MD, 4.G). Letters appear only as labels next to a
 * name the student can see; the step explanations say names, not letters. Numbers reach
 * 1,000,000, fractions get unlike denominators and decimals appear (tenths, hundredths).
 */
import type { Values } from '@/engine/types';

import { formatNumber } from '@/engine/format';

import { div, whole } from './math-k2';
import type { ModuleDef } from './types';
import { addStrategy, countList, divideWork, timesWork } from './work';

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

  // ── Adding fractions with like denominators; the sum as a mixed number (4.NF.3) ──
  {
    id: 'm.4.add-fractions-like',
    assumptions: [
      'Fractions with the same bottom are counted in the same-size parts: add the tops, keep the bottom.',
      'A sum bigger than 1 can be written as wholes and parts: 7/4 = 1 whole and 3/4.',
      'Each fraction is at most 1. Bottoms from 2 to 12.',
    ],
    variables: [
      whole('b', 'b', 'Parts in one whole', 2, 12),
      whole('a', 'a', 'First top', 0, 12),
      whole('c', 'c', 'Second top', 0, 12),
      whole('s', 's', 'Sum of the tops', 0, 24),
      { ...whole('w', 'w', 'Wholes in the sum', 0, 2), derived: true },
      { ...whole('r', 'r', 'Parts past the last whole', 0, 11), derived: true },
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
        id: 'c ≤ b',
        constraint: true,
        display: '{c}/{b} is at most 1',
        vars: ['c', 'b'],
        residual: (v: Values) => (v.c! <= v.b! ? 0 : 1),
        solve: {},
      },
      {
        id: 's = a + c',
        display: '{a}/{b} + {c}/{b} = {s}/{b}',
        check: (v: Values) => `${v.a} + ${v.c} = ${v.s}`,
        // The bottom is in the number sentence but doesn't change the sum of the tops.
        vars: ['s', 'a', 'c', 'b'],
        residual: (v: Values) => v.s! - v.a! - v.c!,
        solve: {
          s: (v: Values) => v.a! + v.c!,
          a: (v: Values) => v.s! - v.c!,
          c: (v: Values) => v.s! - v.a!,
          b: () => undefined,
        },
      },
      {
        id: 'w = wholes in s/b',
        display: '{s}/{b} = {w} wholes and {r}/{b}',
        check: (v: Values) => `${v.w} × ${v.b} + ${v.r} = ${v.s}`,
        vars: ['w', 's', 'b', 'r'],
        residual: (v: Values) => v.w! * v.b! + v.r! - v.s! + (v.r! >= v.b! ? 1 : 0),
        solve: {
          w: (v: Values) => (v.r === undefined ? undefined : (v.s! - v.r!) / v.b!),
          r: (v: Values) => (v.w === undefined ? undefined : v.s! - v.w! * v.b!),
          s: (v: Values) => v.w! * v.b! + v.r!,
          b: () => undefined,
        },
      },
      {
        id: 'w = floor(s/b)',
        display: 'whole numbers passed by {s}/{b}: {w}',
        vars: ['w', 's', 'b'],
        residual: (v: Values) => v.w! - Math.floor(v.s! / v.b!),
        solve: {
          w: (v: Values) => Math.floor(v.s! / v.b!),
          s: () => undefined,
          b: () => undefined,
        },
      },
    ],
    steps: {
      'a ≤ b': {},
      'c ≤ b': {},
      's = a + c': {
        s: {
          expr: '{a} + {c}',
          how: 'Add the tops. The bottom stays the same: the parts are the same size.',
          work: (v) => addStrategy(v.a!, v.c!),
        },
        a: { expr: '{s} − {c}', how: 'Take the second top away from the sum of the tops.' },
        c: { expr: '{s} − {a}', how: 'Take the first top away from the sum of the tops.' },
      },
      'w = floor(s/b)': {
        w: {
          expr: 'wholes in {s} parts of {b}',
          how: 'Every full set of parts makes 1 whole. Count the full sets in the sum.',
          work: (v) =>
            v.w! > 0
              ? [
                  `Count by ${v.b}s: ${countList(0, v.b!, v.w!)} → ${v.w} ${v.w === 1 ? 'whole' : 'wholes'}`,
                ]
              : [`${v.s} is less than ${v.b}, so the sum is less than 1 whole.`],
        },
      },
      'w = wholes in s/b': {
        r: {
          expr: '{s} − {w} × {b}',
          how: 'Take away the parts that make wholes. The rest are the parts past the last whole.',
          work: (v) => [`${v.w} × ${v.b} = ${v.w! * v.b!}`, `${v.s} − ${v.w! * v.b!} = ${v.r}`],
          note: (v) =>
            v.w! > 0
              ? `(${v.s}/${v.b} = ${v.w} ${v.w === 1 ? 'whole' : 'wholes'} and ${v.r}/${v.b})`
              : '',
        },
        w: {
          expr: '({s} − {r}) ÷ {b}',
          how: 'Take away the parts left over. Share the rest into wholes.',
          work: (v) => [`${v.s} − ${v.r} = ${v.s! - v.r!}`, ...divideWork(v.s! - v.r!, v.b!)],
        },
        s: {
          expr: '{w} × {b} + {r}',
          how: 'Each whole has the same number of parts. Add the parts left over.',
          work: (v) => [`${v.w} × ${v.b} = ${v.w! * v.b!}`, `${v.w! * v.b!} + ${v.r} = ${v.s}`],
        },
      },
    },
    example: { b: 4, a: 3, c: 2, s: 5, w: 1, r: 1 },
    startWith: ['b', 'a', 'c'],
    representation: { kind: 'fractionLine', numerator: 's', denominator: 'b', wholes: 2 },
  },

  // ── Multiplying a fraction by a whole number (4.NF.4) ──
  {
    id: 'm.4.fraction-times-whole',
    assumptions: [
      'A whole number times a fraction is that many copies of the fraction: 5 × 2/3 is 2/3 five times.',
      'Multiply the whole number by the top. The bottom stays: the parts are the same size.',
      'A product past 1 can be written as wholes and parts: 10/3 = 3 wholes and 1/3.',
      'The fraction is at most 1. Whole numbers to 10, bottoms from 2 to 12.',
    ],
    variables: [
      whole('n', 'n', 'Whole number', 1, 10),
      whole('a', 'a', 'Top', 1, 12),
      whole('b', 'b', 'Bottom', 2, 12),
      whole('p', 'p', 'Top of the product', 1, 120),
      { ...whole('w', 'w', 'Wholes in the product', 0, 10), derived: true },
      { ...whole('r', 'r', 'Parts past the last whole', 0, 11), derived: true },
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
        id: 'p = n × a',
        display: '{n} × {a}/{b} = {p}/{b}',
        check: (v: Values) => `${v.n} × ${v.a} = ${v.p}`,
        vars: ['p', 'n', 'a', 'b'],
        residual: (v: Values) => v.p! - v.n! * v.a!,
        solve: {
          p: (v: Values) => v.n! * v.a!,
          n: (v: Values) => div(v.p!, v.a!),
          a: (v: Values) => div(v.p!, v.n!),
          b: () => undefined,
        },
      },
      {
        id: 'w = wholes in p/b',
        display: '{p}/{b} = {w} wholes and {r}/{b}',
        check: (v: Values) => `${v.w} × ${v.b} + ${v.r} = ${v.p}`,
        vars: ['w', 'p', 'b', 'r'],
        residual: (v: Values) => v.w! * v.b! + v.r! - v.p! + (v.r! >= v.b! ? 1 : 0),
        solve: {
          w: (v: Values) => (v.r === undefined ? undefined : (v.p! - v.r!) / v.b!),
          r: (v: Values) => (v.w === undefined ? undefined : v.p! - v.w! * v.b!),
          p: (v: Values) => v.w! * v.b! + v.r!,
          b: () => undefined,
        },
      },
      {
        id: 'w = floor(p/b)',
        display: 'whole numbers passed by {p}/{b}: {w}',
        vars: ['w', 'p', 'b'],
        residual: (v: Values) => v.w! - Math.floor(v.p! / v.b!),
        solve: {
          w: (v: Values) => Math.floor(v.p! / v.b!),
          p: () => undefined,
          b: () => undefined,
        },
      },
    ],
    steps: {
      'a ≤ b': {},
      'p = n × a': {
        p: {
          expr: '{n} × {a}',
          how: 'Add the top that many times, or multiply the whole number by the top.',
          work: (v) =>
            v.n! <= 6
              ? [`${Array(v.n!).fill(`${v.a}/${v.b}`).join(' + ')} = ${v.p}/${v.b}`]
              : timesWork(v.n!, v.a!),
        },
        n: {
          expr: '{p} ÷ {a}',
          how: 'Divide the top of the product by the top of the fraction: how many copies.',
          work: (v) => divideWork(v.p!, v.a!),
        },
        a: {
          expr: '{p} ÷ {n}',
          how: 'Divide the top of the product by the whole number.',
          work: (v) => divideWork(v.p!, v.n!, 'second'),
        },
      },
      'w = floor(p/b)': {
        w: {
          expr: 'wholes in {p} parts of {b}',
          how: 'Every full set of parts makes 1 whole. Count the full sets in the product.',
          work: (v) =>
            v.w! > 0
              ? [
                  `Count by ${v.b}s: ${countList(0, v.b!, v.w!)} → ${v.w} ${v.w === 1 ? 'whole' : 'wholes'}`,
                ]
              : [`${v.p} is less than ${v.b}, so the product is less than 1 whole.`],
        },
      },
      'w = wholes in p/b': {
        r: {
          expr: '{p} − {w} × {b}',
          how: 'Take away the parts that make wholes. The rest are the parts past the last whole.',
          work: (v) => [`${v.w} × ${v.b} = ${v.w! * v.b!}`, `${v.p} − ${v.w! * v.b!} = ${v.r}`],
          note: (v) =>
            v.w! > 0
              ? `(${v.p}/${v.b} = ${v.w} ${v.w === 1 ? 'whole' : 'wholes'} and ${v.r}/${v.b})`
              : '',
        },
        w: {
          expr: '({p} − {r}) ÷ {b}',
          how: 'Take away the parts left over. Share the rest into wholes.',
          work: (v) => [`${v.p} − ${v.r} = ${v.p! - v.r!}`, ...divideWork(v.p! - v.r!, v.b!)],
        },
        p: {
          expr: '{w} × {b} + {r}',
          how: 'Each whole has the same number of parts. Add the parts left over.',
          work: (v) => [`${v.w} × ${v.b} = ${v.w! * v.b!}`, `${v.w! * v.b!} + ${v.r} = ${v.p}`],
        },
      },
    },
    example: { n: 5, a: 2, b: 3, p: 10, w: 3, r: 1 },
    startWith: ['n', 'a', 'b'],
    representation: { kind: 'fractionLine', numerator: 'p', denominator: 'b', wholes: 3 },
  },

  // ── Decimal notation for tenths and hundredths (4.NF.5, 4.NF.6) ──
  {
    id: 'm.4.decimals-intro',
    assumptions: [
      'A tenth is 10 hundredths: 3/10 = 30/100. The grid has 100 squares, so each square is a hundredth.',
      'Hundredths are written as a decimal: 34/100 = 0.34. The first place after the point is tenths, the second is hundredths.',
      'Tap a square on the grid to shade that many hundredths.',
    ],
    variables: [
      whole('t', 't', 'Tenths', 0, 9),
      whole('u', 'u', 'Extra hundredths', 0, 9),
      whole('h', 'h', 'Hundredths in all', 0, 99),
      { id: 'd', symbol: 'd', name: 'As a decimal', min: 0, max: 0.99, step: 0.01 },
    ],
    relations: [
      {
        id: 'h = 10 × t + u',
        display: '10 × {t} + {u} = {h}',
        vars: ['h', 't', 'u'],
        residual: (v: Values) => v.h! - 10 * v.t! - v.u!,
        solve: {
          h: (v: Values) => 10 * v.t! + v.u!,
          t: (v: Values) => (v.h! - v.u!) / 10,
          u: (v: Values) => v.h! - 10 * v.t!,
        },
      },
      {
        id: 'd = h ÷ 100',
        display: '{h}/100 = {d}',
        vars: ['d', 'h'],
        residual: (v: Values) => v.d! - v.h! / 100,
        solve: { d: (v: Values) => v.h! / 100, h: (v: Values) => v.d! * 100 },
      },
    ],
    steps: {
      'h = 10 × t + u': {
        h: {
          expr: '10 × {t} + {u}',
          how: 'Each tenth is 10 hundredths. Add the extra hundredths.',
          work: (v) => [`10 × ${v.t} = ${10 * v.t!}`, `${10 * v.t!} + ${v.u} = ${v.h}`],
        },
        t: {
          expr: '({h} − {u}) ÷ 10',
          how: 'Take away the extra hundredths. Every 10 hundredths left is a tenth.',
          work: (v) => [`${v.h} − ${v.u} = ${v.h! - v.u!}`, `${v.h! - v.u!} ÷ 10 = ${v.t}`],
        },
        u: {
          expr: '{h} − 10 × {t}',
          how: 'Take away the hundredths that make full tenths.',
          work: (v) => [`10 × ${v.t} = ${10 * v.t!}`, `${v.h} − ${10 * v.t!} = ${v.u}`],
        },
      },
      'd = h ÷ 100': {
        d: {
          expr: '{h} ÷ 100',
          how: 'Hundredths go two places after the point: the tenths digit, then the hundredths digit.',
          work: (v) => [`${v.h} hundredths = 0.${String(v.h).padStart(2, '0')}`],
        },
        h: {
          expr: '{d} × 100',
          how: 'Read the two digits after the point as hundredths.',
          work: (v) => [`${v.d} = ${v.h} hundredths`],
        },
      },
    },
    example: { t: 3, u: 4, h: 34, d: 0.34 },
    startWith: ['t', 'u'],
    representation: { kind: 'grid100', percent: 'h' },
  },

  // ── Converting units within one system: a conversion table (4.MD.1) ──
  (() => {
    const fmt = (x: number) => formatNumber(x);
    const PAIRS: Record<number, string> = {
      12: '1 foot = 12 inches',
      16: '1 pound = 16 ounces',
      60: '1 hour = 60 minutes',
      100: '1 meter = 100 centimeters',
      1000: '1 kilometer = 1,000 meters (or 1 kilogram = 1,000 grams, 1 liter = 1,000 milliliters)',
    };
    return {
      id: 'm.4.unit-conversion',
      assumptions: [
        'A bigger unit is a fixed number of smaller units: 1 foot = 12 inches, 1 hour = 60 minutes.',
        'Also 1 pound = 16 ounces, 1 meter = 100 centimeters, and 1 kilometer, 1 kilogram or 1 liter = 1,000 of the smaller unit.',
        'To change bigger units into smaller ones, multiply by that number. A table shows the pattern.',
        'Tap a row of the table to pick how many bigger units.',
      ],
      variables: [
        whole('b', 'b', 'Bigger units', 1, 12),
        {
          ...whole('k', 'k', 'Smaller units in 1 bigger unit', 12, 1000),
          allowed: [12, 16, 60, 100, 1000],
        },
        whole('s', 's', 'Smaller units', 12, 12000),
      ],
      relations: [
        {
          id: 's = b × k',
          display: '{b} × {k} = {s}',
          vars: ['s', 'b', 'k'],
          residual: (v: Values) => v.s! - v.b! * v.k!,
          solve: {
            s: (v: Values) => v.b! * v.k!,
            b: (v: Values) => div(v.s!, v.k!),
            k: (v: Values) => div(v.s!, v.b!),
          },
        },
      ],
      steps: {
        's = b × k': {
          s: {
            expr: '{b} × {k}',
            how: (v) =>
              `${PAIRS[v.k!] ?? 'Each bigger unit is the same number of smaller units'}. Multiply by that number.`,
            work: (v) => [`${v.b} × ${fmt(v.k!)} = ${fmt(v.b! * v.k!)}`],
          },
          b: {
            expr: '{s} ÷ {k}',
            how: 'Divide the smaller units by how many make one bigger unit.',
            work: (v) => [`${fmt(v.s!)} ÷ ${fmt(v.k!)} = ${v.b}`],
          },
          k: {
            expr: '{s} ÷ {b}',
            how: 'Divide the smaller units by the bigger units: how many smaller units in one.',
            work: (v) => [`${fmt(v.s!)} ÷ ${v.b} = ${fmt(v.k!)}`],
          },
        },
      },
      example: { b: 3, k: 12, s: 36 },
      startWith: ['b', 'k'],
      representation: {
        kind: 'table',
        sweep: 'b',
        output: 's',
        params: ['k'],
        rows: [1, 2, 3, 4, 5, 6],
      },
    } satisfies ModuleDef;
  })(),

  // ── Area and perimeter formulas, including a missing side (4.MD.3) ──
  (() => {
    const fmt = (x: number) => formatNumber(x);
    return {
      id: 'm.4.area-perimeter-formulas',
      assumptions: [
        'Area is the space inside: length × width, in square units.',
        'Perimeter is the distance around: two lengths and two widths, so 2 × (length + width).',
        'From the perimeter, half of it is length + width. Take away the side you know to find the other.',
        'Sides to 30 meters.',
      ],
      variables: [
        { ...whole('l', 'l', 'Length', 1, 30), unit: 'm' },
        { ...whole('w', 'w', 'Width', 1, 30), unit: 'm' },
        { ...whole('A', 'A', 'Area', 1, 900), unit: 'm²' },
        { ...whole('h', 'h', 'Length + width', 2, 60), unit: 'm', derived: true },
        { ...whole('P', 'P', 'Perimeter', 4, 120), unit: 'm' },
      ],
      relations: [
        {
          id: 'A = l × w',
          display: '{l} × {w} = {A}',
          vars: ['A', 'l', 'w'],
          residual: (v: Values) => v.A! - v.l! * v.w!,
          solve: {
            A: (v: Values) => v.l! * v.w!,
            l: (v: Values) => div(v.A!, v.w!),
            w: (v: Values) => div(v.A!, v.l!),
          },
        },
        {
          id: 'h = l + w',
          display: '{l} + {w} = {h}',
          vars: ['h', 'l', 'w'],
          residual: (v: Values) => v.h! - v.l! - v.w!,
          solve: {
            h: (v: Values) => v.l! + v.w!,
            l: (v: Values) => v.h! - v.w!,
            w: (v: Values) => v.h! - v.l!,
          },
        },
        {
          id: 'P = 2 × h',
          display: '2 × {h} = {P}',
          vars: ['P', 'h'],
          residual: (v: Values) => v.P! - 2 * v.h!,
          solve: { P: (v: Values) => 2 * v.h!, h: (v: Values) => v.P! / 2 },
        },
      ],
      steps: {
        'A = l × w': {
          A: {
            expr: '{l} × {w}',
            how: 'Multiply the length by the width: rows of unit squares.',
            work: (v) => timesWork(v.l!, v.w!),
          },
          l: {
            expr: '{A} ÷ {w}',
            how: 'Divide the area by the width to get the length.',
            work: (v) => divideWork(v.A!, v.w!),
          },
          w: {
            expr: '{A} ÷ {l}',
            how: 'Divide the area by the length to get the width.',
            work: (v) => divideWork(v.A!, v.l!, 'second'),
          },
        },
        'h = l + w': {
          h: { expr: '{l} + {w}', how: 'One length and one width: half of the way around.' },
          l: {
            expr: '{h} − {w}',
            how: 'Take the width away from half the perimeter to get the length.',
            work: (v) => [`${fmt(v.h!)} − ${fmt(v.w!)} = ${fmt(v.l!)}`],
          },
          w: {
            expr: '{h} − {l}',
            how: 'Take the length away from half the perimeter to get the width.',
            work: (v) => [`${fmt(v.h!)} − ${fmt(v.l!)} = ${fmt(v.w!)}`],
          },
        },
        'P = 2 × h': {
          P: {
            expr: '2 × {h}',
            how: 'The perimeter is two lengths and two widths: double length + width.',
            work: (v) => [`2 × ${fmt(v.h!)} = ${fmt(2 * v.h!)}`],
          },
          h: {
            expr: '{P} ÷ 2',
            how: 'Half the perimeter is one length and one width.',
            work: (v) => [`${fmt(v.P!)} ÷ 2 = ${fmt(v.P! / 2)}`],
          },
        },
      },
      example: { l: 9, w: 4, A: 36, h: 13, P: 26 },
      startWith: ['l', 'w'],
      representation: {
        kind: 'rectangle',
        length: 'l',
        width: 'w',
        inside: 'A',
        around: 'P',
        extent: 10,
      },
    } satisfies ModuleDef;
  })(),
];
