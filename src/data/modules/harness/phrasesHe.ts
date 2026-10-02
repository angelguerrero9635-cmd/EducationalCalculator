/**
 * Step-text phrases for the college pages (HE-E8), spread first into PHRASES (`evaluate.ts`).
 * By the time they run, × is *, − is -, ÷ is /, superscripts are powers, |…| is abs(…) and a
 * bracket around one number is gone. Each is taught here as the plans list it; a new college
 * phrase joins this list with a unit test. Test-only.
 */

/** A bare number, as `evaluate` leaves one by the time phrases run. */
const NUM = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?`;

/** n!! = n(n − 2)(n − 4)… down to 1 or 2; 0!! = (−1)!! = 1. */
export const doubleFactorial = (n: number) => {
  let p = 1;
  for (let k = Math.round(n); k > 1; k -= 2) p *= k;
  return p;
};

/** The log-mean of two temperature differences (LMTD); equal ones give themselves. */
export const logMean = (a: number, b: number) =>
  Math.abs(a - b) < 1e-12 * Math.max(Math.abs(a), 1) ? a : (a - b) / Math.log(a / b);

const D = Math.PI / 180;

/**
 * A word that labels a number without changing it: "0.0215 (found numerically)", "41.2 °C
 * (film temperature)", "x = 0.92 (quality)". The page's own sign convention words are below.
 */
const LABEL = [
  'isentropic',
  'film temperature',
  'quality',
  'found numerically',
  'by trial',
  'from the Colebrook equation',
  'Colebrook',
  'governs',
  'case \\d+',
  'branch \\d+',
  'LMTD',
  'Routh',
  'compass rule',
  'integrated',
].join('|');

export const HE_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // A double factorial, written as its product in the steps ((2n − 3)!! = 5!! = 15).
  [new RegExp(`(\\d+) ?!!`), (n) => doubleFactorial(n)],
  // A phasor in polar form (10∠36.87°): its parts, and alone its magnitude (the angle is
  // checked by its own line, "θ = 36.87°"). (Each starts with a bracket, so it is tried
  // before the phrases that read an angle in degrees.)
  [new RegExp(`(?:the )?real part of (${NUM}) ?∠ ?(${NUM})°?`), (m, a) => m * Math.cos(a * D)],
  [new RegExp(`(?:the )?imaginary part of (${NUM}) ?∠ ?(${NUM})°?`), (m, a) => m * Math.sin(a * D)],
  [new RegExp(`(?<!part of )(${NUM}) ?∠ ?(${NUM})°?`), (m) => m],
  // Rectangular form with j (8 + j6): its magnitude |8 + j6| and its angle ∠(8 + j6) in degrees.
  [new RegExp(`abs\\((${NUM}) ?[-+] ?j ?(${NUM})\\)`), (a, b) => Math.hypot(a, b)],
  [new RegExp(`the angle of \\(?(${NUM}) ?\\+ ?j ?(${NUM})\\)?`), (a, b) => Math.atan2(b, a) / D],
  [new RegExp(`the angle of \\(?(${NUM}) ?- ?j ?(${NUM})\\)?`), (a, b) => Math.atan2(-b, a) / D],
  // Decibels: a gain back to its ratio, dBm to milliwatts or watts, and a level in dB is its
  // number (26.0 dB + 34.0 dB = 60 dB).
  [new RegExp(`(${NUM}) dB as a power ratio`), (g) => 10 ** (g / 10)],
  [new RegExp(`(${NUM}) dB as an? (?:voltage|current|amplitude) ratio`), (g) => 10 ** (g / 20)],
  [new RegExp(`(${NUM}) dBm in mW`), (p) => 10 ** (p / 10)],
  [new RegExp(`(${NUM}) dBm in W`), (p) => 10 ** (p / 10) / 1000],
  [new RegExp(`(${NUM}) mW in dBm`), (p) => 10 * Math.log10(p)],
  [new RegExp(`(${NUM}) dB[mi]?(?![A-Za-z])`), (g) => g],
  // Sign conventions a page states (tension +, sagging +, heat in +, work out +): the word
  // gives the sign of the size before it.
  [new RegExp(`(${NUM}) (?:[A-Za-z]+ )?(?:in )?tension`), (x) => Math.abs(x)],
  [new RegExp(`(${NUM}) (?:[A-Za-z]+ )?(?:in )?compression`), (x) => -Math.abs(x)],
  [new RegExp(`(${NUM}) (?:[A-Za-z·*]+ )?sagging`), (x) => Math.abs(x)],
  [new RegExp(`(${NUM}) (?:[A-Za-z·*]+ )?hogging`), (x) => -Math.abs(x)],
  [new RegExp(`(${NUM}) (?:[A-Za-z]+ )?(?:of )?heat (?:in|added)`), (x) => Math.abs(x)],
  [new RegExp(`(${NUM}) (?:[A-Za-z]+ )?(?:of )?heat (?:out|rejected|lost)`), (x) => -Math.abs(x)],
  [new RegExp(`(${NUM}) (?:[A-Za-z]+ )?(?:of )?work (?:out|done by)`), (x) => Math.abs(x)],
  [new RegExp(`(${NUM}) (?:[A-Za-z]+ )?(?:of )?work (?:in|done on)`), (x) => -Math.abs(x)],
  // A number with a label word after it is the number.
  [new RegExp(`(${NUM}),? \\((?:${LABEL})\\)`), (x) => x],
  [new RegExp(`(${NUM}),? (?:${LABEL})$`), (x) => x],
  // The log-mean temperature difference of two end differences.
  [new RegExp(`LMTD\\((${NUM}), (${NUM})\\)`), (a, b) => logMean(a, b)],
  [new RegExp(`the LMTD of (${NUM}) and (${NUM})`), (a, b) => logMean(a, b)],
  // "for a first-order reaction" after a value: the value.
  [new RegExp(`(${NUM}),? for an? (?:first|second|zero)-order [a-z ]+$`), (x) => x],
];
