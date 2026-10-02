/**
 * College gallery demos, round 2, group B (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC15 `potentialWell`: the quantum pages (docs/plans/he.physics.md, P19) and the particle in a
 * box and oscillator of physical chemistry (docs/plans/he.chemistry.md, P1).
 */
import {
  AVOGADRO,
  boxMeanSquare,
  boxProbability,
  DALTON,
  ELECTRON_VOLT,
  HBAR,
  LIGHT,
  PLANCK,
} from '@/components/module/reps/potentialWellMath';
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
const root = (x: number) => (x < 0 ? undefined : Math.sqrt(x));
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

const whole = (id: string, symbol: string, name: string, min: number, max: number) =>
  quantity(id, symbol, name, undefined, min, max, 1, { integer: true });

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

// ── HC15: shared constants and rules ──

/** h² ÷ (8 × 10⁻¹⁸ e): Eₙ in eV for m in kg and L in nm is n² × BOX_K ÷ (mL²). */
const BOX_K = PLANCK ** 2 / (8 * ELECTRON_VOLT * 1e-18);
const BOX_K_TEXT = '3.4254 × 10⁻³¹';
/** hc in eV·nm. */
const HC = (PLANCK * LIGHT) / ELECTRON_VOLT / 1e-9;
const HC_TEXT = '1239.84';
const ELECTRON = 9.1093837015e-31;
/** An electron's E₁ in a 1 nm box (eV): BOX_K ÷ mₑ. */
const ELECTRON_E1 = BOX_K / ELECTRON;

const mass = (id = 'm') =>
  quantity(id, 'm', 'Particle mass', 'kg', 9e-32, 1e-24, 1e-34, { scientific: true });
const width = (id = 'L') => quantity(id, 'L', 'Box width', 'nm', 0.01, 100, 0.01);

/** Eₙ = n²h² ÷ (8mL²) for level `n`, energy `E` (eV), mass m (kg) and width L (nm). */
const boxLevel = (E: string, n: string, symE: string, symN: string): Rule => ({
  relation: {
    id: `${symE} = ${symN}²h² ÷ (8mL²)`,
    display: `{${E}} = {${n}}² × ${BOX_K_TEXT} ÷ ({m} × {L}²)`,
    vars: [E, n, 'm', 'L'],
    residual: (x) => x[E]! * x.m! * x.L! ** 2 - x[n]! ** 2 * BOX_K,
    solve: {
      [E]: (x) => div(x[n]! ** 2 * BOX_K, x.m! * x.L! ** 2),
      m: (x) => div(x[n]! ** 2 * BOX_K, x[E]! * x.L! ** 2),
      L: (x) => {
        const q = div(x[n]! ** 2 * BOX_K, x.m! * x[E]!);
        return q === undefined ? undefined : root(q);
      },
    },
  },
  steps: {
    [E]: st(
      `{${n}}² × ${BOX_K_TEXT} ÷ ({m} × {L}²)`,
      `h² ÷ 8 is ${BOX_K_TEXT} in eV·kg·nm²: multiply by ${symN}², divide by m and L².`,
    ),
    m: st(`{${n}}² × ${BOX_K_TEXT} ÷ ({${E}} × {L}²)`, `Divide ${symN}²h² ÷ 8 by ${symE} and L².`),
    L: st(`√({${n}}² × ${BOX_K_TEXT} ÷ ({m} × {${E}}))`, `Solve for L², then take the root.`),
  },
});

/** λ = hc ÷ ΔE, with ΔE in eV and λ in nm. */
const photonNm = (lam: string, dE: string): Rule => ({
  relation: {
    id: 'λ = hc ÷ ΔE',
    display: `{${lam}} = ${HC_TEXT} ÷ {${dE}}`,
    vars: [lam, dE],
    residual: (x) => x[lam]! * x[dE]! - HC,
    solve: { [lam]: (x) => div(HC, x[dE]!), [dE]: (x) => div(HC, x[lam]!) },
  },
  steps: {
    [lam]: st(`${HC_TEXT} ÷ {${dE}}`, 'hc is 1239.84 eV·nm: divide it by the photon’s energy.'),
    [dE]: st(`${HC_TEXT} ÷ {${lam}}`, 'Divide hc = 1239.84 eV·nm by the wavelength.'),
  },
});

const P_TEXT = (n: string) =>
  `({x2} − {x1}) ÷ {L} − (sin(2 × {${n}} × π × {x2} ÷ {L}) − sin(2 × {${n}} × π × {x1} ÷ {L})) ÷ (2 × {${n}} × π)`;

/** P = ∫|ψₙ|² dx from x₁ to x₂. */
const regionChance = (n: string): Rule => ({
  relation: {
    id: 'P = ∫|ψ|² dx from x₁ to x₂',
    display: `{P} = ${P_TEXT(n)}`,
    vars: ['P', n, 'x1', 'x2', 'L'],
    residual: (x) => x.P! - boxProbability(x[n]!, x.x1! / x.L!, x.x2! / x.L!),
    solve: { P: (x) => (x.L! > 0 ? boxProbability(x[n]!, x.x1! / x.L!, x.x2! / x.L!) : undefined) },
  },
  steps: {
    P: st(
      P_TEXT(n),
      'Integrate (2/L)sin²(nπx/L) from x₁ to x₂: the stretch’s share of L, less the sine terms (radians).',
    ),
  },
});

const REGION_IN_BOX: Rule[] = [
  below('x1', 'x2', '{x1} < {x2}', 'The stretch runs from x₁ up to a larger x₂.'),
  {
    relation: {
      id: 'x₂ ≤ L',
      constraint: true,
      display: '{x2} ≤ {L}',
      vars: ['x2', 'L'],
      residual: (v: Values) => (v.x2! <= v.L! * (1 + 1e-6) ? 0 : 1),
      solve: {},
      message: () => 'The stretch must end inside the box: x₂ ≤ L.',
    },
    steps: {},
  },
];

// ── HC15: the infinite box and its photon (quantum#1) ──

const boxDemo = (id: string, title: string, n: number, np: number, L: number): ModuleDef => {
  const m = ELECTRON;
  const En = (n * n * BOX_K) / (m * L * L);
  const Enp = (np * np * BOX_K) / (m * L * L);
  return demo({
    id,
    title,
    use: 'Use this for the energy levels of a particle in a box and the photon of a jump between them.',
    assumptions: [
      'The walls are infinitely high, so ψ = 0 there and only whole half-waves fit.',
      'E grows as n² and shrinks as 1 ÷ L²; the electron’s mass is 9.109 × 10⁻³¹ kg.',
    ],
    variables: [
      mass(),
      width(),
      whole('n', 'n', 'Upper level', 1, 20),
      whole('np', 'n′', 'Lower level', 1, 20),
      quantity('En', 'Eₙ', 'Upper level’s energy', 'eV', 1e-9, 1e9, 0.001),
      quantity('Enp', 'Eₙ′', 'Lower level’s energy', 'eV', 1e-9, 1e9, 0.001),
      quantity('dE', 'ΔE', 'Photon energy', 'eV', 1e-9, 1e9, 0.001),
      quantity('lam', 'λ', 'Wavelength', 'nm', 1e-6, 1e12, 0.1),
    ],
    ...rules(
      boxLevel('En', 'n', 'Eₙ', 'n'),
      boxLevel('Enp', 'np', 'Eₙ′', 'n′'),
      {
        relation: {
          id: 'ΔE = Eₙ − Eₙ′',
          display: '{dE} = {En} − {Enp}',
          vars: ['dE', 'En', 'Enp'],
          residual: (x) => x.dE! - x.En! + x.Enp!,
          solve: {
            dE: (x) => x.En! - x.Enp!,
            En: (x) => x.dE! + x.Enp!,
            Enp: (x) => x.En! - x.dE!,
          },
        },
        steps: {
          dE: st('{En} − {Enp}', 'The photon carries off the difference between the levels.'),
          En: st('{dE} + {Enp}', 'Add the photon’s energy to the lower level.'),
          Enp: st('{En} − {dE}', 'Take the photon’s energy from the upper level.'),
        },
      },
      photonNm('lam', 'dE'),
      below('np', 'n', '{np} < {n}', 'The photon is emitted falling to a lower level: n′ < n.'),
    ),
    example: { m, L, n, np, En, Enp, dE: En - Enp, lam: HC / (En - Enp) },
    startWith: ['m', 'L', 'n', 'np'],
    representation: {
      kind: 'potentialWell',
      model: 'box',
      length: 'L',
      mass: 'm',
      lower: 'np',
      upper: 'n',
      lowerEnergy: 'Enp',
      upperEnergy: 'En',
      gap: 'dE',
      wavelength: 'lam',
    },
  });
};

const boxPhoton = boxDemo(
  'g.he-potentialWell-box',
  'An electron in a 1 nm box: levels and the photon of 2 → 1',
  2,
  1,
  1,
);
const boxHigh = boxDemo(
  'g.he-potentialWell-box-high',
  'An electron in a 1.5 nm box: the jump from n = 6 to 1',
  6,
  1,
  1.5,
);

// ── HC15: a conjugated dye's box, |ψ|² and the absorbed photon (physical-2#1) ──

const dye = (() => {
  const [m, L, n1, n2] = [ELECTRON, 1, 1, 2];
  const E1 = PLANCK ** 2 / (8 * m * (L * 1e-9) ** 2);
  const dE = (n2 * n2 - n1 * n1) * E1;
  return { m, L, n1, n2, E1, dE, lam: ((PLANCK * LIGHT) / dE) * 1e9 };
})();

const boxDye = demo({
  id: 'g.he-potentialWell-dye',
  title: 'A particle in a box: E₁, the gap and the light it absorbs',
  use: 'Use this for a box’s ground energy, the gap between two levels and the wavelength absorbed (a dye).',
  assumptions: [
    'V = 0 inside and the walls are infinite; n starts at 1, so E₁ > 0 (zero-point energy).',
    'For a dye with N π electrons, the jump is from n₁ = N ÷ 2 to n₁ + 1.',
  ],
  variables: [
    mass(),
    width(),
    whole('n1', 'n₁', 'Lower level', 1, 20),
    whole('n2', 'n₂', 'Upper level', 1, 20),
    quantity('E1', 'E₁', 'Ground energy', 'J', 1e-30, 1e-10, 1e-22, { scientific: true }),
    quantity('dE', 'ΔE', 'Gap', 'J', 1e-30, 1e-10, 1e-22, { scientific: true }),
    quantity('lam', 'λ', 'Wavelength absorbed', 'nm', 1e-6, 1e12, 0.1),
  ],
  ...rules(
    {
      relation: {
        id: 'E₁ = h² ÷ (8mL²)',
        display: '{E1} = (6.62607 × 10⁻³⁴)² ÷ (8 × {m} × ({L} × 10⁻⁹)²)',
        vars: ['E1', 'm', 'L'],
        residual: (x) => x.E1! * 8 * x.m! * (x.L! * 1e-9) ** 2 - PLANCK ** 2,
        solve: {
          E1: (x) => div(PLANCK ** 2, 8 * x.m! * (x.L! * 1e-9) ** 2),
          m: (x) => div(PLANCK ** 2, 8 * x.E1! * (x.L! * 1e-9) ** 2),
          L: (x) => {
            const q = div(PLANCK ** 2, 8 * x.m! * x.E1!);
            return q === undefined ? undefined : Math.sqrt(q) * 1e9;
          },
        },
      },
      steps: {
        E1: st(
          '(6.62607 × 10⁻³⁴)² ÷ (8 × {m} × ({L} × 10⁻⁹)²)',
          'Square h, then divide by 8m and L² in metres.',
        ),
        m: st(
          '(6.62607 × 10⁻³⁴)² ÷ (8 × {E1} × ({L} × 10⁻⁹)²)',
          'Divide h² by 8E₁L², L in metres.',
        ),
        L: st(
          '√((6.62607 × 10⁻³⁴)² ÷ (8 × {m} × {E1})) × 10⁹',
          'Solve for L² in m², take the root, and turn metres into nm.',
        ),
      },
    },
    {
      relation: {
        id: 'ΔE = (n₂² − n₁²)E₁',
        display: '{dE} = ({n2}² − {n1}²) × {E1}',
        vars: ['dE', 'n1', 'n2', 'E1'],
        residual: (x) => x.dE! - (x.n2! ** 2 - x.n1! ** 2) * x.E1!,
        solve: {
          dE: (x) => (x.n2! ** 2 - x.n1! ** 2) * x.E1!,
          E1: (x) => div(x.dE!, x.n2! ** 2 - x.n1! ** 2),
        },
      },
      steps: {
        dE: st(
          '({n2}² − {n1}²) × {E1}',
          'The levels are n²E₁ apart: subtract the squares, times E₁.',
        ),
        E1: st('{dE} ÷ ({n2}² − {n1}²)', 'Divide the gap by the difference of the squares.'),
      },
    },
    {
      relation: {
        id: 'λ = hc ÷ ΔE',
        display: '{lam} = 6.62607 × 10⁻³⁴ × 2.99792 × 10⁸ ÷ {dE} × 10⁹',
        vars: ['lam', 'dE'],
        residual: (x) => x.lam! * x.dE! - PLANCK * LIGHT * 1e9,
        solve: {
          lam: (x) => div(PLANCK * LIGHT * 1e9, x.dE!),
          dE: (x) => div(PLANCK * LIGHT * 1e9, x.lam!),
        },
      },
      steps: {
        lam: st(
          '6.62607 × 10⁻³⁴ × 2.99792 × 10⁸ ÷ {dE} × 10⁹',
          'Divide hc by the gap for metres, then turn them into nm.',
        ),
        dE: st('6.62607 × 10⁻³⁴ × 2.99792 × 10⁸ ÷ ({lam} × 10⁻⁹)', 'Divide hc by λ in metres.'),
      },
    },
    below('n1', 'n2', '{n1} < {n2}', 'Light is absorbed going up: n₁ < n₂.'),
  ),
  example: dye,
  startWith: ['m', 'L', 'n1', 'n2'],
  representation: {
    kind: 'potentialWell',
    model: 'box',
    length: 'L',
    lower: 'n1',
    upper: 'n2',
    absorb: true,
    square: true,
    ground: 'E1',
    gap: 'dE',
    wavelength: 'lam',
  },
});

// ── HC15: the chance in a region of the box (quantum#0) ──

const boxRegion = demo({
  id: 'g.he-potentialWell-probability',
  title: 'The chance of finding a particle in part of a box',
  use: 'Use this for the probability of finding a particle in a box state between x₁ and x₂.',
  assumptions: [
    'ψₙ = √(2/L) sin(nπx/L) is normalized: ∫|ψ|² dx = 1 over the box.',
    '|ψ|² is a probability per length; the sines are in radians.',
  ],
  variables: [
    whole('n', 'n', 'State', 1, 20),
    width(),
    quantity('x1', 'x₁', 'From', 'nm', 0, 100, 0.01),
    quantity('x2', 'x₂', 'To', 'nm', 0.001, 100, 0.01),
    quantity('P', 'P', 'Probability', undefined, 0, 1, 0.0001),
  ],
  ...rules(regionChance('n'), ...REGION_IN_BOX),
  example: { n: 1, L: 1, x1: 0.1, x2: 0.35, P: boxProbability(1, 0.1, 0.35) },
  startWith: ['n', 'L', 'x1', 'x2'],
  representation: {
    kind: 'potentialWell',
    model: 'box',
    length: 'L',
    lower: 'n',
    square: true,
    region: { from: 'x1', to: 'x2' },
    probability: 'P',
  },
});

// ── HC15: ⟨x⟩, Δx and Δp in the box (quantum#0~spread) ──

const spread = (() => {
  const [n, L] = [1, 1];
  const mean = L / 2;
  const x2m = L * L * boxMeanSquare(n);
  const dx = Math.sqrt(x2m - mean * mean);
  const dp = (n * Math.PI * HBAR) / (L * 1e-9);
  return { n, L, mean, x2m, dx, dp, prod: (dx * 1e-9 * dp) / HBAR };
})();

const boxSpread = demo({
  id: 'g.he-potentialWell-spread',
  title: 'Uncertainty in a box: ⟨x⟩, Δx and Δp',
  use: 'Use this for ⟨x⟩, Δx, Δp and the product ΔxΔp of a particle in a box.',
  assumptions: [
    '⟨p⟩ = 0, and ⟨p²⟩ = (nπħ ÷ L)², so Δp = nπħ ÷ L.',
    'ΔxΔp is written in units of ħ; it is never below ½.',
  ],
  variables: [
    whole('n', 'n', 'State', 1, 20),
    width(),
    quantity('mean', '⟨x⟩', 'Mean position', 'nm', 0, 50, 0.001),
    quantity('x2m', '⟨x²⟩', 'Mean square position', 'nm²', 0, 10000, 0.0001),
    quantity('dx', 'Δx', 'Spread in position', 'nm', 0, 100, 0.0001),
    quantity('dp', 'Δp', 'Spread in momentum', 'kg·m/s', 1e-30, 1e-15, 1e-30, { scientific: true }),
    quantity('prod', 'ΔxΔp', 'Product, in ħ', undefined, 0.5, 100, 0.001),
  ],
  ...rules(
    {
      relation: {
        id: '⟨x⟩ = L ÷ 2',
        display: '{mean} = {L} ÷ 2',
        vars: ['mean', 'L'],
        residual: (x) => x.mean! - x.L! / 2,
        solve: { mean: (x) => x.L! / 2, L: (x) => 2 * x.mean! },
      },
      steps: {
        mean: st('{L} ÷ 2', '|ψ|² is even about the middle, so the mean is half the width.'),
        L: st('2 × {mean}', 'The mean sits at the middle: double it.'),
      },
    },
    {
      relation: {
        id: '⟨x²⟩ = L²(1/3 − 1 ÷ (2n²π²))',
        display: '{x2m} = {L}² × (1 ÷ 3 − 1 ÷ (2 × {n}² × π × π))',
        vars: ['x2m', 'L', 'n'],
        residual: (x) => x.x2m! - x.L! ** 2 * boxMeanSquare(x.n!),
        solve: {
          x2m: (x) => x.L! ** 2 * boxMeanSquare(x.n!),
          L: (x) => root(x.x2m! / boxMeanSquare(x.n!)),
        },
      },
      steps: {
        x2m: st('{L}² × (1 ÷ 3 − 1 ÷ (2 × {n}² × π × π))', 'Integrate x²|ψ|² across the box.'),
        L: st(
          '√({x2m} ÷ (1 ÷ 3 − 1 ÷ (2 × {n}² × π × π)))',
          'Divide by the bracket, then take the root.',
        ),
      },
    },
    {
      relation: {
        id: 'Δx = √(⟨x²⟩ − ⟨x⟩²)',
        display: '{dx} = √({x2m} − {mean}²)',
        vars: ['dx', 'x2m', 'mean'],
        residual: (x) => x.dx! ** 2 - (x.x2m! - x.mean! ** 2),
        solve: {
          dx: (x) => root(x.x2m! - x.mean! ** 2),
          x2m: (x) => x.dx! ** 2 + x.mean! ** 2,
        },
      },
      steps: {
        dx: st(
          '√({x2m} − {mean}²)',
          'The spread is the root of the mean square less the square mean.',
        ),
        x2m: st('{dx}² + {mean}²', 'Add the squares back.'),
      },
    },
    {
      relation: {
        id: 'Δp = nπħ ÷ L',
        display: '{dp} = {n} × π × 1.05457 × 10⁻³⁴ ÷ ({L} × 10⁻⁹)',
        vars: ['dp', 'n', 'L'],
        residual: (x) => x.dp! * x.L! * 1e-9 - x.n! * Math.PI * HBAR,
        solve: {
          dp: (x) => div(x.n! * Math.PI * HBAR, x.L! * 1e-9),
          L: (x) => div(x.n! * Math.PI * HBAR, x.dp! * 1e-9),
        },
      },
      steps: {
        dp: st('{n} × π × 1.05457 × 10⁻³⁴ ÷ ({L} × 10⁻⁹)', 'ħ = 1.05457 × 10⁻³⁴ J·s; L in metres.'),
        L: st(
          '{n} × π × 1.05457 × 10⁻³⁴ ÷ {dp} × 10⁹',
          'Divide nπħ by Δp for metres, then turn them into nm.',
        ),
      },
    },
    {
      relation: {
        id: 'ΔxΔp ÷ ħ',
        display: '{prod} = {dx} × 10⁻⁹ × {dp} ÷ (1.05457 × 10⁻³⁴)',
        vars: ['prod', 'dx', 'dp'],
        residual: (x) => x.prod! * HBAR - x.dx! * 1e-9 * x.dp!,
        solve: {
          prod: (x) => (x.dx! * 1e-9 * x.dp!) / HBAR,
          dx: (x) => div(x.prod! * HBAR, x.dp! * 1e-9),
          dp: (x) => div(x.prod! * HBAR, x.dx! * 1e-9),
        },
      },
      steps: {
        prod: st(
          '{dx} × 10⁻⁹ × {dp} ÷ (1.05457 × 10⁻³⁴)',
          'Multiply the spreads (Δx in metres), then divide by ħ.',
        ),
        dx: st(
          '{prod} × 1.05457 × 10⁻³⁴ ÷ {dp} × 10⁹',
          'Turn the product into J·s, divide by Δp, and give nm.',
        ),
        dp: st(
          '{prod} × 1.05457 × 10⁻³⁴ ÷ ({dx} × 10⁻⁹)',
          'Turn the product into J·s, then divide by Δx in metres.',
        ),
      },
    },
  ),
  example: spread,
  startWith: ['n', 'L'],
  representation: {
    kind: 'potentialWell',
    model: 'box',
    length: 'L',
    lower: 'n',
    square: true,
    mean: 'mean',
    spread: 'dx',
    more: ['dp', 'prod'],
  },
});

// ── HC15: the harmonic oscillator (quantum#1~harmonic) ──

const HBAR_EV = HBAR / ELECTRON_VOLT;

const harmonicDemo = (id: string, title: string, w: number, n: number): ModuleDef =>
  demo({
    id,
    title,
    use: 'Use this for the levels of a quantum oscillator, their spacing ħω and the photon of one step.',
    assumptions: [
      'Eₙ = (n + ½)ħω: evenly spaced, and the lowest level ½ħω is never 0.',
      'A photon from one step down carries ħω, so λ = 2πc ÷ ω.',
    ],
    variables: [
      quantity('w', 'ω', 'Angular frequency', 'rad/s', 1e10, 1e18, 1e8, { scientific: true }),
      whole('n', 'n', 'Level', 0, 20),
      quantity('hw', 'ħω', 'Spacing', 'eV', 6e-6, 700, 0.0001),
      quantity('En', 'Eₙ', 'Level’s energy', 'eV', 3e-6, 15000, 0.0001),
      quantity('lam', 'λ', 'Photon wavelength', 'μm', 2e-4, 1.8e5, 0.01),
    ],
    ...rules(
      {
        relation: {
          id: 'ħω in eV',
          display: '{hw} = 6.58212 × 10⁻¹⁶ × {w}',
          vars: ['hw', 'w'],
          residual: (x) => x.hw! - HBAR_EV * x.w!,
          solve: { hw: (x) => HBAR_EV * x.w!, w: (x) => x.hw! / HBAR_EV },
        },
        steps: {
          hw: st('6.58212 × 10⁻¹⁶ × {w}', 'ħ is 6.58212 × 10⁻¹⁶ eV·s: multiply by ω.'),
          w: st('{hw} ÷ (6.58212 × 10⁻¹⁶)', 'Divide the spacing by ħ in eV·s.'),
        },
      },
      {
        relation: {
          id: 'Eₙ = (n + ½)ħω',
          display: '{En} = ({n} + ½) × {hw}',
          vars: ['En', 'n', 'hw'],
          residual: (x) => x.En! - (x.n! + 0.5) * x.hw!,
          solve: {
            En: (x) => (x.n! + 0.5) * x.hw!,
            hw: (x) => x.En! / (x.n! + 0.5),
            n: (x) => (div(x.En!, x.hw!) === undefined ? undefined : x.En! / x.hw! - 0.5),
          },
        },
        steps: {
          En: st('({n} + ½) × {hw}', 'Count up n steps of ħω from the zero-point ½ħω.'),
          hw: st('{En} ÷ ({n} + ½)', 'Divide the level’s energy by n + ½.'),
          n: st('{En} ÷ {hw} − ½', 'Count the steps of ħω above the zero-point ½ħω.'),
        },
      },
      {
        relation: {
          id: 'λ = 2πc ÷ ω',
          display: '{lam} = 2 × π × 2.99792 × 10⁸ ÷ {w} × 10⁶',
          vars: ['lam', 'w'],
          residual: (x) => x.lam! - (2 * Math.PI * LIGHT * 1e6) / x.w!,
          solve: {
            lam: (x) => div(2 * Math.PI * LIGHT * 1e6, x.w!),
            w: (x) => div(2 * Math.PI * LIGHT * 1e6, x.lam!),
          },
        },
        steps: {
          lam: st(
            '2 × π × 2.99792 × 10⁸ ÷ {w} × 10⁶',
            'The photon’s frequency is ω: λ = 2πc ÷ ω in metres, then μm.',
          ),
          w: st('2 × π × 2.99792 × 10⁸ ÷ ({lam} × 10⁻⁶)', 'Divide 2πc by λ in metres.'),
        },
      },
    ),
    example: {
      w,
      n,
      hw: HBAR_EV * w,
      En: (n + 0.5) * HBAR_EV * w,
      lam: ((2 * Math.PI * LIGHT) / w) * 1e6,
    },
    startWith: ['w', 'n'],
    representation: {
      kind: 'potentialWell',
      model: 'harmonic',
      letter: 'n',
      lower: 'n',
      omega: 'w',
      spacing: 'hw',
      lowerEnergy: 'En',
      wavelength: 'lam',
    },
  });

const harmonic = harmonicDemo(
  'g.he-potentialWell-harmonic',
  'A quantum oscillator: evenly spaced levels and the photon of one step',
  1e14,
  0,
);
const harmonicHigh = harmonicDemo(
  'g.he-potentialWell-harmonic-high',
  'A quantum oscillator at n = 4: four nodes, still ħω apart',
  5e14,
  4,
);

// ── HC15: a diatomic's vibration (physical-2#1~oscillator) ──

const hcl = (() => {
  const [m1, m2, k] = [1.008, 34.97, 480];
  const mu = ((m1 * m2) / (m1 + m2)) * DALTON;
  const nu = Math.sqrt(k / mu) / (2 * Math.PI);
  const E0 = 0.5 * PLANCK * nu;
  return { m1, m2, mu, k, nu, nut: nu / (LIGHT * 100), E0, E0m: (E0 * AVOGADRO) / 1000 };
})();

const oscillator = demo({
  id: 'g.he-potentialWell-oscillator',
  title: 'A bond as a spring: H–Cl’s vibration, wavenumber and zero-point energy',
  use: 'Use this for a diatomic’s vibrational frequency, wavenumber and zero-point energy from k.',
  assumptions: [
    'The bond is a harmonic spring of force constant k between the two atoms (reduced mass μ).',
    'Infrared light is absorbed going up one level, v = 0 → 1: ΔE = hν.',
  ],
  variables: [
    quantity('m1', 'm₁', 'Mass of atom 1', 'u', 0.5, 300, 0.001),
    quantity('m2', 'm₂', 'Mass of atom 2', 'u', 0.5, 300, 0.001),
    quantity('mu', 'μ', 'Reduced mass', 'kg', 1e-28, 1e-24, 1e-30, { scientific: true }),
    quantity('k', 'k', 'Force constant', 'N/m', 1, 5000, 1),
    quantity('nu', 'ν', 'Frequency', 'Hz', 1e10, 1e16, 1e9, { scientific: true }),
    quantity('nut', 'ν̃', 'Wavenumber', 'cm⁻¹', 1, 100000, 0.1),
    quantity('E0', 'E₀', 'Zero-point energy', 'J', 1e-26, 1e-16, 1e-24, { scientific: true }),
    quantity('E0m', 'E₀ per mole', 'Zero-point energy per mole', 'kJ/mol', 1e-4, 1e5, 0.01),
  ],
  ...rules(
    {
      relation: {
        id: 'μ = m₁m₂ ÷ (m₁ + m₂)',
        display: '{mu} = {m1} × {m2} ÷ ({m1} + {m2}) × 1.66054 × 10⁻²⁷',
        vars: ['mu', 'm1', 'm2'],
        residual: (x) => x.mu! * (x.m1! + x.m2!) - x.m1! * x.m2! * DALTON,
        solve: {
          mu: (x) => div(x.m1! * x.m2! * DALTON, x.m1! + x.m2!),
          m1: (x) => div((x.mu! / DALTON) * x.m2!, x.m2! - x.mu! / DALTON),
          m2: (x) => div((x.mu! / DALTON) * x.m1!, x.m1! - x.mu! / DALTON),
        },
      },
      steps: {
        mu: st(
          '{m1} × {m2} ÷ ({m1} + {m2}) × 1.66054 × 10⁻²⁷',
          'Product over sum, in u, then u to kg.',
        ),
        m1: st(
          '{mu} ÷ (1.66054 × 10⁻²⁷) × {m2} ÷ ({m2} − {mu} ÷ (1.66054 × 10⁻²⁷))',
          'Turn μ into u, then solve μ(m₁ + m₂) = m₁m₂ for m₁.',
        ),
        m2: st(
          '{mu} ÷ (1.66054 × 10⁻²⁷) × {m1} ÷ ({m1} − {mu} ÷ (1.66054 × 10⁻²⁷))',
          'Turn μ into u, then solve μ(m₁ + m₂) = m₁m₂ for m₂.',
        ),
      },
    },
    {
      relation: {
        id: 'ν = √(k ÷ μ) ÷ 2π',
        display: '{nu} = √({k} ÷ {mu}) ÷ (2 × π)',
        vars: ['nu', 'k', 'mu'],
        residual: (x) => x.nu! * 2 * Math.PI - Math.sqrt(x.k! / x.mu!),
        solve: {
          nu: (x) => (x.mu! > 0 ? Math.sqrt(x.k! / x.mu!) / (2 * Math.PI) : undefined),
          k: (x) => (2 * Math.PI * x.nu!) ** 2 * x.mu!,
          mu: (x) => div(x.k!, (2 * Math.PI * x.nu!) ** 2),
        },
      },
      steps: {
        nu: st(
          '√({k} ÷ {mu}) ÷ (2 × π)',
          'The spring’s angular frequency √(k ÷ μ), divided by 2π.',
        ),
        k: st('(2 × π × {nu})² × {mu}', 'Square 2πν and multiply by μ.'),
        mu: st('{k} ÷ (2 × π × {nu})²', 'Divide k by (2πν)².'),
      },
    },
    {
      relation: {
        id: 'ν̃ = ν ÷ c',
        display: '{nut} = {nu} ÷ (2.99792 × 10¹⁰)',
        vars: ['nut', 'nu'],
        residual: (x) => x.nut! * LIGHT * 100 - x.nu!,
        solve: { nut: (x) => x.nu! / (LIGHT * 100), nu: (x) => x.nut! * LIGHT * 100 },
      },
      steps: {
        nut: st('{nu} ÷ (2.99792 × 10¹⁰)', 'Divide by c in cm/s for waves per cm.'),
        nu: st('{nut} × 2.99792 × 10¹⁰', 'Multiply by c in cm/s.'),
      },
    },
    {
      relation: {
        id: 'E₀ = ½hν',
        display: '{E0} = ½ × 6.62607 × 10⁻³⁴ × {nu}',
        vars: ['E0', 'nu'],
        residual: (x) => x.E0! - 0.5 * PLANCK * x.nu!,
        solve: { E0: (x) => 0.5 * PLANCK * x.nu!, nu: (x) => x.E0! / (0.5 * PLANCK) },
      },
      steps: {
        E0: st('½ × 6.62607 × 10⁻³⁴ × {nu}', 'The lowest level sits at half a step, ½hν.'),
        nu: st('{E0} ÷ (½ × 6.62607 × 10⁻³⁴)', 'Divide E₀ by ½h.'),
      },
    },
    {
      relation: {
        id: 'per mole',
        display: '{E0m} = {E0} × 6.02214 × 10²³ ÷ 1000',
        vars: ['E0m', 'E0'],
        residual: (x) => x.E0m! * 1000 - x.E0! * AVOGADRO,
        solve: { E0m: (x) => (x.E0! * AVOGADRO) / 1000, E0: (x) => (x.E0m! * 1000) / AVOGADRO },
      },
      steps: {
        E0m: st('{E0} × 6.02214 × 10²³ ÷ 1000', 'Times Avogadro’s number, and J to kJ.'),
        E0: st('{E0m} × 1000 ÷ (6.02214 × 10²³)', 'kJ to J, then per molecule.'),
      },
    },
  ),
  example: hcl,
  startWith: ['m1', 'm2', 'k'],
  representation: {
    kind: 'potentialWell',
    model: 'harmonic',
    letter: 'v',
    lower: 0,
    upper: 1,
    absorb: true,
    force: 'k',
    ground: 'E0',
    more: ['nut'],
  },
});

// ── HC15: tunneling through a barrier (quantum#1~tunneling) ──

/** √(2e) ÷ ħ × 10⁻⁹: κ in nm⁻¹ for m in kg and U − E in eV is this × √(m(U − E)). */
const KAPPA_K = Math.sqrt(2 * ELECTRON_VOLT) / HBAR / 1e9;

const tunnel = (() => {
  const [m, above, a] = [ELECTRON, 1, 0.5];
  const kappa = KAPPA_K * Math.sqrt(m * above);
  return { m, above, a, kappa, T: Math.exp(-2 * kappa * a) };
})();

const tunneling = demo({
  id: 'g.he-potentialWell-tunneling',
  title: 'Tunneling: how much of ψ gets through a barrier',
  use: 'Use this for the decay constant inside a barrier and the chance of tunneling through it.',
  assumptions: [
    'The estimate for a thick barrier (2κa ≫ 1): T ≈ e^(−2κa), leaving out a prefactor near 1.',
    'Inside, the particle’s energy is below U, so ψ decays instead of waving.',
  ],
  variables: [
    mass(),
    quantity('above', 'U − E', 'Barrier above the energy', 'eV', 1e-6, 1e6, 0.01),
    quantity('a', 'a', 'Barrier width', 'nm', 0.001, 100, 0.01),
    quantity('kappa', 'κ', 'Decay constant', 'nm⁻¹', 1e-6, 1e6, 0.01),
    quantity('T', 'T', 'Transmission', undefined, 0, 1, 0.0001, { scientific: true }),
  ],
  ...rules(
    {
      relation: {
        id: 'κ = √(2m(U − E)) ÷ ħ',
        display: '{kappa} = √(2 × {m} × {above} × 1.60218 × 10⁻¹⁹) ÷ (1.05457 × 10⁻³⁴) × 10⁻⁹',
        vars: ['kappa', 'm', 'above'],
        residual: (x) => x.kappa! - KAPPA_K * Math.sqrt(x.m! * x.above!),
        solve: {
          kappa: (x) => KAPPA_K * Math.sqrt(x.m! * x.above!),
          above: (x) => div((x.kappa! / KAPPA_K) ** 2, x.m!),
          m: (x) => div((x.kappa! / KAPPA_K) ** 2, x.above!),
        },
      },
      steps: {
        kappa: st(
          '√(2 × {m} × {above} × 1.60218 × 10⁻¹⁹) ÷ (1.05457 × 10⁻³⁴) × 10⁻⁹',
          'U − E in joules, then √(2m(U − E)) ÷ ħ per metre, and per nm.',
        ),
        above: st(
          '({kappa} × 10⁹ × 1.05457 × 10⁻³⁴)² ÷ (2 × {m} × 1.60218 × 10⁻¹⁹)',
          'Square ħκ (κ per metre), divide by 2m, and give eV.',
        ),
        m: st(
          '({kappa} × 10⁹ × 1.05457 × 10⁻³⁴)² ÷ (2 × {above} × 1.60218 × 10⁻¹⁹)',
          'Square ħκ, then divide by 2(U − E) in joules.',
        ),
      },
    },
    {
      relation: {
        id: 'T ≈ e^(−2κa)',
        display: '{T} = e^(−2 × {kappa} × {a})',
        vars: ['T', 'kappa', 'a'],
        residual: (x) => x.T! - Math.exp(-2 * x.kappa! * x.a!),
        solve: {
          T: (x) => Math.exp(-2 * x.kappa! * x.a!),
          kappa: (x) => (x.T! > 0 && x.T! < 1 ? div(-Math.log(x.T!), 2 * x.a!) : undefined),
          a: (x) => (x.T! > 0 && x.T! < 1 ? div(-Math.log(x.T!), 2 * x.kappa!) : undefined),
        },
      },
      steps: {
        T: st(
          'e^(−2 × {kappa} × {a})',
          'ψ shrinks by e^(−κa) across the barrier; T goes as its square.',
        ),
        kappa: st('−ln({T}) ÷ (2 × {a})', 'Take the log of T and divide by −2a.'),
        a: st('−ln({T}) ÷ (2 × {kappa})', 'Take the log of T and divide by −2κ.'),
      },
    },
  ),
  example: tunnel,
  startWith: ['m', 'above', 'a'],
  representation: {
    kind: 'potentialWell',
    model: 'barrier',
    mass: 'm',
    above: 'above',
    width: 'a',
    kappa: 'kappa',
    transmission: 'T',
  },
});

// ── HC15: a step below the energy (quantum#1~step) ──

const stepDemo = demo({
  id: 'g.he-potentialWell-step',
  title: 'A potential step: the wave that reflects although it could pass',
  use: 'Use this for the reflection and transmission of a particle at a step lower than its energy.',
  assumptions: [
    'k ∝ √(E − U): past the step the wave is longer, since less of E is kinetic.',
    'R + T = 1; a classical particle would never reflect.',
  ],
  variables: [
    quantity('E', 'E', 'Particle energy', 'eV', 0.001, 1e6, 0.01),
    quantity('U0', 'U₀', 'Step height', 'eV', 0, 1e6, 0.01),
    quantity('r', 'k₁/k₂', 'Wavenumber ratio', undefined, 1, 30, 0.001),
    quantity('R', 'R', 'Reflection', undefined, 0, 0.9, 0.0001),
    quantity('T', 'T', 'Transmission', undefined, 0.1, 1, 0.0001),
  ],
  ...rules(
    {
      relation: {
        id: 'k₁/k₂ = √(E ÷ (E − U₀))',
        display: '{r} = √({E} ÷ ({E} − {U0}))',
        vars: ['r', 'E', 'U0'],
        residual: (x) => x.r! ** 2 * (x.E! - x.U0!) - x.E!,
        solve: {
          r: (x) => (x.E! > x.U0! ? Math.sqrt(x.E! / (x.E! - x.U0!)) : undefined),
          E: (x) => div(x.U0! * x.r! ** 2, x.r! ** 2 - 1),
          U0: (x) => x.E! * (1 - 1 / x.r! ** 2),
        },
      },
      steps: {
        r: st(
          '√({E} ÷ ({E} − {U0}))',
          'k goes as √(kinetic energy): E before the step, E − U₀ after.',
        ),
        E: st('{U0} × {r}² ÷ ({r}² − 1)', 'Square the ratio and solve for E.'),
        U0: st('{E} × (1 − 1 ÷ {r}²)', 'Square the ratio and solve for U₀.'),
      },
    },
    {
      relation: {
        id: 'R = ((k₁ − k₂) ÷ (k₁ + k₂))²',
        display: '{R} = (({r} − 1) ÷ ({r} + 1))²',
        vars: ['R', 'r'],
        residual: (x) => x.R! - ((x.r! - 1) / (x.r! + 1)) ** 2,
        solve: {
          R: (x) => ((x.r! - 1) / (x.r! + 1)) ** 2,
          r: (x) => (x.R! < 1 ? (1 + Math.sqrt(x.R!)) / (1 - Math.sqrt(x.R!)) : undefined),
        },
      },
      steps: {
        R: st('(({r} − 1) ÷ ({r} + 1))²', 'Divide top and bottom by k₂, then square.'),
        r: st('(1 + √{R}) ÷ (1 − √{R})', 'Take the root of R and solve for k₁/k₂.'),
      },
    },
    {
      relation: {
        id: 'T = 1 − R',
        display: '{T} = 1 − {R}',
        vars: ['T', 'R'],
        residual: (x) => x.T! + x.R! - 1,
        solve: { T: (x) => 1 - x.R!, R: (x) => 1 - x.T! },
      },
      steps: {
        T: st('1 − {R}', 'What is not reflected passes.'),
        R: st('1 − {T}', 'What does not pass is reflected.'),
      },
    },
    below('U0', 'E', '{U0} < {E}', 'This page is for a step lower than the energy: U₀ < E.'),
  ),
  example: { E: 4, U0: 3, r: 2, R: 1 / 9, T: 8 / 9 },
  startWith: ['E', 'U0'],
  representation: {
    kind: 'potentialWell',
    model: 'step',
    energy: 'E',
    height: 'U0',
    ratio: 'r',
    reflection: 'R',
    transmission: 'T',
  },
});

// ── HC15: a bump in the box, first-order shift (quantum#3) ──

const bump = (() => {
  const [n, L, V0, x1, x2] = [1, 1, 0.05, 0.25, 0.75];
  const P = boxProbability(n, x1 / L, x2 / L);
  const En = (n * n * ELECTRON_E1) / (L * L);
  return { n, L, V0, x1, x2, P, E1: V0 * P, En, E: En + V0 * P };
})();

const bumpDemo = demo({
  id: 'g.he-potentialWell-bump',
  title: 'A small bump in a box: the first-order energy shift',
  use: 'Use this for the first-order shift of a box level from a small step V₀ between x₁ and x₂.',
  assumptions: [
    'V₀ is small next to the gap to the next level; first order uses the unperturbed ψ.',
    'An electron: Eₙ = 0.37603 eV × n² ÷ L² (L in nm).',
  ],
  variables: [
    whole('n', 'n', 'State', 1, 20),
    width(),
    quantity('V0', 'V₀', 'Bump height', 'eV', 0, 1000, 0.001),
    quantity('x1', 'x₁', 'Bump from', 'nm', 0, 100, 0.01),
    quantity('x2', 'x₂', 'Bump to', 'nm', 0.001, 100, 0.01),
    quantity('P', 'P', 'Probability over the bump', undefined, 0, 1, 0.0001),
    quantity('E1', 'E⁽¹⁾', 'First-order shift', 'eV', 0, 1000, 0.0001),
    quantity('En', 'Eₙ', 'Unperturbed energy', 'eV', 1e-9, 1e9, 0.0001),
    quantity('E', 'E', 'Estimate', 'eV', 1e-9, 1e9, 0.0001),
  ],
  ...rules(
    regionChance('n'),
    ...REGION_IN_BOX,
    {
      relation: {
        id: 'E⁽¹⁾ = V₀P',
        display: '{E1} = {V0} × {P}',
        vars: ['E1', 'V0', 'P'],
        residual: (x) => x.E1! - x.V0! * x.P!,
        solve: { E1: (x) => x.V0! * x.P!, V0: (x) => div(x.E1!, x.P!) },
      },
      steps: {
        E1: st('{V0} × {P}', '⟨ψₙ|V|ψₙ⟩: V₀ times the chance of being over the bump.'),
        V0: st('{E1} ÷ {P}', 'Divide the shift by the chance.'),
      },
    },
    {
      relation: {
        id: 'Eₙ = n²h² ÷ (8mL²)',
        display: '{En} = 0.37603 × {n}² ÷ {L}²',
        vars: ['En', 'n', 'L'],
        residual: (x) => x.En! * x.L! ** 2 - ELECTRON_E1 * x.n! ** 2,
        solve: {
          En: (x) => div(ELECTRON_E1 * x.n! ** 2, x.L! ** 2),
          L: (x) => root(div(ELECTRON_E1 * x.n! ** 2, x.En!) ?? -1),
        },
      },
      steps: {
        En: st(
          '0.37603 × {n}² ÷ {L}²',
          'An electron in a 1 nm box has E₁ = 0.37603 eV: times n², over L².',
        ),
        L: st('√(0.37603 × {n}² ÷ {En})', 'Solve for L², then take the root.'),
      },
    },
    {
      relation: {
        id: 'E = Eₙ + E⁽¹⁾',
        display: '{E} = {En} + {E1}',
        vars: ['E', 'En', 'E1'],
        residual: (x) => x.E! - x.En! - x.E1!,
        solve: { E: (x) => x.En! + x.E1!, E1: (x) => x.E! - x.En!, En: (x) => x.E! - x.E1! },
      },
      steps: {
        E: st('{En} + {E1}', 'Add the shift to the unperturbed level.'),
        E1: st('{E} − {En}', 'The estimate less the unperturbed level.'),
        En: st('{E} − {E1}', 'The estimate less the shift.'),
      },
    },
  ),
  example: bump,
  startWith: ['n', 'L', 'V0', 'x1', 'x2'],
  representation: {
    kind: 'potentialWell',
    model: 'bump',
    length: 'L',
    lower: 'n',
    region: { from: 'x1', to: 'x2' },
    probability: 'P',
    bump: 'V0',
    shift: 'E1',
    lowerEnergy: 'En',
  },
});

export const HE2B_GALLERY_MODULES: ModuleDef[] = [
  boxPhoton,
  boxHigh,
  boxDye,
  boxRegion,
  boxSpread,
  harmonic,
  harmonicHigh,
  oscillator,
  tunneling,
  stepDemo,
  bumpDemo,
];

export const HE2B_GALLERY_LAYOUTS: LayoutDef[] = [];
