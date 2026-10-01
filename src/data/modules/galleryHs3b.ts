/**
 * Grades 9–12 round 3 gallery demos (group H3B: math options (H106); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in. Spread into
 * gallery.ts.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import { MATH_10_MODULES } from './math/10';
import { MATH_11_MODULES } from './math/11';
import { MATH_12_MODULES } from './math/12';
import { MATH_9_MODULES } from './math/9';
import { SCIENCE_11_MODULES } from './science/11';
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
): Rule {
  return rule(id, display, [x, ...inputs], (v) => v[x]! - (f(v) ?? NaN), {
    [x]: [(v: Values) => f(v), expr, how, more],
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

const PAGES = [
  ...MATH_9_MODULES,
  ...MATH_10_MODULES,
  ...MATH_11_MODULES,
  ...MATH_12_MODULES,
  ...SCIENCE_11_MODULES,
];

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
  if (!found) throw new Error(`galleryHs3b: no page ${pageId}`);
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

/** The page with its unit menu back: no pinned units, every system offered. */
function withUnitMenu(
  pageId: string,
  id: string,
  title: string,
  representation: Representation,
): ModuleDef {
  const found = PAGES.find((m) => m.id === pageId);
  if (!found) throw new Error(`galleryHs3b: no page ${pageId}`);
  const { unitSystems: _pinned, ...page } = fromPage(pageId, id, title, representation);
  return {
    ...page,
    variables: found.variables.map(({ units: _units, ...v }) => v),
  };
}

// ── H106 part 1: functionGraph in the unit menu's units (`unitsOf`) ──

const UNIT_MENU: ModuleDef[] = [
  withUnitMenu(
    'm.9.quadratic-functions~projectile',
    'g.m9-quadratic-functions-projectile-units',
    'A ball thrown up, in any units',
    {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'standard',
      a: 'A',
      b: 'v',
      c: 'h0',
      name: 'h',
      at: { x: 't', y: 'H' },
      xMin: 0,
      axes: { x: 'Time t', y: 'Height h' },
      unitsOf: { x: 't', y: 'H' },
      shows: { vertex: { x: 'T', y: 'M' } },
      marks: ['vertex', 'zeros'],
    },
  ),
  withUnitMenu(
    's.11.oscillations',
    'g.s11-oscillations-units',
    'A mass on a spring, in any units',
    {
      kind: 'functionGraph',
      family: 'cos',
      a: 'A',
      b: 'w',
      name: 'x',
      input: 't',
      shows: { amplitude: 'A', period: 'T' },
      marks: ['amplitude', 'period'],
      xMin: 0,
      axes: { x: 'Time t', y: 'Position x' },
      unitsOf: { x: 'T', y: 'A' },
    },
  ),
  withUnitMenu(
    's.11.oscillations~hooke',
    'g.s11-oscillations-hooke-units',
    'Hooke’s law, in any units',
    {
      kind: 'functionGraph',
      family: 'linear',
      m: 'k',
      b: 0,
      name: 'F',
      input: 'x',
      at: { x: 'x', y: 'F' },
      shade: { from: 0, to: 'x' },
      xMin: 0,
      axes: { x: 'Stretch x', y: 'Force F' },
      unitsOf: { x: 'x', y: 'F' },
    },
  ),
];

// ── H106 part 2: two curves on one graph, g(x) = a·f(x − h) + k (`transform`) ──

/** m.9.function-notation~transform: f(x) = x² (or √x) and g(x) = a·f(x − h) + k. */
function transformDemo(
  id: string,
  title: string,
  parent: 'square' | 'root',
  example: Values,
): ModuleDef {
  const square = parent === 'square';
  const f = (p: number) => (square ? p * p : p >= 0 ? Math.sqrt(p) : NaN);
  const fText = square ? '{p}²' : '√{p}';
  return page({
    id,
    title,
    use: square
      ? 'Use this for “f(x) = x². Graph g(x) = 2f(x − 3) + 1. Where does the point (1, 1) of f go?”'
      : 'Use this for “f(x) = √x. Graph g(x) = −f(x + 2) + 3. Where does (4, 2) go?”',
    assumptions: [
      'f(x − h) moves the graph h to the right; a negative h moves it left.',
      'a·f(x) stretches every height by a (a negative a flips it), then + k moves it up by k.',
      'So the point (p, f(p)) of f lands at (p + h, a·f(p) + k) on g.',
    ],
    variables: [
      num('a', 'a', 'Stretch', -5, 5, { step: 0.5 }),
      num('h', 'h', 'Shift right', -10, 10, { step: 0.5 }),
      num('k', 'k', 'Shift up', -10, 10, { step: 0.5 }),
      num('p', 'p', 'Point of f: x', square ? -10 : 0, 10, { step: 0.5 }),
      num('q', 'q', square ? 'f(p) = p²' : 'f(p) = √p', 0, 100, { derived: true }),
      num('X', 'X', 'Image x, p + h', -20, 20, { derived: true }),
      num('Y', 'Y', 'Image y, a·f(p) + k', -600, 600, { derived: true }),
    ],
    rules: [
      limit('a ≠ 0', '{a} ≠ 0', (v) => v.a !== 0, 'With a = 0, g is the flat line y = k.'),
      derive(
        square ? 'q = p²' : 'q = √p',
        'q',
        ['p'],
        `{q} = ${fText}`,
        (v) => fin(f(v.p!)),
        fText,
        square ? 'Put p into f: square it.' : 'Put p into f: take its square root.',
      ),
      derive(
        'X = p + h',
        'X',
        ['p', 'h'],
        '{X} = {p} + {h}',
        (v) => fin(v.p! + v.h!),
        '{p} + {h}',
        'Inside the brackets, x − h = p when x = p + h: the point moves h across.',
      ),
      derive(
        'Y = a × q + k',
        'Y',
        ['a', 'q', 'k'],
        '{Y} = {a} × {q} + {k}',
        (v) => fin(v.a! * v.q! + v.k!),
        '{a} × {q} + {k}',
        'Outside, the height is multiplied by a, then k is added.',
      ),
    ],
    example,
    startWith: ['a', 'h', 'k', 'p'],
    equation: 'g(x) = {a}·f(x − {h}) + {k}',
    representation: {
      kind: 'functionGraph',
      ...(square
        ? { family: 'quadratic' as const, form: 'vertex' as const, h: 0, k: 0 }
        : { family: 'root' as const, index: 2 as const }),
      transform: { a: 'a', h: 'h', k: 'k', from: 'p', image: { x: 'X', y: 'Y' } },
    },
  });
}

const TRANSFORM: ModuleDef[] = [
  transformDemo('g.m9-function-notation-transform-square', 'Transform f(x) = x²', 'square', {
    a: 2,
    h: 3,
    k: 1,
    p: 1,
    q: 1,
    X: 4,
    Y: 3,
  }),
  transformDemo('g.m9-function-notation-transform-root', 'Transform f(x) = √x', 'root', {
    a: -1,
    h: -2,
    k: 3,
    p: 4,
    q: 2,
    X: 2,
    Y: 1,
  }),
];

// ── H106 part 3: the power family y = a·x^(p/q) (m.11.radical-functions~rational-exponent) ──

/** x^(p/q) over the reals: an odd q takes the real root of a negative x. */
const realPow = (x: number, p: number, q: number) =>
  x < 0 ? (q % 2 ? (-((-x) ** (1 / q))) ** p : NaN) : x === 0 && p < 0 ? NaN : x ** (p / q);

function powerDemo(id: string, title: string, example: Values): ModuleDef {
  return page({
    id,
    title,
    use: 'Use this for “Graph y = x^(2/3). What is y at x = 8?” or “Evaluate 2 × 4^(−1/2).”',
    assumptions: [
      'x^(p/q) is the qth root of x, raised to the power p: 8^(2/3) = (∛8)² = 4.',
      'An even root needs x ≥ 0; an odd root also takes negative numbers.',
      'A negative p puts x^(p/q) under 1, so x = 0 has no value.',
    ],
    variables: [
      num('a', 'a', 'Stretch', -10, 10, { step: 0.5 }),
      num('p', 'p', 'Power p (top of the exponent)', -6, 6, { integer: true }),
      num('q', 'q', 'Root q (bottom of the exponent)', 1, 12, { integer: true }),
      // x ≥ 0: the step text can't raise a negative number to a fraction (the graph can).
      num('x', 'x', 'Input', 0, 100, { step: 0.5 }),
      num('y', 'y', 'Output', -1e6, 1e6, { derived: true }),
    ],
    rules: [
      limit('p ≠ 0', '{p} ≠ 0', (v) => v.p !== 0, 'With p = 0, x⁰ is 1: take a p that is not 0.'),
      limit(
        'x in the domain',
        '{x}^({p}/{q})',
        (v) =>
          v.x === undefined ||
          v.p === undefined ||
          v.q === undefined ||
          Number.isFinite(realPow(v.x, v.p, v.q)),
        'This x has no value: an even root needs x ≥ 0, and a negative power needs x ≠ 0.',
      ),
      derive(
        'y = a × x^(p/q)',
        'y',
        ['a', 'x', 'p', 'q'],
        '{y} = {a} × {x}^({p}/{q})',
        (v) => fin(v.a! * realPow(v.x!, v.p!, v.q!)),
        '{a} × {x}^({p}/{q})',
        'Take the qth root of x, raise it to the power p, then multiply by a.',
      ),
    ],
    example,
    startWith: ['a', 'p', 'q', 'x'],
    equation: 'y = {a}·x^({p}/{q})',
    representation: {
      kind: 'functionGraph',
      family: 'power',
      a: 'a',
      p: 'p',
      q: 'q',
      at: { x: 'x', y: 'y' },
      marks: ['vertex', 'asymptotes', 'domain'],
    },
  });
}

const POWER: ModuleDef[] = [
  powerDemo('g.m11-radical-functions-rational-exponent', 'y = a·x^(p/q)', {
    a: 1,
    p: 2,
    q: 3,
    x: 8,
    y: 4,
  }),
  powerDemo('g.m11-radical-functions-rational-exponent-negative', 'y = a·x^(p/q), p < 0', {
    a: 2,
    p: -1,
    q: 2,
    x: 4,
    y: 1,
  }),
];

// ── H106 part 4: the log-sum curve (m.11.exp-log-equations~two-logs) ──

const logSumPicture: Representation = {
  kind: 'functionGraph',
  family: 'logSum',
  b: 'b',
  c: 'c',
  other: { family: 'linear', m: 0, b: 'y' },
  crossing: { x: 'x1', y: 'y' },
  reject: 'x2',
  marks: ['asymptotes'],
};

/**
 * bʸ at least 0.000001: past it x₁ is too near 0 to work out (−c + √(c² + 4u) cancels), and the
 * crossing would sit on the asymptote. The page needs the same limit when it takes the curve.
 */
const withDrawable = (m: ModuleDef): ModuleDef => {
  const r = limit(
    'b^y ≥ 0.000001',
    '{u} is at least 0.000001',
    (v) => v.u === undefined || v.u >= 1e-6,
    'bʸ is too small to draw: take a larger y.',
  );
  return {
    ...m,
    relations: [...m.relations, r.relation],
    steps: { ...m.steps, [r.relation.id]: r.steps },
  };
};

const LOG_SUM: ModuleDef[] = [
  withDrawable(
    fromPage(
      'm.11.exp-log-equations~two-logs',
      'g.m11-exp-log-equations-two-logs-curve',
      'Two logs: the log-sum curve',
      logSumPicture,
    ),
  ),
  withDrawable(
    fromPage(
      'm.11.exp-log-equations~two-logs',
      'g.m11-exp-log-equations-two-logs-curve-plus',
      'Two logs, x + c with c > 0',
      logSumPicture,
      {
        use: 'Use this for “Solve log₂ x + log₂(x + 6) = 4.”',
        example: { b: 2, c: 6, y: 4, u: 16, x1: 2, x2: -8 },
      },
    ),
  ),
];

// ── H106 part 5: lineSystem with a parabola (m.9.inequality-systems, nonlinear systems) ──

/** The crossings of y = ax² + px + q and y = mx + k: ax² + (p − m)x + (q − k) = 0. */
const meet = (v: Values, sign: 1 | -1) => {
  const [A, B, C] = [v.a!, v.p! - v.m!, v.q! - v.k!];
  const D = B * B - 4 * A * C;
  if (!A || D < 0) return undefined;
  // a > 0: the minus sign gives the smaller root.
  return fin((-B + sign * Math.sqrt(D)) / (2 * A));
};

function nonlinearDemo(
  id: string,
  title: string,
  use: string,
  example: Values,
  shade?: { curve: '≥' | '≤' | '>' | '<'; line: '≥' | '≤' | '>' | '<' },
): ModuleDef {
  return page({
    id,
    title,
    use,
    assumptions: [
      'At a crossing both equations give the same y, so set ax² + px + q equal to mx + k.',
      'Gather everything on one side: ax² + (p − m)x + (q − k) = 0, then use the quadratic formula.',
      'Two roots: the line cuts the parabola twice; one: it touches; none: it misses.',
    ],
    variables: [
      num('a', 'a', 'x² coefficient of the parabola (opens up)', 0.5, 5, { step: 0.5 }),
      num('p', 'p', 'x coefficient of the parabola', -10, 10, { step: 0.5 }),
      num('q', 'q', 'Constant of the parabola', -20, 20, { step: 0.5 }),
      num('m', 'm', 'Slope of the line', -10, 10, { step: 0.5 }),
      num('k', 'k', 'y-intercept of the line', -20, 20, { step: 0.5 }),
      num('x1', 'x₁', 'Left crossing x', -100, 100, { derived: true }),
      num('y1', 'y₁', 'Left crossing y', -10000, 10000, { derived: true }),
      num('x2', 'x₂', 'Right crossing x', -100, 100, { derived: true }),
      num('y2', 'y₂', 'Right crossing y', -10000, 10000, { derived: true }),
    ],
    rules: [
      limit(
        'they meet',
        '({p} − {m})² − 4 × {a} × ({q} − {k}) ≥ 0',
        (v) => (v.p! - v.m!) ** 2 - 4 * v.a! * (v.q! - v.k!) >= 0,
        'The line misses the parabola: ax² + (p − m)x + (q − k) = 0 has no real root.',
      ),
      derive(
        'x₁ = smaller root',
        'x1',
        ['a', 'p', 'q', 'm', 'k'],
        '{x1} = smaller root of {a}x² + ({p} − {m})x + ({q} − {k}) = 0',
        (v) => meet(v, -1),
        '(−({p} − {m}) − √(({p} − {m})² − 4 × {a} × ({q} − {k}))) ÷ (2 × {a})',
        'Set the two right sides equal, gather on one side, and take the smaller root.',
      ),
      derive(
        'y₁ = m x₁ + k',
        'y1',
        ['m', 'x1', 'k'],
        '{y1} = {m} × {x1} + {k}',
        (v) => fin(v.m! * v.x1! + v.k!),
        '{m} × {x1} + {k}',
        'Put x₁ into the line (the simpler equation) for its y.',
      ),
      derive(
        'x₂ = larger root',
        'x2',
        ['a', 'p', 'q', 'm', 'k'],
        '{x2} = larger root of {a}x² + ({p} − {m})x + ({q} − {k}) = 0',
        (v) => meet(v, 1),
        '(−({p} − {m}) + √(({p} − {m})² − 4 × {a} × ({q} − {k}))) ÷ (2 × {a})',
        'The other root: the second crossing (the same point when the line only touches).',
      ),
      derive(
        'y₂ = m x₂ + k',
        'y2',
        ['m', 'x2', 'k'],
        '{y2} = {m} × {x2} + {k}',
        (v) => fin(v.m! * v.x2! + v.k!),
        '{m} × {x2} + {k}',
        'Put x₂ into the line for its y.',
      ),
    ],
    example,
    startWith: ['a', 'p', 'q', 'm', 'k'],
    equation: shade
      ? `y ${shade.curve} {a}x² + {p}x + {q}\ny ${shade.line} {m}x + {k}`
      : 'y = {a}x² + {p}x + {q}\ny = {m}x + {k}',
    representation: {
      kind: 'lineSystem',
      lines: [
        { square: 'a', slope: 'p', intercept: 'q', ...(shade ? { shade: shade.curve } : {}) },
        { slope: 'm', intercept: 'k', ...(shade ? { shade: shade.line } : {}) },
      ],
      solutions: [
        { x: 'x1', y: 'y1' },
        { x: 'x2', y: 'y2' },
      ],
      extent: 10,
    },
  });
}

const NONLINEAR: ModuleDef[] = [
  nonlinearDemo(
    'g.m9-inequality-systems-nonlinear',
    'A line and a parabola',
    'Use this for “Solve y = x² − 2x − 3 and y = x + 1.”',
    { a: 1, p: -2, q: -3, m: 1, k: 1, x1: -1, y1: 0, x2: 4, y2: 5 },
  ),
  nonlinearDemo(
    'g.m9-inequality-systems-nonlinear-shaded',
    'Inequalities with a parabola',
    'Use this for “Graph y ≥ x² − 4 and y < x + 2. Where do the boundaries cross?”',
    { a: 1, p: 0, q: -4, m: 1, k: 2, x1: -2, y1: 0, x2: 3, y2: 5 },
    { curve: '≥', line: '<' },
  ),
];

// ── H106 part 6: polygon with its apothem (m.10.quadrilaterals~regular-area) ──

const apothemPicture: Representation = {
  kind: 'polygon',
  sides: 'n',
  side: 's',
  apothem: 'a',
  angle: 't',
  around: 'P',
  area: 'K',
};

const tanDeg = (d: number) => Math.tan((d * Math.PI) / 180);

const APOTHEM: ModuleDef[] = [
  fromPage(
    'm.10.quadrilaterals~regular-area',
    'g.m10-quadrilaterals-regular-area-apothem',
    'Regular polygon: the apothem',
    apothemPicture,
  ),
  fromPage(
    'm.10.quadrilaterals~regular-area',
    'g.m10-quadrilaterals-regular-area-apothem-12',
    'Regular dodecagon: the apothem',
    apothemPicture,
    {
      use: 'Use this for “A regular 12-gon has sides of 2 cm. Find its apothem and its area.”',
      example: {
        n: 12,
        s: 2,
        P: 24,
        t: 15,
        a: 2 / (2 * tanDeg(15)),
        K: (24 * 2) / (2 * tanDeg(15)) / 2,
      },
    },
  ),
];

// ── H106 part 7: a one-event Venn diagram (m.10.probability-rules~complement) ──

/** A demo without some of the page's values, every rule that uses them and their examples. */
function without(m: ModuleDef, ids: string[]): ModuleDef {
  const uses = (r: Relation) => r.vars.some((x) => ids.includes(x));
  const gone = new Set(m.relations.filter(uses).map((r) => r.id));
  return {
    ...m,
    variables: m.variables.filter((v) => !ids.includes(v.id)),
    relations: m.relations.filter((r) => !gone.has(r.id)),
    steps: Object.fromEntries(Object.entries(m.steps).filter(([k]) => !gone.has(k))),
    example: Object.fromEntries(Object.entries(m.example).filter(([k]) => !ids.includes(k))),
    startWith: m.startWith?.filter((k) => !ids.includes(k)),
  };
}

const ONE_EVENT: ModuleDef[] = [
  without(
    fromPage(
      'm.10.probability-rules~complement',
      'g.m10-probability-rules-complement-one-event',
      'The complement rule: one event',
      {
        kind: 'venn',
        chances: {
          a: 'a',
          b: 0,
          both: 0,
          names: ['Rain', 'Wind'],
          shade: 'notA',
          result: 's',
          one: true,
        },
      },
    ),
    ['b', 'ab'],
  ),
];

// ── H106 part 8: a table with its graph and the best point (m.10.modeling-density) ──

/** The page's own table, with its graph and the best point, and its unit menu back. */
function tableGraphDemo(pageId: string, id: string, title: string, best: 'min' | 'max') {
  const found = PAGES.find((m) => m.id === pageId)!;
  const table = found.representation as Extract<Representation, { kind: 'table'; sweep: string }>;
  return withUnitMenu(pageId, id, title, { ...table, graph: { best }, rowsFrom: 'shown' });
}

/** Seven pen lengths in 1-2-5 steps up to half the fence (the square's side among them). */
function fenceRows(v: Values): number[] {
  const P = v.P !== undefined && v.P > 0 ? v.P : 40;
  const raw = P / 16;
  const p = 10 ** Math.floor(Math.log10(raw));
  const step = [5, 2, 1].map((k) => k * p).find((t) => t <= raw * 1.01)!;
  return Array.from({ length: 7 }, (_, i) => exact((i + 1) * step)).filter((x) => x < P / 2);
}

const TABLE_GRAPH: ModuleDef[] = [
  tableGraphDemo(
    'm.10.modeling-density~can-design',
    'g.m10-modeling-density-can-design-graph',
    'The least metal for a can: table and graph',
    'min',
  ),
  fromPage(
    'm.10.modeling-density~fence',
    'g.m10-modeling-density-fence-graph',
    'The most area for a fence: table and graph',
    {
      kind: 'table',
      sweep: 'x',
      output: 'A',
      params: ['P'],
      rows: fenceRows,
      graph: { best: 'max' },
      rowsFrom: 'shown',
    },
  ),
];

// ── H106 part 9: population density on a map (m.10.modeling-density~population) ──

const populationPicture: Representation = {
  kind: 'circle',
  radius: 'r',
  area: 'A',
  extent: 4,
  population: { people: 'N', density: 'D' },
};

const POPULATION: ModuleDef[] = [
  fromPage(
    'm.10.modeling-density~population',
    'g.m10-modeling-density-population-map',
    'Population density on a map',
    populationPicture,
    { pictureLabels: [] },
  ),
  fromPage(
    'm.10.modeling-density~population',
    'g.m10-modeling-density-population-map-small',
    'A village: population density on a map',
    populationPicture,
    {
      pictureLabels: [],
      use: 'Use this for “1,200 people live within 0.8 km of a village’s center. How many per km²?”',
      example: { r: 0.8, A: 0.64 * Math.PI, N: 1200, D: 1200 / (0.64 * Math.PI) },
    },
  ),
];

// ── H106 part 10: symmetry about the figure's own center (m.10.rigid-motions~symmetry) ──

const aboutCenter: Representation = {
  kind: 'transformation',
  figure: [
    [1, 1],
    ['r', 1],
    ['r', 'u'],
    [1, 'u'],
  ],
  move: 'rotate',
  angle: 't',
  about: 'center',
  symmetry: true,
  extent: 10,
  quadrants: 1,
};

const SYMMETRY: ModuleDef[] = [
  without(
    fromPage(
      'm.10.rigid-motions~symmetry',
      'g.m10-rigid-motions-symmetry-center',
      'Symmetry about the center',
      aboutCenter,
    ),
    ['a', 'b'],
  ),
  without(
    fromPage(
      'm.10.rigid-motions~symmetry',
      'g.m10-rigid-motions-symmetry-center-quarter',
      'A quarter turn about the center',
      aboutCenter,
      {
        use: 'Use this for “Does a 90° turn about its center carry a 5 by 3 rectangle onto itself?”',
        example: { w: 5, h: 3, t: 90, r: 6, u: 4, a: 3.5, b: 2.5, L: 2, n: 2, f: 0 },
      },
    ),
    ['a', 'b'],
  ),
];

// ── H106 part 11: rectangle measurement bounds (m.9.units-precision~bounds) ──

const boundsPicture: Representation = {
  kind: 'rectangle',
  length: 'l',
  width: 'w',
  inside: 'A',
  extent: 10,
  bounds: { error: 'e', least: 'lo', greatest: 'hi' },
};

const BOUNDS: ModuleDef[] = [
  fromPage(
    'm.9.units-precision~bounds',
    'g.m9-units-precision-bounds-band',
    'Least and greatest area: the band',
    boundsPicture,
  ),
  fromPage(
    'm.9.units-precision~bounds',
    'g.m9-units-precision-bounds-fine',
    'Least and greatest area: a fine ruler',
    boundsPicture,
    {
      use: 'Use this for “A card measures 8.5 cm by 5.4 cm to the nearest 0.1 cm. What are the least and greatest areas?”',
      example: {
        l: 8.5,
        w: 5.4,
        u: 0.1,
        e: 0.05,
        A: 45.9,
        lo: 8.45 * 5.35,
        hi: 8.55 * 5.45,
        plo: 2 * 8.45 + 2 * 5.35,
        phi: 2 * 8.55 + 2 * 5.45,
      },
    },
  ),
];

// ── H106 part 12: vectors in space on x, y, z axes (m.12.vectors-3d) ──

const U3 = { name: 'u', x: 'a', y: 'b', z: 'c' };
const V3 = { name: 'v', x: 'd', y: 'e', z: 'f' };

const SPACE: ModuleDef[] = [
  fromPage('m.12.vectors-3d', 'g.m12-vectors-3d-angle', 'The angle between vectors in space', {
    kind: 'vectorDiagram',
    vectors: [U3, V3],
    space: { dot: 'p', angle: 't' },
  }),
  fromPage('m.12.vectors-3d~cross', 'g.m12-vectors-3d-cross-axes', 'The cross product in space', {
    kind: 'vectorDiagram',
    vectors: [U3, V3],
    space: { cross: { x: 'x', y: 'y', z: 'z' }, area: 'A', triangle: 'Tri' },
  }),
  fromPage('m.12.vectors-3d~triple', 'g.m12-vectors-3d-triple-box', 'The box three vectors span', {
    kind: 'vectorDiagram',
    vectors: [U3, V3],
    space: { w: { name: 'w', x: 'g', y: 'h', z: 'k' }, triple: 'T', volume: 'Vol' },
  }),
  fromPage(
    'm.12.vectors-3d~distance',
    'g.m12-vectors-3d-distance-axes',
    'Distance and midpoint on x, y, z axes',
    {
      kind: 'vectorDiagram',
      vectors: [
        { name: 'P', x: 'p', y: 'q', z: 'r' },
        { name: 'Q', x: 's', y: 't', z: 'u' },
      ],
      space: { points: true, distance: 'd', mid: { x: 'mx', y: 'my', z: 'mz' } },
    },
  ),
];

// ── H106 part 13: a conic on the polar grid (m.12.polar-conics, ~sine) ──

const polarConic = (fn: 'cos' | 'sin'): Representation => ({
  kind: 'polarGrid',
  curve: { shape: 'conic', k: 'k', m: 'm', n: 'n', fn, e: 'e', d: 'd' },
  point: { r: 'r', theta: 't' },
});

const POLAR_CONICS: ModuleDef[] = [
  fromPage(
    'm.12.polar-conics',
    'g.m12-polar-conics-ellipse-curve',
    'A polar ellipse with its focus and directrix',
    polarConic('cos'),
  ),
  fromPage(
    'm.12.polar-conics',
    'g.m12-polar-conics-hyperbola-curve',
    'A polar hyperbola with its focus and directrix',
    polarConic('cos'),
    {
      use: 'Use this for “Name the conic r = 6 ÷ (1 − 2 cos θ), its eccentricity and its directrix.”',
      example: { k: 6, m: 1, n: 2, e: 2, d: 3, t: 120, r: 3 },
    },
  ),
  fromPage(
    'm.12.polar-conics~sine',
    'g.m12-polar-conics-sine-parabola-curve',
    'A polar parabola with sin θ',
    polarConic('sin'),
    { example: { k: 4, m: 1, n: -1, e: 1, d: 4, t: 30, r: 4 / 1.5 } },
  ),
];

// ── H106 part 14: a conic turned by θ (m.12.polar-conics~rotation, ~rotated-equation) ──

const TURNED: ModuleDef[] = [
  fromPage(
    'm.12.polar-conics~rotation',
    'g.m12-polar-conics-rotation-turned',
    'Turning the axes of an ellipse',
    { kind: 'conicGraph', conic: 'turned', A: 'A', B: 'B', C: 'C', angle: 't', discriminant: 'D' },
  ),
  fromPage(
    'm.12.polar-conics~rotation',
    'g.m12-polar-conics-rotation-turned-hyperbola',
    'Turning the axes of a hyperbola',
    { kind: 'conicGraph', conic: 'turned', A: 'A', B: 'B', C: 'C', angle: 't', discriminant: 'D' },
    {
      use: 'Use this for “Through what angle should the axes turn to remove the xy term of x² + 4xy + y² = 1? Which conic is it?”',
      example: { A: 1, B: 4, C: 1, D: 12, t: 45 },
    },
  ),
  fromPage(
    'm.12.polar-conics~rotated-equation',
    'g.m12-polar-conics-rotated-equation-turned',
    'The equation in the turned axes',
    {
      kind: 'conicGraph',
      conic: 'turned',
      A: 'A',
      B: 'B',
      C: 'C',
      angle: 't',
      turned: { A: 'P', C: 'Q' },
    },
  ),
];

// ── H106 part 15: Riemann rectangles under a curve (m.12.area-under-curve, ~line) ──

const underSquare: Representation = {
  kind: 'functionGraph',
  family: 'quadratic',
  form: 'vertex',
  a: 'c',
  h: 0,
  k: 0,
  shade: { from: 0, to: 'b' },
  riemann: { n: 'n', to: 'b', sum: 'S' },
  fixed: true,
};

const RIEMANN: ModuleDef[] = [
  fromPage(
    'm.12.area-under-curve',
    'g.m12-area-under-curve-rectangles',
    'Right rectangles under y = cx²',
    underSquare,
  ),
  fromPage(
    'm.12.area-under-curve',
    'g.m12-area-under-curve-rectangles-many',
    'A hundred rectangles under y = cx²',
    underSquare,
    {
      use: 'Use this for “Estimate the area under y = x² from 0 to 3 with 100 rectangles. How close is it to 9?”',
      example: { c: 1, b: 3, n: 100, w: 0.03, S: (0.03 ** 3 * 100 * 101 * 201) / 6, A: 9 },
    },
  ),
  fromPage(
    'm.12.area-under-curve~line',
    'g.m12-area-under-curve-line-rectangles',
    'Right rectangles under a line',
    {
      kind: 'functionGraph',
      family: 'linear',
      m: 'm',
      b: 'k',
      shade: { from: 0, to: 'b' },
      riemann: { n: 'n', to: 'b', sum: 'S' },
      fixed: true,
    },
  ),
];

// ── H106 part 16: a rational function by its top's coefficients (m.12.partial-fractions) ──

const RATIONAL_TOP: ModuleDef[] = [
  fromPage(
    'm.12.partial-fractions~quadratic',
    'g.m12-partial-fractions-quadratic-graph',
    'A quadratic factor: the graph',
    {
      kind: 'functionGraph',
      family: 'rational',
      top: ['a', 'b', 'c'],
      poles: ['p'],
      quadratics: [{ j: 'j', k: 'k' }],
      at: { x: 'x', y: 'y' },
      marks: ['asymptotes'],
    },
  ),
  without(
    fromPage(
      'm.12.partial-fractions',
      'g.m12-partial-fractions-number-top-graph',
      'A number alone on top: the graph',
      {
        kind: 'functionGraph',
        family: 'rational',
        top: ['a', 'b'],
        poles: ['p', 'q'],
        marks: ['asymptotes'],
        fixed: true,
      },
      {
        use: 'Use this for “Write 4 ÷ ((x − 1)(x + 3)) as partial fractions.”',
        example: { a: 0, b: 4, p: 1, q: -3, A: 1, B: -1 },
      },
    ),
    ['z', 'L'],
  ),
  without(
    fromPage(
      'm.12.partial-fractions~repeated',
      'g.m12-partial-fractions-repeated-top-graph',
      'A repeated factor: the graph',
      {
        kind: 'functionGraph',
        family: 'rational',
        top: ['a', 'b'],
        poles: ['p', 'p'],
        marks: ['asymptotes'],
        fixed: true,
      },
    ),
    ['z', 'L'],
  ),
];

// ── H106 part 17: the squares on a terms chart (m.12.induction~squares) ──

const squares: Representation = {
  kind: 'termsChart',
  type: 'power',
  first: 1,
  step: 2,
  count: 'n',
  as: 'bars',
  sums: true,
  sum: 'S',
  far: true,
};

const SQUARES: ModuleDef[] = [
  fromPage(
    'm.12.induction~squares',
    'g.m12-induction-squares-chart',
    'The sum of squares',
    squares,
  ),
  fromPage(
    'm.12.induction~squares',
    'g.m12-induction-squares-chart-far',
    'The sum of the first 40 squares',
    squares,
    {
      use: 'Use this for “Find 1² + 2² + … + 40² and check the step to 41 terms.”',
      example: { n: 40, S: 22140, a: 1681, T: 23821, F: 23821 },
    },
  ),
];

export const HS3B_GALLERY_MODULES: ModuleDef[] = [
  ...UNIT_MENU,
  ...TRANSFORM,
  ...POWER,
  ...LOG_SUM,
  ...NONLINEAR,
  ...APOTHEM,
  ...ONE_EVENT,
  ...TABLE_GRAPH,
  ...POPULATION,
  ...SYMMETRY,
  ...BOUNDS,
  ...SPACE,
  ...POLAR_CONICS,
  ...TURNED,
  ...RIEMANN,
  ...RATIONAL_TOP,
  ...SQUARES,
];

export const HS3B_GALLERY_LAYOUTS: LayoutDef[] = [];
