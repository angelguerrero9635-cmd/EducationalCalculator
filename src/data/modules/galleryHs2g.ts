/**
 * Grades 9–12 round 2 gallery demos (group H2G: math options (H93–H95, H97–H99); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in. Spread into
 * gallery.ts.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import { MATH_10_MODULES } from './math/10';
import { MATH_11_MODULES } from './math/11';
import { MATH_12_MODULES } from './math/12';
import { MATH_9_MODULES } from './math/9';
import type { ModuleDef, Representation, StepText } from './types';

type Solver = (v: Values) => number | number[] | undefined;
type Rule = { relation: Relation; steps: Record<string, StepText> };

/** Rounded to 12 significant figures, so 0.1 + 0.2 is 0.3 when a value is worked out. */
const exact = (x: number) => Number(x.toPrecision(12));
/** A finite value, exact, or nothing. */
const fin = (x: number) => (Number.isFinite(x) ? exact(x) : undefined);

/** A value typed or worked out: min to max. */
const num = (
  id: string,
  symbol: string,
  name: string,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, min, max, ...more });

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
): Rule {
  return rule(id, display, [x, ...inputs], (v) => v[x]! - (f(v) ?? NaN), {
    [x]: [(v: Values) => f(v), expr, how],
  });
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

const PAGES = [...MATH_9_MODULES, ...MATH_10_MODULES, ...MATH_11_MODULES, ...MATH_12_MODULES];

/**
 * A demo from the page that waits: its variables, rules, steps and example, with the picture
 * the page will pass (and any variable or example change the option allows).
 */
function fromPage(
  pageId: string,
  id: string,
  title: string,
  representation: Representation,
  more: Partial<ModuleDef> & { vars?: Record<string, Partial<VariableDef>> } = {},
): ModuleDef {
  const found = PAGES.find((m) => m.id === pageId);
  if (!found) throw new Error(`galleryHs2g: no page ${pageId}`);
  const { vars, ...rest } = more;
  return {
    ...found,
    id,
    title,
    representation,
    ...(vars
      ? { variables: found.variables.map((v) => (vars[v.id] ? { ...v, ...vars[v.id] } : v)) }
      : {}),
    ...rest,
  };
}

// ── H93: termsChart past 30 terms, a recursive rule, a second lit term ──

const TERMS: ModuleDef[] = [
  fromPage(
    'm.9.sequences',
    'g.m9-sequences-far',
    'Arithmetic sequence: the 100th term',
    {
      kind: 'termsChart',
      type: 'arithmetic',
      first: 'a1',
      step: 'd',
      count: 'n',
      as: 'points',
      term: 'an',
      far: true,
    },
    {
      use: 'Use this for “7, 11, 15, … What is the 100th term?”',
      vars: { n: { max: 1000 } },
      example: { a1: 7, d: 4, n: 100, an: 403 },
    },
  ),
  fromPage('m.9.sequences~recursive', 'g.m9-sequences-recursive-chart', 'Recursive rule', {
    kind: 'termsChart',
    type: 'recursive',
    first: 'a1',
    step: 'k',
    plus: 'c',
    count: 'n',
    term: 'an',
  }),
  fromPage(
    'm.11.exp-log-equations~same-base',
    'g.m11-exp-log-equations-same-base-lit',
    'Powers of the same base',
    {
      kind: 'termsChart',
      type: 'geometric',
      first: 'g',
      step: 'g',
      count: 'q',
      term: 'B2',
      lit: 'p',
      litTerm: 'B1',
      powers: true,
    },
  ),
];

// ── H94: functionGraph |f(x)|, a horizontal factor, a kept domain, rational by coefficients ──

/** y = |ax² + bx + c|: the parabola's parts below the x-axis reflected up. */
const absGraph = page({
  id: 'g.m9-piecewise-functions-abs',
  title: 'Graph of |f(x)|',
  use: 'Use this for “Graph y = |x² − 2x − 3|” from the graph of f.',
  assumptions: [
    '|f(x)| is f(x) where f(x) ≥ 0 and −f(x) where f(x) < 0.',
    'So the parts of the graph below the x-axis flip up over it; the rest stays.',
    'The zeros of f stay put: there the graph touches the x-axis and turns sharply.',
  ],
  variables: [
    num('a', 'a', 'x² coefficient', -5, 5, { step: 0.5 }),
    num('b', 'b', 'x coefficient', -20, 20, { step: 0.5 }),
    num('c', 'c', 'Number term', -50, 50, { step: 0.5 }),
    num('x', 'x', 'Input', -20, 20, { step: 0.5 }),
    num('f', 'f(x)', 'f(x) there', -5000, 5000, { derived: true }),
    num('y', 'y', 'Output |f(x)|', 0, 5000, { derived: true }),
  ],
  rules: [
    limit('a ≠ 0', '{a} ≠ 0', (v) => v.a !== 0, 'With a = 0 there is no parabola.'),
    derive(
      'f(x) = ax² + bx + c',
      'f',
      ['a', 'b', 'c', 'x'],
      '{f} = {a} × {x}² + {b} × {x} + {c}',
      (v) => exact(v.a! * v.x! ** 2 + v.b! * v.x! + v.c!),
      '{a} × {x}² + {b} × {x} + {c}',
      'Put x into f first.',
    ),
    derive(
      'y = |f(x)|',
      'y',
      ['f'],
      '{y} = |{f}|',
      (v) => exact(Math.abs(v.f!)),
      '|{f}|',
      'Then take its absolute value: a negative f(x) turns positive.',
    ),
  ],
  example: { a: 1, b: -2, c: -3, x: 1, f: -4, y: 4 },
  startWith: ['a', 'b', 'c', 'x'],
  equation: 'y = |{a}x² + {b}x + {c}|',
  representation: {
    kind: 'functionGraph',
    family: 'quadratic',
    form: 'standard',
    a: 'a',
    b: 'b',
    c: 'c',
    abs: true,
    at: { x: 'x', y: 'y' },
    marks: ['zeros'],
  },
});

/** y = √(b(x − h)): the parent point (p, √p) lands at (h + p ÷ b, √p). */
const horizontal = (id: string, title: string, example: Values) =>
  page({
    id,
    title,
    use: 'Use this for “Where does (4, 2) on y = √x go on y = √(2x)?”',
    assumptions: [
      'y = f(b(x − h)) acts on x: it squeezes the graph toward x = h by 1/b.',
      'A negative b also flips the graph across the line x = h.',
      'The point (p, f(p)) of the parent lands at (h + p ÷ b, f(p)): only x changes.',
    ],
    variables: [
      num('b', 'b', 'Horizontal factor', -3, 3, { allowed: [-3, -2, -1, -0.5, 0.5, 2, 3] }),
      num('h', 'h', 'Shift right', -10, 10, { step: 0.5 }),
      num('p', 'p', 'Parent point x', 0, 25, { step: 0.5 }),
      num('Y', 'Y', 'Image y = √p', 0, 5, { derived: true }),
      num('X', 'X', 'Image x', -60, 60, { derived: true }),
    ],
    rules: [
      derive(
        'Y = √p',
        'Y',
        ['p'],
        '{Y} = √{p}',
        (v) => fin(Math.sqrt(v.p!)),
        '√{p}',
        'The parent point is (p, √p); a change inside the root leaves y alone.',
      ),
      derive(
        'X = h + p ÷ b',
        'X',
        ['h', 'p', 'b'],
        '{X} = {h} + {p} ÷ {b}',
        (v) => (v.b ? fin(v.h! + v.p! / v.b!) : undefined),
        '{h} + {p} ÷ {b}',
        'b(X − h) must equal p, so X − h = p ÷ b.',
      ),
    ],
    example,
    startWith: ['b', 'h', 'p'],
    equation: 'y = √({b}(x − {h}))',
    representation: {
      kind: 'functionGraph',
      family: 'root',
      index: 2,
      h: 'h',
      horizontal: 'b',
      parent: true,
      input: 'x',
      at: { x: 'X', y: 'Y' },
    },
  });

/** f(x) = a(x − h)² + k kept on x ≥ h, and its inverse h + √((x − k) ÷ a). */
const restrictDomain = page({
  id: 'g.m11-inverse-functions-restrict-domain',
  title: 'Inverse on a restricted domain',
  use: 'Use this for “f(x) = 2(x − 1)² + 3 for x ≥ 1. Find f⁻¹(11).”',
  assumptions: [
    'A parabola fails the horizontal line test, so keep only the half from its vertex.',
    'On x ≥ h the parabola only rises (a > 0), so each y comes from one x.',
    'Undo the steps in reverse: take k away, divide by a, take the positive root, add h.',
  ],
  variables: [
    num('a', 'a', 'Stretch', -5, 5, { step: 0.5 }),
    num('h', 'h', 'Vertex x', -10, 10, { step: 0.5 }),
    num('k', 'k', 'Vertex y', -10, 10, { step: 0.5 }),
    num('x', 'x', 'Input, x ≥ h', -10, 30, { step: 0.5 }),
    num('y', 'y', 'Output f(x)', -3000, 3000),
  ],
  rules: [
    limit('a ≠ 0', '{a} ≠ 0', (v) => v.a !== 0, 'With a = 0 there is no parabola.'),
    limit(
      'x ≥ h',
      '{x} ≥ {h}',
      (v) => v.x! >= v.h!,
      'Only x ≥ h is kept: take x at or right of h.',
    ),
    rule(
      'y = a(x − h)² + k, x ≥ h',
      '{y} = {a} × ({x} − {h})² + {k}',
      ['y', 'a', 'x', 'h', 'k'],
      (v) => v.y! - (v.a! * (v.x! - v.h!) ** 2 + v.k!),
      {
        y: [
          (v) => exact(v.a! * (v.x! - v.h!) ** 2 + v.k!),
          '{a} × ({x} − {h})² + {k}',
          'Put x into f.',
        ],
        x: [
          (v) => {
            const q = (v.y! - v.k!) / v.a!;
            return q < 0 ? undefined : exact(v.h! + Math.sqrt(q));
          },
          '{h} + √(({y} − {k}) ÷ {a})',
          'The inverse: take k away, divide by a, take the positive root (x ≥ h), then add h.',
        ],
      },
      {
        message: (v) =>
          v.a !== undefined &&
          v.y !== undefined &&
          v.k !== undefined &&
          v.a !== 0 &&
          (v.y - v.k) / v.a < 0
            ? 'That output is never reached: (y − k) ÷ a is negative.'
            : undefined,
      },
    ),
  ],
  example: { a: 2, h: 1, k: 3, x: 3, y: 11 },
  startWith: ['a', 'h', 'k', 'y'],
  equation: '{y} = {a}({x} − {h})² + {k}',
  representation: {
    kind: 'functionGraph',
    family: 'quadratic',
    form: 'vertex',
    a: 'a',
    h: 'h',
    k: 'k',
    restrict: { from: 'h' },
    inverse: true,
    at: { x: 'x', y: 'y' },
  },
});

/** (px + q) ÷ (rx + s) drawn from its coefficients. */
const ratio = fromPage(
  'm.12.limits-intro~infinity',
  'g.m12-limits-intro-infinity-coefficients',
  'Limits at infinity, drawn from the coefficients',
  {
    kind: 'functionGraph',
    family: 'rational',
    p: 'p',
    q: 'q',
    r: 'r',
    s: 's',
    shows: { ha: 'L', va: 'v' },
  },
);

const GRAPHS: ModuleDef[] = [
  absGraph,
  horizontal('g.m11-function-transformations-horizontal', 'Horizontal stretch: y = √(b(x − h))', {
    b: 2,
    h: 0,
    p: 4,
    Y: 2,
    X: 2,
  }),
  horizontal('g.m11-function-transformations-horizontal-flip', 'Horizontal flip: y = √(−(x − h))', {
    b: -1,
    h: 2,
    p: 4,
    Y: 2,
    X: -2,
  }),
  restrictDomain,
  ratio,
];

// ── H95: an area box past the tiles; a monomial quotient as factors ──

/** (ax + b)(cx² + dx + e) in an area box: six cells, like terms on the diagonals. */
const areaBox = page({
  id: 'g.m9-polynomial-operations-box',
  title: 'Binomial times trinomial: the area box',
  use: 'Use this for “Multiply (x + 2)(x² − 3x + 4).”',
  assumptions: [
    'Each term of one factor multiplies each term of the other: 2 × 3 = 6 products.',
    'Each cell of the box holds one product: its row term times its column term.',
    'Like terms sit on the same diagonal: add them to finish.',
  ],
  variables: [
    num('a', 'a', 'x in the first factor', -10, 10),
    num('b', 'b', 'Number in the first factor', -10, 10),
    num('c', 'c', 'x² in the second factor', -10, 10),
    num('d', 'd', 'x in the second factor', -10, 10),
    num('e', 'e', 'Number in the second factor', -10, 10),
    num('p', 'p', 'x³ in the product', -100, 100, { derived: true }),
    num('q', 'q', 'x² in the product', -200, 200, { derived: true }),
    num('r', 'r', 'x in the product', -200, 200, { derived: true }),
    num('t', 't', 'Number in the product', -100, 100, { derived: true }),
  ],
  rules: [
    derive(
      'p = ac',
      'p',
      ['a', 'c'],
      '{p} = {a} × {c}',
      (v) => v.a! * v.c!,
      '{a} × {c}',
      'Only x times x² makes x³.',
    ),
    derive(
      'q = ad + bc',
      'q',
      ['a', 'd', 'b', 'c'],
      '{q} = {a} × {d} + {b} × {c}',
      (v) => v.a! * v.d! + v.b! * v.c!,
      '{a} × {d} + {b} × {c}',
      'Two cells make x²: x times the x term, and the number times x².',
    ),
    derive(
      'r = ae + bd',
      'r',
      ['a', 'e', 'b', 'd'],
      '{r} = {a} × {e} + {b} × {d}',
      (v) => v.a! * v.e! + v.b! * v.d!,
      '{a} × {e} + {b} × {d}',
      'Two cells make x: x times the number, and the number times the x term.',
    ),
    derive(
      't = be',
      't',
      ['b', 'e'],
      '{t} = {b} × {e}',
      (v) => v.b! * v.e!,
      '{b} × {e}',
      'The two numbers multiply to the number term.',
    ),
  ],
  example: { a: 1, b: 2, c: 1, d: -3, e: 4, p: 1, q: -1, r: -2, t: 8 },
  startWith: ['a', 'b', 'c', 'd', 'e'],
  equation: '({a}x + {b})({c}x² + {d}x + {e}) = {p}x³ + {q}x² + {r}x + {t}',
  representation: {
    kind: 'algebraTiles',
    mode: 'box',
    side: ['a', 'b'],
    top: ['c', 'd', 'e'],
    product: ['p', 'q', 'r', 't'],
  },
});

const MONOMIAL: Representation = {
  kind: 'algebraTiles',
  mode: 'monomial',
  a: 'a',
  m: 'm',
  b: 'b',
  n: 'n',
  c: 'c',
  k: 'k',
};

const MONOMIALS: ModuleDef[] = [
  fromPage(
    'm.9.radicals~monomials',
    'g.m9-radicals-monomials-factors',
    'Divide monomials',
    MONOMIAL,
  ),
  fromPage(
    'm.9.radicals~monomials',
    'g.m9-radicals-monomials-negative',
    'Divide monomials: a negative exponent',
    MONOMIAL,
    {
      use: 'Use this for “Simplify 6x² ÷ 4x⁻³.”',
      example: { a: 6, m: 2, b: 4, n: -3, c: 1.5, k: 5, x: 2, y: 48 },
    },
  ),
];

export const HS2G_GALLERY_MODULES: ModuleDef[] = [...TERMS, ...GRAPHS, areaBox, ...MONOMIALS];

export const HS2G_GALLERY_LAYOUTS: LayoutDef[] = [];
