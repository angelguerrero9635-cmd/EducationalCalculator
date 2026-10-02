/**
 * Steps for a value no rearrangement gives (HE-E14): the root finder has the answer, and the
 * walkthrough shows how a student gets there, one try a line, each line true as printed.
 *
 *   Try k = 0.02: ln(1 + 0.02 × 600 ÷ 15) ÷ 0.02 = 32.06 (want 29.39)
 *   Try k = 0.03: ln(1 + 0.03 × 600 ÷ 15) ÷ 0.03 = 29.16 (want 29.39)
 *   Try k = 0.02921: … = 29.39 (want 29.39)
 *
 * Each next try comes from the numbers printed before it (the secant method, bisection, a
 * repeated rule or Newton's method, as the relation's `trials` names), so a student with a
 * calculator gets the same lines; the tries stop when the guess no longer changes at the
 * figures shown, which must be the answer. Undefined when the display can't be worked as
 * printed or the tries don't reach the answer: the step then says less (`buildSteps`).
 */
import { formatNumber, renderTemplate, scientific } from '@/engine/format';
import type { Trial, Values, VariableDef } from '@/engine/types';

import { evaluatePrinted } from './simplify';

type LineVars = readonly (VariableDef & { scientificFigures?: number })[];

export interface TrialWork {
  how: string;
  lines: string[];
}

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const subscript = (n: number) => [...String(n)].map((d) => SUB[Number(d)]).join('');

/** Most tries a step shows in full; a longer run shows its first and last ones. */
const SHOWN = 7;

/** A value written to `p` significant figures, as a try prints it. */
function printed(x: number, p: number): { text: string; value: number } {
  const value = Number(x.toPrecision(p));
  const text =
    value !== 0 && (Math.abs(value) >= 1e7 || Math.abs(value) < 1e-4)
      ? scientific(value, p)
      : formatNumber(value, { figures: p, scientificFigures: p });
  return { text: text.replace(/^-/, '−'), value };
}

/** The figures the tries are printed to: one more than the answer shows, at least 4. */
function figuresFor(answer: number, figures: number | undefined): number {
  if (figures !== undefined) return Math.min(8, Math.max(4, figures + 1));
  const abs = Math.abs(answer);
  if (abs === 0 || abs < 1 || abs >= 1e7) return 5;
  // (4 decimals, as a value with no page figures shows: 1.4987, 29.3893)
  return Math.min(8, Math.floor(Math.log10(abs)) + 1 + 4);
}

/** Two round guesses either side of the answer: 0.0294 → 0.02 and 0.03. */
function roundGuesses(answer: number): [number, number] {
  if (answer === 0) return [-1, 1];
  const mag = 10 ** Math.floor(Math.log10(Math.abs(answer)));
  const lo = Math.floor(answer / mag) * mag;
  const hi = Math.ceil(answer / mag) * mag;
  return lo === hi ? [lo, lo + mag] : [lo, hi];
}

/** Elides the middle of a long run of tries: the first two, "…", the last three. */
const shorten = (lines: string[], head: number) =>
  lines.length - head <= SHOWN
    ? lines
    : [...lines.slice(0, head + 2), '…', ...lines.slice(lines.length - 3)];

interface Context {
  display: string;
  id: string;
  symbol: string;
  /** The page's values as the lines show them (the box's figures, else more). */
  vars: LineVars;
  /** Every value the steps show (the answer too). */
  values: Values;
  answer: number;
  figures: number | undefined;
  variable: VariableDef;
}

/** Whether a final guess is the answer at the figures the tries print. */
const reaches = (guess: number, answer: number, p: number) =>
  Math.abs(guess - answer) <= 1.5 * 10 ** (Math.floor(Math.log10(Math.abs(answer) || 1)) - p + 1);

/** A template filled with the page's values and `guess` for the value found. */
function fill(c: Context, template: string, guess: { text: string; value: number }): string {
  // The guess prints as the try says it: its own text, never the box's figures.
  const vars = c.vars.map((v) =>
    v.id === c.id
      ? {
          ...v,
          integer: false,
          digits: undefined,
          fraction: undefined,
          sigFigs: undefined,
          worked: undefined,
          exact: undefined,
          decimals: undefined,
          full: undefined,
          repeating: undefined,
          pi: undefined,
          signed: undefined,
          scientific: undefined,
          labels: undefined,
          // (already rounded: 8 figures print it as it is, 0.02939)
          figures: 8,
          scientificFigures: undefined,
        }
      : v,
  );
  return renderTemplate(template, vars, { ...c.values, [c.id]: guess.value });
}

/**
 * Tries by the secant method or bisection on the display's two sides: the side with the value
 * in it worked out at each guess against the other.
 */
function bySides(c: Context, method: 'secant' | 'bisection', start?: [number, number]) {
  const sides = c.display.split(' = ');
  if (sides.length !== 2) return undefined;
  const has = sides.map((s) => s.includes(`{${c.id}}`));
  if (!has[0] && !has[1]) return undefined;
  // (the side without the value is the target: written as it is, or worked out)
  const lone = (s: string) => /^\{\w+\}$/.test(s.trim()) || /^[\d.,]+$/.test(s.trim());
  const p = figuresFor(c.answer, c.figures);
  type Try = { guess: { text: string; value: number }; line: string; off: number };
  const one = (x: number): Try | undefined => {
    const guess = printed(x, p);
    const [l, r] = sides.map((s) => fill(c, s, guess));
    const [a, b] = [evaluatePrinted(l!), evaluatePrinted(r!)];
    if (a === undefined || b === undefined) return undefined;
    const [pa, pb] = [printed(a, p), printed(b, p)];
    const head = `Try ${c.symbol} = ${guess.text}: `;
    // The value alone on one side: "Try E = 0.5: 0.5 + 0.2 × sin(0.5) = 0.5959 (want 0.5)".
    if (has[0] && has[1]) {
      const [valueSide, otherSide] = lone(sides[0]!) ? [r!, l!] : lone(sides[1]!) ? [l!, r!] : [];
      if (valueSide !== undefined) {
        const [v, o] = valueSide === r ? [pb, pa] : [pa, pb];
        return {
          guess,
          line: `${head}${valueSide} = ${v.text} (want ${otherSide === l ? pa.text : pb.text})`,
          off: v.value - o.value,
        };
      }
      return {
        guess,
        line: `${head}${l} = ${pa.text}; ${r} = ${pb.text}`,
        off: pa.value - pb.value,
      };
    }
    const [valueSide, target, v, t] = has[0] ? [l!, r!, pa, pb] : [r!, l!, pb, pa];
    const want = lone(has[0] ? sides[1]! : sides[0]!) ? target : t.text;
    return {
      guess,
      line: `${head}${valueSide} = ${v.text} (want ${want})`,
      off: v.value - t.value,
    };
  };
  const [x0, x1] = start ?? roundGuesses(c.answer);
  const tries: Try[] = [];
  for (const x of [x0, x1]) {
    if (!(x >= (c.variable.min ?? -Infinity) && x <= (c.variable.max ?? Infinity)))
      return undefined;
    const t = one(x);
    if (!t) return undefined;
    tries.push(t);
    if (t.off === 0) break;
  }
  for (let k = 0; k < 60 && tries[tries.length - 1]!.off !== 0; k++) {
    const b = tries[tries.length - 1]!;
    const a = tries[tries.length - 2];
    if (!a) break;
    // The range where the sides cross, from the tries so far.
    const lows = tries.filter((t) => Math.sign(t.off) === Math.sign(tries[0]!.off));
    const highs = tries.filter((t) => Math.sign(t.off) !== Math.sign(tries[0]!.off));
    const near = (ts: Try[]) =>
      ts.reduce((m, t) => (Math.abs(t.off) < Math.abs(m.off) ? t : m), ts[0]!);
    const bracket = highs.length ? [near(lows).guess.value, near(highs).guess.value] : undefined;
    let x: number;
    if (method === 'bisection') {
      if (!bracket) return undefined;
      x = (bracket[0]! + bracket[1]!) / 2;
    } else {
      if (b.off === a.off) break;
      x = b.guess.value - (b.off * (b.guess.value - a.guess.value)) / (b.off - a.off);
      // (a try that leaves the range where the sides cross takes its middle instead)
      if (bracket && !(x > Math.min(...bracket) && x < Math.max(...bracket)))
        x = (bracket[0]! + bracket[1]!) / 2;
    }
    if (!Number.isFinite(x)) return undefined;
    if (printed(x, p).text === b.guess.text) break;
    // (a try already made, in bisection's last halvings: the guess has settled)
    if (tries.some((t) => t.guess.text === printed(x, p).text)) break;
    const t = one(x);
    if (!t) return undefined;
    tries.push(t);
  }
  const last = tries[tries.length - 1]!;
  // (the try nearest the target is the answer the tries reach)
  if (!reaches(last.guess.value, c.answer, p)) return undefined;
  return shorten(
    tries.map((t) => t.line),
    0,
  );
}

/** The name of the n-th iterate: E₁, or "Try 1: M₁" for a symbol with a mark of its own. */
const iterate = (symbol: string, n: number) =>
  /^[A-Za-zα-ωΑ-Ω]$/.test(symbol) ? `${symbol}${subscript(n)}` : `Try ${n}: ${symbol}`;

/** A rule repeated (fixed point) or Newton's method from `start`. */
function byRule(c: Context, trial: Extract<Trial, { method: 'fixed-point' | 'newton' }>) {
  const p = figuresFor(c.answer, c.figures);
  let x = printed(trial.start(c.values), p);
  const lines = [`${iterate(c.symbol, 0)} = ${x.text}`];
  for (let n = 1; n <= 60; n++) {
    const expr =
      trial.method === 'fixed-point'
        ? fill(c, trial.next, x)
        : `${x.text} − (${fill(c, trial.f, x)}) ÷ (${fill(c, trial.slope, x)})`;
    const v = evaluatePrinted(expr);
    if (v === undefined) return undefined;
    const next = printed(v, p);
    lines.push(`${iterate(c.symbol, n)} = ${expr} = ${next.text}`);
    if (next.text === x.text) {
      if (!reaches(next.value, c.answer, p)) return undefined;
      return shorten(lines, 1);
    }
    x = next;
  }
  return undefined;
}

const HOW: Record<Trial['method'], (symbol: string) => string> = {
  secant: (s) =>
    `No rearrangement puts ${s} on its own, so it is found by trial: each next try is where a straight line through the last two meets the target.`,
  bisection: (s) =>
    `No rearrangement puts ${s} on its own, so it is found by halving: each try is the middle of the range where the two sides cross.`,
  'fixed-point': (s) =>
    `No rearrangement puts ${s} on its own, so the rule is repeated: each value found goes back in until it stops changing.`,
  newton: (s) =>
    `No rearrangement puts ${s} on its own, so Newton’s method improves each guess: the next is the guess minus f ÷ f′ there.`,
};

/**
 * The tries that find `id` from a relation's display (or its `trials` method), or undefined
 * when they can't be shown true as printed.
 */
export function trialWork(input: {
  display: string;
  id: string;
  symbol: string;
  vars: LineVars;
  values: Values;
  figures: number | undefined;
  trial?: Trial;
}): TrialWork | undefined {
  const answer = input.values[input.id];
  const variable = input.vars.find((v) => v.id === input.id);
  if (answer === undefined || !Number.isFinite(answer) || !variable) return undefined;
  const c: Context = { ...input, answer, variable };
  const trial: Trial = input.trial ?? { method: 'secant' };
  let lines: string[] | undefined;
  try {
    lines =
      trial.method === 'fixed-point' || trial.method === 'newton'
        ? byRule(c, trial)
        : bySides(c, trial.method, trial.start?.(input.values));
  } catch {
    lines = undefined;
  }
  return lines ? { how: HOW[trial.method](input.symbol), lines } : undefined;
}
