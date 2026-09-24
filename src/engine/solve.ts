import { formatNumber } from './format';
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
  /** How each derived value was found, in solving order. */
  trace: TraceStep[];
  /** Variables still unknown (more input needed). */
  unknown: string[];
  /** Older givens replaced because newer input already determines them or conflicts with them. */
  dropped: string[];
  /** The subset of `dropped` removed because they conflicted with newer input (tell the user). */
  cleared: string[];
  /** The newest given, if it could not be accepted, with a reason to show the user. */
  rejected?: { id: string; reason: string };
}

export interface TraceStep {
  /** The variable that was found. */
  id: string;
  /** The relation it was solved from. */
  relation: string;
  /** False when found by numeric root-finding rather than a rearrangement. */
  exact: boolean;
}

export interface System {
  variables: VariableDef[];
  relations: Relation[];
}

const TOLERANCE = 1e-6;

/**
 * Returns a reason string if `x` (in formula units) is not a valid value for `variable`.
 * With a unit context, the whole-number rule and the numbers in the message refer to the
 * value as shown to the user.
 */
export function checkValue(variable: VariableDef, x: number): string | undefined {
  if (!Number.isFinite(x)) return 'Not a number';
  const f = variable.unitFactor ?? 1;
  const unit = variable.displayUnit ? ` ${variable.displayUnit}` : '';
  if (variable.integer && Math.abs(x / f - Math.round(x / f)) > 1e-9) {
    return 'Must be a whole number';
  }
  // Limits converted to another unit are shown to 3 significant figures.
  const limit = (bound: number) =>
    formatNumber(f === 1 ? bound : Number((bound / f).toPrecision(3)));
  // Whole numbers are compared exactly (the tolerance would let 2,000,000,001 pass 2e9).
  const shown = variable.integer ? Math.round(x / f) * f : x;
  const slack = (bound: number) => (variable.integer ? 0 : TOLERANCE * (1 + Math.abs(bound)));
  if (variable.min !== undefined && shown < variable.min - slack(variable.min)) {
    return `Must be at least ${limit(variable.min)}${unit}`;
  }
  if (variable.max !== undefined && shown > variable.max + slack(variable.max)) {
    return `Must be at most ${limit(variable.max)}${unit}`;
  }
  return undefined;
}

const normalizeValue = (variable: VariableDef, x: number) => {
  const f = variable.unitFactor ?? 1;
  if (variable.integer) return Math.round(x / f) * f;
  return Math.abs(x) < 1e-12 ? 0 : x;
};

const closeTo = (x: number, target: number) =>
  Math.abs(x - target) <= TOLERANCE * (1 + Math.abs(target));

/**
 * True when a relation holds for `values`. Where the relation has an exact rearrangement, it
 * re-solves for that variable and compares with a relative tolerance, so formulas that mix
 * very different magnitudes (a rate of 12 and a population of 500,000) are checked precisely.
 * Otherwise it falls back to the residual, scaled by the size of the values.
 */
export function holds(relation: Relation, values: Values): boolean {
  for (const [id, fn] of Object.entries(relation.solve ?? {})) {
    const others = { ...values };
    delete others[id];
    const out = fn!(others);
    const candidates = (out === undefined ? [] : Array.isArray(out) ? out : [out]).filter(
      Number.isFinite,
    );
    if (candidates.length > 0) return candidates.some((x) => closeTo(x, values[id]!));
  }
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

/** Valid values for `variable` from one relation, nearest the previous value first. */
function candidatesFor(
  relation: Relation,
  variable: VariableDef,
  values: Values,
  previous: Values,
): number[] {
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
    .filter((x) => holds(relation, { ...values, [variable.id]: x }))
    .filter((x, i, all) => all.findIndex((y) => closeTo(y, x)) === i);
  const prev = previous[variable.id];
  return prev === undefined
    ? valid
    : valid
        .map((x, i) => ({ x, i }))
        .sort((p, q) => Math.abs(p.x - prev) - Math.abs(q.x - prev) || p.i - q.i)
        .map((p) => p.x);
}

type Propagation = { ok: true; values: Values; trace: TraceStep[] } | { ok: false; reason: string };

/**
 * Repeatedly solves any relation with exactly one unknown until nothing changes. When a
 * relation allows several values (e.g. a difference: bigger or smaller), each is tried in turn,
 * nearest the previous value first, and the first that fits every relation is kept.
 */
function propagate(
  system: System,
  known: Values,
  previous: Values,
  trace: readonly TraceStep[] = [],
  budget = { left: 2000 },
): Propagation {
  const byId = new Map(system.variables.map((v) => [v.id, v]));
  const values = { ...known };
  const steps = [...trace];
  budget.left--;
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
        const xs = candidatesFor(relation, variable, values, previous);
        if (xs.length === 0) {
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
        const step = { id, relation: relation.id, exact: !!relation.solve?.[id] };
        if (xs.length > 1 && budget.left > 0) {
          // Branch: keep the first candidate that leads to no conflict.
          let first: Propagation | undefined;
          for (const x of xs) {
            const branch = propagate(
              system,
              { ...values, [id]: x },
              previous,
              [...steps, step],
              budget,
            );
            if (branch.ok) return branch;
            first ??= branch;
          }
          return first!;
        }
        values[id] = xs[0]!;
        steps.push(step);
        changed = true;
      }
    }
  }
  return { ok: true, values, trace: steps };
}

/** Whole-number values a variable can take, or undefined if not a finite whole-number range. */
function wholeValues(v: VariableDef): number[] | undefined {
  if (!v.integer || v.min === undefined || v.max === undefined) return undefined;
  const f = v.unitFactor ?? 1;
  const lo = Math.ceil(v.min / f - 1e-9);
  const hi = Math.floor(v.max / f + 1e-9);
  if (hi - lo > 5000) return undefined;
  return Array.from({ length: Math.max(0, hi - lo + 1) }, (_, i) => (lo + i) * f);
}

type Bounds = Map<string, { lo: number; hi: number; f: number }>;

/**
 * Narrows whole-number ranges using the relations that are sums with coefficients (linear in
 * the unknowns, checked numerically), like a + b + c = 372 or T = 25q + 10d + … . Returns
 * false when some range becomes empty (nothing can fit). Other relations are left to search.
 */
function narrow(system: System, vals: Values, bounds: Bounds): boolean {
  for (let pass = 0; pass < 12; pass++) {
    let changed = false;
    for (const relation of system.relations) {
      const open = relation.vars.filter((id) => !(id in vals));
      if (open.length === 0 || open.some((id) => !bounds.has(id))) continue;
      // Residual as c0 + Σ aᵢ·xᵢ, measured at the middle of the ranges.
      const mid: Values = { ...vals };
      for (const id of open) mid[id] = (bounds.get(id)!.lo + bounds.get(id)!.hi) / 2;
      const r0 = relation.residual(mid);
      if (!Number.isFinite(r0)) continue;
      const a = open.map((id) => relation.residual({ ...mid, [id]: mid[id]! + 1 }) - r0);
      // Check the linear form at every corner of the ranges and at scattered inside points
      // (a difference |a − b| or a digit rule fails this and is left to the search).
      const corners = open.length <= 8 ? 2 ** open.length : 0;
      const points: Values[] = [
        ...Array.from({ length: corners }, (_, k) => {
          const p: Values = { ...vals };
          open.forEach((id, i) => {
            const { lo, hi } = bounds.get(id)!;
            p[id] = (k >> i) & 1 ? hi : lo;
          });
          return p;
        }),
        ...Array.from({ length: 8 }, (_, k) => {
          const p: Values = { ...vals };
          open.forEach((id, i) => {
            const { lo, hi } = bounds.get(id)!;
            p[id] = lo + (hi - lo) * (((k + 1) * 0.618034 + (i + 1) * 0.414214) % 1);
          });
          return p;
        }),
      ];
      const linear = points.every((p) => {
        const predicted = r0 + open.reduce((sum, id, i) => sum + a[i]! * (p[id]! - mid[id]!), 0);
        const actual = relation.residual(p);
        return Math.abs(actual - predicted) <= 1e-7 * (1 + Math.abs(actual) + Math.abs(r0));
      });
      if (!linear) continue;
      const c0 = r0 - open.reduce((sum, id, i) => sum + a[i]! * mid[id]!, 0);
      const term = (i: number) => {
        const { lo, hi } = bounds.get(open[i]!)!;
        return [a[i]! * lo, a[i]! * hi].sort((x, y) => x - y) as [number, number];
      };
      for (let i = 0; i < open.length; i++) {
        if (Math.abs(a[i]!) < 1e-12) continue;
        let restLo = c0;
        let restHi = c0;
        for (let j = 0; j < open.length; j++) {
          if (j === i) continue;
          const [lo, hi] = term(j);
          restLo += lo;
          restHi += hi;
        }
        // aᵢ·xᵢ = −rest
        const [x1, x2] = [-restHi / a[i]!, -restLo / a[i]!].sort((x, y) => x - y) as [
          number,
          number,
        ];
        const b = bounds.get(open[i]!)!;
        const lo = Math.max(b.lo, Math.ceil(x1 / b.f - 1e-9) * b.f);
        const hi = Math.min(b.hi, Math.floor(x2 / b.f + 1e-9) * b.f);
        if (lo > hi) return false;
        if (lo !== b.lo || hi !== b.hi) {
          bounds.set(open[i]!, { lo, hi, f: b.f });
          changed = true;
        }
      }
    }
    if (!changed) break;
  }
  return true;
}

/**
 * Searches whole-number values for the unknowns that fit every relation, stopping after
 * `limit` solutions or when the work budget runs out (`exhausted`). It branches on the
 * whole-number unknowns (with ranges) and lets the formulas find the rest; when decimal
 * unknowns remain undetermined it reports `exhausted` (can't tell).
 */
function wholeSolutions(
  system: System,
  values: Values,
  previous: Values,
  limit: number,
): { solutions: Values[]; exhausted: boolean } {
  const budget = { left: 3000 };
  const solutions: Values[] = [];
  let exhausted = false;
  const search = (vals: Values) => {
    const open = system.variables.filter(
      (v) => !(v.id in vals) && system.relations.some((r) => r.vars.includes(v.id)),
    );
    if (open.length === 0) {
      solutions.push(vals);
      return;
    }
    // Branch on the whole-number unknowns; the formulas then find the others. If only
    // decimal unknowns are left, the search can't tell.
    const whole = open.filter((v) => wholeValues(v));
    if (whole.length === 0) {
      exhausted = true;
      return;
    }
    const bounds: Bounds = new Map(
      whole.map((v) => {
        const f = v.unitFactor ?? 1;
        return [
          v.id,
          { lo: Math.ceil(v.min! / f - 1e-9) * f, hi: Math.floor(v.max! / f + 1e-9) * f, f },
        ];
      }),
    );
    if (!narrow(system, vals, bounds)) return;
    const [id, b] = [...bounds].reduce((x, y) => (y[1].hi - y[1].lo < x[1].hi - x[1].lo ? y : x));
    for (let x = b.lo; x <= b.hi + 1e-9; x += b.f) {
      if (budget.left <= 0) {
        exhausted = true;
        return;
      }
      const trial = propagate(system, { ...vals, [id]: x }, previous, [], budget);
      if (trial.ok) search(trial.values);
      if (exhausted || solutions.length >= limit) return;
    }
  };
  search(values);
  return { solutions, exhausted };
}

/** The same system with each whole-number range widened, to tell math from range limits. */
const widened = (system: System): System => ({
  relations: system.relations,
  variables: system.variables.map((v) => {
    if (!v.integer || v.min === undefined || v.max === undefined) return v;
    const span = Math.max(v.max - v.min, 10 * (v.unitFactor ?? 1));
    return { ...v, min: v.min - 2 * span, max: v.max + 2 * span };
  }),
});

/**
 * Solves the system from the givens. Newer givens take priority: an older given is dropped
 * when newer ones already determine it or conflict with it.
 */
export function solve(system: System, given: readonly Given[], previous: Values = {}): SolveResult {
  const byId = new Map(system.variables.map((v) => [v.id, v]));
  let known: Values = {};
  let trace: TraceStep[] = [];
  const kept: Given[] = [];
  const dropped: string[] = [];
  const cleared: string[] = [];
  let rejected: SolveResult['rejected'];

  for (let i = given.length - 1; i >= 0; i--) {
    const g = given[i]!;
    const variable = byId.get(g.id);
    const isNewest = i === given.length - 1;
    if (!variable) continue;
    // Already found from newer input: keep it only if it matches or another possible value
    // fits it (e.g. the other answer to a difference); otherwise newer input wins.
    const determined = g.id in known;
    if (determined && closeTo(normalizeValue(variable, g.value), known[g.id]!)) {
      dropped.push(g.id);
      continue;
    }
    const invalid = checkValue(variable, g.value);
    if (invalid) {
      if (isNewest) {
        rejected = { id: g.id, reason: invalid };
      } else {
        dropped.push(g.id);
        cleared.push(g.id);
      }
      continue;
    }
    // Re-solve from the kept givens (not the values derived from them), so a value that had
    // two possibilities can take the other one if this older given needs it.
    const givens = Object.fromEntries(kept.map((k) => [k.id, k.value]));
    const propagated = propagate(
      system,
      { ...givens, [g.id]: normalizeValue(variable, g.value) },
      previous,
    );
    // With values still unknown, check some whole numbers can still fill them in.
    const none =
      propagated.ok &&
      Object.keys(propagated.values).length < system.variables.length &&
      (() => {
        const r = wholeSolutions(system, propagated.values, previous, 1);
        return !r.exhausted && r.solutions.length === 0;
      })();
    const trial: Propagation = none
      ? { ok: false, reason: 'No whole numbers fit these values' }
      : propagated;
    if (trial.ok) {
      known = trial.values;
      trace = trial.trace;
      kept.unshift({ id: g.id, value: normalizeValue(variable, g.value) });
    } else if (isNewest) {
      rejected = { id: g.id, reason: trial.reason };
    } else {
      dropped.push(g.id);
      if (!determined) cleared.push(g.id);
    }
  }

  // Unknowns the formulas fix together (e.g. c + s = 20 with c = s): a value that is the same
  // in every whole-number solution, even with the ranges widened, is filled in.
  if (Object.keys(known).length < system.variables.length) {
    const wide = widened(system);
    const r = wholeSolutions(wide, known, previous, 40);
    const first = r.solutions[0];
    if (!r.exhausted && r.solutions.length < 40 && first) {
      for (const v of system.variables) {
        if (v.id in known || !(v.id in first)) continue;
        // Same value in every solution: the formulas fix it (e.g. a difference).
        const x = first[v.id]!;
        if (!r.solutions.every((sol) => closeTo(sol[v.id]!, x))) continue;
        if (checkValue(v, x) !== undefined) continue;
        known = { ...known, [v.id]: x };
        const relation = system.relations.find((rel) => rel.vars.includes(v.id))!;
        trace = [...trace, { id: v.id, relation: relation.id, exact: false }];
      }
    }
  }

  const givenIds = new Set(kept.map((g) => g.id));
  const ids = system.variables.map((v) => v.id);
  return {
    values: known,
    given: kept,
    derived: ids.filter((id) => id in known && !givenIds.has(id)),
    trace,
    unknown: ids.filter((id) => !(id in known)),
    dropped,
    cleared,
    rejected,
  };
}
