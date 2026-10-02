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
];

export const HE1A_GALLERY_LAYOUTS: LayoutDef[] = [];
