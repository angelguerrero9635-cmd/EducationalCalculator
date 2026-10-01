/**
 * Choice boxes: a sign the student taps through in an equation row ({s:sign}, {h:alt}). The
 * value stored is a code the relations read; the box and the steps show the sign.
 */

/** What a choice box cycles through. */
export type Choices = 'sign' | 'relation' | 'op' | 'alt';

export const CHOICES: Record<Choices, readonly string[]> = {
  // As the inequality pages code it: 1 <, 2 ≤, 3 >, 4 ≥ (and 5 = for `relation`).
  sign: ['<', '≤', '>', '≥'],
  relation: ['<', '≤', '>', '≥', '='],
  op: ['+', '−'],
  // A test's alternative hypothesis Hₐ: <, > or ≠, stored as the hypothesis pages code it.
  alt: ['<', '>', '≠'],
};

/** The value stored for each sign, when it isn't the sign's place counted from 1. */
const CODES: Partial<Record<Choices, readonly number[]>> = {
  alt: [1, 3, 6],
};

/** The value stored for the sign at `index` (from 0). */
export const choiceCode = (choices: Choices, index: number) => CODES[choices]?.[index] ?? index + 1;

/** The sign's place (from 0) for a stored value, or undefined when it is no sign's. */
export function choiceIndex(choices: Choices, value: number | undefined): number | undefined {
  if (value === undefined) return undefined;
  const at = CHOICES[choices].findIndex((_, i) => choiceCode(choices, i) === Math.round(value));
  return at === -1 ? undefined : at;
}

/** The sign a stored value stands for ("≠" for 6 on an `alt` box), or undefined. */
export function choiceSign(choices: Choices, value: number | undefined): string | undefined {
  const at = choiceIndex(choices, value);
  return at === undefined ? undefined : CHOICES[choices][at];
}

/** `{h:alt}` in a template: the box's id and what it cycles through. */
export const CHOICE_BOX = /\{(\w+):(sign|relation|op|alt)\}/g;

/** The choice box for `id` in an equation template, if the template has one. */
export function choiceOf(template: string | undefined, id: string): Choices | undefined {
  for (const m of (template ?? '').matchAll(CHOICE_BOX)) if (m[1] === id) return m[2] as Choices;
  return undefined;
}
