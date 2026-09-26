/**
 * Grade 3 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import type { Values } from '@/engine/types';
import { div, sumAll, whole } from '../helpers';
import type { ModuleDef, StepText } from '../types';
import {
  addAll,
  addStrategy,
  countList,
  divideWork,
  missingPart,
  subtractStrategy,
  sumSteps,
  timesWork,
} from '../work';

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
const clock = (h: number, m: number) => `${h}:${String(m).padStart(2, '0')}`;
/**
 * Counting on from a start time, the way Grade 3 uses a number line: to the next hour, then
 * whole hours, then the minutes left ("3:45 → 4:00 is 15 minutes").
 */
function timeHops(h: number, m: number, d: number): string[] {
  const lines: string[] = [];
  const parts: number[] = [];
  let [hh, mm, left] = [h, m, d];
  const next = (hour: number) => (hour % 12) + 1;
  if (mm > 0 && left >= 60 - mm) {
    const step = 60 - mm;
    lines.push(`${clock(hh, mm)} → ${clock(next(hh), 0)} is ${step} minutes`);
    parts.push(step);
    [hh, mm, left] = [next(hh), 0, left - step];
  }
  while (left >= 60) {
    lines.push(`${clock(hh, mm)} → ${clock(next(hh), mm)} is 60 minutes`);
    parts.push(60);
    [hh, left] = [next(hh), left - 60];
  }
  if (left > 0) {
    lines.push(`${clock(hh, mm)} → ${clock(hh, mm + left)} is ${left} minutes`);
    parts.push(left);
  }
  if (parts.length > 1) lines.push(`${parts.join(' + ')} = ${d} minutes`);
  return lines;
}
/** Counting back from an end time: to the hour, then whole hours, then the minutes left. */
function timeHopsBack(h: number, m: number, d: number): string[] {
  const lines: string[] = [];
  const parts: number[] = [];
  const prev = (hour: number) => (hour === 1 ? 12 : hour - 1);
  let [hh, mm, left] = [h, m, d];
  if (mm > 0 && left >= mm) {
    lines.push(`${clock(hh, mm)} → ${clock(hh, 0)} is ${mm} minutes`);
    parts.push(mm);
    [mm, left] = [0, left - mm];
  }
  while (left >= 60) {
    lines.push(`${clock(hh, mm)} → ${clock(prev(hh), mm)} is 60 minutes`);
    parts.push(60);
    [hh, left] = [prev(hh), left - 60];
  }
  if (left > 0) {
    const [th, tm] = mm >= left ? [hh, mm - left] : [prev(hh), mm + 60 - left];
    lines.push(`${clock(hh, mm)} → ${clock(th, tm)} is ${left} minutes`);
    parts.push(left);
  }
  if (parts.length > 1) lines.push(`${parts.join(' + ')} = ${d} minutes`);
  return lines;
}
/** Minutes after 12:00 on a 12-hour clock (12:30 is 30), and back to an hour (0 → 12). */
const at = (h: number, m: number) => 60 * (h % 12) + m;
const mod720 = (x: number) => ((x % 720) + 720) % 720;
const toHour = (t: number) => {
  const h = t / 60;
  return Number.isInteger(h) ? h || 12 : undefined;
};

export const MATH_3_MODULES: ModuleDef[] = [
  {
    id: 'm.3.area',
    assumptions: [
      'The shape is a rectangle: four right angles, and opposite sides are equal.',
      'Length and width use the same unit, so area is in square units.',
      'Area counts the unit squares that cover the inside with no gaps or overlaps.',
    ],
    variables: [
      { id: 'l', symbol: 'l', name: 'Length', unit: 'cm', min: 0, max: 10, step: 1, integer: true },
      { id: 'w', symbol: 'w', name: 'Width', unit: 'cm', min: 0, max: 10, step: 1, integer: true },
      { id: 'A', symbol: 'A', name: 'Area', unit: 'cm²', min: 0, max: 100, integer: true },
    ],
    relations: [
      {
        id: 'A = l × w',
        display: '{l} × {w} = {A}',
        vars: ['A', 'l', 'w'],
        residual: (v) => v.A! - v.l! * v.w!,
        solve: { A: (v) => v.l! * v.w!, l: (v) => div(v.A!, v.w!), w: (v) => div(v.A!, v.l!) },
      },
    ],
    steps: {
      'A = l × w': {
        A: {
          expr: '{l} × {w}',
          how: 'The width is the number of rows; the length is the squares in each row. Multiply.',
          work: (v) => timesWork(v.w!, v.l!),
        },
        l: {
          expr: '{A} ÷ {w}',
          how: 'Share the squares equally among the rows: that is the squares in each row.',
          work: (v) => divideWork(v.A!, v.w!),
        },
        w: {
          expr: '{A} ÷ {l}',
          how: 'Each row has as many squares as the length. Divide to find how many rows.',
          work: (v) => divideWork(v.A!, v.l!, 'second'),
        },
      },
    },
    example: { l: 4, w: 3, A: 12 },
    startWith: ['l', 'w'],
    representation: { kind: 'rectangle', length: 'l', width: 'w', inside: 'A', extent: 10 },
  },
  // ── Area (3.MD.5–7): problem types ──
  (() => {
    const tiles = times('A = r × c', ['r', 'c', 'A'], ['rows', 'squares in each row', 'area']);
    return {
      id: 'm.3.area~tiling',
      title: 'Count unit squares',
      use: 'Use this to find area by counting unit squares in rows.',
      assumptions: [
        'Each square is 1 square unit. They cover the shape with no gaps or overlaps.',
        'Rows × squares in each row = area.',
      ],
      variables: [
        whole('r', 'r', 'Rows', 0, 10),
        whole('c', 'c', 'Squares in each row', 0, 10),
        { ...whole('A', 'A', 'Area', 0, 100), unit: 'square units' },
      ],
      relations: [tiles.relation],
      steps: { 'A = r × c': tiles.steps },
      example: { r: 4, c: 5, A: 20 },
      startWith: ['r', 'c'],
      representation: {
        kind: 'array',
        rows: 'r',
        columns: 'c',
        total: 'A',
        max: 10,
        cell: 'square',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const left = times('p = a × b', ['a', 'b', 'p'], ['width', 'first length', 'first area']);
    const right = times('q = a × c', ['a', 'c', 'q'], ['width', 'second length', 'second area']);
    const len = plus('l = b + c', ['b', 'c', 'l'], ['first length', 'second length', 'length']);
    const sum = plus('A = p + q', ['p', 'q', 'A'], ['first area', 'second area', 'area']);
    const all = times('A = a × l', ['a', 'l', 'A'], ['width', 'length', 'area']);
    return {
      id: 'm.3.area~split',
      title: 'Split a rectangle into two',
      use: 'Use this to split a rectangle into two and add the areas: 6 × 8 = 6 × 5 + 6 × 3.',
      assumptions: [
        'Cut the rectangle into two rectangles. The area is the two areas added.',
        'So 6 × 8 = 6 × 5 + 6 × 3: use facts you know.',
      ],
      variables: [
        whole('a', 'a', 'Width', 0, 10),
        whole('l', 'l', 'Length', 0, 10),
        whole('b', 'b', 'First length', 0, 10),
        whole('c', 'c', 'Second length', 0, 10),
        { ...whole('p', 'p', 'First area', 0, 100), derived: true },
        { ...whole('q', 'q', 'Second area', 0, 100), derived: true },
        whole('A', 'A', 'Area', 0, 100),
      ],
      relations: [len.relation, left.relation, right.relation, sum.relation, all.relation],
      steps: {
        'l = b + c': len.steps,
        'p = a × b': left.steps,
        'q = a × c': right.steps,
        'A = p + q': sum.steps,
        'A = a × l': all.steps,
      },
      example: { a: 6, l: 8, b: 5, c: 3, p: 30, q: 18, A: 48 },
      startWith: ['c', 'a', 'b'],
      representation: {
        kind: 'array',
        rows: 'a',
        columns: 'l',
        total: 'A',
        max: 10,
        cell: 'square',
        split: { first: 'b', second: 'c', firstTotal: 'p', secondTotal: 'q' },
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const leftArea = times(
      'p = a × b',
      ['a', 'b', 'p'],
      ['width', 'height', 'area'],
      '{a} × {b} = {p}',
    );
    const rightArea = times(
      'q = c × d',
      ['c', 'd', 'q'],
      ['width', 'height', 'area'],
      '{c} × {d} = {q}',
    );
    const sum = plus('A = p + q', ['p', 'q', 'A'], ['left area', 'right area', 'total area']);
    return {
      id: 'm.3.area~rectilinear',
      title: 'Shapes made of rectangles',
      use: 'Use this to find the area of an L-shape made of two rectangles.',
      assumptions: [
        'Cut the shape into two rectangles that don’t overlap.',
        'Find each rectangle’s area, then add them.',
        'Each square is 1 square unit.',
      ],
      variables: [
        whole('a', 'a', 'Left width', 0, 10),
        whole('b', 'b', 'Left height', 0, 10),
        whole('c', 'c', 'Right width', 0, 10),
        whole('d', 'd', 'Right height', 0, 10),
        { ...whole('p', 'p', 'Left area', 0, 100), unit: 'square units' },
        { ...whole('q', 'q', 'Right area', 0, 100), unit: 'square units' },
        { ...whole('A', 'A', 'Total area', 0, 200), unit: 'square units' },
      ],
      relations: [leftArea.relation, rightArea.relation, sum.relation],
      steps: { 'p = a × b': leftArea.steps, 'q = c × d': rightArea.steps, 'A = p + q': sum.steps },
      example: { a: 3, b: 5, c: 4, d: 2, p: 15, q: 8, A: 23 },
      startWith: ['a', 'b', 'c', 'd'],
      representation: {
        kind: 'rectilinear',
        left: { width: 'a', height: 'b', area: 'p' },
        right: { width: 'c', height: 'd', area: 'q' },
        total: 'A',
        extent: 7,
      },
    } satisfies ModuleDef;
  })(),
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
    use: 'Use this for rows and columns: “6 rows of 4 chairs. How many chairs?”',
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
    use: 'Use this for equal jumps on a number line: “How many jumps of 5 to get to 30?”',
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
        { ...whole('p', 'p', 'First product', 0, 100), derived: true },
        { ...whole('q', 'q', 'Second product', 0, 100), derived: true },
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
      use: 'Use this for 4 × 7 = 7 × 4: turn the array to use a fact you know.',
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
      use: 'Use this to multiply three numbers, like 3 × 5 × 2, by picking an easy pair first.',
      pictureLabels: ['a', 'b', 'q'],
      assumptions: [
        'With three factors, multiply any two first. The product is the same.',
        'So 3 × 5 × 2 = 15 × 2 = 3 × 10: pick the pair that makes an easy fact.',
        'The picture draws each group as first × second dots.',
      ],
      variables: [
        whole('a', 'a', 'First factor', 0, 10),
        whole('b', 'b', 'Second factor', 0, 10),
        whole('c', 'c', 'Third factor', 0, 10),
        whole('p', 'p', 'First × second', 0, 100),
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
  // ── Patterns in the addition and multiplication tables (3.OA.9) ──
  (() => {
    const cell = times('v = k × n', ['k', 'n', 'v'], ['row', 'column', 'number in the table']);
    const next = plus('w = v + k', ['v', 'k', 'w'], ['number in the table', 'row', 'next number']);
    return {
      id: 'm.3.arithmetic-patterns',
      pictureLabels: ['w', 'e'],
      assumptions: [
        'Each row of the times table counts by its row number: the 4s row is 4, 8, 12, 16, …',
        'One step along the row adds the row number again.',
        'An even row (2, 4, 6, 8, 10) has only even numbers. An odd row switches odd, even, odd, …',
      ],
      variables: [
        whole('k', 'k', 'Row', 1, 10),
        whole('n', 'n', 'Column', 1, 10),
        whole('v', 'v', 'Number in the table', 1, 100),
        whole('w', 'w', 'Next number in the row', 2, 110),
        whole('e', 'e', 'Left over after pairs', 0, 1),
      ],
      relations: [
        cell.relation,
        { ...next.relation, display: '{v} + {k} = {w}' },
        {
          id: 'e = v even or odd',
          display: '{v} in pairs leaves {e} over',
          vars: ['e', 'v'],
          residual: (v) => v.e! - (v.v! % 2),
          // Every even number leaves 0: the number can't be found from it.
          solve: { e: (v) => v.v! % 2, v: () => undefined },
        },
      ],
      steps: {
        'v = k × n': cell.steps,
        'w = v + k': {
          ...next.steps,
          w: {
            expr: '{v} + {k}',
            how: 'The next number in the row is the row number more.',
            work: (v) => addStrategy(v.v!, v.k!),
          },
        },
        'e = v even or odd': {
          e: {
            expr: '{v} shared into pairs',
            how: 'Even numbers make pairs with none left over; odd numbers leave 1.',
            work: (v) => [
              `${v.v} ends in ${v.v! % 10}: ${v.v! % 2 === 0 ? 'even' : 'odd'}`,
              ...(v.k! % 2 === 0 ? [`${v.k} is even, so every number in its row is even.`] : []),
            ],
          },
        },
      },
      example: { k: 4, n: 6, v: 24, w: 28, e: 0 },
      startWith: ['k', 'n'],
      representation: { kind: 'skipCount', step: 'k', count: 'n', total: 'v' },
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
      use: 'Use this for “18 red and 12 blue beads, shared equally on 5 strings. How many on each?”',
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
      use: 'Use this for “3 boxes of 8 crayons and 5 more. How many in all?”',
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
    use: 'Use this to round a 3-digit number to the nearest hundred.',
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
      use: 'Use this to estimate a sum by rounding, and check an answer.',
      pictureLabels: ['x', 'y', 'e', 'o'],
      assumptions: [
        'Round each number to the nearest ten, then add the rounded numbers.',
        'The estimate is close to the real sum. Use it to check the answer makes sense.',
      ],
      variables: [
        whole('a', 'a', 'First number', 0, 500),
        whole('b', 'b', 'Second number', 0, 500),
        { ...whole('x', 'x', 'First rounded', 0, 500), step: 10, multipleOf: 10, derived: true },
        { ...whole('y', 'y', 'Second rounded', 0, 500), step: 10, multipleOf: 10, derived: true },
        { ...whole('e', 'e', 'Estimate', 0, 1000), step: 10, multipleOf: 10, derived: true },
        { ...whole('s', 's', 'Sum', 0, 1000), derived: true },
        { ...whole('o', 'o', 'How far off the estimate is', 0, 10), derived: true },
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
  // ── Multiply by multiples of 10 (3.NBT.3) ──
  (() => {
    const tensTimes = times('p = a × t', ['a', 't', 'p'], ['number', 'tens', 'tens in the answer']);
    return {
      id: 'm.3.multiply-by-tens',
      pictureLabels: ['t', 'p'],
      assumptions: [
        'A multiple of 10 is a number of tens: 80 is 8 tens.',
        'Multiply by the tens, then write the tens as a number: 9 × 8 tens = 72 tens = 720.',
      ],
      variables: [
        whole('a', 'a', 'One-digit number', 0, 9),
        { ...whole('m', 'm', 'Multiple of 10', 10, 90), step: 10, multipleOf: 10 },
        whole('t', 't', 'Tens in it', 1, 9),
        whole('p', 'p', 'Tens in the answer', 0, 81),
        { ...whole('n', 'n', 'Product', 0, 810), step: 10, multipleOf: 10 },
      ],
      relations: [
        {
          id: 'm = t tens',
          display: '{m} is {t} tens',
          vars: ['m', 't'],
          residual: (v) => v.m! - 10 * v.t!,
          solve: { m: (v) => 10 * v.t!, t: (v) => div(v.m!, 10) },
        },
        tensTimes.relation,
        {
          id: 'n = p tens',
          display: '{p} tens = {n}',
          vars: ['n', 'p'],
          residual: (v) => v.n! - 10 * v.p!,
          solve: { n: (v) => 10 * v.p!, p: (v) => div(v.n!, 10) },
        },
      ],
      steps: {
        'm = t tens': {
          t: {
            expr: '{m} ÷ 10',
            how: 'Count the tens in the multiple of 10.',
            work: (v) => [`Count by 10s: ${countList(0, 10, v.t!)} → ${v.t} tens`],
          },
          m: { expr: '{t} × 10', how: 'Write the tens as a number: put a 0 after it.' },
        },
        'p = a × t': tensTimes.steps,
        'n = p tens': {
          n: {
            expr: '{p} × 10',
            how: 'Write the tens as a number: put a 0 after the number of tens.',
            work: (v) => [`${v.p} tens = ${v.n}`],
          },
          p: { expr: '{n} ÷ 10', how: 'Take the 0 off: that is the number of tens.' },
        },
      },
      example: { a: 4, m: 60, t: 6, p: 24, n: 240 },
      startWith: ['a', 'm'],
      representation: { kind: 'skipCount', step: 'm', count: 'a', total: 'n' },
    } satisfies ModuleDef;
  })(),
  // ── Fractions on a number line (3.NF.1, 3.NF.2, 3.NF.3c) ──
  {
    id: 'm.3.fractions-number-line',
    pictureLabels: ['w', 'r'],
    assumptions: [
      'Split each whole into equal parts. The bottom number says how many parts.',
      'The top number says how many parts to count from 0.',
      'When the parts make a whole, the fraction is a whole number: 4/4 = 1.',
    ],
    variables: [
      whole('a', 'a', 'Parts counted', 0, 24),
      whole('b', 'b', 'Parts in one whole', 1, 8),
      { ...whole('w', 'w', 'Wholes', 0, 24), derived: true },
      { ...whole('r', 'r', 'Parts past the last whole', 0, 7), derived: true },
    ],
    relations: [
      {
        id: 'w = wholes in a/b',
        display: '{a}/{b} passes {w} whole numbers',
        vars: ['w', 'a', 'b'],
        residual: (v) => v.w! - Math.floor(v.a! / v.b!),
        // Many fractions pass the same number of wholes: the parts can't be found from it.
        solve: {
          w: (v) => (v.b! > 0 ? Math.floor(v.a! / v.b!) : undefined),
          a: () => undefined,
          b: () => undefined,
        },
      },
      {
        id: 'a = w wholes and r parts',
        display: '{a}/{b} = {w} wholes and {r}/{b}',
        vars: ['a', 'w', 'b', 'r'],
        residual: (v) => v.a! - v.w! * v.b! - v.r! + (v.r! >= v.b! ? 1 : 0),
        solve: {
          a: (v) => (v.r! < v.b! ? v.w! * v.b! + v.r! : undefined),
          r: (v) => {
            const r = v.a! - v.w! * v.b!;
            return r >= 0 && r < v.b! ? r : undefined;
          },
          w: (v) => (v.r! < v.b! ? div(v.a! - v.r!, v.b!) : undefined),
          b: () => undefined,
        },
      },
    ],
    steps: {
      'w = wholes in a/b': {
        w: {
          expr: 'wholes in {a} parts of {b}',
          how: 'Count the jumps from 0. Every full set of equal parts makes 1 whole.',
          work: (v) => [
            ...(v.a! > 0 && v.a! <= 12
              ? [
                  `Count ${v.a} jumps of 1/${v.b} from 0: ${Array.from({ length: v.a! }, (_, i) => `${i + 1}/${v.b}`).join(', ')}`,
                ]
              : []),
            ...(v.w! > 0
              ? [`Count by ${v.b}s: ${countList(0, v.b!, v.w!)} → ${v.w} wholes`]
              : [`${v.a} is less than ${v.b}, so there is no whole yet.`]),
          ],
        },
      },
      'a = w wholes and r parts': {
        a: {
          expr: '{w} × {b} + {r}',
          how: 'Each whole has the same number of parts. Add the parts left over.',
          work: (v) => [`${v.w} × ${v.b} = ${v.w! * v.b!}`, `${v.w! * v.b!} + ${v.r} = ${v.a}`],
        },
        r: {
          expr: '{a} − {w} × {b}',
          how: 'Take away the parts that make wholes. The rest are left over.',
          work: (v) => [`${v.w} × ${v.b} = ${v.w! * v.b!}`, `${v.a} − ${v.w! * v.b!} = ${v.r}`],
        },
        w: {
          expr: '({a} − {r}) ÷ {b}',
          how: 'Take away the parts left over. Share the rest into wholes.',
          work: (v) => [`${v.a} − ${v.r} = ${v.a! - v.r!}`, ...divideWork(v.a! - v.r!, v.b!)],
        },
      },
    },
    example: { a: 3, b: 4, w: 0, r: 3 },
    startWith: ['a', 'b'],
    representation: { kind: 'fractionLine', numerator: 'a', denominator: 'b', wholes: 3 },
  },
  (() => {
    const parts = plus(
      'b = a + u',
      ['a', 'u', 'b'],
      ['shaded parts', 'parts not shaded', 'equal parts'],
      '{a} shaded + {u} not shaded = {b} equal parts',
    );
    return {
      id: 'm.3.fractions-number-line~shapes',
      title: 'Fractions of a shape',
      use: 'Use this to name the shaded part of a shape, like 3/4.',
      pictureLabels: ['u'],
      assumptions: [
        'The parts must be equal, or it is not a fraction.',
        'The bottom number is how many equal parts; the top is how many are shaded.',
        '1/4 is one of 4 equal parts. 3/4 is three of them.',
      ],
      variables: [
        whole('b', 'b', 'Equal parts', 1, 8),
        whole('a', 'a', 'Shaded', 0, 8),
        whole('u', 'u', 'Not shaded', 0, 8),
      ],
      relations: [parts.relation],
      steps: { 'b = a + u': parts.steps },
      example: { b: 4, a: 3, u: 1 },
      startWith: ['b', 'a'],
      representation: {
        kind: 'partition',
        parts: 'b',
        shaded: 'a',
        shape: 'rectangle',
        fraction: true,
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const fill = times(
      'a = w × b',
      ['w', 'b', 'a'],
      ['whole number', 'parts in one whole', 'parts counted'],
      '{a}/{b} = {w}',
    );
    return {
      id: 'm.3.fractions-number-line~wholes',
      title: 'Whole numbers as fractions',
      use: 'Use this to write a whole number as a fraction, like 2 = 8/4.',
      assumptions: [
        'A fraction is a whole number when the parts counted fill whole numbers exactly.',
        'Every whole has the same number of parts: 4/4 = 1, 8/4 = 2, 12/4 = 3.',
      ],
      variables: [
        whole('a', 'a', 'Parts counted', 0, 32),
        whole('b', 'b', 'Parts in one whole', 1, 8),
        whole('w', 'w', 'Whole number', 0, 4),
      ],
      relations: [fill.relation],
      steps: { 'a = w × b': fill.steps },
      example: { a: 8, b: 4, w: 2 },
      startWith: ['a', 'b'],
      representation: { kind: 'fractionLine', numerator: 'a', denominator: 'b', wholes: 3 },
    } satisfies ModuleDef;
  })(),
  // ── Equivalent and comparing fractions (3.NF.3) ──
  (() => {
    const top = times(
      'c = a × k',
      ['a', 'k', 'c'],
      ['shaded parts', 'pieces per part', 'new shaded parts'],
    );
    const bottom = times(
      'd = b × k',
      ['b', 'k', 'd'],
      ['parts in the whole', 'pieces per part', 'new parts in the whole'],
    );
    // Shaded parts can't be more than the parts in the whole (these are fractions up to 1).
    const notShaded = plus(
      'b = a + u',
      ['a', 'u', 'b'],
      ['shaded parts', 'parts not shaded', 'parts in the whole'],
      '{a} shaded + {u} not shaded = {b} parts',
    );
    return {
      id: 'm.3.compare-fractions',
      assumptions: [
        'Equivalent fractions are the same size: they cover the same part of the whole.',
        'Cut every part into the same number of pieces: 1/2 = 2/4.',
        'Both bars are the same whole.',
      ],
      variables: [
        whole('a', 'a', 'Shaded parts', 0, 8),
        whole('b', 'b', 'Parts in the whole', 1, 8),
        whole('k', 'k', 'Pieces per part', 1, 4),
        whole('c', 'c', 'New shaded parts', 0, 16),
        whole('d', 'd', 'New parts in the whole', 1, 16),
        { ...whole('u', 'u', 'Not shaded', 0, 8), derived: true },
      ],
      relations: [top.relation, bottom.relation, notShaded.relation],
      steps: { 'c = a × k': top.steps, 'd = b × k': bottom.steps, 'b = a + u': notShaded.steps },
      example: { a: 1, b: 2, k: 2, c: 2, d: 4, u: 1 },
      pictureLabels: ['u'],
      startWith: ['k', 'a', 'b'],
      representation: {
        kind: 'fractionBars',
        rows: [
          { num: 'a', den: 'b' },
          { num: 'c', den: 'd' },
        ],
        controls: ['a', 'b', 'k'],
        equal: true,
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const firstLeft = plus(
      'b = a + u',
      ['a', 'u', 'b'],
      ['first shaded', 'first not shaded', 'parts in each whole'],
      '{a} shaded + {u} not shaded = {b} parts',
    );
    const secondLeft = plus(
      'b = c + x',
      ['c', 'x', 'b'],
      ['second shaded', 'second not shaded', 'parts in each whole'],
      '{c} shaded + {x} not shaded = {b} parts',
    );
    return {
      id: 'm.3.compare-fractions~same-denominator',
      pictureLabels: ['g', 'u', 'x'],
      title: 'Compare: same denominator',
      use: 'Use this for “Which is more, 3/8 or 5/8?”',
      assumptions: [
        'Same denominator: both wholes are cut into the same equal parts.',
        'Then more shaded parts means the bigger fraction: 5/8 > 3/8.',
        'Both fractions are parts of the same whole.',
      ],
      variables: [
        whole('b', 'b', 'Parts in each whole', 1, 8),
        whole('a', 'a', 'First shaded', 0, 8),
        whole('c', 'c', 'Second shaded', 0, 8),
        whole('g', 'g', 'Difference in shaded parts', 0, 8),
        { ...whole('u', 'u', 'First not shaded', 0, 8), derived: true },
        { ...whole('x', 'x', 'Second not shaded', 0, 8), derived: true },
      ],
      relations: [
        firstLeft.relation,
        secondLeft.relation,
        {
          id: 'g = parts between a and c',
          display: '{a} and {c} shaded parts are {g} apart',
          // With the parts known: "3/8 < 5/8, 2 parts apart"; without: "3 parts < 5 parts".
          check: (v) => {
            const sign = v.a! > v.c! ? '>' : v.a! < v.c! ? '<' : '=';
            const apart = `${v.g} ${v.g === 1 ? 'part' : 'parts'} apart`;
            return v.b === undefined
              ? `${v.a} shaded ${sign} ${v.c} shaded, ${apart}`
              : `${v.a}/${v.b} ${sign} ${v.c}/${v.b}, ${apart}`;
          },
          vars: ['g', 'a', 'c'],
          residual: (v) => v.g! - Math.abs(v.a! - v.c!),
          solve: {
            g: (v) => Math.abs(v.a! - v.c!),
            a: (v) => [v.c! + v.g!, v.c! - v.g!],
            c: (v) => [v.a! - v.g!, v.a! + v.g!],
          },
        },
      ],
      steps: {
        'b = a + u': firstLeft.steps,
        'b = c + x': secondLeft.steps,
        'g = parts between a and c': {
          g: {
            expr: (v) => (v.a! >= v.c! ? '{a} − {c}' : '{c} − {a}'),
            how: 'The parts are the same size, so compare the shaded parts. Take the smaller from the bigger.',
            note: (v) =>
              v.b === undefined
                ? ''
                : `(${v.a}/${v.b} ${v.a! > v.c! ? '>' : v.a! < v.c! ? '<' : '='} ${v.c}/${v.b})`,
          },
          a: {
            expr: (v) => (v.a! >= v.c! ? '{c} + {g}' : '{c} − {g}'),
            how: 'Start from the second fraction’s shaded parts and move by the difference.',
            note: (v) => (v.g! > 0 && v.c! - v.g! >= 0 && v.a! > v.c! ? `(or ${v.c! - v.g!})` : ''),
          },
          c: {
            expr: (v) => (v.a! >= v.c! ? '{a} − {g}' : '{a} + {g}'),
            how: 'Start from the first fraction’s shaded parts and move by the difference.',
            note: (v) => (v.g! > 0 && v.a! + v.g! <= 8 && v.c! < v.a! ? `(or ${v.a! + v.g!})` : ''),
          },
        },
      },
      example: { b: 8, a: 3, c: 5, g: 2, u: 5, x: 3 },
      startWith: ['b', 'a', 'c'],
      representation: {
        kind: 'fractionBars',
        rows: [
          { num: 'a', den: 'b' },
          { num: 'c', den: 'b' },
        ],
        controls: ['b', 'a', 'c'],
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const firstLeft = plus(
      'b = a + u',
      ['a', 'u', 'b'],
      ['shaded parts', 'first not shaded', 'first parts in the whole'],
      '{a} shaded + {u} not shaded = {b} parts',
    );
    const secondLeft = plus(
      'd = a + x',
      ['a', 'x', 'd'],
      ['shaded parts', 'second not shaded', 'second parts in the whole'],
      '{a} shaded + {x} not shaded = {d} parts',
    );
    // Nothing shaded: both fractions are 0, so they are equal whatever the parts.
    const sign = (v: Values) => (v.a === 0 || v.b === v.d ? '=' : v.b! < v.d! ? '>' : '<');
    return {
      id: 'm.3.compare-fractions~same-numerator',
      pictureLabels: ['g', 'u', 'x'],
      title: 'Compare: same numerator',
      use: 'Use this for “Which is more, 2/3 or 2/6?”',
      assumptions: [
        'Same numerator: both fractions shade the same number of parts.',
        'Fewer parts in the whole means bigger parts, so that fraction is bigger: 2/3 > 2/6.',
        'Both fractions are parts of the same whole.',
      ],
      variables: [
        whole('a', 'a', 'Shaded parts', 0, 8),
        whole('b', 'b', 'First parts in the whole', 1, 8),
        whole('d', 'd', 'Second parts in the whole', 1, 8),
        { ...whole('g', 'g', 'Difference in parts', 0, 7), derived: true },
        { ...whole('u', 'u', 'First not shaded', 0, 8), derived: true },
        { ...whole('x', 'x', 'Second not shaded', 0, 8), derived: true },
      ],
      relations: [
        firstLeft.relation,
        secondLeft.relation,
        {
          id: 'g = parts between b and d',
          display: '{b} parts and {d} parts are {g} apart',
          // With the shaded parts known: "2/3 > 2/6, 3 parts apart".
          check: (v) => {
            const apart = `${v.g} ${v.g === 1 ? 'part' : 'parts'} apart`;
            return v.a === undefined
              ? `${v.b} parts and ${v.d} parts, ${apart}`
              : `${v.a}/${v.b} ${sign(v)} ${v.a}/${v.d}, ${apart}`;
          },
          vars: ['g', 'b', 'd'],
          residual: (v) => v.g! - Math.abs(v.b! - v.d!),
          solve: {
            g: (v) => Math.abs(v.b! - v.d!),
            b: (v) => [v.d! + v.g!, v.d! - v.g!],
            d: (v) => [v.b! - v.g!, v.b! + v.g!],
          },
        },
      ],
      steps: {
        'b = a + u': firstLeft.steps,
        'd = a + x': secondLeft.steps,
        'g = parts between b and d': {
          g: {
            expr: (v) => (v.b! >= v.d! ? '{b} − {d}' : '{d} − {b}'),
            how: 'The shaded parts are the same. The whole cut into fewer parts has bigger parts, so it is the bigger fraction.',
            note: (v) => (v.a === undefined ? '' : `(${v.a}/${v.b} ${sign(v)} ${v.a}/${v.d})`),
          },
          b: {
            expr: (v) => (v.b! >= v.d! ? '{d} + {g}' : '{d} − {g}'),
            how: 'Start from the second whole’s parts and move by the difference.',
          },
          d: {
            expr: (v) => (v.b! >= v.d! ? '{b} − {g}' : '{b} + {g}'),
            how: 'Start from the first whole’s parts and move by the difference.',
          },
        },
      },
      example: { a: 2, b: 3, d: 6, g: 3, u: 1, x: 4 },
      startWith: ['a', 'b', 'd'],
      representation: {
        kind: 'fractionBars',
        rows: [
          { num: 'a', den: 'b' },
          { num: 'a', den: 'd' },
        ],
        controls: ['a', 'b', 'd'],
      },
    } satisfies ModuleDef;
  })(),
  // ── Time to the minute and elapsed time (3.MD.1) ──
  {
    id: 'm.3.elapsed-time',
    pictureLabels: ['k', 'e'],
    standalone: {
      vars: ['h'],
      why: 'The short hand shows the hour on its own; the formulas are about the minutes.',
    },
    assumptions: [
      'Count by 5s to the last number the long hand passed, then count on by 1s.',
      'The hour is the number the short hand has just passed.',
      'There are 60 minutes in an hour.',
    ],
    variables: [
      whole('h', 'h', 'Hour', 1, 12),
      { ...whole('m', 'm', 'Minutes past', 0, 59), digits: 2 },
      whole('k', 'k', 'Long hand at or past', 0, 11),
      whole('e', 'e', 'Extra minutes', 0, 4),
    ],
    relations: [
      {
        id: 'k = fives in m',
        display: 'At {m} minutes the long hand is at or past the {k}',
        vars: ['k', 'm'],
        residual: (v) => v.k! - Math.floor(v.m! / 5),
        solve: { k: (v) => Math.floor(v.m! / 5), m: () => undefined },
      },
      {
        id: 'm = 5 × k + e',
        display: '5 × {k} + {e} = {m}',
        vars: ['m', 'k', 'e'],
        residual: (v) => v.m! - 5 * v.k! - v.e! + (v.e! > 4 ? 1 : 0),
        solve: {
          m: (v) => 5 * v.k! + v.e!,
          e: (v) => {
            const e = v.m! - 5 * v.k!;
            return e >= 0 && e <= 4 ? e : undefined;
          },
          k: (v) => div(v.m! - v.e!, 5),
        },
      },
    ],
    steps: {
      'k = fives in m': {
        k: {
          expr: 'last 5 before {m}',
          how: 'Count by 5s as far as you can without going past the minutes.',
          work: (v) =>
            v.k! > 0
              ? [`Count by 5s: ${countList(0, 5, v.k!)} → the long hand is at or past the ${v.k}`]
              : [],
        },
      },
      'm = 5 × k + e': {
        m: {
          expr: '5 × {k} + {e}',
          how: 'Count by 5s to the number the long hand passed. Then count on the extra minutes.',
          work: (v) => [
            ...(v.k! > 0 ? [`Count by 5s: ${countList(0, 5, v.k!)} → ${5 * v.k!}`] : []),
            ...(v.e! > 0 ? [`Count on ${v.e}: ${countList(5 * v.k!, 1, v.e!)} → ${v.m}`] : []),
            ...(v.h === undefined ? [] : [`Time: ${clock(v.h, v.m!)}`]),
          ],
        },
        e: {
          expr: '{m} − 5 × {k}',
          how: 'The extra minutes are the minutes past the last 5.',
          work: (v) => [`5 × ${v.k} = ${5 * v.k!}`, `${v.m} − ${5 * v.k!} = ${v.e}`],
        },
        k: {
          expr: '({m} − {e}) ÷ 5',
          how: 'Take away the extra minutes. Count the 5s that are left.',
          work: (v) => [`${v.m} − ${v.e} = ${v.m! - v.e!}`, ...divideWork(v.m! - v.e!, 5)],
        },
      },
    },
    example: { h: 4, m: 37, k: 7, e: 2 },
    startWith: ['h', 'm'],
    representation: { kind: 'clock', hour: 'h', minute: 'm', minuteStep: 1, ampm: true },
  },
  {
    id: 'm.3.elapsed-time~elapsed',
    title: 'How long? When does it end?',
    use: 'Use this for “It starts at 3:45 and takes 35 minutes. When does it end?” and “How long?”',
    assumptions: [
      'Count on from the start: to the next hour, then whole hours, then the minutes left.',
      'After 12:59 the clock starts again at 1:00.',
      '60 minutes make 1 hour.',
    ],
    variables: [
      whole('sh', 'h₁', 'Start hour', 1, 12),
      { ...whole('sm', 'm₁', 'Start minutes', 0, 59), digits: 2 },
      whole('d', 'd', 'Minutes it takes', 0, 300),
      whole('eh', 'h₂', 'End hour', 1, 12),
      { ...whole('em', 'm₂', 'End minutes', 0, 59), digits: 2 },
    ],
    relations: [
      {
        id: 'end minutes',
        display: '{sm} minutes + {d} minutes ends at {em} minutes past the hour',
        vars: ['em', 'sm', 'd'],
        residual: (v) => v.em! - ((v.sm! + v.d!) % 60),
        solve: {
          em: (v) => (v.sm! + v.d!) % 60,
          sm: (v) => (((v.em! - v.d!) % 60) + 60) % 60,
          // 20 minutes past could follow 35 minutes or 1 hour 35: the time taken needs the hours.
          d: () => undefined,
        },
      },
      {
        id: 'start + time = end',
        display: '{sh}:{sm} + {d} minutes = {eh}:{em}',
        vars: ['eh', 'em', 'sh', 'sm', 'd'],
        // On a 12-hour clock: 12:30 + 45 minutes = 1:15.
        residual: (v) => {
          const r = mod720(at(v.eh!, v.em!) - at(v.sh!, v.sm!) - v.d!);
          return r > 360 ? r - 720 : r;
        },
        solve: {
          eh: (v) => toHour(mod720(at(v.sh!, v.sm!) + v.d! - v.em!)),
          d: (v) => mod720(at(v.eh!, v.em!) - at(v.sh!, v.sm!)),
          sh: (v) => toHour(mod720(at(v.eh!, v.em!) - v.d! - v.sm!)),
          sm: (v) => {
            const x = mod720(at(v.eh!, v.em!) - v.d! - 60 * (v.sh! % 12));
            return x < 60 ? x : undefined;
          },
          em: (v) => {
            const x = mod720(at(v.sh!, v.sm!) + v.d! - 60 * (v.eh! % 12));
            return x < 60 ? x : undefined;
          },
        },
      },
    ],
    steps: {
      'end minutes': {
        em: {
          expr: '{sm} + {d} past the hour',
          how: 'Count on from the start time; the jumps are in the next step. Every 60 minutes is a new hour.',
        },
        sm: {
          expr: '{d} minutes before {em} past the hour',
          how: 'Count back the minutes from the end minutes. Past the hour, go back into the hour before.',
          work: (v) =>
            v.d! % 60 <= v.em!
              ? [`${v.em} − ${v.d! % 60} = ${v.sm}`]
              : [`${v.em} + 60 − ${v.d! % 60} = ${v.sm}`],
        },
      },
      'start + time = end': {
        eh: {
          expr: 'the hour {d} minutes after {sh}:{sm}',
          how: 'Count on from the start time: to the next hour, then whole hours, then the rest.',
          work: (v) => timeHops(v.sh!, v.sm!, v.d!),
          note: (v) => `(${clock(v.eh!, v.em!)})`,
        },
        d: {
          expr: '{sh}:{sm} to {eh}:{em}',
          how: 'Count on from the start time to the end time. Add up the jumps.',
          work: (v) => timeHops(v.sh!, v.sm!, v.d!),
        },
        sh: {
          expr: 'the hour {d} minutes before {eh}:{em}',
          how: 'Count back from the end time: to the hour, then whole hours, then the rest.',
          work: (v) => timeHopsBack(v.eh!, v.em!, v.d!),
          note: (v) => `(${clock(v.sh!, v.sm!)})`,
        },
        sm: {
          expr: 'minutes past the hour, {d} minutes before {eh}:{em}',
          how: 'Count back from the end time.',
          work: (v) => timeHopsBack(v.eh!, v.em!, v.d!),
        },
        em: {
          expr: 'minutes after {sh}:{sm}',
          how: 'Count on from the start time.',
          work: (v) => timeHops(v.sh!, v.sm!, v.d!),
        },
      },
    },
    example: { sh: 3, sm: 45, d: 35, eh: 4, em: 20 },
    startWith: ['sh', 'sm', 'd'],
    representation: {
      kind: 'timeline',
      startHour: 'sh',
      startMinute: 'sm',
      minutes: 'd',
      endHour: 'eh',
      endMinute: 'em',
    },
  },
  // ── Mass and liquid volume (3.MD.2) ──
  (() => {
    const total = plus('t = a + b', ['a', 'b', 't'], ['first mass', 'second mass', 'total mass']);
    return {
      id: 'm.3.mass-liquid-volume',
      unitSystems: ['metric'],
      assumptions: [
        'Mass is how heavy something is. Grams (g) are for light things; kilograms (kg) for heavy ones.',
        'Put both things on the scale: it shows the total mass.',
        'Add or subtract masses only when they use the same unit.',
      ],
      variables: [
        { ...whole('a', 'a', 'First mass', 0, 1000), unit: 'g' },
        { ...whole('b', 'b', 'Second mass', 0, 1000), unit: 'g' },
        { ...whole('t', 't', 'Total mass', 0, 1000), unit: 'g' },
      ],
      relations: [total.relation],
      steps: { 't = a + b': total.steps },
      example: { a: 250, b: 480, t: 730 },
      startWith: ['a', 'b'],
      representation: { kind: 'scale', items: ['a', 'b'], total: 't', max: 1000 },
    } satisfies ModuleDef;
  })(),
  (() => {
    const total = plus(
      't = a + b',
      ['a', 'b', 't'],
      ['water in the jug', 'water poured in', 'total'],
    );
    return {
      id: 'm.3.mass-liquid-volume~liquid',
      title: 'Liquid volume in liters',
      use: 'Use this for liters: “3 L in the jug, pour in 4 L. How much now?”',
      unitSystems: ['metric'],
      assumptions: [
        'Liquid volume is how much a container holds. Liters (L) measure it.',
        'Read the level against the marks on the side.',
        'Pouring more in adds; pouring out takes away.',
      ],
      variables: [
        { ...whole('a', 'a', 'In the jug', 0, 20), unit: 'L' },
        { ...whole('b', 'b', 'Poured in', 0, 20), unit: 'L' },
        { ...whole('t', 't', 'Total', 0, 20), unit: 'L' },
      ],
      relations: [total.relation],
      steps: { 't = a + b': total.steps },
      example: { a: 3, b: 4, t: 7 },
      startWith: ['a', 'b'],
      representation: { kind: 'beaker', parts: ['a', 'b'], total: 't', max: 20 },
    } satisfies ModuleDef;
  })(),
  (() => {
    const bags = times('t = g × m', ['g', 'm', 't'], ['bags', 'mass of each bag', 'total mass']);
    return {
      id: 'm.3.mass-liquid-volume~bags',
      title: 'Equal bags',
      use: 'Use this for “5 bags of 3 kg each. How heavy in all?”',
      unitSystems: ['metric'],
      assumptions: [
        'Every bag has the same mass.',
        'Bags × mass of each bag = total mass.',
        'To share a mass equally, divide.',
      ],
      variables: [
        whole('g', 'g', 'Bags', 0, 10),
        { ...whole('m', 'm', 'Each bag', 0, 10), unit: 'kg' },
        { ...whole('t', 't', 'Total', 0, 100), unit: 'kg' },
      ],
      relations: [bags.relation],
      steps: { 't = g × m': bags.steps },
      example: { g: 5, m: 3, t: 15 },
      startWith: ['g', 'm'],
      representation: { kind: 'scale', count: 'g', each: 'm', total: 't', max: 100 },
    } satisfies ModuleDef;
  })(),
  // ── Perimeter (3.MD.8) ──
  {
    id: 'm.3.perimeter',
    assumptions: [
      'Perimeter is the distance all the way around a shape.',
      'A rectangle’s opposite sides are equal: add length + width + length + width.',
      'Perimeter is a length (cm), not square units.',
    ],
    variables: [
      { ...whole('l', 'l', 'Length', 0, 20), unit: 'cm' },
      { ...whole('w', 'w', 'Width', 0, 20), unit: 'cm' },
      { ...whole('P', 'P', 'Perimeter', 0, 80), unit: 'cm' },
    ],
    relations: [
      {
        id: 'P = l + w + l + w',
        display: '{l} + {w} + {l} + {w} = {P}',
        vars: ['P', 'l', 'w'],
        residual: (v) => v.P! - 2 * v.l! - 2 * v.w!,
        solve: {
          P: (v) => 2 * v.l! + 2 * v.w!,
          l: (v) => (v.P! - 2 * v.w!) / 2,
          w: (v) => (v.P! - 2 * v.l!) / 2,
        },
      },
    ],
    steps: {
      'P = l + w + l + w': {
        P: {
          expr: '{l} + {w} + {l} + {w}',
          how: 'Add all four sides.',
          work: (v) => addAll([v.l!, v.w!, v.l!, v.w!]),
        },
        l: {
          expr: '({P} − {w} − {w}) ÷ 2',
          how: 'Take away the two widths. The two lengths share what is left equally.',
          work: (v) => [
            `${v.P} − ${v.w} − ${v.w} = ${v.P! - 2 * v.w!}`,
            `${v.P! - 2 * v.w!} ÷ 2 = ${v.l}`,
          ],
        },
        w: {
          expr: '({P} − {l} − {l}) ÷ 2',
          how: 'Take away the two lengths. The two widths share what is left equally.',
          work: (v) => [
            `${v.P} − ${v.l} − ${v.l} = ${v.P! - 2 * v.l!}`,
            `${v.P! - 2 * v.l!} ÷ 2 = ${v.w}`,
          ],
        },
      },
    },
    example: { l: 6, w: 4, P: 20 },
    startWith: ['l', 'w'],
    representation: { kind: 'rectangle', length: 'l', width: 'w', around: 'P', extent: 7 },
  },
  {
    id: 'm.3.perimeter~missing-side',
    title: 'Find a missing side',
    use: 'Use this when you know the perimeter and every side but one.',
    assumptions: [
      'Add all the sides to get the perimeter.',
      'To find one side, take the other sides away from the perimeter.',
      'The tape shows the sides laid end to end.',
    ],
    variables: [
      { ...whole('a', 'a', 'Side 1', 0, 50), unit: 'cm' },
      { ...whole('b', 'b', 'Side 2', 0, 50), unit: 'cm' },
      { ...whole('c', 'c', 'Side 3', 0, 50), unit: 'cm' },
      { ...whole('d', 'd', 'Side 4', 0, 50), unit: 'cm' },
      { ...whole('P', 'P', 'Perimeter', 0, 200), unit: 'cm' },
    ],
    relations: [
      {
        id: 'P = a + b + c + d',
        display: '{a} + {b} + {c} + {d} = {P}',
        vars: ['P', 'a', 'b', 'c', 'd'],
        residual: (v) => v.P! - v.a! - v.b! - v.c! - v.d!,
        solve: {
          P: (v) => v.a! + v.b! + v.c! + v.d!,
          a: (v) => v.P! - v.b! - v.c! - v.d!,
          b: (v) => v.P! - v.a! - v.c! - v.d!,
          c: (v) => v.P! - v.a! - v.b! - v.d!,
          d: (v) => v.P! - v.a! - v.b! - v.c!,
        },
      },
    ],
    steps: {
      'P = a + b + c + d': Object.fromEntries(
        (['a', 'b', 'c', 'd'] as const)
          .map((x): [string, StepText] => {
            const others = ['a', 'b', 'c', 'd'].filter((y) => y !== x);
            return [
              x,
              {
                expr: `{P} − ${others.map((y) => `{${y}}`).join(' − ')}`,
                how: 'Add the sides you know. Take them away from the perimeter.',
                work: (v) => {
                  const known = others.map((y) => v[y]!);
                  const sum = known.reduce((s, n) => s + n, 0);
                  return [...addAll(known), `${v.P} − ${sum} = ${v[x]}`];
                },
              },
            ];
          })
          .concat([
            [
              'P',
              {
                expr: '{a} + {b} + {c} + {d}',
                how: 'Add all the sides.',
                work: (v) => addAll([v.a!, v.b!, v.c!, v.d!]),
              },
            ],
          ]),
      ),
    },
    example: { a: 8, b: 5, c: 6, d: 7, P: 26 },
    startWith: ['P', 'a', 'b', 'c'],
    representation: { kind: 'tape', parts: ['a', 'b', 'c', 'd'], total: 'P' },
  },
  {
    id: 'm.3.perimeter~same-perimeter',
    title: 'Same perimeter, different area',
    use: 'Use this to compare rectangles with the same perimeter but different areas.',
    assumptions: [
      'Rectangles with the same perimeter can have different areas.',
      'Perimeter goes around the edge (cm). Area covers the inside (square cm).',
      'Keep the perimeter and change the length to compare.',
    ],
    variables: [
      { ...whole('l', 'l', 'Length', 0, 20), unit: 'cm' },
      { ...whole('w', 'w', 'Width', 0, 20), unit: 'cm' },
      { ...whole('P', 'P', 'Perimeter', 0, 80), unit: 'cm' },
      { ...whole('A', 'A', 'Area', 0, 400), unit: 'cm²' },
    ],
    relations: [
      {
        id: 'P = l + w + l + w',
        display: '{l} + {w} + {l} + {w} = {P}',
        vars: ['P', 'l', 'w'],
        residual: (v) => v.P! - 2 * v.l! - 2 * v.w!,
        solve: {
          P: (v) => 2 * v.l! + 2 * v.w!,
          l: (v) => (v.P! - 2 * v.w!) / 2,
          w: (v) => (v.P! - 2 * v.l!) / 2,
        },
      },
      {
        id: 'A = l × w',
        display: '{l} × {w} = {A}',
        vars: ['A', 'l', 'w'],
        residual: (v) => v.A! - v.l! * v.w!,
        solve: { A: (v) => v.l! * v.w!, l: (v) => div(v.A!, v.w!), w: (v) => div(v.A!, v.l!) },
      },
    ],
    steps: {
      'P = l + w + l + w': {
        P: {
          expr: '{l} + {w} + {l} + {w}',
          how: 'Add all four sides.',
          work: (v) => addAll([v.l!, v.w!, v.l!, v.w!]),
        },
        l: {
          expr: '({P} − {w} − {w}) ÷ 2',
          how: 'Take away the two widths. The two lengths share what is left.',
          work: (v) => [
            `${v.P} − ${v.w} − ${v.w} = ${v.P! - 2 * v.w!}`,
            `${v.P! - 2 * v.w!} ÷ 2 = ${v.l}`,
          ],
        },
        w: {
          expr: '({P} − {l} − {l}) ÷ 2',
          how: 'Take away the two lengths. The two widths share what is left.',
          work: (v) => [
            `${v.P} − ${v.l} − ${v.l} = ${v.P! - 2 * v.l!}`,
            `${v.P! - 2 * v.l!} ÷ 2 = ${v.w}`,
          ],
        },
      },
      'A = l × w': {
        A: {
          expr: '{l} × {w}',
          how: 'Rows of squares: multiply the length by the width.',
          work: (v) => timesWork(v.l!, v.w!),
        },
        l: {
          expr: '{A} ÷ {w}',
          how: 'Divide the area by the width.',
          work: (v) => divideWork(v.A!, v.w!),
        },
        w: {
          expr: '{A} ÷ {l}',
          how: 'Divide the area by the length.',
          work: (v) => divideWork(v.A!, v.l!, 'second'),
        },
      },
    },
    example: { l: 6, w: 4, P: 20, A: 24 },
    startWith: ['l', 'P'],
    representation: {
      kind: 'rectangle',
      length: 'l',
      width: 'w',
      inside: 'A',
      around: 'P',
      extent: 7,
    },
  },
  // ── Scaled graphs (3.MD.3) ──
  {
    id: 'm.3.scaled-graphs',
    pictureLabels: ['d'],
    assumptions: [
      'Read the scale: here each line is 5 more. A bar between two lines is between those numbers.',
      'To compare, subtract the shorter bar from the taller one.',
      'The total is all the bars added.',
    ],
    variables: [
      whole('a', 'a', 'Dogs', 0, 30),
      whole('b', 'b', 'Cats', 0, 30),
      whole('c', 'c', 'Fish', 0, 30),
      whole('t', 't', 'Total', 0, 90),
      whole('d', 'd', 'How many more', 0, 30),
    ],
    relations: [
      {
        id: 't = a + b + c',
        display: '{a} + {b} + {c} = {t}',
        vars: ['t', 'a', 'b', 'c'],
        residual: (v) => v.t! - v.a! - v.b! - v.c!,
        solve: {
          t: (v) => v.a! + v.b! + v.c!,
          a: (v) => v.t! - v.b! - v.c!,
          b: (v) => v.t! - v.a! - v.c!,
          c: (v) => v.t! - v.a! - v.b!,
        },
      },
      {
        // Either bar can be taller: the difference is the taller take away the shorter.
        id: 'd = difference of a and b',
        display: '{a} and {b} are {d} apart',
        vars: ['d', 'a', 'b'],
        residual: (v) => v.d! - Math.abs(v.a! - v.b!),
        solve: {
          d: (v) => Math.abs(v.a! - v.b!),
          a: (v) => [v.b! + v.d!, v.b! - v.d!].filter((x) => x >= 0),
          b: (v) => [v.a! - v.d!, v.a! + v.d!].filter((x) => x >= 0),
        },
      },
    ],
    steps: {
      't = a + b + c': {
        t: {
          expr: '{a} + {b} + {c}',
          how: 'Add all the bars.',
          work: (v) => addAll([v.a!, v.b!, v.c!]),
        },
        a: {
          expr: '{t} − {b} − {c}',
          how: 'Take the other bars away from the total.',
          work: (v) => [`${v.b} + ${v.c} = ${v.b! + v.c!}`, `${v.t} − ${v.b! + v.c!} = ${v.a}`],
        },
        b: {
          expr: '{t} − {a} − {c}',
          how: 'Take the other bars away from the total.',
          work: (v) => [`${v.a} + ${v.c} = ${v.a! + v.c!}`, `${v.t} − ${v.a! + v.c!} = ${v.b}`],
        },
        c: {
          expr: '{t} − {a} − {b}',
          how: 'Take the other bars away from the total.',
          work: (v) => [`${v.a} + ${v.b} = ${v.a! + v.b!}`, `${v.t} − ${v.a! + v.b!} = ${v.c}`],
        },
      },
      'd = difference of a and b': {
        d: {
          expr: (v) => (v.a! >= v.b! ? '{a} − {b}' : '{b} − {a}'),
          how: 'Subtract the shorter bar from the taller bar.',
          work: (v) => subtractStrategy(Math.max(v.a!, v.b!), Math.min(v.a!, v.b!)),
          note: (v) => (v.a! === v.b! ? '(the same)' : v.a! > v.b! ? '(more dogs)' : '(more cats)'),
        },
        a: {
          expr: (v) => (v.a! >= v.b! ? '{b} + {d}' : '{b} − {d}'),
          how: (v) =>
            v.a! >= v.b!
              ? 'More dogs: the dogs bar is the cats bar plus how many more.'
              : 'More cats: the dogs bar is the cats bar minus how many more.',
          work: (v) => (v.a! >= v.b! ? addStrategy(v.b!, v.d!) : subtractStrategy(v.b!, v.d!)),
        },
        b: {
          expr: (v) => (v.a! >= v.b! ? '{a} − {d}' : '{a} + {d}'),
          how: (v) =>
            v.a! >= v.b!
              ? 'More dogs: the cats bar is the dogs bar minus how many more.'
              : 'More cats: the cats bar is the dogs bar plus how many more.',
          work: (v) => (v.a! >= v.b! ? subtractStrategy(v.a!, v.d!) : addStrategy(v.a!, v.d!)),
        },
      },
    },
    example: { a: 25, b: 15, c: 10, t: 50, d: 10 },
    startWith: ['a', 'b', 'c'],
    representation: {
      kind: 'bars',
      bars: [
        { var: 'a', editable: true },
        { var: 'b', editable: true },
        { var: 'c', editable: true },
      ],
      min: 0,
      max: 30,
      total: 't',
      scale: 5,
      readScale: true,
    },
  },
  (() => {
    const cols = (['1', '2', '3'] as const).map((i) =>
      times(
        `n${i} = p${i} × k`,
        [`p${i}`, 'k', `n${i}`],
        ['pictures', 'number each picture stands for', 'count'],
      ),
    );
    const total = sumAll('t = n₁ + n₂ + n₃', ['n1', 'n2', 'n3'], 't', 'kinds of fruit');
    return {
      id: 'm.3.scaled-graphs~picture-graph',
      title: 'Picture graph with a key',
      use: 'Use this for picture graphs where each picture stands for 2, 5 or 10.',
      pictureLabels: ['n1', 'n2', 'n3'],
      assumptions: [
        'The key says how many each picture stands for.',
        'Count the pictures, then multiply by the key.',
        'To find the pictures, divide the count by the key.',
      ],
      variables: [
        whole('k', 'k', 'Each picture stands for', 1, 10),
        whole('p1', 'p₁', 'Apple pictures', 0, 10),
        whole('p2', 'p₂', 'Pear pictures', 0, 10),
        whole('p3', 'p₃', 'Plum pictures', 0, 10),
        whole('n1', 'n₁', 'Apples', 0, 100),
        whole('n2', 'n₂', 'Pears', 0, 100),
        whole('n3', 'n₃', 'Plums', 0, 100),
        whole('t', 't', 'Fruit in all', 0, 300),
      ],
      relations: [...cols.map((c) => c.relation), total.relation],
      steps: {
        ...Object.fromEntries(cols.map((c) => [c.relation.id, c.steps])),
        't = n₁ + n₂ + n₃': total.steps,
      },
      example: { k: 2, p1: 6, p2: 3, p3: 5, n1: 12, n2: 6, n3: 10, t: 28 },
      startWith: ['k', 'p1', 'p2', 'p3'],
      representation: {
        kind: 'pictureGraph',
        columns: [
          { var: 'p1', icon: 'circle' },
          { var: 'p2', icon: 'square' },
          { var: 'p3', icon: 'triangle' },
        ],
        max: 10,
        key: 'k',
        total: 't',
      },
    } satisfies ModuleDef;
  })(),
  // ── Measure to the half and quarter inch; line plots (3.MD.4) ──
  (() => {
    const xs = ['x0', 'x1', 'x2', 'x3', 'x4'];
    const marks = ['2', '2 1/4', '2 1/2', '2 3/4', '3'];
    const long = ['x2', 'x3', 'x4'];
    const rest = (ids: string[], id: string) => ids.filter((x) => x !== id);
    const sumRelation = (id: string, total: string, parts: string[]) => ({
      id,
      display: `${parts.map((x) => `{${x}}`).join(' + ')} = {${total}}`,
      vars: [total, ...parts],
      residual: (v: Values) => v[total]! - parts.reduce((t, x) => t + v[x]!, 0),
      solve: Object.fromEntries([
        [total, (v: Values) => parts.reduce((t, x) => t + v[x]!, 0)],
        ...parts.map((x) => [
          x,
          (v: Values) => v[total]! - rest(parts, x).reduce((t, y) => t + v[y]!, 0),
        ]),
      ]),
    });
    const sumSteps_ = (total: string, parts: string[], how: string) =>
      Object.fromEntries([
        [
          total,
          {
            expr: parts.map((x) => `{${x}}`).join(' + '),
            how,
            work: (v: Values) => sumSteps(parts.map((x) => v[x]!)),
          },
        ],
        ...parts.map((x) => [
          x,
          {
            expr: `{${total}} − ${rest(parts, x)
              .map((y) => `{${y}}`)
              .join(' − ')}`,
            how: 'Take the X’s at the other marks away from the total.',
            work: (v: Values) =>
              missingPart(
                v[total]!,
                rest(parts, x).map((y) => v[y]!),
              ),
          },
        ]),
      ]) as Record<string, StepText>;
    return {
      id: 'm.3.measure-line-plots',
      pictureLabels: ['N', 'L'],
      assumptions: [
        'Each ribbon is measured to the nearest quarter inch, between 2 and 3 inches.',
        'Put one X above the line plot for each ribbon, at its length.',
        '2 1/2 inches or longer means the X’s at 2 1/2, 2 3/4 and 3.',
      ],
      variables: [
        ...xs.map((id, i) => whole(id, `x${'₀₁₂₃₄'[i]}`, `At ${marks[i]} in`, 0, 10)),
        whole('N', 'N', 'Ribbons measured', 0, 50),
        whole('L', 'L', '2 1/2 in or longer', 0, 30),
      ],
      relations: [sumRelation('N = all X’s', 'N', xs), sumRelation('L = long X’s', 'L', long)],
      steps: {
        'N = all X’s': sumSteps_('N', xs, 'Count every X on the line plot.'),
        'L = long X’s': sumSteps_('L', long, 'Count the X’s at 2 1/2 inches and past it.'),
      },
      example: { x0: 1, x1: 3, x2: 4, x3: 2, x4: 1, N: 11, L: 7 },
      startWith: xs,
      representation: {
        kind: 'linePlot',
        unit: 'in',
        points: xs.map((id, i) => ({ var: id, at: 2 + i / 4, label: marks[i] })),
      },
    } satisfies ModuleDef;
  })(),
  {
    id: 'm.3.measure-line-plots~quarter-inch',
    title: 'Read a ruler to the quarter inch',
    use: 'Use this to read a length on a ruler marked in halves or quarters of an inch.',
    pictureLabels: ['w', 'r'],
    assumptions: [
      'Each inch on the ruler is split into equal marks: 2 for halves, 4 for quarters.',
      'Count the marks from 0 to the end of the object.',
      'Every full set of marks is 1 inch; the marks left over are the fraction of an inch.',
    ],
    variables: [
      whole('a', 'a', 'Marks from 0', 0, 24),
      { ...whole('b', 'b', 'Marks in one inch', 2, 4), step: 2, multipleOf: 2 },
      whole('w', 'w', 'Whole inches', 0, 6),
      whole('r', 'r', 'Marks past the last inch', 0, 3),
    ],
    relations: [
      {
        id: 'w = inches in a marks',
        display: '{a} marks of 1/{b} inch pass {w} whole inches',
        vars: ['w', 'a', 'b'],
        residual: (v) => v.w! - Math.floor(v.a! / v.b!),
        // Many lengths pass the same whole inches: the marks can't be found from it.
        solve: { w: (v) => Math.floor(v.a! / v.b!), a: () => undefined, b: () => undefined },
      },
      {
        id: 'a = w inches and r marks',
        display: '{a}/{b} inch = {w} inches and {r}/{b} inch',
        vars: ['a', 'w', 'b', 'r'],
        residual: (v) => v.a! - v.w! * v.b! - v.r! + (v.r! >= v.b! ? 1 : 0),
        solve: {
          a: (v) => (v.r! < v.b! ? v.w! * v.b! + v.r! : undefined),
          r: (v) => {
            const r = v.a! - v.w! * v.b!;
            return r >= 0 && r < v.b! ? r : undefined;
          },
          w: (v) => (v.r! < v.b! ? div(v.a! - v.r!, v.b!) : undefined),
          b: () => undefined,
        },
      },
    ],
    steps: {
      'w = inches in a marks': {
        w: {
          expr: 'whole inches in {a} marks of 1/{b}',
          how: 'Every full set of marks makes 1 inch. Count the full sets.',
          work: (v) =>
            v.w! > 0
              ? [`Count by ${v.b}s: ${countList(0, v.b!, v.w!)} → ${v.w} inches`]
              : [`${v.a} marks is less than ${v.b}, so not a whole inch yet.`],
        },
      },
      'a = w inches and r marks': {
        a: {
          expr: '{w} × {b} + {r}',
          how: 'Each inch has the same number of marks. Add the marks left over.',
          work: (v) => [`${v.w} × ${v.b} = ${v.w! * v.b!}`, `${v.w! * v.b!} + ${v.r} = ${v.a}`],
        },
        r: {
          expr: '{a} − {w} × {b}',
          how: 'Take away the marks that make whole inches. The rest are left over.',
          work: (v) => [`${v.w} × ${v.b} = ${v.w! * v.b!}`, `${v.a} − ${v.w! * v.b!} = ${v.r}`],
          note: (v) => (v.b === 4 && v.r === 2 ? '(2/4 inch is 1/2 inch)' : ''),
        },
        w: {
          expr: '({a} − {r}) ÷ {b}',
          how: 'Take away the marks left over. Share the rest into inches.',
          work: (v) => [`${v.a} − ${v.r} = ${v.a! - v.r!}`, ...divideWork(v.a! - v.r!, v.b!)],
        },
      },
    },
    example: { a: 9, b: 4, w: 2, r: 1 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'fractionLine',
      numerator: 'a',
      denominator: 'b',
      wholes: 3,
      unit: { one: 'inch', many: 'inches' },
    },
  },
];
