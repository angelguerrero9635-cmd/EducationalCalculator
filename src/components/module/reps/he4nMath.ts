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
