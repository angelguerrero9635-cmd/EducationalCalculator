/**
 * Grade 2 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { formatNumber } from '@/engine/format';
import type { Values } from '@/engine/types';
import { addWork, cmpBars, countUpWork, div, fractionNote, subtractWork, whole } from '../helpers';
import { addSub } from '../shared/add-sub';
import { compareNumbers, compareProblem } from '../shared/compare';
import type { ModuleDef } from '../types';
import {
  addAll,
  addStrategy,
  countList,
  countUp,
  dealLines,
  missingPart,
  repeated,
  subtractStrategy,
  sumSteps,
} from '../work';

/** Money in the dollars-and-cents module: each coin's id, value in cents and names. */
const MONEY = [
  { id: 'db', cents: 100, one: 'dollar', many: 'dollars' },
  { id: 'q', cents: 25, one: 'quarter', many: 'quarters' },
  { id: 'dm', cents: 10, one: 'dime', many: 'dimes' },
  { id: 'nk', cents: 5, one: 'nickel', many: 'nickels' },
  { id: 'pn', cents: 1, one: 'penny', many: 'pennies' },
] as const;
type Coin = (typeof MONEY)[number];
/** "2 quarters: 25, 50 → 50¢" (counting on), "1 dime = 10¢", "3 pennies = 3¢". */
function coinLine(c: Coin, n: number): string {
  const name = n === 1 ? c.one : c.many;
  if (n === 1 || c.cents === 1) return `${n} ${name} = ${n * c.cents}¢`;
  const counts = Array.from({ length: n }, (_, i) => (i + 1) * c.cents);
  return `${n} ${name}: ${counts.join(', ')} → ${n * c.cents}¢`;
}
/** "{db} dollar + {q} quarters + …" with singular or plural names to match the counts. */
const moneyWords = (v: Values, skip?: string) =>
  MONEY.filter((c) => c.id !== skip)
    .map((c) => `{${c.id}} ${v[c.id] === 1 ? c.one : c.many}`)
    .join(skip ? ' − ' : ' + ');
/** Each kind of money the student has, in cents (dollars first). */
const moneyParts = (v: Values, skip?: string) =>
  MONEY.filter((c) => c.id !== skip && (v[c.id] ?? 0) > 0).map((c) => ({
    coin: c,
    n: v[c.id]!,
    cents: v[c.id]! * c.cents,
  }));
/** Counting-on lines for each kind of coin (2 quarters: 25, 50 → 50¢), and always the dollars. */
const countOnLines = (parts: ReturnType<typeof moneyParts>) =>
  parts
    .filter((p) => (p.n > 1 && p.coin.cents > 1) || p.coin.cents === 100)
    .map((p) => coinLine(p.coin, p.n));
/** Counting on coin by coin, worth the most first: "Count on: 100¢, 125¢, 150¢, 160¢". */
function runningCount(parts: ReturnType<typeof moneyParts>): string[] {
  const coins = parts.flatMap((p) => Array<number>(p.n).fill(p.coin.cents));
  if (coins.length < 2 || coins.length > 12) return [];
  let sum = 0;
  return [`Count on: ${coins.map((x) => `${(sum += x)}¢`).join(', ')}`];
}
/** Worked lines for the total: count on each kind of coin, then add the parts in cents. */
function moneyTotalWork(v: Values): string[] {
  const parts = moneyParts(v);
  if (parts.length === 0) return [];
  const total = parts.reduce((sum, p) => sum + p.cents, 0);
  const running = runningCount(parts);
  // Count on coin by coin; with many coins, add each kind's value one at a time instead.
  // The coin-by-coin count already counts each kind, so with it the per-kind lines just give
  // each kind's value ("2 quarters = 50¢").
  return [
    ...(running.length
      ? parts
          .filter((p) => (p.n > 1 && p.coin.cents > 1) || p.coin.cents === 100)
          .map((p) => `${p.n} ${p.n === 1 ? p.coin.one : p.coin.many} = ${p.cents}¢`)
      : countOnLines(parts)),
    ...(running.length
      ? running
      : sumSteps(
          parts.map((p) => p.cents),
          '¢',
        )),
    ...(running.length === 0 && parts.length === 2
      ? [`${parts[0]!.cents}¢ + ${parts[1]!.cents}¢ = ${total}¢`]
      : []),
  ];
}
/** Worked lines for one kind of coin: the other money, what is left, then count by its value. */
function moneyCoinWork(coin: Coin) {
  return (v: Values): string[] => {
    const parts = moneyParts(v, coin.id);
    const other = parts.reduce((sum, p) => sum + p.cents, 0);
    const left = v.T! - other;
    const n = left / coin.cents;
    return [
      ...countOnLines(parts),
      parts.length === 0
        ? 'No other money: 0¢'
        : parts.length === 1
          ? `Other money: ${other}¢`
          : runningCount(parts).length
            ? `Other money: ${runningCount(parts)[0]!.replace('Count on: ', 'count on ')}`
            : `Other money: ${parts.map((p) => `${p.cents}¢`).join(' + ')} = ${other}¢`,
      `${v.T}¢ − ${other}¢ = ${left}¢ left`,
      coin.cents === 1 || left === 0
        ? `${left}¢ → ${n} ${n === 1 ? coin.one : coin.many}`
        : `Count by ${coin.cents}s to ${left}: ${countList(0, coin.cents, n)} → ${n} ${n === 1 ? coin.one : coin.many}`,
    ];
  };
}
/** The total written in dollars and cents too, e.g. "($1.68)". */
const inDollars = (v: Values) =>
  `($${Math.floor(v.T! / 100)}.${String(v.T! % 100).padStart(2, '0')})`;
/** "347 = 300 + 40 + 7", leaving out places that are 0 ("305 = 300 + 5"). */
const placeLine = (n: number) => {
  const parts = [Math.floor(n / 100) * 100, Math.floor((n % 100) / 10) * 10, n % 10].filter(
    (x) => x > 0,
  );
  return parts.length > 1 ? [`${n} = ${parts.join(' + ')}`] : [];
};
/** Cents written as dollars and cents, e.g. "$1.35". */
const dollars = (cents: number) =>
  `$${Math.floor(cents / 100)}.${String(Math.round(cents % 100)).padStart(2, '0')}`;
/** "1 rhombus", "2 rhombuses". */
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
/** "Count on from 4: 5, 6, 7 → 3" (how many to count on from one amount to another). */
const countOn = (from: number, to: number) =>
  to > from ? [`Count on from ${from}: ${countList(from, 1, to - from)} → ${to - from}`] : [];
/** "$10 bills: 10, 20 → $20" and "$5 bills: 5 → $5" for the bills there are. */
const billLines = (t: number, f: number) => [
  ...(t > 0 ? [`$10 bills: ${countList(0, 10, t)} → $${10 * t}`] : []),
  ...(f > 0 ? [`$5 bills: ${countList(0, 5, f)} → $${5 * f}`] : []),
];
/**
 * A two-step word problem with a middle amount m: m = s ± a, then e = m ± b. `first` and
 * `then` say whether each step adds (1) or takes away (-1). Every amount stays within 100.
 */
function twoStep(
  slug: string,
  title: string,
  use: string,
  first: 1 | -1,
  then: 1 | -1,
  example: Values,
): ModuleDef {
  const word = (sign: 1 | -1) => (sign > 0 ? 'Added' : 'Taken away');
  const op = (sign: 1 | -1) => (sign > 0 ? '+' : '−');
  const inv = (sign: 1 | -1) => (sign > 0 ? '−' : '+');
  /** "x ± y = z" plus its strategy lines. */
  const line = (x: number, sign: number, y: number) => {
    const z = x + sign * y;
    const strategy = sign > 0 ? addStrategy(x, y) : subtractStrategy(x, y);
    // The strategy lines end at the answer; with none, one line says it.
    return strategy.length ? strategy : [`${x} ${sign > 0 ? '+' : '−'} ${y} = ${z}`];
  };
  /** One step as a relation: out = inp ± by. */
  const stepRel = (out: string, inp: string, by: string, sign: 1 | -1) => ({
    id: `${out} = ${inp} ${op(sign)} ${by}`,
    display: `{${out}} = {${inp}} ${op(sign)} {${by}}`,
    vars: [out, inp, by],
    residual: (v: Values) => v[out]! - v[inp]! - sign * v[by]!,
    solve: {
      [out]: (v: Values) => v[inp]! + sign * v[by]!,
      [inp]: (v: Values) => v[out]! - sign * v[by]!,
      [by]: (v: Values) => sign * (v[out]! - v[inp]!),
    },
  });
  const stepText = (out: string, inp: string, by: string, sign: 1 | -1, when: string) => ({
    [out]: {
      expr: `{${inp}} ${op(sign)} {${by}}`,
      how: `${when}: ${sign > 0 ? 'add to' : 'take away from'} the ${inp === 's' ? 'start' : 'middle amount'}.`,
      work: (v: Values) => line(v[inp]!, sign, v[by]!),
    },
    [inp]: {
      expr: `{${out}} ${inv(sign)} {${by}}`,
      how: `Work backwards: ${sign > 0 ? 'take away what was added' : 'put back what was taken away'}.`,
      work: (v: Values) => line(v[out]!, -sign, v[by]!),
    },
    [by]: {
      expr: sign > 0 ? `{${out}} − {${inp}}` : `{${inp}} − {${out}}`,
      how: 'Count up from the smaller amount to the bigger one.',
      work: (v: Values) => countUp(Math.min(v[inp]!, v[out]!), Math.max(v[inp]!, v[out]!)),
    },
  });
  const r1 = stepRel('m', 's', 'a', first);
  const r2 = stepRel('e', 'm', 'b', then);
  return {
    id: `m.2.add-sub-100-fluency~${slug}`,
    title,
    use,
    assumptions: [
      `First some are ${first > 0 ? 'added' : 'taken away'}. Then some are ${then > 0 ? 'added' : 'taken away'}.`,
      'Do one step at a time. Find the middle amount first.',
      'Every amount stays within 100.',
    ],
    variables: [
      whole('s', 's', 'Start', 0, 100),
      whole('a', 'a', `${word(first)} first`, 0, 100),
      whole('m', 'm', 'After the first step', 0, 100),
      whole('b', 'b', `${word(then)} next`, 0, 100),
      whole('e', 'e', 'End', 0, 100),
    ],
    relations: [r1, r2],
    steps: {
      [r1.id]: stepText('m', 's', 'a', first, 'First'),
      [r2.id]: stepText('e', 'm', 'b', then, 'Then'),
    },
    example,
    startWith: ['s', 'a', 'b'],
    representation: {
      kind: 'hops',
      start: 's',
      hops: [
        { var: 'a', sign: first },
        { var: 'b', sign: then },
      ],
      end: 'e',
      min: 0,
      max: 100,
      tick: 10,
    },
    pictureLabels: ['m'],
  };
}

export const MATH_2_MODULES: ModuleDef[] = [
  // ─── Grade 2 ───────────────────────────────────────────────────────────────
  {
    id: 'm.2.add-sub-100-fluency',
    assumptions: [
      'Whole numbers up to 100.',
      'Jump by tens, then by ones: 38 + 25 = 38 + 20 + 5.',
      'Subtraction undoes addition: 38 + 25 = 63, so 63 − 25 = 38.',
    ],
    variables: [
      whole('a', 'a', 'First number', 0, 100),
      whole('b', 'b', 'Second number', 0, 100),
      whole('c', 'c', 'Total', 0, 100),
    ],
    ...addSub({
      c: 'On the number line, jump by tens, then by ones.',
      a: 'Take the second number away from the total.',
      b: 'Count up from the first number to the total: jump by tens, then ones.',
    }),
    example: { a: 38, b: 25, c: 63 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'numberLine',
      start: 'a',
      jump: 'b',
      end: 'c',
      min: 0,
      max: 100,
      tick: 10,
      jumps: 'tens',
    },
  },
  // Grade 2: word problems with a tape diagram, one and two steps (2.OA.1), and adding up to
  // four numbers (2.NBT.6).
  {
    id: 'm.2.add-sub-100-fluency~tape',
    title: 'Word problems',
    use: 'Use this for part-and-whole word problems with a bar model.',
    assumptions: [
      'Draw one bar for the whole and cut it into the two parts.',
      'To find the whole, add the parts. To find a part, take the other part away.',
      'Example: 72 stickers, 45 are stars. How many are not stars? 72 − 45 = 27.',
    ],
    variables: [
      whole('a', 'a', 'First part', 0, 100),
      whole('b', 'b', 'Second part', 0, 100),
      whole('c', 'c', 'Whole', 0, 100),
    ],
    relations: [
      {
        id: 'a + b = c',
        display: '{a} + {b} = {c}',
        vars: ['a', 'b', 'c'],
        residual: (v) => v.a! + v.b! - v.c!,
        solve: { c: (v) => v.a! + v.b!, a: (v) => v.c! - v.b!, b: (v) => v.c! - v.a! },
      },
    ],
    steps: {
      'a + b = c': {
        c: { work: addWork, expr: '{a} + {b}', how: 'The whole is both parts together: add.' },
        a: {
          work: subtractWork,
          expr: '{c} − {b}',
          how: 'Take the known part away from the whole.',
        },
        b: {
          work: countUpWork,
          expr: '{c} − {a}',
          how: 'Count up from the known part to the whole.',
        },
      },
    },
    example: { a: 45, b: 27, c: 72 },
    startWith: ['c', 'a'],
    representation: { kind: 'tape', parts: ['a', 'b'], total: 'c' },
  },
  {
    id: 'm.2.add-sub-100-fluency~four-numbers',
    title: 'Add four numbers',
    use: 'Use this to add up to four 2-digit numbers.',
    assumptions: [
      'Add all the tens. Then all the ones. Look for ones that make a ten.',
      'In 23 + 17, the 3 and the 7 make a ten.',
    ],
    variables: [
      whole('a', 'a', 'First', 0, 99),
      whole('b', 'b', 'Second', 0, 99),
      whole('c', 'c', 'Third', 0, 99),
      whole('e', 'e', 'Fourth', 0, 99),
      whole('n', 'n', 'Total', 0, 396),
    ],
    relations: [
      {
        id: 'n = a + b + c + e',
        display: '{n} = {a} + {b} + {c} + {e}',
        vars: ['n', 'a', 'b', 'c', 'e'],
        residual: (v) => v.n! - v.a! - v.b! - v.c! - v.e!,
        solve: {
          n: (v) => v.a! + v.b! + v.c! + v.e!,
          a: (v) => v.n! - v.b! - v.c! - v.e!,
          b: (v) => v.n! - v.a! - v.c! - v.e!,
          c: (v) => v.n! - v.a! - v.b! - v.e!,
          e: (v) => v.n! - v.a! - v.b! - v.c!,
        },
      },
    ],
    steps: {
      'n = a + b + c + e': {
        n: {
          work: (v) => {
            const xs = [v.a!, v.b!, v.c!, v.e!];
            const tens = xs.map((x) => x - (x % 10));
            const ones = xs.map((x) => x % 10);
            const T = tens.reduce((p, q) => p + q, 0);
            const O = ones.reduce((p, q) => p + q, 0);
            // Two ones that make a ten go first: "Ones: 3 + 7 = 10, then 10 + 5 + 2 = 17".
            const tenPair = ones.flatMap((x, i) =>
              ones.slice(i + 1).flatMap((y, j) => (x + y === 10 && x > 0 ? [[i, i + 1 + j]] : [])),
            )[0];
            const rest = ones.filter((_, i) => !tenPair?.includes(i) && ones[i]! > 0);
            const onesLine = tenPair
              ? `Ones: ${ones[tenPair[0]!]} + ${ones[tenPair[1]!]} = 10${rest.length ? `, then 10 + ${rest.join(' + ')} = ${O}` : ''}`
              : `Ones: ${ones.filter((x) => x > 0).join(' + ') || '0'} = ${O}`;
            return [
              `Tens: ${tens.filter((x) => x > 0).join(' + ') || '0'} = ${T}`,
              onesLine,
              ...(O >= 10 ? [`${O} ones = 1 ten and ${O - 10} ones`] : []),
              `${T} + ${O} = ${T + O}`,
            ];
          },
          expr: '{a} + {b} + {c} + {e}',
          how: 'Add all the tens, then all the ones. Trade 10 ones for a ten.',
        },
        a: {
          work: (v) => [
            ...sumSteps([v.b!, v.c!, v.e!]),
            ...missingPart(v.n!, [v.b!, v.c!, v.e!]).slice(-1),
            ...subtractStrategy(v.n!, v.b! + v.c! + v.e!),
          ],
          expr: '{n} − {b} − {c} − {e}',
          how: 'Take the other numbers away from the total.',
        },
        b: {
          work: (v) => [
            ...sumSteps([v.a!, v.c!, v.e!]),
            ...missingPart(v.n!, [v.a!, v.c!, v.e!]).slice(-1),
            ...subtractStrategy(v.n!, v.a! + v.c! + v.e!),
          ],
          expr: '{n} − {a} − {c} − {e}',
          how: 'Take the other numbers away from the total.',
        },
        c: {
          work: (v) => [
            ...sumSteps([v.a!, v.b!, v.e!]),
            ...missingPart(v.n!, [v.a!, v.b!, v.e!]).slice(-1),
            ...subtractStrategy(v.n!, v.a! + v.b! + v.e!),
          ],
          expr: '{n} − {a} − {b} − {e}',
          how: 'Take the other numbers away from the total.',
        },
        e: {
          work: (v) => [
            ...sumSteps([v.a!, v.b!, v.c!]),
            ...missingPart(v.n!, [v.a!, v.b!, v.c!]).slice(-1),
            ...subtractStrategy(v.n!, v.a! + v.b! + v.c!),
          ],
          expr: '{n} − {a} − {b} − {c}',
          how: 'Take the other numbers away from the total.',
        },
      },
    },
    example: { a: 23, b: 15, c: 32, e: 17, n: 87 },
    startWith: ['a', 'b', 'c', 'e'],
    representation: {
      kind: 'baseTen',
      groups: ['a', 'b', 'c', 'e'],
      total: 'n',
      controls: [
        { var: 'a', steps: [1, 10] },
        { var: 'b', steps: [1, 10] },
        { var: 'c', steps: [1, 10] },
        { var: 'e', steps: [1, 10] },
      ],
    },
  },
  // ─── Added from the Section 1 reviews (exam, textbook, teacher and tutor) ─────────────────

  // Grade 2 compare word problems within 100 (2.OA.1).
  compareProblem(
    'm.2.add-sub-100-fluency~compare',
    100,
    [52, 37],
    'Use this for “how many more?” word problems up to 100.',
  ),
  // ─── Grade 1 ───────────────────────────────────────────────────────────────
  // Order three lengths; compare two by using a third (1.MD.1).
  {
    id: 'm.2.add-sub-100-fluency~compare-combine',
    title: 'Compare, then add',
    use: 'Use this for “Ben has 8 more than Ana. How many in all?”',
    assumptions: [
      '“Ben has 3 more than Ana” means Ben has Ana’s amount + 3.',
      'Then add both amounts to find the total.',
      'Every amount stays within 100.',
    ],
    variables: [
      whole('a', 'a', 'How many Ana has', 0, 50),
      whole('d', 'd', 'How many more Ben has', 0, 50),
      whole('b', 'b', 'How many Ben has', 0, 100),
      whole('t', 't', 'Total', 0, 100),
    ],
    relations: [
      {
        id: 'b = a + d',
        display: '{b} = {a} + {d}',
        vars: ['b', 'a', 'd'],
        residual: (v) => v.b! - v.a! - v.d!,
        solve: { b: (v) => v.a! + v.d!, a: (v) => v.b! - v.d!, d: (v) => v.b! - v.a! },
      },
      {
        id: 't = a + b',
        display: '{t} = {a} + {b}',
        vars: ['t', 'a', 'b'],
        residual: (v) => v.t! - v.a! - v.b!,
        solve: { t: (v) => v.a! + v.b!, a: (v) => v.t! - v.b!, b: (v) => v.t! - v.a! },
      },
    ],
    steps: {
      'b = a + d': {
        b: {
          expr: '{a} + {d}',
          how: 'First: Ben has Ana’s amount and the extra.',
          work: (v: Values) => addStrategy(v.a!, v.d!),
        },
        a: {
          expr: '{b} − {d}',
          how: 'Ana has Ben’s amount without the extra.',
          work: (v: Values) => subtractStrategy(v.b!, v.d!),
        },
        d: {
          expr: '{b} − {a}',
          how: 'Count up from Ana’s amount to Ben’s.',
          work: (v: Values) => countOn(v.a!, v.b!),
        },
      },
      't = a + b': {
        t: {
          expr: '{a} + {b}',
          how: 'Then: add both amounts.',
          work: (v: Values) => addStrategy(v.a!, v.b!),
        },
        a: {
          expr: '{t} − {b}',
          how: 'Take Ben’s amount away from the total.',
          work: (v: Values) => subtractStrategy(v.t!, v.b!),
        },
        b: {
          expr: '{t} − {a}',
          how: 'Take Ana’s amount away from the total.',
          work: (v: Values) => subtractStrategy(v.t!, v.a!),
        },
      },
    },
    example: { a: 25, d: 8, b: 33, t: 58 },
    startWith: ['a', 'd'],
    representation: {
      kind: 'tape',
      compare: ['b', 'a'],
      difference: 'd',
      caption: 'Ben has {d} more than Ana. Total: {t}.',
    },
    pictureLabels: ['t'],
  },
  twoStep(
    'two-step',
    'Add, then take away',
    'Use this for two-step problems: some come, then some go.',
    1,
    -1,
    { s: 25, a: 18, m: 43, b: 9, e: 34 },
  ),
  twoStep(
    'take-add',
    'Take away, then add',
    'Use this for two-step problems: some go, then some come.',
    -1,
    1,
    { s: 50, a: 15, m: 35, b: 20, e: 55 },
  ),
  twoStep(
    'take-take',
    'Take away twice',
    'Use this for two-step problems where some go, twice.',
    -1,
    -1,
    { s: 60, a: 18, m: 42, b: 25, e: 17 },
  ),
  twoStep('add-add', 'Add twice', 'Use this for two-step problems where some come, twice.', 1, 1, {
    s: 24,
    a: 18,
    m: 42,
    b: 35,
    e: 77,
  }),
  {
    id: 'm.2.place-value-1000',
    assumptions: [
      '10 ones make 1 ten; 10 tens make 1 hundred.',
      'A digit’s place tells its value: the first digit of a 3-digit number is the hundreds.',
      'A 0 holds an empty place: 305 has no tens.',
    ],
    variables: [
      whole('n', 'n', 'Number', 0, 999),
      whole('h', 'h', 'Hundreds', 0, 9),
      whole('t', 't', 'Tens', 0, 9),
      whole('o', 'o', 'Ones', 0, 9),
    ],
    relations: [
      {
        id: 'n = h hundreds + t tens + o ones',
        check: (v) => `${100 * v.h!} + ${10 * v.t!} + ${v.o} = ${v.n}`,
        display: '{n} = {h} hundreds + {t} tens + {o} ones',
        vars: ['n', 'h', 't', 'o'],
        residual: (v) => v.n! - 100 * v.h! - 10 * v.t! - v.o!,
        solve: {
          n: (v) => 100 * v.h! + 10 * v.t! + v.o!,
          h: (v) => (v.n! - 10 * v.t! - v.o!) / 100,
          t: (v) => (v.n! - 100 * v.h! - v.o!) / 10,
          o: (v) => v.n! - 100 * v.h! - 10 * v.t!,
        },
      },
      {
        id: 'h = hundreds digit',
        display: 'The hundreds digit of {n} is {h}',
        vars: ['h', 'n'],
        residual: (v) => v.h! - Math.floor(v.n! / 100),
        solve: { h: (v) => Math.floor(v.n! / 100), n: () => undefined },
      },
      {
        id: 't = tens digit',
        display: 'The tens digit of {n} is {t}',
        vars: ['t', 'n'],
        residual: (v) => v.t! - (Math.floor(v.n! / 10) % 10),
        solve: { t: (v) => Math.floor(v.n! / 10) % 10, n: () => undefined },
      },
      {
        id: 'o = ones digit',
        display: 'The ones digit of {n} is {o}',
        vars: ['o', 'n'],
        residual: (v) => v.o! - (v.n! % 10),
        solve: { o: (v) => v.n! % 10, n: () => undefined },
      },
    ],
    steps: {
      'n = h hundreds + t tens + o ones': {
        n: {
          work: (v) => [
            `${v.h} hundreds = ${100 * v.h!}, ${v.t} tens = ${10 * v.t!}`,
            `${100 * v.h!} + ${10 * v.t!} + ${v.o} = ${v.n}`,
          ],
          expr: '{h} hundreds + {t} tens + {o} ones',
          how: 'Count the flats by hundreds, the rods by tens, then the small cubes.',
        },
        h: {
          expr: 'hundreds in ({n} − {t} tens − {o} ones)',
          how: 'Take away the tens and ones; count the hundreds left.',
          work: (v) => [
            `${v.t} tens = ${10 * v.t!}`,
            `${v.n} − ${10 * v.t!} − ${v.o} = ${100 * v.h!}`,
            `${100 * v.h!} is ${v.h} hundreds`,
          ],
        },
        t: {
          expr: 'tens in ({n} − {h} hundreds − {o} ones)',
          how: 'Take away the hundreds and ones; count the tens left.',
          work: (v) => [
            `${v.h} hundreds = ${100 * v.h!}`,
            `${v.n} − ${100 * v.h!} − ${v.o} = ${10 * v.t!}`,
            `${10 * v.t!} is ${v.t} tens`,
          ],
        },
        o: {
          expr: '{n} − {h} hundreds − {t} tens',
          how: 'Take away the hundreds and tens; the rest are ones.',
          work: (v) => [
            `${v.h} hundreds = ${100 * v.h!}, ${v.t} tens = ${10 * v.t!}`,
            `${v.n} − ${100 * v.h!} − ${10 * v.t!} = ${v.o}`,
          ],
        },
      },
      'h = hundreds digit': {
        h: {
          work: (v) => [...placeLine(v.n!), `${100 * v.h!} is ${v.h} hundreds`],
          expr: 'hundreds digit of {n}',
          how: 'Read the digit in the hundreds place (count the flats).',
        },
      },
      't = tens digit': {
        t: {
          work: (v) => [...placeLine(v.n!), `${10 * v.t!} is ${v.t} tens`],
          expr: 'tens digit of {n}',
          how: 'Read the digit in the tens place (count the rods).',
        },
      },
      'o = ones digit': {
        o: {
          work: (v) => [...placeLine(v.n!), `${v.o} is ${v.o} ones`],
          expr: 'ones digit of {n}',
          how: 'Read the digit in the ones place (count the small cubes).',
        },
      },
    },
    example: { n: 347, h: 3, t: 4, o: 7 },
    startWith: ['n'],
    representation: {
      kind: 'baseTen',
      words: 'n',
      groups: ['n'],
      controls: [
        { var: 'h', steps: [1] },
        { var: 't', steps: [1] },
        { var: 'o', steps: [1] },
      ],
    },
  },
  // Split from m.2.place-value-1000: expanded form (2.NBT.3).
  {
    id: 'm.2.place-value-1000~expanded',
    title: 'Expanded form',
    use: 'Use this for expanded form, like 347 = 300 + 40 + 7.',
    assumptions: [
      'Expanded form adds the value of each digit: 347 = 300 + 40 + 7.',
      'The hundreds part is 100, 200, 300 and so on. The tens part is 10, 20, 30 and so on.',
      'A 0 digit adds nothing: 305 = 300 + 0 + 5.',
    ],
    variables: [
      { ...whole('H', 'H', 'Hundreds part', 0, 900), multipleOf: 100, step: 100 },
      { ...whole('T', 'T', 'Tens part', 0, 90), multipleOf: 10, step: 10 },
      whole('O', 'O', 'Ones part', 0, 9),
      whole('n', 'n', 'Number', 0, 999),
    ],
    relations: [
      {
        id: 'n = H + T + O',
        display: '{n} = {H} + {T} + {O}',
        vars: ['n', 'H', 'T', 'O'],
        residual: (v) => v.n! - v.H! - v.T! - v.O!,
        solve: {
          n: (v) => v.H! + v.T! + v.O!,
          H: (v) => v.n! - v.T! - v.O!,
          T: (v) => v.n! - v.H! - v.O!,
          O: (v) => v.n! - v.H! - v.T!,
        },
      },
      {
        id: 'H = hundreds in n',
        display: 'The hundreds part of {n} is {H}',
        vars: ['H', 'n'],
        residual: (v) => v.H! - 100 * Math.floor(v.n! / 100),
        solve: { H: (v) => 100 * Math.floor(v.n! / 100), n: () => undefined },
      },
      {
        id: 'T = tens in n',
        display: 'The tens part of {n} is {T}',
        vars: ['T', 'n'],
        residual: (v) => v.T! - 10 * (Math.floor(v.n! / 10) % 10),
        solve: { T: (v) => 10 * (Math.floor(v.n! / 10) % 10), n: () => undefined },
      },
    ],
    steps: {
      'n = H + T + O': {
        n: {
          work: (v) => sumSteps([v.H!, v.T!, v.O!]),
          expr: '{H} + {T} + {O}',
          how: 'Add the parts: hundreds, then tens, then ones.',
        },
        H: {
          work: (v) => [`${v.n} − ${v.T} = ${v.n! - v.T!}`, `${v.n! - v.T!} − ${v.O} = ${v.H}`],
          expr: '{n} − {T} − {O}',
          how: 'Take the tens and ones away. The rest is hundreds.',
        },
        T: {
          work: (v) => [`${v.n} − ${v.H} = ${v.n! - v.H!}`, `${v.n! - v.H!} − ${v.O} = ${v.T}`],
          expr: '{n} − {H} − {O}',
          how: 'Take the hundreds and ones away. The rest is tens.',
        },
        O: {
          work: (v) => [`${v.n} − ${v.H} = ${v.n! - v.H!}`, `${v.n! - v.H!} − ${v.T} = ${v.O}`],
          expr: '{n} − {H} − {T}',
          how: 'Take the hundreds and tens away. The rest is ones.',
        },
      },
      'H = hundreds in n': {
        H: {
          work: (v) => [
            `${v.n}: hundreds digit ${Math.floor(v.n! / 100)} → ${Math.floor(v.n! / 100)} hundreds = ${v.H}`,
          ],
          expr: 'hundreds part of {n}',
          how: 'The hundreds digit tells how many hundreds.',
        },
      },
      'T = tens in n': {
        T: {
          work: (v) => [
            `${v.n}: tens digit ${Math.floor(v.n! / 10) % 10} → ${Math.floor(v.n! / 10) % 10} tens = ${v.T}`,
          ],
          expr: 'tens part of {n}',
          how: 'The tens digit tells how many tens.',
        },
      },
    },
    example: { H: 300, T: 40, O: 7, n: 347 },
    startWith: ['H', 'T', 'O'],
    representation: {
      kind: 'baseTen',
      words: 'n',
      groups: ['H', 'T', 'O'],
      total: 'n',
      controls: [
        { var: 'H', steps: [100] },
        { var: 'T', steps: [10] },
        { var: 'O', steps: [1] },
      ],
    },
  },
  // Grade 1: is the number sentence true or false? (1.OA.7).
  {
    id: 'm.2.place-value-1000~regroup',
    title: 'Trade tens and ones',
    use: 'Use this for “3 hundreds, 14 tens and 5 ones is ___.”',
    assumptions: [
      '10 ones make 1 ten. 10 tens make 1 hundred.',
      'A number can have more than 9 tens or ones. Trade every 10 ones for a ten.',
    ],
    variables: [
      whole('n', 'n', 'Number', 0, 999),
      whole('h', 'h', 'Hundreds', 0, 9),
      whole('t', 't', 'Tens', 0, 30),
      whole('o', 'o', 'Ones', 0, 30),
    ],
    relations: [
      {
        id: 'n = h hundreds + t tens + o ones',
        check: (v: Values) => `${100 * v.h!} + ${10 * v.t!} + ${v.o} = ${v.n}`,
        display: '{n} = {h} hundreds + {t} tens + {o} ones',
        vars: ['n', 'h', 't', 'o'],
        residual: (v: Values) => v.n! - 100 * v.h! - 10 * v.t! - v.o!,
        solve: {
          n: (v: Values) => 100 * v.h! + 10 * v.t! + v.o!,
          h: (v: Values) => (v.n! - 10 * v.t! - v.o!) / 100,
          t: (v: Values) => (v.n! - 100 * v.h! - v.o!) / 10,
          o: (v: Values) => v.n! - 100 * v.h! - 10 * v.t!,
        },
      },
    ],
    steps: {
      'n = h hundreds + t tens + o ones': {
        n: {
          work: (v: Values) => [
            `${v.h} hundreds = ${100 * v.h!}`,
            `${v.t} tens = ${10 * v.t!}`,
            `${100 * v.h!} + ${10 * v.t!} = ${100 * v.h! + 10 * v.t!}`,
            `${100 * v.h! + 10 * v.t!} + ${v.o} = ${v.n}`,
          ],
          expr: '{h} hundreds + {t} tens + {o} ones',
          how: 'Find the value of the hundreds and the tens. Then add them with the ones.',
        },
        h: {
          work: (v: Values) => [
            `${v.t} tens = ${10 * v.t!}`,
            `${v.n} − ${10 * v.t!} = ${v.n! - 10 * v.t!}`,
            `${v.n! - 10 * v.t!} − ${v.o} = ${100 * v.h!}`,
            `${100 * v.h!} is ${v.h} hundreds`,
          ],
          expr: 'hundreds in ({n} − {t} tens − {o} ones)',
          how: 'Take away the tens and ones. Count the hundreds left.',
        },
        t: {
          work: (v: Values) => [
            `${v.h} hundreds = ${100 * v.h!}`,
            `${v.n} − ${100 * v.h!} = ${v.n! - 100 * v.h!}`,
            `${v.n! - 100 * v.h!} − ${v.o} = ${10 * v.t!}`,
            `${10 * v.t!} is ${v.t} tens`,
          ],
          expr: 'tens in ({n} − {h} hundreds − {o} ones)',
          how: 'Take away the hundreds and ones. Count the tens left.',
        },
        o: {
          work: (v: Values) => [
            `${v.h} hundreds = ${100 * v.h!}, ${v.t} tens = ${10 * v.t!}`,
            `${v.n} − ${100 * v.h!} = ${v.n! - 100 * v.h!}`,
            `${v.n! - 100 * v.h!} − ${10 * v.t!} = ${v.o}`,
          ],
          expr: '{n} − {h} hundreds − {t} tens',
          how: 'Take away the hundreds and tens. The rest are ones.',
        },
      },
    },
    example: { n: 445, h: 3, t: 14, o: 5 },
    startWith: ['h', 't', 'o'],
    representation: {
      kind: 'baseTen',
      words: 'n',
      groups: ['n'],
      places: { hundreds: 'h', tens: 't', ones: 'o' },
      controls: [
        { var: 'h', steps: [1] },
        { var: 't', steps: [1] },
        { var: 'o', steps: [1] },
      ],
    },
  },
  {
    id: 'm.2.add-sub-1000',
    assumptions: [
      'Add hundreds to hundreds, tens to tens and ones to ones.',
      'Trade 10 ones for a ten, and 10 tens for a hundred, when needed.',
      'Subtraction undoes addition: 245 + 138 = 383, so 383 − 138 = 245.',
    ],
    variables: [
      whole('a', 'a', 'First number', 0, 1000),
      whole('b', 'b', 'Second number', 0, 1000),
      whole('c', 'c', 'Total', 0, 1000),
    ],
    ...addSub({
      c: 'Add hundreds, tens and ones. Trade 10 ones for a ten, or 10 tens for a hundred.',
      a: 'Jump back by hundreds, then tens, then ones.',
      b: 'Count up from the first number to the total by hundreds, tens and ones.',
    }),
    example: { a: 245, b: 138, c: 383 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'baseTen',
      groups: ['a', 'b'],
      total: 'c',
      controls: [
        { var: 'a', steps: [1, 10, 100] },
        { var: 'b', steps: [1, 10, 100] },
      ],
    },
  },
  // Grade 2: 10 more, 10 less, 100 more, 100 less (2.NBT.8).
  {
    id: 'm.2.add-sub-1000~ten-hundred-more',
    title: '10 or 100 more or less',
    use: 'Use this for 10 more, 10 less, 100 more and 100 less.',
    assumptions: [
      '10 more or 10 less changes the tens digit by 1. Past 9 or below 0, the hundreds digit changes too.',
      '100 more or 100 less changes the hundreds digit by 1.',
      'Example: 10 more than 356 is 366. 100 less than 356 is 256.',
    ],
    variables: [
      whole('n', 'n', 'Number', 100, 900),
      whole('t', 't', '10 more', 110, 910),
      whole('u', 'u', '10 less', 90, 890),
      whole('H', 'H', '100 more', 200, 1000),
      whole('U', 'U', '100 less', 0, 800),
    ],
    relations: (
      [
        ['t', 10, 'the tens digit goes up by 1'],
        ['u', -10, 'the tens digit goes down by 1'],
        ['H', 100, 'the hundreds digit goes up by 1'],
        ['U', -100, 'the hundreds digit goes down by 1'],
      ] as const
    ).map(([x, k]) => ({
      id: `${x} = n ${k > 0 ? '+' : '−'} ${Math.abs(k)}`,
      display: `{${x}} = {n} ${k > 0 ? '+' : '−'} ${Math.abs(k)}`,
      vars: [x, 'n'],
      residual: (v: Values) => v[x]! - v.n! - k,
      solve: { [x]: (v: Values) => v.n! + k, n: (v: Values) => v[x]! - k },
    })),
    steps: Object.fromEntries(
      (
        [
          ['t', 10, 'tens', 1],
          ['u', -10, 'tens', -1],
          ['H', 100, 'hundreds', 1],
          ['U', -100, 'hundreds', -1],
        ] as const
      ).map(([x, k, place, dir]) => {
        const op = k > 0 ? '+' : '−';
        const inv = k > 0 ? '−' : '+';
        const digit = (n: number) =>
          place === 'tens' ? Math.floor(n / 10) % 10 : Math.floor(n / 100);
        return [
          `${x} = n ${op} ${Math.abs(k)}`,
          {
            [x]: {
              expr: `{n} ${op} ${Math.abs(k)}`,
              how: (v: Values) =>
                Math.floor(v[x]! / (place === 'tens' ? 100 : 1000)) ===
                Math.floor(v.n! / (place === 'tens' ? 100 : 1000))
                  ? `Change the ${place} digit by 1: ${dir > 0 ? 'up' : 'down'}. The other digits stay the same.`
                  : `Change the ${place} digit by 1: ${dir > 0 ? 'up' : 'down'}. It goes past ${dir > 0 ? 9 : 0}, so the hundreds change too.`,
              work: (v: Values) => [
                `${place === 'tens' ? 'Tens' : 'Hundreds'} digit: ${digit(v.n!)} → ${digit(v[x]!)}`,
                `${v.n} ${op} ${Math.abs(k)} = ${v[x]}`,
              ],
            },
            n: {
              expr: `{${x}} ${inv} ${Math.abs(k)}`,
              how: `Go back: change the ${place} digit by 1 the other way.`,
              work: (v: Values) => [
                `${place === 'tens' ? 'Tens' : 'Hundreds'} digit: ${digit(v[x]!)} → ${digit(v.n!)}`,
              ],
            },
          },
        ];
      }),
    ),
    example: { n: 356, t: 366, u: 346, H: 456, U: 256 },
    startWith: ['n'],
    representation: {
      kind: 'baseTen',
      groups: ['n'],
      controls: [{ var: 'n', steps: [10, 100] }],
    },
    pictureLabels: ['U', 'u', 't', 'H'],
  },
  {
    id: 'm.2.skip-count',
    assumptions: [
      'Skip counting adds the same number each time: by 5s, 10s or 100s.',
      'You can start at any number: by 10s from 230 is 230, 240, 250 and so on.',
      'By 10s, the ones digit stays the same. By 100s, the last two digits stay the same.',
    ],
    variables: [
      whole('a', 'a', 'Start', 0, 1000),
      { ...whole('s', 's', 'Count by', 5, 100), allowed: [5, 10, 100], step: 5 },
      whole('k', 'k', 'Number of jumps', 1, 20),
      whole('n', 'n', 'Number reached', 1, 1000),
    ],
    relations: [
      {
        id: 'n = a + k jumps of s',
        check: (v) => `${v.a} + ${v.k! * v.s!} = ${v.n}`,
        display: 'Start at {a}. {k} jumps of {s} land on {n}.',
        vars: ['n', 'a', 'k', 's'],
        residual: (v) => v.n! - v.a! - v.k! * v.s!,
        solve: {
          n: (v) => v.a! + v.k! * v.s!,
          a: (v) => v.n! - v.k! * v.s!,
          k: (v) => div(v.n! - v.a!, v.s!),
          s: (v) => div(v.n! - v.a!, v.k!),
        },
      },
    ],
    steps: {
      'n = a + k jumps of s': {
        n: {
          work: (v) => [
            `Count on by ${v.s}s from ${v.a}: ${countList(v.a!, v.s!, v.k!)} → ${v.n}`,
            `The ${v.k} jumps are ${countList(0, v.s!, v.k!)} → ${v.k! * v.s!} in all`,
          ],
          expr: '{a} + {k} jumps of {s}',
          how: 'Start at the start number. Add the count-by number for each jump.',
        },
        a: {
          work: (v) => [
            `Count back by ${v.s}s from ${v.n}: ${countList(v.n!, -v.s!, v.k!)} → ${v.a}`,
            `The ${v.k} jumps are ${countList(0, v.s!, v.k!)} → ${v.k! * v.s!} in all`,
          ],
          expr: '{n} − {k} jumps of {s}',
          how: 'Count back by the count-by number, once for each jump.',
        },
        k: {
          work: (v) => [
            `${v.a} → ${countList(v.a!, v.s!, v.k!)}`,
            `That is ${v.k} jumps: ${v.n} − ${v.a} = ${v.n! - v.a!}`,
          ],
          expr: 'jumps of {s} from {a} to {n}',
          how: 'Count the jumps from the start to the number reached.',
        },
        s: {
          work: (v) => [
            `${v.n} − ${v.a} = ${v.n! - v.a!}`,
            `Try jumps of ${v.s}: ${countList(0, v.s!, v.k!)} is ${v.k} ${v.k === 1 ? 'jump' : 'jumps'} ✓`,
          ],
          expr: 'size of {k} equal jumps from {a} to {n}',
          how: 'Find the jump size that gets from the start to the number reached.',
        },
      },
    },
    example: { a: 230, s: 10, k: 4, n: 270 },
    startWith: ['a', 'k', 's'],
    representation: { kind: 'skipCount', start: 'a', step: 's', count: 'k', total: 'n' },
  },
  // Skip count backward by 5s, 10s or 100s (2.NBT.2).
  {
    id: 'm.2.skip-count~back',
    title: 'Skip count back',
    use: 'Use this to count back by 5s, 10s or 100s.',
    assumptions: [
      'Counting back takes away the same number each time.',
      'Back by 10s from 560: 550, 540, 530. The ones digit stays the same.',
    ],
    variables: [
      whole('a', 'a', 'Start', 0, 1000),
      { ...whole('s', 's', 'Count back by', 5, 100), multipleOf: 5, step: 5 },
      whole('k', 'k', 'Number of jumps', 1, 20),
      whole('n', 'n', 'Number reached', 0, 1000),
    ],
    relations: [
      {
        id: 'n = a − k jumps of s',
        check: (v) => `${v.a} − ${v.k! * v.s!} = ${v.n}`,
        display: 'Start at {a}. {k} jumps back by {s} land on {n}.',
        vars: ['n', 'a', 'k', 's'],
        residual: (v) => v.n! - v.a! + v.k! * v.s!,
        solve: {
          n: (v) => v.a! - v.k! * v.s!,
          a: (v) => v.n! + v.k! * v.s!,
          k: (v) => (v.s! > 0 ? (v.a! - v.n!) / v.s! : undefined),
          s: (v) => (v.k! > 0 ? (v.a! - v.n!) / v.k! : undefined),
        },
      },
    ],
    steps: {
      'n = a − k jumps of s': {
        n: {
          expr: '{a} − {k} jumps of {s}',
          how: 'Start at the start number. Count back by the count-by number for each jump.',
          work: (v: Values) => [
            `Count back by ${v.s}s from ${v.a}: ${countList(v.a!, -v.s!, v.k!)} → ${v.n}`,
            `The ${v.k} jumps are ${countList(0, v.s!, v.k!)} → ${v.k! * v.s!} in all`,
          ],
        },
        a: {
          expr: '{n} + {k} jumps of {s}',
          how: 'Count up from the number reached, once for each jump.',
          work: (v: Values) => [
            `Count on by ${v.s}s from ${v.n}: ${countList(v.n!, v.s!, v.k!)} → ${v.a}`,
            `The ${v.k} jumps are ${countList(0, v.s!, v.k!)} → ${v.k! * v.s!} in all`,
          ],
        },
        k: {
          expr: 'jumps of {s} from {n} to {a}',
          how: 'Count the jumps back from the start to the number reached.',
          work: (v: Values) => [
            `${v.a} → ${countList(v.a!, -v.s!, v.k!)}`,
            `The ${v.k} jumps are ${countList(0, v.s!, v.k!)} → ${v.a! - v.n!} in all`,
          ],
        },
        s: {
          expr: 'size of {k} equal jumps from {n} to {a}',
          how: 'Find the jump size that gets from the start back to the number reached.',
          work: (v: Values) => [
            `${v.a} − ${v.n} = ${v.a! - v.n!}`,
            `Try jumps of ${v.s}: ${countList(0, v.s!, v.k!)} is ${v.k} ${v.k === 1 ? 'jump' : 'jumps'} ✓`,
          ],
        },
      },
    },
    example: { a: 560, s: 10, k: 3, n: 530 },
    startWith: ['a', 'k', 's'],
    representation: {
      kind: 'skipCount',
      start: 'a',
      step: 's',
      count: 'k',
      total: 'n',
      back: true,
    },
  },
  {
    id: 'm.2.even-odd',
    pictureLabels: ['p', 'r'],
    assumptions: [
      'Put the objects into pairs (groups of 2).',
      'Even: none left over. Odd: one left over.',
      'An even number is a double: 8 = 4 + 4.',
    ],
    variables: [
      whole('n', 'n', 'Objects', 0, 20),
      whole('p', 'p', 'Pairs', 0, 10),
      whole('r', 'r', 'Left over', 0, 1),
    ],
    relations: [
      {
        id: 'n = p + p + r',
        display: '{n} = {p} + {p} + {r}',
        vars: ['n', 'p', 'r'],
        residual: (v) => v.n! - 2 * v.p! - v.r!,
        solve: {
          n: (v) => 2 * v.p! + v.r!,
          p: (v) => (v.n! - v.r!) / 2,
          r: (v) => v.n! - 2 * v.p!,
        },
      },
      {
        id: 'p = pairs in n',
        display: '{n} makes {p} pairs',
        vars: ['p', 'n'],
        residual: (v) => v.p! - Math.floor(v.n! / 2),
        solve: { p: (v) => Math.floor(v.n! / 2), n: () => undefined },
      },
      {
        id: 'r = left over',
        display: '{n} has {r} left over',
        vars: ['r', 'n'],
        residual: (v) => v.r! - (v.n! % 2),
        solve: { r: (v) => v.n! % 2, n: () => undefined },
      },
    ],
    steps: {
      'n = p + p + r': {
        n: {
          expr: '{p} + {p} + {r}',
          how: 'Double the pairs. Then add the one left over, if there is one.',
          work: (v) => [`${v.p} + ${v.p} = ${2 * v.p!}`, `${2 * v.p!} + ${v.r} = ${v.n}`],
        },
        p: {
          expr: 'pairs in ({n} − {r})',
          how: 'Take away the one left over. Split the rest into two equal rows.',
          work: (v) => [`${v.n} − ${v.r} = ${v.n! - v.r!}`, `${v.n! - v.r!} = ${v.p} + ${v.p}`],
        },
        r: {
          expr: '{n} − {p} − {p}',
          how: 'Take away both rows of pairs. See what is left.',
          work: (v) => [`${v.p} + ${v.p} = ${2 * v.p!}`, `${v.n} − ${2 * v.p!} = ${v.r}`],
        },
      },
      'p = pairs in n': {
        p: {
          work: (v) => {
            const pairs = Math.floor(v.n! / 2);
            const left = v.n! % 2;
            return [
              `Pair up ${v.n}: ${pairs ? countList(0, 2, pairs) : '0'} → ${pairs} pairs, ${left} left over`,
              left ? `1 left over → ${v.n} is odd` : `0 left over → ${v.n} is even`,
            ];
          },
          expr: 'pairs in {n}',
          how: 'Match objects two at a time and count the pairs.',
        },
      },
      'r = left over': {
        r: {
          work: (v) => {
            const pairs = Math.floor(v.n! / 2);
            const left = v.n! % 2;
            return [
              `Pair up ${v.n}: ${pairs ? countList(0, 2, pairs) : '0'} → ${pairs} pairs, ${left} left over`,
              left ? `1 left over → ${v.n} is odd` : `0 left over → ${v.n} is even`,
            ];
          },
          expr: 'left over from {n}',
          how: 'Make pairs. Is one left without a partner?',
        },
      },
    },
    example: { n: 7, p: 3, r: 1 },
    startWith: ['n'],
    representation: { kind: 'pairs', value: 'n', max: 20 },
  },
  {
    id: 'm.2.arrays',
    assumptions: [
      'Each row has the same number of dots. So does each column.',
      'Add the same number once for each row: 3 rows of 4 is 4 + 4 + 4.',
      'Up to 5 rows and 5 columns.',
    ],
    variables: [
      whole('r', 'r', 'Rows', 1, 5),
      whole('c', 'c', 'In each row', 1, 5),
      whole('n', 'n', 'Total', 1, 25),
    ],
    relations: [
      {
        id: 'n = r rows of c',
        check: (v) => repeated(v.c!, v.r!),
        display: '{r} rows of {c} = {n}',
        vars: ['n', 'r', 'c'],
        residual: (v) => v.n! - v.r! * v.c!,
        solve: { n: (v) => v.r! * v.c!, r: (v) => div(v.n!, v.c!), c: (v) => div(v.n!, v.r!) },
      },
    ],
    steps: {
      'n = r rows of c': {
        n: {
          work: (v) => [repeated(v.c!, v.r!)],
          expr: '{r} rows of {c}',
          how: 'Add the number in one row, once for each row.',
        },
        r: {
          work: (v) => [`Count by ${v.c}s to ${v.n}: ${countList(0, v.c!, v.r!)} → ${v.r} rows`],
          expr: 'rows of {c} in {n}',
          how: 'Make rows of the same size until you use them all. Count the rows.',
        },
        c: {
          work: (v) => dealLines(v.r!, v.c!, 'row'),
          expr: '{n} shared into {r} rows',
          how: 'Deal 1 dot to each row. Keep going until the dots are gone. Count one row.',
        },
      },
    },
    example: { r: 3, c: 4, n: 12 },
    startWith: ['r', 'c'],
    representation: { kind: 'array', rows: 'r', columns: 'c', total: 'n', max: 5 },
  },
  // Equal groups: circles with the same number in each (2.OA.4, before arrays).
  {
    id: 'm.2.arrays~equal-groups',
    title: 'Equal groups',
    use: 'Use this for equal groups, like 3 bags of 4 apples.',
    assumptions: [
      'Every group has the same number of dots.',
      'Add the number in one group, once for each group: 3 groups of 4 is 4 + 4 + 4.',
      'Up to 5 groups of 5.',
    ],
    variables: [
      whole('g', 'g', 'Groups', 1, 5),
      whole('k', 'k', 'In each group', 1, 5),
      whole('n', 'n', 'Total', 1, 25),
    ],
    relations: [
      {
        id: 'n = g groups of k',
        check: (v) => repeated(v.k!, v.g!),
        display: '{g} groups of {k} = {n}',
        vars: ['n', 'g', 'k'],
        residual: (v) => v.n! - v.g! * v.k!,
        solve: { n: (v) => v.g! * v.k!, g: (v) => v.n! / v.k!, k: (v) => v.n! / v.g! },
      },
    ],
    steps: {
      'n = g groups of k': {
        n: {
          work: (v: Values) => [
            `Count by ${v.k}s: ${countList(0, v.k!, v.g!)}`,
            repeated(v.k!, v.g!),
          ],
          expr: '{g} groups of {k}',
          how: 'Skip count by the number in one group, once for each group.',
        },
        g: {
          work: (v: Values) => [
            `Count by ${v.k}s to ${v.n}: ${countList(0, v.k!, v.g!)} → ${v.g} groups`,
          ],
          expr: 'groups of {k} in {n}',
          how: 'Make groups of the same size until you use them all. Count the groups.',
        },
        k: {
          work: (v: Values) => dealLines(v.g!, v.k!, 'group'),
          expr: '{n} shared into {g} groups',
          how: 'Deal 1 dot to each group. Keep going until the dots are gone. Count one group.',
        },
      },
    },
    example: { g: 3, k: 4, n: 12 },
    startWith: ['g', 'k'],
    representation: { kind: 'equalGroups', groups: 'g', each: 'k', total: 'n' },
  },
  {
    id: 'm.2.standard-length',
    assumptions: [
      'Type how long each ribbon is: the longer one, then the shorter one.',
      '“A is 8 cm shorter than B” means B is the longer ribbon.',
      'Measure both ribbons in the same unit.',
    ],
    variables: [
      { ...whole('L', 'L', 'Longer ribbon', 0, 30), unit: 'cm' },
      { ...whole('S', 'S', 'Shorter ribbon', 0, 30), unit: 'cm' },
      { ...whole('d', 'd', 'How much longer', 0, 30), unit: 'cm' },
    ],
    relations: [
      {
        id: 'd = L − S',
        check: (v) => `${formatNumber(v.L!)} − ${formatNumber(v.S!)} = ${formatNumber(v.d!)}`,
        display: '{d} = {L} − {S}',
        vars: ['d', 'L', 'S'],
        residual: (v) => v.d! - v.L! + v.S!,
        solve: { d: (v) => v.L! - v.S!, L: (v) => v.S! + v.d!, S: (v) => v.L! - v.d! },
      },
    ],
    steps: {
      'd = L − S': {
        d: {
          expr: '{L} − {S}',
          how: 'Take the shorter length from the longer one, or count up from the shorter length.',
          work: (v) => countUp(v.S!, v.L!),
        },
        L: {
          expr: '{S} + {d}',
          how: 'The longer ribbon is the shorter one plus how much longer.',
          work: (v) => addStrategy(v.S!, v.d!),
        },
        S: {
          expr: '{L} − {d}',
          how: 'The shorter ribbon is the longer one minus how much longer.',
          work: (v) => subtractStrategy(v.L!, v.d!),
        },
      },
    },
    example: { L: 12, S: 8, d: 4 },
    startWith: ['L', 'S'],
    representation: { kind: 'ruler', lengths: ['L', 'S'], difference: 'd', extent: 30 },
  },
  // Split from m.2.standard-length: adding lengths on a number line (2.MD.5, 2.MD.6).
  {
    id: 'm.2.standard-length~number-line',
    title: 'Lengths on a number line',
    use: 'Use this to add or subtract lengths on a number line.',
    assumptions: [
      'Put two lengths end to end. Add them to find the total length.',
      'On a number line, start at 0. Jump the first length. Then jump the second.',
      'Use the same unit for both lengths.',
    ],
    variables: [
      { ...whole('a', 'a', 'First length', 0, 100), unit: 'cm' },
      { ...whole('b', 'b', 'Second length', 0, 100), unit: 'cm' },
      { ...whole('s', 's', 'Total length', 0, 100), unit: 'cm' },
    ],
    relations: [
      {
        id: 's = a + b',
        display: '{s} = {a} + {b}',
        vars: ['s', 'a', 'b'],
        residual: (v) => v.s! - v.a! - v.b!,
        solve: { s: (v) => v.a! + v.b!, a: (v) => v.s! - v.b!, b: (v) => v.s! - v.a! },
      },
    ],
    steps: {
      's = a + b': {
        s: {
          expr: '{a} + {b}',
          how: 'Start at the first length. Jump the second length. Read where you land.',
          work: (v) => addStrategy(v.a!, v.b!),
        },
        a: {
          expr: '{s} − {b}',
          how: 'Take the second length away from the total.',
          work: (v) => subtractStrategy(v.s!, v.b!),
        },
        b: {
          expr: '{s} − {a}',
          how: 'Count on from the first length to the total.',
          work: (v) => countUp(v.a!, v.s!),
        },
      },
    },
    example: { a: 35, b: 20, s: 55 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'numberLine',
      start: 'a',
      jump: 'b',
      end: 's',
      min: 0,
      max: 100,
      tick: 10,
      jumps: 'tens',
    },
  },
  // Measure when the object doesn't start at 0: a broken ruler (2.MD.1, 2.MD.4).
  {
    id: 'm.2.standard-length~broken-ruler',
    title: 'Broken ruler',
    use: 'Use this when the object doesn’t start at 0 on the ruler.',
    assumptions: [
      'The object doesn’t start at 0. It starts at another mark.',
      'Take the start mark away from the end mark.',
      'Count the spaces between marks, not the marks.',
    ],
    variables: [
      { ...whole('s', 's', 'Start mark', 0, 10), unit: 'cm' },
      { ...whole('L', 'L', 'Length', 1, 15), unit: 'cm' },
      { ...whole('e', 'e', 'End mark', 1, 15), unit: 'cm' },
    ],
    relations: [
      {
        id: 'e = s + L',
        display: '{e} = {s} + {L}',
        vars: ['e', 's', 'L'],
        residual: (v) => v.e! - v.s! - v.L!,
        solve: { e: (v) => v.s! + v.L!, s: (v) => v.e! - v.L!, L: (v) => v.e! - v.s! },
      },
    ],
    steps: {
      'e = s + L': {
        L: {
          expr: '{e} − {s}',
          how: 'Count the spaces from the start mark to the end mark.',
          work: (v: Values) => [`Count the spaces: ${countList(v.s!, 1, v.L!)} → ${v.L}`],
        },
        e: {
          expr: '{s} + {L}',
          how: 'Start at the start mark. Count on the length.',
          work: (v: Values) => addStrategy(v.s!, v.L!),
        },
        s: {
          expr: '{e} − {L}',
          how: 'Start at the end mark. Count back the length.',
          work: (v: Values) => subtractStrategy(v.e!, v.L!),
        },
      },
    },
    example: { s: 3, L: 7, e: 10 },
    startWith: ['s', 'e'],
    representation: { kind: 'ruler', lengths: ['L'], from: 's', to: 'e', extent: 15 },
  },
  // Measure the same object in feet and in inches (2.MD.2).
  {
    id: 'm.2.standard-length~two-units',
    title: 'Feet and inches',
    use: 'Use this to measure the same object in feet and in inches.',
    assumptions: [
      '1 foot is 12 inches.',
      'Feet are bigger, so you need fewer of them: 3 feet is 36 inches.',
      'Use whole feet.',
    ],
    variables: [
      { ...whole('f', 'f', 'Length in feet', 1, 5), unit: 'feet' },
      { ...whole('n', 'n', 'Length in inches', 12, 60), multipleOf: 12, step: 12, unit: 'inches' },
    ],
    relations: [
      {
        id: 'n = f feet of 12 inches',
        check: (v) => repeated(12, v.f!),
        display: '{n} inches = {f} feet of 12 inches',
        vars: ['n', 'f'],
        residual: (v) => v.n! - 12 * v.f!,
        solve: { n: (v) => 12 * v.f!, f: (v) => v.n! / 12 },
      },
    ],
    steps: {
      'n = f feet of 12 inches': {
        n: {
          work: (v: Values) => [`Count by 12s: ${countList(0, 12, v.f!)} → ${v.n} inches`],
          expr: '{f} feet of 12 inches',
          how: 'Each foot is 12 inches. Count by 12s, once for each foot.',
        },
        f: {
          work: (v: Values) => [`Count by 12s to ${v.n}: ${countList(0, 12, v.f!)} → ${v.f} feet`],
          expr: 'twelves in {n}',
          how: 'Count by 12s up to the inches. Count how many 12s.',
        },
      },
    },
    example: { f: 3, n: 36 },
    startWith: ['f'],
    representation: {
      kind: 'unitTiles',
      count: 'f',
      size: 12,
      total: 'n',
      names: { small: ['inch', 'inches'], big: ['foot', 'feet'] },
    },
  },
  // Meters and centimeters: 1 meter is 100 centimeters (2.MD.2).
  {
    id: 'm.2.standard-length~meters',
    title: 'Meters and centimeters',
    use: 'Use this to measure the same object in meters and in centimeters.',
    assumptions: [
      '1 meter is 100 centimeters.',
      'Meters are bigger, so you need fewer of them: 3 meters is 300 centimeters.',
      'Use whole meters.',
    ],
    variables: [
      { ...whole('m', 'm', 'Length in meters', 1, 5), unit: 'meters' },
      {
        ...whole('c', 'c', 'Length in centimeters', 100, 500),
        multipleOf: 100,
        step: 100,
        unit: 'centimeters',
      },
    ],
    relations: [
      {
        id: 'c = m meters of 100 cm',
        check: (v) => repeated(100, v.m!),
        display: '{c} = {m} meters of 100 centimeters',
        vars: ['c', 'm'],
        residual: (v) => v.c! - 100 * v.m!,
        solve: { c: (v) => 100 * v.m!, m: (v) => v.c! / 100 },
      },
    ],
    steps: {
      'c = m meters of 100 cm': {
        c: {
          work: (v: Values) => [`Count by 100s: ${countList(0, 100, v.m!)} → ${v.c} centimeters`],
          expr: '{m} meters of 100 centimeters',
          how: 'Each meter is 100 centimeters. Count by 100s, once for each meter.',
        },
        m: {
          work: (v: Values) => [
            `Count by 100s to ${v.c}: ${countList(0, 100, v.m!)} → ${v.m} meters`,
          ],
          expr: 'hundreds in {c}',
          how: 'Count by 100s up to the centimeters. Count how many 100s.',
        },
      },
    },
    example: { m: 3, c: 300 },
    startWith: ['m'],
    representation: { kind: 'skipCount', step: 100, count: 'm', total: 'c' },
  },
  {
    id: 'm.2.money',
    assumptions: [
      'A dollar is 100¢ ($1.00).',
      'Quarter 25¢, dime 10¢, nickel 5¢, penny 1¢.',
      'Count the coins worth the most first.',
    ],
    variables: [
      whole('db', 'b', 'Dollar bills', 0, 5),
      whole('q', 'q', 'Quarters', 0, 10),
      whole('dm', 'd', 'Dimes', 0, 10),
      whole('nk', 'n', 'Nickels', 0, 10),
      whole('pn', 'p', 'Pennies', 0, 10),
      { ...whole('T', 'T', 'Total', 0, 910), unit: '¢' },
    ],
    relations: [
      {
        id: 'T = 100b + 25q + 10d + 5n + p',
        check: (v) =>
          `${
            MONEY.map((c) => v[c.id]! * c.cents)
              .filter((x) => x > 0)
              .join(' + ') || '0'
          } = ${v.T}`,
        display: '{db} dollars + {q} quarters + {dm} dimes + {nk} nickels + {pn} pennies = {T}¢',
        vars: ['T', 'db', 'q', 'dm', 'nk', 'pn'],
        residual: (v) => v.T! - (100 * v.db! + 25 * v.q! + 10 * v.dm! + 5 * v.nk! + v.pn!),
        solve: {
          db: (v) => (v.T! - 25 * v.q! - 10 * v.dm! - 5 * v.nk! - v.pn!) / 100,
          T: (v) => 100 * v.db! + 25 * v.q! + 10 * v.dm! + 5 * v.nk! + v.pn!,
          q: (v) => (v.T! - 100 * v.db! - 10 * v.dm! - 5 * v.nk! - v.pn!) / 25,
          dm: (v) => (v.T! - 100 * v.db! - 25 * v.q! - 5 * v.nk! - v.pn!) / 10,
          nk: (v) => (v.T! - 100 * v.db! - 25 * v.q! - 10 * v.dm! - v.pn!) / 5,
          pn: (v) => v.T! - 100 * v.db! - 25 * v.q! - 10 * v.dm! - 5 * v.nk!,
        },
      },
    ],
    steps: {
      'T = 100b + 25q + 10d + 5n + p': {
        T: {
          expr: (v) => moneyWords(v),
          how: 'Count dollars by 100s. Count on quarters by 25s, dimes by 10s, nickels by 5s. Add the pennies.',
          work: moneyTotalWork,
          note: inDollars,
        },
        db: {
          expr: (v) => `dollars in ({T} − ${moneyWords(v, 'db')})`,
          how: 'Take away the coins’ value. Count the 100s (dollars) in what is left.',
          work: moneyCoinWork(MONEY[0]),
        },
        q: {
          expr: (v) => `quarters in ({T} − ${moneyWords(v, 'q')})`,
          how: 'Take away the other coins’ value. Count the 25s in what is left.',
          work: moneyCoinWork(MONEY[1]),
        },
        dm: {
          expr: (v) => `dimes in ({T} − ${moneyWords(v, 'dm')})`,
          how: 'Take away the other coins’ value. Count the 10s in what is left.',
          work: moneyCoinWork(MONEY[2]),
        },
        nk: {
          expr: (v) => `nickels in ({T} − ${moneyWords(v, 'nk')})`,
          how: 'Take away the other coins’ value. Count the 5s in what is left.',
          work: moneyCoinWork(MONEY[3]),
        },
        pn: {
          expr: (v) => `{T} − ${moneyWords(v, 'pn')}`,
          how: 'Take away the other coins’ value. The rest is pennies.',
          work: moneyCoinWork(MONEY[4]),
        },
      },
    },
    example: { db: 1, q: 2, dm: 1, nk: 1, pn: 3, T: 168 },
    clearTo: { db: 0, q: 0, dm: 0, nk: 0, pn: 0 },
    startWith: ['db', 'q', 'dm', 'nk', 'pn'],
    representation: {
      kind: 'coins',
      coins: [
        { var: 'db', cents: 100, name: 'Dollar bills' },
        { var: 'q', cents: 25, name: 'Quarters' },
        { var: 'dm', cents: 10, name: 'Dimes' },
        { var: 'nk', cents: 5, name: 'Nickels' },
        { var: 'pn', cents: 1, name: 'Pennies' },
      ],
      total: 'T',
    },
  },
  // Split from m.2.money: making change (2.MD.8).
  {
    id: 'm.2.money~change',
    title: 'Money left after buying',
    use: 'Use this for “You pay $1. How much money is left?”',
    assumptions: [
      'The money you have is the price plus what is left.',
      'To find what is left, take the price away. Count up from the price to check.',
      'Type $1.25 or 125¢. Both mean the same amount.',
    ],
    variables: [
      { ...whole('T', 'T', 'Money you have', 0, 1000), unit: '¢' },
      { ...whole('P', 'P', 'Price', 0, 1000), unit: '¢' },
      { ...whole('L', 'L', 'Money left', 0, 1000), unit: '¢' },
    ],
    relations: [
      {
        id: 'T = P + L',
        display: '{T} = {P} + {L}',
        vars: ['T', 'P', 'L'],
        residual: (v) => v.T! - v.P! - v.L!,
        solve: { T: (v) => v.P! + v.L!, P: (v) => v.T! - v.L!, L: (v) => v.T! - v.P! },
      },
    ],
    steps: {
      'T = P + L': {
        L: {
          work: (v) => countUp(v.P!, v.T!, '¢'),
          expr: '{T} − {P}',
          how: 'Count up from the price to the money you have.',
          note: (v) => `(${dollars(v.L!)})`,
        },
        P: {
          work: (v) => subtractStrategy(v.T!, v.L!, '¢'),
          expr: '{T} − {L}',
          how: 'Take the money left away from the money you have.',
          note: (v) => `(${dollars(v.P!)})`,
        },
        T: {
          work: (v) => addStrategy(v.P!, v.L!, '¢'),
          expr: '{P} + {L}',
          how: 'Add the price and the money left.',
          note: (v) => `(${dollars(v.T!)})`,
        },
      },
    },
    example: { T: 100, P: 65, L: 35 },
    startWith: ['T', 'P'],
    representation: { kind: 'tape', parts: ['P', 'L'], total: 'T' },
  },
  // Bills: $10, $5 and $1 (2.MD.8).
  {
    id: 'm.2.money~bills',
    title: 'Count bills',
    use: 'Use this to count $10, $5 and $1 bills.',
    assumptions: [
      'Count the bills worth the most first: $10s, then $5s, then $1s.',
      'A $10 bill is worth 10 dollars. A $5 bill is worth 5 dollars.',
    ],
    variables: [
      whole('t', 't', '$10 bills', 0, 5),
      whole('f', 'f', '$5 bills', 0, 5),
      whole('o', 'o', '$1 bills', 0, 9),
      { ...whole('D', 'T', 'Total', 0, 84), unit: '$' },
    ],
    relations: [
      {
        id: 'D = 10t + 5f + o',
        check: (v) => `${10 * v.t!} + ${5 * v.f!} + ${v.o} = ${v.D}`,
        // Non-breaking spaces keep each “$10 bills (t)” together when the formula wraps.
        display: '{t} $10\u00a0bills + {f} $5\u00a0bills + {o} $1\u00a0bills = ${D}',
        vars: ['D', 't', 'f', 'o'],
        residual: (v) => v.D! - 10 * v.t! - 5 * v.f! - v.o!,
        solve: {
          D: (v) => 10 * v.t! + 5 * v.f! + v.o!,
          t: (v) => (v.D! - 5 * v.f! - v.o!) / 10,
          f: (v) => (v.D! - 10 * v.t! - v.o!) / 5,
          o: (v) => v.D! - 10 * v.t! - 5 * v.f!,
        },
      },
    ],
    steps: {
      'D = 10t + 5f + o': {
        D: {
          expr: '$10 bills ({t}) + $5 bills ({f}) + $1 bills ({o})',
          how: 'Count the $10s by 10s. Count on the $5s by 5s, then the $1s by 1s.',
          work: (v: Values) => [
            ...billLines(v.t!, v.f!),
            ...addAll([10 * v.t!, 5 * v.f!, v.o!]).map((l) => l.replace(/(\d+)/g, '$$$1')),
          ],
        },
        t: {
          expr: '$10 bills in ({D} − $5 bills ({f}) − $1 bills ({o}))',
          how: 'Take away the $5s and $1s. Count the 10s in what is left.',
          work: (v: Values) => [
            ...billLines(0, v.f!),
            `$${v.D} − $${5 * v.f!} = $${v.D! - 5 * v.f!}`,
            `$${v.D! - 5 * v.f!} − $${v.o} = $${10 * v.t!}`,
            ...(v.t! > 0
              ? [`Count by 10s: ${countList(0, 10, v.t!)} → ${plural(v.t!, 'bill', 'bills')}`]
              : []),
          ],
        },
        f: {
          expr: '$5 bills in ({D} − $10 bills ({t}) − $1 bills ({o}))',
          how: 'Take away the $10s and $1s. Count the 5s in what is left.',
          work: (v: Values) => [
            ...billLines(v.t!, 0),
            `$${v.D} − $${10 * v.t!} = $${v.D! - 10 * v.t!}`,
            `$${v.D! - 10 * v.t!} − $${v.o} = $${5 * v.f!}`,
            ...(v.f! > 0
              ? [`Count by 5s: ${countList(0, 5, v.f!)} → ${plural(v.f!, 'bill', 'bills')}`]
              : []),
          ],
        },
        o: {
          expr: '{D} − $10 bills ({t}) − $5 bills ({f})',
          how: 'Take away the $10s and $5s. The rest is $1 bills.',
          work: (v: Values) => [
            ...billLines(v.t!, v.f!),
            `$${v.D} − $${10 * v.t!} = $${v.D! - 10 * v.t!}`,
            `$${v.D! - 10 * v.t!} − $${5 * v.f!} = $${v.o}`,
          ],
        },
      },
    },
    example: { t: 2, f: 1, o: 3, D: 28 },
    clearTo: { t: 0, f: 0, o: 0 },
    startWith: ['t', 'f', 'o'],
    representation: {
      kind: 'coins',
      coins: [
        { var: 't', cents: 1000, name: '$10 bills' },
        { var: 'f', cents: 500, name: '$5 bills' },
        { var: 'o', cents: 100, name: '$1 bills' },
      ],
      total: 'D',
      dollars: true,
    },
  },
  // How much more money is needed (2.MD.8).
  {
    id: 'm.2.money~more-needed',
    title: 'How much more money?',
    use: 'Use this for “How much more money do you need?”',
    assumptions: [
      'The price is what you have plus what you still need.',
      'Count up from the money you have to the price.',
      'Type $1.25 or 125¢. Both mean the same amount.',
    ],
    variables: [
      { ...whole('P', 'P', 'Price', 0, 1000), unit: '¢' },
      { ...whole('H', 'H', 'Money you have', 0, 1000), unit: '¢' },
      { ...whole('M', 'M', 'Still needed', 0, 1000), unit: '¢' },
    ],
    relations: [
      {
        id: 'P = H + M',
        display: '{P} = {H} + {M}',
        vars: ['P', 'H', 'M'],
        residual: (v) => v.P! - v.H! - v.M!,
        solve: { P: (v) => v.H! + v.M!, H: (v) => v.P! - v.M!, M: (v) => v.P! - v.H! },
      },
    ],
    steps: {
      'P = H + M': {
        M: {
          expr: '{P} − {H}',
          how: 'Count up from the money you have to the price.',
          work: (v: Values) => countUp(v.H!, v.P!, '¢'),
          note: (v: Values) => `(${dollars(v.M!)})`,
        },
        H: {
          expr: '{P} − {M}',
          how: 'Take the money you still need away from the price.',
          work: (v: Values) => subtractStrategy(v.P!, v.M!, '¢'),
          note: (v: Values) => `(${dollars(v.H!)})`,
        },
        P: {
          expr: '{H} + {M}',
          how: 'Add the money you have and the money you still need.',
          work: (v: Values) => addStrategy(v.H!, v.M!, '¢'),
          note: (v: Values) => `(${dollars(v.P!)})`,
        },
      },
    },
    example: { H: 65, M: 35, P: 100 },
    startWith: ['P', 'H'],
    representation: { kind: 'tape', parts: ['H', 'M'], total: 'P' },
  },
  // One kind of coin: count pennies by 1s, nickels by 5s, dimes by 10s, quarters by 25s.
  {
    id: 'm.2.money~one-coin',
    title: 'Count one kind of coin',
    use: 'Use this to count one kind of coin, like 4 nickels.',
    assumptions: [
      'Penny 1¢, nickel 5¢, dime 10¢, quarter 25¢.',
      'Count by the coin’s value, once for each coin: 3 dimes is 10, 20, 30 → 30¢.',
    ],
    variables: [
      { ...whole('v', 'v', 'Coin value', 1, 25), unit: '¢', allowed: [1, 5, 10, 25] },
      whole('k', 'k', 'Coins', 0, 10),
      { ...whole('T', 'T', 'Total', 0, 250), unit: '¢' },
    ],
    relations: [
      {
        id: 'T = k coins of v',
        check: (v) => (v.k! > 0 ? repeated(v.v!, v.k!).replace(/(\d+)/g, '$1¢') : '0¢ = 0¢'),
        display: '{k} coins of {v}¢ = {T}¢',
        vars: ['T', 'k', 'v'],
        // Only real coin values: 1¢, 5¢, 10¢ or 25¢.
        residual: (v) => ([1, 5, 10, 25].includes(v.v!) ? v.T! - v.k! * v.v! : 1),
        solve: {
          T: (v) => ([1, 5, 10, 25].includes(v.v!) ? v.k! * v.v! : undefined),
          k: (v) => ([1, 5, 10, 25].includes(v.v!) ? v.T! / v.v! : undefined),
          v: (v) => (v.k! > 0 && [1, 5, 10, 25].includes(v.T! / v.k!) ? v.T! / v.k! : undefined),
        },
      },
    ],
    steps: {
      'T = k coins of v': {
        T: {
          expr: '{k} coins of {v}',
          how: 'Count by the coin’s value, once for each coin.',
          work: (v: Values) =>
            v.k! > 0 ? [`Count by ${v.v}s: ${countList(0, v.v!, v.k!)} → ${v.T}¢`] : [],
        },
        k: {
          expr: 'coins of {v} in {T}',
          how: 'Count by the coin’s value up to the total. Count how many you said.',
          work: (v: Values) =>
            v.k! > 0 ? [`Count by ${v.v}s to ${v.T}: ${countList(0, v.v!, v.k!)} → ${v.k}`] : [],
        },
        v: {
          expr: 'the coin that makes {T}¢ with {k} coins',
          how: 'Try each coin value: which one counts to the total?',
          work: (v: Values) => [`Try ${v.v}¢: ${countList(0, v.v!, v.k!)} ✓`],
        },
      },
    },
    example: { v: 10, k: 3, T: 30 },
    startWith: ['v', 'k'],
    representation: { kind: 'coinRow', value: 'v', count: 'k', total: 'T' },
  },
  {
    id: 'm.2.time-5-min',
    pictureLabels: ['k'],
    standalone: {
      vars: ['h'],
      why: 'The short hand shows the hour on its own; the formulas are about the minutes.',
    },
    assumptions: [
      'The long hand moves 5 minutes from one number to the next: count by 5s. The 12 counts as 0.',
      'The hour is the number the short hand has just passed. At 7:45 it is near 8, but the hour is 7.',
      'a.m. is before noon. p.m. is after noon.',
      '15 minutes past is quarter past. 30 is half past. 45 is quarter to the next hour.',
    ],
    variables: [
      whole('h', 'h', 'Hour', 1, 12),
      { ...whole('m', 'm', 'Minutes past', 0, 55), step: 5 },
      whole('k', 'k', 'Number the long hand points to', 0, 11),
    ],
    relations: [
      {
        id: 'm = 5 × k',
        check: (v) => (v.k! > 0 ? repeated(5, v.k!) : '0 = 0'),
        display: '{k} fives = {m} minutes',
        vars: ['m', 'k'],
        residual: (v) => v.m! - 5 * v.k!,
        solve: { m: (v) => 5 * v.k!, k: (v) => v.m! / 5 },
      },
    ],
    steps: {
      'm = 5 × k': {
        m: {
          work: (v) =>
            v.k! > 0
              ? [
                  `Count by 5s: ${countList(0, 5, v.k!)} → ${v.m} minutes`,
                  ...(v.h === undefined ? [] : [`Time: ${v.h}:${String(v.m).padStart(2, '0')}`]),
                ]
              : ['Long hand on 12: 0 minutes'],
          expr: (v: Values) => (v.k === 1 ? '{k} five' : '{k} fives'),
          how: 'Count by 5s from 12 to the number the long hand points at.',
        },
        k: {
          work: (v) => [
            v.m! > 0
              ? `Count by 5s to ${v.m}: ${countList(0, 5, v.k!)} → the long hand points at ${v.k}`
              : 'Long hand on 12: 0 minutes',
          ],
          expr: 'fives in {m}',
          how: 'Count by 5s to the minutes. Count how many numbers you passed.',
        },
      },
    },
    example: { h: 4, m: 25, k: 5 },
    startWith: ['h', 'm'],
    representation: { kind: 'clock', hour: 'h', minute: 'm', minuteStep: 5, ampm: true },
  },
  {
    id: 'm.2.graphs-line-plots',
    assumptions: [
      'Each bar’s height is the count for that category. Read the scale starting at 0.',
      'Add the bars to find the total.',
    ],
    variables: [
      whole('a', 'a', 'Soccer', 0, 10),
      whole('b', 'b', 'Basketball', 0, 10),
      whole('c', 'c', 'Baseball', 0, 10),
      whole('e', 'e', 'Tennis', 0, 10),
      whole('n', 'n', 'Total', 0, 40),
    ],
    relations: [
      {
        id: 'n = a + b + c + e',
        display: '{n} = {a} + {b} + {c} + {e}',
        vars: ['n', 'a', 'b', 'c', 'e'],
        residual: (v) => v.n! - v.a! - v.b! - v.c! - v.e!,
        solve: {
          n: (v) => v.a! + v.b! + v.c! + v.e!,
          a: (v) => v.n! - v.b! - v.c! - v.e!,
          b: (v) => v.n! - v.a! - v.c! - v.e!,
          c: (v) => v.n! - v.a! - v.b! - v.e!,
          e: (v) => v.n! - v.a! - v.b! - v.c!,
        },
      },
    ],
    steps: {
      'n = a + b + c + e': {
        n: {
          work: (v) => sumSteps([v.a!, v.b!, v.c!, v.e!]),
          expr: '{a} + {b} + {c} + {e}',
          how: 'Add the heights of all four bars.',
        },
        a: {
          work: (v) => missingPart(v.n!, [v.b!, v.c!, v.e!]),
          expr: '{n} − {b} − {c} − {e}',
          how: 'Take the other bars away from the total.',
        },
        b: {
          work: (v) => missingPart(v.n!, [v.a!, v.c!, v.e!]),
          expr: '{n} − {a} − {c} − {e}',
          how: 'Take the other bars away from the total.',
        },
        c: {
          work: (v) => missingPart(v.n!, [v.a!, v.b!, v.e!]),
          expr: '{n} − {a} − {b} − {e}',
          how: 'Take the other bars away from the total.',
        },
        e: {
          work: (v) => missingPart(v.n!, [v.a!, v.b!, v.c!]),
          expr: '{n} − {a} − {b} − {c}',
          how: 'Take the other bars away from the total.',
        },
      },
    },
    example: { a: 8, b: 5, c: 3, e: 6, n: 22 },
    startWith: ['a', 'b', 'c', 'e'],
    representation: {
      kind: 'bars',
      bars: [
        { var: 'a', editable: true },
        { var: 'b', editable: true },
        { var: 'c', editable: true },
        { var: 'e', editable: true },
      ],
      min: 0,
      max: 10,
      total: 'n',
      scale: 1,
    },
  },
  // Grade 2: line plot of measurements (2.MD.9).
  {
    id: 'm.2.graphs-line-plots~line-plot',
    title: 'Line plot',
    use: 'Use this to make or read a line plot of lengths.',
    standalone: {
      vars: ['f'],
      why: 'The shortest length only labels the line; the counts don’t depend on it.',
    },
    assumptions: [
      'Measure each object to the nearest whole inch. Set the shortest length with − / +.',
      'Put one X above the number line for each object, at its length.',
      'Count the X’s to find how many objects in all.',
    ],
    variables: [
      { ...whole('f', 'f', 'Shortest length', 1, 20), unit: 'inches' },
      whole('x4', 'A', 'At the shortest length', 0, 10),
      whole('x5', 'B', 'One inch longer', 0, 10),
      whole('x6', 'C', 'Two inches longer', 0, 10),
      whole('x7', 'D', 'At the longest length', 0, 10),
      whole('N', 'N', 'Objects measured', 0, 40),
    ],
    relations: [
      {
        id: 'N = all X’s',
        display: '{N} = {x4} + {x5} + {x6} + {x7}',
        vars: ['N', 'x4', 'x5', 'x6', 'x7'],
        residual: (v) => v.N! - v.x4! - v.x5! - v.x6! - v.x7!,
        solve: {
          N: (v) => v.x4! + v.x5! + v.x6! + v.x7!,
          x4: (v) => v.N! - v.x5! - v.x6! - v.x7!,
          x5: (v) => v.N! - v.x4! - v.x6! - v.x7!,
          x6: (v) => v.N! - v.x4! - v.x5! - v.x7!,
          x7: (v) => v.N! - v.x4! - v.x5! - v.x6!,
        },
      },
    ],
    steps: {
      'N = all X’s': {
        N: {
          expr: '{x4} + {x5} + {x6} + {x7}',
          how: 'Count every X on the line plot.',
          work: (v) => sumSteps([v.x4!, v.x5!, v.x6!, v.x7!]),
        },
        x4: {
          work: (v) => missingPart(v.N!, [v.x5!, v.x6!, v.x7!]),
          expr: '{N} − {x5} − {x6} − {x7}',
          how: 'Take the X’s at the other lengths away from the total.',
        },
        x5: {
          work: (v) => missingPart(v.N!, [v.x4!, v.x6!, v.x7!]),
          expr: '{N} − {x4} − {x6} − {x7}',
          how: 'Take the X’s at the other lengths away from the total.',
        },
        x6: {
          work: (v) => missingPart(v.N!, [v.x4!, v.x5!, v.x7!]),
          expr: '{N} − {x4} − {x5} − {x7}',
          how: 'Take the X’s at the other lengths away from the total.',
        },
        x7: {
          work: (v) => missingPart(v.N!, [v.x4!, v.x5!, v.x6!]),
          expr: '{N} − {x4} − {x5} − {x6}',
          how: 'Take the X’s at the other lengths away from the total.',
        },
      },
    },
    example: { f: 4, x4: 2, x5: 5, x6: 3, x7: 1, N: 11 },
    startWith: ['f', 'x4', 'x5', 'x6', 'x7'],
    representation: {
      kind: 'linePlot',
      unit: 'in',
      start: 'f',
      points: [
        { var: 'x4', at: 4 },
        { var: 'x5', at: 5 },
        { var: 'x6', at: 6 },
        { var: 'x7', at: 7 },
      ],
    },
    pictureLabels: ['N'],
  },
  // Grade 2: how many more in a bar graph (2.MD.10).
  {
    id: 'm.2.graphs-line-plots~compare',
    pictureLabels: ['d'],
    title: 'How many more? (bar graph)',
    use: 'Use this for “how many more?” in a bar graph.',
    assumptions: [
      'Read each bar’s number on the scale, starting at 0.',
      'To compare, count up from the shorter bar to the taller bar.',
    ],
    variables: [
      whole('a', 'a', 'Soccer', 0, 10),
      whole('b', 'b', 'Basketball', 0, 10),
      whole('d', 'd', 'How many more', 0, 10),
    ],
    relations: [cmpBars.relation],
    steps: { ...cmpBars.steps },
    example: { a: 8, b: 5, d: 3 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'bars',
      bars: [
        { var: 'a', editable: true },
        { var: 'b', editable: true },
      ],
      min: 0,
      max: 10,
      scale: 1,
    },
  },
  // Picture graph with four categories (2.MD.10).
  {
    id: 'm.2.graphs-line-plots~picture-graph',
    title: 'Picture graph',
    use: 'Use this to read a picture graph with four groups.',
    assumptions: [
      'Each picture stands for 1.',
      'Count the pictures in each column. Add all the columns for the total.',
    ],
    variables: [
      whole('a', 'a', 'Circles', 0, 10),
      whole('b', 'b', 'Squares', 0, 10),
      whole('c', 'c', 'Triangles', 0, 10),
      whole('e', 'e', 'Stars', 0, 10),
      whole('n', 'n', 'Total', 0, 40),
    ],
    relations: [
      {
        id: 'n = a + b + c + e',
        display: '{n} = {a} + {b} + {c} + {e}',
        vars: ['n', 'a', 'b', 'c', 'e'],
        residual: (v) => v.n! - v.a! - v.b! - v.c! - v.e!,
        solve: {
          n: (v) => v.a! + v.b! + v.c! + v.e!,
          a: (v) => v.n! - v.b! - v.c! - v.e!,
          b: (v) => v.n! - v.a! - v.c! - v.e!,
          c: (v) => v.n! - v.a! - v.b! - v.e!,
          e: (v) => v.n! - v.a! - v.b! - v.c!,
        },
      },
    ],
    steps: {
      'n = a + b + c + e': Object.fromEntries(
        (['n', 'a', 'b', 'c', 'e'] as const).map((x) => {
          const others = ['a', 'b', 'c', 'e'].filter((y) => y !== x);
          if (x === 'n') {
            return [
              'n',
              {
                expr: '{a} + {b} + {c} + {e}',
                how: 'Add the columns. Look for two that make a ten.',
                work: (v: Values) => addAll([v.a!, v.b!, v.c!, v.e!]),
              },
            ];
          }
          return [
            x,
            {
              expr: `{n} − ${others.map((y) => `{${y}}`).join(' − ')}`,
              how: 'Add the other columns. Take them away from the total.',
              work: (v: Values) => {
                const sum = others.reduce((p, y) => p + v[y]!, 0);
                const back = subtractStrategy(v.n!, sum);
                return [
                  ...addAll(others.map((y) => v[y]!)),
                  ...(back.length ? back : [`${v.n} − ${sum} = ${v[x]}`]),
                ];
              },
            },
          ];
        }),
      ),
    },
    example: { a: 6, b: 4, c: 3, e: 5, n: 18 },
    startWith: ['a', 'b', 'c', 'e'],
    representation: {
      kind: 'pictureGraph',
      columns: [
        { var: 'a', icon: 'circle' },
        { var: 'b', icon: 'square' },
        { var: 'c', icon: 'triangle' },
        { var: 'e', icon: 'star' },
      ],
      max: 10,
      total: 'n',
    },
  },
  {
    id: 'm.2.thirds-polygons',
    pictureLabels: ['u'],
    assumptions: [
      'Equal parts are the same size. 3 equal parts are thirds.',
      'Equal parts can have different shapes but the same size.',
      'Three thirds make one whole.',
    ],
    variables: [
      whole('p', 'p', 'Equal parts', 2, 4),
      whole('k', 'k', 'Shaded parts', 0, 4),
      whole('u', 'u', 'Not shaded', 0, 4),
    ],
    relations: [
      {
        id: 'u = p − k',
        display: '{k} of {p} equal parts shaded, {u} not shaded',
        vars: ['u', 'p', 'k'],
        residual: (v) => v.u! - (v.p! - v.k!),
        solve: { u: (v) => v.p! - v.k!, p: (v) => v.k! + v.u!, k: (v) => v.p! - v.u! },
      },
    ],
    steps: {
      'u = p − k': {
        u: {
          expr: '{p} − {k}',
          how: 'Take the shaded parts away from all the parts.',
          note: (v) => fractionNote(v.k!, v.p!),
        },
        p: { expr: '{k} + {u}', how: 'Add the shaded and not shaded parts.' },
        k: {
          expr: '{p} − {u}',
          how: 'Take the not shaded parts away from all the parts.',
          note: (v) => fractionNote(v.k!, v.p!),
        },
      },
    },
    example: { p: 3, k: 1, u: 2 },
    startWith: ['p', 'k'],
    representation: { kind: 'partition', parts: 'p', shaded: 'k', shape: 'rectangle' },
  },
  // Grade 2: polygons by sides and angles (2.G.1), and rows and columns of squares (2.G.2).
  {
    id: 'm.2.thirds-polygons~polygons',
    title: 'Polygons',
    use: 'Use this to name a shape by its sides and angles.',
    assumptions: [
      'A polygon is a closed flat shape with straight sides.',
      'It has as many angles as sides: triangle 3, quadrilateral 4, pentagon 5, hexagon 6.',
      'Count the sides or angles to name a shape. A bigger or turned shape keeps its name.',
    ],
    variables: [whole('s', 's', 'Sides', 3, 6), whole('a', 'a', 'Angles', 3, 6)],
    relations: [
      {
        id: 'angles = sides',
        display: '{s} sides and {a} angles',
        vars: ['a', 's'],
        residual: (v) => v.a! - v.s!,
        solve: { a: (v) => v.s!, s: (v) => v.a! },
      },
    ],
    steps: {
      'angles = sides': {
        a: {
          expr: '{s}',
          how: 'Each angle is where two sides meet. There is one angle for each side.',
        },
        s: {
          expr: '{a}',
          how: 'There is one side between two angles. There is one side for each angle.',
        },
      },
    },
    example: { s: 5, a: 5 },
    startWith: ['s'],
    representation: { kind: 'polygon', sides: 's', words: 'angle', corners: 'a' },
  },
  {
    id: 'm.2.thirds-polygons~rows-columns',
    title: 'Rows and columns of squares',
    use: 'Use this to cut a rectangle into rows and columns of squares.',
    assumptions: [
      'Cut a rectangle into rows and columns of same-size squares. Leave no gaps.',
      'Count the squares: add the number in a row once for each row.',
    ],
    variables: [
      whole('r', 'r', 'Rows', 1, 6),
      whole('c', 'c', 'In each row', 1, 6),
      whole('n', 'n', 'Squares', 1, 36),
    ],
    relations: [
      {
        id: 'n = r rows of c',
        check: (v) => repeated(v.c!, v.r!),
        display: '{r} rows of {c} = {n}',
        vars: ['n', 'r', 'c'],
        residual: (v) => v.n! - v.r! * v.c!,
        solve: { n: (v) => v.r! * v.c!, r: (v) => div(v.n!, v.c!), c: (v) => div(v.n!, v.r!) },
      },
    ],
    steps: {
      'n = r rows of c': {
        n: {
          work: (v) => [repeated(v.c!, v.r!)],
          expr: '{r} rows of {c}',
          how: 'Add the number in one row, once for each row.',
        },
        r: {
          work: (v) => [`Count by ${v.c}s to ${v.n}: ${countList(0, v.c!, v.r!)} → ${v.r} rows`],
          expr: 'rows of {c} in {n}',
          how: 'Make rows until you use all the squares. Count the rows.',
        },
        c: {
          work: (v) => dealLines(v.r!, v.c!, 'row'),
          expr: '{n} shared into {r} rows',
          how: 'Deal 1 square to each row. Keep going until the squares are gone. Count one row.',
        },
      },
    },
    example: { r: 2, c: 3, n: 6 },
    startWith: ['r', 'c'],
    representation: {
      kind: 'array',
      rows: 'r',
      columns: 'c',
      total: 'n',
      max: 6,
      cell: 'square',
    },
  },
  // Faces, edges and corners of cubes and other prisms (2.G.1).
  {
    id: 'm.2.thirds-polygons~solids',
    title: 'Faces, edges and corners',
    use: 'Use this to count faces, edges and corners of a cube or prism.',
    assumptions: [
      'A face is a flat surface. An edge is where two faces meet. A corner is where edges meet.',
      'A cube has 6 square faces, 12 edges and 8 corners.',
      'A prism has a top and a bottom that match. Flat faces join them.',
    ],
    variables: [
      whole('s', 's', 'Sides of the top', 3, 6),
      { ...whole('F', 'F', 'Faces', 5, 8), derived: true },
      { ...whole('E', 'E', 'Edges', 9, 18), derived: true },
      { ...whole('V', 'C', 'Corners', 6, 12), derived: true },
    ],
    relations: [
      {
        id: 'F = s + 2',
        display: 'Faces: {s} + 2 = {F}',
        vars: ['F', 's'],
        residual: (v) => v.F! - v.s! - 2,
        solve: { F: (v) => v.s! + 2, s: (v) => v.F! - 2 },
      },
      {
        id: 'V = s + s',
        display: 'Corners: {s} + {s} = {V}',
        vars: ['V', 's'],
        residual: (v) => v.V! - 2 * v.s!,
        solve: { V: (v) => 2 * v.s!, s: (v) => v.V! / 2 },
      },
      {
        id: 'E = s + s + s',
        display: 'Edges: {s} + {s} + {s} = {E}',
        vars: ['E', 's'],
        residual: (v) => v.E! - 3 * v.s!,
        solve: { E: (v) => 3 * v.s!, s: (v) => v.E! / 3 },
      },
    ],
    steps: {
      'F = s + 2': {
        F: {
          expr: '{s} + 2',
          how: 'Count one face for each side of the top. Add the top and bottom.',
        },
        s: { expr: '{F} − 2', how: 'Take away the top and bottom faces.' },
      },
      'V = s + s': {
        V: { expr: '{s} + {s}', how: 'Count the corners on top and the corners on the bottom.' },
        s: {
          expr: 'half of {V}',
          how: 'Half the corners are on top.',
          work: (v: Values) => [`${v.s} + ${v.s} = ${v.V}, so half of ${v.V} is ${v.s}`],
        },
      },
      'E = s + s + s': {
        E: {
          expr: '{s} + {s} + {s}',
          how: 'Count the edges on the top, on the bottom, and going up.',
          work: (v: Values) => sumSteps([v.s!, v.s!, v.s!]),
        },
        s: {
          expr: 'a third of {E}',
          how: 'The edges come in 3 equal sets: top, bottom and going up.',
          work: (v: Values) => [
            `Count by 3s to ${v.E}: ${countList(0, 3, v.s!)} → ${v.s} in each set`,
          ],
        },
      },
    },
    example: { s: 4, F: 6, E: 12, V: 8 },
    startWith: ['s'],
    representation: { kind: 'prism', sides: 's', faces: 'F', edges: 'E', corners: 'V' },
  },
  compareNumbers(
    'm.2.place-value-1000',
    999,
    [1, 10, 100],
    [347, 374],
    'Use this to compare 3-digit numbers with >, < or =.',
  ),
];
