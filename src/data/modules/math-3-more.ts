/**
 * Grade 3 math, part 2: fractions, time, mass and liquid volume, area, perimeter, scaled
 * graphs and quadrilaterals. Same conventions as `math-3.ts`.
 */
import type { Values } from '@/engine/types';

import { sumAll } from './helpers';
import { div, whole } from './math-k2';
import type { ModuleDef, StepText } from './types';
import {
  addAll,
  addStrategy,
  countList,
  divideWork,
  missingPart,
  subtractStrategy,
  sumSteps,
  timesWork,
} from './work';

const clock = (h: number, m: number) => `${h}:${String(m).padStart(2, '0')}`;

/** c = a × b and its two divisions (see `math-3.ts`). */
function times(
  id: string,
  [a, b, c]: [string, string, string],
  [an, bn, cn]: [string, string, string],
  display = `{${a}} × {${b}} = {${c}}`,
) {
  return {
    relation: {
      id,
      display,
      vars: [c, a, b],
      residual: (v: Values) => v[c]! - v[a]! * v[b]!,
      solve: {
        [c]: (v: Values) => v[a]! * v[b]!,
        [a]: (v: Values) => div(v[c]!, v[b]!),
        [b]: (v: Values) => div(v[c]!, v[a]!),
      },
    },
    steps: {
      [c]: {
        expr: `{${a}} × {${b}}`,
        how: `Multiply the ${an} by the ${bn}.`,
        work: (v: Values) => timesWork(v[a]!, v[b]!),
      },
      [a]: {
        expr: `{${c}} ÷ {${b}}`,
        how: `Divide the ${cn} by the ${bn}.`,
        work: (v: Values) => divideWork(v[c]!, v[b]!),
      },
      [b]: {
        expr: `{${c}} ÷ {${a}}`,
        how: `Divide the ${cn} by the ${an}.`,
        work: (v: Values) => divideWork(v[c]!, v[a]!, 'second'),
      },
    } as Record<string, StepText>,
  };
}

/** c = a + b and its two subtractions (see `math-3.ts`). */
function plus(
  id: string,
  [a, b, c]: [string, string, string],
  [an, bn, cn]: [string, string, string],
  display = `{${a}} + {${b}} = {${c}}`,
) {
  return {
    relation: {
      id,
      display,
      vars: [c, a, b],
      residual: (v: Values) => v[c]! - v[a]! - v[b]!,
      solve: {
        [c]: (v: Values) => v[a]! + v[b]!,
        [a]: (v: Values) => v[c]! - v[b]!,
        [b]: (v: Values) => v[c]! - v[a]!,
      },
    },
    steps: {
      [c]: {
        expr: `{${a}} + {${b}}`,
        how: `Add the ${an} and the ${bn}.`,
        work: (v: Values) => addStrategy(v[a]!, v[b]!),
      },
      [a]: {
        expr: `{${c}} − {${b}}`,
        how: `Take the ${bn} away from the ${cn}.`,
        work: (v: Values) => subtractStrategy(v[c]!, v[b]!),
      },
      [b]: {
        expr: `{${c}} − {${a}}`,
        how: `Take the ${an} away from the ${cn}.`,
        work: (v: Values) => subtractStrategy(v[c]!, v[a]!),
      },
    } as Record<string, StepText>,
  };
}

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

export const MATH_3_MORE_MODULES: ModuleDef[] = [
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

  // ── Area (3.MD.5–7): problem types ──
  (() => {
    const tiles = times('A = r × c', ['r', 'c', 'A'], ['rows', 'squares in each row', 'area']);
    return {
      id: 'm.3.area~tiling',
      title: 'Count unit squares',
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

  // ── Quadrilaterals (3.G.1) ──
  {
    id: 'm.3.quadrilaterals',
    pictureLabels: ['P'],
    standalone: {
      vars: ['r'],
      why: 'Square corners change the shape’s name, not its side lengths or perimeter.',
    },
    assumptions: [
      'A quadrilateral has 4 sides and 4 angles.',
      'A rectangle has 4 right angles. A rhombus has 4 equal sides.',
      'A square has both, so it is a rectangle and a rhombus too.',
      'These shapes have 2 pairs of equal sides, so the perimeter is both sides added twice.',
    ],
    variables: [
      { ...whole('a', 'a', 'First side', 1, 10), unit: 'cm' },
      { ...whole('b', 'b', 'Second side', 1, 10), unit: 'cm' },
      { ...whole('r', 'r', 'Right angles', 0, 4), step: 4, allowed: [0, 4] },
      { ...whole('P', 'P', 'Perimeter', 4, 40), unit: 'cm' },
    ],
    relations: [
      {
        id: 'P = a + b + a + b',
        display: '{a} + {b} + {a} + {b} = {P}',
        vars: ['P', 'a', 'b'],
        residual: (v) => v.P! - 2 * v.a! - 2 * v.b!,
        solve: {
          P: (v) => 2 * v.a! + 2 * v.b!,
          a: (v) => (v.P! - 2 * v.b!) / 2,
          b: (v) => (v.P! - 2 * v.a!) / 2,
        },
      },
    ],
    steps: {
      'P = a + b + a + b': {
        P: {
          expr: '{a} + {b} + {a} + {b}',
          how: 'Opposite sides are equal. Add all four sides.',
          work: (v) => addAll([v.a!, v.b!, v.a!, v.b!]),
        },
        a: {
          expr: '({P} − {b} − {b}) ÷ 2',
          how: 'Take away the two second sides. The two first sides share what is left.',
          work: (v) => [
            `${v.P} − ${v.b} − ${v.b} = ${v.P! - 2 * v.b!}`,
            `${v.P! - 2 * v.b!} ÷ 2 = ${v.a}`,
          ],
        },
        b: {
          expr: '({P} − {a} − {a}) ÷ 2',
          how: 'Take away the two first sides. The two second sides share what is left.',
          work: (v) => [
            `${v.P} − ${v.a} − ${v.a} = ${v.P! - 2 * v.a!}`,
            `${v.P! - 2 * v.a!} ÷ 2 = ${v.b}`,
          ],
        },
      },
    },
    example: { a: 6, b: 4, r: 4, P: 20 },
    startWith: ['r', 'a', 'b'],
    representation: { kind: 'quadrilateral', first: 'a', second: 'b', rightAngles: 'r' },
  },
];
