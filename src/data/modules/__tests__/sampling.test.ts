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
 * SAMPLES (random givens per module, default 300), SAMPLING_REPORT=1 (print a summary).
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
const N_RANDOM = Number(env.SAMPLES ?? 300);
const N_SEQUENCES = 40;
const SEQUENCE_LENGTH = 10;
const N_PER_UNIT_CHOICE = 16;
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
function domain(v: VariableDef): number[] | undefined {
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
function complete(sys: System, fixed: Values, maxSolutions = 64, maxNodes = 40000): Completion {
  const byId = new Map(sys.variables.map((v) => [v.id, v]));
  const seen = new Map(sys.variables.map((v) => [v.id, new Set<number>()]));
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
const PHRASES: [RegExp, (...xs: number[]) => number][] = [
  [new RegExp(`difference of (${NUM}) and (${NUM})`), (a, b) => Math.abs(a - b)],
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
  [new RegExp(`(${NUM}) (?:ones|corners|sides|cubes)`), (a) => a],
];

/** Evaluates a rendered expression ("(45 − 5) ÷ 10", "4 tens + 5 ones"); undefined if unknown. */
function evaluate(text: string): number | undefined {
  let s = text.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/·/g, '*');
  for (let guard = 0; guard < 50; guard++) {
    let replaced = false;
    for (const [re, fn] of PHRASES) {
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
    case 'balance':
      for (const id of [...rep.left, ...rep.right]) count(id, 'balance counters');
      for (const pan of [rep.left, rep.right]) {
        const total = pan.reduce((s, id) => s + (val(id) ?? 0), 0);
        // Rows of 5, or rows of 10 smaller counters above 20: at most 40 fit a pan.
        if (total > 40) out.push(`balance pan holds ${total} counters (5+ rows of 10)`);
      }
      break;
    case 'baseTen':
      for (const id of [...rep.groups, ...(rep.total ? [rep.total] : [])])
        count(id, 'blocks', 1000);
      break;
    case 'unitTiles': {
      count(rep.count, 'units');
      count(rep.total, 'small units');
      const [n, s, t] = [val(rep.count), val(rep.size), val(rep.total)];
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
    case 'array':
      count(rep.rows, 'array rows', rep.max);
      count(rep.columns, 'array columns', rep.max);
      break;
    case 'ruler':
      for (const id of rep.lengths) {
        const x = val(id);
        if (x !== undefined && x < 0) out.push(`ruler length ${id} negative`);
      }
      break;
    case 'coins': {
      for (const c of rep.coins) count(c.var, 'coins', 20);
      const t = val(rep.total);
      const parts = rep.coins.map((c) => val(c.var));
      if (t !== undefined && parts.every((x) => x !== undefined)) {
        const sum = rep.coins.reduce((s, c, i) => s + c.cents * parts[i]!, 0);
        if (Math.abs(sum - t) > 1e-9) out.push(`coins add to ${sum}¢, total shows ${t}¢`);
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
function relax(sys: System): System {
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
    ]),
    ...w.check.map((x) => x.formula),
    ...w.convertIn,
    ...w.convertOut,
  ];
  for (const t of texts) {
    if (BAD_TEXT.test(t)) c.f.add('error', `${c.label}step text shows a bad value: "${t}"`, where);
  }
  const allNonNegative = c.module.variables.every((v) => (v.min ?? -1) >= 0);
  for (const s of w.steps) {
    const value = Number(s.result.split(' = ')[1]?.split(' ')[0]);
    if (!s.substituted) {
      c.f.add('harness', `${c.label}step for ${s.id} solved numerically (not evaluated)`, where);
      continue;
    }
    const expr = s.substituted.slice(s.substituted.indexOf(' = ') + 3);
    if (allNonNegative && /\(-/.test(expr)) {
      c.f.add('error', `${c.label}step substitutes a negative count: "${s.substituted}"`, where);
    }
    const x = evaluate(expr);
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
