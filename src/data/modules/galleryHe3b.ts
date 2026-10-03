/**
 * College gallery demos, round 3, group B (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example (docs/plans/he.math.md).
 * Spread into gallery.ts.
 * HC46: `surfacePlot` (calc-3#1 partials and extrema, calc-3#2 prisms, ~directional, ~lagrange).
 * HC47: `vectorDiagram` space objects (calc-3#0 plane, ~line, ~helix; calc-3#3~flux; #4~stokes).
 * HC65: `solidOfRevolution` (calc-2#2 disks, ~washer, ~shells).
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

// ── HC47: objects in space ──

const coord = (id: string, symbol: string, name: string) =>
  num(id, symbol, name, -100, 100, { step: 0.5 });

/** d = n · P₀, D = |n · Q − d| ÷ |n| and the foot F = Q − (n · Q − d) ÷ |n|² × n. */
const planeRules: Rule[] = [
  limit(
    'normal',
    '⟨{na}, {nb}, {nc}⟩ ≠ 0',
    (v) => Math.hypot(v.na!, v.nb!, v.nc!) > 0,
    'The normal must not be the zero vector.',
  ),
  derive(
    'plane-d',
    'd',
    ['na', 'nb', 'nc', 'px', 'py', 'pz'],
    '{d} = {na} × {px} + {nb} × {py} + {nc} × {pz}',
    (v) => v.na! * v.px! + v.nb! * v.py! + v.nc! * v.pz!,
    '{na} × {px} + {nb} × {py} + {nc} × {pz}',
    'Every point r of the plane has n · r = n · P₀ = d.',
  ),
  derive(
    'plane-D',
    'D',
    ['na', 'nb', 'nc', 'qx', 'qy', 'qz', 'd'],
    '{D} = |{na} × {qx} + {nb} × {qy} + {nc} × {qz} − {d}| ÷ √({na}² + {nb}² + {nc}²)',
    (v) =>
      Math.abs(v.na! * v.qx! + v.nb! * v.qy! + v.nc! * v.qz! - v.d!) /
      Math.hypot(v.na!, v.nb!, v.nc!),
    '|{na} × {qx} + {nb} × {qy} + {nc} × {qz} − {d}| ÷ √({na}^2 + {nb}^2 + {nc}^2)',
    'How far n · Q is from d, measured along the unit normal.',
  ),
  ...(['x', 'y', 'z'] as const).map((k) => {
    const nk = { x: 'na', y: 'nb', z: 'nc' }[k];
    return derive(
      `foot-${k}`,
      `f${k}`,
      ['na', 'nb', 'nc', 'qx', 'qy', 'qz', 'd'],
      `{f${k}} = {q${k}} − {${nk}} × ({na} × {qx} + {nb} × {qy} + {nc} × {qz} − {d}) ÷ ({na}² + {nb}² + {nc}²)`,
      (v) =>
        v['q' + k]! -
        (v[nk]! * (v.na! * v.qx! + v.nb! * v.qy! + v.nc! * v.qz! - v.d!)) /
          (v.na! ** 2 + v.nb! ** 2 + v.nc! ** 2),
      `{q${k}} − {${nk}} × ({na} × {qx} + {nb} × {qy} + {nc} × {qz} − {d}) ÷ ({na}^2 + {nb}^2 + {nc}^2)`,
      'Step back from Q along n by the offset over |n|².',
    );
  }),
];

const planePage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'Every vector from P₀ to a point of the plane is square to n.',
      'The distance D is measured along n, from Q to its foot F on the plane.',
    ],
    variables: [
      coord('na', 'a', 'Normal, x part'),
      coord('nb', 'b', 'Normal, y part'),
      coord('nc', 'c', 'Normal, z part'),
      coord('px', 'x₀', 'P₀, x'),
      coord('py', 'y₀', 'P₀, y'),
      coord('pz', 'z₀', 'P₀, z'),
      coord('qx', 'Q₁', 'Q, x'),
      coord('qy', 'Q₂', 'Q, y'),
      coord('qz', 'Q₃', 'Q, z'),
      out('d', 'd', 'Constant d'),
      out('D', 'D', 'Distance from Q'),
      out('fx', 'F₁', 'Foot F, x'),
      out('fy', 'F₂', 'Foot F, y'),
      out('fz', 'F₃', 'Foot F, z'),
    ],
    rules: planeRules,
    example: example(typed, planeRules),
    startWith: ['na', 'nb', 'nc', 'px', 'py', 'pz', 'qx', 'qy', 'qz'],
    representation: {
      kind: 'vectorDiagram',
      vectors: [{ name: 'n', x: 'na', y: 'nb', z: 'nc' }],
      space: {
        plane: {
          point: ['px', 'py', 'pz'],
          q: ['qx', 'qy', 'qz'],
          d: 'd',
          distance: 'D',
          foot: { x: 'fx', y: 'fy', z: 'fz' },
        },
      },
    },
  });

const SPACE_PLANE = planePage(
  'g.he-vectorDiagram-plane',
  'A plane by a point and a normal',
  'Use this for “Find the plane through (1, 0, 3) with normal ⟨2, −1, 2⟩, and the distance from (3, 1, 4).”',
  { na: 2, nb: -1, nc: 2, px: 1, py: 0, pz: 3, qx: 3, qy: 1, qz: 4 },
);

const SPACE_PLANE_UPRIGHT = planePage(
  'g.he-vectorDiagram-plane-upright',
  'An upright plane and a point below the floor',
  'Use this for “How far is (−3, −2, −4) from the plane x + y = 2?”',
  { na: 1, nb: 1, nc: 0, px: 2, py: 0, pz: 0, qx: -3, qy: -2, qz: -4 },
);

/** r(t) = P₀ + tv meets n · r = d at t = (d − n · P₀) ÷ (n · v). */
const lineRules: Rule[] = [
  limit(
    'not-parallel',
    '{ma} × {vx} + {mb} × {vy} + {mc} × {vz} ≠ 0',
    (v) => Math.abs(v.ma! * v.vx! + v.mb! * v.vy! + v.mc! * v.vz!) > 1e-12,
    'The line runs parallel to the plane: they never meet.',
  ),
  derive(
    'meet-t',
    't',
    ['ma', 'mb', 'mc', 'md', 'px', 'py', 'pz', 'vx', 'vy', 'vz'],
    '{t} = ({md} − ({ma} × {px} + {mb} × {py} + {mc} × {pz})) ÷ ({ma} × {vx} + {mb} × {vy} + {mc} × {vz})',
    (v) =>
      (v.md! - (v.ma! * v.px! + v.mb! * v.py! + v.mc! * v.pz!)) /
      (v.ma! * v.vx! + v.mb! * v.vy! + v.mc! * v.vz!),
    '({md} − ({ma} × {px} + {mb} × {py} + {mc} × {pz})) ÷ ({ma} × {vx} + {mb} × {vy} + {mc} × {vz})',
    'Put r(t) into the plane’s equation: n · P₀ + t(n · v) = d.',
  ),
  ...(['x', 'y', 'z'] as const).map((k) =>
    derive(
      `point-${k}`,
      `r${k}`,
      [`p${k}`, `v${k}`, 't'],
      `{r${k}} = {p${k}} + {t} × {v${k}}`,
      (v) => v[`p${k}`]! + v.t! * v[`v${k}`]!,
      `{p${k}} + {t} × {v${k}}`,
      'Walk t steps of v from P₀.',
    ),
  ),
];

const SPACE_LINE = page({
  id: 'g.he-vectorDiagram-line',
  title: 'Where a line meets a plane',
  use: 'Use this for “Where does the line through (1, 2, −1) along ⟨2, 0, 3⟩ meet the plane x + y + z = 10?”',
  assumptions: [
    'r(t) = P₀ + tv runs through P₀ along v; t = 0 is P₀.',
    'The line meets the plane where r(t) satisfies its equation (unless n · v = 0).',
  ],
  variables: [
    coord('px', 'x₀', 'P₀, x'),
    coord('py', 'y₀', 'P₀, y'),
    coord('pz', 'z₀', 'P₀, z'),
    coord('vx', 'v₁', 'Direction, x part'),
    coord('vy', 'v₂', 'Direction, y part'),
    coord('vz', 'v₃', 'Direction, z part'),
    coord('ma', 'a', 'Plane, x coefficient'),
    coord('mb', 'b', 'Plane, y coefficient'),
    coord('mc', 'c', 'Plane, z coefficient'),
    num('md', 'd', 'Plane, constant', -1000, 1000, { step: 0.5 }),
    out('t', 't', 'Parameter where they meet'),
    out('rx', 'x', 'Meeting point, x'),
    out('ry', 'y', 'Meeting point, y'),
    out('rz', 'z', 'Meeting point, z'),
  ],
  rules: lineRules,
  example: example(
    { px: 1, py: 2, pz: -1, vx: 2, vy: 0, vz: 3, ma: 1, mb: 1, mc: 1, md: 10 },
    lineRules,
  ),
  startWith: ['px', 'py', 'pz', 'vx', 'vy', 'vz', 'ma', 'mb', 'mc', 'md'],
  representation: {
    kind: 'vectorDiagram',
    vectors: [{ name: 'v', x: 'vx', y: 'vy', z: 'vz' }],
    space: {
      line: {
        point: ['px', 'py', 'pz'],
        t: 't',
        at: { x: 'rx', y: 'ry', z: 'rz' },
        meets: { normal: ['ma', 'mb', 'mc'], d: 'md' },
      },
    },
  },
});

/** The helix ⟨a cos t, a sin t, ct⟩: velocity, speed, length and curvature. */
const helixRules: Rule[] = [
  derive(
    'vel-x',
    'vx',
    ['ha', 't'],
    '{vx} = −{ha} × sin({t})',
    (v) => -v.ha! * Math.sin(v.t!),
    '−{ha} × sin({t})',
    'r′(t): the derivative of a cos t is −a sin t.',
  ),
  derive(
    'vel-y',
    'vy',
    ['ha', 't'],
    '{vy} = {ha} × cos({t})',
    (v) => v.ha! * Math.cos(v.t!),
    '{ha} × cos({t})',
    'The derivative of a sin t is a cos t.',
  ),
  derive(
    'vel-z',
    'vz',
    ['hc'],
    '{vz} = {hc}',
    (v) => v.hc!,
    '{hc}',
    'The height ct rises at the steady rate c.',
  ),
  derive(
    'speed',
    'sp',
    ['ha', 'hc'],
    '{sp} = √({ha}² + {hc}²)',
    (v) => Math.hypot(v.ha!, v.hc!),
    '√({ha}^2 + {hc}^2)',
    '|r′(t)|² = a²(sin² t + cos² t) + c², the same at every t.',
  ),
  derive(
    'length',
    'L',
    ['sp', 'T'],
    '{L} = {sp} × {T}',
    (v) => v.sp! * v.T!,
    '{sp} × {T}',
    'A steady speed: length is speed times the span of t.',
  ),
  derive(
    'kappa',
    'k',
    ['ha', 'hc'],
    '{k} = {ha} ÷ ({ha}² + {hc}²)',
    (v) => v.ha! / (v.ha! ** 2 + v.hc! ** 2),
    '{ha} ÷ ({ha}^2 + {hc}^2)',
    'κ = |r′ × r″| ÷ |r′|³ works out to a ÷ (a² + c²).',
  ),
];

const helixPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'r(t) = ⟨a cos t, a sin t, ct⟩ winds round the z-axis at radius a, rising 2πc each turn.',
      't is in radians; one turn is T = 2π.',
    ],
    variables: [
      num('ha', 'a', 'Radius', 0.1, 100, { step: 0.1 }),
      num('hc', 'c', 'Rise per radian', -100, 100, { step: 0.1 }),
      num('t', 't', 'Time t', 0, 100, { step: 0.1 }),
      num('T', 'T', 'Span of t', 0.1, 100, { step: 0.1 }),
      out('vx', 'v₁', 'Velocity, x part'),
      out('vy', 'v₂', 'Velocity, y part'),
      out('vz', 'v₃', 'Velocity, z part'),
      out('sp', '|v|', 'Speed'),
      out('L', 'L', 'Length over T'),
      out('k', 'κ', 'Curvature'),
    ],
    rules: helixRules,
    example: example(typed, helixRules),
    startWith: ['ha', 'hc', 't', 'T'],
    representation: {
      kind: 'vectorDiagram',
      vectors: [{ name: 'v', x: 'vx', y: 'vy', z: 'vz' }],
      space: {
        curve: {
          helix: { a: 'ha', c: 'hc' },
          t: 't',
          T: 'T',
          speed: 'sp',
          length: 'L',
          curvature: 'k',
        },
      },
    },
  });

const SPACE_HELIX = helixPage(
  'g.he-vectorDiagram-helix',
  'A helix: velocity, speed, length and curvature',
  'Use this for “For r(t) = ⟨3 cos t, 3 sin t, 4t⟩, find the speed, the length of one turn and the curvature.”',
  { ha: 3, hc: 4, t: 1, T: 2 * Math.PI },
);

const SPACE_HELIX_TIGHT = helixPage(
  'g.he-vectorDiagram-helix-tight',
  'A tightly wound helix over two turns',
  'Use this for “Find the length of r(t) = ⟨2 cos t, 2 sin t, 0.25t⟩ from t = 0 to t = 4π.”',
  { ha: 2, hc: 0.25, t: 2, T: 4 * Math.PI },
);

/** F = k⟨x, y, z⟩ out of a sphere: F · n = kR, Φ = 4πkR³. */
const fluxRules: Rule[] = [
  derive(
    'fn',
    'Fn',
    ['fk', 'R'],
    '{Fn} = {fk} × {R}',
    (v) => v.fk! * v.R!,
    '{fk} × {R}',
    'On the sphere F = kr and n = r ÷ R, so F · n = k(r · r) ÷ R = kR.',
  ),
  derive(
    'flux',
    'Phi',
    ['Fn', 'R'],
    '{Phi} = {Fn} × 4 × π × {R}²',
    (v) => v.Fn! * 4 * Math.PI * v.R! ** 2,
    '{Fn} × 4 × π × {R}^2',
    'F · n is the same everywhere, so the flux is F · n times the area 4πR².',
  ),
];

const SPACE_FLUX = page({
  id: 'g.he-vectorDiagram-flux',
  title: 'Flux out of a sphere',
  use: 'Use this for “Find the flux of F = ⟨x, y, z⟩ out of the sphere of radius 2.”',
  assumptions: [
    'The outward unit normal on a sphere about the origin is n = ⟨x, y, z⟩ ÷ R.',
    'F = k⟨x, y, z⟩ points straight out, so F · n is the same at every point.',
  ],
  variables: [
    num('fk', 'k', 'Field strength', -100, 100, { step: 0.1 }),
    num('R', 'R', 'Radius', 0.1, 100, { step: 0.1 }),
    out('Fn', 'F · n', 'Outward part of F'),
    out('Phi', 'Φ', 'Flux'),
  ],
  rules: fluxRules,
  example: example({ fk: 1, R: 2 }, fluxRules),
  startWith: ['fk', 'R'],
  representation: {
    kind: 'vectorDiagram',
    vectors: [{ name: 'F', x: 0, y: 0, z: 'Fn' }],
    space: { sphere: { r: 'R', k: 'fk', normals: true, fn: 'Fn', flux: 'Phi' } },
  },
});

/** F = k⟨−y, x, 0⟩ round a circle: curl F = ⟨0, 0, 2k⟩, ∮ F · dr = 2πkR². */
const stokesRules: Rule[] = [
  derive(
    'curl',
    'cz',
    ['sk'],
    '{cz} = 2 × {sk}',
    (v) => 2 * v.sk!,
    '2 × {sk}',
    'curl F = ⟨0, 0, ∂(kx)/∂x − ∂(−ky)/∂y⟩ = ⟨0, 0, 2k⟩.',
  ),
  derive(
    'circ',
    'C',
    ['cz', 'R'],
    '{C} = {cz} × π × {R}²',
    (v) => v.cz! * Math.PI * v.R! ** 2,
    '{cz} × π × {R}^2',
    'Stokes’: the flux of a steady curl through the flat disk is curl times its area πR².',
  ),
];

const SPACE_STOKES = page({
  id: 'g.he-vectorDiagram-stokes',
  title: 'Stokes’ theorem round a circle',
  use: 'Use this for “Use Stokes’ theorem to find the circulation of F = ⟨−y, x, 0⟩ round the circle x² + y² = 9, z = 0.”',
  assumptions: [
    'The circle runs counterclockwise seen from above, so the caps’ normals point up.',
    'Any surface with this circle as its edge, a disk or a dome, gets the same flux of curl F.',
  ],
  variables: [
    num('sk', 'k', 'Field strength', -100, 100, { step: 0.1 }),
    num('R', 'R', 'Radius', 0.1, 100, { step: 0.1 }),
    out('cz', '2k', 'curl F, z part'),
    out('C', '∮ F · dr', 'Circulation'),
  ],
  rules: stokesRules,
  example: example({ sk: 1, R: 3 }, stokesRules),
  startWith: ['sk', 'R'],
  representation: {
    kind: 'vectorDiagram',
    vectors: [{ name: 'curl F', x: 0, y: 0, z: 'cz' }],
    space: { circle: { r: 'R', k: 'sk', cap: 'both', circulation: 'C' } },
  },
});

// ── HC65: solids of revolution ──

/** Disks for y = c·xᵐ about the x-axis on [0, b]: V = πc²b^(2m + 1) ÷ (2m + 1). */
const diskRules: Rule[] = [
  limit('slice-on', '{xs} ≤ {b}', (v) => v.xs! <= v.b!, 'Put the slice between 0 and b.'),
  derive(
    'disk-r',
    'r',
    ['c', 'xs', 'm'],
    '{r} = {c} × {xs}^{m}',
    (v) => v.c! * v.xs! ** v.m!,
    '{c} × {xs}^{m}',
    'The slice at x is a disk whose radius is the curve’s height f(x).',
  ),
  derive(
    'disk-V',
    'V',
    ['c', 'b', 'm'],
    '{V} = π × {c}² × {b}^(2 × {m} + 1) ÷ (2 × {m} + 1)',
    (v) => (Math.PI * v.c! ** 2 * v.b! ** (2 * v.m! + 1)) / (2 * v.m! + 1),
    'π × {c}^2 × {b}^(2 × {m} + 1) ÷ (2 × {m} + 1)',
    'V = ∫ π f(x)² dx = ∫ πc²x^(2m) dx from 0 to b.',
  ),
];

const diskPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'A slice at x, dx thick, is a disk of radius f(x), so its volume is π f(x)² dx.',
      'With m = 1 the solid is a cone, V = πr²h ÷ 3.',
    ],
    variables: [
      num('c', 'c', 'Coefficient', 0.1, 10, { step: 0.1 }),
      num('m', 'm', 'Power', 0.5, 3, { step: 0.5 }),
      num('b', 'b', 'Right end', 0.1, 20, { step: 0.5 }),
      num('xs', 'x', 'Slice at', 0, 20, { step: 0.1 }),
      out('r', 'r', 'Slice radius'),
      out('V', 'V', 'Volume'),
    ],
    rules: diskRules,
    example: example(typed, diskRules),
    startWith: ['c', 'm', 'b', 'xs'],
    representation: {
      kind: 'solidOfRevolution',
      f: 'c*x^m',
      from: 0,
      to: 'b',
      axis: 'x',
      method: 'disk',
      at: 'xs',
      volume: 'V',
      radius: 'r',
    },
  });

const SOLID_DISK = diskPage(
  'g.he-solidOfRevolution-disk',
  'Volume by disks',
  'Use this for “The region under y = √x from 0 to 4 is turned about the x-axis. Find the volume.”',
  { c: 1, m: 0.5, b: 4, xs: 2 },
);

const SOLID_CONE = diskPage(
  'g.he-solidOfRevolution-cone',
  'A cone by disks',
  'Use this for “Turn the region under y = 0.5x from 0 to 6 about the x-axis. Check the cone’s volume.”',
  { c: 0.5, m: 1, b: 6, xs: 4 },
);

/** Washers between y = kx and y = x² about the x-axis: V = 2πk⁵ ÷ 15. */
const washerRules: Rule[] = [
  limit(
    'slice-on',
    '{xs} ≤ {k}',
    (v) => v.xs! <= v.k!,
    'Put the slice between 0 and k, where the curves meet.',
  ),
  derive(
    'outer',
    'R',
    ['k', 'xs'],
    '{R} = {k} × {xs}',
    (v) => v.k! * v.xs!,
    '{k} × {xs}',
    'The line is the outer edge: R = kx.',
  ),
  derive(
    'inner',
    'r',
    ['xs'],
    '{r} = {xs}²',
    (v) => v.xs! ** 2,
    '{xs}^2',
    'The parabola is the hole’s edge: r = x².',
  ),
  derive(
    'washer-V',
    'V',
    ['k'],
    '{V} = 2 × π × {k}^5 ÷ 15',
    (v) => (2 * Math.PI * v.k! ** 5) / 15,
    '2 × π × {k}^5 ÷ 15',
    'V = ∫ π(k²x² − x⁴) dx from 0 to k = π(k⁵ ÷ 3 − k⁵ ÷ 5).',
  ),
];

const washerPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'y = kx and y = x² meet at x = 0 and x = k; the line is on top between them.',
      'A slice is a washer: a disk of radius R with a hole of radius r, area π(R² − r²).',
    ],
    variables: [
      num('k', 'k', 'Slope of the line', 0.1, 5, { step: 0.1 }),
      num('xs', 'x', 'Slice at', 0, 5, { step: 0.05 }),
      out('R', 'R', 'Outer radius'),
      out('r', 'r', 'Inner radius'),
      out('V', 'V', 'Volume'),
    ],
    rules: washerRules,
    example: example(typed, washerRules),
    startWith: ['k', 'xs'],
    representation: {
      kind: 'solidOfRevolution',
      f: 'k*x',
      g: 'x^2',
      from: 0,
      to: 'k',
      axis: 'x',
      method: 'washer',
      at: 'xs',
      volume: 'V',
      radius: 'R',
      inner: 'r',
    },
  });

const SOLID_WASHER = washerPage(
  'g.he-solidOfRevolution-washer',
  'Volume by washers',
  'Use this for “The region between y = 2x and y = x² is turned about the x-axis. Find the volume.”',
  { k: 2, xs: 1 },
);

const SOLID_WASHER_THIN = washerPage(
  'g.he-solidOfRevolution-washer-thin',
  'A thin washer solid',
  'Use this for “Turn the region between y = x and y = x² about the x-axis. Find the volume.”',
  { k: 1, xs: 0.5 },
);

/** Shells for y = x(c − x) about the y-axis: V = πc⁴ ÷ 6. */
const shellRules: Rule[] = [
  limit('slice-on', '{xs} ≤ {c}', (v) => v.xs! <= v.c!, 'Put the shell between 0 and c.'),
  derive(
    'shell-h',
    'h',
    ['xs', 'c'],
    '{h} = {xs} × ({c} − {xs})',
    (v) => v.xs! * (v.c! - v.xs!),
    '{xs} × ({c} − {xs})',
    'The shell at radius x is as tall as the curve there.',
  ),
  derive(
    'shell-V',
    'V',
    ['c'],
    '{V} = π × {c}^4 ÷ 6',
    (v) => (Math.PI * v.c! ** 4) / 6,
    'π × {c}^4 ÷ 6',
    'V = ∫ 2πx · x(c − x) dx from 0 to c = 2π(c⁴ ÷ 3 − c⁴ ÷ 4).',
  ),
];

const SOLID_SHELLS = page({
  id: 'g.he-solidOfRevolution-shells',
  title: 'Volume by cylindrical shells',
  use: 'Use this for “The region under y = x(2 − x) is turned about the y-axis. Find the volume by shells.”',
  assumptions: [
    'A strip at x, dx wide, turns into a shell of radius x and height f(x).',
    'Unrolled, the shell is a sheet 2πx long and f(x) tall, so its volume is 2πx f(x) dx.',
  ],
  variables: [
    num('c', 'c', 'Where the arch lands', 0.1, 10, { step: 0.1 }),
    num('xs', 'x', 'Shell radius', 0, 10, { step: 0.05 }),
    out('h', 'h', 'Shell height'),
    out('V', 'V', 'Volume'),
  ],
  rules: shellRules,
  example: example({ c: 2, xs: 1 }, shellRules),
  startWith: ['c', 'xs'],
  representation: {
    kind: 'solidOfRevolution',
    f: 'x*(c - x)',
    from: 0,
    to: 'c',
    axis: 'y',
    method: 'shell',
    at: 'xs',
    volume: 'V',
    height: 'h',
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
  SPACE_PLANE,
  SPACE_PLANE_UPRIGHT,
  SPACE_LINE,
  SPACE_HELIX,
  SPACE_HELIX_TIGHT,
  SPACE_FLUX,
  SPACE_STOKES,
  SOLID_DISK,
  SOLID_CONE,
  SOLID_WASHER,
  SOLID_WASHER_THIN,
  SOLID_SHELLS,
];

export const HE3B_GALLERY_LAYOUTS: LayoutDef[] = [];
