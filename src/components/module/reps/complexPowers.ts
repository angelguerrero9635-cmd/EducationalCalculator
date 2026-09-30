/**
 * H99: the points of a complex power or roots picture (pure, so the harness checks what
 * `ComplexPowers.tsx` draws): z, z², …, zⁿ, and the n nth roots of z.
 */
const RAD = Math.PI / 180;

/** The argument in degrees, 0° up to 360°. */
export const argOf = (a: number, b: number) => {
  const d = Math.atan2(b, a) / RAD;
  return d < 0 ? d + 360 : d;
};

/** z, z², …, zⁿ from z = (a, b), each with its argument k × arg z. */
export function powersOf(a: number, b: number, n: number) {
  const r = Math.hypot(a, b);
  const t = argOf(a, b);
  return Array.from({ length: Math.max(0, n) }, (_, i) => {
    const k = i + 1;
    return { a: r ** k * Math.cos(k * t * RAD), b: r ** k * Math.sin(k * t * RAD), deg: k * t };
  });
}

/** The n nth roots of z, the first at arg z ÷ n. */
export function rootsOf(a: number, b: number, n: number) {
  const r = Math.hypot(a, b);
  const t = argOf(a, b);
  const rho = r ** (1 / n);
  return Array.from({ length: Math.max(0, n) }, (_, k) => {
    const d = (t + 360 * k) / n;
    return { a: rho * Math.cos(d * RAD), b: rho * Math.sin(d * RAD), deg: d };
  });
}
