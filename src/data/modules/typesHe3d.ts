/**
 * College pictures, round 3, group D (docs/RENDERINGS_HE.md): the computing and signals
 * pictures. HC48 the `codeTrace` explore figure and the `code` card figure; HC49
 * `timingDiagram`; HC50 `graph` (and its card); HC51 `scheduleChart`.
 */
import type { NumOrVar } from './typesGraphs';

// ─── HC48: a code trace (explore) and code cards ─────────────────────────────

/**
 * An explore figure: a short program in MATLAB and Python side by side (stacked when a line is
 * too long for half the width), the line running now lit in both, and under them the variables
 * table as it stands after this scene. Code is drawn in a code font as written: straight quotes,
 * `==`, `~=` and indents kept.
 */
export interface CodeTraceFigure {
  kind: 'codeTrace';
  /** The MATLAB lines, as written (indent with spaces). */
  matlab?: string[];
  /** The Python lines, as written. */
  python?: string[];
  /** The variables table's columns, in order ("x", "n"). */
  vars: string[];
}

/** A `codeTrace` scene: the line lit, the table so far and the loop's test as it reads now. */
export interface CodeTraceScene {
  /** The MATLAB line lit (1-based); none when left out. */
  line?: number;
  /** The Python line lit (default `line`). */
  pyLine?: number;
  /** The table's rows so far, one per pass, each with a value per variable; the last is lit. */
  rows: (number | string)[][];
  /** The test with this pass's numbers in ("32 <= 20") and whether it holds. */
  test?: { text: string; holds: boolean };
}

/**
 * A card figure: a line or a few lines of code in a code font, on a code panel (straight quotes
 * kept). Lines split at "\n". Up to 4 lines of up to 24 characters.
 */
export interface CodeCard {
  kind: 'code';
  code: string;
}

/** The scene field each group D explore figure reads (layouts.test). */
export const HE3D_SCENE_FIELD = { codeTrace: 'trace' } as const;

export type He3dFigure = CodeTraceFigure;
export type He3dCard = CodeCard | GraphCard;

/** A code card's size: 7.2 px a character at 12 px, 16 px a line, a 6 px margin. */
export const CODE_CHAR_W = 7.2;
export const CODE_LINE_H = 16;
export const codeCardSize = (code: string): [number, number] => {
  const lines = code.split('\n');
  const longest = Math.max(...lines.map((l) => l.length));
  return [Math.max(48, Math.ceil(longest * CODE_CHAR_W + 14)), lines.length * CODE_LINE_H + 12];
};

// ─── HC49: timing diagrams ───────────────────────────────────────────────────

/**
 * Stacked digital waveforms on one time axis with interval brackets, from the page's values
 * (each a variable id or a fixed number; times in the page's ns, μs or ms):
 *
 * - `register`: CLK, Q and D of a register-to-register path, brackets t_cq, t_logic, t_setup
 *   and the period; with `hold` and `tcd`, the hold window and D's earliest change.
 * - `timer`: a timer's count ramping to the compare value and resetting, the interrupt at each
 *   match, the period P bracketed.
 * - `pwm`: the count ramping to TOP, the compare level, the output high while the count is below
 *   it, the duty and period bracketed, the average voltage dashed.
 * - `uart`: a UART frame (idle high, a start bit low, data bits LSB first, parity, stop bits),
 *   each bit written in, a bit time and the frame bracketed.
 * - `link`: the space–time diagram of a packet: sender and receiver lines, time down, the packet
 *   a slanted band as wide as d_t, its slope the propagation d_p (and a queue wait d_q first).
 */
export interface TimingDiagramSpec {
  kind: 'timingDiagram';
  mode: 'register' | 'timer' | 'pwm' | 'uart' | 'link';
  /** `register`: clock-to-Q, the longest logic delay, setup; the period (T_min or the clock's). */
  tcq?: NumOrVar;
  tlogic?: NumOrVar;
  tsetup?: NumOrVar;
  period?: NumOrVar;
  /** The clock frequency (f_max), said in the caption. */
  freq?: NumOrVar;
  /** `register`: the hold time and the shortest path delay t_cd. */
  hold?: NumOrVar;
  tcd?: NumOrVar;
  /** `timer` and `pwm`: the clock f_clk, prescaler N, timer clock f_t. */
  fclk?: NumOrVar;
  prescaler?: NumOrVar;
  ftimer?: NumOrVar;
  /** `timer`: ticks per period and the compare value; `pwm`: compare. */
  ticks?: NumOrVar;
  compare?: NumOrVar;
  /** `timer`: the timer's bits (the compare must be below 2ⁿ). */
  bits?: NumOrVar;
  /** `pwm`: TOP, the duty (%) and the supply and average voltages. */
  top?: NumOrVar;
  duty?: NumOrVar;
  vdd?: NumOrVar;
  vavg?: NumOrVar;
  /** `uart`: baud, data bits, parity bits (0 or 1), stop bits, frame bits, bytes/s, time a byte. */
  baud?: NumOrVar;
  dataBits?: NumOrVar;
  parity?: NumOrVar;
  stopBits?: NumOrVar;
  frame?: NumOrVar;
  rate?: NumOrVar;
  time?: NumOrVar;
  /** `uart`: the byte sent (default 0x4B, “K”); even parity. */
  byte?: number;
  /** `link`: packet L (bytes), rate R, transmission d_t, distance d, speed s, d_p, d_q, total. */
  L?: NumOrVar;
  R?: NumOrVar;
  dt?: NumOrVar;
  d?: NumOrVar;
  s?: NumOrVar;
  dp?: NumOrVar;
  dq?: NumOrVar;
  total?: NumOrVar;
}

// ─── HC50: graphs and trees ──────────────────────────────────────────────────

/** A vertex at a fixed place in a unit box (x right, y down, 0 to 1). */
export interface GraphVertex {
  name: string;
  x: number;
  y: number;
}

/** An edge: its cost (a variable id or a number) written on it; dashed for a reported distance. */
export interface GraphEdge {
  from: string;
  to: string;
  cost?: NumOrVar;
  dashed?: boolean;
}

/**
 * A graph or tree from the page's values:
 *
 * - `graph` (default): the page's fixed embedding (`vertices`, `edges`) with costs written, or,
 *   when the page's V and E don't match it, a connected planar graph of V vertices and E edges
 *   (a stacked triangulation, straight edges, no crossings); `degrees` writes each vertex's
 *   degree in it; `best` lights the cheapest path and checks its cost against the page's.
 * - `tree`: a complete binary tree of n nodes level by level (dots to 32 a level, then a filled
 *   bar), the height h_min bracketed, and the levels to h with their room (2^(h+1) − 1 nodes).
 * - `code`: a prefix code tree from codeword lengths, 0 left and 1 right, each leaf its symbol,
 *   codeword and p; the Kraft sum said (no tree past 1).
 */
export interface GraphSpec {
  kind: 'graph';
  mode?: 'graph' | 'tree' | 'code';
  vertices?: GraphVertex[];
  edges?: GraphEdge[];
  /** `graph`: vertices, edges, degree sum, average degree and faces. */
  V?: NumOrVar;
  E?: NumOrVar;
  degreeSum?: NumOrVar;
  average?: NumOrVar;
  F?: NumOrVar;
  degrees?: boolean;
  /** The cheapest path from `from` to `to`, lit; `cost` is the page's value for it. */
  best?: { from: string; to: string; cost?: NumOrVar };
  /** `tree`: nodes n, least height h_min, a height h, most nodes and most leaves at h. */
  n?: NumOrVar;
  hmin?: NumOrVar;
  h?: NumOrVar;
  most?: NumOrVar;
  leaves?: NumOrVar;
  /** `code`: each symbol's codeword length and probability, names, L and the Kraft sum. */
  lengths?: NumOrVar[];
  probs?: NumOrVar[];
  names?: string[];
  L?: NumOrVar;
  kraft?: NumOrVar;
}

/**
 * A card figure: a small fixed graph (sort cards, sequence stages). `degrees` writes each
 * vertex's degree in it instead of its name; `lit` vertices and edges are drawn in the
 * highlight and heavy (a done set, a path); `dist` writes a distance beside each vertex
 * (Dijkstra's labels; "∞" for one not reached). Default 96 × 64; `wide` is 168 × 104.
 */
export interface GraphCard {
  kind: 'graph';
  vertices: GraphVertex[];
  edges: { from: string; to: string; cost?: number; lit?: boolean }[];
  lit?: string[];
  degrees?: boolean;
  dist?: Record<string, number | '∞'>;
  wide?: boolean;
}

export const graphCardSize = (f: GraphCard): [number, number] => (f.wide ? [168, 104] : [96, 64]);

// ─── HC51: schedules ─────────────────────────────────────────────────────────

/** A periodic task (C every T) or a job (a burst C arriving at 0), with its name ("τ₁", "A"). */
export interface ScheduleTask {
  name: string;
  C: NumOrVar;
  T?: NumOrVar;
}

/**
 * A Gantt chart from the page's values:
 *
 * - `rm` and `edf`: periodic tasks (up to 4), one row each, preemptive (rate-monotonic: the
 *   shorter period first; EDF: the earlier deadline first), over the hyperperiod (or as much of
 *   it as reads), each release an arrow (a release is the last job's deadline); a miss is
 *   crossed and named; `response` brackets a task's first response time.
 * - `jobs`: one row per run (FCFS, SJF, round robin with `quantum`) of jobs all arriving at 0,
 *   each slice named, the times at its ends, and under it each job's wait as a line.
 */
export interface ScheduleChartSpec {
  kind: 'scheduleChart';
  policy: 'rm' | 'edf' | 'jobs';
  tasks: ScheduleTask[];
  /** `jobs`: the runs drawn, each with the page's average wait and turnaround. */
  runs?: { policy: 'fcfs' | 'sjf' | 'rr'; wait?: NumOrVar; turnaround?: NumOrVar }[];
  quantum?: NumOrVar;
  /** The utilization U = Σ C ÷ T. */
  U?: NumOrVar;
  /** A task's first response time, bracketed on its row (index into `tasks`). */
  response?: { task: number; value: NumOrVar };
  /**
   * The page says whether a deadline is missed: false makes any miss a harness error. A miss
   * is always an error when U is within the bound that promises none (RM's, or 1 for EDF).
   */
  misses?: boolean;
  /** The time unit written (default ms). */
  unit?: string;
}

// ─── The group's calculator pictures ─────────────────────────────────────────

export type He3dSpec = TimingDiagramSpec | GraphSpec | ScheduleChartSpec;

const ids = (xs: unknown[]): string[] =>
  xs.flat(4).filter((x): x is string => typeof x === 'string');

/** The variable ids a group D picture reads (for the module tests). */
export function he3dSpecVars(r: He3dSpec): string[] {
  switch (r.kind) {
    case 'timingDiagram': {
      const { kind: _k, mode: _m, byte: _b, ...rest } = r;
      return ids(Object.values(rest));
    }
    case 'graph':
      return ids([
        r.V,
        r.E,
        r.degreeSum,
        r.average,
        r.F,
        r.best?.cost,
        r.n,
        r.hmin,
        r.h,
        r.most,
        r.leaves,
        r.lengths ?? [],
        r.probs ?? [],
        r.L,
        r.kraft,
        (r.edges ?? []).map((e) => e.cost),
      ]);
    case 'scheduleChart':
      return ids([
        r.tasks.map((t) => [t.C, t.T]),
        (r.runs ?? []).map((x) => [x.wait, x.turnaround]),
        r.quantum,
        r.U,
        r.response?.value,
      ]);
  }
}
