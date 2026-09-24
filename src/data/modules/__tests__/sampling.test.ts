/**
 * Variable-sampling harness (see .claude/agents/variable-sampling-reviewer.md).
 *
 * Samples random givens, student-style edit sequences and unit choices through the real solver,
 * editing state and step builder, and checks every result against an independent brute-force
 * search over each module's whole-number domains.
 *
 *   MODULE_IDS=m.K.,m.1.,m.2. pnpm -s test src/data/modules/__tests__/sampling.test.ts
 *
 * Env: MODULE_IDS (comma-separated ids or id prefixes; default all modules), SEED (default 1),
 * SAMPLES (random givens per module, default 100), SEQUENCES (edit sequences per module,
 * default 15; raise both for a deep run), SAMPLING_REPORT=1 (print a summary).
 */
import {
  checkValue,
  holds,
  solve,
  type Given,
  type SolveResult,
  type System,
} from '@/engine/solve';
import { changeUnits, initialState, setValues, type CalcState } from '@/engine/state';
import type { Values, VariableDef } from '@/engine/types';
import {
  linkedUnits,
  makeUnitContext,
  unitChoices,
  unitOptions,
  type UnitChoice,
  type UnitContext,
} from '@/engine/unitContext';
import { convert, getUnit } from '@/engine/units';

import { MODULES } from '..';
import { buildSteps } from '../buildSteps';
import type { ModuleDef, Representation } from '../types';

// ─── Configuration ───────────────────────────────────────────────────────────

const env: Record<string, string | undefined> =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const FILTER = (env.MODULE_IDS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const SEED = Number(env.SEED ?? 1);
const N_RANDOM = Number(env.SAMPLES ?? 100);
const N_SEQUENCES = Number(env.SEQUENCES ?? 15);
const SEQUENCE_LENGTH = 10;
const N_PER_UNIT_CHOICE = 10;
const REPORT = env.SAMPLING_REPORT === '1';

const selected = MODULES.filter(
  (m) => FILTER.length === 0 || FILTER.some((f) => m.id === f || m.id.startsWith(f)),
);

// ─── Seeded random numbers ───────────────────────────────────────────────────

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rng(seed: number) {
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
type Rng = ReturnType<typeof rng>;

// ─── Findings ────────────────────────────────────────────────────────────────

type Kind = 'error' | 'minor' | 'harness';

class Findings {
  private items = new Map<string, { kind: Kind; message: string; n: number; examples: string[] }>();
  counts = { random: 0, edits: 0, sequences: 0, units: 0 };

  add(kind: Kind, message: string, example: string) {
    const key = `${kind}|${message}`;
    const item = this.items.get(key) ?? { kind, message, n: 0, examples: [] };
    item.n++;
    if (item.examples.length < 2) item.examples.push(example);
    this.items.set(key, item);
  }

  lines(kind: Kind): string[] {
    return [...this.items.values()]
      .filter((x) => x.kind === kind)
      .map((x) => `${x.message} (×${x.n}) e.g. ${x.examples.join(' | ')}`);
  }
}

// ─── Values, ranges and sampling ─────────────────────────────────────────────

const factorOf = (v: VariableDef) => v.unitFactor ?? 1;
const shownOf = (v: VariableDef, x: number) => x / factorOf(v);

/** Range of a variable in its shown unit (whole-number lesson ranges apply to the shown number). */
function shownRange(v: VariableDef, example: number | undefined): [number, number] {
  const f = factorOf(v);
  const scale = Math.max(10, Math.abs((example ?? 1) / f) * 10);
  const lo = v.min !== undefined ? v.min / f : -scale;
  const hi = v.max !== undefined ? v.max / f : scale;
  return [Math.min(lo, hi), Math.max(lo, hi)];
}

/** Whole-number domain (formula units), or undefined when not enumerable. */
const domainCache = new WeakMap<VariableDef, number[] | undefined>();
function domain(v: VariableDef): number[] | undefined {
  if (domainCache.has(v)) return domainCache.get(v);
  const xs = domainOf(v);
  domainCache.set(v, xs);
  return xs;
}
function domainOf(v: VariableDef): number[] | undefined {
  if (!v.integer || v.min === undefined || v.max === undefined) return undefined;
  const f = factorOf(v) * (v.multipleOf ?? 1);
  const lo = Math.ceil(v.min / f - 1e-9);
  const hi = Math.floor(v.max / f + 1e-9);
  if (hi - lo > 25000) return undefined;
  return Array.from({ length: hi - lo + 1 }, (_, i) => (lo + i) * f);
}

/** A random valid value (formula units), with the edges min, max, 0 and 1 over-sampled. */
function sampleValue(r: Rng, v: VariableDef, example: number | undefined): number {
  const f = factorOf(v);
  const [lo, hi] = shownRange(v, example);
  const edges = [lo, hi, 0, 1].filter((x) => x >= lo && x <= hi);
  let s: number;
  if (r.next() < 0.3) s = r.pick(edges);
  else if (v.integer) s = r.int(Math.ceil(lo - 1e-9), Math.floor(hi + 1e-9));
  else {
    s = lo + r.next() * (hi - lo);
    if (r.next() < 0.5) s = Math.round(s * 10) / 10;
    s = Math.min(hi, Math.max(lo, s));
  }
  if (v.integer) s = Math.round(s);
  if (v.multipleOf) s = Math.round(s / v.multipleOf) * v.multipleOf;
  return s * f;
}

/** A value the UI must reject: out of range, or a fraction for a whole-number value. */
function invalidValue(r: Rng, v: VariableDef): number | undefined {
  const f = factorOf(v);
  const options: number[] = [];
  if (v.min !== undefined) options.push(v.min - f * (v.integer ? 1 : 1 + Math.abs(v.min / f)));
  if (v.max !== undefined) options.push(v.max + f * (v.integer ? 1 : 1 + Math.abs(v.max / f)));
  if (v.integer && v.min !== undefined && v.max !== undefined && v.max - v.min >= f) {
    options.push(v.min + 0.5 * f);
  }
  return options.length ? r.pick(options) : undefined;
}

const close = (a: number, b: number, rel = 1e-6) => Math.abs(a - b) <= rel * (1 + Math.abs(b));

const describe_ = (sys: System, vals: Values | readonly Given[]) => {
  const byId = new Map(sys.variables.map((v) => [v.id, v]));
  const entries = Array.isArray(vals)
    ? vals.map((g) => [g.id, g.value] as const)
    : Object.entries(vals);
  return entries
    .map(([id, x]) => {
      const v = byId.get(id);
      const shown = v ? shownOf(v, x) : x;
      return `${id}=${Number(shown.toPrecision(6))}${v?.displayUnit ? ` ${v.displayUnit}` : ''}`;
    })
    .join(', ');
};

// ─── Independent brute-force search ──────────────────────────────────────────

interface Completion {
  /** true: some full assignment satisfies every relation; false: none; undefined: unknown. */
  feasible: boolean | undefined;
  /** The search saw every solution (so "determined" below is reliable). */
  exhaustive: boolean;
  /** Distinct values each variable takes across the solutions found. */
  seen: Map<string, Set<number>>;
  solutions: number;
}

const key = (x: number) => Number(x.toPrecision(10));

/**
 * Searches every full assignment consistent with `fixed`: propagates exact rearrangements and
 * branches over whole-number domains. Independent of the solver's order and "newest wins".
 */
/**
 * A relation's residual as c0 + Σ coef·x, when it is affine (checked at random points), so the
 * search can prune a branch whose open values can't bring the residual to 0 within their ranges
 * (e.g. n = a + b + c + e with n = 396 and a = 0: b + c + e reach at most 297).
 */
type Affine = { c0: number; coef: Map<string, number> };
const affineCache = new WeakMap<System['relations'][number], Affine | null>();
function affineOf(rel: System['relations'][number]): Affine | undefined {
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

function complete(sys: System, fixed: Values, maxSolutions = 64, maxNodes = 40000): Completion {
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
    for (const v of open) {
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

const asValues = (gs: readonly Given[]): Values =>
  Object.fromEntries(gs.map((g) => [g.id, g.value]));

// ─── Evaluating rendered step text ───────────────────────────────────────────

const NUM = String.raw`\(?-?\d+(?:\.\d+)?(?:e[-+]?\d+)?\)?`;
const toNum = (s: string) => Number(s.replace(/[()]/g, ''));
const COIN: Record<string, number> = {
  dollar: 100,
  dollars: 100,
  quarter: 25,
  quarters: 25,
  dime: 10,
  dimes: 10,
  nickel: 5,
  nickels: 5,
};
const PHRASES: [RegExp, (...xs: number[]) => number][] = [
  [new RegExp(`difference of (${NUM}) and (${NUM})`), (a, b) => Math.abs(a - b)],
  [new RegExp(`size of (${NUM}) equal jumps from (${NUM}) to (${NUM})`), (k, a, n) => (n - a) / k],
  [new RegExp(`jumps of (${NUM}) from (${NUM}) to (${NUM})`), (s, a, n) => (n - a) / s],
  [new RegExp(`tens from (${NUM}) to (${NUM})`), (a, b) => (b - a) / 10],
  [new RegExp(`(${NUM}) minutes?`), (a) => a],
  [new RegExp(`(${NUM}) jumps of (${NUM})`), (a, b) => a * b],
  [new RegExp(`rows of (${NUM}) in (${NUM})`), (c, n) => n / c],
  [new RegExp(`groups of (${NUM}) in (${NUM})`), (r, c) => c / r],
  [new RegExp(`(${NUM}) shared (?:by|into) (${NUM}) (?:clips|rows|groups)`), (a, b) => a / b],
  [new RegExp(`(${NUM}) groups of (${NUM})`), (a, b) => a * b],
  [new RegExp(`half of (${NUM})`), (a) => a / 2],
  [new RegExp(`a third of (${NUM})`), (a) => a / 3],
  [new RegExp(`twelves in (${NUM})`), (a) => a / 12],
  [new RegExp(`(${NUM}) feet of (${NUM}) inches`), (a, b) => a * b],
  [new RegExp(`trapezoids in (${NUM})`), (a) => a / 3],
  [new RegExp(`rhombuses in (${NUM})`), (a) => a / 2],
  [new RegExp(`(${NUM}) trapezoids`), (a) => 3 * a],
  [new RegExp(`(${NUM}) rhombuses`), (a) => 2 * a],
  [new RegExp(`(${NUM}) triangles`), (a) => a],
  [new RegExp(`hundreds part of (${NUM})`), (a) => 100 * Math.floor(a / 100)],
  [new RegExp(`tens part of (${NUM})`), (a) => 10 * (Math.floor(a / 10) % 10)],
  [new RegExp(`row of (${NUM})`), (a) => Math.ceil(a / 10)],
  [new RegExp(`half hours in (${NUM})`), (a) => a / 30],
  [new RegExp(`(${NUM}) half hours?`), (a) => 30 * a],
  [new RegExp(`(${NUM}) cuts in half`), (a) => 2 ** a],
  [new RegExp(`cuts to make (${NUM})(?: parts)?`), (a) => Math.log2(a)],
  [new RegExp(`fives in (${NUM})`), (a) => a / 5],
  [new RegExp(`(${NUM}) fives?`), (a) => 5 * a],
  [new RegExp(`hundreds in (${NUM})`), (a) => a / 100],
  [new RegExp(`hundreds digit of (${NUM})`), (a) => Math.floor(a / 100) % 10],
  [new RegExp(`tens digit of (${NUM})`), (a) => Math.floor(a / 10) % 10],
  [new RegExp(`ones digit of (${NUM})`), (a) => a % 10],
  [new RegExp(`full tens in (${NUM})`), (a) => Math.floor(a / 10)],
  [new RegExp(`ones left in (${NUM})`), (a) => a % 10],
  [new RegExp(`tens in (${NUM})`), (a) => a / 10],
  [new RegExp(`pairs in (${NUM})`), (a) => Math.floor(a / 2)],
  [new RegExp(`left over from (${NUM})`), (a) => a % 2],
  [new RegExp(`(${NUM}) clips of (${NUM}) cubes`), (a, b) => a * b],
  [new RegExp(`(${NUM}) skips of (${NUM})`), (a, b) => a * b],
  [new RegExp(`(${NUM}) rows of (${NUM})`), (a, b) => a * b],
  [new RegExp(`(${NUM}) hundreds`), (a) => 100 * a],
  [new RegExp(`(${NUM}) tens`), (a) => 10 * a],
  [new RegExp(`(${NUM}) (?:ones|corners|sides|cubes|parts|angles)`), (a) => a],
  // Bills (Grade 2 money): "3 $10 bills" and "$10 bills (3)" are $30; "$10 bills in (30)" is 3.
  [new RegExp(`(${NUM}) \\$(\\d+) bills?`), (a, b) => a * b],
  [new RegExp(`\\$(\\d+) bills? (${NUM})`), (b, a) => a * b],
  [new RegExp(`\\$(\\d+) bills in (${NUM})`), (b, n) => n / b],
];

/** Evaluates a rendered expression ("(45 − 5) ÷ 10", "4 tens + 5 ones"); undefined if unknown. */
function evaluate(text: string): number | undefined {
  let s = text.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/·/g, '*');
  // Long repeated sums are shortened: "2 + 2 + … (12 times)" is 2 × 12.
  s = s.replace(/(\d+(?:\.\d+)?) \+ \1 \+ … \((\d+) times\)/g, (_, a, n) => `(${a} * ${n})`);
  for (let guard = 0; guard < 50; guard++) {
    let replaced = false;
    // Unwrap brackets around a single number, "(300)" → "300", so outer brackets can reduce.
    s = s
      .replace(/\((-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)\)/g, ' $1 ')
      .replace(/\s+/g, ' ')
      .trim();
    // Work out bracketed arithmetic first, so phrases see one number: "tens in (45 - 5)".
    // (an operator after a digit, so a lone negative like "(-5)" is left alone)
    const inner = /\(([^()]*\d\s*[-+*/]\s*[^()]*)\)/.exec(s);
    if (inner && /^[-\d\s.+*/e]+$/.test(inner[1]!)) {
      try {
        const x = new Function(`return (${inner[1]});`)() as number;
        s = s.slice(0, inner.index) + `(${x})` + s.slice(inner.index + inner[0].length);
        continue;
      } catch {
        // leave it for the final evaluation
      }
    }
    // "3 quarters" → 75 first; "quarters in (75)" only once the bracket is one number.
    const coins = /\(?(-?[\d.]+)\)? (dollars?|quarters?|dimes?|nickels?|penny|pennies)/.exec(s);
    const coinsIn =
      /(dollars|quarters|dimes|nickels) in (?:\((-?[\d.]+)\)|(-?[\d.]+)(?![\d.]))/.exec(s);
    if (coins || coinsIn) {
      const m = (coins ?? coinsIn)!;
      const x = coins
        ? Number(coins[1]) * (COIN[coins[2]!] ?? 1)
        : Number(coinsIn![2] ?? coinsIn![3]) / COIN[coinsIn![1]!]!;
      s = s.slice(0, m.index) + `(${x})` + s.slice(m.index + m[0].length);
      continue;
    }
    // Amounts with a leading number ("3 tens") before phrases that read a number ("tens in").
    const ordered = [
      ...PHRASES.filter(([re]) => re.source.startsWith('(')),
      ...PHRASES.filter(([re]) => !re.source.startsWith('(')),
    ];
    for (const [re, fn] of ordered) {
      const m = re.exec(s);
      if (m) {
        const x = fn(...m.slice(1).map(toNum));
        s = s.slice(0, m.index) + `(${x})` + s.slice(m.index + m[0].length);
        replaced = true;
        break;
      }
    }
    if (!replaced) break;
  }
  if (!/^[\d\s.+\-*/()e]+$/.test(s)) return undefined;
  try {
    const x = new Function(`return (${s});`)() as unknown;
    return typeof x === 'number' ? x : undefined;
  } catch {
    return undefined;
  }
}

/** Display rounding: 4 decimals or 4 significant figures in scientific notation. */
/**
 * Equal up to display rounding. Shown numbers keep 4 decimals, so a rounded factor times a
 * large number (−2.4644 × 120) can be off by up to about 5e-5 × that number: `text` (the line
 * the numbers came from) widens the tolerance by its largest number.
 */
const shownClose = (a: number, b: number, text = '') => {
  const largest = Math.max(0, ...(text.match(/\d+(\.\d+)?/g) ?? []).map(Number));
  return Math.abs(a - b) <= 2e-3 * Math.max(Math.abs(a), Math.abs(b)) + 1e-3 + 1e-4 * largest;
};

const PLURAL =
  /(?<![\d.,$])\b(?:1 (?:tens|ones|hundreds|groups|bills|feet|inches|cubes|rows|jumps|triangles|clips)\b|(?:0|[2-9]|\d\d+) (?:ten|one|hundred|group|bill|foot|inch|row|jump|clip)\b(?![-\w]))/;
const BAD_TEXT = /NaN|undefined|Infinity|null|(^|[^\w.])[-−]0(?![\d.])/;

// ─── Representation data ─────────────────────────────────────────────────────

function repIssues(
  rep: Representation,
  shown: (id: string) => number | undefined,
  byId: Map<string, VariableDef>,
): string[] {
  const out: string[] = [];
  const val = (x: string | number) => (typeof x === 'number' ? x : shown(x));
  const count = (id: string | number, what: string, max?: number) => {
    const x = val(id);
    if (x === undefined) return;
    if (x < 0) out.push(`${what} ${id} is negative (${x})`);
    if (Math.abs(x - Math.round(x)) > 1e-9) out.push(`${what} ${id} is not whole (${x})`);
    if (max !== undefined && x > max) out.push(`${what} ${id} = ${x} exceeds the drawing's ${max}`);
  };
  switch (rep.kind) {
    case 'tenFrame': {
      const cap = 10 * (rep.frames ?? 1);
      count(rep.first, 'ten-frame', cap);
      count(rep.second, 'ten-frame', cap);
      count(rep.total, 'ten-frame', cap);
      const [a, b, c] = [val(rep.first), val(rep.second), val(rep.total)];
      if (a !== undefined && b !== undefined && a + b > cap) {
        out.push(`ten-frame counters ${a} + ${b} overflow ${cap} cells`);
      }
      if (a !== undefined && b !== undefined && c !== undefined && a + b !== c) {
        out.push(`ten-frame groups ${a} + ${b} don't make the total ${c}`);
      }
      break;
    }
    case 'hundredChart': {
      const n = val(rep.value);
      if (n !== undefined && (n < 1 || n > rep.max)) {
        out.push(
          `${n === 0 ? '~' : ''}hundred chart value ${n} is not a cell (1–${rep.max}); nothing is highlighted`,
        );
      }
      for (const id of rep.marks ?? []) {
        const x = val(id);
        // Marks past the end are listed in the caption ("past the chart"); below 1 is lost.
        if (x !== undefined && x < 1) {
          out.push(
            `${x === 0 ? '~' : ''}hundred chart mark ${id} = ${x} is off the chart (1–${rep.max})`,
          );
        }
      }
      break;
    }
    case 'compareRows': {
      const max = Math.max(10, byId.get(rep.a)?.max ?? 10, byId.get(rep.b)?.max ?? 10);
      count(rep.a, 'row', max);
      count(rep.b, 'row', max);
      const [a, b, d] = [val(rep.a), val(rep.b), rep.difference ? val(rep.difference) : undefined];
      if (a !== undefined && b !== undefined && d !== undefined && Math.abs(a - b) !== d) {
        out.push(`rows ${a}, ${b} don't show difference ${d}`);
      }
      break;
    }
    case 'polygon': {
      const s = val(rep.sides);
      if (s !== undefined && (s < 3 || s !== Math.round(s))) out.push(`polygon with ${s} sides`);
      break;
    }
    case 'balance': {
      const ids = [...rep.left, ...rep.right, ...(rep.takeAway ? [rep.takeAway] : [])];
      for (const id of ids) count(id, 'balance counters');
      for (const pan of [rep.left, rep.right]) {
        const total = pan.reduce((s, id) => s + (val(id) ?? 0), 0);
        // Rows of 5, or rows of 10 smaller counters above 20: at most 40 fit a pan.
        if (total > 40) out.push(`balance pan holds ${total} counters (5+ rows of 10)`);
      }
      // Taken-away counters are crossed out of the left pan's own counters (Balance.tsx).
      const k = rep.takeAway ? val(rep.takeAway) : undefined;
      const left = rep.left.map(val);
      if (k !== undefined && left.every((x) => x !== undefined)) {
        const sum = left.reduce((s, x) => s! + x!, 0)!;
        if (k > sum) out.push(`balance crosses out ${k} of only ${sum} counters`);
      }
      break;
    }
    case 'baseTen':
      for (const id of [...rep.groups, ...(rep.total ? [rep.total] : [])])
        count(id, 'blocks', 1000);
      break;
    case 'unitTiles': {
      count(rep.count, 'units');
      count(rep.total, 'small units');
      const [n, s, t] = [
        val(rep.count),
        typeof rep.size === 'number' ? rep.size : val(rep.size),
        val(rep.total),
      ];
      if (s !== undefined && s < 1) out.push(`unit size ${s} < 1`);
      if (n !== undefined && s !== undefined && t !== undefined && n * s !== t) {
        out.push(`tiles ${n} × ${s} ≠ ${t}`);
      }
      break;
    }
    case 'clock': {
      const h = val(rep.hour);
      const m = val(rep.minute);
      if (h !== undefined && (h < 1 || h > 12 || h !== Math.round(h))) out.push(`clock hour ${h}`);
      if (m !== undefined && (m < 0 || m >= 60)) out.push(`clock minute ${m} out of 0–59`);
      if (m !== undefined && m % rep.minuteStep !== 0) {
        out.push(`clock minute ${m} is not a multiple of the hand's ${rep.minuteStep}-minute snap`);
      }
      break;
    }
    case 'partition': {
      const p = val(rep.parts);
      const k = val(rep.shaded);
      count(rep.shaded, 'shaded parts');
      if (p !== undefined && p < 1) out.push(`partition with ${p} parts`);
      if (p !== undefined && k !== undefined && k > p) out.push(`${k} shaded of ${p} parts`);
      break;
    }
    case 'skipCount': {
      count(rep.count, 'skips', 30);
      const s = val(rep.step);
      if (s !== undefined && s < 1) out.push(`skip size ${s} < 1 (drawn as 1)`);
      break;
    }
    case 'pairs':
      count(rep.value, 'objects', rep.max);
      break;
    case 'hops': {
      // The line stretches to fit every stop (Hops.tsx), so a stop past min–max is still drawn;
      // but a story can't have fewer than 0 things part way, and a stop past the lesson's range
      // ("every amount stays within 100") stretches the line.
      const start = val(rep.start);
      const hops = rep.hops.map((h) => val(h.var));
      if (start === undefined || hops.some((x) => x === undefined)) break;
      let at = start;
      rep.hops.forEach((h, i) => {
        at += h.sign * hops[i]!;
        if (at < 0) out.push(`hops go below 0 part way (stop ${i + 1} = ${at})`);
        else if (i < rep.hops.length - 1 && (at < rep.min || at > rep.max)) {
          out.push(`hops stop ${i + 1} = ${at} is past the line's ${rep.min}–${rep.max}`);
        }
      });
      const e = val(rep.end);
      if (e !== undefined && e !== at) out.push(`hops land on ${at}, not the end ${e}`);
      break;
    }
    case 'numberBond': {
      // Dots in rows of 5 inside each part's circle: two rows fit (NumberBond.tsx).
      const [a, b] = rep.parts;
      count(a, 'number bond part', 10);
      count(b, 'number bond part', 10);
      count(rep.whole, 'number bond whole');
      const [x, y, w] = [val(a), val(b), val(rep.whole)];
      if (x !== undefined && y !== undefined && w !== undefined && x + y !== w) {
        out.push(`number bond parts ${x} + ${y} don't make the whole ${w}`);
      }
      break;
    }
    case 'patternBlocks': {
      const ids = [rep.trapezoids, rep.rhombuses, rep.triangles];
      for (const id of ids) count(id, 'pattern blocks');
      const [z, r, t] = ids.map(val);
      if (z !== undefined && r !== undefined && t !== undefined && 3 * z + 2 * r + t !== 6) {
        out.push(`pattern blocks cover ${3 * z + 2 * r + t} of the hexagon's 6 triangles`);
      }
      if (z !== undefined && r !== undefined && 3 * z + 2 * r > 6) {
        out.push(`pattern blocks overflow the hexagon (${3 * z + 2 * r} triangles)`);
      }
      break;
    }
    case 'lineUp': {
      // One child per cell, sized for the count's maximum (LineUp.tsx).
      count(rep.count, 'children in line', byId.get(rep.count)?.max ?? 10);
      count(rep.before, 'children in front');
      count(rep.after, 'children behind');
      const [n, p, f, b] = [rep.count, rep.position, rep.before, rep.after].map(val);
      if (n !== undefined && p !== undefined && (p < 1 || p > n)) {
        out.push(`picked child ${p} is not in a line of ${n}`);
      }
      if (p !== undefined && f !== undefined && f !== p - 1) {
        out.push(`child ${p} has ${p - 1} in front, not ${f}`);
      }
      if (n !== undefined && p !== undefined && b !== undefined && b !== n - p) {
        out.push(`child ${p} of ${n} has ${n - p} behind, not ${b}`);
      }
      break;
    }
    case 'equalGroups': {
      // Each group is an 88 px circle with 13 px dots: 4 rows of 4 fit (EqualGroups.tsx).
      count(rep.groups, 'groups', 12);
      count(rep.each, 'dots in a group', 16);
      const [g, k, n] = [val(rep.groups), val(rep.each), val(rep.total)];
      if (g !== undefined && k !== undefined && n !== undefined && g * k !== n) {
        out.push(`${g} groups of ${k} drawn, total shows ${n}`);
      }
      break;
    }
    case 'prism': {
      // Prism.tsx draws at least 3 sides and names 3–6.
      const n = val(rep.sides);
      if (n === undefined) break;
      if (n < 3 || n !== Math.round(n)) out.push(`prism with a ${n}-sided base`);
      const [F, E, V] = [rep.faces, rep.edges, rep.corners].map(val);
      if (F !== undefined && F !== n + 2) out.push(`prism with ${n} sides drawn, ${F} faces shown`);
      if (E !== undefined && E !== 3 * n) out.push(`prism with ${n} sides drawn, ${E} edges shown`);
      if (V !== undefined && V !== 2 * n) {
        out.push(`prism with ${n} sides drawn, ${V} corners shown`);
      }
      break;
    }
    case 'array':
      count(rep.rows, 'array rows', rep.max);
      count(rep.columns, 'array columns', rep.max);
      break;
    case 'ruler': {
      for (const id of rep.lengths) {
        const x = val(id);
        if (x !== undefined && x < 0) out.push(`ruler length ${id} negative`);
      }
      // A broken ruler: the object starts at `from` and ends at `to` = from + its length.
      const [a, L, b] = [rep.from, rep.lengths[0], rep.to].map((id) =>
        id === undefined ? undefined : val(id),
      );
      if (rep.from && a !== undefined && a < 0) out.push(`ruler start mark ${a} is before 0`);
      if (a !== undefined && L !== undefined && b !== undefined && a + L !== b) {
        out.push(`ruler object from ${a} of length ${L} doesn't end at ${b}`);
      }
      break;
    }
    case 'coins': {
      for (const c of rep.coins) count(c.var, 'coins', 20);
      const t = val(rep.total);
      const parts = rep.coins.map((c) => val(c.var));
      if (t !== undefined && parts.every((x) => x !== undefined)) {
        const sum =
          rep.coins.reduce((s, c, i) => s + c.cents * parts[i]!, 0) / (rep.dollars ? 100 : 1);
        if (Math.abs(sum - t) > 1e-9) out.push(`coins add to ${sum}, total shows ${t}`);
      }
      break;
    }
    case 'cubeTrains':
      for (const id of new Set(rep.rows.flat(2))) count(id, 'cubes', 40);
      break;
    case 'pictureGraph':
      for (const c of rep.columns) count(c.var, 'pictures', rep.max);
      break;
    case 'numberLine':
      for (const id of [rep.start, rep.end]) {
        const x = val(id);
        if (x !== undefined && (x < rep.min || x > rep.max)) {
          out.push(`number line point ${id} = ${x} off the line (${rep.min}–${rep.max})`);
        }
      }
      break;
    default:
      break;
  }
  return out;
}

/**
 * Every value in the number sentences can be found in the picture: drawn by the representation
 * (any variable id its spec names) or labeled under it (`pictureLabels`).
 */
function pictureCoverage(m: ModuleDef): string[] {
  const ids = new Set(m.variables.map((v) => v.id));
  const drawn = new Set<string>();
  const walk = (x: unknown) => {
    if (typeof x === 'string' && ids.has(x)) drawn.add(x);
    else if (Array.isArray(x)) x.forEach(walk);
    else if (x && typeof x === 'object') {
      for (const [k, y] of Object.entries(x)) if (k !== 'kind' && k !== 'icon') walk(y);
    }
  };
  walk(m.representation);
  const out: string[] = [];
  for (const id of m.pictureLabels ?? []) {
    if (!ids.has(id)) out.push(`pictureLabels names ${id}, which is not a variable`);
    else if (drawn.has(id))
      out.push(`pictureLabels repeats ${id}, which the picture already shows`);
  }
  const labeled = new Set(m.pictureLabels ?? []);
  const missing = m.variables.filter((v) => !drawn.has(v.id) && !labeled.has(v.id));
  const lone = new Set(m.standalone?.vars ?? []);
  for (const v of missing) {
    if (!lone.has(v.id)) out.push(`${v.id} (${v.name}) is neither drawn nor in pictureLabels`);
  }
  return out;
}

// ─── Checks on one solver result ─────────────────────────────────────────────

interface Ctx {
  module: ModuleDef;
  sys: System;
  units: UnitContext;
  byId: Map<string, VariableDef>;
  f: Findings;
  label: string;
}

/** Values stay valid, relations hold, givens keep their value. */
function checkInvariants(c: Ctx, res: SolveResult, where: string) {
  for (const [id, x] of Object.entries(res.values)) {
    const v = c.byId.get(id)!;
    if (!Number.isFinite(x)) c.f.add('error', `${c.label}${id} is not finite`, where);
    const bad = checkValue(v, x);
    if (bad) c.f.add('error', `${c.label}${id} out of range / not whole: ${bad}`, where);
  }
  for (const rel of c.sys.relations) {
    if (rel.vars.every((id) => id in res.values) && !holds(rel, res.values)) {
      c.f.add('error', `${c.label}relation "${rel.id}" fails for returned values`, where);
    }
  }
  for (const g of res.given) {
    if (!close(res.values[g.id]!, g.value)) {
      c.f.add('error', `${c.label}given ${g.id} silently changed`, where);
    }
  }
}

/**
 * Compares a solver result with the brute-force search: accepted inputs are consistent,
 * cleared and rejected inputs really conflict, and determined values are calculated.
 */
function checkAgainstSearch(c: Ctx, sent: readonly Given[], res: SolveResult, where: string) {
  const kept = asValues(res.given);
  const search = complete(c.sys, kept);
  if (search.feasible === false) {
    c.f.add(
      'error',
      `${c.label}accepts inputs that no valid values can satisfy (other values stay "?")`,
      `${where} → kept [${describe_(c.sys, res.given)}]`,
    );
    return;
  }
  if (search.feasible === undefined) {
    c.f.add('harness', `${c.label}brute-force search gave up (continuous or large domain)`, '');
  }
  const determined = (s: Completion, id: string) => {
    const xs = s.seen.get(id)!;
    return s.exhaustive && s.solutions > 0 && xs.size === 1 ? [...xs][0]! : undefined;
  };
  // Determined by the formulas alone (ranges widened), or only because a range limit forces it.
  let relaxed: Completion | undefined;
  for (const v of c.sys.variables) {
    const x = determined(search, v.id);
    if (x === undefined) continue;
    const shown = Number(shownOf(v, x).toPrecision(6));
    if (!(v.id in res.values)) {
      relaxed ??= complete(relax(c.sys), kept, 64, 8000);
      if (determined(relaxed, v.id) !== undefined) {
        c.f.add(
          'error',
          `${c.label}${v.id} is determined by the formulas but left unknown`,
          `${where} → ${v.id} = ${shown}`,
        );
      } else {
        c.f.add(
          'minor',
          `${c.label}${v.id} is forced by a range limit but left unknown`,
          `${where} → ${v.id} = ${shown}`,
        );
      }
    } else if (!close(res.values[v.id]!, x)) {
      c.f.add('error', `${c.label}${v.id} calculated wrong`, `${where} → expected ${shown}`);
    }
  }
  const sentById = new Map(sent.map((g) => [g.id, g]));
  for (const id of res.cleared) {
    const g = sentById.get(id);
    if (!g) continue;
    const trial = complete(c.sys, { ...kept, [id]: g.value });
    if (trial.feasible === true) {
      c.f.add('error', `${c.label}${id} cleared although it fits the newer inputs`, where);
    }
  }
  // An older input may be recalculated (dropped) when newer inputs determine it. When they
  // allow several values (e.g. "more or fewer"), it must not be overwritten while it still fits.
  for (const id of res.dropped.filter((x) => !res.cleared.includes(x))) {
    const g = sentById.get(id);
    if (!g || !(id in res.values) || close(res.values[id]!, g.value)) continue;
    if (determined(search, id) !== undefined) continue;
    if (complete(c.sys, { ...kept, [id]: g.value }).feasible === true) {
      c.f.add(
        'error',
        `${c.label}input ${id} overwritten by the other possible value although it fits`,
        `${where} → ${describe_(c.sys, { [id]: res.values[id]! })}`,
      );
    }
  }
  if (res.rejected) {
    const g = sent[sent.length - 1]!;
    const reason = res.rejected.reason;
    if (!reason || BAD_TEXT.test(reason)) {
      c.f.add('error', `${c.label}unclear rejection message "${reason}"`, where);
    }
    const alone = complete(c.sys, { [g.id]: g.value });
    if (alone.feasible === true) {
      c.f.add('error', `${c.label}rejects ${g.id} although it is possible`, where);
    }
  }
}

/** The same system with every range widened (10×), so only the formulas can determine values. */
const relaxCache = new WeakMap<System, System>();
function relax(sys: System): System {
  const hit = relaxCache.get(sys);
  if (hit) return hit;
  const out = relaxOf(sys);
  relaxCache.set(sys, out);
  return out;
}
function relaxOf(sys: System): System {
  return {
    relations: sys.relations,
    variables: sys.variables.map((v) => {
      if (v.min === undefined || v.max === undefined) return v;
      const w = 10 * (v.max - v.min + factorOf(v));
      return { ...v, min: v.min - w, max: v.max + w };
    }),
  };
}

/** Step-by-step: substituted expressions compute to the result, checks balance, text is clean. */
function checkSteps(c: Ctx, res: SolveResult, where: string) {
  let w;
  try {
    w = buildSteps(c.module, res, c.units);
  } catch (e) {
    c.f.add('error', `${c.label}buildSteps throws: ${(e as Error).message}`, where);
    return;
  }
  const texts = [
    ...[...w.given, ...w.find, ...w.missing].map((q) => `${q.symbol} = ${q.value}`),
    ...w.steps.flatMap((s) => [
      s.title,
      s.formula,
      s.how,
      s.rearranged ?? '',
      s.substituted ?? '',
      s.result,
      ...(s.work ?? []),
    ]),
    ...w.check.map((x) => x.formula),
    ...w.convertIn,
    ...w.convertOut,
  ];
  for (const t of texts) {
    if (BAD_TEXT.test(t)) c.f.add('error', `${c.label}step text shows a bad value: "${t}"`, where);
    // Unrounded binary fractions ("13.999999999999998") in anything a student reads. Small
    // values shown to 4 significant figures ("0.0002006 km") have fewer than 10 decimals.
    const raw = /\d\.\d{10,}/.exec(t);
    if (raw) c.f.add('error', `${c.label}step text shows an unrounded number: "${t}"`, where);
    // Number words agree with their count: "1 ten", "2 tens" (not "1 tens" or "2 ten and").
    const bad = PLURAL.exec(t);
    if (bad)
      c.f.add('minor', `${c.label}count and word don't agree: "${bad[0]}"`, `${where} → "${t}"`);
  }
  const allNonNegative = c.module.variables.every((v) => (v.min ?? -1) >= 0);
  for (const s of w.steps) {
    // The answer's leading number ("536¢ ($5.36)" → 536).
    const value = Number(/^\$?(-?[\d.]+(?:e[-+]?\d+)?)/.exec(s.result.split(' = ')[1] ?? '')?.[1]);
    // The substituted line is left out when it would only repeat the rearranged line (numbers
    // only, e.g. "t = 6 − 3 − 2") or the result ("s = 4"): evaluate the rearranged line then.
    const line = s.substituted ?? s.rearranged;
    if (!line) {
      c.f.add('harness', `${c.label}step for ${s.id} solved numerically (not evaluated)`, where);
      continue;
    }
    const expr = line.slice(line.indexOf(' = ') + 3);

    if (allNonNegative && /\(-/.test(expr)) {
      c.f.add('error', `${c.label}step substitutes a negative count: "${s.substituted}"`, where);
    }
    const x = evaluate(expr);
    // A rearranged line in symbols ("s = v") has no numbers to check.
    if (x === undefined && !s.substituted) continue;
    if (x === undefined) {
      c.f.add(
        'harness',
        `${c.label}can't evaluate step text "${expr.replace(/[\d.]+/g, 'N')}"`,
        where,
      );
    } else if (!shownClose(x, value, expr)) {
      c.f.add('error', `${c.label}step "${s.substituted}" ≠ "${s.result}"`, where);
    }
  }
  // Worked-arithmetic lines ("100 + 50 + 10 + 5 + 3 = 168¢", "168¢ − 118¢ = 50¢ left"): each
  // sum or difference must come out to the number after its "=".
  for (const s of w.steps) {
    for (const line of s.work ?? []) {
      const m = /((?:\d+(?:\.\d+)?¢?\s*[+−-]\s*)+\d+(?:\.\d+)?¢?)\s*=\s*(\d+(?:\.\d+)?)/.exec(line);
      if (!m) continue;
      const x = evaluate(m[1]!.replace(/¢/g, ''));
      if (x === undefined || !shownClose(x, Number(m[2]))) {
        c.f.add('error', `${c.label}work line doesn't add up: "${line}"`, where);
      }
    }
  }
  // Counting lines ("Count on from 4: 5, 6, 7 → 3", "Count by 5s to 25: 5, 10, …, 25 → 5"):
  // the list goes up (or back) by the step from the start, and the arrow is either how many
  // numbers were said or the number reached. When the step's answer is the number reached,
  // an arrow at the count of numbers ("→ 3" for 4 + 3 = 7) points at the wrong number.
  for (const s of w.steps) {
    const answer = Number(/^\$?(-?[\d.]+)/.exec(s.result.split(' = ')[1] ?? '')?.[1]);
    const lines = s.work ?? [];
    lines.forEach((line, i) => {
      const m =
        /(?:\b[Cc]ount\b([^:→]*):|: count on)\s*((?:\d+|…)(?:,\s*(?:\d+|…))*)\s*(?:→\s*\$?(\d+)|$)/.exec(
          line,
        );
      if (!m) return;
      const head = m[1] ?? '';
      const xs = m[2]!.split(',').map((x) => x.trim());
      const nums = xs.filter((x) => x !== '…').map(Number);
      const whole = !xs.includes('…');
      const by = Number(/by (\d+)s/.exec(head)?.[1] ?? (/by tens/.test(head) ? 10 : 1));
      const step = /back/.test(head) ? -by : by;
      const from = /from (\d+)/.exec(head)?.[1];
      const firstOk = from === undefined || nums[0] === Number(from) + step;
      const stepsOk = nums.slice(1, whole ? undefined : 1).every((x, j) => x - nums[j]! === step);
      if (!firstOk || !stepsOk) {
        c.f.add('error', `${c.label}counting line skips or repeats: "${line}"`, where);
        return;
      }
      if (m[3] === undefined || !whole) return;
      const arrow = Number(m[3]);
      const last = nums[nums.length - 1]!;
      if (arrow !== nums.length && arrow !== last) {
        c.f.add(
          'error',
          `${c.label}counting line's arrow is neither the count nor the end: "${line}"`,
          where,
        );
      } else if (
        i === lines.length - 1 &&
        arrow === nums.length &&
        arrow !== answer &&
        last === answer
      ) {
        c.f.add(
          'error',
          `${c.label}counting line ends at how many were counted (${arrow}), not the answer ${s.id} = ${answer}`,
          `${where} → "${line}"`,
        );
      }
    });
  }
  // The check must use the same numbers as the rest of the walkthrough (in the units shown):
  // every number in a check line has to appear in the given values, a step, a work line or the
  // formula's own constants. Catches a check worked in other units or from other values.
  const NUMBER = /\d+(?:\.\d+)?/g;
  const numbersIn = (t: string) => (t.replace(/,(?=\d{3})/g, '').match(NUMBER) ?? []).map(Number);
  const shown = new Set(
    [
      ...[...w.given, ...w.find].map((q) => q.value),
      ...w.steps.flatMap((s) => [
        s.formula,
        s.rearranged ?? '',
        s.substituted ?? '',
        ...(s.work ?? []),
        s.result,
      ]),
      ...c.module.relations.flatMap((r) => [r.id, r.display]),
      // Unit conversions shown before and after the steps ("m = 500 g = 0.5 kg").
      ...w.convertIn,
      ...w.convertOut,
    ].flatMap(numbersIn),
  );
  for (const chk of w.check) {
    const strays = numbersIn(chk.formula).filter((x) => ![...shown].some((y) => shownClose(x, y)));
    if (strays.length) {
      c.f.add(
        'error',
        `${c.label}check uses numbers not shown elsewhere (${strays.join(', ')}): "${chk.formula}"`,
        where,
      );
    }
  }
  for (const chk of w.check) {
    if (!chk.ok) c.f.add('error', `${c.label}check line doesn't balance: "${chk.formula}"`, where);
    const sides = chk.formula.split(' = ');
    if (sides.length !== 2) continue;
    const [l, r] = sides.map(evaluate);
    if (l === undefined || r === undefined) {
      c.f.add(
        'harness',
        `${c.label}can't evaluate check "${chk.formula.replace(/[\d.]+/g, 'N')}"`,
        where,
      );
    } else if (!shownClose(l, r, chk.formula)) {
      c.f.add('error', `${c.label}check line shows unequal sides: "${chk.formula}"`, where);
    }
  }
  // Conversion lines: "s = A u1 = B u2   (1 X = f Y)".
  for (const line of [...w.convertIn, ...w.convertOut]) {
    const m = /= (\S+) (.+?) = (\S+) (.+?) {3}\(1 (.+?) = (\S+) (.+)\)$/.exec(line);
    if (!m) {
      c.f.add('harness', `${c.label}can't parse conversion line`, line);
      continue;
    }
    const [, a, u1, b, u2, x, factor, y] = m;
    if (!shownClose(convert(Number(a), u1!, u2!), Number(b))) {
      c.f.add('error', `${c.label}conversion is wrong: "${line}"`, where);
    }
    if (!close(convert(1, x!, y!), Number(factor), 1e-5)) {
      c.f.add('error', `${c.label}conversion factor is wrong: "${line}"`, where);
    }
  }
}

function checkRep(c: Ctx, res: SolveResult, where: string) {
  const shown = (id: string) =>
    id in res.values ? Math.round(c.units.toDisplay(id, res.values[id]!) * 1e9) / 1e9 : undefined;
  // Issues starting with "~" are cosmetic (e.g. 0 has no cell on a hundred chart).
  for (const issue of repIssues(c.module.representation, shown, c.byId)) {
    const minor = issue.startsWith('~');
    const text = issue.replace(/^~/, '');
    c.f.add(
      minor ? 'minor' : 'error',
      `${c.label}picture: ${text.replace(/-?\d+(\.\d+)?/g, 'N')}`,
      `${where} → ${text}`,
    );
  }
}

function checkAll(c: Ctx, sent: readonly Given[], res: SolveResult) {
  const where = `givens [${describe_(c.sys, sent)}]`;
  checkInvariants(c, res, where);
  checkAgainstSearch(c, sent, res, where);
  checkSteps(c, res, where);
  checkRep(c, res, where);
}

// ─── Sampling stages ─────────────────────────────────────────────────────────

function randomGivens(c: Ctx, r: Rng): Given[] {
  const vars = c.sys.variables;
  const k0 = c.module.startWith.length;
  const size = Math.max(
    1,
    Math.min(vars.length, r.next() < 0.1 ? vars.length : k0 + r.pick([0, 0, 0, -1, 1])),
  );
  return r
    .shuffle(vars)
    .slice(0, size)
    .map((v) => ({ id: v.id, value: sampleValue(r, v, c.module.example[v.id]) }));
}

/** Random givens, and subsets of a consistent solution (which must never conflict). */
function stageRandom(c: Ctx, r: Rng, n: number) {
  for (let i = 0; i < n; i++) {
    const givens = randomGivens(c, r);
    // The UI always passes the values shown before, which include what the student typed.
    const res = solve(c.sys, givens, asValues(givens));
    c.f.counts.random++;
    checkAll(c, givens, res);
    if (res.unknown.length === 0 && !res.rejected) {
      // Every value from one consistent solution: any subset, in any order, must be accepted.
      const ids = r.shuffle(c.sys.variables.map((v) => v.id));
      const size = Math.max(1, Math.min(ids.length, c.module.startWith.length + r.pick([0, 1, 2])));
      const subset = ids.slice(0, size).map((id) => ({ id, value: res.values[id]! }));
      const withPrevious = r.next() < 0.5;
      const again = solve(c.sys, subset, withPrevious ? res.values : asValues(subset));
      c.f.counts.random++;
      const where = `consistent givens [${describe_(c.sys, subset)}]${withPrevious ? ` after [${describe_(c.sys, res.values)}]` : ''}`;
      if (again.rejected || again.cleared.length) {
        c.f.add('error', `${c.label}consistent inputs reported as a conflict`, where);
      }
      checkAll(c, subset, again);
    }
  }
}

function exampleGivens(m: ModuleDef, units: UnitContext): Given[] {
  return m.startWith.map((id) => {
    const v = m.variables.find((x) => x.id === id)!;
    const x = m.example[id]!;
    return { id, value: v.integer ? units.fromDisplay(id, x) : x };
  });
}

/** Edit sequences from the opening example, as a student types. */
function stageEdits(c: Ctx, r: Rng, sequences: number) {
  for (let s = 0; s < sequences; s++) {
    let state: CalcState = initialState(c.sys, exampleGivens(c.module, c.units));
    c.f.counts.sequences++;
    const history: string[] = [];
    for (let e = 0; e < SEQUENCE_LENGTH; e++) {
      const before = state;
      const roll = r.next();
      let updates: Record<string, number | undefined>;
      let mode: 'set' | 'same' | 'clear' | 'invalid' | 'multi' = 'set';
      const givenIds = state.given.map((g) => g.id);
      const knownIds = Object.keys(state.result.values);
      if (roll < 0.12 && knownIds.length) {
        mode = 'same';
        const id = r.pick(knownIds);
        updates = { [id]: state.result.values[id] };
      } else if (roll < 0.22 && givenIds.length) {
        mode = 'clear';
        updates = { [r.pick(givenIds)]: undefined };
      } else if (roll < 0.3) {
        const v = r.pick(c.sys.variables);
        const bad = invalidValue(r, v);
        if (bad === undefined) updates = { [v.id]: sampleValue(r, v, c.module.example[v.id]) };
        else {
          mode = 'invalid';
          updates = { [v.id]: bad };
        }
      } else if (roll < 0.38 && c.sys.variables.length > 2) {
        mode = 'multi';
        const [a, b] = r.shuffle(c.sys.variables);
        updates = {
          [a!.id]: sampleValue(r, a!, c.module.example[a!.id]),
          [b!.id]: sampleValue(r, b!, c.module.example[b!.id]),
        };
      } else {
        const v = r.pick(c.sys.variables);
        updates = { [v.id]: sampleValue(r, v, c.module.example[v.id]) };
      }
      history.push(
        `${mode}:${Object.entries(updates)
          .map(
            ([id, x]) =>
              `${id}=${x === undefined ? '∅' : describe_(c.sys, { [id]: x }).split('=')[1]}`,
          )
          .join('&')}`,
      );
      state = setValues(c.sys, state, updates);
      c.f.counts.edits++;
      const where = `from example, edits ${history.join(' → ')}`;
      const sent = [
        ...before.given.filter((g) => !(g.id in updates)),
        ...Object.entries(updates).flatMap(([id, value]) =>
          value === undefined ? [] : [{ id, value }],
        ),
      ];
      checkInvariants(c, state.result, where);
      checkAgainstSearch(c, sent, state.result, where);
      checkSteps(c, state.result, where);
      checkRep(c, state.result, where);
      for (const [id, msg] of Object.entries(state.errors)) {
        if (!msg || BAD_TEXT.test(msg))
          c.f.add('error', `${c.label}unclear error for ${id}: "${msg}"`, where);
      }
      if (mode === 'invalid') {
        const [id] = Object.keys(updates);
        if (!state.result.rejected || !/^Must be/.test(state.errors[id!] ?? '')) {
          c.f.add('error', `${c.label}invalid value not rejected with a range message`, where);
        }
        const same =
          JSON.stringify(state.given) === JSON.stringify(before.given.filter((g) => g.id !== id));
        if (!same) c.f.add('error', `${c.label}a rejected value changed the other inputs`, where);
      }
      if (mode === 'same') {
        for (const [id, x] of Object.entries(before.result.values)) {
          if (!(id in state.result.values) || !close(state.result.values[id]!, x)) {
            c.f.add('error', `${c.label}retyping a shown value changed ${id}`, where);
          }
        }
        if (Object.keys(state.errors).length) {
          c.f.add('error', `${c.label}retyping a shown value shows an error`, where);
        }
      }
      if (mode === 'set' || mode === 'multi') {
        for (const [id, x] of Object.entries(updates)) {
          if (!state.result.rejected && state.result.given.some((g) => g.id === id)) {
            if (!close(state.result.values[id]!, x!)) {
              c.f.add('error', `${c.label}typed ${id} not kept`, where);
            }
          }
        }
      }
    }
  }
}

/** Every unit choice the UI offers: systems, Mixed, and each per-variable unit. */
function unitChoiceList(m: ModuleDef): UnitChoice[] {
  const opts = unitOptions(m.variables, m.unitSystems);
  if (opts.systems.length === 0) return [];
  const systems: UnitChoice['system'][] = [
    ...opts.systems,
    ...(opts.mixed ? ['mixed' as const] : []),
  ];
  const out = new Map<string, UnitChoice>();
  for (const system of systems) {
    out.set(JSON.stringify({ system }), { system });
    for (const v of m.variables) {
      if (!getUnit(v.unit)) continue;
      for (const u of unitChoices(v, system)) {
        const units = opts.linked ? linkedUnits(m.variables, v.id, u) : { [v.id]: u };
        out.set(JSON.stringify({ system, units }), { system, units });
      }
    }
  }
  return [...out.values()];
}

function makeCtx(m: ModuleDef, f: Findings, choice: UnitChoice, label: string): Ctx {
  const units = makeUnitContext(m, choice);
  return {
    module: m,
    sys: units.system,
    units,
    byId: new Map(units.system.variables.map((v) => [v.id, v])),
    f,
    label,
  };
}

function stageUnits(m: ModuleDef, f: Findings, r: Rng) {
  const choices = unitChoiceList(m);
  if (choices.length <= 1) return;
  const base = makeCtx(m, f, { system: 'metric' }, '');
  const baseState = initialState(base.sys, exampleGivens(m, base.units));
  for (const choice of choices) {
    const label = `[units ${choice.system}${choice.units ? ` ${JSON.stringify(choice.units)}` : ''}] `;
    const c = makeCtx(m, f, choice, label);
    // Round trip of the shown value.
    for (const v of c.sys.variables) {
      const x = m.example[v.id]!;
      if (!close(c.units.fromDisplay(v.id, c.units.toDisplay(v.id, x)), x)) {
        f.add('error', `${label}${v.id} doesn't convert back`, `${x}`);
      }
    }
    stageRandom(c, r, N_PER_UNIT_CHOICE);
    f.counts.units += N_PER_UNIT_CHOICE;
    stageEdits(c, r, 1);
    // Changing units from metric and back keeps the values.
    const there = changeUnits(c.sys, baseState, base.sys);
    f.counts.units++;
    checkInvariants(c, there.result, 'metric example → these units');
    checkSteps(c, there.result, 'metric example → these units');
    for (const v of m.variables) {
      const before = baseState.result.values[v.id];
      const after = there.result.values[v.id];
      if (before === undefined) continue;
      if (after === undefined) {
        f.add('error', `${label}${v.id} lost when changing units`, '');
        continue;
      }
      const expected = v.integer
        ? c.units.fromDisplay(v.id, base.units.toDisplay(v.id, before))
        : before;
      if (!close(after, expected)) {
        f.add('error', `${label}${v.id} changes value when changing units`, `${before} → ${after}`);
      }
    }
    const back = changeUnits(base.sys, there, c.sys);
    for (const [id, x] of Object.entries(baseState.result.values)) {
      if (!close(back.result.values[id] ?? NaN, x)) {
        f.add('error', `${label}${id} differs after changing units there and back`, `${x}`);
      }
    }
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe.each(selected.map((m) => [m.id, m] as [string, ModuleDef]))('sampling %s', (_, m) => {
  it('solves, steps and draws correctly for sampled inputs', () => {
    const f = new Findings();
    const r = rng(hash(m.id) ^ SEED);
    const c = makeCtx(m, f, { system: 'metric' }, '');
    // Values not labeled in the picture break the content standard, not the math: minor.
    for (const issue of pictureCoverage(m)) {
      const kind = /not a variable/.test(issue) ? 'error' : 'minor';
      f.add(kind, `picture: ${issue}`, 'module definition');
    }
    stageRandom(c, r, Math.ceil(N_RANDOM / 2));
    stageEdits(c, r, N_SEQUENCES);
    stageUnits(m, f, r);
    const errors = f.lines('error');
    if (REPORT) {
      const n = f.counts;
      console.log(
        [
          `## ${m.id}`,
          ...errors.map((x) => `- [error] ${x}`),
          ...f.lines('minor').map((x) => `- [minor] ${x}`),
          ...f.lines('harness').map((x) => `- [harness] ${x}`),
          `Samples: ${n.random} random, ${n.sequences} edit sequences (${n.edits} edits), ${n.units} unit cases — ${errors.length} failure kinds`,
        ].join('\n'),
      );
    }
    expect(errors).toEqual([]);
  });
});

it('selects at least one module', () => {
  expect(selected.length).toBeGreaterThan(0);
});
