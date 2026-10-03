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

/** "3x": a number times x ("x", "−x" for 1 and −1). */
const timesX = (m: number) => (m === 1 ? 'x' : m === -1 ? '−x' : `${formatNumber(m)}x`);

/**
 * L’Hôpital on (e^(kx) − 1) ÷ (mx) at 0: the top and the bottom as forms with their slopes at 0,
 * then the limit itself read as the ratio of the slopes.
 */
const lhopitalWork = (k: number, m: number) => [
  `f(x) = e^(${timesX(k)}) − 1 → f′(x) = ${expTerm(k, k)} → f′(0) = ${formatNumber(k)} × e^(0) = ${formatNumber(k)}`,
  `g(x) = ${timesX(m)} → g′(0) = ${formatNumber(m)}`,
  `lim x → 0 of (e^(${timesX(k)}) − 1) ÷ (${timesX(m)}) = ${formatNumber(k)} ÷ ${signed(m)}`,
];

/** A sine or cosine with rounding crumbs (cos(π/2) ≈ 6 × 10⁻¹⁷) read as 0. */
const snap = (y: number) => (Math.abs(y) < 1e-9 ? 0 : y);

/** A relation that only places the picture (its value is `hidden`): no row, step or check. */
const hide = <R extends { relation: { hidden?: boolean } }>(r: R): R => ({
  ...r,
  relation: { ...r.relation, hidden: true },
});

/** x² + bx + c at x. */
const topAt = (v: Values, x: number) => x * x + v.b! * x + v.c!;

/** A value with one fixed unit (no menu: the form lines are written in that unit). */
const fixed = (unit: string, min: number, max: number, step: number, derived = false) => ({
  unit,
  units: [unit],
  min,
  max,
  step,
  ...(derived ? { derived } : {}),
});

/** A polynomial (highest power first) with a number put in: "12(4)² − 240(4) + 900". */
const polyAt = (coefficients: readonly number[], x: number) => {
  const top = coefficients.length - 1;
  return coefficients
    .map((k, i) => [k, top - i] as const)
    .filter(([k]) => k !== 0)
    .map(([k, p], i) => {
      const term = termAt(Math.abs(k), x, p);
      if (i === 0) return k < 0 ? `−${term}` : term;
      return `${k < 0 ? '−' : '+'} ${term}`;
    })
    .join(' ');
};

/** The open box's volume x(s − 2x)², and its slope (s − 2x)(s − 6x). */
const boxVolume = (s: number, x: number) => x * (s - 2 * x) ** 2;
const boxSlope = (s: number, x: number) => (s - 2 * x) * (s - 6 * x);

/** V(x) = x(s − 2x)² multiplied out (4x³ − 4sx² + s²x) and its derivative, then V′ at the cut. */
const boxWork = (s: number, x: number) => {
  const V = [4, exact(-4 * s), exact(s * s), 0];
  const dV = polyDerivative(V);
  return [
    `V(x) = x(${formatNumber(s)} − 2x)² = ${polyForm(V)}`,
    `V′(x) = ${polyForm(dV)} = (${formatNumber(s)} − 2x)(${formatNumber(s)} − 6x)`,
    `V′(${formatNumber(x)}) = ${polyAt(dV, x)} = ${formatNumber(exact(boxSlope(s, x)))}`,
  ];
};

/** The field's area x(P − 2x) multiplied out (−2x² + Px), its slope P − 4x, then A′ at the side. */
const fenceWork = (P: number, x: number) => {
  const A = [-2, P, 0];
  const dA = polyDerivative(A);
  return [
    `A(x) = x(${formatNumber(P)} − 2x) = ${polyForm(A)}`,
    `A′(x) = ${polyForm(dA)}`,
    `A′(${formatNumber(x)}) = ${polyAt(dA, x)} = ${formatNumber(exact(P - 4 * x))}`,
  ];
};

/** x³ + bx² + cx + d at x. */
const cubicAt = (v: Values, x: number) => x ** 3 + v.b! * x ** 2 + v.c! * x + v.d!;

/** The critical points of x³ + bx² + cx + d, (−b ∓ √(b² − 3c)) ÷ 3: the smaller is the maximum. */
const criticalAt = (v: Values, side: -1 | 1) => {
  const q = v.b! ** 2 - 3 * v.c!;
  return q > 0 ? (-v.b! + side * Math.sqrt(q)) / 3 : undefined;
};

/** "(−(−3) − √((−3)² − 3 × (−9))) ÷ 3": the quadratic formula on f′ = 3x² + 2bx + c, the 2s cancelled. */
const criticalExpr = (side: '−' | '+') => `(−{b} ${side} √({b}² − 3 × {c})) ÷ 3`;

/** The second derivative 6x + 2b at a critical point, as a form line and its value there. */
const bendWork = (v: Values, x: number, first: boolean) => {
  const f2 = [6, exact(2 * v.b!)];
  return [
    ...(first
      ? [
          `f(x) = ${polyForm([1, v.b!, v.c!, v.d!])} → f′(x) = ${polyForm([3, exact(2 * v.b!), v.c!])} → f″(x) = ${polyForm(f2)}`,
        ]
      : []),
    `f″(${formatNumber(x)}) = ${polyAt(f2, x)} = ${formatNumber(exact(6 * x + 2 * v.b!))}`,
  ];
};

/** F(x) = px³ ÷ 3 + qx² ÷ 2 + rx, an antiderivative of px² + qx + r, at x. */
const antiQuad = (v: Values, x: number) => (v.p! * x ** 3) / 3 + (v.q! * x ** 2) / 2 + v.r! * x;

/** Integral values as fractions with a bottom up to 6 (32/3), as whole coefficients give them. */
const sixths = { fraction: 6, improper: true } as const;
const inSixths = (x: number) => formatNumber(x, sixths);

/** The antiderivative's terms for px² + qx + r as [coefficient, power, divisor], 0s left out. */
const antiTerms = (v: Values) =>
  (
    [
      [v.p!, 3, 3],
      [v.q!, 2, 2],
      [v.r!, 1, 1],
    ] as const
  ).filter(([k]) => k !== 0);

/** Terms with their signs: [[1, "x³ ÷ 3"], [−2, "2x²"]] → "x³ ÷ 3 − 2x²" ("0" when none). */
const joinSigned = (terms: readonly (readonly [number, string])[]) =>
  terms.length === 0
    ? '0'
    : terms
        .map(([k, t], i) => (i === 0 ? `${k < 0 ? '−' : ''}${t}` : `${k < 0 ? '−' : '+'} ${t}`))
        .join(' ');

/** "x³ ÷ 3 − 2x² + 5x": F(x) as written, the divisor worked in where it comes out short. */
const antiForm = (v: Values) =>
  joinSigned(
    antiTerms(v).map(([k, n, d]) => {
      const power = n === 1 ? 'x' : `x${raised(n)}`;
      const whole = exact(Math.abs(k) / d);
      const short = Math.abs(whole * 1e4 - Math.round(whole * 1e4)) < 1e-6;
      const size = short ? whole : Math.abs(k);
      const front = size === 1 ? '' : formatNumber(size);
      return [k, short ? `${front}${power}` : `${front}${power} ÷ ${d}`] as const;
    }),
  );

/** F at a point with the number put in: "2 × (−1)³ ÷ 3 + 5 × (−1)". */
const antiAt = (v: Values, x: number) =>
  joinSigned(
    antiTerms(v).map(([k, n, d]) => {
      const front = Math.abs(k) === 1 ? '' : `${formatNumber(Math.abs(k))} × `;
      const power = n === 1 ? '' : raised(n);
      return [k, `${front}${signed(x)}${power}${d === 1 ? '' : ` ÷ ${d}`}`] as const;
    }),
  );

/** The right ends a + iΔx, i = 1 to n, and x² at each (the rectangles' heights). */
const rightEnds = (v: Values) =>
  Array.from({ length: v.n! }, (_, i) => exact(v.a! + (i + 1) * v.dx!));
const rightHeights = (v: Values) => rightEnds(v).map((x) => exact(x * x));

/** The right sum of x² on [a, b] with n strips: Δx(na² + aΔx·n(n + 1) + Δx²·n(n + 1)(2n + 1) ÷ 6). */
const rightSum = (v: Values) => {
  const [n, a, w] = [v.n!, v.a!, v.dx!];
  return w * (n * a * a + a * w * n * (n + 1) + (w * w * n * (n + 1) * (2 * n + 1)) / 6);
};

/** f(t) = mt + c and its antiderivative G(t) = mt² ÷ 2 + ct, written in t: "2t + 1", "t² + t". */
const lineForm = (v: Values) => polyForm([v.m!, v.c!], 't');
const lineAnti = (v: Values) => antiForm({ p: 0, q: v.m!, r: v.c! }).replace(/x/g, 't');

/** F(x) = ∫ from a to x of (mt + c) dt = m(x² − a²) ÷ 2 + c(x − a). */
const areaSoFar = (v: Values) => (v.m! * (v.x! ** 2 - v.a! ** 2)) / 2 + v.c! * (v.x! - v.a!);

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
  {
    // Calculus I → Derivatives and differentiation rules: L’Hôpital on a 0/0 quotient at 0.
    id: 'he.math.calc-1#1~lhopital',
    title: 'L’Hôpital’s rule on (e^(kx) − 1) ÷ (mx)',
    use: 'Use this for “Find the limit of (e^(4x) − 1) ÷ (5x) as x → 0.”',
    assumptions: [
      'L’Hôpital’s rule: if the top f and the bottom g both → 0 as x → a, then lim f ÷ g = lim f′ ÷ g′ when that limit exists.',
      'Here f(x) = e^(kx) − 1 and g(x) = mx. At x = 0 the top is e⁰ − 1 = 0 and the bottom is 0, the 0/0 form the rule needs.',
      'Chain rule: f′(x) = k·e^(kx), which is k at x = 0, and g′(x) = m. So the limit is k ÷ m.',
      'x is a plain number, and the table checks the answer with x on both sides of 0.',
    ],
    variables: [
      V('k', 'k', 'Rate in the power on top', { min: -10, max: 10, step: 0.5 }),
      V('m', 'm', 'Number times x below', { min: -10, max: 10, step: 0.5 }),
      V('L', 'L', 'The limit', { min: -100, max: 100, step: 0.0001, derived: true }),
      V('x', 'x', 'An x close to 0', { min: -1, max: 1, step: 0.001 }),
      V('r', 'r', '(e^(kx) − 1) ÷ (mx) there', { min: -1e6, max: 1e6, step: 0.00001 }),
    ],
    ...rels(
      rule(
        'k ≠ 0',
        'The rate in the power {k} is not 0',
        ['k'],
        (v) => v.k !== 0,
        'With k = 0 the top is e⁰ − 1 = 0 everywhere, so the quotient is 0 and there is nothing to find: pick another k.',
      ),
      rule(
        'm ≠ 0',
        'The number below {m} is not 0',
        ['m'],
        (v) => v.m !== 0,
        'With m = 0 the bottom is 0 everywhere and the quotient has no value: pick another m.',
      ),
      rule(
        'x ≠ 0',
        'The quotient has no value at x = {x}',
        ['x'],
        (v) => v.x !== 0,
        'The quotient is 0/0 at x = 0: pick an x close to 0.',
      ),
      withStep(
        derive(
          'L = k ÷ m',
          '{L} = {k} ÷ {m}',
          'L',
          ['k', 'm'],
          (v) => (v.m === 0 ? undefined : v.k! / v.m!),
          (v) => `${signed(v.k!)} ÷ ${signed(v.m!)}`,
          'Top and bottom are both 0 at x = 0, so take the slope of each: k·e^(kx) is k at 0, and the slope of mx is m.',
        ),
        'L',
        { work: (v) => lhopitalWork(v.k!, v.m!) },
      ),
      rel(
        'r = (e^(kx) − 1) ÷ (mx)',
        '{r} = (e^({k} × {x}) − 1) ÷ ({m} × {x})',
        ['r', 'k', 'x', 'm'],
        (v) => v.r! * v.m! * v.x! - (Math.exp(v.k! * v.x!) - 1),
        {
          r: [
            (v) =>
              v.x === 0 || v.m === 0 ? undefined : (Math.exp(v.k! * v.x!) - 1) / (v.m! * v.x!),
            (v) =>
              `(e^(${signed(v.k!)} × ${signed(v.x!)}) − 1) ÷ (${signed(v.m!)} × ${signed(v.x!)})`,
            'Raise e to the power kx, take away 1, then divide by mx. The closer x is to 0, the closer r is to k ÷ m.',
          ],
        },
      ),
    ),
    example: { k: 2, m: 3, L: 2 / 3, x: 0.01, r: (Math.exp(0.02) - 1) / 0.03 },
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
    // Calculus I → Related rates and optimization: the open box, V = x(s − 2x)², best cut s/6.
    id: 'he.math.calc-1#2',
    use: 'Use this for “Squares are cut from the corners of a 30 cm square sheet to make an open box. What cut gives the largest volume?”',
    unitSystems: ['metric'],
    assumptions: [
      'Squares of side x are cut from the four corners of an s-by-s sheet and the sides fold up: the box is x tall on a square base of side s − 2x.',
      'So V(x) = x(s − 2x)², which makes sense for 0 < x < s ÷ 2. At both ends V = 0, so the largest volume is where V′ = 0 inside.',
      'V′(x) = (s − 2x)(s − 6x) is 0 at x = s ÷ 2 (no box left) and at x = s ÷ 6, the largest volume.',
      'Lengths are in cm and volumes in cm³; the slope V′ is in cm³ per cm of cut, which is cm².',
    ],
    variables: [
      V('s', 's', 'Side of the sheet', fixed('cm', 1, 500, 0.1)),
      V('x', 'x', 'Side of each cut square', fixed('cm', 0.01, 250, 0.01)),
      V('V', 'V', 'Volume of the box', fixed('cm³', 0, 1e7, 0.01)),
      V('dV', 'm', 'Slope of the volume V′(x) at the cut', fixed('cm²', -1e5, 3e5, 0.01)),
      V('xs', 'xₘₐₓ', 'Best cut', fixed('cm', 0, 100, 0.0001, true)),
      V('Vs', 'Vₘₐₓ', 'Largest volume', fixed('cm³', 0, 1e7, 0.01, true)),
      V('h', 'h', 'Half the sheet', { min: 0, max: 250, derived: true, hidden: true }),
    ],
    ...rels(
      rule(
        '0 < x < s ÷ 2',
        'The cut {x} is between 0 and half the sheet {s}',
        ['x', 's'],
        (v) => v.x! > 0 && 2 * v.x! < v.s!,
        'The cut must be above 0 and less than half the sheet, or no base is left to fold up.',
      ),
      rel(
        'V = x(s − 2x)²',
        '{V} = {x} × ({s} − 2 × {x})²',
        ['V', 'x', 's'],
        (v) => v.V! - boxVolume(v.s!, v.x!),
        {
          V: [
            (v) => exact(boxVolume(v.s!, v.x!)),
            (v) => `${formatNumber(v.x!)} × (${formatNumber(v.s!)} − 2 × ${formatNumber(v.x!)})²`,
            'Height x times the square base: its side is the sheet less two cuts, s − 2x.',
          ],
          s: [
            (v) => (v.x! > 0 && v.V! >= 0 ? exact(2 * v.x! + Math.sqrt(v.V! / v.x!)) : undefined),
            (v) => `2 × ${formatNumber(v.x!)} + √(${formatNumber(v.V!)} ÷ ${formatNumber(v.x!)})`,
            'Divide V by x to get the base area, take its square root for the base side, then add back the two cuts.',
          ],
        },
      ),
      withStep(
        rel(
          'm = V′(x) = (s − 2x)(s − 6x)',
          '{dV} = ({s} − 2 × {x}) × ({s} − 6 × {x})',
          ['dV', 's', 'x'],
          (v) => v.dV! - boxSlope(v.s!, v.x!),
          {
            dV: [
              (v) => exact(boxSlope(v.s!, v.x!)),
              (v) =>
                `(${formatNumber(v.s!)} − 2 × ${formatNumber(v.x!)}) × (${formatNumber(v.s!)} − 6 × ${formatNumber(v.x!)})`,
              (v) =>
                v.dV! > 0
                  ? 'Multiply V out and use the power rule. V′ > 0 here, so a bigger cut still adds volume.'
                  : v.dV! < 0
                    ? 'Multiply V out and use the power rule. V′ < 0 here, so the cut is already past the best one.'
                    : 'Multiply V out and use the power rule. V′ = 0 here: this is the best cut.',
            ],
          },
        ),
        'dV',
        { work: (v) => boxWork(v.s!, v.x!) },
      ),
      derive(
        'xₘₐₓ = s ÷ 6',
        '{xs} = {s} ÷ 6',
        'xs',
        ['s'],
        (v) => v.s! / 6,
        (v) => `${formatNumber(v.s!)} ÷ 6`,
        'Set V′ = 0: (s − 2x)(s − 6x) = 0. x = s ÷ 2 leaves no base, so the best cut is x = s ÷ 6.',
      ),
      derive(
        'Vₘₐₓ = xₘₐₓ(s − 2xₘₐₓ)²',
        '{Vs} = {xs} × ({s} − 2 × {xs})²',
        'Vs',
        ['xs', 's'],
        (v) => exact(boxVolume(v.s!, v.xs!)),
        (v) => `${formatNumber(v.xs!)} × (${formatNumber(v.s!)} − 2 × ${formatNumber(v.xs!)})²`,
        'Put the best cut into V. V′ goes from + to − there, and both ends give V = 0, so this is the largest.',
      ),
      hide(
        derive(
          'h = s ÷ 2',
          '{h} = {s} ÷ 2',
          'h',
          ['s'],
          (v) => v.s! / 2,
          '{s} ÷ 2',
          'V = 4x(x − s ÷ 2)² touches 0 at half the sheet.',
        ),
      ),
    ),
    // s = 30 cm, x = 4 cm: V = 4 × 22² = 1936 cm³, V′(4) = 22 × 6 = 132; xₘₐₓ = 5 cm, Vₘₐₓ = 5 × 20² = 2000 cm³.
    example: { s: 30, x: 4, V: 1936, dV: 132, xs: 5, Vs: 2000, h: 15 },
    startWith: ['s', 'x'],
    // V = 4x(x − s/2)²: the box's volume against the cut, its top at x = s/6.
    representation: {
      kind: 'functionGraph',
      family: 'polynomial',
      a: 4,
      zeros: [{ x: 0 }, { x: 'h', times: 2 }],
      name: 'V',
      at: { x: 'x', y: 'V' },
      marks: ['extrema'],
      // 0 to half the sheet, whatever its size.
      window: { x: [0, 'h'] },
      axes: { x: 'Cut x (cm)', y: 'Volume V (cm³)' },
    },
  },
  {
    // Calculus I → Related rates and optimization: a field on a river, A = x(P − 2x), best x = P/4.
    id: 'he.math.calc-1#2~fence',
    title: 'The largest field along a river',
    use: 'Use this for “A gardener has 16 m of fence for a plot along a straight river, with no fence on the river side. What sides give the largest area?”',
    unitSystems: ['metric'],
    assumptions: [
      'The field is a rectangle with one long side on the river, so the fence P runs on the other three sides: two sides x away from the river and one side y along it.',
      'So y = P − 2x and the area is A(x) = x(P − 2x), which makes sense for 0 < x < P ÷ 2. At both ends A = 0.',
      'A′(x) = P − 4x is 0 only at x = P ÷ 4, and A″ = −4 < 0, so that side gives the largest area.',
      'Lengths are in m and areas in m²; the slope A′ is in m² per m of side, which is m.',
    ],
    variables: [
      V('P', 'P', 'Length of fence', fixed('m', 1, 10000, 0.1)),
      V('x', 'x', 'Side away from the river', fixed('m', 0.01, 5000, 0.01)),
      V('y', 'y', 'Side along the river', fixed('m', 0, 10000, 0.01)),
      V('A', 'A', 'Area of the field', fixed('m²', 0, 2e7, 0.01)),
      V('dA', 'm', 'Slope of the area A′(x) at that side', fixed('m', -1e4, 1e4, 0.01)),
      V('xs', 'xₘₐₓ', 'Best side away from the river', fixed('m', 0, 2500, 0.0001, true)),
      V('As', 'Aₘₐₓ', 'Largest area', fixed('m²', 0, 2e7, 0.01, true)),
      V('h', 'h', 'Half the fence', { min: 0, max: 5000, derived: true, hidden: true }),
    ],
    ...rels(
      rule(
        '0 < x < P ÷ 2',
        'The side {x} is between 0 and half the fence {P}',
        ['x', 'P'],
        (v) => v.x! > 0 && 2 * v.x! < v.P!,
        'The side away from the river must be above 0 and less than half the fence, or no fence is left along the river.',
      ),
      rel('y = P − 2x', '{y} = {P} − 2 × {x}', ['y', 'P', 'x'], (v) => v.y! - (v.P! - 2 * v.x!), {
        y: [
          (v) => exact(v.P! - 2 * v.x!),
          (v) => `${formatNumber(v.P!)} − 2 × ${formatNumber(v.x!)}`,
          'Two sides of length x use 2x of the fence; the rest runs along the river.',
        ],
        x: [
          (v) => exact((v.P! - v.y!) / 2),
          (v) => `(${formatNumber(v.P!)} − ${formatNumber(v.y!)}) ÷ 2`,
          'Take the side along the river from the fence, then share the rest between the two sides.',
        ],
        P: [
          (v) => exact(v.y! + 2 * v.x!),
          (v) => `${formatNumber(v.y!)} + 2 × ${formatNumber(v.x!)}`,
          'The fence is the side along the river and the two sides away from it.',
        ],
      }),
      rel('A = xy', '{A} = {x} × {y}', ['A', 'x', 'y'], (v) => v.A! - v.x! * v.y!, {
        A: [
          (v) => exact(v.x! * v.y!),
          (v) => `${formatNumber(v.x!)} × ${formatNumber(v.y!)}`,
          'A rectangle’s area is one side times the other.',
        ],
        y: [
          (v) => (v.x! > 0 ? exact(v.A! / v.x!) : undefined),
          (v) => `${formatNumber(v.A!)} ÷ ${formatNumber(v.x!)}`,
          'Divide the area by the side away from the river.',
        ],
      }),
      withStep(
        derive(
          'm = A′(x) = P − 4x',
          '{dA} = {P} − 4 × {x}',
          'dA',
          ['P', 'x'],
          (v) => v.P! - 4 * v.x!,
          (v) => `${formatNumber(v.P!)} − 4 × ${formatNumber(v.x!)}`,
          (v) =>
            v.P! - 4 * v.x! > 0
              ? 'Multiply A out and use the power rule. A′ > 0 here, so a longer side x still adds area.'
              : v.P! - 4 * v.x! < 0
                ? 'Multiply A out and use the power rule. A′ < 0 here, so x is already past the best side.'
                : 'Multiply A out and use the power rule. A′ = 0 here: this is the best side.',
        ),
        'dA',
        { work: (v) => fenceWork(v.P!, v.x!) },
      ),
      derive(
        'xₘₐₓ = P ÷ 4',
        '{xs} = {P} ÷ 4',
        'xs',
        ['P'],
        (v) => v.P! / 4,
        (v) => `${formatNumber(v.P!)} ÷ 4`,
        'Set A′ = 0: P − 4x = 0, so x = P ÷ 4. Half the fence then runs along the river.',
      ),
      derive(
        'Aₘₐₓ = xₘₐₓ(P − 2xₘₐₓ)',
        '{As} = {xs} × ({P} − 2 × {xs})',
        'As',
        ['xs', 'P'],
        (v) => exact(v.xs! * (v.P! - 2 * v.xs!)),
        (v) => `${formatNumber(v.xs!)} × (${formatNumber(v.P!)} − 2 × ${formatNumber(v.xs!)})`,
        'Put the best side into A. A″ = −4 < 0, so the graph is a hill and this is its top.',
      ),
      hide(
        derive(
          'h = P ÷ 2',
          '{h} = {P} ÷ 2',
          'h',
          ['P'],
          (v) => v.P! / 2,
          '{P} ÷ 2',
          'A = −2x(x − P ÷ 2) is 0 at half the fence.',
        ),
      ),
    ),
    // P = 20 m, x = 4 m: y = 12 m, A = 48 m², A′(4) = 20 − 16 = 4; xₘₐₓ = 5 m, Aₘₐₓ = 5 × 10 = 50 m².
    example: { P: 20, x: 4, y: 12, A: 48, dA: 4, xs: 5, As: 50, h: 10 },
    startWith: ['P', 'x'],
    // A = −2x(x − P/2): the field's area against the side, its top at x = P/4.
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'factored',
      a: -2,
      p: 0,
      q: 'h',
      name: 'A',
      at: { x: 'x', y: 'A' },
      shows: { vertex: { x: 'xs', y: 'As' } },
      marks: ['vertex'],
      // 0 to half the fence, whatever its length.
      window: { x: [0, 'h'] },
      axes: { x: 'Side x (m)', y: 'Area A (m²)' },
    },
  },
  {
    // Calculus I → Related rates and optimization: the extrema and inflection of a cubic.
    id: 'he.math.calc-1#2~extrema',
    title: 'Highs and lows of a cubic',
    use: 'Use this for “Find the local maximum and minimum of f(x) = x³ − 6x² + 9x + 1, and where the graph changes how it bends.”',
    equation: 'f(x) = x³ + {b}x² + {c}x + {d}',
    assumptions: [
      'The local maximum and minimum are at critical points, where f′(x) = 3x² + 2bx + c = 0.',
      'Two critical points need b² > 3c. Then the second derivative test sorts them: f″(x) = 6x + 2b is negative at a maximum and positive at a minimum.',
      'With x³ in front, the smaller critical point x₁ is always the maximum and x₂ the minimum. The inflection point is halfway, where f″(x) = 0.',
    ],
    variables: [
      V('b', 'b', 'Coefficient of x²', { min: -50, max: 50, step: 0.1 }),
      V('c', 'c', 'Coefficient of x', { min: -50, max: 50, step: 0.1 }),
      V('d', 'd', 'Constant term', { min: -50, max: 50, step: 0.1 }),
      V('x1', 'x₁', 'First critical point', { min: -100, max: 100, step: 0.0001, derived: true }),
      V('k1', 'k₁', 'Second derivative f″(x₁) there', {
        min: -1e3,
        max: 1e3,
        step: 0.0001,
        derived: true,
      }),
      V('f1', 'y₁', 'Local maximum f(x₁)', { min: -1e6, max: 1e6, step: 0.0001, derived: true }),
      V('x2', 'x₂', 'Second critical point', { min: -100, max: 100, step: 0.0001, derived: true }),
      V('k2', 'k₂', 'Second derivative f″(x₂) there', {
        min: -1e3,
        max: 1e3,
        step: 0.0001,
        derived: true,
      }),
      V('f2', 'y₂', 'Local minimum f(x₂)', { min: -1e6, max: 1e6, step: 0.0001, derived: true }),
      V('xi', 'xᵢ', 'Inflection point', { min: -100, max: 100, step: 0.0001, derived: true }),
      V('fi', 'yᵢ', 'Value at the inflection f(xᵢ)', {
        min: -1e6,
        max: 1e6,
        step: 0.0001,
        derived: true,
      }),
    ],
    ...rels(
      rule(
        'b² > 3c',
        'The square of {b} is more than 3 × {c}',
        ['b', 'c'],
        (v) => v.b! ** 2 > 3 * v.c!,
        'With b² ≤ 3c, f′(x) = 3x² + 2bx + c never changes sign, so f only climbs: no local maximum or minimum. Pick b and c with b² > 3c.',
      ),
      derive(
        'x₁ = (−b − √(b² − 3c)) ÷ 3',
        '{x1} = (−{b} − √({b}² − 3 × {c})) ÷ 3',
        'x1',
        ['b', 'c'],
        (v) => criticalAt(v, -1),
        criticalExpr('−'),
        'Set f′(x) = 3x² + 2bx + c = 0. The quadratic formula gives x = (−2b ± √(4b² − 12c)) ÷ 6; cancel the 2s. The smaller root is x₁.',
      ),
      derive(
        'x₂ = (−b + √(b² − 3c)) ÷ 3',
        '{x2} = (−{b} + √({b}² − 3 × {c})) ÷ 3',
        'x2',
        ['b', 'c'],
        (v) => criticalAt(v, 1),
        criticalExpr('+'),
        'The same formula with + gives the larger root, x₂.',
      ),
      withStep(
        derive(
          'k₁ = f″(x₁) = 6x₁ + 2b',
          '{k1} = 6 × {x1} + 2 × {b}',
          'k1',
          ['x1', 'b'],
          (v) => 6 * v.x1! + 2 * v.b!,
          '6 × {x1} + 2 × {b}',
          (v) =>
            6 * v.x1! + 2 * v.b! < 0
              ? 'Differentiate twice with the power rule. f″(x₁) < 0, so the graph bends down there: x₁ is a local maximum.'
              : 'Differentiate twice with the power rule. f″(x₁) > 0, so the graph bends up there: x₁ is a local minimum.',
        ),
        'k1',
        { work: (v) => bendWork(v, v.x1!, true) },
      ),
      withStep(
        derive(
          'k₂ = f″(x₂) = 6x₂ + 2b',
          '{k2} = 6 × {x2} + 2 × {b}',
          'k2',
          ['x2', 'b'],
          (v) => 6 * v.x2! + 2 * v.b!,
          '6 × {x2} + 2 × {b}',
          (v) =>
            6 * v.x2! + 2 * v.b! > 0
              ? 'f″(x₂) > 0, so the graph bends up there: x₂ is a local minimum.'
              : 'f″(x₂) < 0, so the graph bends down there: x₂ is a local maximum.',
        ),
        'k2',
        { work: (v) => bendWork(v, v.x2!, false) },
      ),
      derive(
        'y₁ = f(x₁)',
        '{f1} = {x1}³ + {b} × {x1}² + {c} × {x1} + {d}',
        'f1',
        ['x1', 'b', 'c', 'd'],
        (v) => cubicAt(v, v.x1!),
        '{x1}³ + {b} × {x1}² + {c} × {x1} + {d}',
        'Put x₁ into f: the height of the local maximum.',
      ),
      derive(
        'y₂ = f(x₂)',
        '{f2} = {x2}³ + {b} × {x2}² + {c} × {x2} + {d}',
        'f2',
        ['x2', 'b', 'c', 'd'],
        (v) => cubicAt(v, v.x2!),
        '{x2}³ + {b} × {x2}² + {c} × {x2} + {d}',
        'Put x₂ into f: the height of the local minimum.',
      ),
      derive(
        'xᵢ = −b ÷ 3',
        '{xi} = −{b} ÷ 3',
        'xi',
        ['b'],
        (v) => -v.b! / 3,
        '−{b} ÷ 3',
        'Set f″(x) = 6x + 2b = 0. On the left f″ < 0 and on the right f″ > 0, so the bend changes from down to up here.',
      ),
      derive(
        'yᵢ = f(xᵢ)',
        '{fi} = {xi}³ + {b} × {xi}² + {c} × {xi} + {d}',
        'fi',
        ['xi', 'b', 'c', 'd'],
        (v) => cubicAt(v, v.xi!),
        '{xi}³ + {b} × {xi}² + {c} × {xi} + {d}',
        'Put xᵢ into f. A cubic is symmetric about this point, so yᵢ is halfway between y₁ and y₂.',
      ),
    ),
    // f(x) = x³ − 3x² − 9x + 5: f′ = 3x² − 6x − 9 = 3(x − 3)(x + 1), so x₁ = −1 and x₂ = 3;
    // f″ = 6x − 6 gives −12 (maximum, f = −1 − 3 + 9 + 5 = 10) and 12 (minimum, f = 27 − 27 − 27 + 5 = −22);
    // inflection at x = 1, f(1) = 1 − 3 − 9 + 5 = −6.
    example: { b: -3, c: -9, d: 5, x1: -1, x2: 3, k1: -12, k2: 12, f1: 10, f2: -22, xi: 1, fi: -6 },
    startWith: ['b', 'c', 'd'],
    // f(x) = x³ + bx² + cx + d with its hill and valley marked.
    representation: {
      kind: 'functionGraph',
      family: 'polynomial',
      coefficients: [1, 'b', 'c', 'd'],
      marks: ['extrema'],
    },
  },
  {
    // Calculus I → Related rates and optimization: a sliding ladder, dy/dt = −x·(dx/dt) ÷ y.
    id: 'he.math.calc-1#2~ladder',
    title: 'A sliding ladder',
    use: 'Use this for “A 10 m ladder leans on a wall and its foot slides away at 1 m/s. How fast is the top sliding down when the foot is 6 m from the wall?”',
    unitSystems: ['metric'],
    assumptions: [
      'The wall is vertical and the ground level, so the ladder, the wall and the ground make a right triangle: x² + y² = L² at every instant.',
      'The ladder’s length L never changes. Differentiating both sides in time t gives 2x·(dx/dt) + 2y·(dy/dt) = 0.',
      'A positive dx/dt means the foot moves away from the wall; a negative dy/dt means the top slides down.',
      'Lengths are in m and rates in m/s.',
    ],
    variables: [
      V('L', 'L', 'Length of the ladder', fixed('m', 0.1, 100, 0.1)),
      V('x', 'x', 'Foot’s distance from the wall', fixed('m', 0.01, 100, 0.01)),
      V('y', 'y', 'Top’s height up the wall', fixed('m', 0.01, 100, 0.0001)),
      V('dx', 'dx/dt', 'Foot’s speed away from the wall', fixed('m/s', -100, 100, 0.01)),
      V('dy', 'dy/dt', 'Top’s rate up the wall', fixed('m/s', -1e4, 1e4, 0.0001)),
    ],
    ...rels(
      rule(
        'x < L',
        'The foot’s distance {x} is less than the ladder {L}',
        ['x', 'L'],
        (v) => v.x! < v.L!,
        'The foot can’t be as far from the wall as the ladder is long: the top would be on the ground. Pick x less than L.',
      ),
      rel(
        'x² + y² = L²',
        '{x}² + {y}² = {L}²',
        ['x', 'y', 'L'],
        (v) => v.x! ** 2 + v.y! ** 2 - v.L! ** 2,
        {
          y: [
            (v) => (v.L! > v.x! ? exact(Math.sqrt(v.L! ** 2 - v.x! ** 2)) : undefined),
            '√({L}² − {x}²)',
            'The ladder is the hypotenuse: take x² from L², then the square root.',
          ],
          x: [
            (v) => (v.L! > v.y! ? exact(Math.sqrt(v.L! ** 2 - v.y! ** 2)) : undefined),
            '√({L}² − {y}²)',
            'Take y² from L², then the square root.',
          ],
          L: [
            (v) => exact(Math.hypot(v.x!, v.y!)),
            '√({x}² + {y}²)',
            'Pythagoras: add the squares of the two legs, then the square root.',
          ],
        },
      ),
      rel(
        'x·(dx/dt) + y·(dy/dt) = 0',
        '{x} × {dx} + {y} × {dy} = 0',
        ['x', 'dx', 'y', 'dy'],
        (v) => v.x! * v.dx! + v.y! * v.dy!,
        {
          dy: [
            (v) => (v.y! > 0 ? exact((-v.x! * v.dx!) / v.y!) : undefined),
            (v) => (v.dx === 0 ? '{x} × {dx} ÷ (−{y})' : '−({x} × {dx}) ÷ {y}'),
            'Differentiate x² + y² = L² in t with L fixed, divide by 2, then solve for dy/dt.',
          ],
          dx: [
            (v) => (v.x! > 0 ? exact((-v.y! * v.dy!) / v.x!) : undefined),
            (v) => (v.dy === 0 ? '{y} × {dy} ÷ (−{x})' : '−({y} × {dy}) ÷ {x}'),
            'Differentiate x² + y² = L² in t with L fixed, divide by 2, then solve for dx/dt.',
          ],
        },
      ),
    ),
    // L = 5 m, x = 3 m, dx/dt = 0.5 m/s: y = √(25 − 9) = 4 m, dy/dt = −3 × 0.5 ÷ 4 = −0.375 m/s.
    example: { L: 5, x: 3, y: 4, dx: 0.5, dy: -0.375 },
    startWith: ['L', 'x', 'dx'],
    // The ladder against the wall, each end's rate an arrow; dragging the foot keeps L.
    representation: {
      kind: 'rightTriangle',
      a: 'y',
      b: 'x',
      c: 'L',
      extent: 5,
      rates: { a: 'dy', b: 'dx' },
      scene: 'ladder',
      keep: ['dx'],
    },
  },
  {
    // Calculus I → Related rates and optimization: two cars on perpendicular roads, dD/dt = (x·(dx/dt) + y·(dy/dt)) ÷ D.
    id: 'he.math.calc-1#2~two-cars',
    title: 'Two cars moving apart',
    use: 'Use this for “Two cyclists leave a crossroads, one east at 15 km/h and one north at 20 km/h. How fast is the gap between them growing when they are 12 km and 5 km out?”',
    unitSystems: ['metric'],
    assumptions: [
      'The roads cross at a right angle, so the cars and the crossing make a right triangle: D² = x² + y² at every instant.',
      'Differentiating both sides in time t and dividing by 2 gives D·(dD/dt) = x·(dx/dt) + y·(dy/dt).',
      'A positive rate means that distance is growing; a car driving back toward the crossing has a negative rate.',
      'Distances are in km and rates in km/h.',
    ],
    variables: [
      V('x', 'x', 'East car’s distance from the crossing', fixed('km', 0.01, 1000, 0.01)),
      V('y', 'y', 'North car’s distance from the crossing', fixed('km', 0.01, 1000, 0.01)),
      V('dx', 'dx/dt', 'East car’s speed away from the crossing', fixed('km/h', -300, 300, 0.1)),
      V('dy', 'dy/dt', 'North car’s speed away from the crossing', fixed('km/h', -300, 300, 0.1)),
      V('D', 'D', 'Distance between the cars', fixed('km', 0.01, 1500, 0.0001)),
      V('dD', 'dD/dt', 'Rate the distance between them grows', fixed('km/h', -1e3, 1e3, 0.0001)),
    ],
    ...rels(
      rule(
        'x < D and y < D',
        'Each car’s distance {x} and {y} is less than the distance between them {D}',
        ['x', 'y', 'D'],
        (v) => v.x! < v.D! && v.y! < v.D!,
        'The distance between the cars is the hypotenuse, so it is longer than either road distance. Pick D larger than x and y.',
      ),
      rel(
        'D² = x² + y²',
        '{D}² = {x}² + {y}²',
        ['D', 'x', 'y'],
        (v) => v.D! ** 2 - v.x! ** 2 - v.y! ** 2,
        {
          D: [
            (v) => exact(Math.hypot(v.x!, v.y!)),
            '√({x}² + {y}²)',
            'The distance between the cars is the hypotenuse: add the squares of the two road distances, then the square root.',
          ],
          x: [
            (v) => (v.D! > v.y! ? exact(Math.sqrt(v.D! ** 2 - v.y! ** 2)) : undefined),
            '√({D}² − {y}²)',
            'Take y² from D², then the square root.',
          ],
          y: [
            (v) => (v.D! > v.x! ? exact(Math.sqrt(v.D! ** 2 - v.x! ** 2)) : undefined),
            '√({D}² − {x}²)',
            'Take x² from D², then the square root.',
          ],
        },
      ),
      rel(
        'D·(dD/dt) = x·(dx/dt) + y·(dy/dt)',
        '{D} × {dD} = {x} × {dx} + {y} × {dy}',
        ['D', 'dD', 'x', 'dx', 'y', 'dy'],
        (v) => v.D! * v.dD! - v.x! * v.dx! - v.y! * v.dy!,
        {
          dD: [
            (v) => (v.D! > 0 ? exact((v.x! * v.dx! + v.y! * v.dy!) / v.D!) : undefined),
            '({x} × {dx} + {y} × {dy}) ÷ {D}',
            'Differentiate D² = x² + y² in t, divide by 2, then divide by D.',
          ],
          dx: [
            (v) => (v.x! > 0 ? exact((v.D! * v.dD! - v.y! * v.dy!) / v.x!) : undefined),
            '({D} × {dD} − {y} × {dy}) ÷ {x}',
            'Take y·(dy/dt) from D·(dD/dt), then divide by x.',
          ],
          dy: [
            (v) => (v.y! > 0 ? exact((v.D! * v.dD! - v.x! * v.dx!) / v.y!) : undefined),
            '({D} × {dD} − {x} × {dx}) ÷ {y}',
            'Take x·(dx/dt) from D·(dD/dt), then divide by y.',
          ],
        },
      ),
    ),
    // x = 30 km, y = 40 km, 60 and 80 km/h: D = √(900 + 1600) = 50 km,
    // dD/dt = (30 × 60 + 40 × 80) ÷ 50 = (1800 + 3200) ÷ 50 = 100 km/h.
    example: { x: 30, y: 40, dx: 60, dy: 80, D: 50, dD: 100 },
    startWith: ['x', 'y', 'dx', 'dy'],
    // The two roads, a car at each end, D dashed; each rate an arrow on its side.
    representation: {
      kind: 'rightTriangle',
      a: 'y',
      b: 'x',
      c: 'D',
      extent: 40,
      rates: { a: 'dy', b: 'dx', c: 'dD' },
      scene: 'roads',
      keep: ['dx', 'dy', 'y'],
    },
  },
  {
    // Calculus I → Related rates and optimization: water into a cone on its apex, dh/dt = (dV/dt) ÷ (πr²).
    id: 'he.math.calc-1#2~cone-tank',
    title: 'Filling a cone tank',
    use: 'Use this for “Water pours at 0.03 m³/s into a cone tank, point down, 1.5 m in rim radius and 3 m deep. How fast does the level rise when the water is 1 m deep?”',
    unitSystems: ['metric'],
    assumptions: [
      'The tank is a cone standing on its point, so the water is a smaller cone of the same shape: r ÷ h = R ÷ H by similar triangles.',
      'The water’s volume is V = ⅓πr²h. Putting in r = Rh ÷ H and differentiating in time t gives dV/dt = πr²·(dh/dt).',
      'So the inflow spreads over the water’s surface: the same inflow raises the level fast near the point and slowly near the rim.',
      'Lengths are in m, the inflow in m³/s and the rise in m/s.',
    ],
    variables: [
      V('R', 'R', 'Rim radius of the tank', fixed('m', 0.01, 100, 0.01)),
      V('H', 'H', 'Height of the tank', fixed('m', 0.01, 100, 0.01)),
      V('h', 'h', 'Depth of the water', fixed('m', 0.01, 100, 0.01)),
      V('q', 'dV/dt', 'Inflow of water', fixed('m³/s', 0.0001, 100, 0.0001)),
      V('r', 'r', 'Radius of the water’s surface', fixed('m', 0.0001, 100, 0.0001)),
      V('dh', 'dh/dt', 'Rate the water level rises', fixed('m/s', 0, 1e4, 0.00001)),
    ],
    ...rels(
      rule(
        'h ≤ H',
        'The water’s depth {h} is at most the tank’s height {H}',
        ['h', 'H'],
        (v) => v.h! <= v.H! * (1 + 1e-9),
        'The water can’t be deeper than the tank is tall. Pick h no more than H.',
      ),
      rel(
        'r = Rh ÷ H',
        '{r} = {R} × {h} ÷ {H}',
        ['r', 'R', 'h', 'H'],
        (v) => v.r! * v.H! - v.R! * v.h!,
        {
          r: [
            (v) => (v.H! > 0 ? exact((v.R! * v.h!) / v.H!) : undefined),
            '{R} × {h} ÷ {H}',
            'Similar triangles: the surface radius is to the depth as the rim radius is to the height.',
          ],
          h: [
            (v) => (v.R! > 0 ? exact((v.r! * v.H!) / v.R!) : undefined),
            '{r} × {H} ÷ {R}',
            'Similar triangles, solved for the depth.',
          ],
        },
      ),
      rel(
        'dV/dt = πr²·(dh/dt)',
        '{q} = π × {r}² × {dh}',
        ['q', 'r', 'dh'],
        (v) => Math.PI * v.r! ** 2 * v.dh! - v.q!,
        {
          dh: [
            (v) => (v.r! > 0 ? exact(v.q! / (Math.PI * v.r! ** 2)) : undefined),
            '({q}) ÷ (π × {r}²)',
            'Divide the inflow by the area of the water’s surface, πr².',
          ],
          q: [
            (v) => exact(Math.PI * v.r! ** 2 * v.dh!),
            'π × {r}² × {dh}',
            'Multiply the surface’s area πr² by the rate the level rises.',
          ],
          r: [
            (v) => (v.dh! > 0 ? exact(Math.sqrt(v.q! / (Math.PI * v.dh!))) : undefined),
            '√(({q}) ÷ (π × {dh}))',
            'Divide the inflow by π times the rise, then take the square root.',
          ],
        },
      ),
    ),
    // R = 2 m, H = 4 m, h = 2 m, 0.05 m³/s: r = 2 × 2 ÷ 4 = 1 m,
    // dh/dt = 0.05 ÷ (π × 1²) = 0.01592 m/s.
    example: { R: 2, H: 4, h: 2, q: 0.05, r: 1, dh: 0.0159155 },
    startWith: ['R', 'H', 'h', 'q'],
    // The cone on its point, water to h with its surface radius r; the inflow poured in and the rise an arrow.
    representation: {
      kind: 'curvedSolid',
      shape: 'cone',
      radius: 'R',
      height: 'H',
      extent: 4,
      fill: { depth: 'h', r: 'r', inflow: 'q', rise: 'dh' },
    },
  },
  {
    // Calculus I → Definite integrals and the Fundamental Theorem: ∫ from a to b of (px² + qx + r) dx = F(b) − F(a).
    id: 'he.math.calc-1#3',
    use: 'Use this for “Evaluate the integral of 3x² − 4x + 2 from 0 to 2.”',
    assumptions: [
      'An antiderivative of f(x) = px² + qx + r is F(x) = px³ ÷ 3 + qx² ÷ 2 + rx: by the power rule, F′(x) = f(x).',
      'The Fundamental Theorem (part 2): the integral of f from a to b is F(b) − F(a). A + C would cancel, so it is left out.',
      'Area below the x-axis counts as negative, so the integral is the area above the axis less the area below it.',
      'Swapping the limits flips the sign: the integral from b to a is −I.',
    ],
    variables: [
      V('p', 'p', 'Coefficient of x²', { min: -50, max: 50, step: 0.1 }),
      V('q', 'q', 'Coefficient of x', { min: -50, max: 50, step: 0.1 }),
      V('r', 'r', 'Constant term', { min: -50, max: 50, step: 0.1 }),
      V('a', 'a', 'Lower limit', { min: -100, max: 100, step: 0.1 }),
      V('b', 'b', 'Upper limit', { min: -100, max: 100, step: 0.1 }),
      V('Fa', 'F(a)', 'Antiderivative at the lower limit', {
        min: -1e8,
        max: 1e8,
        derived: true,
        ...sixths,
      }),
      V('Fb', 'F(b)', 'Antiderivative at the upper limit', {
        min: -1e8,
        max: 1e8,
        derived: true,
        ...sixths,
      }),
      V('I', 'I', 'Value of the integral', { min: -2e8, max: 2e8, derived: true, ...sixths }),
    ],
    ...rels(
      derive(
        'F(a) = pa³ ÷ 3 + qa² ÷ 2 + ra',
        '{Fa} = {p} × {a}³ ÷ 3 + {q} × {a}² ÷ 2 + {r} × {a}',
        'Fa',
        ['p', 'q', 'r', 'a'],
        (v) => antiQuad(v, v.a!),
        (v) => antiAt(v, v.a!),
        (v) =>
          `Raise each power by 1 and divide by the new power: F(x) = ${antiForm(v)}. Put in x = a.`,
      ),
      derive(
        'F(b) = pb³ ÷ 3 + qb² ÷ 2 + rb',
        '{Fb} = {p} × {b}³ ÷ 3 + {q} × {b}² ÷ 2 + {r} × {b}',
        'Fb',
        ['p', 'q', 'r', 'b'],
        (v) => antiQuad(v, v.b!),
        (v) => antiAt(v, v.b!),
        'The same antiderivative, at x = b.',
      ),
      withStep(
        derive(
          'I = F(b) − F(a)',
          '{I} = {Fb} − {Fa}',
          'I',
          ['Fb', 'Fa'],
          (v) => v.Fb! - v.Fa!,
          (v) => `${inSixths(v.Fb!)} − ${v.Fa! < 0 ? `(${inSixths(v.Fa!)})` : inSixths(v.Fa!)}`,
          (v) =>
            v.Fb! - v.Fa! < 0
              ? 'Subtract F(a) from F(b). The integral is negative: more of the area lies below the x-axis than above it.'
              : 'Subtract F(a) from F(b): the change in the antiderivative from a to b.',
        ),
        'I',
        {
          work: (v) => [
            `∫ from ${formatNumber(v.a!)} to ${formatNumber(v.b!)} of (${polyForm([v.p!, v.q!, v.r!])}) dx = [${antiForm(v)}] from ${formatNumber(v.a!)} to ${formatNumber(v.b!)} = ${inSixths(exact(v.Fb! - v.Fa!))}`,
          ],
        },
      ),
    ),
    // ∫ from 1 to 3 of (x² + 1) dx: F(x) = x³ ÷ 3 + x, F(3) = 9 + 3 = 12, F(1) = 1 ÷ 3 + 1 = 4/3,
    // I = 12 − 4/3 = 32/3 = 10.667.
    example: { p: 1, q: 0, r: 1, a: 1, b: 3, Fa: 4 / 3, Fb: 12, I: 32 / 3 },
    startWith: ['p', 'q', 'r', 'a', 'b'],
    // f(x) = px² + qx + r with a to b shaded, the part above the axis + and below it −, ∫ written.
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'standard',
      a: 'p',
      b: 'q',
      c: 'r',
      area: { from: 'a', to: 'b', value: 'I', signed: true },
    },
  },
  {
    // Calculus I → Definite integrals: the right Riemann sum of x² on [a, b] against the exact value.
    id: 'he.math.calc-1#3~riemann',
    title: 'Riemann sums',
    use: 'Use this for “Estimate the integral of x² from 1 to 4 with 6 right-endpoint rectangles, then find the error.”',
    assumptions: [
      'Cut a to b into n strips of width Δx = (b − a) ÷ n. Each rectangle is as tall as f(x) = x² at its right end, x = a + iΔx.',
      'The rectangles’ total area Sₙ estimates the integral; the exact value is I = (b³ − a³) ÷ 3, by the Fundamental Theorem.',
      'Where x² rises across a strip (x ≥ 0), the right end is the tallest point, so Sₙ is too big; where it falls, too small.',
      'The more strips, the closer Sₙ comes to I: the integral is the limit of Sₙ as n → ∞.',
    ],
    variables: [
      V('a', 'a', 'Lower limit', { min: -100, max: 100, step: 0.1 }),
      V('b', 'b', 'Upper limit', { min: -100, max: 100, step: 0.1 }),
      V('n', 'n', 'Number of rectangles', { integer: true, min: 1, max: 100 }),
      V('dx', 'Δx', 'Width of each rectangle', { min: 0, max: 200, step: 0.0001, derived: true }),
      V('S', 'Sₙ', 'Right Riemann sum', { min: 0, max: 1e7, step: 0.0001, derived: true }),
      V('I', 'I', 'Exact value of the integral', {
        min: -1e7,
        max: 1e7,
        derived: true,
        ...sixths,
      }),
      V('E', 'E', 'Error of the sum, Sₙ − I', {
        min: -1e7,
        max: 1e7,
        step: 0.0001,
        derived: true,
      }),
    ],
    ...rels(
      rule(
        'a < b',
        'The lower limit {a} is below the upper limit {b}',
        ['a', 'b'],
        (v) => v.a! < v.b!,
        'Pick a lower limit a below the upper limit b, so the strips run left to right.',
      ),
      derive(
        'Δx = (b − a) ÷ n',
        '{dx} = ({b} − {a}) ÷ {n}',
        'dx',
        ['b', 'a', 'n'],
        (v) => (v.b! - v.a!) / v.n!,
        '({b} − {a}) ÷ {n}',
        'Cut the interval from a to b into n strips of equal width.',
      ),
      withStep(
        derive(
          'Sₙ = Δx × (f(a + Δx) + f(a + 2Δx) + … + f(b))',
          '{S} = {dx} × ({n} × {a}² + 2 × {a} × {dx} × {n} × ({n} + 1) ÷ 2 + {dx}² × {n} × ({n} + 1) × (2 × {n} + 1) ÷ 6)',
          'S',
          ['dx', 'a', 'n'],
          rightSum,
          // Few strips: the right ends squared, as a student adds them; many: the sum formula.
          (v) =>
            v.n! <= 6
              ? `(${rightEnds(v)
                  .map((x) => `${signed(x)}²`)
                  .join(' + ')}) × ${formatNumber(v.dx!)}`
              : '{dx} × ({n} × {a}² + 2 × {a} × {dx} × {n} × ({n} + 1) ÷ 2 + {dx}² × {n} × ({n} + 1) × (2 × {n} + 1) ÷ 6)',
          (v) =>
            v.n! <= 6
              ? 'Square each right end to get the rectangle’s height, add the heights, then multiply by the width Δx.'
              : 'Each height is (a + iΔx)² = a² + 2aiΔx + i²Δx². Adding them needs the sums 1 + 2 + … + n and 1² + 2² + … + n², worked out below.',
        ),
        'S',
        {
          // The heights added; or the sums of i and i² the formula holds, worked out.
          work: (v) => {
            const n = v.n!;
            if (n <= 6)
              return [
                `Sₙ = (${rightHeights(v)
                  .map((h) => formatNumber(h))
                  .join(' + ')}) × ${formatNumber(v.dx!)}`,
              ];
            return [
              `1 + 2 + … + ${n} = (${n} × ${n + 1}) ÷ 2 = ${(n * (n + 1)) / 2}`,
              `1² + 2² + … + ${n}² = (${n} × ${n + 1} × ${2 * n + 1}) ÷ 6 = ${(n * (n + 1) * (2 * n + 1)) / 6}`,
            ];
          },
        },
      ),
      derive(
        'I = (b³ − a³) ÷ 3',
        '{I} = ({b}³ − {a}³) ÷ 3',
        'I',
        ['b', 'a'],
        (v) => (v.b! ** 3 - v.a! ** 3) / 3,
        '({b}³ − {a}³) ÷ 3',
        'F(x) = x³ ÷ 3 is an antiderivative of x², so the integral is F(b) − F(a).',
      ),
      withStep(
        derive(
          'E = Sₙ − I',
          '{E} = {S} − {I}',
          'E',
          ['S', 'I'],
          (v) => v.S! - v.I!,
          '{S} − {I}',
          'Subtract the exact value from the sum: how far the rectangles miss.',
        ),
        'E',
        {
          note: (v) =>
            v.E === undefined
              ? ''
              : Math.abs(v.E) < 1e-9
                ? '→ The sum hits the exact value: the overs and unders cancel'
                : `→ The sum is ${v.E > 0 ? 'too big' : 'too small'}; more rectangles bring it closer to I`,
        },
      ),
    ),
    // [0, 2], n = 4: Δx = 0.5, S₄ = (0.25 + 1 + 2.25 + 4) × 0.5 = 3.75; I = 8/3 = 2.667; E = 1.083.
    example: { a: 0, b: 2, n: 4, dx: 0.5, S: 3.75, I: 8 / 3, E: 3.75 - 8 / 3 },
    startWith: ['a', 'b', 'n'],
    // y = x² with a to b shaded and the n right-end rectangles over it, their sum Sₙ written.
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'standard',
      a: 1,
      b: 0,
      c: 0,
      shade: { from: 'a', to: 'b' },
      riemann: { n: 'n', from: 'a', to: 'b', side: 'right', sum: 'S' },
      fixed: true,
    },
  },
  {
    // Calculus I → Definite integrals: the area function F(x) = ∫ from a to x of (mt + c) dt and F′(x) = f(x).
    id: 'he.math.calc-1#3~accumulation',
    title: 'The area function and the Fundamental Theorem, part 1',
    use: 'Use this for “F(x) is the integral of 3t − 2 from 1 to x. Find F(4) and F′(4).”',
    assumptions: [
      'F(x) = ∫ from a to x of f(t) dt collects the signed area under f(t) = mt + c from a up to x. The letter t runs along the axis; x is where it stops.',
      'An antiderivative of mt + c is G(t) = mt² ÷ 2 + ct, so F(x) = G(x) − G(a), by the Fundamental Theorem (part 2).',
      'The Fundamental Theorem (part 1): F′(x) = f(x). Moving x on adds a thin strip as tall as f(x), so the area grows at that rate.',
      'Area below the t-axis counts as negative, and F(a) = 0. When x is left of a, F(x) is minus the area from x to a.',
    ],
    variables: [
      V('m', 'm', 'Slope of f(t) = mt + c', { min: -50, max: 50, step: 0.1 }),
      V('c', 'c', 'Intercept of f(t) = mt + c', { min: -50, max: 50, step: 0.1 }),
      V('a', 'a', 'Start of the area (lower limit)', { min: -100, max: 100, step: 0.1 }),
      V('x', 'x', 'End of the area (upper limit)', { min: -100, max: 100, step: 0.1 }),
      V('F', 'F(x)', 'Area function at x', { min: -1e7, max: 1e7, step: 0.0001, derived: true }),
      V('Fp', 'F′(x)', 'Slope of the area function at x', {
        min: -1e4,
        max: 1e4,
        step: 0.0001,
        derived: true,
      }),
    ],
    ...rels(
      withStep(
        derive(
          'F(x) = m(x² − a²) ÷ 2 + c(x − a)',
          '{F} = {m} × ({x}² − {a}²) ÷ 2 + {c} × ({x} − {a})',
          'F',
          ['m', 'c', 'a', 'x'],
          areaSoFar,
          '{m} × ({x}² − {a}²) ÷ 2 + {c} × ({x} − {a})',
          (v) =>
            `An antiderivative of f(t) = ${lineForm(v)} is G(t) = ${lineAnti(v)}. Take G at x less G at a: m(x² − a²) ÷ 2 + c(x − a).`,
        ),
        'F',
        {
          work: (v) => {
            const [a, x] = [formatNumber(v.a!), formatNumber(v.x!)];
            const F = formatNumber(exact(areaSoFar(v)));
            const head = `∫ from ${a} to ${x} of (${lineForm(v)}) dt`;
            return [
              v.m === 0 && v.c === 0
                ? `${head} = ${F}`
                : `${head} = [${lineAnti(v)}] from ${a} to ${x} = ${F}`,
            ];
          },
          note: (v) =>
            v.x! < v.a!
              ? '→ x is left of a, so the area is counted backwards: F(x) is minus the area from x to a'
              : '',
        },
      ),
      derive(
        'F′(x) = mx + c',
        '{Fp} = {m} × {x} + {c}',
        'Fp',
        ['m', 'x', 'c'],
        (v) => v.m! * v.x! + v.c!,
        '{m} × {x} + {c}',
        'By the Fundamental Theorem (part 1), the slope of F at x is the height of f at x: put t = x into mt + c. No integral is needed.',
      ),
    ),
    // m = 2, c = 1, a = 0, x = 3: G(t) = t² + t, F(3) = (9 + 3) − 0 = 12; F′(3) = 2 × 3 + 1 = 7.
    example: { m: 2, c: 1, a: 0, x: 3, F: 12, Fp: 7 },
    startWith: ['m', 'c', 'a', 'x'],
    // f(t) = mt + c shaded from a to x, the point (x, f(x)); under it the panel of F with its
    // tangent at x of slope f(x).
    representation: {
      kind: 'functionGraph',
      family: 'linear',
      m: 'm',
      b: 'c',
      input: 't',
      at: { x: 'x', y: 'Fp' },
      accumulation: { from: 'a', x: 'x', value: 'F' },
    },
  },
];
