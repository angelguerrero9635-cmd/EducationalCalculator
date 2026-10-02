/**
 * College gallery demos, round 1, group I (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC8: `phaseEnvelope` (Pxy, Txy, xy; ACC-P30) and the one-component `substance` option of
 * `chemDiagram` mode `phase` (C-P8).
 */
import {
  antoineP,
  bubbleP,
  bubbleT,
  dewP,
  distillationStairs,
  fenske,
  kremser,
  margules,
  minLiquid,
  minReflux,
  rectifying,
  tieAt,
  type Antoine,
} from '@/components/module/reps/phaseEnvelopeMath';
import type { Relation, VariableDef, Values } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

/** A relation and its step text, built together so a demo lists both from one place. */
interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

const rules = (...rs: Rule[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

const div = (a: number, b: number) => (b === 0 || !Number.isFinite(b) ? undefined : a / b);
const st = (expr: string, how: string): StepText => ({ expr, how });

/** a < b, checked only (a page limit); `why` is the reason a conflict is refused. */
const below = (a: string, b: string, display: string, why: string): Rule => ({
  relation: {
    id: `${a} < ${b}`,
    constraint: true,
    display,
    vars: [a, b],
    residual: (v: Values) => (v[a]! < v[b]! ? 0 : 1),
    solve: {},
    message: () => why,
  },
  steps: {},
});

/** The column's mole fractions: x_B below x_F below x_D. */
const B_BELOW_D = below(
  'xB',
  'xD',
  '{xB} < {xD}',
  'The bottoms hold less of the light component than the distillate.',
);
const F_BELOW_D = below(
  'xF',
  'xD',
  '{xF} < {xD}',
  'The feed holds less of the light component than the distillate.',
);
const B_BELOW_F = below(
  'xB',
  'xF',
  '{xB} < {xF}',
  'The bottoms hold less of the light component than the feed.',
);

/** A value with a unit that never changes (the formula is written in it). */
const quantity = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  step: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({
  id,
  symbol,
  name,
  ...(unit ? { unit, units: [unit] } : {}),
  min,
  max,
  step,
  ...more,
});

const fractionOf = (id: string, symbol: string, name: string, more: Partial<VariableDef> = {}) =>
  quantity(id, symbol, name, undefined, 0, 1, 0.001, more);

// ─── HC8 phaseEnvelope: Pxy (chemical-thermodynamics#2) ─────────────────────

/** Antoine constants (mmHg, °C) of the plans' pair: data of the compounds, not page values. */
const BENZENE: Antoine = [6.90565, 1211.033, 220.79];
const TOLUENE: Antoine = [6.95464, 1344.8, 219.482];
const PAIR: [string, string] = ['benzene', 'toluene'];

/** P^sat from T by Antoine, and T back from P^sat. */
function antoineRule(id: string, T: string, name: string, [A, B, C]: Antoine): Rule {
  const sym = id === 'P1' ? 'P₁ˢᵃᵗ' : 'P₂ˢᵃᵗ';
  const id_ = `log₁₀ ${sym} = ${A} − ${B} ÷ (T + ${C}) (${name})`;
  return {
    relation: {
      id: id_,
      display: `log₁₀ {${id}} = ${A} − ${B} ÷ ({${T}} + ${C})`,
      vars: [id, T],
      residual: (x) => Math.log10(x[id]!) - (A - B / (x[T]! + C)),
      solve: {
        [id]: (x) => 10 ** (A - B / (x[T]! + C)),
        [T]: (x) => (x[id]! > 0 ? B / (A - Math.log10(x[id]!)) - C : undefined),
      },
    },
    steps: {
      [id]: st(
        `10^(${A} − ${B} ÷ ({${T}} + ${C}))`,
        `Antoine’s equation for ${name}: work out the exponent, then raise 10 to it.`,
      ),
      [T]: st(
        `${B} ÷ (${A} − log₁₀({${id}})) − ${C}`,
        'Take log₁₀ of the vapor pressure, subtract it from A, divide B by the result, then subtract C.',
      ),
    },
  };
}

/** Raoult's law for the total pressure: P = x₁P₁sat + (1 − x₁)P₂sat. */
const raoultRule = (P: string, x: string, p1: string, p2: string): Rule => ({
  relation: {
    id: 'P = x₁P₁sat + (1 − x₁)P₂sat',
    display: `{${P}} = {${x}} × {${p1}} + (1 − {${x}}) × {${p2}}`,
    vars: [P, x, p1, p2],
    residual: (v) => v[P]! - v[x]! * v[p1]! - (1 - v[x]!) * v[p2]!,
    solve: {
      [P]: (v) => v[x]! * v[p1]! + (1 - v[x]!) * v[p2]!,
      [x]: (v) => div(v[P]! - v[p2]!, v[p1]! - v[p2]!),
      [p1]: (v) => div(v[P]! - (1 - v[x]!) * v[p2]!, v[x]!),
      [p2]: (v) => div(v[P]! - v[x]! * v[p1]!, 1 - v[x]!),
    },
  },
  steps: {
    [P]: st(
      `{${x}} × {${p1}} + (1 − {${x}}) × {${p2}}`,
      'Each liquid adds its mole fraction times its own vapor pressure (Raoult’s law); add the two partial pressures.',
    ),
    [x]: st(
      `({${P}} − {${p2}}) ÷ ({${p1}} − {${p2}})`,
      'Subtract P₂sat from both sides, then divide by P₁sat − P₂sat.',
    ),
    [p1]: st(
      `({${P}} − (1 − {${x}}) × {${p2}}) ÷ {${x}}`,
      'Subtract the second liquid’s partial pressure from P, then divide by x₁.',
    ),
    [p2]: st(
      `({${P}} − {${x}} × {${p1}}) ÷ (1 − {${x}})`,
      'Subtract the first liquid’s partial pressure from P, then divide by its mole fraction 1 − x₁.',
    ),
  },
});

/** The vapor's share: y₁ = x₁P₁sat ÷ P. */
const vaporRule = (y: string, x: string, p1: string, P: string): Rule => ({
  relation: {
    id: 'y₁ = x₁P₁sat ÷ P',
    display: `{${y}} = {${x}} × {${p1}} ÷ {${P}}`,
    vars: [y, x, p1, P],
    residual: (v) => v[y]! * v[P]! - v[x]! * v[p1]!,
    solve: {
      [y]: (v) => div(v[x]! * v[p1]!, v[P]!),
      [x]: (v) => div(v[y]! * v[P]!, v[p1]!),
      [p1]: (v) => div(v[y]! * v[P]!, v[x]!),
      [P]: (v) => div(v[x]! * v[p1]!, v[y]!),
    },
  },
  steps: {
    [y]: st(
      `{${x}} × {${p1}} ÷ {${P}}`,
      'The first liquid’s partial pressure over the total is its mole fraction in the vapor (Dalton’s law).',
    ),
    [x]: st(`{${y}} × {${P}} ÷ {${p1}}`, 'Multiply both sides by P, then divide by P₁sat.'),
    [p1]: st(`{${y}} × {${P}} ÷ {${x}}`, 'Multiply both sides by P, then divide by x₁.'),
    [P]: st(`{${x}} × {${p1}} ÷ {${y}}`, 'Multiply both sides by P, then divide by y₁.'),
  },
});

const mmHg = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, 'mmHg', 0.01, 20000, 0.1);

const BUBBLE_VARS: VariableDef[] = [
  quantity('T', 'T', 'Temperature', '°C', 0, 200, 0.1),
  mmHg('P1', 'P₁ˢᵃᵗ', 'Vapor pressure of benzene'),
  mmHg('P2', 'P₂ˢᵃᵗ', 'Vapor pressure of toluene'),
  fractionOf('x1', 'x₁', 'Mole fraction of benzene in the liquid'),
  mmHg('P', 'P', 'Bubble pressure'),
  fractionOf('y1', 'y₁', 'Mole fraction of benzene in the vapor'),
];

/** The benzene–toluene bubble-point values at T and x₁. */
function bubbleExample(T: number, x1: number): Values {
  const [P1, P2] = [antoineP(BENZENE, T), antoineP(TOLUENE, T)];
  const { P, y1 } = bubbleP(x1, P1, P2);
  return { T, P1, P2, x1, P, y1 };
}

const BUBBLE_RULES = rules(
  antoineRule('P1', 'T', 'benzene', BENZENE),
  antoineRule('P2', 'T', 'toluene', TOLUENE),
  raoultRule('P', 'x1', 'P1', 'P2'),
  vaporRule('y1', 'x1', 'P1', 'P'),
);

const RAOULT_ASSUMPTIONS = [
  'The liquid is an ideal solution (Raoult’s law) and the vapor an ideal gas.',
  'Antoine constants (mmHg, °C): benzene 6.90565, 1211.033, 220.79; toluene 6.95464, 1344.8, 219.482. Their range covers T.',
];

const pxyBubble: ModuleDef = {
  id: 'g.he-phaseEnvelope-pxy-bubble',
  title: 'Pxy diagram: the bubble pressure of benzene–toluene at 90 °C',
  use: 'Use this for the bubble pressure and the first vapor of a liquid mixture at a temperature (Raoult’s law).',
  assumptions: RAOULT_ASSUMPTIONS,
  variables: BUBBLE_VARS,
  ...BUBBLE_RULES,
  example: bubbleExample(90, 0.5),
  startWith: ['T', 'x1'],
  representation: {
    kind: 'phaseEnvelope',
    mode: 'Pxy',
    names: PAIR,
    T: 'T',
    p1: 'P1',
    p2: 'P2',
    x: 'x1',
    y: 'y1',
    P: 'P',
  },
};

// ─── Pxy ~dew ────────────────────────────────────────────────────────────────

const dewRule: Rule = {
  relation: {
    id: '1 ÷ P = y₁ ÷ P₁sat + (1 − y₁) ÷ P₂sat',
    display: '1 ÷ {P} = {y1} ÷ {P1} + (1 − {y1}) ÷ {P2}',
    vars: ['P', 'y1', 'P1', 'P2'],
    residual: (v) => 1 / v.P! - v.y1! / v.P1! - (1 - v.y1!) / v.P2!,
    solve: {
      P: (v) => div(1, v.y1! / v.P1! + (1 - v.y1!) / v.P2!),
      y1: (v) => div(1 / v.P! - 1 / v.P2!, 1 / v.P1! - 1 / v.P2!),
      P1: (v) => div(v.y1!, 1 / v.P! - (1 - v.y1!) / v.P2!),
      P2: (v) => div(1 - v.y1!, 1 / v.P! - v.y1! / v.P1!),
    },
  },
  steps: {
    P: st(
      '1 ÷ ({y1} ÷ {P1} + (1 − {y1}) ÷ {P2})',
      'At the dew point the liquid’s mole fractions, y ÷ P^sat times P, add to 1: add y₁ ÷ P₁sat and y₂ ÷ P₂sat, then take the reciprocal.',
    ),
    y1: st(
      '(1 ÷ {P} − 1 ÷ {P2}) ÷ (1 ÷ {P1} − 1 ÷ {P2})',
      'Subtract 1 ÷ P₂sat from both sides, then divide by 1 ÷ P₁sat − 1 ÷ P₂sat.',
    ),
    P1: st(
      '{y1} ÷ (1 ÷ {P} − (1 − {y1}) ÷ {P2})',
      'Subtract the second term from 1 ÷ P, then divide y₁ by what is left.',
    ),
    P2: st(
      '(1 − {y1}) ÷ (1 ÷ {P} − {y1} ÷ {P1})',
      'Subtract the first term from 1 ÷ P, then divide 1 − y₁ by what is left.',
    ),
  },
};

const firstDropRule: Rule = {
  relation: {
    id: 'x₁ = y₁P ÷ P₁sat',
    display: '{x1} = {y1} × {P} ÷ {P1}',
    vars: ['x1', 'y1', 'P', 'P1'],
    residual: (v) => v.x1! * v.P1! - v.y1! * v.P!,
    solve: {
      x1: (v) => div(v.y1! * v.P!, v.P1!),
      y1: (v) => div(v.x1! * v.P1!, v.P!),
      P: (v) => div(v.x1! * v.P1!, v.y1!),
      P1: (v) => div(v.y1! * v.P!, v.x1!),
    },
  },
  steps: {
    x1: st(
      '{y1} × {P} ÷ {P1}',
      'Raoult’s law for the first drop: its x₁ times P₁sat is the partial pressure y₁P.',
    ),
    y1: st('{x1} × {P1} ÷ {P}', 'Divide the partial pressure x₁P₁sat by the total pressure.'),
    P: st('{x1} × {P1} ÷ {y1}', 'Divide the partial pressure x₁P₁sat by y₁.'),
    P1: st('{y1} × {P} ÷ {x1}', 'Divide the partial pressure y₁P by x₁.'),
  },
};

const pxyDew: ModuleDef = {
  id: 'g.he-phaseEnvelope-pxy-dew',
  title: 'Pxy diagram: the dew pressure of a benzene–toluene vapor',
  use: 'Use this for the dew pressure of a vapor mixture and the first drop of liquid it forms.',
  assumptions: [
    'The liquid is an ideal solution (Raoult’s law) and the vapor an ideal gas.',
    'Vapor pressures at 90 °C: benzene 1021 mmHg, toluene 406.7 mmHg.',
  ],
  variables: [
    mmHg('P1', 'P₁ˢᵃᵗ', 'Vapor pressure of benzene'),
    mmHg('P2', 'P₂ˢᵃᵗ', 'Vapor pressure of toluene'),
    fractionOf('y1', 'y₁', 'Mole fraction of benzene in the vapor'),
    mmHg('P', 'P', 'Dew pressure'),
    fractionOf('x1', 'x₁', 'Benzene fraction in the first drop'),
  ],
  ...rules(dewRule, firstDropRule),
  example: (() => {
    const { P, x1 } = dewP(0.5, 1021, 406.7);
    return { P1: 1021, P2: 406.7, y1: 0.5, P, x1 };
  })(),
  startWith: ['P1', 'P2', 'y1'],
  representation: {
    kind: 'phaseEnvelope',
    mode: 'Pxy',
    names: PAIR,
    tie: 'dew',
    p1: 'P1',
    p2: 'P2',
    x: 'x1',
    y: 'y1',
    P: 'P',
  },
};

// ─── Pxy ~flash ──────────────────────────────────────────────────────────────

const kRule = (K: string, p: string, n: string): Rule => ({
  relation: {
    id: `K${n} = P${n}sat ÷ P`,
    display: `{${K}} = {${p}} ÷ {P}`,
    vars: [K, p, 'P'],
    residual: (v) => v[K]! * v.P! - v[p]!,
    solve: {
      [K]: (v) => div(v[p]!, v.P!),
      [p]: (v) => v[K]! * v.P!,
      P: (v) => div(v[p]!, v[K]!),
    },
  },
  steps: {
    [K]: st(`{${p}} ÷ {P}`, 'Raoult’s law: y ÷ x is the vapor pressure over the total pressure.'),
    [p]: st(`{${K}} × {P}`, 'Multiply both sides by P.'),
    P: st(`{${p}} ÷ {${K}}`, 'Multiply both sides by P, then divide by K.'),
  },
});

const flashRules = rules(
  kRule('K1', 'P1', '₁'),
  kRule('K2', 'P2', '₂'),
  {
    relation: {
      id: 'x₁ = (1 − K₂) ÷ (K₁ − K₂)',
      display: '{x1} = (1 − {K2}) ÷ ({K1} − {K2})',
      vars: ['x1', 'K1', 'K2'],
      residual: (v) => v.x1! * (v.K1! - v.K2!) - (1 - v.K2!),
      solve: {
        x1: (v) => div(1 - v.K2!, v.K1! - v.K2!),
        K1: (v) => (v.x1 === 0 ? undefined : v.K2! + (1 - v.K2!) / v.x1!),
        K2: (v) => div(1 - v.x1! * v.K1!, 1 - v.x1!),
      },
    },
    steps: {
      x1: st(
        '(1 − {K2}) ÷ ({K1} − {K2})',
        'The vapor’s fractions K₁x₁ and K₂x₂ add to 1; solve that for x₁.',
      ),
      K1: st('{K2} + (1 − {K2}) ÷ {x1}', 'Divide 1 − K₂ by x₁, then add K₂.'),
      K2: st('(1 − {x1} × {K1}) ÷ (1 − {x1})', 'Collect the K₂ terms: 1 − x₁K₁ over 1 − x₁.'),
    },
  },
  {
    relation: {
      id: 'y₁ = K₁x₁',
      display: '{y1} = {K1} × {x1}',
      vars: ['y1', 'K1', 'x1'],
      residual: (v) => v.y1! - v.K1! * v.x1!,
      solve: {
        y1: (v) => v.K1! * v.x1!,
        K1: (v) => div(v.y1!, v.x1!),
        x1: (v) => div(v.y1!, v.K1!),
      },
    },
    steps: {
      y1: st('{K1} × {x1}', 'The vapor in equilibrium has K₁ times the liquid’s share of benzene.'),
      K1: st('{y1} ÷ {x1}', 'Divide both sides by x₁.'),
      x1: st('{y1} ÷ {K1}', 'Divide both sides by K₁.'),
    },
  },
  {
    relation: {
      id: 'V ÷ F = (z₁ − x₁) ÷ (y₁ − x₁)',
      display: '{VF} = ({z1} − {x1}) ÷ ({y1} − {x1})',
      vars: ['VF', 'z1', 'x1', 'y1'],
      residual: (v) => v.VF! * (v.y1! - v.x1!) - (v.z1! - v.x1!),
      solve: {
        VF: (v) => div(v.z1! - v.x1!, v.y1! - v.x1!),
        z1: (v) => v.x1! + v.VF! * (v.y1! - v.x1!),
        x1: (v) => div(v.z1! - v.VF! * v.y1!, 1 - v.VF!),
        y1: (v) => (v.VF === 0 ? undefined : v.x1! + (v.z1! - v.x1!) / v.VF!),
      },
    },
    steps: {
      VF: st(
        '({z1} − {x1}) ÷ ({y1} − {x1})',
        'Lever rule: the feed’s distance from the liquid end of the tie line over the tie line’s length.',
      ),
      z1: st('{x1} + {VF} × ({y1} − {x1})', 'Go V ÷ F of the way along the tie line from x₁.'),
      x1: st(
        '({z1} − {VF} × {y1}) ÷ (1 − {VF})',
        'Collect the x₁ terms: z₁ − (V ÷ F)y₁ over 1 − V ÷ F.',
      ),
      y1: st('{x1} + ({z1} − {x1}) ÷ {VF}', 'Divide z₁ − x₁ by V ÷ F, then add x₁.'),
    },
  },
);

const pxyFlash: ModuleDef = {
  id: 'g.he-phaseEnvelope-pxy-flash',
  title: 'Pxy diagram: a benzene–toluene flash at 90 °C and 760 mmHg',
  use: 'Use this for a binary flash: the liquid and vapor compositions at T and P, and the fraction vaporized.',
  assumptions: [
    'Ideal liquid (Raoult’s law) and ideal vapor; the flash drum is at equilibrium.',
    'Vapor pressures at 90 °C: benzene 1021 mmHg, toluene 406.7 mmHg.',
  ],
  variables: [
    mmHg('P1', 'P₁ˢᵃᵗ', 'Vapor pressure of benzene'),
    mmHg('P2', 'P₂ˢᵃᵗ', 'Vapor pressure of toluene'),
    mmHg('P', 'P', 'Flash pressure'),
    quantity('K1', 'K₁', 'Equilibrium ratio of benzene', undefined, 0.001, 1000, 0.001),
    quantity('K2', 'K₂', 'Equilibrium ratio of toluene', undefined, 0.001, 1000, 0.001),
    fractionOf('z1', 'z₁', 'Mole fraction of benzene in the feed'),
    fractionOf('x1', 'x₁', 'Mole fraction of benzene in the liquid'),
    fractionOf('y1', 'y₁', 'Mole fraction of benzene in the vapor'),
    fractionOf('VF', 'V ÷ F', 'Fraction of the feed vaporized'),
  ],
  ...flashRules,
  example: (() => {
    const [P1, P2, P, z1] = [1021, 406.7, 760, 0.6];
    const { x1, y1 } = tieAt(P, P1, P2);
    return { P1, P2, P, K1: P1 / P, K2: P2 / P, z1, x1, y1, VF: (z1 - x1) / (y1 - x1) };
  })(),
  startWith: ['P1', 'P2', 'P', 'z1'],
  representation: {
    kind: 'phaseEnvelope',
    mode: 'Pxy',
    names: PAIR,
    tie: 'flash',
    p1: 'P1',
    p2: 'P2',
    P: 'P',
    x: 'x1',
    y: 'y1',
    z: 'z1',
    vf: 'VF',
    K: ['K1', 'K2'],
  },
};

// ─── Pxy ~margules ───────────────────────────────────────────────────────────

const margulesRules = rules(
  {
    relation: {
      id: 'ln γ₁ = A x₂²',
      display: 'ln({g1}) = {A} × (1 − {x1})²',
      vars: ['g1', 'A', 'x1'],
      residual: (v) => Math.log(v.g1!) - v.A! * (1 - v.x1!) ** 2,
      solve: {
        g1: (v) => Math.exp(v.A! * (1 - v.x1!) ** 2),
        A: (v) => (v.g1! > 0 ? div(Math.log(v.g1!), (1 - v.x1!) ** 2) : undefined),
        x1: (v) => {
          const r = v.g1! > 0 ? div(Math.log(v.g1!), v.A!) : undefined;
          return r === undefined || r < 0 ? undefined : 1 - Math.sqrt(r);
        },
      },
    },
    steps: {
      g1: st(
        'e^({A} × (1 − {x1})²)',
        'Square the other liquid’s mole fraction x₂ = 1 − x₁, multiply by A, then raise e to it.',
      ),
      A: st('ln({g1}) ÷ (1 − {x1})²', 'Take ln γ₁, then divide by x₂².'),
      x1: st(
        '1 − √(ln({g1}) ÷ {A})',
        'Divide ln γ₁ by A and take the root: that is x₂; subtract it from 1.',
      ),
    },
  },
  {
    relation: {
      id: 'ln γ₂ = A x₁²',
      display: 'ln({g2}) = {A} × {x1}²',
      vars: ['g2', 'A', 'x1'],
      residual: (v) => Math.log(v.g2!) - v.A! * v.x1! ** 2,
      solve: {
        g2: (v) => Math.exp(v.A! * v.x1! ** 2),
        A: (v) => (v.g2! > 0 ? div(Math.log(v.g2!), v.x1! ** 2) : undefined),
        x1: (v) => {
          const r = v.g2! > 0 ? div(Math.log(v.g2!), v.A!) : undefined;
          return r === undefined || r < 0 ? undefined : Math.sqrt(r);
        },
      },
    },
    steps: {
      g2: st('e^({A} × {x1}²)', 'Square x₁, multiply by A, then raise e to it.'),
      A: st('ln({g2}) ÷ {x1}²', 'Take ln γ₂, then divide by x₁².'),
      x1: st('√(ln({g2}) ÷ {A})', 'Divide ln γ₂ by A, then take the square root.'),
    },
  },
);

const margulesDemo = (id: string, title: string, A: number, x1: number): ModuleDef => {
  const [g1, g2] = margules(A, x1);
  return {
    id,
    title,
    use: 'Use this for activity coefficients from the one-parameter Margules equation, and how they bend the bubble and dew curves.',
    assumptions: [
      'One-parameter Margules: the excess Gibbs energy is A x₁x₂RT.',
      'The curves use benzene–toluene vapor pressures at 90 °C, 1021 and 406.7 mmHg, to show the shape.',
    ],
    variables: [
      quantity('A', 'A', 'Margules parameter', undefined, -3, 3, 0.01),
      fractionOf('x1', 'x₁', 'Mole fraction of 1 in the liquid'),
      quantity('g1', 'γ₁', 'Activity coefficient of component 1', undefined, 0.01, 100, 0.001),
      quantity('g2', 'γ₂', 'Activity coefficient of component 2', undefined, 0.01, 100, 0.001),
    ],
    ...margulesRules,
    example: { A, x1, g1, g2 },
    startWith: ['A', 'x1'],
    representation: {
      kind: 'phaseEnvelope',
      mode: 'Pxy',
      names: ['1', '2'],
      p1: 1021,
      p2: 406.7,
      margules: 'A',
      x: 'x1',
      gammas: ['g1', 'g2'],
    },
  };
};

const pxyMargules = margulesDemo(
  'g.he-phaseEnvelope-pxy-margules',
  'Pxy diagram: Margules activity coefficients, Raoult’s line dashed',
  0.8,
  0.3,
);
const pxyMargulesAzeotrope = margulesDemo(
  'g.he-phaseEnvelope-pxy-margules-azeotrope',
  'Pxy diagram at a large Margules A: the curves meet at an azeotrope',
  2,
  0.5,
);

// ─── Pxy physical-1#1 ~raoult (torr) ─────────────────────────────────────────

const torr = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, 'torr', 0.01, 100000, 0.1);

const pxyRaoult: ModuleDef = {
  id: 'g.he-phaseEnvelope-pxy-raoult',
  title: 'Pxy diagram: benzene and methylbenzene at 25 °C',
  use: 'Use this for the vapor pressure of an ideal mixture and the vapor’s composition (Raoult’s law).',
  assumptions: [
    'The liquids form an ideal solution (Raoult’s law); the vapor is an ideal gas.',
    'Both pure vapor pressures are at the mixture’s temperature.',
  ],
  variables: [
    fractionOf('x1', 'x_A', 'Mole fraction of benzene in the liquid'),
    torr('P1', 'P_A°', 'Vapor pressure of pure benzene'),
    torr('P2', 'P_B°', 'Vapor pressure of pure methylbenzene'),
    torr('P', 'P', 'Total vapor pressure'),
    fractionOf('y1', 'y_A', 'Mole fraction of benzene in the vapor'),
  ],
  ...rules(raoultRule('P', 'x1', 'P1', 'P2'), vaporRule('y1', 'x1', 'P1', 'P')),
  example: (() => {
    const { P, y1 } = bubbleP(0.6, 95.1, 28.4);
    return { x1: 0.6, P1: 95.1, P2: 28.4, P, y1 };
  })(),
  startWith: ['P1', 'P2', 'x1'],
  representation: {
    kind: 'phaseEnvelope',
    mode: 'Pxy',
    names: ['benzene', 'methylbenzene'],
    unit: 'torr',
    p1: 'P1',
    p2: 'P2',
    x: 'x1',
    y: 'y1',
    P: 'P',
  },
};

// ─── Txy (chemical-thermodynamics#2, bubble temperature) ────────────────────

const txy: ModuleDef = {
  id: 'g.he-phaseEnvelope-txy',
  title: 'Txy diagram: benzene–toluene at 760 mmHg',
  use: 'Use this for the bubble temperature of a liquid mixture at a pressure: the temperature where its bubble pressure reaches P.',
  assumptions: RAOULT_ASSUMPTIONS,
  // The curves come from Antoine, so the vapor pressures follow T and are never typed.
  variables: BUBBLE_VARS.map((v) =>
    v.id === 'P'
      ? { ...v, name: 'Pressure' }
      : v.id === 'P1' || v.id === 'P2'
        ? { ...v, derived: true }
        : v,
  ),
  ...BUBBLE_RULES,
  example: bubbleExample(bubbleT(0.5, 760, BENZENE, TOLUENE)!.T, 0.5),
  startWith: ['T', 'x1'],
  representation: {
    kind: 'phaseEnvelope',
    mode: 'Txy',
    names: PAIR,
    antoine: [BENZENE, TOLUENE],
    P: 'P',
    x: 'x1',
    y: 'y1',
    T: 'T',
  },
};

// ─── xy: separations#0 (distillation) ────────────────────────────────────────

/** A column's mole fraction: never quite 0 or 1 (no column makes a pure product). */
const columnFraction = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, undefined, 0.001, 0.999, 0.001);
const xD = columnFraction('xD', 'x_D', 'Light fraction in the distillate');
const xB = columnFraction('xB', 'x_B', 'Light fraction in the bottoms');
const xF = columnFraction('xF', 'x_F', 'Light fraction in the feed');
const alpha = quantity('alpha', 'α', 'Relative volatility', undefined, 1.05, 20, 0.01);

const fenskeRule: Rule = {
  relation: {
    id: 'N_min = ln[(x_D ÷ (1 − x_D))((1 − x_B) ÷ x_B)] ÷ ln α',
    display: '{Nmin} = ln(({xD} ÷ (1 − {xD})) × ((1 − {xB}) ÷ {xB})) ÷ ln({alpha})',
    vars: ['Nmin', 'xD', 'xB', 'alpha'],
    residual: (v) => v.Nmin! - fenske(v.alpha!, v.xD!, v.xB!),
    solve: {
      Nmin: (v) => (v.alpha! > 1 ? fenske(v.alpha!, v.xD!, v.xB!) : undefined),
      alpha: (v) =>
        v.Nmin! > 0 ? ((v.xD! / (1 - v.xD!)) * ((1 - v.xB!) / v.xB!)) ** (1 / v.Nmin!) : undefined,
      xD: (v) => {
        const s = (v.alpha! ** v.Nmin! * v.xB!) / (1 - v.xB!);
        return s / (1 + s);
      },
      xB: (v) => 1 / (1 + (v.alpha! ** v.Nmin! * (1 - v.xD!)) / v.xD!),
    },
  },
  steps: {
    Nmin: st(
      'ln(({xD} ÷ (1 − {xD})) × ((1 − {xB}) ÷ {xB})) ÷ ln({alpha})',
      'Each stage at total reflux multiplies the light-to-heavy ratio by α: divide the log of the overall separation by ln α.',
    ),
    alpha: st(
      '(({xD} ÷ (1 − {xD})) × ((1 − {xB}) ÷ {xB}))^(1 ÷ {Nmin})',
      'Raise the overall separation to the power 1 ÷ N_min.',
    ),
    xD: st(
      '({alpha}^{Nmin} × {xB} ÷ (1 − {xB})) ÷ (1 + {alpha}^{Nmin} × {xB} ÷ (1 − {xB}))',
      'The distillate’s ratio x_D ÷ (1 − x_D) is α^N times the bottoms’ ratio; turn the ratio back into a fraction.',
    ),
    xB: st(
      '1 ÷ (1 + {alpha}^{Nmin} × (1 − {xD}) ÷ {xD})',
      'The bottoms’ ratio (1 − x_B) ÷ x_B is α^N times (1 − x_D) ÷ x_D; turn it back into a fraction.',
    ),
  },
};

const totalRefluxDemo = (
  id: string,
  title: string,
  D: number,
  B: number,
  a: number,
): ModuleDef => ({
  id,
  title,
  use: 'Use this for the fewest stages a column needs (total reflux, Fenske).',
  assumptions: [
    'Constant relative volatility α; total reflux, so both operating lines are y = x.',
    'N_min counts the reboiler as a stage.',
  ],
  variables: [
    xD,
    xB,
    alpha,
    quantity('Nmin', 'N_min', 'Fewest stages (Fenske)', undefined, 0.1, 100, 0.01),
  ],
  ...rules(fenskeRule, B_BELOW_D),
  example: { xD: D, xB: B, alpha: a, Nmin: fenske(a, D, B) },
  startWith: ['xD', 'xB', 'alpha'],
  representation: {
    kind: 'phaseEnvelope',
    mode: 'xy',
    alpha: 'alpha',
    xD: 'xD',
    xB: 'xB',
    steps: 'total',
    minStages: 'Nmin',
  },
});

const xyTotal = totalRefluxDemo(
  'g.he-phaseEnvelope-xy-total',
  'x–y diagram: the fewest stages at total reflux',
  0.95,
  0.05,
  2.5,
);
const xyTotalClose = totalRefluxDemo(
  'g.he-phaseEnvelope-xy-total-close',
  'x–y diagram: a close-boiling pair (α = 1.5) to 99% purity',
  0.99,
  0.01,
  1.5,
);

const underwoodRule: Rule = {
  relation: {
    id: 'R_min = (1 ÷ (α − 1))[x_D ÷ x_F − α(1 − x_D) ÷ (1 − x_F)]',
    display: '{Rmin} = (1 ÷ ({alpha} − 1)) × ({xD} ÷ {xF} − {alpha} × (1 − {xD}) ÷ (1 − {xF}))',
    vars: ['Rmin', 'alpha', 'xD', 'xF'],
    residual: (v) => v.Rmin! - minReflux(v.alpha!, v.xF!, v.xD!),
    solve: {
      Rmin: (v) =>
        v.alpha === 1 || v.xF === 0 || v.xF === 1 ? undefined : minReflux(v.alpha!, v.xF!, v.xD!),
      xD: (v) =>
        div(v.Rmin! * (v.alpha! - 1) + v.alpha! / (1 - v.xF!), 1 / v.xF! + v.alpha! / (1 - v.xF!)),
      alpha: (v) => div(v.Rmin! + v.xD! / v.xF!, v.Rmin! + (1 - v.xD!) / (1 - v.xF!)),
    },
  },
  steps: {
    Rmin: st(
      '(1 ÷ ({alpha} − 1)) × ({xD} ÷ {xF} − {alpha} × (1 − {xD}) ÷ (1 − {xF}))',
      'Underwood for a saturated liquid feed: the line from (x_D, x_D) just touches the equilibrium curve above x_F.',
    ),
    xD: st(
      '({Rmin} × ({alpha} − 1) + {alpha} ÷ (1 − {xF})) ÷ (1 ÷ {xF} + {alpha} ÷ (1 − {xF}))',
      'Multiply by α − 1, gather the x_D terms on one side, then divide.',
    ),
    alpha: st(
      '({Rmin} + {xD} ÷ {xF}) ÷ ({Rmin} + (1 − {xD}) ÷ (1 − {xF}))',
      'Multiply by α − 1, gather the α terms on one side, then divide.',
    ),
  },
};

const xyMinReflux: ModuleDef = {
  id: 'g.he-phaseEnvelope-xy-min-reflux',
  title: 'x–y diagram: minimum reflux, pinched at the feed',
  use: 'Use this for the minimum reflux ratio of a column with a saturated liquid feed (Underwood).',
  assumptions: [
    'Constant relative volatility α; constant molar overflow.',
    'The feed is a saturated liquid (q = 1), so the pinch is straight above x_F.',
    'The design reflux is 1.5 times the minimum.',
  ],
  variables: [
    xF,
    xD,
    alpha,
    quantity('Rmin', 'R_min', 'Minimum reflux ratio', undefined, 0.01, 100, 0.001),
    quantity('R', 'R', 'Reflux ratio', undefined, 0.01, 150, 0.001),
  ],
  ...rules(underwoodRule, F_BELOW_D, {
    relation: {
      id: 'R = 1.5R_min',
      display: '{R} = 1.5 × {Rmin}',
      vars: ['R', 'Rmin'],
      residual: (v) => v.R! - 1.5 * v.Rmin!,
      solve: { R: (v) => 1.5 * v.Rmin!, Rmin: (v) => v.R! / 1.5 },
    },
    steps: {
      R: st('1.5 × {Rmin}', 'A common design choice: run at 1.5 times the minimum reflux.'),
      Rmin: st('{R} ÷ 1.5', 'Divide the reflux ratio by 1.5.'),
    },
  }),
  example: (() => {
    const Rmin = minReflux(2.5, 0.4, 0.95);
    return { xF: 0.4, xD: 0.95, alpha: 2.5, Rmin, R: 1.5 * Rmin };
  })(),
  startWith: ['xF', 'xD', 'alpha'],
  representation: {
    kind: 'phaseEnvelope',
    mode: 'xy',
    alpha: 'alpha',
    xF: 'xF',
    xD: 'xD',
    q: 1,
    R: 'R',
    Rmin: 'Rmin',
  },
};

const slopeRule: Rule = {
  relation: {
    id: 'slope = R ÷ (R + 1)',
    display: '{slope} = {R} ÷ ({R} + 1)',
    vars: ['slope', 'R'],
    residual: (v) => v.slope! * (v.R! + 1) - v.R!,
    solve: {
      slope: (v) => div(v.R!, v.R! + 1),
      R: (v) => div(v.slope!, 1 - v.slope!),
    },
  },
  steps: {
    slope: st(
      '{R} ÷ ({R} + 1)',
      'Above the feed, L ÷ V = R ÷ (R + 1): the liquid down over the vapor up.',
    ),
    R: st('{slope} ÷ (1 − {slope})', 'Multiply out and gather the R terms: slope over 1 − slope.'),
  },
};

const interceptRule: Rule = {
  relation: {
    id: 'intercept = x_D ÷ (R + 1)',
    display: '{intercept} = {xD} ÷ ({R} + 1)',
    vars: ['intercept', 'xD', 'R'],
    residual: (v) => v.intercept! * (v.R! + 1) - v.xD!,
    solve: {
      intercept: (v) => div(v.xD!, v.R! + 1),
      xD: (v) => v.intercept! * (v.R! + 1),
      R: (v) => div(v.xD!, v.intercept!)! - 1,
    },
  },
  steps: {
    intercept: st(
      '{xD} ÷ ({R} + 1)',
      'Where the line through (x_D, x_D) with that slope meets x = 0.',
    ),
    xD: st('{intercept} × ({R} + 1)', 'Multiply both sides by R + 1.'),
    R: st('{xD} ÷ {intercept} − 1', 'Divide x_D by the intercept, then subtract 1.'),
  },
};

const xyOperatingLine: ModuleDef = {
  id: 'g.he-phaseEnvelope-xy-operating-line',
  title: 'x–y diagram: the rectifying operating line',
  use: 'Use this for the slope and intercept of the rectifying section’s operating line from the reflux ratio.',
  assumptions: [
    'Constant molar overflow above the feed.',
    'Total condenser: the reflux has the distillate’s composition x_D.',
    'The curve is drawn for α = 2.5 to show where the line sits.',
  ],
  variables: [
    quantity('R', 'R', 'Reflux ratio', undefined, 0.01, 150, 0.001),
    xD,
    quantity('slope', 'slope', 'Slope of the operating line', undefined, 0.001, 0.999, 0.001),
    quantity('intercept', 'intercept', 'Intercept on the y axis', undefined, 0.0001, 1, 0.0001),
  ],
  ...rules(slopeRule, interceptRule),
  example: (() => {
    const { slope, intercept } = rectifying(2.167, 0.95);
    return { R: 2.167, xD: 0.95, slope, intercept };
  })(),
  startWith: ['R', 'xD'],
  representation: {
    kind: 'phaseEnvelope',
    mode: 'xy',
    alpha: 2.5,
    R: 'R',
    xD: 'xD',
    slope: 'slope',
    intercept: 'intercept',
  },
};

// ─── McCabe–Thiele: the stage count is the picture's ─────────────────────────

const STAIR_VARS = ['alpha', 'xF', 'q', 'xD', 'xB', 'R'];
const stairsOf = (v: Values) =>
  distillationStairs(v.alpha!, v.xD!, v.xB!, { R: v.R!, xF: v.xF!, q: v.q! });
const feasible = (v: Values) =>
  v.alpha! > 1 && v.xB! > 0 && v.xB! < v.xF! && v.xF! < v.xD! && v.xD! < 1 && v.R! > 0;
/** The stairs as the step text names them (taught to the harness in phrasesHe1i.ts). */
const STAIRS_TEXT =
  'stairs from x_D = {xD} to x_B = {xB} (α = {alpha}, x_F = {xF}, q = {q}, R = {R})';

const countRule = (id: string, what: 'stages' | 'feed'): Rule => {
  const count = (v: Values) => {
    if (!feasible(v)) return undefined;
    const s = stairsOf(v);
    return s.pinched ? undefined : what === 'stages' ? s.stairs.length : s.feed;
  };
  return {
    relation: {
      id: what === 'stages' ? 'N = the stairs stepped' : 'feed stage = the stair across the feed',
      display: `{${id}} = ${what === 'stages' ? 'the' : 'the feed stair of the'} ${STAIRS_TEXT}`,
      vars: [id, ...STAIR_VARS],
      residual: (v) => v[id]! - (count(v) ?? NaN),
      solve: { [id]: count },
    },
    steps: {
      [id]: st(
        `${what === 'stages' ? 'the' : 'the feed stair of the'} ${STAIRS_TEXT}`,
        what === 'stages'
          ? 'Step from (x_D, x_D): across to the equilibrium curve, down to the operating line, again and again until x reaches x_B. Count the stairs; the last one may be partial.'
          : 'The feed goes on the stair that crosses the operating lines’ meeting point; below it, step down to the stripping line.',
      ),
    },
  };
};

const qVar = quantity('q', 'q', 'Feed condition', undefined, -2, 3, 0.01);

const mccabeDemo = (
  id: string,
  title: string,
  values: { alpha: number; xF: number; q: number; xD: number; xB: number; R: number },
): ModuleDef => {
  const s = stairsOf(values);
  return {
    id,
    title,
    use: 'Use this for the number of equilibrium stages and the feed stage by McCabe–Thiele stepping.',
    assumptions: [
      'Constant relative volatility α and constant molar overflow.',
      'Total condenser; the reboiler counts as a stage; the feed enters on its best stage.',
    ],
    variables: [
      alpha,
      xF,
      qVar,
      xD,
      xB,
      quantity('R', 'R', 'Reflux ratio', undefined, 0.01, 150, 0.001),
      quantity('stages', 'N', 'Equilibrium stages', undefined, 1, 150, 1, {
        integer: true,
        derived: true,
      }),
      quantity('feed', 'N_F', 'Feed stage (from the top)', undefined, 1, 150, 1, {
        integer: true,
        derived: true,
      }),
    ],
    ...rules(
      countRule('stages', 'stages'),
      countRule('feed', 'feed'),
      B_BELOW_F,
      F_BELOW_D,
      B_BELOW_D,
    ),
    example: { ...values, stages: s.stairs.length, feed: s.feed! },
    startWith: STAIR_VARS,
    representation: {
      kind: 'phaseEnvelope',
      mode: 'xy',
      alpha: 'alpha',
      xF: 'xF',
      q: 'q',
      xD: 'xD',
      xB: 'xB',
      R: 'R',
      steps: 'stages',
      stages: 'stages',
      feedStage: 'feed',
    },
  };
};

const xyMcCabe = mccabeDemo(
  'g.he-phaseEnvelope-xy-mccabe-thiele',
  'x–y diagram: McCabe–Thiele stages, saturated liquid feed',
  { alpha: 2.5, xF: 0.4, q: 1, xD: 0.95, xB: 0.05, R: 2.167 },
);
const xyMcCabeTwoPhase = mccabeDemo(
  'g.he-phaseEnvelope-xy-mccabe-thiele-two-phase',
  'x–y diagram: McCabe–Thiele with a half-vaporized feed (q = 0.5)',
  { alpha: 2.5, xF: 0.4, q: 0.5, xD: 0.95, xB: 0.05, R: 2.5 },
);

// ─── xy: separations#1 (absorption) ──────────────────────────────────────────

const gasFrac = (id: string, symbol: string, name: string, min = 0.00001) =>
  quantity(id, symbol, name, undefined, min, 0.5, 0.00001);

/** The gas loses solute (y_out < y_in), and the leaving gas is above the entering liquid's equilibrium. */
const ABSORBER_LIMITS: Rule[] = [
  below('yOut', 'yIn', '{yOut} < {yIn}', 'The gas leaves with less solute than it brought in.'),
  {
    relation: {
      id: 'mx_in < y_out',
      constraint: true,
      display: '{m} × {xIn} < {yOut}',
      vars: ['m', 'xIn', 'yOut'],
      residual: (v: Values) => (v.m! * v.xIn! < v.yOut! ? 0 : 1),
      solve: {},
      message: () =>
        'The leaving gas must hold more solute than the entering liquid is in equilibrium with (y_out > mx_in), or no stages can reach it.',
    },
    steps: {},
  },
];

const ABSORBER_ASSUMPTIONS = [
  'A dilute gas, so L and G stay constant up the column.',
  'Equilibrium is the straight line y = mx (Henry’s law); the column is isothermal.',
];

const kremserRule: Rule = {
  relation: {
    id: 'N = ln[((y_in − mx_in) ÷ (y_out − mx_in))(1 − 1 ÷ A) + 1 ÷ A] ÷ ln A',
    display:
      '{N} = ln((({yIn} − {m} × {xIn}) ÷ ({yOut} − {m} × {xIn})) × (1 − 1 ÷ {A}) + 1 ÷ {A}) ÷ ln({A})',
    vars: ['N', 'yIn', 'yOut', 'xIn', 'm', 'A'],
    residual: (v) => v.N! - kremser(v.yIn!, v.yOut!, v.xIn!, v.m!, v.A!),
    solve: {
      N: (v) => (v.A! > 0 && v.A !== 1 ? kremser(v.yIn!, v.yOut!, v.xIn!, v.m!, v.A!) : undefined),
      yIn: (v) => {
        const r = div(v.A! ** v.N! - 1 / v.A!, 1 - 1 / v.A!);
        return r === undefined ? undefined : v.m! * v.xIn! + r * (v.yOut! - v.m! * v.xIn!);
      },
      yOut: (v) => {
        const r = div(v.A! ** v.N! - 1 / v.A!, 1 - 1 / v.A!);
        return r === undefined ? undefined : v.m! * v.xIn! + div(v.yIn! - v.m! * v.xIn!, r)!;
      },
      // m enters only through mx_in: with clean liquid (x_in = 0) N doesn't fix it.
      m: () => undefined,
    },
  },
  steps: {
    N: st(
      'ln((({yIn} − {m} × {xIn}) ÷ ({yOut} − {m} × {xIn})) × (1 − 1 ÷ {A}) + 1 ÷ {A}) ÷ ln({A})',
      'Kremser: how far the gas is taken toward equilibrium with the entering liquid, on a log scale of the absorption factor.',
    ),
    yIn: st(
      '{m} × {xIn} + (({A}^{N} − 1 ÷ {A}) ÷ (1 − 1 ÷ {A})) × ({yOut} − {m} × {xIn})',
      'Undo the log: raise A to N, then scale the leaving gas’s driving force by the result.',
    ),
    yOut: st(
      '{m} × {xIn} + ({yIn} − {m} × {xIn}) ÷ (({A}^{N} − 1 ÷ {A}) ÷ (1 − 1 ÷ {A}))',
      'Undo the log: raise A to N, then divide the entering gas’s driving force by the result.',
    ),
  },
};

const xyAbsorber: ModuleDef = {
  id: 'g.he-phaseEnvelope-xy-absorber',
  title: 'x–y diagram: absorber stages, stepped and by Kremser',
  use: 'Use this for the number of stages a dilute absorber needs (Kremser equation).',
  assumptions: ABSORBER_ASSUMPTIONS,
  variables: [
    gasFrac('yIn', 'y_in', 'Solute mole fraction in the entering gas'),
    gasFrac('yOut', 'y_out', 'Solute mole fraction in the leaving gas'),
    gasFrac('xIn', 'x_in', 'Solute mole fraction in the entering liquid', 0),
    quantity('m', 'm', 'Equilibrium slope (y = mx)', undefined, 0.01, 100, 0.01),
    quantity('A', 'A', 'Absorption factor L ÷ (mG)', undefined, 0.1, 20, 0.01),
    quantity('N', 'N', 'Equilibrium stages (Kremser)', undefined, 0.01, 100, 0.01),
  ],
  ...rules(kremserRule, ...ABSORBER_LIMITS),
  example: { yIn: 0.02, yOut: 0.001, xIn: 0, m: 1.5, A: 1.4, N: kremser(0.02, 0.001, 0, 1.5, 1.4) },
  startWith: ['yIn', 'yOut', 'xIn', 'm', 'A'],
  representation: {
    kind: 'phaseEnvelope',
    mode: 'xy',
    m: 'm',
    absorber: { yIn: 'yIn', yOut: 'yOut', xIn: 'xIn', A: 'A', N: 'N' },
  },
};

const xyMinLiquid: ModuleDef = {
  id: 'g.he-phaseEnvelope-xy-min-liquid',
  title: 'x–y diagram: the minimum liquid-to-gas ratio of an absorber',
  use: 'Use this for the least liquid an absorber can run on, pinched where the gas enters.',
  assumptions: [...ABSORBER_ASSUMPTIONS, 'The design runs at 1.5 times the minimum L ÷ G.'],
  variables: [
    gasFrac('yIn', 'y_in', 'Solute mole fraction in the entering gas'),
    gasFrac('yOut', 'y_out', 'Solute mole fraction in the leaving gas'),
    gasFrac('xIn', 'x_in', 'Solute mole fraction in the entering liquid', 0),
    quantity('m', 'm', 'Equilibrium slope (y = mx)', undefined, 0.01, 100, 0.01),
    quantity('LGmin', '(L ÷ G)min', 'Minimum liquid-to-gas ratio', undefined, 0.001, 1000, 0.001),
    quantity('LG', 'L ÷ G', 'Liquid-to-gas ratio', undefined, 0.001, 1500, 0.001),
    quantity('A', 'A', 'Absorption factor L ÷ (mG)', undefined, 0.01, 100, 0.001),
  ],
  ...rules(
    {
      relation: {
        id: '(L ÷ G)min = (y_in − y_out) ÷ (y_in ÷ m − x_in)',
        display: '{LGmin} = ({yIn} − {yOut}) ÷ ({yIn} ÷ {m} − {xIn})',
        vars: ['LGmin', 'yIn', 'yOut', 'm', 'xIn'],
        residual: (v) => v.LGmin! * (v.yIn! / v.m! - v.xIn!) - (v.yIn! - v.yOut!),
        solve: {
          LGmin: (v) => (v.m === 0 ? undefined : div(v.yIn! - v.yOut!, v.yIn! / v.m! - v.xIn!)),
          yOut: (v) => v.yIn! - v.LGmin! * (v.yIn! / v.m! - v.xIn!),
          xIn: (v) => (v.m === 0 ? undefined : v.yIn! / v.m! - div(v.yIn! - v.yOut!, v.LGmin!)!),
        },
      },
      steps: {
        LGmin: st(
          '({yIn} − {yOut}) ÷ ({yIn} ÷ {m} − {xIn})',
          'At the least liquid, the leaving liquid reaches equilibrium with the entering gas, x = y_in ÷ m: rise over run of that line.',
        ),
        yOut: st(
          '{yIn} − {LGmin} × ({yIn} ÷ {m} − {xIn})',
          'Multiply out, then subtract from y_in.',
        ),
        xIn: st(
          '{yIn} ÷ {m} − ({yIn} − {yOut}) ÷ {LGmin}',
          'Divide the rise by the slope, then subtract from y_in ÷ m.',
        ),
      },
    },
    {
      relation: {
        id: 'L ÷ G = 1.5(L ÷ G)min',
        display: '{LG} = 1.5 × {LGmin}',
        vars: ['LG', 'LGmin'],
        residual: (v) => v.LG! - 1.5 * v.LGmin!,
        solve: { LG: (v) => 1.5 * v.LGmin!, LGmin: (v) => v.LG! / 1.5 },
      },
      steps: {
        LG: st('1.5 × {LGmin}', 'A common design choice: 1.5 times the minimum.'),
        LGmin: st('{LG} ÷ 1.5', 'Divide by 1.5.'),
      },
    },
    ...ABSORBER_LIMITS,
    {
      relation: {
        id: 'A = (L ÷ G) ÷ m',
        display: '{A} = {LG} ÷ {m}',
        vars: ['A', 'LG', 'm'],
        residual: (v) => v.A! * v.m! - v.LG!,
        solve: {
          A: (v) => div(v.LG!, v.m!),
          LG: (v) => v.A! * v.m!,
          m: (v) => div(v.LG!, v.A!),
        },
      },
      steps: {
        A: st(
          '{LG} ÷ {m}',
          'The absorption factor compares the operating line’s slope with the equilibrium line’s.',
        ),
        LG: st('{A} × {m}', 'Multiply both sides by m.'),
        m: st('{LG} ÷ {A}', 'Multiply both sides by m, then divide by A.'),
      },
    },
  ),
  example: (() => {
    const LGmin = minLiquid(0.02, 0.001, 0, 1.5);
    return {
      yIn: 0.02,
      yOut: 0.001,
      xIn: 0,
      m: 1.5,
      LGmin,
      LG: 1.5 * LGmin,
      A: (1.5 * LGmin) / 1.5,
    };
  })(),
  startWith: ['yIn', 'yOut', 'xIn', 'm'],
  representation: {
    kind: 'phaseEnvelope',
    mode: 'xy',
    m: 'm',
    absorber: { yIn: 'yIn', yOut: 'yOut', xIn: 'xIn', LG: 'LG', A: 'A', LGmin: 'LGmin' },
  },
};

/** The phaseEnvelope demos (HC8), one per mode and case, plus the edges. */
export const PHASE_ENVELOPE_DEMOS: ModuleDef[] = [
  pxyBubble,
  pxyDew,
  pxyFlash,
  pxyMargules,
  pxyMargulesAzeotrope,
  pxyRaoult,
  txy,
  xyTotal,
  xyTotalClose,
  xyMinReflux,
  xyOperatingLine,
  xyMcCabe,
  xyMcCabeTwoPhase,
  xyAbsorber,
  xyMinLiquid,
];

export const HE1I_GALLERY_MODULES: ModuleDef[] = [...PHASE_ENVELOPE_DEMOS];

export const HE1I_GALLERY_LAYOUTS: LayoutDef[] = [];
