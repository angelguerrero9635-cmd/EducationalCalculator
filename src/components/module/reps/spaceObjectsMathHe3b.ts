/**
 * HC47 (college round 3, group B): what the `vectorDiagram` space objects and the harness both
 * work out — a plane through a point square to n with a point dropped to it, a line's point at t
 * and where it meets a plane, the helix, the flux out of a sphere and the circulation round a
 * circle. Pure.
 */
import { add3, dot3, len3, scale3, sub3, type V3 } from './vectorSpace';

/** The plane n · r = d through P₀; Q's signed offset, its distance and its foot F. */
export function planeDrop(n: V3, p0: V3, q?: V3) {
  const d = dot3(n, p0);
  const nn = dot3(n, n);
  if (!q || !(nn > 0)) return { d };
  const off = dot3(n, q) - d;
  return { d, off, distance: Math.abs(off) / Math.sqrt(nn), foot: sub3(q, scale3(n, off / nn)) };
}

/** The point P₀ + t·v. */
export const lineAt = (p0: V3, v: V3, t: number): V3 => add3(p0, scale3(v, t));

/** Where P₀ + t·v meets n · r = d (undefined when the line runs parallel to the plane). */
export function lineMeets(p0: V3, v: V3, n: V3, d: number): number | undefined {
  const nv = dot3(n, v);
  return Math.abs(nv) < 1e-12 ? undefined : (d - dot3(n, p0)) / nv;
}

/** r(t) = ⟨a cos t, a sin t, ct⟩ and its velocity, speed and curvature. */
export function helixAt(a: number, c: number, t: number) {
  const speed = Math.hypot(a, c);
  return {
    r: [a * Math.cos(t), a * Math.sin(t), c * t] as V3,
    v: [-a * Math.sin(t), a * Math.cos(t), c] as V3,
    speed,
    curvature: speed > 0 ? Math.abs(a) / (a * a + c * c) : 0,
  };
}

/** F = k⟨x, y, z⟩ out of a sphere of radius r: F · n = kr and Φ = 4πkr³. */
export const sphereFlux = (k: number, r: number) => ({ fn: k * r, flux: 4 * Math.PI * k * r ** 3 });

/** F = k⟨−y, x, 0⟩ round a circle of radius r: curl F = ⟨0, 0, 2k⟩ and ∮ F · dr = 2πkr². */
export const circleCirculation = (k: number, r: number) => ({
  curl: 2 * k,
  circulation: 2 * Math.PI * k * r * r,
});

/** Two unit vectors square to n and to each other (spanning the plane). */
export function planeBasis(n: V3): [V3, V3] {
  const m = len3(n) || 1;
  const u = scale3(n, 1 / m);
  const pick: V3 = Math.abs(u[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const c = (a: V3, b: V3): V3 => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const e1 = c(u, pick);
  const e1n = scale3(e1, 1 / (len3(e1) || 1));
  return [e1n, c(u, e1n)];
}

/** "2x − y + 2z = 8": a plane's equation with its coefficients. */
export function planeEquation(n: V3, d: number, say: (x: number) => string): string {
  const terms: string[] = [];
  (['x', 'y', 'z'] as const).forEach((letter, i) => {
    const a = n[i]!;
    if (Math.abs(a) < 1e-12) return;
    const body = Math.abs(Math.abs(a) - 1) < 1e-12 ? letter : `${say(Math.abs(a))}${letter}`;
    terms.push(terms.length ? `${a < 0 ? '−' : '+'} ${body}` : `${a < 0 ? '−' : ''}${body}`);
  });
  return `${terms.join(' ') || '0'} = ${say(d)}`;
}
