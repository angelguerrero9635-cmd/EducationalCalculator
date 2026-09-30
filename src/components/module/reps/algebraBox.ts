/**
 * H95: the arithmetic of the area box and the monomial picture (pure, so the harness checks the
 * same numbers the picture draws): every cell of a product of two polynomials, the like terms
 * collected, and a monomial quotient written as factors with the cancelled pairs.
 */
import { formatNumber } from '@/engine/format';

const MINUS = '−';
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (n: number) =>
  `${n < 0 ? '⁻' : ''}${[...String(Math.abs(n))].map((d) => SUP[Number(d)]).join('')}`;
const mag = (x: number) => formatNumber(Math.abs(Number(x.toPrecision(12))));

/** A term c·xᵈ as written: "−3x²", "x³", "8", "0". */
export function termText(c: number, d: number, x = 'x'): string {
  if (c === 0) return '0';
  const power = d === 0 ? '' : d === 1 ? x : `${x}${sup(d)}`;
  const size = power && Math.abs(c) === 1 ? '' : mag(c);
  return `${c < 0 ? MINUS : ''}${size}${power}`;
}

/** A polynomial from its coefficients, highest power first: "x³ − x² − 2x + 8". */
export function polyTextN(cs: number[], x = 'x'): string {
  const deg = cs.length - 1;
  let out = '';
  cs.forEach((c, i) => {
    if (c === 0) return;
    const t = termText(c, deg - i, x);
    out += out ? ` ${c < 0 ? MINUS : '+'} ${t.replace(MINUS, '')}` : t;
  });
  return out || '0';
}

export interface BoxCell {
  row: number;
  col: number;
  coef: number;
  degree: number;
}

/** Every cell of (side) × (top): the row term times the column term. */
export function boxCells(top: number[], side: number[]): BoxCell[] {
  const [dt, ds] = [top.length - 1, side.length - 1];
  return side.flatMap((s, row) =>
    top.map((t, col) => ({
      row,
      col,
      coef: Number((s * t).toPrecision(12)),
      degree: ds - row + (dt - col),
    })),
  );
}

/** The product's coefficients, highest power first: each diagonal of like terms added. */
export function boxProduct(top: number[], side: number[]): number[] {
  const out = Array.from({ length: top.length + side.length - 1 }, () => 0);
  const deg = out.length - 1;
  for (const c of boxCells(top, side)) out[deg - c.degree]! += c.coef;
  return out.map((c) => Number(c.toPrecision(12)));
}

/** a·xᵐ ÷ b·xⁿ as factors: the x's over and under the bar, the pairs that cancel, c·xᵏ. */
export interface MonomialModel {
  /** x's written on top: m of them, and −n more when n is negative (1 ÷ x⁻ⁿ = xⁿ). */
  over: number;
  /** x's under the bar: n of them, and −m more when m is negative. */
  under: number;
  /** Pairs struck, one over and one under. */
  pairs: number;
  c: number;
  k: number;
}

export function monomialModel(a: number, m: number, b: number, n: number): MonomialModel {
  const over = Math.max(m, 0) + Math.max(-n, 0);
  const under = Math.max(n, 0) + Math.max(-m, 0);
  return {
    over,
    under,
    pairs: Math.min(over, under),
    c: b === 0 ? NaN : Number((a / b).toPrecision(12)),
    k: m - n,
  };
}
