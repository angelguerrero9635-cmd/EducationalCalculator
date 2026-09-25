/**
 * Shared lesson pieces: relations with their step text, written once so every section builds
 * on the same wording and the same worked lines. K–2 helpers speak in names and number
 * sentences; Grade 3 helpers use × and ÷ and letters as labels. Add to this file, not to a
 * section file, when a second section needs the same shape (docs/ENGINE_LOG.md).
 */
import type { Values } from '@/engine/types';

import { difference, div, whole } from './math-k2';
import type { StepText } from './types';
import {
  addStrategy,
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

export { div, whole };

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
) =>
  difference(d, a, b, {
    diff: `Count on from the smaller number to the bigger one. That is how much ${words[0]}.`,
    first: [
      `The ${an} is ${words[0]}: add the difference to the ${bn}.`,
      `The ${an} is ${words[1]}: take the difference from the ${bn}.`,
    ],
    second: [
      `The ${bn} is ${words[1]}: take the difference from the ${an}.`,
      `The ${bn} is ${words[0]}: add the difference to the ${an}.`,
    ],
    ...(grade === 'K1' ? { countOn: true } : { countUp: true }),
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
) {
  const relation = {
    id: `${d} = ${a} and ${b} apart`,
    display: `{${a}} and {${b}} are {${d}} apart`,
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
  const steps: Record<string, StepText> = {
    [d]: {
      expr: (v) => (aMore(v) ? `{${a}} − {${b}}` : `{${b}} − {${a}}`),
      how: howDiff,
      work: (v) => subtractStrategy(Math.max(v[a]!, v[b]!), Math.min(v[a]!, v[b]!)),
      note: (v) => (v[a]! === v[b]! ? '(the same)' : `(the ${aMore(v) ? an : bn} is ${moreWord})`),
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
