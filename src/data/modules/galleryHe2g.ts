/**
 * College gallery demos, round 2, group G (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC21: `fieldPlot` slope fields with Euler's method, vector fields with work along a path,
 * phase portraits of x′ = Ax and of predator and prey, and two species' isoclines.
 * HC37: `functionGraph` `tangent` (the power rule, a linear approximation) and `band` (ε–δ).
 * HC38: `functionGraph` `series` (Maclaurin polynomials, a series solution, term-by-term ∫) and
 * the families `taylor` and `linearOde`.
 */
import { odeSolution } from '@/components/module/reps/functionGraphHe2g';
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, Representation, StepText } from './types';

type Solver = (v: Values) => number | number[] | undefined;
type Rule = { relation: Relation; steps: Record<string, StepText> };

/** A value typed or worked out: min to max. */
const num = (
  id: string,
  symbol: string,
  name: string,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, min, max, ...more });

/** A number written into step text: up to 7 figures, a negative one bracketed. */
const lit = (x: number) => {
  const s = String(Number(x.toPrecision(7))).replace('-', '−');
  return x < 0 ? `(${s})` : s;
};
/** A result as a box shows it: × 10ⁿ when very small or large (4.167 × 10⁻⁶). */
const shown = (x: number) => {
  const ax = Math.abs(x);
  if (ax === 0 || (ax >= 1e-4 && ax < 1e7)) return lit(x);
  const e = Math.floor(Math.log10(ax));
  const m = Number((x / 10 ** e).toPrecision(4));
  const sup = [...String(e)].map((ch) => (ch === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(ch)])).join('');
  return `${String(m).replace('-', '−')} × 10${sup}`;
};
/** A template with each {id} replaced by its value. */
const fill = (t: string, v: Values) => t.replace(/\{(\w+)\}/g, (_, id: string) => lit(v[id]!));

/** A value worked out, never typed. */
const out = (id: string, symbol: string, name: string, more: Partial<VariableDef> = {}) =>
  num(id, symbol, name, -1e9, 1e9, { derived: true, ...more });

/** A finite number, or nothing. */
const fin = (x: number) => (Number.isFinite(x) ? x : undefined);

/** A relation with its steps: each variable's solver, expression and explanation. */
function rule(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  parts: Record<string, [Solver, StepText['expr'], StepText['how']]>,
): Rule {
  const solve: Record<string, Solver> = {};
  const steps: Record<string, StepText> = {};
  for (const [v, [fn, expr, how]] of Object.entries(parts)) {
    solve[v] = fn;
    steps[v] = { expr, how };
  }
  for (const v of vars) if (!(v in solve)) solve[v] = () => undefined;
  return { relation: { id, display, vars, residual, solve }, steps };
}

/** A value worked out from others, never solved backwards. */
const derive = (
  id: string,
  x: string,
  inputs: string[],
  display: string,
  f: (v: Values) => number | undefined,
  expr: StepText['expr'],
  how: StepText['how'],
  /** The check as arithmetic, when the display is in words (∫, “Euler’s method”). */
  checked = false,
): Rule => {
  const r = rule(id, display, [x, ...inputs], (v) => v[x]! - (f(v) ?? NaN), {
    [x]: [(v) => fin(f(v) ?? NaN), expr, how],
  });
  if (checked)
    r.relation.check = (v) =>
      `${fill(typeof expr === 'string' ? expr : expr(v), v)} = ${shown(v[x]!)}`;
  return r;
};

/** A rule the values must keep, with the message when they don't. */
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
function page(
  d: Omit<ModuleDef, 'relations' | 'steps' | 'representation'> & {
    rules: Rule[];
    representation: Representation;
  },
): ModuleDef {
  const { rules, ...rest } = d;
  return {
    ...rest,
    relations: rules.map((r) => r.relation),
    steps: Object.fromEntries(rules.map((r) => [r.relation.id, r.steps])),
  };
}

/** Values worked out from the typed ones of an example, in order. */
function example(typed: Values, ...work: [string, (v: Values) => number][]): Values {
  const v: Values = { ...typed };
  for (const [id, f] of work) v[id] = f(v);
  return v;
}

/** A number for a sentence: 4 figures. */
const say = (x: number) => String(Number(x.toPrecision(4))).replace('-', '−');
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sub = (n: number) => [...String(n)].map((d) => SUB[Number(d)]).join('');

// ── HC21: slope fields and Euler's method ──

/** Euler's points (x, y) for y′ = g(x, y). */
function eulerPts(g: (x: number, y: number) => number, v: Values): [number, number][] {
  const pts: [number, number][] = [[v.x0!, v.y0!]];
  const n = Math.round(v.n!);
  for (let i = 0; i < n; i++) {
    const [x, y] = pts[i]!;
    pts.push([v.x0! + (i + 1) * v.h!, y + v.h! * g(x, y)]);
  }
  return pts;
}

/** A slope-field page: y′ = g, Euler from (x₀, y₀), the exact solution at the end. */
function slopePage(o: {
  id: string;
  title: string;
  use: string;
  assumptions: string[];
  coefficients: VariableDef[];
  dy: string;
  display: string;
  g: (v: Values) => (x: number, y: number) => number;
  /** The last step written with the page's values in braces and the previous point given. */
  stepExpr: (xPrev: string, yPrev: string) => string;
  exact: {
    f: (v: Values) => number | undefined;
    expr: StepText['expr'];
    how: string;
    display: string;
  };
  typed: Values;
  vars: string[];
}): ModuleDef {
  const yn = (v: Values) => {
    const p = eulerPts(o.g(v), v);
    return p[p.length - 1]![1];
  };
  return page({
    id: o.id,
    title: o.title,
    use: o.use,
    assumptions: o.assumptions,
    variables: [
      ...o.coefficients,
      num('x0', 'x₀', 'Starting x', -100, 100, { step: 0.5 }),
      num('y0', 'y₀', 'Starting y', -100, 100, { step: 0.5 }),
      num('h', 'h', 'Step size', 0.001, 5, { step: 0.05 }),
      num('n', 'n', 'Number of steps', 1, 10, { integer: true }),
      out('X', 'xₙ', 'Last x'),
      out('yn', 'yₙ', 'Euler’s last y', { min: -1e6, max: 1e6 }),
      out('ye', 'y(xₙ)', 'Exact y at the last x', { min: -1e6, max: 1e6 }),
    ],
    rules: [
      derive(
        'end',
        'X',
        ['x0', 'n', 'h'],
        '{X} = {x0} + {n} × {h}',
        (v) => v.x0! + Math.round(v.n!) * v.h!,
        '{x0} + {n} × {h}',
        'Each of the n steps moves h across.',
      ),
      derive(
        'euler',
        'yn',
        [...o.vars, 'x0', 'y0', 'h', 'n'],
        `{yn} = Euler’s method on ${o.display} from ({x0}, {y0}), {n} steps of {h}`,
        yn,
        (v) => {
          const p = eulerPts(o.g(v), v);
          const [x, y] = p[p.length - 2]!;
          return o.stepExpr(lit(x), lit(y));
        },
        (v) => {
          const p = eulerPts(o.g(v), v);
          const n = p.length - 1;
          const before = p
            .slice(1, -1)
            .map(([, y], i) => `y${sub(i + 1)} = ${say(y)}`)
            .join(', ');
          return n === 1
            ? 'One step: y₁ = y₀ + h × (the slope at the start).'
            : `Each step adds h × (the slope where it starts): ${before}. The last step starts at y${sub(n - 1)}.`;
        },
        true,
      ),
      derive(
        'exact',
        'ye',
        [...o.vars, 'x0', 'y0', 'X'],
        o.exact.display,
        o.exact.f,
        o.exact.expr,
        o.exact.how,
        true,
      ),
    ],
    example: example(
      o.typed,
      ['X', (v) => v.x0! + v.n! * v.h!],
      ['yn', yn],
      ['ye', (v) => o.exact.f(v)!],
    ),
    startWith: [...o.vars, 'x0', 'y0', 'h', 'n'],
    representation: {
      kind: 'fieldPlot',
      mode: 'slope',
      dy: o.dy,
      start: { x: 'x0', y: 'y0' },
      euler: { h: 'h', n: 'n', last: 'yn', exact: 'ye' },
    },
  });
}

/** y = y_p + (y₀ − y_p(x₀))e^(b(x − x₀)), y_p = −(a ÷ b)x − (a ÷ b + c) ÷ b (b ≠ 0). */
const linearExact = (v: Values) => {
  const [a, b, c] = [v.a!, v.b!, v.c!];
  if (b === 0) return v.y0! + (a / 2) * (v.X! ** 2 - v.x0! ** 2) + c * (v.X! - v.x0!);
  const q = (a / b + c) / b;
  return (v.y0! + (a / b) * v.x0! + q) * Math.exp(b * (v.X! - v.x0!)) - (a / b) * v.X! - q;
};

const SLOPE = slopePage({
  id: 'g.he-fieldPlot-slope',
  title: 'Euler’s method on a slope field',
  use: 'Use this for “Use Euler’s method with h = 0.1 to estimate y(0.2) for y′ = x + y, y(0) = 1.”',
  assumptions: [
    'Each step follows the slope at its start for one step h: yₖ₊₁ = yₖ + h × y′(xₖ, yₖ).',
    'The exact solution of y′ = ax + by + c is a line plus Ce^(bx), C from y(x₀) = y₀.',
    'Smaller steps follow the curve more closely; the error shrinks about in proportion to h.',
  ],
  coefficients: [
    num('a', 'a', 'Coefficient of x', -10, 10, { step: 0.5 }),
    num('b', 'b', 'Coefficient of y', -10, 10, { step: 0.5 }),
    num('c', 'c', 'Constant term', -10, 10, { step: 0.5 }),
  ],
  vars: ['a', 'b', 'c'],
  dy: 'a*x + b*y + c',
  display: 'y′ = {a}x + {b}y + {c}',
  g: (v) => (x, y) => v.a! * x + v.b! * y + v.c!,
  stepExpr: (x, y) => `${y} + {h} × ({a} × ${x} + {b} × ${y} + {c})`,
  exact: {
    f: linearExact,
    display: '{ye} = the solution of y′ = {a}x + {b}y + {c} through ({x0}, {y0}) at {X}',
    expr: (v) =>
      v.b === 0
        ? '{y0} + {a} ÷ 2 × ({X} × {X} − {x0} × {x0}) + {c} × ({X} − {x0})'
        : '({y0} + {a} ÷ {b} × {x0} + ({a} ÷ {b} + {c}) ÷ {b}) × e^({b} × ({X} − {x0})) − {a} ÷ {b} × {X} − ({a} ÷ {b} + {c}) ÷ {b}',
    how: 'A line y = px + q solves the equation when p = −a ÷ b; Ce^(b(x − x₀)) fits the start.',
  },
  typed: { a: 1, b: 1, c: 0, x0: 0, y0: 1, h: 0.1, n: 2 },
});

/** P = K ÷ (1 + Ae^(−r(x − x₀))), A = (K − y₀) ÷ y₀. */
const logisticExact = (v: Values) =>
  v.K! / (1 + ((v.K! - v.y0!) / v.y0!) * Math.exp(-v.r! * (v.X! - v.x0!)));

const SLOPE_LOGISTIC = slopePage({
  id: 'g.he-fieldPlot-slope-logistic',
  title: 'Euler’s method with large steps: logistic growth',
  use: 'Use this for “Estimate y(5) for y′ = 0.8y(1 − y/10), y(0) = 1, with ten Euler steps of 0.5.”',
  assumptions: [
    'y′ = ry(1 − y/K): growth slows as y nears the carrying capacity K.',
    'Each Euler step follows the slope at its start, so a large h overshoots the bend.',
    'The exact solution is K ÷ (1 + Ae^(−r(x − x₀))) with A = (K − y₀) ÷ y₀ (y₀ > 0).',
  ],
  coefficients: [
    num('r', 'r', 'Growth rate', 0.01, 5, { step: 0.05 }),
    num('K', 'K', 'Carrying capacity', 0.1, 10000, { step: 1 }),
  ],
  vars: ['r', 'K'],
  dy: 'r*y*(1 - y/K)',
  display: 'y′ = {r}y(1 − y ÷ {K})',
  g: (v) => (_x, y) => v.r! * y * (1 - y / v.K!),
  stepExpr: (_x, y) => `${y} + {h} × {r} × ${y} × (1 − ${y} ÷ {K})`,
  exact: {
    f: (v) => (v.y0! > 0 ? logisticExact(v) : undefined),
    display: '{ye} = {K} ÷ (1 + ({K} − {y0}) ÷ {y0} × e^(−{r} × ({X} − {x0})))',
    expr: '{K} ÷ (1 + ({K} − {y0}) ÷ {y0} × e^(−{r} × ({X} − {x0})))',
    how: 'The logistic curve through the start: A = (K − y₀) ÷ y₀ sets where it begins.',
  },
  typed: { r: 0.8, K: 10, x0: 0, y0: 1, h: 0.5, n: 10 },
});

// ── HC21: vector fields and work ──

const VECTOR = page({
  id: 'g.he-fieldPlot-vector',
  title: 'Work along a segment in a linear field',
  use: 'Use this for “Find the work done by F = ⟨−y, x⟩ along the segment from (1, 0) to (0, 1).”',
  assumptions: [
    'r(t) = A + t(B − A) for t from 0 to 1, so dr = (B − A) dt.',
    'F is linear, so F(r(t)) · (B − A) is linear in t and its average is its value at the midpoint M.',
    'Running the path backward, from B to A, flips the sign of the work.',
  ],
  variables: [
    num('al', 'α', 'x in P', -50, 50, { step: 0.5 }),
    num('be', 'β', 'y in P', -50, 50, { step: 0.5 }),
    num('ga', 'γ', 'x in Q', -50, 50, { step: 0.5 }),
    num('de', 'δ', 'y in Q', -50, 50, { step: 0.5 }),
    num('ax', 'a₁', 'Start A, x', -100, 100, { step: 0.5 }),
    num('ay', 'a₂', 'Start A, y', -100, 100, { step: 0.5 }),
    num('bx', 'b₁', 'End B, x', -100, 100, { step: 0.5 }),
    num('by', 'b₂', 'End B, y', -100, 100, { step: 0.5 }),
    out('mx', 'm₁', 'Midpoint, x'),
    out('my', 'm₂', 'Midpoint, y'),
    out('W', 'W', 'Work along the segment'),
  ],
  rules: [
    derive(
      'mid-x',
      'mx',
      ['ax', 'bx'],
      '{mx} = ({ax} + {bx}) ÷ 2',
      (v) => (v.ax! + v.bx!) / 2,
      '({ax} + {bx}) ÷ 2',
      'The midpoint is halfway along.',
    ),
    derive(
      'mid-y',
      'my',
      ['ay', 'by'],
      '{my} = ({ay} + {by}) ÷ 2',
      (v) => (v.ay! + v.by!) / 2,
      '({ay} + {by}) ÷ 2',
      'The midpoint is halfway along.',
    ),
    derive(
      'work',
      'W',
      ['al', 'be', 'ga', 'de', 'mx', 'my', 'ax', 'ay', 'bx', 'by'],
      '{W} = ({al} × {mx} + {be} × {my}) × ({bx} − {ax}) + ({ga} × {mx} + {de} × {my}) × ({by} − {ay})',
      (v) =>
        (v.al! * v.mx! + v.be! * v.my!) * (v.bx! - v.ax!) +
        (v.ga! * v.mx! + v.de! * v.my!) * (v.by! - v.ay!),
      '({al} × {mx} + {be} × {my}) × ({bx} − {ax}) + ({ga} × {mx} + {de} × {my}) × ({by} − {ay})',
      'F at the midpoint, dotted with the displacement B − A.',
    ),
  ],
  example: example(
    { al: 0, be: -1, ga: 1, de: 0, ax: 1, ay: 0, bx: 0, by: 1 },
    ['mx', (v) => (v.ax! + v.bx!) / 2],
    ['my', (v) => (v.ay! + v.by!) / 2],
    [
      'W',
      (v) =>
        (v.al! * v.mx! + v.be! * v.my!) * (v.bx! - v.ax!) +
        (v.ga! * v.mx! + v.de! * v.my!) * (v.by! - v.ay!),
    ],
  ),
  startWith: ['al', 'be', 'ga', 'de', 'ax', 'ay', 'bx', 'by'],
  representation: {
    kind: 'fieldPlot',
    mode: 'vector',
    P: 'al*x + be*y',
    Q: 'ga*x + de*y',
    path: { shape: 'segment', from: ['ax', 'ay'], to: ['bx', 'by'] },
    work: 'W',
  },
});

const GREEN = page({
  id: 'g.he-fieldPlot-green',
  title: 'Green’s theorem on a rectangle',
  use: 'Use this for “Use Green’s theorem to find the circulation of ⟨−y², x²⟩ around the rectangle 0 ≤ x ≤ 2, 0 ≤ y ≤ 1.”',
  assumptions: [
    'The boundary runs counterclockwise: bottom, right side, top, left side.',
    '∮ F · dr = ∬ (Q_x − P_y) dA; here Q_x − P_y = 2x + 2y, the circulation per unit area.',
    'On the bottom y = 0 and on the left x = 0, so F · dr is 0 there.',
  ],
  variables: [
    num('a', 'a', 'Width', 0.1, 100, { step: 0.5 }),
    num('b', 'b', 'Height', 0.1, 100, { step: 0.5 }),
    out('s1', 'C₁', 'Bottom side'),
    out('s2', 'C₂', 'Right side'),
    out('s3', 'C₃', 'Top side'),
    out('s4', 'C₄', 'Left side'),
    out('C', 'Γ', 'Circulation'),
    out('D', 'I', 'Double integral'),
  ],
  rules: [
    derive(
      'bottom',
      's1',
      ['a'],
      '{s1} = ∫ from 0 to {a} of P(x, 0) dx',
      () => 0,
      '0 × {a}',
      'On the bottom y = 0, so P = −y² = 0 and dy = 0.',
      true,
    ),
    derive(
      'right',
      's2',
      ['a', 'b'],
      '{s2} = ∫ from 0 to {b} of Q({a}, y) dy',
      (v) => v.a! * v.a! * v.b!,
      '{a} × {a} × {b}',
      'Up the right side x = a, so Q = a² all the way up.',
      true,
    ),
    derive(
      'top',
      's3',
      ['a', 'b'],
      '{s3} = ∫ from {a} to 0 of P(x, {b}) dx',
      (v) => v.a! * v.b! * v.b!,
      '{a} × {b} × {b}',
      'Leftward along the top y = b: P = −b², and dx runs from a to 0.',
      true,
    ),
    derive(
      'left',
      's4',
      ['b'],
      '{s4} = ∫ from {b} to 0 of Q(0, y) dy',
      () => 0,
      '0 × {b}',
      'On the left x = 0, so Q = x² = 0 and dx = 0.',
      true,
    ),
    derive(
      'circulation',
      'C',
      ['s1', 's2', 's3', 's4'],
      '{C} = {s1} + {s2} + {s3} + {s4}',
      (v) => v.s1! + v.s2! + v.s3! + v.s4!,
      '{s1} + {s2} + {s3} + {s4}',
      'The four sides added, counterclockwise.',
    ),
    derive(
      'double',
      'D',
      ['a', 'b'],
      '{D} = ∬ (2x + 2y) dA over {a} × {b}',
      (v) => v.a! * v.b! * (v.a! + v.b!),
      '{a} × {b} × ({a} + {b})',
      'Green’s theorem: the same number from the area, ∬ (2x + 2y) dA.',
      true,
    ),
  ],
  example: example(
    { a: 2, b: 1 },
    ['s1', () => 0],
    ['s2', (v) => v.a! * v.a! * v.b!],
    ['s3', (v) => v.a! * v.b! * v.b!],
    ['s4', () => 0],
    ['C', (v) => v.s1! + v.s2! + v.s3! + v.s4!],
    ['D', (v) => v.a! * v.b! * (v.a! + v.b!)],
  ),
  startWith: ['a', 'b'],
  representation: {
    kind: 'fieldPlot',
    mode: 'vector',
    P: '-y^2',
    Q: 'x^2',
    path: { shape: 'rectangle', width: 'a', height: 'b' },
    sides: ['s1', 's2', 's3', 's4'],
    work: 'C',
  },
});

/** φ = px² + qxy + sy² at (x, y). */
const phi = (v: Values, x: number, y: number) => v.pa! * x * x + v.pb! * x * y + v.pc! * y * y;

const CONSERVATIVE = page({
  id: 'g.he-fieldPlot-conservative',
  title: 'A gradient field: work from the potential',
  use: 'Use this for “F = ∇φ with φ = x² + 3xy. Find the work along any path from (0, 0) to (1, 2).”',
  assumptions: [
    'F = ∇φ = ⟨2ax + by, bx + 2cy⟩ for φ = ax² + bxy + cy².',
    'P_y = b = Q_x, so the field is conservative: the work depends only on the ends.',
    'W = φ(B) − φ(A) on any path from A to B.',
  ],
  variables: [
    num('pa', 'a', 'x² in φ', -50, 50, { step: 0.5 }),
    num('pb', 'b', 'xy in φ', -50, 50, { step: 0.5 }),
    num('pc', 'c', 'y² in φ', -50, 50, { step: 0.5 }),
    num('x1', 'a₁', 'Start A, x', -100, 100, { step: 0.5 }),
    num('y1', 'a₂', 'Start A, y', -100, 100, { step: 0.5 }),
    num('x2', 'b₁', 'End B, x', -100, 100, { step: 0.5 }),
    num('y2', 'b₂', 'End B, y', -100, 100, { step: 0.5 }),
    out('fa', 'φ(A)', 'Potential at A'),
    out('fb', 'φ(B)', 'Potential at B'),
    out('W', 'W', 'Work from A to B'),
  ],
  rules: [
    derive(
      'phi-a',
      'fa',
      ['pa', 'pb', 'pc', 'x1', 'y1'],
      '{fa} = {pa} × {x1}² + {pb} × {x1} × {y1} + {pc} × {y1}²',
      (v) => phi(v, v.x1!, v.y1!),
      '{pa} × {x1} × {x1} + {pb} × {x1} × {y1} + {pc} × {y1} × {y1}',
      'The potential at the start.',
    ),
    derive(
      'phi-b',
      'fb',
      ['pa', 'pb', 'pc', 'x2', 'y2'],
      '{fb} = {pa} × {x2}² + {pb} × {x2} × {y2} + {pc} × {y2}²',
      (v) => phi(v, v.x2!, v.y2!),
      '{pa} × {x2} × {x2} + {pb} × {x2} × {y2} + {pc} × {y2} × {y2}',
      'The potential at the end.',
    ),
    derive(
      'work',
      'W',
      ['fa', 'fb'],
      '{W} = {fb} − {fa}',
      (v) => v.fb! - v.fa!,
      '{fb} − {fa}',
      'The fundamental theorem for line integrals: the end’s potential minus the start’s.',
    ),
  ],
  example: example(
    { pa: 1, pb: 3, pc: 0, x1: 0, y1: 0, x2: 1, y2: 2 },
    ['fa', (v) => phi(v, v.x1!, v.y1!)],
    ['fb', (v) => phi(v, v.x2!, v.y2!)],
    ['W', (v) => v.fb! - v.fa!],
  ),
  startWith: ['pa', 'pb', 'pc', 'x1', 'y1', 'x2', 'y2'],
  representation: {
    kind: 'fieldPlot',
    mode: 'vector',
    P: '2*pa*x + pb*y',
    Q: 'pb*x + 2*pc*y',
    path: { shape: 'segment', from: ['x1', 'y1'], to: ['x2', 'y2'] },
    work: 'W',
  },
});

// ── HC21: phase portraits ──

const MATRIX = [
  num('m11', 'a', 'Row 1, column 1', -20, 20, { step: 0.5 }),
  num('m12', 'b', 'Row 1, column 2', -20, 20, { step: 0.5 }),
  num('m21', 'c', 'Row 2, column 1', -20, 20, { step: 0.5 }),
  num('m22', 'd', 'Row 2, column 2', -20, 20, { step: 0.5 }),
];
const TRACE: Rule[] = [
  derive(
    'trace',
    'T',
    ['m11', 'm22'],
    '{T} = {m11} + {m22}',
    (v) => v.m11! + v.m22!,
    '{m11} + {m22}',
    'The trace adds the diagonal: it is λ₁ + λ₂.',
  ),
  derive(
    'det',
    'D',
    ['m11', 'm12', 'm21', 'm22'],
    '{D} = {m11} × {m22} − {m12} × {m21}',
    (v) => v.m11! * v.m22! - v.m12! * v.m21!,
    '{m11} × {m22} − {m12} × {m21}',
    'The determinant ad − bc: it is λ₁λ₂.',
  ),
  derive(
    'disc',
    'disc',
    ['T', 'D'],
    '{disc} = {T}² − 4 × {D}',
    (v) => v.T! * v.T! - 4 * v.D!,
    '{T} × {T} − 4 × {D}',
    'T² − 4D decides real or complex eigenvalues.',
  ),
];
const TRACE_VARS = [
  out('T', 'T', 'Trace'),
  out('D', 'D', 'Determinant'),
  out('disc', 'Δ', 'Discriminant T² − 4D'),
];
const trace = (v: Values) => {
  v.T = v.m11! + v.m22!;
  v.D = v.m11! * v.m22! - v.m12! * v.m21!;
  v.disc = v.T * v.T - 4 * v.D;
  return v;
};
const lam = (sign: 1 | -1) => (v: Values) =>
  v.disc! >= 0 ? (v.T! + sign * Math.sqrt(v.disc!)) / 2 : undefined;
const LAMBDAS: Rule[] = [
  derive(
    'l1',
    'l1',
    ['T', 'disc'],
    '{l1} = ({T} + √{disc}) ÷ 2',
    lam(1),
    '({T} + √({disc})) ÷ 2',
    'The larger root of λ² − Tλ + D = 0.',
  ),
  derive(
    'l2',
    'l2',
    ['T', 'disc'],
    '{l2} = ({T} − √{disc}) ÷ 2',
    lam(-1),
    '({T} − √({disc})) ÷ 2',
    'The smaller root of λ² − Tλ + D = 0.',
  ),
];
const LAMBDA_VARS = [out('l1', 'λ₁', 'Larger eigenvalue'), out('l2', 'λ₂', 'Smaller eigenvalue')];

const PHASE = page({
  id: 'g.he-fieldPlot-phase',
  title: 'Classify an equilibrium: x′ = Ax',
  use: 'Use this for “Classify the equilibrium of x′ = x + 2y, y′ = 2x + y.”',
  assumptions: [
    'The type comes from T and D: a saddle when D < 0; a node or spiral by the sign of T² − 4D.',
    'Stable when T < 0, unstable when T > 0.',
    'Straight-line solutions run along the eigenvectors, the dashed lines.',
  ],
  variables: [...MATRIX, ...TRACE_VARS, ...LAMBDA_VARS],
  rules: [
    ...TRACE,
    ...LAMBDAS,
    limit(
      'real',
      '{disc} ≥ 0',
      (v) => v.disc! >= 0,
      'T² − 4D < 0: the eigenvalues are complex (a spiral or a center).',
    ),
  ],
  example: example(
    { m11: 1, m12: 2, m21: 2, m22: 1 },
    ['T', (v) => trace(v).T!],
    ['l1', (v) => lam(1)(v)!],
    ['l2', (v) => lam(-1)(v)!],
  ),
  startWith: ['m11', 'm12', 'm21', 'm22'],
  representation: {
    kind: 'fieldPlot',
    mode: 'phase',
    matrix: ['m11', 'm12', 'm21', 'm22'],
    eigen: { l1: 'l1', l2: 'l2' },
  },
});

const SPIRAL = page({
  id: 'g.he-fieldPlot-spiral',
  title: 'Complex eigenvalues: a spiral',
  use: 'Use this for “Classify the equilibrium of x′ = −x − 2y, y′ = 2x − y.”',
  assumptions: [
    'T² − 4D < 0: the eigenvalues are α ± βi with α = T ÷ 2 and β = √(4D − T²) ÷ 2.',
    'α < 0 spirals in (stable), α > 0 spirals out, α = 0 circles a center.',
    'β sets how fast the trajectories turn.',
  ],
  variables: [
    ...MATRIX,
    ...TRACE_VARS,
    out('re', 'α', 'Real part'),
    out('im', 'β', 'Imaginary part'),
  ],
  rules: [
    ...TRACE,
    derive(
      're',
      're',
      ['T'],
      '{re} = {T} ÷ 2',
      (v) => v.T! / 2,
      '{T} ÷ 2',
      'The real part is half the trace.',
    ),
    derive(
      'im',
      'im',
      ['disc'],
      '{im} = √(−{disc}) ÷ 2',
      (v) => (v.disc! < 0 ? Math.sqrt(-v.disc!) / 2 : undefined),
      '√(−1 × {disc}) ÷ 2',
      'The imaginary part, from 4D − T² > 0.',
    ),
    limit(
      'complex',
      '{disc} < 0',
      (v) => v.disc! < 0,
      'T² − 4D ≥ 0: the eigenvalues are real (a node or a saddle).',
    ),
  ],
  example: example(
    { m11: -1, m12: -2, m21: 2, m22: -1 },
    ['T', (v) => trace(v).T!],
    ['re', (v) => v.T! / 2],
    ['im', (v) => Math.sqrt(-v.disc!) / 2],
  ),
  startWith: ['m11', 'm12', 'm21', 'm22'],
  representation: { kind: 'fieldPlot', mode: 'phase', matrix: ['m11', 'm12', 'm21', 'm22'] },
});

/** x(t) = c₁e^(λ₁t)⟨1, m₁⟩ + c₂e^(λ₂t)⟨1, m₂⟩. */
const solution = (v: Values) => {
  const e1 = Math.exp(v.l1! * v.t!);
  const e2 = Math.exp(v.l2! * v.t!);
  return { X: v.c1! * e1 + v.c2! * e2, Y: v.c1! * v.s1! * e1 + v.c2! * v.s2! * e2 };
};

const SOLUTION = page({
  id: 'g.he-fieldPlot-solution',
  title: 'The solution of x′ = Ax from x(0)',
  use: 'Use this for “Solve x′ = x + 2y, y′ = 2x + y with x(0) = 3, y(0) = 1, and find x(0.5).”',
  assumptions: [
    'x(t) = c₁e^(λ₁t)v₁ + c₂e^(λ₂t)v₂ for real, different eigenvalues.',
    'Each eigenvector is written ⟨1, m⟩ with m = (λ − a) ÷ b (b ≠ 0).',
    'c₁ and c₂ make x(0) match: c₁ + c₂ = x₀ and c₁m₁ + c₂m₂ = y₀.',
  ],
  variables: [
    ...MATRIX,
    num('p0', 'x₀', 'x at t = 0', -100, 100, { step: 0.5 }),
    num('q0', 'y₀', 'y at t = 0', -100, 100, { step: 0.5 }),
    num('t', 't', 'Time', -10, 10, { step: 0.1 }),
    ...TRACE_VARS,
    ...LAMBDA_VARS,
    out('s1', 'm₁', 'Slope of v₁'),
    out('s2', 'm₂', 'Slope of v₂'),
    out('c1', 'c₁', 'Weight of v₁'),
    out('c2', 'c₂', 'Weight of v₂'),
    out('X', 'x(t)', 'x at time t'),
    out('Y', 'y(t)', 'y at time t'),
  ],
  rules: [
    ...TRACE,
    ...LAMBDAS,
    limit(
      'real',
      '{disc} > 0',
      (v) => v.disc! > 0,
      'T² − 4D ≤ 0: no two real eigenvalues for this form.',
    ),
    limit('b', '{m12} ≠ 0', (v) => v.m12 !== 0, 'b = 0: write the eigenvectors another way.'),
    derive(
      'm1',
      's1',
      ['l1', 'm11', 'm12'],
      '{s1} = ({l1} − {m11}) ÷ {m12}',
      (v) => (v.m12 ? (v.l1! - v.m11!) / v.m12! : undefined),
      '({l1} − {m11}) ÷ {m12}',
      'From the first row: (a − λ)·1 + b·m = 0.',
    ),
    derive(
      'm2',
      's2',
      ['l2', 'm11', 'm12'],
      '{s2} = ({l2} − {m11}) ÷ {m12}',
      (v) => (v.m12 ? (v.l2! - v.m11!) / v.m12! : undefined),
      '({l2} − {m11}) ÷ {m12}',
      'The same for λ₂.',
    ),
    derive(
      'c1',
      'c1',
      ['p0', 'q0', 's1', 's2'],
      '{c1} = ({q0} − {s2} × {p0}) ÷ ({s1} − {s2})',
      (v) => (v.q0! - v.s2! * v.p0!) / (v.s1! - v.s2!),
      '({q0} − {s2} × {p0}) ÷ ({s1} − {s2})',
      'Solve c₁ + c₂ = x₀, c₁m₁ + c₂m₂ = y₀ for c₁.',
    ),
    derive(
      'c2',
      'c2',
      ['p0', 'c1'],
      '{c2} = {p0} − {c1}',
      (v) => v.p0! - v.c1!,
      '{p0} − {c1}',
      'Then c₂ = x₀ − c₁.',
    ),
    derive(
      'xt',
      'X',
      ['c1', 'c2', 'l1', 'l2', 't'],
      '{X} = {c1} × e^({l1} × {t}) + {c2} × e^({l2} × {t})',
      (v) => solution(v).X,
      '{c1} × e^({l1} × {t}) + {c2} × e^({l2} × {t})',
      'Each part grows or shrinks by its own e^(λt).',
    ),
    derive(
      'yt',
      'Y',
      ['c1', 'c2', 's1', 's2', 'l1', 'l2', 't'],
      '{Y} = {c1} × {s1} × e^({l1} × {t}) + {c2} × {s2} × e^({l2} × {t})',
      (v) => solution(v).Y,
      '{c1} × {s1} × e^({l1} × {t}) + {c2} × {s2} × e^({l2} × {t})',
      'The y parts carry the slopes m₁ and m₂.',
    ),
  ],
  example: example(
    { m11: 1, m12: 2, m21: 2, m22: 1, p0: 3, q0: 1, t: 0.5 },
    ['T', (v) => trace(v).T!],
    ['l1', (v) => lam(1)(v)!],
    ['l2', (v) => lam(-1)(v)!],
    ['s1', (v) => (v.l1! - v.m11!) / v.m12!],
    ['s2', (v) => (v.l2! - v.m11!) / v.m12!],
    ['c1', (v) => (v.q0! - v.s2! * v.p0!) / (v.s1! - v.s2!)],
    ['c2', (v) => v.p0! - v.c1!],
    ['X', (v) => solution(v).X],
    ['Y', (v) => solution(v).Y],
  ),
  startWith: ['m11', 'm12', 'm21', 'm22', 'p0', 'q0', 't'],
  representation: {
    kind: 'fieldPlot',
    mode: 'phase',
    matrix: ['m11', 'm12', 'm21', 'm22'],
    start: { x: 'p0', y: 'q0' },
    time: 't',
    point: { x: 'X', y: 'Y' },
    eigen: { l1: 'l1', l2: 'l2' },
  },
});

const PREDATOR = page({
  id: 'g.he-fieldPlot-predator-prey',
  title: 'Predator and prey: Lotka–Volterra',
  use: 'Use this for “x′ = x − 0.5xy, y′ = −0.75y + 0.25xy. Find the equilibrium and the period of small cycles.”',
  assumptions: [
    'x is the prey, y the predators: prey grow at α and are eaten at βxy; predators die at γ and grow at δxy.',
    'Both stop changing at x = γ ÷ δ, y = α ÷ β.',
    'Near it the linearized system is a center: small cycles take 2π ÷ √(αγ).',
  ],
  variables: [
    num('al', 'α', 'Prey growth rate', 0.01, 20, { step: 0.05 }),
    num('be', 'β', 'Predation rate', 0.001, 20, { step: 0.05 }),
    num('ga', 'γ', 'Predator death rate', 0.01, 20, { step: 0.05 }),
    num('de', 'δ', 'Predator growth per prey', 0.001, 20, { step: 0.05 }),
    out('xe', 'xₑ', 'Prey at equilibrium'),
    out('ye', 'yₑ', 'Predators at equilibrium'),
    out('T', 'T', 'Period of small cycles'),
  ],
  rules: [
    derive(
      'prey',
      'xe',
      ['ga', 'de'],
      '{xe} = {ga} ÷ {de}',
      (v) => v.ga! / v.de!,
      '{ga} ÷ {de}',
      'y′ = 0 when δx = γ.',
    ),
    derive(
      'predators',
      'ye',
      ['al', 'be'],
      '{ye} = {al} ÷ {be}',
      (v) => v.al! / v.be!,
      '{al} ÷ {be}',
      'x′ = 0 when βy = α.',
    ),
    derive(
      'period',
      'T',
      ['al', 'ga'],
      '{T} = 2π ÷ √({al} × {ga})',
      (v) => (2 * Math.PI) / Math.sqrt(v.al! * v.ga!),
      '2 × π ÷ √({al} × {ga})',
      'The linearized system turns at √(αγ) radians per unit time.',
    ),
  ],
  example: example(
    { al: 1, be: 0.5, ga: 0.75, de: 0.25 },
    ['xe', (v) => v.ga! / v.de!],
    ['ye', (v) => v.al! / v.be!],
    ['T', (v) => (2 * Math.PI) / Math.sqrt(v.al! * v.ga!)],
  ),
  startWith: ['al', 'be', 'ga', 'de'],
  representation: {
    kind: 'fieldPlot',
    mode: 'phase',
    lotka: { alpha: 'al', beta: 'be', gamma: 'ga', delta: 'de' },
    equilibrium: { x: 'xe', y: 'ye' },
    axes: { x: 'Prey x', y: 'Predators y' },
  },
});

const n1Of = (v: Values) => (v.K1! - v.al! * v.K2!) / (1 - v.al! * v.be!);
const n2Of = (v: Values) => (v.K2! - v.be! * v.K1!) / (1 - v.al! * v.be!);

/** Two competing species: their isoclines and where they cross. */
const competition = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'Species 1 stops growing on N₁ + αN₂ = K₁; species 2 on N₂ + βN₁ = K₂.',
      'αβ < 1: the crossing, when both N₁ₑ and N₂ₑ are positive, is stable: the species coexist.',
      'When either is 0 or less, the lines don’t cross inside: one species wins.',
    ],
    variables: [
      num('K1', 'K₁', 'Carrying capacity of species 1', 1, 1e6, { step: 10 }),
      num('K2', 'K₂', 'Carrying capacity of species 2', 1, 1e6, { step: 10 }),
      num('al', 'α', 'Effect of species 2 on 1', 0.01, 10, { step: 0.05 }),
      num('be', 'β', 'Effect of species 1 on 2', 0.01, 10, { step: 0.05 }),
      out('n1', 'N₁ₑ', 'Species 1 at equilibrium'),
      out('n2', 'N₂ₑ', 'Species 2 at equilibrium'),
    ],
    rules: [
      limit(
        'ab',
        '{al} × {be} < 1',
        (v) => v.al! * v.be! < 1,
        'αβ ≥ 1: the crossing is not stable, so the species can’t settle there.',
      ),
      derive(
        'n1',
        'n1',
        ['K1', 'K2', 'al', 'be'],
        '{n1} = ({K1} − {al} × {K2}) ÷ (1 − {al} × {be})',
        n1Of,
        '({K1} − {al} × {K2}) ÷ (1 − {al} × {be})',
        'Solve the two isoclines together for N₁.',
      ),
      derive(
        'n2',
        'n2',
        ['K1', 'K2', 'al', 'be'],
        '{n2} = ({K2} − {be} × {K1}) ÷ (1 − {al} × {be})',
        n2Of,
        '({K2} − {be} × {K1}) ÷ (1 − {al} × {be})',
        'And for N₂.',
      ),
    ],
    example: example(typed, ['n1', n1Of], ['n2', n2Of]),
    startWith: ['K1', 'K2', 'al', 'be'],
    representation: {
      kind: 'fieldPlot',
      mode: 'isoclines',
      competition: { K1: 'K1', K2: 'K2', alpha: 'al', beta: 'be' },
      equilibrium: { x: 'n1', y: 'n2' },
    },
  });

const ISOCLINES = competition(
  'g.he-fieldPlot-isoclines',
  'Competing species: do they coexist?',
  'Use this for “K₁ = 500, K₂ = 400, α = 0.5, β = 0.6. Do the species coexist, and at what sizes?”',
  { K1: 500, K2: 400, al: 0.5, be: 0.6 },
);

const ISOCLINES_WINNER = competition(
  'g.he-fieldPlot-isoclines-winner',
  'Competing species: one wins',
  'Use this for “K₁ = 500, K₂ = 200, α = 0.5, β = 0.6. Can both species persist?”',
  { K1: 500, K2: 200, al: 0.5, be: 0.6 },
);

// ── HC37: tangent lines and ε–δ bands ──

const powerF = (v: Values) => v.c! * v.x! ** Math.round(v.n!);
const powerD = (v: Values) =>
  Math.round(v.n!) === 0 ? 0 : v.c! * v.n! * v.x! ** (Math.round(v.n!) - 1);

const TANGENT = page({
  id: 'g.he-functionGraph-tangent',
  title: 'The power rule and the tangent line',
  use: 'Use this for “Find the slope of the tangent to f(x) = x² at x = 1.5.”',
  assumptions: [
    'The power rule: the derivative of cxⁿ is cnxⁿ⁻¹ for a whole n.',
    'The constant multiple c carries through the derivative.',
    'The tangent touches the curve at x with the slope f′(x).',
  ],
  variables: [
    num('c', 'c', 'Constant multiple', -5, 5, { step: 0.5 }),
    num('n', 'n', 'Power', 1, 5, { integer: true }),
    num('x', 'x', 'Point', -3, 3, { step: 0.1 }),
    out('f', 'f(x)', 'Value'),
    out('fp', 'f′(x)', 'Slope of the tangent'),
  ],
  rules: [
    derive(
      'value',
      'f',
      ['c', 'x', 'n'],
      '{f} = {c} × {x}^{n}',
      powerF,
      '{c} × {x}^{n}',
      'Put x into cxⁿ.',
    ),
    derive(
      'slope',
      'fp',
      ['c', 'n', 'x'],
      '{fp} = {c} × {n} × {x}^({n} − 1)',
      powerD,
      (v) => (Math.round(v.n!) === 0 ? '{c} × {n}' : '{c} × {n} × {x}^({n} − 1)'),
      'The power rule: bring the power down and lower it by one.',
    ),
  ],
  example: example({ c: 1, n: 2, x: 1.5 }, ['f', powerF], ['fp', powerD]),
  startWith: ['c', 'n', 'x'],
  representation: {
    kind: 'functionGraph',
    family: 'power',
    a: 'c',
    p: 'n',
    at: { x: 'x', y: 'f' },
    tangent: { x: 'x', slope: 'fp', y: 'f' },
  },
});

const linApprox = (v: Values) => {
  const fa = Math.sqrt(v.a!);
  const d = 1 / (2 * fa);
  return { fa, d, L: fa + d * (v.X! - v.a!), tv: Math.sqrt(v.X!) };
};

const LINEAR_APPROX = page({
  id: 'g.he-functionGraph-tangent-linear-approx',
  title: 'Linear approximation of √x',
  use: 'Use this for “Use the tangent line at x = 4 to estimate √4.1.”',
  assumptions: [
    'L(x) = f(a) + f′(a)(x − a): the tangent line at a stands in for f near a.',
    'For f(x) = √x, f′(x) = 1 ÷ (2√x).',
    'The nearer x is to a, the smaller the error |f(x) − L(x)|.',
  ],
  variables: [
    num('a', 'a', 'Point of tangency', 0.01, 100, { step: 0.5 }),
    num('X', 'x', 'Point to estimate', 0, 100, { step: 0.1 }),
    out('fa', 'f(a)', 'Value at a'),
    out('fpa', 'f′(a)', 'Slope at a'),
    out('L', 'L(x)', 'Linear approximation'),
    out('tv', '√x', 'True value'),
    out('err', 'E', 'Error', { min: 0 }),
  ],
  rules: [
    derive(
      'fa',
      'fa',
      ['a'],
      '{fa} = √{a}',
      (v) => Math.sqrt(v.a!),
      '√({a})',
      'The value at the point of tangency.',
    ),
    derive(
      'slope',
      'fpa',
      ['fa'],
      '{fpa} = 1 ÷ (2 × {fa})',
      (v) => 1 / (2 * v.fa!),
      '1 ÷ (2 × {fa})',
      'The derivative of √x is 1 ÷ (2√x).',
    ),
    derive(
      'L',
      'L',
      ['fa', 'fpa', 'X', 'a'],
      '{L} = {fa} + {fpa} × ({X} − {a})',
      (v) => v.fa! + v.fpa! * (v.X! - v.a!),
      '{fa} + {fpa} × ({X} − {a})',
      'Follow the tangent from a to x.',
    ),
    derive(
      'true',
      'tv',
      ['X'],
      '{tv} = √{X}',
      (v) => Math.sqrt(v.X!),
      '√({X})',
      'The true value, for comparison.',
    ),
    derive(
      'err',
      'err',
      ['tv', 'L'],
      '{err} = |{tv} − {L}|',
      (v) => Math.abs(v.tv! - v.L!),
      '|{tv} − {L}|',
      'How far the tangent is from the curve at x.',
    ),
  ],
  example: example(
    { a: 4, X: 4.1 },
    ['fa', (v) => linApprox(v).fa],
    ['fpa', (v) => linApprox(v).d],
    ['L', (v) => linApprox(v).L],
    ['tv', (v) => linApprox(v).tv],
    ['err', (v) => Math.abs(v.tv! - v.L!)],
  ),
  startWith: ['a', 'X'],
  representation: {
    kind: 'functionGraph',
    family: 'root',
    index: 2,
    tangent: { x: 'a', slope: 'fpa', y: 'fa', at: 'X', value: 'L' },
  },
});

/** lim (mx + b) at a: L = ma + b, δ = ε ÷ |m|. */
const band = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'The limit of mx + b at a is L = ma + b.',
      'Within δ of a, the line moves at most |m|δ: so δ = ε ÷ |m| keeps it within ε of L.',
      'm is not 0 (a flat line stays at L for every δ).',
    ],
    variables: [
      num('m', 'm', 'Slope', -50, 50, { step: 0.5 }),
      num('b', 'b', 'Intercept', -100, 100, { step: 0.5 }),
      num('a', 'a', 'Point approached', -100, 100, { step: 0.5 }),
      num('eps', 'ε', 'Tolerance on y', 0.0001, 10, { step: 0.01 }),
      out('L', 'L', 'Limit'),
      out('delta', 'δ', 'Tolerance on x', { min: 0 }),
    ],
    rules: [
      limit('m', '{m} ≠ 0', (v) => v.m !== 0, 'm = 0: the line is flat, so every δ works.'),
      derive(
        'limit',
        'L',
        ['m', 'a', 'b'],
        '{L} = {m} × {a} + {b}',
        (v) => v.m! * v.a! + v.b!,
        '{m} × {a} + {b}',
        'A line is continuous: put a in.',
      ),
      derive(
        'delta',
        'delta',
        ['eps', 'm'],
        '{delta} = {eps} ÷ |{m}|',
        (v) => (v.m ? v.eps! / Math.abs(v.m) : undefined),
        '{eps} ÷ |{m}|',
        'y changes |m| times as fast as x.',
      ),
    ],
    example: example(
      typed,
      ['L', (v) => v.m! * v.a! + v.b!],
      ['delta', (v) => v.eps! / Math.abs(v.m!)],
    ),
    startWith: ['m', 'b', 'a', 'eps'],
    representation: {
      kind: 'functionGraph',
      family: 'linear',
      m: 'm',
      b: 'b',
      band: { x: 'a', y: 'L', dx: 'delta', dy: 'eps' },
      fixed: true,
    },
  });

const BAND = band(
  'g.he-functionGraph-band',
  'ε and δ for the limit of a line',
  'Use this for “For lim (3x − 1) as x → 2 = 5, find δ for ε = 0.06.”',
  { m: 3, b: -1, a: 2, eps: 0.06 },
);
const BAND_SHALLOW = band(
  'g.he-functionGraph-band-shallow',
  'ε and δ for a shallow falling line',
  'Use this for “For lim (−0.5x + 4) as x → −3, find δ for ε = 0.5.”',
  { m: -0.5, b: 4, a: -3, eps: 0.5 },
);

// ── HC38: Taylor polynomials ──

const fact = (k: number): number => (k <= 1 ? 1 : k * fact(k - 1));

/** eˣ by its Maclaurin polynomial of degree n, with the Lagrange bound. */
const expSeries = (v: Values) => {
  const n = Math.round(v.n!);
  let P = 0;
  for (let k = 0; k <= n; k++) P += v.x! ** k / fact(k);
  const M = Math.exp(Math.max(v.x!, 0));
  return { P, M, bound: (M * Math.abs(v.x!) ** (n + 1)) / fact(n + 1) };
};
const expTerms = (v: Values) =>
  Array.from({ length: Math.round(v.n!) + 1 }, (_, k) =>
    k === 0 ? '1' : k === 1 ? '{x}' : `{x}^${k} ÷ ${fact(k)}`,
  ).join(' + ');

const expPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'Pₙ(x) = Σ from k = 0 to n of xᵏ ÷ k!: every derivative of eˣ at 0 is 1.',
      'Lagrange: the error is at most M|x|ⁿ⁺¹ ÷ (n + 1)!, M the largest eˣ between 0 and x.',
      'The polynomial hugs eˣ near 0 and falls away from it farther out.',
    ],
    variables: [
      num('x', 'x', 'Input', -5, 5, { step: 0.1 }),
      num('n', 'n', 'Degree', 0, 12, { integer: true }),
      out('P', 'Pₙ(x)', 'Taylor polynomial'),
      out('ex', 'eˣ', 'True value'),
      out('err', 'E', 'Error', { min: 0 }),
      out('bound', 'B', 'Lagrange bound', { min: 0 }),
    ],
    rules: [
      derive(
        'P',
        'P',
        ['x', 'n'],
        '{P} = Pₙ({x}) with n = {n}',
        (v) => expSeries(v).P,
        expTerms,
        'Add the terms xᵏ ÷ k! up to the degree.',
        true,
      ),
      derive(
        'ex',
        'ex',
        ['x'],
        '{ex} = e^{x}',
        (v) => Math.exp(v.x!),
        'e^({x})',
        'The true value.',
      ),
      derive(
        'err',
        'err',
        ['ex', 'P'],
        '{err} = |{ex} − {P}|',
        (v) => Math.abs(v.ex! - v.P!),
        '|{ex} − {P}|',
        'The gap between eˣ and the polynomial.',
      ),
      derive(
        'bound',
        'bound',
        ['x', 'n'],
        '{bound} = M × |{x}|^({n} + 1) ÷ ({n} + 1)!',
        (v) => expSeries(v).bound,
        (v) => `${v.x! > 0 ? 'e^({x})' : '1'} × |{x}|^({n} + 1) ÷ ${fact(Math.round(v.n!) + 1)}`,
        'M is e^x for x > 0 and 1 for x ≤ 0, the largest eˣ on the way.',
        true,
      ),
    ],
    example: example(
      typed,
      ['P', (v) => expSeries(v).P],
      ['ex', (v) => Math.exp(v.x!)],
      ['err', (v) => Math.abs(v.ex! - v.P!)],
      ['bound', (v) => expSeries(v).bound],
    ),
    startWith: ['x', 'n'],
    representation: {
      kind: 'functionGraph',
      family: 'exponential',
      r: 1,
      series: { of: 'exp', degree: 'n', x: 'x', value: 'P', error: 'err' },
    },
  });

const SERIES = expPage(
  'g.he-functionGraph-series',
  'eˣ by its Maclaurin polynomial',
  'Use this for “Estimate e^0.5 with a third-degree Taylor polynomial and bound the error.”',
  { x: 0.5, n: 3 },
);
const SERIES_FAR = expPage(
  'g.he-functionGraph-series-far',
  'A Maclaurin polynomial far from its center',
  'Use this for “How well does 1 + x + x²/2 + x³/6 estimate e³?”',
  { x: 3, n: 3 },
);

/** sin x by its Maclaurin polynomial; the bound is the next term, |x|ᵏ ÷ k!. */
const sinSeries = (v: Values) => {
  const n = Math.round(v.n!);
  let P = 0;
  for (let k = 1; k <= n; k += 2) P += ((-1) ** ((k - 1) / 2) * v.x! ** k) / fact(k);
  const next = n % 2 ? n + 2 : n + 1;
  return { P, next, bound: Math.abs(v.x!) ** next / fact(next) };
};

const SERIES_SIN = page({
  id: 'g.he-functionGraph-series-sin',
  title: 'sin x by its Maclaurin polynomial',
  use: 'Use this for “Approximate sin 1 with a fifth-degree Taylor polynomial; how large can the error be?”',
  assumptions: [
    'sin x = x − x³/3! + x⁵/5! − …: only odd powers, signs alternating.',
    'x is in radians.',
    'The terms shrink and alternate, so the error is at most the first term left out.',
  ],
  variables: [
    num('x', 'x', 'Input (radians)', -6, 6, { step: 0.1 }),
    num('n', 'n', 'Degree', 1, 15, { integer: true }),
    out('P', 'Pₙ(x)', 'Taylor polynomial'),
    out('sx', 'sin x', 'True value'),
    out('err', 'E', 'Error', { min: 0 }),
    out('bound', 'B', 'Next term', { min: 0 }),
  ],
  rules: [
    derive(
      'P',
      'P',
      ['x', 'n'],
      '{P} = Pₙ({x}) with n = {n}',
      (v) => sinSeries(v).P,
      (v) => {
        const parts: string[] = [];
        for (let k = 1; k <= Math.round(v.n!); k += 2)
          parts.push(
            `${parts.length ? (((k - 1) / 2) % 2 ? ' − ' : ' + ') : ''}${k === 1 ? '{x}' : `{x}^${k} ÷ ${fact(k)}`}`,
          );
        return parts.join('');
      },
      'Add the odd terms up to the degree, signs alternating.',
      true,
    ),
    derive(
      'sx',
      'sx',
      ['x'],
      '{sx} = sin({x})',
      (v) => Math.sin(v.x!),
      'sin({x})',
      'The true value.',
    ),
    derive(
      'err',
      'err',
      ['sx', 'P'],
      '{err} = |{sx} − {P}|',
      (v) => Math.abs(v.sx! - v.P!),
      '|{sx} − {P}|',
      'The gap between sin x and the polynomial.',
    ),
    derive(
      'bound',
      'bound',
      ['x', 'n'],
      '{bound} = |{x}|ᵏ ÷ k!, the first term left out after degree {n}',
      (v) => sinSeries(v).bound,
      (v) => `|{x}|^${sinSeries(v).next} ÷ ${fact(sinSeries(v).next)}`,
      'The first odd term past the degree bounds an alternating series’ error.',
      true,
    ),
  ],
  example: example(
    { x: 1, n: 5 },
    ['P', (v) => sinSeries(v).P],
    ['sx', (v) => Math.sin(v.x!)],
    ['err', (v) => Math.abs(v.sx! - v.P!)],
    ['bound', (v) => sinSeries(v).bound],
  ),
  startWith: ['x', 'n'],
  representation: {
    kind: 'functionGraph',
    family: 'sin',
    series: { of: 'sin', degree: 'n', x: 'x', value: 'P', error: 'err' },
  },
});

const fromDerivs = (v: Values) => {
  const d = v.x! - v.a!;
  return v.f0! + v.f1! * d + (v.f2! / 2) * d * d + (v.f3! / 6) * d ** 3;
};

const SERIES_DERIVATIVES = page({
  id: 'g.he-functionGraph-series-derivatives',
  title: 'A Taylor polynomial from given derivatives',
  use: 'Use this for “f(1) = 2, f′(1) = −1, f″(1) = 4, f‴(1) = 6. Use P₃ about 1 to estimate f(1.2).”',
  assumptions: [
    'P₃(x) = f(a) + f′(a)(x − a) + f″(a)(x − a)²/2! + f‴(a)(x − a)³/3!.',
    'Each term matches one more derivative of f at a.',
    'Only the values at a are known, so the polynomial is drawn alone.',
  ],
  variables: [
    num('a', 'a', 'Center', -10, 10, { step: 0.5 }),
    num('f0', 'f(a)', 'Value at a', -100, 100, { step: 0.5 }),
    num('f1', 'f′(a)', 'First derivative at a', -100, 100, { step: 0.5 }),
    num('f2', 'f″(a)', 'Second derivative at a', -100, 100, { step: 0.5 }),
    num('f3', 'f‴(a)', 'Third derivative at a', -100, 100, { step: 0.5 }),
    num('x', 'x', 'Input', -10, 10, { step: 0.1 }),
    out('P', 'P₃(x)', 'Estimate'),
  ],
  rules: [
    derive(
      'P',
      'P',
      ['f0', 'f1', 'f2', 'f3', 'x', 'a'],
      '{P} = {f0} + {f1} × ({x} − {a}) + {f2} ÷ 2 × ({x} − {a})^2 + {f3} ÷ 6 × ({x} − {a})^3',
      fromDerivs,
      '{f0} + {f1} × ({x} − {a}) + {f2} ÷ 2 × ({x} − {a})^2 + {f3} ÷ 6 × ({x} − {a})^3',
      'Each derivative divided by its factorial, times the matching power of x − a.',
    ),
  ],
  example: example({ a: 1, f0: 2, f1: -1, f2: 4, f3: 6, x: 1.2 }, ['P', fromDerivs]),
  startWith: ['a', 'f0', 'f1', 'f2', 'f3', 'x'],
  representation: {
    kind: 'functionGraph',
    family: 'taylor',
    center: 'a',
    derivatives: ['f0', 'f1', 'f2', 'f3'],
    name: 'P₃',
    at: { x: 'x', y: 'P' },
  },
});

/** The series coefficients of y″ = (cx − ω²)y: a(n+2) = (c·a(n−1) − ω²a(n)) ÷ ((n + 2)(n + 1)). */
const odeCoefs = (v: Values, w: number, c: number) => {
  const cs = [v.a0!, v.a1!];
  for (let n = 0; cs.length <= Math.round(v.N!); n++)
    cs.push(((n >= 1 ? c * cs[n - 1]! : 0) - w * w * cs[n]!) / ((n + 2) * (n + 1)));
  return cs.slice(0, Math.round(v.N!) + 1);
};
const odeSum = (cs: number[], x: number) => cs.reduce((s, a, k) => s + a * x ** k, 0);
const odeTerms = (cs: number[]) =>
  cs
    .map((a, k) => ({ a, k }))
    .filter((t) => t.a !== 0)
    .map((t) => `${lit(t.a)}${t.k === 0 ? '' : t.k === 1 ? ' × {x}' : ` × {x}^${t.k}`}`)
    .join(' + ') || '0';

const cosExact = (v: Values) =>
  v.a0! * Math.cos(v.w! * v.x!) + (v.a1! / v.w!) * Math.sin(v.w! * v.x!);

const SERIES_ODE = page({
  id: 'g.he-functionGraph-series-ode',
  title: 'A power-series solution of y″ + ω²y = 0',
  use: 'Use this for “Find the series solution of y″ + y = 0 with y(0) = 1, y′(0) = 0.”',
  assumptions: [
    'y = Σ aₙxⁿ; matching powers gives a₍ₙ₊₂₎ = −ω²aₙ ÷ ((n + 2)(n + 1)).',
    'a₀ = y(0) and a₁ = y′(0) start the two chains: even terms build cos, odd ones sin.',
    'The exact solution is a₀ cos ωx + (a₁ ÷ ω) sin ωx.',
  ],
  variables: [
    num('w', 'ω', 'Angular frequency', 0.1, 10, { step: 0.1 }),
    num('a0', 'a₀', 'y(0)', -10, 10, { step: 0.5 }),
    num('a1', 'a₁', 'y′(0)', -10, 10, { step: 0.5 }),
    num('N', 'N', 'Degree', 2, 10, { integer: true }),
    num('x', 'x', 'Input', -5, 5, { step: 0.1 }),
    out('S', 'Sₙ', 'Partial sum'),
    out('Y', 'y', 'Exact value'),
    out('err', 'E', 'Error', { min: 0 }),
  ],
  rules: [
    derive(
      'S',
      'S',
      ['w', 'a0', 'a1', 'N', 'x'],
      '{S} = the series of y″ + {w}²y = 0 from {a0}, {a1} to degree {N} at {x}',
      (v) => odeSum(odeCoefs(v, v.w!, 0), v.x!),
      (v) => odeTerms(odeCoefs(v, v.w!, 0)),
      'The coefficients from the recurrence, each times its power of x.',
      true,
    ),
    derive(
      'Y',
      'Y',
      ['a0', 'w', 'x', 'a1'],
      '{Y} = {a0} × cos({w} × {x}) + {a1} ÷ {w} × sin({w} × {x})',
      cosExact,
      '{a0} × cos({w} × {x}) + {a1} ÷ {w} × sin({w} × {x})',
      'The exact solution, for comparison.',
    ),
    derive(
      'err',
      'err',
      ['Y', 'S'],
      '{err} = |{Y} − {S}|',
      (v) => Math.abs(v.Y! - v.S!),
      '|{Y} − {S}|',
      'How far the partial sum is from the solution.',
    ),
  ],
  example: example(
    { w: 1, a0: 1, a1: 0, N: 6, x: 1 },
    ['S', (v) => odeSum(odeCoefs(v, v.w!, 0), v.x!)],
    ['Y', cosExact],
    ['err', (v) => Math.abs(v.Y! - v.S!)],
  ),
  startWith: ['w', 'a0', 'a1', 'N', 'x'],
  representation: {
    kind: 'functionGraph',
    family: 'linearOde',
    a0: 'a0',
    a1: 'a1',
    omega: 'w',
    name: 'y',
    series: { of: 'ode', degree: 'N', x: 'x', value: 'S', error: 'err' },
  },
});

const airyAt = (v: Values) => odeSolution(v.a0!, v.a1!, 0, 1)(v.x!);

const SERIES_AIRY = page({
  id: 'g.he-functionGraph-series-airy',
  title: 'Airy’s equation by a power series',
  use: 'Use this for “Find the first terms of the series solution of y″ = xy with y(0) = 1, y′(0) = 0.”',
  assumptions: [
    'y = Σ aₙxⁿ in y″ = xy gives a₂ = 0 and a₍ₙ₊₂₎ = a₍ₙ₋₁₎ ÷ ((n + 2)(n + 1)).',
    'Each a₀ term steps by three powers: 1 + x³/6 + x⁶/180 + …',
    'No elementary formula solves it: the solid curve is a careful numerical solution.',
  ],
  variables: [
    num('a0', 'a₀', 'y(0)', -10, 10, { step: 0.5 }),
    num('a1', 'a₁', 'y′(0)', -10, 10, { step: 0.5 }),
    num('N', 'N', 'Degree', 2, 10, { integer: true }),
    num('x', 'x', 'Input', -4, 3, { step: 0.1 }),
    out('S', 'Sₙ', 'Partial sum'),
    out('Y', 'y', 'Numerical solution'),
    out('err', 'E', 'Error', { min: 0 }),
  ],
  rules: [
    derive(
      'S',
      'S',
      ['a0', 'a1', 'N', 'x'],
      '{S} = the series of y″ = xy from {a0}, {a1} to degree {N} at {x}',
      (v) => odeSum(odeCoefs(v, 0, 1), v.x!),
      (v) => odeTerms(odeCoefs(v, 0, 1)),
      'The coefficients from the recurrence, each times its power of x.',
      true,
    ),
    derive(
      'Y',
      'Y',
      ['a0', 'a1', 'x'],
      '{Y} = y({x}) for y″ = xy, y(0) = {a0}, y′(0) = {a1}',
      airyAt,
      (v) => lit(airyAt(v)),
      'Worked out numerically, in steps of 0.005 from x = 0.',
      true,
    ),
    derive(
      'err',
      'err',
      ['Y', 'S'],
      '{err} = |{Y} − {S}|',
      (v) => Math.abs(v.Y! - v.S!),
      '|{Y} − {S}|',
      'How far the partial sum is from the solution.',
    ),
  ],
  example: example(
    { a0: 1, a1: 0, N: 6, x: 1 },
    ['S', (v) => odeSum(odeCoefs(v, 0, 1), v.x!)],
    ['Y', airyAt],
    ['err', (v) => Math.abs(v.Y! - v.S!)],
  ),
  startWith: ['a0', 'a1', 'N', 'x'],
  representation: {
    kind: 'functionGraph',
    family: 'linearOde',
    a0: 'a0',
    a1: 'a1',
    c: 1,
    name: 'y',
    series: { of: 'ode', degree: 'N', x: 'x', value: 'S', error: 'err' },
  },
});

/** ∫ from 0 to b of e^(−x²), term by term: Σ (−1)ᵏ b^(2k+1) ÷ ((2k + 1)k!). */
const gaussTerms = (v: Values) =>
  Array.from(
    { length: Math.round(v.m!) },
    (_, k) => ((-1) ** k * v.b! ** (2 * k + 1)) / ((2 * k + 1) * fact(k)),
  );

const SERIES_INTEGRATE = page({
  id: 'g.he-functionGraph-series-integrate',
  title: 'Integrating e^(−x²) term by term',
  use: 'Use this for “Estimate ∫ from 0 to 1 of e^(−x²) dx with the first five terms of its series.”',
  assumptions: [
    'e^(−x²) = 1 − x² + x⁴/2! − x⁶/3! + …: eˣ’s series with −x² put in.',
    'Each term integrates to (−1)ᵏ b^(2k+1) ÷ ((2k + 1)k!).',
    'The series alternates, so the first term left out bounds the error.',
  ],
  variables: [
    num('b', 'b', 'Upper limit', 0.1, 3, { step: 0.1 }),
    num('m', 'm', 'Number of terms', 1, 10, { integer: true }),
    out('I', 'I', 'Integral estimate'),
    out('next', 'B', 'Next term', { min: 0 }),
  ],
  rules: [
    derive(
      'I',
      'I',
      ['b', 'm'],
      '{I} = the first {m} terms of ∫ from 0 to {b} of e^(−x²) dx',
      (v) => gaussTerms(v).reduce((s, t) => s + t, 0),
      (v) =>
        Array.from(
          { length: Math.round(v.m!) },
          (_, k) =>
            `${k === 0 ? '' : k % 2 ? ' − ' : ' + '}${k === 0 ? '{b}' : `{b}^${2 * k + 1} ÷ ${(2 * k + 1) * fact(k)}`}`,
        ).join(''),
      'Integrate each term of the series from 0 to b.',
      true,
    ),
    derive(
      'next',
      'next',
      ['b', 'm'],
      '{next} = the term after the first {m}, at {b}',
      (v) =>
        v.b! ** (2 * Math.round(v.m!) + 1) / ((2 * Math.round(v.m!) + 1) * fact(Math.round(v.m!))),
      (v) =>
        `{b}^${2 * Math.round(v.m!) + 1} ÷ ${(2 * Math.round(v.m!) + 1) * fact(Math.round(v.m!))}`,
      'The first term left out bounds the error of an alternating series.',
      true,
    ),
  ],
  example: example(
    { b: 1, m: 5 },
    ['I', (v) => gaussTerms(v).reduce((s, t) => s + t, 0)],
    ['next', (v) => v.b! ** (2 * v.m! + 1) / ((2 * v.m! + 1) * fact(v.m!))],
  ),
  startWith: ['b', 'm'],
  representation: {
    kind: 'functionGraph',
    family: 'expr',
    expr: 'exp(-x^2)',
    series: { of: 'expNegSq', terms: 'm', integral: { from: 0, to: 'b', value: 'I' } },
  },
});

export const HE2G_GALLERY_MODULES: ModuleDef[] = [
  SLOPE,
  SLOPE_LOGISTIC,
  VECTOR,
  GREEN,
  CONSERVATIVE,
  PHASE,
  SPIRAL,
  SOLUTION,
  PREDATOR,
  ISOCLINES,
  ISOCLINES_WINNER,
  TANGENT,
  LINEAR_APPROX,
  BAND,
  BAND_SHALLOW,
  SERIES,
  SERIES_FAR,
  SERIES_SIN,
  SERIES_DERIVATIVES,
  SERIES_ODE,
  SERIES_AIRY,
  SERIES_INTEGRATE,
];

export const HE2G_GALLERY_LAYOUTS: LayoutDef[] = [];
