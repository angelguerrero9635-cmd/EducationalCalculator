/**
 * Group N's shared arithmetic (`typesHe4n.ts`): HC185 replaying a state machine on its input.
 * Used by the drawings and by the harness, so both read the same answer.
 */
import type { FsmArrow, StateDiagramFigure } from '@/data/modules/typesHe4n';

/** One step of a machine: the bit read, the arrow taken, the state reached and its output. */
export interface FsmStep {
  bit: string;
  arrow?: FsmArrow;
  state?: string;
  output?: string;
}

/** Replays `input` from the start state; a step with no arrow stops the replay there. */
export function fsmReplay(f: StateDiagramFigure, input: string): FsmStep[] {
  const steps: FsmStep[] = [];
  let at: string | undefined = f.start;
  for (const bit of [...input]) {
    const arrow: FsmArrow | undefined = f.arrows.find((a) => a.from === at && a.input === bit);
    at = arrow?.to;
    const out = f.machine === 'moore' ? f.states.find((s) => s.name === at)?.output : arrow?.output;
    steps.push({ bit, arrow, state: at, output: out });
    if (!arrow) break;
  }
  return steps;
}

// ─── HC186: pipelines ────────────────────────────────────────────────────────

/** The stage names for k stages: the classic five, or S1 … Sk. */
export const stageNames = (k: number, given?: string[]) =>
  given && given.length === k
    ? given
    : k === 5
      ? ['IF', 'ID', 'EX', 'MEM', 'WB']
      : Array.from({ length: k }, (_, i) => `S${i + 1}`);

/** A stage's index by name; a name the stages lack falls back to `fallback` (or the last). */
export const stageIndex = (names: string[], name: string, fallback: number) => {
  const i = names.indexOf(name);
  return i >= 0 ? i : Math.min(fallback, names.length - 1);
};

/** A cell of the grid: instruction i (1-based) in stage p (0-based, −1 a bubble) at a cycle. */
export interface PipeCell {
  instr: number;
  stage: number;
  cycle: number;
}

/**
 * Instruction i's cells: it enters IF at cycle i plus every earlier instruction's stalls, and
 * its own stall bubbles sit before the stage they wait for.
 */
export function pipelineRow(
  i: number,
  k: number,
  names: string[],
  stalls: { instr: number; before?: string; count: number }[],
): PipeCell[] {
  const before = stalls.filter((s) => s.instr < i).reduce((a, s) => a + s.count, 0);
  const own = stalls.filter((s) => s.instr === i);
  const cells: PipeCell[] = [];
  let cycle = i + before;
  for (let p = 0; p < k; p++) {
    for (const s of own)
      if (stageIndex(names, s.before ?? 'EX', 2) === p)
        for (let b = 0; b < s.count; b++) cells.push({ instr: i, stage: -1, cycle: cycle++ });
    cells.push({ instr: i, stage: p, cycle: cycle++ });
  }
  return cells;
}

/** The cycle of the last cell: k + n − 1 plus every stall. */
export const pipelineCycles = (k: number, n: number, stalls: { count: number }[]) =>
  k + n - 1 + stalls.reduce((a, s) => a + s.count, 0);
