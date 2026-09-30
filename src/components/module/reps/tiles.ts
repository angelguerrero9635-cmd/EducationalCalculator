/**
 * Algebra tile arithmetic (pure, so the harness checks use it too): the tiles a rectangle of
 * factors holds, a polynomial written the way a lesson writes it, and zero pairs.
 */
import { formatNumber } from '@/engine/format';

export interface Poly {
  x2: number;
  x: number;
  unit: number;
}

/** The tiles filling the rectangle (px + q)(rx + s): pr x², (ps + qr) x, qs units. */
export const rectangleCounts = (p: number, q: number, r: number, s: number): Poly => ({
  x2: p * r,
  x: p * s + q * r,
  unit: q * s,
});

/** Tiles of one size in the rectangle, before zero pairs cancel: x tiles of both signs. */
export const rectangleXTiles = (p: number, q: number, r: number, s: number) => {
  const parts = [p * s, q * r];
  return {
    positive: parts.filter((n) => n > 0).reduce((a, b) => a + b, 0),
    negative: -parts.filter((n) => n < 0).reduce((a, b) => a + b, 0),
  };
};

const num = (x: number) => formatNumber(Math.abs(x)).replace(/^-/, '');

/** "2x² − 3x + 4", "x² − 4", "−x", "0": a polynomial from its coefficients. */
export function polyText(p: Partial<Poly>, x = 'x'): string {
  const terms: [number, string][] = [
    [p.x2 ?? 0, `${x}²`],
    [p.x ?? 0, x],
    [p.unit ?? 0, ''],
  ];
  let out = '';
  for (const [k, v] of terms) {
    if (k === 0) continue;
    const mag = v && Math.abs(k) === 1 ? '' : num(k);
    if (!out) out = `${k < 0 ? '−' : ''}${mag}${v}`;
    else out += ` ${k < 0 ? '−' : '+'} ${mag}${v}`;
  }
  return out || '0';
}

/** "(x + 3)", "(2x − 1)", "x" for px + q. */
export function binomialText(p: number, q: number, x = 'x'): string {
  const t = polyText({ x: p, unit: q }, x);
  return p !== 0 && q !== 0 ? `(${t})` : t;
}

/** Positive and negative tiles of one size: how many cancel as zero pairs. */
export const zeroPairs = (a: number, b: number) =>
  Math.sign(a) === -Math.sign(b) ? Math.min(Math.abs(a), Math.abs(b)) : 0;
