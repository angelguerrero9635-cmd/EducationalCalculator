/**
 * College gallery demos, round 4, group I (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC141: `curvedSolid` `ratio` (he.biology.principles-1#1).
 * HC142: `cellDivision` `content` (he.biology.principles-1#3).
 * HC143: card icons, evidence for evolution (he.biology.principles-2#0).
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { CardIcon, LayoutDef } from './layouts';
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

export const HE4I_GALLERY_MODULES: ModuleDef[] = [
  CELL_RATIO,
  CELL_RATIO_SMALL,
  DIVISION_CONTENT,
  DIVISION_CONTENT_SMALL,
];

export const HE4I_GALLERY_LAYOUTS: LayoutDef[] = [SORT_EVIDENCE];
