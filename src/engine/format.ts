import type { Values, VariableDef } from './types';

/** Compact display: whole numbers as-is, up to 4 decimals, scientific for extremes. */
export function formatNumber(
  x: number,
  variable?: Pick<VariableDef, 'integer' | 'digits'>,
): string {
  if (variable?.integer) return String(Math.round(x)).padStart(variable.digits ?? 0, '0');
  if (x === 0) return '0';
  const abs = Math.abs(x);
  if (abs >= 1e7 || abs < 1e-4) return x.toExponential(3).replace('e+', 'e');
  // Below 1, keep 4 significant figures (0.003183, not 0.0032); otherwise 4 decimals.
  return String(Number(abs < 1 ? x.toPrecision(4) : x.toFixed(4)));
}

/** Parses user input; accepts "1,000", "−3" (Unicode minus) and "1e3". Undefined when blank. */
export function parseNumber(text: string): number | undefined | 'invalid' {
  const cleaned = text.trim().replace(/,/g, '').replace(/−/g, '-');
  if (cleaned === '') return undefined;
  if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(cleaned)) return 'invalid';
  return Number(cleaned);
}

/**
 * A money amount typed into a box in cents: "$1.25", "1.25" or "$3" are dollars (125, 300);
 * a plain whole number is already cents ("125" → 125).
 */
export function parseCents(text: string): number | undefined | 'invalid' {
  const cleaned = text.trim().replace(/,/g, '').replace(/¢$/, '');
  const dollars = /^\$\s*(\d*\.?\d{0,2})$/.exec(cleaned) ?? /^(\d*\.\d{0,2})$/.exec(cleaned);
  if (dollars) {
    if (dollars[1] === '' || dollars[1] === '.')
      return cleaned.startsWith('$') ? undefined : 'invalid';
    return Math.round(Number(dollars[1]) * 100);
  }
  return parseNumber(cleaned);
}

/** Fills a display template: `{id}` → the symbol (symbolic) or the formatted value / "?". */
export function renderTemplate(
  template: string,
  variables: readonly VariableDef[],
  values?: Values,
): string {
  const byId = new Map(variables.map((v) => [v.id, v]));
  const filled = template.replace(/\{(\w+)\}/g, (_, id: string) => {
    const variable = byId.get(id);
    if (!variable) return id;
    if (!values) return variable.symbol;
    const x = values[id];
    if (x === undefined) return '?';
    const s = formatNumber(x, variable);
    return x < 0 ? `(${s})` : s;
  });
  // A minus sign in the template in front of a 0 (e.g. −v₀ with v₀ = 0) reads as just 0.
  return values ? filled.replace(/(^|[(\s])−0(?![\d.])/g, '$10') : filled;
}

const ONES = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** A whole number from 0 to 1,000 in words: 347 → "three hundred forty-seven". */
export function numberWords(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 1000) return formatNumber(n);
  if (n === 1000) return 'one thousand';
  const h = Math.floor(n / 100);
  const r = n % 100;
  const rest = r < 20 ? ONES[r]! : `${TENS[Math.floor(r / 10)]}${r % 10 ? `-${ONES[r % 10]}` : ''}`;
  if (h === 0) return rest;
  return `${ONES[h]} hundred${r ? ` ${rest}` : ''}`;
}
