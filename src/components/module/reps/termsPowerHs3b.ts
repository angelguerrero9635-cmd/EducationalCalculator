/**
 * H106: a `termsChart` of powers of n (`type: 'power'`), aₙ = a₁ × nᵖ with p = `step`: the squares
 * 1, 4, 9, … for p = 2. The caption's lines, with the sums of squares and cubes by formula.
 */
import { formatNumber } from '@/engine/format';

const num = (x: number) => formatNumber(Number(x.toPrecision(10)));
const sup = (n: number) =>
  Number.isInteger(n) && n >= 0
    ? [...String(n)].map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join('')
    : `^${num(n)}`;

/** The nth term's name: "3²". */
export const powerName = (i: number, p: number) => `${i}${sup(p)}`;

/** The rule's name: "the squares", "the cubes", "the powers n⁴". */
const ruleName = (p: number) =>
  p === 2 ? 'the squares n²' : p === 3 ? 'the cubes n³' : `n${sup(p)}`;

export function powerLines(
  a: number,
  p: number,
  n: number,
  terms: number[],
  sums: number[],
  withSums: boolean,
): string[] {
  const k = a === 1 ? '' : `${num(a)} × `;
  const shown =
    n <= 6
      ? terms.slice(0, n).map(num).join(', ')
      : `${terms.slice(0, 4).map(num).join(', ')}, …, ${num(terms[n - 1]!)}`;
  const lines = [
    `Terms: ${shown} (${a === 1 ? '' : `${num(a)} times `}${ruleName(p)}).`,
    `a${[...String(n)].map((d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]).join('')} = ${k}${powerName(n, p)} = ${num(terms[n - 1]!)}`,
  ];
  if (withSums) {
    const S = num(sums[n - 1]!);
    const list = n <= 4 ? terms.slice(0, n).map(num).join(' + ') : undefined;
    const formula =
      p === 2
        ? `${k}${n} × ${n + 1} × ${2 * n + 1} ÷ 6`
        : p === 3
          ? `${k}(${n} × ${n + 1} ÷ 2)²`
          : p === 1
            ? `${k}${n} × ${n + 1} ÷ 2`
            : undefined;
    lines.push(
      `The partial sum adds the bars: S = ${[list, formula].filter(Boolean).join(' = ')} = ${S}.`,
    );
  }
  return lines;
}
