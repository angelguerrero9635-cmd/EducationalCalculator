/**
 * Grade 4 problem types: the pages the Grade 4 review asked for beyond each skill's main page
 * (multiples, rounding and comparing big numbers, bigger area models, times as many,
 * interpreting a remainder, making equivalent fractions, subtracting and mixed numbers,
 * comparing decimals, two units, fractions of a turn). Same rules as math-4.ts.
 */
import type { Values } from '@/engine/types';

import { formatNumber } from '@/engine/format';

import { apart, times } from './helpers';
import { div, whole } from './math-k2';
import type { ModuleDef } from './types';
import { addAll, addStrategy, divideWork, placeTimesWork, timesWork } from './work';

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

export const MATH_4_MORE_MODULES: ModuleDef[] = [
  // ── Multiples: is n a multiple of k? (4.OA.4) ──
  (() => {
    const mult = times('n = k × j', ['k', 'j', 'n'], ['number', 'count', 'multiple']);
    return {
      id: 'm.4.factors-multiples~multiples',
      title: 'Multiples of a number',
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

  // ── Rounding to any place, to 1,000,000 (4.NBT.3) ──
  {
    id: 'm.4.place-value-million~rounding',
    title: 'Round to any place',
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

  // ── 2-digit × 2-digit as a four-box area model (4.NBT.5) ──
  (() => {
    const p1 = partProduct('p', 't', 's', ['tens of the first', 'tens of the second']);
    const p2 = partProduct('q', 'o', 's', ['ones of the first', 'tens of the second']);
    const p3 = partProduct('u', 't', 'r', ['tens of the first', 'ones of the second']);
    const p4 = partProduct('x', 'o', 'r', ['ones of the first', 'ones of the second']);
    return {
      id: 'm.4.multi-digit-multiply~two-digit',
      title: 'Two-digit times two-digit',
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

  // ── Interpreting a remainder: round the quotient up (4.OA.3) ──
  {
    id: 'm.4.long-division~interpret-remainder',
    title: 'What to do with the remainder',
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

  // ── Making an equivalent fraction (4.NF.1) ──
  (() => {
    const top = times('p = a × k', ['a', 'k', 'p'], ['top', 'factor', 'new top']);
    const bottom = times('m = b × k', ['b', 'k', 'm'], ['bottom', 'factor', 'new bottom']);
    return {
      id: 'm.4.fraction-equivalence~equivalent',
      title: 'Make an equivalent fraction',
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

  // ── Subtracting fractions with like denominators (4.NF.3a) ──
  {
    id: 'm.4.add-fractions-like~subtract',
    title: 'Subtract fractions with the same bottom',
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

  // ── Angles as fractions of a turn (4.MD.5) ──
  {
    id: 'm.4.angles~turns',
    title: 'Angles as parts of a turn',
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
