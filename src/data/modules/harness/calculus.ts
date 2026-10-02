/**
 * Calculus lines in the steps (HE-E6), read and checked numerically, never solved
 * symbolically. A walkthrough's lines are read in order; each clause (a line splits at " → ",
 * ", so ", "; " and ", and ") is one of:
 *
 * - a **form**, a function stated with its free variable: "f(x) = x³ − 4x", "y(t) = 50e^(−0.2t)",
 *   "f(x, y) = x²y + 3y" (kept, so later lines can be checked against it);
 * - a **derivative form**: "f′(x) = 3x² − 4", "f″(x) = 6x", "dy/dx = 6x", "f_x(x, y) = 2xy",
 *   "∂f/∂y = x² + 3", "∂²f/∂x∂y = 2x", "d/dx (x³ − 4x) = 3x² − 4": checked against a central
 *   difference of the stated function at sample points (when the function is stated), else
 *   read at sample points (it must evaluate);
 * - a **value**: "f′(2) = 3(2)² − 4 = 8", "f_x(1, 2) = 4", "∂f/∂x at (1, 2) = 4", "dy/dx at
 *   x = 2 = 12", "y(3) = 50e^(−0.6) = 27.44": the stated form (or the derivative of the stated
 *   function) at the point, against every side that reads as a number;
 * - an **integral**: "∫ from 0 to 2 of x² dx = [x³ ÷ 3] from 0 to 2 = 8 ÷ 3": every side that
 *   reads (quadrature, F(b) − F(a)) agrees, and the antiderivative's derivative is the
 *   integrand at sample points; "∫ 3x² dx = x³ + C": the right side's derivative is the
 *   integrand;
 * - a **limit**: "lim x → 2 of (x² − 4) ÷ (x − 2) = 4", evaluated near the point (`limitOf`);
 * - an **ODE** with a stated solution: "y″ + 2y′ + 5y = 0" and "y(t) = e^(−t)(2cos(2t) +
 *   1.5sin(2t))" (either order): both sides at sample t, the derivatives by central differences.
 *
 * A clause in letters only (a rule: "f′(x) = n·c·xⁿ⁻¹", "y′ = ky") is not checked. Test-only.
 */
import { INTEGRAL } from '@/engine/latex';

import {
  BRACKET_LIMITS,
  LIMIT,
  evaluate,
  evaluateAt,
  implicitTimes,
  lettersIn,
  shownClose,
  withinRounding,
} from './evaluate';

/** What a checked clause was, and what is wrong with it (nothing when it holds). */
export interface CalculusVerdict {
  line: string;
  clause: string;
  kind: 'form' | 'derivative' | 'value' | 'integral' | 'limit' | 'ode';
  problem?: 'wrong' | 'unread';
  detail?: string;
}

/** A sign that a line is calculus (a walkthrough without one is not read here). */
export const CALCULUS_MARK =
  /∫|∂|\blim\b|\] from \S+ to |\bd\/d\p{L}|\bd²?\p{L}\p{M}* ?(?:\/|÷) ?d\p{L}|\p{L}[′″‴]\(|\p{L}_[a-z]{1,3}\(/u;

/** A single-letter function name (f, V, y, T, x₀); never e. */
const NAME = String.raw`(?!e[^\p{L}])\p{L}\p{M}*[₀-₉]*`;
const PRIMES: Record<string, number> = { '′': 1, '″': 2, '‴': 3 };

/** Sample points for one, two or three variables: off the integers, so 0 and 1 are avoided. */
const SAMPLES = [0.37, 0.83, 1.31, 1.92, 2.47, -0.58, -1.21];
const pointsFor = (n: number): number[][] =>
  SAMPLES.map((_, i) =>
    Array.from({ length: n }, (_, k) => SAMPLES[(i + 3 * k) % SAMPLES.length]! + 0.11 * k),
  );

interface Form {
  vars: string[];
  body: string;
  /** The line it was stated on. */
  at: number;
}

/** Equal to 2 parts in 1000, or near 0 against the size of the function's values. */
const near = (a: number, b: number, scale: number) =>
  Math.abs(a - b) <= 2e-3 * Math.max(Math.abs(a), Math.abs(b)) + 1e-4 * Math.max(1e-2, scale);

/** A derivative of `f` by central differences: `spec` lists the variables' places, in order. */
function derivative(
  f: (p: number[]) => number | undefined,
  spec: number[],
  p: number[],
): number | undefined {
  if (spec.length === 0) return f(p);
  const [i, ...rest] = spec as [number, ...number[]];
  const h = [1e-5, 1e-3, 1e-2][Math.min(spec.length, 3) - 1]! * Math.max(1, Math.abs(p[i]!));
  const up = [...p];
  const down = [...p];
  up[i]! += h;
  down[i]! -= h;
  const [a, b] = [derivative(f, rest, up), derivative(f, rest, down)];
  return a === undefined || b === undefined ? undefined : (a - b) / (2 * h);
}

const formAt = (form: Form) => (p: number[]) =>
  evaluateAt(form.body, Object.fromEntries(form.vars.map((v, i) => [v, p[i]!])));

/** A side as a number: arithmetic, a unit after it allowed ("8 m/s"); undefined otherwise. */
function readSide(side: string): number | undefined {
  const x = evaluate(implicitTimes(side));
  if (x !== undefined) return Number.isFinite(x) ? x : undefined;
  const unit = /^(.*?[\d)])\s+[^\d\s=()]+(?:\s[^\d\s=()]+)?$/.exec(side);
  const y = unit ? evaluate(implicitTimes(unit[1]!)) : undefined;
  return y !== undefined && Number.isFinite(y) ? y : undefined;
}

/**
 * Whether a value matches what a side says, display rounding allowed (for arithmetic: the
 * limits of an integral or a limit's point are exact).
 */
const agrees = (value: number, side: string, x: number) =>
  shownClose(value, x, side) ||
  (!/∫|\] from |\blim\b/.test(side) && withinRounding(value, implicitTimes(side)));

/** The clauses of a line: " → ", ", so ", "; ", ", and "; a leading "Power rule: " goes. */
export function clausesOf(line: string): string[] {
  return (
    line
      .replace(/\.$/, '')
      // (not the arrow of a limit: lim x → 2)
      .split(/(?<!lim(?: as)? \(?\p{L}) → |, so |; |, and /u)
      .map((c) => c.replace(/^[A-Za-z][A-Za-z ’'-]*: /, '').trim())
      .filter(Boolean)
  );
}

/** The sides of a clause: " = " and " ≈ "; "dy/dx at x = 2" keeps its "x = 2". */
const sidesOf = (clause: string) =>
  clause
    .replace(/ at (\p{L}) = /gu, ' at $1 ≔ ')
    .split(/ = | ≈ /)
    .map((s) => s.trim());

/** A list of numbers ("1, 2", "π/2"), or undefined when one doesn't read. */
const numbersOf = (args: string) => {
  const xs = args.split(/, ?/).map((a) => readSide(a));
  return xs.every((x) => x !== undefined) ? (xs as number[]) : undefined;
};
const lettersList = (args: string) =>
  /^\p{L}(?:, ?\p{L})*$/u.test(args) ? args.split(/, ?/) : undefined;

/** The left side of a derivative clause, read: the function, its variables and the point. */
interface Derivative {
  name: string;
  /** The variables differentiated by, in order (a prime's is filled in from the function). */
  by: (string | undefined)[];
  /** Letters given in brackets (f′(x), f_x(x, y)). */
  vars?: string[];
  /** Numbers given (f′(2), ∂f/∂x at (1, 2), dy/dx at x = 2). */
  point?: number[];
  /** A d/dx (…) of a body written out. */
  body?: string;
}

function readDerivative(left: string): Derivative | undefined {
  const args = (a: string | undefined) =>
    a === undefined ? {} : lettersList(a) ? { vars: lettersList(a) } : { point: numbersOf(a) };
  // f′(x), f″(2), V′
  let m = new RegExp(String.raw`^(${NAME})([′″‴])(?:\(([^()]+)\))?$`, 'u').exec(left);
  if (m) {
    const a = args(m[3]);
    if ('point' in a && a.point === undefined) return undefined;
    return { name: m[1]!, by: Array(PRIMES[m[2]!]!).fill(undefined), ...a };
  }
  // f_x(x, y), f_xy(1, 2)
  m = new RegExp(String.raw`^(${NAME})_([a-z]{1,3})(?:\(([^()]+)\))?$`, 'u').exec(left);
  if (m) {
    const a = args(m[3]);
    if ('point' in a && a.point === undefined) return undefined;
    return { name: m[1]!, by: [...m[2]!], ...a };
  }
  // ∂f/∂x, ∂²f/∂x², ∂²f/∂x∂y, then (x, y), at (1, 2) or at x ≔ 2
  m = new RegExp(
    String.raw`^∂(²)?(${NAME}) ?(?:/|÷) ?∂(\p{L})(²)?(?:∂(\p{L}))?(?: ?\(([^()]+)\)| at \(([^()]+)\)| at \p{L} ≔ (\S+))?$`,
    'u',
  ).exec(left);
  if (m) {
    const by = m[5] ? [m[3]!, m[5]] : m[4] || m[1] ? [m[3]!, m[3]!] : [m[3]!];
    const point = m[7] ?? m[8];
    const a = point !== undefined ? { point: numbersOf(point) } : args(m[6]);
    if ('point' in a && a.point === undefined) return undefined;
    return { name: m[2]!, by, ...a };
  }
  // dy/dx, d²y/dx², then at x ≔ 2
  m = new RegExp(
    String.raw`^d(²)?(${NAME}) ?(?:/|÷) ?d(\p{L})(²)?(?: at \p{L} ≔ (\S+)| at \(([^()]+)\))?$`,
    'u',
  ).exec(left);
  if (m) {
    const point = m[5] ?? m[6];
    const a = point !== undefined ? { point: numbersOf(point) } : {};
    if ('point' in a && a.point === undefined) return undefined;
    return { name: m[2]!, by: m[1] || m[4] ? [m[3]!, m[3]!] : [m[3]!], ...a };
  }
  // d/dx (body), d/dx [body], d²/dx² (body)
  m = /^d(²)?\/d(\p{L})(²)? ?[([](.+)[)\]]$/u.exec(left);
  if (m) return { name: '', by: m[1] || m[3] ? [m[2]!, m[2]!] : [m[2]!], body: m[4]! };
  return undefined;
}

/** The derivative marks of `name` in a clause (y′, y″, dy/dt, d²y/dt²), for an ODE. */
const derivativeMarks = (name: string) =>
  new RegExp(
    String.raw`(?<![\p{L}\p{M}_])(?:${name}([′″‴])|d(²)?${name} ?(?:/|÷) ?d\p{L}(²)?)`,
    'gu',
  );

/** Whether a form only uses its own variables (else it is a rule in letters). */
const inVars = (form: string, vars: string[]) => lettersIn(form).every((l) => vars.includes(l));
/**
 * Whether a side is a form in `vars`: it names one of them and no other letter. (Numbers alone,
 * "f′(x) = 2 × 1.5", are the value at the page's point, not a form.)
 */
const isForm = (side: string, vars: string[]) => lettersIn(side).length > 0 && inVars(side, vars);

/**
 * Every calculus clause of a walkthrough's lines (in reading order), with what is wrong with
 * it. Clauses that aren't calculus are left out.
 */
export function checkCalculus(lines: readonly string[]): CalculusVerdict[] {
  // Pass 1: the functions stated with their variables, wherever they are stated.
  const forms = new Map<string, Form[]>();
  const keep = (key: string, form: Form) => forms.set(key, [...(forms.get(key) ?? []), form]);
  lines.forEach((line, at) => {
    for (const clause of clausesOf(line)) {
      const [left, right] = sidesOf(clause);
      const m = new RegExp(String.raw`^(${NAME})\(([^()]+)\)$`, 'u').exec(left ?? '');
      const vars = m && lettersList(m[2]!);
      if (vars && right !== undefined && isForm(right, vars))
        keep(`${m[1]}|`, { vars, body: right, at });
    }
  });
  /** The form stated nearest before line `at` (else the first after it). */
  const formOf = (key: string, at: number) => {
    const all = forms.get(key) ?? [];
    return all.filter((f) => f.at <= at).pop() ?? all[0];
  };

  const out: CalculusVerdict[] = [];
  lines.forEach((line, at) => {
    for (const clause of clausesOf(line)) {
      const verdict = checkClause(clause, at);
      if (verdict) out.push({ line, clause, ...verdict });
    }
  });
  return out;

  function checkClause(
    clause: string,
    at: number,
  ): Omit<CalculusVerdict, 'line' | 'clause'> | undefined {
    const sides = sidesOf(clause);
    const left = sides[0]!;
    const rest = sides.slice(1);
    const d = readDerivative(left);
    if (d && rest.length) {
      const base = d.body ? { vars: [d.by[0]!], body: d.body, at } : formOf(`${d.name}|`, at);
      // (f′(5) with no f stated: the variables of the f′ form stated)
      const statedVars = [...forms.entries()].find(
        ([k]) => k.startsWith(`${d.name}|`) && k.split('|')[1]!.split(',').length === d.by.length,
      )?.[1][0]?.vars;
      const vars =
        base?.vars ??
        d.vars ??
        (d.by.every((v) => v) ? [...new Set(d.by as string[])] : undefined) ??
        (d.name ? statedVars : undefined);
      if (vars && d.by.every((v) => v === undefined || vars.includes(v))) {
        const by = d.by.map((v) => vars.indexOf(v ?? vars[0]!));
        const key = `${d.name}|${by.map((i) => vars[i]).join(',')}`;
        if (d.point) {
          // The derivative's own form when one was stated, else the function differentiated.
          const stated = d.name ? formOf(key, at) : undefined;
          return stated ? value(d.point, rest, stated, []) : value(d.point, rest, base, by);
        }
        const right = rest[0]!;
        if (isForm(right, vars)) {
          const form = { vars, body: right, at };
          if (d.name) keep(key, form);
          return derivativeForm(form, rest.slice(1), base, by);
        }
      }
    }
    const ode = odeOf(clause, at);
    if (ode) return ode;
    // A function stated (pass 1 kept it), or its value at a point.
    const m = new RegExp(String.raw`^(${NAME})\(([^()]+)\)$`, 'u').exec(left);
    if (m && rest.length) {
      const base = formOf(`${m[1]}|`, at);
      const vars = lettersList(m[2]!);
      if (vars && isForm(rest[0]!, vars)) {
        return derivativeForm({ vars, body: rest[0]!, at }, rest.slice(1), undefined, [], 'form');
      }
      const point = !vars ? numbersOf(m[2]!) : undefined;
      if (point && base && base.vars.length === point.length) return value(point, rest, base, []);
    }
    if (/∫|\] from |\blim\b/.test(clause)) return integralOrLimit(sides);
    return undefined;
  }

  /** A form against another: the derivative of `base` by `by` (or `base` itself), and its other sides. */
  function derivativeForm(
    form: Form,
    more: string[],
    base: Form | undefined,
    by: number[],
    kind: 'form' | 'derivative' = 'derivative',
  ): Omit<CalculusVerdict, 'line' | 'clause'> {
    const points = pointsFor(form.vars.length);
    const f = formAt(form);
    const read = points.filter((p) => f(p) !== undefined);
    if (read.length < 2) return { kind, problem: 'unread', detail: `can't read ${form.body}` };
    const scale = Math.max(...read.map((p) => Math.abs(f(p)!)));
    const others = more
      .filter((s) => inVars(s, form.vars))
      .map((body) => formAt({ ...form, body }));
    const target = base ? (p: number[]) => derivative(formAt(base), by, p) : undefined;
    for (const p of read) {
      const y = f(p)!;
      const want = target?.(p);
      if (want !== undefined && !near(y, want, scale)) {
        return { kind, problem: 'wrong', detail: `at ${p.join(', ')}: ${y} ≠ ${want}` };
      }
      for (const g of others) {
        const z = g(p);
        if (z !== undefined && !near(y, z, scale)) {
          return { kind, problem: 'wrong', detail: `sides differ at ${p.join(', ')}: ${y} ≠ ${z}` };
        }
      }
    }
    return { kind };
  }

  /** A function's (or its derivative's) value at a point against every side that reads. */
  function value(
    point: number[],
    sides: string[],
    form: Form | undefined,
    by: number[],
  ): Omit<CalculusVerdict, 'line' | 'clause'> | undefined {
    const read = sides.map((s) => [s, readSide(s)] as const).filter(([, x]) => x !== undefined);
    const want =
      form && form.vars.length === point.length ? derivative(formAt(form), by, point) : undefined;
    if (want === undefined) {
      // Nothing to compare with but the sides themselves.
      if (read.length < 2) return form ? { kind: 'value', problem: 'unread' } : undefined;
      const [s0, x0] = read[0]!;
      const off = read.slice(1).find(([s, x]) => !agrees(x0!, s, x!) && !agrees(x!, s0, x0!));
      return off
        ? { kind: 'value', problem: 'wrong', detail: `${s0} ≠ ${off[0]}` }
        : { kind: 'value' };
    }
    if (read.length === 0) return { kind: 'value', problem: 'unread', detail: sides.join(' = ') };
    const off = read.find(([s, x]) => !agrees(want, s, x!));
    return off
      ? { kind: 'value', problem: 'wrong', detail: `${off[0]} is not ${want}` }
      : { kind: 'value' };
  }

  /** An ODE in a function stated with one variable, checked at sample points. */
  function odeOf(clause: string, at: number): Omit<CalculusVerdict, 'line' | 'clause'> | undefined {
    const sides = sidesOf(clause);
    if (sides.length !== 2) return undefined;
    // (the functions themselves, not their derivatives' forms: "y|", never "y|t")
    for (const key of [...forms.keys()].filter((k) => k.endsWith('|'))) {
      const name = key.slice(0, -1);
      const marks = derivativeMarks(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      if (!marks.test(clause)) continue;
      const sol = formOf(key, at)!;
      if (sol.vars.length !== 1) continue;
      const t = sol.vars[0]!;
      // y″ → (D2), y′ → (D1); then y and t are the only letters left.
      const order = (m: RegExpMatchArray) => (m[1] ? PRIMES[m[1]]! : m[2] || m[3] ? 2 : 1);
      const marked = sides.map((s) =>
        s.replace(marks, (...m) => `(@${order(m as RegExpMatchArray)})`),
      );
      if (!marked.every((s) => lettersIn(s).every((l) => l === name || l === t))) continue;
      const y = formAt(sol);
      const tested = SAMPLES.filter((x) => x > 0).flatMap((x) => {
        const values = [0, 1, 2, 3].map((k) => derivative(y, Array(k).fill(0), [x]));
        if (values.some((v) => v === undefined)) return [];
        const [l, r] = marked.map((s) =>
          evaluateAt(
            s.replace(/\(@(\d)\)/g, (_m, k: string) => `(${values[Number(k)]})`),
            { [name]: values[0]!, [t]: x },
          ),
        );
        if (l === undefined || r === undefined) return [];
        // The size of its terms: each side with every term made positive.
        const size = marked.map((s) =>
          evaluateAt(
            s
              .replace(/\(@(\d)\)/g, (_m, k: string) => `(${Math.abs(values[Number(k)]!)})`)
              .replace(/[−-]/g, '+'),
            { [name]: Math.abs(values[0]!), [t]: x },
          ),
        );
        const scale = Math.abs(size[0] ?? l) + Math.abs(size[1] ?? r);
        return [{ x, l, r, scale }];
      });
      if (tested.length < 2) return { kind: 'ode', problem: 'unread', detail: clause };
      // (within 2 parts in 1000 of its terms: a frequency shown to 4 figures, 4.995)
      const off = tested.find((s) => Math.abs(s.l - s.r) > 2e-3 * s.scale + 1e-9);
      return off
        ? { kind: 'ode', problem: 'wrong', detail: `at ${t} = ${off.x}: ${off.l} ≠ ${off.r}` }
        : { kind: 'ode' };
    }
    return undefined;
  }
}

/** The letters a calculus side leaves over once its own variables are taken out. */
function strayLetters(side: string): string[] {
  const stray: string[] = [];
  let rest = side;
  rest = rest.replace(INTEGRAL, (...args) => {
    const g = args[args.length - 1] as Record<string, string | undefined>;
    const v = (g.dv ?? g.dv2)!.slice(1);
    stray.push(...lettersIn(g.lo!), ...lettersIn(g.hi!));
    stray.push(...lettersIn(g.ib ?? g.ib2!).filter((l) => l !== v));
    return ' ';
  });
  rest = rest.replace(BRACKET_LIMITS, (_m, body: string, lo: string, hi: string) => {
    stray.push(...lettersIn(lo), ...lettersIn(hi), ...lettersIn(body).slice(1));
    return ' ';
  });
  const lim = LIMIT.exec(rest);
  if (lim) {
    stray.push(
      ...lettersIn(lim[2]!.replace(/∞/g, '')),
      ...lettersIn(lim[4]!).filter((l) => l !== lim[1]),
    );
    rest = rest.slice(0, lim.index);
  }
  // ∫ f dx with no limits: its variable.
  const indefinite = /∫ (.+) d(\p{L})$/u.exec(rest);
  if (indefinite) {
    stray.push(...lettersIn(indefinite[1]!).filter((l) => l !== indefinite[2]));
    rest = rest.slice(0, indefinite.index);
  }
  return [...stray, ...lettersIn(rest.replace(/\+ C\b/, ''))];
}

/** Sides with ∫, [F] from a to b or lim: every side that reads agrees; F′ is the integrand. */
function integralOrLimit(sides: string[]): Omit<CalculusVerdict, 'line' | 'clause'> | undefined {
  const kind = sides.some((s) => /∫|\] from /.test(s)) ? 'integral' : 'limit';
  // An indefinite integral: ∫ 3x² dx = x³ + C (the right side's derivative is the integrand).
  const indefinite = /^∫ (?!from )(.+) d(\p{L})$/u.exec(sides[0]!);
  if (indefinite && sides.length >= 2) {
    const [, body, v] = indefinite;
    const anti = sides[1]!.replace(/ \+ C$/, '');
    if (!inVars(body!, [v!]) || !inVars(anti, [v!])) return undefined;
    return antiderivative(body!, anti, v!, SAMPLES);
  }
  const marked = sides.filter((s) => /∫|\] from |\blim\b/.test(s));
  // A rule in letters (∫ from a to b of f(x) dx) is not checked.
  if (marked.some((s) => strayLetters(s).length > 0)) return undefined;
  const read = sides.map((s) => [s, readSide(s)] as const);
  const unread = read.find(([s, x]) => x === undefined && /∫|\] from |\blim\b/.test(s));
  if (unread) return { kind, problem: 'unread', detail: unread[0] };
  const numbers = read.filter(([, x]) => x !== undefined) as [string, number][];
  const [s0, x0] = numbers[0] ?? [];
  const off = numbers.slice(1).find(([s, x]) => !agrees(x0!, s, x) && !agrees(x, s0!, x0!));
  if (off) return { kind, problem: 'wrong', detail: `${s0} ≠ ${off[0]}` };
  // The antiderivative stated beside its integral: F′ is the integrand between the limits.
  const integral = sides.map((s) => new RegExp(`^${INTEGRAL.source}$`, 'u').exec(s)).find(Boolean);
  const bracket = sides
    .map((s) => new RegExp(`^${BRACKET_LIMITS.source}$`, 'u').exec(s))
    .find(Boolean);
  if (integral && bracket) {
    const g = integral.groups!;
    const v = (g.dv ?? g.dv2)!.slice(1);
    const body = g.ib ?? `1 ÷ ${g.ib2}`;
    const [a, b] = [evaluate(g.lo!)!, evaluate(g.hi!)!];
    const inside = [0.13, 0.37, 0.61, 0.89].map((k) => a + k * (b - a));
    const check = antiderivative(body, bracket[1]!, lettersIn(bracket[1]!)[0] ?? v, inside, v);
    if (check.problem) return { ...check, kind };
  }
  return { kind };
}

/** Whether `anti`′ is `body` at the points (the letters may differ: [u³ ÷ 3] for ∫ x² dx). */
function antiderivative(
  body: string,
  anti: string,
  u: string,
  points: number[],
  v = u,
): Omit<CalculusVerdict, 'line' | 'clause'> {
  const F = (p: number[]) => evaluateAt(anti, { [u]: p[0]! });
  const f = (x: number) => evaluateAt(body, { [v]: x });
  const pairs = points
    .map((x) => [f(x), derivative(F, [0], [x])] as const)
    .filter(([a, b]) => a !== undefined && b !== undefined) as [number, number][];
  if (pairs.length < 2)
    return { kind: 'integral', problem: 'unread', detail: `${anti} for ${body}` };
  const scale = Math.max(...pairs.map(([a]) => Math.abs(a)));
  const off = pairs.find(([a, b]) => !near(a, b, scale));
  return off
    ? {
        kind: 'integral',
        problem: 'wrong',
        detail: `d/d${u} of ${anti} is ${off[1]}, not ${off[0]}`,
      }
    : { kind: 'integral' };
}
