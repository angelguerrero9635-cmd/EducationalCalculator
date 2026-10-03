/**
 * College gallery demos, round 4, group I (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC141: `curvedSolid` `ratio` (he.biology.principles-1#1).
 * HC142: `cellDivision` `content` (he.biology.principles-1#3).
 * HC143: card icons, evidence for evolution (he.biology.principles-2#0).
 * HC144: `pedigree`, the calculator picture and the card (he.biology.genetics#0, ~modes).
 * HC145: `linkageMap`, the new kind (he.biology.genetics#1, ~three-point).
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { CardIcon, LayoutDef, PedigreePerson } from './layouts';
import type { ModuleDef, Representation, StepText } from './types';

type Solver = (v: Values) => number | number[] | undefined;
type Rule = { relation: Relation; steps: Record<string, StepText> };

/** A value with its unit (one unit: the formula is written in it). */
const num = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({
  id,
  symbol,
  name,
  ...(unit ? { unit, units: [unit] } : {}),
  min,
  max,
  ...more,
});

/** A value worked out, never typed. */
const out = (
  id: string,
  symbol: string,
  name: string,
  unit?: string,
  more: Partial<VariableDef> = {},
) => num(id, symbol, name, unit, -1e15, 1e15, { derived: true, ...more });

/** A finite number, or nothing. */
const fin = (x: number) => (Number.isFinite(x) ? x : undefined);

/** A relation with its steps: each variable's solver, expression and explanation. */
function rule(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  parts: Record<string, [Solver, StepText['expr'], StepText['how']]>,
): Rule {
  const solve: Record<string, Solver> = {};
  const steps: Record<string, StepText> = {};
  for (const [v, [fn, expr, how]] of Object.entries(parts)) {
    solve[v] = fn;
    steps[v] = { expr, how };
  }
  for (const v of vars) if (!(v in solve)) solve[v] = () => undefined;
  return { relation: { id, display, vars, residual, solve }, steps };
}

/** A demo from its rules. */
function page(
  d: Omit<ModuleDef, 'relations' | 'steps' | 'representation' | 'startWith'> & {
    rules: Rule[];
    representation: Representation;
    startWith?: string[];
  },
): ModuleDef {
  const { rules, ...rest } = d;
  return {
    ...rest,
    unitSystems: ['metric'],
    startWith: d.startWith ?? d.variables.filter((v) => !v.derived).map((v) => v.id),
    relations: rules.map((r) => r.relation),
    steps: Object.fromEntries(rules.map((r) => [r.relation.id, r.steps])),
  };
}

/** Values worked out from the typed ones of an example, in order. */
function example(typed: Values, ...work: [string, (v: Values) => number][]): Values {
  const v: Values = { ...typed };
  for (const [id, f] of work) v[id] = f(v);
  return v;
}

// ─── HC141: why cells are small (principles-1#1) ───────────────────────────────

const areaOf = (v: Values) => 4 * Math.PI * v.r! ** 2;
const volumeOf = (v: Values) => (4 / 3) * Math.PI * v.r! ** 3;
const ratioOf = (v: Values) => 3 / v.r!;

const cellRules = (): Rule[] => [
  rule('area', '{A} = 4π × {r}²', ['A', 'r'], (v) => v.A! - areaOf(v), {
    A: [areaOf, '4 × π × {r}^2', 'A sphere’s surface is 4π times the square of its radius.'],
    r: [
      (v) => fin(Math.sqrt(v.A! / (4 * Math.PI))),
      '√({A} ÷ (4 × π))',
      'Divide the area by 4π and take the square root.',
    ],
  }),
  rule('volume', '{V} = 4/3 × π × {r}³', ['V', 'r'], (v) => v.V! - volumeOf(v), {
    V: [volumeOf, '4 ÷ 3 × π × {r}^3', 'A sphere’s volume is 4/3 π times the cube of its radius.'],
  }),
  rule('ratio', '{q} = 3 ÷ {r}', ['q', 'r'], (v) => v.q! - ratioOf(v), {
    q: [ratioOf, '3 ÷ {r}', '4πr² ÷ (4/3 πr³) cancels to 3 ÷ r: the ratio falls as r grows.'],
    r: [(v) => fin(3 / v.q!), '3 ÷ {q}', 'Turn A ÷ V = 3 ÷ r round: r = 3 ÷ (A ÷ V).'],
  }),
];

const cellPage = (
  id: string,
  title: string,
  use: string,
  r: number,
  compare: number,
  max: number,
) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'The cell is a sphere of radius r.',
      'Nutrients come in through the surface, but every μm³ inside uses them, so a bigger cell feeds each μm³ through less membrane.',
      `The second cell is ${compare} times as wide, drawn at the same scale.`,
    ],
    variables: [
      num('r', 'r', 'Radius', 'μm', 0.1, max, { step: 0.1 }),
      out('A', 'A', 'Surface area', 'μm²'),
      out('V', 'V', 'Volume', 'μm³'),
      out('q', 'A ÷ V', 'Surface area to volume', 'per μm'),
    ],
    rules: cellRules(),
    example: example({ r }, ['A', areaOf], ['V', volumeOf], ['q', ratioOf]),
    startWith: ['r'],
    representation: {
      kind: 'curvedSolid',
      shape: 'sphere',
      radius: 'r',
      extent: 2 * r,
      ratio: { area: 'A', volume: 'V', ratio: 'q', compare },
    },
  });

const CELL_RATIO = cellPage(
  'g.he-curvedSolid-ratio',
  'Why cells are small: surface area to volume',
  'Use this for “A cell has a radius of 5 μm. What is its surface area to volume ratio, and what happens when it doubles in width?”',
  5,
  2,
  1000,
);

/** A bacterium beside a cell ten times as wide: the edge of the range, r = 0.5 μm. */
const CELL_RATIO_SMALL = cellPage(
  'g.he-curvedSolid-ratio-bacterium',
  'A bacterium’s surface area to volume',
  'Use this for “A bacterium is a sphere 0.5 μm in radius. How does its A ÷ V compare with a cell ten times as wide?”',
  0.5,
  10,
  1000,
);

// ─── HC142: chromosomes, chromatids and DNA by stage (principles-1#3) ──────────────

/** A value worked out from others, never solved backwards. */
const derive = (
  x: string,
  inputs: string[],
  display: string,
  f: (v: Values) => number,
  expr: string,
  how: string,
): Rule =>
  rule(x, display, [x, ...inputs], (v) => v[x]! - f(v), {
    [x]: [(v) => fin(f(v)), expr, how],
  });

const contentPage = (id: string, title: string, use: string, D: number, extra: string) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'A G₁ cell holds 2n chromosomes of one chromatid each: its DNA content is called 2c.',
      'S copies every chromosome (4c); meiosis I parts the pairs (2c), meiosis II the sisters (1c).',
      extra,
    ],
    variables: [
      num('D', '2n', 'Chromosomes in a body cell', undefined, 2, 100, {
        integer: true,
        step: 2,
        multipleOf: 2,
      }),
      out('n', 'n', 'Chromosomes in a gamete', undefined, { integer: true }),
      out('X', 'X', 'Chromatids after S', undefined, { integer: true }),
      num('c1', 'DNA₁', 'DNA in G₁ (c)', undefined, 2, 2),
      out('c2', 'DNA₂', 'DNA after S (c)'),
      out('c4', 'DNA₄', 'DNA in a gamete (c)'),
      out('C', 'C', 'Kinds of gamete', undefined, { integer: true }),
    ],
    rules: [
      derive(
        'n',
        ['D'],
        '{n} = {D} ÷ 2',
        (v) => v.D! / 2,
        '{D} ÷ 2',
        'A gamete keeps one of each pair.',
      ),
      derive(
        'X',
        ['D'],
        '{X} = 2 × {D}',
        (v) => 2 * v.D!,
        '2 × {D}',
        'S copies each chromosome into two sister chromatids.',
      ),
      derive(
        'c2',
        ['c1', 'X', 'D'],
        '{c2} = {c1} × {X} ÷ {D}',
        (v) => (v.c1! * v.X!) / v.D!,
        '{c1} × {X} ÷ {D}',
        'DNA goes with the chromatids: S doubles them, so it doubles the DNA.',
      ),
      derive(
        'c4',
        ['c2'],
        '{c4} = {c2} ÷ 2 ÷ 2',
        (v) => v.c2! / 2 / 2,
        '{c2} ÷ 2 ÷ 2',
        'Each of the two meiotic divisions halves the DNA.',
      ),
      derive(
        'C',
        ['n'],
        '{C} = 2^{n}',
        (v) => 2 ** v.n!,
        '2^{n}',
        'Each pair lines up either way round, so every pair doubles the kinds of gamete.',
      ),
    ],
    example: { D, n: D / 2, X: 2 * D, c1: 2, c2: 4, c4: 1, C: 2 ** (D / 2) },
    startWith: ['D', 'c1'],
    representation: {
      kind: 'cellDivision',
      diploid: 'D',
      haploid: 'n',
      chromatids: 'X',
      combinations: 'C',
      content: { chromatids: 'X', dna: 'c1', gamete: 'c4' },
    },
  });

const DIVISION_CONTENT = contentPage(
  'g.he-cellDivision-content',
  'Chromosomes, chromatids and DNA through meiosis',
  'Use this for “A human cell has 2n = 46. How many chromosomes, chromatids and c of DNA are there in G₁, after S and in a gamete?”',
  46,
  'Humans have 2n = 46; crossing over is left out of the count of gametes.',
);

/** 2n = 4: every chromosome drawn in each stage. */
const DIVISION_CONTENT_SMALL = contentPage(
  'g.he-cellDivision-content-four',
  'Meiosis in a cell with 2n = 4',
  'Use this for “A cell with 2n = 4 goes through meiosis. How many chromatids does it hold after S, and after meiosis I?”',
  4,
  'With 2n = 4 every chromosome is drawn: two pairs, one of each pair from each parent.',
);

// ─── HC143: evidence for evolution (principles-2#0) ────────────────────────────────

const icon = (label: string, bin: string, name: CardIcon) => ({
  label,
  bin,
  figure: { kind: 'icon' as const, icon: name },
});

const SORT_EVIDENCE: LayoutDef = {
  id: 'g.he-cardIcons-evolution',
  title: 'Homologous, analogous or vestigial?',
  kind: 'sort',
  use: 'Use this for sorting structures as homologous, analogous or vestigial evidence for evolution.',
  assumptions: [
    'Homologous parts share an ancestor’s plan; analogous parts share a job.',
    'A vestigial part is a reduced remnant of one that worked in an ancestor.',
  ],
  intro:
    'Look at the bones: the same bones in a new job, a job done with other parts, or a leftover.',
  question: 'What does the structure show?',
  bins: [
    {
      id: 'homologous',
      label: 'Homologous structure',
      why: 'The same bones in the same order, doing different jobs: a shared ancestor.',
    },
    {
      id: 'analogous',
      label: 'Analogous structure',
      why: 'The same job done with a different build: the two evolved it apart.',
    },
    {
      id: 'vestigial',
      label: 'Vestigial structure',
      why: 'A reduced part with little or no use, left over from an ancestor that used it.',
    },
  ],
  cards: [
    icon('Human arm', 'homologous', 'human arm bones'),
    icon('Bat wing', 'homologous', 'bat wing bones'),
    icon('Whale flipper', 'homologous', 'whale flipper bones'),
    icon('Cat foreleg', 'homologous', 'cat leg bones'),
    icon('Insect wing', 'analogous', 'insect wing'),
    icon('Bird wing and butterfly wing', 'analogous', 'bird wing and butterfly wing'),
    icon('Shark fin and dolphin flipper', 'analogous', 'shark fin and dolphin flipper'),
    icon('Whale pelvis', 'vestigial', 'whale pelvis'),
    icon('Human appendix', 'vestigial', 'human appendix'),
  ],
};

// ─── HC144: pedigree risk and modes of inheritance (genetics#0, ~modes) ─────────────

/** A person in a pedigree. */
const person = (
  id: string,
  sex: 'male' | 'female',
  generation: number,
  more: Partial<PedigreePerson> = {},
): PedigreePerson => ({ id, sex, generation, ...more });

const riskOf = (v: Values) => v.p1! * v.p2! * 0.25;

const riskPage = (
  id: string,
  title: string,
  use: string,
  people: PedigreePerson[],
  typed: Values,
  extra: string,
) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'The trait is autosomal recessive: only aa shows it.',
      'An unaffected sibling of an affected child is a carrier 2 times in 3 (AA, Aa or aA; aa is ruled out).',
      extra,
    ],
    variables: [
      num('p1', 'p₁', 'Chance the parent is a carrier', undefined, 0, 1, { step: 0.01 }),
      num('p2', 'p₂', 'Chance the partner is a carrier', undefined, 0, 1, { step: 0.01 }),
      out('P', 'P', 'Chance of an affected child'),
    ],
    rules: [
      rule('risk', '{P} = {p1} × {p2} × 1/4', ['P', 'p1', 'p2'], (v) => v.P! - riskOf(v), {
        P: [
          riskOf,
          '{p1} × {p2} × 1/4',
          'Both parents must be carriers, and then a child is aa one time in 4.',
        ],
        p1: [
          (v) => fin((4 * v.P!) / v.p2!),
          '4 × {P} ÷ {p2}',
          'Undo the × 1/4 and the partner’s chance.',
        ],
        p2: [
          (v) => fin((4 * v.P!) / v.p1!),
          '4 × {P} ÷ {p1}',
          'Undo the × 1/4 and the parent’s chance.',
        ],
      }),
    ],
    example: example(typed, ['P', riskOf]),
    startWith: ['p2', 'p1'],
    representation: {
      kind: 'pedigree',
      people,
      chances: { II2: 'p1', II3: 'p2' },
      child: { parents: ['II2', 'II3'], chance: 'P' },
    },
  });

const PEDIGREE_RISK = riskPage(
  'g.he-pedigree-chance',
  'Pedigree risk: a child of an unaffected sibling',
  'Use this for “Her brother has cystic fibrosis; her partner’s carrier chance is 1/25. What is the chance their child is affected?”',
  [
    person('I1', 'male', 1),
    person('I2', 'female', 1),
    person('II1', 'male', 2, { trait: true, parents: ['I1', 'I2'] }),
    person('II2', 'female', 2, { parents: ['I1', 'I2'] }),
    person('II3', 'male', 2, { partner: 'II2' }),
  ],
  { p1: 2 / 3, p2: 1 / 25 },
  'The partner’s chance is the carrier frequency of the population (1 in 25 here).',
);

/** Both parents have an affected sibling: the edge of the page's range, 2/3 × 2/3 × 1/4. */
const PEDIGREE_RISK_BOTH = riskPage(
  'g.he-pedigree-chance-both',
  'Pedigree risk: both parents have an affected sibling',
  'Use this for “He and his wife each have a sister with the disease. What is the chance their first child has it?”',
  [
    person('I1', 'male', 1),
    person('I2', 'female', 1),
    person('I3', 'male', 1),
    person('I4', 'female', 1),
    person('II1', 'male', 2, { trait: true, parents: ['I1', 'I2'] }),
    person('II2', 'female', 2, { parents: ['I1', 'I2'] }),
    person('II3', 'male', 2, { parents: ['I3', 'I4'] }),
    person('II4', 'female', 2, { trait: true, parents: ['I3', 'I4'] }),
  ],
  { p1: 2 / 3, p2: 2 / 3 },
  'Each parent has an affected sibling, so each is a carrier 2 times in 3.',
);

/** The ~modes sort's cards: each pattern possible under one mode only. */
const fam = (...people: PedigreePerson[]) => people;
const MODES_SORT: LayoutDef = {
  id: 'g.he-pedigree-modes',
  title: 'Mode of inheritance from a pedigree',
  kind: 'sort',
  use: 'Use this for deciding whether a trait is autosomal dominant, autosomal recessive or X-linked recessive from a pedigree.',
  assumptions: [
    'Each trait is fully penetrant: everyone with the genotype shows it.',
    'Half-filled symbols are carriers; where a card shows carriers, it shows all of them.',
  ],
  intro:
    'Look for the deciding clue: an affected child of unaffected parents, an unaffected child of two affected parents, or a carrier mother’s affected son.',
  question: 'Which mode of inheritance fits the family?',
  bins: [
    {
      id: 'AD',
      label: 'Autosomal dominant',
      why: 'Two affected parents have an unaffected child: both were Aa and the child got a and a.',
    },
    {
      id: 'AR',
      label: 'Autosomal recessive',
      why: 'Unaffected parents have an affected child (or a daughter): both parents carry a.',
    },
    {
      id: 'XR',
      label: 'X-linked recessive',
      why: 'A carrier mother passes her X with the allele to a son, who shows it; the father gives sons his Y.',
    },
  ],
  cards: [
    {
      label: 'Unaffected parents, affected daughter',
      bin: 'AR',
      figure: {
        kind: 'pedigree',
        people: fam(
          person('a', 'male', 1),
          person('b', 'female', 1),
          person('c', 'male', 2, { parents: ['a', 'b'] }),
          person('d', 'female', 2, { trait: true, parents: ['a', 'b'] }),
          person('e', 'female', 2, { parents: ['a', 'b'] }),
        ),
      },
    },
    {
      label: 'Two carrier parents',
      bin: 'AR',
      figure: {
        kind: 'pedigree',
        marked: true,
        people: fam(
          person('a', 'male', 1, { carrier: true }),
          person('b', 'female', 1, { carrier: true }),
          person('c', 'male', 2, { carrier: true, parents: ['a', 'b'] }),
          person('d', 'female', 2, { trait: true, parents: ['a', 'b'] }),
          person('e', 'male', 2, { parents: ['a', 'b'] }),
        ),
      },
    },
    {
      label: 'Two affected parents, unaffected daughter',
      bin: 'AD',
      figure: {
        kind: 'pedigree',
        people: fam(
          person('a', 'male', 1, { trait: true }),
          person('b', 'female', 1, { trait: true }),
          person('c', 'male', 2, { trait: true, parents: ['a', 'b'] }),
          person('d', 'female', 2, { parents: ['a', 'b'] }),
          person('e', 'female', 2, { trait: true, parents: ['a', 'b'] }),
        ),
      },
    },
    {
      label: 'Three generations, affected couple',
      bin: 'AD',
      figure: {
        kind: 'pedigree',
        people: fam(
          person('a', 'male', 1, { trait: true }),
          person('b', 'female', 1),
          person('c', 'female', 2, { parents: ['a', 'b'] }),
          person('d', 'male', 2, { trait: true, parents: ['a', 'b'] }),
          person('e', 'female', 2, { trait: true, partner: 'd' }),
          person('f', 'male', 3, { parents: ['d', 'e'] }),
          person('g', 'female', 3, { trait: true, parents: ['d', 'e'] }),
        ),
      },
    },
    {
      label: 'Carrier mother, affected son',
      bin: 'XR',
      figure: {
        kind: 'pedigree',
        marked: true,
        people: fam(
          person('a', 'male', 1),
          person('b', 'female', 1, { carrier: true }),
          person('c', 'male', 2, { trait: true, parents: ['a', 'b'] }),
          person('d', 'female', 2, { parents: ['a', 'b'] }),
          person('e', 'male', 2, { parents: ['a', 'b'] }),
        ),
      },
    },
    {
      label: 'Skips a generation through a daughter',
      bin: 'XR',
      figure: {
        kind: 'pedigree',
        marked: true,
        people: fam(
          person('a', 'male', 1),
          person('b', 'female', 1, { carrier: true }),
          person('c', 'male', 2, { trait: true, parents: ['a', 'b'] }),
          person('d', 'female', 2, { carrier: true, parents: ['a', 'b'] }),
          person('e', 'male', 2, { partner: 'd' }),
          person('f', 'male', 3, { trait: true, parents: ['d', 'e'] }),
          person('g', 'female', 3, { parents: ['d', 'e'] }),
        ),
      },
    },
  ],
};

// ─── HC145: linkage and mapping (genetics#1, ~three-point) ─────────────────────────

const twoPointPage = (id: string, title: string, use: string, typed: Values, extra: string) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'A test cross: every offspring shows which alleles came from the heterozygous parent.',
      'Recombinant offspring come from a crossover between the genes; 1% recombinants is 1 cM.',
      extra,
    ],
    variables: [
      num('P', 'P', 'Parental offspring', undefined, 1, 1e6, { integer: true, step: 1 }),
      num('R', 'R', 'Recombinant offspring', undefined, 1, 1e6, { integer: true, step: 1 }),
      out('N', 'N', 'Offspring', undefined, { integer: true }),
      out('rf', 'RF', 'Recombination frequency', '%', { min: 0, max: 50 }),
      out('d', 'd', 'Map distance', 'cM'),
    ],
    rules: [
      rule('total', '{N} = {P} + {R}', ['N', 'P', 'R'], (v) => v.N! - v.P! - v.R!, {
        N: [(v) => v.P! + v.R!, '{P} + {R}', 'Every offspring is parental or recombinant.'],
        P: [(v) => v.N! - v.R!, '{N} − {R}', 'The offspring that are not recombinant.'],
        R: [(v) => v.N! - v.P!, '{N} − {P}', 'The offspring that are not parental.'],
      }),
      rule('rf', '{rf} = 100 × {R} ÷ {N}', ['rf', 'R', 'N'], (v) => v.rf! - (100 * v.R!) / v.N!, {
        rf: [
          (v) => fin((100 * v.R!) / v.N!),
          '100 × {R} ÷ {N}',
          'The share of offspring that are recombinant, as a percent.',
        ],
      }),
      rule('map', '{d} = {rf}', ['d', 'rf'], (v) => v.d! - v.rf!, {
        d: [(v) => v.rf!, '{rf}', 'One percent recombinants is one centimorgan.'],
        rf: [(v) => v.d!, '{d}', 'One centimorgan is one percent recombinants.'],
      }),
    ],
    example: example(
      typed,
      ['N', (v) => v.P! + v.R!],
      ['rf', (v) => (100 * v.R!) / v.N!],
      ['d', (v) => v.rf!],
    ),
    startWith: ['P', 'R'],
    representation: { kind: 'linkageMap', loci: ['A', 'B'], distances: ['d'], recombinant: 'rf' },
  });

const LINKAGE_TWO = twoPointPage(
  'g.he-linkageMap-two',
  'Map distance from a test cross',
  'Use this for “A test cross gives 418 + 422 parental and 78 + 82 recombinant offspring. How far apart are the genes?”',
  { P: 840, R: 160 },
  'The two parental classes are added, and so are the two recombinant ones.',
);

/** Near the limit: 48% recombinants, almost as if the genes assorted independently. */
const LINKAGE_LOOSE = twoPointPage(
  'g.he-linkageMap-loose',
  'Genes far apart on a chromosome',
  'Use this for “520 parental and 480 recombinant offspring: are the genes linked, and how far apart are they?”',
  { P: 520, R: 480 },
  'Past 50 cM a test cross can’t tell linked genes from unlinked ones: RF stops at 50%.',
);

const expOf = (v: Values) => (v.d1! * v.d2! * v.N!) / 1e4;

const LINKAGE_THREE = page({
  id: 'g.he-linkageMap-three',
  title: 'Three-point cross: interference',
  use: 'Use this for “Genes 12 cM and 20 cM apart give 15 double crossovers in 1000. What is the interference?”',
  assumptions: [
    'The middle gene is the one that switches in the double crossovers.',
    'With no interference, crossovers in the two intervals are independent: expected doubles = (d₁ ÷ 100)(d₂ ÷ 100)N.',
    'Interference I = 1 − c.o.c.: one crossover makes a second one nearby less likely.',
  ],
  variables: [
    num('d1', 'd₁', 'Distance A–B', 'cM', 0.1, 50, { step: 0.1 }),
    num('d2', 'd₂', 'Distance B–C', 'cM', 0.1, 50, { step: 0.1 }),
    out('dAC', 'd_AC', 'Distance A–C', 'cM'),
    num('N', 'N', 'Offspring', undefined, 1, 1e6, { integer: true, step: 1 }),
    out('E', 'E', 'Expected double crossovers'),
    num('O', 'O', 'Observed double crossovers', undefined, 0, 1e6, { integer: true, step: 1 }),
    out('coc', 'c.o.c.', 'Coefficient of coincidence'),
    out('I', 'I', 'Interference'),
  ],
  rules: [
    rule('ac', '{dAC} = {d1} + {d2}', ['dAC', 'd1', 'd2'], (v) => v.dAC! - v.d1! - v.d2!, {
      dAC: [(v) => v.d1! + v.d2!, '{d1} + {d2}', 'Map distances add along the chromosome.'],
    }),
    rule(
      'expected',
      '{E} = {d1} ÷ 100 × {d2} ÷ 100 × {N}',
      ['E', 'd1', 'd2', 'N'],
      (v) => v.E! - expOf(v),
      {
        E: [
          expOf,
          '{d1} ÷ 100 × {d2} ÷ 100 × {N}',
          'Two independent crossovers: multiply the two chances, then the offspring.',
        ],
      },
    ),
    rule('coc', '{coc} = {O} ÷ {E}', ['coc', 'O', 'E'], (v) => v.coc! - v.O! / v.E!, {
      coc: [
        (v) => fin(v.O! / v.E!),
        '{O} ÷ {E}',
        'How many of the expected double crossovers turned up.',
      ],
      O: [(v) => v.coc! * v.E!, '{coc} × {E}', 'The coincidence times the doubles expected.'],
    }),
    rule('interference', '{I} = 1 − {coc}', ['I', 'coc'], (v) => v.I! - (1 - v.coc!), {
      I: [
        (v) => 1 - v.coc!,
        '1 − {coc}',
        'The share of expected doubles that a first crossover prevented.',
      ],
      coc: [(v) => 1 - v.I!, '1 − {I}', 'Turn I = 1 − c.o.c. round.'],
    }),
  ],
  example: example(
    { d1: 12, d2: 20, N: 1000, O: 15 },
    ['dAC', (v) => v.d1! + v.d2!],
    ['E', expOf],
    ['coc', (v) => v.O! / v.E!],
    ['I', (v) => 1 - v.coc!],
  ),
  startWith: ['d1', 'd2', 'N', 'O'],
  representation: {
    kind: 'linkageMap',
    loci: ['A', 'B', 'C'],
    distances: ['d1', 'd2'],
    offspring: 'N',
    expected: 'E',
    doubles: 'O',
    coincidence: 'coc',
    interference: 'I',
  },
});

export const HE4I_GALLERY_MODULES: ModuleDef[] = [
  CELL_RATIO,
  CELL_RATIO_SMALL,
  DIVISION_CONTENT,
  DIVISION_CONTENT_SMALL,
  PEDIGREE_RISK,
  PEDIGREE_RISK_BOTH,
  LINKAGE_TWO,
  LINKAGE_LOOSE,
  LINKAGE_THREE,
];

export const HE4I_GALLERY_LAYOUTS: LayoutDef[] = [SORT_EVIDENCE, MODES_SORT];
