/**
 * Grade 10 science: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md; the
 * direction plan and build notes: docs/BUILD_HS.md, docs/build/s.10.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/science10.ts`.
 */
import { trendValue } from '@/components/module/reps/chemTrends';
import {
  configuration,
  photonEnergy,
  photonWavelength,
  unpaired,
  valenceOf,
} from '@/components/module/reps/electrons';
import { subscript } from '@/components/module/reps/chem';
import {
  LEWIS,
  hydrogensOf,
  ionic,
  lewisCounts,
  lewisKey,
  valenceElectrons,
} from '@/components/module/reps/lewis';
import { molarMassOf } from '@/components/module/reps/moles';
import { solubilityAt } from '@/components/module/reps/solubility';
import { shapeOf } from '@/components/module/reps/vseprGeo';
import { formatNumber as fmt } from '@/engine/format';
import type { Relation, VariableDef } from '@/engine/types';

import { atLeast, whole } from '../helpers';
import type { ModuleDef, StepText } from '../types';
import type { TrendProperty } from '../typesHsi';

/** A relation and its step text, built together so a page lists both from one place. */
interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

/** Gathers rules into a module's `relations` and `steps`. */
const rules = (...rs: Rule[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

/** A value with a unit the unit menu keeps (never switched to another unit). */
const quantity = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  step = 0.01,
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

// ─── Measurement ─────────────────────────────────────────────────────────────

/**
 * out = start × k, the chain's factors multiplied into k: `factorText` is how the steps write
 * them ("1000 × 100", or "1000/3600").
 */
const chainRule = (
  out: string,
  start: string,
  k: number,
  factorText: string,
  how: string,
): Rule => ({
  relation: {
    id: `${out} = ${start} × factors`,
    display: `{${out}} = {${start}} × ${factorText}`,
    vars: [out, start],
    residual: (v) => v[out]! - v[start]! * k,
    solve: { [out]: (v) => v[start]! * k, [start]: (v) => v[out]! / k },
  },
  steps: {
    [out]: { expr: `{${start}} × ${factorText}`, how },
    [start]: {
      expr: `{${out}}/(${factorText})`,
      how: 'Run the chain backwards: divide by the product of the factors.',
    },
  },
});

/** The mean of three trials, and its percent error against the accepted value. */
const trialRules: Rule[] = [
  {
    relation: {
      id: 'mean',
      display: '{m} = ({a} + {b} + {c})/3',
      vars: ['m', 'a', 'b', 'c'],
      residual: (v) => v.m! - (v.a! + v.b! + v.c!) / 3,
      solve: {
        m: (v) => (v.a! + v.b! + v.c!) / 3,
        a: (v) => 3 * v.m! - v.b! - v.c!,
        b: (v) => 3 * v.m! - v.a! - v.c!,
        c: (v) => 3 * v.m! - v.a! - v.b!,
      },
    },
    steps: {
      m: { expr: '({a} + {b} + {c})/3', how: 'Add the three trials and divide by 3.' },
      a: {
        expr: '3 × {m} − {b} − {c}',
        how: 'Three times the mean is the sum; take away the other two.',
      },
      b: {
        expr: '3 × {m} − {a} − {c}',
        how: 'Three times the mean is the sum; take away the other two.',
      },
      c: {
        expr: '3 × {m} − {a} − {b}',
        how: 'Three times the mean is the sum; take away the other two.',
      },
    },
  },
  {
    relation: {
      id: 'percent error',
      display: '{e} = |{m} − {t}|/{t} × 100',
      vars: ['e', 'm', 't'],
      residual: (v) => v.e! - (Math.abs(v.m! - v.t!) / v.t!) * 100,
      solve: {
        e: (v) => (v.t! === 0 ? undefined : (Math.abs(v.m! - v.t!) / v.t!) * 100),
        m: () => undefined,
        t: () => undefined,
      },
    },
    steps: {
      e: {
        expr: '|{m} − {t}|/{t} × 100',
        how: 'The error is how far the mean is from the accepted value, as a percent of it.',
      },
    },
  },
];

const MEASUREMENT: ModuleDef[] = [
  {
    id: 's.10.measurement',
    unitSystems: ['metric'],
    assumptions: [
      'A conversion factor equals 1, so multiplying by it changes the unit, not the amount.',
      'Put the unit you want to cancel on the bottom of the factor.',
      'Exact defined factors (1000 m in 1 km) never limit significant figures.',
    ],
    variables: [
      quantity('d', 'd', 'Distance in kilometers', 'km', 0.001, 1000, 0.001),
      quantity('c', 'c', 'Distance in centimeters', 'cm', 0.1, 1e8, 0.1, { scientific: true }),
    ],
    ...rules(
      chainRule(
        'c',
        'd',
        1e5,
        '1000 × 100',
        'Multiply by 1000 m per km, then by 100 cm per m: km and m cancel.',
      ),
    ),
    example: { d: 2.5, c: 250000 },
    startWith: ['d'],
    representation: {
      kind: 'unitChain',
      mode: 'chain',
      start: 'd',
      unit: 'km',
      factors: [
        { top: 1000, topUnit: 'm', bottom: 1, bottomUnit: 'km' },
        { top: 100, topUnit: 'cm', bottom: 1, bottomUnit: 'm' },
      ],
      result: 'c',
    },
  },
  {
    id: 's.10.measurement~factor',
    title: 'One conversion factor',
    use: 'Use this to change kilometers to meters with one conversion factor.',
    unitSystems: ['metric'],
    assumptions: [
      '1 km = 1000 m, so 1000 m/1 km is 1: multiplying by it changes only the unit.',
      'The km on top and bottom cancel, leaving meters.',
    ],
    variables: [
      quantity('a', 'a', 'Kilometers', undefined, 0.001, 1000, 0.001),
      quantity('b', 'b', 'Meters', undefined, 1, 1e6, 1),
    ],
    relations: [
      {
        id: 'b = a × 1000',
        display: '{a} × 1000 = {b}',
        vars: ['a', 'b'],
        residual: (v) => v.b! - v.a! * 1000,
        solve: { b: (v) => v.a! * 1000, a: (v) => v.b! / 1000 },
      },
    ],
    steps: {
      'b = a × 1000': {
        b: { expr: '{a} × 1000', how: 'Multiply by 1000 m over 1 km: the km cancel.' },
        a: { expr: '{b} ÷ 1000', how: 'Multiply by 1 km over 1000 m: the m cancel.' },
      },
    },
    example: { a: 3.2, b: 3200 },
    startWith: ['a'],
    equation: '{a} km × {1000 m}/{1 km} = {b} m',
    representation: { kind: 'table', sweep: 'a', output: 'b', params: [], rows: [1, 2, 3, 4, 5] },
  },
  {
    id: 's.10.measurement~rate',
    title: 'Converting a rate',
    use: 'Use this to change a speed in kilometers per hour to meters per second.',
    unitSystems: ['metric'],
    assumptions: [
      '1 km = 1000 m and 1 h = 3600 s exactly.',
      'The hour is on the bottom of the rate, so its factor puts hours on top.',
    ],
    variables: [
      quantity('v', 'v', 'Speed in kilometers per hour', 'km/h', 1, 1000, 0.1),
      quantity('w', 'w', 'Speed in meters per second', 'm/s', 0.1, 300, 0.0001),
    ],
    ...rules(
      chainRule(
        'w',
        'v',
        1000 / 3600,
        '1000/3600',
        'Multiply by 1000 m per km and by 1 h per 3600 s: km and h cancel.',
      ),
    ),
    example: { v: 90, w: 25 },
    startWith: ['v'],
    representation: {
      kind: 'unitChain',
      mode: 'chain',
      start: 'v',
      unit: 'km',
      per: 'h',
      factors: [
        { top: 1000, topUnit: 'm', bottom: 1, bottomUnit: 'km' },
        { top: 1, topUnit: 'h', bottom: 3600, bottomUnit: 's' },
      ],
      result: 'w',
    },
  },
  {
    id: 's.10.measurement~ruler',
    title: 'Reading a ruler to the estimated digit',
    use: 'Use this to read a length to one digit past the smallest marks and count its significant figures.',
    unitSystems: ['metric'],
    assumptions: [
      'The ruler is marked every 0.1 cm (every millimeter).',
      'Read one digit past the smallest mark; that last digit is estimated and still significant.',
    ],
    variables: [
      quantity('s', 'x₁', 'Start of the rod', 'cm', 0, 9, 0.01, { multipleOf: 0.01 }),
      quantity('e', 'x₂', 'End of the rod', 'cm', 0.01, 10, 0.01, { multipleOf: 0.01 }),
      quantity('L', 'L', 'Length of the rod', 'cm', 0, 10, 0.01),
    ],
    ...rules({
      relation: {
        id: 'L = x₂ − x₁',
        display: '{L} = {e} − {s}',
        vars: ['L', 'e', 's'],
        residual: (v) => v.L! - (v.e! - v.s!),
        solve: { L: (v) => v.e! - v.s!, e: (v) => v.L! + v.s!, s: (v) => v.e! - v.L! },
      },
      steps: {
        L: { expr: '{e} − {s}', how: 'The length is the end reading minus the start reading.' },
        e: { expr: '{L} + {s}', how: 'Add the length to the start reading.' },
        s: { expr: '{e} − {L}', how: 'Take the length away from the end reading.' },
      },
    }),
    example: { s: 1, e: 7.46, L: 6.46 },
    startWith: ['s', 'e'],
    sliders: true,
    representation: {
      kind: 'unitChain',
      mode: 'ruler',
      start: 's',
      end: 'e',
      length: 'L',
      division: 0.1,
      unit: 'cm',
      span: 10,
    },
  },
  {
    id: 's.10.measurement~accuracy',
    title: 'Accuracy, precision and percent error',
    use: 'Use this to judge a set of trials against the accepted value and find the percent error.',
    unitSystems: ['metric'],
    assumptions: [
      'Three students measured the density of aluminum; its accepted value is 2.70 g/cm³.',
      'Accurate means the mean is close to the accepted value.',
      'Precise means the trials are close to each other.',
    ],
    variables: [
      quantity('a', 'x₁', 'Trial 1', 'g/cm³', 0, 25, 0.01),
      quantity('b', 'x₂', 'Trial 2', 'g/cm³', 0, 25, 0.01),
      quantity('c', 'x₃', 'Trial 3', 'g/cm³', 0, 25, 0.01),
      quantity('m', 'x̄', 'Mean', 'g/cm³', 0, 25, 0.0001),
      quantity('t', 'A', 'Accepted value', 'g/cm³', 0.01, 25, 0.01),
      quantity('e', 'E', 'Percent error', '%', 0, 1000, 0.0001),
    ],
    ...rules(...trialRules),
    example: { a: 2.68, b: 2.7, c: 2.69, m: 2.69, t: 2.7, e: (0.01 / 2.7) * 100 },
    startWith: ['a', 'b', 'c', 't'],
    representation: {
      kind: 'unitChain',
      mode: 'target',
      trials: ['a', 'b', 'c'],
      accepted: 't',
      unit: 'g/cm³',
      mean: 'm',
      error: 'e',
    },
  },
];

// ─── Atomic structure ────────────────────────────────────────────────────────

/** A = Z + N: the nucleus holds the protons and the neutrons. */
const massRule: Rule = {
  relation: {
    id: 'A = Z + N',
    display: '{A} = {p} + {n}',
    vars: ['A', 'p', 'n'],
    residual: (v) => v.A! - v.p! - v.n!,
    solve: { A: (v) => v.p! + v.n!, p: (v) => v.A! - v.n!, n: (v) => v.A! - v.p! },
  },
  steps: {
    A: { expr: '{p} + {n}', how: 'The mass number counts every particle in the nucleus.' },
    p: { expr: '{A} − {n}', how: 'Take the neutrons away from the mass number.' },
    n: { expr: '{A} − {p}', how: 'Take the protons away from the mass number.' },
  },
};

/** q = Z − e: each proton is +1 and each electron −1. */
const chargeRule: Rule = {
  relation: {
    id: 'q = Z − e',
    display: '{q} = {p} − {e}',
    vars: ['q', 'p', 'e'],
    residual: (v) => v.q! - v.p! + v.e!,
    solve: { q: (v) => v.p! - v.e!, p: (v) => v.q! + v.e!, e: (v) => v.p! - v.q! },
  },
  steps: {
    q: { expr: '{p} − {e}', how: 'Each proton adds +1 and each electron −1.' },
    p: { expr: '{q} + {e}', how: 'Add the electrons back to the charge.' },
    e: {
      expr: '{p} − {q}',
      how: 'A positive ion has lost electrons; a negative ion has gained them.',
    },
  },
};

const PARTICLES: VariableDef[] = [
  whole('p', 'Z', 'Protons (atomic number)', 1, 54),
  whole('n', 'N', 'Neutrons', 0, 90),
  whole('e', 'e', 'Electrons', 0, 54),
  whole('A', 'A', 'Mass number', 1, 144),
  whole('q', 'q', 'Charge', -3, 3),
];

const ATOM_PICTURE = {
  kind: 'atomModel',
  protons: 'p',
  neutrons: 'n',
  electrons: 'e',
  mass: 'A',
  charge: 'q',
} as const;

const ATOMS: ModuleDef[] = [
  {
    id: 's.10.atomic-structure',
    assumptions: [
      'The number of protons names the element.',
      'Isotopes of an element differ only in neutrons, so only the mass number changes.',
      'Electrons have almost no mass, so they are left out of the mass number.',
    ],
    variables: PARTICLES,
    ...rules(massRule, chargeRule),
    example: { p: 13, n: 14, e: 13, A: 27, q: 0 },
    startWith: ['p', 'n', 'e'],
    sliders: true,
    representation: ATOM_PICTURE,
  },
  {
    id: 's.10.atomic-structure~ions',
    title: 'Ions: gaining and losing electrons',
    use: 'Use this to find an ion’s charge from its protons and electrons, or the electrons from its charge.',
    assumptions: [
      'An ion has gained or lost electrons; its protons, and so its element, stay the same.',
      'Nonmetals such as sulfur gain electrons to fill their outer shell: S²⁻ has two extra.',
    ],
    variables: PARTICLES,
    ...rules(massRule, chargeRule),
    example: { p: 16, n: 16, e: 18, A: 32, q: -2 },
    startWith: ['p', 'n', 'e'],
    sliders: true,
    representation: ATOM_PICTURE,
  },
];

// ─── Electrons in atoms ──────────────────────────────────────────────────────

/** u: unpaired electrons of atom Z (with e electrons for an ion). */
const unpairedRule = (ion: boolean): Rule => ({
  relation: {
    id: 'unpaired electrons',
    display: ion
      ? '{u} = unpaired electrons of Z = {p} with {e} electrons'
      : '{u} = unpaired electrons of Z = {p}',
    vars: ion ? ['u', 'p', 'e'] : ['u', 'p'],
    residual: (v) => v.u! - unpaired(configuration(v.p!, ion ? v.e! : v.p!)),
    solve: ion
      ? { u: (v) => unpaired(configuration(v.p!, v.e!)), p: () => undefined, e: () => undefined }
      : { u: (v) => unpaired(configuration(v.p!)), p: () => undefined },
  },
  steps: {
    u: {
      expr: ion
        ? 'unpaired electrons of Z = {p} with {e} electrons'
        : 'unpaired electrons of Z = {p}',
      how: 'Fill the boxes in order, one arrow in each box of a subshell before pairing, then count the single arrows.',
    },
  },
});

/** v: the electrons in a neutral atom's outer shell. */
const valenceRule: Rule = {
  relation: {
    id: 'valence electrons',
    display: '{v} = valence electrons of Z = {p}',
    vars: ['v', 'p'],
    residual: (v) => v.v! - valenceOf(configuration(v.p!)),
    solve: { v: (v) => valenceOf(configuration(v.p!)), p: () => undefined },
  },
  steps: {
    v: {
      expr: 'valence electrons of Z = {p}',
      how: 'The electrons in the highest-numbered shell are the valence electrons.',
    },
  },
};

/** A drop from level u to level l in hydrogen: the photon's energy and wavelength. */
const LADDER_RULES: Rule[] = [
  {
    relation: {
      id: 'n₂ > n₁',
      constraint: true,
      display: '{u} is above {l}',
      vars: ['u', 'l'],
      residual: (v) => (v.u! > v.l! ? 0 : 1),
      solve: {},
    },
    steps: {},
  },
  {
    relation: {
      id: 'E = 13.6(1/l² − 1/u²)',
      display: '{E} = 13.6 × (1/{l}^2 − 1/{u}^2)',
      vars: ['E', 'l', 'u'],
      residual: (v) => v.E! - photonEnergy(v.u!, v.l!),
      solve: {
        E: (v) => photonEnergy(v.u!, v.l!),
        u: (v) => {
          const k = 1 / v.l! ** 2 - v.E! / 13.6;
          return k > 0 ? 1 / Math.sqrt(k) : undefined;
        },
        l: (v) => 1 / Math.sqrt(v.E! / 13.6 + 1 / v.u! ** 2),
      },
    },
    steps: {
      E: {
        expr: '13.6 × (1/{l}^2 − 1/{u}^2)',
        how: 'The photon carries the energy between the two levels, Eₙ = −13.6/n² eV.',
      },
      u: {
        expr: '1/√(1/{l}^2 − {E}/13.6)',
        how: 'Solve the level formula for the upper level.',
      },
      l: {
        expr: '1/√({E}/13.6 + 1/{u}^2)',
        how: 'Solve the level formula for the lower level.',
      },
    },
  },
  {
    relation: {
      id: 'λ = 1240/E',
      display: '{w} = 1240/{E}',
      vars: ['w', 'E'],
      residual: (v) => v.w! * v.E! - 1240,
      solve: { w: (v) => photonWavelength(v.E!), E: (v) => 1240 / v.w! },
    },
    steps: {
      w: {
        expr: '1240/{E}',
        how: 'hc = 1240 eV·nm, so the wavelength in nm is 1240 divided by the energy in eV.',
      },
      E: { expr: '1240/{w}', how: 'Divide 1240 eV·nm by the wavelength.' },
    },
  },
];

/** Light: c = λf with λ in nm, and E = hf. */
const PHOTON_RULES: Rule[] = [
  {
    relation: {
      id: 'f = c/λ',
      display: '{f} = (3.00 × 10⁸)/({l} × 10⁻⁹)',
      vars: ['f', 'l'],
      residual: (v) => (v.f! * v.l! * 1e-9) / 3e8 - 1,
      solve: {
        f: (v) => (v.l! > 0 ? 3e8 / (v.l! * 1e-9) : undefined),
        l: (v) => (v.f! > 0 ? 3e8 / v.f! / 1e-9 : undefined),
      },
    },
    steps: {
      f: {
        expr: '(3.00 × 10⁸)/({l} × 10⁻⁹)',
        how: 'Light travels at c = 3.00 × 10⁸ m/s: divide c by the wavelength in meters.',
      },
      l: {
        expr: '(3.00 × 10⁸)/{f}/10⁻⁹',
        how: 'Divide c by the frequency for meters, then change meters to nanometers.',
      },
    },
  },
  {
    relation: {
      id: 'E = hf',
      display: '{E} = 6.626 × 10⁻³⁴ × {f}',
      vars: ['E', 'f'],
      residual: (v) => v.E! / (6.626e-34 * v.f!) - 1,
      solve: { E: (v) => 6.626e-34 * v.f!, f: (v) => v.E! / 6.626e-34 },
    },
    steps: {
      E: {
        expr: '6.626 × 10⁻³⁴ × {f}',
        how: 'Each photon carries Planck’s constant times its frequency.',
      },
      f: { expr: '{E}/(6.626 × 10⁻³⁴)', how: 'Divide the energy by Planck’s constant.' },
    },
  },
];

const ELECTRONS: ModuleDef[] = [
  {
    id: 's.10.electrons-in-atoms',
    assumptions: [
      'Fill the lowest energy first: 4s fills before 3d.',
      'One arrow in each box of a subshell before any pairs (Hund’s rule).',
      'A pair points up and down (Pauli).',
      'Chromium and copper move one 4s electron to 3d.',
    ],
    variables: [
      whole('p', 'Z', 'Atomic number (electrons)', 1, 54),
      { ...whole('u', 'u', 'Unpaired electrons', 0, 6), derived: true },
      { ...whole('v', 'v', 'Valence electrons', 1, 8), derived: true },
    ],
    ...rules(unpairedRule(false), valenceRule),
    example: { p: 8, u: 2, v: 6 },
    startWith: ['p'],
    sliders: true,
    pictureLabels: ['v'],
    representation: { kind: 'orbitalDiagram', mode: 'boxes', element: 'p', unpaired: 'u' },
  },
  {
    id: 's.10.electrons-in-atoms~ions',
    title: 'Configurations of ions',
    use: 'Use this for an ion’s configuration, such as Fe³⁺: electrons taken from the highest shell first.',
    assumptions: [
      'A positive ion loses from the highest shell first, so iron loses 4s before 3d.',
      'A negative ion gains electrons in the next empty places.',
    ],
    variables: [
      whole('p', 'Z', 'Atomic number (protons)', 1, 54),
      whole('e', 'e', 'Electrons', 0, 54),
      whole('q', 'q', 'Charge', -3, 3),
      { ...whole('u', 'u', 'Unpaired electrons', 0, 6), derived: true },
    ],
    ...rules(chargeRule, unpairedRule(true)),
    example: { p: 26, e: 23, q: 3, u: 5 },
    startWith: ['p', 'q'],
    sliders: true,
    representation: {
      kind: 'orbitalDiagram',
      mode: 'boxes',
      element: 'p',
      electrons: 'e',
      unpaired: 'u',
    },
  },
  {
    id: 's.10.electrons-in-atoms~emission',
    title: 'A line in hydrogen’s spectrum',
    use: 'Use this for the energy and wavelength of the light a hydrogen atom gives off when its electron drops a level.',
    assumptions: [
      'Hydrogen’s levels have energies Eₙ = −13.6/n² eV.',
      'The electron drops from the upper level to a lower one and gives off one photon.',
      'Drops to n = 2 give the visible lines; drops to n = 1 give ultraviolet.',
    ],
    variables: [
      whole('u', 'n₂', 'Upper level', 2, 8),
      whole('l', 'n₁', 'Lower level', 1, 7),
      quantity('E', 'E', 'Photon energy', 'eV', 0.01, 13.6, 0.0001),
      quantity('w', 'λ', 'Wavelength', 'nm', 50, 20000, 0.1),
    ],
    ...rules(...LADDER_RULES),
    example: { u: 3, l: 2, E: photonEnergy(3, 2), w: photonWavelength(photonEnergy(3, 2)) },
    startWith: ['u', 'l'],
    sliders: true,
    representation: {
      kind: 'orbitalDiagram',
      mode: 'ladder',
      upper: 'u',
      lower: 'l',
      energy: 'E',
      wavelength: 'w',
      levels: 8,
    },
  },
  {
    id: 's.10.electrons-in-atoms~photon',
    title: 'A photon’s frequency and energy',
    use: 'Use this for the frequency and energy of a photon from its wavelength.',
    unitSystems: ['metric'],
    assumptions: [
      'Light travels at c = 3.00 × 10⁸ m/s, and c = λf.',
      'Each photon carries E = hf, with h = 6.626 × 10⁻³⁴ J·s.',
      'Shorter waves have higher frequencies and carry more energy.',
    ],
    variables: [
      quantity('l', 'λ', 'Wavelength', 'nm', 1, 100000, 0.1),
      quantity('f', 'f', 'Frequency', 'Hz', 3e12, 3e17, 1e10, { scientific: true }),
      quantity('E', 'E', 'Energy of one photon', 'J', 6.626e-34 * 3e12, 6.626e-34 * 3e17, 1e-24, {
        scientific: true,
      }),
    ],
    ...rules(...PHOTON_RULES),
    example: { l: 656, f: 3e8 / 656e-9, E: (6.626e-34 * 3e8) / 656e-9 },
    startWith: ['l'],
    representation: {
      kind: 'spectrum',
      wavelength: 'l',
      meters: 1e-9,
      photon: { frequency: 'f', energy: 'E' },
    },
  },
];

// ─── Periodic trends ─────────────────────────────────────────────────────────

const TREND_WORDS: Record<
  TrendProperty,
  { phrase: string; name: string; unit?: string; step: number }
> = {
  radius: { phrase: 'atomic radius', name: 'Atomic radius', unit: 'pm', step: 1 },
  ionization: {
    phrase: 'ionization energy',
    name: 'First ionization energy',
    unit: 'kJ/mol',
    step: 1,
  },
  electronegativity: { phrase: 'electronegativity', name: 'Electronegativity', step: 0.01 },
};

/** out: an element's value of a property, looked up from its atomic number (never worked back). */
const trendRule = (property: TrendProperty, out: string, z: string): Rule => {
  const words = TREND_WORDS[property];
  return {
    relation: {
      id: `${out} = ${words.phrase} of ${z}`,
      display: `{${out}} = ${words.phrase} of Z = {${z}}`,
      vars: [out, z],
      residual: (v) => v[out]! - (trendValue(property, v[z]!) ?? NaN),
      solve: { [out]: (v) => trendValue(property, v[z]!), [z]: () => undefined },
    },
    steps: {
      [out]: {
        expr: `${words.phrase} of Z = {${z}}`,
        how: `Read the element’s ${words.phrase} from the table.`,
      },
    },
  };
};

/** Atomic numbers 1–54 that have a value of the property. */
const withValue = (property: TrendProperty) =>
  Array.from({ length: 54 }, (_, i) => i + 1).filter((z) => trendValue(property, z) !== undefined);

/** Two elements' values of a property and their difference (or its size, `absolute`). */
function trendPage(
  id: string,
  title: string | undefined,
  use: string | undefined,
  assumptions: string[],
  property: TrendProperty,
  z: number,
  z2: number,
  absolute = false,
): ModuleDef {
  const words = TREND_WORDS[property];
  const atomic = (vid: string, name: string): VariableDef => ({
    ...whole(vid, vid === 'p' ? 'Z₁' : 'Z₂', name, 1, 54),
    allowed: withValue(property),
  });
  const value = (vid: string, symbol: string, name: string): VariableDef => ({
    id: vid,
    symbol,
    name,
    ...(words.unit ? { unit: words.unit, units: [words.unit] } : {}),
    min: 0,
    max: 3000,
    step: words.step,
  });
  const r = trendValue(property, z)!;
  const s = trendValue(property, z2)!;
  const difference: Rule = absolute
    ? {
        relation: {
          id: 'ΔEN = |EN₁ − EN₂|',
          display: '{d} = |{r} − {s}|',
          vars: ['d', 'r', 's'],
          residual: (v) => v.d! - Math.abs(v.r! - v.s!),
          solve: { d: (v) => Math.abs(v.r! - v.s!), r: () => undefined, s: () => undefined },
        },
        steps: {
          d: {
            expr: '|{r} − {s}|',
            how: 'The size of the difference says how unevenly the shared pair is held.',
          },
        },
      }
    : {
        relation: {
          id: 'Δx = x₁ − x₂',
          display: '{d} = {r} − {s}',
          vars: ['d', 'r', 's'],
          residual: (v) => v.d! - v.r! + v.s!,
          solve: { d: (v) => v.r! - v.s!, r: (v) => v.d! + v.s!, s: (v) => v.r! - v.d! },
        },
        steps: {
          d: { expr: '{r} − {s}', how: 'Subtract to see which is larger, and by how much.' },
          r: { expr: '{d} + {s}', how: 'Add the difference to the second value.' },
          s: { expr: '{r} − {d}', how: 'Take the difference away from the first value.' },
        },
      };
  return {
    id,
    ...(title ? { title } : {}),
    ...(use ? { use } : {}),
    assumptions,
    variables: [
      atomic('p', 'Atomic number of the first element'),
      value('r', absolute ? 'EN₁' : 'x₁', `${words.name} of the first element`),
      atomic('c', 'Atomic number of the second element'),
      value('s', absolute ? 'EN₂' : 'x₂', `${words.name} of the second element`),
      {
        ...value(
          'd',
          absolute ? 'ΔEN' : 'Δx',
          absolute ? 'Difference in electronegativity' : 'Difference (first − second)',
        ),
        min: absolute ? 0 : -3000,
      },
    ],
    ...rules(trendRule(property, 'r', 'p'), trendRule(property, 's', 'c'), difference),
    example: { p: z, r, c: z2, s, d: absolute ? Math.abs(r - s) : r - s },
    pictureLabels: ['d'],
    startWith: ['p', 'c'],
    sliders: true,
    representation: {
      kind: 'periodicTable',
      element: 'p',
      trend: { property, value: 'r', compare: 'c', compareValue: 's' },
    },
  };
}

const TRENDS: ModuleDef[] = [
  trendPage(
    's.10.periodic-trends',
    undefined,
    undefined,
    [
      'Radii are covalent radii, in picometers (1 pm = 10⁻¹² m).',
      'Across a period, more protons pull the same shell closer, so atoms shrink.',
      'Down a group, each new shell makes atoms larger.',
    ],
    'radius',
    11,
    17,
  ),
  trendPage(
    's.10.periodic-trends~ionization',
    'Ionization energy',
    'Use this to compare how much energy it takes to pull an electron off two atoms.',
    [
      'First ionization energy removes one electron from a gas atom, in kJ/mol.',
      'Down a group the outer electron sits in a higher shell, farther from the nucleus, so it comes off more easily.',
      'Across a period the growing nuclear charge holds the electrons tighter.',
    ],
    'ionization',
    12,
    20,
  ),
  trendPage(
    's.10.periodic-trends~electronegativity',
    'Electronegativity',
    'Use this to see which atom in a bond pulls the shared electrons harder.',
    [
      'Electronegativity is on the Pauling scale, with no unit; fluorine is highest, 3.98.',
      'It rises across a period and falls down a group.',
      'The noble gases helium, neon and argon have no value.',
    ],
    'electronegativity',
    9,
    7,
  ),
];

// ─── Bonding ─────────────────────────────────────────────────────────────────

/** The atoms the main bonding page counts, in the order its inputs list them. */
const BOND_ATOMS: [string, string, string, number][] = [
  ['H', 'h', 'Hydrogen atoms', 4],
  ['C', 'c', 'Carbon atoms', 1],
  ['N', 'n', 'Nitrogen atoms', 2],
  ['O', 'o', 'Oxygen atoms', 2],
];

/** The drawn Lewis structure for h H, c C, n N and o O atoms, if there is one. */
const drawnLewis = (v: Record<string, number | undefined>) => {
  const key = lewisKey({ H: v.h!, C: v.c!, N: v.n!, O: v.o! });
  return key ? lewisCounts(LEWIS[key]!) : undefined;
};

/** V = h + 4c + 5n + 6o: every valence electron the atoms bring. */
const valenceSum: Rule = (() => {
  const terms = BOND_ATOMS.map(([el, id]) => ({ id, k: valenceElectrons(el) }));
  const text = terms.map((t) => (t.k === 1 ? `{${t.id}}` : `${t.k} × {${t.id}}`)).join(' + ');
  const sum = (v: Record<string, number | undefined>) =>
    terms.reduce((s, t) => s + t.k * v[t.id]!, 0);
  const solve: Record<string, (v: Record<string, number | undefined>) => number | undefined> = {
    V: sum,
  };
  const steps: Record<string, StepText> = {
    V: { expr: text, how: 'Add each atom’s valence electrons: H 1, C 4, N 5, O 6.' },
  };
  for (const t of terms) {
    const others = terms.filter((o) => o !== t);
    solve[t.id] = (v) => (v.V! - others.reduce((s, o) => s + o.k * v[o.id]!, 0)) / t.k;
    const rest = others.map((o) => ` − ${o.k === 1 ? '' : `${o.k} × `}{${o.id}}`).join('');
    steps[t.id] = {
      expr: t.k === 1 ? `{V}${rest}` : `({V}${rest})/${t.k}`,
      how: `Take away the other atoms’ electrons${t.k === 1 ? '' : ` and divide by ${t.k}`}.`,
    };
  }
  return {
    relation: {
      id: 'valence electrons',
      display: `{V} = ${text}`,
      vars: ['V', ...terms.map((t) => t.id)],
      residual: (v) => v.V! - sum(v),
      solve,
    },
    steps,
  };
})();

const LEWIS_RULES: Rule[] = [
  valenceSum,
  {
    relation: {
      id: 'shared pairs',
      display: '{b} = shared pairs in the structure of {h} H, {c} C, {n} N and {o} O',
      vars: ['b', 'h', 'c', 'n', 'o'],
      residual: (v) => v.b! - (drawnLewis(v)?.bonding ?? NaN),
      solve: {
        b: (v) => drawnLewis(v)?.bonding,
        h: () => undefined,
        c: () => undefined,
        n: () => undefined,
        o: () => undefined,
      },
    },
    steps: {
      b: {
        expr: 'shared pairs in the structure of {h} H, {c} C, {n} N and {o} O',
        how: 'Join the atoms with single bonds, then turn lone pairs into double or triple bonds until every atom has its octet.',
      },
    },
  },
  {
    relation: {
      id: 'V = 2(b + l)',
      display: '{V} = 2 × ({b} + {l})',
      vars: ['V', 'b', 'l'],
      residual: (v) => v.V! - 2 * (v.b! + v.l!),
      solve: {
        l: (v) => v.V! / 2 - v.b!,
        V: (v) => 2 * (v.b! + v.l!),
        b: (v) => v.V! / 2 - v.l!,
      },
    },
    steps: {
      l: {
        expr: '{V}/2 − {b}',
        how: 'Electrons go in pairs; the pairs that are not shared are lone pairs.',
      },
      V: { expr: '2 × ({b} + {l})', how: 'Every pair, shared or lone, holds 2 electrons.' },
      b: { expr: '{V}/2 − {l}', how: 'The pairs that are not lone pairs are shared.' },
    },
  },
];

/** An ionic compound: a metal ions and b nonmetal ions whose charges balance, t electrons moved. */
function ionicPage(
  id: string,
  title: string,
  use: string,
  assumptions: string[],
  metal: string,
  nonmetal: string,
): ModuleDef {
  const ion = ionic(metal, nonmetal);
  const s = (k: number) => (k > 1 ? 's' : '');
  return {
    id,
    title,
    use,
    assumptions,
    variables: [
      whole('a', 'a', `${metal} ions`, 1, 3),
      whole('b', 'b', `${nonmetal} ions`, 1, 6),
      whole('t', 't', 'Electrons moved', 1, 18),
    ],
    ...rules(
      {
        relation: {
          id: 't = given × a',
          display: `{t} = ${ion.give} × {a}`,
          vars: ['t', 'a'],
          residual: (v) => v.t! - ion.give * v.a!,
          solve: { t: (v) => ion.give * v.a!, a: (v) => v.t! / ion.give },
        },
        steps: {
          t: {
            expr: `${ion.give} × {a}`,
            how: `Each ${metal} atom gives ${ion.give} electron${s(ion.give)}.`,
          },
          a: { expr: `{t}/${ion.give}`, how: `Divide by the electrons each ${metal} atom gives.` },
        },
      },
      {
        relation: {
          id: 't = taken × b',
          display: `{t} = ${ion.take} × {b}`,
          vars: ['t', 'b'],
          residual: (v) => v.t! - ion.take * v.b!,
          solve: { t: (v) => ion.take * v.b!, b: (v) => v.t! / ion.take },
        },
        steps: {
          t: {
            expr: `${ion.take} × {b}`,
            how: `Each ${nonmetal} atom takes ${ion.take} to fill its octet.`,
          },
          b: {
            expr: `{t}/${ion.take}`,
            how: `Divide by the electrons each ${nonmetal} atom takes.`,
          },
        },
      },
    ),
    example: { a: ion.metals, b: ion.nonmetals, t: ion.transferred },
    startWith: ['a'],
    sliders: true,
    representation: {
      kind: 'lewisStructure',
      mode: 'ionic',
      metal,
      nonmetal,
      metals: 'a',
      nonmetals: 'b',
      transferred: 't',
    },
  };
}

const BONDING: ModuleDef[] = [
  {
    id: 's.10.bonding',
    assumptions: [
      'Each atom but hydrogen ends with 8 electrons around it; hydrogen with 2.',
      'A shared pair counts for both atoms.',
      'Two or three shared pairs make a double or triple bond.',
      'The drawn molecules are H₂O, NH₃, CH₄, CO₂, HCN, CH₂O, H₂, O₂ and N₂.',
    ],
    variables: [
      ...BOND_ATOMS.map(([, vid, name, max]) => whole(vid, `n${vid.toUpperCase()}`, name, 0, max)),
      whole('V', 'V', 'Valence electrons', 0, 40),
      { ...whole('b', 'b', 'Shared pairs', 0, 8), derived: true },
      { ...whole('l', 'l', 'Lone pairs', 0, 8), derived: true },
    ],
    ...rules(...LEWIS_RULES),
    example: { h: 2, c: 0, n: 0, o: 1, V: 8, b: 2, l: 2 },
    clearTo: { h: 0, c: 0, n: 0, o: 0 },
    startWith: ['h', 'c', 'n', 'o'],
    sliders: true,
    representation: {
      kind: 'lewisStructure',
      mode: 'molecule',
      atoms: { H: 'h', C: 'c', N: 'n', O: 'o' },
      valence: 'V',
      bonding: 'b',
      lone: 'l',
    },
  },
  ionicPage(
    's.10.bonding~ionic',
    'The formula of an ionic compound',
    'Use this to find an ionic compound’s formula from the charges of its ions, such as MgCl₂.',
    [
      'The metal gives electrons and the nonmetal takes them, making ions.',
      'The total positive charge equals the total negative charge.',
      'Magnesium gives 2 electrons; each chlorine takes 1, so one Mg²⁺ pairs with two Cl⁻.',
    ],
    'Mg',
    'Cl',
  ),
  {
    id: 's.10.bonding~metallic',
    title: 'Metallic bonding: a sea of electrons',
    use: 'Use this for metallic bonding: how many electrons a piece of aluminum shares among its ions.',
    assumptions: [
      'Each aluminum atom gives up its 3 valence electrons to the whole piece of metal.',
      'The electrons move freely among the ions, so metals conduct electricity.',
      'The ions can slide past each other without breaking the bond, so metals bend instead of shattering.',
    ],
    variables: [whole('n', 'n', 'Metal atoms', 1, 24), whole('e', 'e', 'Free electrons', 0, 72)],
    ...rules({
      relation: {
        id: 'e = 3 × n',
        display: '{e} = 3 × {n}',
        vars: ['e', 'n'],
        residual: (x) => x.e! - 3 * x.n!,
        solve: { e: (x) => 3 * x.n!, n: (x) => x.e! / 3 },
      },
      steps: {
        e: { expr: '3 × {n}', how: 'Each atom gives 3 electrons to the sea.' },
        n: { expr: '{e}/3', how: 'Divide by the electrons each atom gives.' },
      },
    }),
    example: { n: 6, e: 18 },
    startWith: ['n'],
    sliders: true,
    representation: {
      kind: 'lewisStructure',
      mode: 'metallic',
      element: 'Al',
      atoms: 'n',
      electrons: 'e',
    },
  },
  trendPage(
    's.10.bonding~polarity',
    'Bond polarity from electronegativity',
    'Use this to tell whether a bond is nonpolar, polar covalent or ionic from the electronegativity difference.',
    [
      'Under about 0.4 the bond is nonpolar, up to about 1.7 polar covalent, above that mostly ionic; books draw the lines a little differently.',
      'The more electronegative atom takes the partial negative charge, δ−.',
    ],
    'electronegativity',
    1,
    17,
    true,
  ),
];

// ─── Molecular shape ─────────────────────────────────────────────────────────

const SHAPES: ModuleDef[] = [
  {
    id: 's.10.molecular-shape',
    assumptions: [
      'Electron domains spread as far apart as they can.',
      'Lone pairs push harder than bonds, so angles shrink below 109.5°.',
      'A molecule is polar when its bond dipoles don’t cancel.',
      'A double bond counts as one domain, like a single bond.',
    ],
    variables: [
      whole('b', 'b', 'Bonded atoms on the central atom', 2, 4),
      whole('l', 'l', 'Lone pairs on the central atom', 0, 2),
      whole('d', 'd', 'Electron domains', 2, 4),
      { ...quantity('a', 'θ', 'Bond angle', '°', 90, 180, 0.1), derived: true },
    ],
    ...rules(
      {
        relation: {
          id: 'domains',
          display: '{d} = {b} + {l}',
          vars: ['d', 'b', 'l'],
          residual: (v) => v.d! - v.b! - v.l!,
          solve: { d: (v) => v.b! + v.l!, b: (v) => v.d! - v.l!, l: (v) => v.d! - v.b! },
        },
        steps: {
          d: {
            expr: '{b} + {l}',
            how: 'Every bonded atom and every lone pair is one electron domain.',
          },
          b: { expr: '{d} − {l}', how: 'Take the lone pairs away from the domains.' },
          l: { expr: '{d} − {b}', how: 'Take the bonded atoms away from the domains.' },
        },
      },
      {
        relation: {
          id: 'bond angle',
          display: '{a} = bond angle with {b} bonded atoms and {l} lone pairs',
          vars: ['a', 'b', 'l'],
          residual: (v) => v.a! - (shapeOf(v.b!, v.l!)?.angle ?? NaN),
          solve: { a: (v) => shapeOf(v.b!, v.l!)?.angle, b: () => undefined, l: () => undefined },
        },
        steps: {
          a: {
            expr: 'bond angle with {b} bonded atoms and {l} lone pairs',
            how: 'The domains spread as far apart as they can; lone pairs take more room and squeeze the bonds together.',
          },
        },
      },
    ),
    example: { b: 2, l: 2, d: 4, a: shapeOf(2, 2)!.angle },
    startWith: ['b', 'l'],
    sliders: true,
    representation: { kind: 'vsepr', bonded: 'b', lone: 'l', angle: 'a', polar: true },
  },
];

// ─── Reaction types: balancing ───────────────────────────────────────────────

/** out = k × of: a coefficient or an atom count that follows another by a fixed ratio. */
const scaled = (out: string, k: number, of: string, how: [string, string]): Rule => ({
  relation: {
    id: `${out} = ${k} × ${of}`,
    display: k === 1 ? `{${out}} = {${of}}` : `{${out}} = ${k} × {${of}}`,
    vars: [out, of],
    residual: (v) => v[out]! - k * v[of]!,
    solve: { [out]: (v) => k * v[of]!, [of]: (v) => v[out]! / k },
  },
  steps: {
    [out]: { expr: k === 1 ? `{${of}}` : `${k} × {${of}}`, how: how[0] },
    [of]: { expr: k === 1 ? `{${out}}` : `{${out}}/${k}`, how: how[1] },
  },
});

const coefficient = (id: string, name: string, min: number, max: number) =>
  whole(id, id, name, min, max);

const BALANCING: ModuleDef[] = [
  {
    id: 's.10.reaction-types~combustion',
    title: 'Balancing a combustion: propane',
    use: 'Use this for “Balance C₃H₈ + O₂ → CO₂ + H₂O”: carbon first, hydrogen next, oxygen last.',
    unitSystems: ['metric'],
    assumptions: [
      'A hydrocarbon burns in oxygen to make carbon dioxide and water.',
      'Balance carbon first, then hydrogen, and oxygen last, since O₂ appears alone.',
      'Coefficients count molecules; subscripts never change.',
    ],
    variables: [
      { ...coefficient('a', 'Propane molecules', 1, 1), derived: false },
      { ...coefficient('b', 'Oxygen molecules', 0, 8), derived: true },
      { ...coefficient('c', 'Carbon dioxide molecules', 0, 8), derived: true },
      { ...coefficient('d', 'Water molecules', 0, 8), derived: true },
      { ...whole('c1', 'C₁', 'Carbon atoms before', 0, 64), derived: true },
      { ...whole('h1', 'H₁', 'Hydrogen atoms before', 0, 64), derived: true },
      { ...whole('o1', 'O₁', 'Oxygen atoms before', 0, 64), derived: true },
      { ...whole('c2', 'C₂', 'Carbon atoms after', 0, 64), derived: true },
      { ...whole('h2', 'H₂', 'Hydrogen atoms after', 0, 64), derived: true },
      { ...whole('o2', 'O₂', 'Oxygen atoms after', 0, 64), derived: true },
    ],
    ...rules(
      scaled('c', 3, 'a', [
        'Carbon first: each C₃H₈ has 3 carbon atoms, one for each CO₂.',
        'Carbon first: 3 CO₂ for each C₃H₈.',
      ]),
      scaled('d', 4, 'a', [
        'Hydrogen next: each C₃H₈ has 8 hydrogen atoms and each H₂O takes 2.',
        'Hydrogen next: 4 H₂O for each C₃H₈.',
      ]),
      {
        relation: {
          id: '2b = 2c + d',
          display: '2 × {b} = 2 × {c} + {d}',
          vars: ['b', 'c', 'd'],
          residual: (v) => 2 * v.b! - (2 * v.c! + v.d!),
          solve: {
            b: (v) => (2 * v.c! + v.d!) / 2,
            c: (v) => (2 * v.b! - v.d!) / 2,
            d: (v) => 2 * v.b! - 2 * v.c!,
          },
        },
        steps: {
          b: {
            expr: '(2 × {c} + {d})/2',
            how: 'Oxygen last: 2 in each CO₂ and 1 in each H₂O, then halve for O₂.',
          },
          c: { expr: '(2 × {b} − {d})/2', how: 'Oxygen last: what the water leaves, 2 per CO₂.' },
          d: { expr: '2 × {b} − 2 × {c}', how: 'Oxygen last: what the CO₂ leaves.' },
        },
      },
      scaled('c1', 3, 'a', ['3 carbon atoms in each C₃H₈.', 'Divide by 3.']),
      scaled('h1', 8, 'a', ['8 hydrogen atoms in each C₃H₈.', 'Divide by 8.']),
      scaled('o1', 2, 'b', ['2 oxygen atoms in each O₂.', 'Divide by 2.']),
      scaled('c2', 1, 'c', ['1 carbon atom in each CO₂.', 'One CO₂ per carbon atom.']),
      scaled('h2', 2, 'd', ['2 hydrogen atoms in each H₂O.', 'Divide by 2.']),
      {
        relation: {
          id: 'O after = 2c + d',
          display: '{o2} = 2 × {c} + {d}',
          vars: ['o2', 'c', 'd'],
          residual: (v) => v.o2! - (2 * v.c! + v.d!),
          solve: {
            o2: (v) => 2 * v.c! + v.d!,
            c: (v) => (v.o2! - v.d!) / 2,
            d: (v) => v.o2! - 2 * v.c!,
          },
        },
        steps: {
          o2: { expr: '2 × {c} + {d}', how: '2 oxygen atoms in each CO₂ and 1 in each H₂O.' },
          c: { expr: '({o2} − {d})/2', how: 'Take the water’s oxygen away, 2 per CO₂.' },
          d: { expr: '{o2} − 2 × {c}', how: 'Take the CO₂’s oxygen away.' },
        },
      },
    ),
    example: { a: 1, b: 5, c: 3, d: 4, c1: 3, h1: 8, o1: 10, c2: 3, h2: 8, o2: 10 },
    startWith: ['a'],
    equation: '{a:coef} C₃H₈ + {b:coef} O₂ → {c:coef} CO₂ + {d:coef} H₂O',
    representation: {
      kind: 'reaction',
      reactants: [
        { formula: 'C3H8', count: 'a' },
        { formula: 'O2', count: 'b' },
      ],
      products: [
        { formula: 'CO2', count: 'c' },
        { formula: 'H2O', count: 'd' },
      ],
      atoms: { C: ['c1', 'c2'], H: ['h1', 'h2'], O: ['o1', 'o2'] },
    },
  },
  {
    id: 's.10.reaction-types~synthesis',
    title: 'Balancing a synthesis: aluminum oxide',
    use: 'Use this for “Balance Al + O₂ → Al₂O₃.”',
    unitSystems: ['metric'],
    assumptions: [
      'Aluminum burns in oxygen to make aluminum oxide, one product from two reactants.',
      'Oxygen comes in pairs and Al₂O₃ holds 3, so the oxygen atoms must be a multiple of 6.',
      'That takes 4 aluminum atoms at a time.',
    ],
    variables: [
      { ...coefficient('a', 'Aluminum atoms', 4, 8), multipleOf: 4 },
      { ...coefficient('b', 'Oxygen molecules', 0, 6), derived: true },
      { ...coefficient('c', 'Aluminum oxide units', 0, 4), derived: true },
    ],
    ...rules(
      scaled('c', 0.5, 'a', [
        'Aluminum: each Al₂O₃ holds 2 aluminum atoms, so half as many units as atoms.',
        'Aluminum: 2 atoms for each Al₂O₃.',
      ]),
      scaled('b', 1.5, 'c', [
        'Oxygen: each Al₂O₃ holds 3 oxygen atoms and each O₂ brings 2.',
        'Oxygen: 3 O₂ bring the 6 oxygen atoms of 2 Al₂O₃.',
      ]),
    ),
    example: { a: 4, b: 3, c: 2 },
    startWith: ['a'],
    equation: '{a:coef} Al + {b:coef} O₂ → {c:coef} Al₂O₃',
    representation: {
      kind: 'reaction',
      reactants: [
        { formula: 'Al', count: 'a' },
        { formula: 'O2', count: 'b' },
      ],
      products: [{ formula: 'Al2O3', count: 'c' }],
    },
  },
  {
    id: 's.10.reaction-types~replacement',
    title: 'Balancing a single replacement: zinc in acid',
    use: 'Use this for “Balance Zn + HCl → ZnCl₂ + H₂.”',
    unitSystems: ['metric'],
    assumptions: [
      'Zinc takes the place of hydrogen: the hydrogen leaves as a gas.',
      'Each ZnCl₂ needs 2 chlorine atoms, so 2 HCl for each zinc atom.',
    ],
    variables: [
      coefficient('a', 'Zinc atoms', 1, 4),
      { ...coefficient('b', 'Hydrogen chloride molecules', 0, 8), derived: true },
      { ...coefficient('c', 'Zinc chloride units', 0, 4), derived: true },
      { ...coefficient('d', 'Hydrogen molecules', 0, 4), derived: true },
    ],
    ...rules(
      scaled('c', 1, 'a', ['Zinc: one ZnCl₂ for each zinc atom.', 'Zinc: one atom per ZnCl₂.']),
      scaled('b', 2, 'c', [
        'Chlorine: each ZnCl₂ holds 2, and each HCl brings 1.',
        'Chlorine: one ZnCl₂ for every 2 HCl.',
      ]),
      scaled('d', 0.5, 'b', [
        'Hydrogen: the HCl’s hydrogen atoms pair up as H₂.',
        'Hydrogen: 2 HCl for each H₂.',
      ]),
    ),
    example: { a: 1, b: 2, c: 1, d: 1 },
    startWith: ['a'],
    equation: '{a:coef} Zn + {b:coef} HCl → {c:coef} ZnCl₂ + {d:coef} H₂',
    representation: {
      kind: 'reaction',
      reactants: [
        { formula: 'Zn', count: 'a' },
        { formula: 'HCl', count: 'b' },
      ],
      products: [
        { formula: 'ZnCl2', count: 'c' },
        { formula: 'H2', count: 'd' },
      ],
    },
  },
];

// ─── The mole ────────────────────────────────────────────────────────────────

/** out = k × n, one arrow of the mole map (kText is how the steps write k). */
const perMole = (
  out: string,
  n: string,
  k: number,
  kText: string,
  how: string,
  back: string,
): Rule => ({
  relation: {
    id: `${out} = ${kText} × ${n}`,
    display: `{${out}} = ${kText} × {${n}}`,
    vars: [out, n],
    residual: (v) => v[out]! - k * v[n]!,
    solve: { [out]: (v) => k * v[n]!, [n]: (v) => v[out]! / k },
  },
  steps: {
    [out]: { expr: `${kText} × {${n}}`, how },
    [n]: { expr: `{${out}}/(${kText})`, how: back },
  },
});

/** m = n × M for a formula, its molar mass from the table. */
const massRuleFor = (formula: string, m = 'm', n = 'n') => {
  const M = molarMassOf(formula)!;
  return perMole(
    m,
    n,
    M,
    fmt(M),
    `One mole of ${subscript(formula)} has a mass of ${fmt(M)} g.`,
    'Divide the grams by the molar mass: the grams cancel, leaving moles.',
  );
};

const PARTICLE_RULE = perMole(
  'N',
  'n',
  6.022e23,
  '6.022 × 10²³',
  'One mole is 6.022 × 10²³ particles.',
  'Divide the particles by 6.022 × 10²³ per mole.',
);
const VOLUME_RULE = perMole(
  'V',
  'n',
  22.4,
  '22.4',
  'At STP one mole of any gas takes up 22.4 L.',
  'Divide the liters by 22.4 L per mole.',
);

const MOLES = quantity('n', 'n', 'Amount', 'mol', 0.0001, 1000, 0.0001);
const PARTICLE_COUNT = quantity('N', 'N', 'Particles', undefined, 6e19, 1e27, 1e18, {
  scientific: true,
});
const grams = (id = 'm', name = 'Mass', symbol = id) =>
  quantity(id, symbol, name, 'g', 0.001, 100000, 0.001);

/** Atomic masses the molar-mass pages use, in g/mol. */
const MASS = { C: 12.01, H: 1.008, O: 16.0 };

/** An element's percent of a compound's mass: p = k × count ÷ M × 100. */
const percentRule = (p: string, count: string, el: 'C' | 'H' | 'O'): Rule => {
  const k = MASS[el];
  return {
    relation: {
      id: `percent ${el}`,
      display: `{${p}} = ${fmt(k)} × {${count}}/{M} × 100`,
      vars: [p, count, 'M'],
      residual: (v) => v[p]! * v.M! - k * v[count]! * 100,
      solve: {
        [p]: (v) => (v.M! > 0 ? ((k * v[count]!) / v.M!) * 100 : undefined),
        [count]: (v) => (v[p]! * v.M!) / (100 * k),
        M: (v) => (v[p]! > 0 ? (k * v[count]! * 100) / v[p]! : undefined),
      },
    },
    steps: {
      [p]: {
        expr: `${fmt(k)} × {${count}}/{M} × 100`,
        how: `The ${el} atoms’ mass as a share of the whole formula’s mass.`,
      },
      [count]: { expr: `{${p}} × {M}/(100 × ${fmt(k)})`, how: `Divide that mass by ${fmt(k)} g.` },
      M: { expr: `${fmt(k)} × {${count}} × 100/{${p}}`, how: 'Scale the part up to the whole.' },
    },
  };
};

/** Moles of an element in 100 g of the compound: n = p ÷ atomic mass. */
const molesIn100 = (n: string, p: string, el: 'C' | 'H' | 'O'): Rule =>
  perMole(
    p,
    n,
    MASS[el],
    fmt(MASS[el]),
    `Each mole of ${el} atoms is ${fmt(MASS[el])} g.`,
    `In 100 g the percent is grams: divide by ${fmt(MASS[el])} g per mole of ${el}.`,
  );

/** r = n ÷ s: an element's moles over the smallest. */
const ratioRule = (r: string, n: string, el: string): Rule => ({
  relation: {
    id: `ratio ${el}`,
    display: `{${r}} = {${n}}/{s}`,
    vars: [r, n, 's'],
    residual: (v) => v[r]! * v.s! - v[n]!,
    solve: { [r]: (v) => (v.s! > 0 ? v[n]! / v.s! : undefined), [n]: (v) => v[r]! * v.s! },
  },
  steps: {
    [r]: {
      expr: `{${n}}/{s}`,
      how: `Divide by the smallest: ${el} atoms for each atom of the scarcest element.`,
    },
    [n]: { expr: `{${r}} × {s}`, how: 'Multiply the ratio by the smallest.' },
  },
});

const MOLE: ModuleDef[] = [
  {
    id: 's.10.mole',
    unitSystems: ['metric'],
    assumptions: [
      'One mole is 6.022 × 10²³ particles.',
      'Molar mass is the formula’s atomic masses added, in g/mol: water is 18.02 g/mol.',
      'Every conversion goes through moles.',
    ],
    variables: [
      grams(),
      quantity('M', 'M', 'Molar mass', 'g/mol', 1, 500, 0.01),
      MOLES,
      PARTICLE_COUNT,
    ],
    ...rules(
      {
        relation: {
          id: 'm = n × M',
          display: '{m} = {n} × {M}',
          vars: ['m', 'n', 'M'],
          residual: (v) => v.m! - v.n! * v.M!,
          solve: {
            m: (v) => v.n! * v.M!,
            n: (v) => (v.M! > 0 ? v.m! / v.M! : undefined),
            M: (v) => (v.n! > 0 ? v.m! / v.n! : undefined),
          },
        },
        steps: {
          m: { expr: '{n} × {M}', how: 'Each mole has a mass of M grams.' },
          n: { expr: '{m}/{M}', how: 'Divide the grams by the grams in one mole.' },
          M: { expr: '{m}/{n}', how: 'Divide the grams by the moles.' },
        },
      },
      PARTICLE_RULE,
    ),
    example: { m: 9.01, M: 18.02, n: 0.5, N: 0.5 * 6.022e23 },
    startWith: ['m', 'M'],
    representation: { kind: 'moleMap', moles: 'n', mass: 'm', molarMass: 'M', particles: 'N' },
  },
  {
    id: 's.10.mole~molar-mass',
    title: 'Molar mass and percent composition',
    use: 'Use this for a compound’s molar mass and the percent of its mass from each element.',
    unitSystems: ['metric'],
    assumptions: [
      'Atomic masses: C 12.01, H 1.008, O 16.00 g/mol.',
      'Each element’s share of the mass is its atoms’ mass over the molar mass.',
      'The percents add to 100.',
    ],
    variables: [
      whole('c', 'x', 'Carbon atoms in the formula', 1, 20),
      whole('h', 'y', 'Hydrogen atoms in the formula', 0, 40),
      whole('o', 'z', 'Oxygen atoms in the formula', 0, 20),
      quantity('M', 'M', 'Molar mass', 'g/mol', 1, 1000, 0.001),
      quantity('pC', '%C', 'Percent carbon', '%', 0, 100, 0.01),
      quantity('pH', '%H', 'Percent hydrogen', '%', 0, 100, 0.01),
      quantity('pO', '%O', 'Percent oxygen', '%', 0, 100, 0.01),
    ],
    ...rules(
      {
        relation: {
          id: 'M = sum of atomic masses',
          display: '{M} = 12.01 × {c} + 1.008 × {h} + 16.00 × {o}',
          vars: ['M', 'c', 'h', 'o'],
          residual: (v) => v.M! - (12.01 * v.c! + 1.008 * v.h! + 16 * v.o!),
          solve: {
            M: (v) => 12.01 * v.c! + 1.008 * v.h! + 16 * v.o!,
            c: (v) => (v.M! - 1.008 * v.h! - 16 * v.o!) / 12.01,
            h: (v) => (v.M! - 12.01 * v.c! - 16 * v.o!) / 1.008,
            o: (v) => (v.M! - 12.01 * v.c! - 1.008 * v.h!) / 16,
          },
        },
        steps: {
          M: {
            expr: '12.01 × {c} + 1.008 × {h} + 16.00 × {o}',
            how: 'Add the mass of every atom in the formula.',
          },
          c: {
            expr: '({M} − 1.008 × {h} − 16.00 × {o})/12.01',
            how: 'Take away the other atoms’ mass and divide by carbon’s.',
          },
          h: {
            expr: '({M} − 12.01 × {c} − 16.00 × {o})/1.008',
            how: 'Take away the other atoms’ mass and divide by hydrogen’s.',
          },
          o: {
            expr: '({M} − 12.01 × {c} − 1.008 × {h})/16.00',
            how: 'Take away the other atoms’ mass and divide by oxygen’s.',
          },
        },
      },
      percentRule('pC', 'c', 'C'),
      percentRule('pH', 'h', 'H'),
      percentRule('pO', 'o', 'O'),
    ),
    example: {
      c: 6,
      h: 12,
      o: 6,
      M: 12.01 * 6 + 1.008 * 12 + 96,
      pC: ((12.01 * 6) / (12.01 * 6 + 1.008 * 12 + 96)) * 100,
      pH: ((1.008 * 12) / (12.01 * 6 + 1.008 * 12 + 96)) * 100,
      pO: (96 / (12.01 * 6 + 1.008 * 12 + 96)) * 100,
    },
    startWith: ['c', 'h', 'o'],
    representation: { kind: 'pieChart', parts: ['pC', 'pH', 'pO'] },
  },
  {
    id: 's.10.mole~factor',
    title: 'Grams to moles with a unit factor',
    use: 'Use this for “How many moles are in 22 g of CO₂ (44.01 g/mol)?”',
    unitSystems: ['metric'],
    assumptions: [
      'The molar mass M is the mass of 1 mol, in grams.',
      '1 mol/M g is a unit factor: the grams cancel, leaving moles.',
    ],
    variables: [
      quantity('m', 'm', 'Mass (g)', undefined, 0.001, 1e6, 0.001),
      quantity('M', 'M', 'Molar mass (g/mol)', undefined, 1, 1000, 0.01),
      quantity('n', 'n', 'Amount (mol)', undefined, 0.000001, 1e6, 0.000001),
    ],
    relations: [
      {
        id: 'n = m ÷ M',
        display: '{n} = {m} ÷ {M}',
        vars: ['n', 'm', 'M'],
        residual: (v) => v.n! * v.M! - v.m!,
        solve: {
          n: (v) => (v.M! > 0 ? v.m! / v.M! : undefined),
          m: (v) => v.n! * v.M!,
          M: (v) => (v.n! > 0 ? v.m! / v.n! : undefined),
        },
      },
    ],
    steps: {
      'n = m ÷ M': {
        n: { expr: '{m} ÷ {M}', how: 'Multiply by 1 mol over M grams: the grams cancel.' },
        m: { expr: '{n} × {M}', how: 'Each mole has a mass of M grams.' },
        M: { expr: '{m} ÷ {n}', how: 'Divide the grams by the moles.' },
      },
    },
    example: { m: 22, M: 44.01, n: 22 / 44.01 },
    startWith: ['m', 'M'],
    equation: '{m} g × {1 mol}/{{M} g} = {n} mol',
    representation: {
      kind: 'table',
      sweep: 'm',
      output: 'n',
      params: ['M'],
      rows: [11, 22, 44, 88, 176],
    },
  },
  {
    id: 's.10.mole~gas-volume',
    title: 'Liters of gas at STP',
    use: 'Use this for “How many moles, grams and molecules are in 11.2 L of O₂ at STP?”',
    unitSystems: ['metric'],
    assumptions: [
      '22.4 L per mole holds only for a gas at 0 °C and 1 atm (STP).',
      'Oxygen gas, O₂, has a molar mass of 32.00 g/mol.',
    ],
    variables: [
      quantity('V', 'V', 'Volume at STP', 'L', 0.001, 22400, 0.001),
      MOLES,
      grams(),
      PARTICLE_COUNT,
    ],
    ...rules(VOLUME_RULE, massRuleFor('O2'), PARTICLE_RULE),
    example: { V: 11.2, n: 0.5, m: 16, N: 3.011e23 },
    startWith: ['V'],
    representation: {
      kind: 'moleMap',
      formula: 'O2',
      moles: 'n',
      mass: 'm',
      particles: 'N',
      volume: 'V',
    },
  },
  {
    id: 's.10.mole~empirical',
    title: 'Empirical formula from percents',
    use: 'Use this to find the simplest whole-number formula from the percent of each element.',
    unitSystems: ['metric'],
    assumptions: [
      'Take 100 g of the compound, so each percent is that many grams.',
      'Change grams to moles, then divide every amount by the smallest.',
      'Round ratios near a whole number; if one ends in 0.5 or 0.33, multiply them all by 2 or 3 first.',
    ],
    variables: [
      quantity('pC', '%C', 'Percent carbon', '%', 0.01, 100, 0.01),
      quantity('pH', '%H', 'Percent hydrogen', '%', 0.01, 100, 0.01),
      quantity('pO', '%O', 'Percent oxygen', '%', 0.01, 100, 0.01),
      { ...quantity('nC', 'n_C', 'Moles of C in 100 g', 'mol', 0, 10, 0.0001), derived: true },
      { ...quantity('nH', 'n_H', 'Moles of H in 100 g', 'mol', 0, 100, 0.0001), derived: true },
      { ...quantity('nO', 'n_O', 'Moles of O in 100 g', 'mol', 0, 10, 0.0001), derived: true },
      { ...quantity('s', 's', 'Smallest amount', 'mol', 0, 100, 0.0001), derived: true },
      { ...quantity('rC', 'C', 'C per smallest', undefined, 0, 10000, 0.0001), derived: true },
      { ...quantity('rH', 'H', 'H per smallest', undefined, 0, 10000, 0.0001), derived: true },
      { ...quantity('rO', 'O', 'O per smallest', undefined, 0, 10000, 0.0001), derived: true },
    ],
    ...rules(
      {
        relation: {
          id: 'percents add to 100',
          display: '{pC} + {pH} + {pO} = 100',
          vars: ['pC', 'pH', 'pO'],
          residual: (v) => v.pC! + v.pH! + v.pO! - 100,
          solve: {
            pO: (v) => 100 - v.pC! - v.pH!,
            pC: (v) => 100 - v.pH! - v.pO!,
            pH: (v) => 100 - v.pC! - v.pO!,
          },
        },
        steps: {
          pO: { expr: '100 − {pC} − {pH}', how: 'The three elements make up the whole.' },
          pC: { expr: '100 − {pH} − {pO}', how: 'The three elements make up the whole.' },
          pH: { expr: '100 − {pC} − {pO}', how: 'The three elements make up the whole.' },
        },
      },
      molesIn100('nC', 'pC', 'C'),
      molesIn100('nH', 'pH', 'H'),
      molesIn100('nO', 'pO', 'O'),
      {
        relation: {
          id: 'smallest',
          display: '{s} = smallest of {nC}, {nH} and {nO}',
          vars: ['s', 'nC', 'nH', 'nO'],
          residual: (v) => v.s! - Math.min(v.nC!, v.nH!, v.nO!),
          solve: {
            s: (v) => Math.min(v.nC!, v.nH!, v.nO!),
            nC: () => undefined,
            nH: () => undefined,
            nO: () => undefined,
          },
        },
        steps: {
          s: {
            expr: 'smallest of {nC}, {nH} and {nO}',
            how: 'The scarcest element sets the unit: one of its atoms.',
          },
        },
      },
      ratioRule('rC', 'nC', 'C'),
      ratioRule('rH', 'nH', 'H'),
      ratioRule('rO', 'nO', 'O'),
    ),
    example: (() => {
      const [nC, nH, nO] = [40 / 12.01, 6.7 / 1.008, 53.3 / 16];
      const s = Math.min(nC, nH, nO);
      return { pC: 40, pH: 6.7, pO: 53.3, nC, nH, nO, s, rC: nC / s, rH: nH / s, rO: nO / s };
    })(),
    startWith: ['pC', 'pH'],
    representation: { kind: 'pieChart', parts: ['pC', 'pH', 'pO'] },
  },
];

// ─── Stoichiometry ───────────────────────────────────────────────────────────

/**
 * Two reactants X and Y with coefficients p and q on hand as a and b particles: r whole runs,
 * each product made (coefficient × r) and each reactant left over (amount − coefficient × r).
 */
function limitingPage(
  id: string,
  title: string,
  use: string,
  assumptions: string[],
  reactants: [[string, number, number], [string, number, number]],
  products: [string, number][],
): ModuleDef {
  const [[fx, p, a], [fy, q, b]] = reactants;
  const r = Math.floor(Math.min(a / p, b / q));
  const madeIds = products.map((_, i) => `m${i + 1}`);
  const made: Rule[] = products.map(([f, k], i) => ({
    relation: {
      id: `made ${f}`,
      display: `{${madeIds[i]}} = ${k} × {r}`,
      vars: [madeIds[i]!, 'r'],
      residual: (v) => v[madeIds[i]!]! - k * v.r!,
      solve: { [madeIds[i]!]: (v) => k * v.r!, r: (v) => v[madeIds[i]!]! / k },
    },
    steps: {
      [madeIds[i]!]: { expr: `${k} × {r}`, how: `Each run makes ${k} ${subscript(f)}.` },
      r: { expr: `{${madeIds[i]}}/${k}`, how: `Divide by the ${subscript(f)} each run makes.` },
    },
  }));
  const left = (lid: string, amount: string, k: number, f: string): Rule => ({
    relation: {
      id: `left ${f}`,
      display: k === 1 ? `{${lid}} = {${amount}} − {r}` : `{${lid}} = {${amount}} − ${k} × {r}`,
      vars: [lid, amount, 'r'],
      residual: (v) => v[lid]! - (v[amount]! - k * v.r!),
      solve: {
        [lid]: (v) => v[amount]! - k * v.r!,
        [amount]: (v) => v[lid]! + k * v.r!,
        r: (v) => (v[amount]! - v[lid]!) / k,
      },
    },
    steps: {
      [lid]: {
        expr: k === 1 ? `{${amount}} − {r}` : `{${amount}} − ${k} × {r}`,
        how: `Each run uses ${k} ${subscript(f)}; the rest is left over.`,
      },
      [amount]: {
        expr: k === 1 ? `{${lid}} + {r}` : `{${lid}} + ${k} × {r}`,
        how: 'Add back what the runs used.',
      },
      r: {
        expr: k === 1 ? `{${amount}} − {${lid}}` : `({${amount}} − {${lid}})/${k}`,
        how: `Divide what was used by the ${k} each run takes.`,
      },
    },
  });
  const runsRule: Rule = {
    relation: {
      id: 'runs',
      display: `{r} = smaller of {a} ÷ ${p} and {b} ÷ ${q}, rounded down`,
      vars: ['r', 'a', 'b'],
      residual: (v) => v.r! - Math.floor(Math.min(v.a! / p, v.b! / q) + 1e-9),
      solve: {
        r: (v) => Math.floor(Math.min(v.a! / p, v.b! / q) + 1e-9),
        a: () => undefined,
        b: () => undefined,
      },
    },
    steps: {
      r: {
        expr: `smaller of {a} ÷ ${p} and {b} ÷ ${q}, rounded down`,
        how: 'Each reactant allows its amount divided by its coefficient runs; the smaller number is how many can happen.',
      },
    },
  };
  return {
    id,
    title,
    use,
    assumptions,
    variables: [
      whole('a', 'a', `${subscript(fx)} molecules at the start`, 0, 12),
      whole('b', 'b', `${subscript(fy)} molecules at the start`, 0, 12),
      { ...whole('r', 'r', 'Runs of the reaction', 0, 12), derived: true },
      ...products.map(([f], i) => ({
        ...whole(madeIds[i]!, `m${'₁₂'[i]}`, `${subscript(f)} made`, 0, 24),
        derived: true,
      })),
      { ...whole('x', 'x', `${subscript(fx)} left over`, 0, 12), derived: true },
      { ...whole('y', 'y', `${subscript(fy)} left over`, 0, 12), derived: true },
    ],
    ...rules(runsRule, ...made, left('x', 'a', p, fx), left('y', 'b', q, fy)),
    example: {
      a,
      b,
      r,
      ...Object.fromEntries(products.map(([, k], i) => [madeIds[i]!, k * r])),
      x: a - p * r,
      y: b - q * r,
    },
    startWith: ['a', 'b'],
    sliders: true,
    representation: {
      kind: 'reaction',
      reactants: [
        { formula: fx, count: p },
        { formula: fy, count: q },
      ],
      products: products.map(([formula, count]) => ({ formula, count })),
      limiting: { amounts: ['a', 'b'], runs: 'r', made: madeIds, left: ['x', 'y'] },
    },
  };
}

const STOICHIOMETRY: ModuleDef[] = [
  {
    id: 's.10.stoichiometry',
    unitSystems: ['metric'],
    assumptions: [
      'The balanced equation is N₂ + 3H₂ → 2NH₃: 3 mol of H₂ make 2 mol of NH₃.',
      'Coefficients count moles, not grams.',
      'Always go through moles: grams → moles → mole ratio → moles → grams.',
    ],
    variables: [
      grams('m', 'Mass of H₂'),
      quantity('n', 'n₁', 'Moles of H₂', 'mol', 0.0001, 10000, 0.0001),
      quantity('p', 'n₂', 'Moles of NH₃', 'mol', 0.0001, 10000, 0.0001),
      grams('q', 'Mass of NH₃', 'q'),
    ],
    ...rules(
      massRuleFor('H2'),
      {
        relation: {
          id: 'mole ratio',
          display: '{p} = {n} × 2/3',
          vars: ['p', 'n'],
          residual: (v) => v.p! - (v.n! * 2) / 3,
          solve: { p: (v) => (v.n! * 2) / 3, n: (v) => (v.p! * 3) / 2 },
        },
        steps: {
          p: {
            expr: '{n} × 2/3',
            how: 'The equation makes 2 mol of NH₃ for every 3 mol of H₂.',
          },
          n: { expr: '{p} × 3/2', how: 'Turn the mole ratio over: 3 mol of H₂ per 2 mol of NH₃.' },
        },
      },
      massRuleFor('NH3', 'q', 'p'),
    ),
    example: (() => {
      const n = 6.06 / molarMassOf('H2')!;
      const p = (n * 2) / 3;
      return { m: 6.06, n, p, q: p * molarMassOf('NH3')! };
    })(),
    startWith: ['m'],
    representation: {
      kind: 'moleMap',
      formula: 'H2',
      moles: 'n',
      mass: 'm',
      second: { formula: 'NH3', ratio: [3, 2], moles: 'p', mass: 'q' },
    },
  },
  limitingPage(
    's.10.stoichiometry~limiting',
    'The limiting reactant',
    'Use this to find which reactant runs out first, how much product forms and what is left over.',
    [
      'The equation is balanced: N₂ + 3H₂ → 2NH₃.',
      'Divide each amount by its coefficient: the smaller answer is the limiting reactant.',
      'The reactant with fewer molecules is not always the one that runs out.',
    ],
    [
      ['N2', 1, 3],
      ['H2', 3, 6],
    ],
    [['NH3', 2]],
  ),
  {
    id: 's.10.stoichiometry~percent-yield',
    title: 'Percent yield',
    use: 'Use this for the percent yield from the actual and theoretical masses of product.',
    unitSystems: ['metric'],
    assumptions: [
      'The theoretical yield is what the stoichiometry says the reactants can make.',
      'The actual yield is what was weighed; spills and side reactions make it smaller.',
    ],
    variables: [
      grams('t', 'Theoretical yield'),
      grams('y', 'Actual yield'),
      quantity('p', 'p', 'Percent yield', '%', 0, 100, 0.01),
    ],
    relations: [
      {
        ...atLeast('t', 'y'),
        display: '{y} is at most {t}',
      },
      {
        id: 'p = y ÷ t × 100',
        display: '{p} = {y}/{t} × 100',
        vars: ['p', 'y', 't'],
        residual: (v) => v.p! * v.t! - v.y! * 100,
        solve: {
          p: (v) => (v.t! > 0 ? (v.y! / v.t!) * 100 : undefined),
          y: (v) => (v.p! * v.t!) / 100,
          t: (v) => (v.p! > 0 ? (v.y! * 100) / v.p! : undefined),
        },
      },
    ],
    steps: {
      't ≥ y': {},
      'p = y ÷ t × 100': {
        p: { expr: '{y}/{t} × 100', how: 'What you got as a percent of what you could have got.' },
        y: { expr: '{p} × {t}/100', how: 'Take that percent of the theoretical yield.' },
        t: { expr: '{y} × 100/{p}', how: 'The actual yield is p percent of it: scale it up.' },
      },
    },
    example: { t: 34.06, y: 27.2, p: (27.2 / 34.06) * 100 },
    startWith: ['t', 'y'],
    representation: { kind: 'percentBar', percent: 'p', part: 'y', whole: 't' },
  },
];

// ─── Gas laws ────────────────────────────────────────────────────────────────

const div = (a: number, b: number) => (b === 0 ? undefined : a / b);
const SUB: Record<string, string> = { '1': '₁', '2': '₂', '': '' };
const when = (k: string) => (k === '1' ? ' before' : k === '2' ? ' after' : '');

const pressure = (k: string): VariableDef => ({
  id: `P${k}`,
  symbol: `P${SUB[k]}`,
  name: `Pressure${when(k)}`,
  unit: 'atm',
  min: 0.01,
  max: 200,
  step: 0.01,
});
const volume = (k: string, units = ['L', 'mL']): VariableDef => ({
  id: `V${k}`,
  symbol: `V${SUB[k]}`,
  name: `Volume${when(k)}`,
  unit: 'L',
  units,
  min: 0.01,
  max: 1000,
  step: 0.01,
});
const kelvins = (k: string): VariableDef => ({
  id: `T${k}`,
  symbol: `T${SUB[k]}`,
  name: `Temperature${when(k)} in kelvins`,
  unit: 'K',
  min: 1,
  max: 2000,
  step: 1,
});

/** Two-state gas laws: P₁V₁ = P₂V₂ and its relatives, each with its four rearrangements. */
const twoState = (
  id: string,
  top: [string, string],
  bottom: [string, string] | undefined,
  how: Record<string, string>,
): Rule => {
  // left side a1 × b1 (÷ c1) = a2 × b2 (÷ c2): Boyle has no bottom, Charles and Gay-Lussac
  // have one value on top and T on the bottom.
  const [x, y] = top;
  const vars = [`${x}1`, `${y}1`, `${x}2`, `${y}2`];
  const t = bottom;
  if (!t) {
    return {
      relation: {
        id,
        display: `{${x}1} × {${y}1} = {${x}2} × {${y}2}`,
        vars,
        residual: (v) => v[`${x}1`]! * v[`${y}1`]! - v[`${x}2`]! * v[`${y}2`]!,
        solve: {
          [`${x}1`]: (v) => div(v[`${x}2`]! * v[`${y}2`]!, v[`${y}1`]!),
          [`${y}1`]: (v) => div(v[`${x}2`]! * v[`${y}2`]!, v[`${x}1`]!),
          [`${x}2`]: (v) => div(v[`${x}1`]! * v[`${y}1`]!, v[`${y}2`]!),
          [`${y}2`]: (v) => div(v[`${x}1`]! * v[`${y}1`]!, v[`${x}2`]!),
        },
      },
      steps: {
        [`${x}2`]: { expr: `({${x}1} × {${y}1})/{${y}2}`, how: how[`${x}2`]! },
        [`${y}2`]: { expr: `({${x}1} × {${y}1})/{${x}2}`, how: how[`${y}2`]! },
        [`${x}1`]: { expr: `({${x}2} × {${y}2})/{${y}1}`, how: how[`${x}1`]! },
        [`${y}1`]: { expr: `({${x}2} × {${y}2})/{${x}1}`, how: how[`${y}1`]! },
      },
    };
  }
  // x₁/T₁ = x₂/T₂ (y is the temperature here).
  return {
    relation: {
      id,
      display: `{${x}1}/{${y}1} = {${x}2}/{${y}2}`,
      vars,
      residual: (v) => v[`${x}1`]! * v[`${y}2`]! - v[`${x}2`]! * v[`${y}1`]!,
      solve: {
        [`${x}2`]: (v) => div(v[`${x}1`]! * v[`${y}2`]!, v[`${y}1`]!),
        [`${y}2`]: (v) => div(v[`${x}2`]! * v[`${y}1`]!, v[`${x}1`]!),
        [`${x}1`]: (v) => div(v[`${x}2`]! * v[`${y}1`]!, v[`${y}2`]!),
        [`${y}1`]: (v) => div(v[`${x}1`]! * v[`${y}2`]!, v[`${x}2`]!),
      },
    },
    steps: {
      [`${x}2`]: { expr: `({${x}1} × {${y}2})/{${y}1}`, how: how[`${x}2`]! },
      [`${y}2`]: { expr: `({${x}2} × {${y}1})/{${x}1}`, how: how[`${y}2`]! },
      [`${x}1`]: { expr: `({${x}2} × {${y}1})/{${y}2}`, how: how[`${x}1`]! },
      [`${y}1`]: { expr: `({${x}1} × {${y}2})/{${x}2}`, how: how[`${y}1`]! },
    },
  };
};

const boyle = twoState('P₁V₁ = P₂V₂', ['P', 'V'], undefined, {
  P2: 'At one temperature, pressure times volume stays the same. Divide P₁V₁ by the new volume.',
  V2: 'Pressure times volume stays the same, so divide P₁V₁ by the new pressure.',
  P1: 'Divide P₂V₂ by the first volume.',
  V1: 'Divide P₂V₂ by the first pressure.',
});
const charles = twoState('V₁/T₁ = V₂/T₂', ['V', 'T'], ['T', 'T'], {
  V2: 'At one pressure, volume grows in step with the kelvin temperature. Scale V₁ by T₂/T₁.',
  T2: 'Scale T₁ by how much the volume grew, V₂/V₁.',
  V1: 'Scale V₂ back by T₁/T₂.',
  T1: 'Scale T₂ back by V₁/V₂.',
});
const gayLussac = twoState('P₁/T₁ = P₂/T₂', ['P', 'T'], ['T', 'T'], {
  P2: 'In a sealed, rigid container the pressure grows in step with the kelvin temperature.',
  T2: 'Scale T₁ by how much the pressure grew, P₂/P₁.',
  P1: 'Scale P₂ back by T₁/T₂.',
  T1: 'Scale T₂ back by P₁/P₂.',
});

/** The combined gas law, P₁V₁/T₁ = P₂V₂/T₂ (amount held). */
const combined: Rule = {
  relation: {
    id: 'P₁V₁/T₁ = P₂V₂/T₂',
    display: '({P1} × {V1})/{T1} = ({P2} × {V2})/{T2}',
    vars: ['P1', 'V1', 'T1', 'P2', 'V2', 'T2'],
    residual: (v) => v.P1! * v.V1! * v.T2! - v.P2! * v.V2! * v.T1!,
    solve: {
      V2: (v) => div(v.P1! * v.V1! * v.T2!, v.T1! * v.P2!),
      P2: (v) => div(v.P1! * v.V1! * v.T2!, v.T1! * v.V2!),
      T2: (v) => div(v.P2! * v.V2! * v.T1!, v.P1! * v.V1!),
      V1: (v) => div(v.P2! * v.V2! * v.T1!, v.T2! * v.P1!),
      P1: (v) => div(v.P2! * v.V2! * v.T1!, v.T2! * v.V1!),
      T1: (v) => div(v.P1! * v.V1! * v.T2!, v.P2! * v.V2!),
    },
  },
  steps: {
    V2: {
      expr: '({P1} × {V1} × {T2})/({T1} × {P2})',
      how: 'Multiply both sides by T₂ and divide by P₂.',
    },
    P2: {
      expr: '({P1} × {V1} × {T2})/({T1} × {V2})',
      how: 'Multiply both sides by T₂ and divide by V₂.',
    },
    T2: {
      expr: '({P2} × {V2} × {T1})/({P1} × {V1})',
      how: 'Cross-multiply, then divide by P₁V₁.',
    },
    V1: {
      expr: '({P2} × {V2} × {T1})/({T2} × {P1})',
      how: 'Multiply both sides by T₁ and divide by P₁.',
    },
    P1: {
      expr: '({P2} × {V2} × {T1})/({T2} × {V1})',
      how: 'Multiply both sides by T₁ and divide by V₁.',
    },
    T1: {
      expr: '({P1} × {V1} × {T2})/({P2} × {V2})',
      how: 'Cross-multiply, then divide by P₂V₂.',
    },
  },
};

/** The ideal gas law, PV = nRT with R = 0.0821 L·atm/(mol·K). */
const ideal: Rule = {
  relation: {
    id: 'PV = nRT',
    display: '{P} × {V} = {n} × 0.0821 × {T}',
    vars: ['P', 'V', 'n', 'T'],
    residual: (v) => v.P! * v.V! - v.n! * 0.0821 * v.T!,
    solve: {
      V: (v) => div(v.n! * 0.0821 * v.T!, v.P!),
      P: (v) => div(v.n! * 0.0821 * v.T!, v.V!),
      n: (v) => div(v.P! * v.V!, 0.0821 * v.T!),
      T: (v) => div(v.P! * v.V!, v.n! * 0.0821),
    },
  },
  steps: {
    V: {
      expr: '({n} × 0.0821 × {T})/{P}',
      how: 'Divide both sides by P. R is 0.0821 L·atm/(mol·K), so V comes out in liters.',
    },
    P: {
      expr: '({n} × 0.0821 × {T})/{V}',
      how: 'Divide both sides by V. With R = 0.0821, the pressure comes out in atmospheres.',
    },
    n: { expr: '({P} × {V})/(0.0821 × {T})', how: 'Divide both sides by RT.' },
    T: { expr: '({P} × {V})/({n} × 0.0821)', how: 'Divide both sides by nR.' },
  },
};

const GAS_ASSUMPTIONS = [
  'The gas is ideal: its particles take up no room and do not attract each other.',
  'Temperatures are in kelvins: add 273 to °C. Pressures are in atm.',
];

const GAS: ModuleDef[] = [
  {
    id: 's.10.gas-laws',
    unitSystems: ['metric'],
    assumptions: [
      'Temperature must be in kelvins: add 273 to °C. R = 0.0821 L·atm/(mol·K), so P is in atm and V in liters.',
      'Equal volumes of any gases at the same T and P hold the same number of particles.',
      'Real gases stray from this at high pressure and low temperature.',
    ],
    variables: [
      pressure(''),
      volume('', ['L']),
      { ...quantity('n', 'n', 'Amount of gas', 'mol', 0.001, 100, 0.001) },
      kelvins(''),
    ],
    ...rules(ideal),
    example: { P: 2, V: 24.63, n: 2, T: 300 },
    startWith: ['n', 'T', 'V'],
    representation: {
      kind: 'gasPiston',
      law: 'ideal',
      pressure: 'P',
      volume: 'V',
      temperature: 'T',
      moles: 'n',
      keep: ['n', 'T'],
    },
  },
  {
    id: 's.10.gas-laws~boyle',
    title: 'Boyle’s law: squeezing a gas',
    use: 'Use this for a gas squeezed or let out at one temperature: “6 L at 1 atm is pressed into 3 L. What is the pressure?”',
    unitSystems: ['metric'],
    assumptions: [...GAS_ASSUMPTIONS, 'The temperature and the amount of gas stay the same.'],
    variables: [pressure('1'), volume('1'), pressure('2'), volume('2')],
    ...rules(boyle),
    example: { P1: 1, V1: 6, P2: 2, V2: 3 },
    startWith: ['P1', 'V1', 'V2'],
    representation: {
      kind: 'gasPiston',
      law: 'boyle',
      before: { pressure: 'P1', volume: 'V1' },
      pressure: 'P2',
      volume: 'V2',
      keep: ['P1', 'V1'],
    },
  },
  {
    id: 's.10.gas-laws~charles',
    title: 'Charles’s law: heating a gas',
    use: 'Use this for a gas warmed or cooled at one pressure: “2.00 L at 300 K is heated to 450 K. What is its volume?”',
    unitSystems: ['metric'],
    assumptions: [...GAS_ASSUMPTIONS, 'The pressure and the amount of gas stay the same.'],
    variables: [volume('1'), kelvins('1'), volume('2'), kelvins('2')],
    ...rules(charles),
    example: { V1: 2, T1: 300, V2: 3, T2: 450 },
    startWith: ['V1', 'T1', 'T2'],
    representation: {
      kind: 'gasPiston',
      law: 'charles',
      before: { volume: 'V1', temperature: 'T1' },
      volume: 'V2',
      temperature: 'T2',
      keep: ['V1', 'T1'],
    },
  },
  {
    id: 's.10.gas-laws~gay-lussac',
    title: 'Gay-Lussac’s law: a sealed, rigid container',
    use: 'Use this for a gas heated in a rigid container: “A tire at 2.00 atm and 280 K warms to 308 K. What is the pressure?”',
    unitSystems: ['metric'],
    assumptions: [...GAS_ASSUMPTIONS, 'The volume and the amount of gas stay the same.'],
    variables: [pressure('1'), kelvins('1'), pressure('2'), kelvins('2')],
    ...rules(gayLussac),
    example: { P1: 2, T1: 280, P2: 2.2, T2: 308 },
    startWith: ['P1', 'T1', 'T2'],
    representation: {
      kind: 'gasPiston',
      law: 'gayLussac',
      before: { pressure: 'P1', temperature: 'T1' },
      pressure: 'P2',
      temperature: 'T2',
    },
  },
  {
    id: 's.10.gas-laws~combined',
    title: 'The combined gas law',
    use: 'Use this when pressure, volume and temperature all change: “5.00 L at 1.00 atm and 300 K goes to 2.00 atm and 360 K. What is the volume?”',
    unitSystems: ['metric'],
    assumptions: [...GAS_ASSUMPTIONS, 'The amount of gas stays the same.'],
    variables: [pressure('1'), volume('1'), kelvins('1'), pressure('2'), volume('2'), kelvins('2')],
    ...rules(combined),
    example: { P1: 1, V1: 5, T1: 300, P2: 2, V2: 3, T2: 360 },
    startWith: ['P1', 'V1', 'T1', 'P2', 'T2'],
    representation: {
      kind: 'gasPiston',
      law: 'combined',
      before: { pressure: 'P1', volume: 'V1', temperature: 'T1' },
      pressure: 'P2',
      volume: 'V2',
      temperature: 'T2',
      keep: ['P1', 'V1', 'T1', 'T2'],
    },
  },
];

// ─── Molarity ────────────────────────────────────────────────────────────────

const molarityVar = (id: string, symbol: string, name: string): VariableDef => ({
  id,
  symbol,
  name,
  unit: 'mol/L',
  min: 0.0001,
  max: 20,
  step: 0.0001,
});
const solutionVolume = (id: string, symbol: string, name: string, unit = 'L'): VariableDef => ({
  id,
  symbol,
  name,
  unit,
  units: unit === 'L' ? ['L', 'mL'] : ['mL', 'L'],
  min: unit === 'L' ? 0.001 : 1,
  max: unit === 'L' ? 10 : 10000,
  step: unit === 'L' ? 0.001 : 0.1,
});
const soluteMoles = quantity('n', 'n', 'Moles of solute', 'mol', 0.0001, 10, 0.0001);

/** Molarity, M = n ÷ V. */
const molarityRule: Rule = {
  relation: {
    id: 'M = n/V',
    display: '{M} = {n}/{V}',
    vars: ['M', 'n', 'V'],
    residual: (v) => v.M! * v.V! - v.n!,
    solve: { M: (v) => div(v.n!, v.V!), n: (v) => v.M! * v.V!, V: (v) => div(v.n!, v.M!) },
  },
  steps: {
    M: { expr: '{n}/{V}', how: 'Molarity is moles of solute per liter of solution.' },
    n: { expr: '{M} × {V}', how: 'Multiply the moles in each liter by the liters.' },
    V: { expr: '{n}/{M}', how: 'Divide the moles by the moles in each liter.' },
  },
};

/** Molarity with the volume in milliliters, M = n ÷ (V ÷ 1000). */
const molarityMl: Rule = {
  relation: {
    id: 'M = n/(V ÷ 1000)',
    display: '{M} = {n}/({V} ÷ 1000)',
    vars: ['M', 'n', 'V'],
    residual: (v) => (v.M! * v.V!) / 1000 - v.n!,
    solve: {
      M: (v) => div(1000 * v.n!, v.V!),
      n: (v) => (v.M! * v.V!) / 1000,
      V: (v) => div(1000 * v.n!, v.M!),
    },
  },
  steps: {
    M: {
      expr: '{n}/({V} ÷ 1000)',
      how: 'Change the milliliters to liters, then divide the moles by the liters.',
    },
    n: { expr: '{M} × {V}/1000', how: 'Multiply the molarity by the liters.' },
    V: { expr: '1000 × {n}/{M}', how: 'Divide the moles by the molarity, then change to mL.' },
  },
};

/** Moles from grams, n = m ÷ molar mass. */
const fromGrams: Rule = {
  relation: {
    id: 'n = m/Mₘ',
    display: '{n} = {m}/{mm}',
    vars: ['n', 'm', 'mm'],
    residual: (v) => v.n! * v.mm! - v.m!,
    solve: { n: (v) => div(v.m!, v.mm!), m: (v) => v.n! * v.mm!, mm: (v) => div(v.m!, v.n!) },
  },
  steps: {
    n: { expr: '{m}/{mm}', how: 'Divide the grams by the grams in one mole.' },
    m: { expr: '{n} × {mm}', how: 'Multiply the moles by the grams in one mole.' },
    mm: { expr: '{m}/{n}', how: 'Divide the grams by the moles.' },
  },
};

/** Dilution, M₁V₁ = M₂V₂, and the water added, w = V₂ − V₁. */
const DILUTION: Rule[] = [
  {
    relation: {
      id: 'M₁V₁ = M₂V₂',
      display: '{M1} × {V1} = {M2} × {V2}',
      vars: ['M1', 'V1', 'M2', 'V2'],
      residual: (v) => v.M1! * v.V1! - v.M2! * v.V2!,
      solve: {
        M2: (v) => div(v.M1! * v.V1!, v.V2!),
        V2: (v) => div(v.M1! * v.V1!, v.M2!),
        M1: (v) => div(v.M2! * v.V2!, v.V1!),
        V1: (v) => div(v.M2! * v.V2!, v.M1!),
      },
    },
    steps: {
      M2: {
        expr: '({M1} × {V1})/{V2}',
        how: 'Adding water keeps the moles of solute, M₁V₁. Spread them over the new volume.',
      },
      V2: {
        expr: '({M1} × {V1})/{M2}',
        how: 'The moles of solute, M₁V₁, stay the same. Divide them by the new molarity.',
      },
      M1: { expr: '({M2} × {V2})/{V1}', how: 'Divide the moles, M₂V₂, by the stock’s volume.' },
      V1: {
        expr: '({M2} × {V2})/{M1}',
        how: 'Divide the moles needed, M₂V₂, by the stock’s molarity.',
      },
    },
  },
  {
    relation: {
      id: 'w = V₂ − V₁',
      display: '{w} = {V2} − {V1}',
      vars: ['w', 'V2', 'V1'],
      residual: (v) => v.w! - (v.V2! - v.V1!),
      solve: { w: (v) => v.V2! - v.V1!, V2: (v) => v.w! + v.V1!, V1: (v) => v.V2! - v.w! },
    },
    steps: {
      w: { expr: '{V2} − {V1}', how: 'The water makes up the difference between the volumes.' },
      V2: { expr: '{w} + {V1}', how: 'Add the water to the stock’s volume.' },
      V1: { expr: '{V2} − {w}', how: 'Take the water away from the final volume.' },
    },
  },
];

const saltGrams = (id: string, symbol: string, name: string, min = 0): VariableDef => ({
  id,
  symbol,
  name,
  unit: 'g',
  units: ['g'],
  min,
  max: 400,
  step: 0.1,
});

const SOLUTION_ASSUMPTIONS = [
  'Molarity is moles of solute per liter of solution, not of water: 1 M = 1 mol/L.',
  'Change mL to L first: 1 L = 1000 mL.',
];

const MOLARITY: ModuleDef[] = [
  {
    id: 's.10.molarity',
    unitSystems: ['metric'],
    assumptions: SOLUTION_ASSUMPTIONS,
    variables: [
      soluteMoles,
      solutionVolume('V', 'V', 'Volume of solution'),
      molarityVar('M', 'M', 'Molarity'),
    ],
    ...rules(molarityRule),
    example: { n: 0.5, V: 2, M: 0.25 },
    startWith: ['n', 'V'],
    representation: {
      kind: 'beaker',
      solution: { mode: 'molarity', moles: 'n', volume: 'V', molarity: 'M', solute: 'NaCl' },
    },
  },
  {
    id: 's.10.molarity~from-grams',
    title: 'Molarity from grams of solute',
    use: 'Use this for “5.844 g of NaCl (58.44 g/mol) makes 250 mL of solution. What is the molarity?”',
    unitSystems: ['metric'],
    assumptions: [
      ...SOLUTION_ASSUMPTIONS,
      'Molar mass is the grams in one mole: NaCl is 58.44 g/mol.',
    ],
    variables: [
      { ...saltGrams('m', 'm', 'Mass of solute', 0.001), max: 5000, step: 0.001 },
      quantity('mm', 'Mₘ', 'Molar mass of the solute', 'g/mol', 1, 1000, 0.01),
      soluteMoles,
      { ...solutionVolume('V', 'V', 'Volume of solution', 'mL'), units: ['mL'] },
      molarityVar('M', 'M', 'Molarity'),
    ],
    ...rules(fromGrams, molarityMl),
    example: { m: 5.844, mm: 58.44, n: 0.1, V: 250, M: 0.4 },
    startWith: ['m', 'mm', 'V'],
    pictureLabels: ['m', 'mm'],
    representation: {
      kind: 'beaker',
      solution: { mode: 'molarity', moles: 'n', volume: 'V', molarity: 'M', solute: 'NaCl' },
    },
  },
  {
    id: 's.10.molarity~dilution',
    title: 'Diluting a stock solution',
    use: 'Use this for “How much 2.00 M stock makes 200 mL of 0.500 M, and how much water is added?”',
    unitSystems: ['metric'],
    assumptions: [
      'Water adds volume but no solute: the moles, M × V, stay the same.',
      'Both volumes are in the same unit, so the units cancel.',
    ],
    variables: [
      molarityVar('M1', 'M₁', 'Stock molarity'),
      solutionVolume('V1', 'V₁', 'Stock volume', 'mL'),
      molarityVar('M2', 'M₂', 'Diluted molarity'),
      solutionVolume('V2', 'V₂', 'Diluted volume', 'mL'),
      { ...solutionVolume('w', 'w', 'Water added', 'mL'), min: 0, derived: true },
    ],
    ...rules(...DILUTION),
    example: { M1: 2, V1: 50, M2: 0.5, V2: 200, w: 150 },
    startWith: ['M1', 'V1', 'M2'],
    representation: {
      kind: 'beaker',
      solution: {
        mode: 'dilution',
        stock: { molarity: 'M1', volume: 'V1' },
        diluted: { molarity: 'M2', volume: 'V2' },
        water: 'w',
        solute: 'CuSO₄',
      },
    },
  },
  {
    id: 's.10.molarity~solubility',
    title: 'Reading a solubility curve',
    use: 'Use this for “50 g of KNO₃ is stirred into 100 g of water at 40 °C. Is it saturated?”',
    unitSystems: ['metric'],
    assumptions: [
      'The curve gives the most salt that dissolves in 100 g of water at each temperature.',
      'Below the curve the solution is unsaturated; on it, saturated; past it, the extra settles out.',
    ],
    variables: [
      { id: 'T', symbol: 'T', name: 'Water temperature', unit: '°C', min: 0, max: 100, step: 1 },
      saltGrams('m', 'm', 'Salt stirred into 100 g of water'),
      { ...saltGrams('s', 'S', 'Most that dissolves in 100 g of water'), derived: true },
      saltGrams('r', 'r', 'More that can dissolve (below 0: settles out)', -400),
    ],
    ...rules(
      {
        relation: {
          id: 'S = solubility of KNO₃ at T',
          display: '{s} = solubility of KNO₃ at {T} °C',
          vars: ['s', 'T'],
          residual: (v) => v.s! - solubilityAt('KNO3', v.T!),
          solve: { s: (v) => solubilityAt('KNO3', v.T!), T: () => undefined },
        },
        steps: {
          s: {
            expr: 'solubility of KNO₃ at {T} °C',
            how: 'Go up from the temperature to the curve, then across to the grams.',
          },
        },
      },
      {
        relation: {
          id: 'r = S − m',
          display: '{r} = {s} − {m}',
          vars: ['r', 's', 'm'],
          residual: (v) => v.r! - (v.s! - v.m!),
          solve: { r: (v) => v.s! - v.m!, m: (v) => v.s! - v.r!, s: (v) => v.r! + v.m! },
        },
        steps: {
          r: {
            expr: '{s} − {m}',
            how: 'Take what is stirred in from what can dissolve; below zero, that much settles out.',
          },
          m: { expr: '{s} − {r}', how: 'Take the room left from what can dissolve.' },
          s: { expr: '{r} + {m}', how: 'Add what is dissolved and the room left.' },
        },
      },
    ),
    example: { T: 40, m: 50, s: solubilityAt('KNO3', 40), r: solubilityAt('KNO3', 40) - 50 },
    startWith: ['T', 'm'],
    pictureLabels: ['r'],
    representation: {
      kind: 'beaker',
      solution: {
        mode: 'solubility',
        salt: 'KNO3',
        temperature: 'T',
        amount: 'm',
        solubility: 's',
        others: ['NaCl', 'KCl'],
      },
    },
  },
];

// ─── Thermochemistry ─────────────────────────────────────────────────────────

const kJ = (id: string, symbol: string, name: string, min = -10000): VariableDef => ({
  id,
  symbol,
  name,
  unit: 'kJ',
  min,
  max: 10000,
  step: 1,
});

/** ΔH = products − reactants. */
const enthalpy: Rule = {
  relation: {
    id: 'ΔH = Hₚ − Hᵣ',
    display: '{dH} = {Hp} − {Hr}',
    vars: ['dH', 'Hp', 'Hr'],
    residual: (v) => v.dH! - (v.Hp! - v.Hr!),
    solve: { dH: (v) => v.Hp! - v.Hr!, Hp: (v) => v.dH! + v.Hr!, Hr: (v) => v.Hp! - v.dH! },
  },
  steps: {
    dH: {
      expr: '{Hp} − {Hr}',
      how: 'ΔH is where the reaction ends minus where it starts: negative when energy is given off.',
    },
    Hp: { expr: '{Hr} + {dH}', how: 'Start at the reactants and add ΔH.' },
    Hr: { expr: '{Hp} − {dH}', how: 'Take ΔH back off the products.' },
  },
};

/** The peak, reactants + Eₐ. */
const peakRule: Rule = {
  relation: {
    id: 'peak = Hᵣ + Eₐ',
    display: '{Ep} = {Hr} + {Ea}',
    vars: ['Ep', 'Hr', 'Ea'],
    residual: (v) => v.Ep! - (v.Hr! + v.Ea!),
    solve: { Ep: (v) => v.Hr! + v.Ea!, Ea: (v) => v.Ep! - v.Hr!, Hr: (v) => v.Ep! - v.Ea! },
  },
  steps: {
    Ep: { expr: '{Hr} + {Ea}', how: 'The reactants must climb Eₐ to reach the top of the hump.' },
    Ea: { expr: '{Ep} − {Hr}', how: 'The climb from the reactants to the top of the hump.' },
    Hr: { expr: '{Ep} − {Ea}', how: 'Come down Eₐ from the top of the hump.' },
  },
};

/** A reverse barrier, Eₐ − ΔH (with or without the catalyst). */
const reverseRule = (er: string, ea: string, id: string): Rule => ({
  relation: {
    id,
    display: `{${er}} = {${ea}} − {dH}`,
    vars: [er, ea, 'dH'],
    residual: (v) => v[er]! - (v[ea]! - v.dH!),
    solve: {
      [er]: (v) => v[ea]! - v.dH!,
      [ea]: (v) => v[er]! + v.dH!,
      dH: (v) => v[ea]! - v[er]!,
    },
  },
  steps: {
    [er]: {
      expr: `{${ea}} − {dH}`,
      how: 'Going back, the climb starts at the products: the forward climb minus ΔH.',
    },
    [ea]: { expr: `{${er}} + {dH}`, how: 'Add ΔH to the reverse climb.' },
    dH: { expr: `{${ea}} − {${er}}`, how: 'The difference between the two climbs.' },
  },
});

/** How much a catalyst lowers the barrier. */
const loweredRule: Rule = {
  relation: {
    id: 'lowered = Eₐ − Eₐ with catalyst',
    display: '{d} = {Ea} − {Ec}',
    vars: ['d', 'Ea', 'Ec'],
    residual: (v) => v.d! - (v.Ea! - v.Ec!),
    solve: { d: (v) => v.Ea! - v.Ec!, Ec: (v) => v.Ea! - v.d!, Ea: (v) => v.Ec! + v.d! },
  },
  steps: {
    d: { expr: '{Ea} − {Ec}', how: 'The catalyst’s path is lower by the difference.' },
    Ec: { expr: '{Ea} − {d}', how: 'Take what the catalyst saves off the barrier.' },
    Ea: { expr: '{Ec} + {d}', how: 'Add back what the catalyst saves.' },
  },
};

/** q = mcΔT, and ΔT = T₂ − T₁. */
const CALORIMETER_RULES: Rule[] = [
  {
    relation: {
      id: 'ΔT = T₂ − T₁',
      display: '{dT} = {T2} − {T1}',
      vars: ['dT', 'T2', 'T1'],
      residual: (v) => v.dT! - (v.T2! - v.T1!),
      solve: { dT: (v) => v.T2! - v.T1!, T2: (v) => v.T1! + v.dT!, T1: (v) => v.T2! - v.dT! },
    },
    steps: {
      dT: { expr: '{T2} − {T1}', how: 'The change is the final temperature minus the first.' },
      T2: { expr: '{T1} + {dT}', how: 'Add the change to the first temperature.' },
      T1: { expr: '{T2} − {dT}', how: 'Take the change off the final temperature.' },
    },
  },
  {
    relation: {
      id: 'q = mcΔT',
      display: '{q} = {m} × {c} × {dT}',
      vars: ['q', 'm', 'c', 'dT'],
      residual: (v) => v.q! - v.m! * v.c! * v.dT!,
      solve: {
        q: (v) => v.m! * v.c! * v.dT!,
        m: (v) => div(v.q!, v.c! * v.dT!),
        c: (v) => div(v.q!, v.m! * v.dT!),
        dT: (v) => div(v.q!, v.m! * v.c!),
      },
    },
    steps: {
      q: {
        expr: '{m} × {c} × {dT}',
        how: 'Heat is mass times specific heat times the change in temperature.',
      },
      m: { expr: '{q}/({c} × {dT})', how: 'Divide the heat by cΔT.' },
      c: { expr: '{q}/({m} × {dT})', how: 'Divide the heat by mΔT.' },
      dT: { expr: '{q}/({m} × {c})', how: 'Divide the heat by mc.' },
    },
  },
];

const celsius = (id: string, symbol: string, name: string): VariableDef => ({
  id,
  symbol,
  name,
  unit: '°C',
  min: -50,
  max: 150,
  step: 0.1,
});
const CALORIMETER_VARS: VariableDef[] = [
  quantity('m', 'm', 'Mass of water', 'g', 1, 5000, 0.1),
  quantity('c', 'c', 'Specific heat of water', 'J/(g·°C)', 0.01, 20, 0.01),
  celsius('T1', 'T₁', 'Starting temperature'),
  celsius('T2', 'T₂', 'Final temperature'),
  quantity('dT', 'ΔT', 'Change in temperature', '°C', -100, 100, 0.1),
  quantity('q', 'q', 'Heat the water takes in', 'J', -1000000, 1000000, 0.1),
];
const CALORIMETER_PICTURE = {
  kind: 'energyProfile',
  mode: 'calorimeter',
  mass: 'm',
  heat: 'c',
  start: 'T1',
  end: 'T2',
  change: 'dT',
  q: 'q',
} as const;

/** Heat for one stage of warming ice to steam: q = m × k. */
const stageRule = (q: string, k: number, kText: string, how: string): Rule => ({
  relation: {
    id: `${q} = m × ${kText}`,
    display: `{${q}} = {m} × ${kText}`,
    vars: [q, 'm'],
    residual: (v) => v[q]! - v.m! * k,
    solve: { [q]: (v) => v.m! * k, m: (v) => v[q]! / k },
  },
  steps: {
    [q]: { expr: `{m} × ${kText}`, how },
    m: { expr: `{${q}}/(${kText})`, how: 'Divide the stage’s heat by the heat per gram.' },
  },
});

const THERMO: ModuleDef[] = [
  {
    id: 's.10.thermochemistry',
    unitSystems: ['metric'],
    assumptions: [
      'Energy is stored in chemical bonds; breaking bonds takes energy, forming them releases it.',
      'ΔH below zero is exothermic: the surroundings warm.',
      'Only differences matter; the zero of enthalpy is chosen.',
    ],
    variables: [
      kJ('Hr', 'Hᵣ', 'Energy of the reactants'),
      kJ('Hp', 'Hₚ', 'Energy of the products'),
      kJ('Ea', 'Eₐ', 'Activation energy', 0),
      kJ('dH', 'ΔH', 'Enthalpy change'),
      kJ('Ep', 'Eₚₑₐₖ', 'Energy at the top of the hump'),
      kJ('Er', 'Eₐ′', 'Activation energy of the reverse reaction', 0),
    ],
    ...rules(enthalpy, peakRule, reverseRule('Er', 'Ea', 'Eₐ reverse = Eₐ − ΔH')),
    example: { Hr: 200, Hp: 110, Ea: 80, dH: -90, Ep: 280, Er: 170 },
    startWith: ['Hr', 'Hp', 'Ea'],
    pictureLabels: ['Ep'],
    representation: {
      kind: 'energyProfile',
      reactants: 'Hr',
      products: 'Hp',
      activation: 'Ea',
      deltaH: 'dH',
      reverse: 'Er',
      keep: ['Hr', 'Hp'],
    },
  },
  {
    id: 's.10.thermochemistry~calorimetry',
    title: 'Calorimetry: q = mcΔT',
    use: 'Use this for “A reaction warms 100 g of water from 21 °C to 27.5 °C. How much heat did it give off?”',
    unitSystems: ['metric'],
    assumptions: [
      'The foam cups keep heat from getting in or out, so the water takes in all of it.',
      'Water’s specific heat is 4.18 J/(g·°C).',
      'The heat the water takes in is the heat the reaction gives off.',
    ],
    variables: CALORIMETER_VARS,
    ...rules(...CALORIMETER_RULES),
    example: { m: 100, c: 4.18, T1: 21, T2: 27.5, dT: 6.5, q: 100 * 4.18 * 6.5 },
    startWith: ['m', 'c', 'T1', 'T2'],
    representation: CALORIMETER_PICTURE,
  },
  {
    id: 's.10.thermochemistry~cold-pack',
    title: 'A cold pack: ΔH from a calorimeter',
    use: 'Use this for the ΔH per mole of a salt that cools the water as it dissolves.',
    unitSystems: ['metric'],
    assumptions: [
      'The solution’s heat capacity is taken as the water’s, 4.18 J/(g·°C).',
      'The heat the reaction takes in is the heat the water loses: qᵣₓₙ = −q.',
      'ΔH is per mole of salt, in kJ: divide by 1000.',
    ],
    variables: [
      ...CALORIMETER_VARS,
      quantity('qr', 'qᵣₓₙ', 'Heat of the reaction', 'J', -1000000, 1000000, 0.1),
      quantity('n', 'n', 'Moles of salt', 'mol', 0.001, 100, 0.001),
      quantity('dH', 'ΔH', 'Enthalpy change per mole', 'kJ/mol', -10000, 10000, 0.01),
    ],
    ...rules(
      ...CALORIMETER_RULES,
      {
        relation: {
          id: 'qrxn = −q',
          display: '{qr} = −{q}',
          vars: ['qr', 'q'],
          residual: (v) => v.qr! + v.q!,
          solve: { qr: (v) => -v.q!, q: (v) => -v.qr! },
        },
        steps: {
          qr: { expr: '−{q}', how: 'What the water loses, the reaction takes in.' },
          q: { expr: '−{qr}', how: 'What the reaction takes in, the water loses.' },
        },
      },
      {
        relation: {
          id: 'ΔH = qrxn/n',
          display: '{dH} = {qr}/({n} × 1000)',
          vars: ['dH', 'qr', 'n'],
          residual: (v) => v.dH! * v.n! * 1000 - v.qr!,
          solve: {
            dH: (v) => div(v.qr!, v.n! * 1000),
            qr: (v) => v.dH! * v.n! * 1000,
            n: (v) => div(v.qr!, v.dH! * 1000),
          },
        },
        steps: {
          dH: { expr: '{qr}/({n} × 1000)', how: 'Share the heat among the moles, in kJ.' },
          qr: { expr: '{dH} × {n} × 1000', how: 'Multiply the kJ per mole by the moles, in J.' },
          n: { expr: '{qr}/({dH} × 1000)', how: 'Divide the heat by the heat per mole.' },
        },
      },
    ),
    example: (() => {
      const q = 100 * 4.18 * (15.9 - 22);
      return { m: 100, c: 4.18, T1: 22, T2: 15.9, dT: 15.9 - 22, q, qr: -q, n: 0.1, dH: -q / 100 };
    })(),
    startWith: ['m', 'c', 'T1', 'T2', 'n'],
    representation: CALORIMETER_PICTURE,
  },
  {
    id: 's.10.thermochemistry~heating-curve',
    title: 'Heat to turn ice into steam',
    use: 'Use this for the heat to warm ice from −10 °C, melt it, warm the water and boil it away.',
    unitSystems: ['metric'],
    assumptions: [
      'Ice 2.09, water 4.18 J/(g·°C); melting takes 334 J/g and boiling 2260 J/g.',
      'While ice melts or water boils, the temperature stays flat: the heat breaks attractions instead.',
    ],
    variables: [
      quantity('m', 'm', 'Mass of water', 'g', 0.1, 1000, 0.1),
      quantity('q1', 'q₁', 'Warm the ice from −10 °C to 0 °C', 'J', 0, 1e7, 0.1),
      quantity('q2', 'q₂', 'Melt the ice', 'J', 0, 1e7, 0.1),
      quantity('q3', 'q₃', 'Warm the water from 0 °C to 100 °C', 'J', 0, 1e7, 0.1),
      quantity('q4', 'q₄', 'Boil the water', 'J', 0, 1e8, 0.1),
      quantity('q', 'q', 'Total heat', 'J', 0, 1e8, 0.1),
    ],
    ...rules(
      stageRule('q1', 20.9, '2.09 × 10', 'Ice warms 10 °C at 2.09 J for each gram and degree.'),
      stageRule('q2', 334, '334', 'Melting takes 334 J for each gram, at 0 °C.'),
      stageRule('q3', 418, '4.18 × 100', 'Water warms 100 °C at 4.18 J for each gram and degree.'),
      stageRule('q4', 2260, '2260', 'Boiling takes 2260 J for each gram, at 100 °C.'),
      {
        relation: {
          id: 'q = q₁ + q₂ + q₃ + q₄',
          display: '{q} = {q1} + {q2} + {q3} + {q4}',
          vars: ['q', 'q1', 'q2', 'q3', 'q4'],
          residual: (v) => v.q! - (v.q1! + v.q2! + v.q3! + v.q4!),
          solve: {
            q: (v) => v.q1! + v.q2! + v.q3! + v.q4!,
            q1: (v) => v.q! - v.q2! - v.q3! - v.q4!,
            q2: (v) => v.q! - v.q1! - v.q3! - v.q4!,
            q3: (v) => v.q! - v.q1! - v.q2! - v.q4!,
            q4: (v) => v.q! - v.q1! - v.q2! - v.q3!,
          },
        },
        steps: {
          q: { expr: '{q1} + {q2} + {q3} + {q4}', how: 'Add the heat of the four stages.' },
          q1: { expr: '{q} − {q2} − {q3} − {q4}', how: 'Take the other stages from the total.' },
          q2: { expr: '{q} − {q1} − {q3} − {q4}', how: 'Take the other stages from the total.' },
          q3: { expr: '{q} − {q1} − {q2} − {q4}', how: 'Take the other stages from the total.' },
          q4: { expr: '{q} − {q1} − {q2} − {q3}', how: 'Take the other stages from the total.' },
        },
      },
    ),
    example: { m: 10, q1: 209, q2: 3340, q3: 4180, q4: 22600, q: 30329 },
    startWith: ['m'],
    representation: {
      kind: 'heatingCurve',
      start: -10,
      melt: 0,
      boil: 100,
      spans: ['q1', 'q2', 'q3', 'q4'],
      names: ['ice', 'water', 'steam'],
      units: { time: 'J' },
      formula: 'H2O',
    },
  },
];

// ─── Rates and equilibrium ───────────────────────────────────────────────────

const conc = (id: string, symbol: string, name: string): VariableDef => ({
  id,
  symbol,
  name,
  unit: 'mol/L',
  min: 0.0001,
  max: 100,
  step: 0.0001,
});
const constant = (id: string, symbol: string, name: string): VariableDef => ({
  id,
  symbol,
  name,
  min: 0.000001,
  max: 1000000,
  step: 0.0001,
});

const EQ_ASSUMPTIONS = [
  'The reaction runs in a closed container at one temperature, so K stays the same.',
  'Concentrations are in mol/L; K has no unit here.',
];

const EQUILIBRIUM: ModuleDef[] = [
  {
    id: 's.10.rates-equilibrium',
    unitSystems: ['metric'],
    assumptions: [
      'At equilibrium the forward and reverse rates are equal; amounts stop changing, reactions don’t stop.',
      'K depends only on temperature. Pure solids and liquids are left out of K.',
      'The flask starts with N₂O₄ only; x is the N₂O₄ that reacts.',
    ],
    variables: [
      conc('A0', '[N₂O₄]₀', 'N₂O₄ at the start'),
      conc('x', 'x', 'N₂O₄ that reacted'),
      conc('A', '[N₂O₄]', 'N₂O₄ at equilibrium'),
      conc('B', '[NO₂]', 'NO₂ at equilibrium'),
      constant('K', 'K', 'Equilibrium constant'),
    ],
    ...rules(
      {
        relation: {
          id: 'x = [NO₂]/2',
          display: '{x} = {B}/2',
          vars: ['x', 'B'],
          residual: (v) => v.x! - v.B! / 2,
          solve: { x: (v) => v.B! / 2, B: (v) => 2 * v.x! },
        },
        steps: {
          x: { expr: '{B}/2', how: 'Each N₂O₄ that reacts makes two NO₂, so x is half the NO₂.' },
          B: { expr: '2 × {x}', how: 'Two NO₂ form for each N₂O₄ that reacts.' },
        },
      },
      {
        relation: {
          id: '[N₂O₄] = start − x',
          display: '{A} = {A0} − {x}',
          vars: ['A', 'A0', 'x'],
          residual: (v) => v.A! - (v.A0! - v.x!),
          solve: { A: (v) => v.A0! - v.x!, A0: (v) => v.A! + v.x!, x: (v) => v.A0! - v.A! },
        },
        steps: {
          A: { expr: '{A0} − {x}', how: 'The N₂O₄ left is what there was, less what reacted.' },
          A0: { expr: '{A} + {x}', how: 'Add back what reacted.' },
          x: { expr: '{A0} − {A}', how: 'What reacted is the drop in N₂O₄.' },
        },
      },
      {
        relation: {
          id: 'K = [NO₂]²/[N₂O₄]',
          display: '{K} = {B}^2/{A}',
          vars: ['K', 'B', 'A'],
          residual: (v) => v.K! * v.A! - v.B! ** 2,
          solve: {
            K: (v) => div(v.B! ** 2, v.A!),
            B: (v) => Math.sqrt(Math.max(0, v.K! * v.A!)),
            A: (v) => div(v.B! ** 2, v.K!),
          },
        },
        steps: {
          K: {
            expr: '{B}^2/{A}',
            how: 'Products over reactants at equilibrium, each to the power of its coefficient.',
          },
          B: { expr: '√({K} × {A})', how: 'Multiply K by [N₂O₄], then take the square root.' },
          A: { expr: '{B}^2/{K}', how: 'Divide [NO₂]² by K.' },
        },
      },
    ),
    example: { A0: 1, x: 0.2, A: 0.8, B: 0.4, K: 0.2 },
    startWith: ['A', 'B'],
    pictureLabels: ['x'],
    representation: {
      kind: 'equilibriumChart',
      species: [
        { formula: 'N₂O₄', coef: 1, side: 'reactant', start: 'A0', eq: 'A' },
        { formula: 'NO₂', coef: 2, side: 'product', start: 0, eq: 'B' },
      ],
      K: 'K',
    },
  },
  {
    id: 's.10.rates-equilibrium~le-chatelier',
    title: 'Le Châtelier: Q against K',
    use: 'Use this for “H₂ is added to H₂ + I₂ ⇌ 2HI at equilibrium. Which way does it shift?”',
    unitSystems: ['metric'],
    assumptions: [
      ...EQ_ASSUMPTIONS,
      'Q is K’s formula with the concentrations right after the change: Q below K shifts toward products.',
    ],
    variables: [
      conc('h', '[H₂]', 'H₂ at equilibrium'),
      conc('i', '[I₂]', 'I₂ at equilibrium'),
      conc('p', '[HI]', 'HI at equilibrium'),
      constant('K', 'K', 'Equilibrium constant'),
      conc('a', 'a', 'H₂ added'),
      constant('Q', 'Q', 'Reaction quotient just after'),
    ],
    ...rules(
      {
        relation: {
          id: 'K = [HI]²/([H₂][I₂])',
          display: '{K} = {p}^2/({h} × {i})',
          vars: ['K', 'p', 'h', 'i'],
          residual: (v) => v.K! * v.h! * v.i! - v.p! ** 2,
          solve: {
            K: (v) => div(v.p! ** 2, v.h! * v.i!),
            p: (v) => Math.sqrt(Math.max(0, v.K! * v.h! * v.i!)),
            h: (v) => div(v.p! ** 2, v.K! * v.i!),
            i: (v) => div(v.p! ** 2, v.K! * v.h!),
          },
        },
        steps: {
          K: { expr: '{p}^2/({h} × {i})', how: 'Products over reactants at equilibrium.' },
          p: { expr: '√({K} × {h} × {i})', how: 'Multiply out, then take the square root.' },
          h: { expr: '{p}^2/({K} × {i})', how: 'Divide [HI]² by K[I₂].' },
          i: { expr: '{p}^2/({K} × {h})', how: 'Divide [HI]² by K[H₂].' },
        },
      },
      {
        relation: {
          id: 'Q = [HI]²/(([H₂] + a)[I₂])',
          display: '{Q} = {p}^2/(({h} + {a}) × {i})',
          vars: ['Q', 'p', 'h', 'a', 'i'],
          residual: (v) => v.Q! * (v.h! + v.a!) * v.i! - v.p! ** 2,
          solve: {
            Q: (v) => div(v.p! ** 2, (v.h! + v.a!) * v.i!),
            a: (v) => (v.Q! * v.i! === 0 ? undefined : v.p! ** 2 / (v.Q! * v.i!) - v.h!),
          },
        },
        steps: {
          Q: {
            expr: '{p}^2/(({h} + {a}) × {i})',
            how: 'Just after the H₂ goes in, only [H₂] has changed. Compare Q with K.',
          },
          a: { expr: '{p}^2/({Q} × {i}) − {h}', how: 'Find [H₂] from Q, then take the old [H₂].' },
        },
      },
    ),
    example: { h: 0.1, i: 0.1, p: 0.7, K: 49, a: 0.1, Q: 24.5 },
    startWith: ['h', 'i', 'p', 'a'],
    representation: {
      kind: 'equilibriumChart',
      species: [
        { formula: 'H₂', coef: 1, side: 'reactant', start: 'h' },
        { formula: 'I₂', coef: 1, side: 'reactant', start: 'i' },
        { formula: 'HI', coef: 2, side: 'product', start: 'p' },
      ],
      K: 'K',
      stress: { add: { species: 0, amount: 'a' }, Q: 'Q', label: 'Add H₂' },
    },
  },
  {
    id: 's.10.rates-equilibrium~catalyst',
    title: 'What a catalyst changes',
    use: 'Use this for how much a catalyst lowers the activation energy, forward and back.',
    unitSystems: ['metric'],
    assumptions: [
      'Energies are per mole of reaction as written, in kilojoules.',
      'A catalyst gives the reaction a lower path; it is not used up.',
      'It lowers both directions’ barriers alike and leaves ΔH, and K, unchanged.',
    ],
    variables: [
      kJ('Hr', 'Hᵣ', 'Energy of the reactants'),
      kJ('Hp', 'Hₚ', 'Energy of the products'),
      kJ('Ea', 'Eₐ', 'Activation energy', 0),
      kJ('Ec', 'Eₐ,cat', 'Activation energy with the catalyst', 0),
      kJ('dH', 'ΔH', 'Enthalpy change'),
      kJ('d', 'd', 'How much the catalyst lowers it', 0),
      kJ('Er', 'Eₐ′', 'Reverse activation energy', 0),
      kJ('Erc', 'Eₐ,cat′', 'Reverse activation energy with the catalyst', 0),
    ],
    ...rules(
      enthalpy,
      loweredRule,
      reverseRule('Er', 'Ea', 'Eₐ reverse = Eₐ − ΔH'),
      reverseRule('Erc', 'Ec', 'Eₐ,cat reverse = Eₐ,cat − ΔH'),
    ),
    example: { Hr: 100, Hp: 60, Ea: 90, Ec: 50, dH: -40, d: 40, Er: 130, Erc: 90 },
    startWith: ['Hr', 'Hp', 'Ea', 'Ec'],
    pictureLabels: ['d', 'Erc'],
    representation: {
      kind: 'energyProfile',
      reactants: 'Hr',
      products: 'Hp',
      activation: 'Ea',
      deltaH: 'dH',
      catalyst: 'Ec',
      reverse: 'Er',
      keep: ['Hr', 'Hp', 'Ec'],
    },
  },
];

// ─── Acids and bases ─────────────────────────────────────────────────────────

const phVar = (id: string, symbol: string, name: string): VariableDef => ({
  id,
  symbol,
  name,
  min: 0,
  max: 14,
  step: 0.01,
});
const ionVar = (id: string, symbol: string, name: string): VariableDef => ({
  id,
  symbol,
  name,
  unit: 'mol/L',
  min: 1e-14,
  max: 1,
  step: 1e-15,
  scientific: true,
});

/** pH = −log₁₀[H⁺] (and back: [H⁺] = 10^−pH). */
const phRule = (p = 'p', h = 'h', ion = 'H⁺'): Rule => ({
  relation: {
    id: `p = −log₁₀[${ion}] (${p})`,
    display: `{${p}} = −log₁₀({${h}})`,
    vars: [p, h],
    residual: (v) => v[p]! + Math.log10(v[h]!),
    solve: {
      [p]: (v) => (v[h]! > 0 ? -Math.log10(v[h]!) : undefined),
      [h]: (v) => 10 ** -v[p]!,
    },
  },
  steps: {
    [p]: {
      expr: `−log₁₀({${h}})`,
      how: `Each step of 1 on the scale is ten times the [${ion}]: the log counts the powers of ten.`,
    },
    [h]: { expr: `1/(10^{${p}})`, how: 'Undo the log: one over 10 to the power of the value.' },
  },
});

/** pH + pOH = 14. */
const pohRule: Rule = {
  relation: {
    id: 'pH + pOH = 14',
    display: '{p} + {q} = 14',
    vars: ['p', 'q'],
    residual: (v) => v.p! + v.q! - 14,
    solve: { p: (v) => 14 - v.q!, q: (v) => 14 - v.p! },
  },
  steps: {
    p: { expr: '14 − {q}', how: 'In water at 25 °C, pH and pOH add to 14.' },
    q: { expr: '14 − {p}', how: 'In water at 25 °C, pH and pOH add to 14.' },
  },
};

/** [H⁺][OH⁻] = 1 × 10⁻¹⁴. */
const kwRule: Rule = {
  relation: {
    id: '[H⁺][OH⁻] = Kw',
    display: '{o} = (1 × 10⁻¹⁴)/{h}',
    vars: ['o', 'h'],
    residual: (v) => (v.o! * v.h!) / 1e-14 - 1,
    solve: { o: (v) => div(1e-14, v.h!), h: (v) => div(1e-14, v.o!) },
  },
  steps: {
    o: { expr: '(1 × 10⁻¹⁴)/{h}', how: 'In water [H⁺] × [OH⁻] is always 1 × 10⁻¹⁴.' },
    h: { expr: '(1 × 10⁻¹⁴)/{o}', how: 'In water [H⁺] × [OH⁻] is always 1 × 10⁻¹⁴.' },
  },
};

const PH_ASSUMPTIONS = [
  'The water is at 25 °C, where [H⁺][OH⁻] = 1 × 10⁻¹⁴ and pH + pOH = 14.',
  'Each pH unit is ten times the [H⁺]. Below 7 is acidic, above 7 basic.',
];

const titrationVars = (weak: boolean): VariableDef[] => [
  { ...conc('Ca', 'C₁', 'Acid concentration'), max: 10 },
  { ...quantity('Va', 'V₁', 'Acid volume', 'mL', 1, 1000, 0.1) },
  { ...conc('Cb', 'C₂', 'Base concentration'), max: 10 },
  { ...quantity('Vb', 'V₂', 'Base added', 'mL', 0, 2000, 0.1) },
  { ...quantity('Ve', 'Vₑ', 'Base at the equivalence point', 'mL', 0.01, 100000, 0.01) },
  { id: 'r', symbol: 'r', name: 'Share of the way to equivalence', min: 0, max: 100, step: 0.0001 },
  ...(weak
    ? [
        {
          ...constant('Ka', 'Kₐ', 'Acid dissociation constant'),
          min: 1e-12,
          max: 1,
          scientific: true,
        },
        phVar('pKa', 'pKₐ', 'pKₐ'),
        quantity('Vh', 'V½', 'Base at the half-way point', 'mL', 0.005, 50000, 0.01),
      ]
    : []),
];
const titrationRules = (weak: boolean): Rule[] => [
  {
    relation: {
      id: 'Vₑ = C₁V₁/C₂',
      display: '{Ve} = ({Ca} × {Va})/{Cb}',
      vars: ['Ve', 'Ca', 'Va', 'Cb'],
      residual: (v) => v.Ve! * v.Cb! - v.Ca! * v.Va!,
      solve: {
        Ve: (v) => div(v.Ca! * v.Va!, v.Cb!),
        Ca: (v) => div(v.Ve! * v.Cb!, v.Va!),
        Va: (v) => div(v.Ve! * v.Cb!, v.Ca!),
        Cb: (v) => div(v.Ca! * v.Va!, v.Ve!),
      },
    },
    steps: {
      Ve: {
        expr: '({Ca} × {Va})/{Cb}',
        how: 'At equivalence the moles of base equal the moles of acid: C₂Vₑ = C₁V₁.',
      },
      Ca: { expr: '({Ve} × {Cb})/{Va}', how: 'The acid’s moles are the base’s at equivalence.' },
      Va: { expr: '({Ve} × {Cb})/{Ca}', how: 'Divide the base’s moles by the acid’s molarity.' },
      Cb: { expr: '({Ca} × {Va})/{Ve}', how: 'Divide the acid’s moles by the volume of base.' },
    },
  },
  {
    relation: {
      id: 'r = V₂/Vₑ',
      display: '{r} = {Vb}/{Ve}',
      vars: ['r', 'Vb', 'Ve'],
      residual: (v) => v.r! * v.Ve! - v.Vb!,
      solve: { r: (v) => div(v.Vb!, v.Ve!), Vb: (v) => v.r! * v.Ve! },
    },
    steps: {
      r: { expr: '{Vb}/{Ve}', how: 'Compare the base added with the base equivalence takes.' },
      Vb: { expr: '{r} × {Ve}', how: 'Take that share of the equivalence volume.' },
    },
  },
  ...(weak
    ? [
        phRule('pKa', 'Ka', 'Kₐ'),
        <Rule>{
          relation: {
            id: 'V½ = Vₑ/2',
            display: '{Vh} = {Ve}/2',
            vars: ['Vh', 'Ve'],
            residual: (v) => v.Vh! - v.Ve! / 2,
            solve: { Vh: (v) => v.Ve! / 2, Ve: (v) => 2 * v.Vh! },
          },
          steps: {
            Vh: {
              expr: '{Ve}/2',
              how: 'Half the base turns half the acid into its partner base: there pH = pKₐ.',
            },
            Ve: { expr: '2 × {Vh}', how: 'Equivalence takes twice the half-way volume.' },
          },
        },
      ]
    : []),
];

const ACIDS: ModuleDef[] = [
  {
    id: 's.10.acids-bases',
    unitSystems: ['metric'],
    assumptions: PH_ASSUMPTIONS,
    variables: [
      ionVar('h', '[H⁺]', 'Hydrogen ion concentration'),
      phVar('p', 'pH', 'pH'),
      phVar('q', 'pOH', 'pOH'),
      ionVar('o', '[OH⁻]', 'Hydroxide ion concentration'),
    ],
    ...rules(phRule(), pohRule, kwRule),
    example: { h: 2.5e-4, p: -Math.log10(2.5e-4), q: 14 + Math.log10(2.5e-4), o: 1e-14 / 2.5e-4 },
    startWith: ['h'],
    representation: {
      kind: 'phScale',
      pH: 'p',
      hydrogen: 'h',
      hydroxide: 'o',
      pOH: 'q',
      examples: true,
    },
  },
  {
    id: 's.10.acids-bases~from-ph',
    title: '[H⁺] from pH',
    use: 'Use this for “A solution has a pH of 8.50. What is its [H⁺]?”',
    unitSystems: ['metric'],
    assumptions: PH_ASSUMPTIONS,
    variables: [phVar('p', 'pH', 'pH'), ionVar('h', '[H⁺]', 'Hydrogen ion concentration')],
    ...rules(phRule()),
    example: { p: 8.5, h: 10 ** -8.5 },
    startWith: ['p'],
    equation: '[H⁺] = 10^{−{p}} = {h}',
    representation: { kind: 'phScale', pH: 'p', hydrogen: 'h' },
  },
  {
    id: 's.10.acids-bases~base',
    title: 'A strong base: pOH and pH',
    use: 'Use this for “A solution of 0.010 M NaOH: what are its pOH and pH?”',
    unitSystems: ['metric'],
    assumptions: [
      ...PH_ASSUMPTIONS,
      'NaOH is a strong base: every unit gives one OH⁻, so [OH⁻] is the base’s molarity.',
    ],
    variables: [
      ionVar('o', '[OH⁻]', 'Hydroxide ion concentration'),
      phVar('q', 'pOH', 'pOH'),
      phVar('p', 'pH', 'pH'),
    ],
    ...rules(phRule('q', 'o', 'OH⁻'), pohRule),
    example: { o: 0.01, q: 2, p: 12 },
    startWith: ['o'],
    representation: { kind: 'phScale', pH: 'p', pOH: 'q', hydroxide: 'o' },
  },
  {
    id: 's.10.acids-bases~titration',
    title: 'Titrating a strong acid',
    use: 'Use this for “25 mL of 0.1 M HCl is titrated with 0.2 M NaOH. Where is the equivalence point?”',
    unitSystems: ['metric'],
    assumptions: [
      'Each mole of NaOH uses up one mole of HCl.',
      'At the equivalence point a strong acid and strong base leave salt water: pH 7.',
    ],
    variables: titrationVars(false),
    ...rules(...titrationRules(false)),
    example: { Ca: 0.1, Va: 25, Cb: 0.2, Vb: 12.5, Ve: 12.5, r: 1 },
    startWith: ['Ca', 'Va', 'Cb', 'Vb'],
    pictureLabels: ['r'],
    representation: {
      kind: 'phScale',
      mode: 'titration',
      acid: { concentration: 'Ca', volume: 'Va', name: 'HCl' },
      base: { concentration: 'Cb', name: 'NaOH' },
      added: 'Vb',
      equivalence: 'Ve',
      keep: ['Ca', 'Va', 'Cb'],
    },
  },
  {
    id: 's.10.acids-bases~weak-titration',
    title: 'Titrating a weak acid',
    use: 'Use this for “20 mL of 0.1 M acetic acid (Kₐ = 1.8 × 10⁻⁵) is titrated with 0.1 M NaOH.”',
    unitSystems: ['metric'],
    assumptions: [
      'Halfway to equivalence, half the acid is turned to its partner base, so pH = pKₐ.',
      'At equivalence only the partner base is left, so the pH is above 7.',
    ],
    variables: titrationVars(true),
    ...rules(...titrationRules(true)),
    example: {
      Ca: 0.1,
      Va: 20,
      Cb: 0.1,
      Vb: 10,
      Ve: 20,
      r: 0.5,
      Ka: 1.8e-5,
      pKa: -Math.log10(1.8e-5),
      Vh: 10,
    },
    startWith: ['Ca', 'Va', 'Cb', 'Vb', 'Ka'],
    pictureLabels: ['r', 'pKa', 'Vh'],
    standalone: {
      vars: ['Ka', 'pKa'],
      why: 'The acid’s Kₐ shapes the curve and sets the pH at the half-way point, but no volume depends on it.',
    },
    representation: {
      kind: 'phScale',
      mode: 'titration',
      acid: { concentration: 'Ca', volume: 'Va', Ka: 'Ka', name: 'acetic acid' },
      base: { concentration: 'Cb', name: 'NaOH' },
      added: 'Vb',
      equivalence: 'Ve',
      keep: ['Ca', 'Va', 'Cb', 'Ka'],
    },
  },
];

// ─── Organic chemistry ───────────────────────────────────────────────────────

function chainPage(
  id: string,
  title: string | undefined,
  use: string | undefined,
  assumptions: string[],
  bond: 'single' | 'double' | 'triple',
  n: number,
): ModuleDef {
  const k = bond === 'single' ? 2 : bond === 'double' ? 0 : -2;
  const tail = k === 0 ? '' : k > 0 ? ` + ${k}` : ` − ${-k}`;
  return {
    id,
    ...(title ? { title } : {}),
    ...(use ? { use } : {}),
    assumptions,
    variables: [
      whole('n', 'n', 'Carbon atoms', bond === 'single' ? 1 : 2, 8),
      whole('h', 'h', 'Hydrogen atoms', 0, 18),
    ],
    ...rules({
      relation: {
        id: 'hydrogens',
        display: `{h} = 2 × {n}${tail}`,
        vars: ['h', 'n'],
        residual: (v) => v.h! - hydrogensOf(v.n!, bond),
        solve: { h: (v) => hydrogensOf(v.n!, bond), n: (v) => (v.h! - k) / 2 },
      },
      steps: {
        h: {
          expr: `2 × {n}${tail}`,
          how:
            bond === 'single'
              ? 'Each carbon holds 2 hydrogens, and the two ends 1 more each.'
              : `Each carbon holds 2 hydrogens and the ends 2 more; the ${bond} bond takes ${bond === 'double' ? 2 : 4} away.`,
        },
        n: {
          expr: k === 0 ? '{h}/2' : `({h}${k > 0 ? ` − ${k}` : ` + ${-k}`})/2`,
          how: 'Undo the rule for the hydrogens.',
        },
      },
    }),
    example: { n, h: hydrogensOf(n, bond) },
    startWith: ['n'],
    sliders: true,
    representation: {
      kind: 'lewisStructure',
      mode: 'hydrocarbon',
      carbons: 'n',
      bond,
      hydrogens: 'h',
    },
  };
}

const ORGANIC: ModuleDef[] = [
  chainPage(
    's.10.organic',
    undefined,
    undefined,
    [
      'Carbon makes four bonds, hydrogen one.',
      'Alkanes have only single bonds: CₙH₂ₙ₊₂.',
      'The prefix counts carbons: meth-, eth-, prop-, but-, pent-, hex-, hept-, oct-.',
    ],
    'single',
    3,
  ),
  chainPage(
    's.10.organic~alkene',
    'Alkenes: one double bond',
    'Use this for an alkene’s formula and name: a chain with one carbon–carbon double bond, CₙH₂ₙ.',
    [
      'One carbon–carbon bond is double, here between the first two carbons (the 1- in 1-butene).',
      'Alkene names end in -ene.',
    ],
    'double',
    4,
  ),
  chainPage(
    's.10.organic~alkyne',
    'Alkynes: one triple bond',
    'Use this for an alkyne’s formula and name: a chain with one carbon–carbon triple bond, CₙH₂ₙ₋₂.',
    [
      'One carbon–carbon bond is triple, here between the first two carbons.',
      'Alkyne names end in -yne: C₂H₂ is ethyne (acetylene).',
    ],
    'triple',
    2,
  ),
];

// ─── Nuclear chemistry ───────────────────────────────────────────────────────

const nucleon = (id: string, symbol: string, name: string, min: number, max: number) =>
  whole(id, symbol, name, min, max);

/** A decay's daughter nucleus: the mass and atomic numbers left after the particle leaves. */
function decayPage(
  id: string,
  title: string,
  use: string,
  particle: { name: string; mass: number; charge: number; symbol: string },
  kind: 'alpha' | 'beta',
  example: { A: number; Z: number },
): ModuleDef {
  const { mass, charge } = particle;
  const minus = (a: string, n: number) => (n < 0 ? `{${a}} + ${-n}` : `{${a}} − ${n}`);
  const plus = (a: string, n: number) => (n < 0 ? `{${a}} − ${-n}` : `{${a}} + ${n}`);
  return {
    id,
    title,
    use,
    assumptions: [
      'The mass numbers (top) on the two sides add to the same total.',
      'The atomic numbers (bottom) on the two sides add to the same total.',
      `The ${particle.name} carries away ${mass} in mass number and ${charge} in atomic number.`,
      'The new atomic number names the new element.',
    ],
    variables: [
      nucleon('A', 'A', 'Mass number before', 1, 260),
      nucleon('Z', 'Z', 'Atomic number before', 1, 100),
      nucleon('A2', 'A′', 'Mass number after', 1, 260),
      nucleon('Z2', 'Z′', 'Atomic number after', 1, 100),
      { ...nucleon('N', 'N', 'Neutrons before', 0, 200), derived: true },
    ],
    relations: [
      {
        id: 'N = A − Z',
        display: '{N} = {A} − {Z}',
        vars: ['N', 'A', 'Z'],
        residual: (v) => v.N! - (v.A! - v.Z!),
        solve: { N: (v) => v.A! - v.Z!, A: (v) => v.N! + v.Z!, Z: (v) => v.A! - v.N! },
      },
      {
        id: 'A = A₂ + particle',
        display: `{A} = {A2} + ${mass}`,
        vars: ['A', 'A2'],
        residual: (v) => v.A! - (v.A2! + mass),
        solve: { A2: (v) => v.A! - mass, A: (v) => v.A2! + mass },
      },
      {
        id: 'Z = Z₂ + particle',
        display: charge < 0 ? `{Z} = {Z2} − ${-charge}` : `{Z} = {Z2} + ${charge}`,
        vars: ['Z', 'Z2'],
        residual: (v) => v.Z! - (v.Z2! + charge),
        solve: { Z2: (v) => v.Z! - charge, Z: (v) => v.Z2! + charge },
      },
    ],
    steps: {
      'N = A − Z': {
        N: { expr: '{A} − {Z}', how: 'The nucleons that are not protons are neutrons.' },
        A: { expr: '{N} + {Z}', how: 'Protons and neutrons make the mass number.' },
        Z: { expr: '{A} − {N}', how: 'The nucleons that are not neutrons are protons.' },
      },
      'A = A₂ + particle': {
        A2: {
          expr: minus('A', mass),
          how: `The ${particle.name} takes ${mass} of the mass number.`,
        },
        A: { expr: plus('A2', mass), how: `Add back the ${particle.name}’s mass number.` },
      },
      'Z = Z₂ + particle': {
        Z2: {
          expr: minus('Z', charge),
          how:
            charge < 0
              ? `The ${particle.name} has atomic number −1: a neutron became a proton.`
              : `The ${particle.name} takes ${charge} of the atomic number.`,
        },
        Z: { expr: plus('Z2', charge), how: `Add back the ${particle.name}’s atomic number.` },
      },
    },
    example: {
      ...example,
      A2: example.A - mass,
      Z2: example.Z - charge,
      N: example.A - example.Z,
    },
    startWith: ['A', 'Z'],
    pictureLabels: ['N'],
    equation: `^{A}_{Z}X → ^{A2}_{Z2}Y + ${particle.symbol}`,
    representation: {
      kind: 'decayChart',
      mode: 'equation',
      left: [{ mass: 'A', atomic: 'Z' }],
      right: [{ mass: 'A2', atomic: 'Z2' }, { particle: kind }],
    },
  };
}

const NUCLEAR: ModuleDef[] = [
  {
    id: 's.10.nuclear-chemistry',
    unitSystems: ['metric'],
    assumptions: [
      'Each half-life halves what is left, whatever the start.',
      'Which atom decays next is random; the half-life is fixed.',
    ],
    variables: [
      quantity('T', 'T', 'Half-life', 'days', 0.001, 100000, 0.01),
      quantity('N0', 'N₀', 'Amount at the start', 'mg', 0.001, 100000, 0.001),
      quantity('t', 't', 'Time', 'days', 0, 1000000, 0.01),
      { id: 'n', symbol: 'n', name: 'Half-lives passed', min: 0, max: 60, step: 0.0001 },
      quantity('N', 'N', 'Amount left', 'mg', 0, 100000, 0.0001),
    ],
    ...rules(
      {
        relation: {
          id: 'n = t/T',
          display: '{n} = {t}/{T}',
          vars: ['n', 't', 'T'],
          residual: (v) => v.n! * v.T! - v.t!,
          solve: { n: (v) => div(v.t!, v.T!), t: (v) => v.n! * v.T!, T: (v) => div(v.t!, v.n!) },
        },
        steps: {
          n: { expr: '{t}/{T}', how: 'Count how many half-lives fit in the time.' },
          t: { expr: '{n} × {T}', how: 'Each half-life takes T: multiply.' },
          T: { expr: '{t}/{n}', how: 'Share the time among the half-lives.' },
        },
      },
      {
        relation: {
          id: 'N = N₀ × (1/2)^n',
          display: '{N} = {N0} × 0.5^({n})',
          vars: ['N', 'N0', 'n'],
          residual: (v) => v.N! - v.N0! * 0.5 ** v.n!,
          solve: {
            N: (v) => v.N0! * 0.5 ** v.n!,
            n: (v) => (v.N! > 0 && v.N0! > 0 ? Math.log(v.N0! / v.N!) / Math.log(2) : undefined),
            N0: (v) => v.N! / 0.5 ** v.n!,
          },
        },
        steps: {
          N: {
            expr: '{N0} × 0.5^({n})',
            how: 'Each half-life halves what is left: halve it n times.',
          },
          n: {
            expr: 'ln({N0}/{N})/ln(2)',
            how: 'Count the halvings with logs: how many times 2 goes into the drop.',
          },
          N0: { expr: '{N}/(0.5^({n}))', how: 'Double what is left once for each half-life.' },
        },
      },
    ),
    example: { T: 8.02, N0: 80, t: 24.06, n: 3, N: 10 },
    startWith: ['T', 'N0', 't'],
    representation: {
      kind: 'decayChart',
      halfLife: 'T',
      time: 't',
      start: 'N0',
      left: 'N',
      halves: 'n',
      parent: 'I-131',
      daughter: 'Xe-131',
      keep: ['T', 'N0'],
    },
  },
  decayPage(
    's.10.nuclear-chemistry~alpha',
    'Alpha decay',
    'Use this for “Uranium-238 gives off an alpha particle. What nucleus is left?”',
    { name: 'alpha particle', mass: 4, charge: 2, symbol: '^{4}_{2}He' },
    'alpha',
    { A: 238, Z: 92 },
  ),
  decayPage(
    's.10.nuclear-chemistry~beta',
    'Beta decay',
    'Use this for “Carbon-14 gives off a beta particle. What nucleus is left?”',
    { name: 'beta particle', mass: 0, charge: -1, symbol: '^{0}_{−1}e' },
    'beta',
    { A: 14, Z: 6 },
  ),
  {
    id: 's.10.nuclear-chemistry~fission',
    title: 'Fission of uranium-235',
    use: 'Use this for “U-235 takes in a neutron and splits into Ba-141, a second nucleus and 3 neutrons. What is the second nucleus?”',
    unitSystems: ['metric'],
    assumptions: [
      'A slow neutron splits the uranium-235 nucleus into two smaller ones and 2 or 3 neutrons.',
      'Mass numbers and atomic numbers add to the same on both sides: 235 + 1 = 236 and 92.',
    ],
    variables: [
      nucleon('A1', 'A₁', 'Mass number of the first fragment', 72, 160),
      nucleon('Z1', 'Z₁', 'Atomic number of the first fragment', 30, 62),
      { ...nucleon('k', 'k', 'Neutrons given off', 2, 3), allowed: [2, 3] },
      { ...nucleon('A2', 'A₂', 'Mass number of the second fragment', 70, 164), derived: true },
      { ...nucleon('Z2', 'Z₂', 'Atomic number of the second fragment', 30, 62), derived: true },
      { ...nucleon('N1', 'N₁', 'Neutrons in the first fragment', 10, 130), derived: true },
    ],
    ...rules(
      {
        relation: {
          id: 'A₂ = 236 − A₁ − k',
          display: '{A2} = 236 − {A1} − {k}',
          vars: ['A2', 'A1', 'k'],
          residual: (v) => v.A2! - (236 - v.A1! - v.k!),
          solve: {
            A2: (v) => 236 - v.A1! - v.k!,
            A1: (v) => 236 - v.A2! - v.k!,
            k: (v) => 236 - v.A1! - v.A2!,
          },
        },
        steps: {
          A2: {
            expr: '236 − {A1} − {k}',
            how: 'The left side’s mass numbers add to 235 + 1 = 236; take the first fragment’s and the neutrons’.',
          },
          A1: {
            expr: '236 − {A2} − {k}',
            how: 'Take the other fragment and the neutrons from 236.',
          },
          k: { expr: '236 − {A1} − {A2}', how: 'Whatever mass number is left over is neutrons.' },
        },
      },
      {
        relation: {
          id: 'Z₂ = 92 − Z₁',
          display: '{Z2} = 92 − {Z1}',
          vars: ['Z2', 'Z1'],
          residual: (v) => v.Z2! - (92 - v.Z1!),
          solve: { Z2: (v) => 92 - v.Z1!, Z1: (v) => 92 - v.Z2! },
        },
        steps: {
          Z2: {
            expr: '92 − {Z1}',
            how: 'Uranium’s 92 protons are shared by the two fragments; neutrons carry none.',
          },
          Z1: { expr: '92 − {Z2}', how: 'The first fragment has the protons the second lacks.' },
        },
      },
      {
        relation: {
          id: 'N₁ = A₁ − Z₁',
          display: '{N1} = {A1} − {Z1}',
          vars: ['N1', 'A1', 'Z1'],
          residual: (v) => v.N1! - (v.A1! - v.Z1!),
          solve: { N1: (v) => v.A1! - v.Z1!, A1: (v) => v.N1! + v.Z1!, Z1: (v) => v.A1! - v.N1! },
        },
        steps: {
          N1: { expr: '{A1} − {Z1}', how: 'Take the protons from the mass number.' },
          A1: { expr: '{N1} + {Z1}', how: 'Add the neutrons and the protons.' },
          Z1: { expr: '{A1} − {N1}', how: 'Take the neutrons from the mass number.' },
        },
      },
    ),
    example: { A1: 141, Z1: 56, k: 3, A2: 92, Z2: 36, N1: 85 },
    startWith: ['A1', 'Z1', 'k'],
    pictureLabels: ['N1'],
    representation: {
      kind: 'decayChart',
      mode: 'equation',
      left: [{ mass: 235, atomic: 92 }, { particle: 'neutron' }],
      right: [
        { mass: 'A1', atomic: 'Z1' },
        { mass: 'A2', atomic: 'Z2' },
        { particle: 'neutron', count: 'k' },
      ],
    },
  },
];

export const SCIENCE_10_MODULES: ModuleDef[] = [
  ...MEASUREMENT,
  ...ATOMS,
  ...ELECTRONS,
  ...TRENDS,
  ...BONDING,
  ...SHAPES,
  ...BALANCING,
  ...MOLE,
  ...STOICHIOMETRY,
  ...GAS,
  ...MOLARITY,
  ...THERMO,
  ...EQUILIBRIUM,
  ...ACIDS,
  ...ORGANIC,
  ...NUCLEAR,
];
