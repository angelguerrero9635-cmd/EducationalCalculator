/**
 * College gallery demos, round 3, group G (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC43 `gasPiston` `pv` and `real`: the laws of thermodynamics (docs/plans/he.physics.md P27,
 * he.chemistry.md P11) and real gases (he.chemistry.md P10). HC44 `energyProfile` free energy,
 * mechanisms and the bomb calorimeter (he.biology.md P2, he.chemistry.md P15). HC57 the
 * pathway detail and stage cards of metabolism (he.chemistry.md P20). HC79 `membrane` potential
 * and water potential (he.biology.md P5).
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

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

/** A demo module: the shared fields filled in (college pages show 4 figures). */
const demo = (m: Omit<ModuleDef, 'workedFigures'> & { workedFigures?: number }): ModuleDef => ({
  workedFigures: 4,
  ...m,
});

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

/** a = b × c, solved for each. */
const product = (
  a: string,
  b: string,
  c: string,
  id: string,
  how: { [k: string]: string },
): Rule => ({
  relation: {
    id,
    display: `{${a}} = {${b}} × {${c}}`,
    vars: [a, b, c],
    residual: (x) => x[a]! - x[b]! * x[c]!,
    solve: {
      [a]: (x) => x[b]! * x[c]!,
      [b]: (x) => div(x[a]!, x[c]!),
      [c]: (x) => div(x[a]!, x[b]!),
    },
  },
  steps: {
    [a]: st(`{${b}} × {${c}}`, how[a] ?? 'Multiply.'),
    [b]: st(`{${a}} ÷ {${c}}`, how[b] ?? 'Divide.'),
    [c]: st(`{${a}} ÷ {${b}}`, how[c] ?? 'Divide.'),
  },
});

// ── HC43: gasPiston pv (thermal-statistical#0, physical-1#0) ──

const R = 8.314;

const nMol = () => quantity('n', 'n', 'Amount of gas', 'mol', 0.001, 1000, 0.01);
const vol = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, 'L', 0.001, 100000, 0.1);
const kelvin = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, 'K', 1, 5000, 0.01);

/** W = nRT ln(V₂/V₁) (by the gas), or w = −nRT ln(V₂/V₁) (on it, `on`). */
const isothermalWork = (W: string, symbol: string, on: boolean): Rule => {
  const s = on ? -1 : 1;
  const f = (x: Values) => s * x.n! * R * x.T! * Math.log(x.V2! / x.V1!);
  const m = on ? '−' : '';
  return {
    relation: {
      id: `${symbol} = ${m}nRT ln(V₂/V₁)`,
      display: `{${W}} = ${m}{n} × ${R} × {T} × ln({V2} ÷ {V1})`,
      vars: [W, 'n', 'T', 'V1', 'V2'],
      residual: (x) => x[W]! - f(x),
      solve: {
        [W]: f,
        n: (x) => div(x[W]!, s * R * x.T! * Math.log(x.V2! / x.V1!)),
        T: (x) => div(x[W]!, s * R * x.n! * Math.log(x.V2! / x.V1!)),
        V2: (x) => x.V1! * Math.exp(x[W]! / (s * x.n! * R * x.T!)),
        V1: (x) => x.V2! / Math.exp(x[W]! / (s * x.n! * R * x.T!)),
      },
    },
    steps: {
      [W]: st(
        `${m}{n} × ${R} × {T} × ln({V2} ÷ {V1})`,
        `The area under the isotherm P = nRT ÷ V from V₁ to V₂ is nRT ln(V₂/V₁)${on ? '; work on the gas is its negative' : ''}.`,
      ),
      n: st(`{${W}} ÷ (${m}${R} × {T} × ln({V2} ÷ {V1}))`, 'Divide the work by RT ln(V₂/V₁).'),
      T: st(`{${W}} ÷ (${m}${R} × {n} × ln({V2} ÷ {V1}))`, 'Divide the work by nR ln(V₂/V₁).'),
      V2: st(`{V1} × e^({${W}} ÷ (${m}{n} × ${R} × {T}))`, 'Undo the log: V₂/V₁ = e^(work ÷ nRT).'),
      V1: st(
        `{V2} ÷ e^({${W}} ÷ (${m}{n} × ${R} × {T}))`,
        'Undo the log, then divide V₂ by the ratio.',
      ),
    },
  };
};

/** a = b (the heat equals the work when ΔU = 0), signed by `k` (q = −w). */
const equalOf = (a: string, b: string, k: 1 | -1, id: string, why: string): Rule => ({
  relation: {
    id,
    display: `{${a}} = ${k < 0 ? '−' : ''}{${b}}`,
    vars: [a, b],
    residual: (x) => x[a]! - k * x[b]!,
    solve: { [a]: (x) => k * x[b]!, [b]: (x) => k * x[a]! },
  },
  steps: {
    [a]: st(`${k < 0 ? '−' : ''}{${b}}`, why),
    [b]: st(`${k < 0 ? '−' : ''}{${a}}`, why),
  },
});

const entropy = (q: string): Rule => ({
  relation: {
    id: 'ΔS = Q ÷ T',
    display: `{dS} = {${q}} ÷ {T}`,
    vars: ['dS', q, 'T'],
    residual: (x) => x.dS! * x.T! - x[q]!,
    solve: {
      dS: (x) => div(x[q]!, x.T!),
      [q]: (x) => x.dS! * x.T!,
      T: (x) => div(x[q]!, x.dS!),
    },
  },
  steps: {
    dS: st(`{${q}} ÷ {T}`, 'At one temperature the entropy change is the heat taken in ÷ T.'),
    [q]: st('{dS} × {T}', 'Multiply ΔS by T.'),
    T: st(`{${q}} ÷ {dS}`, 'Divide the heat by ΔS.'),
  },
});

const isothermalDemo = (
  id: string,
  title: string,
  on: boolean,
  [n, T, V1, V2]: number[],
): ModuleDef => {
  const W = (on ? -1 : 1) * n! * R * T! * Math.log(V2! / V1!);
  const Q = on ? -W : W;
  const [w, q] = on ? ['w', 'q'] : ['W', 'Q'];
  return demo({
    id,
    title,
    use: on
      ? 'Use this for w, q and ΔS of a reversible isothermal expansion or compression of an ideal gas.'
      : 'Use this for the work, heat and entropy change when an ideal gas expands at constant temperature.',
    assumptions: [
      'An ideal gas, changed slowly (reversibly) at a fixed temperature, so ΔU = 0.',
      on
        ? 'w is the work done on the gas, −∫P dV with P = nRT ÷ V; q = −w; R = 8.314 J/(mol·K).'
        : 'W is the work done by the gas, ∫P dV with P = nRT ÷ V: the area under the curve; Q = W; R = 8.314 J/(mol·K).',
      'Volumes in liters, so P is in kPa and P × V in J.',
    ],
    variables: [
      nMol(),
      kelvin('T', 'T', 'Temperature'),
      vol('V1', 'V₁', 'Starting volume'),
      vol('V2', 'V₂', 'Final volume'),
      quantity(w, w, on ? 'Work done on the gas' : 'Work done by the gas', 'J', -1e9, 1e9, 0.1),
      quantity(q, q, 'Heat taken in', 'J', -1e9, 1e9, 0.1),
      quantity('dS', 'ΔS', 'Entropy change', 'J/K', -1e7, 1e7, 0.001),
    ],
    ...rules(
      isothermalWork(w, w, on),
      equalOf(
        q,
        w,
        on ? -1 : 1,
        on ? 'q = −w' : 'Q = W',
        'ΔU = 0 at constant T, so the heat in matches the work the gas does.',
      ),
      entropy(q),
    ),
    example: { n: n!, T: T!, V1: V1!, V2: V2!, [w]: W, [q]: Q, dS: Q / T! },
    startWith: ['n', 'T', 'V1', 'V2'],
    representation: {
      kind: 'gasPiston',
      law: 'ideal',
      pv: {
        path: 'isothermal',
        v1: 'V1',
        v2: 'V2',
        t1: 'T',
        moles: 'n',
        work: w,
        heat: q,
        sign: on ? 'on' : 'by',
      },
    },
  });
};

const pvIsothermal = isothermalDemo(
  'g.he-gasPiston-pv-isothermal',
  'Isothermal expansion: 1 mol at 300 K doubles its volume',
  false,
  [1, 300, 10, 20],
);
const pvChemistry = isothermalDemo(
  'g.he-gasPiston-pv-chemistry',
  'Reversible isothermal expansion, 10 L to 20 L at 298.15 K (work on the gas)',
  true,
  [1, 298.15, 10, 20],
);
const pvCompress = isothermalDemo(
  'g.he-gasPiston-pv-compress',
  'Isothermal compression to a tenth of the volume',
  false,
  [0.5, 400, 20, 2],
);

/** T₂ = T₁(V₁/V₂)^(γ − 1) and W = nR(T₁ − T₂) ÷ (γ − 1), by the gas. */
const adiabaticDemo = (() => {
  const [n, g, T1, V1, V2] = [1, 5 / 3, 300, 10, 20];
  const T2 = T1 * (V1 / V2) ** (g - 1);
  const W = (n * R * (T1 - T2)) / (g - 1);
  return demo({
    id: 'g.he-gasPiston-pv-adiabatic',
    title: 'Adiabatic expansion: 1 mol of a monatomic gas doubles its volume',
    use: 'Use this for the final temperature and the work of a reversible adiabatic expansion.',
    assumptions: [
      'No heat crosses (Q = 0), so the work comes out of the internal energy and the gas cools.',
      'γ = 5/3 for a monatomic gas, 7/5 for a diatomic one; Cᵥ = R ÷ (γ − 1), R = 8.314 J/(mol·K).',
      'Volumes in liters, so P is in kPa.',
    ],
    variables: [
      nMol(),
      quantity('g', 'γ', 'Heat capacity ratio', undefined, 1.01, 2, 0.001, {
        allowed: [5 / 3, 7 / 5],
        fraction: 5,
      }),
      kelvin('T1', 'T₁', 'Starting temperature'),
      vol('V1', 'V₁', 'Starting volume'),
      vol('V2', 'V₂', 'Final volume'),
      kelvin('T2', 'T₂', 'Final temperature'),
      quantity('W', 'W', 'Work done by the gas', 'J', -1e9, 1e9, 0.1),
    ],
    ...rules(
      {
        relation: {
          id: 'T₂ = T₁(V₁/V₂)^(γ − 1)',
          display: '{T2} = {T1} × ({V1} ÷ {V2})^({g} − 1)',
          vars: ['T2', 'T1', 'V1', 'V2', 'g'],
          residual: (x) => x.T2! - x.T1! * (x.V1! / x.V2!) ** (x.g! - 1),
          solve: {
            T2: (x) => x.T1! * (x.V1! / x.V2!) ** (x.g! - 1),
            T1: (x) => div(x.T2!, (x.V1! / x.V2!) ** (x.g! - 1)),
            V2: (x) => x.V1! / (x.T2! / x.T1!) ** (1 / (x.g! - 1)),
            V1: (x) => x.V2! * (x.T2! / x.T1!) ** (1 / (x.g! - 1)),
          },
        },
        steps: {
          T2: st('{T1} × ({V1} ÷ {V2})^({g} − 1)', 'TV^(γ − 1) stays the same along an adiabat.'),
          T1: st('{T2} ÷ ({V1} ÷ {V2})^({g} − 1)', 'Divide T₂ by the volume ratio’s power.'),
          V2: st('{V1} ÷ ({T2} ÷ {T1})^(1 ÷ ({g} − 1))', 'Undo the power 1 ÷ (γ − 1).'),
          V1: st('{V2} × ({T2} ÷ {T1})^(1 ÷ ({g} − 1))', 'Undo the power 1 ÷ (γ − 1).'),
        },
      },
      {
        relation: {
          id: 'W = nR(T₁ − T₂) ÷ (γ − 1)',
          display: `{W} = {n} × ${R} × ({T1} − {T2}) ÷ ({g} − 1)`,
          vars: ['W', 'n', 'T1', 'T2', 'g'],
          residual: (x) => x.W! * (x.g! - 1) - x.n! * R * (x.T1! - x.T2!),
          solve: {
            W: (x) => div(x.n! * R * (x.T1! - x.T2!), x.g! - 1),
            n: (x) => div(x.W! * (x.g! - 1), R * (x.T1! - x.T2!)),
          },
        },
        steps: {
          W: st(
            `{n} × ${R} × ({T1} − {T2}) ÷ ({g} − 1)`,
            'No heat comes in, so W = −ΔU = nCᵥ(T₁ − T₂) with Cᵥ = R ÷ (γ − 1).',
          ),
          n: st(`{W} × ({g} − 1) ÷ (${R} × ({T1} − {T2}))`, 'Divide the work by Cᵥ(T₁ − T₂).'),
        },
      },
    ),
    example: { n, g, T1, V1, V2, T2, W },
    startWith: ['n', 'g', 'T1', 'V1', 'V2'],
    representation: {
      kind: 'gasPiston',
      law: 'ideal',
      pv: {
        path: 'adiabatic',
        v1: 'V1',
        v2: 'V2',
        t1: 'T1',
        t2: 'T2',
        moles: 'n',
        gamma: 'g',
        work: 'W',
      },
    },
  });
})();

/** Chemistry's adiabat: T₂ = T₁(V₁/V₂)^(R/Cᵥ), w = nCᵥ(T₂ − T₁) on the gas. */
const adiabaticChem = (() => {
  const [n, cv, T1, V1, V2] = [1, 20.79, 300, 10, 20];
  const T2 = T1 * (V1 / V2) ** (R / cv);
  const w = n * cv * (T2 - T1);
  return demo({
    id: 'g.he-gasPiston-pv-adiabatic-diatomic',
    title: 'Reversible adiabatic expansion of a diatomic gas (work on the gas)',
    use: 'Use this for T₂ and w of a reversible adiabatic expansion from Cᵥ.',
    assumptions: [
      'q = 0, so ΔU = w: the gas cools as it does work.',
      'Cᵥ is 12.47 J/(mol·K) (3R/2, monatomic) or 20.79 (5R/2, diatomic); R = 8.314 J/(mol·K).',
      'w is the work done on the gas; volumes in liters, P in kPa.',
    ],
    variables: [
      nMol(),
      quantity('cv', 'Cᵥ', 'Molar heat capacity', 'J/(mol·K)', 1, 100, 0.01, {
        allowed: [12.47, 20.79],
      }),
      kelvin('T1', 'T₁', 'Starting temperature'),
      vol('V1', 'V₁', 'Starting volume'),
      vol('V2', 'V₂', 'Final volume'),
      kelvin('T2', 'T₂', 'Final temperature'),
      quantity('w', 'w', 'Work done on the gas', 'J', -1e9, 1e9, 0.1),
    ],
    ...rules(
      {
        relation: {
          id: 'T₂ = T₁(V₁/V₂)^(R/Cᵥ)',
          display: `{T2} = {T1} × ({V1} ÷ {V2})^(${R} ÷ {cv})`,
          vars: ['T2', 'T1', 'V1', 'V2', 'cv'],
          residual: (x) => x.T2! - x.T1! * (x.V1! / x.V2!) ** (R / x.cv!),
          solve: {
            T2: (x) => x.T1! * (x.V1! / x.V2!) ** (R / x.cv!),
            T1: (x) => div(x.T2!, (x.V1! / x.V2!) ** (R / x.cv!)),
            V2: (x) => x.V1! / (x.T2! / x.T1!) ** (x.cv! / R),
          },
        },
        steps: {
          T2: st(
            `{T1} × ({V1} ÷ {V2})^(${R} ÷ {cv})`,
            'Along a reversible adiabat T^(Cᵥ/R) × V stays the same.',
          ),
          T1: st(`{T2} ÷ ({V1} ÷ {V2})^(${R} ÷ {cv})`, 'Divide T₂ by the volume ratio’s power.'),
          V2: st(`{V1} ÷ ({T2} ÷ {T1})^({cv} ÷ ${R})`, 'Undo the power R ÷ Cᵥ.'),
        },
      },
      {
        relation: {
          id: 'w = nCᵥ(T₂ − T₁)',
          display: '{w} = {n} × {cv} × ({T2} − {T1})',
          vars: ['w', 'n', 'cv', 'T2', 'T1'],
          residual: (x) => x.w! - x.n! * x.cv! * (x.T2! - x.T1!),
          solve: {
            w: (x) => x.n! * x.cv! * (x.T2! - x.T1!),
            n: (x) => div(x.w!, x.cv! * (x.T2! - x.T1!)),
          },
        },
        steps: {
          w: st('{n} × {cv} × ({T2} − {T1})', 'q = 0, so w = ΔU = nCᵥΔT.'),
          n: st('{w} ÷ ({cv} × ({T2} − {T1}))', 'Divide w by CᵥΔT.'),
        },
      },
    ),
    example: { n, cv, T1, V1, V2, T2, w },
    startWith: ['n', 'cv', 'T1', 'V1', 'V2'],
    representation: {
      kind: 'gasPiston',
      law: 'ideal',
      pv: {
        path: 'adiabatic',
        v1: 'V1',
        v2: 'V2',
        t1: 'T1',
        t2: 'T2',
        moles: 'n',
        cv: 'cv',
        work: 'w',
        sign: 'on',
      },
    },
  });
})();

/** Constant pressure: W = P(V₂ − V₁), T₂ = T₁V₂ ÷ V₁, P = nRT₁ ÷ V₁. */
const isobaric = (() => {
  const [n, T1, V1, V2] = [2, 300, 20, 30];
  const P = (n * R * T1) / V1;
  const W = P * (V2 - V1);
  const T2 = (T1 * V2) / V1;
  return demo({
    id: 'g.he-gasPiston-pv-isobaric',
    title: 'Heating at constant pressure: the gas pushes the piston out',
    use: 'Use this for the work an ideal gas does as it expands at constant pressure.',
    assumptions: [
      'The pressure is held (a free piston under a fixed load), so W = P(V₂ − V₁).',
      'P = nRT ÷ V with R = 8.314 J/(mol·K), V in liters and P in kPa (kPa × L = J).',
    ],
    variables: [
      nMol(),
      kelvin('T1', 'T₁', 'Starting temperature'),
      vol('V1', 'V₁', 'Starting volume'),
      vol('V2', 'V₂', 'Final volume'),
      quantity('P', 'P', 'Pressure', 'kPa', 0.001, 1e6, 0.01),
      kelvin('T2', 'T₂', 'Final temperature'),
      quantity('W', 'W', 'Work done by the gas', 'J', -1e9, 1e9, 0.1),
    ],
    ...rules(
      {
        relation: {
          id: 'PV₁ = nRT₁',
          display: `{P} × {V1} = {n} × ${R} × {T1}`,
          vars: ['P', 'V1', 'n', 'T1'],
          residual: (x) => x.P! * x.V1! - x.n! * R * x.T1!,
          solve: {
            P: (x) => div(x.n! * R * x.T1!, x.V1!),
            n: (x) => div(x.P! * x.V1!, R * x.T1!),
            T1: (x) => div(x.P! * x.V1!, x.n! * R),
          },
        },
        steps: {
          P: st(`{n} × ${R} × {T1} ÷ {V1}`, 'PV = nRT at the start.'),
          n: st(`{P} × {V1} ÷ (${R} × {T1})`, 'n = PV ÷ RT.'),
          T1: st(`{P} × {V1} ÷ ({n} × ${R})`, 'T = PV ÷ nR.'),
        },
      },
      {
        relation: {
          id: 'W = P(V₂ − V₁)',
          display: '{W} = {P} × ({V2} − {V1})',
          vars: ['W', 'P', 'V2', 'V1'],
          residual: (x) => x.W! - x.P! * (x.V2! - x.V1!),
          solve: {
            W: (x) => x.P! * (x.V2! - x.V1!),
            V2: (x) => x.V1! + div(x.W!, x.P!)!,
          },
        },
        steps: {
          W: st('{P} × ({V2} − {V1})', 'At constant P the area under the path is a rectangle.'),
          V2: st('{V1} + {W} ÷ {P}', 'Add W ÷ P to the starting volume.'),
        },
      },
      {
        relation: {
          id: 'T₂ = T₁V₂ ÷ V₁',
          display: '{T2} = {T1} × {V2} ÷ {V1}',
          vars: ['T2', 'T1', 'V2', 'V1'],
          residual: (x) => x.T2! * x.V1! - x.T1! * x.V2!,
          solve: { T2: (x) => div(x.T1! * x.V2!, x.V1!) },
        },
        steps: { T2: st('{T1} × {V2} ÷ {V1}', 'At constant P, V ∝ T (Charles’s law).') },
      },
    ),
    example: { n, T1, V1, V2, P, T2, W },
    startWith: ['n', 'T1', 'V1', 'V2'],
    representation: {
      kind: 'gasPiston',
      law: 'ideal',
      pv: {
        path: 'isobaric',
        v1: 'V1',
        v2: 'V2',
        t1: 'T1',
        t2: 'T2',
        p1: 'P',
        moles: 'n',
        work: 'W',
      },
    },
  });
})();

/** Constant volume: no work; P₂ = P₁T₂ ÷ T₁. */
const isochoric = (() => {
  const [n, V, T1, T2] = [1, 10, 300, 450];
  const P1 = (n * R * T1) / V;
  const P2 = (n * R * T2) / V;
  return demo({
    id: 'g.he-gasPiston-pv-isochoric',
    title: 'Heating at constant volume: the pressure rises, no work',
    use: 'Use this for the pressure of a gas heated in a fixed volume, and why it does no work.',
    assumptions: [
      'The piston is pinned: V is held, so there is no area under the path and W = 0.',
      'P = nRT ÷ V with R = 8.314 J/(mol·K), V in liters and P in kPa.',
    ],
    variables: [
      nMol(),
      vol('V', 'V', 'Volume'),
      kelvin('T1', 'T₁', 'Starting temperature'),
      kelvin('T2', 'T₂', 'Final temperature'),
      quantity('P1', 'P₁', 'Starting pressure', 'kPa', 0.001, 1e6, 0.01),
      quantity('P2', 'P₂', 'Final pressure', 'kPa', 0.001, 1e6, 0.01),
    ],
    ...rules(
      ...(['1', '2'] as const).map((k): Rule => ({
        relation: {
          id: `P${k}V = nRT${k}`,
          display: `{P${k}} × {V} = {n} × ${R} × {T${k}}`,
          vars: [`P${k}`, 'V', 'n', `T${k}`],
          residual: (x) => x[`P${k}`]! * x.V! - x.n! * R * x[`T${k}`]!,
          solve: {
            [`P${k}`]: (x) => div(x.n! * R * x[`T${k}`]!, x.V!),
            [`T${k}`]: (x) => div(x[`P${k}`]! * x.V!, x.n! * R),
            ...(k === '1'
              ? {
                  n: (x: Values) => div(x.P1! * x.V!, R * x.T1!),
                  V: (x: Values) => div(x.n! * R * x.T1!, x.P1!),
                }
              : {}),
          },
        },
        steps: {
          [`P${k}`]: st(`{n} × ${R} × {T${k}} ÷ {V}`, 'PV = nRT for this state.'),
          [`T${k}`]: st(`{P${k}} × {V} ÷ ({n} × ${R})`, 'T = PV ÷ nR.'),
          ...(k === '1'
            ? {
                n: st(`{P1} × {V} ÷ (${R} × {T1})`, 'n = PV ÷ RT.'),
                V: st(`{n} × ${R} × {T1} ÷ {P1}`, 'V = nRT ÷ P.'),
              }
            : {}),
        },
      })),
    ),
    example: { n, V, T1, T2, P1, P2 },
    startWith: ['n', 'V', 'T1', 'T2'],
    representation: {
      kind: 'gasPiston',
      law: 'ideal',
      pv: { path: 'isochoric', v1: 'V', p1: 'P1', p2: 'P2', t1: 'T1', t2: 'T2', moles: 'n' },
    },
  });
})();

/**
 * A three-leg cycle: isothermal expansion 1 → 2 at T₁, isobaric compression 2 → 3 back to V₁,
 * isochoric heating 3 → 1. Net W = nRT₁ ln(V₂/V₁) − P₂(V₂ − V₁).
 */
const cycle = (() => {
  const [n, T1, V1, V2] = [1, 400, 10, 30];
  const W12 = n * R * T1 * Math.log(V2 / V1);
  const P2 = (n * R * T1) / V2;
  const W23 = P2 * (V1 - V2);
  const Wnet = W12 + W23;
  return demo({
    id: 'g.he-gasPiston-pv-cycle',
    title: 'A cycle: isothermal out, isobaric back, heated at constant volume',
    use: 'Use this for the net work of a cycle on a P–V diagram: the area it encloses.',
    assumptions: [
      '1 → 2 isothermal at T₁, 2 → 3 at constant pressure back to V₁, 3 → 1 at constant volume.',
      'Clockwise loops give net work by the gas; R = 8.314 J/(mol·K), V in liters, P in kPa.',
    ],
    variables: [
      nMol(),
      kelvin('T1', 'T₁', 'Temperature of the isotherm'),
      vol('V1', 'V₁', 'Smallest volume'),
      vol('V2', 'V₂', 'Largest volume'),
      quantity('P2', 'P₂', 'Pressure of the isobar', 'kPa', 0.001, 1e6, 0.01),
      quantity('W12', 'W₁₂', 'Work out on the isotherm', 'J', -1e9, 1e9, 0.1),
      quantity('W23', 'W₂₃', 'Work on the isobar', 'J', -1e9, 1e9, 0.1),
      quantity('W', 'W', 'Net work by the gas', 'J', -1e9, 1e9, 0.1),
    ],
    ...rules(
      {
        relation: {
          id: 'W₁₂ = nRT₁ ln(V₂/V₁)',
          display: `{W12} = {n} × ${R} × {T1} × ln({V2} ÷ {V1})`,
          vars: ['W12', 'n', 'T1', 'V1', 'V2'],
          residual: (x) => x.W12! - x.n! * R * x.T1! * Math.log(x.V2! / x.V1!),
          solve: {
            W12: (x) => x.n! * R * x.T1! * Math.log(x.V2! / x.V1!),
            T1: (x) => div(x.W12!, x.n! * R * Math.log(x.V2! / x.V1!)),
          },
        },
        steps: {
          W12: st(`{n} × ${R} × {T1} × ln({V2} ÷ {V1})`, 'The area under the isotherm.'),
          T1: st(`{W12} ÷ ({n} × ${R} × ln({V2} ÷ {V1}))`, 'Divide by nR ln(V₂/V₁).'),
        },
      },
      {
        relation: {
          id: 'P₂V₂ = nRT₁',
          display: `{P2} × {V2} = {n} × ${R} × {T1}`,
          vars: ['P2', 'V2', 'n', 'T1'],
          residual: (x) => x.P2! * x.V2! - x.n! * R * x.T1!,
          solve: {
            P2: (x) => div(x.n! * R * x.T1!, x.V2!),
            n: (x) => div(x.P2! * x.V2!, R * x.T1!),
          },
        },
        steps: {
          P2: st(`{n} × ${R} × {T1} ÷ {V2}`, 'State 2 is still on the isotherm: P = nRT ÷ V.'),
          n: st(`{P2} × {V2} ÷ (${R} × {T1})`, 'n = PV ÷ RT.'),
        },
      },
      {
        relation: {
          id: 'W₂₃ = P₂(V₁ − V₂)',
          display: '{W23} = {P2} × ({V1} − {V2})',
          vars: ['W23', 'P2', 'V1', 'V2'],
          residual: (x) => x.W23! - x.P2! * (x.V1! - x.V2!),
          solve: { W23: (x) => x.P2! * (x.V1! - x.V2!) },
        },
        steps: { W23: st('{P2} × ({V1} − {V2})', 'Compressed at constant P: negative work.') },
      },
      {
        relation: {
          id: 'W = W₁₂ + W₂₃',
          display: '{W} = {W12} + {W23}',
          vars: ['W', 'W12', 'W23'],
          residual: (x) => x.W! - x.W12! - x.W23!,
          solve: {
            W: (x) => x.W12! + x.W23!,
            W12: (x) => x.W! - x.W23!,
            W23: (x) => x.W! - x.W12!,
          },
        },
        steps: {
          W: st('{W12} + {W23}', 'The isochore adds no work: the net is the two others.'),
          W12: st('{W} − {W23}', 'Take the isobar’s work from the net.'),
          W23: st('{W} − {W12}', 'Take the isotherm’s work from the net.'),
        },
      },
    ),
    example: { n, T1, V1, V2, P2, W12, W23, W: Wnet },
    startWith: ['n', 'T1', 'V1', 'V2'],
    representation: {
      kind: 'gasPiston',
      law: 'ideal',
      pv: {
        path: 'cycle',
        moles: 'n',
        corners: [
          { volume: 'V1', temperature: 'T1' },
          { volume: 'V2', temperature: 'T1' },
          { volume: 'V1', pressure: 'P2' },
        ],
        legs: ['isothermal', 'isobaric', 'isochoric'],
        work: 'W',
      },
    },
  });
})();

// ── HC43: gasPiston real (gen-chem-1#2~real-gas) ──

const R_ATM = 0.08206;

const realDemo = (id: string, title: string, gas: string, [n, V, T, a, b]: number[]): ModuleDef => {
  const Pid = (n! * R_ATM * T!) / V!;
  const P = (n! * R_ATM * T!) / (V! - n! * b!) - (a! * n! * n!) / (V! * V!);
  return demo({
    id,
    title,
    use: 'Use this for the van der Waals pressure of a real gas beside the ideal pressure.',
    assumptions: [
      'b is the molecules’ own volume per mole, a their attraction; Z < 1 means attraction wins.',
      'R = 0.08206 L·atm/(mol·K) with V in liters, P in atm, T in kelvins.',
    ],
    variables: [
      nMol(),
      vol('V', 'V', 'Volume'),
      kelvin('T', 'T', 'Temperature'),
      quantity('a', 'a', 'Attraction constant', 'L²·atm/mol²', 0.001, 50, 0.001),
      quantity('b', 'b', 'Excluded volume', 'L/mol', 0.0001, 0.5, 0.0001),
      quantity('Pid', 'P(ideal)', 'Ideal pressure', 'atm', 1e-6, 1e5, 0.01),
      quantity('P', 'P', 'Van der Waals pressure', 'atm', 1e-6, 1e5, 0.01),
      quantity('Z', 'Z', 'Compressibility factor', undefined, 0.01, 10, 0.001),
    ],
    ...rules(
      {
        relation: {
          id: 'P(ideal) = nRT ÷ V',
          display: `{Pid} = {n} × ${R_ATM} × {T} ÷ {V}`,
          vars: ['Pid', 'n', 'T', 'V'],
          residual: (x) => x.Pid! * x.V! - x.n! * R_ATM * x.T!,
          solve: {
            Pid: (x) => div(x.n! * R_ATM * x.T!, x.V!),
            n: (x) => div(x.Pid! * x.V!, R_ATM * x.T!),
            T: (x) => div(x.Pid! * x.V!, x.n! * R_ATM),
            V: (x) => div(x.n! * R_ATM * x.T!, x.Pid!),
          },
        },
        steps: {
          Pid: st(`{n} × ${R_ATM} × {T} ÷ {V}`, 'The ideal gas law.'),
          n: st(`{Pid} × {V} ÷ (${R_ATM} × {T})`, 'n = PV ÷ RT.'),
          T: st(`{Pid} × {V} ÷ ({n} × ${R_ATM})`, 'T = PV ÷ nR.'),
          V: st(`{n} × ${R_ATM} × {T} ÷ {Pid}`, 'V = nRT ÷ P.'),
        },
      },
      {
        relation: {
          id: 'P = nRT ÷ (V − nb) − an² ÷ V²',
          display: `{P} = {n} × ${R_ATM} × {T} ÷ ({V} − {n} × {b}) − {a} × {n}² ÷ {V}²`,
          vars: ['P', 'n', 'T', 'V', 'a', 'b'],
          residual: (x) =>
            x.P! - (x.n! * R_ATM * x.T!) / (x.V! - x.n! * x.b!) + (x.a! * x.n! ** 2) / x.V! ** 2,
          solve: {
            P: (x) =>
              x.V! > x.n! * x.b!
                ? (x.n! * R_ATM * x.T!) / (x.V! - x.n! * x.b!) - (x.a! * x.n! ** 2) / x.V! ** 2
                : undefined,
            T: (x) =>
              div((x.P! + (x.a! * x.n! ** 2) / x.V! ** 2) * (x.V! - x.n! * x.b!), x.n! * R_ATM),
          },
        },
        steps: {
          P: st(
            `{n} × ${R_ATM} × {T} ÷ ({V} − {n} × {b}) − {a} × {n}² ÷ {V}²`,
            'The molecules have less room (V − nb) and pull on each other (an² ÷ V² less push).',
          ),
          T: st(
            `({P} + {a} × {n}² ÷ {V}²) × ({V} − {n} × {b}) ÷ ({n} × ${R_ATM})`,
            'Add the attraction back, multiply by the free volume, divide by nR.',
          ),
        },
      },
      {
        relation: {
          id: 'nb < V',
          constraint: true,
          display: '{n} × {b} < {V}',
          vars: ['n', 'b', 'V'],
          residual: (x: Values) => (x.n! * x.b! < x.V! ? 0 : 1),
          solve: {},
          message: () => 'The molecules’ own volume nb must be less than V.',
        },
        steps: {},
      },
      {
        relation: {
          id: 'Z = P ÷ P(ideal)',
          display: '{Z} = {P} ÷ {Pid}',
          vars: ['Z', 'P', 'Pid'],
          residual: (x) => x.Z! * x.Pid! - x.P!,
          solve: { Z: (x) => div(x.P!, x.Pid!), P: (x) => x.Z! * x.Pid! },
        },
        steps: {
          Z: st('{P} ÷ {Pid}', 'Z = PV ÷ nRT, the real pressure over the ideal one.'),
          P: st('{Z} × {Pid}', 'Multiply the ideal pressure by Z.'),
        },
      },
    ),
    example: { n: n!, V: V!, T: T!, a: a!, b: b!, Pid, P, Z: P / Pid },
    startWith: ['n', 'V', 'T', 'a', 'b'],
    representation: {
      kind: 'gasPiston',
      law: 'ideal',
      volume: 'V',
      temperature: 'T',
      moles: 'n',
      R: R_ATM,
      real: { a: 'a', b: 'b', ideal: 'Pid', pressure: 'P', z: 'Z', gas },
    },
  });
};

const realCo2 = realDemo(
  'g.he-gasPiston-real-co2',
  'CO₂ in a small flask: van der Waals against ideal',
  'CO₂',
  [1, 0.5, 300, 3.59, 0.0427],
);
const realH2 = realDemo(
  'g.he-gasPiston-real-h2',
  'Hydrogen squeezed hard: the molecules’ own volume wins',
  'H₂',
  [1, 0.1, 300, 0.244, 0.0266],
);

// ── HC44: energyProfile quantity G, steps, bomb ──

const kjmol = (id: string, symbol: string, name: string, min = -10000, max = 10000) =>
  quantity(id, symbol, name, 'kJ/mol', min, max, 0.01);

/** a = b + c, solved for each. */
const sum = (a: string, b: string, c: string, id: string, why: string): Rule => ({
  relation: {
    id,
    display: `{${a}} = {${b}} + {${c}}`,
    vars: [a, b, c],
    residual: (x) => x[a]! - x[b]! - x[c]!,
    solve: {
      [a]: (x) => x[b]! + x[c]!,
      [b]: (x) => x[a]! - x[c]!,
      [c]: (x) => x[a]! - x[b]!,
    },
  },
  steps: {
    [a]: st(`{${b}} + {${c}}`, why),
    [b]: st(`{${a}} − {${c}}`, 'Take the other part from the total.'),
    [c]: st(`{${a}} − {${b}}`, 'Take the other part from the total.'),
  },
});

const ATP = -30.5;

/** A reaction pushed uphill by n ATP: ΔG = ΔG₁ + n × (−30.5) (principles-1#2). */
const coupledDemo = (id: string, title: string, dG1: number, n: number): ModuleDef =>
  demo({
    id,
    title,
    use: 'Use this for whether a reaction coupled to ATP runs: add the free energy changes.',
    assumptions: [
      'Free energies add when the reactions share an intermediate; ΔG < 0 runs forward on its own.',
      'Each ATP hydrolyzed to ADP + Pᵢ gives ΔG = −30.5 kJ/mol.',
    ],
    variables: [
      kjmol('dG1', 'ΔG₁', 'Free energy change of the uphill reaction', -100, 100),
      quantity('nA', 'n', 'ATP used', undefined, 1, 3, 1, { integer: true }),
      kjmol('dGA', 'ΔG(ATP)', 'Free energy from the ATP'),
      kjmol('dG', 'ΔG', 'Total free energy change'),
    ],
    ...rules(
      {
        relation: {
          id: 'ΔG(ATP) = n × (−30.5)',
          display: `{dGA} = {nA} × (${ATP})`,
          vars: ['dGA', 'nA'],
          residual: (x) => x.dGA! - x.nA! * ATP,
          solve: { dGA: (x) => x.nA! * ATP, nA: (x) => x.dGA! / ATP },
        },
        steps: {
          dGA: st(`{nA} × (${ATP})`, 'Each ATP gives −30.5 kJ/mol.'),
          nA: st(`{dGA} ÷ (${ATP})`, 'Divide by −30.5 kJ/mol per ATP.'),
        },
      },
      sum('dG', 'dG1', 'dGA', 'ΔG = ΔG₁ + ΔG(ATP)', 'The coupled reactions add.'),
    ),
    example: { dG1, nA: n, dGA: n * ATP, dG: dG1 + n * ATP },
    startWith: ['dG1', 'nA'],
    representation: {
      kind: 'energyProfile',
      mode: 'ladder',
      quantity: 'G',
      unit: 'kJ/mol',
      levels: [
        { name: 'Glu + NH₃ + ATP', value: 0 },
        { name: 'Gln + ATP' },
        { name: 'Gln + ADP + Pᵢ' },
      ],
      steps: [
        { from: 0, to: 1, value: 'dG1', label: 'ΔG₁' },
        { from: 1, to: 2, value: 'dGA', label: 'ATP' },
      ],
      total: { from: 0, to: 2, value: 'dG', label: 'ΔG' },
    },
  });

const coupled = coupledDemo(
  'g.he-energyProfile-coupled',
  'Glutamine from glutamate, pushed by one ATP',
  14.2,
  1,
);
const coupledShort = coupledDemo(
  'g.he-energyProfile-coupled-short',
  'Too steep for one ATP: ΔG₁ = +45 kJ/mol',
  45,
  1,
);

/** biochemistry#3~coupled: ΔG°′ total and K′ = e^(−ΔG°′ ÷ RT). */
const coupledK = (() => {
  const [g1, g2, T] = [13.8, -30.5, 298.15];
  const total = g1 + g2;
  const K = Math.exp(-total / (0.008314 * T));
  return demo({
    id: 'g.he-energyProfile-coupled-k',
    title: 'Glucose 6-phosphate from glucose and ATP: ΔG°′ and K′',
    use: 'Use this for ΔG°′ and K′ of a reaction coupled to ATP hydrolysis.',
    assumptions: [
      '°′ means pH 7 and 1 M for everything else; coupled ΔG°′ values add.',
      'K′ = e^(−ΔG°′ ÷ RT) with R = 0.008314 kJ/(mol·K).',
    ],
    variables: [
      kjmol('g1', 'ΔG₁°′', 'Uphill step (glucose + Pᵢ)', -100, 100),
      kjmol('g2', 'ΔG₂°′', 'ATP hydrolysis', -100, 100),
      kjmol('g', 'ΔG°′', 'Coupled reaction'),
      kelvin('T', 'T', 'Temperature'),
      quantity('K', 'K′', 'Equilibrium constant', undefined, 1e-30, 1e30, 0.01, {
        scientific: true,
      }),
    ],
    ...rules(sum('g', 'g1', 'g2', 'ΔG°′ = ΔG₁°′ + ΔG₂°′', 'Coupled reactions add.'), {
      relation: {
        id: 'K′ = e^(−ΔG°′ ÷ RT)',
        display: '{K} = e^(−{g} ÷ (0.008314 × {T}))',
        vars: ['K', 'g', 'T'],
        residual: (x) => Math.log(x.K!) + x.g! / (0.008314 * x.T!),
        solve: {
          K: (x) => Math.exp(-x.g! / (0.008314 * x.T!)),
          g: (x) => (x.K! > 0 ? -0.008314 * x.T! * Math.log(x.K!) : undefined),
        },
      },
      steps: {
        K: st('e^(−{g} ÷ (0.008314 × {T}))', 'ΔG°′ = −RT ln K′, so K′ = e^(−ΔG°′ ÷ RT).'),
        g: st('−0.008314 × {T} × ln({K})', 'ΔG°′ = −RT ln K′.'),
      },
    }),
    example: { g1, g2, g: total, T, K },
    startWith: ['g1', 'g2', 'T'],
    representation: {
      kind: 'energyProfile',
      mode: 'ladder',
      quantity: 'G°′',
      unit: 'kJ/mol',
      levels: [
        { name: 'Glc + Pᵢ + ATP', value: 0 },
        { name: 'G6P + ATP' },
        { name: 'G6P + ADP + Pᵢ' },
      ],
      steps: [
        { from: 0, to: 1, value: 'g1' },
        { from: 1, to: 2, value: 'g2' },
      ],
      total: { from: 0, to: 2, value: 'g' },
    },
  });
})();

/** principles-1#2~delta-g: ΔG = ΔG°′ + RT ln Q, Q = [P] ÷ [R]. */
const deltaG = (() => {
  const [g0, T, P, Rc] = [7.5, 310, 1, 100];
  const Q = P / Rc;
  const rq = 0.008314 * T * Math.log(Q);
  return demo({
    id: 'g.he-energyProfile-delta-g',
    title: 'ΔG in the cell: ΔG°′ = +7.5 kJ/mol with products at 1% of reactants',
    use: "Use this for 'With ΔG°′ = +7.5 kJ/mol and products at 1% of reactants, does the reaction run forward at 37 °C?'.",
    assumptions: [
      'ΔG = ΔG°′ + RT ln Q with R = 0.008314 kJ/(mol·K); Q = [products] ÷ [reactants].',
      'Q below 1 pulls ΔG down: a reaction uphill at 1 M can run in the cell.',
    ],
    variables: [
      kjmol('g0', 'ΔG°′', 'Standard free energy change', -100, 100),
      quantity('T', 'T', 'Temperature', 'K', 298, 310, 1, { allowed: [298, 310] }),
      quantity('P', '[P]', 'Products', 'mM', 0.0001, 10000, 0.0001),
      quantity('Rc', '[R]', 'Reactants', 'mM', 0.0001, 10000, 0.0001),
      quantity('Q', 'Q', 'Reaction quotient', undefined, 1e-9, 1e9, 0.0001),
      kjmol('rq', 'RT ln Q', 'Shift from the concentrations'),
      kjmol('g', 'ΔG', 'Free energy change in the cell'),
    ],
    ...rules(
      {
        relation: {
          id: 'Q = [P] ÷ [R]',
          display: '{Q} = {P} ÷ {Rc}',
          vars: ['Q', 'P', 'Rc'],
          residual: (x) => x.Q! * x.Rc! - x.P!,
          solve: { Q: (x) => div(x.P!, x.Rc!), P: (x) => x.Q! * x.Rc! },
        },
        steps: {
          Q: st('{P} ÷ {Rc}', 'Products over reactants.'),
          P: st('{Q} × {Rc}', 'Multiply Q by the reactants.'),
        },
      },
      {
        relation: {
          id: 'RT ln Q',
          display: '{rq} = 0.008314 × {T} × ln({Q})',
          vars: ['rq', 'T', 'Q'],
          residual: (x) => x.rq! - 0.008314 * x.T! * Math.log(x.Q!),
          solve: {
            rq: (x) => (x.Q! > 0 ? 0.008314 * x.T! * Math.log(x.Q!) : undefined),
            Q: (x) => Math.exp(x.rq! / (0.008314 * x.T!)),
          },
        },
        steps: {
          rq: st('0.008314 × {T} × ln({Q})', 'RT in kJ/mol times ln Q.'),
          Q: st('e^({rq} ÷ (0.008314 × {T}))', 'Undo the log.'),
        },
      },
      sum('g', 'g0', 'rq', 'ΔG = ΔG°′ + RT ln Q', 'Add the concentrations’ shift to ΔG°′.'),
    ),
    example: { g0, T, P, Rc, Q, rq, g: g0 + rq },
    startWith: ['g0', 'T', 'P', 'Rc'],
    representation: {
      kind: 'energyProfile',
      mode: 'ladder',
      quantity: 'G',
      unit: 'kJ/mol',
      levels: [
        { name: 'Reactants', value: 0 },
        { name: 'Products at 1 M' },
        { name: 'Products in the cell' },
      ],
      steps: [
        { from: 0, to: 1, value: 'g0', label: 'ΔG°′' },
        { from: 1, to: 2, value: 'rq', label: 'RT ln Q' },
      ],
      total: { from: 0, to: 2, value: 'g', label: 'ΔG' },
    },
  });
})();

/** A mechanism of k steps from reactants at 0: T₁ = Eₐ₁, Tᵢ = Iᵢ₋₁ + Eₐᵢ, ΔH = P. */
const stepsDemo = (
  id: string,
  title: string,
  use: string,
  ea: number[],
  inter: number[],
  P: number,
  names: { reactants: string; products: string; intermediates: string[] },
): ModuleDef => {
  const k = ea.length;
  const sub = (i: number) => '₀₁₂₃₄₅'[i] ?? '';
  const Ea = ea.map((_, i) => `Ea${i + 1}`);
  const I = inter.map((_, i) => `I${i + 1}`);
  const T = ea.map((_, i) => `T${i + 1}`);
  const levels = [0, ...inter, P];
  const tops = ea.map((e, i) => levels[i]! + e);
  const topRule = (i: number): Rule =>
    i === 0
      ? {
          relation: {
            id: 'T₁ = Eₐ₁',
            display: '{T1} = {Ea1}',
            vars: ['T1', 'Ea1'],
            residual: (x) => x.T1! - x.Ea1!,
            solve: { T1: (x) => x.Ea1!, Ea1: (x) => x.T1! },
          },
          steps: {
            T1: st('{Ea1}', 'The reactants are at 0, so the first top is Eₐ₁.'),
            Ea1: st('{T1}', 'The reactants are at 0.'),
          },
        }
      : sum(
          T[i]!,
          I[i - 1]!,
          Ea[i]!,
          `T${sub(i + 1)} = I${sub(i)} + Eₐ${sub(i + 1)}`,
          `Climb Eₐ${sub(i + 1)} from the intermediate.`,
        );
  return demo({
    id,
    title,
    use,
    assumptions: [
      'Energies in kJ/mol with the reactants at 0; each step climbs its Eₐ from the level before it.',
      'The step with the highest transition state is rate-determining.',
    ],
    variables: [
      ...ea.flatMap((_, i) => [
        kjmol(Ea[i]!, `Eₐ${sub(i + 1)}`, `Barrier of step ${i + 1}`, 0, 1000),
        ...(i < k - 1
          ? [kjmol(I[i]!, `I${sub(i + 1)}`, `Intermediate ${i + 1}`, -1000, 1000)]
          : []),
      ]),
      kjmol('P', 'P', 'Products', -1000, 1000),
      ...T.map((t, i) => kjmol(t, `T${sub(i + 1)}`, `Transition state ${i + 1}`, -1000, 2000)),
      { ...kjmol('hi', 'T(max)', 'Highest transition state', -1000, 2000), derived: true },
      kjmol('rev', 'Eₐ(rev)', 'Reverse barrier of the last step', 0, 3000),
      kjmol('dH', 'ΔH', 'Enthalpy change', -1000, 1000),
    ],
    ...rules(
      ...ea.map((_, i) => topRule(i)),
      {
        relation: {
          id: 'T(max) = the highest top',
          display: `{hi} = greatest of ${T.map((t) => `{${t}}`).join(', ')}`,
          vars: ['hi', ...T],
          residual: (x) => x.hi! - Math.max(...T.map((t) => x[t]!)),
          solve: { hi: (x) => Math.max(...T.map((t) => x[t]!)) },
        },
        steps: {
          hi: st(
            `greatest of ${T.map((t) => `{${t}}`).join(', ')}`,
            'The highest transition state sets the rate-determining step.',
          ),
        },
      },
      {
        relation: {
          id: 'Eₐ(rev) = T(last) − P',
          display: `{rev} = {${T[k - 1]}} − {P}`,
          vars: ['rev', T[k - 1]!, 'P'],
          residual: (x) => x.rev! - x[T[k - 1]!]! + x.P!,
          solve: {
            rev: (x) => x[T[k - 1]!]! - x.P!,
            P: (x) => x[T[k - 1]!]! - x.rev!,
            [T[k - 1]!]: (x) => x.rev! + x.P!,
          },
        },
        steps: {
          rev: st(`{${T[k - 1]}} − {P}`, 'From the products back up to the last top.'),
          P: st(`{${T[k - 1]}} − {rev}`, 'The last top less the reverse barrier.'),
          [T[k - 1]!]: st('{rev} + {P}', 'The products plus the reverse barrier.'),
        },
      },
      {
        relation: {
          id: 'ΔH = P',
          display: '{dH} = {P}',
          vars: ['dH', 'P'],
          residual: (x) => x.dH! - x.P!,
          solve: { dH: (x) => x.P!, P: (x) => x.dH! },
        },
        steps: {
          dH: st('{P}', 'Products − reactants, with the reactants at 0.'),
          P: st('{dH}', 'The products sit ΔH from the reactants at 0.'),
        },
      },
    ),
    example: {
      ...Object.fromEntries(Ea.map((e, i) => [e, ea[i]!])),
      ...Object.fromEntries(I.map((e, i) => [e, inter[i]!])),
      P,
      ...Object.fromEntries(T.map((t, i) => [t, tops[i]!])),
      hi: Math.max(...tops),
      rev: tops[k - 1]! - P,
      dH: P,
    },
    startWith: [...ea.flatMap((_, i) => [Ea[i]!, ...(i < k - 1 ? [I[i]!] : [])]), 'P'],
    representation: {
      kind: 'energyProfile',
      reactants: 0,
      products: 'P',
      activation: 'Ea1',
      deltaH: 'dH',
      names: { reactants: names.reactants, products: names.products },
      steps: {
        intermediates: I,
        barriers: Ea.slice(1),
        tops: T,
        highest: 'hi',
        names: names.intermediates,
      },
    },
  });
};

const stepsSn1 = stepsDemo(
  'g.he-energyProfile-steps-sn1',
  'An SN1 energy diagram: ionization, then the nucleophile',
  'Use this for reading a two-step energy diagram: the intermediate, each barrier and the rate-determining step.',
  [90, 10],
  [60],
  -20,
  { reactants: 'R–Br', products: 'R–Nu', intermediates: ['R⁺'] },
);
const stepsThree = stepsDemo(
  'g.he-energyProfile-steps-three',
  'Three steps, the middle one rate-determining',
  'Use this for a three-step mechanism: which transition state is highest and the overall ΔH.',
  [50, 80, 40],
  [20, -10],
  -60,
  { reactants: 'A', products: 'D', intermediates: ['B', 'C'] },
);

/** gen-chem-1#3~bomb: q = C(cal)ΔT, ΔU = −q ÷ n, ΔH = ΔU + Δn(gas)RT. */
const bombDemo = (
  id: string,
  title: string,
  name: string,
  [m, M, C, dT, dng, T]: number[],
): ModuleDef => {
  const n = m! / M!;
  const q = C! * dT!;
  const dU = -q / n;
  const dH = dU + dng! * 0.008314 * T!;
  return demo({
    id,
    title,
    use: 'Use this for ΔU and ΔH of combustion from a bomb calorimeter’s temperature rise.',
    assumptions: [
      'Constant volume: no work is done, so the heat the calorimeter takes in is −ΔU of the burning.',
      'Δn(gas) counts gas moles only (water as liquid); R = 0.008314 kJ/(mol·K).',
    ],
    variables: [
      quantity('m', 'm', 'Sample mass', 'g', 0.0001, 100, 0.0001),
      quantity('M', 'M', 'Molar mass', 'g/mol', 1, 1000, 0.01),
      quantity('n', 'n', 'Moles burned', 'mol', 1e-7, 10, 0.000001),
      quantity('C', 'C(cal)', 'Calorimeter constant', 'kJ/°C', 0.01, 100, 0.001),
      quantity('dT', 'ΔT', 'Temperature rise', '°C', 0.001, 100, 0.001),
      quantity('q', 'q', 'Heat taken in', 'kJ', 0.0001, 10000, 0.001),
      kjmol('dU', 'ΔU', 'Energy change of combustion', -100000, 100000),
      quantity('dng', 'Δn(gas)', 'Change in moles of gas', undefined, -20, 20, 0.5),
      kelvin('T', 'T', 'Temperature'),
      kjmol('dH', 'ΔH', 'Enthalpy of combustion', -100000, 100000),
    ],
    ...rules(
      {
        relation: {
          id: 'n = m ÷ M',
          display: '{n} = {m} ÷ {M}',
          vars: ['n', 'm', 'M'],
          residual: (x) => x.n! * x.M! - x.m!,
          solve: {
            n: (x) => div(x.m!, x.M!),
            m: (x) => x.n! * x.M!,
            M: (x) => div(x.m!, x.n!),
          },
        },
        steps: {
          n: st('{m} ÷ {M}', 'Moles from grams.'),
          m: st('{n} × {M}', 'Grams from moles.'),
          M: st('{m} ÷ {n}', 'Grams per mole.'),
        },
      },
      product('q', 'C', 'dT', 'q = C(cal) × ΔT', {
        q: 'The calorimeter (bomb, bucket and water) takes in C(cal) for each degree.',
        C: 'Divide the heat by the rise.',
        dT: 'Divide the heat by the calorimeter constant.',
      }),
      {
        relation: {
          id: 'ΔU = −q ÷ n',
          display: '{dU} = −{q} ÷ {n}',
          vars: ['dU', 'q', 'n'],
          residual: (x) => x.dU! * x.n! + x.q!,
          solve: {
            dU: (x) => div(-x.q!, x.n!),
            q: (x) => -x.dU! * x.n!,
            n: (x) => div(-x.q!, x.dU!),
          },
        },
        steps: {
          dU: st('−{q} ÷ {n}', 'The heat came out of the burning sample: per mole, sign flipped.'),
          q: st('−{dU} × {n}', 'Multiply by the moles and flip the sign.'),
          n: st('−{q} ÷ {dU}', 'Divide the heat by −ΔU.'),
        },
      },
      {
        relation: {
          id: 'ΔH = ΔU + Δn(gas)RT',
          display: '{dH} = {dU} + {dng} × 0.008314 × {T}',
          vars: ['dH', 'dU', 'dng', 'T'],
          residual: (x) => x.dH! - x.dU! - x.dng! * 0.008314 * x.T!,
          solve: {
            dH: (x) => x.dU! + x.dng! * 0.008314 * x.T!,
            dU: (x) => x.dH! - x.dng! * 0.008314 * x.T!,
          },
        },
        steps: {
          dH: st(
            '{dU} + {dng} × 0.008314 × {T}',
            'At constant pressure the gases would do work: add Δn(gas)RT.',
          ),
          dU: st('{dH} − {dng} × 0.008314 × {T}', 'Take Δn(gas)RT away.'),
        },
      },
    ),
    example: { m: m!, M: M!, n, C: C!, dT: dT!, q, dU, dng: dng!, T: T!, dH },
    startWith: ['m', 'M', 'C', 'dT', 'dng', 'T'],
    representation: {
      kind: 'energyProfile',
      mode: 'bomb',
      constant: 'C',
      change: 'dT',
      q: 'q',
      sample: { name, mass: 'm', moles: 'n', molar: 'M' },
      deltaU: 'dU',
      deltaH: 'dH',
      gas: 'dng',
      temperature: 'T',
    },
  });
};

const bombNaphthalene = bombDemo(
  'g.he-energyProfile-bomb',
  'Burning naphthalene in a bomb calorimeter: ΔU and ΔH',
  'naphthalene',
  [0.64, 128.17, 10, 2.57, -2, 298.15],
);
const bombOctane = bombDemo(
  'g.he-energyProfile-bomb-octane',
  'Octane in the bomb: a bigger rise, Δn(gas) = −4.5',
  'octane',
  [0.5, 114.23, 8, 3, -4.5, 298.15],
);

// ── HC57: the pathway detail (organelleEnergy) and the pathwayStep cards (biochemistry#2) ──

const PATHWAY_DETAIL: LayoutDef = {
  kind: 'explore',
  id: 'g.he-organelleEnergy-glycolysis',
  title: 'Glycolysis step by step',
  use: 'Use this for where glycolysis uses and makes ATP and NADH, step by step.',
  assumptions: [
    'Counted per glucose: after aldolase splits the 6C sugar, steps 6–10 run twice.',
    'Two ATP go in (steps 1 and 3) and four come out (steps 7 and 10): 2 ATP net, with 2 NADH.',
  ],
  figure: { kind: 'organelleEnergy' },
  scenes: [
    {
      label: 'The whole pathway',
      lines: ['Glucose (6C) becomes two pyruvate (3C) in the cytoplasm: 2 ATP and 2 NADH net.'],
      energy: { detail: 'glycolysis' },
    },
    {
      label: 'The investment',
      lines: [
        'Hexokinase spends the first ATP to trap glucose in the cell as glucose 6-phosphate.',
      ],
      energy: { detail: 'glycolysis', step: 1 },
    },
    {
      label: 'The split',
      lines: ['Aldolase cuts fructose 1,6-bisphosphate into two three-carbon sugars.'],
      energy: { detail: 'glycolysis', step: 4 },
    },
    {
      label: 'The first NADH',
      lines: [
        'G3P dehydrogenase passes electrons to NAD⁺: one NADH for each G3P, two per glucose.',
      ],
      energy: { detail: 'glycolysis', step: 6 },
    },
    {
      label: 'The payoff',
      lines: ['Pyruvate kinase makes the last two ATP: four made, two spent, 2 net.'],
      energy: { detail: 'glycolysis', step: 10 },
    },
  ],
};

const KREBS_DETAIL: LayoutDef = {
  kind: 'explore',
  id: 'g.he-organelleEnergy-krebs-etc',
  title: 'The citric acid cycle and the electron transport chain',
  use: 'Use this for where NADH, FADH₂ and CO₂ form, and how they become ATP.',
  assumptions: [
    'One turn per acetyl-CoA: 3 NADH, 1 FADH₂, 1 GTP and 2 CO₂; two turns per glucose.',
    'About 10 H⁺ are pumped per NADH and 6 per FADH₂; ATP synthase uses 4 H⁺ per ATP: 2.5 and 1.5.',
  ],
  figure: { kind: 'organelleEnergy' },
  scenes: [
    {
      label: 'One turn of the cycle',
      lines: [
        'Acetyl-CoA (2C) joins oxaloacetate (4C); two carbons leave as CO₂ and the cycle comes back to oxaloacetate.',
      ],
      energy: { detail: 'krebs' },
    },
    {
      label: 'The first CO₂',
      lines: ['Isocitrate dehydrogenase removes a carbon as CO₂ and makes NADH.'],
      energy: { detail: 'krebs', step: 3 },
    },
    {
      label: 'FADH₂',
      lines: ['Succinate dehydrogenase, in the inner membrane, hands its electrons to FAD.'],
      energy: { detail: 'krebs', step: 6 },
    },
    {
      label: 'The electron transport chain',
      lines: [
        'Complexes I, III and IV pump H⁺ out as electrons pass to O₂; ATP synthase lets them back in.',
      ],
      energy: { detail: 'etc' },
    },
    {
      label: 'ATP synthase',
      lines: ['The H⁺ flowing back turn ATP synthase: about 4 H⁺ for each ATP.'],
      energy: { detail: 'etc', step: 5 },
    },
  ],
};

const card = (pathway: 'glycolysis' | 'krebs', step: number) =>
  ({ kind: 'pathwayStep', pathway, step }) as const;

const GLYCOLYSIS_SEQUENCE: LayoutDef = {
  kind: 'sequence',
  id: 'g.he-pathwayStep-glycolysis',
  title: 'Glycolysis, from glucose',
  use: 'Use this for the steps and enzymes of glycolysis in order.',
  assumptions: [
    'Each card draws the carbons as dots and phosphates in orange; under it, what the step makes or uses per glucose.',
    'Steps 6–10 run twice per glucose, once for each three-carbon sugar.',
  ],
  question: 'Put the steps of glycolysis in order.',
  stages: [
    {
      label: 'Hexokinase: glucose → glucose 6-phosphate (uses ATP)',
      figure: card('glycolysis', 1),
    },
    { label: 'Phosphoglucose isomerase: → fructose 6-phosphate', figure: card('glycolysis', 2) },
    {
      label: 'Phosphofructokinase-1: → fructose 1,6-bisphosphate (uses ATP)',
      figure: card('glycolysis', 3),
    },
    { label: 'Aldolase: → DHAP and glyceraldehyde 3-phosphate', figure: card('glycolysis', 4) },
    {
      label: 'Triose phosphate isomerase: DHAP → glyceraldehyde 3-phosphate',
      figure: card('glycolysis', 5),
    },
    {
      label: 'G3P dehydrogenase: → 1,3-bisphosphoglycerate (makes NADH)',
      figure: card('glycolysis', 6),
    },
    {
      label: 'Phosphoglycerate kinase: → 3-phosphoglycerate (makes ATP)',
      figure: card('glycolysis', 7),
    },
    { label: 'Phosphoglycerate mutase: → 2-phosphoglycerate', figure: card('glycolysis', 8) },
    { label: 'Enolase: → phosphoenolpyruvate', figure: card('glycolysis', 9) },
    { label: 'Pyruvate kinase: → pyruvate (makes ATP)', figure: card('glycolysis', 10) },
  ],
};

const KREBS_SEQUENCE: LayoutDef = {
  kind: 'sequence',
  id: 'g.he-pathwayStep-krebs',
  title: 'The citric acid cycle, from acetyl-CoA and oxaloacetate',
  use: 'Use this for the citric acid cycle in order, and where NADH, FADH₂, GTP and CO₂ form.',
  assumptions: [
    'Each card draws the carbons as dots, CoA as a tag; under it, what the step makes per acetyl-CoA.',
    'The last step makes oxaloacetate again, ready for the next acetyl-CoA.',
  ],
  question: 'Put the steps of the citric acid cycle in order.',
  stages: [
    { label: 'Citrate synthase: acetyl-CoA + oxaloacetate → citrate', figure: card('krebs', 1) },
    { label: 'Aconitase: → isocitrate', figure: card('krebs', 2) },
    { label: 'Isocitrate dehydrogenase: → α-ketoglutarate (NADH, CO₂)', figure: card('krebs', 3) },
    {
      label: 'α-Ketoglutarate dehydrogenase: → succinyl-CoA (NADH, CO₂)',
      figure: card('krebs', 4),
    },
    { label: 'Succinyl-CoA synthetase: → succinate (GTP)', figure: card('krebs', 5) },
    { label: 'Succinate dehydrogenase: → fumarate (FADH₂)', figure: card('krebs', 6) },
    { label: 'Fumarase: → malate', figure: card('krebs', 7) },
    { label: 'Malate dehydrogenase: → oxaloacetate (NADH)', figure: card('krebs', 8) },
  ],
};

// ── HC79: membrane potential and water potential (cell-molecular#0, principles-2#2) ──

const mM = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, 'mM', 0.001, 1000, 0.001);

/** E = (61.5 mV ÷ z) log(C_o ÷ C_i) at 37 °C, inside relative to outside. */
const nernstDemo = (id: string, title: string, ion: string, [z, Co, Ci]: number[]): ModuleDef => {
  const E = (61.5 / z!) * Math.log10(Co! / Ci!);
  return demo({
    id,
    title,
    use: `Use this for the equilibrium potential of an ion (Nernst), as for ${ion} across a cell membrane.`,
    assumptions: [
      'Only this ion can cross; E is the inside relative to the outside.',
      'At 37 °C, RT ÷ F × ln 10 is 61.5 mV (58 mV at 20 °C).',
    ],
    variables: [
      quantity('z', 'z', 'Charge of the ion', undefined, -1, 2, 1, { allowed: [-1, 1, 2] }),
      mM('Co', 'C(out)', 'Concentration outside'),
      mM('Ci', 'C(in)', 'Concentration inside'),
      quantity('E', 'E', 'Equilibrium potential', 'mV', -500, 500, 0.1),
    ],
    ...rules({
      relation: {
        id: 'E = (61.5 ÷ z) log(C(out) ÷ C(in))',
        display: '{E} = 61.5 ÷ {z} × log₁₀({Co} ÷ {Ci})',
        vars: ['E', 'z', 'Co', 'Ci'],
        residual: (x) => x.E! - (61.5 / x.z!) * Math.log10(x.Co! / x.Ci!),
        solve: {
          E: (x) =>
            x.Co! > 0 && x.Ci! > 0 ? (61.5 / x.z!) * Math.log10(x.Co! / x.Ci!) : undefined,
          Co: (x) => x.Ci! * 10 ** ((x.E! * x.z!) / 61.5),
          Ci: (x) => x.Co! / 10 ** ((x.E! * x.z!) / 61.5),
        },
      },
      steps: {
        E: st(
          '61.5 ÷ {z} × log₁₀({Co} ÷ {Ci})',
          'The Nernst equation at 37 °C: 61.5 mV ÷ z per tenfold ratio.',
        ),
        Co: st('{Ci} × 10^({E} × {z} ÷ 61.5)', 'Undo the log: the ratio is 10^(Ez ÷ 61.5).'),
        Ci: st('{Co} ÷ 10^({E} × {z} ÷ 61.5)', 'Undo the log, then divide.'),
      },
    }),
    example: { z: z!, Co: Co!, Ci: Ci!, E },
    startWith: ['z', 'Co', 'Ci'],
    representation: {
      kind: 'membrane',
      transport: 'facilitated',
      outside: 0,
      inside: 0,
      particle: ion,
      potential: { value: 'E', ions: [{ name: ion, outside: 'Co', inside: 'Ci' }] },
    },
  });
};

const nernstK = nernstDemo(
  'g.he-membrane-nernst',
  'The potassium equilibrium potential: K⁺ 5 mM out, 140 mM in',
  'K⁺',
  [1, 5, 140],
);
const nernstNa = nernstDemo(
  'g.he-membrane-nernst-sodium',
  'Sodium pulls the other way: Na⁺ 145 mM out, 15 mM in',
  'Na⁺',
  [1, 145, 15],
);

/** Goldman: V_m = 61.5 log((K_o + P_Na Na_o + P_Cl Cl_i) ÷ (K_i + P_Na Na_i + P_Cl Cl_o)). */
const goldman = (() => {
  const v = { Ko: 5, Ki: 140, Nao: 145, Nai: 15, Clo: 110, Cli: 10, PNa: 0.04, PCl: 0.45 };
  const top = (x: Values) => x.Ko! + x.PNa! * x.Nao! + x.PCl! * x.Cli!;
  const bot = (x: Values) => x.Ki! + x.PNa! * x.Nai! + x.PCl! * x.Clo!;
  const Vm = 61.5 * Math.log10(top(v) / bot(v));
  return demo({
    id: 'g.he-membrane-goldman',
    title: 'The resting potential from K⁺, Na⁺ and Cl⁻ (Goldman)',
    use: "Use this for 'With these K⁺, Na⁺ and Cl⁻ levels and permeabilities 1, 0.04 and 0.45, what is the resting potential?'.",
    assumptions: [
      'Permeabilities are relative to K⁺ (P(K) = 1); 61.5 mV at 37 °C.',
      'Chloride’s inside and outside swap places because its charge is −1.',
    ],
    variables: [
      mM('Ko', 'K(out)', 'K⁺ outside'),
      mM('Ki', 'K(in)', 'K⁺ inside'),
      mM('Nao', 'Na(out)', 'Na⁺ outside'),
      mM('Nai', 'Na(in)', 'Na⁺ inside'),
      mM('Clo', 'Cl(out)', 'Cl⁻ outside'),
      mM('Cli', 'Cl(in)', 'Cl⁻ inside'),
      quantity('PNa', 'P(Na)', 'Na⁺ permeability (K⁺ = 1)', undefined, 0, 100, 0.001),
      quantity('PCl', 'P(Cl)', 'Cl⁻ permeability (K⁺ = 1)', undefined, 0, 100, 0.001),
      quantity('Vm', 'V(m)', 'Resting potential', 'mV', -500, 500, 0.1),
    ],
    ...rules({
      relation: {
        id: 'Goldman',
        display:
          '{Vm} = 61.5 × log₁₀(({Ko} + {PNa} × {Nao} + {PCl} × {Cli}) ÷ ({Ki} + {PNa} × {Nai} + {PCl} × {Clo}))',
        vars: ['Vm', 'Ko', 'Ki', 'Nao', 'Nai', 'Clo', 'Cli', 'PNa', 'PCl'],
        residual: (x) => x.Vm! - 61.5 * Math.log10(top(x) / bot(x)),
        solve: {
          Vm: (x) => (top(x) > 0 && bot(x) > 0 ? 61.5 * Math.log10(top(x) / bot(x)) : undefined),
        },
      },
      steps: {
        Vm: st(
          '61.5 × log₁₀(({Ko} + {PNa} × {Nao} + {PCl} × {Cli}) ÷ ({Ki} + {PNa} × {Nai} + {PCl} × {Clo}))',
          'Weight each ion by its permeability; chloride’s sides swap because it is negative.',
        ),
      },
    }),
    example: { ...v, Vm },
    startWith: ['Ko', 'Ki', 'Nao', 'Nai', 'Clo', 'Cli', 'PNa', 'PCl'],
    representation: {
      kind: 'membrane',
      transport: 'diffusion',
      outside: 0,
      inside: 0,
      potential: {
        value: 'Vm',
        ions: [
          { name: 'K⁺', outside: 'Ko', inside: 'Ki' },
          { name: 'Na⁺', outside: 'Nao', inside: 'Nai' },
          { name: 'Cl⁻', outside: 'Clo', inside: 'Cli' },
        ],
      },
    },
  });
})();

/** principles-2#2: Ψₛ = −iCRT, Ψ = Ψₛ + Ψₚ for the cell; ΔΨ = Ψ(solution) − Ψ(cell). */
const psiDemo = (id: string, title: string, psiOut: number): ModuleDef => {
  const [i, C, T, psiP] = [1, 0.15, 295, 0.2];
  const psiS = -i * C * 0.00831 * T;
  const psi = psiS + psiP;
  return demo({
    id,
    title,
    use: 'Use this for a plant cell’s water potential and which way water moves between it and a solution.',
    assumptions: [
      'Ψₛ = −iCRT with R = 0.00831 L·MPa/(mol·K); Ψ = Ψₛ + Ψₚ.',
      'Water moves from higher Ψ to lower Ψ; ΔΨ = Ψ(solution) − Ψ(cell) > 0 means into the cell.',
      'The solution is in an open beaker: its Ψ is all solute potential (Ψₚ = 0).',
    ],
    variables: [
      quantity('i', 'i', 'Ionization constant', undefined, 1, 3, 1, { allowed: [1, 2, 3] }),
      quantity('C', 'C', 'Molarity of the cell’s solute', 'M', 0.001, 5, 0.001),
      quantity('T', 'T', 'Temperature', 'K', 273, 323, 1),
      quantity('psiS', 'Ψₛ', 'Solute potential', 'MPa', -50, 0, 0.001),
      quantity('psiP', 'Ψₚ', 'Pressure potential', 'MPa', -2, 2, 0.01),
      quantity('psi', 'Ψ', 'Cell’s water potential', 'MPa', -50, 2, 0.001),
      quantity('psiOut', 'Ψ(sol)', 'Solution’s water potential', 'MPa', -50, 0, 0.001),
      quantity('dPsi', 'ΔΨ', 'Solution minus cell', 'MPa', -50, 50, 0.001),
    ],
    ...rules(
      {
        relation: {
          id: 'Ψₛ = −iCRT',
          display: '{psiS} = −{i} × {C} × 0.00831 × {T}',
          vars: ['psiS', 'i', 'C', 'T'],
          residual: (x) => x.psiS! + x.i! * x.C! * 0.00831 * x.T!,
          solve: {
            psiS: (x) => -x.i! * x.C! * 0.00831 * x.T!,
            C: (x) => div(-x.psiS!, x.i! * 0.00831 * x.T!),
            T: (x) => div(-x.psiS!, x.i! * x.C! * 0.00831),
          },
        },
        steps: {
          psiS: st(
            '−{i} × {C} × 0.00831 × {T}',
            'Dissolved particles lower the water potential: −iCRT.',
          ),
          C: st('−{psiS} ÷ ({i} × 0.00831 × {T})', 'Divide −Ψₛ by iRT.'),
          T: st('−{psiS} ÷ ({i} × {C} × 0.00831)', 'Divide −Ψₛ by iCR.'),
        },
      },
      sum('psi', 'psiS', 'psiP', 'Ψ = Ψₛ + Ψₚ', 'Add the wall’s pressure to the solute potential.'),
      {
        relation: {
          id: 'ΔΨ = Ψ(sol) − Ψ',
          display: '{dPsi} = {psiOut} − {psi}',
          vars: ['dPsi', 'psiOut', 'psi'],
          residual: (x) => x.dPsi! - x.psiOut! + x.psi!,
          solve: {
            dPsi: (x) => x.psiOut! - x.psi!,
            psiOut: (x) => x.dPsi! + x.psi!,
            psi: (x) => x.psiOut! - x.dPsi!,
          },
        },
        steps: {
          dPsi: st(
            '{psiOut} − {psi}',
            'Positive: the solution is higher, so water moves into the cell.',
          ),
          psiOut: st('{dPsi} + {psi}', 'Add the difference to the cell’s Ψ.'),
          psi: st('{psiOut} − {dPsi}', 'Take the difference from the solution’s Ψ.'),
        },
      },
    ),
    example: { i, C, T, psiS, psiP, psi, psiOut, dPsi: psiOut - psi },
    startWith: ['i', 'C', 'T', 'psiP', 'psiOut'],
    representation: {
      kind: 'membrane',
      transport: 'osmosis',
      outside: 0,
      inside: 0,
      psi: {
        outside: 'psiOut',
        inside: 'psi',
        solute: { outside: 'psiOut', inside: 'psiS' },
        pressure: { inside: 'psiP' },
      },
    },
  });
};

const psiIn = psiDemo(
  'g.he-membrane-psi',
  'A plant cell in a dilute solution: water moves in',
  -0.1,
);
const psiOutDemo = psiDemo(
  'g.he-membrane-psi-out',
  'The same cell in a strong solution: water moves out',
  -0.5,
);

export const HE3G_GALLERY_MODULES: ModuleDef[] = [
  pvIsothermal,
  pvChemistry,
  pvCompress,
  adiabaticDemo,
  adiabaticChem,
  isobaric,
  isochoric,
  cycle,
  realCo2,
  realH2,
  coupled,
  coupledShort,
  coupledK,
  deltaG,
  stepsSn1,
  stepsThree,
  bombNaphthalene,
  bombOctane,
  nernstK,
  nernstNa,
  goldman,
  psiIn,
  psiOutDemo,
];

export const HE3G_GALLERY_LAYOUTS: LayoutDef[] = [
  PATHWAY_DETAIL,
  KREBS_DETAIL,
  GLYCOLYSIS_SEQUENCE,
  KREBS_SEQUENCE,
];
