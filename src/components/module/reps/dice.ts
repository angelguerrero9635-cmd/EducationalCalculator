/**
 * Two dice's 36 pairs and an event on them (a sum of 7, a product of at least 12): pure
 * counting for the dice grid picture and its harness check.
 */
export type DiceEvent = 'sum' | 'difference' | 'product';
export type DiceCompare = '=' | '<' | '≤' | '>' | '≥';
type Event = DiceEvent;
type Compare = DiceCompare;

/** What a pair of dice shows for the event: their sum, difference (bigger − smaller) or product. */
export const diceValue = (event: Event, a: number, b: number) =>
  event === 'difference' ? Math.abs(a - b) : event === 'product' ? a * b : a + b;

/** Whether a pair's value is in the event (= 7, ≥ 10, …). */
export const inEvent = (compare: Compare, x: number, t: number) =>
  compare === '<'
    ? x < t
    : compare === '≤'
      ? x <= t
      : compare === '>'
        ? x > t
        : compare === '≥'
          ? x >= t
          : x === t;

/** How many of the 36 pairs are in the event. */
export const diceCount = (event: Event, compare: Compare, t: number) => {
  let n = 0;
  for (let a = 1; a <= 6; a++)
    for (let b = 1; b <= 6; b++) if (inEvent(compare, diceValue(event, a, b), t)) n++;
  return n;
};
