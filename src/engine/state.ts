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
 * can do it, or the new value doesn't fit. `only` names the one typed value this handle
 * drives (the page's `drives`: the center h of |ax + b| moves b, never a); without it the typed
 * values are tried newest first.
 */
export function driveTyped(
  system: System,
  state: CalcState,
  updates: Record<string, number | undefined>,
  id: string,
  target: number,
  only?: string,
): CalcState | undefined {
  const typedIds = new Set(state.result.given.map((g) => g.id));
  // What the handle holds still among the typed values; worked-out values it pinned stay so.
  const held = Object.fromEntries(
    Object.entries(updates).filter(([k, v]) => k !== id && typedIds.has(k) && v !== undefined),
  );
  const pinned = Object.entries(updates).filter(
    (e): e is [string, number] => e[0] !== id && !typedIds.has(e[0]) && e[1] !== undefined,
  );
  const candidates = (
    only !== undefined
      ? [only].filter((g) => typedIds.has(g))
      : state.result.given.map((g) => g.id).reverse()
  ).filter((g) => !(g in held));
  const tol = 1e-6 * Math.max(1, Math.abs(target));
  const same = (a: number | undefined, b: number) =>
    a !== undefined && Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
  /**
   * The state with g at `x`, everything else typed held, if it fits and keeps the worked-out
   * values the handle pinned (dragging the distance d leaves the center h where it is).
   */
  const at = (g: string, x: number) => {
    const next = setValues(system, state, { ...held, [g]: x });
    return next.result.rejected ||
      next.result.cleared.length ||
      movedGivens(state, next, [g, ...Object.keys(held)]).length ||
      pinned.some(([k, v]) => !same(next.result.values[k], v))
      ? undefined
      : next;
  };
  const reaches = (next: CalcState | undefined) => {
    const v = next?.result.values[id];
    return v !== undefined && Math.abs(v - target) <= tol;
  };
  /** The step of g's box (1 for a whole number), if it has one. */
  const stepOf = (g: string) => {
    const v = system.variables.find((x) => x.id === g);
    return v?.integer ? 1 : v?.step;
  };
  /** x on g's step, as the student could type it (12, not 12.0000003). */
  const onStep = (g: string, x: number) => {
    const step = stepOf(g);
    return step ? Number((Math.round(x / step) * step).toFixed(10)) : x;
  };
  /**
   * g at the value that takes the handle to `target`, on its box's step: a whole-number g
   * lands on the nearest whole number (the handle then goes as near as it can).
   */
  /**
   * On g's steps, the value nearest x that fits with everything else held (a share of 40 into
   * 8 groups takes l = 40 or 32, never 41): x itself, else up to 12 steps either way. Without
   * steps, x itself.
   */
  const nearestFit = (g: string, x: number) => {
    const step = stepOf(g);
    const x0 = onStep(g, x);
    const exact = at(g, x0);
    if (exact || !step) return exact;
    for (let k = 1; k <= 12; k++)
      for (const dir of [1, -1]) {
        const near = at(g, Number((x0 + dir * k * step).toFixed(10)));
        if (near) return near;
      }
    return undefined;
  };
  const land = (g: string, x: number) => nearestFit(g, x) ?? at(g, x);
  /** Whether a state moved the handle's value from where it was. */
  const y00 = state.result.values[id];
  const moved = (next: CalcState) =>
    y00 === undefined || !same(next.result.values[id], y00) ? next : undefined;
  // A typed value that can only land where it was (the nearest fitting step is the old one)
  // is kept as the fallback while the others are tried.
  let still: CalcState | undefined;
  for (const g of candidates) {
    const step = stepOf(g);
    // Found by trying values of g near where it is (secant steps): each try is a quick solve
    // with every value accounted for, and a straight-line rule (k from d) lands in one or two.
    // A stepped g is tried on its steps only (a whole-number l can't be −4.95), and the first
    // try is the nearest step either way that fits (a share into 8 groups skips 7 of 8).
    let [x0, y0] = [state.result.values[g], state.result.values[id]];
    if (x0 !== undefined && y0 !== undefined) {
      const d = step ?? Math.max(1e-3, Math.abs(x0) * 0.01);
      let x1 = x0 + d;
      let y1: number | undefined = at(g, x1)?.result.values[id];
      // One step that doesn't fit: the nearest that does, either way (a g that fits but leaves
      // the handle's value as it was doesn't drive it, and is not searched).
      for (let k = 1; step && k <= 12 && y1 === undefined; k++)
        for (const dir of k === 1 ? [-1] : [1, -1]) {
          const xt = Number((x0 + dir * k * step).toFixed(10));
          const yt = at(g, xt)?.result.values[id];
          if (yt !== undefined) {
            [x1, y1] = [xt, yt];
            break;
          }
        }
      for (let k = 0; k < 16 && y1 !== undefined && Math.abs(y1 - y0) > 1e-12; k++) {
        const x2: number = onStep(g, x1 + ((target - y1) * (x1 - x0)) / (y1 - y0));
        // On steps, the search ends when it lands where it was: the nearest step to the target.
        if (step && (x2 === x1 || x2 === x0)) {
          const near = nearestFit(g, x2);
          if (near && moved(near)) return near;
          still ??= near;
          break;
        }
        const next: CalcState | undefined = step ? nearestFit(g, x2) : at(g, x2);
        if (!next) break;
        if (reaches(next)) return next;
        const xn: number = next.result.values[g]!;
        // A stepped g that fits only back where it was: the nearest it can go.
        if (step && (xn === x1 || xn === x0)) {
          if (moved(next)) return next;
          still ??= next;
          break;
        }
        [x0, y0, x1, y1] = [x1, y1, xn, next.result.values[id]];
      }
    }
    // Else worked out from the handle's value with g free (F from r on a circle); slower, as
    // the solver may have to search for g.
    const freed = setValues(system, state, { [g]: undefined });
    const trial = setValues(system, freed, { ...held, [id]: target });
    const x = trial.result.values[g];
    if (x !== undefined && !trial.result.rejected && !trial.result.cleared.length) {
      const next = land(g, x);
      if (next && (step || reaches(next))) {
        if (moved(next)) return next;
        still ??= next;
      }
    }
  }
  if (still) return still;
  return undefined;
}

/** True when an update's own values didn't all fit: the newest rejected, or one cleared. */
export const misfits = (c: CalcState, ids: string[]) =>
  (!!c.result.rejected && ids.includes(c.result.rejected.id)) ||
  c.result.cleared.some((id) => ids.includes(id));

/**
 * Sets one or more variables as the newest input (`undefined` clears). With `slide` (a slider
 * or a handle), a value that doesn't fit with the others held still moves back toward where it
 * was, one step at a time, and stops at the last value that fits; a handle on a worked-out value
 * moves the typed value behind it (`drives` names which, per handle). A drag never changes a
 * typed value it doesn't send (see `movedGivens`).
 */
export function setInput(
  system: System,
  state: CalcState,
  updates: Record<string, number | undefined>,
  slide?: { id: string; step: number },
  drives?: Record<string, string>,
): CalcState {
  const ids = Object.keys(updates);
  // A slider or a drag sends a value with the others it holds still. If that doesn't fit
  // (10 − 30 left; a product no top and bottom can make), the value is not taken and nothing
  // goes blank. A drag or a slider also keeps every typed value as it is.
  const misfit = (c: CalcState) =>
    misfits(c, ids) || (!!slide && movedGivens(state, c, ids).length > 0);
  const target = slide ? updates[slide.id] : undefined;
  const from = slide ? state.result.values[slide.id] : undefined;
  // A handle on a worked-out value (no typed value of its own, but typed values it comes
  // from) can't take a new value without changing a typed one: it moves the typed value
  // behind it, first, and never tries the value itself (on top of the values it comes from,
  // the solver can take seconds to find what to clear) or steps toward it.
  const stuck =
    !!slide &&
    target !== undefined &&
    from !== undefined &&
    state.result.given.length > 0 &&
    !state.result.given.some((g) => g.id === slide.id);
  if (stuck && Math.abs(target! - from!) <= 1e-9 * Math.max(1, Math.abs(from!))) return state;
  if (stuck) {
    const driven = driveTyped(system, state, updates, slide!.id, target!, drives?.[slide!.id]);
    if (driven) return driven;
    const typed = drives?.[slide!.id];
    const name = typed && system.variables.find((v) => v.id === typed)?.name.toLowerCase();
    return {
      ...state,
      errors: {
        ...state.errors,
        [slide!.id]: `Stops here: going on would change your ${name || 'typed values'}`,
      },
    };
  }
  const next = setValues(system, state, updates);
  if (!misfit(next)) return next;
  if (slide && target !== undefined && from !== undefined && slide.step > 0) {
    // The nearest value that fits, one step out at a time on both sides of the target (the
    // side toward the old value first), within the variable's range: a count of parts lands
    // on the next divisor, a product on the next product.
    const v = system.variables.find((x) => x.id === slide.id);
    const inRange = (x: number) =>
      (v?.min === undefined || x >= v.min - 1e-9) && (v?.max === undefined || x <= v.max + 1e-9);
    const first = target > from ? -1 : 1;
    // When only a typed value would move (nothing of its own refused), a step rarely cures
    // it: look a few steps out, not 400 (each try is a solve).
    // (A value refused only because it doesn't fit the older ones is the same case.)
    const reach = misfits(next, ids) && !next.result.rejected?.older ? 400 : 25;
    for (let k = 1; k <= reach; k++) {
      for (const dir of [first, -first]) {
        const x = target + dir * k * slide.step;
        if (!inRange(x)) continue;
        const trial = setValues(system, state, { ...updates, [slide.id]: x });
        if (!misfit(trial)) return trial;
      }
      if (!inRange(target - k * slide.step) && !inRange(target + k * slide.step)) break;
    }
  }
  const own = misfits(next, ids);
  const lost = own
    ? next.result.cleared.filter((id) => ids.includes(id))
    : movedGivens(state, next, ids);
  const names = lost.map(
    (id) => system.variables.find((v) => v.id === id)?.name.toLowerCase() ?? id,
  );
  const reason = own
    ? (next.result.rejected?.reason ?? `Doesn’t fit with ${names.join(' and ')} as it is`)
    : `Stops here: going on would change your ${names.join(' and ')}`;
  return {
    ...state,
    // A drag marks only the value it moves: the ones it held still keep their numbers.
    errors: {
      ...state.errors,
      ...Object.fromEntries((slide ? [slide.id] : ids).map((id) => [id, reason])),
    },
  };
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
