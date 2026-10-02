/**
 * College pictures, round 3, group D (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
 */
import type { PictureRequest } from './pictureRequests';

/**
 * `pages` is the page list, or, for a request whose parts go on different pages (and kinds), each
 * page with the text that shows its part is there (`uses`).
 */
const ask = (
  id: string,
  kind: string,
  what: string,
  pages: string[] | Record<string, string>,
  notes?: string,
): PictureRequest => ({
  id,
  what,
  kind,
  ...(Array.isArray(pages) ? { pages } : { pages: Object.keys(pages), uses: pages }),
  status: 'requested',
  gallery: [],
  ...(notes ? { notes } : {}),
});

const EP = 'he.engineering.engineering-programming';
const CODE = '"kind":"code"';
const DL = 'he.engineering.digital-logic';
const ES = 'he.engineering.embedded-systems';
const NET = 'he.engineering.networks';

export const HE3D_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC48',
      'codeTrace',
      'A code trace (explore) and code cards: MATLAB and Python side by side, the line running lit, the variables table by scene',
      {
        [`${EP}#0~trace`]: '"codeTrace"',
        [`${EP}#0~syntax`]: CODE,
        [`${EP}#1~elementwise`]: CODE,
        [`${EP}#2~which-axes`]: CODE,
        [`${EP}#3~error-types`]: CODE,
      },
      [
        'From ME-P24. Drawn by layouts/codeTraceFigure.tsx (types in typesHe3d.ts); the explore case in ExploreLayout.tsx and the card in he3dCards.tsx.',
        'Explore figure: { kind: "codeTrace", matlab?: string[], python?: string[], vars: string[] }; scene field trace: { line?: the MATLAB line (1-based), pyLine?: the Python line (default line), rows: the variables table so far, one row per pass with a value per var (the last row lit), test?: { text: "32 <= 20", holds: false } }. Code keeps straight quotes and spaces; side by side when the longest line fits half the width, else stacked.',
        'Card figure: { kind: "code", code: "A(end)" } (lines split at \\n, up to 4 lines of 24 characters) on a sort card or sequence stage. The card label stays under it (unique, checked for curly quotes), so a neutral "Snippet A" keeps the sort fair.',
        'Harness (picturesHe3d.ts, from layoutFigures.ts): the lit lines exist and are not blank, each row has a value per variable, a numeric test agrees with holds, no curly quotes in code, card sizes.',
        'Example (~trace): the doubling loop of g.he-code-trace-while, scenes Start, Pass 1–5, End. ~syntax: the plan’s ten cards as in g.he-code-card-syntax. ~elementwise, ~which-axes (a code line per card where the card is code) and ~error-types put their snippets on cards the same way.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-code-trace-while', 'g.he-code-trace-for', 'g.he-code-card-syntax'],
  },
  {
    ...ask(
      'HC49',
      'timingDiagram',
      'Timing diagrams: CLK, Q and D with t_cq, t_logic and t_setup; a timer ramp to its compare value; PWM; a UART frame; a packet’s space–time diagram',
      [`${DL}#2`, `${ES}#1`, `${ES}#1~pwm`, `${ES}#2`, `${NET}#3`],
      [
        'From EC-P20. Drawn by reps/TimingDiagram.tsx (UART bits in reps/timingMath.ts, shared with the harness); types in typesHe3d.ts (TimingDiagramSpec).',
        'Fields: mode "register" | "timer" | "pwm" | "uart" | "link", then each a variable id or a number. register: tcq, tlogic, tsetup, period (T_min), freq (f_max), hold, tcd (the hold window and D’s earliest change; a failing hold is drawn in the miss colour with the page’s sentence). timer: fclk, prescaler, ftimer, period (P), ticks, compare, bits. pwm: fclk, prescaler, top, compare, freq (f_PWM), duty (%), vdd, vavg. uart: baud, dataBits, parity (0 or 1), stopBits, frame, rate, time, byte (a number, default 0x4B; masked to the data bits; even parity). link: L (B), R, dt, d, s, dp, dq, total.',
        'Units are read from each variable: times ns, μs, ms or s; frequencies and rates Hz, kHz, MHz, b/s, kb/s, Mb/s, bits/s; distance m or km. Pages that use km, m/s or ms should set units: ["km"] etc. so the US menu doesn’t convert them (the steps carry the factors).',
        'A value left “?” draws nothing of its own (no transition, bracket or level). The link band and the propagation drop are at least 8 px; the caption says when the shorter is drawn wider than to scale.',
        'Harness (picturesHe3d.ts): T ≥ t_cq + t_logic + t_setup and f = 1 ÷ T; f_t = f_clk ÷ N, ticks = P × f_t, compare = ticks − 1, compare < 2ⁿ; duty = compare ÷ (TOP + 1), f_PWM = f_clk ÷ (N(TOP + 1)), V_avg within 0 to V_DD; the frame’s drawn bits = frame and frame ÷ baud = the time; d_t = 8L ÷ R, d_p = d ÷ s, total = d_t + d_p + d_q.',
        'Example (digital-logic#2 main): { kind: "timingDiagram", mode: "register", tcq: "tcq", tlogic: "tlogic", tsetup: "tsetup", period: "Tmin", freq: "fmax", hold: "thold", tcd: "tcd" }; networks#3 main: { kind: "timingDiagram", mode: "link", L: "L", R: "R", dt: "dt", d: "d", s: "s", dp: "dp", total: "total" }. Each gallery demo is the page to copy (relations, steps, use line, example).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-timing-diagram-register',
      'g.he-timing-diagram-register-hold',
      'g.he-timing-diagram-timer',
      'g.he-timing-diagram-timer-top',
      'g.he-timing-diagram-pwm',
      'g.he-timing-diagram-uart',
      'g.he-timing-diagram-uart-9e2',
      'g.he-timing-diagram-link',
      'g.he-timing-diagram-link-lan',
    ],
  },
];
