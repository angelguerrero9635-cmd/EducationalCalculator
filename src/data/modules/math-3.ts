/**
 * Grade 3 math (CCSS 3.OA, 3.NBT, 3.NF, 3.MD, 3.G). From Grade 3 the formulas use ×, ÷ and
 * fractions, and letters appear only as labels matching a name the student can see; the step
 * explanations say names, not letters.
 */
import type { Values } from '@/engine/types';

import { div, whole } from './math-k2';
import type { ModuleDef, StepText } from './types';
import { addStrategy, divideWork, subtractStrategy, timesWork } from './work';

// ─── Shared pieces ──────────────────────────────────────────────────────────

/**
 * c = a × b with its two divisions. `names` are how the step text says the three values, e.g.
 * ['groups', 'number in each group', 'total'].
 */
function times(
  id: string,
  [a, b, c]: [string, string, string],
  [an, bn, cn]: [string, string, string],
  display = `{${a}} × {${b}} = {${c}}`,
) {
  const relation = {
    id,
    display,
    vars: [c, a, b],
    residual: (v: Values) => v[c]! - v[a]! * v[b]!,
    solve: {
      [c]: (v: Values) => v[a]! * v[b]!,
      [a]: (v: Values) => div(v[c]!, v[b]!),
      [b]: (v: Values) => div(v[c]!, v[a]!),
    },
  };
  const steps: Record<string, StepText> = {
    [c]: {
      expr: `{${a}} × {${b}}`,
      how: `Multiply the ${an} by the ${bn}.`,
      work: (v) => timesWork(v[a]!, v[b]!),
    },
    [a]: {
      expr: `{${c}} ÷ {${b}}`,
      how: `Divide the ${cn} by the ${bn}.`,
      work: (v) => divideWork(v[c]!, v[b]!),
    },
    [b]: {
      expr: `{${c}} ÷ {${a}}`,
      how: `Divide the ${cn} by the ${an}.`,
      work: (v) => divideWork(v[c]!, v[a]!, 'second'),
    },
  };
  return { relation, steps };
}

/** c = a + b with its two subtractions, worked the Grade 3 way (by place). */
function plus(
  id: string,
  [a, b, c]: [string, string, string],
  [an, bn, cn]: [string, string, string],
  display = `{${a}} + {${b}} = {${c}}`,
  unit = '',
) {
  const relation = {
    id,
    display,
    vars: [c, a, b],
    residual: (v: Values) => v[c]! - v[a]! - v[b]!,
    solve: {
      [c]: (v: Values) => v[a]! + v[b]!,
      [a]: (v: Values) => v[c]! - v[b]!,
      [b]: (v: Values) => v[c]! - v[a]!,
    },
  };
  const steps: Record<string, StepText> = {
    [c]: {
      expr: `{${a}} + {${b}}`,
      how: `Add the ${an} and the ${bn}.`,
      work: (v) => addStrategy(v[a]!, v[b]!, unit),
    },
    [a]: {
      expr: `{${c}} − {${b}}`,
      how: `Take the ${bn} away from the ${cn}.`,
      work: (v) => subtractStrategy(v[c]!, v[b]!, unit),
    },
    [b]: {
      expr: `{${c}} − {${a}}`,
      how: `Take the ${an} away from the ${cn}.`,
      work: (v) => subtractStrategy(v[c]!, v[a]!, unit),
    },
  };
  return { relation, steps };
}

/** Rounding to the nearest `to` (10 or 100): the multiple below, the one above, the nearer one. */
function rounding(to: 10 | 100): Pick<ModuleDef, 'relations' | 'steps'> {
  const place = to === 10 ? 'ten' : 'hundred';
  const half = to / 2;
  const below = (n: number) => Math.floor(n / to) * to;
  return {
    relations: [
      {
        id: `L = ${place} below n`,
        display: `The ${place} at or below {n} is {L}`,
        vars: ['L', 'n'],
        residual: (v) => v.L! - below(v.n!),
        // Every number from 40 to 49 has the ten 40 below it: the number can't be found from it.
        solve: { L: (v) => below(v.n!), n: () => undefined },
      },
      {
        id: `U = L + ${to}`,
        display: `{L} + ${to} = {U}`,
        vars: ['U', 'L'],
        residual: (v) => v.U! - v.L! - to,
        solve: { U: (v) => v.L! + to, L: (v) => v.U! - to },
      },
      {
        id: `r = nearer ${place}`,
        display: '{n} is between {L} and {U}, so it rounds to {r}',
        vars: ['r', 'n', 'L', 'U'],
        residual: (v) => v.r! - (v.n! - v.L! < half ? v.L! : v.U!),
        solve: {
          r: (v) => (v.n! - v.L! < half ? v.L! : v.U!),
          n: () => undefined,
          L: () => undefined,
          U: () => undefined,
        },
      },
    ],
    steps: {
      [`L = ${place} below n`]: {
        L: {
          expr: to === 10 ? '{n} without its ones' : '{n} without its tens and ones',
          how: `Keep the ${to === 10 ? 'hundreds and tens' : 'hundreds'}. Make the other digits 0.`,
          work: (v) => [`${v.n} = ${below(v.n!)} + ${v.n! - below(v.n!)}`],
        },
      },
      [`U = L + ${to}`]: {
        U: { expr: `{L} + ${to}`, how: `The next ${place} up is ${to} more.` },
        L: { expr: `{U} − ${to}`, how: `The ${place} below is ${to} less.` },
      },
      [`r = nearer ${place}`]: {
        r: {
          expr: (v) => (v.n! - v.L! < half ? '{L}' : '{U}'),
          how: `Round to the nearer ${place}. Halfway (${half} past) or more rounds up.`,
          work: (v) => [
            `From ${v.L} to ${v.n} is ${v.n! - v.L!}. From ${v.n} to ${v.U} is ${v.U! - v.n!}.`,
            v.n! - v.L! < half
              ? `${v.n! - v.L!} is less than ${half}: round down to ${v.L}.`
              : `${v.n! - v.L!} is ${half} or more: round up to ${v.U}.`,
          ],
        },
      },
    },
  };
}

// ─── Modules ────────────────────────────────────────────────────────────────

const groups = times('n = g × k', ['g', 'k', 'n'], ['groups', 'number in each group', 'total']);
const arrayTimes = times('n = r × c', ['r', 'c', 'n'], ['rows', 'number in each row', 'total']);
const jumps = times('n = k × s', ['k', 's', 'n'], ['jumps', 'size of each jump', 'end number']);

export const MATH_3_MODULES: ModuleDef[] = [
  // ── Multiply and divide within 100 (3.OA.1–4, 3.OA.7) ──
  {
    id: 'm.3.multiply-divide-100',
    assumptions: [
      'Every group has the same number.',
      'Multiply to find the total: groups × number in each group.',
      'Divide to find the number of groups, or how many are in each group.',
      'Up to 10 groups of up to 10.',
    ],
    variables: [
      whole('g', 'g', 'Groups', 0, 10),
      whole('k', 'k', 'In each group', 0, 10),
      whole('n', 'n', 'Total', 0, 100),
    ],
    relations: [groups.relation],
    steps: { 'n = g × k': groups.steps },
    example: { g: 4, k: 6, n: 24 },
    startWith: ['g', 'k'],
    representation: { kind: 'equalGroups', groups: 'g', each: 'k', total: 'n' },
  },
  {
    id: 'm.3.multiply-divide-100~array',
    title: 'Arrays',
    assumptions: [
      'Every row has the same number, and so does every column.',
      'Rows × number in each row = total.',
      'Turn the array and the total stays the same: 4 × 6 = 6 × 4.',
    ],
    variables: [
      whole('r', 'r', 'Rows', 0, 10),
      whole('c', 'c', 'In each row', 0, 10),
      whole('n', 'n', 'Total', 0, 100),
    ],
    relations: [arrayTimes.relation],
    steps: { 'n = r × c': arrayTimes.steps },
    example: { r: 3, c: 7, n: 21 },
    startWith: ['r', 'c'],
    representation: { kind: 'array', rows: 'r', columns: 'c', total: 'n', max: 10 },
  },
  {
    id: 'm.3.multiply-divide-100~jumps',
    title: 'Equal jumps on a number line',
    assumptions: [
      'Every jump is the same size, and the jumps start at 0.',
      'Jumps × size of each jump = where you land.',
      'To divide, count how many jumps it takes to reach the number.',
    ],
    variables: [
      whole('k', 'k', 'Jumps', 0, 10),
      whole('s', 's', 'Size of each jump', 1, 10),
      whole('n', 'n', 'End number', 0, 100),
    ],
    relations: [jumps.relation],
    steps: { 'n = k × s': jumps.steps },
    example: { k: 5, s: 4, n: 20 },
    startWith: ['k', 's'],
    representation: { kind: 'skipCount', step: 's', count: 'k', total: 'n' },
  },

  // ── Properties of multiplication (3.OA.5) ──
  (() => {
    const left = times('p = a × b', ['a', 'b', 'p'], ['rows', 'first part', 'first product']);
    const right = times('q = a × c', ['a', 'c', 'q'], ['rows', 'second part', 'second product']);
    const cols = plus('w = b + c', ['b', 'c', 'w'], ['first part', 'second part', 'columns']);
    const sum = plus('n = p + q', ['p', 'q', 'n'], ['first product', 'second product', 'total']);
    const all = times('n = a × w', ['a', 'w', 'n'], ['rows', 'columns', 'total']);
    return {
      id: 'm.3.multiplication-properties',
      assumptions: [
        'Break one factor into two parts you know: 7 = 5 + 2.',
        'Multiply each part, then add: 6 × 7 = 6 × 5 + 6 × 2.',
        'Parts of 5 or 10 are easiest.',
      ],
      variables: [
        whole('a', 'a', 'Rows', 0, 10),
        whole('w', 'w', 'Columns', 0, 10),
        whole('b', 'b', 'First part', 0, 10),
        whole('c', 'c', 'Second part', 0, 10),
        whole('p', 'p', 'First product', 0, 100),
        whole('q', 'q', 'Second product', 0, 100),
        whole('n', 'n', 'Total', 0, 100),
      ],
      relations: [cols.relation, left.relation, right.relation, sum.relation, all.relation],
      steps: {
        'w = b + c': cols.steps,
        'p = a × b': left.steps,
        'q = a × c': right.steps,
        'n = p + q': sum.steps,
        'n = a × w': all.steps,
      },
      example: { a: 6, w: 7, b: 5, c: 2, p: 30, q: 12, n: 42 },
      startWith: ['c', 'a', 'b'],
      representation: {
        kind: 'array',
        rows: 'a',
        columns: 'w',
        total: 'n',
        max: 10,
        cell: 'dot',
        split: { first: 'b', second: 'c', firstTotal: 'p', secondTotal: 'q' },
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const ab = times('n = a × b', ['a', 'b', 'n'], ['rows', 'number in each row', 'total']);
    const ba = times('n = b × a', ['b', 'a', 'n'], ['columns', 'number in each column', 'total']);
    return {
      id: 'm.3.multiplication-properties~order',
      title: 'Change the order',
      assumptions: [
        'Turning an array changes rows into columns, not the total.',
        'So 4 × 7 = 7 × 4: use the fact you know.',
      ],
      variables: [
        whole('a', 'a', 'Rows', 0, 10),
        whole('b', 'b', 'Columns', 0, 10),
        whole('n', 'n', 'Total', 0, 100),
      ],
      relations: [ab.relation, ba.relation],
      steps: { 'n = a × b': ab.steps, 'n = b × a': ba.steps },
      example: { a: 4, b: 7, n: 28 },
      startWith: ['a', 'b'],
      representation: {
        kind: 'array',
        rows: 'a',
        columns: 'b',
        total: 'n',
        max: 10,
        turned: true,
      },
    } satisfies ModuleDef;
  })(),

  (() => {
    const first = times(
      'p = a × b',
      ['a', 'b', 'p'],
      ['first factor', 'second factor', 'first product'],
    );
    const second = times(
      'q = b × c',
      ['b', 'c', 'q'],
      ['second factor', 'third factor', 'second product'],
    );
    const left = times('n = p × c', ['p', 'c', 'n'], ['first product', 'third factor', 'total']);
    const right = times('n = a × q', ['a', 'q', 'n'], ['first factor', 'second product', 'total']);
    return {
      id: 'm.3.multiplication-properties~grouping',
      title: 'Group the factors',
      pictureLabels: ['a', 'b', 'q'],
      assumptions: [
        'With three factors, multiply any two first. The product is the same.',
        'So 3 × 5 × 2 = 15 × 2 = 3 × 10: pick the pair that makes an easy fact.',
        'The picture draws each group as first × second dots, up to 16.',
      ],
      variables: [
        whole('a', 'a', 'First factor', 0, 10),
        whole('b', 'b', 'Second factor', 0, 10),
        whole('c', 'c', 'Third factor', 0, 10),
        whole('p', 'p', 'First × second', 0, 16),
        whole('q', 'q', 'Second × third', 0, 100),
        whole('n', 'n', 'Product', 0, 100),
      ],
      relations: [first.relation, second.relation, left.relation, right.relation],
      steps: {
        'p = a × b': first.steps,
        'q = b × c': second.steps,
        'n = p × c': left.steps,
        'n = a × q': right.steps,
      },
      example: { a: 3, b: 5, c: 2, p: 15, q: 10, n: 30 },
      startWith: ['a', 'b', 'c'],
      // c groups of (a × b): the first two factors make each group.
      representation: { kind: 'equalGroups', groups: 'c', each: 'p', total: 'n' },
    } satisfies ModuleDef;
  })(),

  // ── Two-step word problems (3.OA.8) ──
  (() => {
    const packs = times('m = g × k', ['g', 'k', 'm'], ['packs', 'number in each pack', 'total']);
    const left = plus('m = n + t', ['n', 't', 'm'], ['number left', 'number taken', 'total']);
    return {
      id: 'm.3.two-step-problems',
      pictureLabels: ['g', 'k'],
      assumptions: [
        'Do one step at a time: first find the total, then what is left.',
        'Check that the answer makes sense: round the numbers and estimate.',
      ],
      variables: [
        whole('g', 'g', 'Packs', 0, 10),
        whole('k', 'k', 'In each pack', 0, 10),
        whole('m', 'm', 'Total', 0, 100),
        whole('t', 't', 'Taken away', 0, 100),
        whole('n', 'n', 'Left', 0, 100),
      ],
      relations: [packs.relation, { ...left.relation, display: '{m} − {t} = {n}' }],
      steps: { 'm = g × k': packs.steps, 'm = n + t': left.steps },
      example: { g: 4, k: 6, m: 24, t: 5, n: 19 },
      startWith: ['t', 'g', 'k'],
      representation: {
        kind: 'tape',
        parts: ['n', 't'],
        total: 'm',
        groups: 'g',
        caption: '{g} × {k} = {m} in the packs. Take away {t}: {n} left.',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const both = plus('t = a + b', ['a', 'b', 't'], ['first amount', 'second amount', 'total']);
    const share = times('t = g × e', ['g', 'e', 't'], ['groups', 'number in each group', 'total']);
    return {
      id: 'm.3.two-step-problems~share',
      title: 'Add, then share equally',
      pictureLabels: ['a', 'b'],
      assumptions: [
        'First add to find the total. Then share the total equally.',
        'Every group gets the same number, with none left over.',
      ],
      variables: [
        whole('a', 'a', 'First amount', 0, 100),
        whole('b', 'b', 'Second amount', 0, 100),
        whole('t', 't', 'Total', 0, 100),
        whole('g', 'g', 'Groups', 1, 10),
        whole('e', 'e', 'In each group', 0, 10),
      ],
      relations: [both.relation, share.relation],
      steps: { 't = a + b': both.steps, 't = g × e': share.steps },
      example: { a: 18, b: 12, t: 30, g: 5, e: 6 },
      startWith: ['g', 'a', 'b'],
      representation: { kind: 'equalGroups', groups: 'g', each: 'e', total: 't' },
    } satisfies ModuleDef;
  })(),

  (() => {
    const boxes = times(
      'm = g × k',
      ['g', 'k', 'm'],
      ['boxes', 'number in each box', 'number in the boxes'],
    );
    const all = plus('t = m + e', ['m', 'e', 't'], ['number in the boxes', 'extra', 'total']);
    return {
      id: 'm.3.two-step-problems~multiply-add',
      title: 'Multiply, then add',
      pictureLabels: ['g', 'k'],
      assumptions: [
        'First multiply to find how many are in the equal groups. Then add the extra.',
        'Check that the answer makes sense: round the numbers and estimate.',
      ],
      variables: [
        whole('g', 'g', 'Boxes', 0, 10),
        whole('k', 'k', 'In each box', 0, 10),
        whole('m', 'm', 'In the boxes', 0, 100),
        whole('e', 'e', 'Extra', 0, 100),
        whole('t', 't', 'Total', 0, 200),
      ],
      relations: [boxes.relation, all.relation],
      steps: { 'm = g × k': boxes.steps, 't = m + e': all.steps },
      example: { g: 3, k: 8, m: 24, e: 5, t: 29 },
      startWith: ['e', 'g', 'k'],
      representation: {
        kind: 'tape',
        parts: ['m', 'e'],
        total: 't',
        groups: 'g',
        groupsPart: 'm',
        caption: '{g} × {k} = {m} in the boxes. Add {e}: {t} in all.',
      },
    } satisfies ModuleDef;
  })(),

  // ── Rounding (3.NBT.1) ──
  {
    id: 'm.3.rounding',
    assumptions: [
      'Find the tens just below and just above the number.',
      'Round to the nearer one. 5 ones or more rounds up.',
      'Rounded numbers are for estimating, like checking an answer.',
    ],
    variables: [
      whole('n', 'n', 'Number', 0, 999),
      { ...whole('L', 'L', 'Ten below', 0, 990), step: 10, multipleOf: 10 },
      { ...whole('U', 'U', 'Ten above', 10, 1000), step: 10, multipleOf: 10 },
      { ...whole('r', 'r', 'Rounded', 0, 1000), step: 10, multipleOf: 10 },
    ],
    ...rounding(10),
    example: { n: 47, L: 40, U: 50, r: 50 },
    startWith: ['n'],
    representation: { kind: 'rounding', value: 'n', lower: 'L', upper: 'U', rounded: 'r', to: 10 },
  },
  {
    id: 'm.3.rounding~hundred',
    title: 'Round to the nearest hundred',
    assumptions: [
      'Find the hundreds just below and just above the number.',
      'Round to the nearer one. 50 or more past the hundred rounds up.',
    ],
    variables: [
      whole('n', 'n', 'Number', 0, 999),
      { ...whole('L', 'L', 'Hundred below', 0, 900), step: 100, multipleOf: 100 },
      { ...whole('U', 'U', 'Hundred above', 100, 1000), step: 100, multipleOf: 100 },
      { ...whole('r', 'r', 'Rounded', 0, 1000), step: 100, multipleOf: 100 },
    ],
    ...rounding(100),
    example: { n: 362, L: 300, U: 400, r: 400 },
    startWith: ['n'],
    representation: { kind: 'rounding', value: 'n', lower: 'L', upper: 'U', rounded: 'r', to: 100 },
  },
  (() => {
    const round10 = (x: number) => Math.floor((x + 5) / 10) * 10;
    const rounded = (id: string, from: string, name: string) => ({
      relation: {
        id: `${id} = ${from} rounded`,
        display: `{${from}} rounds to {${id}}`,
        vars: [id, from],
        residual: (v: Values) => v[id]! - round10(v[from]!),
        // Every number from 45 to 54 rounds to 50: the number can't be found from it.
        solve: { [id]: (v: Values) => round10(v[from]!), [from]: () => undefined },
      },
      steps: {
        [id]: {
          expr: `{${from}} to the nearest ten`,
          how: `Round the ${name} to the nearer ten. 5 ones or more rounds up.`,
          work: (v: Values) => {
            const n = v[from]!;
            const lo = Math.floor(n / 10) * 10;
            return [
              `${n} is between ${lo} and ${lo + 10}.`,
              n - lo < 5
                ? `${n - lo} ones is less than 5: round down to ${lo}.`
                : `${n - lo} ones is 5 or more: round up to ${lo + 10}.`,
            ];
          },
        },
      } as Record<string, StepText>,
    });
    const ra = rounded('x', 'a', 'first number');
    const rb = rounded('y', 'b', 'second number');
    const est = plus('e = x + y', ['x', 'y', 'e'], ['first rounded', 'second rounded', 'estimate']);
    const sum = plus('s = a + b', ['a', 'b', 's'], ['first number', 'second number', 'sum']);
    const off: ModuleDef['relations'][number] = {
      id: 'o = distance from e to s',
      display: 'The estimate {e} is {o} away from the sum {s}',
      vars: ['o', 'e', 's'],
      residual: (v) => v.o! - Math.abs(v.e! - v.s!),
      solve: {
        // Each rounding moves a number at most 4 down or 5 up, so the estimate is at most 8
        // below the sum or 10 above it. Any other distance can't happen: -1 is out of range.
        o: (v) => (v.e! - v.s! >= -8 && v.e! - v.s! <= 10 ? Math.abs(v.e! - v.s!) : -1),
        // The distance alone doesn't say whether the estimate is above or below the sum.
        e: () => undefined,
        s: () => undefined,
      },
    };
    return {
      id: 'm.3.rounding~estimate',
      title: 'Estimate a sum',
      pictureLabels: ['x', 'y', 'e', 'o'],
      assumptions: [
        'Round each number to the nearest ten, then add the rounded numbers.',
        'The estimate is close to the real sum. Use it to check the answer makes sense.',
      ],
      variables: [
        whole('a', 'a', 'First number', 0, 500),
        whole('b', 'b', 'Second number', 0, 500),
        { ...whole('x', 'x', 'First rounded', 0, 500), step: 10, multipleOf: 10 },
        { ...whole('y', 'y', 'Second rounded', 0, 500), step: 10, multipleOf: 10 },
        { ...whole('e', 'e', 'Estimate', 0, 1000), step: 10, multipleOf: 10 },
        whole('s', 's', 'Sum', 0, 1000),
        whole('o', 'o', 'Estimate is off by', 0, 10),
      ],
      relations: [ra.relation, rb.relation, est.relation, sum.relation, off],
      steps: {
        'x = a rounded': ra.steps,
        'y = b rounded': rb.steps,
        'e = x + y': est.steps,
        's = a + b': sum.steps,
        'o = distance from e to s': {
          o: {
            expr: (v) => (v.e! >= v.s! ? '{e} − {s}' : '{s} − {e}'),
            how: 'Take the smaller from the bigger. A small distance means the estimate is close.',
          },
        },
      },
      example: { a: 238, b: 154, x: 240, y: 150, e: 390, s: 392, o: 2 },
      startWith: ['a', 'b'],
      representation: {
        kind: 'tape',
        parts: ['a', 'b'],
        total: 's',
        caption: 'Estimate: {x} + {y} = {e}. Exact: {a} + {b} = {s}.',
      },
    } satisfies ModuleDef;
  })(),
];
