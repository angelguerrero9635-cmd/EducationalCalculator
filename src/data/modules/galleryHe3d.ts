/**
 * College gallery demos, round 3, group D (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC48: the `codeTrace` explore figure (engineering-programming#0~trace) and `code` cards (the
 * programming sorts).
 *
 * HC49: `timingDiagram`, one demo per mode (digital-logic#2, embedded-systems#1, ~pwm,
 * embedded-systems#2, networks#3) and one at the edge of a range for the register, the timer,
 * the UART and the link.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef } from './types';
import type { TimingDiagramSpec } from './typesHe3d';

type Fn = (x: Values) => number | number[] | undefined;

/** A relation with its rearrangements, each [solve, expression, how] for the step text. */
interface Rule {
  id: string;
  display: string;
  vars: string[];
  residual: (x: Values) => number;
  solve: Record<string, [Fn, string, string]>;
}

const rule = (
  id: string,
  display: string,
  vars: string[],
  residual: (x: Values) => number,
  solve: Record<string, [Fn, string, string]>,
): Rule => ({ id, display, vars, residual, solve });

type Demo = Omit<ModuleDef, 'relations' | 'steps'> & { rules: Rule[]; limits?: Relation[] };

/** A module from its rules (the relations and their step text together) and its page limits. */
function demo({ rules, limits = [], ...m }: Demo): ModuleDef {
  return {
    ...m,
    relations: [
      ...rules.map((r) => ({
        id: r.id,
        display: r.display,
        vars: r.vars,
        residual: r.residual,
        solve: Object.fromEntries(Object.entries(r.solve).map(([k, [fn]]) => [k, fn])),
      })),
      ...limits,
    ],
    steps: Object.fromEntries([
      ...rules.map((r) => [
        r.id,
        Object.fromEntries(Object.entries(r.solve).map(([k, [, expr, how]]) => [k, { expr, how }])),
      ]),
      ...limits.map((l) => [l.id, {}]),
    ]),
  };
}

const vr = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...(unit ? { unit } : {}), min, max, ...more });

const div = (a: number, b: number) => (b === 0 ? undefined : a / b);

/** A page limit: `ok` holds, else the message. */
const limit = (
  id: string,
  display: string,
  vars: string[],
  ok: (x: Values) => boolean,
  message: string,
): Relation => ({
  id,
  constraint: true,
  display,
  vars,
  residual: (x) => (ok(x) ? 0 : 1),
  solve: {},
  message: (x) => (ok(x) ? undefined : message),
});

/** total = a + b + … with every rearrangement. */
const sumRule = (id: string, total: string, parts: string[], how: string): Rule => {
  const braced = (xs: string[]) => xs.map((p) => `{${p}}`);
  const solve: Record<string, [Fn, string, string]> = {
    [total]: [(x) => parts.reduce((s, p) => s + x[p]!, 0), braced(parts).join(' + '), how],
  };
  for (const p of parts) {
    const others = parts.filter((q) => q !== p);
    solve[p] = [
      (x) => x[total]! - others.reduce((s, q) => s + x[q]!, 0),
      [`{${total}}`, ...braced(others)].join(' − '),
      'Take the other parts from the total.',
    ];
  }
  return rule(
    id,
    `{${total}} = ${braced(parts).join(' + ')}`,
    [total, ...parts],
    (x) => x[total]! - parts.reduce((s, p) => s + x[p]!, 0),
    solve,
  );
};

// ─── HC48: engineering-programming#0~trace ────────────────────────────────────

const WHILE_M = ['x = 1;', 'n = 0;', 'while x <= 20', '    x = 2*x;', '    n = n + 1;', 'end'];
const WHILE_P = ['x = 1', 'n = 0', 'while x <= 20:', '    x = 2*x', '    n = n + 1'];

/** The table after each pass of the doubling loop: [x, n]. */
const doubling = [1, 2, 4, 8, 16, 32].map((x, n) => [x, n]);

const traceWhile: LayoutDef = {
  kind: 'explore',
  id: 'g.he-code-trace-while',
  title: 'Trace a while loop',
  use: 'Use this for “What is x after while x <= 20, x = 2*x runs from x = 1? How many passes?”',
  assumptions: [
    'The test is read before every pass; the body runs only while it holds.',
    'MATLAB ends the loop with end; Python ends it where the indent stops.',
    'Each row of the table is the values after one pass of the body.',
  ],
  figure: { kind: 'codeTrace', matlab: WHILE_M, python: WHILE_P, vars: ['x', 'n'] },
  scenes: [
    {
      label: 'Start',
      lines: ['The first two lines set x to 1 and the pass count n to 0.'],
      trace: { line: 2, rows: doubling.slice(0, 1) },
    },
    ...[1, 2, 3, 4].map((k) => ({
      label: `Pass ${k}`,
      lines: [
        `The test ${doubling[k - 1]![0]} <= 20 holds, so the body runs: x doubles to ${doubling[k]![0]} and n counts ${k}.`,
      ],
      trace: {
        line: 5,
        rows: doubling.slice(0, k + 1),
        test: { text: `${doubling[k - 1]![0]} <= 20`, holds: true },
      },
    })),
    {
      label: 'Pass 5',
      lines: ['The test 16 <= 20 still holds: x doubles to 32, past 20, and n counts 5.'],
      trace: { line: 5, rows: doubling, test: { text: '16 <= 20', holds: true } },
    },
    {
      label: 'End',
      lines: ['Now 32 <= 20 is false, so the loop ends with x = 32 after 5 passes.'],
      trace: { line: 3, rows: doubling, test: { text: '32 <= 20', holds: false } },
    },
  ],
};

// The edge: a for loop with a step, the stop left out of Python's range (1:2:10 is 1, 3, 5, 7, 9).
const FOR_M = ['S = 0;', 'for k = 1:2:10', '    S = S + k;', 'end'];
const FOR_P = ['S = 0', 'for k in range(1, 10, 2):', '    S = S + k'];
const sums = [1, 3, 5, 7, 9].reduce<(number | string)[][]>(
  (rows, k) => [...rows, [k, Number(rows[rows.length - 1]![1]) + k]],
  [['–', 0]],
);

const traceFor: LayoutDef = {
  kind: 'explore',
  id: 'g.he-code-trace-for',
  title: 'Trace a for loop with a step',
  use: 'Use this for “What does S hold after for k = 1:2:10, S = S + k?”',
  assumptions: [
    'MATLAB’s 1:2:10 counts from 1 by 2 and stops at 10 or before: 1, 3, 5, 7, 9.',
    'Python’s range(1, 10, 2) stops before 10, so it gives the same five values.',
    'Each row of the table is k and S after one pass.',
  ],
  figure: { kind: 'codeTrace', matlab: FOR_M, python: FOR_P, vars: ['k', 'S'] },
  scenes: [
    {
      label: 'Start',
      lines: ['S starts at 0 before the loop; k has no value yet.'],
      trace: { line: 1, rows: sums.slice(0, 1) },
    },
    ...[1, 2, 3, 4, 5].map((p) => ({
      label: `k = ${sums[p]![0]}`,
      lines: [
        `Pass ${p}: k takes the next value, ${sums[p]![0]}, and S becomes ${sums[p - 1]![1]} + ${sums[p]![0]} = ${sums[p]![1]}.`,
      ],
      trace: { line: 3, rows: sums.slice(0, p + 1) },
    })),
  ],
};

// ─── HC48: engineering-programming#0~syntax (code cards) ──────────────────────

const syntaxCards: LayoutDef = {
  kind: 'sort',
  id: 'g.he-code-card-syntax',
  title: 'MATLAB, Python or both',
  use: 'Use this for “Which language is A(end) written in?”',
  assumptions: [
    'MATLAB counts from 1 with ( ); Python counts from 0 with [ ].',
    'MATLAB comments start with %, Python comments with #.',
  ],
  question: 'Which language could run this line?',
  bins: [
    {
      id: 'matlab',
      label: 'MATLAB only',
      why: 'Round brackets, end, % comments and ’ transposes.',
    },
    { id: 'python', label: 'Python only', why: 'Square brackets from 0, # comments and +=.' },
    { id: 'both', label: 'Both', why: 'Plain assignments and comparisons read the same in both.' },
  ],
  cards: (
    [
      ['A(end)', 'matlab'],
      ["y = x'", 'matlab'],
      ['% note', 'matlab'],
      ['if x > 3\n    y = 1;\nend', 'matlab'],
      ['A[-1]', 'python'],
      ['x += 1', 'python'],
      ['# note', 'python'],
      ["s = 'ok'\nprint(s)", 'python'],
      ['x = 5', 'both'],
      ['a == b', 'both'],
    ] as const
  ).map(([code, bin], i) => ({
    label: `Snippet ${String.fromCharCode(65 + i)}`,
    bin,
    figure: { kind: 'code' as const, code },
  })),
};

// ─── HC49: digital-logic#2, the register path ────────────────────────────────

const ns = (id: string, symbol: string, name: string) =>
  vr(id, symbol, name, 'ns', 0.01, 1000, { step: 0.1 });

const registerVars = () => [
  ns('tcq', 't_cq', 'Clock-to-Q delay'),
  ns('tlogic', 't_logic', 'Longest logic delay'),
  ns('tsetup', 't_setup', 'Setup time'),
  ns('Tmin', 'T_min', 'Shortest clock period'),
  vr('fmax', 'f_max', 'Fastest clock', 'MHz', 1, 100000, { step: 1 }),
  ns('thold', 't_hold', 'Hold time'),
  ns('tcd', 't_cd', 'Shortest path delay'),
];

const registerRules = (): Rule[] => [
  sumRule(
    'T_min = t_cq + t_logic + t_setup',
    'Tmin',
    ['tcq', 'tlogic', 'tsetup'],
    'Q changes, the logic settles, and D must then wait out the setup time.',
  ),
  rule(
    'f_max = 1 ÷ T_min',
    '{fmax} = 1000 ÷ {Tmin}',
    ['fmax', 'Tmin'],
    (x) => x.fmax! * x.Tmin! - 1000,
    {
      fmax: [
        (x) => div(1000, x.Tmin!),
        '1000 ÷ {Tmin}',
        'One over the period; 1000 turns 1/ns into MHz.',
      ],
      Tmin: [
        (x) => div(1000, x.fmax!),
        '1000 ÷ {fmax}',
        'One over the frequency; 1000 turns 1/MHz into ns.',
      ],
    },
  ),
];

const holdLimit = limit(
  'the hold check',
  '{tcq} + {tcd} ≥ {thold}',
  ['tcq', 'tcd', 'thold'],
  (x) => x.tcq! + x.tcd! >= x.thold! - 1e-9,
  'A path this short changes D before the hold time ends.',
);

const registerSpec: TimingDiagramSpec = {
  kind: 'timingDiagram',
  mode: 'register',
  tcq: 'tcq',
  tlogic: 'tlogic',
  tsetup: 'tsetup',
  period: 'Tmin',
  freq: 'fmax',
  hold: 'thold',
  tcd: 'tcd',
};

const register = demo({
  id: 'g.he-timing-diagram-register',
  title: 'Timing diagram: a register path',
  use: 'Use this for “Find the fastest clock for a register path with t_cq = 1 ns, 6 ns of logic and t_setup = 0.5 ns.”',
  assumptions: [
    'Both registers share one clock with no skew.',
    'D must be steady t_setup before the next rising edge and stay t_hold after it.',
    'The hold check: t_cq + t_cd ≥ t_hold, whatever the clock.',
  ],
  variables: registerVars(),
  rules: registerRules(),
  limits: [holdLimit],
  example: { tcq: 1, tlogic: 6, tsetup: 0.5, Tmin: 7.5, fmax: 1000 / 7.5, thold: 0.5, tcd: 0.8 },
  startWith: ['tcq', 'tlogic', 'tsetup', 'thold', 'tcd'],
  representation: registerSpec,
});

// The edge: a path that just passes its hold check (t_cq + t_cd = t_hold).
const registerHold = demo({
  id: 'g.he-timing-diagram-register-hold',
  title: 'Timing diagram: a path at its hold limit',
  use: 'Use this for “Does a path with t_cq = 0.3 ns and a 0.2 ns shortest path meet a 0.5 ns hold time?”',
  assumptions: [
    'Both registers share one clock with no skew.',
    'The hold check: t_cq + t_cd ≥ t_hold; here it holds with nothing to spare.',
  ],
  variables: registerVars(),
  rules: registerRules(),
  limits: [holdLimit],
  example: { tcq: 0.3, tlogic: 2.5, tsetup: 0.2, Tmin: 3, fmax: 1000 / 3, thold: 0.5, tcd: 0.2 },
  startWith: ['tcq', 'tlogic', 'tsetup', 'thold', 'tcd'],
  representation: registerSpec,
});

// ─── HC49: embedded-systems#1, a timer's compare value ────────────────────────

const timerVars = () => [
  vr('fclk', 'f_clk', 'Clock frequency', 'MHz', 0.001, 1000, { step: 1 }),
  vr('N', 'N', 'Prescaler', undefined, 1, 1024, { allowed: [1, 8, 64, 256, 1024] }),
  vr('ft', 'f_t', 'Timer clock', 'kHz', 0.001, 1e6, { step: 1 }),
  vr('P', 'P', 'Period', 'ms', 0.001, 100000, { step: 0.1, units: ['ms'] }),
  vr('ticks', 'ticks', 'Ticks a period', undefined, 1, 1e9, { step: 1 }),
  vr('cmp', 'compare', 'Compare value', undefined, 0, 1e9, { step: 1 }),
  vr('n', 'n', 'Timer bits', undefined, 8, 32, { allowed: [8, 16, 32] }),
];

const timerRules = (): Rule[] => [
  rule(
    'f_t = f_clk ÷ N',
    '{ft} = 1000 × {fclk} ÷ {N}',
    ['ft', 'fclk', 'N'],
    (x) => x.ft! * x.N! - 1000 * x.fclk!,
    {
      ft: [
        (x) => div(1000 * x.fclk!, x.N!),
        '1000 × {fclk} ÷ {N}',
        'The prescaler divides the clock; 1000 turns MHz into kHz.',
      ],
      fclk: [
        (x) => (x.ft! * x.N!) / 1000,
        '{ft} × {N} ÷ 1000',
        'Undo the prescaler: the timer clock times N.',
      ],
      N: [
        (x) => div(1000 * x.fclk!, x.ft!),
        '1000 × {fclk} ÷ {ft}',
        'The prescaler is the clock over the timer clock.',
      ],
    },
  ),
  rule(
    'ticks = P × f_t',
    '{ticks} = {P} × {ft}',
    ['ticks', 'P', 'ft'],
    (x) => x.ticks! - x.P! * x.ft!,
    {
      ticks: [
        (x) => x.P! * x.ft!,
        '{P} × {ft}',
        'Ticks are the period times the tick rate (ms × kHz).',
      ],
      P: [
        (x) => div(x.ticks!, x.ft!),
        '{ticks} ÷ {ft}',
        'The period is the ticks over the tick rate.',
      ],
      ft: [
        (x) => div(x.ticks!, x.P!),
        '{ticks} ÷ {P}',
        'The tick rate is the ticks over the period.',
      ],
    },
  ),
  rule(
    'compare = ticks − 1',
    '{cmp} = {ticks} − 1',
    ['cmp', 'ticks'],
    (x) => x.cmp! - x.ticks! + 1,
    {
      cmp: [
        (x) => x.ticks! - 1,
        '{ticks} − 1',
        'The count starts at 0, so the last count is one less.',
      ],
      ticks: [(x) => x.cmp! + 1, '{cmp} + 1', 'Counting from 0 to compare is compare + 1 ticks.'],
    },
  ),
];

const timerLimit = limit(
  'the compare value fits the timer',
  '{cmp} < 2^{n}',
  ['cmp', 'n'],
  (x) => x.cmp! < 2 ** x.n!,
  'The compare value doesn’t fit in the timer’s bits: use a bigger prescaler.',
);

const timerSpec: TimingDiagramSpec = {
  kind: 'timingDiagram',
  mode: 'timer',
  fclk: 'fclk',
  prescaler: 'N',
  ftimer: 'ft',
  period: 'P',
  ticks: 'ticks',
  compare: 'cmp',
  bits: 'n',
};

const timer = demo({
  id: 'g.he-timing-diagram-timer',
  title: 'Timing diagram: a timer’s compare value',
  use: 'Use this for “Set a 16 MHz timer to interrupt every 1 ms with prescaler 64.”',
  assumptions: [
    'The timer counts from 0 and clears on a compare match (CTC mode).',
    'Each match raises the interrupt, so the count runs compare + 1 ticks a period.',
  ],
  variables: timerVars(),
  rules: timerRules(),
  limits: [timerLimit],
  example: { fclk: 16, N: 64, ft: 250, P: 1, ticks: 250, cmp: 249, n: 8 },
  startWith: ['fclk', 'N', 'P', 'n'],
  representation: timerSpec,
});

// The edge: the longest period an 8-bit timer reaches with the largest prescaler (compare 255).
const timerTop = demo({
  id: 'g.he-timing-diagram-timer-top',
  title: 'Timing diagram: an 8-bit timer at its top',
  use: 'Use this for “What is the longest period an 8-bit timer at 16 MHz reaches with prescaler 1024?”',
  assumptions: [
    'The timer counts from 0 and clears on a compare match (CTC mode).',
    'An 8-bit compare register holds 0 to 255.',
  ],
  variables: timerVars(),
  rules: timerRules(),
  limits: [timerLimit],
  example: { fclk: 16, N: 1024, ft: 15.625, P: 16.384, ticks: 256, cmp: 255, n: 8 },
  startWith: ['fclk', 'N', 'P', 'n'],
  representation: timerSpec,
});

// ─── HC49: embedded-systems#1~pwm ─────────────────────────────────────────────

const pwm = demo({
  id: 'g.he-timing-diagram-pwm',
  title: 'Timing diagram: PWM',
  use: 'Use this for “A 16 MHz timer with prescaler 8 counts to TOP = 1999 and compares at 500. Find the PWM frequency, duty and average voltage.”',
  assumptions: [
    'Fast PWM: the count runs 0 to TOP, so a period is TOP + 1 ticks.',
    'The output is high while the count is below the compare value.',
    'The average voltage is the duty times the supply.',
  ],
  variables: [
    vr('fclk', 'f_clk', 'Clock frequency', 'MHz', 0.001, 1000, { step: 1 }),
    vr('N', 'N', 'Prescaler', undefined, 1, 1024, { allowed: [1, 8, 64, 256, 1024] }),
    vr('top', 'TOP', 'Top count', undefined, 1, 65535, { step: 1 }),
    vr('cmp', 'compare', 'Compare value', undefined, 0, 65536, { step: 1 }),
    vr('f', 'f_PWM', 'PWM frequency', 'kHz', 0.0001, 100000, { step: 0.1 }),
    vr('duty', 'duty', 'Duty cycle', '%', 0, 100, { step: 1 }),
    vr('vdd', 'V_DD', 'Supply voltage', 'V', 0.1, 50, { step: 0.1 }),
    vr('vavg', 'V_avg', 'Average voltage', 'V', 0, 50, { step: 0.01 }),
  ],
  rules: [
    rule(
      'f_PWM = f_clk ÷ (N(TOP + 1))',
      '{f} = 1000 × {fclk} ÷ ({N} × ({top} + 1))',
      ['f', 'fclk', 'N', 'top'],
      (x) => x.f! * x.N! * (x.top! + 1) - 1000 * x.fclk!,
      {
        f: [
          (x) => div(1000 * x.fclk!, x.N! * (x.top! + 1)),
          '1000 × {fclk} ÷ ({N} × ({top} + 1))',
          'The clock over the prescaler and the TOP + 1 ticks of a period.',
        ],
        fclk: [
          (x) => (x.f! * x.N! * (x.top! + 1)) / 1000,
          '{f} × {N} × ({top} + 1) ÷ 1000',
          'Undo the division: the frequency times N(TOP + 1).',
        ],
        top: [
          (x) => (x.f! * x.N! === 0 ? undefined : (1000 * x.fclk!) / (x.f! * x.N!) - 1),
          '1000 × {fclk} ÷ ({f} × {N}) − 1',
          'The ticks a period, less 1 because the count starts at 0.',
        ],
      },
    ),
    rule(
      'duty = compare ÷ (TOP + 1)',
      '{duty} = 100 × {cmp} ÷ ({top} + 1)',
      ['duty', 'cmp', 'top'],
      (x) => x.duty! * (x.top! + 1) - 100 * x.cmp!,
      {
        duty: [
          (x) => div(100 * x.cmp!, x.top! + 1),
          '100 × {cmp} ÷ ({top} + 1)',
          'The share of the period the output is high, as a percent.',
        ],
        cmp: [
          (x) => (x.duty! * (x.top! + 1)) / 100,
          '{duty} × ({top} + 1) ÷ 100',
          'The duty’s share of the TOP + 1 ticks.',
        ],
      },
    ),
    rule(
      'V_avg = duty × V_DD',
      '{vavg} = {duty} × {vdd} ÷ 100',
      ['vavg', 'duty', 'vdd'],
      (x) => 100 * x.vavg! - x.duty! * x.vdd!,
      {
        vavg: [
          (x) => (x.duty! * x.vdd!) / 100,
          '{duty} × {vdd} ÷ 100',
          'High for the duty’s share of the time, so the average is that share of V_DD.',
        ],
        duty: [
          (x) => div(100 * x.vavg!, x.vdd!),
          '100 × {vavg} ÷ {vdd}',
          'The average over the supply, as a percent.',
        ],
        vdd: [
          (x) => div(100 * x.vavg!, x.duty!),
          '100 × {vavg} ÷ {duty}',
          'The average over the duty’s share.',
        ],
      },
    ),
  ],
  example: { fclk: 16, N: 8, top: 1999, cmp: 500, f: 1, duty: 25, vdd: 5, vavg: 1.25 },
  startWith: ['fclk', 'N', 'top', 'cmp', 'vdd'],
  representation: {
    kind: 'timingDiagram',
    mode: 'pwm',
    fclk: 'fclk',
    prescaler: 'N',
    top: 'top',
    compare: 'cmp',
    freq: 'f',
    duty: 'duty',
    vdd: 'vdd',
    vavg: 'vavg',
  },
});

// ─── HC49: embedded-systems#2, a UART frame ───────────────────────────────────

const uartVars = () => [
  vr('baud', 'baud', 'Baud rate', 'bits/s', 300, 10000000, { step: 1 }),
  vr('data', 'data', 'Data bits', undefined, 5, 9, { allowed: [5, 6, 7, 8, 9] }),
  vr('par', 'parity', 'Parity bits', undefined, 0, 1, { allowed: [0, 1] }),
  vr('stop', 'stop', 'Stop bits', undefined, 1, 2, { allowed: [1, 2] }),
  vr('frame', 'frame', 'Bits a frame', undefined, 7, 13, { integer: true }),
  vr('rate', 'rate', 'Bytes a second', 'B/s', 1, 1e7, { step: 1 }),
  vr('time', 't_byte', 'Time a byte', 'μs', 0.01, 1e6, { step: 0.1 }),
];

const uartRules = (): Rule[] => [
  rule(
    'frame = 1 + data + parity + stop',
    '{frame} = 1 + {data} + {par} + {stop}',
    ['frame', 'data', 'par', 'stop'],
    (x) => x.frame! - 1 - x.data! - x.par! - x.stop!,
    {
      frame: [
        (x) => 1 + x.data! + x.par! + x.stop!,
        '1 + {data} + {par} + {stop}',
        'One start bit, the data bits, the parity bit if any, and the stop bits.',
      ],
      data: [
        (x) => x.frame! - 1 - x.par! - x.stop!,
        '{frame} − 1 − {par} − {stop}',
        'Take the start, parity and stop bits from the frame.',
      ],
    },
  ),
  rule(
    'rate = baud ÷ frame',
    '{rate} = {baud} ÷ {frame}',
    ['rate', 'baud', 'frame'],
    (x) => x.rate! * x.frame! - x.baud!,
    {
      rate: [
        (x) => div(x.baud!, x.frame!),
        '{baud} ÷ {frame}',
        'Each byte takes a whole frame of bits.',
      ],
      baud: [
        (x) => x.rate! * x.frame!,
        '{rate} × {frame}',
        'Bytes a second times the bits each one takes.',
      ],
      frame: [
        (x) => div(x.baud!, x.rate!),
        '{baud} ÷ {rate}',
        'The bits a second over the bytes a second.',
      ],
    },
  ),
  rule(
    'time = frame ÷ baud',
    '{time} = 1000000 × {frame} ÷ {baud}',
    ['time', 'frame', 'baud'],
    (x) => x.time! * x.baud! - 1e6 * x.frame!,
    {
      time: [
        (x) => div(1e6 * x.frame!, x.baud!),
        '1000000 × {frame} ÷ {baud}',
        'A frame’s bits at the baud rate; 1,000,000 turns seconds into μs.',
      ],
      baud: [
        (x) => div(1e6 * x.frame!, x.time!),
        '1000000 × {frame} ÷ {time}',
        'The frame’s bits over its time in seconds.',
      ],
    },
  ),
];

const uartSpec = (byte: number): TimingDiagramSpec => ({
  kind: 'timingDiagram',
  mode: 'uart',
  baud: 'baud',
  dataBits: 'data',
  parity: 'par',
  stopBits: 'stop',
  frame: 'frame',
  rate: 'rate',
  time: 'time',
  byte,
});

const uart = demo({
  id: 'g.he-timing-diagram-uart',
  title: 'Timing diagram: a UART frame',
  use: 'Use this for “How many bytes per second can a 115 200-baud 8N1 UART send?”',
  assumptions: [
    'The line idles high; a start bit pulls it low, and the data go out LSB first.',
    '8N1 is 8 data bits, no parity and 1 stop bit.',
    'Frames follow each other with no idle time between them.',
  ],
  variables: uartVars(),
  rules: uartRules(),
  example: { baud: 115200, data: 8, par: 0, stop: 1, frame: 10, rate: 11520, time: 1e6 / 11520 },
  startWith: ['baud', 'data', 'par', 'stop'],
  representation: uartSpec(0x4b),
});

// The edge: the longest frame, 9 data bits with parity and 2 stop bits.
const uartLong = demo({
  id: 'g.he-timing-diagram-uart-9e2',
  title: 'Timing diagram: the longest UART frame',
  use: 'Use this for “How long does a 9600-baud UART take per byte with 9 data bits, parity and 2 stop bits?”',
  assumptions: [
    'The line idles high; a start bit pulls it low, and the data go out LSB first.',
    'Even parity: the parity bit makes the count of 1s even.',
  ],
  variables: uartVars(),
  rules: uartRules(),
  example: {
    baud: 9600,
    data: 9,
    par: 1,
    stop: 2,
    frame: 13,
    rate: 9600 / 13,
    time: (1e6 * 13) / 9600,
  },
  startWith: ['baud', 'data', 'par', 'stop'],
  representation: uartSpec(0x15a),
});

// ─── HC49: networks#3, a packet's delay ───────────────────────────────────────

const ms = (id: string, symbol: string, name: string) =>
  vr(id, symbol, name, 'ms', 1e-6, 1e6, { step: 0.001, units: ['ms'] });

const linkVars = () => [
  vr('L', 'L', 'Packet size', 'B', 1, 1e7, { step: 1 }),
  vr('R', 'R', 'Link rate', 'Mb/s', 0.001, 1e6, { step: 1 }),
  vr('dt', 'd_t', 'Transmission delay', 'μs', 1e-4, 1e9, { step: 0.1 }),
  vr('d', 'd', 'Distance', 'km', 0.001, 1e5, { step: 1, units: ['km'] }),
  vr('s', 's', 'Signal speed', 'm/s', 1e7, 3e8, { step: 1e6, scientific: true, units: ['m/s'] }),
  ms('dp', 'd_p', 'Propagation delay'),
  ms('total', 'total', 'Total delay'),
];

const linkRules = (): Rule[] => [
  rule('d_t = 8L ÷ R', '{dt} = 8 × {L} ÷ {R}', ['dt', 'L', 'R'], (x) => x.dt! * x.R! - 8 * x.L!, {
    dt: [
      (x) => div(8 * x.L!, x.R!),
      '8 × {L} ÷ {R}',
      'The packet’s bits over the rate (bits over Mb/s give μs).',
    ],
    L: [(x) => (x.dt! * x.R!) / 8, '{dt} × {R} ÷ 8', 'The bits sent in d_t, over 8 bits a byte.'],
    R: [(x) => div(8 * x.L!, x.dt!), '8 × {L} ÷ {dt}', 'The bits over the time they take.'],
  }),
  rule(
    'd_p = d ÷ s',
    '{dp} = 1000000 × {d} ÷ {s}',
    ['dp', 'd', 's'],
    (x) => x.dp! * x.s! - 1e6 * x.d!,
    {
      dp: [
        (x) => div(1e6 * x.d!, x.s!),
        '1000000 × {d} ÷ {s}',
        'Distance over speed; 1,000,000 turns km over m/s into ms.',
      ],
      d: [(x) => (x.dp! * x.s!) / 1e6, '{dp} × {s} ÷ 1000000', 'Speed times time, back in km.'],
      s: [
        (x) => div(1e6 * x.d!, x.dp!),
        '1000000 × {d} ÷ {dp}',
        'The distance over the time it takes.',
      ],
    },
  ),
  rule(
    'total = d_t + d_p',
    '{total} = {dt} ÷ 1000 + {dp}',
    ['total', 'dt', 'dp'],
    (x) => x.total! - x.dt! / 1000 - x.dp!,
    {
      total: [
        (x) => x.dt! / 1000 + x.dp!,
        '{dt} ÷ 1000 + {dp}',
        'The delays add; d_t ÷ 1000 is in ms.',
      ],
      dp: [
        (x) => x.total! - x.dt! / 1000,
        '{total} − {dt} ÷ 1000',
        'Take the transmission delay from the total.',
      ],
    },
  ),
];

/** The page limit: the total takes in the propagation delay and some sending time. */
const linkLimit = limit(
  'the total is more than the propagation delay',
  '{total} > {dp}',
  ['total', 'dp'],
  (x) => x.total! > x.dp!,
  'The total must be more than d_p: sending the packet takes time too.',
);

const linkSpec: TimingDiagramSpec = {
  kind: 'timingDiagram',
  mode: 'link',
  L: 'L',
  R: 'R',
  dt: 'dt',
  d: 'd',
  s: 's',
  dp: 'dp',
  total: 'total',
};

const linkDemo = demo({
  id: 'g.he-timing-diagram-link',
  title: 'Timing diagram: a packet crossing a link',
  use: 'Use this for “How long does a 1500-byte packet take to cross a 2000 km, 100 Mb/s link?”',
  assumptions: [
    'The signal travels at s = 2 × 10⁸ m/s in fiber or copper.',
    'No queue: the packet is sent the moment it is ready.',
    'The receiver has the packet when its last bit arrives.',
  ],
  variables: linkVars(),
  rules: linkRules(),
  limits: [linkLimit],
  example: { L: 1500, R: 100, dt: 120, d: 2000, s: 2e8, dp: 10, total: 10.12 },
  startWith: ['L', 'R', 'd', 's'],
  representation: linkSpec,
});

// The edge: a short, fast LAN link, where sending the packet takes far longer than crossing.
const linkLan = demo({
  id: 'g.he-timing-diagram-link-lan',
  title: 'Timing diagram: a packet on a short LAN link',
  use: 'Use this for “How long does a 1500-byte packet take to cross 200 m of 1 Gb/s Ethernet?”',
  assumptions: [
    'The signal travels at s = 2 × 10⁸ m/s in copper.',
    'No queue: the packet is sent the moment it is ready.',
  ],
  variables: linkVars(),
  rules: linkRules(),
  limits: [linkLimit],
  example: { L: 1500, R: 1000, dt: 12, d: 0.2, s: 2e8, dp: 0.001, total: 0.013 },
  startWith: ['L', 'R', 'd', 's'],
  representation: linkSpec,
});

export const HE3D_GALLERY_MODULES: ModuleDef[] = [
  register,
  registerHold,
  timer,
  timerTop,
  pwm,
  uart,
  uartLong,
  linkDemo,
  linkLan,
];

export const HE3D_GALLERY_LAYOUTS: LayoutDef[] = [traceWhile, traceFor, syntaxCards];
