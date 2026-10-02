/**
 * College pictures, round 3, group D (docs/RENDERINGS_HE.md): the computing and signals
 * pictures. HC48 the `codeTrace` explore figure and the `code` card figure; HC49
 * `timingDiagram`.
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
export type He3dCard = CodeCard;

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

// ─── The group's calculator pictures ─────────────────────────────────────────

export type He3dSpec = TimingDiagramSpec;

const ids = (xs: unknown[]): string[] =>
  xs.flat(4).filter((x): x is string => typeof x === 'string');

/** The variable ids a group D picture reads (for the module tests). */
export function he3dSpecVars(r: He3dSpec): string[] {
  switch (r.kind) {
    case 'timingDiagram': {
      const { kind: _k, mode: _m, byte: _b, ...rest } = r;
      return ids(Object.values(rest));
    }
  }
}
