/**
 * Grades 9–12 round 2 gallery demos (group H2A: the sign box and number lines (H90, H89, H91, H92); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in. Spread into
 * gallery.ts.
 */
import { Phi } from '@/components/module/reps/statMath';
import { formatNumber } from '@/engine/format';
import type { Relation, Values, VariableDef } from '@/engine/types';

import { div } from './helpers';
import type { LayoutDef } from './layouts';
import { MATH_10_MODULES } from './math/10';
import { MATH_9_MODULES } from './math/9';
import type { ModuleDef, StepText } from './types';

type Solver = (v: Values) => number | number[] | undefined;
type Rule = { relation: Relation; steps: Record<string, StepText> };

const fmt = (x: number) => formatNumber(x);
/** Rounded to 12 significant figures, so 0.1 + 0.2 is 0.3 when a value is worked out. */
const exact = (x: number) => Number(x.toPrecision(12));

/** A value typed or worked out: min to max. */
const num = (
  id: string,
  symbol: string,
  name: string,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, min, max, ...more });
/** A whole-number value. */
const int = (
  id: string,
  symbol: string,
  name: string,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, min, max, step: 1, integer: true, ...more });
/** A sign box's value: 1 <, 2 ≤, 3 >, 4 ≥ (as `{s:sign}` stores it). */
const signVar = (id: string, name: string, allowed = [1, 2, 3, 4]) =>
  int(id, id, `${name} (${allowed.map((k) => `${k} ${SIGNS[k - 1]}`).join(', ')})`, 1, 6, {
    allowed,
  });

/** A relation with its steps, each variable's solver, expression and explanation. */
function rule(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  parts: Record<string, [Solver, StepText['expr'], StepText['how'], Partial<StepText>?]>,
  more: Partial<Relation> = {},
): Rule {
  const solve: Record<string, Solver> = {};
  const steps: Record<string, StepText> = {};
  for (const [v, [fn, expr, how, extra]] of Object.entries(parts)) {
    solve[v] = fn;
    if (fn.length > 0) steps[v] = { expr, how, ...extra };
  }
  for (const v of vars) if (!(v in solve)) solve[v] = () => undefined;
  return { relation: { id, display, vars, residual, solve, ...more }, steps };
}

/** A value worked out from others, never solved backwards. */
function derive(
  id: string,
  x: string,
  inputs: string[],
  display: string,
  f: (v: Values) => number | undefined,
  expr: StepText['expr'],
  how: StepText['how'],
  more: Partial<StepText> = {},
  rel: Partial<Relation> = {},
): Rule {
  return rule(
    id,
    display,
    [x, ...inputs],
    (v) => v[x]! - (f(v) ?? NaN),
    { [x]: [(v: Values) => f(v), expr, how, more] },
    rel,
  );
}

/** A rule the values must keep (b ≠ 0), with the message when they don't. */
const limit = (id: string, display: string, ok: (v: Values) => boolean, message: string): Rule => ({
  relation: {
    id,
    display,
    constraint: true,
    vars: [...new Set([...display.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!))],
    residual: (v: Values) => (ok(v) ? 0 : 1),
    solve: {},
    message: (v: Values) => (ok(v) ? undefined : message),
  },
  steps: {},
});

/** A demo from its rules. */
function page(d: Omit<ModuleDef, 'relations' | 'steps'> & { rules: Rule[] }): ModuleDef {
  const { rules, ...rest } = d;
  return {
    ...rest,
    relations: rules.map((r) => r.relation),
    steps: Object.fromEntries(rules.map((r) => [r.relation.id, r.steps])),
  };
}

/** The sign box's codes: 1 <, 2 ≤, 3 >, 4 ≥ (5 =, 6 ≠). */
const SIGNS = ['<', '≤', '>', '≥', '=', '≠'] as const;
/** Whether l (sign s) r is true. */
const compare = (l: number, s: number, r: number) =>
  s === 1 ? l < r : s === 2 ? l <= r : s === 3 ? l > r : l >= r;
/** 1 for true, 0 for false. */
const truth = (x: boolean) => (x ? 1 : 0);
/** A test value h against its truth, curved in h so it never reads as a straight-line rule. */
const tested = (h: number, t: number) => (h - t) * (1 + h * h);
/** A test that is 1 when true and 0 when false. */
const holdsVar = (id = 'h') =>
  int(id, id, 'Test is true (1) or false (0)', 0, 1, { derived: true });
/** " + 3" or " − 3": a signed number after an earlier term. */
const plus = (k: number, after = '') => ` ${k < 0 ? '−' : '+'} ${fmt(Math.abs(k))}${after}`;
/** "3(2) + 4 = 10": a number put into kx + n. */
const sideLine = (k: number, t: number, n: number) => {
  const total = exact(k * t + n);
  return {
    line: n
      ? `${fmt(k)}(${fmt(t)}) ${n < 0 ? '−' : '+'} ${fmt(Math.abs(n))} = ${fmt(total)}`
      : `${fmt(k)}(${fmt(t)}) = ${fmt(total)}`,
    total,
  };
};

/**
 * h = 1 when lhs (sign s) rhs holds for the test values, 0 when not: a test put into one
 * inequality, its work lines the substituted sides.
 */
function signTest(
  h: string,
  s: string,
  vars: string[],
  display: string,
  lhs: (v: Values) => number,
  rhs: (v: Values) => number,
  work: (v: Values) => string[],
  how: string,
): Rule {
  const ok = (v: Values) => truth(compare(lhs(v), v[s]!, rhs(v)));
  return rule(
    `${h} = test (${vars.join(', ')})`,
    display,
    [h, s, ...vars],
    (v) => tested(v[h]!, ok(v)),
    {
      [h]: [
        (v) => ok(v),
        (v) => `${ok(v)}`,
        how,
        {
          work: (v) => [
            ...work(v),
            `${fmt(exact(lhs(v)))} ${SIGNS[v[s]! - 1]} ${fmt(exact(rhs(v)))} is ${ok(v) ? 'true' : 'false'}`,
          ],
          written: false,
        },
      ],
    },
    { check: (v) => `${ok(v)} = ${v[h]}` },
  );
}

// ── H90: a sign box drives the picture ──

/** y (sign) mx + b: the half-plane from the sign box, and a test point. */
const halfPlane = page({
  id: 'g.m9-linear-inequalities-two-variables-sign',
  title: 'Graph y (sign) mx + b, the sign tapped',
  use: 'Use this for “Graph y ≥ 2x − 3 and test a point”, with any of the four signs.',
  assumptions: [
    'The boundary is y = mx + b: dashed for < and > (left out), solid for ≤ and ≥ (included).',
    'Shade above the line for > and ≥, below it for < and ≤.',
    'A test point is a solution when its y is in the shaded part at its x.',
  ],
  variables: [
    num('m', 'm', 'Slope', -10, 10, { step: 0.5 }),
    num('b', 'b', 'y-intercept', -10, 10, { step: 0.5 }),
    signVar('s', 'Sign'),
    num('tx', 'x₀', 'Test point x', -10, 10, { step: 0.5 }),
    num('ty', 'y₀', 'Test point y', -10, 10, { step: 0.5 }),
    num('yl', 'y_line', 'The line’s y at x₀', -120, 120, { derived: true }),
    holdsVar(),
  ],
  rules: [
    derive(
      'y_line = m x₀ + b',
      'yl',
      ['m', 'tx', 'b'],
      '{yl} = {m} × {tx} + {b}',
      (v) => v.m! * v.tx! + v.b!,
      '{m} × {tx} + {b}',
      'The boundary’s height at the test point’s x.',
    ),
    rule(
      'h = test',
      'test: {ty} (sign {s}) {yl} gives {h}',
      ['h', 'ty', 's', 'yl'],
      (v) => tested(v.h!, truth(compare(v.ty!, v.s!, v.yl!))),
      {
        h: [
          (v) => truth(compare(v.ty!, v.s!, v.yl!)),
          (v) => `${truth(compare(v.ty!, v.s!, v.yl!))}`,
          'Compare the test point’s y with the line’s: 1 is true (shaded), 0 is false.',
          {
            work: (v) => [
              `${fmt(v.ty!)} ${SIGNS[v.s! - 1]} ${fmt(v.yl!)} is ${compare(v.ty!, v.s!, v.yl!) ? 'true' : 'false'}`,
            ],
            written: false,
          },
        ],
      },
      { check: (v) => `${truth(compare(v.ty!, v.s!, v.yl!))} = ${v.h}` },
    ),
  ],
  example: { m: 2, b: -3, s: 4, tx: 1, ty: 0, yl: -1, h: 1 },
  startWith: ['m', 'b', 's', 'tx', 'ty'],
  equation: 'y {s:sign} {m}x + {b}',
  pictureLabels: ['tx', 'ty', 'yl', 'h'],
  representation: {
    kind: 'linearFunction',
    slope: 'm',
    intercept: 'b',
    shade: { sign: 's' },
    keep: ['tx', 'ty'],
    extent: 10,
  },
});

/** Two standard-form inequalities, each solved for y (the sign flips for a negative y term). */
const standardSystem = page({
  id: 'g.m9-inequality-systems-standard-form',
  title: 'System of inequalities in standard form',
  use: 'Use this for “Graph x − 2y < 2 and 2x + y ≤ 4 and test (−6, 2).”',
  assumptions: [
    'Solve each for y: divide by the y term, flipping the sign when it is negative.',
    'Dashed lines (< or >) are left out; solid ones (≤ or ≥) are included.',
    'The solutions are where the two shadings overlap.',
  ],
  variables: [
    num('a', 'a', 'First x term', -20, 20),
    num('b', 'b', 'First y term', -20, 20),
    signVar('s', 'First sign'),
    num('c', 'c', 'First number', -100, 100),
    num('d', 'd', 'Second x term', -20, 20),
    num('e', 'e', 'Second y term', -20, 20),
    signVar('t', 'Second sign'),
    num('f', 'f', 'Second number', -100, 100),
    num('m1', 'm₁', 'First slope', -400, 400, { derived: true, fraction: 20 }),
    num('b1', 'b₁', 'First y-intercept', -2000, 2000, { derived: true, fraction: 20 }),
    num('m2', 'm₂', 'Second slope', -400, 400, { derived: true, fraction: 20 }),
    num('b2', 'b₂', 'Second y-intercept', -2000, 2000, { derived: true, fraction: 20 }),
    num('tx', 'x₀', 'Test point x', -10, 10, { step: 0.5 }),
    num('ty', 'y₀', 'Test point y', -10, 10, { step: 0.5 }),
    holdsVar('h1'),
    holdsVar('h2'),
  ],
  rules: [
    signTest(
      'h1',
      's',
      ['a', 'tx', 'b', 'ty', 'c'],
      'test ({tx}, {ty}) in {a}x + {b}y (sign {s}) {c}: {h1}',
      (v) => v.a! * v.tx! + v.b! * v.ty!,
      (v) => v.c!,
      (v) => [
        `${fmt(v.a!)}(${fmt(v.tx!)})${plus(v.b!, `(${fmt(v.ty!)})`)} = ${fmt(exact(v.a! * v.tx! + v.b! * v.ty!))}`,
      ],
      'Put the test point into the first inequality: 1 is true, 0 is false.',
    ),
    signTest(
      'h2',
      't',
      ['d', 'tx', 'e', 'ty', 'f'],
      'test ({tx}, {ty}) in {d}x + {e}y (sign {t}) {f}: {h2}',
      (v) => v.d! * v.tx! + v.e! * v.ty!,
      (v) => v.f!,
      (v) => [
        `${fmt(v.d!)}(${fmt(v.tx!)})${plus(v.e!, `(${fmt(v.ty!)})`)} = ${fmt(exact(v.d! * v.tx! + v.e! * v.ty!))}`,
      ],
      'And into the second: the point is a solution when both are 1.',
    ),
    limit('b ≠ 0', '{b} is not 0', (v) => v.b !== 0, 'With no y term the boundary is upright.'),
    limit('e ≠ 0', '{e} is not 0', (v) => v.e !== 0, 'With no y term the boundary is upright.'),
    derive(
      'm₁ = −a ÷ b',
      'm1',
      ['a', 'b'],
      '{m1} = −{a} ÷ {b}',
      (v) => div(-v.a!, v.b!),
      '−{a} ÷ {b}',
      'Take ax from both sides, then divide by b: the slope is −a ÷ b.',
    ),
    derive(
      'b₁ = c ÷ b',
      'b1',
      ['c', 'b'],
      '{b1} = {c} ÷ {b}',
      (v) => div(v.c!, v.b!),
      '{c} ÷ {b}',
      (v) =>
        v.b! < 0
          ? `b is negative: dividing by it flips ${SIGNS[v.s! - 1] ?? 'the sign'}.`
          : 'Divide the number by b too; b is positive, so the sign stays.',
    ),
    derive(
      'm₂ = −d ÷ e',
      'm2',
      ['d', 'e'],
      '{m2} = −{d} ÷ {e}',
      (v) => div(-v.d!, v.e!),
      '−{d} ÷ {e}',
      'The same for the second: the slope is −d ÷ e.',
    ),
    derive(
      'b₂ = f ÷ e',
      'b2',
      ['f', 'e'],
      '{b2} = {f} ÷ {e}',
      (v) => div(v.f!, v.e!),
      '{f} ÷ {e}',
      (v) =>
        v.e! < 0
          ? `e is negative: dividing by it flips ${SIGNS[v.t! - 1] ?? 'the sign'}.`
          : 'Divide by e; e is positive, so the sign stays.',
    ),
  ],
  example: {
    a: 1,
    b: -2,
    s: 1,
    c: 2,
    d: 2,
    e: 1,
    t: 2,
    f: 4,
    m1: 0.5,
    b1: -1,
    m2: -2,
    b2: 4,
    tx: -6,
    ty: 2,
    h1: 1,
    h2: 1,
  },
  startWith: ['a', 'b', 's', 'c', 'd', 'e', 't', 'f', 'tx', 'ty'],
  equation: '{a}x + {b}y {s:sign} {c}\n{d}x + {e}y {t:sign} {f}',
  representation: {
    kind: 'lineSystem',
    lines: [
      { slope: 'm1', intercept: 'b1', shade: { sign: 's', flip: 'b' } },
      { slope: 'm2', intercept: 'b2', shade: { sign: 't', flip: 'e' } },
    ],
    test: { x: 'tx', y: 'ty' },
    extent: 10,
    fixed: true,
  },
});

/** The zeros of x² + bx + c, smallest first, from D = b² − 4c. */
function monicZeros(): Rule[] {
  const root = (id: string, sign: 1 | -1) =>
    derive(
      `${id} = (−b ${sign < 0 ? '−' : '+'} √D) ÷ 2`,
      id,
      ['b', 'D'],
      `{${id}} = (−{b} ${sign < 0 ? '−' : '+'} √{D}) ÷ 2`,
      (v) => (v.D! >= 0 ? (-v.b! + sign * Math.sqrt(v.D!)) / 2 : undefined),
      `(−{b} ${sign < 0 ? '−' : '+'} √{D}) ÷ 2`,
      sign < 0
        ? 'Solve x² + bx + c = 0 first: the quadratic formula with a = 1 and the minus sign.'
        : 'The plus sign gives the larger zero.',
    );
  return [
    derive(
      'D = b² − 4c',
      'D',
      ['b', 'c'],
      '{D} = {b}² − 4 × {c}',
      (v) => v.b! ** 2 - 4 * v.c!,
      '{b}² − 4 × {c}',
      'The discriminant, with a = 1.',
      {},
      {
        message: (v) =>
          v.D !== undefined && v.D < 0
            ? 'D is negative: the parabola never meets the x-axis, so it has no zeros to split the line.'
            : undefined,
      },
    ),
    root('x1', -1),
    root('x2', 1),
  ];
}

/** x² + bx + c (sign) 0: where the parabola is below or above the x-axis. */
const quadraticSign = page({
  id: 'g.m9-quadratic-formula-inequality-sign',
  title: 'Quadratic inequality, the sign tapped',
  use: 'Use this for “Solve x² − 2x − 8 < 0” or “x² − x − 6 ≥ 0”: tap the sign.',
  assumptions: [
    'Solve x² + bx + c = 0 first: its zeros split the number line.',
    'The parabola opens up: below the x-axis between its zeros, above it outside them.',
    'The zeros make it 0: ≤ and ≥ take them in, < and > leave them out.',
  ],
  variables: [
    int('b', 'b', 'x coefficient', -20, 20),
    int('c', 'c', 'Number term', -100, 100),
    signVar('s', 'Sign'),
    num('D', 'D', 'Discriminant', -400, 800, { derived: true }),
    num('x1', 'x₁', 'Smaller zero', -40, 40, { derived: true }),
    num('x2', 'x₂', 'Larger zero', -40, 40, { derived: true }),
    num('n', 'x₀', 'Test number', -40, 40, { step: 0.5 }),
    holdsVar(),
  ],
  rules: [
    ...monicZeros(),
    signTest(
      'h',
      's',
      ['n', 'b', 'c'],
      'test {n} in x² + {b}x + {c} (sign {s}) 0: {h}',
      (v) => v.n! ** 2 + v.b! * v.n! + v.c!,
      () => 0,
      (v) => [
        `(${fmt(v.n!)})²${plus(v.b!, `(${fmt(v.n!)})`)}${plus(v.c!)} = ${fmt(exact(v.n! ** 2 + v.b! * v.n! + v.c!))}`,
      ],
      'Put the test number into the left side: 1 is true (a solution), 0 is false.',
    ),
  ],
  example: { b: -2, c: -8, s: 1, D: 36, x1: -2, x2: 4, n: 0, h: 1 },
  startWith: ['b', 'c', 's', 'n'],
  equation: 'x² + {b}x + {c} {s:sign} 0',
  pictureLabels: ['D', 'n', 'h'],
  representation: {
    kind: 'functionGraph',
    family: 'quadratic',
    form: 'standard',
    a: 1,
    b: 'b',
    c: 'c',
    inequality: { sign: 's' },
    shows: { zeros: ['x1', 'x2'] },
  },
});

/** l (sign) ax + b (sign) r: each bound's circle from its own sign box. */
const compoundSign = page({
  id: 'g.m9-linear-inequalities-compound-sign',
  title: 'Compound inequality, both signs tapped',
  use: 'Use this for “Solve −5 < 3x + 4 ≤ 13”, with < or ≤ on each side.',
  assumptions: [
    'Do the same to all three parts: take b from each, then divide each by a.',
    'Here a is positive, so the signs stay: < leaves a bound out, ≤ takes it in.',
    'The solutions are between the two bounds: both parts must be true.',
  ],
  variables: [
    int('l', 'l', 'Left number', -50, 50),
    signVar('s', 'Left sign', [1, 2]),
    int('a', 'a', 'x in the middle', 1, 10),
    int('b', 'b', 'Number in the middle', -50, 50),
    signVar('t', 'Right sign', [1, 2]),
    int('r', 'r', 'Right number', -50, 50),
    num('L', 'L', 'Lower bound', -100, 100, { derived: true, fraction: 12 }),
    num('U', 'U', 'Upper bound', -100, 100, { derived: true, fraction: 12 }),
    num('n', 'x₀', 'Test number', -20, 20, { step: 0.5 }),
    holdsVar(),
  ],
  rules: [
    derive(
      'L = (l − b) ÷ a',
      'L',
      ['l', 'b', 'a'],
      '{L} = ({l} − {b}) ÷ {a}',
      (v) => div(v.l! - v.b!, v.a!),
      '({l} − {b}) ÷ {a}',
      'Take b from the left part, then divide it by a.',
    ),
    derive(
      'U = (r − b) ÷ a',
      'U',
      ['r', 'b', 'a'],
      '{U} = ({r} − {b}) ÷ {a}',
      (v) => div(v.r! - v.b!, v.a!),
      '({r} − {b}) ÷ {a}',
      'Do the same to the right part.',
    ),
    rule(
      'h = test',
      'test {n} in {l} (sign {s}) {a}x + {b} (sign {t}) {r}: {h}',
      ['h', 'n', 'l', 's', 'a', 'b', 't', 'r'],
      (v) =>
        tested(
          v.h!,
          truth(compare(v.l!, v.s!, v.a! * v.n! + v.b!) && compare(v.a! * v.n! + v.b!, v.t!, v.r!)),
        ),
      {
        h: [
          (v) =>
            truth(
              compare(v.l!, v.s!, v.a! * v.n! + v.b!) && compare(v.a! * v.n! + v.b!, v.t!, v.r!),
            ),
          (v) =>
            `${truth(compare(v.l!, v.s!, v.a! * v.n! + v.b!) && compare(v.a! * v.n! + v.b!, v.t!, v.r!))}`,
          'Put the test number in the middle: both parts must be true. 1 is true, 0 is false.',
          {
            work: (v) => {
              const m = sideLine(v.a!, v.n!, v.b!);
              const ok = compare(v.l!, v.s!, m.total) && compare(m.total, v.t!, v.r!);
              return [
                m.line,
                `${fmt(v.l!)} ${SIGNS[v.s! - 1]} ${fmt(m.total)} ${SIGNS[v.t! - 1]} ${fmt(v.r!)} is ${ok ? 'true' : 'false'}`,
              ];
            },
            written: false,
          },
        ],
      },
      {
        check: (v) =>
          `${truth(compare(v.l!, v.s!, v.a! * v.n! + v.b!) && compare(v.a! * v.n! + v.b!, v.t!, v.r!))} = ${v.h}`,
      },
    ),
  ],
  example: { l: -5, s: 1, a: 3, b: 4, t: 2, r: 13, L: -3, U: 3, n: 0, h: 1 },
  startWith: ['l', 's', 'a', 'b', 't', 'r', 'n'],
  equation: '{l} {s:sign} {a}x + {b} {t:sign} {r}',
  representation: {
    kind: 'integerLine',
    value: 'L',
    second: 'U',
    min: -20,
    max: 20,
    compound: { join: 'and', closed: ['s', 't'], test: 'n' },
  },
});

/** The p-value for Hₐ's sign: the left tail, the right tail, or both past |z|. */
const pValue = (z: number, s: number) =>
  s <= 2 ? Phi(z) : s <= 4 ? 1 - Phi(z) : 2 * (1 - Phi(Math.abs(z)));

/** A one-proportion z-test whose tail follows Hₐ's sign. */
const tailSign = page({
  id: 'g.m12-hypothesis-testing-sign',
  title: 'One-proportion z-test, Hₐ’s sign chosen',
  use: 'Use this for “Test H₀: p = 0.5 against Hₐ: p ≠ 0.5 (or < or >) with 60 of 100.”',
  assumptions: [
    'H₀: p = p₀; Hₐ says p < p₀, p > p₀ or p ≠ p₀ (1 <, 3 >, 6 ≠).',
    'The sample is random, with np₀ ≥ 10 and n(1 − p₀) ≥ 10, so p̂ is close to normal.',
    'The p-value is the tail Hₐ points to: left, right, or both past |z|.',
  ],
  variables: [
    num('p0', 'p₀', 'Proportion if H₀ is true', 0.01, 0.99, { step: 0.01 }),
    signVar('s', 'Hₐ’s sign', [1, 3, 6]),
    int('n', 'n', 'Sample size', 1, 100000),
    int('k', 'k', 'Successes in the sample', 0, 100000),
    num('p', 'p̂', 'Sample proportion', 0, 1, { step: 0.0001, derived: true }),
    num('E', 'SE', 'Standard error if H₀ is true', 0.00001, 1, { step: 0.0001, derived: true }),
    num('z', 'z', 'Test statistic', -1e6, 1e6, { step: 0.01, derived: true }),
    num('P', 'P', 'p-value', 0, 1, { step: 0.0001, derived: true }),
    num('a', 'α', 'Significance level', 0.001, 0.2, { step: 0.001 }),
  ],
  rules: [
    limit('k ≤ n', '{k} is at most {n}', (v) => v.k! <= v.n!, 'More successes than people.'),
    derive(
      'p̂ = k ÷ n',
      'p',
      ['k', 'n'],
      '{p} = {k} ÷ {n}',
      (v) => div(v.k!, v.n!),
      '{k} ÷ {n}',
      'The share of the sample with the trait.',
    ),
    derive(
      'SE = √(p₀(1 − p₀) ÷ n)',
      'E',
      ['p0', 'n'],
      '{E} = √({p0} × (1 − {p0}) ÷ {n})',
      (v) => Math.sqrt((v.p0! * (1 - v.p0!)) / v.n!),
      '√({p0} × (1 − {p0}) ÷ {n})',
      'If H₀ is true, p̂ spreads by √(p₀(1 − p₀) ÷ n): use p₀, not p̂.',
    ),
    derive(
      'z = (p̂ − p₀) ÷ SE',
      'z',
      ['p', 'p0', 'E'],
      '{z} = ({p} − {p0}) ÷ {E}',
      (v) => div(v.p! - v.p0!, v.E!),
      '({p} − {p0}) ÷ {E}',
      'How many standard errors p̂ is from p₀.',
    ),
    derive(
      'P from z and Hₐ',
      'P',
      ['z', 's'],
      'the p-value {P} for {z} and sign {s}',
      (v) => (v.s === 5 ? undefined : pValue(v.z!, v.s!)),
      (v) => (v.s! <= 2 ? 'Φ({z})' : v.s! <= 4 ? '1 − Φ({z})' : '2 × (1 − Φ(|{z}|))'),
      (v) =>
        v.s! <= 2
          ? 'Hₐ says less: the p-value is the area left of z.'
          : v.s! <= 4
            ? 'Hₐ says more: the p-value is the area right of z.'
            : 'Hₐ says not equal: both tails past |z| count.',
    ),
  ],
  standalone: { vars: ['a'], why: 'α is the cutoff: it only marks the rejection region.' },
  example: {
    p0: 0.5,
    s: 6,
    n: 100,
    k: 60,
    p: 0.6,
    E: 0.05,
    z: 2,
    P: 2 * (1 - Phi(2)),
    a: 0.05,
  },
  startWith: ['p0', 's', 'n', 'k', 'a'],
  representation: {
    kind: 'normalCurve',
    mean: 'p0',
    sd: 'E',
    axis: 'Sample proportion p̂ if H₀ is true',
    test: { stat: 'z', alpha: 'a', tail: { sign: 's' }, p: 'P' },
    fixed: true,
  },
});

// ── H89: a number line window from its values, ticks by 5 or 10 ──

/** A Grade 9 page as a gallery demo `id`, with the picture option it waits on. */
function fromPage(pageId: string, id: string, title: string, extra: Partial<ModuleDef>) {
  const found = MATH_9_MODULES.find((m) => m.id === pageId);
  if (!found) throw new Error(`galleryHs2a: no page ${pageId}`);
  return { ...found, id, title, ...extra };
}

/** The line at ±20, a tick every 5 (the main page's range). */
const ticksBy5 = (() => {
  const base = fromPage(
    'm.9.linear-inequalities',
    'g.m9-linear-inequalities-ticks',
    'Inequality on a line at ±20, ticks by 5',
    {},
  );
  return {
    ...base,
    use: 'Use this for “Solve 3x − 4 > 5x + 6 and graph it”, the line from −20 to 20 by 5s.',
    representation: {
      ...(base.representation as Extract<ModuleDef['representation'], { kind: 'integerLine' }>),
      ticks: 5,
    },
  };
})();

/** Within d grams of a target: T − d ≤ w ≤ T + d on a line around T. */
const tolerance = page({
  id: 'g.m9-absolute-value-tolerance',
  title: 'Tolerance: within d grams of a target',
  use: 'Use this for “A 350 g box may be off by 6 g. Is a 343 g box all right?”',
  assumptions: [
    'Within d of the target T means |w − T| ≤ d: the weight is at most d from T.',
    'So T − d ≤ w ≤ T + d, both ends allowed.',
    'A weight is all right when its distance from T is at most d.',
  ],
  variables: [
    num('T', 'T', 'Target weight (g)', 1, 100000, { step: 0.5 }),
    num('d', 'd', 'Allowed difference (g)', 0, 10000, { step: 0.5 }),
    num('L', 'L', 'Lowest allowed weight (g)', -10000, 110000, { derived: true }),
    num('U', 'U', 'Highest allowed weight (g)', -10000, 110000, { derived: true }),
    num('w', 'w', 'Weight measured (g)', 0, 110000, { step: 0.5 }),
    num('k', 'k', 'Distance from the target (g)', 0, 110000, { derived: true }),
    holdsVar(),
  ],
  rules: [
    derive(
      'L = T − d',
      'L',
      ['T', 'd'],
      '{L} = {T} − {d}',
      (v) => exact(v.T! - v.d!),
      '{T} − {d}',
      'The lightest box allowed: d below the target.',
    ),
    derive(
      'U = T + d',
      'U',
      ['T', 'd'],
      '{U} = {T} + {d}',
      (v) => exact(v.T! + v.d!),
      '{T} + {d}',
      'The heaviest box allowed: d above the target.',
    ),
    derive(
      'k = |w − T|',
      'k',
      ['w', 'T'],
      '{k} = |{w} − {T}|',
      (v) => exact(Math.abs(v.w! - v.T!)),
      '|{w} − {T}|',
      'How far the weight is from the target, as a distance (never negative).',
    ),
    rule(
      'h = (k ≤ d)',
      'test: {k} ≤ {d} gives {h}',
      ['h', 'k', 'd'],
      (v) => tested(v.h!, truth(v.k! <= v.d!)),
      {
        h: [
          (v) => truth(v.k! <= v.d!),
          (v) => `${truth(v.k! <= v.d!)}`,
          'Compare the distance with the allowed difference: 1 is all right, 0 is not.',
          {
            work: (v) => [`${fmt(v.k!)} ≤ ${fmt(v.d!)} is ${v.k! <= v.d! ? 'true' : 'false'}`],
            written: false,
          },
        ],
      },
      { check: (v) => `${truth(v.k! <= v.d!)} = ${v.h}` },
    ),
  ],
  example: { T: 350, d: 6, L: 344, U: 356, w: 343, k: 7, h: 0 },
  startWith: ['T', 'd', 'w'],
  representation: {
    kind: 'integerLine',
    value: 'L',
    second: 'U',
    min: 0,
    max: 10,
    unit: 'g',
    fit: true,
    compound: {
      join: 'and',
      closed: [true, true],
      center: 'T',
      radius: 'd',
      letter: 'w',
      test: 'w',
    },
  },
});

// ── H91: |x − c| = d, two dots at c ± d ──

/** The absolute-value main page with the 'equal' line (its example, then d = 0). */
const [equalTwo, equalOne] = (
  [
    ['g.m9-absolute-value-equal', 'Absolute value equation: two dots at c ± d', undefined],
    [
      'g.m9-absolute-value-equal-one',
      'Absolute value equation equal to 0: one dot',
      { a: 2, b: -3, c: 0, h: 1.5, d: 0, x1: 1.5, x2: 1.5 },
    ],
  ] as const
).map(([id, title, example]) => {
  const base = fromPage('m.9.absolute-value', id, title, {});
  return {
    ...base,
    ...(example
      ? {
          example: { ...example },
          use: 'Use this for “Solve |2x − 3| = 0”: the one number 0 from the center.',
        }
      : {}),
    representation: {
      kind: 'integerLine' as const,
      value: 'x1',
      second: 'x2',
      min: -20,
      max: 20,
      compound: { join: 'equal' as const, center: 'h', radius: 'd' },
    },
  };
});

// ── H92: upright boundaries, parallel arrows and right angles, the given point ──

/** a ≤ x ≤ b and c ≤ y ≤ d: two upright boundaries and two flat ones make a box. */
const box = page({
  id: 'g.m9-inequality-systems-box',
  title: 'A box of points: a ≤ x ≤ b and c ≤ y ≤ d',
  use: 'Use this for “Shade the points with −3 ≤ x ≤ 2 and −1 ≤ y ≤ 4.”',
  assumptions: [
    'a ≤ x ≤ b is the strip between two upright lines, x = a and x = b.',
    'c ≤ y ≤ d is the strip between two flat lines, y = c and y = d.',
    'Where the strips overlap is a box: every point in it makes all four true.',
  ],
  variables: [
    num('a', 'a', 'Least x', -10, 10, { step: 0.5 }),
    num('b', 'b', 'Greatest x', -10, 10, { step: 0.5 }),
    num('c', 'c', 'Least y', -10, 10, { step: 0.5 }),
    num('d', 'd', 'Greatest y', -10, 10, { step: 0.5 }),
    num('W', 'W', 'Width of the box', -20, 20, { derived: true }),
    num('H', 'H', 'Height of the box', -20, 20, { derived: true }),
    num('tx', 'x₀', 'Test point x', -10, 10, { step: 0.5 }),
    num('ty', 'y₀', 'Test point y', -10, 10, { step: 0.5 }),
    holdsVar(),
  ],
  rules: [
    derive(
      'W = b − a',
      'W',
      ['b', 'a'],
      '{W} = {b} − {a}',
      (v) => exact(v.b! - v.a!),
      '{b} − {a}',
      'The box runs from x = a to x = b: its width is b − a.',
      {},
      {
        message: (v) =>
          v.a !== undefined && v.b !== undefined && v.a > v.b
            ? 'a is past b: no x is between them, so there is no box.'
            : undefined,
      },
    ),
    derive(
      'H = d − c',
      'H',
      ['d', 'c'],
      '{H} = {d} − {c}',
      (v) => exact(v.d! - v.c!),
      '{d} − {c}',
      'And from y = c up to y = d: its height is d − c.',
    ),
    rule(
      'h = test in the box',
      'test ({tx}, {ty}) in {a} ≤ x ≤ {b} and {c} ≤ y ≤ {d}: {h}',
      ['h', 'tx', 'ty', 'a', 'b', 'c', 'd'],
      (v) => tested(v.h!, truth(v.a! <= v.tx! && v.tx! <= v.b! && v.c! <= v.ty! && v.ty! <= v.d!)),
      {
        h: [
          (v) => truth(v.a! <= v.tx! && v.tx! <= v.b! && v.c! <= v.ty! && v.ty! <= v.d!),
          (v) => `${truth(v.a! <= v.tx! && v.tx! <= v.b! && v.c! <= v.ty! && v.ty! <= v.d!)}`,
          'Check x₀ between a and b, and y₀ between c and d: 1 when all four are true.',
          {
            work: (v) => [
              `${fmt(v.a!)} ≤ ${fmt(v.tx!)} ≤ ${fmt(v.b!)} is ${v.a! <= v.tx! && v.tx! <= v.b! ? 'true' : 'false'}`,
              `${fmt(v.c!)} ≤ ${fmt(v.ty!)} ≤ ${fmt(v.d!)} is ${v.c! <= v.ty! && v.ty! <= v.d! ? 'true' : 'false'}`,
            ],
            written: false,
          },
        ],
      },
      {
        check: (v) =>
          `${truth(v.a! <= v.tx! && v.tx! <= v.b! && v.c! <= v.ty! && v.ty! <= v.d!)} = ${v.h}`,
      },
    ),
  ],
  example: { a: -3, b: 2, c: -1, d: 4, W: 5, H: 5, tx: 1, ty: 2, h: 1 },
  startWith: ['a', 'b', 'c', 'd', 'tx', 'ty'],
  equation: '{a} ≤ x ≤ {b}\n{c} ≤ y ≤ {d}',
  representation: {
    kind: 'lineSystem',
    lines: [
      { slope: 0, intercept: 'c', shade: '≥' },
      { slope: 0, intercept: 'd', shade: '≤' },
    ],
    upright: [
      { x: 'a', shade: '≥' },
      { x: 'b', shade: '≤' },
    ],
    test: { x: 'tx', y: 'ty' },
    extent: 10,
    fixed: true,
  },
});

/** A Grade 10 page as a gallery demo `id`, with the picture option it waits on. */
function from10(pageId: string, id: string, title: string) {
  const found = MATH_10_MODULES.find((m) => m.id === pageId);
  if (!found || found.representation.kind !== 'lineSystem')
    throw new Error(`galleryHs2a: no line-system page ${pageId}`);
  return {
    ...found,
    id,
    title,
    representation: {
      ...found.representation,
      marks: true,
      given: { x: 'x0', y: 'y0' },
    },
  };
}

const parallelMarks = from10(
  'm.10.parallel-lines~parallel-line',
  'g.m10-parallel-lines-parallel-line-marks',
  'A parallel line through a point, marked',
);
const perpendicularMarks = from10(
  'm.10.parallel-lines~perpendicular-line',
  'g.m10-parallel-lines-perpendicular-line-marks',
  'A perpendicular line through a point, marked',
);

export const HS2A_GALLERY_MODULES: ModuleDef[] = [
  box,
  parallelMarks,
  perpendicularMarks,
  equalTwo!,
  equalOne!,
  ticksBy5,
  tolerance,
  halfPlane,
  standardSystem,
  quadraticSign,
  compoundSign,
  tailSign,
];

export const HS2A_GALLERY_LAYOUTS: LayoutDef[] = [];
