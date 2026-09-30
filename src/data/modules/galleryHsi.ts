/**
 * Grades 9–12 gallery demos (group HI; see pictureRequestsHs.ts and docs/RENDERINGS_HS.md).
 * Each demo stands in for a planned page: real variables, relations, steps and a use line, so
 * `scripts/promote-demo.mjs` can copy it into a grade file. Spread into gallery.ts.
 */
import {
  configuration,
  photonEnergy,
  photonWavelength,
  unpaired,
  valenceOf,
} from '@/components/module/reps/electrons';
import { trendValue } from '@/components/module/reps/chemTrends';
import { hydrogensOf, ionic, valenceElectrons } from '@/components/module/reps/lewis';
import { shapeOf } from '@/components/module/reps/vseprGeo';
import type { Relation, VariableDef, Values } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { TrendProperty } from './typesHsi';
import type { ModuleDef, StepText } from './types';

/** A relation and its step text, built together so a demo lists both from one place. */
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

// ─── H43 unitChain ───────────────────────────────────────────────────────────

/**
 * out = start × k, the chain's factors multiplied into k: `factorText` is how the steps write
 * them ("1000 × 100", or "1609.344/3600").
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

/** A rod on a ruler marked every `division` cm: its start, its end and its length. */
const rulerDemo = (
  id: string,
  title: string,
  use: string,
  assumptions: string[],
  division: number,
  example: { s: number; e: number; L: number },
): ModuleDef => {
  const step = division / 10;
  return {
    id,
    title,
    use,
    assumptions,
    unitSystems: ['metric'],
    variables: [
      quantity('s', 'x₁', 'Start of the rod', 'cm', 0, 10, step),
      quantity('e', 'x₂', 'End of the rod', 'cm', 0, 10, step),
      quantity('L', 'L', 'Length of the rod', 'cm', 0, 10, step),
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
    example,
    startWith: ['s', 'e'],
    sliders: true,
    representation: {
      kind: 'unitChain',
      mode: 'ruler',
      start: 's',
      end: 'e',
      length: 'L',
      division,
      unit: 'cm',
      span: 10,
    },
  };
};

const MEASUREMENT: ModuleDef[] = [
  {
    id: 'g.s10-measurement-chain',
    title: 'Converting with a chain of factors',
    unitSystems: ['metric'],
    use: 'Use this to convert a length through more than one metric unit, cancelling units as you go.',
    assumptions: [
      '1 km = 1000 m and 1 m = 100 cm exactly, so each factor equals 1.',
      'Write each factor with the unit to cancel on the bottom.',
    ],
    variables: [
      quantity('d', 'd', 'Distance in kilometers', 'km', 0, 1000),
      quantity('c', 'c', 'Distance in centimeters', 'cm', 0, 1e8, 1),
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
    id: 'g.s10-measurement-rate',
    title: 'Converting a rate',
    use: 'Use this to change a rate’s top and bottom units at once, such as miles per hour to meters per second.',
    assumptions: [
      '1 mi = 1609.344 m and 1 h = 3600 s exactly.',
      'The hour is on the bottom of the rate, so its factor puts hours on top.',
    ],
    variables: [
      quantity('v', 'v', 'Speed in miles per hour', undefined, 0, 500, 0.1),
      quantity('u', 'u', 'Speed in meters per second', undefined, 0, 250, 0.0001),
    ],
    ...rules(
      chainRule(
        'u',
        'v',
        1609.344 / 3600,
        '1609.344/3600',
        'Multiply by 1609.344 m per mi and by 1 h per 3600 s: mi and h cancel.',
      ),
    ),
    example: { v: 65, u: (65 * 1609.344) / 3600 },
    startWith: ['v'],
    representation: {
      kind: 'unitChain',
      mode: 'chain',
      start: 'v',
      unit: 'mi',
      per: 'h',
      factors: [
        { top: 1609.344, topUnit: 'm', bottom: 1, bottomUnit: 'mi' },
        { top: 1, topUnit: 'h', bottom: 3600, bottomUnit: 's' },
      ],
      result: 'u',
    },
  },
  {
    id: 'g.s10-measurement-chain-long',
    title: 'A long chain: years to seconds',
    use: 'Use this for a conversion that needs several factors in a row, such as years to seconds.',
    assumptions: [
      'A year is taken as 365 days.',
      'Each factor cancels the unit the one before it left on top.',
    ],
    variables: [
      quantity('y', 'y', 'Time in years', undefined, 0, 100, 0.01),
      quantity('s', 's', 'Time in seconds', undefined, 0, 1e10, 1, { scientific: true }),
    ],
    ...rules(
      chainRule(
        's',
        'y',
        365 * 24 * 60 * 60,
        '365 × 24 × 60 × 60',
        'Multiply by 365 d per yr, 24 h per d, 60 min per h and 60 s per min.',
      ),
    ),
    example: { y: 1, s: 31536000 },
    startWith: ['y'],
    representation: {
      kind: 'unitChain',
      mode: 'chain',
      start: 'y',
      unit: 'yr',
      factors: [
        { top: 365, topUnit: 'd', bottom: 1, bottomUnit: 'yr' },
        { top: 24, topUnit: 'h', bottom: 1, bottomUnit: 'd' },
        { top: 60, topUnit: 'min', bottom: 1, bottomUnit: 'h' },
        { top: 60, topUnit: 's', bottom: 1, bottomUnit: 'min' },
      ],
      result: 's',
    },
  },
  rulerDemo(
    'g.s10-measurement-ruler',
    'Reading a ruler to the estimated digit',
    'Use this to read a length to one digit past the smallest marks, from a start that is not zero.',
    [
      'The ruler is marked every 0.1 cm (every millimeter).',
      'Every digit the marks give is certain; one more digit is estimated between two marks.',
    ],
    0.1,
    { s: 1, e: 4.47, L: 3.47 },
  ),
  rulerDemo(
    'g.s10-measurement-ruler-coarse',
    'A ruler marked only in centimeters',
    'Use this to see how a coarser ruler gives fewer significant figures.',
    [
      'The ruler is marked every 1 cm, so the tenths of a centimeter are estimated.',
      'A coarser scale gives a reading with fewer significant figures.',
    ],
    1,
    { s: 2, e: 8.3, L: 6.3 },
  ),
];

/** The mean of three trials, and its percent error against the accepted value. */
const trialRules = (): Rule[] => [
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

const trialDemo = (
  id: string,
  title: string,
  use: string,
  what: string,
  trials: [number, number, number],
  ring?: number,
): ModuleDef => {
  const m = (trials[0] + trials[1] + trials[2]) / 3;
  return {
    id,
    title,
    use,
    unitSystems: ['metric'],
    assumptions: [
      `Three students measured ${what}; the accepted value is 9.81 m/s².`,
      'Accurate: the mean is close to the accepted value. Precise: the trials are close to each other.',
    ],
    variables: [
      quantity('a', 'x₁', 'Trial 1', 'm/s²', 0, 20, 0.01),
      quantity('b', 'x₂', 'Trial 2', 'm/s²', 0, 20, 0.01),
      quantity('c', 'x₃', 'Trial 3', 'm/s²', 0, 20, 0.01),
      quantity('m', 'x̄', 'Mean', 'm/s²', 0, 20, 0.0001),
      quantity('t', 'A', 'Accepted value', 'm/s²', 0.01, 20, 0.01),
      quantity('e', 'E', 'Percent error', '%', 0, 1000, 0.0001),
    ],
    ...rules(...trialRules()),
    example: {
      a: trials[0],
      b: trials[1],
      c: trials[2],
      m,
      t: 9.81,
      e: (Math.abs(m - 9.81) / 9.81) * 100,
    },
    startWith: ['a', 'b', 'c', 't'],
    representation: {
      kind: 'unitChain',
      mode: 'target',
      trials: ['a', 'b', 'c'],
      accepted: 't',
      unit: 'm/s²',
      mean: 'm',
      error: 'e',
      ...(ring ? { ring } : {}),
    },
  };
};

MEASUREMENT.push(
  trialDemo(
    'g.s10-measurement-accurate-precise',
    'Accurate and precise',
    'Use this to judge a set of trials that agree with each other and with the accepted value.',
    'the acceleration of a falling ball',
    [9.8, 9.83, 9.78],
  ),
  trialDemo(
    'g.s10-measurement-precise-not-accurate',
    'Precise but not accurate',
    'Use this for trials that agree with each other but are all off in the same direction.',
    'the acceleration of a falling ball with a slow timer',
    [9.5, 9.52, 9.48],
  ),
  trialDemo(
    'g.s10-measurement-neither',
    'Neither accurate nor precise',
    'Use this for trials scattered far from each other and from the accepted value.',
    'the acceleration of a falling ball timed by hand',
    [9.3, 10.2, 9.0],
    2,
  ),
);

// ─── H44 atomModel ───────────────────────────────────────────────────────────

const whole = (
  id: string,
  symbol: string,
  name: string,
  min: number,
  max: number,
): VariableDef => ({
  id,
  symbol,
  name,
  min,
  max,
  step: 1,
  integer: true,
});

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
  whole('A', 'A', 'Mass number', 1, 144),
  whole('e', 'e', 'Electrons', 0, 54),
  whole('q', 'q', 'Charge', -3, 3),
];

const atomDemo = (
  id: string,
  title: string,
  use: string,
  assumptions: string[],
  example: Values,
  startWith = ['p', 'n', 'e'],
): ModuleDef => ({
  id,
  title,
  use,
  assumptions,
  variables: PARTICLES,
  ...rules(massRule, chargeRule),
  example,
  startWith,
  sliders: true,
  representation: {
    kind: 'atomModel',
    protons: 'p',
    neutrons: 'n',
    electrons: 'e',
    mass: 'A',
    charge: 'q',
  },
});

const ATOMS: ModuleDef[] = [
  atomDemo(
    'g.s10-atomic-structure-carbon',
    'The particles in an atom',
    'Use this to find the protons, neutrons and electrons of an atom from its symbol and mass number.',
    [
      'The atomic number is the number of protons; it names the element.',
      'A neutral atom has as many electrons as protons.',
    ],
    { p: 6, n: 6, A: 12, e: 6, q: 0 },
  ),
  atomDemo(
    'g.s10-atomic-structure-isotope',
    'Isotopes',
    'Use this for isotopes: atoms of one element with different numbers of neutrons.',
    [
      'Isotopes have the same number of protons, so they are the same element.',
      'Only the neutrons change, and with them the mass number.',
    ],
    { p: 6, n: 8, A: 14, e: 6, q: 0 },
  ),
  atomDemo(
    'g.s10-atomic-structure-cation',
    'A positive ion',
    'Use this for a positive ion: an atom that has lost electrons.',
    [
      'Metals such as sodium lose their outer electrons.',
      'The protons do not change, so it is still the same element.',
    ],
    { p: 11, n: 12, A: 23, e: 10, q: 1 },
  ),
  atomDemo(
    'g.s10-atomic-structure-anion',
    'A negative ion',
    'Use this for a negative ion: an atom that has gained electrons.',
    [
      'Nonmetals such as chlorine gain electrons to fill their outer shell.',
      'The extra electron gives a charge of −1.',
    ],
    { p: 17, n: 18, A: 35, e: 18, q: -1 },
  ),
  atomDemo(
    'g.s10-nuclear-chemistry-iodine',
    'A heavy isotope: iodine-131',
    'Use this for the particles of a large radioactive isotope such as iodine-131.',
    [
      'Iodine-131 is used in medicine; it has more neutrons than stable iodine-127.',
      'Its five shells hold 2, 8, 18, 18 and 7 electrons.',
    ],
    { p: 53, n: 78, A: 131, e: 53, q: 0 },
  ),
];

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
      how: 'Fill the shells in order; the electrons in the outermost shell are the valence electrons.',
    },
  },
};

ATOMS.push({
  id: 'g.s10-electrons-in-atoms-valence',
  title: 'Valence electrons',
  use: 'Use this to find how many electrons are in an atom’s outer shell.',
  assumptions: [
    'The atom is neutral: as many electrons as protons.',
    'The outer shell’s electrons take part in bonding.',
  ],
  variables: [
    whole('p', 'Z', 'Protons (atomic number)', 1, 54),
    whole('n', 'N', 'Neutrons', 0, 90),
    whole('A', 'A', 'Mass number', 1, 144),
    whole('v', 'v', 'Valence electrons', 1, 8),
  ],
  ...rules(massRule, valenceRule),
  example: { p: 16, n: 16, A: 32, v: 6 },
  startWith: ['p', 'n'],
  sliders: true,
  representation: { kind: 'atomModel', protons: 'p', neutrons: 'n', mass: 'A', valence: 'v' },
});

// ─── H45 orbitalDiagram ──────────────────────────────────────────────────────

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

const boxDemo = (
  id: string,
  title: string,
  use: string,
  assumptions: string[],
  z: number,
): ModuleDef => ({
  id,
  title,
  use,
  assumptions,
  variables: [
    whole('p', 'Z', 'Atomic number (electrons)', 1, 54),
    whole('u', 'u', 'Unpaired electrons', 0, 6),
  ],
  ...rules(unpairedRule(false)),
  example: { p: z, u: unpaired(configuration(z)) },
  startWith: ['p'],
  sliders: true,
  representation: { kind: 'orbitalDiagram', mode: 'boxes', element: 'p', unpaired: 'u' },
});

const ORBITALS: ModuleDef[] = [
  boxDemo(
    'g.s10-electrons-in-atoms-oxygen',
    'Orbital boxes: oxygen',
    'Use this to write an atom’s electron configuration and draw its orbital boxes.',
    [
      'The atom is neutral: as many electrons as its atomic number.',
      'Boxes fill from the lowest energy: 1s, 2s, 2p, 3s, 3p, 4s, 3d, …',
    ],
    8,
  ),
  boxDemo(
    'g.s10-electrons-in-atoms-iron',
    'Orbital boxes: 4s before 3d',
    'Use this for an atom past argon, where 4s fills before 3d.',
    ['The atom is neutral.', 'The 4s subshell is lower in energy than 3d, so it fills first.'],
    26,
  ),
  boxDemo(
    'g.s10-electrons-in-atoms-chromium',
    'An exception: chromium',
    'Use this for chromium and copper, whose configurations break the Aufbau order.',
    ['The atom is neutral.', 'A half-full or full d subshell is especially stable.'],
    24,
  ),
  boxDemo(
    'g.s10-electrons-in-atoms-xenon',
    'Orbital boxes through 5p: xenon',
    'Use this for the largest atoms drawn: every box through 5p full.',
    ['The atom is neutral.', 'A noble gas has every box of its outer shell full.'],
    54,
  ),
  {
    id: 'g.s10-electrons-in-atoms-ion',
    title: 'Orbital boxes of an ion',
    use: 'Use this for an ion’s configuration: electrons taken from the highest shell first.',
    assumptions: [
      'A positive ion loses electrons from its highest shell first: 4s before 3d.',
      'A negative ion gains electrons in the next empty places.',
    ],
    variables: [
      whole('p', 'Z', 'Atomic number (protons)', 1, 54),
      whole('e', 'e', 'Electrons', 0, 54),
      whole('q', 'q', 'Charge', -3, 3),
      whole('u', 'u', 'Unpaired electrons', 0, 6),
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
];

/** A drop from level u to level l in hydrogen: the photon's energy and wavelength. */
const LADDER_RULES: Rule[] = [
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

const ladderDemo = (
  id: string,
  title: string,
  use: string,
  assumptions: string[],
  u: number,
  l: number,
): ModuleDef => {
  const E = photonEnergy(u, l);
  return {
    id,
    title,
    use,
    assumptions,
    variables: [
      whole('u', 'n₂', 'Upper level', 2, 6),
      whole('l', 'n₁', 'Lower level', 1, 5),
      quantity('E', 'E', 'Photon energy', 'eV', 0.01, 13.6, 0.0001),
      quantity('w', 'λ', 'Wavelength', 'nm', 50, 10000, 0.1),
    ],
    ...rules(...LADDER_RULES),
    example: { u, l, E, w: photonWavelength(E) },
    startWith: ['u', 'l'],
    sliders: true,
    representation: {
      kind: 'orbitalDiagram',
      mode: 'ladder',
      upper: 'u',
      lower: 'l',
      energy: 'E',
      wavelength: 'w',
    },
  };
};

ORBITALS.push(
  ladderDemo(
    'g.s10-electrons-in-atoms-balmer',
    'A line in hydrogen’s spectrum',
    'Use this for the color of light a hydrogen atom gives off when its electron drops a level.',
    [
      'Hydrogen’s levels have energies Eₙ = −13.6/n² eV.',
      'Drops to n = 2 give the visible lines (the Balmer series).',
    ],
    3,
    2,
  ),
  ladderDemo(
    'g.s11-modern-physics-lyman',
    'An ultraviolet line',
    'Use this for a photon’s energy and wavelength from a drop to the lowest level.',
    ['Hydrogen’s levels have energies Eₙ = −13.6/n² eV.', 'Drops to n = 1 give ultraviolet light.'],
    2,
    1,
  ),
  ladderDemo(
    'g.s11-modern-physics-paschen',
    'An infrared line',
    'Use this for a small drop between high levels, which gives infrared light.',
    ['Hydrogen’s levels have energies Eₙ = −13.6/n² eV.', 'Drops to n = 3 give infrared light.'],
    5,
    3,
  ),
);

// ─── H46 periodicTable trend ─────────────────────────────────────────────────

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

/** Atomic numbers 1–86 that have a value of the property. */
const withValue = (property: TrendProperty) =>
  Array.from({ length: 86 }, (_, i) => i + 1).filter((z) => trendValue(property, z) !== undefined);

const trendDemo = (
  id: string,
  title: string,
  use: string,
  assumptions: string[],
  property: TrendProperty,
  z: number,
  z2: number,
): ModuleDef => {
  const words = TREND_WORDS[property];
  const atomic = (vid: string, name: string): VariableDef => ({
    ...whole(vid, vid === 'p' ? 'Z₁' : 'Z₂', name, 1, 86),
    allowed: withValue(property),
  });
  const value = (vid: string, symbol: string, name: string): VariableDef => ({
    id: vid,
    symbol,
    name,
    ...(words.unit ? { unit: words.unit } : {}),
    min: 0,
    max: 3000,
    step: words.step,
  });
  return {
    id,
    title,
    use,
    assumptions,
    variables: [
      atomic('p', 'Atomic number of the element'),
      value('r', 'x₁', `${words.name} of the element`),
      atomic('c', 'Atomic number to compare'),
      value('s', 'x₂', `${words.name} to compare`),
      { ...value('d', 'Δx', 'Difference (first − second)'), min: -3000 },
    ],
    ...rules(trendRule(property, 'r', 'p'), trendRule(property, 's', 'c'), {
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
    }),
    example: {
      p: z,
      r: trendValue(property, z)!,
      c: z2,
      s: trendValue(property, z2)!,
      d: trendValue(property, z)! - trendValue(property, z2)!,
    },
    pictureLabels: ['d'],
    startWith: ['p', 'c'],
    representation: {
      kind: 'periodicTable',
      element: 'p',
      trend: { property, value: 'r', compare: 'c', compareValue: 's' },
    },
  };
};

const TRENDS_DEMOS: ModuleDef[] = [
  trendDemo(
    'g.s10-periodic-trends-radius',
    'Atomic radius across a period',
    'Use this to compare the sizes of two atoms from where they sit on the table.',
    [
      'Radii are covalent radii, in picometers (1 pm = 10⁻¹² m).',
      'Across a period the nucleus gains protons and pulls the same shell in tighter.',
    ],
    'radius',
    11,
    17,
  ),
  trendDemo(
    'g.s10-periodic-trends-ionization',
    'Ionization energy down a group',
    'Use this to compare how much energy it takes to remove an electron from two atoms.',
    [
      'First ionization energy removes one electron from a gas atom, in kJ/mol.',
      'Down a group the outer electron is in a higher shell, farther from the nucleus.',
    ],
    'ionization',
    12,
    20,
  ),
  trendDemo(
    'g.s10-periodic-trends-electronegativity',
    'Electronegativity',
    'Use this to see which atom in a bond pulls the shared electrons harder.',
    [
      'Electronegativity is on the Pauling scale, with no unit; fluorine is highest, 3.98.',
      'The noble gases helium, neon and argon have no value.',
    ],
    'electronegativity',
    8,
    1,
  ),
  trendDemo(
    'g.s10-periodic-trends-extremes',
    'The largest and smallest atoms',
    'Use this for the extremes of a trend: the bottom left and the top right of the table.',
    [
      'Radii are covalent radii, in picometers.',
      'Cesium is the largest atom shown; hydrogen the smallest.',
    ],
    'radius',
    55,
    1,
  ),
];

// ─── H47 lewisStructure ──────────────────────────────────────────────────────

type Vals = Record<string, number | undefined>;

/** V = Σ (atoms × valence electrons) − q: the electrons a Lewis structure places. */
const valenceSumRule = (atoms: string[], ids: string[], charge?: string): Rule => {
  const terms = atoms.map((el, i) => ({ el, id: ids[i]!, v: valenceElectrons(el) }));
  const text = terms.map((t) => (t.v === 1 ? `{${t.id}}` : `${t.v} × {${t.id}}`)).join(' + ');
  const expr = charge ? `${text} − {${charge}}` : text;
  const sum = (v: Vals) =>
    terms.reduce((s, t) => s + t.v * v[t.id]!, 0) - (charge ? v[charge]! : 0);
  const solve: Record<string, (v: Vals) => number | undefined> = { V: (v) => sum(v) };
  const steps: Record<string, StepText> = {
    V: {
      expr,
      how: 'Add each atom’s valence electrons (its group’s last digit); a positive charge takes electrons away.',
    },
  };
  for (const t of terms) {
    solve[t.id] = (v) =>
      (v.V! +
        (charge ? v[charge]! : 0) -
        terms.filter((o) => o !== t).reduce((acc, o) => acc + o.v * v[o.id]!, 0)) /
      t.v;
    const others = terms
      .filter((o) => o !== t)
      .map((o) => ` − ${o.v === 1 ? '' : `${o.v} × `}{${o.id}}`)
      .join('');
    const top = `{V}${charge ? ` + {${charge}}` : ''}${others}`;
    steps[t.id] = {
      expr: t.v === 1 ? top : `(${top})/${t.v}`,
      how: `Take away the other atoms’ electrons${t.v === 1 ? '' : ` and divide by ${t.v}`}.`,
    };
  }
  if (charge) {
    solve[charge] = (v) => terms.reduce((acc, t) => acc + t.v * v[t.id]!, 0) - v.V!;
    steps[charge] = {
      expr: `${text} − {V}`,
      how: 'The charge is the atoms’ valence electrons minus the electrons placed.',
    };
  }
  return {
    relation: {
      id: 'valence electrons',
      display: `{V} = ${expr}`,
      vars: ['V', ...ids, ...(charge ? [charge] : [])],
      residual: (v) => v.V! - sum(v),
      solve,
    },
    steps,
  };
};

const ELEMENT_WORDS: Record<string, string> = {
  H: 'Hydrogen',
  C: 'Carbon',
  N: 'Nitrogen',
  O: 'Oxygen',
};

const moleculeDemo = (
  id: string,
  title: string,
  use: string,
  assumptions: string[],
  atoms: [string, string, number][],
  extra: { charge?: number; dots?: boolean } = {},
): ModuleDef => {
  const q = extra.charge;
  const V = atoms.reduce((s, [el, , n]) => s + valenceElectrons(el) * n, 0) - (q ?? 0);
  return {
    id,
    title,
    use,
    assumptions,
    variables: [
      ...atoms.map(([el, vid]) => whole(vid, `n${el}`, `${ELEMENT_WORDS[el] ?? el} atoms`, 0, 4)),
      ...(q !== undefined ? [whole('q', 'q', 'Charge', -3, 3)] : []),
      whole('V', 'V', 'Valence electrons', 0, 40),
    ],
    ...rules(
      valenceSumRule(
        atoms.map((a) => a[0]),
        atoms.map((a) => a[1]),
        q !== undefined ? 'q' : undefined,
      ),
    ),
    example: {
      ...Object.fromEntries(atoms.map(([, vid, n]) => [vid, n])),
      ...(q !== undefined ? { q } : {}),
      V,
    },
    startWith: [...atoms.map((a) => a[1]), ...(q !== undefined ? ['q'] : [])],
    sliders: true,
    representation: {
      kind: 'lewisStructure',
      mode: 'molecule',
      atoms: Object.fromEntries(atoms.map(([el, vid]) => [el, vid])),
      ...(q !== undefined ? { charge: 'q' } : {}),
      valence: 'V',
      ...(extra.dots ? { dots: true } : {}),
    },
  };
};

const BONDING: ModuleDef[] = [
  moleculeDemo(
    'g.s10-bonding-water',
    'Lewis structure of water',
    'Use this to count a molecule’s valence electrons and place them as shared and lone pairs.',
    [
      'Each atom but hydrogen ends with 8 electrons around it; hydrogen with 2.',
      'A line is a shared pair of electrons.',
    ],
    [
      ['H', 'h', 2],
      ['O', 'o', 1],
    ],
  ),
  moleculeDemo(
    'g.s10-bonding-ammonia',
    'Lewis structure of ammonia',
    'Use this for a molecule whose central atom keeps a lone pair.',
    ['Nitrogen has 5 valence electrons and makes 3 bonds.', 'Its fourth pair is a lone pair.'],
    [
      ['H', 'h', 3],
      ['N', 'n', 1],
    ],
  ),
  moleculeDemo(
    'g.s10-bonding-double',
    'Double bonds: carbon dioxide',
    'Use this for a molecule that needs double bonds to give every atom an octet.',
    ['Carbon shares two pairs with each oxygen.', 'Each double bond is 4 shared electrons.'],
    [
      ['C', 'c', 1],
      ['O', 'o', 2],
    ],
  ),
  moleculeDemo(
    'g.s10-bonding-triple-dots',
    'Electron dots: nitrogen gas',
    'Use this to see every electron as a dot, with a triple bond as three shared pairs.',
    [
      'Each nitrogen has 5 valence electrons.',
      'Three shared pairs and a lone pair give each an octet.',
    ],
    [['N', 'n', 2]],
    { dots: true },
  ),
  moleculeDemo(
    'g.s10-bonding-polyatomic-ion',
    'A polyatomic ion: ammonium',
    'Use this for an ion made of bonded atoms, drawn in brackets with its charge.',
    [
      'A charge of +1 means one electron fewer than the atoms bring.',
      'All four N–H bonds are the same once formed.',
    ],
    [
      ['H', 'h', 4],
      ['N', 'n', 1],
    ],
    { charge: 1 },
  ),
];

/** An ionic compound: a metal ions and b nonmetal ions whose charges balance, t electrons moved. */
const ionicDemo = (
  id: string,
  title: string,
  use: string,
  assumptions: string[],
  metal: string,
  nonmetal: string,
): ModuleDef => {
  const ion = ionic(metal, nonmetal);
  const s = (k: number) => (k > 1 ? 's' : '');
  return {
    id,
    title,
    use,
    assumptions,
    variables: [
      whole('a', 'a', `${metal} ions`, 1, 6),
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
};

BONDING.push(
  ionicDemo(
    'g.s10-bonding-ionic-sodium-chloride',
    'An ionic bond: sodium chloride',
    'Use this to see a metal atom give its valence electron to a nonmetal atom.',
    [
      'Sodium has 1 valence electron; chlorine needs 1 more for an octet.',
      'The ions attract: Na⁺ and Cl⁻.',
    ],
    'Na',
    'Cl',
  ),
  ionicDemo(
    'g.s10-bonding-ionic-magnesium-chloride',
    'Ions in a 1-to-2 ratio: magnesium chloride',
    'Use this to find an ionic formula when one atom gives more electrons than another takes.',
    ['Magnesium gives 2 electrons; each chlorine takes 1.', 'So one Mg²⁺ pairs with two Cl⁻.'],
    'Mg',
    'Cl',
  ),
  ionicDemo(
    'g.s10-bonding-ionic-aluminum-oxide',
    'Ions in a 2-to-3 ratio: aluminum oxide',
    'Use this for the largest formula units drawn: two aluminum ions and three oxide ions.',
    ['Aluminum gives 3 electrons; oxygen takes 2.', '2 × 3 = 3 × 2 = 6 electrons move.'],
    'Al',
    'O',
  ),
);

const metalDemo = (
  id: string,
  title: string,
  use: string,
  element: string,
  n: number,
): ModuleDef => {
  const v = valenceElectrons(element);
  const s = v > 1 ? 's' : '';
  return {
    id,
    title,
    use,
    assumptions: [
      `Each ${element} atom gives up its ${v} valence electron${s} to the whole piece of metal.`,
      'The electrons are shared by all the ions, not held by any one.',
    ],
    variables: [whole('n', 'n', 'Metal atoms', 1, 24), whole('e', 'e', 'Free electrons', 0, 72)],
    ...rules({
      relation: {
        id: 'e = v × n',
        display: `{e} = ${v} × {n}`,
        vars: ['e', 'n'],
        residual: (x) => x.e! - v * x.n!,
        solve: { e: (x) => v * x.n!, n: (x) => x.e! / v },
      },
      steps: {
        e: { expr: `${v} × {n}`, how: `Each atom gives ${v} electron${s} to the sea.` },
        n: { expr: `{e}/${v}`, how: `Divide by the electrons each atom gives.` },
      },
    }),
    example: { n, e: v * n },
    startWith: ['n'],
    sliders: true,
    representation: {
      kind: 'lewisStructure',
      mode: 'metallic',
      element,
      atoms: 'n',
      electrons: 'e',
    },
  };
};

BONDING.push(
  metalDemo(
    'g.s10-bonding-metallic',
    'A sea of electrons: sodium',
    'Use this for metallic bonding: positive ions in a sea of shared electrons.',
    'Na',
    12,
  ),
  metalDemo(
    'g.s10-bonding-metallic-aluminum',
    'A sea of electrons: aluminum',
    'Use this for a metal whose atoms each give three electrons to the sea.',
    'Al',
    24,
  ),
);

const chainDemo = (
  id: string,
  title: string,
  use: string,
  bond: 'single' | 'double' | 'triple',
  n: number,
): ModuleDef => {
  const k = bond === 'single' ? 2 : bond === 'double' ? 0 : -2;
  const tail = k === 0 ? '' : k > 0 ? ` + ${k}` : ` − ${-k}`;
  return {
    id,
    title,
    use,
    assumptions: [
      'Every carbon makes 4 bonds and every hydrogen 1.',
      bond === 'single'
        ? 'All the carbon–carbon bonds are single (an alkane).'
        : `One carbon–carbon bond is ${bond}, between the first two carbons (an ${bond === 'double' ? 'alkene' : 'alkyne'}).`,
    ],
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
          how: 'Each carbon holds 2 hydrogens and the chain’s ends 2 more; a double bond takes 2 away, a triple 4.',
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
};

BONDING.push(
  chainDemo(
    'g.s10-organic-alkane',
    'Alkanes: propane',
    'Use this for the structure and formula of an alkane from its number of carbons.',
    'single',
    3,
  ),
  chainDemo(
    'g.s10-organic-alkene',
    'Alkenes: 1-butene',
    'Use this for an alkene: a chain with one carbon–carbon double bond.',
    'double',
    4,
  ),
  chainDemo(
    'g.s10-organic-alkyne',
    'Alkynes: ethyne',
    'Use this for an alkyne: a chain with one carbon–carbon triple bond.',
    'triple',
    2,
  ),
  chainDemo(
    'g.s10-organic-octane',
    'A long chain: octane',
    'Use this for the longest chain drawn, eight carbons.',
    'single',
    8,
  ),
);

// ─── H48 vsepr ───────────────────────────────────────────────────────────────

/** d = b + l electron domains, and the bond angle from b and l (worked forward only). */
const SHAPE_RULES: Rule[] = [
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
];

const shapeDemo = (
  id: string,
  title: string,
  use: string,
  assumptions: string[],
  b: number,
  l: number,
  polar = true,
): ModuleDef => ({
  id,
  title,
  use,
  assumptions,
  variables: [
    whole('b', 'b', 'Bonded atoms on the central atom', 2, 4),
    whole('l', 'l', 'Lone pairs on the central atom', 0, 2),
    whole('d', 'd', 'Electron domains', 2, 4),
    quantity('a', 'θ', 'Bond angle', '°', 90, 180, 0.1),
  ],
  ...rules(...SHAPE_RULES),
  example: { b, l, d: b + l, a: shapeOf(b, l)!.angle },
  startWith: ['b', 'l'],
  sliders: true,
  representation: {
    kind: 'vsepr',
    bonded: 'b',
    lone: 'l',
    angle: 'a',
    ...(polar ? { polar } : {}),
  },
});

const SHAPES_DEMOS: ModuleDef[] = [
  shapeDemo(
    'g.s10-molecular-shape-water',
    'Bent: water',
    'Use this to predict a molecule’s shape and bond angle from its bonded atoms and lone pairs.',
    [
      'Count the atoms bonded to the central atom and its lone pairs.',
      'A double bond counts as one domain, like a single bond.',
    ],
    2,
    2,
  ),
  shapeDemo(
    'g.s10-molecular-shape-ammonia',
    'Trigonal pyramidal: ammonia',
    'Use this for a central atom with three bonds and one lone pair.',
    [
      'The lone pair takes the fourth corner of a tetrahedron.',
      'It pushes the three bonds down to 107°.',
    ],
    3,
    1,
  ),
  shapeDemo(
    'g.s10-molecular-shape-methane',
    'Tetrahedral: methane',
    'Use this for four bonds and no lone pairs: the tetrahedron.',
    [
      'Four domains point to the corners of a tetrahedron, 109.5° apart.',
      'Wedge-shaped views show two bonds in the page.',
    ],
    4,
    0,
  ),
  shapeDemo(
    'g.s10-molecular-shape-trigonal-planar',
    'Trigonal planar: boron trifluoride',
    'Use this for three bonds and no lone pairs: flat, 120° apart.',
    ['Three domains spread out flat around the central atom.', 'The equal B–F dipoles cancel.'],
    3,
    0,
  ),
  shapeDemo(
    'g.s10-molecular-shape-linear',
    'Linear: carbon dioxide',
    'Use this for two domains: a straight molecule, which is nonpolar when both ends match.',
    ['Two domains point opposite ways, 180° apart.', 'Each C=O bond is polar, but the two cancel.'],
    2,
    0,
  ),
  shapeDemo(
    'g.s10-molecular-shape-bent-three-domains',
    'Bent with three domains: sulfur dioxide',
    'Use this for two bonds and one lone pair: bent, a little under 120°.',
    [
      'Three domains are trigonal planar; the lone pair is one of them.',
      'The molecule is bent and polar.',
    ],
    2,
    1,
  ),
];

const hbondDemo = (id: string, title: string, use: string, n: number): ModuleDef => ({
  id,
  title,
  use,
  assumptions: [
    'Water is bent and polar: its O is partly negative and its H atoms partly positive.',
    'A hydrogen bond is an attraction between molecules, much weaker than a covalent bond.',
  ],
  variables: [whole('n', 'n', 'Water molecules', 2, 5), whole('k', 'k', 'Hydrogen bonds', 1, 4)],
  ...rules({
    relation: {
      id: 'k = n − 1',
      display: '{k} = {n} − 1',
      vars: ['k', 'n'],
      residual: (v) => v.k! - (v.n! - 1),
      solve: { k: (v) => v.n! - 1, n: (v) => v.k! + 1 },
    },
    steps: {
      k: {
        expr: '{n} − 1',
        how: 'Each molecule around the middle one is held to it by one hydrogen bond.',
      },
      n: {
        expr: '{k} + 1',
        how: 'One molecule for each hydrogen bond, and the one in the middle.',
      },
    },
  }),
  example: { n, k: n - 1 },
  startWith: ['n'],
  sliders: true,
  representation: { kind: 'vsepr', mode: 'hbonds', molecules: 'n', bonds: 'k' },
});

SHAPES_DEMOS.push(
  hbondDemo(
    'g.s10-molecular-shape-hydrogen-bonds',
    'Hydrogen bonds between water molecules',
    'Use this to see hydrogen bonds: the attraction between water molecules.',
    3,
  ),
  hbondDemo(
    'g.s10-molecular-shape-hydrogen-bonds-four',
    'Four hydrogen bonds on one molecule',
    'Use this for the most hydrogen bonds one water molecule can make: four.',
    5,
  ),
);

export const HSI_GALLERY_MODULES: ModuleDef[] = [
  ...MEASUREMENT,
  ...ATOMS,
  ...ORBITALS,
  ...TRENDS_DEMOS,
  ...BONDING,
  ...SHAPES_DEMOS,
];
export const HSI_GALLERY_LAYOUTS: LayoutDef[] = [];
