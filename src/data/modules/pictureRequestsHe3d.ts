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
const OS = 'he.engineering.operating-systems';

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
  {
    ...ask(
      'HC50',
      'graph',
      'Graphs: a fixed embedding with degrees or costs and the cheapest path lit; a planar graph of any V and E; a complete binary tree; a prefix code tree; graph cards',
      {
        'he.engineering.discrete-math#3': '"graph"',
        'he.engineering.data-structures#1': '"tree"',
        [`${NET}#2`]: '"best"',
        [`${NET}#2~dijkstra`]: '"kind":"graph"',
        'he.engineering.communication-systems#3~code-length': '"code"',
      },
      [
        'From EC-P22. Drawn by reps/GraphDiagram.tsx (sums in reps/graphMath.ts, shared with the harness); the card by GraphCardView through layouts/he3dCards.tsx; types in typesHe3d.ts (GraphSpec, GraphCard).',
        'Fields: mode "graph" (default) | "tree" | "code". graph: vertices [{ name, x, y }] in a unit box (y down) and edges [{ from, to, cost?, dashed? }] (a fixed embedding; cost a variable id or number), V, E, degreeSum, average, F, degrees (true: each degree in a badge in the widest gap between its edges), best { from, to, cost } (the cheapest path lit heavy, its cost checked against the page). When the page’s V and E don’t match the embedding, a connected planar graph of V vertices and E edges is drawn (a stacked triangulation, straight edges, each vertex its degree; up to 16 vertices; past 3V − 6 the caption says no simple planar graph exists). tree: n, hmin, h, most, leaves (levels 0 to max(h_min, h), dots to 32 a level, then a filled bar). code: lengths [ids], probs [ids], names, L, kraft (canonical prefix code; 0 left, 1 right; an unused branch dashed; no tree past a Kraft sum of 1).',
        'Card figure { kind: "graph", vertices, edges: [{ from, to, cost?, lit? }], lit?, degrees?, dist?, wide? } at 96 × 64 (wide 168 × 104): ~euler cards (degrees: true, the label “Degrees 3, 3, 2, 2” is checked against the drawing) and ~dijkstra stages (wide, the stage’s router and the link it was reached by lit; spans the cost of that link, totalLabel “Distance to D”).',
        'Harness (picturesHe3d.ts): degree sum = 2E (drawn and the page’s), average = 2E ÷ V, V − E + F = 2, edges name vertices, the cheapest path’s cost = the page’s; h_min = ⌈log₂(n + 1)⌉ − 1, levels hold n, most = 2^(h + 1) − 1, leaves = 2^h; codewords as long as the lengths, none a prefix of another, Kraft sum and L = Σ pᵢlᵢ; card vertices apart, Dijkstra labels and degree lists.',
        'Step text: the Bellman–Ford minimum “min(2 + 6, 7 + 3, 4 + 5)” is taught to the harness in harness/phrasesHe3d.ts.',
        'Example (discrete-math#3 main): { kind: "graph", vertices: the prism, edges: its 9, V: "V", E: "E", degreeSum: "sum", average: "avg", F: "F", degrees: true }; networks#2 main: the X, A, B, C, Z embedding with link costs and dashed reported distances and best: { from: "X", to: "Z", cost: "D" }. Each gallery demo is the page to copy.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-graph-planar',
      'g.he-graph-planar-max',
      'g.he-graph-tree',
      'g.he-graph-tree-full',
      'g.he-graph-code-tree',
      'g.he-graph-code-tree-unused',
      'g.he-graph-routing',
      'g.he-graph-dijkstra',
      'g.he-graph-card-euler',
    ],
  },
  {
    ...ask(
      'HC51',
      'scheduleChart',
      'Gantt charts: periodic tasks under rate-monotonic or EDF with releases, misses and a response time; FCFS, SJF and round-robin runs with each job’s wait',
      [`${ES}#3`, `${ES}#3~response-time`, `${ES}#3~edf`, `${OS}#1`, `${OS}#1~round-robin`],
      [
        'From EC-P24. Drawn by reps/ScheduleChart.tsx (the simulation in reps/scheduleMath.ts, shared with the harness and the demos); types in typesHe3d.ts (ScheduleChartSpec).',
        'Fields: policy "rm" | "edf" | "jobs"; tasks [{ name, C, T? }] (each C and T a variable id or number; up to 4 periodic tasks, names like "τ₁" or "J₁"); runs [{ policy: "fcfs" | "sjf" | "rr", wait?, turnaround? }] for jobs (one Gantt row each); quantum (rr); U; response { task (index), value } (brackets that task’s first response time under its row); misses (false: any miss is a harness error); unit (default "ms").',
        'Periodic: preemptive, deadline = period; the hyperperiod is drawn when the shortest run is at least 1/100 of it, else twice the longest period, never past 60 of the shortest period (the caption says how much). A release arrow is also the last job’s deadline; a missed job is crossed, named and dropped. Jobs: all arrive at 0, ties in index order; each job’s waiting stretches are lines under the bar with “A waits 4”.',
        'Harness (picturesHe3d.ts): each job’s slices add to its C or burst; U = Σ C ÷ T; a miss never drawn when U is within RM’s n(2^(1/n) − 1) or EDF’s 1, nor when misses is false; the bracket’s R = the page’s; average wait and turnaround = the page’s. Step phrases “the SJF average wait of …” and “the round-robin average wait of … with quantum …” are taught to the harness in harness/phrasesHe3d.ts.',
        'Example (embedded-systems#3 main): { kind: "scheduleChart", policy: "rm", tasks: [{ name: "τ₁", C: "C1", T: "T1" }, { name: "τ₂", C: "C2", T: "T2" }, { name: "τ₃", C: "C3", T: "T3" }], U: "U" }; ~response-time adds response: { task: 2, value: "R3" } (the demo takes k₁ = ⌈R₃ ÷ T₁⌉ and k₂ typed, the last pass of the iteration, until HE-E5); operating-systems#1 main: { kind: "scheduleChart", policy: "jobs", tasks: [{ name: "J₁", C: "b1" }, …], runs: [{ policy: "fcfs", wait: "Wf", turnaround: "Tf" }, { policy: "sjf", wait: "Ws", turnaround: "Ts" }] } (its SJF step builds the sorted order from the values).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-schedule-chart-rm',
      'g.he-schedule-chart-rm-miss',
      'g.he-schedule-chart-response',
      'g.he-schedule-chart-edf',
      'g.he-schedule-chart-fcfs-sjf',
      'g.he-schedule-chart-round-robin',
    ],
  },
  {
    ...ask(
      'HC64',
      'bitFields',
      'Bit fields: a word cut into named fields to scale (instruction formats, tag | index | offset, network | host with the address and mask bits); a packet’s nested headers',
      {
        'he.engineering.computer-architecture#0': '"bitFields"',
        'he.engineering.computer-architecture#3': '"bitFields"',
        [`${NET}#0`]: '"headers"',
        [`${NET}#1`]: '"octets"',
      },
      [
        'From EC-P18. Drawn by reps/BitFields.tsx (widths and bits in reps/bitMath.ts, shared with the harness); types in typesHe3d.ts (BitFieldsSpec).',
        'Fields: mode "word" (default) | "headers". word: word (bits), fields [{ name, bits? | rest: true, when?: { count, nth } }] MSB side first (when draws a field only while count ≥ nth: a page’s k register fields), value? (a number, its bits written in) or octets? (four, an IPv4 address; each a variable id or number), mask? (a prefix length: the mask’s row), more? (variable ids said in the caption). Bits are written to 32 bits; a 48- or 64-bit word draws field boxes with their widths only. A field too narrow for its name has it under the bar (two staggered rows). headers: payload, layers [{ name, bytes, unit? }] innermost first (each row adds the next header on the left, each header with its bytes), frame, efficiency (%); a to-scale strip of the frame shows the payload’s share.',
        'When the fields don’t add up to the word, the bar is faded and the caption says so (the demos keep that out with a page limit, i ≥ 1).',
        'Harness (picturesHe3d.ts): the drawn field widths add to the word size and are whole; octets 0–255 in a 32-bit word; the mask within the word; the value fits; payload + headers = the frame; efficiency = payload ÷ frame.',
        'Example (computer-architecture#0 main): { kind: "bitFields", word: "w", fields: [{ name: "imm", bits: "i" }, { name: "rs2", bits: "r", when: { count: "k", nth: 3 } }, { name: "rs1", bits: "r", when: { count: "k", nth: 1 } }, { name: "funct", bits: "f" }, { name: "rd", bits: "r", when: { count: "k", nth: 2 } }, { name: "opcode", bits: "o" }], more: ["lo", "hi"] }; #3: fields tag, index, offset; networks#1: { kind: "bitFields", word: 32, fields: [{ name: "network", bits: "n" }, { name: "host", rest: true }], octets: [192, 168, 10, "a"], mask: "n", more: ["net", "bc", "hosts"] }; networks#0: { kind: "bitFields", mode: "headers", payload: "pay", layers: [{ name: "TCP", bytes: "tcp", unit: "TCP segment" }, { name: "IP", bytes: "ip", unit: "IP datagram" }, { name: "Ethernet", bytes: "link", unit: "Ethernet frame" }], frame: "frame", efficiency: "eff" }.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-bit-fields-instruction',
      'g.he-bit-fields-instruction-r',
      'g.he-bit-fields-cache',
      'g.he-bit-fields-cache-64',
      'g.he-bit-fields-headers',
      'g.he-bit-fields-subnet',
      'g.he-bit-fields-subnet-30',
    ],
  },
];
