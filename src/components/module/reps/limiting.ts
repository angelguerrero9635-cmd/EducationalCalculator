/**
 * The limiting reactant for `reaction` with `limiting` (H49): how many whole times a reaction
 * runs from the particles on hand, what it makes and what is left. No drawing, so the harness
 * checks the same numbers.
 */
import { atomsOf, elementsIn } from './chem';

/** Most particles of one substance drawn. */
export const MAX_PARTICLES = 12;

export function limitingOutcome(coefs: number[], amounts: number[], productCoefs: number[]) {
  const runs = Math.max(
    0,
    Math.floor(
      Math.min(...amounts.map((a, i) => (coefs[i]! > 0 ? a / coefs[i]! : Infinity))) + 1e-9,
    ),
  );
  const ratios = amounts.map((a, i) => a / coefs[i]!);
  const least = Math.min(...ratios);
  return {
    runs,
    made: productCoefs.map((p) => p * runs),
    left: amounts.map((a, i) => a - coefs[i]! * runs),
    /** Reactants whose amount runs out first (every one, when they run out together). */
    limiting: ratios.map((r) => Math.abs(r - least) < 1e-9),
  };
}

/** Whether the coefficients balance every element. */
export function balanced(
  reactants: { formula: string; n: number }[],
  products: { formula: string; n: number }[],
) {
  const els = elementsIn([...reactants, ...products].map((t) => t.formula));
  const side = (ts: { formula: string; n: number }[], el: string) =>
    ts.reduce((s, t) => s + atomsOf(t.formula, el) * t.n, 0);
  return els.every((el) => side(reactants, el) === side(products, el));
}
