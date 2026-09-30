import type { Values, VariableDef } from './types';

/** Compact display: whole numbers as-is, up to 4 decimals, scientific for extremes. */
export function formatNumber(
  x: number,
  variable?: Pick<
    VariableDef,
    'integer' | 'digits' | 'fraction' | 'pi' | 'scientific' | 'repeating' | 'full' | 'sigFigs'
  >,
): string {
  if (variable?.sigFigs && x !== 0 && Number.isFinite(x)) return significant(x, variable.sigFigs);
  if (variable?.full && x !== 0 && Number.isFinite(x)) {
    const e = Math.floor(Math.log10(Math.abs(x)) + 1e-12);
    const a = Number((Math.abs(x) / 10 ** e).toPrecision(12));
    return `${x < 0 ? '−' : ''}${fullDecimal(a, e)}`;
  }
  if (variable?.repeating && !Number.isInteger(x)) {
    const r = repeatingDecimal(x);
    if (r) return r;
  }
  if (variable?.pi && x !== 0) {
    const p = (variable.pi === 'fraction' ? asPiFraction(x) : undefined) ?? asPiMultiple(x);
    if (p) return p;
  }
  if (variable?.scientific && x !== 0) return scientific(x);
  if (variable?.fraction && !Number.isInteger(x)) {
    const f = asFraction(x, variable.fraction);
    if (f) return f;
  }
  // Padded numbers are clock minutes ("05"): no separators there.
  if (variable?.integer && variable.digits) {
    return String(Math.round(x)).padStart(variable.digits, '0');
  }
  // Negatives with a true minus sign (−4), as printed in class.
  if (variable?.integer) return minus(withSeparators(String(Math.round(x) || 0)));
  if (x === 0) return '0';
  const abs = Math.abs(x);
  // Whole numbers are written out in full (20,000,000; 999,890,001) up to a quadrillion.
  if (Number.isInteger(x) && abs < 1e15) return minus(withSeparators(String(x)));
  // Very big or very small: scientific notation as it is written in class (3 × 10¹⁶), never
  // the calculator's 3e16.
  if (abs >= 1e7 || abs < 1e-4) return scientific(x);
  // Below 1, keep 4 significant figures (0.003183, not 0.0032); otherwise 4 decimals.
  return minus(withSeparators(String(Number(abs < 1 ? x.toPrecision(4) : x.toFixed(4)))));
}

const minus = (s: string) => s.replace(/^-/, '−');

/**
 * a × 10ⁿ written out in full from a's digits (up to 4 decimals), so no floating-point error
 * creeps in: (4.7, 5) → "470,000"; (3, −4) → "0.0003".
 */
export function fullDecimal(a: number, n: number): string {
  const group = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const [whole, frac = ''] = String(Number(a.toFixed(4))).split('.');
  const digits = `${whole}${frac}`.replace(/^0+(?=\d)/, '');
  const point = whole!.replace(/^0+/, '').length + n;
  if (point <= 0) return `0.${'0'.repeat(-point)}${digits}`;
  if (point >= digits.length) return group(digits + '0'.repeat(point - digits.length));
  return `${group(digits.slice(0, point))}.${digits.slice(point)}`;
}

/**
 * The decimal of a fraction with a denominator up to 999, split where it starts repeating:
 * 1/6 → { whole: '0', fixed: '1', repeat: '6' }; 3/8 → { …, fixed: '375', repeat: '' }.
 * Undefined when x is not such a fraction or the block is longer than `longest` digits.
 */
export function decimalDigits(
  x: number,
  longest = 6,
): { negative: boolean; whole: string; fixed: string; repeat: string } | undefined {
  const abs = Math.abs(x);
  let den = 0;
  for (let d = 1; d <= 999; d++) {
    if (Math.abs(abs * d - Math.round(abs * d)) < 1e-9 * Math.max(1, abs * d)) {
      den = d;
      break;
    }
  }
  if (den === 0) return undefined;
  const num = Math.round(abs * den);
  const whole = Math.floor(num / den);
  let rem = num % den;
  const seen = new Map<number, number>();
  let digits = '';
  while (rem !== 0 && !seen.has(rem)) {
    seen.set(rem, digits.length);
    rem *= 10;
    digits += String(Math.floor(rem / den));
    rem %= den;
    if (digits.length > 999) return undefined;
  }
  const start = rem === 0 ? digits.length : seen.get(rem)!;
  const repeat = digits.slice(start);
  if (repeat.length > longest) return undefined;
  return { negative: x < 0, whole: String(whole), fixed: digits.slice(0, start), repeat };
}

/**
 * A repeating decimal as a class writes it: the repeating block written out to at least three
 * digits (twice when longer), then "…": 1/3 → "0.333…", 1/6 → "0.1666…", 1/11 → "0.0909…".
 * Undefined for a decimal that ends or a block longer than 6 digits.
 */
export function repeatingDecimal(x: number): string | undefined {
  const d = decimalDigits(x);
  if (!d || d.repeat === '') return undefined;
  const times = Math.max(2, Math.ceil(3 / d.repeat.length));
  return `${d.negative ? '−' : ''}${withSeparators(d.whole)}.${d.fixed}${d.repeat.repeat(times)}…`;
}

/**
 * A repeating decimal as `repeatingDecimal` writes it, split for a bar over the block:
 * "0.1666…" → { lead: '0.1', block: '6' }; undefined for any other number ("3.14159…").
 */
export function repeatingParts(text: string): { lead: string; block: string } | undefined {
  const m = /^(−?[\d,]+\.)(\d+)…$/.exec(text);
  if (!m) return undefined;
  const d = m[2]!;
  for (let start = 0; start < d.length; start++) {
    for (let p = 1; p <= 6; p++) {
      const block = d.slice(start, start + p);
      const times = Math.max(2, Math.ceil(3 / p));
      if (d.length - start === p * times && d.slice(start) === block.repeat(times))
        return { lead: `${m[1]}${d.slice(0, start)}`, block };
    }
  }
  return undefined;
}

const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** An integer exponent raised: 5 → "⁵", −4 → "⁻⁴". */
const raised = (n: number) =>
  `${n < 0 ? '⁻' : ''}${[...String(Math.abs(n))].map((c) => SUPERSCRIPT[Number(c)]).join('')}`;

/**
 * x in scientific notation with up to 5 significant figures (so 1.9998 × 10¹¹ keeps its own
 * digits): "4.7 × 10⁵", "−3 × 10⁻⁴".
 */
/**
 * x to `sig` significant figures with its trailing zeros (2.50, 3.0, 0.0450, 1,200), in
 * scientific notation past 10⁷ or under 10⁻⁴ (1.20 × 10⁻⁵).
 */
export function significant(x: number, sig: number): string {
  const abs = Math.abs(Number(x.toPrecision(sig)));
  const e = Math.floor(Math.log10(abs) + 1e-12);
  if (abs >= 1e7 || abs < 1e-4) {
    return minus(`${x < 0 ? '-' : ''}${(abs / 10 ** e).toFixed(sig - 1)} × 10${raised(e)}`);
  }
  const text = abs.toFixed(Math.max(0, sig - 1 - e));
  return minus(`${x < 0 ? '-' : ''}${withSeparators(text)}`);
}

export function scientific(x: number): string {
  if (x === 0) return '0';
  let n = Math.floor(Math.log10(Math.abs(x)));
  let m = Number((x / 10 ** n).toPrecision(5));
  // Rounding can carry the mantissa to 10 (9.9999 → 10): move it to the exponent.
  if (Math.abs(m) >= 10) {
    m /= 10;
    n += 1;
  }
  return minus(`${m} × 10${raised(n)}`);
}

/**
 * x as a fraction of π with a denominator up to 12, as angles in radians are written: "5π/2",
 * "π/6", "−3π/4", "2π"; undefined otherwise.
 */
export function asPiFraction(x: number): string | undefined {
  const k = x / Math.PI;
  for (let d = 1; d <= 12; d++) {
    const n = Math.round(k * d);
    if (n === 0 || Math.abs(k * d - n) > 1e-9 * Math.max(1, Math.abs(k * d))) continue;
    const top = Math.abs(n) === 1 ? 'π' : `${Math.abs(n)}π`;
    return `${n < 0 ? '−' : ''}${top}${d === 1 ? '' : `/${d}`}`;
  }
  return undefined;
}

/**
 * x as a multiple of π when it is one to within a hair, with at most two decimals in the
 * multiple: "36π", "π", "2.25π", "−4π"; undefined otherwise.
 */
export function asPiMultiple(x: number): string | undefined {
  const k = x / Math.PI;
  const r = Math.round(k * 100) / 100;
  if (Math.abs(k - r) > 1e-9 * Math.max(1, Math.abs(k))) return undefined;
  if (r === 0) return undefined;
  const text = Math.abs(r) === 1 ? 'π' : `${withSeparators(String(Math.abs(r)))}π`;
  return r < 0 ? `−${text}` : text;
}

/**
 * x as a mixed number or fraction in lowest terms with a denominator up to `most`
 * ("33 1/3", "3/8", "−2 1/2"), or undefined when none is within a hair of x.
 */
export function asFraction(x: number, most: number): string | undefined {
  const abs = Math.abs(x);
  for (let d = 2; d <= most; d++) {
    const n = Math.round(abs * d);
    if (Math.abs(abs * d - n) > 1e-6 * d) continue;
    const whole = Math.floor(n / d);
    const r = n - whole * d;
    if (r === 0) return undefined;
    const text = whole ? `${withSeparators(String(whole))} ${r}/${d}` : `${r}/${d}`;
    return x < 0 ? `−${text}` : text;
  }
  return undefined;
}

/** A shown number as dollars: cents are two digits ("$7.50", not "$7.5"). */
export const dollars = (num: string) => `$${num.replace(/(\.\d)$/, '$10')}`;

/**
 * Money that isn't a whole number of cents ($10 for 3 is $3.3333… each) as the price a store
 * would show: "about $3.33", or "less than 1 cent". `num` is the value already formatted.
 */
export const dollarsOf = (x: number, num: string) => {
  const cents = Math.round(x * 100);
  if (Math.abs(x * 100 - cents) < 1e-6) return dollars(num);
  if (Math.abs(x) < 0.005) return 'less than 1 cent';
  return `about ${dollars((cents / 100).toFixed(2))}`;
};

/** Thousands separators from 1,000 ("12,500.5"), the way students read numbers in class. */
const withSeparators = (s: string) =>
  s.replace(
    /^(-?)(\d+)/,
    (_, sign: string, digits: string) => sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
  );

/** Drops thousands separators so text can be evaluated: "1,000 + 250" → "1000 + 250". */
export const plainDigits = (s: string) => s.replace(/(\d),(?=\d{3}(?!\d))/g, '$1');

/**
 * Parses user input; accepts "1,000", "−3" (Unicode minus), "1e3", and fractions and mixed
 * numbers ("3/8", "2 3/8", "−1 1/2"). Undefined when blank.
 */
export function parseNumber(text: string): number | undefined | 'invalid' {
  const cleaned = text.trim().replace(/,/g, '').replace(/−/g, '-');
  if (cleaned === '') return undefined;
  // A multiple of π: "36π", "36 pi", "36*pi", "π", "-2.5π", and a fraction of it: "5π/2",
  // "π/6", "3pi/4".
  const pi = /^([-+]?)(\d+\.?\d*|\.\d+)?\s*\*?\s*(?:π|pi)(?:\s*\/\s*(\d+))?$/i.exec(cleaned);
  if (pi) {
    const k = (pi[2] === undefined ? 1 : Number(pi[2])) / (pi[3] === undefined ? 1 : Number(pi[3]));
    if (!Number.isFinite(k)) return 'invalid';
    return (pi[1] === '-' ? -k : k) * Math.PI;
  }
  // Scientific notation: "4.7 × 10^5", "4.7 x 10^-3", "4.7*10⁵", "4.7 × 10⁻³".
  const sci = new RegExp(
    '^([-+]?(?:\\d+\\.?\\d*|\\.\\d+))\\s*[×x*]\\s*10(?:\\^\\(?([-+]?\\d+)\\)?|([⁻]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+))$',
    'i',
  ).exec(cleaned);
  if (sci) {
    const exp =
      sci[2] !== undefined
        ? Number(sci[2])
        : Number(
            [...sci[3]!].map((c) => (c === '⁻' ? '-' : String(SUPERSCRIPT.indexOf(c)))).join(''),
          );
    return Number(sci[1]) * 10 ** exp;
  }
  // A repeating decimal: "0.333…", "0.1666...", "2.0909…" (the last block written twice or more).
  const rep = /^([-+]?)(\d*)\.(\d+)(?:…|\.\.\.)$/.exec(cleaned);
  if (rep) {
    const x = repeatingValue(rep[2] || '0', rep[3]!);
    if (x === undefined) return 'invalid';
    return rep[1] === '-' ? -x : x;
  }
  const frac = /^([-+]?)(?:(\d+)\s+)?(\d+)\/(\d+)$/.exec(cleaned);
  if (frac) {
    const [, sign, whole, num, den] = frac;
    if (Number(den) === 0) return 'invalid';
    const x = Number(whole ?? 0) + Number(num) / Number(den);
    return sign === '-' ? -x : x;
  }
  if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(cleaned)) return 'invalid';
  return Number(cleaned);
}

/**
 * The value of "whole.digits…" where the digits end in a block written at least twice
 * (0.1666… = 1/6): the shortest start, then the shortest block. Undefined when nothing repeats.
 */
function repeatingValue(whole: string, digits: string): number | undefined {
  for (let start = 0; start < digits.length; start++) {
    const tail = digits.slice(start);
    for (let len = 1; len * 2 <= tail.length; len++) {
      const block = tail.slice(0, len);
      if (tail.length % len !== 0 || block.repeat(tail.length / len) !== tail) continue;
      const fixed = digits.slice(0, start);
      const f = Number(fixed || '0');
      const r = Number(block) / (10 ** len - 1);
      return Number(whole) + (f + r) / 10 ** start;
    }
  }
  return undefined;
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
  // Letters side by side multiply (cx); with numbers in them the × is written (3 × 4, not 34).
  if (values) template = template.replace(/\}\{/g, '} × {');
  const filled = template.replace(/\{(\w+)\}/g, (_, id: string, at: number) => {
    const variable = byId.get(id);
    if (!variable) return id;
    if (!values) return variable.symbol;
    const x = values[id];
    if (x === undefined) return '?';
    // Zero padding is for clock times ("3:05"); in sums and words the minutes are plain (5 + 20).
    const clockPart = template[at - 1] === ':';
    const s = formatNumber(x, clockPart ? variable : { ...variable, digits: undefined });
    // A negative is bracketed only where its sign would meet another one ("3 × (−4)") or a
    // power; alone, first in a line or in an ordered pair it reads as itself: (−4, 3), |−4|.
    const before = template.slice(0, at).trimEnd();
    const after = template.slice(at + id.length + 2);
    const needs = /[+−×÷·\-*/]$/.test(before) || /^[\^²³⁰¹⁴-⁹]/.test(after);
    // Scientific notation reads as one number only in brackets there too: ÷ (3 × 10⁻⁴).
    return (x < 0 || s.includes(' × 10')) && needs ? `(${s})` : s;
  });
  if (!values) return filled;
  // A minus sign in the template in front of a 0 (e.g. −v₀ with v₀ = 0) reads as just 0; a
  // whole-number power is written raised (10^3 → 10³), the way it is written on paper.
  return superscript(filled.replace(/(^|[(\s])−0(?![\d.])/g, '$10'));
}

/** Whole-number exponents after a caret written as superscript digits: "10^3" → "10³". */
export function superscript(text: string): string {
  return text.replace(/\^(-?)(\d+)(?![\d.])/g, (_, sign: string, d: string) =>
    raised(Number(`${sign}${d}`)),
  );
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

/**
 * A whole number from 0 to 1,000,000 in words: 347 → "three hundred forty-seven",
 * 347,812 → "three hundred forty-seven thousand, eight hundred twelve".
 */
export function numberWords(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 1000000) return formatNumber(n);
  if (n === 1000000) return 'one million';
  if (n >= 1000) {
    const [th, rest] = [Math.floor(n / 1000), n % 1000];
    return `${numberWords(th)} thousand${rest ? `, ${numberWords(rest)}` : ''}`;
  }
  const h = Math.floor(n / 100);
  const r = n % 100;
  const rest = r < 20 ? ONES[r]! : `${TENS[Math.floor(r / 10)]}${r % 10 ? `-${ONES[r % 10]}` : ''}`;
  if (h === 0) return rest;
  return `${ONES[h]} hundred${r ? ` ${rest}` : ''}`;
}

/** Word units whose singular isn't the plural less its final "s". */
const IRREGULAR: Record<string, string> = {
  inches: 'inch',
  feet: 'foot',
  'feet per second': 'foot per second',
};

/**
 * A word unit as it reads after the number 1: "1 cup", "1 second", "1 cubic unit", "1 foot".
 * Symbols (cm, mL, °F, µm, ms, hrs) are the same for any number: a single word of three
 * letters or fewer is read as a symbol.
 */
export function unitFor(x: number, unit: string): string {
  // (a capitalised name in it too: "1 Earth mass")
  if (x !== 1 || !/^[A-Za-z][A-Za-z ]*[a-z]$/.test(unit) || /^[A-Za-z]{1,3}$/.test(unit))
    return unit;
  if (IRREGULAR[unit]) return IRREGULAR[unit];
  // The first plural word takes the singular: "cubic units" → "cubic unit", "liters per
  // second" → "liter per second".
  return unit.replace(
    /^((?:[A-Za-z]+ )*?)([a-z]+?)(e?s)\b/,
    (m, head: string, stem: string, end: string) =>
      end === 'es' && /(ch|sh|x|s)$/.test(stem)
        ? `${head}${stem}`
        : `${head}${stem}${end === 'es' ? 'e' : ''}`,
  );
}
