/**
 * Complex values (HE-E17): a + bi on math pages, a + jb on electrical pages (decision 9), and
 * the polar form r∠θ with θ in degrees. Arithmetic, the text a step prints (rectangular or
 * polar, with the page's figures) and the worked lines a class writes: a sum, a product term by
 * term with i² = −1, a quotient by the conjugate, polar products and quotients, and polar ↔
 * rectangular. Every line is true as printed; the harness reads each form back
 * (`harness/algebraLines.ts`). A page keeps a complex value as two numbers in one group
 * (`complexVariables` in `data/modules/written.ts`).
 */
import { formatNumber } from './format';

export interface Complex {
  re: number;
  im: number;
}

/** How a complex value is written: the unit's letter and its place, and each number's display. */
export interface ComplexStyle {
  /** 'i' writes 3 + 4i (math pages); 'j' writes 3 + j4 (electrical pages). */
  unit?: 'i' | 'j';
  /** A part's display (default `formatNumber`: whole, or 4 decimals). */
  show?: (x: number) => string;
  /** Decimals of an angle in degrees (default 2: 36.87°). */
  angleDecimals?: number;
}

export const complex = (re: number, im = 0): Complex => ({ re, im });
export const I_UNIT = complex(0, 1);

export const cAdd = (z: Complex, w: Complex): Complex => complex(z.re + w.re, z.im + w.im);
export const cSub = (z: Complex, w: Complex): Complex => complex(z.re - w.re, z.im - w.im);
export const cMul = (z: Complex, w: Complex): Complex =>
  complex(z.re * w.re - z.im * w.im, z.re * w.im + z.im * w.re);
export const cScale = (z: Complex, k: number): Complex => complex(z.re * k, z.im * k);
export const cConj = (z: Complex): Complex => complex(z.re, -z.im);
export const cAbs = (z: Complex) => Math.hypot(z.re, z.im);
/** The angle in degrees, −180° < θ ≤ 180°. */
export const cArgDeg = (z: Complex) => (Math.atan2(z.im, z.re) * 180) / Math.PI;
/** z ÷ w, or undefined when w is 0. */
export function cDiv(z: Complex, w: Complex): Complex | undefined {
  const n = w.re * w.re + w.im * w.im;
  if (n === 0) return undefined;
  const t = cMul(z, cConj(w));
  return complex(t.re / n, t.im / n);
}
/** r∠θ (θ in degrees) in rectangular form. */
export const fromPolar = (r: number, deg: number): Complex =>
  complex(r * Math.cos((deg * Math.PI) / 180), r * Math.sin((deg * Math.PI) / 180));
/** zⁿ for a whole n (a negative n divides). */
export function cPowInt(z: Complex, n: number): Complex | undefined {
  let out = complex(1);
  for (let k = 0; k < Math.abs(n); k++) out = cMul(out, z);
  return n < 0 ? cDiv(complex(1), out) : out;
}
/** The principal square root: √(−4) = 2i. */
export function cSqrt(z: Complex): Complex {
  const r = cAbs(z);
  const re = Math.sqrt(Math.max(0, (r + z.re) / 2));
  const im = Math.sqrt(Math.max(0, (r - z.re) / 2));
  return complex(re, z.im < 0 ? -im : im);
}

/** A part that is float noise beside the value's size reads 0 (3 + 1.2 × 10⁻¹⁶i is 3). */
export function tidyComplex(z: Complex): Complex {
  const scale = Math.max(Math.abs(z.re), Math.abs(z.im), 1);
  const t = (x: number) => (Math.abs(x) < 1e-10 * scale ? 0 : Number(x.toPrecision(12)));
  return complex(t(z.re), t(z.im));
}

const plain = (s: string) => s.replace(/(\d),(?=\d{3})/g, '$1');
const defaultShow = (x: number) => formatNumber(x);
const sizeOf = (x: number, show: (x: number) => string) => show(Math.abs(x)).replace(/^−/, '');
/** A size beside the unit letter: "2/5 i" (a fraction or mixed number keeps a space). */
const spaced = (size: string) => (/[/ ]/.test(size) ? `${size} ` : size);

/** The imaginary part as written with the unit: "4i", "i", "2/5 i"; "j4", "j1", "j(2/5)". */
function imagTerm(size: string, unit: 'i' | 'j') {
  if (unit === 'i') return size === '1' ? 'i' : `${spaced(size)}i`;
  return /[/ ]/.test(size) ? `j(${size})` : `j${size}`;
}

/**
 * z as written: "3 + 4i", "3 − i", "−4i", "2/5 − 1/5 i" (unit 'i'); "8 + j6", "40 − j30",
 * "−j6", "j1" (unit 'j'). A part that is 0 is left out; 0 itself is "0".
 */
export function complexText(z: Complex, style: ComplexStyle = {}): string {
  const { unit = 'i', show = defaultShow } = style;
  const t = tidyComplex(z);
  const re = show(t.re);
  const imSize = sizeOf(t.im, show);
  if (imSize === '0' || t.im === 0) return re;
  const im = imagTerm(imSize, unit);
  if (t.re === 0 || re === '0') return `${t.im < 0 ? '−' : ''}${im}`;
  return `${re} ${t.im < 0 ? '−' : '+'} ${im}`;
}

/** An angle in degrees as written: 36.87°, −15°, 0°. */
export function angleText(deg: number, decimals = 2): string {
  const x = Number(deg.toFixed(decimals));
  return `${formatNumber(Object.is(x, -0) ? 0 : x)}°`;
}

/** z in polar form: "10∠36.87°" (the angle −180° < θ ≤ 180°). */
export function polarText(z: Complex, style: ComplexStyle = {}): string {
  const show = style.show ?? defaultShow;
  return `${magnitude(cAbs(z), show)}∠${angleText(cArgDeg(z), style.angleDecimals)}`;
}

/** A magnitude before ∠, a fraction bracketed: 10, (2/5). */
const magnitude = (r: number, show: (x: number) => string) => {
  const s = show(r);
  return /[/ ]/.test(s) ? `(${s})` : s;
};

/**
 * z in brackets when it has two parts, a sign or the unit, as it is written after an operator:
 * (3 + j4), (−2), (9i); a plain real number stays bare: 5.
 */
export const bracketed = (z: Complex, style: ComplexStyle = {}) => {
  const s = complexText(z, style);
  return / [+−] |^−|[ij]/.test(s) ? `(${s})` : s;
};

/** z always in brackets, as a factor written beside another: (3 + j4)(5). */
const paren = (z: Complex, style: ComplexStyle) => `(${complexText(z, style)})`;

/** A real number after an operator: 3, (−4). */
const after = (x: number, show: (x: number) => string) => {
  const s = show(x);
  return s.startsWith('−') ? `(${s})` : s;
};

/** One term of an expansion, sign first: " + 6", " − j8", " − 12i²" (`power` 0, 1 or 2). */
function term(
  c: number,
  power: 0 | 1 | 2,
  unit: 'i' | 'j',
  show: (x: number) => string,
  first: boolean,
) {
  const size = sizeOf(c, show);
  const letter = power === 0 ? '' : power === 1 ? unit : `${unit}²`;
  const body =
    power === 0
      ? size
      : unit === 'i'
        ? `${size === '1' ? '' : spaced(size)}${letter}`
        : `${letter}${/[/ ]/.test(size) ? `(${size})` : size}`;
  const neg = c < 0;
  return first ? `${neg ? '−' : ''}${body}` : ` ${neg ? '−' : '+'} ${body}`;
}

/** Terms joined with their signs, zero terms left out. */
function terms(ts: [number, 0 | 1 | 2][], unit: 'i' | 'j', show: (x: number) => string) {
  const kept = ts.filter(([c]) => sizeOf(c, show) !== '0');
  return kept.length ? kept.map(([c, p], k) => term(c, p, unit, show, k === 0)).join('') : '0';
}

/**
 * z ± w worked: "(3 + j4) + (1 − j2) = (3 + 1) + j(4 + (−2)) = 4 + j2"; with i the imaginary
 * part's bracket comes first: "(4 + (−2))i".
 */
export function complexSumLines(z: Complex, w: Complex, op: '+' | '−', style: ComplexStyle = {}) {
  const { unit = 'i', show = defaultShow } = style;
  const s = op === '+' ? cAdd(z, w) : cSub(z, w);
  const re = `(${show(z.re)} ${op} ${after(w.re, show)})`;
  const im = `(${show(z.im)} ${op} ${after(w.im, show)})`;
  const parts = unit === 'i' ? `${re} + ${im}i` : `${re} + j${im}`;
  return [
    `${bracketed(z, style)} ${op} ${bracketed(w, style)} = ${plain(parts)} = ${complexText(s, style)}`,
  ];
}

/**
 * z × w term by term, then i² = −1: "(2 + 3i)(1 − 4i) = 2 − 8i + 3i − 12i²",
 * "= 2 + 12 − 5i", "= 14 − 5i" (with j: "(3 + j4)(1 − j2) = 3 − j6 + j4 − j²8").
 */
export function complexProductLines(z: Complex, w: Complex, style: ComplexStyle = {}) {
  const { unit = 'i', show = defaultShow } = style;
  const p = cMul(z, w);
  const expanded = terms(
    [
      [z.re * w.re, 0],
      [z.re * w.im, 1],
      [z.im * w.re, 1],
      [z.im * w.im, 2],
    ],
    unit,
    show,
  );
  const gathered = terms(
    [
      [z.re * w.re, 0],
      [-z.im * w.im, 0],
      [z.re * w.im + z.im * w.re, 1],
    ],
    unit,
    show,
  );
  const lines = [`${paren(z, style)}${paren(w, style)} = ${expanded}`];
  if (gathered !== expanded) lines.push(`= ${gathered}`);
  const last = complexText(p, style);
  if (last !== gathered) lines.push(`= ${last}`);
  return lines;
}

/**
 * z ÷ w by the conjugate of the bottom: "(30 + j40) ÷ (1 − j2) = (30 + j40)(1 + j2) ÷ ((1 − j2)(1 + j2))",
 * "= (−50 + j100) ÷ (1² + 2²)", "= (−50 + j100) ÷ 5", "= −10 + j20". Empty when w is 0.
 */
export function complexQuotientLines(z: Complex, w: Complex, style: ComplexStyle = {}) {
  const show = style.show ?? defaultShow;
  const q = cDiv(z, w);
  if (!q) return [];
  const top = cMul(z, cConj(w));
  const n = w.re * w.re + w.im * w.im;
  const sq = (x: number) => `${after(x, show)}²`;
  return [
    `${bracketed(z, style)} ÷ ${bracketed(w, style)} = ${paren(z, style)}${paren(cConj(w), style)} ÷ (${paren(w, style)}${paren(cConj(w), style)})`,
    `= ${bracketed(top, style)} ÷ (${sq(w.re)} + ${sq(w.im)})`,
    `= ${bracketed(top, style)} ÷ ${show(n)}`,
    `= ${complexText(q, style)}`,
  ];
}

/** r₁∠θ₁ × r₂∠θ₂: "10∠30° × 2∠45° = (10 × 2)∠(30° + 45°) = 20∠75°". */
export function polarProductLines(z: Complex, w: Complex, style: ComplexStyle = {}) {
  const show = style.show ?? defaultShow;
  const d = style.angleDecimals;
  const [a, b] = [cArgDeg(z), cArgDeg(w)];
  return [
    `${polarText(z, style)} × ${polarText(w, style)} = (${show(cAbs(z))} × ${show(cAbs(w))})∠(${angleText(a, d)} + ${angleSigned(b, d)}) = ${magnitude(cAbs(z) * cAbs(w), show)}∠${angleText(a + b, d)}`,
  ];
}

/** r₁∠θ₁ ÷ r₂∠θ₂: "10∠30° ÷ 2∠45° = (10 ÷ 2)∠(30° − 45°) = 5∠−15°". Empty when w is 0. */
export function polarQuotientLines(z: Complex, w: Complex, style: ComplexStyle = {}) {
  const show = style.show ?? defaultShow;
  const d = style.angleDecimals;
  if (cAbs(w) === 0) return [];
  const [a, b] = [cArgDeg(z), cArgDeg(w)];
  return [
    `${polarText(z, style)} ÷ ${polarText(w, style)} = (${show(cAbs(z))} ÷ ${show(cAbs(w))})∠(${angleText(a, d)} − ${angleSigned(b, d)}) = ${magnitude(cAbs(z) / cAbs(w), show)}∠${angleText(a - b, d)}`,
  ];
}

/** The angle of z as written: ∠(8 + j6) on electrical pages, arg(3 + 4i) on math pages. */
const angleOf = (text: string, style: ComplexStyle) =>
  style.unit === 'j' ? `∠(${text})` : `arg(${text})`;

/** An angle after an operator: 45°, (−45°). */
const angleSigned = (deg: number, d?: number) => {
  const s = angleText(deg, d);
  return s.startsWith('−') ? `(${s})` : s;
};

/**
 * Rectangular to polar: "|8 + j6| = √(8² + 6²) = 10", "θ = ∠(8 + j6) = tan⁻¹(6 ÷ 8) = 36.87°" (+ 180° or
 * − 180° on the left half of the plane), "8 + j6 = 10∠36.87°".
 */
export function toPolarLines(z: Complex, style: ComplexStyle = {}) {
  const show = style.show ?? defaultShow;
  const d = style.angleDecimals;
  const t = tidyComplex(z);
  const text = complexText(t, style);
  const sq = (x: number) => `${after(x, show)}²`;
  const lines = [`|${text}| = √(${sq(t.re)} + ${sq(t.im)}) = ${show(cAbs(t))}`];
  const deg = cArgDeg(t);
  if (t.re !== 0) {
    const base = `tan⁻¹(${show(t.im)} ÷ ${after(t.re, show)})`;
    const turn = t.re > 0 ? '' : t.im >= 0 ? ' + 180°' : ' − 180°';
    lines.push(`θ = ${angleOf(text, style)} = ${base}${turn} = ${angleText(deg, d)}`);
  } else if (t.im !== 0) {
    lines.push(`θ = ${angleOf(text, style)} = ${angleText(deg, d)}`);
  }
  lines.push(`${text} = ${polarText(t, style)}`);
  return lines;
}

/**
 * Polar to rectangular: "10∠36.87° = 10 cos 36.87° + j10 sin 36.87°", "= 8 + j6"; with i,
 * "10(cos 36.87° + i sin 36.87°)".
 */
export function toRectangularLines(r: number, deg: number, style: ComplexStyle = {}) {
  const { unit = 'i', show = defaultShow } = style;
  const d = style.angleDecimals;
  const a0 = angleText(deg, d);
  // A negative angle after cos or sin is bracketed: cos(−131°).
  const a = a0.startsWith('−') ? `(${a0})` : a0;
  const R = show(r);
  const z = fromPolar(r, Number(deg.toFixed(d ?? 2)));
  const [cos, sin] = a0.startsWith('−') ? [`cos${a}`, `sin${a}`] : [`cos ${a}`, `sin ${a}`];
  const trig = unit === 'i' ? `${R}(${cos} + i ${sin})` : `${R} ${cos} + j${R} ${sin}`;
  return [`${magnitude(r, show)}∠${a0} = ${trig}`, `= ${complexText(z, style)}`];
}

/** "The conjugate of 3 + j4 is 3 − j4" as a line: "(3 + j4)* = 3 − j4" (j) or "conj(3 + 4i) = 3 − 4i". */
export function conjugateLine(z: Complex, style: ComplexStyle = {}) {
  const c = complexText(cConj(z), style);
  return style.unit === 'j'
    ? `${paren(z, style)}* = ${c}`
    : `conj(${complexText(z, style)}) = ${c}`;
}

/**
 * A typed complex value: "8 + j6", "8 − 6j", "3 - 4i", "-2.5i", "j6", "5", "10∠36.87°" (degrees),
 * "10∠36.87". Undefined for anything else.
 */
export function parseComplex(text: string): Complex | undefined {
  const s = text
    .replace(/\s+/g, '')
    .replace(/−/g, '-')
    .replace(/(\d),(?=\d{3})/g, '$1');
  const NUM = String.raw`\d+(?:\.\d+)?(?:e[-+]?\d+)?|\.\d+`;
  const polar = new RegExp(`^(${NUM})∠(-?(?:${NUM}))°?$`).exec(s);
  if (polar) return tidyComplex(fromPolar(Number(polar[1]), Number(polar[2])));
  const real = new RegExp(`^[-+]?(?:${NUM})$`).exec(s);
  if (real) return complex(Number(s));
  // An imaginary part with its sign: +4i, -i, +j6, -6j.
  const imag = String.raw`([-+]?)(?:(${NUM})?[ij]|[ij](${NUM})?)`;
  const only = new RegExp(`^${imag}$`).exec(s);
  const both = new RegExp(`^([-+]?(?:${NUM}))${imag}$`).exec(s);
  const read = (sign: string, a?: string, b?: string) =>
    (sign === '-' ? -1 : 1) * Number(a ?? b ?? 1);
  if (only) return complex(0, read(only[1]!, only[2], only[3]));
  if (both && /^[-+]/.test(s.slice(both[1]!.length)))
    return complex(Number(both[1]), read(both[2]!, both[3], both[4]));
  return undefined;
}
