import { solve, type Given, type SolveResult, type System } from './solve';
import type { Values } from './types';

export interface CalcState {
  given: Given[];
  result: SolveResult;
  /** Reason the most recent input was not accepted, keyed by variable id. */
  errors: Record<string, string>;
  /**
   * True while the values are the module's example, untouched. The first number a student
   * types then starts a fresh problem instead of mixing with the example's numbers.
   */
  example?: boolean;
}

function run(system: System, given: Given[], previous: Values): CalcState {
  const result = solve(system, given, previous);
  const errors: Record<string, string> = {};
  for (const id of result.cleared) errors[id] = 'Cleared: didn’t fit the newer value';
  if (result.rejected) errors[result.rejected.id] = result.rejected.reason;
  return { given: result.given, result, errors };
}

export function initialState(
  system: System,
  given: Given[] = [],
  options: { example?: boolean } = {},
): CalcState {
  return { ...run(system, given, {}), example: options.example };
}

/**
 * A number the student typed. On the untouched example it starts a fresh problem from
 * `start` (e.g. coin counts at 0) plus this value; otherwise it's the newest input.
 */
export function typeValue(
  system: System,
  state: CalcState,
  id: string,
  value: number | undefined,
  start: Given[] = [],
): CalcState {
  if (!state.example) return setValues(system, state, { [id]: value });
  const fresh = start.filter((g) => g.id !== id);
  return initialState(system, value === undefined ? fresh : [...fresh, { id, value }]);
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

/**
 * The typed values (or the example's) that `after` changed or stopped holding, other than
 * `ids`: a drag or a slider moves only the values it sends, never one the student typed.
 */
export const movedGivens = (before: CalcState, after: CalcState, ids: string[]): string[] =>
  before.result.given
    .filter((g) => !ids.includes(g.id))
    .filter((g) => {
      const now = after.result.given.find((k) => k.id === g.id);
      return !now || Math.abs(now.value - g.value) > 1e-9 * Math.max(1, Math.abs(g.value));
    })
    .map((g) => g.id);

/**
 * A handle on a worked-out value (the radius found from x² + y² + Dx + Ey + F = 0, a focus
 * found from the typed 4p) moves the typed value behind it: the one typed value that, freed
 * while every other is held, takes the handle to `target`. The page keeps its shape (the typed
 * value stays typed, the handle's value stays worked out). Undefined when no single typed value
 * can do it, or the new value doesn't fit.
 */
export function driveTyped(
  system: System,
  state: CalcState,
  updates: Record<string, number | undefined>,
  id: string,
  target: number,
): CalcState | undefined {
  const typedIds = new Set(state.result.given.map((g) => g.id));
  // What the handle holds still among the typed values; worked-out values it pinned stay so.
  const held = Object.fromEntries(
    Object.entries(updates).filter(([k, v]) => k !== id && typedIds.has(k) && v !== undefined),
  );
  const candidates = state.result.given
    .map((g) => g.id)
    .filter((g) => !(g in held))
    .reverse();
  const tol = 1e-6 * Math.max(1, Math.abs(target));
  /** The state with g at `x`, everything else typed held, if it fits. */
  const at = (g: string, x: number) => {
    const next = setValues(system, state, { ...held, [g]: x });
    return next.result.rejected ||
      next.result.cleared.length ||
      movedGivens(state, next, [g, ...Object.keys(held)]).length
      ? undefined
      : next;
  };
  const reaches = (next: CalcState | undefined) => {
    const v = next?.result.values[id];
    return v !== undefined && Math.abs(v - target) <= tol;
  };
  /** The typed value as the student could type it: on its box's step (12, not 12.0000003). */
  const typed = (g: string, next: CalcState) => {
    const v = system.variables.find((x) => x.id === g);
    const step = v?.integer ? 1 : v?.step;
    const x = next.result.values[g]!;
    if (!step) return next;
    const snapped = Number((Math.round(x / step) * step).toFixed(10));
    return snapped === x ? next : (at(g, snapped) ?? next);
  };
  for (const g of candidates) {
    // Worked out directly, when a rule gives g from the handle's value (F from r).
    const freed = setValues(system, state, { [g]: undefined });
    const trial = setValues(system, freed, { ...held, [id]: target });
    const x = trial.result.values[g];
    if (x !== undefined && !trial.result.rejected && !trial.result.cleared.length) {
      const next = at(g, x);
      if (reaches(next)) return typed(g, next!);
    }
    // Else found by trying values of g (secant steps): q from p when only p = q ÷ 4 is written.
    let [x0, y0] = [state.result.values[g], state.result.values[id]];
    if (x0 === undefined || y0 === undefined) continue;
    let x1 = x0 + Math.max(1e-3, Math.abs(x0) * 0.01);
    let y1: number | undefined = at(g, x1)?.result.values[id];
    for (let k = 0; k < 16 && y1 !== undefined && Math.abs(y1 - y0) > 1e-12; k++) {
      const x2: number = x1 + ((target - y1) * (x1 - x0)) / (y1 - y0);
      const next = at(g, x2);
      if (!next) break;
      if (reaches(next)) return typed(g, next);
      [x0, y0, x1, y1] = [x1, y1, x2, next.result.values[id]];
    }
  }
  return undefined;
}

export const clearAll = (system: System): CalcState => initialState(system);

/**
 * Re-solves after the units change. Physical values keep their meaning (so 10 kg shows as
 * 22.05 lb). Whole-number lesson values keep their number in the new unit instead (a 4 × 3
 * rectangle stays 4 × 3), with a note, because converting them would break the lesson's
 * whole-number rule.
 */
export function changeUnits(system: System, state: CalcState, previous: System): CalcState {
  const next = new Map(system.variables.map((v) => [v.id, v]));
  const prev = new Map(previous.variables.map((v) => [v.id, v]));
  const notes: Record<string, string> = {};
  const given = state.given.map((g) => {
    const v = next.get(g.id);
    const oldF = prev.get(g.id)?.unitFactor ?? 1;
    const newF = v?.unitFactor ?? 1;
    if (!v?.integer || oldF === newF) return g;
    notes[g.id] = 'Same number in the new unit (whole-number lesson)';
    return { id: g.id, value: (g.value / oldF) * newF };
  });
  const result = run(system, given, state.result.values);
  return { ...result, errors: { ...notes, ...result.errors } };
}
