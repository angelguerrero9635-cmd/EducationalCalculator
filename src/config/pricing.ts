/**
 * Prices (owner decision, 2026-10-02). Shown on the plans page; no purchase logic yet
 * (config/access.ts unlocks everything).
 */
export const PRICES = {
  /** Every K–12 grade and subject. */
  k12: { label: 'Kindergarten to Grade 12', detail: 'Every grade and subject', usd: 1 },
  /** One college course; each course is its own subscription. */
  course: { label: 'One college course', detail: 'Each course you add', usd: 1 },
} as const;

/** "$1 a month". */
export function monthly(usd: number): string {
  return `$${Number.isInteger(usd) ? usd : usd.toFixed(2)} a month`;
}
