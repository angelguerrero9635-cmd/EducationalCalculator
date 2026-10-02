import { dollars, formatNumber, lowerFirst, parseNumber, unitFor } from './format';
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
  /**
   * The newest given, if it could not be accepted, with a reason to show the user. `older`:
   * the value is possible alone but not with the older inputs, which stay (a rule or a range
   * says why).
   */
  rejected?: { id: string; reason: string; older?: boolean };
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
  /** The page's id ("m.3.area~split"): its grade sets how a refusal reads (K–5: no decimals). */
  id?: string;
}

/** Kindergarten–Grade 5: a refusal names no decimal or negative a student hasn't met. */
const youngPage = (system: System) => /^[ms]\.(K|[1-5])\./.test(system.id ?? '');

const TOLERANCE = 1e-6;

/**
 * Returns a reason string if `x` (in formula units) is not a valid value for `variable`.
 * With a unit context, the whole-number rule and the numbers in the message refer to the
 * value as shown to the user.
 */
/** A value past its list's count (the 8th value of a data set of 7): left out of everything. */
export function outOfCount(v: VariableDef | undefined, values: Values): boolean {
  if (!v?.countedBy) return false;
  const n = values[v.countedBy.count];
  return n !== undefined && v.countedBy.index > n;
}

export function checkValue(variable: VariableDef, x: number): string | undefined {
  if (!Number.isFinite(x)) return 'Not a number';
  const f = variable.unitFactor ?? 1;
  // A fraction page's numbers read as fractions (0, 1/2, 1, …), as its boxes show them.
  const asFraction = variable.fraction ? { fraction: variable.fraction } : undefined;
  const unit = variable.displayUnit ? ` ${variable.displayUnit}` : '';
  // Money in dollars reads "$84", not "84 $".
  const withUnit = (n: string) => (variable.displayUnit === '$' ? dollars(n) : `${n}${unit}`);
  // To 11 figures of the size (a count of 60,300 worked out as E ÷ P from an E rounded to 12
  // figures is 60,300.00000008), while −999,999,999.5 is still not whole.
  if (
    variable.integer &&
    Math.abs(x / f - Math.round(x / f)) > Math.max(1e-9, 1e-11 * Math.abs(x / f))
  ) {
    return 'Must be a whole number';
  }
  if (
    variable.allowed &&
    !variable.allowed.some((a) => Math.abs(x / f - a) < Math.max(1e-9, 1e-11 * Math.abs(a)))
  ) {
    const list = variable.allowed.map((a) => formatNumber(a, asFraction));
    return `Must be ${list.length > 1 ? `${list.slice(0, -1).join(', ')} or ${list[list.length - 1]}` : list[0]}`;
  }
  const m = variable.multipleOf;
  // Relative to the count of steps: 9,449.871 is 9,449,871.000000002 thousandths in floats.
  const steps = m ? x / f / m : 0;
  if (m && Math.abs(steps - Math.round(steps)) > 1e-9 * Math.max(1, Math.abs(steps))) {
    // Start the list at the smallest allowed multiple (12, 24, 36, … when the minimum is 12).
    const first = Math.max(0, Math.ceil((variable.min ?? 0) / f / m - 1e-9)) * m;
    return `Must be ${[first, first + m, first + 2 * m].map((x) => formatNumber(x, asFraction)).join(', ')}, …`;
  }
  // Limits converted to another unit are shown to 3 significant figures.
  const limit = (bound: number) =>
    formatNumber(f === 1 ? bound : Number((bound / f).toPrecision(3)), asFraction);
  // Whole numbers are compared exactly (the tolerance would let 2,000,000,001 pass 2e9).
  const shown = variable.integer ? Math.round(x / f) * f : x;
  const slack = (bound: number) =>
    variable.integer ? 0 : TOLERANCE * (Math.min(1, f) + Math.abs(bound));
  if (variable.min !== undefined && shown < variable.min - slack(variable.min)) {
    return `Must be at least ${withUnit(limit(variable.min))}`;
  }
  if (variable.max !== undefined && shown > variable.max + slack(variable.max)) {
    return `Must be at most ${withUnit(limit(variable.max))}`;
  }
  return undefined;
}

const normalizeValue = (variable: VariableDef, x: number) => {
  const f = variable.unitFactor ?? 1;
  if (variable.integer) return Math.round(x / f) * f;
  // Scientific notation keeps tiny values (2 × 10⁻¹⁵); elsewhere they are rounding dust.
  if (variable.scientific) return x;
  return Math.abs(x) < 1e-12 ? 0 : x;
};

/**
 * How near 0 a value of `v` counts as 0: a millionth of its step (rounding dust, far below
 * anything its box shows), else a millionth, or next to nothing for a value in scientific
 * notation with no step. Only near 0: elsewhere values are compared relative to their size.
 */
export function floorOf(v: VariableDef | undefined): number {
  const step = v?.step !== undefined && v.step > 0 ? v.step : v?.scientific ? 1e-30 : 1;
  return TOLERANCE * Math.min(1, step);
}

/**
 * Equal to a millionth of the larger size, or both within `floor` of each other near 0. An
 * absolute tolerance (a millionth of 1 + |target|) let any two values under 10⁻⁶ pass:
 * T = 1 × 10⁻⁹ s "checked" against 3.28 × 10⁻⁷ s.
 */
export const closeTo = (x: number, target: number, floor = TOLERANCE) =>
  Math.abs(x - target) <= Math.max(TOLERANCE * Math.max(Math.abs(x), Math.abs(target)), floor);

/** Each variable's near-zero floor by id (cached per variable list). */
const floorsCache = new WeakMap<readonly VariableDef[], Map<string, number>>();
function floorsOf(variables: readonly VariableDef[] | undefined): (id: string) => number {
  if (!variables) return () => TOLERANCE;
  let map = floorsCache.get(variables);
  if (!map) {
    map = new Map(variables.map((v) => [v.id, floorOf(v)]));
    floorsCache.set(variables, map);
  }
  const m = map;
  return (id) => m.get(id) ?? TOLERANCE;
}

/**
 * True when a relation holds for `values`. Where the relation has an exact rearrangement, it
 * re-solves for that variable and compares with a relative tolerance, so formulas that mix
 * very different magnitudes (a rate of 12 and a population of 500,000) are checked precisely,
 * and so are tiny ones (a force of 5 × 10⁻¹⁴ N is not 9.61 × 10⁻¹⁴ N). `variables` gives each
 * value's floor near 0 (`floorOf`); without them it is a millionth.
 * Otherwise it falls back to the residual, scaled by the size of the values.
 */
export function holds(
  relation: Relation,
  values: Values,
  variables?: readonly VariableDef[],
): boolean {
  // A rule only checks (0 when it holds, 1 when not): no tolerance scaled by the values, or
  // a 1 would pass once the numbers are in the thousands.
  if (relation.constraint) return relation.residual(values) === 0;
  const floor = floorsOf(variables);
  for (const [id, fn] of Object.entries(relation.solve ?? {})) {
    const others = { ...values };
    delete others[id];
    const out = fn!(others);
    const candidates = (out === undefined ? [] : Array.isArray(out) ? out : [out]).filter(
      Number.isFinite,
    );
    if (candidates.length > 0) return candidates.some((x) => closeTo(x, values[id]!, floor(id)));
  }
  const r = relation.residual(values);
  if (!Number.isFinite(r)) return false;
  const scale = 1 + Math.max(...relation.vars.map((id) => Math.abs(values[id] ?? 0)));
  return Math.abs(r) <= TOLERANCE * scale * scale;
}

/**
 * True when a relation holds whatever `id` is, the other values as they are (the distance
 * rule at t = 0 and Δx = 0, for any v): it then says nothing about `id`.
 */
export function indifferent(relation: Relation, values: Values, id: string): boolean {
  return [0, 1, -7.3].every((x) => {
    const r = relation.residual({ ...values, [id]: x });
    return Number.isFinite(r) && Math.abs(r) <= 1e-12;
  });
}

/** A relation that is a straight-line sum of its values: the constant and each coefficient. */
type Affine = { c0: number; coef: Map<string, number> };
const affineCache = new WeakMap<Relation, Affine | null>();
function affineOf(rel: Relation): Affine | undefined {
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
  // A rule with no coefficient at all is a pass/fail check that failed every probe (a limit
  // like "n·p ≥ 10" at small points), not a constant sum that can never be met.
  let ok =
    Number.isFinite(c0) &&
    [...coef.values()].every(Number.isFinite) &&
    [...coef.values()].some((c) => c !== 0);
  // Probe a few fixed points: a product or a ratio shows up as a miss.
  for (let i = 1; ok && i <= 6; i++) {
    const p = Object.fromEntries(rel.vars.map((id, k) => [id, ((i * 37 + k * 53) % 200) - 50]));
    const lin = c0 + rel.vars.reduce((t, id) => t + coef.get(id)! * p[id]!, 0);
    const x = at(p);
    ok = Math.abs(x - lin) <= 1e-9 * (1 + Math.abs(lin));
  }
  // A huge constant hides a product at those small points (f·λ − 3 × 10¹⁷ looks flat): a
  // straight-line sum has f(p + q) − f(p) − f(q) + f(0) = 0 at any size, a product does not.
  for (const size of [1e3, 1e6]) {
    if (!ok) break;
    const p = Object.fromEntries(rel.vars.map((id, k) => [id, size * (k + 1)]));
    const q = Object.fromEntries(rel.vars.map((id, k) => [id, size * (2 * k + 3)]));
    const pq = Object.fromEntries(rel.vars.map((id) => [id, p[id]! + q[id]!]));
    const [a, b, ab] = [at(p), at(q), at(pq)];
    const second = ab - a - b + c0;
    ok =
      Number.isFinite(second) &&
      Math.abs(second) <= 1e-9 * (Math.abs(ab) + Math.abs(a) + Math.abs(b) + Math.abs(c0));
  }
  const out = ok ? { c0, coef } : null;
  affineCache.set(rel, out);
  return out ?? undefined;
}

/**
 * A number as the value's box shows it (a fraction page's 1/4, a step of 0.001's 19,996.468),
 * in shown units. `failing`: the number a refusal is about, given as many more decimals as it
 * takes to still break the rule it breaks (35.96 is not whole; 36 would be).
 */
function shownNumber(v: VariableDef, y: number, failing = false): string {
  const opts = {
    fraction: v.fraction ? Math.max(v.fraction, 12) : undefined,
    improper: v.improper,
    pi: v.pi,
    scientific: v.scientific,
    sigFigs: v.sigFigs,
    figures: v.figures,
    full: v.full,
    repeating: v.repeating,
  };
  const plain = formatNumber(y, opts);
  if (!failing || Number.isInteger(y)) return plain;
  const f = v.unitFactor ?? 1;
  // (the same rule: 0.1667 groups rounded to 0 breaks the minimum, not the whole-number rule)
  const why = checkValue(v, y * f);
  const fails = (text: string) => {
    const n = parseNumber(text);
    return typeof n === 'number' && checkValue(v, n * f) === why;
  };
  // Exactly as the box would show it (1/4, 19,996.468), else to the step's decimals (a step
  // of 0.001: 3), then one more at a time.
  const exact = parseNumber(plain);
  if (typeof exact === 'number' && Math.abs(exact - y) <= 1e-12 * Math.max(1, Math.abs(y)))
    return plain;
  // (A value that isn't whole, or not on the list, keeps its decimals: 0.1667 groups, not 0.2.)
  const ranged = /^Must be at (least|most)/.test(why ?? '');
  const step = ranged && v.step !== undefined && v.step > 0 ? v.step : undefined;
  const base = step ? Math.max(0, Math.ceil(-Math.log10(step) - 1e-9)) : undefined;
  const whole = Math.max(1, Math.floor(Math.log10(Math.abs(y) || 1)) + 1);
  const texts = [
    ...(base === undefined
      ? [plain]
      : Array.from({ length: 5 }, (_, i) => {
          const r = Number(y.toFixed(Math.min(20, base + i)));
          return formatNumber(r, {
            ...opts,
            figures: Math.abs(r) < 1 ? 4 + i : whole + base + i,
          });
        })),
    ...[6, 8, 10].map((n) => formatNumber(Number(y.toPrecision(n)), { ...opts, figures: n })),
  ];
  return texts.find(fails) ?? plain;
}

/** A value as the student reads it, with its unit: "16 cm", "$5", "91.5%", "−57 °C", "1 cube". */
function shownWithUnit(v: VariableDef, x: number, failing = false): string {
  const f = v.unitFactor ?? 1;
  const unit = v.displayUnit ?? v.unit;
  const n = shownNumber(v, x / f, failing);
  if (!unit) return n;
  if (unit === '$') return dollars(n);
  const u = unitFor(parseNumber(n) === 1 ? 1 : 2, unit);
  // 91.5%, 40°, 5¢: no space ("−57 °C" keeps its).
  return /^([¢%]|°$)/.test(u) ? `${n}${u}` : `${n} ${u}`;
}

/**
 * A label that isn't a noun ("In all", "How many more", "Still needed", "Left", "Today"):
 * "the in all" reads wrong, so it is quoted instead ("That would make “In all” 14").
 */
const NOT_A_NOUN =
  /^(?:(?:in|on|at|for|to|from|after|before|by|with|without|of|per|over|under|into|out|each|all|altogether|together|how|what|which|who|whose|when|where|why|still|not|now|today|tonight|yesterday|tomorrow|already|also|only|just|then|than)\b|(?:left|needed|used|shaded|unshaded|spent|eaten|given|taken|sold|saved|lost|found|added|removed|leftover)$)/i;

/**
 * A value's name inside a sentence: "the potassium-40 left", "the Carnot limit", "the IQR";
 * the value's own `inSentence` when it sets one ("the number in each group"), and a label that
 * isn't a noun, or ends in a number, in quotes (“In all”, “Side 4”).
 */
export const theName = (v: Pick<VariableDef, 'name' | 'inSentence'>) =>
  v.inSentence ??
  // (a name ending in a number too: "the side 4 170 cm" reads as one number)
  (NOT_A_NOUN.test(v.name.trim()) || /\d$/.test(v.name.trim())
    ? `“${v.name}”`
    : `the ${lowerFirst(v.name)}`);

/**
 * Why a value can't be `x`, in a sentence a student reads: "That would make the density
 * 108,225 g/cm³, but it can be at most 100 g/cm³." On a K–5 page a value that isn't whole is
 * not named ("That wouldn’t make the groups a whole number.") and a negative one is "less than
 * 0". Undefined when its range allows `x`.
 */
function rangeSentence(system: System, v: VariableDef, x: number): string | undefined {
  const range = checkValue(v, x);
  if (!range) return undefined;
  // 60,300.00000008 "must be a whole number" reads as nonsense: no sentence for rounding dust.
  const f = v.unitFactor ?? 1;
  if (checkValue(v, Number((x / f).toPrecision(6)) * f) === undefined) return undefined;
  const name = theName(v);
  if (youngPage(system)) {
    if (x < 0) {
      const least =
        v.min !== undefined && v.min > 0
          ? `, but it must be at least ${shownWithUnit(v, v.min)}`
          : '';
      return `That would make ${name} less than 0${least}.`;
    }
    if (range === 'Must be a whole number') return `That wouldn’t make ${name} a whole number.`;
  }
  const need = `That would make ${name} ${shownWithUnit(v, x, true)}, but it`;
  if (v.max !== undefined && /^Must be at most/.test(range))
    return `${need} can be at most ${shownWithUnit(v, v.max)}.`;
  if (v.min !== undefined && /^Must be at least/.test(range))
    return `${need} must be at least ${shownWithUnit(v, v.min)}.`;
  const tail = `${range[0]!.toLowerCase()}${range.slice(1)}`;
  return `${need} ${tail}${tail.endsWith('…') ? '' : '.'}`;
}

/**
 * What the engine says when no value of `v` fits the other numbers and nothing more precise
 * can be said (a root of a negative, a log of 0).
 */
export const noValueFor = (v: Pick<VariableDef, 'name' | 'inSentence'>) =>
  `That would leave no possible value for ${theName(v)}.`;

/** The engine's fallback when the open values can't meet a rule and no one value says why. */
export const CANT_REACH = 'The other numbers can’t reach this: they would go past their limits.';

/**
 * Why `x` can't be `v`'s value, in a sentence: a rule's own message when one speaks for the
 * values with `x` in them ("No material is denser than …"), else the range it breaks ("That
 * would make the density 108,225 g/cm³, but it can be at most 100 g/cm³."). Undefined when `x`
 * is not a number.
 */
function whyNot(system: System, v: VariableDef, x: number, values: Values): string | undefined {
  if (!Number.isFinite(x)) return undefined;
  const all = { ...values, [v.id]: x };
  for (const r of system.relations) {
    if (!r.message || !r.vars.every((id) => id in all)) continue;
    try {
      const text = r.message(all);
      if (text) return text;
    } catch {
      // A message that needs values not known yet stays quiet.
    }
  }
  return rangeSentence(system, v, x);
}

/**
 * True when a relation is a straight line in each of its values on its own, the others held
 * (a sum, a product n × x, ρ × V − m): over a box of ranges it is then least and greatest at
 * the box's corners.
 */
const multilinearCache = new WeakMap<Relation, boolean>();
function multilinear(rel: Relation): boolean {
  const cached = multilinearCache.get(rel);
  if (cached !== undefined) return cached;
  const at = (p: Values) => {
    try {
      return rel.residual(p);
    } catch {
      return NaN;
    }
  };
  let ok = true;
  for (let i = 1; ok && i <= 4; i++) {
    const p = Object.fromEntries(
      rel.vars.map((id, k) => [id, (((i * 37 + k * 53) % 200) - 50) / 7 + 0.3]),
    );
    for (const id of rel.vars) {
      const [a, b, c] = [0.5, 2.25, 6.75].map((t) => at({ ...p, [id]: t })) as [
        number,
        number,
        number,
      ];
      const s1 = (b - a) / 1.75;
      const s2 = (c - a) / 6.25;
      if (
        ![a, b, c].every(Number.isFinite) ||
        Math.abs(s1 - s2) > 1e-9 * (1 + Math.abs(s1) + Math.abs(s2) + Math.abs(a))
      ) {
        ok = false;
        break;
      }
    }
  }
  multilinearCache.set(rel, ok);
  return ok;
}

/**
 * A rule the unknown values can't meet, whatever they are within their ranges (a total of 10
 * with 12 already typed and the rest at least 0; a product of two values at most 10 that must
 * be 150): the inputs can never be completed. Sums and products are bounded at the corners of
 * their ranges. Returns the reason in words: with one value left open, the range sentence it
 * would break ("That would make “Left” less than 0."; `single`), else `CANT_REACH`. Undefined
 * when every rule is still in reach.
 */
function outOfReach(
  system: System,
  values: Values,
): { reason: string; single: boolean } | undefined {
  const byId = new Map(system.variables.map((v) => [v.id, v]));
  for (const rel of system.relations) {
    if (rel.constraint || rel.vars.every((id) => id in values)) continue;
    if (!affineOf(rel) && !multilinear(rel)) continue;
    const open = rel.vars.filter((id) => !(id in values));
    if (open.length > 6) continue;
    const ranges = open.map((id) => byId.get(id));
    if (ranges.some((v) => v?.min === undefined || v.max === undefined)) continue;
    const at = (p: Values) => {
      try {
        return rel.residual(p);
      } catch {
        return NaN;
      }
    };
    const corners = Array.from({ length: 2 ** open.length }, (_, k) => {
      const p: Values = { ...values };
      open.forEach((id, i) => {
        const v = byId.get(id)!;
        p[id] = (k >> i) & 1 ? v.max! : v.min!;
      });
      return at(p);
    });
    if (!corners.every(Number.isFinite)) continue;
    const lo = Math.min(...corners);
    const hi = Math.max(...corners);
    // Tolerance scaled by the size of the terms, not of the result (which is near 0 exactly
    // when it matters): with values in miles a true 0 comes out as 0.00003.
    const size =
      rel.vars.reduce((t, id) => t + Math.abs(values[id] ?? 0), 0) +
      ranges.reduce((t, v) => t + Math.max(Math.abs(v!.min!), Math.abs(v!.max!)), 0) +
      Math.max(...corners.map(Math.abs));
    const tol = 1e-9 * (1 + size);
    if (!(lo > tol || hi < -tol)) continue;
    // No open value moves it: a lookup (dice pairs for a sum) read as flat at the probes, not a
    // rule that can't be met.
    if (hi - lo <= tol) continue;
    // One value left to find: the range it would have to break.
    if (open.length === 1) {
      const v = byId.get(open[0]!)!;
      const f0 = at({ ...values, [v.id]: 0 });
      const f1 = at({ ...values, [v.id]: 1 });
      const need = -f0 / (f1 - f0);
      const said = Number.isFinite(need) ? rangeSentence(system, v, need) : undefined;
      if (said) return { reason: said, single: true };
    }
    return { reason: CANT_REACH, single: false };
  }
  return undefined;
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
  variables?: readonly VariableDef[],
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
    .filter((x) => holds(relation, { ...values, [variable.id]: x }, variables))
    .filter((x, i, all) => all.findIndex((y) => closeTo(y, x, floorOf(variable))) === i);
  const prev = previous[variable.id];
  return prev === undefined
    ? valid
    : valid
        .map((x, i) => ({ x, i }))
        .sort((p, q) => Math.abs(p.x - prev) - Math.abs(q.x - prev) || p.i - q.i)
        .map((p) => p.x);
}

type Propagation =
  | { ok: true; values: Values; trace: TraceStep[] }
  /**
   * `said`: the reason is a rule's own sentence (its `message`), not a generic conflict.
   * `why`: a sentence that explains it (a rule's message or the range a value would break),
   * worked out only when asked (the search tries thousands of values).
   */
  | { ok: false; reason: string; said?: boolean; why?: () => string | undefined };

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
      const unknowns = relation.vars.filter(
        (id) => !(id in values) && !outOfCount(byId.get(id), values),
      );
      if (unknowns.length === 0) {
        if (!holds(relation, values, system.variables)) {
          const said = relation.message?.(values);
          if (said) return { ok: false, reason: said, said: true };
          return { ok: false, reason: `Doesn’t fit ${relation.id}` };
        }
      } else if (relation.constraint) {
        // A rule that only checks: nothing is worked out from it.
        continue;
      } else if (unknowns.length === 1) {
        const id = unknowns[0]!;
        const variable = byId.get(id)!;
        const xs = candidatesFor(relation, variable, values, previous, system.variables);
        if (xs.length === 0) {
          // A rule that says why it has no single answer here (parallel lines, the same x on
          // both sides) says so under the box.
          const said = relation.message?.(values);
          if (said) return { ok: false, reason: said, said: true };
          // No valid value exists (e.g. out of range, or a negative length). Only a conflict
          // if every other variable in the relation is pinned; otherwise just leave it unknown.
          const direct = relation.solve?.[id]?.(values);
          // A rule these values leave indifferent to it (Δx = (v₀ + v) ÷ 2 × t with t = 0 and
          // Δx = 0: v = 2Δx ÷ t − v₀ is 0 ÷ 0) says nothing about it.
          const hasCandidate =
            direct !== undefined &&
            (!Array.isArray(direct) || direct.length > 0) &&
            !indifferent(relation, values, id);
          if (hasCandidate) {
            const xs = (Array.isArray(direct) ? direct : [direct]).filter(Number.isFinite);
            const at = { ...values };
            return {
              ok: false,
              reason: noValueFor(variable),
              why: () =>
                xs.map((x) => whyNot(system, variable, x, at)).find((t) => t !== undefined),
            };
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

const byIdOf = (system: System, id: string) => system.variables.find((v) => v.id === id)!;

/** Whole-number values a variable can take, or undefined if not a finite whole-number range. */
function wholeValues(v: VariableDef): number[] | undefined {
  if (v.allowed) return v.allowed.map((a) => a * (v.unitFactor ?? 1));
  if (!v.integer || v.min === undefined || v.max === undefined) return undefined;
  const f = (v.unitFactor ?? 1) * (v.multipleOf ?? 1);
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
      if (relation.constraint) continue;
      const open = relation.vars.filter((id) => !(id in vals));
      if (open.length === 0 || open.some((id) => !bounds.has(id))) continue;
      // Residual as c0 + Σ aᵢ·xᵢ, measured at the middle of the ranges.
      const mid: Values = { ...vals };
      for (const id of open) mid[id] = (bounds.get(id)!.lo + bounds.get(id)!.hi) / 2;
      const r0 = relation.residual(mid);
      if (!Number.isFinite(r0)) continue;
      // Slopes measured over one step of each value's own grid (a mile is 160,934.4 cm): a
      // step of 1 in large units loses the slope to rounding, and the error then grows by the
      // size of the value when the constant term is worked out.
      const a = open.map((id) => {
        const h = bounds.get(id)!.f || 1;
        return (relation.residual({ ...mid, [id]: mid[id]! + h }) - r0) / h;
      });
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
        // Values are whole steps apart, so a millionth of a step absorbs rounding without ever
        // admitting a value that doesn't fit.
        let lo = Math.max(b.lo, Math.ceil(x1 / b.f - 1e-6) * b.f);
        const hi = Math.min(b.hi, Math.floor(x2 / b.f + 1e-6) * b.f);
        // The same step counted two ways (6563 × 0.1 is 656.3000000000001, the list's last
        // value 656.3) is one value, not an empty range.
        if (lo > hi + 1e-9 * Math.max(b.f, Math.abs(hi))) return false;
        lo = Math.min(lo, hi);
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
  // Enough for two unknown minutes on a clock (60 × 60 tries), or a volume whose three
  // sides (to 100) must be found as whole numbers.
  const budget = { left: 20000 };
  const solutions: Values[] = [];
  let exhausted = false;
  const search = (vals: Values) => {
    const open = system.variables.filter(
      (v) =>
        !(v.id in vals) &&
        !outOfCount(v, vals) &&
        system.relations.some((r) => r.vars.includes(v.id)),
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
        // An allowed list sets its own range and step (0.9, 0.95, 0.99 need no min or max).
        const list =
          v.allowed &&
          wholeValues(v)!
            .slice()
            .sort((a, b) => a - b);
        if (list?.length) {
          // The step divides every allowed value (0.9, 0.95, 0.99 → 0.01), so bounds snapped
          // to it keep them all.
          const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
          const g = list.reduce((acc, x) => gcd(acc, Math.round(Math.abs(x) * 1e6)), 0);
          return [v.id, { lo: list[0]!, hi: list[list.length - 1]!, f: g ? g / 1e6 : 1 }];
        }
        const f = (v.unitFactor ?? 1) * (v.multipleOf ?? 1);
        return [
          v.id,
          { lo: Math.ceil(v.min! / f - 1e-9) * f, hi: Math.floor(v.max! / f + 1e-9) * f, f },
        ];
      }),
    );
    if (!narrow(system, vals, bounds)) return;
    const [id, b] = [...bounds].reduce((x, y) => (y[1].hi - y[1].lo < x[1].hi - x[1].lo ? y : x));
    // Only the values the variable can take (its allowed list, else every multiple in range).
    const candidates = wholeValues(byIdOf(system, id))!.filter(
      (x) => x >= b.lo - 1e-9 && x <= b.hi + 1e-9,
    );
    for (const x of candidates) {
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
 * The same system with every bounded range widened tenfold, whole number or not: what the
 * formulas fix even past the ranges (as the sampling harness's `relax` reads it).
 */
const loosened = (system: System): System => ({
  relations: system.relations,
  variables: system.variables.map((v) => {
    if (v.min === undefined || v.max === undefined) return v;
    const w = 10 * (v.max - v.min + (v.unitFactor ?? 1));
    return { ...v, min: v.min - w, max: v.max + w };
  }),
});

/**
 * Half a typed value's step: how far a number typed into the box may be from the value it
 * stands for (a rounded shown value, d = 463.6 for 463.601). 0 for whole numbers, lists and
 * boxes with no step.
 */
const slackOf = (v: VariableDef | undefined) =>
  v && !v.integer && !v.allowed && !v.multipleOf && v.step !== undefined && v.step > 0
    ? v.step / 2
    : 0;

/**
 * Typed values that miss only by their rounding: each is a shown value, within half its step
 * of what the others work out (d = 463.6 for z × σ = 463.601), and the rounding may run
 * through several values (E → P → z → d; λ₀, λ, z and v). Finds one, newest first, that left
 * out leaves the other typed values fitting together and is worked out from them within half a
 * step of the number typed. It is then worked out, not typed (as a direct match is); the others
 * are kept exactly as typed. Undefined when none does.
 */
function roundedOut(
  system: System,
  given: readonly Given[],
  previous: Values,
): string[] | undefined {
  const byId = new Map(system.variables.map((v) => [v.id, v]));
  const valid = given.filter((g) => {
    const v = byId.get(g.id);
    return v && checkValue(v, g.value) === undefined;
  });
  const soft = valid.filter((g) => slackOf(byId.get(g.id)) > 0);
  if (soft.length === 0) return undefined;
  const typed = Object.fromEntries(
    valid.map((g) => [g.id, normalizeValue(byId.get(g.id)!, g.value)]),
  );
  const fits = (out: readonly Given[]) => {
    const rest = { ...typed };
    for (const g of out) delete rest[g.id];
    const r = propagate(system, rest, previous, [], { left: 200 });
    return (
      r.ok &&
      out.every((g) => {
        const x = r.values[g.id];
        return x !== undefined && Math.abs(x - typed[g.id]!) <= slackOf(byId.get(g.id)) + 1e-12;
      })
    );
  };
  // Newest first: a shown value typed again is the one to work out again (older first worked
  // z out as invNorm(0.99999999614), shown invNorm(1), where the typed P was the rounded one).
  for (const g of [...soft].reverse()) if (fits([g])) return [g.id];
  // (Two at once was tried: it worked out more typed values than needed. One is enough.)
  return undefined;
}

/** The engine's own sentence for a value past its range (`rangeSentence`). */
const RANGE_SENTENCE = /^That (would|wouldn’t) make /;

/**
 * Which way to move the newest value so it fits the older ones, when halving or doubling it
 * does and the other does not: " Try a smaller number for the age." (with its leading space),
 * else "".
 */
let probing = false;
function tryInstead(system: System, given: readonly Given[], previous: Values): string {
  const newest = given[given.length - 1]!;
  const v = system.variables.find((x) => x.id === newest.id);
  // (The probes' own refusals need no hint.)
  if (!v || newest.value === 0 || probing) return '';
  const fits = (factor: number) => {
    const x = newest.value * factor;
    if (checkValue(v, x) !== undefined) return false;
    const r = solve(system, [...given.slice(0, -1), { id: newest.id, value: x }], previous);
    return !r.rejected && r.cleared.length === 0;
  };
  probing = true;
  try {
    const [smaller, larger] = newest.value > 0 ? [fits(0.5), fits(2)] : [fits(2), fits(0.5)];
    if (smaller === larger) return '';
    return ` Try a ${smaller ? 'smaller' : 'larger'} number for ${theName(v)}.`;
  } finally {
    probing = false;
  }
}

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
    // A typed value that is the worked-out one rounded to the box's step (d = 463.6 against
    // z × σ = 463.601) agrees with it.
    const typed = normalizeValue(variable, g.value);
    const rounded =
      determined &&
      !variable.integer &&
      variable.step !== undefined &&
      Math.abs(typed - known[g.id]!) <= variable.step / 2 + 1e-12;
    if (determined && (closeTo(typed, known[g.id]!, floorOf(variable)) || rounded)) {
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
    // With values still unknown, check they can still be filled in: a sum within reach of
    // the unknowns' ranges, and some whole numbers that fit.
    const open = propagated.ok && Object.keys(propagated.values).length < system.variables.length;
    const unreachable = open ? outOfReach(system, propagated.values) : undefined;
    const none =
      open &&
      !unreachable &&
      (() => {
        const r = wholeSolutions(system, propagated.values, previous, 1);
        return !r.exhausted && r.solutions.length === 0;
      })();
    // A rule's own sentence explains a conflict better than the generic one (an absolute value
    // is never negative), when one speaks for these numbers.
    const said = () => {
      const values = propagated.ok
        ? propagated.values
        : { ...givens, [g.id]: normalizeValue(variable, g.value) };
      for (const r of system.relations) {
        // A rule that only checks speaks only for values it has: with u unknown, "843.3 cm is
        // not a reading to the nearest NaN cm" (a missing value fails every check).
        if (r.constraint && !r.vars.every((id) => values[id] !== undefined)) continue;
        try {
          const text = r.message?.(values);
          if (text) return text;
        } catch {
          // A message that needs values not known yet stays quiet.
        }
      }
      return undefined;
    };
    const message = unreachable || none ? said() : undefined;
    // No one open value says why the rule can't be met with the inputs so far (P = 4 and
    // side 3 = 10, sides 1, 2 and 4 open): with every typed value in, one may (side 4 would
    // have to be −26 cm).
    const explainAll = () => {
      const all: Values = {};
      for (const k of given) {
        const v = byId.get(k.id);
        if (v && checkValue(v, k.value) === undefined) all[k.id] = normalizeValue(v, k.value);
      }
      const p = propagate(system, all, previous, [], { left: 200 });
      if (!p.ok) return p.said ? p.reason : p.why?.();
      const r = outOfReach(system, p.values);
      return r?.single ? r.reason : undefined;
    };
    const trial: Propagation = unreachable
      ? {
          ok: false,
          reason:
            message ??
            (unreachable.single ? unreachable.reason : (explainAll() ?? unreachable.reason)),
          said: true,
        }
      : none
        ? message
          ? { ok: false, reason: message, said: true }
          : { ok: false, reason: 'These numbers can’t all be true together.' }
        : propagated;
    // Typed values that miss only by their rounding (each within half its step) fit: the
    // ones the others work out are worked out, the rest kept as typed.
    const out = !trial.ok && !isNewest ? roundedOut(system, given, previous) : undefined;
    if (out) {
      const after = solve(
        system,
        given.filter((k) => !out.includes(k.id)),
        previous,
      );
      return { ...after, dropped: [...after.dropped, ...out] };
    }
    // Why an older input doesn't fit: a rule's sentence, or the range a value would break.
    // (Not when the newest was already refused for its own range: that reason stands.)
    const why =
      trial.ok || isNewest || rejected ? undefined : trial.said ? trial.reason : trial.why?.();
    if (trial.ok) {
      known = trial.values;
      trace = trial.trace;
      kept.unshift({ id: g.id, value: normalizeValue(variable, g.value) });
    } else if (why !== undefined) {
      // A rule or a range says why the newest input doesn't fit the older ones (parallel
      // lines; no material denser than osmium): the newest is refused with that sentence, and
      // the older numbers stay as they were. Only a conflict nothing explains clears the older.
      const newest = given[given.length - 1]!;
      const before = solve(system, given.slice(0, -1), previous);
      const reason = RANGE_SENTENCE.test(why)
        ? `${why}${tryInstead(system, given, previous)}`
        : why;
      return { ...before, rejected: { id: newest.id, reason, older: true } };
    } else if (isNewest) {
      rejected = { id: g.id, reason: trial.why?.() ?? trial.reason };
    } else {
      dropped.push(g.id);
      if (!determined) cleared.push(g.id);
    }
  }

  // Unknowns the formulas fix together (e.g. c + s = 20 with c = s): a value that is the same
  // in every whole-number solution, even with the ranges widened, is filled in.
  const filled: string[] = [];
  if (Object.keys(known).length < system.variables.length) {
    const wide = widened(system);
    const r = wholeSolutions(wide, known, previous, 40);
    const first = r.solutions[0];
    if (!r.exhausted && r.solutions.length < 40 && first) {
      for (const v of system.variables) {
        if (v.id in known || !(v.id in first)) continue;
        // Same value in every solution: the formulas fix it (e.g. a difference).
        const x = first[v.id]!;
        if (!r.solutions.every((sol) => closeTo(sol[v.id]!, x, floorOf(v)))) continue;
        if (checkValue(v, x) !== undefined) continue;
        // A value from a list (an allowed mass) that every rule marks "never worked out from
        // this rule" (a `null` part) is the student's to pick, whatever the search finds. Other
        // forward-only inputs (10ᵏ − 1 from k) are still filled when the search fixes them.
        const rules = system.relations.filter((rel) => rel.vars.includes(v.id) && !rel.constraint);
        if (v.allowed && rules.length && rules.every((rel) => rel.solve?.[v.id]?.length === 0))
          continue;
        known = { ...known, [v.id]: x };
        filled.push(v.id);
      }
    }
  }
  // A filled value must follow from the values known without it (E21): one at a time, by a
  // formula whose other values are known or already explained, or as a group that the
  // group's own formulas fix together (c + s = 20 with c = s: two formulas, two values). A
  // group pinned only through a value still unknown is a cycle, and is left for the student:
  // with n₂ = 2 and n₁ cleared, the search's n₁ = ±1 both give E = 10.2, but E's only formula
  // needs n₁, and "E from λ, λ from E" explains nothing.
  if (filled.length) {
    const explained = new Set(Object.keys(known).filter((id) => !filled.includes(id)));
    const rules = system.relations.filter((rel) => !rel.constraint);
    let open = [...filled];
    for (let changed = true; changed;) {
      changed = false;
      for (const id of open) {
        const by = rules.some(
          (rel) =>
            rel.vars.includes(id) &&
            rel.solve?.[id]?.length !== 0 &&
            rel.vars.every((v) => v === id || explained.has(v)),
        );
        if (by) {
          explained.add(id);
          changed = true;
        }
      }
      open = open.filter((id) => !explained.has(id));
    }
    // The rest in groups joined by formulas whose values are all known (or in the group).
    const inGroup = (rel: Relation, group: Set<string>) =>
      rel.vars.some((v) => group.has(v)) && rel.vars.every((v) => group.has(v) || explained.has(v));
    const left = new Set(open);
    for (const start of open) {
      if (!left.has(start)) continue;
      const group = new Set([start]);
      for (let grew = true; grew;) {
        grew = false;
        for (const rel of rules) {
          if (!rel.vars.some((v) => group.has(v))) continue;
          for (const v of rel.vars) {
            if (left.has(v) && !group.has(v)) {
              group.add(v);
              grew = true;
            }
          }
        }
      }
      for (const v of group) left.delete(v);
      const fixing = rules.filter((rel) => inGroup(rel, group)).length;
      if (fixing >= group.size) continue;
      const rest = { ...known };
      for (const v of group) delete rest[v];
      // Only the values that differ among the solutions with every range widened are dropped:
      // a value the formulas fix through a cancelling unknown (the lone pairs l = 2 whatever
      // the carbon count; ΔTf = ΔTb × Kf ÷ Kb whatever i) stays, as does one the search can't
      // tell about.
      const r = wholeSolutions(loosened(system), rest, previous, 40);
      const first = r.solutions[0];
      if (!first) continue;
      const loose = [...group].filter((v) =>
        r.solutions.some(
          (sol) => !(v in sol) || !closeTo(sol[v]!, first[v]!, floorOf(byId.get(v))),
        ),
      );
      if (!loose.length) continue;
      const next = { ...known };
      for (const v of loose) {
        delete next[v];
        filled.splice(filled.indexOf(v), 1);
      }
      known = next;
    }
  }
  // Explain each filled value with a formula that gives it directly once everything is known,
  // so its step shows the usual arithmetic. A value only a rule like "a/b is at most 1" or the
  // ranges pin down is left for the student to type: a step can't be found from an order
  // rule ("12/? is at most 1, so the denominator is 12" reads as circular).
  for (const id of [...filled]) {
    const direct = system.relations.find((rel) => {
      const fn = rel.solve?.[id];
      if (!fn || fn.length === 0 || !rel.vars.every((v) => v in known)) return false;
      const others = { ...known };
      delete others[id];
      const out = fn(others);
      const xs = out === undefined ? [] : Array.isArray(out) ? out : [out];
      return xs.some((x) => closeTo(x, known[id]!, floorOf(byId.get(id))));
    });
    const relation =
      direct ?? system.relations.find((rel) => rel.vars.includes(id) && !rel.constraint);
    if (!relation) {
      const rest = { ...known };
      delete rest[id];
      known = rest;
      filled.splice(filled.indexOf(id), 1);
      continue;
    }
    trace = [...trace, { id, relation: relation.id, exact: !!direct }];
  }

  const givenIds = new Set(kept.map((g) => g.id));
  const ids = system.variables.map((v) => v.id);
  return {
    values: known,
    given: kept,
    derived: ids.filter((id) => id in known && !givenIds.has(id)),
    trace,
    unknown: ids.filter((id) => !(id in known) && !outOfCount(byId.get(id), known)),
    dropped,
    cleared,
    rejected,
  };
}
