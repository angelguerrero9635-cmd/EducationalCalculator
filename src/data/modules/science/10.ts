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
import type { Relation, VariableDef } from '@/engine/types';

import { whole } from '../helpers';
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

export const SCIENCE_10_MODULES: ModuleDef[] = [...MEASUREMENT, ...ATOMS, ...ELECTRONS, ...TRENDS];
