import { formatNumber } from '@/engine/format';
import type { Values, VariableDef } from '@/engine/types';
import type { StepText } from './types';
import {
  addStrategy,
  compareLine,
  countList,
  countUp,
  dealLines,
  divideWork,
  missingPart,
  repeated,
  subtractStrategy,
  sumSteps,
  timesWork,
} from './work';
/**
 * Shared lesson pieces: relations with their step text, written once so every section builds
 * on the same wording and the same worked lines. K–2 helpers speak in names and number
 * sentences; Grade 3 helpers use × and ÷ and letters as labels. Add to this file, not to a
 * section file, when a second section needs the same shape (docs/ENGINE_LOG.md).
 */

/** Whether n is prime (2 or more, no factor but 1 and itself). */
export const isPrime = (n: number) => {
  if (n < 2 || !Number.isInteger(n)) return false;
  for (let k = 2; k * k <= n; k++) if (n % k === 0) return false;
  return true;
};

/** The prime factors of n with repeats, smallest first: 24 → [2, 2, 2, 3]. */
export function primeFactors(n: number): number[] {
  const out: number[] = [];
  let m = Math.round(n);
  for (let p = 2; p * p <= m; p++) {
    while (m % p === 0) {
      out.push(p);
      m /= p;
    }
  }
  if (m > 1) out.push(m);
  return out;
}

/** Temperature label for K–3 (a fixed label: the unit system doesn't convert it). */
export const FAHRENHEIT = '°F';

/** c = a + b with its two take-aways, in K–2 words. `names` say the three values. */
export function sum2(
  id: string,
  [a, b, c]: [string, string, string],
  [an, bn, cn]: [string, string, string],
  display = `{${a}} + {${b}} = {${c}}`,
) {
  const relation = {
    id,
    display,
    vars: [c, a, b],
    residual: (v: Values) => v[c]! - v[a]! - v[b]!,
    solve: {
      [c]: (v: Values) => v[a]! + v[b]!,
      [a]: (v: Values) => v[c]! - v[b]!,
      [b]: (v: Values) => v[c]! - v[a]!,
    },
  };
  const steps: Record<string, StepText> = {
    [c]: {
      expr: `{${a}} + {${b}}`,
      how: `Add the ${an} and the ${bn}.`,
      work: (v) => addStrategy(v[a]!, v[b]!),
    },
    [a]: {
      expr: `{${c}} − {${b}}`,
      how: `Take the ${bn} away from the ${cn}.`,
      work: (v) => subtractStrategy(v[c]!, v[b]!),
    },
    [b]: {
      expr: `{${c}} − {${a}}`,
      how: `Count up from the ${an} to the ${cn}.`,
      work: (v) => countUp(v[a]!, v[c]!),
    },
  };
  return { relation, steps };
}

/** total = every part added, with one take-away per part. */
export function sumAll(id: string, parts: string[], total: string, what: string) {
  const rest = (p: string) => parts.filter((x) => x !== p);
  const relation = {
    id,
    display: `${parts.map((p) => `{${p}}`).join(' + ')} = {${total}}`,
    vars: [total, ...parts],
    residual: (v: Values) => v[total]! - parts.reduce((t, p) => t + v[p]!, 0),
    solve: Object.fromEntries([
      [total, (v: Values) => parts.reduce((t, p) => t + v[p]!, 0)],
      ...parts.map((p) => [p, (v: Values) => v[total]! - rest(p).reduce((t, q) => t + v[q]!, 0)]),
    ]),
  };
  const steps = Object.fromEntries([
    [
      total,
      {
        expr: parts.map((p) => `{${p}}`).join(' + '),
        how: `Add up all the ${what}.`,
        work: (v: Values) => sumSteps(parts.map((p) => v[p]!)),
      },
    ],
    ...parts.map((p) => [
      p,
      {
        expr: `{${total}} − ${rest(p)
          .map((q) => `{${q}}`)
          .join(' − ')}`,
        how: `Take the other ${what} away from the total.`,
        work: (v: Values) =>
          missingPart(
            v[total]!,
            rest(p).map((q) => v[q]!),
          ),
      },
    ]),
  ]) as Record<string, StepText>;
  return { relation, steps };
}

/**
 * Equal groups added up, the way K–2 says it: "3 pushes of 2 spaces = 6 spaces". `noun` is the
 * group (pushes), `thing` what is counted (spaces).
 */
export function groupsOf(
  id: string,
  [n, e, t]: [string, string, string],
  noun: [string, string],
  thing: [string, string],
  /** Kindergarten–Grade 1: add one group at a time (skip counting and sharing are Grade 2). */
  plain = false,
) {
  const relation = {
    id,
    display: `{${n}} ${noun[1]} of {${e}} ${thing[1]} = {${t}} ${thing[1]}`,
    vars: [t, n, e],
    residual: (v: Values) => v[t]! - v[n]! * v[e]!,
    solve: {
      [t]: (v: Values) => v[n]! * v[e]!,
      [n]: (v: Values) => div(v[t]!, v[e]!),
      [e]: (v: Values) => div(v[t]!, v[n]!),
    },
  };
  const steps: Record<string, StepText> = {
    [t]: {
      expr: `{${n}} ${noun[1]} of {${e}} ${thing[1]}`,
      how: `Add the ${thing[1]} once for each ${noun[0]}.`,
      work: (v) => [repeated(v[e]!, v[n]!)],
    },
    [n]: {
      expr: `${noun[1]} of {${e}} ${thing[1]} in {${t}}`,
      how: plain
        ? `Add the ${thing[1]} one ${noun[0]} at a time, up to the total.`
        : `Count by ${thing[1]} of one ${noun[0]} up to the total.`,
      work: (v) =>
        v[n]! <= 0
          ? []
          : plain
            ? Array.from({ length: v[n]! }, (_, k) =>
                k === 0
                  ? `1 ${noun[0]}: ${v[e]}`
                  : `${k + 1} ${noun[1]}: ${v[e]! * k} + ${v[e]} = ${v[e]! * (k + 1)}`,
              )
            : [`Count by ${v[e]}s: ${countList(0, v[e]!, v[n]!)} → ${v[n]} ${noun[1]}`],
    },
    [e]: {
      expr: `{${t}} ${thing[1]} shared by {${n}} ${noun[1]}`,
      how: plain
        ? `Give each ${noun[0]} 1, then 1 more, until all the ${thing[1]} are used.`
        : `Share the ${thing[1]} equally, one ${noun[0]} at a time.`,
      work: (v) =>
        v[n]! <= 0
          ? []
          : plain
            ? Array.from({ length: v[e]! }, (_, k) => `${k + 1} each: ${v[n]! * (k + 1)} used`)
            : dealLines(v[n]!, v[e]!, noun[0]),
    },
  };
  return { relation, steps };
}

/** A K–2 comparison: how much more, counting on from the smaller number. */
export const moreThan = (
  d: string,
  a: string,
  b: string,
  an: string,
  bn: string,
  words: [string, string],
  /** Kindergarten–Grade 1 count on one at a time; Grade 2 counts up in jumps. */
  grade: 'K1' | '2' = 'K1',
  /** The line for the difference, when "how much more" isn't what the value is called. */
  howDiff = `Count on from the smaller number to the bigger one. That is how much ${words[0]}.`,
) =>
  difference(d, a, b, {
    diff: howDiff,
    first: [
      `The ${an} is ${words[0]}: add the difference to the ${bn}.`,
      `The ${an} is ${words[1]}: take the difference from the ${bn}.`,
    ],
    second: [
      `The ${bn} is ${words[1]}: take the difference from the ${an}.`,
      `The ${bn} is ${words[0]}: add the difference to the ${an}.`,
    ],
    ...(grade === 'K1' ? { countOn: true, compareWords: words } : { countUp: true }),
    same: `There is no difference. Both are the same.`,
  });

/** c = a × b with its two divisions, in Grade 3 words. */
export function times(
  id: string,
  [a, b, c]: [string, string, string],
  [an, bn, cn]: [string, string, string],
  display = `{${a}} × {${b}} = {${c}}`,
) {
  const relation = {
    id,
    display,
    vars: [c, a, b],
    residual: (v: Values) => v[c]! - v[a]! * v[b]!,
    solve: {
      [c]: (v: Values) => v[a]! * v[b]!,
      [a]: (v: Values) => div(v[c]!, v[b]!),
      [b]: (v: Values) => div(v[c]!, v[a]!),
    },
  };
  const steps: Record<string, StepText> = {
    [c]: {
      expr: `{${a}} × {${b}}`,
      how: `Multiply the ${an} by the ${bn}.`,
      work: (v) => timesWork(v[a]!, v[b]!),
    },
    [a]: {
      expr: `{${c}} ÷ {${b}}`,
      how: `Divide the ${cn} by the ${bn}.`,
      work: (v) => divideWork(v[c]!, v[b]!),
    },
    [b]: {
      expr: `{${c}} ÷ {${a}}`,
      how: `Divide the ${cn} by the ${an}.`,
      work: (v) => divideWork(v[c]!, v[a]!, 'second'),
    },
  };
  return { relation, steps };
}

/**
 * d = how far apart a and b are (the bigger take away the smaller), whichever is bigger.
 * Knowing d and one value leaves two answers; the solver keeps the one nearest before.
 */
export function apart(
  d: string,
  a: string,
  b: string,
  [an, bn]: [string, string],
  [moreWord, lessWord]: [string, string],
  howDiff = 'Take the smaller number away from the bigger one.',
  /**
   * The note after the difference: "(the first magnet is stronger)". Left out when a name
   * already says the order ("the warmest month is warmer" says nothing), or give your own.
   */
  note?: false | ((aMore: boolean) => string),
) {
  const relation = {
    id: `${d} = ${a} and ${b} apart`,
    display: `{${a}} and {${b}} are {${d}} apart`,
    words: `Difference between {${a}} and {${b}} = {${d}}`,
    check: (v: Values) => `${Math.max(v[a]!, v[b]!)} − ${Math.min(v[a]!, v[b]!)} = ${v[d]}`,
    vars: [d, a, b],
    residual: (v: Values) => v[d]! - Math.abs(v[a]! - v[b]!),
    solve: {
      [d]: (v: Values) => Math.abs(v[a]! - v[b]!),
      [a]: (v: Values) => [v[b]! + v[d]!, v[b]! - v[d]!].filter((x) => x >= 0),
      [b]: (v: Values) => [v[a]! - v[d]!, v[a]! + v[d]!].filter((x) => x >= 0),
    },
  };
  const aMore = (v: Values) => v[a]! >= v[b]!;
  // "warmest month" already says it is warmer: the stem of the comparing word is in a name.
  const stem = moreWord.replace(/(er|r)$/, '');
  const presupposed = stem.length >= 3 && [an, bn].some((name) => name.includes(stem));
  const steps: Record<string, StepText> = {
    [d]: {
      expr: (v) => (aMore(v) ? `{${a}} − {${b}}` : `{${b}} − {${a}}`),
      how: howDiff,
      work: (v) => subtractStrategy(Math.max(v[a]!, v[b]!), Math.min(v[a]!, v[b]!)),
      note: (v) =>
        v[a]! === v[b]!
          ? '(the same)'
          : note === false || (note === undefined && presupposed)
            ? ''
            : note
              ? `(${note(aMore(v))})`
              : `(the ${aMore(v) ? an : bn} is ${moreWord})`,
    },
    [a]: {
      expr: (v) => (aMore(v) ? `{${b}} + {${d}}` : `{${b}} − {${d}}`),
      how: (v) =>
        aMore(v)
          ? `The ${an} is ${moreWord}: add the difference to the ${bn}.`
          : `The ${an} is ${lessWord}: take the difference away from the ${bn}.`,
    },
    [b]: {
      expr: (v) => (aMore(v) ? `{${a}} − {${d}}` : `{${a}} + {${d}}`),
      how: (v) =>
        aMore(v)
          ? `The ${bn} is ${lessWord}: take the difference away from the ${an}.`
          : `The ${bn} is ${moreWord}: add the difference to the ${an}.`,
    },
  };
  return { relation, steps };
}

// ─── Kindergarten–Grade 2 helpers (from the former math-k2.ts) ───────────────

export const div = (a: number, b: number) => (b === 0 ? undefined : a / b);
/** A whole-number variable (counts, digits…). */
export const whole = (
  id: string,
  symbol: string,
  name: string,
  min: number,
  max: number,
): VariableDef => ({
  id,
  symbol,
  name,
  min,
  max,
  step: 1,
  integer: true,
});
/** a + b = c and c − b = a, with Grade-level step text. */
/** Worked lines for a + b = c: add by place, subtract by jumping back, count up to a part. */
export const addWork = (v: Values) => addStrategy(v.a!, v.b!);
export const subtractWork = (v: Values) => subtractStrategy(v.c!, v.b!);
export const countUpWork = (v: Values) => countUp(v.a!, v.c!);
/**
 * d = the difference between a and b, never negative (K–2 has no negative numbers). Knowing d
 * and one value leaves two answers (more or fewer); the solver keeps the one nearest before.
 */
export function difference(
  d: string,
  a: string,
  b: string,
  how: {
    diff: string;
    /** How to find a: [when a is the bigger one, when a is the smaller one]. */
    first: [string, string];
    /** How to find b: [when a is the bigger one, when a is the smaller one]. */
    second: [string, string];
    /** Show counting up from the smaller to the bigger number (for 2- and 3-digit numbers). */
    countUp?: boolean;
    /** Start by saying which number is greater, place by place (compare-numbers lessons). */
    compare?: boolean;
    /** The formula as students read it, e.g. "{d} = how many more: {a} or {b}" (K–1). */
    display?: string;
    /** Count on and count back one at a time (Kindergarten, numbers to 10). */
    countOn?: boolean;
    /** Say which is bigger first ("7 is more than 4"): the words for [more, fewer]. */
    compareWords?: [string, string];
    /** How to find a or b when there is no difference (default: they are the same). */
    same?: string;
  },
) {
  const id = `${d} = difference of ${a} and ${b}`;
  const aMore = (v: Values) => v[a]! >= v[b]!;
  const same = how.same ?? 'There is no difference. Both are the same.';
  /**
   * Knowing one amount and the difference leaves two answers; the solver keeps one. Name the
   * other ("or 12, the other way round") so a student with the opposite problem sees it.
   */
  const otherWay = (known: number, diff: number, wentUp: boolean) => {
    const alt = wentUp ? known - diff : known + diff;
    return diff > 0 && alt >= 0 ? `(or ${formatNumber(alt)}, the other way round)` : '';
  };
  /** "Start at 4. Count on 3: 5, 6, 7 → 7" or "Start at 7. Count back 3: 6, 5, 4 → 4". */
  const counting = (from: number, by: number, up: boolean) =>
    by > 0
      ? [
          `Start at ${from}. Count ${up ? 'on' : 'back'} ${by}: ${countList(from, up ? 1 : -1, by)} → ${up ? from + by : from - by}`,
        ]
      : [];
  const relation = {
    id,
    display: how.display ?? `{${a}} and {${b}} are {${d}} apart`,
    vars: [d, a, b],
    residual: (v: Values) => v[d]! - Math.abs(v[a]! - v[b]!),
    // Compare lessons end with the sign students write ("45 < 54, 9 apart").
    check: (v: Values) =>
      how.compare
        ? `${formatNumber(v[a]!)} ${v[a]! < v[b]! ? '<' : v[a]! > v[b]! ? '>' : '='} ${formatNumber(v[b]!)}, ${formatNumber(Math.abs(v[a]! - v[b]!))} apart`
        : `${formatNumber(Math.max(v[a]!, v[b]!))} − ${formatNumber(Math.min(v[a]!, v[b]!))} = ${formatNumber(Math.abs(v[a]! - v[b]!))}`,
    solve: {
      [d]: (v: Values) => Math.abs(v[a]! - v[b]!),
      [a]: (v: Values) => [v[b]! + v[d]!, v[b]! - v[d]!],
      [b]: (v: Values) => [v[a]! - v[d]!, v[a]! + v[d]!],
    },
  };
  const steps: Record<string, Record<string, StepText>> = {
    [id]: {
      [d]: {
        expr: (v) => (aMore(v) ? `{${a}} − {${b}}` : `{${b}} − {${a}}`),
        how: how.diff,
        ...(how.countUp || how.compare || how.countOn
          ? {
              work: (v: Values) => {
                const [lo, hi] = [Math.min(v[a]!, v[b]!), Math.max(v[a]!, v[b]!)];
                return [
                  ...(how.compare ? [compareLine(v[a]!, v[b]!)] : []),
                  ...(how.compareWords && hi > lo
                    ? [`${hi} is ${how.compareWords[0]} than ${lo}`]
                    : []),
                  ...(how.countUp ? countUp(lo, hi) : []),
                  ...(how.countOn && hi > lo
                    ? [`Count on from ${lo}: ${countList(lo, 1, hi - lo)} → ${hi - lo}`]
                    : []),
                ];
              },
            }
          : {}),
      },
      [a]: {
        expr: (v) => (aMore(v) ? `{${b}} + {${d}}` : `{${b}} − {${d}}`),
        how: (v) => (v[d] === 0 ? same : how.first[aMore(v) ? 0 : 1]),
        note: (v) => (how.countOn ? '' : otherWay(v[b]!, v[d]!, aMore(v))),
        work: (v) =>
          how.countOn
            ? counting(v[b]!, v[d]!, aMore(v))
            : aMore(v)
              ? addStrategy(v[b]!, v[d]!)
              : subtractStrategy(v[b]!, v[d]!),
      },
      [b]: {
        expr: (v) => (aMore(v) ? `{${a}} − {${d}}` : `{${a}} + {${d}}`),
        how: (v) => (v[d] === 0 ? same : how.second[aMore(v) ? 0 : 1]),
        note: (v) => (how.countOn ? '' : otherWay(v[a]!, v[d]!, !aMore(v))),
        work: (v) =>
          how.countOn
            ? counting(v[a]!, v[d]!, !aMore(v))
            : aMore(v)
              ? subtractStrategy(v[a]!, v[d]!)
              : addStrategy(v[a]!, v[d]!),
      },
    },
  };
  return { relation, steps };
}
/** "(one fourth of the whole; 4 fourths make the whole)". */
export function fractionNote(k: number, p: number): string {
  const names: Record<number, [string, string]> = {
    2: ['half', 'halves'],
    3: ['third', 'thirds'],
    4: ['fourth', 'fourths'],
  };
  const name = names[p];
  if (!name) return '';
  if (k === 0) return `(0 ${name[1]} shaded)`;
  if (k === p) return `(${p} ${name[1]} make the whole)`;
  return `(${k === 1 ? `one ${name[0]}` : `${k} ${name[1]}`} of the whole; ${p} ${name[1]} make the whole)`;
}
export const cmpShapes = difference('d', 'c', 's', {
  display: 'Line up {c} and {s}: {d} extra',
  diff: 'Line up the two columns. Count the extra pictures in the taller one.',
  countOn: true,
  compareWords: ['more', 'fewer'],
  first: [
    'There are more circles. Add the extra to the squares.',
    'There are fewer circles. Take the extra away from the squares.',
  ],
  second: [
    'There are more circles. Take the extra away from the circles.',
    'There are fewer circles. Add the extra to the circles.',
  ],
});
export const cmpBars = difference('d', 'a', 'b', {
  display: 'Bars {a} and {b} are {d} apart',
  diff: 'Count up from the shorter bar’s number to the taller bar’s number.',
  // Within 10, count on one at a time (the bars are 0–10).
  countOn: true,
  first: [
    'Soccer is taller. Add the difference to basketball.',
    'Soccer is shorter. Subtract the difference from basketball.',
  ],
  second: [
    'Soccer is taller. Subtract the difference from soccer.',
    'Soccer is shorter. Add the difference to soccer.',
  ],
});

/**
 * A difference with a direction: `out` = `big` − `small` (after − before, before − after).
 * Use it for a rise, a loss or how much farther; `apart` is for "how far apart", which has
 * no direction.
 */
export const minus = (
  id: string,
  [out, big, small]: [string, string, string],
  [outHow, bigHow, smallHow]: [string, string, string],
) => ({
  relation: {
    id,
    display: `{${big}} − {${small}} = {${out}}`,
    vars: [out, big, small],
    residual: (v: Values) => v[out]! - v[big]! + v[small]!,
    solve: {
      [out]: (v: Values) => v[big]! - v[small]!,
      [big]: (v: Values) => v[out]! + v[small]!,
      [small]: (v: Values) => v[big]! - v[out]!,
    },
  },
  steps: {
    [out]: { expr: `{${big}} − {${small}}`, how: outHow },
    [big]: { expr: `{${out}} + {${small}}`, how: bigHow },
    [small]: { expr: `{${big}} − {${out}}`, how: smallHow },
  },
});

/**
 * A number split into its places, biggest first, zeros left out: 347 → [300, 40, 7];
 * 2.35 → [2, 0.3, 0.05]; 0 → [0]. For the area model's boxes.
 */
export function placeParts(x: number): number[] {
  const [whole, frac = ''] = Math.abs(x)
    .toFixed(6)
    .replace(/0+$/, '')
    .replace(/\.$/, '')
    .split('.');
  const out: number[] = [];
  [...whole!].forEach((d, i) => {
    if (d !== '0') out.push(Number(d) * 10 ** (whole!.length - 1 - i));
  });
  [...frac].forEach((d, i) => {
    if (d !== '0') out.push(Number((Number(d) / 10 ** (i + 1)).toFixed(i + 1)));
  });
  return out.length ? out : [0];
}

/**
 * A named order the story fixes (the hard push rolls at least as far as the gentle one): the
 * solver rejects values that break it, so a note never calls the smaller one bigger.
 */
export const atLeast = (big: string, small: string) => ({
  id: `${big} ≥ ${small}`,
  constraint: true as const,
  display: `{${big}} is at least {${small}}`,
  vars: [big, small],
  residual: (v: Values) => (v[big]! >= v[small]! ? 0 : 1),
  solve: {},
});
