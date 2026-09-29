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
import type { Relation, VariableDef, Values } from '@/engine/types';

import type { LayoutDef } from './layouts';
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

export const HSI_GALLERY_MODULES: ModuleDef[] = [...MEASUREMENT, ...ATOMS, ...ORBITALS];
export const HSI_GALLERY_LAYOUTS: LayoutDef[] = [];
