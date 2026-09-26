/**
 * The harness's independent brute-force search: every whole-number solution of a module's
 * formulas within the ranges (or with the ranges widened), used to check what the solver
 * found, rejected or left unknown. Test-only: imported by sampling.test.ts.
 */
import { checkValue, holds, type Given, type System } from '@/engine/solve';
import type { Values, VariableDef } from '@/engine/types';

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function rng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1));
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(next() * xs.length)]!;
  const shuffle = <T>(xs: readonly T[]): T[] => {
    const out = [...xs];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [out[i], out[j]] = [out[j]!, out[i]!];
    }
    return out;
  };
  return { next, int, pick, shuffle };
}
export type Rng = ReturnType<typeof rng>;

const domainCache = new WeakMap<VariableDef, number[] | undefined>();
export function domain(v: VariableDef): number[] | undefined {
  if (domainCache.has(v)) return domainCache.get(v);
  const xs = domainOf(v);
  domainCache.set(v, xs);
  return xs;
}
export function domainOf(v: VariableDef): number[] | undefined {
  if (v.allowed) return v.allowed.map((a) => a * factorOf(v));
  if (!v.integer || v.min === undefined || v.max === undefined) return undefined;
  const f = factorOf(v) * (v.multipleOf ?? 1);
  const lo = Math.ceil(v.min / f - 1e-9);
  const hi = Math.floor(v.max / f + 1e-9);
  if (hi - lo > 25000) return undefined;
  return Array.from({ length: hi - lo + 1 }, (_, i) => (lo + i) * f);
}

const close = (a: number, b: number, rel = 1e-6) => Math.abs(a - b) <= rel * (1 + Math.abs(b));

export const factorOf = (v: VariableDef) => v.unitFactor ?? 1;
export const shownOf = (v: VariableDef, x: number) => x / factorOf(v);

export interface Completion {
  /** true: some full assignment satisfies every relation; false: none; undefined: unknown. */
  feasible: boolean | undefined;
  /** The search saw every solution (so "determined" below is reliable). */
  exhaustive: boolean;
  /** Distinct values each variable takes across the solutions found. */
  seen: Map<string, Set<number>>;
  solutions: number;
}

export const key = (x: number) => Number(x.toPrecision(10));

/**
 * Searches every full assignment consistent with `fixed`: propagates exact rearrangements and
 * branches over whole-number domains. Independent of the solver's order and "newest wins".
 */
/**
 * A relation's residual as c0 + Σ coef·x, when it is affine (checked at random points), so the
 * search can prune a branch whose open values can't bring the residual to 0 within their ranges
 * (e.g. n = a + b + c + e with n = 396 and a = 0: b + c + e reach at most 297).
 */
export type Affine = { c0: number; coef: Map<string, number> };
export const affineCache = new WeakMap<System['relations'][number], Affine | null>();
export function affineOf(rel: System['relations'][number]): Affine | undefined {
  if (affineCache.has(rel)) return affineCache.get(rel) ?? undefined;
  const at = (p: Values) => {
    try {
      return rel.residual(p);
    } catch {
      return NaN;
    }
  };
  const zero = Object.fromEntries(rel.vars.map((id) => [id, 0]));
  const c0 = at(zero);
  const coef = new Map(rel.vars.map((id) => [id, at({ ...zero, [id]: 1 }) - c0]));
  const r = rng(hash(rel.id));
  let ok = Number.isFinite(c0) && [...coef.values()].every(Number.isFinite);
  for (let i = 0; ok && i < 16; i++) {
    const p = Object.fromEntries(rel.vars.map((id) => [id, r.int(-50, 150)]));
    const lin = c0 + rel.vars.reduce((s, id) => s + coef.get(id)! * p[id]!, 0);
    ok = close(at(p), lin, 1e-9);
  }
  const out = ok ? { c0, coef } : null;
  affineCache.set(rel, out);
  return out ?? undefined;
}

/** True when no relation can solve for `id` (it can only be given). */
export const isRoot = (sys: System, id: string) =>
  sys.relations.every((rel) => {
    const fn = rel.solve?.[id];
    return !rel.vars.includes(id) || !fn || fn.length === 0;
  });

export function complete(
  sys: System,
  fixed: Values,
  maxSolutions = 64,
  maxNodes = 40000,
): Completion {
  const byId = new Map(sys.variables.map((v) => [v.id, v]));
  const seen = new Map(sys.variables.map((v) => [v.id, new Set<number>()]));
  /** An affine relation whose residual can't reach 0 with the open values in their ranges. */
  const hopeless = (vals: Values) =>
    sys.relations.some((rel) => {
      const aff = affineOf(rel);
      if (!aff) return false;
      let lo = aff.c0;
      let hi = aff.c0;
      for (const id of rel.vars) {
        const k = aff.coef.get(id)!;
        if (id in vals) {
          lo += k * vals[id]!;
          hi += k * vals[id]!;
          continue;
        }
        const v = byId.get(id)!;
        if (v.min === undefined || v.max === undefined) return false;
        lo += Math.min(k * v.min, k * v.max);
        hi += Math.max(k * v.min, k * v.max);
      }
      return lo > 1e-9 * (1 + Math.abs(lo)) || hi < -1e-9 * (1 + Math.abs(hi));
    });
  let solutions = 0;
  let nodes = 0;
  let aborted = false;

  const valid = (v: VariableDef, x: number) => checkValue(v, x) === undefined;
  const norm = (v: VariableDef, x: number) =>
    v.integer ? Math.round(x / factorOf(v)) * factorOf(v) : x;

  const search = (start: Values) => {
    if (aborted) return;
    if (++nodes > maxNodes || solutions >= maxSolutions) {
      aborted = true;
      return;
    }
    const vals = { ...start };
    let changed = true;
    while (changed) {
      changed = false;
      for (const rel of sys.relations) {
        const unknowns = rel.vars.filter((id) => !(id in vals));
        if (unknowns.length === 0) {
          if (!holds(rel, vals)) return;
          continue;
        }
        if (unknowns.length !== 1) continue;
        const id = unknowns[0]!;
        const fn = rel.solve?.[id];
        if (!fn || fn.length === 0) continue;
        const out = fn(vals);
        const raw = out === undefined ? [] : Array.isArray(out) ? out : [out];
        if (raw.length === 0) continue; // e.g. 0 ÷ 0: the rearrangement can't tell; branch instead
        const v = byId.get(id)!;
        const cands = [
          ...new Set(
            raw
              .filter((x) => Number.isFinite(x) && valid(v, x))
              .map((x) => norm(v, x))
              .filter((x) => holds(rel, { ...vals, [id]: x })),
          ),
        ];
        if (cands.length === 0) return;
        if (cands.length > 1) {
          for (const x of cands) search({ ...vals, [id]: x });
          return;
        }
        vals[id] = cands[0]!;
        changed = true;
      }
    }
    const open = sys.variables.filter((v) => !(v.id in vals));
    if (open.length > 0 && hopeless(vals)) return;
    if (open.length === 0) {
      solutions++;
      for (const [id, x] of Object.entries(vals)) seen.get(id)?.add(key(x));
      return;
    }
    let best: { id: string; xs: number[] } | undefined;
    // Branch first on values that only the student can give (no rearrangement finds them,
    // e.g. the number being rounded): everything else then follows by propagation.
    const roots = open.filter((v) => isRoot(sys, v.id));
    for (const v of roots.some((v) => domain(v)) ? roots : open) {
      const xs = domain(v);
      if (xs && (!best || xs.length < best.xs.length)) best = { id: v.id, xs };
    }
    if (!best) {
      aborted = true;
      return;
    }
    for (const x of best.xs) search({ ...vals, [best.id]: x });
  };

  // Givens must themselves be valid.
  for (const [id, x] of Object.entries(fixed)) {
    const v = byId.get(id);
    if (!v || !valid(v, x)) return { feasible: false, exhaustive: true, seen, solutions: 0 };
  }
  search(fixed);
  return {
    feasible: solutions > 0 ? true : aborted ? undefined : false,
    exhaustive: !aborted,
    seen,
    solutions,
  };
}

export const asValues = (gs: readonly Given[]): Values =>
  Object.fromEntries(gs.map((g) => [g.id, g.value]));

/** The same system with every range widened (10×), so only the formulas can determine values. */
const relaxCache = new WeakMap<System, System>();
export function relax(sys: System): System {
  const hit = relaxCache.get(sys);
  if (hit) return hit;
  const out = relaxOf(sys);
  relaxCache.set(sys, out);
  return out;
}
export function relaxOf(sys: System): System {
  return {
    relations: sys.relations,
    variables: sys.variables.map((v) => {
      if (v.min === undefined || v.max === undefined) return v;
      const w = 10 * (v.max - v.min + factorOf(v));
      return { ...v, min: v.min - w, max: v.max + w };
    }),
  };
}
