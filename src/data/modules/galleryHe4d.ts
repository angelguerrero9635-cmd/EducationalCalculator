/**
 * College gallery demos, round 4, group D (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC109 `orbitalDiagram` ladder with Z and mode `radial` (physical-2#2, ~radius; C-P2); HC110
 * mode `crystalField` (inorganic#2; C-P4). docs/plans/he.chemistry.md.
 */
import {
  BOHR_NM,
  fieldFill,
  hydrogenicEnergy,
  meanRadius,
  type FieldGeometry,
} from '@/components/module/reps/orbitalHe4dMath';
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
const st = (expr: StepText['expr'], how: StepText['how']): StepText => ({ expr, how });

/** A demo module: the shared fields filled in (college pages show 3 figures). */
const demo = (m: Omit<ModuleDef, 'workedFigures'> & { workedFigures?: number }): ModuleDef => ({
  workedFigures: 3,
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

/** a < b, checked only; `why` is the reason a conflict is refused. */
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

// ── HC109: a hydrogen-like ion's levels (physical-2#2) ──

const RYD_TEXT = '13.6';
const RYD = 13.6;

const levelRules = (): Rule[] => [
  {
    relation: {
      id: 'E = −13.6Z² ÷ n²',
      display: '{E} = −13.6 × {Z}² ÷ {n}²',
      vars: ['E', 'Z', 'n'],
      residual: (x) => x.E! * x.n! ** 2 + RYD * x.Z! ** 2,
      solve: {
        E: (x) => div(-RYD * x.Z! ** 2, x.n! ** 2),
        Z: (x) => (x.E! < 0 ? x.n! * Math.sqrt(-x.E! / RYD) : undefined),
        n: (x) => (x.E! < 0 ? x.Z! * Math.sqrt(-RYD / x.E!) : undefined),
      },
    },
    steps: {
      E: st(
        `−${RYD_TEXT} × {Z}² ÷ {n}²`,
        'A hydrogen-like ion has one electron: its levels are hydrogen’s times Z².',
      ),
      Z: st(`{n} × √(−{E} ÷ ${RYD_TEXT})`, 'Undo the division by n², then the square.'),
      n: st(`{Z} × √(−${RYD_TEXT} ÷ {E})`, 'Solve for n², then take the root.'),
    },
  },
  {
    relation: {
      id: 'radial nodes = n − l − 1',
      display: '{rad} = {n} − {l} − 1',
      vars: ['rad', 'n', 'l'],
      residual: (x) => x.rad! - (x.n! - x.l! - 1),
      solve: {
        rad: (x) => x.n! - x.l! - 1,
        n: (x) => x.rad! + x.l! + 1,
        l: (x) => x.n! - x.rad! - 1,
      },
    },
    steps: {
      rad: st('{n} − {l} − 1', 'n − 1 nodes in all; l of them are angular, the rest radial.'),
      n: st('{rad} + {l} + 1', 'Add the angular nodes and one to the radial ones.'),
      l: st('{n} − {rad} − 1', 'Take the radial nodes and one from n.'),
    },
  },
  {
    relation: {
      id: 'angular nodes = l',
      display: '{ang} = {l}',
      vars: ['ang', 'l'],
      residual: (x) => x.ang! - x.l!,
      solve: { ang: (x) => x.l!, l: (x) => x.ang! },
    },
    steps: {
      ang: st('{l}', 'Each unit of l is one nodal plane or cone through the nucleus.'),
      l: st('{ang}', 'The angular nodes count l.'),
    },
  },
  {
    relation: {
      id: 'g = n²',
      display: '{g} = {n}²',
      vars: ['g', 'n'],
      residual: (x) => x.g! - x.n! ** 2,
      solve: { g: (x) => x.n! ** 2, n: (x) => (x.g! > 0 ? Math.sqrt(x.g!) : undefined) },
    },
    steps: {
      g: st('{n}²', 'Every l from 0 to n − 1, with 2l + 1 orbitals each, adds up to n².'),
      n: st('√{g}', 'Take the root of the orbitals in the shell.'),
    },
  },
  below('l', 'n', '{l} < {n}', 'l runs from 0 to n − 1.'),
];

const ladderDemo = (id: string, title: string, Z: number, n: number, l: number): ModuleDef =>
  demo({
    id,
    title,
    use: 'Use this for the energy, nodes and degeneracy of an orbital of a one-electron ion (H, He⁺, Li²⁺).',
    assumptions: [
      'One electron only, so every subshell of a shell has the same energy.',
      'R∞ = 13.6 eV; the nucleus is held still (its finite mass is left out).',
    ],
    variables: [
      whole('Z', 'Z', 'Nuclear charge', 1, 10),
      whole('n', 'n', 'Principal quantum number', 1, 10),
      whole('l', 'l', 'Angular momentum quantum number', 0, 9),
      quantity('E', 'E', 'Energy of the level', 'eV', -1400, -0.01, 0.001),
      whole('rad', 'radial', 'Radial nodes', 0, 9),
      whole('ang', 'angular', 'Angular nodes', 0, 9),
      whole('g', 'g', 'Orbitals at that energy', 1, 100),
    ],
    ...rules(...levelRules()),
    example: {
      Z,
      n,
      l,
      E: hydrogenicEnergy(Z, n),
      rad: n - l - 1,
      ang: l,
      g: n * n,
    },
    startWith: ['Z', 'n', 'l'],
    representation: {
      kind: 'orbitalDiagram',
      mode: 'ladder',
      Z: 'Z',
      n: 'n',
      l: 'l',
      energy: 'E',
      radial: 'rad',
      angular: 'ang',
      degeneracy: 'g',
    },
  });

const ladderHe = ladderDemo(
  'g.he-orbitalDiagram-ladder-z',
  'He⁺: the energy, nodes and degeneracy of 2p',
  2,
  2,
  1,
);
const ladderHigh = ladderDemo(
  'g.he-orbitalDiagram-ladder-z-high',
  'B⁴⁺: the 5d level of a one-electron ion',
  5,
  5,
  2,
);

// ── HC109: the radial distribution (physical-2#2~radius) ──

const radiusRules = (top: boolean): Rule[] => [
  {
    relation: {
      id: '⟨r⟩ = (3n² − l(l + 1)) ÷ 2Z',
      display: '{mean} = (3 × {n}² − {l} × ({l} + 1)) ÷ (2 × {Z})',
      vars: ['mean', 'n', 'l', 'Z'],
      residual: (x) => 2 * x.Z! * x.mean! - (3 * x.n! ** 2 - x.l! * (x.l! + 1)),
      solve: {
        mean: (x) => div(3 * x.n! ** 2 - x.l! * (x.l! + 1), 2 * x.Z!),
        Z: (x) => div(3 * x.n! ** 2 - x.l! * (x.l! + 1), 2 * x.mean!),
      },
    },
    steps: {
      mean: st(
        '(3 × {n}² − {l} × ({l} + 1)) ÷ (2 × {Z})',
        'The average of r over P(r), in Bohr radii.',
      ),
      Z: st('(3 × {n}² − {l} × ({l} + 1)) ÷ (2 × {mean})', 'Divide the bracket by 2⟨r⟩.'),
    },
  },
  {
    relation: {
      id: '⟨r⟩ in nm',
      display: `{meanNm} = {mean} × ${BOHR_NM}`,
      vars: ['meanNm', 'mean'],
      residual: (x) => x.meanNm! - x.mean! * BOHR_NM,
      solve: { meanNm: (x) => x.mean! * BOHR_NM, mean: (x) => x.meanNm! / BOHR_NM },
    },
    steps: {
      meanNm: st(`{mean} × ${BOHR_NM}`, `One Bohr radius a₀ is ${BOHR_NM} nm.`),
      mean: st(`{meanNm} ÷ ${BOHR_NM}`, `Divide by a₀ = ${BOHR_NM} nm.`),
    },
  },
  {
    relation: {
      id: 'radial nodes = n − l − 1',
      display: '{nodes} = {n} − {l} − 1',
      vars: ['nodes', 'n', 'l'],
      residual: (x) => x.nodes! - (x.n! - x.l! - 1),
      solve: {
        nodes: (x) => x.n! - x.l! - 1,
        n: (x) => x.nodes! + x.l! + 1,
        l: (x) => x.n! - x.nodes! - 1,
      },
    },
    steps: {
      nodes: st('{n} − {l} − 1', 'P(r) touches zero between its humps n − l − 1 times.'),
      n: st('{nodes} + {l} + 1', 'Add l and one to the radial nodes.'),
      l: st('{n} − {nodes} − 1', 'Take the radial nodes and one from n.'),
    },
  },
  below('l', 'n', '{l} < {n}', 'l runs from 0 to n − 1.'),
  ...(top
    ? [
        {
          relation: {
            id: 'r_mp = n²a₀ ÷ Z',
            display: '{peak} = {n}² ÷ {Z}',
            vars: ['peak', 'n', 'Z'],
            residual: (x: Values) => x.peak! * x.Z! - x.n! ** 2,
            solve: {
              peak: (x: Values) => div(x.n! ** 2, x.Z!),
              Z: (x: Values) => div(x.n! ** 2, x.peak!),
            },
          },
          steps: {
            peak: st('{n}² ÷ {Z}', 'With l = n − 1, P(r) has one hump, at n²a₀ ÷ Z.'),
            Z: st('{n}² ÷ {peak}', 'Divide n² by the most probable radius.'),
          },
        },
        {
          relation: {
            id: 'r_mp in nm',
            display: `{peakNm} = {peak} × ${BOHR_NM}`,
            vars: ['peakNm', 'peak'],
            residual: (x: Values) => x.peakNm! - x.peak! * BOHR_NM,
            solve: {
              peakNm: (x: Values) => x.peak! * BOHR_NM,
              peak: (x: Values) => x.peakNm! / BOHR_NM,
            },
          },
          steps: {
            peakNm: st(`{peak} × ${BOHR_NM}`, `One Bohr radius a₀ is ${BOHR_NM} nm.`),
            peak: st(`{peakNm} ÷ ${BOHR_NM}`, `Divide by a₀ = ${BOHR_NM} nm.`),
          },
        },
        {
          relation: {
            id: 'l = n − 1',
            constraint: true,
            display: '{l} = {n} − 1',
            vars: ['l', 'n'],
            residual: (v: Values) => (v.l === v.n! - 1 ? 0 : 1),
            solve: {},
            message: () => 'r_mp = n²a₀ ÷ Z holds for l = n − 1 (one hump): 1s, 2p, 3d, 4f.',
          },
          steps: {},
        } as Rule,
      ]
    : []),
];

const radialDemo = (id: string, title: string, Z: number, n: number, l: number): ModuleDef => {
  const top = l === n - 1;
  const mean = meanRadius(Z, n, l);
  const peak = (n * n) / Z;
  return demo({
    id,
    title,
    use: top
      ? 'Use this for the mean and most probable radius of a one-hump orbital (1s, 2p, 3d) of a one-electron ion.'
      : 'Use this for the mean radius and the radial nodes of any orbital of a one-electron ion.',
    assumptions: [
      'One electron; r is measured in Bohr radii, a₀ = 0.0529177 nm.',
      'P(r) = r²R²(r) is the chance per unit r of finding the electron at that distance.',
    ],
    variables: [
      whole('Z', 'Z', 'Nuclear charge', 1, 10),
      whole('n', 'n', 'Principal quantum number', 1, 10),
      whole('l', 'l', 'Angular momentum quantum number', 0, 9),
      quantity('mean', '⟨r⟩', 'Mean radius', 'a₀', 0.01, 1000, 0.01),
      quantity('meanNm', '⟨r⟩ₙₘ', 'Mean radius in nm', 'nm', 0.0001, 100, 0.0001),
      whole('nodes', 'radial', 'Radial nodes', 0, 9),
      ...(top
        ? [
            quantity('peak', 'r_mp', 'Most probable radius', 'a₀', 0.01, 1000, 0.01),
            quantity('peakNm', 'r_mp,nm', 'Most probable radius in nm', 'nm', 0.0001, 100, 0.0001),
          ]
        : []),
    ],
    ...rules(...radiusRules(top)),
    example: {
      Z,
      n,
      l,
      mean,
      meanNm: mean * BOHR_NM,
      nodes: n - l - 1,
      ...(top ? { peak, peakNm: peak * BOHR_NM } : {}),
    },
    startWith: ['Z', 'n', 'l'],
    representation: {
      kind: 'orbitalDiagram',
      mode: 'radial',
      Z: 'Z',
      n: 'n',
      l: 'l',
      mean: 'mean',
      meanNm: 'meanNm',
      nodes: 'nodes',
      ...(top ? { peak: 'peak', peakNm: 'peakNm' } : {}),
    },
  });
};

const radial2p = radialDemo(
  'g.he-orbitalDiagram-radial',
  'Hydrogen 2p: the mean and most probable radius',
  1,
  2,
  1,
);
const radial3s = radialDemo(
  'g.he-orbitalDiagram-radial-3s',
  'Hydrogen 3s: two radial nodes and the mean radius',
  1,
  3,
  0,
);

// ── HC110: the crystal field (inorganic#2) ──

/** The lower set's electrons, case by case, as step text (Δ against P decides the spin). */
const lowerStep = (geometry: FieldGeometry) =>
  st(
    (v) => {
      const low = geometry === 'octahedral' && v.split! > v.pairing!;
      const d = v.d!;
      if (geometry === 'tetrahedral')
        return d <= 2 ? '{d}' : d <= 5 ? '2' : d <= 7 ? '{d} − 3' : '4';
      if (low) return d <= 6 ? '{d}' : '6';
      return d <= 3 ? '{d}' : d <= 5 ? '3' : d <= 7 ? '{d} − 2' : '6';
    },
    (v) =>
      geometry === 'tetrahedral'
        ? 'Δₜ is small: one electron in each of the five orbitals first (e, then t₂), then pairs in e.'
        : v.split! > v.pairing!
          ? 'Δₒ > P: pairing costs less than climbing, so t₂g fills to 6 before e_g.'
          : 'Δₒ < P: one electron in each of the five orbitals first, then pairs from t₂g up.',
  );

const unpairedStep = (geometry: FieldGeometry) =>
  st((v) => {
    const d = v.d!;
    if (geometry === 'octahedral' && v.split! > v.pairing!)
      return d <= 3 ? '{d}' : d <= 6 ? '6 − {d}' : d <= 8 ? '{d} − 6' : '10 − {d}';
    return d <= 5 ? '{d}' : '10 − {d}';
  }, 'Count the boxes holding one arrow.');

/** CFSE = Σ(nᵢ × energyᵢ)Δ + (pairs beyond the free ion's) × P. */
const cfseExpr = (geometry: FieldGeometry) => (v: Values) => {
  const [a, b] = geometry === 'tetrahedral' ? ['−0.6', '0.4'] : ['−0.4', '0.6'];
  const pairs = v.d! <= 5 ? '({d} − {u}) ÷ 2' : '(({d} − {u}) ÷ 2 − ({d} − 5))';
  return `(${a} × {t2g} + ${b} × {eg}) × {split} + ${pairs} × {pairing}`;
};

/** Pairs beyond the free ion's max(0, d − 5). */
const extraPairs = (x: Values) => (x.d! - x.u!) / 2 - Math.max(0, x.d! - 5);

/** CFSE from the counts as typed: (a × lower + b × upper)Δ + extra pairs × P. */
const cfseOf = (geometry: FieldGeometry, x: Values) => {
  const [a, b] = geometry === 'tetrahedral' ? [-0.6, 0.4] : [-0.4, 0.6];
  return (a * x.t2g! + b * x.eg!) * x.split! + extraPairs(x) * x.pairing!;
};

const fieldRules = (geometry: FieldGeometry): Rule[] => [
  {
    relation: {
      id: 'lower-set electrons',
      display: `{t2g} = the ${geometry === 'tetrahedral' ? 'tetrahedral lower-set' : 't₂g'} electrons of d{d} at Δ {split}, P {pairing}`,
      vars: ['t2g', 'd', 'split', 'pairing'],
      residual: (x) => x.t2g! - fieldFill(x.d!, x.split!, x.pairing!, geometry).counts[0]!,
      // A step in d, Δ and P: only the count is worked out from them, never the reverse.
      solve: {
        t2g: (x) =>
          x.split! > 0 ? fieldFill(x.d!, x.split!, x.pairing!, geometry).counts[0] : undefined,
        d: () => undefined,
        split: () => undefined,
        pairing: () => undefined,
      },
    },
    steps: { t2g: lowerStep(geometry) },
  },
  {
    relation: {
      id: 'upper = d − lower',
      display: '{eg} = {d} − {t2g}',
      vars: ['eg', 'd', 't2g'],
      residual: (x) => x.eg! - (x.d! - x.t2g!),
      solve: { eg: (x) => x.d! - x.t2g!, d: (x) => x.eg! + x.t2g!, t2g: (x) => x.d! - x.eg! },
    },
    steps: {
      eg: st('{d} − {t2g}', 'The rest of the d electrons sit in the upper set.'),
      d: st('{eg} + {t2g}', 'Add both sets.'),
      t2g: st('{d} − {eg}', 'Take the upper set’s electrons from d.'),
    },
  },
  {
    relation: {
      id: 'unpaired electrons',
      display: `{u} = the unpaired electrons of d{d} at Δ {split}, P {pairing}${geometry === 'tetrahedral' ? ' in a tetrahedral field' : ''}`,
      vars: ['u', 'd', 'split', 'pairing'],
      residual: (x) => x.u! - fieldFill(x.d!, x.split!, x.pairing!, geometry).unpaired,
      solve: {
        u: (x) =>
          x.split! > 0 ? fieldFill(x.d!, x.split!, x.pairing!, geometry).unpaired : undefined,
        d: () => undefined,
        split: () => undefined,
        pairing: () => undefined,
      },
    },
    steps: { u: unpairedStep(geometry) },
  },
  {
    relation: {
      id: 'CFSE',
      display: `{cfse} = (${geometry === 'tetrahedral' ? '−0.6 × {t2g} + 0.4' : '−0.4 × {t2g} + 0.6'} × {eg}) × {split} + (({d} − {u}) ÷ 2 − the free ion’s pairs of d{d}) × {pairing}`,
      vars: ['cfse', 't2g', 'eg', 'split', 'pairing', 'd', 'u'],
      residual: (x) => x.cfse! - cfseOf(geometry, x),
      solve: {
        cfse: (x) => cfseOf(geometry, x),
        // Δ and P set the counts themselves: they are typed, never worked back from CFSE.
        split: () => undefined,
        pairing: () => undefined,
        d: () => undefined,
        u: () => undefined,
        t2g: () => undefined,
        eg: () => undefined,
      },
    },
    steps: {
      cfse: st(
        cfseExpr(geometry),
        'Each lower electron is stabilized, each upper one raised; each pair beyond the free ion’s costs P.',
      ),
    },
  },
  {
    relation: {
      id: 'μ = √(n(n + 2))',
      display: '{mu} = √({u} × ({u} + 2))',
      vars: ['mu', 'u'],
      residual: (x) => x.mu! ** 2 - x.u! * (x.u! + 2),
      solve: {
        mu: (x) => Math.sqrt(x.u! * (x.u! + 2)),
        u: (x) => Math.sqrt(1 + x.mu! ** 2) - 1,
      },
    },
    steps: {
      mu: st('√({u} × ({u} + 2))', 'The spin-only moment, in Bohr magnetons.'),
      u: st('√(1 + {mu}²) − 1', 'Solve n² + 2n = μ² for n.'),
    },
  },
];

const fieldDemo = (
  id: string,
  title: string,
  d: number,
  split: number,
  pairing: number,
  ion: string,
  ligand: string,
  geometry: FieldGeometry = 'octahedral',
): ModuleDef => {
  const f = fieldFill(d, split, pairing, geometry);
  const tet = geometry === 'tetrahedral';
  return demo({
    id,
    title,
    use: tet
      ? 'Use this for the d electrons of a tetrahedral complex: always high spin, its CFSE and spin-only moment.'
      : 'Use this for high or low spin, unpaired electrons, CFSE and the spin-only moment of an octahedral complex.',
    assumptions: tet
      ? [
          'Tetrahedral: e below t₂, Δₜ about 4/9 of Δₒ, smaller than P, so high spin.',
          'CFSE counts e at −0.6Δₜ and t₂ at +0.4Δₜ; pairs beyond the free ion’s cost P.',
        ]
      : [
          'Octahedral: t₂g at −0.4Δₒ and e_g at +0.6Δₒ; low spin when Δₒ > P.',
          'Pairs are counted against the free ion’s; Δₒ, P and CFSE in cm⁻¹.',
        ],
    variables: [
      whole('d', 'd', 'd electrons', 0, 10),
      quantity('split', tet ? 'Δₜ' : 'Δₒ', 'Splitting', 'cm⁻¹', 100, 60000, 1),
      quantity('pairing', 'P', 'Pairing energy', 'cm⁻¹', 100, 60000, 1),
      whole('t2g', tet ? 'n(e)' : 'n(t₂g)', tet ? 'Electrons in e' : 'Electrons in t₂g', 0, 6),
      whole('eg', tet ? 'n(t₂)' : 'n(e_g)', tet ? 'Electrons in t₂' : 'Electrons in e_g', 0, 6),
      whole('u', 'n', 'Unpaired electrons', 0, 5),
      quantity('cfse', 'CFSE', 'Crystal field stabilization energy', 'cm⁻¹', -200000, 200000, 1),
      quantity('mu', 'μ', 'Spin-only moment', 'BM', 0, 6, 0.01),
    ],
    ...rules(...fieldRules(geometry)),
    example: {
      d,
      split,
      pairing,
      t2g: f.counts[0]!,
      eg: d - f.counts[0]!,
      u: f.unpaired,
      cfse: f.cfse,
      mu: f.moment,
    },
    startWith: ['d', 'split', 'pairing'],
    representation: {
      kind: 'orbitalDiagram',
      mode: 'crystalField',
      d: 'd',
      split: 'split',
      pairing: 'pairing',
      ...(tet ? { geometry } : {}),
      t2g: 't2g',
      eg: 'eg',
      unpaired: 'u',
      cfse: 'cfse',
      moment: 'mu',
      ion,
      ligand,
    },
  });
};

const fieldHigh = fieldDemo(
  'g.he-orbitalDiagram-crystal-field',
  'Fe²⁺ with water: high spin, CFSE and μ',
  6,
  10400,
  17600,
  'Fe²⁺',
  'H₂O',
);
const fieldLow = fieldDemo(
  'g.he-orbitalDiagram-crystal-field-low',
  'Mn³⁺ with cyanide: low spin d⁴',
  4,
  34000,
  28000,
  'Mn³⁺',
  'CN⁻',
);
const fieldTet = fieldDemo(
  'g.he-orbitalDiagram-crystal-field-tetrahedral',
  'Co²⁺ with chloride, tetrahedral: e⁴t₂³',
  7,
  3300,
  21000,
  'Co²⁺',
  'Cl⁻',
  'tetrahedral',
);

// ── HC111: formal charges, resonance, expanded octets (gen-chem-1#4~formal-charge) ──

const formalRule: Rule = {
  relation: {
    id: 'FC = v − N − B ÷ 2',
    display: '{FC} = {v} − {N} − {B} ÷ 2',
    vars: ['FC', 'v', 'N', 'B'],
    residual: (x) => x.FC! - (x.v! - x.N! - x.B! / 2),
    solve: {
      FC: (x) => x.v! - x.N! - x.B! / 2,
      v: (x) => x.FC! + x.N! + x.B! / 2,
      N: (x) => x.v! - x.FC! - x.B! / 2,
      B: (x) => 2 * (x.v! - x.N! - x.FC!),
    },
  },
  steps: {
    FC: st(
      '{v} − {N} − {B} ÷ 2',
      'The atom owns its lone-pair electrons and half of each shared pair.',
    ),
    v: st(
      '{FC} + {N} + {B} ÷ 2',
      'Add back the electrons the atom keeps and half the shared ones.',
    ),
    N: st('{v} − {FC} − {B} ÷ 2', 'Take the charge and half the bonding electrons from v.'),
    B: st('2 × ({v} − {N} − {FC})', 'Solve for B ÷ 2, then double it.'),
  },
};

const formalDemo = (
  id: string,
  title: string,
  formula: string,
  resonance: boolean,
  v: number,
  N: number,
  B: number,
): ModuleDef =>
  demo({
    id,
    title,
    use: 'Use this for the formal charge on an atom of a Lewis structure, and to pick the best structure.',
    assumptions: [
      'The charges in one structure add to the ion’s charge (0 for a molecule).',
      'The best structure has charges nearest zero, a negative one on the more electronegative atom.',
    ],
    variables: [
      whole('v', 'v', 'Valence electrons of the free atom', 1, 8),
      whole('N', 'N', 'Nonbonding electrons', 0, 8),
      whole('B', 'B', 'Bonding electrons', 0, 12),
      whole('FC', 'FC', 'Formal charge', -4, 4),
    ],
    ...rules(formalRule),
    example: { v, N, B, FC: v - N - B / 2 },
    startWith: ['v', 'N', 'B'],
    representation: {
      kind: 'lewisStructure',
      mode: 'molecule',
      formula,
      ...(resonance ? { resonance } : {}),
      formal: { valence: 'v', nonbonding: 'N', bonding: 'B', charge: 'FC' },
    },
  });

const formalNitrate = formalDemo(
  'g.he-lewisStructure-formal',
  'Nitrate: the formal charge on N and the three resonance forms',
  'NO3-',
  true,
  5,
  0,
  8,
);
const formalOzone = formalDemo(
  'g.he-lewisStructure-formal-ozone',
  'Ozone: the middle oxygen’s formal charge, two forms',
  'O3',
  true,
  6,
  2,
  6,
);
const formalTriiodide = formalDemo(
  'g.he-lewisStructure-formal-expanded',
  'Triiodide: an expanded octet on the middle iodine',
  'I3-',
  false,
  7,
  6,
  4,
);

// ── HC112: the cuvette (analytical#2) ──

const cuvetteDemo = (id: string, title: string, eps: number, b: number, c: number): ModuleDef => {
  const A = eps * b * c;
  return demo({
    id,
    title,
    use: 'Use this for absorbance, %T, ε or c from Beer’s law, A = εbc.',
    assumptions: [
      'One wavelength; dilute solution, so A stays on the line (up to about 1).',
      'A has no unit; %T = 100 × 10^(−A).',
    ],
    variables: [
      quantity('eps', 'ε', 'Molar absorptivity', 'L/(mol·cm)', 1, 1e6, 1, { scientific: true }),
      quantity('b', 'b', 'Path length', 'cm', 0.01, 10, 0.01),
      quantity('c', 'c', 'Concentration', 'M', 1e-9, 1, 1e-9, { scientific: true }),
      quantity('A', 'A', 'Absorbance', undefined, 0.0001, 5, 0.0001),
      quantity('T', '%T', 'Transmittance', '%', 0.001, 100, 0.01),
    ],
    ...rules(
      {
        relation: {
          id: 'A = εbc',
          display: '{A} = {eps} × {b} × {c}',
          vars: ['A', 'eps', 'b', 'c'],
          residual: (x) => x.A! - x.eps! * x.b! * x.c!,
          solve: {
            A: (x) => x.eps! * x.b! * x.c!,
            eps: (x) => div(x.A!, x.b! * x.c!),
            b: (x) => div(x.A!, x.eps! * x.c!),
            c: (x) => div(x.A!, x.eps! * x.b!),
          },
        },
        steps: {
          A: st(
            '{eps} × {b} × {c}',
            'Beer’s law: absorbance grows with ε, the path and the concentration.',
          ),
          eps: st('{A} ÷ ({b} × {c})', 'Divide A by the path and the concentration.'),
          b: st('{A} ÷ ({eps} × {c})', 'Divide A by ε and c.'),
          c: st('{A} ÷ ({eps} × {b})', 'Divide A by ε and the path.'),
        },
      },
      {
        relation: {
          id: 'A = −log(%T ÷ 100)',
          display: '{A} = −log₁₀({T} ÷ 100)',
          vars: ['A', 'T'],
          residual: (x) => x.A! + Math.log10(x.T! / 100),
          solve: {
            A: (x) => (x.T! > 0 ? -Math.log10(x.T! / 100) : undefined),
            T: (x) => 100 * 10 ** -x.A!,
          },
        },
        steps: {
          A: st('−log₁₀({T} ÷ 100)', 'A = −log(I ÷ I₀), and I ÷ I₀ is %T ÷ 100.'),
          T: st('100 ÷ 10^{A}', 'Undo the log: I ÷ I₀ = 1 ÷ 10^A, as a percent.'),
        },
      },
    ),
    example: { eps, b, c, A, T: 100 * 10 ** -A },
    startWith: ['eps', 'b', 'c'],
    representation: {
      kind: 'beaker',
      cuvette: {
        path: 'b',
        absorbance: 'A',
        transmittance: 'T',
        absorptivity: 'eps',
        concentration: 'c',
      },
    },
  });
};

const cuvette = cuvetteDemo(
  'g.he-beaker-cuvette',
  'Beer’s law in a 1 cm cuvette: A and %T',
  1.2e4,
  1,
  4e-5,
);
const cuvetteDark = cuvetteDemo(
  'g.he-beaker-cuvette-dark',
  'A 2 cm cell of a strong absorber: A near 1.5',
  2.5e4,
  2,
  3e-5,
);

// ── HC113: symmetry elements (explore) and molecule cards (inorganic#0) ──

const symmetryExplore: LayoutDef = {
  kind: 'explore',
  id: 'g.he-symmetryElements',
  title: 'Symmetry elements: what maps a molecule onto itself',
  use: 'Use this for “Which symmetry elements does water have, and what is its point group?”',
  assumptions: [
    'A symmetry element is an axis, a plane or a point; doing its operation leaves the molecule looking the same.',
    'Find the shape first (VSEPR), then its symmetry.',
  ],
  figure: { kind: 'symmetryElements' },
  scenes: [
    {
      label: 'H₂O: C₂',
      lines: [
        'A turn of 180° about the axis through O swaps the two H atoms.',
        'The molecule looks the same, so the axis is a C₂.',
      ],
      symmetry: { molecule: 'H2O', element: 'C2' },
    },
    {
      label: 'H₂O: σᵥ',
      lines: [
        'The plane of the molecule holds every atom, so reflecting in it moves nothing.',
        'It contains the C₂ axis: a vertical mirror plane, σᵥ.',
      ],
      symmetry: { molecule: 'H2O', element: 'sv' },
    },
    {
      label: 'NH₃: C₃',
      lines: [
        'A turn of 120° about the axis through N moves each H to the next.',
        'With three σᵥ planes through the axis, the group is C₃ᵥ.',
      ],
      symmetry: { molecule: 'NH3', element: 'C3' },
    },
    {
      label: 'BF₃: σₕ',
      lines: [
        'The molecule’s plane is perpendicular to the C₃ axis: a horizontal mirror plane, σₕ.',
        'Three C₂ axes in that plane make the group D₃ₕ.',
      ],
      symmetry: { molecule: 'BF3', element: 'sh' },
    },
    {
      label: 'CH₄: S₄',
      lines: [
        'Turn 90° about the axis between two H atoms, then reflect across: every H lands on an H.',
        'Neither step alone works; together they make S₄.',
      ],
      symmetry: { molecule: 'CH4', element: 'S4' },
    },
    {
      label: 'XeF₄: i',
      lines: [
        'Each F goes through the Xe to the F straight across from it.',
        'A centre of inversion, i, with a C₄ axis and σₕ: the group is D₄ₕ.',
      ],
      symmetry: { molecule: 'XeF4', element: 'i' },
    },
    {
      label: 'SF₆: C₄',
      lines: [
        'A turn of 90° about the line through two opposite F atoms moves each of the other four F to the next.',
        'Three such C₄ axes, four C₃ axes and a centre make the group O_h.',
      ],
      symmetry: { molecule: 'SF6', element: 'C4' },
    },
    {
      label: 'CO₂: C∞',
      lines: [
        'A linear molecule looks the same after a turn of any angle about its axis: C∞.',
        'With a centre of inversion, the group is D∞h.',
      ],
      symmetry: { molecule: 'CO2', element: 'Cinf' },
    },
  ],
};

const symmetryEdge: LayoutDef = {
  kind: 'explore',
  id: 'g.he-symmetryElements-planes',
  title: 'Planes, centres and improper axes',
  use: 'Use this for “Does trans-N₂F₂ have a centre of inversion?”',
  assumptions: [
    'An improper axis Sₙ is a turn of 360° ÷ n followed by a reflection in the plane across it.',
    'A molecule with a centre of inversion has every atom matched by a like atom straight through the centre.',
  ],
  figure: { kind: 'symmetryElements' },
  scenes: [
    {
      label: 'PCl₅: S₃',
      lines: [
        'Turn 120° about the axial line, then reflect across the equatorial plane.',
        'The two axial Cl atoms swap and the three equatorial ones move round: S₃.',
      ],
      symmetry: { molecule: 'PCl5', element: 'S3' },
    },
    {
      label: 'trans-N₂F₂: i',
      lines: [
        'The two F atoms sit on opposite sides, so each passes through the centre onto the other.',
        'With a C₂ and σₕ, the group is C₂ₕ.',
      ],
      symmetry: { molecule: 'N2F2', element: 'i' },
    },
    {
      label: 'CH₂Cl₂: σᵥ′',
      lines: [
        'The plane through C and both H atoms reflects one Cl onto the other.',
        'Two planes and a C₂ make the group C₂ᵥ, the same as water’s.',
      ],
      symmetry: { molecule: 'CH2Cl2', element: 'sv2' },
    },
  ],
};

const pointGroupCards: LayoutDef = {
  kind: 'sort',
  id: 'g.he-molecule-card-point-groups',
  title: 'Sort molecules by point group',
  use: 'Use this for “What is the point group of PCl₃?”',
  assumptions: [
    'Find the shape first (VSEPR), then its symmetry elements.',
    'Lone pairs count for the shape but are not drawn on the cards.',
  ],
  question: 'Which point group does the molecule belong to?',
  pickBar: true,
  bins: [
    { id: 'c2v', label: 'C₂ᵥ', why: 'One C₂ axis and two mirror planes containing it.' },
    { id: 'c3v', label: 'C₃ᵥ', why: 'One C₃ axis and three mirror planes containing it.' },
    { id: 'd3h', label: 'D₃ₕ', why: 'A C₃ axis, three C₂ axes across it and a σₕ plane.' },
    { id: 'td', label: 'T_d', why: 'The tetrahedron: four C₃ axes and three S₄ axes.' },
    { id: 'd4h', label: 'D₄ₕ', why: 'A C₄ axis, four C₂ axes across it, σₕ and a centre.' },
    { id: 'oh', label: 'O_h', why: 'The octahedron: three C₄ axes, four C₃ axes and a centre.' },
    { id: 'dinfh', label: 'D∞h', why: 'Linear with a centre of inversion.' },
    { id: 'cinfv', label: 'C∞v', why: 'Linear with no centre of inversion.' },
  ],
  cards: (
    [
      ['H₂O', 'H2O', 'c2v'],
      ['CH₂Cl₂', 'CH2Cl2', 'c2v'],
      ['SO₂', 'SO2', 'c2v'],
      ['NH₃', 'NH3', 'c3v'],
      ['CHCl₃', 'CHCl3', 'c3v'],
      ['PCl₃', 'PCl3', 'c3v'],
      ['BF₃', 'BF3', 'd3h'],
      ['PCl₅', 'PCl5', 'd3h'],
      ['CH₄', 'CH4', 'td'],
      ['CCl₄', 'CCl4', 'td'],
      ['XeF₄', 'XeF4', 'd4h'],
      ['[PtCl₄]²⁻', '[PtCl4]2-', 'd4h'],
      ['SF₆', 'SF6', 'oh'],
      ['[Fe(CN)₆]⁴⁻', '[Fe(CN)6]4-', 'oh'],
      ['CO₂', 'CO2', 'dinfh'],
      ['C₂H₂', 'C2H2', 'dinfh'],
      ['HCl', 'HCl', 'cinfv'],
      ['HCN', 'HCN', 'cinfv'],
    ] as const
  ).map(([label, formula, bin]) => ({ label, bin, figure: { kind: 'molecule', formula } })),
};

export const HE4D_GALLERY_MODULES: ModuleDef[] = [
  ladderHe,
  ladderHigh,
  radial2p,
  radial3s,
  fieldHigh,
  fieldLow,
  fieldTet,
  formalNitrate,
  formalOzone,
  formalTriiodide,
  cuvette,
  cuvetteDark,
];

export const HE4D_GALLERY_LAYOUTS: LayoutDef[] = [symmetryExplore, symmetryEdge, pointGroupCards];
