/**
 * College pictures, round 4, group N (docs/RENDERINGS_HE.md): digital logic and computer
 * systems. HC184 `karnaugh` (calculator kind and explore figure, with its truth table); HC185
 * the `stateDiagram` explore figure; HC186 `pipelineDiagram`; HC187 the `dataStructure` explore
 * figure (and a search picture).
 */
import type { NumOrVar } from './typesGraphs';

// ─── HC184: K-maps and truth tables ──────────────────────────────────────────

/**
 * A K-map of 2, 3 or 4 variables in Gray order (A down the side and B, C across for three;
 * A, B down and C, D across for four) with its truth table beside it, from the page's values:
 * `n` variables, the function's `minterms` and `dontCares` (fixed: a page's example) ringed in
 * its minimal sum of products (each group its own outline style, its product term written),
 * and the minterm `lit` (a value) lit in the map and the table with its product term. `rows`
 * (2ⁿ) and `functions` (2^(2ⁿ)) are said in the caption and checked.
 */
export interface KarnaughSpec {
  kind: 'karnaugh';
  n: NumOrVar;
  /** The variables' names (default A, B, C, D). */
  names?: string[];
  minterms?: number[];
  dontCares?: number[];
  lit?: NumOrVar;
  rows?: NumOrVar;
  functions?: NumOrVar;
}

/**
 * The explore figure: `map` (default) draws a scene's K-map and truth table with its groups
 * ringed; `table` draws a truth table with a column per sub-expression and the lit columns.
 */
export interface KarnaughFigure {
  kind: 'karnaugh';
  mode?: 'map' | 'table';
}

/** A `karnaugh` scene. */
export interface KarnaughScene {
  /** The variables (2–4 for a map; 1–4 for a table), the first the most significant. */
  names: string[];
  /** `map`: the 1s and don't-cares (minterm numbers). */
  minterms?: number[];
  dontCares?: number[];
  /**
   * `map`: the groups ringed, each a list of minterms (a power-of-two block, wrapping allowed,
   * of 1s and don't-cares); left out, the minimal sum of products is drawn.
   */
  groups?: number[][];
  /** `table`: the columns after the variables, each an expression (“p → q”, “¬q → ¬p”). */
  columns?: string[];
  /** `table`: the columns lit (indices into `columns`); two lit are compared row by row. */
  lit?: number[];
}

// ─── HC185: state diagrams ───────────────────────────────────────────────────

/** A state: its name, its output (Moore), and where it sits in a unit box (x right, y down). */
export interface FsmState {
  name: string;
  output?: string;
  x: number;
  y: number;
  /** Where its self-loop goes, in degrees (0 right, 90 down, 180 left, 270 up; default 270). */
  loop?: number;
}

/** A transition on one input value; `output` on a Mealy machine; `bend` curves it (− to +). */
export interface FsmArrow {
  from: string;
  to: string;
  input: string;
  output?: string;
  bend?: number;
}

/**
 * The explore figure: state bubbles (Moore: “S3/1”, the output in the bubble) and arrows
 * labelled with their input (Mealy: “1/0”), in the page's fixed layout; the start state has an
 * entry arrow. A scene's `input` (the bits read so far) is replayed from `start`: the state
 * reached is lit, the last arrow taken is heavy, and under the diagram the input tape (`tape`,
 * the whole input; the bits not read yet faded) carries the state and output after each bit.
 */
export interface StateDiagramFigure {
  kind: 'stateDiagram';
  machine: 'moore' | 'mealy';
  /** The input values, in order (“0”, “1”). */
  inputs: string[];
  start: string;
  states: FsmState[];
  arrows: FsmArrow[];
  /** The whole input the scenes step through. */
  tape?: string;
}

/** A `stateDiagram` scene: the input read so far; `state`, if given, is checked against it. */
export interface StateDiagramScene {
  input: string;
  state?: string;
}

// ─── HC187: data structures ──────────────────────────────────────────────────

/**
 * The explore figure: each scene draws one structure after its operations are replayed from
 * `start`: a stack (vertical, top marked), a queue (front and rear), a circular buffer (a ring of
 * `slots`, front and rear marked, the wrap shown), a linked list (nodes and arrows, head), or a
 * sorted array with binary search's low, mid and high pointers at a comparison.
 */
export interface DataStructureFigure {
  kind: 'dataStructure';
}

/** One operation: “push 3”, “pop”, “enqueue 5”, “dequeue”, “insert head 4”, “insert tail 4”, “delete head”. */
export type DataOp = string;

/** A `dataStructure` scene. */
export interface DataStructureScene {
  structure: 'stack' | 'queue' | 'ring' | 'list' | 'array';
  /** What it holds before the operations (bottom to top; front to rear; head to tail). */
  start?: number[];
  ops?: DataOp[];
  /** `ring`: its slots N and the front's slot at the start. */
  slots?: number;
  front?: number;
  /** What the scene says it holds after (same order as `start`) and what came out last (checked). */
  holds?: number[];
  out?: number;
  /** `array`: sorted values, the target, and the comparisons made so far (1 = the first). */
  values?: number[];
  target?: number;
  step?: number;
}

/** The scene field each group N explore figure reads (layouts.test). */
export const HE4N_SCENE_FIELD = {
  karnaugh: 'kmap',
  stateDiagram: 'fsm',
  dataStructure: 'ds',
} as const;

export type He4nFigure = KarnaughFigure | StateDiagramFigure | DataStructureFigure;

/**
 * The calculator picture for searching (data-structures#2): an array of n, and under it binary
 * search's worst case, each comparison's remaining range a bar to scale (n, ⌊n/2⌋, … 1), up to 12
 * rows then “…”, the count ⌊log₂n⌋ + 1 bracketed, beside linear search's n comparisons.
 */
export interface SearchSpec {
  kind: 'dataStructure';
  n: NumOrVar;
  binary?: NumOrVar;
  linear?: NumOrVar;
  average?: NumOrVar;
}

// ─── HC186: pipeline diagrams ────────────────────────────────────────────────

/**
 * A grid of instructions by clock cycles, each cell the stage the instruction is in (IF, ID,
 * EX, MEM, WB for k = 5; S1 … Sk otherwise), from the page's k and n. Up to 8 rows; past 8,
 * the first rows, “…”, and the last instruction, whose cycles are drawn after a gap so its last
 * cell sits at cycle k + n − 1 (+ stalls), bracketed. Stall bubbles and forwarding arrows when
 * given. `ts`, `t1`, `cycles`, `time` and `speedup` are said in the caption (and checked).
 */
export interface PipelineSpec {
  kind: 'pipelineDiagram';
  k: NumOrVar;
  n: NumOrVar;
  ts?: NumOrVar;
  t1?: NumOrVar;
  cycles?: NumOrVar;
  time?: NumOrVar;
  speedup?: NumOrVar;
  /** The stage names (default IF, ID, EX, MEM, WB for 5 stages; S1 … Sk otherwise). */
  stages?: string[];
  /** The instructions' names (default i1, i2, …), written on their rows. */
  names?: string[];
  /** Instruction `instr` (1-based) waits `count` bubbles before stage `before` (default EX). */
  stalls?: { instr: number; before?: string; count: NumOrVar }[];
  /** A result forwarded from the end of `from`'s stage `out` (default EX) into `to`'s `in` (EX). */
  forward?: { from: number; to: number; out?: string; in?: string }[];
}

// ─── The group's calculator pictures ─────────────────────────────────────────

export type He4nSpec = KarnaughSpec | PipelineSpec | SearchSpec;

const ids = (xs: unknown[]): string[] =>
  xs.flat(4).filter((x): x is string => typeof x === 'string');

/** The variable ids a group N picture reads (for the module tests). */
export function he4nSpecVars(r: He4nSpec): string[] {
  switch (r.kind) {
    case 'karnaugh':
      return ids([r.n, r.lit, r.rows, r.functions]);
    case 'pipelineDiagram':
      return ids([
        r.k,
        r.n,
        r.ts,
        r.t1,
        r.cycles,
        r.time,
        r.speedup,
        (r.stalls ?? []).map((s) => s.count),
      ]);
    case 'dataStructure':
      return ids([r.n, r.binary, r.linear, r.average]);
  }
}

/** The scene fields group N's explore figures read. */
export interface He4nScene {
  kmap?: KarnaughScene;
  fsm?: StateDiagramScene;
  ds?: DataStructureScene;
}
