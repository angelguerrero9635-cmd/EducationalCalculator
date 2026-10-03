/**
 * College gallery demos, round 4, group K (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC160: `dialyzer` (he.engineering.biotransport#2).
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
) => num(id, symbol, name, unit, -1e12, 1e12, { derived: true, ...more });

/** A finite number, or nothing. */
const fin = (x: number) => (Number.isFinite(x) ? x : undefined);
/** A finite positive number, or nothing. */
const posOf = (x: number) => (Number.isFinite(x) && x > 0 ? x : undefined);

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

// ─── HC160: a dialyzer's clearance (biotransport#2) ────────────────────────────

const kOf = (v: Values) => (v.qb! * (v.cin! - v.cout!)) / v.cin!;
const ktvOf = (v: Values) => (v.k! * v.t!) / (1000 * v.v!);
const urrOf = (v: Values) => 100 * (1 - Math.exp(-v.ktv!));

const clearanceRule = rule(
  'clearance',
  '{k} = {qb} × ({cin} − {cout}) ÷ {cin}',
  ['k', 'qb', 'cin', 'cout'],
  (v) => v.k! * v.cin! - v.qb! * (v.cin! - v.cout!),
  {
    k: [
      (v) => fin(kOf(v)),
      '{qb} × ({cin} − {cout}) ÷ {cin}',
      'The blood loses (C_in − C_out) ÷ C_in of its urea: that share of Q_b is cleared completely.',
    ],
    qb: [
      (v) => posOf((v.k! * v.cin!) / (v.cin! - v.cout!)),
      '{k} × {cin} ÷ ({cin} − {cout})',
      'Divide the clearance by the share of urea the blood loses.',
    ],
    cout: [
      (v) => fin(v.cin! * (1 - v.k! / v.qb!)),
      '{cin} × (1 − {k} ÷ {qb})',
      'The share K ÷ Q_b of the urea is taken out; the rest leaves with the blood.',
    ],
    cin: [
      (v) => posOf((v.qb! * v.cout!) / (v.qb! - v.k!)),
      '{qb} × {cout} ÷ ({qb} − {k})',
      'The outlet keeps (Q_b − K) ÷ Q_b of the inlet’s urea.',
    ],
  },
);

const ktvRule = rule(
  'ktv',
  '{ktv} = {k} × {t} ÷ (1000 × {v})',
  ['ktv', 'k', 't', 'v'],
  (v) => 1000 * v.ktv! * v.v! - v.k! * v.t!,
  {
    ktv: [
      (v) => fin(ktvOf(v)),
      '{k} × {t} ÷ (1000 × {v})',
      'The blood volume cleared in the session, K × t in mL, over the body water V (1 L is 1000 mL).',
    ],
    t: [
      (v) => posOf((1000 * v.ktv! * v.v!) / v.k!),
      '1000 × {ktv} × {v} ÷ {k}',
      'The session clears Kt/V of the body water: divide that volume by K.',
    ],
    v: [
      (v) => posOf((v.k! * v.t!) / (1000 * v.ktv!)),
      '{k} × {t} ÷ (1000 × {ktv})',
      'The volume cleared, K × t, is Kt/V times the body water.',
    ],
  },
);

const urrRule = rule(
  'urr',
  '{urr} = 100 × (1 − 1 ÷ e^({ktv}))',
  ['urr', 'ktv'],
  (v) => v.urr! - urrOf(v),
  {
    urr: [
      (v) => fin(urrOf(v)),
      '100 × (1 − 1 ÷ e^({ktv}))',
      'In one well-mixed pool the urea falls by e^(−Kt/V); the rest is the share removed.',
    ],
    ktv: [
      (v) => fin(-Math.log(1 - v.urr! / 100)),
      '−ln(1 − {urr} ÷ 100)',
      'The share left is e^(−Kt/V): take its natural log.',
    ],
  },
);

const dialyzerPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'The body’s urea is one well-mixed pool of water V.',
      'Urea made during the session is ignored.',
      'K counts the blood cleared completely: Q_b times the share of urea taken out.',
    ],
    variables: [
      num('qb', 'Q_b', 'Blood flow', 'mL/min', 50, 600, { step: 10 }),
      num('cin', 'C_in', 'Urea in the blood going in', 'mg/dL', 1, 500, { step: 1 }),
      num('cout', 'C_out', 'Urea in the blood coming out', 'mg/dL', 0.1, 500, { step: 1 }),
      num('k', 'K', 'Clearance', 'mL/min', 0.1, 600, { step: 1 }),
      num('t', 't', 'Session length', 'min', 10, 600, { step: 10 }),
      num('v', 'V', 'Body water', 'L', 5, 100, { step: 1 }),
      num('ktv', 'Kt/V', 'Dose of dialysis', undefined, 0.01, 10, { step: 0.01, figures: 3 }),
      num('urr', 'URR', 'Urea reduction ratio', '%', 0.1, 99.9, { step: 0.1, figures: 3 }),
    ],
    rules: [clearanceRule, ktvRule, urrRule],
    example: example(typed, ['k', kOf], ['ktv', ktvOf], ['urr', urrOf]),
    startWith: ['qb', 'cin', 'cout', 't', 'v'],
    representation: {
      kind: 'dialyzer',
      qb: 'qb',
      cin: 'cin',
      cout: 'cout',
      k: 'k',
      t: 't',
      v: 'v',
      ktv: 'ktv',
      urr: 'urr',
    },
  });

const DIALYZER = dialyzerPage(
  'g.he-dialyzer-clearance',
  'Dialyzer clearance, Kt/V and URR',
  'Use this for “Blood at 300 mL/min enters a dialyzer at 100 mg/dL urea and leaves at 40. What is the clearance, and Kt/V after 4 hours for 40 L of body water?”',
  { qb: 300, cin: 100, cout: 40, t: 240, v: 40 },
);

/** The top of the blood-flow range: a high-flux session. */
const DIALYZER_HIGH = dialyzerPage(
  'g.he-dialyzer-high-flow',
  'A high-flow dialyzer session',
  'Use this for “At Q_b = 500 mL/min, urea falls from 120 to 66 mg/dL across the dialyzer. What are K, Kt/V and the URR for 4 hours and 40 L?”',
  { qb: 500, cin: 120, cout: 66, t: 240, v: 40 },
);

export const HE4K_GALLERY_MODULES: ModuleDef[] = [DIALYZER, DIALYZER_HIGH];

export const HE4K_GALLERY_LAYOUTS: LayoutDef[] = [];
