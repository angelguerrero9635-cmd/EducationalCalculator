/**
 * Grade 9 science: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md; the
 * direction plan and build notes: docs/BUILD_HS.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/science9.ts`.
 */
import { formatNumber } from '@/engine/format';
import type { Relation, Values, VariableDef } from '@/engine/types';

import { div } from '../helpers';
import type { ModuleDef, StepText } from '../types';

// ─── Helpers only Grade 9 biology uses ──────────────────────────────────────

/** A relation and its step text, built together. */
interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

/** Gathers rules into a module's `relations` and `steps`. */
const rules = (...rs: Rule[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(
    rs.filter((r) => !r.relation.hidden).map((r) => [r.relation.id, r.steps]),
  ),
});

/**
 * `out` worked out from `ins` one way only (a derived value): the other values can't be found
 * back from it, so their solvers are `() => undefined`.
 */
function forward(
  id: string,
  display: string,
  out: string,
  ins: string[],
  f: (v: Values) => number | undefined,
  expr: string,
  how: string,
): Rule {
  return {
    relation: {
      id,
      display,
      vars: [out, ...ins],
      residual: (v: Values) => v[out]! - (f(v) ?? NaN),
      solve: Object.fromEntries([
        [out, f],
        ...ins.map((x) => [x, () => undefined]),
      ]) as Relation['solve'],
    },
    steps: { [out]: { expr, how } },
  };
}

/** A relation with a solver and step for each value it can be solved for. */
function both(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  parts: Record<string, [(v: Values) => number | undefined, string, string]>,
): Rule {
  return {
    relation: {
      id,
      display,
      vars,
      residual,
      solve: Object.fromEntries(
        vars.map((x) => [x, parts[x] ? parts[x][0] : () => undefined]),
      ) as Relation['solve'],
    },
    steps: Object.fromEntries(
      Object.entries(parts).map(([x, [, expr, how]]) => [x, { expr, how }]),
    ),
  };
}

/** A whole-number count. */
const count = (
  id: string,
  symbol: string,
  name: string,
  min: number,
  max: number,
  derived = false,
): VariableDef => ({
  id,
  symbol,
  name,
  min,
  max,
  step: 1,
  integer: true,
  ...(derived ? { derived: true } : {}),
});

/** A parent's count of one allele (0, 1 or 2; a father's X: 0 or 1). */
const alleles = (id: string, symbol: string, name: string, max = 2): VariableDef => ({
  ...count(id, symbol, name, 0, max),
  allowed: Array.from({ length: max + 1 }, (_, k) => k),
});

/** An expected count among offspring: an average, so it can be a quarter (derived). */
const expect = (id: string, symbol: string, name: string): VariableDef => ({
  id,
  symbol,
  name,
  min: 0,
  max: 1000,
  step: 0.25,
  derived: true,
});

/** Boxes of 4 showing the dominant trait: 4 − (2 − a)(2 − b), one way. */
const showing = (out: string, a: string, b: string, trait: string): Rule =>
  forward(
    `${out} = 4 − (2 − ${a})(2 − ${b})`,
    `{${out}} = 4 − (2 − {${a}}) × (2 − {${b}})`,
    out,
    [a, b],
    (v) => 4 - (2 - v[a]!) * (2 - v[b]!),
    `4 − (2 − {${a}}) × (2 − {${b}})`,
    `Only boxes with a recessive allele from both parents lack the ${trait} trait; the rest of the 4 show it.`,
  );

/** A frequency or share, 0 to 1. */
const freq = (id: string, symbol: string, name: string, derived = false): VariableDef => ({
  id,
  symbol,
  name,
  min: 0,
  max: 1,
  step: 0.0001,
  ...(derived ? { derived: true } : {}),
});

/**
 * Expected people with a genotype: N × its share (one way), with the whole number of people
 * it means when the product isn't whole ("(about 347 people)").
 */
const expected = (out: string, share: string, what: string): Rule =>
  withStep(
    forward(
      `${out} = N × ${share}`,
      `{${out}} = {N} × {${share}}`,
      out,
      ['N', share],
      (v) => v.N! * v[share]!,
      `{N} × {${share}}`,
      `The ${what} share of the N people.`,
    ),
    out,
    {
      note: (v) =>
        Math.abs(v[out]! - Math.round(v[out]!)) > 1e-6
          ? `(about ${fmt(Math.round(v[out]!))} people)`
          : '',
    },
  );

/** A value the story keeps strictly below another (a start below the carrying capacity). */
const below = (small: string, big: string, message?: string): Rule => ({
  relation: {
    id: `${small} < ${big}`,
    constraint: true,
    display: `{${small}} is less than {${big}}`,
    vars: [small, big],
    residual: (v: Values) => (v[small]! < v[big]! ? 0 : 1),
    solve: {},
    ...(message
      ? {
          message: (v: Values) =>
            v[small] !== undefined && v[big] !== undefined && v[small]! >= v[big]!
              ? message
              : undefined,
        }
      : {}),
  },
  steps: {},
});

/** A page limit the story sets (not a formula): `ok` says whether the values keep to it. */
const limit = (
  id: string,
  display: string,
  vars: string[],
  ok: (v: Values) => boolean,
  message?: string | ((v: Values) => string),
): Rule => ({
  relation: {
    id,
    constraint: true,
    display,
    vars,
    residual: (v: Values) => (ok(v) ? 0 : 1),
    solve: {},
    ...(message
      ? {
          message: (v: Values) =>
            vars.every((x) => v[x] !== undefined) && !ok(v)
              ? typeof message === 'string'
                ? message
                : message(v)
              : undefined,
        }
      : {}),
  },
  steps: {},
});

const fmt = (x: number) => formatNumber(x);

/** More step text (work lines, a note) for one value a rule solves for. */
const withStep = (r: Rule, id: string, extra: Partial<StepText>): Rule => ({
  ...r,
  steps: { ...r.steps, [id]: { ...r.steps[id]!, ...extra } },
});

/** A rule that says why its value can't be found, when `why` returns a sentence. */
const saying = (r: Rule, why: (v: Values) => string | undefined): Rule => ({
  ...r,
  relation: { ...r.relation, message: why },
});

/** The logistic curve N = K ÷ (1 + Ae^(−rt)), A = (K − N₀) ÷ N₀. */
const logistic = (v: Values) => v.K! / (1 + ((v.K! - v.N0!) / v.N0!) * Math.exp(-v.r! * v.t!));

/** out = a ± b both ways, for counts after particles cross. */
const plusMinus = (out: string, a: string, b: string, sign: 1 | -1, how: string): Rule =>
  both(
    `${out} = ${a} ${sign > 0 ? '+' : '−'} ${b}`,
    `{${out}} = {${a}} ${sign > 0 ? '+' : '−'} {${b}}`,
    [out, a, b],
    (v) => v[out]! - (v[a]! + sign * v[b]!),
    {
      [out]: [(v) => v[a]! + sign * v[b]!, `{${a}} ${sign > 0 ? '+' : '−'} {${b}}`, how],
    },
  );

/** Energy at a feeding level, in kilocalories. */
const kcal = (id: string, symbol: string, name: string): VariableDef => ({
  id,
  symbol,
  name,
  unit: 'kcal',
  min: 0.001,
  max: 10000000,
  step: 0.01,
});

/** Level `up` keeps p% of level `down`: up = down × p ÷ 100, every way. */
const passUp = (up: string, down: string, what: string): Rule =>
  both(
    `${up} = ${down} × p ÷ 100`,
    `{${up}} = {${down}} × {p} ÷ 100`,
    [up, down, 'p'],
    (v) => v[up]! - (v[down]! * v.p!) / 100,
    {
      [up]: [
        (v) => (v[down]! * v.p!) / 100,
        `{${down}} × {p} ÷ 100`,
        `Only p% of the energy ${what} is stored in the level above.`,
      ],
      [down]: [
        (v) => div(v[up]! * 100, v.p!),
        `{${up}} × 100 ÷ {p}`,
        'Undo taking the percent: multiply by 100 and divide by p.',
      ],
      p: [
        (v) => div(v[up]! * 100, v[down]!),
        `100 × {${up}} ÷ {${down}}`,
        'The energy passed up as a percent of the level below.',
      ],
    },
  );

/** One species’ share squared, (n ÷ N)², in Simpson’s index. */
const share2 = (n: string) => `({${n}} ÷ {N})^2`;

/** A short gene's template strand: mRNA AUG GCC AAG UAA, Met–Ala–Lys–Stop. */
const GENE = 'TACCGGTTCATT';

/** k = ⌈p ÷ 3⌉: the codon a base falls in (one way). */
const codonOf = (k: string, p: string): Rule =>
  forward(
    `${k} = ⌈${p} ÷ 3⌉`,
    `{${k}} = ⌈{${p}} ÷ 3⌉`,
    k,
    [p],
    (v) => Math.ceil(v[p]! / 3 - 1e-9),
    `⌈{${p}} ÷ 3⌉`,
    'Bases 1 to 3 are codon 1, bases 4 to 6 codon 2, and so on: divide by 3 and round up.',
  );

/** y = x, both ways. */
const same = (y: string, x: string, how: string): Rule =>
  both(`${y} = ${x}`, `{${y}} = {${x}}`, [y, x], (v) => v[y]! - v[x]!, {
    [y]: [(v) => v[x]!, `{${x}}`, how],
    [x]: [(v) => v[y]!, `{${y}}`, how],
  });

/** A length of DNA in base pairs. */
const bp = (id: string, symbol: string, name: string, min: number, max: number): VariableDef => ({
  id,
  symbol,
  name,
  unit: 'bp',
  min,
  max,
  step: 10,
  integer: true,
});

// ─── The pages, in taxonomy order ───────────────────────────────────────────

const BIOMOLECULES: ModuleDef[] = [
  // ── The chemistry of life: water and biomolecules (HS-LS1-6, HS-LS1-1) ──
  {
    id: 's.9.biomolecules~dehydration',
    title: 'Dehydration synthesis: water and mass',
    use: 'Use this for “How many water molecules leave, and what is the polymer’s mass?”',
    unitSystems: ['metric'],
    assumptions: [
      'Each bond joining two monomers gives off one water molecule, 18 g/mol.',
      'The monomers form one chain, not a ring, so a chain of n units has n − 1 bonds.',
      'A fat is the exception: three fatty acids join one glycerol and give off 3 water.',
      'Glucose is 180 g/mol, so two glucose make maltose, 2 × 180 − 18 = 342 g/mol.',
    ],
    variables: [
      count('n', 'n', 'Monomers joined', 2, 1000),
      count('b', 'b', 'Bonds formed', 1, 999, true),
      count('w', 'w', 'Water molecules given off', 1, 999, true),
      {
        id: 'm',
        symbol: 'm',
        name: 'Mass of one monomer',
        unit: 'g/mol',
        min: 50,
        max: 1000,
        step: 1,
      },
      {
        id: 'M',
        symbol: 'M',
        name: 'Mass of the polymer',
        unit: 'g/mol',
        min: 0,
        max: 1000000,
        step: 1,
        derived: true,
      },
    ],
    ...rules(
      both('b = n − 1', '{b} = {n} − 1', ['b', 'n'], (v) => v.b! - (v.n! - 1), {
        b: [(v) => v.n! - 1, '{n} − 1', 'A chain has one bond fewer than its units.'],
        n: [(v) => v.b! + 1, '{b} + 1', 'One more unit than bonds.'],
      }),
      same('w', 'b', 'Every bond gives off one water molecule.'),
      both(
        'M = n × m − 18 × w',
        '{M} = {n} × {m} − 18 × {w}',
        ['M', 'n', 'm', 'w'],
        (v) => v.M! - (v.n! * v.m! - 18 * v.w!),
        {
          M: [
            (v) => v.n! * v.m! - 18 * v.w!,
            '{n} × {m} − 18 × {w}',
            'Add the monomers’ masses, then take away 18 g/mol for each water molecule given off.',
          ],
          m: [
            (v) => div(v.M! + 18 * v.w!, v.n!),
            '({M} + 18 × {w}) ÷ {n}',
            'Put the water back on, then share the mass among the monomers.',
          ],
        },
      ),
    ),
    example: { n: 3, b: 2, w: 2, m: 180, M: 504 },
    startWith: ['n', 'm'],
    representation: {
      kind: 'macromolecules',
      macro: 'carbohydrate',
      count: 'n',
      bonds: 'b',
      water: 'w',
    },
  },
];

const MEMBRANE: ModuleDef[] = [
  // ── Cell membranes and transport (HS-LS1-2, HS-LS1-3) ──
  {
    id: 's.9.membrane-transport',
    unitSystems: ['metric'],
    assumptions: [
      'Particles move both ways at random, so the net flow runs from the side with more to the side with fewer.',
      'Small nonpolar molecules such as O₂ and CO₂ cross the bilayer with no protein and no ATP.',
      'At equal counts particles still cross, but the net movement is zero: dynamic equilibrium.',
    ],
    variables: [
      count('o', 'o', 'O₂ outside', 0, 40),
      count('i', 'i', 'O₂ inside', 0, 40),
      count('m', 'm', 'O₂ moving in now', 0, 12),
      count('d', 'd', 'Gradient (outside − inside)', -40, 40, true),
      count('o2', 'o₂', 'O₂ outside after', 0, 40, true),
      count('i2', 'i₂', 'O₂ inside after', 0, 40, true),
    ],
    ...rules(
      forward(
        'd = o − i',
        '{d} = {o} − {i}',
        'd',
        ['o', 'i'],
        (v) => v.o! - v.i!,
        '{o} − {i}',
        'The gradient is the difference across the membrane: outside minus inside.',
      ),
      plusMinus('o2', 'o', 'm', -1, 'The particles that cross in leave the outside.'),
      plusMinus('i2', 'i', 'm', 1, 'The particles that cross in join the inside.'),
      limit(
        '2m ≤ d',
        '{m} is at most half of {d}, or 0',
        ['m', 'd'],
        (v) => 2 * v.m! <= Math.max(0, v.d!) + 1e-9,
        (v) =>
          v.d! <= 0
            ? 'With no more O₂ outside than inside, none moves in: the net flow is out, or zero.'
            : 'Net movement stops at equal counts, so at most half the gradient moves in.',
      ),
    ),
    example: { o: 20, i: 8, m: 6, d: 12, o2: 14, i2: 14 },
    startWith: ['o', 'i', 'm'],
    pictureLabels: ['o2', 'i2'],
    representation: {
      kind: 'membrane',
      outside: 'o',
      inside: 'i',
      transport: 'diffusion',
      particle: 'O₂',
      moved: 'm',
      gradient: 'd',
    },
  },
  {
    id: 's.9.membrane-transport~pump',
    title: 'The sodium–potassium pump',
    use: 'Use this for “How many Na⁺ and K⁺ ions does the pump move for 2 ATP?”',
    unitSystems: ['metric'],
    assumptions: [
      'Each cycle, the pump splits one ATP to move 3 Na⁺ out of the cell and 2 K⁺ in.',
      'It moves Na⁺ from the side with fewer to the side with more, against the gradient: that needs energy.',
      'Only the Na⁺ counts are drawn; the K⁺ move the opposite way.',
    ],
    variables: [
      count('o', 'o', 'Na⁺ outside', 0, 40),
      count('i', 'i', 'Na⁺ inside', 0, 40),
      count('c', 'c', 'Pump cycles', 1, 4),
      count('s', 's', 'Na⁺ pumped out', 3, 12, true),
      count('k', 'k', 'K⁺ pumped in', 2, 8, true),
      count('a', 'a', 'ATP used', 1, 4),
      count('o2', 'o₂', 'Na⁺ outside after', 0, 52, true),
      count('i2', 'i₂', 'Na⁺ inside after', 0, 40, true),
    ],
    ...rules(
      forward(
        's = 3c',
        '{s} = 3 × {c}',
        's',
        ['c'],
        (v) => 3 * v.c!,
        '3 × {c}',
        'Each cycle moves 3 Na⁺ out of the cell.',
      ),
      forward(
        'k = 2c',
        '{k} = 2 × {c}',
        'k',
        ['c'],
        (v) => 2 * v.c!,
        '2 × {c}',
        'Each cycle brings 2 K⁺ into the cell.',
      ),
      same('a', 'c', 'Each cycle splits one ATP.'),
      plusMinus('o2', 'o', 's', 1, 'The Na⁺ pumped out join the outside.'),
      saying(plusMinus('i2', 'i', 's', -1, 'The Na⁺ pumped out leave the inside.'), (v) =>
        v.i !== undefined && v.s !== undefined && v.s > v.i
          ? 'The pump can’t move out more Na⁺ than the cell holds: s is at most i.'
          : undefined,
      ),
      below(
        'i',
        'o',
        'This page needs less Na⁺ inside than outside: the pump pushes it against the gradient.',
      ),
    ),
    example: { o: 20, i: 8, c: 2, s: 6, k: 4, a: 2, o2: 26, i2: 2 },
    startWith: ['o', 'i', 'c'],
    pictureLabels: ['k', 'o2', 'i2'],
    representation: {
      kind: 'membrane',
      outside: 'o',
      inside: 'i',
      transport: 'active',
      particle: 'Na⁺',
      moved: 's',
      atp: 'a',
    },
  },
];

/** out = k₁ × a (+ k₂ × b): an atom or molecule count, worked forward. */
const tally = (out: string, terms: [number, string][], how: string): Rule => {
  const text = terms.map(([k, a]) => (k === 1 ? `{${a}}` : `${k} × {${a}}`)).join(' + ');
  return forward(
    `${out} = ${text.replace(/[{}]/g, '')}`,
    `{${out}} = ${text}`,
    out,
    terms.map(([, a]) => a),
    (v) => terms.reduce((s, [k, a]) => s + k * v[a]!, 0),
    text,
    how,
  );
};

const ENERGY: ModuleDef[] = [
  // ── Cellular energy: ATP, photosynthesis and cellular respiration (HS-LS1-5, 1-7, 2-3, 2-5) ──
  {
    id: 's.9.cellular-energy~equation',
    title: 'The photosynthesis equation',
    use: 'Use this for “How many CO₂ molecules make 2 glucose molecules, and are the atoms conserved?”',
    assumptions: [
      'Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Respiration is the same equation read backward.',
      'Atoms are rearranged, never made or lost: each element has as many atoms after as before.',
    ],
    variables: [
      count('g', 'g', 'Glucose molecules made', 1, 3),
      count('c', 'c', 'CO₂ molecules', 6, 18, true),
      count('w', 'w', 'H₂O molecules', 6, 18, true),
      count('o', 'o', 'O₂ molecules', 6, 18, true),
      count('C1', 'C₁', 'Carbon atoms before', 6, 18, true),
      count('C2', 'C₂', 'Carbon atoms after', 6, 18, true),
      count('H1', 'H₁', 'Hydrogen atoms before', 12, 36, true),
      count('H2', 'H₂', 'Hydrogen atoms after', 12, 36, true),
      count('O1', 'O₁', 'Oxygen atoms before', 18, 54, true),
      count('O2', 'O₂', 'Oxygen atoms after', 18, 54, true),
    ],
    ...rules(
      tally('c', [[6, 'g']], 'Each glucose takes 6 CO₂.'),
      tally('w', [[6, 'g']], 'Each glucose takes 6 H₂O.'),
      tally('o', [[6, 'g']], 'Each glucose gives off 6 O₂.'),
      tally('C1', [[1, 'c']], 'One carbon in each CO₂.'),
      tally('C2', [[6, 'g']], 'Six carbons in each glucose.'),
      tally('H1', [[2, 'w']], 'Two hydrogens in each H₂O.'),
      tally('H2', [[12, 'g']], 'Twelve hydrogens in each glucose.'),
      tally(
        'O1',
        [
          [2, 'c'],
          [1, 'w'],
        ],
        'Two oxygens in each CO₂ and one in each H₂O.',
      ),
      tally(
        'O2',
        [
          [6, 'g'],
          [2, 'o'],
        ],
        'Six oxygens in each glucose and two in each O₂.',
      ),
    ),
    example: { g: 1, c: 6, w: 6, o: 6, C1: 6, C2: 6, H1: 12, H2: 12, O1: 18, O2: 18 },
    startWith: ['g'],
    representation: {
      kind: 'reaction',
      reactants: [
        { formula: 'CO2', count: 'c' },
        { formula: 'H2O', count: 'w' },
      ],
      products: [
        { formula: 'C6H12O6', count: 'g' },
        { formula: 'O2', count: 'o' },
      ],
      atoms: { C: ['C1', 'C2'], H: ['H1', 'H2'], O: ['O1', 'O2'] },
      many: true,
    },
  },
];

const DIVISION: ModuleDef[] = [
  // ── The cell cycle and its control (HS-LS1-4) ──
  {
    id: 's.9.mitosis-meiosis~mitotic-index',
    title: 'Mitotic index',
    use: 'Use this for “20 of 100 root-tip cells are in mitosis. How long does mitosis last in a 24-hour cycle?”',
    unitSystems: ['metric'],
    assumptions: [
      'The cells are counted in one field of a root tip under a microscope, each in the phase it was in when fixed.',
      'Cells divide at random times, so the share of cells in a phase is the share of the cycle spent in it.',
      'The mitotic index is the percent of cells in mitosis; a fast-growing tissue, or a tumor, has a high one.',
    ],
    variables: [
      // One field of a root tip holds a few hundred cells: ranges that fit, so the sliders
      // sit where the counts are, not all at the bottom.
      count('I', 'I', 'Cells in interphase', 0, 300),
      count('P', 'P', 'Cells in prophase', 0, 100),
      count('M', 'M', 'Cells in metaphase', 0, 100),
      count('A', 'A', 'Cells in anaphase', 0, 100),
      count('T', 'T', 'Cells in telophase', 0, 100),
      count('N', 'N', 'Cells counted', 1, 700, true),
      count('m', 'm', 'Cells in mitosis', 0, 400, true),
      {
        id: 'x',
        symbol: 'x',
        name: 'Mitotic index',
        unit: '%',
        min: 0,
        max: 100,
        step: 0.1,
        derived: true,
      },
      {
        id: 'h',
        symbol: 'h',
        name: 'Length of one cycle',
        unit: 'h',
        units: ['h'],
        min: 1,
        max: 100,
        step: 0.5,
      },
      {
        id: 't',
        symbol: 't',
        name: 'Time in mitosis',
        unit: 'h',
        units: ['h'],
        min: 0,
        max: 100,
        step: 0.01,
        derived: true,
      },
    ],
    ...rules(
      forward(
        'N = I + P + M + A + T',
        '{N} = {I} + {P} + {M} + {A} + {T}',
        'N',
        ['I', 'P', 'M', 'A', 'T'],
        (v) => v.I! + v.P! + v.M! + v.A! + v.T!,
        '{I} + {P} + {M} + {A} + {T}',
        'Every cell counted is in interphase or in one phase of mitosis.',
      ),
      forward(
        'm = P + M + A + T',
        '{m} = {P} + {M} + {A} + {T}',
        'm',
        ['P', 'M', 'A', 'T'],
        (v) => v.P! + v.M! + v.A! + v.T!,
        '{P} + {M} + {A} + {T}',
        'The cells in any of the four phases of mitosis.',
      ),
      forward(
        'x = 100 × m ÷ N',
        '{x} = 100 × {m} ÷ {N}',
        'x',
        ['m', 'N'],
        (v) => div(100 * v.m!, v.N!),
        '100 × {m} ÷ {N}',
        'The cells in mitosis as a percent of all the cells counted.',
      ),
      forward(
        't = m × h ÷ N',
        '{t} = {m} × {h} ÷ {N}',
        't',
        ['m', 'h', 'N'],
        (v) => div(v.m! * v.h!, v.N!),
        '{m} × {h} ÷ {N}',
        'The share of cells in mitosis, m ÷ N, is the share of the cycle spent in mitosis.',
      ),
      limit(
        'N ≥ 1',
        '{N} is at least 1',
        ['N'],
        (v) => v.N! >= 1,
        'Count at least one cell: the index is a share of the cells counted.',
      ),
    ),
    example: { I: 80, P: 10, M: 5, A: 3, T: 2, N: 100, m: 20, x: 20, h: 24, t: 4.8 },
    startWith: ['I', 'P', 'M', 'A', 'T', 'h'],
    representation: {
      kind: 'pieChart',
      parts: ['I', 'P', 'M', 'A', 'T'],
      total: 'N',
      group: { id: 'm', parts: ['P', 'M', 'A', 'T'] },
      stages: ['interphase', 'prophase', 'metaphase', 'anaphase', 'telophase'],
    },
  },
  {
    id: 's.9.mitosis-meiosis~chromosome-count',
    title: 'Counting chromosomes',
    use: 'Use this for “A body cell has 46 chromosomes. How many are in a gamete, and in a zygote?”',
    unitSystems: ['metric'],
    assumptions: [
      'A body cell holds 2n chromosomes: n pairs, one of each pair from each parent.',
      'Meiosis leaves one chromosome of each pair in a gamete; fertilization joins two gametes.',
      'A human has 2n = 46 and a fruit fly 2n = 8; crossing over is left out of the count of gametes.',
    ],
    variables: [
      { ...count('D', '2n', 'Chromosomes in a body cell', 2, 100), multipleOf: 2 },
      count('n', 'n', 'Chromosomes in a gamete', 1, 50, true),
      count('X', 'X', 'Chromatids at metaphase', 4, 200, true),
      count('Z', 'Z', 'Chromosomes in a zygote', 2, 100, true),
      count('C', 'C', 'Kinds of gamete', 2, 2 ** 50, true),
    ],
    ...rules(
      forward(
        'n = D ÷ 2',
        '{n} = {D} ÷ 2',
        'n',
        ['D'],
        (v) => v.D! / 2,
        '{D} ÷ 2',
        'A gamete keeps one chromosome of each pair.',
      ),
      forward(
        'X = 2 × D',
        '{X} = 2 × {D}',
        'X',
        ['D'],
        (v) => 2 * v.D!,
        '2 × {D}',
        'Before division each chromosome is copied: two sister chromatids.',
      ),
      forward(
        'Z = n + n',
        '{Z} = {n} + {n}',
        'Z',
        ['n'],
        (v) => 2 * v.n!,
        '{n} + {n}',
        'An egg and a sperm join, each with n chromosomes.',
      ),
      forward(
        'C = 2^n',
        '{C} = 2^{n}',
        'C',
        ['n'],
        (v) => 2 ** v.n!,
        '2^{n}',
        'Each pair lines up either way round, so every pair doubles the kinds of gamete.',
      ),
    ),
    example: { D: 8, n: 4, X: 16, Z: 8, C: 16 },
    startWith: ['D'],
    representation: {
      kind: 'cellDivision',
      diploid: 'D',
      haploid: 'n',
      chromatids: 'X',
      zygote: 'Z',
      combinations: 'C',
    },
  },
];

const INHERITANCE: ModuleDef[] = [
  // ── Mendelian and non-Mendelian inheritance (HS-LS3-2, HS-LS3-3) ──
  {
    id: 's.9.inheritance-patterns',
    unitSystems: ['metric'],
    assumptions: [
      'Pea seeds: R (round) is dominant to r (wrinkled), and Y (yellow) is dominant to y (green).',
      'The two genes are on different chromosomes, so they sort independently into the gametes.',
      'Each parent’s 4 gametes (some may repeat) are equally likely, so each of the 16 boxes is 1/16.',
      'The product rule: the chance of both traits is the one-gene chances multiplied.',
    ],
    variables: [
      alleles('a', 'a', 'R alleles in the first parent'),
      alleles('c', 'c', 'R alleles in the second parent'),
      alleles('b', 'b', 'Y alleles in the first parent'),
      alleles('e', 'e', 'Y alleles in the second parent'),
      count('tR', 't_R', 'Boxes of 4 with round seeds', 0, 4, true),
      count('tY', 't_Y', 'Boxes of 4 with yellow seeds', 0, 4, true),
      count('D', 'D', 'Round yellow, boxes of 16', 0, 16, true),
      count('F', 'F', 'Round green, boxes of 16', 0, 16, true),
      count('S', 'S', 'Wrinkled yellow, boxes of 16', 0, 16, true),
      count('N', 'N', 'Wrinkled green, boxes of 16', 0, 16, true),
    ],
    ...rules(
      showing('tR', 'a', 'c', 'round'),
      showing('tY', 'b', 'e', 'yellow'),
      forward(
        'D = t_R × t_Y',
        '{D} = {tR} × {tY}',
        'D',
        ['tR', 'tY'],
        (v) => v.tR! * v.tY!,
        '{tR} × {tY}',
        'The genes sort independently, so multiply: round in t_R of 4 and yellow in t_Y of 4.',
      ),
      forward(
        'F = t_R × (4 − t_Y)',
        '{F} = {tR} × (4 − {tY})',
        'F',
        ['tR', 'tY'],
        (v) => v.tR! * (4 - v.tY!),
        '{tR} × (4 − {tY})',
        'Round in t_R of 4 times green, the other 4 − t_Y of 4.',
      ),
      forward(
        'S = (4 − t_R) × t_Y',
        '{S} = (4 − {tR}) × {tY}',
        'S',
        ['tR', 'tY'],
        (v) => (4 - v.tR!) * v.tY!,
        '(4 − {tR}) × {tY}',
        'Wrinkled, the other 4 − t_R of 4, times yellow in t_Y of 4.',
      ),
      forward(
        'N = (4 − t_R) × (4 − t_Y)',
        '{N} = (4 − {tR}) × (4 − {tY})',
        'N',
        ['tR', 'tY'],
        (v) => (4 - v.tR!) * (4 - v.tY!),
        '(4 − {tR}) × (4 − {tY})',
        'Neither dominant trait: wrinkled times green.',
      ),
    ),
    example: { a: 1, c: 1, b: 1, e: 1, tR: 3, tY: 3, D: 9, F: 3, S: 3, N: 1 },
    startWith: ['a', 'c', 'b', 'e'],
    representation: {
      kind: 'punnettSquare',
      first: 'a',
      second: 'c',
      letter: 'R',
      dominant: 'D',
      recessive: 'N',
      inheritance: {
        pattern: 'dihybrid',
        firstB: 'b',
        secondB: 'e',
        letterB: 'Y',
        names: ['round yellow', 'round green', 'wrinkled yellow', 'wrinkled green'],
      },
    },
  },
  {
    id: 's.9.inheritance-patterns~genotype-ratio',
    title: 'Expected genotypes among many offspring',
    use: 'Use this for “Two carriers (Ff) have 100 children in all. How many are expected to be Ff?”',
    unitSystems: ['metric'],
    assumptions: [
      'F is dominant and f recessive; each parent is written by its count of F alleles: 2, 1 or 0.',
      'Each of the 4 boxes is a quarter of the offspring, so a genotype in k boxes is k quarters of them.',
      'Expected counts are averages: real families vary, as coin flips do.',
    ],
    variables: [
      alleles('a', 'a', 'F alleles in the first parent'),
      alleles('c', 'c', 'F alleles in the second parent'),
      count('n', 'n', 'Offspring in all', 1, 1000),
      count('t', 't', 'Boxes of 4 showing the trait', 0, 4, true),
      expect('nFF', 'n_FF', 'Expected FF'),
      expect('nFf', 'n_Ff', 'Expected Ff'),
      expect('nff', 'n_ff', 'Expected ff'),
      {
        id: 'cff',
        symbol: 'P_ff',
        name: 'Chance of ff',
        unit: '%',
        min: 0,
        max: 100,
        step: 25,
        derived: true,
      },
    ],
    ...rules(
      showing('t', 'a', 'c', 'dominant'),
      forward(
        'n_FF = n × a × c ÷ 4',
        '{nFF} = {n} × {a} × {c} ÷ 4',
        'nFF',
        ['n', 'a', 'c'],
        (v) => (v.n! * v.a! * v.c!) / 4,
        '{n} × {a} × {c} ÷ 4',
        'An F from each parent: a × c of the 4 boxes are FF, each a quarter of the offspring.',
      ),
      forward(
        'n_Ff = n × (a(2 − c) + c(2 − a)) ÷ 4',
        '{nFf} = {n} × ({a} × (2 − {c}) + {c} × (2 − {a})) ÷ 4',
        'nFf',
        ['n', 'a', 'c'],
        (v) => (v.n! * (v.a! * (2 - v.c!) + v.c! * (2 - v.a!))) / 4,
        '{n} × ({a} × (2 − {c}) + {c} × (2 − {a})) ÷ 4',
        'F from one parent and f from the other, either way round.',
      ),
      forward(
        'n_ff = n × (2 − a)(2 − c) ÷ 4',
        '{nff} = {n} × (2 − {a}) × (2 − {c}) ÷ 4',
        'nff',
        ['n', 'a', 'c'],
        (v) => (v.n! * (2 - v.a!) * (2 - v.c!)) / 4,
        '{n} × (2 − {a}) × (2 − {c}) ÷ 4',
        'An f from each parent: the f alleles of one times the f alleles of the other.',
      ),
      forward(
        'P_ff = 25 × (2 − a)(2 − c)',
        '{cff} = 25 × (2 − {a}) × (2 − {c})',
        'cff',
        ['a', 'c'],
        (v) => 25 * (2 - v.a!) * (2 - v.c!),
        '25 × (2 − {a}) × (2 − {c})',
        'Each box is 25% of the offspring, and (2 − a) × (2 − c) boxes are ff.',
      ),
    ),
    example: { a: 1, c: 1, n: 100, t: 3, nFF: 25, nFf: 50, nff: 25, cff: 25 },
    startWith: ['a', 'c', 'n'],
    representation: {
      kind: 'punnettSquare',
      first: 'a',
      second: 'c',
      dominant: 't',
      letter: 'F',
    },
  },
  {
    id: 's.9.inheritance-patterns~incomplete',
    title: 'Incomplete dominance',
    use: 'Use this for a cross where the heterozygote is a blend, such as pink snapdragons.',
    unitSystems: ['metric'],
    assumptions: [
      'Snapdragon color: CᴿCᴿ is red, CᵂCᵂ white, and CᴿCᵂ pink, a blend of the two.',
      'A parent is written by its count of Cᴿ alleles: 2, 1 or 0.',
      'Codominance differs: both alleles show in full, as in roan cattle or AB blood, with no blend.',
    ],
    variables: [
      alleles('a', 'a', 'Cᴿ alleles in the first parent'),
      alleles('c', 'c', 'Cᴿ alleles in the second parent'),
      count('R', 'R', 'Boxes of 4 red', 0, 4, true),
      count('P', 'P', 'Boxes of 4 pink', 0, 4, true),
      count('W', 'W', 'Boxes of 4 white', 0, 4, true),
    ],
    ...rules(
      forward(
        'R = a × c',
        '{R} = {a} × {c}',
        'R',
        ['a', 'c'],
        (v) => v.a! * v.c!,
        '{a} × {c}',
        'A box is red with a Cᴿ from each parent: one parent’s Cᴿ times the other’s.',
      ),
      forward(
        'P = a(2 − c) + c(2 − a)',
        '{P} = {a} × (2 − {c}) + {c} × (2 − {a})',
        'P',
        ['a', 'c'],
        (v) => v.a! * (2 - v.c!) + v.c! * (2 - v.a!),
        '{a} × (2 − {c}) + {c} × (2 − {a})',
        'A box is pink with Cᴿ from one parent and Cᵂ from the other, either way round.',
      ),
      forward(
        'W = (2 − a)(2 − c)',
        '{W} = (2 − {a}) × (2 − {c})',
        'W',
        ['a', 'c'],
        (v) => (2 - v.a!) * (2 - v.c!),
        '(2 − {a}) × (2 − {c})',
        'A box is white with a Cᵂ from each parent.',
      ),
    ),
    example: { a: 1, c: 1, R: 1, P: 2, W: 1 },
    startWith: ['a', 'c'],
    representation: {
      kind: 'punnettSquare',
      first: 'a',
      second: 'c',
      dominant: 'R',
      recessive: 'W',
      letter: 'C',
      inheritance: {
        pattern: 'incomplete',
        middle: 'P',
        alleles: ['R', 'W'],
        names: ['red', 'pink', 'white'],
      },
    },
  },
  {
    id: 's.9.inheritance-patterns~x-linked',
    title: 'A sex-linked trait',
    use: 'Use this for “A carrier mother and a father with normal vision: what is the chance a son is color-blind?”',
    unitSystems: ['metric'],
    assumptions: [
      'Xᴮ is normal color vision and Xᵇ red–green color blindness; the Y chromosome carries no copy.',
      'Sons get their only X from their mother, so one Xᵇ makes a son color-blind; males are never carriers.',
      'A daughter needs Xᵇ from both parents to show the trait; with one she is a carrier.',
    ],
    variables: [
      alleles('m', 'm', 'Xᴮ alleles in the mother'),
      alleles('f', 'f', 'Xᴮ alleles in the father', 1),
      count('r', 'r', 'Boxes of 4 color-blind', 0, 4, true),
      count('t', 't', 'Boxes of 4 with normal vision', 0, 4, true),
      count('k', 'k', 'Boxes of 4 carrier daughters', 0, 4, true),
      {
        id: 's',
        symbol: 's',
        name: 'Chance a son is color-blind',
        unit: '%',
        min: 0,
        max: 100,
        step: 50,
        derived: true,
      },
    ],
    ...rules(
      forward(
        'r = (2 − m)(2 − f)',
        '{r} = (2 − {m}) × (2 − {f})',
        'r',
        ['m', 'f'],
        (v) => (2 - v.m!) * (2 - v.f!),
        '(2 − {m}) × (2 − {f})',
        'Each Xᵇ from the mother makes one color-blind son, and one color-blind daughter too when the father’s X is Xᵇ.',
      ),
      both('t = 4 − r', '{t} = 4 − {r}', ['t', 'r'], (v) => v.t! + v.r! - 4, {
        t: [(v) => 4 - v.r!, '4 − {r}', 'The other boxes have normal vision.'],
      }),
      forward(
        'k = f(2 − m) + (1 − f)m',
        '{k} = {f} × (2 − {m}) + (1 − {f}) × {m}',
        'k',
        ['f', 'm'],
        (v) => v.f! * (2 - v.m!) + (1 - v.f!) * v.m!,
        '{f} × (2 − {m}) + (1 − {f}) × {m}',
        'A carrier daughter has one Xᴮ and one Xᵇ: the father’s X paired with the mother’s other allele.',
      ),
      forward(
        's = 50 × (2 − m)',
        '{s} = 50 × (2 − {m})',
        's',
        ['m'],
        (v) => 50 * (2 - v.m!),
        '50 × (2 − {m})',
        'A son gets one of his mother’s two X at random: 50% for each Xᵇ she has.',
      ),
    ),
    example: { m: 1, f: 1, r: 1, t: 3, k: 1, s: 50 },
    startWith: ['m', 'f'],
    representation: {
      kind: 'punnettSquare',
      first: 'm',
      second: 'f',
      dominant: 't',
      recessive: 'r',
      letter: 'B',
      inheritance: { pattern: 'xLinked', carriers: 'k' },
    },
  },
];

const DNA: ModuleDef[] = [
  // ── DNA structure, replication and protein synthesis (HS-LS1-1, HS-LS3-1) ──
  {
    id: 's.9.dna-protein-synthesis',
    unitSystems: ['metric'],
    assumptions: [
      'Three mRNA bases make a codon; AUG starts the chain and codes Met, and a stop codon adds no amino acid.',
      'So a coding mRNA of b bases, ending in its stop codon, codes b ÷ 3 − 1 amino acids.',
      'Each peptide bond joining two amino acids releases one water molecule.',
      'The picture draws a gene of up to 15 bases whole; a longer one, its first 12 bases, “…” and its stop codon.',
    ],
    variables: [
      { ...count('b', 'b', 'Bases in the coding mRNA', 6, 3000), multipleOf: 3 },
      count('c', 'c', 'Codons', 2, 1000, true),
      count('a', 'a', 'Amino acids in the chain', 1, 999, true),
      count('p', 'p', 'Peptide bonds', 0, 998, true),
      count('w', 'w', 'Water molecules released', 0, 998, true),
    ],
    ...rules(
      forward(
        'c = b ÷ 3',
        '{c} = {b} ÷ 3',
        'c',
        ['b'],
        (v) => v.b! / 3,
        '{b} ÷ 3',
        'Every three bases are one codon.',
      ),
      forward(
        'a = c − 1',
        '{a} = {c} − 1',
        'a',
        ['c'],
        (v) => v.c! - 1,
        '{c} − 1',
        'Every codon but the last codes an amino acid; the last is the stop codon.',
      ),
      forward(
        'p = a − 1',
        '{p} = {a} − 1',
        'p',
        ['a'],
        (v) => v.a! - 1,
        '{a} − 1',
        'A peptide bond joins each amino acid to the next: one fewer bond than amino acids.',
      ),
      forward(
        'w = p',
        '{w} = {p}',
        'w',
        ['p'],
        (v) => v.p!,
        '{p}',
        'Each peptide bond releases one water molecule.',
      ),
    ),
    example: { b: 12, c: 4, a: 3, p: 2, w: 2 },
    startWith: ['b'],
    pictureLabels: ['p', 'w'],
    representation: {
      kind: 'dnaStrand',
      sequence: 'TACCGGTTCGGA',
      gene: { bases: 'b' },
      codons: 'c',
    },
  },
  {
    id: 's.9.dna-protein-synthesis~chargaff',
    title: 'Base pairing: Chargaff’s rule',
    use: 'Use this for “A DNA sample is 30% adenine. What percent is guanine?”',
    unitSystems: ['metric'],
    assumptions: [
      'A always pairs with T, and G with C, so DNA has as much A as T and as much G as C.',
      'The four percents add to 100%, so A + G = 50%.',
      'An A–T pair is held by 2 hydrogen bonds and a G–C pair by 3, so DNA rich in G and C holds together more tightly.',
    ],
    variables: [
      { id: 'A', symbol: 'A', name: 'Adenine', unit: '%', min: 0, max: 50, step: 1 },
      { id: 'T', symbol: 'T', name: 'Thymine', unit: '%', min: 0, max: 50, step: 1 },
      { id: 'G', symbol: 'G', name: 'Guanine', unit: '%', min: 0, max: 50, step: 1 },
      { id: 'C', symbol: 'C', name: 'Cytosine', unit: '%', min: 0, max: 50, step: 1 },
      {
        id: 'AT',
        symbol: 'n_AT',
        name: 'A–T pairs per 10 pairs (average)',
        min: 0,
        max: 10,
        step: 0.1,
        derived: true,
      },
      {
        id: 'GC',
        symbol: 'n_GC',
        name: 'G–C pairs per 10 pairs (average)',
        min: 0,
        max: 10,
        step: 0.1,
        derived: true,
      },
      {
        id: 'H',
        symbol: 'H',
        name: 'Hydrogen bonds per 10 pairs (average)',
        min: 20,
        max: 30,
        step: 0.1,
        derived: true,
      },
    ],
    ...rules(
      same('T', 'A', 'Every A pairs with a T, so there are as many.'),
      both('G = 50 − A', '{G} = 50 − {A}', ['G', 'A'], (v) => v.G! - (50 - v.A!), {
        G: [
          (v) => 50 - v.A!,
          '50 − {A}',
          'A and T take 2A of the 100%; G and C share the rest equally: (100 − 2A) ÷ 2 = 50 − A.',
        ],
        A: [(v) => 50 - v.G!, '50 − {G}', 'A and G together are half the bases.'],
      }),
      same('C', 'G', 'Every G pairs with a C, so there are as many.'),
      forward(
        'n_AT = (A + T) ÷ 10',
        '{AT} = ({A} + {T}) ÷ 10',
        'AT',
        ['A', 'T'],
        (v) => (v.A! + v.T!) / 10,
        '({A} + {T}) ÷ 10',
        'A–T pairs are (A + T)% of all pairs, and (A + T)% of 10 pairs is (A + T) ÷ 10.',
      ),
      forward(
        'n_GC = 10 − n_AT',
        '{GC} = 10 − {AT}',
        'GC',
        ['AT'],
        (v) => 10 - v.AT!,
        '10 − {AT}',
        'Every pair that is not A–T is G–C.',
      ),
      forward(
        'H = 2n_AT + 3n_GC',
        '{H} = 2 × {AT} + 3 × {GC}',
        'H',
        ['AT', 'GC'],
        (v) => 2 * v.AT! + 3 * v.GC!,
        '2 × {AT} + 3 × {GC}',
        'Two hydrogen bonds hold each A–T pair and three hold each G–C pair.',
      ),
    ),
    example: { A: 30, T: 30, G: 20, C: 20, AT: 6, GC: 4, H: 24 },
    startWith: ['A'],
    representation: { kind: 'dnaStrand', percentA: 'A', pairs: 10 },
  },
];

const BIOTECH: ModuleDef[] = [
  // ── Mutations, gene expression and biotechnology (HS-LS3-1, HS-LS3-2, HS-LS1-1) ──
  {
    id: 's.9.biotechnology',
    unitSystems: ['metric'],
    assumptions: [
      `The template strand is ${GENE}; its mRNA AUG GCC AAG UAA codes Met–Ala–Lys, then stop.`,
      'Bases 1–3 are the start codon and 10–12 the stop; one base swapped changes at most one codon, and the caption names the effect.',
      'A change to AUG loses the start: no protein is made from here. A stop turned into an amino acid loses the stop: the ribosome reads on.',
      'The base changed swaps A with G or C with T, the most common kind of substitution.',
    ],
    variables: [
      count('p', 'p', 'Base changed', 1, 12),
      count('k', 'k', 'Codon holding it', 1, 4, true),
      count('j', 'j', 'Its place in the codon', 1, 3, true),
    ],
    ...rules(
      codonOf('k', 'p'),
      forward(
        'j = p − 3(k − 1)',
        '{j} = {p} − 3 × ({k} − 1)',
        'j',
        ['p', 'k'],
        (v) => v.p! - 3 * (v.k! - 1),
        '{p} − 3 × ({k} − 1)',
        'The codons before it hold 3 × (k − 1) bases; the rest is its place in its own codon.',
      ),
    ),
    example: { p: 5, k: 2, j: 2 },
    startWith: ['p'],
    representation: {
      kind: 'dnaStrand',
      sequence: GENE,
      mutation: { type: 'substitution', at: 'p' },
    },
  },
  {
    id: 's.9.biotechnology~frameshift',
    title: 'An insertion shifts the reading frame',
    use: 'Use this for “Why does inserting one base change every amino acid after it?”',
    unitSystems: ['metric'],
    assumptions: [
      `The template strand is the first L bases of ${GENE}; an A is inserted before base p.`,
      'The ribosome reads in threes, so every codon from the one holding the insertion on is read in a shifted frame.',
      'Inside the start codon (p = 2 or 3) the insertion breaks AUG, so no protein starts there; a deletion shifts the frame the same way.',
    ],
    variables: [
      { ...count('L', 'L', 'Template bases', 6, 12), multipleOf: 3 },
      count('c', 'c', 'Codons', 2, 4, true),
      count('p', 'p', 'Base the insertion goes before', 2, 12),
      count('k', 'k', 'Codon holding it', 1, 4, true),
      count('s', 's', 'Codons read in a shifted frame', 1, 4, true),
    ],
    ...rules(
      forward(
        'c = L ÷ 3',
        '{c} = {L} ÷ 3',
        'c',
        ['L'],
        (v) => v.L! / 3,
        '{L} ÷ 3',
        'Every three bases are one codon.',
      ),
      codonOf('k', 'p'),
      forward(
        's = c − k + 1',
        '{s} = {c} − {k} + 1',
        's',
        ['c', 'k'],
        (v) => v.c! - v.k! + 1,
        '{c} − {k} + 1',
        'Codon k and every codon after it, to the last, are read in the new frame.',
      ),
      limit(
        'p ≤ L',
        '{p} is at most {L}',
        ['p', 'L'],
        (v) => v.p! <= v.L!,
        'The insertion goes before one of the L template bases, so p is at most L.',
      ),
    ),
    example: { L: 12, c: 4, p: 5, k: 2, s: 3 },
    startWith: ['L', 'p'],
    representation: {
      kind: 'dnaStrand',
      sequence: GENE,
      length: 'L',
      codons: 'c',
      mutation: { type: 'insertion', at: 'p', base: 'A' },
    },
  },
  {
    id: 's.9.biotechnology~gel',
    title: 'Gel electrophoresis: a piece of DNA cut once',
    use: 'Use this for “A 5,000 bp piece is cut once, and one fragment is 3,000 bp. How long is the other?”',
    unitSystems: ['metric'],
    assumptions: [
      'DNA is negatively charged, so in the gel it moves toward the + end.',
      'Smaller fragments slip through the gel faster and travel farther; the ladder’s known sizes give the scale.',
      'A restriction enzyme cutting once splits the piece into two fragments that add back to it.',
    ],
    variables: [
      bp('L', 'L', 'Uncut DNA', 200, 10000),
      bp('a', 'a', 'First fragment', 100, 9900),
      bp('b', 'b', 'Second fragment', 100, 9900),
    ],
    ...rules(
      both('L = a + b', '{L} = {a} + {b}', ['L', 'a', 'b'], (v) => v.L! - v.a! - v.b!, {
        L: [(v) => v.a! + v.b!, '{a} + {b}', 'The two fragments add back up to the whole piece.'],
        a: [(v) => v.L! - v.b!, '{L} − {b}', 'Take the other fragment away from the whole.'],
        b: [(v) => v.L! - v.a!, '{L} − {a}', 'Take the other fragment away from the whole.'],
      }),
    ),
    example: { L: 5000, a: 3000, b: 2000 },
    startWith: ['L', 'a'],
    representation: {
      kind: 'gel',
      lanes: [
        { label: 'Uncut', bands: ['L'] },
        { label: 'Cut', bands: ['a', 'b'] },
      ],
      keep: ['L'],
    },
  },
  {
    id: 's.9.biotechnology~pcr',
    title: 'PCR: copies double each cycle',
    use: 'Use this for “Starting from 2 copies, how many copies are there after 10 cycles of PCR?”',
    unitSystems: ['metric'],
    assumptions: [
      'Each cycle heats the DNA to 95 °C to separate the strands, cools it to 55 °C so primers bind, and warms it to 72 °C to copy.',
      'Every double strand is copied each cycle, so the copies double: N = N₀ × 2ⁿ.',
      'Real runs level off after about 30 cycles, as the primers and nucleotides run low.',
    ],
    variables: [
      count('N0', 'N₀', 'Starting copies', 1, 1000),
      count('n', 'n', 'Cycles', 1, 40),
      { id: 'N', symbol: 'N', name: 'Copies after n cycles', min: 2, max: 1.2e15, step: 1 },
    ],
    ...rules(
      both(
        'N = N₀ × 2^n',
        '{N} = {N0} × 2^{n}',
        ['N', 'N0', 'n'],
        (v) => v.N! - v.N0! * 2 ** v.n!,
        {
          N: [
            (v) => v.N0! * 2 ** v.n!,
            '{N0} × 2^{n}',
            'Each cycle doubles the copies: n doublings of N₀.',
          ],
          N0: [
            (v) => div(v.N!, 2 ** v.n!),
            '{N} ÷ 2^{n}',
            'Undo the n doublings: halve N, n times.',
          ],
          n: [
            (v) => (v.N! > 0 && v.N0! > 0 ? Math.log2(v.N! / v.N0!) : undefined),
            'log_2({N} ÷ {N0})',
            'How many doublings turn N₀ into N.',
          ],
        },
      ),
    ),
    example: { N0: 2, n: 10, N: 2048 },
    startWith: ['N0', 'n'],
    representation: { kind: 'gel', pcr: { cycles: 'n', start: 'N0', copies: 'N' } },
  },
];

const EVOLUTION: ModuleDef[] = [
  // ── Evidence for evolution, population genetics and speciation (HS-LS4-1 to 4-5) ──
  {
    id: 's.9.evolution-evidence',
    unitSystems: ['metric'],
    assumptions: [
      'Hardy–Weinberg holds in a large population with random mating, no mutation, no migration and no selection.',
      'Only aa shows the recessive trait, so start from its share q²: q is its square root.',
      'Carriers (Aa) show nothing but make up 2pq, and p² + 2pq + q² = 1.',
    ],
    variables: [
      freq('Q2', 'q²', 'Share with the recessive trait (aa)'),
      freq('q', 'q', 'Frequency of allele a'),
      freq('p', 'p', 'Frequency of allele A'),
      freq('P2', 'p²', 'Share that is AA'),
      freq('H', '2pq', 'Share of carriers (Aa)'),
      count('N', 'N', 'People in the population', 2, 1000000),
      { ...freq('nAA', 'n_AA', 'Expected AA people', true), max: 1000000, step: 1 },
      { ...freq('nAa', 'n_Aa', 'Expected carriers', true), max: 1000000, step: 1 },
      { ...freq('naa', 'n_aa', 'Expected aa people', true), max: 1000000, step: 1 },
    ],
    ...rules(
      both('q² = q × q', '{Q2} = {q} × {q}', ['Q2', 'q'], (v) => v.Q2! - v.q! ** 2, {
        Q2: [(v) => v.q! ** 2, '{q} × {q}', 'Two a alleles meet with chance q × q.'],
        q: [
          (v) => (v.Q2! >= 0 ? Math.sqrt(v.Q2!) : undefined),
          '√{Q2}',
          'Only aa shows the recessive trait, so q is the square root of its share.',
        ],
      }),
      both('p = 1 − q', '{p} = 1 − {q}', ['p', 'q'], (v) => v.p! + v.q! - 1, {
        p: [(v) => 1 - v.q!, '1 − {q}', 'The two alleles’ frequencies add to 1.'],
        q: [(v) => 1 - v.p!, '1 − {p}', 'The two alleles’ frequencies add to 1.'],
      }),
      both('p² = p × p', '{P2} = {p} × {p}', ['P2', 'p'], (v) => v.P2! - v.p! ** 2, {
        P2: [(v) => v.p! ** 2, '{p} × {p}', 'Two A alleles meet with chance p × p.'],
        p: [
          (v) => (v.P2! >= 0 ? Math.sqrt(v.P2!) : undefined),
          '√{P2}',
          'p is the square root of the AA share.',
        ],
      }),
      both(
        '2pq = 2 × p × q',
        '{H} = 2 × {p} × {q}',
        ['H', 'p', 'q'],
        (v) => v.H! - 2 * v.p! * v.q!,
        {
          H: [
            (v) => 2 * v.p! * v.q!,
            '2 × {p} × {q}',
            'A from one parent and a from the other, or the other way round: twice p × q.',
          ],
          p: [(v) => div(v.H!, 2 * v.q!), '{H} ÷ (2 × {q})', 'Divide the carrier share by 2q.'],
          q: [(v) => div(v.H!, 2 * v.p!), '{H} ÷ (2 × {p})', 'Divide the carrier share by 2p.'],
        },
      ),
      expected('nAA', 'P2', 'AA'),
      expected('nAa', 'H', 'carrier'),
      expected('naa', 'Q2', 'aa'),
    ),
    example: { Q2: 0.16, q: 0.4, p: 0.6, P2: 0.36, H: 0.48, N: 500, nAA: 180, nAa: 240, naa: 80 },
    startWith: ['Q2', 'N'],
    representation: {
      kind: 'alleleFrequencies',
      p: 'p',
      q: 'q',
      genotypes: ['P2', 'H', 'Q2'],
      keep: ['N'],
    },
  },
  {
    id: 's.9.evolution-evidence~allele-counts',
    title: 'Allele frequencies from genotype counts',
    use: 'Use this for “A sample has 49 AA, 42 Aa and 9 aa. What are p and q?”',
    unitSystems: ['metric'],
    assumptions: [
      'Each individual carries two alleles: AA has two A, Aa one of each, aa two a.',
      'So N individuals carry 2N alleles, and p is the share of them that are A.',
      'Counting alleles works for any population, whether or not it is in Hardy–Weinberg equilibrium.',
    ],
    variables: [
      count('nAA', 'n_AA', 'Individuals AA', 0, 10000),
      count('nAa', 'n_Aa', 'Individuals Aa', 0, 10000),
      count('naa', 'n_aa', 'Individuals aa', 0, 10000),
      count('N', 'N', 'Individuals in all', 1, 30000, true),
      count('A', 'A', 'Count of A alleles', 0, 60000, true),
      count('a', 'a', 'Count of a alleles', 0, 60000, true),
      freq('p', 'p', 'Frequency of allele A', true),
      freq('q', 'q', 'Frequency of allele a', true),
    ],
    ...rules(
      forward(
        'N = n_AA + n_Aa + n_aa',
        '{N} = {nAA} + {nAa} + {naa}',
        'N',
        ['nAA', 'nAa', 'naa'],
        (v) => v.nAA! + v.nAa! + v.naa!,
        '{nAA} + {nAa} + {naa}',
        'Add the three genotype counts.',
      ),
      forward(
        'A = 2n_AA + n_Aa',
        '{A} = 2 × {nAA} + {nAa}',
        'A',
        ['nAA', 'nAa'],
        (v) => 2 * v.nAA! + v.nAa!,
        '2 × {nAA} + {nAa}',
        'Two A in each AA individual and one in each Aa.',
      ),
      forward(
        'a = 2n_aa + n_Aa',
        '{a} = 2 × {naa} + {nAa}',
        'a',
        ['naa', 'nAa'],
        (v) => 2 * v.naa! + v.nAa!,
        '2 × {naa} + {nAa}',
        'Two a in each aa individual and one in each Aa.',
      ),
      forward(
        'p = A ÷ 2N',
        '{p} = {A} ÷ (2 × {N})',
        'p',
        ['A', 'N'],
        (v) => div(v.A!, 2 * v.N!),
        '{A} ÷ (2 × {N})',
        'The A alleles out of all 2N alleles.',
      ),
      forward(
        'q = a ÷ 2N',
        '{q} = {a} ÷ (2 × {N})',
        'q',
        ['a', 'N'],
        (v) => div(v.a!, 2 * v.N!),
        '{a} ÷ (2 × {N})',
        'The a alleles out of all 2N alleles.',
      ),
    ),
    example: { nAA: 49, nAa: 42, naa: 9, N: 100, A: 140, a: 60, p: 0.7, q: 0.3 },
    startWith: ['nAA', 'nAa', 'naa'],
    representation: { kind: 'alleleFrequencies', p: 'p', q: 'q', fixed: true },
  },
];

const PLANTS: ModuleDef[] = [
  // ── Plants: water transport (HS-LS1-2) ──
  {
    id: 's.9.plant-biology~transpiration',
    title: 'Transpiration rate',
    use: 'Use this for “A leafy shoot in a potometer takes up 4.8 mL of water in 6 hours. What is its rate?”',
    unitSystems: ['metric'],
    assumptions: [
      'A potometer measures the water a cut shoot takes up; nearly all of it leaves the leaves as vapor.',
      'The rate is steady over the time measured: the light, heat, wind and humidity stay the same.',
      'More light, heat or wind, or drier air, raises the rate; closing the stomata lowers it.',
    ],
    variables: [
      {
        id: 'W',
        symbol: 'W',
        name: 'Water taken up',
        unit: 'mL',
        units: ['mL'],
        min: 0,
        max: 100,
        step: 0.1,
      },
      {
        id: 't',
        symbol: 't',
        name: 'Time measured',
        unit: 'h',
        units: ['h'],
        min: 0.5,
        max: 48,
        step: 0.5,
      },
      {
        id: 'R',
        symbol: 'R',
        name: 'Water taken up each hour',
        unit: 'mL/h',
        min: 0,
        max: 20,
        step: 0.01,
      },
    ],
    ...rules(
      both('W = R × t', '{W} = {R} × {t}', ['W', 'R', 't'], (v) => v.W! - v.R! * v.t!, {
        R: [(v) => div(v.W!, v.t!), '{W} ÷ {t}', 'Share the water over the hours measured.'],
        W: [(v) => v.R! * v.t!, '{R} × {t}', 'Each hour takes up R mL: multiply by the hours.'],
        t: [
          (v) => (v.R! > 0 ? v.W! / v.R! : undefined),
          '{W} ÷ {R}',
          'Count how many hours of R mL fit in the water taken up.',
        ],
      }),
    ),
    example: { W: 4.8, t: 6, R: 0.8 },
    startWith: ['W', 't'],
    representation: { kind: 'doubleNumberLine', top: 't', bottom: 'W', per: 'R', ticks: 6 },
  },
];

const POPULATION: ModuleDef[] = [
  // ── Population growth and carrying capacity (HS-LS2-1, HS-LS2-2) ──
  {
    id: 's.9.population-ecology',
    unitSystems: ['metric'],
    assumptions: [
      'Growth G = rN(K − N) ÷ K is fastest at N = K ÷ 2, then slows as resources run short.',
      'While N is small, food and space are plentiful and growth is nearly exponential.',
      'The population levels off at the carrying capacity K, the most the habitat can support.',
    ],
    variables: [
      { id: 't', symbol: 't', name: 'Time', unit: 'days', min: 0, max: 1000, step: 0.5 },
      count('K', 'K', 'Carrying capacity', 10, 1000000),
      count('N0', 'N₀', 'Starting population', 1, 1000000),
      { id: 'r', symbol: 'r', name: 'Growth rate', unit: 'per day', min: 0.01, max: 5, step: 0.01 },
      { id: 'N', symbol: 'N', name: 'Population', min: 0, max: 1000000, step: 1 },
      {
        id: 'G',
        symbol: 'G',
        name: 'Growth now',
        unit: 'per day',
        min: 0,
        max: 2000000,
        step: 0.01,
        derived: true,
      },
    ],
    ...rules(
      withStep(
        withStep(
          both(
            'N = K ÷ (1 + ((K − N₀) ÷ N₀)e^(−rt))',
            '{N} = {K} ÷ (1 + (({K} − {N0}) ÷ {N0}) × e^(−{r}{t}))',
            ['N', 'K', 'N0', 'r', 't'],
            (v) => v.N! - logistic(v),
            {
              N: [
                logistic,
                '{K} ÷ (1 + (({K} − {N0}) ÷ {N0}) ÷ e^({r} × {t}))',
                'Work out A = (K − N₀) ÷ N₀, then K ÷ (1 + A ÷ e^(rt)): N₀ at t = 0, K after a long time.',
              ],
              t: [
                (v) => {
                  const q = (((v.K! - v.N0!) / v.N0!) * v.N!) / (v.K! - v.N!);
                  return q > 0 && Number.isFinite(q) ? Math.log(q) / v.r! : undefined;
                },
                'ln((({K} − {N0}) ÷ {N0}) × {N} ÷ ({K} − {N})) ÷ {r}',
                'Solve 1 + Ae^(−rt) = K ÷ N for e^(−rt), then take the natural log and divide by −r.',
              ],
            },
          ),
          'N',
          {
            work: (v) => {
              const A = (v.K! - v.N0!) / v.N0!;
              const E = Math.exp(v.r! * v.t!);
              if (v.r! * v.t! > 40)
                return [
                  `A = (${fmt(v.K!)} − ${fmt(v.N0!)}) ÷ ${fmt(v.N0!)} = ${fmt(A)}`,
                  `e^(${fmt(v.r!)} × ${fmt(v.t!)}) = e^${fmt(v.r! * v.t!)}, so large that A ÷ e^(rt) is nearly 0`,
                  `N = ${fmt(v.K!)} ÷ (1 + 0)`,
                ];
              return [
                `A = (${fmt(v.K!)} − ${fmt(v.N0!)}) ÷ ${fmt(v.N0!)} = ${fmt(A)}`,
                `e^(${fmt(v.r!)} × ${fmt(v.t!)}) = e^${fmt(v.r! * v.t!)} ≈ ${fmt(E)}`,
                `N = ${fmt(v.K!)} ÷ (1 + ${fmt(A)} ÷ ${fmt(E)})`,
                `N = ${fmt(v.K!)} ÷ ${fmt(1 + A / E)}`,
              ];
            },
            note: (v) => `(about ${fmt(Math.round(v.N!))} individuals)`,
          },
        ),
        't',
        {
          work: (v) => {
            const A = (v.K! - v.N0!) / v.N0!;
            const q = (A * v.N!) / (v.K! - v.N!);
            return [
              `A = (${fmt(v.K!)} − ${fmt(v.N0!)}) ÷ ${fmt(v.N0!)} = ${fmt(A)}`,
              `e^(rt) = A × N ÷ (K − N) = ${fmt(A)} × ${fmt(v.N!)} ÷ ${fmt(v.K! - v.N!)} ≈ ${fmt(q)}`,
              `t = ln ${fmt(q)} ÷ ${fmt(v.r!)}`,
            ];
          },
        },
      ),
      withStep(
        forward(
          'G = rN(K − N) ÷ K',
          '{G} = {r} × {N} × ({K} − {N}) ÷ {K}',
          'G',
          ['r', 'N', 'K'],
          (v) => (v.r! * v.N! * (v.K! - v.N!)) / v.K!,
          '{r} × {N} × ({K} − {N}) ÷ {K}',
          'The exponential rate rN, slowed by the share of K still unused, (K − N) ÷ K.',
        ),
        'G',
        { note: (v) => `(about ${fmt(Math.round(v.G!))} individuals a day, on average)` },
      ),
      below('N0', 'K', 'This page starts below the carrying capacity: N₀ is less than K.'),
    ),
    example: {
      t: 6,
      K: 1000,
      N0: 100,
      r: 0.5,
      N: 1000 / (1 + 9 * Math.exp(-3)),
      G: (0.5 * (1000 / (1 + 9 * Math.exp(-3))) * (1000 - 1000 / (1 + 9 * Math.exp(-3)))) / 1000,
    },
    startWith: ['t', 'K', 'N0', 'r'],
    representation: {
      kind: 'functionGraph',
      family: 'logistic',
      K: 'K',
      start: 'N0',
      r: 'r',
      name: 'N',
      at: { x: 't', y: 'N' },
      axes: { x: 'Time t (days)', y: 'Population N' },
      marks: ['asymptotes', 'extrema'],
    },
  },
  {
    id: 's.9.population-ecology~rates',
    title: 'Births, deaths and migration',
    use: 'Use this for “A herd of 500 deer has 90 births, 40 deaths, 10 arrivals and 20 departures in a year. What is its new size?”',
    unitSystems: ['metric'],
    assumptions: [
      'Births and immigrants add to a population; deaths and emigrants take away.',
      'The per-capita growth rate counts births minus deaths for each individual, as a percent.',
      'All four counts are over the same time, here one year.',
    ],
    variables: [
      count('N', 'N', 'Population at the start', 1, 1000000),
      count('B', 'B', 'Births', 0, 1000000),
      count('D', 'D', 'Deaths', 0, 1000000),
      count('I', 'I', 'Immigrants', 0, 1000000),
      count('E', 'E', 'Emigrants', 0, 1000000),
      count('dN', 'ΔN', 'Change in population', -2000000, 2000000, true),
      count('N1', 'N₁', 'Population a year later', 0, 3000000, true),
      {
        id: 'r',
        symbol: 'r',
        name: 'Per-capita growth rate',
        unit: '%',
        min: -100,
        max: 100000000,
        step: 0.1,
        derived: true,
      },
    ],
    ...rules(
      forward(
        'ΔN = B − D + I − E',
        '{dN} = {B} − {D} + {I} − {E}',
        'dN',
        ['B', 'D', 'I', 'E'],
        (v) => v.B! - v.D! + v.I! - v.E!,
        '{B} − {D} + {I} − {E}',
        'Births and immigrants come in; deaths and emigrants go out.',
      ),
      forward(
        'N₁ = N + ΔN',
        '{N1} = {N} + {dN}',
        'N1',
        ['N', 'dN'],
        (v) => v.N! + v.dN!,
        '{N} + {dN}',
        'Add the change to the starting population.',
      ),
      forward(
        'r = 100 × (B − D) ÷ N',
        '{r} = 100 × ({B} − {D}) ÷ {N}',
        'r',
        ['B', 'D', 'N'],
        (v) => div(100 * (v.B! - v.D!), v.N!),
        '100 × ({B} − {D}) ÷ {N}',
        'Births minus deaths for each individual at the start, as a percent.',
      ),
    ),
    example: { N: 500, B: 90, D: 40, I: 10, E: 20, dN: 40, N1: 540, r: 10 },
    startWith: ['N', 'B', 'D', 'I', 'E'],
    representation: {
      kind: 'bars',
      bars: [{ var: 'N' }, { var: 'B' }, { var: 'D' }, { var: 'I' }, { var: 'E' }, { var: 'N1' }],
      min: 0,
      max: 600,

      flows: { out: ['D', 'E'] },
    },
  },
  {
    id: 's.9.population-ecology~doubling',
    title: 'Doubling time',
    use: 'Use this for “Bacteria double every 20 minutes. How many are there after 2 hours, starting from 100?”',
    unitSystems: ['metric'],
    assumptions: [
      'With plenty of food and space, a population doubles every doubling time d: exponential growth.',
      'After t minutes it has doubled g = t ÷ d times, so N = N₀ × 2ᵍ.',
      'Real populations slow down as food runs out; this is the early, exponential part.',
    ],
    variables: [
      count('N0', 'N₀', 'Starting population', 1, 1000000),
      {
        id: 'd',
        symbol: 'd',
        name: 'Doubling time',
        unit: 'min',
        units: ['min'],
        min: 1,
        max: 600,
        step: 1,
      },
      {
        id: 't',
        symbol: 't',
        name: 'Time',
        unit: 'min',
        units: ['min'],
        min: 0,
        max: 1440,
        step: 1,
      },
      { id: 'g', symbol: 'g', name: 'Doublings', min: 0, max: 40, step: 0.01, derived: true },
      {
        id: 'N',
        symbol: 'N',
        name: 'Population after t',
        min: 1,
        max: 1e18,
        step: 1,
        derived: true,
      },
    ],
    ...rules(
      forward(
        'g = t ÷ d',
        '{g} = {t} ÷ {d}',
        'g',
        ['t', 'd'],
        (v) => div(v.t!, v.d!),
        '{t} ÷ {d}',
        'How many doubling times fit into the time.',
      ),
      forward(
        'N = N₀ × 2^g',
        '{N} = {N0} × 2^{g}',
        'N',
        ['N0', 'g'],
        (v) => v.N0! * 2 ** v.g!,
        '{N0} × 2^{g}',
        'Each doubling multiplies the population by 2: g doublings multiply it by 2ᵍ.',
      ),
    ),
    example: { N0: 100, d: 20, t: 120, g: 6, N: 6400 },
    startWith: ['N0', 'd', 't'],
    representation: {
      kind: 'functionGraph',
      family: 'exponential',
      a: 'N0',
      b: 2,
      name: 'N',
      at: { x: 'g', y: 'N' },
      axes: { x: 'Doublings g', y: 'Population N' },
    },
  },
];

const ECOSYSTEMS: ModuleDef[] = [
  // ── Ecosystems: energy pyramids, matter cycles, succession, biodiversity (HS-LS2-2 to 2-7) ──
  {
    id: 's.9.ecosystem-dynamics',
    unitSystems: ['metric'],
    assumptions: [
      'The trophic efficiency p varies, about 5–20%; the rest of the energy is used in respiration or lost as heat.',
      'Biomass pyramids usually follow the energy pyramid, but a numbers pyramid can stand upside down: one oak feeds thousands of caterpillars.',
      'Energy flows one way through the levels; matter cycles.',
    ],
    variables: [
      kcal('E1', 'E₁', 'Energy in the grasses'),
      kcal('E2', 'E₂', 'Energy in the grasshoppers'),
      { id: 'p', symbol: 'p', name: 'Trophic efficiency', unit: '%', min: 1, max: 25, step: 0.1 },
      kcal('E3', 'E₃', 'Energy in the shrews'),
      kcal('E4', 'E₄', 'Energy in the owls'),
    ],
    ...rules(
      passUp('E2', 'E1', 'in the grasses'),
      passUp('E3', 'E2', 'in the grasshoppers'),
      passUp('E4', 'E3', 'in the shrews'),
    ),
    example: { E1: 12000, E2: 960, p: 8, E3: 76.8, E4: 6.144 },
    startWith: ['E1', 'E2'],
    representation: {
      kind: 'energyPyramid',
      measure: 'energy',
      levels: ['E1', 'E2', 'E3', 'E4'],
      percent: 'p',
      names: ['grasses', 'grasshoppers', 'shrews', 'owls'],
    },
  },
  {
    id: 's.9.ecosystem-dynamics~biodiversity',
    title: 'Simpson’s diversity index',
    use: 'Use this for “Which pond community is more diverse: 25, 5, 5, 5 or 10, 10, 10, 10?”',
    unitSystems: ['metric'],
    assumptions: [
      'S is the chance that two individuals picked at random belong to different species.',
      'More species, and more even counts of each, raise S toward 1; one species alone gives 0.',
      'Here a pond survey counts four species.',
    ],
    variables: [
      count('n1', 'n₁', 'Water striders', 0, 1000),
      count('n2', 'n₂', 'Pond snails', 0, 1000),
      count('n3', 'n₃', 'Dragonfly nymphs', 0, 1000),
      count('n4', 'n₄', 'Tadpoles', 0, 1000),
      count('N', 'N', 'Individuals in all', 1, 4000, true),
      freq('S', 'S', 'Diversity index (Simpson’s)', true),
    ],
    ...rules(
      forward(
        'N = n₁ + n₂ + n₃ + n₄',
        '{N} = {n1} + {n2} + {n3} + {n4}',
        'N',
        ['n1', 'n2', 'n3', 'n4'],
        (v) => v.n1! + v.n2! + v.n3! + v.n4!,
        '{n1} + {n2} + {n3} + {n4}',
        'Add the counts of the four species.',
      ),
      withStep(
        forward(
          'S = 1 − ((n₁ ÷ N)² + (n₂ ÷ N)² + (n₃ ÷ N)² + (n₄ ÷ N)²)',
          `{S} = 1 − (${['n1', 'n2', 'n3', 'n4'].map(share2).join(' + ')})`,
          'S',
          ['n1', 'n2', 'n3', 'n4', 'N'],
          (v) =>
            v.N! > 0
              ? 1 - [v.n1!, v.n2!, v.n3!, v.n4!].reduce((t, n) => t + (n / v.N!) ** 2, 0)
              : undefined,
          `1 − (${['n1', 'n2', 'n3', 'n4'].map(share2).join(' + ')})`,
          'Each (n ÷ N)² is the chance two picks are both that species; 1 minus their sum is the chance they differ.',
        ),
        'S',
        {
          work: (v) => {
            const shares = [v.n1!, v.n2!, v.n3!, v.n4!].map((n) => n / v.N!);
            const squares = shares.map((x) => x * x);
            return [
              `S = 1 − (${shares.map((x) => `${fmt(x)}²`).join(' + ')})`,
              `S = 1 − (${squares.map(fmt).join(' + ')})`,
              `S = 1 − ${fmt(squares.reduce((t, x) => t + x, 0))}`,
            ];
          },
        },
      ),
    ),
    example: { n1: 25, n2: 5, n3: 5, n4: 5, N: 40, S: 0.5625 },
    startWith: ['n1', 'n2', 'n3', 'n4'],
    representation: { kind: 'pieChart', parts: ['n1', 'n2', 'n3', 'n4'], total: 'N' },
  },
];

const NERVOUS: ModuleDef[] = [
  // ── The nervous system: how fast an impulse travels (HS-LS1-2) ──
  {
    id: 's.9.nervous-system~impulse-speed',
    title: 'How fast a nerve impulse travels',
    use: 'Use this for “An impulse travels 1 m from the toe to the spinal cord at 50 m/s. How long does it take?”',
    unitSystems: ['metric'],
    assumptions: [
      'The impulse moves along the axon at a steady speed.',
      'Axons wrapped in myelin carry impulses fastest, up to about 120 m/s; thin axons without it, about 1 m/s.',
      'The time is in milliseconds: 1,000 ms is 1 s.',
    ],
    variables: [
      {
        id: 'd',
        symbol: 'd',
        name: 'Length of the axon',
        unit: 'm',
        units: ['m'],
        min: 0.01,
        max: 3,
        step: 0.01,
      },
      {
        id: 'v',
        symbol: 'v',
        name: 'Impulse speed',
        unit: 'm/s',
        units: ['m/s'],
        min: 0.5,
        max: 120,
        step: 0.5,
      },
      {
        id: 't',
        symbol: 't',
        name: 'Time to travel',
        unit: 'ms',
        units: ['ms'],
        min: 0,
        max: 6000,
        step: 0.1,
      },
    ],
    ...rules(
      withStep(
        both(
          't = d ÷ v × 1,000',
          '{t} = {d} ÷ {v} × 1,000',
          ['t', 'd', 'v'],
          (v) => v.t! - (1000 * v.d!) / v.v!,
          {
            t: [
              (v) => div(1000 * v.d!, v.v!),
              '{d} ÷ {v} × 1,000',
              'Distance ÷ speed is the time in seconds; 1,000 times that is the time in ms.',
            ],
            d: [
              (v) => (v.v! * v.t!) / 1000,
              '{v} × {t} ÷ 1,000',
              'Speed × time, with the ms turned into seconds.',
            ],
            v: [
              (v) => div(1000 * v.d!, v.t!),
              '1,000 × {d} ÷ {t}',
              'Distance ÷ time, with the ms turned into seconds.',
            ],
          },
        ),
        't',
        {
          work: (v) => [
            `d ÷ v = ${fmt(v.d!)} ÷ ${fmt(v.v!)} = ${fmt(v.d! / v.v!)} s`,
            `t = ${fmt(v.d! / v.v!)} × 1,000`,
          ],
        },
      ),
    ),
    example: { d: 1, v: 50, t: 20 },
    startWith: ['d', 'v'],
    representation: { kind: 'neuron', length: 'd', speed: 'v', time: 't' },
  },
];

const IMMUNE: ModuleDef[] = [
  // ── Disease and the immune system (HS-LS1-2, HS-LS1-3) ──
  {
    id: 's.9.immune-disease',
    unitSystems: ['metric'],
    assumptions: [
      'Memory B and T cells left by a first exposure, or by a vaccine, answer a second exposure faster and stronger.',
      'Antibody levels here are relative units, as on textbook graphs: only their ratio matters.',
      'The second exposure comes on day 40, after the first response has faded.',
    ],
    variables: [
      { id: 'P1', symbol: 'P₁', name: 'Peak level, first exposure', min: 1, max: 1000, step: 1 },
      { id: 'P2', symbol: 'P₂', name: 'Peak level, second exposure', min: 1, max: 1000, step: 1 },
      {
        id: 'd1',
        symbol: 'd₁',
        name: 'Days to the first peak',
        unit: 'days',
        min: 1,
        max: 30,
        step: 1,
      },
      {
        id: 'd2',
        symbol: 'd₂',
        name: 'Days to the second peak',
        unit: 'days',
        min: 1,
        max: 30,
        step: 1,
      },
      {
        id: 'R',
        symbol: 'R',
        name: 'Times higher, second peak',
        min: 1,
        max: 1000,
        step: 0.01,
        derived: true,
      },
      {
        id: 's',
        symbol: 's',
        name: 'Days sooner, second peak',
        unit: 'days',
        min: 0,
        max: 29,
        step: 1,
        derived: true,
      },
    ],
    ...rules(
      forward(
        'R = P₂ ÷ P₁',
        '{R} = {P2} ÷ {P1}',
        'R',
        ['P2', 'P1'],
        (v) => div(v.P2!, v.P1!),
        '{P2} ÷ {P1}',
        'How many times the first peak fits into the second.',
      ),
      forward(
        's = d₁ − d₂',
        '{s} = {d1} − {d2}',
        's',
        ['d1', 'd2'],
        (v) => v.d1! - v.d2!,
        '{d1} − {d2}',
        'The days the first response took, less the days the second took.',
      ),
      limit('P₂ ≥ P₁', '{P2} is at least {P1}', ['P2', 'P1'], (v) => v.P2! >= v.P1!),
      limit('d₂ ≤ d₁', '{d2} is at most {d1}', ['d2', 'd1'], (v) => v.d2! <= v.d1!),
    ),
    standalone: {
      vars: ['d1', 'd2', 's'],
      why: 'How much sooner and how much higher are two separate comparisons of the same two responses: the days do not set the peaks.',
    },
    example: { P1: 10, P2: 100, d1: 12, d2: 6, R: 10, s: 6 },
    startWith: ['P1', 'P2', 'd1', 'd2'],
    representation: {
      kind: 'immuneResponse',
      first: 'P1',
      second: 'P2',
      firstDays: 'd1',
      secondDays: 'd2',
      secondAt: 40,
      axis: 'Antibody level',
    },
  },
  {
    id: 's.9.immune-disease~herd-immunity',
    title: 'Herd immunity',
    use: 'Use this for “Each case of a disease infects 5 people. What share must be vaccinated to stop it spreading?”',
    unitSystems: ['metric'],
    assumptions: [
      'R₀ is how many people one case infects when no one is immune; it differs by disease, about 12–18 for measles.',
      'Spread stops once each case infects fewer than one more: a share H = 1 − 1 ÷ R₀ must be immune.',
      'A vaccine that works in e% of people means more must be vaccinated; everyone is assumed to mix evenly.',
    ],
    variables: [
      { id: 'R0', symbol: 'R₀', name: 'People one case infects', min: 1.1, max: 20, step: 0.1 },
      {
        id: 'H',
        symbol: 'H',
        name: 'Share immune to stop spread',
        unit: '%',
        min: 0,
        max: 100,
        step: 0.1,
        derived: true,
      },
      {
        id: 'e',
        symbol: 'e',
        name: 'Vaccine effectiveness',
        unit: '%',
        min: 50,
        max: 100,
        step: 1,
      },
      {
        id: 'C',
        symbol: 'C',
        name: 'Share to vaccinate',
        unit: '%',
        min: 0,
        max: 100,
        step: 0.1,
        derived: true,
      },
      count('P', 'P', 'People in the community', 100, 10000000),
      {
        id: 'V',
        symbol: 'V',
        name: 'People to vaccinate',
        min: 0,
        max: 10000000,
        step: 1,
        derived: true,
      },
    ],
    ...rules(
      forward(
        'H = 100 × (1 − 1 ÷ R₀)',
        '{H} = 100 × (1 − 1 ÷ {R0})',
        'H',
        ['R0'],
        (v) => 100 * (1 - 1 / v.R0!),
        '100 × (1 − 1 ÷ {R0})',
        'Each case must infect fewer than one person, so all but 1 in R₀ must be immune.',
      ),
      saying(
        forward(
          'C = 100 × H ÷ e',
          '{C} = 100 × {H} ÷ {e}',
          'C',
          ['H', 'e'],
          (v) => div(100 * v.H!, v.e!),
          '100 × {H} ÷ {e}',
          'Only e% of those vaccinated become immune, so divide the share needed by e%.',
        ),
        (v) =>
          v.H !== undefined && v.e !== undefined && v.H > v.e
            ? `Even vaccinating everyone makes only ${fmt(v.e)}% immune, less than the ${fmt(v.H)}% needed: this vaccine alone can’t stop the spread.`
            : undefined,
      ),
      withStep(
        forward(
          'V = P × H ÷ e',
          '{V} = {P} × {H} ÷ {e}',
          'V',
          ['P', 'H', 'e'],
          (v) => div(v.P! * v.H!, v.e!),
          '{P} × {H} ÷ {e}',
          'C% of P is P × H ÷ e, because C = 100 × H ÷ e.',
        ),
        'V',
        {
          note: (v) =>
            Math.abs(v.V! - Math.round(v.V!)) > 1e-9
              ? `(round up: ${fmt(Math.ceil(v.V! - 1e-9))} people)`
              : '',
        },
      ),
    ),
    example: { R0: 5, H: 80, e: 95, C: 8000 / 95, P: 19000, V: 16000 },
    startWith: ['R0', 'e', 'P'],
    representation: { kind: 'percentBar', percent: 'C', part: 'V', whole: 'P', second: 'H' },
  },
];

export const SCIENCE_9_MODULES: ModuleDef[] = [
  ...BIOMOLECULES,
  ...MEMBRANE,
  ...ENERGY,
  ...DIVISION,
  ...INHERITANCE,
  ...DNA,
  ...BIOTECH,
  ...EVOLUTION,
  ...PLANTS,
  ...POPULATION,
  ...ECOSYSTEMS,
  ...NERVOUS,
  ...IMMUNE,
];
