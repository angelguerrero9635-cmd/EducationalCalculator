/**
 * HC65 `solidOfRevolution`: the volume by the page's method, worked out numerically (Simpson),
 * and the slice's radii. The picture and the harness both read these. Pure.
 */

export type SolidMethod = 'disk' | 'washer' | 'shell';

/** Whether the picture draws this axis and method (disks and washers about x, shells about y). */
export const solidDrawn = (axis: 'x' | 'y', method: SolidMethod) =>
  axis === 'x' ? method !== 'shell' : method === 'shell';

/** Simpson's rule for ∫ from a to b of h (n even). */
export function simpson(h: (x: number) => number, a: number, b: number, n = 400): number {
  const w = (b - a) / n;
  let s = h(a) + h(b);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * h(a + i * w);
  return (s * w) / 3;
}

/** The method's integrand: π(f² − g²) for disks and washers, 2πx(f − g) for shells. */
export function solidIntegrand(
  f: (x: number) => number,
  g: ((x: number) => number) | undefined,
  method: SolidMethod,
) {
  const inner = g ?? (() => 0);
  return method === 'shell'
    ? (x: number) => 2 * Math.PI * x * (f(x) - inner(x))
    : (x: number) => Math.PI * (f(x) ** 2 - inner(x) ** 2);
}

/** The volume, or undefined where the integrand isn't a number. */
export function solidVolume(
  f: (x: number) => number,
  g: ((x: number) => number) | undefined,
  method: SolidMethod,
  a: number,
  b: number,
): number | undefined {
  const v = simpson(solidIntegrand(f, g, method), a, b);
  return Number.isFinite(v) ? v : undefined;
}

/** Why the values can't make the solid (the reason the picture fades), or undefined. */
export function solidProblem(
  f: (x: number) => number,
  g: ((x: number) => number) | undefined,
  axis: 'x' | 'y',
  method: SolidMethod,
  a: number,
  b: number,
): string | undefined {
  if (!solidDrawn(axis, method))
    return axis === 'x'
      ? 'Shells about the x-axis need x as a function of y; this picture turns about the y-axis for shells.'
      : 'Disks and washers about the y-axis need x as a function of y; use shells for a turn about the y-axis.';
  if (!(b > a)) return 'The interval runs from the smaller x to the larger.';
  if (method === 'shell' && a < 0) return 'Shells about the y-axis need x ≥ 0 across the interval.';
  for (let i = 0; i <= 60; i++) {
    const x = a + ((b - a) * i) / 60;
    const [fx, gx] = [f(x), g ? g(x) : 0];
    if (!Number.isFinite(fx) || !Number.isFinite(gx)) return `f is not defined at x = ${x}.`;
    if (method === 'washer' && Math.abs(gx) > Math.abs(fx) + 1e-9)
      return 'The inner curve passes the outer one: swap f and g, or split the interval.';
    if (method === 'shell' && fx < gx - 1e-9) return 'The top curve dips under the bottom one.';
  }
  return undefined;
}
