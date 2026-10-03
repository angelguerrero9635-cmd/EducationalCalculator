/**
 * Group N's shared arithmetic (`typesHe4n.ts`): HC185 replaying a state machine on its input.
 * Used by the drawings and by the harness, so both read the same answer.
 */
import type { DataStructureScene, FsmArrow, StateDiagramFigure } from '@/data/modules/typesHe4n';

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

// ─── HC187: data structures ──────────────────────────────────────────────────

/** A structure after its operations: what it holds, what came out last, what changed last. */
export interface DataState {
  /** Stack bottom to top; queue front to rear; list head to tail; ring front to rear. */
  items: number[];
  /** `ring`: every slot (undefined when empty), the front's slot and the count. */
  slots?: (number | undefined)[];
  front?: number;
  /** The value taken out by the last removal, and the slot (or place) of the last one added. */
  out?: number;
  added?: number;
  /** An operation that doesn't fit the structure (or takes from an empty one). */
  error?: string;
}

/** Replays a scene's operations on its structure. */
export function dsReplay(s: DataStructureScene): DataState {
  const items = [...(s.start ?? [])];
  let out: number | undefined;
  let added: number | undefined;
  if (s.structure === 'ring') {
    const N = s.slots ?? 8;
    const slots: (number | undefined)[] = Array.from({ length: N }, () => undefined);
    let front = (((s.front ?? 0) % N) + N) % N;
    let count = 0;
    for (const v of items) slots[(front + count++) % N] = v;
    for (const op of s.ops ?? []) {
      const m = /^enqueue (-?\d+)$/.exec(op);
      if (m) {
        if (count === N) return { items, slots, front, error: `${op}: the buffer is full` };
        added = (front + count) % N;
        slots[added] = Number(m[1]);
        count++;
      } else if (op === 'dequeue') {
        if (!count) return { items, slots, front, error: 'dequeue: the buffer is empty' };
        out = slots[front];
        slots[front] = undefined;
        front = (front + 1) % N;
        count--;
        added = undefined;
      } else return { items, slots, front, error: `${op} is not a ring operation` };
    }
    const now = Array.from({ length: count }, (_, i) => slots[(front + i) % N]!);
    return { items: now, slots, front, out, added };
  }
  const allowed: Record<string, RegExp[]> = {
    stack: [/^push (-?\d+)$/, /^pop$/],
    queue: [/^enqueue (-?\d+)$/, /^dequeue$/],
    list: [/^insert head (-?\d+)$/, /^insert tail (-?\d+)$/, /^delete head$/],
    array: [],
  };
  for (const op of s.ops ?? []) {
    const ok = allowed[s.structure]!.some((re) => re.test(op));
    if (!ok) return { items, error: `${op} is not a ${s.structure} operation` };
    const v = /(-?\d+)$/.exec(op);
    if (/^(push|enqueue|insert tail)/.test(op)) {
      items.push(Number(v![1]));
      added = items.length - 1;
    } else if (op.startsWith('insert head')) {
      items.unshift(Number(v![1]));
      added = 0;
    } else {
      if (!items.length) return { items, error: `${op}: it is empty` };
      out = op === 'pop' ? items.pop() : items.shift();
      added = undefined;
    }
  }
  return { items, out, added };
}

/** One comparison of binary search: the range before it, its middle, and what it found. */
export interface SearchStep {
  low: number;
  high: number;
  mid: number;
  found: boolean;
}

/** Binary search for `target` in sorted `values`, every comparison (mid = ⌊(low + high) ÷ 2⌋). */
export function binarySteps(values: number[], target: number): SearchStep[] {
  const steps: SearchStep[] = [];
  let low = 0;
  let high = values.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const found = values[mid] === target;
    steps.push({ low, high, mid, found });
    if (found) break;
    if (values[mid]! < target) low = mid + 1;
    else high = mid - 1;
  }
  return steps;
}

/** Binary search's worst case on n: the range left before each comparison (n, ⌊n/2⌋, … 1). */
export function worstRanges(n: number): number[] {
  const out: number[] = [];
  for (let m = Math.floor(n); m >= 1; m = Math.floor(m / 2)) out.push(m);
  return out;
}

/** The cycle of the last cell: k + n − 1 plus every stall. */
export const pipelineCycles = (k: number, n: number, stalls: { count: number }[]) =>
  k + n - 1 + stalls.reduce((a, s) => a + s.count, 0);
