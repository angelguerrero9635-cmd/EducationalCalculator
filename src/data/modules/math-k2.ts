/**
 * Section 1: Math, Kindergarten – Grade 2 (Common Core). Keyed by taxonomy skill id.
 * Written and reviewed against docs/MODULE_GUIDE.md. Two K modules (m.K.add-sub-10,
 * m.K.classify-count) are pilots in k12.ts.
 */
import { formatNumber } from '@/engine/format';
import type { Values, VariableDef } from '@/engine/types';

import type { ModuleDef, StepText } from './types';
import {
  addStrategy,
  compareLine,
  countList,
  countUp,
  dealLines,
  missingPart,
  repeated,
  subtractStrategy,
  sumSteps,
} from './work';

export const div = (a: number, b: number) => (b === 0 ? undefined : a / b);

/** A whole-number variable (counts, digits…). */
export const whole = (
  id: string,
  symbol: string,
  name: string,
  min: number,
  max: number,
): VariableDef => ({
  id,
  symbol,
  name,
  min,
  max,
  step: 1,
  integer: true,
});

/** a + b = c and c − b = a, with Grade-level step text. */
/** Worked lines for a + b = c: add by place, subtract by jumping back, count up to a part. */
export const addWork = (v: Values) => addStrategy(v.a!, v.b!);
export const subtractWork = (v: Values) => subtractStrategy(v.c!, v.b!);
export const countUpWork = (v: Values) => countUp(v.a!, v.c!);

function addSub(how: { c: string; a: string; b: string }) {
  const relations = [
    {
      id: 'a + b = c',
      display: '{a} + {b} = {c}',
      vars: ['a', 'b', 'c'],
      residual: (v: Record<string, number>) => v.a! + v.b! - v.c!,
      solve: {
        c: (v: Record<string, number>) => v.a! + v.b!,
        a: (v: Record<string, number>) => v.c! - v.b!,
        b: (v: Record<string, number>) => v.c! - v.a!,
      },
    },
    {
      id: 'c − b = a',
      display: '{c} − {b} = {a}',
      vars: ['a', 'b', 'c'],
      residual: (v: Record<string, number>) => v.c! - v.b! - v.a!,
      solve: {
        a: (v: Record<string, number>) => v.c! - v.b!,
        c: (v: Record<string, number>) => v.a! + v.b!,
        b: (v: Record<string, number>) => v.c! - v.a!,
      },
    },
  ];
  const steps: Record<string, Record<string, StepText>> = {
    'a + b = c': {
      c: { expr: '{a} + {b}', how: how.c, work: addWork },
      a: { expr: '{c} − {b}', how: how.a, work: subtractWork },
      b: { expr: '{c} − {a}', how: how.b, work: countUpWork },
    },
    'c − b = a': {
      a: { expr: '{c} − {b}', how: how.a, work: subtractWork },
      c: { expr: '{a} + {b}', how: 'Put back what was taken away: add.', work: addWork },
      b: { expr: '{c} − {a}', how: how.b, work: countUpWork },
    },
  };
  return { relations, steps };
}

/**
 * d = the difference between a and b, never negative (K–2 has no negative numbers). Knowing d
 * and one value leaves two answers (more or fewer); the solver keeps the one nearest before.
 */
export function difference(
  d: string,
  a: string,
  b: string,
  how: {
    diff: string;
    /** How to find a: [when a is the bigger one, when a is the smaller one]. */
    first: [string, string];
    /** How to find b: [when a is the bigger one, when a is the smaller one]. */
    second: [string, string];
    /** Show counting up from the smaller to the bigger number (for 2- and 3-digit numbers). */
    countUp?: boolean;
    /** Start by saying which number is greater, place by place (compare-numbers lessons). */
    compare?: boolean;
    /** The formula as students read it, e.g. "{d} = how many more: {a} or {b}" (K–1). */
    display?: string;
    /** Count on and count back one at a time (Kindergarten, numbers to 10). */
    countOn?: boolean;
    /** How to find a or b when there is no difference (default: they are the same). */
    same?: string;
  },
) {
  const id = `${d} = difference of ${a} and ${b}`;
  const aMore = (v: Values) => v[a]! >= v[b]!;
  const same = how.same ?? 'There is no difference. Both are the same.';
  /**
   * Knowing one amount and the difference leaves two answers; the solver keeps one. Name the
   * other ("or 12, the other way round") so a student with the opposite problem sees it.
   */
  const otherWay = (known: number, diff: number, wentUp: boolean) => {
    const alt = wentUp ? known - diff : known + diff;
    return diff > 0 && alt >= 0 ? `(or ${formatNumber(alt)}, the other way round)` : '';
  };
  /** "Start at 4. Count on 3: 5, 6, 7 → 7" or "Start at 7. Count back 3: 6, 5, 4 → 4". */
  const counting = (from: number, by: number, up: boolean) =>
    by > 0
      ? [
          `Start at ${from}. Count ${up ? 'on' : 'back'} ${by}: ${countList(from, up ? 1 : -1, by)} → ${up ? from + by : from - by}`,
        ]
      : [];
  const relation = {
    id,
    display: how.display ?? `{${d}} = difference of {${a}} and {${b}}`,
    vars: [d, a, b],
    residual: (v: Values) => v[d]! - Math.abs(v[a]! - v[b]!),
    check: (v: Values) =>
      `${formatNumber(Math.max(v[a]!, v[b]!))} − ${formatNumber(Math.min(v[a]!, v[b]!))} = ${formatNumber(Math.abs(v[a]! - v[b]!))}`,
    solve: {
      [d]: (v: Values) => Math.abs(v[a]! - v[b]!),
      [a]: (v: Values) => [v[b]! + v[d]!, v[b]! - v[d]!],
      [b]: (v: Values) => [v[a]! - v[d]!, v[a]! + v[d]!],
    },
  };
  const steps: Record<string, Record<string, StepText>> = {
    [id]: {
      [d]: {
        expr: (v) => (aMore(v) ? `{${a}} − {${b}}` : `{${b}} − {${a}}`),
        how: how.diff,
        ...(how.countUp || how.compare || how.countOn
          ? {
              work: (v: Values) => {
                const [lo, hi] = [Math.min(v[a]!, v[b]!), Math.max(v[a]!, v[b]!)];
                return [
                  ...(how.compare ? [compareLine(v[a]!, v[b]!)] : []),
                  ...(how.countUp ? countUp(lo, hi) : []),
                  ...(how.countOn && hi > lo
                    ? [`Count on from ${lo}: ${countList(lo, 1, hi - lo)} → ${hi - lo}`]
                    : []),
                ];
              },
            }
          : {}),
      },
      [a]: {
        expr: (v) => (aMore(v) ? `{${b}} + {${d}}` : `{${b}} − {${d}}`),
        how: (v) => (v[d] === 0 ? same : how.first[aMore(v) ? 0 : 1]),
        note: (v) => otherWay(v[b]!, v[d]!, aMore(v)),
        work: (v) =>
          how.countOn
            ? counting(v[b]!, v[d]!, aMore(v))
            : aMore(v)
              ? addStrategy(v[b]!, v[d]!)
              : subtractStrategy(v[b]!, v[d]!),
      },
      [b]: {
        expr: (v) => (aMore(v) ? `{${a}} − {${d}}` : `{${a}} + {${d}}`),
        how: (v) => (v[d] === 0 ? same : how.second[aMore(v) ? 0 : 1]),
        note: (v) => otherWay(v[a]!, v[d]!, !aMore(v)),
        work: (v) =>
          how.countOn
            ? counting(v[a]!, v[d]!, !aMore(v))
            : aMore(v)
              ? subtractStrategy(v[a]!, v[d]!)
              : addStrategy(v[a]!, v[d]!),
      },
    },
  };
  return { relation, steps };
}

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
  return [
    ...countOnLines(parts),
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

/** Tens and ones of n (n = t tens + o ones), for counting and place value. */
function tensOnes(maxTens: number) {
  return {
    relations: [
      {
        id: 'n = t tens + o ones',
        display: '{n} = {t} tens + {o} ones',
        vars: ['n', 't', 'o'],
        residual: (v: Record<string, number>) => v.n! - 10 * v.t! - v.o!,
        solve: {
          n: (v: Record<string, number>) => 10 * v.t! + v.o!,
          t: (v: Record<string, number>) => (v.n! - v.o!) / 10,
          o: (v: Record<string, number>) => v.n! - 10 * v.t!,
        },
      },
      {
        id: 't = tens in n',
        display: '{t} = full tens in {n}',
        vars: ['t', 'n'],
        residual: (v: Record<string, number>) => v.t! - Math.floor(v.n! / 10),
        // The tens alone don't say which number: n stays unknown (no numeric guess).
        solve: { t: (v: Record<string, number>) => Math.floor(v.n! / 10), n: () => undefined },
      },
      {
        id: 'o = ones left in n',
        display: '{o} = ones left in {n}',
        vars: ['o', 'n'],
        residual: (v: Record<string, number>) => v.o! - (v.n! % 10),
        solve: { o: (v: Record<string, number>) => v.n! % 10, n: () => undefined },
      },
    ],
    steps: {
      'n = t tens + o ones': {
        n: {
          expr: '{t} tens + {o} ones',
          how: 'Count the rods by tens, then count on the small cubes.',
          work: (v: Values) => [`${v.t} tens = ${10 * v.t!}`, `${10 * v.t!} + ${v.o} = ${v.n}`],
        },
        t: {
          expr: 'tens in ({n} − {o})',
          how: 'Take away the extra ones. The rest are groups of ten.',
          work: (v: Values) => [
            `${v.n} − ${v.o} = ${v.n! - v.o!}`,
            `${v.n! - v.o!} is ${v.t} tens`,
          ],
        },
        o: {
          expr: '{n} − {t} tens',
          how: 'Take away the full tens. The ones are left.',
          work: (v: Values) => [`${v.t} tens = ${10 * v.t!}`, `${v.n} − ${10 * v.t!} = ${v.o}`],
        },
      },
      't = tens in n': {
        t: {
          expr: 'full tens in {n}',
          how: 'Count the rods. Each rod is a ten.',
          work: (v: Values) => [
            `${v.n} = ${v.n! - (v.n! % 10)} + ${v.n! % 10}`,
            `${v.n! - (v.n! % 10)} is ${Math.floor(v.n! / 10)} tens`,
          ],
        },
      },
      'o = ones left in n': {
        o: {
          expr: 'ones left in {n}',
          how: 'Count what is left after the full tens.',
          work: (v: Values) => [
            `${v.n} = ${v.n! - (v.n! % 10)} + ${v.n! % 10}`,
            `${v.n! % 10} ones are left`,
          ],
        },
      },
    } as Record<string, Record<string, StepText>>,
    variables: [whole('t', 't', 'Tens', 0, maxTens), whole('o', 'o', 'Ones', 0, 9)],
  };
}

const g1tens = tensOnes(9);

/** Adds three numbers in the order (or grouping) a relation shows: first pair, then the third. */
function sumInOrder(id: string, v: Values): string[] {
  const [x, y, z] =
    id === 'a + (b + c) = s'
      ? [v.b!, v.c!, v.a!]
      : id === 'c + b + a = s'
        ? [v.c!, v.b!, v.a!]
        : [v.a!, v.b!, v.c!];
  return id === 'a + (b + c) = s'
    ? [`${x} + ${y} = ${x + y}`, `${z} + ${x + y} = ${x + y + z}`]
    : [`${x} + ${y} = ${x + y}`, `${x + y} + ${z} = ${x + y + z}`];
}

const cmpK10 = difference('d', 'a', 'b', {
  countOn: true,
  display: '{d} = how many more: {a} or {b}',
  diff: 'Match the counters in pairs. Count the solid ones left over.',
  first: [
    'The first row has more. Add the extra to the second row.',
    'The first row has fewer. Take the extra away from the second row.',
  ],
  second: [
    'The first row has more. Take the extra away from the first row.',
    'The first row has fewer. Add the extra to the first row.',
  ],
});
const cmpPencils = difference('d', 'a', 'b', {
  countOn: true,
  display: '{d} = how much longer: {a} or {b}',
  diff: 'Line up the pencils at one end. Count the cubes that stick out.',
  first: [
    'Pencil A is longer. Add the extra cubes to pencil B.',
    'Pencil A is shorter. Take the extra cubes away from pencil B.',
  ],
  second: [
    'Pencil A is longer. Take the extra cubes away from pencil A.',
    'Pencil A is shorter. Add the extra cubes to pencil A.',
  ],
});
export const cmpShapes = difference('d', 'c', 's', {
  display: '{d} = how many more: {c} or {s}',
  diff: 'Line up the two columns. Count the extra pictures in the taller one.',
  first: [
    'There are more circles. Add the extra to the squares.',
    'There are fewer circles. Take the extra away from the squares.',
  ],
  second: [
    'There are more circles. Take the extra away from the circles.',
    'There are fewer circles. Add the extra to the circles.',
  ],
});
export const cmpBars = difference('d', 'a', 'b', {
  diff: 'Count up from the shorter bar’s number to the taller bar’s number.',
  countUp: true,
  first: [
    'Soccer is taller. Add the difference to basketball.',
    'Soccer is shorter. Subtract the difference from basketball.',
  ],
  second: [
    'Soccer is taller. Subtract the difference from soccer.',
    'Soccer is shorter. Add the difference to soccer.',
  ],
});

export const MATH_K2_MODULES: ModuleDef[] = [
  // ─── Kindergarten ──────────────────────────────────────────────────────────
  {
    id: 'm.K.count-100',
    assumptions: [
      'Count by ones: the next number is 1 more.',
      'Count by tens: go one row down on the chart for each ten.',
    ],
    variables: [
      whole('n', 'n', 'Start number', 1, 99),
      whole('p', 'p', 'One more', 2, 100),
      whole('t', 't', 'Tens to count', 1, 9),
      whole('m', 'm', 'End number', 11, 100),
    ],
    relations: [
      {
        id: 'p = n + 1',
        display: '{p} = {n} + 1',
        vars: ['p', 'n'],
        residual: (v) => v.p! - v.n! - 1,
        solve: { p: (v) => v.n! + 1, n: (v) => v.p! - 1 },
      },
      {
        id: 'm = n + t tens',
        check: (v) => `${v.n} + ${10 * v.t!} = ${v.m}`,
        display: '{m} = {n} + {t} tens',
        vars: ['m', 'n', 't'],
        residual: (v) => v.m! - v.n! - 10 * v.t!,
        solve: {
          m: (v) => v.n! + 10 * v.t!,
          n: (v) => v.m! - 10 * v.t!,
          t: (v) => (v.m! - v.n!) / 10,
        },
      },
    ],
    steps: {
      'p = n + 1': {
        p: { expr: '{n} + 1', how: 'Say the next number. It is the next box on the chart.' },
        n: { expr: '{p} − 1', how: 'Say the number just before. It is the box before.' },
      },
      'm = n + t tens': {
        m: {
          work: (v) => [
            `${v.t} tens = ${10 * v.t!}`,
            `Count by tens from ${v.n}: ${countList(v.n!, 10, v.t!)}`,
          ],
          expr: '{n} + {t} tens',
          how: 'Start at the start number. Count by tens: go down one row for each ten.',
        },
        n: {
          work: (v) => [
            `${v.t} tens = ${10 * v.t!}`,
            `Count back by tens from ${v.m}: ${countList(v.m!, -10, v.t!)}`,
          ],
          expr: '{m} − {t} tens',
          how: 'Start at the end number. Go up one row for each ten.',
        },
        t: {
          work: (v) => [
            `${v.n} → ${countList(v.n!, 10, v.t!)}: ${v.t} ${v.t === 1 ? 'ten' : 'tens'}`,
            `${v.t} tens = ${10 * v.t!}`,
          ],
          expr: 'tens from {n} to {m}',
          how: 'Go down the chart from the start number. Count the rows to the end number.',
        },
      },
    },
    example: { n: 30, p: 31, t: 4, m: 70 },
    startWith: ['n', 't'],
    representation: {
      kind: 'hundredChart',
      value: 'n',
      max: 100,
      marks: ['p', 'm'],
      tens: { count: 't' },
    },
  },

  {
    id: 'm.K.count-objects',
    assumptions: ['Touch and count each object once.', 'The last number you say tells how many.'],
    variables: [whole('n', 'n', 'Objects', 0, 19), whole('m', 'm', 'After one more', 1, 20)],
    relations: [
      {
        id: 'm = n + 1',
        display: '{m} = {n} + 1',
        vars: ['m', 'n'],
        residual: (v) => v.m! - v.n! - 1,
        solve: { m: (v) => v.n! + 1, n: (v) => v.m! - 1 },
      },
    ],
    steps: {
      'm = n + 1': {
        m: { expr: '{n} + 1', how: 'Add one more counter. Say the next number.' },
        n: { expr: '{m} − 1', how: 'Take one away. Say the number just before.' },
      },
    },
    example: { n: 7, m: 8 },
    startWith: ['n'],
    representation: { kind: 'tenFrame', first: 'n', second: 1, total: 'm', frames: 2 },
  },

  {
    id: 'm.K.compare-10',
    assumptions: [
      'Match each counter with one in the other row.',
      'The row with counters left over has more.',
      'If none are left over, the groups are equal.',
    ],
    variables: [
      whole('a', 'a', 'First row', 0, 10),
      whole('b', 'b', 'Second row', 0, 10),
      whole('d', 'd', 'How many more', 0, 10),
    ],
    relations: [cmpK10.relation],
    steps: {
      ...cmpK10.steps,
    },
    example: { a: 7, b: 4, d: 3 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'compareRows',
      a: 'a',
      b: 'b',
      difference: 'd',
      icon: 'dot',
      words: ['more', 'fewer'],
    },
  },

  {
    id: 'm.K.make-10',
    assumptions: ['A ten-frame has 10 boxes.', 'Solid counters and open counters make 10.'],
    variables: [
      whole('a', 'a', 'Solid counters', 0, 10),
      whole('b', 'b', 'More to make 10', 0, 10),
    ],
    relations: [
      {
        id: 'a + b = 10',
        display: '{a} + {b} = 10',
        vars: ['a', 'b'],
        residual: (v) => v.a! + v.b! - 10,
        solve: { a: (v) => 10 - v.b!, b: (v) => 10 - v.a! },
      },
    ],
    steps: {
      'a + b = 10': {
        b: {
          expr: '10 − {a}',
          how: 'Count the open counters. They fill the empty boxes.',
          work: (v) =>
            v.b! > 0 ? [`Count on from ${v.a}: ${countList(v.a!, 1, v.b!)} → ${v.b}`] : [],
        },
        a: { expr: '10 − {b}', how: 'Count the solid counters.' },
      },
    },
    example: { a: 6, b: 4 },
    startWith: ['a'],
    representation: { kind: 'tenFrame', first: 'a', second: 'b', total: 10 },
  },

  {
    id: 'm.K.teens-place-value',
    assumptions: [
      'The first ten-frame is full. That is 1 ten.',
      'The numbers 11 to 19 are 1 ten and some more ones.',
      '10 is 1 ten and 0 ones.',
    ],
    variables: [whole('n', 'n', 'Number (10–19)', 10, 19), whole('o', 'o', 'Extra ones', 0, 9)],
    relations: [
      {
        id: 'n = 10 + o',
        display: '{n} = 10 + {o}',
        vars: ['n', 'o'],
        residual: (v) => v.n! - 10 - v.o!,
        solve: { n: (v) => 10 + v.o!, o: (v) => v.n! - 10 },
      },
    ],
    steps: {
      'n = 10 + o': {
        n: { expr: '10 + {o}', how: 'Start at 10 and count on the extra ones.' },
        o: { expr: '{n} − 10', how: 'Take away the ten. The rest are the extra ones.' },
      },
    },
    example: { n: 14, o: 4 },
    startWith: ['n'],
    representation: { kind: 'tenFrame', first: 10, second: 'o', total: 'n', frames: 2 },
  },

  {
    id: 'm.K.measurable-attributes',
    assumptions: [
      'Line up one end of each at the same place.',
      'The one that sticks out is longer.',
      'Count the cubes that stick out. That is how much longer.',
    ],
    variables: [
      { ...whole('a', 'a', 'Pencil A', 0, 12), unit: 'cubes' },
      { ...whole('b', 'b', 'Pencil B', 0, 12), unit: 'cubes' },
      { ...whole('d', 'd', 'How much longer', 0, 12), unit: 'cubes' },
    ],
    relations: [cmpPencils.relation],
    steps: {
      ...cmpPencils.steps,
    },
    example: { a: 9, b: 6, d: 3 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'compareRows',
      a: 'a',
      b: 'b',
      difference: 'd',
      icon: 'cube',
      words: ['longer', 'shorter'],
    },
  },

  {
    id: 'm.K.shapes-2d-3d',
    assumptions: [
      'Flat shapes like triangles and squares have straight sides and corners. A circle has none.',
      'A long, thin or tipped shape keeps its name. Count the sides to name it.',
      'Cubes, cones, cylinders and spheres are solid shapes.',
    ],
    variables: [whole('s', 's', 'Sides', 3, 6), whole('v', 'c', 'Corners', 3, 6)],
    relations: [
      {
        id: 'corners = sides',
        display: '{s} sides and {v} corners',
        vars: ['v', 's'],
        residual: (x) => x.v! - x.s!,
        solve: { v: (x) => x.s!, s: (x) => x.v! },
      },
    ],
    steps: {
      'corners = sides': {
        v: {
          expr: '{s}',
          how: 'Each side ends at a corner. There is one corner for each side.',
        },
        s: {
          expr: '{v}',
          how: 'There is one side between two corners. There is one side for each corner.',
        },
      },
    },
    example: { s: 4, v: 4 },
    startWith: ['s'],
    representation: { kind: 'polygon', sides: 's', corners: 'v', irregular: 'toggle' },
  },

  // ─── Grade 1 ───────────────────────────────────────────────────────────────
  {
    id: 'm.1.add-sub-20',
    assumptions: [
      'All numbers are 0 to 20.',
      'Make a ten: 8 + 5 = 8 + 2 + 3 = 10 + 3.',
      'Subtraction undoes addition: if 8 + 5 = 13, then 13 − 5 = 8.',
    ],
    variables: [
      whole('a', 'a', 'First number', 0, 20),
      whole('b', 'b', 'Second number', 0, 20),
      whole('c', 'c', 'Total', 0, 20),
    ],
    ...addSub({
      c: 'Add. Make a ten first, or use a double you know.',
      a: 'Take the second number away from the total.',
      b: 'Count on from the first number up to the total.',
    }),
    example: { a: 8, b: 5, c: 13 },
    startWith: ['a', 'b'],
    representation: { kind: 'tenFrame', first: 'a', second: 'b', total: 'c', frames: 2 },
  },

  {
    id: 'm.1.addition-properties',
    assumptions: [
      'Changing the order doesn’t change the total: 3 + 5 = 5 + 3.',
      'Add any two first. The total is the same: 3 + 5 + 2 = 3 + 7.',
      'Pick two that are easy to add, like two that make a ten.',
    ],
    variables: [
      whole('a', 'a', 'First number', 0, 10),
      whole('b', 'b', 'Second number', 0, 10),
      whole('c', 'c', 'Third number', 0, 10),
      whole('s', 's', 'Total', 0, 20),
    ],
    relations: (
      [
        ['(a + b) + c = s', '({a} + {b}) + {c} = {s}'],
        ['a + (b + c) = s', '{a} + ({b} + {c}) = {s}'],
        ['c + b + a = s', '{c} + {b} + {a} = {s}'],
      ] as const
    ).map(([id, display]) => ({
      id,
      display,
      vars: ['a', 'b', 'c', 's'],
      residual: (v: Record<string, number>) => v.a! + v.b! + v.c! - v.s!,
      solve: {
        s: (v: Record<string, number>) => v.a! + v.b! + v.c!,
        a: (v: Record<string, number>) => v.s! - v.b! - v.c!,
        b: (v: Record<string, number>) => v.s! - v.a! - v.c!,
        c: (v: Record<string, number>) => v.s! - v.a! - v.b!,
      },
    })),
    steps: Object.fromEntries(
      [
        ['(a + b) + c = s', '({a} + {b}) + {c}', 'Add the first two. Then add the third.'],
        [
          'a + (b + c) = s',
          '{a} + ({b} + {c})',
          'Add the last two first. Then add the first. The total is the same.',
        ],
        ['c + b + a = s', '{c} + {b} + {a}', 'Add in the opposite order. The total is the same.'],
      ].map(([id, expr, how]) => [
        id!,
        {
          s: { expr: expr!, how: how!, work: (v: Values) => sumInOrder(id!, v) },
          a: {
            expr: '{s} − {b} − {c}',
            how: 'Take the other two numbers away from the total.',
            work: (v: Values) => [
              `${v.s} − ${v.b} = ${v.s! - v.b!}`,
              `${v.s! - v.b!} − ${v.c} = ${v.a}`,
            ],
          },
          b: {
            expr: '{s} − {a} − {c}',
            how: 'Take the other two numbers away from the total.',
            work: (v: Values) => [
              `${v.s} − ${v.a} = ${v.s! - v.a!}`,
              `${v.s! - v.a!} − ${v.c} = ${v.b}`,
            ],
          },
          c: {
            expr: '{s} − {a} − {b}',
            how: 'Take the other two numbers away from the total.',
            work: (v: Values) => [
              `${v.s} − ${v.a} = ${v.s! - v.a!}`,
              `${v.s! - v.a!} − ${v.b} = ${v.c}`,
            ],
          },
        },
      ]),
    ),
    example: { a: 3, b: 5, c: 2, s: 10 },
    startWith: ['a', 'b', 'c'],
    representation: {
      kind: 'cubeTrains',
      rows: [
        [['a', 'b'], 'c'],
        ['a', ['b', 'c']],
        ['c', 'b', 'a'],
      ],
      total: 's',
    },
  },

  {
    id: 'm.1.equal-sign',
    assumptions: [
      'The equal sign means both sides are the same amount.',
      'To find a missing number, make both sides the same: 8 + 2 = 5 + ?',
      'Subtraction works the same way: 8 = 10 − 2 is true, because 10 − 2 is 8.',
    ],
    variables: [
      whole('a', 'a', 'First on left', 0, 10),
      whole('b', 'b', 'Second on left', 0, 10),
      whole('c', 'c', 'First on right', 0, 10),
      whole('d', 'd', 'Second on right', 0, 10),
    ],
    relations: [
      {
        id: 'a + b = c + d',
        display: '{a} + {b} = {c} + {d}',
        vars: ['a', 'b', 'c', 'd'],
        residual: (v) => v.a! + v.b! - v.c! - v.d!,
        solve: {
          a: (v) => v.c! + v.d! - v.b!,
          b: (v) => v.c! + v.d! - v.a!,
          c: (v) => v.a! + v.b! - v.d!,
          d: (v) => v.a! + v.b! - v.c!,
        },
      },
    ],
    steps: {
      'a + b = c + d': {
        d: {
          work: (v) => [
            `Left side: ${v.a} + ${v.b} = ${v.a! + v.b!}`,
            ...addStrategy(v.a!, v.b!),
            v.d! === 0
              ? `${v.c} + 0 = ${v.a! + v.b!}`
              : v.d! <= 5
                ? `${v.c} + ? = ${v.a! + v.b!}: count on ${countList(v.c!, 1, v.d!)} → ${v.d}`
                : `${v.a! + v.b!} − ${v.c} = ${v.d}`,
            ...(v.d! > 5 ? subtractStrategy(v.a! + v.b!, v.c!) : []),
          ],
          expr: '{a} + {b} − {c}',
          how: 'Add the left side. Count on from the first number on the right up to that total.',
        },
        c: {
          work: (v) => [
            `Left side: ${v.a} + ${v.b} = ${v.a! + v.b!}`,
            ...addStrategy(v.a!, v.b!),
            `${v.a! + v.b!} − ${v.d} = ${v.c}`,
            ...subtractStrategy(v.a! + v.b!, v.d!),
          ],
          expr: '{a} + {b} − {d}',
          how: 'Add the left side. Take away the second number on the right.',
        },
        b: {
          work: (v) => [
            `Right side: ${v.c} + ${v.d} = ${v.c! + v.d!}`,
            ...addStrategy(v.c!, v.d!),
            `${v.c! + v.d!} − ${v.a} = ${v.b}`,
            ...subtractStrategy(v.c! + v.d!, v.a!),
          ],
          expr: '{c} + {d} − {a}',
          how: 'Add the right side. Take away the first number on the left.',
        },
        a: {
          work: (v) => [
            `Right side: ${v.c} + ${v.d} = ${v.c! + v.d!}`,
            ...addStrategy(v.c!, v.d!),
            `${v.c! + v.d!} − ${v.b} = ${v.a}`,
            ...subtractStrategy(v.c! + v.d!, v.b!),
          ],
          expr: '{c} + {d} − {b}',
          how: 'Add the right side. Take away the second number on the left.',
        },
      },
    },
    example: { a: 8, b: 2, c: 5, d: 5 },
    startWith: ['a', 'b', 'c'],
    representation: { kind: 'balance', left: ['a', 'b'], right: ['c', 'd'] },
  },

  {
    id: 'm.1.count-120',
    assumptions: [
      'After 100, keep counting the same way: 101, 102, … 120.',
      'One more is the next number. Ten more is one row down.',
    ],
    variables: [
      whole('n', 'n', 'Number', 1, 120),
      whole('p', 'p', 'One more', 1, 121),
      whole('q', 'q', 'Ten more', 10, 130),
    ],
    relations: [
      {
        id: 'p = n + 1',
        display: '{p} = {n} + 1',
        vars: ['p', 'n'],
        residual: (v) => v.p! - v.n! - 1,
        solve: { p: (v) => v.n! + 1, n: (v) => v.p! - 1 },
      },
      {
        id: 'q = n + 10',
        display: '{q} = {n} + 10',
        vars: ['q', 'n'],
        residual: (v) => v.q! - v.n! - 10,
        solve: { q: (v) => v.n! + 10, n: (v) => v.q! - 10 },
      },
    ],
    steps: {
      'p = n + 1': {
        p: { expr: '{n} + 1', how: 'One more: the next number on the chart.' },
        n: { expr: '{p} − 1', how: 'One less: the number just before.' },
      },
      'q = n + 10': {
        q: {
          expr: '{n} + 10',
          how: 'Ten more: the number just below on the chart.',
        },
        n: { expr: '{q} − 10', how: 'Ten less: the number just above on the chart.' },
      },
    },
    example: { n: 67, p: 68, q: 77 },
    startWith: ['n'],
    representation: { kind: 'hundredChart', value: 'n', max: 120, marks: ['p', 'q'] },
  },

  {
    id: 'm.1.tens-ones',
    assumptions: [
      'A ten is a group of 10 ones.',
      'In 45, the 4 means 4 tens. The 5 means 5 ones.',
      'Trade 10 ones for 1 ten.',
    ],
    variables: [whole('n', 'n', 'Number', 0, 99), ...g1tens.variables],
    relations: g1tens.relations,
    steps: g1tens.steps,
    example: { n: 45, t: 4, o: 5 },
    startWith: ['n'],
    representation: {
      kind: 'baseTen',
      groups: ['n'],
      controls: [
        { var: 't', steps: [1] },
        { var: 'o', steps: [1] },
      ],
    },
  },

  {
    id: 'm.1.add-within-100',
    assumptions: [
      'Add a small number like 7, or tens like 20, to a number like 36.',
      'Add tens with tens and ones with ones.',
      'The total is 100 or less.',
    ],
    variables: [
      whole('a', 'a', 'First number', 0, 100),
      whole('b', 'b', 'Second number', 0, 100),
      whole('c', 'c', 'Total', 0, 100),
    ],
    ...addSub({
      c: 'Add the rods, then the small cubes. Trade 10 small cubes for a rod.',
      a: 'Take the second number away from the total.',
      b: 'Count up from the first number to the total: tens first, then ones.',
    }),
    example: { a: 36, b: 7, c: 43 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'baseTen',
      groups: ['a', 'b'],
      total: 'c',
      controls: [
        { var: 'a', steps: [1, 10] },
        { var: 'b', steps: [1, 10] },
      ],
    },
  },

  {
    id: 'm.1.measure-nonstandard',
    assumptions: [
      'Lay the units end to end, with no gaps and no overlaps.',
      'Use units that are all the same size.',
      'A paper clip is as long as 2 cubes. Bigger units: you need fewer of them.',
    ],
    variables: [
      whole('p', 'p', 'Paper clips', 1, 12),
      { ...whole('c', 'c', 'Cubes', 2, 24), multipleOf: 2, step: 2 },
    ],
    relations: [
      {
        id: 'c = p clips of 2 cubes',
        check: (v) => repeated(2, v.p!),
        display: '{c} cubes = {p} clips of 2 cubes',
        vars: ['c', 'p'],
        residual: (v) => v.c! - 2 * v.p!,
        solve: { c: (v) => 2 * v.p!, p: (v) => v.c! / 2 },
      },
    ],
    steps: {
      'c = p clips of 2 cubes': {
        c: {
          work: (v) => [`Count by 2s: ${countList(0, 2, v.p!)} → ${v.c} cubes`],
          expr: '{p} clips of 2 cubes',
          how: 'Count the cubes by 2s, one clip at a time.',
        },
        p: {
          work: (v) => [`Count by 2s to ${v.c}: ${countList(0, 2, v.p!)} → ${v.p} clips`],
          expr: 'groups of 2 in {c}',
          how: 'Put the cubes in groups of 2, one group for each clip. Count the groups.',
        },
      },
    },
    example: { p: 4, c: 8 },
    startWith: ['p'],
    representation: { kind: 'unitTiles', count: 'p', size: 2, total: 'c' },
  },

  {
    id: 'm.1.time-half-hour',
    standalone: {
      vars: ['h'],
      why: 'The short hand shows the hour on its own; the formulas are about the minutes.',
    },
    assumptions: [
      'The short hand shows the hour. The long hand shows the minutes.',
      'At “o’clock” the long hand points to 12. At “half past” it points to 6.',
      'At half past, the short hand is halfway between two numbers. The hour is the smaller one.',
      'An hour is 60 minutes, so half an hour is 30 minutes.',
    ],
    variables: [
      whole('h', 'h', 'Hour', 1, 12),
      whole('k', 'k', 'Half hours past', 0, 1),
      { ...whole('m', 'm', 'Minutes past', 0, 30), step: 30 },
    ],
    relations: [
      {
        id: 'm = k half hours',
        check: (v) => (v.k === 1 ? '1 half hour = 30 minutes' : '0 half hours = 0 minutes'),
        display: '{m} = {k} half hours',
        vars: ['m', 'k'],
        residual: (v) => v.m! - 30 * v.k!,
        solve: { m: (v) => 30 * v.k!, k: (v) => v.m! / 30 },
      },
    ],
    steps: {
      'm = k half hours': {
        m: {
          work: (v) =>
            v.k === 1
              ? [
                  'Long hand on 6: half past',
                  `1 half hour = 30 minutes${v.h === undefined ? '' : ` → ${v.h}:30`}`,
                ]
              : ['Long hand on 12: o’clock', `0 minutes${v.h === undefined ? '' : ` → ${v.h}:00`}`],
          expr: (v: Values) => (v.k === 1 ? '{k} half hour' : '{k} half hours'),
          how: 'At o’clock, it is 0 minutes past. At half past, it is 30.',
        },
        k: {
          work: (v) => [
            v.m === 30
              ? '30 minutes: long hand on 6 → 1 half hour'
              : '0 minutes: long hand on 12 → 0 half hours',
          ],
          expr: 'half hours in {m}',
          how: 'Long hand on 12: 0 half hours. Long hand on 6: 1 half hour.',
        },
      },
    },
    example: { h: 3, k: 1, m: 30 },
    startWith: ['h', 'm'],
    representation: { kind: 'clock', hour: 'h', minute: 'm', minuteStep: 30 },
  },

  {
    id: 'm.1.data-3-categories',
    assumptions: [
      'Each picture stands for one object.',
      'Each column is one kind of shape (a category).',
      'Add all three columns to get the total.',
    ],
    variables: [
      whole('c', 'c', 'Circles', 0, 10),
      whole('s', 's', 'Squares', 0, 10),
      whole('t', 't', 'Triangles', 0, 10),
      whole('n', 'n', 'Total', 0, 30),
    ],
    relations: [
      {
        id: 'n = c + s + t',
        display: '{n} = {c} + {s} + {t}',
        vars: ['n', 'c', 's', 't'],
        residual: (v) => v.n! - v.c! - v.s! - v.t!,
        solve: {
          n: (v) => v.c! + v.s! + v.t!,
          c: (v) => v.n! - v.s! - v.t!,
          s: (v) => v.n! - v.c! - v.t!,
          t: (v) => v.n! - v.c! - v.s!,
        },
      },
    ],
    steps: {
      'n = c + s + t': {
        n: {
          work: (v) => sumSteps([v.c!, v.s!, v.t!]),
          expr: '{c} + {s} + {t}',
          how: 'Add the three columns.',
        },
        c: {
          work: (v) => missingPart(v.n!, [v.s!, v.t!]),
          expr: '{n} − {s} − {t}',
          how: 'Take the other two shapes away from the total.',
        },
        s: {
          work: (v) => missingPart(v.n!, [v.c!, v.t!]),
          expr: '{n} − {c} − {t}',
          how: 'Take the other two shapes away from the total.',
        },
        t: {
          work: (v) => missingPart(v.n!, [v.c!, v.s!]),
          expr: '{n} − {c} − {s}',
          how: 'Take the other two shapes away from the total.',
        },
      },
    },
    example: { c: 6, s: 3, t: 4, n: 13 },
    startWith: ['c', 's', 't'],
    representation: {
      kind: 'pictureGraph',
      columns: [
        { var: 'c', icon: 'circle' },
        { var: 's', icon: 'square' },
        { var: 't', icon: 'triangle' },
      ],
      max: 10,
      total: 'n',
    },
  },

  {
    id: 'm.1.halves-fourths',
    assumptions: [
      'The parts must be equal: the same size.',
      '2 equal parts are halves. 4 equal parts are fourths (quarters).',
      'More parts means smaller parts. A fourth is smaller than a half.',
    ],
    variables: [
      { ...whole('p', 'p', 'Equal parts (2 or 4)', 2, 4), multipleOf: 2, step: 2 },
      whole('k', 'k', 'Shaded parts', 0, 4),
      whole('u', 'u', 'Not shaded', 0, 4),
    ],
    relations: [
      {
        id: 'u = p − k',
        display: '{u} = {p} − {k}',
        vars: ['u', 'p', 'k'],
        residual: (v) => v.u! - (v.p! - v.k!),
        solve: { u: (v) => v.p! - v.k!, p: (v) => v.k! + v.u!, k: (v) => v.p! - v.u! },
      },
    ],
    steps: {
      'u = p − k': {
        u: { expr: '{p} − {k}', how: 'Take the shaded parts away from all the parts.' },
        p: { expr: '{k} + {u}', how: 'Add the shaded and not shaded parts.' },
        k: { expr: '{p} − {u}', how: 'Take the not shaded parts away from all the parts.' },
      },
    },
    example: { p: 4, k: 1, u: 3 },
    startWith: ['p', 'k'],
    representation: { kind: 'partition', parts: 'p', shaded: 'k', shape: 'circle', step: 2 },
  },

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

  {
    id: 'm.2.place-value-1000',
    assumptions: [
      '10 ones make 1 ten; 10 tens make 1 hundred.',
      'A digit’s place tells its value: in 347, the 3 means 3 hundreds.',
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
        display: '{h} = hundreds digit of {n}',
        vars: ['h', 'n'],
        residual: (v) => v.h! - Math.floor(v.n! / 100),
        solve: { h: (v) => Math.floor(v.n! / 100), n: () => undefined },
      },
      {
        id: 't = tens digit',
        display: '{t} = tens digit of {n}',
        vars: ['t', 'n'],
        residual: (v) => v.t! - (Math.floor(v.n! / 10) % 10),
        solve: { t: (v) => Math.floor(v.n! / 10) % 10, n: () => undefined },
      },
      {
        id: 'o = ones digit',
        display: '{o} = ones digit of {n}',
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
      groups: ['n'],
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
      'Subtraction undoes addition: 256 + 178 = 434, so 434 − 178 = 256.',
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
    example: { a: 256, b: 178, c: 434 },
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

  {
    id: 'm.2.skip-count',
    assumptions: [
      'Skip counting adds the same number each time: by 5s, 10s or 100s.',
      'You can start at any number: by 10s from 230 is 230, 240, 250, …',
      'By 10s, the ones digit stays the same. By 100s, the last two digits stay the same.',
    ],
    variables: [
      whole('a', 'a', 'Start', 0, 1000),
      { ...whole('s', 's', 'Count by', 5, 100), multipleOf: 5, step: 5 },
      whole('k', 'k', 'Number of jumps', 1, 20),
      whole('n', 'n', 'Number reached', 1, 1000),
    ],
    relations: [
      {
        id: 'n = a + k jumps of s',
        check: (v) => `${v.a} + ${v.k! * v.s!} = ${v.n}`,
        display: '{n} = {a} + {k} jumps of {s}',
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

  {
    id: 'm.2.even-odd',
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
        display: '{p} = pairs in {n}',
        vars: ['p', 'n'],
        residual: (v) => v.p! - Math.floor(v.n! / 2),
        solve: { p: (v) => Math.floor(v.n! / 2), n: () => undefined },
      },
      {
        id: 'r = left over',
        display: '{r} = left over from {n}',
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
        display: '{n} = {r} rows of {c}',
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

  {
    id: 'm.2.standard-length',
    assumptions: [
      'Line up the end of each ribbon with the ruler’s 0.',
      '“A is 8 cm shorter than B” means B is the longer ribbon.',
      'Measure both in the same unit: inches, feet, centimeters or meters.',
    ],
    variables: [
      { ...whole('L', 'L', 'Longer ribbon', 0, 100), unit: 'cm' },
      { ...whole('S', 'S', 'Shorter ribbon', 0, 100), unit: 'cm' },
      { ...whole('d', 'd', 'How much longer', 0, 100), unit: 'cm' },
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
          how: 'Count up from the shorter length to the longer one.',
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
    representation: { kind: 'ruler', lengths: ['L', 'S'], difference: 'd', extent: 15 },
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
        display: '{T} = {db} dollars + {q} quarters + {dm} dimes + {nk} nickels + {pn} pennies',
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

  {
    id: 'm.2.time-5-min',
    standalone: {
      vars: ['h'],
      why: 'The short hand shows the hour on its own; the formulas are about the minutes.',
    },
    assumptions: [
      'The long hand moves 5 minutes from one number to the next: count by 5s.',
      'The short hand points at the hour, or just past it.',
      '15 minutes past is quarter past. 30 is half past. 45 is quarter to the next hour.',
    ],
    variables: [
      whole('h', 'h', 'Hour', 1, 12),
      { ...whole('m', 'm', 'Minutes past', 0, 55), step: 5 },
      whole('k', 'k', 'Numbers past 12', 0, 11),
    ],
    relations: [
      {
        id: 'm = 5 × k',
        check: (v) => (v.k! > 0 ? repeated(5, v.k!) : '0 = 0'),
        display: '{m} = {k} fives',
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
              ? `Count by 5s to ${v.m}: ${countList(0, 5, v.k!)} → ${v.k} numbers past 12`
              : 'Long hand on 12: 0 numbers past 12',
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
      whole('a', 'a', 'Soccer', 0, 20),
      whole('b', 'b', 'Basketball', 0, 20),
      whole('c', 'c', 'Baseball', 0, 20),
      whole('e', 'e', 'Tennis', 0, 20),
      whole('n', 'n', 'Total', 0, 80),
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

  {
    id: 'm.2.thirds-polygons',
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
        display: '{u} = {p} − {k}',
        vars: ['u', 'p', 'k'],
        residual: (v) => v.u! - (v.p! - v.k!),
        solve: { u: (v) => v.p! - v.k!, p: (v) => v.k! + v.u!, k: (v) => v.p! - v.u! },
      },
    ],
    steps: {
      'u = p − k': {
        u: { expr: '{p} − {k}', how: 'Take the shaded parts away from all the parts.' },
        p: { expr: '{k} + {u}', how: 'Add the shaded and not shaded parts.' },
        k: { expr: '{p} − {u}', how: 'Take the not shaded parts away from all the parts.' },
      },
    },
    example: { p: 3, k: 1, u: 2 },
    startWith: ['p', 'k'],
    representation: { kind: 'partition', parts: 'p', shaded: 'k', shape: 'rectangle' },
  },
];
