/**
 * College pictures, round 1, group H (docs/RENDERINGS_HE.md). Spread into
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

const EC = 'he.engineering.circuits-1';
const UP2 = 'he.physics.university-2';
const BIO = 'he.engineering.bioinstrumentation';
const topo = (t: string) => `"topology":"${t}"`;

export const HE1H_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC7',
      'seriesCircuit',
      'Passive circuits as schematics in textbook symbols (`net`, also on `circuit`)',
      {
        [`${EC}#0~parallel`]: topo('parallel'),
        [`${EC}#0~power-sign`]: topo('element'),
        [`${EC}#1`]: topo('twoNode'),
        [`${EC}#1~mesh`]: topo('twoMesh'),
        [`${EC}#1~supernode`]: topo('supernode'),
        [`${EC}#2`]: topo('thevenin'),
        [`${EC}#2~norton`]: topo('norton'),
        [`${EC}#2~max-power`]: topo('series'),
        [`${EC}#2~superposition`]: topo('superposition'),
        [`${EC}#4`]: topo('rc'),
        [`${UP2}#1`]: topo('seriesParallel'),
        [`${UP2}#2`]: topo('twoLoop'),
        [`${UP2}#2~internal-resistance`]: '"internal"',
        [`${BIO}#0~strain-gauge`]: topo('bridge'),
        [`${BIO}#3`]: topo('lowpass'),
      },
      [
        'From EC-P1, P-P11, P-P12, B-P31 (bridge and filter parts). One renderer (reps/NetSchematic.tsx, layouts in netLayout.ts, netlists and the solver in netMath.ts) reached from `seriesCircuit` (EC and B pages) and `circuit` (P pages) with `net: CircuitNet` (typesHe1h.ts); a spec without `net` draws as before (the pilot circuits-1#0 keeps its picture).',
        'Fields: `net: { topology, elements: [{ id?, kind: R | C | L | V | I, name?, v?, i?, q?, p? }], nodes?, meshes?, branches?, loops?, internal?: { r, terminal? }, equivalent?: { v, r, norton? }, parts?: [V′, V″], bridge?: { factor, strain, out?, strainUnit? }, filter?: { cutoff?, frequency?, gain?, db? }, total? }`. Each topology fixes the order of `elements`, `nodes`, `meshes` and `branches` (typesHe1h.ts lists them); a source’s + is where its netlist says (a V on a side wire: + at the top).',
        'Topologies: series (one loop; `internal` puts r in a dashed battery box with the terminal V), parallel, twoNode, twoMesh, twoLoop (each branch arrow drawn the way the current really flows), supernode, thevenin (the equivalent under the circuit with the same load), norton, superposition (the two one-source circuits under the full one), rc, rl, rlc (with the switch at t = 0), element (one box, + and −, current into +, P absorbed), bridge (quarter bridge, one active gauge, the meter), lowpass, seriesParallel and parallelSeries (resistors or capacitors, Q and V at each).',
        'Units: any unit the table knows (kΩ, mA, μF, μC; H, mH, Hz and με are read too); the check works in SI. Harness (picturesHe1h.ts): the DC circuits are solved by nodal analysis and every node voltage, branch and mesh current, element voltage, charge and power the page labels must match to 0.1%; KCL at every node and KVL round every loop are summed with the page’s values; series capacitors share Q, parallel ones share V (the charge solve); the switched loops’ drops add to the source; P = VI; V_Th, R_Th, I_N; V′ + V″ = V; V_out = V_ex GF ε ÷ 4; f_c = 1 ÷ (2πRC), |H| and dB.',
        'Example (circuits-1#1 main): { kind: "seriesCircuit", net: { topology: "twoNode", elements: [{ id: "Vs", kind: "V" }, { id: "R1", kind: "R" }, { id: "R2", kind: "R" }, { id: "R3", kind: "R" }, { id: "R4", kind: "R" }, { id: "Is", kind: "I" }], nodes: ["V1", "V2"] } }. University-2#2 main: { kind: "circuit", net: { topology: "twoLoop", elements: [ε₁ V, R₁, ε₂ V, R₂, R₃], branches: ["I1", "I2", "I3"], loops: true } }. Each gallery demo is a full page to copy.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-series-circuit-parallel',
      'g.he-series-circuit-element',
      'g.he-series-circuit-two-node',
      'g.he-series-circuit-two-mesh',
      'g.he-series-circuit-supernode',
      'g.he-series-circuit-thevenin',
      'g.he-series-circuit-norton',
      'g.he-series-circuit-max-power',
      'g.he-series-circuit-superposition',
      'g.he-series-circuit-rc',
      'g.he-series-circuit-rl',
      'g.he-series-circuit-rlc',
      'g.he-circuit-capacitors',
      'g.he-circuit-two-loop',
      'g.he-circuit-two-loop-reverse',
      'g.he-circuit-internal',
      'g.he-series-circuit-bridge',
      'g.he-series-circuit-lowpass',
    ],
  },
  {
    ...ask(
      'HC11',
      'oscillator',
      'Oscillator: damping, start phase, forcing, transmissibility, coupled masses, springs',
      {
        'he.math.diff-eq#1': '"damping"',
        'he.physics.university-1#5': '"phase"',
        'he.physics.university-1#5~damped': '"damping"',
        'he.physics.classical-mechanics#4': '"coupled"',
        'he.physics.classical-mechanics#4~chain': '"chain"',
        'he.engineering.vibrations#0~springs': '"springs"',
        'he.engineering.vibrations#1': '"forcing"',
        'he.engineering.vibrations#1~transmissibility': '"transmit"',
        'he.engineering.vibrations#2': '"damping"',
        'he.engineering.vibrations#2~log-dec': '"cycles"',
        'he.engineering.vibrations#3': '"coupled"',
        'he.engineering.control-systems#0~mass-spring': '"damping"',
      },
      [
        'From M-P10, P-P8, P-P23, ME-P16, EC-P30. Options on `oscillator` (swing mode; typesHe1h.ts `OscillatorHe1h`, drawn by reps/OscillatorHe.tsx, math in oscMath.ts); any one of them draws the college view, a spec without them draws as before. Values in SI through each variable’s unit (mm, kg/s, N·s/m read).',
        '`damping: { c, letter?: "b" | "c", x0?, v0?, zeta?, natural?, damped?, critical?, t?, x?, cycles?, end?, decrement? }`: a dashpot (painted), the trace e^(αt)(C₁ cos βt + C₂ sin βt) inside the dashed ±Xe^(−ζωₙt) envelope (or the critical and overdamped forms), the moment t with x, the first crest and the crest n cycles on for δ. EC-P30’s `damper: b` is `damping: { c: "b", letter: "b" }`.',
        '`phase: { x0, v0, amplitude?, phase?, omega?, t?, x? }`: x = A cos(ωt + φ) from x₀ with the slope v₀ dashed, the first crest’s shift −φ/ω bracketed.',
        '`forcing: { force, omega, zeta?, ratio?, response?, lag? }` (ζ from the dashpot if not given): F₀ sin ωt on the block, X ÷ δ_st against r with r = 1 dashed, the point and its lag. `transmit: { ratio, zeta, value? }`: TR against r, TR = 1 and r = √2 dashed, the point. `coupled: { m1, m2?, k1, k2, k3?, layout?: "walls" | "chain", slow?, fast?, ratios?, exchange? }`: two blocks and three springs (or the chain), each mode’s arrows, m₁ started alone (x₁ and x₂ traces, T_ex bracketed when given). `springs: { k1, k2, layout: "series" | "parallel", total? }`.',
        'Harness (picturesHe1h.ts `oscillatorIssues`): ω_d < ωₙ; ωₙ, ζ, ω_d, c_cr as written; x at the marked t; x(0) = A cos φ and the slope v₀; each crest on the envelope and the crest ratio e^δ; δ = (1/n) ln(x₀/xₙ); X on the response curve and its lag (° or rad); TR at r; each ω² a root of det(K − ω²M) and its x₂/x₁; T_ex; k_eq.',
        'Example (vibrations#1): { kind: "oscillator", mass: "m", spring: "k", amplitude: "X", forcing: { force: "F0", omega: "w", zeta: "zeta", ratio: "r", response: "X", lag: "phi" } }. A page with no mass or spring (transmissibility) passes numbers (mass: 1, spring: 1, amplitude: 1), which are not labelled. Each gallery demo is a full page to copy.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-oscillator-damped',
      'g.he-oscillator-phase',
      'g.he-oscillator-envelope',
      'g.he-oscillator-mass-spring',
      'g.he-oscillator-damping-ratio',
      'g.he-oscillator-log-dec',
      'g.he-oscillator-forced',
      'g.he-oscillator-resonance',
      'g.he-oscillator-transmit',
      'g.he-oscillator-coupled',
      'g.he-oscillator-chain',
      'g.he-oscillator-two-mass',
      'g.he-oscillator-springs-series',
      'g.he-oscillator-springs-parallel',
    ],
  },
];
