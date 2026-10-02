/**
 * Whole-number work for college pages (HE-E21): integer functions (⌊ ⌋, ⌈ ⌉, mod, round,
 * log₂, gcd, lcm, min, max, sort), numbers in base 2, 8 and 16 (two's complement and bit
 * fields), IPv4 dotted quads and prefixes, and exact integers past 2⁵³ (n!, C(n, r), 2⁶⁴) kept
 * as BigInt. Each piece has its value and the step lines a student writes; the harness
 * (`harness/integerLines.ts`) reads every line back exactly.
 *
 * Lines use the true minus (−), × and ÷, thousands separators on decimal numbers (1,024), and
 * subscripts for a base (101101₂, 2D₁₆) or 0x on architecture pages (0x2D).
 */
import type { Values } from './types';

// ── Whole numbers as BigInt ──

/** A whole number as a BigInt (a number past 2⁵³ is taken as written, so pass exact ones). */
export const big = (n: number | bigint): bigint =>
  typeof n === 'bigint' ? n : BigInt(Math.round(n));

const abs = (n: bigint) => (n < 0n ? -n : n);

/** Digits with thousands separators and a true minus: −18,446,744,073,709,551,616. */
export function groupDigits(n: number | bigint): string {
  const b = big(n);
  const digits = abs(b)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return b < 0n ? `−${digits}` : digits;
}

/** A decimal shown in a line: whole numbers grouped, others to 4 decimals at most. */
export function numberText(x: number | bigint): string {
  if (typeof x === 'bigint' || Number.isInteger(x)) return groupDigits(x);
  const t = String(Number(x.toFixed(4)));
  return t.startsWith('-') ? `−${t.slice(1)}` : t;
}

const SUPER = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const SUB = '₀₁₂₃₄₅₆₇₈₉';
/** An exponent written raised: 12 → ¹², −3 → ⁻³. */
export const raised = (n: number) =>
  `${n < 0 ? '⁻' : ''}${[...String(Math.abs(n))].map((d) => SUPER[Number(d)]).join('')}`;
/** A number written as a subscript: 16 → ₁₆. */
export const lowered = (n: number) => [...String(n)].map((d) => SUB[Number(d)]).join('');

/** n! exactly (n a whole number from 0). */
export function bigFactorial(n: number): bigint {
  let p = 1n;
  for (let k = 2n; k <= big(n); k++) p *= k;
  return p;
}

/** P(n, r) = n! ÷ (n − r)! exactly; 0 when r > n. */
export function bigPerm(n: number, r: number): bigint {
  if (r < 0 || r > n) return 0n;
  let p = 1n;
  for (let k = big(n - r + 1); k <= big(n); k++) p *= k;
  return p;
}

/** C(n, r) = n! ÷ (r! (n − r)!) exactly; 0 when r > n. */
export function bigChoose(n: number, r: number): bigint {
  if (r < 0 || r > n) return 0n;
  const k = Math.min(r, n - r);
  let c = 1n;
  for (let i = 1; i <= k; i++) c = (c * big(n - k + i)) / big(i);
  return c;
}

/** bᵉ exactly (e a whole number from 0). */
export const bigPow = (b: number | bigint, e: number): bigint => big(b) ** big(e);

/**
 * A variable's `exact` for a whole number that may pass 2⁵³ (C(60, 30), 2⁶⁴, 25!): its exact
 * digits from the page's values, shown only when they agree with the value the solver holds
 * (a typed value that differs shows as usual). `id` is the variable's own id.
 */
export function exactInteger(
  id: string,
  f: (v: Values) => bigint | undefined,
): (v: Values) => string | undefined {
  return (v) => {
    const x = v[id];
    if (x === undefined || !Number.isFinite(x)) return undefined;
    const b = f(v);
    if (b === undefined) return undefined;
    // Within the float's own rounding of the exact value.
    if (Math.abs(Number(b) - x) > 1e-12 * Math.max(1, Math.abs(x))) return undefined;
    return groupDigits(b);
  };
}

// ── Integer functions ──

/** ⌊a ÷ b⌋ (b ≠ 0), exact on whole numbers. */
export function floorDiv(a: number, b: number): number | undefined {
  if (b === 0 || !Number.isFinite(a) || !Number.isFinite(b)) return undefined;
  if (Number.isInteger(a) && Number.isInteger(b)) {
    const q = big(a) / big(b);
    const r = big(a) - q * big(b);
    return Number(r !== 0n && r < 0n !== b < 0 ? q - 1n : q);
  }
  return Math.floor(a / b + 1e-12 * Math.sign(a / b));
}

/** ⌈a ÷ b⌉ (b ≠ 0). */
export function ceilDiv(a: number, b: number): number | undefined {
  const f = floorDiv(-a, b);
  return f === undefined ? undefined : -f || 0;
}

/** a mod n, from 0 to n − 1 for n > 0 (as the courses write it: −7 mod 4 = 1). */
export function mod(a: number, n: number): number | undefined {
  const q = floorDiv(a, n);
  return q === undefined ? undefined : a - n * q;
}

/** x to the nearest whole number, a half away from 0 (2.5 → 3, −2.5 → −3). */
export const roundHalfAway = (x: number) => Math.sign(x) * Math.floor(Math.abs(x) + 0.5 + 1e-12);

/** x to the nearest multiple of `step` (a half away from 0). */
export const roundTo = (x: number, step = 1) => roundHalfAway(x / step) * step;

/** Whether n is a whole power of 2 (1, 2, 4, …). */
export const isPowerOf2 = (n: number) =>
  Number.isInteger(n) && n >= 1 && (big(n) & (big(n) - 1n)) === 0n;

/** log₂ n when n is a power of 2 (64 → 6), else undefined. */
export function log2Exact(n: number): number | undefined {
  if (!isPowerOf2(n)) return undefined;
  return big(n).toString(2).length - 1;
}

/** ⌊log₂ n⌋ for a whole n ≥ 1: the place of the top bit (1000 → 9). */
export function floorLog2(n: number): number | undefined {
  if (!Number.isInteger(n) || n < 1) return undefined;
  return big(n).toString(2).length - 1;
}

/** ⌈log₂ n⌉ for a whole n ≥ 1: the bits that count n things (5 → 3, 8 → 3, 1 → 0). */
export function ceilLog2(n: number): number | undefined {
  if (!Number.isInteger(n) || n < 1) return undefined;
  return n === 1 ? 0 : (big(n) - 1n).toString(2).length;
}

/** The greatest common divisor of whole numbers (gcd(0, n) = n). */
export function gcd(...xs: number[]): number {
  let g = 0n;
  for (const x of xs) {
    let [a, b] = [abs(big(x)), g];
    while (b) [a, b] = [b, a % b];
    g = a;
  }
  return Number(g);
}

/** The least common multiple of whole numbers (0 when one is 0). */
export function lcm(...xs: number[]): number {
  let l = 1n;
  for (const x of xs) {
    const b = abs(big(x));
    if (b === 0n) return 0;
    let [a, c] = [l, b];
    while (c) [a, c] = [c, a % c];
    l = (l / a) * b;
  }
  return Number(l);
}

/** The list from least to greatest. */
export const sortedOf = (xs: readonly number[]) => [...xs].sort((a, b) => a - b);

// ── Integer-function lines ──

const n = numberText;

/** "⌊77 ÷ 64⌋ = ⌊1.2031⌋ = 1" (the decimal left out when it is whole or would mislead). */
export function floorLine(a: number, b: number): string {
  return roundingLine('⌊', '⌋', a, b, floorDiv(a, b));
}

/** "⌈10,000 ÷ 4,096⌉ = ⌈2.4414⌉ = 3". */
export function ceilLine(a: number, b: number): string {
  return roundingLine('⌈', '⌉', a, b, ceilDiv(a, b));
}

function roundingLine(open: string, close: string, a: number, b: number, q?: number) {
  if (q === undefined) return '';
  const head = `${open}${n(a)} ÷ ${n(b)}${close}`;
  const x = a / b;
  const shown = Number(x.toFixed(4));
  const f = open === '⌊' ? Math.floor : Math.ceil;
  // (the decimal only when it is not whole and its floor or ceiling is the true one)
  return Number.isInteger(x) || f(shown) !== q || Number.isInteger(shown)
    ? `${head} = ${n(q)}`
    : `${head} = ${open}${n(shown)}${close} = ${n(q)}`;
}

/** "77 mod 64 = 77 − 64 × ⌊77 ÷ 64⌋ = 77 − 64 × 1 = 13". */
export function modLine(a: number, m: number): string {
  const q = floorDiv(a, m);
  if (q === undefined) return '';
  const r = a - m * q;
  const neg = (x: number) => (x < 0 ? `(${n(x)})` : n(x));
  return `${n(a)} mod ${n(m)} = ${n(a)} − ${n(m)} × ⌊${n(a)} ÷ ${n(m)}⌋ = ${n(a)} − ${n(m)} × ${neg(q)} = ${n(r)}`;
}

/** "round(256.4) = 256"; with a step, "round(37 ÷ 5) × 5 = round(7.4) × 5 = 35". */
export function roundLine(x: number, step = 1): string {
  if (step === 1) return `round(${n(x)}) = ${n(roundHalfAway(x))}`;
  const k = x / step;
  return `round(${n(x)} ÷ ${n(step)}) × ${n(step)} = round(${n(k)}) × ${n(step)} = ${n(roundTo(x, step))}`;
}

/** "log₂ 64 = 6, since 2⁶ = 64"; undefined for a number that isn't a power of 2. */
export function log2Line(m: number): string | undefined {
  const k = log2Exact(m);
  return k === undefined ? undefined : `log₂ ${n(m)} = ${k}, since 2${raised(k)} = ${n(m)}`;
}

/** "⌈log₂ 5⌉ = 3, since 2² = 4 < 5 ≤ 8 = 2³" ("⌈log₂ 8⌉ = 3, since 2³ = 8"). */
export function ceilLog2Line(m: number): string | undefined {
  const k = ceilLog2(m);
  if (k === undefined) return undefined;
  if (isPowerOf2(m)) return `⌈log₂ ${n(m)}⌉ = ${k}, since 2${raised(k)} = ${n(m)}`;
  return `⌈log₂ ${n(m)}⌉ = ${k}, since 2${raised(k - 1)} = ${n(2 ** (k - 1))} < ${n(m)} ≤ ${n(2 ** k)} = 2${raised(k)}`;
}

/** "⌊log₂ 1,000⌋ = 9, since 2⁹ = 512 ≤ 1,000 < 1,024 = 2¹⁰". */
export function floorLog2Line(m: number): string | undefined {
  const k = floorLog2(m);
  if (k === undefined) return undefined;
  if (isPowerOf2(m)) return `⌊log₂ ${n(m)}⌋ = ${k}, since 2${raised(k)} = ${n(m)}`;
  return `⌊log₂ ${n(m)}⌋ = ${k}, since 2${raised(k)} = ${n(2 ** k)} ≤ ${n(m)} < ${n(2 ** (k + 1))} = 2${raised(k + 1)}`;
}

/**
 * Euclid's algorithm, one division a line, then the answer: "gcd(84, 36): 84 = 2 × 36 + 12",
 * "gcd(36, 12): 36 = 3 × 12 + 0", "gcd(84, 36) = 12".
 */
export function gcdLines(a: number, b: number): string[] {
  const lines: string[] = [];
  let [x, y] = [Math.abs(a), Math.abs(b)];
  if (y > x) [x, y] = [y, x];
  while (y !== 0) {
    const head = `gcd(${n(x)}, ${n(y)})`;
    const q = Math.floor(x / y);
    lines.push(`${head}: ${n(x)} = ${n(q)} × ${n(y)} + ${n(x - q * y)}`);
    [x, y] = [y, x - q * y];
  }
  lines.push(`gcd(${n(a)}, ${n(b)}) = ${n(gcd(a, b))}`);
  return lines;
}

/** "lcm(4, 6) = 4 × 6 ÷ gcd(4, 6) = 24 ÷ 2 = 12". */
export function lcmLine(a: number, b: number): string {
  return `lcm(${n(a)}, ${n(b)}) = ${n(a)} × ${n(b)} ÷ gcd(${n(a)}, ${n(b)}) = ${n(a * b)} ÷ ${n(gcd(a, b))} = ${n(lcm(a, b))}`;
}

/** "min(12, 7, 9) = 7". */
export const minLine = (xs: readonly number[]) =>
  `min(${xs.map(n).join(', ')}) = ${n(Math.min(...xs))}`;
/** "max(12, 7, 9) = 12". */
export const maxLine = (xs: readonly number[]) =>
  `max(${xs.map(n).join(', ')}) = ${n(Math.max(...xs))}`;
/** "sort(5, 2, 9) = (2, 5, 9)". */
export const sortLine = (xs: readonly number[]) =>
  `sort(${xs.map(n).join(', ')}) = (${sortedOf(xs).map(n).join(', ')})`;

// ── Counting with exact integers ──

/** "6! = 6 × 5 × 4 × 3 × 2 × 1 = 720" (the product written out up to 8!), "25! = 15,511,…". */
export function factorialLine(m: number): string {
  const value = groupDigits(bigFactorial(m));
  if (m < 2) return `${m}! = 1`;
  if (m > 8) return `${m}! = ${value}`;
  const terms = Array.from({ length: m }, (_, i) => String(m - i));
  return `${m}! = ${terms.join(' × ')} = ${value}`;
}

/** "P(10, 3) = 10! ÷ 7! = 10 × 9 × 8 = 720" (the product written out for r ≤ 6). */
export function permLine(m: number, r: number): string {
  const value = groupDigits(bigPerm(m, r));
  const head = `P(${m}, ${r}) = ${m}! ÷ ${m - r}!`;
  if (r < 1 || r > 6) return `${head} = ${value}`;
  const terms = Array.from({ length: r }, (_, i) => String(m - i));
  return r === 1 ? `${head} = ${value}` : `${head} = ${terms.join(' × ')} = ${value}`;
}

/** "C(60, 30) = 60! ÷ (30! × 30!) = 118,264,581,564,861,424". */
export function chooseLine(m: number, r: number): string {
  return `C(${m}, ${r}) = ${m}! ÷ (${r}! × ${m - r}!) = ${groupDigits(bigChoose(m, r))}`;
}

/** "2⁶⁴ = 18,446,744,073,709,551,616". */
export const powLine = (b: number, e: number) => `${b}${raised(e)} = ${groupDigits(bigPow(b, e))}`;

/** ln n! by Stirling, n ln n − n + ½ ln(2πn). */
export const stirlingLn = (m: number) =>
  m < 1 ? 0 : m * Math.log(m) - m + 0.5 * Math.log(2 * Math.PI * m);

/**
 * ln n! by Stirling, beside its exact value when n! is a double:
 * "ln(100!) ≈ 100 ln 100 − 100 + ½ ln(2π × 100) = 363.7394".
 */
export function stirlingLine(m: number): string {
  return `ln(${m}!) ≈ ${m} ln ${m} − ${m} + ½ ln(2π × ${m}) = ${numberText(stirlingLn(m))}`;
}

// ── Bases ──

export type Radix = 2 | 8 | 16;

/** How a whole number is written in a base. */
export interface BaseStyle {
  /** Bits the number fills (zero-padded): 8 → 00101101₂, 2D₁₆; hex and octal use ⌈bits ÷ 4⌉, ⌈bits ÷ 3⌉ digits. */
  bits?: number;
  /** 0x2D, 0b101101, 0o55 (architecture and embedded pages), not 2D₁₆. */
  prefix?: boolean;
  /** Bits in fours with a space between (0010 1101₂); hex in fours too (0x0040 0020) when long. */
  group?: boolean;
}

const BITS_PER: Record<Radix, number> = { 2: 1, 8: 3, 16: 4 };
const PREFIX: Record<Radix, string> = { 2: '0b', 8: '0o', 16: '0x' };

/** A whole number's digits in a base, padded to `digits`: (45, 16) → "2D". */
export function digitsIn(m: number | bigint, radix: Radix, digits = 1): string {
  return big(m).toString(radix).toUpperCase().padStart(digits, '0');
}

/** The digits a number of `bits` takes in a base: 8 bits → 2 hex digits. */
export const digitsFor = (bits: number, radix: Radix) => Math.ceil(bits / BITS_PER[radix]);

/** A whole number in a base: 101101₂, 0010 1101₂, 2D₁₆, 55₈, 0x2D. */
export function baseText(m: number | bigint, radix: Radix, style: BaseStyle = {}): string {
  const raw = digitsIn(m, radix, style.bits ? digitsFor(style.bits, radix) : 1);
  const grouped =
    style.group && raw.length > 4
      ? raw.replace(new RegExp(`(?=(?:[0-9A-F]{4})+$)(?!^)`, 'g'), ' ')
      : raw;
  return style.prefix ? `${PREFIX[radix]}${grouped}` : `${grouped}${lowered(radix)}`;
}

/**
 * A whole number written in a base, read back: "101101₂", "0b10_1101", "0x2D", "2D₁₆", "55₈",
 * "0o55", "0010 1101₂"; plain digits are read in `radix` when given. Undefined when it isn't one.
 */
export function parseBased(text: string, radix?: Radix): bigint | undefined {
  let t = text.trim().replace(/[\s_]/g, '');
  let r: number | undefined = radix;
  const pre = /^0([xbo])/i.exec(t);
  if (pre) {
    r = { x: 16, b: 2, o: 8 }[pre[1]!.toLowerCase() as 'x' | 'b' | 'o'];
    t = t.slice(2);
  } else {
    const sub = /(₂|₈|₁₆|₁₀)$/.exec(t);
    if (sub) {
      r = { '₂': 2, '₈': 8, '₁₆': 16, '₁₀': 10 }[sub[1] as '₂'];
      t = t.slice(0, -sub[1]!.length);
    }
  }
  if (r === undefined || t === '') return undefined;
  const allowed = '0123456789ABCDEF'.slice(0, r);
  if (![...t.toUpperCase()].every((c) => allowed.includes(c))) return undefined;
  return [...t.toUpperCase()].reduce((acc, c) => acc * big(r) + big(allowed.indexOf(c)), 0n);
}

/**
 * Repeated division by the base, a line each ("45 ÷ 2 = 22 remainder 1", …), then the number
 * in the base with the remainders read from the last up ("45 = 101101₂"); a hex digit past 9
 * is named ("13 is D").
 */
export function divisionLines(m: number, radix: Radix, style: BaseStyle = {}): string[] {
  const lines: string[] = [];
  let x = big(m);
  const letters: string[] = [];
  if (x === 0n) return [`0 = ${baseText(0, radix, style)}`];
  while (x > 0n) {
    const q = x / big(radix);
    const r = x % big(radix);
    lines.push(`${groupDigits(x)} ÷ ${radix} = ${groupDigits(q)} remainder ${r}`);
    if (r > 9n) letters.push(`${r} is ${r.toString(16).toUpperCase()}`);
    x = q;
  }
  const named = [...new Set(letters)];
  if (named.length) lines.push(`Digits past 9: ${named.join(', ')}`);
  lines.push(`${groupDigits(m)} = ${baseText(m, radix, style)}`);
  return lines;
}

/**
 * A number in a base read by place value: "101101₂ = 1 × 2⁵ + 0 × 2⁴ + 1 × 2³ + 1 × 2² +
 * 0 × 2¹ + 1 × 2⁰ = 32 + 8 + 4 + 1 = 45"; past 8 digits only the digits that aren't 0.
 */
export function placeValueLine(m: number | bigint, radix: Radix, style: BaseStyle = {}): string {
  const digits = digitsIn(m, radix);
  const k = digits.length;
  const all = k <= 8;
  const terms: string[] = [];
  const parts: string[] = [];
  [...digits].forEach((c, i) => {
    const d = parseInt(c, 16);
    const p = k - 1 - i;
    if (!all && d === 0) return;
    terms.push(`${d} × ${radix}${raised(p)}`);
    if (d !== 0) parts.push(groupDigits(big(d) * big(radix) ** big(p)));
  });
  const total = groupDigits(m);
  const sum = parts.length > 1 ? ` = ${parts.join(' + ')}` : '';
  return `${baseText(m, radix, style)} = ${terms.join(' + ')}${sum} = ${total}`;
}

/**
 * Bits grouped into hex (fours) or octal (threes) digits from the right: "0010₂ = 2;
 * 1101₂ = 13 = D₁₆", then "0010 1101₂ = 2D₁₆".
 */
export function groupLines(m: number | bigint, bits: number, into: 8 | 16): string[] {
  const size = BITS_PER[into];
  const width = Math.ceil(bits / size) * size;
  const raw = digitsIn(m, 2, width);
  const groups = raw.match(new RegExp(`.{${size}}`, 'g')) ?? [];
  const each = groups.map((g) => {
    const v = parseInt(g, 2);
    return v > 9 ? `${g}₂ = ${v} = ${v.toString(16).toUpperCase()}₁₆` : `${g}₂ = ${v}`;
  });
  return [each.join('; '), `${groups.join(' ')}₂ = ${baseText(m, into, { bits: width })}`];
}

/** A whole number in BCD: each decimal digit in 4 bits ("0101 1001" for 59). */
export const bcdText = (m: number) =>
  [...String(Math.round(Math.abs(m)))].map((d) => Number(d).toString(2).padStart(4, '0')).join(' ');

/** BCD a digit a clause, then the code: "5 = 0101₂; 9 = 1001₂", "59 in BCD: 0101 1001". */
export function bcdLines(m: number): string[] {
  const digits = [...String(Math.round(Math.abs(m)))];
  return [
    digits.map((d) => `${d} = ${Number(d).toString(2).padStart(4, '0')}₂`).join('; '),
    `${m} in BCD: ${bcdText(m)}`,
  ];
}

// ── Two's complement and bit fields ──

/** The n-bit pattern of −N (0 < N ≤ 2ⁿ⁻¹) as an unsigned number: 2ⁿ − N (45, 8 → 211). */
export function twosComplement(m: number, bits: number): number | undefined {
  if (!Number.isInteger(m) || m < 1 || m > 2 ** (bits - 1)) return undefined;
  return 2 ** bits - m;
}

/** The signed value of an n-bit pattern (211, 8 → −45). */
export const signedValue = (pattern: number, bits: number) =>
  pattern >= 2 ** (bits - 1) ? pattern - 2 ** bits : pattern;

/**
 * −N in n bits, a line each: "45 = 00101101₂", "Invert every bit: 11010010₂",
 * "Add 1: 11010010₂ + 1 = 11010011₂ = D3₁₆". Empty when −N doesn't fit.
 */
export function twosLines(m: number, bits: number, style: { prefix?: boolean } = {}): string[] {
  const p = twosComplement(m, bits);
  if (p === undefined) return [];
  const b = (x: number) => baseText(x, 2, { bits });
  const inverted = 2 ** bits - 1 - m;
  return [
    `${groupDigits(m)} = ${b(m)}`,
    `Invert every bit: ${b(inverted)}`,
    `Add 1: ${b(inverted)} + 1 = ${b(p)} = ${baseText(p, 16, { bits, prefix: style.prefix })}`,
  ];
}

/**
 * An n-bit pattern read as signed (its top bit weighs −2ⁿ⁻¹): "Signed: 11010011₂ = −2⁷ + 2⁶ +
 * 2⁴ + 2¹ + 2⁰ = −128 + 64 + 16 + 2 + 1 = −45".
 */
export function signedLine(pattern: number, bits: number): string {
  const raw = digitsIn(pattern, 2, bits);
  const terms: string[] = [];
  const parts: string[] = [];
  [...raw].forEach((c, i) => {
    if (c !== '1') return;
    const p = bits - 1 - i;
    const top = i === 0;
    terms.push(`${top ? '−' : ''}2${raised(p)}`);
    parts.push(`${top ? '−' : ''}${groupDigits(2 ** p)}`);
  });
  const join = (xs: string[]) =>
    xs.map((t, i) => (i === 0 ? t : t.startsWith('−') ? `− ${t.slice(1)}` : `+ ${t}`)).join(' ');
  const value = groupDigits(signedValue(pattern, bits));
  if (terms.length === 0) return `Signed: ${raw}₂ = 0`;
  return terms.length === 1
    ? `Signed: ${raw}₂ = ${terms[0]} = ${value}`
    : `Signed: ${raw}₂ = ${join(terms)} = ${join(parts)} = ${value}`;
}

/**
 * The ranges of n bits: "8-bit unsigned, largest: 2⁸ − 1 = 255", "8-bit signed, least:
 * −2⁷ = −128", "8-bit signed, largest: 2⁷ − 1 = 127".
 */
export function rangeLines(bits: number): string[] {
  return [
    `${bits}-bit unsigned, largest: 2${raised(bits)} − 1 = ${groupDigits(2n ** big(bits) - 1n)}`,
    `${bits}-bit signed, least: −2${raised(bits - 1)} = ${groupDigits(-(2n ** big(bits - 1)))}`,
    `${bits}-bit signed, largest: 2${raised(bits - 1)} − 1 = ${groupDigits(2n ** big(bits - 1) - 1n)}`,
  ];
}

/**
 * A signed n-bit sum that wraps: "8-bit sum: 100 + 50 = 150", "150 > 127, so 150 − 2⁸ = −106" (or
 * "+ 2⁸" below the least); the sum alone when it fits.
 */
export function wrapLines(a: number, b: number, bits: number): string[] {
  const s = a + b;
  const [lo, hi] = [-(2 ** (bits - 1)), 2 ** (bits - 1) - 1];
  const head = `${bits}-bit sum: ${groupDigits(a)} ${b < 0 ? '−' : '+'} ${groupDigits(Math.abs(b))} = ${groupDigits(s)}`;
  if (s > hi)
    return [
      head,
      `${groupDigits(s)} > ${groupDigits(hi)}, so ${groupDigits(s)} − 2${raised(bits)} = ${groupDigits(s - 2 ** bits)}`,
    ];
  if (s < lo)
    return [
      head,
      `${groupDigits(s)} < ${groupDigits(lo)}, so ${groupDigits(s)} + 2${raised(bits)} = ${groupDigits(s + 2 ** bits)}`,
    ];
  return [head];
}

/** Bits hi down to lo of a whole number (bits 14–12 of 0x00A30513 → 0). */
export function bitField(m: number | bigint, hi: number, lo: number): number {
  return Number((big(m) >> big(lo)) & ((1n << big(hi - lo + 1)) - 1n));
}

/**
 * A field read out by shifting and masking: "Bits 14–12: ⌊0x00A30513 ÷ 2¹²⌋ mod 2³ =
 * 2,611 mod 8 = 3" (`prefix` for 0x, else ₂ at the word's bits).
 */
export function bitFieldLine(
  m: number | bigint,
  hi: number,
  lo: number,
  style: { bits?: number; radix?: Radix; prefix?: boolean } = {},
): string {
  const radix = style.radix ?? 16;
  const word = baseText(m, radix, { bits: style.bits, prefix: style.prefix ?? radix === 16 });
  const shifted = big(m) >> big(lo);
  const width = hi - lo + 1;
  const label = hi === lo ? `Bit ${hi}` : `Bits ${hi}–${lo}`;
  const head = lo === 0 ? word : `⌊${word} ÷ 2${raised(lo)}⌋`;
  const middle = lo === 0 ? '' : ` = ${groupDigits(shifted)} mod ${groupDigits(1n << big(width))}`;
  return `${label}: ${head} mod 2${raised(width)}${middle} = ${groupDigits(bitField(m, hi, lo))}`;
}

// ── IPv4 ──

/** A 32-bit whole number as a dotted quad: 3232238157 → "192.168.10.77". */
export function ipv4Text(m: number): string {
  const x = big(m) & 0xffffffffn;
  return [24n, 16n, 8n, 0n].map((s) => String((x >> s) & 255n)).join('.');
}

/** A dotted quad read back as its 32-bit number; undefined unless four octets 0–255. */
export function parseIPv4(text: string): number | undefined {
  const m = /^\s*(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\s*$/.exec(text);
  if (!m) return undefined;
  const o = m.slice(1).map(Number);
  if (o.some((x) => x > 255)) return undefined;
  return ((o[0]! * 256 + o[1]!) * 256 + o[2]!) * 256 + o[3]!;
}

/** A prefix's mask as a number: /26 → 255.255.255.192 (4294967232). */
export const prefixMask = (prefix: number) => 2 ** 32 - 2 ** (32 - prefix);

/** The four octets in binary, dotted: "11111111.11111111.11111111.11000000₂". */
export const dottedBinary = (m: number) =>
  `${ipv4Text(m)
    .split('.')
    .map((o) => Number(o).toString(2).padStart(8, '0'))
    .join('.')}₂`;

/** The network address: the address with every host bit cleared. */
export const networkOf = (address: number, prefix: number) =>
  Number(big(address) & big(prefixMask(prefix)));

/** The broadcast address: the address with every host bit set. */
export const broadcastOf = (address: number, prefix: number) =>
  networkOf(address, prefix) + 2 ** (32 - prefix) - 1;

/** Usable hosts on a prefix: 2³²⁻ⁿ − 2 (none below /31 has fewer than 2). */
export const hostsOf = (prefix: number) => Math.max(0, 2 ** (32 - prefix) - 2);

/**
 * A subnet worked from an address and its prefix, a line each: the mask in bits and as a quad,
 * the block, the network (bits AND mask), the broadcast and the hosts.
 */
export function subnetLines(address: number, prefix: number): string[] {
  const mask = prefixMask(prefix);
  const host = 32 - prefix;
  const block = 2 ** host;
  const net = networkOf(address, prefix);
  return [
    `Mask /${prefix}: ${dottedBinary(mask)} = ${ipv4Text(mask)}`,
    `Block: 2^(32 − ${prefix}) = 2${raised(host)} = ${groupDigits(block)}`,
    `Network: ${ipv4Text(address)} AND ${ipv4Text(mask)} = ${ipv4Text(net)}`,
    `Broadcast: ${ipv4Text(net)} + ${groupDigits(block)} − 1 = ${ipv4Text(net + block - 1)}`,
    `Hosts: ${groupDigits(block)} − 2 = ${groupDigits(hostsOf(prefix))}`,
  ];
}

// ── Values shown in a base ──

/**
 * How a value is shown and typed (`VariableDef.base`): a base with its width (a number of bits,
 * or the id of the value giving it), an IPv4 dotted quad, or a prefix length (/26).
 */
export type BaseForm =
  | {
      radix: Radix;
      /** Bits the number fills: a count, or the id of the value that is the width (n). */
      bits?: number | string;
      prefix?: boolean;
      group?: boolean;
    }
  | 'ipv4'
  | 'prefix';

/** A whole number from 0 shown in its form, or undefined when it can't be (a fraction, a negative). */
export function formText(x: number, form: BaseForm, values?: Values): string | undefined {
  if (!Number.isInteger(x) || x < 0 || !Number.isSafeInteger(x)) return undefined;
  if (form === 'ipv4') return x < 2 ** 32 ? ipv4Text(x) : undefined;
  if (form === 'prefix') return x <= 32 ? `/${x}` : undefined;
  const bits = typeof form.bits === 'string' ? values?.[form.bits] : form.bits;
  const fits = bits === undefined || !Number.isInteger(bits) || x < 2 ** bits;
  return baseText(x, form.radix, {
    bits: fits && bits !== undefined && Number.isInteger(bits) && bits > 0 ? bits : undefined,
    prefix: form.prefix,
    group: form.group,
  });
}

/**
 * A value typed into a box in its form: digits in the box's base (with or without ₂ or 0x, any
 * explicit base taken as written), a dotted quad, or a prefix ("/26" or "26"). Undefined when
 * blank, 'invalid' when it isn't one.
 */
export function parseInForm(text: string, form: BaseForm): number | undefined | 'invalid' {
  const t = text.trim();
  if (t === '') return undefined;
  if (form === 'ipv4') {
    const q = parseIPv4(t);
    if (q !== undefined) return q;
    return /^\d+$/.test(t) && Number(t) < 2 ** 32 ? Number(t) : 'invalid';
  }
  if (form === 'prefix') {
    const m = /^\/?\s*(\d{1,2})$/.exec(t);
    return m && Number(m[1]) <= 32 ? Number(m[1]) : 'invalid';
  }
  const b = parseBased(t, form.radix);
  if (b === undefined || b > BigInt(Number.MAX_SAFE_INTEGER)) return 'invalid';
  return Number(b);
}
