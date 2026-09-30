/**
 * A sign box driving a picture (H90): the sign a value codes as `{s:sign}` stores it, reversed
 * while a `flip` value is negative. Shared by the pictures and the harness.
 */
import type { InequalitySign } from '@/data/modules/typesGraphs';
import type { ShadeSign, SignOf } from '@/data/modules/typesHs2a';

/** The signs in code order, from 1: 1 <, 2 ≤, 3 >, 4 ≥, 5 = (a relation box), 6 ≠. */
export const SIGN_CODES = ['<', '≤', '>', '≥', '=', '≠'] as const;
export type SignCode = (typeof SIGN_CODES)[number];

const REVERSED: Record<SignCode, SignCode> = {
  '<': '>',
  '≤': '≥',
  '>': '<',
  '≥': '≤',
  '=': '=',
  '≠': '≠',
};

/** A value's number, or undefined while it is "?". */
export type ReadValue = (id: string) => number | undefined;

/** The sign the box holds (reversed while `flip` is negative), or undefined until one is chosen. */
export function signOf(s: SignOf, read: ReadValue): SignCode | undefined {
  const code = read(s.sign);
  const sign = code === undefined ? undefined : SIGN_CODES[Math.round(code) - 1];
  if (!sign) return undefined;
  const f = s.flip === undefined ? undefined : read(s.flip);
  return f !== undefined && f < 0 ? REVERSED[sign] : sign;
}

/** One of < ≤ > ≥, or undefined. */
export const asInequality = (s: SignCode | undefined): InequalitySign | undefined =>
  s === '<' || s === '≤' || s === '>' || s === '≥' ? s : undefined;

/** A shade's inequality sign: a fixed one, or the box's (none for =, ≠ or no sign yet). */
export const shadeSign = (s: ShadeSign | undefined, read: ReadValue) =>
  s === undefined ? undefined : typeof s === 'string' ? s : asInequality(signOf(s, read));

/** The sign written in an equation: fixed, the box's, or "?" before one is chosen. */
export const shadeSaid = (s: ShadeSign | undefined, read: ReadValue): string | undefined =>
  s === undefined ? undefined : typeof s === 'string' ? s : (signOf(s, read) ?? '?');

/** Hₐ's sign as a test's tail: < and ≤ left, > and ≥ right, ≠ both (undefined for = or none). */
export function tailOf(
  tail: 'left' | 'right' | 'two' | SignOf,
  read: ReadValue,
): 'left' | 'right' | 'two' | undefined {
  if (typeof tail === 'string') return tail;
  const s = signOf(tail, read);
  return s === '<' || s === '≤'
    ? 'left'
    : s === '>' || s === '≥'
      ? 'right'
      : s === '≠'
        ? 'two'
        : undefined;
}

/** The caption for a tail from Hₐ's sign box: "Hₐ uses <: the p-value is the left tail." */
export function tailWords(tail: SignOf, read: ReadValue) {
  const s = signOf(tail, read);
  const t = tailOf(tail, read);
  return !t
    ? `Choose Hₐ’s sign (<, > or ≠) to shade the tail${s === '=' ? ': Hₐ can’t be =' : ''}.`
    : `Hₐ uses ${s}: ${t === 'two' ? 'both tails count, past −|z| and |z|' : `the ${t} tail counts`}.`;
}

/** Whether a bound is closed: fixed, or its sign box holds ≤ or ≥ (2 or 4). */
export const closedEnd = (c: boolean | string | undefined, read: ReadValue) =>
  typeof c === 'string' ? [2, 4].includes(Math.round(read(c) ?? 0)) : !!c;
