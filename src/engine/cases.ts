import { formatNumber } from './format';
import type { Branch, Relation, Values, VariableDef } from './types';

/**
 * Relations that switch and answers that are words (HE-E11, HE-E12, HE-E15):
 *
 * - `piecewise`: a relation whose formula depends on a case, a limit (laminar below Re = 2,300)
 *   or a choice box (reaction order 0, 1 or 2). The solver inverts each case on its own and
 *   keeps a value only where its case applies; the step names the case ("1,500 < 2,300:
 *   laminar").
 * - `classify` and `categoryVariable`: a value that is a word from a list (converges or
 *   diverges, underdamped, LOS C), worked out from thresholds on other values; its box and its
 *   steps show the word.
 * - `realRoots`, `rootRule` and `orderedRoots`: the real roots of a polynomial in order, the one
 *   a page keeps by a rule it states (the root that leaves no concentration negative, the vapor
 *   volume), and two or three roots filled in order (σ₁ ≥ σ₂ ≥ σ₃, ω₁ < ω₂).
 *
 * A case's `applies` reads values in formula units; step text functions read the values the
 * steps show, the same on a page whose formulas hold in the shown units.
 */

type Solver = (v: Values) => number | number[] | undefined;

/** A relation's step text, as `StepText` in the module types takes it. */
export interface CaseText {
  expr: string | ((v: Values) => string);
  how: string | ((v: Values) => string);
  work?: string[] | ((v: Values) => string[]);
}

/** Relations and their step text, keyed as a module's `relations` and `steps` are. */
export interface CaseRules {
  relations: Relation[];
  steps: Record<string, Record<string, CaseText>>;
}

const listOf = (out: number | number[] | undefined): number[] =>
  out === undefined ? [] : Array.isArray(out) ? out : [out];

const tried = <T>(f: () => T, fallback: T): T => {
  try {
    return f();
  } catch {
    return fallback;
  }
};

/**
 * Whether the comparisons in a line hold ("1500 < 2300", "0 < 0.4 < 1", "3.2 ≥ 3"), each side
 * worked out by `evaluate`; text after a colon or a comma (the case's name) is left out.
 * Undefined when the line compares nothing or a side can't be worked out.
 */
export function comparisonHolds(
  line: string,
  evaluate: (text: string) => number | undefined,
): boolean | undefined {
  const head = line.split(/[:,;](?!\d)| so | as /)[0]!;
  const parts = head.split(/\s(<|>|≤|≥|≠|=)\s/);
  if (parts.length < 3) return undefined;
  for (let i = 1; i < parts.length - 1; i += 2) {
    const a = evaluate(parts[i - 1]!.trim());
    const b = evaluate(parts[i + 1]!.trim());
    if (a === undefined || b === undefined) return undefined;
    const near = Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
    const op = parts[i]!;
    const ok =
      op === '<'
        ? a < b
        : op === '>'
          ? a > b
          : op === '≤'
            ? a <= b || near
            : op === '≥'
              ? a >= b || near
              : op === '='
                ? near
                : !near;
    if (!ok) return false;
  }
  return true;
}

/** The case that applies to these values: the first whose `applies` is true. */
export function branchOf(relation: Relation, values: Values): Branch | undefined {
  return relation.branches?.find((b) => tried(() => b.applies(values), false));
}

/**
 * Text by case (an `expr` or `how` that differs between laminar and turbulent): the entry for
 * the case these values are in, else `otherwise`.
 */
export const byCase =
  (relation: Pick<Relation, 'branches'>, texts: Record<string, string>, otherwise = '') =>
  (v: Values) => {
    const b = branchOf(relation as Relation, v);
    return (b && texts[b.name]) ?? otherwise;
  };

export interface PiecewiseSpec {
  id: string;
  /** The whole rule, shown in the Formulas list ("f = 64 ÷ Re below 2,300, else …"). */
  display: string;
  vars: string[];
  /** The cases, first match wins (a case further down may assume the ones above failed). */
  branches: Branch[];
  /** Values never worked out from this rule (an input the cases only read): `() => undefined`. */
  oneWay?: string[];
  message?: Relation['message'];
  explain?: Relation['explain'];
}

/**
 * A relation that switches between formulas by case (HE-E12). Its residual is the formula of
 * the case that applies (no case: not a number, so it never holds). A value every case
 * rearranges for is solved exactly, each case's answer kept only where that case applies (a
 * value that two cases both give, such as M from A/A* below and above 1, gives both, and the
 * one nearer the previous value is tried first); any other value is found numerically, case by
 * case (`solve.ts`), or, for a choice box, by trying its codes.
 */
export function piecewise(spec: PiecewiseSpec): Relation {
  const { branches, vars } = spec;
  // (first match wins, as `branchOf` reads it)
  const applying = (v: Values) => branches.find((b) => tried(() => b.applies(v), false));
  const residual = (v: Values) => {
    if (!vars.every((id) => Number.isFinite(v[id]))) return NaN;
    const b = applying(v);
    return b ? tried(() => b.residual(v), NaN) : NaN;
  };
  const solve: Partial<Record<string, Solver>> = {};
  for (const id of vars) {
    if (spec.oneWay?.includes(id)) {
      solve[id] = () => undefined;
      continue;
    }
    if (!branches.every((b) => b.solve?.[id])) continue;
    solve[id] = (v: Values) => {
      const out: number[] = [];
      for (const b of branches) {
        for (const x of tried(() => listOf(b.solve![id]!(v)), [])) {
          if (Number.isFinite(x) && applying({ ...v, [id]: x }) === b) out.push(x);
        }
      }
      return out;
    };
  }
  return {
    id: spec.id,
    display: spec.display,
    vars,
    residual,
    solve,
    branches,
    ...(spec.message ? { message: spec.message } : {}),
    ...(spec.explain ? { explain: spec.explain } : {}),
  };
}

/** One band of a category answer: the word and the test that picks it. */
export interface Band {
  /** The word, as the value's `labels` give it ("turbulent"). */
  name: string;
  /** The test as a template the step fills, a limit as a number ("{Re} ≥ 2,300"). */
  when: string;
  /** True when the band applies (formula units). The first band that applies is the answer. */
  applies: (v: Values) => boolean;
  /** The value's code for this band; the band's place counted from 1 when left out. */
  code?: number;
}

export interface ClassifySpec {
  id: string;
  /** The category value (a `categoryVariable`). */
  out: string;
  /** The values the thresholds read. */
  ins: string[];
  bands: Band[];
  /** The rule as the Formulas list shows it ("{R} = laminar if {Re} < 2,300, else turbulent"). */
  display: string;
  /** Why no band applies, when the bands leave a gap. */
  message?: Relation['message'];
}

/**
 * A category answer (HE-E11): `out` is the code of the first band whose test the other values
 * pass. One way: the thresholds are never worked backward. Each band is a case, so the step's
 * case line names the band and why ("3,400 ≥ 2,300: turbulent") and the check repeats the test
 * ("3,400 ≥ 2,300, so turbulent").
 */
export function classify(spec: ClassifySpec): Relation {
  const { out } = spec;
  const branches: Branch[] = spec.bands.map((band, i) => {
    const code = band.code ?? i + 1;
    return {
      name: band.name,
      when: band.when,
      applies: band.applies,
      residual: (v: Values) => v[out]! - code,
      solve: { [out]: () => code },
      check: `${band.when}, so {${out}}`,
    };
  });
  // (the category is the band the inputs pass, whatever its own value: only the inputs pick)
  const inputs = (v: Values) => spec.ins.every((id) => Number.isFinite(v[id]));
  const firstBand = (v: Values) =>
    inputs(v) ? branches.find((b) => tried(() => b.applies(v), false)) : undefined;
  const relation = piecewise({
    id: spec.id,
    display: spec.display,
    vars: [out, ...spec.ins],
    branches: branches.map((b) => ({ ...b, applies: (v: Values) => firstBand(v) === b })),
    oneWay: spec.ins,
    message: spec.message,
  });
  return relation;
}

/**
 * A value whose answer is a word from a list (HE-E11): coded 1, 2, 3, … in the order of
 * `words`, shown as the word in its box, its steps and the check. Worked out (`derived`) unless
 * `pick` makes it a choice the student taps through (subsonic or supersonic; reaction order).
 */
export function categoryVariable(
  id: string,
  symbol: string,
  name: string,
  words: readonly string[],
  options: { pick?: boolean } & Partial<VariableDef> = {},
): VariableDef {
  const { pick, ...rest } = options;
  const codes = words.map((_, i) => i + 1);
  return {
    id,
    symbol,
    name,
    min: 1,
    max: words.length,
    step: 1,
    integer: true,
    allowed: codes,
    labels: Object.fromEntries(words.map((w, i) => [i + 1, w])),
    ...(pick ? {} : { derived: true }),
    ...rest,
  };
}

// ─── Roots ──────────────────────────────────────────────────────────────────

/** p(x) for coefficients highest power first. */
export const polynomialAt = (coeffs: readonly number[], x: number) =>
  coeffs.reduce((acc, c) => acc * x + c, 0);

/** Newton steps on p from x, kept only while they bring p nearer 0. */
function polish(coeffs: readonly number[], x: number): number {
  const d = coeffs.slice(0, -1).map((c, i) => c * (coeffs.length - 1 - i));
  let best = x;
  let fBest = Math.abs(polynomialAt(coeffs, x));
  for (let k = 0; k < 8 && fBest > 0; k++) {
    const slope = polynomialAt(d, best);
    if (!slope) break;
    const next = best - polynomialAt(coeffs, best) / slope;
    const f = Math.abs(polynomialAt(coeffs, next));
    if (!Number.isFinite(next) || f >= fBest) break;
    best = next;
    fBest = f;
  }
  return best;
}

/** Every root of a polynomial (complex, as [re, im] pairs), by Durand–Kerner. */
function allRoots(coeffs: readonly number[]): [number, number][] {
  const n = coeffs.length - 1;
  const a = coeffs.map((c) => c / coeffs[0]!);
  const bound = 1 + Math.max(...a.slice(1).map(Math.abs));
  let z: [number, number][] = Array.from({ length: n }, (_, k) => {
    const t = (2 * Math.PI * k) / n + 0.4;
    return [bound * Math.cos(t), bound * Math.sin(t)];
  });
  const mul = (p: [number, number], q: [number, number]): [number, number] => [
    p[0] * q[0] - p[1] * q[1],
    p[0] * q[1] + p[1] * q[0],
  ];
  const div = (p: [number, number], q: [number, number]): [number, number] => {
    const d = q[0] * q[0] + q[1] * q[1];
    return [(p[0] * q[0] + p[1] * q[1]) / d, (p[1] * q[0] - p[0] * q[1]) / d];
  };
  for (let it = 0; it < 500; it++) {
    let moved = 0;
    z = z.map((zi, i) => {
      let p: [number, number] = [1, 0];
      for (const c of a.slice(1)) {
        const m = mul(p, zi);
        p = [m[0] + c, m[1]];
      }
      let q: [number, number] = [1, 0];
      z.forEach((zj, j) => {
        if (j !== i) q = mul(q, [zi[0] - zj[0], zi[1] - zj[1]]);
      });
      const step = div(p, q);
      moved = Math.max(moved, Math.hypot(...step));
      return [zi[0] - step[0], zi[1] - step[1]];
    });
    if (moved < 1e-14 * bound) break;
  }
  return z;
}

/**
 * The real roots of c₀xⁿ + c₁xⁿ⁻¹ + … + cₙ (`coeffs` highest power first), least first, a
 * repeated root as often as it repeats (a double eigenvalue fills σ₂ and σ₃). Quadratics and
 * cubics are solved in closed form (three real roots by the cosine rule, so σ₁, σ₂, σ₃ of a
 * stress tensor never lose a pair to rounding), then polished; higher degrees by Durand–Kerner.
 * Leading zeros lower the degree; a constant has no roots.
 */
export function realRoots(coeffs: readonly number[]): number[] {
  const c = coeffs.slice(coeffs.findIndex((x) => x !== 0));
  if (c.length === 0 || coeffs.every((x) => x === 0) || c.some((x) => !Number.isFinite(x)))
    return [];
  const n = c.length - 1;
  let roots: number[];
  if (n === 0) return [];
  if (n === 1) roots = [-c[1]! / c[0]!];
  else if (n === 2) {
    const [a, b, k] = c as [number, number, number];
    const d = b * b - 4 * a * k;
    const scale = Math.max(b * b, Math.abs(4 * a * k));
    if (d < -1e-12 * scale) roots = [];
    else {
      const s = Math.sqrt(Math.max(0, d));
      // (no cancellation: the larger root in size first, the other from the product)
      const q = -0.5 * (b + (b >= 0 ? s : -s));
      roots = q === 0 ? [0, 0] : [q / a, k / q];
    }
  } else if (n === 3) {
    const [a3, b3, c3, d3] = c as [number, number, number, number];
    const [b, k, d] = [b3 / a3, c3 / a3, d3 / a3];
    // x = t − b/3: t³ + pt + q = 0
    const p = k - (b * b) / 3;
    const q = (2 * b * b * b) / 27 - (b * k) / 3 + d;
    const disc = (q * q) / 4 + (p * p * p) / 27;
    const scale = (q * q) / 4 + Math.abs(p * p * p) / 27;
    const shift = -b / 3;
    if (Math.abs(p) <= 1e-14 * (1 + b * b) && Math.abs(q) <= 1e-14 * (1 + Math.abs(b) ** 3)) {
      roots = [shift, shift, shift];
    } else if (disc <= 1e-12 * scale && p < 0) {
      // Three real roots (two equal when disc is 0): the cosine rule.
      const m = 2 * Math.sqrt(-p / 3);
      const arg = Math.max(-1, Math.min(1, (3 * q) / (p * m)));
      const theta = Math.acos(arg) / 3;
      roots = [0, 1, 2].map((j) => shift + m * Math.cos(theta - (2 * Math.PI * j) / 3));
    } else {
      const s = Math.sqrt(Math.max(0, disc));
      roots = [shift + Math.cbrt(-q / 2 + s) + Math.cbrt(-q / 2 - s)];
    }
  } else {
    const all = allRoots(c);
    const size = 1 + Math.max(...all.map(([re, im]) => Math.hypot(re, im)));
    roots = all.filter(([, im]) => Math.abs(im) <= 1e-7 * size).map(([re]) => re);
  }
  return roots.map((x) => polish(c, x)).sort((x, y) => x - y);
}

/** A number in a step line: to 5 figures, a negative bracketed where `bracket` asks. */
const num = (x: number, bracket = false) => {
  const s = formatNumber(Number(x.toPrecision(5)));
  return bracket && x < 0 ? `(${s})` : s;
};

/** The polynomial as a step writes it: "Z³ − 0.98Z² + 0.23Z − 0.0076". */
export function polynomialText(coeffs: readonly number[], letter: string): string {
  const n = coeffs.length - 1;
  const sup = (k: number) =>
    k === 1
      ? ''
      : String(k)
          .split('')
          .map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)])
          .join('');
  const terms = coeffs
    .map((c, i) => ({ c, k: n - i }))
    .filter(({ c }) => c !== 0)
    .map(({ c, k }, i) => {
      const size = Math.abs(c);
      const body = k === 0 ? num(size) : `${size === 1 ? '' : num(size)}${letter}${sup(k)}`;
      return i === 0 ? `${c < 0 ? '−' : ''}${body}` : `${c < 0 ? '−' : '+'} ${body}`;
    });
  return terms.length ? terms.join(' ') : '0';
}

/** Which root a page keeps: by rank, or by a test each root must pass. */
export type Keep =
  'least' | 'greatest' | 'median' | ((x: number, v: Values, roots: readonly number[]) => boolean);

export interface RootSpec {
  /** The relation's id. */
  id: string;
  /** The value that is the root. */
  out: string;
  /** The values the coefficients read. */
  ins: string[];
  /** The rule as the Formulas list shows it ("{x} keeps {K} = (2x)² ÷ ((0.1 − x)(0.1 − x))"). */
  display: string;
  /** The unknown as the polynomial line writes it ("x", "Z", "σ"). */
  letter: string;
  /** The polynomial's coefficients, highest power first; undefined while they can't be had. */
  coefficients: (v: Values) => number[] | undefined;
  keep: Keep;
  /**
   * The rule in words, as the step says it after the roots: "x must leave every concentration
   * at least 0" or "the vapor volume is the largest root". A template ({id} filled).
   */
  rule: string;
  /** The step's sentence on how, before the rule. */
  how?: string;
  /** Worked backward too (the inputs found numerically from the root): default true. */
  backward?: boolean;
  message?: Relation['message'];
}

/** The roots a rule keeps, least first. */
function kept(keep: Keep, roots: readonly number[], v: Values): number[] {
  if (roots.length === 0) return [];
  if (keep === 'least') return [roots[0]!];
  if (keep === 'greatest') return [roots[roots.length - 1]!];
  if (keep === 'median') return roots.length % 2 ? [roots[(roots.length - 1) / 2]!] : [];
  return roots.filter((x) => tried(() => keep(x, v, roots), false));
}

/** "least of 1, 2, 3", "greatest of …", "median of …": the rank phrase the harness reads. */
function rankPhrase(roots: readonly number[], x: number): string | undefined {
  const at = roots.findIndex((r) => Math.abs(r - x) <= 1e-9 * (1 + Math.abs(x)));
  if (at === -1) return undefined;
  const list = roots.map((r) => num(r)).join(', ');
  if (roots.length === 1) return num(roots[0]!);
  if (at === 0) return `least of ${list}`;
  if (at === roots.length - 1) return `greatest of ${list}`;
  if (roots.length === 3) return `median of ${list}`;
  return undefined;
}

/**
 * A root of a polynomial in `out`, the one a stated rule keeps (HE-E15): the quadratic's
 * physical root (the other would make a concentration negative), the largest root of a cubic
 * equation of state (vapor), the middle principal stress. The step writes the quadratic
 * formula with the sign kept, or the roots in order with the rank kept, and one line on each
 * root rejected and why. Worked backward numerically unless `backward` is false (the inputs
 * that make `out` a kept root).
 */
export function rootRule(spec: RootSpec): CaseRules {
  const { out, keep } = spec;
  const rootsAt = (v: Values) => {
    const c = tried(() => spec.coefficients(v), undefined);
    return c ? realRoots(c) : [];
  };
  const relation: Relation = {
    id: spec.id,
    display: spec.display,
    vars: [out, ...spec.ins],
    residual: (v: Values) => {
      const c = tried(() => spec.coefficients(v), undefined);
      const x = v[out];
      if (!c || x === undefined) return NaN;
      // A root the rule rejects doesn't hold: the value must pass the rule's test, or (a rule by
      // rank) be nearest the root kept. (Near the kept root it is a smooth polynomial, so the
      // inputs can be found from it numerically.)
      const roots = realRoots(c);
      const ok =
        typeof keep === 'function'
          ? tried(() => keep(x, v, roots), false)
          : roots.length > 0 &&
            kept(keep, roots, v).includes(
              roots.reduce((a, b) => (Math.abs(b - x) < Math.abs(a - x) ? b : a)),
            );
      if (!ok) return NaN;
      // Scaled by the leading coefficient: the residual is 0 at the root whatever its size.
      return polynomialAt(c, x) / (Math.abs(c.find((k) => k !== 0) ?? 1) || 1);
    },
    solve: {
      [out]: (v: Values) => kept(keep, rootsAt(v), v),
      ...(spec.backward === false
        ? Object.fromEntries(spec.ins.map((id) => [id, () => undefined]))
        : {}),
    },
    ...(spec.message ? { message: spec.message } : {}),
  };
  const lines = (v: Values) => {
    const c = spec.coefficients(v);
    return c ? { c, roots: realRoots(c) } : undefined;
  };
  const expr = (v: Values) => {
    const l = lines(v);
    const x = v[out];
    if (!l || x === undefined) return `{${out}}`;
    const { c, roots } = l;
    const lead = c.findIndex((k) => k !== 0);
    const deg = c.length - 1 - lead;
    if (deg === 2) {
      const [a, b, k] = c.slice(lead) as [number, number, number];
      const root = Math.sqrt(Math.max(0, b * b - 4 * a * k));
      const [plus, minus] = [(-b + root) / (2 * a), (-b - root) / (2 * a)];
      const sign = Math.abs(plus - x) <= Math.abs(minus - x) ? '+' : '−';
      return `(${num(-b)} ${sign} √(${num(b, true)}² − 4 × ${num(a, true)} × ${num(k, true)})) ÷ (2 × ${num(a, true)})`;
    }
    if (deg === 1) return `${num(-c[lead + 1]!)} ÷ ${num(c[lead]!, true)}`;
    return rankPhrase(roots, x) ?? num(x);
  };
  const work = (v: Values) => {
    const l = lines(v);
    const x = v[out];
    if (!l || x === undefined) return [];
    const others = l.roots.filter((r) => Math.abs(r - x) > 1e-9 * (1 + Math.abs(x)));
    const all =
      l.roots.length > 1
        ? `The roots of ${polynomialText(l.c, spec.letter)} = 0, in order: ${l.roots.map((r) => num(r)).join(', ')}.`
        : undefined;
    const rejected = others.length
      ? `Rejected: ${others.map((r) => num(r)).join(' and ')}, since ${spec.rule}.`
      : `Kept: ${spec.rule}.`;
    return [...(all ? [all] : []), rejected];
  };
  return {
    relations: [relation],
    steps: {
      [spec.id]: {
        [out]: {
          expr,
          how:
            spec.how ??
            `The rule is a polynomial in ${spec.letter}: find its real roots, then keep the one the rule allows.`,
          work,
        },
      },
    },
  };
}

export interface OrderedSpec {
  /** Relation ids are `${id} (${out})`. */
  id: string;
  /** The values filled, in the page's order (σ₁, σ₂, σ₃: `order` 'descending'). */
  outs: string[];
  ins: string[];
  letter: string;
  coefficients: (v: Values) => number[] | undefined;
  order: 'ascending' | 'descending';
  /** The rule as the Formulas list shows it, per value ("{s1} = greatest root of …"). */
  display: (out: string, rank: number) => string;
  how?: string;
}

/**
 * Two or three roots filled in order (HE-E15): ω₁ < ω₂, σ₁ ≥ σ₂ ≥ σ₃. Each value is its rank
 * among the real roots (a repeated root fills two), worked one way from the coefficients. A
 * polynomial with fewer real roots than values leaves the rest unknown.
 */
export function orderedRoots(spec: OrderedSpec): CaseRules {
  const n = spec.outs.length;
  const rules = spec.outs.map((out, i) => {
    const rank = spec.order === 'ascending' ? i : n - 1 - i;
    const ordinal =
      spec.order === 'ascending' ? ['least', 'second', 'third'] : ['greatest', 'second', 'third'];
    return rootRule({
      id: `${spec.id} (${out})`,
      out,
      ins: spec.ins,
      display: spec.display(out, i + 1),
      letter: spec.letter,
      coefficients: spec.coefficients,
      keep: (x, _v, roots) =>
        roots.length === n && Math.abs(roots[rank]! - x) <= 1e-12 * (1 + Math.abs(x)),
      rule: `{${out}} is the ${i === 0 ? ordinal[0] : `${ordinal[i]} ${spec.order === 'ascending' ? 'least' : 'greatest'}`} of the ${n} roots`,
      how: spec.how,
      backward: false,
    });
  });
  return {
    relations: rules.flatMap((r) => r.relations),
    steps: Object.assign({}, ...rules.map((r) => r.steps)),
  };
}
