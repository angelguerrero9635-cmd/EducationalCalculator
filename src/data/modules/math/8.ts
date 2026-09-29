/**
 * Grade 8 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { formatNumber } from '@/engine/format';
import type { Relation, Values } from '@/engine/types';

import { div, whole } from '../helpers';
import type { ModuleDef, StepText } from '../types';

const fmt = (x: number) => formatNumber(x);
/** A power's value as the page shows it: a fraction for a negative exponent (1/125). */
const fmtP = (x: number) => formatNumber(x, { fraction: 1000000 });
/** A number in scientific notation, bracketed so it reads as one number in a line. */
const sci = (x: number) => `(${formatNumber(x, { scientific: true })})`;
/** Rounded to 12 significant figures, so 0.1 + 0.2 is 0.3 when a value is worked out. */
const exact = (x: number) => Number(x.toPrecision(12));
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** An integer exponent raised: 5 → "⁵", −4 → "⁻⁴". */
const sup = (n: number) =>
  `${n < 0 ? '⁻' : ''}${[...String(Math.abs(n))].map((ch) => SUP[Number(ch)]).join('')}`;

/** A value worked out from others, never solved backwards. */
function derive(
  id: string,
  x: string,
  inputs: string[],
  display: string,
  f: (v: Values) => number | undefined,
): Relation {
  return {
    id,
    display,
    vars: [x, ...inputs],
    residual: (v: Values) => v[x]! - (f(v) ?? NaN),
    solve: {
      [x]: (v: Values) => {
        const y = f(v);
        return y === undefined ? undefined : exact(y);
      },
      ...Object.fromEntries(inputs.map((i) => [i, () => undefined])),
    },
  };
}

/** One exponent rule: the answer's exponent k from m and n, and the value bᵏ. */
function exponentRule(rule: 'product' | 'quotient' | 'power') {
  const rules = {
    product: {
      display: '{k} = {m} + {n}',
      op: (v: Values) => v.m! + v.n!,
      solve: {
        k: (v: Values) => v.m! + v.n!,
        m: (v: Values) => v.k! - v.n!,
        n: (v: Values) => v.k! - v.m!,
      },
      steps: {
        k: { expr: '{m} + {n}', how: 'Multiplying powers of the same base adds the exponents.' },
        m: { expr: '{k} − {n}', how: 'Take the second exponent from the answer’s.' },
        n: { expr: '{k} − {m}', how: 'Take the first exponent from the answer’s.' },
      },
    },
    quotient: {
      display: '{k} = {m} − {n}',
      op: (v: Values) => v.m! - v.n!,
      solve: {
        k: (v: Values) => v.m! - v.n!,
        m: (v: Values) => v.k! + v.n!,
        n: (v: Values) => v.m! - v.k!,
      },
      steps: {
        k: { expr: '{m} − {n}', how: 'Dividing powers of the same base subtracts the exponents.' },
        m: { expr: '{k} + {n}', how: 'Add the bottom exponent back to the answer’s.' },
        n: { expr: '{m} − {k}', how: 'The top exponent take away the answer’s.' },
      },
    },
    power: {
      display: '{k} = {m} × {n}',
      op: (v: Values) => v.m! * v.n!,
      solve: {
        k: (v: Values) => v.m! * v.n!,
        m: (v: Values) => div(v.k!, v.n!),
        n: (v: Values) => div(v.k!, v.m!),
      },
      steps: {
        k: { expr: '{m} × {n}', how: 'A power of a power multiplies the exponents.' },
        m: { expr: '{k} ÷ {n}', how: 'Divide the answer’s exponent by the outside one.' },
        n: { expr: '{k} ÷ {m}', how: 'Divide the answer’s exponent by the inside one.' },
      },
    },
  };
  const { display, op, solve, steps } = rules[rule];
  return {
    variables: [
      whole('b', 'b', 'Base', 1, 10),
      whole('m', 'm', rule === 'power' ? 'Inside exponent' : 'First exponent', 0, 12),
      whole('n', 'n', rule === 'power' ? 'Outside exponent' : 'Second exponent', 0, 12),
      whole('k', 'k', 'Exponent of the answer', rule === 'quotient' ? -12 : 0, 24),
      {
        id: 'P',
        symbol: 'P',
        name: 'Value of the answer',
        min: 0,
        max: 1e25,
        fraction: 1000000,
        derived: true,
      },
    ],
    relations: [
      {
        id: display,
        display,
        vars: ['k', 'm', 'n'],
        residual: (v: Values) => v.k! - op(v),
        solve,
      },
      {
        ...derive('P = b^k', 'P', ['b', 'k'], '{P} = {b}^{k}', (v) => v.b! ** v.k!),
        check: (v: Values) => `${v.b}${sup(v.k!)} = ${fmtP(v.P!)}`,
      },
    ] satisfies Relation[],
    steps: {
      [display]: steps,
      'P = b^k': {
        P: {
          expr: '{b}^{k}',
          how: 'Multiply the base by itself as many times as the exponent says.',
          written: false,
        },
      },
    } satisfies Record<string, Record<string, StepText>>,
    representation: {
      kind: 'factorRows' as const,
      base: 'b',
      first: 'm',
      second: 'n',
      result: 'k',
      rule,
    },
  };
}

/** Two numbers in scientific notation: a × 10ⁿ and c × 10ᵏ. */
const MANTISSA = (id: string, name: string) => ({
  id,
  symbol: id,
  name,
  min: 1,
  max: 9.999,
  step: 0.001,
});
const sciNumber = (id: string, symbol: string, name: string) => ({
  id,
  symbol,
  name,
  min: 0,
  max: 1e30,
  scientific: true,
  derived: true,
});
/** x as a × 10ⁿ, a from 1 up to 10. */
const split = (x: number) => {
  const n = Math.floor(Math.log10(Math.abs(x)) + 1e-12);
  return { a: exact(x / 10 ** n), n };
};

/** `id = a − b`, solvable for each of the three. */
const minus = (
  id: string,
  a: string,
  b: string,
  display: string,
  how: [string, string, string],
): { relation: Relation; steps: Record<string, StepText> } => ({
  relation: {
    id: `${id} = ${a} − ${b}`,
    display,
    vars: [id, a, b],
    residual: (v: Values) => v[id]! - (v[a]! - v[b]!),
    solve: {
      [id]: (v: Values) => v[a]! - v[b]!,
      [a]: (v: Values) => v[id]! + v[b]!,
      [b]: (v: Values) => v[a]! - v[id]!,
    },
  },
  steps: {
    [id]: { expr: `{${a}} − {${b}}`, how: how[0] },
    [a]: { expr: `{${b}} + {${id}}`, how: how[1] },
    [b]: { expr: `{${a}} − {${id}}`, how: how[2] },
  },
});

const RISE = minus('R', 'y2', 'y1', '{R} = {y2} − {y1}', [
  'The rise is how far up the second point is from the first.',
  'Start at the first y and go up the rise.',
  'Start at the second y and go back down the rise.',
]);
const RUN = minus('r', 'x2', 'x1', '{r} = {x2} − {x1}', [
  'The run is how far across the second point is from the first.',
  'Start at the first x and go across the run.',
  'Start at the second x and go back across the run.',
]);

/** A signed value on a grid: −lim to lim in steps of `step`. */
const signed = (id: string, symbol: string, name: string, step = 1, lim = 10) => ({
  id,
  symbol,
  name,
  min: -lim,
  max: lim,
  step,
  ...(step === 1 ? { integer: true } : {}),
});

/** Why a x + b = c x + d has no single x, when the x-blocks match (8.EE.7a). */
const sameX = (b: number, d: number) =>
  b === d
    ? 'Both sides are the same expression: every x works, so there are infinitely many solutions.'
    : 'The same x on both sides but different numbers: no x works, so there is no solution.';

/** Why two lines have no single crossing, when their slopes match (8.EE.8b). */
const sameSlope = (b1: number, b2: number) =>
  b1 === b2
    ? 'The same line twice: every point on it is a solution.'
    : 'The slopes are equal and the intercepts differ: the lines are parallel, so there is no solution.';

/** x where two lines y = m₁x + b₁ and y = m₂x + b₂ cross, and y there. */
function crossing(m1: string, b1: string, m2: string, b2: string, x = 'x', y = 'y') {
  const xId = `${x} = (${b2} − ${b1}) ÷ (${m1} − ${m2})`;
  const yId = `${y} = ${m1} × ${x} + ${b1}`;
  return {
    relations: [
      {
        id: xId,
        display: `{${x}} = ({${b2}} − {${b1}}) ÷ ({${m1}} − {${m2}})`,
        vars: [x, b2, b1, m1, m2],
        residual: (v: Values) => v[x]! * (v[m1]! - v[m2]!) - (v[b2]! - v[b1]!),
        solve: {
          [x]: (v: Values) => div(v[b2]! - v[b1]!, v[m1]! - v[m2]!),
          [b2]: () => undefined,
          [b1]: () => undefined,
          [m1]: () => undefined,
          [m2]: () => undefined,
        },
        message: (v: Values) =>
          v[m1] !== undefined && v[m1] === v[m2] ? sameSlope(v[b1]!, v[b2]!) : undefined,
      },
      derive(
        yId,
        y,
        [m1, x, b1],
        `{${y}} = {${m1}} × {${x}} + {${b1}}`,
        (v) => v[m1]! * v[x]! + v[b1]!,
      ),
    ] satisfies Relation[],
    steps: {
      [xId]: {
        [x]: {
          expr: `({${b2}} − {${b1}}) ÷ ({${m1}} − {${m2}})`,
          how: 'Set the two right sides equal, gather x on one side, then divide.',
        },
      },
      [yId]: { [y]: { expr: `{${m1}} × {${x}} + {${b1}}`, how: 'Put x into the first equation.' } },
    } satisfies Record<string, Record<string, StepText>>,
  };
}

/** a × x + b = c × x + d, with the message for equal x-blocks. */
function bothSides(a: string, b: string, c: string, d: string): Relation {
  return {
    id: `${a} × x + ${b} = ${c} × x + ${d}`,
    display: `{${a}} × {x} + {${b}} = {${c}} × {x} + {${d}}`,
    vars: ['x', a, b, c, d],
    residual: (v: Values) => v[a]! * v.x! + v[b]! - (v[c]! * v.x! + v[d]!),
    solve: {
      x: (v: Values) => div(v[d]! - v[b]!, v[a]! - v[c]!),
      [a]: () => undefined,
      [b]: () => undefined,
      [c]: () => undefined,
      [d]: () => undefined,
    },
    message: (v: Values) => (v[a] !== undefined && v[a] === v[c] ? sameX(v[b]!, v[d]!) : undefined),
  };
}
const bothSidesSteps = (
  a: string,
  b: string,
  c: string,
  d: string,
): Record<string, Record<string, StepText>> => ({
  [`${a} × x + ${b} = ${c} × x + ${d}`]: {
    x: {
      expr: `({${d}} − {${b}}) ÷ ({${a}} − {${c}})`,
      how: 'Take the same x and the same number from both sides, then divide by the x left.',
      work: (v: Values) => [
        `Take ${fmt(v[c]!)}x from both sides: ${fmt(v[a]! - v[c]!)}x + ${fmt(v[b]!)} = ${fmt(v[d]!)}`,
        `Take ${fmt(v[b]!)} from both sides: ${fmt(v[a]! - v[c]!)}x = ${fmt(v[d]! - v[b]!)}`,
      ],
      written: false,
    },
  },
});

export const MATH_8_MODULES: ModuleDef[] = [
  // ── Square roots, cube roots and irrational numbers (8.NS.1–2, 8.EE.2) ──
  {
    id: 'm.8.roots-irrationals',
    assumptions: [
      'A square of area A has side √A, because side × side = area.',
      'If A is a perfect square, √A is a whole number.',
      'If not, √A is irrational: it lies between two whole numbers and its decimal never ends or repeats.',
      'To place √A, find the perfect squares on either side.',
    ],
    variables: [
      { id: 'A', symbol: 'A', name: 'Area of the square', min: 0, max: 144, step: 1 },
      { id: 's', symbol: 's', name: 'Side of the square', min: 0, max: 12, step: 0.01 },
      { ...whole('lo', 'lo', 'Whole number at or below √A', 0, 12), derived: true },
      { ...whole('hi', 'hi', 'Whole number at or above √A', 0, 12), derived: true },
    ],
    relations: [
      {
        id: 's = √A',
        display: '{s} = √{A}',
        vars: ['s', 'A'],
        residual: (v: Values) => v.s! * v.s! - v.A!,
        solve: {
          s: (v: Values) => (v.A! >= 0 ? Math.sqrt(v.A!) : undefined),
          A: (v: Values) => exact(v.s! * v.s!),
        },
      },
      derive(
        'lo = whole number at or below √A',
        'lo',
        ['A'],
        '{lo} = whole number at or below the square root of {A}',
        (v) => Math.floor(Math.sqrt(v.A!) + 1e-9),
      ),
      derive(
        'hi = whole number at or above √A',
        'hi',
        ['A'],
        '{hi} = whole number at or above the square root of {A}',
        (v) => Math.ceil(Math.sqrt(v.A!) - 1e-9),
      ),
    ],
    steps: {
      's = √A': {
        s: { expr: '√{A}', how: 'The side is the number that, times itself, makes the area.' },
        A: { expr: '{s}²', how: 'The area is the side times itself.' },
      },
      'lo = whole number at or below √A': {
        lo: {
          expr: 'whole number at or below the square root of {A}',
          how: 'Find the biggest perfect square that is not more than A.',
          work: (v: Values) => [
            `${fmt(v.lo!)}² = ${fmt(v.lo! ** 2)}, and ${fmt(v.lo! ** 2)} ≤ ${fmt(v.A!)}`,
          ],
        },
      },
      'hi = whole number at or above √A': {
        hi: {
          expr: 'whole number at or above the square root of {A}',
          how: 'Find the smallest perfect square that is not less than A.',
          work: (v: Values) => [
            `${fmt(v.hi!)}² = ${fmt(v.hi! ** 2)}, and ${fmt(v.A!)} ≤ ${fmt(v.hi! ** 2)}`,
          ],
        },
      },
    },
    example: { A: 10, s: Math.sqrt(10), lo: 3, hi: 4 },
    startWith: ['A'],
    representation: {
      kind: 'rootSquare',
      area: 'A',
      side: 's',
      between: ['lo', 'hi'],
      marks: [
        { at: Math.SQRT2, label: '√2' },
        { at: Math.PI, label: 'π' },
      ],
    },
  },
  {
    id: 'm.8.roots-irrationals~cube-root',
    title: 'Cube roots as edges',
    use: 'Use this for “A cube has volume 1,000 cm³. What is its edge?”',
    assumptions: [
      'A cube of volume V has edge ∛V, because edge × edge × edge = volume.',
      'If V is a perfect cube (8, 27, 64, …), the edge is a whole number.',
      'If not, the edge lies between two whole numbers whose cubes are on either side of V.',
    ],
    variables: [
      {
        id: 'V',
        symbol: 'V',
        name: 'Volume of the cube',
        unit: 'cm³',
        units: ['cm³'],
        min: 0.001,
        max: 8000,
      },
      {
        id: 'e',
        symbol: 'e',
        name: 'Edge',
        unit: 'cm',
        units: ['cm'],
        min: 0.1,
        max: 20,
        step: 0.01,
      },
    ],
    relations: [
      {
        id: 'e = ∛V',
        display: '{e} = ∛{V}',
        vars: ['e', 'V'],
        residual: (v: Values) => v.e! ** 3 - v.V!,
        solve: {
          e: (v: Values) => (v.V! >= 0 ? Math.cbrt(v.V!) : undefined),
          V: (v: Values) => exact(v.e! ** 3),
        },
      },
    ],
    steps: {
      'e = ∛V': {
        e: {
          expr: '∛{V}',
          how: 'The edge is the number that, used as a factor three times, makes the volume.',
        },
        V: { expr: '{e}³', how: 'The volume is the edge times itself times itself.' },
      },
    },
    example: { V: 1000, e: 10 },
    startWith: ['V'],
    unitSystems: ['metric'],
    representation: { kind: 'rootSquare', area: 'V', side: 'e', solid: 'cube' },
  },
  {
    id: 'm.8.roots-irrationals~repeating-decimal',
    title: 'A repeating decimal as a fraction',
    use: 'Use this for “Write 0.363636… as a fraction.”',
    assumptions: [
      'Call the decimal x. Its repeating block has k digits.',
      'Multiply by 10ᵏ to move one block in front of the point. Take x away: the repeats cancel.',
      'That leaves (10ᵏ − 1) × x = the block, so x = block ÷ (10ᵏ − 1).',
      'Every repeating decimal is a fraction, so it is rational.',
    ],
    variables: [
      whole('k', 'k', 'Digits in the block', 1, 3),
      whole('r', 'r', 'Repeating block', 0, 999),
      { ...whole('d', 'd', 'Denominator', 9, 999), derived: true },
      {
        id: 'f',
        symbol: 'f',
        name: 'Fraction',
        min: 0,
        max: 1,
        fraction: 999,
        derived: true,
      },
      { id: 'x', symbol: 'x', name: 'Decimal', min: 0, max: 1, repeating: true, derived: true },
    ],
    relations: [
      {
        id: 'r < 10^k',
        constraint: true,
        display: '{r} has at most {k} digits',
        vars: ['r', 'k'],
        residual: (v: Values) => (v.r! < 10 ** v.k! ? 0 : 1),
        solve: {},
      },
      derive('d = 10^k − 1', 'd', ['k'], '{d} = 10^{k} − 1', (v) => 10 ** v.k! - 1),
      derive('f = r ÷ d', 'f', ['r', 'd'], '{f} = {r} ÷ {d}', (v) => v.r! / v.d!),
      derive('x = f', 'x', ['f'], '{x} = {f}', (v) => v.f!),
    ],
    steps: {
      'r < 10^k': {},
      'd = 10^k − 1': {
        d: {
          expr: '10^{k} − 1',
          how: 'Multiplying by 10ᵏ and taking x away leaves 10ᵏ − 1 of x.',
        },
      },
      'f = r ÷ d': {
        f: {
          expr: '{r} ÷ {d}',
          how: 'The block over that many nines, in lowest terms.',
          work: (v: Values) => {
            const x = formatNumber(v.r! / v.d!, { repeating: true });
            const big = formatNumber((v.r! / v.d!) * 10 ** v.k!, { repeating: true });
            return [
              `x = ${x}`,
              `${fmt(10 ** v.k!)}x = ${big}`,
              `${fmt(10 ** v.k!)}x − x = ${fmt(v.r!)}, so ${fmt(v.d!)}x = ${fmt(v.r!)}`,
            ];
          },
          written: false,
        },
      },
      'x = f': { x: { expr: '{f}', how: 'The same number as a decimal: the block repeats.' } },
    },
    example: { k: 2, r: 36, d: 99, f: 36 / 99, x: 36 / 99 },
    startWith: ['k', 'r'],
    representation: { kind: 'fractionLine', numerator: 'r', denominator: 'd', wholes: 1 },
  },

  // ── Integer exponent rules (8.EE.1) ──
  {
    id: 'm.8.exponent-rules',
    assumptions: [
      'A power is its base used as a factor again and again: 2³ = 2 × 2 × 2.',
      'Multiplying two powers of one base puts their factors in one row: add the exponents.',
      'The bases must be the same: 2³ × 5² has no single exponent.',
    ],
    ...exponentRule('product'),
    example: { b: 2, m: 3, n: 4, k: 7, P: 128 },
    startWith: ['b', 'm', 'n'],
  },
  {
    id: 'm.8.exponent-rules~divide',
    title: 'Dividing powers',
    use: 'Use this for “Write 7⁶ ÷ 7² with a single exponent” or “What is 10³ ÷ 10³?”',
    assumptions: [
      'Each factor on top cancels one on the bottom: 7 ÷ 7 = 1.',
      'So dividing powers of one base subtracts the exponents.',
      'Equal exponents give b⁰ = 1. More factors on the bottom give a negative exponent.',
    ],
    ...exponentRule('quotient'),
    example: { b: 2, m: 6, n: 2, k: 4, P: 16 },
    startWith: ['b', 'm', 'n'],
  },
  {
    id: 'm.8.exponent-rules~power-of-power',
    title: 'A power of a power',
    use: 'Use this for “Write (10⁷)² with a single exponent.”',
    assumptions: [
      '(2³)⁴ is 2³ used as a factor 4 times.',
      'Each copy has 3 factors of 2, so there are 3 × 4 of them: multiply the exponents.',
    ],
    ...exponentRule('power'),
    example: { b: 2, m: 3, n: 4, k: 12, P: 4096 },
    startWith: ['b', 'm', 'n'],
  },
  {
    id: 'm.8.exponent-rules~negative',
    title: 'Zero and negative exponents',
    use: 'Use this for “What is 5⁻¹?” or “Write 1/10 × 1/10 as a power of 10.”',
    assumptions: [
      'Each time the exponent drops by 1, the value is divided by the base.',
      'So b⁰ = 1 and b⁻ⁿ = 1 ÷ bⁿ.',
      'A negative exponent does not make the value negative.',
    ],
    variables: [
      whole('b', 'b', 'Base', 2, 10),
      whole('n', 'n', 'Exponent', -6, 6),
      {
        id: 'P',
        symbol: 'P',
        name: 'Value',
        min: 0,
        max: 1000000,
        fraction: 1000000,
        derived: true,
      },
    ],
    relations: [
      {
        ...derive('P = b^n', 'P', ['b', 'n'], '{P} = {b}^{n}', (v) => v.b! ** v.n!),
        check: (v: Values) =>
          v.n! < 0
            ? `1 ÷ ${v.b}${sup(-v.n!)} = ${fmtP(v.P!)}`
            : `${v.b}${sup(v.n!)} = ${fmtP(v.P!)}`,
      },
    ],
    steps: {
      'P = b^n': {
        P: {
          expr: (v: Values) => (v.n! < 0 ? `1 ÷ {b}^${-v.n!}` : '{b}^{n}'),
          how: (v: Values) =>
            v.n! < 0
              ? 'A negative exponent is 1 divided by the power with the positive exponent.'
              : v.n === 0
                ? 'Any base (not 0) to the power 0 is 1.'
                : 'Multiply the base by itself as many times as the exponent says.',
          work: (v: Values) => {
            const top = Math.max(v.n!, 1) + 2;
            const rows = [];
            for (let e = top; e >= Math.min(v.n!, 0); e--) {
              const x = v.b! ** e;
              rows.push(`${v.b}${sup(e)} = ${e < 0 ? `1/${fmt(v.b! ** -e)}` : fmt(x)}`);
            }
            return [`${rows.join(', ')}: each step down divides by ${v.b}.`];
          },
          written: false,
        },
      },
    },
    example: { b: 5, n: -1, P: 0.2 },
    startWith: ['b', 'n'],
    representation: {
      kind: 'table',
      sweep: 'n',
      output: 'P',
      params: ['b'],
      rows: [3, 2, 1, 0, -1, -2, -3],
    },
  },

  // ── Scientific notation (8.EE.3–4) ──
  {
    id: 'm.8.scientific-notation',
    assumptions: [
      'A number in scientific notation is a number from 1 up to 10 times a power of ten.',
      'Each power of ten is ten times the one before it, so the ruler steps by × 10.',
      'A negative power of ten is a number under 1: 10⁻⁴ = 0.0001.',
      'A calculator shows 9.8413 02 for 9.8413 × 10².',
    ],
    variables: [
      { id: 'N', symbol: 'N', name: 'Number', min: 1e-12, max: 1e13, full: true },
      MANTISSA('a', 'Number from 1 up to 10'),
      whole('n', 'n', 'Power of ten', -12, 12),
    ],
    relations: [
      {
        id: 'N = a × 10^n',
        display: '{N} = {a} × 10^{n}',
        vars: ['N', 'a', 'n'],
        residual: (v: Values) => v.N! - v.a! * 10 ** v.n!,
        solve: {
          N: (v: Values) => exact(v.a! * 10 ** v.n!),
          a: (v: Values) => exact(v.N! / 10 ** v.n!),
        },
      },
      {
        id: 'n from N',
        display: '{n} = exponent of the power of ten at or below {N}',
        vars: ['n', 'N'],
        residual: (v: Values) => v.n! - Math.floor(Math.log10(v.N!) + 1e-9),
        solve: {
          n: (v: Values) => (v.N! > 0 ? Math.floor(Math.log10(v.N!) + 1e-9) : undefined),
          N: () => undefined,
        },
      },
    ],
    steps: {
      'N = a × 10^n': {
        N: {
          expr: '{a} × 10^{n}',
          how: 'Multiply by 10 once for each power: the point moves right n places, or left if n is negative.',
          written: false,
        },
        a: {
          expr: '{N} ÷ 10^{n}',
          how: 'Divide by the power of ten to leave one digit, not 0, before the point.',
          written: false,
        },
      },
      'n from N': {
        n: {
          expr: 'exponent of the power of ten at or below {N}',
          how: 'Count how many places the point moves to leave one digit, not 0, before it.',
        },
      },
    },
    example: { N: 470000, a: 4.7, n: 5 },
    startWith: ['N'],
    representation: { kind: 'powerScale', number: 'N', mantissa: 'a', exponent: 'n' },
  },
  {
    id: 'm.8.scientific-notation~compare',
    title: 'Which is bigger, and how many times',
    use: 'Use this for “Which is greater, 1.03 × 10⁸ or 3.01 × 10³, and about how many times?”',
    assumptions: [
      'Compare the powers of ten first: the bigger exponent wins.',
      'With the same power, compare the numbers in front.',
      'To find how many times, divide the fronts and subtract the exponents.',
    ],
    variables: [
      MANTISSA('a', 'Front of the first'),
      whole('n', 'n', 'Power of the first', -12, 12),
      MANTISSA('c', 'Front of the second'),
      whole('k', 'k', 'Power of the second', -12, 12),
      sciNumber('P', 'P', 'First number'),
      sciNumber('Q', 'Q', 'Second number'),
      sciNumber('t', 't', 'Times as big'),
    ],
    relations: [
      derive('P = a × 10^n', 'P', ['a', 'n'], '{P} = {a} × 10^{n}', (v) => v.a! * 10 ** v.n!),
      derive('Q = c × 10^k', 'Q', ['c', 'k'], '{Q} = {c} × 10^{k}', (v) => v.c! * 10 ** v.k!),
      {
        ...derive(
          't = (a ÷ c) × 10^(n − k)',
          't',
          ['a', 'c', 'n', 'k'],
          '{t} = ({a} ÷ {c}) × 10^({n} − {k})',
          (v) => (v.a! / v.c!) * 10 ** (v.n! - v.k!),
        ),
        check: (v: Values) =>
          `${sci(v.P!)} ÷ ${sci(v.Q!)} = ${formatNumber(v.t!, { scientific: true })}`,
      },
    ],
    steps: {
      'P = a × 10^n': { P: { expr: '{a} × 10^{n}', how: 'The first number.', written: false } },
      'Q = c × 10^k': { Q: { expr: '{c} × 10^{k}', how: 'The second number.', written: false } },
      't = (a ÷ c) × 10^(n − k)': {
        t: {
          expr: '({a} ÷ {c}) × 10^({n} − {k})',
          how: 'Divide the fronts, and subtract the exponents for the powers of ten.',
          written: false,
        },
      },
    },
    example: { a: 1, n: 6, c: 2, k: 3, P: 1e6, Q: 2000, t: 500 },
    startWith: ['a', 'n', 'c', 'k'],
    pictureLabels: ['Q', 't'],
    representation: { kind: 'powerScale', number: 'P', mantissa: 'a', exponent: 'n' },
  },
  {
    id: 'm.8.scientific-notation~multiply',
    title: 'Multiply in scientific notation',
    use: 'Use this for “(3.1 × 10⁴) × (2 × 10⁶)”.',
    assumptions: [
      'Multiply the fronts and add the exponents.',
      'If the front reaches 10, move the point once and add 1 to the exponent.',
      'Dividing works the same way: divide the fronts and subtract the exponents.',
    ],
    variables: [
      MANTISSA('a', 'Front of the first'),
      whole('n', 'n', 'Power of the first', -12, 12),
      MANTISSA('c', 'Front of the second'),
      whole('k', 'k', 'Power of the second', -12, 12),
      { id: 'p', symbol: 'p', name: 'Front of the product', min: 1, max: 9.9999, derived: true },
      { ...whole('e', 'e', 'Power of the product', -25, 25), derived: true },
      sciNumber('P', 'P', 'Product'),
    ],
    relations: [
      {
        ...derive(
          'p = front of a × c',
          'p',
          ['a', 'c'],
          '{p} = {a} × {c}, moved to be from 1 up to 10',
          (v) => split(v.a! * v.c!).a,
        ),
        check: (v: Values) =>
          v.a! * v.c! >= 10
            ? `${fmt(v.a!)} × ${fmt(v.c!)} ÷ 10 = ${fmt(v.p!)}`
            : `${fmt(v.a!)} × ${fmt(v.c!)} = ${fmt(v.p!)}`,
      },
      {
        ...derive(
          'e = n + k (+ 1)',
          'e',
          ['n', 'k', 'a', 'c'],
          '{e} = {n} + {k}, plus 1 if {a} × {c} reached 10',
          (v) => v.n! + v.k! + (v.a! * v.c! >= 10 ? 1 : 0),
        ),
        check: (v: Values) =>
          v.a! * v.c! >= 10 ? `${v.n} + ${v.k} + 1 = ${v.e}` : `${v.n} + ${v.k} = ${v.e}`,
      },
      derive('P = p × 10^e', 'P', ['p', 'e'], '{P} = {p} × 10^{e}', (v) => v.p! * 10 ** v.e!),
    ],
    steps: {
      'p = front of a × c': {
        p: {
          expr: (v: Values) => (v.a! * v.c! >= 10 ? '{a} × {c} ÷ 10' : '{a} × {c}'),
          how: (v: Values) =>
            v.a! * v.c! >= 10
              ? 'Multiply the fronts. The product passed 10, so move the point one place left.'
              : 'Multiply the fronts.',
        },
      },
      'e = n + k (+ 1)': {
        e: {
          expr: (v: Values) => (v.a! * v.c! >= 10 ? '{n} + {k} + 1' : '{n} + {k}'),
          how: (v: Values) =>
            v.a! * v.c! >= 10
              ? 'Add the exponents, and 1 more for the point moved.'
              : 'Add the exponents.',
        },
      },
      'P = p × 10^e': { P: { expr: '{p} × 10^{e}', how: 'The product.', written: false } },
    },
    example: { a: 3.1, n: 4, c: 2, k: 6, p: 6.2, e: 10, P: 6.2e10 },
    startWith: ['a', 'n', 'c', 'k'],
    representation: { kind: 'powerScale', number: 'P', mantissa: 'p', exponent: 'e' },
  },
  {
    id: 'm.8.scientific-notation~add-subtract',
    title: 'Add and subtract in scientific notation',
    use: 'Use this for “5.3 × 10⁴ + 4.7 × 10⁴” or “How much larger is 1.71 × 10⁷ than 9.98 × 10⁶?”',
    assumptions: [
      'Write both with the same power of ten first: the first number’s.',
      'Then add or subtract the fronts.',
      'Rewrite the answer so its front is from 1 up to 10.',
    ],
    variables: [
      MANTISSA('a', 'Front of the first'),
      whole('n', 'n', 'Power of the first', -12, 12),
      MANTISSA('c', 'Front of the second'),
      whole('k', 'k', 'Power of the second', -12, 12),
      { ...whole('o', 'o', 'Add (1) or subtract (2)', 1, 2), allowed: [1, 2] },
      {
        id: 'g',
        symbol: 'g',
        name: 'Second front at the first power',
        min: 0,
        max: 1e12,
        derived: true,
      },
      sciNumber('S', 'S', 'Answer'),
      { id: 'u', symbol: 'u', name: 'Front of the answer', min: 1, max: 9.9999, derived: true },
      { ...whole('q', 'q', 'Power of the answer', -13, 13), derived: true },
    ],
    relations: [
      {
        // Taking away a bigger number would leave a negative, which the ruler can't show.
        id: 'answer > 0',
        constraint: true,
        display:
          'Subtracting ({o} = 2), the first {a} × 10^{n} is bigger than the second {c} × 10^{k}',
        vars: ['o', 'a', 'n', 'c', 'k'],
        residual: (v: Values) => (v.o !== 2 || v.a! * 10 ** v.n! > v.c! * 10 ** v.k! ? 0 : 1),
        solve: {},
      },
      {
        id: 'k ≤ n',
        constraint: true,
        display: 'The first power {n} is at least the second {k}',
        vars: ['k', 'n'],
        residual: (v: Values) => (v.k! <= v.n! ? 0 : 1),
        solve: {},
      },
      {
        ...derive(
          'g = c × 10^(k − n)',
          'g',
          ['c', 'k', 'n'],
          '{g} = {c} × 10^({k} − {n})',
          (v) => v.c! * 10 ** (v.k! - v.n!),
        ),
      },
      {
        ...derive(
          'S = (a ± g) × 10^n',
          'S',
          ['a', 'g', 'o', 'n'],
          '{S} = ({a} + or − {g}) × 10^{n}, as {o} says',
          (v) => (v.o === 2 ? v.a! - v.g! : v.a! + v.g!) * 10 ** v.n!,
        ),
        check: (v: Values) =>
          `(${fmt(v.a!)} ${v.o === 2 ? '−' : '+'} ${fmt(v.g!)}) × 10${sup(v.n!)} = ${formatNumber(v.S!, { scientific: true })}`,
      },
      derive(
        'q = power of S',
        'q',
        ['S'],
        '{q} = exponent of the power of ten at or below {S}',
        (v) => (v.S! > 0 ? split(v.S!).n : undefined),
      ),
      {
        ...derive('u = S ÷ 10^q', 'u', ['S', 'q'], '{u} = {S} ÷ 10^{q}', (v) => v.S! / 10 ** v.q!),
      },
    ],
    steps: {
      'answer > 0': {},
      'k ≤ n': {},
      'g = c × 10^(k − n)': {
        g: {
          expr: '{c} × 10^({k} − {n})',
          how: 'Rewrite the second front for the first number’s power of ten.',
          written: false,
        },
      },
      'S = (a ± g) × 10^n': {
        S: {
          expr: (v: Values) => (v.o === 2 ? '({a} − {g}) × 10^{n}' : '({a} + {g}) × 10^{n}'),
          how: (v: Values) =>
            `${v.o === 2 ? 'Subtract' : 'Add'} the fronts, keep the power of ten, then move the point so one digit is before it.`,
          written: false,
        },
      },
      'q = power of S': {
        q: {
          expr: 'exponent of the power of ten at or below {S}',
          how: 'Count the places the point moves to leave one digit, not 0, before it.',
        },
      },
      'u = S ÷ 10^q': {
        u: {
          expr: '{S} ÷ 10^{q}',
          how: 'The front of the answer, from 1 up to 10.',
          written: false,
        },
      },
    },
    example: { a: 5.3, n: 4, c: 4.7, k: 4, o: 1, g: 4.7, S: 100000, u: 1, q: 5 },
    startWith: ['a', 'n', 'c', 'k', 'o'],
    pictureLabels: ['g', 'o'],
    representation: { kind: 'powerScale', number: 'S', mantissa: 'u', exponent: 'q' },
  },
  // ── Slope (8.EE.5–6) ──
  {
    id: 'm.8.slope',
    assumptions: [
      'The slope is the rise divided by the run between any two points on the line.',
      'Any two points give the same slope: the slope triangles are similar.',
      'A line going down to the right has a negative rise, so a negative slope.',
      'A run of 0 is a vertical line: it has no slope.',
    ],
    variables: [
      whole('x1', 'x₁', 'First x', -10, 10),
      whole('y1', 'y₁', 'First y', -10, 10),
      whole('x2', 'x₂', 'Second x', -10, 10),
      whole('y2', 'y₂', 'Second y', -10, 10),
      { ...whole('R', 'rise', 'Rise', -20, 20), derived: true },
      { ...whole('r', 'run', 'Run', -20, 20), derived: true },
      { id: 'm', symbol: 'm', name: 'Slope', min: -20, max: 20, fraction: 20, derived: true },
    ],
    relations: [
      RISE.relation,
      RUN.relation,
      {
        id: 'run ≠ 0',
        constraint: true,
        display: 'The run {r} is not 0',
        vars: ['r'],
        residual: (v: Values) => (v.r === 0 ? 1 : 0),
        solve: {},
      },
      derive('m = rise ÷ run', 'm', ['R', 'r'], '{m} = {R} ÷ {r}', (v) => div(v.R!, v.r!)),
    ],
    steps: {
      'R = y2 − y1': RISE.steps,
      'r = x2 − x1': RUN.steps,
      'run ≠ 0': {},
      'm = rise ÷ run': { m: { expr: '{R} ÷ {r}', how: 'Divide the rise by the run.' } },
    },
    example: { x1: -2, y1: -1, x2: 4, y2: 2, R: 3, r: 6, m: 0.5 },
    startWith: ['x1', 'y1', 'x2', 'y2'],
    representation: {
      kind: 'coordinatePlane',
      x: 'x1',
      y: 'y1',
      second: { x: 'x2', y: 'y2' },
      slope: 'm',
      rise: 'R',
      run: 'r',
      extent: 6,
      quadrants: 4,
    },
  },
  {
    id: 'm.8.slope~unit-rate-graph',
    title: 'Slope as a unit rate',
    use: 'Use this for “Priya runs 2 miles in 0.4 hours at a constant speed. What is her speed, and how far in 1.5 hours?”',
    assumptions: [
      'A constant speed makes a straight line through (0, 0): a proportional relationship.',
      'Its slope is the unit rate: the distance for 1 hour.',
      'Any other time: multiply it by the unit rate.',
    ],
    variables: [
      { id: 'x', symbol: 'x', name: 'Time', unit: 'h', units: ['h'], min: 0.1, max: 10, step: 0.1 },
      {
        id: 'y',
        symbol: 'y',
        name: 'Distance',
        unit: 'mi',
        units: ['mi'],
        min: 0,
        max: 100,
        step: 0.1,
      },
      {
        id: 'm',
        symbol: 'm',
        name: 'Unit rate',
        unit: 'mph',
        units: ['mph'],
        min: 0,
        max: 100,
        derived: true,
      },
      {
        id: 't',
        symbol: 't',
        name: 'Other time',
        unit: 'h',
        units: ['h'],
        min: 0,
        max: 10,
        step: 0.1,
      },
      {
        id: 'd',
        symbol: 'd',
        name: 'Distance then',
        unit: 'mi',
        units: ['mi'],
        min: 0,
        max: 1000,
        derived: true,
      },
    ],
    relations: [
      derive('m = y ÷ x', 'm', ['y', 'x'], '{m} = {y} ÷ {x}', (v) => div(v.y!, v.x!)),
      derive('d = m × t', 'd', ['m', 't'], '{d} = {m} × {t}', (v) => v.m! * v.t!),
    ],
    steps: {
      'm = y ÷ x': {
        m: { expr: '{y} ÷ {x}', how: 'The slope: the distance for each 1 hour.' },
      },
      'd = m × t': {
        d: { expr: '{m} × {t}', how: 'Go along the line to the other time: rate × time.' },
      },
    },
    example: { x: 0.4, y: 2, m: 5, t: 1.5, d: 7.5 },
    startWith: ['x', 'y', 't'],
    unitSystems: ['us'],
    representation: {
      kind: 'plot',
      x: { var: 'x', min: 0, max: 1 },
      y: { var: 'y', min: 0, max: 6 },
      params: ['m'],
      autoRange: true,
      unitRate: 'm',
      table: [0, 0.2, 0.4, 0.6, 0.8, 1],
    },
  },
  {
    id: 'm.8.slope~compare-rates',
    title: 'Compare two rates',
    use: 'Use this for “One company charges $196 for 8 cubic yards, the other $35 for 4. Which is cheaper per cubic yard?”',
    assumptions: [
      'Each company charges the same amount for every cubic yard: its line goes through (0, 0).',
      'Each rate is a slope: cost ÷ cubic yards, from any point on the line.',
      'The steeper line costs more for each cubic yard.',
    ],
    variables: [
      { id: 'x1', symbol: 'x₁', name: 'Cubic yards, first', min: 0.1, max: 100, step: 0.1 },
      { id: 'y1', symbol: 'y₁', name: 'Cost, first', unit: '$', min: 0, max: 10000, step: 0.01 },
      { id: 'x2', symbol: 'x₂', name: 'Cubic yards, second', min: 0.1, max: 100, step: 0.1 },
      { id: 'y2', symbol: 'y₂', name: 'Cost, second', unit: '$', min: 0, max: 10000, step: 0.01 },
      { id: 'm1', symbol: 'm₁', name: 'First rate', unit: '$', min: 0, max: 100000, derived: true },
      {
        id: 'm2',
        symbol: 'm₂',
        name: 'Second rate',
        unit: '$',
        min: 0,
        max: 100000,
        derived: true,
      },
      {
        id: 'd',
        symbol: 'd',
        name: 'Difference of the rates',
        unit: '$',
        min: -100000,
        max: 100000,
        derived: true,
      },
    ],
    relations: [
      derive('m₁ = y₁ ÷ x₁', 'm1', ['y1', 'x1'], '{m1} = {y1} ÷ {x1}', (v) => div(v.y1!, v.x1!)),
      derive('m₂ = y₂ ÷ x₂', 'm2', ['y2', 'x2'], '{m2} = {y2} ÷ {x2}', (v) => div(v.y2!, v.x2!)),
      derive('d = m₁ − m₂', 'd', ['m1', 'm2'], '{d} = {m1} − {m2}', (v) => v.m1! - v.m2!),
    ],
    steps: {
      'm₁ = y₁ ÷ x₁': {
        m1: { expr: '{y1} ÷ {x1}', how: 'The first company’s cost for 1 cubic yard.' },
      },
      'm₂ = y₂ ÷ x₂': {
        m2: { expr: '{y2} ÷ {x2}', how: 'The second company’s cost for 1 cubic yard.' },
      },
      'd = m₁ − m₂': {
        d: {
          expr: '{m1} − {m2}',
          how: (v: Values) =>
            v.d! > 0
              ? 'The first costs more for each cubic yard: the second is cheaper.'
              : v.d! < 0
                ? 'The second costs more for each cubic yard: the first is cheaper.'
                : 'They cost the same for each cubic yard.',
        },
      },
    },
    example: { x1: 8, y1: 196, x2: 4, y2: 35, m1: 24.5, m2: 8.75, d: 15.75 },
    startWith: ['x1', 'y1', 'x2', 'y2'],
    representation: {
      kind: 'lineSystem',
      lines: [
        { slope: 'm1', intercept: 0, label: 'First' },
        { slope: 'm2', intercept: 0, label: 'Second' },
      ],
      quadrants: 1,
      extent: { x: 10, y: 250 },
      axes: { x: 'Cubic yards', y: 'Cost ($)' },
    },
  },

  // ── Equations with the unknown on both sides (8.EE.7) ──
  {
    id: 'm.8.multi-step-equations',
    assumptions: [
      'Each x-block weighs the same unknown amount x; each counter weighs 1.',
      'Taking the same weight from both pans keeps the balance level.',
      'Gather the x-blocks on one side and the counters on the other, then divide.',
      'Check by putting x back into both sides.',
    ],
    variables: [
      whole('a', 'a', 'x-blocks on the left', -10, 10),
      whole('b', 'b', 'Counters on the left', -15, 15),
      whole('c', 'c', 'x-blocks on the right', -10, 10),
      whole('d', 'd', 'Counters on the right', -15, 15),
      {
        id: 'x',
        symbol: 'x',
        name: 'Weight of one x-block',
        min: -50,
        max: 50,
        fraction: 20,
        derived: true,
      },
    ],
    relations: [bothSides('a', 'b', 'c', 'd')],
    steps: bothSidesSteps('a', 'b', 'c', 'd'),
    example: { a: 3, b: 4, c: 1, d: 10, x: 3 },
    startWith: ['a', 'b', 'c', 'd'],
    representation: {
      kind: 'equationBalance',
      x: 'x',
      left: ['a', 'b'],
      right: ['c', 'd'],
      cancel: true,
    },
  },
  {
    id: 'm.8.multi-step-equations~negatives',
    title: 'Negatives on a balance',
    use: 'Use this for “5y + 13 = −43 − 3y” or “2x − 3 = −x + 6”.',
    assumptions: [
      'A balloon pulls its pan up: a balloon marked −x takes away one x, one marked −1 takes away 1.',
      'Adding the same to both sides keeps the balance level: add 3 to cancel a −3.',
      'The balance is level when both sides come to the same amount.',
    ],
    variables: [
      whole('a', 'a', 'x on the left', -10, 10),
      whole('b', 'b', 'Number on the left', -15, 15),
      whole('c', 'c', 'x on the right', -10, 10),
      whole('d', 'd', 'Number on the right', -15, 15),
      { id: 'x', symbol: 'x', name: 'x', min: -50, max: 50, fraction: 20, derived: true },
    ],
    relations: [bothSides('a', 'b', 'c', 'd')],
    steps: bothSidesSteps('a', 'b', 'c', 'd'),
    example: { a: 2, b: -3, c: -1, d: 6, x: 3 },
    startWith: ['a', 'b', 'c', 'd'],
    representation: {
      kind: 'equationBalance',
      x: 'x',
      left: ['a', 'b'],
      right: ['c', 'd'],
      cancel: true,
    },
  },
  {
    id: 'm.8.multi-step-equations~distribute',
    title: 'Brackets first',
    use: 'Use this for “2(3x + 2) = 2x + 28”.',
    assumptions: [
      'Multiply everything inside the brackets by the number outside: p(ax + b) = pax + pb.',
      'Then solve Ax + B = cx + d as on the balance.',
      'On a graph, each side is a line; the solution is the x where they cross.',
    ],
    variables: [
      { ...whole('p', 'p', 'Number outside', -12, 12) },
      whole('a', 'a', 'x in the brackets', -12, 12),
      whole('b', 'b', 'Number in the brackets', -50, 50),
      whole('c', 'c', 'x on the right', -50, 50),
      whole('d', 'd', 'Number on the right', -500, 500),
      { ...whole('A', 'A', 'x after multiplying out', -144, 144), derived: true },
      { ...whole('B', 'B', 'Number after multiplying out', -600, 600), derived: true },
      { id: 'x', symbol: 'x', name: 'x', min: -1000, max: 1000, fraction: 20, derived: true },
      {
        id: 'y',
        symbol: 'y',
        name: 'Value of each side',
        min: -100000,
        max: 100000,
        derived: true,
      },
    ],
    relations: [
      {
        id: 'p ≠ 0',
        constraint: true,
        display: 'The number outside {p} is not 0',
        vars: ['p'],
        residual: (v: Values) => (v.p === 0 ? 1 : 0),
        solve: {},
      },
      derive('A = p × a', 'A', ['p', 'a'], '{A} = {p} × {a}', (v) => v.p! * v.a!),
      derive('B = p × b', 'B', ['p', 'b'], '{B} = {p} × {b}', (v) => v.p! * v.b!),
      bothSides('A', 'B', 'c', 'd'),
      derive(
        'y = c × x + d',
        'y',
        ['c', 'x', 'd'],
        '{y} = {c} × {x} + {d}',
        (v) => v.c! * v.x! + v.d!,
      ),
    ],
    steps: {
      'p ≠ 0': {},
      'A = p × a': {
        A: { expr: '{p} × {a}', how: 'Multiply the x in the brackets by the number outside.' },
      },
      'B = p × b': {
        B: {
          expr: '{p} × {b}',
          how: 'Multiply the number in the brackets too: every term inside.',
        },
      },
      ...bothSidesSteps('A', 'B', 'c', 'd'),
      'y = c × x + d': { y: { expr: '{c} × {x} + {d}', how: 'Check: both sides come to this.' } },
    },
    example: { p: 2, a: 3, b: 2, c: 2, d: 28, A: 6, B: 4, x: 6, y: 40 },
    startWith: ['p', 'a', 'b', 'c', 'd'],
    representation: {
      kind: 'lineSystem',
      lines: [
        { slope: 'A', intercept: 'B', label: 'Left side' },
        { slope: 'c', intercept: 'd', label: 'Right side' },
      ],
      solution: { x: 'x', y: 'y' },
      extent: { x: 10, y: 50 },
    },
  },
  {
    id: 'm.8.multi-step-equations~fraction-coefficient',
    title: 'Clear the fraction',
    use: 'Use this for “2/5 b + 1 = −11”.',
    assumptions: [
      'Multiply every term on both sides by the denominator: the whole side, not just the fraction.',
      'Then p × x + R = S has whole numbers.',
      'Take R from both sides, then divide by p.',
    ],
    variables: [
      whole('p', 'p', 'Numerator', -12, 12),
      whole('q', 'q', 'Denominator', 1, 12),
      whole('r', 'r', 'Number added', -50, 50),
      whole('s', 's', 'Right side', -200, 200),
      { ...whole('R', 'R', 'Added, times q', -600, 600), derived: true },
      { ...whole('S', 'S', 'Right side, times q', -2400, 2400), derived: true },
      { id: 'x', symbol: 'x', name: 'x', min: -10000, max: 10000, fraction: 20, derived: true },
      { id: 'k', symbol: 'k', name: 'Slope p/q', min: -12, max: 12, fraction: 12, derived: true },
    ],
    relations: [
      {
        id: 'p ≠ 0',
        constraint: true,
        display: 'The numerator {p} is not 0',
        vars: ['p'],
        residual: (v: Values) => (v.p === 0 ? 1 : 0),
        solve: {},
      },
      derive('R = q × r', 'R', ['q', 'r'], '{R} = {q} × {r}', (v) => v.q! * v.r!),
      derive('S = q × s', 'S', ['q', 's'], '{S} = {q} × {s}', (v) => v.q! * v.s!),
      derive('x = (S − R) ÷ p', 'x', ['S', 'R', 'p'], '{x} = ({S} − {R}) ÷ {p}', (v) =>
        div(v.S! - v.R!, v.p!),
      ),
      derive('k = p ÷ q', 'k', ['p', 'q'], '{k} = {p} ÷ {q}', (v) => v.p! / v.q!),
    ],
    steps: {
      'p ≠ 0': {},
      'R = q × r': {
        R: { expr: '{q} × {r}', how: 'Multiply the added number by the denominator too.' },
      },
      'S = q × s': {
        S: { expr: '{q} × {s}', how: 'And the right side: every term on both sides.' },
      },
      'x = (S − R) ÷ p': {
        x: { expr: '({S} − {R}) ÷ {p}', how: 'Now p × x + R = S: take R away, then divide by p.' },
      },
      'k = p ÷ q': {
        k: { expr: '{p} ÷ {q}', how: 'The fraction in front of x: the slope of the left side.' },
      },
    },
    example: { p: 2, q: 5, r: 1, s: -11, R: 5, S: -55, x: -30, k: 0.4 },
    startWith: ['p', 'q', 'r', 's'],
    representation: {
      kind: 'linearFunction',
      slope: 'k',
      intercept: 'r',
      point: { x: 'x', y: 's' },
      extent: 10,
    },
  },

  // ── Systems of two linear equations (8.EE.8) ──
  (() => {
    const cross = crossing('m1', 'b1', 'm2', 'b2');
    return {
      id: 'm.8.systems-linear',
      assumptions: [
        'The solution is the point on both lines: where they cross.',
        'Set the two expressions for y equal, then solve for x.',
        'Lines with the same slope and different intercepts are parallel: no solution.',
        'Check the point in both equations.',
      ],
      variables: [
        signed('m1', 'm₁', 'First slope', 0.5),
        signed('b1', 'b₁', 'First intercept'),
        signed('m2', 'm₂', 'Second slope', 0.5),
        signed('b2', 'b₂', 'Second intercept'),
        {
          id: 'x',
          symbol: 'x',
          name: 'Solution x',
          min: -1000,
          max: 1000,
          fraction: 20,
          derived: true,
        },
        {
          id: 'y',
          symbol: 'y',
          name: 'Solution y',
          min: -10000,
          max: 10000,
          fraction: 20,
          derived: true,
        },
      ],
      relations: cross.relations,
      steps: cross.steps,
      example: { m1: 2, b1: -1, m2: -1, b2: 5, x: 2, y: 3 },
      startWith: ['m1', 'b1', 'm2', 'b2'],
      representation: {
        kind: 'lineSystem',
        lines: [
          { slope: 'm1', intercept: 'b1' },
          { slope: 'm2', intercept: 'b2' },
        ],
        solution: { x: 'x', y: 'y' },
        extent: 10,
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const cross = crossing('a', 'f', 'b', 'g', 'n', 'c');
    return {
      id: 'm.8.systems-linear~context',
      title: 'When do two plans cost the same?',
      use: 'Use this for “Gym A: $150 to join and $20 a month. Gym B: $60 and $35. When do they cost the same?”',
      assumptions: [
        'Each plan charges a starting amount plus the same amount every month.',
        'Where the lines cross, both cost the same.',
        'A negative rate is an amount going down: a tank losing 50 gallons an hour.',
      ],
      variables: [
        { ...whole('a', 'a', 'Plan A per month', -100, 100) },
        { ...whole('f', 'f', 'Plan A to start', 0, 1000) },
        { ...whole('b', 'b', 'Plan B per month', -100, 100) },
        { ...whole('g', 'g', 'Plan B to start', 0, 1000) },
        { id: 'n', symbol: 'n', name: 'Months', min: 0, max: 1000, derived: true },
        { id: 'c', symbol: 'C', name: 'Same amount', min: -100000, max: 100000, derived: true },
      ],
      relations: cross.relations,
      steps: cross.steps,
      example: { a: 20, f: 150, b: 35, g: 60, n: 6, c: 270 },
      startWith: ['a', 'f', 'b', 'g'],
      representation: {
        kind: 'lineSystem',
        lines: [
          { slope: 'a', intercept: 'f', label: 'Plan A' },
          { slope: 'b', intercept: 'g', label: 'Plan B' },
        ],
        solution: { x: 'n', y: 'c' },
        extent: { x: 12, y: 500 },
        quadrants: 1,
        axes: { x: 'Months', y: 'Amount' },
      },
    } satisfies ModuleDef;
  })(),
  {
    id: 'm.8.systems-linear~count-and-cost',
    title: 'How many of each',
    use: 'Use this for “5 videos cost $8.00. New releases are $2.50 and classics $1.00. How many of each?”',
    assumptions: [
      'Two equations: the count adds to n, and the cost adds to T.',
      'If all were the cheaper kind, the cost would be q × n. Each of the dearer kind adds p − q.',
      'A count must come out whole; if not, no mix of the two makes that total.',
    ],
    variables: [
      whole('n', 'n', 'Items in all', 1, 100),
      { id: 'T', symbol: 'T', name: 'Total cost', unit: '$', min: 0, max: 10000, step: 0.01 },
      {
        id: 'p',
        symbol: 'p',
        name: 'Price of the first kind',
        unit: '$',
        min: 0.01,
        max: 1000,
        step: 0.01,
      },
      {
        id: 'q',
        symbol: 'q',
        name: 'Price of the second kind',
        unit: '$',
        min: 0.01,
        max: 1000,
        step: 0.01,
      },
      { ...whole('x', 'x', 'How many of the first kind', 0, 100), derived: true },
      { ...whole('y', 'y', 'How many of the second kind', 0, 100), derived: true },
    ],
    relations: [
      {
        id: 'x = (T − q × n) ÷ (p − q)',
        display: '{x} = ({T} − {q} × {n}) ÷ ({p} − {q})',
        vars: ['x', 'T', 'q', 'n', 'p'],
        residual: (v: Values) => v.x! * (v.p! - v.q!) - (v.T! - v.q! * v.n!),
        solve: {
          x: (v: Values) => {
            const x = div(v.T! - v.q! * v.n!, v.p! - v.q!);
            return x === undefined ? undefined : exact(x);
          },
          T: (v: Values) => exact(v.q! * v.n! + v.x! * (v.p! - v.q!)),
          q: () => undefined,
          n: () => undefined,
          p: () => undefined,
        },
        message: (v: Values) => {
          if ([v.T, v.q, v.n, v.p].some((x) => x === undefined)) return undefined;
          if (v.p === v.q)
            return 'Both kinds cost the same, so the total can’t tell how many of each.';
          const x = (v.T! - v.q! * v.n!) / (v.p! - v.q!);
          return Math.abs(x - Math.round(x)) > 1e-9 || x < -1e-9 || x > v.n! + 1e-9
            ? 'The counts don’t come out whole numbers from 0 to n: no mix of the two makes that total.'
            : undefined;
        },
      },
      derive('y = n − x', 'y', ['n', 'x'], '{y} = {n} − {x}', (v) => v.n! - v.x!),
    ],
    steps: {
      'x = (T − q × n) ÷ (p − q)': {
        x: {
          expr: '({T} − {q} × {n}) ÷ ({p} − {q})',
          how: 'If all were the second kind, the cost is q × n. The extra, shared at p − q each, is the first kind.',
        },
        T: {
          expr: '{q} × {n} + {x} × ({p} − {q})',
          how: 'The cost if all were the second kind, plus the extra for each of the first kind.',
        },
      },
      'y = n − x': { y: { expr: '{n} − {x}', how: 'The rest are the second kind.' } },
    },
    example: { n: 5, T: 8, p: 2.5, q: 1, x: 2, y: 3 },
    startWith: ['n', 'T', 'p', 'q'],
    representation: {
      kind: 'table',
      sweep: 'x',
      output: 'T',
      params: ['n', 'p', 'q'],
      rows: (v: Values) => Array.from({ length: Math.min(v.n ?? 5, 12) + 1 }, (_, i) => i),
    },
  },
  (() => {
    const cross = crossing('M', 'K', 'N', 'L');
    return {
      id: 'm.8.systems-linear~standard-form',
      title: 'Lines written ax + by = c',
      use: 'Use this for “Which point is on both x + y = 4 and y = x?” (write y = x as −x + y = 0).',
      assumptions: [
        'Rewrite ax + by = c as y = −(a ÷ b)x + c ÷ b: the slope and the intercept.',
        'Then find where the two lines cross, as for y = mx + b.',
        'Or add or subtract the equations so one letter cancels (elimination).',
      ],
      variables: [
        signed('a', 'a', 'x in the first'),
        signed('b', 'b', 'y in the first'),
        signed('c', 'c', 'Right side of the first', 1, 50),
        signed('d', 'd', 'x in the second'),
        signed('e', 'e', 'y in the second'),
        signed('f', 'f', 'Right side of the second', 1, 50),
        {
          id: 'M',
          symbol: 'm₁',
          name: 'First slope',
          min: -100,
          max: 100,
          fraction: 12,
          derived: true,
        },
        {
          id: 'K',
          symbol: 'b₁',
          name: 'First intercept',
          min: -100,
          max: 100,
          fraction: 12,
          derived: true,
        },
        {
          id: 'N',
          symbol: 'm₂',
          name: 'Second slope',
          min: -100,
          max: 100,
          fraction: 12,
          derived: true,
        },
        {
          id: 'L',
          symbol: 'b₂',
          name: 'Second intercept',
          min: -100,
          max: 100,
          fraction: 12,
          derived: true,
        },
        {
          id: 'x',
          symbol: 'x',
          name: 'Solution x',
          min: -10000,
          max: 10000,
          fraction: 100,
          derived: true,
        },
        {
          id: 'y',
          symbol: 'y',
          name: 'Solution y',
          min: -10000,
          max: 10000,
          fraction: 100,
          derived: true,
        },
      ],
      relations: [
        {
          id: 'b, e ≠ 0',
          constraint: true,
          display: 'Both lines have y in them: {b} and {e} are not 0',
          vars: ['b', 'e'],
          residual: (v: Values) => (v.b !== 0 && v.e !== 0 ? 0 : 1),
          solve: {},
        },
        derive('m₁ = −a ÷ b', 'M', ['a', 'b'], '{M} = −{a} ÷ {b}', (v) => div(-v.a!, v.b!)),
        derive('b₁ = c ÷ b', 'K', ['c', 'b'], '{K} = {c} ÷ {b}', (v) => div(v.c!, v.b!)),
        derive('m₂ = −d ÷ e', 'N', ['d', 'e'], '{N} = −{d} ÷ {e}', (v) => div(-v.d!, v.e!)),
        derive('b₂ = f ÷ e', 'L', ['f', 'e'], '{L} = {f} ÷ {e}', (v) => div(v.f!, v.e!)),
        ...cross.relations,
      ],
      steps: {
        'b, e ≠ 0': {},
        'm₁ = −a ÷ b': {
          M: { expr: '−{a} ÷ {b}', how: 'Take ax to the other side and divide by b: the slope.' },
        },
        'b₁ = c ÷ b': {
          K: { expr: '{c} ÷ {b}', how: 'Divide the right side by b: the intercept.' },
        },
        'm₂ = −d ÷ e': { N: { expr: '−{d} ÷ {e}', how: 'The same for the second line.' } },
        'b₂ = f ÷ e': { L: { expr: '{f} ÷ {e}', how: 'The second line’s intercept.' } },
        ...cross.steps,
      },
      example: { a: 1, b: 1, c: 4, d: -1, e: 1, f: 0, M: -1, K: 4, N: 1, L: 0, x: 2, y: 2 },
      startWith: ['a', 'b', 'c', 'd', 'e', 'f'],
      representation: {
        kind: 'lineSystem',
        lines: [
          { slope: 'M', intercept: 'K' },
          { slope: 'N', intercept: 'L' },
        ],
        solution: { x: 'x', y: 'y' },
        extent: 10,
      },
    } satisfies ModuleDef;
  })(),
  {
    id: 'm.8.pythagorean',
    assumptions: [
      'The triangle has one right angle (90°).',
      'a and b are the legs, which form the right angle; c is the hypotenuse, the longest side.',
      'Distance between two points: the horizontal and vertical differences are the legs a and b.',
      'All three sides use the same unit.',
    ],
    variables: [
      { id: 'a', symbol: 'a', name: 'Leg a', unit: 'cm', min: 0, max: 100, step: 0.5 },
      { id: 'b', symbol: 'b', name: 'Leg b', unit: 'cm', min: 0, max: 100, step: 0.5 },
      { id: 'c', symbol: 'c', name: 'Hypotenuse', unit: 'cm', min: 0, max: 142 },
    ],
    relations: [
      {
        id: 'a² + b² = c²',
        display: '{a}² + {b}² = {c}²',
        vars: ['a', 'b', 'c'],
        residual: (v) => v.a! ** 2 + v.b! ** 2 - v.c! ** 2,
        // √ of a negative is NaN on purpose: the solver reports it as a conflict
        // (a hypotenuse shorter than a leg) instead of silently leaving the leg blank.
        solve: {
          c: (v) => Math.sqrt(v.a! ** 2 + v.b! ** 2),
          a: (v) => Math.sqrt(v.c! ** 2 - v.b! ** 2),
          b: (v) => Math.sqrt(v.c! ** 2 - v.a! ** 2),
        },
      },
    ],
    steps: {
      'a² + b² = c²': {
        c: { expr: '√({a}² + {b}²)', how: 'Square each leg, add them, then take the square root.' },
        a: {
          expr: '√({c}² − {b}²)',
          how: 'Subtract b² from both sides, then take the square root.',
        },
        b: {
          expr: '√({c}² − {a}²)',
          how: 'Subtract a² from both sides, then take the square root.',
        },
      },
    },
    example: { a: 3, b: 4, c: 5 },
    startWith: ['a', 'b'],
    representation: { kind: 'rightTriangle', a: 'a', b: 'b', c: 'c', extent: 5 },
  },
  {
    id: 'm.8.linear-functions',
    assumptions: [
      'The graph is a straight line, so y changes at a constant rate.',
      'm is the slope: how much y changes when x increases by 1 (rise over run).',
      'b is the y-intercept: the value of y when x = 0.',
    ],
    variables: [
      { id: 'x', symbol: 'x', name: 'Input x', min: -10, max: 10, step: 0.5 },
      { id: 'y', symbol: 'y', name: 'Output y', min: -110, max: 110 },
      { id: 'm', symbol: 'm', name: 'Slope', min: -10, max: 10, step: 0.5 },
      { id: 'b', symbol: 'b', name: 'y-intercept', min: -10, max: 10, step: 0.5 },
    ],
    relations: [
      {
        id: 'y = mx + b',
        display: '{y} = {m} × {x} + {b}',
        vars: ['y', 'm', 'x', 'b'],
        residual: (v) => v.y! - (v.m! * v.x! + v.b!),
        solve: {
          y: (v) => v.m! * v.x! + v.b!,
          b: (v) => v.y! - v.m! * v.x!,
          m: (v) => div(v.y! - v.b!, v.x!),
          x: (v) => div(v.y! - v.b!, v.m!),
        },
      },
    ],
    steps: {
      'y = mx + b': {
        y: {
          expr: '{m} × {x} + {b}',
          how: 'Start at b, then add the slope once for every step of x.',
        },
        b: { expr: '{y} − {m} × {x}', how: 'Subtract m·x from both sides.' },
        m: { expr: '({y} − {b}) ÷ {x}', how: 'Subtract b from both sides, then divide by x.' },
        x: {
          expr: '({y} − {b}) ÷ {m}',
          how: 'Subtract b from both sides, then divide by the slope.',
        },
      },
    },
    example: { m: 2, b: 1, x: 3, y: 7 },
    startWith: ['x', 'm', 'b'],
    representation: {
      kind: 'plot',
      x: { var: 'x', min: -10, max: 10 },
      y: { var: 'y', min: -20, max: 20 },
      params: ['m', 'b'],
      slopeTriangle: 'm',
      intercept: 'b',
    },
  },
];
