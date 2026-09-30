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
  ionic,
  lewisCounts,
  lewisKey,
  valenceElectrons,
} from '@/components/module/reps/lewis';
import { molarMassOf } from '@/components/module/reps/moles';
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
];
