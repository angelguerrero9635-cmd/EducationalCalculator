/**
 * Reading the text a student sees: every step and check line is evaluated back to a number
 * through PHRASES (words the walkthrough uses for arithmetic, e.g. "3 tens", "whole groups of
 * 6 in 743"). A new phrase in a module's step text is taught here. Test-only.
 */
import { plainDigits } from '@/engine/format';

import type { Walkthrough } from '../buildSteps';

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

export const NUM = String.raw`\(?-?\d+(?:\.\d+)?(?:e[-+]?\d+)?\)?`;
export const toNum = (s: string) => Number(s.replace(/[()]/g, ''));
export const COIN: Record<string, number> = {
  dollar: 100,
  dollars: 100,
  quarter: 25,
  quarters: 25,
  dime: 10,
  dimes: 10,
  nickel: 5,
  nickels: 5,
};
export const PHRASES: [RegExp, (...xs: number[]) => number][] = [
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
  // Grade 4 (the primes with repeats come before the factor count, which would match first)
  [new RegExp(`prime factors of (${NUM})`), (n) => primeFactorCount(n)],
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
  [new RegExp(`(${NUM})/(${NUM})`), (a, b) => a / b],
  [new RegExp(`(${NUM}) (?:not shaded|shaded|equal parts)`), (a) => a],
  [new RegExp(`difference of (${NUM}) and (${NUM})`), (a, b) => Math.abs(a - b)],
  [new RegExp(`size of (${NUM}) equal jumps from (${NUM}) to (${NUM})`), (k, a, n) => (n - a) / k],
  [new RegExp(`jumps of (${NUM}) from (${NUM}) to (${NUM})`), (s, a, n) => (n - a) / s],
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
  [new RegExp(`whole inches in (${NUM}) marks of (${NUM})`), (a, b) => Math.floor(a * b)],
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
  [new RegExp(`hundreds part of (${NUM})`), (a) => 100 * Math.floor(a / 100)],
  [new RegExp(`tens part of (${NUM})`), (a) => 10 * (Math.floor(a / 10) % 10)],
  [new RegExp(`row of (${NUM})`), (a) => Math.ceil(a / 10)],
  [new RegExp(`half hours in (${NUM})`), (a) => a / 30],
  [new RegExp(`(${NUM}) half hours?`), (a) => 30 * a],
  [new RegExp(`(${NUM}) cuts in half`), (a) => 2 ** a],
  [new RegExp(`cuts to make (${NUM})(?: parts)?`), (a) => Math.log2(a)],
  [new RegExp(`fives in (${NUM})`), (a) => a / 5],
  [new RegExp(`(${NUM}) fives?`), (a) => 5 * a],
  [new RegExp(`hundreds in (${NUM})`), (a) => a / 100],
  [new RegExp(`hundreds digit of (${NUM})`), (a) => Math.floor(a / 100) % 10],
  [new RegExp(`tens digit of (${NUM})`), (a) => Math.floor(a / 10) % 10],
  [new RegExp(`ones digit of (${NUM})`), (a) => a % 10],
  [new RegExp(`full tens in (${NUM})`), (a) => Math.floor(a / 10)],
  // Powers of ten (Grade 5): "zeros in 1000" is the exponent.
  [new RegExp(`zeros in (${NUM})`), (a) => Math.round(Math.log10(a))],
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
export function evaluate(text: string, clampRoots = false): number | undefined {
  let s = text
    .replace(/−/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/·/g, '*')
    // Symbols from Grade 6 on: π, ½, squares and cubes, square roots.
    .replace(/π/g, `(${Math.PI})`)
    .replace(/½/g, '(0.5)')
    .replace(/²/g, '**2')
    .replace(/³/g, '**3')
    .replace(/\^/g, '**')
    .replace(/√\(/g, 'sqrt(')
    .replace(/√(\d+(?:\.\d+)?)/g, 'sqrt($1)')
    // Natural logs from the exponential lessons: ln(x) and ln|x|.
    .replace(/ln\|([^|]*)\|/g, 'log(abs($1))')
    .replace(/ln\(/g, 'log(');
  // Long repeated sums are shortened: "2 + 2 + … (12 times)" is 2 × 12.
  s = s.replace(/(\d+(?:\.\d+)?) \+ \1 \+ … \((\d+) times\)/g, (_, a, n) => `(${a} * ${n})`);
  for (let guard = 0; guard < 50; guard++) {
    let replaced = false;
    // Unwrap brackets around a single number, "(300)" → "300", so outer brackets can reduce.
    // (not the argument of a function, and not a base about to be raised: (-3)**2)
    s = s
      .replace(/(?<!sqrt|log|abs)\((-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)\)(?!\s*\*\*)/g, ' $1 ')
      .replace(/\s+/g, ' ')
      .trim();
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
    const coins = /\(?(-?[\d.]+)\)? (dollars?|quarters?|dimes?|nickels?|penny|pennies)/.exec(s);
    const coinsIn =
      /(dollars|quarters|dimes|nickels) in (?:\((-?[\d.]+)\)|(-?[\d.]+)(?![\d.]))/.exec(s);
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
        const x = fn(...m.slice(1).map(toNum));
        s = s.slice(0, m.index) + `(${x})` + s.slice(m.index + m[0].length);
        replaced = true;
        break;
      }
    }
    if (!replaced) break;
  }
  const bare = s.replace(/(?:sqrt|log|abs)\(/g, '(').replace(/\*\*/g, '*');
  if (!/^[\d\s.+\-*/()e]+$/.test(bare)) return undefined;
  try {
    const x = new Function(
      'clampRoots',
      `const { log, abs } = Math; const sqrt = (v) => Math.sqrt(clampRoots ? Math.max(0, v) : v); return (${s});`,
    )(clampRoots) as unknown;
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
  const largest = Math.max(0, ...(text.match(/\d+(\.\d+)?/g) ?? []).map(Number));
  return Math.abs(a - b) <= 2e-3 * Math.max(Math.abs(a), Math.abs(b)) + 1e-3 + 1e-4 * largest;
};

export const PLURAL =
  /(?<![\d.,$/])\b(?:1 (?:tens|ones|hundreds|groups|bills|feet|inches|cubes|rows|jumps|triangles|clips)\b|(?:0|[2-9]|\d\d+) (?:ten|one|hundred|group|bill|foot|inch|row|jump|clip)\b(?![-\w]))/;
/** The walkthrough with thousands separators removed from every line, for evaluating. */
export function plainWalkthrough(w: Walkthrough): Walkthrough {
  const p = (x: string) => plainDigits(x);
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
