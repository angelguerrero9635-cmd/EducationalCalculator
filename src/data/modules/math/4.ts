/**
 * Grade 4 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { formatNumber, numberWords } from '@/engine/format';
import type { Values } from '@/engine/types';
import { apart, atLeast, div, times, whole } from '../helpers';
import type { ModuleDef, StepText } from '../types';
import {
  autoWritten,
  columnAdd,
  columnSubtract,
  decimalColumns,
  longDivision,
  partialQuotients,
} from '../written';
import {
  addStrategy,
  countList,
  divideWork,
  placeCompareLines,
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
    sliders: false,
    // Typed where it is written: 43 × 67 = ? (K–6 diagram review).
    equation: '{a} × {b} = {n}',
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
          work: (v) =>
            v.a === v.b && v.a! >= 10
              ? splitLine(v.a!).map((x) => `Both factors: ${x}`)
              : [...splitLine(v.a!), ...(v.b! >= 10 ? splitLine(v.b!) : [])],
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

/** The denominators Grade 4 uses (4.NF: 2, 3, 4, 5, 6, 8, 10, 12). */
const DENOMS_4 = [2, 3, 4, 5, 6, 8, 10, 12];

/**
 * Adding or subtracting mixed numbers (4.NF.3c): write each as a fraction, add or take away
 * the numerators, then write the answer as a mixed number again (18 1/4 − 2 3/4 = 73/4 − 11/4
 * = 62/4 = 15 2/4).
 */
function mixedAddSub(op: '+' | '−'): ModuleDef {
  const add = op === '+';
  const partsOf = (w: string, n: string, out: string, which: string) => ({
    id: `${out} = ${w} × b + ${n}`,
    display: `{${w}} wholes and {${n}}/{b} = {${out}}/{b}`,
    words: `${which} wholes × denominator + ${which.toLowerCase()} numerator = {${out}}`,
    check: (v: Values) => `${v[w]} × ${v.b} + ${v[n]} = ${v[out]}`,
    vars: [out, w, 'b', n],
    residual: (v: Values) => v[out]! - v[w]! * v.b! - v[n]!,
    solve: {
      [out]: (v: Values) => v[w]! * v.b! + v[n]!,
      [n]: (v: Values) => v[out]! - v[w]! * v.b!,
      [w]: (v: Values) => div(v[out]! - v[n]!, v.b!),
      b: () => undefined,
    },
  });
  const partsSteps = (w: string, n: string, out: string) => ({
    [out]: {
      expr: `{${w}} × {b} + {${n}}`,
      how: 'Each whole is that many parts. Multiply, then add the extra parts.',
      work: (v: Values) => [
        `${v[w]} ${v[w] === 1 ? 'whole' : 'wholes'} = ${v[w]} × ${v.b} = ${v[w]! * v.b!} parts`,
        `${v[w]! * v.b!} + ${v[n]} = ${v[out]}, so ${v[out]}/${v.b}`,
      ],
    },
    [n]: {
      expr: `{${out}} − {${w}} × {b}`,
      how: 'Take out the parts that make the wholes. The rest are the extra parts.',
    },
    [w]: {
      expr: `({${out}} − {${n}}) ÷ {b}`,
      how: 'Take the extra parts away. Every full set of parts is one whole.',
    },
  });
  const less = (n: string) => ({
    id: `${n} < b`,
    constraint: true as const,
    display: `{${n}}/{b} is less than 1`,
    vars: [n, 'b'],
    residual: (v: Values) => (v[n]! < v.b! ? 0 : 1),
    solve: {},
  });
  return {
    id: `m.4.add-fractions-like~mixed-${add ? 'add' : 'subtract'}`,
    sliders: false,
    equation: `{w1} {n1}/{b} ${op} {w2} {n2}/{b} = {wd} {rd}/{b}`,
    title: add ? 'Add mixed numbers' : 'Subtract mixed numbers',
    use: add
      ? 'Use this for “Find the value of 2 1/6 + 1 5/6.”'
      : 'Use this for “A total of 18 1/4 inches with a 2 3/4-inch clasp. How long is the chain?”',
    assumptions: [
      'Write each mixed number as a fraction: 2 3/4 is 2 × 4 + 3 = 11 fourths.',
      add
        ? 'Add the numerators. The denominator stays.'
        : 'Take away the numerators. The denominator stays. A whole number like 2 is 2 wholes and 0/4.',
      'Write the answer as wholes and a fraction again.',
    ],
    variables: [
      { ...whole('b', 'b', 'Denominator', 2, 12), allowed: DENOMS_4 },
      whole('w1', 'w₁', 'First wholes', 0, 20),
      whole('n1', 'n₁', 'First numerator', 0, 11),
      whole('w2', 'w₂', 'Second wholes', 0, 20),
      whole('n2', 'n₂', 'Second numerator', 0, 11),
      { ...whole('A', 'A', 'First as a fraction', 0, 251), derived: true },
      { ...whole('B', 'B', 'Second as a fraction', 0, 251), derived: true },
      {
        ...whole('D', 'D', add ? 'Numerator of the sum' : 'Numerator of the difference', 0, 502),
        derived: true,
      },
      { ...whole('wd', 'W', 'Wholes in the answer', 0, 41), derived: true },
      { ...whole('rd', 'R', 'Fraction part of the answer', 0, 11), derived: true },
    ],
    relations: [
      less('n1'),
      less('n2'),
      partsOf('w1', 'n1', 'A', 'First'),
      partsOf('w2', 'n2', 'B', 'Second'),
      {
        id: add ? 'D = A + B' : 'D = A − B',
        display: add ? '{A}/{b} + {B}/{b} = {D}/{b}' : '{A}/{b} − {B}/{b} = {D}/{b}',
        words: add
          ? 'Add the numerators; the denominator stays'
          : 'Take away the numerators; the denominator stays',
        check: (v: Values) => (add ? `${v.A} + ${v.B} = ${v.D}` : `${v.A} − ${v.B} = ${v.D}`),
        vars: ['D', 'A', 'B'],
        shows: ['b'],
        residual: (v: Values) => v.D! - (add ? v.A! + v.B! : v.A! - v.B!),
        solve: {
          D: (v: Values) => (add ? v.A! + v.B! : v.A! - v.B!),
          A: (v: Values) => (add ? v.D! - v.B! : v.D! + v.B!),
          B: (v: Values) => (add ? v.D! - v.A! : v.A! - v.D!),
        },
      },
      {
        id: 'wd = floor(D/b)',
        display: 'full wholes in {D}/{b}: {wd}',
        words: 'Full wholes in the answer = {wd}',
        vars: ['wd', 'D', 'b'],
        residual: (v: Values) => v.wd! - Math.floor(v.D! / v.b!),
        solve: {
          wd: (v: Values) => Math.floor(v.D! / v.b!),
          D: () => undefined,
          b: () => undefined,
        },
      },
      {
        id: 'rd = D − wd × b',
        display: '{D}/{b} = {wd} {rd}/{b}',
        words: 'Numerator − wholes × denominator = fraction part',
        check: (v: Values) => `${v.wd} × ${v.b} + ${v.rd} = ${v.D}`,
        vars: ['rd', 'D', 'wd', 'b'],
        residual: (v: Values) => v.rd! - (v.D! - v.wd! * v.b!),
        solve: {
          rd: (v: Values) => v.D! - v.wd! * v.b!,
          D: (v: Values) => v.wd! * v.b! + v.rd!,
          wd: () => undefined,
          b: () => undefined,
        },
      },
    ],
    steps: {
      'n1 < b': {},
      'n2 < b': {},
      'A = w1 × b + n1': partsSteps('w1', 'n1', 'A'),
      'B = w2 × b + n2': partsSteps('w2', 'n2', 'B'),
      [add ? 'D = A + B' : 'D = A − B']: {
        D: {
          expr: add ? '{A} + {B}' : '{A} − {B}',
          how: add
            ? 'Add the numerators. The parts are the same size.'
            : 'Take away the numerators. The parts are the same size.',
          work: (v: Values) => (add ? addStrategy(v.A!, v.B!) : subtractStrategy(v.A!, v.B!)),
        },
        A: { expr: add ? '{D} − {B}' : '{D} + {B}', how: 'Undo the adding or taking away.' },
        B: { expr: add ? '{D} − {A}' : '{A} − {D}', how: 'Undo the adding or taking away.' },
      },
      'wd = floor(D/b)': {
        wd: {
          expr: 'wholes in {D} parts of {b}',
          how: 'Every full set of parts makes 1 whole. Find how many full sets fit.',
          work: (v: Values) =>
            v.wd! > 0
              ? [`${v.wd} × ${v.b} = ${v.wd! * v.b!}: ${v.wd} ${v.wd === 1 ? 'whole' : 'wholes'}`]
              : [`${v.D} is less than ${v.b}, so the answer is less than 1 whole.`],
        },
      },
      'rd = D − wd × b': {
        D: {
          expr: '{wd} × {b} + {rd}',
          how: 'Each whole has the same number of parts. Add the fraction part.',
        },
        rd: {
          expr: '{D} − {wd} × {b}',
          how: 'Take away the parts that make wholes. The rest is the fraction part.',
          work: (v: Values) => [
            `${v.wd} × ${v.b} = ${v.wd! * v.b!}`,
            `${v.D} − ${v.wd! * v.b!} = ${v.rd}`,
          ],
          note: (v: Values) =>
            `(${v.D}/${v.b} = ${v.wd ? `${v.wd}` : ''}${v.wd && v.rd ? ' ' : ''}${v.rd || !v.wd ? `${v.rd}/${v.b}` : ''})`,
        },
      },
    },
    example: add
      ? { b: 6, w1: 2, n1: 1, w2: 1, n2: 5, A: 13, B: 11, D: 24, wd: 4, rd: 0 }
      : { b: 4, w1: 18, n1: 1, w2: 2, n2: 3, A: 73, B: 11, D: 62, wd: 15, rd: 2 },
    startWith: ['b', 'w1', 'n1', 'w2', 'n2'],
    // A jump from the first number to the answer, in parts: the wholes, then the parts left.
    representation: {
      kind: 'fractionLine',
      numerator: 'D',
      denominator: 'b',
      wholes: 1,
      from: 'A',
    },
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
      'Numbers to 200 (the factors of 105 or 126).',
    ],
    variables: [
      whole('n', 'n', 'Number', 1, 200),
      whole('a', 'a', 'One factor', 1, 200),
      whole('b', 'b', 'Its partner', 1, 200),
      { ...whole('f', 'f', 'Number of factors', 1, 18), derived: true },
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
    equation: '{a} × {b} = {n}',
    representation: { kind: 'factorPairs', value: 'n', first: 'a', second: 'b', count: 'f' },
  },
  // ── Multiples: is a number a multiple of a one-digit number? (4.OA.4) ──
  {
    id: 'm.4.factors-multiples~multiples',
    title: 'Identify multiples',
    use: 'Use this for “Is seventeen a multiple of two?” or “Is 40 a multiple of 8?”',
    assumptions: [
      'A multiple of 8 is 8 times a whole number: 8, 16, 24, 32 and so on.',
      'To check, divide. A remainder of 0 means it is a multiple.',
      'The chart shades every multiple and outlines the number you test. Past 100 it shows the hundred the number is in (601 to 700).',
    ],
    variables: [
      whole('k', 'k', 'One-digit number', 2, 9),
      whole('n', 'n', 'Number to test', 1, 1000),
      { ...whole('q', 'q', 'Quotient', 0, 500), derived: true },
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
    representation: { kind: 'hundredChart', value: 'n', max: 1000, multiplesOf: 'k' },
  },
  // ── Patterns that add the same number each time (4.OA.5) ──
  {
    id: 'm.4.factors-multiples~pattern',
    title: 'Number patterns',
    use: 'Use this for “14, 26, 38, ___: the pattern increases by 12.”',
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
            how: 'A place to the right is worth 1/10 as much: divide the value by 10.',
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
    title: 'Round multi-digit numbers',
    use: 'Use this for “What is 18,565 rounded to the nearest thousand?”',
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
      title: 'Compare multi-digit numbers',
      use: 'Use this for “Which is greater: 425,900 or 452,000?” with >, < or =.',
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
    // 347,812 = 300,000 + 40,000 + 7,000 + 800 + 10 + 2 (places that are 0 are left out).
    const expanded = (v: Values) => {
      const parts = places.map(([, size]) => digitOf(v.n!, size) * size).filter((x) => x > 0);
      return parts.length > 1 ? `${fmt(v.n!)} = ${parts.map(fmt).join(' + ')}` : '';
    };
    return {
      id: 'm.4.place-value-million~expanded-form',
      title: 'Read and write multi-digit numbers',
      use: 'Use this for “Which of these is equal to 8,000 + 800 + 8?” and number names.',
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
                // After the last place: the expanded form, then the number's name.
                work: (v: Values) =>
                  size === 1
                    ? [expanded(v), `In words: ${numberWords(v.n!)}`].filter((x) => x !== '')
                    : digitOf(v.n!, size) === 0
                      ? [`0 ${name}: nothing to write for this place.`]
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
    sliders: false,
    // Typed where it is written (K–6 diagram review).
    equation: '{a} + {b} = {c}',
    title: 'Add multi-digit numbers',
    use: 'Use this for sums to 1,000,000 in columns, like 36,325 + 23,310.',
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
        c: {
          expr: '{a} + {b}',
          how: 'Add in columns from the ones. Regroup past 9.',
          written: (v: Values) => columnAdd([v.a!, v.b!]),
        },
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
    sliders: false,
    // Typed where it is written (K–6 diagram review).
    equation: '{a} − {b} = {c}',
    title: 'Subtract multi-digit numbers',
    use: 'Use this for “Subtract: 6,090 − 4,843.”',
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
        c: {
          expr: '{a} − {b}',
          how: 'Subtract in columns from the ones. Regroup when needed.',
          written: (v: Values) => columnSubtract(v.a!, v.b!),
        },
        a: { expr: '{c} + {b}', how: 'Add back what was taken away, in columns.' },
        b: { expr: '{a} − {c}', how: 'Take the difference away from the start, in columns.' },
      },
    },
    example: { a: 500000, b: 123456, c: 376544 },
    startWith: ['a', 'b'],
    // Take away: the start split into the part taken and the difference.
    representation: { kind: 'tape', parts: ['c', 'b'], total: 'a' },
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
    title: 'Multiply two-digit numbers',
    use: 'Use this for “Multiply: 43 × 67.”',
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
      sliders: false,
      // Typed where it is written (K–6 diagram review).
      equation: '{k} × {s} = {b}',
      title: 'Comparison problems: times as many',
      use: 'Use this for “Ben has 4 times as many stickers as Ana.”',
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
      representation: {
        kind: 'tape',
        compare: ['b', 's'],
        difference: 'b',
        times: 'k',
        caption: '{b} is {k} times as many as {s}.',
      },
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
      sliders: false,
      // Typed where it is written (K–6 diagram review).
      equation: '{n} ÷ {d} = {q} remainder {r}',
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
    title: 'Interpret remainders',
    use: 'Use this for “Each bus holds 40 students. How many buses are needed?”',
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
              ? [`${q} × ${v.d} = ${fmt(v.n!)}`]
              : [
                  `${q} × ${v.d} = ${fmt(q * v.d!)}`,
                  `${q + 1} × ${v.d} = ${fmt((q + 1) * v.d!)} is too many`,
                ];
          },
          written: (v) => partialQuotients(v.n!, v.d!) ?? longDivision(v.n!, v.d!),
        },
      },
      'u = q, plus 1 if any are left': {
        u: {
          expr: (v) => (v.r! > 0 ? '{q} + 1' : '{q}'),
          how: 'Everyone needs a group. Any left over need one more group.',
          // The story decides which reading answers it; show the other two as well.
          work: (v) =>
            v.r! > 0
              ? [
                  `Full groups only: ${v.q}. Left over: ${v.r}.`,
                  ...(v.q! >= v.r!
                    ? [`Shared out one at a time: ${v.r} of the ${v.q} groups get 1 more.`]
                    : []),
                ]
              : [],
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
    // The full groups and the leftover as its own piece: why the answer is one more group.
    representation: {
      kind: 'tape',
      parts: ['m', 'r'],
      total: 'n',
      groups: 'q',
      groupsPart: 'm',
      caption: '{q} full groups and {r} left over: {u} groups needed.',
    },
  },
  // ── Making an equivalent fraction (4.NF.1) ──
  (() => {
    const top = times('p = a × k', ['a', 'k', 'p'], ['numerator', 'factor', 'new numerator']);
    const bottom = times(
      'm = b × k',
      ['b', 'k', 'm'],
      ['denominator', 'factor', 'new denominator'],
    );
    return {
      id: 'm.4.fraction-equivalence',
      sliders: false,
      equation: '{a}/{b} = {p}/{m}',
      assumptions: [
        'Multiply the numerator and the denominator by the same number: the fraction keeps its size.',
        'Each part is cut into that many smaller parts: more parts, the same amount of the whole.',
        'Denominators 2, 3, 4, 5, 6, 8, 10 and 12; factors to 10, so tenths can become hundredths.',
        'It works past 1 whole too: 10/3 = 40/12.',
      ],
      variables: [
        whole('a', 'a', 'Numerator', 1, 24),
        { ...whole('b', 'b', 'Denominator', 2, 12), allowed: DENOMS_4 },
        whole('k', 'k', 'Factor', 2, 10),
        whole('p', 'p', 'New numerator', 2, 240),
        whole('m', 'm', 'New denominator', 4, 120),
      ],
      relations: [
        { ...top.relation, words: 'Numerator × factor = new numerator' },
        {
          ...bottom.relation,
          words: 'Denominator × factor = new denominator',
          check: (v: Values) =>
            [v.a, v.b, v.p, v.m].every((x) => x !== undefined)
              ? `${v.b} × ${v.k} = ${v.m}, so ${v.a}/${v.b} = ${v.p}/${v.m}`
              : `${v.b} × ${v.k} = ${v.m}`,
        },
      ],
      steps: {
        'p = a × k': {
          ...top.steps,
          p: { ...top.steps.p!, how: 'Multiply the numerator by the factor.' },
          k: { ...top.steps.k!, how: 'Divide the new numerator by the numerator: the factor.' },
        },
        'm = b × k': {
          ...bottom.steps,
          m: { ...bottom.steps.m!, how: 'Multiply the denominator by the same factor.' },
          k: {
            ...bottom.steps.k!,
            how: 'Divide the new denominator by the denominator: the factor.',
          },
        },
      },
      example: { a: 3, b: 4, k: 3, p: 9, m: 12 },
      startWith: ['a', 'b', 'k'],
      // Two number lines, one cut in the old parts and one in the new: the points meet, past 1
      // whole too (10/3 and 40/12).
      representation: {
        kind: 'fractionLine',
        numerator: 'a',
        denominator: 'b',
        wholes: 1,
        second: { numerator: 'p', denominator: 'm' },
      },
    } satisfies ModuleDef;
  })(),
  // ── Comparing fractions with unlike denominators: a common denominator (4.NF.2) ──
  (() => {
    const sign = (v: Values) => (v.p! > v.q! ? '>' : v.p! < v.q! ? '<' : '=');
    const known = (v: Values) =>
      ['a', 'b', 'c', 'd', 'm', 'p', 'q'].every((k) => v[k] !== undefined);
    /**
     * The least common denominator, as a Grade 4 class finds it: count by the bigger
     * denominator until the other divides it (12, 24 for 12 and 8), not 12 × 8 = 96.
     */
    const common = (b: number, d: number) => {
      if (!(b >= 1 && d >= 1 && Number.isInteger(b) && Number.isInteger(d))) return b * d;
      const big = Math.max(b, d);
      let m = big;
      while (m % b !== 0 || m % d !== 0) m += big;
      return m;
    };
    const scaled = (id: string, [num, den, out]: [string, string, string], which: string) => ({
      relation: {
        id,
        display: `{${num}} × ({m} ÷ {${den}}) = {${out}}`,
        words: `${which} numerator × (common denominator ÷ ${which.toLowerCase()} denominator) = {${out}}`,
        vars: [out, num, 'm', den],
        residual: (v: Values) => v[out]! - (v[num]! * v.m!) / v[den]!,
        solve: {
          [out]: (v: Values) => (v[num]! * v.m!) / v[den]!,
          [num]: (v: Values) => div(v[out]! * v[den]!, v.m!),
          m: () => undefined,
          [den]: () => undefined,
        },
      },
      steps: {
        [out]: {
          expr: `{${num}} × ({m} ÷ {${den}})`,
          how: `The denominator became the common denominator. Multiply the numerator by the same number.`,
          work: (v: Values) => [
            `${v.m} ÷ ${v[den]} = ${v.m! / v[den]!}`,
            `${v[num]} × ${v.m! / v[den]!} = ${v[out]}`,
          ],
        },
        [num]: {
          expr: `{${out}} ÷ ({m} ÷ {${den}})`,
          how: 'Divide the new numerator by the number the denominator was multiplied by.',
          work: (v: Values) => [
            `${v.m} ÷ ${v[den]} = ${v.m! / v[den]!}`,
            `${v[out]} ÷ ${v.m! / v[den]!} = ${v[num]}`,
          ],
        },
      } as Record<string, StepText>,
    });
    const first = scaled('p = a × (m ÷ b)', ['a', 'b', 'p'], 'First');
    const second = scaled('q = c × (m ÷ d)', ['c', 'd', 'q'], 'Second');
    return {
      id: 'm.4.fraction-equivalence~compare',
      title: 'Compare fractions',
      use: 'Use this for “Which fraction is greater, 2/5 or 2/6?” Explain or show your reasoning.',
      assumptions: [
        'Give both fractions the same denominator, then compare the numerators.',
        'If one denominator is a multiple of the other, use it (3/4 and 5/8: eighths).',
        'Otherwise multiply the two denominators.',
        'Fractions up to 1, with denominators 2, 3, 4, 5, 6, 8, 10 and 12.',
      ],
      variables: [
        whole('a', 'a', 'First numerator', 1, 12),
        { ...whole('b', 'b', 'First denominator', 2, 12), allowed: DENOMS_4 },
        whole('c', 'c', 'Second numerator', 1, 12),
        { ...whole('d', 'd', 'Second denominator', 2, 12), allowed: DENOMS_4 },
        { ...whole('m', 'm', 'Common denominator', 2, 144), derived: true },
        { ...whole('p', 'p', 'First new numerator', 1, 144), derived: true },
        { ...whole('q', 'q', 'Second new numerator', 1, 144), derived: true },
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
        {
          id: 'm = common denominator of b and d',
          display: 'common denominator of {b} and {d} = {m}',
          words: 'A common denominator of the two denominators = {m}',
          vars: ['m', 'b', 'd'],
          residual: (v: Values) => v.m! - common(v.b!, v.d!),
          solve: { m: (v: Values) => common(v.b!, v.d!), b: () => undefined, d: () => undefined },
        },
        first.relation,
        {
          ...second.relation,
          check: (v: Values) =>
            known(v)
              ? `${v.q}/${v.m}, so ${v.a}/${v.b} ${sign(v)} ${v.c}/${v.d}`
              : `${v.c} × ${v.m! / v.d!} = ${v.q}`,
        },
      ],
      steps: {
        'a ≤ b': {},
        'c ≤ d': {},
        'm = common denominator of b and d': {
          m: {
            expr: 'common denominator of {b} and {d}',
            how: 'Count by the bigger denominator until the other one divides it.',
            work: (v) =>
              v.b === v.d
                ? [`The denominators are the same: ${v.m}`]
                : v.m === Math.max(v.b!, v.d!)
                  ? [
                      `${Math.max(v.b!, v.d!)} = ${Math.min(v.b!, v.d!)} × ${Math.max(v.b!, v.d!) / Math.min(v.b!, v.d!)}: use ${v.m}`,
                    ]
                  : [
                      `Count by ${Math.max(v.b!, v.d!)}s: ${countList(0, Math.max(v.b!, v.d!), v.m! / Math.max(v.b!, v.d!))} → ${v.m}`,
                      `${v.m} ÷ ${Math.min(v.b!, v.d!)} = ${v.m! / Math.min(v.b!, v.d!)}: ${Math.min(v.b!, v.d!)} goes into ${v.m}`,
                    ],
          },
        },
        'p = a × (m ÷ b)': first.steps,
        'q = c × (m ÷ d)': {
          ...second.steps,
          q: {
            ...second.steps.q!,
            note: (v) =>
              !known(v)
                ? ''
                : v.b === v.d
                  ? `(same denominator: compare the numerators, so ${v.a}/${v.b} ${sign(v)} ${v.c}/${v.d})`
                  : `(${v.p}/${v.m} ${sign(v)} ${v.q}/${v.m}, so ${v.a}/${v.b} ${sign(v)} ${v.c}/${v.d})`,
          },
        },
      },
      example: { a: 3, b: 4, c: 5, d: 8, m: 8, p: 6, q: 5 },
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
    sliders: false,
    equation: '{a}/{b} + {c}/{b} = {s}/{b}',
    assumptions: [
      'Like denominators mean the same-size parts: add the numerators, keep the denominator.',
      'A sum bigger than 1 can be written as wholes and parts: 7/4 = 1 whole and 3/4.',
      'Fractions can be more than 1 (9/8 + 3/8). Denominators 2, 3, 4, 5, 6, 8, 10 and 12.',
    ],
    variables: [
      { ...whole('b', 'b', 'Denominator', 2, 12), allowed: DENOMS_4 },
      whole('a', 'a', 'First numerator', 0, 24),
      whole('c', 'c', 'Second numerator', 0, 24),
      whole('s', 's', 'Numerator of the sum', 0, 48),
      { ...whole('w', 'w', 'Wholes in the sum', 0, 24), derived: true },
      { ...whole('r', 'r', 'Numerator of the fraction part', 0, 11), derived: true },
    ],
    relations: [
      {
        id: 's = a + c',
        display: '{a}/{b} + {c}/{b} = {s}/{b}',
        words: 'Add the numerators; the denominator stays',
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
        display: '{s}/{b} = {w} {r}/{b}',
        words: 'Numerator of the sum = wholes × denominator + numerator of the fraction part',
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
        words: 'Full wholes in the sum = {w}',
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
      's = a + c': {
        s: {
          expr: '{a} + {c}',
          how: 'Add the numerators. The denominator stays: the parts are the same size.',
          work: (v) => addStrategy(v.a!, v.c!),
        },
        a: {
          expr: '{s} − {c}',
          how: 'Take the second numerator away from the numerator of the sum.',
        },
        c: {
          expr: '{s} − {a}',
          how: 'Take the first numerator away from the numerator of the sum.',
        },
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
          how: 'Take away the parts that make wholes. The rest is the fraction part.',
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
    sliders: false,
    equation: '{a}/{b} − {c}/{b} = {s}/{b}',
    title: 'Subtract fractions with like denominators',
    use: 'Use this for “4/6 − 1/6 =” and other like denominators.',
    assumptions: [
      'Like denominators mean same-size parts: subtract the numerators, keep the denominator.',
      'The first fraction is at least as big as the second. It can be more than 1 (13/5 − 4/5).',
      'Denominators 2, 3, 4, 5, 6, 8, 10 and 12.',
    ],
    variables: [
      { ...whole('b', 'b', 'Denominator', 2, 12), allowed: DENOMS_4 },
      whole('a', 'a', 'First numerator', 1, 24),
      whole('c', 'c', 'Second numerator', 0, 24),
      whole('s', 's', 'Numerator of the difference', 0, 24),
    ],
    relations: [
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
        words: 'Subtract the numerators; the denominator stays',
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
      'c ≤ a': {},
      's = a − c': {
        s: {
          expr: '{a} − {c}',
          how: 'Take the second numerator from the first. The denominator stays.',
          work: (v) =>
            v.b === undefined
              ? [`${v.a} − ${v.c} = ${v.s}`]
              : [`${v.a} − ${v.c} = ${v.s}, so ${v.s}/${v.b}`],
        },
        a: {
          expr: '{s} + {c}',
          how: 'Add the difference and the second numerator to get the first numerator back.',
          work: (v) => addStrategy(v.s!, v.c!),
        },
        c: {
          expr: '{a} − {s}',
          how: 'Take the difference away from the first numerator.',
        },
      },
    },
    example: { b: 8, a: 7, c: 3, s: 4 },
    startWith: ['b', 'a', 'c'],
    // The first fraction on one line and the difference under it, past 1 whole too.
    representation: {
      kind: 'fractionLine',
      numerator: 'a',
      denominator: 'b',
      wholes: 1,
      second: { numerator: 's', denominator: 'b' },
    },
  },
  // ── Mixed numbers as fractions (4.NF.3b, 4.NF.3c) ──
  {
    id: 'm.4.add-fractions-like~mixed',
    sliders: false,
    equation: '{w} {r}/{b} = {s}/{b}',
    title: 'Fractions and mixed numbers',
    use: 'Use this for “Write 2 3/4 as a fraction,” or 11/4 as a mixed number.',
    assumptions: [
      'A mixed number is wholes and a fraction: 2 and 3/4.',
      'Each whole is all the parts: 2 wholes in quarters is 2 × 4 = 8 quarters. Add the extra parts.',
      'Wholes to 10; the fraction part is less than 1.',
    ],
    variables: [
      whole('w', 'w', 'Wholes', 0, 10),
      { ...whole('b', 'b', 'Denominator', 2, 12), allowed: DENOMS_4 },
      whole('r', 'r', 'Extra numerator', 0, 11),
      whole('s', 's', 'Numerator in all', 0, 131),
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
        words: 'Wholes × denominator + extra numerator = numerator in all',
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
      {
        // From the fraction to the mixed number (11/4 → 2 wholes): the full sets of parts.
        id: 'w = floor(s/b)',
        display: 'full wholes in {s}/{b}: {w}',
        words: 'Full wholes in the fraction = {w}',
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
      'w = floor(s/b)': {
        w: {
          expr: 'wholes in {s} parts of {b}',
          how: 'Every full set of parts makes 1 whole. Find how many full sets fit.',
          work: (v) =>
            v.w! > 0
              ? [`${v.w} × ${v.b} = ${v.w! * v.b!}: ${v.w} ${v.w === 1 ? 'whole' : 'wholes'}`]
              : [`${v.s} is less than ${v.b}, so it is less than 1 whole.`],
        },
      },
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
  mixedAddSub('+'),
  mixedAddSub('−'),
  // ── Line plots in eighths of an inch (4.MD.4) ──
  (() => {
    const xs = ['x1', 'x2', 'x3', 'x4', 'x5'];
    const at = (id: string) => Number(id.slice(1));
    const used = (v: Values) => xs.filter((id) => v[id]! > 0).map(at);
    const spread = (v: Values) => {
      const u = used(v);
      return u.length ? Math.max(...u) - Math.min(...u) : 0;
    };
    const total = (v: Values) => xs.reduce((t, id) => t + at(id) * v[id]!, 0);
    /** Eighths of an inch as inches: 32 → "4 inches", 12 → "1 4/8 inches", 3 → "3/8 inch". */
    const inches = (e: number) => {
      const w = Math.floor(e / 8);
      const r = e % 8;
      const whole = w === 1 ? '1 inch' : `${w} inches`;
      return w === 0 ? `${r}/8 inch` : r ? `${w} ${r}/8 inches` : whole;
    };
    return {
      id: 'm.4.add-fractions-like~line-plot',
      title: 'Interpret line plots in eighths of an inch',
      use: 'Use this for “The line plot shows the lengths of toothpicks in inches.”',
      assumptions: [
        'Each X is one object, measured to the nearest 1/8 inch.',
        'Longest − shortest uses the X’s at the ends of the plot.',
        'The total length adds every object: count × length at each mark.',
      ],
      variables: [
        ...xs.map((id) => whole(id, id, `Objects at ${at(id)}/8 in`, 0, 6)),
        {
          ...whole('D', 'D', 'Difference in length', 0, 4),
          unit: 'eighths of an inch',
          derived: true,
        },
        {
          id: 'T',
          symbol: 'T',
          name: 'Total length',
          unit: 'inches',
          min: 0,
          max: 11.25,
          step: 0.125,
          // The answer as the question asks it: 3 7/8 inches.
          fraction: 8,
          derived: true,
        },
      ],
      relations: [
        {
          id: 'D = longest − shortest',
          display: `eighths from the shortest to the longest of ${xs.map((id) => `{${id}}`).join(', ')} = {D}`,
          words: 'Longest − shortest = {D}',
          vars: ['D', ...xs],
          residual: (v: Values) => v.D! - spread(v),
          solve: {
            D: spread,
            ...Object.fromEntries(xs.map((id) => [id, () => undefined])),
          },
        },
        {
          id: 'T = count × length, added',
          display: `${xs.map((id) => `{${id}} × ${at(id)}/8`).join(' + ')} = {T}`,
          words: 'Objects × length at each mark, added = {T}',
          vars: ['T', ...xs],
          residual: (v: Values) => v.T! - total(v) / 8,
          solve: {
            T: (v: Values) => total(v) / 8,
            ...Object.fromEntries(
              xs.map((id) => [
                id,
                (v: Values) =>
                  div(
                    v.T! * 8 - xs.filter((y) => y !== id).reduce((t, y) => t + at(y) * v[y]!, 0),
                    at(id),
                  ),
              ]),
            ),
          },
        },
      ],
      steps: {
        'D = longest − shortest': {
          D: {
            expr: `eighths from the shortest to the longest of ${xs.map((id) => `{${id}}`).join(', ')}`,
            how: 'Find the X’s farthest right and farthest left. Subtract the eighths.',
            work: (v) => {
              const u = used(v);
              return u.length
                ? [`${Math.max(...u)}/8 − ${Math.min(...u)}/8 = ${spread(v)}/8`]
                : ['No X’s yet: 0'];
            },
            note: (v) => `(${inches(spread(v))})`,
          },
        },
        'T = count × length, added': {
          T: {
            expr: xs.map((id) => `{${id}} × ${at(id)}/8`).join(' + '),
            how: 'At each mark, multiply the count by the eighths. Add them all.',
            work: (v) => {
              const on = xs.filter((id) => v[id]! > 0);
              if (!on.length) return ['No X’s yet: 0'];
              return [
                ...on.map((id) => `${v[id]} × ${at(id)}/8 = ${v[id]! * at(id)}/8`),
                ...(on.length > 1
                  ? [
                      `${on.map((id) => v[id]! * at(id)).join(' + ')} = ${total(v)}, so ${total(v)}/8 inch`,
                    ]
                  : []),
              ];
            },
          },
          ...Object.fromEntries(
            xs.map((id) => [
              id,
              {
                expr: `({T} × 8 − ${xs
                  .filter((y) => y !== id)
                  .map((y) => `{${y}} × ${at(y)}`)
                  .join(' − ')}) ÷ ${at(id)}`,
                how: 'Take the other marks’ eighths away from the total, then divide by this mark.',
              },
            ]),
          ),
        },
      },
      example: { x1: 1, x2: 3, x3: 4, x4: 2, x5: 1, D: 4, T: 4 },
      startWith: xs,
      representation: {
        kind: 'linePlot',
        unit: 'in',
        points: xs.map((id) => ({ var: id, at: at(id) / 8, label: `${at(id)}/8` })),
      },
    } satisfies ModuleDef;
  })(),
  // Lengths from a start that is itself a fraction (4.MD.4): straws from 3 3/4 to 5 1/4 inches.
  (() => {
    const xs = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    /** Inches as a mixed number: 3.75 → "3 3/4". */
    const mix = (x: number) => formatNumber(x, { fraction: 4 });
    const at = (v: Values, id: string) => v.s! + xs.indexOf(id) / 4;
    const used = (v: Values) => xs.filter((id) => v[id]! > 0).map((id) => at(v, id));
    const spread = (v: Values) => {
      const u = used(v);
      return u.length ? Math.max(...u) - Math.min(...u) : 0;
    };
    const total = (v: Values) => xs.reduce((t, id) => t + v[id]! * at(v, id), 0);
    const terms = (v: Values) =>
      xs
        .filter((id) => v[id]! > 0)
        .map((id) => `${v[id]} × ${mix(at(v, id))}`)
        .join(' + ') || '0';
    return {
      id: 'm.4.add-fractions-like~line-plot-quarters',
      title: 'Interpret line plots in quarter inches',
      use: 'Use this for “The line plot shows straw lengths from 3 3/4 to 5 1/4 inches.”',
      assumptions: [
        'Each X is one straw, measured to the nearest 1/4 inch.',
        'The marks start at the shortest length, which can be a fraction: 3 3/4, 4, 4 1/4 and on.',
        'Longest − shortest uses the X’s at the ends of the plot.',
        'The total length adds every straw: count × length at each mark.',
      ],
      variables: [
        {
          id: 's',
          symbol: 's',
          name: 'Shortest mark',
          unit: 'inches',
          min: 0,
          max: 20,
          step: 0.25,
          multipleOf: 0.25,
          fraction: 4,
        },
        ...xs.map((id, i) => whole(id, id, `Straws at mark ${i + 1}`, 0, 6)),
        {
          id: 'D',
          symbol: 'D',
          name: 'Longest − shortest',
          unit: 'inches',
          min: 0,
          max: 1.5,
          step: 0.25,
          fraction: 4,
          derived: true,
        },
        {
          id: 'T',
          symbol: 'T',
          name: 'Total length',
          unit: 'inches',
          min: 0,
          max: 1100,
          step: 0.25,
          fraction: 4,
          derived: true,
        },
      ],
      relations: [
        {
          id: 'D = longest − shortest',
          display: `the longest − the shortest of the marks from {s} by 1/4 with ${xs.map((id) => `{${id}}`).join(', ')} = {D}`,
          words: 'Longest − shortest = {D}',
          check: (v: Values) => {
            const u = used(v);
            return u.length
              ? `${mix(Math.max(...u))} − ${mix(Math.min(...u))} = ${mix(v.D!)}`
              : `0 = ${mix(v.D!)}`;
          },
          vars: ['D', 's', ...xs],
          residual: (v: Values) => v.D! - spread(v),
          solve: { D: spread },
        },
        {
          id: 'T = count × length, added',
          display: `the lengths from {s} by 1/4, ${xs.map((id) => `{${id}}`).join(', ')} of each: {T}`,
          words: 'Straws × length at each mark, added = {T}',
          check: (v: Values) => `${terms(v)} = ${mix(v.T!)}`,
          vars: ['T', 's', ...xs],
          residual: (v: Values) => v.T! - total(v),
          solve: { T: total },
        },
      ],
      steps: {
        'D = longest − shortest': {
          D: {
            expr: (v: Values) => {
              const u = used(v);
              return u.length ? `${mix(Math.max(...u))} − ${mix(Math.min(...u))}` : '0';
            },
            how: 'Find the X’s farthest apart. Take the shortest length from the longest.',
          },
        },
        'T = count × length, added': {
          T: {
            expr: terms,
            how: 'Each length times the X’s above it, all added.',
            work: (v: Values) =>
              xs
                .filter((id) => v[id]! > 0)
                .map((id) => `${v[id]} × ${mix(at(v, id))} = ${mix(v[id]! * at(v, id))}`),
          },
        },
      },
      example: { s: 3.75, a: 1, b: 2, c: 0, d: 3, e: 1, f: 2, g: 1, D: 1.5, T: 45.25 },
      startWith: ['s', ...xs],
      pictureLabels: ['D'],
      representation: {
        kind: 'linePlot',
        start: 's',
        marks: 4,
        startParts: 4,
        unit: 'in',
        points: xs.map((id, i) => ({ var: id, at: i })),
      },
    } satisfies ModuleDef;
  })(),
  // ── Multiplying a fraction by a whole number (4.NF.4) ──
  {
    id: 'm.4.fraction-times-whole',
    sliders: false,
    equation: '{n} × {a}/{b} = {p}/{b}',
    assumptions: [
      'A whole number times a fraction is that many copies of the fraction: 5 × 2/3 is 2/3 five times.',
      'Multiply the whole number by the numerator. The denominator stays: the parts are the same size.',
      'A product past 1 can be written as wholes and parts: 10/3 = 3 wholes and 1/3.',
      'Any fraction, even past 1 (3 × 4/3). Whole numbers to 10; denominators 2, 3, 4, 5, 6, 8, 10, 12.',
    ],
    variables: [
      whole('n', 'n', 'Whole number', 1, 10),
      whole('a', 'a', 'Numerator', 1, 24),
      { ...whole('b', 'b', 'Denominator', 2, 12), allowed: DENOMS_4 },
      whole('p', 'p', 'Numerator of the product', 1, 240),
      { ...whole('w', 'w', 'Wholes in the product', 0, 24), derived: true },
      { ...whole('r', 'r', 'Numerator of the fraction part', 0, 11), derived: true },
    ],
    relations: [
      {
        // The number line holds 24 wholes.
        id: 'p/b ≤ 24',
        constraint: true,
        display: '{p}/{b} is at most 24 wholes',
        vars: ['p', 'b'],
        residual: (v: Values) => (v.p! <= 24 * v.b! ? 0 : 1),
        solve: {},
      },
      {
        id: 'p = n × a',
        display: '{n} × {a}/{b} = {p}/{b}',
        words: 'Whole number × numerator = numerator of the product; the denominator stays',
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
        display: '{p}/{b} = {w} {r}/{b}',
        words: 'Numerator of the product = wholes × denominator + numerator of the fraction part',
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
        words: 'Full wholes in the product = {w}',
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
      'p/b ≤ 24': {},
      'p = n × a': {
        p: {
          expr: '{n} × {a}',
          how: 'Add the fraction that many times, or multiply the whole number by the numerator.',
          work: (v) =>
            v.n! >= 2 && v.n! <= 6 && v.b !== undefined
              ? [`${Array(v.n!).fill(`${v.a}/${v.b}`).join(' + ')} = ${v.p}/${v.b}`]
              : timesWork(v.n!, v.a!),
        },
        n: {
          expr: '{p} ÷ {a}',
          how: 'Divide the numerator of the product by the numerator: how many copies.',
          work: (v) => divideWork(v.p!, v.a!),
        },
        a: {
          expr: '{p} ÷ {n}',
          how: 'Divide the numerator of the product by the whole number.',
          work: (v) => divideWork(v.p!, v.n!, 'second'),
        },
      },
      'w = floor(p/b)': {
        w: {
          expr: 'wholes in {p} parts of {b}',
          how: 'Every full set of parts makes 1 whole. Divide by the denominator.',
          work: (v) =>
            v.w! > 0
              ? [
                  `${v.p} ÷ ${v.b} = ${v.w}${v.p! % v.b! ? `, remainder ${v.p! % v.b!}` : ''}: ${v.w} ${v.w === 1 ? 'whole' : 'wholes'}`,
                ]
              : [`${v.p} is less than ${v.b}, so the product is less than 1 whole.`],
        },
      },
      'w = wholes in p/b': {
        r: {
          expr: '{p} − {w} × {b}',
          how: 'Take away the parts that make wholes. The rest is the fraction part.',
          work: (v) => [`${v.w} × ${v.b} = ${v.w! * v.b!}`, `${v.p} − ${v.w! * v.b!} = ${v.r}`],
          note: (v) =>
            v.w! > 0
              ? v.r === 0
                ? `(${v.p}/${v.b} = ${v.w}: exactly ${v.w} ${v.w === 1 ? 'whole' : 'wholes'})`
                : `(${v.p}/${v.b} = ${v.w} ${v.w === 1 ? 'whole' : 'wholes'} and ${v.r}/${v.b})`
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
      'A number past 1 has ones before the point: 45.06 is 45 ones and 6 hundredths.',
    ],
    variables: [
      whole('t', 't', 'Tenths digit', 0, 9),
      whole('u', 'u', 'Hundredths digit', 0, 9),
      whole('h', 'h', 'Hundredths past the ones', 0, 99),
      whole('o', 'o', 'Ones', 0, 99),
      { id: 'd', symbol: 'd', name: 'As a decimal', min: 0, max: 99.99, step: 0.01 },
    ],
    relations: [
      {
        id: 'h = 10 × t + u',
        display: '{t}/10 + {u}/100 = {h}/100',
        words: 'Tenths digit × 10 + hundredths digit = {h}',
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
        words: 'Full tenths in the hundredths = {t}',
        vars: ['t', 'h'],
        residual: (v: Values) => v.t! - Math.floor(v.h! / 10),
        // Every count from 30 to 39 has 3 full tenths: the hundredths can't be found from it.
        solve: { t: (v: Values) => Math.floor(v.h! / 10), h: () => undefined },
      },
      {
        id: 'd = o + h ÷ 100',
        display: '{o} + {h}/100 = {d}',
        words: 'Ones + hundredths past the ones ÷ 100 = {d}',
        vars: ['d', 'o', 'h'],
        residual: (v: Values) => v.d! - v.o! - v.h! / 100,
        solve: {
          d: (v: Values) => v.o! + v.h! / 100,
          h: (v: Values) => Math.round((v.d! - v.o!) * 100),
          o: (v: Values) => v.d! - v.h! / 100,
        },
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
      'd = o + h ÷ 100': {
        d: {
          expr: '{o} + {h} ÷ 100',
          how: 'The ones go before the point. The tenths digit, then the hundredths digit, after it.',
          work: (v) => [
            `${v.o} ones and ${v.h} hundredths = ${v.o}.${String(v.h).padStart(2, '0')}`,
          ],
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
    example: { t: 3, u: 4, h: 34, o: 2, d: 2.34 },
    startWith: ['o', 't', 'u'],
    representation: { kind: 'grid100', percent: 'h', wholes: 'o', stack: true },
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
      use: 'Use this for race times like 8.28 and 8.2 seconds: which is less?',
      assumptions: [
        'Write both decimals as hundredths: 0.4 is 40 hundredths, 0.35 is 35 hundredths.',
        'Then compare the hundredths like whole numbers: 8.28 is 828 hundredths.',
        'The chart lines the places up and marks the first place where they differ.',
        'Decimals from 0 to 99.99.',
      ],
      variables: [
        { id: 'x', symbol: 'x', name: 'First decimal', min: 0, max: 99.99, step: 0.01 },
        { id: 'y', symbol: 'y', name: 'Second decimal', min: 0, max: 99.99, step: 0.01 },
        whole('a', 'a', 'First as hundredths', 0, 9999),
        whole('c', 'c', 'Second as hundredths', 0, 9999),
        whole('g', 'g', 'Hundredths apart', 0, 9999),
      ],
      relations: [
        {
          id: 'a = x × 100',
          display: '{x} = {a}/100',
          words: 'First decimal, in hundredths = {a}',
          vars: ['a', 'x'],
          residual: (v: Values) => v.a! - v.x! * 100,
          solve: { a: (v: Values) => Math.round(v.x! * 100), x: (v: Values) => v.a! / 100 },
        },
        {
          id: 'c = y × 100',
          display: '{y} = {c}/100',
          words: 'Second decimal, in hundredths = {c}',
          vars: ['c', 'y'],
          residual: (v: Values) => v.c! - v.y! * 100,
          solve: { c: (v: Values) => Math.round(v.y! * 100), y: (v: Values) => v.c! / 100 },
        },
        {
          ...gap.relation,
          words: 'Bigger hundredths − smaller hundredths = {g}',
          check: (v: Values) =>
            `${fmt(v.a!)} ${v.a! < v.c! ? '<' : v.a! > v.c! ? '>' : '='} ${fmt(v.c!)}, so ${fmt(v.x!)} ${v.a! < v.c! ? '<' : v.a! > v.c! ? '>' : '='} ${fmt(v.y!)}`,
        },
      ],
      steps: {
        'a = x × 100': {
          a: {
            expr: 'hundredths in {x}',
            how: 'Read the two digits after the point as hundredths. One digit: add a 0.',
            work: (v) => [
              v.x!.toFixed(2) === String(v.x)
                ? `${fmt(v.x!)} = ${fmt(v.a!)} hundredths`
                : `${fmt(v.x!)} = ${v.x!.toFixed(2)} = ${fmt(v.a!)} hundredths`,
            ],
          },
          x: {
            expr: '{a} ÷ 100',
            how: 'Hundredths go two places after the point.',
            work: (v) => [`${fmt(v.a!)} hundredths = ${(v.a! / 100).toFixed(2)}`],
          },
        },
        'c = y × 100': {
          c: {
            expr: 'hundredths in {y}',
            how: 'Read the two digits after the point as hundredths. One digit: add a 0.',
            work: (v) => [
              v.y!.toFixed(2) === String(v.y)
                ? `${fmt(v.y!)} = ${fmt(v.c!)} hundredths`
                : `${fmt(v.y!)} = ${v.y!.toFixed(2)} = ${fmt(v.c!)} hundredths`,
            ],
          },
          y: {
            expr: '{c} ÷ 100',
            how: 'Hundredths go two places after the point.',
            work: (v) => [`${fmt(v.c!)} hundredths = ${(v.c! / 100).toFixed(2)}`],
          },
        },
        // The answer to "which is greater?", after how far apart they are.
        [gap.relation.id]: {
          ...(gap.steps as Record<string, StepText>),
          g: {
            ...(gap.steps as Record<string, StepText>).g!,
            note: (v: Values) => {
              const sign = v.a! < v.c! ? '<' : v.a! > v.c! ? '>' : '=';
              return `(${fmt(v.a!)} ${sign} ${fmt(v.c!)}, so ${fmt(v.x!)} ${sign} ${fmt(v.y!)})`;
            },
          },
        } as Record<string, StepText>,
      },
      example: { x: 0.4, y: 0.35, a: 40, c: 35, g: 5 },
      startWith: ['x', 'y'],
      representation: { kind: 'placeValueChart', value: 'x', decimals: 2, compare: 'y' },
    } satisfies ModuleDef;
  })(),
  // ── Decimals on a number line (4.NF.6) ──
  {
    id: 'm.4.decimals-intro~number-line',
    title: 'Fractions and decimals on the number line',
    use: 'Use this for “Point A is 6 spaces after 2. What decimal is it?”',
    assumptions: [
      'Cut the line from 0 to 1 into 10 equal parts for tenths, or 100 for hundredths.',
      'Count the parts from 0: 62 hundredths from 0 is 0.62, and 26 tenths is 2.6.',
      '7 tenths and 70 hundredths are the same point.',
      'The line starts at the whole before the point: 2.6 is 6 tenths past 2.',
    ],
    variables: [
      { ...whole('n', 'n', 'Parts from 0 to 1', 10, 100), allowed: [10, 100] },
      whole('k', 'k', 'Parts from 0', 0, 1000),
      { id: 'd', symbol: 'd', name: 'As a decimal', min: 0, max: 10, step: 0.01 },
      { ...whole('w', 'w', 'Whole before the point', 0, 10), derived: true },
    ],
    relations: [
      {
        id: 'd = k ÷ n',
        display: '{k}/{n} = {d}',
        words: 'Parts from 0 ÷ parts from 0 to 1 = {d}',
        vars: ['d', 'k', 'n'],
        residual: (v: Values) => v.d! - v.k! / v.n!,
        solve: {
          d: (v: Values) => v.k! / v.n!,
          k: (v: Values) => v.d! * v.n!,
          n: (v: Values) => div(v.k!, v.d!),
        },
      },
      {
        id: 'w = floor(k/n)',
        display: 'full wholes in {k}/{n}: {w}',
        words: 'Full wholes before the point = {w}',
        vars: ['w', 'k', 'n'],
        residual: (v: Values) => v.w! - Math.floor(v.k! / v.n!),
        solve: {
          w: (v: Values) => Math.floor(v.k! / v.n!),
          k: () => undefined,
          n: () => undefined,
        },
      },
    ],
    steps: {
      'd = k ÷ n': {
        d: {
          expr: '{k} ÷ {n}',
          how: (v) =>
            v.n === 10
              ? 'Tenths: one place after the point.'
              : 'Hundredths: two places after the point.',
          work: (v) => [
            `${v.k} ${v.n === 10 ? 'tenths' : 'hundredths'} = ${v.d!.toFixed(v.n === 10 ? 1 : 2)}`,
          ],
        },
        k: {
          expr: '{d} × {n}',
          how: 'Read the digits after the point as tenths or hundredths.',
          work: (v) => [
            `${v.d!.toFixed(v.n === 10 ? 1 : 2)} = ${v.k} ${v.n === 10 ? 'tenths' : 'hundredths'}`,
          ],
        },
        n: {
          expr: '{k} ÷ {d}',
          how: 'How many of these parts make 1 whole?',
        },
      },
      'w = floor(k/n)': {
        w: {
          expr: 'wholes in {k} parts of {n}',
          how: 'Every full set of parts is 1 whole: the line starts at the whole before the point.',
          work: (v) =>
            v.w! > 0
              ? [`${v.w} × ${v.n} = ${v.w! * v.n!}: ${v.w} ${v.w === 1 ? 'whole' : 'wholes'}`]
              : [`${v.k} is less than ${v.n}, so the point is before 1.`],
        },
      },
    },
    example: { n: 100, k: 62, d: 0.62, w: 0 },
    startWith: ['n', 'k'],
    representation: {
      kind: 'fractionLine',
      numerator: 'k',
      denominator: 'n',
      wholes: 1,
      decimal: true,
      // From the whole before the point: a line from 2 to 3 in tenths for 2.6.
      startWhole: 'w',
    },
  },
  // ── Converting units within one system: a conversion table (4.MD.1) ──
  (() => {
    const fmt = (x: number) => formatNumber(x);
    const PAIRS: Record<number, string> = {
      2: '1 pint = 2 cups (or 1 quart = 2 pints)',
      3: '1 yard = 3 feet',
      4: '1 gallon = 4 quarts (or 1 quart = 4 cups)',
      7: '1 week = 7 days',
      10: '1 centimeter = 10 millimeters',
      12: '1 foot = 12 inches',
      16: '1 pound = 16 ounces',
      24: '1 day = 24 hours',
      60: '1 hour = 60 minutes',
      100: '1 meter = 100 centimeters',
      1000: '1 kilometer = 1,000 meters (or 1 kilogram = 1,000 grams, 1 liter = 1,000 milliliters)',
    };
    // The smaller unit, where the number names only one pair.
    const SMALL: Record<number, string> = {
      3: 'feet',
      7: 'days',
      10: 'millimeters',
      12: 'inches',
      16: 'ounces',
      24: 'hours',
      60: 'minutes',
      100: 'centimeters',
    };
    return {
      id: 'm.4.unit-conversion',
      assumptions: [
        'A bigger unit is a fixed number of smaller units: 1 foot = 12 inches, 1 hour = 60 minutes.',
        'Also 1 yard = 3 feet, 1 week = 7 days, 1 day = 24 hours, 1 pound = 16 ounces, 1 centimeter = 10 millimeters, 1 meter = 100 centimeters.',
        'Also 1 pint = 2 cups, 1 quart = 2 pints, 1 quart = 4 cups and 1 gallon = 4 quarts.',
        '1 kilometer, 1 kilogram or 1 liter is 1,000 of the smaller unit.',
        'To change bigger units into smaller ones, multiply by that number. A table shows the pattern.',
      ],
      variables: [
        whole('b', 'b', 'Bigger units', 1, 100),
        {
          ...whole('k', 'k', 'Smaller units in 1 bigger unit', 2, 1000),
          allowed: [2, 3, 4, 7, 10, 12, 16, 24, 60, 100, 1000],
        },
        whole('s', 's', 'Smaller units', 2, 100000),
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
            note: (v) => (SMALL[v.k!] ? `(${fmt(v.s!)} ${SMALL[v.k!]})` : ''),
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
      title: 'Mixed measures',
      use: 'Use this for 3 feet 5 inches as inches, or 150 minutes as hours and minutes.',
      assumptions: [
        'A measurement can mix units: 3 feet 5 inches, or 2 hours 15 minutes.',
        'Change the bigger units to smaller ones, then add the extra smaller units.',
        'The extra is less than one bigger unit.',
        'Going back: divide by the smaller units in one. The remainder is the extra.',
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
          id: 'b = whole bigger units in t',
          display: 'whole groups of {k} in {t} = {b}',
          words: 'Smaller units in all ÷ smaller units in one bigger = {b}, with some left over',
          vars: ['b', 't', 'k'],
          residual: (v: Values) => v.b! - Math.floor(v.t! / v.k!),
          solve: {
            b: (v: Values) => Math.floor(v.t! / v.k!),
            t: () => undefined,
            k: () => undefined,
          },
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
        'b = whole bigger units in t': {
          b: {
            expr: 'whole groups of {k} in {t}',
            how: 'Divide the smaller units by how many make one bigger unit. Keep the whole number.',
            work: (v) => [`${v.t} ÷ ${v.k} = ${v.b}, remainder ${v.t! - v.b! * v.k!}`],
          },
        },
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
            work: (v) => [`${v.m} + ${v.e} = ${v.t}`],
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
        'Whole-number sides up to 100.',
      ],
      variables: [
        { ...whole('l', 'l', 'Length', 1, 100), unit: 'm' },
        { ...whole('w', 'w', 'Width', 1, 100), unit: 'm' },
        { ...whole('A', 'A', 'Area', 1, 10000), unit: 'm²' },
        { ...whole('h', 'h', 'Half the perimeter', 2, 200), unit: 'm', derived: true },
        { ...whole('P', 'P', 'Perimeter', 4, 400), unit: 'm' },
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
          words: 'Length + width = half the perimeter',
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
            how: 'The perimeter is two lengths and two widths: double the half perimeter.',
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
  // ── A square: every side the same (4.MD.3; NAEP 2003-4M6 #10, 2011-4M9 #7) ──
  {
    id: 'm.4.area-perimeter-formulas~square',
    title: 'Perimeter and area of a square',
    use: 'Use this for a square: “The perimeter of a square is 36 meters. How long is each side?”',
    assumptions: [
      'A square has 4 sides, all the same length.',
      'Perimeter is the distance around: 4 × side.',
      'Area is the space inside: side × side, in square units.',
      'Whole-number sides up to 100.',
    ],
    variables: [
      { ...whole('s', 's', 'Side', 1, 100), unit: 'm' },
      { ...whole('P', 'P', 'Perimeter', 4, 400), unit: 'm' },
      { ...whole('A', 'A', 'Area', 1, 10000), unit: 'm²' },
    ],
    relations: [
      {
        id: 'P = 4 × s',
        display: '4 × {s} = {P}',
        words: '4 × side = perimeter',
        vars: ['P', 's'],
        residual: (v: Values) => v.P! - 4 * v.s!,
        solve: { P: (v: Values) => 4 * v.s!, s: (v: Values) => v.P! / 4 },
      },
      {
        id: 'A = s × s',
        display: '{s} × {s} = {A}',
        words: 'Side × side = area',
        vars: ['A', 's'],
        residual: (v: Values) => v.A! - v.s! * v.s!,
        solve: { A: (v: Values) => v.s! * v.s! },
      },
    ],
    steps: {
      'P = 4 × s': {
        P: {
          expr: '4 × {s}',
          how: 'All 4 sides are the same: multiply the side by 4.',
          work: (v) => timesWork(4, v.s!),
        },
        s: {
          expr: '{P} ÷ 4',
          how: 'The perimeter is 4 equal sides: divide it by 4.',
          work: (v) => divideWork(v.P!, 4),
        },
      },
      'A = s × s': {
        A: {
          expr: '{s} × {s}',
          how: 'Multiply the side by itself: rows of unit squares.',
          work: (v) => timesWork(v.s!, v.s!),
        },
      },
    },
    example: { s: 9, P: 36, A: 81 },
    startWith: ['P'],
    representation: {
      kind: 'rectangle',
      length: 's',
      width: 's',
      inside: 'A',
      around: 'P',
      extent: 10,
    },
  } satisfies ModuleDef,
  // ── Angles: degrees as parts of a turn, and angle addition (4.MD.5, 4.MD.7) ──
  {
    id: 'm.4.angles',
    sliders: false,
    // Typed where it is written (K–6 diagram review).
    equation: '{a}° + {b}° = {w}°',
    assumptions: [
      'A full turn is 360 degrees. One degree is 1/360 of a turn.',
      'A right angle is 90°: a quarter turn. A straight angle is 180°: a half turn.',
      'Two angles that share a vertex and a ray add up: the whole angle is their sum, up to a straight angle.',
      'Give the whole angle and one part to find the other part: the parts subtract.',
      'Drag the middle ray, or use the sliders, to change the angles.',
    ],
    variables: [
      { ...whole('a', 'a', 'First angle', 1, 179), unit: '°' },
      { ...whole('b', 'b', 'Second angle', 1, 179), unit: '°' },
      { ...whole('w', 'w', 'Whole angle', 2, 180), unit: '°' },
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
    title: 'Measure angles with a protractor',
    use: 'Use this for “What is the measure of the angle?” on a protractor, either scale.',
    assumptions: [
      'Put the centre of the protractor on the corner and one arm along the 0° line.',
      'Read the scale that starts at 0 on that arm. The other scale reads 180° minus the angle.',
      'Angles from 0° to 180°.',
    ],
    variables: [
      { ...whole('a', 'a', 'Angle', 0, 180), unit: '°' },
      { ...whole('r', 'r', 'Reading on the other scale', 0, 180), unit: '°' },
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
          how: 'The other scale counts from the other end of the protractor.',
        },
        a: {
          expr: '180 − {r}',
          how: 'The scale that starts at the arm counts the angle: take the other reading from 180.',
        },
      },
    },
    example: { a: 35, r: 145 },
    startWith: ['a'],
    representation: { kind: 'protractor', angle: 'a', other: 'r' },
  },
  // Neither arm on 0 (4.MD.6): read both arms on one scale and subtract.
  {
    id: 'm.4.angles~arms',
    title: 'Measure angles: neither ray on zero',
    use: 'Use this for “One ray points to 45 and the other to 135. What is the angle?”',
    pictureLabels: ['a'],
    assumptions: [
      'Read both arms on the same scale of the protractor.',
      'The angle is the difference between the two readings.',
      'Readings from 0° to 180°.',
    ],
    variables: [
      { ...whole('f', 'f', 'First arm reads', 0, 180), unit: '°' },
      { ...whole('s', 's', 'Second arm reads', 0, 180), unit: '°' },
      { ...whole('a', 'a', 'Angle', 0, 180), unit: '°' },
    ],
    relations: [
      atLeast('s', 'f'),
      {
        id: 'a = s − f',
        display: '{s} − {f} = {a}',
        words: 'Second arm reads − first arm reads = angle',
        vars: ['a', 's', 'f'],
        residual: (v: Values) => v.a! - (v.s! - v.f!),
        solve: {
          a: (v: Values) => v.s! - v.f!,
          s: (v: Values) => v.f! + v.a!,
          f: (v: Values) => v.s! - v.a!,
        },
      },
    ],
    steps: {
      's ≥ f': {},
      'a = s − f': {
        a: { expr: '{s} − {f}', how: 'Take the smaller reading from the bigger one.' },
        s: { expr: '{f} + {a}', how: 'Turn on from the first arm by the angle.' },
        f: { expr: '{s} − {a}', how: 'Turn back from the second arm by the angle.' },
      },
    },
    example: { f: 45, s: 135, a: 90 },
    startWith: ['f', 's'],
    representation: { kind: 'protractor', angle: 'a', arms: { first: 'f', second: 's' } },
  },
  // ── Angles as fractions of a turn (4.MD.5) ──
  {
    id: 'm.4.angles~turns',
    title: 'Understand angles as parts of a turn',
    use: 'Use this for “a quarter turn is how many degrees?” or “how many 20° angles make a full turn?”',
    assumptions: [
      'A full turn is 360°. Cut the turn into equal parts: a quarter turn is 360 ÷ 4 = 90°.',
      'An angle that is some of those parts is that many times the part: 3 quarter turns is 270°.',
      'The turn is cut into 2, 3, 4, 5, 6, 8, 9, 10, 12, 18 or 36 equal parts.',
    ],
    variables: [
      // Every count that divides 360 into whole degrees a class meets (20° parts: 18 of them).
      {
        ...whole('k', 'k', 'Equal parts of the turn', 2, 36),
        allowed: [2, 3, 4, 5, 6, 8, 9, 10, 12, 18, 36],
      },
      whole('n', 'n', 'Parts in the angle', 1, 36),
      { ...whole('e', 'e', 'One part', 10, 180), unit: '°' },
      { ...whole('a', 'a', 'Angle', 10, 360), unit: '°' },
      { ...whole('r', 'r', 'Rest of the turn', 0, 350), unit: '°', derived: true },
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
        id: 'a + r = 360',
        display: '{a} + {r} = 360',
        words: 'Angle + rest of the turn = 360',
        vars: ['r', 'a'],
        residual: (v: Values) => 360 - v.a! - v.r!,
        solve: { r: (v: Values) => 360 - v.a!, a: (v: Values) => 360 - v.r! },
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
        k: {
          expr: '360 ÷ {e}',
          how: 'How many of that part fill the turn.',
          work: (v) => divideWork(360, v.e!),
        },
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
      'a + r = 360': {
        r: { expr: '360 − {a}', how: 'What is left of the full turn of 360°.' },
        a: { expr: '360 − {r}', how: 'Take the rest away from the full turn of 360°.' },
      },
    },
    example: { k: 4, n: 3, e: 90, a: 270, r: 90 },
    startWith: ['k', 'n'],
    representation: { kind: 'angles', parts: ['a', 'r'], whole: 360, sliders: ['k', 'n'] },
  },

  // ── Estimate sums and differences by rounding (4.NBT.3, 4.NBT.4): the textbooks' lesson ──
  ...(['sum', 'difference'] as const).map((kind) => {
    const isSum = kind === 'sum';
    const op = isSum ? '+' : '−';
    const round = (n: number, p: number) => Math.round(n / p) * p;
    return {
      id: `m.4.place-value-million~estimate-${kind}`,
      sliders: false,
      title: isSum ? 'Estimate sums' : 'Estimate differences',
      use: isSum
        ? 'Use this for “About how many in all? 36,325 + 23,310” by rounding first.'
        : 'Use this for “About how many more? 61,209 − 27,845” by rounding first.',
      assumptions: [
        'Round each number to the same place: hundreds, thousands or ten thousands.',
        isSum
          ? 'Add the rounded numbers. The estimate is close to the real sum.'
          : 'Subtract the rounded numbers. The estimate is close to the real difference.',
        'Use the estimate to check an exact answer: they should be close.',
      ],
      variables: [
        whole('a', 'a', isSum ? 'First number' : 'Start', 1, 999999),
        whole('b', 'b', isSum ? 'Second number' : 'Take away', 1, 999999),
        { ...whole('p', 'p', 'Round to', 100, 10000), allowed: [100, 1000, 10000] },
        {
          ...whole('ra', 'r', isSum ? 'First number rounded' : 'Start rounded', 0, 1000000),
          derived: true,
        },
        {
          ...whole('rb', 's', isSum ? 'Second number rounded' : 'Take away rounded', 0, 1000000),
          derived: true,
        },
        {
          ...whole('e', 'e', isSum ? 'Estimated sum' : 'Estimated difference', 0, 2000000),
          derived: true,
        },
      ],
      relations: [
        ...(isSum
          ? []
          : [
              {
                id: 'b ≤ a',
                constraint: true,
                display: 'Take away {b} is not more than the start {a}',
                vars: ['a', 'b'],
                residual: (v: Values) => (v.b! <= v.a! ? 0 : 1),
                solve: {},
              },
            ]),
        {
          id: 'ra = a rounded',
          display: '{a} rounded to the {p}s: {ra}',
          words: isSum
            ? 'The first number rounded to the place = {ra}'
            : 'The start rounded to the place = {ra}',
          vars: ['ra', 'a', 'p'],
          residual: (v: Values) => v.ra! - round(v.a!, v.p!),
          solve: { ra: (v: Values) => round(v.a!, v.p!), a: () => undefined, p: () => undefined },
        },
        {
          id: 'rb = b rounded',
          display: '{b} rounded to the {p}s: {rb}',
          words: isSum
            ? 'The second number rounded to the place = {rb}'
            : 'The take-away rounded to the place = {rb}',
          vars: ['rb', 'b', 'p'],
          residual: (v: Values) => v.rb! - round(v.b!, v.p!),
          solve: { rb: (v: Values) => round(v.b!, v.p!), b: () => undefined, p: () => undefined },
        },
        {
          id: `e = ra ${op} rb`,
          display: `{ra} ${op} {rb} = {e}`,
          vars: ['e', 'ra', 'rb'],
          residual: (v: Values) => v.e! - (isSum ? v.ra! + v.rb! : v.ra! - v.rb!),
          solve: {
            e: (v: Values) => (isSum ? v.ra! + v.rb! : v.ra! - v.rb!),
            ra: (v: Values) => (isSum ? v.e! - v.rb! : v.e! + v.rb!),
            rb: (v: Values) => (isSum ? v.e! - v.ra! : v.ra! - v.e!),
          },
        },
      ],
      steps: {
        ...(isSum ? {} : { 'b ≤ a': {} }),
        'ra = a rounded': {
          ra: {
            expr: '{a} rounded to the {p}s',
            how: 'Look at the digit to the right of the place. 5 or more rounds up.',
            work: (v: Values) => [
              `${fmt(v.a!)} is between ${fmt(Math.floor(v.a! / v.p!) * v.p!)} and ${fmt(Math.floor(v.a! / v.p!) * v.p! + v.p!)} → ${fmt(v.ra!)}`,
            ],
          },
        },
        'rb = b rounded': {
          rb: {
            expr: '{b} rounded to the {p}s',
            how: isSum
              ? 'Round the second number to the same place.'
              : 'Round the take-away to the same place.',
            work: (v: Values) => [
              `${fmt(v.b!)} is between ${fmt(Math.floor(v.b! / v.p!) * v.p!)} and ${fmt(Math.floor(v.b! / v.p!) * v.p! + v.p!)} → ${fmt(v.rb!)}`,
            ],
          },
        },
        [`e = ra ${op} rb`]: {
          e: {
            expr: `{ra} ${op} {rb}`,
            how: isSum
              ? 'Add the rounded numbers. Rounded numbers are easy to add in your head.'
              : 'Subtract the rounded numbers. Rounded numbers are easy to subtract in your head.',
            written: false,
            note: (v: Values) => `(the exact ${kind} is ${fmt(isSum ? v.a! + v.b! : v.a! - v.b!)})`,
          },
          ra: {
            expr: `{e} ${isSum ? '−' : '+'} {rb}`,
            how: isSum
              ? 'Take the second rounded number from the estimate.'
              : 'Add the rounded number taken away back to the estimate.',
          },
          rb: {
            expr: isSum ? '{e} − {ra}' : '{ra} − {e}',
            how: isSum
              ? 'Take the first rounded number from the estimate.'
              : 'Take the estimate from the rounded start.',
          },
        },
      } as Record<string, Record<string, StepText>>,
      example: isSum
        ? { a: 36325, b: 23310, p: 1000, ra: 36000, rb: 23000, e: 59000 }
        : { a: 61209, b: 27845, p: 1000, ra: 61000, rb: 28000, e: 33000 },
      startWith: ['a', 'b', 'p'],
      representation: isSum
        ? { kind: 'tape', parts: ['ra', 'rb'], total: 'e' }
        : { kind: 'tape', parts: ['e', 'rb'], total: 'ra' },
    } satisfies ModuleDef;
  }),
  // ── Subtract across zeros (4.NBT.4): 5,000 − 2,346 ──
  {
    id: 'm.4.place-value-million~subtract-zeros',
    sliders: false,
    equation: '{a} − {b} = {c}',
    title: 'Subtract across zeros',
    use: 'Use this for “Subtract: 5,000 − 2,346” when the start has zeros to regroup across.',
    assumptions: [
      'A zero has nothing to regroup from. Go left to the first place that is not zero.',
      'Regroup 1 from that place: each zero in between becomes 9, and the ones place gets 10.',
      'Think of a start like 5,000 as 4 thousands, 9 hundreds, 9 tens and 10 ones. The start is a multiple of 100.',
    ],
    variables: [
      { ...whole('a', 'a', 'Start', 100, 1000000), step: 100, multipleOf: 100 },
      whole('b', 'b', 'Take away', 0, 1000000),
      whole('c', 'c', 'Difference', 0, 1000000),
    ],
    relations: [
      {
        id: 'b ≤ a',
        constraint: true,
        display: 'Take away {b} is not more than the start {a}',
        vars: ['a', 'b'],
        residual: (v: Values) => (v.b! <= v.a! ? 0 : 1),
        solve: {},
      },
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
      'b ≤ a': {},
      'a − b = c': {
        c: {
          expr: '{a} − {b}',
          how: 'Regroup across the zeros first: the zeros become 9s and the ones place gets 10. Then subtract each place.',
          written: (v: Values) => columnSubtract(v.a!, v.b!),
        },
        a: { expr: '{c} + {b}', how: 'Add back what was taken away, in columns.' },
        b: { expr: '{a} − {c}', how: 'Take the difference away from the start, in columns.' },
      },
    },
    example: { a: 5000, b: 2346, c: 2654 },
    startWith: ['a', 'b'],
    representation: { kind: 'tape', parts: ['c', 'b'], total: 'a' },
  },
  // ── Tenths and hundredths together (4.NF.5): 3/10 + 4/100 = 34/100 = 0.34 ──
  {
    id: 'm.4.decimals-intro~tenths-hundredths',
    sliders: false,
    equation: '{t}/10 + {h}/100 = {s}/100',
    title: 'Add tenths and hundredths',
    use: 'Use this for “Find the value of 3/10 + 4/100” and write the sum as a decimal (sums under one whole).',
    assumptions: [
      'A tenth is 10 hundredths, so 3/10 = 30/100. Write the tenths as hundredths first.',
      'Then add the hundredths. The sum is in hundredths.',
      'Hundredths written as a decimal: 34/100 = 0.34. The sum stays less than one whole.',
    ],
    variables: [
      whole('t', 't', 'Tenths', 1, 9),
      whole('h', 'h', 'Hundredths', 1, 99),
      {
        ...whole('k', 'k', 'The tenths as hundredths', 10, 90),
        step: 10,
        multipleOf: 10,
        derived: true,
      },
      whole('s', 's', 'Hundredths in all', 11, 99),
      {
        id: 'd',
        symbol: 'd',
        name: 'The sum as a decimal',
        min: 0.11,
        max: 1.89,
        step: 0.01,
        derived: true,
      },
    ],
    relations: [
      {
        id: 's < 100',
        constraint: true,
        display: 'The sum {s}/100 is less than one whole',
        vars: ['s'],
        residual: (v: Values) => (v.s! < 100 ? 0 : 1),
        solve: {},
      },
      {
        id: 'k = t × 10',
        display: '{t}/10 = {k}/100',
        words: 'Tenths × 10 = the same amount in hundredths',
        vars: ['k', 't'],
        residual: (v: Values) => v.k! - 10 * v.t!,
        solve: { k: (v: Values) => 10 * v.t!, t: (v: Values) => div(v.k!, 10) },
      },
      {
        id: 's = k + h',
        display: '{k}/100 + {h}/100 = {s}/100',
        vars: ['s', 'k', 'h'],
        residual: (v: Values) => v.s! - v.k! - v.h!,
        solve: {
          s: (v: Values) => v.k! + v.h!,
          k: (v: Values) => v.s! - v.h!,
          h: (v: Values) => v.s! - v.k!,
        },
      },
      {
        id: 'd = s ÷ 100',
        display: '{s}/100 = {d}',
        words: 'Hundredths in all ÷ 100 = the decimal',
        vars: ['d', 's'],
        residual: (v: Values) => v.d! * 100 - v.s!,
        solve: { d: (v: Values) => v.s! / 100, s: (v: Values) => Math.round(v.d! * 100) },
      },
    ],
    steps: {
      's < 100': {},
      'k = t × 10': {
        k: {
          expr: '{t} × 10',
          how: 'Each tenth is 10 hundredths: one column of the hundred grid.',
        },
        t: { expr: '{k} ÷ 10', how: 'Every 10 hundredths make one tenth.' },
      },
      's = k + h': {
        s: { expr: '{k} + {h}', how: 'Now both parts are hundredths. Add them.' },
        k: {
          expr: '{s} − {h}',
          how: 'Take the hundredths from the total to get the tenths part, in hundredths.',
        },
        h: { expr: '{s} − {k}', how: 'Take the tenths part, in hundredths, from the total.' },
      },
      'd = s ÷ 100': {
        d: {
          expr: '{s} ÷ 100',
          how: 'Hundredths go two places after the point: the last digit is in the hundredths place.',
        },
        s: {
          expr: '{d} × 100',
          how: 'Read the decimal as hundredths: the digits after the point count hundredths.',
        },
      },
    },
    example: { t: 3, h: 4, k: 30, s: 34, d: 0.34 },
    startWith: ['t', 'h'],
    representation: { kind: 'grid100', percent: 's' },
  },
  // ── Money as decimals (4.MD.2): $3.45 + $1.80 ──
  {
    id: 'm.4.decimals-intro~money',
    sliders: false,
    equation: '${a} + ${b} = ${c}',
    title: 'Solve problems involving money',
    use: 'Use this for “A book costs $3.45 and a pen $1.80. How much in all?” For what is left, give the total and one price.',
    assumptions: [
      'Money is a decimal: dollars before the point, cents after. $3.45 is 3 dollars and 45 cents.',
      'Line up the points and add or subtract like whole numbers. Each amount to $999.99.',
      'To find what is left, take the price from the total: total − price = left.',
    ],
    variables: [
      { id: 'a', symbol: 'a', name: 'First amount', unit: '$', min: 0, max: 999.99, step: 0.01 },
      { id: 'b', symbol: 'b', name: 'Second amount', unit: '$', min: 0, max: 999.99, step: 0.01 },
      { id: 'c', symbol: 'c', name: 'Total', unit: '$', min: 0, max: 1999.98, step: 0.01 },
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
          how: 'Line up the points. Add the cents, then the dollars, regrouping 100 cents as a dollar.',
          written: (v: Values) => decimalColumns('+', [v.a!, v.b!]),
        },
        a: {
          expr: '{c} − {b}',
          how: 'Take the second amount from the total: what is left after paying it.',
          written: (v: Values) => decimalColumns('−', [v.c!, v.b!]),
        },
        b: {
          expr: '{c} − {a}',
          how: 'Take the first amount from the total: what is left after paying it.',
          written: (v: Values) => decimalColumns('−', [v.c!, v.a!]),
        },
      },
    },
    example: { a: 3.45, b: 1.8, c: 5.25 },
    startWith: ['a', 'b'],
    representation: { kind: 'tape', parts: ['a', 'b'], total: 'c' },
  },
];
