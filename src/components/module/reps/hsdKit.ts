/**
 * Exact numbers for the Grades 9–12 group D pictures (unit circle, complex plane, polar grid):
 * trig values at the special angles as radicals (√3/2), angles as multiples of π (5π/6), and
 * the solutions of sin θ = c on one turn. Pure functions: the harness checks use them too.
 */
import { formatNumber } from '@/engine/format';

import type { TrigFn } from '@/data/modules/typesHsd';

const RAD = Math.PI / 180;

/** An angle in degrees brought into 0° ≤ θ < 360°. */
export const turn360 = (deg: number) => {
  const r = ((deg % 360) + 360) % 360;
  return Math.abs(r - 360) < 1e-7 ? 0 : r;
};

export const trig = (fn: TrigFn, deg: number) =>
  fn === 'sin' ? Math.sin(deg * RAD) : fn === 'cos' ? Math.cos(deg * RAD) : Math.tan(deg * RAD);

/** Whole within a hair: 30.0000000001 is 30. */
const nearWhole = (x: number, tol = 1e-6) => Math.abs(x - Math.round(x)) < tol;

/** Whether an angle is a multiple of 30° or 45° (the special angles). */
export const isSpecial = (deg: number) => nearWhole(deg / 30) || nearWhole(deg / 45);

/** The exact values a special angle's sine, cosine or tangent take, by size. */
const EXACT: [number, string][] = [
  [0, '0'],
  [0.5, '1/2'],
  [Math.SQRT2 / 2, '√2/2'],
  [Math.sqrt(3) / 2, '√3/2'],
  [1, '1'],
  [Math.sqrt(3) / 3, '√3/3'],
  [Math.sqrt(3), '√3'],
];

/** A number as an exact radical when it is one of the special values: −√3/2. */
export function exactText(x: number): string | undefined {
  const hit = EXACT.find(([v]) => Math.abs(Math.abs(x) - v) < 1e-9);
  if (!hit) return undefined;
  return x < -1e-12 && hit[1] !== '0' ? `−${hit[1]}` : hit[1];
}

/**
 * sin, cos or tan of a special angle, exactly: "√3/2", "−1", "undefined" (tan 90°); undefined
 * when the angle isn't special.
 */
export function exactTrig(fn: TrigFn, deg: number): string | undefined {
  if (!isSpecial(deg)) return undefined;
  const d = Math.round(turn360(deg) * 1e6) / 1e6;
  if (fn === 'tan' && (Math.abs(d - 90) < 1e-6 || Math.abs(d - 270) < 1e-6)) return 'undefined';
  return exactText(trig(fn, d));
}

/** A value as the picture writes it: exact when special, else "≈ 0.766". */
export function trigText(fn: TrigFn, deg: number): string {
  const e = exactTrig(fn, deg);
  if (e) return e;
  return `≈ ${formatNumber(Number(trig(fn, deg).toFixed(4)))}`;
}

/** A fraction n/d in lowest terms with d ≤ `most`, or undefined. */
function fractionOf(x: number, most = 12): [number, number] | undefined {
  for (let d = 1; d <= most; d++) {
    const n = Math.round(x * d);
    if (Math.abs(x * d - n) < 1e-6 * d) return [n, d];
  }
  return undefined;
}

/** k × π written the way a lesson writes it: "π/6", "5π/6", "−2π", "0"; undefined if not. */
export function piText(k: number): string | undefined {
  const f = fractionOf(k);
  if (!f) return undefined;
  const [n, d] = f;
  if (n === 0) return '0';
  const top = `${n < 0 ? '−' : ''}${Math.abs(n) === 1 ? '' : Math.abs(n)}π`;
  return d === 1 ? top : `${top}/${d}`;
}

/** An angle (given in degrees) as degrees ("150°") or radians ("5π/6", else "≈ 2.618"). */
export function angleText(deg: number, show: 'degrees' | 'radians'): string {
  if (show === 'degrees') return `${formatNumber(Number(deg.toFixed(2)))}°`;
  return piText(deg / 180) ?? `≈ ${formatNumber(Number((deg * RAD).toFixed(4)))}`;
}

/** The reference angle of θ (degrees): the acute angle its terminal side makes with the x-axis. */
export function referenceAngle(deg: number): number {
  const t = turn360(deg);
  return t <= 90 ? t : t <= 180 ? 180 - t : t <= 270 ? t - 180 : 360 - t;
}

/** Every angle 0° ≤ θ < 360° with fn(θ) = c, ascending (none when |c| > 1 for sin and cos). */
export function solutionsOf(fn: TrigFn, c: number): number[] {
  const out: number[] = [];
  if (fn === 'tan') {
    const a = turn360(Math.atan(c) / RAD);
    out.push(a, turn360(a + 180));
  } else {
    if (Math.abs(c) > 1 + 1e-12) return [];
    const cc = Math.max(-1, Math.min(1, c));
    const a = fn === 'sin' ? Math.asin(cc) / RAD : Math.acos(cc) / RAD;
    const b = fn === 'sin' ? 180 - a : -a;
    out.push(turn360(a), turn360(b));
  }
  const sorted = out.map((x) => Math.round(x * 1e9) / 1e9).sort((p, q) => p - q);
  return sorted.filter((x, i) => i === 0 || Math.abs(x - sorted[i - 1]!) > 1e-7);
}

/** The inverse function's answer (degrees): arcsin and arctan in [−90°, 90°], arccos in [0°, 180°]. */
export function principalOf(fn: TrigFn, c: number): number | undefined {
  if (fn !== 'tan' && Math.abs(c) > 1 + 1e-12) return undefined;
  const cc = fn === 'tan' ? c : Math.max(-1, Math.min(1, c));
  return (fn === 'sin' ? Math.asin(cc) : fn === 'cos' ? Math.acos(cc) : Math.atan(cc)) / RAD;
}

/** The angle in degrees for a value held in a spec's measure. */
export const toDegrees = (x: number, measure: 'degrees' | 'radians' | 'pi' = 'degrees') =>
  measure === 'degrees' ? x : measure === 'radians' ? x / RAD : x * 180;

/** The value in a spec's measure for an angle in degrees. */
export const fromDegrees = (deg: number, measure: 'degrees' | 'radians' | 'pi' = 'degrees') =>
  measure === 'degrees' ? deg : measure === 'radians' ? deg * RAD : deg / 180;

/** A number to 2 decimals, as a lesson prints it: 3, −1.5, 25.98. */
export const short = (x: number) => formatNumber(Number(x.toFixed(2)) || 0);

/** √n simplified for a whole n: 5, 3√2, √13; undefined when n isn't whole. */
export function sqrtText(n: number): string | undefined {
  const m = Math.round(n);
  if (Math.abs(n - m) > 1e-9 || m < 0) return undefined;
  let outside = 1;
  let inside = m;
  for (let f = 2; f * f <= inside; f++) {
    while (inside % (f * f) === 0) {
      inside /= f * f;
      outside *= f;
    }
  }
  if (inside === 1) return String(outside);
  return `${outside === 1 ? '' : outside}√${inside}`;
}

/** |⟨x, y⟩| exactly when the components are whole (√10 ≈ 3.16), else to 2 decimals. */
export function magnitudeText(x: number, y: number): string {
  const r = Math.hypot(x, y);
  const whole = [x, y].every((v) => Math.abs(v - Math.round(v)) < 1e-9);
  const exact = whole ? sqrtText(x * x + y * y) : undefined;
  if (!exact || !exact.includes('√')) return short(r);
  return `${exact} ≈ ${short(r)}`;
}
