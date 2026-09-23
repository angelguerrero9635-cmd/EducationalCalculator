import type { Relation, Values, VariableDef } from './types';

export interface Given {
  id: string;
  value: number;
}

export interface SolveResult {
  /** Every value that could be determined (given or calculated). */
  values: Values;
  /** Givens that were kept, oldest → newest. */
  given: Given[];
  /** Variable ids calculated from the givens. */
  derived: string[];
  /** Variables still unknown (more input needed). */
  unknown: string[];
  /** Older givens replaced because newer input already determines them or conflicts with them. */
  dropped: string[];
  /** The newest given, if it could not be accepted, with a reason to show the user. */
  rejected?: { id: string; reason: string };
}

export interface System {
  variables: VariableDef[];
  relations: Relation[];
}

const TOLERANCE = 1e-6;

/** Returns a reason string if `x` is not a valid value for `variable`. */
export function checkValue(variable: VariableDef, x: number): string | undefined {
  if (!Number.isFinite(x)) return 'Not a number';
  if (variable.integer && Math.abs(x - Math.round(x)) > 1e-9) return 'Must be a whole number';
  if (variable.min !== undefined && x < variable.min - TOLERANCE) {
    return `Must be at least ${variable.min}`;
  }
  if (variable.max !== undefined && x > variable.max + TOLERANCE) {
    return `Must be at most ${variable.max}`;
  }
  return undefined;
}

const normalizeValue = (variable: VariableDef, x: number) =>
  variable.integer ? Math.round(x) : Math.abs(x) < 1e-12 ? 0 : x;

/** True when a relation holds for `values` (relative tolerance). */
export function holds(relation: Relation, values: Values): boolean {
  const r = relation.residual(values);
  if (!Number.isFinite(r)) return false;
  const scale = 1 + Math.max(...relation.vars.map((id) => Math.abs(values[id] ?? 0)));
  return Math.abs(r) <= TOLERANCE * scale * scale;
}

/** Finds roots of `f` in [lo, hi] by scanning for sign changes and bisecting. */
export function findRoots(
  f: (x: number) => number,
  lo: number,
  hi: number,
  samples = 400,
): number[] {
  const roots: number[] = [];
  let x0 = lo;
  let f0 = f(x0);
  for (let i = 1; i <= samples; i++) {
    const x1 = lo + ((hi - lo) * i) / samples;
    const f1 = f(x1);
    if (Number.isFinite(f0) && f0 === 0) roots.push(x0);
    else if (Number.isFinite(f0) && Number.isFinite(f1) && f0 * f1 < 0) {
      let a = x0;
      let b = x1;
      let fa = f0;
      for (let k = 0; k < 80; k++) {
        const m = (a + b) / 2;
        const fm = f(m);
        if (fm === 0) {
          a = b = m;
          break;
        }
        if (fa * fm < 0) b = m;
        else {
          a = m;
          fa = fm;
        }
      }
      roots.push((a + b) / 2);
    }
    x0 = x1;
    f0 = f1;
  }
  if (Number.isFinite(f0) && f0 === 0) roots.push(x0);
  return roots;
}

function solveFor(
  relation: Relation,
  variable: VariableDef,
  values: Values,
  previous: Values,
): number | undefined {
  const explicit = relation.solve?.[variable.id];
  let candidates: number[];
  if (explicit) {
    const r = explicit(values);
    candidates = r === undefined ? [] : Array.isArray(r) ? r : [r];
  } else {
    const lo = variable.min ?? -1e6;
    const hi = variable.max ?? 1e6;
    candidates = findRoots((x) => relation.residual({ ...values, [variable.id]: x }), lo, hi);
  }
  const valid = candidates
    .filter((x) => checkValue(variable, x) === undefined)
    .map((x) => normalizeValue(variable, x))
    .filter((x) => holds(relation, { ...values, [variable.id]: x }));
  if (valid.length === 0) return undefined;
  const prev = previous[variable.id];
  if (prev === undefined) return valid[0];
  return valid.reduce((best, x) => (Math.abs(x - prev) < Math.abs(best - prev) ? x : best));
}

type Propagation = { ok: true; values: Values } | { ok: false; reason: string };

/** Repeatedly solves any relation with exactly one unknown until nothing changes. */
function propagate(system: System, known: Values, previous: Values): Propagation {
  const byId = new Map(system.variables.map((v) => [v.id, v]));
  const values = { ...known };
  let changed = true;
  while (changed) {
    changed = false;
    for (const relation of system.relations) {
      const unknowns = relation.vars.filter((id) => !(id in values));
      if (unknowns.length === 0) {
        if (!holds(relation, values)) {
          return { ok: false, reason: `Doesn’t fit ${relation.id}` };
        }
      } else if (unknowns.length === 1) {
        const id = unknowns[0]!;
        const variable = byId.get(id)!;
        const x = solveFor(relation, variable, values, previous);
        if (x === undefined) {
          // No valid value exists (e.g. out of range, or a negative length). Only a conflict
          // if every other variable in the relation is pinned; otherwise just leave it unknown.
          const direct = relation.solve?.[id]?.(values);
          const hasCandidate =
            direct !== undefined && (!Array.isArray(direct) || direct.length > 0);
          if (hasCandidate) {
            return { ok: false, reason: `Makes ${variable.name.toLowerCase()} impossible` };
          }
          continue;
        }
        values[id] = x;
        changed = true;
      }
    }
  }
  return { ok: true, values };
}

/**
 * Solves the system from the givens. Newer givens take priority: an older given is dropped
 * when newer ones already determine it or conflict with it.
 */
export function solve(system: System, given: readonly Given[], previous: Values = {}): SolveResult {
  const byId = new Map(system.variables.map((v) => [v.id, v]));
  let known: Values = {};
  const kept: Given[] = [];
  const dropped: string[] = [];
  let rejected: SolveResult['rejected'];

  for (let i = given.length - 1; i >= 0; i--) {
    const g = given[i]!;
    const variable = byId.get(g.id);
    const isNewest = i === given.length - 1;
    if (!variable) continue;
    if (g.id in known) {
      dropped.push(g.id);
      continue;
    }
    const invalid = checkValue(variable, g.value);
    if (invalid) {
      if (isNewest) rejected = { id: g.id, reason: invalid };
      else dropped.push(g.id);
      continue;
    }
    const trial = propagate(
      system,
      { ...known, [g.id]: normalizeValue(variable, g.value) },
      previous,
    );
    if (trial.ok) {
      known = trial.values;
      kept.unshift({ id: g.id, value: normalizeValue(variable, g.value) });
    } else if (isNewest) {
      rejected = { id: g.id, reason: trial.reason };
    } else {
      dropped.push(g.id);
    }
  }

  const givenIds = new Set(kept.map((g) => g.id));
  const ids = system.variables.map((v) => v.id);
  return {
    values: known,
    given: kept,
    derived: ids.filter((id) => id in known && !givenIds.has(id)),
    unknown: ids.filter((id) => !(id in known)),
    dropped,
    rejected,
  };
}
