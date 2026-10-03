/**
 * College gallery demos, round 4, group F (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example (docs/plans/he.earth-geography.md).
 * Spread into gallery.ts.
 * HC116: `ternary`, the new kind (he.earth-science.physical-geology#0, mineralogy#1~plagioclase).
 * HC117: `silicateChain`, the new kind (he.earth-science.physical-geology#0~silicates).
 * HC119: `earthLayers` mode `rupture` (he.earth-science.physical-geology#2).
 * HC120: `rockLayers` `ranges` (historical-geology#2) and the cliff header (#0).
 * HC121: `michelLevy`, the new kind (he.earth-science.mineralogy#2).
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

// ─── HC117: silicate structures (physical-geology#0~silicates) ──────────────────

const silicatePage = (
  id: string,
  title: string,
  use: string,
  typed: Values,
  form?: 'ring' | 'chain',
) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'Each shared O is split between two tetrahedra, so it counts ½ in each.',
      'Sharing more oxygens leaves less negative charge for metal ions to balance.',
      'Ring and single-chain silicates both share 2 oxygens per tetrahedron.',
    ],
    variables: [
      num('s', 's', 'Shared oxygens per tetrahedron', undefined, 0, 4, {
        allowed: [0, 1, 2, 2.5, 3, 4],
      }),
      num('n', 'n', 'Si in the formula unit', undefined, 1, 6, { integer: true, step: 1 }),
      out('perSi', 'O ÷ Si', 'Oxygens per Si'),
      out('o', 'O', 'Oxygens in the unit'),
      out('q', 'z', 'Charge of the unit'),
    ],
    rules: [
      derive(
        'perSi',
        'perSi',
        ['s'],
        '{perSi} = 4 − {s} ÷ 2',
        (v) => 4 - v.s! / 2,
        '4 − {s} ÷ 2',
        'Each tetrahedron keeps its unshared oxygens whole and half of each shared one.',
      ),
      derive(
        'o',
        'o',
        ['n', 'perSi'],
        '{o} = {n} × {perSi}',
        (v) => v.n! * v.perSi!,
        '{n} × {perSi}',
        'The unit holds n tetrahedra’s worth of oxygens.',
      ),
      derive(
        'q',
        'q',
        ['n', 's'],
        '{q} = −{n} × (4 − {s})',
        (v) => -v.n! * (4 - v.s!),
        '−{n} × (4 − {s})',
        'Each Si brings +4 and each O −2, so the unit is left −(4 − s) per Si.',
      ),
    ],
    example: example(
      typed,
      ['perSi', (v) => 4 - v.s! / 2],
      ['o', (v) => v.n! * v.perSi!],
      ['q', (v) => -v.n! * (4 - v.s!)],
    ),
    startWith: ['s', 'n'],
    representation: {
      kind: 'silicateChain',
      shared: 's',
      units: 'n',
      ...(form ? { form } : {}),
      oxygens: 'o',
      perSi: 'perSi',
      charge: 'q',
    },
  });

const SILICATES = [
  silicatePage(
    'g.he-silicateChain-double',
    'A double chain silicate’s formula and charge',
    'Use this for “Amphiboles are double chains sharing 2.5 oxygens per tetrahedron. Find the formula unit of 4 Si and its charge.”',
    { s: 2.5, n: 4 },
  ),
  silicatePage(
    'g.he-silicateChain-sheet',
    'A sheet silicate’s formula and charge',
    'Use this for “Micas are sheets sharing 3 oxygens per tetrahedron. What is the unit with 2 Si?”',
    { s: 3, n: 2 },
  ),
  silicatePage(
    'g.he-silicateChain-chain',
    'A single chain silicate’s formula and charge',
    'Use this for “Pyroxenes are single chains. Write the unit with 2 Si and its charge.”',
    { s: 2, n: 2 },
  ),
  silicatePage(
    'g.he-silicateChain-ring',
    'A ring silicate’s formula and charge',
    'Use this for “Beryl has rings of 6 tetrahedra, each sharing 2 oxygens. What is the ring’s formula and charge?”',
    { s: 2, n: 6 },
    'ring',
  ),
  silicatePage(
    'g.he-silicateChain-pair',
    'Paired tetrahedra: formula and charge',
    'Use this for “Two tetrahedra share one oxygen. Write the pair’s formula and charge.”',
    { s: 1, n: 2 },
  ),
  silicatePage(
    'g.he-silicateChain-isolated',
    'An isolated tetrahedron: SiO₄',
    'Use this for “Olivine’s tetrahedra share no oxygens. What is the charge of one?”',
    { s: 0, n: 1 },
  ),
  silicatePage(
    'g.he-silicateChain-framework',
    'A framework silicate: every oxygen shared',
    'Use this for “Quartz shares all 4 oxygens of every tetrahedron. Why is it SiO₂ with no charge?”',
    { s: 4, n: 1 },
  ),
];

// ─── HC119: moment magnitude from a rupture (physical-geology#2) ────────────────

/** A large number in step text as "1.2 × 10²⁰" (the steps work in scientific form). */
const sci = (x: number) => {
  const e = Math.floor(Math.log10(Math.abs(x)));
  const m = Number((x / 10 ** e).toPrecision(7));
  const sup = [...String(e)].map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)] ?? '⁻').join('');
  return `${m} × 10${sup}`;
};

const m0Of = (v: Values) => v.mu! * 1e9 * v.A! * 1e6 * v.D!;
const mwOf = (v: Values) => (2 / 3) * (Math.log10(v.M0!) - 9.1);

const rupturePage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'Mw measures the work of slip on the fault, so it does not saturate the way local magnitudes do.',
      'Each whole step of Mw is about 32 times the energy.',
      'The largest quakes recorded are near Mw 9.5; rigidity μ is about 30 GPa in the crust.',
    ],
    variables: [
      num('mu', 'μ', 'Rigidity', 'GPa', 10, 70, { step: 1 }),
      num('L', 'L', 'Rupture length', 'km', 0.01, 1500, { step: 1 }),
      num('W', 'W', 'Rupture width', 'km', 0.01, 300, { step: 1 }),
      num('D', 'D', 'Slip', 'm', 0.001, 60, { step: 0.1 }),
      out('A', 'A', 'Rupture area', 'km²'),
      out('M0', 'M₀', 'Seismic moment', 'N·m', { scientific: true }),
      out('Mw', 'Mw', 'Moment magnitude'),
    ],
    rules: [
      derive(
        'A',
        'A',
        ['L', 'W'],
        '{A} = {L} × {W}',
        (v) => v.L! * v.W!,
        '{L} × {W}',
        'The patch that slipped is the rupture’s length times its width.',
      ),
      derive(
        'M0',
        'M0',
        ['mu', 'A', 'D'],
        '{M0} = {mu} × 10⁹ × {A} × 10⁶ × {D}',
        m0Of,
        '{mu} × 10⁹ × {A} × 10⁶ × {D}',
        'The moment is rigidity (Pa) × area (m²) × slip (m): GPa to Pa is × 10⁹, km² to m² × 10⁶.',
      ),
      derive(
        'Mw',
        'Mw',
        ['M0'],
        '{Mw} = (2 ÷ 3) × (log₁₀({M0}) − 9.1)',
        mwOf,
        (v) => `(2 ÷ 3) × (log₁₀(${sci(v.M0!)}) − 9.1)`,
        'Moment magnitude takes the log of the moment, so each step is a factor of about 32 in energy.',
      ),
    ],
    example: example(typed, ['A', (v) => v.L! * v.W!], ['M0', m0Of], ['Mw', mwOf]),
    startWith: ['L', 'W', 'D', 'mu'],
    representation: {
      kind: 'earthLayers',
      mode: 'rupture',
      length: 'L',
      width: 'W',
      slip: 'D',
      rigidity: 'mu',
      area: 'A',
      moment: 'M0',
      magnitude: 'Mw',
    },
  });

const RUPTURE = rupturePage(
  'g.he-earthLayers-rupture',
  'Moment magnitude from a fault’s rupture',
  'Use this for “A fault ruptures 100 km long and 20 km deep and slips 2 m in crust of rigidity 30 GPa. Find M₀ and Mw.”',
  { mu: 30, L: 100, W: 20, D: 2 },
);

/** A great subduction quake: a rupture over a thousand kilometres long. */
const RUPTURE_GREAT = rupturePage(
  'g.he-earthLayers-rupture-great',
  'A great subduction earthquake’s magnitude',
  'Use this for “A megathrust ruptures 1,000 km by 200 km and slips 15 m (μ = 40 GPa). What is Mw?”',
  { mu: 40, L: 1000, W: 200, D: 15 },
);

// ─── HC120: the fossil window (historical-geology#2) and the cliff (#0) ─────────

const windowWork: [string, (v: Values) => number][] = [
  ['oldest', (v) => Math.min(v.aFirst!, v.bFirst!)],
  ['youngest', (v) => Math.max(v.aLast!, v.bLast!)],
  ['span', (v) => v.oldest! - v.youngest!],
];

const fossilPage = (
  id: string,
  title: string,
  use: string,
  names: [string, string],
  typed: Values,
) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'A bed holding both fossils formed while both lived.',
      'The ranges come from dated sections elsewhere.',
      'Ranges that never overlap are rejected: these fossils never lived at the same time.',
    ],
    variables: [
      num('aFirst', 'A_first', `${names[0]} first appears`, 'Ma', 0, 4600, { step: 1 }),
      num('aLast', 'A_last', `${names[0]} last appears`, 'Ma', 0, 4600, { step: 1 }),
      num('bFirst', 'B_first', `${names[1]} first appears`, 'Ma', 0, 4600, { step: 1 }),
      num('bLast', 'B_last', `${names[1]} last appears`, 'Ma', 0, 4600, { step: 1 }),
      out('oldest', 'oldest', 'Oldest possible age', 'Ma'),
      out('youngest', 'youngest', 'Youngest possible age', 'Ma'),
      out('span', 'window', 'Window', 'Myr', { min: 0 }),
    ],
    rules: [
      derive(
        'oldest',
        'oldest',
        ['aFirst', 'bFirst'],
        '{oldest} = min({aFirst}, {bFirst})',
        (v) => Math.min(v.aFirst!, v.bFirst!),
        'min({aFirst}, {bFirst})',
        'The bed can be no older than the later of the two first appearances.',
      ),
      derive(
        'youngest',
        'youngest',
        ['aLast', 'bLast'],
        '{youngest} = max({aLast}, {bLast})',
        (v) => Math.max(v.aLast!, v.bLast!),
        'max({aLast}, {bLast})',
        'It can be no younger than the earlier of the two last appearances.',
      ),
      derive(
        'span',
        'span',
        ['oldest', 'youngest'],
        '{span} = {oldest} − {youngest}',
        (v) => v.oldest! - v.youngest!,
        '{oldest} − {youngest}',
        'The window is the time both fossils lived.',
      ),
    ],
    example: example(typed, ...windowWork),
    startWith: ['aFirst', 'aLast', 'bFirst', 'bLast'],
    representation: {
      kind: 'rockLayers',
      ranges: [
        { name: names[0], first: 'aFirst', last: 'aLast' },
        { name: names[1], first: 'bFirst', last: 'bLast' },
      ],
      oldest: 'oldest',
      youngest: 'youngest',
      window: 'span',
    },
  });

const FOSSIL_WINDOW = fossilPage(
  'g.he-rockLayers-ranges',
  'Dating a bed from two index fossils',
  'Use this for “Fossil A lived 420–380 Ma and fossil B 400–360 Ma. When did a bed holding both form?”',
  ['Fossil A', 'Fossil B'],
  { aFirst: 420, aLast: 380, bFirst: 400, bLast: 360 },
);

/** Two ranges that barely overlap: a 2-Myr window. */
const FOSSIL_NARROW = fossilPage(
  'g.he-rockLayers-ranges-narrow',
  'A narrow window from two index fossils',
  'Use this for “A trilobite lived 510–488 Ma and a graptolite 490–440 Ma. How narrow is the window?”',
  ['Trilobite', 'Graptolite'],
  { aFirst: 510, aLast: 488, bFirst: 490, bLast: 440 },
);

/** The cross-section above a sequence page's stages (historical-geology#0). */
const CLIFF_STAGES: LayoutDef = {
  kind: 'sequence',
  id: 'g.he-rockLayers-cliff',
  title: 'Reading the order of events in a cliff',
  use: 'Use this for “Put the events that made this cross-section in order, oldest first.”',
  assumptions: [
    'Beds are laid down flat, the oldest at the bottom (superposition, original horizontality).',
    'Tilted beds under flat ones were tilted and eroded before the flat ones were laid down.',
    'A dike is younger than every bed it cuts (cross-cutting relationships).',
  ],
  question: 'Read a cross-section from the bottom up, then place what cuts across.',
  header: {
    kind: 'cliff',
    beds: ['sandstone', 'shale', 'limestone', 'conglomerate', 'siltstone'],
    unconformity: 3,
    tilt: 20,
    intrusion: { rock: 'basalt' },
    surface: true,
  },
  stages: [
    { label: 'Sandstone laid down flat' },
    { label: 'Shale laid down on it' },
    { label: 'Limestone laid down on top' },
    { label: 'The three beds tilted' },
    { label: 'Erosion planes them off' },
    { label: 'Conglomerate then siltstone laid down' },
    { label: 'A basalt dike cuts every layer' },
    { label: 'Erosion shapes today’s surface' },
  ],
};

/** A dike that stops at the unconformity: it is older than the beds above. */
const CLIFF_OLD_DIKE: LayoutDef = {
  kind: 'sequence',
  id: 'g.he-rockLayers-cliff-old-dike',
  title: 'A dike older than an unconformity',
  use: 'Use this for “A dike cuts the tilted beds but not the beds above the unconformity. When did it form?”',
  assumptions: [
    'A dike cut off by an erosion surface is older than the surface and every bed above it.',
    'Tilted beds were tilted before the erosion that planed them.',
  ],
  question: 'Put the events in order, oldest first.',
  header: {
    kind: 'cliff',
    beds: ['shale', 'sandstone', 'limestone', 'sandstone'],
    unconformity: 2,
    tilt: 30,
    intrusion: { rock: 'granite', top: 1 },
  },
  stages: [
    { label: 'Shale laid down' },
    { label: 'Sandstone laid down on it' },
    { label: 'The beds tilted' },
    { label: 'A granite dike intrudes the tilted beds' },
    { label: 'Erosion cuts the unconformity' },
    { label: 'Limestone then sandstone laid down flat' },
  ],
};

// ─── HC121: retardation and interference colour (mineralogy#2) ─────────────────

const gammaOf = (v: Values) => 1000 * v.t! * v.d!;
const orderNum = (v: Values) => Math.floor(v.G! / 550) + 1;

const michelLevyPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'δ is n_high − n_low for the grain as cut, so grains of one mineral show colours up to its maximum.',
      'Each order of colours spans about 550 nm of retardation.',
      'A standard thin section is 30 μm thick.',
    ],
    variables: [
      num('t', 't', 'Thickness', 'μm', 1, 100, { step: 1 }),
      num('d', 'δ', 'Birefringence', undefined, 0.001, 0.3, { step: 0.001 }),
      out('G', 'Γ', 'Retardation', 'nm'),
      out('ord', 'order', 'Interference order', undefined, { integer: true }),
    ],
    rules: [
      derive(
        'G',
        'G',
        ['t', 'd'],
        '{G} = 1000 × {t} × {d}',
        gammaOf,
        '1000 × {t} × {d}',
        'Retardation is the thickness (1,000 nm per μm) times the birefringence.',
      ),
      derive(
        'ord',
        'ord',
        ['G'],
        '{ord} = floor({G} ÷ 550) + 1',
        orderNum,
        'floor({G} ÷ 550) + 1',
        'Each order of colours spans about 550 nm.',
      ),
    ],
    example: example(typed, ['G', gammaOf], ['ord', orderNum]),
    startWith: ['d', 't'],
    representation: {
      kind: 'michelLevy',
      thickness: 't',
      birefringence: 'd',
      retardation: 'G',
      order: 'ord',
    },
  });

const QUARTZ = michelLevyPage(
  'g.he-michelLevy-quartz',
  'Quartz’s interference colour in a thin section',
  'Use this for “Quartz has δ = 0.009. What colour is it in a 30 μm section?”',
  { t: 30, d: 0.009 },
);

const OLIVINE = michelLevyPage(
  'g.he-michelLevy-olivine',
  'Olivine’s interference colour in a thin section',
  'Use this for “Olivine has δ = 0.035. What order is its colour in a 30 μm section?”',
  { t: 30, d: 0.035 },
);

/** Calcite's large birefringence: far past the third order, a pale high-order white. */
const CALCITE = michelLevyPage(
  'g.he-michelLevy-calcite',
  'Calcite’s high-order white',
  'Use this for “Calcite has δ = 0.172. Why does it look pale in a 30 μm section?”',
  { t: 30, d: 0.172 },
);

export const HE4F_GALLERY_MODULES: ModuleDef[] = [
  QAP,
  QAP_DIORITE,
  PLAGIOCLASE,
  ALBITE,
  ...SILICATES,
  RUPTURE,
  RUPTURE_GREAT,
  FOSSIL_WINDOW,
  FOSSIL_NARROW,
  QUARTZ,
  OLIVINE,
  CALCITE,
];

export const HE4F_GALLERY_LAYOUTS: LayoutDef[] = [CLIFF_STAGES, CLIFF_OLD_DIKE];
