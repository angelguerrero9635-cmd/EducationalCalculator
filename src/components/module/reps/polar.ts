/**
 * Polar curves and parametric paths (pure, so the harness checks use them too): r at θ for each
 * curve shape, the θ range that draws the whole curve, and a path's point at t.
 */
import type { ParametricPath, PolarCurve } from '@/data/modules/typesHsd';

const RAD = Math.PI / 180;
export const G = 9.8;

type Numbers = Record<string, number>;

/** r at θ (degrees). */
export function polarR(c: PolarCurve, v: Numbers, deg: number): number {
  const trig = (fn: 'cos' | 'sin' | undefined, x: number) =>
    fn === 'sin' ? Math.sin(x * RAD) : Math.cos(x * RAD);
  switch (c.shape) {
    case 'circle':
      return c.fn ? v.a! * trig(c.fn, deg) : v.a!;
    case 'rose':
      return v.a! * trig(c.fn, v.n! * deg);
    case 'cardioid':
      return v.a! + (v.b ?? v.a!) * trig(c.fn, deg);
    case 'spiral':
      return v.a! * deg * RAD;
    case 'conic': // H106: r = k ÷ (m − n cos θ), or sin θ
      return v.k! / ((v.m ?? 1) - v.n! * trig(c.fn, deg));
  }
}

/** The θ range (degrees) that draws the whole curve once. */
export function polarSpan(c: PolarCurve, v: Numbers): [number, number] {
  switch (c.shape) {
    case 'circle':
      return c.fn ? [0, 180] : [0, 360];
    case 'rose':
      // An odd n traces its n petals in 180°; an even n needs 360° for its 2n.
      return Number.isInteger(v.n) && v.n! % 2 === 1 ? [0, 180] : [0, 360];
    case 'cardioid':
      return [0, 360];
    case 'spiral':
      return [0, 360 * (c.turns ?? 2)];
    case 'conic':
      return [0, 360];
  }
}

/** Petals of a rose r = a cos(nθ): n when n is odd, 2n when even. */
export const petals = (n: number) => (n % 2 === 1 ? n : 2 * n);

/** The point of a path at t. */
export function pathAt(p: ParametricPath, v: Numbers, t: number): { x: number; y: number } {
  switch (p.family) {
    case 'line':
      return { x: v.x0! + v.a! * t, y: v.y0! + v.b! * t };
    case 'ellipse':
      return { x: v.h! + v.a! * Math.cos(t * RAD), y: v.k! + v.b! * Math.sin(t * RAD) };
    case 'projectile':
      return {
        x: v.v! * Math.cos(v.angle! * RAD) * t,
        y: v.y0! + v.v! * Math.sin(v.angle! * RAD) * t - 0.5 * G * t * t,
      };
  }
}

/** The parameter names each family takes. */
export const PATH_FIELDS: Record<ParametricPath['family'], string[]> = {
  line: ['x0', 'y0', 'a', 'b'],
  ellipse: ['h', 'k', 'a', 'b'],
  projectile: ['v', 'angle', 'y0'],
};

/** The number fields each curve shape takes. */
export const CURVE_FIELDS: Record<PolarCurve['shape'], string[]> = {
  circle: ['a'],
  rose: ['a', 'n'],
  cardioid: ['a', 'b'],
  spiral: ['a'],
  conic: ['k', 'm', 'n'],
};
