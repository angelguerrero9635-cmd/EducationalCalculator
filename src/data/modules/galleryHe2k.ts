/**
 * College gallery demos, round 2, group K (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC34: the college options of `chemDiagram` mode `rate` (C-P7, ACC-P32): integrated rate laws
 * of order 0, 1 and 2, Arrhenius, and consecutive reactions A → B → C.
 * HC36: the `globe` kind (EG-P3): sun, route, euler, dipole and momentum.
 */
import {
  arrheniusEa,
  consecutive,
  peakConc,
  peakTime,
} from '@/components/module/reps/rateHe2kMath';
import {
  EARTH_KM,
  RIM_MS,
  centralAngle,
  dayLength,
  inclination,
  momentumWind,
  noonAngle,
  paleolatitude,
  plateSpeed,
  sunriseHour,
} from '@/components/module/reps/globeMath';
import type { Relation, VariableDef, Values } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

/** A relation and its step text, built together so a demo lists both from one place. */
interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

const rules = (...rs: Rule[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

const st = (expr: string, how: string): StepText => ({ expr, how });
const div = (a: number, b: number) => (b === 0 || !Number.isFinite(b) ? undefined : a / b);
const pos = (x: number) => (x > 0 && Number.isFinite(x) ? x : undefined);

/** A value with a unit that never changes (the formula is written in it). */
const quantity = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  step: number,
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

/** A page limit, checked only: `ok` must hold, else `why` is the reason. */
const limit = (id: string, display: string, ok: (v: Values) => boolean, why: string): Rule => ({
  relation: {
    id,
    display,
    constraint: true,
    vars: [...new Set([...display.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!))],
    residual: (v: Values) => (ok(v) ? 0 : 1),
    solve: {},
    message: (v: Values) => (ok(v) ? undefined : why),
  },
  steps: {},
});

// ─── HC34 integrated rate laws (gen-chem-2#0, ~second-order, ~zero-order) ────

const conc = (id: string, symbol: string, name: string, more: Partial<VariableDef> = {}) =>
  quantity(id, symbol, name, 'M', 1e-6, 10, 0.0001, more);
const seconds = (id: string, symbol: string, name: string, more: Partial<VariableDef> = {}) =>
  quantity(id, symbol, name, 's', 1e-9, 1e9, 0.01, more);

/** First order: ln([A]₀ ÷ [A]) = kt. */
const firstLaw: Rule = {
  relation: {
    id: 'ln([A]₀ ÷ [A]) = kt',
    display: 'ln({A0} ÷ {A}) = {k} × {t}',
    vars: ['A', 'A0', 'k', 't'],
    residual: (v) => Math.log(v.A0! / v.A!) - v.k! * v.t!,
    solve: {
      A: (v) => v.A0! * Math.exp(-v.k! * v.t!),
      A0: (v) => v.A! * Math.exp(v.k! * v.t!),
      k: (v) => pos(Math.log(v.A0! / v.A!) / v.t!),
      t: (v) => pos(Math.log(v.A0! / v.A!) / v.k!),
    },
  },
  steps: {
    A: st('{A0} × e^(−{k} × {t})', 'Multiply k by t, raise e to minus that, and scale [A]₀.'),
    A0: st('{A} × e^({k} × {t})', 'Multiply k by t, raise e to it, and scale [A] up.'),
    k: st('ln({A0} ÷ {A}) ÷ {t}', 'Take ln of how many times [A] fell, then divide by the time.'),
    t: st('ln({A0} ÷ {A}) ÷ {k}', 'Take ln of how many times [A] fell, then divide by k.'),
  },
};

/** First-order half-life: t½ = ln 2 ÷ k. */
const firstHalf: Rule = {
  relation: {
    id: 't½ = ln 2 ÷ k',
    display: '{half} = ln(2) ÷ {k}',
    vars: ['half', 'k'],
    residual: (v) => v.half! * v.k! - Math.LN2,
    solve: { half: (v) => div(Math.LN2, v.k!), k: (v) => div(Math.LN2, v.half!) },
  },
  steps: {
    half: st('ln(2) ÷ {k}', 'Half is gone when kt = ln 2: divide ln 2 by k.'),
    k: st('ln(2) ÷ {half}', 'Divide ln 2 by the half-life.'),
  },
};

/** The fraction left: f = [A] ÷ [A]₀. */
const fractionLeft: Rule = {
  relation: {
    id: 'f = [A] ÷ [A]₀',
    display: '{f} = {A} ÷ {A0}',
    vars: ['f', 'A', 'A0'],
    residual: (v) => v.f! * v.A0! - v.A!,
    solve: {
      f: (v) => div(v.A!, v.A0!),
      A: (v) => v.f! * v.A0!,
      A0: (v) => div(v.A!, v.f!),
    },
  },
  steps: {
    f: st('{A} ÷ {A0}', 'Divide what is left by what there was.'),
    A: st('{f} × {A0}', 'Take that fraction of [A]₀.'),
    A0: st('{A} ÷ {f}', 'Divide what is left by the fraction left.'),
  },
};

const rateFirst: ModuleDef = {
  id: 'g.he-chemDiagram-rate-first',
  title: 'A first-order reaction: [A] against time and its half-lives',
  use: 'Use this for a first-order concentration after a time, the time to reach a level, or t½.',
  assumptions: [
    'The reaction is first order in A: rate = k[A].',
    't½ does not depend on [A]₀; a straight ln [A]–t line is the test for first order.',
  ],
  variables: [
    quantity('k', 'k', 'Rate constant', 's⁻¹', 1e-10, 1e6, 0.0001, { scientific: true }),
    conc('A0', '[A]₀', 'Starting concentration'),
    seconds('t', 't', 'Time'),
    conc('A', '[A]', 'Concentration at t', { min: 1e-12 }),
    seconds('half', 't½', 'Half-life'),
    quantity('f', 'f', 'Fraction left', undefined, 0, 1, 0.001),
  ],
  ...rules(
    firstLaw,
    firstHalf,
    fractionLeft,
    limit(
      'kt ≤ 13',
      '{k} × {t} ≤ 13',
      (v) => v.k! * v.t! <= 13,
      'After kt = 13 less than 3 millionths of A is left: pick a shorter time.',
    ),
  ),
  example: {
    k: 5.0e-4,
    A0: 0.2,
    t: 1000,
    A: 0.2 * Math.exp(-0.5),
    half: Math.LN2 / 5.0e-4,
    f: Math.exp(-0.5),
  },
  startWith: ['k', 'A0', 't'],
  representation: {
    kind: 'chemDiagram',
    mode: 'rate',
    integrated: { order: 1, k: 'k', start: 'A0', t: 't', conc: 'A', half: 'half' },
  },
};

/** Second order: 1/[A] = 1/[A]₀ + kt. */
const secondLaw: Rule = {
  relation: {
    id: '1/[A] = 1/[A]₀ + kt',
    display: '1 ÷ {A} = 1 ÷ {A0} + {k} × {t}',
    vars: ['A', 'A0', 'k', 't'],
    residual: (v) => v.A! * (1 / v.A0! + v.k! * v.t!) - 1,
    solve: {
      A: (v) => pos(1 / (1 / v.A0! + v.k! * v.t!)),
      A0: (v) => pos(1 / (1 / v.A! - v.k! * v.t!)),
      k: (v) => pos((1 / v.A! - 1 / v.A0!) / v.t!),
      t: (v) => pos((1 / v.A! - 1 / v.A0!) / v.k!),
    },
  },
  steps: {
    A: st('1 ÷ (1 ÷ {A0} + {k} × {t})', 'Add kt to 1/[A]₀, then take the reciprocal.'),
    A0: st('1 ÷ (1 ÷ {A} − {k} × {t})', 'Subtract kt from 1/[A], then take the reciprocal.'),
    k: st('(1 ÷ {A} − 1 ÷ {A0}) ÷ {t}', 'The rise of 1/[A] over the time is the slope k.'),
    t: st('(1 ÷ {A} − 1 ÷ {A0}) ÷ {k}', 'The rise of 1/[A] divided by the slope k.'),
  },
};

/** Second-order half-life: t½ = 1 ÷ (k[A]₀). */
const secondHalf: Rule = {
  relation: {
    id: 't½ = 1 ÷ (k[A]₀)',
    display: '{half} = 1 ÷ ({k} × {A0})',
    vars: ['half', 'k', 'A0'],
    residual: (v) => v.half! * v.k! * v.A0! - 1,
    solve: {
      half: (v) => div(1, v.k! * v.A0!),
      k: (v) => div(1, v.half! * v.A0!),
      A0: (v) => div(1, v.half! * v.k!),
    },
  },
  steps: {
    half: st('1 ÷ ({k} × {A0})', 'Multiply k by [A]₀, then take the reciprocal.'),
    k: st('1 ÷ ({half} × {A0})', 'Multiply t½ by [A]₀, then take the reciprocal.'),
    A0: st('1 ÷ ({half} × {k})', 'Multiply t½ by k, then take the reciprocal.'),
  },
};

const rateSecond: ModuleDef = {
  id: 'g.he-chemDiagram-rate-second',
  title: 'A second-order reaction: each half-life twice the last',
  use: 'Use this for a second-order concentration after a time, or a half-life that depends on [A]₀.',
  assumptions: [
    'The reaction is second order in A: rate = k[A]².',
    'A straight 1/[A]–t line is the test for second order; t½ grows as [A] falls.',
  ],
  variables: [
    quantity('k', 'k', 'Rate constant', 'M⁻¹s⁻¹', 1e-4, 1000, 0.001),
    conc('A0', '[A]₀', 'Starting concentration', { min: 1e-10 }),
    seconds('t', 't', 'Time', { max: 1e6 }),
    conc('A', '[A]', 'Concentration at t', { min: 1e-12 }),
    seconds('half', 't½', 'First half-life', { max: 1e6 }),
  ],
  ...rules(secondLaw, secondHalf),
  example: { k: 0.5, A0: 0.1, t: 60, A: 0.025, half: 20 },
  startWith: ['k', 'A0', 't'],
  representation: {
    kind: 'chemDiagram',
    mode: 'rate',
    integrated: { order: 2, k: 'k', start: 'A0', t: 't', conc: 'A', half: 'half' },
  },
};

/** Zero order: [A] = [A]₀ − kt. */
const zeroLaw: Rule = {
  relation: {
    id: '[A] = [A]₀ − kt',
    display: '{A} = {A0} − {k} × {t}',
    vars: ['A', 'A0', 'k', 't'],
    residual: (v) => v.A! - v.A0! + v.k! * v.t!,
    solve: {
      A: (v) => v.A0! - v.k! * v.t!,
      A0: (v) => v.A! + v.k! * v.t!,
      k: (v) => pos((v.A0! - v.A!) / v.t!),
      t: (v) => pos((v.A0! - v.A!) / v.k!),
    },
  },
  steps: {
    A: st('{A0} − {k} × {t}', 'It falls at a steady k: take kt from [A]₀.'),
    A0: st('{A} + {k} × {t}', 'Add back what was used, kt.'),
    k: st('({A0} − {A}) ÷ {t}', 'What was used over the time.'),
    t: st('({A0} − {A}) ÷ {k}', 'What was used over the steady rate.'),
  },
};

const zeroHalf: Rule = {
  relation: {
    id: 't½ = [A]₀ ÷ (2k)',
    display: '{half} = {A0} ÷ (2 × {k})',
    vars: ['half', 'A0', 'k'],
    residual: (v) => 2 * v.half! * v.k! - v.A0!,
    solve: {
      half: (v) => div(v.A0!, 2 * v.k!),
      A0: (v) => 2 * v.half! * v.k!,
      k: (v) => div(v.A0!, 2 * v.half!),
    },
  },
  steps: {
    half: st('{A0} ÷ (2 × {k})', 'Half of [A]₀ used at the steady rate k.'),
    A0: st('2 × {half} × {k}', 'Twice what is used in one half-life.'),
    k: st('{A0} ÷ (2 × {half})', 'Half of [A]₀ over the half-life.'),
  },
};

const zeroEnd: Rule = {
  relation: {
    id: 't_end = [A]₀ ÷ k',
    display: '{tend} = {A0} ÷ {k}',
    vars: ['tend', 'A0', 'k'],
    residual: (v) => v.tend! * v.k! - v.A0!,
    solve: {
      tend: (v) => div(v.A0!, v.k!),
      A0: (v) => v.tend! * v.k!,
      k: (v) => div(v.A0!, v.tend!),
    },
  },
  steps: {
    tend: st('{A0} ÷ {k}', 'All of [A]₀ used at the steady rate k.'),
    A0: st('{tend} × {k}', 'The steady rate times the time it lasts.'),
    k: st('{A0} ÷ {tend}', 'All of [A]₀ over the time it lasts.'),
  },
};

const zeroDemo = (id: string, title: string, t: number): ModuleDef => ({
  id,
  title,
  use: 'Use this for a zero-order concentration after a time, its half-life, or when it runs out.',
  assumptions: [
    'The reaction is zero order: rate = k, whatever [A] is (a saturated catalyst).',
    'The law holds until A runs out at [A]₀ ÷ k; after that [A] stays 0.',
  ],
  variables: [
    quantity('k', 'k', 'Rate constant', 'M/s', 1e-9, 100, 0.0001, { scientific: true }),
    conc('A0', '[A]₀', 'Starting concentration'),
    seconds('t', 't', 'Time'),
    conc('A', '[A]', 'Concentration at t', { min: 1e-12 }),
    seconds('half', 't½', 'Half-life'),
    seconds('tend', 't_end', 'Time it runs out'),
  ],
  ...rules(
    zeroLaw,
    zeroHalf,
    zeroEnd,
    limit(
      't ≤ t_end',
      '{t} ≤ {tend}',
      (v) => v.t! <= v.tend! * (1 + 1e-9),
      'A has run out by then: pick a time up to [A]₀ ÷ k.',
    ),
  ),
  example: { k: 2.0e-3, A0: 0.5, t, A: 0.5 - 2.0e-3 * t, half: 125, tend: 250 },
  startWith: ['k', 'A0', 't'],
  representation: {
    kind: 'chemDiagram',
    mode: 'rate',
    integrated: { order: 0, k: 'k', start: 'A0', t: 't', conc: 'A', half: 'half' },
  },
});

const rateZero = zeroDemo(
  'g.he-chemDiagram-rate-zero',
  'A zero-order reaction: a straight fall until it runs out',
  100,
);
const rateZeroEnd = zeroDemo(
  'g.he-chemDiagram-rate-zero-end',
  'A zero-order reaction just before it runs out',
  240,
);

// ─── HC34 Arrhenius (gen-chem-2#0~arrhenius, physical-1#3) ───────────────────

const R_GAS = 8.314;
const kelvin = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, 'K', 1, 3000, 0.01);
const perSecond = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, 's⁻¹', 1e-15, 1e15, 0.0001, { scientific: true });

/** ln(k₂ ÷ k₁) = (Eₐ ÷ R)(1/T₁ − 1/T₂), Eₐ in kJ/mol. */
const twoPoint: Rule = {
  relation: {
    id: 'ln(k₂ ÷ k₁) = (Eₐ ÷ R)(1/T₁ − 1/T₂)',
    display: 'ln({k2} ÷ {k1}) = ({Ea} × 1000 ÷ 8.314) × (1 ÷ {T1} − 1 ÷ {T2})',
    vars: ['k2', 'k1', 'Ea', 'T1', 'T2'],
    residual: (v) => Math.log(v.k2! / v.k1!) - ((v.Ea! * 1000) / R_GAS) * (1 / v.T1! - 1 / v.T2!),
    solve: {
      Ea: (v) => div(arrheniusEa(v.k1!, v.T1!, v.k2!, v.T2!, R_GAS), 1000),
      k2: (v) => v.k1! * Math.exp(((v.Ea! * 1000) / R_GAS) * (1 / v.T1! - 1 / v.T2!)),
      k1: (v) => v.k2! / Math.exp(((v.Ea! * 1000) / R_GAS) * (1 / v.T1! - 1 / v.T2!)),
      T2: (v) => pos(1 / (1 / v.T1! - (R_GAS * Math.log(v.k2! / v.k1!)) / (v.Ea! * 1000))),
      T1: (v) => pos(1 / (1 / v.T2! + (R_GAS * Math.log(v.k2! / v.k1!)) / (v.Ea! * 1000))),
    },
  },
  steps: {
    Ea: st(
      '8.314 × ln({k2} ÷ {k1}) ÷ (1 ÷ {T1} − 1 ÷ {T2}) ÷ 1000',
      'The slope of ln k against 1/T is −Eₐ/R: R times the rise of ln k over the change in 1/T, then J to kJ.',
    ),
    k2: st(
      '{k1} × e^(({Ea} × 1000 ÷ 8.314) × (1 ÷ {T1} − 1 ÷ {T2}))',
      'Work out the exponent, raise e to it, and scale k₁.',
    ),
    k1: st(
      '{k2} ÷ e^(({Ea} × 1000 ÷ 8.314) × (1 ÷ {T1} − 1 ÷ {T2}))',
      'Work out the exponent, raise e to it, and divide k₂ by it.',
    ),
    T2: st(
      '1 ÷ (1 ÷ {T1} − 8.314 × ln({k2} ÷ {k1}) ÷ ({Ea} × 1000))',
      'Take R ln(k₂ ÷ k₁) ÷ Eₐ from 1/T₁, then take the reciprocal.',
    ),
    T1: st(
      '1 ÷ (1 ÷ {T2} + 8.314 × ln({k2} ÷ {k1}) ÷ ({Ea} × 1000))',
      'Add R ln(k₂ ÷ k₁) ÷ Eₐ to 1/T₂, then take the reciprocal.',
    ),
  },
};

/** k₁ = A e^(−Eₐ/RT₁). */
const prefactor: Rule = {
  relation: {
    id: 'k₁ = A e^(−Eₐ/RT₁)',
    display: '{k1} = {A} × e^(−{Ea} × 1000 ÷ (8.314 × {T1}))',
    vars: ['k1', 'A', 'Ea', 'T1'],
    residual: (v) => Math.log(v.k1! / v.A!) + (v.Ea! * 1000) / (R_GAS * v.T1!),
    solve: {
      k1: (v) => v.A! * Math.exp((-v.Ea! * 1000) / (R_GAS * v.T1!)),
      A: (v) => v.k1! * Math.exp((v.Ea! * 1000) / (R_GAS * v.T1!)),
    },
  },
  steps: {
    k1: st(
      '{A} × e^(−{Ea} × 1000 ÷ (8.314 × {T1}))',
      'The share of collisions with energy Eₐ, times the frequency factor.',
    ),
    A: st(
      '{k1} × e^({Ea} × 1000 ÷ (8.314 × {T1}))',
      'Divide k₁ by the share of collisions with energy Eₐ.',
    ),
  },
};

const T1_EX = 298.15;
const T2_EX = 308.15;
const EA_EX = arrheniusEa(1, T1_EX, 2, T2_EX, R_GAS) / 1000;
const rateArrhenius: ModuleDef = {
  id: 'g.he-chemDiagram-rate-arrhenius',
  title: 'Arrhenius: ln k against 1/T from two readings',
  use: 'Use this for Eₐ from k at two temperatures, or k at a new temperature.',
  assumptions: [
    'Eₐ and A do not change between the two temperatures; R = 8.314 J/(mol·K).',
    'Temperatures are in kelvins.',
  ],
  variables: [
    perSecond('k1', 'k₁', 'Rate constant at T₁'),
    kelvin('T1', 'T₁', 'First temperature'),
    perSecond('k2', 'k₂', 'Rate constant at T₂'),
    kelvin('T2', 'T₂', 'Second temperature'),
    quantity('Ea', 'Eₐ', 'Activation energy', 'kJ/mol', 0.1, 1000, 0.01),
    perSecond('A', 'A', 'Frequency factor'),
  ],
  ...rules(twoPoint, prefactor),
  example: {
    k1: 1.0e-3,
    T1: T1_EX,
    k2: 2.0e-3,
    T2: T2_EX,
    Ea: EA_EX,
    A: 1.0e-3 * Math.exp((EA_EX * 1000) / (R_GAS * T1_EX)),
  },
  startWith: ['k1', 'T1', 'k2', 'T2'],
  representation: {
    kind: 'chemDiagram',
    mode: 'rate',
    arrhenius: { k1: 'k1', T1: 'T1', k2: 'k2', T2: 'T2', Ea: 'Ea' },
  },
};

// ─── HC34 consecutive reactions (physical-1#3, reaction-engineering#2) ───────

/** [A] = [A]₀e^(−k₁t). */
const aDecay: Rule = {
  relation: {
    id: '[A] = [A]₀e^(−k₁t)',
    display: '{A} = {A0} × e^(−{k1} × {t})',
    vars: ['A', 'A0', 'k1', 't'],
    residual: (v) => Math.log(v.A0! / v.A!) - v.k1! * v.t!,
    solve: {
      A: (v) => v.A0! * Math.exp(-v.k1! * v.t!),
      A0: (v) => v.A! * Math.exp(v.k1! * v.t!),
      k1: (v) => pos(Math.log(v.A0! / v.A!) / v.t!),
      t: (v) => pos(Math.log(v.A0! / v.A!) / v.k1!),
    },
  },
  steps: {
    A: st('{A0} × e^(−{k1} × {t})', 'A decays first order: raise e to −k₁t and scale [A]₀.'),
    A0: st('{A} × e^({k1} × {t})', 'Raise e to k₁t and scale [A] up.'),
    k1: st('ln({A0} ÷ {A}) ÷ {t}', 'Take ln of how many times [A] fell, then divide by t.'),
    t: st('ln({A0} ÷ {A}) ÷ {k1}', 'Take ln of how many times [A] fell, then divide by k₁.'),
  },
};

/** [B] = [A]₀k₁(e^(−k₁t) − e^(−k₂t)) ÷ (k₂ − k₁). */
const bRise: Rule = {
  relation: {
    id: '[B] = [A]₀k₁(e^(−k₁t) − e^(−k₂t)) ÷ (k₂ − k₁)',
    display: '{B} = {A0} × {k1} × (e^(−{k1} × {t}) − e^(−{k2} × {t})) ÷ ({k2} − {k1})',
    vars: ['B', 'A0', 'k1', 'k2', 't'],
    residual: (v) => v.B! - consecutive(v.k1!, v.k2!, v.A0!, v.t!).B,
    solve: {
      B: (v) => consecutive(v.k1!, v.k2!, v.A0!, v.t!).B,
      A0: (v) => div(v.B!, consecutive(v.k1!, v.k2!, 1, v.t!).B),
    },
  },
  steps: {
    B: st(
      '{A0} × {k1} × (e^(−{k1} × {t}) − e^(−{k2} × {t})) ÷ ({k2} − {k1})',
      'B is made from A at k₁ and lost at k₂: the two exponentials’ gap, scaled by [A]₀k₁ ÷ (k₂ − k₁).',
    ),
    A0: st(
      '{B} × ({k2} − {k1}) ÷ ({k1} × (e^(−{k1} × {t}) − e^(−{k2} × {t})))',
      'Divide [B] by what one mole per litre of A would give.',
    ),
  },
};

/** [C] = [A]₀ − [A] − [B]. */
const cRest: Rule = {
  relation: {
    id: '[C] = [A]₀ − [A] − [B]',
    display: '{C} = {A0} − {A} − {B}',
    vars: ['C', 'A0', 'A', 'B'],
    residual: (v) => v.C! - v.A0! + v.A! + v.B!,
    solve: {
      C: (v) => v.A0! - v.A! - v.B!,
      A0: (v) => v.A! + v.B! + v.C!,
      A: (v) => v.A0! - v.B! - v.C!,
      B: (v) => v.A0! - v.A! - v.C!,
    },
  },
  steps: {
    C: st('{A0} − {A} − {B}', 'Nothing is lost: C is what A and B no longer hold.'),
    A0: st('{A} + {B} + {C}', 'The three add up to what A started with.'),
    A: st('{A0} − {B} − {C}', 'Take B and C from [A]₀.'),
    B: st('{A0} − {A} − {C}', 'Take A and C from [A]₀.'),
  },
};

/** t_max = ln(k₁ ÷ k₂) ÷ (k₁ − k₂). */
const peakAt = (k1: string, k2: string, tmax: string): Rule => ({
  relation: {
    id: 't_max = ln(k₁ ÷ k₂) ÷ (k₁ − k₂)',
    display: `{${tmax}} = ln({${k1}} ÷ {${k2}}) ÷ ({${k1}} − {${k2}})`,
    vars: [tmax, k1, k2],
    residual: (v) => v[tmax]! - peakTime(v[k1]!, v[k2]!),
    solve: { [tmax]: (v) => peakTime(v[k1]!, v[k2]!) },
  },
  steps: {
    [tmax]: st(
      `ln({${k1}} ÷ {${k2}}) ÷ ({${k1}} − {${k2}})`,
      'B peaks when it is made as fast as it is lost, k₁[A] = k₂[B].',
    ),
  },
});

const apart = (k1: string, k2: string) =>
  limit(
    'k₁ ≠ k₂',
    `{${k1}} ≠ {${k2}}`,
    (v) => Math.abs(v[k1]! - v[k2]!) > 1e-9 * Math.max(v[k1]!, v[k2]!),
    'The formula for t_max needs two different rate constants.',
  );

const stepK = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, 's⁻¹', 1e-6, 1000, 0.0001);

const consecutiveDemo = (
  id: string,
  title: string,
  [k1, k2, A0, t]: [number, number, number, number],
): ModuleDef => {
  const v = consecutive(k1, k2, A0, t);
  return {
    id,
    title,
    use: 'Use this for an intermediate’s concentration in A → B → C, and when it peaks.',
    assumptions: [
      'Both steps are first order; only A is there at the start.',
      'Nothing else is made or lost, so [A] + [B] + [C] = [A]₀.',
    ],
    variables: [
      stepK('k1', 'k₁', 'Rate constant of A → B'),
      stepK('k2', 'k₂', 'Rate constant of B → C'),
      conc('A0', '[A]₀', 'Starting concentration of A'),
      seconds('t', 't', 'Time'),
      conc('A', '[A]', 'A at t', { min: 1e-12 }),
      conc('B', '[B]', 'B at t', { min: 1e-12 }),
      conc('C', '[C]', 'C at t', { min: 1e-12 }),
      seconds('tmax', 't_max', 'Time of the most B'),
    ],
    ...rules(
      aDecay,
      bRise,
      cRest,
      peakAt('k1', 'k2', 'tmax'),
      apart('k1', 'k2'),
      limit(
        'k₁t ≤ 13',
        '{k1} × {t} ≤ 13',
        (v) => v.k1! * v.t! <= 13,
        'After k₁t = 13 less than 3 millionths of A is left: pick a shorter time.',
      ),
    ),
    example: { k1, k2, A0, t, A: v.A, B: v.B, C: v.C, tmax: peakTime(k1, k2) },
    startWith: ['k1', 'k2', 'A0', 't'],
    representation: {
      kind: 'chemDiagram',
      mode: 'rate',
      consecutive: {
        k1: 'k1',
        k2: 'k2',
        start: 'A0',
        t: 't',
        tmax: 'tmax',
        at: ['A', 'B', 'C'],
      },
    },
  };
};

const rateConsecutive = consecutiveDemo(
  'g.he-chemDiagram-rate-consecutive',
  'Consecutive reactions A → B → C: the intermediate peaks',
  [0.1, 0.05, 1.0, 10],
);
const rateConsecutiveFast = consecutiveDemo(
  'g.he-chemDiagram-rate-consecutive-fast',
  'A → B → C with B used up fast: a small, early peak',
  [0.05, 1.0, 1.0, 20],
);

/** C_B,max = C_A0(k₁ ÷ k₂)^(k₂ ÷ (k₂ − k₁)). */
const peakAmount: Rule = {
  relation: {
    id: 'C_B,max = C_A0(k₁ ÷ k₂)^(k₂ ÷ (k₂ − k₁))',
    display: '{CBmax} = {CA0} × ({k1} ÷ {k2})^({k2} ÷ ({k2} − {k1}))',
    vars: ['CBmax', 'CA0', 'k1', 'k2'],
    residual: (v) => v.CBmax! - peakConc(v.k1!, v.k2!, v.CA0!),
    solve: {
      CBmax: (v) => peakConc(v.k1!, v.k2!, v.CA0!),
      CA0: (v) => div(v.CBmax!, peakConc(v.k1!, v.k2!, 1)),
    },
  },
  steps: {
    CBmax: st(
      '{CA0} × ({k1} ÷ {k2})^({k2} ÷ ({k2} − {k1}))',
      'Raise k₁ ÷ k₂ to k₂ ÷ (k₂ − k₁), then scale the feed concentration.',
    ),
    CA0: st(
      '{CBmax} ÷ ({k1} ÷ {k2})^({k2} ÷ ({k2} − {k1}))',
      'Divide the peak by the share of the feed it reaches.',
    ),
  },
};

const yieldOf: Rule = {
  relation: {
    id: 'yield = C_B,max ÷ C_A0',
    display: '{Y} = {CBmax} ÷ {CA0}',
    vars: ['Y', 'CBmax', 'CA0'],
    residual: (v) => v.Y! * v.CA0! - v.CBmax!,
    solve: {
      Y: (v) => div(v.CBmax!, v.CA0!),
      CBmax: (v) => v.Y! * v.CA0!,
      CA0: (v) => div(v.CBmax!, v.Y!),
    },
  },
  steps: {
    Y: st('{CBmax} ÷ {CA0}', 'The share of the feed that is B at the peak.'),
    CBmax: st('{Y} × {CA0}', 'That share of the feed.'),
    CA0: st('{CBmax} ÷ {Y}', 'The peak over its share.'),
  },
};

const molL = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, 'mol/L', 0.0001, 100, 0.001);
const perHour = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, 'h⁻¹', 0.0001, 1000, 0.0001);

const SERIES_EX = { k1: 0.5, k2: 0.2, CA0: 2 };
const rateSeries: ModuleDef = {
  id: 'g.he-chemDiagram-rate-series',
  title: 'Reactions in series: when to stop for the most B',
  use: 'Use this for the time and amount of the intermediate’s maximum in A → B → C.',
  assumptions: [
    'First-order steps, in a batch reactor or a plug-flow reactor (t is the residence time).',
    'No B in the feed; k₁ ≠ k₂.',
  ],
  variables: [
    perHour('k1', 'k₁', 'Rate constant of A → B'),
    perHour('k2', 'k₂', 'Rate constant of B → C'),
    molL('CA0', 'C_A0', 'Feed concentration of A'),
    quantity('tmax', 't_max', 'Time of the most B', 'h', 0.0001, 100000, 0.01),
    molL('CBmax', 'C_B,max', 'Most B'),
    quantity('Y', 'Y', 'Yield of B at the peak', undefined, 0, 1, 0.001),
  ],
  ...rules(peakAt('k1', 'k2', 'tmax'), peakAmount, yieldOf, apart('k1', 'k2')),
  example: {
    ...SERIES_EX,
    tmax: peakTime(SERIES_EX.k1, SERIES_EX.k2),
    CBmax: peakConc(SERIES_EX.k1, SERIES_EX.k2, SERIES_EX.CA0),
    Y: peakConc(SERIES_EX.k1, SERIES_EX.k2, 1),
  },
  startWith: ['k1', 'k2', 'CA0'],
  representation: {
    kind: 'chemDiagram',
    mode: 'rate',
    notation: 'C',
    consecutive: { k1: 'k1', k2: 'k2', start: 'CA0', tmax: 'tmax', peak: 'CBmax' },
  },
};

/** The chemDiagram rate demos (HC34). */
const RATE_DEMOS: ModuleDef[] = [
  rateFirst,
  rateSecond,
  rateZero,
  rateZeroEnd,
  rateArrhenius,
  rateConsecutive,
  rateConsecutiveFast,
  rateSeries,
];

// ─── HC36 globe (EG-P3) ──────────────────────────────────────────────────────

const degrees = (
  id: string,
  symbol: string,
  name: string,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
) => quantity(id, symbol, name, '°', min, max, 0.01, more);

/** Noon sun angle = 90 − |φ − δ|. */
const noonRule: Rule = {
  relation: {
    id: 'noon angle = 90 − |φ − δ|',
    display: '{noon} = 90 − |{lat} − {dec}|',
    vars: ['noon', 'lat', 'dec'],
    residual: (v) => v.noon! - noonAngle(v.lat!, v.dec!),
    solve: { noon: (v) => noonAngle(v.lat!, v.dec!) },
  },
  steps: {
    noon: st(
      '90 − |{lat} − {dec}|',
      'The Sun is overhead at δ; each degree of latitude away lowers it a degree.',
    ),
  },
};

/** cos H = −tan φ tan δ. */
const sunriseRule: Rule = {
  relation: {
    id: 'cos H = −tan φ tan δ',
    display: 'cos({H}°) = −tan({lat}°) × tan({dec}°)',
    vars: ['H', 'lat', 'dec'],
    residual: (v) => v.H! - sunriseHour(v.lat!, v.dec!),
    solve: { H: (v) => sunriseHour(v.lat!, v.dec!) },
  },
  steps: {
    H: st(
      'arccos(−tan({lat}°) × tan({dec}°))',
      'The hour angle of sunrise: where the parallel crosses the circle of illumination.',
    ),
  },
};

/** day = 2H ÷ 15. */
const dayRule: Rule = {
  relation: {
    id: 'day = 2H ÷ 15',
    display: '{day} = 2 × {H} ÷ 15',
    vars: ['day', 'H'],
    residual: (v) => 15 * v.day! - 2 * v.H!,
    solve: { day: (v) => (2 * v.H!) / 15, H: (v) => (15 * v.day!) / 2 },
  },
  steps: {
    day: st('2 × {H} ÷ 15', 'Sunrise to sunset is 2H of turning, and 15° of turning is one hour.'),
    H: st('15 × {day} ÷ 2', 'Turn the hours into degrees of turning, then halve.'),
  },
};

/** The page keeps φ inside the polar circles, where the Sun rises and sets each day. */
const SUN_VARS = [
  degrees('lat', 'φ', 'Latitude', -66.5, 66.5),
  degrees('dec', 'δ', 'Declination of the Sun', -23.44, 23.44),
  degrees('noon', 'α', 'Noon sun angle', 0, 90),
  degrees('H', 'H', 'Sunrise hour angle', 0, 180),
  quantity('day', 'D', 'Day length', 'h', 0.01, 24, 0.01),
];

const sunExample = (lat: number, dec: number) => ({
  lat,
  dec,
  noon: noonAngle(lat, dec),
  H: sunriseHour(lat, dec),
  day: dayLength(lat, dec),
});

const sunDemo = (id: string, title: string, lat: number, dec: number): ModuleDef => ({
  id,
  title,
  use: 'Use this for the noon sun angle and the day length at a latitude on a date.',
  assumptions: [
    'δ is the latitude where the Sun is overhead at noon; 15° of turning is one hour.',
    'Refraction and the Sun’s width (a few minutes) are ignored; φ stays inside the polar circles.',
  ],
  variables: SUN_VARS,
  ...rules(noonRule, sunriseRule, dayRule),
  example: sunExample(lat, dec),
  startWith: ['lat', 'dec'],
  representation: {
    kind: 'globe',
    mode: 'sun',
    latitude: 'lat',
    declination: 'dec',
    noon: 'noon',
    hour: 'H',
    day: 'day',
  },
});

const globeSun = sunDemo('g.he-globe-sun', 'The noon sun and the day at 40° N in June', 40, 23.44);
const globeSunDecember = sunDemo(
  'g.he-globe-sun-december',
  'The noon sun and the day at 40° N in December',
  40,
  -23.44,
);
const globeSunArctic = sunDemo(
  'g.he-globe-sun-arctic',
  'Just inside the Arctic Circle at the June solstice',
  66,
  23.44,
);

function insolation(lat: number, dec: number, H: number) {
  const r = Math.PI / 180;
  return (
    (1361 / Math.PI) *
    (H * r * Math.sin(lat * r) * Math.sin(dec * r) +
      Math.cos(lat * r) * Math.cos(dec * r) * Math.sin(H * r))
  );
}

/** Daily mean sunlight at the top of the atmosphere (~insolation). */
const insolationRule: Rule = {
  relation: {
    id: 'Q = (1361 ÷ π)(H sin φ sin δ + cos φ cos δ sin H)',
    display:
      '{Q} = (1361 ÷ π) × ({H} × π ÷ 180 × sin({lat}°) × sin({dec}°) + cos({lat}°) × cos({dec}°) × sin({H}°))',
    vars: ['Q', 'H', 'lat', 'dec'],
    residual: (v) => v.Q! - insolation(v.lat!, v.dec!, v.H!),
    solve: { Q: (v) => insolation(v.lat!, v.dec!, v.H!) },
  },
  steps: {
    Q: st(
      '(1361 ÷ π) × ({H} × π ÷ 180 × sin({lat}°) × sin({dec}°) + cos({lat}°) × cos({dec}°) × sin({H}°))',
      'Add up the sunlight from sunrise to sunset (H in radians in the first term), then average over the day.',
    ),
  },
};

const INSOL_H = sunriseHour(40, 23.44);
const globeInsolation: ModuleDef = {
  id: 'g.he-globe-sun-insolation',
  title: 'Daily sunlight at the top of the atmosphere',
  use: 'Use this for the day’s mean sunlight at a latitude on a date.',
  assumptions: [
    'The solar constant is 1,361 W/m²; Earth’s distance from the Sun is taken as average.',
    'φ stays inside the polar circles, where the Sun rises and sets each day.',
  ],
  variables: [
    SUN_VARS[0]!,
    SUN_VARS[1]!,
    SUN_VARS[3]!,
    quantity('Q', 'Q', 'Daily mean sunlight', 'W/m²', 0.01, 600, 0.1),
  ],
  ...rules(sunriseRule, insolationRule),
  example: { lat: 40, dec: 23.44, H: INSOL_H, Q: insolation(40, 23.44, INSOL_H) },
  startWith: ['lat', 'dec'],
  representation: { kind: 'globe', mode: 'sun', latitude: 'lat', declination: 'dec', hour: 'H' },
};

/** cos c = sin φ₁ sin φ₂ + cos φ₁ cos φ₂ cos(λ₂ − λ₁). */
const lawOfCosines: Rule = {
  relation: {
    id: 'cos c = sin φ₁ sin φ₂ + cos φ₁ cos φ₂ cos(λ₂ − λ₁)',
    display:
      'cos({c}°) = sin({lat1}°) × sin({lat2}°) + cos({lat1}°) × cos({lat2}°) × cos({lon2} − {lon1})',
    vars: ['c', 'lat1', 'lat2', 'lon1', 'lon2'],
    residual: (v) => v.c! - centralAngle(v.lat1!, v.lon1!, v.lat2!, v.lon2!),
    solve: { c: (v) => centralAngle(v.lat1!, v.lon1!, v.lat2!, v.lon2!) },
  },
  steps: {
    c: st(
      'arccos(sin({lat1}°) × sin({lat2}°) + cos({lat1}°) × cos({lat2}°) × cos({lon2} − {lon1}))',
      'The spherical law of cosines gives cos c; its arccos is the angle at Earth’s centre.',
    ),
  },
};

const arcLength: Rule = {
  relation: {
    id: 'd = 6371 × c × π ÷ 180',
    display: '{d} = 6371 × {c} × π ÷ 180',
    vars: ['d', 'c'],
    residual: (v) => v.d! - (EARTH_KM * v.c! * Math.PI) / 180,
    solve: {
      d: (v) => (EARTH_KM * v.c! * Math.PI) / 180,
      c: (v) => (v.d! * 180) / (EARTH_KM * Math.PI),
    },
  },
  steps: {
    d: st('6371 × {c} × π ÷ 180', 'An arc is the radius times the angle in radians.'),
    c: st(
      '{d} × 180 ÷ (6371 × π)',
      'Divide the arc by the radius, then turn radians into degrees.',
    ),
  },
};

const routeDemo = (
  id: string,
  title: string,
  [lat1, lon1, lat2, lon2]: [number, number, number, number],
): ModuleDef => {
  const c = centralAngle(lat1, lon1, lat2, lon2);
  return {
    id,
    title,
    use: 'Use this for the great-circle distance between two places from their latitudes and longitudes.',
    assumptions: [
      'Earth is a sphere of radius 6,371 km (within 0.5% of the real shape).',
      'The shortest route is an arc of a great circle, not a straight line on a Mercator map.',
    ],
    variables: [
      degrees('lat1', 'φ₁', 'Latitude of the first place', -90, 90),
      degrees('lon1', 'λ₁', 'Longitude of the first place', -180, 180),
      degrees('lat2', 'φ₂', 'Latitude of the second place', -90, 90),
      degrees('lon2', 'λ₂', 'Longitude of the second place', -180, 180),
      degrees('c', 'c', 'Central angle', 0, 180),
      quantity('d', 'd', 'Great-circle distance', 'km', 0, 20016, 0.1),
    ],
    ...rules(lawOfCosines, arcLength),
    example: { lat1, lon1, lat2, lon2, c, d: (EARTH_KM * c * Math.PI) / 180 },
    startWith: ['lat1', 'lon1', 'lat2', 'lon2'],
    representation: {
      kind: 'globe',
      mode: 'route',
      lat1: 'lat1',
      lon1: 'lon1',
      lat2: 'lat2',
      lon2: 'lon2',
      angle: 'c',
      km: 'd',
    },
  };
};

const globeRoute = routeDemo(
  'g.he-globe-route',
  'A great-circle route and its central angle',
  [40, -75, 52, 0],
);
const globeRoutePacific = routeDemo(
  'g.he-globe-route-pacific',
  'A great circle across the 180° meridian',
  [35.7, 139.7, 37.6, -122.4],
);

/** ω in rad/Myr. */
const toRadians: Rule = {
  relation: {
    id: 'ω_rad = ω × π ÷ 180',
    display: '{wr} = {w} × π ÷ 180',
    vars: ['wr', 'w'],
    residual: (v) => v.wr! - (v.w! * Math.PI) / 180,
    solve: { wr: (v) => (v.w! * Math.PI) / 180, w: (v) => (v.wr! * 180) / Math.PI },
  },
  steps: {
    wr: st('{w} × π ÷ 180', 'Degrees to radians: times π ÷ 180.'),
    w: st('{wr} × 180 ÷ π', 'Radians to degrees: times 180 ÷ π.'),
  },
};

/** v = ω_rad × 6371 × sin Δ (km/Myr = mm/yr). */
const plateRule: Rule = {
  relation: {
    id: 'v = ω_rad × 6371 × sin Δ',
    display: '{v} = {wr} × 6371 × sin({D}°)',
    vars: ['v', 'wr', 'D'],
    residual: (v) => v.v! - v.wr! * EARTH_KM * Math.sin((v.D! * Math.PI) / 180),
    solve: {
      v: (v) => v.wr! * EARTH_KM * Math.sin((v.D! * Math.PI) / 180),
      wr: (v) => div(v.v!, EARTH_KM * Math.sin((v.D! * Math.PI) / 180)),
    },
  },
  steps: {
    v: st(
      '{wr} × 6371 × sin({D}°)',
      'The point turns on a circle of radius R sin Δ about the pole’s axis: ω times that radius.',
    ),
    wr: st('{v} ÷ (6371 × sin({D}°))', 'Divide the speed by the radius of the point’s circle.'),
  },
};

const eulerDemo = (id: string, title: string, w: number, D: number): ModuleDef => ({
  id,
  title,
  use: 'Use this for the speed of a point on a plate turning about its Euler pole.',
  assumptions: [
    'A plate turns as a rigid cap about its Euler pole; R = 6,371 km.',
    'Speed is greatest 90° from the pole and 0 at it; 1 km per million years is 1 mm per year.',
  ],
  variables: [
    quantity('w', 'ω', 'Rotation rate', '°/Myr', 0.01, 5, 0.01),
    degrees('D', 'Δ', 'Angular distance from the Euler pole', 0.01, 179.99),
    quantity('wr', 'ω_rad', 'Rotation rate in radians', 'rad/Myr', 0.0001, 0.1, 0.000001, {
      derived: true,
    }),
    quantity('v', 'v', 'Speed', 'mm/yr', 0.0001, 600, 0.01),
  ],
  ...rules(toRadians, plateRule),
  example: { w, D, wr: (w * Math.PI) / 180, v: plateSpeed(w, D) },
  startWith: ['w', 'D'],
  representation: { kind: 'globe', mode: 'euler', omega: 'w', distance: 'D', speed: 'v' },
});

const globeEuler = eulerDemo('g.he-globe-euler', 'A plate turning about its Euler pole', 0.5, 60);
const globeEulerFar = eulerDemo(
  'g.he-globe-euler-far',
  'A point 150° from the Euler pole: slower again',
  1.2,
  150,
);

/** tan I = 2 tan φ. */
const dipRule: Rule = {
  relation: {
    id: 'tan I = 2 tan φ',
    display: 'tan({I}°) = 2 × tan({lat}°)',
    vars: ['I', 'lat'],
    residual: (v) => v.I! - inclination(v.lat!),
    solve: { I: (v) => inclination(v.lat!), lat: (v) => paleolatitude(v.I!) },
  },
  steps: {
    I: st(
      'arctan(2 × tan({lat}°))',
      'A dipole’s field dips more steeply than the latitude: tan I = 2 tan φ.',
    ),
    lat: st('arctan(tan({I}°) ÷ 2)', 'Halve tan I, then take the arctan.'),
  },
};

const dipoleDemo = (id: string, title: string, I: number): ModuleDef => ({
  id,
  title,
  use: 'Use this for a paleolatitude from a rock’s magnetic inclination.',
  assumptions: [
    'Earth’s field averaged over thousands of years is a dipole on the spin axis.',
    'I is measured from the horizontal, down in the north and up in the south.',
  ],
  variables: [
    degrees('I', 'I', 'Inclination', -89.9, 89.9),
    degrees('lat', 'φ', 'Latitude', -89.9, 89.9),
  ],
  ...rules(dipRule),
  example: { I, lat: paleolatitude(I) },
  startWith: ['I'],
  representation: { kind: 'globe', mode: 'dipole', inclination: 'I', latitude: 'lat' },
});

const globeDipole = dipoleDemo(
  'g.he-globe-dipole',
  'Paleolatitude from a dipole field’s dip',
  49.1,
);
const globeDipoleSouth = dipoleDemo(
  'g.he-globe-dipole-south',
  'A rock that formed far south: the field points up',
  -60,
);

/** u = ΩR sin²φ ÷ cos φ. */
const windRule: Rule = {
  relation: {
    id: 'u = ΩR sin²φ ÷ cos φ',
    display: '{u} = {rim} × sin({lat}°)^2 ÷ cos({lat}°)',
    vars: ['u', 'rim', 'lat'],
    residual: (v) => v.u! - momentumWind(v.lat!, v.rim!),
    solve: {
      u: (v) => momentumWind(v.lat!, v.rim!),
      rim: (v) => div(v.u!, momentumWind(v.lat!, 1)),
    },
  },
  steps: {
    u: st(
      '{rim} × sin({lat}°)^2 ÷ cos({lat}°)',
      'Air keeps its angular momentum, so it turns faster than the ground as its circle shrinks.',
    ),
    rim: st('{u} × cos({lat}°) ÷ sin({lat}°)^2', 'Undo the factor sin²φ ÷ cos φ.'),
  },
};

const momentumDemo = (id: string, title: string, lat: number): ModuleDef => ({
  id,
  title,
  use: 'Use this for the wind of air carried poleward keeping its angular momentum.',
  assumptions: [
    'Air leaves the equator at rest with the ground and keeps its angular momentum.',
    'Real Hadley flow loses some to friction and eddies; ΩR = 464.6 m/s.',
  ],
  variables: [
    degrees('lat', 'φ', 'Latitude', 0.01, 60),
    quantity('rim', 'ΩR', 'Earth’s rim speed', 'm/s', 400, 500, 0.1),
    quantity('u', 'u', 'Eastward wind', 'm/s', 0.0001, 1000, 0.1),
  ],
  ...rules(windRule),
  example: { lat, rim: RIM_MS, u: momentumWind(lat, RIM_MS) },
  startWith: ['lat', 'rim'],
  representation: { kind: 'globe', mode: 'momentum', latitude: 'lat', wind: 'u', rim: 'rim' },
});

const globeMomentum = momentumDemo(
  'g.he-globe-momentum',
  'Air carried from the equator to 30°: the westerly jet',
  30,
);
const globeMomentumHigh = momentumDemo(
  'g.he-globe-momentum-high',
  'Air carried to 60°: far faster than any real wind',
  60,
);

/** The globe demos (HC36). */
const GLOBE_DEMOS: ModuleDef[] = [
  globeSun,
  globeSunDecember,
  globeSunArctic,
  globeInsolation,
  globeRoute,
  globeRoutePacific,
  globeEuler,
  globeEulerFar,
  globeDipole,
  globeDipoleSouth,
  globeMomentum,
  globeMomentumHigh,
];

export const HE2K_GALLERY_MODULES: ModuleDef[] = [...RATE_DEMOS, ...GLOBE_DEMOS];

export const HE2K_GALLERY_LAYOUTS: LayoutDef[] = [];
