/**
 * College gallery demos, round 1, group A (docs/RENDERINGS_HE.md): HC1 `beam`. Each stands in
 * for the college page that waits, built from the plan's worked example
 * (docs/plans/he.mechanical.md, he.aero-civil-chemical.md). Spread into gallery.ts.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, Representation } from './types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Steps = ModuleDef['steps'][string];

/** A variable: id, symbol, name, unit and range (min 0 unless given). */
const val = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...(unit ? { unit } : {}), min: 0, max, ...more });

/** A factor of a product: a variable id (or a constant: '2', '3', 'π²') to a power. */
type Factor = [string, number];

const SUP: Record<number, string> = { 2: '²', 3: '³', 4: '⁴' };
const ROOT: Record<number, string> = { 2: '√', 3: '∛', 4: '∜' };
const CONST: Record<string, number> = { 'π²': Math.PI ** 2, π: Math.PI };
const isVar = (t: string) => !(t in CONST) && Number.isNaN(Number(t));
const constOf = (t: string) => CONST[t] ?? Number(t);
const term = ([t, p]: Factor) => {
  const base = isVar(t) ? `{${t}}` : t;
  return p === 1 ? base : `${base}${SUP[p] ?? `^${p}`}`;
};
const product = (fs: Factor[]) => (fs.length ? fs.map(term).join(' × ') : '1');
const grouped = (fs: Factor[]) => (fs.length > 1 ? `(${product(fs)})` : product(fs));
const ratio = (num: Factor[], den: Factor[]) =>
  den.length ? `${product(num)} ÷ ${grouped(den)}` : product(num);
const valueOf = (fs: Factor[], x: Values) =>
  fs.reduce((t, [k, p]) => t * (isVar(k) ? x[k]! : constOf(k)) ** p, 1);

/**
 * A relation y = (num) ÷ (den), each a product of factors: its residual, a solve for every
 * variable, and step text for each (`how` for y; the others say what moves across).
 */
function monomial(
  id: string,
  y: string,
  num: Factor[],
  den: Factor[],
  how: string,
  symbols: Record<string, string>,
): { relation: Relation; steps: Steps } {
  const vars = [y, ...[...num, ...den].filter(([t]) => isVar(t)).map(([t]) => t)];
  const rhs = (x: Values) => {
    const d = valueOf(den, x);
    return d === 0 ? undefined : valueOf(num, x) / d;
  };
  const solve: NonNullable<Relation['solve']> = { [y]: (x) => rhs(x) };
  const steps: Steps = { [y]: { expr: ratio(num, den), how } };
  for (const [t, p] of [
    ...num.map((f) => [...f, 1] as const),
    ...den.map((f) => [...f, -1] as const),
  ]
    .filter(([t]) => isVar(t))
    .map(([t, p, side]) => [t, p * side] as const)) {
    const inNum = p > 0;
    const others = (fs: Factor[]) => fs.filter(([k]) => k !== t);
    // t^|p| = y × den ÷ num (t in the numerator), or num ÷ (y × den) (t in the denominator).
    const top: Factor[] = inNum ? [[y, 1], ...others(den)] : others(num);
    const bottom: Factor[] = inNum ? others(num) : [[y, 1], ...others(den)];
    const k = Math.abs(p);
    const inner = ratio(top, bottom);
    solve[t] = (x) => {
      const b = valueOf(bottom, x);
      if (b === 0) return undefined;
      const r = valueOf(top, x) / b;
      return k === 1 ? r : r < 0 ? undefined : r ** (1 / k);
    };
    const sym = symbols[t] ?? t;
    steps[t] = {
      expr: k === 1 ? inner : `${ROOT[k]}(${inner})`,
      how:
        k === 1
          ? `Solve for ${sym}: multiply and divide both sides so only ${sym} is left on one side.`
          : `Get ${sym}${SUP[k]} alone on one side, then take the ${k === 2 ? 'square' : k === 3 ? 'cube' : 'fourth'} root.`,
    };
  }
  const residual = (x: Values) => {
    const r = rhs(x);
    return r === undefined ? NaN : x[y]! - r;
  };
  const display = `{${y}} = ${ratio(num, den)}`;
  return { relation: { id, display, vars, residual, solve }, steps };
}

/** A relation written out by hand (sums, differences). */
function rel(
  id: string,
  display: string,
  vars: string[],
  residual: (x: Values) => number,
  parts: Record<string, [(x: Values) => number | undefined, string, string]>,
): { relation: Relation; steps: Steps } {
  const solve: NonNullable<Relation['solve']> = {};
  const steps: Steps = {};
  for (const [v, [fn, expr, how]] of Object.entries(parts)) {
    solve[v] = fn;
    steps[v] = { expr, how };
  }
  return { relation: { id, display, vars, residual, solve }, steps };
}

/** A limit, not a formula: `a` is at most `b` (a section on the span). */
const atMost = (a: string, b: string, display: string, why: string) => ({
  relation: {
    id: `${a} ≤ ${b}`,
    constraint: true,
    display,
    vars: [a, b],
    residual: (x: Values) => (x[a]! <= x[b]! * (1 + 1e-9) ? 0 : 1),
    solve: {},
    message: () => why,
  } as Relation,
  steps: {} as Steps,
});

/** A demo module from its variables and relations. */
function demo(
  id: string,
  title: string,
  m: {
    use: string;
    assumptions: string[];
    variables: VariableDef[];
    relations: { relation: Relation; steps: Steps }[];
    example: Values;
    startWith: string[];
    representation: Representation;
  },
): ModuleDef {
  return {
    id,
    title,
    use: m.use,
    assumptions: m.assumptions,
    variables: m.variables,
    relations: m.relations.map((r) => r.relation),
    steps: Object.fromEntries(m.relations.map((r) => [r.relation.id, r.steps])),
    example: m.example,
    startWith: m.startWith,
    representation: m.representation,
  };
}

const symbolsOf = (vs: VariableDef[]) => Object.fromEntries(vs.map((v) => [v.id, v.symbol]));

// ─── HC1 beam: a point load on a simple span (structural-analysis#0) ─────────

const POINT_VARS: VariableDef[] = [
  val('L', 'L', 'Span', 'm', 100, { min: 0.1 }),
  val('P', 'P', 'Point load', 'kN', 10000),
  val('a', 'a', 'Load from A', 'm', 100),
  val('b', 'b', 'Load from B', 'm', 100),
  val('RA', 'R_A', 'Reaction at A', 'kN', 10000),
  val('RB', 'R_B', 'Reaction at B', 'kN', 10000),
  val('Mmax', 'M_max', 'Largest moment', 'kN·m', 1e6),
];

function pointSpan(id: string, title: string, use: string, L: number, P: number, a: number) {
  const s = symbolsOf(POINT_VARS);
  const b = L - a;
  return demo(id, title, {
    use,
    assumptions: [
      'Simply supported: a pin at A and a roller at B; the beam’s own weight is ignored.',
      'Reactions + up; the moment peaks under the load.',
    ],
    variables: POINT_VARS,
    relations: [
      rel('b = L − a', '{b} = {L} − {a}', ['b', 'L', 'a'], (x) => x.b! - (x.L! - x.a!), {
        b: [
          (x) => x.L! - x.a!,
          '{L} − {a}',
          'The load’s distance from B is what is left of the span.',
        ],
        L: [(x) => x.a! + x.b!, '{a} + {b}', 'The span is the two distances added.'],
        a: [(x) => x.L! - x.b!, '{L} − {b}', 'Take the distance from B off the span.'],
      }),
      monomial(
        'R_A = Pb ÷ L',
        'RA',
        [
          ['P', 1],
          ['b', 1],
        ],
        [['L', 1]],
        'Take moments about B: R_A × L = P × b, so divide P × b by L.',
        s,
      ),
      monomial(
        'R_B = Pa ÷ L',
        'RB',
        [
          ['P', 1],
          ['a', 1],
        ],
        [['L', 1]],
        'Take moments about A: R_B × L = P × a, so divide P × a by L.',
        s,
      ),
      monomial(
        'M_max = Pab ÷ L',
        'Mmax',
        [
          ['P', 1],
          ['a', 1],
          ['b', 1],
        ],
        [['L', 1]],
        'Under the load, M = R_A × a = Pb ÷ L × a.',
        s,
      ),
    ],
    example: { L, P, a, b, RA: (P * b) / L, RB: (P * a) / L, Mmax: (P * a * b) / L },
    startWith: ['L', 'P', 'a'],
    representation: {
      kind: 'beam',
      length: 'L',
      supports: [
        { at: 0, kind: 'pin', reaction: 'RA' },
        { at: 'L', kind: 'roller', reaction: 'RB' },
      ],
      loads: [{ kind: 'point', at: 'a', size: 'P', rest: 'b' }],
      maxMoment: 'Mmax',
      diagrams: true,
    },
  });
}

const point = pointSpan(
  'g.he-beam-point',
  'A point load on a simple span: reactions, shear and moment',
  'Use this for “An 8 m beam carries 40 kN 3 m from A. Find the reactions and the largest moment.”',
  8,
  40,
  3,
);

const pointEdge = pointSpan(
  'g.he-beam-point-edge',
  'A point load near a support: most of it goes straight down to A',
  'Use this for “A 40 kN load stands 0.5 m from A on an 8 m span. How much does each support carry?”',
  8,
  40,
  0.5,
);

// ─── HC1 beam: uniform load, V and M at x (mechanics-of-materials#3~diagrams) ─

const UDL_VARS: VariableDef[] = [
  val('w', 'w', 'Uniform load', 'kN/m', 1000),
  val('L', 'L', 'Span', 'm', 100, { min: 0.1 }),
  val('x', 'x', 'Section from A', 'm', 100),
  val('R', 'R', 'Each reaction', 'kN', 1e5),
  val('V', 'V', 'Shear at x', 'kN', 1e5, { min: -1e5 }),
  val('M', 'M', 'Moment at x', 'kN·m', 1e6, { min: -1e6 }),
  val('Mmax', 'M_max', 'Largest moment', 'kN·m', 1e6),
];

const udl = (() => {
  const s = symbolsOf(UDL_VARS);
  const [w, L, x] = [10, 6, 2];
  return demo('g.he-beam-udl-diagrams', 'Shear and moment diagrams of a uniform load', {
    use: 'Use this for “A 6 m simply supported beam carries 10 kN/m. Find V and M 2 m from A, and the largest M.”',
    assumptions: [
      'Simply supported; w covers the whole span.',
      'V and M by the smile convention: M > 0 sags.',
    ],
    variables: UDL_VARS,
    relations: [
      monomial(
        'R = wL ÷ 2',
        'R',
        [
          ['w', 1],
          ['L', 1],
        ],
        [['2', 1]],
        'The load wL is shared equally by the two supports.',
        s,
      ),
      rel(
        'V = w(L ÷ 2 − x)',
        '{V} = {w} × ({L} ÷ 2 − {x})',
        ['V', 'w', 'L', 'x'],
        (q) => q.V! - q.w! * (q.L! / 2 - q.x!),
        {
          V: [
            (q) => q.w! * (q.L! / 2 - q.x!),
            '{w} × ({L} ÷ 2 − {x})',
            'Left of the cut: R up, w × x down, so V = wL ÷ 2 − wx.',
          ],
          x: [
            (q) => (q.w === 0 ? undefined : q.L! / 2 - q.V! / q.w!),
            '{L} ÷ 2 − {V} ÷ {w}',
            'Divide V by w, then take it from half the span.',
          ],
          w: [
            (q) => (q.L! / 2 - q.x! === 0 ? undefined : q.V! / (q.L! / 2 - q.x!)),
            '{V} ÷ ({L} ÷ 2 − {x})',
            'Divide V by the distance from x to midspan.',
          ],
          L: [
            (q) => (q.w === 0 ? undefined : 2 * (q.V! / q.w! + q.x!)),
            '2 × ({V} ÷ {w} + {x})',
            'Divide V by w, add x, then double it.',
          ],
        },
      ),
      rel(
        'M = wx(L − x) ÷ 2',
        '{M} = {w} × {x} × ({L} − {x}) ÷ 2',
        ['M', 'w', 'x', 'L'],
        (q) => q.M! - (q.w! * q.x! * (q.L! - q.x!)) / 2,
        {
          M: [
            (q) => (q.w! * q.x! * (q.L! - q.x!)) / 2,
            '{w} × {x} × ({L} − {x}) ÷ 2',
            'Moments left of the cut: R × x − wx × x ÷ 2 = wx(L − x) ÷ 2.',
          ],
          w: [
            (q) => (q.x! * (q.L! - q.x!) === 0 ? undefined : (2 * q.M!) / (q.x! * (q.L! - q.x!))),
            '2 × {M} ÷ ({x} × ({L} − {x}))',
            'Double M, then divide by x(L − x).',
          ],
          L: [
            (q) => (q.w! * q.x! === 0 ? undefined : (2 * q.M!) / (q.w! * q.x!) + q.x!),
            '2 × {M} ÷ ({w} × {x}) + {x}',
            'Double M, divide by wx, then add x.',
          ],
        },
      ),
      monomial(
        'M_max = wL² ÷ 8',
        'Mmax',
        [
          ['w', 1],
          ['L', 2],
        ],
        [['8', 1]],
        'At midspan V = 0, and M = R × L ÷ 2 − w(L ÷ 2)² ÷ 2 = wL² ÷ 8.',
        s,
      ),
      atMost('x', 'L', '{x} is at most {L}', 'The section is on the beam: x is at most the span.'),
    ],
    example: {
      w,
      L,
      x,
      R: (w * L) / 2,
      V: w * (L / 2 - x),
      M: (w * x * (L - x)) / 2,
      Mmax: (w * L * L) / 8,
    },
    startWith: ['w', 'L', 'x'],
    representation: {
      kind: 'beam',
      length: 'L',
      supports: [
        { at: 0, kind: 'pin', reaction: 'R' },
        { at: 'L', kind: 'roller', reaction: 'R' },
      ],
      loads: [{ kind: 'uniform', size: 'w' }],
      at: 'x',
      shear: 'V',
      moment: 'M',
      maxMoment: 'Mmax',
      diagrams: true,
    },
  });
})();

// ─── HC1 beam: a cantilever, point and uniform load (structural-analysis#0~cantilever) ─

const cantilever = (() => {
  const vars: VariableDef[] = [
    val('P', 'P', 'Tip load', 'kN', 1e4),
    val('w', 'w', 'Uniform load', 'kN/m', 1000),
    val('L', 'L', 'Length', 'm', 100, { min: 0.1 }),
    val('V', 'V', 'Shear at the wall', 'kN', 1e6),
    val('M', 'M', 'Moment at the wall', 'kN·m', 1e7),
  ];
  const [P, w, L] = [10, 4, 3];
  return demo('g.he-beam-cantilever', 'A cantilever: the wall’s reaction and moment', {
    use: 'Use this for “A 3 m cantilever carries 10 kN at its tip and 4 kN/m along it. Find the shear and moment at the wall.”',
    assumptions: [
      'Fixed at the wall A, free at the tip; the beam’s weight is in w.',
      'Every load pushes down.',
    ],
    variables: vars,
    relations: [
      rel(
        'V = P + wL',
        '{V} = {P} + {w} × {L}',
        ['V', 'P', 'w', 'L'],
        (q) => q.V! - q.P! - q.w! * q.L!,
        {
          V: [
            (q) => q.P! + q.w! * q.L!,
            '{P} + {w} × {L}',
            'The wall holds up every load: P and the whole wL.',
          ],
          P: [(q) => q.V! - q.w! * q.L!, '{V} − {w} × {L}', 'Take wL off the wall’s shear.'],
          w: [
            (q) => (q.L === 0 ? undefined : (q.V! - q.P!) / q.L!),
            '({V} − {P}) ÷ {L}',
            'Take P off, then divide by L.',
          ],
          L: [
            (q) => (q.w === 0 ? undefined : (q.V! - q.P!) / q.w!),
            '({V} − {P}) ÷ {w}',
            'Take P off, then divide by w.',
          ],
        },
      ),
      rel(
        'M = PL + wL² ÷ 2',
        '{M} = {P} × {L} + {w} × {L}² ÷ 2',
        ['M', 'P', 'L', 'w'],
        (q) => q.M! - q.P! * q.L! - (q.w! * q.L! ** 2) / 2,
        {
          M: [
            (q) => q.P! * q.L! + (q.w! * q.L! ** 2) / 2,
            '{P} × {L} + {w} × {L}² ÷ 2',
            'Moments about the wall: P at arm L, and wL at arm L ÷ 2.',
          ],
          P: [
            (q) => (q.L === 0 ? undefined : (q.M! - (q.w! * q.L! ** 2) / 2) / q.L!),
            '({M} − {w} × {L}² ÷ 2) ÷ {L}',
            'Take the uniform load’s moment off, then divide by L.',
          ],
          w: [
            (q) => (q.L === 0 ? undefined : (2 * (q.M! - q.P! * q.L!)) / q.L! ** 2),
            '2 × ({M} − {P} × {L}) ÷ {L}²',
            'Take PL off, double it, then divide by L².',
          ],
        },
      ),
    ],
    example: { P, w, L, V: P + w * L, M: P * L + (w * L * L) / 2 },
    startWith: ['P', 'w', 'L'],
    representation: {
      kind: 'beam',
      length: 'L',
      supports: [{ at: 0, kind: 'fixed', reaction: 'V', moment: 'M' }],
      loads: [
        { kind: 'uniform', size: 'w' },
        { kind: 'point', at: 'L', size: 'P' },
      ],
      diagrams: true,
    },
  });
})();

// ─── HC1 beam: a triangular load and its resultant (statics#2~distributed) ───

const triangle = (() => {
  const vars: VariableDef[] = [
    val('w0', 'w₀', 'Peak load', 'kN/m', 1000),
    val('L', 'L', 'Length', 'm', 100, { min: 0.1 }),
    val('F', 'F_R', 'Resultant', 'kN', 1e5),
    val('xb', 'x̄', 'Resultant from the high end', 'm', 100),
  ];
  const s = symbolsOf(vars);
  const [w0, L] = [6, 4.5];
  return demo('g.he-beam-triangle', 'A triangular load and its resultant', {
    use: 'Use this for “A load rises from 0 to 6 kN/m over 4.5 m. Find its resultant and where it acts.”',
    assumptions: [
      'The load falls in a straight line from w₀ at A to 0 at B.',
      'The resultant acts at the triangle’s centroid.',
    ],
    variables: vars,
    relations: [
      monomial(
        'F_R = w₀L ÷ 2',
        'F',
        [
          ['w0', 1],
          ['L', 1],
        ],
        [['2', 1]],
        'The resultant is the triangle’s area: half the base times the height.',
        s,
      ),
      monomial(
        'x̄ = L ÷ 3',
        'xb',
        [['L', 1]],
        [['3', 1]],
        'A triangle’s centroid is a third of the way from its tall side.',
        s,
      ),
    ],
    example: { w0, L, F: (w0 * L) / 2, xb: L / 3 },
    startWith: ['w0', 'L'],
    representation: {
      kind: 'beam',
      length: 'L',
      supports: [
        { at: 0, kind: 'pin' },
        { at: 'L', kind: 'roller' },
      ],
      loads: [{ kind: 'triangle', size: 'w0', peak: 'from' }],
      resultant: { size: 'F', at: 'xb' },
    },
  });
})();

// ─── HC1 beam: a propped cantilever and its bent shape (structural-analysis#2) ─

const propped = (() => {
  const vars: VariableDef[] = [
    val('w', 'w', 'Uniform load', 'kN/m', 1000),
    val('L', 'L', 'Span', 'm', 100, { min: 0.1 }),
    val('RB', 'R_B', 'Prop reaction', 'kN', 1e5),
    val('RA', 'R_A', 'Wall reaction', 'kN', 1e5),
    val('MA', 'M_A', 'Wall moment', 'kN·m', 1e7),
  ];
  const s = symbolsOf(vars);
  const [w, L] = [20, 6];
  return demo('g.he-beam-propped', 'A propped cantilever: reactions and the bent shape', {
    use: 'Use this for “A 6 m beam, fixed at A and propped at B, carries 20 kN/m. Find the reactions and the wall moment.”',
    assumptions: [
      'Fixed at A, a roller at B; EI is the same along the beam.',
      'The prop’s lift cancels the load’s sag at B: wL⁴ ÷ (8EI) = R_BL³ ÷ (3EI).',
    ],
    variables: vars,
    relations: [
      monomial(
        'R_B = 3wL ÷ 8',
        'RB',
        [
          ['3', 1],
          ['w', 1],
          ['L', 1],
        ],
        [['8', 1]],
        'From wL⁴ ÷ (8EI) = R_BL³ ÷ (3EI): divide both sides by L³ ÷ (3EI).',
        s,
      ),
      monomial(
        'R_A = 5wL ÷ 8',
        'RA',
        [
          ['5', 1],
          ['w', 1],
          ['L', 1],
        ],
        [['8', 1]],
        'The supports carry wL together: R_A = wL − 3wL ÷ 8.',
        s,
      ),
      monomial(
        'M_A = wL² ÷ 8',
        'MA',
        [
          ['w', 1],
          ['L', 2],
        ],
        [['8', 1]],
        'Moments about A: M_A = wL × L ÷ 2 − R_B × L = wL² ÷ 8.',
        s,
      ),
    ],
    example: { w, L, RB: (3 * w * L) / 8, RA: (5 * w * L) / 8, MA: (w * L * L) / 8 },
    startWith: ['w', 'L'],
    representation: {
      kind: 'beam',
      length: 'L',
      supports: [
        { at: 0, kind: 'fixed', reaction: 'RA', moment: 'MA' },
        { at: 'L', kind: 'roller', reaction: 'RB' },
      ],
      loads: [{ kind: 'uniform', size: 'w' }],
      deflection: true,
    },
  });
})();

// ─── HC1 beam: a fixed–fixed span, its end moments (structural-analysis#2~fixed-end) ─

const fixedFixed = (() => {
  const vars: VariableDef[] = [
    val('P', 'P', 'Load at midspan', 'kN', 1e4),
    val('L', 'L', 'Span', 'm', 100, { min: 0.1 }),
    val('a', 'a', 'Load from A', 'm', 50, { derived: true }),
    val('M', 'FEM', 'Fixed-end moment', 'kN·m', 1e6),
  ];
  const s = symbolsOf(vars);
  const [P, L] = [30, 6];
  return demo('g.he-beam-fixed-fixed', 'A fixed–fixed span: the fixed-end moments', {
    use: 'Use this for “A 6 m beam fixed at both ends carries 30 kN at midspan. Find the fixed-end moments.”',
    assumptions: ['Both ends fixed; EI the same along the span.', 'The load stands at midspan.'],
    variables: vars,
    relations: [
      monomial(
        'a = L ÷ 2',
        'a',
        [['L', 1]],
        [['2', 1]],
        'The load stands at midspan, half the span from A.',
        s,
      ),
      monomial(
        'FEM = PL ÷ 8',
        'M',
        [
          ['P', 1],
          ['L', 1],
        ],
        [['8', 1]],
        'For a load at midspan, each wall holds PL ÷ 8 (from the slope at each wall staying 0).',
        s,
      ),
    ],
    example: { P, L, a: L / 2, M: (P * L) / 8 },
    startWith: ['P', 'L'],
    representation: {
      kind: 'beam',
      length: 'L',
      supports: [
        { at: 0, kind: 'fixed', moment: 'M' },
        { at: 'L', kind: 'fixed', moment: 'M' },
      ],
      loads: [{ kind: 'point', at: 'a', size: 'P' }],
      diagrams: true,
      deflection: true,
      fixed: true,
    },
  });
})();

// ─── HC1 beam: a cantilever's tip deflection and slope (mechanics-of-materials#4) ─

const deflection = (() => {
  const vars: VariableDef[] = [
    val('P', 'P', 'Tip load', 'N', 1e8, { min: 1 }),
    val('L', 'L', 'Length', 'mm', 1e5, { min: 1 }),
    val('E', 'E', 'Modulus', 'MPa', 1e6, { min: 1 }),
    val('I', 'I', 'Second moment of area', 'mm⁴', 1e12, { min: 1, scientific: true }),
    val('d', 'δ_max', 'Tip deflection', 'mm', 1e6),
    val('th', 'θ_max', 'Tip slope', 'rad', 10),
  ];
  const s = symbolsOf(vars);
  const [P, L, E, I] = [5000, 2000, 200000, 8e6];
  return demo('g.he-beam-deflection', 'A cantilever bends: tip deflection and slope', {
    use: 'Use this for “A 2 m steel cantilever (I = 8 × 10⁶ mm⁴) carries 5 kN at its tip. How far does the tip drop, and at what slope?”',
    assumptions: [
      'Linear elastic, small deflections; N, mm and MPa throughout.',
      'Fixed at the wall, the load at the free tip.',
    ],
    variables: vars,
    relations: [
      monomial(
        'δ = PL³ ÷ (3EI)',
        'd',
        [
          ['P', 1],
          ['L', 3],
        ],
        [
          ['3', 1],
          ['E', 1],
          ['I', 1],
        ],
        'Integrate EIy″ = M(x) twice with y = 0 and y′ = 0 at the wall; at the tip y = PL³ ÷ (3EI).',
        s,
      ),
      monomial(
        'θ = PL² ÷ (2EI)',
        'th',
        [
          ['P', 1],
          ['L', 2],
        ],
        [
          ['2', 1],
          ['E', 1],
          ['I', 1],
        ],
        'Integrate EIy″ = M(x) once with y′ = 0 at the wall; at the tip y′ = PL² ÷ (2EI).',
        s,
      ),
    ],
    example: { P, L, E, I, d: (P * L ** 3) / (3 * E * I), th: (P * L ** 2) / (2 * E * I) },
    startWith: ['P', 'L', 'E', 'I'],
    representation: {
      kind: 'beam',
      length: 'L',
      units: { force: 'N', length: 'mm' },
      supports: [{ at: 0, kind: 'fixed' }],
      loads: [{ kind: 'point', at: 'L', size: 'P' }],
      deflection: 'd',
      slope: 'th',
    },
  });
})();

// ─── HC1 beam: a slab strip on its supports (concrete-design#3~slab-thickness) ─

const slab = (() => {
  const vars: VariableDef[] = [
    val('l', 'ℓ', 'Span', 'ft', 100, { min: 1 }),
    {
      ...val('n', 'n', 'Support case n (ℓ ÷ n)', undefined, 28, { min: 10 }),
      allowed: [20, 24, 28, 10],
    },
    val('h', 'h_min', 'Least slab thickness', 'in', 100),
  ];
  const s = symbolsOf(vars);
  return demo('g.he-beam-slab-case', 'A one-way slab strip: its least thickness by support case', {
    use: 'Use this for “A one-way slab spans 15 ft with one end continuous. What is its least thickness?”',
    assumptions: [
      'Normal-weight concrete and Grade 60 bars, so the table’s ℓ ÷ n holds.',
      'n is 20 when simply supported, 24 with one end continuous, 28 with both, and 10 for a cantilever.',
      'Continuous ends are drawn as fixed; 12 in to a foot.',
    ],
    variables: vars,
    relations: [
      monomial(
        'h_min = 12ℓ ÷ n',
        'h',
        [
          ['12', 1],
          ['l', 1],
        ],
        [['n', 1]],
        'Turn the span into inches (× 12), then divide by the support case’s n.',
        s,
      ),
    ],
    example: { l: 15, n: 24, h: 7.5 },
    startWith: ['l', 'n'],
    representation: {
      kind: 'beam',
      length: 'l',
      material: 'concrete',
      supportCase: {
        by: 'n',
        cases: [
          {
            value: 20,
            supports: [
              { at: 0, kind: 'pin' },
              { at: 'l', kind: 'roller' },
            ],
          },
          {
            value: 24,
            supports: [
              { at: 0, kind: 'pin' },
              { at: 'l', kind: 'fixed' },
            ],
          },
          {
            value: 28,
            supports: [
              { at: 0, kind: 'fixed' },
              { at: 'l', kind: 'fixed' },
            ],
          },
          { value: 10, supports: [{ at: 0, kind: 'fixed' }] },
        ],
      },
      fixed: true,
    },
  });
})();

// ─── HC1 beam, axial: a rod (mechanics-of-materials#0) ───────────────────────

const axialRod = (() => {
  const vars: VariableDef[] = [
    val('P', 'P', 'Load', 'N', 1e8, { min: 1 }),
    val('d', 'd', 'Diameter', 'mm', 1000, { min: 0.1 }),
    val('A', 'A', 'Area', 'mm²', 1e6),
    val('L', 'L', 'Length', 'mm', 1e5, { min: 1 }),
    val('sig', 'σ', 'Stress', 'MPa', 1e5),
    val('eps', 'ε', 'Strain', undefined, 1, { scientific: true }),
    val('dl', 'δ', 'Elongation', 'mm', 1e4),
    val('E', 'E', 'Modulus', 'MPa', 1e6, { min: 1 }),
  ];
  const s = symbolsOf(vars);
  const [P, d, L, E] = [50000, 20, 2000, 200000];
  const A = (Math.PI * d * d) / 4;
  return demo('g.he-beam-axial-rod', 'A rod pulled: stress, strain and stretch', {
    use: 'Use this for “A 20 mm steel rod 2 m long carries 50 kN. Find the stress, the strain and how much it stretches.”',
    assumptions: [
      'The load is axial through the centroid; the stress stays below the proportional limit.',
      'N, mm and MPa throughout.',
    ],
    variables: vars,
    relations: [
      monomial(
        'A = πd² ÷ 4',
        'A',
        [
          ['π', 1],
          ['d', 2],
        ],
        [['4', 1]],
        'A round rod’s area is π times the diameter squared, over 4.',
        s,
      ),
      monomial(
        'σ = P ÷ A',
        'sig',
        [['P', 1]],
        [['A', 1]],
        'Stress is the load spread over the area.',
        s,
      ),
      monomial(
        'ε = δ ÷ L',
        'eps',
        [['dl', 1]],
        [['L', 1]],
        'Strain is the stretch per unit length.',
        s,
      ),
      monomial(
        'σ = Eε',
        'sig',
        [
          ['E', 1],
          ['eps', 1],
        ],
        [],
        'Below the proportional limit, stress is the modulus times the strain (Hooke’s law).',
        s,
      ),
    ],
    example: { P, d, A, L, sig: P / A, eps: P / A / E, dl: (P / A / E) * L, E },
    startWith: ['P', 'd', 'L', 'E'],
    representation: {
      kind: 'beam',
      mode: 'axial',
      axial: {
        segments: [{ length: 'L', diameter: 'd', delta: 'dl' }],
        load: 'P',
        modulus: 'E',
        total: 'dl',
        stress: 'sig',
      },
    },
  });
})();

// ─── HC1 beam, axial: a stepped bar (mechanics-of-materials#1) ───────────────

const axialStepped = (() => {
  const vars: VariableDef[] = [
    val('P', 'P', 'Load', 'N', 1e8, { min: 1 }),
    val('E', 'E', 'Modulus', 'MPa', 1e6, { min: 1 }),
    val('L1', 'L₁', 'Length of segment 1', 'mm', 1e5, { min: 1 }),
    val('A1', 'A₁', 'Area of segment 1', 'mm²', 1e6, { min: 0.01 }),
    val('L2', 'L₂', 'Length of segment 2', 'mm', 1e5, { min: 1 }),
    val('A2', 'A₂', 'Area of segment 2', 'mm²', 1e6, { min: 0.01 }),
    val('d1', 'δ₁', 'Stretch of segment 1', 'mm', 1e4),
    val('d2', 'δ₂', 'Stretch of segment 2', 'mm', 1e4),
    val('d', 'δ', 'Total stretch', 'mm', 1e4),
  ];
  const s = symbolsOf(vars);
  const [P, E, L1, A1, L2, A2] = [20000, 70000, 400, 400, 300, 200];
  const d1 = (P * L1) / (A1 * E);
  const d2 = (P * L2) / (A2 * E);
  return demo('g.he-beam-axial-stepped', 'A stepped bar: each segment’s stretch and the total', {
    use: 'Use this for “An aluminum bar, 400 mm of 400 mm² then 300 mm of 200 mm², carries 20 kN. How much does it stretch?”',
    assumptions: [
      'Both segments carry the whole load P; one material, E = 70 GPa for aluminum.',
      'N, mm and MPa throughout.',
    ],
    variables: vars,
    relations: [
      monomial(
        'δ₁ = PL₁ ÷ (A₁E)',
        'd1',
        [
          ['P', 1],
          ['L1', 1],
        ],
        [
          ['A1', 1],
          ['E', 1],
        ],
        'Segment 1 stretches by its force times its length over its area times E.',
        s,
      ),
      monomial(
        'δ₂ = PL₂ ÷ (A₂E)',
        'd2',
        [
          ['P', 1],
          ['L2', 1],
        ],
        [
          ['A2', 1],
          ['E', 1],
        ],
        'Segment 2 carries the same P over its own length and area.',
        s,
      ),
      rel('δ = δ₁ + δ₂', '{d} = {d1} + {d2}', ['d', 'd1', 'd2'], (x) => x.d! - x.d1! - x.d2!, {
        d: [
          (x) => x.d1! + x.d2!,
          '{d1} + {d2}',
          'The segments stretch one after the other, so the stretches add.',
        ],
        d1: [(x) => x.d! - x.d2!, '{d} − {d2}', 'Take segment 2’s stretch off the total.'],
        d2: [(x) => x.d! - x.d1!, '{d} − {d1}', 'Take segment 1’s stretch off the total.'],
      }),
    ],
    example: { P, E, L1, A1, L2, A2, d1, d2, d: d1 + d2 },
    startWith: ['P', 'E', 'L1', 'A1', 'L2', 'A2'],
    representation: {
      kind: 'beam',
      mode: 'axial',
      axial: {
        segments: [
          { length: 'L1', area: 'A1', delta: 'd1' },
          { length: 'L2', area: 'A2', delta: 'd2' },
        ],
        load: 'P',
        modulus: 'E',
        total: 'd',
        material: 'aluminum',
      },
    },
  });
})();

// ─── HC1 beam, axial: three segments, a load between (the edge: 3 segments) ──

/** A segment's stretch δ = F × k ÷ E (k = L ÷ A, fixed), F = P or P + Q. */
function stretch(id: string, sym: string, k: number, withQ: boolean, how: string) {
  const F = (x: Values) => x.P! + (withQ ? x.Q! : 0);
  const force = withQ ? '({P} + {Q})' : '{P}';
  const parts: Record<string, [(x: Values) => number | undefined, string, string]> = {
    [id]: [(x) => (F(x) * k) / x.E!, `${force} × ${k} ÷ {E}`, how],
    E: [
      (x) => (x[id] === 0 ? undefined : (F(x) * k) / x[id]!),
      `${force} × ${k} ÷ {${id}}`,
      'Swap E and the stretch: divide the force times L ÷ A by the stretch.',
    ],
    P: [
      (x) => (x[id]! * x.E!) / k - (withQ ? x.Q! : 0),
      withQ ? `{${id}} × {E} ÷ ${k} − {Q}` : `{${id}} × {E} ÷ ${k}`,
      'Multiply the stretch by E, divide by L ÷ A, then take off any other load it carries.',
    ],
  };
  if (withQ)
    parts.Q = [
      (x) => (x[id]! * x.E!) / k - x.P!,
      `{${id}} × {E} ÷ ${k} − {P}`,
      'Multiply the stretch by E, divide by L ÷ A, then take off P.',
    ];
  return rel(
    `${sym} = ${withQ ? '(P + Q)' : 'P'} × ${k} ÷ E`,
    `{${id}} = ${force} × ${k} ÷ {E}`,
    withQ ? [id, 'P', 'Q', 'E'] : [id, 'P', 'E'],
    (x) => x[id]! - (F(x) * k) / x.E!,
    parts,
  );
}

const axialThree = (() => {
  const vars: VariableDef[] = [
    val('P', 'P', 'Load at the end', 'kN', 1e5),
    val('Q', 'Q', 'Load where segments 2 and 3 meet', 'kN', 1e5),
    val('E', 'E', 'Modulus', 'GPa', 1000, { min: 1 }),
    val('d1', 'δ₁', 'Stretch of segment 1', 'mm', 1e4),
    val('d2', 'δ₂', 'Stretch of segment 2', 'mm', 1e4),
    val('d3', 'δ₃', 'Stretch of segment 3', 'mm', 1e4),
    val('d', 'δ', 'Total stretch', 'mm', 1e4),
  ];
  const [P, Q, E] = [20, 30, 200];
  // δᵢ = FᵢLᵢ ÷ (AᵢE) with kN, mm, mm² and GPa: kN × mm ÷ (mm² × GPa) = mm.
  const [k1, k2, k3] = [300 / 600, 400 / 400, 300 / 200];
  const d1 = ((P + Q) * k1) / E;
  const d2 = ((P + Q) * k2) / E;
  const d3 = (P * k3) / E;
  return demo('g.he-beam-axial-three', 'Three segments with a load between: the stretch adds up', {
    use: 'Use this for “A steel bar of three segments carries 30 kN where the last two meet and 20 kN at its end. How much does it stretch?”',
    assumptions: [
      'Segments 300 mm of 600 mm², 400 mm of 400 mm² and 300 mm of 200 mm², one material.',
      'Segments 1 and 2 carry P + Q, segment 3 only P; kN, mm, mm² and GPa give mm.',
    ],
    variables: vars,
    relations: [
      stretch(
        'd1',
        'δ₁',
        k1,
        true,
        'Segment 1 carries P + Q: its stretch is (P + Q) × L₁ ÷ (A₁E), with L₁ ÷ A₁ = 0.5 per mm.',
      ),
      stretch('d2', 'δ₂', k2, true, 'Segment 2 also carries P + Q, over L₂ ÷ A₂ = 1 per mm.'),
      stretch('d3', 'δ₃', k3, false, 'Segment 3 carries only P, over L₃ ÷ A₃ = 1.5 per mm.'),
      rel(
        'δ = δ₁ + δ₂ + δ₃',
        '{d} = {d1} + {d2} + {d3}',
        ['d', 'd1', 'd2', 'd3'],
        (x) => x.d! - x.d1! - x.d2! - x.d3!,
        {
          d: [
            (x) => x.d1! + x.d2! + x.d3!,
            '{d1} + {d2} + {d3}',
            'The segments stretch one after another, so the stretches add.',
          ],
          d1: [
            (x) => x.d! - x.d2! - x.d3!,
            '{d} − {d2} − {d3}',
            'Take the other two stretches off the total.',
          ],
          d2: [
            (x) => x.d! - x.d1! - x.d3!,
            '{d} − {d1} − {d3}',
            'Take the other two stretches off the total.',
          ],
          d3: [
            (x) => x.d! - x.d1! - x.d2!,
            '{d} − {d1} − {d2}',
            'Take the other two stretches off the total.',
          ],
        },
      ),
    ],
    example: { P, Q, E, d1, d2, d3, d: d1 + d2 + d3 },
    startWith: ['P', 'Q', 'E'],
    representation: {
      kind: 'beam',
      mode: 'axial',
      units: { force: 'kN', length: 'mm' },
      axial: {
        segments: [
          { length: 300, area: 600, delta: 'd1' },
          { length: 400, area: 400, delta: 'd2', load: 'Q' },
          { length: 300, area: 200, delta: 'd3' },
        ],
        load: 'P',
        modulus: 'E',
        total: 'd',
      },
    },
  });
})();

// ─── HC1 beam, axial: a restrained bar heated (mechanics-of-materials#1~thermal) ─

const axialThermal = (() => {
  const vars: VariableDef[] = [
    val('a', 'α', 'Expansion coefficient', '/°C', 1e-3, { scientific: true, min: 1e-7 }),
    val('dT', 'ΔT', 'Temperature rise', '°C', 1000, { min: 0.1 }),
    val('L', 'L', 'Length', 'mm', 1e5, { min: 1 }),
    val('E', 'E', 'Modulus', 'MPa', 1e6, { min: 1 }),
    val('dL', 'δ_T', 'Free growth', 'mm', 1000),
    val('sig', 'σ', 'Stress', 'MPa', 0, { min: -1e5 }),
  ];
  const s = symbolsOf(vars);
  const [a, dT, L, E] = [12e-6, 40, 1000, 200000];
  return demo('g.he-beam-axial-thermal', 'A bar held between walls and heated: thermal stress', {
    use: 'Use this for “A steel bar held between two walls warms by 40 °C. What stress builds up?”',
    assumptions: [
      'The walls don’t move; the bar stays elastic and doesn’t buckle.',
      'Compression is negative; N, mm and MPa.',
    ],
    variables: vars,
    relations: [
      monomial(
        'δ_T = αΔTL',
        'dL',
        [
          ['a', 1],
          ['dT', 1],
          ['L', 1],
        ],
        [],
        'Free, the bar would grow by α for each degree, for each unit of its length.',
        s,
      ),
      rel(
        'σ = −EαΔT',
        '{sig} = −{E} × {a} × {dT}',
        ['sig', 'E', 'a', 'dT'],
        (x) => x.sig! + x.E! * x.a! * x.dT!,
        {
          sig: [
            (x) => -x.E! * x.a! * x.dT!,
            '−{E} × {a} × {dT}',
            'The walls squeeze back the strain αΔT the bar would take, so σ = −E × αΔT.',
          ],
          E: [
            (x) => (x.a! * x.dT! === 0 ? undefined : -x.sig! / (x.a! * x.dT!)),
            '−{sig} ÷ ({a} × {dT})',
            'Divide −σ by the strain αΔT.',
          ],
          a: [
            (x) => (x.E! * x.dT! === 0 ? undefined : -x.sig! / (x.E! * x.dT!)),
            '−{sig} ÷ ({E} × {dT})',
            'Divide −σ by E times ΔT.',
          ],
          dT: [
            (x) => (x.E! * x.a! === 0 ? undefined : -x.sig! / (x.E! * x.a!)),
            '−{sig} ÷ ({E} × {a})',
            'Divide −σ by E times α.',
          ],
        },
      ),
    ],
    example: { a, dT, L, E, dL: a * dT * L, sig: -E * a * dT },
    startWith: ['a', 'dT', 'L', 'E'],
    representation: {
      kind: 'beam',
      mode: 'axial',
      axial: {
        segments: [{ length: 'L' }],
        walls: true,
        temperature: 'dT',
        expansion: 'dL',
        stress: 'sig',
      },
    },
  });
})();

// ─── HC1 beam, column: Euler buckling by its ends (mechanics-of-materials#5, aerospace-structures#2) ─

const K_NAMES = 'K is 0.5 fixed–fixed, 0.7 fixed–pinned, 1 pinned–pinned, 2 fixed–free.';

function euler(
  id: string,
  title: string,
  use: string,
  [E, I, L, K]: [number, number, number, number],
  material: 'steel' | 'aluminum',
) {
  const vars: VariableDef[] = [
    val('E', 'E', 'Modulus', 'MPa', 1e6, { min: 1 }),
    val('I', 'I', 'Second moment of area', 'mm⁴', 1e12, { min: 1, scientific: true }),
    val('L', 'L', 'Length', 'mm', 1e5, { min: 1 }),
    {
      ...val('K', 'K', 'Effective-length factor', undefined, 2, { min: 0.5 }),
      allowed: [0.5, 0.7, 1, 2],
    },
    val('KL', 'KL', 'Effective length', 'mm', 2e5),
    val('P', 'P_cr', 'Critical load', 'N', 1e12),
  ];
  const s = symbolsOf(vars);
  return demo(id, title, {
    use,
    assumptions: ['Straight, centrally loaded and elastic up to P_cr; N, mm and MPa.', K_NAMES],
    variables: vars,
    relations: [
      monomial(
        'KL = K × L',
        'KL',
        [
          ['K', 1],
          ['L', 1],
        ],
        [],
        'The effective length is the half-wave the ends let the column bend in: K times L.',
        s,
      ),
      monomial(
        'P_cr = π²EI ÷ (KL)²',
        'P',
        [
          ['π²', 1],
          ['E', 1],
          ['I', 1],
        ],
        [['KL', 2]],
        'Euler’s load for a half-wave KL long: π²EI over KL squared.',
        s,
      ),
    ],
    example: { E, I, L, K, KL: K * L, P: (Math.PI ** 2 * E * I) / (K * L) ** 2 },
    startWith: ['E', 'I', 'L', 'K'],
    representation: {
      kind: 'beam',
      mode: 'column',
      length: 'L',
      units: { force: 'N', length: 'mm' },
      column: { k: 'K', pcr: 'P', effective: 'KL', material },
    },
  });
}

const columnPinned = euler(
  'g.he-beam-column-euler',
  'Euler buckling, pinned at both ends: one half-wave',
  'Use this for “A pinned steel column 3 m long has I = 2 × 10⁶ mm⁴. At what load does it buckle?”',
  [200000, 2e6, 3000, 1],
  'steel',
);

const columnFixedPinned = euler(
  'g.he-beam-column-fixed-pinned',
  'Fixed at the bottom, pinned on top: KL = 0.7L',
  'Use this for “The same column, now fixed at its base and pinned on top. How much more can it carry?”',
  [200000, 2e6, 3000, 0.7],
  'steel',
);

const columnFixedFixed = euler(
  'g.he-beam-column-fixed-fixed',
  'An aluminum tube fixed at both ends: KL = 0.5L',
  'Use this for “An aluminum tube 1.2 m long, I = 8 × 10⁴ mm⁴, fixed at both ends. Find its critical load.”',
  [70000, 80000, 1200, 0.5],
  'aluminum',
);

const columnFixedFree = euler(
  'g.he-beam-column-fixed-free',
  'Fixed at the base, free on top: KL = 2L, the weakest case',
  'Use this for “A flagpole-like aluminum tube 1.2 m tall is fixed at its base and free on top. At what load does it buckle?”',
  [70000, 80000, 1200, 2],
  'aluminum',
);

// ─── HC1 beam, column: concrete slenderness (concrete-design#2~slenderness) ──

const columnConcrete = (() => {
  const vars: VariableDef[] = [
    {
      ...val('k', 'k', 'Effective-length factor', undefined, 2, { min: 0.5 }),
      allowed: [0.5, 0.7, 1, 2],
    },
    val('lu', 'ℓ_u', 'Unbraced length', 'ft', 100, { min: 1 }),
    val('h', 'h', 'Column depth', 'in', 200, { min: 1 }),
    val('r', 'r', 'Radius of gyration', 'in', 60),
    val('ratio', 'kℓ_u/r', 'Slenderness', undefined, 1000),
  ];
  const s = symbolsOf(vars);
  const [k, lu, h] = [1, 12, 16];
  return demo('g.he-beam-column-concrete', 'A concrete column: is it slender?', {
    use: 'Use this for “A 16 in square column has 12 ft between floors, k = 1. Is it slender?”',
    assumptions: [
      'A rectangular section: r = 0.3h; sway frames count as slender above 22.',
      `${K_NAMES} 12 in to a foot.`,
    ],
    variables: vars,
    relations: [
      monomial(
        'r = 0.3h',
        'r',
        [
          ['0.3', 1],
          ['h', 1],
        ],
        [],
        'For a rectangle, r is about 0.3 times the depth in the direction it bends.',
        s,
      ),
      monomial(
        'kℓ_u/r = 12kℓ_u ÷ r',
        'ratio',
        [
          ['12', 1],
          ['k', 1],
          ['lu', 1],
        ],
        [['r', 1]],
        'Turn ℓ_u into inches (× 12), multiply by k, then divide by r.',
        s,
      ),
    ],
    example: { k, lu, h, r: 0.3 * h, ratio: (12 * k * lu) / (0.3 * h) },
    startWith: ['k', 'lu', 'h'],
    representation: {
      kind: 'beam',
      mode: 'column',
      length: 'lu',
      column: { k: 'k', slenderness: 'ratio', material: 'concrete' },
    },
  });
})();

// ─── HC1 beam, panel: a skin panel buckling between stringers (aerospace-structures#2~plate) ─

function panelDemo(
  id: string,
  title: string,
  use: string,
  [k, E, nu, t, b]: [number, number, number, number, number],
) {
  const vars: VariableDef[] = [
    {
      ...val('k', 'k', 'Buckling coefficient', undefined, 10, { min: 1 }),
      allowed: [4, 6.97],
    },
    val('E', 'E', 'Modulus', 'MPa', 1e6, { min: 1 }),
    val('nu', 'ν', 'Poisson’s ratio', undefined, 0.49, { min: 0.01 }),
    val('t', 't', 'Skin thickness', 'mm', 100, { min: 0.01 }),
    val('b', 'b', 'Width between stringers', 'mm', 2000, { min: 1 }),
    val('sig', 'σ_cr', 'Critical stress', 'MPa', 1e5),
  ];
  const f = (x: Values) =>
    ((x.k! * Math.PI ** 2 * x.E!) / (12 * (1 - x.nu! ** 2))) * (x.t! / x.b!) ** 2;
  const per = (x: Values) => (Math.PI ** 2 * x.E! * (x.t! / x.b!) ** 2) / (12 * (1 - x.nu! ** 2));
  return demo(id, title, {
    use,
    assumptions: [
      'A flat panel squeezed along its stringers, elastic; k = 4 with simply supported edges, 6.97 clamped.',
      'N, mm and MPa.',
    ],
    variables: vars,
    relations: [
      rel(
        'σ_cr = kπ²E ÷ (12(1 − ν²)) × (t ÷ b)²',
        '{sig} = {k} × π² × {E} ÷ (12 × (1 − {nu}²)) × ({t} ÷ {b})²',
        ['sig', 'k', 'E', 'nu', 't', 'b'],
        (x) => x.sig! - f(x),
        {
          sig: [
            f,
            '{k} × π² × {E} ÷ (12 × (1 − {nu}²)) × ({t} ÷ {b})²',
            'The plate-buckling formula: like Euler’s, with the panel’s width b in place of the length.',
          ],
          E: [
            (x) => {
              const d = x.k! * Math.PI ** 2 * (x.t! / x.b!) ** 2;
              return d === 0 ? undefined : (x.sig! * 12 * (1 - x.nu! ** 2)) / d;
            },
            '{sig} × 12 × (1 − {nu}²) ÷ ({k} × π² × ({t} ÷ {b})²)',
            'Multiply σ_cr by 12(1 − ν²), then divide by kπ²(t ÷ b)².',
          ],
          t: [
            (x) => {
              const d = x.k! * Math.PI ** 2 * x.E!;
              return d === 0 || x.sig! < 0
                ? undefined
                : x.b! * Math.sqrt((x.sig! * 12 * (1 - x.nu! ** 2)) / d);
            },
            '{b} × √({sig} × 12 × (1 − {nu}²) ÷ ({k} × π² × {E}))',
            'Get (t ÷ b)² alone, take the square root, then multiply by b.',
          ],
          b: [
            (x) => {
              const top = x.k! * Math.PI ** 2 * x.E!;
              return x.sig! <= 0
                ? undefined
                : x.t! * Math.sqrt(top / (x.sig! * 12 * (1 - x.nu! ** 2)));
            },
            '{t} × √({k} × π² × {E} ÷ ({sig} × 12 × (1 − {nu}²)))',
            'Get (b ÷ t)² alone, take the square root, then multiply by t.',
          ],
          nu: [
            (x) => {
              const q = 1 - (x.k! * per({ ...x, nu: 0 })) / x.sig!;
              return x.sig! <= 0 || q < 0 ? undefined : Math.sqrt(q);
            },
            '√(1 − {k} × π² × {E} × ({t} ÷ {b})² ÷ (12 × {sig}))',
            'Get 1 − ν² alone, take it from 1, then take the square root.',
          ],
        },
      ),
    ],
    example: { k, E, nu, t, b, sig: f({ k, E, nu, t, b }) },
    startWith: ['k', 'E', 'nu', 't', 'b'],
    representation: {
      kind: 'beam',
      mode: 'panel',
      panel: { width: 'b', thickness: 't', k: 'k', stress: 'sig' },
    },
  });
}

const panel = panelDemo(
  'g.he-beam-panel',
  'A skin panel buckles between stringers',
  'Use this for “A 2 mm aluminum skin spans 100 mm between stringers, edges simply supported. At what stress does it buckle?”',
  [4, 70000, 0.33, 2, 100],
);

const panelClamped = panelDemo(
  'g.he-beam-panel-clamped',
  'A wide, thin panel with clamped edges',
  'Use this for “A 1 mm skin spans 250 mm between stringers that clamp its edges. At what stress does it buckle?”',
  [6.97, 70000, 0.33, 1, 250],
);

// ─── HC1 beam, influence: moment at a section (structural-analysis#1) ────────

function influenceMoment(
  id: string,
  title: string,
  use: string,
  [L, c, P, w]: [number, number, number, number],
) {
  const vars: VariableDef[] = [
    val('L', 'L', 'Span', 'm', 1000, { min: 0.1 }),
    val('c', 'c', 'Section C from A', 'm', 1000),
    val('y', 'y_C', 'Peak ordinate', 'm', 1000),
    val('P', 'P', 'Moving load', 'kN', 1e5),
    val('MP', 'M_P', 'Moment at C from P', 'kN·m', 1e8),
    val('w', 'w', 'Uniform live load', 'kN/m', 1e4),
    val('Mw', 'M_w', 'Moment at C from w', 'kN·m', 1e8),
  ];
  const s = symbolsOf(vars);
  const y = (c * (L - c)) / L;
  return demo(id, title, {
    use,
    assumptions: [
      'Simply supported; the peak effect is with the load right at C.',
      'The uniform load covers the whole span: its effect is w times the area under the line.',
    ],
    variables: vars,
    relations: [
      rel(
        'y_C = c(L − c) ÷ L',
        '{y} = {c} × ({L} − {c}) ÷ {L}',
        ['y', 'c', 'L'],
        (x) => x.y! - (x.c! * (x.L! - x.c!)) / x.L!,
        {
          y: [
            (x) => (x.L === 0 ? undefined : (x.c! * (x.L! - x.c!)) / x.L!),
            '{c} × ({L} − {c}) ÷ {L}',
            'A load of 1 at C makes R_A = (L − c) ÷ L, and M at C = R_A × c.',
          ],
          L: [
            (x) => (x.c! - x.y! === 0 ? undefined : (x.c! * x.c!) / (x.c! - x.y!)),
            '{c}² ÷ ({c} − {y})',
            'Multiply out yL = cL − c², then gather the L terms: L(c − y) = c².',
          ],
        },
      ),
      monomial(
        'M_P = P × y_C',
        'MP',
        [
          ['P', 1],
          ['y', 1],
        ],
        [],
        'A point load’s effect is its size times the ordinate where it stands.',
        s,
      ),
      monomial(
        'M_w = w × ½L × y_C',
        'Mw',
        [
          ['w', 1],
          ['L', 1],
          ['y', 1],
        ],
        [['2', 1]],
        'A uniform load’s effect is w times the triangle’s area, ½ × L × y_C.',
        s,
      ),
      atMost('c', 'L', '{c} is at most {L}', 'The section is on the beam: c is at most the span.'),
    ],
    example: { L, c, y, P, MP: P * y, w, Mw: (w * L * y) / 2 },
    startWith: ['L', 'c', 'P', 'w'],
    representation: {
      kind: 'beam',
      length: 'L',
      supports: [
        { at: 0, kind: 'pin' },
        { at: 'L', kind: 'roller' },
      ],
      influence: { of: 'moment', at: 'c', ordinate: 'y', load: 'P', uniform: 'w' },
    },
  });
}

const influence = influenceMoment(
  'g.he-beam-influence-moment',
  'Influence line for the moment at a section',
  'Use this for “A 10 m span: what largest moment at 4 m from A can a 50 kN load cause? And 12 kN/m over the span?”',
  [10, 4, 50, 12],
);

const influenceNearEnd = influenceMoment(
  'g.he-beam-influence-near-end',
  'Influence line for the moment near a support: a low, lopsided triangle',
  'Use this for “On a 10 m span, how much moment can a 50 kN load cause 1 m from A?”',
  [10, 1, 50, 12],
);

// ─── HC1 beam, influence: shear at a section (structural-analysis#1~shear) ───

const influenceShear = (() => {
  const vars: VariableDef[] = [
    val('L', 'L', 'Span', 'm', 1000, { min: 0.1 }),
    val('c', 'c', 'Section C from A', 'm', 1000),
    val('yL', 'y_L', 'Ordinate just left of C', undefined, 0, { min: -1 }),
    val('yR', 'y_R', 'Ordinate just right of C', undefined, 1),
    val('P', 'P', 'Moving load', 'kN', 1e5),
    val('V', 'V_max', 'Largest shear at C', 'kN', 1e5),
  ];
  const s = symbolsOf(vars);
  const [L, c, P] = [10, 4, 50];
  return demo('g.he-beam-influence-shear', 'Influence line for the shear at a section', {
    use: 'Use this for “On a 10 m span, what largest shear can a 50 kN load cause 4 m from A?”',
    assumptions: [
      'Simply supported; shear at C counts forces left of C, up positive.',
      'The largest positive shear is with the load just right of C.',
    ],
    variables: vars,
    relations: [
      rel('y_L = −c ÷ L', '{yL} = −{c} ÷ {L}', ['yL', 'c', 'L'], (x) => x.yL! + x.c! / x.L!, {
        yL: [
          (x) => (x.L === 0 ? undefined : -x.c! / x.L!),
          '−{c} ÷ {L}',
          'A load of 1 just left of C: V at C = R_A − 1 = −R_B = −c ÷ L.',
        ],
        c: [(x) => -x.yL! * x.L!, '−{yL} × {L}', 'Multiply both sides by −L.'],
        L: [
          (x) => (x.yL === 0 ? undefined : -x.c! / x.yL!),
          '−{c} ÷ {yL}',
          'Swap L and the ordinate: divide −c by it.',
        ],
      }),
      rel(
        'y_R = (L − c) ÷ L',
        '{yR} = ({L} − {c}) ÷ {L}',
        ['yR', 'L', 'c'],
        (x) => x.yR! - (x.L! - x.c!) / x.L!,
        {
          yR: [
            (x) => (x.L === 0 ? undefined : (x.L! - x.c!) / x.L!),
            '({L} − {c}) ÷ {L}',
            'A load of 1 just right of C: V at C = R_A = (L − c) ÷ L.',
          ],
          c: [(x) => x.L! * (1 - x.yR!), '{L} × (1 − {yR})', 'Multiply by L, then take it from L.'],
        },
      ),
      monomial(
        'V_max = P × y_R',
        'V',
        [
          ['P', 1],
          ['yR', 1],
        ],
        [],
        'The load just right of C gives the largest positive shear: P times that ordinate.',
        s,
      ),
      atMost('c', 'L', '{c} is at most {L}', 'The section is on the beam: c is at most the span.'),
    ],
    example: { L, c, yL: -c / L, yR: (L - c) / L, P, V: (P * (L - c)) / L },
    startWith: ['L', 'c', 'P'],
    representation: {
      kind: 'beam',
      length: 'L',
      supports: [
        { at: 0, kind: 'pin' },
        { at: 'L', kind: 'roller' },
      ],
      influence: { of: 'shear', at: 'c', left: 'yL', right: 'yR', load: 'P' },
    },
  });
})();

// ─── HC1 beam, influence on a continuous beam (structural-analysis#1~muller-breslau) ─

const influenceContinuous = (() => {
  const vars: VariableDef[] = [
    val('s', 's', 'Each span', 'm', 1000, { min: 0.1 }),
    val('c', 'c', 'Section C (middle of span 2)', 'm', 1500, { derived: true }),
    val('y', 'y_C', 'Ordinate at C', 'm', 1000),
    val('P', 'P', 'Moving load', 'kN', 1e5),
    val('M', 'M_C', 'Moment at C from P', 'kN·m', 1e8),
  ];
  const sy = symbolsOf(vars);
  const [sp, P] = [5, 50];
  return demo(
    'g.he-beam-influence-continuous',
    'Müller-Breslau: the influence line of a continuous beam',
    {
      use: 'Use this for “Three equal 5 m spans: where should live load go for the most moment at the middle of span 2?”',
      assumptions: [
        'Three equal spans on a pin and rollers; EI the same throughout.',
        'Release the moment at C and bend it: the shape is the influence line (Müller-Breslau).',
      ],
      variables: vars,
      relations: [
        monomial(
          'c = 3s ÷ 2',
          'c',
          [
            ['3', 1],
            ['s', 1],
          ],
          [['2', 1]],
          'The middle of span 2 is one and a half spans from A.',
          sy,
        ),
        monomial(
          'y_C = 7s ÷ 40',
          'y',
          [
            ['7', 1],
            ['s', 1],
          ],
          [['40', 1]],
          'From the three-moment equation for three equal spans, a load of 1 at C makes M at C = 7s ÷ 40.',
          sy,
        ),
        monomial(
          'M_C = P × y_C',
          'M',
          [
            ['P', 1],
            ['y', 1],
          ],
          [],
          'A point load’s effect is its size times the ordinate where it stands.',
          sy,
        ),
      ],
      example: { s: sp, c: 1.5 * sp, y: (7 * sp) / 40, P, M: (P * 7 * sp) / 40 },
      startWith: ['s', 'P'],
      representation: {
        kind: 'beam',
        spans: ['s', 's', 's'],
        influence: { of: 'moment', at: 'c', ordinate: 'y', load: 'P' },
        fixed: true,
      },
    },
  );
})();

// ─── HC1 beam, continuous: moment distribution (structural-analysis#2~moment-distribution) ─

const continuous = (() => {
  const vars: VariableDef[] = [
    val('L1', 'L₁', 'Span AB', 'm', 1000, { min: 0.1 }),
    val('L2', 'L₂', 'Span BC', 'm', 1000, { min: 0.1 }),
    val('w', 'w', 'Uniform load', 'kN/m', 1e4),
    val('k1', 'k₁', 'Stiffness of AB, 3 ÷ L₁', '/m', 100),
    val('k2', 'k₂', 'Stiffness of BC, 3 ÷ L₂', '/m', 100),
    val('DF1', 'DF₁', 'Distribution factor BA', undefined, 1),
    val('DF2', 'DF₂', 'Distribution factor BC', undefined, 1),
    val('F1', 'FEM₁', 'Fixed-end moment BA', 'kN·m', 1e8),
    val('F2', 'FEM₂', 'Fixed-end moment BC', 'kN·m', 1e8),
    val('MB', 'M_B', 'Moment over B', 'kN·m', 1e8),
  ];
  const s = symbolsOf(vars);
  const [L1, L2, w] = [6, 4, 12];
  const [k1, k2] = [3 / L1, 3 / L2];
  const [F1, F2] = [(w * L1 * L1) / 8, (w * L2 * L2) / 8];
  return demo('g.he-beam-continuous', 'Moment distribution over two spans', {
    use: 'Use this for “Spans of 6 m and 4 m, pinned at the far ends, carry 12 kN/m. Find the moment over the middle support.”',
    assumptions: [
      'Far ends pinned: stiffness 3EI ÷ L, EI the same, and no carry-over to a pin.',
      'Moments clockwise + on each member end; one cycle balances B.',
    ],
    variables: vars,
    relations: [
      monomial(
        'k₁ = 3 ÷ L₁',
        'k1',
        [['3', 1]],
        [['L1', 1]],
        'A span pinned at its far end is 3EI ÷ L stiff; EI is the same, so keep 3 ÷ L.',
        s,
      ),
      monomial('k₂ = 3 ÷ L₂', 'k2', [['3', 1]], [['L2', 1]], 'The same for span BC.', s),
      rel(
        'DF₁ = k₁ ÷ (k₁ + k₂)',
        '{DF1} = {k1} ÷ ({k1} + {k2})',
        ['DF1', 'k1', 'k2'],
        (x) => x.DF1! - x.k1! / (x.k1! + x.k2!),
        {
          DF1: [
            (x) => (x.k1! + x.k2! === 0 ? undefined : x.k1! / (x.k1! + x.k2!)),
            '{k1} ÷ ({k1} + {k2})',
            'Each member at B takes its share of the stiffness there.',
          ],
          k1: [
            (x) => (x.DF1 === 1 ? undefined : (x.DF1! * x.k2!) / (1 - x.DF1!)),
            '{DF1} × {k2} ÷ (1 − {DF1})',
            'Multiply out DF₁(k₁ + k₂) = k₁, then gather the k₁ terms.',
          ],
        },
      ),
      rel('DF₂ = 1 − DF₁', '{DF2} = 1 − {DF1}', ['DF2', 'DF1'], (x) => x.DF2! - (1 - x.DF1!), {
        DF2: [(x) => 1 - x.DF1!, '1 − {DF1}', 'The factors at a joint add to 1.'],
        DF1: [(x) => 1 - x.DF2!, '1 − {DF2}', 'The factors at a joint add to 1.'],
      }),
      monomial(
        'FEM₁ = wL₁² ÷ 8',
        'F1',
        [
          ['w', 1],
          ['L1', 2],
        ],
        [['8', 1]],
        'With its far end pinned, the end moment at B of a uniform load is wL² ÷ 8.',
        s,
      ),
      monomial(
        'FEM₂ = wL₂² ÷ 8',
        'F2',
        [
          ['w', 1],
          ['L2', 2],
        ],
        [['8', 1]],
        'The same for span BC.',
        s,
      ),
      rel(
        'M_B = FEM₁ − DF₁(FEM₁ − FEM₂)',
        '{MB} = {F1} − {DF1} × ({F1} − {F2})',
        ['MB', 'F1', 'DF1', 'F2'],
        (x) => x.MB! - (x.F1! - x.DF1! * (x.F1! - x.F2!)),
        {
          MB: [
            (x) => x.F1! - x.DF1! * (x.F1! - x.F2!),
            '{F1} − {DF1} × ({F1} − {F2})',
            'Balance B: the unbalance FEM₁ − FEM₂ is shared by the factors; BA keeps FEM₁ less its share.',
          ],
          DF1: [
            (x) => (x.F1 === x.F2 ? undefined : (x.F1! - x.MB!) / (x.F1! - x.F2!)),
            '({F1} − {MB}) ÷ ({F1} − {F2})',
            'Take M_B from FEM₁, then divide by the unbalance.',
          ],
        },
      ),
    ],
    example: {
      L1,
      L2,
      w,
      k1,
      k2,
      DF1: k1 / (k1 + k2),
      DF2: k2 / (k1 + k2),
      F1,
      F2,
      MB: F1 - (k1 / (k1 + k2)) * (F1 - F2),
    },
    startWith: ['L1', 'L2', 'w'],
    representation: {
      kind: 'beam',
      spans: ['L1', 'L2'],
      loads: [{ kind: 'uniform', size: 'w' }],
      continuous: { far: 'pinned', df: ['DF1', 'DF2'], fem: ['F1', 'F2'], moment: 'MB' },
    },
  });
})();

export const HE1A_GALLERY_MODULES: ModuleDef[] = [
  point,
  pointEdge,
  udl,
  cantilever,
  triangle,
  propped,
  fixedFixed,
  deflection,
  slab,
  axialRod,
  axialStepped,
  axialThree,
  axialThermal,
  columnPinned,
  columnFixedPinned,
  columnFixedFixed,
  columnFixedFree,
  columnConcrete,
  panel,
  panelClamped,
  influence,
  influenceNearEnd,
  influenceShear,
  influenceContinuous,
  continuous,
];

export const HE1A_GALLERY_LAYOUTS: LayoutDef[] = [];
