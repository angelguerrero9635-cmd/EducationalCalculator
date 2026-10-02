/**
 * Form lines for calculus steps (HE-E6): a function written with its free variable and the
 * page's numbers put in ("V′(x) = 12x² − 240x + 900", "y(t) = 50e^(−0.2t)"), as a page's
 * `work` lines state them. The harness (`harness/calculus.ts`) checks each form at sample
 * points against the function it is the derivative, antiderivative or ODE solution of.
 */
import { formatNumber } from '@/engine/format';

/** Raised digits for a whole power: 2 → "²", −1 → "⁻¹". */
const raised = (n: number) =>
  [...String(n)].map((c) => (c === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)])).join('');

/**
 * Terms joined with their signs: [[12, 'x²'], [−240, 'x'], [900, '']] → "12x² − 240x + 900".
 * A 0 term is left out, a 1 or −1 before a letter is not written, and no term at all is "0".
 */
export function termsForm(terms: readonly (readonly [number, string])[]): string {
  const out: string[] = [];
  for (const [k, x] of terms) {
    if (k === 0 || !Number.isFinite(k)) continue;
    const size = Math.abs(k) === 1 && x ? '' : formatNumber(Math.abs(k));
    const sign = k < 0 ? '−' : '+';
    out.push(out.length === 0 ? `${k < 0 ? '−' : ''}${size}${x}` : `${sign} ${size}${x}`);
  }
  return out.length ? out.join(' ') : '0';
}

/** A polynomial by its coefficients, highest power first: [3, 0, −4, 0] → "3x³ − 4x". */
export function polyForm(coefficients: readonly number[], v = 'x'): string {
  const n = coefficients.length - 1;
  return termsForm(
    coefficients.map((k, i) => {
      const p = n - i;
      return [k, p === 0 ? '' : p === 1 ? v : `${v}${raised(p)}`] as const;
    }),
  );
}

/** The derivative's coefficients, highest power first: [1, 0, −4, 0] → [3, 0, −4]. */
export function polyDerivative(coefficients: readonly number[]): number[] {
  const n = coefficients.length - 1;
  return coefficients.slice(0, -1).map((k, i) => k * (n - i));
}

/** c·e^(kv) as written: "50e^(−0.2t)", "e^(t)", "−3e^(2x)"; k = 0 is c alone. */
export function expForm(c: number, k: number, v = 't'): string {
  if (k === 0 || c === 0) return formatNumber(c);
  const power = k === 1 ? v : k === -1 ? `−${v}` : `${formatNumber(k)}${v}`;
  const size = Math.abs(c) === 1 ? '' : formatNumber(Math.abs(c));
  return `${c < 0 ? '−' : ''}${size}e^(${power})`;
}
