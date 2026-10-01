/**
 * A conic with an xy term (H106): Ax² + Bxy + Cy² + F = 0 about the origin, the angle θ that
 * turns its axes (tan 2θ = B ÷ (A − C)), the coefficients A′, C′ in the turned axes, and its
 * shape there. Pure, for the picture and the harness.
 */
import { short } from './hsdKit';

const RAD = Math.PI / 180;

export type TurnedShape =
  | { kind: 'ellipse'; a: number; b: number }
  /** Opening along x′ (`along: 'x'`) or y′: a the half-axis it opens along, b the other. */
  | { kind: 'hyperbola'; a: number; b: number; along: 'x' | 'y' }
  /** Two parallel lines x′ = ±a (or y′ = ±a). */
  | { kind: 'lines'; a: number; along: 'x' | 'y' }
  | { kind: 'none' };

export interface TurnedConic {
  theta: number;
  A1: number;
  C1: number;
  D: number;
  shape: TurnedShape;
}

/** θ from 0° to 90°: half of 2θ from 0° to 180°; 45° when A = C; 0° when B = 0. */
export function turnAngle(A: number, B: number, C: number): number {
  if (B === 0) return 0;
  if (A === C) return 45;
  const w = Math.atan(B / (A - C)) / RAD;
  return (w < 0 ? w + 180 : w) / 2;
}

export function turnedConic(A: number, B: number, C: number, F: number): TurnedConic {
  const theta = turnAngle(A, B, C);
  const [c, s] = [Math.cos(theta * RAD), Math.sin(theta * RAD)];
  const A1 = A * c * c + B * s * c + C * s * s;
  const C1 = A * s * s - B * s * c + C * c * c;
  const D = B * B - 4 * A * C;
  const G = -F;
  const tiny = 1e-9 * Math.max(1, Math.abs(A), Math.abs(B), Math.abs(C));
  const [pa, pc] = [Math.abs(A1) < tiny ? 0 : G / A1, Math.abs(C1) < tiny ? 0 : G / C1];
  let shape: TurnedShape = { kind: 'none' };
  if (G !== 0) {
    if (pa > 0 && pc > 0) shape = { kind: 'ellipse', a: Math.sqrt(pa), b: Math.sqrt(pc) };
    else if (pa > 0 && pc < 0)
      shape = { kind: 'hyperbola', a: Math.sqrt(pa), b: Math.sqrt(-pc), along: 'x' };
    else if (pc > 0 && pa < 0)
      shape = { kind: 'hyperbola', a: Math.sqrt(pc), b: Math.sqrt(-pa), along: 'y' };
    else if (pa > 0 && pc === 0) shape = { kind: 'lines', a: Math.sqrt(pa), along: 'x' };
    else if (pc > 0 && pa === 0) shape = { kind: 'lines', a: Math.sqrt(pc), along: 'y' };
  }
  return { theta, A1, C1, D, shape };
}

/** A point (x′, y′) of the turned axes in x, y. */
export function unturn(theta: number, xp: number, yp: number) {
  const [c, s] = [Math.cos(theta * RAD), Math.sin(theta * RAD)];
  return { x: xp * c - yp * s, y: xp * s + yp * c };
}

/** "4x² + 2xy − y² = 1": terms with their signs, a 1 left off, 0 terms dropped. */
export function quadraticText(terms: [number, string][], right: number): string {
  const kept = terms.filter(([k]) => Math.abs(k) > 1e-12);
  if (!kept.length) return `0 = ${short(right)}`;
  const text = kept
    .map(([k, v], i) => {
      const mag = Math.abs(k) === 1 ? '' : short(Math.abs(k));
      const sign = k < 0 ? (i ? ' − ' : '−') : i ? ' + ' : '';
      return `${sign}${mag}${v}`;
    })
    .join('');
  return `${text} = ${short(right)}`;
}
