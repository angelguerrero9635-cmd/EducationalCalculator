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
 *
 * HC50: `graph` (discrete-math#3, data-structures#1, communication-systems#3~code-length,
 * networks#2) with an edge case each, and graph cards on a sequence (networks#2~dijkstra) and
 * a sort (discrete-math#3~euler).
 *
 * HC51: `scheduleChart` (embedded-systems#3, ~response-time, ~edf; operating-systems#1,
 * ~round-robin) and a rate-monotonic set that misses a deadline at the edge.
 *
 * HC64: `bitFields` (computer-architecture#0 and #3, networks#0 headers and #1), each with an
 * edge: three register fields, a 64-bit address, a /30.
 */
import { jobOrder } from '@/components/module/reps/scheduleMath';
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef } from './types';
import type { BitFieldsSpec, GraphSpec, TimingDiagramSpec } from './typesHe3d';

type Fn = (x: Values) => number | number[] | undefined;
/** A rearrangement's right-hand side: a template, or one built from the values (a sorted order). */
type Expr = string | ((x: Values) => string);

/** A relation with its rearrangements, each [solve, expression, how] for the step text. */
interface Rule {
  id: string;
  display: string;
  vars: string[];
  residual: (x: Values) => number;
  solve: Record<string, [Fn, Expr, string]>;
}

const rule = (
  id: string,
  display: string,
  vars: string[],
  residual: (x: Values) => number,
  solve: Record<string, [Fn, Expr, string]>,
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
        // (a `() => undefined` rearrangement marks a value the relation can't give: no step)
        Object.fromEntries(
          Object.entries(r.solve)
            .filter(([, [fn]]) => fn.length > 0)
            .map(([k, [, expr, how]]) => [k, { expr, how }]),
        ),
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
  const solve: Record<string, [Fn, Expr, string]> = {
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

// ─── HC50: discrete-math#3, degrees and faces ─────────────────────────────────

const count = (id: string, symbol: string, name: string, min = 0, max = 100) =>
  vr(id, symbol, name, undefined, min, max, { integer: true });

const planarVars = () => [
  count('V', 'V', 'Vertices', 1, 16),
  count('E', 'E', 'Edges', 0, 42),
  count('sum', 'Σ deg', 'Degree sum', 0, 84),
  vr('avg', 'd̄', 'Average degree', undefined, 0, 15, { step: 0.01 }),
  count('F', 'F', 'Faces', 1, 40),
];

const planarRules = (): Rule[] => [
  rule('degree sum = 2E', '{sum} = 2 × {E}', ['sum', 'E'], (x) => x.sum! - 2 * x.E!, {
    sum: [(x) => 2 * x.E!, '2 × {E}', 'Each edge has two ends, so it adds 1 to two degrees.'],
    E: [(x) => x.sum! / 2, '{sum} ÷ 2', 'Each edge counts twice in the degree sum.'],
  }),
  rule(
    'average degree = 2E ÷ V',
    '{avg} = {sum} ÷ {V}',
    ['avg', 'sum', 'V'],
    (x) => x.avg! * x.V! - x.sum!,
    {
      avg: [(x) => div(x.sum!, x.V!), '{sum} ÷ {V}', 'The degree sum shared over the vertices.'],
      sum: [(x) => x.avg! * x.V!, '{avg} × {V}', 'The average times the number of vertices.'],
      V: [(x) => div(x.sum!, x.avg!), '{sum} ÷ {avg}', 'The degree sum over the average degree.'],
    },
  ),
  rule('V − E + F = 2', '{V} − {E} + {F} = 2', ['V', 'E', 'F'], (x) => x.V! - x.E! + x.F! - 2, {
    F: [(x) => 2 - x.V! + x.E!, '2 − {V} + {E}', 'Euler’s formula for a connected planar graph.'],
    E: [(x) => x.V! + x.F! - 2, '{V} + {F} − 2', 'Euler’s formula, solved for the edges.'],
    V: [(x) => 2 + x.E! - x.F!, '2 + {E} − {F}', 'Euler’s formula, solved for the vertices.'],
  }),
];

const planarLimit = limit(
  'a simple planar graph has at most 3V − 6 edges',
  '{E} ≤ 3 × {V} − 6',
  ['E', 'V'],
  (x) => x.V! < 3 || x.E! <= 3 * x.V! - 6,
  'A simple planar graph on V ≥ 3 vertices has at most 3V − 6 edges.',
);

const PRISM_V = [
  { name: 'A', x: 0.5, y: 0 },
  { name: 'B', x: 0.05, y: 1 },
  { name: 'C', x: 0.95, y: 1 },
  { name: 'D', x: 0.5, y: 0.4 },
  { name: 'E', x: 0.34, y: 0.76 },
  { name: 'F', x: 0.66, y: 0.76 },
];
const PRISM_E = ['AB', 'BC', 'CA', 'DE', 'EF', 'FD', 'AD', 'BE', 'CF'].map((p) => ({
  from: p[0]!,
  to: p[1]!,
}));

const planar = demo({
  id: 'g.he-graph-planar',
  title: 'Graph: degrees and faces',
  use: 'Use this for “A connected planar graph has 6 vertices and 9 edges. How many faces?”',
  assumptions: [
    'The graph is simple (no loops or repeated edges), connected and drawn with no crossings.',
    'Faces include the outer, unbounded one.',
    'For V ≥ 3, a simple planar graph has at most 3V − 6 edges.',
  ],
  variables: planarVars(),
  rules: planarRules(),
  limits: [planarLimit],
  example: { V: 6, E: 9, sum: 18, avg: 3, F: 5 },
  startWith: ['V', 'E'],
  representation: {
    kind: 'graph',
    vertices: PRISM_V,
    edges: PRISM_E,
    V: 'V',
    E: 'E',
    degreeSum: 'sum',
    average: 'avg',
    F: 'F',
    degrees: true,
  },
});

// The edge: as many edges as a planar graph on 7 vertices can have, 3V − 6 = 15.
const planarMax = demo({
  id: 'g.he-graph-planar-max',
  title: 'Graph: the most edges a planar graph can have',
  use: 'Use this for “Can a planar graph with 7 vertices have 15 edges? How many faces then?”',
  assumptions: [
    'The graph is simple, connected and drawn with no crossings.',
    'At 3V − 6 edges every face, the outer one too, is a triangle.',
  ],
  variables: planarVars(),
  rules: planarRules(),
  limits: [planarLimit],
  example: { V: 7, E: 15, sum: 30, avg: 30 / 7, F: 10 },
  startWith: ['V', 'E'],
  representation: {
    kind: 'graph',
    V: 'V',
    E: 'E',
    degreeSum: 'sum',
    average: 'avg',
    F: 'F',
    degrees: true,
  },
});

// ─── HC50: data-structures#1, a binary tree's height ─────────────────────────

const treeVars = () => [
  count('n', 'n', 'Nodes', 1, 1000000),
  vr('hmin', 'h_min', 'Least height', undefined, 0, 20, { integer: true, derived: true }),
  count('h', 'h', 'Height', 0, 20),
  count('most', 'nodes', 'Most nodes at h', 1, 2097151),
  count('leaves', 'leaves', 'Most leaves at h', 1, 1048576),
];

const treeRules = (): Rule[] => [
  rule(
    'h_min = ⌈log₂(n + 1)⌉ − 1',
    '{hmin} = ⌈ln({n} + 1) ÷ ln(2)⌉ − 1',
    ['hmin', 'n'],
    (x) => x.hmin! - (Math.ceil(Math.log2(x.n! + 1) - 1e-12) - 1),
    {
      hmin: [
        (x) => Math.ceil(Math.log2(x.n! + 1) - 1e-12) - 1,
        '⌈ln({n} + 1) ÷ ln(2)⌉ − 1',
        'Filled level by level, a tree of height h holds up to 2^(h + 1) − 1 nodes.',
      ],
    },
  ),
  rule(
    'most nodes = 2^(h + 1) − 1',
    '{most} = 2^({h} + 1) − 1',
    ['most', 'h'],
    (x) => x.most! - (2 ** (x.h! + 1) - 1),
    {
      most: [
        (x) => 2 ** (x.h! + 1) - 1,
        '2^({h} + 1) − 1',
        'Levels 0 to h hold 1 + 2 + 4 + … + 2^h nodes.',
      ],
      h: [(x) => Math.log2(x.most! + 1) - 1, 'ln({most} + 1) ÷ ln(2) − 1', 'Undo the power of 2.'],
    },
  ),
  rule('most leaves = 2^h', '{leaves} = 2^{h}', ['leaves', 'h'], (x) => x.leaves! - 2 ** x.h!, {
    leaves: [(x) => 2 ** x.h!, '2^{h}', 'The last level doubles h times from the root.'],
    h: [(x) => Math.log2(x.leaves!), 'ln({leaves}) ÷ ln(2)', 'Undo the power of 2.'],
  }),
];

/** The room at a height h is a second question beside the least height for n nodes. */
const TREE_STANDALONE = {
  vars: ['h', 'most', 'leaves'],
  why: 'The room at a height h (its most nodes and leaves) is asked beside the least height for n nodes.',
};

const treeSpec: GraphSpec = {
  kind: 'graph',
  mode: 'tree',
  n: 'n',
  hmin: 'hmin',
  h: 'h',
  most: 'most',
  leaves: 'leaves',
};

const binaryTree = demo({
  id: 'g.he-graph-tree',
  title: 'Graph: a binary tree’s least height',
  use: 'Use this for “What is the least height of a binary tree with 100 nodes?”',
  assumptions: [
    'Height counts edges from the root: a single node has height 0.',
    'The least height comes from filling every level before starting the next.',
  ],
  variables: treeVars(),
  rules: treeRules(),
  standalone: TREE_STANDALONE,
  example: { n: 100, hmin: 6, h: 6, most: 127, leaves: 64 },
  startWith: ['n', 'h'],
  representation: treeSpec,
});

// The edge: a full tree, every level filled (127 = 2⁷ − 1 nodes).
const fullTree = demo({
  id: 'g.he-graph-tree-full',
  title: 'Graph: a full binary tree',
  use: 'Use this for “How many nodes does a full binary tree of height 6 hold?”',
  assumptions: [
    'Height counts edges from the root: a single node has height 0.',
    'A full tree fills its last level too.',
  ],
  variables: treeVars(),
  rules: treeRules(),
  standalone: TREE_STANDALONE,
  example: { n: 127, hmin: 6, h: 6, most: 127, leaves: 64 },
  startWith: ['n', 'h'],
  representation: treeSpec,
});

// ─── HC50: communication-systems#3~code-length, a prefix code ─────────────────

const codeVars = () => [
  ...[1, 2, 3, 4].map((i) => count(`l${i}`, `l${'₁₂₃₄'[i - 1]}`, `Length of symbol ${i}`, 1, 8)),
  ...[1, 2, 3, 4].map((i) =>
    vr(`p${i}`, `p${'₁₂₃₄'[i - 1]}`, `Probability of symbol ${i}`, undefined, 0, 1, {
      step: 0.001,
    }),
  ),
  vr('L', 'L', 'Average length', 'bits', 0, 8, { step: 0.001 }),
  vr('K', 'K', 'Kraft sum', undefined, 0, 2, { step: 0.0001 }),
];

const codeRules = (): Rule[] => [
  rule(
    'L = Σ pᵢlᵢ',
    '{L} = {p1} × {l1} + {p2} × {l2} + {p3} × {l3} + {p4} × {l4}',
    ['L', 'p1', 'l1', 'p2', 'l2', 'p3', 'l3', 'p4', 'l4'],
    (x) => x.L! - (x.p1! * x.l1! + x.p2! * x.l2! + x.p3! * x.l3! + x.p4! * x.l4!),
    {
      L: [
        (x) => x.p1! * x.l1! + x.p2! * x.l2! + x.p3! * x.l3! + x.p4! * x.l4!,
        '{p1} × {l1} + {p2} × {l2} + {p3} × {l3} + {p4} × {l4}',
        'Each codeword’s length, weighted by how often it is sent.',
      ],
    },
  ),
  rule(
    'K = Σ 2^(−lᵢ)',
    '{K} = 2^(−{l1}) + 2^(−{l2}) + 2^(−{l3}) + 2^(−{l4})',
    ['K', 'l1', 'l2', 'l3', 'l4'],
    (x) => x.K! - (2 ** -x.l1! + 2 ** -x.l2! + 2 ** -x.l3! + 2 ** -x.l4!),
    {
      K: [
        (x) => 2 ** -x.l1! + 2 ** -x.l2! + 2 ** -x.l3! + 2 ** -x.l4!,
        '2^(−{l1}) + 2^(−{l2}) + 2^(−{l3}) + 2^(−{l4})',
        'A codeword of length l uses up 2^(−l) of the tree.',
      ],
    },
  ),
];

const kraftLimit = limit(
  'the Kraft sum is at most 1',
  '{K} ≤ 1',
  ['K'],
  (x) => x.K! <= 1 + 1e-9,
  'No prefix code has these lengths: the Kraft sum is past 1.',
);

const codeSpec: GraphSpec = {
  kind: 'graph',
  mode: 'code',
  lengths: ['l1', 'l2', 'l3', 'l4'],
  probs: ['p1', 'p2', 'p3', 'p4'],
  names: ['A', 'B', 'C', 'D'],
  L: 'L',
  kraft: 'K',
};

const codeTree = demo({
  id: 'g.he-graph-code-tree',
  title: 'Graph: a prefix code tree',
  use: 'Use this for “Codewords of lengths 1, 2, 3 and 3 bits are sent with probabilities 1/2, 1/4, 1/8 and 1/8. Find the average length.”',
  assumptions: [
    'A prefix code: no codeword starts another, so each symbol is a leaf.',
    'Lengths fit a prefix code exactly when the Kraft sum is at most 1.',
  ],
  variables: codeVars(),
  rules: codeRules(),
  limits: [kraftLimit],
  example: { l1: 1, l2: 2, l3: 3, l4: 3, p1: 0.5, p2: 0.25, p3: 0.125, p4: 0.125, L: 1.75, K: 1 },
  startWith: ['l1', 'l2', 'l3', 'l4', 'p1', 'p2', 'p3', 'p4'],
  representation: codeSpec,
});

// The edge: a Kraft sum below 1, so one branch is left unused.
const codeTreeSpare = demo({
  id: 'g.he-graph-code-tree-unused',
  title: 'Graph: a prefix code with a branch to spare',
  use: 'Use this for “Codewords of lengths 1, 2, 3 and 4 bits: is it a prefix code, and what is its average length?”',
  assumptions: [
    'A prefix code: no codeword starts another, so each symbol is a leaf.',
    'A Kraft sum below 1 leaves a branch unused: a shorter code exists.',
  ],
  variables: codeVars(),
  rules: codeRules(),
  limits: [kraftLimit],
  example: { l1: 1, l2: 2, l3: 3, l4: 4, p1: 0.5, p2: 0.25, p3: 0.15, p4: 0.1, L: 1.85, K: 0.9375 },
  startWith: ['l1', 'l2', 'l3', 'l4', 'p1', 'p2', 'p3', 'p4'],
  representation: codeSpec,
});

// ─── HC50: networks#2, a distance-vector update ───────────────────────────────

const routing = demo({
  id: 'g.he-graph-routing',
  title: 'Graph: a distance-vector update',
  use: 'Use this for “Router X’s links cost 2, 7, 4 to A, B, C, which report distances 6, 3, 5. Find X’s distance.”',
  assumptions: [
    'Each neighbour reports its own distance to the destination Z (dashed).',
    'X takes the cheapest link cost plus reported distance (Bellman–Ford).',
  ],
  variables: [
    vr('cA', 'c_A', 'Link cost to A', undefined, 0.1, 1000, { step: 1 }),
    vr('cB', 'c_B', 'Link cost to B', undefined, 0.1, 1000, { step: 1 }),
    vr('cC', 'c_C', 'Link cost to C', undefined, 0.1, 1000, { step: 1 }),
    vr('DA', 'D_A', 'A’s distance to Z', undefined, 0, 1000, { step: 1 }),
    vr('DB', 'D_B', 'B’s distance to Z', undefined, 0, 1000, { step: 1 }),
    vr('DC', 'D_C', 'C’s distance to Z', undefined, 0, 1000, { step: 1 }),
    vr('D', 'D', 'X’s distance to Z', undefined, 0, 2000, { step: 1, derived: true }),
  ],
  rules: [
    rule(
      'D = min(c_A + D_A, c_B + D_B, c_C + D_C)',
      '{D} = min({cA} + {DA}, {cB} + {DB}, {cC} + {DC})',
      ['D', 'cA', 'DA', 'cB', 'DB', 'cC', 'DC'],
      (x) => x.D! - Math.min(x.cA! + x.DA!, x.cB! + x.DB!, x.cC! + x.DC!),
      {
        D: [
          (x) => Math.min(x.cA! + x.DA!, x.cB! + x.DB!, x.cC! + x.DC!),
          'min({cA} + {DA}, {cB} + {DB}, {cC} + {DC})',
          'Each route is a link cost plus that neighbour’s distance; take the cheapest.',
        ],
      },
    ),
  ],
  example: { cA: 2, cB: 7, cC: 4, DA: 6, DB: 3, DC: 5, D: 8 },
  startWith: ['cA', 'cB', 'cC', 'DA', 'DB', 'DC'],
  representation: {
    kind: 'graph',
    vertices: [
      { name: 'X', x: 0, y: 0.5 },
      { name: 'A', x: 0.5, y: 0 },
      { name: 'B', x: 0.5, y: 0.5 },
      { name: 'C', x: 0.5, y: 1 },
      { name: 'Z', x: 1, y: 0.5 },
    ],
    edges: [
      { from: 'X', to: 'A', cost: 'cA' },
      { from: 'X', to: 'B', cost: 'cB' },
      { from: 'X', to: 'C', cost: 'cC' },
      { from: 'A', to: 'Z', cost: 'DA', dashed: true },
      { from: 'B', to: 'Z', cost: 'DB', dashed: true },
      { from: 'C', to: 'Z', cost: 'DC', dashed: true },
    ],
    best: { from: 'X', to: 'Z', cost: 'D' },
  },
});

// ─── HC50: networks#2~dijkstra (graph cards on a sequence) ────────────────────

const DJ_V = [
  { name: 'S', x: 0, y: 0.5 },
  { name: 'A', x: 0.33, y: 0 },
  { name: 'B', x: 0.33, y: 1 },
  { name: 'C', x: 0.67, y: 0 },
  { name: 'D', x: 1, y: 0.5 },
];
const DJ_E: [string, string, number][] = [
  ['S', 'A', 1],
  ['S', 'B', 4],
  ['A', 'B', 2],
  ['A', 'C', 5],
  ['B', 'C', 1],
  ['C', 'D', 3],
  ['B', 'D', 6],
];
/** The graph with `v` lit and the edge that reached it (from `via`) lit. */
const djCard = (v: string, via?: string) => ({
  kind: 'graph' as const,
  wide: true,
  vertices: DJ_V,
  edges: DJ_E.map(([from, to, cost]) => ({
    from,
    to,
    cost,
    ...(via && ((from === via && to === v) || (from === v && to === via)) ? { lit: true } : {}),
  })),
  lit: [v],
});

const dijkstraStages: LayoutDef = {
  kind: 'sequence',
  id: 'g.he-graph-dijkstra',
  title: 'Dijkstra’s order',
  use: 'Use this for “In what order does Dijkstra’s algorithm finalise the routers from S?”',
  assumptions: [
    'Each step finalises the unvisited router with the smallest distance so far.',
    'A router’s distance is the one it was reached at, through the lit link.',
  ],
  question: 'Put the routers in the order Dijkstra’s algorithm finalises them.',
  stages: [
    { label: 'S at 0, the start', span: 0, figure: djCard('S') },
    { label: 'A at 1, from S', span: 1, figure: djCard('A', 'S') },
    { label: 'B at 3, through A', span: 2, figure: djCard('B', 'A') },
    { label: 'C at 4, through B', span: 1, figure: djCard('C', 'B') },
    { label: 'D at 7, through C', span: 3, figure: djCard('D', 'C') },
  ],
  unit: 'cost',
  totalLabel: 'Distance to D',
};

// ─── HC50: discrete-math#3~euler (graph cards on a sort) ──────────────────────

const g = (pts: [string, number, number][], edges: string[]) => ({
  kind: 'graph' as const,
  degrees: true,
  vertices: pts.map(([name, x, y]) => ({ name, x, y })),
  edges: edges.map((e) => ({ from: e[0]!, to: e[1]! })),
});
const SQUARE: [string, number, number][] = [
  ['a', 0, 0],
  ['b', 1, 0],
  ['c', 1, 1],
  ['d', 0, 1],
];

const eulerCards: LayoutDef = {
  kind: 'sort',
  id: 'g.he-graph-card-euler',
  title: 'Euler circuit, Euler path or neither',
  use: 'Use this for “A connected graph has degrees 3, 3, 2, 2. Does it have an Euler path?”',
  assumptions: [
    'Each graph is connected; each vertex shows its degree.',
    'An Euler path uses every edge once; a circuit also ends where it starts.',
  ],
  question: 'Count the odd degrees: which does the graph have?',
  bins: [
    { id: 'circuit', label: 'Euler circuit', why: 'No odd degrees: every visit in has a way out.' },
    {
      id: 'path',
      label: 'Euler path, no circuit',
      why: 'Two odd degrees: start at one, end at the other.',
    },
    { id: 'neither', label: 'Neither', why: 'More than two odd degrees: some edge is left over.' },
  ],
  cards: [
    { label: 'Degrees 2, 2, 2, 2', bin: 'circuit', figure: g(SQUARE, ['ab', 'bc', 'cd', 'da']) },
    {
      label: 'Degrees 4, 2, 2, 2, 2',
      bin: 'circuit',
      figure: g(
        [
          ['m', 0.5, 0.5],
          ['a', 0, 0],
          ['b', 0, 1],
          ['c', 1, 0],
          ['d', 1, 1],
        ],
        ['ma', 'mb', 'ab', 'mc', 'md', 'cd'],
      ),
    },
    { label: 'Degrees 3, 3, 2, 2', bin: 'path', figure: g(SQUARE, ['ab', 'bc', 'cd', 'da', 'ac']) },
    {
      label: 'Degrees 1, 1, 2, 2',
      bin: 'path',
      figure: g(
        [
          ['a', 0, 1],
          ['b', 0.33, 0],
          ['c', 0.67, 1],
          ['d', 1, 0],
        ],
        ['ab', 'bc', 'cd'],
      ),
    },
    {
      label: 'Degrees 3, 3, 3, 3',
      bin: 'neither',
      figure: g(
        [
          ['a', 0.5, 0],
          ['b', 0, 1],
          ['c', 1, 1],
          ['d', 0.5, 0.62],
        ],
        ['ab', 'bc', 'ca', 'da', 'db', 'dc'],
      ),
    },
    {
      label: 'Degrees 3, 1, 1, 1',
      bin: 'neither',
      figure: g(
        [
          ['m', 0.5, 0.55],
          ['a', 0.5, 0],
          ['b', 0, 1],
          ['c', 1, 1],
        ],
        ['ma', 'mb', 'mc'],
      ),
    },
  ],
};

// ─── HC51: embedded-systems#3, rate-monotonic and EDF ─────────────────────────

const msVar = (id: string, symbol: string, name: string, more: Partial<VariableDef> = {}) =>
  vr(id, symbol, name, 'ms', 0.001, 100000, { step: 0.1, units: ['ms'], ...more });

const SUB = '₁₂₃';
const taskVars = (n: number) =>
  Array.from({ length: n }, (_, i) => [
    msVar(`C${i + 1}`, `C${SUB[i]}`, `Run time of task ${i + 1}`),
    msVar(`T${i + 1}`, `T${SUB[i]}`, `Period of task ${i + 1}`),
  ]).flat();

/** U = Σ Cᵢ ÷ Tᵢ, solved for U or the last task's C. */
const utilRule = (n: number): Rule => {
  const idx = Array.from({ length: n }, (_, i) => i + 1);
  const sum = (x: Values, skip = 0) =>
    idx.filter((i) => i !== skip).reduce((a, i) => a + x[`C${i}`]! / x[`T${i}`]!, 0);
  const terms = (skip = 0) =>
    idx
      .filter((i) => i !== skip)
      .map((i) => `{C${i}} ÷ {T${i}}`)
      .join(' + ');
  return rule(
    'U = Σ Cᵢ ÷ Tᵢ',
    `{U} = ${terms()}`,
    ['U', ...idx.flatMap((i) => [`C${i}`, `T${i}`])],
    (x) => x.U! - sum(x),
    {
      U: [
        (x) => sum(x),
        terms(),
        'Each task’s share of the processor: its run time over its period.',
      ],
      [`C${n}`]: [
        (x) => (x.U! - sum(x, n)) * x[`T${n}`]!,
        `({U} − ${terms(n)}) × {T${n}}`,
        'What the other tasks leave of U, times the last period.',
      ],
    },
  );
};

const runsInPeriod = (n: number) =>
  limit(
    'each task runs within its period',
    Array.from({ length: n }, (_, i) => `{C${i + 1}} ≤ {T${i + 1}}`).join(', '),
    Array.from({ length: n }, (_, i) => [`C${i + 1}`, `T${i + 1}`]).flat(),
    (x) => Array.from({ length: n }, (_, i) => i + 1).every((i) => x[`C${i}`]! <= x[`T${i}`]!),
    'A task can’t run longer than its period.',
  );

const tasksOf = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ name: `τ${SUB[i]}`, C: `C${i + 1}`, T: `T${i + 1}` }));

const RM_ASSUME = [
  'Independent periodic tasks; each deadline is the next release.',
  'Rate-monotonic: the shorter period has the higher priority and preempts at once.',
];

const rm = demo({
  id: 'g.he-schedule-chart-rm',
  title: 'Schedule: rate-monotonic tasks',
  use: 'Use this for “Can tasks (C, T) = (1, 4), (2, 8), (3, 12) ms be scheduled rate-monotonically?”',
  assumptions: [
    ...RM_ASSUME,
    'U ≤ n(2^(1/n) − 1), 0.780 for 3 tasks, guarantees it; above that, try the response times.',
  ],
  variables: [...taskVars(3), vr('U', 'U', 'Utilization', undefined, 0, 3, { step: 0.001 })],
  rules: [utilRule(3)],
  limits: [runsInPeriod(3)],
  example: { C1: 1, T1: 4, C2: 2, T2: 8, C3: 3, T3: 12, U: 0.75 },
  startWith: ['C1', 'T1', 'C2', 'T2', 'C3', 'T3'],
  representation: { kind: 'scheduleChart', policy: 'rm', tasks: tasksOf(3), U: 'U' },
});

// The edge: two tasks above the 2-task bound (0.828), where rate-monotonic misses a deadline.
const rmMiss = demo({
  id: 'g.he-schedule-chart-rm-miss',
  title: 'Schedule: a rate-monotonic miss',
  use: 'Use this for “Tasks (2, 5) and (4, 7) ms: does rate-monotonic meet every deadline?”',
  assumptions: [
    ...RM_ASSUME,
    'U = 0.971 is above the 2-task bound 0.828, so nothing is promised: here τ₂ misses.',
  ],
  variables: [...taskVars(2), vr('U', 'U', 'Utilization', undefined, 0, 2, { step: 0.001 })],
  rules: [utilRule(2)],
  limits: [runsInPeriod(2)],
  example: { C1: 2, T1: 5, C2: 4, T2: 7, U: 2 / 5 + 4 / 7 },
  startWith: ['C1', 'T1', 'C2', 'T2'],
  representation: {
    kind: 'scheduleChart',
    policy: 'rm',
    tasks: tasksOf(2),
    U: 'U',
    misses: true,
  },
});

// ─── HC51: embedded-systems#3~response-time ───────────────────────────────────

/** k = ⌈R ÷ T⌉: how many of a higher task's jobs start within R. */
const ceilRule = (k: string, T: string): Rule =>
  rule(
    `${k} = ⌈R₃ ÷ ${T}⌉`,
    `{${k}} = ⌈{R3} ÷ {${T}}⌉`,
    [k, 'R3', T],
    (x) => x[k]! - Math.ceil(x.R3! / x[T]! - 1e-9),
    {
      [k]: [
        (x) => Math.ceil(x.R3! / x[T]! - 1e-9),
        `⌈{R3} ÷ {${T}}⌉`,
        'Count the higher task’s releases from 0 up to R₃.',
      ],
      R3: [() => undefined, '', ''],
      [T]: [() => undefined, '', ''],
    },
  );

const response = demo({
  id: 'g.he-schedule-chart-response',
  title: 'Schedule: a worst-case response time',
  use: 'Use this for “Find the worst-case response time of task 3 in (1, 4), (2, 8), (3, 12) ms.”',
  assumptions: [
    ...RM_ASSUME,
    'All tasks are released together at 0, the worst case for task 3.',
    'R = C₃ + Σ ⌈R ÷ Tⱼ⌉Cⱼ from R = ΣC = 6: ⌈6/4⌉ = 2, ⌈6/8⌉ = 1 give 7, and 7 gives 7 again.',
  ],
  variables: [
    ...taskVars(3),
    vr('k1', 'k₁', 'Runs of task 1 within R₃', undefined, 0, 1000, { integer: true }),
    vr('k2', 'k₂', 'Runs of task 2 within R₃', undefined, 0, 1000, { integer: true }),
    msVar('R3', 'R₃', 'Response time of task 3'),
  ],
  rules: [
    rule(
      'R₃ = C₃ + k₁C₁ + k₂C₂',
      '{R3} = {C3} + {k1} × {C1} + {k2} × {C2}',
      ['R3', 'C3', 'k1', 'C1', 'k2', 'C2'],
      (x) => x.R3! - x.C3! - x.k1! * x.C1! - x.k2! * x.C2!,
      {
        R3: [
          (x) => x.C3! + x.k1! * x.C1! + x.k2! * x.C2!,
          '{C3} + {k1} × {C1} + {k2} × {C2}',
          'Task 3’s own run plus every higher job that preempts it.',
        ],
        C3: [
          (x) => x.R3! - x.k1! * x.C1! - x.k2! * x.C2!,
          '{R3} − {k1} × {C1} − {k2} × {C2}',
          'Take the higher tasks’ runs from the response time.',
        ],
      },
    ),
    ceilRule('k1', 'T1'),
    ceilRule('k2', 'T2'),
  ],
  limits: [
    limit(
      'task 3 meets its deadline',
      '{R3} ≤ {T3}',
      ['R3', 'T3'],
      (x) => x.R3! <= x.T3! + 1e-9,
      'Task 3 ends after its deadline: the set is not schedulable.',
    ),
    limit(
      'the tasks are listed by priority',
      '{T1} ≤ {T2} ≤ {T3}',
      ['T1', 'T2', 'T3'],
      (x) => x.T1! <= x.T2! && x.T2! <= x.T3!,
      'List the tasks shortest period first: task 3 must have the lowest priority.',
    ),
  ],
  example: { C1: 1, T1: 4, C2: 2, T2: 8, C3: 3, T3: 12, k1: 2, k2: 1, R3: 7 },
  startWith: ['C1', 'T1', 'C2', 'T2', 'C3', 'T3', 'k1', 'k2'],
  representation: {
    kind: 'scheduleChart',
    policy: 'rm',
    tasks: tasksOf(3),
    response: { task: 2, value: 'R3' },
  },
});

// ─── HC51: embedded-systems#3~edf ─────────────────────────────────────────────

const edf = demo({
  id: 'g.he-schedule-chart-edf',
  title: 'Schedule: earliest deadline first',
  use: 'Use this for “Tasks (2, 5), (2, 7), (1, 10) ms: can EDF schedule them? Can rate-monotonic promise to?”',
  assumptions: [
    'Independent periodic tasks; each deadline is the next release.',
    'EDF runs the job whose deadline is nearest, so any set with U ≤ 1 is schedulable.',
    'U = 0.786 is above the 3-task rate-monotonic bound 0.780: no promise there.',
  ],
  variables: [...taskVars(3), vr('U', 'U', 'Utilization', undefined, 0, 3, { step: 0.001 })],
  rules: [utilRule(3)],
  limits: [
    runsInPeriod(3),
    limit(
      'U ≤ 1',
      '{U} ≤ 1',
      ['U'],
      (x) => x.U! <= 1 + 1e-9,
      'Above U = 1 no schedule meets every deadline.',
    ),
  ],
  example: { C1: 2, T1: 5, C2: 2, T2: 7, C3: 1, T3: 10, U: 2 / 5 + 2 / 7 + 1 / 10 },
  startWith: ['C1', 'T1', 'C2', 'T2', 'C3', 'T3'],
  representation: { kind: 'scheduleChart', policy: 'edf', tasks: tasksOf(3), U: 'U' },
});

// ─── HC51: operating-systems#1, FCFS and SJF ──────────────────────────────────

const B = ['b1', 'b2', 'b3', 'b4'];
const fcfsWait = (x: Values) => (3 * x.b1! + 2 * x.b2! + x.b3!) / 4;
/** The bursts' ids, shortest first (ties in arrival order). */
const sjfOrder = (x: Values) => [...B].sort((a, b) => x[a]! - x[b]! || B.indexOf(a) - B.indexOf(b));
const sjfWait = (x: Values) => {
  const o = sjfOrder(x);
  return (3 * x[o[0]!]! + 2 * x[o[1]!]! + x[o[2]!]!) / 4;
};
const meanBurst = '({b1} + {b2} + {b3} + {b4}) ÷ 4';

const fcfsSjf = demo({
  id: 'g.he-schedule-chart-fcfs-sjf',
  title: 'Schedule: FCFS and SJF',
  use: 'Use this for “Four jobs of 10, 4, 2 and 6 ms arrive together. Compare FCFS and SJF waiting times.”',
  assumptions: [
    'All four jobs arrive at 0, in the order 1, 2, 3, 4; no I/O.',
    'A job waits for every job run before it; a tie in SJF keeps the arrival order.',
    'Turnaround is the wait plus the job’s own burst.',
  ],
  variables: [
    ...B.map((b, i) => msVar(b, `b${'₁₂₃₄'[i]}`, `Burst of job ${i + 1}`)),
    msVar('Wf', 'W_FCFS', 'FCFS average wait', { derived: true, min: 0 }),
    msVar('Tf', 'T_FCFS', 'FCFS average turnaround', { derived: true }),
    msVar('Ws', 'W_SJF', 'SJF average wait', { derived: true, min: 0 }),
    msVar('Ts', 'T_SJF', 'SJF average turnaround', { derived: true }),
  ],
  rules: [
    rule(
      'FCFS wait',
      '{Wf} = (3 × {b1} + 2 × {b2} + {b3}) ÷ 4',
      ['Wf', 'b1', 'b2', 'b3'],
      (x) => x.Wf! - fcfsWait(x),
      {
        Wf: [
          fcfsWait,
          '(3 × {b1} + 2 × {b2} + {b3}) ÷ 4',
          'Job 1 waits 0, job 2 waits b₁, job 3 b₁ + b₂, job 4 b₁ + b₂ + b₃: the average.',
        ],
      },
    ),
    rule(
      'FCFS turnaround',
      '{Tf} = {Wf} + ({b1} + {b2} + {b3} + {b4}) ÷ 4',
      ['Tf', 'Wf', ...B],
      (x) => x.Tf! - x.Wf! - (x.b1! + x.b2! + x.b3! + x.b4!) / 4,
      {
        Tf: [
          (x) => x.Wf! + (x.b1! + x.b2! + x.b3! + x.b4!) / 4,
          `{Wf} + ${meanBurst}`,
          'Each turnaround is a wait plus a burst, so the averages add.',
        ],
      },
    ),
    rule(
      'SJF wait',
      '{Ws} = the SJF average wait of {b1}, {b2}, {b3}, {b4}',
      ['Ws', ...B],
      (x) => x.Ws! - sjfWait(x),
      {
        Ws: [
          sjfWait,
          (x: Values) => {
            const o = sjfOrder(x);
            return `(3 × {${o[0]}} + 2 × {${o[1]}} + {${o[2]}}) ÷ 4`;
          },
          'Shortest first: the shortest burst is waited for three times, the next twice, then once.',
        ],
      },
    ),
    rule(
      'SJF turnaround',
      '{Ts} = {Ws} + ({b1} + {b2} + {b3} + {b4}) ÷ 4',
      ['Ts', 'Ws', ...B],
      (x) => x.Ts! - x.Ws! - (x.b1! + x.b2! + x.b3! + x.b4!) / 4,
      {
        Ts: [
          (x) => x.Ws! + (x.b1! + x.b2! + x.b3! + x.b4!) / 4,
          `{Ws} + ${meanBurst}`,
          'Each turnaround is a wait plus a burst, so the averages add.',
        ],
      },
    ),
  ],
  example: { b1: 10, b2: 4, b3: 2, b4: 6, Wf: 10, Tf: 15.5, Ws: 5, Ts: 10.5 },
  startWith: B,
  representation: {
    kind: 'scheduleChart',
    policy: 'jobs',
    tasks: B.map((b, i) => ({ name: `J${'₁₂₃₄'[i]}`, C: b })),
    runs: [
      { policy: 'fcfs', wait: 'Wf', turnaround: 'Tf' },
      { policy: 'sjf', wait: 'Ws', turnaround: 'Ts' },
    ],
  },
});

// ─── HC51: operating-systems#1~round-robin ────────────────────────────────────

const RR = ['bA', 'bB', 'bC'];
const rrWaits = (x: Values) =>
  jobOrder(
    RR.map((b) => x[b]!),
    'rr',
    x.q!,
  ).waits;

const roundRobin = demo({
  id: 'g.he-schedule-chart-round-robin',
  title: 'Schedule: round robin',
  use: 'Use this for “Jobs A, B, C of 5, 3 and 1 ms share the processor with a 2 ms quantum. Find the average wait.”',
  assumptions: [
    'All three jobs arrive at 0 in the order A, B, C.',
    'Each runs at most one quantum, then goes to the back of the queue.',
    'A job’s wait is its finish time less its burst.',
  ],
  variables: [
    ...RR.map((b, i) =>
      msVar(b, `b${'ABC'[i]}`, `Burst of job ${'ABC'[i]}`, { min: 0.1, max: 100 }),
    ),
    msVar('q', 'q', 'Quantum', { min: 0.5, max: 100 }),
    msVar('W', 'W', 'Average wait', { derived: true, min: 0 }),
  ],
  rules: [
    rule(
      'round-robin wait',
      '{W} = the round-robin average wait of {bA}, {bB}, {bC} with quantum {q}',
      ['W', ...RR, 'q'],
      (x) => x.W! - rrWaits(x).reduce((a, b) => a + b, 0) / 3,
      {
        W: [
          (x) => rrWaits(x).reduce((a, b) => a + b, 0) / 3,
          (x: Values) =>
            `(${rrWaits(x)
              .map((w) => Number(w.toFixed(4)))
              .join(' + ')}) ÷ 3`,
          'Run the queue a quantum at a time; each wait is the finish time less the burst.',
        ],
      },
    ),
  ],
  example: { bA: 5, bB: 3, bC: 1, q: 2, W: 13 / 3 },
  startWith: ['bA', 'bB', 'bC', 'q'],
  representation: {
    kind: 'scheduleChart',
    policy: 'jobs',
    tasks: RR.map((b, i) => ({ name: 'ABC'[i]!, C: b })),
    quantum: 'q',
    runs: [{ policy: 'rr', wait: 'W' }],
  },
});

// ─── HC64: computer-architecture#0, an instruction format ─────────────────────

const bits = (id: string, symbol: string, name: string, min = 0, max = 64, more = {}) =>
  vr(id, symbol, name, 'bits', min, max, { integer: true, ...more });

const instrVars = () => [
  bits('w', 'w', 'Word size', 16, 64, { allowed: [16, 32, 64] }),
  bits('o', 'o', 'Opcode bits', 1, 16),
  vr('R', 'R', 'Registers', undefined, 8, 64, { allowed: [8, 16, 32, 64] }),
  bits('r', 'r', 'Bits a register field', 3, 6),
  vr('k', 'k', 'Register fields', undefined, 1, 3, { allowed: [1, 2, 3] }),
  bits('f', 'f', 'Function bits', 0, 16),
  bits('i', 'i', 'Immediate bits', 1, 64),
  vr('lo', 'imm_min', 'Smallest immediate', undefined, -9.3e18, 0, { integer: true }),
  vr('hi', 'imm_max', 'Largest immediate', undefined, 0, 9.3e18, { integer: true }),
];

const instrRules = (): Rule[] => [
  rule('r = log₂R', '{r} = log_2({R})', ['r', 'R'], (x) => x.r! - Math.log2(x.R!), {
    r: [(x) => Math.log2(x.R!), 'log_2({R})', 'Each register needs its own pattern of bits.'],
    R: [(x) => 2 ** x.r!, '2^{r}', 'r bits name 2^r registers.'],
  }),
  rule(
    'i = w − o − kr − f',
    '{i} = {w} − {o} − {k} × {r} − {f}',
    ['i', 'w', 'o', 'k', 'r', 'f'],
    (x) => x.i! - (x.w! - x.o! - x.k! * x.r! - x.f!),
    {
      i: [
        (x) => x.w! - x.o! - x.k! * x.r! - x.f!,
        '{w} − {o} − {k} × {r} − {f}',
        'The immediate gets the bits the other fields leave.',
      ],
      o: [
        (x) => x.w! - x.i! - x.k! * x.r! - x.f!,
        '{w} − {i} − {k} × {r} − {f}',
        'The opcode gets the bits the other fields leave.',
      ],
      f: [
        (x) => x.w! - x.o! - x.k! * x.r! - x.i!,
        '{w} − {o} − {k} × {r} − {i}',
        'The function field gets the bits the others leave.',
      ],
    },
  ),
  rule(
    'smallest = −2^(i − 1)',
    '{lo} = −2^({i} − 1)',
    ['lo', 'i'],
    (x) => x.lo! + 2 ** (x.i! - 1),
    {
      lo: [
        (x) => -(2 ** (x.i! - 1)),
        '−2^({i} − 1)',
        'In two’s complement the top bit weighs −2^(i − 1).',
      ],
    },
  ),
  rule(
    'largest = 2^(i − 1) − 1',
    '{hi} = 2^({i} − 1) − 1',
    ['hi', 'i'],
    (x) => x.hi! - 2 ** (x.i! - 1) + 1,
    {
      hi: [(x) => 2 ** (x.i! - 1) - 1, '2^({i} − 1) − 1', 'All the bits but the sign bit set.'],
      i: [(x) => Math.log2(x.hi! + 1) + 1, 'ln({hi} + 1) ÷ ln(2) + 1', 'Undo the power of 2.'],
    },
  ),
];

const instrLimit = limit(
  'the fields fit the word',
  '{i} ≥ 1',
  ['i'],
  (x) => x.i! >= 1,
  'The other fields take the whole word: no bits are left for an immediate.',
);

const instrSpec: BitFieldsSpec = {
  kind: 'bitFields',
  word: 'w',
  fields: [
    { name: 'imm', bits: 'i' },
    { name: 'rs2', bits: 'r', when: { count: 'k', nth: 3 } },
    { name: 'rs1', bits: 'r', when: { count: 'k', nth: 1 } },
    { name: 'funct', bits: 'f' },
    { name: 'rd', bits: 'r', when: { count: 'k', nth: 2 } },
    { name: 'opcode', bits: 'o' },
  ],
  more: ['lo', 'hi'],
};

const instruction = demo({
  id: 'g.he-bit-fields-instruction',
  title: 'Bit fields: an instruction format',
  use: 'Use this for “A 32-bit instruction has a 7-bit opcode, two 5-bit register fields and a 3-bit funct. What immediates fit?”',
  assumptions: [
    'RISC-V I-type order: imm, rs1, funct3, rd, opcode (bit 31 on the left).',
    'The immediate is a two’s complement number.',
  ],
  variables: instrVars(),
  rules: instrRules(),
  limits: [instrLimit],
  example: { w: 32, o: 7, R: 32, r: 5, k: 2, f: 3, i: 12, lo: -2048, hi: 2047 },
  startWith: ['w', 'o', 'R', 'k', 'f'],
  representation: instrSpec,
});

// The edge: three register fields leave 7 bits, the R-type's funct7 place.
const instructionR = demo({
  id: 'g.he-bit-fields-instruction-r',
  title: 'Bit fields: three register fields',
  use: 'Use this for “With three 5-bit register fields, a 7-bit opcode and a 3-bit funct, how many bits are left in a 32-bit instruction?”',
  assumptions: [
    'RISC-V order: the leftover bits, rs2, rs1, funct3, rd, opcode (bit 31 on the left).',
    'The leftover 7 bits are where R-type keeps funct7.',
  ],
  variables: instrVars(),
  rules: instrRules(),
  limits: [instrLimit],
  example: { w: 32, o: 7, R: 32, r: 5, k: 3, f: 3, i: 7, lo: -64, hi: 63 },
  startWith: ['w', 'o', 'R', 'k', 'f'],
  representation: instrSpec,
});

// ─── HC64: computer-architecture#3, cache address bits ────────────────────────

const cacheVars = () => [
  bits('A', 'A', 'Address bits', 16, 64, { allowed: [16, 32, 48, 64] }),
  vr('C', 'C', 'Cache size', 'KiB', 1, 1048576, { step: 1 }),
  vr('B', 'B', 'Block size', 'B', 4, 4096, {
    allowed: [4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096],
  }),
  vr('wy', 'w', 'Ways', undefined, 1, 16, { allowed: [1, 2, 4, 8, 16] }),
  vr('S', 'S', 'Sets', undefined, 1, 1e9, { integer: true }),
  bits('off', 'offset', 'Offset bits', 0, 12),
  bits('idx', 'index', 'Index bits', 0, 40),
  bits('tag', 'tag', 'Tag bits', 0, 64),
];

const cacheRules = (): Rule[] => [
  rule(
    'S = C ÷ (B × w)',
    '{S} = 1024 × {C} ÷ ({B} × {wy})',
    ['S', 'C', 'B', 'wy'],
    (x) => x.S! * x.B! * x.wy! - 1024 * x.C!,
    {
      S: [
        (x) => (1024 * x.C!) / (x.B! * x.wy!),
        '1024 × {C} ÷ ({B} × {wy})',
        'The cache’s bytes over the bytes a set holds (1024 bytes a KiB).',
      ],
      C: [
        (x) => (x.S! * x.B! * x.wy!) / 1024,
        '{S} × {B} × {wy} ÷ 1024',
        'Sets times ways times block size, in KiB.',
      ],
    },
  ),
  rule('offset = log₂B', '{off} = log_2({B})', ['off', 'B'], (x) => x.off! - Math.log2(x.B!), {
    off: [(x) => Math.log2(x.B!), 'log_2({B})', 'The offset picks one byte of the block.'],
    B: [(x) => 2 ** x.off!, '2^{off}', 'The offset’s bits name every byte of a block.'],
  }),
  rule('index = log₂S', '{idx} = log_2({S})', ['idx', 'S'], (x) => x.idx! - Math.log2(x.S!), {
    idx: [(x) => Math.log2(x.S!), 'log_2({S})', 'The index picks one set.'],
    S: [(x) => 2 ** x.idx!, '2^{idx}', 'The index’s bits name every set.'],
  }),
  sumRule(
    'A = tag + index + offset',
    'A',
    ['tag', 'idx', 'off'],
    'The address splits into tag, index and offset.',
  ),
];

const cacheLimit = limit(
  'the sets are a whole power of 2',
  '{S} is a power of 2',
  ['S'],
  (x) => Number.isInteger(Math.log2(x.S!)),
  'The cache must hold a whole power of 2 of sets.',
);

const cacheSpec: BitFieldsSpec = {
  kind: 'bitFields',
  word: 'A',
  fields: [
    { name: 'tag', bits: 'tag' },
    { name: 'index', bits: 'idx' },
    { name: 'offset', bits: 'off' },
  ],
  more: ['S'],
};

const cache = demo({
  id: 'g.he-bit-fields-cache',
  title: 'Bit fields: a cache address',
  use: 'Use this for “A 32 KiB direct-mapped cache has 64-byte blocks and 32-bit addresses. How many tag bits?”',
  assumptions: [
    'Byte addresses; direct-mapped is 1 way.',
    'The offset picks the byte, the index the set, and the tag is compared in that set.',
  ],
  variables: cacheVars(),
  rules: cacheRules(),
  limits: [cacheLimit],
  example: { A: 32, C: 32, B: 64, wy: 1, S: 512, off: 6, idx: 9, tag: 17 },
  startWith: ['A', 'C', 'B', 'wy'],
  representation: cacheSpec,
});

// The edge: a 64-bit address, too long to write bit by bit: each field is a box.
const cache64 = demo({
  id: 'g.he-bit-fields-cache-64',
  title: 'Bit fields: a 64-bit cache address',
  use: 'Use this for “A 64 KiB 16-way cache with 64-byte blocks takes 64-bit addresses. Split the address.”',
  assumptions: [
    'Byte addresses; a 16-way cache has 16 blocks a set.',
    'More ways mean fewer sets, so fewer index bits and more tag bits.',
  ],
  variables: cacheVars(),
  rules: cacheRules(),
  limits: [cacheLimit],
  example: { A: 64, C: 64, B: 64, wy: 16, S: 64, off: 6, idx: 6, tag: 52 },
  startWith: ['A', 'C', 'B', 'wy'],
  representation: cacheSpec,
});

// ─── HC64: networks#0, header overhead ────────────────────────────────────────

const headersDemo = demo({
  id: 'g.he-bit-fields-headers',
  title: 'Bit fields: headers around a payload',
  use: 'Use this for “What fraction of a full Ethernet frame is application data?”',
  assumptions: [
    'TCP and IP headers without options are 20 bytes each.',
    'Ethernet adds 18 bytes: a 14-byte header and a 4-byte check sequence.',
  ],
  variables: [
    vr('pay', 'payload', 'Payload', 'B', 1, 65535, { step: 1 }),
    vr('tcp', 'TCP', 'TCP header', 'B', 20, 60, { step: 1 }),
    vr('ip', 'IP', 'IP header', 'B', 20, 60, { step: 1 }),
    vr('link', 'link', 'Link overhead', 'B', 1, 100, { step: 1 }),
    vr('frame', 'frame', 'Frame size', 'B', 1, 70000, { step: 1 }),
    vr('eff', 'efficiency', 'Efficiency', '%', 0, 100, { step: 0.1 }),
  ],
  rules: [
    sumRule(
      'frame = payload + TCP + IP + link',
      'frame',
      ['pay', 'tcp', 'ip', 'link'],
      'Each layer adds its header to what it carries.',
    ),
    rule(
      'efficiency = payload ÷ frame',
      '{eff} = 100 × {pay} ÷ {frame}',
      ['eff', 'pay', 'frame'],
      (x) => x.eff! * x.frame! - 100 * x.pay!,
      {
        eff: [
          (x) => (100 * x.pay!) / x.frame!,
          '100 × {pay} ÷ {frame}',
          'The share of the frame that is the application’s data.',
        ],
        pay: [
          (x) => (x.eff! * x.frame!) / 100,
          '{eff} × {frame} ÷ 100',
          'The efficiency’s share of the frame.',
        ],
      },
    ),
  ],
  example: { pay: 1460, tcp: 20, ip: 20, link: 18, frame: 1518, eff: (100 * 1460) / 1518 },
  startWith: ['pay', 'tcp', 'ip', 'link'],
  representation: {
    kind: 'bitFields',
    mode: 'headers',
    payload: 'pay',
    layers: [
      { name: 'TCP', bytes: 'tcp', unit: 'TCP segment' },
      { name: 'IP', bytes: 'ip', unit: 'IP datagram' },
      { name: 'Ethernet', bytes: 'link', unit: 'Ethernet frame' },
    ],
    frame: 'frame',
    efficiency: 'eff',
  },
});

// ─── HC64: networks#1, a subnet ───────────────────────────────────────────────

const subnetVars = () => [
  bits('n', 'n', 'Prefix length', 24, 30),
  vr('block', 'block', 'Block size', undefined, 4, 256, { integer: true }),
  vr('m', 'mask', 'Mask’s last octet', undefined, 0, 252, { integer: true }),
  vr('a', 'a', 'Address’s last octet', undefined, 0, 255, { integer: true }),
  vr('net', 'network', 'Network’s last octet', undefined, 0, 255, { integer: true, derived: true }),
  vr('bc', 'broadcast', 'Broadcast’s last octet', undefined, 0, 255, {
    integer: true,
    derived: true,
  }),
  vr('hosts', 'hosts', 'Usable hosts', undefined, 2, 254, { integer: true }),
];

const subnetRules = (): Rule[] => [
  rule(
    'block = 2^(32 − n)',
    '{block} = 2^(32 − {n})',
    ['block', 'n'],
    (x) => x.block! - 2 ** (32 - x.n!),
    {
      block: [
        (x) => 2 ** (32 - x.n!),
        '2^(32 − {n})',
        'The host bits, 32 − n of them, count the addresses.',
      ],
      n: [
        (x) => 32 - Math.log2(x.block!),
        '32 − log_2({block})',
        'The bits the block takes from 32.',
      ],
    },
  ),
  rule(
    'mask octet = 256 − block',
    '{m} = 256 − {block}',
    ['m', 'block'],
    (x) => x.m! - 256 + x.block!,
    {
      m: [
        (x) => 256 - x.block!,
        '256 − {block}',
        'The mask’s last octet has 1s down to the block.',
      ],
      block: [(x) => 256 - x.m!, '256 − {m}', 'What the mask leaves of 256.'],
    },
  ),
  rule(
    'network = ⌊a ÷ block⌋ × block',
    '{net} = ⌊{a} ÷ {block}⌋ × {block}',
    ['net', 'a', 'block'],
    (x) => x.net! - Math.floor(x.a! / x.block!) * x.block!,
    {
      net: [
        (x) => Math.floor(x.a! / x.block!) * x.block!,
        '⌊{a} ÷ {block}⌋ × {block}',
        'Round the address down to a whole block: the host bits all 0.',
      ],
    },
  ),
  rule(
    'broadcast = network + block − 1',
    '{bc} = {net} + {block} − 1',
    ['bc', 'net', 'block'],
    (x) => x.bc! - x.net! - x.block! + 1,
    {
      bc: [
        (x) => x.net! + x.block! - 1,
        '{net} + {block} − 1',
        'The last address of the block: the host bits all 1.',
      ],
    },
  ),
  rule(
    'hosts = block − 2',
    '{hosts} = {block} − 2',
    ['hosts', 'block'],
    (x) => x.hosts! - x.block! + 2,
    {
      hosts: [
        (x) => x.block! - 2,
        '{block} − 2',
        'Every address but the network and the broadcast.',
      ],
      block: [
        (x) => x.hosts! + 2,
        '{hosts} + 2',
        'The hosts plus the network and broadcast addresses.',
      ],
    },
  ),
];

const subnetSpec: BitFieldsSpec = {
  kind: 'bitFields',
  word: 32,
  fields: [
    { name: 'network', bits: 'n' },
    { name: 'host', rest: true },
  ],
  octets: [192, 168, 10, 'a'],
  mask: 'n',
  more: ['net', 'bc', 'hosts'],
};

const subnet = demo({
  id: 'g.he-bit-fields-subnet',
  title: 'Bit fields: a subnet',
  use: 'Use this for “Find the network and broadcast address of 192.168.10.77/26.”',
  assumptions: [
    'The first three octets, 192.168.10, are all network bits (n is 24 to 30).',
    'Host bits all 0 name the network; all 1 are the broadcast.',
  ],
  variables: subnetVars(),
  rules: subnetRules(),
  example: { n: 26, block: 64, m: 192, a: 77, net: 64, bc: 127, hosts: 62 },
  startWith: ['n', 'a'],
  representation: subnetSpec,
});

// The edge: a /30, the smallest block with hosts (2 of them).
const subnet30 = demo({
  id: 'g.he-bit-fields-subnet-30',
  title: 'Bit fields: a /30 subnet',
  use: 'Use this for “Which /30 block holds 192.168.10.77, and how many hosts does it have?”',
  assumptions: [
    'The first three octets, 192.168.10, are all network bits (n is 24 to 30).',
    'A /30 leaves 2 host bits: 4 addresses, 2 of them usable (a point-to-point link).',
  ],
  variables: subnetVars(),
  rules: subnetRules(),
  example: { n: 30, block: 4, m: 252, a: 77, net: 76, bc: 79, hosts: 2 },
  startWith: ['n', 'a'],
  representation: subnetSpec,
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
  planar,
  planarMax,
  binaryTree,
  fullTree,
  codeTree,
  codeTreeSpare,
  routing,
  rm,
  rmMiss,
  response,
  edf,
  fcfsSjf,
  roundRobin,
  instruction,
  instructionR,
  cache,
  cache64,
  headersDemo,
  subnet,
  subnet30,
];

export const HE3D_GALLERY_LAYOUTS: LayoutDef[] = [
  traceWhile,
  traceFor,
  syntaxCards,
  dijkstraStages,
  eulerCards,
];
