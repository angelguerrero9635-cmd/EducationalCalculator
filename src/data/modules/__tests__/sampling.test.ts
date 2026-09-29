/**
 * Variable-sampling harness (the sampled-inputs evidence for .claude/agents/lesson-reviewer.md).
 *
 * Samples random givens, student-style edit sequences and unit choices through the real solver,
 * editing state and step builder, and checks every result against an independent brute-force
 * search over each module's whole-number domains.
 *
 *   MODULE_IDS=m.K.,m.1.,m.2. pnpm -s test src/data/modules/__tests__/sampling.test.ts
 *
 * Env: MODULE_IDS (comma-separated ids or id prefixes; default all modules), SEED (default 1),
 * SAMPLES (random givens per module, default 12), SEQUENCES (edit sequences per module,
 * default 2), UNIT_CASES (random givens per unit choice, default 3; a finding shows up in the
 * first few samples, so the defaults keep a full run short; a review run raises them:
 * SAMPLES=100 SEQUENCES=15 UNIT_CASES=10), EDGE_BIAS (share of sampled values taken from the
 * edges: min, max, one step inside each, 0, 1 and 2; default 0.3; a review run lowers SAMPLES and
 * raises this to spend its samples on the boundaries), SAMPLING_REPORT=1 (print a summary).
 */
import {
  checkValue,
  holds,
  solve,
  type Given,
  type SolveResult,
  type System,
} from '@/engine/solve';
import { parseNumber } from '@/engine/format';
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

import { TESTED_MODULES } from '..';
import {
  BAD_TEXT,
  PLURAL,
  evaluate,
  evaluateAll,
  plainWalkthrough,
  shownClose,
  withinRounding,
} from '../harness/evaluate';
import { pictureCoverage, repIssues } from '../harness/pictures';
import {
  asValues,
  complete,
  factorOf,
  hash,
  relax,
  rng,
  shownOf,
  type Completion,
  type Rng,
} from '../harness/search';
import { buildSteps } from '../buildSteps';
import type { ModuleDef } from '../types';
import { scoped } from '../harness/scope';

// ─── Configuration ───────────────────────────────────────────────────────────

const env: Record<string, string | undefined> =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const SEED = Number(env.SEED ?? 1);
const N_RANDOM = Number(env.SAMPLES ?? 12);
const N_SEQUENCES = Number(env.SEQUENCES ?? 2);
const EDGE_BIAS = Number(env.EDGE_BIAS ?? 0.3);
const SEQUENCE_LENGTH = 10;
const N_PER_UNIT_CHOICE = Number(env.UNIT_CASES ?? 3);
const REPORT = env.SAMPLING_REPORT === '1';

const selected = scoped(TESTED_MODULES);

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

/** Range of a variable in its shown unit (whole-number lesson ranges apply to the shown number). */
function shownRange(v: VariableDef, example: number | undefined): [number, number] {
  const f = factorOf(v);
  const scale = Math.max(10, Math.abs((example ?? 1) / f) * 10);
  const lo = v.min !== undefined ? v.min / f : -scale;
  const hi = v.max !== undefined ? v.max / f : scale;
  return [Math.min(lo, hi), Math.max(lo, hi)];
}

/** Whole-number domain (formula units), or undefined when not enumerable. */

/**
 * A random valid value (formula units), with the edges over-sampled (EDGE_BIAS): min, max, one
 * step inside each, 0, 1 and 2, where the range allows them.
 */
function sampleValue(r: Rng, v: VariableDef, example: number | undefined): number {
  const f = factorOf(v);
  if (v.allowed) {
    const a = v.allowed;
    const ends = [a[0]!, a[a.length - 1]!];
    return (r.next() < EDGE_BIAS ? r.pick(ends) : r.pick(a)) * f;
  }
  const [lo, hi] = shownRange(v, example);
  const step = v.integer ? 1 : (v.step ?? 0.1);
  const edges = [lo, hi, lo + step, hi - step, 0, 1, 2].filter((x) => x >= lo && x <= hi);
  let s: number;
  if (r.next() < EDGE_BIAS) s = r.pick(edges);
  else if (v.integer) s = r.int(Math.ceil(lo - 1e-9), Math.floor(hi + 1e-9));
  else {
    s = lo + r.next() * (hi - lo);
    // Tenths half the time; otherwise to the value's own step, as a student types it (not 15
    // decimals).
    s =
      r.next() < 0.5
        ? Math.round(s * 10) / 10
        : v.step
          ? Number((Math.round(s / v.step) * v.step).toFixed(10))
          : s;
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
  if (v.allowed) {
    // A whole number in range the lesson doesn't allow (7 when counting by 5s, 10s, 100s).
    const lo = Math.min(...v.allowed);
    const hi = Math.max(...v.allowed);
    const between = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).filter(
      (x) => !v.allowed!.includes(x),
    );
    if (between.length) options.push(r.pick(between) * f);
  }
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

/**
 * The number an answer line ends at ("x = 36", "$7.50", "33 1/3 groups", "3/8 inch"): a
 * mixed number or fraction counts as its value.
 */
function resultNumber(result: string, exp = false): number {
  // "about $3.33": a price rounded to the cent.
  const rhs = (result.split(' = ')[1] ?? '').replace(/^about /, '');
  const mixed = /^(-?)(?:(\d+) )?(\d+)\/(\d+)(?![\d.])/.exec(rhs);
  if (mixed) {
    const x = Number(mixed[2] ?? 0) + Number(mixed[3]) / Number(mixed[4]);
    return mixed[1] ? -x : x;
  }
  // A repeating decimal (0.1666…) is its exact value.
  const rep = /^[-−]?\d[\d,]*\.\d+…/.exec(rhs);
  if (rep) return Number(parseNumber(rep[0]));
  // Scientific notation (4.7 × 10⁵, −3 × 10⁻⁴) and multiples of π (36π) are one number.
  const sci = /^([-−]?[\d.]+) × 10(⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)/.exec(rhs);
  if (sci) {
    const n = Number([...sci[2]!].map((c) => (c === '⁻' ? '-' : '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c))).join(''));
    return Number(sci[1]!.replace('−', '-')) * 10 ** n;
  }
  const pi = /^([-−]?[\d.]*)π/.exec(rhs);
  if (pi) {
    const k =
      pi[1] === '' ? 1 : pi[1] === '−' || pi[1] === '-' ? -1 : Number(pi[1]!.replace('−', '-'));
    return k * Math.PI;
  }
  const re = exp ? /^\$?(-?[\d.]+(?:e[-+]?\d+)?)/ : /^\$?(-?[\d.]+)/;
  return Number(re.exec(rhs)?.[1]);
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
    c.f.add('minor', `${c.label}brute-force search gave up (continuous or large domain)`, '');
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
      // A value that only order rules pin (3 ≤ median ≤ 3) is left for the student by design:
      // no step can find it from a rule that only checks.
      const formula = c.sys.relations.some(
        (r) => !r.constraint && (r.solve?.[v.id]?.length ?? 0) > 0,
      );
      if (!formula) {
        c.f.add(
          'minor',
          `${c.label}${v.id} is pinned by an order rule only`,
          `${where} → ${v.id} = ${shown}`,
        );
        continue;
      }
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

/** Step-by-step: substituted expressions compute to the result, checks balance, text is clean. */
function checkSteps(c: Ctx, res: SolveResult, where: string) {
  let w;
  try {
    // The steps show 1,000; the arithmetic checks read 1000.
    w = plainWalkthrough(buildSteps(c.module, res, c.units));
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
      ...s.lines,
      ...(s.written ? [s.written.says] : []),
    ]),
    ...w.check.map((x) => x.formula),
    ...w.convertIn,
    ...w.convertOut,
  ];
  for (const t of texts) {
    if (BAD_TEXT.test(t)) c.f.add('error', `${c.label}step text shows a bad value: "${t}"`, where);
    // Unrounded binary fractions ("13.999999999999998") in anything a student reads. Small
    // values shown to 4 significant figures ("0.0002006 km") have fewer than 10 decimals.
    // (a repeating decimal written out, 0.692307692307…, is not one).
    const raw = /\d\.\d{10,}(?![\d…])/.exec(t);
    if (raw) c.f.add('error', `${c.label}step text shows an unrounded number: "${t}"`, where);
    // Number words agree with their count: "1 ten", "2 tens" (not "1 tens" or "2 ten and").
    const bad = PLURAL.exec(t);
    if (bad)
      c.f.add('minor', `${c.label}count and word don't agree: "${bad[0]}"`, `${where} → "${t}"`);
  }
  const allNonNegative = c.module.variables.every((v) => (v.min ?? -1) >= 0);
  for (const s of w.steps) {
    // A price under a cent has no number to compare.
    if (/ = less than 1 cent/.test(s.result)) continue;
    // The answer's leading number ("536¢ ($5.36)" → 536).
    const value = resultNumber(s.result, true);
    // The substituted line is left out when it would only repeat the rearranged line (numbers
    // only, e.g. "t = 6 − 3 − 2") or the result ("s = 4"): evaluate the rearranged line then.
    const line = s.substituted ?? s.rearranged;
    if (!line) {
      c.f.add('minor', `${c.label}step for ${s.id} solved numerically (not evaluated)`, where);
      continue;
    }
    const expr = line.slice(line.indexOf(' = ') + 3);

    if (allNonNegative && /\(-/.test(expr)) {
      c.f.add('error', `${c.label}step substitutes a negative count: "${s.substituted}"`, where);
    }
    const xs = evaluateAll(expr);
    // A rearranged line in symbols ("s = v") has no numbers to check.
    if (xs.length === 0 && !s.substituted) continue;
    if (xs.length === 0) {
      c.f.add(
        'harness',
        `${c.label}can't evaluate step text "${expr.replace(/[\d.]+/g, 'N')}"`,
        where,
      );
    } else if (!xs.some((x) => shownClose(x, value, expr)) && !withinRounding(value, expr)) {
      c.f.add('error', `${c.label}step "${s.substituted}" ≠ "${s.result}"`, where);
    }
  }
  // A line shown twice in one walkthrough (the same pairing in two steps) is padding.
  const seen = new Map<string, string>();
  for (const s of w.steps) {
    for (const line of s.lines) {
      if (!/\d/.test(line) || line.length < 8) continue;
      const first = seen.get(line);
      if (first !== undefined && first !== s.id) {
        c.f.add(
          'error',
          `${c.label}line "${line}" is shown in two steps (${first}, ${s.id})`,
          where,
        );
      }
      seen.set(line, s.id);
    }
  }
  // Written work (a column sum, a long-division bracket) says one equation; it must be true
  // and end at the step's answer (a division with a remainder ends at the quotient).
  for (const s of w.steps) {
    if (!s.written) continue;
    const says = s.written.says;
    const answer = resultNumber(s.result);
    const long = /^(\d+) ÷ (\d+) = (\d+) remainder (\d+)$/.exec(says);
    const plain = /^(.*) = (\d+(?:\.\d+…?)?)$/.exec(says);
    const said = plain ? Number(parseNumber(plain[2]!)) : NaN;
    const x = plain ? evaluate(plain[1]!) : undefined;
    const ok = long
      ? Number(long[3]) * Number(long[2]) + Number(long[4]) === Number(long[1]) &&
        Number(long[4]) < Number(long[2])
      : x !== undefined && shownClose(x, said);
    const ends = long ? Number(long[3]) : said;
    // "about $17.27": the answer is the work's end rounded to the cent (or under a cent).
    const rounded = / = about \$/.test(s.result)
      ? Math.abs(ends - answer) <= 0.0051
      : / = less than 1 cent/.test(s.result) && ends < 0.01;
    if (!ok) c.f.add('error', `${c.label}written work is wrong: "${says}"`, where);
    else if (ends !== answer && !rounded) {
      c.f.add('error', `${c.label}written work "${says}" doesn't end at ${s.result}`, where);
    }
    // A decimal grid writes every place after the point (0.05, not "0. 5"): a digit row must
    // have no blank cell after its point.
    for (const row of s.written.rows) {
      const at = row.findIndex((cell) => cell.text === '.');
      const digitRow = row.some((cell) => /\d/.test(cell.text) && !cell.small);
      if (at >= 0 && digitRow && row.slice(at + 1).some((cell) => cell.text === '')) {
        c.f.add('minor', `${c.label}written work leaves a blank place after the point`, where);
        break;
      }
    }
  }
  // Worked-arithmetic lines ("100 + 50 + 10 + 5 + 3 = 168¢", "168¢ − 118¢ = 50¢ left"): each
  // sum or difference must come out to the number after its "=".
  for (const s of w.steps) {
    for (const line of s.work ?? []) {
      // Not the tail of a letter term: "x + 7 − 7 = 12 − 7" undoes a step, it doesn't add 7 − 7.
      const m =
        /(?<![\d.]|[A-Za-z]\s*[+−×÷-]\s*)((?:\d+(?:\.\d+)?¢?\s*[+−-]\s*)+\d+(?:\.\d+)?¢?)\s*=\s*(\d+(?:\.\d+)?(?:e[-+]?\d+)?)/.exec(
          line,
        );
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
    const answer = resultNumber(s.result);
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
  // A price shown "about $0.10" (or "less than 1 cent") stands for its exact value, which the
  // check uses.
  for (const q of [...w.given, ...w.find])
    if (/^about \$|^less than 1 cent/.test(q.value) && res.values[q.id] !== undefined)
      shown.add(res.values[q.id]!);
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
    // Comparisons ("3/8 < 5/8, 2 parts apart"): the sign must match the two sides.
    const formula = chk.formula
      .replace(/, (\d+) (?:parts? )?apart$/, '')
      // "Faces: 2 + 4 = 6", "3 + 4 = 7 in all", "5¢ + 10¢ = 15¢"
      .replace(/^[A-Za-z][^:=]*: /, '')
      .replace(/ in all$/, '')
      .replace(/¢/g, '')
      // "8 × 5 = 40, so 40 is a multiple of 8": the sentence after the number sentence is words.
      .replace(/, so .*$/, '')
      // "50 ÷ 9 = 5 remainder 5" balances as 5 × 9 + 5 = 50.
      .replace(/^([\d,]+) ÷ ([\d,]+) = ([\d,]+) remainder ([\d,]+)$/, '$3 × $2 + $4 = $1');
    const sign = / ([<>=]) /.exec(formula)?.[1];
    const sides = formula.split(/ [<>=] /);
    if (sides.length !== 2) continue;
    const [l, r] = sides.map((side) => evaluate(side));
    if (sign !== '=' && l !== undefined && r !== undefined) {
      if (sign === '<' ? !(l < r) : !(l > r)) {
        c.f.add('error', `${c.label}check line compares the wrong way: "${chk.formula}"`, where);
      }
      continue;
    }
    if (l === undefined || r === undefined) {
      c.f.add(
        'harness',
        `${c.label}can't evaluate check "${chk.formula.replace(/[\d.]+/g, 'N')}"`,
        where,
      );
    } else if (
      !shownClose(l, r, chk.formula) &&
      !withinRounding(l, sides[1]!) &&
      !withinRounding(r, sides[0]!)
    ) {
      c.f.add('error', `${c.label}check line shows unequal sides: "${chk.formula}"`, where);
    }
  }
  // Conversion lines: "s = A u1 = B u2   (1 X = f Y)".
  for (const line of [...w.convertIn, ...w.convertOut]) {
    // A number is one token, or scientific notation (3 × 10⁷).
    const N = String.raw`(?:\(?[-−]?[\d.,]+ × 10⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+\)?|\S+)`;
    const m = new RegExp(
      String.raw`= (${N}) (.+?) = (${N}) (.+?) {3}\(1 (.+?) = (${N}) (.+)\)$`,
    ).exec(line);
    if (!m) {
      c.f.add('harness', `${c.label}can't parse conversion line`, line);
      continue;
    }
    const [, a, u1, b, u2, x, factor, y] = m;
    const num = (t: string) => {
      const n = parseNumber(t.replace(/^\((.*)\)$/, '$1'));
      return typeof n === 'number' ? n : NaN;
    };
    if (!shownClose(convert(num(a!), u1!, u2!), num(b!))) {
      c.f.add('error', `${c.label}conversion is wrong: "${line}"`, where);
    }
    if (!close(convert(1, x!, y!), num(factor!), 1e-5)) {
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

/** Values a student can type: a derived value is only ever worked out. */
const typable = (c: Ctx) => c.sys.variables.filter((v) => !v.derived);

function randomGivens(c: Ctx, r: Rng): Given[] {
  const vars = typable(c);
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
      // A value past a data set's count has none: it is not part of the solution.
      const ids = r.shuffle(typable(c).map((v) => v.id)).filter((id) => id in res.values);
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
      // A derived value has no box to retype into.
      const knownIds = Object.keys(state.result.values).filter(
        (id) => !c.sys.variables.find((v) => v.id === id)?.derived,
      );
      if (roll < 0.12 && knownIds.length) {
        mode = 'same';
        const id = r.pick(knownIds);
        updates = { [id]: state.result.values[id] };
      } else if (roll < 0.22 && givenIds.length) {
        mode = 'clear';
        updates = { [r.pick(givenIds)]: undefined };
      } else if (roll < 0.3) {
        const v = r.pick(typable(c));
        const bad = invalidValue(r, v);
        if (bad === undefined) updates = { [v.id]: sampleValue(r, v, c.module.example[v.id]) };
        else {
          mode = 'invalid';
          updates = { [v.id]: bad };
        }
      } else if (roll < 0.38 && typable(c).length > 2) {
        mode = 'multi';
        const [a, b] = r.shuffle(typable(c));
        updates = {
          [a!.id]: sampleValue(r, a!, c.module.example[a!.id]),
          [b!.id]: sampleValue(r, b!, c.module.example[b!.id]),
        };
      } else {
        const v = r.pick(typable(c));
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
      for (const u of unitChoices(v, system, m.variables)) {
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
    // A line the harness can't read is a gap to close (teach PHRASES a new phrase, or add a
    // check for a new picture kind), so it fails like an error (check B).
    const errors = [...f.lines('error'), ...f.lines('harness').map((x) => `[harness] ${x}`)];
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
