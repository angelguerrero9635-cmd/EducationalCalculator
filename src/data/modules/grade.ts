/**
 * Grade bands decide how the calculator talks to the student (the reviewer's checks E and K):
 * - early (Kindergarten–Grade 2): no letters standing for numbers anywhere; values are named
 *   in words ("Bigger amount: 11") and "=" appears only inside number sentences.
 * - elementary (Grades 3–5): still no letters (variables start in Grade 6, 6.EE.2); the rule
 *   is written in words ("Length × width = area") under the number sentence, and equations
 *   name the value ("Area = 4 × 3").
 * - Grade 6 is where letters arrive (6.EE.2). Pages that teach them (expressions, equations,
 *   area and cube formulas, `notation: 'letters'`) are `middle`: the formula in letters with
 *   its meaning, the numbers put in with the unknown kept as its letter, then one undo step
 *   per line (never a rearranged letter line). Every other Grade 6 page reads like Grades 3–5
 *   (`elementary`), with Grade 6 content (negatives, written work).
 * - Grades 7 and 8 are `middle` too: the formula in letters with its meaning, then one undo
 *   step per line, since these grades still learn to rearrange.
 * - standard (Grade 9 and up, college): formulas in letters, rearranged as letter lines.
 */
export type GradeBand = 'early' | 'elementary' | 'middle' | 'standard';

/** Grade 6 pages written with letters (registered from each module's `notation`). */
const LETTER_PAGES = new Set<string>();
export function registerLetterPages(ids: Iterable<string>) {
  for (const id of ids) LETTER_PAGES.add(id);
}

/** The grade of a K–12 module id ("m.3.area~split" → "3"), or undefined for college topics. */
export const gradeOf = (moduleId: string): string | undefined =>
  /^[ms]\.(K|\d{1,2})\./.exec(moduleId)?.[1];

export function gradeBand(moduleId: string): GradeBand {
  const g = gradeOf(moduleId);
  if (g === undefined) return 'standard';
  if (g === 'K' || Number(g) <= 2) return 'early';
  if (Number(g) === 6) return LETTER_PAGES.has(moduleId) ? 'middle' : 'elementary';
  if (Number(g) <= 5) return 'elementary';
  return Number(g) <= 8 ? 'middle' : 'standard';
}

/**
 * Kindergarten–Grade 2 modules say “number sentence” instead of “formula” and use simpler
 * prompts (CCSS wording for these grades).
 */
export const isEarlyGrade = (moduleId: string) => gradeBand(moduleId) === 'early';

/** Grades 3–5: names and word rules, no letters; number sentences come first. */
export const isElementary = (moduleId: string) => gradeBand(moduleId) === 'elementary';

/**
 * A named value the way the grade reads it: "Bigger amount: 11" (K–5) or "r = 3" (Grade 6
 * on). Used for the lists in the step-by-step and the labels under a picture.
 */
// An acronym keeps its capitals ("MAD of class A").
const lowerName = (t: string) => (/^[A-Z]{2}/.test(t) ? t : `${t[0]!.toLowerCase()}${t.slice(1)}`);

export function quantityLabel(band: GradeBand, name: string, symbol: string, value: string) {
  if (band === 'middle') return `${symbol} = ${value} (${lowerName(name)})`;
  if (band !== 'standard') return `${name}: ${value}`;
  return `${symbol} = ${value}`;
}

/** A rule in words for K–5: the variables' names in place of their symbols. */
export const namedVariables = <V extends { symbol: string; name: string }>(vars: readonly V[]) =>
  vars.map((v) => ({ ...v, symbol: v.name }));

/**
 * A relation's rule in words (Grades 3–5): names for symbols, and a fraction of two names read
 * "over" ("First numerator over first denominator"), since "First numerator/First
 * denominator" is hard to read.
 */
export function wordRule(
  display: string,
  vars: readonly { id: string; symbol: string; name: string }[],
  words?: string,
): string {
  const byId = new Map(vars.map((v) => [v.id, v.name]));
  const lower = lowerName;
  // Names read as words in a sentence: capital only at the start of the rule.
  const word = (t: string, at: number) => {
    const name = t.startsWith('{') ? byId.get(t.slice(1, -1)) : undefined;
    return name === undefined ? t : at === 0 ? name : lower(name);
  };
  return dedupe(
    (words ?? display)
      // Letters written side by side multiply: "{k}{x}" reads "constant × input".
      .replace(/\}(?=[{(])/g, '} × ')
      .replace(/(\{\w+\}|\d+)\/(\{\w+\}|\d+)/g, (m, top: string, bottom: string, at: number) =>
        top.startsWith('{') || bottom.startsWith('{')
          ? `${word(top, at)} over ${word(bottom, 1)}`
          : m,
      )
      .replace(/\{(\w+)\}/g, (m, id: string, at: number) => word(`{${id}}`, at)),
  );
}

/**
 * A name dropped next to its own word reads twice ("Shaded shaded", "full groups full
 * groups", "inch inch"): keep one copy of a repeated run of one to three words.
 */
function dedupe(text: string): string {
  let out = text;
  for (let n = 3; n >= 1; n--) {
    const re = new RegExp(`\\b((?:[A-Za-z’']+\\s+){${n - 1}}[A-Za-z’']+)\\s+\\1\\b`, 'gi');
    out = out.replace(re, '$1');
  }
  return out;
}
