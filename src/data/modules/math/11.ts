/**
 * Grade 11 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md; the
 * direction plan and build notes: docs/BUILD_HS.md and docs/build/m.11.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/math11.ts`.
 */
import { binomialPmf, choose, invPhi, Phi } from '@/components/module/reps/statMath';
import { complexRoots, quadraticRoot, radical, radicalParts } from '@/engine/exact';
import { formatNumber } from '@/engine/format';
import type { Relation, Values, VariableDef } from '@/engine/types';

import { div } from '../helpers';
import type { ModuleDef, StepText } from '../types';
import { syntheticDivision } from '../written';

// ── Toolkit ──

type Solver = (v: Values) => number | number[] | undefined;
type Rule = { relation: Relation; steps: Record<string, StepText> };

/** A value: its id, symbol, name and any options (range, step, derived…). */
const V = (
  id: string,
  symbol: string,
  name: string,
  extra: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...extra });
/** Whole numbers from min to max. */
const W = (id: string, symbol: string, name: string, min: number, max: number) =>
  V(id, symbol, name, { integer: true, min, max });
/** Rounded to 12 significant figures, so 0.1 + 0.2 is 0.3 when a value is worked out. */
const exact = (x: number) => Number(x.toPrecision(12));
/** A finite result, or nothing. */
const fin = (x: number | undefined) =>
  x !== undefined && Number.isFinite(x) ? exact(x) : undefined;

/**
 * A relation with its steps: for each value it is solved for, the solver, the rearranged right
 * side and the explanation. A solver with no argument (`() => undefined`) never solves for its
 * value and gets no step.
 */
function rule(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  parts: Record<string, [Solver, StepText['expr'], StepText['how']] | [Solver]>,
  extra: Partial<Relation> & { work?: Record<string, StepText['work']> } = {},
): Rule {
  const { work, ...more } = extra;
  const solve: Record<string, Solver> = {};
  const steps: Record<string, StepText> = {};
  for (const [v, [fn, expr, how]] of Object.entries(parts)) {
    solve[v] = fn;
    if (fn.length > 0 && expr !== undefined && how !== undefined)
      steps[v] = { expr, how, ...(work?.[v] ? { work: work[v] } : {}) };
  }
  return { relation: { id, display, vars, residual, solve, ...more }, steps };
}

/** Values a rule is never solved for (each gets a solver that gives nothing). */
const never = (...ids: string[]): Record<string, [Solver]> =>
  Object.fromEntries(ids.map((id): [string, [Solver]] => [id, [() => undefined]]));

/** A value worked out from others, never solved backwards. */
function derive(
  id: string,
  x: string,
  inputs: string[],
  display: string,
  f: (v: Values) => number | undefined,
  expr: StepText['expr'],
  how: StepText['how'],
  extra: Partial<Relation> & { work?: StepText['work']; written?: StepText['written'] } = {},
): Rule {
  const { work, written, ...more } = extra;
  const r = rule(
    id,
    display,
    [x, ...inputs],
    (v) => v[x]! - (f(v) ?? NaN),
    {
      [x]: [(v: Values) => fin(f(v)), expr, how],
      ...Object.fromEntries(inputs.map((i) => [i, [() => undefined]])),
    },
    { ...more, ...(work ? { work: { [x]: work } } : {}) },
  );
  if (written !== undefined) r.steps[x] = { ...r.steps[x]!, written };
  return r;
}

/**
 * A limit the rule needs (b ≠ 1, |r| < 1): values that break it are rejected, with the reason
 * under the box.
 */
function limit(
  id: string,
  display: string,
  vars: string[],
  ok: (v: Values) => boolean,
  why: string,
): Rule {
  return {
    relation: {
      id,
      constraint: true,
      display,
      vars,
      // Not a flat 1 when broken: a limit broken at every probe point would pass for a
      // straight-line rule that never holds (the harness search's `affineOf`).
      residual: (v: Values) => (ok(v) ? 0 : 1 + vars.reduce((t, id) => t + (v[id] ?? 0) ** 2, 0)),
      solve: {},
      message: (v: Values) => (ok(v) ? undefined : why),
    },
    steps: {},
  };
}

/** A page from its rules: the relations and the steps keyed by relation. */
function page(m: Omit<ModuleDef, 'relations' | 'steps'> & { rules: Rule[] }): ModuleDef {
  const { rules, ...rest } = m;
  return {
    ...rest,
    relations: rules.map((r) => r.relation),
    // (a figure-only relation places the drawing: it has no steps)
    steps: Object.fromEntries(
      rules.filter((r) => !r.relation.hidden).map((r) => [r.relation.id, r.steps]),
    ),
  };
}

/**
 * The x step of y = a(x − h)² + k, x ≥ h, with the inverse as a rule after the answer:
 * "f⁻¹(x) = 1 + √((x − 3) ÷ 2)".
 */
const inverseNote = (r: Rule): Rule => ({
  ...r,
  steps: {
    ...r.steps,
    x: {
      ...r.steps.x!,
      note: (v) => {
        const [a, h, k] = [v.a!, v.h!, v.k!];
        const top = k === 0 ? 'x' : k > 0 ? `x − ${formatNumber(k)}` : `x + ${formatNumber(-k)}`;
        const inside =
          a === 1 ? top : `(${top}) ÷ ${a < 0 ? `(${formatNumber(a)})` : formatNumber(a)}`;
        return `(in general, f⁻¹(x) = ${h === 0 ? '' : `${formatNumber(h)} + `}√(${inside}))`;
      },
    },
  },
});

// ── A point on the terminal side: r, sin θ and cos θ exact (4√26, √26/26) ──

const POINT_R = V('r', 'r', 'Distance from the origin', {
  min: 0,
  max: 30,
  derived: true,
  exact: true,
});
const POINT_SIN = V('s', 'sin θ', 'sin θ', {
  min: -1,
  max: 1,
  derived: true,
  fraction: 100,
  exact: true,
});
const POINT_COS = V('c', 'cos θ', 'cos θ', {
  min: -1,
  max: 1,
  derived: true,
  fraction: 100,
  exact: true,
});
/** r shown as a root (2√5, √34/2), not a plain decimal: bracket it after ÷. */
const overRoot = (r: number) => Math.abs(r * 1000 - Math.round(r * 1000)) > 1e-6;
/** "4 ÷ (2√5)" or "4 ÷ 5": a coordinate over r, as the step writes it. */
const overR = (a: number, r: number) => {
  const shown = formatNumber(r, POINT_R);
  return `${fmt(a)} ÷ ${overRoot(r) ? `(${shown})` : shown}`;
};

// ── Statistics helpers ──

/** C(n, k) for whole 0 ≤ k ≤ n, else nothing (so the solver never reads it as a flat 0). */
const nCk = (n: number, k: number) =>
  Number.isInteger(n) && Number.isInteger(k) && k >= 0 && k <= n ? choose(n, k) : undefined;

/**
 * The bars a student adds for P(X ≥ k): k up to n, or 0 up to k − 1 (`rest`, taken from 1)
 * when those are fewer.
 */
const atLeastBars = (n: number, k: number) => {
  const rest = k < n - k + 1;
  const [from, to] = rest ? [0, k - 1] : [k, n];
  return { js: Array.from({ length: to - from + 1 }, (_, i) => from + i), rest };
};
/** P(X ≥ k) for n trials at p, added the way `atLeastBars` says. */
const atLeast = (n: number, p: number, k: number) => {
  const { js, rest } = atLeastBars(n, k);
  const sum = js.reduce((t, j) => t + binomialPmf(n, p, j), 0);
  return rest ? 1 - sum : sum;
};

const inOpen = (p: number) => p > 0 && p < 1;
/** A probability, 0 to 1. */
const prob = (id: string, symbol: string, name: string, extra: Partial<VariableDef> = {}) =>
  V(id, symbol, name, { min: 0, max: 1, step: 0.0001, ...extra });
/** A z-score: z-tables stop at ±3.49, and past ±3.5 the share rounds to 0 or 1. */
const zVar = (id = 'z', name = 'z-score', symbol = 'z') =>
  V(id, symbol, name, { min: -3.5, max: 3.5, step: 0.01 });

/** z = (x − μ) ÷ σ. */
const zScore = (z: string, x: string, m: string, s: string): Rule =>
  rule(
    `${z} = (${x} − ${m}) ÷ ${s}`,
    `{${z}} = ({${x}} − {${m}}) ÷ {${s}}`,
    [z, x, m, s],
    (v) => v[z]! * v[s]! - (v[x]! - v[m]!),
    {
      [z]: [
        (v) => fin(div(v[x]! - v[m]!, v[s]!)),
        `({${x}} − {${m}}) ÷ {${s}}`,
        'How far the value is from the mean, in standard deviations.',
      ],
      [x]: [
        (v) => fin(v[m]! + v[z]! * v[s]!),
        `{${m}} + {${z}} × {${s}}`,
        'Start at the mean and go z standard deviations.',
      ],
      [m]: [
        (v) => fin(v[x]! - v[z]! * v[s]!),
        `{${x}} − {${z}} × {${s}}`,
        'Go back z standard deviations from the value.',
      ],
      [s]: [
        (v) => fin(div(v[x]! - v[m]!, v[z]!)),
        `({${x}} − {${m}}) ÷ {${z}}`,
        'The distance from the mean, split into z equal steps.',
      ],
    },
  );

/** P = Φ(z), the area left of z. */
const leftArea = (P: string, z: string): Rule =>
  rule(`${P} = Φ(${z})`, `{${P}} = Φ({${z}})`, [P, z], (v) => v[P]! - Phi(v[z]!), {
    [P]: [(v) => Phi(v[z]!), `Φ({${z}})`, 'Φ(z) is the area under the standard curve left of z.'],
    [z]: [
      (v) => (inOpen(v[P]!) ? invPhi(v[P]!) : undefined),
      `invNorm({${P}})`,
      'invNorm undoes Φ: the z with that area to its left.',
    ],
  });

/** E = N × P, the expected count out of N, said as a whole count too ("about 327 of the 400"). */
const countOf = (E: string, N: string, P: string, what: string): Rule => {
  const r = rule(
    `${E} = ${N} × ${P}`,
    `{${E}} = {${N}} × {${P}}`,
    [E, N, P],
    (v) => v[E]! - v[N]! * v[P]!,
    {
      [E]: [(v) => exact(v[N]! * v[P]!), `{${N}} × {${P}}`, what],
      [N]: [
        (v) => fin(div(v[E]!, v[P]!)),
        `{${E}} ÷ {${P}}`,
        'Divide the count by the share it is of the whole.',
      ],
      [P]: [(v) => fin(div(v[E]!, v[N]!)), `{${E}} ÷ {${N}}`, 'The count as a share of the whole.'],
    },
  );
  r.steps[E] = {
    ...r.steps[E]!,
    note: (v) => `(about ${fmt(Math.round(v[E]!))} of the ${fmt(v[N]!)})`,
  };
  return r;
};

/** a = b ± c. */
const offset = (a: string, b: string, c: string, sign: 1 | -1, how: string): Rule => {
  const op = sign > 0 ? '+' : '−';
  return rule(
    `${a} = ${b} ${op} ${c}`,
    `{${a}} = {${b}} ${op} {${c}}`,
    [a, b, c],
    (v) => v[a]! - (v[b]! + sign * v[c]!),
    {
      [a]: [(v) => exact(v[b]! + sign * v[c]!), `{${b}} ${op} {${c}}`, how],
      [b]: [
        (v) => exact(v[a]! - sign * v[c]!),
        `{${a}} ${sign > 0 ? '−' : '+'} {${c}}`,
        sign > 0 ? 'Go back down d from the upper cutoff.' : 'Go back up d from the lower cutoff.',
      ],
      [c]: [
        (v) => exact(sign * (v[a]! - v[b]!)),
        sign > 0 ? `{${a}} − {${b}}` : `{${b}} − {${a}}`,
        'The distance from the center to that end.',
      ],
    },
  );
};

const MU = (unit?: string, min = -1000, max = 1000) =>
  V('m', 'μ', 'Mean', { unit, min, max, step: 0.5 });
const SIGMA = (unit?: string, max = 500) =>
  V('s', 'σ', 'Standard deviation', { unit, min: 0.01, max, step: 0.1 });

const log10 = Math.log10;
const ln = Math.log;
const fmt = (x: number) => formatNumber(x);
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** An integer exponent raised: 5 → "⁵", −4 → "⁻⁴". */
const sup = (n: number) =>
  `${n < 0 ? '⁻' : ''}${[...String(Math.abs(n))].map((ch) => SUP[Number(ch)]).join('')}`;
/** A number as written after an operator, a negative one bracketed: (−4). */
const par = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x));
/** A power as written, a negative base bracketed: (−3)². */
const pw = (b: number, e: number) => `${b < 0 ? `(${fmt(b)})` : fmt(b)}${sup(e)}`;
/** A number as a subscript, a base under a log: 2 → "₂", 2.5 → "₂.₅". */
const subscript = (x: number) =>
  [...fmt(x)].map((ch) => (/\d/.test(ch) ? '₀₁₂₃₄₅₆₇₈₉'[Number(ch)] : ch)).join('');
/** log_b(x) is a whole number a student finds by asking which power of b makes x. */
const wholePower = (v: Values) => {
  const y = Math.log(v.x!) / Math.log(v.b!);
  return Number.isFinite(y) && Math.abs(y - Math.round(y)) < 1e-9 && Math.abs(y) <= 12;
};
const BASE_NOT_1 = 'Every power of 1 is 1, so a base of 1 can’t make any other number.';

/**
 * The quadratic formula for u² + bu + c = 0 worked with numbers, −b written as its value
 * (the simplifying would print −(−13) as −−13): (13 + √25) ÷ 2, then (13 + 5) ÷ 2.
 */
const formulaWork = (b: number, c: number, sign: 1 | -1) => {
  const D = b ** 2 - 4 * c;
  const op = sign > 0 ? '+' : '−';
  return [`(${fmt(-b)} ${op} √${par(D)}) ÷ 2`, `(${fmt(-b)} ${op} ${fmt(Math.sqrt(D))}) ÷ 2`];
};

const PI = Math.PI;
/** The greatest common factor of two whole numbers (gcd(0, n) is n). */
const gcd = (a: number, b: number): number => {
  let [x, y] = [Math.abs(Math.round(a)), Math.abs(Math.round(b))];
  while (y) [x, y] = [y, x % y];
  return x;
};
/** A root of ax² + bx + c = 0 by the quadratic formula (sign +1 or −1), or nothing. */
const rootOf = (a: number, b: number, c: number, sign: 1 | -1) => {
  const D = b ** 2 - 4 * a * c;
  return a === 0 || D < -1e-9 ? undefined : (-b + sign * Math.sqrt(Math.max(0, D))) / (2 * a);
};
/**
 * The quadratic formula worked with numbers, −b written as its value: (−3 + √25) ÷ 4, then
 * the root taken: (−3 + 5) ÷ 4, or simplified when it is not whole: (2 + 2√3) ÷ 4 (a root
 * already simplest, √17, stays as it is: the answer is written exactly).
 */
const quadWork = (a: number, b: number, c: number, sign: 1 | -1) => {
  const D = Math.max(0, b ** 2 - 4 * a * c);
  const op = sign > 0 ? '+' : '−';
  const first = `(${fmt(-b)} ${op} √${par(D)}) ÷ ${par(2 * a)}`;
  const [k, r] = Number.isInteger(D) ? radicalParts(D) : [0, 0];
  if (r > 1 && k === 1) return [first];
  const root = r > 1 ? radical(D) : fmt(Math.sqrt(D));
  return [first, `(${fmt(-b)} ${op} ${root}) ÷ ${par(2 * a)}`];
};
/** A root of the quotient ax² + q₁x + q₀ exactly, once r is a root (R = 0). */
const quotientRoot = (sign: 1 | -1) => (v: Values) =>
  v.R !== undefined && Math.abs(v.R) < 1e-9 && [v.a, v.q1, v.q0].every((x) => x !== undefined)
    ? quadraticRoot(v.a!, v.q1!, v.q0!, sign)
    : undefined;

/** A number as a fraction when it is one with a bottom up to `most` (the page's `fraction`). */
const fr = (x: number, most = 12) => formatNumber(x, { fraction: most, improper: true });
/**
 * Terms joined with their signs, zero terms left out, a 1 before a letter left off:
 * [[2, 'x²'], [−3, 'x'], [1, '']] → "2x² − 3x + 1".
 */
const terms = (ts: [number, string][], show: (x: number) => string = fmt) => {
  const out: string[] = [];
  for (const [c, t] of ts) {
    if (Math.abs(c) < 1e-12) continue;
    const size = Math.abs(c) === 1 && t !== '' ? '' : show(Math.abs(c));
    const gap = size.includes('/') && /^[a-z]/.test(t) ? ' ' : '';
    const sign = out.length ? (c < 0 ? ' − ' : ' + ') : c < 0 ? '−' : '';
    out.push(`${sign}${size}${gap}${t}`);
  }
  return out.length ? out.join('') : '0';
};
/** A polynomial from its coefficients, highest power first: [2, −3, 1] → "2x² − 3x + 1". */
const poly = (cs: number[], show: (x: number) => string = fmt) =>
  terms(
    cs.map((c, i) => {
      const k = cs.length - 1 - i;
      return [c, k === 0 ? '' : k === 1 ? 'x' : `x${sup(k)}`];
    }),
    show,
  );
/** The sum on the sigma page with its numbers: Σ from k = 1 to 8 of (3k − 1). */
const sigmaOf = (v: Values) =>
  `Σ from k = 1 to ${v.n === undefined ? 'n' : fmt(v.n)} of (${terms([
    [v.c!, 'k'],
    [v.e!, ''],
  ])})`;
/** x − r as written: x − 2, x + 4, x. */
const lin = (r: number, show: (x: number) => string = fmt) =>
  r === 0 ? 'x' : `x ${r < 0 ? '+' : '−'} ${show(Math.abs(r))}`;
/** A complex number as written: 2 + 3i, 1 − 4i, −i, 11/5 − 2/5 i. */
const cx = (re: number, im: number, show: (x: number) => string = fmt) =>
  terms(
    [
      [re, ''],
      [im, 'i'],
    ],
    show,
  );
/** A sine or cosine as written: 6 × 10⁻¹⁷ is 0. */
const tidy = (x: number) => Math.round(x * 1e10) / 1e10 || 0;
/** An angle in radians as a fraction of π when it is one (π/2, −3π/4), else its decimal. */
const radians = (x: number) => (Math.abs(x) < 1e-12 ? '0' : formatNumber(x, { pi: 'fraction' }));

/** A fraction p/q, the bottom positive. */
type Ratio = [number, number];
/** x as p/q with q up to 12 (the pages' `fraction: 12`), or nothing. */
const ratioOf = (x: number): Ratio | undefined => {
  for (let q = 1; q <= 12; q++) {
    const p = Math.round(x * q);
    if (Math.abs(x * q - p) < 1e-9) return [p, q];
  }
  return undefined;
};
const lowest = ([p, q]: Ratio): Ratio => {
  const g = gcd(p, q) || 1;
  return [p / g, q / g];
};
/** A fraction as written: 3/4, −729/4096, or a whole number. */
const ratioText = ([p, q]: Ratio) => (q === 1 ? fmt(p) : `${p < 0 ? '−' : ''}${Math.abs(p)}/${q}`);
/** A negative number or a fraction bracketed, as written after × or ÷: (−63), (3/4). */
const wrap = (t: string) => (t.startsWith('−') || t.includes('/') ? `(${t})` : t);
/** rᵉ as a fraction when r is one and the numbers stay small, else its decimal. */
const powRatio = (r: number, e: number): Ratio | undefined => {
  const q = ratioOf(r);
  return q && Math.abs(q[0]) ** e < 1e12 && q[1] ** e < 1e12
    ? lowest([q[0] ** e, q[1] ** e])
    : undefined;
};
const powValue = (r: number, e: number) => {
  const q = powRatio(r, e);
  return q ? ratioText(q) : fmt(r ** e);
};
/** rᵉ as written: 2⁵, (−3)², (3/4)⁶. */
const powOf = (r: number, e: number) => {
  const q = ratioOf(r);
  return q && q[1] !== 1 ? `(${ratioText(q)})${sup(e)}` : pw(r, e);
};
/** The geometric sum worked: Sₙ = 3 × (1 − 64) ÷ (1 − 2), then Sₙ = 3 × (−63) ÷ (−1). */
const geometricSumWork = (a1: number, r: number, n: number) => {
  const q = ratioOf(r);
  const rn = powRatio(r, n);
  const inner = (t: string) => (t.startsWith('−') ? `(${t})` : t);
  const top = rn ? ratioText(lowest([rn[1] - rn[0], rn[1]])) : fmt(1 - r ** n);
  const bottom = q ? ratioText(lowest([q[1] - q[0], q[1]])) : fmt(1 - r);
  return [
    `Sₙ = ${fmt(a1)} × (1 − ${inner(powValue(r, n))}) ÷ (1 − ${inner(q ? ratioText(q) : fmt(r))})`,
    `Sₙ = ${fmt(a1)} × ${wrap(top)} ÷ ${wrap(bottom)}`,
  ];
};
/** The n that makes a₁rⁿ⁻¹ = aₙ, a whole number from 1 to 30, or nothing. */
const termCount = (a1: number, r: number, an: number) => {
  if (a1 === 0 || r === 0 || Math.abs(r) === 1) return undefined;
  const k = Math.log(Math.abs(an / a1)) / Math.log(Math.abs(r));
  const e = Math.round(k);
  if (!(Math.abs(k - e) < 1e-9) || e < 0 || e > 29) return undefined;
  return Math.abs(a1 * r ** e - an) <= 1e-9 * Math.max(1, Math.abs(an)) ? e + 1 : undefined;
};

/** (ax + b)ⁿ written out:(x + 2)⁴ = x⁴ + 8x³ + 24x² + 32x + 16. */
const expansion = (a: number, b: number, n: number) => {
  const cs = Array.from({ length: n + 1 }, (_, i) => choose(n, n - i) * a ** (n - i) * b ** i);
  return `(${terms([
    [a, 'x'],
    [b, ''],
  ])})${n === 1 ? '' : sup(n)} = ${poly(cs)}`;
};

/** pπ/q as written: 5π/4, π/6, −π/2, 2π, π. */
const piOver = (p: number, q: number) => {
  const top = `${p < 0 ? '−' : ''}${Math.abs(p) === 1 ? '' : fmt(Math.abs(p))}π`;
  return p === 0 ? '0' : q === 1 ? top : `${top}/${fmt(q)}`;
};
/** An angle on an axis, between quadrants. */
const onAxis = (deg: number) => Math.abs(deg / 90 - Math.round(deg / 90)) < 1e-9;
const ON_AXIS =
  'The side lies on an axis, between quadrants: it has no quadrant or reference angle.';
/** The sign of cosine (and secant) in quadrant Q: + in I and IV, − in II and III. */
const cosSign = (Q: number) => (Q === 1 || Q === 4 ? 1 : -1);
/** A value shown as the identity pages show it (fraction: 100). */
const f100 = (x: number) => fr(x, 100);
/** x as p/q with q up to 100, or nothing. */
const ratioOf100 = (x: number): Ratio | undefined => {
  for (let q = 1; q <= 100; q++) {
    const p = Math.round(x * q);
    if (Math.abs(x * q - p) < 1e-9) return [p, q];
  }
  return undefined;
};
/** θ in degrees from sin θ and the quadrant. */
const angleFromSin = (s: number, Q: number) => {
  const a = (Math.asin(s) * 180) / PI;
  return Q === 1 ? a : Q === 4 ? 360 + a : 180 - a;
};
/** The whole factors of n > 0. */
const factorsOf = (n: number) =>
  Array.from({ length: n }, (_, i) => i + 1).filter((f) => n % f === 0);
/**
 * The rational root theorem's candidates for ax³ + … + d, then the one tested:
 * "Candidates: ±(1, 2, 3, 6) ÷ (1, 2) = ±1, ±2, ±3, ±6, ±1/2, ±3/2; try r = 3."
 */
const rationalCandidates = (a: number, d: number, r: number) => {
  const tryR = `try r = ${fr(r)}`;
  if (d === 0) return `d = 0, so x is a factor and r = 0 is a root; ${tryR}.`;
  if (!Number.isInteger(a) || !Number.isInteger(d)) return `${tryR}.`;
  const [ps, qs] = [factorsOf(Math.abs(d)), factorsOf(Math.abs(a))];
  const all = [...new Set(ps.flatMap((p) => qs.map((q) => p / q)))].sort(
    (x, y) => (ratioOf(x)?.[1] ?? 99) - (ratioOf(y)?.[1] ?? 99) || x - y,
  );
  const head = `Candidates: ±(${ps.join(', ')}) ÷ (${qs.join(', ')})`;
  return all.length > 12
    ? `${head}; ${tryR}.`
    : `${head} = ${all.map((x) => `±${fr(x)}`).join(', ')}; ${tryR}.`;
};

/** The vertical factors a transformation page offers. */
const STRETCH = [-4, -3, -2, -1, -0.5, 0.5, 1, 2, 3, 4];

/**
 * A candidate of x/(x − p) = a/(x − p) + b/x worked by the quadratic formula, then the verdict:
 * rejected when it makes x or x − p zero, else checked in the first equation.
 */
const candidateWork = (v: Values, sign: 1 | -1) => {
  const [a, b, p] = [v.a!, v.b!, v.p!];
  const x = rootOf(1, -(a + b), b * p, sign)!;
  const name = sign > 0 ? 'x₁' : 'x₂';
  const verdict =
    Math.abs(x) < 1e-9
      ? `x = 0 makes the denominator x zero: reject it`
      : Math.abs(x - p) < 1e-9
        ? `x = ${fmt(x)} makes ${lin(p)} = 0: reject it`
        : `x = ${fmt(x)}: ${fmt(x)}/${wrap(fmt(x - p))} = ${fmt(a)}/${wrap(fmt(x - p))} + ${fmt(b)}/${wrap(fmt(x))} ✓`;
  return [...quadWork(1, -(a + b), b * p, sign).map((l) => `${name} = ${l}`), verdict];
};

/** The share within 1, 2 or 3 standard deviations, in percent, by the 68–95–99.7 rule. */
const EMPIRICAL: Record<number, number> = { 1: 68, 2: 95, 3: 99.7 };

/**
 * (x − a)/(x − b) times the second fraction, flipped when t = −1: the value ids of the factors
 * left on top and bottom once equal ones cancel, and the cancelled factors as written.
 */
const flipFactors = (v: Values) => {
  const top = ['a', v.sg === -1 ? 'd' : 'c'];
  const bottom = ['b', v.sg === -1 ? 'c' : 'd'];
  const gone: string[] = [];
  for (const id of [...top]) {
    const i = bottom.findIndex((b) => v[b] === v[id]);
    if (i < 0) continue;
    gone.push(lin(v[id]!));
    top.splice(top.indexOf(id), 1);
    bottom.splice(i, 1);
  }
  return { top, bottom, gone };
};
/** Every factor cancels: the product is 1 wherever it has a value. */
const flipCancelsAll = (v: Values) => flipFactors(v).top.length === 0;
/** What is left after cancelling, as a step's right side: ({x} − {a}) ÷ ({x} − {d}). */
const flipExpr = (v: Values) => {
  const { top, bottom } = flipFactors(v);
  const f = (ids: string[]) => ids.map((id) => `({x} − {${id}})`).join(' × ');
  const t = top.length ? f(top) : '1';
  if (!bottom.length) return t;
  return `${t} ÷ ${bottom.length > 1 ? `(${f(bottom)})` : f(bottom)}`;
};
/** The product written out, the cancelling and the x left out, as the step explains it. */
const flipHow = (v: Values) => {
  const [a, b, c, d] = [v.a!, v.b!, v.c!, v.d!];
  const [m, n] = v.sg === -1 ? [d, c] : [c, d];
  const { top, bottom, gone } = flipFactors(v);
  const side = (ids: string[]) =>
    ids.length === 0 ? '1' : ids.map((id) => `(${lin(v[id]!)})`).join('');
  const out = [...new Set(v.sg === -1 ? [b, c, d] : [b, d])].sort((p, q) => p - q).map(fmt);
  const product = `(${lin(a)})(${lin(m)}) ÷ ((${lin(b)})(${lin(n)}))`;
  const kept = `${side(top)} ÷ ${bottom.length > 1 ? `(${side(bottom)})` : side(bottom)}`;
  return [
    v.sg === -1 ? `Flip the second fraction and multiply: ${product}.` : `Multiply: ${product}.`,
    gone.length
      ? `Cancel ${gone.join(' and ')} to get ${kept}, with x ≠ ${out.join(', ')}.`
      : `Nothing cancels; x ≠ ${out.join(', ')}.`,
    'Then put x in.',
  ].join(' ');
};

export const MATH_11_MODULES: ModuleDef[] = [
  // ── Normal distributions, z-scores and margin of error (S-ID.4, S-IC.4) ──
  page({
    id: 'm.11.normal-distribution',
    assumptions: [
      'The data are roughly bell-shaped and symmetric about the mean μ.',
      'A z-score counts standard deviations from the mean: above the mean it is positive.',
      'The area under the curve left of x is the share of the data below x.',
    ],
    variables: [
      MU('cm', 0, 300),
      SIGMA('cm', 100),
      V('x', 'x', 'Height', { unit: 'cm', min: 0, max: 300, step: 0.5 }),
      zVar(),
      prob('P', 'P', 'Share below x'),
    ],
    rules: [
      limit(
        'σ > 0',
        '{s} is more than 0',
        ['s'],
        (v) => v.s! > 0,
        'A standard deviation of 0 would put every height at the mean: x = μ leaves σ unknown.',
      ),
      zScore('z', 'x', 'm', 's'),
      leftArea('P', 'z'),
    ],
    example: { m: 170, s: 8, x: 182, z: 1.5, P: Phi(1.5) },
    startWith: ['m', 's', 'x'],
    unitSystems: ['metric'],
    equation: '{z} = {{x:unit} − {m:unit}}/{s:unit}',
    representation: {
      kind: 'normalCurve',
      mean: 'm',
      sd: 's',
      axis: 'Height (cm)',
      shade: { to: 'x', area: 'P' },
      mark: { x: 'x', z: 'z' },
    },
  }),
  page({
    id: 'm.11.normal-distribution~between',
    title: 'The share between two values',
    use: 'Use this for “Scores have μ = 50 and σ = 5. What share is between 45 and 60, and how many of 400?”',
    assumptions: [
      'The data are roughly normal, with mean μ and standard deviation σ.',
      'The share between a and b is the area left of b minus the area left of a.',
      'Of N values, about N × P fall between a and b.',
    ],
    variables: [
      MU(),
      SIGMA(),
      V('a', 'a', 'Lower value', { min: -2000, max: 2000, step: 0.5 }),
      V('b', 'b', 'Upper value', { min: -2000, max: 2000, step: 0.5 }),
      zVar('za', 'z-score of a', 'z₁'),
      zVar('zb', 'z-score of b', 'z₂'),
      prob('P', 'P', 'Share between a and b', { min: 0.0001 }),
      W('N', 'N', 'Values in all', 1, 10000),
      V('E', 'E', 'Expected count between a and b', { min: 0.01, max: 10000, step: 0.1 }),
    ],
    rules: [
      limit(
        'a < b',
        '{a} is less than {b}',
        ['a', 'b'],
        (v) => v.a! < v.b!,
        'The lower value a must be less than the upper value b.',
      ),
      zScore('za', 'a', 'm', 's'),
      zScore('zb', 'b', 'm', 's'),
      rule(
        'P = Φ(z₂) − Φ(z₁)',
        '{P} = Φ({zb}) − Φ({za})',
        ['P', 'za', 'zb'],
        (v) => v.P! - (Phi(v.zb!) - Phi(v.za!)),
        {
          P: [
            (v) => Phi(v.zb!) - Phi(v.za!),
            'Φ({zb}) − Φ({za})',
            'The area left of b, less the area left of a.',
          ],
          zb: [
            (v) => (inOpen(v.P! + Phi(v.za!)) ? invPhi(v.P! + Phi(v.za!)) : undefined),
            'invNorm({P} + Φ({za}))',
            'The area left of b is P plus the area left of a.',
          ],
          za: [
            (v) => (inOpen(Phi(v.zb!) - v.P!) ? invPhi(Phi(v.zb!) - v.P!) : undefined),
            'invNorm(Φ({zb}) − {P})',
            'The area left of a is the area left of b less P.',
          ],
        },
      ),
      countOf('E', 'N', 'P', 'The share P of the N values.'),
    ],
    example: {
      m: 50,
      s: 5,
      a: 45,
      b: 60,
      za: -1,
      zb: 2,
      P: Phi(2) - Phi(-1),
      N: 400,
      E: 400 * (Phi(2) - Phi(-1)),
    },
    startWith: ['m', 's', 'a', 'b', 'N'],
    pictureLabels: ['N', 'E'],
    representation: {
      kind: 'normalCurve',
      mean: 'm',
      sd: 's',
      axis: 'Score',
      shade: { from: 'a', to: 'b', area: 'P' },
    },
  }),
  page({
    id: 'm.11.normal-distribution~outside',
    title: 'The share more than a distance from the mean',
    use: 'Use this for “Weights have μ = 500 g and σ = 2 g. How many of 500 packages are more than 3 g off?”',
    assumptions: [
      'The data are roughly normal, with mean μ and standard deviation σ.',
      'The curve is symmetric, so the two tails beyond d from the mean hold the same area.',
      'Of N values, about N × P are more than d from the mean.',
    ],
    variables: [
      MU(undefined, -5000, 10000),
      SIGMA(undefined, 1000),
      V('d', 'd', 'Distance from the mean', { min: 0.01, max: 5000, step: 0.1 }),
      V('lo', 'L', 'Lower cutoff', { min: -10000, max: 15000, step: 0.1 }),
      V('hi', 'U', 'Upper cutoff', { min: -10000, max: 15000, step: 0.1 }),
      V('z', 'z', 'z-score of d', { min: 0, max: 3, step: 0.01 }),
      prob('P', 'P', 'Share more than d from the mean'),
      W('N', 'N', 'Values in all', 1, 100000),
      V('E', 'E', 'Expected count outside', { min: 0, max: 100000, step: 0.1 }),
    ],
    rules: [
      offset('lo', 'm', 'd', -1, 'Go down d from the mean.'),
      offset('hi', 'm', 'd', 1, 'Go up d from the mean.'),
      rule('z = d ÷ σ', '{z} = {d} ÷ {s}', ['z', 'd', 's'], (v) => v.z! * v.s! - v.d!, {
        z: [(v) => fin(div(v.d!, v.s!)), '{d} ÷ {s}', 'The distance in standard deviations.'],
        d: [(v) => exact(v.z! * v.s!), '{z} × {s}', 'z standard deviations.'],
        s: [(v) => fin(div(v.d!, v.z!)), '{d} ÷ {z}', 'The distance split into z equal steps.'],
      }),
      rule(
        'P = 2 × (1 − Φ(z))',
        '{P} = 2 × (1 − Φ({z}))',
        ['P', 'z'],
        (v) => v.P! - 2 * (1 - Phi(v.z!)),
        {
          P: [
            (v) => 2 * (1 - Phi(v.z!)),
            '2 × (1 − Φ({z}))',
            'One tail is 1 − Φ(z); the other side has the same area.',
          ],
          z: [
            (v) => (inOpen(v.P!) ? invPhi(1 - v.P! / 2) : undefined),
            'invNorm(1 − {P} ÷ 2)',
            'Each tail holds half of P, so the area left of z is 1 − P ÷ 2.',
          ],
        },
      ),
      countOf('E', 'N', 'P', 'The share P of the N values.'),
    ],
    example: {
      m: 500,
      s: 2,
      d: 3,
      lo: 497,
      hi: 503,
      z: 1.5,
      P: 2 * (1 - Phi(1.5)),
      N: 500,
      E: 1000 * (1 - Phi(1.5)),
    },
    startWith: ['m', 's', 'd', 'N'],
    pictureLabels: ['d', 'z', 'N', 'E'],
    representation: {
      kind: 'normalCurve',
      mean: 'm',
      sd: 's',
      axis: 'Value',
      shade: { from: 'lo', to: 'hi', outside: true, area: 'P' },
      // A cutoff's drag moves d (the mean held), so the other cutoff follows.
      keep: ['m', 's', 'N'],
    },
  }),
  page({
    id: 'm.11.normal-distribution~empirical',
    title: 'The 68–95–99.7 rule',
    use: 'Use this for “IQ scores have μ = 100 and σ = 15. About what percent are between 70 and 130?”',
    assumptions: [
      'The data are roughly normal, with mean μ and standard deviation σ.',
      'About 68%, 95% and 99.7% of the data are within 1, 2 and 3 standard deviations of the mean.',
      'The rule gives rounded shares; a z-table gives more digits.',
    ],
    variables: [
      MU(),
      SIGMA(),
      V('k', 'k', 'Standard deviations from the mean', { allowed: [1, 2, 3], min: 1, max: 3 }),
      V('lo', 'a', 'Lower end', { min: -3000, max: 3000, step: 0.5 }),
      V('hi', 'b', 'Upper end', { min: -3000, max: 3000, step: 0.5 }),
      V('pct', 'P', 'Share within k standard deviations', {
        unit: '%',
        min: 0,
        max: 100,
        derived: true,
      }),
    ],
    rules: [
      rule(
        'a = μ − k × σ',
        '{lo} = {m} − {k} × {s}',
        ['lo', 'm', 'k', 's'],
        (v) => v.lo! - (v.m! - v.k! * v.s!),
        {
          lo: [
            (v) => exact(v.m! - v.k! * v.s!),
            '{m} − {k} × {s}',
            'Go down k standard deviations from the mean.',
          ],
          m: [
            (v) => exact(v.lo! + v.k! * v.s!),
            '{lo} + {k} × {s}',
            'Go back up k standard deviations.',
          ],
          s: [
            (v) => fin(div(v.m! - v.lo!, v.k!)),
            '({m} − {lo}) ÷ {k}',
            'The distance below the mean, split into k steps.',
          ],
          k: [() => undefined],
        },
      ),
      rule(
        'b = μ + k × σ',
        '{hi} = {m} + {k} × {s}',
        ['hi', 'm', 'k', 's'],
        (v) => v.hi! - (v.m! + v.k! * v.s!),
        {
          hi: [
            (v) => exact(v.m! + v.k! * v.s!),
            '{m} + {k} × {s}',
            'Go up k standard deviations from the mean.',
          ],
          m: [
            (v) => exact(v.hi! - v.k! * v.s!),
            '{hi} − {k} × {s}',
            'Go back down k standard deviations.',
          ],
          s: [
            (v) => fin(div(v.hi! - v.m!, v.k!)),
            '({hi} − {m}) ÷ {k}',
            'The distance above the mean, split into k steps.',
          ],
          k: [() => undefined],
        },
      ),
      derive(
        'P = share within k standard deviations',
        'pct',
        ['k'],
        '{pct} = share within {k} standard deviations',
        (v) => EMPIRICAL[v.k!],
        'share within {k} standard deviations',
        'The 68–95–99.7 rule: 1, 2 or 3 standard deviations each way.',
      ),
    ],
    example: { m: 100, s: 15, k: 2, lo: 70, hi: 130, pct: 95 },
    startWith: ['m', 's', 'k'],
    representation: {
      kind: 'normalCurve',
      mean: 'm',
      sd: 's',
      axis: 'Score',
      bands: true,
      shade: { from: 'lo', to: 'hi' },
      fixed: true,
    },
  }),
  page({
    id: 'm.11.normal-distribution~percentile',
    title: 'The value at a percentile',
    use: 'Use this for “Scores have μ = 500 and σ = 100. What score is at the 90th percentile?”',
    assumptions: [
      'The data are roughly normal, with mean μ and standard deviation σ.',
      'At the 90th percentile, 90% of the data are below: the area left of x is 0.90.',
      'invNorm(P) is the z with area P to its left.',
    ],
    variables: [
      MU(),
      SIGMA(),
      prob('P', 'P', 'Share below x (the percentile)', { min: 0.001, max: 0.999 }),
      zVar(),
      V('x', 'x', 'Value at the percentile', { min: -5000, max: 5000, step: 0.5 }),
    ],
    rules: [
      leftArea('P', 'z'),
      zScore('z', 'x', 'm', 's'),
      limit(
        'z = 0 → x = μ',
        '{z} = 0 → {x} = {m}',
        ['z', 'x', 'm'],
        (v) => Math.abs(v.z!) > 1e-9 || Math.abs(v.x! - v.m!) < 1e-6,
        'At the 50th percentile z = 0, so the value is the mean μ itself.',
      ),
    ],
    example: { m: 500, s: 100, P: 0.9, z: invPhi(0.9), x: 500 + 100 * invPhi(0.9) },
    startWith: ['m', 's', 'P'],
    representation: {
      kind: 'normalCurve',
      mean: 'm',
      sd: 's',
      axis: 'Score',
      shade: { to: 'x', area: 'P' },
      mark: { x: 'x', z: 'z' },
    },
  }),
  page({
    id: 'm.11.normal-distribution~margin',
    title: 'Margin of error of a sample proportion',
    use: 'Use this for “In a random sample of 400, 60% said yes. What is the margin of error?”',
    assumptions: [
      'The sample is random, and n is large enough that the sample proportions are about normal.',
      'The standard error of p̂ is √(p̂(1 − p̂) ÷ n).',
      'About 2 standard errors each way cover 95% of samples: that is the margin of error.',
    ],
    variables: [
      V('ph', 'p̂', 'Sample proportion', { min: 0.01, max: 0.99, step: 0.01 }),
      W('n', 'n', 'Sample size', 10, 10000),
      V('SE', 'SE', 'Standard error', { min: 0.0001, max: 0.5, step: 0.0001, derived: true }),
      V('E', 'E', 'Margin of error', { min: 0, max: 1, step: 0.0001, derived: true }),
      V('lo', 'L', 'Lower end', { min: -1, max: 2, step: 0.0001, derived: true }),
      V('hi', 'U', 'Upper end', { min: -1, max: 2, step: 0.0001, derived: true }),
    ],
    rules: [
      limit(
        'n × p̂ ≥ 10 and n × (1 − p̂) ≥ 10',
        '{n} × {ph} and {n} × (1 − {ph}) are each at least 10',
        ['n', 'ph'],
        (v) => v.n! * v.ph! >= 10 - 1e-9 && v.n! * (1 - v.ph!) >= 10 - 1e-9,
        'The normal model needs at least 10 yes and 10 no answers: n × p̂ and n × (1 − p̂) of 10 or more.',
      ),
      derive(
        'SE = √(p̂ × (1 − p̂) ÷ n)',
        'SE',
        ['ph', 'n'],
        '{SE} = √({ph} × (1 − {ph}) ÷ {n})',
        (v) => Math.sqrt((v.ph! * (1 - v.ph!)) / v.n!),
        '√({ph} × (1 − {ph}) ÷ {n})',
        'How much p̂ varies from sample to sample of size n.',
      ),
      derive(
        'E = 2 × SE',
        'E',
        ['SE'],
        '{E} = 2 × {SE}',
        (v) => 2 * v.SE!,
        '2 × {SE}',
        'About 95% of samples land within 2 standard errors.',
      ),
      derive(
        'L = p̂ − E',
        'lo',
        ['ph', 'E'],
        '{lo} = {ph} − {E}',
        (v) => v.ph! - v.E!,
        '{ph} − {E}',
        'Go down the margin from the estimate.',
      ),
      derive(
        'U = p̂ + E',
        'hi',
        ['ph', 'E'],
        '{hi} = {ph} + {E}',
        (v) => v.ph! + v.E!,
        '{ph} + {E}',
        'Go up the margin from the estimate.',
      ),
    ],
    example: {
      ph: 0.6,
      n: 400,
      SE: Math.sqrt(0.24 / 400),
      E: 2 * Math.sqrt(0.24 / 400),
      lo: 0.6 - 2 * Math.sqrt(0.24 / 400),
      hi: 0.6 + 2 * Math.sqrt(0.24 / 400),
    },
    startWith: ['ph', 'n'],
    representation: {
      kind: 'normalCurve',
      mean: 'ph',
      sd: 'SE',
      axis: 'Sample proportion p̂',
      interval: { center: 'ph', margin: 'E' },
      fixed: true,
    },
  }),

  // ── Binomial distributions and expected value (S-MD.1–S-MD.6) ──
  page({
    id: 'm.11.probability-distributions',
    assumptions: [
      'There are n trials, and each one is a success or not.',
      'Every trial has the same chance p, and the trials are independent.',
      'E is the long-run average count of successes, not a promise for one round of n trials.',
    ],
    variables: [
      W('n', 'n', 'Trials', 1, 40),
      prob('p', 'p', 'Chance of success on each trial', { min: 0.01, max: 0.99, step: 0.01 }),
      W('k', 'k', 'Successes', 0, 40),
      V('C', 'C', 'Orders of k successes, C(n, k)', {
        integer: true,
        min: 1,
        max: 1e12,
        derived: true,
      }),
      prob('P', 'P', 'Probability of exactly k successes, P(X = k)', { derived: true }),
      V('E', 'E', 'Expected successes E(X)', { min: 0.01, max: 40, step: 0.01 }),
      V('S', 'σ', 'Standard deviation', { min: 0, max: 10, step: 0.0001, derived: true }),
    ],
    rules: [
      limit(
        'k ≤ n',
        '{k} is at most {n}',
        ['n', 'k'],
        (v) => v.k! <= v.n!,
        'k counts successes among the n trials, so k is at most n.',
      ),
      derive(
        'C = C(n, k)',
        'C',
        ['n', 'k'],
        '{C} = C({n}, {k})',
        (v) => nCk(v.n!, v.k!),
        'C({n}, {k})',
        'The ways to pick which k of the n trials are the successes.',
      ),
      derive(
        'P = C × p^k × (1 − p)^(n − k)',
        'P',
        ['C', 'p', 'k', 'n'],
        '{P} = {C} × {p}^{k} × (1 − {p})^({n} − {k})',
        (v) => v.C! * v.p! ** v.k! * (1 - v.p!) ** (v.n! - v.k!),
        '{C} × {p}^{k} × (1 − {p})^({n} − {k})',
        'Each order has k successes at p and n − k failures at 1 − p.',
        {
          work: (v) => {
            const [pk, q] = [v.p! ** v.k!, 1 - v.p!];
            return [
              `P = ${fmt(v.C!)} × ${fmt(pk)} × ${fmt(q)}${sup(v.n! - v.k!)}`,
              `P = ${fmt(v.C!)} × ${fmt(pk)} × ${fmt(q ** (v.n! - v.k!))}`,
            ];
          },
        },
      ),
      rule('E = n × p', '{E} = {n} × {p}', ['E', 'n', 'p'], (v) => v.E! - v.n! * v.p!, {
        E: [(v) => exact(v.n! * v.p!), '{n} × {p}', 'On average, p of the n trials succeed.'],
        p: [(v) => fin(div(v.E!, v.n!)), '{E} ÷ {n}', 'The expected successes per trial.'],
        n: [() => undefined],
      }),
      derive(
        'σ = √(n × p × (1 − p))',
        'S',
        ['n', 'p'],
        '{S} = √({n} × {p} × (1 − {p}))',
        (v) => Math.sqrt(v.n! * v.p! * (1 - v.p!)),
        '√({n} × {p} × (1 − {p}))',
        'The typical distance of the count from its mean.',
      ),
    ],
    example: {
      n: 10,
      p: 0.3,
      k: 2,
      C: 45,
      P: binomialPmf(10, 0.3, 2),
      E: 3,
      S: Math.sqrt(2.1),
    },
    startWith: ['n', 'p', 'k'],
    sliders: true,
    pictureLabels: ['C', 'P'],
    representation: {
      kind: 'histogram',
      binomial: { n: 'n', p: 'p', mean: 'E', sd: 'S' },
      lit: 'k',
      axis: 'Successes (k)',
    },
  }),
  page({
    id: 'm.11.probability-distributions~expected-value',
    title: 'Expected value of a game',
    use: 'Use this for “A spinner pays −2, 0, 5 or 20 points with chances 0.5, 0.3, 0.15, 0.05. What is the expected value?”',
    assumptions: [
      'X takes four values, each with its own probability.',
      'The probabilities add to 1, so the last one is 1 minus the others.',
      'E(X) is the average of X over many plays: each value times its probability, added.',
      'For fewer outcomes, give the extra values probability 0.',
    ],
    variables: [
      V('x1', 'x₁', 'First value', { min: -1000, max: 1000, step: 1 }),
      V('x2', 'x₂', 'Second value', { min: -1000, max: 1000, step: 1 }),
      V('x3', 'x₃', 'Third value', { min: -1000, max: 1000, step: 1 }),
      V('x4', 'x₄', 'Fourth value', { min: -1e5, max: 1e5, step: 1 }),
      prob('p1', 'p₁', 'Probability of x₁', { step: 0.01 }),
      prob('p2', 'p₂', 'Probability of x₂', { step: 0.01 }),
      prob('p3', 'p₃', 'Probability of x₃', { step: 0.01 }),
      prob('p4', 'p₄', 'Probability of x₄', { step: 0.01, derived: true }),
      V('E', 'E', 'Expected value E(X)', { min: -1000, max: 1000, step: 0.01 }),
    ],
    rules: [
      limit(
        'p₁ + p₂ + p₃ ≤ 1',
        '{p1} + {p2} + {p3} is at most 1',
        ['p1', 'p2', 'p3'],
        (v) => v.p1! + v.p2! + v.p3! <= 1 + 1e-9,
        'The first three probabilities already add to more than 1.',
      ),
      derive(
        'p₄ = 1 − (p₁ + p₂ + p₃)',
        'p4',
        ['p1', 'p2', 'p3'],
        '{p4} = 1 − ({p1} + {p2} + {p3})',
        (v) => 1 - (v.p1! + v.p2! + v.p3!),
        '1 − ({p1} + {p2} + {p3})',
        'All the probabilities add to 1.',
      ),
      rule(
        'E = x₁p₁ + x₂p₂ + x₃p₃ + x₄p₄',
        '{E} = {x1} × {p1} + {x2} × {p2} + {x3} × {p3} + {x4} × {p4}',
        ['E', 'x1', 'p1', 'x2', 'p2', 'x3', 'p3', 'x4', 'p4'],
        (v) => v.E! - (v.x1! * v.p1! + v.x2! * v.p2! + v.x3! * v.p3! + v.x4! * v.p4!),
        {
          E: [
            (v) => exact(v.x1! * v.p1! + v.x2! * v.p2! + v.x3! * v.p3! + v.x4! * v.p4!),
            '{x1} × {p1} + {x2} × {p2} + {x3} × {p3} + {x4} × {p4}',
            'Weight each value by its probability, then add.',
          ],
          x4: [
            (v) =>
              v.p4! > 1e-9
                ? fin((v.E! - v.x1! * v.p1! - v.x2! * v.p2! - v.x3! * v.p3!) / v.p4!)
                : undefined,
            '({E} − {x1} × {p1} − {x2} × {p2} − {x3} × {p3}) ÷ {p4}',
            'Take the other three weighted values from E, then divide by p₄: E = 0 makes the game fair.',
          ],
          ...never('x1', 'p1', 'x2', 'p2', 'x3', 'p3', 'p4'),
        },
      ),
    ],
    example: { x1: -2, x2: 0, x3: 5, x4: 20, p1: 0.5, p2: 0.3, p3: 0.15, p4: 0.05, E: 0.75 },
    startWith: ['x4', 'x1', 'x2', 'x3', 'p1', 'p2', 'p3'],
    representation: {
      kind: 'histogram',
      probability: {
        values: ['x1', 'x2', 'x3', 'x4'],
        probs: ['p1', 'p2', 'p3', 'p4'],
        mean: 'E',
      },
      axis: 'Points (x)',
      keep: ['x1', 'x2', 'x3', 'x4', 'p1', 'p2', 'p3'],
    },
  }),
  page({
    id: 'm.11.probability-distributions~at-least',
    title: 'Binomial: at least k successes',
    use: 'Use this for “A fair coin is tossed 5 times. What is the chance of at least 4 heads?”',
    assumptions: [
      'At least k means k, k + 1, … up to n successes: add those bars.',
      'Each bar is P(X = j) = C(n, j) × pʲ × (1 − p)ⁿ⁻ʲ, with the same p on every independent trial.',
      'When fewer bars lie below k, add those instead and take them from 1: P(X ≥ k) = 1 − P(X < k).',
    ],
    variables: [
      W('n', 'n', 'Trials', 1, 20),
      prob('p', 'p', 'Chance of success on each trial', { min: 0.01, max: 0.99, step: 0.01 }),
      W('k', 'k', 'At least this many successes', 1, 20),
      prob('P', 'P', 'Probability of at least k successes, P(X ≥ k)', { derived: true }),
    ],
    rules: [
      limit(
        'k ≤ n',
        '{k} is at most {n}',
        ['n', 'k'],
        (v) => v.k! <= v.n!,
        'There can’t be more successes than trials, so k is at most n.',
      ),
      derive(
        'P(X ≥ k) = P(k) + … + P(n)',
        'P',
        ['n', 'p', 'k'],
        '{P} = P(X ≥ {k}) in {n} trials at {p}',
        (v) => (v.k! > v.n! ? undefined : atLeast(v.n!, v.p!, v.k!)),
        (v) => {
          const { js, rest } = atLeastBars(v.n!, v.k!);
          const sum = js.map(
            (j) => `${choose(v.n!, j)} × {p}${sup(j)} × (1 − {p})${sup(v.n! - j)}`,
          );
          return rest ? `1 − (${sum.join(' + ')})` : sum.join(' + ');
        },
        (v) => {
          const { js, rest } = atLeastBars(v.n!, v.k!);
          // The orders C(n, j) each bar uses, said before the line multiplies by them.
          const c = (j: number) => `C(${v.n!}, ${j}) = ${fmt(choose(v.n!, j))}`;
          const orders =
            js.length <= 3
              ? js.map(c).join(', ')
              : `${c(js[0]!)}, ${c(js[1]!)}, …, ${c(js[js.length - 1]!)}`;
          return rest
            ? `Fewer bars lie below k: add P(0) up to P(k − 1), the chance of fewer than k, and take it from 1. Orders: ${orders}.`
            : `Add the bars from k up to n: each is the orders of j successes, C(n, j), times the chance of one order. Orders: ${orders}.`;
        },
        {
          check: (v) => {
            const { js, rest } = atLeastBars(v.n!, v.k!);
            const sum = js
              .map(
                (j) =>
                  `${choose(v.n!, j)} × ${fmt(v.p!)}${sup(j)} × (1 − ${fmt(v.p!)})${sup(v.n! - j)}`,
              )
              .join(' + ');
            return `${fmt(v.P!)} = ${rest ? `1 − (${sum})` : sum}`;
          },
          work: (v) => {
            const { js, rest } = atLeastBars(v.n!, v.k!);
            // To 4 decimals, as the picture's bars and caption write them (tiny ones to 4 figures).
            const bars = js.map((j) => {
              const b = binomialPmf(v.n!, v.p!, j);
              return fmt(Number(b >= 0.001 ? b.toFixed(4) : b.toPrecision(4)));
            });
            return js.length > 1 || rest
              ? [rest ? `P = 1 − (${bars.join(' + ')})` : `P = ${bars.join(' + ')}`]
              : [];
          },
        },
      ),
    ],
    example: { n: 5, p: 0.5, k: 4, P: 0.1875 },
    startWith: ['n', 'p', 'k'],
    sliders: true,
    representation: {
      kind: 'histogram',
      binomial: { n: 'n', p: 'p' },
      range: { from: 'k', total: 'P' },
      axis: 'Successes (k)',
    },
  }),

  // ── The binomial theorem and Pascal's triangle (A-APR.5) ──
  page({
    id: 'm.11.binomial-theorem',
    assumptions: [
      'Write (ax + b)ⁿ as (A + B)ⁿ with A = ax and B = b: row n of Pascal’s triangle gives the coefficients.',
      'In every term the powers of A and B add up to n: the xᵏ term is C(n, k)Aᵏ Bⁿ⁻ᵏ.',
      'When exactly one of a and b is negative, the terms alternate in sign.',
    ],
    variables: [
      V('a', 'a', 'Coefficient of x', { integer: true, min: -5, max: 5 }),
      V('b', 'b', 'Constant', { integer: true, min: -10, max: 10 }),
      W('n', 'n', 'Power', 1, 12),
      W('k', 'k', 'Power of x in the term', 0, 12),
      V('C', 'C', 'Entry of Pascal’s triangle, C(n, k)', {
        integer: true,
        min: 1,
        max: 1000,
        derived: true,
      }),
      V('T', 'T', 'Coefficient of xᵏ', { integer: true, min: -1e16, max: 1e16, derived: true }),
    ],
    rules: [
      limit(
        'k ≤ n',
        '{k} is at most {n}',
        ['n', 'k'],
        (v) => v.k! <= v.n!,
        'The xᵏ term takes ax from k of the n factors, so k is at most n.',
      ),
      derive(
        'C = C(n, k)',
        'C',
        ['n', 'k'],
        '{C} = C({n}, {k})',
        (v) => nCk(v.n!, v.k!),
        'C({n}, {k})',
        'Entry k of row n of Pascal’s triangle: the ways to pick k of the n factors for ax.',
      ),
      derive(
        'T = C × a^k × b^(n − k)',
        'T',
        ['C', 'a', 'k', 'b', 'n'],
        '{T} = {C} × {a}^{k} × {b}^({n} − {k})',
        (v) => v.C! * v.a! ** v.k! * v.b! ** (v.n! - v.k!),
        '{C} × {a}^{k} × {b}^({n} − {k})',
        'k factors give ax and the other n − k give b.',
        {
          work: (v) => [
            `T = ${fmt(v.C!)} × ${pw(v.a!, v.k!)} × ${pw(v.b!, v.n! - v.k!)}`,
            `T = ${fmt(v.C!)} × ${par(v.a! ** v.k!)} × ${par(v.b! ** (v.n! - v.k!))}`,
          ],
        },
      ),
    ],
    example: { a: 2, b: -3, n: 5, k: 3, C: 10, T: 720 },
    startWith: ['a', 'b', 'n', 'k'],
    equation: '({a}x + {b})^{n}',
    representation: { kind: 'pascalTriangle', n: 'n', k: 'k', expand: { a: 'A', b: 'B' } },
  }),
  page({
    id: 'm.11.binomial-theorem~expand',
    title: 'Expand (ax + b)ⁿ',
    use: 'Use this for “Expand (x + 2)⁴.”',
    assumptions: [
      'Row n of Pascal’s triangle gives the coefficients: 1, 4, 6, 4, 1 for n = 4.',
      'The xʲ term is C(n, j) × aʲ × bⁿ⁻ʲ: the powers of a climb as the powers of b fall.',
      'There are n + 1 terms; a power of x above n has coefficient 0.',
    ],
    variables: [
      V('a', 'a', 'Coefficient of x', { integer: true, min: -5, max: 5 }),
      V('b', 'b', 'Constant', { integer: true, min: -10, max: 10 }),
      V('n', 'n', 'Power', { allowed: [0, 1, 2, 3, 4, 5, 6], min: 0, max: 6 }),
      ...[6, 5, 4, 3, 2, 1, 0].map((j) =>
        V(
          `c${j}`,
          `c${'₀₁₂₃₄₅₆'[j]}`,
          j === 0 ? 'Constant term' : `Coefficient of x${j > 1 ? '⁰¹²³⁴⁵⁶'[j] : ''}`,
          {
            integer: true,
            min: -1e9,
            max: 1e9,
            derived: true,
            // A power of x above n has no term: its coefficient is left out.
            ...(j > 0 ? { countedBy: { count: 'n', index: j } } : {}),
          },
        ),
      ),
    ],
    rules: [6, 5, 4, 3, 2, 1, 0].map((j) => {
      const c = `c${'₀₁₂₃₄₅₆'[j]}`;
      const id = `c${j}`;
      const coef = (v: Values) => choose(v.n!, j) * v.a! ** j * v.b! ** (v.n! - j);
      const expr = `C({n}, ${j}) × {a}^${j} × {b}^({n} − ${j})`;
      // A power of x above n has no coefficient: the rule holds with nothing to find, and its
      // value (counted only up to n) is named in words, not by its box.
      const r = rule(
        `${id} = C(n, ${j}) × a^${j} × b^(n − ${j})`,
        j === 0 ? `{c0} = ${expr}` : `coefficient of x${j > 1 ? sup(j) : ''} = ${expr}`,
        [id, 'n', 'a', 'b'],
        (v) => (v.n! < j ? 0 : v[id]! - coef(v)),
        {
          [id]: [
            (v) => (v.n! < j ? undefined : coef(v)),
            expr,
            `Row n, entry ${j}, times a to the ${j} and b to the rest of the power.`,
          ],
          ...never('n', 'a', 'b'),
        },
        {
          check: (v) =>
            v.n! < j
              ? `no x${sup(j)} term: the powers stop at n`
              : `${fmt(v[id]!)} = ${choose(v.n!, j)} × ${pw(v.a!, j)} × ${pw(v.b!, v.n! - j)}`,
          work: {
            [id]: (v) => [
              `${c} = ${choose(v.n!, j)} × ${pw(v.a!, j)} × ${pw(v.b!, v.n! - j)}`,
              `${c} = ${choose(v.n!, j)} × ${par(v.a! ** j)} × ${par(v.b! ** (v.n! - j))}`,
              // The last coefficient found: the whole expansion.
              ...(j === 0 ? [expansion(v.a!, v.b!, v.n!)] : []),
            ],
          },
        },
      );
      return r;
    }),
    example: { a: 1, b: 2, n: 4, c4: 1, c3: 8, c2: 24, c1: 32, c0: 16 },
    startWith: ['a', 'b', 'n'],
    equation: '({a}x + {b})^{n}',
    representation: { kind: 'pascalTriangle', n: 'n', rows: 6, expand: { a: 'A', b: 'B' } },
  }),
  page({
    id: 'm.11.binomial-theorem~pascal-rule',
    title: 'Pascal’s rule: add the two above',
    use: 'Use this for “Fill in row 6 of Pascal’s triangle” or “Find C(6, 2) from row 5.”',
    assumptions: [
      'Each row starts and ends with 1.',
      'Each inside entry is the sum of the two entries above it: C(n, k) = C(n − 1, k − 1) + C(n − 1, k).',
    ],
    variables: [
      W('n', 'n', 'Row', 2, 12),
      W('k', 'k', 'Entry', 1, 11),
      V('L', 'L', 'Entry above left, C(n − 1, k − 1)', {
        integer: true,
        min: 1,
        max: 1000,
        derived: true,
      }),
      V('R', 'R', 'Entry above right, C(n − 1, k)', {
        integer: true,
        min: 1,
        max: 1000,
        derived: true,
      }),
      V('E', 'E', 'Entry C(n, k)', { integer: true, min: 1, max: 1000, derived: true }),
    ],
    rules: [
      limit(
        'k is at most n − 1',
        '{k} is at most {n} − 1',
        ['n', 'k'],
        (v) => v.k! <= v.n! - 1,
        'The inside entries of row n run from k = 1 to n − 1; the ends are 1.',
      ),
      derive(
        'L = C(n − 1, k − 1)',
        'L',
        ['n', 'k'],
        '{L} = C({n} − 1, {k} − 1)',
        (v) => nCk(v.n! - 1, v.k! - 1),
        'C({n} − 1, {k} − 1)',
        'The entry up and to the left, in row n − 1.',
        { work: (v) => [`L = C(${v.n! - 1}, ${v.k! - 1})`] },
      ),
      derive(
        'R = C(n − 1, k)',
        'R',
        ['n', 'k'],
        '{R} = C({n} − 1, {k})',
        (v) => nCk(v.n! - 1, v.k!),
        'C({n} − 1, {k})',
        'The entry up and to the right, in row n − 1.',
        { work: (v) => [`R = C(${v.n! - 1}, ${v.k!})`] },
      ),
      derive(
        'E = L + R',
        'E',
        ['L', 'R'],
        '{E} = {L} + {R}',
        (v) => v.L! + v.R!,
        '{L} + {R}',
        'Add the two entries above it.',
      ),
    ],
    example: { n: 6, k: 2, L: 5, R: 10, E: 15 },
    startWith: ['n', 'k'],
    sliders: true,
    representation: { kind: 'pascalTriangle', n: 'n', k: 'k' },
  }),

  // ── Logarithms and log properties (F-LE.4, F-BF.5) ──
  page({
    id: 'm.11.logarithms',
    assumptions: [
      'A log is an exponent: log_b(x) is the power of b that makes x, so log_b(x) = y means bʸ = x.',
      'Only a positive x has a log.',
      'The base b is positive and not 1.',
    ],
    variables: [
      V('b', 'b', 'Base', { min: 0.1, max: 20, step: 0.01 }),
      V('x', 'x', 'Number', { min: 0.001, max: 1e9, step: 0.01 }),
      V('y', 'y', 'Logarithm', { min: -30, max: 30, step: 0.01 }),
    ],
    rules: [
      limit('b ≠ 1', 'The base {b} is not 1', ['b'], (v) => v.b !== 1, BASE_NOT_1),
      rule(
        'x = b^y',
        '{x} = {b}^{y}',
        ['x', 'b', 'y'],
        (v) => ln(v.x!) - v.y! * ln(v.b!),
        {
          y: [
            (v) => (v.b === 1 || !(v.x! > 0) ? undefined : fin(log10(v.x!) / log10(v.b!))),
            // A whole power is found by asking what power of b makes x; any other by the
            // common logs (change of base).
            (v) => (wholePower(v) ? 'log_{b}({x})' : 'log₁₀ {x} ÷ log₁₀ {b}'),
            (v) =>
              wholePower(v)
                ? 'Ask: b to what power makes x?'
                : 'The power of b that makes x; the common logs of x and b give it by dividing.',
          ],
          x: [(v) => fin(v.b! ** v.y!), '{b}^{y}', 'Rewrite log_b(x) = y as bʸ = x.'],
          b: [
            (v) => (v.y === 0 || !(v.x! > 0) ? undefined : fin(v.x! ** (1 / v.y!))),
            '{x}^(1 ÷ {y})',
            'bʸ = x, so b is the yth root of x.',
          ],
        },
        {
          work: {
            y: (v) =>
              wholePower(v)
                ? [
                    `${pw(v.b!, v.y!)} = ${fmt(v.x!)}, so log${subscript(v.b!)} ${fmt(v.x!)} = ${fmt(v.y!)}`,
                  ]
                : [],
          },
        },
      ),
    ],
    example: { b: 2, x: 32, y: 5 },
    startWith: ['b', 'x'],
    equation: 'log_{b}({x}) = {y}',
    representation: {
      kind: 'functionGraph',
      family: 'log',
      b: 'b',
      at: { x: 'x', y: 'y' },
      marks: ['zeros', 'asymptotes', 'domain'],
    },
  }),
  page({
    id: 'm.11.logarithms~change-of-base',
    title: 'Change of base',
    use: 'Use this for “Estimate log₃ 20” with the log key on a calculator.',
    assumptions: [
      'log_b(x) = log x ÷ log b, with the common logs (base 10) on a calculator.',
      'Any base works for both logs, if both use the same one.',
      'The base b is positive and not 1, and x is positive.',
    ],
    variables: [
      V('b', 'b', 'Base', { min: 0.1, max: 20, step: 0.01 }),
      V('x', 'x', 'Number', { min: 0.001, max: 1e9, step: 0.01 }),
      V('L1', 'L₁', 'Common log of x, log x', { min: -3, max: 9, step: 0.0001, derived: true }),
      V('L2', 'L₂', 'Common log of b, log b', { min: -1, max: 1.31, step: 0.0001, derived: true }),
      V('y', 'y', 'log_b(x)', { min: -1000, max: 1000, step: 0.0001, derived: true }),
    ],
    rules: [
      limit('b ≠ 1', 'The base {b} is not 1', ['b'], (v) => v.b !== 1, BASE_NOT_1),
      derive(
        'L₁ = log₁₀ x',
        'L1',
        ['x'],
        '{L1} = log₁₀ {x}',
        (v) => (v.x! > 0 ? log10(v.x!) : undefined),
        'log₁₀ {x}',
        'The common log: the power of 10 that makes x.',
      ),
      derive(
        'L₂ = log₁₀ b',
        'L2',
        ['b'],
        '{L2} = log₁₀ {b}',
        (v) => (v.b! > 0 ? log10(v.b!) : undefined),
        'log₁₀ {b}',
        'The common log of the base.',
      ),
      derive(
        'y = L₁ ÷ L₂',
        'y',
        ['L1', 'L2'],
        '{y} = {L1} ÷ {L2}',
        (v) => div(v.L1!, v.L2!),
        '{L1} ÷ {L2}',
        'Change of base: divide the two common logs.',
      ),
    ],
    example: { b: 3, x: 20, L1: log10(20), L2: log10(3), y: log10(20) / log10(3) },
    startWith: ['b', 'x'],
    pictureLabels: ['L1', 'L2'],
    representation: {
      kind: 'functionGraph',
      family: 'log',
      b: 'b',
      at: { x: 'x', y: 'y' },
      marks: ['zeros', 'asymptotes'],
    },
  }),
  page({
    id: 'm.11.logarithms~common-log',
    title: 'Common logs from scientific notation',
    use: 'Use this for “Find log 3,000 using log 3 ≈ 0.4771.”',
    assumptions: [
      'Write N as a × 10ⁿ with a from 1 up to 10.',
      'log(a × 10ⁿ) = n + log a: the exponent is the whole part, and log a, from 0 up to 1, is the rest.',
      'A number under 1 has a negative n, so its log is negative.',
    ],
    variables: [
      V('N', 'N', 'Number', { min: 0.001, max: 9.999e12, full: true }),
      V('a', 'a', 'Number from 1 up to 10', { min: 1, max: 9.999, step: 0.001 }),
      V('n', 'n', 'Power of ten', { min: -3, max: 12, step: 1, integer: true }),
      V('L', 'L', 'log₁₀ N', { min: -3, max: 13, step: 0.0001, derived: true }),
    ],
    rules: [
      rule(
        'N = a × 10^n',
        '{N} = {a} × 10^{n}',
        ['N', 'a', 'n'],
        (v) => log10(v.N!) - log10(v.a!) - v.n!,
        {
          N: [
            (v) => exact(v.a! * 10 ** v.n!),
            '{a} × 10^{n}',
            'The number from 1 up to 10 times the power of ten.',
          ],
          a: [
            (v) => exact(v.N! / 10 ** v.n!),
            '{N} ÷ 10^{n}',
            'Divide by the power of ten to leave one digit, not 0, before the point.',
          ],
          n: [() => undefined],
        },
      ),
      rule(
        'n from N',
        '{n} = exponent of the power of ten at or below {N}',
        ['n', 'N'],
        (v) => v.n! - Math.floor(log10(v.N!) + 1e-9),
        {
          n: [
            (v) => (v.N! > 0 ? Math.floor(log10(v.N!) + 1e-9) : undefined),
            'exponent of the power of ten at or below {N}',
            'How many places the point moves: the whole part of the log.',
          ],
          N: [() => undefined],
        },
      ),
      derive(
        'L = n + log a',
        'L',
        ['n', 'a'],
        '{L} = {n} + log₁₀ {a}',
        (v) => v.n! + log10(v.a!),
        '{n} + log₁₀ {a}',
        'The log of a product is the sum of the logs, and log₁₀ 10ⁿ = n.',
      ),
    ],
    example: { N: 3000, a: 3, n: 3, L: 3 + log10(3) },
    startWith: ['N'],
    representation: {
      kind: 'powerScale',
      number: 'N',
      mantissa: 'a',
      exponent: 'n',
      log: 'L',
      fixed: true,
    },
  }),

  // ── Exponential and log equations, e and continuous growth (F-LE.4, A-SSE.3c) ──
  page({
    id: 'm.11.exp-log-equations',
    assumptions: [
      'Divide by a first, then take the log of both sides: x log b = log(c ÷ a).',
      'Any base works for the logs, if both sides use the same one.',
      'bˣ is always positive, so c ÷ a must be positive for a solution.',
    ],
    variables: [
      V('a', 'a', 'Starting value', { min: -1000, max: 1000, step: 0.5 }),
      V('b', 'b', 'Base', { min: 0.1, max: 20, step: 0.01 }),
      V('c', 'c', 'Target value', { min: -1e6, max: 1e6, step: 0.5 }),
      V('x', 'x', 'Solution', { min: -1000, max: 1000, step: 0.001, derived: true }),
    ],
    rules: [
      limit(
        'a ≠ 0',
        '{a} is not 0',
        ['a'],
        (v) => v.a !== 0,
        'With a = 0 the left side is always 0.',
      ),
      limit('b ≠ 1', 'The base {b} is not 1', ['b'], (v) => v.b !== 1, BASE_NOT_1),
      rule(
        'a × b^x = c',
        '{a} × {b}^{x} = {c}',
        ['a', 'b', 'x', 'c'],
        (v) => v.a! * v.b! ** v.x! - v.c!,
        {
          x: [
            (v) =>
              v.b === 1 || !((div(v.c!, v.a!) ?? 0) > 0)
                ? undefined
                : fin(log10(v.c! / v.a!) / log10(v.b!)),
            'log₁₀({c} ÷ {a}) ÷ log₁₀ {b}',
            'Divide by a, take the log of both sides, then divide by log b.',
          ],
          c: [() => undefined],
          a: [() => undefined],
          b: [() => undefined],
        },
        {
          message: (v) =>
            v.a !== undefined && v.c !== undefined && v.a !== 0 && v.c / v.a <= 0
              ? 'bˣ is always positive, so a × bˣ has the sign of a: no x makes it c.'
              : undefined,
          work: {
            x: (v) => {
              const q = v.c! / v.a!;
              return [
                `${fmt(v.b!)}ˣ = ${fmt(q)}`,
                `x = log₁₀ ${fmt(q)} ÷ log₁₀ ${fmt(v.b!)}`,
                `x = ${fmt(log10(q))} ÷ ${par(log10(v.b!))}`,
              ];
            },
          },
        },
      ),
    ],
    example: { a: 5, b: 2, c: 60, x: log10(12) / log10(2) },
    startWith: ['a', 'b', 'c'],
    equation: '{a} × {b}^x = {c}',
    representation: {
      kind: 'functionGraph',
      family: 'exponential',
      a: 'a',
      b: 'b',
      other: { family: 'linear', m: 0, b: 'c' },
      crossing: { x: 'x', y: 'c' },
      marks: ['asymptotes'],
    },
  }),
  page({
    id: 'm.11.exp-log-equations~same-base',
    title: 'Powers of the same base',
    use: 'Use this for “Solve 4⁶ = 8ˣ” by writing both sides as powers of 2.',
    assumptions: [
      'Write both sides as powers of one base g: 4 = 2² and 8 = 2³.',
      'A power of a power multiplies the exponents: (gᵖ)ᵐ = gᵖᵐ.',
      'Equal powers of the same base have equal exponents, so p × m = q × x.',
    ],
    variables: [
      W('g', 'g', 'Common base', 2, 10),
      W('p', 'p', 'Power of g on the left', 1, 6),
      W('q', 'q', 'Power of g on the right', 1, 6),
      W('m', 'm', 'Exponent on the left', -20, 20),
      V('B1', 'B₁', 'Left base', { integer: true, min: 2, max: 1e6, derived: true }),
      V('B2', 'B₂', 'Right base', { integer: true, min: 2, max: 1e6, derived: true }),
      V('x', 'x', 'Exponent on the right', { min: -200, max: 200, fraction: 12 }),
    ],
    rules: [
      limit(
        'm ≠ 0',
        '{m} is not 0',
        ['m'],
        (v) => v.m !== 0,
        'A power 0 makes the left side 1, and then x is 0.',
      ),
      derive(
        'B1 = g^p',
        'B1',
        ['g', 'p'],
        '{B1} = {g}^{p}',
        (v) => v.g! ** v.p!,
        '{g}^{p}',
        'The left base as a power of g.',
      ),
      derive(
        'B2 = g^q',
        'B2',
        ['g', 'q'],
        '{B2} = {g}^{q}',
        (v) => v.g! ** v.q!,
        '{g}^{q}',
        'The right base as a power of g.',
      ),
      rule(
        'q × x = p × m',
        '{q} × {x} = {p} × {m}',
        ['q', 'x', 'p', 'm'],
        (v) => v.q! * v.x! - v.p! * v.m!,
        {
          x: [
            (v) => fin(div(v.p! * v.m!, v.q!)),
            '{p} × {m} ÷ {q}',
            'Both sides are powers of g, so the exponents p × m and q × x are equal.',
          ],
          m: [
            (v) => fin(div(v.q! * v.x!, v.p!)),
            '{q} × {x} ÷ {p}',
            'The exponents are equal: divide q × x by p.',
          ],
          p: [() => undefined],
          q: [() => undefined],
        },
        {
          work: {
            x: (v) => [
              ...(v.g === undefined
                ? []
                : [
                    `(${pw(v.g, v.p!)})${sup(v.m!)} = (${pw(v.g, v.q!)})ˣ`,
                    `${pw(v.g, v.p! * v.m!)} = ${fmt(v.g)}${v.q === 1 ? '' : sup(v.q!)}ˣ`,
                  ]),
              `${v.q === 1 ? '' : fmt(v.q!)}x = ${fmt(v.p! * v.m!)}`,
            ],
          },
        },
      ),
    ],
    example: { g: 2, p: 2, q: 3, m: 6, B1: 4, B2: 8, x: 4 },
    startWith: ['g', 'p', 'q', 'm'],
    equation: '({g}^{p})^{m} = ({g}^{q})^{x}',
    pictureLabels: ['m', 'x'],
    representation: {
      kind: 'termsChart',
      type: 'geometric',
      first: 'g',
      step: 'g',
      count: 'q',
      term: 'B2',
      lit: 'p',
      litTerm: 'B1',
      powers: true,
    },
  }),
  page({
    id: 'm.11.exp-log-equations~continuous',
    title: 'Continuous growth',
    use: 'Use this for “$2,000 grows at 5% a year compounded continuously. How long until it reaches $3,000?”',
    assumptions: [
      'e ≈ 2.71828 is what compounding more and more often approaches.',
      'The rate r is a decimal: 5% is 0.05.',
      'To find t, divide by P and take ln of both sides: rt = ln(A ÷ P).',
    ],
    variables: [
      V('P', 'P', 'Starting amount', { unit: '$', min: 1, max: 1e6, step: 0.01 }),
      V('r', 'r', 'Rate per year', { min: 0.001, max: 1, step: 0.001 }),
      V('t', 't', 'Time (years)', { min: 0, max: 100, step: 0.01 }),
      V('A', 'A', 'Amount', { unit: '$', min: 1, max: 1e8, step: 0.01 }),
    ],
    rules: [
      rule(
        'A = P × e^(r × t)',
        '{A} = {P} × e^({r} × {t})',
        ['A', 'P', 'r', 't'],
        (v) => ln(v.A!) - ln(v.P!) - v.r! * v.t!,
        {
          A: [
            (v) => fin(v.P! * Math.exp(v.r! * v.t!)),
            '{P} × e^({r} × {t})',
            'Raise e to r × t, then multiply by the starting amount.',
          ],
          t: [
            (v) => fin(div(ln(v.A! / v.P!), v.r!)),
            'ln({A} ÷ {P}) ÷ {r}',
            'Divide by P, take ln of both sides, then divide by r.',
          ],
          P: [
            (v) => fin(v.A! / Math.exp(v.r! * v.t!)),
            '{A} ÷ e^({r} × {t})',
            'Divide the amount by the growth factor.',
          ],
          r: [
            (v) => fin(div(ln(v.A! / v.P!), v.t!)),
            'ln({A} ÷ {P}) ÷ {t}',
            'Divide by P, take ln of both sides, then divide by t.',
          ],
        },
        {
          work: {
            t: (v) => {
              const q = v.A! / v.P!;
              return [
                `e^(${fmt(v.r!)}t) = ${fmt(q)}`,
                `${fmt(v.r!)}t = ln ${fmt(q)}`,
                `t = ${fmt(ln(q))} ÷ ${fmt(v.r!)}`,
              ];
            },
          },
        },
      ),
    ],
    example: { P: 2000, r: 0.05, A: 3000, t: ln(1.5) / 0.05 },
    startWith: ['A', 'P', 'r'],
    equation: '{A} = {P}e^{{r}{t}}',
    representation: {
      kind: 'functionGraph',
      family: 'exponential',
      a: 'P',
      r: 'r',
      name: 'A',
      at: { x: 't', y: 'A' },
      axes: { x: 'Time t (years)', y: 'Amount A ($)' },
      xMin: 0,
      marks: ['intercept'],
    },
  }),
  page({
    id: 'm.11.exp-log-equations~log-equation',
    title: 'Solve a log equation',
    use: 'Use this for “Solve log₃(2x − 1) = 4.”',
    assumptions: [
      'Rewrite log_b(u) = y as u = bʸ, with u = ax + c: the log is an exponent.',
      'Then solve ax + c = bʸ for x.',
      'Check: ax + c must be positive, and it is, since bʸ is.',
    ],
    variables: [
      V('b', 'b', 'Base', { min: 0.1, max: 20, step: 0.01 }),
      V('a', 'a', 'Coefficient of x', { min: -100, max: 100, step: 1 }),
      V('c', 'c', 'Constant', { min: -1000, max: 1000, step: 1 }),
      V('y', 'y', 'Value of the log', { min: -10, max: 10, step: 0.5 }),
      V('u', 'u', 'Inside of the log, ax + c', { min: 1e-6, max: 1e12, derived: true }),
      V('x', 'x', 'Solution', { min: -1e13, max: 1e13, fraction: 12, derived: true }),
    ],
    rules: [
      limit('b ≠ 1', 'The base {b} is not 1', ['b'], (v) => v.b !== 1, BASE_NOT_1),
      limit(
        'a ≠ 0',
        '{a} is not 0',
        ['a'],
        (v) => v.a !== 0,
        'With a = 0 there is no x to solve for.',
      ),
      limit(
        'bʸ ≥ 0.000001',
        '{b}^{y} is at least 0.000001',
        ['b', 'y'],
        (v) => v.b! ** v.y! >= 1e-6,
        'bʸ is below 0.000001, too close to 0 to show: use a y nearer 0.',
      ),
      derive(
        'u = b^y',
        'u',
        ['b', 'y'],
        '{u} = {b}^{y}',
        (v) => v.b! ** v.y!,
        '{b}^{y}',
        'log_b(u) = y means bʸ = u.',
      ),
      derive(
        'x = (u − c) ÷ a',
        'x',
        ['u', 'c', 'a'],
        '{x} = ({u} − {c}) ÷ {a}',
        (v) => div(v.u! - v.c!, v.a!),
        '({u} − {c}) ÷ {a}',
        'Solve ax + c = u: take away c, then divide by a.',
      ),
    ],
    example: { b: 3, a: 2, c: -1, y: 4, u: 81, x: 41 },
    startWith: ['b', 'a', 'c', 'y'],
    equation: 'log_{b}({a}x + {c}) = {y}',
    representation: {
      kind: 'functionGraph',
      family: 'log',
      b: 'b',
      input: 'u',
      other: { family: 'linear', m: 0, b: 'y' },
      crossing: { x: 'u', y: 'y' },
      marks: ['asymptotes'],
    },
  }),

  page({
    id: 'm.11.exp-log-equations~two-logs',
    title: 'Equations with two logs',
    use: 'Use this for “Solve log₃ x + log₃(x − 8) = 2.”',
    assumptions: [
      'The product rule joins the logs: log_b(x) + log_b(x + c) = log_b(x(x + c)).',
      'Then x(x + c) = bʸ, a quadratic: x² + cx − bʸ = 0.',
      'A log needs a positive number, so check each candidate in x and x + c.',
    ],
    variables: [
      V('b', 'b', 'Base', { min: 0.1, max: 20, step: 0.01 }),
      V('c', 'c', 'Constant in the second log', { min: -50, max: 50, step: 1 }),
      V('y', 'y', 'Value of the sum', { min: -10, max: 10, step: 0.5 }),
      V('u', 'u', 'The product x(x + c), bʸ', { min: 1e-6, max: 1e6, derived: true }),
      V('x1', 'x₁', 'Larger candidate, the solution', { min: -1e4, max: 1e4, derived: true }),
      V('x2', 'x₂', 'Smaller candidate', { min: -1e4, max: 1e4, derived: true }),
    ],
    rules: [
      limit('b ≠ 1', 'The base {b} is not 1', ['b'], (v) => v.b !== 1, BASE_NOT_1),
      derive(
        'u = b^y',
        'u',
        ['b', 'y'],
        '{u} = {b}^{y}',
        (v) => v.b! ** v.y!,
        '{b}^{y}',
        'Join the logs: log_b(x(x + c)) = y, so x(x + c) = bʸ.',
      ),
      limit(
        'u ≥ 0.000001',
        '{u} is at least 0.000001',
        ['u'],
        (v) => v.u === undefined || v.u >= 1e-6,
        'bʸ is too small to draw: take a larger y.',
      ),
      derive(
        'x₁ = (−c + √(c² + 4u)) ÷ 2',
        'x1',
        ['c', 'u'],
        '{x1} = (−{c} + √({c}² + 4 × {u})) ÷ 2',
        (v) => rootOf(1, v.c!, -v.u!, 1),
        '(−{c} + √({c}² + 4 × {u})) ÷ 2',
        'Multiply out x(x + c) = u and use the quadratic formula on x² + cx − u = 0.',
        {
          work: (v) => {
            const x = rootOf(1, v.c!, -v.u!, 1)!;
            return [
              `${poly([1, v.c!, -v.u!])} = 0`,
              ...quadWork(1, v.c!, -v.u!, 1).map((l) => `x₁ = ${l}`),
              `x = ${fmt(x)}: x and x + c are ${fmt(x)} and ${fmt(x + v.c!)}, both positive ✓`,
            ];
          },
        },
      ),
      derive(
        'x₂ = (−c − √(c² + 4u)) ÷ 2',
        'x2',
        ['c', 'u'],
        '{x2} = (−{c} − √({c}² + 4 × {u})) ÷ 2',
        (v) => rootOf(1, v.c!, -v.u!, -1),
        '(−{c} − √({c}² + 4 × {u})) ÷ 2',
        'The same formula with the minus sign. Its x and x + c are both negative, so it is extraneous.',
        {
          work: (v) => {
            const x = rootOf(1, v.c!, -v.u!, -1)!;
            const bad = x <= 0 ? `x = ${fmt(x)}` : `x + c = ${fmt(x + v.c!)}`;
            return [
              ...quadWork(1, v.c!, -v.u!, -1).map((l) => `x₂ = ${l}`),
              `${bad} is not positive, so its log has no value: reject x = ${fmt(x)}`,
            ];
          },
        },
      ),
    ],
    example: { b: 3, c: -8, y: 2, u: 9, x1: 9, x2: -1 },
    startWith: ['b', 'c', 'y'],
    equation: 'log_{b}(x) + log_{b}(x + {c}) = {y}',
    representation: {
      kind: 'functionGraph',
      family: 'logSum',
      b: 'b',
      c: 'c',
      other: { family: 'linear', m: 0, b: 'y' },
      crossing: { x: 'x1', y: 'y' },
      reject: 'x2',
      marks: ['asymptotes'],
    },
  }),

  // ── Series and sigma notation (A-SSE.4, F-BF.2) ──
  page({
    id: 'm.11.series',
    assumptions: [
      'Each term is the one before times the common ratio r.',
      'Multiply S by r and subtract: all but two terms cancel, leaving S(1 − r) = a₁(1 − rⁿ).',
      'For r = 1 every term is a₁, so S is just n × a₁.',
    ],
    variables: [
      V('a1', 'a₁', 'First term', { min: -100, max: 100, step: 0.5 }),
      V('r', 'r', 'Common ratio', { min: -5, max: 5, step: 0.05, fraction: 12 }),
      W('n', 'n', 'Number of terms', 1, 30),
      V('an', 'aₙ', 'Last term', { min: -1e25, max: 1e25, fraction: 12 }),
      V('S', 'Sₙ', 'Sum of the n terms', { min: -1e25, max: 1e25, fraction: 12, derived: true }),
    ],
    rules: [
      limit(
        'r ≠ 1',
        'The ratio {r} is not 1',
        ['r'],
        (v) => v.r !== 1,
        'With r = 1 the formula divides by 0; the sum is n × a₁.',
      ),
      rule(
        'aₙ = a₁ × r^(n − 1)',
        '{an} = {a1} × {r}^({n} − 1)',
        ['an', 'a1', 'r', 'n'],
        (v) => v.an! - v.a1! * v.r! ** (v.n! - 1),
        {
          an: [
            (v) => fin(v.a1! * v.r! ** (v.n! - 1)),
            '{a1} × {r}^({n} − 1)',
            'From the first term, multiply by r, n − 1 times.',
          ],
          n: [
            (v) => termCount(v.a1!, v.r!, v.an!),
            (v) =>
              v.r! > 0 && v.an! / v.a1! > 0
                ? '1 + log₁₀({an} ÷ {a1}) ÷ log₁₀ {r}'
                : '1 + log₁₀(|{an} ÷ {a1}|) ÷ log₁₀(|{r}|)',
            'aₙ ÷ a₁ = rⁿ⁻¹, so n − 1 is the power of r that makes aₙ ÷ a₁: take logs.',
          ],
          ...never('a1', 'r'),
        },
        {
          message: (v) =>
            v.an !== undefined &&
            v.a1 !== undefined &&
            v.r !== undefined &&
            termCount(v.a1, v.r, v.an) === undefined
              ? 'aₙ is not a term of this series: no whole number of steps of r reaches it.'
              : undefined,
          work: {
            an: (v) => [
              `aₙ = ${fmt(v.a1!)} × ${powOf(v.r!, v.n! - 1)}`,
              `aₙ = ${fmt(v.a1!)} × ${wrap(powValue(v.r!, v.n! - 1))}`,
            ],
          },
        },
      ),
      derive(
        'Sₙ = a₁ × (1 − rⁿ) ÷ (1 − r)',
        'S',
        ['a1', 'r', 'n'],
        '{S} = {a1} × (1 − {r}^{n}) ÷ (1 − {r})',
        (v) => div(v.a1! * (1 - v.r! ** v.n!), 1 - v.r!),
        '{a1} × (1 − {r}^{n}) ÷ (1 − {r})',
        'The sum of a geometric series: a₁ times (1 − rⁿ) over (1 − r).',
        { work: (v) => geometricSumWork(v.a1!, v.r!, v.n!) },
      ),
    ],
    example: { a1: 3, r: 2, n: 6, an: 96, S: 189 },
    startWith: ['n', 'a1', 'r'],
    sliders: true,
    equation: '{S} = {a1} × {1 − {r}^{n}}/{1 − {r}}',
    representation: {
      kind: 'termsChart',
      type: 'geometric',
      first: 'a1',
      step: 'r',
      count: 'n',
      sums: true,
      term: 'an',
      sum: 'S',
    },
  }),
  page({
    id: 'm.11.series~arithmetic',
    title: 'Arithmetic series',
    use: 'Use this for “Find the sum of the first 10 terms of 5, 9, 13, ….”',
    assumptions: [
      'The terms go up by the same common difference d each time.',
      'Pair the first and last terms, the second and second-to-last, and so on: each pair adds to a₁ + aₙ.',
      'n terms make n ÷ 2 pairs, so Sₙ = n(a₁ + aₙ) ÷ 2.',
    ],
    variables: [
      V('a1', 'a₁', 'First term', { min: -1000, max: 1000, step: 1 }),
      V('d', 'd', 'Common difference', { min: -100, max: 100, step: 0.5 }),
      W('n', 'n', 'Number of terms', 1, 30),
      V('an', 'aₙ', 'Last term', { min: -1e5, max: 1e5, step: 1 }),
      V('S', 'Sₙ', 'Sum of the n terms', { min: -1e7, max: 1e7, step: 1 }),
    ],
    rules: [
      rule(
        'aₙ = a₁ + (n − 1) × d',
        '{an} = {a1} + ({n} − 1) × {d}',
        ['an', 'a1', 'n', 'd'],
        (v) => v.an! - (v.a1! + (v.n! - 1) * v.d!),
        {
          an: [
            (v) => exact(v.a1! + (v.n! - 1) * v.d!),
            '{a1} + ({n} − 1) × {d}',
            'From the first term, n − 1 steps of d.',
          ],
          a1: [
            (v) => exact(v.an! - (v.n! - 1) * v.d!),
            '{an} − ({n} − 1) × {d}',
            'Go back n − 1 steps of d.',
          ],
          d: [
            (v) => fin(div(v.an! - v.a1!, v.n! - 1)),
            '({an} − {a1}) ÷ ({n} − 1)',
            'The rise from a₁ to aₙ, over n − 1 steps.',
          ],
          n: [() => undefined],
        },
      ),
      rule(
        'Sₙ = n × (a₁ + aₙ) ÷ 2',
        '{S} = {n} × ({a1} + {an}) ÷ 2',
        ['S', 'n', 'a1', 'an'],
        (v) => v.S! - (v.n! * (v.a1! + v.an!)) / 2,
        {
          S: [
            (v) => exact((v.n! * (v.a1! + v.an!)) / 2),
            '{n} × ({a1} + {an}) ÷ 2',
            'n ÷ 2 pairs, each adding to a₁ + aₙ.',
          ],
          an: [
            (v) => fin((div(2 * v.S!, v.n!) ?? NaN) - v.a1!),
            '2 × {S} ÷ {n} − {a1}',
            'Each pair adds to 2Sₙ ÷ n; take away a₁.',
          ],
          a1: [
            (v) => fin((div(2 * v.S!, v.n!) ?? NaN) - v.an!),
            '2 × {S} ÷ {n} − {an}',
            'Each pair adds to 2Sₙ ÷ n; take away aₙ.',
          ],
          n: [() => undefined],
        },
      ),
    ],
    example: { a1: 5, d: 4, n: 10, an: 41, S: 230 },
    startWith: ['a1', 'd', 'n'],
    sliders: true,
    representation: {
      kind: 'termsChart',
      type: 'arithmetic',
      first: 'a1',
      step: 'd',
      count: 'n',
      sums: true,
      term: 'an',
      sum: 'S',
    },
  }),
  page({
    id: 'm.11.series~sigma',
    title: 'Sigma notation',
    use: 'Use this for “Evaluate the sum from k = 1 to 8 of (3k − 1).”',
    assumptions: [
      'Σ from k = 1 to n of (ck + e) adds the terms for k = 1, 2, …, n.',
      'The terms go up by c each time, so the sum is an arithmetic series.',
      'Find the first and last terms, then Sₙ = n(a₁ + aₙ) ÷ 2.',
    ],
    variables: [
      V('c', 'c', 'Coefficient of k', { min: -100, max: 100, step: 0.5 }),
      V('e', 'e', 'Constant', { min: -1000, max: 1000, step: 0.5 }),
      W('n', 'n', 'Last value of k', 1, 30),
      V('a1', 'a₁', 'First term (k = 1)', { min: -2000, max: 2000, derived: true }),
      V('an', 'aₙ', 'Last term (k = n)', { min: -1e5, max: 1e5, derived: true }),
      V('S', 'S', 'Sum', { min: -1e7, max: 1e7, derived: true }),
    ],
    rules: [
      derive(
        'a₁ = c × 1 + e',
        'a1',
        ['c', 'e'],
        '{a1} = {c} × 1 + {e}',
        (v) => v.c! + v.e!,
        '{c} × 1 + {e}',
        // The sum to find, in Σ notation with the student's numbers, opens the steps.
        (v) =>
          `S = ${sigmaOf(v)} adds the terms for k = 1 to ${v.n === undefined ? 'n' : fmt(v.n)}. Put k = 1 into ck + e.`,
      ),
      derive(
        'aₙ = c × n + e',
        'an',
        ['c', 'n', 'e'],
        '{an} = {c} × {n} + {e}',
        (v) => v.c! * v.n! + v.e!,
        '{c} × {n} + {e}',
        'Put k = n into ck + e.',
      ),
      derive(
        'S = n × (a₁ + aₙ) ÷ 2',
        'S',
        ['n', 'a1', 'an'],
        '{S} = {n} × ({a1} + {an}) ÷ 2',
        (v) => (v.n! * (v.a1! + v.an!)) / 2,
        '{n} × ({a1} + {an}) ÷ 2',
        'n ÷ 2 pairs of first plus last, as in any arithmetic series.',
        // The check adds the terms one by one, as the Σ says.
        { check: (v) => `${sigmaOf(v)} = ${fmt(v.S!)}` },
      ),
    ],
    example: { c: 3, e: -1, n: 8, a1: 2, an: 23, S: 100 },
    startWith: ['c', 'e', 'n'],
    sliders: true,
    representation: {
      kind: 'termsChart',
      type: 'arithmetic',
      first: 'a1',
      step: 'c',
      count: 'n',
      sums: true,
      term: 'an',
      sum: 'S',
    },
  }),
  page({
    id: 'm.11.series~infinite',
    title: 'Infinite geometric series',
    use: 'Use this for “Find the sum of 12 + 3 + 3/4 + ….”',
    assumptions: [
      'With r between −1 and 1, rⁿ shrinks toward 0 as n grows.',
      'The partial sums Sₙ = a₁(1 − rⁿ) ÷ (1 − r) close in on S = a₁ ÷ (1 − r).',
      'With |r| ≥ 1 the terms do not shrink, and the sum has no limit.',
    ],
    variables: [
      V('a1', 'a₁', 'First term', { min: -100, max: 100, step: 0.5 }),
      V('r', 'r', 'Common ratio', { min: -5, max: 5, step: 0.05, fraction: 12 }),
      W('n', 'n', 'Terms added so far', 1, 30),
      V('Sn', 'Sₙ', 'Sum of the first n terms', {
        min: -1e5,
        max: 1e5,
        fraction: 12,
        derived: true,
      }),
      V('S', 'S', 'Sum of the series', { min: -1e5, max: 1e5, fraction: 12, derived: true }),
    ],
    rules: [
      limit(
        '|r| < 1',
        '{r} is between −1 and 1',
        ['r'],
        (v) => Math.abs(v.r!) < 1,
        'With |r| ≥ 1 the terms do not shrink, so the sums grow without end.',
      ),
      derive(
        'Sₙ = a₁ × (1 − rⁿ) ÷ (1 − r)',
        'Sn',
        ['a1', 'r', 'n'],
        '{Sn} = {a1} × (1 − {r}^{n}) ÷ (1 − {r})',
        (v) => div(v.a1! * (1 - v.r! ** v.n!), 1 - v.r!),
        '{a1} × (1 − {r}^{n}) ÷ (1 − {r})',
        'The first n terms of the geometric series.',
        { work: (v) => geometricSumWork(v.a1!, v.r!, v.n!) },
      ),
      derive(
        'S = a₁ ÷ (1 − r)',
        'S',
        ['a1', 'r'],
        '{S} = {a1} ÷ (1 − {r})',
        (v) => div(v.a1!, 1 - v.r!),
        '{a1} ÷ (1 − {r})',
        'As n grows, rⁿ goes to 0, leaving a₁ ÷ (1 − r).',
      ),
    ],
    example: { a1: 12, r: 0.25, n: 6, Sn: (12 * (1 - 0.25 ** 6)) / 0.75, S: 16 },
    startWith: ['a1', 'r', 'n'],
    sliders: true,
    representation: {
      kind: 'termsChart',
      type: 'geometric',
      first: 'a1',
      step: 'r',
      count: 'n',
      sums: true,
      limit: 'S',
      sum: 'Sn',
    },
  }),

  // ── Parent functions and transformations (F-BF.3, F-IF.7) ──
  page({
    id: 'm.11.function-transformations',
    assumptions: [
      'Here f(x) = |x|, the dashed parent; h moves the graph right when h is positive, because x − h = 0 at x = h.',
      'k moves it up; a stretches it by a factor of |a| and flips it over the x-axis when a is negative.',
      'The parent’s vertex (0, 0) lands at (h, k).',
    ],
    variables: [
      V('a', 'a', 'Vertical factor', { allowed: STRETCH, min: -4, max: 4 }),
      V('h', 'h', 'Shift right', { min: -10, max: 10, step: 0.5 }),
      V('k', 'k', 'Shift up', { min: -10, max: 10, step: 0.5 }),
      V('x', 'x', 'Input', { min: -20, max: 20, step: 0.5 }),
      V('y', 'y', 'Output', { min: -200, max: 200, derived: true }),
    ],
    rules: [
      derive(
        'y = a|x − h| + k',
        'y',
        ['a', 'x', 'h', 'k'],
        '{y} = {a} × |{x} − {h}| + {k}',
        (v) => v.a! * Math.abs(v.x! - v.h!) + v.k!,
        '{a} × |{x} − {h}| + {k}',
        'Shift x by h, take the absolute value, stretch by a, then shift up by k.',
        {
          work: (v) => {
            const d = Math.abs(v.x! - v.h!);
            return [
              `y = ${fmt(v.a!)} × ${fmt(d)} + ${par(v.k!)}`,
              `y = ${fmt(v.a! * d)} + ${par(v.k!)}`,
            ];
          },
        },
      ),
    ],
    example: { a: 2, h: 3, k: -1, x: 5, y: 3 },
    startWith: ['a', 'h', 'k', 'x'],
    equation: 'y = {a}f(x − {h}) + {k}',
    representation: {
      kind: 'functionGraph',
      family: 'absolute',
      a: 'a',
      h: 'h',
      k: 'k',
      parent: true,
      at: { x: 'x', y: 'y' },
      marks: ['vertex'],
    },
  }),
  page({
    id: 'm.11.function-transformations~point',
    title: 'Where a point goes',
    use: 'Use this for “(2, 4) is on y = 2ˣ. Where is it on y = −3 × 2^(x + 1) + 5?”',
    assumptions: [
      'Horizontal moves change x only: the point (p, 2ᵖ) moves to x = p + h.',
      'Vertical moves change y only: the y-value is stretched by a, then moved up k.',
      'The asymptote y = 0 moves to y = k.',
    ],
    variables: [
      V('p', 'p', 'x on the parent', { min: -2, max: 4, step: 0.5 }),
      V('q', 'q', 'y on the parent, 2ᵖ', { min: 0, max: 16, derived: true }),
      V('a', 'a', 'Vertical factor', { allowed: STRETCH, min: -4, max: 4 }),
      V('h', 'h', 'Shift right', { min: -10, max: 10, step: 0.5 }),
      V('k', 'k', 'Shift up', { min: -10, max: 10, step: 0.5 }),
      V('X', 'X', 'x of the moved point', { min: -20, max: 20, derived: true }),
      V('Y', 'Y', 'y of the moved point', { min: -100, max: 100, derived: true }),
    ],
    rules: [
      derive(
        'q = 2^p',
        'q',
        ['p'],
        '{q} = 2^{p}',
        (v) => 2 ** v.p!,
        '2^{p}',
        'The point on the parent y = 2ˣ.',
      ),
      derive(
        'X = p + h',
        'X',
        ['p', 'h'],
        '{X} = {p} + {h}',
        (v) => v.p! + v.h!,
        '{p} + {h}',
        'The shift right moves the x of every point by h.',
      ),
      derive(
        'Y = a × q + k',
        'Y',
        ['a', 'q', 'k'],
        '{Y} = {a} × {q} + {k}',
        (v) => v.a! * v.q! + v.k!,
        '{a} × {q} + {k}',
        'Stretch the y by a, then move it up by k.',
      ),
    ],
    example: { p: 2, q: 4, a: -3, h: -1, k: 5, X: 1, Y: -7 },
    startWith: ['p', 'a', 'h', 'k'],
    pictureLabels: ['p', 'q'],
    representation: {
      kind: 'functionGraph',
      family: 'exponential',
      a: 'a',
      b: 2,
      h: 'h',
      k: 'k',
      parent: true,
      at: { x: 'X', y: 'Y' },
      marks: ['asymptotes'],
      // The key point's drag sets the shifts h and k; the point on the parent stays put.
      keep: ['p', 'a', 'h', 'k'],
    },
  }),
  page({
    id: 'm.11.function-transformations~horizontal',
    title: 'Horizontal stretch and flip',
    use: 'Use this for “(4, 2) is on y = √x. Where is it on y = √(2x)? On y = √(−x)?”',
    assumptions: [
      'Here f(x) = √x, dashed. A number b inside, f(b(x − h)), acts on x: the graph is squeezed toward x = h by 1/b.',
      'A b between −1 and 1 stretches the graph instead, and a negative b also flips it across x = h.',
      'The parent’s point (p, √p) lands at (h + p ÷ b, √p): only x changes.',
    ],
    variables: [
      V('b', 'b', 'Horizontal factor', {
        allowed: [-3, -2, -1, -0.5, 0.5, 2, 3],
        min: -3,
        max: 3,
      }),
      V('h', 'h', 'Shift right', { min: -10, max: 10, step: 0.5 }),
      V('p', 'p', 'x on the parent', { min: 0, max: 25, step: 0.5 }),
      V('Y', 'Y', 'y of the point, √p', { min: 0, max: 5, derived: true }),
      V('X', 'X', 'x of the moved point', {
        min: -60,
        max: 60,
        derived: true,
        fraction: 12,
        improper: true,
      }),
    ],
    rules: [
      derive(
        'Y = √p',
        'Y',
        ['p'],
        '{Y} = √{p}',
        (v) => Math.sqrt(v.p!),
        '√{p}',
        'The point on the parent is (p, √p); a change inside the root leaves y alone.',
      ),
      derive(
        'X = h + p ÷ b',
        'X',
        ['h', 'p', 'b'],
        '{X} = {h} + {p} ÷ {b}',
        (v) => (v.b ? v.h! + v.p! / v.b! : undefined),
        '{h} + {p} ÷ {b}',
        'The new graph reads the root of b(X − h), which must be p: so X − h = p ÷ b.',
      ),
    ],
    example: { b: 2, h: 0, p: 4, Y: 2, X: 2 },
    startWith: ['b', 'h', 'p'],
    equation: 'y = √({b}(x − {h}))',
    representation: {
      kind: 'functionGraph',
      family: 'root',
      index: 2,
      h: 'h',
      horizontal: 'b',
      parent: true,
      input: 'x',
      at: { x: 'X', y: 'Y' },
    },
  }),

  // ── Complex numbers (N-CN.1–N-CN.3, N-CN.7) ──
  page({
    id: 'm.11.complex-numbers',
    assumptions: [
      'i² = −1, so the i × i term moves to the real part with its sign changed.',
      'Multiply every term by every term, as with two binomials.',
      'On the plane the lengths multiply and the angles add.',
    ],
    variables: [
      V('a', 'a', 'Real part of the first', { integer: true, min: -10, max: 10 }),
      V('b', 'b', 'Imaginary part of the first', { integer: true, min: -10, max: 10 }),
      V('c', 'c', 'Real part of the second', { integer: true, min: -10, max: 10 }),
      V('d', 'd', 'Imaginary part of the second', { integer: true, min: -10, max: 10 }),
      V('p', 'p', 'Real part of the product', {
        integer: true,
        min: -200,
        max: 200,
        derived: true,
      }),
      V('q', 'q', 'Imaginary part of the product', {
        integer: true,
        min: -200,
        max: 200,
        derived: true,
      }),
    ],
    rules: [
      derive(
        'p = ac − bd',
        'p',
        ['a', 'c', 'b', 'd'],
        '{p} = {a} × {c} − {b} × {d}',
        (v) => v.a! * v.c! - v.b! * v.d!,
        '{a} × {c} − {b} × {d}',
        'The real part: a × c, and bi × di = bd × i², which is −bd.',
        {
          work: (v) => {
            const [a, b, c, d] = [v.a!, v.b!, v.c!, v.d!];
            return [
              `(${cx(a, b)})(${cx(c, d)}) = ${terms([
                [a * c, ''],
                [a * d, 'i'],
                [b * c, 'i'],
                [b * d, 'i²'],
              ])}`,
              `= ${terms([
                [a * c, ''],
                [a * d + b * c, 'i'],
                [-b * d, ''],
              ])}`,
              `p = ${fmt(a * c)} + ${par(-b * d)}`,
            ];
          },
        },
      ),
      derive(
        'q = ad + bc',
        'q',
        ['a', 'd', 'b', 'c'],
        '{q} = {a} × {d} + {b} × {c}',
        (v) => v.a! * v.d! + v.b! * v.c!,
        '{a} × {d} + {b} × {c}',
        'The imaginary part: a × di and bi × c, the two outer and inner terms.',
        {
          work: (v) => [
            `q = ${fmt(v.a! * v.d!)} + ${par(v.b! * v.c!)}`,
            `(${cx(v.a!, v.b!)})(${cx(v.c!, v.d!)}) = ${cx(
              v.a! * v.c! - v.b! * v.d!,
              v.a! * v.d! + v.b! * v.c!,
            )}`,
          ],
        },
      ),
    ],
    example: { a: 2, b: 3, c: 1, d: -4, p: 14, q: -5 },
    startWith: ['a', 'b', 'c', 'd'],
    equation: '({a} + {b}i)({c} + {d}i) = {p} + {q}i',
    representation: {
      kind: 'complexPlane',
      z: { re: 'a', im: 'b' },
      w: { re: 'c', im: 'd' },
      op: 'product',
      result: { re: 'p', im: 'q' },
    },
  }),
  page({
    id: 'm.11.complex-numbers~add-subtract',
    title: 'Add or subtract complex numbers',
    use: 'Use this for “(4 − 2i) − (−1 + 5i)”.',
    assumptions: [
      'Combine real parts with real parts and imaginary parts with imaginary parts.',
      'Subtracting c + di is adding its opposite, −c − di: the picture draws that opposite and adds it.',
      'On the plane, adding is joining the arrows end to end.',
    ],
    variables: [
      V('a', 'a', 'Real part of the first', { integer: true, min: -10, max: 10 }),
      V('b', 'b', 'Imaginary part of the first', { integer: true, min: -10, max: 10 }),
      V('sg', 's', 'Add (1) or subtract (2)', { allowed: [1, 2], min: 1, max: 2, integer: true }),
      V('c', 'c', 'Real part of the second', { integer: true, min: -10, max: 10 }),
      V('d', 'd', 'Imaginary part of the second', { integer: true, min: -10, max: 10 }),
      V('C', 'C', 'Real part added', { integer: true, min: -10, max: 10, derived: true }),
      V('D', 'D', 'Imaginary part added', { integer: true, min: -10, max: 10, derived: true }),
      V('p', 'p', 'Real part of the answer', { integer: true, min: -20, max: 20, derived: true }),
      V('q', 'q', 'Imaginary part of the answer', {
        integer: true,
        min: -20,
        max: 20,
        derived: true,
      }),
    ],
    rules: [
      derive(
        'C = ±c',
        'C',
        ['sg', 'c'],
        '{C} = {c} × (1 or −1, as {sg} says)',
        // 1 for +, −1 for − (s is 1 or 2): one smooth rule, so the search reads it right.
        (v) => v.c! * (3 - 2 * v.sg!),
        (v) => (v.sg === 2 ? '−1 × {c}' : '{c}'),
        (v) =>
          v.sg === 2
            ? 'Subtracting: change the sign of the second real part.'
            : 'Adding: the second real part as it is.',
        {
          check: (v) =>
            v.sg === 2 ? `${fmt(v.C!)} = −1 × ${par(v.c!)}` : `${fmt(v.C!)} = ${fmt(v.c!)}`,
        },
      ),
      derive(
        'D = ±d',
        'D',
        ['sg', 'd'],
        '{D} = {d} × (1 or −1, as {sg} says)',
        // 1 for +, −1 for − (s is 1 or 2): one smooth rule, so the search reads it right.
        (v) => v.d! * (3 - 2 * v.sg!),
        (v) => (v.sg === 2 ? '−1 × {d}' : '{d}'),
        (v) =>
          v.sg === 2
            ? 'Subtracting: change the sign of the second imaginary part.'
            : 'Adding: the second imaginary part as it is.',
        {
          check: (v) =>
            v.sg === 2 ? `${fmt(v.D!)} = −1 × ${par(v.d!)}` : `${fmt(v.D!)} = ${fmt(v.d!)}`,
        },
      ),
      derive(
        'p = a + C',
        'p',
        ['a', 'C'],
        '{p} = {a} + {C}',
        (v) => v.a! + v.C!,
        '{a} + {C}',
        'Real parts together.',
      ),
      derive(
        'q = b + D',
        'q',
        ['b', 'D'],
        '{q} = {b} + {D}',
        (v) => v.b! + v.D!,
        '{b} + {D}',
        'Imaginary parts together.',
        {
          work: (v) =>
            [v.a, v.c, v.d, v.sg].some((x) => x === undefined)
              ? []
              : [
                  `(${cx(v.a!, v.b!)}) ${v.sg === 2 ? '−' : '+'} (${cx(v.c!, v.d!)}) = ${cx(
                    v.a! + (3 - 2 * v.sg!) * v.c!,
                    v.b! + (3 - 2 * v.sg!) * v.d!,
                  )}`,
                ],
        },
      ),
    ],
    example: { a: 4, b: -2, sg: 2, c: -1, d: 5, C: 1, D: -5, p: 5, q: -7 },
    startWith: ['a', 'b', 'sg', 'c', 'd'],
    equation: '({a} + {b}i) {sg:op} ({c} + {d}i) = {p} + {q}i',
    representation: {
      kind: 'complexPlane',
      z: { re: 'a', im: 'b' },
      w: { re: 'c', im: 'd' },
      opFrom: 'sg',
      result: { re: 'p', im: 'q' },
    },
  }),
  page({
    id: 'm.11.complex-numbers~quadratic',
    title: 'Complex solutions of a quadratic',
    use: 'Use this for “Solve x² − 4x + 13 = 0.”',
    assumptions: [
      'When b² − 4ac is negative, the square root in the quadratic formula is imaginary: √(−36) = 6i.',
      'The two solutions are p + qi and p − qi, a conjugate pair.',
      'Check by putting p + qi back into the equation, with i² = −1.',
    ],
    variables: [
      V('a', 'a', 'Coefficient of x²', { integer: true, min: -20, max: 20 }),
      V('b', 'b', 'Coefficient of x', { integer: true, min: -20, max: 20 }),
      V('c', 'c', 'Constant', { integer: true, min: -20, max: 20 }),
      V('D', 'D', 'Discriminant b² − 4ac', { integer: true, min: -2000, max: -1, derived: true }),
      V('p', 'p', 'Real part', { min: -20, max: 20, fraction: 40, derived: true }),
      V('q', 'q', 'Imaginary part', {
        min: -20,
        max: 20,
        fraction: 40,
        derived: true,
        exact: true,
      }),
    ],
    rules: [
      limit(
        'a ≠ 0',
        '{a} is not 0',
        ['a'],
        (v) => v.a !== 0,
        'With a = 0 there is no x², so the equation is not a quadratic.',
      ),
      limit(
        'b² − 4ac < 0',
        '{b}² − 4 × {a} × {c} is negative',
        ['a', 'b', 'c'],
        (v) => v.b! ** 2 - 4 * v.a! * v.c! < 0,
        'b² − 4ac is 0 or more, so the solutions are real: use the quadratic formula page.',
      ),
      derive(
        'D = b² − 4ac',
        'D',
        ['b', 'a', 'c'],
        '{D} = {b}² − 4 × {a} × {c}',
        (v) => v.b! ** 2 - 4 * v.a! * v.c!,
        '{b}² − 4 × {a} × {c}',
        'The discriminant: negative means no real solutions.',
      ),
      derive(
        'p = −b ÷ (2a)',
        'p',
        ['b', 'a'],
        '{p} = −{b} ÷ (2 × {a})',
        (v) => div(-v.b!, 2 * v.a!),
        '−{b} ÷ (2 × {a})',
        'The real part of both solutions: the −b ÷ 2a of the formula.',
        { work: (v) => [`p = ${fmt(-v.b!)} ÷ ${par(2 * v.a!)}`] },
      ),
      derive(
        'q = √(−D) ÷ (2a)',
        'q',
        ['D', 'a'],
        '{q} = √(−1 × {D}) ÷ (2 × {a})',
        (v) => (v.D! < 0 ? div(Math.sqrt(-v.D!), 2 * v.a!) : undefined),
        '√(−1 × {D}) ÷ (2 × {a})',
        '√D = √(−D) × i, since √(−1) = i: this is the i part, taken plus and minus.',
        {
          work: (v) => {
            const [D, a2] = [-v.D!, 2 * v.a!];
            if (v.b === undefined) return [];
            const root = radical(D);
            // (i before the root: i√31, 6i√2, never i6√2)
            const iRoot =
              root === '1' ? 'i' : root.includes('√') ? root.replace('√', 'i√') : `${root}i`;
            // The pair written exactly: 2 ± 3i, −1/2 ± (√3/2)i.
            const pair = complexRoots(v.a!, v.b!, v.c ?? (v.b! ** 2 + D) / (4 * v.a!));
            return [
              `q = √${fmt(D)} ÷ ${par(a2)}`,
              // (a root that isn't whole is simplified, √72 = 6√2, and stays exact)
              ...(root === `√${D}`
                ? []
                : [`q = ${root.includes('√') ? root : fmt(Math.sqrt(D))} ÷ ${par(a2)}`]),
              ...(pair ? [`x = (${fmt(-v.b!)} ± ${iRoot}) ÷ ${par(a2)} = ${pair}`] : []),
            ];
          },
        },
      ),
    ],
    example: { a: 1, b: -4, c: 13, D: -36, p: 2, q: 3 },
    startWith: ['a', 'b', 'c'],
    equation: '{a}x² + {b}x + {c} = 0',
    representation: {
      kind: 'complexPlane',
      z: { re: 'p', im: 'q' },
      conjugate: true,
      fixed: true,
    },
  }),

  // ── Function operations, composition and inverses (F-BF.1b, F-BF.4) ──
  page({
    id: 'm.11.inverse-functions',
    assumptions: [
      'f(g(x)) puts g(x) wherever f has x: here f(x) = px² + qx + r and g(x) = mx + c.',
      'Work inside out: g first, then f.',
      'f(g(x)) and g(f(x)) are usually different.',
    ],
    variables: [
      V('p', 'p', 'x² coefficient of f', { min: -10, max: 10, step: 1 }),
      V('q', 'q', 'x coefficient of f', { min: -10, max: 10, step: 1 }),
      V('r', 'r', 'Constant of f', { min: -10, max: 10, step: 1 }),
      V('m', 'm', 'Slope of g', { min: -10, max: 10, step: 1 }),
      V('c', 'c', 'Constant of g', { min: -10, max: 10, step: 1 }),
      V('A', 'A', 'x² coefficient of f(g(x))', { min: -1000, max: 1000, derived: true }),
      V('B', 'B', 'x coefficient of f(g(x))', { min: -3000, max: 3000, derived: true }),
      V('C', 'C', 'Constant of f(g(x))', { min: -2000, max: 2000, derived: true }),
      V('x', 'x', 'Input', { min: -20, max: 20, step: 0.5 }),
      V('y', 'y', 'f(g(x))', { min: -1e6, max: 1e6, derived: true }),
    ],
    rules: [
      limit(
        'm ≠ 0',
        '{m} is not 0',
        ['m'],
        (v) => v.m !== 0,
        'With m = 0, g is a constant and f(g(x)) is flat.',
      ),
      derive(
        'A = p × m²',
        'A',
        ['p', 'm'],
        '{A} = {p} × {m}²',
        (v) => v.p! * v.m! ** 2,
        '{p} × {m}²',
        'p(mx + c)² starts with p × m²x².',
        {
          work: (v) => {
            if ([v.q, v.r, v.c].some((x) => x === undefined)) return [];
            const g = `(${poly([v.m!, v.c!])})`;
            return [
              `f(${poly([v.m!, v.c!])}) = ${terms([
                [v.p!, `${g}²`],
                [v.q!, g],
                [v.r!, ''],
              ])}`,
            ];
          },
        },
      ),
      derive(
        'B = 2pmc + qm',
        'B',
        ['p', 'm', 'c', 'q'],
        '{B} = 2 × {p} × {m} × {c} + {q} × {m}',
        (v) => 2 * v.p! * v.m! * v.c! + v.q! * v.m!,
        '2 × {p} × {m} × {c} + {q} × {m}',
        'The x terms: 2mc x from the square, times p, and q × mx.',
      ),
      derive(
        'C = pc² + qc + r',
        'C',
        ['p', 'c', 'q', 'r'],
        '{C} = {p} × {c}² + {q} × {c} + {r}',
        (v) => v.p! * v.c! ** 2 + v.q! * v.c! + v.r!,
        '{p} × {c}² + {q} × {c} + {r}',
        'The constants: f(c), since g(0) = c.',
        {
          work: (v) => {
            const [p, q, r, m, c] = [v.p!, v.q!, v.r!, v.m, v.c!];
            return [
              `C = ${fmt(p * c ** 2)} + ${par(q * c)} + ${par(r)}`,
              ...(m === undefined
                ? []
                : [
                    `f(g(x)) = ${poly([p * m ** 2, 2 * p * m * c + q * m, p * c ** 2 + q * c + r])}`,
                  ]),
            ];
          },
        },
      ),
      derive(
        'y = Ax² + Bx + C',
        'y',
        ['A', 'x', 'B', 'C'],
        '{y} = {A} × {x}² + {B} × {x} + {C}',
        (v) => v.A! * v.x! ** 2 + v.B! * v.x! + v.C!,
        '{A} × {x}² + {B} × {x} + {C}',
        'Evaluate the combined function at x.',
      ),
    ],
    example: { p: 1, q: -3, r: 0, m: 2, c: 1, A: 4, B: -2, C: -2, x: 1, y: 0 },
    startWith: ['p', 'q', 'r', 'm', 'c', 'x'],
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'standard',
      a: 'A',
      b: 'B',
      c: 'C',
      at: { x: 'x', y: 'y' },
    },
  }),
  page({
    id: 'm.11.inverse-functions~operations',
    title: 'Add, subtract, multiply and divide functions',
    use: 'Use this for “f(x) = 2x − 1 and g(x) = x + 4. Find (f + g)(3), (f − g)(3), (f · g)(3) and (f ÷ g)(3).”',
    assumptions: [
      '(f + g)(x) = f(x) + g(x): find each function’s value at x, then add.',
      'Subtract, multiply or divide the same way: (f − g)(x) = f(x) − g(x), and so on.',
      'f ÷ g has no value where g(x) = 0: those x are left out of its domain.',
    ],
    variables: [
      V('a', 'a', 'Slope of f', { min: -10, max: 10, step: 0.5 }),
      V('b', 'b', 'Intercept of f', { min: -10, max: 10, step: 0.5 }),
      V('c', 'c', 'Slope of g', { min: -10, max: 10, step: 0.5 }),
      V('d', 'd', 'Intercept of g', { min: -10, max: 10, step: 0.5 }),
      V('x', 'x', 'Input', { min: -20, max: 20, step: 0.5 }),
      V('F', 'F', 'Value of f, f(x)', { min: -300, max: 300, derived: true }),
      V('G', 'G', 'Value of g, g(x)', { min: -300, max: 300, derived: true }),
      V('S', 'S', 'Sum, (f + g)(x)', { min: -600, max: 600, derived: true }),
      V('Df', 'D', 'Difference, (f − g)(x)', { min: -600, max: 600, derived: true }),
      V('P', 'P', 'Product, (f · g)(x)', { min: -1e5, max: 1e5, derived: true }),
      V('Q', 'Q', 'Quotient, (f ÷ g)(x)', { min: -1e5, max: 1e5, fraction: 12, derived: true }),
    ],
    rules: [
      limit(
        'g(x) ≠ 0',
        '{G} is not 0',
        ['G'],
        (v) => Math.abs(v.G!) > 1e-9,
        'g(x) = 0 here, so (f ÷ g)(x) has no value: this x is outside the domain of f ÷ g.',
      ),
      derive(
        'f(x) = ax + b',
        'F',
        ['a', 'x', 'b'],
        '{F} = {a} × {x} + {b}',
        (v) => v.a! * v.x! + v.b!,
        '{a} × {x} + {b}',
        'Put x into f.',
      ),
      derive(
        'g(x) = cx + d',
        'G',
        ['c', 'x', 'd'],
        '{G} = {c} × {x} + {d}',
        (v) => v.c! * v.x! + v.d!,
        '{c} × {x} + {d}',
        'Put x into g.',
      ),
      derive(
        '(f + g)(x) = f(x) + g(x)',
        'S',
        ['F', 'G'],
        '{S} = {F} + {G}',
        (v) => v.F! + v.G!,
        '{F} + {G}',
        'Add the two values at x.',
      ),
      derive(
        '(f − g)(x) = f(x) − g(x)',
        'Df',
        ['F', 'G'],
        '{Df} = {F} − {G}',
        (v) => v.F! - v.G!,
        '{F} − {G}',
        'Take g’s value from f’s.',
      ),
      derive(
        '(f · g)(x) = f(x) × g(x)',
        'P',
        ['F', 'G'],
        '{P} = {F} × {G}',
        (v) => v.F! * v.G!,
        '{F} × {G}',
        'Multiply the two values at x.',
      ),
      derive(
        '(f ÷ g)(x) = f(x) ÷ g(x)',
        'Q',
        ['F', 'G'],
        '{Q} = {F} ÷ {G}',
        (v) => div(v.F!, v.G!),
        '{F} ÷ {G}',
        'Divide f’s value by g’s.',
      ),
    ],
    example: { a: 2, b: -1, c: 1, d: 4, x: 3, F: 5, G: 7, S: 12, Df: -2, P: 35, Q: 5 / 7 },
    startWith: ['a', 'b', 'c', 'd', 'x'],
    pictureLabels: ['S', 'Df', 'P', 'Q'],
    representation: {
      kind: 'functionGraph',
      family: 'linear',
      m: 'a',
      b: 'b',
      other: { family: 'linear', m: 'c', b: 'd', name: 'g' },
      at: { x: 'x', y: 'F' },
    },
  }),
  page({
    id: 'm.11.inverse-functions~inverse',
    title: 'The inverse of a linear function',
    use: 'Use this for “Find f⁻¹(x) for f(x) = 3x − 6, and check f⁻¹(f(x)) = x.”',
    assumptions: [
      'Swap x and y in y = ax + b, then solve for y: f⁻¹(x) = (x − b) ÷ a = mx + n.',
      '(x, y) on f is (y, x) on f⁻¹: the two graphs are reflections over y = x.',
      'a is not 0, or f is flat and has no inverse.',
    ],
    variables: [
      V('a', 'a', 'Slope of f', { min: -10, max: 10, step: 0.5 }),
      V('b', 'b', 'Intercept of f', { min: -20, max: 20, step: 0.5 }),
      V('m', 'm', 'Slope of f⁻¹', { min: -100, max: 100, fraction: 20, derived: true }),
      V('n', 'n', 'Intercept of f⁻¹', { min: -1000, max: 1000, fraction: 20, derived: true }),
      V('x', 'x', 'Input of f', { min: -20, max: 20, step: 0.5 }),
      V('y', 'y', 'f(x), the input of f⁻¹', { min: -500, max: 500, step: 0.5 }),
      V('X', 'X', 'Back to x, f⁻¹(y)', { min: -1000, max: 1000, fraction: 20, derived: true }),
    ],
    rules: [
      limit(
        'a ≠ 0',
        '{a} is not 0',
        ['a'],
        (v) => v.a !== 0,
        'A flat line takes every x to the same y, so no inverse can undo it.',
      ),
      rule(
        'y = ax + b',
        '{y} = {a} × {x} + {b}',
        ['y', 'a', 'x', 'b'],
        (v) => v.y! - (v.a! * v.x! + v.b!),
        {
          y: [(v) => exact(v.a! * v.x! + v.b!), '{a} × {x} + {b}', 'Put x into f.'],
          x: [
            (v) => fin(div(v.y! - v.b!, v.a!)),
            '({y} − {b}) ÷ {a}',
            'The inverse at y: take away b, then divide by a.',
          ],
          b: [(v) => exact(v.y! - v.a! * v.x!), '{y} − {a} × {x}', 'Take a × x away from y.'],
          a: [() => undefined],
        },
      ),
      derive(
        'm = 1 ÷ a',
        'm',
        ['a'],
        '{m} = 1 ÷ {a}',
        (v) => div(1, v.a!),
        '1 ÷ {a}',
        'Swap x and y, then solve x = ay + b for y: take away b, then divide by a.',
        {
          work: (v) => {
            if (v.b === undefined) return [];
            const [a, b] = [v.a!, v.b];
            const left = terms([
              [1, 'x'],
              [-b, ''],
            ]);
            return [
              `x = ${terms([
                [a, 'y'],
                [b, ''],
              ])}`,
              ...(b === 0 ? [] : [`${left} = ${terms([[a, 'y']])}`]),
              `y = ${b === 0 ? 'x' : `(${left})`} ÷ ${par(a)} = ${terms(
                [
                  [1 / a, 'x'],
                  [-b / a, ''],
                ],
                (x) => fr(x, 20),
              )}`,
            ];
          },
        },
      ),
      derive(
        'n = −b ÷ a',
        'n',
        ['b', 'a'],
        '{n} = −{b} ÷ {a}',
        (v) => div(-v.b!, v.a!),
        '−{b} ÷ {a}',
        'The −b, divided by a too.',
        { work: (v) => [`n = ${fmt(-v.b!)} ÷ ${par(v.a!)}`] },
      ),
      derive(
        'X = m × y + n',
        'X',
        ['m', 'y', 'n'],
        '{X} = {m} × {y} + {n}',
        (v) => v.m! * v.y! + v.n!,
        '{m} × {y} + {n}',
        'Check: put y = f(x) into f⁻¹. It lands back on x, so f⁻¹ undoes f.',
      ),
    ],
    example: { a: 3, b: -6, m: 1 / 3, n: 2, x: 4, y: 6, X: 4 },
    startWith: ['a', 'b', 'x'],
    pictureLabels: ['m', 'n', 'X'],
    representation: {
      kind: 'functionGraph',
      family: 'linear',
      m: 'a',
      b: 'b',
      inverse: true,
      at: { x: 'x', y: 'y' },
    },
  }),
  page({
    id: 'm.11.inverse-functions~restrict-domain',
    title: 'Inverse on a restricted domain',
    use: 'Use this for “f(x) = 2(x − 1)² + 3 for x ≥ 1. Find f⁻¹(11) and f⁻¹(x).”',
    assumptions: [
      'A whole parabola fails the horizontal line test, so keep only the half from the vertex on: x ≥ h.',
      'On that half f only rises (or only falls when a < 0), so each y comes from one x.',
      'Undo the steps in reverse order: take k away, divide by a, take the positive root, add h.',
    ],
    variables: [
      V('a', 'a', 'Vertical factor', { min: -5, max: 5, step: 0.5 }),
      V('h', 'h', 'Vertex x', { min: -10, max: 10, step: 0.5 }),
      V('k', 'k', 'Vertex y', { min: -10, max: 10, step: 0.5 }),
      V('x', 'x', 'Input, x ≥ h', { min: -10, max: 30, step: 0.5 }),
      V('y', 'y', 'Output f(x)', { min: -3000, max: 3000 }),
    ],
    rules: [
      limit('a ≠ 0', '{a} is not 0', ['a'], (v) => v.a !== 0, 'With a = 0 there is no parabola.'),
      limit(
        'x ≥ h',
        '{x} is at least {h}',
        ['x', 'h'],
        (v) => v.x! >= v.h!,
        'Only x ≥ h is kept: take an x at or right of the vertex.',
      ),
      inverseNote(
        rule(
          'y = a(x − h)² + k, x ≥ h',
          '{y} = {a} × ({x} − {h})² + {k}',
          ['y', 'a', 'x', 'h', 'k'],
          (v) => v.y! - (v.a! * (v.x! - v.h!) ** 2 + v.k!),
          {
            y: [
              (v) => exact(v.a! * (v.x! - v.h!) ** 2 + v.k!),
              '{a} × ({x} − {h})² + {k}',
              'Put x into f: take h away, square, multiply by a, then add k.',
            ],
            x: [
              (v) => {
                const q = (v.y! - v.k!) / v.a!;
                return !v.a || q < 0 ? undefined : exact(v.h! + Math.sqrt(q));
              },
              '{h} + √(({y} − {k}) ÷ {a})',
              'The inverse undoes f in reverse: take k away, divide by a, take the positive root (x ≥ h), then add h.',
            ],
            ...never('a', 'h', 'k'),
          },
          {
            message: (v) =>
              v.a !== undefined &&
              v.y !== undefined &&
              v.k !== undefined &&
              v.a !== 0 &&
              (v.y - v.k) / v.a < 0
                ? 'f never reaches that output: (y − k) ÷ a is negative, and a square is never negative.'
                : undefined,
          },
        ),
      ),
    ],
    example: { a: 2, h: 1, k: 3, x: 3, y: 11 },
    startWith: ['a', 'h', 'k', 'y'],
    equation: '{y} = {a}({x} − {h})² + {k}',
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'vertex',
      a: 'a',
      h: 'h',
      k: 'k',
      restrict: { from: 'h' },
      inverse: true,
      at: { x: 'x', y: 'y' },
    },
  }),

  // ── Radical functions and equations (A-REI.2, F-IF.7b) ──
  page({
    id: 'm.11.radical-functions',
    assumptions: [
      'Square both sides to undo the root: ax + b = c².',
      'A square root is never negative, so c must be 0 or more.',
      'Check the answer in the first equation.',
    ],
    variables: [
      V('a', 'a', 'Coefficient of x', { min: -10, max: 10, step: 1 }),
      V('b', 'b', 'Constant under the root', { min: -50, max: 50, step: 1 }),
      V('c', 'c', 'Right side', { min: -20, max: 20, step: 1 }),
      V('x', 'x', 'Solution', { min: -500, max: 500, fraction: 12 }),
    ],
    rules: [
      limit(
        'a ≠ 0',
        '{a} is not 0',
        ['a'],
        (v) => v.a !== 0,
        'With a = 0 there is no x to solve for.',
      ),
      limit(
        'c ≥ 0',
        '{c} is 0 or more',
        ['c'],
        (v) => v.c! >= 0,
        'A square root is never negative, so no x works.',
      ),
      rule(
        'ax + b = c²',
        '{a} × {x} + {b} = {c}²',
        ['a', 'x', 'b', 'c'],
        (v) => v.a! * v.x! + v.b! - v.c! ** 2,
        {
          x: [
            (v) => fin(div(v.c! ** 2 - v.b!, v.a!)),
            '({c}² − {b}) ÷ {a}',
            'Square both sides, take b from both sides, then divide by a.',
          ],
          c: [
            (v) => (v.a! * v.x! + v.b! < 0 ? undefined : exact(Math.sqrt(v.a! * v.x! + v.b!))),
            '√({a} × {x} + {b})',
            'Put x in and take the square root.',
          ],
          b: [
            (v) => exact(v.c! ** 2 - v.a! * v.x!),
            '{c}² − {a} × {x}',
            'Square both sides, then take ax away.',
          ],
          a: [() => undefined],
        },
        {
          // The check is in the first equation, the root, as assumption 3 says.
          check: (v) =>
            `√(${fmt(v.a!)} × ${wrap(fr(v.x!))} ${v.b! < 0 ? '−' : '+'} ${fmt(Math.abs(v.b!))}) = ${fmt(v.c!)}`,
        },
      ),
    ],
    example: { a: 3, b: 4, c: 5, x: 7 },
    startWith: ['a', 'b', 'c'],
    equation: '√({a}x + {b}) = {c}',
    representation: {
      kind: 'plot',
      x: { var: 'x', min: -2, max: 20, label: 'x' },
      y: { var: 'c', min: 0, max: 8, label: 'y' },
      params: ['a', 'b'],
      autoRange: true,
    },
  }),
  page({
    id: 'm.11.radical-functions~extraneous',
    title: 'Extraneous solutions',
    use: 'Use this for “Solve √(x + 7) = x + 1” and reject the extraneous solution.',
    assumptions: [
      'Squaring both sides gives x + a = (x + b)², a quadratic: the graph shows its two zeros, the candidates.',
      'Squaring can add a false solution: one where x + b is negative, since a root never is.',
      'Check each candidate in the first equation; keep only the ones that work.',
    ],
    variables: [
      V('a', 'a', 'Constant under the root', { min: -50, max: 50, step: 1 }),
      V('b', 'b', 'Constant on the right', { min: -50, max: 50, step: 1 }),
      V('B', 'B', 'x coefficient after squaring, 2b − 1', { min: -101, max: 99, derived: true }),
      V('C', 'C', 'Constant after squaring, b² − a', { min: -50, max: 2550, derived: true }),
      V('x1', 'x₁', 'Larger candidate', { min: -100, max: 100, derived: true }),
      V('x2', 'x₂', 'Smaller candidate', { min: -100, max: 100, derived: true }),
      V('L2', 'L', 'Left side at x₂', { min: 0, max: 100, derived: true }),
      V('R2', 'R', 'Right side at x₂', { min: -100, max: 100, derived: true }),
    ],
    rules: [
      limit(
        '1 + 4a − 4b ≥ 0',
        '1 + 4 × {a} − 4 × {b} is 0 or more',
        ['a', 'b'],
        (v) => 1 + 4 * v.a! - 4 * v.b! >= 0,
        'The line never meets the root curve: the quadratic has no real candidates, so there is no solution.',
      ),
      derive(
        'B = 2b − 1',
        'B',
        ['b'],
        '{B} = 2 × {b} − 1',
        (v) => 2 * v.b! - 1,
        '2 × {b} − 1',
        'Square both sides: x + a = x² + 2bx + b², so x² + (2b − 1)x + (b² − a) = 0.',
      ),
      derive(
        'C = b² − a',
        'C',
        ['b', 'a'],
        '{C} = {b}² − {a}',
        (v) => v.b! ** 2 - v.a!,
        '{b}² − {a}',
        'The constant of the squared equation.',
      ),
      derive(
        'x₁ = (−B + √(B² − 4C)) ÷ 2',
        'x1',
        ['B', 'C'],
        '{x1} = (−{B} + √({B}² − 4 × {C})) ÷ 2',
        (v) => rootOf(1, v.B!, v.C!, 1),
        '(−{B} + √({B}² − 4 × {C})) ÷ 2',
        'x² + Bx + C = 0 by the quadratic formula; here x + b > 0, so it always works.',
        { work: (v) => quadWork(1, v.B!, v.C!, 1).map((l) => `x₁ = ${l}`) },
      ),
      derive(
        'x₂ = (−B − √(B² − 4C)) ÷ 2',
        'x2',
        ['B', 'C'],
        '{x2} = (−{B} − √({B}² − 4 × {C})) ÷ 2',
        (v) => rootOf(1, v.B!, v.C!, -1),
        '(−{B} − √({B}² − 4 × {C})) ÷ 2',
        'The other candidate, with the minus sign.',
        { work: (v) => quadWork(1, v.B!, v.C!, -1).map((l) => `x₂ = ${l}`) },
      ),
      derive(
        'L = √(x₂ + a)',
        'L2',
        ['x2', 'a'],
        '{L2} = √({x2} + {a})',
        (v) => Math.sqrt(Math.max(0, v.x2! + v.a!)),
        '√({x2} + {a})',
        'Check x₂ in the left side of the first equation.',
      ),
      derive(
        'R = x₂ + b',
        'R2',
        ['x2', 'b'],
        '{R2} = {x2} + {b}',
        (v) => v.x2! + v.b!,
        '{x2} + {b}',
        (v) =>
          v.x2! + v.b! < -1e-9
            ? 'The right side is negative but a root is not: x₂ is extraneous, so reject it.'
            : 'The right side equals the root: x₂ is a solution too.',
      ),
    ],
    example: { a: 7, b: 1, B: 1, C: -6, x1: 2, x2: -3, L2: 2, R2: -2 },
    startWith: ['a', 'b'],
    equation: '√(x + {a}) = x + {b}',
    pictureLabels: ['L2', 'R2'],
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'standard',
      a: 1,
      b: 'B',
      c: 'C',
      shows: { zeros: ['x2', 'x1'] },
      marks: ['zeros'],
    },
  }),
  page({
    id: 'm.11.radical-functions~graph',
    title: 'Graph a square root function',
    use: 'Use this for “Graph y = 2√(x + 3) + 1: where it starts, which way it goes, and y at x = 6.”',
    assumptions: [
      'y = a√(x − h) + k starts at (h, k): the parent √x moved right h and up k.',
      'The domain is x ≥ h; the range is y ≥ k when a > 0 and y ≤ k when a < 0.',
    ],
    variables: [
      V('a', 'a', 'Vertical factor', { min: -10, max: 10, step: 0.5 }),
      V('h', 'h', 'Start x', { min: -20, max: 20, step: 0.5 }),
      V('k', 'k', 'Start y', { min: -20, max: 20, step: 0.5 }),
      V('x', 'x', 'Input', { min: -20, max: 60, step: 0.5 }),
      V('y', 'y', 'Output', { min: -200, max: 200 }),
    ],
    rules: [
      limit(
        'a ≠ 0',
        '{a} is not 0',
        ['a'],
        (v) => v.a !== 0,
        'With a = 0 the graph is the flat line y = k.',
      ),
      limit(
        'x ≥ h',
        '{x} is at least {h}',
        ['x', 'h'],
        (v) => v.x! >= v.h!,
        'Left of x = h the root would be of a negative number: x is outside the domain.',
      ),
      rule(
        'y = a√(x − h) + k',
        '{y} = {a} × √({x} − {h}) + {k}',
        ['y', 'a', 'x', 'h', 'k'],
        (v) => v.y! - (v.a! * Math.sqrt(v.x! - v.h!) + v.k!),
        {
          y: [
            (v) => (v.x! < v.h! ? undefined : exact(v.a! * Math.sqrt(v.x! - v.h!) + v.k!)),
            '{a} × √({x} − {h}) + {k}',
            'Take the square root of x − h, multiply by a, then add k.',
          ],
          x: [
            (v) =>
              v.a === 0 || (v.y! - v.k!) / v.a! < 0
                ? undefined
                : exact(v.h! + ((v.y! - v.k!) / v.a!) ** 2),
            '{h} + (({y} − {k}) ÷ {a})²',
            'Take away k, divide by a, square both sides, then add h.',
          ],
          a: [() => undefined],
          h: [() => undefined],
          k: [() => undefined],
        },
      ),
    ],
    example: { a: 2, h: -3, k: 1, x: 6, y: 7 },
    startWith: ['a', 'h', 'k', 'x'],
    representation: {
      kind: 'functionGraph',
      family: 'root',
      index: 2,
      a: 'a',
      h: 'h',
      k: 'k',
      parent: true,
      at: { x: 'x', y: 'y' },
      marks: ['domain', 'range'],
    },
  }),
  page({
    id: 'm.11.radical-functions~cube-root',
    title: 'Graph a cube root function',
    use: 'Use this for “Graph y = 2∛(x + 1) − 3: its center, and y at x = 7” or “Find x where y = 5.”',
    assumptions: [
      'y = a∛(x − h) + k is the parent ∛x moved right h and up k: its center is (h, k).',
      'A cube root of a negative number is negative, so the domain and range are all real numbers.',
      'a > 0 rises left to right; a < 0 falls.',
    ],
    variables: [
      V('a', 'a', 'Vertical factor', { min: -10, max: 10, step: 0.5 }),
      V('h', 'h', 'Center x', { min: -20, max: 20, step: 0.5 }),
      V('k', 'k', 'Center y', { min: -20, max: 20, step: 0.5 }),
      V('x', 'x', 'Input', { min: -200, max: 200, step: 0.5 }),
      V('y', 'y', 'Output', { min: -200, max: 200 }),
    ],
    rules: [
      limit(
        'a ≠ 0',
        '{a} is not 0',
        ['a'],
        (v) => v.a !== 0,
        'With a = 0 the graph is the flat line y = k.',
      ),
      rule(
        'y = a∛(x − h) + k',
        '{y} = {a} × ∛({x} − {h}) + {k}',
        ['y', 'a', 'x', 'h', 'k'],
        (v) => v.y! - (v.a! * Math.cbrt(v.x! - v.h!) + v.k!),
        {
          y: [
            (v) => exact(v.a! * Math.cbrt(v.x! - v.h!) + v.k!),
            '{a} × ∛({x} − {h}) + {k}',
            'Take the cube root of x − h (negative when x is left of h), multiply by a, then add k.',
          ],
          x: [
            (v) => (v.a === 0 ? undefined : fin(v.h! + ((v.y! - v.k!) / v.a!) ** 3)),
            '{h} + (({y} − {k}) ÷ {a})³',
            'Take away k, divide by a, cube both sides to undo the root, then add h.',
          ],
          ...never('a', 'h', 'k'),
        },
      ),
    ],
    example: { a: 2, h: -1, k: -3, x: 7, y: 1 },
    startWith: ['x', 'a', 'h', 'k'],
    representation: {
      kind: 'functionGraph',
      family: 'root',
      index: 3,
      a: 'a',
      h: 'h',
      k: 'k',
      parent: true,
      at: { x: 'x', y: 'y' },
      marks: ['vertex', 'zeros'],
    },
  }),
  page({
    id: 'm.11.radical-functions~rational-exponent',
    title: 'Rational exponents',
    use: 'Use this for “Evaluate 8^(2/3)”, “Graph y = 2x^(−1/2)” or “Solve x^(3/2) = 27.”',
    assumptions: [
      'x^(p/q) is the qth root of x, raised to the power p: 8^(2/3) = (∛8)² = 4.',
      'A negative p puts the power under 1, x^(−p/q) = 1 ÷ x^(p/q), so x = 0 has no value.',
      'To solve for x, divide by a and raise both sides to q/p, the reciprocal power; here x ≥ 0.',
    ],
    variables: [
      V('a', 'a', 'Vertical factor', { min: -10, max: 10, step: 0.5 }),
      V('p', 'p', 'Power p, top of the exponent', { integer: true, min: -6, max: 6 }),
      V('q', 'q', 'Root q, bottom of the exponent', { integer: true, min: 1, max: 12 }),
      // x ≥ 0: an odd root of a negative x is drawn, but the steps raise only x ≥ 0 to p/q.
      V('x', 'x', 'Input', { min: 0, max: 1000, step: 0.5 }),
      V('y', 'y', 'Output', { min: -1e6, max: 1e6 }),
    ],
    rules: [
      limit('a ≠ 0', '{a} is not 0', ['a'], (v) => v.a !== 0, 'With a = 0 every y is 0.'),
      limit(
        'p ≠ 0',
        '{p} is not 0',
        ['p'],
        (v) => v.p !== 0,
        'With p = 0 the power x⁰ is 1 for every x: take a p that is not 0.',
      ),
      limit(
        'x ≠ 0 for p < 0',
        '{x}^({p}/{q}) has a value',
        ['x', 'p', 'q'],
        (v) => !(v.x === 0 && v.p! < 0),
        'A negative power of 0 would divide by 0: take an x more than 0.',
      ),
      rule(
        'y = a × x^(p/q)',
        '{y} = {a} × {x}^({p}/{q})',
        ['y', 'a', 'x', 'p', 'q'],
        (v) => v.y! - v.a! * v.x! ** (v.p! / v.q!),
        {
          y: [
            (v) => fin(v.a! * v.x! ** (v.p! / v.q!)),
            '{a} × {x}^({p}/{q})',
            'Take the qth root of x, raise it to the power p, then multiply by a.',
          ],
          x: [
            (v) => {
              const r = v.y! / v.a!;
              return !v.a || !v.p || r < 0 || (r === 0 && v.p < 0)
                ? undefined
                : fin(r ** (v.q! / v.p));
            },
            '({y} ÷ {a})^({q}/{p})',
            'Divide by a, then raise both sides to q/p: the powers multiply to 1, leaving x.',
          ],
          ...never('a', 'p', 'q'),
        },
        {
          message: (v) =>
            v.a && v.y !== undefined && v.y / v.a < 0
              ? 'x^(p/q) is never negative for x ≥ 0, so y ÷ a must be 0 or more.'
              : undefined,
        },
      ),
    ],
    example: { a: 1, p: 2, q: 3, x: 8, y: 4 },
    startWith: ['x', 'a', 'p', 'q'],
    equation: 'y = {a}·x^{{p}/{q}}',
    representation: {
      kind: 'functionGraph',
      family: 'power',
      a: 'a',
      p: 'p',
      q: 'q',
      at: { x: 'x', y: 'y' },
      // No key point: (0, 0) of x^(2/3) is neither a start nor a center.
      marks: ['asymptotes', 'domain'],
    },
  }),

  // ── Rational expressions, equations and functions (A-APR.6, A-REI.2, F-IF.7d) ──
  page({
    id: 'm.11.rational-functions',
    assumptions: [
      'y = a(x − z)(x − c) ÷ ((x − p)(x − c)): a factor that cancels leaves a hole at x = c, not an asymptote.',
      'A factor left in the denominator gives a vertical asymptote, x = p.',
      'Equal degrees top and bottom: the horizontal asymptote is y = a.',
    ],
    variables: [
      V('a', 'a', 'Leading factor', { min: -10, max: 10, step: 0.5 }),
      V('z', 'z', 'Zero', { min: -10, max: 10, step: 0.5 }),
      V('p', 'p', 'Vertical asymptote', { min: -10, max: 10, step: 0.5 }),
      V('c', 'c', 'x of the hole', { min: -10, max: 10, step: 0.5 }),
      V('H', 'H', 'y of the hole', { min: -1000, max: 1000, fraction: 40, derived: true }),
      V('x', 'x', 'Input', { min: -20, max: 20, step: 0.5 }),
      V('y', 'y', 'Output', { min: -1e4, max: 1e4, derived: true }),
    ],
    rules: [
      limit(
        'a ≠ 0',
        '{a} is not 0',
        ['a'],
        (v) => v.a !== 0,
        'With a = 0 the function is 0 everywhere.',
      ),
      limit(
        'z ≠ p',
        '{z} is not {p}',
        ['z', 'p'],
        (v) => v.z !== v.p,
        'With z = p that factor cancels too: there would be no asymptote.',
      ),
      limit(
        'c ≠ p',
        '{c} is not {p}',
        ['c', 'p'],
        (v) => v.c !== v.p,
        'With c = p the denominator has (x − p)²; the hole would be an asymptote.',
      ),
      limit(
        'x ≠ c',
        '{x} is not {c}',
        ['x', 'c'],
        (v) => v.x !== v.c,
        'At x = c the function has a hole: it has no value there.',
      ),
      derive(
        'H = a(c − z) ÷ (c − p)',
        'H',
        ['a', 'c', 'z', 'p'],
        '{H} = {a} × ({c} − {z}) ÷ ({c} − {p})',
        (v) => div(v.a! * (v.c! - v.z!), v.c! - v.p!),
        '{a} × ({c} − {z}) ÷ ({c} − {p})',
        'Cancel x − c, then put x = c into what is left: the hole’s height.',
      ),
      derive(
        'y = a(x − z) ÷ (x − p)',
        'y',
        ['a', 'x', 'z', 'p'],
        '{y} = {a} × ({x} − {z}) ÷ ({x} − {p})',
        (v) => div(v.a! * (v.x! - v.z!), v.x! - v.p!),
        '{a} × ({x} − {z}) ÷ ({x} − {p})',
        'Cancel the shared factor x − c, then evaluate.',
      ),
    ],
    example: { a: 1, z: 1, p: 3, c: -2, H: 0.6, x: 5, y: 2 },
    startWith: ['a', 'z', 'p', 'c', 'x'],
    pictureLabels: ['H'],
    representation: {
      kind: 'functionGraph',
      family: 'rational',
      a: 'a',
      zeros: ['z', 'c'],
      poles: ['p', 'c'],
      at: { x: 'x', y: 'y' },
      marks: ['zeros', 'asymptotes'],
    },
  }),
  page({
    id: 'm.11.rational-functions~add-subtract',
    title: 'Add or subtract rational expressions',
    use: 'Use this for “Write 3/(x − 1) + 2/(x + 4) as one fraction.”',
    assumptions: [
      'The common denominator is (x − p)(x − q) = x² + Sx + P.',
      'Multiply each top by the other bottom: a(x − q) ± c(x − p) = Ax + B.',
      'p and q are different, or the fractions already share a denominator.',
    ],
    variables: [
      V('a', 'a', 'First top', { min: -20, max: 20, step: 1 }),
      V('p', 'p', 'First bottom is x − p', { min: -20, max: 20, step: 1 }),
      V('sg', 't', 'Add (1) or subtract (−1)', { allowed: [-1, 1], min: -1, max: 1 }),
      V('c', 'c', 'Second top', { min: -20, max: 20, step: 1 }),
      V('q', 'q', 'Second bottom is x − q', { min: -20, max: 20, step: 1 }),
      V('A', 'A', 'x coefficient on top', { min: -40, max: 40, derived: true }),
      V('B', 'B', 'Constant on top', { min: -1000, max: 1000, derived: true }),
      V('S', 'S', 'x coefficient below', { min: -40, max: 40, derived: true }),
      V('P', 'P', 'Constant below', { min: -400, max: 400, derived: true }),
      V('Z', 'Z', 'Zero of the result', { min: -1e4, max: 1e4, fraction: 40, derived: true }),
    ],
    rules: [
      limit(
        'p ≠ q',
        '{p} is not {q}',
        ['p', 'q'],
        (v) => v.p !== v.q,
        'The denominators are the same: add or subtract the tops over x − p.',
      ),
      derive(
        'A = a + t × c',
        'A',
        ['a', 'sg', 'c'],
        '{A} = {a} + {sg} × {c}',
        (v) => v.a! + v.sg! * v.c!,
        '{a} + {sg} × {c}',
        'The x terms of a(x − q) and c(x − p), with t = −1 to subtract.',
        {
          work: (v) => [
            ...(v.p === undefined || v.q === undefined
              ? []
              : [
                  `(${terms([
                    [v.a!, `(${lin(v.q)})`],
                    [v.sg! * v.c!, `(${lin(v.p)})`],
                  ])}) ÷ ((${lin(v.p)})(${lin(v.q)}))`,
                ]),
            `A = ${fmt(v.a!)} + ${par(v.sg! * v.c!)}`,
          ],
        },
      ),
      derive(
        'B = −(a × q + t × c × p)',
        'B',
        ['a', 'q', 'sg', 'c', 'p'],
        '{B} = −({a} × {q} + {sg} × {c} × {p})',
        (v) => -(v.a! * v.q! + v.sg! * v.c! * v.p!),
        '−({a} × {q} + {sg} × {c} × {p})',
        'The numbers: a × (−q) and c × (−p), combined the same way.',
        {
          work: (v) => {
            const s1 = v.a! * v.q!;
            const s2 = v.sg! * v.c! * v.p!;
            return [`B = −(${fmt(s1)} + ${par(s2)})`, `B = −${par(s1 + s2)}`];
          },
        },
      ),
      derive(
        'S = −(p + q)',
        'S',
        ['p', 'q'],
        '{S} = −({p} + {q})',
        (v) => -(v.p! + v.q!),
        '−({p} + {q})',
        '(x − p)(x − q) has x terms −px − qx.',
        { work: (v) => [`S = −${par(v.p! + v.q!)}`] },
      ),
      derive(
        'P = pq',
        'P',
        ['p', 'q'],
        '{P} = {p} × {q}',
        (v) => v.p! * v.q!,
        '{p} × {q}',
        '(−p) × (−q) is pq.',
        {
          work: (v) => {
            const [a, t, c, p, q] = [v.a!, v.sg!, v.c!, v.p!, v.q!];
            if ([v.a, v.sg, v.c].some((x) => x === undefined)) return [];
            return [
              `${fmt(a)} ÷ (${lin(p)}) ${t * c < 0 ? '−' : '+'} ${fmt(Math.abs(c))} ÷ (${lin(q)}) = (${poly(
                [a + t * c, -(a * q + t * c * p)],
              )}) ÷ (${poly([1, -(p + q), p * q])})`,
            ];
          },
        },
      ),
      derive(
        'Z = −B ÷ A',
        'Z',
        ['B', 'A'],
        '{Z} = −{B} ÷ {A}',
        (v) => div(-v.B!, v.A!),
        '−{B} ÷ {A}',
        'The top Ax + B is 0 here: the graph crosses the x-axis.',
        // −(−10) written as its value (the simplifying would print −−10).
        { work: (v) => (v.B! < 0 ? [`Z = ${fmt(-v.B!)} ÷ ${par(v.A!)}`] : []) },
      ),
    ],
    example: { a: 3, p: 1, sg: 1, c: 2, q: -4, A: 5, B: 10, S: 3, P: -4, Z: -2 },
    startWith: ['a', 'p', 'sg', 'c', 'q'],
    equation: '{a}/{x − {p}} ± {c}/{x − {q}} = {{A}x + {B}}/{x² + {S}x + {P}}',
    pictureLabels: ['Z'],
    representation: {
      kind: 'functionGraph',
      family: 'rational',
      a: 'A',
      zeros: ['Z'],
      poles: ['p', 'q'],
      marks: ['zeros', 'asymptotes'],
    },
  }),
  page({
    id: 'm.11.rational-functions~multiply-divide',
    title: 'Multiply or divide rational expressions',
    use: 'Use this for “Simplify (x − 4)/(x + 1) × (x + 1)/(x − 6)” or a quotient of two such fractions.',
    assumptions: [
      'To divide, flip the second fraction and multiply: its power becomes −1.',
      'Multiply the tops and the bottoms, then cancel a factor that is on both.',
      'x can’t make any bottom 0, even one that cancels: those x stay left out.',
    ],
    variables: [
      V('a', 'a', 'First top is x − a', { integer: true, min: -20, max: 20 }),
      V('b', 'b', 'First bottom is x − b', { integer: true, min: -20, max: 20 }),
      V('sg', 't', 'Multiply (1) or divide (−1)', { allowed: [-1, 1], min: -1, max: 1 }),
      V('c', 'c', 'Second top is x − c', { integer: true, min: -20, max: 20 }),
      V('d', 'd', 'Second bottom is x − d', { integer: true, min: -20, max: 20 }),
      // The flipped second fraction and the left-out x place the picture's zeros and poles.
      V('m', 'm', 'Second top after the flip', { min: -20, max: 20, derived: true, hidden: true }),
      V('n', 'n', 'Second bottom after the flip', {
        min: -20,
        max: 20,
        derived: true,
        hidden: true,
      }),
      V('h', 'h', 'Left-out x drawn as a hole', { min: -20, max: 20, derived: true, hidden: true }),
      V('x', 'x', 'Input', { min: -40, max: 40, step: 0.5 }),
      V('y', 'y', 'Value of the product', { min: -1e5, max: 1e5, fraction: 40, derived: true }),
    ],
    rules: [
      limit(
        'a ≠ b',
        '{a} is not {b}',
        ['a', 'b'],
        (v) => v.a !== v.b,
        'With a = b the first fraction is just 1: use different numbers top and bottom.',
      ),
      limit(
        'c ≠ d',
        '{c} is not {d}',
        ['c', 'd'],
        (v) => v.c !== v.d,
        'With c = d the second fraction is just 1: use different numbers top and bottom.',
      ),
      limit(
        'not everything cancels',
        '({a}, {b}) and ({c}, {d}) with {sg} leave a factor',
        ['a', 'b', 'c', 'd', 'sg'],
        (v) => !flipCancelsAll(v),
        'Every factor cancels, so the answer is 1 wherever it has a value.',
      ),
      limit(
        'x ≠ b, d',
        '{x} is not {b} or {d}',
        ['x', 'b', 'd'],
        (v) => v.x !== v.b && v.x !== v.d,
        'At x = b or x = d a bottom is 0: the expression has no value there.',
      ),
      limit(
        'x ≠ c when dividing',
        '{x} is not {c} when {sg} = −1',
        ['x', 'c', 'sg'],
        (v) => v.sg !== -1 || v.x !== v.c,
        'At x = c the second fraction is 0, and nothing can be divided by 0.',
      ),
      derive(
        'm = the flipped top',
        'm',
        ['c', 'd', 'sg'],
        '{m} = ((1 + {sg}) × {c} + (1 − {sg}) × {d}) ÷ 2',
        (v) => ((1 + v.sg!) * v.c! + (1 - v.sg!) * v.d!) / 2,
        '{c}',
        'The top of the second fraction once it is flipped.',
        { hidden: true },
      ),
      derive(
        'n = the flipped bottom',
        'n',
        ['c', 'd', 'sg'],
        '{n} = ((1 + {sg}) × {d} + (1 − {sg}) × {c}) ÷ 2',
        (v) => ((1 + v.sg!) * v.d! + (1 - v.sg!) * v.c!) / 2,
        '{d}',
        'The bottom of the second fraction once it is flipped.',
        { hidden: true },
      ),
      derive(
        'h = the left-out x',
        'h',
        ['b', 'd', 'sg'],
        '{h} = ((1 + {sg}) × {b} + (1 − {sg}) × {d}) ÷ 2',
        (v) => ((1 + v.sg!) * v.b! + (1 - v.sg!) * v.d!) / 2,
        '{b}',
        'An x the divisor’s own bottom leaves out.',
        { hidden: true },
      ),
      derive(
        'y = (x − a) ÷ (x − b) × ((x − c) ÷ (x − d))ᵗ',
        'y',
        ['x', 'a', 'b', 'c', 'd', 'sg'],
        '{y} = ({x} − {a}) ÷ ({x} − {b}) × (({x} − {c}) ÷ ({x} − {d}))^{sg}',
        (v) => ((v.x! - v.a!) / (v.x! - v.b!)) * ((v.x! - v.c!) / (v.x! - v.d!)) ** v.sg!,
        (v) => flipExpr(v),
        (v) => flipHow(v),
      ),
    ],
    example: { a: 4, b: -1, sg: 1, c: -1, d: 6, m: -1, n: 6, h: -1, x: 2, y: 0.5 },
    startWith: ['a', 'b', 'sg', 'c', 'd', 'x'],
    equation: '{x − {a}}/{x − {b}} × ({x − {c}}/{x − {d}})^{sg}',
    representation: {
      kind: 'functionGraph',
      family: 'rational',
      a: 1,
      zeros: ['a', 'm', 'h'],
      poles: ['b', 'n', 'h'],
      at: { x: 'x', y: 'y' },
      marks: ['zeros', 'asymptotes'],
    },
  }),
  page({
    id: 'm.11.rational-functions~solve',
    title: 'Solve a rational equation',
    use: 'Use this for “Solve x/(x − 2) = 2/(x − 2) + 3/x” and reject the extraneous solution.',
    assumptions: [
      'Multiply every term by x(x − p) to clear the fractions: x² − (a + b)x + bp = 0.',
      'A candidate that makes a denominator 0 (x = 0 or x = p) is extraneous: reject it.',
      'On the graph of the left side minus the right, an extraneous candidate is a hole.',
    ],
    variables: [
      V('p', 'p', 'Denominator is x − p', { min: -20, max: 20, step: 1 }),
      V('a', 'a', 'Top of the first right-hand fraction', { min: -20, max: 20, step: 1 }),
      V('b', 'b', 'Top of the second right-hand fraction', { min: -20, max: 20, step: 1 }),
      V('x1', 'x₁', 'Larger candidate', { min: -100, max: 100, derived: true }),
      V('x2', 'x₂', 'Smaller candidate', { min: -100, max: 100, derived: true }),
    ],
    rules: [
      limit(
        'p ≠ 0',
        '{p} is not 0',
        ['p'],
        (v) => v.p !== 0,
        'With p = 0 two denominators are the same x: use x/x = 1 instead.',
      ),
      limit(
        '(a + b)² − 4bp ≥ 0',
        '({a} + {b})² − 4 × {b} × {p} is 0 or more',
        ['a', 'b', 'p'],
        (v) => (v.a! + v.b!) ** 2 - 4 * v.b! * v.p! >= 0,
        'The quadratic has no real candidates, so the equation has no solution.',
      ),
      derive(
        'x₁ = ((a + b) + √((a + b)² − 4bp)) ÷ 2',
        'x1',
        ['a', 'b', 'p'],
        '{x1} = (({a} + {b}) + √(({a} + {b})² − 4 × {b} × {p})) ÷ 2',
        (v) => (v.a! + v.b! + Math.sqrt((v.a! + v.b!) ** 2 - 4 * v.b! * v.p!)) / 2,
        '(({a} + {b}) + √(({a} + {b})² − 4 × {b} × {p})) ÷ 2',
        'Multiply by x(x − p), then use the quadratic formula.',
        {
          work: (v) => [`${poly([1, -(v.a! + v.b!), v.b! * v.p!])} = 0`, ...candidateWork(v, 1)],
        },
      ),
      derive(
        'x₂ = ((a + b) − √((a + b)² − 4bp)) ÷ 2',
        'x2',
        ['a', 'b', 'p'],
        '{x2} = (({a} + {b}) − √(({a} + {b})² − 4 × {b} × {p})) ÷ 2',
        (v) => (v.a! + v.b! - Math.sqrt((v.a! + v.b!) ** 2 - 4 * v.b! * v.p!)) / 2,
        '(({a} + {b}) − √(({a} + {b})² − 4 × {b} × {p})) ÷ 2',
        'The same formula with the minus sign.',
        { work: (v) => candidateWork(v, -1) },
      ),
    ],
    example: { p: 2, a: 2, b: 3, x1: 3, x2: 2 },
    startWith: ['p', 'a', 'b'],
    equation: 'x/{x − {p}} = {a}/{x − {p}} + {b}/x',
    representation: {
      kind: 'functionGraph',
      family: 'rational',
      zeros: ['x1', 'x2'],
      poles: [0, 'p'],
      marks: ['zeros', 'asymptotes'],
    },
  }),
  page({
    id: 'm.11.rational-functions~variation',
    title: 'Inverse variation',
    use: 'Use this for “6 workers take 10 days. How long do 4 workers take?”',
    assumptions: [
      'y varies inversely with x when y = k ÷ x: the product xy is the same constant k.',
      'Doubling x halves y.',
    ],
    variables: [
      V('x1', 'x₁', 'First x', { min: 0.01, max: 60, step: 0.5 }),
      V('y1', 'y₁', 'First y', { min: 0.01, max: 60, step: 0.5 }),
      V('k', 'k', 'Constant of variation', { min: 0.0001, max: 1e6, derived: true }),
      V('x2', 'x₂', 'Second x', { min: 0.01, max: 1000, step: 0.5 }),
      V('y2', 'y₂', 'Second y', { min: 0.0001, max: 1e8 }),
    ],
    rules: [
      derive(
        'k = x₁y₁',
        'k',
        ['x1', 'y1'],
        '{k} = {x1} × {y1}',
        (v) => v.x1! * v.y1!,
        '{x1} × {y1}',
        'The product xy is the same for every pair.',
      ),
      rule('y₂ = k ÷ x₂', '{y2} = {k} ÷ {x2}', ['y2', 'k', 'x2'], (v) => v.y2! * v.x2! - v.k!, {
        y2: [(v) => fin(div(v.k!, v.x2!)), '{k} ÷ {x2}', 'Divide k by the new x.'],
        x2: [(v) => fin(div(v.k!, v.y2!)), '{k} ÷ {y2}', 'Divide k by the new y.'],
        k: [() => undefined],
      }),
    ],
    example: { x1: 6, y1: 10, k: 60, x2: 4, y2: 15 },
    startWith: ['x1', 'y1', 'x2'],
    pictureLabels: ['x1', 'y1'],
    representation: {
      kind: 'functionGraph',
      family: 'rational',
      a: 'k',
      zeros: [],
      poles: [0],
      at: { x: 'x2', y: 'y2' },
      marks: ['asymptotes'],
    },
  }),

  // ── Polynomial functions: graphs and zeros (A-APR.3, F-IF.7c) ──
  page({
    id: 'm.11.polynomial-functions',
    assumptions: [
      'y = a(x − r₁)ⁿ(x − r₂)(x − r₃) has degree n + 2: r₁ is a zero n times over.',
      'An even multiplicity touches the x-axis and turns; an odd one crosses it, flatter when 3 or more.',
      'The leading term decides the ends, and the degree says how many turns at most.',
    ],
    variables: [
      V('a', 'a', 'Leading coefficient', { allowed: [-3, -2, -1, 1, 2, 3], min: -3, max: 3 }),
      V('r1', 'r₁', 'Repeated zero', { min: -6, max: 6, step: 0.5 }),
      V('n', 'n', 'Multiplicity of r₁', { integer: true, allowed: [1, 2, 3, 4], min: 1, max: 4 }),
      V('r2', 'r₂', 'Second zero', { min: -6, max: 6, step: 0.5 }),
      V('r3', 'r₃', 'Third zero', { min: -6, max: 6, step: 0.5 }),
      V('x', 'x', 'Input', { min: -10, max: 10, step: 0.5 }),
      V('y', 'y', 'Output', { min: -1e9, max: 1e9, derived: true }),
    ],
    rules: [
      derive(
        'y = a(x − r₁)ⁿ(x − r₂)(x − r₃)',
        'y',
        ['a', 'x', 'r1', 'n', 'r2', 'r3'],
        '{y} = {a} × ({x} − {r1})^{n} × ({x} − {r2}) × ({x} − {r3})',
        (v) => v.a! * (v.x! - v.r1!) ** v.n! * (v.x! - v.r2!) * (v.x! - v.r3!),
        '{a} × ({x} − {r1})^{n} × ({x} − {r2}) × ({x} − {r3})',
        'Put x into each factor, the repeated one n times, then multiply.',
      ),
    ],
    example: { a: 1, r1: -2, n: 2, r2: 1, r3: 3, x: 0, y: 12 },
    startWith: ['a', 'r1', 'n', 'r2', 'r3', 'x'],
    representation: {
      kind: 'functionGraph',
      family: 'polynomial',
      a: 'a',
      zeros: [{ x: 'r1', times: 'n' }, { x: 'r2' }, { x: 'r3' }],
      at: { x: 'x', y: 'y' },
      marks: ['zeros', 'intercept'],
    },
  }),

  // ── Polynomial equations: the fundamental theorem (N-CN.9, A-SSE.2) ──
  page({
    id: 'm.11.polynomial-equations~complex-pair',
    title: 'A polynomial from its zeros',
    use: 'Use this for “Write the polynomial of least degree with zeros 1 and 2 + 3i.”',
    assumptions: [
      'A degree-n polynomial has exactly n roots, counting complex roots and repeats (the fundamental theorem of algebra).',
      'Real coefficients bring complex roots in conjugate pairs: 2 + 3i comes with 2 − 3i.',
      'The pair multiplies to x² − 2px + (p² + q²), then times x − r.',
    ],
    variables: [
      V('r', 'r', 'Real zero', { min: -10, max: 10, step: 1 }),
      V('p', 'p', 'Real part of the complex zero', { min: -10, max: 10, step: 1 }),
      V('q', 'q', 'Imaginary part of the complex zero', { min: -10, max: 10, step: 1 }),
      V('s', 's', 'p² + q²', { min: 0, max: 200, derived: true }),
      V('b', 'b', 'x² coefficient', { min: -30, max: 30, derived: true }),
      V('c', 'c', 'x coefficient', { min: -400, max: 400, derived: true }),
      V('d', 'd', 'Constant', { min: -2000, max: 2000, derived: true }),
    ],
    rules: [
      derive(
        's = p² + q²',
        's',
        ['p', 'q'],
        '{s} = {p}² + {q}²',
        (v) => v.p! ** 2 + v.q! ** 2,
        '{p}² + {q}²',
        '(p + qi)(p − qi) = p² − q²i² = p² + q².',
      ),
      derive(
        'b = −2p − r',
        'b',
        ['p', 'r'],
        '{b} = −2 × {p} − {r}',
        (v) => -2 * v.p! - v.r!,
        '−2 × {p} − {r}',
        'x² − 2px + s times x − r: the x² terms are −2px² and −rx².',
      ),
      derive(
        'c = s + 2pr',
        'c',
        ['s', 'p', 'r'],
        '{c} = {s} + 2 × {p} × {r}',
        (v) => v.s! + 2 * v.p! * v.r!,
        '{s} + 2 × {p} × {r}',
        'The x terms: s × x and −2px × (−r).',
      ),
      derive(
        'd = −r × s',
        'd',
        ['r', 's'],
        '{d} = −1 × {r} × {s}',
        (v) => -v.r! * v.s!,
        '−1 × {r} × {s}',
        'The constant: s × (−r).',
        {
          work: (v) => {
            if (v.p === undefined || v.q === undefined) return [];
            const [r, p, s] = [v.r!, v.p, v.p ** 2 + v.q ** 2];
            return [
              `(${lin(r)})(${poly([1, -2 * p, s])}) = ${poly([1, -2 * p - r, s + 2 * p * r, -r * s])}`,
            ];
          },
        },
      ),
    ],
    example: { r: 1, p: 2, q: 3, s: 13, b: -5, c: 17, d: -13 },
    startWith: ['r', 'p', 'q'],
    equation: 'x³ + {b}x² + {c}x + {d}',
    pictureLabels: ['r', 's'],
    representation: {
      kind: 'complexPlane',
      z: { re: 'p', im: 'q' },
      conjugate: true,
    },
  }),
  page({
    id: 'm.11.polynomial-equations~quadratic-form',
    title: 'Equations in quadratic form',
    use: 'Use this for “Solve x⁴ − 13x² + 36 = 0.”',
    assumptions: [
      'Let u = x²: then x⁴ + bx² + c = 0 is the quadratic u² + bu + c = 0.',
      'Solve for u, then x = ±√u for each u.',
      'A negative u gives no real x, so this page needs both u to be 0 or more.',
    ],
    variables: [
      V('b', 'b', 'Coefficient of x²', { min: -50, max: 50, step: 1 }),
      V('c', 'c', 'Constant', { min: -200, max: 600, step: 1 }),
      V('u1', 'u₁', 'Larger u', { min: 0, max: 1000, derived: true }),
      V('u2', 'u₂', 'Smaller u', { min: 0, max: 1000, derived: true }),
      V('x1', 'x₁', 'Positive root from u₁', { min: 0, max: 100, derived: true }),
      V('x2', 'x₂', 'Positive root from u₂', { min: 0, max: 100, derived: true }),
    ],
    rules: [
      limit(
        'b² − 4c ≥ 0',
        '{b}² − 4 × {c} is 0 or more',
        ['b', 'c'],
        (v) => v.b! ** 2 - 4 * v.c! >= 0,
        'The quadratic in u has no real solutions, so x has none either.',
      ),
      limit(
        'u₂ ≥ 0',
        '{b} is at most 0 and {c} is at least 0',
        ['b', 'c'],
        (v) => v.b! <= 0 && v.c! >= 0,
        'A negative u gives x² < 0, which has no real x: those roots are imaginary.',
      ),
      derive(
        'u₁ = (−b + √(b² − 4c)) ÷ 2',
        'u1',
        ['b', 'c'],
        '{u1} = (−{b} + √({b}² − 4 × {c})) ÷ 2',
        (v) => (-v.b! + Math.sqrt(v.b! ** 2 - 4 * v.c!)) / 2,
        '(−{b} + √({b}² − 4 × {c})) ÷ 2',
        'The quadratic formula for u² + bu + c = 0, with the plus sign.',
        { work: (v) => formulaWork(v.b!, v.c!, 1).map((l) => `u₁ = ${l}`) },
      ),
      derive(
        'u₂ = (−b − √(b² − 4c)) ÷ 2',
        'u2',
        ['b', 'c'],
        '{u2} = (−{b} − √({b}² − 4 × {c})) ÷ 2',
        (v) => (-v.b! - Math.sqrt(v.b! ** 2 - 4 * v.c!)) / 2,
        '(−{b} − √({b}² − 4 × {c})) ÷ 2',
        'The same formula with the minus sign.',
        { work: (v) => formulaWork(v.b!, v.c!, -1).map((l) => `u₂ = ${l}`) },
      ),
      derive(
        'x₁ = √u₁',
        'x1',
        ['u1'],
        '{x1} = √{u1}',
        (v) => Math.sqrt(v.u1!),
        '√{u1}',
        'x² = u₁, so x = ±√u₁: this is the positive one.',
      ),
      derive(
        'x₂ = √u₂',
        'x2',
        ['u2'],
        '{x2} = √{u2}',
        (v) => Math.sqrt(v.u2!),
        '√{u2}',
        'x² = u₂, so x = ±√u₂.',
        {
          work: (v) => {
            if (v.u1 === undefined) return [];
            const [x1, x2] = [Math.sqrt(v.u1), Math.sqrt(v.u2!)];
            const pm = (x: number) => (x === 0 ? '0' : `±${fmt(x)}`);
            return [Math.abs(x1 - x2) < 1e-9 ? `x = ${pm(x1)}` : `x = ${pm(x1)} or x = ${pm(x2)}`];
          },
        },
      ),
    ],
    example: { b: -13, c: 36, u1: 9, u2: 4, x1: 3, x2: 2 },
    startWith: ['b', 'c'],
    equation: 'x⁴ + {b}x² + {c} = 0',
    representation: {
      kind: 'functionGraph',
      family: 'polynomial',
      coefficients: [1, 0, 'b', 0, 'c'],
      shows: { zeros: ['x1', 'x2'] },
      marks: ['zeros'],
    },
  }),

  page({
    id: 'm.11.polynomial-equations~sum-of-cubes',
    title: 'Sum and difference of cubes',
    use: 'Use this for “Factor 27x³ + 8” or “Factor x³ − 125.”',
    assumptions: [
      'A sum of cubes factors as a³x³ + b³ = (ax + b)(a²x² − abx + b²).',
      'A difference of cubes is the same with a negative b: x³ − 125 = (x − 5)(x² + 5x + 25).',
      'The quadratic factor has no real zeros, so the only real zero is x = −b ÷ a.',
    ],
    variables: [
      V('A', 'A', 'Coefficient of x³, a³', { integer: true, min: -1000, max: 1000 }),
      V('B', 'B', 'Constant, b³', { integer: true, min: -1000, max: 1000 }),
      V('a', 'a', 'Cube root of A', { integer: true, min: -10, max: 10 }),
      V('b', 'b', 'Cube root of B', { integer: true, min: -10, max: 10 }),
      V('m', 'm', 'x² coefficient of the second factor, a²', { min: 0, max: 100, derived: true }),
      V('n', 'n', 'x coefficient of the second factor, −ab', {
        min: -100,
        max: 100,
        derived: true,
      }),
      V('k', 'k', 'Constant of the second factor, b²', { min: 0, max: 100, derived: true }),
      V('z', 'z', 'Real zero, −b ÷ a', { min: -1000, max: 1000, fraction: 12, derived: true }),
    ],
    rules: [
      limit('a ≠ 0', '{a} is not 0', ['a'], (v) => v.a !== 0, 'With a = 0 there is no x³ term.'),
      rule('A = a³', '{A} = {a}³', ['A', 'a'], (v) => v.A! - v.a! ** 3, {
        a: [(v) => fin(Math.cbrt(v.A!)), '∛({A})', 'The number whose cube is A.'],
        A: [(v) => v.a! ** 3, '{a}³', 'Cube a to get the x³ coefficient.'],
      }),
      rule('B = b³', '{B} = {b}³', ['B', 'b'], (v) => v.B! - v.b! ** 3, {
        b: [
          (v) => fin(Math.cbrt(v.B!)),
          '∛({B})',
          'The number whose cube is B; a negative B has a negative b.',
        ],
        B: [(v) => v.b! ** 3, '{b}³', 'Cube b to get the constant.'],
      }),
      derive(
        'm = a²',
        'm',
        ['a'],
        '{m} = {a}²',
        (v) => v.a! ** 2,
        '{a}²',
        'The first term of the second factor: (ax)².',
      ),
      derive(
        'n = −a × b',
        'n',
        ['a', 'b'],
        '{n} = −1 × {a} × {b}',
        (v) => -v.a! * v.b!,
        '−1 × {a} × {b}',
        'The middle term has the opposite sign of b: −abx.',
      ),
      derive(
        'k = b²',
        'k',
        ['b'],
        '{k} = {b}²',
        (v) => v.b! ** 2,
        '{b}²',
        'The last term of the second factor is b², always positive.',
        {
          work: (v) =>
            v.a === undefined
              ? []
              : [
                  `${poly([v.a ** 3, 0, 0, v.b! ** 3])} = (${poly([v.a, v.b!])})(${poly([
                    v.a ** 2,
                    -v.a * v.b!,
                    v.b! ** 2,
                  ])})`,
                ],
        },
      ),
      derive(
        'z = −b ÷ a',
        'z',
        ['b', 'a'],
        '{z} = −1 × {b} ÷ {a}',
        (v) => div(-v.b!, v.a!),
        '−1 × {b} ÷ {a}',
        'ax + b = 0 here: the graph crosses the x-axis once.',
      ),
    ],
    example: { A: 27, B: 8, a: 3, b: 2, m: 9, n: -6, k: 4, z: -2 / 3 },
    startWith: ['A', 'B'],
    equation: '{A:coef}x³ + {B} = ({a:coef}x + {b})({m:coef}x² + {n}x + {k})',
    representation: {
      kind: 'functionGraph',
      family: 'polynomial',
      coefficients: ['A', 0, 0, 'B'],
      shows: { zeros: ['z'] },
      marks: ['zeros'],
    },
  }),

  // ── Complex numbers: powers of i and division (N-CN.2, N-CN.3) ──
  page({
    id: 'm.11.complex-numbers~powers-of-i',
    title: 'Powers of i',
    use: 'Use this for “Simplify i²⁷.”',
    assumptions: [
      'The powers of i repeat every 4: i, −1, −i, 1, then i again.',
      'So iⁿ = iʳ, where r is the remainder of n ÷ 4.',
      'On the plane each power of i is a quarter turn more around the unit circle.',
    ],
    variables: [
      W('n', 'n', 'Power of i', 0, 100),
      W('r', 'r', 'Remainder of n ÷ 4', 0, 3),
      // The turn only places the picture's point: the lesson reads the parts from the cycle.
      V('A', 'θ', 'Turn from 1', {
        unit: '°',
        integer: true,
        min: 0,
        max: 270,
        derived: true,
        hidden: true,
      }),
      V('p', 'p', 'Real part', { integer: true, min: -1, max: 1, derived: true }),
      V('q', 'q', 'Imaginary part', { integer: true, min: -1, max: 1, derived: true }),
    ],
    rules: [
      derive(
        'r = n mod 4',
        'r',
        ['n'],
        '{r} = {n} mod 4',
        (v) => v.n! % 4,
        '{n} mod 4',
        'i⁴ = 1, so every 4 factors of i drop out: only the remainder counts.',
        { work: (v) => [`${v.n!} = 4 × ${Math.floor(v.n! / 4)} + ${v.n! % 4}`] },
      ),
      derive(
        'θ = 90r',
        'A',
        ['r'],
        '{A} = 90 × {r}',
        (v) => 90 * v.r!,
        '90 × {r}',
        'Each factor of i turns a quarter turn, 90°, around the unit circle.',
        { hidden: true },
      ),
      derive(
        'p = real part of iʳ',
        'p',
        ['r'],
        '{p} = real part of i^{r}',
        (v) => [1, 0, -1, 0][v.r!],
        'real part of i^{r}',
        'Read it from the cycle i⁰ = 1, i¹ = i, i² = −1, i³ = −i.',
      ),
      derive(
        'q = imaginary part of iʳ',
        'q',
        ['r'],
        '{q} = imaginary part of i^{r}',
        (v) => [0, 1, 0, -1][v.r!],
        'imaginary part of i^{r}',
        'The number of i in the same power.',
        {
          work: (v) => {
            if (v.n === undefined) return [];
            const [n, r, k] = [v.n, v.r!, Math.floor(v.n / 4)];
            const value = ['1', 'i', '−1', '−i'][r]!;
            if (k === 0) return [`i${sup(n)} = ${value}`];
            const turns = `(i⁴)${k === 1 ? '' : sup(k)}`;
            return [
              r === 0
                ? `i${sup(n)} = ${turns} = 1`
                : `i${sup(n)} = ${turns} × i${sup(r)} = 1 × i${sup(r)} = ${value}`,
            ];
          },
        },
      ),
    ],
    example: { n: 27, r: 3, A: 270, p: 0, q: -1 },
    startWith: ['n'],
    pictureLabels: ['n', 'r'],
    representation: {
      kind: 'complexPlane',
      z: { modulus: 1, argument: 'A' },
      polar: true,
      fixed: true,
    },
  }),
  page({
    id: 'm.11.complex-numbers~divide',
    title: 'Divide complex numbers',
    use: 'Use this for “Divide (3 + 4i) ÷ (1 + 2i).”',
    assumptions: [
      'Multiply the top and the bottom by the conjugate of the bottom, c − di.',
      'The bottom becomes (c + di)(c − di) = c² + d², a real number.',
      'Check: the answer times c + di gives back a + bi.',
    ],
    variables: [
      V('a', 'a', 'Real part of the top', { integer: true, min: -10, max: 10 }),
      V('b', 'b', 'Imaginary part of the top', { integer: true, min: -10, max: 10 }),
      V('c', 'c', 'Real part of the bottom', { integer: true, min: -10, max: 10 }),
      V('d', 'd', 'Imaginary part of the bottom', { integer: true, min: -10, max: 10 }),
      V('N', 'N', 'Bottom times its conjugate, c² + d²', {
        integer: true,
        min: 1,
        max: 200,
        derived: true,
      }),
      // The modulus only sizes the picture's circle.
      V('m', 'm', 'Size of the bottom', { min: 0, max: 15, derived: true, hidden: true }),
      V('p', 'p', 'Real part of the answer', { min: -200, max: 200, fraction: 200, derived: true }),
      V('q', 'q', 'Imaginary part of the answer', {
        min: -200,
        max: 200,
        fraction: 200,
        derived: true,
      }),
    ],
    rules: [
      limit(
        'c + di ≠ 0',
        '{c} and {d} are not both 0',
        ['c', 'd'],
        (v) => v.c !== 0 || v.d !== 0,
        'Dividing by 0 has no answer.',
      ),
      derive(
        'N = c² + d²',
        'N',
        ['c', 'd'],
        '{N} = {c}² + {d}²',
        (v) => v.c! ** 2 + v.d! ** 2,
        '{c}² + {d}²',
        'The new bottom: (c + di)(c − di) = c² − d²i² = c² + d², a real number.',
      ),
      derive(
        '|c + di| = √(c² + d²)',
        'm',
        ['c', 'd'],
        '{m} = √({c}² + {d}²)',
        (v) => Math.sqrt(v.c! ** 2 + v.d! ** 2),
        '√({c}² + {d}²)',
        'Its distance from 0 on the plane.',
        { hidden: true },
      ),
      derive(
        'p = (ac + bd) ÷ N',
        'p',
        ['a', 'c', 'b', 'd', 'N'],
        '{p} = ({a} × {c} + {b} × {d}) ÷ {N}',
        (v) => div(v.a! * v.c! + v.b! * v.d!, v.N!),
        '({a} × {c} + {b} × {d}) ÷ {N}',
        'The real part of (a + bi)(c − di) is ac + bd, since −bd × i² = bd.',
        {
          work: (v) => [
            `p = (${fmt(v.a! * v.c!)} + ${par(v.b! * v.d!)}) ÷ ${fmt(v.N!)}`,
            `p = ${fmt(v.a! * v.c! + v.b! * v.d!)} ÷ ${fmt(v.N!)}`,
          ],
        },
      ),
      derive(
        'q = (bc − ad) ÷ N',
        'q',
        ['b', 'c', 'a', 'd', 'N'],
        '{q} = ({b} × {c} − {a} × {d}) ÷ {N}',
        (v) => div(v.b! * v.c! - v.a! * v.d!, v.N!),
        '({b} × {c} − {a} × {d}) ÷ {N}',
        'The imaginary part: bc from bi × c and −ad from a × (−di).',
        {
          work: (v) => {
            const [a, b, c, d, N] = [v.a!, v.b!, v.c!, v.d!, v.N!];
            const show = (x: number) => fr(x, 200);
            return [
              `q = (${fmt(b * c)} − ${par(a * d)}) ÷ ${fmt(N)}`,
              `q = ${fmt(b * c - a * d)} ÷ ${fmt(N)}`,
              `(${cx(a, b)}) ÷ (${cx(c, d)}) = ${cx((a * c + b * d) / N, (b * c - a * d) / N, show)}`,
            ];
          },
        },
      ),
    ],
    example: { a: 3, b: 4, c: 1, d: 2, N: 5, m: Math.sqrt(5), p: 2.2, q: -0.4 },
    startWith: ['a', 'b', 'c', 'd'],
    equation: '{{a} + {b}i}/{{c} + {d}i} = {p} + {q}i',
    representation: {
      kind: 'complexPlane',
      z: { re: 'c', im: 'd' },
      conjugate: true,
      modulus: 'm',
    },
  }),

  // ── Division and the remainder theorem (A-APR.2, A-APR.6) ──
  page({
    id: 'm.11.polynomial-functions~divide',
    title: 'Synthetic division and the remainder theorem',
    use: 'Use this for “Divide 2x³ − 3x² + x − 5 by x − 2” or “Find P(2) by the remainder theorem.”',
    assumptions: [
      'Divide P(x) = ax³ + bx² + cx + d by x − r: bring down a, then multiply by r and add, column by column.',
      'The last sum is the remainder R, and R = P(r) (the remainder theorem).',
      'R = 0 exactly when x − r is a factor (the factor theorem).',
    ],
    variables: [
      V('a', 'a', 'x³ coefficient', { integer: true, min: -10, max: 10 }),
      V('b', 'b', 'x² coefficient', { integer: true, min: -10, max: 10 }),
      V('c', 'c', 'x coefficient', { integer: true, min: -10, max: 10 }),
      V('d', 'd', 'Constant', { integer: true, min: -10, max: 10 }),
      V('r', 'r', 'Divide by x − r', { integer: true, min: -10, max: 10 }),
      V('q2', 'q₂', 'Quotient’s x² coefficient', { min: -10, max: 10, derived: true }),
      V('q1', 'q₁', 'Quotient’s x coefficient', { min: -200, max: 200, derived: true }),
      V('q0', 'q₀', 'Quotient’s constant', { min: -3000, max: 3000, derived: true }),
      V('R', 'R', 'Remainder, P(r)', { min: -40000, max: 40000, derived: true }),
    ],
    rules: [
      limit('a ≠ 0', '{a} is not 0', ['a'], (v) => v.a !== 0, 'With a = 0, P is not a cubic.'),
      derive(
        'q₂ = a',
        'q2',
        ['a'],
        '{q2} = {a}',
        (v) => v.a!,
        '{a}',
        'Bring down the leading coefficient.',
      ),
      derive(
        'q₁ = b + r × q₂',
        'q1',
        ['b', 'r', 'q2'],
        '{q1} = {b} + {r} × {q2}',
        (v) => v.b! + v.r! * v.q2!,
        '{b} + {r} × {q2}',
        'Multiply by r and add to the next coefficient.',
      ),
      derive(
        'q₀ = c + r × q₁',
        'q0',
        ['c', 'r', 'q1'],
        '{q0} = {c} + {r} × {q1}',
        (v) => v.c! + v.r! * v.q1!,
        '{c} + {r} × {q1}',
        'Again: multiply by r and add.',
      ),
      derive(
        'R = d + r × q₀',
        'R',
        ['d', 'r', 'q0'],
        '{R} = {d} + {r} × {q0}',
        (v) => v.d! + v.r! * v.q0!,
        '{d} + {r} × {q0}',
        'The last sum is the remainder, which is P(r).',
        {
          work: (v) => {
            if ([v.a, v.b, v.c, v.d, v.r].some((x) => x === undefined)) return [];
            const [a, b, c, d, r] = [v.a!, v.b!, v.c!, v.d!, v.r!];
            const [q2, q1, q0] = [a, b + r * a, c + r * (b + r * a)];
            const R = d + r * q0;
            const parts = [a * r ** 3, b * r ** 2, c * r, d].filter((x) => x !== 0);
            const sum = parts.length ? terms(parts.map((x) => [x, ''])) : '0';
            // "= R" only after a sum that starts with a positive number: the harness reads
            // a sum of plain numbers from its first digit.
            const plain = parts.length > 1 && parts[0]! > 0;
            return [
              `P(${fmt(r)}) = ${sum}${plain ? ` = ${fmt(R)}` : ''}`,
              `${poly([a, b, c, d])} = (${lin(r)})(${poly([q2, q1, q0])})${
                R === 0 ? '' : ` ${R < 0 ? '−' : '+'} ${fmt(Math.abs(R))}`
              }`,
            ];
          },
          // The grid only while P(r) ≥ 0: the harness can't yet read a written line ending in
          // a negative number (docs/build/m.11.md, shared needs).
          written: (v) =>
            v.R! >= 0 ? syntheticDivision([v.a!, v.b!, v.c!, v.d!], v.r!) : undefined,
        },
      ),
    ],
    example: { a: 2, b: -3, c: 1, d: -5, r: 2, q2: 2, q1: 1, q0: 3, R: 1 },
    startWith: ['a', 'b', 'c', 'd', 'r'],
    equation: 'P({r}) = {R}',
    pictureLabels: ['q2', 'q1', 'q0'],
    representation: {
      kind: 'functionGraph',
      family: 'polynomial',
      coefficients: ['a', 'b', 'c', 'd'],
      name: 'P',
      at: { x: 'r', y: 'R' },
      marks: ['zeros'],
    },
  }),

  page({
    id: 'm.11.polynomial-functions~long-division',
    title: 'Divide by a quadratic',
    use: 'Use this for “Divide x³ + 2x² − 5x + 7 by x² − x + 2.”',
    assumptions: [
      'Divide the leading terms, multiply the divisor by the result, subtract, and repeat, as in long division of numbers.',
      'Stop when what is left has a lower degree than the divisor, x² + px + q: that is the remainder.',
      'Check: divisor × quotient + remainder gives back P(x).',
    ],
    variables: [
      V('a', 'a', 'x³ coefficient', { integer: true, min: -10, max: 10 }),
      V('b', 'b', 'x² coefficient', { integer: true, min: -10, max: 10 }),
      V('c', 'c', 'x coefficient', { integer: true, min: -10, max: 10 }),
      V('d', 'd', 'Constant', { integer: true, min: -10, max: 10 }),
      V('p', 'p', 'x coefficient of the divisor', { integer: true, min: -10, max: 10 }),
      V('q', 'q', 'Constant of the divisor', { integer: true, min: -10, max: 10 }),
      V('A', 'A', 'Quotient’s x coefficient', { min: -10, max: 10, derived: true }),
      V('B', 'B', 'Quotient’s constant', { min: -200, max: 200, derived: true }),
      V('C', 'C', 'Remainder’s x coefficient', { min: -3000, max: 3000, derived: true }),
      V('D', 'D', 'Remainder’s constant', { min: -3000, max: 3000, derived: true }),
    ],
    rules: [
      limit('a ≠ 0', '{a} is not 0', ['a'], (v) => v.a !== 0, 'With a = 0, P is not a cubic.'),
      derive(
        'A = a',
        'A',
        ['a'],
        '{A} = {a}',
        (v) => v.a!,
        '{a}',
        'Divide the leading terms: ax³ ÷ x² = ax.',
        { work: (v) => [`${terms([[v.a!, 'x³']])} ÷ x² = ${terms([[v.a!, 'x']])}`] },
      ),
      derive(
        'B = b − p × A',
        'B',
        ['b', 'p', 'A'],
        '{B} = {b} − {p} × {A}',
        (v) => v.b! - v.p! * v.A!,
        '{b} − {p} × {A}',
        'Take Ax(x² + px + q) away: the x² term left, divided by x², is B.',
        {
          work: (v) =>
            [v.a, v.c, v.d, v.q].some((x) => x === undefined)
              ? []
              : [
                  `${poly([v.a!, v.b!, v.c!, v.d!])} − ${terms([[v.A!, 'x']])}(${poly([1, v.p!, v.q!])}) = ${poly(
                    [v.b! - v.p! * v.A!, v.c! - v.q! * v.A!, v.d!],
                  )}`,
                ],
        },
      ),
      derive(
        'C = c − q × A − p × B',
        'C',
        ['c', 'q', 'A', 'p', 'B'],
        '{C} = {c} − {q} × {A} − {p} × {B}',
        (v) => v.c! - v.q! * v.A! - v.p! * v.B!,
        '{c} − {q} × {A} − {p} × {B}',
        'Take B(x² + px + q) away too: the x term left belongs to the remainder.',
      ),
      derive(
        'D = d − q × B',
        'D',
        ['d', 'q', 'B'],
        '{D} = {d} − {q} × {B}',
        (v) => v.d! - v.q! * v.B!,
        '{d} − {q} × {B}',
        'The constant left after both subtractions.',
        {
          work: (v) => {
            if ([v.a, v.b, v.c, v.p, v.A, v.C].some((x) => x === undefined)) return [];
            const R = poly([v.C!, v.d! - v.q! * v.B!]);
            return [
              `${poly([v.a!, v.b!, v.c!, v.d!])} = (${poly([1, v.p!, v.q!])})(${poly([v.A!, v.B!])})${
                R === '0' ? '' : ` + (${R})`
              }`,
            ];
          },
        },
      ),
    ],
    example: { a: 1, b: 2, c: -5, d: 7, p: -1, q: 2, A: 1, B: 3, C: -4, D: 1 },
    startWith: ['a', 'b', 'c', 'd', 'p', 'q'],
    equation: '({a}x³ + {b}x² + {c}x + {d}) ÷ (x² + {p}x + {q})',
    representation: {
      kind: 'functionGraph',
      family: 'polynomial',
      coefficients: ['a', 'b', 'c', 'd'],
      name: 'P',
      other: { family: 'quadratic', form: 'standard', a: 1, b: 'p', c: 'q', name: 'g' },
      marks: ['zeros'],
    },
  }),

  // ── Rational roots and the fundamental theorem of algebra (A-APR.3, N-CN.9) ──
  page({
    id: 'm.11.polynomial-equations',
    assumptions: [
      'Any rational root is ±(a factor of d) ÷ (a factor of a): test these candidates as r.',
      'Synthetic division by x − r leaves remainder 0 exactly when r is a root.',
      'The quotient is a quadratic, qx² + q₁x + q₀ with q = a, which the quadratic formula finishes.',
    ],
    variables: [
      V('a', 'a', 'x³ coefficient', { min: -20, max: 20, step: 1 }),
      V('b', 'b', 'x² coefficient', { min: -20, max: 20, step: 1 }),
      V('c', 'c', 'x coefficient', { min: -20, max: 20, step: 1 }),
      V('d', 'd', 'Constant', { min: -20, max: 20, step: 1 }),
      V('r', 'r', 'Root tested', { min: -20, max: 20, step: 0.5, fraction: 12 }),
      V('q1', 'q₁', 'Quotient’s x coefficient', {
        min: -1000,
        max: 1000,
        fraction: 12,
        derived: true,
      }),
      V('q0', 'q₀', 'Quotient’s constant', { min: -1e5, max: 1e5, fraction: 12, derived: true }),
      V('R', 'R', 'Remainder', { min: -1e6, max: 1e6, fraction: 12, derived: true }),
      V('x2', 'x₂', 'Larger other root', {
        min: -1000,
        max: 1000,
        fraction: 12,
        derived: true,
        exact: quotientRoot(1),
      }),
      V('x3', 'x₃', 'Smaller other root', {
        min: -1000,
        max: 1000,
        fraction: 12,
        derived: true,
        exact: quotientRoot(-1),
      }),
      V('z', 'z', 'Root found', { min: -20, max: 20, derived: true, hidden: true }),
    ],
    rules: [
      limit(
        'a ≠ 0',
        '{a} is not 0',
        ['a'],
        (v) => v.a !== 0,
        'With a = 0 the equation is not a cubic.',
      ),
      limit(
        'q₁² − 4aq₀ ≥ 0',
        '{q1}² − 4 × {a} × {q0} is 0 or more, or {R} is not 0',
        ['q1', 'a', 'q0', 'R'],
        (v) => Math.abs(v.R!) > 1e-9 || v.q1! ** 2 - 4 * v.a! * v.q0! >= -1e-9,
        'The other two roots are complex: see “A polynomial from its zeros”.',
      ),
      derive(
        'q₁ = b + r × a',
        'q1',
        ['b', 'r', 'a'],
        '{q1} = {b} + {r} × {a}',
        (v) => v.b! + v.r! * v.a!,
        '{b} + {r} × {a}',
        'Bring down a, multiply by r and add to b.',
        { work: (v) => (v.d === undefined ? [] : [rationalCandidates(v.a!, v.d, v.r!)]) },
      ),
      derive(
        'q₀ = c + r × q₁',
        'q0',
        ['c', 'r', 'q1'],
        '{q0} = {c} + {r} × {q1}',
        (v) => v.c! + v.r! * v.q1!,
        '{c} + {r} × {q1}',
        'Multiply by r and add to c.',
      ),
      derive(
        'R = d + r × q₀',
        'R',
        ['d', 'r', 'q0'],
        '{R} = {d} + {r} × {q0}',
        (v) => v.d! + v.r! * v.q0!,
        '{d} + {r} × {q0}',
        (v) =>
          Math.abs(v.R!) < 1e-9
            ? 'The last sum is the remainder: 0 means x − r is a factor.'
            : 'R is not 0: r is not a root; try another candidate.',
        {
          // The grid only while P(r) ≥ 0, as on ~divide (docs/build/m.11.md, shared needs).
          written: (v) =>
            v.R! >= 0 ? syntheticDivision([v.a!, v.b!, v.c!, v.d!], v.r!) : undefined,
        },
      ),
      // The root the picture marks: r itself, once it is one (R = 0).
      derive(
        'z = r when R = 0',
        'z',
        ['r', 'R'],
        '{z} = {r} when {R} = 0',
        (v) => (Math.abs(v.R!) < 1e-9 ? v.r! : undefined),
        '{r}',
        'r is a root.',
        { hidden: true },
      ),
      // The other roots come from the quotient only once r is a root (R = 0).
      derive(
        'x₂ = (−q₁ + √(q₁² − 4aq₀)) ÷ (2a)',
        'x2',
        ['q1', 'a', 'q0', 'R'],
        '{x2} = (−{q1} + √({q1}² − 4 × {a} × {q0})) ÷ (2 × {a}), when {R} = 0',
        (v) => (Math.abs(v.R!) < 1e-9 ? rootOf(v.a!, v.q1!, v.q0!, 1) : undefined),
        '(−{q1} + √({q1}² − 4 × {a} × {q0})) ÷ (2 × {a})',
        'The quadratic formula on the quotient, with the plus sign.',
        {
          check: (v) =>
            `${quotientRoot(1)(v) ?? fr(v.x2!)} = ${quadWork(v.a!, v.q1!, v.q0!, 1)[0]}`,
          work: (v) => quadWork(v.a!, v.q1!, v.q0!, 1).map((l) => `x₂ = ${l}`),
        },
      ),
      derive(
        'x₃ = (−q₁ − √(q₁² − 4aq₀)) ÷ (2a)',
        'x3',
        ['q1', 'a', 'q0', 'R'],
        '{x3} = (−{q1} − √({q1}² − 4 × {a} × {q0})) ÷ (2 × {a}), when {R} = 0',
        (v) => (Math.abs(v.R!) < 1e-9 ? rootOf(v.a!, v.q1!, v.q0!, -1) : undefined),
        '(−{q1} − √({q1}² − 4 × {a} × {q0})) ÷ (2 × {a})',
        'The same formula with the minus sign.',
        {
          check: (v) =>
            `${quotientRoot(-1)(v) ?? fr(v.x3!)} = ${quadWork(v.a!, v.q1!, v.q0!, -1)[0]}`,
          work: (v) => {
            const [a, q1, q0, r] = [v.a!, v.q1!, v.q0!, v.r!];
            // The roots written exactly: x = 3, (−3 + √17)/4, (−3 − √17)/4.
            const roots = [
              fr(r),
              quadraticRoot(a, q1, q0, 1) ?? fr(rootOf(a, q1, q0, 1)!),
              quadraticRoot(a, q1, q0, -1) ?? fr(rootOf(a, q1, q0, -1)!),
            ];
            return [
              ...quadWork(a, q1, q0, -1).map((l) => `x₃ = ${l}`),
              `(${lin(r, fr)})(${poly([a, q1, q0], fr)}) = 0; x = ${[...new Set(roots)].join(', ')}`,
            ];
          },
        },
      ),
    ],
    example: { a: 2, b: -3, c: -11, d: 6, r: 3, q1: 3, q0: -2, R: 0, x2: 0.5, x3: -2, z: 3 },
    startWith: ['a', 'b', 'c', 'd', 'r'],
    equation: '{a}x³ + {b}x² + {c}x + {d} = 0',
    pictureLabels: ['q1', 'q0', 'R'],
    representation: {
      kind: 'functionGraph',
      family: 'polynomial',
      coefficients: ['a', 'b', 'c', 'd'],
      shows: { zeros: ['z', 'x2', 'x3'] },
      at: { x: 'r', y: 'R' },
      marks: ['zeros'],
    },
  }),

  // ── The unit circle and radian measure (F-TF.1, F-TF.2) ──
  page({
    id: 'm.11.unit-circle',
    assumptions: [
      'The point at angle θ is (cos θ, sin θ), because the radius is 1.',
      'The reference angle and the quadrant give the value and its sign.',
      'One turn is 2π radians, 360°.',
    ],
    variables: [
      V('t', 'θ', 'Angle (radians)', { pi: 'fraction', min: -4 * PI, max: 4 * PI, step: PI / 12 }),
      V('d', 'θ°', 'Angle in degrees', { min: -720, max: 720, derived: true }),
      V('x', 'x', 'cos θ', { min: -1, max: 1, fraction: 12, derived: true, exact: true }),
      V('y', 'y', 'sin θ', { min: -1, max: 1, fraction: 12, derived: true, exact: true }),
      V('m', 'm', 'Tangent, tan θ (the slope y ÷ x)', {
        min: -1e6,
        max: 1e6,
        fraction: 12,
        derived: true,
        exact: true,
      }),
    ],
    rules: [
      limit(
        'cos θ ≠ 0',
        'cos({t}) is not 0',
        ['t'],
        (v) => Math.abs(Math.cos(v.t!)) > 1e-9,
        'At π/2 and 3π/2 the point is on the y-axis: x = 0, so tan θ = y ÷ x has no value.',
      ),
      derive(
        'θ° = 180θ ÷ π',
        'd',
        ['t'],
        '{d} = 180 × {t} ÷ π',
        (v) => (180 * v.t!) / PI,
        '180 × {t} ÷ π',
        'π radians is 180°.',
      ),
      derive(
        'x = cos θ',
        'x',
        ['t'],
        '{x} = cos({t})',
        (v) => Math.cos(v.t!),
        'cos({t})',
        'The across part of the point on the circle.',
      ),
      derive(
        'y = sin θ',
        'y',
        ['t'],
        '{y} = sin({t})',
        (v) => Math.sin(v.t!),
        'sin({t})',
        'The up part of the point on the circle.',
      ),
      derive(
        'tan θ = y ÷ x',
        'm',
        ['y', 'x'],
        '{m} = {y} ÷ {x}',
        (v) => div(v.y!, v.x!),
        '{y} ÷ {x}',
        'The tangent is the sine over the cosine: rise over run.',
      ),
    ],
    example: {
      t: (5 * PI) / 6,
      d: 150,
      x: Math.cos((5 * PI) / 6),
      y: 0.5,
      m: Math.tan((5 * PI) / 6),
    },
    startWith: ['t'],
    representation: {
      kind: 'unitCircle',
      angle: 't',
      measure: 'radians',
      cos: 'x',
      sin: 'y',
      tan: 'm',
    },
  }),
  page({
    id: 'm.11.unit-circle~convert',
    title: 'Degrees and radians',
    use: 'Use this for “Convert 225° to radians” or “Convert 7π/6 to degrees.”',
    assumptions: [
      '180° = π radians, so d° is d/180 of π; write the fraction in lowest terms.',
      'One radian is the angle whose arc equals the radius.',
      'Going back, pπ/q is p × (180 ÷ q) degrees: 7π/6 = 7 × 30° = 210°.',
    ],
    variables: [
      V('d', 'd', 'Angle in degrees', { unit: '°', integer: true, min: -720, max: 720 }),
      W('g', 'g', 'Greatest common factor of d and 180', 1, 180),
      W('p', 'p', 'Top of the fraction of π', -720, 720),
      W('q', 'q', 'Bottom of the fraction of π', 1, 180),
    ],
    rules: [
      rule(
        'g = GCF(d, 180)',
        '{g} = GCF({d}, 180)',
        ['g', 'd'],
        (v) => v.g! - gcd(v.d!, 180),
        {
          g: [
            (v) => gcd(v.d!, 180),
            'GCF({d}, 180)',
            'd° is d/180 of π: the greatest common factor puts d/180 in lowest terms.',
          ],
          d: [() => undefined],
        },
        {
          message: (v) =>
            v.g !== undefined && v.d !== undefined && v.g !== gcd(v.d, 180)
              ? 'Write p/q in lowest terms, with q a factor of 180.'
              : undefined,
          work: { g: (v) => [`${fmt(v.d!)} × π/180 = ${fmt(v.d!)}π/180`] },
        },
      ),
      rule(
        'p = d ÷ g',
        '{p} = {d} ÷ {g}',
        ['p', 'd', 'g'],
        (v) => v.p! * v.g! - v.d!,
        {
          p: [(v) => fin(div(v.d!, v.g!)), '{d} ÷ {g}', 'Divide the top, d, by the common factor.'],
          d: [(v) => exact(v.p! * v.g!), '{p} × {g}', 'Each 1/q of π is g degrees.'],
          g: [() => undefined],
        },
        {
          work: {
            d: (v) => [
              `${piOver(v.p!, 180 / v.g!)} = ${fmt(v.p!)} × ${fmt(v.g!)}° = ${fmt(v.p! * v.g!)}°`,
            ],
          },
        },
      ),
      rule(
        'q = 180 ÷ g',
        '{q} = 180 ÷ {g}',
        ['q', 'g'],
        (v) => v.q! * v.g! - 180,
        {
          q: [
            (v) => fin(div(180, v.g!)),
            '180 ÷ {g}',
            'Divide the bottom, 180, by the common factor.',
          ],
          g: [(v) => fin(div(180, v.q!)), '180 ÷ {q}', 'π/q is 180 ÷ q degrees.'],
        },
        {
          work: {
            q: (v) =>
              v.d === undefined
                ? []
                : [`${fmt(v.d)}° = ${fmt(v.d)}π/180 = ${piOver(v.d / v.g!, 180 / v.g!)}`],
          },
        },
      ),
    ],
    example: { d: 225, g: 45, p: 5, q: 4 },
    startWith: ['d'],
    equation: '{d}° = {p}/{q}π',
    representation: { kind: 'unitCircle', angle: 'd', show: 'radians', fixed: true },
  }),
  page({
    id: 'm.11.unit-circle~coterminal',
    title: 'Coterminal and reference angles',
    use: 'Use this for “Find the coterminal angle of −495° from 0° to 360°, its quadrant and its reference angle.”',
    assumptions: [
      'Adding or taking away whole turns of 360° ends on the same side: a coterminal angle.',
      'The reference angle is the acute angle to the x-axis; the quadrant gives the signs.',
      'An angle on an axis (a multiple of 90°) lies between quadrants: it has no quadrant or reference angle.',
    ],
    variables: [
      V('d', 'θ', 'Angle', { unit: '°', min: -1080, max: 1080, step: 1 }),
      V('c', 'c', 'Coterminal angle from 0° to 360°', {
        unit: '°',
        min: 0,
        max: 360,
        derived: true,
      }),
      V('Q', 'Q', 'Quadrant', { integer: true, min: 1, max: 4, derived: true }),
      V('R', 'R', 'Reference angle', { unit: '°', min: 0, max: 90, derived: true }),
    ],
    rules: [
      derive(
        'c = θ + 360k',
        'c',
        ['d'],
        '{c} = {d} + 360k, with k whole, from 0° up to 360°',
        (v) => v.d! - 360 * Math.floor(v.d! / 360),
        (v) => {
          const k = -Math.floor(v.d! / 360);
          return k === 0 ? '{d}' : `{d} ${k > 0 ? '+' : '−'} ${Math.abs(k)} × 360`;
        },
        (v) =>
          Math.floor(v.d! / 360) === 0
            ? 'The angle is already from 0° to 360°.'
            : 'Add or take away whole turns of 360° until the angle is from 0° to 360°.',
        {
          check: (v) => {
            const k = -Math.floor(v.d! / 360);
            return `${fmt(v.c!)} = ${fmt(v.d!)}${k === 0 ? '' : ` ${k > 0 ? '+' : '−'} ${Math.abs(k)} × 360`}`;
          },
        },
      ),
      derive(
        'Q = ⌊c ÷ 90⌋ + 1',
        'Q',
        ['c'],
        '{Q} = ⌊{c} ÷ 90⌋ + 1',
        (v) => (onAxis(v.c!) ? undefined : Math.floor(v.c! / 90) + 1),
        '⌊{c} ÷ 90⌋ + 1',
        (v) => {
          const q = Math.floor(v.c! / 90);
          return `${fmt(v.c!)}° is between ${90 * q}° and ${90 * q + 90}°: quadrant ${['I', 'II', 'III', 'IV'][q]}.`;
        },
        { message: (v) => (v.c !== undefined && onAxis(v.c) ? ON_AXIS : undefined) },
      ),
      derive(
        'R = reference angle of c',
        'R',
        ['c', 'Q'],
        '{R} = reference angle of {c} in quadrant {Q}',
        (v) => [v.c!, 180 - v.c!, v.c! - 180, 360 - v.c!][v.Q! - 1],
        (v) => ['{c}', '180 − {c}', '{c} − 180', '360 − {c}'][v.Q! - 1]!,
        (v) =>
          [
            'In quadrant I the angle is its own reference angle.',
            'In quadrant II, measure back to 180°.',
            'In quadrant III, measure past 180°.',
            'In quadrant IV, measure on to 360°.',
          ][v.Q! - 1]!,
        {
          check: (v) =>
            `${fmt(v.R!)} = ${[fmt(v.c!), `180 − ${fmt(v.c!)}`, `${fmt(v.c!)} − 180`, `360 − ${fmt(v.c!)}`][v.Q! - 1]}`,
        },
      ),
    ],
    example: { d: -495, c: 225, Q: 3, R: 45 },
    startWith: ['d'],
    pictureLabels: ['c', 'Q', 'R'],
    representation: { kind: 'unitCircle', angle: 'd' },
  }),
  page({
    id: 'm.11.unit-circle~point-on-side',
    title: 'A point on the terminal side',
    use: 'Use this for “(−3, 4) is on the terminal side of θ. Find sin θ, cos θ and tan θ.”',
    assumptions: [
      'The point (x, y) is r = √(x² + y²) from the origin, on the ray that ends θ.',
      'Scaled by 1/r it lands on the unit circle, at (x/r, y/r) = (cos θ, sin θ).',
      'So sin θ = y/r, cos θ = x/r and tan θ = y/x; the signs of x and y set the quadrant.',
    ],
    variables: [
      V('x', 'x', 'x of the point', { min: -20, max: 20, step: 0.5 }),
      V('y', 'y', 'y of the point', { min: -20, max: 20, step: 0.5 }),
      POINT_R,
      POINT_SIN,
      POINT_COS,
      V('t', 'tan θ', 'tan θ', { min: -1000, max: 1000, derived: true, fraction: 100 }),
    ],
    rules: [
      limit(
        'not (0, 0)',
        '({x}, {y}) is not (0, 0)',
        ['x', 'y'],
        (v) => v.x !== 0 || v.y !== 0,
        'The origin is on every ray, so it names no angle: pick another point.',
      ),
      derive(
        'r = √(x² + y²)',
        'r',
        ['x', 'y'],
        '{r} = √({x}² + {y}²)',
        (v) => Math.hypot(v.x!, v.y!),
        '√({x}² + {y}²)',
        'The distance from the origin, by the Pythagorean theorem.',
      ),
      derive(
        'sin θ = y ÷ r',
        's',
        ['y', 'r'],
        '{s} = {y} ÷ {r}',
        (v) => (v.r ? v.y! / v.r : undefined),
        (v) => (overRoot(v.r!) ? '{y} ÷ ({r})' : '{y} ÷ {r}'),
        'The y of the unit point: the point scaled by 1/r.',
        { check: (v) => `${formatNumber(v.s!, POINT_SIN)} = ${overR(v.y!, v.r!)}` },
      ),
      derive(
        'cos θ = x ÷ r',
        'c',
        ['x', 'r'],
        '{c} = {x} ÷ {r}',
        (v) => (v.r ? v.x! / v.r : undefined),
        (v) => (overRoot(v.r!) ? '{x} ÷ ({r})' : '{x} ÷ {r}'),
        'The x of the unit point.',
        { check: (v) => `${formatNumber(v.c!, POINT_COS)} = ${overR(v.x!, v.r!)}` },
      ),
      derive(
        'tan θ = y ÷ x',
        't',
        ['y', 'x'],
        '{t} = {y} ÷ {x}',
        (v) => (v.x ? v.y! / v.x : undefined),
        '{y} ÷ {x}',
        'Rise over run along the ray; with x = 0 the ray is upright and tan θ has no value.',
      ),
    ],
    example: { x: -3, y: 4, r: 5, s: 0.8, c: -0.6, t: -4 / 3 },
    startWith: ['x', 'y'],
    representation: {
      kind: 'unitCircle',
      angle: 0,
      through: { x: 'x', y: 'y', r: 'r' },
      sin: 's',
      cos: 'c',
      tan: 't',
      fixed: true,
    },
  }),

  // ── Graphs of sine, cosine and tangent (F-IF.7e, F-TF.5) ──
  page({
    id: 'm.11.trig-graphs',
    assumptions: [
      'The midline is y = k; the graph rises and falls A = |a| above and below it.',
      'b fits b cycles into every 2π, so the period is P = 2π ÷ b.',
      'h slides the start of the cycle to x = h; x is in radians.',
    ],
    variables: [
      V('a', 'a', 'Vertical factor', { min: -10, max: 10, step: 0.5 }),
      V('b', 'b', 'Cycles in 2π', { min: 0.25, max: 6, step: 0.25 }),
      V('h', 'h', 'Shift right', { pi: 'fraction', min: -2 * PI, max: 2 * PI, step: PI / 12 }),
      V('k', 'k', 'Midline', { min: -10, max: 10, step: 0.5 }),
      V('A', 'A', 'Amplitude', { min: 0, max: 10, derived: true }),
      V('P', 'P', 'Period', { pi: true, min: 0, max: 8 * PI, derived: true }),
      V('x', 'x', 'Input (radians)', { pi: 'fraction', min: -20, max: 20, step: PI / 12 }),
      V('y', 'y', 'Output', { min: -30, max: 30, derived: true }),
    ],
    rules: [
      limit(
        'a ≠ 0',
        '{a} is not 0',
        ['a'],
        (v) => v.a !== 0,
        'With a = 0 the graph is the flat line y = k.',
      ),
      derive(
        'A = |a|',
        'A',
        ['a'],
        '{A} = |{a}|',
        (v) => Math.abs(v.a!),
        '|{a}|',
        'The amplitude is a distance, so it is never negative.',
      ),
      derive(
        'P = 2π ÷ b',
        'P',
        ['b'],
        '{P} = 2π ÷ {b}',
        (v) => (2 * PI) / v.b!,
        '2π ÷ {b}',
        'One full turn, 2π, shared among b cycles.',
      ),
      derive(
        'y = a sin(b(x − h)) + k',
        'y',
        ['a', 'b', 'x', 'h', 'k'],
        '{y} = {a} × sin({b} × ({x} − {h})) + {k}',
        (v) => v.a! * Math.sin(v.b! * (v.x! - v.h!)) + v.k!,
        '{a} × sin({b} × ({x} − {h})) + {k}',
        'Shift x by h, multiply by b, take the sine, stretch by a, then add k.',
        {
          work: (v) => {
            const t = v.b! * (v.x! - v.h!);
            const sin = tidy(Math.sin(t));
            return [
              `y = ${fmt(v.a!)} × sin(${radians(t)}) + ${par(v.k!)}`,
              `y = ${fmt(v.a!)} × ${par(sin)} + ${par(v.k!)}`,
            ];
          },
        },
      ),
    ],
    example: {
      a: 3,
      b: 2,
      h: PI / 4,
      k: 1,
      A: 3,
      P: PI,
      x: PI / 2,
      y: 4,
    },
    startWith: ['a', 'b', 'h', 'k', 'x'],
    representation: {
      kind: 'functionGraph',
      family: 'sin',
      a: 'a',
      b: 'b',
      h: 'h',
      k: 'k',
      at: { x: 'x', y: 'y' },
      shows: { amplitude: 'A', period: 'P' },
      marks: ['amplitude', 'period', 'midline', 'extrema'],
    },
  }),
  page({
    id: 'm.11.trig-graphs~from-features',
    title: 'The equation from the graph’s features',
    use: 'Use this for “Write a cosine with amplitude 4, period π/2 and midline y = −1.”',
    assumptions: [
      'y = A cos(bx) + k starts a cycle at its top when x = 0.',
      'The period P is 2π ÷ b, so b = 2π ÷ P.',
      'A is the height above the midline y = k.',
    ],
    variables: [
      V('A', 'A', 'Amplitude', { min: 0.1, max: 20, step: 0.5 }),
      V('P', 'P', 'Period', { pi: 'fraction', min: PI / 12, max: 8 * PI, step: PI / 12 }),
      V('k', 'k', 'Midline', { min: -20, max: 20, step: 0.5 }),
      V('b', 'b', 'Cycles in 2π', { min: 0.25, max: 24, fraction: 12, derived: true }),
      V('x', 'x', 'Input (radians)', { pi: 'fraction', min: -20, max: 20, step: PI / 12 }),
      V('y', 'y', 'Output', { min: -50, max: 50, derived: true }),
    ],
    rules: [
      derive(
        'b = 2π ÷ P',
        'b',
        ['P'],
        '{b} = 2π ÷ ({P})',
        (v) => (2 * PI) / v.P!,
        '2π ÷ ({P})',
        'One turn, 2π, holds b periods.',
      ),
      derive(
        'y = A cos(bx) + k',
        'y',
        ['A', 'b', 'x', 'k'],
        '{y} = {A} × cos({b} × {x}) + {k}',
        (v) => v.A! * Math.cos(v.b! * v.x!) + v.k!,
        '{A} × cos({b} × {x}) + {k}',
        'Check a point: multiply x by b, take the cosine, stretch by A and add k.',
        {
          work: (v) => {
            const q = ratioOf(v.b!);
            const bx =
              v.b === 1
                ? 'x'
                : q && q[1] !== 1
                  ? `${q[0] === 1 ? '' : q[0]}x/${q[1]}`
                  : `${fmt(v.b!)}x`;
            const A = v.A === 1 ? '' : `${fmt(v.A!)} `;
            const k = v.k === 0 ? '' : ` ${v.k! < 0 ? '−' : '+'} ${fmt(Math.abs(v.k!))}`;
            return [`The equation: y = ${A}cos(${bx})${k}`];
          },
        },
      ),
    ],
    example: { A: 4, P: PI / 2, k: -1, b: 4, x: 0, y: 3 },
    startWith: ['A', 'P', 'k', 'x'],
    representation: {
      kind: 'functionGraph',
      family: 'cos',
      a: 'A',
      b: 'b',
      k: 'k',
      at: { x: 'x', y: 'y' },
      shows: { amplitude: 'A', period: 'P' },
      marks: ['amplitude', 'period', 'midline'],
    },
  }),
  page({
    id: 'm.11.trig-graphs~tangent',
    title: 'Graph of tangent',
    use: 'Use this for “Find the period and asymptotes of y = 2 tan(x/2).”',
    assumptions: [
      'tan x repeats every π, so y = a tan(bx) has period P = π ÷ b.',
      'It has no value where cos(bx) = 0: asymptotes at x = π ÷ (2b), then every period.',
      'x is in radians.',
    ],
    variables: [
      V('a', 'a', 'Vertical factor', { min: -10, max: 10, step: 0.5 }),
      V('b', 'b', 'Frequency', { min: 0.25, max: 4, step: 0.25 }),
      V('P', 'P', 'Period', { pi: true, min: 0, max: 4 * PI, derived: true }),
      V('Va', 'V', 'First asymptote right of 0', {
        pi: true,
        min: 0,
        max: 2 * PI,
        derived: true,
      }),
      V('x', 'x', 'Input (radians)', { pi: 'fraction', min: -20, max: 20, step: PI / 12 }),
      V('y', 'y', 'Output', { min: -1e6, max: 1e6, derived: true }),
    ],
    rules: [
      limit(
        'a ≠ 0',
        '{a} is not 0',
        ['a'],
        (v) => v.a !== 0,
        'With a = 0 the graph is the flat line y = 0: it has no asymptotes.',
      ),
      limit(
        'cos(bx) ≠ 0',
        'cos({b} × {x}) is not 0',
        ['b', 'x'],
        (v) => Math.abs(Math.cos(v.b! * v.x!)) > 1e-9,
        'x is on an asymptote: tangent has no value there.',
      ),
      derive(
        'P = π ÷ b',
        'P',
        ['b'],
        '{P} = π ÷ {b}',
        (v) => PI / v.b!,
        'π ÷ {b}',
        'Tangent repeats every π; b squeezes that by b.',
      ),
      derive(
        'V = π ÷ (2b)',
        'Va',
        ['b'],
        '{Va} = π ÷ (2 × {b})',
        (v) => PI / (2 * v.b!),
        'π ÷ (2 × {b})',
        (v) =>
          `cos(bx) = 0 first at bx = π/2. Then every period: x = ${formatNumber(PI / (2 * v.b!), { pi: true })} + ${formatNumber(PI / v.b!, { pi: true })}n for every whole number n.`,
      ),
      derive(
        'y = a tan(bx)',
        'y',
        ['a', 'b', 'x'],
        '{y} = {a} × tan({b} × {x})',
        (v) => v.a! * Math.tan(v.b! * v.x!),
        '{a} × tan({b} × {x})',
        'Multiply x by b, take the tangent, then stretch by a.',
      ),
    ],
    example: { a: 2, b: 0.5, P: 2 * PI, Va: PI, x: PI / 2, y: 2 },
    startWith: ['a', 'b', 'x'],
    representation: {
      kind: 'functionGraph',
      family: 'tan',
      a: 'a',
      b: 'b',
      at: { x: 'x', y: 'y' },
      shows: { period: 'P', va: 'Va' },
      marks: ['asymptotes', 'period'],
    },
  }),
  page({
    id: 'm.11.trig-graphs~model',
    title: 'Model a turning wheel',
    use: 'Use this for “A Ferris wheel is 42 m at the top, 2 m at the bottom and turns once in 8 min. How high is a rider after 2 min?”',
    assumptions: [
      'The rider starts at the bottom, so h = k − A cos(Bt): the cosine flipped.',
      'The midline k is halfway between top and bottom; A is half the distance between them.',
      'One turn takes T minutes, so B = 2π ÷ T; the top comes at H = T ÷ 2.',
    ],
    variables: [
      V('top', 'top', 'Top height', { min: 0, max: 200, step: 1 }),
      V('bot', 'bottom', 'Bottom height', { min: 0, max: 200, step: 1 }),
      V('T', 'T', 'Minutes per turn', { min: 0.5, max: 60, step: 0.5 }),
      V('A', 'A', 'Amplitude', { min: 0, max: 100, derived: true }),
      V('k', 'k', 'Midline height', { min: 0, max: 200, derived: true }),
      V('B', 'B', 'Radians per minute', { pi: true, min: 0, max: 13, derived: true }),
      V('H', 'H', 'Minutes to the top', { min: 0, max: 30, derived: true }),
      V('t', 't', 'Time in minutes', { min: 0, max: 120, step: 0.5 }),
      V('y', 'h', 'Height', { min: 0, max: 200, derived: true }),
    ],
    rules: [
      limit(
        'top > bottom',
        '{top} is more than {bot}',
        ['top', 'bot'],
        (v) => v.top! > v.bot!,
        'The top of the wheel must be higher than the bottom.',
      ),
      derive(
        'A = (top − bottom) ÷ 2',
        'A',
        ['top', 'bot'],
        '{A} = ({top} − {bot}) ÷ 2',
        (v) => (v.top! - v.bot!) / 2,
        '({top} − {bot}) ÷ 2',
        'The radius: half the distance from bottom to top.',
      ),
      derive(
        'k = (top + bottom) ÷ 2',
        'k',
        ['top', 'bot'],
        '{k} = ({top} + {bot}) ÷ 2',
        (v) => (v.top! + v.bot!) / 2,
        '({top} + {bot}) ÷ 2',
        'The height of the center: halfway.',
      ),
      derive(
        'B = 2π ÷ T',
        'B',
        ['T'],
        '{B} = 2π ÷ {T}',
        (v) => (2 * PI) / v.T!,
        '2π ÷ {T}',
        'One turn is 2π radians in T minutes.',
      ),
      derive(
        'H = T ÷ 2',
        'H',
        ['T'],
        '{H} = {T} ÷ 2',
        (v) => v.T! / 2,
        '{T} ÷ 2',
        'Half a turn from the bottom is the top.',
      ),
      derive(
        'h = k − A cos(Bt)',
        'y',
        ['k', 'A', 'B', 't'],
        '{y} = {k} − {A} × cos({B} × {t})',
        (v) => v.k! - v.A! * Math.cos(v.B! * v.t!),
        '{k} − {A} × cos({B} × {t})',
        'At t = 0 the cosine is 1, so the rider starts at k − A, the bottom.',
        {
          work: (v) => {
            const t = v.B! * v.t!;
            return [
              `h = ${fmt(v.k!)} − ${fmt(v.A!)} × cos(${radians(t)})`,
              `h = ${fmt(v.k!)} − ${fmt(v.A!)} × ${par(tidy(Math.cos(t)))}`,
            ];
          },
        },
      ),
    ],
    example: { top: 42, bot: 2, T: 8, A: 20, k: 22, B: PI / 4, H: 4, t: 2, y: 22 },
    startWith: ['top', 'bot', 'T', 't'],
    representation: {
      kind: 'functionGraph',
      family: 'cos',
      a: 'A',
      b: 'B',
      h: 'H',
      k: 'k',
      at: { x: 't', y: 'y' },
      axes: { x: 'Time t (min)', y: 'Height h (m)' },
      xMin: 0,
      marks: ['midline', 'amplitude', 'period'],
    },
  }),

  // ── Pythagorean trigonometric identities (F-TF.8) ──
  page({
    id: 'm.11.pythagorean-identities',
    assumptions: [
      'The point (cos θ, sin θ) is on the circle x² + y² = 1, so sin²θ + cos²θ = 1.',
      'The square root gives the size; the quadrant gives the sign.',
      'It holds for every angle, 3x as well as θ.',
    ],
    variables: [
      V('s', 's', 'Sine, sin θ', { min: -1, max: 1, step: 0.01, fraction: 100 }),
      V('Q', 'Q', 'Quadrant', { allowed: [1, 2, 3, 4], min: 1, max: 4 }),
      V('c', 'c', 'Cosine, cos θ', { min: -1, max: 1, fraction: 100, derived: true }),
      V('m', 'm', 'Tangent, tan θ', { min: -1e6, max: 1e6, fraction: 100, derived: true }),
      V('t', 'θ', 'Angle', { unit: '°', min: 0, max: 360, derived: true }),
    ],
    rules: [
      limit(
        '|sin θ| < 1',
        '{s} is between −1 and 1',
        ['s'],
        (v) => Math.abs(v.s!) < 1,
        'sin θ = ±1 puts the angle on the y-axis, between quadrants.',
      ),
      limit(
        'sin θ matches the quadrant',
        'The sign of {s} fits quadrant {Q}',
        ['s', 'Q'],
        (v) => (v.Q! <= 2 ? v.s! >= 0 : v.s! <= 0),
        'Sine is positive in quadrants I and II and negative in III and IV.',
      ),
      derive(
        'cos θ = ±√(1 − sin²θ)',
        'c',
        ['s', 'Q'],
        '{c} = ±√(1 − {s}²), the sign from quadrant {Q}',
        (v) => cosSign(v.Q!) * Math.sqrt(1 - v.s! ** 2),
        (v) => (cosSign(v.Q!) > 0 ? '√(1 − ({s})²)' : '−√(1 − ({s})²)'),
        (v) =>
          cosSign(v.Q!) > 0
            ? 'cos²θ = 1 − sin²θ; cosine is positive in this quadrant.'
            : 'cos²θ = 1 − sin²θ; cosine is negative in quadrants II and III.',
        {
          check: (v) =>
            `${f100(v.c!)} = ${cosSign(v.Q!) > 0 ? '' : '−'}√(1 − ${wrap(f100(v.s!))}²)`,
          work: (v) => {
            const sign = cosSign(v.Q!) > 0 ? '' : '−';
            const q = ratioOf100(v.s!);
            if (!q) return [];
            const sq = lowest([q[0] ** 2, q[1] ** 2]);
            const rest = lowest([sq[1] - sq[0], sq[1]]);
            return [`c = ${sign}√(1 − ${ratioText(sq)})`, `c = ${sign}√(${ratioText(rest)})`];
          },
        },
      ),
      derive(
        'tan θ = sin θ ÷ cos θ',
        'm',
        ['s', 'c'],
        '{m} = {s} ÷ {c}',
        (v) => div(v.s!, v.c!),
        '{s} ÷ {c}',
        'Tangent is sine over cosine.',
      ),
      derive(
        'θ from sin θ and the quadrant',
        't',
        ['s', 'Q'],
        '{t} = sin⁻¹({s}), moved into quadrant {Q}',
        (v) => angleFromSin(v.s!, v.Q!),
        (v) => (v.Q === 1 ? 'sin⁻¹({s})' : v.Q === 4 ? '360 + sin⁻¹({s})' : '180 − sin⁻¹({s})'),
        (v) =>
          v.Q === 1
            ? 'In quadrant I the inverse sine gives θ.'
            : v.Q === 4
              ? 'sin⁻¹ gives a negative angle; a full turn on lands in quadrant IV.'
              : 'Mirror the inverse sine across the y-axis into quadrants II and III.',
        {
          check: (v) =>
            `${fmt(v.t!)} = ${(['', '180 − ', '180 − ', '360 + '] as const)[v.Q! - 1]}sin⁻¹(${f100(v.s!)})`,
        },
      ),
    ],
    example: {
      s: 0.6,
      Q: 2,
      c: -0.8,
      m: -0.75,
      t: 180 - (Math.asin(0.6) * 180) / PI,
    },
    startWith: ['s', 'Q'],
    equation: '({s})^2 + ({c})^2 = 1',
    pictureLabels: ['Q'],
    representation: { kind: 'unitCircle', angle: 't', cos: 'c', sin: 's', tan: 'm', fixed: true },
  }),
  page({
    id: 'm.11.pythagorean-identities~tangent',
    title: 'From tangent to secant',
    use: 'Use this for “tan θ = −12/5 in quadrant IV. Find sec θ and cos θ.”',
    assumptions: [
      'Divide sin²θ + cos²θ = 1 by cos²θ: tan²θ + 1 = sec²θ.',
      'sec θ = 1 ÷ cos θ has the sign of cos θ: positive in quadrants I and IV.',
      'Then cos θ = 1 ÷ sec θ and sin θ = tan θ × cos θ.',
    ],
    variables: [
      V('m', 'm', 'Tangent, tan θ', { min: -100, max: 100, step: 0.01, fraction: 100 }),
      V('Q', 'Q', 'Quadrant', { allowed: [1, 2, 3, 4], min: 1, max: 4 }),
      V('S', 'S', 'Secant, sec θ', { min: -1e4, max: 1e4, fraction: 100, derived: true }),
      V('c', 'c', 'Cosine, cos θ', { min: -1, max: 1, fraction: 100, derived: true }),
      V('s', 's', 'Sine, sin θ', { min: -1, max: 1, fraction: 100, derived: true }),
      V('t', 'θ', 'Angle', { unit: '°', min: 0, max: 360, derived: true }),
    ],
    rules: [
      limit(
        'tan θ matches the quadrant',
        'The sign of {m} fits quadrant {Q}',
        ['m', 'Q'],
        (v) => (v.Q === 1 || v.Q === 3 ? v.m! >= 0 : v.m! <= 0),
        'Tangent is positive in quadrants I and III and negative in II and IV.',
      ),
      derive(
        'sec θ = ±√(1 + tan²θ)',
        'S',
        ['m', 'Q'],
        '{S} = ±√(1 + {m}²), the sign from quadrant {Q}',
        (v) => cosSign(v.Q!) * Math.sqrt(1 + v.m! ** 2),
        (v) => (cosSign(v.Q!) > 0 ? '√(1 + ({m})²)' : '−√(1 + ({m})²)'),
        (v) =>
          cosSign(v.Q!) > 0
            ? 'sec²θ = 1 + tan²θ; secant is positive in this quadrant.'
            : 'sec²θ = 1 + tan²θ; secant is negative in quadrants II and III.',
        {
          check: (v) =>
            `${f100(v.S!)} = ${cosSign(v.Q!) > 0 ? '' : '−'}√(1 + ${wrap(f100(v.m!))}²)`,
        },
      ),
      derive(
        'cos θ = 1 ÷ sec θ',
        'c',
        ['S'],
        '{c} = 1 ÷ {S}',
        (v) => div(1, v.S!),
        '1 ÷ {S}',
        'Cosine is the reciprocal of secant.',
      ),
      derive(
        'sin θ = tan θ × cos θ',
        's',
        ['m', 'c'],
        '{s} = {m} × {c}',
        (v) => v.m! * v.c!,
        '{m} × {c}',
        'tan θ = sin θ ÷ cos θ, so multiply by cos θ.',
      ),
      derive(
        'θ from tan θ and the quadrant',
        't',
        ['m', 'Q'],
        '{t} = tan⁻¹({m}), moved into quadrant {Q}',
        (v) => {
          const a = (Math.atan(v.m!) * 180) / PI;
          return v.Q === 1 ? a : v.Q === 4 ? 360 + a : 180 + a;
        },
        (v) => (v.Q === 1 ? 'tan⁻¹({m})' : v.Q === 4 ? '360 + tan⁻¹({m})' : '180 + tan⁻¹({m})'),
        (v) =>
          v.Q === 1
            ? 'In quadrant I the inverse tangent gives θ.'
            : v.Q === 4
              ? 'tan⁻¹ gives a negative angle; a full turn on lands in quadrant IV.'
              : 'Tangent repeats every 180°: half a turn on from the inverse tangent.',
        {
          check: (v) =>
            `${fmt(v.t!)} = ${(['', '180 + ', '180 + ', '360 + '] as const)[v.Q! - 1]}tan⁻¹(${f100(v.m!)})`,
        },
      ),
    ],
    example: {
      m: -2.4,
      Q: 4,
      S: 2.6,
      c: 5 / 13,
      s: -12 / 13,
      t: 360 + (Math.atan(-2.4) * 180) / PI,
    },
    startWith: ['m', 'Q'],
    pictureLabels: ['Q', 'S'],
    representation: { kind: 'unitCircle', angle: 't', cos: 'c', sin: 's', tan: 'm', fixed: true },
  }),
];
