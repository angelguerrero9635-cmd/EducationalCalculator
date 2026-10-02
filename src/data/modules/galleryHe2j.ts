/**
 * College gallery demos, round 2, group J (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC28 `stressStrain` (ME-P5 in docs/plans/he.mechanical.md, B-P23 in docs/plans/he.biology.md):
 * the σ–ε curve, a specimen, a bone's section in bending and an implant sharing load with bone.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';
import { getUnit } from '@/engine/units';

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

/** A factor of a product: a variable id (or a constant: '4', '1000', 'π') to a power. */
type Factor = [string, number];

const SUP: Record<number, string> = { 2: '²', 3: '³', 4: '⁴' };
const ROOT: Record<number, string> = { 2: '√', 3: '∛', 4: '∜' };
const CONST: Record<string, number> = { π: Math.PI };
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

/** A limit, not a formula: `a` is less than `b`. */
const below = (a: string, b: string, display: string, why: string) => ({
  relation: {
    id: `${a} < ${b}`,
    constraint: true,
    display,
    vars: [a, b],
    residual: (x: Values) => (x[a]! < x[b]! ? 0 : 1),
    solve: {},
    message: () => why,
  } as Relation,
  steps: {} as Steps,
});

/** A demo module from its variables and relations; each value keeps the page's own unit. */
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
    standalone?: { vars: string[]; why: string };
  },
): ModuleDef {
  return {
    id,
    title,
    use: m.use,
    assumptions: m.assumptions,
    variables: m.variables.map((v) => (getUnit(v.unit) ? { ...v, units: [v.unit!] } : v)),
    relations: m.relations.map((r) => r.relation),
    steps: Object.fromEntries(m.relations.map((r) => [r.relation.id, r.steps])),
    example: m.example,
    startWith: m.startWith,
    representation: m.representation,
    unitSystems: ['metric'],
    ...(m.standalone ? { standalone: m.standalone } : {}),
  };
}

const symbolsOf = (vs: VariableDef[]) => Object.fromEntries(vs.map((v) => [v.id, v.symbol]));

// ─── HC28 stressStrain: a steel rod in tension (mechanics-of-materials#0) ────

const ROD_VARS: VariableDef[] = [
  val('P', 'P', 'Axial load', 'kN', 10000, { min: 0.001 }),
  val('d', 'd', 'Rod diameter', 'mm', 1000, { min: 0.1 }),
  val('A', 'A', 'Cross-section area', 'mm²', 1e6, { min: 0.01 }),
  val('L', 'L', 'Rod length', 'mm', 1e5, { min: 1 }),
  val('s', 'σ', 'Normal stress', 'MPa', 1e4),
  val('eps', 'ε', 'Strain', undefined, 0.1, { scientific: true }),
  val('dL', 'δ', 'Elongation', 'mm', 1000),
  val('E', 'E', 'Elastic modulus', 'GPa', 1000, { min: 0.001 }),
];

const rod = (() => {
  const s = symbolsOf(ROD_VARS);
  return demo('g.he-stressStrain-rod', 'Stress, strain and elongation of a rod', {
    use: 'Use this for “A 20 mm steel rod 2 m long carries 50 kN. Find the stress, the strain and how much it stretches.”',
    assumptions: [
      'The load is axial, through the centroid; the stress stays below the proportional limit.',
      'Steel: E = 200 GPa. The picture’s point sits on the elastic line σ = Eε.',
    ],
    variables: ROD_VARS,
    relations: [
      monomial(
        'A = πd² ÷ 4',
        'A',
        [
          ['π', 1],
          ['d', 2],
        ],
        [['4', 1]],
        'A circle’s area is π times its diameter squared, over 4.',
        s,
      ),
      monomial(
        'σ = P ÷ A',
        's',
        [
          ['1000', 1],
          ['P', 1],
        ],
        [['A', 1]],
        'Stress is load over area; × 1000 turns kN per mm² into MPa (N/mm²).',
        s,
      ),
      monomial(
        'ε = δ ÷ L',
        'eps',
        [['dL', 1]],
        [['L', 1]],
        'Strain is the stretch over the original length.',
        s,
      ),
      monomial(
        'σ = Eε',
        's',
        [
          ['1000', 1],
          ['E', 1],
          ['eps', 1],
        ],
        [],
        'Hooke’s law: stress is E times strain; × 1000 turns GPa into MPa.',
        s,
      ),
    ],
    example: {
      P: 50,
      d: 20,
      A: 100 * Math.PI,
      L: 2000,
      s: 500 / Math.PI,
      eps: 0.0025 / Math.PI,
      dL: 5 / Math.PI,
      E: 200,
    },
    startWith: ['P', 'd', 'L', 'E'],
    representation: {
      kind: 'stressStrain',
      curve: 'linear',
      E: 'E',
      strain: 'eps',
      stress: 's',
      drag: 'P',
      specimen: { F: 'P', A: 'A', d: 'd', L: 'L', dL: 'dL' },
    },
  });
})();

// ─── A tensile test to fracture (materials-science#3) ────────────────────────

const TENSILE_VARS: VariableDef[] = [
  val('d0', 'd₀', 'Starting diameter', 'mm', 1000, { min: 0.1 }),
  val('F', 'F_max', 'Largest load', 'kN', 10000, { min: 0.001 }),
  val('L0', 'L₀', 'Gauge length', 'mm', 10000, { min: 0.1 }),
  val('Lf', 'L_f', 'Length after fracture', 'mm', 10000, { min: 0.1 }),
  val('df', 'd_f', 'Neck diameter after fracture', 'mm', 1000, { min: 0.01 }),
  val('UTS', 'UTS', 'Tensile strength', 'MPa', 1e4),
  val('EL', '%EL', 'Elongation at fracture', '%', 1000),
  val('RA', '%RA', 'Reduction of area', '%', 100),
];

const tensile = (() => {
  const s = symbolsOf(TENSILE_VARS);
  return demo('g.he-stressStrain-tensile', 'Tensile strength, elongation and reduction of area', {
    use: 'Use this for “A 12.8 mm bar with a 50 mm gauge breaks after 50 kN, at 62 mm long with a 9 mm neck. Find the UTS, %EL and %RA.”',
    assumptions: [
      'Engineering stress: the load over the starting area.',
      '%EL is measured after fracture, so the elastic stretch has sprung back.',
      'The curve is a sketch of a ductile metal: the page gives no σ_Y or E.',
    ],
    variables: TENSILE_VARS,
    relations: [
      monomial(
        'UTS = F_max ÷ (πd₀² ÷ 4)',
        'UTS',
        [
          ['4000', 1],
          ['F', 1],
        ],
        [
          ['π', 1],
          ['d0', 2],
        ],
        'The largest load over the starting area πd₀² ÷ 4; × 1000 turns kN into N.',
        s,
      ),
      rel(
        '%EL = (L_f − L₀) ÷ L₀',
        '{EL} = 100 × ({Lf} − {L0}) ÷ {L0}',
        ['EL', 'Lf', 'L0'],
        (x) => x.EL! - (100 * (x.Lf! - x.L0!)) / x.L0!,
        {
          EL: [
            (x) => (100 * (x.Lf! - x.L0!)) / x.L0!,
            '100 × ({Lf} − {L0}) ÷ {L0}',
            'The gain in length over the gauge length, as a percent.',
          ],
          Lf: [
            (x) => x.L0! * (1 + x.EL! / 100),
            '{L0} × (1 + {EL} ÷ 100)',
            'The gauge length grown by %EL.',
          ],
          L0: [
            (x) => x.Lf! / (1 + x.EL! / 100),
            '{Lf} ÷ (1 + {EL} ÷ 100)',
            'Undo the growth: divide the final length by 1 + %EL ÷ 100.',
          ],
        },
      ),
      rel(
        '%RA = 1 − (d_f ÷ d₀)²',
        '{RA} = 100 × (1 − ({df} ÷ {d0})²)',
        ['RA', 'df', 'd0'],
        (x) => x.RA! - 100 * (1 - (x.df! / x.d0!) ** 2),
        {
          RA: [
            (x) => 100 * (1 - (x.df! / x.d0!) ** 2),
            '100 × (1 − ({df} ÷ {d0})²)',
            'The area lost at the neck, as a percent: areas go as diameter squared.',
          ],
          df: [
            (x) => (x.RA! > 100 ? undefined : x.d0! * Math.sqrt(1 - x.RA! / 100)),
            '{d0} × √(1 − {RA} ÷ 100)',
            'The neck keeps 1 − %RA of the area, so its diameter is d₀ times the root of that.',
          ],
          d0: [
            (x) => (x.RA! >= 100 ? undefined : x.df! / Math.sqrt(1 - x.RA! / 100)),
            '{df} ÷ √(1 − {RA} ÷ 100)',
            'Undo the shrink: divide the neck diameter by the root of the area kept.',
          ],
        },
      ),
    ],
    example: {
      d0: 12.8,
      F: 50,
      L0: 50,
      Lf: 62,
      df: 9,
      UTS: 200000 / (Math.PI * 12.8 ** 2),
      EL: 24,
      RA: 100 * (1 - (9 / 12.8) ** 2),
    },
    startWith: ['d0', 'F', 'L0', 'Lf', 'df'],
    standalone: {
      vars: ['L0', 'Lf', 'EL'],
      why: 'The elongation comes from the gauge marks, apart from the load and the diameters: one test, three results.',
    },
    representation: { kind: 'stressStrain', curve: 'metal', uts: 'UTS', fracture: 'EL' },
  });
})();

// ─── True stress and strain (materials-science#3~true) ───────────────────────

const TRUE_VARS: VariableDef[] = [
  val('s', 'σ', 'Engineering stress', 'MPa', 1e4),
  val('e', 'ε', 'Engineering strain', undefined, 5),
  val('sT', 'σ_T', 'True stress', 'MPa', 1e5),
  val('eT', 'ε_T', 'True strain', undefined, 5),
];

const trueDemo = (() => {
  const s = symbolsOf(TRUE_VARS);
  return demo('g.he-stressStrain-true', 'True stress and true strain', {
    use: 'Use this for “At the UTS a bar carries 400 MPa at a strain of 0.10. What are the true stress and true strain?”',
    assumptions: [
      'Before necking the volume stays the same, so the area shrinks as the bar stretches.',
      'The curve is a sketch up to the page’s point at the UTS (no σ_Y or E given).',
    ],
    variables: TRUE_VARS,
    relations: [
      rel('σ_T = σ(1 + ε)', '{sT} = {s} × (1 + {e})', ['sT', 's', 'e'], (x) => x.sT! - x.s! * (1 + x.e!), {
        sT: [
          (x) => x.s! * (1 + x.e!),
          '{s} × (1 + {e})',
          'The true stress is the load over the shrunk area: σ times 1 + ε.',
        ],
        s: [(x) => x.sT! / (1 + x.e!), '{sT} ÷ (1 + {e})', 'Divide the true stress by 1 + ε.'],
        e: [(x) => x.sT! / x.s! - 1, '{sT} ÷ {s} − 1', 'Divide the stresses, then take away 1.'],
      }),
      rel('ε_T = ln(1 + ε)', '{eT} = ln(1 + {e})', ['eT', 'e'], (x) => x.eT! - Math.log(1 + x.e!), {
        eT: [
          (x) => (x.e! <= -1 ? undefined : Math.log(1 + x.e!)),
          'ln(1 + {e})',
          'True strain adds up each small stretch over the length it had then: ln of 1 + ε.',
        ],
        e: [(x) => Math.exp(x.eT!) - 1, 'e^({eT}) − 1', 'Undo the log: e to the true strain, less 1.'],
      }),
    ],
    example: { s: 400, e: 0.1, sT: 440, eT: Math.log(1.1) },
    startWith: ['s', 'e'],
    representation: {
      kind: 'stressStrain',
      curve: 'metal',
      uts: 's',
      uniform: 'e',
      true: true,
    },
  });
})();

// ─── Resilience (materials-science#3~resilience) ─────────────────────────────

const RES_VARS: VariableDef[] = [
  val('sy', 'σ_Y', 'Yield strength', 'MPa', 1e4, { min: 0.1 }),
  val('E', 'E', 'Elastic modulus', 'GPa', 1000, { min: 0.001 }),
  val('Ur', 'U_r', 'Modulus of resilience', 'MJ/m³', 1e4),
];

const resilienceDemo = demo('g.he-stressStrain-resilience', 'Modulus of resilience', {
  use: 'Use this for “A steel yields at 250 MPa with E = 200 GPa. How much energy per cubic meter can it store elastically?”',
  assumptions: [
    'Linear elastic up to σ_Y: the energy stored is the triangle under the line, ½σ_Yε_Y.',
    'MPa × strain is MJ/m³.',
  ],
  variables: RES_VARS,
  relations: [
    monomial(
      'U_r = σ_Y² ÷ 2E',
      'Ur',
      [['sy', 2]],
      [
        ['2000', 1],
        ['E', 1],
      ],
      'The triangle’s area, ½σ_Y × σ_Y ÷ E; × 1000 turns GPa into MPa.',
      symbolsOf(RES_VARS),
    ),
  ],
  example: { sy: 250, E: 200, Ur: 0.15625 },
  startWith: ['sy', 'E'],
  representation: {
    kind: 'stressStrain',
    curve: 'metal',
    E: 'E',
    yield: 'sy',
    area: 'resilience',
    energy: 'Ur',
  },
});

// ─── Toughness of an aluminum alloy, the full curve (an edge case) ──────────

const FULL_VARS: VariableDef[] = [
  val('E', 'E', 'Elastic modulus', 'GPa', 1000, { min: 0.001 }),
  val('sy', 'σ_Y', 'Yield strength', 'MPa', 1e4, { min: 0.1 }),
  val('su', 'UTS', 'Tensile strength', 'MPa', 1e4, { min: 0.1 }),
  val('ef', 'ε_f', 'Fracture strain', undefined, 2, { min: 0.001 }),
  val('UT', 'U_T', 'Toughness (estimate)', 'MJ/m³', 1e4),
];

const fullDemo = demo('g.he-stressStrain-full', 'Toughness from the stress–strain curve', {
  use: 'Use this for “An aluminum alloy yields at 276 MPa, reaches 310 MPa and breaks at a strain of 0.12. Estimate its toughness.”',
  assumptions: [
    'A ductile metal: the area under the curve is close to the mean of σ_Y and the UTS times ε_f.',
    'The inset zooms in near yield to show the 0.2% offset.',
  ],
  variables: FULL_VARS,
  relations: [
    below('sy', 'su', '{sy} < {su}', 'A metal hardens after yielding: σ_Y is below the UTS.'),
    {
      relation: {
        id: 'ε_f past yield',
        constraint: true,
        display: '{ef} > {sy} ÷ {E} + 0.002',
        vars: ['ef', 'sy', 'E'],
        residual: (x: Values) => (x.ef! > x.sy! / (1000 * x.E!) + 0.002 ? 0 : 1),
        solve: {},
        message: () => 'Fracture comes after yield: ε_f is more than σ_Y ÷ E + 0.002.',
      } as Relation,
      steps: {} as Steps,
    },
    rel(
      'U_T ≈ (σ_Y + UTS) ÷ 2 × ε_f',
      '{UT} = ({sy} + {su}) ÷ 2 × {ef}',
      ['UT', 'sy', 'su', 'ef'],
      (x) => x.UT! - ((x.sy! + x.su!) / 2) * x.ef!,
      {
        UT: [
          (x) => ((x.sy! + x.su!) / 2) * x.ef!,
          '({sy} + {su}) ÷ 2 × {ef}',
          'The mean of the yield strength and the UTS, times the strain at fracture.',
        ],
        ef: [
          (x) => (2 * x.UT!) / (x.sy! + x.su!),
          '2 × {UT} ÷ ({sy} + {su})',
          'Divide the toughness by the mean stress.',
        ],
        su: [
          (x) => (2 * x.UT!) / x.ef! - x.sy!,
          '2 × {UT} ÷ {ef} − {sy}',
          'Double the mean stress, then take away σ_Y.',
        ],
        sy: [
          (x) => (2 * x.UT!) / x.ef! - x.su!,
          '2 × {UT} ÷ {ef} − {su}',
          'Double the mean stress, then take away the UTS.',
        ],
      },
    ),
  ],
  example: { E: 69, sy: 276, su: 310, ef: 0.12, UT: 35.16 },
  startWith: ['E', 'sy', 'su', 'ef'],
  standalone: {
    vars: ['E'],
    why: 'E sets the elastic line the picture draws; the toughness estimate does not use it.',
  },
  representation: {
    kind: 'stressStrain',
    curve: 'metal',
    E: 'E',
    yield: 'sy',
    uts: 'su',
    fracture: 'ef',
    area: 'toughness',
    energy: 'UT',
  },
});

// ─── Elastic–perfectly plastic (advanced-solid-mechanics#3) ──────────────────

const EPP_VARS: VariableDef[] = [
  val('b', 'b', 'Width', 'mm', 5000, { min: 0.1 }),
  val('h', 'h', 'Depth', 'mm', 5000, { min: 0.1 }),
  val('sy', 'σ_Y', 'Yield strength', 'MPa', 1e4, { min: 0.1 }),
  val('S', 'S', 'Elastic section modulus', 'mm³', 1e12, { min: 0.001 }),
  val('Z', 'Z', 'Plastic section modulus', 'mm³', 1e12, { min: 0.001 }),
  val('MY', 'M_Y', 'Yield moment', 'kN·m', 1e7, { min: 0.001 }),
  val('Mp', 'M_p', 'Plastic moment', 'kN·m', 1e7, { min: 0.001 }),
  val('f', 'f', 'Shape factor', undefined, 10, { min: 0.01 }),
];

const eppDemo = (() => {
  const s = symbolsOf(EPP_VARS);
  return demo('g.he-stressStrain-epp', 'Yield and plastic moments of a rectangle', {
    use: 'Use this for “A 50 × 100 mm steel bar yields at 250 MPa. Find M_Y, M_p and the shape factor.”',
    assumptions: [
      'Elastic–perfectly plastic steel: σ = Eε up to σ_Y, then flat (E = 200 GPa).',
      'At M_p the whole section has yielded, half in tension and half in compression.',
    ],
    variables: EPP_VARS,
    relations: [
      monomial(
        'S = bh² ÷ 6',
        'S',
        [
          ['b', 1],
          ['h', 2],
        ],
        [['6', 1]],
        'A rectangle’s elastic section modulus.',
        s,
      ),
      monomial(
        'Z = bh² ÷ 4',
        'Z',
        [
          ['b', 1],
          ['h', 2],
        ],
        [['4', 1]],
        'Each half’s area bh ÷ 2 times the arm h ÷ 2 between their centers.',
        s,
      ),
      monomial(
        'M_Y = σ_Y S',
        'MY',
        [
          ['sy', 1],
          ['S', 1],
        ],
        [['1000000', 1]],
        'The edge just reaches σ_Y; ÷ 1,000,000 turns N·mm into kN·m.',
        s,
      ),
      monomial(
        'M_p = σ_Y Z',
        'Mp',
        [
          ['sy', 1],
          ['Z', 1],
        ],
        [['1000000', 1]],
        'Every fiber is at σ_Y; ÷ 1,000,000 turns N·mm into kN·m.',
        s,
      ),
      monomial(
        'f = M_p ÷ M_Y',
        'f',
        [['Mp', 1]],
        [['MY', 1]],
        'The shape factor: how much more moment full yielding carries.',
        s,
      ),
    ],
    example: {
      b: 50,
      h: 100,
      sy: 250,
      S: 250000 / 3,
      Z: 125000,
      MY: 62.5 / 3,
      Mp: 31.25,
      f: 1.5,
    },
    startWith: ['b', 'h', 'sy'],
    representation: { kind: 'stressStrain', curve: 'epp', E: 200000, yield: 'sy' },
  });
})();

// ─── A tendon in tension (biomechanics#0) ────────────────────────────────────

const TENDON_VARS: VariableDef[] = [
  val('F', 'F', 'Force', 'N', 1e5, { min: 0.001 }),
  val('A', 'A', 'Cross-section area', 'mm²', 5000, { min: 0.1 }),
  val('s', 'σ', 'Stress', 'MPa', 1e4),
  val('E', 'E', 'Modulus', 'GPa', 200, { min: 0.001 }),
  val('eps', 'ε', 'Strain', undefined, 0.5),
  val('L', 'L', 'Resting length', 'mm', 1000, { min: 1 }),
  val('dL', 'ΔL', 'Stretch', 'mm', 1000),
];

const tendon = (() => {
  const s = symbolsOf(TENDON_VARS);
  return demo('g.he-stressStrain-tendon', 'Stress, strain and stretch of a tendon', {
    use: 'Use this for “A tendon 50 mm long with a 50 mm² section carries 2000 N. With E = 1.2 GPa, how far does it stretch?”',
    assumptions: [
      'Past the toe region the tissue is linear elastic; ε counts from there.',
      'σ is engineering stress (the starting area); the load runs along the fibers.',
    ],
    variables: TENDON_VARS,
    relations: [
      monomial('σ = F ÷ A', 's', [['F', 1]], [['A', 1]], 'Stress is force over area (N/mm² is MPa).', s),
      monomial(
        'ε = σ ÷ E',
        'eps',
        [['s', 1]],
        [
          ['1000', 1],
          ['E', 1],
        ],
        'Strain is stress over modulus; × 1000 turns GPa into MPa.',
        s,
      ),
      monomial(
        'ΔL = εL',
        'dL',
        [
          ['eps', 1],
          ['L', 1],
        ],
        [],
        'The stretch is the strain times the resting length.',
        s,
      ),
    ],
    example: { F: 2000, A: 50, s: 40, E: 1.2, eps: 1 / 30, L: 50, dL: 5 / 3 },
    startWith: ['F', 'A', 'E', 'L'],
    representation: {
      kind: 'stressStrain',
      curve: 'tissue',
      E: 'E',
      strain: 'eps',
      stress: 's',
      drag: 'F',
      specimen: { F: 'F', A: 'A', L: 'L', dL: 'dL', tissue: true },
    },
  });
})();

// ─── A hollow bone in bending (biomechanics#0~bone-bending) ──────────────────

const BONE_VARS: VariableDef[] = [
  val('ro', 'r_o', 'Outer radius', 'mm', 50, { min: 1 }),
  val('ri', 'r_i', 'Inner radius', 'mm', 49),
  val('I', 'I', 'Second moment', 'mm⁴', 1e8),
  val('M', 'M', 'Bending moment', 'N·m', 1000),
  val('s', 'σ', 'Stress at the outer surface', 'MPa', 1e4),
  val('Is', 'I_solid', 'Second moment of a solid rod', 'mm⁴', 1e8),
];

const bone = (() => {
  const s = symbolsOf(BONE_VARS);
  return demo('g.he-stressStrain-bone', 'Bending stress in a hollow bone', {
    use: 'Use this for “A femur shaft is a tube 30 mm across with a 16 mm canal. What stress does 100 N·m of bending cause?”',
    assumptions: [
      'The shaft is a round tube; the stress is largest at the outer surface.',
      'Linear elastic bending: σ = My ÷ I, zero on the neutral axis.',
    ],
    variables: BONE_VARS,
    relations: [
      below('ri', 'ro', '{ri} < {ro}', 'The canal must be narrower than the bone: r_i < r_o.'),
      rel(
        'I = π(r_o⁴ − r_i⁴) ÷ 4',
        '{I} = π × ({ro}⁴ − {ri}⁴) ÷ 4',
        ['I', 'ro', 'ri'],
        (x) => x.I! - (Math.PI * (x.ro! ** 4 - x.ri! ** 4)) / 4,
        {
          I: [
            (x) => (Math.PI * (x.ro! ** 4 - x.ri! ** 4)) / 4,
            'π × ({ro}⁴ − {ri}⁴) ÷ 4',
            'A solid rod’s πr⁴ ÷ 4, less the canal’s.',
          ],
          ro: [
            (x) => ((4 * x.I!) / Math.PI + x.ri! ** 4) ** 0.25,
            '∜(4 × {I} ÷ π + {ri}⁴)',
            'Multiply by 4, divide by π, add r_i⁴, then take the fourth root.',
          ],
          ri: [
            (x) => {
              const q = x.ro! ** 4 - (4 * x.I!) / Math.PI;
              return q < 0 ? undefined : q ** 0.25;
            },
            '∜({ro}⁴ − 4 × {I} ÷ π)',
            'Take 4I ÷ π from r_o⁴, then the fourth root.',
          ],
        },
      ),
      monomial(
        'σ = Mr_o ÷ I',
        's',
        [
          ['1000', 1],
          ['M', 1],
          ['ro', 1],
        ],
        [['I', 1]],
        'Bending stress at the outer edge; × 1000 turns N·m into N·mm.',
        s,
      ),
      monomial(
        'I_solid = πr_o⁴ ÷ 4',
        'Is',
        [
          ['π', 1],
          ['ro', 4],
        ],
        [['4', 1]],
        'A solid rod as wide, for comparison.',
        s,
      ),
    ],
    example: {
      ro: 15,
      ri: 8,
      I: (Math.PI * (15 ** 4 - 8 ** 4)) / 4,
      M: 100,
      s: (100000 * 15) / ((Math.PI * (15 ** 4 - 8 ** 4)) / 4),
      Is: (Math.PI * 15 ** 4) / 4,
    },
    startWith: ['ro', 'ri', 'M'],
    representation: {
      kind: 'stressStrain',
      section: { shape: 'tube', ro: 'ro', ri: 'ri', I: 'I', M: 'M', stress: 's', solidI: 'Is' },
    },
  });
})();

// ─── An implant sharing load with bone (biomaterials#1) ──────────────────────

const IMPLANT_VARS: VariableDef[] = [
  val('Ei', 'E_i', 'Implant modulus', 'GPa', 1000, { min: 0.001 }),
  val('Ai', 'A_i', 'Implant area', 'mm²', 1e5, { min: 0.01 }),
  val('Eb', 'E_b', 'Bone modulus', 'GPa', 1000, { min: 0.001 }),
  val('Ab', 'A_b', 'Bone area', 'mm²', 1e5, { min: 0.01 }),
  val('F', 'F', 'Load', 'N', 1e6),
  val('share', 'share', 'Implant’s share of the load', '%', 100),
  val('sb', 'σ_b', 'Bone stress', 'MPa', 1e4),
];

const implant = demo('g.he-stressStrain-implant', 'Load sharing: stress shielding', {
  use: 'Use this for “A titanium stem (110 GPa, 100 mm²) is bonded to bone (18 GPa, 300 mm²). Under 2000 N, what stress does the bone carry?”',
  assumptions: [
    'Bonded, so implant and bone strain the same; each carries load in proportion to EA.',
    'The load is axial; each member’s stress is even across it.',
  ],
  variables: IMPLANT_VARS,
  relations: [
    rel(
      'share = E_iA_i ÷ (E_iA_i + E_bA_b)',
      '{share} = 100 × {Ei} × {Ai} ÷ ({Ei} × {Ai} + {Eb} × {Ab})',
      ['share', 'Ei', 'Ai', 'Eb', 'Ab'],
      (x) => x.share! - (100 * x.Ei! * x.Ai!) / (x.Ei! * x.Ai! + x.Eb! * x.Ab!),
      {
        share: [
          (x) => (100 * x.Ei! * x.Ai!) / (x.Ei! * x.Ai! + x.Eb! * x.Ab!),
          '100 × {Ei} × {Ai} ÷ ({Ei} × {Ai} + {Eb} × {Ab})',
          'The implant’s stiffness EA over the two together, as a percent.',
        ],
        Ab: [
          (x) =>
            x.share! <= 0 ? undefined : (x.Ei! * x.Ai! * (100 / x.share! - 1)) / x.Eb!,
          '{Ei} × {Ai} × (100 ÷ {share} − 1) ÷ {Eb}',
          'The bone’s EA is the implant’s times (100 ÷ share − 1); divide by E_b.',
        ],
        Ai: [
          (x) =>
            x.share! >= 100 ? undefined : (x.Eb! * x.Ab!) / (x.Ei! * (100 / x.share! - 1)),
          '{Eb} × {Ab} ÷ ({Ei} × (100 ÷ {share} − 1))',
          'The implant’s EA is the bone’s divided by (100 ÷ share − 1); divide by E_i.',
        ],
      },
    ),
    rel(
      'σ_b = F(1 − share) ÷ A_b',
      '{sb} = {F} × (1 − {share} ÷ 100) ÷ {Ab}',
      ['sb', 'F', 'share', 'Ab'],
      (x) => x.sb! - (x.F! * (1 - x.share! / 100)) / x.Ab!,
      {
        sb: [
          (x) => (x.F! * (1 - x.share! / 100)) / x.Ab!,
          '{F} × (1 − {share} ÷ 100) ÷ {Ab}',
          'The bone carries what the implant doesn’t, over its own area.',
        ],
        F: [
          (x) => (x.share! >= 100 ? undefined : (x.sb! * x.Ab!) / (1 - x.share! / 100)),
          '{sb} × {Ab} ÷ (1 − {share} ÷ 100)',
          'The bone’s force σ_bA_b is its share of F; divide by that share.',
        ],
      },
    ),
  ],
  example: {
    Ei: 110,
    Ai: 100,
    Eb: 18,
    Ab: 300,
    F: 2000,
    share: (100 * 11000) / 16400,
    sb: (2000 * (1 - 11000 / 16400)) / 300,
  },
  startWith: ['Ei', 'Ai', 'Eb', 'Ab', 'F'],
  representation: {
    kind: 'stressStrain',
    parallel: {
      E1: 'Ei',
      A1: 'Ai',
      E2: 'Eb',
      A2: 'Ab',
      F: 'F',
      share: 'share',
      stress2: 'sb',
      names: ['Implant', 'Bone'],
    },
  },
});

export const HE2J_GALLERY_MODULES: ModuleDef[] = [
  rod,
  tensile,
  trueDemo,
  resilienceDemo,
  fullDemo,
  eppDemo,
  tendon,
  bone,
  implant,
];

export const HE2J_GALLERY_LAYOUTS: LayoutDef[] = [];
