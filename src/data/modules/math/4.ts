/**
 * Grade 4 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { formatNumber, numberWords } from '@/engine/format';
import type { Values } from '@/engine/types';
import { apart, div, times, whole } from '../helpers';
import type { ModuleDef } from '../types';
import { autoWritten, longDivision, partialQuotients } from '../written';
import { addStrategy, divideWork, placeCompareLines, subtractStrategy, timesWork } from '../work';

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

/** The first factor rounded to its biggest place: 4,327 → 4,000; 68 → 70. */
const roughly = (x: number) => {
  const p = 10 ** (String(Math.round(x)).length - 1);
  return Math.round(x / p) * p;
};
/** "4,327 = 4,000 + 300 + 20 + 7" (a number split into its places), or nothing for one place. */
const splitLine = (x: number) => {
  const parts = String(x)
    .split('')
    .map((d, i, all) => Number(d) * 10 ** (all.length - 1 - i))
    .filter((p) => p > 0);
  return parts.length > 1 ? [`${fmt(x)} = ${parts.map(fmt).join(' + ')}`] : [];
};

/**
 * First factor × second factor = product: the split into places, the partial-products grid
 * (Grade 4), the area model drawn from the two factors, and an estimate to check.
 */
function multiplyPage(o: {
  id: string;
  title?: string;
  use?: string;
  assumptions: string[];
  first: [number, number];
  second: [number, number];
  example: [number, number];
}): ModuleDef {
  const [x, y] = o.example;
  return {
    id: o.id,
    ...(o.title ? { title: o.title, use: o.use } : {}),
    assumptions: o.assumptions,
    variables: [
      whole('a', 'a', 'First factor', ...o.first),
      whole('b', 'b', 'Second factor', ...o.second),
      whole('n', 'n', 'Product', 0, o.first[1] * o.second[1]),
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
    ],
    steps: {
      'n = a × b': {
        n: {
          expr: '{a} × {b}',
          how: 'Break the factors into places. Multiply every part, then add the partial products.',
          work: (v) => [...splitLine(v.a!), ...(v.b! >= 10 ? splitLine(v.b!) : [])],
          written: (v) => autoWritten('4', `${v.a} × ${v.b}`),
          note: (v) => {
            const [ra, rb] = [roughly(v.a!), v.b! >= 10 ? roughly(v.b!) : v.b!];
            return `(about ${fmt(ra)} × ${fmt(rb)} = ${fmt(ra * rb)})`;
          },
        },
        a: {
          expr: '{n} ÷ {b}',
          how: 'Divide the product by the second factor.',
        },
        b: {
          expr: '{n} ÷ {a}',
          how: 'Which number times the first factor makes the product? Estimate, then check.',
          work: (v) => [`${fmt(v.a!)} × ${v.b} = ${fmt(v.n!)}`],
        },
      },
    },
    example: { a: x, b: y, n: x * y },
    startWith: ['a', 'b'],
    representation: { kind: 'areaModel', factors: ['a', 'b'], total: 'n' },
  };
}

export const MATH_4_MODULES: ModuleDef[] = [
  // ── Factors, multiples, primes and composites (4.OA.4) ──
  {
    id: 'm.4.factors-multiples',
    assumptions: [
      'A factor pair is two whole numbers that multiply to make the number.',
      'Find every pair by trying 1, 2, 3, … until the factors would swap places.',
      'A prime number has exactly 2 factors: 1 and itself. A composite number has more.',
      'The picture shows every factor pair as a rectangle. A prime number has only one.',
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
        words: 'Count every factor of the number = {f}',
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
    representation: { kind: 'factorPairs', value: 'n', first: 'a', second: 'b', count: 'f' },
  },
  // ── Multiples: is a number a multiple of a one-digit number? (4.OA.4) ──
  {
    id: 'm.4.factors-multiples~multiples',
    title: 'Is it a multiple?',
    use: 'Use this for “Is 40 a multiple of 8?”: divide and look at the remainder.',
    assumptions: [
      'A multiple of 8 is 8 times a whole number: 8, 16, 24, 32 and so on.',
      'To check, divide. A remainder of 0 means it is a multiple.',
      'The chart shades every multiple and outlines the number you test.',
    ],
    variables: [
      whole('k', 'k', 'One-digit number', 2, 9),
      whole('n', 'n', 'Number to test', 1, 100),
      { ...whole('q', 'q', 'Quotient', 0, 50), derived: true },
      { ...whole('r', 'r', 'Remainder', 0, 8), derived: true },
    ],
    relations: [
      {
        id: 'q = whole groups of k in n',
        display: '{n} ÷ {k} → {q} whole groups',
        words: 'Number to test ÷ one-digit number = {q}, with a remainder',
        vars: ['q', 'n', 'k'],
        residual: (v: Values) => v.q! - Math.floor(v.n! / v.k!),
        solve: {
          q: (v: Values) => Math.floor(v.n! / v.k!),
          n: () => undefined,
          k: () => undefined,
        },
      },
      {
        id: 'r = left over when n is shared by k',
        display: 'left over when {n} is shared by {k} = {r}',
        words: 'What is left after the whole groups = {r}',
        vars: ['r', 'n', 'k'],
        residual: (v: Values) => v.r! - (v.n! % v.k!),
        solve: { r: (v: Values) => v.n! % v.k!, n: () => undefined, k: () => undefined },
      },
    ],
    steps: {
      'q = whole groups of k in n': {
        q: {
          expr: 'whole groups of {k} in {n}',
          how: 'Divide by the one-digit number. Use a times fact you know.',
          work: (v) => {
            const m = v.q! * v.k!;
            return [`${v.q} × ${v.k} = ${m}`, ...(m < v.n! ? [`${v.n} − ${m} = ${v.n! - m}`] : [])];
          },
        },
      },
      'r = left over when n is shared by k': {
        r: {
          expr: 'left over when {n} is shared by {k}',
          how: 'The remainder is what the whole groups leave.',
          work: (v) => {
            const m = Math.floor(v.n! / v.k!) * v.k!;
            return [`${v.n} − ${m} = ${v.r}`];
          },
          note: (v) =>
            v.r === 0
              ? `(remainder 0: ${v.n} is a multiple of ${v.k})`
              : `(remainder ${v.r}: ${v.n} is not a multiple of ${v.k})`,
        },
      },
    },
    example: { k: 8, n: 40, q: 5, r: 0 },
    startWith: ['k', 'n'],
    representation: { kind: 'hundredChart', value: 'n', max: 100, multiplesOf: 'k' },
  },
  // ── Patterns that add the same number each time (4.OA.5) ──
  {
    id: 'm.4.factors-multiples~pattern',
    title: 'Number patterns',
    use: 'Use this to find a term of a pattern that adds the same number each time.',
    assumptions: [
      'A pattern starts at a number and adds the same amount at each jump.',
      'Adding an odd number makes the terms go odd, even, odd, even.',
      'Adding an even number keeps them all odd or all even.',
    ],
    variables: [
      whole('a', 'a', 'Start', 0, 100),
      whole('s', 's', 'Add each time', 1, 25),
      whole('j', 'j', 'Jumps', 0, 11),
      whole('t', 't', 'Term', 0, 375),
    ],
    relations: [
      {
        id: 't = a + j × s',
        display: '{a} + {j} × {s} = {t}',
        words: 'Start + jumps × add each time = term',
        vars: ['t', 'a', 'j', 's'],
        residual: (v: Values) => v.t! - v.a! - v.j! * v.s!,
        solve: {
          t: (v: Values) => v.a! + v.j! * v.s!,
          a: (v: Values) => v.t! - v.j! * v.s!,
          j: (v: Values) => div(v.t! - v.a!, v.s!),
          s: (v: Values) => div(v.t! - v.a!, v.j!),
        },
      },
    ],
    steps: {
      't = a + j × s': {
        t: {
          expr: '{a} + {j} × {s}',
          how: 'Multiply the jumps by the amount added, then add the start.',
          work: (v) => [`${v.j} × ${v.s} = ${v.j! * v.s!}`, `${v.a} + ${v.j! * v.s!} = ${v.t}`],
          note: (v) => (v.s! % 2 === 1 ? '(adding an odd number: odd and even take turns)' : ''),
        },
        a: {
          expr: '{t} − {j} × {s}',
          how: 'Take everything the jumps added away from the term.',
          work: (v) => [`${v.j} × ${v.s} = ${v.j! * v.s!}`, `${v.t} − ${v.j! * v.s!} = ${v.a}`],
        },
        j: {
          expr: '({t} − {a}) ÷ {s}',
          how: 'Find how much the jumps added, then divide by the amount each jump adds.',
          work: (v) => [`${v.t} − ${v.a} = ${v.t! - v.a!}`, `${v.t! - v.a!} ÷ ${v.s} = ${v.j}`],
        },
        s: {
          expr: '({t} − {a}) ÷ {j}',
          how: 'Find how much the jumps added, then share it among the jumps.',
          work: (v) => [`${v.t} − ${v.a} = ${v.t! - v.a!}`, `${v.t! - v.a!} ÷ ${v.j} = ${v.s}`],
        },
      },
    },
    example: { a: 3, s: 5, j: 5, t: 28 },
    startWith: ['a', 's', 'j'],
    representation: { kind: 'skipCount', start: 'a', step: 's', count: 'j', total: 't' },
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
        'The chart shows the digit in its place, with × 10 and ÷ 10 to its neighbors.',
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
      representation: { kind: 'placeValueChart', value: 'v', decimals: 0, highlight: 'p' },
    } satisfies ModuleDef;
  })(),
  // ── Rounding to any place, to 1,000,000 (4.NBT.3) ──
  {
    id: 'm.4.place-value-million~rounding',
    title: 'Round to any place',
    use: 'Use this to round a number to any place, up to 1,000,000.',
    assumptions: [
      'Pick the place: tens, hundreds, thousands, ten thousands or hundred thousands.',
      'Find the numbers below and above in that place. Round to the nearer one.',
      'Exactly halfway rounds up.',
    ],
    variables: [
      whole('n', 'n', 'Number', 0, 999999),
      { ...whole('p', 'p', 'Place', 10, 100000), allowed: [10, 100, 1000, 10000, 100000] },
      { ...whole('L', 'L', 'Number below', 0, 999990), step: 10, multipleOf: 10, derived: true },
      { ...whole('U', 'U', 'Number above', 10, 1000000), step: 10, multipleOf: 10, derived: true },
      { ...whole('r', 'r', 'Rounded', 0, 1000000), step: 10, multipleOf: 10, derived: true },
    ],
    relations: [
      {
        id: 'L = place below n',
        display: '{n} rounded down to the {p}s: {L}',
        words: 'The number rounded down to the place = {L}',
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
        'The chart outlines the first place where the two numbers differ.',
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
      steps: {
        [gap.relation.id]: {
          ...gap.steps,
          // Compare place by place first; then how far apart, by subtracting.
          g: {
            ...gap.steps.g!,
            how: 'Compare place by place, biggest first. Then take the smaller number from the bigger.',
            work: (v) => placeCompareLines(v.a!, v.b!),
            writtenLast: true,
          },
        },
      },
      example: { a: 452000, b: 425900, g: 26100 },
      startWith: ['a', 'b'],
      pictureLabels: ['g'],
      representation: { kind: 'placeValueChart', value: 'a', decimals: 0, compare: 'b' },
    } satisfies ModuleDef;
  })(),
  // ── Expanded form and number names (4.NBT.2) ──
  (() => {
    const places: [string, number, string][] = [
      ['h5', 100000, 'hundred thousands'],
      ['h4', 10000, 'ten thousands'],
      ['h3', 1000, 'thousands'],
      ['h2', 100, 'hundreds'],
      ['h1', 10, 'tens'],
      ['h0', 1, 'ones'],
    ];
    const ids = places.map(([id]) => id);
    const cap = (t: string) => `${t[0]!.toUpperCase()}${t.slice(1)}`;
    const digitOf = (n: number, size: number) => Math.floor(n / size) % 10;
    return {
      id: 'm.4.place-value-million~expanded-form',
      title: 'Expanded form and number names',
      use: 'Use this to write 347,812 as 300,000 + 40,000 + 7,000 + 800 + 10 + 2, and in words.',
      assumptions: [
        'Each digit’s value is the digit times its place.',
        'Expanded form adds the value of every digit.',
        'Read the thousands first, then say “thousand”, then read the rest.',
      ],
      variables: [
        whole('n', 'n', 'Number', 0, 999999),
        ...places.map(([id, size, name]) => ({
          ...whole(id, id, cap(name), 0, 9 * size),
          step: size,
          multipleOf: size,
        })),
      ],
      relations: [
        ...places.map(([id, size, name]) => ({
          ...placePart(id, 'n', size, name),
          words: `The ${name} part of the number = {${id}}`,
        })),
        {
          id: 'n = sum of the place values',
          display: `${ids.map((x) => `{${x}}`).join(' + ')} = {n}`,
          words: 'Add the value of every digit = {n}',
          vars: ['n', ...ids],
          residual: (v: Values) => v.n! - ids.reduce((t, x) => t + v[x]!, 0),
          solve: {
            n: (v: Values) => ids.reduce((t, x) => t + v[x]!, 0),
            ...Object.fromEntries(
              ids.map((x) => [
                x,
                (v: Values) => v.n! - ids.filter((y) => y !== x).reduce((t, y) => t + v[y]!, 0),
              ]),
            ),
          },
        },
      ],
      steps: {
        ...Object.fromEntries(
          places.map(([id, size, name]) => [
            `${id} = ${name} of n`,
            {
              [id]: {
                expr: `the ${name} part of {n}`,
                how:
                  size === 1
                    ? 'The ones digit is its own value.'
                    : `Find the digit in the ${name} place. Multiply it by ${fmt(size)}.`,
                // The number's name after its last place.
                work: (v: Values) =>
                  size === 1
                    ? [`In words: ${numberWords(v.n!)}`]
                    : [`${digitOf(v.n!, size)} × ${fmt(size)} = ${fmt(v[id]!)}`],
              },
            },
          ]),
        ),
        'n = sum of the place values': {
          n: {
            expr: ids.map((x) => `{${x}}`).join(' + '),
            how: 'Add the place values. Each goes in its own place.',
            work: (v: Values) => [`In words: ${numberWords(v.n!)}`],
          },
          ...Object.fromEntries(
            ids.map((x) => [
              x,
              {
                expr: `{n} − ${ids
                  .filter((y) => y !== x)
                  .map((y) => `{${y}}`)
                  .join(' − ')}`,
                how: 'Take the other place values away from the number.',
              },
            ]),
          ),
        },
      },
      example: { n: 347812, h5: 300000, h4: 40000, h3: 7000, h2: 800, h1: 10, h0: 2 },
      startWith: ['n'],
      representation: { kind: 'placeValueChart', value: 'n', decimals: 0 },
    } satisfies ModuleDef;
  })(),
  // ── Add and subtract multi-digit numbers (4.NBT.4) ──
  {
    id: 'm.4.place-value-million~add-subtract',
    title: 'Add to 1,000,000',
    use: 'Use this to add numbers up to 1,000,000 in columns.',
    assumptions: [
      'Line up the places. Add the ones first, then each place to the left.',
      'Regroup when a place passes 9: 10 in one place is 1 in the next.',
    ],
    variables: [
      whole('a', 'a', 'First number', 0, 1000000),
      whole('b', 'b', 'Second number', 0, 1000000),
      whole('c', 'c', 'Sum', 0, 1000000),
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
        c: { expr: '{a} + {b}', how: 'Add in columns from the ones. Regroup past 9.' },
        a: { expr: '{c} − {b}', how: 'Take the second number away from the sum, in columns.' },
        b: { expr: '{c} − {a}', how: 'Take the first number away from the sum, in columns.' },
      },
    },
    example: { a: 347812, b: 125469, c: 473281 },
    startWith: ['a', 'b'],
    representation: { kind: 'tape', parts: ['a', 'b'], total: 'c' },
  },
  {
    id: 'm.4.place-value-million~subtract',
    title: 'Subtract to 1,000,000',
    use: 'Use this to subtract numbers up to 1,000,000 in columns.',
    assumptions: [
      'Line up the places. Subtract the ones first, then each place to the left.',
      'Not enough in a place? Regroup 1 from the next place as 10.',
      'Check by adding the difference back to what you took away.',
    ],
    variables: [
      whole('a', 'a', 'Start', 0, 1000000),
      whole('b', 'b', 'Take away', 0, 1000000),
      whole('c', 'c', 'Difference', 0, 1000000),
    ],
    relations: [
      {
        id: 'a − b = c',
        display: '{a} − {b} = {c}',
        vars: ['c', 'a', 'b'],
        residual: (v: Values) => v.a! - v.b! - v.c!,
        solve: {
          c: (v: Values) => v.a! - v.b!,
          a: (v: Values) => v.c! + v.b!,
          b: (v: Values) => v.a! - v.c!,
        },
      },
    ],
    steps: {
      'a − b = c': {
        c: { expr: '{a} − {b}', how: 'Subtract in columns from the ones. Regroup when needed.' },
        a: { expr: '{c} + {b}', how: 'Add back what was taken away, in columns.' },
        b: { expr: '{a} − {c}', how: 'Take the difference away from the start, in columns.' },
      },
    },
    example: { a: 500000, b: 123456, c: 376544 },
    startWith: ['a', 'b'],
    representation: { kind: 'tape', compare: ['a', 'b'], difference: 'c' },
  },
  // ── Multi-digit multiplication: the area model, up to 4-digit × 1-digit (4.NBT.5) ──
  multiplyPage({
    id: 'm.4.multi-digit-multiply',
    assumptions: [
      'Break the first factor into its places: 4,327 = 4,000 + 300 + 20 + 7.',
      'Multiply each place by the second factor, then add the partial products.',
      'The area model draws each partial product as a box.',
      'Check with an estimate: round the first factor to its biggest place.',
    ],
    first: [10, 9999],
    second: [2, 9],
    example: [4327, 6],
  }),
  // ── 2-digit × 2-digit: four partial products (4.NBT.5) ──
  multiplyPage({
    id: 'm.4.multi-digit-multiply~two-digit',
    title: 'Two-digit times two-digit',
    use: 'Use this for a two-digit number times a two-digit number, like 43 × 26.',
    assumptions: [
      'Break both factors into tens and ones: 43 = 40 + 3 and 26 = 20 + 6.',
      'Multiply every part by every part: four partial products. Add them.',
      'The area model has a box for each partial product.',
    ],
    first: [10, 99],
    second: [10, 99],
    example: [43, 26],
  }),
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
        '“3 times as many” means 3 copies of the smaller amount.',
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
      // The bigger bar is drawn as that many copies of the smaller one (the 4.OA.2 tape).
      representation: { kind: 'tape', compare: ['b', 's'], difference: 'b', times: 'k' },
    } satisfies ModuleDef;
  })(),
  // ── Long division: partial quotients with a remainder (4.NBT.6) ──
  (() => {
    const fmt = (x: number) => formatNumber(x);
    /** Partial quotients by place: 743 ÷ 6 → 100 groups (600), 20 groups (120), 3 groups (18). */
    // Under the bracket: the quotient digit by digit, then what is left over.
    const partial = (n: number, d: number): string[] => {
      const q = Math.floor(n / d);
      const r = n - q * d;
      const digits = String(q).split('');
      const names = ['ones', 'tens', 'hundreds', 'thousands'];
      const places = digits.map((x, i) => `${x} ${names[digits.length - 1 - i]}`).join(', ');
      return [
        `Quotient: ${places}${digits.length > 1 ? ` → ${fmt(q)}` : ''}`,
        `${fmt(r)} left over: less than ${d}, so it is the remainder`,
      ];
    };
    return {
      id: 'm.4.long-division',
      assumptions: [
        'Make groups the size of the divisor. The number of groups is the quotient.',
        'Take away groups by place, biggest first: 600 is 100 sixes, 120 is 20 sixes, 18 is 3 sixes.',
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
            how: 'The groups times the divisor: what was shared out.',
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
            how: 'Take away groups of the divisor by place: hundreds of groups, then tens, then ones.',
            work: (v) => partial(v.n!, v.d!),
            // Grade 4 writes partial quotients; the bracket when the quotient is one place.
            written: (v) => partialQuotients(v.n!, v.d!) ?? longDivision(v.n!, v.d!),
          },
        },
      },
      example: { n: 743, d: 6, q: 123, r: 5, m: 738 },
      startWith: ['n', 'd'],
      pictureLabels: ['q'],
      representation: {
        kind: 'areaModel',
        divide: { dividend: 'n', divisor: 'd', quotient: 'q', remainder: 'r' },
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
        words: 'Total ÷ in each group = {q}, with some left over',
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
        words: 'Full groups, and 1 more when any are left over = {u}',
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
          work: (v) => {
            const q = Math.floor(v.n! / v.d!);
            return v.n! % v.d! === 0
              ? [`${q} × ${v.d} = ${v.n}`]
              : [
                  `${q} × ${v.d} = ${q * v.d!}`,
                  `${q + 1} × ${v.d} = ${(q + 1) * v.d!} is too many`,
                ];
          },
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
      kind: 'areaModel',
      divide: { dividend: 'n', divisor: 'd', quotient: 'q', remainder: 'r' },
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
          how: 'Every full set of parts makes 1 whole. Find how many full sets fit in the sum.',
          work: (v) =>
            v.w! > 0
              ? [`${v.w} × ${v.b} = ${v.w! * v.b!}: ${v.w} ${v.w === 1 ? 'whole' : 'wholes'}`]
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
              ? [`${v.w} × ${v.b} = ${v.w! * v.b!}: ${v.w} ${v.w === 1 ? 'whole' : 'wholes'}`]
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
          words: '2 × ({l} + {w}) = {P}',
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
