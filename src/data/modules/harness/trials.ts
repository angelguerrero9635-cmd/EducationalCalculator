/**
 * Reading trial steps back (HE-E14): each try is worked out again from its printed numbers, and
 * the tries must close in on the answer. Two forms (`src/data/modules/trials.ts` writes them):
 *
 *   Try k = 0.03: ln(1 + 0.03 × 600 ÷ 15) ÷ 0.03 = 26.28 (want 25)
 *   Try x = 2: 2³ = 8; 3 × 2 + 1 = 7
 *
 * and a repeated rule or Newton's method, each line carrying the value before it:
 *
 *   E₀ = 0.5
 *   E₁ = 0.5 + 0.2 × sin(0.5) = 0.5959
 *
 * A "…" line stands for tries left out. Test-only.
 */
import { evaluate, shownClose } from './evaluate';

const VALUE = String.raw`[−-]?[\d.,]+(?: × 10[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)?`;
const TRY = new RegExp(String.raw`^Try (\S+) = (${VALUE}): (.+)$`);
const WANT = new RegExp(String.raw`^(.+) = (${VALUE}) \(want (.+)\)$`);
const PAIR = new RegExp(String.raw`^(.+) = (${VALUE}); (.+) = (${VALUE})$`);
const START = new RegExp(String.raw`^(?:Try 0: )?(\S+?)([₀-₉]*) = (${VALUE})$`);
const STEP = new RegExp(String.raw`^(?:Try (\d+): )?(\S+?)([₀-₉]*) = (.+) = (${VALUE})$`);

/** Whether a step's lines are trial lines this reader is for. */
export const isTrialLine = (line: string) => TRY.test(line);

const num = (text: string) => evaluate(text.replace(/,/g, ''));

/** Close at the figures a try prints (4 or more): a relative 10⁻³, or display rounding. */
const near = (a: number, b: number, text = '') =>
  shownClose(a, b, text) || Math.abs(a - b) <= 1e-3 * Math.max(Math.abs(a), Math.abs(b));

/**
 * The side `expr` with the guess (as printed in it) half a unit either way in its last figure:
 * 0.05558 → 0.055575 and 0.055585; 15770 → 15765 and 15775. Undefined when it doesn't read.
 */
function spread(expr: string, guessText: string): [number, number] | undefined {
  const g = guessText.replace(/,/g, '');
  if (/×/.test(g)) return undefined;
  const decimals = g.split('.')[1]?.length;
  const unit = decimals !== undefined ? 10 ** -decimals : 10 ** /0*$/.exec(g)![0].length;
  const at = (d: number) => {
    const x = (Number(g.replace('−', '-')) + d).toPrecision(15);
    const escaped = g.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return evaluate(
      expr.replace(
        new RegExp(`(?<![\\d.])${escaped}(?![\\d.])`, 'g'),
        Number(x) < 0 ? `(${Number(x)})` : String(Number(x)),
      ),
    );
  };
  const [lo, hi] = [at(-unit / 2), at(unit / 2)];
  return lo === undefined || hi === undefined ? undefined : [lo, hi];
}

/**
 * Problems with a step's trial lines (empty when each try is true as printed and they reach
 * `answer`), and the lines this reader couldn't read. `answer` is the step's value as shown.
 */
export function checkTrialLines(
  lines: readonly string[],
  answer: number,
): { problems: string[]; unread: string[]; read: boolean } {
  const problems: string[] = [];
  const unread: string[] = [];
  const tries: {
    guess: number;
    value: number;
    want: number;
    off: number;
    line: string;
    /** The side worked out with the guess half a unit either way in its last figure. */
    spread?: [number, number];
  }[] = [];
  const steps: { value: string; line: string }[] = [];
  let elided = false;
  for (const raw of lines) {
    const line = raw.replace(/(\d),(\d{3})/g, '$1$2');
    if (line === '…') {
      elided = true;
      continue;
    }
    const t = TRY.exec(line);
    if (t) {
      const guess = num(t[2]!);
      const body = t[3]!;
      const want = WANT.exec(body);
      const pair = PAIR.exec(body);
      if (guess === undefined || (!want && !pair)) {
        unread.push(raw);
        continue;
      }
      if (want) {
        const [x, v, w] = [evaluate(want[1]!), num(want[2]!), num(want[3]!)];
        if (x === undefined || v === undefined || w === undefined) {
          unread.push(raw);
          continue;
        }
        if (!near(x, v, want[1])) problems.push(`try doesn't work out as printed: "${raw}"`);
        tries.push({
          guess,
          value: v,
          want: w,
          off: v - w,
          line: raw,
          spread: spread(want[1]!, t[2]!),
        });
      } else if (pair) {
        const [x, a, y, b] = [evaluate(pair[1]!), num(pair[2]!), evaluate(pair[3]!), num(pair[4]!)];
        if (x === undefined || a === undefined || y === undefined || b === undefined) {
          unread.push(raw);
          continue;
        }
        if (!near(x, a, pair[1]) || !near(y, b, pair[3]))
          problems.push(`try doesn't work out as printed: "${raw}"`);
        tries.push({ guess, value: a, want: b, off: a - b, line: raw });
      }
      continue;
    }
    const s = STEP.exec(line);
    if (s) {
      const [x, v] = [evaluate(s[4]!), num(s[5]!)];
      if (x === undefined || v === undefined) {
        unread.push(raw);
        continue;
      }
      if (!near(x, v, s[4])) problems.push(`iteration doesn't work out as printed: "${raw}"`);
      // (each line works from the value the line before ended at)
      const before = steps[steps.length - 1];
      if (before && !elided && !s[4]!.includes(before.value))
        problems.push(`iteration doesn't start from ${before.value}: "${raw}"`);
      steps.push({ value: s[5]!, line: raw });
      elided = false;
      continue;
    }
    const z = START.exec(line);
    if (z && steps.length === 0 && tries.length === 0) {
      steps.push({ value: z[3]!, line: raw });
      continue;
    }
  }
  if (tries.length) {
    const last = tries[tries.length - 1]!;
    if (!near(last.guess, answer))
      problems.push(`the tries end at a guess that isn't the answer: "${last.line}"`);
    // (the last try meets the target at its printed figures, and is nearer it than the first)
    const first = tries[0]!;
    if (tries.length > 1 && Math.abs(last.off) > Math.abs(first.off))
      problems.push(`the tries move away from the target: "${last.line}"`);
    // (a target near 0 beside large terms: met when it lies between the side's values with the
    // guess half a unit either way in its last figure, as the guess is only that exact)
    const between =
      last.spread !== undefined &&
      last.want >= Math.min(...last.spread) - 1e-9 &&
      last.want <= Math.max(...last.spread) + 1e-9;
    if (!near(last.value, last.want) && !between)
      problems.push(`the last try doesn't meet the target: "${last.line}"`);
  }
  if (steps.length > 1) {
    const [a, b] = [steps[steps.length - 2]!, steps[steps.length - 1]!];
    if (a.value !== b.value) problems.push(`the iterations stop before they settle: "${b.line}"`);
    const v = num(b.value);
    if (v === undefined || !near(v, answer))
      problems.push(`the iterations end away from the answer: "${b.line}"`);
  }
  return { problems, unread, read: tries.length > 0 || steps.length > 1 };
}
