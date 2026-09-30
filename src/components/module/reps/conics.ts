/**
 * Conic arithmetic (pure, so the harness checks use it too): the focal distance, whether a
 * point is on the curve, and the equation as a lesson writes it.
 */
import { short } from './hsdKit';

export interface ConicOf {
  conic: 'circle' | 'parabola' | 'ellipse' | 'hyperbola';
  h: number;
  k: number;
  r?: number;
  p?: number;
  a?: number;
  b?: number;
  /** The parabola's axis, or the hyperbola's transverse axis. */
  axis?: 'vertical' | 'horizontal';
}

/** The focal distance c: p, √|a² − b²| or √(a² + b²); 0 for a circle. */
export function focalDistance(q: ConicOf): number {
  switch (q.conic) {
    case 'circle':
      return 0;
    case 'parabola':
      return q.p!;
    case 'ellipse':
      return Math.sqrt(Math.abs(q.a! ** 2 - q.b! ** 2));
    case 'hyperbola':
      return Math.sqrt(q.a! ** 2 + q.b! ** 2);
  }
}

/** The equation's left side minus its right, 0 on the curve (scaled to be about 1 across it). */
export function conicResidual(q: ConicOf, x: number, y: number): number {
  const [X, Y] = [x - q.h, y - q.k];
  switch (q.conic) {
    case 'circle':
      return (X * X + Y * Y) / q.r! ** 2 - 1;
    case 'parabola':
      return q.axis === 'horizontal'
        ? (Y * Y - 4 * q.p! * X) / (4 * q.p! ** 2)
        : (X * X - 4 * q.p! * Y) / (4 * q.p! ** 2);
    case 'ellipse':
      return (X * X) / q.a! ** 2 + (Y * Y) / q.b! ** 2 - 1;
    case 'hyperbola':
      return q.axis === 'vertical'
        ? (Y * Y) / q.a! ** 2 - (X * X) / q.b! ** 2 - 1
        : (X * X) / q.a! ** 2 - (Y * Y) / q.b! ** 2 - 1;
  }
}

/** "(x − 2)²", "x²", "(y + 1)²". */
export const shifted = (v: 'x' | 'y', c: number) =>
  Math.abs(c) < 1e-9 ? `${v}²` : `(${v} ${c > 0 ? '−' : '+'} ${short(Math.abs(c))})²`;

/** The conic's equation in standard form. */
export function conicEquation(q: ConicOf): string {
  const X = shifted('x', q.h);
  const Y = shifted('y', q.k);
  const lin = (v: 'x' | 'y', c: number) =>
    Math.abs(c) < 1e-9 ? v : `(${v} ${c > 0 ? '−' : '+'} ${short(Math.abs(c))})`;
  switch (q.conic) {
    case 'circle':
      return `${X} + ${Y} = ${short(q.r! ** 2)}`;
    case 'parabola':
      return q.axis === 'horizontal'
        ? `${Y} = ${short(4 * q.p!)}${lin('x', q.h)}`
        : `${X} = ${short(4 * q.p!)}${lin('y', q.k)}`;
    case 'ellipse':
      return `${X}/${short(q.a! ** 2)} + ${Y}/${short(q.b! ** 2)} = 1`;
    case 'hyperbola':
      return q.axis === 'vertical'
        ? `${Y}/${short(q.a! ** 2)} − ${X}/${short(q.b! ** 2)} = 1`
        : `${X}/${short(q.a! ** 2)} − ${Y}/${short(q.b! ** 2)} = 1`;
  }
}
