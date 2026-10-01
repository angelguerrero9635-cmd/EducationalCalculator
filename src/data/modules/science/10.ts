/**
 * Grade 10 science: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md; the
 * direction plan and build notes: docs/BUILD_HS.md, docs/build/s.10.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/science10.ts`.
 */
import { CELL_METALS } from '@/components/module/layouts/galvanic';
import { trendValue } from '@/components/module/reps/chemTrends';
import {
  configuration,
  notation,
  photonEnergy,
  photonWavelength,
  unpaired,
  valenceOf,
} from '@/components/module/reps/electrons';
import { element, groupOf, periodOf, subscript } from '@/components/module/reps/chem';
import { hydrocarbonName, hydrogensOf, valenceElectrons } from '@/components/module/reps/lewis';
import { molarMassOf } from '@/components/module/reps/moles';
import { solubilityAt } from '@/components/module/reps/solubility';
import { shapeOf } from '@/components/module/reps/vseprGeo';
import { formatNumber as fmt, scientific } from '@/engine/format';
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
  // A figure-only (hidden) relation places the drawing and has no steps.
  steps: Object.fromEntries(
    rs.filter((r) => !r.relation.hidden).map((r) => [r.relation.id, r.steps]),
  ),
});

/** A factor after a division sign: a plain number as it is (/22.4), anything else bracketed. */
const over = (k: string) => (/^[\d.,]+$/.test(k) ? k : `(${k})`);

/** a ÷ b, or undefined when b is 0. */
const div = (a: number, b: number) => (b === 0 ? undefined : a / b);

/** The greatest common factor of two whole numbers. */
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

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
      expr: `{${out}}/${over(factorText)}`,
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
      quantity('a', 'a', 'Distance in kilometers', 'km', 0.001, 1000, 0.001),
      quantity('b', 'b', 'Distance in meters', 'm', 1, 1e6, 1),
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
      { ...quantity('w', 'w', 'Speed in meters per second', 'm/s', 0.1, 300, 0.0001), figures: 4 },
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
    use: 'Use this to read a rod’s length from its start and end, to one digit past the smallest marks.',
    unitSystems: ['metric'],
    assumptions: [
      'The ruler is marked every 0.1 cm (every millimeter).',
      'Read one digit past the smallest mark; that last digit is estimated and still significant.',
      'A length such as 6.46 cm has 3 significant figures: two certain digits and one estimated.',
    ],
    variables: [
      quantity('s', 'x₁', 'Start of the rod', 'cm', 0, 9, 0.01, { multipleOf: 0.01 }),
      quantity('e', 'x₂', 'End of the rod', 'cm', 0.01, 10, 0.01, { multipleOf: 0.01 }),
      quantity('L', 'L', 'Length of the rod', 'cm', 0.01, 10, 0.01),
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
    example: { s: 1.25, e: 7.71, L: 6.46 },
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
    variables: PARTICLES.filter((x) => ['p', 'e', 'q'].includes(x.id)),
    ...rules(chargeRule),
    example: { p: 16, e: 18, q: -2 },
    startWith: ['p', 'e'],
    sliders: true,
    representation: { kind: 'atomModel', protons: 'p', electrons: 'e', charge: 'q' },
  },
  {
    id: 's.10.atomic-structure~average-mass',
    title: 'Average atomic mass from isotopes',
    use: 'Use this for “Boron is 19.9% boron-10 (10.01 u) and 80.1% boron-11 (11.01 u). Find its atomic mass.”',
    unitSystems: ['metric'],
    assumptions: [
      'The element has two isotopes; their percents add to 100%.',
      'The atomic mass on the periodic table is the average over the atoms, weighted by how common each isotope is.',
    ],
    variables: [
      quantity('m1', 'm₁', 'Mass of the first isotope', 'u', 0.1, 300, 0.01),
      quantity('m2', 'm₂', 'Mass of the second isotope', 'u', 0.1, 300, 0.01),
      quantity('f1', 'f₁', 'Abundance of the first isotope', '%', 0, 100, 0.1),
      {
        ...quantity('f2', 'f₂', 'Abundance of the second isotope', '%', 0, 100, 0.1),
        derived: true,
      },
      { ...quantity('A', 'A', 'Average atomic mass', 'u', 0.1, 300, 0.01), derived: true },
    ],
    ...rules(
      {
        relation: {
          id: 'f2 = 100 − f1',
          display: '{f2} = 100 − {f1}',
          vars: ['f2', 'f1'],
          residual: (v) => v.f2! - (100 - v.f1!),
          solve: { f2: (v) => 100 - v.f1!, f1: (v) => 100 - v.f2! },
        },
        steps: {
          f2: { expr: '100 − {f1}', how: 'The two isotopes make up all the atoms: 100%.' },
          f1: { expr: '100 − {f2}', how: 'The rest of the 100% is the first isotope.' },
        },
      },
      {
        relation: {
          id: 'A = m1 f1 + m2 f2',
          display: '{A} = {m1} × {f1}/100 + {m2} × {f2}/100',
          vars: ['A', 'm1', 'f1', 'm2', 'f2'],
          residual: (v) => 100 * v.A! - (v.m1! * v.f1! + v.m2! * v.f2!),
          solve: {
            A: (v) => (v.m1! * v.f1! + v.m2! * v.f2!) / 100,
            m1: (v) => (v.f1! > 0 ? (100 * v.A! - v.m2! * v.f2!) / v.f1! : undefined),
            m2: (v) => (v.f2! > 0 ? (100 * v.A! - v.m1! * v.f1!) / v.f2! : undefined),
          },
        },
        steps: {
          A: {
            expr: '{m1} × {f1}/100 + {m2} × {f2}/100',
            how: 'Each isotope counts as much as its share of the atoms.',
          },
          m1: {
            expr: '(100 × {A} − {m2} × {f2})/{f1}',
            how: 'Take the second isotope’s share away and divide by the first one’s percent.',
          },
          m2: {
            expr: '(100 × {A} − {m1} × {f1})/{f2}',
            how: 'Take the first isotope’s share away and divide by the second one’s percent.',
          },
        },
      },
    ),
    example: { m1: 10.01, m2: 11.01, f1: 19.9, f2: 80.1, A: (10.01 * 19.9 + 11.01 * 80.1) / 100 },
    startWith: ['m1', 'm2', 'f1'],
    representation: {
      kind: 'chemDiagram',
      mode: 'isotopes',
      element: 'B',
      masses: ['m1', 'm2'],
      percents: ['f1', 'f2'],
      average: 'A',
    },
  },
];

// ─── Electrons in atoms ──────────────────────────────────────────────────────

/** "Z = 8 (oxygen): 1s² 2s² 2p⁴", the configuration the boxes are filled from. */
const configLine = (z: number, electrons: number) => {
  const name = element(z)?.name.toLowerCase() ?? `element ${z}`;
  const ion = electrons === z ? '' : ` with ${electrons} electrons`;
  return `Z = ${z} (${name})${ion}: ${notation(configuration(z, electrons))}`;
};

/** u: unpaired electrons of atom Z (with e electrons for an ion). */
const unpairedRule = (ion: boolean): Rule => ({
  relation: {
    id: 'unpaired electrons',
    display: ion
      ? '{u} = unpaired electrons of element {p} with {e} electrons'
      : '{u} = unpaired electrons of element {p}',
    vars: ion ? ['u', 'p', 'e'] : ['u', 'p'],
    residual: (v) => v.u! - unpaired(configuration(v.p!, ion ? v.e! : v.p!)),
    solve: ion
      ? { u: (v) => unpaired(configuration(v.p!, v.e!)), p: () => undefined, e: () => undefined }
      : { u: (v) => unpaired(configuration(v.p!)), p: () => undefined },
  },
  steps: {
    u: {
      expr: ion
        ? 'unpaired electrons of element {p} with {e} electrons'
        : 'unpaired electrons of element {p}',
      how: 'Fill the boxes in order, one arrow in each box of a subshell before pairing, then count the single arrows.',
      work: (v) => [configLine(v.p!, ion ? v.e! : v.p!)],
    },
  },
});

/** v: the electrons in a neutral atom's outer shell. */
const valenceRule: Rule = {
  relation: {
    id: 'valence electrons',
    display: '{v} = valence electrons of element {p}',
    vars: ['v', 'p'],
    residual: (v) => v.v! - valenceOf(configuration(v.p!)),
    solve: { v: (v) => valenceOf(configuration(v.p!)), p: () => undefined },
  },
  steps: {
    v: {
      expr: 'valence electrons of element {p}',
      how: 'The electrons in the highest-numbered shell are the valence electrons.',
      work: (v) => {
        const cfg = configuration(v.p!);
        const top = Math.max(...cfg.filter((x) => x.e > 0).map((x) => x.n));
        const outer = cfg.filter((x) => x.n === top && x.e > 0).map((x) => x.e);
        const sum = outer.length > 1 ? `${outer.join(' + ')} = ${valenceOf(cfg)}` : `${outer[0]}`;
        return [configLine(v.p!, v.p!), `Shell ${top} holds ${sum}`];
      },
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
        work: (v) => {
          const [a, b] = [v.l! ** 2, v.u! ** 2];
          const g = gcd(b - a, a * b);
          const [top, bottom] = [(b - a) / g, (a * b) / g];
          const frac = bottom === 1 ? `${top}` : `${top}/${bottom}`;
          return [`1/${a} − 1/${b} = ${frac}`, `13.6 × ${frac} = ${fmt(13.6 * (top / bottom))}`];
        },
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
      // Not written as f·λ − c: at the harness's small probe values that looks like a constant.
      residual: (v) => v.f! - 3e17 / v.l!,
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
        expr: '(3.00 × 10⁸)/{f} × 10⁹',
        how: 'Divide c by the frequency for meters, then change meters to nanometers: 10⁹ nm in 1 m.',
        work: (v) => {
          const m = scientific(3e8 / v.f!);
          return [
            `(3.00 × 10⁸)/(${scientific(v.f!)}) = ${m} m`,
            `${m} m × 10⁹ nm/m = ${fmt(3e17 / v.f!)} nm`,
          ];
        },
      },
    },
  },
  {
    relation: {
      id: 'E = hf',
      display: '{E} = 6.626 × 10⁻³⁴ × {f}',
      vars: ['E', 'f'],
      residual: (v) => v.E! / (6.626e-34 * v.f!) - 1,
      // f first: `holds` re-solves the first entry, and a check on E (10⁻¹⁹ J) would pass anything.
      solve: { f: (v) => v.E! / 6.626e-34, E: (v) => 6.626e-34 * v.f! },
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
  { phrase: string; name: string; unit?: string; step: number; max: number }
> = {
  radius: { phrase: 'atomic radius', name: 'Atomic radius', unit: 'pm', step: 1, max: 3000 },
  ionization: {
    phrase: 'ionization energy',
    name: 'First ionization energy',
    unit: 'kJ/mol',
    step: 1,
    max: 3000,
  },
  electronegativity: {
    phrase: 'electronegativity',
    name: 'Electronegativity',
    step: 0.01,
    max: 4,
  },
};

/** "Z = 11 (sodium): period 3, group 1", where an element sits in the table. */
const placeLine = (z: number) =>
  `Z = ${z} (${element(z)?.name.toLowerCase() ?? z}): period ${periodOf(z)}, group ${groupOf(z)}`;

/**
 * The trend reasoning for two elements: same period (farther right), same group (lower down),
 * or both, and what the trend says about the property. When the values go against the trend
 * (a transition metal, or a half-filled subshell) the line says the table decides.
 */
function trendReason(property: TrendProperty, z1: number, z2: number): string {
  const words = TREND_WORDS[property].phrase;
  const [a, b] = [trendValue(property, z1), trendValue(property, z2)];
  if (a === undefined || b === undefined || z1 === z2) return `Both are Z = ${z1}`;
  // Across a period the radius shrinks and the other two grow; down a group the reverse.
  const acrossUp = property !== 'radius';
  const [p1, p2, g1, g2] = [periodOf(z1), periodOf(z2), groupOf(z1)!, groupOf(z2)!];
  // +1 when the trend makes the first element's value larger, −1 smaller, 0 when it can't say.
  const across = g1 === g2 ? 0 : (g1 > g2 ? 1 : -1) * (acrossUp ? 1 : -1);
  const down = p1 === p2 ? 0 : (p1 > p2 ? 1 : -1) * (acrossUp ? -1 : 1);
  const says = across === 0 ? down : down === 0 ? across : across === down ? across : 0;
  const where =
    p1 === p2
      ? `Same period: Z = ${g1 > g2 ? z1 : z2} is farther right`
      : g1 === g2
        ? `Same group: Z = ${p1 > p2 ? z1 : z2} is lower down`
        : (p1 > p2 ? z1 : z2) === (g1 > g2 ? z1 : z2)
          ? `Z = ${p1 > p2 ? z1 : z2} is lower down and farther right`
          : `Z = ${p1 > p2 ? z1 : z2} is lower down and Z = ${g1 > g2 ? z1 : z2} farther right`;
  if (says === 0) return `${where}, so the two trends pull opposite ways: the table decides`;
  const bigger = says > 0 ? z1 : z2;
  if ((a > b ? z1 : z2) !== bigger || a === b)
    return `${where}; the trend says Z = ${bigger} is larger, but here the table goes against it`;
  return `${where}, so the ${words} of Z = ${bigger} is the larger`;
}

/** out: an element's value of a property, looked up from its atomic number (never worked back). */
const trendRule = (property: TrendProperty, out: string, z: string): Rule => {
  const words = TREND_WORDS[property];
  return {
    relation: {
      id: `${out} = ${words.phrase} of ${z}`,
      display: `{${out}} = ${words.phrase} of element {${z}}`,
      vars: [out, z],
      residual: (v) => v[out]! - (trendValue(property, v[z]!) ?? NaN),
      solve: { [out]: (v) => trendValue(property, v[z]!), [z]: () => undefined },
    },
    steps: {
      [out]: {
        expr: `${words.phrase} of element {${z}}`,
        how: `Read the element’s ${words.phrase} from the table.`,
        work: (v) => [placeLine(v[z]!)],
      },
    },
  };
};

/**
 * The bond's kind from the electronegativity difference, and which atom takes δ−:
 * "0.4 ≤ 0.96 ≤ 1.7, so the bond is polar covalent; Z = 17 (chlorine) takes δ−".
 */
function bondClass(d: number, z1: number, z2: number, en1: number, en2: number): string {
  const x = fmt(d);
  const kind =
    d < 0.4
      ? `${x} is below 0.4, so the bond is nonpolar`
      : d <= 1.7
        ? `0.4 ≤ ${x} ≤ 1.7, so the bond is polar covalent`
        : `${x} is above 1.7, so the bond is mostly ionic`;
  if (en1 === en2) return `${kind}; neither atom pulls harder`;
  const z = en1 > en2 ? z1 : z2;
  return `${kind}; Z = ${z} (${element(z)?.name.toLowerCase()}), the more electronegative, takes δ−`;
}

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
    max: words.max,
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
            work: (v) =>
              v.p === undefined || v.c === undefined ? [] : [bondClass(v.d!, v.p, v.c, v.r!, v.s!)],
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
          d: {
            expr: '{r} − {s}',
            how: 'Subtract to see which is larger, and by how much.',
            work: (v) =>
              v.p === undefined || v.c === undefined ? [] : [trendReason(property, v.p, v.c)],
          },
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
        min: absolute ? 0 : -words.max,
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

/** N − A = S: electrons needed for full shells minus those on hand, halved, are the shared pairs. */
const sharedPairs: Rule = {
  relation: {
    id: 'shared pairs',
    display: '{b} = (2 × {h} + 8 × ({c} + {n} + {o}) − {V})/2',
    vars: ['b', 'h', 'c', 'n', 'o', 'V'],
    residual: (v) => v.b! - (2 * v.h! + 8 * (v.c! + v.n! + v.o!) - v.V!) / 2,
    solve: {
      b: (v) => (2 * v.h! + 8 * (v.c! + v.n! + v.o!) - v.V!) / 2,
      V: (v) => 2 * v.h! + 8 * (v.c! + v.n! + v.o!) - 2 * v.b!,
      h: (v) => (2 * v.b! + v.V! - 8 * (v.c! + v.n! + v.o!)) / 2,
      c: (v) => (2 * v.b! + v.V! - 2 * v.h!) / 8 - v.n! - v.o!,
      n: (v) => (2 * v.b! + v.V! - 2 * v.h!) / 8 - v.c! - v.o!,
      o: (v) => (2 * v.b! + v.V! - 2 * v.h!) / 8 - v.c! - v.n!,
    },
  },
  steps: {
    b: {
      expr: '(2 × {h} + 8 × ({c} + {n} + {o}) − {V})/2',
      how: 'Electrons needed for full shells (2 for H, 8 for the others) minus the valence electrons you have, halved, are the shared pairs.',
    },
    V: {
      expr: '2 × {h} + 8 × ({c} + {n} + {o}) − 2 × {b}',
      how: 'Each shared pair counts for two atoms, so the electrons needed less two per pair are the ones on hand.',
    },
    h: {
      expr: '(2 × {b} + {V} − 8 × ({c} + {n} + {o}))/2',
      how: 'Undo the shared-pair rule: what is left of the electrons needed fills hydrogen’s 2 each.',
    },
    c: {
      expr: '(2 × {b} + {V} − 2 × {h})/8 − {n} − {o}',
      how: 'Undo the shared-pair rule: each atom other than H needs 8.',
    },
    n: {
      expr: '(2 × {b} + {V} − 2 × {h})/8 − {c} − {o}',
      how: 'Undo the shared-pair rule: each atom other than H needs 8.',
    },
    o: {
      expr: '(2 × {b} + {V} − 2 × {h})/8 − {c} − {n}',
      how: 'Undo the shared-pair rule: each atom other than H needs 8.',
    },
  },
};

const LEWIS_RULES: Rule[] = [
  valenceSum,
  sharedPairs,
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

/** The lowest common multiple of two whole numbers. */
const lcm = (a: number, b: number) => (a * b) / gcd(a, b);

/**
 * An ionic compound's formula from its ions' charges: the electrons moved are the lowest common
 * multiple of the two charges, so a metal ions give them and b nonmetal ions take them.
 */
const IONIC: ModuleDef = {
  id: 's.10.bonding~ionic',
  title: 'The formula of an ionic compound',
  use: 'Use this to find an ionic compound’s formula from the charges of its ions: Mg²⁺ with Cl⁻ is MgCl₂, Al³⁺ with O²⁻ is Al₂O₃.',
  assumptions: [
    'The metal gives electrons and the nonmetal takes them: the total positive charge equals the total negative charge.',
    'The formula uses the lowest whole-number ratio of ions.',
    'The picture draws Na⁺, Mg²⁺ or Al³⁺ for a charge of 1, 2 or 3, and Cl⁻, O²⁻ or N³⁻ for the nonmetal.',
  ],
  variables: [
    whole('cp', 'c₊', 'Charge of the metal ion', 1, 3),
    whole('cn', 'c₋', 'Size of the nonmetal ion’s charge', 1, 3),
    { ...whole('t', 't', 'Electrons moved', 1, 6), derived: true },
    { ...whole('a', 'a', 'Metal ions in the formula', 1, 3), derived: true },
    { ...whole('b', 'b', 'Nonmetal ions in the formula', 1, 3), derived: true },
  ],
  ...rules(
    {
      relation: {
        id: 't = lcm(c₊, c₋)',
        display: '{t} = least common multiple of {cp} and {cn}',
        vars: ['t', 'cp', 'cn'],
        residual: (v) => v.t! - lcm(v.cp!, v.cn!),
        solve: { t: (v) => lcm(v.cp!, v.cn!), cp: () => undefined, cn: () => undefined },
      },
      steps: {
        t: {
          expr: 'least common multiple of {cp} and {cn}',
          how: 'The electrons given must equal the electrons taken: the smallest number both charges go into.',
        },
      },
    },
    {
      relation: {
        id: 'a = t ÷ c₊',
        display: '{a} = {t}/{cp}',
        vars: ['a', 't', 'cp'],
        residual: (v) => v.a! * v.cp! - v.t!,
        solve: { a: (v) => div(v.t!, v.cp!), t: (v) => v.a! * v.cp!, cp: (v) => div(v.t!, v.a!) },
      },
      steps: {
        a: { expr: '{t}/{cp}', how: 'Each metal ion gives as many electrons as its charge.' },
        t: { expr: '{a} × {cp}', how: 'The metal ions give their charge each.' },
        cp: { expr: '{t}/{a}', how: 'Share the electrons among the metal ions.' },
      },
    },
    {
      relation: {
        id: 'b = t ÷ c₋',
        display: '{b} = {t}/{cn}',
        vars: ['b', 't', 'cn'],
        residual: (v) => v.b! * v.cn! - v.t!,
        solve: { b: (v) => div(v.t!, v.cn!), t: (v) => v.b! * v.cn!, cn: (v) => div(v.t!, v.b!) },
      },
      steps: {
        b: {
          expr: '{t}/{cn}',
          how: 'Each nonmetal ion takes as many electrons as its charge.',
          work: (v) => (v.a === undefined ? [] : [formulaLine(v.a, v.b!)]),
        },
        t: { expr: '{b} × {cn}', how: 'The nonmetal ions take their charge each.' },
        cn: { expr: '{t}/{b}', how: 'Share the electrons among the nonmetal ions.' },
      },
    },
  ),
  example: { cp: 2, cn: 1, t: 2, a: 1, b: 2 },
  startWith: ['cp', 'cn'],
  sliders: true,
  representation: {
    kind: 'lewisStructure',
    mode: 'ionic',
    metal: 'Mg',
    nonmetal: 'Cl',
    metals: 'a',
    nonmetals: 'b',
    transferred: 't',
    charges: { metal: 'cp', nonmetal: 'cn' },
  },
};

/** "a = 2, b = 3: M₂X₃, as in Al₂O₃", the formula the counts write. */
function formulaLine(a: number, b: number): string {
  const sub = (k: number) => (k === 1 ? '' : subscript(String(k)));
  const EXAMPLES: Record<string, string> = {
    '1,1': 'NaCl',
    '1,2': 'MgCl₂',
    '1,3': 'AlCl₃',
    '2,1': 'Na₂O',
    '2,3': 'Al₂O₃',
    '3,1': 'Na₃N',
    '3,2': 'Mg₃N₂',
  };
  const like = EXAMPLES[`${a},${b}`];
  return `The formula is M${sub(a)}X${sub(b)}${like ? `, as in ${like}` : ''}`;
}

const BONDING: ModuleDef[] = [
  {
    id: 's.10.bonding',
    assumptions: [
      'Each atom but hydrogen ends with 8 electrons around it; hydrogen with 2.',
      'A shared pair counts for both atoms, so the electrons needed minus those on hand are two per shared pair.',
      'Two or three shared pairs make a double or triple bond.',
      'The drawn molecules are H₂O, NH₃, CH₄, CO₂, HCN, CH₂O, H₂, O₂ and N₂; the rule works for any molecule whose atoms all reach full shells.',
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
  IONIC,
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
      'Electron domains spread as far apart as they can; a double bond counts as one domain.',
      'Lone pairs push harder than bonds, so angles shrink: the angles are measured ones, such as water’s 104.5° and ammonia’s 107°.',
      'A molecule is polar when its bond dipoles don’t cancel.',
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
            work: (v) => {
              const shape = shapeOf(v.b!, v.l!);
              if (!shape) return [];
              const lone =
                v.l === 0 ? 'no lone pairs' : v.l === 1 ? '1 lone pair' : `${v.l} lone pairs`;
              return [
                `${v.b! + v.l!} domains: ${shape.domains}; ${lone}, so the shape is ${shape.name}, like ${subscript(shape.example.formula)}`,
              ];
            },
          },
        },
      },
    ),
    example: { b: 2, l: 2, d: 4, a: shapeOf(2, 2)!.angle },
    startWith: ['b', 'l'],
    pictureLabels: ['d'],
    sliders: true,
    representation: { kind: 'vsepr', bonded: 'b', lone: 'l', angle: 'a', polar: true },
  },
];

// ─── Reaction types: balancing ───────────────────────────────────────────────

/** out = k × of: a coefficient or an atom count that follows another by a fixed ratio. */
const scaled = (
  out: string,
  k: number,
  of: string,
  how: [string, string],
  text?: [string, string],
): Rule => {
  // `text` writes a fraction the way a class does: {a}/2, not 0.5 × {a} (and back, 2 × {c}).
  const [fwd, back] = text ?? [
    k === 1 ? `{${of}}` : `${k} × {${of}}`,
    k === 1 ? `{${out}}` : `{${out}}/${k}`,
  ];
  return {
    relation: {
      id: `${out} = ${k} × ${of}`,
      display: `{${out}} = ${fwd}`,
      vars: [out, of],
      residual: (v) => v[out]! - k * v[of]!,
      solve: { [out]: (v) => k * v[of]!, [of]: (v) => v[out]! / k },
    },
    steps: {
      [out]: { expr: fwd, how: how[0] },
      [of]: { expr: back, how: how[1] },
    },
  };
};

const coefficient = (id: string, name: string, min: number, max: number) =>
  whole(id, id, name, min, max);

/**
 * A hydrocarbon CₓHᵧ burning: a CₓHᵧ + b O₂ → c CO₂ + d H₂O. Carbon first (c = ax), hydrogen
 * next (d = ay/2), oxygen last (b = c + d/2); a is 2 when y is not a multiple of 4, so that
 * b comes out whole.
 */
function combustionPage(
  id: string,
  title: string,
  use: string,
  bond: 'single' | 'double',
  x: number,
): ModuleDef {
  const k = bond === 'single' ? 2 : 0;
  const y = 2 * x + k;
  const a = y % 4 === 0 ? 1 : 2;
  return {
    id,
    title,
    use,
    unitSystems: ['metric'],
    assumptions: [
      'A hydrocarbon burns in oxygen to make carbon dioxide and water; coefficients count molecules, subscripts never change.',
      `An ${bond === 'single' ? 'alkane' : 'alkene'} has ${bond === 'single' ? '2x + 2' : '2x'} hydrogen atoms for x carbon atoms.`,
      'Balance carbon first, then hydrogen, and oxygen last, since O₂ appears alone.',
      'When the hydrogens are not a multiple of 4, the O₂ would come out as a half: double the fuel.',
    ],
    variables: [
      whole('x', 'x', 'Carbon atoms in the fuel', bond === 'single' ? 1 : 2, 8),
      whole('y', 'y', 'Hydrogen atoms in the fuel', 2, 18),
      { ...coefficient('a', 'Fuel molecules', 1, 2), derived: true },
      { ...coefficient('b', 'Oxygen molecules', 1, 50), derived: true },
      { ...coefficient('c', 'Carbon dioxide molecules', 1, 16), derived: true },
      { ...coefficient('d', 'Water molecules', 1, 18), derived: true },
    ],
    ...rules(
      {
        relation: {
          id: 'hydrogens',
          display: k ? `{y} = 2 × {x} + ${k}` : '{y} = 2 × {x}',
          vars: ['y', 'x'],
          residual: (v) => v.y! - hydrogensOf(v.x!, bond),
          solve: { y: (v) => hydrogensOf(v.x!, bond), x: (v) => (v.y! - k) / 2 },
        },
        steps: {
          y: {
            expr: k ? `2 × {x} + ${k}` : '2 × {x}',
            how:
              bond === 'single'
                ? 'Each carbon holds 2 hydrogens, and the two ends 1 more each.'
                : 'Each carbon holds 2 hydrogens and the ends 2 more; the double bond takes 2 away.',
          },
          x: { expr: k ? `({y} − ${k})/2` : '{y}/2', how: 'Undo the rule for the hydrogens.' },
        },
      },
      {
        relation: {
          id: 'fuel molecules',
          display: '{a} = 1 if {y} is a multiple of 4, else 2',
          vars: ['a', 'y'],
          residual: (v) => v.a! - (v.y! % 4 === 0 ? 1 : 2),
          solve: { a: (v) => (v.y! % 4 === 0 ? 1 : 2), y: () => undefined },
        },
        steps: {
          a: {
            expr: '1 if {y} is a multiple of 4, else 2',
            how: 'Each O₂ brings 2 oxygen atoms. With one fuel molecule the water’s oxygen would leave half an O₂ unless the hydrogens are a multiple of 4.',
          },
        },
      },
      {
        relation: {
          id: 'c = a × x',
          display: '{c} = {a} × {x}',
          vars: ['c', 'a', 'x'],
          residual: (v) => v.c! - v.a! * v.x!,
          solve: { c: (v) => v.a! * v.x!, x: (v) => div(v.c!, v.a!), a: (v) => div(v.c!, v.x!) },
        },
        steps: {
          c: { expr: '{a} × {x}', how: 'Carbon first: one CO₂ for each carbon atom in the fuel.' },
          x: { expr: '{c}/{a}', how: 'Share the CO₂ among the fuel molecules.' },
          a: { expr: '{c}/{x}', how: 'Each fuel molecule makes x CO₂.' },
        },
      },
      {
        relation: {
          id: 'd = a × y ÷ 2',
          display: '{d} = {a} × {y}/2',
          vars: ['d', 'a', 'y'],
          residual: (v) => 2 * v.d! - v.a! * v.y!,
          solve: {
            d: (v) => (v.a! * v.y!) / 2,
            y: (v) => div(2 * v.d!, v.a!),
            a: (v) => div(2 * v.d!, v.y!),
          },
        },
        steps: {
          d: {
            expr: '{a} × {y}/2',
            how: 'Hydrogen next: each H₂O takes 2 of the fuel’s hydrogen atoms.',
          },
          y: { expr: '2 × {d}/{a}', how: 'Each water holds 2 hydrogen atoms.' },
          a: { expr: '2 × {d}/{y}', how: 'Each fuel molecule makes y/2 waters.' },
        },
      },
      {
        relation: {
          id: 'b = c + d ÷ 2',
          display: '{b} = {c} + {d}/2',
          vars: ['b', 'c', 'd'],
          residual: (v) => 2 * v.b! - (2 * v.c! + v.d!),
          solve: {
            b: (v) => v.c! + v.d! / 2,
            c: (v) => v.b! - v.d! / 2,
            d: (v) => 2 * (v.b! - v.c!),
          },
        },
        steps: {
          b: {
            expr: '{c} + {d}/2',
            how: 'Oxygen last: 2 atoms in each CO₂ and 1 in each H₂O, halved because each O₂ brings 2.',
            work: (v) => [
              `${2 * v.c!} + ${v.d} = ${2 * v.c! + v.d!} oxygen atoms on the right, so ${fmt(v.b!)} O₂ on the left`,
            ],
          },
          c: { expr: '{b} − {d}/2', how: 'Oxygen last: what the water leaves, 2 per CO₂.' },
          d: { expr: '2 × ({b} − {c})', how: 'Oxygen last: what the CO₂ leaves.' },
        },
      },
    ),
    example: { x, y, a, b: a * x + (a * y) / 4, c: a * x, d: (a * y) / 2 },
    startWith: ['x'],
    equation: '{a:coef} C_{x}H_{y} + {b:coef} O₂ → {c:coef} CO₂ + {d:coef} H₂O',
    representation: {
      kind: 'reaction',
      reactants: [
        { formula: 'C{x}H{y}', count: 'a' },
        { formula: 'O2', count: 'b' },
      ],
      products: [
        { formula: 'CO2', count: 'c' },
        { formula: 'H2O', count: 'd' },
      ],
      most: 25,
    },
  };
}

const BALANCING: ModuleDef[] = [
  combustionPage(
    's.10.reaction-types~combustion',
    'Balancing the combustion of an alkane',
    'Use this to balance any alkane burning, such as “C₃H₈ + O₂ → CO₂ + H₂O”: carbon first, hydrogen next, oxygen last.',
    'single',
    3,
  ),
  combustionPage(
    's.10.reaction-types~combustion-alkene',
    'Balancing the combustion of an alkene',
    'Use this to balance an alkene burning, such as “C₅H₁₀ + O₂ → CO₂ + H₂O”, where the fuel’s coefficient must be 2.',
    'double',
    5,
  ),
  {
    id: 's.10.reaction-types~synthesis',
    title: 'Balancing a synthesis: aluminum oxide',
    use: 'Use this for “Balance Al + O₂ → Al₂O₃.”',
    unitSystems: ['metric'],
    assumptions: [
      'Aluminum burns in oxygen to make aluminum oxide, one product from two reactants.',
      'Oxygen comes in pairs and Al₂O₃ holds 3, so the oxygen atoms must be a multiple of 6: 4 aluminum atoms at a time.',
      'The balanced equation uses the smallest whole numbers, 4, 3 and 2; larger inputs are the same reaction run more times.',
      'Aluminum oxide is ionic: each formula unit is two Al³⁺ and three O²⁻, drawn as ions with no bonds.',
    ],
    variables: [
      { ...coefficient('a', 'Aluminum atoms', 4, 16), multipleOf: 4 },
      { ...coefficient('b', 'Oxygen molecules', 0, 12), derived: true },
      { ...coefficient('c', 'Aluminum oxide formula units', 0, 8), derived: true },
    ],
    ...rules(
      scaled(
        'c',
        0.5,
        'a',
        [
          'Aluminum: each Al₂O₃ holds 2 aluminum atoms, so half as many formula units as atoms.',
          'Aluminum: 2 atoms for each Al₂O₃.',
        ],
        ['{a}/2', '2 × {c}'],
      ),
      scaled(
        'b',
        1.5,
        'c',
        [
          'Oxygen: each Al₂O₃ holds 3 oxygen atoms and each O₂ brings 2.',
          'Oxygen: 3 O₂ bring the 6 oxygen atoms of 2 Al₂O₃.',
        ],
        ['3 × {c}/2', '2 × {b}/3'],
      ),
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
      ions: true,
      most: 16,
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
      'The balanced equation uses the smallest whole numbers, 1, 2, 1 and 1; larger inputs are the same reaction run more times.',
      'Zinc chloride is ionic: one Zn²⁺ and two Cl⁻, drawn as ions with no shared bonds.',
    ],
    variables: [
      coefficient('a', 'Zinc atoms', 1, 8),
      { ...coefficient('b', 'Hydrogen chloride molecules', 0, 16), derived: true },
      { ...coefficient('c', 'Zinc chloride formula units', 0, 8), derived: true },
      { ...coefficient('d', 'Hydrogen molecules', 0, 8), derived: true },
    ],
    ...rules(
      scaled('c', 1, 'a', ['Zinc: one ZnCl₂ for each zinc atom.', 'Zinc: one atom per ZnCl₂.']),
      scaled('b', 2, 'c', [
        'Chlorine: each ZnCl₂ holds 2, and each HCl brings 1.',
        'Chlorine: one ZnCl₂ for every 2 HCl.',
      ]),
      scaled(
        'd',
        0.5,
        'b',
        ['Hydrogen: the HCl’s hydrogen atoms pair up as H₂.', 'Hydrogen: 2 HCl for each H₂.'],
        ['{b}/2', '2 × {d}'],
      ),
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
      ions: true,
      most: 16,
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
    [n]: { expr: `{${out}}/${over(kText)}`, how: back },
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

const MOLES = quantity('n', 'n', 'Amount', 'mol', 0.000001, 100000, 0.000001);
const PARTICLE_COUNT = quantity('N', 'N', 'Particles', undefined, 6e17, 6e28, 1e16, {
  scientific: true,
});
const grams = (id = 'm', name = 'Mass', symbol = id) =>
  quantity(id, symbol, name, 'g', 0.001, 100000, 0.001);

/** Atomic masses the molar-mass pages use, in g/mol, and as the steps write them. */
const MASS = { C: 12.01, H: 1.008, O: 16.0 };
const MASS_TEXT = { C: '12.01', H: '1.008', O: '16.00' };

/** An element's percent of a compound's mass: p = k × count ÷ M × 100. */
const percentRule = (p: string, count: string, el: 'C' | 'H' | 'O'): Rule => {
  const k = MASS[el];
  const kt = MASS_TEXT[el];
  return {
    relation: {
      id: `percent ${el}`,
      display: `{${p}} = ${kt} × {${count}}/{M} × 100`,
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
        expr: `${kt} × {${count}}/{M} × 100`,
        how: `The ${el} atoms’ mass as a share of the whole formula’s mass.`,
      },
      [count]: { expr: `{${p}} × {M}/(100 × ${kt})`, how: `Divide that mass by ${kt} g.` },
      M: { expr: `${kt} × {${count}} × 100/{${p}}`, how: 'Scale the part up to the whole.' },
    },
  };
};

/** Moles of an element in 100 g of the compound: n = p ÷ atomic mass (the percent is grams). */
const molesIn100 = (n: string, p: string, el: 'C' | 'H' | 'O'): Rule => {
  const [k, kt] = [MASS[el], MASS_TEXT[el]];
  return {
    relation: {
      id: `moles of ${el} in 100 g`,
      display: `{${n}} = {${p}} ÷ ${kt}`,
      vars: [n, p],
      residual: (v) => v[p]! - k * v[n]!,
      solve: { [n]: (v) => v[p]! / k, [p]: (v) => k * v[n]! },
    },
    steps: {
      [n]: {
        expr: `{${p}} ÷ ${kt}`,
        how: `In 100 g the percent is grams: divide by ${kt} g per mole of ${el}.`,
        work: (v) => [
          `${fmt(v[p]!)}% of 100 g is ${fmt(v[p]!)} g of ${el}`,
          `${fmt(v[p]!)} g ÷ ${kt} g/mol = ${fmt(v[p]! / k)} mol`,
        ],
      },
      [p]: {
        expr: `${kt} × {${n}}`,
        how: `Each mole of ${el} atoms is ${kt} g, and in 100 g the grams are the percent.`,
      },
    },
  };
};

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
      quantity('m', 'm', 'Mass', 'g', 0.001, 1e6, 0.001),
      quantity('M', 'M', 'Molar mass', 'g/mol', 1, 1000, 0.01),
      quantity('n', 'n', 'Amount', 'mol', 0.000001, 1e6, 0.000001),
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
        n: {
          expr: '{m} ÷ {M}',
          how: 'Multiply by 1 mol over M grams: the grams cancel.',
          work: ['{m} g × 1 mol/{M} g: the grams cancel, leaving mol'],
        },
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
        work: (v) => {
          const [x, y] = [v.a! / p, v.b! / q];
          const [X, Y] = [subscript(fx), subscript(fy)];
          const line = `${v.a} ÷ ${p} = ${fmt(x)} for ${X}, ${v.b} ÷ ${q} = ${fmt(y)} for ${Y}`;
          if (x === y) return [`${line}: both run out together`];
          return [`${line}: ${x < y ? X : Y} is the limiting reactant`];
        },
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
      { ...whole('r', 'r', 'Times the reaction happens', 0, 12), derived: true },
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

/** out = x ÷ k or x × k with a fixed factor k: grams to moles, moles to grams, a mole ratio. */
const scaleBy = (
  out: string,
  x: string,
  k: number,
  kText: string,
  how: [string, string],
): Rule => ({
  relation: {
    id: `${out} = ${x} × ${kText}`,
    display: `{${out}} = {${x}} × ${kText}`,
    vars: [out, x],
    residual: (v) => v[out]! - v[x]! * k,
    solve: { [out]: (v) => v[x]! * k, [x]: (v) => v[out]! / k },
  },
  steps: {
    [out]: { expr: `{${x}} × ${kText}`, how: how[0] },
    [x]: { expr: `{${out}}/(${kText})`, how: how[1] },
  },
});

/** Molar masses from the table, to 2 decimals (molarMassOf): N₂ 28.01, H₂ 2.02, NH₃ 17.03. */
const M_N2 = 28.01;
const M_H2 = 2.02;
const M_NH3 = 17.03;

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
    id: 's.10.stoichiometry~limiting-grams',
    title: 'The limiting reactant from grams',
    use: 'Use this for “28.01 g of N₂ and 5.05 g of H₂ react. How many grams of NH₃ form?”',
    unitSystems: ['metric'],
    assumptions: [
      'The equation is balanced: N₂ + 3 H₂ → 2 NH₃.',
      'Grams can’t be compared directly: change each to moles, then to the product’s moles.',
      'The reactant that makes less product runs out first: it is the limiting reactant.',
    ],
    variables: [
      quantity('m1', 'm₁', 'Mass of N₂', 'g', 0.01, 10000),
      quantity('m2', 'm₂', 'Mass of H₂', 'g', 0.01, 10000),
      { ...quantity('n1', 'n₁', 'Moles of N₂', 'mol', 0.0001, 1000, 0.0001), derived: true },
      { ...quantity('n2', 'n₂', 'Moles of H₂', 'mol', 0.0001, 1000, 0.0001), derived: true },
      {
        ...quantity('y1', 'y₁', 'NH₃ the N₂ could make', 'mol', 0.0001, 2000, 0.0001),
        derived: true,
      },
      {
        ...quantity('y2', 'y₂', 'NH₃ the H₂ could make', 'mol', 0.0001, 2000, 0.0001),
        derived: true,
      },
      { ...quantity('n', 'n', 'Moles of NH₃ made', 'mol', 0.0001, 2000, 0.0001), derived: true },
      { ...quantity('m', 'm', 'Mass of NH₃ made', 'g', 0.001, 40000, 0.01), derived: true },
    ],
    ...rules(
      scaleBy('n1', 'm1', 1 / M_N2, `1/${M_N2}`, [
        `Divide the grams of N₂ by its molar mass, ${M_N2} g/mol.`,
        `Multiply the moles by ${M_N2} g/mol.`,
      ]),
      scaleBy('n2', 'm2', 1 / M_H2, `1/${M_H2}`, [
        `Divide the grams of H₂ by its molar mass, ${M_H2} g/mol.`,
        `Multiply the moles by ${M_H2} g/mol.`,
      ]),
      scaleBy('y1', 'n1', 2, '2', [
        'Mole ratio: 1 N₂ makes 2 NH₃.',
        'Mole ratio: 2 NH₃ come from 1 N₂.',
      ]),
      scaleBy('y2', 'n2', 2 / 3, '2/3', [
        'Mole ratio: 3 H₂ make 2 NH₃.',
        'Mole ratio: 2 NH₃ come from 3 H₂.',
      ]),
      {
        relation: {
          id: 'n = smaller yield',
          display: '{n} = the smaller of {y1} and {y2}',
          vars: ['n', 'y1', 'y2'],
          residual: (v) => v.n! - Math.min(v.y1!, v.y2!),
          solve: { n: (v) => Math.min(v.y1!, v.y2!), y1: () => undefined, y2: () => undefined },
        },
        steps: {
          n: {
            expr: 'the smaller of {y1} and {y2}',
            how: 'The reaction stops when the limiting reactant runs out, so only the smaller amount forms.',
          },
        },
      },
      scaleBy('m', 'n', M_NH3, String(M_NH3), [
        `Multiply the moles of NH₃ by its molar mass, ${M_NH3} g/mol.`,
        `Divide the grams by ${M_NH3} g/mol.`,
      ]),
    ),
    example: {
      m1: 28.01,
      m2: 5.05,
      n1: 1,
      n2: 2.5,
      y1: 2,
      y2: 5 / 3,
      n: 5 / 3,
      m: (5 / 3) * M_NH3,
    },
    startWith: ['m1', 'm2'],
    representation: {
      kind: 'moleMap',
      formula: 'NH3',
      moles: 'n',
      mass: 'm',
      limiting: {
        coef: 2,
        reactants: [
          { formula: 'N2', coef: 1, mass: 'm1', moles: 'n1', yields: 'y1' },
          { formula: 'H2', coef: 3, mass: 'm2', moles: 'n2', yields: 'y2' },
        ],
      },
    },
  },
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

const IDEAL = 'The gas is ideal: its particles take up no room and do not attract each other.';
const KELVINS = 'Temperatures are in kelvins: add 273 to °C.';

/** T = t + 273: a temperature typed in °C, changed to kelvins for the gas laws. */
const toKelvin = (T: string, t: string): Rule => ({
  relation: {
    id: `${T} = ${t} + 273`,
    display: `{${T}} = {${t}} + 273`,
    vars: [T, t],
    residual: (v) => v[T]! - (v[t]! + 273),
    solve: { [T]: (v) => v[t]! + 273, [t]: (v) => v[T]! - 273 },
  },
  steps: {
    [T]: { expr: `{${t}} + 273`, how: 'Kelvins start at absolute zero, 273 degrees below 0 °C.' },
    [t]: { expr: `{${T}} − 273`, how: 'Take 273 off the kelvins for °C.' },
  },
});
const celsiusOf = (k: string): VariableDef => ({
  id: `t${k}`,
  symbol: `t${SUB[k]}`,
  name: `Temperature${when(k)} in °C`,
  unit: '°C',
  units: ['°C'],
  min: -272,
  max: 1727,
  step: 1,
});

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
      { ...pressure(''), min: 0.001 },
      volume('', ['L']),
      { ...quantity('n', 'n', 'Amount of gas', 'mol', 0.001, 100, 0.001) },
      kelvins(''),
      celsiusOf(''),
    ],
    ...rules(ideal, toKelvin('T', 't')),
    example: { P: 2, V: 24.63, n: 2, T: 300, t: 27 },
    startWith: ['n', 'T', 'V'],
    pictureLabels: ['t'],
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
    assumptions: [
      IDEAL,
      'Pressures are in atm; both volumes are in the same unit.',
      'The temperature and the amount of gas stay the same.',
    ],
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
    assumptions: [IDEAL, KELVINS, 'The pressure and the amount of gas stay the same.'],
    variables: [
      volume('1'),
      kelvins('1'),
      volume('2'),
      kelvins('2'),
      celsiusOf('1'),
      celsiusOf('2'),
    ],
    ...rules(charles, toKelvin('T1', 't1'), toKelvin('T2', 't2')),
    example: { V1: 2, T1: 300, V2: 3, T2: 450, t1: 27, t2: 177 },
    startWith: ['V1', 'T1', 'T2'],
    pictureLabels: ['t1', 't2'],
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
    assumptions: [IDEAL, KELVINS, 'The volume and the amount of gas stay the same.'],
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
    assumptions: [IDEAL, `${KELVINS} Pressures are in atm.`, 'The amount of gas stays the same.'],
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
  {
    id: 's.10.gas-laws~effusion',
    title: 'Effusion: Graham’s law',
    use: 'Use this for “Hydrogen and oxygen leak from one balloon. Which escapes faster, and how many times as fast?”',
    unitSystems: ['metric'],
    assumptions: [
      'Both gases are at the same temperature, so their molecules have the same average kinetic energy.',
      'Lighter molecules move faster, so they find the pinhole more often.',
      'rate₁ ÷ rate₂ = √(M₂ ÷ M₁).',
    ],
    variables: [
      quantity('M1', 'M₁', 'Molar mass of H₂', 'g/mol', 0.1, 1000, 0.001),
      quantity('M2', 'M₂', 'Molar mass of O₂', 'g/mol', 0.1, 1000, 0.001),
      {
        ...quantity('r', 'r', 'How many times as fast H₂ escapes', undefined, 0.01, 100, 0.01),
        derived: true,
      },
    ],
    ...rules({
      relation: {
        id: 'r = √(M2/M1)',
        display: '{r} = √({M2}/{M1})',
        vars: ['r', 'M1', 'M2'],
        residual: (v) => v.r! * v.r! * v.M1! - v.M2!,
        solve: {
          r: (v) => (v.M1! > 0 && v.M2! > 0 ? Math.sqrt(v.M2! / v.M1!) : undefined),
          M1: (v) => (v.r! > 0 ? v.M2! / (v.r! * v.r!) : undefined),
          M2: (v) => v.r! * v.r! * v.M1!,
        },
      },
      steps: {
        r: {
          expr: '√({M2}/{M1})',
          how: 'Graham’s law: the rate goes as 1 over the square root of the molar mass.',
        },
        M1: { expr: '{M2}/{r}²', how: 'Square the ratio and divide it into M₂.' },
        M2: { expr: '{r}² × {M1}', how: 'Square the ratio and multiply by M₁.' },
      },
    }),
    example: { M1: 2.016, M2: 32, r: Math.sqrt(32 / 2.016) },
    startWith: ['M1', 'M2'],
    representation: {
      kind: 'chemDiagram',
      mode: 'effusion',
      gases: [
        { formula: 'H2', molarMass: 'M1' },
        { formula: 'O2', molarMass: 'M2' },
      ],
      ratio: 'r',
    },
  },
];

// ─── Molarity ────────────────────────────────────────────────────────────────

const molarityVar = (id: string, symbol: string, name: string): VariableDef => ({
  id,
  symbol,
  name,
  unit: 'mol/L',
  min: 0.000001,
  max: 20,
  step: 0.000001,
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
            work: (v) => [
              v.r! > 0
                ? `r = ${fmt(v.r!)} g is above 0, so the solution is unsaturated`
                : v.r === 0
                  ? 'r = 0 g, so the solution is just saturated'
                  : `r is below 0, so the solution is saturated and ${fmt(-v.r!)} g settles out`,
            ],
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

/** The q step with a line saying what the reaction did: the water's heat, with the sign turned. */
const gaveOff = (r: Rule): Rule => ({
  ...r,
  steps: {
    ...r.steps,
    q: {
      ...r.steps.q!,
      work: (v) =>
        v.q === 0
          ? ['No heat moved: the temperature did not change']
          : v.q! > 0
            ? [`The reaction gave off ${fmt(v.q!)} J (qᵣₓₙ = −${fmt(v.q!)} J)`]
            : [`The reaction took in ${fmt(-v.q!)} J (qᵣₓₙ = ${fmt(-v.q!)} J)`],
    },
  },
});

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
    m: { expr: `{${q}}/${over(kText)}`, how: 'Divide the stage’s heat by the heat per gram.' },
  },
});

/** An enthalpy on the ladder pages, in kJ to a tenth. */
const ladderKJ = (id: string, symbol: string, name: string): VariableDef =>
  quantity(id, symbol, name, 'kJ', -100000, 100000, 0.1);

/** out = a + b, or out = a − b. */
const addRule = (
  out: string,
  a: string,
  b: string,
  op: '+' | '−',
  how: [string, string, string],
): Rule => {
  const s = op === '+' ? 1 : -1;
  return {
    relation: {
      id: `${out} = ${a} ${op} ${b}`,
      display: `{${out}} = {${a}} ${op} {${b}}`,
      vars: [out, a, b],
      residual: (v) => v[out]! - (v[a]! + s * v[b]!),
      solve: {
        [out]: (v) => v[a]! + s * v[b]!,
        [a]: (v) => v[out]! - s * v[b]!,
        [b]: (v) => s * (v[out]! - v[a]!),
      },
    },
    steps: {
      [out]: { expr: `{${a}} ${op} {${b}}`, how: how[0] },
      [a]: { expr: op === '+' ? `{${out}} − {${b}}` : `{${out}} + {${b}}`, how: how[1] },
      [b]: { expr: op === '+' ? `{${out}} − {${a}}` : `{${a}} − {${out}}`, how: how[2] },
    },
  };
};

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
    ...rules(...CALORIMETER_RULES.map((r) => (r.relation.id === 'q = mcΔT' ? gaveOff(r) : r))),
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
    use: 'Use this for the heat to warm ice to 0 °C, melt it, warm the water to 100 °C and boil it away.',
    unitSystems: ['metric'],
    assumptions: [
      'Ice 2.09, water 4.18 J/(g·°C); melting takes 334 J/g and boiling 2260 J/g.',
      'While ice melts or water boils, the temperature stays flat: the heat breaks attractions instead.',
    ],
    variables: [
      quantity('m', 'm', 'Mass of water', 'g', 0.1, 1000, 0.1),
      quantity('t0', 'T₀', 'Starting temperature of the ice', '°C', -50, -0.1, 0.1),
      quantity('q1', 'q₁', 'Heat to warm the ice to 0 °C', 'J', 0, 1e7, 0.1),
      quantity('q2', 'q₂', 'Heat to melt the ice', 'J', 0, 1e7, 0.1),
      quantity('q3', 'q₃', 'Heat to warm the water to 100 °C', 'J', 0, 1e7, 0.1),
      quantity('q4', 'q₄', 'Heat to boil the water', 'J', 0, 1e8, 0.1),
      quantity('q', 'q', 'Total heat', 'J', 0, 1e8, 0.1),
    ],
    ...rules(
      {
        relation: {
          id: 'q₁ = m × 2.09 × (0 − T₀)',
          display: '{q1} = {m} × 2.09 × (0 − {t0})',
          vars: ['q1', 'm', 't0'],
          residual: (v) => v.q1! - v.m! * 2.09 * -v.t0!,
          solve: {
            q1: (v) => v.m! * 2.09 * -v.t0!,
            m: (v) => div(v.q1!, -2.09 * v.t0!),
            t0: (v) => div(-v.q1!, 2.09 * v.m!),
          },
        },
        steps: {
          q1: {
            expr: '{m} × 2.09 × (0 − {t0})',
            how: 'Ice warms from its start to 0 °C at 2.09 J for each gram and degree.',
          },
          m: { expr: '{q1}/(2.09 × (0 − {t0}))', how: 'Divide the heat by the heat per gram.' },
          t0: {
            expr: '0 − {q1}/(2.09 × {m})',
            how: 'The ice warmed q₁ ÷ 2.09m degrees to reach 0 °C.',
          },
        },
      },
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
    example: { m: 10, t0: -10, q1: 209, q2: 3340, q3: 4180, q4: 22600, q: 30329 },
    startWith: ['m', 't0'],
    pictureLabels: ['m', 'q'],
    representation: {
      kind: 'heatingCurve',
      start: 't0',
      melt: 0,
      boil: 100,
      spans: ['q1', 'q2', 'q3', 'q4'],
      names: ['ice', 'water', 'steam'],
      units: { time: 'J' },
      formula: 'H2O',
    },
  },
  {
    id: 's.10.thermochemistry~formation',
    title: 'ΔH from heats of formation',
    use: 'Use this for “Find ΔH for CH₄ + 2O₂ → CO₂ + 2H₂O from the heats of formation.”',
    unitSystems: ['metric'],
    assumptions: [
      'An element in its standard state has a heat of formation of 0, so O₂ adds nothing.',
      'Each heat of formation is per mole, so multiply it by the coefficient.',
      'The water is liquid.',
    ],
    variables: [
      ladderKJ('f1', 'ΔHf(CH₄)', 'Heat of formation of CH₄'),
      ladderKJ('f2', 'ΔHf(CO₂)', 'Heat of formation of CO₂'),
      ladderKJ('f3', 'ΔHf(H₂O)', 'Heat of formation of H₂O'),
      { ...ladderKJ('Hr', 'Hᵣ', 'Reactants’ heats of formation, added'), derived: true },
      { ...ladderKJ('Hp', 'Hₚ', 'Products’ heats of formation, added'), derived: true },
      { ...ladderKJ('dH', 'ΔH', 'Enthalpy change of the reaction'), derived: true },
    ],
    ...rules(
      {
        relation: {
          id: 'Hr = f1',
          display: '{Hr} = {f1} + 2 × 0',
          vars: ['Hr', 'f1'],
          residual: (v) => v.Hr! - v.f1!,
          solve: { Hr: (v) => v.f1!, f1: (v) => v.Hr! },
        },
        steps: {
          Hr: { expr: '{f1} + 2 × 0', how: 'One CH₄, and O₂ is an element: 0.' },
          f1: { expr: '{Hr} − 2 × 0', how: 'The O₂ adds nothing, so it is all CH₄.' },
        },
      },
      {
        relation: {
          id: 'Hp = f2 + 2 f3',
          display: '{Hp} = {f2} + 2 × {f3}',
          vars: ['Hp', 'f2', 'f3'],
          residual: (v) => v.Hp! - (v.f2! + 2 * v.f3!),
          solve: {
            Hp: (v) => v.f2! + 2 * v.f3!,
            f2: (v) => v.Hp! - 2 * v.f3!,
            f3: (v) => (v.Hp! - v.f2!) / 2,
          },
        },
        steps: {
          Hp: { expr: '{f2} + 2 × {f3}', how: 'One CO₂ and two H₂O, each times its coefficient.' },
          f2: { expr: '{Hp} − 2 × {f3}', how: 'Take the two waters away.' },
          f3: {
            expr: '({Hp} − {f2})/2',
            how: 'Take the CO₂ away and share the rest between two waters.',
          },
        },
      },
      addRule('dH', 'Hp', 'Hr', '−', [
        'Products minus reactants: both are measured from the same elements.',
        'Add the reactants back to ΔH.',
        'The products less ΔH.',
      ]),
    ),
    example: { f1: -74.8, f2: -393.5, f3: -285.8, Hr: -74.8, Hp: -965.1, dH: -890.3 },
    startWith: ['f1', 'f2', 'f3'],
    representation: {
      kind: 'energyProfile',
      mode: 'ladder',
      levels: [
        { name: 'Elements', value: 0 },
        { name: 'CH₄ + 2 O₂', value: 'Hr' },
        { name: 'CO₂ + 2 H₂O', value: 'Hp' },
      ],
      steps: [
        { from: 0, to: 1, value: 'Hr', label: 'Reactants' },
        { from: 0, to: 2, value: 'Hp', label: 'Products' },
      ],
      total: { from: 1, to: 2, value: 'dH' },
    },
  },
  {
    id: 's.10.thermochemistry~hess',
    title: 'Hess’s law: adding steps',
    use: 'Use this for “Find ΔH for C + O₂ → CO₂ from C + ½O₂ → CO and CO₂ → CO + ½O₂.”',
    unitSystems: ['metric'],
    assumptions: [
      'ΔH depends only on where a reaction starts and ends, not on the path.',
      'Reversing an equation flips the sign of its ΔH.',
      'The steps add up to the overall equation: the CO made in step 1 is used in step 2.',
    ],
    variables: [
      ladderKJ('d1', 'ΔH₁', 'Step 1: C + ½O₂ → CO'),
      ladderKJ('g2', 'ΔHgiven', 'Given: CO₂ → CO + ½O₂'),
      { ...ladderKJ('d2', 'ΔH₂', 'Step 2 reversed: CO + ½O₂ → CO₂'), derived: true },
      { ...ladderKJ('dH', 'ΔH', 'Overall: C + O₂ → CO₂'), derived: true },
    ],
    ...rules(
      {
        relation: {
          id: 'd2 = −g2',
          display: '{d2} = −{g2}',
          vars: ['d2', 'g2'],
          residual: (v) => v.d2! + v.g2!,
          solve: { d2: (v) => -v.g2!, g2: (v) => -v.d2! },
        },
        steps: {
          d2: { expr: '−{g2}', how: 'The step is used backwards, so its ΔH changes sign.' },
          g2: { expr: '−{d2}', how: 'The given equation runs the other way: flip the sign.' },
        },
      },
      addRule('dH', 'd1', 'd2', '+', [
        'Hess’s law: add the steps’ ΔH.',
        'The overall change less step 2.',
        'The overall change less step 1.',
      ]),
    ),
    example: { d1: -110.5, g2: 283, d2: -283, dH: -393.5 },
    startWith: ['d1', 'g2'],
    representation: {
      kind: 'energyProfile',
      mode: 'ladder',
      levels: [{ name: 'C + O₂', value: 0 }, { name: 'CO + ½O₂' }, { name: 'CO₂' }],
      steps: [
        { from: 0, to: 1, value: 'd1' },
        { from: 1, to: 2, value: 'd2', flipped: true },
      ],
      total: { from: 0, to: 2, value: 'dH' },
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
            h: (v) => (v.Q! * v.i! === 0 ? undefined : v.p! ** 2 / (v.Q! * v.i!) - v.a!),
            i: (v) => div(v.p! ** 2, v.Q! * (v.h! + v.a!)),
            p: (v) => Math.sqrt(Math.max(0, v.Q! * (v.h! + v.a!) * v.i!)),
          },
        },
        steps: {
          Q: {
            expr: '{p}^2/(({h} + {a}) × {i})',
            how: 'Just after the H₂ goes in, only [H₂] has changed. Compare Q with K.',
            work: (v) => {
              if (v.K === undefined) return [];
              const [Q, K] = [fmt(v.Q!), fmt(v.K)];
              if (Math.abs(v.Q! - v.K) <= 1e-9 * v.K)
                return [`Q = ${Q} equals K, so nothing shifts`];
              return v.Q! < v.K
                ? [`Q = ${Q} is below K = ${K}, so the reaction shifts toward HI (the product)`]
                : [
                    `Q = ${Q} is above K = ${K}, so the reaction shifts toward H₂ and I₂ (the reactants)`,
                  ];
            },
          },
          a: { expr: '{p}^2/({Q} × {i}) − {h}', how: 'Find [H₂] from Q, then take the old [H₂].' },
          h: {
            expr: '{p}^2/({Q} × {i}) − {a}',
            how: 'Divide [HI]² by Q[I₂], then take away the H₂ added.',
          },
          i: { expr: '{p}^2/({Q} × ({h} + {a}))', how: 'Divide [HI]² by Q times the new [H₂].' },
          p: {
            expr: '√({Q} × ({h} + {a}) × {i})',
            how: 'Multiply out, then take the square root.',
          },
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
  // 3.602, not 3.6021: a pH shows 4 significant figures.
  figures: 4,
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
const phRule = (
  p = 'p',
  h = 'h',
  ion = 'H⁺',
  how = `Each step of 1 on the scale is ten times the [${ion}]: the log counts the powers of ten.`,
): Rule => ({
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
    [p]: { expr: `−log₁₀({${h}})`, how },
    [h]: { expr: `10^−{${p}}`, how: 'Undo the log: 10 to the power of minus the value.' },
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
      solve: { r: (v) => div(v.Vb!, v.Ve!), Vb: (v) => v.r! * v.Ve!, Ve: (v) => div(v.Vb!, v.r!) },
    },
    steps: {
      r: { expr: '{Vb}/{Ve}', how: 'Compare the base added with the base equivalence takes.' },
      Vb: { expr: '{r} × {Ve}', how: 'Take that share of the equivalence volume.' },
      Ve: { expr: '{Vb}/{r}', how: 'The base added is that share of the equivalence volume.' },
    },
  },
  ...(weak
    ? [
        phRule(
          'pKa',
          'Ka',
          'Kₐ',
          'Each step of 1 on the pKₐ scale is ten times the Kₐ: the log counts the powers of ten.',
        ),
        {
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
        } as Rule,
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

/** C₄H₈ from the counts (a count of 1 is left unwritten: CH₄). */
const hydrocarbonFormula = (c: number, h: number) =>
  `C${c === 1 ? '' : subscript(String(c))}H${h === 1 ? '' : subscript(String(h))}`;

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
  // "4 carbons: 1-butene, C₄H₈", the compound the numbers name.
  const named = (v: Record<string, number | undefined>) =>
    v.n === undefined || v.h === undefined
      ? []
      : [
          `${v.n} carbon${v.n === 1 ? '' : 's'} and ${bond === 'single' ? 'only single bonds' : `one ${bond} bond`}: ${hydrocarbonName(v.n, bond)}, ${hydrocarbonFormula(v.n, v.h)}`,
        ];
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
          work: named,
        },
        n: {
          expr: k === 0 ? '{h}/2' : `({h}${k > 0 ? ` − ${k}` : ` + ${-k}`})/2`,
          how: 'Undo the rule for the hydrogens.',
          work: named,
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
  {
    id: 's.10.organic~isomers',
    title: 'Isomers: a branched alkane',
    use: 'Use this for “Draw an isomer of pentane” or “How many hydrogens does 2-methylbutane have?”',
    unitSystems: ['metric'],
    assumptions: [
      'The main chain is the longest chain of carbons; a methyl group, CH₃, hangs off its second carbon.',
      'Isomers have the same formula but different structures: 2-methylbutane and pentane are both C₅H₁₂.',
    ],
    variables: [
      whole('n', 'n', 'Carbons in the main chain', 3, 7),
      { ...whole('c', 'c', 'Carbons in all', 4, 8), derived: true },
      { ...whole('h', 'h', 'Hydrogen atoms', 10, 18), derived: true },
    ],
    ...rules(
      {
        relation: {
          id: 'c = n + 1',
          display: '{c} = {n} + 1',
          vars: ['c', 'n'],
          residual: (v) => v.c! - v.n! - 1,
          solve: { c: (v) => v.n! + 1, n: (v) => v.c! - 1 },
        },
        steps: {
          c: {
            expr: '{n} + 1',
            how: 'The methyl group adds one carbon to the main chain’s carbons.',
          },
          n: { expr: '{c} − 1', how: 'Take the methyl carbon away.' },
        },
      },
      {
        relation: {
          id: 'h = 2c + 2',
          display: '{h} = 2 × {c} + 2',
          vars: ['h', 'c'],
          residual: (v) => v.h! - (2 * v.c! + 2),
          solve: { h: (v) => 2 * v.c! + 2, c: (v) => (v.h! - 2) / 2 },
        },
        steps: {
          h: { expr: '2 × {c} + 2', how: 'Any alkane, branched or not, is CₙH₂ₙ₊₂.' },
          c: { expr: '({h} − 2)/2', how: 'Undo 2 × carbons + 2.' },
        },
      },
    ),
    example: { n: 4, c: 5, h: 12 },
    startWith: ['n'],
    representation: {
      kind: 'lewisStructure',
      mode: 'hydrocarbon',
      carbons: 'n',
      hydrogens: 'h',
      branches: [2],
    },
  },
];

// ─── Nuclear chemistry ───────────────────────────────────────────────────────

const nucleon = (id: string, symbol: string, name: string, min: number, max: number) =>
  whole(id, symbol, name, min, max);

/** "Z = 90 is thorium: Th-234", the nucleus an atomic number (and mass number) name. */
function nucleusName(z: number, a: number | undefined, label: string): string {
  const e = element(z);
  if (!e) return `${label} = ${z}`;
  return `${label} = ${z} is ${e.name.toLowerCase()}${a === undefined ? '' : `: ${e.symbol}-${a}`}`;
}

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
  // A term of 0 (a beta particle's mass number) is left out: A′ = A, not A − 0.
  const minus = (a: string, n: number) =>
    n === 0 ? `{${a}}` : n < 0 ? `{${a}} + ${-n}` : `{${a}} − ${n}`;
  const plus = (a: string, n: number) =>
    n === 0 ? `{${a}}` : n < 0 ? `{${a}} − ${-n}` : `{${a}} + ${n}`;
  const signed = (n: number) => (n < 0 ? `−${-n}` : `${n}`);
  return {
    id,
    title,
    use,
    assumptions: [
      'The mass numbers (top) on the two sides add to the same total.',
      'The atomic numbers (bottom) on the two sides add to the same total.',
      `The ${particle.name} carries away ${mass} in mass number and ${signed(charge)} in atomic number.`,
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
        display: mass === 0 ? '{A2} = {A}' : `{A} = {A2} + ${mass}`,
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
          how:
            mass === 0
              ? `A ${particle.name} has mass number 0, so the mass number stays the same.`
              : `The ${particle.name} takes ${mass} of the mass number.`,
        },
        A: {
          expr: plus('A2', mass),
          how:
            mass === 0
              ? `A ${particle.name} has mass number 0, so the mass number was the same.`
              : `Add back the ${particle.name}’s mass number.`,
        },
      },
      'Z = Z₂ + particle': {
        Z2: {
          expr: minus('Z', charge),
          how:
            charge < 0
              ? `The ${particle.name} has atomic number −1: a neutron became a proton.`
              : `The ${particle.name} takes ${charge} of the atomic number.`,
          work: (v) => [nucleusName(v.Z2!, v.A2, 'Z′')],
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
          display: '{N} = {N0} × (1/2)^{n}',
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
            expr: '{N0} × (1/2)^{n}',
            how: 'Each half-life halves what is left: halve it n times.',
          },
          n: {
            expr: 'ln({N0}/{N})/ln(2)',
            how: 'Count the halvings with logs: how many times 2 goes into the drop.',
          },
          N0: { expr: '{N} × 2^{n}', how: 'Double what is left once for each half-life.' },
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
            work: (v) => [nucleusName(v.Z2!, v.A2, 'Z₂')],
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
      {
        relation: {
          id: 'N₁ ≥ Z₁',
          constraint: true,
          display: '{N1} is at least {Z1}',
          vars: ['N1', 'Z1'],
          residual: (v) => (v.N1! >= v.Z1! ? 0 : 1),
          solve: {},
          message: (v) =>
            v.N1! >= v.Z1!
              ? undefined
              : 'A fragment this heavy has at least as many neutrons as protons.',
        },
        steps: {},
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

// ─── Pages the lesson review added ───────────────────────────────────────────

/** Standard reduction potentials the cell page takes (volts, 25 °C), from the cell figure's table. */
const POTENTIALS = Object.values(CELL_METALS).map((m) => m.potential);
const metalAt = (e: number) =>
  Object.values(CELL_METALS)
    .find((m) => Math.abs(m.potential - e) < 1e-9)
    ?.name.toLowerCase();

const ADDED: ModuleDef[] = [
  {
    id: 's.10.rates-equilibrium~average-rate',
    title: 'Average reaction rate',
    use: 'Use this for “[A] falls from 1.20 mol/L at 30 s to 0.75 mol/L at 120 s. What is the average rate?”',
    unitSystems: ['metric'],
    assumptions: [
      'A reactant is used up, so its concentration falls: the rate is −Δ[A]/Δt, a positive number.',
      'It is an average: the secant through the two readings has slope Δ[A]/Δt, though the curve is steepest at the start.',
    ],
    variables: [
      conc('A1', '[A]₁', 'Concentration at the first time'),
      conc('A2', '[A]₂', 'Concentration at the second time'),
      quantity('t1', 't₁', 'First time', 's', 0, 100000, 0.1),
      quantity('t2', 't₂', 'Second time', 's', 0.1, 100000, 0.1),
      quantity('dt', 'Δt', 'Time between', 's', 0.1, 100000, 0.1),
      quantity('dA', 'Δ[A]', 'Change in concentration', 'mol/L', -100, 0, 0.0001),
      quantity('r', 'r', 'Average rate', 'mol/(L·s)', 0, 1000, 0.000001),
    ],
    ...rules(
      {
        relation: {
          id: 'Δt = t₂ − t₁',
          display: '{dt} = {t2} − {t1}',
          vars: ['dt', 't2', 't1'],
          residual: (v) => v.dt! - (v.t2! - v.t1!),
          solve: { dt: (v) => v.t2! - v.t1!, t2: (v) => v.t1! + v.dt!, t1: (v) => v.t2! - v.dt! },
          message: (v) =>
            v.t2! > v.t1! ? undefined : 'The second time must come after the first.',
        },
        steps: {
          dt: { expr: '{t2} − {t1}', how: 'The time between the two readings.' },
          t2: { expr: '{t1} + {dt}', how: 'Add the time between to the first time.' },
          t1: { expr: '{t2} − {dt}', how: 'Take the time between off the second time.' },
        },
      },
      {
        relation: {
          id: 'Δ[A] = [A]₂ − [A]₁',
          display: '{dA} = {A2} − {A1}',
          vars: ['dA', 'A2', 'A1'],
          residual: (v) => v.dA! - (v.A2! - v.A1!),
          solve: { dA: (v) => v.A2! - v.A1!, A2: (v) => v.A1! + v.dA!, A1: (v) => v.A2! - v.dA! },
          message: (v) =>
            v.A2! <= v.A1! ? undefined : 'A reactant is used up: [A]₂ can’t be more than [A]₁.',
        },
        steps: {
          dA: {
            expr: '{A2} − {A1}',
            how: 'Last minus first: negative, since the reactant is used up.',
          },
          A2: { expr: '{A1} + {dA}', how: 'Add the (negative) change to the first reading.' },
          A1: { expr: '{A2} − {dA}', how: 'Take the change back off the second reading.' },
        },
      },
      {
        relation: {
          id: 'rate = −Δ[A]/Δt',
          display: '{r} = −{dA}/{dt}',
          vars: ['r', 'dA', 'dt'],
          residual: (v) => v.r! * v.dt! + v.dA!,
          solve: {
            r: (v) => div(-v.dA!, v.dt!),
            dA: (v) => -v.r! * v.dt!,
            dt: (v) => div(-v.dA!, v.r!),
          },
        },
        steps: {
          r: {
            expr: '−{dA}/{dt}',
            how: 'The drop in concentration per second: the minus sign makes the rate positive.',
          },
          dA: { expr: '−{r} × {dt}', how: 'The concentration drops by the rate times the time.' },
          dt: { expr: '−{dA}/{r}', how: 'Divide the drop by the rate.' },
        },
      },
    ),
    example: {
      A1: 1.2,
      A2: 0.75,
      t1: 30,
      t2: 120,
      dt: 90,
      dA: -0.45,
      r: 0.005,
    },
    startWith: ['A1', 'A2', 't1', 't2'],
    representation: {
      kind: 'chemDiagram',
      mode: 'rate',
      times: ['t1', 't2'],
      concentrations: ['A1', 'A2'],
      span: 'dt',
      change: 'dA',
      rate: 'r',
    },
  },
  {
    id: 's.10.rates-equilibrium~ksp',
    title: 'Solubility product',
    use: 'Use this for a salt such as AgCl that barely dissolves: its Ksp from its molar solubility, or the solubility from Ksp.',
    unitSystems: ['metric'],
    assumptions: [
      'AgCl(s) ⇌ Ag⁺ + Cl⁻: each unit that dissolves gives one of each ion, so both are s mol/L.',
      'The solid is left out: Ksp = [Ag⁺][Cl⁻] = s². At 25 °C, AgCl’s Ksp is 1.8 × 10⁻¹⁰.',
      'Silver chloride’s molar mass is 143.32 g/mol.',
    ],
    variables: [
      quantity('K', 'Ksp', 'Solubility product', undefined, 1e-24, 1, 1e-26, { scientific: true }),
      quantity('s', 's', 'Molar solubility', 'mol/L', 1e-12, 1, 1e-14, { scientific: true }),
      quantity('g', 'S', 'Solubility in grams per liter', 'g/L', 1e-10, 200, 1e-12, {
        scientific: true,
      }),
    ],
    ...rules(
      {
        relation: {
          id: 'Ksp = s²',
          display: '{K} = {s}^2',
          vars: ['K', 's'],
          residual: (v) => v.K! / v.s! ** 2 - 1,
          // s first: `holds` re-solves the first entry, and a check on Ksp (10⁻¹⁰) passes anything.
          solve: { s: (v) => Math.sqrt(Math.max(0, v.K!)), K: (v) => v.s! ** 2 },
        },
        steps: {
          s: { expr: '√({K})', how: 'Ksp is s times s, so s is its square root.' },
          K: { expr: '{s}^2', how: 'Both ions are at s mol/L, and Ksp is their product.' },
        },
      },
      {
        relation: {
          id: 'S = 143.32 × s',
          display: '{g} = {s} × 143.32',
          vars: ['g', 's'],
          residual: (v) => v.g! / (143.32 * v.s!) - 1,
          solve: { s: (v) => v.g! / 143.32, g: (v) => v.s! * 143.32 },
        },
        steps: {
          g: { expr: '{s} × 143.32', how: 'Each mole of AgCl that dissolves is 143.32 g.' },
          s: { expr: '{g}/143.32', how: 'Divide the grams by the grams in one mole.' },
        },
      },
    ),
    example: { K: 1.8e-10, s: Math.sqrt(1.8e-10), g: Math.sqrt(1.8e-10) * 143.32 },
    startWith: ['K'],
    representation: {
      kind: 'equilibriumChart',
      species: [
        { formula: 'Ag⁺', coef: 1, side: 'product', start: 0, eq: 's' },
        { formula: 'Cl⁻', coef: 1, side: 'product', start: 0, eq: 's' },
      ],
      K: 'K',
    },
  },
  {
    id: 's.10.gas-laws~partial-pressure',
    title: 'Dalton’s law of partial pressures',
    use: 'Use this for a mixture of gases: the total pressure from each gas’s partial pressure, and one gas’s mole fraction.',
    unitSystems: ['metric'],
    assumptions: [
      'A tank holds helium, oxygen and nitrogen, all ideal and at one temperature.',
      'Each gas pushes as if it were alone, so the total pressure is the sum of the partial pressures.',
      'A gas’s share of the pressure is its share of the particles: its mole fraction.',
    ],
    variables: [
      { ...pressure('1'), name: 'Pressure of helium' },
      { ...pressure('2'), name: 'Pressure of oxygen' },
      { ...pressure('2'), id: 'P3', symbol: 'P₃', name: 'Pressure of nitrogen' },
      { ...pressure(''), name: 'Total pressure', max: 600 },
      { id: 'x', symbol: 'x₁', name: 'Mole fraction of helium', min: 0, max: 1, step: 0.0001 },
    ],
    ...rules(
      {
        relation: {
          id: 'P = P₁ + P₂ + P₃',
          display: '{P} = {P1} + {P2} + {P3}',
          vars: ['P', 'P1', 'P2', 'P3'],
          residual: (v) => v.P! - (v.P1! + v.P2! + v.P3!),
          solve: {
            P: (v) => v.P1! + v.P2! + v.P3!,
            P1: (v) => v.P! - v.P2! - v.P3!,
            P2: (v) => v.P! - v.P1! - v.P3!,
            P3: (v) => v.P! - v.P1! - v.P2!,
          },
        },
        steps: {
          P: { expr: '{P1} + {P2} + {P3}', how: 'Each gas adds its own push to the total.' },
          P1: { expr: '{P} − {P2} − {P3}', how: 'Take the other gases’ pressures from the total.' },
          P2: { expr: '{P} − {P1} − {P3}', how: 'Take the other gases’ pressures from the total.' },
          P3: { expr: '{P} − {P1} − {P2}', how: 'Take the other gases’ pressures from the total.' },
        },
      },
      {
        relation: {
          id: 'x₁ = P₁/P',
          display: '{x} = {P1}/{P}',
          vars: ['x', 'P1', 'P'],
          residual: (v) => v.x! * v.P! - v.P1!,
          solve: { x: (v) => div(v.P1!, v.P!), P1: (v) => v.x! * v.P!, P: (v) => div(v.P1!, v.x!) },
        },
        steps: {
          x: {
            expr: '{P1}/{P}',
            how: 'Helium’s share of the pressure is its share of the particles.',
          },
          P1: { expr: '{x} × {P}', how: 'Take helium’s share of the total pressure.' },
          P: {
            expr: '{P1}/{x}',
            how: 'Helium’s pressure is that share of the total: scale it up.',
          },
        },
      },
    ),
    example: { P1: 2, P2: 0.5, P3: 1.5, P: 4, x: 0.5 },
    startWith: ['P1', 'P2', 'P3'],
    representation: {
      kind: 'gasPiston',
      law: 'ideal',
      mixture: {
        gases: [
          { formula: 'He', pressure: 'P1' },
          { formula: 'O2', pressure: 'P2' },
          { formula: 'N2', pressure: 'P3' },
        ],
        total: 'P',
        fraction: 'x',
      },
    },
  },
  {
    id: 's.10.molarity~percent-mass',
    title: 'Percent by mass',
    use: 'Use this for “15 g of sugar is dissolved in 135 g of water. What is the percent sugar by mass?”',
    unitSystems: ['metric'],
    assumptions: [
      'The solution’s mass is the solute’s and the solvent’s together.',
      'Percent by mass is the solute’s share of the solution’s mass, not of the water’s.',
    ],
    variables: [
      { ...saltGrams('m1', 'm₁', 'Mass of solute', 0.001), max: 10000, step: 0.001 },
      { ...saltGrams('m2', 'm₂', 'Mass of solvent', 0.001), max: 10000, step: 0.001 },
      { ...saltGrams('m', 'm', 'Mass of solution', 0.002), max: 20000, step: 0.001 },
      quantity('p', 'p', 'Percent by mass', '%', 0, 100, 0.0001),
    ],
    ...rules(
      {
        relation: {
          id: 'm = m₁ + m₂',
          display: '{m} = {m1} + {m2}',
          vars: ['m', 'm1', 'm2'],
          residual: (v) => v.m! - (v.m1! + v.m2!),
          solve: { m: (v) => v.m1! + v.m2!, m1: (v) => v.m! - v.m2!, m2: (v) => v.m! - v.m1! },
        },
        steps: {
          m: {
            expr: '{m1} + {m2}',
            how: 'Dissolving loses no mass: add the solute and the solvent.',
          },
          m1: { expr: '{m} − {m2}', how: 'Take the solvent’s mass from the solution’s.' },
          m2: { expr: '{m} − {m1}', how: 'Take the solute’s mass from the solution’s.' },
        },
      },
      {
        relation: {
          id: 'p = m₁/m × 100',
          display: '{p} = {m1}/{m} × 100',
          vars: ['p', 'm1', 'm'],
          residual: (v) => v.p! * v.m! - 100 * v.m1!,
          solve: {
            p: (v) => div(100 * v.m1!, v.m!),
            m1: (v) => (v.p! * v.m!) / 100,
            m: (v) => div(100 * v.m1!, v.p!),
          },
        },
        steps: {
          p: {
            expr: '{m1}/{m} × 100',
            how: 'The solute’s share of the whole solution, as a percent.',
          },
          m1: { expr: '{p} × {m}/100', how: 'Take that percent of the solution’s mass.' },
          m: {
            expr: '{m1} × 100/{p}',
            how: 'The solute is p percent of the solution: scale it up.',
          },
        },
      },
    ),
    example: { m1: 15, m2: 135, m: 150, p: 10 },
    startWith: ['m1', 'm2'],
    representation: { kind: 'percentBar', percent: 'p', part: 'm1', whole: 'm' },
  },
  {
    id: 's.10.redox~cell-voltage',
    title: 'Standard cell voltage',
    use: 'Use this for “What voltage does a zinc–copper cell give?”: E°cell from the two metals’ reduction potentials.',
    unitSystems: ['metric'],
    assumptions: [
      'Each metal stands in a 1 M solution of its own ion at 25 °C; the potentials are the standard table’s.',
      'The metal with the higher reduction potential is the cathode, where reduction happens.',
      'E°cell = E°cathode − E°anode, and it is positive for a working cell.',
    ],
    variables: [
      {
        ...quantity('Ec', 'E°cathode', 'Reduction potential of the cathode', 'V', -3, 1, 0.01),
        allowed: POTENTIALS,
      },
      {
        ...quantity('Ea', 'E°anode', 'Reduction potential of the anode', 'V', -3, 1, 0.01),
        allowed: POTENTIALS,
      },
      quantity('E', 'E°cell', 'Cell voltage', 'V', 0, 4, 0.01),
    ],
    ...rules({
      relation: {
        id: 'E°cell = E°cathode − E°anode',
        display: '{E} = {Ec} − {Ea}',
        vars: ['E', 'Ec', 'Ea'],
        residual: (v) => v.E! - (v.Ec! - v.Ea!),
        solve: { E: (v) => v.Ec! - v.Ea!, Ec: (v) => v.E! + v.Ea!, Ea: (v) => v.Ec! - v.E! },
        message: (v) =>
          v.Ec! > v.Ea!
            ? undefined
            : 'The cathode has the higher reduction potential: swap the two metals.',
      },
      steps: {
        E: {
          expr: '{Ec} − {Ea}',
          how: 'The cathode’s pull for electrons minus the anode’s: the bigger the gap, the bigger the voltage.',
          work: (v) => {
            const [c, a] = [metalAt(v.Ec!), metalAt(v.Ea!)];
            return c && a
              ? [
                  `${fmt(v.Ec!)} V is ${c}’s and ${fmt(v.Ea!)} V is ${a}’s: a ${a}–${c} cell with ${a} the anode`,
                ]
              : [];
          },
        },
        Ec: { expr: '{E} + {Ea}', how: 'Add the anode’s potential to the cell voltage.' },
        Ea: { expr: '{Ec} − {E}', how: 'Take the cell voltage from the cathode’s potential.' },
      },
    }),
    example: { Ec: 0.34, Ea: -0.76, E: 1.1 },
    startWith: ['Ec', 'Ea'],
    representation: { kind: 'chemDiagram', mode: 'cell', cathode: 'Ec', anode: 'Ea', voltage: 'E' },
  },
  {
    id: 's.10.redox~oxidation-numbers',
    title: 'Oxidation numbers: the atom to find',
    use: 'Use this for “What is the oxidation number of S in H₂SO₄?” or in SO₄²⁻.',
    unitSystems: ['metric'],
    assumptions: [
      'Hydrogen is +1 and oxygen −2 in most compounds.',
      'The oxidation numbers of all the atoms add up to the charge: 0 for a neutral compound.',
    ],
    variables: [
      whole('x', 'x', 'Oxidation number of the sulfur', -4, 8),
      whole('h', 'h', 'Hydrogen atoms', 0, 4),
      whole('o', 'o', 'Oxygen atoms', 0, 4),
      whole('q', 'q', 'Charge of the particle', -3, 3),
    ],
    ...rules({
      relation: {
        id: 'x + h − 2o = q',
        display: '{x} + {h} × (+1) + {o} × (−2) = {q}',
        vars: ['x', 'h', 'o', 'q'],
        residual: (v) => v.x! + v.h! - 2 * v.o! - v.q!,
        solve: {
          x: (v) => v.q! - v.h! + 2 * v.o!,
          h: (v) => v.q! - v.x! + 2 * v.o!,
          o: (v) => (v.x! + v.h! - v.q!) / 2,
          q: (v) => v.x! + v.h! - 2 * v.o!,
        },
      },
      steps: {
        x: {
          expr: '{q} − {h} + 2 × {o}',
          how: 'Take the hydrogens’ +1 each away from the charge and add back the oxygens’ −2 each.',
        },
        h: { expr: '{q} − {x} + 2 × {o}', how: 'What the charge still needs, +1 per hydrogen.' },
        o: {
          expr: '({x} + {h} − {q})/2',
          how: 'What the other atoms have too much of, −2 per oxygen.',
        },
        q: { expr: '{x} + {h} − 2 × {o}', how: 'Add every atom’s oxidation number.' },
      },
    }),
    example: { x: 6, h: 2, o: 4, q: 0 },
    startWith: ['h', 'o', 'q'],
    representation: {
      kind: 'chemDiagram',
      mode: 'oxidation',
      formula: 'H{h}SO{o}',
      numbers: { H: 1, S: 'x', O: -2 },
      charge: 'q',
    },
  },
];

// ─── Phase changes, vapor pressure and colligative properties ───────────────

/** ΔT = i × K × b for a solvent constant K (1.86 °C·kg/mol freezing, 0.512 boiling, water). */
const colligativeRule = (dT: string, k: number, kText: string, what: string): Rule => ({
  relation: {
    id: `${dT} = i × ${kText} × b`,
    display: `{${dT}} = {i} × ${kText} × {b}`,
    vars: [dT, 'i', 'b'],
    residual: (v) => v[dT]! - v.i! * k * v.b!,
    solve: {
      [dT]: (v) => v.i! * k * v.b!,
      b: (v) => div(v[dT]!, v.i! * k),
      i: (v) => div(v[dT]!, k * v.b!),
    },
  },
  steps: {
    [dT]: {
      expr: `{i} × ${kText} × {b}`,
      how: `Water’s ${what} changes ${kText} °C for each mole of particles per kilogram.`,
    },
    b: { expr: `{${dT}}/({i} × ${kText})`, how: 'Divide the change by i times the constant.' },
    i: { expr: `{${dT}}/(${kText} × {b})`, how: 'Divide the change by the constant times b.' },
  },
});

const PHASE: ModuleDef[] = [
  {
    id: 's.10.phase-colligative',
    unitSystems: ['metric'],
    assumptions: [
      'The solvent is water: it freezes at 0 °C and boils at 100 °C, with Kf = 1.86 and Kb = 0.512 °C·kg/mol.',
      'Only the number of dissolved particles matters: i is 1 for sugar, 2 for NaCl, 3 for CaCl₂, 4 for FeCl₃.',
      'Molality b is moles of solute per kilogram of water, not per liter of solution.',
      'The rule fits dilute solutions (up to about 1 mol/kg); stronger ones stray from it.',
    ],
    variables: [
      quantity('g', 'g', 'Mass of solute', 'g', 0.01, 1000, 0.001),
      quantity('M', 'M', 'Molar mass', 'g/mol', 1, 1000, 0.01),
      quantity('n', 'n', 'Moles of solute', 'mol', 0.00001, 1000, 0.00001),
      quantity('w', 'w', 'Mass of water', 'kg', 0.01, 100, 0.001),
      // Wide, so a strong solution meets the limit below (with its reason), not a silent clear.
      quantity('b', 'b', 'Molality', 'mol/kg', 0.0000001, 100000, 0.0001),
      {
        ...whole('i', 'i', 'Particles each unit gives (van ’t Hoff factor)', 1, 4),
        allowed: [1, 2, 3, 4],
      },
      quantity('dTf', 'ΔTf', 'Freezing point drop', '°C', 0, 45, 0.0001),
      quantity('Tf', 'Tf', 'Freezing point of the solution', '°C', -45, 0, 0.0001),
      quantity('dTb', 'ΔTb', 'Boiling point rise', '°C', 0, 13, 0.0001),
      quantity('Tb', 'Tb', 'Boiling point of the solution', '°C', 100, 113, 0.0001),
      {
        ...quantity('T0', 'T₀', 'Where the curve starts', '°C', -55, -10, 0.0001),
        derived: true,
        hidden: true,
      },
    ],
    ...rules(
      {
        relation: {
          id: 'n = g/M',
          display: '{n} = {g}/{M}',
          vars: ['n', 'g', 'M'],
          residual: (v) => v.n! * v.M! - v.g!,
          solve: { n: (v) => div(v.g!, v.M!), g: (v) => v.n! * v.M!, M: (v) => div(v.g!, v.n!) },
        },
        steps: {
          n: { expr: '{g}/{M}', how: 'Divide the grams by the grams in each mole.' },
          g: { expr: '{n} × {M}', how: 'Multiply the moles by the grams in each mole.' },
          M: {
            expr: '{g}/{n}',
            how: 'Grams per mole: divide the grams by the moles the freezing or boiling change gave.',
          },
        },
      },
      {
        relation: {
          id: 'b = n/w',
          display: '{b} = {n}/{w}',
          vars: ['b', 'n', 'w'],
          residual: (v) => v.b! * v.w! - v.n!,
          solve: { b: (v) => div(v.n!, v.w!), n: (v) => v.b! * v.w!, w: (v) => div(v.n!, v.b!) },
        },
        steps: {
          b: { expr: '{n}/{w}', how: 'Molality is moles of solute per kilogram of water.' },
          n: { expr: '{b} × {w}', how: 'Multiply the moles in each kilogram by the kilograms.' },
          w: { expr: '{n}/{b}', how: 'Divide the moles by the moles in each kilogram.' },
        },
      },
      // Checked right after b is worked out, so its reason shows before a range clears a value.
      {
        relation: {
          id: 'b ≥ 0.001',
          constraint: true,
          display: '{b} is at least 0.001',
          vars: ['b'],
          residual: (v) => (v.b! >= 0.001 - 1e-12 ? 0 : 1),
          solve: {},
          message: (v) =>
            v.b! >= 0.001 - 1e-12
              ? undefined
              : 'Below 0.001 mol/kg the freezing and boiling points barely move.',
        },
        steps: {},
      },
      {
        relation: {
          id: 'b ≤ 6',
          constraint: true,
          display: '{b} is at most 6',
          vars: ['b'],
          residual: (v) => (v.b! <= 6 + 1e-9 ? 0 : 1),
          solve: {},
          message: (v) =>
            v.b! <= 6 + 1e-9
              ? undefined
              : 'Past about 6 mol/kg the freezing-point rule no longer fits.',
        },
        steps: {},
      },
      colligativeRule('dTf', 1.86, '1.86', 'freezing point'),
      {
        relation: {
          id: 'Tf = 0 − ΔTf',
          display: '{Tf} = 0 − {dTf}',
          vars: ['Tf', 'dTf'],
          residual: (v) => v.Tf! + v.dTf!,
          solve: { Tf: (v) => -v.dTf!, dTf: (v) => -v.Tf! },
        },
        steps: {
          Tf: { expr: '0 − {dTf}', how: 'Pure water freezes at 0 °C; the solute pushes it lower.' },
          dTf: { expr: '0 − {Tf}', how: 'How far below 0 °C the solution freezes.' },
        },
      },
      colligativeRule('dTb', 0.512, '0.512', 'boiling point'),
      {
        relation: {
          id: 'Tb = 100 + ΔTb',
          display: '{Tb} = 100 + {dTb}',
          vars: ['Tb', 'dTb'],
          residual: (v) => v.Tb! - (100 + v.dTb!),
          solve: { Tb: (v) => 100 + v.dTb!, dTb: (v) => v.Tb! - 100 },
        },
        steps: {
          Tb: {
            expr: '100 + {dTb}',
            how: 'Pure water boils at 100 °C; the solute pushes it higher.',
          },
          dTb: { expr: '{Tb} − 100', how: 'How far above 100 °C the solution boils.' },
        },
      },
      {
        relation: {
          id: 'curve start',
          hidden: true,
          display: '{T0} = {Tf} − 10',
          vars: ['T0', 'Tf'],
          residual: (v) => v.T0! - (v.Tf! - 10),
          solve: { T0: (v) => v.Tf! - 10 },
        },
        steps: {},
      },
    ),
    example: {
      g: 27.75,
      M: 111,
      n: 0.25,
      w: 0.5,
      b: 0.5,
      i: 3,
      dTf: 3 * 1.86 * 0.5,
      Tf: -3 * 1.86 * 0.5,
      dTb: 3 * 0.512 * 0.5,
      Tb: 100 + 3 * 0.512 * 0.5,
      T0: -3 * 1.86 * 0.5 - 10,
    },
    startWith: ['g', 'M', 'w', 'i'],
    representation: {
      kind: 'heatingCurve',
      start: 'T0',
      melt: 'Tf',
      boil: 'Tb',
      spans: [4, 8, 10, 20],
      names: ['ice', 'solution', 'steam'],
      formula: 'H2O',
    },
  },
  {
    id: 's.10.phase-colligative~vapor-pressure',
    title: 'Vapor pressure of a solution',
    use: 'Use this for “0.5 mol of glucose is dissolved in 9.5 mol of water at 25 °C. How much does the vapor pressure drop?”',
    unitSystems: ['metric'],
    assumptions: [
      'The solute does not evaporate, so only water molecules at the surface escape (Raoult’s law).',
      'The vapor pressure is the pure water’s times water’s mole fraction; at 25 °C pure water’s is 23.8 mmHg.',
      'Count particles: a salt that splits into ions counts each ion.',
      'The solution is dilute and ideal: mostly water.',
    ],
    variables: [
      quantity('n1', 'n₁', 'Moles of water', 'mol', 0.01, 1000, 0.001),
      quantity('n2', 'n₂', 'Moles of solute particles', 'mol', 0, 1000, 0.001),
      quantity('n', 'n', 'Moles in all', 'mol', 0.01, 2000, 0.001),
      { id: 'x', symbol: 'x', name: 'Mole fraction of water', min: 0, max: 1, step: 0.0001 },
      quantity('P0', 'P°', 'Vapor pressure of pure water', 'mmHg', 0.1, 800, 0.01),
      quantity('P', 'P', 'Vapor pressure of the solution', 'mmHg', 0, 800, 0.0001),
      quantity('dP', 'ΔP', 'Drop in vapor pressure', 'mmHg', 0, 800, 0.0001),
    ],
    ...rules(
      {
        relation: {
          id: 'n = n₁ + n₂',
          display: '{n} = {n1} + {n2}',
          vars: ['n', 'n1', 'n2'],
          residual: (v) => v.n! - (v.n1! + v.n2!),
          solve: { n: (v) => v.n1! + v.n2!, n1: (v) => v.n! - v.n2!, n2: (v) => v.n! - v.n1! },
        },
        steps: {
          n: { expr: '{n1} + {n2}', how: 'Add the water’s moles and the solute particles’.' },
          n1: { expr: '{n} − {n2}', how: 'Take the solute particles from the total.' },
          n2: { expr: '{n} − {n1}', how: 'Take the water from the total.' },
        },
      },
      {
        relation: {
          id: 'x = n₁/n',
          display: '{x} = {n1}/{n}',
          vars: ['x', 'n1', 'n'],
          residual: (v) => v.x! * v.n! - v.n1!,
          solve: { x: (v) => div(v.n1!, v.n!), n1: (v) => v.x! * v.n!, n: (v) => div(v.n1!, v.x!) },
        },
        steps: {
          x: { expr: '{n1}/{n}', how: 'Water’s share of all the particles.' },
          n1: { expr: '{x} × {n}', how: 'Take water’s share of all the moles.' },
          n: { expr: '{n1}/{x}', how: 'The water is that share of the whole: scale it up.' },
        },
      },
      {
        relation: {
          id: 'P = x × P°',
          display: '{P} = {x} × {P0}',
          vars: ['P', 'x', 'P0'],
          residual: (v) => v.P! - v.x! * v.P0!,
          solve: { P: (v) => v.x! * v.P0!, x: (v) => div(v.P!, v.P0!), P0: (v) => div(v.P!, v.x!) },
        },
        steps: {
          P: {
            expr: '{x} × {P0}',
            how: 'Only the water’s share of the surface escapes, so the pressure drops by that share.',
          },
          x: { expr: '{P}/{P0}', how: 'Compare the solution’s vapor pressure with pure water’s.' },
          P0: { expr: '{P}/{x}', how: 'The solution has that share of pure water’s pressure.' },
        },
      },
      {
        relation: {
          id: 'mostly water',
          constraint: true,
          display: '{x} is at least 0.5',
          vars: ['x'],
          residual: (v) => (v.x! >= 0.5 ? 0 : 1),
          solve: {},
          message: (v) =>
            v.x! >= 0.5 ? undefined : 'Raoult’s law is for solutions that are mostly water.',
        },
        steps: {},
      },
      {
        relation: {
          id: 'ΔP = n₂/n × P°',
          display: '{dP} = {n2}/{n} × {P0}',
          vars: ['dP', 'n2', 'n', 'P0'],
          residual: (v) => v.dP! * v.n! - v.n2! * v.P0!,
          solve: {
            dP: (v) => div(v.n2! * v.P0!, v.n!),
            n2: (v) => div(v.dP! * v.n!, v.P0!),
            n: (v) => div(v.n2! * v.P0!, v.dP!),
            P0: (v) => div(v.dP! * v.n!, v.n2!),
          },
        },
        steps: {
          dP: {
            expr: '{n2}/{n} × {P0}',
            how: 'The pressure drops by the solute’s share of the particles.',
          },
          n2: {
            expr: '{dP} × {n}/{P0}',
            how: 'The drop’s share of pure water’s pressure is the solute’s share.',
          },
          n: {
            expr: '{n2} × {P0}/{dP}',
            how: 'The solute is the drop’s share of all the moles: scale it up.',
          },
          P0: {
            expr: '{dP} × {n}/{n2}',
            how: 'The drop is the solute’s share of pure water’s pressure: scale it up.',
          },
        },
      },
      {
        relation: {
          id: 'ΔP = P° − P',
          display: '{dP} = {P0} − {P}',
          vars: ['dP', 'P0', 'P'],
          residual: (v) => v.dP! - (v.P0! - v.P!),
          solve: { dP: (v) => v.P0! - v.P!, P0: (v) => v.dP! + v.P!, P: (v) => v.P0! - v.dP! },
        },
        steps: {
          dP: { expr: '{P0} − {P}', how: 'The drop is pure water’s pressure less the solution’s.' },
          P0: { expr: '{dP} + {P}', how: 'Add the drop back to the solution’s pressure.' },
          P: { expr: '{P0} − {dP}', how: 'Take the drop off pure water’s pressure.' },
        },
      },
    ),
    example: { n1: 9.5, n2: 0.5, n: 10, x: 0.95, P0: 23.8, P: 22.61, dP: 1.19 },
    startWith: ['n1', 'n2', 'P0'],
    representation: { kind: 'pieChart', parts: ['n1', 'n2'], total: 'n' },
  },
];

// ─── Entropy, free energy and spontaneity ────────────────────────────────────

/** ΔG against T is a line: slope −ΔS/1000 (kJ per kelvin), meeting the axis at ΔH. */
const slopeRule: Rule = {
  relation: {
    id: 'slope of ΔG against T',
    hidden: true,
    display: '{m} = −{dS}/1000',
    vars: ['m', 'dS'],
    residual: (v) => v.m! + v.dS! / 1000,
    solve: { m: (v) => -v.dS! / 1000 },
  },
  steps: {},
};
const freeVars = (): VariableDef[] => [
  quantity('dH', 'ΔH', 'Enthalpy change', 'kJ/mol', -10000, 10000, 0.01),
  quantity('dS', 'ΔS', 'Entropy change', 'J/(mol·K)', -5000, 5000, 0.01),
  {
    ...quantity('m', 'm', 'Slope of the line', undefined, -5, 5, 0.000001),
    derived: true,
    hidden: true,
  },
];
/** A number after a minus or division sign in a work line: a negative one bracketed, − (−56.02). */
const signed = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x));
const FREE_AXES = { x: 'Temperature T (K)', y: 'ΔG (kJ/mol)' };

const FREE: ModuleDef[] = [
  {
    id: 's.10.entropy-free-energy',
    unitSystems: ['metric'],
    assumptions: [
      'A reaction is spontaneous, able to go on its own, when ΔG is below 0.',
      'ΔG = ΔH − TΔS, with T in kelvins; ΔS is in J/(mol·K), so divide it by 1,000 to match ΔH’s kJ.',
      'Spontaneous says nothing about speed: diamond turning to graphite is spontaneous but far too slow to see.',
    ],
    variables: [
      ...freeVars(),
      quantity('T', 'T', 'Temperature', 'K', 1, 5000, 0.1),
      quantity('dG', 'ΔG', 'Free energy change', 'kJ/mol', -40000, 40000, 0.0001),
    ],
    ...rules(slopeRule, {
      relation: {
        id: 'ΔG = ΔH − TΔS',
        display: '{dG} = {dH} − {T} × {dS}/1,000',
        vars: ['dG', 'dH', 'T', 'dS'],
        residual: (v) => v.dG! - (v.dH! - (v.T! * v.dS!) / 1000),
        solve: {
          dG: (v) => v.dH! - (v.T! * v.dS!) / 1000,
          dH: (v) => v.dG! + (v.T! * v.dS!) / 1000,
          T: (v) => div(1000 * (v.dH! - v.dG!), v.dS!),
          dS: (v) => div(1000 * (v.dH! - v.dG!), v.T!),
        },
      },
      steps: {
        dG: {
          expr: '{dH} − {T} × {dS}/1,000',
          how: 'The heat given off pushes a reaction forward; spreading out (ΔS) pushes it more at high T.',
          work: (v) => [`ΔG = ${fmt(v.dH!)} − ${signed((v.T! * v.dS!) / 1000)}`],
          note: (v) =>
            v.dG === 0
              ? '(0: at equilibrium)'
              : v.dG! < 0
                ? `(below 0: spontaneous at ${fmt(v.T!)} K)`
                : `(above 0: not spontaneous at ${fmt(v.T!)} K)`,
        },
        dH: { expr: '{dG} + {T} × {dS}/1,000', how: 'Add TΔS back to ΔG.' },
        T: {
          expr: '1,000 × ({dH} − {dG})/{dS}',
          how: 'TΔS is what ΔH and ΔG differ by: divide it by ΔS.',
        },
        dS: {
          expr: '1,000 × ({dH} − {dG})/{T}',
          how: 'TΔS is what ΔH and ΔG differ by: divide it by T.',
        },
      },
    }),
    example: { dH: 50, dS: 200, m: -0.2, T: 300, dG: -10 },
    startWith: ['dH', 'dS', 'T'],
    representation: {
      kind: 'functionGraph',
      family: 'linear',
      m: 'm',
      b: 'dH',
      at: { x: 'T', y: 'dG' },
      xMin: 0,
      axes: FREE_AXES,
      fixed: true,
    },
  },
  {
    id: 's.10.entropy-free-energy~crossover',
    title: 'The temperature where it turns spontaneous',
    use: 'Use this for “Above what temperature is a reaction with ΔH = 60 kJ/mol and ΔS = 150 J/(mol·K) spontaneous?”',
    unitSystems: ['metric'],
    assumptions: [
      'ΔG = ΔH − TΔS is 0 where the reaction switches: T = ΔH ÷ ΔS, with ΔS changed to kJ.',
      'Both positive: spontaneous above that temperature. Both negative: spontaneous below it.',
      'With opposite signs ΔG never changes sign, so there is no switch.',
    ],
    variables: [
      ...freeVars(),
      quantity('Tc', 'T', 'Temperature where ΔG = 0', 'K', 1, 10000, 0.01),
    ],
    ...rules(
      slopeRule,
      {
        relation: {
          id: 'ΔH and ΔS share a sign',
          constraint: true,
          display: '{dH} and {dS} have the same sign',
          vars: ['dH', 'dS'],
          residual: (v) => (v.dH! * v.dS! > 0 ? 0 : 1),
          solve: {},
          message: (v) =>
            v.dH! * v.dS! > 0
              ? undefined
              : 'ΔH and ΔS need the same sign: otherwise ΔG never changes sign, and there is no switching temperature.',
        },
        steps: {},
      },
      {
        relation: {
          id: 'T = ΔH/ΔS',
          display: '{Tc} = 1,000 × {dH}/{dS}',
          vars: ['Tc', 'dH', 'dS'],
          residual: (v) => v.Tc! * v.dS! - 1000 * v.dH!,
          solve: {
            Tc: (v) => div(1000 * v.dH!, v.dS!),
            dH: (v) => (v.Tc! * v.dS!) / 1000,
            dS: (v) => div(1000 * v.dH!, v.Tc!),
          },
          message: (v) =>
            v.dH! * v.dS! <= 0
              ? 'ΔH and ΔS have opposite signs, so ΔG never changes sign: there is no switching temperature.'
              : v.Tc === undefined && (1000 * v.dH!) / v.dS! > 10000
                ? 'That switch would be past 10,000 K, hotter than any compound survives.'
                : undefined,
        },
        steps: {
          Tc: {
            expr: '1,000 × {dH}/{dS}',
            how: 'Set ΔG = 0: then ΔH = TΔS, so T = ΔH ÷ ΔS; ΔS is in J, so multiply by 1,000 to match ΔH’s kJ.',
            work: (v) => [`T = ${fmt(1000 * v.dH!)}/${signed(v.dS!)}`],
            note: (v) =>
              v.dS! > 0
                ? `(both positive: spontaneous above ${fmt(v.Tc!)} K)`
                : `(both negative: spontaneous below ${fmt(v.Tc!)} K)`,
          },
          dH: { expr: '{Tc} × {dS}/1,000', how: 'At the switch ΔH equals TΔS.' },
          dS: { expr: '1,000 × {dH}/{Tc}', how: 'At the switch ΔS is ΔH over T.' },
        },
      },
    ),
    example: { dH: 60, dS: 150, m: -0.15, Tc: 400 },
    startWith: ['dH', 'dS'],
    representation: {
      kind: 'functionGraph',
      family: 'linear',
      m: 'm',
      b: 'dH',
      shows: { zeros: ['Tc'] },
      marks: ['zeros'],
      xMin: 0,
      axes: FREE_AXES,
      fixed: true,
    },
  },
  {
    id: 's.10.entropy-free-energy~from-tables',
    title: 'ΔS° from a table, then ΔG°',
    use: 'Use this for “The products’ standard entropies add to 214 J/(mol·K) and the reactants’ to 188; ΔH° = −50 kJ/mol. What are ΔS° and ΔG° at 298 K?”',
    unitSystems: ['metric'],
    assumptions: [
      'Each sum is over one side of the balanced equation: every S° is multiplied by its coefficient first.',
      'A change is products minus reactants, so ΔS° = S°products − S°reactants; ΔG°f values from a table subtract the same way.',
      'ΔG° = ΔH° − TΔS°, with ΔS° divided by 1,000 to match ΔH°’s kJ; tables are for 298 K.',
    ],
    variables: [
      quantity('Sp', 'S°products', 'Entropy of the products (sum)', 'J/(mol·K)', 0, 10000, 0.01),
      quantity('Sr', 'S°reactants', 'Entropy of the reactants (sum)', 'J/(mol·K)', 0, 10000, 0.01),
      quantity('dS', 'ΔS°', 'Standard entropy change', 'J/(mol·K)', -10000, 10000, 0.01),
      quantity('dH', 'ΔH°', 'Standard enthalpy change', 'kJ/mol', -10000, 10000, 0.01),
      quantity('T', 'T', 'Temperature', 'K', 1, 5000, 0.1),
      quantity('dG', 'ΔG°', 'Standard free energy change', 'kJ/mol', -60000, 60000, 0.0001),
    ],
    ...rules(
      {
        relation: {
          id: 'ΔS° = S°products − S°reactants',
          display: '{dS} = {Sp} − {Sr}',
          vars: ['dS', 'Sp', 'Sr'],
          residual: (v) => v.dS! - (v.Sp! - v.Sr!),
          solve: { dS: (v) => v.Sp! - v.Sr!, Sp: (v) => v.dS! + v.Sr!, Sr: (v) => v.Sp! - v.dS! },
        },
        steps: {
          dS: {
            expr: '{Sp} − {Sr}',
            how: 'Products minus reactants: a positive change means the products are more spread out.',
          },
          Sp: { expr: '{dS} + {Sr}', how: 'Add the change to the reactants’ sum.' },
          Sr: { expr: '{Sp} − {dS}', how: 'Take the change from the products’ sum.' },
        },
      },
      {
        relation: {
          id: 'ΔG° = ΔH° − TΔS°',
          display: '{dG} = {dH} − {T} × {dS}/1,000',
          vars: ['dG', 'dH', 'T', 'dS'],
          residual: (v) => v.dG! - (v.dH! - (v.T! * v.dS!) / 1000),
          solve: {
            dG: (v) => v.dH! - (v.T! * v.dS!) / 1000,
            dH: (v) => v.dG! + (v.T! * v.dS!) / 1000,
            T: (v) => div(1000 * (v.dH! - v.dG!), v.dS!),
            dS: (v) => div(1000 * (v.dH! - v.dG!), v.T!),
          },
        },
        steps: {
          dG: {
            expr: '{dH} − {T} × {dS}/1,000',
            how: 'Take TΔS°, in kJ, from ΔH°.',
            work: (v) => [`ΔG° = ${fmt(v.dH!)} − ${signed((v.T! * v.dS!) / 1000)}`],
            note: (v) =>
              v.dG === 0
                ? '(0: at equilibrium)'
                : v.dG! < 0
                  ? `(below 0: spontaneous at ${fmt(v.T!)} K)`
                  : `(above 0: not spontaneous at ${fmt(v.T!)} K)`,
          },
          dH: { expr: '{dG} + {T} × {dS}/1,000', how: 'Add TΔS° back to ΔG°.' },
          T: {
            expr: '1,000 × ({dH} − {dG})/{dS}',
            how: 'TΔS° is what ΔH° and ΔG° differ by: divide it by ΔS°.',
          },
          dS: {
            expr: '1,000 × ({dH} − {dG})/{T}',
            how: 'TΔS° is what ΔH° and ΔG° differ by: divide it by T.',
          },
        },
      },
    ),
    example: { Sp: 214, Sr: 188, dS: 26, dH: -50, T: 298, dG: -57.748 },
    startWith: ['Sp', 'Sr', 'dH', 'T'],
    representation: {
      kind: 'integerLine',
      value: 'Sr',
      second: 'Sp',
      // No `change`: the line draws the jump from the two sums itself, and the harness's
      // absolute 10⁻⁹ check misreads sums past 1,000 rounded to 12 figures (lead).
      min: 0,
      max: 1000,
      unit: 'J/(mol·K)',
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
  ...PHASE,
  ...FREE,
  ...ADDED,
];
