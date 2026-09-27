/**
 * Quotients and shares as fractions: 100 ÷ 3 is 33 1/3, not 33.3333, and 19/8 L is 2 3/8 L.
 * The engine keeps values as numbers, so the fraction is read back from the value: the
 * smallest bottom (up to `maxBottom`) whose fraction is the value to within rounding. A value
 * that is no such fraction (a typed 33.333) keeps its decimal, so a picture never shows a
 * fraction the value isn't.
 */
import { formatNumber, unitFor } from '@/engine/format';

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** [top, bottom] in lowest terms with bottom ≤ maxBottom, or undefined when there is none. */
export function toFraction(x: number, maxBottom = 16): [number, number] | undefined {
  if (!Number.isFinite(x)) return undefined;
  const tol = 1e-9 * Math.max(1, Math.abs(x));
  for (let b = 1; b <= maxBottom; b++) {
    const t = Math.round(x * b);
    if (Math.abs(t / b - x) <= tol) {
      const g = gcd(Math.abs(t), b) || 1;
      return [t / g, b / g];
    }
  }
  return undefined;
}

/** Parts of a whole cut into `bottom`, as a mixed number: 73 fourths → "18 1/4", 8/4 → "2". */
export function mixedParts(top: number, bottom: number): string {
  if (bottom <= 0) return '?';
  const sign = top < 0 ? '−' : '';
  const t = Math.abs(top);
  const w = Math.floor(t / bottom);
  const r = t - w * bottom;
  if (r === 0) return `${sign}${formatNumber(w)}`;
  return w === 0 ? `${sign}${r}/${bottom}` : `${sign}${formatNumber(w)} ${r}/${bottom}`;
}

/**
 * A number as a mixed number in lowest terms when it is a fraction with a small bottom
 * (33.333… → "33 1/3", 2.375 → "2 3/8", 0.75 → "3/4", 6 → "6"); otherwise as a decimal.
 */
export function mixedText(x: number, maxBottom = 16): string {
  const f = toFraction(x, maxBottom);
  return f ? mixedParts(f[0], f[1]) : formatNumber(x);
}

/** A value as a mixed number with its unit: "2 3/8 L", "33 1/3 groups"; "?" when unknown. */
export function mixedValue(
  rep: {
    known: (id: string) => boolean;
    shown: (id: string) => number;
    unit: (id: string) => string | undefined;
    value: (id: string, withUnit?: boolean) => string;
  },
  id: string,
  withUnit = true,
): string {
  if (!rep.known(id)) return '?';
  const x = rep.shown(id);
  const unit = rep.unit(id);
  // Dollars and percents are read as decimals.
  if (unit === '$' || unit === '%' || unit === '¢' || !toFraction(x))
    return rep.value(id, withUnit);
  const text = mixedText(x);
  if (!withUnit || !unit) return text;
  return `${text}${unit === '°' || unit === '×' ? '' : ' '}${unitFor(x, unit)}`;
}
