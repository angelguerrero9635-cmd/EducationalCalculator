/**
 * College gallery demos, round 1, group D (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC4: `functionGraph` time responses (`transient`, `stepResponse`).
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

type Solver = (v: Values) => number | number[] | undefined;
type Rule = { relation: Relation; steps: Record<string, StepText> };

/** A finite value, or nothing. */
const fin = (x: number) => (Number.isFinite(x) ? x : undefined);
const div = (a: number, b: number) => (b === 0 ? undefined : fin(a / b));
/** ln x, or nothing when x ≤ 0. */
const ln = (x: number) => (x > 0 ? Math.log(x) : undefined);

/** A value typed or worked out: min to max. */
const num = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...(unit ? { unit } : {}), min, max, ...more });

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
  expr: string,
  how: string,
): Rule => rule(id, display, [x, ...inputs], (v) => v[x]! - (f(v) ?? NaN), { [x]: [f, expr, how] });

/** A demo from its rules. */
function page(d: Omit<ModuleDef, 'relations' | 'steps'> & { rules: Rule[] }): ModuleDef {
  const { rules, ...rest } = d;
  return {
    workedFigures: 3,
    ...rest,
    relations: rules.map((r) => r.relation),
    steps: Object.fromEntries(rules.map((r) => [r.relation.id, r.steps])),
  };
}

const E1 = Math.exp(-1);

// ── HC4: first-order responses (`transient`) ──

/** circuits-1#4 main: a capacitor charging through a resistor from a source. */
const rcCharge = page({
  id: 'g.he-function-graph-rc-charge',
  title: 'RC charging: v_C against time, τ to 5τ marked',
  use: 'Use this for “A 100 μF capacitor charges through 10 kΩ from 10 V. Find v_C after 1 s.”',
  assumptions: [
    'The capacitor starts empty and the switch closes at t = 0.',
    'τ = RC; with R in kΩ and C in μF, τ comes out in ms.',
    'After 5τ the capacitor is within 1% of the source voltage.',
  ],
  variables: [
    num('Vs', 'V_s', 'Source voltage', 'V', 0, 1000, { step: 0.1 }),
    num('R', 'R', 'Resistance', 'kΩ', 0.001, 10000, { step: 0.001 }),
    num('C', 'C', 'Capacitance', 'μF', 0.001, 1000000, { step: 0.001 }),
    num('tau', 'τ', 'Time constant', 'ms', 0.000001, 1e10),
    num('t', 't', 'Time', 'ms', 0, 1e7, { step: 1 }),
    num('vC', 'v_C', 'Capacitor voltage', 'V', 0, 1000),
    num('i', 'i', 'Current', 'mA', 0, 1e6),
  ],
  rules: [
    rule('τ = RC', '{tau} = {R} × {C}', ['tau', 'R', 'C'], (v) => v.tau! - v.R! * v.C!, {
      tau: [(v) => v.R! * v.C!, '{R} × {C}', 'Multiply the resistance by the capacitance.'],
      R: [(v) => div(v.tau!, v.C!), '{tau} ÷ {C}', 'Divide the time constant by C.'],
      C: [(v) => div(v.tau!, v.R!), '{tau} ÷ {R}', 'Divide the time constant by R.'],
    }),
    rule(
      'v_C = V_s(1 − e^(−t/τ))',
      '{vC} = {Vs} × (1 − e^(−{t} ÷ {tau}))',
      ['vC', 'Vs', 't', 'tau'],
      (v) => v.vC! - v.Vs! * (1 - Math.exp(-v.t! / v.tau!)),
      {
        vC: [
          (v) => fin(v.Vs! * (1 - Math.exp(-v.t! / v.tau!))),
          '{Vs} × (1 − e^(−{t} ÷ {tau}))',
          'The capacitor has made 1 − e^(−t/τ) of the climb to the source voltage.',
        ],
        Vs: [
          (v) => div(v.vC!, 1 - Math.exp(-v.t! / v.tau!)),
          '{vC} ÷ (1 − e^(−{t} ÷ {tau}))',
          'Divide the voltage by the share of the climb made so far.',
        ],
        t: [
          (v) => (v.vC! < v.Vs! ? fin(-v.tau! * Math.log(1 - v.vC! / v.Vs!)) : undefined),
          '−{tau} × ln(1 − {vC} ÷ {Vs})',
          'Undo the exponential with ln: t = −τ ln(1 − v_C/V_s).',
        ],
      },
    ),
    rule(
      'i = (V_s − v_C)/R',
      '{i} = ({Vs} − {vC}) ÷ {R}',
      ['i', 'Vs', 'vC', 'R'],
      (v) => v.i! * v.R! - (v.Vs! - v.vC!),
      {
        i: [
          (v) => div(v.Vs! - v.vC!, v.R!),
          '({Vs} − {vC}) ÷ {R}',
          'The resistor carries the voltage the capacitor hasn’t taken yet; V ÷ kΩ gives mA.',
        ],
      },
    ),
  ],
  example: { Vs: 10, R: 10, C: 100, tau: 1000, t: 1000, vC: 10 * (1 - E1), i: E1 },
  startWith: ['Vs', 'R', 'C', 't'],
  representation: {
    kind: 'functionGraph',
    family: 'response',
    transient: { initial: 0, final: 'Vs', tau: 'tau', time: 't', value: 'vC' },
    stepInput: { size: 'Vs', name: 'Vₛ' },
  },
});

/** circuits-1#4~general: a switched response from a nonzero start. */
const general = page({
  id: 'g.he-function-graph-general',
  title: 'A first-order response from 2 V to 10 V',
  use: 'Use this for “A capacitor voltage starts at 2 V and heads for 10 V with τ = 0.5 ms. Find it at 1 ms.”',
  assumptions: [
    'One energy store (one C or one L): every voltage and current is first order.',
    'x(t) = x_f + (x₀ − x_f)e^(−t/τ), with t counted from the switching.',
  ],
  variables: [
    num('v0', 'v₀', 'Starting value', 'V', -1000, 1000, { step: 0.1 }),
    num('vf', 'v_f', 'Final value', 'V', -1000, 1000, { step: 0.1 }),
    num('tau', 'τ', 'Time constant', 'ms', 0.000001, 1e7, { step: 0.01 }),
    num('t', 't', 'Time', 'ms', 0, 1e7, { step: 0.01 }),
    num('v', 'v', 'Value at t', 'V', -1000, 1000),
  ],
  rules: [
    rule(
      'v = v_f + (v₀ − v_f)e^(−t/τ)',
      '{v} = {vf} + ({v0} − {vf}) × e^(−{t} ÷ {tau})',
      ['v', 'vf', 'v0', 't', 'tau'],
      (v) => v.v! - v.vf! - (v.v0! - v.vf!) * Math.exp(-v.t! / v.tau!),
      {
        v: [
          (v) => fin(v.vf! + (v.v0! - v.vf!) * Math.exp(-v.t! / v.tau!)),
          '{vf} + ({v0} − {vf}) × e^(−{t} ÷ {tau})',
          'Start from the final value and add the gap that is left: it shrinks by e every τ.',
        ],
        v0: [
          (v) => fin(v.vf! + (v.v! - v.vf!) * Math.exp(v.t! / v.tau!)),
          '{vf} + ({v} − {vf}) × e^({t} ÷ {tau})',
          'Grow the gap back to t = 0: multiply by e^(t/τ).',
        ],
        t: [
          (v) =>
            v.v0 === v.vf ? undefined : fin(-v.tau! * Math.log((v.v! - v.vf!) / (v.v0! - v.vf!))),
          '−{tau} × ln(({v} − {vf}) ÷ ({v0} − {vf}))',
          'The share of the gap left is e^(−t/τ): take ln and multiply by −τ.',
        ],
        tau: [
          (v) => {
            const l = ln((v.v! - v.vf!) / (v.v0! - v.vf!));
            return l === undefined || l === 0 ? undefined : fin(-v.t! / l);
          },
          '−{t} ÷ ln(({v} − {vf}) ÷ ({v0} − {vf}))',
          'Divide the time by how many e-folds the gap has shrunk.',
        ],
      },
    ),
  ],
  example: { v0: 2, vf: 10, tau: 0.5, t: 1, v: 10 - 8 * Math.exp(-2) },
  startWith: ['v0', 'vf', 'tau', 't'],
  representation: {
    kind: 'functionGraph',
    family: 'response',
    transient: { initial: 'v0', final: 'vf', tau: 'tau', time: 't', value: 'v' },
  },
});

/** process-control#2~fit: a first-order-plus-dead-time model from two points of a step test. */
const fit = page({
  id: 'g.he-function-graph-fopdt-fit',
  title: 'A step test fitted: the 28.3% and 63.2% times',
  use: 'Use this for “A step test reaches 28.3% at 4 min and 63.2% at 10 min. Find τ and θ.”',
  assumptions: [
    'The process is first order with a dead time θ (FOPDT).',
    'A first-order curve makes 28.3% of its change at θ + τ/3 and 63.2% at θ + τ.',
    'The output is read as a fraction of its whole change.',
  ],
  variables: [
    num('t28', 't₂₈', 'Time to 28.3%', 'min', 0, 10000, { step: 0.1 }),
    num('t63', 't₆₃', 'Time to 63.2%', 'min', 0, 10000, { step: 0.1 }),
    num('tau', 'τ', 'Time constant', 'min', 0.001, 20000),
    num('theta', 'θ', 'Dead time', 'min', 0, 10000),
  ],
  rules: [
    rule(
      'τ = 1.5(t₆₃ − t₂₈)',
      '{tau} = 1.5 × ({t63} − {t28})',
      ['tau', 't63', 't28'],
      (v) => v.tau! - 1.5 * (v.t63! - v.t28!),
      {
        tau: [
          (v) => 1.5 * (v.t63! - v.t28!),
          '1.5 × ({t63} − {t28})',
          'The two points are τ − τ/3 = 2τ/3 apart, so τ is 1.5 times the gap.',
        ],
        t63: [(v) => v.t28! + v.tau! / 1.5, '{t28} + {tau} ÷ 1.5', 'Add 2τ/3 to t₂₈.'],
        t28: [(v) => v.t63! - v.tau! / 1.5, '{t63} − {tau} ÷ 1.5', 'Take 2τ/3 from t₆₃.'],
      },
    ),
    rule(
      'θ = t₆₃ − τ',
      '{theta} = {t63} − {tau}',
      ['theta', 't63', 'tau'],
      (v) => v.theta! - (v.t63! - v.tau!),
      {
        theta: [
          (v) => v.t63! - v.tau!,
          '{t63} − {tau}',
          'The 63.2% point comes τ after the dead time ends.',
        ],
        t63: [(v) => v.theta! + v.tau!, '{theta} + {tau}', 'τ after the dead time.'],
        tau: [
          (v) => v.t63! - v.theta!,
          '{t63} − {theta}',
          'From the dead time to the 63.2% point.',
        ],
      },
    ),
  ],
  example: { t28: 4, t63: 10, tau: 9, theta: 1 },
  startWith: ['t28', 't63'],
  representation: {
    kind: 'functionGraph',
    family: 'response',
    name: 'y',
    axes: { y: 'Share of the change' },
    transient: {
      initial: 0,
      final: 1,
      tau: 'tau',
      deadTime: 'theta',
      points: { t28: 't28', t63: 't63' },
    },
    stepInput: { name: 'Δu' },
  },
});

/** electronics#3~integrator: a constant input ramps the output (no τ: a ramp). */
const integrator = page({
  id: 'g.he-function-graph-integrator',
  title: 'An op-amp integrator: a constant input makes a ramp',
  use: 'Use this for “An integrator has R = 10 kΩ and C = 1 μF. A 0.5 V input is held for 4 ms. Find v_out.”',
  assumptions: [
    'An ideal inverting integrator, its capacitor empty at t = 0: v_out = −v_in × t ÷ (RC).',
    'The input is constant from t = 0, so the output falls in a straight line.',
    'RC in ms when R is in kΩ and C in μF; the output stays inside the supply rails.',
  ],
  variables: [
    num('R', 'R', 'Resistance', 'kΩ', 0.001, 10000, { step: 0.001 }),
    num('C', 'C', 'Capacitance', 'μF', 0.0001, 10000, { step: 0.0001 }),
    num('vin', 'v_in', 'Input voltage', 'V', -15, 15, { step: 0.01 }),
    num('t', 't', 'Time', 'ms', 0, 1e6, { step: 0.1 }),
    num('vout', 'v_out', 'Output voltage', 'V', -1000, 1000),
  ],
  rules: [
    rule(
      'v_out = −v_in t/(RC)',
      '{vout} = −{vin} × {t} ÷ ({R} × {C})',
      ['vout', 'vin', 't', 'R', 'C'],
      (v) => v.vout! + (v.vin! * v.t!) / (v.R! * v.C!),
      {
        vout: [
          (v) => fin(-(v.vin! * v.t!) / (v.R! * v.C!)),
          '−{vin} × {t} ÷ ({R} × {C})',
          'The capacitor charges at v_in ÷ RC each ms; the output moves the other way.',
        ],
        t: [
          (v) => div(-v.vout! * v.R! * v.C!, v.vin!),
          '−{vout} × {R} × {C} ÷ {vin}',
          'Divide the change in output by the rate v_in ÷ RC.',
        ],
        vin: [
          (v) => div(-v.vout! * v.R! * v.C!, v.t!),
          '−{vout} × {R} × {C} ÷ {t}',
          'The rate times RC is the input.',
        ],
      },
    ),
  ],
  example: { R: 10, C: 1, vin: 0.5, t: 4, vout: -0.2 },
  startWith: ['R', 'C', 'vin', 't'],
  representation: {
    kind: 'functionGraph',
    family: 'response',
    transient: { initial: 0, time: 't', value: 'vout' },
    stepInput: { size: 'vin', name: 'v_in' },
  },
});

/** control#4 main: proportional control of a first-order plant, open loop dashed. */
const pControl = page({
  id: 'g.he-function-graph-p-control',
  title: 'P control: the closed loop is faster but keeps an offset',
  use: 'Use this for “A plant 2/(4s + 1) under proportional control K_p = 4.5: find the steady-state error and time constant.”',
  assumptions: [
    'Unity feedback and a unit step in the set point; the actuator doesn’t saturate.',
    'The closed loop is first order: DC gain L ÷ (1 + L), τ_cl = τ ÷ (1 + L).',
    'The dashed curve is the plant alone, with no controller.',
  ],
  variables: [
    num('K', 'K', 'Plant gain', undefined, 0.01, 1000, { step: 0.01 }),
    num('tau', 'τ', 'Plant time constant', 's', 0.001, 100000, { step: 0.01 }),
    num('Kp', 'K_p', 'Proportional gain', undefined, 0, 10000, { step: 0.01 }),
    num('L', 'L', 'Loop gain', undefined, 0, 1e7),
    num('G', 'G_cl', 'Closed-loop DC gain', undefined, 0, 1),
    num('tcl', 'τ_cl', 'Closed-loop time constant', 's', 0, 100000),
    num('e', 'e_ss', 'Steady-state error', undefined, 0, 1),
  ],
  rules: [
    rule('L = KK_p', '{L} = {K} × {Kp}', ['L', 'K', 'Kp'], (v) => v.L! - v.K! * v.Kp!, {
      L: [(v) => v.K! * v.Kp!, '{K} × {Kp}', 'Around the loop the gains multiply.'],
      Kp: [(v) => div(v.L!, v.K!), '{L} ÷ {K}', 'Divide the loop gain by the plant’s gain.'],
    }),
    rule('G_cl = L/(1 + L)', '{G} = {L} ÷ (1 + {L})', ['G', 'L'], (v) => v.G! * (1 + v.L!) - v.L!, {
      G: [
        (v) => div(v.L!, 1 + v.L!),
        '{L} ÷ (1 + {L})',
        'The output settles where y = L(1 − y): y = L ÷ (1 + L).',
      ],
      L: [(v) => div(v.G!, 1 - v.G!), '{G} ÷ (1 − {G})', 'Solve G(1 + L) = L for L.'],
    }),
    rule(
      'τ_cl = τ/(1 + L)',
      '{tcl} = {tau} ÷ (1 + {L})',
      ['tcl', 'tau', 'L'],
      (v) => v.tcl! * (1 + v.L!) - v.tau!,
      {
        tcl: [
          (v) => div(v.tau!, 1 + v.L!),
          '{tau} ÷ (1 + {L})',
          'Feedback speeds the loop up by 1 + L.',
        ],
        tau: [(v) => v.tcl! * (1 + v.L!), '{tcl} × (1 + {L})', 'Undo the speed-up.'],
      },
    ),
    rule('e_ss = 1/(1 + L)', '{e} = 1 ÷ (1 + {L})', ['e', 'L'], (v) => v.e! * (1 + v.L!) - 1, {
      e: [
        (v) => div(1, 1 + v.L!),
        '1 ÷ (1 + {L})',
        'What the output falls short of the unit step.',
      ],
      L: [(v) => (v.e! > 0 ? 1 / v.e! - 1 : undefined), '1 ÷ {e} − 1', 'Solve e(1 + L) = 1 for L.'],
    }),
  ],
  example: { K: 2, tau: 4, Kp: 4.5, L: 9, G: 0.9, tcl: 0.4, e: 0.1 },
  startWith: ['K', 'tau', 'Kp'],
  representation: {
    kind: 'functionGraph',
    family: 'response',
    name: 'y',
    axes: { y: 'Output y' },
    transient: {
      initial: 0,
      final: 'G',
      tau: 'tcl',
      second: { final: 'K', tau: 'tau', label: 'plant alone' },
    },
    stepInput: { size: 1, name: 'r' },
    error: 'e',
  },
});

// ── HC4: second-order responses (`stepResponse`) ──

/** %OS = 100e^(−ζπ/√(1 − ζ²)). */
const osOf = (z: number) => (z < 1 ? 100 * Math.exp((-z * Math.PI) / Math.sqrt(1 - z * z)) : 0);

/** control#1 main: overshoot, peak time and settling time of the standard second order. */
const secondOrderStep = page({
  id: 'g.he-function-graph-second-order',
  title: 'Second-order step response: %OS, Tₚ and Tₛ',
  use: 'Use this for “Find the percent overshoot and settling time of 25/(s² + 4s + 25).”',
  assumptions: [
    'The standard form ω_n² ÷ (s² + 2ζω_n s + ω_n²), underdamped (0 < ζ < 1), no zeros.',
    'Tₛ = 4 ÷ σ is the time the envelope takes to enter a 2% band.',
  ],
  variables: [
    num('wn', 'ω_n', 'Natural frequency', 'rad/s', 0.01, 100000, { step: 0.01 }),
    num('zeta', 'ζ', 'Damping ratio', undefined, 0, 0.99, { step: 0.01 }),
    num('sigma', 'σ', 'Real part of the poles', 's⁻¹', 0, 1e6),
    num('wd', 'ω_d', 'Damped frequency', 'rad/s', 0, 1e6),
    num('os', '%OS', 'Percent overshoot', '%', 0, 100),
    num('tp', 'T_p', 'Peak time', 's', 0, 1e6),
    num('ts', 'T_s', 'Settling time', 's', 0, 1e9),
  ],
  rules: [
    derive(
      'σ = ζω_n',
      'sigma',
      ['zeta', 'wn'],
      '{sigma} = {zeta} × {wn}',
      (v) => v.zeta! * v.wn!,
      '{zeta} × {wn}',
      'The poles sit at −σ ± jω_d, with σ = ζω_n.',
    ),
    derive(
      'ω_d = ω_n√(1 − ζ²)',
      'wd',
      ['wn', 'zeta'],
      '{wd} = {wn} × √(1 − {zeta}²)',
      (v) => v.wn! * Math.sqrt(1 - v.zeta! ** 2),
      '{wn} × √(1 − {zeta}²)',
      'The damped frequency is the poles’ imaginary part.',
    ),
    derive(
      '%OS = 100e^(−ζπ/√(1 − ζ²))',
      'os',
      ['zeta'],
      '{os} = 100 × e^(−{zeta} × π ÷ √(1 − {zeta}²))',
      (v) => osOf(v.zeta!),
      '100 × e^(−{zeta} × π ÷ √(1 − {zeta}²))',
      'The overshoot depends on ζ alone.',
    ),
    derive(
      'T_p = π/ω_d',
      'tp',
      ['wd'],
      '{tp} = π ÷ {wd}',
      (v) => div(Math.PI, v.wd!),
      'π ÷ {wd}',
      'The first peak comes half a damped period after the step.',
    ),
    derive(
      'T_s = 4/σ',
      'ts',
      ['sigma'],
      '{ts} = 4 ÷ {sigma}',
      (v) => div(4, v.sigma!),
      '4 ÷ {sigma}',
      'e^(−σt) falls to about 2% when σt = 4.',
    ),
  ],
  example: (() => {
    const [wn, zeta] = [5, 0.4];
    const wd = wn * Math.sqrt(1 - zeta * zeta);
    return { wn, zeta, sigma: 2, wd, os: osOf(zeta), tp: Math.PI / wd, ts: 2 };
  })(),
  startWith: ['wn', 'zeta'],
  representation: {
    kind: 'functionGraph',
    family: 'response',
    name: 'c',
    axes: { y: 'Output c(t)' },
    stepResponse: { wn: 'wn', zeta: 'zeta', overshoot: 'os', peak: 'tp', settling: 'ts' },
    stepInput: { size: 1 },
  },
});

/** process-control#0~second-order: overshoot, decay ratio and period. */
const decayRatio = page({
  id: 'g.he-function-graph-decay-ratio',
  title: 'Overshoot, decay ratio and period of a process',
  use: 'Use this for “A process has ζ = 0.3 and ω_n = 0.5 rad/min. Find its overshoot, decay ratio and period.”',
  assumptions: [
    'An underdamped second-order process after a unit step, in deviation variables.',
    'The decay ratio is the second overshoot over the first: OS².',
    'P = 2π ÷ ω_d, the time from one peak to the next.',
  ],
  variables: [
    num('zeta', 'ζ', 'Damping ratio', undefined, 0.01, 0.99, { step: 0.01 }),
    num('wn', 'ω_n', 'Natural frequency', 'rad/min', 0.001, 1000, { step: 0.001 }),
    num('OS', 'OS', 'Overshoot', '%', 0, 100),
    num('DR', 'DR', 'Decay ratio', undefined, 0, 1),
    num('P', 'P', 'Period', 'min', 0, 1e7),
  ],
  rules: [
    derive(
      'OS = 100e^(−πζ/√(1 − ζ²))',
      'OS',
      ['zeta'],
      '{OS} = 100 × e^(−π × {zeta} ÷ √(1 − {zeta}²))',
      (v) => osOf(v.zeta!),
      '100 × e^(−π × {zeta} ÷ √(1 − {zeta}²))',
      'The first overshoot, as a percent of the change.',
    ),
    derive(
      'DR = OS²',
      'DR',
      ['OS'],
      '{DR} = ({OS} ÷ 100)²',
      (v) => (v.OS! / 100) ** 2,
      '({OS} ÷ 100)²',
      'Each overshoot is OS times the one before it, so the second over the first is OS².',
    ),
    derive(
      'P = 2π/(ω_n√(1 − ζ²))',
      'P',
      ['wn', 'zeta'],
      '{P} = 2π ÷ ({wn} × √(1 − {zeta}²))',
      (v) => div(2 * Math.PI, v.wn! * Math.sqrt(1 - v.zeta! ** 2)),
      '2π ÷ ({wn} × √(1 − {zeta}²))',
      'One full swing of the damped oscillation.',
    ),
  ],
  example: (() => {
    const [zeta, wn] = [0.3, 0.5];
    const OS = osOf(zeta);
    return {
      zeta,
      wn,
      OS,
      DR: (OS / 100) ** 2,
      P: (2 * Math.PI) / (wn * Math.sqrt(1 - zeta ** 2)),
    };
  })(),
  startWith: ['zeta', 'wn'],
  representation: {
    kind: 'functionGraph',
    family: 'response',
    name: 'y',
    axes: { y: 'Output y (deviation)' },
    stepResponse: { wn: 'wn', zeta: 'zeta', overshoot: 'OS', decay: 'DR', period: 'P' },
    stepInput: { size: 1, name: 'Δu' },
  },
});

/** circuits-1#4~rlc-damping at the edge: a series RLC past critical damping. */
const overdamped = page({
  id: 'g.he-function-graph-overdamped',
  title: 'A series RLC past critical damping: no overshoot',
  use: 'Use this for “A series RLC has R = 30 Ω, L = 1 mH and C = 10 μF. Is it over-, under- or critically damped?”',
  assumptions: [
    'A series RLC switched onto a DC source; the curve is v_C ÷ V_s.',
    'α = R ÷ (2L) and ω₀ = 1 ÷ √(LC); ζ = α ÷ ω₀.',
    'α > ω₀ is overdamped, α = ω₀ critically damped, α < ω₀ underdamped.',
  ],
  variables: [
    num('R', 'R', 'Resistance', 'Ω', 0, 100000, { step: 0.1 }),
    num('L', 'L', 'Inductance', 'mH', 0.001, 100000, { step: 0.001 }),
    num('C', 'C', 'Capacitance', 'μF', 0.001, 100000, { step: 0.001 }),
    num('alpha', 'α', 'Neper frequency', 's⁻¹', 0, 1e9),
    num('w0', 'ω₀', 'Resonant frequency', 'rad/s', 0, 1e9),
    num('zeta', 'ζ', 'Damping ratio', undefined, 0, 1e6),
  ],
  rules: [
    derive(
      'α = R/(2L)',
      'alpha',
      ['R', 'L'],
      '{alpha} = {R} ÷ (2 × {L} ÷ 1000)',
      (v) => div(v.R!, (2 * v.L!) / 1000),
      '{R} ÷ (2 × {L} ÷ 1000)',
      'L in henries is the mH ÷ 1000.',
    ),
    derive(
      'ω₀ = 1/√(LC)',
      'w0',
      ['L', 'C'],
      '{w0} = 1 ÷ √({L} ÷ 1000 × {C} ÷ 1000000)',
      (v) => div(1, Math.sqrt((v.L! / 1000) * (v.C! / 1e6))),
      '1 ÷ √({L} ÷ 1000 × {C} ÷ 1000000)',
      'Henries times farads gives s²; its square root’s reciprocal is ω₀.',
    ),
    derive(
      'ζ = α/ω₀',
      'zeta',
      ['alpha', 'w0'],
      '{zeta} = {alpha} ÷ {w0}',
      (v) => div(v.alpha!, v.w0!),
      '{alpha} ÷ {w0}',
      'Compare the damping with the resonant frequency.',
    ),
  ],
  example: { R: 30, L: 1, C: 10, alpha: 15000, w0: 10000, zeta: 1.5 },
  startWith: ['R', 'L', 'C'],
  representation: {
    kind: 'functionGraph',
    family: 'response',
    name: 'v_C ÷ V_s',
    axes: { y: 'v_C ÷ V_s' },
    stepResponse: { wn: 'w0', alpha: 'alpha' },
    stepInput: { size: 1, name: 'V_s' },
  },
});

/** flight-mechanics#2 main: the phugoid, a free decay inside its envelope. */
const G_EARTH = 9.81;
const phugoid = page({
  id: 'g.he-function-graph-phugoid',
  title: 'The phugoid: a slow, lightly damped swing in speed',
  use: 'Use this for “An airplane flies at 100 m/s with L/D = 12. Find the phugoid’s period and time to half amplitude.”',
  assumptions: [
    'Lanchester’s approximation: constant angle of attack, the airplane trades speed for height.',
    'Light damping, so the damped and natural periods are about equal.',
    'g = 9.81 m/s².',
  ],
  variables: [
    num('V', 'V', 'Airspeed', 'm/s', 20, 300, { step: 1 }),
    num('LD', 'L/D', 'Lift-to-drag ratio', undefined, 1, 60, { step: 0.1 }),
    num('g', 'g', 'Gravity', 'm/s²', 9.7, 9.9, { step: 0.01 }),
    num('w', 'ω_ph', 'Phugoid frequency', 'rad/s', 0, 10),
    num('T', 'T', 'Period', 's', 0, 10000),
    num('zeta', 'ζ', 'Damping ratio', undefined, 0, 1),
    num('th', 't½', 'Time to half amplitude', 's', 0, 1e6),
  ],
  rules: [
    derive(
      'ω_ph = √2 g/V',
      'w',
      ['g', 'V'],
      '{w} = √2 × {g} ÷ {V}',
      (v) => div(Math.SQRT2 * v.g!, v.V!),
      '√2 × {g} ÷ {V}',
      'Lanchester: the slower the airplane flies, the faster the swing.',
    ),
    derive(
      'T = 2π/ω_ph',
      'T',
      ['w'],
      '{T} = 2π ÷ {w}',
      (v) => div(2 * Math.PI, v.w!),
      '2π ÷ {w}',
      'One full swing.',
    ),
    derive(
      'ζ = 1/(√2 L/D)',
      'zeta',
      ['LD'],
      '{zeta} = 1 ÷ (√2 × {LD})',
      (v) => div(1, Math.SQRT2 * v.LD!),
      '1 ÷ (√2 × {LD})',
      'A cleaner airplane (higher L/D) is damped less.',
    ),
    derive(
      't½ = ln 2/(ζω_ph)',
      'th',
      ['zeta', 'w'],
      '{th} = ln(2) ÷ ({zeta} × {w})',
      (v) => div(Math.LN2, v.zeta! * v.w!),
      'ln(2) ÷ ({zeta} × {w})',
      'The envelope e^(−ζωt) halves when ζωt = ln 2.',
    ),
  ],
  example: (() => {
    const [V, LD, g] = [100, 12, G_EARTH];
    const w = (Math.SQRT2 * g) / V;
    const zeta = 1 / (Math.SQRT2 * LD);
    return { V, LD, g, w, T: (2 * Math.PI) / w, zeta, th: Math.LN2 / (zeta * w) };
  })(),
  startWith: ['V', 'LD', 'g'],
  representation: {
    kind: 'functionGraph',
    family: 'response',
    name: 'Δu ÷ Δu₀',
    axes: { y: 'Speed change ÷ start' },
    stepResponse: { mode: 'oscillation', wn: 'w', zeta: 'zeta', period: 'T', halfLife: 'th' },
  },
});

export const HE1D_GALLERY_MODULES: ModuleDef[] = [
  rcCharge,
  general,
  fit,
  integrator,
  pControl,
  secondOrderStep,
  decayRatio,
  overdamped,
  phugoid,
];

export const HE1D_GALLERY_LAYOUTS: LayoutDef[] = [];
