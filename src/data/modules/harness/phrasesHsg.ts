/**
 * Step-text phrases for the Grades 9–12 biology pages of group HG, spread into PHRASES
 * (`evaluate.ts`). Test-only.
 */

const NUM = String.raw`-?\d+(?:\.\d+)?`;

export const HSG_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // The codon a base falls in: bases 1–3 are codon 1, 4–6 codon 2, … (divide by 3, round up).
  [new RegExp(`the codon holding base (${NUM})`), (p) => Math.ceil(p / 3)],
];
