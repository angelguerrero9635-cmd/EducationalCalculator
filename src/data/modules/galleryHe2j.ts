/**
 * College gallery demos, round 2, group J (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC28 `stressStrain` (ME-P5 in docs/plans/he.mechanical.md, B-P23 in docs/plans/he.biology.md):
 * the σ–ε curve, a specimen, a bone's section in bending and an implant sharing load with bone.
 *
 * HC33 `stressElement` (ME-P4 in he.mechanical.md, ACC-P18 in he.aero-civil-chemical.md): the
 * element and Mohr's circle, three circles, failure loci, a soil's Mohr–Coulomb line.
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
  return demo('g.he-stressStrain-true', 'True stress and true strain', {
    use: 'Use this for “At the UTS a bar carries 400 MPa at a strain of 0.10. What are the true stress and true strain?”',
    assumptions: [
      'Before necking the volume stays the same, so the area shrinks as the bar stretches.',
      'The curve is a sketch up to the page’s point at the UTS (no σ_Y or E given).',
    ],
    variables: TRUE_VARS,
    relations: [
      rel(
        'σ_T = σ(1 + ε)',
        '{sT} = {s} × (1 + {e})',
        ['sT', 's', 'e'],
        (x) => x.sT! - x.s! * (1 + x.e!),
        {
          sT: [
            (x) => x.s! * (1 + x.e!),
            '{s} × (1 + {e})',
            'The true stress is the load over the shrunk area: σ times 1 + ε.',
          ],
          s: [(x) => x.sT! / (1 + x.e!), '{sT} ÷ (1 + {e})', 'Divide the true stress by 1 + ε.'],
          e: [(x) => x.sT! / x.s! - 1, '{sT} ÷ {s} − 1', 'Divide the stresses, then take away 1.'],
        },
      ),
      rel('ε_T = ln(1 + ε)', '{eT} = ln(1 + {e})', ['eT', 'e'], (x) => x.eT! - Math.log(1 + x.e!), {
        eT: [
          (x) => (x.e! <= -1 ? undefined : Math.log(1 + x.e!)),
          'ln(1 + {e})',
          'True strain adds up each small stretch over the length it had then: ln of 1 + ε.',
        ],
        e: [
          (x) => Math.exp(x.eT!) - 1,
          'e^({eT}) − 1',
          'Undo the log: e to the true strain, less 1.',
        ],
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
      monomial(
        'σ = F ÷ A',
        's',
        [['F', 1]],
        [['A', 1]],
        'Stress is force over area (N/mm² is MPa).',
        s,
      ),
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
          (x) => (x.share! <= 0 ? undefined : (x.Ei! * x.Ai! * (100 / x.share! - 1)) / x.Eb!),
          '{Ei} × {Ai} × (100 ÷ {share} − 1) ÷ {Eb}',
          'The bone’s EA is the implant’s times (100 ÷ share − 1); divide by E_b.',
        ],
        Ai: [
          (x) => (x.share! >= 100 ? undefined : (x.Eb! * x.Ab!) / (x.Ei! * (100 / x.share! - 1))),
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

// ─── HC33 stressElement: plane stress and Mohr's circle (mechanics-of-materials#0~mohr) ──

/** A stress: MPa (or kPa), either sign. */
const stress = (
  id: string,
  symbol: string,
  name: string,
  unit = 'MPa',
  more: Partial<VariableDef> = {},
) => val(id, symbol, name, unit, 1e4, { min: -1e4, ...more });

const MOHR_VARS: VariableDef[] = [
  stress('sx', 'σₓ', 'Normal stress on x'),
  stress('sy', 'σ_y', 'Normal stress on y'),
  stress('txy', 'τₓ_y', 'Shear stress'),
  stress('savg', 'σ_avg', 'Center of the circle'),
  val('R', 'R', 'Radius of the circle', 'MPa', 1e4),
  stress('s1', 'σ₁', 'Larger principal stress'),
  stress('s2', 'σ₂', 'Smaller principal stress'),
  val('thp', 'θ_p', 'Principal angle', '°', 45, { min: -45 }),
  val('tmax', 'τ_max', 'Largest in-plane shear', 'MPa', 1e4),
];

const C_OF = (x: Values) => (x.sx! + x.sy!) / 2;
const R_OF = (x: Values) => Math.hypot((x.sx! - x.sy!) / 2, x.txy!);

function mohrDemo(id: string, use: string, sx: number, sy: number, txy: number) {
  const C = (sx + sy) / 2;
  const R = Math.hypot((sx - sy) / 2, txy);
  return demo(id, 'Principal stresses and Mohr’s circle', {
    use,
    assumptions: [
      'Plane stress: nothing acts on the z faces. Tension +; τₓ_y + up on the right face.',
      'θ_p is counterclockwise from x; the circle plots τ positive down, so it turns the same way.',
    ],
    variables: MOHR_VARS,
    relations: [
      rel(
        'σ_avg = (σₓ + σ_y) ÷ 2',
        '{savg} = ({sx} + {sy}) ÷ 2',
        ['savg', 'sx', 'sy'],
        (x) => x.savg! - C_OF(x),
        {
          savg: [
            C_OF,
            '({sx} + {sy}) ÷ 2',
            'The circle’s center is the mean of the two normal stresses.',
          ],
          sx: [(x) => 2 * x.savg! - x.sy!, '2 × {savg} − {sy}', 'Double the mean, take away σ_y.'],
          sy: [(x) => 2 * x.savg! - x.sx!, '2 × {savg} − {sx}', 'Double the mean, take away σₓ.'],
        },
      ),
      rel(
        'R = √(((σₓ − σ_y) ÷ 2)² + τₓ_y²)',
        '{R} = √((({sx} − {sy}) ÷ 2)² + {txy}²)',
        ['R', 'sx', 'sy', 'txy'],
        (x) => x.R! - R_OF(x),
        {
          R: [
            R_OF,
            '√((({sx} − {sy}) ÷ 2)² + {txy}²)',
            'The radius reaches from the center to X: half the difference across, τₓ_y down.',
          ],
        },
      ),
      rel(
        'σ₁ = σ_avg + R',
        '{s1} = {savg} + {R}',
        ['s1', 'savg', 'R'],
        (x) => x.s1! - x.savg! - x.R!,
        {
          s1: [(x) => x.savg! + x.R!, '{savg} + {R}', 'The circle’s right end on the σ axis.'],
          savg: [(x) => x.s1! - x.R!, '{s1} − {R}', 'Back from σ₁ by the radius.'],
          R: [(x) => x.s1! - x.savg!, '{s1} − {savg}', 'From the center out to σ₁.'],
        },
      ),
      rel(
        'σ₂ = σ_avg − R',
        '{s2} = {savg} − {R}',
        ['s2', 'savg', 'R'],
        (x) => x.s2! - x.savg! + x.R!,
        {
          s2: [(x) => x.savg! - x.R!, '{savg} − {R}', 'The circle’s left end on the σ axis.'],
          savg: [(x) => x.s2! + x.R!, '{s2} + {R}', 'On from σ₂ by the radius.'],
          R: [(x) => x.savg! - x.s2!, '{savg} − {s2}', 'From σ₂ in to the center.'],
        },
      ),
      rel(
        'tan 2θ_p = 2τₓ_y ÷ (σₓ − σ_y)',
        '{thp} = 0.5 × tan⁻¹(2 × {txy} ÷ ({sx} − {sy}))',
        ['thp', 'txy', 'sx', 'sy'],
        (x) =>
          x.sx! === x.sy!
            ? Math.abs(Math.abs(x.thp!) - 45)
            : Math.tan((2 * x.thp! * Math.PI) / 180) - (2 * x.txy!) / (x.sx! - x.sy!),
        {
          thp: [
            (x) =>
              x.sx! === x.sy!
                ? undefined
                : (Math.atan((2 * x.txy!) / (x.sx! - x.sy!)) * 90) / Math.PI,
            '0.5 × tan⁻¹(2 × {txy} ÷ ({sx} − {sy}))',
            'The angle on the circle from X to the σ axis is 2θ_p; halve it for the element.',
          ],
        },
      ),
      rel('τ_max = R', '{tmax} = {R}', ['tmax', 'R'], (x) => x.tmax! - x.R!, {
        tmax: [
          (x) => x.R!,
          '{R}',
          'The top of the circle: the largest in-plane shear is the radius.',
        ],
        R: [(x) => x.tmax!, '{tmax}', 'The radius is the largest shear.'],
      }),
    ],
    example: {
      sx,
      sy,
      txy,
      savg: C,
      R,
      s1: C + R,
      s2: C - R,
      thp: (Math.atan((2 * txy) / (sx - sy)) * 90) / Math.PI,
      tmax: R,
    },
    startWith: ['sx', 'sy', 'txy'],
    representation: {
      kind: 'stressElement',
      sx: 'sx',
      sy: 'sy',
      txy: 'txy',
      savg: 'savg',
      R: 'R',
      s1: 's1',
      s2: 's2',
      angle: 'thp',
      tmax: 'tmax',
    },
  });
}

const mohrMain = mohrDemo(
  'g.he-stressElement-mohr',
  'Use this for “A point carries σₓ = 80 MPa, σ_y = −20 MPa and τₓ_y = 40 MPa. Find the principal stresses and θ_p.”',
  80,
  -20,
  40,
);
const mohrTurned = mohrDemo(
  'g.he-stressElement-mohr-flip',
  'Use this for “σₓ = −40 MPa, σ_y = 60 MPa, τₓ_y = −30 MPa. Find σ₁, σ₂ and the angle to the principal planes.”',
  -40,
  60,
  -30,
);

// ─── Three circles (advanced-solid-mechanics#0) ──────────────────────────────

const inPlane = (sign: 1 | -1) => (x: Values) => C_OF(x) + sign * R_OF(x);

const THREE_VARS: VariableDef[] = [
  stress('sx', 'σₓ', 'Normal stress on x'),
  stress('sy', 'σ_y', 'Normal stress on y'),
  stress('sz', 'σ_z', 'Normal stress on z (principal)'),
  stress('txy', 'τₓ_y', 'Shear stress in the xy plane'),
  stress('s1', 'σ₁', 'Larger in-plane principal'),
  stress('s2', 'σ₂', 'Smaller in-plane principal'),
  val('tmax', 'τ_max', 'Largest shear stress', 'MPa', 1e4),
];

const threeDemo = demo('g.he-stressElement-three', 'Three Mohr circles and the largest shear', {
  use: 'Use this for “σₓ = 60, σ_y = 20, σ_z = −30 and τₓ_y = 15 MPa, with no other shear. Find the principal stresses and τ_max.”',
  assumptions: [
    'τ_yz = τ_zx = 0, so σ_z is a principal stress; the other two come from the xy circle.',
    'Here σ_z is the smallest, so σ₃ = σ_z and τ_max = (σ₁ − σ₃) ÷ 2.',
  ],
  variables: THREE_VARS,
  relations: [
    below('s2', 's1', '{s2} < {s1}', 'σ₁ is the larger in-plane principal: σ₂ < σ₁.'),
    below('sz', 's2', '{sz} < {s2}', 'This page takes σ_z as the smallest principal: σ_z < σ₂.'),
    rel(
      'σ₁ = σ_avg + R',
      '{s1} = ({sx} + {sy}) ÷ 2 + √((({sx} − {sy}) ÷ 2)² + {txy}²)',
      ['s1', 'sx', 'sy', 'txy'],
      (x) => x.s1! - inPlane(1)(x),
      {
        s1: [
          inPlane(1),
          '({sx} + {sy}) ÷ 2 + √((({sx} − {sy}) ÷ 2)² + {txy}²)',
          'The in-plane circle’s center plus its radius.',
        ],
      },
    ),
    rel(
      'σ₂ = σ_avg − R',
      '{s2} = ({sx} + {sy}) ÷ 2 − √((({sx} − {sy}) ÷ 2)² + {txy}²)',
      ['s2', 'sx', 'sy', 'txy'],
      (x) => x.s2! - inPlane(-1)(x),
      {
        s2: [
          inPlane(-1),
          '({sx} + {sy}) ÷ 2 − √((({sx} − {sy}) ÷ 2)² + {txy}²)',
          'The in-plane circle’s center less its radius.',
        ],
      },
    ),
    rel(
      'τ_max = (σ₁ − σ₃) ÷ 2',
      '{tmax} = ({s1} − {sz}) ÷ 2',
      ['tmax', 's1', 'sz'],
      (x) => x.tmax! - (x.s1! - x.sz!) / 2,
      {
        tmax: [
          (x) => (x.s1! - x.sz!) / 2,
          '({s1} − {sz}) ÷ 2',
          'The radius of the biggest circle, from σ₃ to σ₁.',
        ],
        sz: [(x) => x.s1! - 2 * x.tmax!, '{s1} − 2 × {tmax}', 'σ₃ sits a diameter left of σ₁.'],
      },
    ),
  ],
  example: { sx: 60, sy: 20, sz: -30, txy: 15, s1: 65, s2: 15, tmax: 47.5 },
  startWith: ['sx', 'sy', 'sz', 'txy'],
  representation: {
    kind: 'stressElement',
    three: true,
    s1: 's1',
    s2: 's2',
    s3: 'sz',
    tmax: 'tmax',
  },
});

// ─── Von Mises and Tresca from three principals (advanced-solid-mechanics#3~yield) ──

const YIELD_VARS: VariableDef[] = [
  stress('s1', 'σ₁', 'Largest principal stress'),
  stress('s2', 'σ₂', 'Middle principal stress'),
  stress('s3', 'σ₃', 'Smallest principal stress'),
  val('sy', 'σ_Y', 'Yield strength', 'MPa', 1e4, { min: 0.1 }),
  val('svm', 'σ_vm', 'Von Mises stress', 'MPa', 1e5),
  val('str', 'σ_Tresca', 'Tresca stress, σ₁ − σ₃', 'MPa', 1e5),
  val('nvm', 'n_vm', 'Safety factor, von Mises', undefined, 1e6, { min: 0.0001 }),
  val('nT', 'n_T', 'Safety factor, Tresca', undefined, 1e6, { min: 0.0001 }),
];

const vm3 = (x: Values) =>
  Math.sqrt(((x.s1! - x.s2!) ** 2 + (x.s2! - x.s3!) ** 2 + (x.s3! - x.s1!) ** 2) / 2);

const yieldDemo = (() => {
  const s = symbolsOf(YIELD_VARS);
  return demo('g.he-stressElement-yield', 'Von Mises and Tresca from three principal stresses', {
    use: 'Use this for “The principal stresses are 65, 15 and −30 MPa in steel that yields at 250 MPa. Find σ_vm, σ₁ − σ₃ and both safety factors.”',
    assumptions: [
      'σ₁ ≥ σ₂ ≥ σ₃. The material yields when σ_vm, or σ₁ − σ₃ for Tresca, reaches σ_Y.',
      'Tresca in Mohr’s terms: the biggest circle touches τ = σ_Y ÷ 2.',
    ],
    variables: YIELD_VARS,
    relations: [
      below('s2', 's1', '{s2} < {s1}', 'Number the principals from the largest: σ₂ < σ₁.'),
      below('s3', 's2', '{s3} < {s2}', 'Number the principals from the largest: σ₃ < σ₂.'),
      rel(
        'σ_vm = √(½ Σ(σᵢ − σⱼ)²)',
        '{svm} = √((({s1} − {s2})² + ({s2} − {s3})² + ({s3} − {s1})²) ÷ 2)',
        ['svm', 's1', 's2', 's3'],
        (x) => x.svm! - vm3(x),
        {
          svm: [
            vm3,
            '√((({s1} − {s2})² + ({s2} − {s3})² + ({s3} − {s1})²) ÷ 2)',
            'Square the three differences, add, halve, then take the root.',
          ],
        },
      ),
      rel(
        'σ_Tresca = σ₁ − σ₃',
        '{str} = {s1} − {s3}',
        ['str', 's1', 's3'],
        (x) => x.str! - (x.s1! - x.s3!),
        {
          str: [(x) => x.s1! - x.s3!, '{s1} − {s3}', 'The biggest circle’s diameter.'],
          s1: [(x) => x.str! + x.s3!, '{str} + {s3}', 'Add σ₃ back.'],
          s3: [(x) => x.s1! - x.str!, '{s1} − {str}', 'Take the diameter off σ₁.'],
        },
      ),
      monomial(
        'n_vm = σ_Y ÷ σ_vm',
        'nvm',
        [['sy', 1]],
        [['svm', 1]],
        'How many times σ_vm fits under σ_Y.',
        s,
      ),
      monomial(
        'n_T = σ_Y ÷ (σ₁ − σ₃)',
        'nT',
        [['sy', 1]],
        [['str', 1]],
        'How many times σ₁ − σ₃ fits under σ_Y.',
        s,
      ),
    ],
    example: {
      s1: 65,
      s2: 15,
      s3: -30,
      sy: 250,
      svm: Math.sqrt(6775),
      str: 95,
      nvm: 250 / Math.sqrt(6775),
      nT: 250 / 95,
    },
    startWith: ['s1', 's2', 's3', 'sy'],
    representation: {
      kind: 'stressElement',
      three: true,
      s1: 's1',
      s2: 's2',
      s3: 's3',
      strength: 'sy',
    },
  });
})();

// ─── Failure theories: von Mises and Tresca envelopes (machine-design#0) ─────

const ENV_VARS: VariableDef[] = [
  stress('sx', 'σₓ', 'Normal stress on x'),
  stress('sy', 'σ_y', 'Normal stress on y'),
  stress('txy', 'τₓ_y', 'Shear stress'),
  val('svm', 'σ′', 'Von Mises stress', 'MPa', 1e5),
  val('Sy', 'S_y', 'Yield strength', 'MPa', 1e4, { min: 0.1 }),
  val('n', 'n', 'Safety factor, von Mises', undefined, 1e6, { min: 0.0001 }),
  val('s1', 'σ₁', 'Larger principal stress', 'MPa', 1e4, { min: 0.001 }),
  val('s2', 'σ₂', 'Smaller principal stress', 'MPa', -0.001, { min: -1e4 }),
  val('tmax', 'τ_max', 'Largest shear stress', 'MPa', 1e4, { min: 0.001 }),
  val('nT', 'n_T', 'Safety factor, Tresca', undefined, 1e6, { min: 0.0001 }),
];

const sPrime = (x: Values) => Math.sqrt(x.sx! ** 2 - x.sx! * x.sy! + x.sy! ** 2 + 3 * x.txy! ** 2);

const envelopeDemo = (() => {
  const s = symbolsOf(ENV_VARS);
  return demo('g.he-stressElement-envelope', 'Factor of safety by von Mises and Tresca', {
    use: 'Use this for “A shaft point has σₓ = 120 MPa, σ_y = −40 MPa, τₓ_y = 50 MPa; S_y = 350 MPa. Find n by von Mises and by Tresca.”',
    assumptions: [
      'Plane stress (σ₃ = 0); a ductile material, the same strength in tension and compression.',
      'Here σ₁ > 0 > σ₂, so τ_max = (σ₁ − σ₂) ÷ 2.',
    ],
    variables: ENV_VARS,
    relations: [
      rel(
        'σ′ = √(σₓ² − σₓσ_y + σ_y² + 3τₓ_y²)',
        '{svm} = √({sx}² − {sx} × {sy} + {sy}² + 3 × {txy}²)',
        ['svm', 'sx', 'sy', 'txy'],
        (x) => x.svm! - sPrime(x),
        {
          svm: [
            sPrime,
            '√({sx}² − {sx} × {sy} + {sy}² + 3 × {txy}²)',
            'Von Mises for plane stress, straight from σₓ, σ_y and τₓ_y.',
          ],
        },
      ),
      rel(
        'σ′ = √(σ₁² − σ₁σ₂ + σ₂²)',
        '{svm} = √({s1}² − {s1} × {s2} + {s2}²)',
        ['svm', 's1', 's2'],
        (x) => x.svm! - Math.sqrt(x.s1! ** 2 - x.s1! * x.s2! + x.s2! ** 2),
        {
          svm: [
            (x) => Math.sqrt(x.s1! ** 2 - x.s1! * x.s2! + x.s2! ** 2),
            '√({s1}² − {s1} × {s2} + {s2}²)',
            'The same σ′ from the principal stresses: the ellipse’s own form.',
          ],
        },
      ),
      monomial(
        'n = S_y ÷ σ′',
        'n',
        [['Sy', 1]],
        [['svm', 1]],
        'How many times σ′ fits under S_y.',
        s,
      ),
      rel(
        'σ₁ = σ_avg + R',
        '{s1} = ({sx} + {sy}) ÷ 2 + √((({sx} − {sy}) ÷ 2)² + {txy}²)',
        ['s1', 'sx', 'sy', 'txy'],
        (x) => x.s1! - inPlane(1)(x),
        {
          s1: [
            inPlane(1),
            '({sx} + {sy}) ÷ 2 + √((({sx} − {sy}) ÷ 2)² + {txy}²)',
            'Center plus radius.',
          ],
        },
      ),
      rel(
        'σ₂ = σ_avg − R',
        '{s2} = ({sx} + {sy}) ÷ 2 − √((({sx} − {sy}) ÷ 2)² + {txy}²)',
        ['s2', 'sx', 'sy', 'txy'],
        (x) => x.s2! - inPlane(-1)(x),
        {
          s2: [
            inPlane(-1),
            '({sx} + {sy}) ÷ 2 − √((({sx} − {sy}) ÷ 2)² + {txy}²)',
            'Center less radius.',
          ],
        },
      ),
      rel(
        'τ_max = (σ₁ − σ₂) ÷ 2',
        '{tmax} = ({s1} − {s2}) ÷ 2',
        ['tmax', 's1', 's2'],
        (x) => x.tmax! - (x.s1! - x.s2!) / 2,
        {
          tmax: [
            (x) => (x.s1! - x.s2!) / 2,
            '({s1} − {s2}) ÷ 2',
            'With σ₃ = 0 between them, the biggest circle runs from σ₂ to σ₁.',
          ],
        },
      ),
      monomial(
        'n_T = S_y ÷ 2τ_max',
        'nT',
        [['Sy', 1]],
        [
          ['2', 1],
          ['tmax', 1],
        ],
        'Tresca: yield when τ_max reaches S_y ÷ 2.',
        s,
      ),
    ],
    example: {
      sx: 120,
      sy: -40,
      txy: 50,
      svm: Math.sqrt(28300),
      Sy: 350,
      n: 350 / Math.sqrt(28300),
      s1: 40 + Math.sqrt(8900),
      s2: 40 - Math.sqrt(8900),
      tmax: Math.sqrt(8900),
      nT: 350 / (2 * Math.sqrt(8900)),
    },
    startWith: ['sx', 'sy', 'txy', 'Sy'],
    representation: {
      kind: 'stressElement',
      sx: 'sx',
      sy: 'sy',
      txy: 'txy',
      s1: 's1',
      s2: 's2',
      envelope: ['vonMises', 'tresca'],
      strength: 'Sy',
      n: ['n', 'nT'],
    },
  });
})();

// ─── A brittle material: Coulomb–Mohr (machine-design#0~brittle) ─────────────

const BRITTLE_VARS: VariableDef[] = [
  val('Sut', 'S_ut', 'Tensile strength', 'MPa', 1e4, { min: 0.1 }),
  val('Suc', 'S_uc', 'Compressive strength', 'MPa', 1e4, { min: 0.1 }),
  val('s1', 'σ₁', 'Tensile principal stress', 'MPa', 1e4, { min: 0.001 }),
  val('s3', 'σ₃', 'Compressive principal stress', 'MPa', -0.001, { min: -1e4 }),
  val('n', 'n', 'Safety factor', undefined, 1e6, { min: 0.0001 }),
];

const cm = (x: Values) => 1 / (x.s1! / x.Sut! - x.s3! / x.Suc!);

const brittleDemo = demo('g.he-stressElement-brittle', 'Brittle failure: Coulomb–Mohr', {
  use: 'Use this for “Cast iron with S_ut = 200 MPa and S_uc = 750 MPa carries σ₁ = 60 MPa and σ₃ = −90 MPa. Find n.”',
  assumptions: [
    'Plane stress with σ₂ = 0 between the two: the load sits in the fourth quadrant.',
    'Brittle: weaker in tension than compression, so the locus is lopsided.',
  ],
  variables: BRITTLE_VARS,
  relations: [
    rel(
      'σ₁ ÷ S_ut − σ₃ ÷ S_uc = 1 ÷ n',
      '{n} = 1 ÷ ({s1} ÷ {Sut} − {s3} ÷ {Suc})',
      ['n', 's1', 'Sut', 's3', 'Suc'],
      (x) => x.n! - cm(x),
      {
        n: [
          cm,
          '1 ÷ ({s1} ÷ {Sut} − {s3} ÷ {Suc})',
          'Each stress over its own strength, added (σ₃ is negative), then turned over.',
        ],
        s1: [
          (x) => x.Sut! * (1 / x.n! + x.s3! / x.Suc!),
          '{Sut} × (1 ÷ {n} + {s3} ÷ {Suc})',
          'Move the σ₃ term across, then multiply by S_ut.',
        ],
      },
    ),
  ],
  example: { Sut: 200, Suc: 750, s1: 60, s3: -90, n: 1 / 0.42 },
  startWith: ['Sut', 'Suc', 's1', 's3'],
  representation: {
    kind: 'stressElement',
    envelope: 'coulombMohr',
    strength: 'Sut',
    strengthC: 'Suc',
    point: ['s1', 's3'],
    s1: 's1',
    s3: 's3',
    n: 'n',
  },
});

// ─── A soil's triaxial test (soil-mechanics#3) ───────────────────────────────

const SOIL_VARS: VariableDef[] = [
  val('c', 'c′', 'Cohesion', 'kPa', 1000, { min: 0.001 }),
  val('phi', 'φ′', 'Friction angle', '°', 50, { min: 0.1 }),
  val('s3', 'σ′₃', 'Cell pressure (minor)', 'kPa', 1e4, { min: 0.001 }),
  val('s1', 'σ′₁', 'Major stress at failure', 'kPa', 1e5, { min: 0.001 }),
  val('dev', 'Δσ', 'Deviator stress', 'kPa', 1e5, { min: 0.001 }),
  val('theta', 'θ', 'Failure plane angle', '°', 90, { min: 45 }),
];

const tanT = (x: Values) => Math.tan((x.theta! * Math.PI) / 180);

const soilDemo = demo('g.he-stressElement-soil', 'Triaxial test: failure stress and plane', {
  use: 'Use this for “A sand with c′ = 10 kPa and φ′ = 30° is tested at σ′₃ = 100 kPa. Find σ′₁ at failure and the failure plane’s angle.”',
  assumptions: [
    'Mohr–Coulomb failure; drained, so effective stresses.',
    'θ is measured from the major principal plane (horizontal in the test).',
  ],
  variables: SOIL_VARS,
  relations: [
    rel(
      'θ = 45° + φ′ ÷ 2',
      '{theta} = 45 + {phi} ÷ 2',
      ['theta', 'phi'],
      (x) => x.theta! - 45 - x.phi! / 2,
      {
        theta: [
          (x) => 45 + x.phi! / 2,
          '45 + {phi} ÷ 2',
          'The plane where the circle touches the line, halfway from 2θ = 90° + φ′.',
        ],
        phi: [(x) => 2 * (x.theta! - 45), '2 × ({theta} − 45)', 'Undo: take off 45°, then double.'],
      },
    ),
    rel(
      'σ′₁ = σ′₃ tan²θ + 2c′ tan θ',
      '{s1} = {s3} × tan({theta}°) × tan({theta}°) + 2 × {c} × tan({theta}°)',
      ['s1', 's3', 'theta', 'c'],
      (x) => x.s1! - (x.s3! * tanT(x) ** 2 + 2 * x.c! * tanT(x)),
      {
        s1: [
          (x) => x.s3! * tanT(x) ** 2 + 2 * x.c! * tanT(x),
          '{s3} × tan({theta}°) × tan({theta}°) + 2 × {c} × tan({theta}°)',
          'The largest circle the line allows: σ′₃ grown by tan²θ, plus cohesion’s part.',
        ],
        s3: [
          (x) => (x.s1! - 2 * x.c! * tanT(x)) / tanT(x) ** 2,
          '({s1} − 2 × {c} × tan({theta}°)) ÷ (tan({theta}°) × tan({theta}°))',
          'Take off cohesion’s part, then divide by tan²θ.',
        ],
        c: [
          (x) => (x.s1! - x.s3! * tanT(x) ** 2) / (2 * tanT(x)),
          '({s1} − {s3} × tan({theta}°) × tan({theta}°)) ÷ (2 × tan({theta}°))',
          'Take off the friction part, then divide by 2 tan θ.',
        ],
      },
    ),
    rel(
      'Δσ = σ′₁ − σ′₃',
      '{dev} = {s1} − {s3}',
      ['dev', 's1', 's3'],
      (x) => x.dev! - (x.s1! - x.s3!),
      {
        dev: [
          (x) => x.s1! - x.s3!,
          '{s1} − {s3}',
          'The extra vertical stress the piston adds at failure.',
        ],
        s1: [(x) => x.s3! + x.dev!, '{s3} + {dev}', 'The cell pressure plus the deviator.'],
        s3: [(x) => x.s1! - x.dev!, '{s1} − {dev}', 'Take the deviator off σ′₁.'],
      },
    ),
  ],
  example: {
    c: 10,
    phi: 30,
    s3: 100,
    s1: 300 + 20 * Math.sqrt(3),
    dev: 200 + 20 * Math.sqrt(3),
    theta: 60,
  },
  startWith: ['c', 'phi', 's3'],
  representation: {
    kind: 'stressElement',
    s1: 's1',
    s3: 's3',
    mohrCoulomb: { c: 'c', phi: 'phi', theta: 'theta' },
  },
});

// ─── An undrained test (soil-mechanics#3~undrained) ─────────────────────────

const UU_VARS: VariableDef[] = [
  val('s3', 'σ₃', 'Cell pressure', 'kPa', 1e4, { min: 0.001 }),
  val('s1', 'σ₁', 'Major stress at failure', 'kPa', 1e5, { min: 0.001 }),
  val('su', 's_u', 'Undrained shear strength', 'kPa', 1e5, { min: 0.0005 }),
];

const undrainedDemo = demo('g.he-stressElement-undrained', 'Undrained shear strength', {
  use: 'Use this for “A clay fails in a UU test at σ₁ = 180 kPa with a cell pressure of 60 kPa. What is s_u?”',
  assumptions: [
    'Undrained (φ = 0): every circle at failure has the same radius, so the line is flat at s_u.',
  ],
  variables: UU_VARS,
  relations: [
    below('s3', 's1', '{s3} < {s1}', 'The major stress is the larger: σ₃ < σ₁.'),
    rel(
      's_u = (σ₁ − σ₃) ÷ 2',
      '{su} = ({s1} − {s3}) ÷ 2',
      ['su', 's1', 's3'],
      (x) => x.su! - (x.s1! - x.s3!) / 2,
      {
        su: [
          (x) => (x.s1! - x.s3!) / 2,
          '({s1} − {s3}) ÷ 2',
          'The circle’s radius: half the deviator stress.',
        ],
        s1: [(x) => x.s3! + 2 * x.su!, '{s3} + 2 × {su}', 'A diameter, 2s_u, right of σ₃.'],
        s3: [(x) => x.s1! - 2 * x.su!, '{s1} − 2 × {su}', 'A diameter, 2s_u, left of σ₁.'],
      },
    ),
  ],
  example: { s3: 60, s1: 180, su: 60 },
  startWith: ['s3', 's1'],
  representation: { kind: 'stressElement', s1: 's1', s3: 's3', mohrCoulomb: { c: 'su', phi: 0 } },
});

export const HE2J_GALLERY_MODULES: ModuleDef[] = [
  mohrMain,
  mohrTurned,
  threeDemo,
  yieldDemo,
  envelopeDemo,
  brittleDemo,
  soilDemo,
  undrainedDemo,
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
