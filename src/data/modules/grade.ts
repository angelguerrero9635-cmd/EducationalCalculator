/**
 * Grade bands decide how the calculator talks to the student (the reviewer's checks E and K):
 * - early (Kindergarten–Grade 2): no letters standing for numbers anywhere; values are named
 *   in words ("Bigger amount: 11") and "=" appears only inside number sentences.
 * - elementary (Grades 3–5): letters only as labels next to a name ("Rows (r): 3"); the number
 *   sentence comes before the rule in letters.
 * - standard (Grade 6 and up, college): formulas in letters.
 */
export type GradeBand = 'early' | 'elementary' | 'standard';

/** The grade of a K–12 module id ("m.3.area~split" → "3"), or undefined for college topics. */
export const gradeOf = (moduleId: string): string | undefined =>
  /^[ms]\.(K|\d{1,2})\./.exec(moduleId)?.[1];

export function gradeBand(moduleId: string): GradeBand {
  const g = gradeOf(moduleId);
  if (g === undefined) return 'standard';
  if (g === 'K' || Number(g) <= 2) return 'early';
  return Number(g) <= 5 ? 'elementary' : 'standard';
}

/**
 * Kindergarten–Grade 2 modules say “number sentence” instead of “formula” and use simpler
 * prompts (CCSS wording for these grades).
 */
export const isEarlyGrade = (moduleId: string) => gradeBand(moduleId) === 'early';

/** Grades 3–5: letters appear only as labels next to names; number sentences come first. */
export const isElementary = (moduleId: string) => gradeBand(moduleId) === 'elementary';

/**
 * A named value the way the grade reads it: "Bigger amount: 11" (K–2), "Rows (r): 3" (3–5)
 * or "r = 3". Used for the lists in the step-by-step and the labels under a picture.
 */
export function quantityLabel(band: GradeBand, name: string, symbol: string, value: string) {
  if (band === 'early') return `${name}: ${value}`;
  if (band === 'elementary') return `${name} (${symbol}): ${value}`;
  return `${symbol} = ${value}`;
}
