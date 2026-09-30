/**
 * Grades 9–12 round 2 gallery demos (group H2G: math options (H93–H95, H97–H99); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in. Spread into
 * gallery.ts.
 */
import { formatNumber } from '@/engine/format';
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

// ── H97: a Venn of counts, a three-stage tree, a fraction of two counts ──

/** A whole count, 0 to max. */
const count = (
  id: string,
  symbol: string,
  name: string,
  max: number,
  more: Partial<VariableDef> = {},
) => num(id, symbol, name, 0, max, { step: 1, integer: true, ...more });
/** A chance worked out, 0 to 1, shown as a fraction where it is one. */
const chanceOut = (id: string, symbol: string, name: string) =>
  num(id, symbol, name, 0, 1, { derived: true, fraction: 1000 });
/** A chance typed, 0 to 1. */
const chanceIn = (id: string, symbol: string, name: string) =>
  num(id, symbol, name, 0, 1, { step: 0.01 });

/** Region checks every counts page shares: both ≤ A and B, the union within the total. */
const vennLimits = () => [
  limit(
    'both ≤ A, B',
    '{ab} is at most {a} and {b}',
    (v) => v.ab! <= Math.min(v.a!, v.b!),
    'The overlap is part of both circles: it can’t be bigger than either.',
  ),
  limit(
    'A or B ≤ total',
    '{a} + {b} − {ab} is at most {N}',
    (v) => v.a! + v.b! - v.ab! <= v.N!,
    'The circles hold more people than there are in all.',
  ),
];

const neitherCounts = page({
  id: 'g.m10-probability-rules-neither-counts',
  title: 'Neither event, from counts',
  use: 'Use this for “Of 40 students, 22 play soccer, 15 basketball and 8 both. How many play neither?”',
  assumptions: [
    'Each circle counts the people in it; the overlap counts those in both.',
    'Soccer or basketball counts the overlap once: a + b − both.',
    'Neither is everyone else in the rectangle: the total minus that.',
  ],
  variables: [
    count('a', 'a', 'In A', 1000),
    count('b', 'b', 'In B', 1000),
    count('ab', 'ab', 'In both', 1000),
    count('N', 'N', 'In all', 1000),
    count('u', 'u', 'In A or B', 2000, { derived: true }),
    count('s', 's', 'In neither', 1000, { derived: true }),
    chanceOut('P', 'P(neither)', 'P(neither)'),
  ],
  rules: [
    ...vennLimits(),
    derive(
      'u = a + b − ab',
      'u',
      ['a', 'b', 'ab'],
      '{u} = {a} + {b} − {ab}',
      (v) => v.a! + v.b! - v.ab!,
      '{a} + {b} − {ab}',
      'Add the two circles, then take off the overlap counted twice.',
    ),
    derive(
      's = N − u',
      's',
      ['N', 'u'],
      '{s} = {N} − {u}',
      (v) => v.N! - v.u!,
      '{N} − {u}',
      'Everyone not in either circle.',
    ),
    derive(
      'P = s ÷ N',
      'P',
      ['s', 'N'],
      '{P} = {s} ÷ {N}',
      (v) => (v.N ? fin(v.s! / v.N!) : undefined),
      '{s} ÷ {N}',
      'The count in neither over everyone.',
    ),
  ],
  example: { a: 22, b: 15, ab: 8, N: 40, u: 29, s: 11, P: 0.275 },
  startWith: ['a', 'b', 'ab', 'N'],
  representation: {
    kind: 'venn',
    chances: {
      a: 'a',
      b: 'b',
      both: 'ab',
      names: ['Soccer', 'Basketball'],
      shade: 'neither',
      result: 'P',
      counts: { total: 'N', count: 's' },
    },
  },
});

const vennCountsGiven = page({
  id: 'g.m10-conditional-probability-venn-counts',
  title: 'Conditional probability from a Venn of counts',
  use: 'Use this for “Of 60 students, 25 drink juice, 30 milk and 10 both. What fraction of the juice drinkers drink milk?”',
  assumptions: [
    'P(B | A) looks only inside circle A: the overlap out of everyone in A.',
    'So P(B | A) = both ÷ a, not both ÷ the total.',
    'If it equals P(B) = b ÷ total, A and B are independent.',
  ],
  variables: [
    count('a', 'a', 'In A', 1000),
    count('b', 'b', 'In B', 1000),
    count('ab', 'ab', 'In both', 1000),
    count('N', 'N', 'In all', 1000),
    chanceOut('j', 'P(A and B)', 'P(A and B)'),
    chanceOut('c', 'P(B | A)', 'P(B | A)'),
  ],
  rules: [
    ...vennLimits(),
    derive(
      'P(A and B) = ab ÷ N',
      'j',
      ['ab', 'N'],
      '{j} = {ab} ÷ {N}',
      (v) => (v.N ? fin(v.ab! / v.N!) : undefined),
      '{ab} ÷ {N}',
      'The overlap out of everyone.',
    ),
    derive(
      'P(B | A) = ab ÷ a',
      'c',
      ['ab', 'a'],
      '{c} = {ab} ÷ {a}',
      (v) => (v.a ? fin(v.ab! / v.a!) : undefined),
      '{ab} ÷ {a}',
      'Given A: only the people in A count, and ab of them are in B.',
    ),
  ],
  example: { a: 25, b: 30, ab: 10, N: 60, j: 1 / 6, c: 0.4 },
  startWith: ['a', 'b', 'ab', 'N'],
  representation: {
    kind: 'venn',
    chances: {
      a: 'a',
      b: 'b',
      both: 'ab',
      names: ['Juice', 'Milk'],
      shade: 'and',
      result: 'j',
      counts: { total: 'N' },
    },
  },
});

const threeStages = page({
  id: 'g.m10-conditional-probability-three-stages',
  title: 'Three independent stages',
  use: 'Use this for “Three trains are on time with chances 0.9, 0.8 and 0.7. What is the chance all three are?”',
  assumptions: [
    'Each train is on time or late, whatever the others do: the stages are independent.',
    'Along one path, multiply the three chances.',
    'At least one late is every other path: 1 − P(all on time).',
  ],
  variables: [
    chanceIn('a', 'P(A)', 'First on time'),
    chanceIn('b', 'P(B)', 'Second on time'),
    chanceIn('c', 'P(C)', 'Third on time'),
    chanceOut('j', 'P(all)', 'All three on time'),
    chanceOut('m', 'P(some late)', 'At least one late'),
  ],
  rules: [
    derive(
      'P(all) = a × b × c',
      'j',
      ['a', 'b', 'c'],
      '{j} = {a} × {b} × {c}',
      (v) => fin(v.a! * v.b! * v.c!),
      '{a} × {b} × {c}',
      'Independent stages: multiply along the path.',
    ),
    derive(
      'P(some late) = 1 − P(all)',
      'm',
      ['j'],
      '{m} = 1 − {j}',
      (v) => fin(1 - v.j!),
      '1 − {j}',
      'Every path but the all-on-time one.',
    ),
  ],
  example: { a: 0.9, b: 0.8, c: 0.7, j: 0.504, m: 0.496 },
  startWith: ['a', 'b', 'c'],
  representation: {
    kind: 'treeDiagram',
    chances: {
      first: ['a'],
      second: [['b'], ['b']],
      third: [
        [['c'], ['c']],
        [['c'], ['c']],
      ],
      names: [
        ['On time', 'Late'],
        ['On time', 'Late'],
      ],
      thirdNames: ['On time', 'Late'],
      stages: ['First', 'Second'],
      thirdStage: 'Third',
      path: [0, 0],
      path3: 0,
      chance: 'j',
    },
  },
});

const countingFraction = fromPage(
  'm.10.probability-rules~counting-probability',
  'g.m10-probability-rules-counting-fraction',
  'Probability with combinations: a fraction of two counts',
  {
    kind: 'pascalTriangle',
    n: 'n',
    k: 'r',
    fraction: { n: 'a', k: 'r', count: 'f', chance: 'P' },
  },
);

const CHANCES: ModuleDef[] = [neitherCounts, vennCountsGiven, threeStages, countingFraction];

// ── H98: unitCircle through a point, two angles in turn, two values ──

const pointOnSide = page({
  id: 'g.m11-unit-circle-point-on-side',
  title: 'A point on the terminal side',
  use: 'Use this for “(−3, 4) is on the terminal side of θ. Find sin θ, cos θ and tan θ.”',
  assumptions: [
    'The point is r = √(x² + y²) from the origin, on the ray that ends θ.',
    'Scale it by 1/r and it lands on the unit circle: (x/r, y/r) = (cos θ, sin θ).',
    'So sin θ = y/r, cos θ = x/r and tan θ = y/x; the signs come from the quadrant.',
  ],
  variables: [
    num('x', 'x', 'x of the point', -20, 20, { step: 0.5 }),
    num('y', 'y', 'y of the point', -20, 20, { step: 0.5 }),
    num('r', 'r', 'Distance from the origin', 0, 30, { derived: true }),
    num('s', 'sin θ', 'sin θ', -1, 1, { derived: true, fraction: 100 }),
    num('c', 'cos θ', 'cos θ', -1, 1, { derived: true, fraction: 100 }),
    num('t', 'tan θ', 'tan θ', -1000, 1000, { derived: true, fraction: 100 }),
  ],
  rules: [
    limit(
      'not (0, 0)',
      '({x}, {y}) is not (0, 0)',
      (v) => v.x !== 0 || v.y !== 0,
      'The origin is on every ray: pick another point.',
    ),
    derive(
      'r = √(x² + y²)',
      'r',
      ['x', 'y'],
      '{r} = √({x}² + {y}²)',
      (v) => fin(Math.hypot(v.x!, v.y!)),
      '√({x}² + {y}²)',
      'The distance from the origin, by the Pythagorean theorem.',
    ),
    derive(
      'sin θ = y ÷ r',
      's',
      ['y', 'r'],
      '{s} = {y} ÷ {r}',
      (v) => (v.r ? fin(v.y! / v.r!) : undefined),
      '{y} ÷ {r}',
      'The unit point’s y: the point scaled by 1/r.',
    ),
    derive(
      'cos θ = x ÷ r',
      'c',
      ['x', 'r'],
      '{c} = {x} ÷ {r}',
      (v) => (v.r ? fin(v.x! / v.r!) : undefined),
      '{x} ÷ {r}',
      'The unit point’s x.',
    ),
    derive(
      'tan θ = y ÷ x',
      't',
      ['y', 'x'],
      '{t} = {y} ÷ {x}',
      (v) => (v.x ? fin(v.y! / v.x!) : undefined),
      '{y} ÷ {x}',
      'Rise over run along the ray; there is none when x = 0.',
    ),
  ],
  example: { x: -3, y: 4, r: 5, s: 0.8, c: -0.6, t: -4 / 3 },
  startWith: ['x', 'y'],
  representation: {
    kind: 'unitCircle',
    angle: 0,
    through: { x: 'x', y: 'y', r: 'r' },
    sin: 's',
    cos: 'c',
    tan: 't',
    fixed: true,
  },
});

const sumPair = fromPage(
  'm.12.trig-formulas-equations',
  'g.m12-trig-formulas-equations-pair',
  'The sum formula: A, then B',
  {
    kind: 'unitCircle',
    angle: 'C',
    sin: 'S',
    fixed: true,
    pair: { a: 'A', b: 'B' },
  },
);

const differencePair = fromPage(
  'm.12.trig-formulas-equations~difference',
  'g.m12-trig-formulas-equations-difference-pair',
  'The difference formula: A, then B back',
  {
    kind: 'unitCircle',
    angle: 'C',
    cos: 'K',
    fixed: true,
    pair: { a: 'A', b: 'B', op: 'difference' },
  },
);

/** a·s² + b·s + c = 0 in s = sin x: two values of sin x, each with its angles. */
const twoValues = page({
  id: 'g.m12-trig-formulas-equations-quadratic',
  title: 'A quadratic in sin x',
  use: 'Use this for “Solve 2 sin²x − sin x − 1 = 0 for 0° ≤ x < 360°.”',
  assumptions: [
    'Treat sin x as one unknown s: 2s² − s − 1 = 0 is a quadratic.',
    'Its two roots are two values of sin x; each gives its own angles.',
    'A root past −1 or 1 gives no angle: sin x stays from −1 to 1.',
  ],
  variables: [
    num('a', 'a', 'Number before sin²x', -10, 10, { step: 0.5 }),
    num('b', 'b', 'Number before sin x', -10, 10, { step: 0.5 }),
    num('c', 'c', 'Number term', -10, 10, { step: 0.5 }),
    num('s1', 's₁', 'Smaller value of sin x', -40, 40, { derived: true, fraction: 12 }),
    num('s2', 's₂', 'Larger value of sin x', -40, 40, { derived: true, fraction: 12 }),
  ],
  rules: [
    limit('a ≠ 0', '{a} ≠ 0', (v) => v.a !== 0, 'With a = 0 it is not a quadratic.'),
    limit(
      'b² − 4ac ≥ 0',
      '{b}² − 4 × {a} × {c} ≥ 0',
      (v) => v.b! ** 2 - 4 * v.a! * v.c! >= 0,
      'No real roots: sin x takes no value here.',
    ),
    derive(
      's₁ = (−b − √(b² − 4ac)) ÷ 2a',
      's1',
      ['a', 'b', 'c'],
      '{s1} = (−{b} − √({b}² − 4 × {a} × {c})) ÷ (2 × {a})',
      (v) => {
        const d = v.b! ** 2 - 4 * v.a! * v.c!;
        if (d < 0 || !v.a) return undefined;
        const r = [(-v.b! - Math.sqrt(d)) / (2 * v.a), (-v.b! + Math.sqrt(d)) / (2 * v.a)];
        return fin(Math.min(...r));
      },
      '(−{b} − √({b}² − 4 × {a} × {c})) ÷ (2 × {a})',
      'The quadratic formula in s = sin x: one root.',
    ),
    derive(
      's₂ = (−b + √(b² − 4ac)) ÷ 2a',
      's2',
      ['a', 'b', 'c'],
      '{s2} = (−{b} + √({b}² − 4 × {a} × {c})) ÷ (2 × {a})',
      (v) => {
        const d = v.b! ** 2 - 4 * v.a! * v.c!;
        if (d < 0 || !v.a) return undefined;
        const r = [(-v.b! - Math.sqrt(d)) / (2 * v.a), (-v.b! + Math.sqrt(d)) / (2 * v.a)];
        return fin(Math.max(...r));
      },
      '(−{b} + √({b}² − 4 × {a} × {c})) ÷ (2 × {a})',
      'And the other root.',
    ),
  ],
  example: { a: 2, b: -1, c: -1, s1: -0.5, s2: 1 },
  startWith: ['a', 'b', 'c'],
  equation: '{a} sin²x + {b} sin x + {c} = 0',
  representation: {
    kind: 'unitCircle',
    angle: 0,
    fixed: true,
    solutions: { fn: 'sin', value: 's1', also: 's2' },
  },
});

const CIRCLES: ModuleDef[] = [pointOnSide, sumPair, differencePair, twoValues];

// ── H99: complexPlane powers and roots ──

const powers = fromPage(
  'm.12.polar~de-moivre',
  'g.m12-polar-de-moivre-powers',
  'Powers by De Moivre’s theorem, step by step',
  {
    kind: 'complexPlane',
    z: { re: 'a', im: 'b' },
    power: 'n',
    result: { re: 'p', im: 'q' },
  },
);

const cubeRoots = page({
  id: 'g.m12-polar-roots',
  title: 'The nth roots of a complex number',
  use: 'Use this for “Find the cube roots of 8i.”',
  assumptions: [
    'Write z in polar form: modulus r and argument θ.',
    'Every nth root has modulus the nth root of r, and argument (θ + 360°k) ÷ n.',
    'So the n roots are spaced 360° ÷ n apart on one circle: a regular polygon.',
  ],
  variables: [
    num('a', 'a', 'Real part of z', -100, 100, { step: 0.5 }),
    num('b', 'b', 'Imaginary part of z', -100, 100, { step: 0.5 }),
    num('n', 'n', 'Which root', 2, 12, { step: 1, integer: true }),
    num('A', 'arg z', 'Argument of z', 0, 360, { derived: true, unit: '°' }),
    num('m', 'ρ', 'Modulus of each root', 0, 20, { derived: true }),
    num('t', 'θ₀', 'Argument of the first root', 0, 180, { derived: true, unit: '°' }),
    num('p', 'p', 'Real part of the first root', -20, 20, { derived: true }),
    num('q', 'q', 'Imaginary part of the first root', -20, 20, { derived: true }),
  ],
  rules: [
    limit('z ≠ 0', '{a} + {b}i is not 0', (v) => v.a !== 0 || v.b !== 0, 'Every root of 0 is 0.'),
    derive(
      'ρ = |z|^(1/n)',
      'm',
      ['a', 'b', 'n'],
      '{m} = √({a}² + {b}²)^(1 ÷ {n})',
      (v) => fin(Math.hypot(v.a!, v.b!) ** (1 / v.n!)),
      '√({a}² + {b}²)^(1 ÷ {n})',
      'The modulus of z, then its nth root.',
    ),
    derive(
      'A = arg z',
      'A',
      ['a', 'b'],
      'tan {A} = {b} ÷ {a}, {A} in the quadrant of ({a}, {b})',
      (v) => {
        const d = (Math.atan2(v.b!, v.a!) * 180) / Math.PI;
        return v.a === 0 && v.b === 0 ? undefined : fin(d < 0 ? d + 360 : d);
      },
      (v: Values) => {
        const d = (Math.atan2(v.b!, v.a!) * 180) / Math.PI;
        const deg = d < 0 ? d + 360 : d;
        if (v.a === 0) return String(deg);
        // tan⁻¹ gives −90° to 90°; the rest is a whole number of half turns.
        const off = Math.round((deg - (Math.atan(v.b! / v.a!) * 180) / Math.PI) / 180) * 180;
        return off === 0 ? 'tan⁻¹({b} ÷ {a})' : `${off} + tan⁻¹({b} ÷ {a})`;
      },
      'tan⁻¹ gives −90° to 90°; add half turns to reach the quadrant of z.',
      {},
      {
        check: (v: Values) => {
          const f = (x: number) => formatNumber(x);
          return v.a === 0
            ? `0 = ${f(Math.abs(v.b!))} × cos(${f(v.A!)}°)`
            : `tan(${f(v.A!)}°) = ${f(v.b!)} ÷ ${v.a! < 0 ? `(${f(v.a!)})` : f(v.a!)}`;
        },
      },
    ),
    derive(
      'θ₀ = A ÷ n',
      't',
      ['A', 'n'],
      '{t} = {A} ÷ {n}',
      (v) => fin(v.A! / v.n!),
      '{A} ÷ {n}',
      'The argument of z, shared among n equal turns; the others are 360° ÷ n apart.',
    ),
    derive(
      'p = ρ cos θ₀',
      'p',
      ['m', 't'],
      '{p} = {m} × cos({t}°)',
      (v) => fin(v.m! * Math.cos((v.t! * Math.PI) / 180)),
      '{m} × cos({t}°)',
      'Back to a + bi: the real part.',
    ),
    derive(
      'q = ρ sin θ₀',
      'q',
      ['m', 't'],
      '{q} = {m} × sin({t}°)',
      (v) => fin(v.m! * Math.sin((v.t! * Math.PI) / 180)),
      '{m} × sin({t}°)',
      'And the imaginary part.',
    ),
  ],
  example: { a: 0, b: 8, n: 3, A: 90, m: 2, t: 30, p: Math.sqrt(3), q: 1 },
  startWith: ['a', 'b', 'n'],
  representation: {
    kind: 'complexPlane',
    z: { re: 'a', im: 'b' },
    roots: 'n',
    result: { re: 'p', im: 'q' },
    fixed: true,
  },
});

// ── H99: histogram lit range ──

/** C(n, k), exactly for the small n here. */
const nCk = (n: number, k: number) => {
  let c = 1;
  for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i;
  return Math.round(c);
};
const atLeastTerms = (n: number, p: number, k: number) =>
  Array.from({ length: Math.max(0, n - k + 1) }, (_, i) => k + i);

const atLeast = page({
  id: 'g.m11-probability-distributions-at-least',
  title: 'Binomial: at least k successes',
  use: 'Use this for “A fair coin is tossed 5 times. What is the chance of at least 4 heads?”',
  assumptions: [
    'At least k means k, or k + 1, … up to n: add those bars.',
    'Each bar is C(n, j) × p^j × (1 − p)^(n − j).',
    'For a small k it is quicker to take the rest from 1: P(X ≥ k) = 1 − P(X < k).',
  ],
  variables: [
    num('n', 'n', 'Trials', 1, 12, { step: 1, integer: true }),
    num('p', 'p', 'Chance of success on each trial', 0, 1, { step: 0.01 }),
    num('k', 'k', 'At least this many successes', 0, 12, { step: 1, integer: true }),
    num('P', 'P', 'P(X ≥ k)', 0, 1, { derived: true }),
  ],
  rules: [
    limit(
      'k ≤ n',
      '{k} is at most {n}',
      (v) => v.k! <= v.n!,
      'There can’t be more successes than trials.',
    ),
    derive(
      'P(X ≥ k) = P(k) + … + P(n)',
      'P',
      ['n', 'p', 'k'],
      '{P} = P(X ≥ {k}) for {n} trials at {p}',
      (v) =>
        v.k! > v.n!
          ? undefined
          : fin(
              atLeastTerms(v.n!, v.p!, v.k!).reduce(
                (s, j) => s + nCk(v.n!, j) * v.p! ** j * (1 - v.p!) ** (v.n! - j),
                0,
              ),
            ),
      (v: Values) =>
        atLeastTerms(v.n!, v.p!, v.k!)
          .map((j) => `${nCk(v.n!, j)} × {p}^${j} × (1 − {p})^${v.n! - j}`)
          .join(' + '),
      'Add the bars from k up to n: each is the orders of j successes times their chance.',
      {},
      {
        check: (v: Values) =>
          `${formatNumber(v.P!)} = ${atLeastTerms(v.n!, v.p!, v.k!)
            .map(
              (j) =>
                `${nCk(v.n!, j)} × ${formatNumber(v.p!)}^${j} × (1 − ${formatNumber(v.p!)})^${v.n! - j}`,
            )
            .join(' + ')}`,
      },
    ),
  ],
  example: { n: 5, p: 0.5, k: 4, P: 0.1875 },
  startWith: ['n', 'p', 'k'],
  sliders: true,
  representation: {
    kind: 'histogram',
    binomial: { n: 'n', p: 'p' },
    range: { from: 'k', total: 'P' },
    axis: 'Successes (k)',
  },
});

// ── H99: a CLT simulation ──

const clt = page({
  id: 'g.m12-sampling-distributions-clt',
  title: 'The central limit theorem, simulated',
  use: 'Use this for “Wait times are skewed right with mean 4 minutes. How are the means of samples of 30 spread?”',
  assumptions: [
    'The population is skewed right: most waits are short, a few are long; here σ = μ.',
    'The mean of many sample means is μ, and their spread is σ/√n.',
    'For n of about 30 or more the sample means are close to normal, whatever the population’s shape.',
  ],
  variables: [
    num('mu', 'μ', 'Population mean (min)', 0.5, 60, { step: 0.5 }),
    num('n', 'n', 'Sample size', 1, 100, { step: 1, integer: true }),
    num('m', 'm', 'Samples taken', 10, 2000, { step: 10, integer: true }),
    num('E', 'σ/√n', 'Spread of the sample means (min)', 0, 60, { derived: true }),
    num('N', 'N', 'Waits drawn in all', 10, 200000, { derived: true }),
  ],
  rules: [
    derive(
      'N = n × m',
      'N',
      ['n', 'm'],
      '{N} = {n} × {m}',
      (v) => v.n! * v.m!,
      '{n} × {m}',
      'Each of the m samples draws n waits from the population.',
    ),
    derive(
      'σ/√n',
      'E',
      ['mu', 'n'],
      '{E} = {mu} ÷ √{n}',
      (v) => fin(v.mu! / Math.sqrt(v.n!)),
      '{mu} ÷ √{n}',
      'Here σ = μ; divide it by √n, the square root of the sample size.',
    ),
  ],
  example: { mu: 4, n: 30, m: 1000, E: 4 / Math.sqrt(30), N: 30000 },
  startWith: ['mu', 'n', 'm'],
  sliders: true,
  representation: {
    kind: 'histogram',
    clt: { mean: 'mu', n: 'n', samples: 'm', se: 'E' },
  },
});

export const HS2G_GALLERY_MODULES: ModuleDef[] = [
  ...TERMS,
  ...GRAPHS,
  areaBox,
  ...MONOMIALS,
  ...CHANCES,
  ...CIRCLES,
  powers,
  cubeRoots,
  atLeast,
  clt,
];

export const HS2G_GALLERY_LAYOUTS: LayoutDef[] = [];
