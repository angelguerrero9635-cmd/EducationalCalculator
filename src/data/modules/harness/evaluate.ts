/**
 * Reading the text a student sees: every step and check line is evaluated back to a number
 * through PHRASES (words the walkthrough uses for arithmetic, e.g. "3 tens", "whole groups of
 * 6 in 743"). A new phrase in a module's step text is taught here. Test-only.
 */
import { parseNumber, plainDigits } from '@/engine/format';
import { INTEGRAL, SIGMA } from '@/engine/latex';

import type { Walkthrough } from '../buildSteps';
import { complexPrepass } from './algebraLines';
import { INTEGER_PREPASS, integerPrepass } from './integerLines';
import { ANGLE_MARKS, anglePrepass } from './angles';
import { HE_PHRASES } from './phrasesHe';
import { HSB_PHRASES } from './phrasesHsb';
import { HSF_PHRASES } from './phrasesHsf';
import { HSG_PHRASES } from './phrasesHsg';
import { HSI_PHRASES } from './phrasesHsi';
import { HSJ_PHRASES } from './phrasesHsj';
import { HS2D_PHRASES } from './phrasesHs2d';
import { M9_PHRASES } from './phrasesM9';
import { M10_PHRASES } from './phrasesM10';
import { M11_PHRASES } from './phrasesM11';
import { M12_PHRASES } from './phrasesM12';
import { S9_PHRASES } from './phrasesS9';
import { S10_PHRASES } from './phrasesS10';
import { S11_PHRASES } from './phrasesS11';
import { S12_PHRASES } from './phrasesS12';

/** How many prime factors (with repeats) a whole number has: 24 → 4, 7 → 1. */
export const primeFactorCount = (n: number) => {
  let m = Math.round(n);
  let count = 0;
  for (let p = 2; p * p <= m; p++) {
    while (m % p === 0) {
      count++;
      m /= p;
    }
  }
  return m > 1 ? count + 1 : count;
};

/** A number in step text, with scientific notation as one number (7.099 × 10¹²). */
/**
 * A number in step text, with scientific notation as one number: 7.099 × 10¹² as written, or
 * 7.099 * 10**(12) once `evaluate` has turned the symbols into arithmetic.
 */
export const NUM = String.raw`\(?-?\d+(?:\.\d+…?)?(?:e[-+]?\d+)?(?: × 10⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+| \* 10\*\* ?\(?-?\d+\)?)?\)?`;
export const toNum = (s: string) => {
  const sci = /^\(?(-?[\d.]+) \* 10\*\* ?\(?(-?\d+)\)?\)?$/.exec(s);
  if (sci) return Number(sci[1]) * 10 ** Number(sci[2]);
  const n = parseNumber(s.replace(/[()]/g, ''));
  return typeof n === 'number' ? n : NaN;
};
export const COIN: Record<string, number> = {
  'five-dollar bill': 500,
  'five-dollar bills': 500,
  dollar: 100,
  dollars: 100,
  quarter: 25,
  quarters: 25,
  dime: 10,
  dimes: 10,
  nickel: 5,
  nickels: 5,
};
/** The median of the lower (or upper) half of a list, the median itself left out. */
const quartile = (xs: number[], upper: boolean) => {
  const s = xs.filter((x) => !Number.isNaN(x)).sort((a, b) => a - b);
  const half = Math.floor(s.length / 2);
  const part = upper ? s.slice(s.length - half) : s.slice(0, half);
  const n = part.length;
  return n % 2 ? part[(n - 1) / 2]! : (part[n / 2 - 1]! + part[n / 2]!) / 2;
};

export const PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // College pages (HE-E8): first, so a double factorial (5!!) is not read as (5!)!.
  ...HE_PHRASES,
  // Whole-number work in high school (powers of i, coterminal angles, a quadrant): the
  // greatest common factor, a remainder, and a count of whole turns.
  [new RegExp(`gcd\\((${NUM}),\\s*(${NUM})\\)`), (a, b) => gcd(a, b)],
  [new RegExp(`(${NUM}) mod (${NUM})`), (a, n) => ((a % n) + n) % n],
  // (÷ is / by now)
  [new RegExp(`the remainder of (${NUM}) / (${NUM})`), (a, n) => ((a % n) + n) % n],
  // High school logs to a base: log_2(8) is 3.
  [new RegExp(`log_(${NUM})\\s*\\(?(${NUM})\\)?`), (b, x) => Math.log(x) / Math.log(b)],
  // Grades 9–12 statistics and counting (group HB).
  ...HSB_PHRASES,
  ...HSJ_PHRASES,
  ...HS2D_PHRASES,
  ...HSF_PHRASES,
  ...HSG_PHRASES,
  ...HSI_PHRASES,
  // Grades 9–12 pages, one list per grade and subject.
  ...M9_PHRASES,
  ...M10_PHRASES,
  ...M11_PHRASES,
  ...M12_PHRASES,
  ...S9_PHRASES,
  ...S10_PHRASES,
  ...S11_PHRASES,
  ...S12_PHRASES,
  // Grade 3 clock times ("3:45"), as minutes past 12:00 on a 12-hour clock. Phrases that start
  // with a bracket are tried first, so these come before "35 minutes".
  [
    new RegExp(`(?:the hour) (${NUM}) minutes after (\\d+):(\\d\\d)`),
    (d, h, m) => Math.floor(((h % 12) * 60 + m + d) / 60) % 12 || 12,
  ],
  [
    new RegExp(`(?:the hour) (${NUM}) minutes before (\\d+):(\\d\\d)`),
    (d, h, m) => Math.floor((((((h % 12) * 60 + m - d) % 720) + 720) % 720) / 60) || 12,
  ],
  [
    /(\d+):(\d\d) to (\d+):(\d\d)/,
    (h1, m1, h2, m2) => ((((h2 % 12) * 60 + m2 - (h1 % 12) * 60 - m1) % 720) + 720) % 720,
  ],
  [new RegExp(`(\\d+):(\\d\\d) \\+ (${NUM}) minutes`), (h, m, d) => ((h % 12) * 60 + m + d) % 720],
  [/(\d+):(\d\d)/, (h, m) => (h % 12) * 60 + m],
  // Kindergarten counting by tens: "jumps to 40" is how many tens reach 40.
  [new RegExp(`jumps to (${NUM})`), (n) => n / 10],
  // Grade 4 (the primes with repeats come before the factor count, which would match first)
  [new RegExp(`prime factors of (${NUM})`), (n) => primeFactorCount(n)],
  // Grade 9 simplifying radicals: the largest perfect square that divides 72 is 36.
  [
    new RegExp(`largest square factor of (${NUM})`),
    (n) =>
      Math.max(
        ...Array.from({ length: Math.floor(Math.sqrt(n)) }, (_, k) => (k + 1) ** 2).filter(
          (q) => n % q === 0,
        ),
      ),
  ],
  [
    new RegExp(`factors of (${NUM})`),
    (n) => Array.from({ length: n }, (_, i) => i + 1).filter((k) => n % k === 0).length,
  ],
  [new RegExp(`(${NUM}) has (${NUM}) factors`), (_n, f) => f],
  [new RegExp(`full tenths in (${NUM})`), (h) => Math.floor(h / 10)],
  [new RegExp(`hundredths in (${NUM})`), (d) => Math.round(d * 100)],
  // Grade 3
  [new RegExp(`(${NUM}) without its tens and ones`), (a) => 100 * Math.floor(a / 100)],
  [new RegExp(`(${NUM}) without its ones`), (a) => 10 * Math.floor(a / 10)],
  [new RegExp(`wholes in (${NUM}) parts of (${NUM})`), (a, b) => Math.floor(a / b)],
  [new RegExp(`last 5 before (${NUM})`), (a) => Math.floor(a / 5)],
  [new RegExp(`(${NUM}) \\+ (${NUM}) past the hour`), (a, b) => (a + b) % 60],
  [new RegExp(`(${NUM}) [-−] (${NUM}) past the hour`), (a, b) => (((a - b) % 60) + 60) % 60],
  [new RegExp(`(${NUM}) wholes? and (${NUM})/(${NUM})`), (w, a, b) => w + a / b],
  // (not when the bottom is raised to a power: 12/2² is 12 ÷ 4, and 2/(5)² is 2 ÷ 25, never
  // 2 ÷ 5 with its bracket left open)
  [new RegExp(`(${NUM})/(${NUM})(?![\\d.]|\\)?\\s*\\*\\*)`), (a, b) => a / b],
  [new RegExp(`(${NUM}) (?:not shaded|shaded|equal parts)`), (a) => a],
  [new RegExp(`difference of (${NUM}) and (${NUM})`), (a, b) => Math.abs(a - b)],
  [new RegExp(`size of (${NUM}) equal jumps from (${NUM}) to (${NUM})`), (k, a, n) => (n - a) / k],
  [new RegExp(`jumps of (${NUM}) from (${NUM}) to (${NUM})`), (s, a, n) => (n - a) / s],
  // Grade 2 skip counting: "4 jumps of 10" is 40.
  [new RegExp(`(${NUM}) jumps of (${NUM})`), (k, s) => k * s],
  [new RegExp(`tens from (${NUM}) to (${NUM})`), (a, b) => (b - a) / 10],
  // Elapsed time: the start minutes, counting back from the end minutes past the hour.
  [
    new RegExp(`(${NUM}) minutes before (${NUM}) past the hour`),
    (d, m) => (((m - d) % 60) + 60) % 60,
  ],
  [new RegExp(`(${NUM}) minutes?`), (a) => a],
  [new RegExp(`(${NUM}) to the nearest ten`), (a) => Math.floor((a + 5) / 10) * 10],
  // "24 shared into pairs" is what is left over: 0 for even, 1 for odd.
  [new RegExp(`(${NUM}) shared into pairs`), (a) => a % 2],
  // "whole inches in 9 marks of 1/4" (the fraction is already 0.25 by the time this runs).
  [new RegExp(`whole inches in (${NUM}) marks? of (${NUM})`), (a, b) => Math.floor(a * b)],
  // "2 inches of 4 marks and 1 mark": marks counted on a ruler with half or quarter marks.
  [
    new RegExp(`(${NUM}) inch(?:es)? of (${NUM}) marks? and (${NUM}) marks?`),
    (w, b, r) => w * b + r,
  ],
  [new RegExp(`(${NUM}) marks?\\b(?! of)`), (a) => a],
  [new RegExp(`(${NUM}) (?:flat|curved)`), (a) => a],
  [new RegExp(`the coin that makes (${NUM})¢? with (${NUM}) coins?`), (t, k) => t / k],
  [new RegExp(`coins of (${NUM})¢? in (${NUM})`), (v, t) => t / v],
  [new RegExp(`(${NUM}) coins? of (${NUM})`), (k, v) => k * v],
  [new RegExp(`(${NUM}) (?:feet|foot) of (${NUM}) inches`), (f, n) => f * n],
  [new RegExp(`(${NUM}) meters? of (${NUM}) centimeters`), (m, n) => m * n],
  [new RegExp(`(${NUM}) jumps? of (${NUM})`), (a, b) => a * b],
  [new RegExp(`rows of (${NUM}) in (${NUM})`), (c, n) => n / c],
  // "whole groups of 6 in 743" (a division with a remainder), before the exact one.
  [new RegExp(`(?:whole|full) groups of (${NUM}) in (${NUM})`), (d, n) => Math.floor(n / d)],
  [new RegExp(`the tens in (${NUM})`), (n) => 10 * Math.floor((n % 100) / 10)],
  [new RegExp(`(${NUM}) with the places under (${NUM}) made 0`), (n, p) => Math.floor(n / p) * p],
  // Estimating (Grade 4): "36,325 rounded to the 1,000s".
  [new RegExp(`(${NUM}) rounded to the (${NUM})s`), (n, p) => Math.round(n / p) * p],
  [new RegExp(`(${NUM}) rounded down to the (${NUM})s`), (n, p) => Math.floor(n / p) * p],
  // The place by name (Grade 5): "4.268 rounded down to the hundredths".
  [new RegExp(`(${NUM}) rounded to the ones`), (n) => Math.round(n)],
  [new RegExp(`(${NUM}) rounded down to the ones`), (n) => Math.floor(n + 1e-9)],
  [new RegExp(`(${NUM}) rounded down to the tenths`), (n) => Math.floor(n * 10 + 1e-9) / 10],
  [new RegExp(`(${NUM}) rounded down to the hundredths`), (n) => Math.floor(n * 100 + 1e-9) / 100],
  // A line plot's spread: counts at marks 1, 2, 3 … (eighths); longest marked − shortest marked.
  [
    new RegExp(
      `eighths from the shortest to the longest of (${NUM}), (${NUM}), (${NUM}), (${NUM}), (${NUM})`,
    ),
    (...counts) => {
      const at = counts.map((c, i) => (c > 0 ? i + 1 : 0)).filter((i) => i > 0);
      return at.length ? Math.max(...at) - Math.min(...at) : 0;
    },
  ],
  // The least common denominator (Grade 4 counts by the bigger one until the other divides it).
  [
    new RegExp(`common denominator of (${NUM}) and (${NUM})`),
    (b, d) => {
      if (!(b >= 1 && d >= 1 && Number.isInteger(b) && Number.isInteger(d))) return b * d;
      let m = Math.max(b, d);
      while (m % b !== 0 || m % d !== 0) m += Math.max(b, d);
      return m;
    },
  ],
  [new RegExp(`left over when (${NUM}) is shared by (${NUM})`), (n, d) => n % d],
  // The right side of "743 ÷ 6 = 123 remainder 5" reads as the quotient (the module's own
  // check already balanced it).
  [new RegExp(`(${NUM}) remainder (${NUM})`), (q) => q],
  [new RegExp(`groups of (${NUM}) in (${NUM})`), (r, c) => c / r],
  [new RegExp(`(${NUM}) shared (?:by|into) (${NUM}) (?:clips?|rows?|groups?)`), (a, b) => a / b],
  [new RegExp(`(${NUM}) groups? of (${NUM})`), (a, b) => a * b],
  [new RegExp(`half of (${NUM})`), (a) => a / 2],
  [new RegExp(`a third of (${NUM})`), (a) => a / 3],
  [new RegExp(`twelves in (${NUM})`), (a) => a / 12],
  [new RegExp(`(${NUM}) feet of (${NUM}) inches`), (a, b) => a * b],
  [new RegExp(`(${NUM}) meters of (${NUM}) centimeters`), (a, b) => a * b],
  [new RegExp(`trapezoids in (${NUM})`), (a) => a / 3],
  [new RegExp(`rhombuses in (${NUM})`), (a) => a / 2],
  [new RegExp(`(${NUM}) trapezoids`), (a) => 3 * a],
  [new RegExp(`(${NUM}) rhombuses`), (a) => 2 * a],
  [new RegExp(`(${NUM}) triangles`), (a) => a],
  // "the ten thousands part of 347,812" (expanded form), before the shorter names.
  [
    new RegExp(`(?:the )?hundred thousands part of (${NUM})`),
    (a) => 100000 * (Math.floor(a / 100000) % 10),
  ],
  [
    new RegExp(`(?:the )?ten thousands part of (${NUM})`),
    (a) => 10000 * (Math.floor(a / 10000) % 10),
  ],
  [new RegExp(`(?:the )?thousands part of (${NUM})`), (a) => 1000 * (Math.floor(a / 1000) % 10)],
  [new RegExp(`(?:the )?ones part of (${NUM})`), (a) => a % 10],
  [new RegExp(`(?:the )?hundreds part of (${NUM})`), (a) => 100 * (Math.floor(a / 100) % 10)],
  [new RegExp(`(?:the )?tens part of (${NUM})`), (a) => 10 * (Math.floor(a / 10) % 10)],
  [new RegExp(`row of (${NUM})`), (a) => Math.ceil(a / 10)],
  [new RegExp(`half hours in (${NUM})`), (a) => a / 30],
  [new RegExp(`(${NUM}) half hours?`), (a) => 30 * a],
  [new RegExp(`(${NUM}) cuts in half`), (a) => 2 ** a],
  [new RegExp(`cuts to make (${NUM})(?: parts)?`), (a) => Math.log2(a)],
  [new RegExp(`fives in (${NUM})`), (a) => a / 5],
  [new RegExp(`(${NUM}) fives?`), (a) => 5 * a],
  [new RegExp(`whole hundreds in (${NUM})`), (a) => Math.floor(a / 100)],
  [new RegExp(`hundreds in (${NUM})`), (a) => a / 100],
  [new RegExp(`hundreds digit of (${NUM})`), (a) => Math.floor(a / 100) % 10],
  [new RegExp(`tens digit of (${NUM})`), (a) => Math.floor(a / 10) % 10],
  [new RegExp(`ones digit of (${NUM})`), (a) => a % 10],
  [new RegExp(`full tens in (${NUM})`), (a) => Math.floor(a / 10)],
  // A signed change (6.NS.5): a fall from 8 °C to −2 °C is −10.
  [/[Cc]hange from (-?\d+(?:\.\d+)?) to (-?\d+(?:\.\d+)?)/, (a, b) => b - a],
  // Grade 6 signed numbers (6.NS.8): the distance along a line or between two points.
  [
    /[Ff]rom (-?\d+(?:\.\d+)?) (?:up |across |down )?to (-?\d+(?:\.\d+)?)/,
    (a, b) => Math.abs(b - a),
  ],
  [
    /[Dd]istance from \((-?\d+(?:\.\d+)?), (-?\d+(?:\.\d+)?)\) to \((-?\d+(?:\.\d+)?), (-?\d+(?:\.\d+)?)\)/,
    (a, b, c, d) => Math.abs(c - a) + Math.abs(d - b),
  ],
  [
    /[Qq]uadrant of \((-?\d+(?:\.\d+)?), (-?\d+(?:\.\d+)?)\)/,
    (x, y) => (x === 0 || y === 0 ? 0 : x > 0 ? (y > 0 ? 1 : 4) : y > 0 ? 2 : 3),
  ],
  // Grade 6 statistics (6.SP.5): the median, range and mean absolute deviation of a list.
  [
    new RegExp(`median of ((?:${NUM}, )+${NUM})`),
    (...xs) => {
      const s = xs.filter((x) => !Number.isNaN(x)).sort((a, b) => a - b);
      const n = s.length;
      return n % 2 ? s[(n - 1) / 2]! : (s[n / 2 - 1]! + s[n / 2]!) / 2;
    },
  ],
  // Box plots from a list: the least and the greatest value.
  [
    new RegExp(`least of ((?:${NUM}, )+${NUM})`),
    (...xs) => Math.min(...xs.filter((x) => !Number.isNaN(x))),
  ],
  [
    new RegExp(`greatest of ((?:${NUM}, )+${NUM})`),
    (...xs) => Math.max(...xs.filter((x) => !Number.isNaN(x))),
  ],
  // Grades 9–12 dot plots: the tallest stack, the most times any one value appears.
  [
    new RegExp(`most dots at one value of ((?:${NUM}, )+${NUM})`),
    (...xs) => {
      const counts = new Map<number, number>();
      for (const x of xs.filter((y) => !Number.isNaN(y))) counts.set(x, (counts.get(x) ?? 0) + 1);
      return Math.max(...counts.values());
    },
  ],
  // Grades 9–12 box plots: a quartile is the median of the half below (or above) the median.
  [new RegExp(`first quartile of ((?:${NUM}, )+${NUM})`), (...xs) => quartile(xs, false)],
  [new RegExp(`third quartile of ((?:${NUM}, )+${NUM})`), (...xs) => quartile(xs, true)],
  [
    new RegExp(`range of ((?:${NUM}, )+${NUM})`),
    (...xs) =>
      Math.max(...xs.filter((x) => !Number.isNaN(x))) -
      Math.min(...xs.filter((x) => !Number.isNaN(x))),
  ],
  [
    new RegExp(`mean distance from (${NUM}) of ((?:${NUM}, )+${NUM})`),
    (m, ...xs) => {
      const ys = xs.filter((x) => !Number.isNaN(x));
      return ys.reduce((t, x) => t + Math.abs(x - m), 0) / ys.length;
    },
  ],
  // Grade 6 factors and multiples (6.NS.4).
  [
    new RegExp(`(?:greatest common factor|shared prime factors) of (${NUM}) and (${NUM})`),
    (a, b) => gcd(a, b),
  ],
  [
    new RegExp(`least common multiple of (${NUM}) and (${NUM})`),
    (a, b) => {
      const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
      return (a * b) / gcd(a, b);
    },
  ],
  // Grade 5 fractions: the least common denominator.
  [
    new RegExp(`smallest common multiple of (${NUM}) and (${NUM})`),
    (a, b) => {
      const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
      return (a * b) / gcd(a, b);
    },
  ],
  // Grade 5 decimals: "4 tenths × 3 tenths = 12 hundredths".
  [new RegExp(`(${NUM}) tenths × (${NUM}) tenths`), (a, b) => (a * b) / 100],
  [new RegExp(`(${NUM}) hundredths`), (a) => a / 100],
  // Powers of ten (Grade 5): "zeros in 1000" is the exponent.
  [new RegExp(`zeros in (${NUM})`), (a) => Math.round(Math.log10(a))],
  // A square's side from its area (Grade 4, no √ yet): "the number that times itself makes 81".
  [new RegExp(`(?:the )?number that times itself makes (${NUM})`), (a) => Math.sqrt(a)],
  // Roots (Grade 8): the whole numbers on either side of a square root.
  [
    new RegExp(`whole number at or below the square root of (${NUM})`),
    (a) => Math.floor(Math.sqrt(a) + 1e-9),
  ],
  [
    new RegExp(`whole number at or above the square root of (${NUM})`),
    (a) => Math.ceil(Math.sqrt(a) - 1e-9),
  ],
  // Scientific notation (Grade 8): the exponent of the power of ten at or below a number.
  [
    new RegExp(`exponent of the power of ten at or below (${NUM})`),
    (a) => Math.floor(Math.log10(a) + 1e-9),
  ],
  [new RegExp(`ones left in (${NUM})`), (a) => a % 10],
  [new RegExp(`tens in (${NUM})`), (a) => a / 10],
  [new RegExp(`pairs in (${NUM})`), (a) => Math.floor(a / 2)],
  [new RegExp(`left over from (${NUM})`), (a) => a % 2],
  [new RegExp(`(${NUM}) clips? of (${NUM}) cubes`), (a, b) => a * b],
  [new RegExp(`(${NUM}) skips of (${NUM})`), (a, b) => a * b],
  [new RegExp(`(${NUM}) rows? of (${NUM})`), (a, b) => a * b],
  [new RegExp(`(${NUM}) hundreds?`), (a) => 100 * a],
  [new RegExp(`(${NUM}) tens?`), (a) => 10 * a],
  // (not “wholes in 11 parts of 7”, which is a phrase of its own)
  [
    new RegExp(`(?<!wholes in |[\\d.])(${NUM}) (?:ones?|corners?|sides?|cubes?|parts?|angles?)`),
    (a) => a,
  ],
  // Bills (Grade 2 money): "3 $10 bills" and "$10 bills (3)" are $30; "$10 bills in (30)" is 3.
  [new RegExp(`(${NUM}) \\$(\\d+) bills?`), (a, b) => a * b],
  [new RegExp(`\\$(\\d+) bills? (${NUM})`), (b, a) => a * b],
  [new RegExp(`\\$(\\d+) bills in (${NUM})`), (b, n) => n / b],
  // Equal groups in K–2 science words: "3 pushes of 2 spaces", "pushes of 2 spaces in 6",
  // "6 spaces shared by 3 pushes". After every specific phrase above.
  [new RegExp(`[a-z]+ of (${NUM}) [a-z]+ in (${NUM})`), (e, t) => t / e],
  [new RegExp(`(${NUM}) [a-z]+ shared by (${NUM}) [a-z]+`), (t, n) => t / n],
  [new RegExp(`(${NUM}) [a-z]+ of (${NUM}) [a-z]+`), (n, e) => n * e],
  // A count with its word at the end of a line: "6 spaces", "20 carrots".
  [new RegExp(`^(${NUM}) [a-z]+$`), (a) => a],
  // Last, after "3 feet of 12 inches": a length in inches is its number.
  [new RegExp(`(${NUM}) inch(?:es)? and (${NUM}) inch`), (a, b) => a + b],
  [new RegExp(`(${NUM}) inch(?:es)?`), (a) => a],
];

/** Evaluates a rendered expression ("(45 − 5) ÷ 10", "4 tens + 5 ones"); undefined if unknown. */
/**
 * The unit a page's angles are in, for trig in step text: 'degrees' for a page whose angles
 * are measured in degrees (Geometry triangles), 'radians' otherwise (trig graphs, calculus).
 * The sampling test sets it for each page; an argument written with a degree sign (sin(40°))
 * is in degrees either way.
 */
let angleUnit: 'degrees' | 'radians' = 'radians';
export function setAngleUnit(unit: 'degrees' | 'radians') {
  angleUnit = unit;
}
/** The page's angle unit as set (HE-E19: the angle reader sets a clause's own and puts it back). */
export const angleUnitNow = () => angleUnit;

/**
 * Each sum with its limits ("Σ from k = 1 to 8 of (3k − 1)", E5) worked out term by term, as
 * its value in brackets ("(100)"); a sum whose limits are not whole numbers in order, or whose
 * terms can't be read, is left as written (so the line can't be evaluated).
 */
export function expandSums(text: string): string {
  return text.replace(SIGMA, (whole, ...args) => {
    const { si, lo, hi, sb } = args[args.length - 1] as Record<string, string>;
    const [a, b] = [toNum(lo!.replace(/−/g, '-')), toNum(hi!.replace(/−/g, '-'))];
    if (!Number.isInteger(a) || !Number.isInteger(b) || b < a || b - a > 10000) return whole;
    // The index letter alone (not inside a word or a name like k₁); after a number or a
    // bracket it multiplies (3k is 3 × k).
    const index = new RegExp(String.raw`(?<![\p{L}_])${si}(?![\p{L}_₀-₉])`, 'gu');
    let total = 0;
    for (let k = a; k <= b; k++) {
      const term = evaluate(
        sb!.replace(
          index,
          (_m, at: number, all: string) => `${/[\d)]$/.test(all.slice(0, at)) ? ' × ' : ''}(${k})`,
        ),
      );
      if (term === undefined) return whole;
      total += term;
    }
    return `(${total})`;
  });
}

/** Gauss–Legendre nodes and weights on [−1, 1], 5 points. */
const GL5: [number, number][] = [
  [0, 128 / 225],
  [Math.sqrt(5 - 2 * Math.sqrt(10 / 7)) / 3, (322 + 13 * Math.sqrt(70)) / 900],
  [-Math.sqrt(5 - 2 * Math.sqrt(10 / 7)) / 3, (322 + 13 * Math.sqrt(70)) / 900],
  [Math.sqrt(5 + 2 * Math.sqrt(10 / 7)) / 3, (322 - 13 * Math.sqrt(70)) / 900],
  [-Math.sqrt(5 + 2 * Math.sqrt(10 / 7)) / 3, (322 - 13 * Math.sqrt(70)) / 900],
];

/**
 * The names of functions in step text: never a letter standing for a value ("sin" is not
 * s × i × n, "exp" holds no x).
 */
export const FUNCTION_NAMES = String.raw`(?:arc)?(?:sin|cos|tan|sec|csc|cot)h?|ln|log(?:₁₀|₂|_\d+)?|sqrt|abs|exp|min|max|floor|ceil|gcd|mod`;
/**
 * A letter in a form (HE-E6): one letter with its marks and subscript (x, t, x₀, T_s); a run
 * of letters that is no function's name is a product of letters (2xy is 2 × x × y). A letter
 * with a prime after it (y′) is a derivative, never the letter.
 */
const LETTER_OR_NAME = new RegExp(
  String.raw`(${FUNCTION_NAMES})(?=[(⁻|\s₀-₉])|(\p{L}\p{M}*(?:[₀-₉]+|_[\p{L}\d]+)?)(?![′″‴])`,
  'gu',
);
/** The letters standing for values in a form, function names, e and π left out. */
export function lettersIn(form: string): string[] {
  const out = new Set<string>();
  for (const m of form.matchAll(LETTER_OR_NAME)) {
    if (m[2] !== undefined && m[2] !== 'e' && m[2] !== 'π') out.add(m[2]);
  }
  return [...out];
}
/** A form with each named letter replaced by its value in brackets: 3x² at x = 2 is 3(2)². */
export function plugIn(form: string, values: Record<string, number>): string {
  return form.replace(LETTER_OR_NAME, (m, fn: string | undefined, letter: string | undefined) =>
    fn === undefined && letter !== undefined && letter in values ? `(${values[letter]})` : m,
  );
}
/**
 * The products a form writes without a sign, made explicit once its letters are numbers:
 * 3(2)², (x + 1)(x − 1), 50e^(…), 2cos(…), (1 + 3t)e^(−2t). (Not 1e-7, which is one number,
 * nor sin⁻¹(…).)
 */
export const implicitTimes = (s: string) =>
  s
    .replace(/(?<!⁻)([\d)⁰¹²³⁴⁵⁶⁷⁸⁹])\s*\(/g, '$1 × (')
    .replace(
      new RegExp(
        String.raw`([\d)⁰¹²³⁴⁵⁶⁷⁸⁹])(?=(?:${FUNCTION_NAMES})\(|e(?![-+]?\d)|π|√|∛|∜)`,
        'g',
      ),
      '$1 × ',
    );
/** A form's value with its letters put in, or undefined when it can't be read there. */
export function evaluateAt(form: string, values: Record<string, number>): number | undefined {
  const x = evaluate(implicitTimes(plugIn(form, values)));
  return x !== undefined && Number.isFinite(x) ? x : undefined;
}

/**
 * Each antiderivative evaluated at its limits ("[x³ ÷ 3] from 0 to 2", HE-E6), as F(b) − F(a)
 * in brackets. The bracket's one letter is its variable; one with no letter or several, or a
 * limit that can't be read, is left as written.
 */
export const BRACKET_LIMITS = /\[([^[\]]+)\] from ([^\s()]+) to ([^\s(),;]+)/gu;
export function expandBrackets(text: string): string {
  return text.replace(BRACKET_LIMITS, (whole, body: string, lo: string, hi: string) => {
    const letters = lettersIn(body);
    const [a, b] = [evaluate(lo), evaluate(hi)];
    if (letters.length !== 1 || a === undefined || b === undefined) return whole;
    const [fa, fb] = [
      evaluateAt(body, { [letters[0]!]: a }),
      evaluateAt(body, { [letters[0]!]: b }),
    ];
    return fa === undefined || fb === undefined ? whole : `(${fb - fa})`;
  });
}

/**
 * A limit as the steps state it (HE-E6): "lim x → 2 of (x² − 4) ÷ (x − 2)", "lim as h → 0 of
 * …", "lim (x → 0⁺) of …", "lim x → ∞ of …". Its body runs to the end of the side.
 */
export const LIMIT = /lim(?: as)? \(?(\p{L}) ?→ ?(−?∞|-?∞|[^\s()⁺⁻]+)([⁺⁻])?\)?(?: of)? (.+)$/u;
/**
 * The value a limit approaches, found by evaluating near the point: from both sides (or the
 * one written, 0⁺), each extrapolated from h and h/2 (Richardson), and far out for ∞ (10⁵ and
 * 10⁶). Undefined when the sides disagree, the values run off, or the body can't be read.
 */
export function limitOf(body: string, v: string, to: string, side?: '⁺' | '⁻') {
  const f = (x: number) => evaluateAt(body, { [v]: x });
  if (/∞/.test(to)) {
    const s = /[−-]/.test(to) ? -1 : 1;
    const [f1, f2] = [f(s * 1e5), f(s * 1e6)];
    if (f1 === undefined || f2 === undefined) return undefined;
    if (Math.abs(f1 - f2) > 1e-3 * Math.max(1, Math.abs(f2))) return undefined;
    return f2 - (f1 - f2) / 9;
  }
  const a = evaluate(to);
  if (a === undefined || !Number.isFinite(a)) return undefined;
  const scale = Math.max(1, Math.abs(a));
  const sides = side === '⁺' ? [1] : side === '⁻' ? [-1] : [1, -1];
  const ends: number[] = [];
  for (const s of sides) {
    const at = (h: number) => f(a + s * h * scale);
    // Smooth near the point: extrapolated from h and h/2, and h/100 agrees with it.
    const [f1, f2, f3] = [at(1e-3), at(5e-4), at(1e-5)];
    const end = f1 !== undefined && f2 !== undefined ? 2 * f2 - f1 : undefined;
    if (
      end !== undefined &&
      f3 !== undefined &&
      Math.abs(f3 - end) <= 1e-3 * Math.max(1, Math.abs(end))
    ) {
      ends.push(end);
      continue;
    }
    // Slower (√x at 0⁺): values at 10⁻⁴, 10⁻⁶, 10⁻⁸ that close in; values that run off (1 ÷ x²
    // at 0) have no limit.
    const [g4, g6, g8] = [at(1e-4), at(1e-6), at(1e-8)];
    if (g4 === undefined || g6 === undefined || g8 === undefined) return undefined;
    const closing = Math.abs(g6 - g8) < Math.abs(g4 - g6);
    if (!closing || Math.abs(g6 - g8) > 1e-2 * Math.max(1, Math.abs(g8))) return undefined;
    ends.push(g8);
  }
  const L = ends.reduce((t, x) => t + x, 0) / ends.length;
  return ends.every((x) => Math.abs(x - L) <= 1e-3 * Math.max(1, Math.abs(L))) ? L : undefined;
}
export function expandLimits(text: string): string {
  const m = LIMIT.exec(text);
  if (!m) return text;
  const L = limitOf(m[4]!, m[1]!, m[2]!, m[3] as '⁺' | '⁻' | undefined);
  return L === undefined ? text : `${text.slice(0, m.index)}(${L})`;
}

/**
 * Each integral with its limits ("∫ from 0 to 2 of (x² + 1) dx", "∫ from 0 to 0.5 of dX ÷
 * (0.2 × (1 − X))": HE-E6, HE-E8) worked out by quadrature at the page's values (5-point
 * Gauss–Legendre on 32 panels, never at the ends, so a root at 0 is fine), as its value in
 * brackets; one whose limits or body can't be read is left as written.
 */
export function expandIntegrals(text: string): string {
  return text.replace(INTEGRAL, (whole, ...args) => {
    const { lo, hi, ib, dv, dv2, ib2 } = args[args.length - 1] as Record<string, string>;
    // (a limit may be π or a product: ∫ from 0 to π, ∫ from 0 to 2π)
    const [a, b] = [evaluate(lo!), evaluate(hi!)];
    if (a === undefined || b === undefined || !Number.isFinite(a) || !Number.isFinite(b))
      return whole;
    const v = (dv ?? dv2)!.slice(1);
    const body = ib ?? `1 ÷ ${ib2}`;
    const f = (x: number) => evaluateAt(body, { [v]: x });
    const panels = 32;
    const h = (b - a) / panels;
    let total = 0;
    for (let k = 0; k < panels; k++) {
      const mid = a + (k + 0.5) * h;
      for (const [t, w] of GL5) {
        const y = f(mid + (t * h) / 2);
        if (y === undefined || !Number.isFinite(y)) return whole;
        total += (w * h * y) / 2;
      }
    }
    return `(${total})`;
  });
}

export function evaluate(text: string, clampRoots = false): number | undefined {
  if (text.includes('Σ from ')) text = expandSums(text);
  if (text.includes('∫ from ')) text = expandIntegrals(text);
  // A complex value's part or a determinant (HE-E16, E17): Re(…), Im(…), |8 + j6|, det [[…]].
  if (/\b(?:Re|Im|arg)\(|\|[^|]*[ij∠]|\bdet ?\[\[/.test(text)) text = complexPrepass(text);
  // Whole-number forms (HE-E21): 101101₂, 0x2D, 192.168.10.77, AND, lcm(…), round(…).
  if (INTEGER_PREPASS.test(text)) text = integerPrepass(text);
  // HE-E6: an antiderivative at its limits, and a limit worked out near its point.
  if (text.includes('] from ')) text = expandBrackets(text);
  if (text.includes('lim')) text = expandLimits(text);
  // HE-E19: a DMS angle or a bearing is its decimal degrees (4°30′00″ → 4.5°, N 52° E → 52°).
  if (ANGLE_MARKS.test(text)) text = anglePrepass(text);
  // (a line in radians on a page of degrees says so: "−0.9273 rad")
  const degrees =
    text.includes('°') || (angleUnit === 'degrees' && !/(?:\d|\)|π) ?m?rad\b(?!\/)/.test(text));
  let s = text
    // A repeating decimal (0.1666…) is its exact value, 1/6.
    .replace(/\d+\.\d+…/g, (m) => `(${parseNumber(m)})`)
    // A mixed number (2 3/8) is its whole plus its fraction.
    .replace(/(?<![\d./])(\d+) (\d+)\/(\d+)(?![\d.])/g, '($1 + $2/$3)')
    .replace(/−/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/·/g, '*')
    // Grades 9–12: the sine, cosine or tangent of degrees (sin 40°), and e to a power (e^(0.5)).
    .replace(/\b(sin|cos|tan) \(?(-?\d+(?:\.\d+)?)°\)?/g, (_, f: 'sin' | 'cos' | 'tan', d) =>
      String(Math[f]((Number(d) * Math.PI) / 180)),
    )
    .replace(/(?<![\w.])e\^/g, `(${Math.E})^`)
    // HE-E19: an angle unit after a number is no factor (0.7854 rad, π rad, 50 grad), and atan2
    // takes y first: atan2(6, −8) is 143.13° (in the page's unit).
    .replace(/(\d|\)|π) ?(?:m?rad|grad)\b(?!\/)/g, '$1')
    .replace(/\batan2\(/g, 'at2(')
    // Symbols from Grade 6 on: π, ½, squares and cubes, square roots.
    // 36π is 36 × π.
    // (bracketed, so 90 ÷ 9π is 90 ÷ (9 × π), as it is written)
    .replace(/(\d+(?:\.\d+)?)π/g, '($1*π)')
    .replace(/π/g, `(${Math.PI})`)
    .replace(/½/g, '(0.5)')
    // High school trig: inverse trig written sin⁻¹ or arcsin; an argument with a degree sign
    // (sin(40°), Geometry) is in degrees, any other in radians (Algebra 2, Precalculus).
    .replace(/(sin|cos|tan)⁻¹\(/g, 'a$1(')
    .replace(/arc(sin|cos|tan)\(/g, 'a$1(')
    .replace(/(?<![a-z])(sin|cos|tan)\(([^()]*[\d⁰¹²³⁴⁵⁶⁷⁸⁹])°\)/g, '$1d($2)')
    // (a degree mark left after the trig is the number's unit: −36.87° + 180°, HE-E19)
    .replace(/([\d)])°/g, '$1')
    // (never a name's e with a prime or a mark: e′, ē)
    .replace(/(?<![\w.])e(?![\w′\u0300-\u036f])/g, `(${Math.E})`)
    .replace(/⌈([^⌈⌉]+)⌉/g, 'ceil($1)')
    .replace(/⌊([^⌊⌋]+)⌋/g, 'floor($1)')
    // Any exponent written as superscript digits (10³, 10⁴).
    .replace(
      /⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g,
      (m) => `**(${[...m].map((c) => (c === '⁻' ? '-' : '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c))).join('')})`,
    )
    .replace(/\^/g, '**')
    .replace(/∛\(/g, 'cbrt(')
    .replace(/∛(\d+(?:\.\d+)?)/g, 'cbrt($1)')
    // A fourth root (a star's light in the habitable-zone rule): ∜0.25, ∜(L ÷ R²).
    .replace(/∜\(/g, 'qrt(')
    .replace(/∜(\d+(?:\.\d+)?)/g, 'qrt($1)')
    // A root written exactly: 3√2 is 3 × √2, and √3/2 is √3 over 2 (bracketed, so no
    // fraction rule reads it as √(3/2)).
    .replace(/(\d)√/g, '$1*√')
    .replace(/√\(/g, 'sqrt(')
    .replace(/√(\d+(?:\.\d+)?)/g, '(sqrt($1))')
    // College logs (HE-E8): log alone is base 10 (20 log(K/p) dB), log₂ base 2, and a log of
    // one number may go without its bracket (ln 2, log₂ 8, log 1000).
    .replace(/(?<![\w₀-₉_])log\(/g, 'log₁₀(')
    .replace(/(?<![\w₀-₉_])log (?=\d)/g, 'log₁₀ ')
    .replace(/(?<![\w_])(ln|log₂|log₁₀) (\d+(?:\.\d+)?(?:e[-+]?\d+)?)(?![\d.]|\s*\*\*)/g, '$1($2)')
    .replace(/log₂\(/g, 'log2(')
    // Natural logs from the exponential lessons: ln(x) and ln|x|.
    .replace(/ln\|([^|]*)\|/g, 'log(abs($1))')
    .replace(/ln\(/g, 'log(')
    // A common log of any expression: log₁₀(|−9/2|).
    .replace(/log₁₀\(/g, 'log10(')
    // Absolute value bars (Grade 6): |−4| is 4.
    .replace(/\|([^|]+)\|/g, 'abs($1)')
    // A number before a function multiplies it: 20 log₁₀(5), 2 sin(30°) (HE-E8).
    .replace(
      /(\d|\)) (?=(?:log10|log2|log|sqrt|cbrt|abs|sin|cos|tan|sind|cosd|tand|min|max)\()/g,
      '$1 * ',
    );
  // Long repeated sums are shortened: "2 + 2 + … (12 times)" is 2 × 12.
  s = s.replace(/(\d+(?:\.\d+)?) \+ \1 \+ … \((\d+) times\)/g, (_, a, n) => `(${a} * ${n})`);
  for (let guard = 0; guard < 50; guard++) {
    let replaced = false;
    // Unwrap brackets around a single number, "(300)" → "300", so outer brackets can reduce.
    // (not the argument of a function, and not a base about to be raised: (-3)**2)
    // (repeated until nothing changes: "(-(3.5))" unwraps to "(-3.5)", then to "-3.5")
    for (let prev = ''; prev !== s;) {
      prev = s;
      s = s
        .replace(
          /(?<!sqrt|cbrt|qrt|log|log10|log2|abs|sin|cos|tan|sind|cosd|tand|ceil|floor|min|max|at2)\((-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)\)(?!\s*\*\*)/g,
          ' $1 ',
        )
        .replace(/\s+/g, ' ')
        // "(- 3.5 )" after unwrapping a negative mixed number is "(-3.5)".
        .replace(/\(\s*-\s+(?=\d)/g, '(-')
        .replace(/(\d)\s+\)/g, '$1)')
        // "((3))" unwraps to "( 3)": close the gap so it unwraps again.
        .replace(/\(\s+(?=-?\d)/g, '(')
        .trim();
    }
    // Work out bracketed arithmetic first, so phrases see one number: "tens in (45 - 5)".
    // (an operator after a digit, so a lone negative like "(-5)" is left alone)
    const inner = /\(([^()]*\d\s*[-+*/]\s*[^()]*)\)/.exec(s);
    if (inner && /^[-\d\s.+*/e]+$/.test(inner[1]!)) {
      try {
        const x = new Function(`return (${inner[1]});`)() as number;
        s = s.slice(0, inner.index) + `(${x})` + s.slice(inner.index + inner[0].length);
        continue;
      } catch {
        // leave it for the final evaluation
      }
    }
    // "3 quarters" → 75 first; "quarters in (75)" only once the bracket is one number.
    const coins =
      /\(?(-?[\d.]+)\)? (five-dollar bills?|dollars?|quarters?|dimes?|nickels?|penny|pennies)/.exec(
        s,
      );
    const coinsIn =
      /(five-dollar bills|dollars|quarters|dimes|nickels) in (?:\((-?[\d.]+)\)|(-?[\d.]+)(?![\d.]))/.exec(
        s,
      );
    if (coins || coinsIn) {
      const m = (coins ?? coinsIn)!;
      const x = coins
        ? Number(coins[1]) * (COIN[coins[2]!] ?? 1)
        : Number(coinsIn![2] ?? coinsIn![3]) / COIN[coinsIn![1]!]!;
      s = s.slice(0, m.index) + `(${x})` + s.slice(m.index + m[0].length);
      continue;
    }
    // Amounts with a leading number ("3 tens") before phrases that read a number ("tens in").
    const ordered = [
      ...PHRASES.filter(([re]) => re.source.startsWith('(')),
      ...PHRASES.filter(([re]) => !re.source.startsWith('(')),
    ];
    for (const [re, fn] of ordered) {
      const m = re.exec(s);
      if (m) {
        // A captured list ("3, 5, 7") passes each of its numbers.
        const x = fn(
          ...m.slice(1).flatMap((g) => (g === undefined ? [NaN] : g.split(', ').map(toNum))),
        );
        s = s.slice(0, m.index) + `(${x})` + s.slice(m.index + m[0].length);
        replaced = true;
        break;
      }
    }
    if (!replaced) break;
  }
  // A minus sign before a power, "−(0.04)^(1 ÷ 2)", is the negative of the power (JavaScript
  // won't parse "-(a) ** b" as written).
  s = s.replace(/(^|[(*/+\-]\s*)-\s*(?=\(|\d)(?=(?:\([^()]*\)|[\d.e]+)\s*\*\*)/g, '$1-1 * ');
  const bare = s
    .replace(
      /(?:sqrt|cbrt|qrt|log10|log2|log|abs|a?sin|a?cos|a?tan|sind|cosd|tand|ceil|floor|min|max|at2)\(/g,
      '(',
    )
    .replace(/\*\*/g, '*');
  // (a comma only between the values of min( or max(: an ordered pair is not a number)
  const listCommas = [...s.matchAll(/(?:min|max|at2)\(([^()]*)\)/g)].reduce(
    (n, m) => n + (m[1]!.match(/,/g)?.length ?? 0),
    0,
  );
  const commas = bare.match(/,/g)?.length ?? 0;
  if (commas !== listCommas || !/^[\d\s.+\-*/()e,]+$/.test(bare)) return undefined;
  try {
    const x = new Function(
      'clampRoots',
      'degrees',
      `const { log, log10, log2, abs, cbrt, ceil, floor, min, max } = Math; const sqrt = (v) => Math.sqrt(clampRoots ? Math.max(0, v) : v); const qrt = (v) => sqrt(v) ** 0.5; ` +
        `const D = Math.PI / 180; const sin = degrees ? (d) => Math.sin(d * D) : Math.sin, cos = degrees ? (d) => Math.cos(d * D) : Math.cos, tan = degrees ? (d) => Math.tan(d * D) : Math.tan; ` +
        `const sind = (d) => Math.sin(d * D), cosd = (d) => Math.cos(d * D), tand = (d) => Math.tan(d * D); ` +
        `const one = (x) => (clampRoots ? Math.max(-1, Math.min(1, x)) : x); const U = degrees ? D : 1; ` +
        `const asin = (x) => Math.asin(one(x)) / U, acos = (x) => Math.acos(one(x)) / U, atan = (x) => Math.atan(x) / U, at2 = (y, x) => Math.atan2(y, x) / U; return (${s});`,
    )(clampRoots, degrees) as unknown;
    return typeof x === 'number' ? x : undefined;
  } catch {
    return undefined;
  }
}

/**
 * The range an expression can take when each number in it is off by half a unit of its last
 * shown decimal: the numbers in a step line are display-rounded, so a subtraction of
 * near-equal squares (√(75.0608² − 75.0607²)) can't be recomputed exactly from them. A root
 * of "about zero" counts as 0.
 */
export function roundingRange(text: string): [number, number] | undefined {
  const nums = [...text.matchAll(/\d+(?:\.\d+)?/g)];
  if (nums.length === 0 || nums.length > 6) return undefined;
  let lo = Infinity;
  let hi = -Infinity;
  for (let mask = 0; mask < 1 << nums.length; mask++) {
    let at = 0;
    let out = '';
    nums.forEach((m, i) => {
      const decimals = m[0].split('.')[1]?.length ?? 0;
      const nudged = Number(m[0]) + ((mask >> i) & 1 ? 0.5 : -0.5) * 10 ** -decimals;
      out += text.slice(at, m.index) + String(Math.max(0, nudged));
      at = m.index! + m[0].length;
    });
    const x = evaluate(out + text.slice(at), true);
    if (x !== undefined && Number.isFinite(x)) [lo, hi] = [Math.min(lo, x), Math.max(hi, x)];
  }
  return lo <= hi ? [lo, hi] : undefined;
}

/** Whether `value` is what `text` could mean once display rounding is allowed for. */
export function withinRounding(value: number, text: string): boolean {
  const texts = text.includes('±') ? [text.replace(/±/g, '+'), text.replace(/±/g, '-')] : [text];
  return texts.some((t) => {
    const r = roundingRange(t);
    return r !== undefined && value >= r[0] - 1e-9 && value <= r[1] + 1e-9;
  });
}

/** Every value a rendered expression can mean: "±√(…)" is two, everything else one or none. */
export function evaluateAll(text: string): number[] {
  const texts = text.includes('±') ? [text.replace(/±/g, '+'), text.replace(/±/g, '-')] : [text];
  return texts.map((t) => evaluate(t)).filter((x): x is number => x !== undefined);
}

/** Display rounding: 4 decimals or 4 significant figures in scientific notation. */
/**
 * Equal up to display rounding. Shown numbers keep 4 decimals, so a rounded factor times a
 * large number (−2.4644 × 120) can be off by up to about 5e-5 × that number: `text` (the line
 * the numbers came from) widens the tolerance by its largest number.
 */
export const shownClose = (a: number, b: number, text = '') => {
  // Tiny values (below 10⁻⁴, shown in scientific notation down to 10⁻³⁵: HE-E10) compare relative to
  // their size, to half a percent: an absolute floor would let any two of them pass.
  const scale = Math.max(Math.abs(a), Math.abs(b));
  if (a !== 0 && b !== 0 && a > 0 === b > 0 && scale < 1e-4) return Math.abs(a - b) <= 5e-3 * scale;
  const largest = Math.max(0, ...(text.match(/\d+(\.\d+)?/g) ?? []).map(Number));
  return Math.abs(a - b) <= 2e-3 * Math.max(Math.abs(a), Math.abs(b)) + 1e-3 + 1e-4 * largest;
};

export const PLURAL =
  /(?<![\d.,$/])\b(?:1 (?:tens|ones|hundreds|groups|bills|feet|inches|cubes|rows|jumps|triangles|clips)\b|(?:0|[2-9]|\d\d+) (?:ten|one|hundred|group|bill|foot|inch|row|jump|clip)\b(?![-\w]))/;
/** The walkthrough with thousands separators removed from every line, for evaluating. */
export function plainWalkthrough(w: Walkthrough): Walkthrough {
  // Numbers show a true minus (−4); the arithmetic checks read -4.
  const p = (x: string) => plainDigits(x).replace(/−(?=\d)/g, '-');
  return {
    ...w,
    steps: w.steps.map((s) => ({
      ...s,
      sentence: p(s.sentence),
      result: p(s.result),
      answer: p(s.answer),
      lines: s.lines.map(p),
      ...(s.substituted ? { substituted: p(s.substituted) } : {}),
      ...(s.work ? { work: s.work.map(p) } : {}),
      ...(s.written ? { written: { ...s.written, says: p(s.written.says) } } : {}),
    })),
    check: w.check.map((k) => ({ ...k, formula: p(k.formula) })),
    convertIn: w.convertIn.map(p),
    convertOut: w.convertOut.map(p),
  };
}

export const BAD_TEXT = /NaN|undefined|Infinity|null|(^|[^\w.])[-−]0(?![\d.])/;

/** The greatest common factor of two whole numbers (gcd(0, n) is n). */
function gcd(a: number, b: number): number {
  let [x, y] = [Math.abs(Math.round(a)), Math.abs(Math.round(b))];
  while (y) [x, y] = [y, x % y];
  return x;
}
