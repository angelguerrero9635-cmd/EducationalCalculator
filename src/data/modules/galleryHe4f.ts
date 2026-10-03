/**
 * College gallery demos, round 4, group F (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example (docs/plans/he.earth-geography.md).
 * Spread into gallery.ts.
 * HC116: `ternary`, the new kind (he.earth-science.physical-geology#0, mineralogy#1~plagioclase).
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
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
) => num(id, symbol, name, unit, -1e30, 1e30, { derived: true, ...more });

/** A number written into step text: up to 7 figures, a negative one bracketed. */
const lit = (x: number) => {
  const s = String(Number(x.toPrecision(7))).replace('-', '−');
  return x < 0 ? `(${s})` : s;
};
/** A template with each {id} replaced by its value. */
const fill = (t: string, v: Values) => t.replace(/\{(\w+)\}/g, (_, id: string) => lit(v[id]!));
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

/** A value worked out from others, never solved backwards. */
const derive = (
  id: string,
  x: string,
  inputs: string[],
  display: string,
  f: (v: Values) => number | undefined,
  expr: StepText['expr'],
  how: StepText['how'],
): Rule => {
  const r = rule(id, display, [x, ...inputs], (v) => v[x]! - (f(v) ?? NaN), {
    [x]: [(v) => fin(f(v) ?? NaN), expr, how],
  });
  // A display in words ("log₁₀(…)") is checked as the step's arithmetic.
  if (/[A-Za-z]{3,}/.test(display.replace(/\{\w+\}/g, '')))
    r.relation.check = (v) =>
      `${fill(typeof expr === 'string' ? expr : expr(v), v)} = ${lit(v[x]!)}`;
  return r;
};

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
    // College pages are metric; every typed value opens filled (the example is whole).
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

// ─── HC116: the QAP triangle (physical-geology#0) ──────────────────────────────

const qapWork: [string, (v: Values) => number][] = [
  ['sum', (v) => v.Q! + v.A! + v.P!],
  ['M', (v) => 100 - v.sum!],
  ['qn', (v) => (100 * v.Q!) / v.sum!],
  ['an', (v) => (100 * v.A!) / v.sum!],
  ['pn', (v) => (100 * v.P!) / v.sum!],
  ['share', (v) => (100 * v.P!) / (v.A! + v.P!)],
];

const normalRule = (x: string, of: string, name: string) =>
  derive(
    x,
    x,
    [of, 'sum'],
    `{${x}} = 100 × {${of}} ÷ {sum}`,
    (v) => (100 * v[of]!) / v.sum!,
    `100 × {${of}} ÷ {sum}`,
    `${name} as a percent of quartz and the two feldspars only: the mafic minerals are left out.`,
  );

const qapPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'QAP names coarse-grained (plutonic) rocks with less than 90% mafic minerals.',
      'The mafic minerals (biotite, hornblende, pyroxene) are left out; Q, A and P are scaled to 100%.',
      'The field the point falls in names the rock (the IUGS fields).',
    ],
    variables: [
      num('Q', 'Q', 'Quartz', '%', 0, 100, { step: 1 }),
      num('A', 'A', 'Alkali feldspar', '%', 0, 100, { step: 1 }),
      num('P', 'P', 'Plagioclase', '%', 0, 100, { step: 1 }),
      out('M', 'M', 'Mafic minerals', '%'),
      out('sum', 'Q + A + P', 'Quartz and feldspars', '%'),
      out('qn', 'Q′', 'Quartz, scaled', '%'),
      out('an', 'A′', 'Alkali feldspar, scaled', '%'),
      out('pn', 'P′', 'Plagioclase, scaled', '%'),
      out('share', 'P ÷ (A + P)', 'Plagioclase share of feldspar', '%'),
    ],
    rules: [
      derive(
        'sum',
        'sum',
        ['Q', 'A', 'P'],
        '{sum} = {Q} + {A} + {P}',
        (v) => v.Q! + v.A! + v.P!,
        '{Q} + {A} + {P}',
        'Add the three minerals the triangle plots.',
      ),
      derive(
        'M',
        'M',
        ['sum'],
        '{M} = 100 − {sum}',
        (v) => 100 - v.sum!,
        '100 − {sum}',
        'The rest of the rock is mafic minerals, which QAP leaves out.',
      ),
      normalRule('qn', 'Q', 'Quartz'),
      normalRule('an', 'A', 'Alkali feldspar'),
      normalRule('pn', 'P', 'Plagioclase'),
      derive(
        'share',
        'share',
        ['A', 'P'],
        '{share} = 100 × {P} ÷ ({A} + {P})',
        (v) => (100 * v.P!) / (v.A! + v.P!),
        '100 × {P} ÷ ({A} + {P})',
        'The plagioclase share of the feldspar picks the column of fields.',
      ),
    ],
    example: example(typed, ...qapWork),
    startWith: ['Q', 'A', 'P'],
    representation: {
      kind: 'ternary',
      a: 'Q',
      b: 'A',
      c: 'P',
      labels: ['Q', 'A', 'P'],
      fields: 'qap',
      share: 'share',
      normalized: ['qn', 'an', 'pn'],
    },
  });

const QAP = qapPage(
  'g.he-ternary-qap',
  'Naming a plutonic rock on the QAP triangle',
  'Use this for “A rock is 25% quartz, 30% K-feldspar, 20% plagioclase and 25% biotite. Name it.”',
  { Q: 25, A: 30, P: 20 },
);

/** Little quartz, nearly all plagioclase: the thin bottom row of the triangle. */
const QAP_DIORITE = qapPage(
  'g.he-ternary-qap-diorite',
  'A rock with almost no quartz on the QAP triangle',
  'Use this for “A rock is 2% quartz, 3% orthoclase, 55% plagioclase and 40% hornblende. Name it.”',
  { Q: 2, A: 3, P: 55 },
);

// ─── HC116: the feldspar triangle (mineralogy#1~plagioclase) ─────────────────────

const plagWork: [string, (v: Values) => number][] = [
  ['na', (v) => 1 - v.ca!],
  ['an', (v) => (100 * v.ca!) / (v.ca! + v.na!)],
  ['al', (v) => 1 + v.ca!],
  ['si', (v) => 3 - v.ca!],
  ['charge', (v) => v.na! + 2 * v.ca! + 3 * v.al! + 4 * v.si!],
];

const plagPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'Plagioclase is NaAlSi₃O₈ to CaAl₂Si₂O₈: Ca and Na share one site, so Ca + Na = 1 per 8 oxygens.',
      'Ca²⁺ for Na⁺ is paid for by Al³⁺ for Si⁴⁺ (coupled substitution), so the charge stays 16.',
      'The plagioclase names split the An scale at 10, 30, 50, 70 and 90%.',
    ],
    variables: [
      num('ca', 'Ca', 'Calcium per 8 oxygens', undefined, 0, 1, { step: 0.01 }),
      out('na', 'Na', 'Sodium per 8 oxygens'),
      out('an', 'An', 'Anorthite content', '%'),
      out('al', 'Al', 'Aluminum per 8 oxygens'),
      out('si', 'Si', 'Silicon per 8 oxygens'),
      out('charge', 'charge', 'Cation charge'),
    ],
    rules: [
      derive(
        'na',
        'na',
        ['ca'],
        '{na} = 1 − {ca}',
        (v) => 1 - v.ca!,
        '1 − {ca}',
        'Ca and Na fill one site between them.',
      ),
      derive(
        'an',
        'an',
        ['ca', 'na'],
        '{an} = 100 × {ca} ÷ ({ca} + {na})',
        (v) => (100 * v.ca!) / (v.ca! + v.na!),
        '100 × {ca} ÷ ({ca} + {na})',
        'The anorthite content is the calcium share of the site.',
      ),
      derive(
        'al',
        'al',
        ['ca'],
        '{al} = 1 + {ca}',
        (v) => 1 + v.ca!,
        '1 + {ca}',
        'Each Ca brings one more Al in place of a Si.',
      ),
      derive(
        'si',
        'si',
        ['ca'],
        '{si} = 3 − {ca}',
        (v) => 3 - v.ca!,
        '3 − {ca}',
        'Each Ca takes one Si away.',
      ),
      derive(
        'charge',
        'charge',
        ['na', 'ca', 'al', 'si'],
        '{charge} = {na} + 2 × {ca} + 3 × {al} + 4 × {si}',
        (v) => v.na! + 2 * v.ca! + 3 * v.al! + 4 * v.si!,
        '{na} + 2 × {ca} + 3 × {al} + 4 × {si}',
        'The cations’ charge must balance 8 oxygens at −2 each: 16.',
      ),
    ],
    example: example(typed, ...plagWork),
    startWith: ['ca'],
    representation: {
      kind: 'ternary',
      a: 0,
      b: 'na',
      c: 'ca',
      labels: ['Or', 'Ab', 'An'],
      fields: 'feldspar',
      share: 'an',
    },
  });

const PLAGIOCLASE = plagPage(
  'g.he-ternary-feldspar',
  'Plagioclase on the feldspar triangle',
  'Use this for “A plagioclase has 0.6 Ca per 8 oxygens. Name it and balance its charge.”',
  { ca: 0.6 },
);

/** Nearly pure sodium plagioclase, at the Ab corner. */
const ALBITE = plagPage(
  'g.he-ternary-feldspar-albite',
  'Sodium-rich plagioclase on the feldspar triangle',
  'Use this for “A plagioclase has 0.05 Ca per 8 oxygens. Which plagioclase is it?”',
  { ca: 0.05 },
);

export const HE4F_GALLERY_MODULES: ModuleDef[] = [QAP, QAP_DIORITE, PLAGIOCLASE, ALBITE];

export const HE4F_GALLERY_LAYOUTS: LayoutDef[] = [];
