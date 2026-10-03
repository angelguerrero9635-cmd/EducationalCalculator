/**
 * College gallery demos, round 1, group D (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC4: `functionGraph` time responses (`transient`, `stepResponse`). HC9: log and flipped
 * axes (`scale`, `invertY`, `swap`), the grain-size curve (`gradation`) and `bars` `log`.
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

// ── HC9: log axes and flipped axes (`scale`, `invertY`, `swap`, `gradation`, bars `log`) ──

/** principles-2#3 main: Kleiber's law on log–log axes, a straight line. */
const kleiber = page({
  id: 'g.he-function-graph-log-log',
  title: 'Kleiber’s law on log–log axes: a straight line',
  use: 'Use this for “Kleiber’s law gives B = 70M^0.75 kcal/day. What is the basal rate of a 64 kg person, per kilogram too?”',
  assumptions: [
    'Kleiber’s law fits mammals at rest: B = 70M^(3/4), M in kg, B in kcal/day.',
    'Small animals burn more per kilogram: B ÷ M = 70M^(−1/4).',
    'On log–log axes a power law is a straight line with slope 3/4.',
  ],
  variables: [
    num('M', 'M', 'Body mass', 'kg', 0.002, 5000, { step: 0.001 }),
    num('B', 'B', 'Basal metabolic rate', 'kcal/day', 0, 1e6),
    num('b', 'B/M', 'Rate per kilogram', 'kcal/(kg·day)', 0, 1e6),
  ],
  rules: [
    rule('B = 70M^0.75', '{B} = 70 × {M}^0.75', ['B', 'M'], (v) => v.B! - 70 * v.M! ** 0.75, {
      B: [(v) => 70 * v.M! ** 0.75, '70 × {M}^0.75', 'Raise the mass to the 3/4 power, times 70.'],
      M: [
        (v) => (v.B! > 0 ? (v.B! / 70) ** (4 / 3) : undefined),
        '({B} ÷ 70)^(4 ÷ 3)',
        'Undo the 3/4 power with the 4/3 power.',
      ],
    }),
    derive(
      'B/M = B ÷ M',
      'b',
      ['B', 'M'],
      '{b} = {B} ÷ {M}',
      (v) => div(v.B!, v.M!),
      '{B} ÷ {M}',
      'Share the rate among the kilograms.',
    ),
  ],
  example: { M: 64, B: 70 * 64 ** 0.75, b: 70 * 64 ** -0.25 },
  startWith: ['M'],
  representation: {
    kind: 'functionGraph',
    family: 'power',
    a: 70,
    p: 3,
    q: 4,
    name: 'B',
    at: { x: 'M', y: 'B' },
    unitsOf: { x: 'M', y: 'B' },
    scale: { x: 'log', y: 'log' },
    axes: { x: 'Body mass M', y: 'Basal rate B' },
  },
});

/** microbiology#1 main: doubling on a semi-log axis, a straight line. */
const growth = page({
  id: 'g.he-function-graph-semilog',
  title: 'Bacterial growth on a log axis: doubling draws straight',
  use: 'Use this for “A culture grows from 1 × 10³ to 1.024 × 10⁶ cells/mL in 5 h. How many generations, and what is the generation time?”',
  assumptions: [
    'Log phase: every cell divides in two each generation, N = N₀ × 2ⁿ.',
    'g = t ÷ n is the doubling time.',
    'On a log axis each doubling climbs the same height.',
  ],
  variables: [
    num('N0', 'N₀', 'Starting density', 'cells/mL', 1, 1e12, { scientific: true }),
    num('N', 'N', 'Final density', 'cells/mL', 1, 1e15, { scientific: true }),
    num('n', 'n', 'Generations', undefined, 0.001, 100, { step: 0.1 }),
    num('t', 't', 'Time', 'min', 0, 100000, { step: 1 }),
    num('g', 'g', 'Generation time', 'min', 0, 100000),
  ],
  rules: [
    rule(
      'N = N₀ × 2ⁿ',
      '{N} = {N0} × 2^{n}',
      ['N', 'N0', 'n'],
      (v) => Math.log2(v.N! / v.N0!) - v.n!,
      {
        N: [(v) => fin(v.N0! * 2 ** v.n!), '{N0} × 2^{n}', 'Double the start n times.'],
        n: [
          (v) => (v.N! > 0 && v.N0! > 0 ? Math.log2(v.N! / v.N0!) : undefined),
          'ln({N} ÷ {N0}) ÷ ln(2)',
          'How many doublings take N₀ to N: the log of the ratio over the log of 2.',
        ],
        N0: [(v) => fin(v.N! / 2 ** v.n!), '{N} ÷ 2^{n}', 'Halve the final count n times.'],
      },
    ),
    rule('g = t/n', '{g} = {t} ÷ {n}', ['g', 't', 'n'], (v) => v.g! * v.n! - v.t!, {
      g: [(v) => div(v.t!, v.n!), '{t} ÷ {n}', 'Share the time among the generations.'],
      t: [(v) => v.g! * v.n!, '{g} × {n}', 'Each generation takes g.'],
    }),
  ],
  example: { N0: 1000, N: 1024000, n: 10, t: 300, g: 30 },
  startWith: ['N0', 'N', 't'],
  representation: {
    kind: 'functionGraph',
    family: 'exponential',
    a: 'N0',
    b: 2,
    name: 'N',
    at: { x: 'n', y: 'N' },
    scale: { y: 'log' },
    axes: { x: 'Generations n', y: 'Density N (cells/mL)' },
  },
});

/** microbiology#1~d-value at the edge: twelve decades of kill on a log axis. */
const dValue = page({
  id: 'g.he-function-graph-d-value',
  title: 'A 12D cook: twelve log reductions on a log axis',
  use: 'Use this for “With D₁₂₁ = 0.2 min, how long does a 12D cook take, and how many of 10⁶ spores survive?”',
  assumptions: [
    'Each D minutes at the temperature kills 90% of the spores: N = N₀ × 10^(−t/D).',
    'A count below 1 is a chance: 10⁻⁶ is one survivor in a million cans.',
    'On a log axis the kill is a straight line falling one decade every D.',
  ],
  variables: [
    num('N0', 'N₀', 'Starting spores', undefined, 1, 1e12, { scientific: true }),
    num('D', 'D', 'D-value', 'min', 0.001, 1000, { step: 0.001 }),
    num('t', 't', 'Time', 'min', 0, 10000, { step: 0.1 }),
    num('LR', 'LR', 'Log reductions', undefined, 0, 100),
    num('r', 'r', 'Rate in e-folds', 'min⁻¹', -10000, -1e-6),
    num('N', 'N', 'Survivors', undefined, 0, 1e12, { scientific: true }),
  ],
  rules: [
    rule('LR = t/D', '{LR} = {t} ÷ {D}', ['LR', 't', 'D'], (v) => v.LR! * v.D! - v.t!, {
      LR: [(v) => div(v.t!, v.D!), '{t} ÷ {D}', 'One decade for each D minutes.'],
      t: [(v) => v.LR! * v.D!, '{LR} × {D}', 'D minutes for each decade.'],
      D: [(v) => div(v.t!, v.LR!), '{t} ÷ {LR}', 'The time for one decade.'],
    }),
    rule('r = −ln 10/D', '{r} = −ln(10) ÷ {D}', ['r', 'D'], (v) => v.r! * v.D! + Math.LN10, {
      r: [
        (v) => div(-Math.LN10, v.D!),
        '−ln(10) ÷ {D}',
        'One decade is ln 10 e-folds, spread over D minutes.',
      ],
      D: [(v) => div(-Math.LN10, v.r!), '−ln(10) ÷ {r}', 'The time for ln 10 e-folds.'],
    }),
    rule(
      'N = N₀ × 10^(−LR)',
      '{N} = {N0} × 10^(−{LR})',
      ['N', 'N0', 'LR'],
      (v) => Math.log10(v.N! / v.N0!) + v.LR!,
      {
        N: [
          (v) => fin(v.N0! * 10 ** -v.LR!),
          '{N0} × 10^(−{LR})',
          'Each log reduction leaves a tenth.',
        ],
        N0: [(v) => fin(v.N! * 10 ** v.LR!), '{N} × 10^({LR})', 'Undo the tenths.'],
        LR: [
          (v) => (v.N! > 0 && v.N0! > 0 ? Math.log10(v.N0! / v.N!) : undefined),
          'log₁₀({N0} ÷ {N})',
          'How many tenths take N₀ to N.',
        ],
      },
    ),
  ],
  example: { N0: 1e6, D: 0.2, t: 2.4, LR: 12, r: -Math.LN10 / 0.2, N: 1e-6 },
  startWith: ['N0', 'D', 't'],
  representation: {
    kind: 'functionGraph',
    family: 'exponential',
    a: 'N0',
    r: 'r',
    name: 'N',
    at: { x: 't', y: 'N' },
    unitsOf: { x: 't' },
    scale: { y: 'log' },
    axes: { x: 'Time t', y: 'Survivors N' },
  },
});

/** oceanography#0~age-depth: depth grows downward, d = 2,500 + 350√t. */
const ageDepth = page({
  id: 'g.he-function-graph-depth-down',
  title: 'Seafloor depth against age, depth down',
  use: 'Use this for “Seafloor 1,225 km from the ridge spreads at 25 mm/yr. How old and how deep is it?”',
  assumptions: [
    'The plate cools and shrinks as it ages: d = 2,500 + 350√t, t in Myr, d in m.',
    'The square-root fit holds to about 80 Myr; older floor flattens near 5,500–6,000 m.',
    'km ÷ (mm/yr) gives millions of years.',
  ],
  variables: [
    num('x', 'x', 'Distance from the ridge', 'km', 0, 4000, { step: 1 }),
    num('u', 'u', 'Half spreading rate', 'mm/yr', 5, 100, { step: 0.5 }),
    num('t', 't', 'Age', 'Myr', 0, 80, { step: 0.1 }),
    num('d', 'd', 'Depth', 'm', 2500, 6000),
  ],
  rules: [
    rule('t = x/u', '{t} = {x} ÷ {u}', ['t', 'x', 'u'], (v) => v.t! * v.u! - v.x!, {
      t: [(v) => div(v.x!, v.u!), '{x} ÷ {u}', 'Distance over speed: km ÷ (mm/yr) is Myr.'],
      x: [(v) => v.t! * v.u!, '{t} × {u}', 'Speed times age.'],
      u: [
        // Floor at the ridge (t = 0) away from it has no spreading rate: say so, not "?".
        (v) => (v.t === 0 ? (v.x === 0 ? undefined : NaN) : v.x! / v.t!),
        '{x} ÷ {t}',
        'Distance over age.',
      ],
    }),
    rule(
      'd = 2,500 + 350√t',
      '{d} = 2500 + 350 × √{t}',
      ['d', 't'],
      (v) => v.d! - 2500 - 350 * Math.sqrt(v.t!),
      {
        d: [
          (v) => (v.t! >= 0 ? 2500 + 350 * Math.sqrt(v.t!) : undefined),
          '2500 + 350 × √({t})',
          'Start at the ridge’s 2,500 m and add 350 m for each √Myr.',
        ],
        t: [
          (v) => (v.d! >= 2500 ? ((v.d! - 2500) / 350) ** 2 : undefined),
          '(({d} − 2500) ÷ 350)²',
          'Undo the square root by squaring.',
        ],
      },
    ),
  ],
  example: { x: 1225, u: 25, t: 49, d: 4950 },
  startWith: ['x', 'u'],
  representation: {
    kind: 'functionGraph',
    family: 'root',
    index: 2,
    a: 350,
    k: 2500,
    name: 'd',
    at: { x: 't', y: 'd' },
    unitsOf: { x: 't', y: 'd' },
    invertY: true,
    axes: { x: 'Age t', y: 'Depth d' },
  },
});

/** geophysics#2 main: temperature across, depth down. */
const geotherm = page({
  id: 'g.he-function-graph-geotherm',
  title: 'A geotherm: temperature against depth, depth down',
  use: 'Use this for “Rock with k = 2.5 W/(m·K) has a gradient of 25 °C/km. Find the heat flow and the temperature at 10 km if the surface is 10 °C.”',
  assumptions: [
    'Steady conduction with no heat made in the layer: T = T₀ + Gz.',
    'Heat flows up, from hot to cold: q = kG, and W/(m·K) × °C/km is mW/m².',
  ],
  variables: [
    num('k', 'k', 'Conductivity', 'W/(m·K)', 0.5, 6, { step: 0.1 }),
    num('G', 'G', 'Gradient', '°C/km', 5, 100, { step: 0.5 }),
    num('q', 'q', 'Heat flow', 'mW/m²', 0, 1000),
    num('T0', 'T₀', 'Surface temperature', '°C', -40, 50, { step: 0.5 }),
    num('z', 'z', 'Depth', 'km', 0, 50, { step: 0.1 }),
    num('T', 'T', 'Temperature', '°C', -40, 5100),
  ],
  rules: [
    rule('q = kG', '{q} = {k} × {G}', ['q', 'k', 'G'], (v) => v.q! - v.k! * v.G!, {
      q: [(v) => v.k! * v.G!, '{k} × {G}', 'Conductivity times gradient.'],
      G: [(v) => div(v.q!, v.k!), '{q} ÷ {k}', 'Heat flow over conductivity.'],
      k: [(v) => div(v.q!, v.G!), '{q} ÷ {G}', 'Heat flow over gradient.'],
    }),
    rule(
      'T = T₀ + Gz',
      '{T} = {T0} + {G} × {z}',
      ['T', 'T0', 'G', 'z'],
      (v) => v.T! - v.T0! - v.G! * v.z!,
      {
        T: [(v) => v.T0! + v.G! * v.z!, '{T0} + {G} × {z}', 'Add G degrees for each km down.'],
        z: [(v) => div(v.T! - v.T0!, v.G!), '({T} − {T0}) ÷ {G}', 'The warming over the gradient.'],
        T0: [(v) => v.T! - v.G! * v.z!, '{T} − {G} × {z}', 'Take away the warming.'],
      },
    ),
  ],
  example: { k: 2.5, G: 25, q: 62.5, T0: 10, z: 10, T: 260 },
  startWith: ['k', 'G', 'T0', 'z'],
  representation: {
    kind: 'functionGraph',
    family: 'linear',
    m: 'G',
    b: 'T0',
    name: 'T',
    at: { x: 'z', y: 'T' },
    unitsOf: { x: 'z', y: 'T' },
    swap: true,
    invertY: true,
    axes: { x: 'Depth z', y: 'Temperature T' },
  },
});

/** soil-mechanics#0~gradation: percent passing against grain size, D₁₀, D₃₀, D₆₀ marked. */
const gradation = page({
  id: 'g.he-function-graph-gradation',
  title: 'A grain-size curve on a log axis: D₁₀, D₃₀, D₆₀',
  use: 'Use this for “A sand has D₁₀ = 0.15 mm, D₃₀ = 0.45 mm and D₆₀ = 1.2 mm. Find C_u and C_c. Is it well graded?”',
  assumptions: [
    'D₁₀ is the size 10% of the soil (by weight) is finer than; likewise D₃₀ and D₆₀.',
    'A sand is well graded when C_u ≥ 6 and 1 ≤ C_c ≤ 3 (a gravel: C_u ≥ 4).',
    'The curve between the three sizes is drawn smooth; only the marked points are data.',
  ],
  variables: [
    num('D10', 'D₁₀', 'Size 10% finer', 'mm', 0.0001, 100, { step: 0.001 }),
    num('D30', 'D₃₀', 'Size 30% finer', 'mm', 0.0001, 100, { step: 0.001 }),
    num('D60', 'D₆₀', 'Size 60% finer', 'mm', 0.0001, 100, { step: 0.001 }),
    num('Cu', 'C_u', 'Uniformity coefficient', undefined, 1, 1e6),
    num('Cc', 'C_c', 'Coefficient of curvature', undefined, 0, 1e6),
  ],
  rules: [
    rule(
      'C_u = D₆₀/D₁₀',
      '{Cu} = {D60} ÷ {D10}',
      ['Cu', 'D60', 'D10'],
      (v) => v.Cu! * v.D10! - v.D60!,
      {
        Cu: [
          (v) => div(v.D60!, v.D10!),
          '{D60} ÷ {D10}',
          'How many times the fine size the 60% size is.',
        ],
        D60: [(v) => v.Cu! * v.D10!, '{Cu} × {D10}', 'C_u times D₁₀.'],
        D10: [(v) => div(v.D60!, v.Cu!), '{D60} ÷ {Cu}', 'D₆₀ over C_u.'],
      },
    ),
    derive(
      'C_c = D₃₀²/(D₁₀D₆₀)',
      'Cc',
      ['D30', 'D10', 'D60'],
      '{Cc} = {D30}² ÷ ({D10} × {D60})',
      (v) => div(v.D30! ** 2, v.D10! * v.D60!),
      '{D30}² ÷ ({D10} × {D60})',
      'Compare the middle size with the ends: 1 to 3 means no size is missing.',
    ),
  ],
  example: { D10: 0.15, D30: 0.45, D60: 1.2, Cu: 8, Cc: 1.125 },
  startWith: ['D10', 'D30', 'D60'],
  representation: {
    kind: 'functionGraph',
    family: 'gradation',
    d10: 'D10',
    d30: 'D30',
    d60: 'D60',
    axes: { x: 'Grain size D (mm)', y: 'Percent finer (%)' },
    scale: { x: 'log' },
  },
});

/** cell-molecular#1~amplification: a signal multiplied stage by stage, bars on a log scale. */
const amplification = page({
  id: 'g.he-bars-log',
  title: 'Signal amplification, stage by stage on a log scale',
  use: 'Use this for “One receptor activates 20 G proteins, each enzyme makes 1000 cAMP a second. How many cAMP a second?”',
  assumptions: [
    'Each active G protein switches on one adenylyl cyclase.',
    'Each stage multiplies the one before it, so a log scale climbs one step per factor of 10.',
  ],
  variables: [
    num('R', 'R', 'Active receptors', undefined, 1, 1000, { integer: true }),
    num('g', 'g', 'G proteins per receptor', undefined, 0, 1000, { integer: true }),
    num('c', 'c', 'cAMP per enzyme per second', '1/s', 0, 1000, { integer: true }),
    num('G', 'G', 'Active G proteins', undefined, 0, 1e6),
    num('A', 'A', 'cAMP per second', '1/s', 0, 1e9),
  ],
  rules: [
    rule('G = Rg', '{G} = {R} × {g}', ['G', 'R', 'g'], (v) => v.G! - v.R! * v.g!, {
      G: [(v) => v.R! * v.g!, '{R} × {g}', 'Each receptor switches on g G proteins.'],
    }),
    rule('A = Gc', '{A} = {G} × {c}', ['A', 'G', 'c'], (v) => v.A! - v.G! * v.c!, {
      A: [(v) => v.G! * v.c!, '{G} × {c}', 'Each enzyme makes c cAMP a second.'],
    }),
  ],
  example: { R: 1, g: 20, c: 1000, G: 20, A: 20000 },
  startWith: ['R', 'g', 'c'],
  representation: {
    kind: 'bars',
    bars: [{ var: 'R' }, { var: 'G' }, { var: 'A' }],
    min: 0,
    max: 10,
    log: true,
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
  kleiber,
  growth,
  dValue,
  ageDepth,
  geotherm,
  gradation,
  amplification,
];

export const HE1D_GALLERY_LAYOUTS: LayoutDef[] = [];
