/**
 * Prices and plans (owner decisions, 2026-10-03). Shown on the plans page; no purchase logic
 * yet (config/access.ts unlocks everything).
 *
 * - Getting in: $1 once, as the App Store price of the app or the sign-up fee on the web.
 * - Plans, monthly: Basic, Advanced, Premium; Premium also yearly.
 * - Basic and Advanced: the chosen college courses can be changed after one billing cycle.
 */

/** The one-time price of getting in: the App Store download, or signing up on the web. */
export const ACCESS_USD = 1;

export type PlanId = 'basic' | 'advanced' | 'premium';

export interface Plan {
  id: PlanId;
  name: string;
  /** Monthly price in US dollars. */
  monthlyUsd: number;
  /** Yearly price, where a plan has one. */
  yearlyUsd?: number;
  /** Every K–12 grade and subject. */
  k12: boolean;
  /** College courses the plan holds: a number to choose, or every course. */
  courses: number | 'all';
}

export const PLANS: readonly Plan[] = [
  { id: 'basic', name: 'Basic', monthlyUsd: 1, k12: true, courses: 1 },
  { id: 'advanced', name: 'Advanced', monthlyUsd: 5, k12: true, courses: 7 },
  { id: 'premium', name: 'Premium', monthlyUsd: 10, yearlyUsd: 100, k12: true, courses: 'all' },
];

/** How many billing cycles must pass before chosen courses can be changed (Basic, Advanced). */
export const COURSE_CHANGE_AFTER_CYCLES = 1;

/** "$1", "$100", "$0.99". */
export function usd(amount: number): string {
  return `$${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}

/** "$1 a month". */
export function monthly(amount: number): string {
  return `${usd(amount)} a month`;
}

/** What a plan's college courses are, in words: "1 college course", "7 college courses", "Every college course". */
export function coursesLabel(plan: Plan): string {
  return plan.courses === 'all'
    ? 'Every college course'
    : `${plan.courses} college course${plan.courses === 1 ? '' : 's'} you choose`;
}

/** One line for Settings and the locked card: "Plans from $1 a month". */
export const PLANS_FROM = `Plans from ${monthly(Math.min(...PLANS.map((p) => p.monthlyUsd)))}`;
