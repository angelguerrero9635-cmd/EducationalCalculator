/**
 * College Mathematics: the calculator modules of every course whose home field is
 * `math`, keyed by course topic (`<courseId>#<i>`, its problem types `<courseId>#<i>~<slug>`
 * after it), in taxonomy order. Course and topic titles come from taxonomy.ts. Layout pages are
 * in `../layouts/collegeMath.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { formatNumber } from '@/engine/format';

import type { Values } from '@/engine/types';

import type { ModuleDef } from '../types';

import { polyDerivative, polyForm } from './forms';
import {
  derive,
  exact,
  powerRule,
  realRoots,
  rel,
  rels,
  rule,
  signed,
  V,
  withStep,
} from './shared';

/** "−12(−1)³": a coefficient times a point raised to a whole power (no power when it is 1). */
const termAt = (k: number, x: number, p: number) =>
  p === 0 ? formatNumber(k) : `${formatNumber(k)}(${formatNumber(x)})${p === 1 ? '' : raised(p)}`;

/** Raised digits for a whole power: 3 → "³". */
const raised = (p: number) => [...String(p)].map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join('');

/**
 * The power rule on c·xⁿ as form lines and the value at x, written with y and dy/dx as the use
 * line is (a stated f(x) form would make the slope's "f′(x) = …" line read as an equation in f).
 */
const powerWork = (c: number, n: number, x: number) => {
  const f = Array.from({ length: n + 1 }, (_, i) => (i === 0 ? c : 0));
  return [
    `y(x) = ${polyForm(f)} → dy/dx = ${polyForm(polyDerivative(f))}`,
    n === 0
      ? `dy/dx at x = ${formatNumber(x)} = 0`
      : `dy/dx at x = ${formatNumber(x)} = ${termAt(n * c, x, n - 1)} = ${formatNumber(exact(powerRule(c, n, x)))}`,
  ];
};

const PI = Math.PI;

/** "6 cos(3x)": a number times a trig function of b·x ("−sin(x)" when the number is −1). */
const trigTerm = (k: number, fn: 'sin' | 'cos', b: number) => {
  const front = k === 1 ? '' : k === -1 ? '−' : `${formatNumber(k)} `;
  const inside = b === 1 ? 'x' : b === -1 ? '−x' : `${formatNumber(b)}x`;
  return `${front}${fn}(${inside})`;
};

/** An angle in radians as a fraction of π where it is one (π/2), else its decimal. */
const radiansShown = (t: number) => formatNumber(t, { pi: 'fraction' });

/** The derivative of A sin(bx) as a form line, then its value at x. */
const sineWork = (A: number, b: number, x: number) => {
  const t = b * x;
  const m = exact(A * b * Math.cos(t));
  return [
    `y(x) = ${trigTerm(A, 'sin', b)} → dy/dx = ${trigTerm(exact(A * b), 'cos', b)}`,
    `dy/dx at x = ${radiansShown(x)} = ${formatNumber(exact(A * b))} cos(${radiansShown(t)}) = ${formatNumber(Math.abs(m) < 1e-12 ? 0 : m)}`,
  ];
};

/** "−0.5e^(−0.2x)": a number times e to the power r·x ("−e^(x)" when the number is −1). */
const expTerm = (k: number, r: number) => {
  const front = k === 1 ? '' : k === -1 ? '−' : formatNumber(k);
  const inside = r === 1 ? 'x' : r === -1 ? '−x' : `${formatNumber(r)}x`;
  return `${front}e^(${inside})`;
};

/** The derivative of A·e^(kx) as a form line, then its value at x (k times the value there). */
const expWork = (A: number, k: number, x: number) => {
  const t = exact(k * x);
  return [
    `y(x) = ${expTerm(A, k)} → dy/dx = ${expTerm(exact(A * k), k)}`,
    `dy/dx at x = ${formatNumber(x)} = ${expTerm(exact(A * k), k).replace(/\(.*x\)$/, `(${formatNumber(t)})`)} = ${formatNumber(exact(A * k * Math.exp(t)))}`,
  ];
};

/** A sine or cosine with rounding crumbs (cos(π/2) ≈ 6 × 10⁻¹⁷) read as 0. */
const snap = (y: number) => (Math.abs(y) < 1e-9 ? 0 : y);

/** A relation that only places the picture (its value is `hidden`): no row, step or check. */
const hide = <R extends { relation: { hidden?: boolean } }>(r: R): R => ({
  ...r,
  relation: { ...r.relation, hidden: true },
});

/** x² + bx + c at x. */
const topAt = (v: Values, x: number) => x * x + v.b! * x + v.c!;

export const COLLEGE_MATH_MODULES: ModuleDef[] = [
  {
    // Calculus I → Limits and continuity: a quotient at x = a, 0/0 or k/0.
    id: 'he.math.calc-1#0',
    use: 'Use this for “Find the limit of (x² + x − 6) ÷ (x − 2) as x → 2.”',
    assumptions: [
      'f(x) = (x² + bx + c) ÷ (x − a). The limit is the value f(x) approaches as x → a, not f(a).',
      'Top 0 at a (0/0): x − a is a factor of the top. Cancel it (allowed, since x ≠ a) and put in x = a.',
      'Top k ≠ 0 at a (k/0): f grows without bound near a, a vertical asymptote; there is no finite limit.',
    ],
    variables: [
      V('a', 'a', 'Point x approaches', { min: -10, max: 10, step: 0.5 }),
      V('b', 'b', 'Coefficient of x on top', { min: -50, max: 50, step: 0.5 }),
      V('c', 'c', 'Constant on top', { min: -50, max: 50, step: 0.5 }),
      V('N', 'N', 'Top at x = a', { min: -2700, max: 2700, derived: true }),
      V('L', 'L', 'The limit', { min: -200, max: 200, step: 0.01, derived: true }),
      V('x', 'x', 'An x close to a', { min: -20, max: 20, step: 0.01 }),
      V('y', 'f(x)', 'f(x) there', { min: -100000, max: 100000, step: 0.0001 }),
    ],
    ...rels(
      rule(
        'x ≠ a',
        'f has no value at x = {a}, so {x} is not {a}',
        ['x', 'a'],
        (v) => v.x !== v.a,
        'f has no value at x = a (the bottom is 0 there): pick an x close to a instead.',
      ),
      derive(
        'N = a² + ab + c',
        '{N} = {a}² + {a} × {b} + {c}',
        'N',
        ['a', 'b', 'c'],
        (v) => topAt(v, v.a!),
        (v) => `${signed(v.a!)}² + ${signed(v.a!)} × ${signed(v.b!)} + ${signed(v.c!)}`,
        'Put x = a into the top. If it is 0, x − a is a factor; if not, the quotient is k/0.',
      ),
      rule(
        'N = 0',
        'The top is 0 at x = {a}: N = {N}',
        ['N', 'a'],
        (v) => v.N === 0,
        (v) => {
          // k/0: the sign of N over the sign of x − a on each side.
          const left = v.N! > 0 ? '−∞' : '+∞';
          const right = v.N! > 0 ? '+∞' : '−∞';
          return `The top is ${formatNumber(v.N!)} at x = ${formatNumber(v.a!)}, not 0: k/0. f has a vertical asymptote there and no finite limit: ${left} from the left, ${right} from the right.`;
        },
      ),
      withStep(
        rel(
          'L = 2a + b',
          '{L} = 2 × {a} + {b}',
          ['L', 'a', 'b', 'N'],
          (v) => v.L! - (2 * v.a! + v.b!),
          {
            L: [
              (v) => (v.N === 0 ? 2 * v.a! + v.b! : undefined),
              (v) => `2 × ${signed(v.a!)} + ${signed(v.b!)}`,
              'Factor: x² + bx + c = (x − a)(x + a + b). Cancel x − a, then put in x = a: a + a + b.',
            ],
          },
          {
            // The limit exists only when the top is 0 at a (0/0); k/0 has none.
            branches: [
              {
                name: '0/0, so factor and cancel',
                when: '{N} = 0',
                applies: (v) => v.N === 0,
                residual: (v) => v.L! - (2 * v.a! + v.b!),
                solve: { L: (v) => 2 * v.a! + v.b! },
              },
              {
                name: 'k/0, so no finite limit',
                when: '{N} ≠ 0',
                applies: (v) => v.N !== undefined && v.N !== 0,
                residual: () => NaN,
                solve: { L: () => undefined },
              },
            ],
          },
        ),
        'L',
        {
          work: (v) =>
            [-0.1, -0.01, 0.01].map((d) => {
              const x = Number((v.a! + d).toPrecision(12));
              return `x = ${formatNumber(x)}: f(x) = ${signed(x)} + ${signed(v.a!)} + ${signed(v.b!)} = ${formatNumber(Number((x + v.a! + v.b!).toPrecision(12)))}`;
            }),
        },
      ),
      rel(
        'f(x) = (x² + bx + c) ÷ (x − a)',
        '{y} = ({x}² + {b} × {x} + {c}) ÷ ({x} − {a})',
        ['y', 'x', 'a', 'b', 'c'],
        (v) => v.y! * (v.x! - v.a!) - topAt(v, v.x!),
        {
          y: [
            (v) => (v.x === v.a ? undefined : topAt(v, v.x!) / (v.x! - v.a!)),
            (v) =>
              `(${signed(v.x!)}² + ${signed(v.b!)} × ${signed(v.x!)} + ${signed(v.c!)}) ÷ (${signed(v.x!)} − ${signed(v.a!)})`,
            'Put x into the top and the bottom, then divide.',
          ],
        },
      ),
    ),
    example: { a: 2, b: 1, c: -6, N: 0, L: 5, x: 1.9, y: 4.9 },
    startWith: ['a', 'b', 'c', 'x'],
    representation: {
      kind: 'functionGraph',
      family: 'rational',
      top: [1, 'b', 'c'],
      poles: ['a'],
      limit: { x: 'a' },
      at: { x: 'x', y: 'y' },
      marks: ['asymptotes'],
    },
  },
  {
    // Calculus I → Limits and continuity: choose k so a two-piece function joins up.
    id: 'he.math.calc-1#0~continuity',
    title: 'Make a piecewise function continuous',
    use: 'Use this for “Find k so that f(x) = 3x + k (x < 2), x² + 1 (x ≥ 2) is continuous.”',
    assumptions: [
      'f(x) = mx + k for x < c, and x² + d for x ≥ c.',
      'f is continuous at c when the limit from the left equals f(c): the two pieces meet.',
      'Each piece is continuous on its own, so x = c is the only place to check.',
    ],
    variables: [
      V('c', 'c', 'Where the pieces meet', { min: -10, max: 10, step: 0.5 }),
      V('m', 'm', 'Slope of the left piece', { min: -20, max: 20, step: 0.5 }),
      V('k', 'k', 'Constant of the left piece', { min: -200, max: 200, step: 0.5 }),
      V('d', 'd', 'Constant of the right piece', { min: -100, max: 100, step: 0.5 }),
      V('Lm', 'L⁻', 'Limit from the left at c', { min: -300, max: 300, step: 0.01 }),
      V('fc', 'f(c)', 'Value at c (right piece)', { min: -300, max: 300, step: 0.01 }),
    ],
    ...rels(
      rel(
        'L⁻ = mc + k',
        '{Lm} = {m} × {c} + {k}',
        ['Lm', 'm', 'c', 'k'],
        (v) => v.Lm! - (v.m! * v.c! + v.k!),
        {
          Lm: [
            (v) => v.m! * v.c! + v.k!,
            (v) => `${signed(v.m!)} × ${signed(v.c!)} + ${signed(v.k!)}`,
            'The left piece is a line, so its limit at c is its value there: m·c + k.',
          ],
          k: [
            (v) => v.Lm! - v.m! * v.c!,
            (v) => `${signed(v.Lm!)} − ${signed(v.m!)} × ${signed(v.c!)}`,
            'Subtract m·c from the left limit.',
          ],
          m: [
            (v) => (v.c === 0 ? undefined : (v.Lm! - v.k!) / v.c!),
            (v) => `(${signed(v.Lm!)} − ${signed(v.k!)}) ÷ ${signed(v.c!)}`,
            'Subtract k, then divide by c.',
          ],
        },
      ),
      rel(
        'f(c) = c² + d',
        '{fc} = {c}² + {d}',
        ['fc', 'c', 'd'],
        (v) => v.fc! - (v.c! * v.c! + v.d!),
        {
          fc: [
            (v) => v.c! * v.c! + v.d!,
            (v) => `${signed(v.c!)}² + ${signed(v.d!)}`,
            'Put x = c into the right piece, which holds at c.',
          ],
          d: [
            (v) => v.fc! - v.c! * v.c!,
            (v) => `${signed(v.fc!)} − ${signed(v.c!)}²`,
            'Subtract c² from f(c).',
          ],
        },
      ),
      rel('L⁻ = f(c)', '{Lm} = {fc}', ['Lm', 'fc'], (v) => v.Lm! - v.fc!, {
        Lm: [(v) => v.fc!, '{fc}', 'Continuous at c: the left limit must equal f(c).'],
        fc: [(v) => v.Lm!, '{Lm}', 'Continuous at c: f(c) must equal the left limit.'],
      }),
    ),
    example: { c: 2, m: 3, d: 1, fc: 5, Lm: 5, k: -1 },
    startWith: ['c', 'm', 'd'],
    representation: {
      kind: 'functionGraph',
      family: 'piecewise',
      pieces: [
        { f: { family: 'linear', m: 'm', b: 'k' }, to: 'c', ends: '()' },
        { f: { family: 'quadratic', form: 'standard', a: 1, b: 0, c: 'd' }, from: 'c', ends: '[)' },
      ],
      limit: { x: 'c' },
    },
  },
  {
    // Calculus I → Limits and continuity: the intermediate value theorem and one bisection step.
    id: 'he.math.calc-1#0~ivt',
    title: 'The intermediate value theorem',
    use: 'Use this for “Show that x³ + x − 1 = 0 has a root between 0 and 1.”',
    assumptions: [
      'f(x) = x³ + px + q is a polynomial, so it is continuous on every interval [a, b].',
      'Intermediate value theorem: if f(a) and f(b) have opposite signs, f(c) = 0 for some c between a and b.',
      'One bisection step: check the midpoint m and keep the half where the sign still changes.',
    ],
    variables: [
      V('p', 'p', 'Coefficient of x', { min: -20, max: 20, step: 0.5 }),
      V('q', 'q', 'Constant', { min: -50, max: 50, step: 0.5 }),
      V('a', 'a', 'Left end', { min: -10, max: 10, step: 0.5 }),
      V('b', 'b', 'Right end', { min: -10, max: 10, step: 0.5 }),
      V('fa', 'f(a)', 'f at the left end', { min: -2000, max: 2000, step: 0.0001, derived: true }),
      V('fb', 'f(b)', 'f at the right end', { min: -2000, max: 2000, step: 0.0001, derived: true }),
      V('m', 'm', 'Midpoint', { min: -10, max: 10, step: 0.0001, derived: true }),
      V('fm', 'f(m)', 'f at the midpoint', { min: -2000, max: 2000, step: 0.0001, derived: true }),
    ],
    ...rels(
      rule(
        'a < b',
        'The left end {a} is below the right end {b}',
        ['a', 'b'],
        (v) => v.a! < v.b!,
        'Pick a left end a below the right end b.',
      ),
      derive(
        'f(a) = a³ + pa + q',
        '{fa} = {a}³ + {p} × {a} + {q}',
        'fa',
        ['a', 'p', 'q'],
        (v) => v.a! ** 3 + v.p! * v.a! + v.q!,
        (v) => `${signed(v.a!)}³ + ${signed(v.p!)} × ${signed(v.a!)} + ${signed(v.q!)}`,
        'Put x = a into f.',
      ),
      derive(
        'f(b) = b³ + pb + q',
        '{fb} = {b}³ + {p} × {b} + {q}',
        'fb',
        ['b', 'p', 'q'],
        (v) => v.b! ** 3 + v.p! * v.b! + v.q!,
        (v) => `${signed(v.b!)}³ + ${signed(v.p!)} × ${signed(v.b!)} + ${signed(v.q!)}`,
        'Put x = b into f.',
      ),
      rule(
        'f(a) × f(b) < 0',
        'The signs of {fa} and {fb} differ',
        ['fa', 'fb'],
        (v) => v.fa! * v.fb! <= 0,
        'f(a) and f(b) have the same sign, so the theorem promises nothing here: there may be no root, or an even number. Try other ends.',
      ),
      derive(
        'm = (a + b) ÷ 2',
        '{m} = ({a} + {b}) ÷ 2',
        'm',
        ['a', 'b'],
        (v) => (v.a! + v.b!) / 2,
        (v) => `(${signed(v.a!)} + ${signed(v.b!)}) ÷ 2`,
        'Halve the interval at its midpoint.',
      ),
      derive(
        'f(m) = m³ + pm + q',
        '{fm} = {m}³ + {p} × {m} + {q}',
        'fm',
        ['m', 'p', 'q'],
        (v) => v.m! ** 3 + v.p! * v.m! + v.q!,
        (v) => `${signed(v.m!)}³ + ${signed(v.p!)} × ${signed(v.m!)} + ${signed(v.q!)}`,
        (v) =>
          v.fm === 0
            ? 'f(m) = 0: the midpoint is the root.'
            : v.fm! < 0 === v.fa! < 0
              ? `f(m) has the sign of f(a), so the root is in [${formatNumber(v.m!)}, ${formatNumber(v.b!)}].`
              : `f(m) has the sign of f(b), so the root is in [${formatNumber(v.a!)}, ${formatNumber(v.m!)}].`,
      ),
    ),
    example: { p: 1, q: -1, a: 0, b: 1, fa: -1, fb: 1, m: 0.5, fm: -0.375 },
    startWith: ['p', 'q', 'a', 'b'],
    representation: {
      kind: 'functionGraph',
      family: 'polynomial',
      coefficients: [1, 0, 'p', 'q'],
      input: 'x',
      at: { x: 'm', y: 'fm' },
      // The interval [a, b] the theorem is about.
      shade: { from: 'a', to: 'b' },
      marks: ['zeros'],
    },
  },
  {
    // Calculus I → Limits and continuity: lim sin(kx) ÷ (mx) as x → 0.
    id: 'he.math.calc-1#0~special-trig',
    title: 'The limit of sin(kx) ÷ (mx)',
    use: 'Use this for “Find the limit of sin(3x) ÷ (2x) as x → 0.”',
    assumptions: [
      'x is in radians.',
      'sin θ ÷ θ → 1 as θ → 0 (squeeze: cos θ ≤ sin θ ÷ θ ≤ 1 near 0).',
      'sin(kx) ÷ (mx) = (k ÷ m) × sin(kx) ÷ (kx), so the limit is k ÷ m.',
    ],
    variables: [
      V('k', 'k', 'Number inside the sine', { min: -10, max: 10, step: 0.5 }),
      V('m', 'm', 'Number times x below', { min: -10, max: 10, step: 0.5 }),
      V('L', 'L', 'The limit', { min: -100, max: 100, step: 0.0001, derived: true }),
      V('x', 'x', 'An x close to 0 (radians)', { min: -1, max: 1, step: 0.001 }),
      V('r', 'r', 'sin(kx) ÷ (mx) there', { min: -100, max: 100, step: 0.00001 }),
    ],
    ...rels(
      rule(
        'k ≠ 0',
        'The number inside the sine {k} is not 0',
        ['k'],
        (v) => v.k !== 0,
        'With k = 0 the top is sin 0 = 0 everywhere: pick another k.',
      ),
      rule(
        'm ≠ 0',
        'The number below {m} is not 0',
        ['m'],
        (v) => v.m !== 0,
        'With m = 0 the bottom is 0 everywhere: pick another m.',
      ),
      rule(
        'x ≠ 0',
        'The quotient has no value at x = {x}',
        ['x'],
        (v) => v.x !== 0,
        'The quotient has no value at x = 0: pick an x close to 0.',
      ),
      derive(
        'L = k ÷ m',
        '{L} = {k} ÷ {m}',
        'L',
        ['k', 'm'],
        (v) => (v.m === 0 ? undefined : v.k! / v.m!),
        (v) => `${signed(v.k!)} ÷ ${signed(v.m!)}`,
        'Write it as (k ÷ m) × sin(kx) ÷ (kx); the second factor → 1.',
      ),
      rel(
        'r = sin(kx) ÷ (mx)',
        '{r} = sin({k} × {x}) ÷ ({m} × {x})',
        ['r', 'k', 'x', 'm'],
        (v) => v.r! * v.m! * v.x! - Math.sin(v.k! * v.x!),
        {
          r: [
            (v) => (v.x === 0 || v.m === 0 ? undefined : Math.sin(v.k! * v.x!) / (v.m! * v.x!)),
            (v) => `sin(${signed(v.k!)} × ${signed(v.x!)}) ÷ (${signed(v.m!)} × ${signed(v.x!)})`,
            'Work the sine in radians, then divide. The closer x is to 0, the closer r is to k ÷ m.',
          ],
        },
      ),
    ),
    example: { k: 3, m: 2, L: 1.5, x: 0.1, r: Math.sin(0.3) / 0.2 },
    startWith: ['k', 'm', 'x'],
    representation: {
      kind: 'table',
      sweep: 'x',
      output: 'r',
      params: ['k', 'm'],
      rows: [0.1, 0.01, 0.001, -0.001, -0.01, -0.1],
    },
  },
  {
    // Calculus I → Limits and continuity: ε–δ for a line, δ = ε ÷ |m|.
    id: 'he.math.calc-1#0~epsilon-delta',
    title: 'Find δ for a given ε (a line)',
    use: 'Use this for “For lim (3x − 1) = 5 as x → 2, find δ when ε = 0.06.”',
    assumptions: [
      'lim f(x) = L as x → a means: for every ε > 0 there is a δ > 0 with |f(x) − L| < ε whenever 0 < |x − a| < δ.',
      'For a line f(x) = mx + b, |f(x) − L| = |m| × |x − a|, so δ = ε ÷ |m| works (any smaller δ does too).',
    ],
    variables: [
      V('m', 'm', 'Slope', { min: -20, max: 20, step: 0.5 }),
      V('b', 'b', 'Intercept', { min: -50, max: 50, step: 0.5 }),
      V('a', 'a', 'Point x approaches', { min: -10, max: 10, step: 0.5 }),
      V('L', 'L', 'The limit', { min: -300, max: 300, step: 0.01, derived: true }),
      V('eps', 'ε', 'Allowed distance from L', { min: 0.0001, max: 10, step: 0.0001 }),
      V('delta', 'δ', 'Allowed distance from a', { min: 0.00001, max: 100, step: 0.00001 }),
    ],
    ...rels(
      rule(
        'm ≠ 0',
        'The slope {m} is not 0',
        ['m'],
        (v) => v.m !== 0,
        'With m = 0 the line is flat: every δ works. Pick a slope that is not 0.',
      ),
      derive(
        'L = ma + b',
        '{L} = {m} × {a} + {b}',
        'L',
        ['m', 'a', 'b'],
        (v) => v.m! * v.a! + v.b!,
        (v) => `${signed(v.m!)} × ${signed(v.a!)} + ${signed(v.b!)}`,
        'A line is continuous, so its limit at a is its value there.',
      ),
      rel(
        'δ = ε ÷ |m|',
        '{delta} = {eps} ÷ |{m}|',
        ['delta', 'eps', 'm'],
        (v) => v.delta! * Math.abs(v.m!) - v.eps!,
        {
          delta: [
            (v) => (v.m === 0 ? undefined : v.eps! / Math.abs(v.m!)),
            (v) => `${formatNumber(v.eps!)} ÷ |${formatNumber(v.m!)}|`,
            '|f(x) − L| = |m| × |x − a| < ε when |x − a| < ε ÷ |m|.',
          ],
          eps: [
            (v) => v.delta! * Math.abs(v.m!),
            (v) => `${formatNumber(v.delta!)} × |${formatNumber(v.m!)}|`,
            'The δ-band on x maps to a band |m| times as wide on y.',
          ],
        },
      ),
    ),
    example: { m: 3, b: -1, a: 2, L: 5, eps: 0.06, delta: 0.02 },
    startWith: ['m', 'b', 'a', 'eps'],
    representation: {
      kind: 'functionGraph',
      family: 'linear',
      m: 'm',
      b: 'b',
      band: { x: 'a', y: 'L', dx: 'delta', dy: 'eps' },
      fixed: true,
    },
  },
  {
    // Calculus I → Derivatives and differentiation rules: c·xⁿ by the power rule, its tangent.
    id: 'he.math.calc-1#1',
    use: 'Use this for “Find the slope of y = 3x⁴ at x = −1.”',
    assumptions: [
      'f′(x) = lim (h → 0) [f(x + h) − f(x)] ÷ h: the slope of the tangent line at x.',
      'Power rule: the derivative of xⁿ is n·xⁿ⁻¹. Constant-multiple rule: c stays in front.',
      'f(x) = c·xⁿ with n a whole number 0–6. With n = 0, f is the constant c and its slope is 0.',
    ],
    variables: [
      V('c', 'c', 'Constant in front', { min: -5, max: 5, step: 0.5 }),
      V('n', 'n', 'Power', { min: 0, max: 6, step: 1, integer: true }),
      V('x', 'x', 'Point', { min: -3, max: 3, step: 0.1 }),
      V('y', 'f(x)', 'Value there', { min: -4000, max: 4000, step: 0.0001 }),
      V('m', 'f′(x)', 'Slope of the tangent', { min: -8000, max: 8000, step: 0.0001 }),
    ],
    ...rels(
      rel(
        'f(x) = c·xⁿ',
        '{y} = {c} × {x}^{n}',
        ['y', 'c', 'x', 'n'],
        (v) => v.y! - v.c! * v.x! ** v.n!,
        {
          y: [
            (v) => v.c! * v.x! ** v.n!,
            '{c} × {x}^{n}',
            'Raise x to the power n, then multiply by c.',
          ],
          c: [
            (v) => {
              const xn = v.x! ** v.n!;
              if (xn !== 0) return v.y! / xn;
              return v.y === 0 ? undefined : [NaN];
            },
            '{y} ÷ {x}^{n}',
            'Divide both sides by xⁿ.',
          ],
          x: [
            (v) => {
              // f is constant (c when n = 0, 0 when c = 0): any x works if f matches, none if not.
              if (v.n === 0 || v.c === 0) {
                return Math.abs(v.y! - (v.n === 0 ? v.c! : 0)) < 1e-9 ? undefined : [NaN];
              }
              return realRoots(v.y! / v.c!, v.n!);
            },
            // For even n the negative root is written with its sign.
            // x < 0: the root of the positive ratio, with its sign written in front.
            (v) =>
              v.x! >= 0
                ? '({y} ÷ {c})^(1 ÷ {n})'
                : v.n! % 2 === 0
                  ? '−({y} ÷ {c})^(1 ÷ {n})'
                  : '−(−{y} ÷ {c})^(1 ÷ {n})',
            'Divide by c, then take the n-th root. For even n both signs work; the one nearest the point is shown.',
          ],
        },
      ),
      withStep(
        rel(
          'f′(x) = n·c·xⁿ⁻¹',
          '{m} = {n} × {c} × {x}^({n} − 1)',
          ['m', 'n', 'c', 'x'],
          (v) => v.m! - powerRule(v.c!, v.n!, v.x!),
          {
            m: [
              (v) => powerRule(v.c!, v.n!, v.x!),
              // A constant (n = 0) has slope 0: "0 × c × x^(−1)" would read as 0 × ∞ at x = 0.
              (v) => (v.n === 0 ? '0 × {c}' : '{n} × {c} × {x}^({n} − 1)'),
              (v) =>
                v.n === 0
                  ? 'f is the constant c, so its slope is 0 everywhere.'
                  : 'Power rule: bring n down in front and lower the power by 1. Constant-multiple rule: keep c.',
            ],
            c: [
              (v) => {
                const d = v.n === 0 ? 0 : v.n! * v.x! ** (v.n! - 1);
                if (d !== 0) return v.m! / d;
                return v.m === 0 ? undefined : [NaN];
              },
              '{m} ÷ ({n} × {x}^({n} − 1))',
              'Divide both sides by n·xⁿ⁻¹.',
            ],
            x: [
              (v) => {
                // f′ is constant (0 when n = 0 or c = 0, c when n = 1): any x works, or none.
                if (v.n === 0 || v.c === 0) return v.m === 0 ? undefined : [NaN];
                if (v.n === 1) return Math.abs(v.m! - v.c!) < 1e-9 ? undefined : [NaN];
                return realRoots(v.m! / (v.n! * v.c!), v.n! - 1);
              },
              (v) =>
                v.x! >= 0
                  ? '({m} ÷ ({n} × {c}))^(1 ÷ ({n} − 1))'
                  : (v.n! - 1) % 2 === 0
                    ? '−({m} ÷ ({n} × {c}))^(1 ÷ ({n} − 1))'
                    : '−(−{m} ÷ ({n} × {c}))^(1 ÷ ({n} − 1))',
              'Divide by n·c, then take the (n − 1)-th root.',
            ],
          },
        ),
        'm',
        { work: (v) => powerWork(v.c!, v.n!, v.x!) },
      ),
    ),
    example: { c: 1, n: 2, x: 1.5, y: 2.25, m: 3 },
    startWith: ['x', 'c', 'n'],
    equation: 'f(x) = {c}x^{n}\nf′({x}) = {m}',
    representation: {
      kind: 'functionGraph',
      // c·xⁿ as an expression: the power family can't take n = 0 (a constant).
      family: 'expr',
      expr: 'c*x^n',
      at: { x: 'x', y: 'y' },
      tangent: { x: 'x', slope: 'm', y: 'y' },
    },
  },
  {
    // Calculus I → Derivatives and differentiation rules: (uv)′ and (u/v)′ from values at one x.
    id: 'he.math.calc-1#1~product-quotient',
    title: 'The product and quotient rules from a table',
    use: 'Use this for “f(2) = 3, f′(2) = −1, g(2) = 4, g′(2) = 5. Find (fg)′(2) and (f/g)′(2).”',
    assumptions: [
      'u, u′, v and v′ are the values of two functions and their slopes at one point x = a, read from a table.',
      'Product rule: (uv)′ = u′v + uv′. In a short time Δt the u-by-v rectangle grows by a strip u′Δt by v and a strip u by v′Δt.',
      'The corner u′v′Δt² shrinks faster than Δt, so it adds nothing to the slope.',
      'Quotient rule: (u ÷ v)′ = (u′v − uv′) ÷ v², which needs v ≠ 0 at a.',
    ],
    variables: [
      V('u', 'u', 'Value of u at a', { min: -1000, max: 1000, step: 0.1 }),
      V('du', 'u′', 'Slope of u at a', { min: -1000, max: 1000, step: 0.1 }),
      V('v', 'v', 'Value of v at a', { min: -1000, max: 1000, step: 0.1 }),
      V('dv', 'v′', 'Slope of v at a', { min: -1000, max: 1000, step: 0.1 }),
      V('P', 'P′', 'Slope of the product uv', { min: -2e6, max: 2e6, step: 0.0001 }),
      V('Q', 'Q′', 'Slope of the quotient u ÷ v', { min: -1e9, max: 1e9, step: 0.0001 }),
    ],
    ...rels(
      rule(
        'v ≠ 0',
        'The bottom {v} is not 0',
        ['v'],
        (v) => v.v !== 0,
        'With v = 0 at a, u ÷ v has no value there, so it has no slope. Pick a v that is not 0.',
      ),
      rel(
        'P′ = u′v + uv′',
        '{P} = {du} × {v} + {u} × {dv}',
        ['P', 'du', 'v', 'u', 'dv'],
        (v) => v.P! - (v.du! * v.v! + v.u! * v.dv!),
        {
          P: [
            (v) => v.du! * v.v! + v.u! * v.dv!,
            '{du} × {v} + {u} × {dv}',
            'Product rule: each strip is one factor’s slope times the other factor.',
          ],
          du: [
            (v) => (v.v === 0 ? undefined : (v.P! - v.u! * v.dv!) / v.v!),
            '({P} − {u} × {dv}) ÷ {v}',
            'Take u·v′ from P′, then divide by v.',
          ],
          dv: [
            (v) => (v.u === 0 ? undefined : (v.P! - v.du! * v.v!) / v.u!),
            '({P} − {du} × {v}) ÷ {u}',
            'Take u′·v from P′, then divide by u.',
          ],
        },
      ),
      rel(
        'Q′ = (u′v − uv′) ÷ v²',
        '{Q} = ({du} × {v} − {u} × {dv}) ÷ ({v}²)',
        ['Q', 'du', 'v', 'u', 'dv'],
        (v) => v.Q! * v.v! ** 2 - (v.du! * v.v! - v.u! * v.dv!),
        {
          Q: [
            (v) => (v.v === 0 ? undefined : (v.du! * v.v! - v.u! * v.dv!) / v.v! ** 2),
            '({du} × {v} − {u} × {dv}) ÷ ({v} × {v})',
            'Quotient rule: bottom times the top’s slope, minus top times the bottom’s slope, all over the bottom squared.',
          ],
          du: [
            (v) => (v.v === 0 ? undefined : (v.Q! * v.v! ** 2 + v.u! * v.dv!) / v.v!),
            '({Q} × {v}² + {u} × {dv}) ÷ {v}',
            'Multiply Q′ by v², add u·v′, then divide by v.',
          ],
        },
      ),
    ),
    example: { u: 3, du: -1, v: 4, dv: 5, P: 11, Q: -1.1875 },
    startWith: ['u', 'du', 'v', 'dv'],
    representation: {
      kind: 'rectangle',
      length: 'u',
      width: 'v',
      extent: 4,
      grow: { du: 'du', dv: 'dv', product: 'P', quotient: 'Q' },
      fixed: true,
    },
  },
  {
    // Calculus I → Derivatives and differentiation rules: the chain rule on (ax + b)ⁿ.
    id: 'he.math.calc-1#1~chain',
    title: 'The chain rule on a power',
    use: 'Use this for “Find f′(1) for f(x) = (2x + 1)³.”',
    assumptions: [
      'Chain rule: when f is an outside function of u and u is an inside function of x, f′(x) = (outside slope at u) × (inside slope).',
      'Here the inside is u = ax + b, with slope a, and the outside is uⁿ, with slope n·uⁿ⁻¹ by the power rule.',
      'So f′(x) = n(ax + b)ⁿ⁻¹ × a. Leaving off the × a is the usual slip.',
      'n is a whole number 1–8 and a ≠ 0. The graph writes f as aⁿ(x + b ÷ a)ⁿ, which meets the x-axis only at x = −b ÷ a.',
    ],
    variables: [
      V('a', 'a', 'Slope of the inside', { min: -5, max: 5, step: 0.1 }),
      V('b', 'b', 'Constant of the inside', { min: -10, max: 10, step: 0.1 }),
      V('n', 'n', 'Power', { min: 1, max: 8, step: 1, integer: true }),
      V('x', 'x', 'Point', { min: -5, max: 5, step: 0.1 }),
      V('u', 'u', 'Inside value ax + b', { min: -40, max: 40, step: 0.0001 }),
      V('f', 'f(x)', 'Value there', { min: -1e13, max: 1e13, step: 0.0001 }),
      V('m', 'f′(x)', 'Slope of the tangent', { min: -1e14, max: 1e14, step: 0.0001 }),
      V('A', 'aⁿ', 'Leading coefficient', {
        min: -1e6,
        max: 1e6,
        derived: true,
        hidden: true,
      }),
      V('z', 'z', 'Zero of f', { min: -1000, max: 1000, derived: true, hidden: true }),
    ],
    ...rels(
      rule(
        'a ≠ 0',
        'The slope of the inside {a} is not 0',
        ['a'],
        (v) => v.a !== 0,
        'With a = 0 the inside is the constant b, so f is a constant with slope 0. Pick an a that is not 0.',
      ),
      rel(
        'u = ax + b',
        '{u} = {a} × {x} + {b}',
        ['u', 'a', 'x', 'b'],
        (v) => v.u! - (v.a! * v.x! + v.b!),
        {
          u: [
            (v) => v.a! * v.x! + v.b!,
            '{a} × {x} + {b}',
            'Work out the inside first: a times x, plus b.',
          ],
          x: [
            (v) => (v.a === 0 ? undefined : (v.u! - v.b!) / v.a!),
            '({u} − {b}) ÷ {a}',
            'Take b from u, then divide by a.',
          ],
          b: [(v) => v.u! - v.a! * v.x!, '{u} − {a} × {x}', 'Take a·x from u.'],
        },
      ),
      rel('f = uⁿ', '{f} = {u}^{n}', ['f', 'u', 'n'], (v) => v.f! - v.u! ** v.n!, {
        f: [(v) => v.u! ** v.n!, '{u}^{n}', 'Raise the inside value to the power n.'],
        u: [
          (v) => realRoots(v.f!, v.n!),
          (v) =>
            v.u! >= 0 ? '{f}^(1 ÷ {n})' : v.n! % 2 === 0 ? '−{f}^(1 ÷ {n})' : '−(−{f})^(1 ÷ {n})',
          'Take the n-th root of f. For even n both signs work; the one nearest the point is shown.',
        ],
      }),
      rel(
        'f′ = n·uⁿ⁻¹·a',
        '{m} = {n} × {u}^({n} − 1) × {a}',
        ['m', 'n', 'u', 'a'],
        (v) => v.m! - powerRule(1, v.n!, v.u!) * v.a!,
        {
          m: [
            (v) => powerRule(1, v.n!, v.u!) * v.a!,
            '{n} × {u}^({n} − 1) × {a}',
            'Chain rule: the outside’s slope n·uⁿ⁻¹ at the inside value, times the inside’s slope a.',
          ],
          a: [
            (v) => {
              const d = powerRule(1, v.n!, v.u!);
              if (d !== 0) return v.m! / d;
              return v.m === 0 ? undefined : [NaN];
            },
            '{m} ÷ ({n} × {u}^({n} − 1))',
            'Divide f′ by the outside’s slope n·uⁿ⁻¹.',
          ],
        },
      ),
      hide(
        derive(
          'A = aⁿ',
          '{A} = {a}^{n}',
          'A',
          ['a', 'n'],
          (v) => v.a! ** v.n!,
          '{a}^{n}',
          '(ax + b)ⁿ = aⁿ(x + b ÷ a)ⁿ.',
        ),
      ),
      hide(
        derive(
          'z = −b ÷ a',
          '{z} = −{b} ÷ {a}',
          'z',
          ['b', 'a'],
          (v) => (v.a === 0 ? undefined : -v.b! / v.a!),
          '−{b} ÷ {a}',
          'The inside is 0 where ax + b = 0.',
        ),
      ),
    ),
    example: { a: 2, b: 1, n: 3, x: 1, u: 3, f: 27, m: 54, A: 8, z: -0.5 },
    startWith: ['a', 'b', 'n', 'x'],
    equation: 'f(x) = ({a}x + {b})^{n}\nf′({x}) = {m}',
    representation: {
      kind: 'functionGraph',
      family: 'polynomial',
      a: 'A',
      zeros: [{ x: 'z', times: 'n' }],
      at: { x: 'x', y: 'f' },
      tangent: { x: 'x', slope: 'm', y: 'f' },
    },
  },
  {
    // Calculus I → Derivatives and differentiation rules: A sin(bx) and its slope Ab cos(bx).
    id: 'he.math.calc-1#1~trig',
    title: 'The derivative of A sin(bx)',
    use: 'Use this for “Find the slope of y = 4 sin(2x) at x = π/3.”',
    assumptions: [
      'x is in radians; the slope of sin x is cos x only when x is measured in radians.',
      'The slope of sin x is cos x, and the slope of cos x is −sin x.',
      'For A sin(bx) the inside bx has slope b (chain rule), so f′(x) = A·b·cos(bx).',
      'Where cos(bx) = 0 the tangent is flat: a top or a bottom of the wave.',
    ],
    variables: [
      V('A', 'A', 'Number in front', { min: -50, max: 50, step: 0.5 }),
      V('b', 'b', 'Number times x inside', { min: -10, max: 10, step: 0.25 }),
      V('x', 'x', 'Point (radians)', { pi: 'fraction', min: -20, max: 20, step: PI / 12 }),
      V('t', 'bx', 'Angle inside the sine', {
        pi: 'fraction',
        min: -200,
        max: 200,
        step: 0.0001,
        derived: true,
      }),
      V('f', 'f(x)', 'Value there', { min: -50, max: 50, step: 0.0001 }),
      V('m', 'f′(x)', 'Slope of the tangent', { min: -500, max: 500, step: 0.0001 }),
    ],
    ...rels(
      rule(
        'b ≠ 0',
        'The number inside {b} is not 0',
        ['b'],
        (v) => v.b !== 0,
        'With b = 0 the sine is sin 0 = 0 everywhere, a flat line. Pick a b that is not 0.',
      ),
      derive(
        'bx = b × x',
        '{t} = {b} × {x}',
        't',
        ['b', 'x'],
        (v) => v.b! * v.x!,
        '{b} × {x}',
        'Work out the inside first: the angle the sine is taken of.',
      ),
      rel(
        'f = A sin(bx)',
        '{f} = {A} × sin({t})',
        ['f', 'A', 't'],
        (v) => v.f! - v.A! * Math.sin(v.t!),
        {
          f: [
            (v) => v.A! * snap(Math.sin(v.t!)),
            '{A} × sin({t})',
            'Take the sine of the angle, then multiply by A.',
          ],
          A: [
            (v) => {
              const s = Math.sin(v.t!);
              if (Math.abs(s) > 1e-12) return v.f! / s;
              return Math.abs(v.f!) < 1e-9 ? undefined : [NaN];
            },
            '{f} ÷ sin({t})',
            'Divide the value by the sine of the angle.',
          ],
        },
      ),
      withStep(
        rel(
          'f′ = A·b·cos(bx)',
          '{m} = {A} × {b} × cos({t})',
          ['m', 'A', 'b', 't'],
          (v) => v.m! - v.A! * v.b! * Math.cos(v.t!),
          {
            m: [
              (v) => v.A! * v.b! * snap(Math.cos(v.t!)),
              '{A} × {b} × cos({t})',
              'Chain rule: the slope of sin is cos at the angle, times the inside’s slope b; A stays in front.',
            ],
          },
        ),
        'm',
        { work: (v) => sineWork(v.A!, v.b!, v.x!) },
      ),
    ),
    example: { A: 2, b: 3, x: PI / 6, t: PI / 2, f: 2, m: 0 },
    startWith: ['A', 'b', 'x'],
    equation: 'f(x) = {A} sin({b}x)\nf′({x}) = {m}',
    representation: {
      kind: 'functionGraph',
      family: 'sin',
      a: 'A',
      b: 'b',
      at: { x: 'x', y: 'f' },
      tangent: { x: 'x', slope: 'm', y: 'f' },
    },
  },
  {
    // Calculus I → Derivatives and differentiation rules: A·e^(kx), whose slope is k times itself.
    id: 'he.math.calc-1#1~exp',
    title: 'The derivative of A·e^(kx)',
    use: 'Use this for “Find the slope of y = 3e^(0.5x) at x = 2.”',
    assumptions: [
      'The slope of eˣ is eˣ itself. For A·e^(kx) the inside kx has slope k (chain rule), so f′(x) = k·A·e^(kx) = k·f(x).',
      'With k > 0 the curve grows and its slope is the same sign as A; with k < 0 it decays toward 0.',
      'The slope of ln x is 1 ÷ x for x > 0, the inverse of this rule.',
    ],
    variables: [
      V('A', 'A', 'Number in front', { min: -1000, max: 1000, step: 0.5 }),
      V('k', 'k', 'Rate in the power', { min: -5, max: 5, step: 0.05 }),
      V('x', 'x', 'Point', { min: -10, max: 10, step: 0.1 }),
      V('f', 'f(x)', 'Value there', { min: -1e25, max: 1e25, step: 0.0001 }),
      V('m', 'f′(x)', 'Slope of the tangent', { min: -1e26, max: 1e26, step: 0.0001 }),
    ],
    ...rels(
      rule(
        'k ≠ 0',
        'The rate in the power {k} is not 0',
        ['k'],
        (v) => v.k !== 0,
        'With k = 0 the power is e⁰ = 1, so f is the constant A with slope 0. Pick a k that is not 0.',
      ),
      rel(
        'f = A·e^(kx)',
        '{f} = {A} × e^({k} × {x})',
        ['f', 'A', 'k', 'x'],
        (v) => v.f! - v.A! * Math.exp(v.k! * v.x!),
        {
          f: [
            (v) => v.A! * Math.exp(v.k! * v.x!),
            '{A} × e^({k} × {x})',
            'Raise e to the power k times x, then multiply by A.',
          ],
          A: [
            (v) => v.f! / Math.exp(v.k! * v.x!),
            '{f} ÷ e^({k} × {x})',
            'Divide the value by e to the power kx.',
          ],
          x: [
            (v) =>
              v.k === 0 || v.A === 0 || v.f! / v.A! <= 0 ? undefined : Math.log(v.f! / v.A!) / v.k!,
            'ln({f} ÷ {A}) ÷ {k}',
            'Divide by A, take the natural log, then divide by k. f and A must have the same sign.',
          ],
          k: [
            (v) =>
              v.x === 0 || v.A === 0 || v.f! / v.A! <= 0 ? undefined : Math.log(v.f! / v.A!) / v.x!,
            'ln({f} ÷ {A}) ÷ {x}',
            'Divide by A, take the natural log, then divide by x.',
          ],
        },
      ),
      withStep(
        rel('f′ = k·f', '{m} = {k} × {f}', ['m', 'k', 'f'], (v) => v.m! - v.k! * v.f!, {
          m: [
            (v) => v.k! * v.f!,
            '{k} × {f}',
            'Chain rule: the slope of e^u is e^u, times the inside’s slope k. So the slope is k times the value.',
          ],
          k: [
            (v) => (v.f === 0 ? undefined : v.m! / v.f!),
            '{m} ÷ {f}',
            'The slope divided by the value is the rate k.',
          ],
        }),
        'm',
        { work: (v) => expWork(v.A!, v.k!, v.x!) },
      ),
    ),
    example: { A: 5, k: -0.2, x: 3, f: 5 * Math.exp(-0.6), m: -Math.exp(-0.6) },
    startWith: ['A', 'k', 'x'],
    equation: 'f(x) = {A}e^{{k}x}\nf′({x}) = {m}',
    representation: {
      kind: 'functionGraph',
      family: 'exponential',
      a: 'A',
      r: 'k',
      at: { x: 'x', y: 'f' },
      tangent: { x: 'x', slope: 'm', y: 'f' },
      // The family's rate handle draws its own Δx = 1 triangle, which crowds the tangent's.
      fixed: true,
    },
  },
  {
    // Calculus I → Derivatives and differentiation rules: implicit slope on x² + y² = r².
    id: 'he.math.calc-1#1~implicit',
    title: 'Implicit slope on a circle',
    use: 'Use this for “Find dy/dx on x² + y² = 100 at (6, −8), and the tangent line there.”',
    assumptions: [
      'x² + y² = r² is a circle with its center at the origin. Near a point on it, y is a function of x (the top or bottom half).',
      'Differentiate both sides in x, using the chain rule on y²: 2x + 2y·(dy/dx) = 0, so dy/dx = −x ÷ y.',
      'The radius to the point has slope y₀ ÷ x₀, and the tangent −x₀ ÷ y₀: the tangent is at right angles to the radius.',
      'Where y₀ = 0 (the far left and right of the circle) the tangent is the vertical line x = x₀, which has no slope.',
    ],
    variables: [
      V('x0', 'x₀', 'Point’s x', { min: -100, max: 100, step: 0.1 }),
      V('y0', 'y₀', 'Point’s y', { min: -100, max: 100, step: 0.1 }),
      V('R', 'r²', 'Right side x² + y²', { min: 0.01, max: 20000, step: 0.01 }),
      V('r', 'r', 'Radius', { min: 0, max: 142, step: 0.0001, derived: true }),
      V('m', 'dy/dx', 'Slope of the tangent', { min: -1e5, max: 1e5, step: 0.0001 }),
      V('c', 'c', 'Tangent’s y-intercept', { min: -1e7, max: 1e7, step: 0.0001 }),
    ],
    ...rels(
      rule(
        'y₀ ≠ 0',
        'The point’s y {y0} is not 0',
        ['y0'],
        (v) => v.y0 !== 0,
        'With y₀ = 0 the point is at the far left or right of the circle: the tangent is the vertical line x = x₀, with no slope.',
      ),
      rel(
        'x₀² + y₀² = r²',
        '{R} = {x0}² + {y0}²',
        ['R', 'x0', 'y0'],
        (v) => v.R! - (v.x0! ** 2 + v.y0! ** 2),
        {
          R: [
            (v) => v.x0! ** 2 + v.y0! ** 2,
            '{x0}² + {y0}²',
            'The point is on the circle, so it makes x² + y² true.',
          ],
          y0: [
            (v) => realRoots(v.R! - v.x0! ** 2, 2),
            (v) => (v.y0! >= 0 ? '√({R} − {x0}²)' : '−√({R} − {x0}²)'),
            'Take x₀² from r², then the square root. Both signs work (top and bottom half); the one nearest the point is shown.',
          ],
          x0: [
            (v) => realRoots(v.R! - v.y0! ** 2, 2),
            (v) => (v.x0! >= 0 ? '√({R} − {y0}²)' : '−√({R} − {y0}²)'),
            'Take y₀² from r², then the square root. Both signs work (right and left half); the one nearest the point is shown.',
          ],
        },
      ),
      derive(
        'r = √(r²)',
        '{r} = √{R}',
        'r',
        ['R'],
        (v) => Math.sqrt(v.R!),
        '√{R}',
        'The radius is the square root of the right side.',
      ),
      rel(
        'dy/dx = −x₀ ÷ y₀',
        '{m} = −{x0} ÷ {y0}',
        ['m', 'x0', 'y0'],
        (v) => v.m! * v.y0! + v.x0!,
        {
          m: [
            (v) => (v.y0 === 0 ? undefined : exact(-v.x0! / v.y0!)),
            '−{x0} ÷ {y0}',
            'Solve 2x + 2y·(dy/dx) = 0 for dy/dx, then put in the point.',
          ],
          x0: [(v) => exact(-v.m! * v.y0!), '−{m} × {y0}', 'Multiply the slope by −y₀.'],
          y0: [
            (v) => (v.m === 0 ? undefined : exact(-v.x0! / v.m!)),
            '−{x0} ÷ {m}',
            'Divide −x₀ by the slope.',
          ],
        },
      ),
      rel(
        'c = y₀ − m·x₀',
        '{c} = {y0} − {m} × {x0}',
        ['c', 'y0', 'm', 'x0'],
        (v) => v.c! - (v.y0! - v.m! * v.x0!),
        {
          c: [
            (v) => exact(v.y0! - v.m! * v.x0!),
            '{y0} − {m} × {x0}',
            'The tangent y = mx + c goes through the point, so c = y₀ − m·x₀.',
          ],
        },
      ),
    ),
    example: { x0: 3, y0: 4, R: 25, r: 5, m: -0.75, c: 6.25 },
    startWith: ['x0', 'y0'],
    equation: 'x² + y² = {R}\ndy/dx at ({x0}, {y0}) = {m}\ntangent: y = {m}x + {c}',
    representation: {
      kind: 'conicGraph',
      conic: 'circle',
      h: 0,
      k: 0,
      r: 'r',
      point: { x: 'x0', y: 'y0' },
      tangent: { slope: 'm', intercept: 'c' },
      fixed: true,
    },
  },
  {
    // Calculus I → Derivatives and differentiation rules: the tangent to √x as an estimate.
    id: 'he.math.calc-1#1~linear-approx',
    title: 'Linear approximation of √x',
    use: 'Use this for “Use the linearization of √x at a = 25 to estimate √26.”',
    assumptions: [
      'L(x) = f(a) + f′(a)(x − a) is the tangent line at a. Near a it stays close to the curve, so f(x) ≈ L(x).',
      'For f(x) = √x the power rule on x^(1/2) gives f′(x) = 1 ÷ (2√x), so a must be above 0.',
      'Pick a near x where √a is known, a perfect square, so f(a) and f′(a) are exact.',
      '√x bends down, so its tangent lies above it: L(x) is a little too big, and the error L(x) − f(x) is never negative.',
    ],
    variables: [
      V('a', 'a', 'Point of tangency', { min: 0.01, max: 10000, step: 1 }),
      V('X', 'x', 'Point to estimate', { min: 0, max: 10000, step: 0.1 }),
      V('fa', 'f(a)', 'Value at a', { min: 0.1, max: 100, step: 0.0001 }),
      V('fpa', 'f′(a)', 'Slope at a', { min: 0.005, max: 5, step: 0.0001 }),
      V('L', 'L(x)', 'Linear approximation', { min: -100, max: 50000, step: 0.0001 }),
      V('tv', 'f(x)', 'True value √x', { min: 0, max: 100, step: 0.0001 }),
      V('err', 'E', 'Error L(x) − f(x)', { min: 0, max: 50000, step: 0.0001, derived: true }),
    ],
    ...rels(
      rule(
        'a > 0',
        'The point of tangency {a} is above 0',
        ['a'],
        (v) => v.a! > 0,
        'At a = 0 the slope 1 ÷ (2√a) has no value (the tangent there is vertical). Pick an a above 0.',
      ),
      rel('f(a) = √a', '{fa} = √{a}', ['fa', 'a'], (v) => v.fa! ** 2 - v.a!, {
        fa: [
          (v) => (v.a! < 0 ? undefined : exact(Math.sqrt(v.a!))),
          '√{a}',
          'The value of the curve at the point of tangency.',
        ],
        a: [(v) => (v.fa! < 0 ? undefined : v.fa! ** 2), '{fa}²', 'Square f(a) to get a back.'],
      }),
      withStep(
        derive(
          'f′(a) = 1 ÷ (2√a)',
          '{fpa} = 1 ÷ (2 × {fa})',
          'fpa',
          ['fa'],
          (v) => (v.fa! > 0 ? 1 / (2 * v.fa!) : undefined),
          '1 ÷ (2 × {fa})',
          'Power rule on x^(1/2): bring ½ down and lower the power to −½, so f′(x) = 1 ÷ (2√x). Use √a = f(a).',
        ),
        'fpa',
        { work: () => ['y(x) = √x → dy/dx = 1 ÷ (2√x)'] },
      ),
      withStep(
        rel(
          'L = f(a) + f′(a)(x − a)',
          '{L} = {fa} + {fpa} × ({X} − {a})',
          ['L', 'fa', 'fpa', 'X', 'a'],
          (v) => v.L! - (v.fa! + v.fpa! * (v.X! - v.a!)),
          {
            L: [
              (v) => v.fa! + v.fpa! * (v.X! - v.a!),
              '{fa} + {fpa} × ({X} − {a})',
              'Start at f(a) and follow the tangent’s slope for the step x − a.',
            ],
            X: [
              (v) => (v.fpa === 0 ? undefined : v.a! + (v.L! - v.fa!) / v.fpa!),
              '{a} + ({L} − {fa}) ÷ {fpa}',
              'Take f(a) from L, divide by the slope, then add a.',
            ],
          },
        ),
        'L',
        {
          work: (v) => [
            `L(x) = ${formatNumber(v.fa!)} + ${formatNumber(v.fpa!)}(x − ${formatNumber(v.a!)})`,
          ],
        },
      ),
      rel('f(x) = √x', '{tv} = √{X}', ['tv', 'X'], (v) => v.tv! ** 2 - v.X!, {
        tv: [
          (v) => (v.X! < 0 ? undefined : Math.sqrt(v.X!)),
          '√{X}',
          'The true value, worked out to compare.',
        ],
        X: [(v) => (v.tv! < 0 ? undefined : v.tv! ** 2), '{tv}²', 'Square the true value.'],
      }),
      derive(
        'E = L(x) − f(x)',
        '{err} = {L} − {tv}',
        'err',
        ['L', 'tv'],
        (v) => v.L! - v.tv!,
        '{L} − {tv}',
        'How far the tangent sits above the curve at x.',
      ),
    ),
    example: {
      a: 4,
      X: 4.1,
      fa: 2,
      fpa: 0.25,
      L: 2.025,
      tv: Math.sqrt(4.1),
      err: 2.025 - Math.sqrt(4.1),
    },
    startWith: ['a', 'X'],
    equation: 'L(x) = {fa} + {fpa}(x − {a})\n√{X} ≈ L({X}) = {L}',
    representation: {
      kind: 'functionGraph',
      family: 'root',
      index: 2,
      tangent: { x: 'a', slope: 'fpa', y: 'fa', at: 'X', value: 'L' },
    },
  },
];
