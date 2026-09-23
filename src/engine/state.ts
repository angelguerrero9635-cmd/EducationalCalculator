import { solve, type Given, type SolveResult, type System } from './solve';
import type { Values } from './types';

export interface CalcState {
  given: Given[];
  result: SolveResult;
  /** Reason the most recent input was not accepted, keyed by variable id. */
  errors: Record<string, string>;
}

function run(system: System, given: Given[], previous: Values): CalcState {
  const result = solve(system, given, previous);
  const errors: Record<string, string> = {};
  if (result.rejected) errors[result.rejected.id] = result.rejected.reason;
  return { given: result.given, result, errors };
}

export function initialState(system: System, given: Given[] = []): CalcState {
  return run(system, given, {});
}

/**
 * Sets (or clears, with `undefined`) one or more variables as the newest input. Several
 * values set together (e.g. dragging a rectangle corner) count as one input, newest last.
 */
export function setValues(
  system: System,
  state: CalcState,
  updates: Record<string, number | undefined>,
): CalcState {
  const ids = Object.keys(updates);
  const kept = state.given.filter((g) => !ids.includes(g.id));
  const added = ids.flatMap((id) => {
    const value = updates[id];
    return value === undefined ? [] : [{ id, value }];
  });
  let next = run(system, [...kept, ...added], state.result.values);
  // If a multi-value update was rejected, report it on every variable in the update.
  if (next.result.rejected && added.length > 1) {
    const reason = next.result.rejected.reason;
    next = { ...next, errors: Object.fromEntries(added.map((g) => [g.id, reason])) };
  }
  return next;
}

export const clearAll = (system: System): CalcState => initialState(system);
