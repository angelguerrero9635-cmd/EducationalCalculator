/**
 * College gallery demos, round 3, group B (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example (docs/plans/he.math.md).
 * Spread into gallery.ts.
 * HC46: `surfacePlot` (calc-3#1 partials and extrema, calc-3#2 prisms, ~directional, ~lagrange).
 */
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
): Rule =>
  rule(id, display, [x, ...inputs], (v) => v[x]! - (f(v) ?? NaN), {
    [x]: [(v) => fin(f(v) ?? NaN), expr, how],
  });

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

/** The example's typed values and every rule's value worked out in order. */
function example(typed: Values, rules: Rule[]): Values {
  const v: Values = { ...typed };
  for (const r of rules) {
    const [x] = r.relation.vars;
    if (r.relation.constraint || x === undefined || x in v) continue;
    const got = r.relation.solve?.[x]?.(v);
    if (typeof got === 'number') v[x] = got;
  }
  return v;
}

// ── HC46: surfaces z = f(x, y) ──

/** The quadratic f = ax² + bxy + cy² + dx + ey: its coefficients' boxes. */
const COEFFS = [
  num('qa', 'a', 'x² coefficient', -50, 50, { step: 0.5 }),
  num('qb', 'b', 'xy coefficient', -50, 50, { step: 0.5 }),
  num('qc', 'c', 'y² coefficient', -50, 50, { step: 0.5 }),
  num('qd', 'd', 'x coefficient', -100, 100, { step: 0.5 }),
  num('qe', 'e', 'y coefficient', -100, 100, { step: 0.5 }),
];
const QUAD = 'qa*x^2 + qb*x*y + qc*y^2 + qd*x + qe*y';
const quad = (v: Values, x: number, y: number) =>
  v.qa! * x * x + v.qb! * x * y + v.qc! * y * y + v.qd! * x + v.qe! * y;

/** f, ∂f/∂x, ∂f/∂y and |∇f| at (x₀, y₀). */
const pointRules: Rule[] = [
  derive(
    'value',
    'z0',
    ['qa', 'qb', 'qc', 'qd', 'qe', 'x0', 'y0'],
    '{z0} = {qa} × {x0}² + {qb} × {x0} × {y0} + {qc} × {y0}² + {qd} × {x0} + {qe} × {y0}',
    (v) => quad(v, v.x0!, v.y0!),
    '{qa} × {x0}^2 + {qb} × {x0} × {y0} + {qc} × {y0}^2 + {qd} × {x0} + {qe} × {y0}',
    'Put x₀ and y₀ into f.',
  ),
  derive(
    'fx',
    'fx',
    ['qa', 'qb', 'qd', 'x0', 'y0'],
    '{fx} = 2 × {qa} × {x0} + {qb} × {y0} + {qd}',
    (v) => 2 * v.qa! * v.x0! + v.qb! * v.y0! + v.qd!,
    '2 × {qa} × {x0} + {qb} × {y0} + {qd}',
    'Hold y fixed and take the slope in x: 2ax + by + d.',
  ),
  derive(
    'fy',
    'fy',
    ['qb', 'qc', 'qe', 'x0', 'y0'],
    '{fy} = {qb} × {x0} + 2 × {qc} × {y0} + {qe}',
    (v) => v.qb! * v.x0! + 2 * v.qc! * v.y0! + v.qe!,
    '{qb} × {x0} + 2 × {qc} × {y0} + {qe}',
    'Hold x fixed and take the slope in y: bx + 2cy + e.',
  ),
  derive(
    'grad',
    'g',
    ['fx', 'fy'],
    '{g} = √({fx}² + {fy}²)',
    (v) => Math.hypot(v.fx!, v.fy!),
    '√({fx}^2 + {fy}^2)',
    'The gradient ⟨∂f/∂x, ∂f/∂y⟩ has this length: the steepest rate uphill.',
  ),
];

const POINT_VARS = [
  ...COEFFS,
  num('x0', 'x₀', 'Point, x', -100, 100, { step: 0.5 }),
  num('y0', 'y₀', 'Point, y', -100, 100, { step: 0.5 }),
  out('z0', 'f', 'Height f(x₀, y₀)'),
  out('fx', '∂f/∂x', 'Slope in x'),
  out('fy', '∂f/∂y', 'Slope in y'),
  out('g', '|∇f|', 'Length of the gradient'),
];

const SURFACE_POINT = page({
  id: 'g.he-surfacePlot-point',
  title: 'Partial derivatives and the tangent plane',
  use: 'Use this for “f(x, y) = x² + xy + 2y². Find the gradient and the tangent plane at (1, 2).”',
  assumptions: [
    '∂f/∂x is the slope of the trace with y held fixed; ∂f/∂y holds x fixed.',
    '∇f = ⟨∂f/∂x, ∂f/∂y⟩ points uphill fastest and is square to the level curve.',
    'The tangent plane is z = f + ∂f/∂x(x − x₀) + ∂f/∂y(y − y₀).',
  ],
  variables: POINT_VARS,
  rules: pointRules,
  example: example({ qa: 1, qb: 1, qc: 2, qd: 0, qe: 0, x0: 1, y0: 2 }, pointRules),
  startWith: ['qa', 'qb', 'qc', 'qd', 'qe', 'x0', 'y0'],
  representation: {
    kind: 'surfacePlot',
    f: QUAD,
    point: { x: 'x0', y: 'y0', z: 'z0', fx: 'fx', fy: 'fy', grad: 'g' },
    tangentPlane: true,
  },
});

/** The critical point of the quadratic: 2ax + by + d = 0 and bx + 2cy + e = 0. */
const critRules: Rule[] = [
  limit(
    'not-flat',
    '4{qa}{qc} − {qb}² ≠ 0',
    (v) => Math.abs(4 * v.qa! * v.qc! - v.qb! ** 2) > 1e-12,
    'With 4ac − b² = 0 there is no single critical point.',
  ),
  derive(
    'disc',
    'D',
    ['qa', 'qb', 'qc'],
    '{D} = 4 × {qa} × {qc} − {qb}²',
    (v) => 4 * v.qa! * v.qc! - v.qb! ** 2,
    '4 × {qa} × {qc} − {qb}^2',
    'D = (∂²f/∂x²)(∂²f/∂y²) − (∂²f/∂x∂y)², and here ∂²f/∂x² = 2a, ∂²f/∂y² = 2c and ∂²f/∂x∂y = b.',
  ),
  derive(
    'crit-x',
    'xc',
    ['qb', 'qc', 'qd', 'qe', 'D'],
    '{xc} = ({qb} × {qe} − 2 × {qc} × {qd}) ÷ {D}',
    (v) => (v.qb! * v.qe! - 2 * v.qc! * v.qd!) / v.D!,
    '({qb} × {qe} − 2 × {qc} × {qd}) ÷ {D}',
    'Solve ∂f/∂x = 0 and ∂f/∂y = 0 together (Cramer’s rule).',
  ),
  derive(
    'crit-y',
    'yc',
    ['qa', 'qb', 'qd', 'qe', 'D'],
    '{yc} = ({qb} × {qd} − 2 × {qa} × {qe}) ÷ {D}',
    (v) => (v.qb! * v.qd! - 2 * v.qa! * v.qe!) / v.D!,
    '({qb} × {qd} − 2 × {qa} × {qe}) ÷ {D}',
    'The same two equations give y.',
  ),
  derive(
    'crit-z',
    'zc',
    ['qa', 'qb', 'qc', 'qd', 'qe', 'xc', 'yc'],
    '{zc} = {qa} × {xc}² + {qb} × {xc} × {yc} + {qc} × {yc}² + {qd} × {xc} + {qe} × {yc}',
    (v) => quad(v, v.xc!, v.yc!),
    '{qa} × {xc}^2 + {qb} × {xc} × {yc} + {qc} × {yc}^2 + {qd} × {xc} + {qe} × {yc}',
    'The height there: a minimum when D > 0 and a > 0, a maximum when D > 0 and a < 0, a saddle when D < 0.',
  ),
];

const extrema = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'At a critical point both partial derivatives are 0.',
      'D > 0 with ∂²f/∂x² > 0 is a minimum, with ∂²f/∂x² < 0 a maximum; D < 0 is a saddle.',
    ],
    variables: [
      ...COEFFS,
      out('D', 'D', 'Discriminant 4ac − b²'),
      out('xc', 'x', 'Critical point, x'),
      out('yc', 'y', 'Critical point, y'),
      out('zc', 'f', 'Height there'),
    ],
    rules: critRules,
    example: example(typed, critRules),
    startWith: ['qa', 'qb', 'qc', 'qd', 'qe'],
    representation: {
      kind: 'surfacePlot',
      f: QUAD,
      critical: { x: 'xc', y: 'yc', z: 'zc', D: 'D' },
    },
  });

const SURFACE_EXTREMA = extrema(
  'g.he-surfacePlot-extrema',
  'The critical point of a quadratic surface',
  'Use this for “Find and classify the critical point of f(x, y) = x² + xy + y² − 3x.”',
  { qa: 1, qb: 1, qc: 1, qd: -3, qe: 0 },
);

const SURFACE_SADDLE = extrema(
  'g.he-surfacePlot-saddle',
  'A saddle point',
  'Use this for “Classify the critical point of f(x, y) = x² + 3xy + y² − 5y.”',
  { qa: 1, qb: 3, qc: 1, qd: 0, qe: -5 },
);

/** ∬ (pxy + q) dA over [a, b] × [c, d]; the midpoint prisms add to it exactly. */
const regionRules: Rule[] = [
  limit(
    'box',
    '{ra} < {rb} and {rc} < {rd}',
    (v) => v.ra! < v.rb! && v.rc! < v.rd!,
    'Each side runs from the smaller end to the larger.',
  ),
  derive(
    'box-area',
    'dA',
    ['ra', 'rb', 'rc', 'rd', 'n'],
    '{dA} = ({rb} − {ra}) × ({rd} − {rc}) ÷ {n}²',
    (v) => ((v.rb! - v.ra!) * (v.rd! - v.rc!)) / v.n! ** 2,
    '({rb} − {ra}) × ({rd} − {rc}) ÷ {n}^2',
    'Cut each side into n equal parts: n × n boxes share the base.',
  ),
  derive(
    'prisms',
    'S',
    ['p', 'q', 'ra', 'rb', 'rc', 'rd'],
    '{S} = {p} × ({rb}² − {ra}²) ÷ 2 × ({rd}² − {rc}²) ÷ 2 + {q} × ({rb} − {ra}) × ({rd} − {rc})',
    (v) =>
      (v.p! * (v.rb! ** 2 - v.ra! ** 2) * (v.rd! ** 2 - v.rc! ** 2)) / 4 +
      v.q! * (v.rb! - v.ra!) * (v.rd! - v.rc!),
    '{p} × ({rb}^2 − {ra}^2) ÷ 2 × ({rd}^2 − {rc}^2) ÷ 2 + {q} × ({rb} − {ra}) × ({rd} − {rc})',
    'For pxy + q the middles of the boxes average exactly, so the prisms already add to the integral.',
  ),
  derive(
    'integral',
    'I',
    ['p', 'q', 'ra', 'rb', 'rc', 'rd'],
    '{I} = {p} × ({rb}² − {ra}²) × ({rd}² − {rc}²) ÷ 4 + {q} × ({rb} − {ra}) × ({rd} − {rc})',
    (v) =>
      (v.p! * (v.rb! ** 2 - v.ra! ** 2) * (v.rd! ** 2 - v.rc! ** 2)) / 4 +
      v.q! * (v.rb! - v.ra!) * (v.rd! - v.rc!),
    '{p} × ({rb}^2 − {ra}^2) × ({rd}^2 − {rc}^2) ÷ 4 + {q} × ({rb} − {ra}) × ({rd} − {rc})',
    'The inner integral in y holds x fixed; then integrate that in x (either order gives I).',
  ),
  derive(
    'average',
    'avg',
    ['I', 'ra', 'rb', 'rc', 'rd'],
    '{avg} = {I} ÷ (({rb} − {ra}) × ({rd} − {rc}))',
    (v) => v.I! / ((v.rb! - v.ra!) * (v.rd! - v.rc!)),
    '{I} ÷ (({rb} − {ra}) × ({rd} − {rc}))',
    'The average height is the volume over the base’s area.',
  ),
];

const region = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'Fubini: integrating in y first, then x, gives the same I as the other order.',
      'The inner integral holds x fixed.',
      'A prism below the floor (f < 0) counts minus.',
    ],
    variables: [
      num('p', 'p', 'xy coefficient', -20, 20, { step: 0.5 }),
      num('q', 'q', 'Constant term', -50, 50, { step: 0.5 }),
      num('ra', 'a', 'x from', -20, 20, { step: 0.5 }),
      num('rb', 'b', 'x to', -20, 20, { step: 0.5 }),
      num('rc', 'c', 'y from', -20, 20, { step: 0.5 }),
      num('rd', 'd', 'y to', -20, 20, { step: 0.5 }),
      num('n', 'n', 'Boxes a side', 1, 12, { integer: true }),
      out('dA', 'ΔA', 'Area of one box'),
      out('S', 'S', 'Sum of the prisms'),
      out('I', 'I', 'Double integral'),
      out('avg', 'f̄', 'Average height'),
    ],
    rules: regionRules,
    example: example(typed, regionRules),
    startWith: ['p', 'q', 'ra', 'rb', 'rc', 'rd', 'n'],
    representation: {
      kind: 'surfacePlot',
      f: 'p*x*y + q',
      region: { a: 'ra', b: 'rb', c: 'rc', d: 'rd', boxes: 'n', sum: 'S', value: 'I' },
    },
  });

const SURFACE_REGION = region(
  'g.he-surfacePlot-region',
  'A double integral as prisms',
  'Use this for “Evaluate ∫ from 0 to 2 ∫ from 0 to 3 of (xy + 1) dy dx.”',
  { p: 1, q: 1, ra: 0, rb: 2, rc: 0, rd: 3, n: 4 },
);

const SURFACE_REGION_SIGNED = region(
  'g.he-surfacePlot-region-signed',
  'A double integral below the floor',
  'Use this for “Evaluate ∫ from 0 to 2 ∫ from 0 to 3 of (1 − xy) dy dx.”',
  { p: -1, q: 1, ra: 0, rb: 2, rc: 0, rd: 3, n: 4 },
);

/** Dᵤf at the point toward ⟨p, q⟩, on the level-curve view. */
const directionalRules: Rule[] = [
  ...pointRules,
  limit(
    'dir',
    '⟨{up}, {uq}⟩ ≠ 0',
    (v) => Math.hypot(v.up!, v.uq!) > 0,
    'A direction needs a nonzero vector.',
  ),
  derive(
    'rate',
    'Du',
    ['fx', 'fy', 'up', 'uq'],
    '{Du} = ({fx} × {up} + {fy} × {uq}) ÷ √({up}² + {uq}²)',
    (v) => (v.fx! * v.up! + v.fy! * v.uq!) / Math.hypot(v.up!, v.uq!),
    '({fx} × {up} + {fy} × {uq}) ÷ √({up}^2 + {uq}^2)',
    'Make ⟨p, q⟩ a unit vector u, then Dᵤf = ∇f · u; it is never more than |∇f|.',
  ),
];

const SURFACE_DIRECTIONAL = page({
  id: 'g.he-surfacePlot-directional',
  title: 'A directional derivative on the level curves',
  use: 'Use this for “f(x, y) = x² + xy + 2y². How fast does f change at (1, 2) toward ⟨3, 4⟩?”',
  assumptions: [
    'u = ⟨p, q⟩ ÷ |⟨p, q⟩| is a unit vector.',
    'Dᵤf = ∇f · u, largest (|∇f|) along ∇f and 0 along the level curve.',
  ],
  variables: [
    ...POINT_VARS,
    num('up', 'p', 'Direction, x part', -100, 100, { step: 0.5 }),
    num('uq', 'q', 'Direction, y part', -100, 100, { step: 0.5 }),
    out('Du', 'Dᵤf', 'Rate toward u'),
  ],
  rules: directionalRules,
  example: example(
    { qa: 1, qb: 1, qc: 2, qd: 0, qe: 0, x0: 1, y0: 2, up: 3, uq: 4 },
    directionalRules,
  ),
  startWith: ['qa', 'qb', 'qc', 'qd', 'qe', 'x0', 'y0', 'up', 'uq'],
  representation: {
    kind: 'surfacePlot',
    f: QUAD,
    view: 'contour',
    point: { x: 'x0', y: 'y0', z: 'z0', fx: 'fx', fy: 'fy', grad: 'g' },
    direction: { x: 'up', y: 'uq', rate: 'Du' },
  },
});

/** The largest xy with px + qy = k. */
const lagrangeRules: Rule[] = [
  limit(
    'pos',
    '{lp} > 0, {lq} > 0, {lk} > 0',
    (v) => v.lp! > 0 && v.lq! > 0 && v.lk! > 0,
    'Take p, q and k positive.',
  ),
  derive(
    'lx',
    'lx',
    ['lk', 'lp'],
    '{lx} = {lk} ÷ (2 × {lp})',
    (v) => v.lk! / (2 * v.lp!),
    '{lk} ÷ (2 × {lp})',
    'y = λp and x = λq with px + qy = k put half of k on each term.',
  ),
  derive(
    'ly',
    'ly',
    ['lk', 'lq'],
    '{ly} = {lk} ÷ (2 × {lq})',
    (v) => v.lk! / (2 * v.lq!),
    '{lk} ÷ (2 × {lq})',
    'The other half of k goes to qy.',
  ),
  derive(
    'lm',
    'M',
    ['lx', 'ly'],
    '{M} = {lx} × {ly}',
    (v) => v.lx! * v.ly!,
    '{lx} × {ly}',
    'The largest product.',
  ),
  derive(
    'lam',
    'lam',
    ['lk', 'lp', 'lq'],
    '{lam} = {lk} ÷ (2 × {lp} × {lq})',
    (v) => v.lk! / (2 * v.lp! * v.lq!),
    '{lk} ÷ (2 × {lp} × {lq})',
    '∇(xy) = ⟨y, x⟩ = λ⟨p, q⟩.',
  ),
  derive(
    'lxi',
    'xi',
    ['lk', 'lp'],
    '{xi} = {lk} ÷ {lp}',
    (v) => v.lk! / v.lp!,
    '{lk} ÷ {lp}',
    'Where the line meets the x-axis.',
  ),
  derive(
    'lyi',
    'yi',
    ['lk', 'lq'],
    '{yi} = {lk} ÷ {lq}',
    (v) => v.lk! / v.lq!,
    '{lk} ÷ {lq}',
    'Where the line meets the y-axis.',
  ),
];

const SURFACE_LAGRANGE = page({
  id: 'g.he-surfacePlot-lagrange',
  title: 'Lagrange multipliers: a level curve touching a line',
  use: 'Use this for “Find the largest xy with 2x + 4y = 400.”',
  assumptions: [
    'At the best point the level curve xy = M just touches the line, so ∇(xy) = λ∇(px + qy).',
    'x and y stay positive.',
  ],
  variables: [
    num('lp', 'p', 'x coefficient', 0.1, 100, { step: 0.5 }),
    num('lq', 'q', 'y coefficient', 0.1, 100, { step: 0.5 }),
    num('lk', 'k', 'Constraint total', 0.1, 100000, { step: 1 }),
    out('lx', 'x', 'Best x'),
    out('ly', 'y', 'Best y'),
    out('M', 'xy', 'Largest product'),
    out('lam', 'λ', 'Multiplier'),
    out('xi', 'x-intercept', 'Line meets the x-axis'),
    out('yi', 'y-intercept', 'Line meets the y-axis'),
  ],
  rules: lagrangeRules,
  example: example({ lp: 2, lq: 4, lk: 400 }, lagrangeRules),
  startWith: ['lp', 'lq', 'lk'],
  representation: {
    kind: 'surfacePlot',
    f: 'x*y',
    view: 'contour',
    x: [0, 'xi'],
    y: [0, 'yi'],
    point: { x: 'lx', y: 'ly', z: 'M' },
    constraint: { p: 'lp', q: 'lq', k: 'lk' },
    fixed: true,
  },
});

export const HE3B_GALLERY_MODULES: ModuleDef[] = [
  SURFACE_POINT,
  SURFACE_EXTREMA,
  SURFACE_SADDLE,
  SURFACE_REGION,
  SURFACE_REGION_SIGNED,
  SURFACE_DIRECTIONAL,
  SURFACE_LAGRANGE,
];

export const HE3B_GALLERY_LAYOUTS: LayoutDef[] = [];
