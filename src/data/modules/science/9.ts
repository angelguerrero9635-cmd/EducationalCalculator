/**
 * Grade 9 science: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md; the
 * direction plan and build notes: docs/BUILD_HS.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/science9.ts`.
 */
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
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
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

// ─── The pages ───────────────────────────────────────────────────────────────

const INHERITANCE: ModuleDef[] = [
  // ── Mendelian and non-Mendelian inheritance (HS-LS3-2, HS-LS3-3) ──
  {
    id: 's.9.inheritance-patterns',
    unitSystems: ['metric'],
    assumptions: [
      'Pea seeds: R (round) is dominant to r (wrinkled), and Y (yellow) is dominant to y (green).',
      'The two genes are on different chromosomes, so they sort independently into the gametes.',
      'Each parent makes four kinds of gamete, so the 16 boxes are equally likely: each is 1/16.',
      'The product rule: the chance of both traits is the one-gene chances multiplied.',
    ],
    variables: [
      alleles('a', 'a', 'R alleles in the first parent'),
      alleles('c', 'c', 'R alleles in the second parent'),
      alleles('b', 'b', 'Y alleles in the first parent'),
      alleles('e', 'e', 'Y alleles in the second parent'),
      count('tR', 't_R', 'Boxes of 4 with round seeds', 0, 4, true),
      count('tY', 't_Y', 'Boxes of 4 with yellow seeds', 0, 4, true),
      count('D', 'D', 'Boxes of 16 round and yellow', 0, 16, true),
      count('F', 'F', 'Boxes of 16 round and green', 0, 16, true),
      count('S', 'S', 'Boxes of 16 wrinkled and yellow', 0, 16, true),
      count('N', 'N', 'Boxes of 16 wrinkled and green', 0, 16, true),
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
      { ...count('n', 'n', 'Offspring in all', 4, 1000), multipleOf: 4 },
      count('t', 't', 'Boxes of 4 showing the trait', 0, 4, true),
      count('nFF', 'n_FF', 'Expected FF', 0, 1000, true),
      count('nFf', 'n_Ff', 'Expected Ff', 0, 1000, true),
      count('nff', 'n_ff', 'Expected ff', 0, 1000, true),
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
    ),
    example: { a: 1, c: 1, n: 100, t: 3, nFF: 25, nFf: 50, nff: 25 },
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

/** Expected people with a genotype: N × its share (one way). */
const expected = (out: string, share: string, what: string): Rule =>
  forward(
    `${out} = N × ${share}`,
    `{${out}} = {N} × {${share}}`,
    out,
    ['N', share],
    (v) => v.N! * v[share]!,
    `{N} × {${share}}`,
    `The ${what} share of the N people.`,
  );

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
      both('q² = q^2', '{Q2} = {q}^2', ['Q2', 'q'], (v) => v.Q2! - v.q! ** 2, {
        Q2: [(v) => v.q! ** 2, '{q}^2', 'Two a alleles meet with chance q × q.'],
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
      both('p² = p^2', '{P2} = {p}^2', ['P2', 'p'], (v) => v.P2! - v.p! ** 2, {
        P2: [(v) => v.p! ** 2, '{p}^2', 'Two A alleles meet with chance p × p.'],
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
      count('A', 'A', 'A alleles counted', 0, 60000, true),
      count('a', 'a', 'a alleles counted', 0, 60000, true),
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

export const SCIENCE_9_MODULES: ModuleDef[] = [...INHERITANCE, ...EVOLUTION];
