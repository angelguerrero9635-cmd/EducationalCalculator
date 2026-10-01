/**
 * Exact values as a class writes them (E22): a square root in simplest form (√31/4, 3√2), the
 * special-angle values (√3/2, (√6 + √2)/4, 2 − √3) and a quadratic's roots from its
 * discriminant ((−3 + √17)/4, 2 ± 3i). A value is written exactly only when it is exact: a
 * square root is recognised only when the value's square is a whole number over a square
 * bottom, to within float error, never a near miss.
 */

const gcd = (a: number, b: number): number => {
  let [x, y] = [Math.abs(Math.round(a)), Math.abs(Math.round(b))];
  while (y) [x, y] = [y, x % y];
  return x;
};

/** √n as k√r with r free of square factors: 124 → [2, 31], 72 → [6, 2], 36 → [6, 1]. */
export function radicalParts(n: number): [number, number] {
  let k = 1;
  let r = Math.round(n);
  for (let f = 2; f * f <= r; f++) {
    while (r % (f * f) === 0) {
      r /= f * f;
      k *= f;
    }
  }
  return [k, r];
}

/** √n in simplest form for a whole n ≥ 0: √36 → "6", √124 → "2√31", √31 → "√31". */
export function radical(n: number): string {
  const [k, r] = radicalParts(n);
  return r === 1 ? String(k) : `${k > 1 ? k : ''}√${r}`;
}

/** k√n ÷ q: k a whole number with its sign, n free of square factors, q at least 1. */
export type Surd = { k: number; n: number; q: number };

/** k√n/q as written: "√3/2", "−3√2", "√31/4", "2√31/3"; n = 1 reads as the fraction k/q. */
export function surdText({ k, n, q }: Surd): string {
  if (k === 0) return '0';
  const a = Math.abs(k);
  const top = n === 1 ? String(a) : `${a === 1 ? '' : a}√${n}`;
  return `${k < 0 ? '−' : ''}${top}${q === 1 ? '' : `/${q}`}`;
}

/** The largest radicand recognised (k²n), so only a short root is ever written. */
const MOST = 1e7;

/**
 * x as k√n/q with n > 1 and q up to `den`, when x² is a whole number over q² to within float
 * error: 0.8660… → √3/2, 4.2426… → 3√2. Undefined for a rational x or any other value.
 */
export function surdOf(x: number, den = 12): Surd | undefined {
  if (!Number.isFinite(x) || x === 0) return undefined;
  for (let q = 1; q <= den; q++) {
    const m = x * x * q * q;
    const M = Math.round(m);
    if (M < 2 || M > MOST || Math.abs(m - M) > 1e-11 * M) continue;
    const [s, r] = radicalParts(M);
    if (r === 1) return undefined; // a rational value: not a root
    const g = gcd(s, q);
    return { k: Math.sign(x) * (s / g), n: r, q: q / g };
  }
  return undefined;
}

/**
 * The special-angle values that are not one root: the sines, cosines and tangents of 15° and
 * 75° and their relatives.
 */
const S6 = Math.sqrt(6);
const S2 = Math.SQRT2;
const S3 = Math.sqrt(3);
const SPECIAL: [number, string][] = [
  [(S6 - S2) / 4, '(√6 − √2)/4'],
  [(S6 + S2) / 4, '(√6 + √2)/4'],
  [(S2 - S6) / 4, '(√2 − √6)/4'],
  [-(S6 + S2) / 4, '−(√6 + √2)/4'],
  [2 - S3, '2 − √3'],
  [2 + S3, '2 + √3'],
  [S3 - 2, '√3 − 2'],
  [-2 - S3, '−2 − √3'],
];

/**
 * x written exactly when it is a root in simplest form (k√n/q, q up to `den`) or a
 * special-angle value ((√6 + √2)/4, 2 − √3); undefined for a whole number, a fraction or a
 * value with no such form (those keep the page's usual display).
 */
export function exactRoot(x: number, den = 12): string | undefined {
  if (!Number.isFinite(x)) return undefined;
  const s = surdOf(x, den);
  if (s) return surdText(s);
  const hit = SPECIAL.find(([y]) => Math.abs(x - y) < 1e-12 * Math.max(1, Math.abs(x)));
  return hit?.[1];
}

/** A fraction p/q in lowest terms as written, or the whole number: "−3/2", "4". */
const ratio = (p: number, q: number) => {
  const g = gcd(p, q) || 1;
  const [a, b] = [Math.round(p / g) * Math.sign(q), Math.abs(Math.round(q / g))];
  return `${a < 0 ? '−' : ''}${Math.abs(a)}${b === 1 ? '' : `/${b}`}`;
};

/**
 * One root of ax² + bx + c = 0 (whole a, b, c; sign +1 or −1) exactly, from the discriminant,
 * over one shared bottom: (−3 + √17)/4, 1/2, 2 − √3, (−2 + √2)/2. Undefined when the roots
 * are not real or the coefficients are not whole.
 */
export function quadraticRoot(a: number, b: number, c: number, sign: 1 | -1): string | undefined {
  if (![a, b, c].every(Number.isInteger) || a === 0) return undefined;
  const D = b * b - 4 * a * c;
  if (D < 0) return undefined;
  const [k, r] = radicalParts(D);
  // A whole square root: the root is a fraction.
  if (r === 1) return ratio(-b + sign * k, 2 * a);
  // (−b ± k√r) ÷ 2a with the common factor of −b, k and 2a taken out, the bottom positive.
  let [p, s, q] = [-b, sign * k, 2 * a];
  const g = gcd(gcd(p, s), q);
  [p, s, q] = [p / g, s / g, q / g];
  if (q < 0) [p, s, q] = [-p, -s, -q];
  const root = `${Math.abs(s) === 1 ? '' : Math.abs(s)}√${r}`;
  const top =
    p === 0 ? `${s < 0 ? '−' : ''}${root}` : `${ratio(p, 1)} ${s < 0 ? '−' : '+'} ${root}`;
  return q === 1 ? top : p === 0 ? `${top}/${q}` : `(${top})/${q}`;
}

/**
 * Both roots of ax² + bx + c = 0 when they are complex, as a conjugate pair written exactly:
 * 2 ± 3i, −1/2 ± (√3/2)i, ±2i, 1/10 ± 4/5 i. Undefined when the roots are real or a, b, c are
 * not whole.
 */
export function complexRoots(a: number, b: number, c: number): string | undefined {
  if (![a, b, c].every(Number.isInteger) || a === 0) return undefined;
  const D = b * b - 4 * a * c;
  if (D >= 0) return undefined;
  const re = b === 0 ? '' : `${ratio(-b, 2 * a)} `;
  // The i part: √(−D) ÷ |2a| in simplest form.
  const [k, r] = radicalParts(-D);
  const den = Math.abs(2 * a);
  const g = gcd(k, den);
  const [kk, q] = [k / g, den / g];
  let im: string;
  if (r === 1) {
    const f = ratio(kk, q);
    im = f === '1' ? 'i' : `${f}${q === 1 ? '' : ' '}i`;
  } else {
    // (i before a root, so √3i never reads as √(3i): i√3, 3i√2, (√3/2)i)
    im = q === 1 ? `${kk === 1 ? '' : kk}i√${r}` : `(${surdText({ k: kk, n: r, q })})i`;
  }
  return `${re}±${b === 0 ? '' : ' '}${im}`;
}
