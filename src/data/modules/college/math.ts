/**
 * College Mathematics: the calculator modules of every course whose home field is
 * `math`, keyed by course topic (`<courseId>#<i>`, its problem types `<courseId>#<i>~<slug>`
 * after it), in taxonomy order. Course and topic titles come from taxonomy.ts. Layout pages are
 * in `../layouts/collegeMath.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { formatNumber } from '@/engine/format';

import type { Values } from '@/engine/types';

import type { ModuleDef } from '../types';

import { derive, powerRule, realRoots, rel, rels, rule, signed, V, withStep } from './shared';

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
    // Calculus I → Derivatives and differentiation rules
    id: 'he.math.calc-1#1',
    use: 'Use this for “Find the slope of y = 3x⁴ at x = −1.”',
    assumptions: [
      'f′(x) = lim (h → 0) [f(x + h) − f(x)] ÷ h: the slope of the tangent line at x.',
      'Power rule: the derivative of xⁿ is n·xⁿ⁻¹.',
      'Constant-multiple rule: a constant c multiplies the derivative too.',
      'This module covers the power and constant-multiple rules; n is a whole number 0–5, so f is defined for every x.',
    ],
    variables: [
      { id: 'x', symbol: 'x', name: 'Point x', min: -3, max: 3, step: 0.1 },
      { id: 'c', symbol: 'c', name: 'Constant c', min: -5, max: 5, step: 0.5 },
      { id: 'n', symbol: 'n', name: 'Power n', min: 0, max: 5, step: 1, integer: true },
      { id: 'y', symbol: 'f(x)', name: 'Function value', min: -2000, max: 2000 },
      { id: 'm', symbol: 'f′(x)', name: 'Slope of tangent', min: -5000, max: 5000 },
    ],
    relations: [
      {
        id: 'f(x) = c·xⁿ',
        display: '{y} = {c} × {x}^{n}',
        vars: ['y', 'c', 'x', 'n'],
        residual: (v) => v.y! - v.c! * v.x! ** v.n!,
        solve: {
          y: (v) => v.c! * v.x! ** v.n!,
          // Where no value works, return [NaN] so the solver reports the impossibility.
          c: (v) => {
            const xn = v.x! ** v.n!;
            if (xn !== 0) return v.y! / xn;
            return v.y === 0 ? undefined : [NaN];
          },
          x: (v) => {
            // f is constant (c when n = 0, 0 when c = 0): any x works if f matches, none if not.
            if (v.n === 0 || v.c === 0) {
              return Math.abs(v.y! - (v.n === 0 ? v.c! : 0)) < 1e-9 ? undefined : [NaN];
            }
            return realRoots(v.y! / v.c!, v.n!);
          },
          n: (v) => {
            if (v.c === 0) return v.y === 0 ? undefined : [NaN];
            const ratio = v.y! / v.c!;
            if (ratio === 0 || Math.abs(v.x!) === 1 || v.x === 0) return undefined;
            return [Math.round(Math.log(Math.abs(ratio)) / Math.log(Math.abs(v.x!)))];
          },
        },
      },
      {
        id: 'f′(x) = n·c·xⁿ⁻¹',
        display: '{m} = {n} × {c} × {x}^({n} − 1)',
        // A constant (n = 0) has slope 0 everywhere; "0 × c × 0^(−1)" would read as 0 × ∞.
        check: (v) => {
          const num = (x: number) => (x < 0 ? `(${formatNumber(x)})` : formatNumber(x));
          return v.n === 0
            ? `${num(v.m!)} = 0 × ${num(v.c!)}`
            : `${num(v.m!)} = ${v.n} × ${num(v.c!)} × ${num(v.x!)}^(${v.n} − 1)`;
        },
        vars: ['m', 'n', 'c', 'x'],
        residual: (v) => v.m! - powerRule(v.c!, v.n!, v.x!),
        solve: {
          m: (v) => powerRule(v.c!, v.n!, v.x!),
          c: (v) => {
            const d = v.n === 0 ? 0 : v.n! * v.x! ** (v.n! - 1);
            if (d !== 0) return v.m! / d;
            return v.m === 0 ? undefined : [NaN];
          },
          x: (v) => {
            // f′ is constant (0 when n = 0 or c = 0, c when n = 1): any x works, or none.
            if (v.n === 0 || v.c === 0) return v.m === 0 ? undefined : [NaN];
            if (v.n === 1) return Math.abs(v.m! - v.c!) < 1e-9 ? undefined : [NaN];
            return realRoots(v.m! / (v.n! * v.c!), v.n! - 1);
          },
        },
      },
    ],
    steps: {
      'f(x) = c·xⁿ': {
        y: { expr: '{c} × {x}^{n}', how: 'Raise x to the power n, then multiply by c.' },
        c: { expr: '{y} ÷ {x}^{n}', how: 'Divide both sides by xⁿ.' },
        x: {
          // For even n the negative root is written with its sign.
          expr: (v) => (v.x! < 0 && v.n! % 2 === 0 ? '−' : '') + '({y} ÷ {c})^(1 ÷ {n})',
          how: 'Divide by c, then take the n-th root. For even n both signs work; the one nearest the current point is shown.',
        },
        n: {
          expr: 'ln|{y} ÷ {c}| ÷ ln|{x}|',
          how: 'Divide by c, then take logarithms of both sides to bring n down; round to the nearest whole number.',
        },
      },
      'f′(x) = n·c·xⁿ⁻¹': {
        m: {
          // A constant (n = 0) has slope 0: "0 × c × x^(−1)" would read as 0 × ∞ at x = 0.
          expr: (v) => (v.n === 0 ? '0 × {c}' : '{n} × {c} × {x}^({n} − 1)'),
          how: (v) =>
            v.n === 0
              ? 'The function is the constant c, so its slope is 0 everywhere.'
              : 'Power rule: bring n down in front and lower the power by 1. Constant-multiple rule: keep c.',
        },
        c: { expr: '{m} ÷ ({n} × {x}^({n} − 1))', how: 'Divide both sides by n·xⁿ⁻¹.' },
        x: {
          expr: (v) =>
            (v.x! < 0 && (v.n! - 1) % 2 === 0 ? '−' : '') + '({m} ÷ ({n} × {c}))^(1 ÷ ({n} − 1))',
          how: 'Divide by n·c, then take the (n − 1)-th root.',
        },
      },
    },
    example: { c: 1, n: 2, x: 1.5, y: 2.25, m: 3 },
    startWith: ['x', 'c', 'n'],
    // Moves to `functionGraph` `family: 'power'` with `tangent` once HC37 is drawn (the plan).
    representation: {
      kind: 'plot',
      x: { var: 'x', min: -3, max: 3 },
      y: { var: 'y', min: -4, max: 10 },
      params: ['c', 'n'],
      tangentSlope: 'm',
      autoRange: true,
    },
  },
];
