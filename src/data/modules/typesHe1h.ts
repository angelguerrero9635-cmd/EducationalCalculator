/**
 * College pictures, round 1, group H (docs/RENDERINGS_HE.md): the passive-circuit schematic
 * (HC7, `net` on `seriesCircuit` and `circuit`, one renderer: reps/NetSchematic.tsx) and the
 * oscillator's damping, forcing, phase, transmissibility, coupled masses and springs (HC11,
 * reps/OscillatorHe.tsx). Every string is a variable id; a `NumOrVar` is a fixed number or one.
 */
import type { NumOrVar } from './typesGraphs';

// ─── HC7 schematics ──────────────────────────────────────────────────────────

/** A part in textbook symbols: zig-zag R, plates C, coil L, circle sources V (+ −) and I (arrow). */
export type NetPart = 'R' | 'C' | 'L' | 'V' | 'I';

/**
 * The circuits a schematic draws (reps/netMath.ts holds each one's netlist, the order of its
 * `elements`, `nodes`, `meshes` and `branches`):
 *
 * - `series`: one loop, the elements round it clockwise from the left side (source first);
 *   `internal` puts r inside a dashed battery box.
 * - `parallel`: [V, R₁, R₂, R₃?] each across the source; branches [I, I₁, I₂, I₃?].
 * - `twoNode`: [Vₛ, R₁, R₂, R₃, R₄, Iₛ]: Vₛ through R₁ to node 1, R₂ node 1 to ground, R₃
 *   between the nodes, R₄ node 2 to ground, Iₛ into node 2; nodes [V₁, V₂].
 * - `twoMesh`: [V_a, R₁, R₂, R₃, V_b], R₂ shared, V_b's + on top; meshes [I₁, I₂] clockwise;
 *   branches [I in R₂, down].
 * - `twoLoop`: [ε₁, R₁, ε₂, R₂, R₃], ε₁ and ε₂ + up, R₃ in the middle; branches [I₁, I₂, I₃],
 *   + up through each battery and down through R₃, each arrow drawn the way it really flows.
 * - `supernode`: [Iₛ, R₁, Vₓ, R₂]: Iₛ into node 1, R₁ and R₂ to ground, Vₓ between the nodes
 *   (+ at node 1); nodes [V₁, V₂].
 * - `thevenin`: [Vₛ, R₁, R₂, R_L], R₁ in series, R₂ across a–b, the load R_L; with
 *   `equivalent` the Thévenin circuit drawn under it with the same load.
 * - `norton`: [V_Th, R_Th, I_N]: the Thévenin form above the Norton form.
 * - `superposition`: [Vₛ, R₁, R₂, Iₛ] with the node voltage V (nodes [V]); `parts` [V′, V″]
 *   draws the two one-source circuits under the full one.
 * - `rc`, `rl`, `rlc`: a series loop with a switch that closes at t = 0, [Vₛ, R, C],
 *   [Vₛ, R, L], [Vₛ, R, L, C] (a loop without a source, [C, R], discharges).
 * - `element`: one box with + and −, its voltage, the current into + and the power absorbed.
 * - `bridge`: [V_ex, R₁, R₂, R₃, gauge]: a Wheatstone quarter bridge, `bridge` its values.
 * - `lowpass`: [v_in, R, C], the output across C; `filter` its values.
 * - `seriesParallel`: [V, X₁, X₂, X₃], X₁ in series with X₂ ∥ X₃ (resistors or capacitors);
 *   `parallelSeries`: (X₁ + X₂) ∥ X₃. Capacitors show Q and V at each.
 */
export type NetTopology =
  | 'series'
  | 'parallel'
  | 'twoNode'
  | 'twoMesh'
  | 'twoLoop'
  | 'supernode'
  | 'thevenin'
  | 'norton'
  | 'superposition'
  | 'rc'
  | 'rl'
  | 'rlc'
  | 'element'
  | 'bridge'
  | 'lowpass'
  | 'seriesParallel'
  | 'parallelSeries';

/** One part of a schematic. */
export interface NetElement {
  /** Its value (Ω, F, H, V or A, in the page's unit); none for a part drawn by name only. */
  id?: NumOrVar;
  kind: NetPart;
  /** The name written when `id` is not a variable ("R", "R₁"); default the variable's symbol. */
  name?: string;
  /** The voltage across it (+ where the netlist puts it). */
  v?: string;
  /** The current through it, in the netlist's direction (into + for a passive part). */
  i?: string;
  /** A capacitor's charge. */
  q?: string;
  /** The power it absorbs (`element`, a load). */
  p?: string;
}

export interface CircuitNet {
  topology: NetTopology;
  elements: NetElement[];
  /** Node voltages, written at their dots (to ground). */
  nodes?: string[];
  /** Mesh currents, clockwise circular arrows. */
  meshes?: string[];
  /** Branch currents, arrows on their wires. */
  branches?: string[];
  /** Loop arrows for the KVL equations, with no value (`twoLoop`). */
  loops?: boolean;
  /** `series`: the source's internal resistance r in a dashed box, the terminal voltage across it. */
  internal?: { r: NumOrVar; terminal?: string };
  /** `thevenin`: V_Th and R_Th (and I_N) of the circuit seen by the load. */
  equivalent?: { v: string; r: string; norton?: string };
  /** `superposition`: the node voltage with only the voltage source, then only the current source. */
  parts?: [string, string];
  /** `bridge`: the gauge factor, the strain (× `strainUnit`, default its unit: με = 10⁻⁶), V_out. */
  bridge?: { factor: NumOrVar; strain: NumOrVar; out?: string; strainUnit?: number };
  /** `lowpass`: the cutoff f_c, a frequency f and the gain there (ratio and dB). */
  filter?: { cutoff?: string; frequency?: NumOrVar; gain?: string; db?: string };
  /** `seriesParallel`, `parallelSeries`: the equivalent R or C. */
  total?: string;
}

/** `seriesCircuit` or `circuit` with `net`: a passive circuit drawn as a schematic (HC7). */
export type CircuitNetSpec =
  { kind: 'seriesCircuit'; net: CircuitNet } | { kind: 'circuit'; net: CircuitNet };

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

/** Every variable id a schematic reads. */
export function netVars(n: CircuitNet): string[] {
  return ids(
    ...n.elements.flatMap((e) => [e.id, e.v, e.i, e.q, e.p]),
    ...(n.nodes ?? []),
    ...(n.meshes ?? []),
    ...(n.branches ?? []),
    n.internal?.r,
    n.internal?.terminal,
    n.equivalent?.v,
    n.equivalent?.r,
    n.equivalent?.norton,
    ...(n.parts ?? []),
    n.bridge?.factor,
    n.bridge?.strain,
    n.bridge?.out,
    n.filter?.cutoff,
    n.filter?.frequency,
    n.filter?.gain,
    n.filter?.db,
    n.total,
  );
}

/** The variable ids of a group-HE1H picture or option (modules.test.ts). */
export function he1hSpecVars(r: { kind: string }): string[] {
  const o = r as unknown as Record<string, unknown>;
  if ((r.kind === 'seriesCircuit' || r.kind === 'circuit') && o.net)
    return netVars(o.net as CircuitNet);
  if (r.kind === 'oscillator') return oscillatorHeVars(o as OscillatorHe1h);
  return [];
}

// ─── HC11 oscillator options ─────────────────────────────────────────────────

/**
 * A dashpot beside the spring (`c` in N·s/m; `letter` b on physics and control pages): the x–t
 * trace from `x0` (default the spec's `amplitude`) and `v0` (default 0), e^(αt)(C₁ cos βt +
 * C₂ sin βt) inside the dashed ±Xe^(−ζω_n t) envelope, or the critically or over-damped form.
 * `zeta`, `natural` ω_n, `damped` ω_d and `critical` c_cr are written when the page names them;
 * `t` marks a moment and `x` the position there; `cycles` n marks the crest n cycles on, with
 * `end` xₙ and `decrement` δ = (1/n) ln(x₀/xₙ).
 */
export interface OscDamping {
  c: NumOrVar;
  letter?: 'b' | 'c';
  x0?: NumOrVar;
  v0?: NumOrVar;
  zeta?: string;
  natural?: string;
  damped?: string;
  critical?: string;
  t?: NumOrVar;
  x?: string;
  cycles?: NumOrVar;
  end?: string;
  decrement?: string;
}

/**
 * Start conditions: the trace x = A cos(ωt + φ) starts at `x0` with slope `v0`, φ drawn as the
 * shift of the first crest; `amplitude` A, `phase` φ (rad), `omega` ω, a moment `t` and `x`.
 */
export interface OscPhase {
  x0: NumOrVar;
  v0: NumOrVar;
  amplitude?: string;
  phase?: string;
  omega?: string;
  t?: NumOrVar;
  x?: string;
}

/**
 * F₀ sin ωt on the block (`force` F₀ in N, `omega` ω in rad/s) and the steady response: the
 * X ÷ δ_st curve against r = ω/ω_n for the damping ratio `zeta` (or the dashpot's), the point at
 * the page's r, and the phase lag. `ratio` r, `response` X, `lag` φ (° or rad, by its unit).
 */
export interface OscForcing {
  force: NumOrVar;
  omega: NumOrVar;
  zeta?: NumOrVar;
  ratio?: string;
  response?: string;
  lag?: string;
}

/** Transmissibility TR against r for `zeta`, √2 marked (TR = 1 there for every ζ), the point at r. */
export interface OscTransmit {
  ratio: NumOrVar;
  zeta: NumOrVar;
  value?: string;
}

/**
 * Two blocks: wall–k₁–m₁–k₂–m₂–k₃–wall (`walls`, k₃ default k₁, m₂ default m₁) or the `chain`
 * wall–k₁–m₁–k₂–m₂ with the far end free. Each mode's shape as arrows (in step, opposite) with
 * its ω (`slow` ω₁, `fast` ω₂), the amplitude `ratios` x₂/x₁, and the x–t traces of m₁ started
 * alone handing its motion to m₂ and back (`exchange` T_ex = 2π ÷ (ω₂ − ω₁)).
 */
export interface OscCoupled {
  m1: NumOrVar;
  m2?: NumOrVar;
  k1: NumOrVar;
  k2: NumOrVar;
  k3?: NumOrVar;
  layout?: 'walls' | 'chain';
  slow?: string;
  fast?: string;
  ratios?: [string?, string?];
  exchange?: string;
}

/** Two springs to the block, in `series` (k₁k₂ ÷ (k₁ + k₂)) or `parallel` (k₁ + k₂); `total` k_eq. */
export interface OscSprings {
  k1: NumOrVar;
  k2: NumOrVar;
  layout: 'series' | 'parallel';
  total?: string;
}

/** The college options on `oscillator` (HC11): any one draws the college view (OscillatorHe.tsx). */
export interface OscillatorHe1h {
  damping?: OscDamping;
  phase?: OscPhase;
  forcing?: OscForcing;
  transmit?: OscTransmit;
  coupled?: OscCoupled;
  springs?: OscSprings;
}

/** Whether a spec carries a college option. */
export const oscillatorHe = (o: OscillatorHe1h) =>
  !!(o.damping || o.phase || o.forcing || o.transmit || o.coupled || o.springs);

/** Every variable id the college options read. */
export function oscillatorHeVars(o: OscillatorHe1h): string[] {
  const { damping: d, phase: p, forcing: f, transmit: t, coupled: c, springs: s } = o;
  return ids(
    ...[d?.c, d?.x0, d?.v0, d?.zeta, d?.natural, d?.damped, d?.critical, d?.t, d?.x],
    ...[d?.cycles, d?.end, d?.decrement],
    ...[p?.x0, p?.v0, p?.amplitude, p?.phase, p?.omega, p?.t, p?.x],
    ...[f?.force, f?.omega, f?.zeta, f?.ratio, f?.response, f?.lag],
    ...[t?.ratio, t?.zeta, t?.value],
    ...[c?.m1, c?.m2, c?.k1, c?.k2, c?.k3, c?.slow, c?.fast, ...(c?.ratios ?? []), c?.exchange],
    ...[s?.k1, s?.k2, s?.total],
  );
}
