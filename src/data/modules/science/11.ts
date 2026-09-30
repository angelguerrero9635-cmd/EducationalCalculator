/**
 * Grade 11 science: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md; the
 * direction plan and build notes: docs/BUILD_HS.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/science11.ts`.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { ModuleDef, StepText } from '../types';

// ─── Helpers for this grade (the group HK gallery's, kept here) ─────────────

/** A relation and its step text, built together so a page lists both from one place. */
interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

/** Gathers rules into a module's `relations` and `steps`. */
const rules = (...rs: Rule[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

type Solve = (v: Values) => number | number[] | undefined;

/**
 * A rule from its display, its residual and, per variable, how to solve for it with the step
 * text: `[solve, expr, how]`. A variable given `undefined` is solved numerically, with no step.
 */
const rule = (
  id: string,
  display: string,
  residual: (v: Values) => number,
  parts: Record<string, [Solve, string, string] | undefined>,
): Rule => ({
  relation: {
    id,
    display,
    vars: [
      ...new Set([...Object.keys(parts), ...[...display.matchAll(/\{(\w+)\}/g)].map((x) => x[1]!)]),
    ],
    residual,
    solve: Object.fromEntries(
      Object.entries(parts).flatMap(([k, p]) => (p ? [[k, p[0]]] : [])),
    ) as Relation['solve'],
  },
  steps: Object.fromEntries(
    Object.entries(parts).flatMap(([k, p]) => (p ? [[k, { expr: p[1], how: p[2] }]] : [])),
  ),
});

/** A measured value with its unit and range. */
const q = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  step = 0.1,
  extra: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...(unit ? { unit } : {}), min, max, step, ...extra });

/** Division that gives undefined for a zero divisor (the solver then skips it). */
const div = (a: number, b: number) => (Math.abs(b) < 1e-12 ? undefined : a / b);

/** Degrees to radians. */
const RAD = Math.PI / 180;
/** Gravity's pull on each kilogram, N/kg (m/s²). */
const G = 9.8;

/** out = a × b (or a × a fixed number), each way, with the step text for each. */
const product = (
  out: string,
  a: string,
  b: string | number,
  sym: string,
  hows: [string, string, string?],
): Rule => {
  const bv = (v: Values) => (typeof b === 'number' ? b : v[b]!);
  const bt = typeof b === 'number' ? String(b) : `{${b}}`;
  return rule(sym, `{${out}} = {${a}} × ${bt}`, (v) => v[out]! - v[a]! * bv(v), {
    [out]: [(v) => v[a]! * bv(v), `{${a}} × ${bt}`, hows[0]],
    [a]: [(v) => div(v[out]!, bv(v)), `{${out}}/${bt}`, hows[1]],
    ...(typeof b === 'string'
      ? { [b]: [(v: Values) => div(v[out]!, v[a]!), `{${out}}/{${a}}`, hows[2] ?? hows[1]] }
      : {}),
  } as Record<string, [Solve, string, string]>);
};

/** out = a ÷ b, each way. */
const quotient = (
  out: string,
  a: string,
  b: string,
  sym: string,
  hows: [string, string, string],
): Rule =>
  rule(sym, `{${out}} = {${a}}/{${b}}`, (v) => v[out]! * v[b]! - v[a]!, {
    [out]: [(v) => div(v[a]!, v[b]!), `{${a}}/{${b}}`, hows[0]],
    [a]: [(v) => v[out]! * v[b]!, `{${out}} × {${b}}`, hows[1]],
    [b]: [(v) => div(v[a]!, v[out]!), `{${a}}/{${out}}`, hows[2]],
  });

/** out = a − b, each way. */
const difference = (out: string, a: string, b: string, sym: string, how: string): Rule =>
  rule(sym, `{${out}} = {${a}} − {${b}}`, (v) => v[out]! - (v[a]! - v[b]!), {
    [out]: [(v) => v[a]! - v[b]!, `{${a}} − {${b}}`, how],
    [a]: [(v) => v[out]! + v[b]!, `{${out}} + {${b}}`, 'Add back what was taken away.'],
    [b]: [(v) => v[a]! - v[out]!, `{${a}} − {${out}}`, 'Take the result from the first.'],
  });

/** out = a + b, each way. */
const sum = (out: string, a: string, b: string, sym: string, how: string): Rule =>
  rule(sym, `{${out}} = {${a}} + {${b}}`, (v) => v[out]! - v[a]! - v[b]!, {
    [out]: [(v) => v[a]! + v[b]!, `{${a}} + {${b}}`, how],
    [a]: [(v) => v[out]! - v[b]!, `{${out}} − {${b}}`, 'Take the second part from the total.'],
    [b]: [(v) => v[out]! - v[a]!, `{${out}} − {${a}}`, 'Take the first part from the total.'],
  });

// ─── s.11.circuits ───────────────────────────────────────────────────────────

const VOLTS = q('V', 'V', 'Battery voltage', 'V', 0.01, 10000, 0.01);
const resistor = (id: string, symbol: string, name: string) =>
  q(id, symbol, name, 'Ω', 0.01, 1e6, 0.01);
const amps = (id: string, symbol: string, name: string, derived = false) =>
  q(id, symbol, name, 'A', 0, 100, 0.0001, derived ? { derived: true } : {});

/** Iₙ = V ÷ Rₙ for one parallel branch. */
const branchRule = (i: string, r: string, n: string): Rule =>
  quotient(i, 'V', r, `I${n} = V ÷ R${n}`, [
    'Each branch has the whole battery voltage across it: divide by its resistance.',
    'The branch current times its resistance is the battery voltage.',
    'Divide the battery voltage by the branch current.',
  ]);

const circuitPages: ModuleDef[] = [
  {
    id: 's.11.circuits',
    unitSystems: ['metric'],
    assumptions: [
      'The resistor keeps the same resistance whatever the current (it obeys Ohm’s law).',
      'V is the voltage across the resistor and I the current through it.',
      'Volts, amps and ohms go together: 1 V = 1 A × 1 Ω.',
    ],
    variables: [
      { ...VOLTS, name: 'Voltage', max: 10000 },
      amps('I', 'I', 'Current'),
      resistor('R', 'R', 'Resistance'),
    ],
    ...rules(
      rule('V = IR', '{V} = {I} × {R}', (v) => v.V! - v.I! * v.R!, {
        V: [(v) => v.I! * v.R!, '{I} × {R}', 'The voltage is the current times the resistance.'],
        I: [
          (v) => div(v.V!, v.R!),
          '{V} ÷ {R}',
          'Divide the voltage by the resistance: more resistance, less current.',
        ],
        R: [(v) => div(v.V!, v.I!), '{V} ÷ {I}', 'Divide the voltage by the current.'],
      }),
    ),
    example: { V: 9, I: 0.45, R: 20 },
    startWith: ['V', 'R'],
    equation: '{V:unit} = {I:unit} × {R:unit}',
    representation: {
      kind: 'seriesCircuit',
      source: 'V',
      current: 'I',
      resistors: [{ r: 'R', v: 'V' }],
    },
  },
  (() => {
    const [V, a, b] = [12, 10, 20];
    const I = V / (a + b);
    return {
      id: 's.11.circuits~series',
      title: 'Resistors in series',
      use: 'Use this for “A 12 V battery drives 10 Ω and 20 Ω in series. What does the ammeter read, and what is the voltage across each?”',
      unitSystems: ['metric'],
      assumptions: [
        'In series there is one path, so the same current I flows through each resistor.',
        'Series resistances add: R = R₁ + R₂.',
        'The battery’s voltage is shared in the ratio of the resistances: V₁ + V₂ = V.',
      ],
      variables: [
        VOLTS,
        resistor('a', 'R₁', 'First resistor'),
        resistor('b', 'R₂', 'Second resistor'),
        resistor('R', 'R', 'Total resistance'),
        amps('I', 'I', 'Current'),
        q('x', 'V₁', 'Voltage across R₁', 'V', 0, 10000, 0.001),
        q('y', 'V₂', 'Voltage across R₂', 'V', 0, 10000, 0.001),
      ],
      ...rules(
        sum('R', 'a', 'b', 'R = R₁ + R₂', 'The current passes through both: the resistances add.'),
        quotient('I', 'V', 'R', 'I = V ÷ R', [
          'Ohm’s law for the whole loop: the battery voltage over the total resistance.',
          'The current times the total resistance is the battery voltage.',
          'Divide the battery voltage by the current.',
        ]),
        product('x', 'I', 'a', 'V₁ = IR₁', [
          'Ohm’s law for R₁ alone: the current times its resistance.',
          'Divide R₁’s voltage by its resistance.',
          'Divide R₁’s voltage by the current.',
        ]),
        product('y', 'I', 'b', 'V₂ = IR₂', [
          'Ohm’s law for R₂ alone: the current times its resistance.',
          'Divide R₂’s voltage by its resistance.',
          'Divide R₂’s voltage by the current.',
        ]),
      ),
      example: { V, a, b, R: a + b, I, x: I * a, y: I * b },
      startWith: ['V', 'a', 'b'],
      representation: {
        kind: 'seriesCircuit',
        source: 'V',
        current: 'I',
        resistors: [
          { r: 'a', v: 'x' },
          { r: 'b', v: 'y' },
        ],
      },
      pictureLabels: ['R'],
    } satisfies ModuleDef;
  })(),
  (() => {
    const [V, a, b, c] = [24, 40, 60, 120];
    const [i, j, k] = [V / a, V / b, V / c];
    return {
      id: 's.11.circuits~parallel',
      title: 'Resistors in parallel',
      use: 'Use this for “40 Ω, 60 Ω and 120 Ω are in parallel on 24 V. Find each branch current, the total current and the equivalent resistance.”',
      unitSystems: ['metric'],
      assumptions: [
        'Each branch is connected straight across the battery, so each has the full voltage V.',
        'The branch currents add at the junction: I = I₁ + I₂ + I₃.',
        'The equivalent resistance is less than the smallest branch: 1/R = 1/R₁ + 1/R₂ + 1/R₃.',
      ],
      variables: [
        VOLTS,
        resistor('a', 'R₁', 'First resistor'),
        resistor('b', 'R₂', 'Second resistor'),
        resistor('c', 'R₃', 'Third resistor'),
        amps('i', 'I₁', 'Current in R₁'),
        amps('j', 'I₂', 'Current in R₂'),
        amps('k', 'I₃', 'Current in R₃'),
        amps('I', 'I', 'Total current', true),
        resistor('R', 'R', 'Equivalent resistance'),
      ],
      ...rules(
        branchRule('i', 'a', '₁'),
        branchRule('j', 'b', '₂'),
        branchRule('k', 'c', '₃'),
        rule('I = I₁ + I₂ + I₃', '{I} = {i} + {j} + {k}', (v) => v.I! - v.i! - v.j! - v.k!, {
          I: [
            (v) => v.i! + v.j! + v.k!,
            '{i} + {j} + {k}',
            'The branch currents join again: add them.',
          ],
        }),
        rule(
          '1/R = 1/R₁ + 1/R₂ + 1/R₃',
          '1/{R} = 1/{a} + 1/{b} + 1/{c}',
          (v) => 1 / v.R! - 1 / v.a! - 1 / v.b! - 1 / v.c!,
          {
            R: [
              (v) => div(1, 1 / v.a! + 1 / v.b! + 1 / v.c!),
              '1/(1/{a} + 1/{b} + 1/{c})',
              'Add the reciprocals of the branch resistances, then flip the sum.',
            ],
          },
        ),
      ),
      example: { V, a, b, c, i, j, k, I: i + j + k, R: 1 / (1 / a + 1 / b + 1 / c) },
      startWith: ['V', 'a', 'b', 'c'],
      representation: {
        kind: 'circuit',
        wiring: 'parallel',
        voltage: 'V',
        bulbs: ['a', 'b', 'c'],
        branches: ['i', 'j', 'k'],
        current: 'I',
      },
      pictureLabels: ['R'],
    } satisfies ModuleDef;
  })(),
  (() => {
    const [V, a, b, c] = [24, 4, 6, 12];
    const R = a + (b * c) / (b + c);
    const I = V / R;
    const x = I * a;
    return {
      id: 's.11.circuits~mixed',
      title: 'A series-parallel circuit',
      use: 'Use this for “24 V drives R₁ = 4 Ω in series with 6 Ω and 12 Ω in parallel. Find the total current, the voltage across R₁ and each branch current.”',
      unitSystems: ['metric'],
      assumptions: [
        'R₁ carries the whole current; then it splits between R₂ and R₃, which share one voltage.',
        'Work from the inside out: the parallel pair is R₂R₃/(R₂ + R₃), then add R₁ in series.',
        'The pair’s voltage is what R₁ leaves of the battery’s: V − V₁.',
      ],
      variables: [
        VOLTS,
        resistor('a', 'R₁', 'Resistor 1'),
        resistor('b', 'R₂', 'Resistor 2'),
        resistor('c', 'R₃', 'Resistor 3'),
        resistor('R', 'Rₜₒₜ', 'Total resistance'),
        amps('I', 'I', 'Total current'),
        q('x', 'V₁', 'Voltage across R₁', 'V', 0, 10000, 0.001),
        amps('j', 'I₂', 'Current in R₂', true),
        amps('k', 'I₃', 'Current in R₃', true),
        q('P', 'P', 'Total power', 'W', 0, 1e7, 0.01),
      ],
      ...rules(
        rule(
          'Rₜₒₜ = R₁ + R₂R₃/(R₂ + R₃)',
          '{R} = {a} + {b} × {c}/({b} + {c})',
          (v) => v.R! - v.a! - (v.b! * v.c!) / (v.b! + v.c!),
          {
            R: [
              (v) => v.a! + div(v.b! * v.c!, v.b! + v.c!)!,
              '{a} + {b} × {c}/({b} + {c})',
              'R₂ and R₃ in parallel, then R₁ in series.',
            ],
            a: [
              (v) => v.R! - div(v.b! * v.c!, v.b! + v.c!)!,
              '{R} − {b} × {c}/({b} + {c})',
              'Take the parallel pair from the total.',
            ],
          },
        ),
        quotient('I', 'V', 'R', 'I = V/Rₜₒₜ', [
          'Ohm’s law for the whole circuit: the voltage over the total resistance.',
          'The current times the total resistance.',
          'The voltage over the current.',
        ]),
        product('x', 'I', 'a', 'V₁ = IR₁', [
          'All the current passes through R₁: Ohm’s law for R₁.',
          'Divide R₁’s voltage by its resistance.',
          'Divide R₁’s voltage by the current.',
        ]),
        rule('I₂ = (V − V₁)/R₂', '{j} = ({V} − {x})/{b}', (v) => v.j! * v.b! - (v.V! - v.x!), {
          j: [
            (v) => div(v.V! - v.x!, v.b!),
            '({V} − {x})/{b}',
            'The pair has what R₁ leaves of the voltage: divide it by R₂.',
          ],
        }),
        rule('I₃ = (V − V₁)/R₃', '{k} = ({V} − {x})/{c}', (v) => v.k! * v.c! - (v.V! - v.x!), {
          k: [
            (v) => div(v.V! - v.x!, v.c!),
            '({V} − {x})/{c}',
            'The same voltage across R₃: divide it by R₃.',
          ],
        }),
        product('P', 'V', 'I', 'P = VI', [
          'The battery’s power: its voltage times the current it drives.',
          'Divide the power by the current.',
          'Divide the power by the voltage.',
        ]),
      ),
      example: { V, a, b, c, R, I, x, j: (V - x) / b, k: (V - x) / c, P: V * I },
      startWith: ['V', 'a', 'b', 'c'],
      representation: {
        kind: 'circuit',
        wiring: 'series',
        voltage: 'V',
        bulbs: [],
        current: 'I',
        mixed: {
          layout: 'seriesParallel',
          resistors: ['a', 'b', 'c'],
          equivalent: 'R',
          power: 'P',
          voltages: ['x'],
          currents: [undefined, 'j', 'k'],
        },
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const [V, I, t] = [120, 0.5, 7200];
    return {
      id: 's.11.circuits~power',
      title: 'Electric power and energy',
      use: 'Use this for “A lamp on 120 V draws 0.5 A. What is its power and resistance, and how much energy does it use in 2 h (7200 s)?”',
      unitSystems: ['metric'],
      assumptions: [
        'Power is the energy each second: P = VI, in watts (1 W = 1 J/s).',
        'With V = IR, the same power is P = I²R.',
        'The energy used is the power times the time: E = Pt, in joules when t is in seconds.',
      ],
      variables: [
        VOLTS,
        amps('I', 'I', 'Current'),
        resistor('R', 'R', 'Resistance'),
        q('P', 'P', 'Power', 'W', 0, 1e7, 0.01),
        q('t', 't', 'Time', 's', 0.01, 1e7, 0.01),
        q('E', 'E', 'Energy used', 'J', 0, 1e12, 0.01),
      ],
      ...rules(
        product('P', 'V', 'I', 'P = VI', [
          'The power is the voltage times the current.',
          'Divide the power by the current.',
          'Divide the power by the voltage.',
        ]),
        rule('P = I²R', '{P} = {I}² × {R}', (v) => v.P! - v.I! * v.I! * v.R!, {
          R: [
            (v) => div(v.P!, v.I! * v.I!),
            '{P}/({I}²)',
            'Divide the power by the current squared.',
          ],
          P: [(v) => v.I! * v.I! * v.R!, '{I}² × {R}', 'The current squared times the resistance.'],
        }),
        product('E', 'P', 't', 'E = Pt', [
          'Each second uses P joules: multiply by the seconds.',
          'Divide the energy by the time.',
          'Divide the energy by the power.',
        ]),
      ),
      example: { V, I, R: V / I, P: V * I, t, E: V * I * t },
      startWith: ['V', 'I', 't'],
      representation: {
        kind: 'circuit',
        wiring: 'series',
        voltage: 'V',
        bulbs: ['R'],
        current: 'I',
      },
      pictureLabels: ['P', 't', 'E'],
    } satisfies ModuleDef;
  })(),
];

export const SCIENCE_11_MODULES: ModuleDef[] = [...circuitPages];
