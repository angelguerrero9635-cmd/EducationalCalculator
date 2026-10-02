/**
 * College gallery demos, round 3, group G (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC43 `gasPiston` `pv` and `real`: the laws of thermodynamics (docs/plans/he.physics.md P27,
 * he.chemistry.md P11) and real gases (he.chemistry.md P10).
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
];

export const HE3G_GALLERY_LAYOUTS: LayoutDef[] = [];

// Keep `product` for later demos in this file.
void product;
