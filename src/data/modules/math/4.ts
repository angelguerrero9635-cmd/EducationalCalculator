/**
 * Grade 4 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { formatNumber } from '@/engine/format';
import type { Values } from '@/engine/types';
import { apart, div, primeFactors, times, whole } from '../helpers';
import type { ModuleDef } from '../types';
import {
  addAll,
  addStrategy,
  countList,
  divideWork,
  placeTimesWork,
  subtractStrategy,
  timesWork,
} from '../work';

/** The factors of n in order: 24 → [1, 2, 3, 4, 6, 8, 12, 24]. */
const factorsOf = (n: number): number[] =>
  n < 1 ? [] : Array.from({ length: n }, (_, i) => i + 1).filter((k) => n % k === 0);
/** Factor pairs up to the square root: 24 → "1 × 24, 2 × 12, 3 × 8, 4 × 6". */
const factorPairs = (n: number): string =>
  factorsOf(n)
    .filter((k) => k * k <= n)
    .map((k) => `${k} × ${n / k}`)
    .join(', ');
const fmt = (x: number) => formatNumber(x);
/** t = the `place` part of a: 'h = hundreds of a' solves h = 100 × ⌊a ÷ 100⌋ from a alone. */
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
/** p = a × b where a is one place-value part: "a basic fact, then the zeros". */
const partProduct = (p: string, a: string, b: string, [an, bn]: [string, string]) => ({
  relation: {
    id: `${p} = ${a} × ${b}`,
    display: `{${a}} × {${b}} = {${p}}`,
    vars: [p, a, b],
    residual: (v: Values) => v[p]! - v[a]! * v[b]!,
    solve: {
      [p]: (v: Values) => v[a]! * v[b]!,
      [a]: (v: Values) => div(v[p]!, v[b]!),
      [b]: (v: Values) => div(v[p]!, v[a]!),
    },
  },
  steps: {
    [p]: {
      expr: `{${a}} × {${b}}`,
      how: `Multiply the ${an} by the ${bn}: a basic fact, then the zeros.`,
      work: (v: Values) => placeTimesWork(v[a]!, v[b]!),
    },
    [a]: { expr: `{${p}} ÷ {${b}}`, how: `Divide this part product by the ${bn}.` },
    [b]: { expr: `{${p}} ÷ {${a}}`, how: `Divide this part product by the ${an}.` },
  },
});

export const MATH_4_MODULES: ModuleDef[] = [
  // ── Factors, multiples, primes and composites (4.OA.4) ──
  {
    id: 'm.4.factors-multiples',
    assumptions: [
      'A factor pair is two whole numbers that multiply to make the number.',
      'Find every pair by trying 1, 2, 3, … until the factors would swap places.',
      'A prime number has exactly 2 factors: 1 and itself. A composite number has more.',
      'The picture shows one factor pair as an array: rows × columns, up to 20 of each.',
    ],
    variables: [
      whole('n', 'n', 'Number', 1, 100),
      whole('a', 'a', 'One factor', 1, 100),
      whole('b', 'b', 'Its partner', 1, 100),
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
    representation: { kind: 'array', rows: 'a', columns: 'b', total: 'n', max: 20 },
  },
  // ── Prime factors on a factor tree (4.OA.4) ──
  {
    id: 'm.4.factors-multiples~factor-tree',
    title: 'Factor tree',
    use: 'Use this to break a number into its prime factors.',
    assumptions: [
      'Split a number into two factors. Split each factor again until every branch is prime.',
      'The primes at the ends multiply back to the number: 24 = 2 × 2 × 2 × 3.',
      'A prime number has no split: its tree is just itself.',
    ],
    variables: [
      whole('n', 'n', 'Number', 2, 100),
      { ...whole('c', 'c', 'Prime factors', 1, 7), derived: true },
    ],
    relations: [
      {
        id: 'c = prime factors of n',
        display: '{n} has {c} prime factors, with repeats',
        vars: ['c', 'n'],
        residual: (v: Values) => v.c! - primeFactors(v.n!).length,
        // Many numbers have the same count: the number can't be found from it.
        solve: { c: (v: Values) => primeFactors(v.n!).length, n: () => undefined },
      },
    ],
    steps: {
      'c = prime factors of n': {
        c: {
          expr: 'prime factors of {n}',
          how: 'Split until every branch is prime. Count the primes at the ends.',
          work: (v) => {
            const primes = primeFactors(v.n!);
            return primes.length === 1
              ? [`${v.n} is prime: no split`]
              : [`${v.n} = ${primes.join(' × ')}`, `${primes.length} primes at the ends`];
          },
          note: (v) =>
            primeFactors(v.n!).length === 1 ? `(${v.n} is prime)` : `(${v.n} is composite)`,
        },
      },
    },
    example: { n: 24, c: 4 },
    startWith: ['n'],
    representation: { kind: 'factorTree', value: 'n', count: 'c' },
  },
  // ── Multiples: is n a multiple of k? (4.OA.4) ──
  (() => {
    const mult = times('n = k × j', ['k', 'j', 'n'], ['number', 'count', 'multiple']);
    return {
      id: 'm.4.factors-multiples~multiples',
      title: 'Multiples of a number',
      use: 'Use this for “Is 40 a multiple of 8?” and listing multiples.',
      assumptions: [
        'A multiple of a number is that number times a whole number: 8, 16, 24, 32 are multiples of 8.',
        'To check, divide. If nothing is left over, it is a multiple.',
        'Numbers to 12, and their first 12 multiples.',
      ],
      variables: [
        whole('k', 'k', 'Number', 1, 12),
        whole('j', 'j', 'Which multiple', 1, 12),
        whole('n', 'n', 'Multiple', 1, 144),
      ],
      relations: [
        {
          ...mult.relation,
          check: (v: Values) => `${v.k} × ${v.j} = ${v.n}, so ${v.n} is a multiple of ${v.k}`,
        },
      ],
      steps: {
        'n = k × j': {
          ...mult.steps,
          n: {
            ...mult.steps.n!,
            how: 'Count by the number that many times. The last count is the multiple.',
          },
          j: {
            ...mult.steps.j!,
            how: 'Divide by the number. No remainder means it is a multiple.',
            work: (v) => divideWork(v.n!, v.k!, 'second'),
          },
        },
      },
      example: { k: 8, j: 5, n: 40 },
      startWith: ['k', 'j'],
      representation: { kind: 'skipCount', step: 'k', count: 'j', total: 'n' },
    } satisfies ModuleDef;
  })(),
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
  // ── Rounding to any place, to 1,000,000 (4.NBT.3) ──
  {
    id: 'm.4.place-value-million~rounding',
    title: 'Round to any place',
    use: 'Use this to round a number to any place, up to 1,000,000.',
    assumptions: [
      'Pick the place: tens, hundreds, thousands, ten thousands or hundred thousands.',
      'Find the two numbers in that place just below and just above. Round to the nearer one.',
      'Exactly halfway rounds up.',
    ],
    variables: [
      whole('n', 'n', 'Number', 0, 999999),
      { ...whole('p', 'p', 'Place', 10, 100000), allowed: [10, 100, 1000, 10000, 100000] },
      { ...whole('L', 'L', 'Just below', 0, 999990), step: 10, multipleOf: 10, derived: true },
      { ...whole('U', 'U', 'Just above', 10, 1000000), step: 10, multipleOf: 10, derived: true },
      { ...whole('r', 'r', 'Rounded', 0, 1000000), step: 10, multipleOf: 10, derived: true },
    ],
    relations: [
      {
        id: 'L = place below n',
        display: 'The {p}s at or below {n}: {L}',
        vars: ['L', 'n', 'p'],
        residual: (v: Values) => v.L! - Math.floor(v.n! / v.p!) * v.p!,
        // Many numbers share the same number below them: the number can't be found from it.
        solve: {
          L: (v: Values) => Math.floor(v.n! / v.p!) * v.p!,
          n: () => undefined,
          p: () => undefined,
        },
      },
      {
        id: 'U = L + p',
        display: '{L} + {p} = {U}',
        vars: ['U', 'L', 'p'],
        residual: (v: Values) => v.U! - v.L! - v.p!,
        solve: {
          U: (v: Values) => v.L! + v.p!,
          L: (v: Values) => v.U! - v.p!,
          p: (v: Values) => v.U! - v.L!,
        },
      },
      {
        id: 'r = nearer of L and U',
        display: '{n} is between {L} and {U}, so it rounds to {r}',
        vars: ['r', 'n', 'L', 'U'],
        residual: (v: Values) => v.r! - (v.n! - v.L! < (v.U! - v.L!) / 2 ? v.L! : v.U!),
        solve: {
          r: (v: Values) => (v.n! - v.L! < (v.U! - v.L!) / 2 ? v.L! : v.U!),
          n: () => undefined,
          L: () => undefined,
          U: () => undefined,
        },
      },
    ],
    steps: {
      'L = place below n': {
        L: {
          expr: '{n} with the places under {p} made 0',
          how: 'Keep the digits from the place up. Make the smaller places 0.',
          work: (v) => [`${fmt(v.n!)} = ${fmt(v.L!)} + ${fmt(v.n! - v.L!)}`],
        },
      },
      'U = L + p': {
        U: { expr: '{L} + {p}', how: 'The next number in that place is one place-unit more.' },
        L: { expr: '{U} − {p}', how: 'One place-unit less than the number above.' },
        p: { expr: '{U} − {L}', how: 'The two numbers are one place-unit apart.' },
      },
      'r = nearer of L and U': {
        r: {
          expr: (v) => (v.n! - v.L! < (v.U! - v.L!) / 2 ? '{L}' : '{U}'),
          how: 'Halfway is half a place-unit past the number below. Below halfway rounds down.',
          work: (v) => [
            `Halfway is ${fmt(v.L! + v.p! / 2)}. ${fmt(v.n!)} is ${v.n! - v.L! < v.p! / 2 ? 'below' : 'at or past'} it → ${fmt(v.r!)}`,
          ],
        },
      },
    },
    example: { n: 347812, p: 1000, L: 347000, U: 348000, r: 348000 },
    startWith: ['n', 'p'],
    representation: { kind: 'rounding', value: 'n', lower: 'L', upper: 'U', rounded: 'r', to: 'p' },
  },
  // ── Comparing numbers to 1,000,000 (4.NBT.2) ──
  (() => {
    const gap = apart(
      'g',
      'a',
      'b',
      ['first number', 'second number'],
      ['bigger', 'smaller'],
      'Take the smaller number away from the bigger one, place by place.',
    );
    return {
      id: 'm.4.place-value-million~compare',
      title: 'Compare numbers to 1,000,000',
      use: 'Use this to compare two numbers up to 1,000,000 with >, < or =.',
      assumptions: [
        'Compare the biggest place first. More digits means a bigger number.',
        'Same digit in that place: move one place right and compare again.',
        'The bars show the two numbers; the gap is how far apart they are.',
      ],
      variables: [
        whole('a', 'a', 'First number', 0, 1000000),
        whole('b', 'b', 'Second number', 0, 1000000),
        whole('g', 'g', 'How far apart', 0, 1000000),
      ],
      relations: [
        {
          ...gap.relation,
          check: (v: Values) =>
            `${fmt(v.a!)} ${v.a! < v.b! ? '<' : v.a! > v.b! ? '>' : '='} ${fmt(v.b!)}, ${fmt(v.g!)} apart`,
        },
      ],
      steps: { [gap.relation.id]: gap.steps },
      example: { a: 452000, b: 425900, g: 26100 },
      startWith: ['a', 'b'],
      representation: {
        kind: 'tape',
        compare: ['a', 'b'],
        difference: 'g',
        caption: '{a} and {b} are {g} apart.',
      },
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
          id: 't = tens of a',
          display: '{a} has {t} in its tens',
          vars: ['t', 'a'],
          residual: (v: Values) => v.t! - 10 * Math.floor(v.a! / 10),
          // Every number from 50 to 59 has 50 in its tens: the number can't be found from it.
          solve: { t: (v: Values) => 10 * Math.floor(v.a! / 10), a: () => undefined },
        },
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
        't = tens of a': {
          t: {
            expr: '{a} without its ones',
            how: 'The tens of the first factor: the number without its ones.',
            work: (v) => [
              `${v.a} is ${v.t! / 10} tens and ${v.a! % 10} ones; ${v.t! / 10} tens = ${v.t}`,
            ],
          },
        },
        'a = t + o': {
          t: {
            expr: '{a} − {o}',
            how: 'The tens of the first factor: take the ones away.',
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
  // ── 2-digit × 2-digit as a four-box area model (4.NBT.5) ──
  (() => {
    const p1 = partProduct('p', 't', 's', ['tens of the first', 'tens of the second']);
    const p2 = partProduct('q', 'o', 's', ['ones of the first', 'tens of the second']);
    const p3 = partProduct('u', 't', 'r', ['tens of the first', 'ones of the second']);
    const p4 = partProduct('x', 'o', 'r', ['ones of the first', 'ones of the second']);
    return {
      id: 'm.4.multi-digit-multiply~two-digit',
      title: 'Two-digit times two-digit',
      use: 'Use this for 23 × 14 with a four-box area model.',
      assumptions: [
        'Break both factors into tens and ones: 23 × 14 = (20 + 3) × (10 + 4).',
        'Multiply every part of one by every part of the other: four part products.',
        'Add the four part products.',
        'Both factors from 10 to 99.',
      ],
      variables: [
        whole('a', 'a', 'First factor', 10, 99),
        whole('b', 'b', 'Second factor', 10, 99),
        {
          ...whole('t', 't', 'Tens of the first', 10, 90),
          step: 10,
          multipleOf: 10,
          derived: true,
        },
        { ...whole('o', 'o', 'Ones of the first', 0, 9), derived: true },
        {
          ...whole('s', 's', 'Tens of the second', 10, 90),
          step: 10,
          multipleOf: 10,
          derived: true,
        },
        { ...whole('r', 'r', 'Ones of the second', 0, 9), derived: true },
        { ...whole('p', 'p', 'Tens × tens', 100, 8100), derived: true },
        { ...whole('q', 'q', 'Ones × tens', 0, 810), derived: true },
        { ...whole('u', 'u', 'Tens × ones', 0, 810), derived: true },
        { ...whole('x', 'x', 'Ones × ones', 0, 81), derived: true },
        { ...whole('n', 'n', 'Product', 100, 9801), derived: true },
      ],
      relations: [
        placePart('t', 'a', 10, 'tens'),
        placePart('s', 'b', 10, 'tens'),
        {
          id: 'a = t + o',
          display: '{a} = {t} + {o}',
          vars: ['a', 't', 'o'],
          residual: (v: Values) => v.a! - v.t! - v.o!,
          solve: {
            a: (v: Values) => v.t! + v.o!,
            t: (v: Values) => v.a! - v.o!,
            o: (v: Values) => v.a! - v.t!,
          },
        },
        {
          id: 'b = s + r',
          display: '{b} = {s} + {r}',
          vars: ['b', 's', 'r'],
          residual: (v: Values) => v.b! - v.s! - v.r!,
          solve: {
            b: (v: Values) => v.s! + v.r!,
            s: (v: Values) => v.b! - v.r!,
            r: (v: Values) => v.b! - v.s!,
          },
        },
        p1.relation,
        p2.relation,
        p3.relation,
        p4.relation,
        {
          id: 'n = p + q + u + x',
          display: '{p} + {q} + {u} + {x} = {n}',
          vars: ['n', 'p', 'q', 'u', 'x'],
          residual: (v: Values) => v.n! - v.p! - v.q! - v.u! - v.x!,
          // The parts come from the factors, never from the product alone.
          solve: {
            n: (v: Values) => v.p! + v.q! + v.u! + v.x!,
            p: () => undefined,
            q: () => undefined,
            u: () => undefined,
            x: () => undefined,
          },
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
        't = tens of a': {
          t: { expr: '{a} without its ones', how: 'The tens of the first factor.' },
        },
        's = tens of b': {
          s: { expr: '{b} without its ones', how: 'The tens of the second factor.' },
        },
        'a = t + o': {
          o: {
            expr: '{a} − {t}',
            how: 'The ones of the first factor: what is left after the tens.',
          },
          t: { expr: '{a} − {o}', how: 'The tens of the first factor: take the ones away.' },
          a: { expr: '{t} + {o}', how: 'Put the tens and the ones back together.' },
        },
        'b = s + r': {
          r: {
            expr: '{b} − {s}',
            how: 'The ones of the second factor: what is left after the tens.',
          },
          s: { expr: '{b} − {r}', how: 'The tens of the second factor: take the ones away.' },
          b: { expr: '{s} + {r}', how: 'Put the tens and the ones back together.' },
        },
        'p = t × s': p1.steps,
        'q = o × s': p2.steps,
        'u = t × r': p3.steps,
        'x = o × r': p4.steps,
        'n = p + q + u + x': {
          n: {
            expr: '{p} + {q} + {u} + {x}',
            how: 'Add the four part products, biggest first.',
            work: (v) => addAll([v.p!, v.q!, v.u!, v.x!]),
          },
        },
        'n = a × b': {
          a: { expr: '{n} ÷ {b}', how: 'Divide the product by the second factor.' },
          b: { expr: '{n} ÷ {a}', how: 'Divide the product by the first factor.' },
        },
      },
      example: { a: 23, b: 14, t: 20, o: 3, s: 10, r: 4, p: 200, q: 30, u: 80, x: 12, n: 322 },
      startWith: ['a', 'b'],
      representation: {
        kind: 'areaModel',
        top: ['t', 'o'],
        side: ['s', 'r'],
        parts: [
          ['p', 'q'],
          ['u', 'x'],
        ],
        total: 'n',
      },
    } satisfies ModuleDef;
  })(),
  // ── 3-digit × 1-digit as a three-box area model (4.NBT.5) ──
  (() => {
    const p1 = partProduct('p', 'h', 'b', ['hundreds', 'second factor']);
    const p2 = partProduct('q', 't', 'b', ['tens', 'second factor']);
    const p3 = partProduct('u', 'o', 'b', ['ones', 'second factor']);
    return {
      id: 'm.4.multi-digit-multiply~three-digit',
      title: 'Three-digit times one-digit',
      use: 'Use this for 234 × 6 with a three-box area model.',
      assumptions: [
        'Break the first factor into hundreds, tens and ones: 234 = 200 + 30 + 4.',
        'Multiply each part by the second factor, then add the three part products.',
        'First factor from 100 to 999, second factor to 9.',
      ],
      variables: [
        whole('a', 'a', 'First factor', 100, 999),
        whole('b', 'b', 'Second factor', 1, 9),
        { ...whole('h', 'h', 'Hundreds', 100, 900), step: 100, multipleOf: 100, derived: true },
        { ...whole('t', 't', 'Tens', 0, 90), step: 10, multipleOf: 10, derived: true },
        { ...whole('o', 'o', 'Ones', 0, 9), derived: true },
        { ...whole('p', 'p', 'Hundreds × second', 100, 8100), derived: true },
        { ...whole('q', 'q', 'Tens × second', 0, 810), derived: true },
        { ...whole('u', 'u', 'Ones × second', 0, 81), derived: true },
        { ...whole('n', 'n', 'Product', 100, 8991), derived: true },
      ],
      relations: [
        placePart('h', 'a', 100, 'hundreds'),
        placePart('t', 'a', 10, 'tens'),
        {
          id: 'a = h + t + o',
          display: '{a} = {h} + {t} + {o}',
          vars: ['a', 'h', 't', 'o'],
          residual: (v: Values) => v.a! - v.h! - v.t! - v.o!,
          solve: {
            a: (v: Values) => v.h! + v.t! + v.o!,
            o: (v: Values) => v.a! - v.h! - v.t!,
            h: (v: Values) => v.a! - v.t! - v.o!,
            t: (v: Values) => v.a! - v.h! - v.o!,
          },
        },
        p1.relation,
        p2.relation,
        p3.relation,
        {
          id: 'n = p + q + u',
          display: '{p} + {q} + {u} = {n}',
          vars: ['n', 'p', 'q', 'u'],
          residual: (v: Values) => v.n! - v.p! - v.q! - v.u!,
          solve: {
            n: (v: Values) => v.p! + v.q! + v.u!,
            p: () => undefined,
            q: () => undefined,
            u: () => undefined,
          },
        },
        {
          id: 'n = a × b',
          display: '{a} × {b} = {n}',
          vars: ['n', 'a', 'b'],
          residual: (v: Values) => v.n! - v.a! * v.b!,
          solve: {
            n: () => undefined,
            a: (v: Values) => div(v.n!, v.b!),
            b: (v: Values) => div(v.n!, v.a!),
          },
        },
      ],
      steps: {
        'h = hundreds of a': {
          h: { expr: '{a} without its tens and ones', how: 'The hundreds of the first factor.' },
        },
        't = tens of a': {
          t: { expr: 'the tens in {a}', how: 'The tens of the first factor, without the ones.' },
        },
        'a = h + t + o': {
          o: {
            expr: '{a} − {h} − {t}',
            how: 'The ones: what is left after the hundreds and tens.',
          },
          h: { expr: '{a} − {t} − {o}', how: 'The hundreds: take the tens and ones away.' },
          t: { expr: '{a} − {h} − {o}', how: 'The tens: take the hundreds and ones away.' },
          a: { expr: '{h} + {t} + {o}', how: 'Put the three parts back together.' },
        },
        'p = h × b': p1.steps,
        'q = t × b': p2.steps,
        'u = o × b': p3.steps,
        'n = p + q + u': {
          n: {
            expr: '{p} + {q} + {u}',
            how: 'Add the three part products, biggest first.',
            work: (v) => addAll([v.p!, v.q!, v.u!]),
          },
        },
        'n = a × b': {
          a: { expr: '{n} ÷ {b}', how: 'Divide the product by the second factor.' },
          b: { expr: '{n} ÷ {a}', how: 'Divide the product by the first factor.' },
        },
      },
      example: { a: 234, b: 6, h: 200, t: 30, o: 4, p: 1200, q: 180, u: 24, n: 1404 },
      startWith: ['a', 'b'],
      representation: {
        kind: 'areaModel',
        top: ['h', 't', 'o'],
        side: ['b'],
        parts: [['p', 'q', 'u']],
        total: 'n',
      },
    } satisfies ModuleDef;
  })(),
  // ── Multiplicative comparison: times as many (4.OA.1, 4.OA.2) ──
  (() => {
    const cmp = times(
      'b = k × s',
      ['k', 's', 'b'],
      ['times as many', 'smaller amount', 'bigger amount'],
    );
    return {
      id: 'm.4.multi-digit-multiply~times-as-many',
      title: 'Times as many',
      use: 'Use this for “4 times as many” word problems.',
      assumptions: [
        '“3 times as many” means 3 equal groups of the smaller amount.',
        'Bigger amount = times × smaller amount. To find the times, divide.',
        '“3 times as many” is not “3 more”: 3 more is adding.',
      ],
      variables: [
        whole('s', 's', 'Smaller amount', 1, 99),
        whole('k', 'k', 'Times as many', 2, 10),
        whole('b', 'b', 'Bigger amount', 2, 990),
      ],
      relations: [
        {
          ...cmp.relation,
          check: (v: Values) =>
            `${v.k} × ${v.s} = ${v.b}, so ${v.b} is ${v.k} times as many as ${v.s}`,
        },
      ],
      steps: {
        'b = k × s': {
          b: {
            ...cmp.steps.b!,
            how: 'Multiply the smaller amount by the times: that many equal groups.',
            work: (v) => timesWork(v.k!, v.s!),
          },
          k: {
            ...cmp.steps.k!,
            how: 'Divide the bigger amount by the smaller: how many groups fit.',
            work: (v) => divideWork(v.b!, v.s!),
          },
          s: {
            ...cmp.steps.s!,
            how: 'Share the bigger amount into that many equal groups.',
            work: (v) => divideWork(v.b!, v.k!, 'second'),
          },
        },
      },
      example: { s: 6, k: 4, b: 24 },
      startWith: ['s', 'k'],
      representation: { kind: 'equalGroups', groups: 'k', each: 's', total: 'b' },
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
          `${d} × ${fmt(k)} = ${fmt(d * k)}, so ${fmt(k)} ${k === 1 ? 'group fits' : 'groups fit'}: ${fmt(left)} − ${fmt(d * k)} = ${fmt(left - d * k)}`,
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
        'Take out big chunks first: the biggest place that fits, then the next. Add the chunks.',
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
          m: {
            expr: '{q} × {d}',
            how: 'The groups times the divisor, by place: what was shared out.',
            work: (v) => placeTimesWork(v.q!, v.d!),
          },
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
  // ── Interpreting a remainder: round the quotient up (4.OA.3) ──
  {
    id: 'm.4.long-division~interpret-remainder',
    title: 'What to do with the remainder',
    use: 'Use this for “How many buses are needed?” when some are left over.',
    assumptions: [
      'Divide, then decide what the remainder means in the story.',
      'Buses or boxes needed: any left over need one more, so round the quotient up.',
      'Full teams or full boxes: drop the remainder. “How many are left?”: the remainder is the answer.',
      'Numbers to 999, divisors to 9.',
    ],
    variables: [
      whole('n', 'n', 'Total', 1, 999),
      whole('d', 'd', 'In each group', 2, 9),
      whole('q', 'q', 'Full groups', 0, 499),
      whole('r', 'r', 'Left over', 0, 8),
      { ...whole('m', 'm', 'In the full groups', 0, 999), derived: true },
      whole('u', 'u', 'Groups needed', 1, 500),
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
        id: 'q = full groups of d in n',
        display: '{n} ÷ {d} → {q} full groups',
        check: (v: Values) => `${v.n} ÷ ${v.d} = ${v.q} remainder ${v.n! % v.d!}`,
        vars: ['q', 'n', 'd'],
        residual: (v: Values) => v.q! - Math.floor(v.n! / v.d!),
        solve: {
          q: (v: Values) => Math.floor(v.n! / v.d!),
          n: () => undefined,
          d: () => undefined,
        },
      },
      {
        id: 'u = q, plus 1 if any are left',
        display: '{q} full groups and {r} left over: {u} groups needed',
        check: (v: Values) =>
          v.r! > 0
            ? `${v.q} full groups and 1 more for the ${v.r} left: ${v.u}`
            : `${v.q} full groups, none left: ${v.u}`,
        vars: ['u', 'q', 'r'],
        residual: (v: Values) => v.u! - v.q! - (v.r! > 0 ? 1 : 0),
        // Two quotient-and-remainder pairs give the same count: nothing is found from it.
        solve: {
          u: (v: Values) => v.q! + (v.r! > 0 ? 1 : 0),
          q: () => undefined,
          r: () => undefined,
        },
      },
    ],
    steps: {
      'r < d': {},
      'm = q × d': {
        m: {
          expr: '{q} × {d}',
          how: 'The full groups times the size of each: how many are in them.',
          work: (v) => timesWork(v.q!, v.d!),
        },
        q: { expr: '{m} ÷ {d}', how: 'Divide the number in the full groups by the group size.' },
        d: { expr: '{m} ÷ {q}', how: 'Divide the number in the full groups by the groups.' },
      },
      'n = m + r': {
        n: { expr: '{m} + {r}', how: 'The total is the full groups plus the leftover.' },
        m: { expr: '{n} − {r}', how: 'Take the leftover away from the total.' },
        r: { expr: '{n} − {m}', how: 'The leftover is what is not in a full group.' },
      },
      'q = full groups of d in n': {
        q: {
          expr: 'full groups of {d} in {n}',
          how: 'Divide. The whole-number part of the answer is the full groups.',
          work: (v) => divideWork(v.n! - (v.n! % v.d!), v.d!),
        },
      },
      'u = q, plus 1 if any are left': {
        u: {
          expr: (v) => (v.r! > 0 ? '{q} + 1' : '{q}'),
          how: 'Everyone needs a group. Any left over need one more group.',
          note: (v) =>
            v.r! > 0
              ? `(${v.r} left over can’t be left behind, so round up)`
              : '(nothing left over, so the full groups are enough)',
        },
      },
    },
    example: { n: 50, d: 8, q: 6, r: 2, m: 48, u: 7 },
    startWith: ['n', 'd'],
    pictureLabels: ['q'],
    representation: {
      kind: 'tape',
      parts: ['m', 'r'],
      total: 'n',
      groups: 'q',
      groupsPart: 'm',
      caption: '{q} full groups of {d} make {m}, and {r} left over: {u} groups needed.',
    },
  },
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
        'Fractions up to 1, with the bottoms Grade 4 uses: 2, 3, 4, 5, 6, 8, 10 and 12.',
      ],
      variables: [
        whole('a', 'a', 'First top', 1, 12),
        { ...whole('b', 'b', 'First bottom', 2, 12), allowed: [2, 3, 4, 5, 6, 8, 10, 12] },
        whole('c', 'c', 'Second top', 1, 12),
        { ...whole('d', 'd', 'Second bottom', 2, 12), allowed: [2, 3, 4, 5, 6, 8, 10, 12] },
        { ...whole('m', 'm', 'Common bottom', 4, 144), derived: true },
        { ...whole('p', 'p', 'First new top', 1, 144), derived: true },
        { ...whole('q', 'q', 'Second new top', 1, 144), derived: true },
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
  // ── Making an equivalent fraction (4.NF.1) ──
  (() => {
    const top = times('p = a × k', ['a', 'k', 'p'], ['top', 'factor', 'new top']);
    const bottom = times('m = b × k', ['b', 'k', 'm'], ['bottom', 'factor', 'new bottom']);
    return {
      id: 'm.4.fraction-equivalence~equivalent',
      title: 'Make an equivalent fraction',
      use: 'Use this for “3/4 = ?/12” and other equivalent fractions.',
      assumptions: [
        'Multiply the top and the bottom by the same number: the fraction keeps its size.',
        'Each part is cut into that many smaller parts, so there are more parts of the same whole.',
        'Fractions up to 1, bottoms to 12, factors to 6.',
      ],
      variables: [
        whole('a', 'a', 'Top', 1, 12),
        whole('b', 'b', 'Bottom', 2, 12),
        whole('k', 'k', 'Factor', 2, 6),
        whole('p', 'p', 'New top', 2, 72),
        whole('m', 'm', 'New bottom', 4, 72),
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
        top.relation,
        {
          ...bottom.relation,
          check: (v: Values) =>
            [v.a, v.b, v.p, v.m].every((x) => x !== undefined)
              ? `${v.b} × ${v.k} = ${v.m}, so ${v.a}/${v.b} = ${v.p}/${v.m}`
              : `${v.b} × ${v.k} = ${v.m}`,
        },
      ],
      steps: {
        'a ≤ b': {},
        'p = a × k': {
          ...top.steps,
          p: { ...top.steps.p!, how: 'Multiply the top by the factor.' },
          k: { ...top.steps.k!, how: 'Divide the new top by the top: the factor used.' },
        },
        'm = b × k': {
          ...bottom.steps,
          m: { ...bottom.steps.m!, how: 'Multiply the bottom by the same factor.' },
          k: { ...bottom.steps.k!, how: 'Divide the new bottom by the bottom: the factor used.' },
        },
      },
      example: { a: 3, b: 4, k: 3, p: 9, m: 12 },
      startWith: ['a', 'b', 'k'],
      representation: {
        kind: 'fractionBars',
        rows: [
          { num: 'a', den: 'b' },
          { num: 'p', den: 'm' },
        ],
        controls: ['a', 'b', 'k'],
        equal: true,
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
        vars: ['s', 'a', 'c'],
        shows: ['b'],
        residual: (v: Values) => v.s! - v.a! - v.c!,
        solve: {
          s: (v: Values) => v.a! + v.c!,
          a: (v: Values) => v.s! - v.c!,
          c: (v: Values) => v.s! - v.a!,
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
        display: 'full wholes in {s}/{b}: {w}',
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
    representation: {
      kind: 'fractionLine',
      numerator: 's',
      denominator: 'b',
      wholes: 2,
      parts: ['a', 'c'],
    },
  },
  // ── Subtracting fractions with like denominators (4.NF.3a) ──
  {
    id: 'm.4.add-fractions-like~subtract',
    title: 'Subtract fractions with the same bottom',
    use: 'Use this for 7/8 − 3/8 and other same-bottom subtraction.',
    assumptions: [
      'Same bottom means same-size parts: take away the tops, keep the bottom.',
      'The first fraction is at least as big as the second, and at most 1.',
      'Bottoms from 2 to 12.',
    ],
    variables: [
      whole('b', 'b', 'Parts in one whole', 2, 12),
      whole('a', 'a', 'First top', 1, 12),
      whole('c', 'c', 'Second top', 0, 12),
      whole('s', 's', 'Top of the difference', 0, 12),
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
        id: 'c ≤ a',
        constraint: true,
        display: '{c}/{b} is at most {a}/{b}',
        vars: ['c', 'a', 'b'],
        residual: (v: Values) => (v.c! <= v.a! ? 0 : 1),
        solve: {},
      },
      {
        id: 's = a − c',
        display: '{a}/{b} − {c}/{b} = {s}/{b}',
        check: (v: Values) => `${v.a} − ${v.c} = ${v.s}`,
        vars: ['s', 'a', 'c'],
        shows: ['b'],
        residual: (v: Values) => v.s! - v.a! + v.c!,
        solve: {
          s: (v: Values) => v.a! - v.c!,
          a: (v: Values) => v.s! + v.c!,
          c: (v: Values) => v.a! - v.s!,
        },
      },
    ],
    steps: {
      'a ≤ b': {},
      'c ≤ a': {},
      's = a − c': {
        s: {
          expr: '{a} − {c}',
          how: 'Take the second top from the first. The bottom stays.',
          work: (v) =>
            v.b === undefined
              ? [`${v.a} − ${v.c} = ${v.s}`]
              : [`${v.a} − ${v.c} = ${v.s}, so ${v.s}/${v.b}`],
        },
        a: {
          expr: '{s} + {c}',
          how: 'Add the difference and the second top to get the first top back.',
          work: (v) => addStrategy(v.s!, v.c!),
        },
        c: {
          expr: '{a} − {s}',
          how: 'Take the difference away from the first top.',
        },
      },
    },
    example: { b: 8, a: 7, c: 3, s: 4 },
    startWith: ['b', 'a', 'c'],
    representation: {
      kind: 'fractionBars',
      rows: [
        { num: 'a', den: 'b' },
        { num: 'c', den: 'b' },
        { num: 's', den: 'b' },
      ],
      controls: ['a', 'b', 'c'],
    },
  },
  // ── Mixed numbers as fractions (4.NF.3b, 4.NF.3c) ──
  {
    id: 'm.4.add-fractions-like~mixed',
    title: 'Mixed numbers as fractions',
    use: 'Use this to write 2 and 3/4 as 11/4, or 11/4 as a mixed number.',
    assumptions: [
      'A mixed number is wholes and a fraction: 2 and 3/4.',
      'Each whole is all the parts: 2 wholes in quarters is 2 × 4 = 8 quarters. Add the extra parts.',
      'Wholes to 3, bottoms from 2 to 12; the fraction part is less than 1.',
    ],
    variables: [
      whole('w', 'w', 'Wholes', 0, 3),
      whole('b', 'b', 'Parts in one whole', 2, 12),
      whole('r', 'r', 'Extra parts', 0, 11),
      whole('s', 's', 'Parts in all', 0, 47),
    ],
    relations: [
      {
        id: 'r < b',
        constraint: true,
        display: '{r}/{b} is less than 1',
        vars: ['r', 'b'],
        residual: (v: Values) => (v.r! < v.b! ? 0 : 1),
        solve: {},
      },
      {
        id: 's = w × b + r',
        display: '{w} wholes and {r}/{b} = {s}/{b}',
        check: (v: Values) => `${v.w} × ${v.b} + ${v.r} = ${v.s}`,
        vars: ['s', 'w', 'b', 'r'],
        residual: (v: Values) => v.s! - v.w! * v.b! - v.r!,
        solve: {
          s: (v: Values) => v.w! * v.b! + v.r!,
          r: (v: Values) => v.s! - v.w! * v.b!,
          w: (v: Values) => div(v.s! - v.r!, v.b!),
          b: () => undefined,
        },
      },
    ],
    steps: {
      'r < b': {},
      's = w × b + r': {
        s: {
          expr: '{w} × {b} + {r}',
          how: 'Each whole is that many parts. Multiply, then add the extra parts.',
          work: (v) => [
            `${v.w} wholes = ${v.w} × ${v.b} = ${v.w! * v.b!} parts`,
            `${v.w! * v.b!} + ${v.r} = ${v.s}, so ${v.s}/${v.b}`,
          ],
        },
        r: {
          expr: '{s} − {w} × {b}',
          how: 'Take out the parts that make the wholes. The rest are the extra parts.',
          work: (v) => [`${v.w} × ${v.b} = ${v.w! * v.b!}`, `${v.s} − ${v.w! * v.b!} = ${v.r}`],
        },
        w: {
          expr: '({s} − {r}) ÷ {b}',
          how: 'Take the extra parts away. Every full set of parts is one whole.',
          work: (v) => [`${v.s} − ${v.r} = ${v.s! - v.r!}`, `${v.s! - v.r!} ÷ ${v.b} = ${v.w}`],
        },
      },
    },
    example: { w: 2, b: 4, r: 3, s: 11 },
    startWith: ['w', 'b', 'r'],
    representation: { kind: 'fractionLine', numerator: 's', denominator: 'b', wholes: 3 },
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
        vars: ['p', 'n', 'a'],
        shows: ['b'],
        residual: (v: Values) => v.p! - v.n! * v.a!,
        solve: {
          p: (v: Values) => v.n! * v.a!,
          n: (v: Values) => div(v.p!, v.a!),
          a: (v: Values) => div(v.p!, v.n!),
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
        display: 'full wholes in {p}/{b}: {w}',
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
            v.n! >= 2 && v.n! <= 6 && v.b !== undefined
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
    representation: {
      kind: 'fractionLine',
      numerator: 'p',
      denominator: 'b',
      wholes: 3,
      copies: 'n',
    },
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
      whole('t', 't', 'Tenths digit', 0, 9),
      whole('u', 'u', 'Hundredths digit', 0, 9),
      whole('h', 'h', 'Hundredths in all', 0, 99),
      { id: 'd', symbol: 'd', name: 'As a decimal', min: 0, max: 0.99, step: 0.01 },
    ],
    relations: [
      {
        id: 'h = 10 × t + u',
        display: '{t}/10 + {u}/100 = {h}/100',
        check: (v: Values) => `10 × ${v.t} + ${v.u} = ${v.h}`,
        vars: ['h', 't', 'u'],
        residual: (v: Values) => v.h! - 10 * v.t! - v.u!,
        solve: {
          h: (v: Values) => 10 * v.t! + v.u!,
          t: (v: Values) => (v.h! - v.u!) / 10,
          u: (v: Values) => v.h! - 10 * v.t!,
        },
      },
      {
        id: 't = tenths in h',
        display: '{h} hundredths has {t} full tenths',
        vars: ['t', 'h'],
        residual: (v: Values) => v.t! - Math.floor(v.h! / 10),
        // Every count from 30 to 39 has 3 full tenths: the hundredths can't be found from it.
        solve: { t: (v: Values) => Math.floor(v.h! / 10), h: () => undefined },
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
      't = tenths in h': {
        t: {
          expr: 'full tenths in {h}',
          how: 'Every 10 hundredths is a tenth. The tens digit of the hundredths counts them.',
          work: (v) => [`${v.h} = ${10 * v.t!} + ${v.h! - 10 * v.t!}: ${v.t} full tenths`],
        },
      },
      'd = h ÷ 100': {
        d: {
          expr: '{h} ÷ 100',
          how: 'Hundredths go two places after the point: the tenths digit, then the hundredths digit.',
          work: (v) => [`${v.h} hundredths = 0.${String(v.h).padStart(2, '0')}`],
        },
        h: {
          expr: 'hundredths in {d}',
          how: 'Read the two digits after the point as hundredths.',
          work: (v) => [`${v.d} = ${v.h} hundredths`],
        },
      },
    },
    example: { t: 3, u: 4, h: 34, d: 0.34 },
    startWith: ['t', 'u'],
    representation: { kind: 'grid100', percent: 'h' },
  },
  // ── Comparing decimals to hundredths (4.NF.7) ──
  (() => {
    const gap = apart(
      'g',
      'a',
      'c',
      ['first number of hundredths', 'second number of hundredths'],
      ['bigger', 'smaller'],
      'Take the smaller number of hundredths away from the bigger one.',
      false,
    );
    return {
      id: 'm.4.decimals-intro~compare',
      title: 'Compare decimals',
      use: 'Use this to compare two decimals, like 0.4 and 0.35.',
      assumptions: [
        'Write both decimals as hundredths: 0.4 is 40 hundredths, 0.35 is 35 hundredths.',
        'Then compare the hundredths like whole numbers.',
        'Decimals from 0 to 0.99.',
      ],
      variables: [
        { id: 'x', symbol: 'x', name: 'First decimal', min: 0, max: 0.99, step: 0.01 },
        { id: 'y', symbol: 'y', name: 'Second decimal', min: 0, max: 0.99, step: 0.01 },
        whole('a', 'a', 'First as hundredths', 0, 99),
        whole('c', 'c', 'Second as hundredths', 0, 99),
        whole('g', 'g', 'Hundredths apart', 0, 99),
      ],
      relations: [
        {
          id: 'a = x × 100',
          display: '{x} = {a}/100',
          vars: ['a', 'x'],
          residual: (v: Values) => v.a! - v.x! * 100,
          solve: { a: (v: Values) => v.x! * 100, x: (v: Values) => v.a! / 100 },
        },
        {
          id: 'c = y × 100',
          display: '{y} = {c}/100',
          vars: ['c', 'y'],
          residual: (v: Values) => v.c! - v.y! * 100,
          solve: { c: (v: Values) => v.y! * 100, y: (v: Values) => v.c! / 100 },
        },
        {
          ...gap.relation,
          check: (v: Values) =>
            `${v.a} ${v.a! < v.c! ? '<' : v.a! > v.c! ? '>' : '='} ${v.c}, so ${v.x} ${v.a! < v.c! ? '<' : v.a! > v.c! ? '>' : '='} ${v.y}`,
        },
      ],
      steps: {
        'a = x × 100': {
          a: {
            expr: 'hundredths in {x}',
            how: 'Read the two digits after the point as hundredths. One digit: add a 0.',
            work: (v) => [`${v.x} = ${v.x!.toFixed(2)} = ${v.a} hundredths`],
          },
          x: {
            expr: '{a} ÷ 100',
            how: 'Hundredths go two places after the point.',
            work: (v) => [`${v.a} hundredths = 0.${String(v.a).padStart(2, '0')}`],
          },
        },
        'c = y × 100': {
          c: {
            expr: 'hundredths in {y}',
            how: 'Read the two digits after the point as hundredths. One digit: add a 0.',
            work: (v) => [`${v.y} = ${v.y!.toFixed(2)} = ${v.c} hundredths`],
          },
          y: {
            expr: '{c} ÷ 100',
            how: 'Hundredths go two places after the point.',
            work: (v) => [`${v.c} hundredths = 0.${String(v.c).padStart(2, '0')}`],
          },
        },
        [gap.relation.id]: gap.steps,
      },
      example: { x: 0.4, y: 0.35, a: 40, c: 35, g: 5 },
      startWith: ['x', 'y'],
      representation: {
        kind: 'tape',
        compare: ['a', 'c'],
        difference: 'g',
        caption: '{x} is {a} hundredths and {y} is {c} hundredths: {g} apart.',
      },
    } satisfies ModuleDef;
  })(),
  // ── Converting units within one system: a conversion table (4.MD.1) ──
  (() => {
    const fmt = (x: number) => formatNumber(x);
    const PAIRS: Record<number, string> = {
      3: '1 yard = 3 feet',
      7: '1 week = 7 days',
      10: '1 centimeter = 10 millimeters',
      12: '1 foot = 12 inches',
      16: '1 pound = 16 ounces',
      24: '1 day = 24 hours',
      60: '1 hour = 60 minutes',
      100: '1 meter = 100 centimeters',
      1000: '1 kilometer = 1,000 meters (or 1 kilogram = 1,000 grams, 1 liter = 1,000 milliliters)',
    };
    return {
      id: 'm.4.unit-conversion',
      assumptions: [
        'A bigger unit is a fixed number of smaller units: 1 foot = 12 inches, 1 hour = 60 minutes.',
        'Also 1 yard = 3 feet, 1 week = 7 days, 1 day = 24 hours, 1 pound = 16 ounces, 1 centimeter = 10 millimeters, 1 meter = 100 centimeters.',
        '1 kilometer, 1 kilogram or 1 liter is 1,000 of the smaller unit.',
        'To change bigger units into smaller ones, multiply by that number. A table shows the pattern.',
        'Tap a row of the table to pick how many bigger units.',
      ],
      variables: [
        whole('b', 'b', 'Bigger units', 1, 12),
        {
          ...whole('k', 'k', 'Smaller units in 1 bigger unit', 3, 1000),
          allowed: [3, 7, 10, 12, 16, 24, 60, 100, 1000],
        },
        whole('s', 's', 'Smaller units', 3, 12000),
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
        named: { param: 'k', names: PAIRS },
      },
    } satisfies ModuleDef;
  })(),
  // ── Converting on a double number line (4.MD.1) ──
  (() => {
    const conv = times(
      's = b × k',
      ['b', 'k', 's'],
      ['bigger units', 'smaller units in one', 'smaller units'],
    );
    return {
      id: 'm.4.unit-conversion~double-line',
      title: 'Convert on a double number line',
      use: 'Use this to convert units by reading a double number line.',
      assumptions: [
        'The top line counts bigger units. The bottom line counts smaller units.',
        'Each 1 on the top sits over the number of smaller units in one bigger unit.',
        'Read straight down from the bigger units to find the smaller units.',
      ],
      variables: [
        whole('b', 'b', 'Bigger units', 1, 12),
        {
          ...whole('k', 'k', 'Smaller units in 1 bigger unit', 3, 100),
          allowed: [3, 7, 10, 12, 16, 24, 60, 100],
        },
        whole('s', 's', 'Smaller units', 3, 1200),
      ],
      relations: [conv.relation],
      steps: {
        's = b × k': {
          ...conv.steps,
          s: { ...conv.steps.s!, how: 'Each bigger unit is that many smaller units. Multiply.' },
          b: {
            ...conv.steps.b!,
            how: 'Divide the smaller units by the number in one bigger unit.',
          },
          k: { ...conv.steps.k!, how: 'Divide the smaller units by the bigger units.' },
        },
      },
      example: { b: 3, k: 12, s: 36 },
      startWith: ['k', 'b'],
      representation: { kind: 'doubleNumberLine', top: 'b', bottom: 's', per: 'k', ticks: 6 },
    } satisfies ModuleDef;
  })(),
  // ── Two units together: 3 feet 5 inches as inches (4.MD.1, 4.MD.2) ──
  (() => {
    const PAIRS: Record<number, string> = {
      3: '1 yard = 3 feet',
      7: '1 week = 7 days',
      12: '1 foot = 12 inches',
      16: '1 pound = 16 ounces',
      24: '1 day = 24 hours',
      60: '1 hour = 60 minutes',
      100: '1 meter = 100 centimeters',
    };
    return {
      id: 'm.4.unit-conversion~two-units',
      title: 'Bigger units and some more',
      use: 'Use this for 3 feet 5 inches as inches, or 2 hours 15 minutes as minutes.',
      assumptions: [
        'A measurement can mix units: 3 feet 5 inches, or 2 hours 15 minutes.',
        'Change the bigger units to smaller ones, then add the extra smaller units.',
        'The extra is less than one bigger unit.',
      ],
      variables: [
        whole('b', 'b', 'Bigger units', 1, 9),
        {
          ...whole('k', 'k', 'Smaller units in one bigger', 3, 100),
          allowed: [3, 7, 12, 16, 24, 60, 100],
        },
        whole('e', 'e', 'Extra smaller units', 0, 99),
        { ...whole('m', 'm', 'From the bigger units', 3, 900), derived: true },
        whole('t', 't', 'Smaller units in all', 3, 999),
      ],
      relations: [
        {
          id: 'e < k',
          constraint: true,
          display: 'The extra {e} is less than {k}',
          vars: ['e', 'k'],
          residual: (v: Values) => (v.e! < v.k! ? 0 : 1),
          solve: {},
        },
        {
          id: 'm = b × k',
          display: '{b} × {k} = {m}',
          vars: ['m', 'b', 'k'],
          residual: (v: Values) => v.m! - v.b! * v.k!,
          solve: {
            m: (v: Values) => v.b! * v.k!,
            b: (v: Values) => div(v.m!, v.k!),
            k: (v: Values) => div(v.m!, v.b!),
          },
        },
        {
          id: 't = m + e',
          display: '{m} + {e} = {t}',
          vars: ['t', 'm', 'e'],
          residual: (v: Values) => v.t! - v.m! - v.e!,
          solve: {
            t: (v: Values) => v.m! + v.e!,
            m: (v: Values) => v.t! - v.e!,
            e: (v: Values) => v.t! - v.m!,
          },
        },
      ],
      steps: {
        'e < k': {},
        'm = b × k': {
          m: {
            expr: '{b} × {k}',
            how: 'Each bigger unit is that many smaller units. Multiply.',
            work: (v) => timesWork(v.b!, v.k!),
            note: (v) => (PAIRS[v.k!] ? `(${PAIRS[v.k!]})` : ''),
          },
          b: { expr: '{m} ÷ {k}', how: 'Divide by the number of smaller units in one bigger.' },
          k: { expr: '{m} ÷ {b}', how: 'Divide by the number of bigger units.' },
        },
        't = m + e': {
          t: {
            expr: '{m} + {e}',
            how: 'Add the extra smaller units.',
            work: (v) => addStrategy(v.m!, v.e!),
          },
          m: { expr: '{t} − {e}', how: 'Take the extra away: what the bigger units made.' },
          e: { expr: '{t} − {m}', how: 'Take away what the bigger units made: the extra.' },
        },
      },
      example: { b: 3, k: 12, e: 5, m: 36, t: 41 },
      startWith: ['k', 'b', 'e'],
      representation: {
        kind: 'tape',
        parts: ['m', 'e'],
        total: 't',
        groups: 'b',
        groupsPart: 'm',
        caption: '{b} bigger units of {k} make {m}, and {e} more: {t} in all.',
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
        'Whole-number sides up to 30.',
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
  // ── Angles: degrees as parts of a turn, and angle addition (4.MD.5, 4.MD.7) ──
  {
    id: 'm.4.angles',
    assumptions: [
      'A full turn is 360 degrees. One degree is 1/360 of a turn.',
      'A right angle is 90°: a quarter turn. A straight angle is 180°: a half turn.',
      'Two angles that share a vertex and a ray add up: the whole angle is their sum.',
      'Drag the middle ray, or use the sliders, to change the angles.',
    ],
    variables: [
      { ...whole('a', 'a', 'First angle', 1, 179), unit: '°' },
      { ...whole('b', 'b', 'Second angle', 1, 179), unit: '°' },
      { ...whole('w', 'w', 'Whole angle', 2, 358), unit: '°' },
    ],
    relations: [
      {
        id: 'w = a + b',
        display: '{a} + {b} = {w}',
        vars: ['w', 'a', 'b'],
        residual: (v: Values) => v.w! - v.a! - v.b!,
        solve: {
          w: (v: Values) => v.a! + v.b!,
          a: (v: Values) => v.w! - v.b!,
          b: (v: Values) => v.w! - v.a!,
        },
      },
    ],
    steps: {
      'w = a + b': {
        w: {
          expr: '{a} + {b}',
          how: 'Add the two angles: they share a ray, so together they make the whole angle.',
          work: (v) => addStrategy(v.a!, v.b!, '°'),
          note: (v) =>
            v.w! === 90
              ? '(a right angle)'
              : v.w! === 180
                ? '(a straight angle)'
                : v.w! < 90
                  ? '(acute: less than a right angle)'
                  : v.w! < 180
                    ? '(obtuse: more than a right angle, less than a straight one)'
                    : '(more than a straight angle)',
        },
        a: {
          expr: '{w} − {b}',
          how: 'Take the second angle away from the whole angle.',
          work: (v) => subtractStrategy(v.w!, v.b!, '°'),
        },
        b: {
          expr: '{w} − {a}',
          how: 'Take the first angle away from the whole angle.',
          work: (v) => subtractStrategy(v.w!, v.a!, '°'),
        },
      },
    },
    example: { a: 35, b: 55, w: 90 },
    startWith: ['a', 'b'],
    representation: { kind: 'angles', parts: ['a', 'b'], whole: 'w' },
  },
  // ── Reading a protractor (4.MD.6) ──
  {
    id: 'm.4.angles~protractor',
    title: 'Read a protractor',
    use: 'Use this to read an angle on a protractor, either scale.',
    assumptions: [
      'Put the centre of the protractor on the corner and one arm along the 0° line.',
      'Read the scale that starts at 0 on that arm. The other scale reads 180° minus the angle.',
      'Angles from 0° to 180°.',
    ],
    variables: [
      { ...whole('a', 'a', 'Angle', 0, 180), unit: '°' },
      { ...whole('r', 'r', 'Outer scale reading', 0, 180), unit: '°' },
    ],
    relations: [
      {
        id: 'r = 180 − a',
        display: '180 − {a} = {r}',
        vars: ['r', 'a'],
        residual: (v: Values) => v.r! - 180 + v.a!,
        solve: { r: (v: Values) => 180 - v.a!, a: (v: Values) => 180 - v.r! },
      },
    ],
    steps: {
      'r = 180 − a': {
        r: {
          expr: '180 − {a}',
          how: 'The outer scale counts from the other end of the protractor.',
        },
        a: {
          expr: '180 − {r}',
          how: 'The inner scale counts from the flat arm: take the outer reading from 180.',
        },
      },
    },
    example: { a: 35, r: 145 },
    startWith: ['a'],
    representation: { kind: 'protractor', angle: 'a', other: 'r' },
  },
  // ── Angles as fractions of a turn (4.MD.5) ──
  {
    id: 'm.4.angles~turns',
    title: 'Angles as parts of a turn',
    use: 'Use this for “a quarter turn is how many degrees?”',
    assumptions: [
      'A full turn is 360°. Cut the turn into equal parts: a quarter turn is 360 ÷ 4 = 90°.',
      'An angle that is some of those parts is that many times the part: 3 quarter turns is 270°.',
      'The turn is cut into 2, 3, 4, 6, 8 or 12 equal parts.',
    ],
    variables: [
      { ...whole('k', 'k', 'Equal parts of the turn', 2, 12), allowed: [2, 3, 4, 6, 8, 12] },
      whole('n', 'n', 'Parts in the angle', 1, 12),
      { ...whole('e', 'e', 'One part', 30, 180), unit: '°', derived: true },
      { ...whole('a', 'a', 'Angle', 30, 360), unit: '°' },
      { ...whole('r', 'r', 'Rest of the turn', 0, 330), unit: '°', derived: true },
      { ...whole('w', 'w', 'Full turn', 360, 360), unit: '°', allowed: [360], derived: true },
    ],
    relations: [
      {
        id: 'n ≤ k',
        constraint: true,
        display: '{n} parts is at most the whole turn of {k}',
        vars: ['n', 'k'],
        residual: (v: Values) => (v.n! <= v.k! ? 0 : 1),
        solve: {},
      },
      {
        id: 'e = 360 ÷ k',
        display: '360 ÷ {k} = {e}',
        vars: ['e', 'k'],
        residual: (v: Values) => v.e! - 360 / v.k!,
        solve: { e: (v: Values) => 360 / v.k!, k: (v: Values) => div(360, v.e!) },
      },
      {
        id: 'a = n × e',
        display: '{n} × {e} = {a}',
        check: (v: Values) => `${v.a}° is ${v.n}/${v.k} of a turn`,
        vars: ['a', 'n', 'e'],
        residual: (v: Values) => v.a! - v.n! * v.e!,
        solve: {
          a: (v: Values) => v.n! * v.e!,
          n: (v: Values) => div(v.a!, v.e!),
          e: (v: Values) => div(v.a!, v.n!),
        },
      },
      {
        id: 'w = a + r',
        display: '{a} + {r} = {w}',
        vars: ['w', 'a', 'r'],
        residual: (v: Values) => v.w! - v.a! - v.r!,
        solve: {
          w: (v: Values) => v.a! + v.r!,
          r: (v: Values) => v.w! - v.a!,
          a: (v: Values) => v.w! - v.r!,
        },
      },
    ],
    steps: {
      'n ≤ k': {},
      'e = 360 ÷ k': {
        e: {
          expr: '360 ÷ {k}',
          how: 'Share the full turn into equal parts.',
          work: (v) => divideWork(360, v.k!),
        },
        k: { expr: '360 ÷ {e}', how: 'How many of that part fill the turn.' },
      },
      'a = n × e': {
        a: {
          expr: '{n} × {e}',
          how: 'That many parts, each the same size.',
          work: (v) => timesWork(v.n!, v.e!),
        },
        n: { expr: '{a} ÷ {e}', how: 'How many parts fit in the angle.' },
        e: { expr: '{a} ÷ {n}', how: 'Share the angle into its parts.' },
      },
      'w = a + r': {
        w: { expr: '{a} + {r}', how: 'The angle and the rest make the full turn.' },
        r: { expr: '{w} − {a}', how: 'What is left of the full turn.' },
        a: { expr: '{w} − {r}', how: 'Take the rest away from the full turn.' },
      },
    },
    example: { k: 4, n: 3, e: 90, a: 270, r: 90, w: 360 },
    startWith: ['k', 'n'],
    representation: { kind: 'angles', parts: ['a', 'r'], whole: 'w', sliders: ['k', 'n'] },
  },
];
